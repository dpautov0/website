/* Unit 7 — Separation of variables in spherical coordinates
   (Lecture 12 pp. 4–6 and Lecture 13; Griffiths 3.3.2, Ex. 3.6–3.9; HW 5: Griffiths 3.22 and 3.24, 5th ed.). */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const DG = Math.PI / 180;
  const Pl = (l, x) => WG.legendreP(l, x);
  // screen point at polar angle th (degrees from +z = up, turning toward +x = right) on a circle of screen radius rr
  const at = (cx, cy, rr, th) => [cx + rr * Math.sin(th * DG), cy - rr * Math.cos(th * DG)];

  // ---------------------------------------------------------------- label helpers
  // Label beside the segment p->q at fraction t, pushed off the line along its normal (side +1 = left of p->q on screen, -1 = right).
  function labLine(f, p, q, tex, side = 1, gap = 5, t = 0.5, cls = 'small') {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    const nx = (dy / L) * side, ny = (-dx / L) * side;
    const sz = PF.texSize(tex), hw = (sz.w - 8) / 2, hh = (sz.h - 6) / 2;
    const D = Math.abs(nx) * hw + Math.abs(ny) * hh + gap;
    const mx = p[0] + dx * t, my = p[1] + dy * t;
    f.label(mx + nx * D, my + ny * D, tex, 'c', cls);
  }
  // Label placed beyond point (x,y) in the direction of polar angle th (degrees, screen), centred on that ray.
  function labRay(f, x, y, th, tex, gap = 6, cls = '') {
    const ux = Math.sin(th * DG), uy = -Math.cos(th * DG);
    const sz = PF.texSize(tex), hw = sz.w / 2, hh = sz.h / 2;
    const D = Math.abs(ux) * hw + Math.abs(uy) * hh + gap;
    f.label(x + ux * D, y + uy * D, tex, 'c', cls);
  }
  // + / - glyphs drawn as strokes (not labels)
  function sgn(f, x, y, s, h = 3.4) {
    f.line(x - h, y, x + h, y, { cls: 'glyph' });
    if (s > 0) f.line(x, y - h, x, y + h, { cls: 'glyph' });
  }
  // short leader from the surface (polar angle th) to a label outside a circle of radius rr centred at (cx,cy)
  function leader(f, cx, cy, rr, th, tex, len = 16, cls = '') {
    const [x0, y0] = at(cx, cy, rr + 2, th), [x1, y1] = at(cx, cy, rr + len, th);
    f.line(x0, y0, x1, y1, { cls: 'dim thin' });
    const right = Math.sin(th * DG) >= 0;
    const x2 = x1 + (right ? 8 : -8);
    f.line(x1, y1, x2, y1, { cls: 'dim thin' });
    f.label(x2 + (right ? 4 : -4), y1, tex, right ? 'l' : 'r', cls);
    // texSize underestimates KaTeX spacing around = and +; widen the view box so the label end is never clipped
    const w = PF.texSize(tex).w, slack = w * 0.15 + 6;
    f.track(x2 + (right ? 4 + w + slack : -4 - w - slack), y1);
  }
  // annulus (shaded region between two circles)
  function annulus(f, cx, cy, r1, r2) {
    const a = f.arcPts(cx, cy, r2, r2, 0, 360), b = f.arcPts(cx, cy, r1, r1, 360, 0);
    a.forEach((p) => f.track(p[0], p[1]));
    const d = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
    f.add(`<path class="shade nodecl" fill-rule="evenodd" d="${d(a)}${d(b)}"/>`);
  }
  // z axis from (cx, y0) up to (cx, y1) with its label
  function zAxis(f, cx, y0, y1, lab = 'z') {
    f.line(cx, y0, cx, y1, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(cx + 6, y1 + 2, lab, 'l', 'small accent');
  }
  // polar angle mark between the +z axis and the ray at polar angle th (deg; negative = left side)
  function thetaMark(f, cx, cy, th, r = 15, tex = '\\theta') {
    const a0 = 90 - th, a1 = 90;
    f.arc(cx, cy, r, Math.min(a0, a1), Math.max(a0, a1), { cls: 'dim' });
    const am = ((a0 + a1) / 2) * DG, sz = PF.texSize(tex);
    const D = r + 3 + Math.max(sz.w - 8, sz.h - 6) / 2 + 2;
    f.label(cx + D * Math.cos(am), cy - D * Math.sin(am), tex, 'c', 'small');
  }

  // ---------------------------------------------------------------- the sphere figure
  // o: rr, lab (surface condition, TeX), labTh (polar deg of the leader), metal, inLab, outLab,
  //    Pin: {f, th} field point inside, Pout: {f, th} outside (th < 0 = left side), R: false, Rth, Rlab, axis: false,
  //    sig: (th) -> sign of a surface charge (glyphs), charge: 'center' | {x,y,lab}, lab2/lab2Th (second leader),
  //    mark: {th, lab} dashed ray to the surface at polar angle th with its angle marked from the +z axis
  function sph(o = {}) {
    const f = PF.fig();
    const rr = o.rr || 62;
    if (o.shadeIn) f.circle(0, 0, rr, { cls: 'shade nodecl' });
    if (o.shadeOut) annulus(f, 0, 0, rr, rr * 1.75);
    if (o.metal) f.hatchBand(f.arcPts(0, 0, rr, rr, 0, 360));
    if (o.arcs) o.arcs.forEach(([a0, a1, cls]) => f.pl(f.arcPts(0, 0, rr, rr, 90 - a0, 90 - a1), { cls }));
    else f.circle(0, 0, rr, { cls: o.thin ? '' : 'thick' });
    if (o.axis !== false) zAxis(f, 0, o.charge === 'center' ? -10 : (o.metal ? -rr - 4 : 0), -rr - 34);
    if (o.xAxis) { f.line(0, 0, o.xAxis, 0, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(o.xAxis + 5, 0, 'x', 'l', 'small accent'); }
    if (o.R !== false) {
      const th = o.Rth ?? 120;
      const e = at(0, 0, rr, th);
      if (o.metal) { f.line(0, 0, e[0], e[1], { cls: 'dim' }); labRay(f, e[0], e[1], th, o.Rlab || 'R', 5, 'small'); }
      else { f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 6 }); labLine(f, [0, 0], e, o.Rlab || 'R', th < 180 ? 1 : -1, 4, 0.55); }
    }
    if (o.sig) {
      for (let th = 12; th < 180; th += 22) {
        const s = o.sig(th);
        if (!s) continue;
        for (const sd of [1, -1]) { const [x, y] = at(0, 0, rr + 9, sd * th); sgn(f, x, y, s); }
      }
    }
    if (o.lab) leader(f, 0, 0, o.sig ? rr + 10 : rr, o.labTh ?? 42, o.lab, o.labLen ?? 16);
    if (o.lab2) leader(f, 0, 0, o.sig ? rr + 10 : rr, o.lab2Th ?? 138, o.lab2, o.labLen ?? 16);
    if (o.Pin) {
      const p = at(0, 0, rr * o.Pin.f, o.Pin.th);
      f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], o.Pin.lab || 'P', o.Pin.at || 'r', 7, 'small');
      if (Math.abs(o.Pin.th) > 2) thetaMark(f, 0, 0, o.Pin.th, 14);
    }
    if (o.Pout) {
      const p = at(0, 0, rr * o.Pout.f, o.Pout.th);
      f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], o.Pout.lab || 'P', o.Pout.at || (o.Pout.th < 0 ? 'l' : 'r'), 7, 'small');
      if (Math.abs(o.Pout.th) > 2 && Math.abs(o.Pout.th) < 178) thetaMark(f, 0, 0, o.Pout.th, 14);
    }
    if (o.charge === 'center') f.charge(0, 0, { q: o.chargeSign || '+', lab: o.chargeLab || 'q', at: 'bl' });
    else if (o.charge) f.charge(o.charge.x, o.charge.y, { q: o.charge.q || '+', lab: o.charge.lab || 'q', at: o.charge.at || 'r' });
    if (o.mark) { const e = at(0, 0, rr, o.mark.th); f.line(0, 0, e[0], e[1], { cls: 'dim dash thin' }); thetaMark(f, 0, 0, o.mark.th, o.mark.r || 18, o.mark.lab || '\\theta'); }
    if (o.inLab) f.label(o.inX ?? -10, o.inY ?? rr * 0.5, o.inLab, 'c', 'small');
    if (o.outLab) f.label(o.outX ?? -rr * 0.95, o.outY ?? rr * 1.05, o.outLab, 'r', 'small');
    if (o.note) f.text(o.noteX ?? 0, o.noteY ?? rr + 22, o.note, 't');
    return f.svg();
  }

  // ---------------------------------------------------------------- other setups
  // two concentric spheres; o: ra, rb (screen radii), labA (inner, leader into the gap), labB (outer, leader), shade
  function shells(o = {}) {
    const f = PF.fig();
    const ra = o.ra || 32, rb = o.rb || 90;
    if (o.shade !== false) annulus(f, 0, 0, ra, rb);
    if (o.metalIn) f.hatchBand(f.arcPts(0, 0, ra, ra, 0, 360));
    f.circle(0, 0, ra, { cls: 'thick' });
    f.circle(0, 0, rb, { cls: 'thick' });
    zAxis(f, 0, o.metalIn ? -ra - 3 : 0, -rb - 30);
    const ea = at(0, 0, ra, 300), eb = at(0, 0, rb, 232);
    if (!o.metalIn) { f.line(0, 0, ea[0], ea[1], { cls: 'dim', arrow: 'end', hs: 5 }); labLine(f, [0, 0], ea, 'a', -1, 3, 0.5); }
    f.line(0, 0, eb[0], eb[1], { cls: 'dim', arrow: 'end', hs: 6 });
    labLine(f, [0, 0], eb, 'b', 1, 4, 0.78);
    if (o.labA) leader(f, 0, 0, ra, 150, o.labA, 10);
    if (o.labB) leader(f, 0, 0, rb, 40, o.labB, 14);
    if (o.Pin) { const p = at(0, 0, o.Pin.r, o.Pin.th); f.dot(p[0], p[1], 2.8); f.tag(p[0], p[1], 'P', 'r', 7, 'small'); }
    return f.svg();
  }

  // hemispheres (or a polar cap); o: cap (polar angle of the cap edge, default 90), top, bot (TeX labels)
  function hemis(o = {}) {
    const cap = o.cap ?? 90, g = 3;
    return sph({
      arcs: [[-cap + g, cap - g, 'thick'], [cap + g, 360 - cap - g, o.botThin ? '' : 'thick']],
      lab: o.top || '+V_0', labTh: o.topTh ?? 34, lab2: o.bot || '-V_0', lab2Th: o.botTh ?? 146, Rth: 300, R: o.R,
      inLab: o.inLab, outLab: o.outLab, Pin: o.Pin, Pout: o.Pout, mark: o.mark,
    });
  }

  // uncharged / charged / grounded metal sphere in a uniform field E0 z-hat (setup only: the far field)
  function fieldSetup(o = {}) {
    const f = PF.fig();
    const rr = 42;
    f.hatchBand(f.arcPts(0, 0, rr, rr, 0, 360));
    f.circle(0, 0, rr, { cls: 'thick' });
    for (const x of [-120, -88, 88, 120]) f.arrow(x, 66, x, -66, { cls: o.dimField ? 'dim' : '', hs: 7 });
    f.label(128, 0, o.Elab || 'E_0\\,\\hat{\\mathbf z}', 'l');
    f.label(-128, 0, o.farLab || '\\text{far away}', 'r', 'small accent');
    zAxis(f, 0, -rr - 4, -rr - 34);
    const e = at(0, 0, rr, 135);
    f.line(0, 0, e[0], e[1], { cls: 'dim' });
    labRay(f, e[0], e[1], 135, 'R', 4, 'small');
    if (o.lab) f.label(0, rr + 30, o.lab, 't', 'small');
    if (o.P) { const p = at(0, 0, rr * o.P.f, o.P.th); f.dot(p[0], p[1], 2.8); f.tag(p[0], p[1], o.P.lab || 'P', o.P.at || 'r', 7, 'small'); }
    return f.svg();
  }

  // field lines of a metal sphere in a uniform field (solution figure), with the induced charges
  function fieldLines(o = {}) {
    const f = PF.fig();
    const S = 40, X = 3.1, Z = 2.9;    // screen px per R; box half-sizes in units of R
    const E = (x, z) => { const r2 = x * x + z * z, r = Math.sqrt(r2), r5 = r2 * r2 * r; return [3 * z * x / r5, 1 - 1 / (r2 * r) + 3 * z * z / r5]; };
    const dir = (x, z) => { const e = E(x, z), m = Math.hypot(e[0], e[1]) || 1; return [e[0] / m, e[1] / m]; };
    const scr = (p) => [p[0] * S, -p[1] * S];
    const trace = (x0) => {
      let x = x0, z = -Z; const pts = [[x, z]]; const h = 0.025;
      for (let i = 0; i < 6000; i++) {
        const k1 = dir(x, z), k2 = dir(x + h / 2 * k1[0], z + h / 2 * k1[1]);
        x += h * k2[0]; z += h * k2[1];
        if (x * x + z * z <= 1) { const r = Math.hypot(x, z); pts.push([x / r, z / r]); return { pts, hit: true }; }
        if (i % 3 === 0) pts.push([x, z]);
        if (z > Z || Math.abs(x) > X) { pts.push([x, z]); return { pts, hit: false }; }
      }
      return { pts, hit: false };
    };
    const headAt = (pts, zc) => {
      for (let i = 1; i < pts.length; i++) if ((pts[i - 1][1] - zc) * (pts[i][1] - zc) <= 0) {
        const a = scr(pts[Math.max(0, i - 2)]), b = scr(pts[i]);
        f.arrow(a[0], a[1], b[0], b[1], { hs: 6 });
        return;
      }
    };
    for (const x0 of [0.28, 0.75, 1.2, 1.55, 1.95, 2.5]) for (const sdx of [1, -1]) {
      const { pts, hit } = trace(sdx * x0);
      f.pl(pts.map(scr), { cls: 'thin' });
      headAt(pts, -2.1);
      if (hit) { const m = pts.map((p) => [p[0], -p[1]]).reverse(); f.pl(m.map(scr), { cls: 'thin' }); headAt(m, 2.1); }
      else headAt(pts, 2.1);
    }
    f.circle(0, 0, S, { cls: 'thick bgfill' });
    for (let th = 15; th < 180; th += 25) {
      if (Math.abs(th - 90) < 8) continue;
      for (const sd of [1, -1]) { const [x, y] = at(0, 0, S - 8, sd * th); sgn(f, x, y, th < 90 ? 1 : -1, 3); }
    }
    return f.svg();
  }

  // field of the shell with sigma = k cos(theta): uniform inside, pure dipole outside (solution figure)
  function dipoleShell() {
    const f = PF.fig();
    const S = 44;
    f.circle(0, 0, S, { cls: 'thick' });
    for (const x of [-24, 0, 24]) f.arrow(x, -S * Math.sqrt(1 - (x / S) ** 2) + 6, x, S * Math.sqrt(1 - (x / S) ** 2) - 6, { hs: 6, cls: 'thin' });
    for (const C of [1.45, 2.1, 3.2]) for (const sd of [1, -1]) {
      const th0 = Math.asin(Math.sqrt(1 / C)) / DG;
      const pts = [];
      for (let th = th0; th <= 180 - th0 + 1e-9; th += 2) { const r = C * Math.sin(th * DG) ** 2; pts.push(at(0, 0, r * S, sd * th)); }
      pts.push(at(0, 0, S, sd * (180 - th0)));
      f.pl(pts, { cls: 'thin' });
      const m = Math.floor(pts.length / 2);
      f.arrow(pts[m - 1][0], pts[m - 1][1], pts[m + 1][0], pts[m + 1][1], { hs: 6 });
    }
    for (let th = 15; th < 180; th += 25) {
      if (Math.abs(th - 90) < 8) continue;
      for (const sd of [1, -1]) { const [x, y] = at(0, 0, S + 8, sd * th); sgn(f, x, y, th < 90 ? 1 : -1, 3); }
    }
    return f.svg();
  }

  // Gaussian pillbox straddling a charged surface (theory figure)
  function pillbox() {
    const f = PF.fig();
    const pts = f.arcPts(0, 420, 400, 400, 72, 108);
    f.pl(pts, { cls: 'thick' });
    f.rect(-26, 4, 52, 32, { cls: 'dash dim' });
    f.arrow(0, 4, 0, -30, { hs: 7 });
    f.arrow(0, 36, 0, 62, { hs: 7, cls: 'dim' });
    f.tag(0, -22, 'E^{\\perp}_{\\text{out}}=-\\dfrac{\\partial V_{\\text{out}}}{\\partial r}', 'r', 8, 'small');
    f.tag(0, 55, 'E^{\\perp}_{\\text{in}}=-\\dfrac{\\partial V_{\\text{in}}}{\\partial r}', 'r', 8, 'small');
    f.label(-112, 30, '\\sigma_0(\\theta)', 'r', 'small');
    f.label(126, 34, 'r=R', 'l', 'small accent');
    f.text(-30, -6, 'pillbox', 'r');
    return f.svg();
  }

  // a charged disk seen edge-on (Prob. 3.24): the disk in the plane theta = pi/2, the sphere r = R dashed
  function diskFig(o = {}) {
    const f = PF.fig();
    const rr = 66;
    f.circle(0, 0, rr, { cls: 'dash dim' });
    f.line(-rr, 0, rr, 0, { cls: 'thick' });
    zAxis(f, 0, rr + 22, -rr - 34);
    f.dim(0, 0, rr, 0, 'R', { off: 14, at: 'b' });
    f.label(-rr - 6, -10, '\\sigma', 'r', 'small');
    if (o.P) {
      const p = at(0, 0, rr * o.P.f, o.P.th);
      f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], 'P', o.P.at || 'r', 7, 'small');
      thetaMark(f, 0, 0, o.P.th, 14);
    }
    if (o.halves) {
      f.label(-rr * 0.55, -rr * 0.42, o.halves[0], 'c', 'small');
      f.label(-rr * 0.55, rr * 0.42, o.halves[1], 'c', 'small');
    }
    return f.svg();
  }

  // a ring of charge (radius a) in the xy plane, seen at a slant
  function ringFig(o = {}) {
    const f = PF.fig();
    const ra = 58;
    f.ellipse(0, 0, ra, 15, { half: 'back', cls: 'thick dash' });
    f.ellipse(0, 0, ra, 15, { half: 'front', cls: 'thick' });
    zAxis(f, 0, 30, -100);
    f.dim(0, 0, ra, 0, 'a', { off: 26, at: 'b' });
    f.label(ra + 6, 8, 'Q', 'l', 'small');
    if (o.P) {
      const p = at(0, 0, o.P.r, o.P.th);
      f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], 'P', 'r', 7, 'small');
      thetaMark(f, 0, 0, o.P.th, 14);
    }
    return f.svg();
  }

  // coordinates and azimuthal symmetry
  function coordsFig() {
    const f = PF.fig();
    zAxis(f, 0, 40, -128);
    f.dot(0, 0, 2.4);
    f.label(-6, 6, 'O', 'tr', 'small accent');
    const p = at(0, 0, 100, 42);
    f.line(0, 0, p[0], p[1], { cls: 'dim' });
    labLine(f, [0, 0], p, 'r', -1, 2, 0.62);
    thetaMark(f, 0, 0, 42, 18);
    const rx = p[0], ry = rx * 0.26;
    f.ellipse(0, p[1], rx, ry, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, p[1], rx, ry, { half: 'front', cls: '' });
    f.dot(p[0], p[1], 3);
    f.tag(p[0], p[1], 'P\\,(r,\\theta)', 'r', 8, 'small');
    f.text(-rx - 10, p[1] + 20, 'same V all around this ring', 'r');
    return f.svg();
  }

  // x = cos(theta) on the sphere
  function xFig() {
    const f = PF.fig();
    const rr = 62;
    f.circle(0, 0, rr, { cls: 'thick' });
    f.line(0, rr + 18, 0, -rr - 30, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(6, -rr - 28, 'z', 'l', 'small accent');
    const p = at(0, 0, rr, 50);
    f.line(0, 0, p[0], p[1], { cls: 'dim' });
    f.dot(p[0], p[1], 2.8);
    thetaMark(f, 0, 0, 50, 15);
    f.line(p[0], p[1], -rr - 12, p[1], { cls: 'dash dim thin' });
    f.label(-rr - 16, p[1], 'x=\\cos\\theta', 'r', 'small');
    f.tag(0, -rr, '\\theta=0,\\ x=1', 'tr', 9, 'small');
    f.tag(rr, 0, '\\theta=\\tfrac{\\pi}{2},\\ x=0', 'r', 7, 'small');
    f.tag(0, rr, '\\theta=\\pi,\\ x=-1', 'br', 9, 'small');
    f.dot(0, -rr, 2.4); f.dot(0, rr, 2.4); f.dot(rr, 0, 2.4);
    return f.svg();
  }

  // area of a latitude band (orthogonality weight)
  function bandFig() {
    const f = PF.fig();
    const rr = 66;
    f.circle(0, 0, rr, { cls: 'thick' });
    zAxis(f, 0, 0, -rr - 30);
    for (const th of [58, 68]) {
      const y = -rr * Math.cos(th * DG), rx = rr * Math.sin(th * DG), ry = rx * 0.24;
      f.ellipse(0, y, rx, ry, { half: 'back', cls: 'dash dim' });
      f.ellipse(0, y, rx, ry, { half: 'front', cls: '' });
    }
    const y = -rr * Math.cos(63 * DG), rx = rr * Math.sin(63 * DG);
    f.line(0, y, -rx, y, { cls: 'dim', arrow: 'end', hs: 5 });
    f.label(-rr - 8, y, 'R\\sin\\theta', 'r', 'small');
    f.label(rr + 8, y, 'R\\,d\\theta', 'l', 'small');
    return f.svg();
  }

  // the Cartesian slot (Unit 6) for the analogy questions
  function slotFig() {
    const f = PF.fig();
    f.line(0, 0, 200, 0, { cls: 'thick' });
    f.line(0, 90, 200, 90, { cls: 'thick' });
    f.line(0, 0, 0, 90, { cls: 'thick' });
    f.label(206, 0, 'V=0', 'l', 'small');
    f.label(206, 90, 'V=0', 'l', 'small');
    f.label(-8, 45, 'V_0(y)', 'r', 'small');
    f.arrow(0, 110, 60, 110, { cls: 'dim', hs: 6 });
    f.label(66, 110, 'x', 'l', 'small accent');
    f.dim(-70, 90, -70, 0, 'a', { at: 'l' });
    return f.svg();
  }

  // sign pattern of P_l(cos theta) on a sphere: nodal latitudes and +/- zones
  function nodal(l) {
    const f = PF.fig();
    const rr = 64;     // large enough that the sign glyph fits in the thin polar caps of P3
    f.circle(0, 0, rr, { cls: 'thick' });
    const zs = { 1: [0], 2: [1 / Math.sqrt(3), -1 / Math.sqrt(3)], 3: [Math.sqrt(0.6), 0, -Math.sqrt(0.6)], 4: [0.8611, 0.34, -0.34, -0.8611] }[l];
    for (const z of zs) { const y = -rr * z, w = rr * Math.sqrt(1 - z * z); f.line(-w, y, w, y, { cls: 'dash dim' }); }
    const edges = [1, ...zs, -1];
    for (let i = 0; i < edges.length - 1; i++) {
      const zm = (edges[i] + edges[i + 1]) / 2;
      sgn(f, 0, -rr * zm, Pl(l, zm) > 0 ? 1 : -1, 2.6);
    }
    return f.svg();
  }

  // inside / outside / shell regions (theory figure)
  function regionsFig() {
    const a = PF.fig(); a.circle(0, 0, 40, { cls: 'shade nodecl' }); a.circle(0, 0, 40, { cls: 'thick' }); a.dot(0, 0, 2.4); a.label(0, 14, 'r\\lt R', 'c', 'small');
    const b = PF.fig(); annulus(b, 0, 0, 30, 58); b.circle(0, 0, 30, { cls: 'thick' }); b.label(0, 0, 'R', 'c', 'small'); b.label(0, -44, 'r\\gt R', 'c', 'small');
    const c = PF.fig(); annulus(c, 0, 0, 22, 50); c.circle(0, 0, 22, { cls: 'thick' }); c.circle(0, 0, 50, { cls: 'thick' }); c.label(0, 56, 'a\\lt r\\lt b', 't', 'small');
    return PF.row([
      { svg: a.svg(), cap: 'inside: keep $A_\\ell r^\\ell$' },
      { svg: b.svg(), cap: 'outside: keep $B_\\ell/r^{\\ell+1}$' },
      { svg: c.svg(), cap: 'between: keep both' },
    ]);
  }

  // ---------------------------------------------------------------- plots
  const plotRadial = () => PF.plot({ w: 320, h: 200, x: [0, 3], y: [0, 3], xl: 'r', yl: 'R(r)', xt: [[1, '1'], [2, '2']], yt: [[1, '1'], [2, '2']],
    curves: [{ f: (r) => r, lab: 'r^{\\ell}\\ (\\ell=1)', labAt: 2.15, dx: 10, dy: 6 }, { f: (r) => 1 / (r * r), cls: 'dash', from: 0.55, lab: 'r^{-(\\ell+1)}=r^{-2}', labAt: 2.0, dx: 4, dy: -30 }] });
  const plotQ0 = () => PF.plot({ w: 320, h: 210, x: [0, Math.PI], y: [-3, 3], zero: true, xl: '\\theta', yl: 'Q(\\theta)',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[1, '1'], [-2, '-2'], [2, '2']],
    curves: [{ f: () => 1, cls: 'dim dash', lab: 'P_0=1', labAt: 0.25, dx: 0, dy: -12 }, { f: (t) => Math.log(Math.tan(t / 2)), from: 0.003, to: Math.PI - 0.003, n: 400, lab: '\\ln\\tan\\tfrac{\\theta}{2}', labAt: 2.2, dx: 8, dy: 40 }] });

  // ---------------------------------------------------------------- shared figure instances (strings)
  const FIG = {};

  // =====================================================================================
  // Lesson 1: separating Laplace's equation in spherical coordinates
  // =====================================================================================
  FIG.coords = coordsFig();
  FIG.axisCharge = sph({ charge: { x: 0, y: -122, lab: 'q', at: 'r' }, lab: 'V=0\\ (\\text{grounded})', R: true });
  FIG.offCharge = sph({ charge: { x: 128, y: 0, lab: 'q', at: 't' }, lab: 'V=0\\ (\\text{grounded})', labTh: 36, xAxis: 160, Rth: 220 });
  FIG.inRegion = sph({ lab: 'V_0(\\theta)', inLab: 'V(r,\\theta)=?' });
  FIG.outRegion = sph({ lab: 'V_0(\\theta)', outLab: 'V(r,\\theta)=?', outX: -70, outY: 70 });

  const L1 = {
    id: 'u7-separate', title: 'Laplace\'s equation in spherical coordinates',
    steps: [
      RF(md`
        In Unit 6 the boundaries were planes, $x = \text{const}$ or $y = \text{const}$. Now they are spheres: a shell held at some potential, a metal ball, a charged spherical surface. A sphere is $r = R$, a surface of constant $r$, so the boundary condition becomes a condition on one variable. That is the whole reason to switch coordinates: **separation of variables works when every boundary sits at a fixed value of one coordinate.**

        Laplace's equation in spherical coordinates is on the formula sheet:

        $$\nabla^2 V = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial V}{\partial r}\right) + \frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial V}{\partial\theta}\right) + \frac{1}{r^2\sin^2\theta}\frac{\partial^2 V}{\partial\phi^2} = 0$$

        The course always assumes **azimuthal symmetry**: nothing changes if you spin the setup about the $z$ axis, so $\partial V/\partial\phi = 0$ and $V = V(r,\theta)$. The last term drops. Multiply what is left by $r^2$:

        $$\frac{\partial}{\partial r}\left(r^2\frac{\partial V}{\partial r}\right) + \frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial V}{\partial\theta}\right) = 0$$

        (The notes write this line as a continuation of "$\nabla^2 V =$". It is really $r^2\nabla^2 V$. Harmless here, since it equals zero.)

        [[fig:coords]]

        !!key Azimuthal symmetry
          Every point on a ring around the $z$ axis (fixed $r$ and $\theta$) has the same potential. You get it whenever all the charges and all the boundary data are symmetric about one axis. You choose that axis as $z$, and $\theta$ is measured from it: $\theta = 0$ is the $+z$ axis (north pole), $\theta = \pi$ the $-z$ axis (south pole).
      `, { coords: { svg: FIG.coords, cap: 'A point $P$ at $(r,\\theta)$. With azimuthal symmetry, $V$ is the same everywhere on the ring through $P$.' } }),

      Q(md`Each option is a potential specified on a sphere centered at the origin. Which one breaks azimuthal symmetry about the $z$ axis?`,
        [md`$V_0\cos^2\theta$`, md`$V_0\sin\theta\cos\phi$`, md`$+V_0$ on the northern hemisphere, $-V_0$ on the southern`, md`$V_0$ on the cap $\theta \lt 30^\circ$, zero elsewhere`], 1,
        [md`$\cos^2\theta$ depends only on $\theta$. Rotating about $z$ changes $\phi$, not $\theta$, so this is symmetric.`, null, md`The hemispheres are defined by $\theta \lt \pi/2$ and $\theta \gt \pi/2$: no $\phi$ anywhere. Symmetric.`, md`A polar cap is a ring-shaped region around the axis: symmetric.`],
        md`Azimuthal symmetry means $V$ does not depend on $\phi$. $V_0\sin\theta\cos\phi$ is largest at $\phi = 0$ (the $+x$ side) and negative at $\phi = \pi$: rotating the sphere about $z$ changes it. That is a problem with $\phi$ dependence, which this course does not do. The other three depend on $\theta$ alone.`,
        { figHtml: FIG.coords }),

      Q(md`A point charge $q$ sits on the $z$ axis above a grounded sphere centered at the origin. Can you look for the potential in the form $V(r,\theta)$, with no $\phi$ dependence?`,
        [md`Yes. Spinning everything about the $z$ axis leaves both the sphere and the charge where they were, so $V$ cannot depend on $\phi$.`, md`No. Azimuthal symmetry needs the charge at the center.`, md`No. $V$ clearly changes with $\theta$, so it is not symmetric.`, md`Only far from the sphere, where the charge looks like it is at the origin.`], 0,
        [null, md`The charge only has to lie **on the axis**. A charge on the axis is unchanged by rotations about that axis.`, md`Azimuthal symmetry is about $\phi$, not $\theta$. $V(r,\theta)$ is allowed (and expected) to depend on $\theta$.`, md`The symmetry is exact everywhere, not an approximation at large $r$.`],
        md`The test is: rotate the whole setup about the $z$ axis by any angle. The sphere (centered on the axis) and the charge (on the axis) both map onto themselves, so the potential must too: $\partial V/\partial\phi = 0$. Every charge and every surface centered on one axis gives azimuthal symmetry.`,
        { figHtml: FIG.axisCharge }),

      Q(md`Now the charge $q$ is on the $x$ axis instead, a distance $d$ from the center of the grounded sphere. You want to use the course's $V(r,\theta)$ machinery. What do you do?`,
        [md`Nothing works: separation of variables needs the charge at the center.`, md`Keep the axes and add $\phi$ dependence.`, md`Call the line through the center and the charge the $z$ axis. Then the setup is symmetric about it again.`, md`Switch to Cartesian coordinates, since the charge is on the $x$ axis.`], 2,
        [md`The center is not special. What matters is whether there is *some* axis about which the setup is symmetric.`, md`That works in principle (graduate texts do it), but it is unnecessary: there is a symmetry axis, you just labeled it $x$.`, null, md`The boundary is still a sphere, which is not a surface of constant $x$, $y$ or $z$.`],
        md`Coordinates are your choice. A sphere plus one point charge is symmetric about the line through the center and the charge. Name that line $z$ and measure $\theta$ from it; then $V = V(r,\theta)$. On an exam, always pick $z$ along the symmetry axis first.`,
        { figHtml: FIG.offCharge }),

      RF(md`
        ### Separating: $V(r,\theta) = R(r)\,Q(\theta)$

        Following the lecture, look for product solutions:

        $$V(r,\theta) = R(r)\,Q(\theta)$$

        !!trap Two different R's
          $R(r)$ is the radial *function*. $R$ with no argument is the sphere's radius. They are unrelated; the notation just reuses the letter. When it could be confusing, write the argument: $R(r)$. Once you have solved the radial equation the radial function is always $r^\ell$ or $r^{-(\ell+1)}$, and the clash disappears.

        Substitute. $Q(\theta)$ comes out of the $r$ derivative and $R(r)$ out of the $\theta$ derivative:

        $$Q\,\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) + \frac{R}{\sin\theta}\frac{d}{d\theta}\left(\sin\theta\,\frac{dQ}{d\theta}\right) = 0$$

        (The notes drop a $d$ here: their $\tfrac{Q(\theta)}{d\theta}$ should be $\tfrac{dQ}{d\theta}$.) Divide by $RQ$ (the notes say "dividing by $1/RQ$"; they mean multiplying by $1/RQ$):

        $$\underbrace{\frac{1}{R}\frac{d}{dr}\left(r^2\frac{dR}{dr}\right)}_{\text{depends only on } r} + \underbrace{\frac{1}{Q\sin\theta}\frac{d}{d\theta}\left(\sin\theta\,\frac{dQ}{d\theta}\right)}_{\text{depends only on } \theta} = 0$$

        The lecture's in-class question: *what does each piece need to be equal to?* Hold $\theta$ fixed and change $r$. The second piece cannot change, and the sum stays zero, so the first piece cannot change either. Each piece is a constant, and the two constants cancel. The lecture writes them as $+\ell(\ell+1)$ and $-\ell(\ell+1)$:

        $$\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) = \ell(\ell+1)\,R \qquad\qquad \frac{d}{d\theta}\left(\sin\theta\,\frac{dQ}{d\theta}\right) = -\ell(\ell+1)\,Q\sin\theta$$

        One partial differential equation became two ordinary ones, exactly as in Cartesian coordinates.
      `),

      Q(md`Why does the lecture multiply the azimuthally symmetric Laplace equation by $r^2$ before separating?`,
        [md`Because $r^2\nabla^2 V$ and $\nabla^2 V$ are the same thing.`, md`To make the equation dimensionless.`, md`Because azimuthal symmetry requires it.`, md`So that after dividing by $RQ$, one term depends only on $r$ and the other only on $\theta$.`], 3,
        [md`They are not the same; they differ by a factor $r^2$. Both vanish, which is why the notes' loose "$=$" does no harm.`, md`Units have nothing to do with it; $\nabla^2 V = 0$ is already fine dimensionally.`, md`Azimuthal symmetry removes the $\phi$ term. The factor $r^2$ is a separate step.`, null],
        md`In $\nabla^2 V$ the $\theta$ term carries $\frac{1}{r^2}$. If you divided by $RQ$ without first multiplying by $r^2$, the angular term would be $\frac{1}{r^2}\times(\text{function of }\theta)$, which mixes $r$ and $\theta$, and the "each term is constant" argument would fail. Multiplying by $r^2$ removes that factor so the variables separate cleanly.`,
        { nofig: 'about the algebra of the equation, not a configuration' }),

      Q(md`After dividing by $RQ$ you have $f(r) + g(\theta) = 0$ for every $r$ and $\theta$ in the region. Why must $f(r)$ be a constant?`,
        [md`Because Laplace's equation is linear.`, md`Fix $\theta$ and vary $r$: $g$ stays put, and the sum must stay zero, so $f$ cannot change.`, md`Because of azimuthal symmetry.`, md`Because the boundary is at a fixed $r = R$.`], 1,
        [md`Linearity is what lets you *add* separated solutions later. It says nothing about why each piece is constant.`, null, md`Azimuthal symmetry removed $\phi$. The constancy argument works for any pair of variables that separate.`, md`The argument holds at every point of the region, not just on the boundary.`],
        md`This is the same logic as in Cartesian coordinates. A function of $r$ alone that equals minus a function of $\theta$ alone, for all $r$ and $\theta$, must be constant: change one variable and only one side could respond. Calling the constant $\ell(\ell+1)$ is just a naming choice that pays off in the next step.`,
        { nofig: 'logic of separation, no geometry' }),

      RF(md`
        ### The radial equation: $r^\ell$ and $r^{-(\ell+1)}$

        $\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) = \ell(\ell+1)R$ has the same power of $r$ in every term, so try a power, $R = r^n$:

        $$\frac{d}{dr}\left(r^2\cdot n\,r^{n-1}\right) = n(n+1)\,r^n \quad\Longrightarrow\quad n(n+1) = \ell(\ell+1)$$

        The quadratic $n^2 + n - \ell(\ell+1) = 0$ factors as $(n-\ell)(n+\ell+1) = 0$. So $n = \ell$ or $n = -(\ell+1)$, and the general solution is

        $$R(r) = A\,r^\ell + \frac{B}{r^{\ell+1}}$$

        The notes say "you can check by plugging in". For the second one: $r^2\frac{d}{dr}r^{-(\ell+1)} = -(\ell+1)\,r^{-\ell}$, and $\frac{d}{dr}\left[-(\ell+1)\,r^{-\ell}\right] = \ell(\ell+1)\,r^{-(\ell+1)}$, as required. Two constants, $A$ and $B$, as a second-order equation should have.

        **Why write the constant as $\ell(\ell+1)$?** Any constant $c \ge -\tfrac14$ can be written that way. The payoff is that the roots come out as the clean numbers $\ell$ and $-(\ell+1)$. It also makes negative $\ell$ redundant: $\ell \to -\ell-1$ gives the same $\ell(\ell+1)$ (for example $\ell = -3$ gives $(-3)(-2) = 6 = 2\cdot3$) and merely swaps the two radial solutions. So take $\ell \ge 0$.

        [[fig:radial]]

        !!trap $r^{-(\ell+1)}$, not $r^{-\ell}$
          The decaying solution is one power steeper than you might guess: $1/r$ for $\ell = 0$, $1/r^2$ for $\ell = 1$, $1/r^3$ for $\ell = 2$. Writing $r^{-\ell}$ is the most common mistake in this unit. For $\ell \ge 1$ it does not satisfy the radial equation at all ($n = -\ell$ gives $n(n+1) = \ell(\ell-1)$, not $\ell(\ell+1)$). For $\ell = 0$ it just repeats the constant $r^0$, so you would lose the point-charge solution $1/r$.

        !!intuition Which one lives where
          $r^\ell$ is fine at the origin and blows up at infinity. $r^{-(\ell+1)}$ is fine at infinity and blows up at the origin. A region that contains $r = 0$ (and no charge there) can only use $r^\ell$. A region that reaches $r \to \infty$ with $V \to 0$ can only use $r^{-(\ell+1)}$. A shell region $a \lt r \lt b$ contains neither point and keeps both.
      `, { radial: { svg: plotRadial(), cap: 'The two radial solutions for $\\ell = 1$: $r$ (solid) is finite at $r = 0$ and grows without bound; $r^{-2}$ (dashed) dies at infinity and blows up at $r = 0$.' } }),

      Q(md`You try $R(r) = r^n$ in $\dfrac{d}{dr}\left(r^2\dfrac{dR}{dr}\right) = \ell(\ell+1)R$. What condition on $n$ comes out?`,
        [md`$n(n-1) = \ell(\ell+1)$`, md`$n^2 = \ell(\ell+1)$`, md`$n(n+1) = \ell(\ell+1)$`, md`$n = \ell$, and nothing else`], 2,
        [md`That is what $\frac{d^2}{dr^2}r^n$ would give. The radial operator is $\frac{d}{dr}r^2\frac{d}{dr}$: $r^2\cdot nr^{n-1} = nr^{n+1}$, then $\frac{d}{dr}$ gives $n(n+1)r^n$.`, md`You lost the factor from differentiating $r^{n+1}$: it is $(n+1)$, not $n$.`, null, md`$n = \ell$ is one root. The quadratic $n(n+1) = \ell(\ell+1)$ also has $n = -(\ell+1)$.`],
        md`$r^2\frac{d}{dr}r^n = n\,r^{n+1}$, and $\frac{d}{dr}\left(n\,r^{n+1}\right) = n(n+1)\,r^n$. Setting this equal to $\ell(\ell+1)r^n$ gives $n(n+1) = \ell(\ell+1)$, whose roots are $n = \ell$ and $n = -(\ell+1)$.`,
        { nofig: 'pure algebra of the radial equation' }),

      Q(md`For $\ell = 2$, what are the two independent radial solutions?`,
        [md`$r^2$ and $r^{-2}$`, md`$r^3$ and $r^{-2}$`, md`$r^2$ and $\ln r$`, md`$r^2$ and $r^{-3}$`], 3,
        [md`The classic slip: the decaying power is $-(\ell+1) = -3$, not $-\ell$. Check: $r^{-2}$ gives $n(n+1) = (-2)(-1) = 2 \ne 6$.`, md`$r^3$ gives $n(n+1) = 12$, not $6$.`, md`$\ln r$ appears in the cylindrical $\ell = 0$ case, not here.`, null],
        md`$n(n+1) = 2\cdot3 = 6$ has roots $n = 2$ and $n = -3$. Check $r^{-3}$: $(-3)(-2) = 6$. In general the pair is $r^\ell$ and $r^{-(\ell+1)}$.`,
        { nofig: 'pure algebra of the radial equation' }),

      Q(md`If you allowed $\ell = -3$ in the separation constant $\ell(\ell+1)$, which non-negative $\ell$ gives exactly the same pair of equations?`,
        [md`$\ell = 2$`, md`$\ell = 3$`, md`$\ell = 1$`, md`None: negative $\ell$ is a genuinely new family of solutions.`], 0,
        [null, md`$\ell = 3$ gives $\ell(\ell+1) = 12$; $\ell = -3$ gives $(-3)(-2) = 6$.`, md`$\ell = 1$ gives $2$.`, md`$\ell \to -\ell - 1$ maps $-3$ to $2$ with the same constant $6$. The radial solutions $r^{-3}$ and $r^{2}$ just trade names.`],
        md`$\ell(\ell+1)$ is unchanged by $\ell \to -(\ell+1)$. So $\ell = -3$ is the same as $\ell = 2$: constant $6$, radial solutions $r^2$ and $r^{-3}$. That is why the sum runs over $\ell = 0, 1, 2, \dots$ only.`,
        { nofig: 'algebra of the separation constant' }),

      Q(md`The pictured sphere is held at a potential $V_0(\theta)$ and there is no charge inside. For the potential **inside**, which radial solutions are allowed for each $\ell$?`,
        [md`$r^\ell$ only`, md`$r^{-(\ell+1)}$ only`, md`Both`, md`$r^\ell$ for $\ell \ge 1$, but only $r^{-1}$ for $\ell = 0$`], 0,
        [null, md`$r^{-(\ell+1)}$ blows up at the center, which is inside the region. Nothing there could produce an infinite potential.`, md`Both is for a region that contains neither $r = 0$ nor $r \to \infty$.`, md`$1/r$ at the center would be the potential of a point charge sitting at $r = 0$. There is none.`],
        md`The region includes $r = 0$, where nothing is singular, so every $r^{-(\ell+1)}$ is thrown out (all $B_\ell = 0$). Only $r^\ell$ survives. This is the lecture's "$V(0,\theta) \ne \infty \Rightarrow B = 0$".`,
        { figHtml: FIG.inRegion }),

      Q(md`Same sphere, but now you want the potential **outside**, where there is no charge and $V \to 0$ far away. Which radial solutions are allowed?`,
        [md`$r^\ell$ only`, md`Both`, md`$r^{-(\ell+1)}$ only`, md`$r^{-(\ell+1)}$ for $\ell \ge 1$, plus a constant for $\ell = 0$`], 2,
        [md`$r^\ell$ grows without bound as $r \to \infty$ (for $\ell \ge 1$), and the constant $r^0$ does not go to zero.`, md`Both is for a shell region $a \lt r \lt b$ that reaches neither $0$ nor $\infty$.`, null, md`A constant term would make $V \to \text{const} \ne 0$ at infinity. With $V \to 0$ the $\ell = 0$ term must be $B_0/r$.`],
        md`$V \to 0$ as $r \to \infty$ kills every $r^\ell$ including $\ell = 0$ (a nonzero constant does not go to zero). Only $r^{-(\ell+1)}$ survives: $1/r$, $1/r^2$, $1/r^3$, ... This is the lecture's "$V(\infty,\theta) \to 0$, so $A_\ell = 0$".`,
        { figHtml: FIG.outRegion }),

      RF(md`
        ### The angular equation: Legendre's equation

        $$\frac{d}{d\theta}\left(\sin\theta\,\frac{dQ}{d\theta}\right) = -\ell(\ell+1)\,Q\sin\theta$$

        is Legendre's equation. Its solutions are **Legendre polynomials in the variable $\cos\theta$**:

        $$Q(\theta) = P_\ell(\cos\theta), \qquad P_0(x) = 1,\quad P_1(x) = x,\quad P_2(x) = \tfrac12\left(3x^2 - 1\right),\quad P_3(x) = \tfrac12\left(5x^3 - 3x\right),\ \dots$$

        To see where $x = \cos\theta$ comes from, substitute it: $\frac{d}{d\theta} = -\sin\theta\,\frac{d}{dx}$ and $\sin^2\theta = 1 - x^2$, so the equation becomes

        $$\frac{d}{dx}\left[(1 - x^2)\,\frac{dQ}{dx}\right] + \ell(\ell+1)\,Q = 0$$

        which has polynomial solutions in $x$.

        **Why $\ell$ must be a non-negative integer (sketch).** Put a power series $Q = \sum_k a_k x^k$ into the $x$ form. Matching powers gives

        $$a_{k+2} = \frac{k(k+1) - \ell(\ell+1)}{(k+1)(k+2)}\;a_k$$

        If $\ell$ is not an integer, the numerator never vanishes, the series never stops, and $a_{k+2}/a_k \to 1$. A series like that diverges at $x = \pm1$, that is at $\theta = 0$ and $\theta = \pi$: on the $z$ axis. If $\ell$ is a non-negative integer, the numerator vanishes at $k = \ell$ and the series of the same parity as $\ell$ stops at $x^\ell$: a polynomial, finite everywhere. That polynomial (normalized so it equals 1 at $x = 1$) is $P_\ell$.

        The equation is second order, so each $\ell$ also has a second solution, but it blows up on the $z$ axis. For $\ell = 0$ it is $Q = \ln\tan(\theta/2)$: then $\sin\theta\,\frac{dQ}{d\theta} = 1$, a constant, so the left side is zero.

        [[fig:q0]]

        The $z$ axis is inside every region in this course, so the second solutions are always thrown out. (Griffiths' footnote: only in rare problems where the $z$ axis is excluded from the region do they have to be kept.)

        !!intuition Same logic as the slot
          In the Cartesian slot, $\sin ky$ had to vanish on both plates, $y = 0$ and $y = a$, and that quantized $k = n\pi/a$. Here $\theta$ runs between two "walls" as well, the poles $\theta = 0$ and $\theta = \pi$, and demanding a finite potential there quantizes $\ell$. The angular direction plays the role of the oscillating direction ($P_\ell$ has $\ell$ zeros, like a sine), and $r$ plays the role of the growing or decaying direction ($r^\ell$ and $r^{-(\ell+1)}$ instead of $e^{\pm kx}$).
      `, { q0: { svg: plotQ0(), cap: 'The two $\\ell = 0$ solutions of Legendre\'s equation: $P_0 = 1$ (dashed) and $\\ln\\tan(\\theta/2)$, which diverges at both poles.' } }),

      Q(md`What forces $\ell$ to be a non-negative integer in $V = \sum_\ell (\dots)P_\ell(\cos\theta)$?`,
        [md`$V$ must be finite at $r = 0$.`, md`$V$ must go to zero as $r \to \infty$.`, md`The potential on the sphere must match $V_0(\theta)$.`, md`$V$ must be finite on the $z$ axis, at $\theta = 0$ and $\theta = \pi$.`], 3,
        [md`That condition acts on the *radial* functions (it kills $r^{-(\ell+1)}$). It says nothing about which $\ell$ are allowed.`, md`Also a radial condition; it kills $r^\ell$.`, md`Matching $V_0(\theta)$ fixes the coefficients $A_\ell$, $B_\ell$, after $\ell$ is already restricted.`, null],
        md`Only integer $\ell \ge 0$ gives angular solutions that stay finite at both poles: for other $\ell$ the power series in $\cos\theta$ never terminates and diverges at $\cos\theta = \pm1$. Radial conditions act afterwards, on the $A_\ell$ and $B_\ell$.`,
        { figHtml: FIG.coords }),

      Q(md`The angular solutions are Legendre polynomials. Of what?`,
        [md`$\theta$: $P_\ell(\theta)$`, md`$\cos\theta$: $P_\ell(\cos\theta)$`, md`$\sin\theta$: $P_\ell(\sin\theta)$`, md`$r\cos\theta$: $P_\ell(z)$`], 1,
        [md`A common slip. $P_2(\theta) = \tfrac12(3\theta^2 - 1)$ does not satisfy Legendre's equation; the variable is $x = \cos\theta$.`, null, md`The substitution that turns Legendre's equation into a polynomial equation is $x = \cos\theta$, not $\sin\theta$.`, md`$P_\ell$ is a function of the angle only; the $r$ dependence is a separate factor ($r^\ell$ or $r^{-(\ell+1)}$). $r^\ell P_\ell(\cos\theta)$ is a polynomial in $x, y, z$, but it is not $P_\ell(z)$: $r^2P_2(\cos\theta) = z^2 - \tfrac12(x^2 + y^2)$ is harmonic, while $P_2(z) = \tfrac12(3z^2 - 1)$ has $\nabla^2 = 3$.`],
        md`Always write $P_\ell(\cos\theta)$. For example $P_2(\cos\theta) = \tfrac12(3\cos^2\theta - 1)$, which is $1$ at the north pole, $-\tfrac12$ on the equator and $1$ again at the south pole.`,
        { nofig: 'notation question, a figure would give it away' }),

      Q(md`The pictured slot from Unit 6 has $V = 0$ on the plates $y = 0$ and $y = a$, which quantized $k = n\pi/a$. In the spherical problem, what plays the role of those two plates?`,
        [md`The condition $V \to 0$ as $r \to \infty$.`, md`Finiteness of $V$ at the two poles, $\theta = 0$ and $\theta = \pi$.`, md`The surface $r = R$ where $V_0(\theta)$ is given.`, md`Finiteness of $V$ at $r = 0$.`], 1,
        [md`In the slot, $V \to 0$ as $x \to \infty$ killed the growing exponential, the same job $V \to 0$ does to $r^\ell$. It did not quantize anything.`, null, md`The surface with the given potential corresponds to the driven end $x = 0$ with $V_0(y)$: it fixes the coefficients through Fourier's trick.`, md`That kills $r^{-(\ell+1)}$, like killing a growing exponential. It does not quantize $\ell$.`],
        md`In both problems one coordinate is bounded on two sides, and the conditions at those two ends quantize the separation constant: $y \in [0, a]$ gives $k = n\pi/a$; $\theta \in [0, \pi]$ gives $\ell = 0, 1, 2, \dots$ The other coordinate ($x$, or $r$) gets the growing/decaying pair, and the "far away" condition picks one.`,
        { figHtml: slotFig() }),

      Q(md`For $\ell = 0$ the angular equation has a second solution, $Q(\theta) = \ln\tan(\theta/2)$. Why is it never used in this course?`,
        [md`It does not actually satisfy Legendre's equation.`, md`It grows without bound as $r \to \infty$.`, md`It is infinite on the $z$ axis ($\theta = 0$ and $\theta = \pi$), and the axis is always part of the region.`, md`It is not orthogonal to $P_0$.`], 2,
        [md`It does: $\sin\theta\,\frac{d}{d\theta}\ln\tan\frac{\theta}{2} = 1$, a constant, whose derivative is zero.`, md`It has no $r$ dependence at all; it is an angular function.`, null, md`Orthogonality is not the criterion. Physical finiteness is.`],
        md`$\tan(\theta/2) \to 0$ as $\theta \to 0$ and $\to\infty$ as $\theta \to \pi$, so its log diverges at both poles. Every region here includes the axis (there is no wire or cone cutting it out), so this solution would give infinite potential at points where nothing is singular.`,
        { nofig: 'the plot in the reading above shows the answer' }),

      RF(md`
        ### Superposition: the general solution

        Laplace's equation is linear, so any sum of solutions is again a solution. Summing the separated solutions over all $\ell$ (Lecture 13):

        $$\boxed{V(r,\theta) = \sum_{\ell=0}^{\infty}\left(A_\ell\, r^\ell + \frac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta)}$$

        This is the formula to memorize; it is **not** on the formula sheet. Every azimuthally symmetric problem in this unit starts by writing it down. The boundary conditions then decide which $A_\ell$ and $B_\ell$ survive and what their values are. The lecture: "We can use an infinite number of $A_\ell$ and $B_\ell$ to match any boundary conditions," because, like the sines, the Legendre polynomials are complete (next two lessons).

        (There is no extra constant in front of $P_\ell$: it is absorbed into $A_\ell$ and $B_\ell$.)
      `),

      Q(md`Which of these is a solution of Laplace's equation (with azimuthal symmetry)?`,
        [md`$r^2\,P_1(\cos\theta)$`, md`$r^{-2}\,P_2(\cos\theta)$`, md`$r\,P_2(\cos\theta)$`, md`$r^{-3}\,P_2(\cos\theta)$`], 3,
        [md`$P_1$ goes with $r^1$ or $r^{-2}$. With $r^2$, $n(n+1) = 6 \ne \ell(\ell+1) = 2$.`, md`$P_2$ needs $r^2$ or $r^{-3}$. $r^{-2}$ gives $n(n+1) = 2 \ne 6$. This is the $r^{-\ell}$ trap.`, md`$P_2$ needs $r^2$ or $r^{-3}$, not $r^1$.`, null],
        md`The powers of $r$ and the index of $P_\ell$ are locked together: $P_\ell$ pairs with $r^\ell$ or $r^{-(\ell+1)}$. For $\ell = 2$: $r^2P_2$ or $r^{-3}P_2$. A quick check is $n(n+1) = \ell(\ell+1)$: here $(-3)(-2) = 6 = 2\cdot3$.`,
        { nofig: 'checks the pairing rule, no geometry involved' }),

      P({
        title: 'Building harmonic functions',
        q: md`(a) $V = r^n P_2(\cos\theta)$ solves Laplace's equation for exactly two values of $n$. Find them.

        (b) Write $r^2P_2(\cos\theta)$ in Cartesian coordinates ($z = r\cos\theta$, $r^2 = x^2 + y^2 + z^2$).

        (c) Which of the listed functions is **not** harmonic?`,
        figHtml: FIG.coords,
        hints: [
          md`Use the separated form: $r^n P_\ell(\cos\theta)$ is a solution exactly when $n(n+1) = \ell(\ell+1)$.`,
          md`For (b): $r^2P_2(\cos\theta) = \tfrac12\left(3r^2\cos^2\theta - r^2\right) = \tfrac12(3z^2 - r^2)$.`,
          md`For (c): check each pair ($\ell$, power) against $n = \ell$ or $n = -(\ell+1)$. $r^{-1}$ alone is $\ell = 0$ with $n = -1$.`,
        ],
        parts: [
          { lbl: md`the positive value of $n$`, ans: 2 },
          { lbl: md`the negative value of $n$`, ans: -3 },
          { lbl: md`$r^2P_2(\cos\theta)$ in terms of $x, y, z$`, expr: 'z^2 - (x^2 + y^2)/2', vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2] }, accepts: ['(2*z^2 - x^2 - y^2)/2', '(3*z^2 - (x^2+y^2+z^2))/2'] },
          { lbl: md`(c) Which is not harmonic?`, mc: [md`$r^3P_3(\cos\theta)$`, md`$r^{-2}P_1(\cos\theta)$`, md`$r^{-1}$`, md`$r^{-2}P_2(\cos\theta)$`], a: 3,
            why: [md`$\ell = 3$, $n = 3 = \ell$: fine.`, md`$\ell = 1$, $n = -2 = -(\ell+1)$: fine (a dipole).`, md`$\ell = 0$, $n = -1$: the point-charge potential, harmonic away from $r = 0$.`, null] },
        ],
        sol: md`
          **(a)** $n(n+1) = 2\cdot3 = 6$, so $(n-2)(n+3) = 0$: $n = 2$ or $n = -3$.

          **(b)** With $z = r\cos\theta$:

          $$r^2P_2(\cos\theta) = \frac{r^2}{2}\left(3\cos^2\theta - 1\right) = \frac{3z^2 - (x^2 + y^2 + z^2)}{2} = z^2 - \frac{x^2 + y^2}{2}$$

          Check it is harmonic directly: $\nabla^2\left(z^2 - \tfrac12x^2 - \tfrac12y^2\right) = 2 - 1 - 1 = 0$. This is the saddle shape you will meet as the $\ell = 2$ term inside a sphere: rising along $\pm z$, falling in the $xy$ plane.

          **(c)** $r^{-2}P_2$: $\ell = 2$ needs $n = 2$ or $n = -3$. With $n = -2$, $n(n+1) = 2 \ne 6$. The others pair correctly.

          **What to remember:** $r^\ell P_\ell$ and $r^{-(\ell+1)}P_\ell$ are the building blocks. In Cartesian form the growing ones are simple polynomials: $1$, $z$, $z^2 - \tfrac12(x^2+y^2)$, ... This is a quick way to check an answer for $V$ inside a sphere.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Use spherical coordinates when the boundaries are spheres centered on the origin. Pick $z$ along the symmetry axis; then $V = V(r,\theta)$.
          - Separate $V = R(r)Q(\theta)$: radial equation $\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) = \ell(\ell+1)R$, angular equation = Legendre's equation.
          - Radial solutions $r^\ell$ and $r^{-(\ell+1)}$ (not $r^{-\ell}$). Angular solutions $P_\ell(\cos\theta)$, argument $\cos\theta$.
          - $\ell = 0, 1, 2, \dots$ because $V$ must be finite on the $z$ axis (both poles). That is the spherical version of "$V = 0$ on both plates quantizes $k$".
          - General solution: $V = \sum_\ell \left(A_\ell r^\ell + B_\ell r^{-(\ell+1)}\right)P_\ell(\cos\theta)$. Memorize it.
          - $R(r)$ (radial function) and $R$ (radius) are different things.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 2: Legendre polynomials
  // =====================================================================================
  FIG.x = xFig();
  FIG.nodal = PF.row([{ svg: nodal(1), cap: '$P_1(\\cos\\theta)$' }, { svg: nodal(2), cap: '$P_2(\\cos\\theta)$' }, { svg: nodal(3), cap: '$P_3(\\cos\\theta)$' }]).svg;
  FIG.band = bandFig();
  FIG.p2plot = PF.plot({ w: 320, h: 190, x: [0, Math.PI], y: [-0.7, 1.15], zero: true, xl: '\\theta', yl: 'P_2(\\cos\\theta)',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[1, '1'], [-0.5, '-\\tfrac12']], curves: [{ f: (t) => Pl(2, Math.cos(t)) }] });

  const L2 = {
    id: 'u7-legendre', title: 'Legendre polynomials',
    steps: [
      RF(md`
        ### The first five

        | $\ell$ | $P_\ell(x)$ | $P_\ell(\cos\theta)$ |
        |---|---|---|
        | 0 | $1$ | $1$ |
        | 1 | $x$ | $\cos\theta$ |
        | 2 | $\tfrac12(3x^2 - 1)$ | $\tfrac12(3\cos^2\theta - 1)$ |
        | 3 | $\tfrac12(5x^3 - 3x)$ | $\tfrac12(5\cos^3\theta - 3\cos\theta)$ |
        | 4 | $\tfrac18(35x^4 - 30x^2 + 3)$ | $\tfrac18(35\cos^4\theta - 30\cos^2\theta + 3)$ |

        Know $P_0$ through $P_3$ cold (the lecture lists them). Recognize $P_4$.

        [[fig:x]]

        The variable $x = \cos\theta$ is the **height** of a point on a unit sphere: $x = 1$ at the north pole, $0$ on the equator, $-1$ at the south pole. A function of $x$ is a function of latitude. That is why $P_\ell(\cos\theta)$ describes how a potential varies from pole to pole.

        **Rodrigues' formula** (Lecture 13) generates them all:

        $$P_\ell(x) = \frac{1}{2^\ell\,\ell!}\left(\frac{d}{dx}\right)^{\ell}\left(x^2 - 1\right)^\ell$$

        Worked, $\ell = 2$: $(x^2-1)^2 = x^4 - 2x^2 + 1$. Two derivatives: $12x^2 - 4$. Times $\frac{1}{2^2\cdot 2!} = \frac18$: $\ \tfrac12(3x^2 - 1)$.

        Worked, $\ell = 3$: $(x^2-1)^3 = x^6 - 3x^4 + 3x^2 - 1$. Three derivatives: $120x^3 - 72x$. Times $\frac{1}{2^3\cdot3!} = \frac{1}{48}$: $\ \tfrac12(5x^3 - 3x)$.
      `, { x: { svg: FIG.x, cap: 'The Legendre variable is the height $x = \\cos\\theta$ of a point on a unit sphere.' } }),

      Q(md`What is $P_2(\cos\theta)$ at the north pole?`,
        [md`$1$`, md`$\tfrac32$`, md`$-\tfrac12$`, md`$0$`], 0,
        [null, md`$\tfrac12(3x^2 - 1)$ at $x = 1$ is $\tfrac12(3 - 1) = 1$. Getting $\tfrac32$ means the $-1$ was dropped.`, md`That is its value on the equator ($x = 0$).`, md`No Legendre polynomial vanishes at the poles: $P_\ell(1) = 1$ for every $\ell$.`],
        md`The north pole is $\theta = 0$, $x = 1$, and $P_\ell(1) = 1$ for every $\ell$. That normalization is built into Rodrigues' formula and is what makes the "axis trick" of the last lesson work.`,
        { figHtml: FIG.x }),

      Q(md`What is $P_3(\cos\theta)$ at the south pole?`,
        [md`$1$`, md`$0$`, md`$-1$`, md`$-\tfrac52$`], 2,
        [md`That is the north pole value. At the south pole odd polynomials flip sign.`, md`$P_3$ vanishes on the equator ($x = 0$), not at the poles.`, null, md`$\tfrac12(5x^3 - 3x)$ at $x = -1$ is $\tfrac12(-5 + 3) = -1$.`],
        md`The south pole is $x = -1$. $P_\ell(-1) = (-1)^\ell$, so odd $\ell$ gives $-1$. Direct check: $\tfrac12\left(5(-1)^3 - 3(-1)\right) = \tfrac12(-2) = -1$.`,
        { figHtml: FIG.x }),

      Q(md`What is $P_2(\cos\theta)$ on the equator?`,
        [md`$0$`, md`$\tfrac12$`, md`$-1$`, md`$-\tfrac12$`], 3,
        [md`Only the odd polynomials vanish on the equator. $P_2$ is even.`, md`Sign slip: $\tfrac12(3\cdot0 - 1) = -\tfrac12$.`, md`$|P_\ell| \le 1$, but $P_2$ only reaches $-\tfrac12$.`, null],
        md`On the equator $x = \cos 90^\circ = 0$, so $P_2 = \tfrac12(0 - 1) = -\tfrac12$. So an $\ell = 2$ potential is positive near both poles and negative around the equator.`,
        { figHtml: FIG.x }),

      Q(md`In Rodrigues' formula, what is the prefactor $\dfrac{1}{2^\ell\,\ell!}$ for $\ell = 3$?`,
        [md`$\tfrac{1}{48}$`, md`$\tfrac16$`, md`$\tfrac18$`, md`$\tfrac{1}{24}$`], 0,
        [null, md`That is only $\frac{1}{3!}$; you also need $\frac{1}{2^3}$.`, md`That is only $\frac{1}{2^3}$; you also need $\frac{1}{3!}$.`, md`$2^3\cdot 3! = 8\cdot6 = 48$, not $24$.`],
        md`$2^3\cdot3! = 8\cdot6 = 48$. Check: $\frac{1}{48}\cdot\frac{d^3}{dx^3}(x^2-1)^3 = \frac{1}{48}(120x^3 - 72x) = \tfrac12(5x^3 - 3x)$.`,
        { nofig: 'arithmetic with Rodrigues\' formula' }),

      Q(md`Why does Rodrigues' formula carry the factor $\dfrac{1}{2^\ell\,\ell!}$?`,
        [md`It makes the polynomials orthogonal.`, md`It makes $\int_{-1}^1 P_\ell^2\,dx = 1$.`, md`It makes $P_\ell(0) = 0$.`, md`It makes $P_\ell(1) = 1$ for every $\ell$.`], 3,
        [md`Orthogonality does not depend on overall constants: $\int P_\ell P_{\ell'} = 0$ stays zero if you rescale either one.`, md`With this convention $\int_{-1}^1 P_\ell^2\,dx = \frac{2}{2\ell+1}$, not $1$. That is why coefficient formulas carry $\frac{2\ell+1}{2}$.`, md`$P_0(0) = 1$ and $P_2(0) = -\tfrac12$, so that is false anyway.`, null],
        md`The derivative part fixes the *shape*; the constant in front is a convention. The convention chosen is $P_\ell(1) = 1$ (Griffiths Eq. 3.63, Lecture 13). It is not a unit normalization: $\int_{-1}^{1}P_\ell^2\,dx = \frac{2}{2\ell+1}$.`,
        { nofig: 'about a normalization convention' }),

      RF(md`
        ### Properties you will use constantly

        - **Degree and parity.** $P_\ell$ has degree $\ell$ and contains only powers with the same parity as $\ell$, so $P_\ell(-x) = (-1)^\ell P_\ell(x)$. Since $x \to -x$ means $\theta \to \pi - \theta$ (reflection through the equatorial plane, $z \to -z$), **even-$\ell$ terms are north–south symmetric and odd-$\ell$ terms are antisymmetric.**
        - **Normalization.** $P_\ell(1) = 1$ for every $\ell$. With parity, $P_\ell(-1) = (-1)^\ell$.
        - **Zeros.** $P_\ell$ has exactly $\ell$ zeros in $-1 \lt x \lt 1$. On the sphere each zero is a circle of latitude (a cone $\theta = \text{const}$) on which that term of $V$ vanishes. $P_1$: the equator. $P_2$: $\cos\theta = \pm1/\sqrt3$, so $\theta = 54.7^\circ$ and $125.3^\circ$. $P_3$: the equator and $\theta = 39.2^\circ$, $140.8^\circ$. Higher $\ell$ means finer angular structure, like higher harmonics of a string.
        - **On the equator:** $P_\ell(0) = 0$ for odd $\ell$; $P_2(0) = -\tfrac12$, $P_4(0) = \tfrac38$.
        - **Size.** $|P_\ell(x)| \le 1$ on $[-1, 1]$, with the extremes at the poles.

        [[fig:nodal]]
      `, { nodal: { svg: FIG.nodal, cap: 'Sign of $P_\\ell(\\cos\\theta)$ on the sphere (cross-section, $z$ up). Dashed lines are the nodal latitudes where the term vanishes.' } }),

      WG.legendrePlot(),

      Q(md`On how many circles of latitude does $P_4(\cos\theta)$ vanish? The patterns for $\ell = 1, 2, 3$ are shown.`,
        [md`$2$`, md`$3$`, md`$5$`, md`$4$`], 3,
        [md`$2$ is the count for $P_2$. Each step up in $\ell$ adds one nodal latitude.`, md`$3$ is the count for $P_3$.`, md`$P_\ell$ has exactly $\ell$ zeros in $(-1, 1)$, so $P_4$ has 4.`, null],
        md`$P_\ell(x)$ has $\ell$ zeros strictly between $-1$ and $1$, each one a cone $\theta = \text{const}$. For $P_4$ they are at $\cos\theta = \pm0.340$ and $\pm0.861$. Since $P_4$ is even, they come in mirror pairs about the equator, and the equator itself is not one of them.`,
        { figHtml: FIG.nodal }),

      Q(md`Look at the sign patterns. Reflect a potential term $r^\ell P_\ell(\cos\theta)$ through the equatorial plane ($z \to -z$, i.e. $\theta \to \pi - \theta$). What happens to it?`,
        [md`Nothing, for every $\ell$.`, md`It flips sign, for every $\ell$.`, md`It is multiplied by $(-1)^\ell$: even $\ell$ unchanged, odd $\ell$ flipped.`, md`$P_\ell$ turns into $P_{\ell+1}$.`], 2,
        [md`True only for even $\ell$. $P_1 = \cos\theta$ is positive in the north and negative in the south.`, md`True only for odd $\ell$. $P_2$ is positive at both poles.`, null, md`Reflection does not change the degree of a polynomial.`],
        md`$\theta \to \pi - \theta$ sends $x = \cos\theta \to -x$, and $P_\ell(-x) = (-1)^\ell P_\ell(x)$. **Use:** if the boundary data are north–south symmetric, only even $\ell$ can appear; if antisymmetric, only odd $\ell$. That halves the work.`,
        { figHtml: FIG.nodal }),

      Q(md`Which expression equals $P_2(\cos\theta)$?`,
        [md`$\tfrac12(3\cos2\theta - 1)$`, md`$\tfrac14(1 + 3\cos 2\theta)$`, md`$\tfrac12(3\cos2\theta + 1)$`, md`$3\cos^2\theta - 1$`], 1,
        [md`This swaps $\cos^2\theta$ for $\cos2\theta$, which are different functions: $\cos^2\theta = \tfrac12(1 + \cos2\theta)$.`, null, md`At $\theta = 0$ this gives $2$, but $P_\ell(1) = 1$.`, md`This is $2P_2$: the factor $\tfrac12$ is missing, so it equals $2$ at the poles.`],
        md`Use $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$: $\tfrac12\left(\tfrac32(1 + \cos2\theta) - 1\right) = \tfrac14(1 + 3\cos2\theta)$. Quick check at $\theta = 0$: $\tfrac14(1 + 3) = 1$. Expect boundary data written with double angles on exams; convert to powers of $\cos\theta$ first.`,
        { nofig: 'trig identity, no configuration' }),

      RF(md`
        ### Orthogonality, the weight $\sin\theta$, and completeness

        $$\int_{-1}^{1}P_\ell(x)\,P_{\ell'}(x)\,dx = \int_0^\pi P_\ell(\cos\theta)\,P_{\ell'}(\cos\theta)\,\sin\theta\,d\theta = \frac{2}{2\ell+1}\,\delta_{\ell\ell'}$$

        The two forms are the same integral. With $x = \cos\theta$: $dx = -\sin\theta\,d\theta$, and $x$ from $-1$ to $1$ is $\theta$ from $\pi$ to $0$; the minus sign flips the limits back.

        [[fig:band]]

        **Where the $\sin\theta$ comes from.** On a sphere of radius $R$, the band between $\theta$ and $\theta + d\theta$ is a ring of circumference $2\pi R\sin\theta$ and width $R\,d\theta$, so its area is $2\pi R^2\sin\theta\,d\theta$. Bands near the poles are tiny; bands near the equator are large. Orthogonality is a statement about averaging over the *surface*, so each $\theta$ is weighted by the area of its band. Drop the $\sin\theta$ and orthogonality fails: $\int_0^\pi P_2(\cos\theta)\,d\theta = \pi/4 \ne 0$.

        **Normalization.** $\frac{2}{2\ell+1}$, not 1: it is $2$ for $\ell = 0$, $\frac23$ for $\ell = 1$, $\frac25$ for $\ell = 2$, $\frac27$ for $\ell = 3$. That is where the factor $\frac{2\ell+1}{2}$ in every coefficient formula comes from.

        Worked: $\int_{-1}^1 P_1P_3\,dx = \tfrac12\int_{-1}^1(5x^4 - 3x^2)\,dx = \tfrac12\left[x^5 - x^3\right]_{-1}^{1} = 0$, and $\int_{-1}^1 P_2^2\,dx = \tfrac14\int_{-1}^1(9x^4 - 6x^2 + 1)\,dx = \tfrac14\left(\tfrac{18}{5} - 4 + 2\right) = \tfrac25$.

        **Completeness** (Lecture 13: "the Legendre polynomials are a complete set"). Any reasonable function of $\theta$ on $[0, \pi]$, piecewise smooth with finitely many jumps, can be written as

        $$f(\theta) = \sum_{\ell=0}^\infty c_\ell\,P_\ell(\cos\theta), \qquad c_\ell = \frac{2\ell+1}{2}\int_0^\pi f(\theta)\,P_\ell(\cos\theta)\,\sin\theta\,d\theta$$

        The formula for $c_\ell$ is Fourier's trick: multiply by $P_{\ell'}(\cos\theta)\sin\theta$, integrate, and orthogonality kills every term except $\ell = \ell'$. Same move as with the sine series in the slot.
      `, { band: { svg: FIG.band, cap: 'A band of latitude has radius $R\\sin\\theta$ and width $R\\,d\\theta$: area $2\\pi R^2\\sin\\theta\\,d\\theta$.' } }),

      Q(md`The plot shows $P_2(\cos\theta)$ against $\theta$. A student integrates it from $0$ to $\pi$ with respect to $\theta$ (no other factor) and gets $\pi/4$, not zero. What is the right conclusion?`,
        [md`$P_2$ and $P_0$ are not orthogonal after all.`, md`The orthogonality integral needs the weight $\sin\theta\,d\theta$. With it, $\int_0^\pi P_2(\cos\theta)\,P_0\,\sin\theta\,d\theta = 0$.`, md`An arithmetic slip; the integral over $\theta$ must vanish.`, md`Orthogonality only holds between odd and even $\ell$.`], 1,
        [md`They are orthogonal with the correct weight. The plain $\theta$ integral is the wrong inner product.`, null, md`$\int_0^\pi \tfrac12(3\cos^2\theta - 1)\,d\theta = \tfrac12\left(\tfrac{3\pi}{2} - \pi\right) = \tfrac{\pi}{4}$ is correct arithmetic. The integral itself is the wrong one.`, md`$P_1$ and $P_3$ are both odd and are orthogonal too.`],
        md`The plain $\theta$ integral overweights the poles, where $P_2$ is positive. Weighting by $\sin\theta$ (the band area) shrinks the polar lobes and gives exactly zero: $\int_{-1}^1 \tfrac12(3x^2 - 1)\,dx = \tfrac12(2 - 2) = 0$. Forgetting $\sin\theta$ is the most common Fourier-trick error in this unit.`,
        { figHtml: FIG.p2plot }),

      Q(md`Two bands of the same angular width $d\theta$ are drawn on a sphere: one at $\theta = 10^\circ$, one at $\theta = 90^\circ$. In a surface average such as $\frac{1}{4\pi R^2}\oint V\,da$, how do their weights compare?`,
        [md`They count equally, since $d\theta$ is the same.`, md`The polar band counts more, because it is closer to the axis.`, md`The equatorial band counts about $\dfrac{\sin90^\circ}{\sin10^\circ} \approx 5.8$ times more.`, md`The equatorial band counts $9$ times more ($90^\circ/10^\circ$).`], 2,
        [md`Equal $d\theta$ does not mean equal area. The ring at $10^\circ$ has a much smaller circumference.`, md`Closer to the axis means a *smaller* ring, so less area.`, null, md`Area goes as $\sin\theta$, not as $\theta$.`],
        md`$da = 2\pi R^2\sin\theta\,d\theta$, so the weight ratio is $\dfrac{\sin 90^\circ}{\sin10^\circ} = \dfrac{1}{0.174} \approx 5.8$. This is the $\sin\theta$ in every orthogonality integral and every coefficient formula.`,
        { figHtml: FIG.band }),

      Q(md`What is $\displaystyle\int_0^\pi \left[P_3(\cos\theta)\right]^2\sin\theta\,d\theta$?`,
        [md`$1$`, md`$\tfrac17$`, md`$\tfrac{\pi}{2}$`, md`$\tfrac27$`], 3,
        [md`The Legendre polynomials are not normalized to 1; they are normalized by $P_\ell(1) = 1$.`, md`The numerator is $2$ (the length of $[-1, 1]$ shows up), not $1$.`, md`$\pi/2$ is the sine-series analog over $[0, \pi]$, a different family.`, null],
        md`$\frac{2}{2\ell+1}$ with $\ell = 3$ gives $\frac27$. Memorize the pattern: $2, \frac23, \frac25, \frac27, \dots$`,
        { nofig: 'a standard integral' }),

      Q(md`Which of these integrals vanishes by **parity alone** (odd integrand on a symmetric interval), without using orthogonality?`,
        [md`$\int_{-1}^1 P_1P_3\,dx$`, md`$\int_{-1}^1 P_2P_2\,dx$`, md`$\int_{-1}^1 P_0P_2\,dx$`, md`$\int_{-1}^1 P_1P_2\,dx$`], 3,
        [md`It does vanish, but $P_1P_3$ is odd times odd, which is even. Its zero comes from orthogonality.`, md`This one is $\frac25$, not zero.`, md`It vanishes, but $P_0P_2$ is even; the zero is orthogonality, not parity.`, null],
        md`$P_1P_2$ is odd times even, an odd function, so its integral over $[-1, 1]$ is zero automatically. Parity alone kills every even–odd pair; orthogonality is needed for pairs of the same parity. Practical meaning: a north–south symmetric boundary function has no odd-$\ell$ components, by parity.`,
        { nofig: 'pure integral property' }),

      Q(md`In the slot, orthogonality read $\int_0^a\sin\frac{n\pi y}{a}\sin\frac{m\pi y}{a}\,dy = \frac{a}{2}\delta_{nm}$. What plays the role of $\frac a2$ for Legendre polynomials?`,
        [md`$1$`, md`$\frac{2}{2\ell+1}$`, md`$\frac{\pi}{2}$`, md`$\frac{1}{2\ell+1}$`], 1,
        [md`Neither family is normalized to 1.`, null, md`That would be the sine normalization on $[0, \pi]$.`, md`Off by a factor of 2: the interval $[-1, 1]$ has length 2.`],
        md`$\int_0^\pi P_\ell P_{\ell'}\sin\theta\,d\theta = \frac{2}{2\ell+1}\delta_{\ell\ell'}$. Inverting it is why coefficient formulas carry $\frac{2\ell+1}{2}$, exactly as $C_n$ carried $\frac{2}{a}$.`,
        { figHtml: slotFig() }),

      Q(md`What does it mean that the Legendre polynomials are **complete** on $0 \le \theta \le \pi$?`,
        [md`Any reasonable $f(\theta)$ (even one with jumps) can be written as $\sum_\ell c_\ell P_\ell(\cos\theta)$.`, md`Each pair of them is orthogonal.`, md`$\sum_\ell P_\ell(\cos\theta) = 1$.`, md`$P_\ell(1) = 1$ for every $\ell$.`], 0,
        [null, md`That is orthogonality. It tells you how to *find* the coefficients; completeness tells you an expansion exists.`, md`False; the sum does not even converge at $\theta = 0$.`, md`That is the normalization convention.`],
        md`Completeness guarantees that some set of coefficients reproduces any boundary function $V_0(\theta)$. Orthogonality then gives each coefficient by Fourier's trick. Both are needed, exactly as for the sine series: completeness from Dirichlet's theorem, orthogonality from the integral.`,
        { nofig: 'definition question' }),

      P({
        title: 'Legendre drill',
        q: md`Compute, as plain numbers:

        (a) $P_4(0)$. (b) $P_3(\cos60^\circ)$. (c) The polar angle $\theta$ (in degrees, northern hemisphere) on which $P_2(\cos\theta) = 0$. (d) $\int_0^\pi\left[P_4(\cos\theta)\right]^2\sin\theta\,d\theta$. (e) $\int_0^\pi \cos^2\theta\,P_2(\cos\theta)\sin\theta\,d\theta$.`,
        figHtml: FIG.x,
        hints: [
          md`Everything is easier in $x = \cos\theta$. The equator is $x = 0$; $60^\circ$ is $x = \tfrac12$.`,
          md`For (d) use the normalization $\frac{2}{2\ell+1}$. For (e) write $x^2 = \frac23P_2 + \frac13P_0$ and use orthogonality instead of integrating.`,
        ],
        parts: [
          { lbl: md`(a) $P_4(0)$`, ans: 0.375 },
          { lbl: md`(b) $P_3(\cos60^\circ)$`, ans: -0.4375 },
          { lbl: md`(c) $\theta$ in degrees`, ans: 54.74 },
          { lbl: md`(d) the integral of $P_4^2$`, ans: 2 / 9 },
          { lbl: md`(e) the integral of $\cos^2\theta\,P_2$`, ans: 4 / 15 },
        ],
        sol: md`
          **(a)** $P_4(0) = \tfrac18(0 - 0 + 3) = \tfrac38 = 0.375$.

          **(b)** $x = \tfrac12$: $P_3 = \tfrac12\left(5\cdot\tfrac18 - \tfrac32\right) = \tfrac12\left(-\tfrac78\right) = -\tfrac{7}{16} = -0.4375$.

          **(c)** $3x^2 - 1 = 0 \Rightarrow x = 1/\sqrt3 = 0.577$, so $\theta = \arccos(0.577) = 54.74^\circ$. (The other zero is $125.26^\circ$.)

          **(d)** $\frac{2}{2\cdot4 + 1} = \frac29 \approx 0.222$.

          **(e)** $\cos^2\theta = \tfrac23P_2 + \tfrac13P_0$. Orthogonality kills the $P_0$ piece:

          $$\int_0^\pi\cos^2\theta\,P_2\sin\theta\,d\theta = \tfrac23\int_0^\pi P_2^2\sin\theta\,d\theta = \tfrac23\cdot\tfrac25 = \tfrac{4}{15} \approx 0.267$$

          Check by brute force: $\int_{-1}^1 x^2\cdot\tfrac12(3x^2-1)\,dx = \tfrac12\left(\tfrac65 - \tfrac23\right) = \tfrac{4}{15}$.

          **What to remember:** convert to $x$, use $P_\ell(1) = 1$, parity, and orthogonality before you reach for an integral.
        `,
      }),

      P({
        title: 'Rodrigues for P₅',
        q: md`Use Rodrigues' formula to find $P_5(x)$, then evaluate $P_5(\tfrac12)$.`,
        nofig: 'pure polynomial algebra',
        hints: [
          md`Expand $(x^2 - 1)^5 = x^{10} - 5x^8 + 10x^6 - 10x^4 + 5x^2 - 1$. Only terms of degree at least 5 survive five derivatives.`,
          md`$\frac{d^5}{dx^5}x^{10} = 30240\,x^5$, $\frac{d^5}{dx^5}x^8 = 6720\,x^3$, $\frac{d^5}{dx^5}x^6 = 720\,x$. The prefactor is $\frac{1}{2^5\cdot5!} = \frac{1}{3840}$.`,
        ],
        parts: [
          { lbl: md`$P_5(x)$`, expr: '(63*x^5 - 70*x^3 + 15*x)/8', vars: { x: [-1, 1] } },
          { lbl: md`$P_5(\tfrac12)$`, ans: 23 / 256 },
        ],
        sol: md`
          $$\frac{d^5}{dx^5}(x^2-1)^5 = 30240\,x^5 - 5(6720)\,x^3 + 10(720)\,x = 30240\,x^5 - 33600\,x^3 + 7200\,x$$

          Divide by $2^5\cdot5! = 3840$:

          $$P_5(x) = \tfrac18\left(63x^5 - 70x^3 + 15x\right)$$

          Checks: $P_5(1) = \tfrac18(63 - 70 + 15) = 1$; only odd powers (odd $\ell$).

          A faster route is the recursion $(\ell+1)P_{\ell+1} = (2\ell+1)\,x\,P_\ell - \ell\,P_{\ell-1}$. With $\ell = 4$: $5P_5 = 9xP_4 - 4P_3 = \tfrac98(35x^5 - 30x^3 + 3x) - 2(5x^3 - 3x)$, which gives the same result.

          $P_5(\tfrac12) = \tfrac18\left(\tfrac{63}{32} - \tfrac{70}{8} + \tfrac{15}{2}\right) = \tfrac18\cdot\tfrac{23}{32} = \tfrac{23}{256} \approx 0.0898$.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $P_0 = 1$, $P_1 = x$, $P_2 = \tfrac12(3x^2-1)$, $P_3 = \tfrac12(5x^3 - 3x)$, with $x = \cos\theta$ = height on the unit sphere.
          - $P_\ell(1) = 1$, $P_\ell(-1) = (-1)^\ell$, $P_\ell(-x) = (-1)^\ell P_\ell(x)$: even $\ell$ symmetric north–south, odd $\ell$ antisymmetric.
          - $P_\ell$ has $\ell$ nodal latitudes. Odd ones vanish on the equator; $P_2(0) = -\tfrac12$.
          - $\int_0^\pi P_\ell P_{\ell'}\sin\theta\,d\theta = \frac{2}{2\ell+1}\delta_{\ell\ell'}$. Never forget the $\sin\theta$ (band area).
          - Complete set: $f(\theta) = \sum c_\ell P_\ell(\cos\theta)$ with $c_\ell = \frac{2\ell+1}{2}\int_0^\pi f\,P_\ell\sin\theta\,d\theta$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 3: expanding boundary data in Legendre polynomials
  // =====================================================================================
  const sphLab = (lab, extra = {}) => sph(Object.assign({ lab, R: false }, extra));
  FIG.hemPM = hemis({});
  FIG.hemNorth = hemis({ top: 'V_0', bot: 'V=0', botThin: true });
  FIG.ramp = PF.plot({ w: 320, h: 190, x: [0, Math.PI], y: [-1.25, 1.25], zero: true, xl: '\\theta', yl: 'V_0(\\theta)/V_0',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[1, '1'], [-1, '-1']], curves: [{ f: (t) => 1 - 2 * t / Math.PI }] });
  const stepSum = (t, N) => { let s = 0; for (let l = 1; l <= N; l += 2) { let I = 0; const n = 400; for (let i = 0; i < n; i++) { const x = (i + 0.5) / n; I += Pl(l, x) / n; } s += (2 * l + 1) * I * Pl(l, Math.cos(t)); } return s; };
  FIG.stepPlot = PF.plot({ w: 330, h: 200, x: [0, Math.PI], y: [-1.4, 1.4], zero: true, xl: '\\theta', yl: 'V_0(\\theta)/V_0',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: (t) => (t < Math.PI / 2 ? 1 : -1), cls: 'dim dash', from: 0.001, to: Math.PI / 2 - 0.001 }, { f: () => -1, cls: 'dim dash', from: Math.PI / 2 + 0.001, to: Math.PI - 0.001 },
      { f: (t) => 1.5 * Math.cos(t), cls: 'dim thin' }, { f: (t) => stepSum(t, 7), n: 300 }] });

  const L3 = {
    id: 'u7-expand', title: 'Expanding V₀(θ) in Legendre polynomials',
    steps: [
      RF(md`
        Every problem in this unit ends the same way: write the boundary function as $\sum_\ell c_\ell P_\ell(\cos\theta)$ and match coefficients term by term. The lecture is blunt about the integrals: the coefficient integral "usually is difficult to solve analytically unless the boundary condition itself is made of a superposition of Legendre polynomials." On exams it almost always is. So the most useful skill in this unit is rewriting a function of $\theta$ as a combination of $P_\ell$'s **without integrating**.

        ### Method 1: by eye (anything that is a polynomial in $\cos\theta$)

        1. Rewrite in powers of $x = \cos\theta$, using $\sin^2\theta = 1 - x^2$, $\cos2\theta = 2x^2 - 1$, $\sin^2\frac\theta2 = \frac{1-x}{2}$, $\cos^2\frac\theta2 = \frac{1+x}{2}$, $\cos3\theta = 4x^3 - 3x$.
        2. The highest power $x^n$ tells you the highest $\ell$ needed: $\ell = n$. The series stops there.
        3. Peel from the top. The leading coefficients are $P_2 = \tfrac32x^2 + \dots$, $P_3 = \tfrac52x^3 + \dots$, $P_4 = \tfrac{35}{8}x^4 + \dots$ Choose $c_n$ to reproduce the $x^n$ term, subtract $c_nP_n$, and repeat on what is left.
        4. Parity shortcut: only even powers (north–south symmetric data) means only even $\ell$; only odd powers means only odd $\ell$.

        Worked: $x^2$. From $P_2 = \tfrac32x^2 - \tfrac12$, $x^2 = \tfrac23\left(P_2 + \tfrac12\right) = \tfrac23P_2 + \tfrac13P_0$.

        Worked: $x^3$. From $P_3 = \tfrac52x^3 - \tfrac32x$, $x^3 = \tfrac25P_3 + \tfrac35x = \tfrac25P_3 + \tfrac35P_1$.

        Worked: $(1 + \cos\theta)^2 = 1 + 2x + x^2 = 1 + 2P_1 + \tfrac23P_2 + \tfrac13 = \tfrac43P_0 + 2P_1 + \tfrac23P_2$.

        | function of $\theta$ | in $x = \cos\theta$ | in Legendre polynomials |
        |---|---|---|
        | $\cos\theta$ | $x$ | $P_1$ |
        | $\cos^2\theta$ | $x^2$ | $\tfrac13P_0 + \tfrac23P_2$ |
        | $\sin^2\theta$ | $1 - x^2$ | $\tfrac23\left(P_0 - P_2\right)$ |
        | $3\cos^2\theta - 1$ | $3x^2 - 1$ | $2P_2$ |
        | $\cos2\theta$ | $2x^2 - 1$ | $\tfrac13\left(4P_2 - P_0\right)$ |
        | $\sin^2(\theta/2)$ | $\tfrac12(1 - x)$ | $\tfrac12\left(P_0 - P_1\right)$ |
        | $\cos^2(\theta/2)$ | $\tfrac12(1 + x)$ | $\tfrac12\left(P_0 + P_1\right)$ |
        | $\cos^3\theta$ | $x^3$ | $\tfrac15\left(2P_3 + 3P_1\right)$ |
        | $\sin^2\theta\cos\theta$ | $x - x^3$ | $\tfrac25\left(P_1 - P_3\right)$ |
        | $\cos3\theta$ | $4x^3 - 3x$ | $\tfrac15\left(8P_3 - 3P_1\right)$ |
        | $\cos^4\theta$ | $x^4$ | $\tfrac{1}{35}\left(8P_4 + 20P_2 + 7P_0\right)$ |

        Do not memorize the table; practice the peeling until it takes thirty seconds. Check any result at $\theta = 0$, where every $P_\ell = 1$: the coefficients must add up to the function's value at the north pole. For $\cos2\theta$: $\tfrac13(4 - 1) = 1 = \cos 0$.

        !!trap $\sin\theta$ is not a polynomial in $\cos\theta$
          $\sin\theta = \sqrt{1 - x^2}$ never terminates in $P_\ell$'s: $\sin\theta = \tfrac{\pi}{4}P_0 - \tfrac{5\pi}{32}P_2 - \tfrac{9\pi}{256}P_4 - \dots$ (only even $\ell$, since it is north–south symmetric). The same goes for $|\cos\theta|$, step functions and anything with a kink or a jump. Those need the integral (Method 2). Only **even** powers of $\sin\theta$ are polynomials in $\cos\theta$.
      `),

      Q(md`The pictured sphere is held at $V(R,\theta) = 5 + 2\cos\theta$ (in volts). In $\sum_\ell c_\ell P_\ell(\cos\theta)$, what are $c_0$ and $c_1$?`,
        [md`$c_0 = 5$ V, $c_1 = 2$ V, all others zero`, md`$c_0 = 7$ V, all others zero`, md`$c_0 = \tfrac52$ V, $c_1 = 1$ V`, md`$c_0 = 5$ V, $c_1 = \tfrac23$ V`], 0,
        [null, md`$7$ V is the value at the north pole only. The $\cos\theta$ part varies over the sphere and belongs to $\ell = 1$.`, md`No halving: $P_0 = 1$ and $P_1 = \cos\theta$ exactly, so the coefficients are read off directly.`, md`$\tfrac23$ is the normalization integral $\int P_1^2\sin\theta\,d\theta$. You only need it when computing coefficients by integration.`],
        md`$5 = 5P_0$ and $2\cos\theta = 2P_1$. Already a sum of Legendre polynomials, so read it off. Check at the north pole: $5 + 2 = 7$ V.`,
        { figHtml: sphLab('V(R,\\theta)=5+2\\cos\\theta') }),

      Q(md`The sphere is held at $V_0\cos^2\theta$. Which expansion is right?`,
        [md`$V_0P_2(\cos\theta)$`, md`$\tfrac{V_0}{3}\left(2P_2 + P_0\right)$`, md`$\tfrac{V_0}{3}\left(2P_2 - P_0\right)$`, md`$\tfrac{V_0}{2}\left(P_2 + P_0\right)$`], 1,
        [md`$P_2 = \tfrac12(3\cos^2\theta - 1)$, not $\cos^2\theta$. At the equator $P_2 = -\tfrac12$ while $\cos^2\theta = 0$.`, null, md`Sign error: at $\theta = 0$ this gives $\tfrac{V_0}{3}(2 - 1) = \tfrac{V_0}{3}$ instead of $V_0$.`, md`At $\theta = 0$ this gives $V_0$ correctly, but at the equator it gives $\tfrac{V_0}{2}(-\tfrac12 + 1) = \tfrac{V_0}{4}$, not $0$.`],
        md`From $P_2 = \tfrac32x^2 - \tfrac12$: $x^2 = \tfrac23P_2 + \tfrac13P_0$. Two checks: north pole $\tfrac{V_0}{3}(2 + 1) = V_0$; equator $\tfrac{V_0}{3}(2\cdot(-\tfrac12) + 1) = 0$. Both match $V_0\cos^2\theta$.`,
        { figHtml: sphLab('V_0(\\theta)=V_0\\cos^2\\theta') }),

      Q(md`The sphere is held at $V_0\sin^2\theta$. Which expansion is right?`,
        [md`$V_0\left(1 - P_2\right)$`, md`$\tfrac{2V_0}{3}\left(P_0 + P_2\right)$`, md`$\tfrac{2V_0}{3}\left(P_0 - P_2\right)$`, md`$V_0\left(P_0 - P_1^2\right)$`], 2,
        [md`At the north pole this gives $0$, correct, but at the equator it gives $1 + \tfrac12 = \tfrac32V_0$ instead of $V_0$.`, md`Sign: at the north pole this gives $\tfrac43V_0$, not $0$.`, null, md`Algebraically true, but $P_1^2$ is not a single Legendre polynomial, so it is not an expansion.`],
        md`$\sin^2\theta = 1 - x^2 = 1 - \left(\tfrac23P_2 + \tfrac13\right) = \tfrac23P_0 - \tfrac23P_2$. Checks: north pole $\tfrac23(1 - 1) = 0$; equator $\tfrac23\left(1 + \tfrac12\right) = 1$.`,
        { figHtml: sphLab('V_0(\\theta)=V_0\\sin^2\\theta') }),

      Q(md`The sphere is held at $V_0\cos^3\theta$. Which $\ell$ appear in the expansion?`,
        [md`$\ell = 3$ only`, md`$\ell = 0, 1, 2, 3$`, md`$\ell = 1$ only`, md`$\ell = 1$ and $\ell = 3$`], 3,
        [md`$P_3 = \tfrac52x^3 - \tfrac32x$ carries an $x$ term that must be cancelled by a $P_1$.`, md`$\cos^3\theta$ is odd in $x$, so no even $\ell$ can appear.`, md`$\cos^3\theta$ has degree 3, so $\ell = 3$ is needed.`, null],
        md`Degree 3 means $\ell \le 3$; odd function means odd $\ell$. So $\ell = 1, 3$: $\cos^3\theta = \tfrac25P_3 + \tfrac35P_1$.`,
        { figHtml: sphLab('V_0(\\theta)=V_0\\cos^3\\theta') }),

      Q(md`The sphere is held at $V_0\cos2\theta$. What is the $P_0$ coefficient?`,
        [md`$0$, because $\cos2\theta$ averages to zero over $0 \le \theta \le \pi$`, md`$\tfrac{V_0}{3}$`, md`$-V_0$`, md`$-\tfrac{V_0}{3}$`], 3,
        [md`$\int_0^\pi\cos2\theta\,d\theta = 0$ is the average over $\theta$, not over the sphere's surface. The surface average weights each $\theta$ by $\sin\theta$, which favors the equator, where $\cos2\theta = -1$.`, md`Sign: $\cos2\theta = 2x^2 - 1$, and the $-1$ dominates the $\ell = 0$ part.`, md`$-V_0$ is the value on the equator only.`, null],
        md`$\cos2\theta = 2x^2 - 1 = 2\left(\tfrac23P_2 + \tfrac13\right) - 1 = \tfrac43P_2 - \tfrac13P_0$. So $c_0 = -\tfrac{V_0}{3}$. Directly: $c_0 = \tfrac12\int_{-1}^1(2x^2 - 1)\,dx = \tfrac12\left(\tfrac43 - 2\right) = -\tfrac13$. This is the area average of the boundary data, and soon it will be the potential at the center.`,
        { figHtml: sphLab('V_0(\\theta)=V_0\\cos2\\theta') }),

      Q(md`The sphere is held at $V_0\sin\theta$. Which statement about its Legendre expansion is true?`,
        [md`Only $\ell = 1$, since $\sin\theta$ is "first order" like $\cos\theta$`, md`$\ell = 0$ and $\ell = 1$ only`, md`Infinitely many terms, all with even $\ell$; you need the coefficient integral`, md`Infinitely many terms, all with odd $\ell$`], 2,
        [md`$P_1 = \cos\theta$, which is antisymmetric north–south; $\sin\theta$ is symmetric.`, md`$\sin\theta = \sqrt{1 - x^2}$ is not a polynomial in $x$, so no finite set of $P_\ell$ reproduces it.`, null, md`$\sin(\pi - \theta) = \sin\theta$: symmetric, so even $\ell$.`],
        md`$\sin\theta = \sqrt{1 - x^2}$ has a square root, so the series never stops; it is symmetric under $x \to -x$, so only even $\ell$. The integrals give $c_0 = \tfrac{\pi}{4}V_0$, $c_2 = -\tfrac{5\pi}{32}V_0$, $c_4 = -\tfrac{9\pi}{256}V_0$, ...`,
        { figHtml: sphLab('V_0(\\theta)=V_0\\sin\\theta') }),

      Q(md`The upper hemisphere is held at $+V_0$ and the lower at $-V_0$ (separated by a thin insulating ring). Which coefficients of the expansion are nonzero?`,
        [md`Odd $\ell$ only, and infinitely many of them`, md`$\ell = 1$ only`, md`Even $\ell$ only`, md`Every $\ell$`], 0,
        [null, md`$\tfrac32V_0P_1$ alone is a smooth cosine; it cannot make a jump at the equator. The series needs all odd $\ell$.`, md`The data are antisymmetric ($V_0(\pi - \theta) = -V_0(\theta)$), which rules out every even $\ell$, including $\ell = 0$.`, md`Parity kills all even $\ell$.`],
        md`Antisymmetric data means odd $\ell$ only. A jump is not a polynomial in $\cos\theta$, so the series never terminates: $V_0\left[\tfrac32P_1 - \tfrac78P_3 + \tfrac{11}{16}P_5 - \dots\right]$. Note $c_0 = 0$: the average over the sphere is zero.`,
        { figHtml: FIG.hemPM }),

      Q(md`The plot shows boundary data $V_0(\theta)$ on a sphere. Which $\ell$ can appear in its expansion?`,
        [md`Even $\ell$ only`, md`Odd $\ell$ only`, md`$\ell \le 1$ only`, md`All $\ell$`], 1,
        [md`Even-$\ell$ terms are symmetric about $\theta = \pi/2$. This curve is antisymmetric: $V_0(\pi - \theta) = -V_0(\theta)$.`, null, md`The curve is a straight line in $\theta$, not in $\cos\theta$. As a function of $x$ it is $1 - \tfrac{2}{\pi}\arccos x$, not a polynomial, so infinitely many terms appear.`, md`Parity rules out the even ones.`],
        md`Read the symmetry off the plot: the value at $\pi - \theta$ is minus the value at $\theta$, so only odd $\ell$. Linear in $\theta$ is not linear in $\cos\theta$, so the series does not stop at $\ell = 1$.`,
        { figHtml: FIG.ramp }),

      Q(md`$P_3(x) = \tfrac52x^3 - \tfrac32x$. If you write $x^3 = \alpha P_3 + (\text{lower } P\text{'s})$, what is $\alpha$?`,
        [md`$\tfrac52$`, md`$\tfrac35$`, md`$1$`, md`$\tfrac25$`], 3,
        [md`That is the coefficient of $x^3$ *in* $P_3$. You need its inverse.`, md`$\tfrac35$ is the coefficient of $P_1$ in $x^3$.`, md`$P_3$ is not $x^3$; its leading coefficient is $\tfrac52$.`, null],
        md`To produce $x^3$ from $\alpha P_3 = \alpha\left(\tfrac52x^3 - \tfrac32x\right)$ you need $\alpha = \tfrac25$. The leftover $\tfrac25\cdot\tfrac32x = \tfrac35x$ is fixed by $\tfrac35P_1$: $x^3 = \tfrac25P_3 + \tfrac35P_1$.`,
        { nofig: 'polynomial algebra' }),

      Q(md`The northern hemisphere is held at $V_0$ and the southern hemisphere is grounded. Without integrating, what is $c_0$?`,
        [md`$0$`, md`$\tfrac{V_0}{2}$`, md`$V_0$`, md`$\tfrac{V_0}{4}$`], 1,
        [md`Zero average needs equal positive and negative areas. Here half the sphere is at $V_0$ and half at $0$.`, null, md`$V_0$ would mean the whole sphere at $V_0$.`, md`The two hemispheres have equal area (that is what $\sin\theta$ weighting gives), so the average is $\tfrac12V_0$.`],
        md`$c_0 = \tfrac12\int_0^\pi V_0(\theta)\sin\theta\,d\theta$ is the area average of the data. Half the area is at $V_0$, half at $0$: $c_0 = V_0/2$. This data is "$\tfrac{V_0}{2}$ plus the $\pm\tfrac{V_0}{2}$ hemispheres", so the rest of the series is half of the previous question's: odd $\ell$ only.`,
        { figHtml: FIG.hemNorth }),

      Q(md`The sphere is held at $V_0(1 + \cos\theta)^3$. What is the highest $\ell$ in its expansion?`,
        [md`$1$`, md`$2$`, md`$3$`, md`There is no highest $\ell$; the series is infinite`], 2,
        [md`The cube produces $\cos^3\theta$, so the degree is 3.`, md`The degree is 3, not 2.`, null, md`It is a polynomial in $\cos\theta$, so the series stops.`],
        md`$(1 + x)^3$ has degree 3, so $\ell \le 3$: $(1 + x)^3 = 2P_0 + \tfrac{18}{5}P_1 + 2P_2 + \tfrac25P_3$. Check at $x = 1$: $2 + 3.6 + 2 + 0.4 = 8 = 2^3$.`,
        { figHtml: sphLab('V_0(\\theta)=V_0(1+\\cos\\theta)^3') }),

      Q(md`The sphere is held at $V_0\cos^2(\theta/2)$. What is its expansion?`,
        [md`$\tfrac{V_0}{2}\left(P_0 + P_1\right)$`, md`$\tfrac{V_0}{2}\left(P_0 - P_1\right)$`, md`$\tfrac{V_0}{3}\left(2P_2 + P_0\right)$`, md`$V_0P_1$`], 0,
        [null, md`That is $\sin^2(\theta/2)$, the lecture's example: it is $0$ at the north pole.`, md`That is $\cos^2\theta$; the half angle changes everything.`, md`$P_1 = \cos\theta$ is negative on the southern half; $\cos^2(\theta/2) \ge 0$ everywhere.`],
        md`Half-angle identity: $\cos^2(\theta/2) = \tfrac12(1 + \cos\theta) = \tfrac12(P_0 + P_1)$. Checks: $V_0$ at the north pole, $0$ at the south pole.`,
        { figHtml: sphLab('V_0(\\theta)=V_0\\cos^2(\\theta/2)') }),

      Q(md`The sphere is held at $V_0|\cos\theta|$. How do you get its coefficients?`,
        [md`By eye: $|\cos\theta| = P_1$, so $c_1 = V_0$.`, md`By the integral; only even $\ell$ appear, and infinitely many of them.`, md`By the integral; only odd $\ell$ appear.`, md`By eye: $|\cos\theta| = \tfrac13P_0 + \tfrac23P_2$.`], 1,
        [md`$P_1 = \cos\theta$ is negative in the south; $|\cos\theta|$ is not.`, null, md`$|\cos\theta|$ is symmetric north–south, so odd $\ell$ vanish.`, md`That is $\cos^2\theta$. $|\cos\theta|$ has a kink at the equator, which no finite polynomial in $\cos\theta$ reproduces.`],
        md`$|x|$ is even but not a polynomial (kink at $x = 0$), so you need $c_\ell = \frac{2\ell+1}{2}\int_{-1}^1|x|P_\ell\,dx = (2\ell+1)\int_0^1 xP_\ell\,dx$ for even $\ell$: $c_0 = \tfrac12V_0$, $c_2 = \tfrac58V_0$, $c_4 = -\tfrac{3}{16}V_0$, ...`,
        { figHtml: sphLab('V_0(\\theta)=V_0|\\cos\\theta|') }),

      RF(md`
        ### Method 2: Fourier's trick (when the data are not a polynomial in $\cos\theta$)

        Multiply $V_0(\theta) = \sum_\ell c_\ell P_\ell(\cos\theta)$ by $P_{\ell'}(\cos\theta)\sin\theta$ and integrate from $0$ to $\pi$. Orthogonality kills every term with $\ell \ne \ell'$:

        $$c_\ell = \frac{2\ell+1}{2}\int_0^\pi V_0(\theta)\,P_\ell(\cos\theta)\,\sin\theta\,d\theta = \frac{2\ell+1}{2}\int_{-1}^{1}V_0\,P_\ell(x)\,dx$$

        This is the same move as Unit 6, line by line:

        | | slot (Unit 6) | sphere (this unit) |
        |---|---|---|
        | boundary data | $V_0(y)$ on $0 \lt y \lt a$ | $V_0(\theta)$ on $0 \lt \theta \lt \pi$ |
        | basis | $\sin(n\pi y/a)$, $n = 1, 2, \dots$ | $P_\ell(\cos\theta)$, $\ell = 0, 1, \dots$ |
        | what quantizes | $V = 0$ at $y = 0$ and $y = a$ | $V$ finite at $\theta = 0$ and $\theta = \pi$ |
        | orthogonality | $\int_0^a\sin\sin\,dy = \frac a2\delta_{nm}$ | $\int_0^\pi P_\ell P_{\ell'}\sin\theta\,d\theta = \frac{2}{2\ell+1}\delta_{\ell\ell'}$ |
        | multiply by | $\sin(m\pi y/a)$ | $P_{\ell'}(\cos\theta)\sin\theta$ |
        | coefficient | $\frac2a\int_0^aV_0\sin\frac{n\pi y}{a}\,dy$ | $\frac{2\ell+1}{2}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$ |
        | other direction | $e^{-n\pi x/a}$ | $r^\ell$ inside, $r^{-(\ell+1)}$ outside |
        | jumps in the data | Gibbs ringing | Gibbs ringing |

        ### Worked: hemispheres at $\pm V_0$

        Data: $+V_0$ for $0 \le \theta \lt \pi/2$, $-V_0$ for $\pi/2 \lt \theta \le \pi$. Antisymmetric, so only odd $\ell$. For odd $\ell$, $P_\ell$ is odd too, and the two halves contribute equally:

        $$c_\ell = \frac{2\ell+1}{2}\left[\int_0^1 V_0P_\ell\,dx - \int_{-1}^0V_0P_\ell\,dx\right] = (2\ell+1)\,V_0\int_0^1P_\ell(x)\,dx$$

        The needed integrals: $\int_0^1P_1\,dx = \tfrac12$, $\int_0^1P_3\,dx = \tfrac12\left(\tfrac54 - \tfrac32\right) = -\tfrac18$, $\int_0^1P_5\,dx = \tfrac{1}{16}$. So

        $$V_0(\theta) = V_0\left[\tfrac32P_1(\cos\theta) - \tfrac78P_3(\cos\theta) + \tfrac{11}{16}P_5(\cos\theta) - \dots\right]$$

        [[fig:step]]

        The partial sums converge to the step but ring near the jump (Gibbs, exactly as in the slot). In a boundary-value problem this hardly matters: the $r^\ell$ or $r^{-(\ell+1)}$ factors make the high-$\ell$ terms die away from the surface, so the first one or two terms usually give the answer to a few percent.
      `, { step: { svg: FIG.stepPlot, cap: 'Dashed: the $\\pm V_0$ step. Thin: the $\\ell = 1$ term alone, $\\tfrac32\\cos\\theta$. Solid: the sum through $\\ell = 7$.' } }),

      WG.sphere({ bc: 'step', n: 3 }),

      Q(md`Compare $C_n = \dfrac2a\displaystyle\int_0^a V_0(y)\sin\frac{n\pi y}{a}\,dy$ for the slot with $c_\ell = \dfrac{2\ell+1}{2}\displaystyle\int_0^\pi V_0(\theta)P_\ell(\cos\theta)\sin\theta\,d\theta$. The factor $\frac{2\ell+1}{2}$ plays the role of which factor in $C_n$?`,
        [md`$\dfrac2a$`, md`$\dfrac a2$`, md`$\dfrac{n\pi}{a}$`, md`$\sin\dfrac{n\pi y}{a}$`], 0,
        [null, md`$\frac a2$ is the orthogonality integral itself. The coefficient formula carries its inverse.`, md`$n\pi/a$ is the quantized separation constant, the analog of $\ell$, not of a normalization.`, md`The sine is the basis function, the analog of $P_\ell(\cos\theta)$.`],
        md`Both are "1 over the norm" of the basis function: $\int\sin^2 = \frac a2$ gives $\frac2a$; $\int P_\ell^2\sin\theta\,d\theta = \frac{2}{2\ell+1}$ gives $\frac{2\ell+1}{2}$. The weight $\sin\theta$ has no analog in the slot (the sines need no weight), which is why it is easy to forget.`,
        { figHtml: slotFig() }),

      P({
        title: 'Expand by eye',
        q: md`A sphere is held at $V_0(\theta) = V_0\left(1 - \cos\theta\right)^2$. Find the coefficients $c_\ell$ (in units of $V_0$) of $V_0(\theta) = \sum_\ell c_\ell P_\ell(\cos\theta)$.`,
        figHtml: sphLab('V_0(\\theta)=V_0(1-\\cos\\theta)^2'),
        hints: [
          md`It is a polynomial in $x = \cos\theta$ of degree 2, so only $\ell \le 2$ appear. No integrals.`,
          md`Expand: $1 - 2x + x^2$. Replace $x^2 = \tfrac23P_2 + \tfrac13P_0$.`,
        ],
        parts: [
          { lbl: md`$c_0/V_0$`, ans: 4 / 3 },
          { lbl: md`$c_1/V_0$`, ans: -2 },
          { lbl: md`$c_2/V_0$`, ans: 2 / 3 },
        ],
        sol: md`
          $(1 - x)^2 = 1 - 2x + x^2 = 1 - 2P_1 + \tfrac23P_2 + \tfrac13P_0 = \tfrac43P_0 - 2P_1 + \tfrac23P_2$.

          So $c_0 = \tfrac43V_0$, $c_1 = -2V_0$, $c_2 = \tfrac23V_0$, and all higher $c_\ell = 0$.

          **Checks.** North pole ($x = 1$, every $P_\ell = 1$): $\tfrac43 - 2 + \tfrac23 = 0 = (1 - 1)^2$. South pole ($P_\ell = (-1)^\ell$): $\tfrac43 + 2 + \tfrac23 = 4 = (1 + 1)^2$. Both match.

          **What to remember:** expand in powers of $\cos\theta$, swap each power for $P_\ell$'s, and check at both poles.
        `,
      }),

      P({
        title: 'A triple-angle boundary',
        q: md`A sphere is held at $V_0(\theta) = V_0\cos3\theta$. Expand it in Legendre polynomials and give the coefficients in units of $V_0$.`,
        figHtml: sphLab('V_0(\\theta)=V_0\\cos3\\theta'),
        hints: [
          md`First turn $\cos3\theta$ into powers of $\cos\theta$: $\cos3\theta = 4\cos^3\theta - 3\cos\theta$.`,
          md`Odd powers only, so only $\ell = 1, 3$. Use $x^3 = \tfrac25P_3 + \tfrac35P_1$.`,
        ],
        parts: [
          { lbl: md`$c_0/V_0$`, ans: 0 },
          { lbl: md`$c_1/V_0$`, ans: -0.6 },
          { lbl: md`$c_3/V_0$`, ans: 1.6 },
        ],
        sol: md`
          $\cos3\theta = 4x^3 - 3x = 4\left(\tfrac25P_3 + \tfrac35P_1\right) - 3P_1 = \tfrac85P_3 - \tfrac35P_1$.

          So $c_1 = -\tfrac35V_0$, $c_3 = \tfrac85V_0$, and everything else (including $c_0$) is zero.

          **Checks.** North pole: $\tfrac85 - \tfrac35 = 1 = \cos0$. South pole: $-\tfrac85 + \tfrac35 = -1 = \cos3\pi$. And $c_0 = 0$ means the surface average of $\cos 3\theta$ is zero.

          **Why this matters:** $c_1$ and $c_3$ come out in a ratio you would never guess from the formula $\cos 3\theta$. Converting to powers of $\cos\theta$ first is what makes it a thirty-second problem.
        `,
      }),

      P({
        title: 'Half the sphere at V₀',
        q: md`The northern hemisphere of a sphere is held at $V_0$ and the southern hemisphere is grounded. Find $c_0$, $c_1$, $c_2$ and $c_3$ in units of $V_0$. You may use $\int_0^1P_1\,dx = \tfrac12$, $\int_0^1P_2\,dx = 0$ and $\int_0^1P_3\,dx = -\tfrac18$.`,
        figHtml: FIG.hemNorth,
        hints: [
          md`This is not a polynomial in $\cos\theta$ (it jumps), so use $c_\ell = \frac{2\ell+1}{2}\int_{-1}^{1}V_0(x)P_\ell(x)\,dx$. The data vanish for $x \lt 0$.`,
          md`So $c_\ell = \frac{2\ell+1}{2}V_0\int_0^1P_\ell(x)\,dx$. Alternatively: the data are $\tfrac{V_0}{2}$ plus half of the $\pm V_0$ hemispheres.`,
        ],
        parts: [
          { lbl: md`$c_0/V_0$`, ans: 0.5 },
          { lbl: md`$c_1/V_0$`, ans: 0.75 },
          { lbl: md`$c_2/V_0$`, ans: 0 },
          { lbl: md`$c_3/V_0$`, ans: -7 / 16 },
        ],
        sol: md`
          With $x = \cos\theta$ the data are $V_0$ for $0 \lt x \le 1$ and $0$ for $x \lt 0$:

          $$c_\ell = \frac{2\ell+1}{2}\,V_0\int_0^1P_\ell(x)\,dx$$

          - $c_0 = \tfrac12V_0\cdot1 = \tfrac12V_0$ (the average)
          - $c_1 = \tfrac32V_0\cdot\tfrac12 = \tfrac34V_0$
          - $c_2 = \tfrac52V_0\cdot0 = 0$
          - $c_3 = \tfrac72V_0\cdot\left(-\tfrac18\right) = -\tfrac{7}{16}V_0$

          **Cross-check by superposition.** These data equal the constant $\tfrac{V_0}{2}$ plus the $\pm\tfrac{V_0}{2}$ hemispheres. The constant gives $c_0 = \tfrac12V_0$; the hemispheres give half of $\tfrac32, -\tfrac78$, i.e. $\tfrac34, -\tfrac{7}{16}$, and no even terms. Same answer, and it explains why $c_2 = 0$: every even $\ell \ge 2$ vanishes.

          **What to remember:** split boundary data into a symmetric and an antisymmetric part; each part only has even or only odd $\ell$.
        `,
      }),

      P({
        title: 'When you must integrate',
        q: md`A sphere is held at $V_0(\theta) = V_0\sin\theta$. Compute $c_0$ and $c_2$ (in units of $V_0$) of its Legendre expansion. You will need $\int_0^\pi\sin^2\theta\,d\theta = \tfrac{\pi}{2}$ and $\int_0^\pi\sin^2\theta\cos^2\theta\,d\theta = \tfrac{\pi}{8}$.`,
        figHtml: sphLab('V_0(\\theta)=V_0\\sin\\theta'),
        hints: [
          md`$\sin\theta$ is not a polynomial in $\cos\theta$, so use $c_\ell = \frac{2\ell+1}{2}\int_0^\pi V_0\sin\theta\,P_\ell(\cos\theta)\sin\theta\,d\theta$. Note the two factors of $\sin\theta$: one is the data, one is the weight.`,
          md`$c_2 = \tfrac52\int_0^\pi\sin^2\theta\cdot\tfrac12(3\cos^2\theta - 1)\,d\theta$.`,
        ],
        parts: [
          { lbl: md`$c_0/V_0$`, ans: Math.PI / 4 },
          { lbl: md`$c_2/V_0$`, ans: -5 * Math.PI / 32 },
          { lbl: md`Why is $c_1 = 0$?`, mc: [md`The data are north–south symmetric, so all odd $\ell$ vanish.`, md`Because $\int_0^\pi\sin\theta\cos\theta\,d\theta = 0$ only by accident.`, md`Because $\sin\theta$ vanishes at the poles.`], a: 0,
            why: [null, md`It is no accident: $\sin\theta\cos\theta$ is antisymmetric about $\theta = \pi/2$, which is the parity argument.`, md`Vanishing at the poles has nothing to do with parity; $\sin^2\theta$ also vanishes there and has a nonzero $c_0$.`] },
        ],
        sol: md`
          $$c_0 = \tfrac12\int_0^\pi\sin\theta\cdot\sin\theta\,d\theta = \tfrac12\cdot\tfrac{\pi}{2} = \tfrac{\pi}{4} \approx 0.785$$

          $$c_2 = \tfrac52\int_0^\pi\sin^2\theta\cdot\tfrac12\left(3\cos^2\theta - 1\right)d\theta = \tfrac54\left(3\cdot\tfrac{\pi}{8} - \tfrac{\pi}{2}\right) = -\tfrac{5\pi}{32} \approx -0.491$$

          All odd $c_\ell$ vanish because $\sin(\pi - \theta) = \sin\theta$. The series continues: $c_4 = -\tfrac{9\pi}{256} \approx -0.110$, and so on.

          **Check at the equator** ($P_0 = 1$, $P_2 = -\tfrac12$, $P_4 = \tfrac38$): $0.785 + 0.245 - 0.041 = 0.989$, close to $\sin90^\circ = 1$ after three terms.

          **What to remember:** count the $\sin\theta$ factors. The weight is always there; the data may bring another.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Polynomial in $\cos\theta$: expand by eye. Degree $n$ means $\ell \le n$; peel from the top using the leading coefficients $\tfrac32, \tfrac52, \tfrac{35}{8}$.
          - Must-know: $\cos^2\theta = \tfrac13P_0 + \tfrac23P_2$, $\sin^2\theta = \tfrac23(P_0 - P_2)$, $\sin^2\tfrac\theta2 = \tfrac12(P_0 - P_1)$, $\cos^3\theta = \tfrac15(2P_3 + 3P_1)$.
          - North–south symmetric data: even $\ell$ only. Antisymmetric: odd $\ell$ only.
          - $c_0$ is the area average of the data, $\tfrac12\int_0^\pi V_0\sin\theta\,d\theta$, not the average over $\theta$.
          - Jumps, kinks, $\sin\theta$, $|\cos\theta|$: integrate, $c_\ell = \frac{2\ell+1}{2}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$. For a jump at the equator you need $\int_0^1P_\ell\,dx$: $1, \tfrac12, 0, -\tfrac18, 0, \tfrac{1}{16}$.
          - Check every expansion at both poles, where $P_\ell = 1$ and $(-1)^\ell$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 4: boundary conditions — which terms survive
  // =====================================================================================
  const cosSign = (th) => Math.sign(Math.cos(th * DG));
  FIG.regions = regionsFig().svg;
  FIG.metalField = fieldSetup({});
  FIG.chargedField = fieldSetup({ lab: '\\text{total charge }Q' });
  FIG.sigShell = sph({ sig: cosSign, lab: '\\sigma_0(\\theta)', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 });
  FIG.twoShells = shells({ labA: 'V_a', labB: 'V_b(\\theta)' });
  FIG.grounded = sph({ metal: true, lab: '\\text{grounded}', Rth: 135 });
  FIG.metalQ = sph({ metal: true, lab: '\\text{isolated, charge }Q', Rth: 135 });
  FIG.ptShell = sph({ charge: 'center', lab: 'V_0\\cos\\theta', Rth: 120 });

  const L4 = {
    id: 'u7-bcs', title: 'Boundary conditions: which terms survive',
    steps: [
      RF(md`
        Boundary conditions are where these problems are won or lost. The algebra after them is short. Do the same five steps every time:

        !!method The setup routine
          1. Draw the setup and name the **region** where you want $V$ (inside, outside, between two spheres; two regions if a surface carries charge).
          2. Write the general solution once per region, each with its own coefficients:
             $$V(r,\theta) = \sum_{\ell=0}^{\infty}\left(A_\ell r^\ell + \frac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta)$$
          3. List the **boundary conditions** as a numbered list, the way the lectures do (BC #1, #2, ...).
          4. Next to each, say what it does: it **kills** a family of coefficients, or it **fixes** the ones that are left.
          5. Solve, then check every condition in the final answer.

        ### Translating words into conditions

        | the problem says | the condition | what it does |
        |---|---|---|
        | region contains the center, no charge there | $V$ finite at $r = 0$ | kills every $B_\ell$ |
        | region reaches infinity, charges are localized | $V \to 0$ as $r \to \infty$ | kills every $A_\ell$, including $A_0$ |
        | uniform field $E_0\uv z$ far away | $V \to -E_0 r\cos\theta$ as $r \to \infty$ | kills every $A_\ell$ except $A_1 = -E_0$ |
        | sphere held at $V_0(\theta)$ | $V(R,\theta) = V_0(\theta)$ | fixes the survivors, one $\ell$ at a time |
        | grounded | $V = 0$ on that surface | special case of the line above |
        | metal (conductor) | $V = V_s$, a constant, on its surface | one unknown constant |
        | isolated, carrying charge $Q$ | $V = V_s$ on it, and its total charge is $Q$ | fixes $V_s$; outside, the $1/r$ term is $\dfrac{Q}{4\pi\varepsilon_0 r}$ |
        | neutral (uncharged) | total charge zero | that sphere adds no $1/r$ term |
        | surface charge $\sigma_0(\theta)$ glued on a shell | $V_{\text{in}} = V_{\text{out}}$ at $r = R$, and $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0(\theta)}{\varepsilon_0}$ at $r = R$ | two equations per $\ell$ link the inside $A_\ell$ to the outside $B_\ell$ |

        The last line is the general boundary condition at a charged surface (Unit 2): $V$ is continuous, and $E^\perp = -\partial V/\partial r$ jumps by $\sigma/\varepsilon_0$.

        [[fig:regions]]

        So in practice: **inside** keep $A_\ell r^\ell$; **outside** keep $B_\ell/r^{\ell+1}$; **between two spheres** keep both; **outside in a uniform field** keep $B_\ell/r^{\ell+1}$ plus the single growing term $-E_0r\cos\theta$. The lecture's in-class answers say exactly this: "$V(0,\theta) \ne \infty \Rightarrow B = 0$" (every $B_\ell$) for the inside, and "$V(\infty,\theta) \to 0$, so $A_\ell = 0$" for the outside.
      `, { regions: { svg: FIG.regions, cap: 'Shaded: the region where you want $V$. The region decides which radial powers survive.' } }),

      Q(md`The pictured shell is held at $V_0(\theta)$ and there is no charge inside. You want $V$ **inside**. Which list of boundary conditions is complete and correct?`,
        [md`(1) $V \to 0$ as $r \to \infty$; (2) $V(R,\theta) = V_0(\theta)$`, md`(1) $V(R,\theta) = V_0(\theta)$; (2) $\partial V/\partial r$ jumps by $-\sigma/\varepsilon_0$ at $r = R$`, md`(1) $V$ finite at $r = 0$; (2) $V(R,\theta) = V_0(\theta)$`, md`(1) $V$ finite at $r = 0$; (2) $V \to 0$ as $r \to \infty$`], 2,
        [md`Infinity is not in the region $r \lt R$. That is the condition for the outside problem.`, md`$\sigma$ is not given; it is something you can compute afterwards. And nothing in this list removes the $B_\ell$, which blow up at the center.`, null, md`Nothing here connects the solution to the given $V_0(\theta)$; these two conditions alone give $V = 0$. Infinity is not in the region either.`],
        md`Region: $r \le R$.

        1. $V$ finite at $r = 0$: kills every $B_\ell$.
        2. $V(R,\theta) = V_0(\theta)$: fixes every $A_\ell$ through $A_\ell R^\ell = c_\ell$, the Legendre coefficients of $V_0$.

        Two conditions, and each one has a job. This is the lecture's Example (Griffiths Ex. 3.6).`,
        { figHtml: FIG.inRegion }),

      Q(md`An **uncharged** metal sphere sits in a field that is $E_0\hat{\mathbf z}$ far away. You want $V$ outside. Which list is right?`,
        [md`(1) $V = $ const on $r = R$, and you may choose that constant to be $0$; (2) $V \to -E_0r\cos\theta$ as $r \to \infty$`, md`(1) $V = 0$ on $r = R$; (2) $V \to 0$ as $r \to \infty$`, md`(1) $V$ finite at $r = 0$; (2) $V \to -E_0r\cos\theta$ as $r \to \infty$`, md`(1) $\partial V/\partial r = 0$ on $r = R$; (2) $V \to -E_0r\cos\theta$ as $r \to \infty$`], 0,
        [null, md`The applied field fills all space, so $V$ does not go to zero far away; it grows like $-E_0z$. With $V \to 0$ you would just get $V = 0$ everywhere.`, md`$r = 0$ is inside the metal, not in the region. The metal's interior is simply at the constant $V_s$.`, md`A conductor fixes $V$ (constant), not $\partial V/\partial r$. In fact $-\partial V/\partial r$ at the surface is $\sigma/\varepsilon_0$, which is what you compute at the end.`],
        md`Region: $r \ge R$.

        1. The sphere is a conductor, so $V = V_s$ on $r = R$. By the up–down antisymmetry its potential equals that of the equatorial plane, where $-E_0z = 0$, so $V_s = 0$.
        2. Far away only the applied field is left: $V \to -E_0z = -E_0r\cos\theta$.

        Condition 2 kills every $A_\ell$ except $A_1 = -E_0$; condition 1 then fixes $B_1 = E_0R^3$ (Griffiths Ex. 3.8, two lessons on).`,
        { figHtml: FIG.metalField }),

      Q(md`A thin insulating shell carries a glued surface charge $\sigma_0(\theta)$, and there is no other charge anywhere. You need $V$ everywhere. Which list is right?`,
        [md`(1) $V_{\text{in}}$ finite at $0$; (2) $V_{\text{out}} \to 0$; (3) $V(R,\theta) = \dfrac{\sigma_0(\theta)R}{\varepsilon_0}$`, md`(1) $V_{\text{in}}$ finite at $0$; (2) $V_{\text{out}} \to 0$; (3) $V_{\text{in}} = V_{\text{out}}$ at $r = R$`, md`(1) $V_{\text{in}} = V_{\text{out}}$ at $R$; (2) $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0}{\varepsilon_0}$ at $R$`, md`(1) $V_{\text{in}}$ finite at $0$; (2) $V_{\text{out}} \to 0$; (3) $V_{\text{in}} = V_{\text{out}}$ at $R$; (4) $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0}{\varepsilon_0}$ at $R$`], 3,
        [md`The surface potential is not given and is not $\tfrac{\sigma_0R}{\varepsilon_0}$ in general (that is only the uniform, $\ell = 0$, case). You must let the equations find it.`, md`Nothing in this list involves $\sigma_0$, so the answer would be $V = 0$.`, md`Without the two regularity conditions each region keeps both $A_\ell$ and $B_\ell$: four unknowns per $\ell$, two equations.`, null],
        md`Two regions, so two copies of the general solution.

        1. $V_{\text{in}}$ finite at $r = 0$: kills the $B$'s inside.
        2. $V_{\text{out}} \to 0$: kills the $A$'s outside.
        3. Continuity at $R$: links the inside $A_\ell$ to the outside $B_\ell$ ($B_\ell = A_\ell R^{2\ell+1}$).
        4. The jump: brings in $\sigma_0$ and fixes the size.

        Per $\ell$: two unknowns ($A_\ell$, $B_\ell$), two equations (3 and 4). This is Griffiths Ex. 3.9.`,
        { figHtml: FIG.sigShell }),

      Q(md`An inner sphere (radius $a$) is held at $V_a$ and an outer sphere (radius $b$) at $V_b(\theta)$. You want $V$ in the shaded region $a \lt r \lt b$. Which conditions do you impose?`,
        [md`(1) $V$ finite at $r = 0$; (2) $V(b,\theta) = V_b(\theta)$`, md`(1) $V(a,\theta) = V_a$; (2) $V(b,\theta) = V_b(\theta)$; no other conditions`, md`(1) $V(a,\theta) = V_a$; (2) $V(b,\theta) = V_b(\theta)$; (3) $V$ finite at $0$; (4) $V \to 0$ as $r \to \infty$`, md`(1) $V(a,\theta) = V_a$; (2) $V \to 0$ as $r \to \infty$`], 1,
        [md`$r = 0$ is not in the region; it is inside the inner sphere.`, null, md`Neither $r = 0$ nor $r = \infty$ is in the region. Imposing (3) and (4) would kill every coefficient and you could not match the two spheres.`, md`Infinity is not in the region; the outer sphere's $V_b(\theta)$ is the condition there.`],
        md`Between two spheres both $r^\ell$ and $r^{-(\ell+1)}$ are finite, so nothing is killed. Each $\ell$ has two unknowns, $A_\ell$ and $B_\ell$, and gets two equations, one from each sphere. You solve a $2\times2$ system per $\ell$.`,
        { figHtml: FIG.twoShells }),

      Q(md`For the inside of a hollow, charge-free shell, suppose you kept the term $B_0/r$. What would it mean physically?`,
        [md`Nothing special; $1/r$ is just another solution of Laplace's equation.`, md`A point charge $4\pi\varepsilon_0B_0$ sitting at the center, which is not there; and $V$ would be infinite at the center.`, md`A uniform field inside.`, md`It is fine as long as $A_0$ cancels it.`], 1,
        [md`$\nabla^2(1/r) = -4\pi\delta^3(\vb r)$: it solves Laplace's equation everywhere *except* at the origin, where it requires a point charge.`, null, md`A uniform field is $A_1r\cos\theta$.`, md`A constant cannot cancel a $1/r$ singularity.`],
        md`$B_0/r$ is the potential of a point charge $q = 4\pi\varepsilon_0B_0$ at the origin. The higher $B_\ell/r^{\ell+1}$ are point dipoles, quadrupoles, ... at the origin. With no charge there, every $B_\ell = 0$. Flip side: if a problem **does** put a charge $q$ at the center, you keep exactly $\frac{q}{4\pi\varepsilon_0r}$ inside (Lesson 8).`,
        { figHtml: FIG.inRegion }),

      Q(md`Outside a sphere you impose $V \to 0$ as $r \to \infty$. Which coefficients does that kill?`,
        [md`$A_\ell$ for $\ell \ge 1$; the constant $A_0$ survives.`, md`Every $B_\ell$.`, md`None; it only fixes $B_0$.`, md`Every $A_\ell$, including $A_0$.`], 3,
        [md`A nonzero constant does not go to zero at infinity, so $A_0 = 0$ too.`, md`$B_\ell/r^{\ell+1} \to 0$ at infinity; those are exactly the terms that survive.`, md`It kills all the growing terms. $B_0$ is fixed later by the surface condition.`, null],
        md`Every $r^\ell$ with $\ell \ge 1$ grows, and $r^0 = 1$ stays constant; none of them goes to zero, so all $A_\ell = 0$. Every $r^{-(\ell+1)}$ decays, so all $B_\ell$ survive. The surface condition then fixes them.`,
        { figHtml: FIG.outRegion }),

      Q(md`For the metal sphere in a uniform field, how does the far-field condition $V \to -E_0r\cos\theta$ produce the coefficient $A_1 = -E_0$?`,
        [md`The $B_\ell$ terms must add up to $-E_0r\cos\theta$.`, md`It does not; $A_1$ comes from $V = 0$ on the sphere.`, md`For $r \gg R$ the $B_\ell$ terms die, leaving $\sum A_\ell r^\ell P_\ell = -E_0r\,P_1(\cos\theta)$, so $A_1 = -E_0$ and every other $A_\ell = 0$.`, md`It gives $A_0 = -E_0$.`], 2,
        [md`The $B_\ell$ terms fall off like $r^{-(\ell+1)}$; they cannot produce something that grows like $r$.`, md`$V = 0$ on the sphere only links $B_\ell$ to $A_\ell$ ($B_\ell = -A_\ell R^{2\ell+1}$). The size of $A_1$ must come from somewhere else.`, null, md`$A_0$ is a constant. $-E_0r\cos\theta$ is the $\ell = 1$ term because $\cos\theta = P_1(\cos\theta)$.`],
        md`Match the growing parts at large $r$: $A_0 + A_1r\cos\theta + A_2r^2P_2 + \dots \to -E_0r\cos\theta$. Coefficient by coefficient: $A_1 = -E_0$, all other $A_\ell = 0$ (and $A_0 = 0$ by your choice of the zero of potential). The far-field condition picks out a single $\ell$; the surface condition then fixes the matching $B_1$.`,
        { figHtml: FIG.metalField }),

      Q(md`What does "a **grounded** metal sphere of radius $R$" translate into?`,
        [md`$V(R,\theta) = 0$ for every $\theta$`, md`$\partial V/\partial r = 0$ at $r = R$`, md`$\sigma = 0$ on the sphere`, md`$V \to 0$ as $r \to \infty$, nothing more`], 0,
        [null, md`That would say the field just outside is zero. A grounded sphere usually carries induced charge, so $-\partial V/\partial r = \sigma/\varepsilon_0 \ne 0$.`, md`Grounding lets charge flow on or off precisely so that $V = 0$; the sphere generally ends up charged.`, md`That is a condition at infinity. Grounding is a condition on the sphere.`],
        md`"Grounded" = connected to the reference at $V = 0$, so the whole surface (and the metal inside) is at $V = 0$. The total charge is **not** fixed; it is whatever the outside world induces, and you find it from the $1/r$ term of the answer.`,
        { figHtml: FIG.grounded }),

      Q(md`"An **isolated** metal sphere carrying total charge $Q$." Which conditions does that give for the outside region (nothing else around)?`,
        [md`$V(R,\theta) = 0$ and $V \to 0$ at infinity`, md`$V(R,\theta) = \dfrac{Q}{4\pi\varepsilon_0R^2}$`, md`$V = V_s$ (an unknown constant) on $r = R$, $V \to 0$ at infinity, and total charge $Q$, so the $1/r$ term outside is $\dfrac{Q}{4\pi\varepsilon_0 r}$`, md`$\sigma = \dfrac{Q}{4\pi R^2}$ on the surface, no matter what else is nearby`], 2,
        [md`$V = 0$ is grounded. An isolated sphere keeps its charge $Q$ and lets its potential float.`, md`That expression is the field at the surface, not a potential (wrong units). And $V$ is only required to be constant.`, null, md`Uniform $\sigma$ holds only when the sphere is alone. Put it in a field and the charge rearranges; only the total $Q$ is fixed.`],
        md`A conductor gives $V = V_s$ on its surface, but $V_s$ is unknown. The extra fact "total charge $Q$" fixes it: by Gauss's law the outside solution must contain $\frac{Q}{4\pi\varepsilon_0r}$ as its $\ell = 0$ term. Alone, this gives $V = \frac{Q}{4\pi\varepsilon_0r}$ and $V_s = \frac{Q}{4\pi\varepsilon_0R}$.`,
        { figHtml: FIG.metalQ }),

      Q(md`Why may you put $V = 0$ on the **uncharged** metal sphere in a uniform field, even though nobody said it is grounded?`,
        [md`Because every metal sphere is at zero potential.`, md`It is an equipotential, and by the up–down antisymmetry of the setup it sits at the potential of the equatorial plane, where the applied potential $-E_0z$ is zero.`, md`Because $\vb E = 0$ inside a conductor implies $V = 0$.`, md`Because $V \to 0$ far away.`], 1,
        [md`A metal sphere can be at any potential; a charged one is not at zero.`, null, md`$\vb E = 0$ inside means $V$ is constant inside, not that the constant is zero.`, md`Here $V$ does not go to zero far away; it grows like $-E_0z$.`],
        md`Flip the picture upside down and reverse the field: you get the same physical situation with $V \to -V$. So the potential is odd in $z$, it vanishes on the plane $z = 0$, and that plane cuts the sphere. A grounded sphere would carry no net charge here for the same reason, so "grounded" and "neutral" give the same answer. With net charge $Q$ the sphere would sit at $\frac{Q}{4\pi\varepsilon_0R}$ instead.`,
        { figHtml: FIG.metalField }),

      Q(md`A potential $V_0(\theta)$ is specified on a sphere, with no other charge anywhere. You solve inside and outside separately. What role does the jump condition $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma}{\varepsilon_0}$ play?`,
        [md`It is needed to find the inside coefficients $A_\ell$.`, md`It is needed to find the outside coefficients $B_\ell$.`, md`None; it does not hold for a sphere held at a potential.`, md`It is not an input: both regions are already fixed by $V(R,\theta) = V_0(\theta)$. The jump is an output: it gives the surface charge $\sigma(\theta)$.`], 3,
        [md`The $A_\ell$ come from finiteness at the center plus $V(R,\theta) = V_0(\theta)$.`, md`The $B_\ell$ come from $V \to 0$ plus $V(R,\theta) = V_0(\theta)$.`, md`It holds at every charged surface. Here it tells you what charge sits on the sphere (HW 3.22).`, null],
        md`When $V$ is given on the surface, continuity of $V$ is automatic (both sides equal $V_0$), and each region is solved on its own. The charge that must sit on the sphere to produce that potential then follows from the jump: $\sigma = -\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_{r = R}$.`,
        { figHtml: sph({ lab: 'V_0(\\theta)\\ \\text{given}', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 }) }),

      Q(md`For the inside of a shell held at $k\sin^2(\theta/2)$, a student proposes $V = \dfrac k2\left(1 - \dfrac{R^2}{r^2}\cos\theta\right)$. It satisfies Laplace's equation and equals $k\sin^2(\theta/2)$ at $r = R$. Which condition does it break?`,
        [md`$V$ finite at $r = 0$`, md`$V(R,\theta) = V_0(\theta)$`, md`Laplace's equation`, md`$V \to 0$ as $r \to \infty$`], 0,
        [null, md`At $r = R$ it gives $\frac k2(1 - \cos\theta) = k\sin^2(\theta/2)$. That one is fine.`, md`$\cos\theta/r^2$ is the $\ell = 1$ decaying solution, so it is harmonic (away from $r = 0$).`, md`Infinity is not in the inside region, so this condition does not apply.`],
        md`It used the outside-type term $\dfrac{R^2\cos\theta}{r^2}$ inside, which blows up at the center. The inside version is $\frac{r}{R}\cos\theta$: $V = \frac k2\left(1 - \frac rR\cos\theta\right)$. When a candidate answer passes some checks, run through **every** numbered condition.`,
        { figHtml: sph({ lab: 'V_0=k\\sin^2(\\theta/2)', inLab: 'V(r,\\theta)' }) }),

      Q(md`For the outside of a sphere held at $V_0\cos\theta$, a student proposes $V = V_0\dfrac{r}{R}\cos\theta$. Which statement is true?`,
        [md`It does not match $V_0\cos\theta$ at $r = R$.`, md`It is not a solution of Laplace's equation.`, md`It does not go to zero far away, so it is wrong outside.`, md`It is not finite at $r = 0$.`], 2,
        [md`At $r = R$ it gives exactly $V_0\cos\theta$.`, md`$r\cos\theta = z$ is harmonic.`, null, md`$r = 0$ is not in the outside region (and the expression is finite there anyway).`],
        md`$V_0\frac rR\cos\theta$ grows without bound: it is the **inside** answer. Outside, the $\ell = 1$ term must be $B_1\frac{\cos\theta}{r^2}$, and matching at $R$ gives $V = V_0\frac{R^2}{r^2}\cos\theta$.`,
        { figHtml: FIG.outRegion }),

      Q(md`In the glued-charge problem, how many equations fix $A_\ell$ (inside) and $B_\ell$ (outside) for one value of $\ell$, and where do they come from?`,
        [md`One, from continuity of $V$`, md`Two: continuity of $V$ at $R$ and the jump in $\partial V/\partial r$ at $R$`, md`Two: finiteness at $r = 0$ and $V \to 0$ at infinity`, md`Four, one per boundary condition`], 1,
        [md`One equation cannot fix two unknowns.`, null, md`Those two were used up deciding *which* coefficients exist (no $B$ inside, no $A$ outside). They say nothing about their sizes.`, md`There are four conditions in total, but two only kill coefficients. Per $\ell$, two equations remain for two unknowns.`],
        md`Per $\ell$: continuity gives $A_\ell R^\ell = B_\ell/R^{\ell+1}$, and the jump gives $(\ell+1)\frac{B_\ell}{R^{\ell+2}} + \ell A_\ell R^{\ell-1} = \frac{s_\ell}{\varepsilon_0}$, where $s_\ell$ is the $\ell$-th Legendre coefficient of $\sigma_0(\theta)$. Two linear equations, two unknowns.`,
        { figHtml: FIG.sigShell }),

      RF(md`
        ### What each surviving term is

        **Outside** (only $B_\ell$):
        - $\ell = 0$: $B_0/r$, the potential of a point charge at the center: the **monopole**. Gauss's law on a big sphere gives total charge $Q = 4\pi\varepsilon_0B_0$.
        - $\ell = 1$: $\dfrac{B_1\cos\theta}{r^2}$, a **dipole** $p = 4\pi\varepsilon_0B_1$ pointing along $+z$ (compare $\frac{p\cos\theta}{4\pi\varepsilon_0r^2}$).
        - $\ell = 2$: $\dfrac{B_2P_2(\cos\theta)}{r^3}$, a **quadrupole**; each higher $\ell$ falls one power faster. Far away, the lowest $\ell$ with $B_\ell \ne 0$ dominates. (Unit 8 develops this into the multipole expansion.)

        **Inside** (only $A_\ell$):
        - $\ell = 0$: the constant $A_0$, which is the potential at the center. It equals the average of $V$ over the sphere (the mean-value property of Unit 4).
        - $\ell = 1$: $A_1r\cos\theta = A_1z$, a **uniform field** $\vb E = -A_1\uv z$.
        - $\ell = 2$: $A_2r^2P_2(\cos\theta) = A_2\left(z^2 - \tfrac{x^2+y^2}{2}\right)$, a saddle. Higher $\ell$ are steeper saddles that die quickly toward the center, like $(r/R)^\ell$.

        Two consequences you can use without solving anything: **the potential at the center is the average of the surface potential**, and **far away a sphere looks like a point charge $Q = 4\pi\varepsilon_0B_0$**.
      `),

      Q(md`Outside a sphere, far away, $V \approx B_0/r$. What is the total charge on (and inside) the sphere?`,
        [md`$4\pi\varepsilon_0B_0$`, md`$B_0$`, md`$\dfrac{B_0}{4\pi\varepsilon_0}$`, md`$4\pi\varepsilon_0B_0R$`], 0,
        [null, md`$B_0$ has units of volts times meters, not coulombs.`, md`Inverted: $V = \frac{Q}{4\pi\varepsilon_0r}$ means $B_0 = \frac{Q}{4\pi\varepsilon_0}$, so $Q = 4\pi\varepsilon_0B_0$.`, md`An extra factor of $R$: wrong units.`],
        md`Compare $\frac{B_0}{r}$ with $\frac{Q}{4\pi\varepsilon_0r}$: $Q = 4\pi\varepsilon_0B_0$. The dipole and higher terms carry no net charge (their flux through a big sphere is zero), so only $B_0$ counts. This is the standard far-field check.`,
        { figHtml: FIG.outRegion }),

      Q(md`Inside a charge-free sphere, the $\ell = 1$ term is $A_1r\cos\theta$. What field does it describe?`,
        [md`A radial field growing like $r$`, md`A dipole field`, md`No field: it averages to zero`, md`A uniform field $\vb E = -A_1\uv z$`], 3,
        [md`$r\cos\theta = z$, so the field is $-\nabla(A_1z)$, constant in magnitude and direction.`, md`The dipole field is the *outside* $\ell = 1$ term, $\cos\theta/r^2$.`, md`It averages to zero over the sphere, which is why it does not change the center potential, but its gradient is not zero.`, null],
        md`$A_1r\cos\theta = A_1z$, so $\vb E = -\nabla V = -A_1\uv z$: uniform. Any problem whose inside answer is "constant plus $\ell = 1$" has a uniform field inside. You will see this for a shell at $V_0\cos\theta$ and for a shell with $\sigma \propto\cos\theta$.`,
        { figHtml: FIG.inRegion }),

      Q(md`Inside a charge-free sphere, what is $A_0$?`,
        [md`The potential at the north pole`, md`Always zero`, md`The potential at the center, which equals the average of $V$ over the sphere`, md`The total charge divided by $4\pi\varepsilon_0R$`], 2,
        [md`At the north pole every $P_\ell = 1$, so the north-pole value is $\sum_\ell A_\ell R^\ell$, not $A_0$.`, md`Only if the surface average is zero.`, null, md`That is the surface potential of a uniformly charged sphere; in general $A_0$ is the surface average of $V$.`],
        md`At $r = 0$ every term with $\ell \ge 1$ vanishes ($r^\ell \to 0$), leaving $V(0) = A_0$. And $A_0 = \frac12\int_0^\pi V(R,\theta)\sin\theta\,d\theta$ is the area average. This is the mean-value theorem for harmonic functions, read off the series.`,
        { figHtml: FIG.inRegion }),

      Q(md`Far from a sphere, which term of the outside series dominates?`,
        [md`The term with the largest coefficient $B_\ell$`, md`Always $B_0/r$`, md`The lowest $\ell$ whose $B_\ell$ is nonzero`, md`The highest $\ell$ present`], 2,
        [md`Coefficients have different units; what matters at large $r$ is the power $r^{-(\ell+1)}$.`, md`Only if $B_0 \ne 0$. A neutral object has $B_0 = 0$ and looks like a dipole (or higher) far away.`, null, md`Higher $\ell$ fall off faster.`],
        md`$B_\ell/r^{\ell+1}$: each higher $\ell$ loses one more power of $r$. Far away the lowest nonzero $\ell$ wins: a charged object looks like a point charge, a neutral one like a dipole, and so on.`,
        { figHtml: FIG.outRegion }),

      P({
        title: 'Set up, don\'t solve',
        q: md`For each pictured setup, identify the boundary conditions and the form of the solution **before** doing any algebra.

        (a) A sphere whose northern hemisphere is held at $V_0$ and southern hemisphere is grounded; you want $V$ **outside**.
        (b) An isolated metal sphere with total charge $Q$ in a field that is $E_0\hat{\mathbf z}$ far away; you want $V$ outside.
        (c) A point charge $q$ at the center of a thin shell held at $V_0\cos\theta$; you want $V$ **inside**.`,
        figHtml: PF.row([
          { svg: hemis({ top: 'V_0', bot: 'V=0', botThin: true }), cap: '(a)' },
          { svg: FIG.chargedField, cap: '(b)' },
          { svg: FIG.ptShell, cap: '(c)' },
        ]).svg,
        hints: [
          md`For each one: what is the region? Does it contain $r = 0$? Does it reach $r = \infty$, and what does $V$ do there?`,
          md`(b): the far-field condition supplies one growing term; the total charge supplies the $1/r$ term.`,
          md`(c): the region contains $r = 0$, but now there IS a charge there. Superpose its potential with a charge-free solution.`,
        ],
        parts: [
          { lbl: md`(a) Which form does $V$ take outside?`, mc: [md`$\sum_\ell A_\ell r^\ell P_\ell(\cos\theta)$`, md`$\sum_\ell \dfrac{B_\ell}{r^{\ell+1}}P_\ell(\cos\theta)$, with $\dfrac{B_\ell}{R^{\ell+1}}$ equal to the Legendre coefficients of the data`, md`$\sum_\ell \left(A_\ell r^\ell + \dfrac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta)$ with all coefficients free`], a: 1,
            why: [md`That is the inside form; $r^\ell$ is not allowed when $V \to 0$ at infinity.`, null, md`$V \to 0$ at infinity kills every $A_\ell$; only one surface condition is available, which fixes the $B_\ell$.`] },
          { lbl: md`(b) Which list of conditions is right?`, mc: [md`(1) $V = V_s$ on $r = R$; (2) $V \to -E_0r\cos\theta + (\text{const})$ far away; (3) the $1/r$ term outside is $\dfrac{Q}{4\pi\varepsilon_0r}$`, md`(1) $V = 0$ on $r = R$; (2) $V \to -E_0r\cos\theta$`, md`(1) $V = V_s$ on $r = R$; (2) $V \to 0$ far away`], a: 0,
            why: [null, md`That is the neutral (or grounded) sphere. With charge $Q$ the sphere's potential floats to a nonzero value and there is a $1/r$ term.`, md`The applied field does not vanish far away.`] },
          { lbl: md`(b) The coefficient of $1/r$ in $V$ outside`, expr: 'Q/(4*pi*eps0)', vars: { Q: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(c) Which form does $V$ take inside?`, mc: [md`$\sum_\ell A_\ell r^\ell P_\ell(\cos\theta)$ only`, md`$\sum_\ell \dfrac{B_\ell}{r^{\ell+1}}P_\ell(\cos\theta)$`, md`$\dfrac{q}{4\pi\varepsilon_0r} + \sum_\ell A_\ell r^\ell P_\ell(\cos\theta)$`], a: 2,
            why: [md`This misses the point charge: near the center $V$ must look like $\frac{q}{4\pi\varepsilon_0r}$.`, md`The higher $B_\ell/r^{\ell+1}$ would be point dipoles and quadrupoles at the center; only the monopole is there.`, null] },
        ],
        sol: md`
          **(a)** Region $r \ge R$.
          1. $V \to 0$ as $r \to \infty$: kills every $A_\ell$.
          2. $V(R,\theta) = V_0(\theta)$ (the hemisphere data): fixes $B_\ell = c_\ell R^{\ell+1}$, where $c_\ell$ are the Legendre coefficients from Lesson 3: $c_0 = \tfrac12V_0$, $c_1 = \tfrac34V_0$, $c_3 = -\tfrac{7}{16}V_0$, ...

          So $V = \sum_\ell c_\ell\left(\frac Rr\right)^{\ell+1}P_\ell(\cos\theta)$.

          **(b)** Region $r \ge R$.
          1. $V = V_s$ (unknown constant) on $r = R$.
          2. $V \to -E_0r\cos\theta$ far away (choosing the constant so the equatorial plane is at zero far from the sphere): kills every $A_\ell$ except $A_1 = -E_0$.
          3. Total charge $Q$: the $\ell = 0$ term outside is $\frac{Q}{4\pi\varepsilon_0r}$, i.e. $B_0 = \frac{Q}{4\pi\varepsilon_0}$.

          Condition 1 then gives $B_1 = E_0R^3$ and $V_s = \frac{Q}{4\pi\varepsilon_0R}$. (Solved in Lesson 6.)

          **(c)** Region $r \le R$, with a point charge at $r = 0$.
          1. Near $r = 0$, $V \to \frac{q}{4\pi\varepsilon_0r}$ (the only singularity allowed is the real charge): keep that term, kill all other $B_\ell$.
          2. $V(R,\theta) = V_0\cos\theta$: fixes the $A_\ell$. Since $\frac{q}{4\pi\varepsilon_0R}$ is a constant on the sphere, $A_0 = -\frac{q}{4\pi\varepsilon_0R}$ and $A_1 = V_0/R$.

          **What to remember:** decide the region first; the region decides which terms exist; the surfaces decide their sizes.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Always: region, general solution per region, numbered boundary conditions, what each one does, solve, check.
          - $V$ finite at $r = 0$ kills every $B_\ell$. $V \to 0$ at infinity kills every $A_\ell$ (including $A_0$). A uniform field far away kills every $A_\ell$ except $A_1 = -E_0$.
          - Given $V$ on a sphere: match term by term. Charge glued on a shell: continuity of $V$ plus the jump $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{\sigma_0}{\varepsilon_0}$.
          - Grounded: $V = 0$. Conductor: $V = $ const. Isolated with charge $Q$: $V = $ const and a $\frac{Q}{4\pi\varepsilon_0r}$ term outside. Neutral: no $1/r$ term from that sphere.
          - Between two spheres nothing is killed: two surface conditions per $\ell$.
          - Free checks: $V(\text{center}) = A_0$ = surface average; far away $V \to \frac{Q}{4\pi\varepsilon_0r}$ with $Q = 4\pi\varepsilon_0B_0$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 5: a sphere with a given surface potential (Lecture 13 example = Griffiths Ex. 3.6, 3.7)
  // =====================================================================================
  FIG.lecIn = sph({ lab: 'V_0(\\theta)=k\\sin^2(\\theta/2)', inLab: 'V(r,\\theta)' });
  FIG.lecOut = sph({ lab: 'V_0(\\theta)=k\\sin^2(\\theta/2)', outLab: 'V(r,\\theta)=?', outX: -70, outY: 70 });
  FIG.lecBoth = sph({ lab: 'V_0(\\theta)=k\\sin^2(\\theta/2)', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 });
  const lecAxis = (u) => (Math.abs(u) <= 1 ? 0.5 * (1 - u) : u > 0 ? 0.5 * (1 / u - 1 / (u * u)) : 0.5 * (-1 / u + 1 / (u * u)));
  FIG.lecPlot = PF.plot({ w: 340, h: 200, x: [-3, 3], y: [0, 1.1], xl: 'z', yl: 'V/k',
    xt: [[-1, '-R'], [1, 'R'], [2, '2R']], yt: [[1, '1'], [0.5, '\\tfrac12']], curves: [{ f: lecAxis, n: 600 }] });
  FIG.capSph = hemis({ cap: 60, top: 'V_0', bot: 'V=0', botThin: true, topTh: 30, mark: { th: 60, lab: '60^\\circ' } });
  const ax13 = (u) => (Math.abs(u) <= 1 ? 1 + 3 * u : u > 0 ? 1 / u + 3 / (u * u) : -1 / u - 3 / (u * u));
  FIG.ax13 = PF.plot({ w: 340, h: 210, x: [-4, 4], y: [-2.4, 4.4], zero: true, xl: 'z/R', yl: 'V/V_0',
    xt: [[-3, '-3'], [-1, '-1'], [1, '1']], yt: [[4, '4'], [1, '1'], [-2, '-2']], curves: [{ f: ax13, n: 800 }] });
  const hemExact = (u) => (Math.abs(u) < 1e-6 ? 1.5 * u : (1 / u) * (1 - (1 - u * u) / Math.sqrt(1 + u * u)));
  FIG.hemAxis = PF.plot({ w: 330, h: 200, x: [-1, 1], y: [-1.15, 1.15], zero: true, xl: 'z/R', yl: 'V/V_0',
    xt: [[-1, '-1'], [0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: hemExact }, { f: (u) => 1.5 * u - 0.875 * u ** 3, cls: 'dash' }] });

  const L5 = {
    id: 'u7-shell-V', title: 'A sphere with a given potential (inside and outside)',
    steps: [
      RF(md`
        ### The lecture's example (Griffiths Ex. 3.6): the potential inside

        *A spherical shell of radius $R$ is held at a fixed potential $V_0(\theta)$. Find the potential inside.*

        [[fig:setup]]

        **Region:** $0 \le r \le R$, no charge. **Boundary conditions** (the lecture's in-class answer):

        1. $V(0,\theta) \ne \infty$: kills every $B_\ell$.
        2. $V(R,\theta) = V_0(\theta)$: fixes the $A_\ell$.

        After BC 1, $V(r,\theta) = \sum_\ell A_\ell r^\ell P_\ell(\cos\theta)$. BC 2 says

        $$\sum_\ell A_\ell R^\ell P_\ell(\cos\theta) = V_0(\theta)$$

        **Fourier's trick.** Multiply both sides by $P_{\ell'}(\cos\theta)\sin\theta$ and integrate from $0$ to $\pi$. Orthogonality leaves one term:

        $$\int_0^\pi V_0(\theta)P_{\ell'}(\cos\theta)\sin\theta\,d\theta = \sum_\ell A_\ell R^\ell\,\frac{2}{2\ell+1}\,\delta_{\ell\ell'} = A_{\ell'}R^{\ell'}\,\frac{2}{2\ell'+1}$$

        $$\boxed{A_\ell = \frac{2\ell+1}{2R^\ell}\int_0^\pi V_0(\theta)\,P_\ell(\cos\theta)\,\sin\theta\,d\theta}$$

        **The lecture's boundary data:** $V_0(\theta) = k\sin^2(\theta/2)$. By the half-angle formula,

        $$k\sin^2\frac\theta2 = \frac k2\left(1 - \cos\theta\right) = \frac k2\left[P_0(\cos\theta) - P_1(\cos\theta)\right]$$

        The lecture does $A_0$ by the integral: $A_0 = \frac12\int_0^\pi\frac k2\left[P_0 - P_1\right]P_0\sin\theta\,d\theta = \frac12\cdot\frac k2\cdot2 = \frac k2$ (only the $P_0P_0$ piece survives). Likewise $A_1 = \frac{3}{2R}\cdot\frac k2\cdot\left(-\frac23\right) = -\frac{k}{2R}$, and every other $A_\ell = 0$ because $P_\ell$ is orthogonal to both $P_0$ and $P_1$. Faster, by eye: match $A_0R^0 = \frac k2$ and $A_1R = -\frac k2$. Either way:

        $$V(r,\theta) = \frac k2\left(1 - \frac rR\cos\theta\right) \qquad (r \le R)$$

        **Check the BCs.** (1) No negative powers of $r$: finite at the center. (2) At $r = R$: $\frac k2(1 - \cos\theta) = k\sin^2\frac\theta2$. Both hold.

        **Read the answer.** $r\cos\theta = z$, so $V = \frac k2\left(1 - \frac zR\right)$: linear in $z$. The equipotentials inside are horizontal planes and the field is uniform, $\vb E = -\nabla V = \frac{k}{2R}\uv z$, pointing from the high-potential south ($V = k$) to the grounded north pole. The center is at $\frac k2$, the average of $V_0$ over the sphere.

        !!intuition Why the answer was linear
          On the sphere, $k\sin^2\frac\theta2 = \frac k2\left(1 - \frac zR\right)$ is already a linear function of $z$, and a linear function solves Laplace's equation. By uniqueness, the same linear function is the answer everywhere inside. Whenever the boundary data are the surface values of a simple harmonic function ($1$, $z$, $z^2 - \tfrac12(x^2+y^2)$, ...), that function is the inside solution.
      `, { setup: { svg: FIG.lecIn, cap: 'Lecture 13: a spherical shell held at $V_0(\\theta)$; find $V$ inside. The $z$ axis is the symmetry axis.' } }),

      Q(md`For the lecture's sphere, $V_0(\theta) = k\sin^2(\theta/2)$, what is the potential at the center?`,
        [md`$0$`, md`$k$`, md`$\dfrac k2$`, md`$\dfrac{k}{4}$`], 2,
        [md`$0$ is the north-pole value. The center sees the whole sphere.`, md`$k$ is the south-pole value.`, null, md`That is half the right value, as if an extra $\tfrac12$ slipped into $A_0 = \tfrac12\int_0^\pi V_0\sin\theta\,d\theta$. The area average of $\frac k2(1 - \cos\theta)$ is $\frac k2$, since $\cos\theta$ averages to zero over the surface.`],
        md`$V(0) = A_0 = \frac k2$. Physically, the potential at the center of a charge-free sphere is the average of the potential over its surface (mean-value theorem). Here the $\cos\theta$ part averages to zero, leaving $\frac k2$.`,
        { figHtml: FIG.lecIn }),

      Q(md`For the same sphere, what do the equipotential surfaces look like **inside**?`,
        [md`Concentric spheres`, md`Horizontal planes, $z = $ const`, md`Cones $\theta = $ const`, md`Vertical planes through the $z$ axis`], 1,
        [md`Concentric spheres would mean $V = V(r)$ only; that is the $\ell = 0$ case.`, null, md`Cones would mean $V$ depends on $\theta$ only, but $V_{\text{in}}$ depends on $r\cos\theta$.`, md`Azimuthal symmetry rules out any dependence on $\phi$, and these planes would need it.`],
        md`$V_{\text{in}} = \frac k2\left(1 - \frac zR\right)$ depends only on $z$, so equipotentials are planes $z = $ const, and the field is uniform. Any "constant plus $\ell = 1$" inside solution looks like this.`,
        { figHtml: FIG.lecIn }),

      Q(md`Inside the same sphere, which way does $\vb E$ point?`,
        [md`$-\uv z$, from the north pole down to the south pole`, md`Radially outward`, md`Radially inward`, md`$+\uv z$, from the south pole up toward the north pole`], 3,
        [md`$\vb E$ points from high to low potential. The south pole is at $k$, the north pole at $0$, so $\vb E$ points north.`, md`The inside field is uniform, not radial: $V$ depends only on $z$.`, md`Same: no radial dependence in $V_{\text{in}} = \frac k2(1 - z/R)$.`, null],
        md`$\vb E = -\nabla\left[\frac k2\left(1 - \frac zR\right)\right] = +\frac{k}{2R}\uv z$. The field runs from the hot south pole ($V = k$) to the grounded north pole ($V = 0$), with magnitude $\frac{k}{2R}$: the potential difference $k$ across a distance $2R$.`,
        { figHtml: FIG.lecIn }),

      RF(md`
        ### Outside (Griffiths Ex. 3.7)

        *Same sphere; now find $V$ outside, assuming no charge there.*

        **Region:** $r \ge R$. **Boundary conditions:**

        1. $V(\infty,\theta) \to 0$: kills every $A_\ell$ (lecture: "so $A_\ell = 0$").
        2. $V(R,\theta) = V_0(\theta)$: fixes the $B_\ell$.

        After BC 1, $V = \sum_\ell \frac{B_\ell}{r^{\ell+1}}P_\ell(\cos\theta)$, and BC 2 is $\sum_\ell\frac{B_\ell}{R^{\ell+1}}P_\ell(\cos\theta) = V_0(\theta)$. The same Fourier trick gives

        $$\boxed{B_\ell = \frac{2\ell+1}{2}\,R^{\ell+1}\int_0^\pi V_0(\theta)\,P_\ell(\cos\theta)\,\sin\theta\,d\theta}$$

        For $V_0 = \frac k2(P_0 - P_1)$: $\frac{B_0}{R} = \frac k2$ and $\frac{B_1}{R^2} = -\frac k2$, so

        $$V(r,\theta) = \frac k2\left(\frac Rr - \frac{R^2}{r^2}\cos\theta\right) \qquad (r \ge R)$$

        **Check:** decays at infinity; at $r = R$ it gives $\frac k2(1 - \cos\theta)$.

        [[fig:axis]]

        ### One formula for both

        Write the boundary data once as $V_0(\theta) = \sum_\ell c_\ell P_\ell(\cos\theta)$ (by eye or by the integral). Then

        $$V_{\text{in}} = \sum_\ell c_\ell\left(\frac rR\right)^{\ell}P_\ell(\cos\theta), \qquad V_{\text{out}} = \sum_\ell c_\ell\left(\frac Rr\right)^{\ell+1}P_\ell(\cos\theta)$$

        Each term is pinned to its surface value and decays away from the sphere: inward like $(r/R)^\ell$, outward like $(R/r)^{\ell+1}$. Equivalently $A_\ell = c_\ell/R^\ell$, $B_\ell = c_\ell R^{\ell+1}$, so $B_\ell = A_\ell R^{2\ell+1}$.

        Two free checks:
        - **Center:** $V(0) = c_0 = \frac12\int_0^\pi V_0\sin\theta\,d\theta$, the surface average (mean-value theorem, Unit 4).
        - **Far away:** $V \approx \frac{c_0R}{r}$, so the sphere carries total charge $Q = 4\pi\varepsilon_0Rc_0$. For the lecture's sphere, $Q = 4\pi\varepsilon_0R\cdot\frac k2 = 2\pi\varepsilon_0kR$.
      `, { axis: { svg: FIG.lecPlot, cap: 'The lecture\'s sphere: $V$ along the $z$ axis. Inside it is linear; on the $+z$ axis outside it rises from $0$ to a maximum $k/8$ at $z = 2R$ and then decays; on the $-z$ axis it falls from $k$.' } }),

      WG.sphere({ bc: 'sin2h', n: 1 }),

      Q(md`Far from the lecture's sphere, what is $V$ to leading order?`,
        [md`$\dfrac{kR}{2r}$`, md`$-\dfrac{kR^2}{2r^2}\cos\theta$`, md`$\dfrac k2$`, md`$0$ at every order`], 0,
        [null, md`That is the dipole term. It falls off faster than the monopole term, which is not zero here.`, md`A constant would violate $V \to 0$ at infinity.`, md`The sphere carries net charge, so the $1/r$ term is there.`],
        md`$V_{\text{out}} = \frac k2\left(\frac Rr - \frac{R^2}{r^2}\cos\theta\right)$; for $r \gg R$ the $1/r$ term wins: $V \approx \frac{kR}{2r}$, a point charge $Q = 2\pi\varepsilon_0kR$ at the center.`,
        { figHtml: FIG.lecOut }),

      Q(md`On the $+z$ axis outside the lecture's sphere, $V(z) = \dfrac k2\left(\dfrac Rz - \dfrac{R^2}{z^2}\right)$. Where is it largest?`,
        [md`At $z = R$, on the sphere`, md`At $z = 2R$, where $V = k/8$`, md`At infinity`, md`It is negative everywhere on the $+z$ axis`], 1,
        [md`At $z = R$ it is $0$ (the north pole is at $0$).`, null, md`It goes to zero at infinity.`, md`$\frac Rz \gt \frac{R^2}{z^2}$ for $z \gt R$, so it is positive.`],
        md`$\frac{dV}{dz} = \frac k2\left(-\frac{R}{z^2} + \frac{2R^2}{z^3}\right) = 0$ at $z = 2R$, where $V = \frac k2\left(\frac12 - \frac14\right) = \frac k8$. Near the grounded pole the dipole term (negative on $+z$) cancels the monopole; far away the monopole wins. The plot in the reading shows it.`,
        { figHtml: FIG.lecOut }),

      Q(md`If the lecture's sphere were held at $k\cos^2(\theta/2)$ instead, what would $V$ inside be?`,
        [md`$\dfrac k2\left(1 - \dfrac rR\cos\theta\right)$`, md`$k\left(1 + \dfrac rR\cos\theta\right)$`, md`$\dfrac k2\left(1 + \dfrac{R^2}{r^2}\cos\theta\right)$`, md`$\dfrac k2\left(1 + \dfrac rR\cos\theta\right)$`], 3,
        [md`That is the original problem. $\cos^2(\theta/2)$ is the mirror image, hot at the north pole.`, md`$\cos^2(\theta/2) = \frac12(1 + \cos\theta)$: the factor $\frac12$ is missing; at the north pole this gives $2k$.`, md`$R^2/r^2$ is the outside dependence; it blows up at the center.`, null],
        md`$k\cos^2\frac\theta2 = \frac k2(P_0 + P_1)$, so $V_{\text{in}} = \frac k2\left(1 + \frac rR\cos\theta\right)$. Only the sign of the $\ell = 1$ term changes: same center value $\frac k2$, field reversed.`,
        { figHtml: sph({ lab: 'V_0(\\theta)=k\\cos^2(\\theta/2)', inLab: 'V(r,\\theta)' }) }),

      Q(md`A sphere is held at $V_0(\theta)$ whose $\ell = 2$ coefficient is $c_2$. At $r = 2R$ (outside), what is the size of the $\ell = 2$ term relative to its value on the sphere?`,
        [md`$\tfrac14$`, md`$\tfrac12$`, md`$\tfrac18$`, md`$1$`], 2,
        [md`$(1/2)^2$ is the *inside* factor at $r = R/2$: $(r/R)^\ell$. Outside the power is $\ell + 1$.`, md`That would be a $1/r$ fall-off, which is the $\ell = 0$ term.`, null, md`Every $\ell \ge 0$ term decays outside.`],
        md`Outside, the $\ell$ term goes as $c_\ell(R/r)^{\ell+1}$. For $\ell = 2$ at $r = 2R$: $(1/2)^3 = \frac18$. Higher $\ell$ fade faster: from far away the sphere's fine angular structure is invisible, and only the lowest $\ell$ terms matter.`,
        { figHtml: sph({ lab: 'V_0(\\theta)', Pout: { f: 2, th: -50, lab: 'r=2R' } }) }),

      Q(md`For a sphere held at $V_0(\theta)$, how are the outside coefficients $B_\ell$ related to the inside coefficients $A_\ell$?`,
        [md`$B_\ell = A_\ell$`, md`$B_\ell = A_\ell R^{2\ell+1}$`, md`$B_\ell = -A_\ell R^{2\ell+1}$`, md`$B_\ell = A_\ell/R^{2\ell+1}$`], 1,
        [md`They have different units: $A_\ell$ in V/m$^\ell$, $B_\ell$ in V$\cdot$m$^{\ell+1}$.`, null, md`The minus sign belongs to the grounded sphere in a uniform field, where $A_\ell$ and $B_\ell$ live in the same region and must cancel on the sphere.`, md`Inverted. Check $\ell = 0$: $A_0 = c_0$, $B_0 = c_0R$.`],
        md`Both regions match the same data at $r = R$: $A_\ell R^\ell = c_\ell = B_\ell/R^{\ell+1}$, so $B_\ell = A_\ell R^{2\ell+1}$. Here this is a consequence of the given $V_0$; for a charged shell (Ex. 3.9) the same relation comes from continuity of $V$.`,
        { figHtml: FIG.lecBoth }),

      Q(md`A sphere is held at a **constant** potential $V_0$ (a conducting sphere at $V_0$). What do the formulas give?`,
        [md`$V_{\text{in}} = V_0$ and $V_{\text{out}} = \dfrac{V_0R}{r}$`, md`$V_{\text{in}} = \dfrac{V_0r}{R}$ and $V_{\text{out}} = \dfrac{V_0R}{r}$`, md`$V_{\text{in}} = V_0$ and $V_{\text{out}} = V_0$`, md`$V_{\text{in}} = 0$ and $V_{\text{out}} = \dfrac{V_0R}{r}$`], 0,
        [null, md`$\frac{V_0r}{R}$ would be an $\ell = 1$-type radial factor without a $P_1$; for constant data only $\ell = 0$ appears, and $r^0 = 1$.`, md`Outside, $V$ must vanish at infinity.`, md`Inside a conductor at $V_0$ (or inside any sphere held at constant $V_0$ with no charge in it) $V = V_0$.`],
        md`Only $c_0 = V_0$. Inside: $V_0(r/R)^0 = V_0$, constant (no field inside a conductor). Outside: $V_0\frac Rr$, a point charge $Q = 4\pi\varepsilon_0RV_0$, the capacitance $C = 4\pi\varepsilon_0R$ of an isolated sphere. The method reproduces what you already knew, which is the point of this check (Griffiths Prob. 3.18a, 4th ed.).`,
        { figHtml: sph({ lab: 'V_0\\ (\\text{constant})', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 }) }),

      Q(md`The cap $\theta \lt 60^\circ$ of a sphere is held at $V_0$ and the rest of the sphere is grounded. What is $V$ at the center?`,
        [md`$\dfrac{V_0}{3}$ (60° out of 180°)`, md`$\dfrac{V_0}{2}$`, md`$\dfrac{V_0}{4}$`, md`$\dfrac{V_0}{6}$`], 2,
        [md`Fractions of the angle are not fractions of the area. Weight by $\sin\theta$.`, md`The cap is much less than half the sphere.`, null, md`Area fraction $= \frac12(1 - \cos60^\circ) = \frac14$, not $\frac16$.`],
        md`$V(\text{center})$ = area average $= \frac12\int_0^{60^\circ}V_0\sin\theta\,d\theta = \frac{V_0}{2}(1 - \cos60^\circ) = \frac{V_0}{4}$. A polar cap of half-angle $\alpha$ covers the fraction $\frac{1 - \cos\alpha}{2}$ of the sphere. Exam shortcut: the center value is just this weighted average; no series needed.`,
        { figHtml: FIG.capSph }),

      Q(md`What is the total charge on the lecture's sphere (held at $k\sin^2(\theta/2)$, nothing else around)?`,
        [md`$2\pi\varepsilon_0kR$`, md`$0$`, md`$4\pi\varepsilon_0kR$`, md`$\pi\varepsilon_0kR$`], 0,
        [null, md`The average potential is $\frac k2 \ne 0$, so the sphere is charged.`, md`That would be a sphere held entirely at $k$. The average is $\frac k2$.`, md`Off by 2: $Q = 4\pi\varepsilon_0B_0 = 4\pi\varepsilon_0\cdot\frac{kR}{2}$.`],
        md`$B_0 = c_0R = \frac{kR}{2}$ and $Q = 4\pi\varepsilon_0B_0 = 2\pi\varepsilon_0kR$. The $\ell = 1$ part carries no net charge. Shortcut: $Q = 4\pi\varepsilon_0R\times(\text{average surface potential})$.`,
        { figHtml: FIG.lecOut }),

      P({
        title: 'Sphere at V₀ cos θ',
        q: md`A thin spherical shell of radius $R$ is held at $V_0(\theta) = V_0\cos\theta$. There is no other charge. Find (a) $V$ inside, (b) $V$ outside, (c) the $z$ component of $\vb E$ inside, and (d) its direction.`,
        figHtml: sph({ lab: 'V_0(\\theta)=V_0\\cos\\theta', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 }),
        hints: [
          md`Two regions, each with its own pair of boundary conditions. Inside: finite at $r = 0$ and $V(R,\theta) = V_0\cos\theta$. Outside: $V \to 0$ and the same surface value.`,
          md`$V_0\cos\theta = V_0P_1(\cos\theta)$: only $\ell = 1$. No integrals.`,
          md`Inside, $r\cos\theta = z$.`,
        ],
        parts: [
          { lbl: md`(a) $V_{\text{in}}(r,\theta)$`, expr: 'V0*r*cos(theta)/R', vars: { V0: [1, 3], r: [0.2, 1], R: [1, 2], theta: [0, 3] } },
          { lbl: md`(b) $V_{\text{out}}(r,\theta)$`, expr: 'V0*R^2*cos(theta)/r^2', vars: { V0: [1, 3], r: [2, 4], R: [1, 2], theta: [0, 3] } },
          { lbl: md`(c) $E_z$ inside`, expr: '-V0/R', vars: { V0: [1, 3], R: [1, 2] } },
          { lbl: md`(d) The field inside points`, mc: [md`along $-\hat{\mathbf z}$, from the north pole ($+V_0$) to the south pole ($-V_0$)`, md`along $+\hat{\mathbf z}$`, md`radially outward`, md`nowhere: it is zero`], a: 0,
            why: [null, md`$\vb E$ points from high to low potential; the north pole is at $+V_0$.`, md`$V_{\text{in}} = \frac{V_0z}{R}$ depends on $z$ only, so the field is uniform, not radial.`, md`The potential varies inside ($\frac{V_0z}{R}$), so the field is not zero. Only a sphere at constant potential has zero field inside.`] },
        ],
        sol: md`
          **Inside.** Region $r \le R$.
          1. $V$ finite at $r = 0$: no $B_\ell$.
          2. $V(R,\theta) = V_0\cos\theta = V_0P_1$: only $A_1R = V_0$.

          $$V_{\text{in}} = V_0\frac rR\cos\theta = \frac{V_0}{R}z$$

          **Outside.** Region $r \ge R$.
          1. $V \to 0$: no $A_\ell$.
          2. $V(R,\theta) = V_0\cos\theta$: only $B_1/R^2 = V_0$.

          $$V_{\text{out}} = V_0\frac{R^2}{r^2}\cos\theta$$

          **Field inside:** $\vb E = -\nabla\left(\frac{V_0}{R}z\right) = -\frac{V_0}{R}\uv z$: uniform, magnitude $V_0/R$, pointing from the $+V_0$ pole to the $-V_0$ pole (potential drop $2V_0$ over a distance $2R$).

          [[fig:fld]]

          **Checks.** Both match $V_0\cos\theta$ at $r = R$. Center: $V = 0$ = average of $\cos\theta$. Outside it is a pure dipole, $p = 4\pi\varepsilon_0B_1 = 4\pi\varepsilon_0V_0R^2$ along $+z$, and no net charge (average zero).

          **What to remember:** "$\ell = 1$ only" means a uniform field inside and a pure dipole outside. You will meet this pair again in the metal sphere in a uniform field and in the shell with $\sigma \propto\cos\theta$.
        `,
        figs: { fld: { svg: dipoleShell(), cap: 'Field lines: uniform inside (pointing $-z$), a pure dipole outside. The $\\pm$ signs show where the shell must carry charge to hold this potential (Lesson 7).' } },
      }),

      P({
        title: 'Sphere at V₀ cos² θ',
        q: md`A shell of radius $R$ is held at $V_0(\theta) = V_0\cos^2\theta$, with no other charge. Find the potential at the center, the potential inside at $r = R/2$ on the $+z$ axis, the far-field coefficient $\alpha$ in $V \approx \alpha\dfrac{V_0R}{r}$, and $V$ outside.`,
        figHtml: sph({ lab: 'V_0(\\theta)=V_0\\cos^2\\theta', Pin: { f: 0.5, th: 0.01, at: 'l' }, inLab: 'V_{\\text{in}}', inX: -14 }),
        hints: [
          md`Expand first: $\cos^2\theta = \tfrac13P_0 + \tfrac23P_2$.`,
          md`Inside: $V = \tfrac{V_0}{3} + \tfrac{2V_0}{3}\left(\tfrac rR\right)^2P_2(\cos\theta)$. On the $+z$ axis, $P_2 = 1$.`,
          md`Outside: each term picks up $(R/r)^{\ell+1}$ instead.`,
        ],
        parts: [
          { lbl: md`$V(\text{center})/V_0$`, ans: 1 / 3 },
          { lbl: md`$V(r = R/2,\ \theta = 0)/V_0$`, ans: 0.5 },
          { lbl: md`$\alpha$`, ans: 1 / 3 },
          { lbl: md`$V_{\text{out}}(r,\theta)$`, expr: 'V0*R/(3*r) + V0*R^3*(3*cos(theta)^2 - 1)/(3*r^3)', vars: { V0: [1, 3], r: [2, 4], R: [1, 2], theta: [0, 3] }, accepts: ['V0/3*(R/r) + (2*V0/3)*(R/r)^3*(3*cos(theta)^2-1)/2'] },
        ],
        sol: md`
          **Expand the data:** $V_0\cos^2\theta = \frac{V_0}{3}P_0 + \frac{2V_0}{3}P_2$, so $c_0 = \frac{V_0}{3}$, $c_2 = \frac{2V_0}{3}$.

          **Inside**, region $r \le R$. Boundary conditions:
          1. $V$ finite at $r = 0$: kills every $B_\ell$.
          2. $V(R,\theta) = V_0\cos^2\theta$: $A_\ell R^\ell = c_\ell$.

          $$V_{\text{in}} = \frac{V_0}{3} + \frac{2V_0}{3}\frac{r^2}{R^2}P_2(\cos\theta)$$

          Center: $\frac{V_0}{3}$ (the area average of $\cos^2\theta$ is $\frac13$). At $r = R/2$ on the $+z$ axis ($P_2 = 1$): $\frac{V_0}{3} + \frac{2V_0}{3}\cdot\frac14 = \frac{V_0}{2}$.

          **Outside**, region $r \ge R$. Boundary conditions:
          1. $V \to 0$ as $r \to \infty$: kills every $A_\ell$.
          2. $V(R,\theta) = V_0\cos^2\theta$: $B_\ell/R^{\ell+1} = c_\ell$.

          $$V_{\text{out}} = \frac{V_0}{3}\frac Rr + \frac{2V_0}{3}\frac{R^3}{r^3}P_2(\cos\theta) = \frac{V_0R}{3r} + \frac{V_0R^3}{3r^3}\left(3\cos^2\theta - 1\right)$$

          Far away $V \approx \frac{V_0R}{3r}$, so $\alpha = \frac13$ and the sphere carries $Q = \frac43\pi\varepsilon_0RV_0$.

          **Checks.** At $r = R$ both reduce to $\frac{V_0}{3} + \frac{2V_0}{3}P_2 = V_0\cos^2\theta$. In Cartesian form the inside answer is $\frac{V_0}{3} + \frac{V_0}{3R^2}\left(2z^2 - x^2 - y^2\right)$, whose Laplacian is $\frac{V_0}{3R^2}(4 - 2 - 2) = 0$.

          **What to remember:** expand, then attach $(r/R)^\ell$ inside and $(R/r)^{\ell+1}$ outside to each term.
        `,
      }),

      P({
        title: 'Sphere at V₀(1 + 3 cos θ)',
        q: md`A shell of radius $R$ is held at $V_0(\theta) = V_0(1 + 3\cos\theta)$, with no other charge. Find (a) $V$ at the center, (b) the total charge on the shell, (c) $V$ outside at $r = 2R$ on the $+z$ axis and (d) on the $-z$ axis.`,
        figHtml: sph({ lab: 'V_0(\\theta)=V_0(1+3\\cos\\theta)', R: true }),
        hints: [
          md`Already a Legendre sum: $c_0 = V_0$, $c_1 = 3V_0$.`,
          md`Outside: $V = V_0\frac Rr + 3V_0\frac{R^2}{r^2}\cos\theta$. Total charge from the $1/r$ term.`,
        ],
        parts: [
          { lbl: md`(a) $V(\text{center})/V_0$`, ans: 1 },
          { lbl: md`(b) total charge $Q$`, expr: '4*pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
          { lbl: md`(c) $V(2R, 0)/V_0$`, ans: 1.25 },
          { lbl: md`(d) $V(2R, \pi)/V_0$`, ans: -0.25 },
        ],
        sol: md`
          The data are already a Legendre sum: $c_0 = V_0$, $c_1 = 3V_0$; nothing else.

          **Inside** ($r \le R$). BCs: (1) $V$ finite at $r = 0$, so no $B_\ell$; (2) $V(R,\theta) = V_0(1 + 3\cos\theta)$, so $A_0 = V_0$, $A_1R = 3V_0$. Then $V_{\text{in}} = V_0 + 3V_0\frac rR\cos\theta$. Center: $V_0$.

          **Outside** ($r \ge R$). BCs: (1) $V \to 0$ at infinity, so no $A_\ell$; (2) the same surface values, so $B_0 = V_0R$, $B_1 = 3V_0R^2$. Then $V_{\text{out}} = V_0\frac Rr + 3V_0\frac{R^2}{r^2}\cos\theta$, and the total charge is $Q = 4\pi\varepsilon_0B_0 = 4\pi\varepsilon_0RV_0$.

          At $r = 2R$: $+z$ axis ($\cos\theta = 1$): $\frac{V_0}{2} + \frac{3V_0}{4} = \frac54V_0$. $-z$ axis ($\cos\theta = -1$): $\frac{V_0}{2} - \frac{3V_0}{4} = -\frac14V_0$.

          [[fig:axis]]

          **Checks.** At $r = R$: $V_0(1 + 3\cos\theta)$ for both. The south pole of the shell is at $-2V_0$, so a negative potential just below it is reasonable; on the $-z$ axis $V$ crosses zero at $r = 3R$, and farther out the positive monopole wins on every side.

          **What to remember:** the center gives you $c_0$, the far field gives you $Q = 4\pi\varepsilon_0Rc_0$; both come for free once the data are expanded.
        `,
        figs: { axis: { svg: FIG.ax13, cap: '$V$ along the $z$ axis (units of $V_0$). Inside it is linear, from $-2V_0$ at the south pole to $4V_0$ at the north pole. Below the sphere it stays negative out to $z = -3R$.' } },
      }),

      P({
        title: 'Hemispheres at ±V₀',
        q: md`The northern hemisphere of a shell is held at $+V_0$ and the southern at $-V_0$ (thin insulating gap at the equator). Using the expansion $V_0\left[\tfrac32P_1 - \tfrac78P_3 + \dots\right]$ from Lesson 3, find the first two nonzero inside coefficients, the potential at the center, the potential at $z = R/2$ on the axis from those two terms only, and the dipole moment of the shell's charge.`,
        figHtml: hemis({ Pin: { f: 0.5, th: 0.01, at: 'r' } }),
        hints: [
          md`Inside: $A_\ell = c_\ell/R^\ell$, so $V_{\text{in}} = V_0\left[\tfrac32\tfrac rR P_1 - \tfrac78\tfrac{r^3}{R^3}P_3 + \dots\right]$.`,
          md`On the $+z$ axis every $P_\ell = 1$. Put $r = R/2$.`,
          md`Outside, $B_1 = c_1R^2$, and the dipole moment is $p = 4\pi\varepsilon_0B_1$.`,
        ],
        parts: [
          { lbl: md`$A_1R/V_0$`, ans: 1.5 },
          { lbl: md`$A_3R^3/V_0$`, ans: -0.875 },
          { lbl: md`$V(\text{center})/V_0$`, ans: 0 },
          { lbl: md`$V(z = R/2)/V_0$ from the $\ell = 1, 3$ terms`, ans: 41 / 64 },
          { lbl: md`dipole moment $p$`, expr: '6*pi*eps0*V0*R^2', vars: { eps0: [0.5, 2], V0: [1, 3], R: [1, 2] } },
        ],
        sol: md`
          **Inside.** Region $r \le R$. BCs: (1) finite at $0$, no $B_\ell$; (2) $V(R,\theta)$ = the $\pm V_0$ data, so $A_\ell R^\ell = c_\ell$:

          $$V_{\text{in}} = V_0\left[\frac32\frac rR\cos\theta - \frac78\frac{r^3}{R^3}P_3(\cos\theta) + \frac{11}{16}\frac{r^5}{R^5}P_5(\cos\theta) - \dots\right]$$

          $A_1R = \frac32V_0$, $A_3R^3 = -\frac78V_0$. Center: $0$ (the average of $\pm V_0$ over equal areas).

          At $z = R/2$ on the axis: $V_0\left[\frac32\cdot\frac12 - \frac78\cdot\frac18\right] = V_0\left[\frac34 - \frac{7}{64}\right] = \frac{41}{64}V_0 \approx 0.641V_0$.

          **How good is that?** On the axis the exact potential can be found by direct integration (Poisson's formula for the sphere): $V(z) = \frac{V_0}{z}\left[R - \frac{R^2 - z^2}{\sqrt{R^2 + z^2}}\right]$, which gives $0.658V_0$ at $z = R/2$. (That formula comes from Poisson's integral for a sphere, beyond this course; it is here only as a check.) Two terms are within 3%; four terms ($+\frac{11}{16}\cdot\frac{1}{32} - \frac{75}{128}\cdot\frac{1}{128}$) give $0.6575V_0$.

          [[fig:hax]]

          **Outside.** Region $r \ge R$. BCs: (1) $V \to 0$ at infinity, so no $A_\ell$; (2) the same $\pm V_0$ data at $r = R$, so $B_\ell = c_\ell R^{\ell+1}$. Then $V_{\text{out}} = V_0\left[\frac32\frac{R^2}{r^2}\cos\theta - \frac78\frac{R^4}{r^4}P_3 + \dots\right]$. No $1/r$ term (zero net charge). $B_1 = \frac32V_0R^2$, so $p = 4\pi\varepsilon_0B_1 = 6\pi\varepsilon_0V_0R^2$ along $+z$.

          **What to remember:** for data with a jump, a couple of terms already give the potential to a few percent away from the surface, because $(r/R)^\ell$ suppresses the high $\ell$. Exams ask for "the first two nonzero terms".
        `,
        figs: { hax: { svg: FIG.hemAxis, cap: 'Inside, on the $z$ axis: exact potential (solid) and the two-term series $\\tfrac32u - \\tfrac78u^3$ (dashed), $u = z/R$. They agree well near the center. Close to the poles ($|u| \\to 1$) the factors $u^\\ell$ no longer suppress the higher terms, so two terms fall short of $\\pm V_0$ there.' } },
      }),

      P({
        title: 'Which terms, and the center',
        q: md`Three spheres of radius $R$ are held at the potentials below. For each, decide which $\ell$ appear and the potential at the center.

        (i) $V_0\sin^2\theta$. (ii) $V_0\cos^3\theta$. (iii) $V_0$ on the northern hemisphere and $0$ on the southern.`,
        figHtml: PF.row([
          { svg: sphLab('V_0\\sin^2\\theta', { rr: 46 }), cap: '(i)' },
          { svg: sphLab('V_0\\cos^3\\theta', { rr: 46 }), cap: '(ii)' },
          { svg: hemis({ top: 'V_0', bot: '0', botThin: true, R: false }), cap: '(iii)' },
        ]).svg,
        hints: [
          md`Parity first: symmetric data, even $\ell$; antisymmetric, odd $\ell$; neither, both.`,
          md`Center = area average $= c_0$. For (i): $\sin^2\theta = \tfrac23(P_0 - P_2)$.`,
        ],
        parts: [
          { lbl: md`(i) Which $\ell$?`, mc: [md`$0$ and $2$`, md`$2$ only`, md`$1$ and $2$`, md`all even $\ell$`], a: 0,
            why: [null, md`$\sin^2\theta$ averages to $\frac23$ over the sphere, so $\ell = 0$ is there.`, md`$\sin^2\theta$ is north–south symmetric: no odd $\ell$.`, md`It is a polynomial of degree 2 in $\cos\theta$, so the series stops at $\ell = 2$.`] },
          { lbl: md`(i) $V(\text{center})/V_0$`, ans: 2 / 3 },
          { lbl: md`(ii) Which $\ell$?`, mc: [md`$3$ only`, md`$1$ and $3$`, md`$0, 1, 2, 3$`, md`all odd $\ell$`], a: 1,
            why: [md`$P_3$ has an $x$ term that must be cancelled by $P_1$.`, null, md`$\cos^3\theta$ is odd: no even $\ell$.`, md`Degree 3: the series stops at $\ell = 3$.`] },
          { lbl: md`(ii) $V(\text{center})/V_0$`, ans: 0 },
          { lbl: md`(iii) Which $\ell$?`, mc: [md`odd $\ell$ only`, md`$\ell = 0$ and $\ell = 1$ only`, md`$\ell = 0$ and all odd $\ell$`, md`all $\ell$`], a: 2,
            why: [md`The average is $\frac{V_0}{2} \ne 0$, so $\ell = 0$ is present.`, md`A jump needs infinitely many terms.`, null, md`Subtract the constant $\frac{V_0}{2}$ and what remains is antisymmetric: no even $\ell \ge 2$.`] },
          { lbl: md`(iii) $V(\text{center})/V_0$`, ans: 0.5 },
        ],
        sol: md`
          **Boundary conditions** (inside each sphere, region $r \le R$): (1) $V$ finite at $r = 0$, which kills every $B_\ell$; (2) $V(R,\theta)$ = the given data, which gives $A_\ell R^\ell = c_\ell$. At the center every $r^\ell$ with $\ell \ge 1$ vanishes, so $V(0) = A_0 = c_0$.

          **(i)** $\sin^2\theta = \frac23P_0 - \frac23P_2$: $\ell = 0, 2$. Center $= c_0 = \frac23V_0$.

          **(ii)** $\cos^3\theta = \frac35P_1 + \frac25P_3$: $\ell = 1, 3$. Center $= 0$ (odd data average to zero).

          **(iii)** $\frac{V_0}{2}$ plus a $\pm\frac{V_0}{2}$ step: $\ell = 0$ and every odd $\ell$ ($c_1 = \frac34V_0$, $c_3 = -\frac{7}{16}V_0$, ...). Center $= \frac{V_0}{2}$.

          **What to remember:** before computing anything, parity tells you which $\ell$ can appear and the area average tells you the center. Both take seconds and catch many errors.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Inside (BCs: finite at $0$; $V(R,\theta) = V_0$): $V = \sum c_\ell(r/R)^\ell P_\ell$, $A_\ell = \frac{2\ell+1}{2R^\ell}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$.
          - Outside (BCs: $V \to 0$; $V(R,\theta) = V_0$): $V = \sum c_\ell(R/r)^{\ell+1}P_\ell$, $B_\ell = \frac{2\ell+1}{2}R^{\ell+1}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$.
          - Lecture example: $k\sin^2\frac\theta2 = \frac k2(P_0 - P_1)$ gives $V_{\text{in}} = \frac k2\left(1 - \frac rR\cos\theta\right)$, $V_{\text{out}} = \frac k2\left(\frac Rr - \frac{R^2}{r^2}\cos\theta\right)$.
          - Center = surface average ($c_0$). Far away $V \approx c_0R/r$, so $Q = 4\pi\varepsilon_0Rc_0$.
          - $\ell = 1$ data: uniform field inside, pure dipole outside.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 6: metal sphere in a uniform field (Griffiths Ex. 3.8)
  // =====================================================================================
  FIG.fieldLines = fieldLines();
  FIG.fieldSigma = PF.plot({ w: 320, h: 190, x: [0, Math.PI], y: [-3.4, 3.4], zero: true, xl: '\\theta', yl: '\\sigma/(\\varepsilon_0E_0)',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[3, '3'], [-3, '-3']], curves: [{ f: (t) => 3 * Math.cos(t) }] });
  FIG.fieldP = fieldSetup({ P: { f: 1.0, th: 0.01, lab: 'P', at: 'tr' } });
  FIG.sigQ = PF.plot({ w: 330, h: 200, x: [0, Math.PI], y: [-3.4, 4.8], zero: true, xl: '\\theta', yl: '\\sigma/(\\varepsilon_0E_0)',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [2 * Math.PI / 3, '120^\\circ'], [Math.PI, '\\pi']], yt: [[4.5, '4.5'], [-1.5, '-1.5']],
    curves: [{ f: (t) => 3 * Math.cos(t), cls: 'dim dash' }, { f: (t) => 1.5 + 3 * Math.cos(t) }] });

  const L6 = {
    id: 'u7-field', title: 'Metal sphere in a uniform field (Griffiths Ex. 3.8)',
    steps: [
      RF(md`
        *An uncharged metal sphere of radius $R$ is placed in an otherwise uniform electric field $\vb E = E_0\uv z$. Find the potential outside.* This is not in the lectures, but it is in Griffiths §3.3.2 and is one of the most common exam problems in this unit.

        [[fig:setup]]

        **The physics first.** The field pushes positive charge to the northern surface and leaves negative charge on the southern surface. That induced charge is what you are solving for: it bends the field lines so they hit the metal at right angles, and it cancels the field inside the metal.

        **Region:** $r \ge R$. **Boundary conditions** (Griffiths 3.74):

        1. $V = 0$ on $r = R$. The sphere is an equipotential. Its potential equals that of the equatorial plane by symmetry (flip the setup upside down and reverse the field: you get the same situation with $V \to -V$, so $V$ is odd in $z$ and zero on $z = 0$), and you may call that potential zero.
        2. $V \to -E_0r\cos\theta$ as $r \to \infty$. Far away only the applied field is left, $V = -E_0z + C$, and $C = 0$ by the same choice.

        **Why not $V \to 0$ at infinity?** The uniform field fills all of space: whatever makes it (two huge capacitor plates) is "at infinity". So $V$ grows like $-E_0z$ far away, and this problem needs both $A_\ell$ and $B_\ell$ in the outside region.
      `, { setup: { svg: FIG.metalField, cap: 'Griffiths Ex. 3.8: an uncharged metal sphere (radius $R$) in a field that is $E_0\\hat{\\mathbf z}$ far away. Setup only: the field near the sphere is what you solve for.' } }),

      Q(md`Before solving: where on the sphere will the induced surface charge be positive?`,
        [md`On the northern hemisphere ($\theta \lt 90^\circ$), most at the north pole`, md`On the southern hemisphere`, md`Around the equator`, md`Nowhere: an uncharged sphere has $\sigma = 0$ everywhere`], 0,
        [null, md`The field pushes positive charge along $+\hat{\mathbf z}$, toward the north.`, md`By symmetry the equator is where $\sigma$ changes sign, so it is zero there.`, md`Uncharged means total charge zero; the charge still separates.`],
        md`$\vb E = E_0\uv z$ pushes free positive charge up and pulls negative charge down until the field inside the metal is zero. Result: $+$ on top, $-$ on the bottom, largest at the poles. The answer will be $\sigma = 3\varepsilon_0E_0\cos\theta$.`,
        { figHtml: FIG.metalField }),

      Q(md`Which values of $\ell$ survive in the solution?`,
        [md`All $\ell$, as for any sphere`, md`$\ell = 0$ and $\ell = 1$`, md`$\ell = 1$ only`, md`Only odd $\ell$, infinitely many`], 2,
        [md`The far-field condition only contains $\cos\theta = P_1$, and the sphere condition forces each $B_\ell$ to vanish with its $A_\ell$.`, md`$\ell = 0$ would be a net charge (a $1/r$ term) or a constant; the sphere is neutral and the constant is zero by choice.`, null, md`Odd symmetry allows odd $\ell$, but the far field contains only $\ell = 1$, and every other $A_\ell = 0$ forces $B_\ell = 0$.`],
        md`BC 2 gives $A_1 = -E_0$ and every other $A_\ell = 0$. BC 1 gives $B_\ell = -A_\ell R^{2\ell+1}$, so $B_\ell = 0$ whenever $A_\ell = 0$. Only $\ell = 1$ remains: the problem is "pure $\cos\theta$", like the shell at $V_0\cos\theta$.`,
        { figHtml: FIG.metalField }),

      RF(md`
        ### The solution

        Start from the general solution in the outside region, $V = \sum_\ell\left(A_\ell r^\ell + \frac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta)$.

        **BC 1** ($V = 0$ at $r = R$, every $\theta$): each Legendre coefficient must vanish separately,

        $$A_\ell R^\ell + \frac{B_\ell}{R^{\ell+1}} = 0 \quad\Longrightarrow\quad B_\ell = -A_\ell R^{2\ell+1}$$

        so $V = \sum_\ell A_\ell\left(r^\ell - \frac{R^{2\ell+1}}{r^{\ell+1}}\right)P_\ell(\cos\theta)$.

        **BC 2** (large $r$): the $R^{2\ell+1}$ pieces die, leaving $\sum_\ell A_\ell r^\ell P_\ell(\cos\theta) = -E_0r\cos\theta$. Since $\cos\theta = P_1$: $A_1 = -E_0$, all other $A_\ell = 0$.

        $$\boxed{V(r,\theta) = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta}$$

        The first term is the applied field. The second, $E_0R^3\frac{\cos\theta}{r^2}$, is the induced charge, and it is exactly a dipole $\frac{p\cos\theta}{4\pi\varepsilon_0r^2}$ with

        $$p = 4\pi\varepsilon_0R^3E_0 \quad (\text{along } +\uv z)$$

        **Induced charge.** Inside the metal $\vb E = 0$, so $\sigma = \varepsilon_0E_r$ just outside:

        $$\sigma(\theta) = -\varepsilon_0\frac{\partial V}{\partial r}\bigg|_{r=R} = \varepsilon_0E_0\left(1 + \frac{2R^3}{r^3}\right)\cos\theta\bigg|_{r=R} = 3\varepsilon_0E_0\cos\theta$$

        Positive in the north, negative in the south, zero on the equator; the total $\int\sigma\,da \propto \int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.

        **Field at the surface.** $E_\theta = -\frac1r\frac{\partial V}{\partial\theta} = -E_0\left(1 - \frac{R^3}{r^3}\right)\sin\theta$ vanishes at $r = R$, so the field meets the metal head-on, as it must, with $E_r = 3E_0\cos\theta$: **three times the applied field at the poles, zero at the equator.**

        [[fig:lines]]

        **Check the BCs.** $r = R$: $(R - R)\cos\theta = 0$. Large $r$: $-E_0r\cos\theta$. Both hold, so by uniqueness this is the answer.

        !!intuition Numbers worth remembering
          - Field enhancement $3$ at the poles of a sphere (it is $2$ for a cylinder across a field). Sharp or rounded metal concentrates the field at the points that stick out along it.
          - Flux check: the southern hemisphere carries $-3\pi\varepsilon_0R^2E_0$, so $3\pi R^2E_0$ of flux ends on it. Far below, that flux crosses a disk of radius $\sqrt3R$: the sphere "collects" field lines from three times its own cross-section.
          - Inside the metal the induced charge alone makes $-E_0\uv z$, cancelling the applied field. Next lesson shows that $\sigma = k\cos\theta$ always makes a uniform field inside.
      `, { lines: { svg: FIG.fieldLines, cap: 'Solution: field lines bend into the sphere and meet it at right angles. They end on the negative southern charge and start again from the positive northern charge.' } }),

      Q(md`What is the largest value of $|\sigma|$ on the sphere, and where?`,
        [md`$\varepsilon_0E_0$, at the poles`, md`$3\varepsilon_0E_0$, at the poles`, md`$3\varepsilon_0E_0$, on the equator`, md`$2\varepsilon_0E_0$, at the poles`], 1,
        [md`That is what an infinite flat conductor facing the field would carry. The sphere concentrates the field by a factor of 3.`, null, md`$\sigma \propto\cos\theta$ is zero on the equator.`, md`The factor is $1 + 2R^3/r^3 = 3$ at $r = R$, not 2.`],
        md`$\sigma = 3\varepsilon_0E_0\cos\theta$: $+3\varepsilon_0E_0$ at the north pole, $-3\varepsilon_0E_0$ at the south pole.`,
        { figHtml: FIG.metalField }),

      Q(md`Just outside the north pole of the sphere, what is $|\vb E|$?`,
        [md`$E_0$`, md`$2E_0$`, md`$0$`, md`$3E_0$`], 3,
        [md`The induced dipole adds to the applied field at the poles.`, md`$1 + 2R^3/r^3 = 3$ at the surface.`, md`Zero is the equator.`, null],
        md`$E_r = -\frac{\partial V}{\partial r} = E_0\left(1 + \frac{2R^3}{r^3}\right)\cos\theta = 3E_0$ at $r = R$, $\theta = 0$. Equivalently $E = \sigma/\varepsilon_0 = 3E_0$. Same magnitude and direction ($+\uv z$) at the south pole.`,
        { figHtml: FIG.fieldP }),

      Q(md`Just outside the sphere **on the equator**, what is $|\vb E|$?`,
        [md`$E_0$`, md`$0$`, md`$3E_0$`, md`$\tfrac32E_0$`], 1,
        [md`Far from the sphere, yes, but the induced dipole cancels the applied field right at the equator.`, null, md`That is the pole.`, md`Nothing in the solution gives $\frac32E_0$. The surface field is $3E_0\cos\theta$, which is zero at $\theta = 90^\circ$.`],
        md`At the surface $E = 3E_0\cos\theta\,\uv r$, which vanishes at $\theta = 90^\circ$. In the equatorial plane at distance $r$ the field is $E_0\left(1 - \frac{R^3}{r^3}\right)\uv z$: weakened near the sphere, back to $E_0$ far away. The field lines are pulled away from the equator toward the poles.`,
        { figHtml: FIG.metalField }),

      Q(md`What is the total induced charge on the sphere?`,
        [md`$3\varepsilon_0E_0\cdot4\pi R^2$`, md`$3\pi\varepsilon_0R^2E_0$`, md`$0$`, md`$-3\pi\varepsilon_0R^2E_0$`], 2,
        [md`That treats $\sigma_{\max}$ as uniform; $\sigma$ changes sign.`, md`That is the charge on the **northern** hemisphere only.`, null, md`That is the southern hemisphere's charge.`],
        md`$\int_0^\pi3\varepsilon_0E_0\cos\theta\,2\pi R^2\sin\theta\,d\theta = 0$. The sphere was uncharged and is isolated (or grounded with no reason to gain charge), so it stays neutral; consistent with no $1/r$ term in $V$.`,
        { figHtml: FIG.metalField }),

      Q(md`What dipole moment does the induced charge have?`,
        [md`$4\pi\varepsilon_0R^3E_0$, along $+\uv z$`, md`$4\pi\varepsilon_0R^3E_0$, along $-\uv z$`, md`$\tfrac43\pi R^3\varepsilon_0E_0$, along $+\uv z$`, md`zero, since the sphere is neutral`], 0,
        [null, md`Positive charge sits on top, so $\vb p$ points up, along the applied field.`, md`Compare $E_0R^3\frac{\cos\theta}{r^2}$ with $\frac{p\cos\theta}{4\pi\varepsilon_0r^2}$: the factor is $4\pi\varepsilon_0$, not $\frac43\pi\varepsilon_0$.`, md`Neutral means no monopole; a dipole moment needs only separated charge.`],
        md`$V_{\text{induced}} = E_0R^3\frac{\cos\theta}{r^2} = \frac{p\cos\theta}{4\pi\varepsilon_0r^2}$ gives $p = 4\pi\varepsilon_0R^3E_0$. Directly: $p = \int z\,\sigma\,da = \int_0^\pi R\cos\theta\cdot3\varepsilon_0E_0\cos\theta\cdot2\pi R^2\sin\theta\,d\theta = 6\pi\varepsilon_0R^3E_0\cdot\frac23 = 4\pi\varepsilon_0R^3E_0$. (The polarizability of a metal sphere is $4\pi\varepsilon_0R^3$.)`,
        { figHtml: FIG.metalField }),

      Q(md`What is the field **inside** the metal, and what does the induced charge alone produce there?`,
        [md`$E_0\uv z$ inside; the induced charge produces nothing inside`, md`$0$ inside; the induced charge alone produces $-E_0\uv z$ there`, md`$3E_0\uv z$ inside`, md`$0$ inside; the induced charge alone also produces $0$ there`], 1,
        [md`A conductor in equilibrium has no field inside.`, null, md`$3E_0$ is the field just outside the poles.`, md`Then the total inside would be $E_0\uv z$ from the applied field, not zero.`],
        md`Total inside $= 0$ (conductor). Applied field $= E_0\uv z$. So the induced charge must contribute exactly $-E_0\uv z$ everywhere inside: a **uniform** field. That is the special property of $\sigma \propto\cos\theta$ on a sphere (next lesson, $k = 3\varepsilon_0E_0$).`,
        { figHtml: FIG.metalField }),

      Q(md`You double the radius of the sphere, keeping $E_0$ fixed. What happens to the induced dipole moment and to $\sigma_{\max}$?`,
        [md`Both double`, md`$p$ grows by 4; $\sigma_{\max}$ halves`, md`Both unchanged`, md`$p$ grows by 8; $\sigma_{\max}$ is unchanged`], 3,
        [md`$p \propto R^3$ and $\sigma_{\max} = 3\varepsilon_0E_0$ has no $R$ in it.`, md`$\sigma_{\max}$ does not depend on $R$; $p \propto R^3$.`, md`$p = 4\pi\varepsilon_0R^3E_0$ depends on $R$.`, null],
        md`$\sigma = 3\varepsilon_0E_0\cos\theta$ is independent of $R$, while the area grows as $R^2$ and the lever arm as $R$: $p \propto R^3$, a factor of 8. The field pattern just scales with $R$.`,
        { figHtml: FIG.metalField }),

      Q(md`The sphere now carries net charge $Q$. What changes in the solution?`,
        [md`Nothing; the induced charge is still $3\varepsilon_0E_0\cos\theta$.`, md`You add $\dfrac{Q}{4\pi\varepsilon_0r}$ to $V$ outside; $\sigma$ gains a uniform $\dfrac{Q}{4\pi R^2}$; the sphere's potential becomes $\dfrac{Q}{4\pi\varepsilon_0R}$.`, md`$A_0$ becomes nonzero.`, md`The dipole term changes to keep $V = 0$ on the sphere.`], 1,
        [md`Net charge adds a monopole term outside and a uniform part to $\sigma$.`, null, md`A constant would not decay and has nothing to do with the charge; the charge shows up as $B_0 = \frac{Q}{4\pi\varepsilon_0}$.`, md`The sphere is no longer at $V = 0$; its potential floats to $\frac{Q}{4\pi\varepsilon_0R}$, and the dipole part is unchanged.`],
        md`Superposition: (neutral sphere in the field) + (isolated sphere with charge $Q$). $V = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta + \frac{Q}{4\pi\varepsilon_0r}$, which is constant ($\frac{Q}{4\pi\varepsilon_0R}$) on the sphere as a conductor must be, and has total charge $Q$. This is Griffiths' Prob. 3.21 (4th ed.).`,
        { figHtml: FIG.chargedField }),

      Q(md`Far below the sphere, field lines are uniformly spaced. The lines that end on the sphere's southern half come from a disk of what radius?`,
        [md`$R$`, md`$\sqrt2\,R$`, md`$\sqrt3\,R$`, md`$3R$`], 2,
        [md`The sphere pulls in more lines than its own shadow: the induced charge bends nearby lines into it.`, md`Check the flux: it is $3\pi R^2E_0$, not $2\pi R^2E_0$.`, null, md`That would be a flux $9\pi R^2E_0$.`],
        md`The southern hemisphere carries $-3\pi\varepsilon_0R^2E_0$, so $3\pi R^2E_0$ of flux ends there. Far below, the flux density is $E_0$, so those lines cross an area $3\pi R^2 = \pi(\sqrt3R)^2$. The field-line figure shows lines from well beyond the sphere's edge curving in.`,
        { figHtml: FIG.metalField }),

      P({
        title: 'Numbers for the sphere in a field',
        q: md`An uncharged metal sphere of radius $R$ sits in a field that is $E_0\hat{\mathbf z}$ far away. Find (a) the maximum surface charge density, (b) the total induced charge, (c) $|\vb E|$ just outside the poles in units of $E_0$, (d) $|\vb E|$ just outside the equator in units of $E_0$, (e) the induced dipole moment, and (f) the charge on the northern hemisphere.`,
        figHtml: FIG.metalField,
        hints: [
          md`Write the two boundary conditions first: $V = 0$ on the sphere, $V \to -E_0r\cos\theta$ far away. They give $V = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta$.`,
          md`$\sigma = -\varepsilon_0\partial V/\partial r$ at $r = R$. The surface field is $\sigma/\varepsilon_0$, radial.`,
          md`Northern hemisphere: $\int_0^{\pi/2}\sigma\,2\pi R^2\sin\theta\,d\theta$, with $\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = \tfrac12$.`,
        ],
        parts: [
          { lbl: md`(a) $\sigma_{\max}$`, expr: '3*eps0*E0', vars: { eps0: [0.5, 2], E0: [1, 3] } },
          { lbl: md`(b) total induced charge`, ans: 0 },
          { lbl: md`(c) $E_{\text{pole}}/E_0$`, ans: 3 },
          { lbl: md`(d) $E_{\text{equator}}/E_0$`, ans: 0 },
          { lbl: md`(e) $p$`, expr: '4*pi*eps0*R^3*E0', vars: { eps0: [0.5, 2], R: [1, 2], E0: [1, 3] } },
          { lbl: md`(f) $Q_{\text{north}}$`, expr: '3*pi*eps0*R^2*E0', vars: { eps0: [0.5, 2], R: [1, 2], E0: [1, 3] } },
        ],
        sol: md`
          **Boundary conditions** (region $r \ge R$): (1) $V = 0$ on $r = R$; (2) $V \to -E_0r\cos\theta$ as $r \to \infty$. (1) gives $B_\ell = -A_\ell R^{2\ell+1}$; (2) gives $A_1 = -E_0$, all other $A_\ell = 0$:

          $$V = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta, \qquad \sigma = 3\varepsilon_0E_0\cos\theta$$

          [[fig:sig]]

          (a) $\sigma_{\max} = 3\varepsilon_0E_0$ at $\theta = 0$.

          (b) $\int\sigma\,da = 6\pi\varepsilon_0R^2E_0\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.

          (c) $E = \sigma/\varepsilon_0 = 3E_0$ at either pole (both pointing $+\uv z$).

          (d) $\cos90^\circ = 0$: the surface field vanishes on the equator.

          (e) The induced term is $E_0R^3\frac{\cos\theta}{r^2} = \frac{p\cos\theta}{4\pi\varepsilon_0r^2}$, so $p = 4\pi\varepsilon_0R^3E_0$.

          (f) $Q_{\text{north}} = \int_0^{\pi/2}3\varepsilon_0E_0\cos\theta\cdot2\pi R^2\sin\theta\,d\theta = 6\pi\varepsilon_0R^2E_0\cdot\tfrac12 = 3\pi\varepsilon_0R^2E_0$. The southern half carries the opposite.

          **What to remember:** $3$ at the poles, $0$ at the equator, neutral overall, $p = 4\pi\varepsilon_0R^3E_0$.
        `,
        figs: { sig: { svg: FIG.fieldSigma, cap: 'Induced charge $\\sigma = 3\\varepsilon_0E_0\\cos\\theta$: positive on the northern half, negative on the southern.' } },
      }),

      P({
        title: 'Charged metal sphere in a field',
        q: md`A metal sphere of radius $R$ carries net charge $Q$ and sits in a field that is $E_0\hat{\mathbf z}$ far away. Take the zero of potential so that far away $V \to -E_0r\cos\theta$ (the equatorial plane far from the sphere is at zero). Find (a) $V$ outside, (b) $\sigma(\theta)$, (c) the potential of the sphere, and (d) for $Q = 6\pi\varepsilon_0R^2E_0$, the polar angle (degrees) where $\sigma = 0$.`,
        figHtml: FIG.chargedField,
        hints: [
          md`Boundary conditions: (1) $V = V_s$ (unknown constant) on $r = R$; (2) $V \to -E_0r\cos\theta$; (3) total charge $Q$, so the $1/r$ term is $\frac{Q}{4\pi\varepsilon_0r}$.`,
          md`Superpose the neutral-sphere answer and a point-charge potential. Check that the sum is constant on the sphere.`,
          md`$\sigma = -\varepsilon_0\partial V/\partial r$ at $r = R$. Set it to zero and solve for $\cos\theta$.`,
        ],
        parts: [
          { lbl: md`(a) $V(r,\theta)$`, expr: '-E0*(r - R^3/r^2)*cos(theta) + Q/(4*pi*eps0*r)', vars: { E0: [1, 3], r: [2, 4], R: [1, 2], theta: [0, 3], Q: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(b) $\sigma(\theta)$`, expr: '3*eps0*E0*cos(theta) + Q/(4*pi*R^2)', vars: { eps0: [0.5, 2], E0: [1, 3], theta: [0, 3], Q: [1, 3], R: [1, 2] } },
          { lbl: md`(c) $V_s$`, expr: 'Q/(4*pi*eps0*R)', vars: { Q: [1, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`(d) $\theta$ in degrees`, ans: 120 },
          { lbl: md`If instead the sphere were held at a potential $V_s$ by a battery (relative to the same zero), its charge would be`, mc: [md`$4\pi\varepsilon_0RV_s$`, md`$0$, because the field is uniform`, md`$\dfrac{V_s}{4\pi\varepsilon_0R}$`], a: 0,
            why: [null, md`Holding the sphere at $V_s \ne 0$ requires a $1/r$ term, i.e. net charge.`, md`Units: charge is $\varepsilon_0\times$ length $\times$ potential.`] },
        ],
        sol: md`
          **Boundary conditions** (region $r \ge R$):
          1. $V = V_s$ on $r = R$ (conductor; $V_s$ unknown).
          2. $V \to -E_0r\cos\theta$ far away: $A_1 = -E_0$, other $A_\ell = 0$ (the constant $A_0$ is zero by the choice of reference).
          3. Total charge $Q$: $B_0 = \frac{Q}{4\pi\varepsilon_0}$.

          $\ell = 1$: BC 1 has no $\cos\theta$ part, so $A_1R + B_1/R^2 = 0$ and $B_1 = E_0R^3$. $\ell = 0$: $B_0/R = V_s$. Higher $\ell$: zero.

          $$V = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta + \frac{Q}{4\pi\varepsilon_0r}, \qquad V_s = \frac{Q}{4\pi\varepsilon_0R}$$

          $$\sigma = -\varepsilon_0\frac{\partial V}{\partial r}\bigg|_R = 3\varepsilon_0E_0\cos\theta + \frac{Q}{4\pi R^2}$$

          (d) With $Q = 6\pi\varepsilon_0R^2E_0$: $\frac{Q}{4\pi R^2} = \frac32\varepsilon_0E_0$, so $\sigma = 0$ when $\cos\theta = -\frac12$: $\theta = 120^\circ$. Positive charge covers the sphere down to $120^\circ$; only a cap around the south pole stays negative.

          [[fig:sq]]

          **Battery version:** the same algebra with $V_s$ given gives $B_0 = RV_s$, so $Q = 4\pi\varepsilon_0RV_s$, the isolated-sphere capacitance.

          **What to remember:** charge, field and potential all superpose. A charged sphere in a field = the neutral answer + a point charge at the center.
        `,
        figs: { sq: { svg: FIG.sigQ, cap: '$\\sigma(\\theta)$ for $Q = 6\\pi\\varepsilon_0R^2E_0$ (units of $\\varepsilon_0E_0$): the uniform $\\tfrac32$ shifts $3\\cos\\theta$ up, so the zero moves from $90^\\circ$ to $120^\\circ$. Dashed: the neutral sphere.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - Boundary conditions: (1) $V = 0$ on the sphere (equipotential at the equatorial plane's potential, by symmetry); (2) $V \to -E_0r\cos\theta$ far away. Not $V \to 0$.
          - (1) gives $B_\ell = -A_\ell R^{2\ell+1}$ (same region, so a minus sign); (2) leaves only $A_1 = -E_0$.
          - $V = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta$; induced dipole $p = 4\pi\varepsilon_0R^3E_0$ along the field.
          - $\sigma = 3\varepsilon_0E_0\cos\theta$: $3E_0$ at the poles, $0$ at the equator, zero net charge.
          - Net charge $Q$: add $\frac{Q}{4\pi\varepsilon_0r}$; the sphere sits at $\frac{Q}{4\pi\varepsilon_0R}$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 7: a sphere with a given surface charge (Griffiths Ex. 3.9) and HW 3.22
  // =====================================================================================
  FIG.pill = pillbox();
  FIG.sigCos = sph({ sig: cosSign, lab: '\\sigma_0(\\theta)=k\\cos\\theta' });
  FIG.sigUni = sph({ sig: () => 1, lab: '\\sigma_0\\ (\\text{uniform})' });
  FIG.sigP2 = sph({ sig: (th) => Math.sign(3 * Math.cos(th * DG) ** 2 - 1), lab: '\\sigma_0=k(3\\cos^2\\theta-1)' });
  FIG.sigOnePlus = sph({ sig: (th) => (th < 150 ? 1 : 0), lab: '\\sigma_0=k(1+\\cos\\theta)' });
  FIG.sigHem = sph({ sig: cosSign, lab: '+\\sigma_0\\ (\\text{north})', lab2: '-\\sigma_0\\ (\\text{south})' });
  FIG.dip = dipoleShell();
  FIG.hw322 = sph({ lab: 'V_0(\\theta)\\ \\text{given}', lab2: '\\sigma(\\theta)=?', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 });

  const L7 = {
    id: 'u7-sigma', title: 'A sphere with a given surface charge (Ex. 3.9, HW 3.22)',
    steps: [
      RF(md`
        *A specified charge density $\sigma_0(\theta)$ is glued over the surface of a spherical shell of radius $R$. Find the potential inside and outside.* (Griffiths Ex. 3.9.)

        You could integrate $\frac{1}{4\pi\varepsilon_0}\int\frac{\sigma_0\,da}{\srm}$, but separation of variables is much faster. Now the potential on the shell is **not** given; the charge is. The shell splits space into two regions, each with its own series:

        $$V_{\text{in}} = \sum_\ell A_\ell r^\ell P_\ell(\cos\theta)\ \ (r \le R), \qquad V_{\text{out}} = \sum_\ell\frac{B_\ell}{r^{\ell+1}}P_\ell(\cos\theta)\ \ (r \ge R)$$

        **Boundary conditions:**

        1. $V_{\text{in}}$ finite at $r = 0$: already used (no $B$'s inside).
        2. $V_{\text{out}} \to 0$ at infinity: already used (no $A$'s outside).
        3. $V$ continuous at $r = R$: $V_{\text{in}}(R,\theta) = V_{\text{out}}(R,\theta)$.
        4. The jump: $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0(\theta)}{\varepsilon_0}$ at $r = R$.

        [[fig:pill]]

        **Where 3 and 4 come from** (Unit 2). A tiny pillbox straddling the surface encloses charge $\sigma_0A$, so Gauss's law gives $E^\perp_{\text{out}} - E^\perp_{\text{in}} = \sigma_0/\varepsilon_0$. Here $E^\perp = E_r = -\partial V/\partial r$, which gives condition 4. And $\vb E$ stays finite next to a surface charge, so $\Delta V = -\int\vb E\cdot d\vb l$ across a path of vanishing length is zero: condition 3.
      `, { pill: { svg: FIG.pill, cap: 'A pillbox straddling the charged shell. Gauss: $E^{\\perp}_{\\text{out}} - E^{\\perp}_{\\text{in}} = \\sigma_0/\\varepsilon_0$.' } }),

      Q(md`Why is the potential continuous across a sheet of surface charge (condition 3)?`,
        [md`$\vb E$ next to the sheet is finite (it jumps by $\sigma/\varepsilon_0$, but stays bounded), so $V_{\text{out}} - V_{\text{in}} = -\int\vb E\cdot d\vb l$ over a path of zero length is zero.`, md`Because $V$ is continuous everywhere, even at a point charge.`, md`Because $\vb E$ is continuous across the sheet.`, md`Because the jump condition forces it.`], 0,
        [null, md`$V$ blows up at a point charge. It is continuous across a *surface* charge because the field there is bounded.`, md`$E^\perp$ is *not* continuous; it jumps by $\sigma/\varepsilon_0$. Continuity of $V$ needs only that $\vb E$ be finite.`, md`The jump condition is about $\partial V/\partial r$; it says nothing about $V$ itself.`],
        md`$V(R + \epsilon) - V(R - \epsilon) = -\int_{R-\epsilon}^{R+\epsilon}E_r\,dr \to 0$ as $\epsilon \to 0$, because $E_r$ is bounded. Only a dipole layer (a double sheet of charge) would make $V$ jump, and that never appears in this course.`,
        { figHtml: FIG.pill }),

      Q(md`Which form of the jump condition at a charged shell is correct?`,
        [md`$\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = +\dfrac{\sigma_0}{\varepsilon_0}$`, md`$\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0}{2\varepsilon_0}$`, md`$\dfrac{\partial V_{\text{out}}}{\partial r} = -\dfrac{\sigma_0}{\varepsilon_0}$`, md`$\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0}{\varepsilon_0}$`], 3,
        [md`Sign: $E_r = -\partial V/\partial r$. For positive $\sigma_0$, $E_r$ increases outward, so $\partial V/\partial r$ *decreases*.`, md`$\tfrac{\sigma}{2\varepsilon_0}$ is the field of a sheet on *one* side. The *jump* across it is $\sigma/\varepsilon_0$.`, md`That would assume no field inside, true only for a conductor (where $\sigma = -\varepsilon_0\partial V/\partial n$).`, null],
        md`Gauss with a pillbox: $E_r^{\text{out}} - E_r^{\text{in}} = \sigma_0/\varepsilon_0$, and $E_r = -\partial V/\partial r$. For a conductor the inside field is zero and this reduces to $\sigma = -\varepsilon_0\,\partial V/\partial r$ just outside, which you used in the last lesson.`,
        { figHtml: FIG.pill }),

      RF(md`
        ### Matching term by term

        Expand the charge too: $\sigma_0(\theta) = \sum_\ell s_\ell P_\ell(\cos\theta)$ (call its coefficients $s_\ell$ so they are not confused with the function $\sigma_0$). Then match each $\ell$ separately.

        **Condition 3** (continuity): $A_\ell R^\ell = \dfrac{B_\ell}{R^{\ell+1}}$, so $B_\ell = A_\ell R^{2\ell+1}$.

        **Condition 4** (jump): with $\frac{\partial V_{\text{out}}}{\partial r} = -\sum(\ell+1)\frac{B_\ell}{r^{\ell+2}}P_\ell$ and $\frac{\partial V_{\text{in}}}{\partial r} = \sum\ell A_\ell r^{\ell-1}P_\ell$,

        $$-\sum_\ell\left[(\ell+1)\frac{B_\ell}{R^{\ell+2}} + \ell A_\ell R^{\ell-1}\right]P_\ell = -\frac{\sigma_0}{\varepsilon_0} \quad\xrightarrow{\ B_\ell = A_\ell R^{2\ell+1}\ }\quad \sum_\ell(2\ell+1)A_\ell R^{\ell-1}P_\ell = \frac{\sigma_0(\theta)}{\varepsilon_0}$$

        So, term by term,

        $$A_\ell = \frac{s_\ell}{(2\ell+1)\,\varepsilon_0R^{\ell-1}}, \qquad B_\ell = \frac{s_\ell\,R^{\ell+2}}{(2\ell+1)\,\varepsilon_0}$$

        (Griffiths writes the same thing with Fourier's trick: $A_\ell = \frac{1}{2\varepsilon_0R^{\ell-1}}\int_0^\pi\sigma_0P_\ell\sin\theta\,d\theta$.) On the shell itself the $\ell$-th term of the potential is $\frac{s_\ell R}{(2\ell+1)\varepsilon_0}$.

        ### Worked: $\sigma_0 = k\cos\theta$

        Only $s_1 = k$. Then $A_1 = \frac{k}{3\varepsilon_0}$ and $B_1 = \frac{kR^3}{3\varepsilon_0}$:

        $$V_{\text{in}} = \frac{k}{3\varepsilon_0}\,r\cos\theta \qquad V_{\text{out}} = \frac{kR^3}{3\varepsilon_0}\,\frac{\cos\theta}{r^2}$$

        **Check the BCs.** (1), (2): no forbidden powers. (3): both equal $\frac{kR}{3\varepsilon_0}\cos\theta$ at $R$. (4): $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{2k\cos\theta}{3\varepsilon_0} - \frac{k\cos\theta}{3\varepsilon_0} = -\frac{k\cos\theta}{\varepsilon_0}$.

        **Read it.** Inside, $V = \frac{k}{3\varepsilon_0}z$: a **uniform** field $\vb E = -\frac{k}{3\varepsilon_0}\uv z$, pointing from the positive cap to the negative cap. Outside, a pure dipole with $p = 4\pi\varepsilon_0B_1 = \frac43\pi R^3k$.

        [[fig:dip]]

        **Link to Ex. 3.8.** The induced charge on the metal sphere was $3\varepsilon_0E_0\cos\theta$, i.e. $k = 3\varepsilon_0E_0$. Its field inside is $-\frac{k}{3\varepsilon_0}\uv z = -E_0\uv z$: exactly what cancels the applied field in the metal. Its potential outside is $\frac{kR^3}{3\varepsilon_0}\frac{\cos\theta}{r^2} = E_0R^3\frac{\cos\theta}{r^2}$: the induced-dipole term found there. Two different routes, one answer.
      `, { dip: { svg: FIG.dip, cap: 'Field of the shell with $\\sigma_0 = k\\cos\\theta$: uniform inside, a pure dipole outside. Lines start on the $+$ charge and end on the $-$ charge.' } }),

      Q(md`A shell carries a **uniform** surface charge $\sigma_0$. What does the method give?`,
        [md`$V_{\text{in}} = \dfrac{\sigma_0R}{\varepsilon_0}$ and $V_{\text{out}} = \dfrac{\sigma_0R^2}{\varepsilon_0r}$`, md`$V_{\text{in}} = 0$ and $V_{\text{out}} = \dfrac{\sigma_0R^2}{\varepsilon_0r}$`, md`$V_{\text{in}} = \dfrac{\sigma_0r}{\varepsilon_0}$ and $V_{\text{out}} = \dfrac{\sigma_0R^2}{\varepsilon_0r}$`, md`$V_{\text{in}} = \dfrac{\sigma_0R}{3\varepsilon_0}$ and $V_{\text{out}} = \dfrac{\sigma_0R^3}{3\varepsilon_0r^2}$`], 0,
        [null, md`The *field* inside is zero, but the potential is the constant surface value, not zero.`, md`$r$ to the first power belongs to $\ell = 1$, which is absent for uniform charge.`, md`Those are the $\ell = 1$ formulas; uniform charge is $\ell = 0$, with factor $\frac{1}{2\ell+1} = 1$.`],
        md`Only $\sigma_0 = \sigma_0P_0$: $A_0 = \frac{\sigma_0R}{\varepsilon_0}$, $B_0 = \frac{\sigma_0R^2}{\varepsilon_0}$. Outside, $\frac{\sigma_0R^2}{\varepsilon_0r} = \frac{Q}{4\pi\varepsilon_0r}$ with $Q = 4\pi R^2\sigma_0$, the familiar shell result. Inside, constant: no field (Griffiths Prob. 3.18b, 4th ed.).`,
        { figHtml: FIG.sigUni }),

      Q(md`For $\sigma_0 = k\cos\theta$, which way does the field inside point, and how big is it?`,
        [md`Radially outward, growing like $r$`, md`Zero, like inside any closed charged shell`, md`$+\dfrac{k}{3\varepsilon_0}\uv z$`, md`$-\dfrac{k}{3\varepsilon_0}\uv z$, uniform`], 3,
        [md`$V_{\text{in}} = \frac{k}{3\varepsilon_0}z$ depends only on $z$; the field has no radial pattern.`, md`Zero field inside holds only for **uniform** charge on a shell (or for a conductor). Here the charge is lopsided.`, md`Sign: $\vb E = -\nabla V$, and $V$ increases with $z$, so $\vb E$ points toward $-z$, from the positive northern cap to the negative southern cap.`, null],
        md`$V_{\text{in}} = \frac{k}{3\varepsilon_0}z$, so $\vb E = -\frac{k}{3\varepsilon_0}\uv z$: uniform, pointing from $+$ to $-$ charge. Remember the number $\frac13$: it comes back for a uniformly polarized sphere (Griffiths Ch. 4, after this exam).`,
        { figHtml: FIG.sigCos }),

      Q(md`For $\sigma_0 = k\cos\theta$, what does the shell look like from outside?`,
        [md`A point charge $Q = 4\pi R^2k$`, md`A pure dipole, $p = \tfrac43\pi R^3k$ along $+z$`, md`Nothing: the field outside is zero`, md`A quadrupole`], 1,
        [md`$\int k\cos\theta\,da = 0$: no net charge.`, null, md`Only the inside of a uniform shell is field-free. Here the outside has a dipole field.`, md`$\cos\theta$ is pure $\ell = 1$.`],
        md`$V_{\text{out}} = \frac{kR^3}{3\varepsilon_0}\frac{\cos\theta}{r^2} = \frac{p\cos\theta}{4\pi\varepsilon_0r^2}$ with $p = \frac{4\pi}{3}R^3k$. Exact at every $r \gt R$, not only far away.`,
        { figHtml: FIG.sigCos }),

      Q(md`In Ex. 3.9 continuity gives $B_\ell = +A_\ell R^{2\ell+1}$, while for the metal sphere in a field you found $B_\ell = -A_\ell R^{2\ell+1}$. Why the different sign?`,
        [md`One of the two is a sign error.`, md`In Ex. 3.9, $A_\ell$ (inside) and $B_\ell$ (outside) live in different regions and must be **equal** at $R$; in Ex. 3.8 they live in the same region and must **cancel** on the grounded sphere.`, md`Because the charge is positive in one case and negative in the other.`, md`Because Ex. 3.8 has a uniform field, which reverses all signs.`], 1,
        [md`Both are right; they express different boundary conditions.`, null, md`The relation holds for each $\ell$ regardless of the sign of the charge.`, md`The uniform field fixes $A_1$; the relation between $A_\ell$ and $B_\ell$ comes from the condition on the sphere.`],
        md`Read the condition. Continuity: $A_\ell R^\ell = B_\ell R^{-(\ell+1)}$. Grounded surface, both terms in one region: $A_\ell R^\ell + B_\ell R^{-(\ell+1)} = 0$. Same algebra, different physics, opposite sign. Always derive the relation from the condition at hand; do not memorize it.`,
        { figHtml: FIG.sigCos }),

      Q(md`A shell carries $\sigma_0 = k(3\cos^2\theta - 1)$. What is $V$ at the center, and how does $V$ fall off far away?`,
        [md`$V(0) = \dfrac{kR}{\varepsilon_0}$; falls off like $1/r$`, md`$V(0) = 0$; falls off like $1/r^2$`, md`$V(0) = 0$; falls off like $1/r^3$`, md`$V(0) = \dfrac{2kR}{5\varepsilon_0}$; falls off like $1/r^3$`], 2,
        [md`The charge averages to zero (it is $2kP_2$), so there is no $\ell = 0$ part: no net charge, no constant inside.`, md`$1/r^2$ is a dipole ($\ell = 1$). This charge is pure $\ell = 2$.`, null, md`The center gets only the $\ell = 0$ part of the potential, which is zero here; $\frac{2kR}{5\varepsilon_0}$ is the amplitude of the $P_2$ term on the shell.`],
        md`$\sigma_0 = 2kP_2$: $A_2 = \frac{2k}{5\varepsilon_0R}$, $B_2 = \frac{2kR^4}{5\varepsilon_0}$. Inside $V = \frac{2k}{5\varepsilon_0R}r^2P_2$, zero at the center (and so is $\vb E$ there). Outside $V = \frac{2kR^4}{5\varepsilon_0}\frac{P_2}{r^3}$: a quadrupole, $1/r^3$.`,
        { figHtml: FIG.sigP2 }),

      Q(md`Across the charged shell, what happens to the **tangential** field $E_\theta$?`,
        [md`It is continuous, which matches $V$ being continuous for every $\theta$.`, md`It jumps by $\sigma_0/\varepsilon_0$.`, md`It is zero on both sides.`, md`It jumps by $\tfrac{\sigma_0}{2\varepsilon_0}$.`], 0,
        [null, md`Only the normal component jumps.`, md`Inside $\sigma_0 = k\cos\theta$, for instance, $E_\theta = \frac{k}{3\varepsilon_0}\sin\theta \ne 0$.`, md`Only the normal component jumps, and by $\sigma_0/\varepsilon_0$.`],
        md`$E_\theta = -\frac1r\frac{\partial V}{\partial\theta}$. If $V_{\text{in}}(R,\theta) = V_{\text{out}}(R,\theta)$ for all $\theta$, their $\theta$-derivatives agree too, so $E_\theta$ is continuous. That is the "$E^\parallel$ continuous" boundary condition from Unit 2, built into condition 3.`,
        { figHtml: FIG.sigCos }),

      Q(md`On the shell, the $\ell$-th term of the potential is $\dfrac{s_\ell R}{(2\ell+1)\varepsilon_0}$, where $s_\ell$ is the $\ell$-th Legendre coefficient of the charge. To hold a shell at a surface potential with a given amplitude in the $\ell$-th harmonic, how does the needed charge depend on $\ell$?`,
        [md`It is the same for every $\ell$.`, md`It decreases like $\frac{1}{2\ell+1}$.`, md`It depends only on whether $\ell$ is even or odd.`, md`It grows like $2\ell+1$: finer patterns need more charge.`], 3,
        [md`The factor $\frac{1}{2\ell+1}$ makes it depend on $\ell$.`, md`Inverted: potential $\propto\frac{s_\ell}{2\ell+1}$ means $s_\ell \propto(2\ell+1)\times$ potential.`, md`Parity decides which $\ell$ appear, not how much charge each needs.`, null],
        md`$s_\ell = \frac{(2\ell+1)\varepsilon_0}{R}c_\ell$. Fine-grained charge patterns partly cancel each other's potential, so you need more charge to make the same surface potential. This is exactly the factor in HW 3.22, next.`,
        { figHtml: FIG.sigP2 }),

      RF(md`
        ### Going the other way: the charge on a sphere held at $V_0(\theta)$ (HW 3.22)

        In Lesson 5 the potential was given and you solved inside and outside separately. The charge that must sit on the sphere to produce that potential is the jump in $E_r$:

        $$\sigma(\theta) = -\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_{r=R}$$

        With $V_0 = \sum c_\ell P_\ell$: $\frac{\partial V_{\text{in}}}{\partial r}\big|_R = \sum\frac{\ell c_\ell}{R}P_\ell$ and $\frac{\partial V_{\text{out}}}{\partial r}\big|_R = -\sum\frac{(\ell+1)c_\ell}{R}P_\ell$, so

        $$\sigma(\theta) = \frac{\varepsilon_0}{R}\sum_\ell(2\ell+1)\,c_\ell\,P_\ell(\cos\theta)$$

        The same factor $2\ell+1$ as in Ex. 3.9, read backwards. Example, the lecture's sphere ($c_0 = \frac k2$, $c_1 = -\frac k2$): $\sigma = \frac{\varepsilon_0}{R}\left[\frac k2 - \frac{3k}{2}\cos\theta\right] = \frac{\varepsilon_0k}{2R}(1 - 3\cos\theta)$. It is **negative** near the north pole: holding that pole at zero next to a hot southern half takes negative charge there.
      `),

      P({
        id: 'HW5-3.22', src: 'HW 5 · Griffiths 3.22', title: 'Charge on a sphere at V₀(θ)', big: true,
        q: md`Suppose the potential $V_0(\theta)$ at the surface of a sphere is specified, and there is no charge inside or outside the sphere. Show that the charge density on the sphere is given by

        $$\sigma(\theta) = \frac{\varepsilon_0}{2R}\sum_{\ell=0}^{\infty}(2\ell+1)^2\,C_\ell\,P_\ell(\cos\theta),$$

        where

        $$C_\ell = \int_0^\pi V_0(\theta)\,P_\ell(\cos\theta)\sin\theta\,d\theta.$$`,
        figHtml: FIG.hw322,
        hints: [
          md`What kind of problem: the potential is given on the sphere, charge sits only on the sphere. Solve inside and outside separately (Lesson 5), then get $\sigma$ from the jump in $E_r$ at $r = R$.`,
          md`Boundary conditions. Inside: (1) finite at $r = 0$, (2) $V(R,\theta) = V_0$. Outside: (1) $V \to 0$, (2) $V(R,\theta) = V_0$. Fourier's trick gives $A_\ell R^\ell = \frac{B_\ell}{R^{\ell+1}} = \frac{2\ell+1}{2}C_\ell$.`,
          md`$\sigma = \varepsilon_0(E_r^{\text{out}} - E_r^{\text{in}}) = -\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_R$. For one $\ell$ the bracket is $-(\ell+1) - \ell = -(2\ell+1)$ times $\frac{1}{R}\cdot\frac{2\ell+1}{2}C_\ell$.`,
        ],
        parts: [
          { lbl: md`Which forms do the two regions take?`, mc: [md`$V_{\text{in}} = \sum A_\ell r^\ell P_\ell$, $V_{\text{out}} = \sum B_\ell r^{-(\ell+1)}P_\ell$`, md`Both $\sum A_\ell r^\ell P_\ell$, with the same $A_\ell$`, md`$V_{\text{in}} = \sum B_\ell r^{-(\ell+1)}P_\ell$, $V_{\text{out}} = \sum A_\ell r^\ell P_\ell$`, md`Both keep $A_\ell$ and $B_\ell$`], a: 0,
            why: [null, md`Outside, $r^\ell$ grows; $V \to 0$ at infinity forbids it.`, md`Backwards: $r^{-(\ell+1)}$ blows up at the center.`, md`Each region contains one of the points $r = 0$ or $r = \infty$, which kills half the terms.`] },
          { lbl: md`In terms of $C_\ell$, the common surface coefficient $A_\ell R^\ell = B_\ell/R^{\ell+1}$ is`, mc: [md`$C_\ell$`, md`$\dfrac{2}{2\ell+1}C_\ell$`, md`$(2\ell+1)C_\ell$`, md`$\dfrac{2\ell+1}{2}C_\ell$`], a: 3,
            why: [md`$C_\ell$ is the raw overlap integral; dividing by the norm $\frac{2}{2\ell+1}$ is needed.`, md`Inverted normalization.`, md`Off by the factor $\frac12$ from the norm $\frac{2}{2\ell+1}$.`, null] },
          { lbl: md`If $V_0(\theta)$ contains the single term $V_0P_2(\cos\theta)$: the $P_2$ coefficient of $\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_{r=R}$`, expr: '-5*V0/R', vars: { V0: [1, 3], R: [1, 2] } },
          { lbl: md`Which expression gives $\sigma$?`, mc: [md`$+\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_R$`, md`$-\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_R$`, md`$-\varepsilon_0\frac{\partial V_{\text{out}}}{\partial r}\big|_R$ only`, md`$\frac{\varepsilon_0}{2}\left[\frac{\partial V_{\text{out}}}{\partial r} + \frac{\partial V_{\text{in}}}{\partial r}\right]_R$`], a: 1,
            why: [md`Sign: $E_r = -\partial V/\partial r$, and $\sigma = \varepsilon_0(E_r^{\text{out}} - E_r^{\text{in}})$.`, null, md`That assumes $E = 0$ inside, true for a conductor but not here: inside, $V$ varies with $\theta$.`, md`The average of the two derivatives is related to the force on the charge, not to $\sigma$.`] },
          { lbl: md`Concrete case $V_0(\theta) = k\cos\theta$: $\sigma(\theta) =$`, expr: '3*eps0*k*cos(theta)/R', vars: { eps0: [0.5, 2], k: [1, 3], theta: [0, 3], R: [1, 2] } },
          { lbl: md`Concrete case $V_0(\theta) = V_0$ (constant): $\sigma =$`, expr: 'eps0*V0/R', vars: { eps0: [0.5, 2], V0: [1, 3], R: [1, 2] } },
        ],
        sol: md`
          **Setup.** Charge sits only on the sphere, so inside and outside are separate charge-free regions, each with its own series.

          **Inside** ($r \le R$). Boundary conditions: (1) $V$ finite at $r = 0$, which kills every $B_\ell$; (2) $V(R,\theta) = V_0(\theta)$. So $V_{\text{in}} = \sum A_\ell r^\ell P_\ell(\cos\theta)$ with (Fourier's trick, Lesson 5)

          $$A_\ell R^\ell = \frac{2\ell+1}{2}\int_0^\pi V_0P_\ell\sin\theta\,d\theta = \frac{2\ell+1}{2}C_\ell \equiv c_\ell$$

          **Outside** ($r \ge R$). (1) $V \to 0$ at infinity kills every $A_\ell$; (2) $V(R,\theta) = V_0(\theta)$ gives $\frac{B_\ell}{R^{\ell+1}} = c_\ell$ with the **same** $c_\ell$. So

          $$V_{\text{in}} = \sum_\ell c_\ell\left(\frac rR\right)^\ell P_\ell, \qquad V_{\text{out}} = \sum_\ell c_\ell\left(\frac Rr\right)^{\ell+1}P_\ell$$

          **Charge.** Gauss's pillbox at the surface: $E_r^{\text{out}} - E_r^{\text{in}} = \sigma/\varepsilon_0$, with $E_r = -\partial V/\partial r$:

          $$\sigma(\theta) = -\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_{r=R}$$

          [[fig:pill]]

          Differentiate term by term at $r = R$:

          $$\frac{\partial V_{\text{in}}}{\partial r}\bigg|_R = \sum_\ell\frac{\ell\,c_\ell}{R}P_\ell, \qquad \frac{\partial V_{\text{out}}}{\partial r}\bigg|_R = -\sum_\ell\frac{(\ell+1)\,c_\ell}{R}P_\ell$$

          $$\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\sum_\ell\frac{(2\ell+1)\,c_\ell}{R}P_\ell$$

          (For a single term $V_0P_2$: $c_2 = V_0$, and the bracket is $-\frac{5V_0}{R}P_2$.) Therefore

          $$\sigma(\theta) = \frac{\varepsilon_0}{R}\sum_\ell(2\ell+1)\,c_\ell\,P_\ell(\cos\theta) = \frac{\varepsilon_0}{2R}\sum_\ell(2\ell+1)^2\,C_\ell\,P_\ell(\cos\theta)$$

          which is the required result.

          **Concrete case $V_0 = k\cos\theta$.** $C_1 = \int_0^\pi k\cos^2\theta\sin\theta\,d\theta = \frac{2k}{3}$, all others zero. $\sigma = \frac{\varepsilon_0}{2R}\cdot9\cdot\frac{2k}{3}\cos\theta = \frac{3\varepsilon_0k}{R}\cos\theta$. Cross-check with Ex. 3.9 run backwards: a shell with $\sigma_0 = K\cos\theta$ has surface potential $\frac{KR}{3\varepsilon_0}\cos\theta$; setting that equal to $k\cos\theta$ gives $K = \frac{3\varepsilon_0k}{R}$. Same.

          **Concrete case $V_0$ = const.** $C_0 = 2V_0$: $\sigma = \frac{\varepsilon_0}{2R}\cdot1\cdot2V_0 = \frac{\varepsilon_0V_0}{R}$, so $Q = 4\pi R^2\sigma = 4\pi\varepsilon_0RV_0$: the capacitance of an isolated sphere.

          **Why this works / what to remember.** Specifying $V$ on the sphere fixes both regions independently; the charge is then the jump in $E_r$. Each harmonic needs $s_\ell = \frac{(2\ell+1)\varepsilon_0}{R}c_\ell$: one factor $2\ell+1$ from the jump ($\ell$ from inside plus $\ell+1$ from outside), and a second one hidden in $C_\ell$ through the normalization.
        `,
        figs: { pill: { svg: FIG.pill, cap: 'The jump in $E_r$ across the sphere is $\\sigma/\\varepsilon_0$.' } },
      }),

      P({
        title: 'Quadrupole shell',
        q: md`A thin shell of radius $R$ carries $\sigma_0(\theta) = k(3\cos^2\theta - 1)$. Find $V$ inside and outside, and the potential and field at the center.`,
        figHtml: FIG.sigP2,
        hints: [
          md`Two regions; four boundary conditions (finite at $0$, $\to 0$ at infinity, continuity, jump). The charge is $2kP_2$: only $\ell = 2$.`,
          md`For $\ell = 2$: $A_2 = \frac{s_2}{5\varepsilon_0R}$, $B_2 = A_2R^5$, with $s_2 = 2k$.`,
          md`$P_2 = \tfrac12(3\cos^2\theta - 1)$, so $2kP_2 = k(3\cos^2\theta - 1)$.`,
        ],
        parts: [
          { lbl: md`$V_{\text{in}}(r,\theta)$`, expr: 'k*r^2*(3*cos(theta)^2 - 1)/(5*eps0*R)', vars: { k: [1, 3], r: [0.2, 1], theta: [0, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`$V_{\text{out}}(r,\theta)$`, expr: 'k*R^4*(3*cos(theta)^2 - 1)/(5*eps0*r^3)', vars: { k: [1, 3], r: [2, 4], theta: [0, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`$V$ at the center`, ans: 0 },
          { lbl: md`$|\vb E|$ at the center`, ans: 0 },
        ],
        sol: md`
          **Boundary conditions:** (1) $V_{\text{in}}$ finite at $0$; (2) $V_{\text{out}} \to 0$; (3) continuity at $R$; (4) $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{\sigma_0}{\varepsilon_0}$ at $R$.

          $\sigma_0 = 2k\,P_2(\cos\theta)$, so only $\ell = 2$. (3) gives $B_2 = A_2R^5$. (4): $-\frac{3B_2}{R^4} - 2A_2R = -\frac{2k}{\varepsilon_0}$, so $5A_2R = \frac{2k}{\varepsilon_0}$ and $A_2 = \frac{2k}{5\varepsilon_0R}$, $B_2 = \frac{2kR^4}{5\varepsilon_0}$.

          $$V_{\text{in}} = \frac{2k}{5\varepsilon_0R}r^2P_2(\cos\theta) = \frac{k\,r^2}{5\varepsilon_0R}\left(3\cos^2\theta - 1\right), \qquad V_{\text{out}} = \frac{kR^4}{5\varepsilon_0r^3}\left(3\cos^2\theta - 1\right)$$

          At the center $V = 0$ and $\vb E = 0$ (every term is $\propto r^2$). In Cartesian form $V_{\text{in}} = \frac{k}{5\varepsilon_0R}(2z^2 - x^2 - y^2)$, so $\vb E = \frac{k}{5\varepsilon_0R}(2x, 2y, -4z)$: zero at the center, growing linearly away from it.

          **Checks.** (3): both give $\frac{kR}{5\varepsilon_0}(3\cos^2\theta - 1)$ at $R$. (4): $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{6k}{5\varepsilon_0}P_2 - \frac{4k}{5\varepsilon_0}P_2 = -\frac{2k}{\varepsilon_0}P_2 = -\frac{\sigma_0}{\varepsilon_0}$. Net charge zero ($\int P_2\sin\theta\,d\theta = 0$), consistent with no $1/r$ term.

          **What to remember:** for a single harmonic, $A_\ell = \frac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$ and $B_\ell = A_\ell R^{2\ell+1}$; done in two lines.
        `,
      }),

      P({
        title: 'Lopsided shell',
        q: md`A thin shell of radius $R$ carries $\sigma_0(\theta) = k(1 + \cos\theta)$: dense near the north pole, zero at the south pole. Find (a) $V$ at the center, (b) $E_z$ inside, (c) $V$ outside, (d) the total charge.`,
        figHtml: FIG.sigOnePlus,
        hints: [
          md`$\sigma_0(\theta) = kP_0 + kP_1$: two harmonics, $s_0 = s_1 = k$. Solve each with the Ex. 3.9 formulas and add.`,
          md`$\ell = 0$: $A_0 = \frac{s_0R}{\varepsilon_0}$ (the uniform-shell result); $\ell = 1$: $A_1 = \frac{s_1}{3\varepsilon_0}$.`,
        ],
        parts: [
          { lbl: md`(a) $V(\text{center})$`, expr: 'k*R/eps0', vars: { k: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(b) $E_z$ inside`, expr: '-k/(3*eps0)', vars: { k: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(c) $V_{\text{out}}(r,\theta)$`, expr: 'k*R^2/(eps0*r) + k*R^3*cos(theta)/(3*eps0*r^2)', vars: { k: [1, 3], R: [1, 2], eps0: [0.5, 2], r: [2, 4], theta: [0, 3] } },
          { lbl: md`(d) total charge`, expr: '4*pi*R^2*k', vars: { R: [1, 2], k: [1, 3] } },
        ],
        sol: md`
          **Regions:** inside and outside the shell. **Boundary conditions:**
          1. $V_{\text{in}}$ finite at $r = 0$: no $B$'s inside.
          2. $V_{\text{out}} \to 0$ at infinity: no $A$'s outside.
          3. $V_{\text{in}} = V_{\text{out}}$ at $r = R$: $B_\ell = A_\ell R^{2\ell+1}$.
          4. $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{\sigma_0}{\varepsilon_0}$ at $r = R$: $A_\ell = \frac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$.

          Superpose the two harmonics:

          - $\ell = 0$ ($s_0 = k$): $A_0 = \frac{kR}{\varepsilon_0}$, $B_0 = \frac{kR^2}{\varepsilon_0}$.
          - $\ell = 1$ ($s_1 = k$): $A_1 = \frac{k}{3\varepsilon_0}$, $B_1 = \frac{kR^3}{3\varepsilon_0}$.

          $$V_{\text{in}} = \frac{kR}{\varepsilon_0} + \frac{k}{3\varepsilon_0}r\cos\theta, \qquad V_{\text{out}} = \frac{kR^2}{\varepsilon_0r} + \frac{kR^3}{3\varepsilon_0}\frac{\cos\theta}{r^2}$$

          (a) $V(0) = \frac{kR}{\varepsilon_0}$. (b) $E_z = -\frac{k}{3\varepsilon_0}$: uniform, pointing away from the dense northern charge. (d) $Q = 4\pi\varepsilon_0B_0 = 4\pi R^2k$, which is $\int k(1 + \cos\theta)\,da$ directly.

          **Checks.** Continuity: both give $\frac{kR}{\varepsilon_0} + \frac{kR}{3\varepsilon_0}\cos\theta$ at $R$. Far away $V \to \frac{Q}{4\pi\varepsilon_0r}$.

          **What to remember:** split the charge into harmonics; each one is a two-line problem; add.
        `,
      }),

      P({
        title: 'Hemispheres of charge',
        q: md`A thin shell of radius $R$ carries $+\sigma_0$ on the northern hemisphere and $-\sigma_0$ on the southern. Using $\int_0^1P_1\,dx = \tfrac12$ and $\int_0^1P_3\,dx = -\tfrac18$, find $A_1$, $A_3$ and the dipole moment of the shell.`,
        figHtml: FIG.sigHem,
        hints: [
          md`Expand the charge first: like the $\pm V_0$ hemispheres, its coefficients are $s_\ell = (2\ell+1)\sigma_0\int_0^1P_\ell\,dx$ for odd $\ell$, zero for even $\ell$.`,
          md`Then $A_\ell = \frac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$ and $p = 4\pi\varepsilon_0B_1$ with $B_1 = A_1R^3$.`,
        ],
        parts: [
          { lbl: md`$A_1$`, expr: 'sigma/(2*eps0)', vars: { sigma: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`$A_3$`, expr: '-sigma/(8*eps0*R^2)', vars: { sigma: [1, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`$p$`, expr: '2*pi*sigma*R^3', vars: { sigma: [1, 3], R: [1, 2] } },
        ],
        sol: md`
          **Boundary conditions** (two regions, as in Ex. 3.9):
          1. $V_{\text{in}}$ finite at $r = 0$.
          2. $V_{\text{out}} \to 0$ at infinity.
          3. $V$ continuous at $r = R$.
          4. $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{\sigma_0(\theta)}{\varepsilon_0}$ at $r = R$, with $\sigma_0(\theta) = \pm\sigma_0$.

          1 and 2 fix the forms; 3 and 4 give, per harmonic, $A_\ell = \frac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$ and $B_\ell = A_\ell R^{2\ell+1}$.

          **Charge harmonics.** Odd data, so odd $\ell$: $s_1 = 3\sigma_0\cdot\frac12 = \frac32\sigma_0$, $s_3 = 7\sigma_0\cdot\left(-\frac18\right) = -\frac78\sigma_0$.

          **Coefficients:**

          $$A_1 = \frac{s_1}{3\varepsilon_0} = \frac{\sigma_0}{2\varepsilon_0}, \qquad A_3 = \frac{s_3}{7\varepsilon_0R^2} = -\frac{\sigma_0}{8\varepsilon_0R^2}$$

          Notice the $(2\ell+1)$ cancels: $A_\ell = \frac{\sigma_0}{\varepsilon_0R^{\ell-1}}\int_0^1P_\ell\,dx$.

          **Dipole:** $B_1 = A_1R^3 = \frac{\sigma_0R^3}{2\varepsilon_0}$ and $p = 4\pi\varepsilon_0B_1 = 2\pi\sigma_0R^3$. Direct check: $p = \int z\,\sigma\,da = 2\cdot\sigma_0\int_0^{\pi/2}R\cos\theta\,2\pi R^2\sin\theta\,d\theta = 2\pi\sigma_0R^3$. Same.

          So inside $V \approx \frac{\sigma_0}{2\varepsilon_0}r\cos\theta - \frac{\sigma_0}{8\varepsilon_0R^2}r^3P_3 + \dots$: a nearly uniform field $-\frac{\sigma_0}{2\varepsilon_0}\uv z$ near the center.
        `,
      }),

      P({
        title: 'Charge on the lecture\'s sphere',
        q: md`The lecture's sphere is held at $V_0(\theta) = k\sin^2(\theta/2)$ with no other charge. Find the surface charge $\sigma(\theta)$ on it, and its value at the north pole.`,
        figHtml: FIG.lecIn,
        hints: [
          md`Use the HW 3.22 result in the form $\sigma = \frac{\varepsilon_0}{R}\sum(2\ell+1)c_\ell P_\ell$, with $c_0 = \frac k2$, $c_1 = -\frac k2$.`,
        ],
        parts: [
          { lbl: md`$\sigma(\theta)$`, expr: 'eps0*k*(1 - 3*cos(theta))/(2*R)', vars: { eps0: [0.5, 2], k: [1, 3], theta: [0, 3], R: [1, 2] } },
          { lbl: md`$\sigma$ at the north pole`, expr: '-eps0*k/R', vars: { eps0: [0.5, 2], k: [1, 3], R: [1, 2] } },
          { lbl: md`Why is $\sigma$ negative near the north pole, where $V_0 = 0$?`, mc: [md`The positive charge on the southern half raises the potential everywhere; negative charge is needed near the north pole to pull it back down to $0$.`, md`A grounded point always carries negative charge.`, md`It is a sign error; $\sigma$ should be $\ge 0$ wherever $V_0 \ge 0$.`], a: 0,
            why: [null, md`A grounded conductor can carry either sign, depending on what is nearby.`, md`$\sigma$ and $V$ need not share a sign; $\sigma$ depends on how $V$ varies around the sphere, not only on its local value.`] },
        ],
        sol: md`
          **Boundary conditions.** Inside: (1) finite at $r = 0$, (2) $V(R,\theta) = k\sin^2(\theta/2)$. Outside: (1) $V \to 0$, (2) the same surface values. These give $V_{\text{in}} = \frac k2\left(1 - \frac rR\cos\theta\right)$ and $V_{\text{out}} = \frac k2\left(\frac Rr - \frac{R^2}{r^2}\cos\theta\right)$ (Lesson 5). The charge is the jump: $\sigma = -\varepsilon_0\left[\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\right]_R$, which is the HW 3.22 formula with $c_0 = \frac k2$, $c_1 = -\frac k2$:

          $$\sigma = \frac{\varepsilon_0}{R}\left[1\cdot\frac k2 + 3\cdot\left(-\frac k2\right)\cos\theta\right] = \frac{\varepsilon_0k}{2R}\left(1 - 3\cos\theta\right)$$

          North pole: $\frac{\varepsilon_0k}{2R}(1 - 3) = -\frac{\varepsilon_0k}{R}$. South pole: $+\frac{2\varepsilon_0k}{R}$. The sign changes at $\cos\theta = \frac13$, $\theta = 70.5^\circ$. Total charge $= 4\pi R^2\cdot\frac{\varepsilon_0k}{2R} = 2\pi\varepsilon_0kR$, matching the far field found in Lesson 5.

          **What to remember:** the charge is set by how the potential is *distributed*, not by its local value: the $\ell = 1$ part is weighted by $3$, the $\ell = 0$ part by $1$.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Charge glued on a shell: two regions, four boundary conditions. Regularity kills half the terms; continuity and the jump fix the rest, one $\ell$ at a time.
          - Jump: $\frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r} = -\frac{\sigma_0}{\varepsilon_0}$ at $R$ (from $E_r^{\text{out}} - E_r^{\text{in}} = \sigma_0/\varepsilon_0$).
          - Per harmonic ($\sigma_0 = \sum s_\ell P_\ell$): $A_\ell = \frac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$, $B_\ell = A_\ell R^{2\ell+1}$.
          - $\sigma_0 = k\cos\theta$: uniform field $-\frac{k}{3\varepsilon_0}\uv z$ inside, dipole $p = \frac43\pi R^3k$ outside.
          - Sphere held at $V_0 = \sum c_\ell P_\ell$: $\sigma = \frac{\varepsilon_0}{R}\sum(2\ell+1)c_\ell P_\ell = \frac{\varepsilon_0}{2R}\sum(2\ell+1)^2C_\ell P_\ell$ (HW 3.22).
      `),
    ],
  };

  // =====================================================================================
  // Lesson 8: two spheres, a charge inside, the axis trick (HW 3.24), exam checklist
  // =====================================================================================
  FIG.shGround = shells({ labA: 'V=0', labB: 'V_0\\cos\\theta' });
  FIG.shPrac = shells({ labA: 'V_0', labB: 'V_0\\cos\\theta' });
  FIG.shCap = shells({ labA: 'V_0', labB: 'V=0' });
  const twoV = (r, c) => (3 - r) / (r * 2) + 9 * (r ** 3 - 1) * c / (r * r * 26);   // a = 1, b = 3, units of V0
  FIG.twoAx = PF.plot({ w: 330, h: 200, x: [1, 3], y: [-1.2, 1.4], zero: true, xl: 'r/a', yl: 'V/V_0',
    xt: [[2, '2'], [3, '3']], yt: [[1, '1'], [-1, '-1']], curves: [{ f: (r) => twoV(r, 1) }, { f: (r) => twoV(r, -1), cls: 'dash' }] });
  FIG.axisQ = (() => {
    const f = PF.fig();
    zAxis(f, 0, 30, -132);
    f.charge(0, -100, { q: '+', lab: 'q', at: 'tr' });
    f.dim(-30, 0, -30, -100, 'd', { at: 'l' });
    f.circle(0, 0, 100, { cls: 'dash dim' });
    f.dot(0, 0, 2.4);
    const p = at(0, 0, 58, 50);
    f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
    f.dot(p[0], p[1], 2.8);
    f.tag(p[0], p[1], 'P', 'r', 7, 'small');
    thetaMark(f, 0, 0, 50, 14);
    return f.svg();
  })();
  // point charge q on the z axis a distance d from the center of a grounded metal sphere: setup (hatched metal),
  // or the image solution (sphere dashed and unhatched, image q' = -qR/d at z = R^2/d)
  const qSphere = (img) => {
    const f = PF.fig();
    const rr = 46, D = 120, xd = -rr - 24;
    if (img) { f.circle(0, 0, rr, { cls: 'dash dim' }); f.dot(0, 0, 2.2); }
    else { f.hatchBand(f.arcPts(0, 0, rr, rr, 0, 360)); f.circle(0, 0, rr, { cls: 'thick' }); }
    zAxis(f, 0, img ? 0 : -rr - 4, -D - 30);
    f.charge(0, -D, { q: '+', lab: 'q', at: 'r' });
    f.line(-rr - 4, 0, xd - 6, 0, { cls: 'dim thin' });
    f.line(-11, -D, xd - 6, -D, { cls: 'dim thin' });
    f.line(xd, 0, xd, -D, { cls: 'dim', arrow: 'both', hs: 6 });
    f.tag(xd, -D / 2, 'd', 'l', 6, 'small');
    const e = at(0, 0, rr, 135);
    f.line(0, 0, e[0], e[1], { cls: 'dim' });
    labRay(f, e[0], e[1], 135, 'R', 5, 'small');
    leader(f, 0, 0, rr, 50, img ? 'V=0' : '\\text{grounded}', 14);
    if (img) f.charge(0, -(rr * rr) / D, { q: '-', lab: "q'", at: 'r', image: true, r: 6 });
    return f.svg();
  };
  FIG.qGround = qSphere(false);
  FIG.qGroundImg = qSphere(true);
  FIG.ring = ringFig({ P: { r: 112, th: 42 } });
  FIG.disk = diskFig({ P: { f: 1.5, th: 50 } });
  FIG.diskHalves = diskFig({ halves: ['A_\\ell', "A'_\\ell"] });
  FIG.cos2 = sph({ lab: 'V_0(\\theta)=V_0\\cos2\\theta', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 });
  FIG.capQ = hemis({ cap: 60, top: 'V_0', bot: 'V=0', botThin: true, topTh: 30, mark: { th: 60, lab: '60^\\circ' } });

  const L8 = {
    id: 'u7-two-axis', title: 'Two spheres, a charge inside, and the axis trick (HW 3.24)',
    steps: [
      RF(md`
        ### Between two spheres: keep both $A_\ell$ and $B_\ell$

        For $a \lt r \lt b$ neither $r = 0$ nor $r = \infty$ is in the region, so no term is killed. Each $\ell$ has two unknowns and gets two equations, one per sphere.

        **Worked.** *The inner sphere (radius $a$) is grounded; the outer sphere (radius $b$) is held at $V_0\cos\theta$. Find $V$ between them.*

        [[fig:setup]]

        **Region:** $a \le r \le b$. **Boundary conditions:**

        1. $V(a,\theta) = 0$.
        2. $V(b,\theta) = V_0\cos\theta$.

        Both conditions are pure $\ell = 1$ (zero has no harmonics at all), so every other $\ell$ gives the homogeneous system $A_\ell a^\ell + B_\ell a^{-(\ell+1)} = 0$, $A_\ell b^\ell + B_\ell b^{-(\ell+1)} = 0$, whose only solution is $A_\ell = B_\ell = 0$. For $\ell = 1$:

        $$A_1a + \frac{B_1}{a^2} = 0, \qquad A_1b + \frac{B_1}{b^2} = V_0 \quad\Longrightarrow\quad A_1 = \frac{V_0b^2}{b^3 - a^3},\quad B_1 = -\frac{V_0a^3b^2}{b^3 - a^3}$$

        $$V(r,\theta) = \frac{V_0b^2}{b^3 - a^3}\left(r - \frac{a^3}{r^2}\right)\cos\theta$$

        **Check:** zero at $r = a$; at $r = b$, $\frac{V_0b^2}{b^3 - a^3}\cdot\frac{b^3 - a^3}{b^2}\cos\theta = V_0\cos\theta$. The charge induced on the grounded inner sphere is $\sigma_a = -\varepsilon_0\frac{\partial V}{\partial r}\big|_a = -\frac{3\varepsilon_0V_0b^2}{b^3 - a^3}\cos\theta$: negative on top, facing the positive part of the outer sphere.

        **Limit check.** Let $b \to \infty$ with $V_0 = -E_0b$, so the outer sphere carries the potential of a uniform field $E_0\uv z$ at radius $b$. Then $\frac{V_0b^2}{b^3 - a^3} \to -E_0$ and $V \to -E_0\left(r - \frac{a^3}{r^2}\right)\cos\theta$: the grounded sphere in a uniform field (Lesson 6).
      `, { setup: { svg: FIG.shGround, cap: 'Inner sphere (radius $a$) grounded; outer sphere (radius $b$) at $V_0\\cos\\theta$. Region: the shaded shell.' } }),

      Q(md`Inner sphere at a constant $V_0$, outer sphere grounded. Which $\ell$ appear between them?`,
        [md`$\ell = 0$ and $\ell = 1$`, md`All $\ell$`, md`None: the field between is zero`, md`$\ell = 0$ only`], 3,
        [md`Neither boundary value depends on $\theta$, so there is no $P_1$ source.`, md`For $\ell \ge 1$ both conditions are homogeneous, which forces $A_\ell = B_\ell = 0$.`, md`The spheres are at different potentials, so there is a radial field.`, null],
        md`Only $\ell = 0$: $V = A_0 + \frac{B_0}{r}$ with $A_0 + B_0/a = V_0$, $A_0 + B_0/b = 0$, giving $V = V_0\frac{a(b - r)}{r(b - a)}$: the spherical capacitor, $C = \frac{4\pi\varepsilon_0ab}{b - a}$.`,
        { figHtml: FIG.shCap }),

      Q(md`In the shell region $a \lt r \lt b$, why are both $A_\ell$ and $B_\ell$ kept?`,
        [md`Because the region contains neither $r = 0$ nor $r = \infty$, so neither radial solution misbehaves there.`, md`Because there are two spheres, so you need twice as many terms.`, md`Because $V$ is not given on the spheres.`, md`Because the region contains charge.`], 0,
        [null, md`The count of surfaces sets how many equations you have; which terms exist is set by which points are in the region.`, md`It is given on both spheres; that is what fixes $A_\ell$ and $B_\ell$.`, md`The region is charge-free; Laplace's equation holds there.`],
        md`$r^\ell$ only misbehaves at infinity and $r^{-(\ell+1)}$ only at the origin. Both points are outside the region, so both terms are allowed, and the two surface conditions fix them.`,
        { figHtml: FIG.shGround }),

      Q(md`Take the worked example (inner sphere grounded, outer at $V_0\cos\theta$) and let $b \to \infty$ with $V_0 = -E_0b$. What does $V$ become?`,
        [md`$0$ everywhere`, md`$-E_0r\cos\theta$, the bare uniform field`, md`$-E_0\left(r - \dfrac{a^3}{r^2}\right)\cos\theta$, the grounded sphere in a uniform field`, md`$-E_0\dfrac{a^3}{r^2}\cos\theta$`], 2,
        [md`$V_0$ grows with $b$, so the potential does not vanish.`, md`The inner sphere still distorts the field; its $a^3/r^2$ term survives.`, null, md`That is only the induced-dipole part; the applied field is still there.`],
        md`$\frac{V_0b^2}{b^3 - a^3} \to -E_0$ as $b \to \infty$. The outer sphere at $-E_0b\cos\theta = -E_0z$ is exactly the potential of a uniform field, so you recover Ex. 3.8. A good habit: test a new answer against a limit you already know.`,
        { figHtml: FIG.shGround }),

      P({
        title: 'Two concentric spheres',
        q: md`The inner sphere (radius $a$) is held at $V_0$ and the outer sphere (radius $b$) at $V_0\cos\theta$. Find (a) $V$ between them and (b) the total charge on the inner sphere.`,
        figHtml: FIG.shPrac,
        hints: [
          md`Region $a \le r \le b$, both $A_\ell$ and $B_\ell$. BC 1: $V(a,\theta) = V_0$ (pure $\ell = 0$). BC 2: $V(b,\theta) = V_0\cos\theta$ (pure $\ell = 1$).`,
          md`$\ell = 0$: $A_0 + B_0/a = V_0$ and $A_0 + B_0/b = 0$. $\ell = 1$: $A_1a + B_1/a^2 = 0$ and $A_1b + B_1/b^2 = V_0$.`,
          md`Charge on the inner sphere: only the $\ell = 0$ part of $\sigma_a = -\varepsilon_0\partial V/\partial r$ survives the integral over the sphere. Or use the $1/r$ term: $Q_a = 4\pi\varepsilon_0B_0$ (Gauss on a sphere just outside $a$).`,
        ],
        parts: [
          { lbl: md`(a) $V(r,\theta)$ for $a \lt r \lt b$`, expr: 'V0*a*(b - r)/(r*(b - a)) + V0*b^2*(r^3 - a^3)*cos(theta)/(r^2*(b^3 - a^3))', vars: { V0: [1, 3], a: [1, 1.8], b: [3, 4], r: [2, 2.9], theta: [0, 3] } },
          { lbl: md`(b) charge on the inner sphere`, expr: '4*pi*eps0*V0*a*b/(b - a)', vars: { eps0: [0.5, 2], V0: [1, 3], a: [1, 1.8], b: [3, 4] } },
        ],
        sol: md`
          **Region** $a \le r \le b$; neither $r = 0$ nor $r = \infty$ is in it, so keep both $A_\ell$ and $B_\ell$. **Boundary conditions:**
          1. $V(a,\theta) = V_0$: pure $\ell = 0$.
          2. $V(b,\theta) = V_0\cos\theta$: pure $\ell = 1$.

          Every $\ell \ge 2$ gets zero from both conditions, so it vanishes.

          **$\ell = 0$:** $A_0 + \frac{B_0}{a} = V_0$, $A_0 + \frac{B_0}{b} = 0$. Subtract: $B_0\left(\frac1a - \frac1b\right) = V_0$, so $B_0 = \frac{V_0ab}{b - a}$ and $A_0 = -\frac{V_0a}{b - a}$. Together: $V_0\frac{a(b - r)}{r(b - a)}$.

          **$\ell = 1$:** as in the worked example, $V_0\frac{b^2}{b^3 - a^3}\left(r - \frac{a^3}{r^2}\right)\cos\theta$, which vanishes at $r = a$ and equals $V_0\cos\theta$ at $r = b$.

          $$V(r,\theta) = V_0\frac{a(b - r)}{r(b - a)} + V_0\frac{b^2\left(r^3 - a^3\right)}{r^2\left(b^3 - a^3\right)}\cos\theta$$

          **Check:** $r = a$: $V_0 + 0$. $r = b$: $0 + V_0\cos\theta$.

          [[fig:twoax]]

          **(b)** By Gauss's law on a sphere just outside $r = a$, only the $1/r$ term carries flux: $Q_a = 4\pi\varepsilon_0B_0 = \frac{4\pi\varepsilon_0V_0ab}{b - a}$. (The $\cos\theta$ part of $\sigma_a$ integrates to zero.) This is $CV_0$ for the spherical capacitor: the $\ell = 1$ part of the outer potential moves charge around on the inner sphere but does not change its total.

          **What to remember:** superposition by $\ell$. Each harmonic is its own $2\times2$ problem.
        `,
        figs: { twoax: { svg: FIG.twoAx, cap: 'For $b = 3a$: $V$ between the spheres along the $+z$ axis (solid) and the $-z$ axis (dashed). Both start at $V_0$ on the inner sphere and end at $\\pm V_0$ on the outer one.' } },
      }),

      RF(md`
        ### A point charge inside a shell

        *A point charge $q$ sits at the center of a thin shell (radius $R$) held at $V_0(\theta)$.* The region $r \lt R$ contains $r = 0$, but now there **is** a charge there, so BC 1 changes: near the center $V$ must behave like $\frac{q}{4\pi\varepsilon_0r}$, and nothing else may blow up. Superpose the point charge and a charge-free solution:

        $$V_{\text{in}} = \frac{q}{4\pi\varepsilon_0r} + \sum_\ell A_\ell r^\ell P_\ell(\cos\theta)$$

        At $r = R$ the point charge contributes the constant $\frac{q}{4\pi\varepsilon_0R}$, which only shifts the $\ell = 0$ match: $A_0 = c_0 - \frac{q}{4\pi\varepsilon_0R}$, while $A_\ell = c_\ell/R^\ell$ for $\ell \ge 1$ as before.

        **Outside** the shell nothing changes: $V_{\text{out}} = \sum c_\ell(R/r)^{\ell+1}P_\ell$ is fixed by $V \to 0$ and the shell's potential (uniqueness). The shell's own charge adjusts so that the total enclosed charge is still $4\pi\varepsilon_0Rc_0$.
      `),

      Q(md`A charge $q$ sits at the center of a shell held at $V_0\cos\theta$. Does $q$ change the potential **outside** the shell?`,
        [md`Yes: add $\dfrac{q}{4\pi\varepsilon_0r}$ outside.`, md`Yes, but only the dipole term.`, md`No. Outside, $V$ is fixed by $V \to 0$ and the given $V(R,\theta)$; the shell's charge rearranges to keep it that way.`, md`It depends on the sign of $q$.`], 2,
        [md`The shell's potential is held fixed by whatever maintains it. Its charge changes by $-q$ to cancel the extra monopole.`, md`The dipole term is set by the $\ell = 1$ part of $V(R,\theta)$, which does not change.`, null, md`The argument is the same for either sign.`],
        md`The outside region is bounded by the shell and infinity, with $V$ specified on both. By uniqueness $V_{\text{out}} = V_0\frac{R^2}{r^2}\cos\theta$ regardless of what is inside. The shell's charge becomes whatever is needed: here total enclosed charge must be zero (no $1/r$ term), so the shell carries $-q$ net.`,
        { figHtml: FIG.ptShell }),

      P({
        title: 'Charge at the center of a shell',
        q: md`A point charge $q$ is at the center of a thin shell of radius $R$ held at $V_0\cos\theta$. Find (a) $V$ inside, (b) $V$ inside on the $+z$ axis at $r = R/2$, (c) the total charge on the shell.`,
        figHtml: FIG.ptShell,
        hints: [
          md`Inside: $V = \frac{q}{4\pi\varepsilon_0r} + \sum A_\ell r^\ell P_\ell$. BC: $V(R,\theta) = V_0\cos\theta$.`,
          md`At $r = R$ the point charge gives the constant $\frac{q}{4\pi\varepsilon_0R}$, which must be cancelled by $A_0$.`,
          md`Outside: $V = V_0\frac{R^2}{r^2}\cos\theta$, with no $1/r$ term. So the total charge (point charge plus shell) is zero.`,
        ],
        parts: [
          { lbl: md`(a) $V_{\text{in}}(r,\theta)$`, expr: 'q/(4*pi*eps0)*(1/r - 1/R) + V0*r*cos(theta)/R', vars: { q: [1, 3], eps0: [0.5, 2], r: [0.2, 1], R: [1, 2], V0: [1, 3], theta: [0, 3] } },
          { lbl: md`(b) $V(R/2, 0)$`, expr: 'q/(4*pi*eps0*R) + V0/2', vars: { q: [1, 3], eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
          { lbl: md`(c) charge on the shell`, expr: '-q', vars: { q: [1, 3] } },
        ],
        sol: md`
          **Inside.** Region $r \le R$, with the point charge at the origin. **BCs:** (1) the only singularity at $r = 0$ is $\frac{q}{4\pi\varepsilon_0r}$ (all $B_\ell$ for $\ell \ge 1$ vanish, and $B_0 = \frac{q}{4\pi\varepsilon_0}$); (2) $V(R,\theta) = V_0\cos\theta$.

          (2): $\frac{q}{4\pi\varepsilon_0R} + A_0 + A_1R\cos\theta + \dots = V_0\cos\theta$, so $A_0 = -\frac{q}{4\pi\varepsilon_0R}$, $A_1 = \frac{V_0}{R}$, others zero:

          $$V_{\text{in}} = \frac{q}{4\pi\varepsilon_0}\left(\frac1r - \frac1R\right) + V_0\frac rR\cos\theta$$

          (b) At $r = R/2$, $\theta = 0$: $\frac{q}{4\pi\varepsilon_0}\cdot\frac1R + \frac{V_0}{2}$.

          (c) Outside: (1) $V \to 0$; (2) $V(R,\theta) = V_0\cos\theta$, so $V_{\text{out}} = V_0\frac{R^2}{r^2}\cos\theta$, with no $1/r$ term. Total enclosed charge zero: the shell carries $-q$ (spread as $-\frac{q}{4\pi R^2}$ plus the $\cos\theta$ part needed for the dipole).

          **What to remember:** a point charge inside adds its own $\frac{q}{4\pi\varepsilon_0r}$ and shifts $A_0$. Superposition handles Poisson's equation here.
        `,
      }),

      RF(md`
        ### The axis trick

        On the $+z$ axis ($\theta = 0$) every $P_\ell(\cos\theta) = P_\ell(1) = 1$, so the general solution becomes a plain power series:

        $$V(r, 0) = \sum_\ell\left(A_\ell r^\ell + \frac{B_\ell}{r^{\ell+1}}\right)$$

        Often you can find $V$ on the axis directly (a ring, a disk, a point charge: the integrals are easy there). Expand it in powers of $r$, read off $A_\ell$ or $B_\ell$, and attach $P_\ell(\cos\theta)$ to each power. Uniqueness guarantees that is the potential everywhere in that region. It works in any **charge-free region of the form $r \lt r_0$ or $r \gt r_0$**, centered on a point of the axis.

        **Worked: a point charge $q$ on the axis at $z = d$.** On the axis between the origin and the charge, $V = \frac{q}{4\pi\varepsilon_0(d - z)} = \frac{q}{4\pi\varepsilon_0d}\left(1 + \frac zd + \frac{z^2}{d^2} + \dots\right)$. So for $r \lt d$:

        $$V(r,\theta) = \frac{q}{4\pi\varepsilon_0}\sum_{\ell=0}^\infty\frac{r^\ell}{d^{\ell+1}}P_\ell(\cos\theta)$$

        and similarly $\frac{q}{4\pi\varepsilon_0}\sum_\ell\frac{d^\ell}{r^{\ell+1}}P_\ell(\cos\theta)$ for $r \gt d$. (This expansion of $1/|\vb r - d\uv z|$ is the starting point of the multipole expansion in Unit 8.) Its $\ell = 1$ term near the origin, $\frac{q\,r\cos\theta}{4\pi\varepsilon_0d^2}$, is the uniform field $-\frac{q}{4\pi\varepsilon_0d^2}\uv z$ that the charge makes at the origin, as it should be.

        [[fig:pq]]
      `, { pq: { svg: FIG.axisQ, cap: 'A point charge on the axis. Inside the dashed sphere $r = d$ the potential is $\\sum r^\\ell/d^{\\ell+1}\\,P_\\ell$; outside it, $\\sum d^\\ell/r^{\\ell+1}\\,P_\\ell$.' } }),

      Q(md`Why can the coefficients be read off from the potential on the $z$ axis alone?`,
        [md`Because $V$ is the same everywhere on a sphere.`, md`Because the potential is largest on the axis.`, md`Because the $P_\ell$ vanish off the axis.`, md`Because $P_\ell(1) = 1$ turns the series into a power series in $r$ on the axis, and a power series determines its coefficients uniquely.`], 3,
        [md`$V$ varies with $\theta$; that is what the $P_\ell$ describe.`, md`Not true in general, and irrelevant.`, md`They do not vanish off the axis; they are just equal to 1 on it.`, null],
        md`On the axis $V(r, 0) = \sum(A_\ell r^\ell + B_\ell r^{-(\ell+1)})$. Two different sets of coefficients cannot give the same function of $r$, so the axis values fix every coefficient, and with them $V$ everywhere in the region.`,
        { figHtml: FIG.axisQ }),

      Q(md`For $r \lt d$, what is the $\ell = 1$ term of the potential of the pictured point charge?`,
        [md`$\dfrac{q\,r\cos\theta}{4\pi\varepsilon_0d^2}$`, md`$\dfrac{q\cos\theta}{4\pi\varepsilon_0r^2}$`, md`$\dfrac{q\,d\cos\theta}{4\pi\varepsilon_0r^2}$`, md`$\dfrac{q\,r\cos\theta}{4\pi\varepsilon_0d}$`], 0,
        [null, md`That decays away from the origin; inside $r \lt d$ the terms must be $r^\ell$.`, md`That is the $\ell = 1$ term for $r \gt d$.`, md`Units: the $\ell$ term is $\frac{r^\ell}{d^{\ell+1}}$, so $\frac{r}{d^2}$.`],
        md`$\frac{q}{4\pi\varepsilon_0}\frac{r}{d^2}P_1(\cos\theta) = \frac{q\,z}{4\pi\varepsilon_0d^2}$. Its gradient is the uniform field $-\frac{q}{4\pi\varepsilon_0d^2}\uv z$, the charge's field at the origin (pointing away from $q$).`,
        { figHtml: FIG.axisQ }),

      P({
        title: 'A charge outside a grounded sphere, by separation of variables',
        q: md`A point charge $q$ sits on the $z$ axis at $z = d$, outside a grounded metal sphere of radius $R$ centered at the origin ($d \gt R$). Solve it with Legendre polynomials instead of images. Outside the metal write

        $$V = \frac{q}{4\pi\varepsilon_0\,|\vb r - d\uv z|} + V_{\text{ind}}, \qquad V_{\text{ind}} = \sum_\ell\frac{B_\ell}{r^{\ell+1}}P_\ell(\cos\theta),$$

        where $V_{\text{ind}}$ is the potential of the charge induced on the sphere. Find (a) $B_0$, (b) $B_1$, (c) the total induced charge, and (d) the point charge whose potential is $V_{\text{ind}}$.`,
        figHtml: FIG.qGround,
        hints: [
          md`What kind of problem: a point charge next to a conductor held at a known potential. Superpose the charge's own potential (it carries the singularity) and a Laplace solution for the induced charge. Region $r \ge R$. Boundary conditions: (1) $V = 0$ on $r = R$; (2) $V \to 0$ as $r \to \infty$, so $V_{\text{ind}}$ has only $B_\ell/r^{\ell+1}$ terms; (3) the only singularity is $q$ itself.`,
          md`To use BC 1 you need the charge's potential on the sphere as a Legendre series. On $r = R$ you have $r \lt d$, so use the axis-trick expansion from the reading: $\dfrac{1}{|\vb r - d\uv z|} = \sum_\ell\dfrac{r^\ell}{d^{\ell+1}}P_\ell(\cos\theta)$.`,
          md`BC 1, one $\ell$ at a time: $\dfrac{q}{4\pi\varepsilon_0}\dfrac{R^\ell}{d^{\ell+1}} + \dfrac{B_\ell}{R^{\ell+1}} = 0$.`,
        ],
        parts: [
          { lbl: md`(a) $B_0$`, expr: '-q*R/(4*pi*eps0*d)', vars: { q: [1, 3], R: [1, 2], d: [3, 5], eps0: [0.5, 2] } },
          { lbl: md`(b) $B_1$`, expr: '-q*R^3/(4*pi*eps0*d^2)', vars: { q: [1, 3], R: [1, 2], d: [3, 5], eps0: [0.5, 2] } },
          { lbl: md`(c) total induced charge on the sphere`, expr: '-q*R/d', vars: { q: [1, 3], R: [1, 2], d: [3, 5] } },
          { lbl: md`(d) $V_{\text{ind}}$ is the potential of`, mc: [md`a charge $-q$ at $z = \dfrac{R^2}{d}$`, md`a charge $-\dfrac{qR}{d}$ at the center`, md`a charge $-\dfrac{qR}{d}$ at $z = \dfrac{R^2}{d}$`, md`a charge $-q$ at $z = -d$, the mirror point`], a: 2,
            why: [md`Wrong size: the total induced charge is $4\pi\varepsilon_0B_0 = -\dfrac{qR}{d}$, not $-q$. Not every field line from $q$ ends on a sphere.`, md`A charge at the center would give only an $\ell = 0$ term. Here every $B_\ell$ is nonzero and $\dfrac{B_{\ell+1}}{B_\ell} = \dfrac{R^2}{d}$: the source sits off center, at $z = R^2/d$.`, null, md`That is the image for a grounded plane. For a sphere the image sits inside the sphere, at $z = R^2/d$, with charge $-qR/d$.`] },
        ],
        sol: md`
          **Region:** $r \ge R$, outside the metal; it contains the charge $q$. **Boundary conditions:**
          1. $V(R,\theta) = 0$ (grounded): fixes the $B_\ell$.
          2. $V \to 0$ as $r \to \infty$: kills every $r^\ell$ term in $V_{\text{ind}}$.
          3. Near $q$, $V$ must look like $\dfrac{q}{4\pi\varepsilon_0|\vb r - d\uv z|}$: the first term does that, and $V_{\text{ind}}$ stays finite everywhere outside the metal.

          **The charge's potential on the sphere.** On $r = R$ you have $r \lt d$, so by the axis trick

          $$\frac{q}{4\pi\varepsilon_0|\vb r - d\uv z|} = \frac{q}{4\pi\varepsilon_0}\sum_\ell\frac{r^\ell}{d^{\ell+1}}P_\ell(\cos\theta)$$

          **BC 1, term by term:**

          $$\frac{q}{4\pi\varepsilon_0}\frac{R^\ell}{d^{\ell+1}} + \frac{B_\ell}{R^{\ell+1}} = 0 \quad\Longrightarrow\quad B_\ell = -\frac{q}{4\pi\varepsilon_0}\,\frac{R^{2\ell+1}}{d^{\ell+1}}$$

          (a) $B_0 = -\dfrac{qR}{4\pi\varepsilon_0d}$.

          (b) $B_1 = -\dfrac{qR^3}{4\pi\varepsilon_0d^2}$. The induced dipole is $p = 4\pi\varepsilon_0B_1 = -\dfrac{qR^3}{d^2}$: it points away from $q$, because the negative induced charge crowds onto the side facing $q$.

          (c) Gauss's law on a big sphere: the induced charge is $4\pi\varepsilon_0B_0 = -\dfrac{qR}{d}$. It is smaller in size than $q$: some field lines from $q$ go off to infinity instead of ending on the sphere.

          (d) Pull out the common factor:

          $$V_{\text{ind}} = \frac{1}{4\pi\varepsilon_0}\left(-\frac{qR}{d}\right)\sum_\ell\frac{\left(R^2/d\right)^\ell}{r^{\ell+1}}P_\ell(\cos\theta)$$

          A point charge $q'$ at $z = b$ has, for $r \gt b$, the potential $\dfrac{q'}{4\pi\varepsilon_0}\sum_\ell\dfrac{b^\ell}{r^{\ell+1}}P_\ell(\cos\theta)$. The two match with $q' = -\dfrac{qR}{d}$ and $b = \dfrac{R^2}{d}$: exactly the image charge of Unit 5 (which calls the distance $a$).

          [[fig:img]]

          **Checks.** $b = R^2/d \lt R$: the image sits inside the sphere, outside the region, as an image must. As $d \to R$ it becomes $-q$ just inside the surface (the plane result); as $d \to \infty$ the induced charge $-qR/d$ goes to zero.

          **What to remember:** separation of variables and images give the same answer, as the uniqueness theorem says they must. Images are faster for $V$ itself; the series hands you the induced charge ($B_0$) and dipole moment ($B_1$) directly.
        `,
        figs: { img: { svg: FIG.qGroundImg, cap: 'The induced potential is that of an image charge $q\' = -qR/d$ at $z = R^2/d$, inside the sphere. The sphere is dashed: the image replaces the metal.' } },
      }),

      Q(md`A ring of charge $Q$ (radius $a$) lies in the $xy$ plane. Which $\ell$ appear in its expansion?`,
        [md`All $\ell$`, md`Odd $\ell$ only`, md`$\ell = 0$ only`, md`Even $\ell$ only`], 3,
        [md`Reflection $z \to -z$ leaves the ring unchanged, which rules out odd terms.`, md`Odd terms would make $V(-z) = -V(z)$ beyond the constant; the ring is symmetric.`, md`Close to the ring the potential is far from spherical; higher even $\ell$ are needed.`, null],
        md`The ring is symmetric under $z \to -z$, so $V(r,\pi - \theta) = V(r,\theta)$: only even $\ell$. You can see it on the axis: $\frac{Q}{4\pi\varepsilon_0\sqrt{z^2 + a^2}}$ is even in $z$.`,
        { figHtml: FIG.ring }),

      P({
        title: 'A ring by the axis trick',
        q: md`A ring of radius $a$ carrying charge $Q$ lies in the $xy$ plane, centered on the origin. On its axis, $V(z) = \dfrac{Q}{4\pi\varepsilon_0\sqrt{z^2 + a^2}}$. Use the axis trick to find $V(r,\theta)$ through the $\ell = 2$ term (a) for $r \gt a$ and (b) for $r \lt a$.`,
        figHtml: FIG.ring,
        hints: [
          md`Both regions are charge-free (the ring sits exactly on $r = a$). Outside use $\sum B_\ell r^{-(\ell+1)}P_\ell$, inside $\sum A_\ell r^\ell P_\ell$.`,
          md`For $z \gt a$: $(z^2 + a^2)^{-1/2} = \frac1z\left(1 + \frac{a^2}{z^2}\right)^{-1/2} = \frac1z - \frac{a^2}{2z^3} + \dots$ For $z \lt a$: $\frac1a\left(1 - \frac{z^2}{2a^2} + \dots\right)$.`,
          md`Replace $z^n$ by $r^nP_n(\cos\theta)$ (or $z^{-(n+1)}$ by $r^{-(n+1)}P_n$) and use $P_2 = \tfrac12(3\cos^2\theta - 1)$.`,
        ],
        parts: [
          { lbl: md`(a) $V$ for $r \gt a$, through $\ell = 2$`, expr: 'Q/(4*pi*eps0)*(1/r - a^2*(3*cos(theta)^2 - 1)/(4*r^3))', vars: { Q: [1, 3], eps0: [0.5, 2], r: [2, 4], a: [0.5, 1.5], theta: [0, 3] } },
          { lbl: md`(b) $V$ for $r \lt a$, through $\ell = 2$`, expr: 'Q/(4*pi*eps0*a)*(1 - r^2*(3*cos(theta)^2 - 1)/(4*a^2))', vars: { Q: [1, 3], eps0: [0.5, 2], r: [0.2, 0.9], a: [1, 2], theta: [0, 3] } },
        ],
        sol: md`
          **Outside** ($r \gt a$; BC: $V \to 0$, so only $B_\ell$). On the axis:

          $$V(z) = \frac{Q}{4\pi\varepsilon_0}\left(\frac1z - \frac{a^2}{2z^3} + \frac{3a^4}{8z^5} - \dots\right) \;\Rightarrow\; V(r,\theta) = \frac{Q}{4\pi\varepsilon_0}\left[\frac1r - \frac{a^2}{2r^3}P_2(\cos\theta) + \frac{3a^4}{8r^5}P_4(\cos\theta) - \dots\right]$$

          Through $\ell = 2$: $\frac{Q}{4\pi\varepsilon_0}\left[\frac1r - \frac{a^2}{4r^3}\left(3\cos^2\theta - 1\right)\right]$. The first term is the point charge $Q$; the second is the ring's quadrupole (a ring is "oblate": $V$ is a bit lower than $\frac{Q}{4\pi\varepsilon_0r}$ along the axis and higher in the plane).

          **Inside** ($r \lt a$; BC: finite at $0$, so only $A_\ell$):

          $$V(r,\theta) = \frac{Q}{4\pi\varepsilon_0a}\left[1 - \frac{r^2}{2a^2}P_2(\cos\theta) + \frac{3r^4}{8a^4}P_4(\cos\theta) - \dots\right]$$

          Through $\ell = 2$: $\frac{Q}{4\pi\varepsilon_0a}\left[1 - \frac{r^2}{4a^2}\left(3\cos^2\theta - 1\right)\right]$.

          **Checks.** Center: $\frac{Q}{4\pi\varepsilon_0a}$ (every bit of charge is at distance $a$). Even $\ell$ only (mirror symmetry). In the plane near the center ($\theta = 90^\circ$, $P_2 = -\tfrac12$) $V$ rises toward the ring, along the axis it falls: the center is a saddle point, as it must be (no minima in a charge-free region).
        `,
      }),

      RF(md`
        ### The disk: when the region is not charge-free

        For a uniformly charged disk (radius $R$, in the plane $\theta = \pi/2$), the outside $r \gt R$ is charge-free and the axis trick works as for the ring. Inside $r \lt R$ it does **not** work directly: the disk passes through the ball. Crossing the disk, $E_z$ jumps by $\sigma/\varepsilon_0$, so $V$ has a kink (it behaves like $-\frac{\sigma}{2\varepsilon_0}|z|$ near the disk), and no single series $\sum A_\ell r^\ell P_\ell$, which is smooth, can reproduce a kink.

        The fix (Griffiths' note): treat the upper and lower hemispheres separately, each charge-free, each with its own $A_\ell$, using the $+z$ axis for the top half and the $-z$ axis for the bottom half.

        [[fig:halves]]
      `, { halves: { svg: FIG.diskHalves, cap: 'The disk cuts the ball $r \\lt R$ into two charge-free halves, each with its own coefficients.' } }),

      Q(md`For the charged disk, why must the region $r \lt R$ be split into two hemispheres?`,
        [md`Because $V$ is not symmetric under $z \to -z$.`, md`Because the disk lies inside the ball, so the ball is not charge-free; $V$ has a kink across the disk that no smooth series $\sum A_\ell r^\ell P_\ell$ can reproduce.`, md`Because the $P_\ell$ are only defined for $0 \le \theta \le \pi/2$.`, md`Because the axis trick only works for $r \gt R$.`], 1,
        [md`$V$ is symmetric under $z \to -z$; that is not the problem.`, null, md`The $P_\ell(\cos\theta)$ are defined on the whole range $0 \le \theta \le \pi$.`, md`It works in any charge-free ball or outer region; each hemisphere is charge-free, so it works there too.`],
        md`Across the disk $\partial V/\partial z$ jumps by $-\sigma/\varepsilon_0$. Each hemisphere is charge-free, so each has its own smooth expansion, and they need not agree term by term. In particular the odd terms flip sign between the halves.`,
        { figHtml: FIG.disk }),

      Q(md`In the upper hemisphere the disk's expansion contains $-\dfrac{\sigma}{2\varepsilon_0}r\,P_1(\cos\theta)$. What does that term become in the lower hemisphere?`,
        [md`The same, $-\dfrac{\sigma}{2\varepsilon_0}rP_1(\cos\theta)$`, md`$0$`, md`$+\dfrac{\sigma}{2\varepsilon_0}rP_1(\cos\theta)$`, md`$-\dfrac{\sigma}{2\varepsilon_0}rP_2(\cos\theta)$`], 2,
        [md`Then $V$ would be odd in $z$ near the disk, but the disk is symmetric: $V(z) = V(-z)$.`, md`The kink must be there on both sides; its slope just has the opposite sign below.`, null, md`The power of $r$ and the index of $P_\ell$ stay paired: $rP_1$.`],
        md`On the $-z$ axis $P_1 = -1$, and $V$ at distance $r$ below equals $V$ at distance $r$ above. So the coefficient of $rP_1$ flips. Together: $-\frac{\sigma}{2\varepsilon_0}r|\cos\theta| = -\frac{\sigma}{2\varepsilon_0}|z|$, exactly the kink of a sheet of charge.`,
        { figHtml: FIG.diskHalves }),

      P({
        id: 'HW5-3.24', src: 'HW 5 · Griffiths 3.24', title: 'The charged disk by the axis trick', big: true,
        q: md`In Prob. 2.25, you found the potential on the axis of a uniformly charged disk:

        $$V(r, 0) = \frac{\sigma}{2\varepsilon_0}\left(\sqrt{r^2 + R^2} - r\right).$$

        (a) Use this, together with the fact that $P_\ell(1) = 1$, to evaluate the first three terms in the expansion (Eq. 3.72) for the potential of the disk at points off the axis, assuming $r \gt R$.

        (b) Find the potential for $r \lt R$ by the same method, using Eq. 3.66. [Note: You must break the interior region up into two hemispheres, above and below the disk. Do not assume the coefficients $A_\ell$ are the same in both hemispheres.]

        (Eq. 3.72 is the outside expansion $V = \sum_\ell B_\ell r^{-(\ell+1)}P_\ell(\cos\theta)$; Eq. 3.66 is the inside one, $V = \sum_\ell A_\ell r^\ell P_\ell(\cos\theta)$. The disk has radius $R$, lies in the plane $\theta = \pi/2$ and is centered on the $z$ axis.)`,
        figHtml: FIG.disk,
        hints: [
          md`You only know $V$ on the axis. Because $P_\ell(1) = 1$, on the $+z$ axis the outside series reads $V(r,0) = \sum_\ell B_\ell/r^{\ell+1}$: expand the given $V(r,0)$ in powers of $1/r$ and compare. Uniqueness does the rest.`,
          md`For $r \gt R$: $\sqrt{r^2 + R^2} = r\left(1 + \frac{R^2}{r^2}\right)^{1/2} = r\left[1 + \frac{R^2}{2r^2} - \frac{R^4}{8r^4} + \frac{R^6}{16r^6} - \dots\right]$.`,
          md`For $r \lt R$, upper half: $\sqrt{r^2 + R^2} - r = R\left[1 + \frac{r^2}{2R^2} - \frac{r^4}{8R^4} + \dots\right] - r$. The $-r$ is an $\ell = 1$ term, $-rP_1$.`,
          md`Lower half: on the $-z$ axis $P_\ell = (-1)^\ell$, and by symmetry $V$ at distance $r$ below the disk equals $V$ at distance $r$ above. So even coefficients are the same and odd ones flip sign.`,
        ],
        parts: [
          { lbl: md`(a) $B_0$`, expr: 'sigma*R^2/(4*eps0)', vars: { sigma: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(a) $B_2$`, expr: '-sigma*R^4/(16*eps0)', vars: { sigma: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(a) $B_4$`, expr: 'sigma*R^6/(32*eps0)', vars: { sigma: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(a) Why are $B_1$ and $B_3$ zero?`, mc: [md`The disk is symmetric under $z \to -z$, so only even $\ell$ appear.`, md`Because $P_1(1) = P_3(1) = 0$.`, md`Because the disk is neutral.`, md`They are not zero; the problem only asks for three terms.`], a: 0,
            why: [null, md`$P_\ell(1) = 1$ for every $\ell$.`, md`The disk carries charge $\sigma\pi R^2$; neutrality would remove $B_0$, not the odd terms.`, md`The expansion of $r\left[(1 + R^2/r^2)^{1/2} - 1\right]$ contains only odd powers of $1/r$, i.e. $r^{-(\ell+1)}$ with even $\ell$.`] },
          { lbl: md`(b) $A_0$`, expr: 'sigma*R/(2*eps0)', vars: { sigma: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(b) $A_1$ in the upper hemisphere`, expr: '-sigma/(2*eps0)', vars: { sigma: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(b) $A_1$ in the lower hemisphere`, expr: 'sigma/(2*eps0)', vars: { sigma: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(b) $A_2$ (both hemispheres)`, expr: 'sigma/(4*eps0*R)', vars: { sigma: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`$V$ in the plane of the disk at $r = 1.2R$ ($\theta = 90^\circ$), from the three outside terms, in units of $\frac{\sigma R}{2\varepsilon_0}$`, ans: 0.46225 },
        ],
        sol: md`
          **(a) Outside, $r \gt R$.** Region charge-free; **BC:** $V \to 0$ at infinity, so $V = \sum_\ell B_\ell r^{-(\ell+1)}P_\ell(\cos\theta)$. On the $+z$ axis, $P_\ell(1) = 1$:

          $$V(r,0) = \sum_\ell\frac{B_\ell}{r^{\ell+1}}$$

          Expand the known axis potential for $r \gt R$:

          $$\frac{\sigma}{2\varepsilon_0}\left(\sqrt{r^2 + R^2} - r\right) = \frac{\sigma}{2\varepsilon_0}\,r\left[\left(1 + \frac{R^2}{r^2}\right)^{1/2} - 1\right] = \frac{\sigma}{2\varepsilon_0}\left[\frac{R^2}{2r} - \frac{R^4}{8r^3} + \frac{R^6}{16r^5} - \dots\right]$$

          Compare powers of $1/r$: $B_0 = \frac{\sigma R^2}{4\varepsilon_0}$, $B_1 = 0$, $B_2 = -\frac{\sigma R^4}{16\varepsilon_0}$, $B_3 = 0$, $B_4 = \frac{\sigma R^6}{32\varepsilon_0}$. Attaching the $P_\ell$:

          $$V(r,\theta) = \frac{\sigma}{2\varepsilon_0}\left[\frac{R^2}{2r} - \frac{R^4}{8r^3}P_2(\cos\theta) + \frac{R^6}{16r^5}P_4(\cos\theta) - \dots\right] \qquad (r \gt R)$$

          **Checks.** Leading term $\frac{\sigma R^2}{4\varepsilon_0r} = \frac{Q}{4\pi\varepsilon_0r}$ with $Q = \sigma\pi R^2$. Only even $\ell$: the disk is symmetric under $z \to -z$, so the odd $B_\ell$ vanish (and the same series is valid below the disk too).

          **(b) Inside, $r \lt R$.** The ball contains the disk, so it is not charge-free. Split it.

          [[fig:halves]]

          *Upper hemisphere* ($0 \le \theta \lt \pi/2$, charge-free; BC: finite at $r = 0$): $V = \sum A_\ell r^\ell P_\ell$. On the $+z$ axis, for $r \lt R$:

          $$\frac{\sigma}{2\varepsilon_0}\left(\sqrt{r^2 + R^2} - r\right) = \frac{\sigma}{2\varepsilon_0}\left[R - r + \frac{r^2}{2R} - \frac{r^4}{8R^3} + \dots\right]$$

          So $A_0 = \frac{\sigma R}{2\varepsilon_0}$, $A_1 = -\frac{\sigma}{2\varepsilon_0}$, $A_2 = \frac{\sigma}{4\varepsilon_0R}$, $A_3 = 0$, $A_4 = -\frac{\sigma}{16\varepsilon_0R^3}$:

          $$V_{\text{upper}} = \frac{\sigma}{2\varepsilon_0}\left[R - rP_1(\cos\theta) + \frac{r^2}{2R}P_2(\cos\theta) - \frac{r^4}{8R^3}P_4(\cos\theta) + \dots\right]$$

          *Lower hemisphere* ($\pi/2 \lt \theta \le \pi$): $V = \sum A'_\ell r^\ell P_\ell$. On the $-z$ axis $P_\ell(-1) = (-1)^\ell$, and by symmetry $V$ at distance $r$ below equals the value at distance $r$ above. So $\sum(-1)^\ell A'_\ell r^\ell = \frac{\sigma}{2\varepsilon_0}\left[R - r + \frac{r^2}{2R} - \dots\right]$: even $A'_\ell = A_\ell$, odd $A'_\ell = -A_\ell$, in particular $A'_1 = +\frac{\sigma}{2\varepsilon_0}$:

          $$V_{\text{lower}} = \frac{\sigma}{2\varepsilon_0}\left[R + rP_1(\cos\theta) + \frac{r^2}{2R}P_2(\cos\theta) - \frac{r^4}{8R^3}P_4(\cos\theta) + \dots\right]$$

          Both halves in one formula: $V = \frac{\sigma}{2\varepsilon_0}\left[R - r|\cos\theta| + \frac{r^2}{2R}P_2(\cos\theta) - \frac{r^4}{8R^3}P_4(\cos\theta) + \dots\right]$, where $r|\cos\theta| = |z|$.

          **Why splitting is legitimate.** $W = V + \frac{\sigma}{2\varepsilon_0}|z|$ has no kink at the disk ($|z|$ has the opposite jump in slope), so $W$ is harmonic in the whole ball, even in $z$, and has an ordinary series of even $\ell$ found from the axis: $W(r,0) = \frac{\sigma}{2\varepsilon_0}\sqrt{r^2 + R^2}$. Subtracting $\frac{\sigma}{2\varepsilon_0}|z|$ gives exactly the result above.

          **Checks.** Center: $V = \frac{\sigma R}{2\varepsilon_0}$, the axis formula at $r = 0$. Slope across the disk near the center: $\partial V/\partial z = -\frac{\sigma}{2\varepsilon_0}$ above and $+\frac{\sigma}{2\varepsilon_0}$ below, a jump of $\sigma/\varepsilon_0$ in $E_z$, as Gauss requires.

          **A number.** In the plane of the disk at $r = 1.2R$: $\theta = 90^\circ$, so $P_2 = -\frac12$ and $P_4 = \frac38$. With $\frac Rr = \frac56$ the three outside terms are

          $$\frac{\sigma R}{2\varepsilon_0}\left[\frac12\cdot\frac56 - \frac18\left(\frac56\right)^3\left(-\frac12\right) + \frac{1}{16}\left(\frac56\right)^5\cdot\frac38\right] = \frac{\sigma R}{2\varepsilon_0}\left[0.41667 + 0.03617 + 0.00942\right] = 0.46225\,\frac{\sigma R}{2\varepsilon_0}$$

          The monopole term alone would be $0.41667$, 10% low: this close to the rim the $\ell = 2$ term matters.

          **Numerical check** (direct integration of $\frac{\sigma}{4\pi\varepsilon_0}\int\frac{da}{\srm}$ over the disk with scipy, in units of $\frac{\sigma R}{2\varepsilon_0}$):

          | point | exact | series |
          |---|---|---|
          | $r = 1.2R$, $\theta = 90^\circ$ | $0.46853$ | $0.46225$ (through $P_4$), $0.46711$ (through $P_8$): slow next to the rim |
          | $r = 2R$, $\theta = 60^\circ$ | $0.25129$ | $0.25139$ (through $P_4$) |
          | $r = 1.5R$, $\theta = 30^\circ$ | $0.31101$ | $0.31038$ (through $P_4$), $0.31099$ (through $P_8$) |
          | $r = 0.5R$, $\theta = 30^\circ$ | $0.64461$ | $0.64493$ (through $P_4$), $0.64462$ (through $P_8$) |
          | $r = 0.5R$, $\theta = 150^\circ$ | $0.64461$ | same as $30^\circ$, by symmetry |
          | $r = 0.3R$, $\theta = 60^\circ$ | $0.84468$ | $0.84467$ (through $P_4$) |

          **What to remember:** $P_\ell(1) = 1$ turns "find $V$ everywhere" into "expand $V$ on the axis". Use it only in charge-free regions bounded by spheres about the origin; if charge cuts through the region, split it.
        `,
        figs: { halves: { svg: FIG.diskHalves, cap: 'Upper half: coefficients $A_\\ell$ from the $+z$ axis. Lower half: $A\'_\\ell$ from the $-z$ axis.' } },
      }),

      RF(md`
        ### Exam checklist for spherical separation of variables

        !!method The full recipe
          1. **Picture and region.** Draw it, put $z$ on the symmetry axis, mark where you want $V$. A charged surface splits space into two regions.
          2. **General solution** per region: $\sum_\ell\left(A_\ell r^\ell + B_\ell r^{-(\ell+1)}\right)P_\ell(\cos\theta)$, plus $\frac{q}{4\pi\varepsilon_0r}$ for a point charge at the center.
          3. **Boundary conditions, numbered.** Finite at $r = 0$ (kills $B_\ell$). $V \to 0$ at infinity (kills $A_\ell$), or $V \to -E_0r\cos\theta$ (leaves only $A_1 = -E_0$). $V(R,\theta) = V_0(\theta)$. Conductor: $V$ = const. Charged shell: continuity plus the jump $-\sigma_0/\varepsilon_0$ in $\partial V/\partial r$. Net charge $Q$: the $1/r$ term is $\frac{Q}{4\pi\varepsilon_0r}$.
          4. **Expand the boundary data** in $P_\ell$: by eye for polynomials in $\cos\theta$ (parity first), by the integral $\frac{2\ell+1}{2}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$ otherwise.
          5. **Match term by term** and solve one $\ell$ at a time.
          6. **Check:** every BC at the end; $V(\text{center})$ = surface average; far field $\frac{Q}{4\pi\varepsilon_0r}$ with the right total charge; symmetry (even/odd $\ell$); units; a known limit.

        !!trap The classic mistakes
          - $r^{-\ell}$ instead of $r^{-(\ell+1)}$.
          - $P_\ell(\theta)$ instead of $P_\ell(\cos\theta)$.
          - Forgetting $\sin\theta$ in the orthogonality integral, or using normalization $1$ instead of $\frac{2}{2\ell+1}$.
          - Keeping $r^{-(\ell+1)}$ inside, or $r^\ell$ (or a constant) outside.
          - Imposing $V \to 0$ in a uniform-field problem.
          - Treating $\cos2\theta$ or $\sin^2\theta$ as a single $P_\ell$, or averaging over $\theta$ instead of over area.
          - Mixing $R(r)$, the radial function, with $R$, the radius.
      `),

      Q(md`A shell is held at $V_0\cos2\theta$. What is the potential at its center?`,
        [md`$0$, since $\cos2\theta$ averages to zero`, md`$V_0$`, md`$-V_0$`, md`$-\dfrac{V_0}{3}$`], 3,
        [md`Its average over $\theta$ is zero, but the center sees the **area** average, which weights the equator (where $\cos2\theta = -1$) more.`, md`$V_0$ is the value at the poles.`, md`$-V_0$ is the value on the equator.`, null],
        md`$\cos2\theta = \frac43P_2 - \frac13P_0$, so $V(0) = c_0 = -\frac{V_0}{3}$. Equivalently $\frac12\int_{-1}^1(2x^2 - 1)\,dx = -\frac13$.`,
        { figHtml: FIG.cos2 }),

      Q(md`A sphere is held at some $V_0(\theta)$ whose surface average is zero. What is its total charge (no other charge anywhere)?`,
        [md`Zero, because $Q = 4\pi\varepsilon_0Rc_0$ and $c_0$ is the surface average`, md`It cannot be determined without the full $V_0(\theta)$`, md`Positive if $V_0$ is positive at the north pole`, md`Equal to $4\pi\varepsilon_0RV_0(0)$`], 0,
        [null, md`Only $c_0$ matters for the total charge; the other harmonics carry none.`, md`The north-pole value is $\sum c_\ell$, not $c_0$.`, md`That uses the north-pole value instead of the average.`],
        md`Outside, the $1/r$ term is $\frac{c_0R}{r}$, so $Q = 4\pi\varepsilon_0Rc_0$. Zero average means zero net charge, even though $\sigma(\theta)$ itself is not zero.`,
        { figHtml: sph({ lab: 'V_0(\\theta),\\ \\text{average } 0' }) }),

      Q(md`On an exam you have solved for $V$ outside a sphere. Which check would catch a wrong $\ell = 0$ coefficient most directly?`,
        [md`Checking that $V$ satisfies Laplace's equation`, md`Checking the field inside`, md`Checking parity`, md`Comparing the $1/r$ term with $\dfrac{Q_{\text{total}}}{4\pi\varepsilon_0r}$ from Gauss's law`], 3,
        [md`$B_0/r$ satisfies Laplace's equation for any $B_0$.`, md`The inside solution does not contain $B_0$.`, md`$\ell = 0$ is even; parity cannot see its size.`, null],
        md`The monopole term must equal $\frac{Q}{4\pi\varepsilon_0r}$, where $Q$ is all the charge inside. If you know $Q$ independently (neutral sphere, given charge, or $\int\sigma\,da$), this check pins $B_0$.`,
        { figHtml: FIG.outRegion }),

      P({
        title: 'Mixed: V₀ cos 2θ',
        q: md`A thin shell of radius $R$ is held at $V_0(\theta) = V_0\cos2\theta$. Find (a) $V$ at the center, (b) the far-field coefficient $\beta$ in $V \approx \beta\dfrac{V_0R}{r}$, (c) $V$ inside, and (d) the surface charge at the north pole.`,
        figHtml: FIG.cos2,
        hints: [
          md`Expand: $\cos2\theta = 2\cos^2\theta - 1 = \frac43P_2 - \frac13P_0$.`,
          md`Inside: $c_\ell(r/R)^\ell$; outside: $c_\ell(R/r)^{\ell+1}$.`,
          md`$\sigma = \frac{\varepsilon_0}{R}\sum(2\ell+1)c_\ell P_\ell$ (HW 3.22). At the north pole every $P_\ell = 1$.`,
        ],
        parts: [
          { lbl: md`(a) $V(\text{center})/V_0$`, ans: -1 / 3 },
          { lbl: md`(b) $\beta$`, ans: -1 / 3 },
          { lbl: md`(c) $V_{\text{in}}(r,\theta)$`, expr: '-V0/3 + 2*V0*r^2*(3*cos(theta)^2 - 1)/(3*R^2)', vars: { V0: [1, 3], r: [0.2, 1], R: [1, 2], theta: [0, 3] } },
          { lbl: md`(d) $\sigma$ at the north pole, in units of $\tfrac{\varepsilon_0V_0}{R}$`, ans: 19 / 3 },
        ],
        sol: md`
          **Boundary conditions.** Inside ($r \le R$): (1) $V$ finite at $r = 0$, so no $B_\ell$; (2) $V(R,\theta) = V_0\cos2\theta$. Outside ($r \ge R$): (1) $V \to 0$, so no $A_\ell$; (2) the same surface values. The charge on the shell is the jump in $E_r$ (HW 3.22).

          **Expand:** $\cos2\theta = \frac43P_2 - \frac13P_0$, so $c_0 = -\frac{V_0}{3}$, $c_2 = \frac{4V_0}{3}$.

          **Inside:** $V_{\text{in}} = -\frac{V_0}{3} + \frac{4V_0}{3}\frac{r^2}{R^2}P_2(\cos\theta) = -\frac{V_0}{3} + \frac{2V_0r^2}{3R^2}\left(3\cos^2\theta - 1\right)$. Center: $-\frac{V_0}{3}$.

          **Outside:** $V_{\text{out}} = -\frac{V_0R}{3r} + \frac{4V_0}{3}\frac{R^3}{r^3}P_2(\cos\theta)$, so $\beta = -\frac13$: the sphere carries net charge $-\frac43\pi\varepsilon_0RV_0$.

          **Charge:** $\sigma = \frac{\varepsilon_0}{R}\left[1\cdot\left(-\frac{V_0}{3}\right) + 5\cdot\frac{4V_0}{3}P_2\right] = \frac{\varepsilon_0V_0}{3R}\left(30\cos^2\theta - 11\right)$. North pole: $\frac{19}{3}\frac{\varepsilon_0V_0}{R}$.

          **Checks.** At $r = R$: $-\frac13 + \frac43P_2 = -\frac13 + 2\cos^2\theta - \frac23 = \cos2\theta$. Center negative even though the poles are at $+V_0$: the equatorial band dominates the area.
        `,
      }),

      P({
        title: 'Mixed: a polar cap',
        q: md`The cap $\theta \lt 60^\circ$ of a thin shell of radius $R$ is held at $V_0$; the rest of the shell is grounded. Find (a) $V$ at the center, (b) the total charge on the shell, and (c) $E_z$ at the center.`,
        figHtml: FIG.capQ,
        hints: [
          md`Not a polynomial in $\cos\theta$ (it jumps), so use $c_\ell = \frac{2\ell+1}{2}\int_{1/2}^1V_0P_\ell(x)\,dx$ (the cap is $x = \cos\theta \gt \frac12$).`,
          md`Center: $c_0$. Charge: $4\pi\varepsilon_0Rc_0$. Field at the center: only the $\ell = 1$ term has a nonzero gradient there, $\vb E = -A_1\uv z$ with $A_1 = c_1/R$.`,
        ],
        parts: [
          { lbl: md`(a) $V(\text{center})/V_0$`, ans: 0.25 },
          { lbl: md`(b) total charge`, expr: 'pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
          { lbl: md`(c) $E_z$ at the center`, expr: '-9*V0/(16*R)', vars: { V0: [1, 3], R: [1, 2] } },
        ],
        sol: md`
          **Boundary conditions.** Inside ($r \le R$): (1) $V$ finite at $r = 0$, which kills every $B_\ell$; (2) $V(R,\theta) = V_0$ for $\theta \lt 60^\circ$ and $0$ otherwise, which gives $A_\ell R^\ell = c_\ell$. Outside: (1) $V \to 0$, (2) the same surface values, so $B_\ell = c_\ell R^{\ell+1}$.

          **Coefficients** (data $V_0$ for $\frac12 \lt x \le 1$, else $0$):

          $$c_0 = \frac12V_0\left(1 - \frac12\right) = \frac{V_0}{4}, \qquad c_1 = \frac32V_0\int_{1/2}^1x\,dx = \frac32V_0\cdot\frac38 = \frac{9V_0}{16}$$

          (a) $V(0) = c_0 = \frac{V_0}{4}$: the cap covers a quarter of the area, $\frac{1 - \cos60^\circ}{2}$.

          (b) $Q = 4\pi\varepsilon_0Rc_0 = \pi\varepsilon_0RV_0$.

          (c) Inside, $V = c_0 + c_1\frac rR\cos\theta + \dots$; at the center only the $\ell = 1$ term has a gradient, so $\vb E(0) = -\frac{c_1}{R}\uv z = -\frac{9V_0}{16R}\uv z$, pointing away from the hot cap, as expected.

          **What to remember:** center, total charge and central field come from $c_0$ and $c_1$ alone; you never need the full series for these.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Between two spheres keep both $A_\ell$ and $B_\ell$; each $\ell$ is a $2\times2$ system from the two surfaces.
          - A charge $q$ at the center adds $\frac{q}{4\pi\varepsilon_0r}$ and shifts $A_0$; with $V$ given on the shell, the outside does not change.
          - Axis trick: $P_\ell(1) = 1$, so expand $V$ on the axis in powers of $r$ and attach $P_\ell(\cos\theta)$. Point charge: $\frac{q}{4\pi\varepsilon_0}\sum\frac{r^\ell}{d^{\ell+1}}P_\ell$ for $r \lt d$.
          - Charge $q$ at $z = d$ outside a grounded sphere: $B_\ell = -\frac{q}{4\pi\varepsilon_0}\frac{R^{2\ell+1}}{d^{\ell+1}}$, which is the image $-\frac{qR}{d}$ at $\frac{R^2}{d}$.
          - If charge cuts through the region (the disk), split the region; odd terms flip sign between the halves.
          - Before you finish: check every BC, the center value, the far field and a known limit.
      `),
    ],
  };
  const LESSONS_U7 = [ L1, L2, L3, L4, L5, L6, L7, L8,];

  // =====================================================================================
  C.unit({
    id: 'u7', num: 'Unit 7', title: 'Separation of variables: spherical',
    blurb: 'Laplace\'s equation for spheres: Legendre polynomials, reading coefficients by eye, boundary conditions and which terms survive, the sphere with a given potential, the metal sphere in a uniform field, charged shells (HW 3.22), two-sphere problems and the axis trick (HW 3.24).',
    lessons: LESSONS_U7,
  });
})();

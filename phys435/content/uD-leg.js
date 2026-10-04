/* Unit D ladder — Legendre polynomials: separation of variables in spherical coordinates with azimuthal symmetry
   (Griffiths 3.3.2, Ex. 3.6–3.9). Pushes two lessons into the existing unit 'uD' (registered by uD-0.js). */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const DG = Math.PI / 180;
  const at = (cx, cy, rr, th) => [cx + rr * Math.sin(th * DG), cy - rr * Math.cos(th * DG)];
  const P2 = (x) => (3 * x * x - 1) / 2, P3 = (x) => (5 * x ** 3 - 3 * x) / 2;

  // ---------------------------------------------------------------- label helpers
  function labLine(f, p, q, tex, side = 1, gap = 5, t = 0.5, cls = 'small') {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    const nx = (dy / L) * side, ny = (-dx / L) * side;
    const sz = PF.texSize(tex), hw = (sz.w - 8) / 2, hh = (sz.h - 6) / 2;
    const D = Math.abs(nx) * hw + Math.abs(ny) * hh + gap;
    f.label(p[0] + dx * t + nx * D, p[1] + dy * t + ny * D, tex, 'c', cls);
  }
  function labRay(f, x, y, th, tex, gap = 6, cls = '') {
    const ux = Math.sin(th * DG), uy = -Math.cos(th * DG);
    const sz = PF.texSize(tex), D = Math.abs(ux) * sz.w / 2 + Math.abs(uy) * sz.h / 2 + gap;
    f.label(x + ux * D, y + uy * D, tex, 'c', cls);
  }
  function sgn(f, x, y, s, h = 3.4) {
    f.line(x - h, y, x + h, y, { cls: 'glyph' });
    if (s > 0) f.line(x, y - h, x, y + h, { cls: 'glyph' });
  }
  function leader(f, cx, cy, rr, th, tex, len = 16, cls = '') {
    const [x0, y0] = at(cx, cy, rr + 2, th), [x1, y1] = at(cx, cy, rr + len, th);
    f.line(x0, y0, x1, y1, { cls: 'dim thin' });
    const right = Math.sin(th * DG) >= 0;
    const x2 = x1 + (right ? 8 : -8);
    f.line(x1, y1, x2, y1, { cls: 'dim thin' });
    f.label(x2 + (right ? 4 : -4), y1, tex, right ? 'l' : 'r', cls);
    const w = PF.texSize(tex).w, slack = w * 0.15 + 6;
    f.track(x2 + (right ? 4 + w + slack : -4 - w - slack), y1);
  }
  function annulus(f, cx, cy, r1, r2) {
    const A = f.arcPts(cx, cy, r2, r2, 0, 360), B = f.arcPts(cx, cy, r1, r1, 360, 0);
    A.forEach((p) => f.track(p[0], p[1]));
    const d = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
    f.add(`<path class="shade nodecl" fill-rule="evenodd" d="${d(A)}${d(B)}"/>`);
  }
  function zAxis(f, cx, y0, y1, lab = 'z') {
    f.line(cx, y0, cx, y1, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(cx + 6, y1 + 2, lab, 'l', 'small accent');
  }
  function thetaMark(f, cx, cy, th, r = 15, tex = '\\theta') {
    const a0 = 90 - th, a1 = 90;
    f.arc(cx, cy, r, Math.min(a0, a1), Math.max(a0, a1), { cls: 'dim' });
    const am = ((a0 + a1) / 2) * DG, sz = PF.texSize(tex);
    const D = r + 3 + Math.max(sz.w - 8, sz.h - 6) / 2 + 2;
    f.label(cx + D * Math.cos(am), cy - D * Math.sin(am), tex, 'c', 'small');
  }
  const cosSign = (th) => Math.sign(Math.cos(th * DG));

  // ---------------------------------------------------------------- the sphere figure
  // o: rr, lab/labTh, lab2/lab2Th, metal, inLab(inX,inY), outLab(outX,outY), Pin/Pout {f, th, lab, at}, R:false, Rth,
  //    sig(th) -> sign glyphs, charge 'center' | {x,y,lab,at}, shadeIn, shadeOut, arcs, extra(f, rr)
  function sph(o = {}) {
    const f = PF.fig();
    const rr = o.rr || 62;
    if (o.shadeIn) f.circle(0, 0, rr, { cls: 'shade nodecl' });
    if (o.shadeOut) annulus(f, 0, 0, rr, rr * 1.75);
    if (o.metal) f.hatchBand(f.arcPts(0, 0, rr, rr, 0, 360));
    if (o.arcs) o.arcs.forEach(([a0, a1, cls]) => f.pl(f.arcPts(0, 0, rr, rr, 90 - a0, 90 - a1), { cls }));
    else f.circle(0, 0, rr, { cls: o.dashed ? 'dash dim' : 'thick' });
    if (o.axis !== false) zAxis(f, 0, o.charge === 'center' ? -10 : (o.metal ? -rr - 4 : 0), -rr - 34);
    if (o.R !== false) {
      const th = o.Rth ?? 120;
      const e = at(0, 0, rr, th);
      if (o.metal) { f.line(0, 0, e[0], e[1], { cls: 'dim' }); labRay(f, e[0], e[1], th, 'R', 5, 'small'); }
      else { f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 6 }); labLine(f, [0, 0], e, 'R', th < 180 ? 1 : -1, 4, 0.55); }
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
    const pt = (Pp, outside) => {
      const p = at(0, 0, rr * Pp.f, Pp.th);
      if (Math.abs(Pp.th) > 2 || outside) f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], Pp.lab || 'P', Pp.at || (Pp.th < 0 ? 'l' : 'r'), 7, 'small');
      if (Math.abs(Pp.th) > 2 && Math.abs(Pp.th) < 178 && !Pp.noMark) thetaMark(f, 0, 0, Pp.th, 14);
    };
    if (o.Pin) pt(o.Pin, false);
    if (o.Pout) pt(o.Pout, true);
    if (o.charge === 'center') f.charge(0, 0, { q: o.chargeSign || '+', lab: o.chargeLab || 'q', at: 'bl' });
    else if (o.charge) f.charge(o.charge.x, o.charge.y, { q: o.charge.q || '+', lab: o.charge.lab || 'q', at: o.charge.at || 'r' });
    if (o.inLab) f.label(o.inX ?? -10, o.inY ?? rr * 0.5, o.inLab, 'c', 'small');
    if (o.outLab) f.label(o.outX ?? -rr * 0.95, o.outY ?? rr * 1.05, o.outLab, 'r', 'small');
    if (o.extra) o.extra(f, rr);
    return f.svg();
  }

  // two concentric spheres; o: labA (inner), labB (outer), metalIn, sigB (glyphs on the outer), shade
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
    else { const e2 = at(0, 0, ra, 300); labRay(f, e2[0], e2[1], 300, 'a', 5, 'small'); }
    f.line(0, 0, eb[0], eb[1], { cls: 'dim', arrow: 'end', hs: 6 });
    labLine(f, [0, 0], eb, 'b', 1, 4, 0.78);
    if (o.sigB) for (let th = 12; th < 180; th += 22) { const s = o.sigB(th); if (!s) continue; for (const sd of [1, -1]) { const [x, y] = at(0, 0, rb + 9, sd * th); sgn(f, x, y, s); } }
    if (o.labA) leader(f, 0, 0, ra, o.labATh ?? 150, o.labA, o.labALen ?? 10);
    if (o.labB) leader(f, 0, 0, o.sigB ? rb + 10 : rb, 40, o.labB, 14);
    return f.svg();
  }

  // hemispheres (or a cap); o: top, bot labels, plus sph options
  function hemis(o = {}) {
    const cap = o.cap ?? 90, g = 3;
    return sph(Object.assign({
      arcs: [[-cap + g, cap - g, 'thick'], [cap + g, 360 - cap - g, 'thick']],
      lab: o.top || 'V_0', labTh: o.topTh ?? 34, lab2: o.bot || '0', lab2Th: o.botTh ?? 146, Rth: 300,
    }, o));
  }

  // metal sphere (or a charged shell when o.shell) in a uniform field E0 z-hat
  function fieldSetup(o = {}) {
    const f = PF.fig();
    const rr = 42;
    if (!o.shell) f.hatchBand(f.arcPts(0, 0, rr, rr, 0, 360));
    f.circle(0, 0, rr, { cls: 'thick' });
    if (o.sig) for (let th = 12; th < 180; th += 22) { const s = o.sig(th); if (!s) continue; for (const sd of [1, -1]) { const [x, y] = at(0, 0, rr - 9, sd * th); sgn(f, x, y, s, 3); } }
    for (const x of [-120, -88, 88, 120]) f.arrow(x, 66, x, -66, { hs: 7 });
    f.label(128, 0, o.Elab || 'E_0\\,\\hat{\\mathbf z}', 'l');
    f.label(-128, 0, o.farLab || '\\text{far away}', 'r', 'small accent');
    zAxis(f, 0, -rr - 4, -rr - 34);
    const e = at(0, 0, rr, 135);
    if (!o.shell) { f.line(0, 0, e[0], e[1], { cls: 'dim' }); labRay(f, e[0], e[1], 135, 'R', 4, 'small'); }
    else { f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 5 }); labRay(f, e[0], e[1], 135, 'R', 6, 'small'); }
    if (o.lab) f.label(0, rr + 30, o.lab, 't', 'small');
    if (o.P) { const p = at(0, 0, rr * o.P.f, o.P.th); f.dot(p[0], p[1], 2.8); f.tag(p[0], p[1], o.P.lab || 'P', o.P.at || 'r', 7, 'small'); }
    return f.svg();
  }

  // a ring of charge Q (radius a) in the xy plane
  function ringFig() {
    const f = PF.fig();
    const ra = 58;
    f.ellipse(0, 0, ra, 15, { half: 'back', cls: 'thick dash' });
    f.ellipse(0, 0, ra, 15, { half: 'front', cls: 'thick' });
    zAxis(f, 0, 30, -100);
    f.dim(0, 0, ra, 0, 'a', { off: 26, at: 'b' });
    f.label(ra + 6, 8, 'Q', 'l', 'small');
    return f.svg();
  }

  // ring of charge Q at height h above the origin (radius a); optional field point
  function ringH(o = {}) {
    const f = PF.fig();
    const S = o.S || 18, ra = 4 * S, hs = 3 * S;
    f.ellipse(0, -hs, ra, 16, { half: 'back', cls: 'thick dash' });
    f.ellipse(0, -hs, ra, 16, { half: 'front', cls: 'thick' });
    zAxis(f, 0, 34, -hs - 48);
    f.dot(0, 0, 2.4);
    f.label(-6, 4, 'O', 'tr', 'small accent');
    f.line(-ra - 30, 0, ra + 30, 0, { cls: 'dim dash thin' });
    f.dim(-ra - 18, 0, -ra - 18, -hs, o.hLab || '3c', { off: 0, at: 'l' });
    f.label(ra + 8, -hs, 'Q,\\ \\text{radius } 4c', 'l', 'small');
    if (o.P) {
      const p = at(0, 0, o.P.r * S, o.P.th);
      f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], 'P', 'r', 7, 'small');
      thetaMark(f, 0, 0, o.P.th, 13);
    }
    return f.svg();
  }

  // ring on a sphere of radius D at polar angle alpha (dashed sphere)
  function ringTilt() {
    const f = PF.fig();
    const D = 72, al = 50;
    f.circle(0, 0, D, { cls: 'dash dim' });
    const y = -D * Math.cos(al * DG), rx = D * Math.sin(al * DG), ry = rx * 0.25;
    f.ellipse(0, y, rx, ry, { half: 'back', cls: 'thick dash' });
    f.ellipse(0, y, rx, ry, { half: 'front', cls: 'thick' });
    zAxis(f, 0, D + 16, -D - 30);
    f.line(0, 0, rx, y, { cls: 'dim' });
    labLine(f, [0, 0], [rx, y], 'D', -1, 4, 0.5);
    thetaMark(f, 0, 0, al, 18, '\\alpha');
    f.label(rx + 10, y, 'Q', 'l', 'small');
    f.dot(0, 0, 2.4);
    return f.svg();
  }

  // two equal charges at z = +-d, the sphere r = d dashed, field point at r = d/2 on the equator
  function twoCharges() {
    const f = PF.fig();
    const dd = 70;
    f.circle(0, 0, dd, { cls: 'dash dim' });
    f.line(0, dd + 30, 0, -dd - 34, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(6, -dd - 32, 'z', 'l', 'small accent');
    f.charge(0, -dd, { q: '+', lab: 'q', at: 'tr' });
    f.charge(0, dd, { q: '+', lab: 'q', at: 'br' });
    f.label(-12, -dd - 16, 'z=d', 'r', 'small');
    f.label(-12, dd + 16, 'z=-d', 'r', 'small');
    f.line(0, 0, dd / 2, 0, { cls: 'dim dash thin' });
    f.dot(dd / 2, 0, 2.8);
    f.tag(dd / 2, 0, 'P', 'r', 7, 'small');
    f.dot(0, 0, 2.2);
    f.label(-8, 6, 'O', 'tr', 'small accent');
    f.label(dd * 0.25, -12, '\\tfrac d2', 'c', 'small');
    return f.svg();
  }

  // a hemispherical bowl of uniform charge (northern half), southern half absent (dashed)
  function bowl() {
    const f = PF.fig();
    const rr = 62;
    f.pl(f.arcPts(0, 0, rr, rr, 0, 180), { cls: 'thick' });
    f.pl(f.arcPts(0, 0, rr, rr, 180, 360), { cls: 'dash dim' });
    zAxis(f, 0, rr + 20, -rr - 34);
    for (let th = 12; th < 90; th += 22) for (const sd of [1, -1]) { const [x, y] = at(0, 0, rr + 9, sd * th); sgn(f, x, y, 1); }
    leader(f, 0, 0, rr + 10, 50, '\\sigma\\ (\\text{uniform})', 16);
    const e = at(0, 0, rr, 240);
    f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 6 });
    labLine(f, [0, 0], e, 'R', -1, 4, 0.55);
    const p = at(0, 0, rr * 0.5, 0);
    f.dot(p[0], p[1], 2.8);
    f.tag(p[0], p[1], 'z', 'r', 7, 'small');
    f.text(0, rr + 34, 'no charge on the lower half', 't');
    return f.svg();
  }

  // grounded metal shell (hatched outside r = R) with a point charge inside at z = d
  function gshell(o = {}) {
    const f = PF.fig();
    const rr = 62, t = 13;
    const outer = f.arcPts(0, 0, rr + t, rr + t, 0, 360);
    f.hatchBand(outer.concat(f.arcPts(0, 0, rr, rr, 360, 0)));
    f.circle(0, 0, rr, { cls: 'thick' });
    f.circle(0, 0, rr + t, { cls: 'thick' });
    zAxis(f, 0, 0, -rr - t - 30);
    f.charge(0, -24, { q: '+', lab: 'q', at: 'r' });
    f.dim(-22, 0, -22, -24, 'd', { off: 0, at: 'l' });
    f.dot(0, 0, 2.2);
    const e = at(0, 0, rr, 130);
    f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 6 });
    labLine(f, [0, 0], e, 'R', 1, 4, 0.55);
    f.label(rr + t + 8, 30, 'V=0', 'l', 'small');
    f.ground(0, rr + t);
    return f.svg();
  }

  // solution: image charge for P14 (shell dashed, unhatched)
  function gshellImage() {
    const f = PF.fig();
    const rr = 60, dd = 24, zi = rr * rr / dd;
    f.circle(0, 0, rr, { cls: 'dash dim' });
    f.line(0, rr + 18, 0, -zi - 30, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(6, -zi - 28, 'z', 'l', 'small accent');
    f.charge(0, -dd, { q: '+', lab: 'q', at: 'r' });
    f.charge(0, -zi, { q: '-', lab: "q'=-\\dfrac{qR}{d}", at: 'r', image: true });
    f.label(-12, -zi, 'z=\\dfrac{R^2}{d}', 'r', 'small');
    f.label(-12, -dd, 'z=d', 'r', 'small');
    f.label(rr + 8, 24, 'r=R', 'l', 'small accent');
    return f.svg();
  }

  // inside / outside / between (theory figure)
  function regionsRow() {
    const a = PF.fig(); a.circle(0, 0, 40, { cls: 'shade nodecl' }); a.circle(0, 0, 40, { cls: 'thick' }); a.dot(0, 0, 2.4); a.label(0, 14, 'r\\lt R', 'c', 'small');
    const b = PF.fig(); annulus(b, 0, 0, 30, 58); b.circle(0, 0, 30, { cls: 'thick' }); b.label(0, 0, 'R', 'c', 'small'); b.label(0, -44, 'r\\gt R', 'c', 'small');
    const c = PF.fig(); annulus(c, 0, 0, 22, 50); c.circle(0, 0, 22, { cls: 'thick' }); c.circle(0, 0, 50, { cls: 'thick' }); c.label(0, 56, 'a\\lt r\\lt b', 't', 'small');
    return PF.row([{ svg: a.svg(), cap: '(i) contains $r = 0$' }, { svg: b.svg(), cap: '(ii) reaches $r \\to \\infty$' }, { svg: c.svg(), cap: '(iii) neither' }]).svg;
  }

  // north and south poles marked
  function polesFig() {
    const f = PF.fig();
    const rr = 62;
    f.circle(0, 0, rr, { cls: 'thick' });
    f.line(0, rr + 18, 0, -rr - 30, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(6, -rr - 28, 'z', 'l', 'small accent');
    f.dot(0, -rr, 2.6); f.dot(0, rr, 2.6); f.dot(rr, 0, 2.6);
    f.tag(0, -rr, '\\theta=0', 'tr', 9, 'small');
    f.tag(0, rr, '\\theta=\\pi', 'br', 9, 'small');
    f.tag(rr, 0, '\\theta=\\tfrac{\\pi}{2}', 'r', 7, 'small');
    return f.svg();
  }

  // four sign patterns of sigma on a sphere (for "which picture")
  function sigRow(list) {
    const items = list.map(([fn, cap]) => {
      const f = PF.fig();
      const rr = 34;
      f.circle(0, 0, rr, { cls: 'thick' });
      f.line(0, rr + 10, 0, -rr - 18, { cls: 'dim', arrow: 'end', hs: 5 });
      for (let th = 10; th < 180; th += 20) { const s = fn(th); if (!s) continue; for (const sd of [1, -1]) { const [x, y] = at(0, 0, rr + 8, sd * th); sgn(f, x, y, s, 3); } }
      return { svg: f.svg(), cap };
    });
    return PF.row(items).svg;
  }

  // ---------------------------------------------------------------- plots
  const xtTheta = [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']];
  const absPlot = () => PF.plot({ w: 320, h: 180, x: [0, Math.PI], y: [0, 1.25], xl: '\\theta', yl: 'V_0(\\theta)/V_0', xt: xtTheta, yt: [[1, '1']],
    curves: [{ f: (t) => Math.abs(Math.cos(t)) }] });
  const antiPlot = () => PF.plot({ w: 320, h: 200, x: [0, Math.PI], y: [-1.7, 1.7], zero: true, xl: '\\theta', yl: 'V_0(\\theta)', xt: xtTheta, yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: (t) => Math.cos(t) + 0.6 * Math.cos(3 * t) }] });
  const sig13 = () => PF.plot({ w: 330, h: 200, x: [0, Math.PI], y: [-2.4, 4.6], zero: true, xl: '\\theta', yl: '\\sigma/(\\varepsilon_0E_0)',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.acos(-1 / 3), '109.5^\\circ'], [Math.PI, '\\pi']], yt: [[4, '4'], [-2, '-2']],
    curves: [{ f: (t) => 3 * Math.cos(t), cls: 'dim dash' }, { f: (t) => 1 + 3 * Math.cos(t) }] });
  const hemiPlot = () => PF.plot({ w: 340, h: 210, x: [0, Math.PI], y: [-0.3, 1.35], zero: true, xl: '\\theta', yl: 'V/V_0', xt: xtTheta, yt: [[1, '1'], [0.5, '\\tfrac12']],
    curves: [
      { f: (t) => (t < Math.PI / 2 ? 1 : NaN), cls: 'dim dash', n: 240 },
      { f: (t) => (t > Math.PI / 2 ? 0 : NaN), cls: 'dim dash', n: 240 },
      { f: (t) => { const x = Math.cos(t); return 0.5 + 0.75 * x - (7 / 16) * P3(x); } },
    ] });

  // ---------------------------------------------------------------- figure instances
  const F = {};
  F.gen = sph({ lab: 'V_0(\\theta)\\ \\text{given}', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 });
  F.outR = sph({ shadeOut: true, lab: '\\text{no charge for } r\\gt R', labTh: 30, labLen: 50 });
  F.regions = regionsRow();
  F.poles = polesFig();
  F.which = sph({ lab: 'V_0(\\theta)=\\ ?' });
  F.sigGen = sph({ sig: cosSign, lab: '\\sigma(\\theta)', inLab: 'V_{\\text{in}}', inX: -14, outLab: 'V_{\\text{out}}', outX: -64, outY: 70 });
  F.genAB = sph({ lab: 'V_0(\\theta)\\ \\text{given}', inLab: 'A_\\ell r^\\ell', inX: -14, outLab: 'B_\\ell r^{-(\\ell+1)}', outX: -60, outY: 72 });
  F.vgiven = sph({ lab: 'V_0(\\theta)\\ \\text{held}', lab2: '\\sigma(\\theta)=?' });
  F.fieldG = fieldSetup({ lab: '\\text{grounded}' });
  F.fieldN = fieldSetup({ lab: '\\text{isolated, neutral}' });
  F.fieldV = fieldSetup({ lab: '\\text{held at } V_0' });
  F.fieldVp = fieldSetup({ lab: '\\text{held at } V_0\\gt 0' });
  F.fieldQ = fieldSetup({ lab: '\\text{net charge } Q' });
  F.fieldV1 = fieldSetup({ lab: '\\text{grounded}', farLab: 'V\\to -E_0r\\cos\\theta+V_1' });
  F.fieldFar = fieldSetup({ lab: '\\text{grounded}', P: { f: 2.3, th: 0, lab: 'P' } });
  F.shellCos2 = fieldSetup({ shell: true, sig: (th) => (Math.abs(th - 90) < 15 ? 0 : 1), lab: '\\sigma=\\sigma_0\\cos^2\\theta\\ (\\text{fixed})' });
  F.shellCos = fieldSetup({ shell: true, sig: cosSign, lab: '\\sigma=\\sigma_0\\cos\\theta\\ (\\text{fixed})' });
  F.shells = shells({ labA: '\\sigma_a(\\theta)', labB: 'V_b(\\theta)' });
  F.sin2 = sph({ lab: 'V_0\\sin^2\\theta', inLab: 'V(0)=?' });
  F.cos3E = sph({ lab: 'V_0\\cos^3\\theta', inLab: '\\mathbf E(0)=?' });
  F.p2far = sph({ lab: 'V_0P_2(\\cos\\theta)', Pout: { f: 1.75, th: -60, lab: 'P' } });
  F.q34 = sph({ lab: 'V_0(2\\cos^2\\theta+\\cos\\theta)', labTh: 30 });
  F.p2sig = sph({ lab: 'V_0P_2(\\cos\\theta)', lab2: '\\sigma=?' });
  F.axisIn = sph({ lab: '\\text{no charge inside}', Pin: { f: 0.55, th: 0, lab: 'V(z)' } });
  F.qcenter = sph({ charge: 'center', lab: 'V_0(\\theta)' });
  F.abs = absPlot();
  F.hemi = hemis({ top: 'V_0', bot: '0' });
  F.hemiE = hemis({ top: 'V_0', bot: '0', inLab: '\\mathbf E(0)=?', inY: 30 });
  F.anti = antiPlot();
  F.sigPics = sigRow([
    [cosSign, '(A)'],
    [(th) => Math.sign(P2(Math.cos(th * DG))), '(B)'],
    [(th) => (th > 165 ? 0 : 1), '(C)'],
    [() => 1, '(D)'],
  ]);
  F.groundIn = shells({ metalIn: true, labA: 'V=0', labB: 'V_0\\cos\\theta' });
  F.metalCos = sph({ metal: true, lab: 'V_0\\cos\\theta\\ ?' });
  F.b0 = sph({ lab: 'V_0(\\theta)', inLab: '+\\dfrac{B_0}{r}\\ ?', inY: 26 });
  F.sigCosE = sph({ sig: cosSign, lab: '\\sigma_0\\cos\\theta', inLab: '\\mathbf E_{\\text{in}}=?' });
  F.sigCos = sph({ sig: cosSign, lab: '\\sigma_0\\cos\\theta' });
  F.far20 = sph({ lab: 'V_0(1+2\\cos\\theta)', labTh: 60, Pout: { f: 1.9, th: 0, lab: 'r=20R' } });
  F.ptd = sph({ dashed: true, R: false, axis: false, extra: (f, rr) => {
    f.line(0, rr + 18, 0, -rr - 34, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(6, -rr - 32, 'z', 'l', 'small accent');
    f.charge(0, -rr, { q: '+', lab: 'q', at: 'tr' }); f.label(-12, -rr - 16, 'z=d', 'r', 'small');
    const p = at(0, 0, rr * 0.55, 60); f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8); f.tag(p[0], p[1], 'P', 'r', 7, 'small'); thetaMark(f, 0, 0, 60, 14);
    f.label(rr * 0.72, rr * 0.82, 'r=d', 'l', 'small accent');
  } });
  F.sigPl = sph({ lab: '\\sigma_0P_\\ell(\\cos\\theta)', Pin: { f: 0.5, th: 0, lab: 'P' } });
  F.sigCos2 = sph({ sig: (th) => (Math.abs(th - 90) < 15 ? 0 : 1), lab: '\\sigma_0\\cos^2\\theta', inLab: '\\mathbf E(0)=?' });
  F.dipIn = shells({ labA: 'k\\cos\\theta', labB: 'V=0' });
  F.axisOut = sph({ lab: '\\text{charges inside}', labTh: 60, Pout: { f: 1.7, th: 0, lab: 'V(z)\\ \\text{known}' }, extra: (f, rr) => {
    f.line(0, rr + 2, 0, rr * 1.7, { cls: 'dim dash thin' }); const y = rr * 1.7; f.dot(0, y, 2.8); f.tag(0, y, 'V=\\ ?', 'r', 7, 'small');
  } });
  F.ring = ringFig();
  F.hemiEq = hemis({ top: 'V_0', bot: '0', extra: (f, rr) => { f.dot(rr, 0, 2.8); f.tag(rr, 0, '\\theta=\\tfrac{\\pi}{2}', 'r', 7, 'small'); } });
  F.outKnown = sph({ lab: 'V_0(\\theta)', outLab: 'V_{\\text{out}}\\ \\text{known}', outX: -60, outY: 72 });
  F.groundCos2 = shells({ metalIn: true, labA: 'V=0', labB: 'V_0\\cos^2\\theta' });
  F.far10 = sph({ lab: 'V_0\\cos^3\\theta', labTh: 60, Pout: { f: 1.9, th: 0, lab: 'r=10R' } });
  F.gshell = gshell();
  F.axisEq = sph({ lab: '\\text{no charge inside}', labTh: 30, labLen: 30, Pin: { f: 0.55, th: 0, lab: 'V(z)' }, extra: (f, rr) => {
    f.dot(-rr, 0, 2.8); f.tag(-rr, 0, '\\theta=\\tfrac{\\pi}{2}', 'l', 7, 'small');
  } });
  F.ringTilt = ringTilt();
  F.cos2t = sph({ lab: 'V_0\\cos2\\theta' });
  F.cosGround = shells({ rb: 116, labA: 'V_0\\cos\\theta', labB: 'V=0' });
  F.cosGround2 = shells({ ra: 45, rb: 90, labA: 'V_0\\cos\\theta', labATh: 140, labALen: 66, labB: 'V=0' });

  // problem figures
  F.p1 = sph({ lab: 'V_0(2-3\\sin^2\\theta)', labTh: 30, Pin: { f: 0.5, th: 0, lab: 'A' }, Pout: { f: 2, th: 90, lab: 'B', at: 't', noMark: true } });
  F.p2 = sph({ lab: 'V_0(\\theta)=\\ ?', labTh: 30, inLab: 'V_{\\text{in}}\\ \\text{given}', inY: 28, extra: (f, rr) => {
    f.dot(0, rr, 2.8); f.tag(0, rr, '\\text{S}', 'br', 8, 'small'); f.dot(-rr, 0, 2.8); f.tag(-rr, 0, '\\text{E}', 'l', 7, 'small');
  } });
  F.p3 = sph({ sig: (th) => (th < 20 || th > 160 ? 0 : 1), lab: '\\sigma_0\\sin^2\\theta' });
  F.p4 = sph({ lab: 'V_0P_3(\\cos\\theta)', labTh: 60, Pout: { f: 2, th: 0, lab: 'r=2R' } });
  F.p5 = twoCharges();
  F.p6 = sph({ lab: 'V_0\\sin^2\\theta\\cos\\theta', inLab: '\\mathbf E(0)=?' });
  F.p7 = bowl();
  F.p8 = shells({ metalIn: true, labA: 'V=0', labB: '\\sigma_0\\cos\\theta', sigB: cosSign });
  F.p9 = sph({ lab: 'V_0\\cos^4\\theta', Pin: { f: 0.5, th: 0, lab: 'P' } });
  F.p10 = shells({ labA: 'k\\cos\\theta', labB: '\\sigma\\ (\\text{uniform})' });
  F.p11 = sph({ charge: 'center', lab: 'V_0(\\cos^2\\theta+\\cos\\theta)', labTh: 30, Pin: { f: 0.5, th: 0, lab: 'P' } });
  F.p14img = gshellImage();
  F.p16 = hemis({ top: 'V_0', bot: '0', Pin: { f: 0.5, th: 0, lab: 'R/2' }, Pout: { f: 2, th: 0, lab: '2R' } });
  F.p17 = ringH({ P: { r: 2, th: 60 } });
  F.sig13 = sig13();
  F.hemiPlot = hemiPlot();

  // =====================================================================================
  // Lesson A: concepts, easy -> brutal
  // =====================================================================================
  const LA = {
    id: 'uD-leg-concepts', title: 'Legendre ladder: concepts, easy → brutal',
    steps: [
      R(md`
        ### Level 1: recognize

        The whole toolkit fits in a few lines. With azimuthal symmetry (nothing depends on $\phi$; $\theta$ measured from the symmetry axis, $x = \cos\theta$):

        $$V(r,\theta) = \sum_{\ell=0}^{\infty}\left(A_\ell\,r^\ell + \frac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta)$$

        $P_0 = 1$, $P_1 = x$, $P_2 = \tfrac12(3x^2 - 1)$, $P_3 = \tfrac12(5x^3 - 3x)$, $P_4 = \tfrac18(35x^4 - 30x^2 + 3)$. Every $P_\ell(1) = 1$, $P_\ell(-x) = (-1)^\ell P_\ell(x)$, and $\int_{-1}^{1}P_\ell P_{\ell'}\,dx = \dfrac{2}{2\ell+1}\delta_{\ell\ell'}$.

        A boundary function $V_0(\theta) = \sum a_\ell P_\ell(\cos\theta)$ has $a_\ell = \dfrac{2\ell+1}{2}\displaystyle\int_0^\pi V_0(\theta)P_\ell(\cos\theta)\sin\theta\,d\theta$. For polynomials in $\cos\theta$, read the $a_\ell$ off by inspection instead.

        Questions in this level take seconds. If one doesn't, reread the box above.
      `),

      Q(md`Which is the general azimuthally symmetric solution of Laplace's equation in spherical coordinates?`,
        [md`$\sum_\ell\left(A_\ell r^\ell + B_\ell r^{-\ell}\right)P_\ell(\cos\theta)$`, md`$\sum_\ell\left(A_\ell r^\ell + B_\ell r^{-(\ell+1)}\right)P_\ell(\cos\theta)$`, md`$\sum_\ell\left(A_\ell e^{\ell r} + B_\ell e^{-\ell r}\right)P_\ell(\cos\theta)$`, md`$\sum_\ell\left(A_\ell r^\ell + B_\ell r^{-(\ell+1)}\right)\cos(\ell\theta)$`], 1,
        [md`$r^{\pm n}$ is the 2-D polar pattern (cylinders). In 3-D the radial equation $\frac{d}{dr}\left(r^2R'\right) = \ell(\ell+1)R$ gives $r^\ell$ and $r^{-(\ell+1)}$; $r^{-\ell}$ fails it (try $\ell = 0$: $r^0$ twice, and $1/r$ is missing).`, null, md`Exponentials come from Cartesian separation, where the separation constant multiplies $X$ with no powers of the coordinate. The spherical radial equation is equidimensional, so its solutions are powers.`, md`$\cos\ell\theta$ solves $\Theta'' = -\ell^2\Theta$, the cylindrical angular equation. The polar equation here has the $\sin\theta$ weights, and its regular solutions are $P_\ell(\cos\theta)$.`],
        md`The radial equation $\dfrac{d}{dr}\left(r^2\dfrac{dR}{dr}\right) = \ell(\ell+1)R$ with $R = r^k$ gives $k(k+1) = \ell(\ell+1)$, so $k = \ell$ or $k = -(\ell+1)$. The angular equation's solutions that stay finite at both poles are $P_\ell(\cos\theta)$. Product, then sum.`,
        { figHtml: F.gen }),

      Q(md`Outside a sphere there is no charge. The $\ell = 2$ angular part is $P_2(\cos\theta)$. Which radial function goes with it if $V \to 0$ far away?`,
        [md`$r^{-2}$`, md`$r^2$`, md`$r^{-3}$`, md`$\ln r$`], 2,
        [md`$k = -2$ gives $k(k+1) = 2$, not $\ell(\ell+1) = 6$. The decaying partner of $r^\ell$ is $r^{-(\ell+1)}$, one power faster than you might guess.`, md`$r^2$ solves the radial equation but blows up as $r \to \infty$; it belongs inside.`, null, md`Logs appear only in 2-D (cylindrical) problems, and only with $n = 0$.`],
        md`$k(k+1) = 6$ has roots $k = 2$ and $k = -3$. Far-away decay kills $r^2$, leaving $r^{-3}P_2(\cos\theta)$: the quadrupole falloff.`,
        { figHtml: F.outR }),

      Q(md`For region (iii), the charge-free shell $a \lt r \lt b$, which radial functions may appear?`,
        [md`only $r^\ell$`, md`only $r^{-(\ell+1)}$`, md`neither, $V$ is constant there`, md`both $r^\ell$ and $r^{-(\ell+1)}$`], 3,
        [md`$r^\ell$ alone is forced only when the region contains $r = 0$, where $r^{-(\ell+1)}$ would blow up. Region (iii) never reaches $r = 0$.`, md`$r^{-(\ell+1)}$ alone is forced only when the region reaches infinity. Region (iii) stops at $b$.`, md`Nothing makes $V$ constant in a charge-free shell; the boundary data on $r = a$ and $r = b$ decide it.`, null],
        md`You drop a family only when it misbehaves somewhere **inside the region**. $r^{-(\ell+1)}$ misbehaves at $0$, $r^\ell$ at $\infty$. Region (iii) contains neither, so both stay, and you need two conditions per $\ell$ (one on each surface) to fix $A_\ell$ and $B_\ell$.`,
        { figHtml: F.regions }),

      Q(md`What is $P_5(\cos\theta)$ at the south pole?`,
        [md`$-1$`, md`$+1$`, md`$0$`, md`$-\tfrac12$`], 0,
        [null, md`$+1$ is the north-pole value, $P_\ell(1) = 1$. At the south pole $x = -1$ and parity gives $(-1)^5 = -1$.`, md`$0$ is $P_5$ at the equator ($x = 0$): odd polynomials vanish there.`, md`$-\tfrac12$ is $P_2(0)$, the equator value of $P_2$.`],
        md`$P_\ell(-1) = (-1)^\ell P_\ell(1) = (-1)^\ell$. Odd $\ell$: $-1$. Remember: $P_\ell(1) = 1$ at the north pole, parity at the south, and odd $P_\ell$ vanish on the equator.`,
        { figHtml: F.poles }),

      Q(md`Which boundary potential contains exactly one Legendre polynomial?`,
        [md`$V_0\cos^2\theta$`, md`$V_0\sin^2\theta$`, md`$V_0\lvert\cos\theta\rvert$`, md`$V_0\cos\theta$`], 3,
        [md`$\cos^2\theta = \tfrac13 + \tfrac23P_2$: two terms ($\ell = 0$ and $2$).`, md`$\sin^2\theta = \tfrac23 - \tfrac23P_2$: two terms.`, md`$\lvert\cos\theta\rvert$ has a kink at the equator, so no polynomial can equal it: infinitely many even $\ell$.`, null],
        md`$\cos\theta = P_1$ exactly. A power $\cos^n\theta$ always mixes $P_n, P_{n-2}, \dots$ down to $P_0$ or $P_1$; it is a single $P_\ell$ only for $n = 0, 1$.`,
        { figHtml: F.which }),

      R(md`
        ### Level 2: set up

        Region first, then numbered conditions, then which terms die. At a charged shell $r = R$ the two conditions are continuity and the jump:

        $$V_{\text{in}}(R,\theta) = V_{\text{out}}(R,\theta), \qquad \frac{\partial V_{\text{out}}}{\partial r} - \frac{\partial V_{\text{in}}}{\partial r}\bigg|_{R} = -\frac{\sigma(\theta)}{\varepsilon_0}$$

        A conductor gives $V = \text{const}$ on its surface and $\sigma = -\varepsilon_0\,\partial V/\partial n$ afterwards. A uniform field far away gives $V \to -E_0r\cos\theta$.
      `),

      Q(md`A thin shell of radius $R$ carries $\sigma(\theta)$. Which is the correct jump condition?`,
        [md`$V_{\text{out}} - V_{\text{in}} = \sigma/\varepsilon_0$ at $r = R$`, md`$\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = +\dfrac{\sigma}{\varepsilon_0}$`, md`$\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma}{\varepsilon_0}$`, md`$\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma}{2\varepsilon_0}$`], 2,
        [md`$V$ is continuous across a surface charge (finite field, zero thickness). Only the normal derivative jumps.`, md`$E_r$ jumps by $+\sigma/\varepsilon_0$, and $E_r = -\partial V/\partial r$, so the derivative jumps by $-\sigma/\varepsilon_0$. The sign flip is the trap.`, null, md`$\sigma/2\varepsilon_0$ is what the sheet itself contributes on one side. The full jump from just inside to just outside is $\sigma/\varepsilon_0$.`],
        md`$E^\perp_{\text{out}} - E^\perp_{\text{in}} = \sigma/\varepsilon_0$ with $E_r = -\partial V/\partial r$. With a minus sign on both sides of the equation, you get $\partial_rV_{\text{out}} - \partial_rV_{\text{in}} = -\sigma/\varepsilon_0$.`,
        { figHtml: F.sigGen }),

      Q(md`A thin shell is held at $V_0(\theta)$, with no other charge anywhere. Inside $V = \sum A_\ell r^\ell P_\ell$, outside $V = \sum B_\ell r^{-(\ell+1)}P_\ell$. Continuity at $r = R$ gives`,
        [md`$B_\ell = A_\ell R^{2\ell+1}$`, md`$B_\ell = -A_\ell R^{2\ell+1}$`, md`$B_\ell = A_\ell R^{2\ell}$`, md`$B_\ell = A_\ell/R^{2\ell+1}$`], 0,
        [null, md`The minus sign belongs to a **grounded sphere in a field**, where $A_\ell$ and $B_\ell$ live in the same region and must cancel at $r = R$. Here they are in different regions and must agree.`, md`Units: $B_\ell/R^{\ell+1} = A_\ell R^\ell$ needs $R^{2\ell+1}$, not $R^{2\ell}$.`, md`Inverted. Solve $A_\ell R^\ell = B_\ell R^{-(\ell+1)}$ for $B_\ell$.`],
        md`$A_\ell R^\ell = B_\ell/R^{\ell+1}$ so $B_\ell = A_\ell R^{2\ell+1}$. Equivalently, each term outside is the inside term at the surface times $(R/r)^{\ell+1}$: $V_{\text{out}} = \sum a_\ell(R/r)^{\ell+1}P_\ell$ if $V_0 = \sum a_\ell P_\ell$.`,
        { figHtml: F.genAB }),

      Q(md`A shell is **held** at $V_0(\theta)$ (by whatever means), with nothing else around. Which condition do you NOT use to find $V$?`,
        [md`$V$ finite at $r = 0$`, md`$V \to 0$ as $r \to \infty$`, md`$V_{\text{in}}(R,\theta) = V_{\text{out}}(R,\theta) = V_0(\theta)$`, md`the jump in $\partial V/\partial r$ at $r = R$`], 3,
        [md`Needed: it kills every $B_\ell$ inside.`, md`Needed: it kills every $A_\ell$ outside.`, md`Needed: it fixes the coefficients on both sides.`, null],
        md`With $V$ given, the first three conditions already determine $V$ everywhere. The jump condition then becomes an **output**: it tells you the $\sigma(\theta)$ that must be on the shell. With $\sigma$ given it is the other way around: you don't know $V(R)$, so you use continuity plus the jump.`,
        { figHtml: F.vgiven }),

      Q(md`A grounded metal sphere sits in a field that is $E_0\hat{\mathbf z}$ far away. What is the far-field condition?`,
        [md`$V \to -E_0r\cos\theta$`, md`$V \to 0$`, md`$V \to +E_0r\cos\theta$`, md`$V \to -E_0r$`], 0,
        [null, md`The field does not vanish far away, so neither does $V$; it grows like $r$.`, md`$-\nabla(E_0z) = -E_0\hat{\mathbf z}$: wrong direction.`, md`$-E_0r$ is spherically symmetric; its field is radial, not uniform.`],
        md`A uniform field $E_0\hat{\mathbf z}$ has $V = -E_0z = -E_0r\cos\theta$ (plus a constant, set to zero on the equatorial plane). Far away the sphere's influence dies off and only this survives. It is a pure $\ell = 1$ condition, so it selects $A_1 = -E_0$.`,
        { figHtml: F.fieldG }),

      Q(md`Two concentric shells, $r = a$ and $r = b$, split space into three regions. For one fixed $\ell$, how many unknown coefficients are there?`,
        [md`$6$`, md`$4$`, md`$3$`, md`$2$`], 1,
        [md`Six would be two per region, but the inner region loses $B_\ell$ (finite at $0$) and the outer loses $A_\ell$ (zero at $\infty$).`, null, md`Count again: the middle region keeps both $A_\ell$ and $B_\ell$.`, md`Two is the count for a single shell (one inside, one outside).`],
        md`Inside: $A_\ell$. Middle: $A_\ell$, $B_\ell$. Outside: $B_\ell$. Four unknowns, and each surface supplies two conditions (continuity plus the jump, or the given potential on both sides): four equations.`,
        { figHtml: F.shells }),

      R(md`
        ### Level 3: the standard cases

        Four facts carry most problems:

        - The center: $V(0) = A_0$ is the **average** of $V$ over any sphere around it, and $\mathbf E(0) = -A_1\hat{\mathbf z}$ comes from $\ell = 1$ alone.
        - The total charge comes from $\ell = 0$ alone: outside, $B_0 = Q_{\text{enc}}/4\pi\varepsilon_0$.
        - A shell held at $V_0\sum a_\ell P_\ell$ carries $\sigma = \dfrac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell$.
        - On the axis $\theta = 0$ every $P_\ell = 1$, so $V(z) = \sum(A_\ell z^\ell + B_\ell z^{-(\ell+1)})$. Know $V$ on the axis, and you know every coefficient.
      `),

      Q(md`A thin shell is held at $V_0\sin^2\theta$. What is $V$ at its center?`,
        [md`$V_0/3$`, md`$0$`, md`$V_0/2$`, md`$2V_0/3$`], 3,
        [md`$V_0/3$ is the center value for $V_0\cos^2\theta$. Here $\sin^2\theta = 1 - \cos^2\theta$ averages to $1 - \tfrac13$.`, md`$\sin^2\theta$ vanishes only at the poles; its average over the sphere is clearly positive.`, md`$\tfrac12$ is the average of $\sin^2$ over $\theta$ uniformly, but the sphere weights each $\theta$ by $\sin\theta$, which favours the equator.`, null],
        md`$V(0) = A_0 = a_0V_0$, the sphere average. $\sin^2\theta = \tfrac23 - \tfrac23P_2$, so $V(0) = \tfrac23V_0$. Check: $\langle\cos^2\theta\rangle = \tfrac13$ over a sphere, so $\langle\sin^2\theta\rangle = \tfrac23$.`,
        { figHtml: F.sin2 }),

      Q(md`A thin shell of radius $R$ is held at $V_0\cos^3\theta$. What is $\mathbf E$ at the center?`,
        [md`$-\dfrac{V_0}{R}\,\hat{\mathbf z}$`, md`$0$, because $\cos^3\theta$ is an $\ell = 3$ function`, md`$+\dfrac{3V_0}{5R}\,\hat{\mathbf z}$`, md`$-\dfrac{3V_0}{5R}\,\hat{\mathbf z}$`], 3,
        [md`That would be right for $V_0\cos\theta$. $\cos^3\theta$ holds only $\tfrac35$ of a $P_1$.`, md`$\cos^3\theta = \tfrac35P_1 + \tfrac25P_3$. It is not pure $\ell = 3$; it contains a $P_1$ piece, and that piece makes a field at the center.`, md`Sign: $V = \tfrac{3V_0}{5R}z + \dots$ near the center, so $E_z = -\partial V/\partial z \lt 0$. The field points from the high-potential north toward the south.`, null],
        md`$\cos^3\theta = \tfrac35P_1 + \tfrac25P_3$. Inside, $V = V_0\left[\tfrac35\tfrac rR P_1 + \tfrac25\left(\tfrac rR\right)^3P_3\right]$. Only the $r^1$ term has a nonzero gradient at $r = 0$: $\mathbf E(0) = -\tfrac{3V_0}{5R}\hat{\mathbf z}$.`,
        { figHtml: F.cos3E }),

      Q(md`A thin shell is held at $V_0P_2(\cos\theta)$, with no other charge. Far away, $V$ falls off like`,
        [md`$1/r$`, md`$1/r^2$`, md`$1/r^3$`, md`$1/r^4$`], 2,
        [md`$1/r$ needs an $\ell = 0$ term, i.e. net charge. $P_2$ averages to zero, so the shell is neutral.`, md`$1/r^2$ is the dipole ($\ell = 1$) falloff. There is no $P_1$ here.`, null, md`$1/r^4$ is $\ell = 3$.`],
        md`Outside, $V = V_0(R/r)^3P_2(\cos\theta)$. The far field is set by the **lowest** $\ell$ present, here $\ell = 2$: $V \sim 1/r^3$, a pure quadrupole.`,
        { figHtml: F.p2far }),

      Q(md`A thin shell of radius $R$ is held at $V_0(2\cos^2\theta + \cos\theta)$. What is the total charge on it?`,
        [md`$\dfrac{8\pi\varepsilon_0RV_0}{3}$`, md`$0$`, md`$12\pi\varepsilon_0RV_0$`, md`$\dfrac{4\pi\varepsilon_0RV_0}{3}$`], 0,
        [null, md`The $\cos\theta$ part integrates to zero, but $2\cos^2\theta$ does not: it has an $\ell = 0$ piece.`, md`$12\pi$ comes from adding the coefficients $2 + 1$ as if they were all $\ell = 0$. Only the $P_0$ part of $2\cos^2\theta$, which is $\tfrac23$, counts.`, md`$\tfrac{4\pi}{3}$ is the charge for $V_0\cos^2\theta$; the factor 2 was dropped.`],
        md`$2\cos^2\theta + \cos\theta = \tfrac23 + P_1 + \tfrac43P_2$. Outside, the $\ell = 0$ term is $\tfrac23V_0R/r = Q/(4\pi\varepsilon_0r)$, so $Q = \tfrac83\pi\varepsilon_0RV_0$. The $\ell \ge 1$ parts of $\sigma$ all integrate to zero over the sphere.`,
        { figHtml: F.q34 }),

      Q(md`A thin shell of radius $R$ is held at $V_0P_2(\cos\theta)$. What is $\sigma(\theta)$?`,
        [md`$\dfrac{3\varepsilon_0V_0}{R}P_2(\cos\theta)$`, md`$\dfrac{2\varepsilon_0V_0}{R}P_2(\cos\theta)$`, md`$\dfrac{5\varepsilon_0V_0}{R}P_2(\cos\theta)$`, md`$0$, since $V$ is continuous`], 2,
        [md`$3 = \ell + 1$ is only the outside derivative. The inside derivative adds $\ell = 2$ more.`, md`$2 = \ell$ is only the inside derivative.`, null, md`$V$ is continuous, but its slope is not: inside it grows as $r^2$, outside it falls as $r^{-3}$. The kink is the charge.`],
        md`$\partial_r\left[V_0(R/r)^3\right] = -3V_0/R$ and $\partial_r\left[V_0(r/R)^2\right] = 2V_0/R$ at $r = R$. $\sigma = -\varepsilon_0(-3 - 2)V_0/R\cdot P_2 = \dfrac{5\varepsilon_0V_0}{R}P_2$. In general the factor is $2\ell + 1$.`,
        { figHtml: F.p2sig }),

      Q(md`Compare a **grounded** metal sphere in a uniform field $E_0\hat{\mathbf z}$ with an **isolated, neutral** one (zero of potential on the far equatorial plane). What changes?`,
        [md`The neutral sphere gets an extra $Q/4\pi\varepsilon_0r$ term.`, md`The neutral sphere has no induced dipole.`, md`The neutral sphere floats at $V = E_0R$.`, md`Nothing: the solutions are identical.`], 3,
        [md`Neutral means $Q = 0$, so that term is zero.`, md`Induction does not need a ground connection: charge just moves from one side to the other.`, md`By symmetry the sphere's potential equals that of the equatorial plane, which is $0$.`, null],
        md`A neutral conductor in this field is an equipotential, and by the up-down antisymmetry of the field it must sit at the equatorial-plane potential, $0$. So "grounded" and "isolated neutral" give the same boundary conditions and, by uniqueness, the same $V = -E_0\left(r - R^3/r^2\right)\cos\theta$. Grounding matters only when something breaks the symmetry (Level 6).`,
        { figHtml: F.fieldN }),

      Q(md`Inside a charge-free sphere (azimuthal symmetry), the potential on the $z$ axis is $V(z) = V_0\left(1 + z^2/R^2\right)$. What is $V(r,\theta)$?`,
        [md`$V_0\left(1 + \dfrac{r^2\cos^2\theta}{R^2}\right)$`, md`$V_0\left(1 + \dfrac{r^2}{R^2}\right)$`, md`$V_0\left(1 + \dfrac{r^2}{R^2}P_2(\cos\theta)\right)$`, md`$V_0\left(1 + \dfrac{r^2}{R^2}P_1(\cos\theta)^2\right)$`], 2,
        [md`This just writes $z = r\cos\theta$. It agrees on the axis but $\nabla^2(z^2) = 2 \ne 0$: it is not a solution.`, md`No angle at all: this is $V$ on the axis spread over every direction, and $\nabla^2 r^2 = 6 \ne 0$.`, null, md`$P_1^2 = \cos^2\theta$; same as the first option and not harmonic.`],
        md`On the axis, $V = \sum A_\ell z^\ell$. Match powers: $A_0 = V_0$, $A_2 = V_0/R^2$. Off the axis each $z^\ell$ becomes $r^\ell P_\ell(\cos\theta)$, because $r^\ell P_\ell$ is the unique harmonic function of that form equal to $z^\ell$ on the axis.`,
        { figHtml: F.axisIn }),

      Q(md`A point charge $q$ sits at the center of a thin shell held at $V_0(\theta)$. Inside, $V = \dfrac{q}{4\pi\varepsilon_0r} + \sum A_\ell r^\ell P_\ell$. What is $A_0$?`,
        [md`$\langle V_0\rangle$, the average of $V_0(\theta)$`, md`$\langle V_0\rangle + \dfrac{q}{4\pi\varepsilon_0R}$`, md`$-\dfrac{q}{4\pi\varepsilon_0R}$`, md`$\langle V_0\rangle - \dfrac{q}{4\pi\varepsilon_0R}$`], 3,
        [md`At $r = R$ the point charge adds a constant $\frac{q}{4\pi\varepsilon_0R}$ to the left side, which $A_0$ must cancel.`, md`Sign: $A_0 + \frac{q}{4\pi\varepsilon_0R} = \langle V_0\rangle$.`, md`This forgets the shell's own $\ell = 0$ part.`, null],
        md`Match $\ell = 0$ at $r = R$: $\frac{q}{4\pi\varepsilon_0R} + A_0 = \langle V_0\rangle$. The point charge only touches $\ell = 0$ because it is spherically symmetric about the center. The higher $A_\ell$ are the same as without the charge.`,
        { figHtml: F.qcenter }),

      R(md`
        ### Level 4: one twist

        Now the shortcuts get tested. Use symmetry before integrating:

        - $V_0(\pi - \theta) = V_0(\theta)$ (mirror-symmetric about the equator): only **even** $\ell$.
        - $V_0(\pi - \theta) = -V_0(\theta)$: only **odd** $\ell$, so no charge and $V = 0$ on the whole equatorial plane.
        - A function with a kink or a jump is not a polynomial in $\cos\theta$: infinitely many terms.
        - Strip off a constant to expose a symmetry: a hemisphere at $V_0$ is $\tfrac{V_0}{2}$ plus an odd function.
      `),

      Q(md`A shell is held at $V_0\lvert\cos\theta\rvert$ (plotted). Which $\ell$ appear?`,
        [md`$\ell = 1$ only`, md`$\ell = 0$ and $\ell = 2$ only`, md`odd $\ell$ only`, md`every even $\ell$, infinitely many`], 3,
        [md`$P_1 = \cos\theta$ is negative in the south. $\lvert\cos\theta\rvert$ is even about the equator, and $P_1$ is odd.`, md`Two even terms give a smooth polynomial. $\lvert\cos\theta\rvert$ has a corner at $90^\circ$, which no finite sum can make.`, md`Odd $\ell$ are antisymmetric about the equator; this function is symmetric.`, null],
        md`$\lvert\cos\theta\rvert$ is unchanged by $\theta \to \pi - \theta$, so all odd coefficients vanish. The corner at the equator needs infinitely many terms: $a_0 = \tfrac12$, $a_2 = \tfrac58$, $a_4 = -\tfrac{3}{16}$, $\dots$`,
        { figHtml: F.abs }),

      Q(md`The northern hemisphere is held at $V_0$, the southern at $0$. Which $\ell$ appear?`,
        [md`$\ell = 0$ and odd $\ell$`, md`odd $\ell$ only`, md`even $\ell$ only`, md`every $\ell$`], 0,
        [null, md`Odd only would make the average zero. The average is $V_0/2$, so $\ell = 0$ is present.`, md`The data is lopsided north-south; even terms can't produce that.`, md`Subtract $V_0/2$: what is left is $\pm V_0/2$, antisymmetric. So all even $\ell \ge 2$ vanish.`],
        md`$V_0(\theta) = \tfrac{V_0}{2} + \left(\pm\tfrac{V_0}{2}\right)$. The constant is $\ell = 0$; the step is odd about the equator, so odd $\ell$ only: $a_1 = \tfrac34$, $a_3 = -\tfrac{7}{16}$, $a_5 = \tfrac{11}{32}$, $\dots$`,
        { figHtml: F.hemi }),

      Q(md`A shell's potential is antisymmetric about the equator, $V_0(\pi - \theta) = -V_0(\theta)$, as plotted. Which statement is NOT guaranteed?`,
        [md`The shell carries no net charge.`, md`$V = 0$ on the entire equatorial plane, inside and outside.`, md`The far field falls off as $1/r^3$.`, md`$V = 0$ at the center.`], 2,
        [md`Guaranteed: only odd $\ell$, no $\ell = 0$, no net charge.`, md`Guaranteed: every odd $P_\ell(0) = 0$, at every $r$.`, null, md`Guaranteed: $V(0) = A_0 = 0$.`],
        md`Only odd $\ell$ appear. Generically $\ell = 1$ is present, so the far field is a dipole, $V \sim 1/r^2$. A $1/r^3$ falloff would need $\ell = 1$ to vanish *and* $\ell = 2$ to be present, and $\ell = 2$ is even, so it cannot be.`,
        { figHtml: F.anti }),

      Q(md`A shell carries $\sigma = s\,(P_0 + P_1)$ with $s \gt 0$. Which picture shows its sign pattern?`,
        [md`(A)`, md`(B)`, md`(C)`, md`(D)`], 2,
        [md`(A) is $\sigma \propto P_1$: equal and opposite halves. Adding $P_0$ lifts the whole curve so it never goes negative.`, md`(B) is $\sigma \propto P_2$: positive caps, negative band. No $P_2$ here.`, null, md`(D) is uniform, $\sigma \propto P_0$. With $P_1$ added it is not uniform: it vanishes at the south pole.`],
        md`$\sigma = s(1 + \cos\theta)$: largest ($2s$) at the north pole, positive everywhere, zero only at the south pole. That is (C). Reading pictures: $P_1$ = one sign change at the equator; $P_2$ = two sign changes at $54.7^\circ$ and $125.3^\circ$; a $P_0$ shift moves the zeros.`,
        { figHtml: F.sigPics }),

      Q(md`A grounded metal sphere of radius $a$ sits inside a concentric shell of radius $b$ held at $V_0\cos\theta$. In the gap, $V$ has the form`,
        [md`$A\left(r - \dfrac{a^3}{r^2}\right)\cos\theta$`, md`$Ar\cos\theta$`, md`$A\left(r + \dfrac{a^3}{r^2}\right)\cos\theta$`, md`$A\left(r - \dfrac{a^2}{r}\right)\cos\theta$`], 0,
        [null, md`$Ar\cos\theta$ ignores the inner sphere: it is not zero at $r = a$.`, md`With the plus sign $V(a,\theta) = 2Aa\cos\theta \ne 0$, so the grounded condition fails. The two terms must cancel at $r = a$, which takes the minus sign.`, md`$r - a^2/r$ is the 2-D (cylinder) combination. In 3-D the $\ell = 1$ partner of $r$ is $1/r^2$.`],
        md`Only $\ell = 1$ is driven. BC $V(a,\theta) = 0$ gives $A_1a + B_1/a^2 = 0$, so $B_1 = -A_1a^3$. The form is the same as a grounded sphere in a uniform field; the outer shell supplies the "field".`,
        { figHtml: F.groundIn }),

      Q(md`A problem reads: "a solid metal sphere is held at $V_0\cos\theta$." What is wrong?`,
        [md`Nothing; solve as usual.`, md`$V_0\cos\theta$ is not a solution of Laplace's equation.`, md`You'd need a dielectric to support it.`, md`A conductor is an equipotential, so its surface can't have a $\theta$-dependent potential.`], 3,
        [md`Charges in a conductor move until $V$ is constant. A metal surface can't hold $V_0\cos\theta$.`, md`Boundary data need not satisfy Laplace's equation; only $V$ in the region does. This isn't the problem.`, md`A dielectric nearby changes nothing about the metal: its surface is still one equipotential. The issue is the word "metal".`, null],
        md`Nonuniform surface potentials belong to **non-conducting** shells (or insulated patches) held at that potential by some external means. Metal gets a single constant. If you see a $\theta$-dependent surface potential, the surface is not a conductor; if you see "conductor", write $V = \text{const}$.`,
        { figHtml: F.metalCos }),

      Q(md`Inside a shell held at $V_0(\theta)$ (nothing at the center), a student writes $V_{\text{in}} = \sum A_\ell r^\ell P_\ell + B_0/r$, arguing "$B_0/r$ is fine because $\ell = 0$ is just a constant angular part." What does that term actually describe?`,
        [md`A point charge at the origin.`, md`The shell's own net charge.`, md`Nothing physical: it integrates to zero.`, md`A uniform field.`], 0,
        [null, md`The shell's net charge shows up **outside**, as $B_0/r$ there. Inside, a uniform shell gives a constant.`, md`$\nabla^2(1/r) = -4\pi\delta^3(\mathbf r)$: it does not vanish at the origin, so it is a point charge, not nothing.`, md`A uniform field is $r\cos\theta$, the $\ell = 1$ $r^\ell$ term.`],
        md`$1/r$ solves Laplace everywhere except $r = 0$, where it hides a delta function. Keeping it inside means putting a charge $4\pi\varepsilon_0B_0$ at the center. If the problem has none, BC "finite at $r = 0$" kills it, along with every other $B_\ell$.`,
        { figHtml: F.b0 }),

      Q(md`A non-conducting shell carries $\sigma_0\cos\theta$. What is $\mathbf E$ inside?`,
        [md`$0$: charge on a closed shell gives no field inside`, md`uniform, $-\dfrac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$`, md`uniform, $+\dfrac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$`, md`proportional to $r$`], 1,
        [md`Zero inside is true for a **uniform** shell (or a conductor). A $\cos\theta$ distribution has $\ell = 1$, and $\ell = 1$ inside is $A_1r\cos\theta = A_1z$: a uniform field.`, null, md`The field points from the positive (north) cap toward the negative (south) cap: $-\hat{\mathbf z}$.`, md`$\propto r$ would be an $\ell = 2$ term. Only $\ell = 1$ is present.`],
        md`Ex. 3.9: $V_{\text{in}} = \dfrac{\sigma_0}{3\varepsilon_0}r\cos\theta = \dfrac{\sigma_0}{3\varepsilon_0}z$, so $\mathbf E = -\dfrac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$, uniform. Outside it is a pure dipole with $p = \tfrac43\pi R^3\sigma_0$.`,
        { figHtml: F.sigCosE }),

      Q(md`A shell (radius $R$) is held at $V_0(1 + 2\cos\theta)$. At $r = 20R$ on the $+z$ axis, what fraction of $V$ comes from the $\ell = 1$ term?`,
        [md`about $0.5\%$`, md`about $9\%$`, md`about $50\%$`, md`about $1\%$`], 1,
        [md`$0.5\%$ is the $\ell = 1$ term itself, $2(R/r)^2 = 0.005$ in units of $V_0$. The question asks for its share of $V$, which is $0.005/0.055$.`, null, md`Comparable only near the shell. Each extra $\ell$ costs another factor $R/r = 1/20$.`, md`$1\%$ would make the $\ell = 1$ term about $100$ times smaller than the $\ell = 0$ term. It is only $2(R/r) = \tfrac1{10}$ of it: one extra power of $R/r$, times the coefficient ratio $2$.`],
        md`Outside: $V = V_0\left[\tfrac Rr + 2\left(\tfrac Rr\right)^2\cos\theta\right]$. At $r = 20R$ on the axis: $0.05 + 0.005$. Share $= 0.005/0.055 = 1/11 \approx 9\%$. Each step up in $\ell$ costs a factor $R/r$ (times the coefficient ratio).`,
        { figHtml: F.far20 }),

      Q(md`A thin shell of radius $R$ is held at $V_0\cos2\theta$. What is its total charge?`,
        [md`$-\dfrac{4\pi\varepsilon_0RV_0}{3}$`, md`$0$: $\cos2\theta$ averages to zero`, md`$+\dfrac{4\pi\varepsilon_0RV_0}{3}$`, md`$-4\pi\varepsilon_0RV_0$`], 0,
        [null, md`$\cos2\theta$ averages to zero over $\theta$ from $0$ to $\pi$ with equal weight. A sphere weights by $\sin\theta$, which favours the equator, where $\cos2\theta = -1$.`, md`Sign: $\cos2\theta = 2\cos^2\theta - 1$ averages to $\tfrac23 - 1 = -\tfrac13$.`, md`$-1$ is the equator value, not the average.`],
        md`$\cos2\theta = 2\cos^2\theta - 1 = -\tfrac13 + \tfrac43P_2$. $a_0 = -\tfrac13$, so $Q = 4\pi\varepsilon_0R\,a_0V_0 = -\tfrac43\pi\varepsilon_0RV_0$. Always average with the $\sin\theta$ weight.`,
        { figHtml: F.cos2t }),

      Q(md`A shell of radius $a$ is held at $V_0\cos\theta$. Now a concentric **grounded** shell of radius $b \gt a$ is added. What changes?`,
        [md`everything: $V$ inside the inner shell doubles`, md`nothing anywhere, by uniqueness`, md`only $V$ outside $b$`, md`$V$ in the gap and $\sigma$ on the inner shell change; $V$ inside $r \lt a$ does not`], 3,
        [md`Inside $r \lt a$: finite at $0$ and $V(a) = V_0\cos\theta$. Those data are untouched, so neither is the solution.`, md`Uniqueness applies region by region. The gap's outer condition changed (from "$V \to 0$ at infinity" to "$V = 0$ at $b$"), so the gap solution changes.`, md`Outside $b$ it becomes exactly zero, true, but the gap changes too.`, null],
        md`Each region's solution depends only on that region's conditions. Inside $a$: unchanged, $V = V_0(r/a)\cos\theta$. Gap: now $A(r - b^3/r^2)\cos\theta$, steeper at $r = a$, so the slope jump, and hence $\sigma$ on the inner shell, increases (Level 6).`,
        { figHtml: F.cosGround }),

      Q(md`A point charge $q$ is at $z = d$. For $r \lt d$, the $\ell = 2$ term of its potential is`,
        [md`$\dfrac{q}{4\pi\varepsilon_0}\dfrac{d^2}{r^3}P_2(\cos\theta)$`, md`$\dfrac{q}{4\pi\varepsilon_0}\dfrac{r^2}{d^2}P_2(\cos\theta)$`, md`$\dfrac{q}{4\pi\varepsilon_0}\dfrac{r^2}{d^3}P_2(\cos\theta)$`, md`$\dfrac{q}{4\pi\varepsilon_0}\dfrac{r^3}{d^2}P_2(\cos\theta)$`], 2,
        [md`That is the $r \gt d$ form, $r_<^\ell/r_>^{\ell+1}$ with $r_> = r$. Inside, $r$ is the smaller one.`, md`Units: each term must be (charge)/(length) times a dimensionless number. $r^2/d^2$ leaves a missing $1/d$.`, null, md`Powers swapped: $r^\ell$ with $\ell = 2$, not $3$.`],
        md`$\dfrac{1}{\lvert\mathbf r - \mathbf r'\rvert} = \sum_\ell\dfrac{r_<^\ell}{r_>^{\ell+1}}P_\ell(\cos\gamma)$. On the axis, $\dfrac{1}{d - z} = \dfrac1d\sum(z/d)^\ell$, so the $\ell = 2$ term is $z^2/d^3 \to r^2P_2/d^3$.`,
        { figHtml: F.ptd }),

      Q(md`A shell carries $\sigma_0P_\ell(\cos\theta)$. Compare $\ell = 3$ with $\ell = 1$ (same $\sigma_0$): the ratio of the interior potentials at $P$ ($r = R/2$ on the axis) is`,
        [md`$\tfrac{3}{28}$`, md`$\tfrac14$`, md`$\tfrac37$`, md`$\tfrac18$`], 0,
        [null, md`$\tfrac14 = (r/R)^2$ alone. You also need the $\dfrac{1}{2\ell+1}$ factor: $\tfrac37$.`, md`$\tfrac37$ is the $\dfrac{1}{2\ell+1}$ ratio alone, missing $(r/R)^2 = \tfrac14$.`, md`$\tfrac18 = (r/R)^3$, the $\ell = 3$ power without dividing by the $\ell = 1$ power.`],
        md`$V_{\text{in}} = \dfrac{\sigma_0}{(2\ell+1)\varepsilon_0}\dfrac{r^\ell}{R^{\ell-1}}P_\ell$. Ratio at $r = R/2$: $\dfrac{3}{7}\cdot\left(\tfrac12\right)^2 = \dfrac{3}{28}$. High-$\ell$ charge patterns are doubly suppressed in the interior: by $1/(2\ell+1)$ and by $(r/R)^\ell$.`,
        { figHtml: F.sigPl }),

      R(md`
        ### Level 5: exam level

        Exam problems chain the steps: expand, impose conditions, then ask for something derived (a field at a point, a charge, where $\sigma = 0$, a force). These questions test the derived quantities without the algebra.
      `),

      Q(md`A metal sphere held at $V_0$ (relative to the far equatorial plane) sits in a uniform field $E_0\hat{\mathbf z}$. Its surface charge is $\sigma = \varepsilon_0\left(3E_0\cos\theta + V_0/R\right)$. What is the smallest $V_0$ for which $\sigma \ge 0$ everywhere?`,
        [md`$E_0R$`, md`$\tfrac32E_0R$`, md`$3E_0R$`, md`$0$`], 2,
        [md`At $V_0 = E_0R$, $\sigma(\pi) = \varepsilon_0(-3E_0 + E_0) \lt 0$.`, md`At $V_0 = \tfrac32E_0R$, $\sigma(\pi) = \varepsilon_0\left(-3E_0 + \tfrac32E_0\right) \lt 0$: only half the needed uniform charge. Evaluate $\sigma$ at the south pole directly.`, null, md`With $V_0 = 0$ the southern half is negative.`],
        md`The most negative point is the south pole, $\cos\theta = -1$: $\sigma = \varepsilon_0(V_0/R - 3E_0) \ge 0$ needs $V_0 \ge 3E_0R$. The $\ell = 0$ charge from $V_0$ must out-weigh the $\ell = 1$ induced charge everywhere.`,
        { figHtml: F.fieldV }),

      Q(md`Northern hemisphere at $V_0$, southern grounded (radius $R$). What is $\mathbf E$ at the center?`,
        [md`$0$, by symmetry`, md`$+\dfrac{3V_0}{4R}\hat{\mathbf z}$`, md`$-\dfrac{3V_0}{4R}\hat{\mathbf z}$`, md`$-\dfrac{V_0}{2R}\hat{\mathbf z}$`], 2,
        [md`There is no up-down symmetry: the top is hot, the bottom cold.`, md`The field points from high to low potential, i.e. from the north cap toward the south: $-\hat{\mathbf z}$.`, null, md`$\tfrac12$ is $a_0$, which gives no field. You need $a_1 = \tfrac34$.`],
        md`$a_1 = \tfrac32\int_0^1x\,dx = \tfrac34$, so near the center $V \approx \tfrac{V_0}{2} + \tfrac{3V_0}{4R}z$, and $\mathbf E(0) = -\tfrac{3V_0}{4R}\hat{\mathbf z}$. Only $\ell = 1$ matters at the center.`,
        { figHtml: F.hemiE }),

      Q(md`Same hemisphere shell ($V_0$ north, grounded south). Total charge on it?`,
        [md`$2\pi\varepsilon_0RV_0$`, md`$4\pi\varepsilon_0RV_0$`, md`$0$`, md`$3\pi\varepsilon_0RV_0$`], 0,
        [null, md`That is the charge for the whole sphere at $V_0$. The average here is only $V_0/2$.`, md`Net zero would need $a_0 = 0$; here $a_0 = \tfrac12$.`, md`$3\pi$ mixes in $a_1 = \tfrac34$, which contributes no net charge.`],
        md`Outside the $\ell = 0$ term is $\tfrac{V_0}{2}\tfrac Rr = \frac{Q}{4\pi\varepsilon_0r}$, so $Q = 2\pi\varepsilon_0RV_0$. Total charge = $4\pi\varepsilon_0R\times$(average surface potential).`,
        { figHtml: F.hemi }),

      Q(md`Same hemisphere shell. Far away, at $r = 10R$, compare $V$ on the $+z$ axis with $V$ on the $-z$ axis.`,
        [md`equal: far away every charge looks like a point charge`, md`$-z$ is larger`, md`$+z$ is larger by a factor of about $2$`, md`$+z$ is larger by about $35\%$`], 3,
        [md`The monopole dominates, but the dipole is only one power of $R/r$ behind: at $10R$ it is still a $15\%$ correction each way.`, md`The dipole term $\tfrac34(R/r)^2\cos\theta$ is positive on the $+z$ side, next to the hot cap.`, md`A factor 2 would need the dipole term to be a third of the monopole; it is $\tfrac{0.0075}{0.05} = 15\%$.`, null],
        md`$V \approx V_0\left[\tfrac12\tfrac Rr \pm \tfrac34\left(\tfrac Rr\right)^2\right]$ on $\pm z$: $0.050 \pm 0.0075$ (the $\ell = 3$ term, $\sim4\times10^{-5}$, is negligible). Ratio $\approx 0.0575/0.0425 \approx 1.35$. To decide how far "far" is, compare successive terms: each costs $R/r$ times the coefficient ratio.`,
        { figHtml: F.hemi }),

      Q(md`A non-conducting shell carries $\sigma_0\cos^2\theta$. What is $\mathbf E$ at the center?`,
        [md`$0$`, md`$-\dfrac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$`, md`$-\dfrac{\sigma_0}{9\varepsilon_0}\hat{\mathbf z}$`, md`$+\dfrac{2\sigma_0}{15\varepsilon_0}\hat{\mathbf z}$`], 0,
        [null, md`That is the $\sigma_0\cos\theta$ answer. $\cos^2\theta$ has no $P_1$.`, md`There is no $\ell = 1$ piece to give any field at the center.`, md`$\tfrac{2}{15}$ appears in the $\ell = 2$ coefficient, but an $r^2$ term has zero gradient at the origin.`],
        md`$\cos^2\theta = \tfrac13 + \tfrac23P_2$: $\ell = 0$ and $2$ only. $\ell = 0$ gives a constant, $\ell = 2$ gives $\propto r^2P_2$, whose gradient vanishes at $r = 0$. So $\mathbf E(0) = 0$, though $\mathbf E \ne 0$ elsewhere inside.`,
        { figHtml: F.sigCos2 }),

      Q(md`A non-conducting shell of radius $R$ carries $\sigma_0\cos\theta$. What is $V(\text{north pole}) - V(\text{south pole})$ on the shell?`,
        [md`$\dfrac{2\sigma_0R}{3\varepsilon_0}$`, md`$\dfrac{2\sigma_0R}{\varepsilon_0}$`, md`$0$, the shell is an equipotential`, md`$\dfrac{\sigma_0R}{3\varepsilon_0}$`], 0,
        [null, md`That drops the Ex. 3.9 factor $\dfrac{1}{2\ell+1} = \dfrac13$ for $\ell = 1$.`, md`Only conductors are equipotentials. This shell's charge is fixed.`, md`That is the north-pole value alone; the south pole is at $-\frac{\sigma_0R}{3\varepsilon_0}$.`],
        md`On the shell $V = \dfrac{\sigma_0R}{3\varepsilon_0}\cos\theta$. Difference: $\dfrac{2\sigma_0R}{3\varepsilon_0}$, which is also $E_{\text{in}}\times2R$ with the uniform interior field $\frac{\sigma_0}{3\varepsilon_0}$.`,
        { figHtml: F.sigCos }),

      Q(md`A shell of radius $a$ carries $k\cos\theta$. A concentric **grounded** metal shell of radius $b \gt a$ surrounds it. What is $V$ for $r \gt b$?`,
        [md`a dipole field, $\dfrac{ka^3\cos\theta}{3\varepsilon_0r^2}$`, md`a reduced dipole, since the grounded shell screens part of it`, md`$0$`, md`a uniform field`], 2,
        [md`That would be the field with no outer shell.`, md`Screening is complete, not partial.`, null, md`A uniform field outside would need $V \to \infty$ far away.`],
        md`Region $r \gt b$: no charge, $V = 0$ on $r = b$, $V \to 0$ at infinity. $V = 0$ satisfies all of it, and by uniqueness it is the answer. The grounded shell picks up induced charge $\sigma_b = -k\left(\dfrac ab\right)^3\cos\theta$ on its inner face: its dipole moment $\tfrac43\pi b^3\sigma_b$ is exactly minus the inner shell's $\tfrac43\pi a^3k$, so the two cancel outside.`,
        { figHtml: F.dipIn }),

      Q(md`A metal sphere in a uniform field carries net charge $Q$. Compared with the neutral sphere, its induced dipole moment is`,
        [md`larger, because more charge can move`, md`smaller, because the sphere's own field opposes polarisation`, md`zero: a charged sphere doesn't polarise`, md`unchanged, $p = 4\pi\varepsilon_0R^3E_0$`], 3,
        [md`The extra charge spreads uniformly; the $\ell = 1$ problem is untouched.`, md`The uniform charge gives a radial field outside and none inside the metal; it doesn't couple to $\ell = 1$.`, md`Polarisation depends on $E_0$, not on $Q$.`, null],
        md`Each $\ell$ is solved separately. The net charge is the $\ell = 0$ condition; the dipole is set by the $\ell = 1$ conditions ($A_1 = -E_0$, $V$ constant on the sphere). $V = -E_0(r - R^3/r^2)\cos\theta + \frac{Q}{4\pi\varepsilon_0r}$: superpose.`,
        { figHtml: F.fieldQ }),

      Q(md`Outside some azimuthally symmetric charge distribution (all of it inside $r = R$), the potential on the $+z$ axis is $V(z) = V_0R^3/z^3$ for $z \gt R$. What is $V$ on the $-z$ axis at the same distance $\lvert z\rvert$?`,
        [md`$-V_0R^3/\lvert z\rvert^3$`, md`$V_0R^3/\lvert z\rvert^3$`, md`$0$`, md`It can't be determined from data on the $+z$ axis.`], 1,
        [md`That treats $V$ as odd in $z$. But $1/z^3$ is $B_2/r^3$, an $\ell = 2$ term, and $P_2(-1) = +1$.`, null, md`Nothing vanishes on the axis: $\lvert P_\ell(\pm1)\rvert = 1$ for every $\ell$. Odd terms flip sign at the south pole; this $\ell = 2$ term doesn't.`, md`It can: with azimuthal symmetry the $+z$ axis data fix every $B_\ell$, which then fix $V$ everywhere in the region, including the $-z$ axis. (Without azimuthal symmetry, this would be the right answer.)`],
        md`$V(r,\theta) = V_0\dfrac{R^3}{r^3}P_2(\cos\theta)$. At $\theta = \pi$, $P_2 = 1$: same value. The axis trick determines the whole solution, so it answers questions far from the axis too.`,
        { figHtml: F.axisOut }),

      Q(md`A ring of charge lies in the $xy$ plane, centered at the origin. Why do only even $\ell$ appear in its expansion?`,
        [md`Because the ring has no net dipole moment by accident.`, md`Because $P_\ell(0) = 0$ for odd $\ell$, and every ring point sits at $\theta' = \pi/2$.`, md`Because only even $\ell$ can be expanded on the axis.`, md`They don't: all $\ell$ appear.`], 1,
        [md`It is not an accident: it is forced by the $z \to -z$ symmetry for every odd $\ell$, not just $\ell = 1$.`, null, md`The axis trick works for any $\ell$; for a ring above the plane odd $\ell$ do appear.`, md`For a ring in the equatorial plane the odd terms vanish identically.`],
        md`The expansion of each charge element carries $P_\ell(\cos\theta') = P_\ell(0)$, and odd $P_\ell$ vanish at $0$. Same statement as $V(z) = V(-z)$ on the axis. Lift the ring off the plane and odd $\ell$ return (Level 6).`,
        { figHtml: F.ring }),

      Q(md`For the hemisphere shell ($V_0$ north, $0$ south), the full Legendre series is evaluated exactly on the equator of the surface ($r = R$, $\theta = \pi/2$). It gives`,
        [md`$V_0$`, md`$0$`, md`$V_0/2$`, md`a divergent sum`], 2,
        [md`Neither side of the jump is singled out.`, md`Neither side of the jump is singled out.`, null, md`Every odd $P_\ell(0) = 0$, so the sum is just $a_0$: no divergence.`],
        md`At $\theta = \pi/2$ the odd terms vanish and only $a_0 = \tfrac12$ survives. A Legendre series at a jump converges to the midpoint, just as a Fourier series does.`,
        { figHtml: F.hemiEq }),

      Q(md`Outside a shell (no other charge), $V_{\text{out}} = V_0\left[\dfrac Rr + \left(\dfrac Rr\right)^3P_2(\cos\theta)\right]$. What is $\sigma$ at the north pole?`,
        [md`$\dfrac{6\varepsilon_0V_0}{R}$`, md`$\dfrac{2\varepsilon_0V_0}{R}$`, md`$\dfrac{4\varepsilon_0V_0}{R}$`, md`$\dfrac{3\varepsilon_0V_0}{R}$`], 0,
        [null, md`$2 = 1 + 1$ just adds the coefficients, as if $\sigma \propto V$.`, md`$4 = 1 + 3$ uses only the outside slope. The inside slope also contributes.`, md`$3$ is the $\ell = 1$ factor; there is no $\ell = 1$ here.`],
        md`The shell is at $V_0(P_0 + P_2)$, so $\sigma = \dfrac{\varepsilon_0V_0}{R}\left[(1)P_0 + (5)P_2\right]$. At the pole both $P$'s are 1: $6\varepsilon_0V_0/R$. The $2\ell+1$ weights higher harmonics more heavily in $\sigma$ than in $V$.`,
        { figHtml: F.outKnown }),

      Q(md`A grounded metal sphere ($r = a$) sits inside a concentric shell ($r = b$) held at $V_0\cos^2\theta$. Which $\ell$ appear in the gap?`,
        [md`$\ell = 0$ and $\ell = 2$ only`, md`all even $\ell$: the inner sphere reflects each one into the next`, md`$\ell = 2$ only, since the sphere is grounded`, md`$\ell = 0$ only`], 0,
        [null, md`Concentric spheres don't mix $\ell$: each $\ell$'s conditions involve only its own $A_\ell$, $B_\ell$. An $\ell$ that is zero on both surfaces stays zero.`, md`Grounding the inner sphere sets $V(a) = 0$; the outer data still has $\tfrac13P_0$, which needs an $\ell = 0$ term in the gap.`, md`$\tfrac23P_2$ on the outer shell has to come from somewhere.`],
        md`Orthogonality on each sphere decouples the $\ell$'s. Outer: $V_0\left(\tfrac13 + \tfrac23P_2\right)$. Inner: $0$. So only $\ell = 0$ and $\ell = 2$, each with its own pair $A_\ell$, $B_\ell$.`,
        { figHtml: F.groundCos2 }),

      R(md`
        ### Level 6: harder than the exam

        No new tools. Each question needs two ideas at once, or an argument instead of a computation. If you get one wrong, find which of the earlier facts you didn't apply.
      `),

      Q(md`A non-conducting shell (radius $R$) carries a **fixed** charge $\sigma_0\cos^2\theta$ and sits in an external field $E_0\hat{\mathbf z}$. What is the net force on it?`,
        [md`$0$, a uniform field exerts no net force on a distribution`, md`$\tfrac43\pi R^2\sigma_0E_0\,\hat{\mathbf z}$`, md`$4\pi R^2\sigma_0E_0\,\hat{\mathbf z}$`, md`$\tfrac{8}{3}\pi R^2\sigma_0E_0\,\hat{\mathbf z}$`], 1,
        [md`That is true for a **neutral** distribution. $\sigma_0\cos^2\theta$ is positive everywhere: net charge $\tfrac43\pi R^2\sigma_0$.`, null, md`$4\pi R^2\sigma_0$ would be the charge if $\sigma$ were $\sigma_0$ everywhere. The average of $\cos^2\theta$ is $\tfrac13$.`, md`Double-counted: the shell's own field exerts no net force on itself.`],
        md`In a uniform field, $\mathbf F = Q\mathbf E_0$, with $Q = \int\sigma\,da = 4\pi R^2\sigma_0\langle\cos^2\theta\rangle = \tfrac43\pi R^2\sigma_0$. The $\ell = 2$ part of the charge has $Q = 0$ and $\mathbf p = 0$, so it feels neither force nor torque in a uniform field.`,
        { figHtml: F.shellCos2 }),

      Q(md`A non-conducting shell carries fixed $\sigma_0\cos\theta$ in an external field $E_0\hat{\mathbf z}$. For which $\sigma_0$ is the total field inside the shell zero?`,
        [md`$\varepsilon_0E_0$`, md`$-3\varepsilon_0E_0$`, md`$3\varepsilon_0E_0$`, md`$3E_0/\varepsilon_0$`], 2,
        [md`The shell's interior field is $\sigma_0/3\varepsilon_0$, not $\sigma_0/\varepsilon_0$.`, md`Sign: positive charge on top makes a downward field inside, which cancels an upward $E_0$. So $\sigma_0 \gt 0$.`, null, md`Units: $\sigma$ has units of $\varepsilon_0\times$ field.`],
        md`The shell's own interior field is $-\frac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$; set it equal to $-E_0\hat{\mathbf z}$: $\sigma_0 = 3\varepsilon_0E_0$. That is exactly the induced charge on a metal sphere in the same field: the metal finds the one $\sigma$ that zeroes its interior field.`,
        { figHtml: F.shellCos }),

      Q(md`Compare a metal sphere held at $V_0 \gt 0$ in a field $E_0\hat{\mathbf z}$ with the grounded one. The line where $\sigma = 0$`,
        [md`stays on the equator: $V_0$ doesn't change the $\ell = 1$ part`, md`moves north ($\theta \lt 90^\circ$)`, md`disappears for any $V_0 \gt 0$`, md`moves south ($\theta \gt 90^\circ$)`], 3,
        [md`True that $\ell = 1$ is unchanged, but the zero of $\sigma$ depends on the sum of $\ell = 0$ and $\ell = 1$.`, md`The added charge is positive. It takes over more of the sphere, pushing the negative region (and the boundary) south.`, md`It disappears only once $V_0 \ge 3E_0R$.`, null],
        md`$\sigma = \varepsilon_0(3E_0\cos\theta + V_0/R) = 0$ at $\cos\theta = -\frac{V_0}{3E_0R}$, which is past $90^\circ$ for $V_0 \gt 0$, and reaches the south pole at $V_0 = 3E_0R$.`,
        { figHtml: F.fieldVp }),

      Q(md`A shell is held at $V_0\cos^3\theta$. At $r = 10R$ on the axis, the $\ell = 3$ term is what fraction of the $\ell = 1$ term?`,
        [md`$\tfrac23$`, md`$1\%$`, md`$0.1\%$`, md`about $0.7\%$`], 3,
        [md`$\tfrac23$ is the coefficient ratio $\frac{2/5}{3/5}$ alone; the extra $(R/r)^2$ is missing.`, md`$1\%$ is $(R/r)^2$ alone; the coefficient ratio $\tfrac23$ is missing.`, md`$0.1\%$ would be $(R/r)^3$: the ratio of $\ell = 3$ to $\ell = 1$ falloffs is $(R/r)^{4-2} = (R/r)^2$.`, null],
        md`Outside: $\tfrac35V_0(R/r)^2P_1 + \tfrac25V_0(R/r)^4P_3$. Ratio on the axis $= \tfrac23\times(1/10)^2 = 1/150 \approx 0.67\%$.`,
        { figHtml: F.far10 }),

      Q(md`A point charge $q$ is inside a grounded metal shell, off center at $z = d$. The induced $\sigma(\theta)$ contains every $\ell$. What is the total induced charge?`,
        [md`$-q$, independent of $d$`, md`$-q\,d/R$`, md`$-q\,R/d$`, md`$0$, since only $\ell = 0$ carries charge and the setup is off center`], 0,
        [null, md`$d/R$ appears in the $\ell = 1$ coefficient, which contributes no net charge.`, md`$qR/d$ is the image charge's size, not the induced charge. The image sits outside the region and doesn't equal the surface charge.`, md`Only $\ell = 0$ carries charge, true, and the $\ell = 0$ part of the induced charge is exactly $-q$.`],
        md`Gauss on a surface inside the metal: $E = 0$ there, so $Q_{\text{enc}} = q + Q_{\text{ind}} = 0$. In Legendre terms, the $\ell = 0$ piece of the induced potential inside is $-q/4\pi\varepsilon_0R$, the same as a charge $-q$ spread on the shell; every $\ell \ge 1$ piece integrates to zero.`,
        { figHtml: F.gshell }),

      Q(md`Inside a charge-free shell (azimuthal symmetry), the axis potential is $V(z) = V_0\left(1 - z/R + z^2/R^2\right)$ for $\lvert z\rvert \le R$. What is the potential on the shell's equator ($r = R$, $\theta = \pi/2$)?`,
        [md`$V_0$`, md`$V_0/2$`, md`$3V_0/2$`, md`$0$`], 1,
        [md`$V_0$ is the axis value at $z = 0$ (the center), not the equator of the shell.`, null, md`That uses $P_2(0) = +\tfrac12$. It is $-\tfrac12$.`, md`Only the $\ell = 1$ term vanishes at the equator.`],
        md`Axis trick: $V = V_0\left[1 - \tfrac rRP_1 + \tfrac{r^2}{R^2}P_2\right]$. At $r = R$, $\theta = \pi/2$: $1 - 0 - \tfrac12 = \tfrac12$. Axis data reach the whole sphere.`,
        { figHtml: F.axisEq }),

      Q(md`A grounded metal sphere ($r = a$) inside a shell ($r = b$) held at $V_0\cos^2\theta$. Total charge on the grounded sphere?`,
        [md`$0$, it is grounded`, md`$-\dfrac{4\pi\varepsilon_0V_0}{3}\dfrac{ab}{b - a}$`, md`$-\dfrac{4\pi\varepsilon_0V_0}{3}a$`, md`$-\dfrac{4\pi\varepsilon_0V_0\,ab}{b - a}\left(\tfrac13 + \tfrac23\right)$`], 1,
        [md`Grounded means $V = 0$, not $Q = 0$. Ground supplies whatever charge it needs.`, null, md`That is the charge for $b \to \infty$; at finite $b$ the outer shell's proximity matters.`, md`The $\ell = 2$ part of the induced charge integrates to zero. Only the $\tfrac13$ counts.`],
        md`Only $\ell = 0$ matters: $A_0 + B_0/a = 0$, $A_0 + B_0/b = V_0/3$, so $B_0 = -\dfrac{V_0}{3}\dfrac{ab}{b-a}$ and $Q_a = 4\pi\varepsilon_0B_0$. It is a spherical capacitor with $\Delta V = V_0/3$.`,
        { figHtml: F.groundCos2 }),

      Q(md`A shell carries $\sigma_0\cos\theta$. What fraction of its total field energy is stored **inside** the shell?`,
        [md`$0$, there is no field inside a shell`, md`$1/2$`, md`$2/3$`, md`$1/3$`], 3,
        [md`The interior field is uniform and nonzero (Level 4).`, md`No symmetry forces a half; inside and outside fields have different shapes.`, md`$2/3$ is the outside share.`, null],
        md`$W_{\text{in}} = \frac{\varepsilon_0}{2}\left(\frac{\sigma_0}{3\varepsilon_0}\right)^2\frac43\pi R^3 = \frac{2\pi\sigma_0^2R^3}{27\varepsilon_0}$. Total from $\tfrac12\int\sigma V\,da = \frac{2\pi\sigma_0^2R^3}{9\varepsilon_0}$. Ratio $\tfrac13$. (Checked by integrating the dipole field outside: $\tfrac23$.)`,
        { figHtml: F.sigCos }),

      Q(md`The hemisphere series ($V_0$ north, $0$ south) is cut after three nonzero terms ($\ell = 0, 1, 3$). Where is the truncated series worst?`,
        [md`at the center`, md`on the axis at $r = R/2$`, md`on the surface just next to the equator`, md`far outside`], 2,
        [md`At the center only $a_0$ matters, and it is exact.`, md`At $r = R/2$ the dropped terms are suppressed by $(1/2)^\ell$; the error is about $1\%$.`, null, md`Far outside the dropped terms fall as $r^{-6}$ and faster.`],
        md`The dropped terms carry $(r/R)^\ell$ inside and $(R/r)^{\ell+1}$ outside; only at $r = R$ is there no suppression. On the surface, the series has to build a jump, and near the jump it converges slowest. At the north pole the 3-term sum is $\tfrac{13}{16}V_0$ (19% low).`,
        { figHtml: F.hemi }),

      Q(md`A ring of charge sits on a sphere of radius $D$ (centered at the origin) at polar angle $\alpha$. For which $\alpha$ does the potential near the origin have no $r^2$ term?`,
        [md`$45^\circ$`, md`$54.7^\circ$`, md`$60^\circ$`, md`$90^\circ$`], 1,
        [md`$P_2(\cos45^\circ) = \tfrac14$, not zero.`, null, md`$P_2(\cos60^\circ) = -\tfrac18$.`, md`$P_2(0) = -\tfrac12$: the equatorial ring has a large $\ell = 2$ term (the odd ones vanish).`],
        md`Near the origin $V = \frac{Q}{4\pi\varepsilon_0}\sum\frac{r^\ell}{D^{\ell+1}}P_\ell(\cos\alpha)P_\ell(\cos\theta)$. The $\ell = 2$ term vanishes when $P_2(\cos\alpha) = 0$: $\cos^2\alpha = \tfrac13$, $\alpha = 54.7^\circ$, the "magic angle".`,
        { figHtml: F.ringTilt }),

      Q(md`A grounded metal sphere sits in a field whose far potential is $V \to -E_0r\cos\theta + V_1$ (the far equatorial plane is at $V_1$, not $0$). What charge does the sphere carry?`,
        [md`$0$`, md`$-4\pi\varepsilon_0RV_1$`, md`$+4\pi\varepsilon_0RV_1$`, md`$-V_1R$`], 1,
        [md`Zero would require the sphere's potential to match the equatorial plane's. Ground is at $0$, the plane at $V_1$.`, null, md`Sign: $A_0 + B_0/R = V_1 + B_0/R = 0$ makes $B_0 = -RV_1$.`, md`Units: that is $B_0$, not a charge. Multiply by $4\pi\varepsilon_0$.`],
        md`Now the $\ell = 0$ conditions are $A_0 = V_1$ (far away) and $A_0 + B_0/R = 0$ (grounded). So $B_0 = -RV_1$ and $Q = 4\pi\varepsilon_0B_0 = -4\pi\varepsilon_0RV_1$. "Grounded" and "neutral" differ exactly when the ground isn't at the potential the sphere would float to.`,
        { figHtml: F.fieldV1 }),

      Q(md`Grounded sphere (radius $R$) in a field $E_0\hat{\mathbf z}$. How far up the axis must you go before the sphere's own (induced) contribution to $V$ is $1\%$ of the applied $-E_0r\cos\theta$?`,
        [md`$r \approx 10R$`, md`$r \approx 4.6R$`, md`$r \approx 100R$`, md`$r \approx 3R$`], 1,
        [md`$10R$ is where the ratio $(R/r)^3$ reaches $0.1\%$.`, null, md`$100R$ treats the induced term as falling like $1/r$ relative to the applied one. It is $(R/r)^3$.`, md`At $3R$ the ratio is $1/27 \approx 4\%$.`],
        md`Induced over applied $= \dfrac{E_0R^3/r^2}{E_0r} = (R/r)^3$. Set it to $0.01$: $r = 100^{1/3}R \approx 4.6R$. Dipole corrections die fast; a few radii out, the field is essentially $E_0$ again.`,
        { figHtml: F.fieldFar }),

      Q(md`A shell of radius $a$ is held at $V_0\cos\theta$, inside a concentric grounded shell of radius $b = 2a$. What is $\sigma$ on the inner shell at its north pole?`,
        [md`$\dfrac{3\varepsilon_0V_0}{a}$, as without the outer shell`, md`$\dfrac{24}{7}\dfrac{\varepsilon_0V_0}{a}$`, md`$\dfrac{21}{8}\dfrac{\varepsilon_0V_0}{a}$`, md`$\dfrac{6\varepsilon_0V_0}{a}$`], 1,
        [md`The inside slope is unchanged, but the gap solution now has to reach $0$ at $b$ instead of at infinity, so its slope at $a$ is steeper.`, null, md`$\tfrac78$ is upside down: the grounded shell increases $\sigma$, by the factor $\dfrac{b^3}{b^3 - a^3} = \tfrac87$.`, md`$6$ doubles the free value, which needs $\dfrac{b^3}{b^3 - a^3} = 2$, i.e. $b = 2^{1/3}a \approx 1.26a$. At $b = 2a$ the factor is only $\tfrac87$.`],
        md`Gap: $A(r - b^3/r^2)\cos\theta$ with $A(a - b^3/a^2) = V_0$. Outside slope at $a$: $A(1 + 2b^3/a^3)$; inside slope $V_0/a$. $\sigma = -\varepsilon_0(\text{out} - \text{in}) = \dfrac{3\varepsilon_0V_0}{a}\dfrac{b^3}{b^3 - a^3}$, which is $\dfrac{24}{7}\dfrac{\varepsilon_0V_0}{a}$ at $b = 2a$ and tends to $3\varepsilon_0V_0/a$ as $b \to \infty$.`,
        { figHtml: F.cosGround2 }),

      Q(md`A grounded metal sphere sits in a field $E_0\hat{\mathbf z}$; $\sigma = 3\varepsilon_0E_0\cos\theta$. What is the net electric force on its **northern** hemisphere?`,
        [md`$0$: the whole sphere is neutral`, md`$3\pi\varepsilon_0R^2E_0^2$, upward`, md`$\tfrac92\pi\varepsilon_0R^2E_0^2$, upward`, md`$\tfrac94\pi\varepsilon_0R^2E_0^2$, upward`], 3,
        [md`The **whole** sphere feels no net force. Each half is pulled outward along its own pole; the forces cancel only in the sum.`, md`$3\pi$ comes from $Q_{\text{north}}E_0$. The local field on the surface is $\sigma/\varepsilon_0$, not $E_0$, and the force per area is $\sigma^2/2\varepsilon_0$.`, md`Factor 2: the pressure is $\sigma^2/2\varepsilon_0$, the average of the fields on the two sides.`, null],
        md`Pressure $f = \dfrac{\sigma^2}{2\varepsilon_0}$ outward. $F_z = \int_0^{\pi/2}\dfrac{9\varepsilon_0E_0^2\cos^2\theta}{2}\cos\theta\,2\pi R^2\sin\theta\,d\theta = 9\pi\varepsilon_0R^2E_0^2\int_0^1x^3\,dx = \tfrac94\pi\varepsilon_0R^2E_0^2$. The southern half feels the same force downward: the field tries to pull the sphere apart.`,
        { figHtml: F.fieldG }),

      Q(md`A charge-free shell is held at some $V_0(\theta)$ whose expansion has $a_0 = 1$, $a_1 = 0$ and $a_2 \gt 0$. Can $V$ have a local maximum at the center?`,
        [md`yes, if $a_2 \gt a_0$`, md`yes: $\mathbf E(0) = 0$ and the $r^2$ term curves $V$`, md`no: a harmonic function has no local maximum or minimum inside a charge-free region`, md`only if the data are odd`], 2,
        [md`No size of $a_2$ changes the argument: $r^2P_2$ rises in some directions and falls in others.`, md`$\mathbf E(0) = 0$ makes the center a critical point, but $r^2P_2 = z^2 - \tfrac12(x^2 + y^2)$ curves up along $z$ and down across: a saddle.`, null, md`Odd data have $a_0 = 0$ and don't affect the argument either.`],
        md`$V(0)$ is the average of $V$ over every small sphere around it, so it cannot be above (or below) all its neighbours. In Legendre terms: every $r^\ell P_\ell$ with $\ell \ge 1$ averages to zero over a sphere, so it must go up somewhere and down somewhere else. Earnshaw's theorem is this statement.`,
        { figHtml: F.gen }),

      Q(md`A positive point charge is placed at the center of a positively charged ring (radius $a$) in the $xy$ plane. Near the center $V = \dfrac{Q}{4\pi\varepsilon_0a}\left[1 - \dfrac{r^2}{2a^2}P_2(\cos\theta) + \dots\right]$. The center is`,
        [md`stable in every direction`, md`stable in the $xy$ plane, unstable along $z$`, md`unstable in the plane, stable along $z$`, md`neutral: $\mathbf E = 0$ in a neighbourhood`], 1,
        [md`Earnshaw: no stable point in a charge-free region.`, null, md`Reversed: along $z$, $-\tfrac{r^2}{2a^2}P_2 = -\tfrac{z^2}{2a^2}$ makes $V$ fall away from the center.`, md`The $r^2$ term gives $\mathbf E \propto r$, zero only at the center itself.`],
        md`Along $z$ ($P_2 = 1$): $V$ falls as $z^2$, so a positive charge slides out along the axis. In the plane ($P_2 = -\tfrac12$): $V$ rises as $\tfrac{s^2}{4a^2}$, pushing it back. Read stability straight from the sign of the $\ell = 2$ coefficient and $P_2$ in each direction.`,
        { figHtml: F.ring }),

      R(md`
        !!key Patterns to remember
          - Drop a radial family only where it misbehaves **inside the region**: $r^{-(\ell+1)}$ at $0$, $r^\ell$ at $\infty$. Shell regions keep both.
          - $V$ given: continuity alone, then $\sigma = \frac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell$ is the output. $\sigma$ given: continuity plus the jump, $V_{\text{in}} = \sum\frac{s_\ell r^\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}P_\ell$.
          - Center: $V(0) = a_0V_0$, $\mathbf E(0)$ from $\ell = 1$ only. Net charge: $\ell = 0$ only. Far field: the lowest $\ell$ present.
          - Symmetric data → even $\ell$; antisymmetric → odd $\ell$; kinks and jumps → infinitely many.
          - Metal sphere in a uniform field: $B_1 = E_0R^3$, whatever its charge or potential. Net charge or a held potential adds only an $\ell = 0$ term. (A shell with fixed $\sigma$ is different: its $B_1$ comes from its own charge.)
          - With azimuthal symmetry, axis data determine everything: $z^\ell \to r^\ell P_\ell$, $z^{-(\ell+1)} \to r^{-(\ell+1)}P_\ell$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson B: problems, easy -> brutal
  // =====================================================================================
  const LB = {
    id: 'uD-leg-problems', title: 'Legendre ladder: problems, easy → brutal',
    steps: [
      R(md`
        ### Level 1: recognize

        Two warm-ups: read coefficients without integrating, and read a solution once you have it.
      `),

      P({
        title: 'A P₂ in disguise',
        q: md`A thin shell of radius $R$ is held at $V_0(\theta) = V_0\left(2 - 3\sin^2\theta\right)$, with no other charge anywhere. Find (a) the Legendre coefficients $a_0$ and $a_2$ in $V_0(\theta) = V_0\sum a_\ell P_\ell(\cos\theta)$, (b) $V$ at point $A$ ($r = R/2$ on the $+z$ axis) in units of $V_0$, (c) $V$ at point $B$ ($r = 2R$, $\theta = 90^\circ$) in units of $V_0$, and (d) the total charge on the shell.`,
        figHtml: F.p1,
        hints: [
          md`Rewrite in $\cos\theta$: $\sin^2\theta = 1 - \cos^2\theta$. Then compare with $P_2 = \tfrac12(3\cos^2\theta - 1)$.`,
          md`Inside each term is $a_\ell(r/R)^\ell P_\ell$, outside $a_\ell(R/r)^{\ell+1}P_\ell$.`,
          md`$P_2(1) = 1$, $P_2(0) = -\tfrac12$. Net charge is set by $a_0$ alone.`,
        ],
        parts: [
          { lbl: md`(a) $a_0$`, ans: 0 },
          { lbl: md`(a) $a_2$`, ans: 2 },
          { lbl: md`(b) $V(A)/V_0$`, ans: 0.5 },
          { lbl: md`(c) $V(B)/V_0$`, ans: -0.125 },
          { lbl: md`(d) Total charge on the shell`, mc: [md`$\dfrac{8\pi\varepsilon_0RV_0}{3}$`, md`$0$`, md`$-4\pi\varepsilon_0RV_0$`, md`$8\pi\varepsilon_0RV_0$`], a: 1,
            why: [md`That is $4\pi\varepsilon_0R\times\tfrac23V_0$: it treats $\langle 3\sin^2\theta\rangle$ as $\tfrac43$ instead of $2$.`, null, md`$-1$ is the value at the equator, not the average.`, md`$2$ is the value at the poles, not the average.`] },
        ],
        sol: md`
          **Region:** inside ($r \lt R$) and outside ($r \gt R$), both charge-free. **Boundary conditions:**
          1. $V$ finite at $r = 0$: no $B_\ell$ inside.
          2. $V \to 0$ as $r \to \infty$: no $A_\ell$ outside.
          3. $V(R,\theta) = V_0(2 - 3\sin^2\theta)$ from both sides: fixes the coefficients.

          **Expand by inspection:** $2 - 3(1 - \cos^2\theta) = 3\cos^2\theta - 1 = 2P_2(\cos\theta)$. So $a_0 = 0$, $a_2 = 2$, and nothing else.

          $$V_{\text{in}} = 2V_0\frac{r^2}{R^2}P_2(\cos\theta), \qquad V_{\text{out}} = 2V_0\frac{R^3}{r^3}P_2(\cos\theta)$$

          (b) $r = R/2$, $\theta = 0$: $2\cdot\tfrac14\cdot1 = \tfrac12$.

          (c) $r = 2R$, $\theta = 90^\circ$: $2\cdot\tfrac18\cdot\left(-\tfrac12\right) = -\tfrac18$.

          (d) No $\ell = 0$ term outside, so no $1/r$ tail: $Q = 0$. Check: the average of $3\cos^2\theta - 1$ over a sphere is $3\cdot\tfrac13 - 1 = 0$.

          **What to remember:** before integrating, rewrite in $\cos\theta$ and look for $3\cos^2\theta - 1$. Pure $P_2$ data: neutral, $V(0) = 0$, quadrupole outside.
        `,
      }),

      P({
        title: 'Read the solution',
        q: md`Inside a thin shell of radius $R$ (no other charge), $V_{\text{in}}(r,\theta) = V_0\left[1 + 2\dfrac rRP_1(\cos\theta) - \dfrac{r^2}{R^2}P_2(\cos\theta)\right]$. Find the surface potential at (a) the north pole, (b) the south pole S, (c) the equator E (all in units of $V_0$); (d) $V$ outside on the $+z$ axis at $r = 2R$ (units of $V_0$); (e) $E_z$ at the center; (f) the total charge on the shell.`,
        figHtml: F.p2,
        hints: [
          md`On the surface, $r = R$. Use $P_\ell(1) = 1$, $P_\ell(-1) = (-1)^\ell$, $P_1(0) = 0$, $P_2(0) = -\tfrac12$.`,
          md`Outside: each term becomes $a_\ell(R/r)^{\ell+1}P_\ell$.`,
          md`At the center only the $r^1$ term has a gradient. The charge is $4\pi\varepsilon_0R\,a_0V_0$.`,
        ],
        parts: [
          { lbl: md`(a) north pole, $V/V_0$`, ans: 2 },
          { lbl: md`(b) south pole, $V/V_0$`, ans: -2 },
          { lbl: md`(c) equator, $V/V_0$`, ans: 1.5 },
          { lbl: md`(d) $V(2R, 0)/V_0$`, ans: 0.875 },
          { lbl: md`(e) $E_z(0)$`, expr: '-2*V0/R', vars: { V0: [1, 3], R: [1, 2] } },
          { lbl: md`(f) total charge $Q$`, expr: '4*pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
        ],
        sol: md`
          **Region:** given inside; outside is $r \gt R$, charge-free. **Boundary conditions:**
          1. $V$ continuous at $r = R$: the surface values are $V_{\text{in}}(R,\theta)$, and they are the data for outside.
          2. $V \to 0$ at infinity: only $B_\ell$ outside, $B_\ell = A_\ell R^{2\ell+1}$.

          The surface potential is $V_0\left[P_0 + 2P_1 - P_2\right]$, so $a_0 = 1$, $a_1 = 2$, $a_2 = -1$.

          (a) $\theta = 0$: $1 + 2 - 1 = 2$. (b) $\theta = \pi$: $1 - 2 - 1 = -2$. (c) $\theta = \pi/2$: $1 + 0 + \tfrac12 = \tfrac32$.

          (d) $V_{\text{out}} = V_0\left[\tfrac Rr + 2\tfrac{R^2}{r^2}P_1 - \tfrac{R^3}{r^3}P_2\right]$; at $r = 2R$, $\theta = 0$: $\tfrac12 + \tfrac12 - \tfrac18 = \tfrac78$.

          (e) Near the center $V \approx V_0 + \tfrac{2V_0}{R}z$, so $E_z = -2V_0/R$.

          (f) $B_0 = V_0R = \frac{Q}{4\pi\varepsilon_0}$: $Q = 4\pi\varepsilon_0RV_0$.

          **What to remember:** $P_\ell(\pm1)$ and $P_\ell(0)$ are all you need on the poles and equator.
        `,
      }),

      R(md`
        ### Level 2: set up

        A given $\sigma$ (four conditions) and a given $V$ with $\sigma$ as the output.
      `),

      P({
        title: 'A shell of σ₀ sin²θ',
        q: md`A thin non-conducting shell of radius $R$ carries $\sigma(\theta) = \sigma_0\sin^2\theta$. There is no other charge. Find (a) the total charge, (b) $V$ inside, (c) $V$ outside, (d) $\mathbf E$ at the center.`,
        figHtml: F.p3,
        hints: [
          md`$\sigma$ given: you need four conditions (finite at 0, zero at infinity, continuity, the derivative jump).`,
          md`$\sin^2\theta = \tfrac23(P_0 - P_2)$, so $s_0 = \tfrac23\sigma_0$, $s_2 = -\tfrac23\sigma_0$.`,
          md`For each $\ell$: $V_{\text{in}} = \dfrac{s_\ell}{(2\ell+1)\varepsilon_0}\dfrac{r^\ell}{R^{\ell-1}}P_\ell$, $V_{\text{out}} = \dfrac{s_\ell}{(2\ell+1)\varepsilon_0}\dfrac{R^{\ell+2}}{r^{\ell+1}}P_\ell$.`,
        ],
        parts: [
          { lbl: md`(a) $Q$`, expr: '8*pi*R^2*sigma0/3', vars: { R: [1, 2], sigma0: [1, 3] } },
          { lbl: md`(b) $V_{\text{in}}(r,\theta)$`, expr: '2*sigma0*R/(3*eps0)*(1 - r^2*(3*cos(theta)^2 - 1)/(10*R^2))', vars: { sigma0: [1, 3], R: [1.5, 2], eps0: [0.5, 2], r: [0.2, 1.2], theta: [0, 3] } },
          { lbl: md`(c) $V_{\text{out}}(r,\theta)$`, expr: '2*sigma0*R^2/(3*eps0*r) - sigma0*R^4*(3*cos(theta)^2 - 1)/(15*eps0*r^3)', vars: { sigma0: [1, 3], R: [1, 1.5], eps0: [0.5, 2], r: [2, 3], theta: [0, 3] } },
          { lbl: md`(d) $\mathbf E(0)$`, mc: [md`$-\dfrac{2\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$`, md`$+\dfrac{2\sigma_0}{15\varepsilon_0}\hat{\mathbf z}$`, md`$0$`, md`$\dfrac{2\sigma_0}{3\varepsilon_0}\hat{\mathbf r}$`], a: 2,
            why: [md`That treats the $\ell = 0$ coefficient as if it made a field; a constant has zero gradient.`, md`The $\ell = 2$ term is $\propto r^2$; its gradient vanishes at $r = 0$.`, null, md`$\hat{\mathbf r}$ is undefined at the origin, and there is no $\ell = 1$ term.`] },
        ],
        sol: md`
          **Region:** inside and outside the shell, both charge-free. **Boundary conditions:**
          1. $V_{\text{in}}$ finite at $r = 0$: inside $\sum A_\ell r^\ell P_\ell$.
          2. $V_{\text{out}} \to 0$: outside $\sum B_\ell r^{-(\ell+1)}P_\ell$.
          3. Continuity at $r = R$: $B_\ell = A_\ell R^{2\ell+1}$.
          4. Jump: $\partial_rV_{\text{out}} - \partial_rV_{\text{in}} = -\sigma/\varepsilon_0$ at $r = R$. With 3, it gives $(2\ell+1)A_\ell R^{\ell-1} = s_\ell/\varepsilon_0$.

          **Expand:** $\sin^2\theta = 1 - \cos^2\theta = 1 - \tfrac13 - \tfrac23P_2 = \tfrac23(P_0 - P_2)$.

          (a) Only $s_0$ carries charge: $Q = 4\pi R^2\cdot\tfrac23\sigma_0 = \tfrac83\pi R^2\sigma_0$.

          (b) $A_0 = \dfrac{s_0R}{\varepsilon_0} = \dfrac{2\sigma_0R}{3\varepsilon_0}$, $A_2 = \dfrac{s_2}{5\varepsilon_0R} = -\dfrac{2\sigma_0}{15\varepsilon_0R}$:

          $$V_{\text{in}} = \frac{2\sigma_0R}{3\varepsilon_0}\left[1 - \frac{r^2}{5R^2}P_2(\cos\theta)\right]$$

          (c) $B_0 = A_0R = \dfrac{2\sigma_0R^2}{3\varepsilon_0}$, $B_2 = A_2R^5$:

          $$V_{\text{out}} = \frac{2\sigma_0R^2}{3\varepsilon_0r} - \frac{2\sigma_0R^4}{15\varepsilon_0r^3}P_2(\cos\theta)$$

          (d) No $\ell = 1$: $\mathbf E(0) = 0$.

          **Checks:** $B_0 = Q/4\pi\varepsilon_0$ ✓. The jump at the pole: $\sigma(0) = 0$, and indeed $\tfrac23 - \tfrac23P_2(1) = 0$.

          **What to remember:** $\sigma$ given → four conditions → $A_\ell = \dfrac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$.
        `,
      }),

      P({
        title: 'From V to σ: a pure P₃ shell',
        q: md`A thin shell of radius $R$ is held at $V_0P_3(\cos\theta)$, nothing else around. Find (a) $V$ on the $+z$ axis at $r = 2R$ (units of $V_0$); (b) $\sigma$ at the north pole (units of $\varepsilon_0V_0/R$); (c) $E_r$ just outside and (d) just inside the north pole (units of $V_0/R$); (e) the total charge.`,
        figHtml: F.p4,
        hints: [
          md`$V$ is given on the shell: three conditions fix $V$, and the derivative jump gives $\sigma$.`,
          md`Inside $V_0(r/R)^3P_3$, outside $V_0(R/r)^4P_3$.`,
          md`$E_r = -\partial V/\partial r$ on each side; $\sigma = \varepsilon_0(E_{r,\text{out}} - E_{r,\text{in}})$.`,
        ],
        parts: [
          { lbl: md`(a) $V(2R, 0)/V_0$`, ans: 0.0625 },
          { lbl: md`(b) $\sigma(0)\,R/(\varepsilon_0V_0)$`, ans: 7 },
          { lbl: md`(c) $E_r$ just outside, units $V_0/R$`, ans: 4 },
          { lbl: md`(d) $E_r$ just inside, units $V_0/R$`, ans: -3 },
          { lbl: md`(e) total charge`, mc: [md`$28\pi\varepsilon_0RV_0$`, md`$4\pi\varepsilon_0RV_0$`, md`$-4\pi\varepsilon_0RV_0$`, md`$0$`], a: 3,
            why: [md`That integrates $\sigma(0)$ over the sphere as if it were uniform.`, md`That is a shell at uniform $V_0$; $P_3$ averages to zero.`, md`$P_3(-1) = -1$ is one point, not the average.`, null] },
        ],
        sol: md`
          **Region:** inside and outside. **Boundary conditions:**
          1. Finite at $0$. 2. Zero at infinity. 3. $V = V_0P_3$ at $r = R$ from both sides.

          $V_{\text{in}} = V_0\dfrac{r^3}{R^3}P_3$, $V_{\text{out}} = V_0\dfrac{R^4}{r^4}P_3$.

          (a) $\left(\tfrac12\right)^4 = \tfrac1{16}$.

          (c), (d) At $\theta = 0$: $E_{r,\text{out}} = -\partial_r V_0R^4r^{-4} = 4V_0/R$; $E_{r,\text{in}} = -\partial_r V_0r^3R^{-3} = -3V_0/R$. Inside, $V$ rises toward the surface so $E_r$ points inward.

          (b) $\sigma = \varepsilon_0(4 + 3)V_0/R = 7\varepsilon_0V_0/R$ at the pole; in general $\sigma = \dfrac{7\varepsilon_0V_0}{R}P_3(\cos\theta)$, the $2\ell + 1$ rule.

          (e) $P_3$ integrates to zero: $Q = 0$.

          **What to remember:** the $(2\ell+1)$ is $\ell$ (inside slope) plus $\ell + 1$ (outside slope).
        `,
      }),

      R(md`
        ### Level 3: the standard cases

        The axis trick, an odd boundary function, and a classic field-at-the-center result done two ways.
      `),

      P({
        title: 'Two equal charges, seen from the middle',
        q: md`Charges $+q$ sit at $z = d$ and $z = -d$. (a) Use the axis trick to find $V(r,\theta)$ for $r \lt d$ through the $\ell = 2$ term. (b) Evaluate the series through $\ell = 4$ at $P$ ($r = d/2$, $\theta = 90^\circ$) in units of $q/4\pi\varepsilon_0d$, and (c) the exact value there in the same units, and the percent overshoot of the series. (d) Is the origin a stable equilibrium for a positive test charge?`,
        figHtml: F.p5,
        hints: [
          md`The region $r \lt d$ contains the origin and no charge: $V = \sum A_\ell r^\ell P_\ell$.`,
          md`On the axis, $\dfrac{1}{d - z} + \dfrac{1}{d + z} = \dfrac{2d}{d^2 - z^2} = \dfrac2d\left(1 + \dfrac{z^2}{d^2} + \dfrac{z^4}{d^4} + \dots\right)$.`,
          md`Replace $z^\ell$ by $r^\ell P_\ell(\cos\theta)$. $P_2(0) = -\tfrac12$, $P_4(0) = \tfrac38$.`,
        ],
        parts: [
          { lbl: md`(a) $V(r,\theta)$ through $\ell = 2$`, expr: 'q/(2*pi*eps0*d)*(1 + r^2*(3*cos(theta)^2 - 1)/(2*d^2))', vars: { q: [1, 3], eps0: [0.5, 2], d: [2, 3], r: [0.2, 1.5], theta: [0, 3] } },
          { lbl: md`(b) series through $\ell = 4$ at $P$`, ans: 1.796875 },
          { lbl: md`(c) exact value at $P$`, ans: 1.78885 },
          { lbl: md`(c) by what percent does the $\ell \le 4$ series overshoot the exact value?`, ans: 0.4484 },
          { lbl: md`(d) Stability of the origin for a positive test charge`, mc: [md`stable in every direction`, md`stable along $z$, unstable in the $xy$ plane`, md`unstable along $z$, stable in the $xy$ plane`, md`neutral: $V$ is flat`], a: 1,
            why: [md`Laplace's equation forbids a minimum of $V$ in empty space (Earnshaw); $\nabla^2 V = 0$ needs the curvatures to cancel.`, null, md`Reversed. Along $z$, $r^2P_2 = z^2$ makes $V$ rise; in the plane $P_2 = -\tfrac12$ makes it fall.`, md`The $\ell = 2$ term is not zero, so $V$ curves.`] },
        ],
        sol: md`
          **Region:** $r \lt d$, charge-free, contains the origin. **Boundary conditions:**
          1. $V$ finite at $r = 0$: only $A_\ell r^\ell$.
          2. $V$ on the $z$ axis equals the known point-charge sum: fixes every $A_\ell$.

          [[fig:ax]]

          On the axis ($\lvert z\rvert \lt d$):

          $$V(z) = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{d-z} + \frac{1}{d+z}\right] = \frac{q}{4\pi\varepsilon_0}\frac{2}{d}\left[1 + \frac{z^2}{d^2} + \frac{z^4}{d^4} + \dots\right]$$

          Only even powers: the setup is symmetric under $z \to -z$. Off the axis:

          $$V = \frac{q}{2\pi\varepsilon_0d}\left[1 + \frac{r^2}{d^2}P_2(\cos\theta) + \frac{r^4}{d^4}P_4(\cos\theta) + \dots\right]$$

          (b) At $r = d/2$, $\theta = 90^\circ$: $2\left[1 + \tfrac14\left(-\tfrac12\right) + \tfrac1{16}\cdot\tfrac38\right] = 2(0.8984) = 1.797$.

          (c) Each charge is $\sqrt{d^2 + d^2/4} = \tfrac{\sqrt5}{2}d$ away: $V = 2\cdot\dfrac{2}{\sqrt5} = 1.789$. The series is $0.4\%$ high; the next term ($\ell = 6$) has the opposite sign.

          (d) Near the origin $V - V(0) \propto r^2P_2 = z^2 - \tfrac12(x^2 + y^2)$. A positive charge is pushed back toward the origin along $z$ and away from it in the plane: a saddle.

          **What to remember:** inside, expand in $z/d$; symmetric sources give only even $\ell$; and every harmonic $V$ has saddles, never minima.
        `,
        figs: { ax: { svg: F.p5, cap: md`Region $r \lt d$ (inside the dashed sphere) is charge-free and contains the origin: only $r^\ell$ terms. The axis values fix the coefficients.` } },
      }),

      P({
        title: 'A shell at V₀ sin²θ cos θ',
        q: md`A thin shell of radius $R$ is held at $V_0\sin^2\theta\cos\theta$, nothing else around. Find (a) $a_1$ and (b) $a_3$ in $V_0(\theta) = V_0\sum a_\ell P_\ell$; (c) $E_z$ at the center (units of $V_0/R$); (d) $\sigma$ at the north pole (units of $\varepsilon_0V_0/R$); (e) the dipole moment $p$ of the shell's charge.`,
        figHtml: F.p6,
        hints: [
          md`$\sin^2\theta\cos\theta = \cos\theta - \cos^3\theta$, and $\cos^3\theta = \tfrac35P_1 + \tfrac25P_3$.`,
          md`$\sigma = \dfrac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell$.`,
          md`Outside, the $\ell = 1$ term $a_1V_0R^2\cos\theta/r^2$ equals $\dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$.`,
        ],
        parts: [
          { lbl: md`(a) $a_1$`, ans: 0.4 },
          { lbl: md`(b) $a_3$`, ans: -0.4 },
          { lbl: md`(c) $E_z(0)\,R/V_0$`, ans: -0.4 },
          { lbl: md`(d) $\sigma(0)\,R/(\varepsilon_0V_0)$`, ans: -1.6 },
          { lbl: md`(e) $p$`, expr: '8*pi*eps0*R^2*V0/5', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
        ],
        sol: md`
          **Region:** inside and outside. **Boundary conditions:** 1. finite at $0$; 2. zero at infinity; 3. $V(R,\theta) = V_0\sin^2\theta\cos\theta$.

          **Expand:** $\cos\theta - \cos^3\theta = P_1 - \tfrac35P_1 - \tfrac25P_3 = \tfrac25(P_1 - P_3)$. Odd only, as it must be: the data flip sign under $\theta \to \pi - \theta$.

          $$V_{\text{in}} = \tfrac25V_0\left[\tfrac rRP_1 - \left(\tfrac rR\right)^3P_3\right], \qquad V_{\text{out}} = \tfrac25V_0\left[\left(\tfrac Rr\right)^2P_1 - \left(\tfrac Rr\right)^4P_3\right]$$

          (c) $E_z(0) = -A_1 = -\tfrac25V_0/R$.

          (d) $\sigma = \frac{\varepsilon_0V_0}{R}\cdot\tfrac25(3P_1 - 7P_3)$; at the pole $\tfrac25(3 - 7) = -\tfrac85$. The surface potential is **zero** at the pole, yet $\sigma$ is negative there: $\sigma$ follows the slopes, not the value.

          (e) $\tfrac25V_0R^2 = \dfrac{p}{4\pi\varepsilon_0}$: $p = \tfrac85\pi\varepsilon_0R^2V_0$.

          **What to remember:** $V = 0$ somewhere on the surface does not mean $\sigma = 0$ there.
        `,
      }),

      P({
        title: 'A charged bowl by the axis trick',
        q: md`The northern hemisphere of a sphere of radius $R$ carries uniform $\sigma$; the southern half is absent. (a) Show that on the axis inside, $V(z) = \dfrac{\sigma R}{2\varepsilon_0z}\left(\sqrt{R^2 + z^2} - R + z\right)$, and find $V$ at the center. (b) Find $E_z$ at the center. (c) Find $V(r,\theta)$ inside through the $\ell = 3$ term.`,
        figHtml: F.p7,
        hints: [
          md`Ring at polar angle $\theta'$: charge $\sigma\,2\pi R^2\sin\theta'\,d\theta'$, distance $\sqrt{R^2 + z^2 - 2Rz\cos\theta'}$ from the axis point. Substitute $u = \cos\theta'$, $u$ from $0$ to $1$.`,
          md`Expand $\sqrt{R^2 + z^2} = R + \dfrac{z^2}{2R} - \dfrac{z^4}{8R^3} + \dots$ and divide by $z$.`,
          md`Replace $z^\ell \to r^\ell P_\ell$. Cross-check with the Ex. 3.9 formula using $s_\ell = \sigma\dfrac{2\ell+1}{2}\int_0^1P_\ell\,dx$.`,
        ],
        parts: [
          { lbl: md`(a) $V(0)$`, expr: 'sigma*R/(2*eps0)', vars: { sigma: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(b) $E_z(0)$`, expr: '-sigma/(4*eps0)', vars: { sigma: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(c) $V(r,\theta)$ through $\ell = 3$`, expr: 'sigma*R/(2*eps0) + sigma*r*cos(theta)/(4*eps0) - sigma*r^3*(5*cos(theta)^3 - 3*cos(theta))/(32*eps0*R^2)', vars: { sigma: [1, 3], R: [1.5, 2], eps0: [0.5, 2], r: [0.2, 1.2], theta: [0, 3] } },
        ],
        sol: md`
          **Region:** $r \lt R$, charge-free, contains the origin. **Boundary conditions:**
          1. Finite at $0$: $V = \sum A_\ell r^\ell P_\ell$.
          2. On the axis, $V$ equals the directly computed $V(z)$: fixes the $A_\ell$.

          (a) $$V(z) = \frac{\sigma}{4\pi\varepsilon_0}\int_0^1\frac{2\pi R^2\,du}{\sqrt{R^2 + z^2 - 2Rzu}} = \frac{\sigma R}{2\varepsilon_0z}\left[\sqrt{R^2 + z^2} - \lvert R - z\rvert\right]$$

          For $0 \lt z \lt R$, $\lvert R - z\rvert = R - z$, which gives the stated form. As $z \to 0$: $\sqrt{R^2 + z^2} - R \approx z^2/2R$, so $V(0) = \dfrac{\sigma R}{2\varepsilon_0}$ (each charge is a distance $R$ away: $\frac{Q}{4\pi\varepsilon_0R}$ with $Q = 2\pi R^2\sigma$ ✓).

          **Series:** $\dfrac{\sqrt{R^2 + z^2} - R}{z} = \dfrac{z}{2R} - \dfrac{z^3}{8R^3} + \dots$, so

          $$V(z) = \frac{\sigma R}{2\varepsilon_0}\left[1 + \frac{z}{2R} - \frac{z^3}{8R^3} + \dots\right]$$

          (b) $E_z = -\partial_zV|_0 = -\dfrac{\sigma}{4\varepsilon_0}$: down, away from the bowl.

          (c) $$V = \frac{\sigma R}{2\varepsilon_0} + \frac{\sigma}{4\varepsilon_0}rP_1(\cos\theta) - \frac{\sigma}{16\varepsilon_0R^2}r^3P_3(\cos\theta) + \dots$$

          **Cross-check (Ex. 3.9):** the step has $s_0 = \tfrac12\sigma$, $s_1 = \tfrac34\sigma$, $s_3 = -\tfrac7{16}\sigma$. $A_1 = \dfrac{s_1}{3\varepsilon_0} = \dfrac{\sigma}{4\varepsilon_0}$ ✓, $A_3 = \dfrac{s_3}{7\varepsilon_0R^2} = -\dfrac{\sigma}{16\varepsilon_0R^2}$ ✓.

          **What to remember:** two independent routes (axis integral, Ex. 3.9) must agree term by term. Use one to check the other.
        `,
      }),

      R(md`
        ### Level 4: one twist

        A conductor inside a charged shell, a fourth-degree boundary, and two charged shells at once.
      `),

      P({
        title: 'A grounded ball inside a σ₀ cos θ shell',
        q: md`A grounded metal sphere of radius $a$ sits at the center of a thin non-conducting shell of radius $b$ carrying $\sigma_0\cos\theta$. Find (a) $V$ in the gap $a \lt r \lt b$, (b) $V$ outside, (c) the induced $\sigma_a(\theta)$ on the metal sphere, (d) its total charge.`,
        figHtml: F.p8,
        hints: [
          md`Only $\ell = 1$ is driven ($\sigma \propto P_1$, and the metal is at $0$). Gap: $A(r - a^3/r^2)\cos\theta$ already satisfies $V(a) = 0$. Outside: $B\cos\theta/r^2$.`,
          md`At $r = b$: continuity and the jump $\partial_rV_{\text{out}} - \partial_rV_{\text{gap}} = -\sigma_0\cos\theta/\varepsilon_0$.`,
          md`On the metal, $\sigma_a = -\varepsilon_0\partial V/\partial r$ at $r = a^+$ (the normal points out of the metal, $+\hat{\mathbf r}$).`,
        ],
        parts: [
          { lbl: md`(a) $V_{\text{gap}}(r,\theta)$`, expr: 'sigma0/(3*eps0)*(r - a^3/r^2)*cos(theta)', vars: { sigma0: [1, 3], eps0: [0.5, 2], a: [0.5, 1], r: [1.2, 1.8], theta: [0, 3] } },
          { lbl: md`(b) $V_{\text{out}}(r,\theta)$`, expr: 'sigma0*(b^3 - a^3)*cos(theta)/(3*eps0*r^2)', vars: { sigma0: [1, 3], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 2], r: [2.5, 4], theta: [0, 3] } },
          { lbl: md`(c) $\sigma_a(\theta)$`, expr: '-sigma0*cos(theta)', vars: { sigma0: [1, 3], theta: [0, 3] } },
          { lbl: md`(d) total charge on the metal sphere`, mc: [md`$-\tfrac43\pi a^2\sigma_0$`, md`$0$`, md`$-\tfrac43\pi b^2\sigma_0$`, md`depends on $a/b$`], a: 1,
            why: [md`That treats $\cos\theta$ as if it had a nonzero average.`, null, md`$\sigma_a \propto P_1$ integrates to zero whatever its size.`, md`The total is the $\ell = 0$ part, which is zero for any radii.`] },
        ],
        sol: md`
          **Regions:** gap $a \lt r \lt b$ (both families), outside $r \gt b$. **Boundary conditions:**
          1. $V(a,\theta) = 0$ (grounded metal): $B_\ell^{\text{gap}} = -A_\ell a^{2\ell+1}$.
          2. $V \to 0$ at infinity: outside only $B_\ell r^{-(\ell+1)}$.
          3. Continuity at $r = b$.
          4. Jump at $r = b$: $\partial_rV_{\text{out}} - \partial_rV_{\text{gap}} = -\sigma_0\cos\theta/\varepsilon_0$.

          All data are $\ell = 1$ (or zero), so $V_{\text{gap}} = A\left(r - \frac{a^3}{r^2}\right)\cos\theta$, $V_{\text{out}} = \frac{B}{r^2}\cos\theta$.

          BC 3: $A\left(b - \frac{a^3}{b^2}\right) = \frac{B}{b^2}$, so $B = A(b^3 - a^3)$.

          BC 4: $-\frac{2B}{b^3} - A\left(1 + \frac{2a^3}{b^3}\right) = -\frac{\sigma_0}{\varepsilon_0}$. Substitute $B$: $-A\frac{2b^3 - 2a^3 + b^3 + 2a^3}{b^3} = -3A$. So $A = \dfrac{\sigma_0}{3\varepsilon_0}$, independent of $a$.

          (a) $V_{\text{gap}} = \dfrac{\sigma_0}{3\varepsilon_0}\left(r - \dfrac{a^3}{r^2}\right)\cos\theta$. (b) $V_{\text{out}} = \dfrac{\sigma_0(b^3 - a^3)}{3\varepsilon_0r^2}\cos\theta$.

          (c) $\partial_rV_{\text{gap}}|_a = A\left(1 + 2\right)\cos\theta = \frac{\sigma_0}{\varepsilon_0}\cos\theta$, so $\sigma_a = -\sigma_0\cos\theta$.

          (d) Zero.

          **Interpretation:** without the ball, the field inside the shell is uniform, $-\frac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$. A grounded sphere in a uniform field $E$ gets $3\varepsilon_0E\cos\theta$; here $E = -\sigma_0/3\varepsilon_0$, giving $-\sigma_0\cos\theta$. The ball's induced dipole $-\tfrac43\pi a^3\sigma_0$ reduces the shell's $\tfrac43\pi b^3\sigma_0$, which is the $b^3 - a^3$ outside.
        `,
      }),

      P({
        title: 'A shell at V₀ cos⁴θ',
        q: md`A thin shell of radius $R$ is held at $V_0\cos^4\theta$, nothing else around. Using $P_4 = \tfrac18(35x^4 - 30x^2 + 3)$: find (a) $a_0$, (b) $a_2$, (c) $a_4$; (d) $V$ at $P$ ($r = R/2$ on the axis), in units of $V_0$; (e) $\sigma$ on the equator (units of $\varepsilon_0V_0/R$); (f) the total charge.`,
        figHtml: F.p9,
        hints: [
          md`Peel from the top: $x^4 = \tfrac{8}{35}P_4 + (\text{an }x^2\text{ and constant remainder})$.`,
          md`$x^4 - \tfrac8{35}P_4 = \tfrac67x^2 - \tfrac3{35}$. Then $x^2 = \tfrac23P_2 + \tfrac13$.`,
          md`$\sigma = \frac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell$; $P_2(0) = -\tfrac12$, $P_4(0) = \tfrac38$.`,
        ],
        parts: [
          { lbl: md`(a) $a_0$`, ans: 0.2 },
          { lbl: md`(b) $a_2$`, ans: 0.571429 },
          { lbl: md`(c) $a_4$`, ans: 0.228571 },
          { lbl: md`(d) $V(R/2, 0)/V_0$`, ans: 0.357143 },
          { lbl: md`(e) $\sigma(\pi/2)\,R/(\varepsilon_0V_0)$`, ans: -0.457143 },
          { lbl: md`(f) $Q$`, expr: '4*pi*eps0*R*V0/5', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
        ],
        sol: md`
          **Region:** inside and outside. **Boundary conditions:** 1. finite at $0$; 2. zero at infinity; 3. $V(R,\theta) = V_0\cos^4\theta$. Even data: even $\ell$ only, up to $4$.

          **Expand:** $\tfrac8{35}P_4 = x^4 - \tfrac67x^2 + \tfrac3{35}$, so $x^4 = \tfrac8{35}P_4 + \tfrac67x^2 - \tfrac3{35} = \tfrac8{35}P_4 + \tfrac47P_2 + \tfrac27 - \tfrac3{35}$:

          $$\cos^4\theta = \tfrac15 + \tfrac47P_2 + \tfrac8{35}P_4$$

          Check at $x = 1$: $\tfrac{7 + 20 + 8}{35} = 1$ ✓. Check the average: $\langle\cos^4\rangle = \tfrac15$ ✓.

          (d) $\tfrac15 + \tfrac47\cdot\tfrac14 + \tfrac8{35}\cdot\tfrac1{16} = \tfrac{14 + 10 + 1}{70} = \tfrac5{14}$.

          (e) $\tfrac15 + 5\cdot\tfrac47\left(-\tfrac12\right) + 9\cdot\tfrac8{35}\cdot\tfrac38 = \tfrac{7 - 50 + 27}{35} = -\tfrac{16}{35}$. The surface potential is zero on the equator, but the charge there is negative.

          (f) $Q = 4\pi\varepsilon_0R\cdot\tfrac15V_0$.

          **What to remember:** for $\cos^n\theta$, peel off the top $P_n$ (leading coefficient of $P_n$ known) and recurse. Check $x = 1$ and the average.
        `,
      }),

      P({
        title: 'Two charged shells',
        q: md`A thin shell of radius $a$ carries $k\cos\theta$. A concentric thin shell of radius $b \gt a$ carries uniform $\sigma$. (a) How many conditions fix the solution? Find (b) $V$ at the center, (c) $E_z$ for $r \lt a$, (d) $V$ in the gap, (e) $V$ outside.`,
        figHtml: F.p10,
        hints: [
          md`Three regions: inside $A_\ell r^\ell$, gap both, outside $B_\ell r^{-(\ell+1)}$. Each surface gives continuity and a jump.`,
          md`Shortcut: superpose. Each shell alone is an Ex. 3.9 problem, and Laplace's equation is linear.`,
          md`Uniform shell: $\frac{\sigma b}{\varepsilon_0}$ inside, $\frac{\sigma b^2}{\varepsilon_0r}$ outside. $\cos\theta$ shell: $\frac{k}{3\varepsilon_0}r\cos\theta$ inside, $\frac{ka^3}{3\varepsilon_0r^2}\cos\theta$ outside.`,
        ],
        parts: [
          { lbl: md`(a) Number of conditions (per $\ell$, counting the two "behaves at $0$ / $\infty$" ones)`, mc: [md`$4$`, md`$5$`, md`$6$`, md`$8$`], a: 2,
            why: [md`Four is a single shell.`, md`Count again: two at the surfaces each, plus finiteness at $0$ and decay at $\infty$.`, null, md`Eight would count two conditions per region as well; the regions supply none. There are six coefficients and six conditions.`] },
          { lbl: md`(b) $V(0)$`, expr: 'sigma*b/eps0', vars: { sigma: [1, 3], b: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(c) $E_z$ for $r \lt a$`, expr: '-k/(3*eps0)', vars: { k: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(d) $V_{\text{gap}}(r,\theta)$`, expr: 'sigma*b/eps0 + k*a^3*cos(theta)/(3*eps0*r^2)', vars: { sigma: [1, 3], b: [2, 3], eps0: [0.5, 2], k: [1, 3], a: [0.5, 1], r: [1.2, 1.8], theta: [0, 3] } },
          { lbl: md`(e) $V_{\text{out}}(r,\theta)$`, expr: 'sigma*b^2/(eps0*r) + k*a^3*cos(theta)/(3*eps0*r^2)', vars: { sigma: [1, 3], b: [1, 1.5], eps0: [0.5, 2], k: [1, 3], a: [0.5, 0.9], r: [2, 3], theta: [0, 3] } },
        ],
        sol: md`
          **Regions:** $r \lt a$, $a \lt r \lt b$, $r \gt b$. **Boundary conditions:**
          1. Finite at $r = 0$.
          2. $V \to 0$ at infinity.
          3. Continuity at $r = a$. 4. Jump $-k\cos\theta/\varepsilon_0$ at $r = a$.
          5. Continuity at $r = b$. 6. Jump $-\sigma/\varepsilon_0$ at $r = b$.

          Six conditions for six coefficients per $\ell$ (two of them are killed by 1 and 2). Only $\ell = 0$ and $\ell = 1$ are driven.

          **Superpose** the two single-shell solutions (each satisfies its own conditions; the sum satisfies all six):

          | region | uniform shell $b$ | $k\cos\theta$ shell $a$ |
          |---|---|---|
          | $r \lt a$ | $\sigma b/\varepsilon_0$ | $\frac{k}{3\varepsilon_0}r\cos\theta$ |
          | $a \lt r \lt b$ | $\sigma b/\varepsilon_0$ | $\frac{ka^3}{3\varepsilon_0r^2}\cos\theta$ |
          | $r \gt b$ | $\frac{\sigma b^2}{\varepsilon_0r}$ | $\frac{ka^3}{3\varepsilon_0r^2}\cos\theta$ |

          (b) $V(0) = \sigma b/\varepsilon_0$. (c) $E_z = -\frac{k}{3\varepsilon_0}$ (the uniform shell adds no field inside). (d), (e) Add across each row.

          **Check BC 6:** at $r = b$ only the uniform part has a slope jump: $-\frac{\sigma b^2}{\varepsilon_0b^2} - 0 = -\frac\sigma{\varepsilon_0}$ ✓.

          **What to remember:** with several shells, count conditions to be sure the problem is fixed, then superpose single-shell solutions.
        `,
      }),

      R(md`
        ### Level 5: exam level

        Multi-part, chained, with a force or charge question at the end. Write the numbered conditions before touching algebra.
      `),

      P({
        title: 'A shell at V₀(cos²θ + cos θ) around a point charge',
        q: md`A point charge $q$ sits at the center of a thin shell of radius $R$ held at $V_0\left(\cos^2\theta + \cos\theta\right)$. Find (a) the constant $A_0$ in $V_{\text{in}} = \dfrac{q}{4\pi\varepsilon_0r} + \sum A_\ell r^\ell P_\ell$; (b) $V$ at $P$ ($r = R/2$ on the $+z$ axis); (c) $V$ outside; (d) the charge on the shell; (e) the force on $q$.`,
        figHtml: F.p11,
        hints: [
          md`$\cos^2\theta + \cos\theta = \tfrac13 + P_1 + \tfrac23P_2$.`,
          md`At $r = R$ the point charge adds the constant $\frac{q}{4\pi\varepsilon_0R}$: only $A_0$ feels it. Outside, the total potential at $r = R$ is the given one, so $V_{\text{out}}$ doesn't care what is inside.`,
          md`Charge on the shell = total enclosed (from $B_0$) minus $q$. The force on $q$ is $q$ times the field of everything else at the center, which is the $\ell = 1$ term.`,
        ],
        parts: [
          { lbl: md`(a) $A_0$`, expr: 'V0/3 - q/(4*pi*eps0*R)', vars: { V0: [1, 3], q: [1, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`(b) $V(R/2, 0)$`, expr: 'V0 + q/(4*pi*eps0*R)', vars: { V0: [1, 3], q: [1, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`(c) $V_{\text{out}}(r,\theta)$`, expr: 'V0*(R/(3*r) + R^2*cos(theta)/r^2 + R^3*(3*cos(theta)^2 - 1)/(3*r^3))', vars: { V0: [1, 3], R: [1, 1.5], r: [2, 3], theta: [0, 3] } },
          { lbl: md`(d) $Q_{\text{shell}}$`, expr: '4*pi*eps0*R*V0/3 - q', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3], q: [1, 3] } },
          { lbl: md`(e) $F_z$ on $q$`, expr: '-q*V0/R', vars: { q: [1, 3], V0: [1, 3], R: [1, 2] } },
        ],
        sol: md`
          **Regions:** inside (with the point charge at the origin) and outside. **Boundary conditions:**
          1. Inside, the only singularity at $r = 0$ is the point charge: $V_{\text{in}} = \frac{q}{4\pi\varepsilon_0r} + \sum A_\ell r^\ell P_\ell$.
          2. $V \to 0$ at infinity: $V_{\text{out}} = \sum B_\ell r^{-(\ell+1)}P_\ell$.
          3. $V(R,\theta) = V_0\left(\tfrac13 + P_1 + \tfrac23P_2\right)$ from both sides.

          **Inside**, $\ell = 0$: $\frac{q}{4\pi\varepsilon_0R} + A_0 = \frac{V_0}{3}$. (a) $A_0 = \frac{V_0}3 - \frac{q}{4\pi\varepsilon_0R}$. Higher: $A_1 = V_0/R$, $A_2 = \frac{2V_0}{3R^2}$.

          (b) $\frac{q}{4\pi\varepsilon_0}\frac2R + \frac{V_0}3 - \frac{q}{4\pi\varepsilon_0R} + \frac{V_0}{2} + \frac{2V_0}{3}\cdot\frac14 = V_0 + \frac{q}{4\pi\varepsilon_0R}$.

          (c) $$V_{\text{out}} = V_0\left[\frac{R}{3r} + \frac{R^2}{r^2}P_1 + \frac{2R^3}{3r^3}P_2\right]$$ The point charge doesn't appear: the outside problem only sees $V$ on $r = R$.

          (d) $B_0 = \frac{V_0R}{3} = \frac{Q_{\text{tot}}}{4\pi\varepsilon_0}$, so $Q_{\text{tot}} = \frac{4\pi\varepsilon_0RV_0}{3}$ and $Q_{\text{shell}} = Q_{\text{tot}} - q$.

          (e) The field at the center from the shell is $-A_1\hat{\mathbf z} = -\frac{V_0}R\hat{\mathbf z}$ (the $\ell = 0$ and $\ell = 2$ parts give none there; the charge's own field exerts no force on itself). $F_z = -\frac{qV_0}{R}$.

          **What to remember:** a central charge only shifts $A_0$ inside; outside is fixed by the shell potential alone; the shell's charge adjusts to make that so.
        `,
      }),

      P({
        title: 'A grounded sphere inside a shell at V₀ cos²θ',
        q: md`A grounded metal sphere of radius $a$ is concentric with a thin shell of radius $b$ held at $V_0\cos^2\theta$. Find (a) the $\ell = 0$ part of $V$ in the gap; (b) the $\ell = 2$ coefficient $A_2$ in the gap; (c) the total charge on the metal sphere; (d) for $b = 2a$, $\sigma$ on the metal sphere at its north pole, in units of $\varepsilon_0V_0/a$. (e) Does the metal sphere change $V$ for $r \gt b$?`,
        figHtml: F.groundCos2,
        hints: [
          md`Gap: both families. $V_0\cos^2\theta = V_0\left(\tfrac13 + \tfrac23P_2\right)$ on $r = b$; $0$ on $r = a$. Each $\ell$ separately.`,
          md`$\ell = 0$: $A_0 + B_0/a = 0$ and $A_0 + B_0/b = V_0/3$. $\ell = 2$: $A_2a^2 + B_2/a^3 = 0$ and $A_2b^2 + B_2/b^3 = \tfrac23V_0$.`,
          md`$\sigma_a = -\varepsilon_0\partial_rV|_{a^+}$. For $\ell = 2$: $\partial_r(A_2r^2 + B_2r^{-3}) = 2A_2a - 3B_2a^{-4}$ with $B_2 = -A_2a^5$.`,
        ],
        parts: [
          { lbl: md`(a) $\ell = 0$ part, $A_0 + B_0/r$`, expr: 'V0*b*(1 - a/r)/(3*(b - a))', vars: { V0: [1, 3], a: [1, 1.5], b: [2.5, 3.5], r: [1.6, 2.4] } },
          { lbl: md`(b) $A_2$`, expr: '2*V0*b^3/(3*(b^5 - a^5))', vars: { V0: [1, 3], a: [1, 1.5], b: [2.5, 3.5] } },
          { lbl: md`(c) $Q_a$`, expr: '-4*pi*eps0*V0*a*b/(3*(b - a))', vars: { eps0: [0.5, 2], V0: [1, 3], a: [1, 1.5], b: [2.5, 3.5] } },
          { lbl: md`(d) $\sigma_a(0)\,a/(\varepsilon_0V_0)$ for $b = 2a$`, ans: -1.526882 },
          { lbl: md`(e) Effect on $V$ for $r \gt b$`, mc: [md`none: $V_{\text{out}} = V_0\left[\frac b{3r} + \frac{2b^3}{3r^3}P_2\right]$ either way`, md`it adds a $1/r$ term equal to its own charge`, md`it reduces the quadrupole term`, md`it makes $V_{\text{out}} = 0$`], a: 0,
            why: [null, md`Its charge is real, but the shell's charge adjusts so that $V(b,\theta)$ stays $V_0\cos^2\theta$; outside sees only that.`, md`The outside problem's data ($V$ on $r = b$, zero at infinity) don't involve the sphere.`, md`That would need the outer shell grounded.`] },
        ],
        sol: md`
          **Region:** the gap $a \lt r \lt b$ (both families). **Boundary conditions:**
          1. $V(a,\theta) = 0$ (grounded metal).
          2. $V(b,\theta) = V_0\left(\tfrac13 + \tfrac23P_2\right)$.

          Each $\ell$ gets two equations for $A_\ell$, $B_\ell$; only $\ell = 0, 2$ are driven.

          $\ell = 0$: $B_0 = -\frac{V_0}{3}\frac{ab}{b - a}$, $A_0 = \frac{V_0}{3}\frac{b}{b - a}$. (a) $A_0 + \frac{B_0}{r} = \frac{V_0b}{3(b - a)}\left(1 - \frac ar\right)$.

          $\ell = 2$: $B_2 = -A_2a^5$, $A_2\left(b^2 - \frac{a^5}{b^3}\right) = \frac23V_0$. (b) $A_2 = \frac{2V_0b^3}{3(b^5 - a^5)}$.

          (c) Gauss on a sphere just outside $a$: $Q_a = 4\pi\varepsilon_0B_0 = -\frac{4\pi\varepsilon_0V_0}{3}\frac{ab}{b - a}$ (the $\ell = 2$ part of $\sigma_a$ integrates to zero).

          (d) $\sigma_a = -\varepsilon_0\partial_rV|_a = \frac{\varepsilon_0B_0}{a^2} - 5\varepsilon_0A_2aP_2(\cos\theta)$. For $b = 2a$: $\frac{\varepsilon_0B_0}{a^2} = -\frac23\frac{\varepsilon_0V_0}{a}$, $A_2 = \frac{16V_0}{93a^2}$, so at the pole $\sigma_a = \left(-\frac23 - \frac{80}{93}\right)\frac{\varepsilon_0V_0}{a} = -\frac{142}{93}\frac{\varepsilon_0V_0}{a}$.

          (e) Outside: $V(b) = V_0\cos^2\theta$ and $V \to 0$ fix it uniquely, sphere or not.

          **What to remember:** concentric spheres don't mix $\ell$. Each driven $\ell$ is a 2×2 system; the charge on any sphere is $4\pi\varepsilon_0B_0$ evaluated just outside it.
        `,
      }),

      P({
        title: 'A metal sphere at V₀ in a field',
        q: md`A metal sphere of radius $R$ is held at potential $V_0$ (relative to the far equatorial plane) in a field that is $E_0\hat{\mathbf z}$ far away. Find (a) $\sigma(\theta)$; (b) for $V_0 = E_0R$, the polar angle (degrees) where $\sigma = 0$; (c) its total charge; (d) the smallest $V_0/(E_0R)$ for which $\sigma \ge 0$ everywhere; (e) the net force on the sphere.`,
        figHtml: F.fieldV,
        hints: [
          md`Conditions: $V(R,\theta) = V_0$; $V \to -E_0r\cos\theta$. $\ell = 1$ gives the neutral-sphere answer; $\ell = 0$ gives $V_0R/r$.`,
          md`$\sigma = -\varepsilon_0\partial_rV$ at $r = R$.`,
          md`Force: integrate the pressure $\frac{\sigma^2}{2\varepsilon_0}$ times $\cos\theta$ over the sphere, or argue: the dipole feels no force in a uniform field.`,
        ],
        parts: [
          { lbl: md`(a) $\sigma(\theta)$`, expr: 'eps0*(3*E0*cos(theta) + V0/R)', vars: { eps0: [0.5, 2], E0: [1, 3], theta: [0, 3], V0: [1, 3], R: [1, 2] } },
          { lbl: md`(b) $\theta$ where $\sigma = 0$, degrees`, ans: 109.47 },
          { lbl: md`(c) $Q$`, expr: '4*pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
          { lbl: md`(d) minimum $V_0/(E_0R)$`, ans: 3 },
          { lbl: md`(e) $F_z$`, expr: '4*pi*eps0*R*V0*E0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3], E0: [1, 3] } },
        ],
        sol: md`
          **Region:** $r \ge R$. **Boundary conditions:**
          1. $V(R,\theta) = V_0$ (conductor held at $V_0$).
          2. $V \to -E_0r\cos\theta$ as $r \to \infty$: $A_1 = -E_0$, other $A_\ell = 0$.

          $\ell = 1$: $-E_0R + B_1/R^2 = 0$, $B_1 = E_0R^3$. $\ell = 0$: $B_0/R = V_0$. All else zero.

          $$V = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta + \frac{V_0R}{r}$$

          (a) $\sigma = -\varepsilon_0\partial_rV|_R = \varepsilon_0\left(3E_0\cos\theta + \frac{V_0}{R}\right)$.

          (b) $3\cos\theta = -1$: $\theta = \arccos\left(-\tfrac13\right) = 109.47^\circ$.

          [[fig:sg]]

          (c) $Q = 4\pi\varepsilon_0B_0 = 4\pi\varepsilon_0RV_0$.

          (d) South pole: $V_0/R \ge 3E_0$.

          (e) $F_z = \oint\frac{\sigma^2}{2\varepsilon_0}\cos\theta\,da = \pi\varepsilon_0R^2\int_{-1}^1\left(3E_0x + \frac{V_0}R\right)^2x\,dx$. Expand the square: the $x^2\cdot x$ and $1\cdot x$ pieces are odd and integrate to zero; only the cross term $\frac{6E_0V_0}{R}x^2$ survives: $\pi\varepsilon_0R^2\cdot\frac{6E_0V_0}{R}\cdot\frac23 = 4\pi\varepsilon_0RV_0E_0 = QE_0$.

          **What to remember:** $Q\mathbf E_0$ is the whole force; the induced dipole adds nothing in a uniform field. The $\sigma = 0$ line sits at $\cos\theta = -\frac{V_0}{3E_0R}$.
        `,
        figs: { sg: { svg: F.sig13, cap: md`$\sigma/\varepsilon_0E_0 = 3\cos\theta + 1$ for $V_0 = E_0R$ (solid) against the grounded sphere (dashed). The uniform part lifts the curve and moves the zero to $109.5^\circ$.` } },
      }),

      P({
        title: 'A charge inside a grounded shell, by Legendre series',
        q: md`A point charge $q$ sits at $z = d$ inside a grounded metal shell of radius $R$ ($d \lt R$). Write $V_{\text{in}} = \dfrac{q}{4\pi\varepsilon_0\lvert\mathbf r - d\hat{\mathbf z}\rvert} + \sum A_\ell r^\ell P_\ell(\cos\theta)$. Find (a) $A_1$; (b) the field of the induced charge at the center, $E_z$; (c) the total induced charge in units of $q$; (d) the force on $q$ (sum the series on the axis); (e) $\sigma$ at the north pole of the shell.`,
        figHtml: F.gshell,
        hints: [
          md`On $r = R \gt d$: $\dfrac{1}{\lvert\mathbf r - d\hat{\mathbf z}\rvert} = \sum\dfrac{d^\ell}{R^{\ell+1}}P_\ell$. The $A_\ell$ must cancel it term by term.`,
          md`So $A_\ell = -\dfrac{q}{4\pi\varepsilon_0}\dfrac{d^\ell}{R^{2\ell+1}}$. On the axis the induced part is a geometric series.`,
          md`$\sum_\ell\frac{(dz)^\ell}{R^{2\ell+1}} = \frac{R}{R^2 - dz}$. The induced field at $q$ is $-\partial_z$ of that, at $z = d$.`,
        ],
        parts: [
          { lbl: md`(a) $A_1$`, expr: '-q*d/(4*pi*eps0*R^3)', vars: { q: [1, 3], d: [0.2, 0.6], eps0: [0.5, 2], R: [1, 1.5] } },
          { lbl: md`(b) $E_z(0)$ of the induced charge`, expr: 'q*d/(4*pi*eps0*R^3)', vars: { q: [1, 3], d: [0.2, 0.6], eps0: [0.5, 2], R: [1, 1.5] } },
          { lbl: md`(c) $Q_{\text{ind}}/q$`, ans: -1 },
          { lbl: md`(d) $F_z$ on $q$`, expr: 'q^2*R*d/(4*pi*eps0*(R^2 - d^2)^2)', vars: { q: [1, 3], d: [0.2, 0.6], eps0: [0.5, 2], R: [1, 1.5] } },
          { lbl: md`(e) $\sigma$ at the north pole`, expr: '-q*(R + d)/(4*pi*R*(R - d)^2)', vars: { q: [1, 3], d: [0.2, 0.6], R: [1, 1.5] } },
        ],
        sol: md`
          **Region:** $r \lt R$, containing $q$. **Boundary conditions:**
          1. Inside, the only singularity is $q$: the Coulomb term plus $\sum A_\ell r^\ell P_\ell$ (no $B_\ell$).
          2. $V(R,\theta) = 0$ (grounded shell).

          On $r = R$, $\frac{1}{\lvert\mathbf r - d\hat{\mathbf z}\rvert} = \sum\frac{d^\ell}{R^{\ell+1}}P_\ell$ ($r_> = R$). BC 2, term by term: $A_\ell R^\ell = -\frac{q}{4\pi\varepsilon_0}\frac{d^\ell}{R^{\ell+1}}$.

          (a) $A_1 = -\frac{q}{4\pi\varepsilon_0}\frac{d}{R^3}$. (b) $E_z = -A_1 = +\frac{qd}{4\pi\varepsilon_0R^3}$: toward the near wall, where the negative induced charge piles up.

          (c) $A_0 = -\frac{q}{4\pi\varepsilon_0R}$ is the potential of $-q$ spread on the shell. Or Gauss in the metal: $-q$.

          (d) On the axis: $V_{\text{ind}}(z) = -\frac{q}{4\pi\varepsilon_0}\sum\frac{d^\ell z^\ell}{R^{2\ell+1}} = -\frac{q}{4\pi\varepsilon_0}\frac{R}{R^2 - dz}$. This is a point charge $-qR/d$ at $z = R^2/d$, the image:

          [[fig:img]]

          $E_z = -\partial_zV_{\text{ind}} = \frac{q}{4\pi\varepsilon_0}\frac{Rd}{(R^2 - dz)^2}$; at $z = d$: $F_z = \frac{q^2Rd}{4\pi\varepsilon_0(R^2 - d^2)^2}$, toward the wall.

          (e) With the image, $\sigma = \varepsilon_0\partial_rV|_{R^-}$ (the normal out of the metal points inward, $-\hat{\mathbf r}$), which gives $\sigma(\theta) = -\frac{q(R^2 - d^2)}{4\pi R(R^2 + d^2 - 2Rd\cos\theta)^{3/2}}$. At $\theta = 0$: $-\frac{q(R + d)}{4\pi R(R - d)^2}$.

          **What to remember:** the Legendre series and the image are the same answer; summing the axis series is how you discover the image.
        `,
        figs: { img: { svg: F.p14img, cap: md`The summed series is the potential of an image $q' = -qR/d$ at $z = R^2/d$, outside the region. The shell is dashed: in this picture the image replaces it.` } },
      }),

      R(md`
        ### Level 6: harder than the exam

        Each problem stacks two ideas: superposition plus force or energy, convergence and error, or an off-axis source where the coefficients come with their own Legendre factors.
      `),

      P({
        title: 'A σ₀ cos²θ shell in a uniform field',
        q: md`A thin non-conducting shell of radius $R$ carries **fixed** charge $\sigma_0\cos^2\theta$ and sits in an external field $E_0\hat{\mathbf z}$ (no conductors anywhere). Take $V_{\text{ext}} = -E_0r\cos\theta$. Find (a) $V$ at the center; (b) $E_z$ at the center; (c) the total $V$ inside; (d) the point on the $+z$ axis inside where $\mathbf E = 0$ (assume it lies inside); (e) the net force on the shell; (f) the interaction energy $\int\sigma V_{\text{ext}}\,da$.`,
        figHtml: F.shellCos2,
        hints: [
          md`Superpose: $V = -E_0r\cos\theta + V_{\text{shell}}$. The shell's charge is fixed, so the external field doesn't rearrange it.`,
          md`$\cos^2\theta = \tfrac13 + \tfrac23P_2$: $A_0 = \frac{\sigma_0R}{3\varepsilon_0}$, $A_2 = \frac{2\sigma_0}{15\varepsilon_0R}$.`,
          md`On the axis inside, $E_z = E_0 - 2A_2z$. The force is $Q\mathbf E_0$ plus nothing from the shell's own field.`,
        ],
        parts: [
          { lbl: md`(a) $V(0)$`, expr: 'sigma0*R/(3*eps0)', vars: { sigma0: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(b) $E_z(0)$`, expr: 'E0', vars: { E0: [1, 3] } },
          { lbl: md`(c) $V_{\text{in}}(r,\theta)$`, expr: '-E0*r*cos(theta) + sigma0*R/(3*eps0) + sigma0*r^2*(3*cos(theta)^2 - 1)/(15*eps0*R)', vars: { E0: [1, 3], r: [0.2, 1.2], theta: [0, 3], sigma0: [1, 3], R: [1.5, 2], eps0: [0.5, 2] } },
          { lbl: md`(d) $z^*$`, expr: '15*eps0*R*E0/(4*sigma0)', vars: { eps0: [0.5, 2], R: [1, 2], E0: [1, 3], sigma0: [1, 3] } },
          { lbl: md`(e) $F_z$`, expr: '4*pi*R^2*sigma0*E0/3', vars: { R: [1, 2], sigma0: [1, 3], E0: [1, 3] } },
          { lbl: md`(f) $U_{\text{int}}$`, ans: 0 },
        ],
        sol: md`
          **Regions:** inside and outside the shell. **Boundary conditions** (for the shell's own potential; the external part is added after):
          1. Finite at $0$. 2. $V_{\text{shell}} \to 0$ at infinity. 3. Continuity at $R$. 4. Jump $-\sigma_0\cos^2\theta/\varepsilon_0$ at $R$.

          The external potential $-E_0r\cos\theta$ solves Laplace everywhere and has no jump at $R$, so adding it breaks none of 1, 3, 4 (and replaces 2 by $V \to -E_0r\cos\theta$).

          **Shell:** $s_0 = \tfrac13\sigma_0$, $s_2 = \tfrac23\sigma_0$: $A_0 = \frac{\sigma_0R}{3\varepsilon_0}$, $A_2 = \frac{s_2}{5\varepsilon_0R} = \frac{2\sigma_0}{15\varepsilon_0R}$.

          (c) $$V_{\text{in}} = -E_0r\cos\theta + \frac{\sigma_0R}{3\varepsilon_0} + \frac{2\sigma_0}{15\varepsilon_0R}r^2P_2(\cos\theta)$$

          (a) $\frac{\sigma_0R}{3\varepsilon_0}$. (b) The shell has no $\ell = 1$: $E_z(0) = E_0$.

          (d) On the axis, $V = -E_0z + \text{const} + \frac{2\sigma_0}{15\varepsilon_0R}z^2$; $E_z = E_0 - \frac{4\sigma_0}{15\varepsilon_0R}z = 0$ at $z^* = \frac{15\varepsilon_0RE_0}{4\sigma_0}$ (inside if $\sigma_0 \gt \tfrac{15}4\varepsilon_0E_0$). The quadrupole's field grows linearly from the center and eventually cancels $E_0$.

          (e) Net charge $Q = \tfrac43\pi R^2\sigma_0$; its own field exerts no net force on it. $F_z = \tfrac43\pi R^2\sigma_0E_0$.

          (f) $\int\sigma_0\cos^2\theta(-E_0R\cos\theta)\,2\pi R^2\sin\theta\,d\theta \propto \int_{-1}^1x^3\,dx = 0$. The interaction energy of a charge distribution with a uniform field is $-\mathbf p\cdot\mathbf E_0$ (plus $Q$ times the reference potential at the center, here $0$), and this distribution has $\mathbf p = 0$.

          **What to remember:** in a uniform field, $\ell = 0$ feels the force, $\ell = 1$ feels the torque and the orientation energy $-\mathbf p\cdot\mathbf E_0$, $\ell \ge 2$ feel nothing.
        `,
      }),

      P({
        title: 'Hemisphere at V₀, three terms: how wrong?',
        q: md`The northern hemisphere of a thin shell is at $V_0$, the southern half grounded. Keep only $\ell = 0, 1, 3$. (a) Find $a_3$. (b) The 3-term value on the surface at the north pole (units of $V_0$). (c) Its error (exact minus 3-term). (d) The 3-term value on the axis at $r = R/2$. (e) The exact value there and the error of the 3-term value, using $V(z) = \dfrac{V_0}{2}\dfrac{R + z}{z}\left[1 - \dfrac{R - z}{\sqrt{R^2 + z^2}}\right]$ for $0 \lt z \lt R$. (f) The size of the first dropped term at $r = R/2$ (estimate of the error). (g) The exact $V$ at $z = 2R$ on the axis, using $V_{\text{out}}(r,\theta) = \dfrac Rr V_{\text{in}}\left(\dfrac{R^2}{r},\theta\right)$.`,
        figHtml: F.p16,
        hints: [
          md`$a_\ell = \frac{2\ell+1}{2}\int_0^1P_\ell\,dx$, and $\int_0^1P_\ell\,dx = \frac{P_{\ell-1}(0) - P_{\ell+1}(0)}{2\ell+1}$.`,
          md`The first dropped term is $\ell = 5$: $a_5 = \tfrac{11}{32}$. Inside it carries $(r/R)^5$.`,
          md`The inversion formula maps the outside term $a_\ell(R/r)^{\ell+1}$ onto $\frac Rr\times a_\ell(r'/R)^\ell$ with $r' = R^2/r$. So $V(2R) = \tfrac12V(R/2)$.`,
        ],
        parts: [
          { lbl: md`(a) $a_3$`, ans: -0.4375 },
          { lbl: md`(b) 3-term pole value`, ans: 0.8125 },
          { lbl: md`(c) error at the pole`, ans: 0.1875 },
          { lbl: md`(d) 3-term $V(R/2)/V_0$`, ans: 0.8203125 },
          { lbl: md`(e) exact $V(R/2)/V_0$`, ans: 0.829180 },
          { lbl: md`(e) error at $R/2$ (exact minus 3-term), units of $V_0$`, ans: 0.008867 },
          { lbl: md`(f) first dropped term at $R/2$`, ans: 0.010742 },
          { lbl: md`(g) exact $V(2R)/V_0$`, ans: 0.414590 },
        ],
        sol: md`
          **Region:** inside and outside. **Boundary conditions:** 1. finite at $0$; 2. zero at infinity; 3. $V(R,\theta) = V_0$ for $\theta \lt \pi/2$, $0$ for $\theta \gt \pi/2$.

          (a) $\int_0^1P_3 = \frac{P_2(0) - P_4(0)}{7} = \frac{-\frac12 - \frac38}{7} = -\frac18$, so $a_3 = \frac72\left(-\frac18\right) = -\frac7{16}$. With $a_0 = \tfrac12$, $a_1 = \tfrac34$, $a_5 = \tfrac{11}{32}$.

          (b) At the pole every $P_\ell = 1$: $\tfrac12 + \tfrac34 - \tfrac7{16} = \tfrac{13}{16} = 0.8125$.

          (c) Exact is $1$: error $0.1875$, about $19\%$. The next term alone is $0.34$, larger than the error: on the surface the terms barely shrink, and the alternating tail nearly cancels. A "next term" estimate is useless there.

          [[fig:ps]]

          (d) $\tfrac12 + \tfrac34\cdot\tfrac12 - \tfrac7{16}\cdot\tfrac18 = 0.8203$.

          (e) $z = R/2$: $\tfrac12\cdot3\cdot\left[1 - \tfrac{1/2}{\sqrt{5/4}}\right] = \tfrac32\left(1 - \tfrac1{\sqrt5}\right) = 0.8292$. Error $0.0089$, about $1\%$.

          (f) $a_5(1/2)^5 = \tfrac{11}{1024} = 0.0107$: the right size. Inside, the factor $(r/R)^\ell$ makes the series converge geometrically, so the first dropped term is a good estimate.

          (g) $V(2R) = \tfrac12V(R/2) = 0.4146$ (3-term: $0.4102$).

          **What to remember:** truncation error is worst on the boundary at a jump; a factor $(r/R)$ or $(R/r)$ makes everything converge fast. The exterior and interior series of the same shell are related by $r \to R^2/r$.
        `,
        figs: { ps: { svg: F.hemiPlot, cap: md`On the surface: the step (dashed) and the 3-term sum (solid). The sum overshoots at mid-latitudes (about $1.11$ near $49^\circ$, $-0.11$ near $131^\circ$), passes through $\tfrac12$ at the equator, and falls short at the poles.` } },
      }),

      P({
        title: 'A ring above the center, off axis',
        q: md`A ring of radius $4c$ carrying charge $Q$ is centered on the $z$ axis at height $z = 3c$. Let $k = 1/4\pi\varepsilon_0$. Find, in units of $kQ/c$ (or $kQ/c^2$ for fields): (a) $V$ at the origin; (b) $E_z$ at the origin; (c) $V$ at $P$ ($r = 2c$, $\theta = 60^\circ$) through $\ell = 3$; (d) the force on a charge $q$ at the origin, in units of $kQq/c^2$. (e) Why is the $\ell = 2$ term so small?`,
        figHtml: F.p17,
        hints: [
          md`Every ring point is $D = 5c$ from the origin, at polar angle $\alpha$ with $\cos\alpha = \tfrac35$. On the axis, $V(z) = \dfrac{kQ}{\sqrt{16c^2 + (z - 3c)^2}}$.`,
          md`For $r \lt D$: $V = kQ\sum\dfrac{r^\ell}{D^{\ell+1}}P_\ell(\cos\alpha)P_\ell(\cos\theta)$. (On the axis this is the $1/\lvert\mathbf r - \mathbf r'\rvert$ expansion with $\gamma = \alpha$.)`,
          md`$P_1(\tfrac35) = 0.6$, $P_2(\tfrac35) = 0.04$, $P_3(\tfrac35) = -0.36$. At $\theta = 60^\circ$: $P_1 = 0.5$, $P_2 = -0.125$, $P_3 = -0.4375$.`,
        ],
        parts: [
          { lbl: md`(a) $V(0)$`, ans: 0.2 },
          { lbl: md`(b) $E_z(0)$`, ans: -0.024 },
          { lbl: md`(c) $V(P)$ through $\ell = 3$`, ans: 0.225856 },
          { lbl: md`(d) $F_z$ on $q$`, ans: -0.024 },
          { lbl: md`(e) The $\ell = 2$ term is small because`, mc: [md`the ring is far away`, md`$P_2(\cos\theta)$ is small at $60^\circ$`, md`the ring is symmetric about the $xy$ plane`, md`the ring sits near the $P_2$ node: $\alpha = 53.1^\circ$, close to $54.7^\circ$`], a: 3,
            why: [md`$\ell = 3$ is even further suppressed by distance, yet it is more than ten times larger here.`, md`$P_2(\cos60^\circ) = -0.125$ is not small compared with $P_1 = 0.5$ or $P_3 = -0.44$.`, md`It isn't: it sits above the plane, which is why odd $\ell$ appear.`, null] },
        ],
        sol: md`
          **Region:** $r \lt D = 5c$ (charge-free, contains the origin). **Boundary conditions:**
          1. Finite at $0$: only $A_\ell r^\ell$.
          2. On the $+z$ axis, $V$ equals the direct ring result: fixes every $A_\ell$.

          **Axis trick in one line:** on the axis each ring element is at distance $\lvert\mathbf r - \mathbf r'\rvert$ with $r' = D$ and angle $\gamma = \alpha$ between $\hat{\mathbf z}$ and $\mathbf r'$, so

          $$V(z) = kQ\sum_\ell\frac{z^\ell}{D^{\ell+1}}P_\ell(\cos\alpha) \;\Rightarrow\; V(r,\theta) = kQ\sum_\ell\frac{r^\ell}{D^{\ell+1}}P_\ell(\cos\alpha)P_\ell(\cos\theta)$$

          $\cos\alpha = \tfrac35$: $P_0 = 1$, $P_1 = 0.6$, $P_2 = 0.04$, $P_3 = -0.36$.

          (a) $\frac{kQ}{5c} = 0.2$.

          (b) $E_z = -A_1 = -kQ\frac{0.6}{25c^2} = -0.024$: down, away from the ring above.

          (c) Terms at $r = 2c$, $\theta = 60^\circ$: $0.2 + 0.024 - 0.00016 + 0.002016 = 0.22586$. (Numerical integration of the exact ring potential gives $0.22650$; the $\ell = 4$ term, $+0.0006$, accounts for nearly all of the difference.)

          (d) $F_z = qE_z = -0.024\,kQq/c^2$.

          (e) $P_2(\cos\alpha) = \tfrac12(3\cdot0.36 - 1) = 0.04$. The $\ell = 2$ coefficient carries the ring's own $P_2(\cos\alpha)$, which vanishes at $\alpha = 54.7^\circ$. This ring is at $53.1^\circ$.

          **What to remember:** for a source off the origin, every coefficient carries a Legendre factor evaluated at the **source's** angle, and that factor can be nearly zero.
        `,
      }),

      P({
        title: 'Energy bookkeeping for a dipole shell',
        q: md`A thin shell of radius $R$ carries fixed $\sigma_0\cos\theta$. Find (a) its self-energy $W$ from $\tfrac12\int\sigma V\,da$; (b) the fraction of $W$ stored inside the shell; (c) the interaction energy when it sits in an external field $E_0\hat{\mathbf z}$; (d) the work needed to rotate it by $180^\circ$ in that field. (e) Is the aligned orientation stable?`,
        figHtml: F.shellCos,
        hints: [
          md`On the shell $V = \frac{\sigma_0R}{3\varepsilon_0}\cos\theta$. Then $W = \tfrac12\int\sigma_0\cos\theta\,V\,2\pi R^2\sin\theta\,d\theta$.`,
          md`Inside, $E = \frac{\sigma_0}{3\varepsilon_0}$ uniform; $W_{\text{in}} = \frac{\varepsilon_0}{2}E^2\cdot\tfrac43\pi R^3$.`,
          md`$p = \tfrac43\pi R^3\sigma_0$; $U = -\mathbf p\cdot\mathbf E_0$. Or compute $\int\sigma V_{\text{ext}}\,da$ directly.`,
        ],
        parts: [
          { lbl: md`(a) $W$`, expr: '2*pi*sigma0^2*R^3/(9*eps0)', vars: { sigma0: [1, 3], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`(b) $W_{\text{in}}/W$`, ans: 0.333333 },
          { lbl: md`(c) $U$ (aligned, $\sigma_0 \gt 0$)`, expr: '-4*pi*R^3*sigma0*E0/3', vars: { R: [1, 2], sigma0: [1, 3], E0: [1, 3] } },
          { lbl: md`(d) work to flip by $180^\circ$`, expr: '8*pi*R^3*sigma0*E0/3', vars: { R: [1, 2], sigma0: [1, 3], E0: [1, 3] } },
          { lbl: md`(e) Stability of the aligned orientation`, mc: [md`unstable: the torque grows if it tips`, md`neutral: no torque at any angle`, md`stable: tipping raises $U = -pE_0\cos\phi$`, md`it depends on $W$`], a: 2,
            why: [md`That is the anti-aligned case ($\phi = \pi$), a maximum of $U$.`, md`The torque is $pE_0\sin\phi$, zero only at $\phi = 0, \pi$.`, null, md`The self-energy doesn't change on rotation (the charge is fixed to the shell).`] },
        ],
        sol: md`
          **Shell potential** (from the four conditions of Ex. 3.9: finite at $0$, zero at infinity, continuity, jump $-\sigma_0\cos\theta/\varepsilon_0$): $V_{\text{in}} = \frac{\sigma_0}{3\varepsilon_0}r\cos\theta$, $V_{\text{out}} = \frac{\sigma_0R^3}{3\varepsilon_0r^2}\cos\theta$.

          (a) $W = \tfrac12\int_0^\pi\sigma_0\cos\theta\cdot\frac{\sigma_0R}{3\varepsilon_0}\cos\theta\cdot2\pi R^2\sin\theta\,d\theta = \frac{\pi\sigma_0^2R^3}{3\varepsilon_0}\cdot\frac23 = \frac{2\pi\sigma_0^2R^3}{9\varepsilon_0}$.

          (b) $W_{\text{in}} = \frac{\varepsilon_0}{2}\frac{\sigma_0^2}{9\varepsilon_0^2}\frac{4\pi R^3}{3} = \frac{2\pi\sigma_0^2R^3}{27\varepsilon_0} = \tfrac13W$. The outside dipole field holds the other $\tfrac23$ (checked by integrating $\frac{\varepsilon_0}{2}E^2$ over $r \gt R$).

          (c) $U = \int\sigma V_{\text{ext}}\,da = \int\sigma_0\cos\theta(-E_0R\cos\theta)2\pi R^2\sin\theta\,d\theta = -\tfrac43\pi R^3\sigma_0E_0 = -pE_0$.

          (d) $U(\pi) - U(0) = 2pE_0 = \tfrac83\pi R^3\sigma_0E_0$.

          (e) Stable: $U = -pE_0\cos\phi$ is a minimum at $\phi = 0$.

          **What to remember:** two different energies: the self-energy (fixed by the charge pattern) and the interaction energy $-\mathbf p\cdot\mathbf E_0$ (which only the $\ell = 1$ part feels).
        `,
      }),

      R(md`
        !!key Patterns to remember
          - Always: region, numbered conditions, which family dies, then expand the data in $P_\ell$.
          - Concentric spheres never mix $\ell$: one 2×2 system per driven $\ell$.
          - Charges: $Q = 4\pi\varepsilon_0B_0$ outside any sphere. Forces in a uniform field: $Q\mathbf E_0$. Interaction energy: $QV_{\text{ext}}(0) - \mathbf p\cdot\mathbf E_0$.
          - Sum the axis series and you often get a closed form (an image, a geometric series).
          - Truncation is worst on the boundary at a jump; inside or outside, each term is suppressed by a power of $r/R$.
      `),
    ],
  };

  COURSE.units.find((u) => u.id === 'uD').lessons.push(LA, LB);
})();

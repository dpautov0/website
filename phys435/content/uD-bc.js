/* Unit D — Drill ladders: boundary conditions in 2-D and 3-D, Laplace's equation, electrostatic energy.
   Griffiths 2.3.5, 2.4, 2.5, 3.1–3.3. Pushes four lessons into the existing unit uD (registered by uD-0.js).
   Every final answer was checked with sympy: p435/verify/uD_bc_problems.py and p435/verify/uD_bc_energy.py. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const UNIT = COURSE.units.find((u) => u.id === 'uD');

  // =====================================================================================
  // Drawing helpers
  // =====================================================================================
  const D2R = Math.PI / 180;
  const fig = (o) => PF.fig(o);
  const pol = (cx, cy, r, a) => [cx + r * Math.cos(a * D2R), cy - r * Math.sin(a * D2R)];
  const r1 = (v) => Math.round(v * 10) / 10;
  const dpath = (pts) => `M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z`;
  // translucent tint for charged insulating matter (never hatched: hatching means metal)
  const tint = (f, pts, op = 0.16) => { pts.forEach((p) => f.track(p[0], p[1])); f.add(`<path class="nodecl" style="fill:var(--dim);fill-opacity:${op};stroke:none" d="${dpath(pts)}"/>`); return f; };
  const plus = (f, x, y, s = 3) => { f.track(x - s, y - s, x + s, y + s); return f.add(`<path class="glyph" d="M${r1(x - s)},${r1(y)}H${r1(x + s)}M${r1(x)},${r1(y - s)}V${r1(y + s)}"/>`); };
  const minus = (f, x, y, s = 3) => { f.track(x - s, y - s, x + s, y + s); return f.add(`<path class="glyph" d="M${r1(x - s)},${r1(y)}H${r1(x + s)}"/>`); };
  const SIDE = (ang) => ['r', 'tr', 't', 'tl', 'l', 'bl', 'b', 'br'][Math.round((((ang % 360) + 360) % 360) / 45) % 8];
  const rim = (f, cx, cy, r, ang, t, gap = 8, cls = '') => { const [x, y] = pol(cx, cy, r, ang); return f.tag(x, y, t, SIDE(ang), gap, cls); };
  const gnd = (f, x, y, lab) => { f.line(x, y, x, y + 14); f.ground(x, y + 14); if (lab) f.label(x + 16, y + 20, lab, 'l', 'small'); return f; };
  const battery = (f, x, y, lab) => {
    f.line(x, y, x, y + 12); f.line(x - 11, y + 12, x + 11, y + 12); f.line(x - 6, y + 18, x + 6, y + 18, { cls: 'thick' });
    f.line(x, y + 18, x, y + 28); f.ground(x, y + 28);
    if (lab) f.label(x + 16, y + 15, lab, 'l', 'small');
    return f;
  };

  // Concentric circles: spheres (cross-section) or cylinders (end view).
  // layers: { k: 'mball' metal ball | 'shell' thin metal shell | 'thick' metal shell r..r2 | 'sig' charged insulating surface |
  //           'ball' charged insulating ball | 'line' plain circle | 'dash' dashed circle, r, r2, lab, at, gap, glyph: 'cos'|'plus' }
  // rad: [[r, ang, 'lab', frac, side]] radius arrows; E: 'up'|'right' uniform field arrows; gnd / bat on the outermost layer;
  // q: [[dx, dy, '+'|'-'|'', lab, at]]; reg: [[dx, dy, tex]]; extra(f, cx, cy)
  function sph(o = {}) {
    const f = fig();
    const cx = 160, cy = 130;
    const Ls = o.layers || [];
    const M = Math.max(...Ls.map((L) => L.r2 || (L.k === 'shell' ? L.r + 6 : L.r)));
    for (const L of Ls) {
      if (L.k === 'mball') { f.hatchBand(f.arcPts(cx, cy, L.r, L.r, 0, 360)); f.circle(cx, cy, L.r, { cls: 'thick' }); }
      else if (L.k === 'shell' || L.k === 'thick') {
        const ro = L.r2 || L.r + 6;
        f.hatchBand(f.arcPts(cx, cy, ro, ro, 0, 360).concat(f.arcPts(cx, cy, L.r, L.r, 360, 0)));
        f.circle(cx, cy, L.r, { cls: 'thick' }); f.circle(cx, cy, ro, { cls: 'thick' });
      } else if (L.k === 'ball') { tint(f, f.arcPts(cx, cy, L.r, L.r, 0, 360)); f.circle(cx, cy, L.r); }
      else if (L.k === 'sig') f.circle(cx, cy, L.r, { cls: 'thick' });
      else if (L.k === 'dash') f.circle(cx, cy, L.r, { cls: 'dash dim' });
      else f.circle(cx, cy, L.r);
      if (L.glyph) {
        const n = L.r > 40 ? 5 : 3;
        for (let i = 0; i < n; i++) {
          const ang = 25 + (130 / (n - 1)) * i;
          const [px, py] = pol(cx, cy, L.r - 7, ang); plus(f, px, py);
          const [mx, my] = pol(cx, cy, L.r - 7, -ang);
          if (L.glyph === 'cos') minus(f, mx, my); else plus(f, mx, my);
        }
      }
      if (L.lab) rim(f, cx, cy, L.r2 || (L.k === 'shell' ? L.r + 6 : L.r), L.at ?? 45, L.lab, L.gap ?? 8);
    }
    for (const [rr, ang, lab, frac, side] of (o.rad || [])) {
      const [x2, y2] = pol(cx, cy, rr, ang);
      f.line(cx, cy, x2, y2, { cls: 'dim thin', arrow: 'end', hs: 5 });
      const [lx, ly] = pol(cx, cy, rr * (frac ?? 0.55), ang);
      f.tag(lx, ly, lab, side || SIDE(ang + 90), 7, 'small');
    }
    if (o.rad && o.rad.length && o.dot !== false) f.dot(cx, cy, 2);
    if (o.E === 'up') {
      const xs = [cx - M - 34, cx + M + 34];
      xs.forEach((x) => f.arrow(x, cy + M * 0.75, x, cy - M * 0.75, { cls: 'dim' }));
      f.label(xs[1] + 8, cy - M * 0.75 + 8, o.Elab || md`\vb E_0`, 'l');
    } else if (o.E === 'right') {
      const ys = [cy - M - 26, cy + M + 26];
      ys.forEach((y) => f.arrow(cx - M * 0.8, y, cx + M * 0.8, y, { cls: 'dim' }));
      f.label(cx + M * 0.8 + 8, ys[0], o.Elab || md`\vb E_0`, 'l');
    }
    if (o.gnd) gnd(f, cx, cy + M, o.gndLab);
    if (o.bat) battery(f, cx, cy + M, o.bat);
    for (const [dx, dy, qs, lab, at] of (o.q || [])) f.charge(cx + dx, cy + dy, { q: qs, lab, at: at || 'r' });
    for (const [dx, dy, t] of (o.reg || [])) f.label(cx + dx, cy + dy, t, 'c', 'small accent');
    if (o.extra) o.extra(f, cx, cy);
    return f.svg();
  }

  // Parallel plates seen edge-on (1-D problems): walls at x = 0 and x = d; slab: [f0, f1] tinted fraction of the gap
  function plates(o = {}) {
    const f = fig();
    const xL = 80, xR = 260, yT = 30, yB = 160, W = xR - xL;
    if (o.slab) tint(f, [[xL + W * o.slab[0], yT], [xL + W * o.slab[1], yT], [xL + W * o.slab[1], yB], [xL + W * o.slab[0], yB]]);
    if (o.slab && o.slabLab) f.label(xL + W * (o.slab[0] + o.slab[1]) / 2, yT + 40, o.slabLab, 'c');
    if (o.left !== false) f.wall(xL, yT, yB, { side: 'left' });
    if (o.right !== false) f.wall(xR, yT, yB, { side: 'right' });
    if (o.L) f.label(xL - 16, yT + 16, o.L, 'r');
    if (o.R) f.label(xR + 16, yT + 16, o.R, 'l');
    const ya = yB + 26;
    f.arrow(xL - 34, ya, xR + 44, ya, { cls: 'dim', hs: 6 }); f.label(xR + 48, ya, 'x', 'l', 'small accent');
    const ticks = o.ticks || [[0, '0'], [1, 'd']];
    for (const [t, s] of ticks) { const X = xL + W * t; f.line(X, ya - 4, X, ya + 4, { cls: 'dim' }); f.label(X, ya + 7, s, 't', 'small'); }
    if (o.extra) o.extra(f, { xL, xR, yT, yB, W });
    return f.svg();
  }

  // Rectangle (2-D region or pipe cross-section). sides: { top, bot, left, right } each { lab, k: 'metal'|'ins' }
  function rect2(o = {}) {
    const f = fig();
    const x0 = 80, y0 = 40, Wd = o.w || 180, H = o.h || 110, g = 5;
    const S = o.sides || {};
    const side = (nm, draw) => { const s = S[nm] || { k: 'metal' }; draw(s); };
    side('top', (s) => { if (s.k === 'ins') f.line(x0, y0, x0 + Wd, y0, { cls: 'thick' }); else f.plane(x0 + g, x0 + Wd - g, y0, { side: 'above' }); if (s.lab) f.label(x0 + Wd / 2, y0 - (s.k === 'ins' ? 8 : 16), s.lab, 'b'); });
    side('bot', (s) => { if (s.k === 'ins') f.line(x0, y0 + H, x0 + Wd, y0 + H, { cls: 'thick' }); else f.plane(x0 + g, x0 + Wd - g, y0 + H, { side: 'below' }); if (s.lab) f.label(x0 + Wd / 2, y0 + H + (s.k === 'ins' ? 8 : 16), s.lab, 't'); });
    side('left', (s) => { if (s.k === 'ins') f.line(x0, y0, x0, y0 + H, { cls: 'thick' }); else f.wall(x0, y0 + g, y0 + H - g, { side: 'left' }); if (s.lab) f.label(x0 - (s.k === 'ins' ? 8 : 16), y0 + H / 2, s.lab, 'r'); });
    side('right', (s) => { if (s.k === 'ins') f.line(x0 + Wd, y0, x0 + Wd, y0 + H, { cls: 'thick' }); else f.wall(x0 + Wd, y0 + g, y0 + H - g, { side: 'right' }); if (s.lab) f.label(x0 + Wd + (s.k === 'ins' ? 8 : 16), y0 + H / 2, s.lab, 'l'); });
    if (o.corner !== false) { f.label(x0 - 6, y0 + H + 6, '(0,0)', 'tr', 'small accent'); f.label(x0 + Wd + 6, y0 - 6, o.c1 || '(b,a)', 'bl', 'small accent'); }
    if (o.extra) o.extra(f, { x0, y0, Wd, H });
    return f.svg();
  }

  // Grounded plane (z = 0) with things above it. q: [[x, y, '+'|'-', lab, at]] in screen px; line: true draws charges as line charges (end view)
  function planeFig(o = {}) {
    const f = fig();
    const y0 = 150;
    f.plane(20, 300, y0, { lab: o.lab || 'V=0' });
    for (const [x, y, qs, lab, at] of (o.q || [])) f.charge(x, y, { q: qs, lab, at: at || 'r' });
    for (const d of (o.dims || [])) f.dim(...d.slice(0, 5), d[5] || {});
    if (o.extra) o.extra(f);
    return f.svg();
  }

  // Parallel-plate capacitor (side view). o: top, bot (labels), x (gap label), bat (battery label) or iso (isolated)
  function cap(o = {}) {
    const f = fig();
    const xa = 70, xb = 250, yT = 60, yB = 140;
    f.plane(xa, xb, yT, { side: 'above', t: 7 });
    f.plane(xa, xb, yB, { side: 'below', t: 7 });
    if (o.top) f.label(xa - 10, yT - 4, o.top, 'r');
    if (o.bot) f.label(xa - 10, yB + 4, o.bot, 'r');
    f.dim(xa + 40, yT, xa + 40, yB, o.x || 'x', { at: 'r' });
    if (o.area) f.label((xa + xb) / 2 + 30, yT - 18, o.area, 'b', 'small');
    if (o.bat) {
      const xw = xb + 30;
      f.line(xb, yT - 4, xw, yT - 4); f.line(xw, yT - 4, xw, 88);
      f.line(xw - 11, 88, xw + 11, 88); f.line(xw - 6, 94, xw + 6, 94, { cls: 'thick' });
      f.line(xw, 94, xw, yB + 4); f.line(xw, yB + 4, xb, yB + 4);
      f.label(xw + 16, 91, o.bat, 'l', 'small');
    }
    if (o.F) f.arrow((xa + xb) / 2 + 40, yT - 12, (xa + xb) / 2 + 40, yT - 40, { cls: 'dim' });
    if (o.extra) o.extra(f);
    return f.svg();
  }

  // Point charges (generic). q: [[x, y, '+'|'-', lab, at]]; dims: [[x1, y1, x2, y2, lab, {off, at}]]; lines: [[x1, y1, x2, y2]] dashed guides
  function charges(o = {}) {
    const f = fig();
    for (const l of (o.lines || [])) f.line(l[0], l[1], l[2], l[3], { cls: 'dash dim' });
    for (const d of (o.dims || [])) f.dim(d[0], d[1], d[2], d[3], d[4], d[5] || {});
    for (const [x, y, qs, lab, at] of (o.q || [])) f.charge(x, y, { q: qs, lab, at: at || 'r' });
    if (o.extra) o.extra(f);
    return f.svg();
  }

  // =====================================================================================
  // Lesson 1 figures
  // =====================================================================================
  const nArrow = (ang, lab = md`\hat{\mathbf n}`, r0 = 50, len = 30) => (f, cx, cy) => {
    const [x1, y1] = pol(cx, cy, r0, ang), [x2, y2] = pol(cx, cy, r0 + len, ang);
    f.arrow(x1, y1, x2, y2); f.tag(x2, y2, lab, SIDE(ang), 6);
  };
  const fQ1 = sph({ layers: [{ k: 'mball', r: 50, lab: 'R', at: 135 }], gnd: true, gndLab: 'V=0', extra: (f, cx, cy) => { nArrow(30)(f, cx, cy); f.label(cx + 100, cy - 70, md`V(r,\theta)\ \text{here}`, 'l', 'small'); } });
  const fQ2 = sph({
    layers: [{ k: 'thick', r: 50, r2: 95 }], q: [[18, -12, '+', 'q', 'r']],
    extra: (f, cx, cy) => { f.dim(cx, cy + 25, cx + 50, cy + 25, 'a', { at: 't' }); f.dot(cx, cy + 25, 2); f.label(cx + 110, cy - 90, 'metal', 'l', 'small accent'); },
  });
  const fShellSig = (lab = md`\sigma(\theta)`, at = 40) => sph({ layers: [{ k: 'sig', r: 55, lab, at }], rad: [[55, 210, 'R', 0.5, 't']], reg: [[-18, -22, '\\text{in}'], [92, -62, '\\text{out}']] });
  const fQ3 = fShellSig();
  const fQ4 = sph({ layers: [{ k: 'mball', r: 45, lab: 'Q', at: 120 }], q: [[120, 0, '+', 'q', 't']], extra: (f, cx, cy) => { f.dim(cx, cy + 62, cx + 120, cy + 62, 'd', { at: 'b' }); f.line(cx, cy + 47, cx, cy + 66, { cls: 'dim thin' }); f.line(cx + 120, cy + 9, cx + 120, cy + 66, { cls: 'dim thin' }); f.label(cx - 60, cy - 50, 'isolated', 'r', 'small accent'); } });
  const fQ5 = sph({ layers: [{ k: 'sig', r: 60, lab: md`V_0(\theta)`, at: 45 }], rad: [[60, 200, 'R', 0.55, 't']], reg: [[10, -25, '\\text{region}']] });
  const fGrE = (lab = 'V=0') => sph({ layers: [{ k: 'mball', r: 45, lab: 'R', at: 135 }], E: 'up', gnd: true, gndLab: lab });
  const fQ6 = fGrE();
  const fQ7 = sph({ layers: [{ k: 'line', r: 40, lab: md`\lambda\ \text{per length}`, at: 45 }], extra: (f, cx, cy) => { f.dot(cx, cy, 2); f.label(cx, cy + 8, md`\text{axis}`, 't', 'small accent'); f.label(cx + 70, cy + 80, md`s\to\infty`, 'l', 'small'); } });
  const fNested = (labA = md`\sigma(\theta)`, labB = 'V=0', o = {}) => sph(Object.assign({ layers: [{ k: 'sig', r: 42, lab: labA, at: 90, gap: 6 }, { k: 'shell', r: 95, lab: labB, at: 35 }], rad: [[42, 200, 'a', 0.5, 't'], [95, 330, 'b', 0.72, 'tr']], gnd: true }, o));
  const fQ8 = fNested();
  const fQ9 = rect2({ sides: { top: { lab: 'V=0' }, bot: { lab: 'V=0' }, left: { lab: md`V_0(y)` }, right: { lab: 'V=0' } } });
  const fQ10 = fGrE();
  const fQ11 = sph({ layers: [{ k: 'mball', r: 45, lab: md`Q=0`, at: 135 }], E: 'up', extra: (f, cx, cy) => f.label(cx, cy + 62, 'isolated', 't', 'small accent') });
  const fQ12 = sph({ layers: [{ k: 'mball', r: 45, lab: 'Q', at: 135 }], E: 'up', extra: (f, cx, cy) => f.label(cx, cy + 62, 'isolated', 't', 'small accent') });
  const fQ13 = rect2({ sides: { top: { k: 'ins', lab: '\\text{insulated edge}' }, bot: { k: 'ins', lab: '\\text{insulated edge}' }, left: { lab: 'V=0' }, right: { lab: 'V_0' } }, c1: '(L,w)', extra: (f, b) => f.label(b.x0 + b.Wd / 2, b.y0 + b.H / 2, '\\text{resistive sheet}', 'c', 'small accent') });
  const fQ14 = charges({ q: [[90, 90, '+', 'q', 'l'], [230, 90, '+', 'q', 'r']], lines: [[160, 20, 160, 170]], dims: [[90, 130, 160, 130, 'd', { at: 'b' }], [160, 130, 230, 130, 'd', { at: 'b' }]], extra: (f) => f.label(166, 26, '\\text{mirror plane}', 'l', 'small accent') });
  const fQ15 = (() => { const f = fig(); const pts = []; for (let i = 0; i <= 48; i++) { const t = i / 48 * 2 * Math.PI; const rr = 70 + 12 * Math.cos(3 * t) + 6 * Math.sin(2 * t); pts.push([160 + rr * Math.cos(t), 120 - rr * 0.8 * Math.sin(t)]); } f.poly(pts, { cls: 'thick' }); for (const i of [0, 8, 16, 24, 32, 40]) { const [x, y] = pts[i]; const dx = x - 160, dy = y - 120, L = Math.hypot(dx, dy); f.arrow(x, y, x + dx / L * 20, y + dy / L * 20, { cls: 'dim' }); } f.label(160, 120, md`\nabla^2V=0`, 'c'); f.label(260, 30, md`\partial V/\partial n\ \text{given}`, 'l', 'small'); return f.svg(); })();
  const fQ16 = sph({ layers: [{ k: 'mball', r: 40, lab: md`\lambda`, at: 135 }], E: 'right', extra: (f, cx, cy) => f.label(cx + 70, cy + 4, md`s\to\infty`, 'l', 'small') });
  const fQ17 = fQ12;
  const fQ18 = sph({ layers: [{ k: 'sig', r: 55, lab: md`\sigma_0\cos\theta`, at: 40, glyph: 'cos' }], rad: [[55, 210, 'R', 0.5, 't']] });
  const fQ19 = sph({ layers: [{ k: 'mball', r: 45, lab: 'Q=0', at: 135 }], q: [[125, 0, '+', 'q', 't']], extra: (f, cx, cy) => { f.dim(cx, cy + 62, cx + 125, cy + 62, 'a', { at: 'b' }); f.line(cx, cy + 47, cx, cy + 66, { cls: 'dim thin' }); f.line(cx + 125, cy + 9, cx + 125, cy + 66, { cls: 'dim thin' }); } });
  const fQ20 = sph({ layers: [{ k: 'sig', r: 60, lab: md`V_0(\phi)`, at: 40 }], rad: [[60, 200, 'a', 0.55, 't']], extra: (f, cx, cy) => { f.dot(cx, cy, 2); f.label(cx + 6, cy + 18, md`\text{axis}`, 'tl', 'small accent'); } });
  const fQ21 = rect2({ w: 130, h: 130, sides: { top: { lab: md`V_0(1+x^2/a^2)` }, bot: { lab: md`V_0x^2/a^2` }, left: { lab: md`V_0y^2/a^2` }, right: { lab: md`V_0(1+y^2/a^2)` } }, c1: '(a,a)' });
  const fQ22 = rect2({ sides: { top: { lab: 'V_0' }, bot: { lab: 'V=0' }, left: { lab: 'V=0' }, right: { lab: 'V=0' } }, extra: (f, b) => { f.dot(b.x0 + 60, b.y0 + 50, 3); f.tag(b.x0 + 60, b.y0 + 50, md`V=1.3V_0\,?`, 'r', 7, 'small'); } });
  const fQ23 = sph({ layers: [{ k: 'dash', r: 60, lab: md`\text{sphere } S`, at: 40 }], q: [[-20, 10, '+', '', 'r'], [18, -24, '+', '', 'r'], [10, 28, '-', '', 'r'], [125, 40, '+', md`\text{outside}`, 'b']], extra: (f, cx, cy) => f.label(cx - 70, cy + 70, md`Q_{\rm enc}`, 'r', 'small') });
  const fQ24 = sph({ layers: [{ k: 'mball', r: 40, lab: 'Q', at: 90, gap: 6 }, { k: 'shell', r: 95, lab: 'V=0', at: 35 }], rad: [[95, 330, 'b', 0.72, 'tr']], gnd: true, extra: (f, cx, cy) => f.label(cx - 46, cy + 30, 'a', 'r', 'small') });
  const fQ25 = planeFig({ q: [[150, 70, '+', md`\lambda`, 'l']], dims: [[150, 70, 150, 150, 'd', { off: -40, at: 'r' }]], extra: (f) => f.text(290, 40, 'line charge (end view)', 'r') });
  const fQ26 = sph({ layers: [{ k: 'shell', r: 80, lab: 'V=0', at: 40 }], q: [[30, -10, '+', 'q', 't']], gnd: true, extra: (f, cx, cy) => { f.dot(cx, cy, 2); f.dim(cx, cy + 20, cx + 30, cy + 20, 'a', { at: 'b' }); } });
  const fQ27 = fNested(md`\sigma_0\cos\theta`);
  const fQ28 = fNested(md`\sigma_0(2+\cos\theta)`);
  const fQ29 = sph({ layers: [{ k: 'sig', r: 55, lab: md`\sigma_0\cos\phi`, at: 40, glyph: 'cos' }], rad: [[55, 210, 'a', 0.5, 't']], extra: (f, cx, cy) => { f.arrow(cx + 95, cy + 60, cx + 125, cy + 60, { cls: 'dim' }); f.label(cx + 129, cy + 60, 'x', 'l', 'small accent'); } });
  const fQ30 = sph({ layers: [{ k: 'mball', r: 35, lab: 'Q', at: 90, gap: 6 }, { k: 'thick', r: 70, r2: 98, lab: md`Q_{\rm shell}=0`, at: 40 }], rad: [[70, 205, 'b', 0.75, 't'], [98, 320, 'c', 1.0, 'br']], extra: (f, cx, cy) => f.label(cx - 45, cy - 6, 'a', 'r', 'small') });
  const fQ31 = plates({ slab: [0, 0.5], slabLab: md`\rho_0`, L: 'V=0', R: 'V=0', ticks: [[0, '0'], [0.5, 'd/2'], [1, 'd']] });
  const fQ32 = sph({ layers: [{ k: 'mball', r: 45, lab: 'V=0', at: 135 }], E: 'up', q: [[0, -95, '+', 'q', 'r']], gnd: true });
  const fQ33 = sph({ layers: [{ k: 'mball', r: 45, lab: 'R', at: 135 }], E: 'up', bat: 'V_0' });
  const fQ34 = (() => {
    const f = fig(); const cx = 160, cy = 130;
    f.hatchBand(f.arcPts(cx, cy, 90, 90, 0, 360).concat(f.arcPts(cx + 25, cy - 15, 32, 32, 360, 0)));
    f.circle(cx, cy, 90, { cls: 'thick' }); f.circle(cx + 25, cy - 15, 32, { cls: 'thick' });
    f.charge(cx + 38, cy - 22, { q: '+', lab: 'q', at: 'l' });
    f.label(cx + 100, cy - 70, md`Q_{\rm metal}=0`, 'l', 'small');
    return f.svg();
  })();
  const fQ35 = fNested(md`\sigma_a(\theta)`, md`Q_b=0`, { gnd: false });
  const fQ36 = sph({ layers: [{ k: 'mball', r: 40, lab: 'a', at: 135, gap: 6 }, { k: 'shell', r: 95, lab: 'b', at: 35 }], extra: (f, cx, cy) => { f.line(cx + 40, cy, cx + 95, cy, { cls: 'thick' }); f.label(cx + 67, cy + 6, '\\text{wire}', 't', 'small accent'); f.label(cx + 140, cy + 80, md`Q_{\rm tot}=Q`, 'l', 'small'); } });
  // Level 6
  const fQ37 = sph({ layers: [{ k: 'line', r: 55 }], extra: (f, cx, cy) => { f.line(cx - 70, cy, cx + 70, cy, { cls: 'dash dim' }); f.label(cx + 46, cy - 46, 'V_0', 'bl'); f.label(cx + 46, cy + 46, 'V=0', 'tl'); f.label(cx + 120, cy - 70, md`r\gg R`, 'l', 'small'); f.dim(cx, cy, cx - 55, cy, 'R', { at: 't' }); } });
  const fQ38 = sph({ layers: [{ k: 'mball', r: 25, lab: 'V_0', at: 90, gap: 6 }, { k: 'shell', r: 95, lab: 'V=0', at: 35 }], rad: [[95, 330, md`b\to\infty`, 0.45, 'tr']], gnd: true, extra: (f, cx, cy) => f.label(cx - 30, cy + 22, 'a', 'r', 'small') });
  const fQ39 = sph({ layers: [{ k: 'line', r: 60, lab: md`\partial V/\partial r = c`, at: 40 }], reg: [[0, 0, '\\rho=0']] });
  const fQ40 = fQ15;
  const fQ41 = sph({ layers: [{ k: 'sig', r: 60, lab: md`V_0\cos\theta`, at: 40 }], reg: [[0, -25, '\\text{empty}']], extra: (f, cx, cy) => { f.dot(cx, cy, 2.4); f.tag(cx, cy, 'O', 'b', 6, 'small'); } });
  const fQ42 = sph({ layers: [{ k: 'shell', r: 55, lab: 'V=0', at: 135 }], E: 'up', q: [[0, 0, '+', 'q', 'b']], gnd: true });
  const fQ43 = sph({ layers: [{ k: 'mball', r: 45, lab: 'V=0', at: 225 }], q: [[0, -115, '+', 'q', 'r']], gnd: true, extra: (f, cx, cy) => f.dim(cx - 30, cy, cx - 30, cy - 115, 'a', { at: 'l' }) });
  const fQ44 = sph({ layers: [{ k: 'shell', r: 70, lab: 'V=0', at: 40 }], q: [[0, 0, '+', 'q', 'b']], gnd: true, extra: (f, cx, cy) => { f.arrow(cx + 12, cy - 18, cx + 34, cy - 18, { cls: 'dim' }); f.label(cx + 38, cy - 18, md`\delta`, 'l', 'small'); } });
  const fQ45 = sph({ layers: [{ k: 'mball', r: 40, lab: md`\lambda,\ V=0`, at: 135 }], E: 'right' });
  const fQ46 = sph({ layers: [{ k: 'mball', r: 40, lab: 'Q', at: 90, gap: 6 }, { k: 'shell', r: 95, lab: 'V_0', at: 35 }], bat: 'V_0', extra: (f, cx, cy) => f.label(cx, cy + 62, '\\text{isolated}', 'c', 'small accent') });

  // =====================================================================================
  // Lesson 1: boundary conditions, conceptual ladder
  // =====================================================================================
  const L1 = {
    id: 'uD-bc-concepts', title: 'Boundary conditions in 2-D and 3-D: the conceptual ladder',
    steps: [
      R(md`
        ### Level 1: recognize

        The two matching conditions you used for flat sheets hold at **any** charged surface. Let $\hat{\mathbf n}$ point from side 1 to side 2:

        $$V_2 = V_1,\qquad \frac{\partial V_2}{\partial n}-\frac{\partial V_1}{\partial n} = -\frac{\sigma}{\varepsilon_0}.$$

        - Sphere of radius $R$: $\hat{\mathbf n} = \hat{\mathbf r}$, so $\dfrac{\partial V_{\rm out}}{\partial r}-\dfrac{\partial V_{\rm in}}{\partial r} = -\dfrac{\sigma(\theta)}{\varepsilon_0}$ at $r = R$. Cylinder: the same with $s$.
        - The new feature: $\sigma$ and $V$ depend on the angle, so both conditions hold at **every** $\theta$ (or $\phi$). That is why you can match them term by term in $P_\ell(\cos\theta)$ or $\cos n\phi$.
        - Conductor: side 1 is metal ($V$ constant, no field), so $\sigma = -\varepsilon_0\,\partial V/\partial n$ with $\hat{\mathbf n}$ pointing **out of the metal into the field region**.
      `),
      Q(md`You have found $V(r,\theta)$ outside the grounded metal sphere. Which expression gives its surface charge?`,
        [md`$\sigma = +\varepsilon_0\,\dfrac{\partial V}{\partial r}\Big|_{r=R}$`, md`$\sigma = -\dfrac{\varepsilon_0\,V(R,\theta)}{R}$`, md`$\sigma = -\varepsilon_0\,\dfrac{\partial V}{\partial r}\Big|_{r=R}$`, md`$\sigma = -\dfrac{\varepsilon_0}{R}\,\dfrac{\partial V}{\partial \theta}\Big|_{r=R}$`], 2,
        [md`Sign flipped. Just outside a conductor $E_r = \sigma/\varepsilon_0$, and $E_r = -\partial V/\partial r$.`, md`On a grounded sphere $V(R,\theta) = 0$, so this always gives zero. The charge comes from the normal derivative, not from the value.`, null, md`That is the tangential field, and it is zero on a conductor because $V$ is constant along the surface.`],
        md`Just outside a conductor $\vb E = (\sigma/\varepsilon_0)\hat{\mathbf n}$. Here $\hat{\mathbf n} = \hat{\mathbf r}$, so $\sigma = \varepsilon_0E_r = -\varepsilon_0\,\partial V/\partial r$ at $r = R$. Sanity check: for a positively charged region near the surface, $V$ falls as you move away, $\partial V/\partial r < 0$, and $\sigma > 0$.`,
        { figHtml: fQ1 }),
      Q(md`A metal block has a spherical cavity of radius $a$ with a charge $q$ inside (off center). You know $V$ inside the cavity. What is the surface charge on the cavity wall?`,
        [md`$\sigma = +\varepsilon_0\,\dfrac{\partial V}{\partial r}\Big|_{r=a}$`, md`$\sigma = -\varepsilon_0\,\dfrac{\partial V}{\partial r}\Big|_{r=a}$`, md`$\sigma = -\dfrac{q}{4\pi a^2}$ everywhere on the wall`, md`$\sigma = \varepsilon_0\,\dfrac{\partial V}{\partial r}$ evaluated just inside the metal`], 0,
        [null, md`This uses $\hat{\mathbf n} = \hat{\mathbf r}$, but the normal must point out of the metal into the field region, which here is $-\hat{\mathbf r}$.`, md`The total is $-q$, but it is uniform only when $q$ sits at the center. Off center the charge crowds near $q$.`, md`Inside the metal $V$ is constant, so this is zero. The derivative is taken on the field side.`],
        md`The field region is the cavity, so $\hat{\mathbf n}$ (out of the metal, into the field) is $-\hat{\mathbf r}$. Then $\sigma = -\varepsilon_0\,\partial V/\partial n = -\varepsilon_0(-\partial V/\partial r) = +\varepsilon_0\,\partial V/\partial r$ at $r = a$.

        Check with $q$ at the center: $V = \dfrac{q}{4\pi\varepsilon_0 r}+\text{const}$, so $\partial V/\partial r = -\dfrac{q}{4\pi\varepsilon_0a^2}$ and $\sigma = -\dfrac{q}{4\pi a^2}$. Correct sign and total.

        !!trap Inward normals
            On any **inner** surface (cavity wall, inside face of a shell) the normal into the field region is $-\hat{\mathbf r}$ and the sign of $\partial V/\partial r$ flips.`,
        { figHtml: fQ2 }),
      Q(md`A thin insulating shell of radius $R$ carries a fixed $\sigma(\theta)$. Which pair of conditions holds at $r = R$?`,
        [md`$V$ and $\partial V/\partial r$ are both continuous`, md`$V$ jumps by $\sigma R/\varepsilon_0$; $\partial V/\partial r$ is continuous`, md`$V_{\rm out}(R,\theta) = 0$ and $V_{\rm in}$ is finite`, md`$V$ is continuous and $\dfrac{\partial V_{\rm out}}{\partial r}-\dfrac{\partial V_{\rm in}}{\partial r} = -\dfrac{\sigma(\theta)}{\varepsilon_0}$`], 3,
        [md`That describes a surface with no charge on it, such as the edge of a uniformly charged ball. With $\sigma$ present, the normal field jumps.`, md`Swapped. $V$ never jumps at a surface charge (only at a dipole layer); its normal derivative does.`, md`Nothing is grounded. An insulating sheet with fixed $\sigma$ does not fix the value of $V$.`, null],
        md`Gauss's law on a pillbox gives the jump in the normal field: $E_{\rm out}-E_{\rm in} = \sigma/\varepsilon_0$, that is $\partial_rV_{\rm out}-\partial_rV_{\rm in} = -\sigma/\varepsilon_0$. A finite field means $V$ is continuous. Both hold at every $\theta$.`,
        { figHtml: fQ3 }),
      Q(md`An isolated metal sphere carries total charge $Q$. A point charge $q$ sits nearby. Which condition on the sphere is correct?`,
        [md`$V(R,\theta) = 0$`, md`$V(R,\theta) = V_s$, an unknown constant, together with $-\varepsilon_0\oint \dfrac{\partial V}{\partial r}\,da = Q$`, md`$V(R,\theta) = \dfrac{Q}{4\pi\varepsilon_0 R}$`, md`$\sigma = \dfrac{Q}{4\pi R^2}$ on the whole surface`], 1,
        [md`That is a grounded sphere. A grounded sphere can draw charge from the ground, so its $Q$ is not fixed.`, null, md`That ignores $q$. Evaluating $V$ at the center (inside the metal) gives $V_s = \dfrac{Q}{4\pi\varepsilon_0R}+\dfrac{q}{4\pi\varepsilon_0d}$.`, md`Uniform only when the sphere is alone. The charge $q$ pulls charge around.`],
        md`"Isolated with charge $Q$" means two facts: the sphere is an equipotential (value unknown), and the total charge is fixed. The unknown constant $V_s$ is one more unknown, and the total-charge condition is one more equation, so the count still balances.

        Bonus trick: the center is inside the metal, so $V_s = V(\text{center})$. Every bit of the sphere's own charge is a distance $R$ from the center, so $V_s = \dfrac{Q}{4\pi\varepsilon_0R}+\dfrac{q}{4\pi\varepsilon_0d}$.`,
        { figHtml: fQ4 }),

      R(md`
        ### Level 2: set up

        What each standard condition does to the general solution:

        | Geometry | General solution | Origin or axis in the region | Far away |
        |---|---|---|---|
        | Spherical, no $\phi$ | $\sum (A_\ell r^\ell + B_\ell r^{-(\ell+1)})P_\ell(\cos\theta)$ | kills every $B_\ell$ | $V\to0$ kills every $A_\ell$; $V\to -E_0r\cos\theta$ keeps only $A_1 = -E_0$ |
        | Cylindrical, no $z$ | $A_0 + B_0\ln s + \sum (A_ns^n + B_ns^{-n})(\cos n\phi,\ \sin n\phi)$ | kills $\ln s$ and every $s^{-n}$ | $s^n$ killed; $B_0 = -\dfrac{\lambda_{\rm enc}}{2\pi\varepsilon_0}$ stays if the net line charge is not zero |
        | Cartesian slot | $\sin(ky)\,e^{\pm kx}$ etc. | n/a | $e^{+kx}$ killed |

        Counting: after the origin and infinity conditions, every **interface** gives two equations per mode (continuity and the jump), every **conductor surface** gives one per mode ($V$ = const), and an **isolated** conductor adds one total-charge equation for the $\ell = 0$ mode. The number of equations must equal the number of surviving constants.
      `),
      Q(md`The potential on the sphere is a given $V_0(\theta)$ and you want $V$ inside. Which terms survive?`,
        [md`Only $A_\ell r^\ell P_\ell(\cos\theta)$`, md`Only $B_\ell r^{-(\ell+1)}P_\ell(\cos\theta)$`, md`Both, with the $B_\ell$ fixed by matching $V_0(\theta)$`, md`Only $A_0 + B_0/r$`], 0,
        [null, md`Those blow up at the origin, which is inside the region.`, md`There is one condition per $\ell$ on the surface and two constants. Finiteness at $r = 0$ is the missing condition, and it sets every $B_\ell = 0$.`, md`That is the $\ell = 0$ part only; any $\theta$ dependence in $V_0(\theta)$ needs $\ell \ge 1$.`],
        md`The origin is inside the region, and $r^{-(\ell+1)}$ diverges there, so every $B_\ell = 0$. The surface condition then fixes $A_\ell$ by the Fourier–Legendre trick: one constant, one condition per $\ell$.`,
        { figHtml: fQ5 }),
      Q(md`A grounded metal sphere sits in a uniform field $E_0\hat{\mathbf z}$. Which condition sets $A_1 = -E_0$ and kills every other $A_\ell$?`,
        [md`$V(R,\theta) = 0$`, md`$V$ finite at $r = 0$`, md`$V\to -E_0r\cos\theta$ as $r\to\infty$`, md`$V$ independent of $\phi$`], 2,
        [md`That condition relates $B_\ell$ to $A_\ell$ ($B_\ell = -A_\ell R^{2\ell+1}$); it does not fix the $A_\ell$.`, md`The origin is inside the metal, not in the region. This condition does not apply.`, null, md`Azimuthal symmetry only tells you to use $P_\ell(\cos\theta)$; it fixes no coefficient.`],
        md`Far away only the $A_\ell r^\ell$ terms matter, and they must reproduce $-E_0r\cos\theta = -E_0rP_1$. So $A_1 = -E_0$ and every other $A_\ell = 0$ (including $A_0$, since far away $V\to0$ on the plane $z = 0$). Then $V(R,\theta) = 0$ gives $B_1 = E_0R^3$ and $B_\ell = 0$ otherwise.`,
        { figHtml: fQ6 }),
      Q(md`A long charged cylinder carries $\lambda$ per unit length. What is the right condition far from it ($s\to\infty$)?`,
        [md`$V\to0$`, md`$V\approx -\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + \text{const}$`, md`$V\approx \dfrac{\lambda}{2\pi\varepsilon_0 s}$`, md`$V\approx \dfrac{\lambda}{4\pi\varepsilon_0 s}$`], 1,
        [md`In 2-D a net line charge makes $V$ grow like $-\ln s$ without bound. You cannot put the reference at infinity.`, null, md`That is the field's $1/s$ shape, not the potential's. Integrating $E = \lambda/(2\pi\varepsilon_0s)$ gives a logarithm.`, md`A $1/s$ potential is a 3-D-looking guess. In 2-D the monopole term is $\ln s$.`],
        md`Gauss: $E = \lambda/(2\pi\varepsilon_0s)$, so $V = -\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + C$. The $\ell = 0$ part of the 2-D solution is $A_0 + B_0\ln s$, and the far-field condition fixes $B_0 = -\lambda/(2\pi\varepsilon_0)$ while $A_0$ stays a free reference.

        !!key 2-D versus 3-D at infinity
            3-D: bounded charge gives $V\sim Q/(4\pi\varepsilon_0r)\to0$. 2-D: net $\lambda$ gives $V\sim-\ln s$, which never settles, so you set the reference somewhere finite (often on a grounded surface).`,
        { figHtml: fQ7 }),
      Q(md`A shell of radius $a$ carries $\sigma(\theta)$ inside a grounded concentric metal shell of radius $b$. For one value of $\ell$, after finiteness at the origin, how many unknown coefficients are left and how many conditions fix them?`,
        [md`2 unknowns, 2 conditions`, md`4 unknowns, 3 conditions`, md`3 unknowns, 2 conditions`, md`3 unknowns, 3 conditions`], 3,
        [md`You have forgotten one region's term. Inside: $A_\ell$. Between: $C_\ell$ and $D_\ell$. That is three.`, md`Finiteness at $r = 0$ already removed the $r^{-(\ell+1)}$ term inside, leaving three.`, md`There are three conditions: $V(b) = 0$, continuity at $a$, and the jump at $a$.`, null],
        md`Regions: $r<a$ and $a<r<b$ (outside $b$ the field is zero and not needed).

        - Inside: $A_\ell r^\ell$ (finite at 0).
        - Between: $C_\ell r^\ell + D_\ell r^{-(\ell+1)}$.

        Conditions per $\ell$: (1) $V(b) = 0$; (2) $V$ continuous at $a$; (3) $\partial_rV$ jumps by $-\sigma_\ell/\varepsilon_0$ at $a$. Three equations, three unknowns.`,
        { figHtml: fQ8 }),
      Q(md`Pipe cross-section: $V = 0$ on $y = 0$, $y = a$ and $x = b$, and $V = V_0(y)$ on $x = 0$. Which conditions force $k = n\pi/a$?`,
        [md`$V(0,y) = V_0(y)$`, md`$V(b,y) = 0$`, md`$V(x,0) = V(x,a) = 0$`, md`All four together`], 2,
        [md`That condition fixes the Fourier coefficients after $k$ is known.`, md`That condition fixes the mix of $e^{kx}$ and $e^{-kx}$ (it turns them into $\sinh k(b-x)$).`, null, md`Only the pair of grounded parallel walls quantizes $k$. The other two play different roles.`],
        md`The $y$ part is $\sin ky$ or $\cos ky$. $V(x,0) = 0$ picks $\sin ky$, and $V(x,a) = 0$ needs $\sin ka = 0$, so $k = n\pi/a$. The homogeneous pair of walls quantizes; the far wall builds $\sinh k(b-x)$; the live wall fixes the coefficients.`,
        { figHtml: fQ9 }),

      R(md`
        ### Level 3: standard cases (words into conditions)

        | Words | Condition |
        |---|---|
        | grounded | $V = 0$ on it |
        | held at $V_0$ (battery) | $V = V_0$ on it; its charge is an output |
        | isolated, charge $Q$ (neutral: $Q = 0$) | $V = V_s$, unknown constant, **and** $-\varepsilon_0\oint\partial V/\partial n\,da = Q$ |
        | far away the field is $E_0\hat{\mathbf z}$ | $V\to -E_0z + C$ |
        | bounded charge, 3-D, far away | $V\to0$ |
        | insulated wall (steady current in a resistive sheet) | no current crosses: $\partial V/\partial n = 0$ |
        | mirror plane of an even arrangement | $\partial V/\partial n = 0$ on the plane |
        | mirror plane of an odd arrangement | $V = 0$ on the plane |

        $V$ given on a boundary is **Dirichlet**; $\partial V/\partial n$ given is **Neumann**. With Neumann data on every boundary, $V$ is fixed only up to an added constant (the field is still unique).
      `),
      Q(md`Grounded metal sphere in a uniform field $E_0\hat{\mathbf z}$. Which list of conditions is complete and correct?`,
        [md`$V(R,\theta) = 0$; $V\to0$ as $r\to\infty$`, md`$V(R,\theta) = 0$; $V\to -E_0r\cos\theta$ as $r\to\infty$`, md`$V(R,\theta) = 0$; $V$ finite at $r = 0$; $V\to -E_0r\cos\theta$`, md`$V(R,\theta) = -E_0R\cos\theta$; $V\to -E_0r\cos\theta$`], 1,
        [md`The applied field never goes away, so $V$ cannot go to zero far away.`, null, md`$r = 0$ is inside the metal, outside the region. Imposing it would wrongly kill the $B_1/r^2$ term that carries the induced charge.`, md`That is the potential with no sphere at all; a grounded sphere has $V = 0$ on it.`],
        md`Region: $r > R$. BC 1: $V(R,\theta) = 0$. BC 2: $V\to-E_0r\cos\theta$. Result: $V = -E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$. Two conditions per $\ell$, two constants per $\ell$.`,
        { figHtml: fQ10 }),
      Q(md`Compare a **neutral isolated** metal sphere in $E_0\hat{\mathbf z}$ with a **grounded** one. What is true?`,
        [md`They have identical $V$ and $\sigma$: the neutral sphere's potential comes out $0$ anyway`, md`The neutral sphere has $\sigma = 0$ everywhere`, md`The neutral sphere sits at $V_s = -E_0R$`, md`The grounded one acquires net charge $-4\pi\varepsilon_0E_0R^2$`], 0,
        [null, md`Neutral means zero total, not zero everywhere. It still polarizes: $\sigma = 3\varepsilon_0E_0\cos\theta$.`, md`$-E_0R\cos\theta$ varies over the surface; a conductor's potential is one number, and symmetry (top and bottom opposite) makes it 0.`, md`The induced charge is purely $\cos\theta$, which integrates to zero. No net charge flows from ground.`],
        md`Isolated neutral: $V(R,\theta) = V_s$ and $Q = 0$. The $\ell = 0$ part of the outside solution is $V_s R/r$, which carries charge $4\pi\varepsilon_0RV_s$. Zero charge means $V_s = 0$, so the conditions are identical to grounded, and uniqueness says the solutions are identical.`,
        { figHtml: fQ11 }),
      Q(md`Now the isolated sphere in $E_0\hat{\mathbf z}$ carries net charge $Q$. What do you add to the grounded-sphere solution $-E_0(r-R^3/r^2)\cos\theta$?`,
        [md`A constant $V_s$ everywhere`, md`$\dfrac{Q\cos\theta}{4\pi\varepsilon_0r^2}$`, md`$\dfrac{Q}{4\pi\varepsilon_0R}$ on the surface only`, md`$\dfrac{Q}{4\pi\varepsilon_0r}$`], 3,
        [md`A constant everywhere breaks the far condition $V\to-E_0r\cos\theta$ and carries no charge.`, md`That is a dipole term; it has zero net charge and is not constant on the sphere.`, md`$V$ must solve Laplace outside, not just change on the surface. The harmonic function that is constant on the sphere and carries charge $Q$ is $Q/(4\pi\varepsilon_0 r)$.`, null],
        md`$\dfrac{Q}{4\pi\varepsilon_0r}$ solves Laplace outside, is constant on $r = R$ (so the sphere stays an equipotential, at $V_s = Q/(4\pi\varepsilon_0R)$), vanishes far away, and has flux $Q/\varepsilon_0$. All conditions hold, so by uniqueness this is it. $\sigma = 3\varepsilon_0E_0\cos\theta + \dfrac{Q}{4\pi R^2}$.`,
        { figHtml: fQ12 }),
      Q(md`A thin resistive sheet carries steady current from the edge at $V = 0$ to the edge at $V_0$. The other two edges are insulated. Inside the sheet $\nabla^2V = 0$. What is the condition on the insulated edges?`,
        [md`$V = 0$`, md`$V = V_0/2$`, md`$\partial V/\partial y = 0$`, md`None; only the two electrode edges need conditions`], 2,
        [md`That would make them electrodes connected to ground; current would flow into them.`, md`The potential varies along those edges (from 0 to $V_0$); no single value fits.`, null, md`Without conditions on all of the boundary the solution is not unique.`],
        md`No current crosses an insulated edge, so $J_y = \sigma_c E_y = 0$, which means $\partial V/\partial y = 0$: a Neumann condition. With it, $V = V_0x/L$ satisfies everything, so by uniqueness it is the answer. The same Neumann condition appears on a mirror plane of an even charge arrangement.`,
        { figHtml: fQ13 }),
      Q(md`Two equal charges $+q$ sit symmetrically about a plane. You want to solve only in the right half-space. What condition replaces the left half on the mirror plane?`,
        [md`$V = 0$ on the plane`, md`$\partial V/\partial x = 0$ on the plane`, md`$V = \dfrac{2q}{4\pi\varepsilon_0d}$ on the plane`, md`No condition is needed on a plane with no charge`], 1,
        [md`$V = 0$ is the mirror plane of an **odd** pair ($+q$ and $-q$). For two $+q$, $V > 0$ everywhere.`, null, md`That is the value at one point (the midpoint); $V$ varies along the plane.`, md`The plane is a boundary of your region now, and every boundary needs a condition.`],
        md`By symmetry $V(-x,y,z) = V(x,y,z)$, so $\partial V/\partial x = 0$ at $x = 0$: no field line crosses the plane. This is how images work in reverse: a Neumann plane is replaced by a same-sign image.`,
        { figHtml: fQ14 }),
      Q(md`In a charge-free region you are given only $\partial V/\partial n$ on the whole closed boundary. What can you say about $V$?`,
        [md`$V$ is unique`, md`$V$ is not determined at all`, md`$V$ is unique only if $\partial V/\partial n = 0$`, md`$V$ is unique up to an added constant`], 3,
        [md`Adding a constant to $V$ changes no derivative, so Neumann data cannot fix it.`, md`The difference of two solutions has $\nabla^2 = 0$ and zero normal derivative, which forces it to be constant. So $V$ is determined except for that constant.`, md`The zero case is just one example. Any consistent Neumann data gives the same conclusion.`, null],
        md`If $V_1$, $V_2$ both work, $V_3 = V_1-V_2$ has $\nabla^2V_3 = 0$ and $\partial V_3/\partial n = 0$. Then $\int|\nabla V_3|^2\,d\tau = \oint V_3\,\partial_nV_3\,da = 0$, so $\nabla V_3 = 0$: $V_3$ is a constant. The field is unique; the potential is unique up to its zero.`,
        { figHtml: fQ15 }),
      Q(md`A long metal cylinder carrying $\lambda$ per length sits in a uniform transverse field $E_0\hat{\mathbf x}$. What is the condition at large $s$?`,
        [md`$V\to -E_0s\cos\phi - \dfrac{\lambda}{2\pi\varepsilon_0}\ln s + C$`, md`$V\to0$`, md`$V\to -E_0s\cos\phi$`, md`$V\to -E_0s\cos\phi + \dfrac{\lambda}{2\pi\varepsilon_0s}$`], 0,
        [null, md`The applied field and the net line charge both make $V$ grow far away.`, md`This drops the net charge. With $\lambda\ne0$ a $\ln s$ term is unavoidable.`, md`The monopole term in 2-D is $\ln s$, not $1/s$.`],
        md`Both the applied field and the cylinder's net charge survive far away. The $\ln s$ coefficient is fixed by Gauss's law; the constant $C$ is a free reference (pick it by setting $V$ on the cylinder).`,
        { figHtml: fQ16 }),

      R(md`
        ### Level 4: checking a candidate

        Given a proposed $V$, check in this order:

        1. It solves Laplace (or Poisson with the right $\rho$) in **each** region.
        2. Every boundary condition, at every angle.
        3. At each interface: continuity and the jump.
        4. Totals: the net charge on each isolated conductor.
        5. Singularities appear only where real point charges are.

        Pass all five and uniqueness says it **is** the answer. Fail one and the failure tells you what is missing: a $1/r$ term (charge), an image, a constant.
      `),
      Q(md`Isolated metal sphere with charge $Q$ in $E_0\hat{\mathbf z}$. A student proposes $V = -E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$ outside. Which check fails?`,
        [md`$V$ constant on the sphere`, md`$V\to-E_0r\cos\theta$ far away`, md`Laplace's equation outside`, md`The total charge on the sphere`], 3,
        [md`On $r = R$ it gives 0 for every $\theta$: constant. Passes.`, md`The $R^3/r^2$ part dies far away. Passes.`, md`Both $r\cos\theta$ and $\cos\theta/r^2$ are harmonic. Passes.`, null],
        md`$\sigma = 3\varepsilon_0E_0\cos\theta$ integrates to zero, but the sphere carries $Q$. The fix is the $\ell = 0$ term $\dfrac{Q}{4\pi\varepsilon_0r}$.`,
        { figHtml: fQ17 }),
      Q(md`For a shell with $\sigma_0\cos\theta$ someone proposes $V_{\rm in} = \dfrac{\sigma_0}{2\varepsilon_0}r\cos\theta$, $V_{\rm out} = \dfrac{\sigma_0R^3}{2\varepsilon_0}\dfrac{\cos\theta}{r^2}$. Which check fails?`,
        [md`Continuity at $r = R$`, md`The jump in $\partial V/\partial r$ at $r = R$`, md`Finiteness at the origin`, md`$V\to0$ far away`], 1,
        [md`Both give $\dfrac{\sigma_0R}{2\varepsilon_0}\cos\theta$ at $r = R$. Passes.`, null, md`$r\cos\theta$ is finite at the origin. Passes.`, md`$\cos\theta/r^2\to0$. Passes.`],
        md`$\partial_rV_{\rm out}-\partial_rV_{\rm in} = -\dfrac{\sigma_0}{\varepsilon_0}\cos\theta\left(1+\tfrac12\right) = -\dfrac{3\sigma_0}{2\varepsilon_0}\cos\theta$, but it must be $-\dfrac{\sigma_0}{\varepsilon_0}\cos\theta$. The correct factor is $\dfrac{1}{3}$, not $\dfrac12$: in general $A_\ell = \dfrac{\sigma_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$.`,
        { figHtml: fQ18 }),
      Q(md`A point charge $q$ is a distance $a$ from the center of a **neutral isolated** metal sphere. A student uses only the grounded-sphere image $q' = -qR/a$ at $R^2/a$. What fails, and what fixes it?`,
        [md`$V$ is not constant on the sphere; move the image`, md`The far-field condition fails; add $-q$ at infinity`, md`The total charge on the sphere is $-qR/a$, not 0; add $+qR/a$ at the center`, md`Nothing fails; the grounded and neutral spheres are the same`], 2,
        [md`The grounded image makes $V = 0$ on the sphere, which is constant. That check passes.`, md`$V\to0$ far away already. There is no charge at infinity to add.`, null, md`Here the induced charge has a net value $-qR/a$, so grounded and neutral differ (unlike the uniform-field case).`],
        md`Total induced charge = total image charge inside = $-qR/a$. Neutral needs 0, so add $+qR/a$ at the center: it keeps the sphere an equipotential (now at $\dfrac{qR/a}{4\pi\varepsilon_0R} = \dfrac{q}{4\pi\varepsilon_0a}$) and restores zero net charge. Note that this equals $V$ of $q$ at the center, as the averaging argument predicts.`,
        { figHtml: fQ19 }),
      Q(md`You solve for $V$ inside a long cylinder of radius $a$ (axis included) with $V = V_0(\phi)$ on it. Which terms survive?`,
        [md`$A_0 + \sum s^n(C_n\cos n\phi + D_n\sin n\phi)$`, md`$A_0 + B_0\ln s + \sum s^n(\dots)$`, md`$\sum s^{-n}(C_n\cos n\phi + D_n\sin n\phi)$`, md`$A_0 + \sum (s^n + s^{-n})(\dots)$`], 0,
        [null, md`$\ln s$ diverges on the axis, which is in the region, and there is no line charge there.`, md`$s^{-n}$ diverges on the axis.`, md`$s^{-n}$ diverges on the axis.`],
        md`Finiteness on the axis kills $\ln s$ and all $s^{-n}$. The remaining $A_0$, $C_n$, $D_n$ come from Fourier-expanding $V_0(\phi)$: $A_0$ is the average of $V_0$, which is also $V$ on the axis.`,
        { figHtml: fQ20 }),
      Q(md`A square region $0<x,y<a$ is claimed to be charge-free. The boundary values in the figure all fit the candidate $V = \dfrac{V_0(x^2+y^2)}{a^2}$. What is wrong?`,
        [md`Nothing: the boundary values match, so uniqueness makes it the answer`, md`It fails Laplace: $\nabla^2V = 4V_0/a^2$, which is the potential of a uniform $\rho = -4\varepsilon_0V_0/a^2$`, md`It has a minimum at the origin, but Laplace is still satisfied`, md`It fails only at the corners`], 1,
        [md`Uniqueness needs **both** the boundary values and the right equation inside. This one solves Poisson with a charge density, not Laplace.`, null, md`$\nabla^2(x^2+y^2) = 4\ne0$. (Its minimum sits on the boundary corner, which is not the problem.)`, md`The failure is everywhere inside, not at the corners.`],
        md`$\nabla^2V = V_0(2+2)/a^2 = 4V_0/a^2 = -\rho/\varepsilon_0$ gives $\rho = -4\varepsilon_0V_0/a^2$. The boundary data are fine; the region is not charge-free for this $V$. The real Laplace solution with these boundary values exists and is different (for instance $V_0(x^2-y^2)/a^2$ plus a harmonic correction).`,
        { figHtml: fQ21 }),
      Q(md`A computer solution for a charge-free box with one wall at $V_0$ and the others grounded reports $V = 1.3V_0$ at an interior point. What do you conclude?`,
        [md`Possible if the point is close to the live wall`, md`Possible because the corners concentrate the field`, md`Possible only if the box is long and thin`, md`Impossible: a Laplace solution has no interior maximum, so $0\le V\le V_0$ everywhere inside`], 3,
        [md`Even next to the live wall, $V$ is an average of its neighbors, all at most $V_0$.`, md`Field concentration does not raise $V$ above the largest boundary value.`, md`Shape does not matter; the max principle holds for every region.`, null],
        md`$V$ at any interior point equals its average over any small sphere (circle in 2-D) around it, so it cannot exceed all its neighbors. Extremes live on the boundary. Here the boundary values lie in $[0, V_0]$, so the code has a bug (often a sign or a boundary index).`,
        { figHtml: fQ22 }),
      Q(md`A sphere $S$ of radius $R$ contains total charge $Q$ (arranged any way, not touching $S$). Charges outside alone would make $5\ \text{V}$ at the center, and $\dfrac{Q}{4\pi\varepsilon_0R} = 2\ \text{V}$. What is the average of $V$ over $S$?`,
        [md`$5\ \text{V}$`, md`$3\ \text{V}$`, md`$7\ \text{V}$`, md`It depends on how the charge inside is arranged`], 2,
        [md`That is the outside charges' contribution only. The inside charges add to the average too.`, md`Signs: both pieces add.`, null, md`The surface average of a single inside charge's potential is $q/(4\pi\varepsilon_0R)$ wherever it sits, so the arrangement drops out.`],
        md`Outside charges: the average over $S$ equals their value at the center, $5$ V (mean-value theorem). Inside charges: the average over $S$ of $q_i/(4\pi\varepsilon_0|\vb r-\vb r_i|)$ is $q_i/(4\pi\varepsilon_0R)$ for any position inside. Total: $5+2 = 7$ V.`,
        { figHtml: fQ23 }),
      Q(md`Inner metal sphere (radius $a$) is isolated with charge $Q$; the concentric outer shell (radius $b$) is grounded. Why can't you list "$V(a) = V_0$" as a boundary condition?`,
        [md`$V(a)$ is unknown; the given fact is the charge $Q$, which fixes the $1/r$ coefficient, and $V(a)$ is computed afterward`, md`Because $V$ is not constant on an isolated conductor`, md`Because $V(a)$ must be 0 when the outer shell is grounded`, md`You can; $V_0 = Q/(4\pi\varepsilon_0a)$`], 0,
        [null, md`Every conductor is an equipotential, isolated or not.`, md`Grounding the outer shell does not ground the inner sphere; there is a field between them.`, md`That ignores the grounded shell. The real value is $\dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$.`],
        md`Between: $V = A + B/r$. BC 1: $V(b) = 0$. BC 2: flux through the inner sphere is $Q/\varepsilon_0$, so $B = Q/(4\pi\varepsilon_0)$. Then $V(a) = \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$ is an output. Each conductor gets **either** its potential **or** its charge, never something you don't know.`,
        { figHtml: fQ24 }),
      Q(md`A line charge $\lambda$ sits a height $d$ above a grounded plane. The image solution $V = -\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s_+}{s_-}$ goes to zero far away, even though this is a 2-D problem. Why is that allowed?`,
        [md`Because $\ln$ grows slowly enough to ignore`, md`Because the net line charge (real plus induced) is zero, so the $\ln s$ terms cancel far away`, md`Because the plane is grounded, which forces $V\to0$ everywhere far away in any 2-D problem`, md`It is not allowed; the answer needs an extra $\ln s$ term`], 1,
        [md`$\ln s$ diverges; it cannot be ignored when the net charge is nonzero.`, null, md`Grounding sets $V$ on the plane. The far behavior comes from the net charge.`, md`Far away $\ln(s_+/s_-)\to0$; adding a $\ln s$ would put a net line charge somewhere it is not.`],
        md`The plane carries $-\lambda$ per length (the image's charge). Net zero means the far field is a line dipole, $V\propto\cos\phi/s\to0$. The 2-D rule: $V\to0$ at infinity is possible exactly when the net line charge is zero.`,
        { figHtml: fQ25 }),
      Q(md`A charge $q$ sits inside a grounded spherical shell of radius $R$, a distance $a$ from its center. A student lists: (1) $V = 0$ on $r = R$; (2) $V\to0$ as $r\to\infty$; (3) $V\approx\dfrac{q}{4\pi\varepsilon_0|\vb r-\vb a|}$ near the charge. Which is the problem?`,
        [md`(1): a shell with charge inside cannot be grounded`, md`(3): the singular behavior is not a boundary condition`, md`None; the list is correct`, md`(2): infinity is not part of the region $r<R$`], 3,
        [md`It can; the ground supplies the induced $-q$.`, md`It is how you tell the method where the real charge is; you need it (or Poisson with a delta).`, md`One item does not belong to the region.`, null],
        md`The region is the inside of the shell. Its only boundary is $r = R$. A condition at infinity is meaningless here and could mislead you into killing the $r^\ell$ terms you need. The image is $q' = -qR/a$ at $R^2/a$, **outside** the region.`,
        { figHtml: fQ26 }),

      R(md`
        ### Level 5: exam level (several regions, nested conductors)

        Recipe for nested problems:

        1. Name the regions; write the general solution in each with its own constants.
        2. Kill terms at the origin and at infinity (or at a grounded outer shell, where outside the field is zero).
        3. At each charged insulating surface: continuity and the jump, per $\ell$.
        4. At each conductor: $V$ = its constant (known or unknown), plus total charge if isolated.
        5. A conductor shell with something inside: its inner face carries minus the enclosed charge; the rest sits on the outer face.

        Shortcut: build the outer condition into the form. For $V(b) = 0$ use $r^\ell - b^{2\ell+1}/r^{\ell+1}$.
      `),
      Q(md`Shell $\sigma_0\cos\theta$ at $r = a$ inside a grounded shell at $r = b$ (figure from Level 2 with $\sigma = \sigma_0\cos\theta$). Which form in $a<r<b$ satisfies $V(b) = 0$ automatically?`,
        [md`$B\left(r-\dfrac{b^3}{r^2}\right)\cos\theta$`, md`$Br\cos\theta$`, md`$B\left(r-\dfrac{a^3}{r^2}\right)\cos\theta$`, md`$B\left(\dfrac{1}{r^2}-\dfrac{1}{b^2}\right)\cos\theta$`], 0,
        [null, md`At $r = b$ it gives $Bb\cos\theta\ne0$.`, md`That vanishes at $r = a$, the wrong surface (that is the form for a grounded **inner** sphere).`, md`$\cos\theta$ times a constant is not harmonic, so the $-1/b^2$ piece breaks Laplace.`],
        md`$r\cos\theta$ and $\cos\theta/r^2$ are both harmonic; the combination $r-b^3/r^2$ is zero at $r = b$. Then only two unknowns remain ($B$ and the inside coefficient $A$) for the two conditions at $r = a$. Result: $B = -\dfrac{\sigma_0a^3}{3\varepsilon_0b^3}$.`,
        { figHtml: fQ27 }),
      Q(md`Same geometry, now $\sigma = \sigma_0(2+\cos\theta)$ on the inner shell. What total charge does the grounded outer shell carry?`,
        [md`$0$`, md`$+8\pi a^2\sigma_0$`, md`$-8\pi a^2\sigma_0$`, md`$-8\pi b^2\sigma_0$`], 2,
        [md`That is right for the $\cos\theta$ part alone, but the constant part carries net charge.`, md`Sign: the grounded shell's inner face must cancel the enclosed charge.`, null, md`The induced charge equals minus the **enclosed** charge, which is set by the inner shell's area $4\pi a^2$.`],
        md`Enclosed charge: $\oint\sigma_0(2+\cos\theta)\,da = 2\sigma_0\cdot4\pi a^2 = 8\pi a^2\sigma_0$ (the $\cos\theta$ part integrates to 0). Outside the grounded shell $V = 0$ and $E = 0$, so Gauss on a sphere just outside $b$ gives total enclosed charge 0: the shell holds $-8\pi a^2\sigma_0$.`,
        { figHtml: fQ28 }),
      Q(md`A long insulating cylinder of radius $a$ carries $\sigma = \sigma_0\cos\phi$. What is the field inside?`,
        [md`Uniform, $\dfrac{\sigma_0}{3\varepsilon_0}$ along $-\hat{\mathbf x}$`, md`Uniform, $\dfrac{\sigma_0}{2\varepsilon_0}$ along $-\hat{\mathbf x}$`, md`Uniform, $\dfrac{\sigma_0}{\varepsilon_0}$ along $+\hat{\mathbf x}$`, md`Zero`], 1,
        [md`$\tfrac13$ is the sphere's factor ($2\ell+1 = 3$). For a cylinder the $n = 1$ factor is $2n = 2$.`, null, md`Wrong size and sign: field lines go from the $+$ side ($\phi = 0$) to the $-$ side, so along $-\hat{\mathbf x}$.`, md`Zero only if the charge pattern had no $n = 1$ part.`],
        md`$V_{\rm in} = As\cos\phi$, $V_{\rm out} = A a^2\cos\phi/s$ (continuity). Jump: $-\dfrac{Aa^2}{a^2}-A = -2A = -\dfrac{\sigma_0}{\varepsilon_0}$, so $A = \dfrac{\sigma_0}{2\varepsilon_0}$ and $V_{\rm in} = \dfrac{\sigma_0}{2\varepsilon_0}x$: $\vb E = -\dfrac{\sigma_0}{2\varepsilon_0}\hat{\mathbf x}$.`,
        { figHtml: fQ29 }),
      Q(md`A metal sphere (radius $a$, charge $Q$) sits inside a concentric thick metal shell ($b<r<c$) that is isolated and neutral. Which conditions describe the shell?`,
        [md`$V(b) = 0$ and $V(c) = 0$`, md`$V(b) = V(c) = 0$, and the shell's charge is $-Q$`, md`$V(b)$ and $V(c)$ are two independent unknowns`, md`$V(b) = V(c) = V_{\rm shell}$ (unknown) and total shell charge 0, so $-Q$ on the inner face and $+Q$ on the outer face`], 3,
        [md`Nothing is grounded.`, md`Only a grounded shell would hold $-Q$ net. This one is neutral.`, md`One piece of metal has one potential.`, null],
        md`One conductor, one unknown potential, one total-charge condition. Gauss in the metal forces $-Q$ on the inner face, neutrality puts $+Q$ on the outer face, and outside $V = \dfrac{Q}{4\pi\varepsilon_0r}$, so $V_{\rm shell} = \dfrac{Q}{4\pi\varepsilon_0c}$.`,
        { figHtml: fQ30 }),
      Q(md`Between grounded plates, charge $\rho_0$ fills $0<x<d/2$ and the rest is empty. Which conditions hold at $x = d/2$, the edge of the charge?`,
        [md`$V$ and $dV/dx$ both continuous`, md`$V$ continuous; $dV/dx$ jumps by $\rho_0/\varepsilon_0$`, md`$V$ continuous; $dV/dx$ jumps by $\rho_0d/(2\varepsilon_0)$`, md`$V = 0$ there`], 0,
        [null, md`A jump in $\rho$ is not a surface charge. $V''$ jumps; $V'$ does not.`, md`That would need a surface charge $\rho_0d/2$ concentrated at the edge. The charge is spread through the slab.`, md`The edge of a charge distribution is not a conductor.`],
        md`Gauss on a thin pillbox across $x = d/2$ encloses $\rho_0\cdot(\text{thickness})\to0$, so $E$ is continuous. Two regions, two constants each, four conditions: $V(0) = 0$, $V(d) = 0$, $V$ and $V'$ continuous at $d/2$.`,
        { figHtml: fQ31 }),
      Q(md`A grounded sphere sits in a uniform field $E_0\hat{\mathbf z}$ **and** a point charge $q$ is nearby. Can you add the field solution $-E_0(r-R^3/r^2)\cos\theta$ to the point-charge-plus-image solution?`,
        [md`No; the image position depends on $E_0$`, md`No; the charge $q$ changes $\sigma$, so the field part must be redone`, md`Yes; each piece solves Laplace outside and vanishes on the sphere, and their far fields add to the required one`, md`Yes, but only if $q$ is on the $z$ axis`], 2,
        [md`The image for $q$ depends only on $q$, $a$ and $R$. Linear problems do not couple.`, md`$\sigma$ is the sum of the two pieces' charges; nothing is redone.`, null, md`Superposition does not care where $q$ is.`],
        md`Laplace and the conditions are linear and homogeneous on the sphere ($V = 0$), so sums of solutions are solutions. The far conditions add: $-E_0r\cos\theta$ plus $0$. Uniqueness makes the sum the answer. $\sigma$ is the sum, too.`,
        { figHtml: fQ32 }),
      Q(md`A metal sphere held at $V_0$ (relative to far away) sits in $E_0\hat{\mathbf z}$. Which statement is **wrong**?`,
        [md`BC 1: $V(R,\theta) = V_0$`, md`The solution is $-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta + \dfrac{V_0R}{r}$`, md`The sphere's net charge is $4\pi\varepsilon_0RV_0$`, md`BC 2 is $V\to V_0-E_0r\cos\theta$ far away`], 3,
        [md`Correct: "held at $V_0$" is a Dirichlet condition.`, md`Correct: the $V_0R/r$ term makes $V = V_0$ on the sphere and dies far away.`, md`Correct: from the $1/r$ term.`, null],
        md`$V_0$ is measured from far away, so far away $V\to-E_0r\cos\theta$ with no added constant. The sphere's potential enters through BC 1 only, and the $V_0R/r$ term carries it.`,
        { figHtml: fQ33 }),
      Q(md`A neutral metal ball has an **off-center** cavity with a charge $q$ in it. What is the field outside the ball?`,
        [md`A dipole-distorted field that depends on where $q$ is`, md`$\dfrac{q}{4\pi\varepsilon_0r^2}\hat{\mathbf r}$, measured from the ball's center`, md`Zero, because the metal shields the cavity`, md`$\dfrac{q}{4\pi\varepsilon_0r^2}$, measured from $q$`], 1,
        [md`The cavity's charges ($q$ and the induced $-q$) produce zero field in the metal and beyond. Only the outer surface matters.`, null, md`A neutral conductor shields the **inside** from outside fields, not the outside from charges inside. $+q$ ends up on the outer surface.`, md`The outer surface has no knowledge of where $q$ is; its charge spreads uniformly about the ball's center.`],
        md`Outside region: BC 1: the ball's surface is an equipotential; BC 2: total charge $q$ on it (since $-q$ is on the cavity wall); BC 3: $V\to0$. $\dfrac{q}{4\pi\varepsilon_0r}$ about the center satisfies all three, so by uniqueness it is the answer. The outer $\sigma$ is uniform.`,
        { figHtml: fQ34 }),
      Q(md`Inner insulating shell (radius $a$) with an arbitrary $\sigma_a(\theta)$ of total charge $Q_a$, inside a thin isolated **neutral** metal shell of radius $b$. What is $V$ outside $b$?`,
        [md`$\dfrac{Q_a}{4\pi\varepsilon_0r}$`, md`It depends on the higher moments of $\sigma_a$`, md`$0$`, md`$\dfrac{Q_a}{4\pi\varepsilon_0r}$ plus a dipole term from $\sigma_a$`], 0,
        [null, md`The metal blocks them: the field of $\sigma_a$ and of the inner-face charge cancel in the metal and outside.`, md`That would need a grounded shell; this one is neutral, so $+Q_a$ sits on its outer face.`, md`Any dipole part of $\sigma_a$ is cancelled by the inner face's charge.`],
        md`Outside: the metal surface is an equipotential with total charge $Q_a$ on it (inner face $-Q_a$, outer face $+Q_a$, net 0). The uniform outer face makes $\dfrac{Q_a}{4\pi\varepsilon_0r}$, which meets all conditions.`,
        { figHtml: fQ35 }),
      Q(md`A metal sphere (radius $a$) and a concentric thin metal shell (radius $b$) are joined by a wire; total charge $Q$. How much charge ends up on the inner sphere?`,
        [md`$Q\dfrac{a}{a+b}$`, md`$Q/2$`, md`$0$`, md`$Q\dfrac{a}{b}$`], 2,
        [md`That is the sharing rule for two spheres far **apart**. Here one is inside the other.`, md`Equal sharing would make the two potentials differ.`, null, md`No reason for a ratio; the condition $V_a = V_b$ with nothing between forces zero.`],
        md`Joined means one conductor: $V(a) = V(b)$. Between them $V = A + B/r$ with $B = q_a/(4\pi\varepsilon_0)$; equal potentials force $B = 0$, so $q_a = 0$. All of $Q$ moves to the outer surface. (Conductors push charge to their outermost surface.)`,
        { figHtml: fQ36 }),

      R(md`
        ### Level 6: harder than the exam

        Traps that cost points:

        - **Neumann consistency.** In a region with total charge $Q_{\rm enc}$, the given $\partial V/\partial n$ must satisfy $-\oint\partial V/\partial n\,da = Q_{\rm enc}/\varepsilon_0$. Data that break this have **no** solution.
        - **Over-specification.** Giving both $V$ and $\partial V/\partial n$ on the same closed boundary usually has no solution.
        - **2-D logs.** Net line charge means $\ln s$ at infinity; an isolated cylinder "at $V_0$ relative to infinity" is meaningless.
        - **Hidden charge.** A candidate with $1/r$ behavior at a point where nothing is placed describes a point charge you didn't put there.
      `),
      Q(md`A sphere of radius $R$ has its upper hemisphere at $V_0$ and its lower hemisphere at $0$; there is nothing else. What is the leading behavior of $V$ far away?`,
        [md`$\dfrac{V_0R}{r}$`, md`$\dfrac{V_0R}{2r}$`, md`$\dfrac{3V_0R^2}{4r^2}\cos\theta$, the $\ell = 1$ term`, md`$0$, because the two halves cancel`], 1,
        [md`That would need the whole sphere at $V_0$. The $\ell = 0$ coefficient is the **average** of the surface potential.`, null, md`The $\ell = 1$ term is real but falls faster; the monopole term $\propto1/r$ dominates.`, md`$0$ and $V_0$ don't cancel; the average is $V_0/2$.`],
        md`Outside: $V = \sum B_\ell r^{-(\ell+1)}P_\ell$. The $\ell = 0$ coefficient: $B_0/R = \tfrac12\int_0^\pi V(R,\theta)\sin\theta\,d\theta = V_0/2$. So $V\approx\dfrac{V_0R}{2r}$: the sphere carries $Q = 2\pi\varepsilon_0RV_0$.`,
        { figHtml: fQ37 }),
      Q(md`A metal cylinder of radius $a$ at $V_0$ is inside a grounded coaxial pipe of radius $b$. What happens to the charge per length $\lambda$ on the inner cylinder as $b\to\infty$?`,
        [md`$\lambda\to2\pi\varepsilon_0V_0$`, md`$\lambda\to\dfrac{2\pi\varepsilon_0V_0}{\ln a}$`, md`$\lambda\to\infty$`, md`$\lambda\to0$, like $1/\ln(b/a)$`], 3,
        [md`There is no finite limit; the log in the denominator grows without bound.`, md`$\ln a$ alone has units problems; the argument of a log must be a ratio.`, md`The capacitance per length shrinks as $b$ grows, so the charge shrinks.`, null],
        md`$V = V_0\dfrac{\ln(b/s)}{\ln(b/a)}$, so $\lambda = \dfrac{2\pi\varepsilon_0V_0}{\ln(b/a)}\to0$. In 2-D you cannot hold a cylinder at a fixed potential "relative to infinity" with a nonzero charge: that is the log at work.`,
        { figHtml: fQ38 }),
      Q(md`Inside a sphere of radius $R$ there is no charge. Can you prescribe $\partial V/\partial r = c$ (a nonzero constant) on the surface and solve for $V$ inside?`,
        [md`No: the flux of $\nabla V$ through the surface must be zero for a charge-free interior, and $4\pi R^2c\ne0$`, md`Yes: $V = cr$`, md`Yes: $V = cr^2/(2R)$`, md`Yes, up to an additive constant`], 0,
        [null, md`$\nabla^2(cr) = 2c/r\ne0$: that has charge inside.`, md`$\nabla^2(r^2) = 6$: uniform charge inside.`, md`The constant is not the issue; no solution exists at all.`],
        md`Divergence theorem: $\oint\partial V/\partial n\,da = \int\nabla^2V\,d\tau = 0$ in a charge-free region. Neumann data must integrate to zero (or to $-Q_{\rm enc}/\varepsilon_0$). Inconsistent data: no solution.`,
        { figHtml: fQ39 }),
      Q(md`For a charge-free region, someone specifies **both** $V$ and $\partial V/\partial n$ everywhere on the closed boundary, chosen independently. What is typically true?`,
        [md`The solution is unique and exists`, md`There are infinitely many solutions`, md`Usually no solution exists: $V$ alone already fixes everything, including $\partial V/\partial n$`, md`A solution exists if the region is convex`], 2,
        [md`Existence fails: Dirichlet data fix the solution, which then has its own normal derivative.`, md`Dirichlet data alone already make the solution unique.`, null, md`Shape is irrelevant.`],
        md`Each type of data alone is enough. Adding the other over-determines the problem: the normal derivative you specified will in general disagree with the one the Dirichlet solution has.`,
        { figHtml: fQ40 }),
      Q(md`A sphere with $V = V_0\cos\theta$ on it has an empty interior. A candidate for $V$ inside satisfies Laplace everywhere except that it behaves like $A/r$ near the origin, and it matches $V_0\cos\theta$ on the surface. What is wrong?`,
        [md`Nothing; Laplace is satisfied almost everywhere`, md`The surface condition must fail somewhere`, md`It is fine if $A$ is small`, md`It contains a point charge $4\pi\varepsilon_0A$ at the origin, which the problem does not have`], 3,
        [md`$\nabla^2(1/r) = -4\pi\delta^3(\vb r)$; "almost everywhere" hides a point charge.`, md`It matched by construction; the failure is in the interior.`, md`Any nonzero $A$ means a real charge.`, null],
        md`Finiteness at the origin is the condition that kills $1/r$. Without it, Laplace plus the surface data admit extra solutions (with point charges), so uniqueness needs the region to be honestly charge-free. Correct answer: $V = V_0\dfrac{r}{R}\cos\theta$.`,
        { figHtml: fQ41 }),
      Q(md`A thin grounded metal shell of radius $R$ has a charge $q$ at its center and sits in a uniform field $E_0\hat{\mathbf z}$. What is the total charge on the shell?`,
        [md`$-q$`, md`$0$`, md`$-q + 4\pi\varepsilon_0E_0R^2$`, md`$+q$`], 0,
        [null, md`The inner face must cancel $q$; the ground supplies that charge.`, md`The field part, $3\varepsilon_0E_0\cos\theta$ on the outer face, integrates to zero.`, md`Sign.`],
        md`Inside: $V = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1R\right)$, inner face $-q/(4\pi R^2)$. Outside: $V = -E_0(r-R^3/r^2)\cos\theta$, outer face $3\varepsilon_0E_0\cos\theta$. Total $-q$. The grounded shell decouples the two regions completely.`,
        { figHtml: fQ42 }),
      Q(md`Images meet separation of variables: charge $q$ on the $z$ axis at distance $a$ from the center of a grounded sphere of radius $R$. Outside the sphere $V = \dfrac{q}{4\pi\varepsilon_0|\vb r-a\hat{\mathbf z}|}+\sum_\ell \dfrac{B_\ell}{r^{\ell+1}}P_\ell(\cos\theta)$. What is $B_0$?`,
        [md`$0$`, md`$-\dfrac{qR}{4\pi\varepsilon_0a}$`, md`$-\dfrac{q}{4\pi\varepsilon_0}$`, md`$-\dfrac{qR^2}{4\pi\varepsilon_0a^2}$`], 1,
        [md`The sphere is grounded and picks up net charge.`, null, md`That would be total induced charge $-q$, true only as $a\to R$.`, md`Wrong powers. The pattern is $B_\ell\propto R^{2\ell+1}/a^{\ell+1}$: $B_0\propto R/a$, $B_1\propto R^3/a^2$.`],
        md`The sum is the image's potential expanded about the center: the image $-qR/a$ at $b = R^2/a$ gives $B_\ell = -\dfrac{qR}{4\pi\varepsilon_0a}b^\ell = -\dfrac{q}{4\pi\varepsilon_0}\dfrac{R^{2\ell+1}}{a^{\ell+1}}$. $B_0$ is the total induced charge over $4\pi\varepsilon_0$: $-qR/a$.`,
        { figHtml: fQ43 }),
      Q(md`A charge $q$ sits at the exact center of a grounded spherical shell. Is that equilibrium stable against a small displacement $\delta$?`,
        [md`Stable: the shell pulls it back from every side`, md`Neutral: the force stays zero for any small $\delta$`, md`Unstable: the image ($-qR/\delta$ at $R^2/\delta$) is nearest on the side it moved toward and pulls it farther`, md`Stable only if $q<0$`], 2,
        [md`The shell's induced charge rearranges when $q$ moves; it does not act like a fixed ring of springs.`, md`The force on $q$ grows with $\delta$.`, null, md`Image attraction is $\propto q^2$, independent of sign.`],
        md`Displaced by $\delta$, the image sits at $R^2/\delta$ on the same side, so it attracts $q$ outward: force $\approx\dfrac{q^2\delta}{4\pi\varepsilon_0R^3}$ away from center. Earnshaw in action: electrostatic fields alone cannot trap a charge stably.`,
        { figHtml: fQ44 }),
      Q(md`A metal cylinder (radius $a$) carries $\lambda\ne0$ per length in $E_0\hat{\mathbf x}$. A student imposes $V(a,\phi) = 0$ and $V\to-E_0s\cos\phi$ exactly at large $s$. What happens?`,
        [md`Unique solution, with $\lambda$ fixed by the conditions`, md`Infinitely many solutions`, md`It works only for $\lambda<0$`, md`No solution: with $\lambda\ne0$ the $\ln s$ term cannot vanish at large $s$, so the far condition cannot hold`], 3,
        [md`$\lambda$ is given, and it forces a $\ln s$ that the far condition forbids.`, md`The conditions are contradictory, not under-specified.`, md`Sign of $\lambda$ doesn't matter.`, null],
        md`Correct far condition: $V\to-E_0s\cos\phi-\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + C$. With $V(a) = 0$: $V = -E_0\left(s-\dfrac{a^2}{s}\right)\cos\phi-\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s}{a}$.`,
        { figHtml: fQ45 }),
      Q(md`Inner metal sphere: isolated with charge $Q$. Outer metal shell: held at $V_0$ by a battery. The region between and outside is empty. Is the field determined?`,
        [md`Yes, uniquely: each conductor has either its potential or its charge specified`, md`No: both conductors need their potentials`, md`No: both conductors need their charges`, md`Only between the conductors`], 0,
        [null, md`Mixing is allowed: a conductor with given charge contributes an equation in place of its unknown potential.`, md`Mixing is allowed. The battery's shell has its potential given instead.`, md`Outside is fixed too: $V = V_0b/r$.`],
        md`Uniqueness extends to mixed data: on each conductor give $V$ or $Q$. Here: between, $V = V_0 + \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1b\right)$; outside, $V = V_0b/r$.`,
        { figHtml: fQ46 }),
      RF(md`
        !!key Patterns to remember
            - At every surface: $V$ continuous, $\partial_nV$ jumps by $-\sigma/\varepsilon_0$; for a conductor $\sigma = -\varepsilon_0\partial_nV$ with $\hat{\mathbf n}$ out of the metal.
            - Origin or axis in the region kills the singular terms; infinity kills the growing ones, except what the applied field or (2-D) the net line charge demands.
            - Each conductor: $V$ given **or** charge given. Grounded = $V = 0$ with free charge. Isolated = unknown constant plus total charge.
            - Count: surviving constants = number of conditions, mode by mode.
            - Check a candidate with the five-point list; uniqueness does the rest.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 2 figures
  // =====================================================================================
  const fB1 = fShellSig(md`\sigma(\theta)=\,?`, 40);
  const fB2 = sph({
    layers: [{ k: 'mball', r: 45, lab: 'V_0', at: 135 }],
    extra: (f, cx, cy) => {
      f.field((X, Y) => { const x = X - cx, z = cy - Y; if (Math.hypot(x, z) < 62) return null; return [x, 2 * z]; }, [cx - 110, cy - 95, cx + 110, cy + 95], 7, 6, { len: 13, cls: 'dim', mag: true });
      f.label(cx + 130, cy - 6, md`\text{applied: } V\propto r^2P_2(\cos\theta)`, 'l', 'small');
    },
  });
  const fB3 = sph({ layers: [{ k: 'mball', r: 40, lab: 'Q', at: 90, gap: 6 }, { k: 'shell', r: 95, lab: 'V_0', at: 35 }], bat: 'V_0', rad: [[95, 330, 'b', 0.72, 'tr']], extra: (f, cx, cy) => { f.label(cx - 46, cy + 30, 'a', 'r', 'small'); f.label(cx, cy + 62, '\\text{isolated}', 'c', 'small accent'); } });
  const fB4 = sph({ layers: [{ k: 'mball', r: 32, lab: 'V_0', at: 90, gap: 6 }, { k: 'shell', r: 95, lab: 'V=0', at: 35 }], rad: [[95, 330, 'b', 0.72, 'tr']], gnd: true, extra: (f, cx, cy) => { f.label(cx - 38, cy + 26, 'a', 'r', 'small'); f.label(cx + 150, cy - 90, '\\text{end view}', 'l', 'small accent'); } });
  const fB5 = sph({ layers: [{ k: 'sig', r: 60, lab: md`\sigma_0\sin^2\theta`, at: 40, glyph: 'plus' }], rad: [[60, 205, 'R', 0.5, 't']], extra: (f, cx, cy) => { f.arrow(cx + 110, cy + 40, cx + 110, cy + 5, { cls: 'dim' }); f.label(cx + 110, cy + 1, 'z', 'b', 'small accent'); } });
  const fB6 = plates({ slab: [0, 0.5], slabLab: md`\rho_0`, L: 'V=0', R: 'V=0', ticks: [[0, '0'], [0.5, 'd/2'], [1, 'd']] });
  const fB7 = sph({ layers: [{ k: 'ball', r: 45, lab: md`\rho`, at: 90, gap: 6 }, { k: 'shell', r: 95, lab: 'V=0', at: 35 }], rad: [[95, 330, 'b', 0.72, 'tr']], gnd: true, extra: (f, cx, cy) => f.label(cx - 50, cy + 32, 'a', 'r', 'small') });
  const fB8 = sph({ layers: [{ k: 'sig', r: 45, lab: md`\sigma_0\cos\theta`, at: 90, gap: 6, glyph: 'cos' }, { k: 'shell', r: 95, lab: 'V=0', at: 35 }], rad: [[95, 330, 'b', 0.72, 'tr']], gnd: true, extra: (f, cx, cy) => f.label(cx - 50, cy + 32, 'a', 'r', 'small') });
  const fB9 = (() => {
    const f = fig(); const cx = 160, cy = 130, Rr = 55;
    f.circle(cx, cy, Rr, { cls: 'dash dim' });
    for (const th of [0, 30, 60, 90, 120, 150, 180]) for (const sgn of [1, -1]) {
      if ((th === 0 || th === 180) && sgn < 0) continue;
      const Er = 1 + 3 * Math.cos(th * D2R), ang = 90 - sgn * th, L = 9 * Er;
      const [x1, y1] = pol(cx, cy, Rr + 2, ang), [x2, y2] = pol(cx, cy, Rr + 2 + Math.max(L, 0), ang);
      if (L > 2) f.arrow(x1, y1, x2, y2);
      else if (L < -2) { const [x3, y3] = pol(cx, cy, Rr + 2 - L, ang); f.arrow(x3, y3, x1, y1); }
    }
    f.label(cx + 85, cy - 80, md`E_r(R^+,\theta)=E_0(1+3\cos\theta)`, 'l', 'small');
    f.label(cx, cy, md`\text{sources}`, 'c', 'small accent');
    f.dim(cx - Rr - 40, cy, cx - Rr - 40, cy - Rr, 'R', { at: 'l' });
    return f.svg();
  })();
  const fB10 = sph({ layers: [{ k: 'sig', r: 55, lab: md`\sigma_0\cos\phi`, at: 40, glyph: 'cos' }], E: 'right', rad: [[55, 210, 'a', 0.5, 't']] });
  const fB11 = sph({ layers: [{ k: 'mball', r: 30, lab: 'V_0', at: 90, gap: 5 }, { k: 'shell', r: 65, lab: 'Q', at: 45, gap: 5 }, { k: 'shell', r: 100, lab: 'V=0', at: 30 }], gnd: true, extra: (f, cx, cy) => { f.label(cx - 33, cy + 22, 'a', 'r', 'small'); f.label(cx - 64, cy + 36, 'b', 'r', 'small'); f.label(cx - 98, cy + 50, 'c', 'r', 'small'); } });
  const fB12 = (() => {
    const f = fig(); const cx = 160, cy = 130;
    f.hatchBand(f.arcPts(cx, cy, 70, 70, 0, 360).concat(f.arcPts(cx, cy, 32, 32, 360, 0)));
    f.circle(cx, cy, 70, { cls: 'thick' }); f.circle(cx, cy, 32, { cls: 'thick' });
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'b' });
    for (const x of [cx - 104, cx + 104]) f.arrow(x, cy + 55, x, cy - 55, { cls: 'dim' });
    f.label(cx + 112, cy - 47, md`\vb E_0`, 'l');
    f.dim(cx - 32, cy - 95, cx + 32, cy - 95, '2a', { at: 't' });
    f.dim(cx - 70, cy + 92, cx + 70, cy + 92, '2b', { at: 'b' });
    f.label(cx + 75, cy + 62, md`Q_{\rm metal}=0`, 'l', 'small');
    return f.svg();
  })();
  const fB13 = sph({ layers: [{ k: 'mball', r: 38, lab: 'V=0', at: 225, gap: 6 }, { k: 'sig', r: 85, lab: md`\sigma_0\cos\theta`, at: 40, glyph: 'cos' }], E: 'up', extra: (f, cx, cy) => { f.label(cx - 40, cy - 30, 'R', 'br', 'small'); f.label(cx - 62, cy - 62, 'b', 'br', 'small'); } });
  const fB14 = sph({ layers: [{ k: 'sig', r: 42, lab: md`\sigma_0\cos\theta`, at: 90, gap: 6, glyph: 'cos' }, { k: 'shell', r: 88, lab: md`Q=0`, at: 40 }], E: 'up', extra: (f, cx, cy) => { f.label(cx - 44, cy + 30, 'a', 'r', 'small'); f.label(cx - 66, cy + 72, 'b', 'tr', 'small'); } });
  // solution figures
  const fB6sol = PF.plot({ w: 340, h: 200, x: [0, 1.08], y: [0, 0.085], xl: 'x', yl: md`V\ \big[\rho_0d^2/\varepsilon_0\big]`, xt: [[0.375, '3d/8'], [0.5, 'd/2'], [1, 'd']], yt: [[0.0703, md`\tfrac{9}{128}`]],
    curves: [{ f: (x) => (x <= 0.5 ? -x * x / 2 + 3 * x / 8 : (1 - x) / 8), from: 0, to: 1 }], vlines: [[0.5, '']] });
  const fRegions = (o) => sph(Object.assign({ dot: false }, o));
  const fB8sol = fRegions({ layers: [{ k: 'sig', r: 45 }, { k: 'shell', r: 95 }], reg: [[0, -14, '\\text{I}'], [0, -70, '\\text{II}'], [118, -88, '\\text{outside: }V=0']] });
  const fB13sol = fRegions({ layers: [{ k: 'mball', r: 38 }, { k: 'sig', r: 85 }], reg: [[0, -62, '\\text{II}'], [118, -84, '\\text{III}']] });

  // =====================================================================================
  // Lesson 2: boundary-condition problems, Level 1 to 6
  // =====================================================================================
  const L2 = {
    id: 'uD-bc-problems', title: 'Boundary-value problems: write the conditions, then solve',
    steps: [
      R(md`
        Every problem here starts the same way: name the region(s), write the conditions as a numbered list (BC 1, BC 2, ...), say what each one does, then solve. Do it on paper before you open the hints. Levels 1–2 are short; the volume is in Levels 4–6.

        ### Level 1: recognize
      `),
      P({
        id: 'uD-bc-p1', title: 'Read the surface charge off a jump',
        q: md`A thin insulating shell of radius $R$ carries an unknown $\sigma(\theta)$. Someone measured the potential:
        $$V_{\rm in} = V_0\left(\frac{r}{R}\right)^2P_2(\cos\theta),\qquad V_{\rm out} = V_0\left(\frac{R}{r}\right)^3P_2(\cos\theta),$$
        with $P_2(x) = \tfrac12(3x^2-1)$. Find $\sigma(\theta)$ and the total charge.`,
        figHtml: fB1,
        hints: [md`Two facts hold at a charged insulating surface: continuity of $V$ and the jump in $\partial V/\partial r$. Check the first; the second gives $\sigma$.`, md`$\sigma = -\varepsilon_0\left(\partial_rV_{\rm out}-\partial_rV_{\rm in}\right)$ at $r = R$.`, md`The total charge is the $\ell = 0$ part of $\sigma$ times $4\pi R^2$.`],
        parts: [
          { lbl: md`Which list is complete for checking this pair of potentials?`, mc: [md`(1) $\nabla^2V = 0$ in each region; (2) $V_{\rm in}$ finite at 0; (3) $V_{\rm out}\to0$; (4) $V$ continuous at $R$`, md`(1) $\nabla^2V = 0$ in each region; (2) $V_{\rm in}$ finite at 0; (3) $V_{\rm out}\to0$; (4) $V$ continuous at $R$; (5) jump in $\partial_rV$ equals $-\sigma/\varepsilon_0$`, md`(1) $V(R) = 0$; (2) $V_{\rm out}\to0$`, md`(1) $\partial_rV$ continuous at $R$; (2) $V$ jumps by $\sigma R/\varepsilon_0$`], a: 1,
            why: [md`Missing the jump condition, which is what connects $V$ to $\sigma$.`, null, md`Nothing is grounded; $V(R) = V_0P_2$ is not zero.`, md`Swapped: $V$ is continuous and its derivative jumps.`] },
          { lbl: md`$\sigma$ at $\theta = 0$`, expr: '5*eps0*V0/R', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2] } },
          { lbl: md`$\sigma(\theta)$`, expr: '5*eps0*V0/(2*R)*(3*cos(theta)^2 - 1)', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2], theta: [0, 3] }, accepts: ['5*eps0*V0/R*(3*cos(theta)^2-1)/2'] },
          { lbl: 'Total charge on the shell', ans: 0, unit: '' },
        ],
        sol: md`
          **Region:** inside and outside the shell. **Conditions:** BC 1: Laplace in each region ($r^2P_2$ and $r^{-3}P_2$ are both harmonic, $\ell = 2$). BC 2: finite at 0. BC 3: $V\to0$. BC 4: continuity at $R$: both give $V_0P_2$. BC 5: the jump gives $\sigma$.

          $$\partial_rV_{\rm in}\big|_R = \frac{2V_0}{R}P_2,\qquad \partial_rV_{\rm out}\big|_R = -\frac{3V_0}{R}P_2$$

          $$\sigma = -\varepsilon_0\left(-\frac{3V_0}{R}-\frac{2V_0}{R}\right)P_2 = \frac{5\varepsilon_0V_0}{R}P_2(\cos\theta).$$

          At $\theta = 0$: $5\varepsilon_0V_0/R$. Total: $\int P_2\,d\Omega = 0$, so $Q = 0$.

          **Pattern:** for a pure $P_\ell$ shell, $\sigma_\ell = (2\ell+1)\varepsilon_0V_\ell/R$ where $V_\ell$ is the potential on the shell. The factor $2\ell+1 = \ell+(\ell+1)$ is the sum of the inside and outside slopes.
        `,
      }),
      P({
        id: 'uD-bc-p2', title: 'A metal sphere in a quadrupole field',
        q: md`A metal sphere of radius $R$ sits in an applied field whose potential near the sphere is $\beta r^2P_2(\cos\theta)$. Outside, the potential is
        $$V = \frac{V_0R}{r}+\beta\left(r^2-\frac{R^5}{r^3}\right)P_2(\cos\theta).$$
        (a) Check that it satisfies the conductor condition. (b) Find $\sigma$ at the pole and at the equator. (c) Find the sphere's total charge.`,
        figHtml: fB2,
        hints: [md`On a conductor $V$ is one constant; plug in $r = R$.`, md`$\sigma = -\varepsilon_0\,\partial V/\partial r$ at $r = R$; $P_2(1) = 1$ and $P_2(0) = -\tfrac12$.`, md`Only the $1/r$ term carries net charge.`],
        parts: [
          { lbl: md`$V(R,\theta)$`, mc: [md`$V_0+\beta R^2P_2$`, md`$0$`, md`$V_0P_2(\cos\theta)$`, md`$V_0$ for every $\theta$`], a: 3, why: [md`The $R^5/r^3$ term cancels $r^2$ at $r = R$.`, md`The $V_0R/r$ term gives $V_0$ there.`, md`$V_0$ multiplies the monopole term, not $P_2$.`, null] },
          { lbl: md`$\sigma$ at $\theta = 0$`, expr: 'eps0*V0/R - 5*eps0*beta*R', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2], beta: [0.1, 1] } },
          { lbl: md`$\sigma$ at $\theta = \pi/2$`, expr: 'eps0*V0/R + 5*eps0*beta*R/2', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2], beta: [0.1, 1] } },
          { lbl: 'Total charge', expr: '4*pi*eps0*R*V0', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2] } },
        ],
        sol: md`
          **Region** $r>R$. **BC 1:** $V(R,\theta) = $ const (conductor). **BC 2:** far away $V\to\beta r^2P_2$ (the applied part). The $\ell = 2$ pair $r^2-R^5/r^3$ vanishes at $R$, so BC 1 holds with $V = V_0$.

          $$\frac{\partial V}{\partial r}\Big|_R = -\frac{V_0}{R}+\beta\left(2R+\frac{3R^5}{R^4}\right)P_2 = -\frac{V_0}{R}+5\beta RP_2$$

          $$\sigma = \frac{\varepsilon_0V_0}{R}-5\varepsilon_0\beta R\,P_2(\cos\theta).$$

          Pole: $\dfrac{\varepsilon_0V_0}{R}-5\varepsilon_0\beta R$. Equator: $\dfrac{\varepsilon_0V_0}{R}+\dfrac52\varepsilon_0\beta R$. Total: only the uniform part integrates, $Q = 4\pi R^2\cdot\varepsilon_0V_0/R = 4\pi\varepsilon_0RV_0$.

          **Pattern:** a grounded sphere in $r^\ell P_\ell$ responds with $-R^{2\ell+1}/r^{\ell+1}$, and its induced $\sigma$ is $-(2\ell+1)\varepsilon_0\beta R^{\ell-1}P_\ell$. For $\ell = 1$ (uniform field, $\beta = -E_0$) this is the familiar $3\varepsilon_0E_0\cos\theta$.
        `,
      }),

      R(md`### Level 2: set up`),
      P({
        id: 'uD-bc-p3', title: 'An isolated sphere inside a shell held at V₀',
        q: md`A metal sphere of radius $a$ is isolated and carries charge $Q$. A thin concentric metal shell of radius $b$ is held at $V_0$ (relative to infinity) by a battery. Find $V(a)$, the charge on the **outer** face of the shell, and the shell's total charge.`,
        figHtml: fB3,
        hints: [md`Two regions: $a<r<b$ and $r>b$. In each, $V = A + B/r$.`, md`BCs: $V(b) = V_0$; $V\to0$ far away; flux through the inner sphere is $Q/\varepsilon_0$.`, md`Outside: $V = V_0b/r$. Its $1/r$ coefficient is the total charge enclosed by a sphere just outside $b$.`],
        parts: [
          { lbl: md`$V(a)$`, expr: 'V0 + Q/(4*pi*eps0)*(1/a - 1/b)', vars: { V0: [1, 3], Q: [0.5, 2], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 3] } },
          { lbl: md`Charge on the outer face of the shell`, expr: '4*pi*eps0*b*V0', vars: { V0: [1, 3], eps0: [0.5, 2], b: [1.5, 3] } },
          { lbl: md`Total charge on the shell`, expr: '4*pi*eps0*b*V0 - Q', vars: { V0: [1, 3], Q: [0.5, 2], eps0: [0.5, 2], b: [1.5, 3] } },
        ],
        sol: md`
          **Regions:** I ($a<r<b$), II ($r>b$).

          1. BC 1: $V(b) = V_0$ (battery).
          2. BC 2: $V\to0$ as $r\to\infty$ (kills $A$ in II).
          3. BC 3: $-\varepsilon_0\oint\partial_rV\,da = Q$ at $r = a$ (fixes $B$ in I).
          4. $V(a)$ is constant but unknown: an output.

          II: $V = V_0b/r$ (BC 1 and 2). I: $V = V_0+\dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1b\right)$ (BC 1 and 3). So
          $$V(a) = V_0+\frac{Q}{4\pi\varepsilon_0}\left(\frac1a-\frac1b\right).$$

          Charges: the inner face holds $-Q$ (Gauss in the metal). Outside, $V = V_0b/r$ means the total enclosed is $4\pi\varepsilon_0bV_0$; so the outer face holds $4\pi\varepsilon_0bV_0$ (the sphere's $Q$ and the inner face's $-Q$ cancel), and the shell in total holds $4\pi\varepsilon_0bV_0-Q$.

          **Check:** $V_0 = 0$ (grounded) gives the familiar $V(a) = \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$ and shell charge $-Q$.
        `,
      }),
      P({
        id: 'uD-bc-p4', title: 'Coaxial cylinders and the 2-D log',
        q: md`A long metal cylinder of radius $a$ is held at $V_0$; a coaxial metal pipe of radius $b$ is grounded. Find the charge per length $\lambda$ on the inner cylinder and the surface charge on the inner face of the pipe. Then say what happens as $b\to\infty$.`,
        figHtml: fB4,
        hints: [md`No $\phi$ dependence: $V = A_0 + B_0\ln s$.`, md`BC 1: $V(a) = V_0$. BC 2: $V(b) = 0$.`, md`$\lambda = 2\pi a\,\sigma(a)$ with $\sigma = -\varepsilon_0\partial V/\partial s$; on the pipe's inner face the normal is $-\hat{\mathbf s}$.`],
        parts: [
          { lbl: md`$\lambda$`, expr: '2*pi*eps0*V0/ln(b/a)', vars: { eps0: [0.5, 2], V0: [1, 3], a: [0.5, 1], b: [2, 4] } },
          { lbl: md`$\sigma$ on the pipe's inner face`, expr: '-eps0*V0/(b*ln(b/a))', vars: { eps0: [0.5, 2], V0: [1, 3], a: [0.5, 1], b: [2, 4] } },
          { lbl: md`As $b\to\infty$ with $V_0$ fixed, $\lambda$...`, mc: [md`tends to $2\pi\varepsilon_0V_0$`, md`grows without bound`, md`tends to zero like $1/\ln(b/a)$`, md`stays $2\pi\varepsilon_0V_0/\ln a$`], a: 2, why: [md`The log in the denominator keeps growing.`, md`The capacitance per length falls as the pipe recedes.`, null, md`A log of a dimensional quantity is meaningless; the argument is $b/a$.`] },
        ],
        sol: md`
          **Region** $a<s<b$. BC 1: $V(a) = V_0$. BC 2: $V(b) = 0$. Two constants, two conditions:
          $$V(s) = V_0\frac{\ln(b/s)}{\ln(b/a)}.$$

          Inner cylinder: $\sigma = -\varepsilon_0\partial_sV|_a = \dfrac{\varepsilon_0V_0}{a\ln(b/a)}$, so $\lambda = 2\pi a\sigma = \dfrac{2\pi\varepsilon_0V_0}{\ln(b/a)}$.

          Pipe's inner face: $\hat{\mathbf n} = -\hat{\mathbf s}$, so $\sigma = +\varepsilon_0\partial_sV|_b = -\dfrac{\varepsilon_0V_0}{b\ln(b/a)}$ (total $-\lambda$ per length, as Gauss requires).

          As $b\to\infty$, $\lambda\to0$. In 2-D, a fixed potential difference to a surface that recedes to infinity needs less and less charge, because the log potential of a line charge never stops falling.
        `,
      }),

      R(md`### Level 3: the standard cases`),
      P({
        id: 'uD-bc-p5', title: 'A shell with sin² θ',
        q: md`A thin insulating shell of radius $R$ carries $\sigma = \sigma_0\sin^2\theta$. Find $V$ at the center, $V$ inside on the $z$ axis, and $V$ outside in the equatorial plane.`,
        figHtml: fB5,
        hints: [md`Rewrite $\sin^2\theta$ in Legendre polynomials: $\sin^2\theta = \tfrac23-\tfrac23P_2(\cos\theta)$.`, md`For a shell with $\sigma_\ell P_\ell$: $V_{\rm in} = \dfrac{\sigma_\ell R}{(2\ell+1)\varepsilon_0}\left(\dfrac rR\right)^\ell P_\ell$ and $V_{\rm out} = \dfrac{\sigma_\ell R}{(2\ell+1)\varepsilon_0}\left(\dfrac Rr\right)^{\ell+1}P_\ell$.`, md`On the axis $P_2 = 1$; in the equatorial plane $P_2 = -\tfrac12$.`],
        parts: [
          { lbl: md`$V(0)$`, expr: '2*sigma0*R/(3*eps0)', vars: { sigma0: [1, 3], R: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`$V$ inside on the $+z$ axis at distance $r$`, expr: '2*sigma0*R/(3*eps0) - 2*sigma0*r^2/(15*eps0*R)', vars: { sigma0: [1, 3], R: [1, 2], r: [0.1, 0.9], eps0: [0.5, 2] } },
          { lbl: md`$V$ outside in the equatorial plane at distance $r$`, expr: '2*sigma0*R^2/(3*eps0*r) + sigma0*R^4/(15*eps0*r^3)', vars: { sigma0: [1, 3], R: [0.5, 1], r: [1.5, 3], eps0: [0.5, 2] } },
          { lbl: md`The field at the center is`, mc: [md`zero`, md`along $+\hat{\mathbf z}$`, md`along $-\hat{\mathbf z}$`, md`radial, of size $\sigma_0/\varepsilon_0$`], a: 0, why: [null, md`The $\ell = 2$ part has $\nabla(r^2P_2) = 0$ at the origin, and the $\ell = 0$ part is constant.`, md`Same: no $\ell = 1$ term, so no uniform field.`, md`A field at a single point has one direction; "radial" makes no sense at the origin.`] },
        ],
        sol: md`
          **Regions:** inside, outside. **BC 1:** finite at 0. **BC 2:** $V\to0$. **BC 3:** continuity at $R$. **BC 4:** $\partial_rV_{\rm out}-\partial_rV_{\rm in} = -\sigma/\varepsilon_0$. Per $\ell$, BC 1–2 leave one constant inside and one outside; BC 3–4 fix them.

          Expand: $\sigma = \tfrac23\sigma_0-\tfrac23\sigma_0P_2$, so $\sigma_0' = \tfrac23\sigma_0$ for $\ell = 0$ and $\sigma_2 = -\tfrac23\sigma_0$.

          $$V_{\rm in} = \frac{2\sigma_0R}{3\varepsilon_0}-\frac{2\sigma_0}{15\varepsilon_0R}r^2P_2,\qquad V_{\rm out} = \frac{2\sigma_0R^2}{3\varepsilon_0r}-\frac{2\sigma_0R^4}{15\varepsilon_0r^3}P_2.$$

          Center: $\dfrac{2\sigma_0R}{3\varepsilon_0}$. On the axis: $\dfrac{2\sigma_0R}{3\varepsilon_0}-\dfrac{2\sigma_0r^2}{15\varepsilon_0R}$. Equator ($P_2 = -\tfrac12$): $\dfrac{2\sigma_0R^2}{3\varepsilon_0r}+\dfrac{\sigma_0R^4}{15\varepsilon_0r^3}$.

          **Checks:** the center value is $\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{R}$ with $Q = \tfrac83\pi R^2\sigma_0$ (every charge is a distance $R$ from the center). $V$ inside is lower on the axis than at the center: charge sits near the equator, closer to equatorial points.
        `,
      }),
      P({
        id: 'uD-bc-p6', title: 'Charge in half of the gap',
        q: md`Two grounded plates at $x = 0$ and $x = d$. Charge density $\rho_0$ fills $0<x<d/2$; the rest of the gap is empty. Find $V(d/2)$, where $V$ is largest, and the surface charge on each plate.`,
        figHtml: fB6,
        hints: [md`Two regions with different equations: Poisson in $0<x<d/2$, Laplace in $d/2<x<d$.`, md`BC 1: $V(0) = 0$. BC 2: $V(d) = 0$. BC 3–4: $V$ and $V'$ continuous at $d/2$ (no surface charge there).`, md`Write $V_1 = -\dfrac{\rho_0x^2}{2\varepsilon_0}+Ax$ and $V_2 = C(d-x)$: BC 1 and 2 are built in.`],
        parts: [
          { lbl: md`$V(d/2)$`, expr: 'rho0*d^2/(16*eps0)', vars: { rho0: [1, 3], d: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`Position of the maximum, in units of $d$`, ans: 0.375, unit: 'd' },
          { lbl: md`$\sigma$ on the plate at $x = 0$`, expr: '-3*rho0*d/8', vars: { rho0: [1, 3], d: [0.5, 2] } },
          { lbl: md`$\sigma$ on the plate at $x = d$`, expr: '-rho0*d/8', vars: { rho0: [1, 3], d: [0.5, 2] } },
        ],
        sol: md`
          With BC 1 and 2 built in, BC 3 and 4 at $x = d/2$:
          $$-\frac{\rho_0d^2}{8\varepsilon_0}+\frac{Ad}{2} = \frac{Cd}{2},\qquad -\frac{\rho_0d}{2\varepsilon_0}+A = -C.$$
          Solving: $A = \dfrac{3\rho_0d}{8\varepsilon_0}$, $C = \dfrac{\rho_0d}{8\varepsilon_0}$. So $V(d/2) = \dfrac{\rho_0d^2}{16\varepsilon_0}$.

          Maximum: $V_1' = 0$ at $x = \dfrac{\varepsilon_0A}{\rho_0} = \dfrac{3d}{8}$, inside the charge (a max of $V$ needs charge there), with $V_{\max} = \dfrac{9\rho_0d^2}{128\varepsilon_0}$.

          [[fig:v]]

          Plates: at $x = 0$, $\hat{\mathbf n} = +\hat{\mathbf x}$: $\sigma = -\varepsilon_0V'(0) = -\dfrac{3\rho_0d}{8}$. At $x = d$, $\hat{\mathbf n} = -\hat{\mathbf x}$: $\sigma = +\varepsilon_0V'(d) = -\varepsilon_0C = -\dfrac{\rho_0d}{8}$.

          **Check:** total plate charge $-\dfrac{\rho_0d}{2}$ = minus the slab's charge per area. The nearer plate takes three times as much: the charge "sees" it better.
        `,
        figs: { v: { svg: fB6sol, cap: 'V(x): parabola in the charge, straight line in the empty half, smooth join at d/2, maximum at 3d/8.' } },
      }),
      P({
        id: 'uD-bc-p7', title: 'A ball of charge inside a grounded shell',
        q: md`A ball of radius $a$ with uniform $\rho$ sits at the center of a grounded thin metal shell of radius $b$. Find $V$ at the center and $\sigma$ on the shell. Then the ball is moved off center (still inside): what changes?`,
        figHtml: fB7,
        hints: [md`Spherical symmetry: get $E$ from Gauss, or solve Poisson inside and Laplace between, with BCs.`, md`BC 1: $V(b) = 0$. BC 2: finite at 0. BC 3–4: $V$ and $V'$ continuous at $r = a$.`, md`Between: $V = \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1b\right)$ with $Q = \tfrac43\pi a^3\rho$; inside add $\dfrac{\rho(a^2-r^2)}{6\varepsilon_0}$.`],
        parts: [
          { lbl: md`$V(0)$`, expr: 'rho*a^2/(2*eps0) - rho*a^3/(3*eps0*b)', vars: { rho: [1, 3], a: [0.5, 1], b: [1.5, 3], eps0: [0.5, 2] }, accepts: ['rho*a^2*(3*b-2*a)/(6*eps0*b)'] },
          { lbl: md`$\sigma$ on the shell (centered ball)`, expr: '-rho*a^3/(3*b^2)', vars: { rho: [1, 3], a: [0.5, 1], b: [1.5, 3] } },
          { lbl: md`Ball moved off center: which statement is right?`, mc: [md`The shell's total charge and the field outside the shell are unchanged; $\sigma$ on the shell becomes nonuniform`, md`Nothing changes anywhere, by uniqueness`, md`The shell's total charge changes, because the ball is closer to one side`, md`A field appears outside the shell`], a: 0, why: [null, md`Inside the shell the boundary is the same, but the charge has moved, so the inside field changes.`, md`Gauss on a surface just outside the shell: $E = 0$ there (grounded, nothing outside), so the shell holds exactly $-Q$.`, md`Outside, $V = 0$ satisfies everything (BC: $V = 0$ on the shell and at infinity, no charge): by uniqueness it stays zero.`] },
        ],
        sol: md`
          **Regions:** I $r<a$ (Poisson), II $a<r<b$ (Laplace). BC 1: $V(b) = 0$. BC 2: finite at 0. BC 3, 4: $V$, $V'$ continuous at $a$ (no surface charge).

          II: $V = \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1b\right) = \dfrac{\rho a^3}{3\varepsilon_0}\left(\dfrac1r-\dfrac1b\right)$. I: $V = V(a)+\dfrac{\rho(a^2-r^2)}{6\varepsilon_0}$ (the particular solution $-\rho r^2/(6\varepsilon_0)$ plus a constant; its slope at $a$, $-\rho a/(3\varepsilon_0)$, matches region II's).

          $$V(0) = \frac{\rho a^2}{3\varepsilon_0}-\frac{\rho a^3}{3\varepsilon_0b}+\frac{\rho a^2}{6\varepsilon_0} = \frac{\rho a^2}{2\varepsilon_0}-\frac{\rho a^3}{3\varepsilon_0b}.$$

          Shell: $\hat{\mathbf n} = -\hat{\mathbf r}$, $\sigma = \varepsilon_0\partial_rV|_b = -\dfrac{\rho a^3}{3b^2}$ (total $-Q$).

          **Off center:** outside the shell, $V = 0$ still meets every condition, so it is the answer: no field outside, and Gauss then fixes the shell's total at $-Q$. Inside, the source moved, so $V$ and the shell's $\sigma$ change (more charge on the near side).
        `,
      }),

      R(md`### Level 4: one twist`),
      P({
        id: 'uD-bc-p8', title: 'A cosine shell inside a grounded shell',
        q: md`An insulating shell of radius $a$ carries $\sigma_0\cos\theta$. It sits at the center of a grounded thin metal shell of radius $b$. Find $V$ inside $r<a$, the surface charge on the metal shell, and check the limit $b\to\infty$.`,
        figHtml: fB8,
        hints: [md`Only $\ell = 1$. Regions: I ($r<a$): $Ar\cos\theta$. II ($a<r<b$): build $V(b) = 0$ in.`, md`II: $B\left(r-\dfrac{b^3}{r^2}\right)\cos\theta$. Now continuity and the jump at $a$ give $A$ and $B$.`, md`On the metal's inner face the normal is $-\hat{\mathbf r}$: $\sigma_b = +\varepsilon_0\partial_rV|_b$.`],
        parts: [
          { lbl: md`$A$ in $V_{\rm I} = Ar\cos\theta$`, expr: 'sigma0/(3*eps0)*(1 - a^3/b^3)', vars: { sigma0: [1, 3], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 3] } },
          { lbl: md`$\sigma_b$ at $\theta = 0$`, expr: '-sigma0*a^3/b^3', vars: { sigma0: [1, 3], a: [0.5, 1], b: [1.5, 3] } },
          { lbl: md`Total charge on the metal shell`, ans: 0, unit: '' },
          { lbl: md`As $b\to\infty$, $A\to$`, mc: [md`$0$`, md`$\sigma_0/\varepsilon_0$`, md`$\sigma_0/(3\varepsilon_0)$, the isolated shell's value`, md`$\sigma_0/(2\varepsilon_0)$`], a: 2, why: [md`The grounded shell only reduces the inside field, by the factor $1-a^3/b^3$.`, md`That would be the full jump on one side only.`, null, md`That is the cylinder's factor.`] },
        ],
        sol: md`
          [[fig:reg]]

          **BCs:** 1. $V_{\rm I}$ finite at 0. 2. $V(b) = 0$. 3. $V$ continuous at $a$. 4. $\partial_rV_{\rm II}-\partial_rV_{\rm I} = -\dfrac{\sigma_0}{\varepsilon_0}\cos\theta$ at $a$. Three constants ($A$, and two in II), three conditions after BC 1.

          With BC 2 built in, BC 3: $Aa = B\left(a-\dfrac{b^3}{a^2}\right)$, so $A = B\left(1-\dfrac{b^3}{a^3}\right)$. BC 4: $B\left(1+\dfrac{2b^3}{a^3}\right)-A = \dfrac{3Bb^3}{a^3} = -\dfrac{\sigma_0}{\varepsilon_0}$.

          $$B = -\frac{\sigma_0a^3}{3\varepsilon_0b^3},\qquad A = \frac{\sigma_0}{3\varepsilon_0}\left(1-\frac{a^3}{b^3}\right).$$

          Metal: $\sigma_b = \varepsilon_0\partial_rV_{\rm II}|_b = 3\varepsilon_0B\cos\theta = -\dfrac{\sigma_0a^3}{b^3}\cos\theta$. Total 0 (pure $\cos\theta$), so no charge flows from ground.

          **Checks:** $b\to\infty$: $A\to\sigma_0/(3\varepsilon_0)$, the bare shell. A shell carrying $\sigma_1\cos\theta$ has dipole moment $\tfrac43\pi R^3\sigma_1$, so the metal's dipole is $\tfrac43\pi b^3\left(-\dfrac{\sigma_0a^3}{b^3}\right) = -\tfrac43\pi a^3\sigma_0$: it exactly cancels the inner dipole, which is why the field outside $b$ is zero.
        `,
        figs: { reg: { svg: fB8sol, cap: 'Regions: I inside the charged shell, II between; outside the grounded shell V = 0.' } },
      }),
      P({
        id: 'uD-bc-p9', title: 'A Neumann problem: the field on a sphere is measured',
        q: md`Just outside an imaginary sphere of radius $R$, the radial field is measured to be $E_r = E_0(1+3\cos\theta)$. All charges are inside the sphere; outside is empty and $V\to0$ far away. Find the charge inside, its dipole moment, and $V$ outside on the $+z$ axis.`,
        figHtml: fB9,
        hints: [md`Outside: $V = \sum B_\ell r^{-(\ell+1)}P_\ell$ (BC: $V\to0$).`, md`The data are Neumann: $-\partial_rV = E_0(1+3P_1)$ at $r = R$. Match term by term.`, md`$B_0 = \dfrac{Q}{4\pi\varepsilon_0}$ and $B_1 = \dfrac{p}{4\pi\varepsilon_0}$.`],
        parts: [
          { lbl: md`Total charge inside`, expr: '4*pi*eps0*E0*R^2', vars: { eps0: [0.5, 2], E0: [1, 3], R: [0.5, 2] } },
          { lbl: md`Dipole moment $p$`, expr: '6*pi*eps0*E0*R^3', vars: { eps0: [0.5, 2], E0: [1, 3], R: [0.5, 2] } },
          { lbl: md`$V$ on the $+z$ axis at $r>R$`, expr: 'E0*R^2/r + 3*E0*R^3/(2*r^2)', vars: { E0: [1, 3], R: [0.5, 1], r: [1.5, 3] } },
          { lbl: md`Could the same $E_r$ data on the sphere describe a field with **no** charge inside?`, mc: [md`Yes, with $V = $ const $+$ a dipole term`, md`No: the flux $\oint E_r\,da = 4\pi R^2E_0\ne0$`, md`Yes, if $V$ is fixed only up to a constant`, md`Only if $E_0<0$`], a: 1, why: [md`The $\ell = 0$ part of the data has nonzero flux; no charge-free interior can produce it.`, null, md`The constant is not the problem; Gauss's law is.`, md`The sign of $E_0$ does not make the flux vanish.`] },
        ],
        sol: md`
          **Region** $r>R$. BC 1: $V\to0$ (kills $r^\ell$). BC 2 (Neumann): $-\partial_rV(R,\theta) = E_0+3E_0P_1(\cos\theta)$.

          $-\partial_r(B_\ell r^{-(\ell+1)}) = (\ell+1)B_\ell R^{-(\ell+2)}$ at $R$. So $B_0/R^2 = E_0$, $2B_1/R^3 = 3E_0$:
          $$V = \frac{E_0R^2}{r}+\frac{3E_0R^3}{2}\frac{\cos\theta}{r^2}.$$

          $Q = 4\pi\varepsilon_0B_0 = 4\pi\varepsilon_0E_0R^2$ (Gauss directly: flux $= 4\pi R^2E_0$). $p = 4\pi\varepsilon_0B_1 = 6\pi\varepsilon_0E_0R^3$. On the axis: $\dfrac{E_0R^2}{r}+\dfrac{3E_0R^3}{2r^2}$.

          **Why it is unique here:** Neumann data fix $V$ up to a constant, and BC 1 fixes the constant. **Why the interior version fails:** a charge-free region needs zero net flux.
        `,
      }),

      R(md`### Level 5: exam level`),
      P({
        id: 'uD-bc-p10', title: 'A cosine-charged cylinder in a transverse field',
        q: md`A long insulating cylindrical shell of radius $a$ carries $\sigma = \sigma_0\cos\phi$ and sits in a uniform field $E_0\hat{\mathbf x}$ (perpendicular to its axis). Find the field inside, the value of $\sigma_0$ that makes it vanish, and $V$ outside along $\phi = 0$.`,
        figHtml: fB10,
        hints: [md`2-D, $n = 1$ only. Inside: $As\cos\phi$. Outside: $-E_0s\cos\phi+\dfrac{B\cos\phi}{s}$.`, md`BCs at $s = a$: continuity, and $\partial_sV_{\rm out}-\partial_sV_{\rm in} = -\dfrac{\sigma_0\cos\phi}{\varepsilon_0}$.`, md`$V_{\rm in} = Ax$ means $E_x = -A$.`],
        parts: [
          { lbl: md`$E_x$ inside`, expr: 'E0 - sigma0/(2*eps0)', vars: { E0: [1, 3], sigma0: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`$\sigma_0$ that makes the inside field zero`, expr: '2*eps0*E0', vars: { E0: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`$V_{\rm out}(s,\phi = 0)$`, expr: '-E0*s + sigma0*a^2/(2*eps0*s)', vars: { E0: [1, 3], sigma0: [1, 3], eps0: [0.5, 2], a: [0.5, 1], s: [1.5, 3] } },
          { lbl: md`With that $\sigma_0$, the outside potential equals that of...`, mc: [md`a bare uniform field`, md`a line dipole only`, md`a grounded metal cylinder of radius $a$ in $E_0\hat{\mathbf x}$`, md`a charged metal cylinder with $\lambda = 2\pi a\varepsilon_0E_0$`], a: 2, why: [md`The shell's own field is still there outside.`, md`The applied field is still there.`, null, md`$\sigma_0\cos\phi$ has zero net charge per length.`] },
        ],
        sol: md`
          **BCs:** 1. finite on the axis (kills $s^{-1}$ inside). 2. $V\to-E_0s\cos\phi$ far away (no $\ln s$: the shell is neutral). 3. continuity at $a$. 4. the jump at $a$.

          BC 3: $Aa = -E_0a+B/a$. BC 4: $\left(-E_0-\dfrac{B}{a^2}\right)-A = -\dfrac{\sigma_0}{\varepsilon_0}$. Adding: $-2A-2E_0 = -\sigma_0/\varepsilon_0$, so
          $$A = \frac{\sigma_0}{2\varepsilon_0}-E_0,\qquad B = \frac{\sigma_0a^2}{2\varepsilon_0}.$$

          Inside $V = Ax$, so $E_x = E_0-\dfrac{\sigma_0}{2\varepsilon_0}$: the applied field minus the shell's own uniform field. It vanishes for $\sigma_0 = 2\varepsilon_0E_0$.

          Outside on $\phi = 0$: $-E_0s+\dfrac{\sigma_0a^2}{2\varepsilon_0s}$. With $\sigma_0 = 2\varepsilon_0E_0$: $-E_0\left(s-\dfrac{a^2}{s}\right)\cos\phi$, the grounded-cylinder solution. That is uniqueness: same outside conditions (zero inside field means the surface $s = a$ is an equipotential at 0), same outside solution. Indeed a metal cylinder in $E_0$ carries $\sigma = 2\varepsilon_0E_0\cos\phi$.
        `,
      }),
      P({
        id: 'uD-bc-p11', title: 'Three nested conductors',
        q: md`Three concentric conductors: a metal sphere of radius $a$ held at $V_0$ (by a thin insulated wire through tiny holes); a thin isolated shell of radius $b$ with charge $Q$; a thin grounded shell of radius $c$. Find the charge $q_a$ on the sphere, the potential $V_b$ of the middle shell, and the charge on each face.`,
        figHtml: fB11,
        hints: [md`Unknowns: $q_a$ and $V_b$. Each gap has $V = A + B/r$.`, md`Gap $a$–$b$: $V_0-V_b = \dfrac{q_a}{4\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$. Gap $b$–$c$ encloses $q_a+Q$: $V_b = \dfrac{q_a+Q}{4\pi\varepsilon_0}\left(\dfrac1b-\dfrac1c\right)$.`, md`Add the two equations to eliminate $V_b$.`],
        parts: [
          { lbl: md`$q_a$`, expr: '(4*pi*eps0*V0 - Q*(1/b - 1/c))/(1/a - 1/c)', vars: { V0: [1, 3], Q: [0.5, 2], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 2.5], c: [3, 4] }, accepts: ['a*c*(4*pi*eps0*V0 - Q*(c-b)/(b*c))/(c-a)'] },
          { lbl: md`$V_b$`, expr: '(V0*(1/b - 1/c) + Q*(1/a - 1/b)*(1/b - 1/c)/(4*pi*eps0))/(1/a - 1/c)', vars: { V0: [1, 3], Q: [0.5, 2], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 2.5], c: [3, 4] } },
          { lbl: md`Charge on the inner face of the outer shell ($r = c$)`, expr: '-((4*pi*eps0*V0 - Q*(1/b - 1/c))/(1/a - 1/c) + Q)', vars: { V0: [1, 3], Q: [0.5, 2], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 2.5], c: [3, 4] } },
          { lbl: md`Charge on the outer face of the grounded shell`, ans: 0, unit: '' },
        ],
        sol: md`
          **BCs:** 1. $V(a) = V_0$. 2. $V(b) = V_b$ (unknown) with total charge $Q$ on the shell. 3. $V(c) = 0$. 4. $V\to0$ far away. Outside $c$: $V = 0$ satisfies BC 3–4 with no charge, so the field there is zero.

          Gap equations (from the hints), added:
          $$V_0 = \frac{q_a}{4\pi\varepsilon_0}\left(\frac1a-\frac1c\right)+\frac{Q}{4\pi\varepsilon_0}\left(\frac1b-\frac1c\right)\ \Rightarrow\ q_a = \frac{4\pi\varepsilon_0V_0-Q\left(\frac1b-\frac1c\right)}{\frac1a-\frac1c}.$$

          Then $V_b = \dfrac{q_a+Q}{4\pi\varepsilon_0}\left(\dfrac1b-\dfrac1c\right)$, which simplifies to the listed form.

          Faces (Gauss inside each metal): sphere $q_a$; shell $b$ inner $-q_a$, outer $q_a+Q$; shell $c$ inner $-(q_a+Q)$, outer $0$.

          **Check:** $Q = 0$ makes $b$ invisible: $q_a = \dfrac{4\pi\varepsilon_0V_0}{1/a-1/c}$, the capacitor $a$–$c$.
        `,
      }),
      P({
        id: 'uD-bc-p12', title: 'A charge in a cavity of a neutral ball, in a field',
        q: md`A neutral metal ball of radius $b$ has a concentric spherical cavity of radius $a$ with a point charge $q$ at its center. The ball sits in a uniform field $E_0\hat{\mathbf z}$. Find the ball's potential, $\sigma$ on the cavity wall, $\sigma$ on the outer surface, and the smallest $q$ for which the outer surface has no negative charge anywhere.`,
        figHtml: fB12,
        hints: [md`Two independent regions: the cavity and the outside. The metal separates them.`, md`Outside: grounded-sphere field solution plus the $\ell = 0$ term from the net charge on the outer surface. Which net charge? Neutral ball, $-q$ on the cavity wall.`, md`$V_{\rm metal} = V_{\rm out}(b)$; the field part vanishes there.`],
        parts: [
          { lbl: md`Potential of the metal`, expr: 'q/(4*pi*eps0*b)', vars: { q: [1, 3], eps0: [0.5, 2], b: [1, 2] } },
          { lbl: md`$\sigma$ on the cavity wall`, expr: '-q/(4*pi*a^2)', vars: { q: [1, 3], a: [0.5, 1] } },
          { lbl: md`$\sigma$ on the outer surface, $\sigma(\theta)$`, expr: '3*eps0*E0*cos(theta) + q/(4*pi*b^2)', vars: { eps0: [0.5, 2], E0: [1, 3], q: [1, 3], b: [1, 2], theta: [0, 3] } },
          { lbl: md`Smallest $q$ with $\sigma_{\rm outer}\ge0$ everywhere`, expr: '12*pi*eps0*E0*b^2', vars: { eps0: [0.5, 2], E0: [1, 3], b: [1, 2] } },
          { lbl: md`If $q$ is moved off center inside the cavity, which quantity changes?`, mc: [md`the metal's potential`, md`$\sigma$ on the outer surface`, md`the field outside`, md`only $\sigma$ on the cavity wall`], a: 3, why: [md`The outside problem has the same conditions, so its solution, including $V$ on the metal, is unchanged.`, md`The outer surface sees only an equipotential carrying $+q$ in the field $E_0$: unchanged.`, md`Same as above: uniqueness for the outside region.`, null] },
        ],
        sol: md`
          **Cavity region:** BC: $V = V_m$ on $r = a$, a point charge at the center. **Outside region:** BC 1: $V = V_m$ on $r = b$; BC 2: total charge on the outer surface $= +q$ (neutral metal, $-q$ on the cavity wall); BC 3: $V\to-E_0r\cos\theta$.

          Outside: $V = -E_0\left(r-\dfrac{b^3}{r^2}\right)\cos\theta+\dfrac{q}{4\pi\varepsilon_0r}$, so $V_m = \dfrac{q}{4\pi\varepsilon_0b}$.

          Cavity: $V = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1a\right)+V_m$; wall: $\sigma = +\varepsilon_0\partial_rV|_a = -\dfrac{q}{4\pi a^2}$.

          Outer: $\sigma = -\varepsilon_0\partial_rV|_b = 3\varepsilon_0E_0\cos\theta+\dfrac{q}{4\pi b^2}$. The minimum is at $\theta = \pi$: nonnegative when $\dfrac{q}{4\pi b^2}\ge3\varepsilon_0E_0$, i.e. $q\ge12\pi\varepsilon_0E_0b^2$.

          **Why the regions decouple:** the metal is a constant-$V$ wall, and the only thing that passes through it is the total-charge bookkeeping.
        `,
      }),

      R(md`### Level 6: harder than the exam`),
      P({
        id: 'uD-bc-p13', title: 'A grounded sphere wrapped in a charged shell, in a field',
        q: md`A grounded metal sphere of radius $R$ sits in a uniform field $E_0\hat{\mathbf z}$. A concentric insulating shell of radius $b>R$ carries $\sigma_0\cos\theta$. Find $\sigma$ on the metal sphere, the value of $\sigma_0$ for which the sphere carries no charge at all, and the coefficient $C$ of $\cos\theta/r^2$ outside $b$.`,
        figHtml: fB13,
        hints: [md`$\ell = 1$ only. II ($R<r<b$): $A\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$. III ($r>b$): $\left(-E_0r+\dfrac{C}{r^2}\right)\cos\theta$.`, md`Two conditions at $b$ (continuity and jump) for two unknowns $A$, $C$.`, md`Add $2\times$(continuity$/b$) to the jump equation to eliminate $C$; $A$ comes out independent of $R$ and $b$.`],
        parts: [
          { lbl: md`$\sigma$ on the metal at $\theta = 0$`, expr: '3*eps0*E0 - sigma0', vars: { eps0: [0.5, 2], E0: [1, 3], sigma0: [1, 3] } },
          { lbl: md`$\sigma_0$ for which the metal carries no charge`, expr: '3*eps0*E0', vars: { eps0: [0.5, 2], E0: [1, 3] } },
          { lbl: md`$C$`, expr: 'E0*R^3 + sigma0*(b^3 - R^3)/(3*eps0)', vars: { E0: [1, 3], R: [0.5, 1], b: [1.5, 2.5], sigma0: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`For that $\sigma_0$, the field between the sphere and the shell is`, mc: [md`$E_0\hat{\mathbf z}$`, md`$3E_0\hat{\mathbf z}$`, md`zero`, md`a pure dipole field`], a: 2, why: [md`The shell's own inside field, $-\sigma_0/(3\varepsilon_0)\hat{\mathbf z} = -E_0\hat{\mathbf z}$, cancels the applied one.`, md`Wrong sign of the shell's contribution.`, null, md`With $A = 0$ there is nothing at all in region II.`] },
        ],
        sol: md`
          [[fig:reg]]

          **BCs:** 1. $V(R,\theta) = 0$ (built into II). 2. $V\to-E_0r\cos\theta$ (built into III). 3. continuity at $b$: $A\left(b-\dfrac{R^3}{b^2}\right) = -E_0b+\dfrac{C}{b^2}$. 4. jump at $b$: $\left(-E_0-\dfrac{2C}{b^3}\right)-A\left(1+\dfrac{2R^3}{b^3}\right) = -\dfrac{\sigma_0}{\varepsilon_0}$.

          Multiply BC 3 by $2/b$ and add to BC 4: the $C$ terms and the $R^3$ terms cancel, leaving $-3E_0-3A = -\sigma_0/\varepsilon_0$:
          $$A = \frac{\sigma_0}{3\varepsilon_0}-E_0,\qquad C = E_0R^3+\frac{\sigma_0(b^3-R^3)}{3\varepsilon_0}.$$

          Metal: $\sigma_R = -\varepsilon_0\partial_rV|_R = -3\varepsilon_0A\cos\theta = (3\varepsilon_0E_0-\sigma_0)\cos\theta$. Zero for $\sigma_0 = 3\varepsilon_0E_0$.

          **Interpretation:** inside a $\sigma_0\cos\theta$ shell the field is uniform, $-\dfrac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$. Choosing $\sigma_0 = 3\varepsilon_0E_0$ cancels $E_0$ in region II, so the sphere has nothing to respond to. The shell then *is* the induced charge a metal sphere of radius $b$ would carry. $C$ reads as two dipoles: the shell's own, $\dfrac{\sigma_0b^3}{3\varepsilon_0}$, plus the metal's response to the total field it feels in region II, $\left(E_0-\dfrac{\sigma_0}{3\varepsilon_0}\right)R^3$.
        `,
        figs: { reg: { svg: fB13sol, cap: 'Regions II (between metal and shell) and III (outside).' } },
      }),
      P({
        id: 'uD-bc-p14', title: 'Shielding both ways',
        q: md`An insulating shell of radius $a$ carries $\sigma_0\cos\theta$. It sits at the center of a thin metal shell of radius $b$ that is **isolated and neutral**. Everything is in a uniform field $E_0\hat{\mathbf z}$. Find the metal shell's potential, the field inside $r<a$, and the total surface charge (both faces) on the metal at $\theta = 0$.`,
        figHtml: fB14,
        hints: [md`Start outside. The metal is an equipotential with zero net charge in the field $E_0$: which solution meets these conditions?`, md`Outside: $-E_0(r-b^3/r^2)\cos\theta+V_m b/r$; zero net charge forces $V_m = 0$.`, md`With $V_m = 0$, the inside problem is exactly the cosine shell inside a **grounded** shell (Level 4).`],
        parts: [
          { lbl: md`Potential of the metal shell`, ans: 0, unit: '' },
          { lbl: md`$E_z$ inside $r<a$`, expr: '-sigma0/(3*eps0)*(1 - a^3/b^3)', vars: { sigma0: [1, 3], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 3] } },
          { lbl: md`Total $\sigma$ on the metal (inner + outer face) at $\theta = 0$`, expr: '3*eps0*E0 - sigma0*a^3/b^3', vars: { eps0: [0.5, 2], E0: [1, 3], sigma0: [1, 3], a: [0.5, 1], b: [1.5, 3] } },
          { lbl: md`If the metal shell instead carried net charge $Q$, the field inside $r<a$ would`, mc: [md`gain a radial part $Q/(4\pi\varepsilon_0r^2)$`, md`be unchanged; only $V$ shifts by a constant`, md`vanish`, md`gain $E_0$`], a: 1, why: [md`Charge on a closed metal shell produces no field inside it.`, null, md`The inner shell's own field is still there.`, md`The metal screens the applied field from the inside.`] },
        ],
        sol: md`
          **Outside region** ($r>b$): BC 1: $V = V_m$ on $r = b$. BC 2: total charge on the metal is 0, and the inner shell's $\sigma_0\cos\theta$ is also neutral, so no net charge is enclosed. BC 3: $V\to-E_0r\cos\theta$. The $\ell = 0$ term $V_mb/r$ carries charge $4\pi\varepsilon_0bV_m = 0$, so $V_m = 0$ and $V_{\rm out} = -E_0\left(r-\dfrac{b^3}{r^2}\right)\cos\theta$.

          **Inside regions:** the metal at $V = 0$ is exactly the grounded case. From the Level 4 problem, $V_{\rm I} = \dfrac{\sigma_0}{3\varepsilon_0}\left(1-\dfrac{a^3}{b^3}\right)r\cos\theta$, so $E_z = -\dfrac{\sigma_0}{3\varepsilon_0}\left(1-\dfrac{a^3}{b^3}\right)$, independent of $E_0$.

          Faces: outer $3\varepsilon_0E_0\cos\theta$ (from $V_{\rm out}$); inner $-\dfrac{\sigma_0a^3}{b^3}\cos\theta$. At $\theta = 0$: $3\varepsilon_0E_0-\dfrac{\sigma_0a^3}{b^3}$.

          **The lesson:** a closed conductor splits space into independent problems. Outside does not see the inner dipole (it is cancelled by the inner face); inside does not see $E_0$ (cancelled by the outer face). Net charge $Q$ would add $\dfrac{Q}{4\pi\varepsilon_0r}$ outside and a constant inside.
        `,
      }),
      RF(md`
        !!key Patterns to remember
            - Build the easy conditions into the form: $r^\ell-\dfrac{b^{2\ell+1}}{r^{\ell+1}}$ vanishes at $b$; $s-\dfrac{a^2}{s}$ vanishes at $a$.
            - A pure-$P_\ell$ shell: $V_{\rm on} = \dfrac{\sigma_\ell R}{(2\ell+1)\varepsilon_0}$; inside field of $\sigma_0\cos\theta$ is $-\dfrac{\sigma_0}{3\varepsilon_0}\hat{\mathbf z}$; cylinder $\sigma_0\cos\phi$ gives $-\dfrac{\sigma_0}{2\varepsilon_0}\hat{\mathbf x}$.
            - Inner faces: $\hat{\mathbf n} = -\hat{\mathbf r}$, so $\sigma = +\varepsilon_0\partial_rV$.
            - Closed conductors decouple regions; only total charge crosses.
            - Neumann data: unique up to a constant, and the flux must match the enclosed charge.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 3 figures
  // =====================================================================================
  const twoBalls = (o = {}) => {
    const f = fig();
    const r1b = o.r1 || 30, r2b = o.r2 || 30, x1 = 80, x2 = 250, y = 90;
    f.hatchBand(f.arcPts(x1, y, r1b, r1b, 0, 360)); f.circle(x1, y, r1b, { cls: 'thick' });
    f.hatchBand(f.arcPts(x2, y, r2b, r2b, 0, 360)); f.circle(x2, y, r2b, { cls: 'thick' });
    f.label(x1, y - r1b - 8, o.l1 || 'Q', 'b'); f.label(x2, y - r2b - 8, o.l2 || '0', 'b');
    // wire with an open switch
    const ya = y + Math.max(r1b, r2b) + 26;
    f.line(x1, y + r1b, x1, ya); f.line(x2, y + r2b, x2, ya);
    f.line(x1, ya, 150, ya); f.line(180, ya, x2, ya); f.line(150, ya, 176, ya - 12);
    f.dot(150, ya, 2.2); f.dot(180, ya, 2.2);
    f.text(165, ya + 10, 'switch', 't');
    if (o.rl) { f.label(x1 - r1b - 6, y, o.rl[0], 'r', 'small'); f.label(x2 + r2b + 6, y, o.rl[1], 'l', 'small'); }
    return f.svg();
  };
  const fE1 = (() => { const f = fig(); f.charge(70, 60, { q: '+', lab: 'q_1', at: 'l' }); f.charge(150, 130, { q: '-', lab: 'q_2', at: 'b' }); tint(f, f.arcPts(260, 80, 32, 32, 0, 360)); f.circle(260, 80, 32); f.label(260, 80, md`\rho`, 'c'); f.label(300, 40, md`\text{ball}`, 'l', 'small accent'); return f.svg(); })();
  const fE2 = charges({ q: [[90, 80, '+', '+q', 'l'], [230, 80, '-', '-q', 'r']], dims: [[90, 110, 230, 110, 'd', { at: 'b' }]] });
  const fE3 = sph({ layers: [{ k: 'mball', r: 50, lab: 'Q', at: 45 }], rad: [[50, 200, 'R', 1.0, 'l']], dot: false });
  const fE4 = (() => { const f = fig(); f.charge(80, 120, { q: '+', lab: 'Q', at: 'l' }); f.pl([[200, 50], [250, 75], [260, 120], [230, 150]], { cls: 'dash dim', arrow: 'end' }); f.charge(200, 50, { q: '+', lab: 'q\\text{ at }A', at: 'l' }); f.dot(230, 150, 2.6); f.tag(230, 150, 'B', 'b', 6); return f.svg(); })();
  const fE5 = sph({ layers: [{ k: 'sig', r: 40, lab: 'Q_1', at: 90, gap: 6 }, { k: 'sig', r: 90, lab: 'Q_2', at: 40 }], extra: (f, cx, cy) => { f.label(cx - 44, cy + 26, 'a', 'r', 'small'); f.label(cx - 78, cy + 54, 'b', 'tr', 'small'); } });
  const fE6 = charges({ q: [[90, 140, '+', 'q_1', 'l'], [230, 140, '+', 'q_2', 'r'], [160, 40, '-', 'q_3', 'r']], lines: [[90, 140, 230, 140], [90, 140, 160, 40], [230, 140, 160, 40]] });
  const fShellQ = (lab = 'Q', o = {}) => sph(Object.assign({ layers: [{ k: 'sig', r: 55, lab, at: 45 }], rad: [[55, 210, 'R', 0.5, 't']] }, o));
  const fE7 = fShellQ();
  const fE8 = sph({ layers: [{ k: 'mball', r: 50, lab: md`Q\to2Q`, at: 45 }], extra: (f, cx, cy) => f.label(cx, cy + 66, '\\text{isolated}', 't', 'small accent') });
  const ballQ = (lab = 'Q') => sph({ layers: [{ k: 'ball', r: 50, lab, at: 45 }], rad: [[50, 210, 'R', 0.5, 't']] });
  const fE9 = PF.row([{ svg: ballQ(md`Q\ \text{(uniform ball)}`), cap: 'ball' }, { svg: fShellQ(md`Q\ \text{(shell)}`), cap: 'shell' }]).svg;
  const fE10 = ballQ();
  const fE11 = sph({ layers: [{ k: 'sig', r: 45, lab: 'Q', at: 90, gap: 6 }, { k: 'dash', r: 90, lab: md`r=2R`, at: 40 }], extra: (f, cx, cy) => f.label(cx - 48, cy + 26, 'R', 'r', 'small') });
  const fE12 = fE5;
  const fE13 = cap({ top: '+Q', bot: '-Q', bat: 'V_0', area: md`\text{area }A` });
  const fE14 = sph({ layers: [{ k: 'mball', r: 50, lab: md`\sigma<0`, at: 135 }], extra: (f, cx, cy) => { for (const a of [30, 90, 150, 210, 270, 330]) { const [x1, y1] = pol(cx, cy, 52, a), [x2, y2] = pol(cx, cy, 72, a); f.line(x1, y1, x2, y2, { cls: 'dash dim' }); } f.label(cx + 80, cy - 80, md`\text{force on each patch?}`, 'l', 'small'); } });
  const fE15 = cap({ top: '+Q', bot: '-Q', area: md`\text{area }A` });
  const fE16 = planeFig({ q: [[150, 70, '+', 'q', 'l']], dims: [[150, 70, 150, 150, 'd', { off: -40, at: 'r' }]] });
  const fE17 = planeFig({ q: [[150, 90, '+', 'q', 'l']], dims: [[150, 90, 150, 150, 'd', { off: -40, at: 'r' }]], extra: (f) => { f.line(150, 20, 150, 80, { cls: 'dash dim', arrow: 'end' }); f.text(158, 22, 'from far away', 'l'); } });
  const fE18 = sph({ layers: [{ k: 'mball', r: 45, lab: 'V=0', at: 225 }], q: [[125, 0, '+', 'q', 'r']], gnd: true, extra: (f, cx, cy) => { f.dim(cx, cy - 62, cx + 125, cy - 62, 'a', { at: 't' }); f.line(cx, cy - 47, cx, cy - 66, { cls: 'dim thin' }); f.line(cx + 125, cy - 9, cx + 125, cy - 66, { cls: 'dim thin' }); } });
  const fE19 = twoBalls({ l1: 'Q', l2: '0', rl: ['R', 'R'] });
  const fE20 = cap({ top: '+Q', bot: '-Q', bat: 'V_0', x: md`x\to2x`, F: true });
  const fE21 = (() => { const f = fig(); f.charge(150, 90, { q: '+', lab: 'q', at: 'tr' }); f.circle(150, 90, 48, { cls: 'dash dim' }); f.dim(150, 90, 150, 138, md`\epsilon`, { at: 'r' }); f.label(200, 150, md`\text{field energy inside } r<\epsilon\,?`, 'l', 'small'); return f.svg(); })();
  const fE22 = fE2;
  const fE23 = sph({ layers: [{ k: 'sig', r: 40, lab: 'Q', at: 90, gap: 6 }, { k: 'shell', r: 90, lab: md`Q=0`, at: 40 }], extra: (f, cx, cy) => { f.label(cx - 44, cy + 26, 'a', 'r', 'small'); f.label(cx - 70, cy + 72, 'b', 'tr', 'small'); f.line(cx, cy + 96, cx, cy + 110); f.line(cx, cy + 110, cx + 14, cy + 100); f.line(cx + 18, cy + 112, cx + 18, cy + 122); f.ground(cx + 18, cy + 122); f.text(cx + 30, cy + 106, 'switch to ground', 'l'); } });
  const fE24 = sph({ layers: [{ k: 'mball', r: 32, lab: 'Q', at: 90, gap: 5 }, { k: 'thick', r: 64, r2: 96, lab: md`\text{neutral}`, at: 40 }], rad: [[64, 205, 'b', 0.75, 't'], [96, 320, 'c', 1.0, 'br']], extra: (f, cx, cy) => f.label(cx - 38, cy - 8, 'a', 'r', 'small') });
  const fE25 = sph({ layers: [{ k: 'sig', r: 55 }], extra: (f, cx, cy) => { f.label(cx, cy, 'Q', 'c'); f.circle(cx, cy, 70, { cls: 'dash dim' }); f.arrow(cx + 39, cy - 39, cx + 52, cy - 52, { cls: 'dim' }); f.label(cx + 60, cy - 58, md`R\to R+dR`, 'bl', 'small'); } });
  const fE26 = sph({ layers: [{ k: 'mball', r: 45, lab: 'R', at: 100 }], bat: 'V_0', extra: (f, cx, cy) => { for (const a of [20, 160]) { const [x1, y1] = pol(cx, cy, 49, a), [x2, y2] = pol(cx, cy, 68, a); f.arrow(x1, y1, x2, y2, { cls: 'dim' }); } f.label(cx + 75, cy - 40, md`\text{expands}`, 'bl', 'small accent'); } });
  const fE27 = sph({ layers: [{ k: 'shell', r: 42, r2: 46, lab: 'Q', at: 135, gap: 6 }, { k: 'dash', r: 88, lab: md`2R`, at: 40 }], extra: (f, cx, cy) => f.label(cx + 32, cy + 50, 'R', 'tl', 'small') });
  const wireShells = (la, lb) => sph({ layers: [{ k: 'shell', r: 40, lab: la, at: 135, gap: 6 }, { k: 'shell', r: 90, lab: lb, at: 40 }], extra: (f, cx, cy) => { f.line(cx + 46, cy, cx + 90, cy, { cls: 'thick dash' }); f.label(cx + 68, cy + 6, '\\text{wire}', 't', 'small accent'); f.label(cx - 30, cy + 40, 'a', 'tr', 'small'); f.label(cx - 68, cy + 76, 'b', 'tr', 'small'); } });
  const fE28 = wireShells('+Q', '-Q');
  const fE29 = wireShells('Q_a', 'Q_b');
  const fE30 = (() => { const f = fig(); const pts = []; for (let i = 0; i < 48; i++) { const t = i / 48 * 2 * Math.PI; const rr = 60 + 18 * Math.cos(2 * t) + 10 * Math.sin(3 * t); pts.push([160 + 1.3 * rr * Math.cos(t), 110 - rr * Math.sin(t)]); } f.hatchBand(pts); f.poly(pts, { cls: 'thick' }); f.label(290, 30, md`Q\ \text{on an isolated conductor}`, 'l', 'small'); return f.svg(); })();
  const fE31 = sph({ layers: [{ k: 'mball', r: 45, lab: md`Q=0`, at: 135 }], q: [[90, 0, '+', 'q', 'r']], extra: (f, cx, cy) => { f.dim(cx, cy + 62, cx + 90, cy + 62, md`a=2R`, { at: 'b' }); f.line(cx, cy + 47, cx, cy + 66, { cls: 'dim thin' }); f.line(cx + 90, cy + 9, cx + 90, cy + 66, { cls: 'dim thin' }); } });
  const fE32 = planeFig({ q: [[150, 80, '+', 'q', 'l']], dims: [[150, 80, 150, 150, 'a', { off: -40, at: 'r' }]] });
  const fE33 = planeFig({ q: [[150, 105, '+', md`\lambda`, 'l']], dims: [[150, 105, 150, 150, 'h', { off: -40, at: 'r' }], [150, 60, 150, 150, '2h', { off: 50, at: 'l' }]], extra: (f) => { f.circle(150, 60, 7, { cls: 'dash dim' }); f.text(160, 60, 'lifted to here', 'l'); } });
  const fE34 = twoBalls({ r1: 26, r2: 40, l1: 'V_1', l2: md`V_2\ne V_1` });
  const fE35 = sph({ layers: [{ k: 'sig', r: 60, lab: 'Q', at: 45 }], q: [[0, 0, '+', 'q', 'b']], rad: [[60, 160, 'R', 0.6, 'tr']], dot: false });
  const fE36 = (() => {
    const f = fig(); const xa = 60, xb = 260, yT = 60, yB = 150;
    f.plane(xa, xb, yT, { side: 'above', t: 7 }); f.plane(xa, xb, yB, { side: 'below', t: 7 });
    f.hatchBand([[20, 85], [130, 85], [130, 125], [20, 125]]); f.rect(20, 85, 110, 40, { cls: 'thick' });
    f.arrow(140, 105, 175, 105, { cls: 'dim' }); f.label(179, 105, 'x', 'l', 'small');
    f.label(xb + 8, yT - 4, md`V_0\ \text{(battery)}`, 'l', 'small'); f.text(14, 105, 'metal slab', 'r');
    return f.svg();
  })();

  // =====================================================================================
  // Lesson 3: energy, conceptual ladder
  // =====================================================================================
  const L3 = {
    id: 'uD-energy-concepts', title: 'Electrostatic energy: the conceptual ladder',
    steps: [
      R(md`
        ### Level 1: recognize

        Three formulas, two meanings:

        $$W_{\rm pts} = \frac12\sum_{i}q_iV_{\text{others}}(\vb r_i),\qquad W = \frac12\int\rho V\,d\tau,\qquad W = \frac{\varepsilon_0}{2}\int_{\text{all space}}E^2\,d\tau.$$

        - The first is the work to bring **point** charges in from infinity, each already made. It leaves out the (infinite) work of building each point charge: no self-energy.
        - The second and third are equal for any continuous distribution and include **everything**, self-energy too. In $\tfrac12\int\rho V$, $V$ is the full potential, including the charge's own.
        - $E^2$ form: the energy sits wherever there is field. It is never negative; the point-charge sum can be.
        - $W$ is the work **you** do assembling slowly. The field does the negative of that.
      `),
      Q(md`Which formulas include the self-energy of each piece (for example, the work to assemble the ball itself)?`,
        [md`Only $\tfrac12\sum q_iV_{\text{others}}$`, md`Only $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$`, md`None of them`, md`Both $\tfrac12\int\rho V\,d\tau$ and $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$`], 3,
        [md`That sum deliberately uses only the potential of the **other** charges: interaction energy only.`, md`$\tfrac12\int\rho V$ is the same number; integrating by parts turns one into the other.`, md`The continuous formulas count every bit of charge interacting with every other bit, including bits of the same object.`, null],
        md`$\tfrac12\int\rho V$ with the full $V$ counts every pair of charge elements, including pairs inside the same ball. Integrating by parts gives $\tfrac{\varepsilon_0}{2}\int E^2$. The point-charge sum skips each charge's interaction with itself (which would be infinite for a true point).`,
        { figHtml: fE1 }),
      Q(md`What is the sign of the energy of a $+q$, $-q$ pair separated by $d$ (point-charge formula)?`,
        [md`Positive: energy is always positive`, md`Negative: $W = -\dfrac{q^2}{4\pi\varepsilon_0d}$`, md`Zero: the charges cancel`, md`It depends on where $V = 0$ is`], 1,
        [md`$\tfrac{\varepsilon_0}{2}\int E^2$ is always positive, but the point-charge formula leaves out the infinite self-energies, and what remains can be negative.`, null, md`Their fields don't cancel everywhere; and the interaction term is not zero.`, md`With $V = 0$ at infinity (the reference the formula assumes), the value is fixed.`],
        md`$W = q_1q_2/(4\pi\varepsilon_0d)<0$ for opposite signs: the field does positive work pulling them together, so you do negative work assembling them.`,
        { figHtml: fE2 }),
      Q(md`An isolated metal sphere of radius $R$ carries $Q$. Where is its energy $\dfrac{Q^2}{8\pi\varepsilon_0R}$ stored?`,
        [md`In the surface charge layer`, md`Inside the metal`, md`In the field outside the sphere`, md`Half inside the metal, half outside`], 2,
        [md`In the field picture, energy lives in $E^2$; the surface is a set of measure zero.`, md`$E = 0$ inside a conductor, so no energy density there.`, null, md`Inside, $E = 0$.`],
        md`$u = \tfrac{\varepsilon_0}{2}E^2$ with $E = \dfrac{Q}{4\pi\varepsilon_0r^2}$ for $r>R$: $\int_R^\infty u\,4\pi r^2dr = \dfrac{Q^2}{8\pi\varepsilon_0R}$. The two pictures ($\tfrac12QV$ on the surface, $E^2$ outside) agree on the total, not on the location; the field picture is the physical one.`,
        { figHtml: fE3 }),
      Q(md`You slowly move $q$ from $A$ to $B$ near a fixed charge $Q$. Which is right?`,
        [md`$W_{\rm you} = q\,[V(B)-V(A)] = -W_{\rm field}$`, md`$W_{\rm you} = q\,[V(A)-V(B)]$`, md`$W_{\rm you} = W_{\rm field}$`, md`$W_{\rm you}$ depends on the path`], 0,
        [null, md`Sign: moving a positive charge to higher potential costs you work.`, md`Slowly means your force balances the field's at every step, so they are equal and opposite.`, md`Electrostatic forces are conservative; only the endpoints matter.`],
        md`Quasi-static: $\vb F_{\rm you} = -q\vb E$. $W_{\rm you} = -q\int_A^B\vb E\cdot d\vb l = q[V(B)-V(A)]$, and the field does the opposite.`,
        { figHtml: fE4 }),

      R(md`
        ### Level 2: set up

        **Energy does not superpose.** Fields add, so $E^2 = E_1^2+E_2^2+2\vb E_1\cdot\vb E_2$:
        $$W = W_1+W_2+\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau.$$
        The cross term is the **interaction energy**; it equals $\int\rho_1V_2\,d\tau$ (no $\tfrac12$). Its sign can be anything; the self terms are positive.

        **The $\tfrac12$** in $\tfrac12\sum q_iV_i$ or $\tfrac12\int\rho V$: each pair appears twice in the double sum.
      `),
      Q(md`Two concentric charged shells. Why is the total energy not $W_1+W_2$ (each shell's energy alone)?`,
        [md`Because energy depends on the reference point of $V$`, md`Because $E^2$ is not linear: there is a cross term $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$`, md`Because the shells polarize each other`, md`It is $W_1+W_2$; energy adds like charge`], 1,
        [md`$W$ with $V\to0$ at infinity has no free constant.`, null, md`Insulating shells with fixed charge do not rearrange. The cross term exists anyway.`, md`Energy is quadratic in the charges, so it cannot add linearly.`],
        md`$W = W_1+W_2+\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$. For concentric shells $\vb E_1\cdot\vb E_2\ne0$ only outside $b$, giving $\dfrac{Q_1Q_2}{4\pi\varepsilon_0b}$.`,
        { figHtml: fE5 }),
      Q(md`Why is there a $\tfrac12$ in $W = \tfrac12\sum_iq_iV_{\text{others}}(\vb r_i)$?`,
        [md`Because the average potential along the path is half the final one`, md`Because only half the field lines end on other charges`, md`Because the energy is shared with the field`, md`Because the sum counts each pair twice: $q_1V_2$ contains the $1$–$2$ pair and so does $q_2V_1$`], 3,
        [md`That is the reason for the $\tfrac12$ in $\tfrac12CV^2$-type charging, not for this sum.`, md`Not a thing.`, md`Field energy and charge energy are the same energy counted two ways, not shares.`, null],
        md`$\sum_iq_iV_{\text{others}}(\vb r_i) = \sum_i\sum_{j\ne i}\dfrac{q_iq_j}{4\pi\varepsilon_0r_{ij}}$, where every pair appears as $(i,j)$ and $(j,i)$. Half of it is the sum over pairs.`,
        { figHtml: fE6 }),
      Q(md`A thin shell of radius $R$ carries $Q$. Using $W = \tfrac12\int\sigma V\,da$, which value of $V$ goes in?`,
        [md`$V = 0$: the shell has no "other" charges`, md`$V = \dfrac{Q}{8\pi\varepsilon_0R}$, the average of inside and outside`, md`$V = \dfrac{Q}{4\pi\varepsilon_0R}$, the full potential on the shell, giving $W = \dfrac{Q^2}{8\pi\varepsilon_0R}$`, md`$V = \dfrac{Q}{4\pi\varepsilon_0R}$, giving $W = \dfrac{Q^2}{4\pi\varepsilon_0R}$`], 2,
        [md`That is the point-charge rule. For continuous charge you use the full potential, its own included.`, md`$V$ is continuous across the shell: inside and outside are both $Q/(4\pi\varepsilon_0R)$ at $r = R$.`, null, md`Dropped the $\tfrac12$.`],
        md`$W = \tfrac12\cdot Q\cdot\dfrac{Q}{4\pi\varepsilon_0R} = \dfrac{Q^2}{8\pi\varepsilon_0R}$, the same as $\tfrac{\varepsilon_0}{2}\int E^2$ outside.`,
        { figHtml: fE7 }),
      Q(md`You double the charge on an isolated conductor. Its energy...`,
        [md`quadruples`, md`doubles`, md`stays the same if the shape is the same`, md`grows by $\sqrt2$`], 0,
        [null, md`$W = Q^2/(2C)$: quadratic, not linear.`, md`The shape fixes $C$, not $W$.`, md`No physical reason for a square root.`],
        md`$W = \dfrac{Q^2}{2C}$ with $C$ fixed by geometry. Equivalently, $E$ doubles everywhere, so $E^2$ quadruples.`,
        { figHtml: fE8 }),

      R(md`
        ### Level 3: standard cases

        Standard values ($k = 1/(4\pi\varepsilon_0)$):

        | Object | $W$ |
        |---|---|
        | shell $Q$, $R$ | $\dfrac{kQ^2}{2R}$ (all outside) |
        | uniform ball $Q$, $R$ | $\dfrac35\dfrac{kQ^2}{R}$ ($\tfrac16$ of it inside) |
        | concentric shells $Q_1$ at $a$, $Q_2$ at $b>a$ | $\dfrac{kQ_1^2}{2a}+\dfrac{kQ_2^2}{2b}+\dfrac{kQ_1Q_2}{b}$ |
        | capacitor | $\dfrac{Q^2}{2C} = \tfrac12CV^2$ |

        **Forces from energy.** At fixed charge (isolated): $F_x = -\left(\dfrac{\partial W}{\partial x}\right)_Q$. At fixed potential (battery): $F_x = +\left(\dfrac{\partial W}{\partial x}\right)_V$, because the battery does twice the energy change. The two give the **same** force for the same state. Pressure on a conductor surface: $\dfrac{\sigma^2}{2\varepsilon_0}$, always outward.
      `),
      Q(md`A uniform ball and a thin shell have the same $Q$ and $R$. What is $W_{\rm ball}/W_{\rm shell}$?`,
        [md`$1$`, md`$\dfrac65$`, md`$\dfrac35$`, md`$\dfrac56$`], 1,
        [md`Outside they are identical, but the ball also has field inside.`, null, md`That is $W_{\rm ball}$ in units of $kQ^2/R$, not the ratio.`, md`Inverted.`],
        md`$W_{\rm ball} = \dfrac35\dfrac{kQ^2}{R}$, $W_{\rm shell} = \dfrac12\dfrac{kQ^2}{R}$, ratio $\dfrac65$. The extra $\dfrac1{10}\dfrac{kQ^2}{R}$ is the field energy inside the ball.`,
        { figHtml: fE9 }),
      Q(md`What fraction of a uniform ball's total energy is stored inside the ball?`,
        [md`$\dfrac12$`, md`$\dfrac35$`, md`$0$`, md`$\dfrac16$`], 3,
        [md`No symmetry argument gives a half.`, md`$\tfrac35$ is the total in units of $kQ^2/R$.`, md`The field inside is $kQr/R^3\ne0$.`, null],
        md`Inside: $\tfrac{\varepsilon_0}{2}\int_0^R\left(\dfrac{kQr}{R^3}\right)^24\pi r^2dr = \dfrac{kQ^2}{10R}$. Total $\dfrac{3kQ^2}{5R}$. Fraction $\dfrac{1/10}{3/5} = \dfrac16$.`,
        { figHtml: fE10 }),
      Q(md`For a charged shell of radius $R$, what fraction of the energy lies beyond $r = 2R$?`,
        [md`$\dfrac14$`, md`$\dfrac18$`, md`$\dfrac12$`, md`$\dfrac34$`], 2,
        [md`That would be for $u\propto1/r^2$ in volume; here $u\,dV\propto dr/r^2$.`, md`Same mistake with a cube.`, null, md`Inverted: three quarters would be beyond $\tfrac43R$.`],
        md`Energy beyond $r_1$: $\dfrac{kQ^2}{2r_1}$. Ratio to $\dfrac{kQ^2}{2R}$ is $R/r_1 = \tfrac12$. Field energy of a point-like charge is spread out over a large volume.`,
        { figHtml: fE11 }),
      Q(md`Concentric shells: $Q_1$ at radius $a$, $Q_2$ at $b>a$. What is the interaction energy?`,
        [md`$\dfrac{Q_1Q_2}{4\pi\varepsilon_0b}$`, md`$\dfrac{Q_1Q_2}{4\pi\varepsilon_0a}$`, md`$\dfrac{Q_1Q_2}{4\pi\varepsilon_0(b-a)}$`, md`$0$, since the inner shell feels no field from the outer one`], 0,
        [null, md`The outer shell's potential at the inner shell is $kQ_2/b$ (constant inside), not $kQ_2/a$.`, md`Shells are not points at separation $b-a$.`, md`Zero force does not mean zero energy: the outer shell's potential inside is $kQ_2/b$, not zero.`],
        md`$W_{\rm int} = Q_1V_2(a) = Q_1\dfrac{kQ_2}{b}$. Field check: $\vb E_1\cdot\vb E_2\ne0$ only for $r>b$, and $\varepsilon_0\int_b^\infty\dfrac{k^2Q_1Q_2}{r^4}4\pi r^2dr = \dfrac{kQ_1Q_2}{b}$.`,
        { figHtml: fE12 }),
      Q(md`A capacitor stays connected to a battery $V_0$. As you pull the plates apart, its stored energy $\tfrac12CV_0^2$ **decreases**. Does that mean the plates repel?`,
        [md`Yes: the system moves toward lower energy`, md`No: at fixed $V$ the force is $+\partial W/\partial x$, which is negative here, so they attract`, md`No force at fixed $V$`, md`Yes, but only while the battery is charging`], 1,
        [md`"Toward lower energy" applies to an isolated system. Here the battery is part of the system and its energy changes by twice as much.`, null, md`The field between charged plates still pulls them.`, md`The force is attractive throughout.`],
        md`$F_x = +\left(\dfrac{\partial W}{\partial x}\right)_V = \tfrac12V_0^2\dfrac{dC}{dx} = -\dfrac{\varepsilon_0AV_0^2}{2x^2}$: attraction, the same as $-\left(\dfrac{\partial}{\partial x}\dfrac{Q^2}{2C}\right)_Q$ at the same moment.`,
        { figHtml: fE13 }),
      Q(md`A metal sphere carries **negative** charge. What is the electric force per area on its surface?`,
        [md`$\dfrac{\sigma^2}{2\varepsilon_0}$ inward`, md`$\dfrac{\sigma^2}{\varepsilon_0}$ outward`, md`zero, because the field inside is zero`, md`$\dfrac{\sigma^2}{2\varepsilon_0}$ outward`], 3,
        [md`The force is $\sigma\vb E_{\rm avg}$ with $\vb E_{\rm avg} = \dfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$, so $\sigma^2$: outward for either sign.`, md`Uses the full outside field $\sigma/\varepsilon_0$; a patch does not push on itself, so use the average $\sigma/(2\varepsilon_0)$.`, md`The field just outside is $\sigma/\varepsilon_0$; the patch feels the field of all the other charge.`, null],
        md`$\vb f = \sigma\vb E_{\rm avg} = \sigma\cdot\dfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n} = \dfrac{\sigma^2}{2\varepsilon_0}\hat{\mathbf n}$. Like charges repel: every patch is pushed away by the rest of the conductor's charge.`,
        { figHtml: fE14 }),
      Q(md`Isolated capacitor, $\pm Q$, plate area $A$. The field between the plates is $Q/(\varepsilon_0A)$. Why is the force on one plate $\dfrac{Q^2}{2\varepsilon_0A}$ and not $\dfrac{Q^2}{\varepsilon_0A}$?`,
        [md`Because only half the plate's area faces the other plate`, md`Because the energy formula has a $\tfrac12$`, md`Because a plate feels only the other plate's field, $\dfrac{Q}{2\varepsilon_0A}$ (equivalently the average of the fields on its two sides)`, md`It is $\dfrac{Q^2}{\varepsilon_0A}$`], 2,
        [md`The whole plate faces the other plate.`, md`That gives the right number by accident of bookkeeping; the physical reason is self-force.`, null, md`That would count the plate pushing on itself.`],
        md`$F = Q\cdot\dfrac{Q}{2\varepsilon_0A}$. Energy check at fixed $Q$: $W = \dfrac{Q^2x}{2\varepsilon_0A}$, $F = -\dfrac{dW}{dx} = -\dfrac{Q^2}{2\varepsilon_0A}$ (attractive).`,
        { figHtml: fE15 }),

      R(md`
        ### Level 4: images, conductors, batteries

        **Images and the $\tfrac12$.** For a charge $q$ near a grounded conductor, the real energy is
        $$W = \tfrac12\,q\,V_{\rm induced}(\vb r_q),$$
        half of what you would get by treating the image as a real charge. Reason: the field exists only on the real side, and the induced charge comes along for free (the conductor is at $V = 0$, so moving its charge costs nothing). The force is still the full image force, and $F = -dW/dz$ with the correct $W$.

        **Batteries.** At fixed $V$, for any change: $W_{\rm battery} = 2\,\Delta W_{\rm stored}$ and $W_{\rm you} = -\Delta W_{\rm stored}$.

        **Connecting conductors** always lowers the electrostatic energy (charge flows until the potentials match); the difference goes to heat and radiation in the wire.
      `),
      Q(md`A charge $q$ sits at height $d$ above a grounded plane. Why is the energy $-\dfrac{q^2}{4\pi\varepsilon_0(4d)}$ and not $-\dfrac{q^2}{4\pi\varepsilon_0(2d)}$ (the energy of $q$ and its image)?`,
        [md`The image system has field in both half-spaces; the real system has field only above the plane, so the real energy is half`, md`Because the plane absorbs half the energy`, md`Because the image is half the size of $q$`, md`It is $-\dfrac{q^2}{4\pi\varepsilon_0(2d)}$`], 0,
        [null, md`The plane is at $V = 0$; it stores nothing and absorbs nothing.`, md`The image is $-q$, the same size.`, md`That is the energy of two real charges, a different system.`],
        md`The image pair's field is mirror-symmetric, so $\int E^2$ over the upper half is half the total. The interaction part of the image pair is $-\dfrac{q^2}{4\pi\varepsilon_0(2d)}$; half of it is $-\dfrac{q^2}{16\pi\varepsilon_0d}$. Equivalently $W = \tfrac12qV_{\rm induced}$.`,
        { figHtml: fE16 }),
      Q(md`How much work do **you** do to bring $q$ slowly from far away to height $d$ above a grounded plane?`,
        [md`$-\dfrac{q^2}{8\pi\varepsilon_0d}$`, md`$+\dfrac{q^2}{16\pi\varepsilon_0d}$`, md`$-\dfrac{q^2}{16\pi\varepsilon_0d}$`, md`$0$, because the plane is at $V = 0$`], 2,
        [md`That is $q$ times the image's potential: it treats the image as fixed, but the image moves with $q$.`, md`Sign: the plane attracts $q$, so you hold back; your work is negative.`, null, md`The induced charge does exert a force.`],
        md`At height $z$ the image pulls $q$ toward the plane with $\dfrac{q^2}{4\pi\varepsilon_0(2z)^2} = \dfrac{q^2}{16\pi\varepsilon_0z^2}$. To move slowly you push **away** from the plane with that force while $q$ moves **toward** it, so your work is negative:
        $$W_{\rm you} = -\int_d^\infty\frac{q^2}{16\pi\varepsilon_0z^2}\,dz = -\frac{q^2}{16\pi\varepsilon_0d}.$$
        This equals the system's energy, as it must (nothing else did work).`,
        { figHtml: fE17 }),
      Q(md`Charge $q$ a distance $a$ from the center of a grounded sphere of radius $R$. What is the energy of the system?`,
        [md`$-\dfrac{q^2R}{4\pi\varepsilon_0(a^2-R^2)}$`, md`$-\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}$`, md`$-\dfrac{q^2R}{8\pi\varepsilon_0a^2}$`, md`$0$`], 1,
        [md`That is $qV_{\rm image}$: it misses the $\tfrac12$.`, null, md`Uses the distance $a$ instead of $a-R^2/a$ between $q$ and the image.`, md`The induced charge attracts $q$, so energy is negative.`],
        md`$V_{\rm induced}(a) = \dfrac{-qR/a}{4\pi\varepsilon_0(a-R^2/a)} = -\dfrac{qR}{4\pi\varepsilon_0(a^2-R^2)}$. $W = \tfrac12qV_{\rm induced} = -\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}$. Check: $-dW/da = -\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}$, the image force (attractive).`,
        { figHtml: fE18 }),
      Q(md`Two identical metal spheres far apart, one with $Q$ and one neutral, are joined by a thin wire. What fraction of the energy is lost?`,
        [md`None; charge is conserved`, md`$\dfrac14$`, md`$\dfrac34$`, md`$\dfrac12$`], 3,
        [md`Charge is conserved; energy is not (the wire heats up).`, md`Each sphere ends with $Q/2$: $2\cdot\dfrac{(Q/2)^2}{2C} = \dfrac12\dfrac{Q^2}{2C}$.`, md`Too much: half remains.`, null],
        md`Before: $\dfrac{Q^2}{2C}$. After: two spheres with $Q/2$, $\dfrac{Q^2}{4C}$. Half is lost to the current in the wire, however thin or resistive it is.`,
        { figHtml: fE19 }),
      Q(md`A capacitor (area $A$) stays on a battery $V_0$ while you slowly pull the plates from $x$ to $2x$. How much work do you do?`,
        [md`$+\dfrac{\varepsilon_0AV_0^2}{4x}$`, md`$-\dfrac{\varepsilon_0AV_0^2}{4x}$`, md`$+\dfrac{\varepsilon_0AV_0^2}{2x}$`, md`$0$`], 0,
        [null, md`That is the change in stored energy; you do the opposite of it.`, md`That is what the battery absorbs.`, md`The plates attract; pulling them apart costs work.`],
        md`$\Delta W_{\rm stored} = \tfrac12V_0^2\Delta C = -\dfrac{\varepsilon_0AV_0^2}{4x}$. Battery: $V_0\Delta Q = V_0^2\Delta C = -\dfrac{\varepsilon_0AV_0^2}{2x}$ (it gets charged). You: $\Delta W_{\rm stored}-W_{\rm battery} = +\dfrac{\varepsilon_0AV_0^2}{4x}$.`,
        { figHtml: fE20 }),
      Q(md`What does $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ give for a single **point** charge?`,
        [md`$0$, since nothing was assembled`, md`$\dfrac{q^2}{8\pi\varepsilon_0}$`, md`Infinity: the integral near $r = 0$ diverges`, md`A finite value set by the reference point`], 2,
        [md`The field is there, so $E^2>0$.`, md`Units are wrong (needs a length).`, null, md`No reference enters the $E^2$ form.`],
        md`$\int_\epsilon^\infty\dfrac{\varepsilon_0}{2}\dfrac{q^2}{(4\pi\varepsilon_0)^2r^4}4\pi r^2dr = \dfrac{q^2}{8\pi\varepsilon_0\epsilon}\to\infty$. That is why the point-charge formula drops self-energies: they are infinite and constant.`,
        { figHtml: fE21 }),
      Q(md`For $+q$ and $-q$ at distance $d$, the point-charge formula gives $W<0$, yet $\tfrac{\varepsilon_0}{2}\int E^2\ge0$. How do they fit?`,
        [md`One of the formulas is wrong for opposite charges`, md`$\tfrac{\varepsilon_0}{2}\int E^2$ = two infinite self-energies + the finite negative interaction; the point formula keeps only the last`, md`The field energy is negative between the charges`, md`They agree only after choosing $V = 0$ at the midpoint`], 1,
        [md`Both are right; they answer different questions.`, null, md`$E^2\ge0$ everywhere.`, md`No reference choice changes either.`],
        md`$\int E^2 = \int E_1^2+\int E_2^2+2\int\vb E_1\cdot\vb E_2$. The first two are infinite and do not change as the charges move; the cross term is $-\dfrac{q^2}{4\pi\varepsilon_0d}$. Differences in energy are what matter for work and force.`,
        { figHtml: fE22 }),
      Q(md`Shell $Q$ at radius $a$ inside a thin **neutral** metal shell at $b$. Then the metal shell is grounded. What happens to the energy?`,
        [md`It increases by $\dfrac{Q^2}{8\pi\varepsilon_0b}$`, md`Unchanged: the field between $a$ and $b$ is unchanged`, md`It drops to zero`, md`It drops by $\dfrac{Q^2}{8\pi\varepsilon_0b}$: the field outside $b$ disappears`], 3,
        [md`Sign: field energy is removed, none added.`, md`The region between is unchanged, but the outside field is gone.`, md`The field between $a$ and $b$ remains.`, null],
        md`Before: field $kQ/r^2$ everywhere outside $a$ (the neutral shell has $-Q$ inside, $+Q$ outside). After grounding: $+Q$ on the outer face drains away, field outside $b$ vanishes. Lost: $\int_b^\infty u\,d\tau = \dfrac{Q^2}{8\pi\varepsilon_0b}$.`,
        { figHtml: fE23 }),

      R(md`
        ### Level 5: exam level

        Multi-step energy bookkeeping. Before computing, ask: which region gains or loses field? Energy lives in $E^2$, so the answer is often visible from the field map alone.

        - Inserting neutral metal removes field from the metal's volume: energy drops (at fixed charges), so metal is pulled into fields.
        - Expanding a charged conductor at fixed $Q$ lowers $W$; at fixed $V$ it raises $W$, and the battery pays twice that. Either way the force is outward.
        - Connecting conductors: compute $W$ before and after; the difference is dissipated.
      `),
      Q(md`A metal sphere (radius $a$, charge $Q$) is surrounded by a concentric **neutral** thick metal shell with $b = 2a$, $c = 3a$. Compared with the bare sphere, what fraction of the energy is gone?`,
        [md`$\dfrac16$`, md`$\dfrac12$`, md`$\dfrac13$`, md`$0$: a neutral shell changes nothing`], 0,
        [null, md`That would be the energy beyond $2a$; but the field returns outside $c$.`, md`That is $a/c$, the energy beyond $c$, which survives.`, md`The neutral shell removes the field in $b<r<c$.`],
        md`Removed: $\int_b^c u\,d\tau = \dfrac{Q^2}{8\pi\varepsilon_0}\left(\dfrac1b-\dfrac1c\right)$. Fraction of $\dfrac{Q^2}{8\pi\varepsilon_0a}$: $\dfrac ab-\dfrac ac = \dfrac12-\dfrac13 = \dfrac16$.`,
        { figHtml: fE24 }),
      Q(md`A shell (radius $R$, fixed $Q$) has $W(R) = \dfrac{Q^2}{8\pi\varepsilon_0R}$. What is the "generalized force" $-dW/dR$, and what does it equal?`,
        [md`$\dfrac{Q^2}{4\pi\varepsilon_0R^2}$, the field times $Q$`, md`$0$, because the net vector force on a sphere is zero`, md`$\dfrac{Q^2}{8\pi\varepsilon_0R^2}$, the outward pressure $\dfrac{\sigma^2}{2\varepsilon_0}$ times the area $4\pi R^2$`, md`$\dfrac{Q^2}{16\pi\varepsilon_0R^2}$`], 2,
        [md`Uses the full outside field instead of the average.`, md`The vector sum is zero, but the force conjugate to $R$ (pushing every patch outward) is not.`, null, md`Off by 2.`],
        md`$-\dfrac{dW}{dR} = \dfrac{Q^2}{8\pi\varepsilon_0R^2}$. And $\dfrac{\sigma^2}{2\varepsilon_0}4\pi R^2 = \dfrac{Q^2}{32\pi^2\varepsilon_0R^4}4\pi R^2 = \dfrac{Q^2}{8\pi\varepsilon_0R^2}$. Two routes, one answer.`,
        { figHtml: fE25 }),
      Q(md`A metal sphere held at $V_0$ by a battery expands. Its energy $2\pi\varepsilon_0RV_0^2$ **increases**. Is the electric force on its surface inward?`,
        [md`Yes: the sphere resists the energy increase`, md`There is no force at fixed $V$`, md`Yes, because $\sigma$ decreases as it grows`, md`No: outward. At fixed $V$, $F_R = +\dfrac{\partial W}{\partial R} = 2\pi\varepsilon_0V_0^2>0$`], 3,
        [md`The battery supplies twice the energy increase; the sphere is not resisting.`, md`Charged surfaces are always pushed outward.`, md`$\sigma$ shrinks, but $\sigma^2/(2\varepsilon_0)$ is still outward.`, null],
        md`$F = +\left(\dfrac{\partial W}{\partial R}\right)_V = 2\pi\varepsilon_0V_0^2$. Pressure check: $\sigma = \varepsilon_0V_0/R$, $\dfrac{\sigma^2}{2\varepsilon_0}4\pi R^2 = 2\pi\varepsilon_0V_0^2$. Same. At fixed $Q$ you would use $-\partial W/\partial R$ and get the same positive number at the same state.`,
        { figHtml: fE26 }),
      Q(md`A charged conducting bubble (fixed $Q$) expands from $R$ to $2R$. How much work do the electric forces do?`,
        [md`$-\dfrac{Q^2}{16\pi\varepsilon_0R}$`, md`$\dfrac{Q^2}{16\pi\varepsilon_0R}$`, md`$\dfrac{Q^2}{8\pi\varepsilon_0R}$`, md`$\dfrac{Q^2}{32\pi\varepsilon_0R}$`], 1,
        [md`Sign: the electric pressure pushes outward along the motion, so it does positive work.`, null, md`That is the whole initial energy; half remains at $2R$.`, md`Off by 2.`],
        md`$W_{\rm field} = W(R)-W(2R) = \dfrac{Q^2}{8\pi\varepsilon_0}\left(\dfrac1R-\dfrac1{2R}\right) = \dfrac{Q^2}{16\pi\varepsilon_0R}$: the energy that was in $R<r<2R$.`,
        { figHtml: fE27 }),
      Q(md`Concentric thin metal shells carry $+Q$ (inner, radius $a$) and $-Q$ (outer, radius $b$). They are joined by a wire. How much energy is released?`,
        [md`All of it: $\dfrac{Q^2}{8\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$`, md`Half of it`, md`None: total charge is zero before and after`, md`$\dfrac{Q^2}{8\pi\varepsilon_0b}$`], 0,
        [null, md`The final state has no field at all.`, md`Zero net charge does not mean zero field before.`, md`That is the energy outside $b$ for a charge $Q$, which was zero to begin with.`],
        md`Before: field only between, energy $\dfrac{Q^2}{8\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$. After: the charges cancel on the outer surface; no field anywhere. Everything is dissipated.`,
        { figHtml: fE28 }),
      Q(md`Inner shell $Q_a$ (radius $a$) and outer shell $Q_b$ (radius $b$) are joined by a wire. How does the released energy depend on $Q_b$?`,
        [md`It grows with $Q_b$`, md`It shrinks as $Q_b$ grows`, md`It does not depend on $Q_b$: it is $\dfrac{Q_a^2}{8\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$`, md`It vanishes if $Q_b = -Q_a$`], 2,
        [md`The field outside $b$ is set by $Q_a+Q_b$ and is the same before and after.`, md`Same reason.`, null, md`That case releases everything, which is still $\dfrac{Q_a^2}{8\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$.`],
        md`All charge ends on the outer surface. Outside $b$ nothing changes (total charge the same). Between $a$ and $b$ the field $kQ_a/r^2$ disappears. Released = that region's energy, $\dfrac{Q_a^2}{8\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$, regardless of $Q_b$.`,
        { figHtml: fE29 }),
      Q(md`Thomson's theorem: compared with any other way of spreading the same $Q$ over this conductor, the equilibrium distribution has...`,
        [md`the most energy`, md`the same energy; energy depends only on $Q$`, md`the most symmetric shape`, md`the least energy`], 3,
        [md`Charges move to lower the energy; equilibrium is a minimum.`, md`Energy depends on how the charge is arranged.`, md`Symmetry is not the criterion; for an irregular conductor the charge is not symmetric.`, null],
        md`Any other distribution can lower its energy by moving charge along the conductor toward lower potential. Equilibrium (constant $V$) is the minimum. This is a variational way to see why conductors are equipotentials.`,
        { figHtml: fE30 }),

      R(md`
        ### Level 6: harder than the exam

        - The energy of a charge near a conductor is $\tfrac12qV_{\rm induced}$ for grounded **and** for isolated conductors (the conductor's own $\tfrac12\oint\sigma V$ vanishes when it is neutral, or when it is at $V = 0$).
        - Using the image-pair energy (without the $\tfrac12$) with $F = -dW/dz$ gives **twice** the force.
        - 2-D (line charges): energy per length diverges logarithmically, but differences are finite.
      `),
      Q(md`Charge $q$ at $a = 2R$ from the center of a sphere. Compare the energy for a **neutral isolated** sphere with that for a **grounded** one.`,
        [md`They are equal`, md`Neutral: $-\dfrac{q^2}{24\cdot4\pi\varepsilon_0R}$; grounded: $-\dfrac{q^2}{6\cdot4\pi\varepsilon_0R}$. Ratio $\tfrac14$`, md`The neutral sphere's energy is positive`, md`Neutral is four times larger in magnitude`], 1,
        [md`The neutral sphere has an extra $+qR/a$ image at its center that partly cancels the attraction.`, null, md`It is still attractive: the near side gets negative charge.`, md`Inverted.`],
        md`$W = \tfrac12qV_{\rm ind}$. Grounded: $V_{\rm ind} = -\dfrac{kqR}{a^2-R^2}$, so at $a = 2R$, $W = -\dfrac{kq^2}{6R}$. Neutral: add $+\dfrac{kqR}{a^2}$ from the center image: $W = -\dfrac{kq^2R^3}{2a^2(a^2-R^2)} = -\dfrac{kq^2}{24R}$ at $a = 2R$. (Checked by integrating the force from infinity.)`,
        { figHtml: fE31 }),
      Q(md`Charge $q$ at height $a$ above a grounded plane. A student uses the image-pair energy $W = -\dfrac{q^2}{4\pi\varepsilon_0(2a)}$ and $F = -dW/da$. What does she get?`,
        [md`Twice the true force`, md`The true force`, md`Half the true force`, md`The right size but repulsive`], 0,
        [null, md`True force: $\dfrac{q^2}{4\pi\varepsilon_0(2a)^2} = \dfrac{q^2}{16\pi\varepsilon_0a^2}$. Hers: $\dfrac{q^2}{8\pi\varepsilon_0a^2}$.`, md`Inverted.`, md`$W$ decreases as $a$ decreases, so $-dW/da$ points toward the plane: attractive.`],
        md`Her $W$ changes with $a$ twice as fast as the real one, $-\dfrac{q^2}{16\pi\varepsilon_0a}$, because in her picture the image is a real charge whose field energy below the plane also changes. Real: $F = -\dfrac{d}{da}\left(-\dfrac{q^2}{16\pi\varepsilon_0a}\right) = -\dfrac{q^2}{16\pi\varepsilon_0a^2}$.`,
        { figHtml: fE32 }),
      Q(md`A line charge $\lambda$ above a grounded plane is lifted from $h$ to $2h$. What can you say about the energy per length?`,
        [md`It is infinite before and after, so the work is infinite`, md`The work per length is zero, since the image moves too`, md`The energy per length is finite here (the image cancels the log), and the work to lift is $\dfrac{\lambda^2\ln2}{4\pi\varepsilon_0}$`, md`The work per length is $\dfrac{\lambda^2}{4\pi\varepsilon_0h}$`], 2,
        [md`A line charge's own field energy diverges at small $s$ (self-energy), but that part does not change as it moves. The change is finite.`, md`The image attracts the line; lifting costs work.`, null, md`That is the force per length times $h$, ignoring that the force falls off as $1/z$.`],
        md`Far away, the line plus its image form a line dipole, so there is no large-$s$ divergence; the small-$s$ self-energy is infinite but constant. Force per length $\dfrac{\lambda^2}{2\pi\varepsilon_0(2z)}$; work $\int_h^{2h}\dfrac{\lambda^2}{4\pi\varepsilon_0z}dz = \dfrac{\lambda^2\ln2}{4\pi\varepsilon_0}$.`,
        { figHtml: fE33 }),
      Q(md`Two isolated conductors far apart sit at different potentials $V_1\ne V_2$ (charges of either sign). They are connected by a wire. The energy...`,
        [md`increases if both charges are positive`, md`is unchanged if the total charge is zero`, md`decreases only if the charges have opposite signs`, md`always decreases`], 3,
        [md`Charge flows from high to low potential; the field does positive work on it, and that is dissipated.`, md`Zero total does not mean zero energy before or after; the energy still drops.`, md`Same-sign charges at different potentials also redistribute and lose energy.`, null],
        md`Moving $dq$ from potential $V_1$ to $V_2<V_1$ changes $W$ by $dq(V_2-V_1)<0$. Charge keeps flowing until $V_1 = V_2$, so $W$ decreases monotonically. (Thomson's theorem again: the connected system relaxes to its minimum.)`,
        { figHtml: fE34 }),
      Q(md`Final state: shell ($Q$, $R$) with a point charge $q$ at its center. Route A: build the shell, then bring $q$ in through a tiny hole. Route B: place $q$, then build the shell around it. Compare the total work (excluding $q$'s infinite self-energy).`,
        [md`Route A costs more by $\dfrac{qQ}{4\pi\varepsilon_0R}$`, md`Both are $\dfrac{Q^2}{8\pi\varepsilon_0R}+\dfrac{qQ}{4\pi\varepsilon_0R}$`, md`Route B costs less, since the shell is built in $q$'s field`, md`Both are $\dfrac{Q^2}{8\pi\varepsilon_0R}$, since $q$ feels no field inside the shell`], 1,
        [md`Energy is a state function; order does not matter.`, null, md`In route B each bit of the shell is brought against $q$'s field, costing exactly $\dfrac{qQ}{4\pi\varepsilon_0R}$ in total.`, md`$q$ feels no force inside, but bringing it from infinity to the shell's surface costs $qV = \dfrac{qQ}{4\pi\varepsilon_0R}$.`],
        md`A: shell $\dfrac{Q^2}{8\pi\varepsilon_0R}$, then $q\cdot V_{\rm shell} = \dfrac{qQ}{4\pi\varepsilon_0R}$ (the potential is constant inside, so the last stretch is free). B: $Q\cdot V_q(R)$ for the interaction plus the shell's self-energy: the same sum.`,
        { figHtml: fE35 }),
      Q(md`A metal slab slides partway between the plates of a capacitor held at $V_0$ by a battery. The stored energy **increases** as the slab goes in. Is the slab pulled in or pushed out?`,
        [md`Pulled in: at fixed $V$, $F = +\partial W/\partial x>0$`, md`Pushed out: the system avoids the higher energy`, md`Pulled in only if the battery is disconnected`, md`No force: a neutral slab feels nothing`], 0,
        [null, md`With a battery attached, the battery supplies twice the stored-energy increase; the slab still moves in.`, md`Disconnected (fixed $Q$): $W$ decreases as it goes in, so it is pulled in then too.`, md`The induced charges on the slab are attracted to the plates.`],
        md`Inserting metal shortens the effective gap and raises $C$. Fixed $V$: $W = \tfrac12CV_0^2$ rises, $F = +\partial W/\partial x>0$. Fixed $Q$: $W = Q^2/(2C)$ falls, $F = -\partial W/\partial x>0$. The same direction both ways, as it must be.`,
        { figHtml: fE36 }),
      RF(md`
        !!key Patterns to remember
            - $\tfrac12\sum q_iV_{\text{others}}$: interaction only. $\tfrac12\int\rho V = \tfrac{\varepsilon_0}{2}\int E^2$: everything.
            - $W = W_1+W_2+\varepsilon_0\int\vb E_1\cdot\vb E_2$; for concentric shells the cross term is $\dfrac{Q_1Q_2}{4\pi\varepsilon_0b}$.
            - Shell $\tfrac12$, ball $\tfrac35$ (in $kQ^2/R$); a sixth of the ball's energy is inside it.
            - Charge near a conductor: $W = \tfrac12qV_{\rm induced}$. Force is the full image force.
            - Fixed $Q$: $F = -\partial_xW$. Fixed $V$: $F = +\partial_xW$, battery work $= 2\Delta W$. Same force either way.
            - Pressure $\sigma^2/(2\varepsilon_0)$ outward. Connecting conductors always dissipates energy.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 4 figures
  // =====================================================================================
  const fP1 = charges({ q: [[80, 160, '+', 'q', 'bl'], [170, 160, '-', '-2q', 'br'], [80, 40, '+', 'q', 'tl']], lines: [[80, 40, 170, 160]], dims: [[80, 160, 170, 160, '3a', { off: 22, at: 'b' }], [80, 160, 80, 40, '4a', { off: 22, at: 'l' }]], extra: (f) => f.label(132, 92, '5a', 'bl', 'small') });
  const fP2 = sph({ layers: [{ k: 'sig', r: 42, lab: 'Q', at: 90, gap: 6 }, { k: 'dash', r: 90, lab: md`r_1=\,?`, at: 40 }], extra: (f, cx, cy) => f.label(cx - 45, cy + 26, 'R', 'r', 'small') });
  const fP3 = (() => {
    const f = fig(); const cx = 160, cy = 130;
    f.pl(f.arcPts(cx, cy, 60, 60, 96, 444), { cls: 'thick' });
    f.charge(cx, cy - 115, { q: '+', lab: 'q', at: 'r' });
    f.line(cx, cy - 106, cx, cy - 4, { cls: 'dash dim', arrow: 'end' });
    f.label(cx + 46, cy - 46, 'Q', 'bl'); f.dim(cx, cy, cx - 60, cy, 'R', { at: 'b' });
    f.text(cx + 14, cy - 66, 'tiny hole', 'bl');
    return f.svg();
  })();
  const fP4 = sph({ layers: [{ k: 'mball', r: 30, lab: md`+\lambda`, at: 90, gap: 5 }, { k: 'dash', r: 58, lab: md`s=\sqrt{ab}`, at: 90, gap: 6 }, { k: 'shell', r: 95, lab: md`-\lambda`, at: 35 }], extra: (f, cx, cy) => { f.label(cx - 33, cy + 22, 'a', 'r', 'small'); f.label(cx - 92, cy + 58, 'b', 'r', 'small'); } });
  const fP5 = sph({ layers: [{ k: 'sig', r: 42, lab: '+q', at: 90, gap: 6 }, { k: 'sig', r: 92, lab: '-2q', at: 40 }], extra: (f, cx, cy) => { f.label(cx - 45, cy + 26, 'a', 'r', 'small'); f.label(cx - 78, cy + 56, 'b', 'tr', 'small'); } });
  const fP6 = (() => { const f = fig(); const cx = 160, cy = 120; tint(f, f.arcPts(cx, cy, 90, 90, 0, 360).concat(f.arcPts(cx, cy, 45, 45, 360, 0))); f.circle(cx, cy, 90); f.circle(cx, cy, 45); f.label(cx + 50, cy - 50, md`\rho`, 'c'); f.dim(cx, cy, cx - 45, cy, 'R', { at: 't' }); f.dim(cx, cy + 20, cx + 90, cy + 20, '2R', { at: 'b' }); f.dot(cx, cy, 2); f.label(cx + 100, cy - 80, md`Q\ \text{total}`, 'l', 'small'); return f.svg(); })();
  const fP7 = planeFig({ q: [[150, 105, '+', md`\lambda`, 'l']], dims: [[150, 105, 150, 150, 'h', { off: -40, at: 'r' }]], extra: (f) => { f.line(150, 98, 150, 66, { cls: 'dash dim', arrow: 'end' }); f.text(160, 70, 'lift to 2h', 'l'); } });
  const fP8 = sph({ layers: [{ k: 'mball', r: 30, lab: 'Q', at: 90, gap: 5 }, { k: 'thick', r: 58, r2: 100, lab: md`\text{neutral}`, at: 40 }], rad: [[58, 205, 'b', 0.75, 't'], [100, 320, 'c', 1.0, 'br']], extra: (f, cx, cy) => f.label(cx - 26, cy - 22, 'a', 'br', 'small') });
  const fP9 = sph({ layers: [{ k: 'ball', r: 60, lab: md`\rho=\rho_0r/R`, at: 40 }], rad: [[60, 210, 'R', 0.5, 't']] });
  const fP10 = wireShells('q', 'Q');
  const fP11 = cap({ top: '+Q', bot: '-Q', bat: 'V_0', area: md`\text{area }A`, extra: (f) => f.text(160, 175, '1: x to 3x on the battery;  2: disconnect, 3x back to x', 't') });
  const fP12 = sph({ layers: [{ k: 'shell', r: 52, r2: 56, lab: 'R', at: 135 }], bat: 'V_0', extra: (f, cx, cy) => f.label(cx + 70, cy - 60, md`p_{\rm gas}\ \text{inside}`, 'l', 'small') });
  const sphQ = (lab, gndIt) => sph({ layers: [{ k: 'mball', r: 40, lab, at: 135 }], q: [[100, 0, '+', 'q', 'r']], gnd: gndIt, extra: (f, cx, cy) => { f.dim(cx, cy - 58, cx + 100, cy - 58, 'a', { at: 't' }); f.line(cx, cy - 42, cx, cy - 62, { cls: 'dim thin' }); f.line(cx + 100, cy - 9, cx + 100, cy - 62, { cls: 'dim thin' }); } });
  const fP13 = PF.row([{ svg: sphQ('V=0', true), cap: 'grounded' }, { svg: sphQ(md`Q=0`, false), cap: 'isolated, neutral' }]).svg;
  const fP14 = planeFig({ q: [[100, 80, '+', '+q', 'l'], [220, 80, '-', '-q', 'b']], dims: [[100, 80, 220, 80, '2d', { off: -22, at: 't' }], [220, 80, 220, 150, 'd', { off: -40, at: 'r' }]] });
  // solution figures (images replace the metal: dashed, unhatched)
  const fP13sol = (() => {
    const f = fig(); const cx = 140, cy = 100;
    f.circle(cx, cy, 50, { cls: 'dash dim' });
    f.charge(cx + 125, cy, { q: '+', lab: 'q', at: 'r' });
    f.charge(cx + 20, cy, { q: '-', lab: md`-\tfrac{qR}{a}`, at: 'b', image: true });
    f.charge(cx, cy, { q: '+', lab: md`+\tfrac{qR}{a}`, at: 't', image: true });
    f.dim(cx, cy + 45, cx + 20, cy + 45, md`\tfrac{R^2}{a}`, { at: 'b' });
    f.text(cx + 60, cy - 70, 'center image only for the neutral sphere', 'l');
    return f.svg();
  })();
  const fP14sol = (() => {
    const f = fig(); const y0 = 150;
    f.line(20, y0, 300, y0, { cls: 'dash dim' });
    f.charge(100, 80, { q: '+', lab: '+q', at: 'l' }); f.charge(220, 80, { q: '-', lab: '-q', at: 'r' });
    f.charge(100, 220, { q: '-', lab: '-q', at: 'l', image: true }); f.charge(220, 220, { q: '+', lab: '+q', at: 'r', image: true });
    f.line(100, 80, 220, 220, { cls: 'dim thin' }); f.label(150, 196, md`2\sqrt2\,d`, 'tr', 'small');
    f.text(296, 244, 'plane replaced by images', 'tr');
    return f.svg();
  })();

  // =====================================================================================
  // Lesson 4: energy problems, Level 1 to 6
  // =====================================================================================
  const L4 = {
    id: 'uD-energy-problems', title: 'Energy problems: assembly, conductors, images, forces',
    steps: [
      R(md`
        For every problem: decide which formula fits (point sum, $\tfrac12\int\rho V$, or $\tfrac{\varepsilon_0}{2}\int E^2$), say what is held fixed ($Q$ or $V$), and check the answer a second way when you can.

        ### Level 1: recognize
      `),
      P({
        id: 'uD-en-p1', title: 'A 3-4-5 triangle of charges',
        q: md`Charges $q$ at the origin, $-2q$ at $(3a,0)$ and $q$ at $(0,4a)$. How much work does it take to assemble them from infinity? What is the interaction energy of the two $+q$ charges alone?`,
        figHtml: fP1,
        hints: [md`Point charges: $W = \sum_{\text{pairs}}\dfrac{q_iq_j}{4\pi\varepsilon_0r_{ij}}$, one term per pair.`, md`Pairs: ($q$, $-2q$) at $3a$; ($q$, $q$) at $4a$; ($-2q$, $q$) at $5a$.`],
        parts: [
          { lbl: 'W', expr: '-49*q^2/(240*pi*eps0*a)', vars: { q: [1, 3], eps0: [0.5, 2], a: [0.5, 2] }, accepts: ['-(49/60)*q^2/(4*pi*eps0*a)'] },
          { lbl: md`Interaction energy of the two $+q$`, expr: 'q^2/(16*pi*eps0*a)', vars: { q: [1, 3], eps0: [0.5, 2], a: [0.5, 2] } },
        ],
        sol: md`
          $$W = \frac{q^2}{4\pi\varepsilon_0a}\left(-\frac23+\frac14-\frac25\right) = -\frac{49}{60}\,\frac{q^2}{4\pi\varepsilon_0a} = -\frac{49q^2}{240\pi\varepsilon_0a}.$$
          The $+q$ pair alone: $\dfrac{q^2}{4\pi\varepsilon_0(4a)} = \dfrac{q^2}{16\pi\varepsilon_0a}$.

          **Meaning:** $W<0$, so the field would do net positive work if you let the charges collapse; the configuration is bound. No self-energies appear: this formula counts pairs only.
        `,
      }),
      P({
        id: 'uD-en-p2', title: 'Where a shell keeps its energy',
        q: md`A thin shell of radius $R$ carries $Q$. Find the radius $r_1$ such that half of the total energy lies inside $r<r_1$, and the fraction stored in $R<r<3R$.`,
        figHtml: fP2,
        hints: [md`Energy in $R<r<r_1$: $\int_R^{r_1}\dfrac{\varepsilon_0}{2}E^2\,4\pi r^2dr$ with $E = \dfrac{Q}{4\pi\varepsilon_0r^2}$.`, md`The integral is $\dfrac{Q^2}{8\pi\varepsilon_0}\left(\dfrac1R-\dfrac1{r_1}\right)$.`],
        parts: [
          { lbl: md`$r_1$ in units of $R$`, ans: 2, unit: 'R' },
          { lbl: md`Fraction in $R<r<3R$`, ans: 0.6667, unit: '' },
        ],
        sol: md`
          Energy in $R<r<r_1$ over the total: $\dfrac{1/R-1/r_1}{1/R} = 1-\dfrac{R}{r_1}$. Half when $r_1 = 2R$. For $r_1 = 3R$: $1-\tfrac13 = \tfrac23$.

          **Intuition:** $u\,d\tau\propto dr/r^2$, so each doubling of the radius holds half of what remains.
        `,
      }),

      R(md`### Level 2: set up`),
      P({
        id: 'uD-en-p3', title: 'A charge into the middle of a shell',
        q: md`A shell of radius $R$ carries $Q$. You bring a point charge $q$ from infinity through a tiny hole to the center. How much work do you do? What is the total energy of the final arrangement, leaving out $q$'s own (infinite) self-energy?`,
        figHtml: fP3,
        hints: [md`Work to move $q$ slowly = $q\,\Delta V$ of the other charges.`, md`Inside the shell $V$ is constant.`, md`Total = shell self-energy + interaction.`],
        parts: [
          { lbl: md`Your work`, expr: 'q*Q/(4*pi*eps0*R)', vars: { q: [1, 3], Q: [1, 3], eps0: [0.5, 2], R: [0.5, 2] } },
          { lbl: md`Work if you stop at $r = R/2$ instead`, mc: [md`$\dfrac{qQ}{2\pi\varepsilon_0R}$`, md`half as much`, md`zero`, md`the same, $\dfrac{qQ}{4\pi\varepsilon_0R}$`], a: 3, why: [md`That uses the potential of a point charge $Q$ at the center; the shell's potential inside is constant.`, md`Inside, the field is zero; no extra work beyond the shell.`, md`Getting to the shell costs work.`, null] },
          { lbl: md`Total energy (no self-energy of $q$)`, expr: 'Q^2/(8*pi*eps0*R) + q*Q/(4*pi*eps0*R)', vars: { q: [1, 3], Q: [1, 3], eps0: [0.5, 2], R: [0.5, 2] } },
        ],
        sol: md`
          $W_{\rm you} = q[V(0)-V(\infty)] = \dfrac{qQ}{4\pi\varepsilon_0R}$. All of it is spent on the way to the shell; inside, the field vanishes.

          Total: $\dfrac{Q^2}{8\pi\varepsilon_0R}+\dfrac{qQ}{4\pi\varepsilon_0R}$. Field check: outside $R$ the field is that of $Q+q$, inside that of $q$ alone; the cross term $\varepsilon_0\int\vb E_q\cdot\vb E_Q$ lives only outside $R$ and gives $\dfrac{qQ}{4\pi\varepsilon_0R}$.
        `,
      }),
      P({
        id: 'uD-en-p4', title: 'Energy in a coaxial cable',
        q: md`A coaxial cable: inner conductor radius $a$ with $+\lambda$, outer conductor radius $b$ with $-\lambda$. Find the fraction of the energy per length stored in $a<s<\sqrt{ab}$, the capacitance per length from $W = \lambda^2/(2C')$, and the radius inside which a quarter of the energy sits.`,
        figHtml: fP4,
        hints: [md`$E = \dfrac{\lambda}{2\pi\varepsilon_0s}$ between, zero elsewhere.`, md`Energy per length in $a<s<s_1$: $\dfrac{\lambda^2}{4\pi\varepsilon_0}\ln\dfrac{s_1}{a}$.`],
        parts: [
          { lbl: md`Fraction in $a<s<\sqrt{ab}$`, ans: 0.5, unit: '' },
          { lbl: md`$C'$ (per length)`, expr: '2*pi*eps0/ln(b/a)', vars: { eps0: [0.5, 2], a: [0.5, 1], b: [2, 4] } },
          { lbl: md`Radius containing a quarter of the energy`, expr: 'a^(3/4)*b^(1/4)', vars: { a: [0.5, 1], b: [2, 4] }, accepts: ['(a^3*b)^(1/4)'] },
        ],
        sol: md`
          $$\frac{W'}{\text{length}}\Big|_a^{s_1} = \int_a^{s_1}\frac{\varepsilon_0}{2}\left(\frac{\lambda}{2\pi\varepsilon_0s}\right)^22\pi s\,ds = \frac{\lambda^2}{4\pi\varepsilon_0}\ln\frac{s_1}{a}.$$

          Total: $\dfrac{\lambda^2}{4\pi\varepsilon_0}\ln\dfrac ba$. The fraction is $\dfrac{\ln(s_1/a)}{\ln(b/a)}$: a half at $s_1 = \sqrt{ab}$ (the geometric mean), a quarter at $s_1 = a^{3/4}b^{1/4}$.

          $W' = \dfrac{\lambda^2}{2C'}$ gives $C' = \dfrac{2\pi\varepsilon_0}{\ln(b/a)}$, the same as from $\lambda/\Delta V$.
        `,
      }),

      R(md`### Level 3: the standard cases`),
      P({
        id: 'uD-en-p5', title: 'Shells with q and −2q',
        q: md`Concentric thin shells: $+q$ at radius $a$, $-2q$ at radius $b>a$. Find the total energy. Then, with the inner shell already charged, how much work does it take to bring the $-2q$ in from infinity and spread it on the outer shell?`,
        figHtml: fP5,
        hints: [md`$W = \dfrac{kQ_1^2}{2a}+\dfrac{kQ_2^2}{2b}+\dfrac{kQ_1Q_2}{b}$ with $k = 1/(4\pi\varepsilon_0)$.`, md`Second question: the outer shell's self-energy plus its interaction with the inner one.`],
        parts: [
          { lbl: 'Total energy', expr: 'q^2/(8*pi*eps0*a)', vars: { q: [1, 3], eps0: [0.5, 2], a: [0.5, 2] } },
          { lbl: md`Work to add the $-2q$ shell`, ans: 0, unit: '' },
          { lbl: md`Why is the total the same as the inner shell alone?`, mc: [md`Coincidence of the numbers`, md`The field between the shells is the same as for the inner shell alone, and outside $b$ the field of $-q$ carries exactly the energy that the field of $+q$ had there`, md`The outer shell has no self-energy`, md`The interaction energy is zero`], a: 1, why: [md`There is a reason: compare the field maps.`, null, md`Its self-energy is $\dfrac{k(2q)^2}{2b}$, cancelled by the interaction.`, md`It is $-\dfrac{2kq^2}{b}$.`] },
        ],
        sol: md`
          $$W = \frac{kq^2}{2a}+\frac{4kq^2}{2b}-\frac{2kq^2}{b} = \frac{kq^2}{2a} = \frac{q^2}{8\pi\varepsilon_0a}.$$

          Adding the outer shell: self $\dfrac{2kq^2}{b}$ plus interaction $-\dfrac{2kq^2}{b}$: zero.

          **Field check:** between, $E = kq/r^2$ (same as before); outside $b$, $E = -kq/r^2$, which has the same $E^2$ as before. Nothing changes in $\int E^2$, so the work is zero.
        `,
      }),
      P({
        id: 'uD-en-p6', title: 'A thick shell of uniform charge',
        q: md`Charge $Q$ is spread uniformly through the thick shell $R<r<2R$. Find its energy in units of $\dfrac{Q^2}{4\pi\varepsilon_0R}$.`,
        figHtml: fP6,
        hints: [md`Gauss: $Q(r) = Q\dfrac{r^3-R^3}{7R^3}$ for $R<r<2R$.`, md`$W = \tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ over $R<r<2R$ plus $r>2R$; the outer part is $\dfrac{Q^2}{8\pi\varepsilon_0(2R)}$.`],
        parts: [
          { lbl: md`$W$ in units of $\dfrac{Q^2}{4\pi\varepsilon_0R}$`, ans: 141 / 490, unit: '' },
        ],
        sol: md`
          Volume $\tfrac43\pi(8-1)R^3$, so $Q(r) = Q\dfrac{r^3-R^3}{7R^3}$ and $E = \dfrac{kQ(r^3-R^3)}{7R^3r^2}$.

          Inside the material, using $\tfrac{\varepsilon_0}{2}\cdot4\pi k^2 = \tfrac{k}{2}$:
          $$W_{\rm in} = \frac{k}{2}\,\frac{Q^2}{49R^6}\int_R^{2R}\frac{(r^3-R^3)^2}{r^2}\,dr,\qquad \int_R^{2R}\left(r^4-2R^3r+\frac{R^6}{r^2}\right)dr = R^5\left(\frac{31}{5}-3+\frac12\right) = \frac{37}{10}R^5.$$
          So $W_{\rm in} = \dfrac{37}{980}\dfrac{kQ^2}{R}$.

          Outside: $\dfrac{kQ^2}{4R} = \dfrac{245}{980}\dfrac{kQ^2}{R}$. Total: $\dfrac{282}{980} = \dfrac{141}{490}\approx0.288$ in units of $\dfrac{kQ^2}{R}$.

          **Check:** between the thin shell at $2R$ ($0.25$) and at $R$ ($0.5$), and closer to $2R$ because most of the volume, and charge, is near the outside.
        `,
      }),

      R(md`### Level 4: one twist`),
      P({
        id: 'uD-en-p7', title: 'Lifting a line charge above a grounded plane',
        q: md`A long line charge $\lambda$ runs parallel to a grounded plane at height $h$. How much work per length does it take to lift it slowly to $2h$? By how much does the stored energy per length change?`,
        figHtml: fP7,
        hints: [md`Image: $-\lambda$ at depth $h$. Force per length from the image: $\dfrac{\lambda^2}{2\pi\varepsilon_0(2z)}$.`, md`Integrate the force from $h$ to $2h$. (Using energies directly needs care: the self-energy per length is infinite, but it does not change.)`],
        parts: [
          { lbl: md`Work per length`, expr: 'lambda^2*ln(2)/(4*pi*eps0)', vars: { lambda: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`Change of stored energy per length`, mc: [md`$+\dfrac{\lambda^2\ln2}{4\pi\varepsilon_0}$`, md`$-\dfrac{\lambda^2\ln2}{4\pi\varepsilon_0}$`, md`$+\dfrac{\lambda^2\ln2}{2\pi\varepsilon_0}$`, md`infinite`], a: 0, why: [null, md`You did positive work and nothing else was involved (the plane is at $V = 0$): energy goes up.`, md`That is the image-pair change, twice the real one.`, md`The infinite self-energy is the same before and after.`] },
        ],
        sol: md`
          Force per length (toward the plane) at height $z$: $\lambda\cdot\dfrac{\lambda}{2\pi\varepsilon_0(2z)} = \dfrac{\lambda^2}{4\pi\varepsilon_0z}$. You pull up against it:
          $$W' = \int_h^{2h}\frac{\lambda^2}{4\pi\varepsilon_0z}dz = \frac{\lambda^2\ln2}{4\pi\varepsilon_0}.$$
          The stored energy per length rises by the same amount.

          **Energy route.** $W' = \tfrac12\lambda V_{\rm image}(\text{line}) + (\text{infinite self part, unchanged})$. The image $-\lambda$ at distance $2z$ gives $V_{\rm image} = \dfrac{\lambda}{2\pi\varepsilon_0}\ln(2z)+C$. So $\Delta W' = \tfrac12\lambda\cdot\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{4h}{2h} = \dfrac{\lambda^2\ln2}{4\pi\varepsilon_0}$, the same.
        `,
      }),
      P({
        id: 'uD-en-p8', title: 'Wrapping a charged sphere in neutral metal',
        q: md`A metal sphere (radius $a$, charge $Q$) is surrounded by a concentric neutral thick metal shell, inner radius $b$, outer radius $c$. Find the change in energy compared with the bare sphere, the fraction removed for $b = 2a$, $c = 4a$, and the new potential of the sphere.`,
        figHtml: fP8,
        hints: [md`The field is unchanged everywhere except inside the metal, where it vanishes.`, md`$V(a) = \int_a^\infty E\,dr$ with the gap $b<r<c$ removed.`],
        parts: [
          { lbl: md`$\Delta W$`, expr: '-Q^2*(c-b)/(8*pi*eps0*b*c)', vars: { Q: [1, 3], eps0: [0.5, 2], b: [1.5, 2], c: [2.5, 3.5] }, accepts: ['-Q^2/(8*pi*eps0)*(1/b - 1/c)'] },
          { lbl: md`Fraction removed for $b = 2a$, $c = 4a$`, ans: 0.25, unit: '' },
          { lbl: md`New potential of the sphere`, expr: 'Q/(4*pi*eps0)*(1/a - 1/b + 1/c)', vars: { Q: [1, 3], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 2], c: [2.5, 3.5] } },
        ],
        sol: md`
          Charges: $Q$ on the sphere, $-Q$ on $r = b$, $+Q$ on $r = c$. The field is $kQ/r^2$ except in $b<r<c$, where it is zero.

          $$\Delta W = -\int_b^c\frac{\varepsilon_0}{2}\left(\frac{kQ}{r^2}\right)^24\pi r^2dr = -\frac{Q^2}{8\pi\varepsilon_0}\left(\frac1b-\frac1c\right).$$

          Fraction: $\dfrac{1/b-1/c}{1/a} = \dfrac12-\dfrac14 = \dfrac14$. Potential: $kQ\left(\dfrac1a-\dfrac1b+\dfrac1c\right)$, lower than $kQ/a$: more capacitance, less energy for the same $Q$.

          **The general rule:** at fixed charges, introducing metal never raises the energy, because it removes field from its own volume (and the charges rearrange to lower it further).
        `,
      }),

      R(md`### Level 5: exam level`),
      P({
        id: 'uD-en-p9', title: 'A ball with charge density growing outward, two ways',
        q: md`A ball of radius $R$ has $\rho = \rho_0r/R$. Express everything in terms of its total charge $Q$. Find $Q$ in terms of $\rho_0$, the energy (by $\tfrac{\varepsilon_0}{2}\int E^2$ and by $\tfrac12\int\rho V$), the fraction of energy inside the ball, and $V$ at the center.`,
        figHtml: fP9,
        hints: [md`$Q(r) = \pi\rho_0r^4/R$, so $Q = \pi\rho_0R^3$ and inside $E = \dfrac{Qr^2}{4\pi\varepsilon_0R^4}$.`, md`$V(r) = \dfrac{Q}{4\pi\varepsilon_0R}+\int_r^RE\,dr' = \dfrac{Q}{4\pi\varepsilon_0R}\left(1+\dfrac{R^3-r^3}{3R^3}\right)$ inside.`, md`For $\tfrac12\int\rho V$ only the inside counts ($\rho = 0$ outside).`],
        parts: [
          { lbl: md`$Q$`, expr: 'pi*rho0*R^3', vars: { rho0: [1, 3], R: [0.5, 2] } },
          { lbl: md`$W$ in terms of $Q$`, expr: 'Q^2/(7*pi*eps0*R)', vars: { Q: [1, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['(4/7)*Q^2/(4*pi*eps0*R)'] },
          { lbl: md`Fraction of $W$ inside the ball`, ans: 0.125, unit: '' },
          { lbl: md`$V(0)$`, expr: 'Q/(3*pi*eps0*R)', vars: { Q: [1, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['(4/3)*Q/(4*pi*eps0*R)'] },
          { lbl: md`Compared with a uniform ball of the same $Q$ and $R$ ($\tfrac35$), this ball's $\tfrac47$ is smaller because...`, mc: [md`its charge is pushed outward, so less field fills the inside and the charges are farther apart on average`, md`it has less charge`, md`its outside field is weaker`, md`$\rho$ vanishes at the center, so the center contributes negative energy`], a: 0, why: [null, md`Same $Q$ by construction.`, md`Outside, both look like a point charge $Q$.`, md`Energy density is never negative.`] },
        ],
        sol: md`
          **Field method.** Inside: $W_{\rm in} = \dfrac{\varepsilon_0}{2}\int_0^R\left(\dfrac{kQr^2}{R^4}\right)^24\pi r^2dr = \dfrac{kQ^2}{14R}$. Outside: $\dfrac{kQ^2}{2R} = \dfrac{7kQ^2}{14R}$. Total $\dfrac{8kQ^2}{14R} = \dfrac47\dfrac{kQ^2}{R} = \dfrac{Q^2}{7\pi\varepsilon_0R}$. Inside fraction $\dfrac18$.

          **Charge method.** $V(r) = \dfrac{kQ}{R}\left(\dfrac43-\dfrac{r^3}{3R^3}\right)$ inside, so $V(0) = \dfrac{4kQ}{3R} = \dfrac{Q}{3\pi\varepsilon_0R}$.
          $$\frac12\int_0^R\frac{\rho_0r}{R}\,\frac{kQ}{R}\left(\frac43-\frac{r^3}{3R^3}\right)4\pi r^2dr = \frac{2\pi\rho_0kQ}{R^2}\left(\frac{R^4}{3}-\frac{R^4}{21}\right) = \frac{4\pi\rho_0kQR^2}{7} = \frac47\frac{kQ^2}{R}.$$
          The two methods agree, as they must.
        `,
      }),
      P({
        id: 'uD-en-p10', title: 'Connecting two concentric shells',
        q: md`Thin metal shells: inner (radius $a$) with charge $q$, outer (radius $b$) with charge $Q$. They are joined by a thin wire. Find the final charge on the inner shell and the energy released. What if $Q = -q$?`,
        figHtml: fP10,
        hints: [md`Joined means equal potentials; with nothing between them, the inner shell must end up with no charge.`, md`Energy before: $\dfrac{kq^2}{2a}+\dfrac{kQ^2}{2b}+\dfrac{kqQ}{b}$. After: $\dfrac{k(q+Q)^2}{2b}$.`],
        parts: [
          { lbl: md`Final charge on the inner shell`, ans: 0, unit: '' },
          { lbl: md`Energy released`, expr: 'q^2*(b-a)/(8*pi*eps0*a*b)', vars: { q: [1, 3], eps0: [0.5, 2], a: [0.5, 1], b: [1.5, 3] }, accepts: ['q^2/(8*pi*eps0)*(1/a - 1/b)'] },
          { lbl: md`For $Q = -q$, the fraction of the initial energy released is`, mc: [md`half`, md`$a/b$`, md`all of it`, md`none`], a: 2, why: [md`The final state has no field anywhere.`, md`No; the field between was the only field, and it is gone.`, null, md`The charges neutralize on the outer surface.`] },
        ],
        sol: md`
          Final: all charge $q+Q$ on the outer surface (a conductor's charge goes to its outermost surface).

          $$\Delta W = \frac{kq^2}{2a}+\frac{kQ^2}{2b}+\frac{kqQ}{b}-\frac{k(q+Q)^2}{2b} = \frac{kq^2}{2}\left(\frac1a-\frac1b\right).$$

          Independent of $Q$: only the field between the shells disappears; outside $b$ the field depends on $q+Q$ and does not change. For $Q = -q$, there was no field outside to begin with, so all the energy goes.
        `,
      }),
      P({
        id: 'uD-en-p11', title: 'A capacitor cycle with a battery',
        q: md`A parallel-plate capacitor (area $A$, gap $x$) sits on a battery $V_0$. Step 1: you pull the plates slowly to $3x$, still on the battery. Step 2: you disconnect the battery and push the plates back to $x$. Find the force on a plate at the start (both ways), your work in each step, and the net work done on the battery.`,
        figHtml: fP11,
        hints: [md`Step 1 (fixed $V_0$): $\Delta W = \tfrac12V_0^2\Delta C$, battery work $V_0\Delta Q = V_0^2\Delta C$, you $= \Delta W-W_{\rm battery}$.`, md`Step 2 (fixed $Q = C_0V_0/3$): $W = Q^2/(2C)$; your work = $\Delta W$.`, md`$C_0 = \varepsilon_0A/x$.`],
        parts: [
          { lbl: md`Attractive force on a plate at the start`, expr: 'eps0*A*V0^2/(2*x^2)', vars: { eps0: [0.5, 2], A: [1, 3], V0: [1, 3], x: [0.5, 2] } },
          { lbl: md`Your work in step 1`, expr: 'eps0*A*V0^2/(3*x)', vars: { eps0: [0.5, 2], A: [1, 3], V0: [1, 3], x: [0.5, 2] } },
          { lbl: md`Your work in step 2`, expr: '-eps0*A*V0^2/(9*x)', vars: { eps0: [0.5, 2], A: [1, 3], V0: [1, 3], x: [0.5, 2] } },
          { lbl: md`Work done **by** the battery over the cycle`, expr: '-2*eps0*A*V0^2/(3*x)', vars: { eps0: [0.5, 2], A: [1, 3], V0: [1, 3], x: [0.5, 2] } },
        ],
        sol: md`
          Let $C_0 = \varepsilon_0A/x$. **Force:** fixed $Q$: $Q^2/(2\varepsilon_0A)$ with $Q = C_0V_0$; fixed $V$: $\tfrac12V_0^2|dC/dx| = \dfrac{\varepsilon_0AV_0^2}{2x^2}$. Equal.

          **Step 1** ($C_0\to C_0/3$): $\Delta W_1 = -\tfrac13C_0V_0^2$. Battery: $V_0\Delta Q = -\tfrac23C_0V_0^2$ (it is charged). You: $\Delta W_1-W_{\rm bat} = +\tfrac13C_0V_0^2 = \dfrac{\varepsilon_0AV_0^2}{3x}$.

          **Step 2** ($Q = C_0V_0/3$, $C$: $C_0/3\to C_0$): $\Delta W_2 = \dfrac{Q^2}{2C_0}-\dfrac{3Q^2}{2C_0} = -\dfrac{C_0V_0^2}{9}$. The plates attract, you hold back: your work $-\dfrac{\varepsilon_0AV_0^2}{9x}$.

          **Books:** you $+\tfrac29C_0V_0^2$, battery $-\tfrac23C_0V_0^2$, stored $-\tfrac49C_0V_0^2$ (from $\tfrac12$ to $\tfrac1{18}$). $\tfrac29-\tfrac69 = -\tfrac49$. Balanced.
        `,
      }),
      P({
        id: 'uD-en-p12', title: 'A conducting bubble held at fixed potential',
        q: md`A thin conducting bubble of radius $R$ is held at potential $V_0$ (relative to infinity) by a battery. Find the outward electric pressure, the radius at which it equals a gas overpressure $p$, and, if the bubble grows from $R$ to $2R$, the work done by the electric forces and by the battery.`,
        figHtml: fP12,
        hints: [md`$\sigma = \varepsilon_0V_0/R$; pressure $\sigma^2/(2\varepsilon_0)$.`, md`Total outward force (generalized): $+\partial W/\partial R$ at fixed $V$, with $W = 2\pi\varepsilon_0RV_0^2$.`, md`Battery: $V_0\Delta Q$ with $Q = 4\pi\varepsilon_0RV_0$.`],
        parts: [
          { lbl: md`Pressure`, expr: 'eps0*V0^2/(2*R^2)', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2] } },
          { lbl: md`Radius where the pressure equals $p$`, expr: 'V0*sqrt(eps0/(2*p))', vars: { V0: [1, 3], eps0: [0.5, 2], p: [0.5, 2] } },
          { lbl: md`Work by the electric forces, $R\to2R$`, expr: '2*pi*eps0*V0^2*R', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2] } },
          { lbl: md`Work by the battery, $R\to2R$`, expr: '4*pi*eps0*V0^2*R', vars: { eps0: [0.5, 2], V0: [1, 3], R: [0.5, 2] } },
        ],
        sol: md`
          $\sigma = \varepsilon_0V_0/R$, so $P = \dfrac{\sigma^2}{2\varepsilon_0} = \dfrac{\varepsilon_0V_0^2}{2R^2}$. Setting $P = p$: $R = V_0\sqrt{\varepsilon_0/(2p)}$.

          Generalized force: $F_R = +\partial_R(2\pi\varepsilon_0RV_0^2) = 2\pi\varepsilon_0V_0^2$, constant (equals $P\cdot4\pi R^2$). Work by electric forces from $R$ to $2R$: $2\pi\varepsilon_0V_0^2R$.

          Battery: $\Delta Q = 4\pi\varepsilon_0RV_0$, work $V_0\Delta Q = 4\pi\varepsilon_0V_0^2R$. Stored energy rises by $2\pi\varepsilon_0V_0^2R$. Books: battery = stored increase + work on the bubble: $4 = 2+2$.

          **Compare fixed $Q$:** the energy would fall instead, but the force at the same state is the same.
        `,
      }),

      R(md`### Level 6: harder than the exam`),
      P({
        id: 'uD-en-p13', title: 'Energy of a charge near a grounded and a neutral sphere',
        q: md`A point charge $q$ sits a distance $a$ from the center of a metal sphere of radius $R$. Find the energy of the system (= the work to bring $q$ in from infinity) when the sphere is (i) grounded and (ii) isolated and neutral. Then give the ratio (ii)/(i) at $a = 2R$.`,
        figHtml: fP13,
        hints: [md`Images: grounded, $-qR/a$ at $R^2/a$. Neutral: add $+qR/a$ at the center.`, md`Energy $= \tfrac12qV_{\rm induced}(\vb r_q)$ in both cases (for the neutral sphere, the conductor's own term $\tfrac12V_sQ_s$ vanishes because $Q_s = 0$).`, md`Check by integrating the image force from infinity.`],
        parts: [
          { lbl: md`(i) grounded`, expr: '-q^2*R/(8*pi*eps0*(a^2 - R^2))', vars: { q: [1, 3], eps0: [0.5, 2], R: [0.5, 1], a: [1.5, 3] } },
          { lbl: md`(ii) neutral`, expr: '-q^2*R^3/(8*pi*eps0*a^2*(a^2 - R^2))', vars: { q: [1, 3], eps0: [0.5, 2], R: [0.5, 1], a: [1.5, 3] } },
          { lbl: md`Ratio (ii)/(i) at $a = 2R$`, ans: 0.25, unit: '' },
        ],
        sol: md`
          [[fig:img]]

          **BCs** (outside region): (i) $V = 0$ on $r = R$, $V\to0$; (ii) $V = V_s$ on $r = R$ with zero net charge, $V\to0$. The images satisfy them, so by uniqueness they give the right field outside.

          (i) $V_{\rm ind}(a) = \dfrac{-qR/a}{4\pi\varepsilon_0(a-R^2/a)} = -\dfrac{qR}{4\pi\varepsilon_0(a^2-R^2)}$; $W = \tfrac12qV_{\rm ind} = -\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}$.

          (ii) Add $\dfrac{qR/a}{4\pi\varepsilon_0a}$: $V_{\rm ind} = -\dfrac{qR}{4\pi\varepsilon_0}\left(\dfrac{1}{a^2-R^2}-\dfrac1{a^2}\right) = -\dfrac{qR^3}{4\pi\varepsilon_0a^2(a^2-R^2)}$, so $W = -\dfrac{q^2R^3}{8\pi\varepsilon_0a^2(a^2-R^2)}$.

          At $a = 2R$: (i) $-\dfrac{q^2}{6\cdot4\pi\varepsilon_0R}$, (ii) $-\dfrac{q^2}{24\cdot4\pi\varepsilon_0R}$, ratio $\tfrac14$. Integrating the image force from $\infty$ to $a$ reproduces both (checked).

          **Why** $\tfrac12qV_{\rm ind}$ for the neutral sphere: total $W = \tfrac12\left[qV(\vb r_q)+\oint\sigma V_s\,da\right]$; the second term is $\tfrac12V_s\cdot0$. Far away, the neutral sphere's energy falls off as $1/a^4$ (induced dipole), the grounded one as $1/a$.
        `,
        figs: { img: { svg: fP13sol, cap: 'Images (dashed): the sphere is replaced by them. The center image is present only for the neutral sphere.' } },
      }),
      P({
        id: 'uD-en-p14', title: 'Two opposite charges above a grounded plane',
        q: md`Charges $+q$ and $-q$ sit at height $d$ above a grounded plane, a distance $2d$ apart. Find the work to assemble this from infinity, and the work to bring in the $-q$ alone when the $+q$ is already in place.`,
        figHtml: fP14,
        hints: [md`Images: $-q$ below $+q$ and $+q$ below $-q$, each at depth $d$.`, md`$W = (\text{real-real pair}) + \tfrac12\sum_iq_iV_{\rm images}(\vb r_i)$: the real pair counts fully, image terms with $\tfrac12$.`, md`Bringing in $+q$ first costs $-\dfrac{q^2}{16\pi\varepsilon_0d}$; subtract.`],
        parts: [
          { lbl: md`$W$ (assembly)`, expr: 'q^2*(sqrt(2)/4 - 1)/(4*pi*eps0*d)', vars: { q: [1, 3], eps0: [0.5, 2], d: [0.5, 2] }, accepts: ['q^2*(sqrt(2)-4)/(16*pi*eps0*d)'] },
          { lbl: md`Work to bring in the $-q$ with $+q$ already there`, expr: 'q^2*(sqrt(2) - 3)/(16*pi*eps0*d)', vars: { q: [1, 3], eps0: [0.5, 2], d: [0.5, 2] } },
          { lbl: md`Compared with the same pair with no plane ($-\dfrac{q^2}{8\pi\varepsilon_0d}$), the plane makes $W$`, mc: [md`less negative: the images screen the attraction`, md`the same: the images cancel`, md`more negative: each charge is attracted to the plane`, md`zero`], a: 2, why: [md`Screening reduces the pair's mutual force at large distances, but the self-image attraction dominates here: $-0.65$ vs $-0.5$ in units of $kq^2/d$.`, md`They do not cancel; each charge sees its own image.`, null, md`Each charge is attracted to its own image, and the pair attract each other: the energy is clearly negative.`] },
        ],
        sol: md`
          [[fig:img]]

          Distances: real pair $2d$; each charge to its own image $2d$; each to the other's image $2\sqrt2\,d$. With $k = 1/(4\pi\varepsilon_0)$:
          $$W = -\frac{kq^2}{2d}+\frac12\left[q\left(-\frac{kq}{2d}+\frac{kq}{2\sqrt2d}\right)+(-q)\left(\frac{kq}{2d}-\frac{kq}{2\sqrt2d}\right)\right] = \frac{kq^2}{d}\left(\frac{\sqrt2}{4}-1\right)\approx-0.646\,\frac{kq^2}{d}.$$

          Second question: $W-\left(-\dfrac{kq^2}{4d}\right) = \dfrac{kq^2}{d}\left(\dfrac{\sqrt2}{4}-\dfrac34\right) = \dfrac{q^2(\sqrt2-3)}{16\pi\varepsilon_0d}$. Direct check: $-q$ moves in the potential of $+q$ and its image (full weight, they are fixed) and against its own image (weight $\tfrac12$): $-q\cdot kq\left(\dfrac1{2d}-\dfrac1{2\sqrt2d}\right)-\dfrac{kq^2}{4d}$, the same.

          **Rule:** fixed charges count fully; a charge's interaction with its **own** image counts half.
        `,
        figs: { img: { svg: fP14sol, cap: 'Images (dashed) replace the plane.' } },
      }),
      RF(md`
        !!key Patterns to remember
            - Point charges: one term per pair. Continuous: $\tfrac{\varepsilon_0}{2}\int E^2$ or $\tfrac12\int\rho V$, and check one with the other.
            - Energy changes are visible in the field map: removed field = released energy.
            - Charge near a grounded or neutral conductor: $W = \tfrac12qV_{\rm induced}$; own-image terms get $\tfrac12$, fixed charges count fully.
            - Batteries: $W_{\rm bat} = V\Delta Q = 2\Delta W$ at fixed $V$; write the full ledger and check it balances.
            - 2-D: only differences of energy per length are finite; integrate the force.
      `),
    ],
  };

  UNIT.lessons.push(L1, L2, L3, L4);
})();

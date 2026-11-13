/* gens-bk-a5.js — the book's Chapters 6 and 7 (the BJT): shared helpers for content/bk06-bjt-dc.js and
   content/bk07-bjt-model.js (window.BK5: TeX number formatting, the DC solvers of the course's model, circuit drawings,
   a plot drawer with labels, small SVG tools for the physical pictures) and the chapters' randomized drills (GENS.bk_*).

   The DC model is the course's: |V_BE| = 0.7 V when on, I_C = beta I_B in forward active (check NPN V_C >= V_B, PNP
   V_C <= V_B), |V_CE| = 0.2 V in saturation (then I_C < beta I_B). Small signal: g_m = I_C/V_T (V_T = 25 mV),
   r_pi = beta/g_m, r_o = V_A/I_C, r_e = alpha/g_m.
   Every generated problem carries _chk (its inputs and answers) so an outside script can recompute it: each formula
   here was checked against an independent nodal solve on 200+ random draws (scratchpad a5/). */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, par = U.par;
  const GENS = window.GENS;
  const VT = 0.025, VON = 0.7, VSAT = 0.2;

  // ================================================================ TeX numbers
  const T = {
    n: (x, s = 4) => f(x, s),
    V: (x, s = 4) => `${f(x, s)}\\,\\text{V}`,
    mV: (x, s = 3) => `${f(x * 1e3, s)}\\,\\text{mV}`,
    mA: (x, s = 4) => `${f(x * 1e3, s)}\\,\\text{mA}`,
    uA: (x, s = 4) => `${f(x * 1e6, s)}\\,\\mu\\text{A}`,
    kO: (r, s = 4) => `${f(r / 1e3, s)}\\,\\text{k}\\Omega`,
    mS: (g, s = 4) => `${f(g * 1e3, s)}\\,\\text{mS}`,
    R: (r, s = 4) => (r < 1e3 ? `${f(r, s)}\\,\\Omega` : r < 1e6 ? `${f(r / 1e3, s)}\\,\\text{k}\\Omega` : `${f(r / 1e6, s)}\\,\\text{M}\\Omega`),
    I: (i, s = 4) => (Math.abs(i) >= 0.9995e-3 ? T.mA(i, s) : T.uA(i, s)),
  };
  const kOs = (r) => `${f(r / 1e3, 3)}\\,\\text{k}\\Omega`;           // a resistor's value on a drawing
  const Vs = (v) => `${f(v, 3)}\\,\\text{V}`;

  // ================================================================ DC solvers (the course's piecewise model)
  // NPN: base fed from V_BB through R_B (the Thevenin form of any base network), R_C from V_CC to the collector (0 = none),
  // R_E from the emitter to -V_EE (V_EE >= 0; 0 = ground). Returns the solution and, if saturated, the failed active try.
  function npnDC(p) {
    const { VCC, VBB, RB = 0, RC = 0, RE = 0, VEE = 0, beta } = p;
    const drive = VBB + VEE - VON;
    if (drive <= 0) return { reg: 'off', IB: 0, IC: 0, IE: 0, VB: VBB, VE: -VEE, VC: VCC };
    const IB = drive / (RB + (beta + 1) * RE), IC = beta * IB, IE = IB + IC;
    const VE = -VEE + IE * RE, VB = VE + VON, VC = VCC - IC * RC;
    const act = { reg: 'act', IB, IC, IE, VE, VB, VC };
    if (VC >= VB - 1e-12) return act;
    // saturation, V_CE = 0.2 V, two unknowns:
    //   base loop       V_BB + V_EE - 0.7 = I_B R_B + (I_B + I_C) R_E
    //   collector loop  V_CC + V_EE - 0.2 = I_C R_C + (I_B + I_C) R_E
    const a11 = RB + RE, a12 = RE, b1 = drive, a21 = RE, a22 = RC + RE, b2 = VCC + VEE - VSAT;
    const det = a11 * a22 - a12 * a21;
    const sIB = (b1 * a22 - a12 * b2) / det, sIC = (a11 * b2 - a21 * b1) / det;
    const sVE = -VEE + (sIB + sIC) * RE;
    return { reg: 'sat', IB: sIB, IC: sIC, IE: sIB + sIC, VE: sVE, VB: sVE + VON, VC: sVE + VSAT, act };
  }
  // PNP: R_E from V_CC down to the emitter, base fed from V_BB through R_B, R_C from the collector to ground.
  function pnpDC(p) {
    const { VCC, VBB, RB = 0, RC = 0, RE = 0, beta } = p;
    const drive = VCC - VON - VBB;
    if (drive <= 0) return { reg: 'off', IB: 0, IC: 0, IE: 0, VB: VBB, VE: VCC, VC: 0 };
    const IB = drive / (RB + (beta + 1) * RE), IC = beta * IB, IE = IB + IC;
    const VE = VCC - IE * RE, VB = VE - VON, VC = IC * RC;
    const act = { reg: 'act', IB, IC, IE, VE, VB, VC };
    if (VC <= VB + 1e-12) return act;
    //   base loop       V_CC - 0.7 - V_BB = (I_B + I_C) R_E + I_B R_B
    //   collector loop  V_CC - 0.2        = (I_B + I_C) R_E + I_C R_C
    const a11 = RB + RE, a12 = RE, b1 = drive, a21 = RE, a22 = RC + RE, b2 = VCC - VSAT;
    const det = a11 * a22 - a12 * a21;
    const sIB = (b1 * a22 - a12 * b2) / det, sIC = (a11 * b2 - a21 * b1) / det;
    const sVE = VCC - (sIB + sIC) * RE;
    return { reg: 'sat', IB: sIB, IC: sIC, IE: sIB + sIC, VE: sVE, VB: sVE - VON, VC: sVE - VSAT, act };
  }
  // the divider's Thevenin twin
  const thev = (VCC, R1, R2) => ({ VBB: VCC * R2 / (R1 + R2), RB: par(R1, R2) });

  // ================================================================ circuit drawings (Schem netlists)
  // One BJT with its bias network. NPN at [2, 1]: C [2, 0], B [1, 1], E [2, 2]. PNP at [2, 1]: E [2, 0] on top, C [2, 2].
  // o: { type: 'npn'|'pnp', base: 'vbb'|'div'|'fixed'|'gnd'|'fb'|'vb', VCC, VBB, VB, RB, R1, R2, RC, RE, VEE, vals (show
  //      values, default true), nodes (label V_B, V_C, V_E), name }
  function biasFig(o) {
    const pnp = o.type === 'pnp', show = o.vals !== false;
    const s = (r) => (show && r !== undefined && r !== null && typeof r === 'number' ? kOs(r) : (typeof r === 'string' ? r : undefined));
    const top = -1.2;
    const railN = typeof o.VCC === 'number' ? `${f(o.VCC, 3)}\\,\\text{V}` : (o.VCC || 'V_{CC}');
    const e = [[pnp ? 'pnp' : 'npn', [2, 1], { n: o.name }], ['rail', [2, top], { n: railN }]];
    // upper element: R_C (NPN) or R_E (PNP)
    const upR = pnp ? o.RE : o.RC, upN = pnp ? 'R_E' : 'R_C';
    if (upR) e.push(['R', [2, top], [2, 0], { n: upN, s: s(upR) }]); else e.push(['w', [2, top], [2, 0]]);
    // lower element: R_E (NPN) or R_C (PNP), to ground or to -V_EE
    const loR = pnp ? o.RC : o.RE, loN = pnp ? 'R_C' : 'R_E';
    const negN = typeof o.VEE === 'number' ? `-${f(o.VEE, 3)}\\,\\text{V}` : '-V_{EE}';
    if (loR) {
      e.push(['R', [2, 2], [2, 3.2], { n: loN, s: s(loR) }]);
      e.push(o.VEE ? ['term', [2, 3.2], { n: negN, side: 'r' }] : ['gnd', [2, 3.2]]);
    } else if (o.VEE) e.push(['w', [2, 2], [2, 2.5]], ['term', [2, 2.5], { n: negN, side: 'r' }]);
    else e.push(['gnd', [2, 2]]);
    // the base network
    const b = o.base || 'vbb';
    if (b === 'vbb') {
      const vbbN = typeof o.VBB === 'number' ? Vs(o.VBB) : undefined;
      if (o.RB) e.push(['R', [-0.2, 1], [1, 1], { n: 'R_B', s: s(o.RB) }], ['V', [-0.2, 1], [-0.2, 2.2], { n: 'V_{BB}', s: vbbN, side: 'l' }], ['gnd', [-0.2, 2.2]]);
      else e.push(['w', [1, 1], [0.4, 1]], ['V', [0.4, 1], [0.4, 2.2], { n: 'V_{BB}', s: vbbN, side: 'l' }], ['gnd', [0.4, 2.2]]);
    } else if (b === 'vb') {
      e.push(['w', [1, 1], [0.4, 1]], ['V', [0.4, 1], [0.4, 2.2], { n: 'V_B', s: typeof o.VB === 'number' ? Vs(o.VB) : undefined, side: 'l' }], ['gnd', [0.4, 2.2]]);
    } else if (b === 'div') {
      e.push(['w', [0.6, top], [2, top]], ['R', [0.6, top], [0.6, 1], { n: 'R_1', s: s(o.R1), side: 'l' }],
        ['R', [0.6, 1], [0.6, 2.4], { n: 'R_2', s: s(o.R2), side: 'l' }], ['gnd', [0.6, 2.4]], ['w', [0.6, 1], [1, 1]]);
    } else if (b === 'fixed') {
      e.push(['w', [0.6, top], [2, top]], ['R', [0.6, top], [0.6, 1], { n: 'R_B', s: s(o.RB), side: 'l' }], ['w', [0.6, 1], [1, 1]]);
    } else if (b === 'gnd') {
      e.push(['R', [-0.2, 1], [1, 1], { n: 'R_B', s: s(o.RB) }], ['w', [-0.2, 1], [-0.2, 1.4]], ['gnd', [-0.2, 1.4]]);
    } else if (b === 'fb') {                // R_B from the collector (NPN) back to the base
      e.push(['w', [2, 0], [0.6, 0]], ['R', [0.6, 0], [0.6, 1], { n: 'R_B', s: s(o.RB), side: 'l' }], ['w', [0.6, 1], [1, 1]]);
    }
    if (o.nodes) {
      const lab = (pt, t, a = 'l') => ['txt', pt, `$${t}$`, { a }];
      // top node on the right of its lead, bottom node on the left of its lead, V_B under the base wire
      if (pnp) e.push(lab([2.18, 0.24], 'V_E'), lab([1.82, 2.14], 'V_C', 'r'), lab([0.86, 1.26], 'V_B', 'c'));
      else e.push(lab([2.18, 0.24], 'V_C'), lab([1.82, 2.14], 'V_E', 'r'), lab([0.86, 1.26], 'V_B', 'c'));
    }
    return e;
  }

  // ================================================================ plots (SVG with TeX labels, clipped to the axes)
  // o: { w, h, x: [x0, x1], y: [y0, y1], xt, yt: [v | [v, 'TeX']], xl, yl (TeX), curves: [{ f | pts, cls, from, to, n }],
  //      lines: [{ x1, y1, x2, y2, cls }], marks: [{ x, y, n, a }], labels: [{ x, y, t, a, cls }], bands: [{ x0, x1, cls }],
  //      grid (default true), aria }
  // Labels are TeX unless they start with '<'. Anchors: 'l' (text to the right of the point), 'r', 't' (below), 'b' (above), 'c'.
  function label(x, y, html, anchor = 'c', cls = '') {
    if (!html) return '';
    const w = 220, h = 60;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (anchor === 'l') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (anchor === 'r') { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (anchor === 't') { fy = y; ai = 'flex-start'; }
    if (anchor === 'b') { fy = y - h; ai = 'flex-end'; }
    return `<foreignObject x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">${html}</span></div></foreignObject>`;
  }
  const texL = (t) => (t === undefined || t === null || t === '' ? '' : String(t).startsWith('<') ? String(t) : `$${t}$`);
  function plot(o) {
    const W = o.w || 440, H = o.h || 270, ml = o.ml ?? 56, mr = o.mr ?? 24, mt = o.mt ?? 20, mb = o.mb ?? 42;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    const P = (x, y) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`;
    let s = `<svg class="plot" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${o.aria || 'plot'}">`;
    for (const b of (o.bands || [])) s += `<rect x="${X(b.x0).toFixed(1)}" y="${Y(y1).toFixed(1)}" width="${(X(b.x1) - X(b.x0)).toFixed(1)}" height="${(Y(y0) - Y(y1)).toFixed(1)}" style="fill:var(--fill);stroke:none"/>`;
    const tk = (t) => (Array.isArray(t) ? t : [t, f(t, 4)]);
    for (const t0 of (o.xt || [])) { const [v, l] = tk(t0); if (o.grid !== false) s += `<path class="grid" d="M${P(v, y0)}V${Y(y1).toFixed(1)}"/>`; s += label(X(v), Y(y0) + 5, `<span class="tick">${texL(l)}</span>`, 't'); }
    for (const t0 of (o.yt || [])) { const [v, l] = tk(t0); if (o.grid !== false) s += `<path class="grid" d="M${P(x0, v)}H${X(x1).toFixed(1)}"/>`; s += label(X(x0) - 6, Y(v), `<span class="tick">${texL(l)}</span>`, 'r'); }
    s += `<path class="axis" d="M${P(x0, y1)}V${Y(y0).toFixed(1)}H${X(x1).toFixed(1)}"/>`;
    const inY = (y) => y >= y0 - 1e-9 && y <= y1 + 1e-9;
    const pathOf = (pts) => {
      // split where the curve leaves the box; cut each crossing at the edge
      let d = '', pen = false;
      for (let i = 0; i < pts.length; i++) {
        const [x, y] = pts[i];
        if (!isFinite(y)) { pen = false; continue; }
        if (inY(y)) {
          if (!pen) {
            if (i > 0 && isFinite(pts[i - 1][1])) { const [xp, yp] = pts[i - 1]; const ye = yp > y1 ? y1 : y0; const xe = xp + (x - xp) * (ye - yp) / (y - yp); d += `M${P(xe, ye)}L${P(x, y)}`; } else d += `M${P(x, y)}`;
            pen = true;
          } else d += `L${P(x, y)}`;
        } else if (pen) {
          const [xp, yp] = pts[i - 1]; const ye = y > y1 ? y1 : y0; const xe = xp + (x - xp) * (ye - yp) / (y - yp);
          d += `L${P(xe, ye)}`; pen = false;
        }
      }
      return d;
    };
    for (const c of (o.curves || [])) {
      let pts = c.pts;
      if (c.f) { pts = []; const a = c.from ?? x0, b = c.to ?? x1, n = c.n || 240; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; pts.push([x, c.f(x)]); } }
      const d = pathOf(pts);
      if (d) s += `<path class="curve ${c.cls || ''}" d="${d}"/>`;
    }
    for (const l of (o.lines || [])) s += `<path class="curve ${l.cls || 'dc thin'}" d="M${P(l.x1, l.y1)}L${P(l.x2, l.y2)}"/>`;
    for (const m of (o.marks || [])) s += `<circle class="fill" cx="${X(m.x).toFixed(1)}" cy="${Y(m.y).toFixed(1)}" r="3.6"/>` + (m.n ? label(X(m.x) + (m.a === 'r' ? -8 : m.a === 'b' || m.a === 't' ? 0 : 8), Y(m.y) + (m.a === 't' ? 6 : m.a === 'b' ? -6 : -8), texL(m.n), m.a || 'l', 'small') : '');
    for (const l of (o.labels || [])) s += label(X(l.x), Y(l.y), texL(l.t), l.a || 'c', l.cls ?? 'small');
    s += label((X(x0) + X(x1)) / 2, H - 2, texL(o.xl), 'b', 'small');
    s += label(X(x0) + 6, Y(y1) - 4, texL(o.yl), 'l', 'small');
    return s + '</svg>';
  }

  // ================================================================ SVG tools for the physical pictures
  // A drawing in pixels (y down). Class "schem" gives it the site's strokes and fills (light and dark). Shapes that
  // labels sit on carry "nodecl" so the label declutterer leaves those labels alone.
  const svg = (w, h, body, aria = 'diagram') => `<svg class="schem" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${aria}">${body}</svg>`;
  const lab = (x, y, t, a = 'c', cls = '') => label(x, y, texL(t), a, cls);
  const head = (x, y, dx, dy, s = 7, cls = 'fill') => {
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux;
    return `<path class="${cls} nodecl" d="M${x},${y}L${(x - ux * s + px * s * 0.5).toFixed(1)},${(y - uy * s + py * s * 0.5).toFixed(1)}L${(x - ux * s - px * s * 0.5).toFixed(1)},${(y - uy * s - py * s * 0.5).toFixed(1)}Z"/>`;
  };
  // an arrow from (x1, y1) to (x2, y2); cls on the shaft ('' | 'dash' | 'thick'); color: 'accent' paints it in the accent color
  const arrow = (x1, y1, x2, y2, o = {}) => {
    const c = o.color === 'accent' ? 'var(--accent)' : o.color === 'dim' ? 'var(--dim)' : 'var(--fg)';
    const L = Math.hypot(x2 - x1, y2 - y1), s = o.s || 8;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    const ex = x2 - ux * s * 0.6, ey = y2 - uy * s * 0.6;
    return `<path class="${o.cls || ''} nodecl" style="stroke:${c}" d="M${x1},${y1}L${ex.toFixed(1)},${ey.toFixed(1)}"/>`
      + `<path class="nodecl" style="fill:${c};stroke:none" d="M${x2},${y2}L${(x2 - ux * s + px * s * 0.5).toFixed(1)},${(y2 - uy * s + py * s * 0.5).toFixed(1)}L${(x2 - ux * s - px * s * 0.5).toFixed(1)},${(y2 - uy * s - py * s * 0.5).toFixed(1)}Z"/>`;
  };
  const rect = (x, y, w, h, style) => `<rect class="nodecl" x="${x}" y="${y}" width="${w}" height="${h}" style="${style}"/>`;

  // one transistor with its three node voltages written at the leads
  function nodesFig(pnp, V, name) {
    const top = pnp ? 'E' : 'C', bot = pnp ? 'C' : 'E';
    return [[pnp ? 'pnp' : 'npn', [1, 1], { n: name }], ['w', [1, 0], [1, -0.3]], ['w', [1, 2], [1, 2.3]], ['w', [0, 1], [-0.3, 1]],
      ['txt', [1.2, -0.3], `$V_${top} = ${f(V[top], 3)}\\,\\text{V}$`, { a: 'l' }],
      ['txt', [1.2, 2.3], `$V_${bot} = ${f(V[bot], 3)}\\,\\text{V}$`, { a: 'l' }],
      ['txt', [-0.4, 1], `$V_B = ${f(V.B, 3)}\\,\\text{V}$`, { a: 'r' }]];
  }

  // a common-emitter amplifier with divider bias, coupling capacitors C_1, C_2 and (optionally) a bypassed R_E.
  // NPN at [3, 1]: C [3, 0], B [2, 1], E [3, 2]. o: { VCC, R1, R2, RC, RE, RL, RS, bypass, dc (draw only the DC circuit), vals }
  function ampFig(o) {
    const show = o.vals !== false;
    const s = (r) => (show && typeof r === 'number' ? kOs(r) : undefined);
    const railN = typeof o.VCC === 'number' ? `${f(o.VCC, 3)}\\,\\text{V}` : 'V_{CC}';
    const e = [['npn', [3, 1]], ['rail', [3, -1.2], { n: railN }], ['w', [1.6, -1.2], [3, -1.2]],
      ['R', [1.6, -1.2], [1.6, 1], { n: 'R_1', s: s(o.R1) }], ['R', [1.6, 1], [1.6, 2.6], { n: 'R_2', s: s(o.R2) }], ['gnd', [1.6, 2.6]],
      ['w', [1.6, 1], [2, 1]], ['R', [3, -1.2], [3, 0], { n: 'R_C', s: s(o.RC) }]];
    const byp = o.bypass && !o.dc;
    if (o.RE) {
      e.push(['R', [3, 2], [3, 3.2], { n: 'R_E', s: s(o.RE), side: byp ? 'l' : 'r' }], ['gnd', [3, 3.2]]);
      if (byp) e.push(['w', [3, 2], [3.8, 2]], ['C', [3.8, 2], [3.8, 3.2], { n: 'C_E' }], ['w', [3.8, 3.2], [3, 3.2]]);
    } else e.push(['gnd', [3, 2]]);
    if (!o.dc) {
      e.push(['C', [0.5, 1], [1.6, 1], { n: 'C_1' }]);
      if (o.RS) e.push(['R', [-0.8, 1], [0.5, 1], { n: 'R_S', s: s(o.RS) }], ['Vac', [-0.8, 1], [-0.8, 2.2], { n: 'v_s', side: 'l' }], ['gnd', [-0.8, 2.2]]);
      else e.push(['w', [0.5, 1], [0.2, 1]], ['Vac', [0.2, 1], [0.2, 2.2], { n: 'v_s', side: 'l' }], ['gnd', [0.2, 2.2]]);
      e.push(['w', [3, 0], [3.5, 0]], ['C', [3.5, 0], [4.6, 0], { n: 'C_2' }]);
      if (o.RL) e.push(['R', [4.6, 0], [4.6, 1.4], { n: 'R_L', s: s(o.RL) }], ['gnd', [4.6, 1.4]], ['w', [4.6, 0], [5.1, 0]], ['term', [5.1, 0], { n: 'v_{out}' }]);
      else e.push(['w', [4.6, 0], [4.9, 0]], ['term', [4.9, 0], { n: 'v_{out}' }]);
    }
    return e;
  }

  window.BK5 = { VT, VON, VSAT, T, kOs, Vs, npnDC, pnpDC, thev, biasFig, nodesFig, ampFig, plot, label, texL, svg, lab, head, arrow, rect, par };

  // ================================================================ drills
  const r2 = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
  const notNear = (traps, goods) => traps.filter((t) => isFinite(t.v) && goods.every((g) => Math.abs(t.v - g) > 0.02 * Math.abs(g)));

  // ---------------------------------------------------------------- the three currents, alpha and beta
  GENS.bk_cur = () => {
    const mode = pick(['bIB', 'bIE', 'aIC', 'ICIE', 'IBIE', 'bIC']);
    const beta = pick([50, 80, 100, 100, 120, 150, 200, 250, 300]);
    const IC = pick([0.2, 0.25, 0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5]) * 1e-3;
    const IB = IC / beta, IE = IC + IB, alpha = beta / (beta + 1);
    const alphaPart = { lbl: '\\alpha', unit: '', ans: alpha, tol: { rel: 0.0006 } };
    let q, parts, sol, hints;
    const kcl = `KCL on the whole transistor (current cannot pile up inside it): $I_E = I_C + I_B$.`;
    if (mode === 'bIB') {
      q = `A BJT in forward active has $\\beta = ${beta}$ and a base current $I_B = ${T.uA(IB)}$. Find $I_C$, $I_E$ and $\\alpha$ ($\\alpha$ to four decimals).`;
      parts = [{ lbl: 'I_C', unit: 'mA', ans: IC * 1e3 }, { lbl: 'I_E', unit: 'mA', ans: IE * 1e3, traps: notNear([{ v: IC * 1e3, msg: 'That is $I_C$. The emitter carries the collector current **and** the base current: $I_E = (\\beta + 1)I_B$.' }], [IE * 1e3]) }, alphaPart];
      hints = ['$I_C = \\beta I_B$.', kcl, '$\\alpha = I_C/I_E = \\beta/(\\beta + 1)$.'];
      sol = `1. $I_C = \\beta I_B = ${beta}\\times${T.uA(IB)} = ${T.mA(IC)}$.
2. ${kcl} So $I_E = ${T.mA(IC)} + ${T.uA(IB)} = ${T.mA(IE)}$, which is $(\\beta + 1)I_B = ${beta + 1}\\times${T.uA(IB)}$.
3. $\\alpha = \\dfrac{I_C}{I_E} = \\dfrac{\\beta}{\\beta + 1} = \\dfrac{${beta}}{${beta + 1}} = ${f(alpha, 5)}$.

The collector gets the fraction $\\alpha$ of the emitter's current; the base supplies the missing $${f((1 - alpha) * 100, 3)}\\%$.`;
    } else if (mode === 'bIE') {
      q = `A BJT in forward active has $\\beta = ${beta}$ and carries $I_E = ${T.mA(IE)}$ in its emitter. Find $I_B$, $I_C$ and $\\alpha$ ($\\alpha$ to four decimals).`;
      parts = [{ lbl: 'I_B', unit: 'µA', ans: IB * 1e6, traps: notNear([{ v: IE / beta * 1e6, msg: 'You divided $I_E$ by $\\beta$. The emitter carries $(\\beta + 1)$ base currents: $I_B = I_E/(\\beta + 1)$.' }], [IB * 1e6]) }, { lbl: 'I_C', unit: 'mA', ans: IC * 1e3 }, alphaPart];
      hints = [kcl + ' With $I_C = \\beta I_B$ that is $I_E = (\\beta + 1)I_B$.', '$\\alpha = \\beta/(\\beta + 1)$, and $I_C = \\alpha I_E$.'];
      sol = `1. $I_E = I_C + I_B = \\beta I_B + I_B = (\\beta + 1)I_B$, so $I_B = \\dfrac{I_E}{\\beta + 1} = \\dfrac{${T.mA(IE)}}{${beta + 1}} = ${T.uA(IB)}$.
2. $I_C = \\beta I_B = ${T.mA(IC)}$ (or $I_E - I_B$: same thing).
3. $\\alpha = \\dfrac{\\beta}{\\beta + 1} = ${f(alpha, 5)}$, and indeed $\\alpha I_E = ${T.mA(alpha * IE)} = I_C$.`;
    } else if (mode === 'aIC') {
      const a = alpha;
      q = `A BJT has $\\alpha = ${f(a, 5)}$ and runs at $I_C = ${T.mA(IC)}$. Find $\\beta$, $I_B$ and $I_E$.`;
      parts = [{ lbl: '\\beta', unit: '', ans: beta, traps: notNear([{ v: 1 / (1 - a), msg: 'That is $1/(1 - \\alpha) = \\beta + 1$. The ratio of collector to base current is $\\alpha/(1 - \\alpha)$.' }], [beta]) },
        { lbl: 'I_B', unit: 'µA', ans: IB * 1e6 }, { lbl: 'I_E', unit: 'mA', ans: IE * 1e3 }];
      hints = ['$\\alpha = \\beta/(\\beta + 1)$; solve for $\\beta$: $\\beta = \\alpha/(1 - \\alpha)$.', '$I_B = I_C/\\beta$, $I_E = I_C/\\alpha$.'];
      sol = `1. From $\\alpha = \\dfrac{\\beta}{\\beta + 1}$: $\\alpha\\beta + \\alpha = \\beta$, so $\\beta = \\dfrac{\\alpha}{1 - \\alpha} = \\dfrac{${f(a, 5)}}{${f(1 - a, 4)}} = ${f(beta, 4)}$.
2. $I_B = I_C/\\beta = ${T.uA(IB)}$.
3. $I_E = I_C/\\alpha = I_C + I_B = ${T.mA(IE)}$.

Notice how sensitive $\\beta$ is to $\\alpha$: $1 - \\alpha = ${f(1 - a, 3)}$ is a small difference of two numbers near 1, so a change of $\\alpha$ in the third decimal changes $\\beta$ a lot. That is why $\\beta$ varies so much from transistor to transistor.`;
    } else if (mode === 'ICIE') {
      q = `You measure a forward-active BJT: $I_C = ${T.mA(IC, 6)}$ and $I_E = ${T.mA(IE, 6)}$. Find $I_B$, $\\beta$ and $\\alpha$ ($\\alpha$ to four decimals).`;
      parts = [{ lbl: 'I_B', unit: 'µA', ans: IB * 1e6 }, { lbl: '\\beta', unit: '', ans: beta }, alphaPart];
      hints = [kcl, '$\\beta = I_C/I_B$, $\\alpha = I_C/I_E$.'];
      sol = `1. ${kcl} So $I_B = I_E - I_C = ${T.mA(IE, 6)} - ${T.mA(IC, 6)} = ${T.uA(IB)}$.
2. $\\beta = I_C/I_B = ${T.mA(IC)}/${T.uA(IB)} = ${f(beta, 4)}$.
3. $\\alpha = I_C/I_E = ${f(alpha, 5)}$ (check: $\\beta/(\\beta + 1) = ${beta}/${beta + 1}$ ✓).

A measurement like this needs care: $I_B$ is a small difference of two nearly equal currents, so a 0.1% error in either meter is a big error in $\\beta$.`;
    } else if (mode === 'IBIE') {
      q = `A forward-active BJT draws $I_B = ${T.uA(IB)}$ into its base, and $I_E = ${T.mA(IE)}$ flows out of its emitter. Find $\\beta$, $I_C$ and $\\alpha$ ($\\alpha$ to four decimals).`;
      parts = [{ lbl: '\\beta', unit: '', ans: beta, traps: notNear([{ v: IE / IB, msg: 'That is $I_E/I_B = \\beta + 1$. $\\beta$ is the ratio of the **collector** current to the base current.' }], [beta]) }, { lbl: 'I_C', unit: 'mA', ans: IC * 1e3 }, alphaPart];
      hints = [kcl + ' So $I_C = I_E - I_B$.', '$\\beta = I_C/I_B$, $\\alpha = I_C/I_E$.'];
      sol = `1. $I_C = I_E - I_B = ${T.mA(IE)} - ${T.uA(IB)} = ${T.mA(IC)}$.
2. $\\beta = I_C/I_B = ${f(beta, 4)}$ (and $I_E/I_B = ${beta + 1} = \\beta + 1$ ✓).
3. $\\alpha = I_C/I_E = ${f(alpha, 5)}$.`;
    } else {
      q = `A BJT with $\\beta = ${beta}$ must deliver $I_C = ${T.mA(IC)}$. How much base current must the bias network supply, and what flows in the emitter? Give $\\alpha$ to four decimals.`;
      parts = [{ lbl: 'I_B', unit: 'µA', ans: IB * 1e6 }, { lbl: 'I_E', unit: 'mA', ans: IE * 1e3 }, alphaPart];
      hints = ['$I_B = I_C/\\beta$.', kcl];
      sol = `1. $I_B = I_C/\\beta = ${T.mA(IC)}/${beta} = ${T.uA(IB)}$.
2. $I_E = I_C + I_B = ${T.mA(IE)}$.
3. $\\alpha = \\beta/(\\beta + 1) = ${f(alpha, 5)}$.

Rule of thumb: the base current is about $1/\\beta$ of the collector current, here ${f(100 / beta, 3)}%, and the emitter current is bigger than $I_C$ by the same small amount.`;
    }
    // I_C and I_E differ by only 1/beta: their boxes need four significant figures to tell them apart
    parts.forEach((p) => { if (p.lbl === 'I_E' || p.lbl === 'I_C') { p.tol = { rel: 0.001 }; delete p.traps; } });
    q += ' Give currents to four significant figures.';
    return { q, parts, hints, sol, _chk: { kind: 'cur', mode, beta, IC } };
  };

  // ---------------------------------------------------------------- the exponential law: 60 mV per decade
  GENS.bk_vbe = () => {
    const mode = pick(['dv', 'dv', 'ratio', 'is', 'newi']);
    const VBE1 = pick([0.62, 0.65, 0.66, 0.68, 0.7, 0.7, 0.72]);
    const IC1 = pick([0.1, 0.2, 0.5, 1, 1, 2]) * 1e-3;
    const ln = Math.log;
    if (mode === 'dv') {
      const k = pick([10, 100, 2, 0.5, 0.1, 5, 0.2, 4, 1000]);
      const dV = VT * ln(k), V2 = VBE1 + dV, IC2 = IC1 * k;
      return {
        q: `A BJT carries $I_C = ${T.I(IC1)}$ at $V_{BE} = ${f(VBE1 * 1e3, 4)}\\,\\text{mV}$. By how much must $V_{BE}$ change to give $I_C = ${T.I(IC2)}$, and what is the new $V_{BE}$? ($V_T = 25\\,\\text{mV}$; a decrease is negative.)`,
        parts: [{ lbl: '\\Delta V_{BE}', unit: 'mV', ans: dV * 1e3, tol: { rel: 0.015, abs: 0.05 } }, { lbl: 'V_{BE}', unit: 'mV', ans: V2 * 1e3, tol: { rel: 0, abs: 1.5 } }],
        hints: ['Divide the two exponentials: $I_{C2}/I_{C1} = e^{\\Delta V_{BE}/V_T}$.', 'So $\\Delta V_{BE} = V_T\\ln(I_{C2}/I_{C1})$. $V_T\\ln 10 = 57.6\\,\\text{mV}$ and $V_T\\ln 2 = 17.3\\,\\text{mV}$.'],
        sol: `$I_S$ is the same at both points, so divide the two laws:
$$\\frac{I_{C2}}{I_{C1}} = \\frac{I_Se^{V_{BE2}/V_T}}{I_Se^{V_{BE1}/V_T}} = e^{(V_{BE2} - V_{BE1})/V_T}\\quad\\Rightarrow\\quad \\Delta V_{BE} = V_T\\ln\\frac{I_{C2}}{I_{C1}}$$
Here the ratio is $${f(k, 4)}$:
$$\\Delta V_{BE} = 25\\,\\text{mV}\\times\\ln(${f(k, 4)}) = ${f(dV * 1e3, 4)}\\,\\text{mV}$$
so $V_{BE} = ${f(VBE1 * 1e3, 4)} ${dV >= 0 ? '+' : '-'} ${f(Math.abs(dV) * 1e3, 4)} = ${f(V2 * 1e3, 4)}\\,\\text{mV}$.

Feel for it: every factor of 10 in current costs $57.6\\,\\text{mV}$ (about 60), every factor of 2 costs $17.3\\,\\text{mV}$. A ${f(k, 4)}× change in current moves $V_{BE}$ by only ${f(Math.abs(dV) * 1e3, 3)} mV, which is why we can call it $0.7\\,\\text{V}$ in DC work.`,
        _chk: { kind: 'vbe', mode, VBE1, IC1, k, ans: [dV * 1e3, V2 * 1e3] },
      };
    }
    if (mode === 'ratio') {
      const dV = pick([10, 18, 25, 30, 36, 50, -10, -25, -36, 60, 90]) * 1e-3;
      const k = Math.exp(dV / VT);
      return {
        q: `A BJT runs at $I_C = ${T.I(IC1)}$. Its base–emitter voltage is raised by $${f(dV * 1e3, 3)}\\,\\text{mV}$ (a negative number means lowered). By what factor does $I_C$ change, and what is the new $I_C$? ($V_T = 25\\,\\text{mV}$.)`,
        parts: [{ lbl: 'I_{C2}/I_{C1}', unit: '', ans: k, traps: notNear([{ v: 1 + dV / VT, msg: 'That is the straight-line (small-signal) estimate $1 + \\Delta V/V_T$. For a change this size use the exponential itself: $e^{\\Delta V/V_T}$.' }], [k]) }, { lbl: 'I_{C2}', unit: 'mA', ans: IC1 * k * 1e3 }],
        hints: ['$I_{C2}/I_{C1} = e^{\\Delta V_{BE}/V_T}$.'],
        sol: `Dividing the two exponential laws, $I_S$ cancels:
$$\\frac{I_{C2}}{I_{C1}} = e^{\\Delta V_{BE}/V_T} = e^{${f(dV * 1e3, 3)}/25} = e^{${f(dV / VT, 4)}} = ${f(k, 4)}$$
so $I_{C2} = ${f(k, 4)}\\times${T.I(IC1)} = ${T.I(IC1 * k)}$.

${Math.abs(dV) <= 0.006 ? `For a change this small the straight line $1 + \\Delta V/V_T = ${f(1 + dV / VT, 4)}$ is close: that is the small-signal idea of Chapter 7.` : `The straight line $1 + \\Delta V/V_T = ${f(1 + dV / VT, 4)}$ would be ${Math.abs(dV / VT) > 0.5 ? 'badly' : 'noticeably'} wrong here: ${f(Math.abs(dV) * 1e3, 3)} mV is not small next to $V_T = 25\\,\\text{mV}$. Chapter 7 makes "small" precise.`}`,
        _chk: { kind: 'vbe', mode, IC1, dV, ans: [k, IC1 * k * 1e3] },
      };
    }
    if (mode === 'is') {
      const IS = IC1 * Math.exp(-VBE1 / VT);
      const e = Math.floor(Math.log10(IS));
      const m = IS / 10 ** e;
      return {
        q: `A BJT carries $I_C = ${T.I(IC1)}$ at $V_{BE} = ${f(VBE1 * 1e3, 4)}\\,\\text{mV}$. Find its saturation current $I_S$ in femtoamps ($1\\,\\text{fA} = 10^{-15}\\,\\text{A}$; type e.g. \`0.69\`), and the $V_{BE}$ it needs for $10\\times$ that current.`,
        parts: [{ lbl: 'I_S', unit: 'fA', ans: IS * 1e15 }, { lbl: 'V_{BE}\\ (10\\times)', unit: 'mV', ans: (VBE1 + VT * ln(10)) * 1e3, tol: { rel: 0, abs: 1.5 } }],
        hints: ['$I_S = I_Ce^{-V_{BE}/V_T}$.', 'Ten times the current costs $V_T\\ln10 = 57.6\\,\\text{mV}$ more.'],
        sol: `1. $I_S = I_C\\,e^{-V_{BE}/V_T} = ${T.I(IC1)}\\times e^{-${f(VBE1 * 1e3, 4)}/25} = ${T.I(IC1)}\\times e^{-${f(VBE1 / VT, 4)}} = ${f(m, 3)}\\times10^{${e}}\\,\\text{A} = ${f(IS * 1e15, 3)}\\,\\text{fA}$.
2. $V_{BE} = V_T\\ln(I_C/I_S)$; ten times the current adds $V_T\\ln10 = 57.6\\,\\text{mV}$: $V_{BE} = ${f((VBE1 + VT * ln(10)) * 1e3, 4)}\\,\\text{mV}$.

$I_S$ is tiny because it is proportional to $n_i^2\\approx10^{20}\\,\\text{cm}^{-6}$ divided by a large doping: the exponential has to climb a long way before the current is useful. That is why every silicon BJT needs about $0.6$ to $0.8\\,\\text{V}$.`,
        _chk: { kind: 'vbe', mode, VBE1, IC1, ans: [IS * 1e15, (VBE1 + VT * ln(10)) * 1e3] },
      };
    }
    // two transistors, one area A, the other n times bigger, same current: V_BE difference
    const n = pick([2, 4, 8, 10, 16, 100]);
    const dV = VT * ln(n);
    return {
      q: `Two BJTs carry the same $I_C = ${T.I(IC1)}$. Transistor $Q_2$ has ${n} times the emitter area of $Q_1$, so ${n} times the $I_S$. $Q_1$ needs $V_{BE1} = ${f(VBE1 * 1e3, 4)}\\,\\text{mV}$. What does $Q_2$ need?`,
      parts: [{ lbl: 'V_{BE2}', unit: 'mV', ans: (VBE1 - dV) * 1e3, tol: { rel: 0, abs: 1.5 }, traps: notNear([{ v: (VBE1 + dV) * 1e3, msg: 'Wrong direction: a bigger transistor needs **less** $V_{BE}$ for the same current (its $I_S$ is bigger).' }], [(VBE1 - dV) * 1e3]) }],
      hints: ['$V_{BE} = V_T\\ln(I_C/I_S)$; a bigger $I_S$ means a smaller logarithm.'],
      sol: `$V_{BE} = V_T\\ln(I_C/I_S)$, so with the same $I_C$:
$$V_{BE2} - V_{BE1} = V_T\\ln\\frac{I_{S1}}{I_{S2}} = -V_T\\ln ${n} = -${f(dV * 1e3, 4)}\\,\\text{mV}$$
$V_{BE2} = ${f((VBE1 - dV) * 1e3, 4)}\\,\\text{mV}$. The current per unit area is ${n} times smaller in $Q_2$, so its junction needs less push. (Note what does **not** change with area: $g_m = I_C/V_T$, Chapter 7.)`,
      _chk: { kind: 'vbe', mode: 'area', VBE1, n, ans: [(VBE1 - dV) * 1e3] },
    };
  };

  // ---------------------------------------------------------------- regions from node voltages
  const REGS = ['Forward active', 'Saturation', 'Cutoff', 'Reverse active'];
  GENS.bk_reg = (opts = {}) => {
    const pnp = opts.pnp ? true : opts.mix ? pick([false, true]) : false;
    const reg = pick([0, 0, 0, 1, 1, 2, 3]);
    // build in NPN coordinates (x = V for an NPN, x = V_top - V for a PNP)
    const e = pick([0, 0, 0.3, 0.5, 1, 1.3, 2]);
    let b, c;
    if (reg === 0) { b = e + pick([0.65, 0.7, 0.7, 0.75]); c = b + pick([0.3, 0.8, 1.5, 2.5, 3.3, 4.5]); }
    else if (reg === 1) { b = e + pick([0.7, 0.75, 0.8]); c = e + pick([0.1, 0.15, 0.2, 0.25]); }
    else if (reg === 2) { b = e + pick([0, 0.1, 0.2, 0.3, -0.5, -1]); c = b + pick([1, 2, 4]); }
    else { c = e - pick([1, 1.5, 2, 3]); b = c + pick([0.65, 0.7]); }
    const r2v = (x) => Math.round(x * 100) / 100;
    const top0 = Math.max(e, b, c) > 4.5 ? 10 : pick([5, 10]);
    const V = pnp ? { E: r2v(top0 - e), B: r2v(top0 - b), C: r2v(top0 - c) } : { E: r2v(e), B: r2v(b), C: r2v(c) };
    const vbe = r2v(pnp ? V.E - V.B : V.B - V.E), vbc = r2v(pnp ? V.C - V.B : V.B - V.C);
    const nm = pnp ? ['V_{EB}', 'V_{CB}'] : ['V_{BE}', 'V_{BC}'];
    const beOn = vbe >= 0.6, bcOn = vbc >= 0.4;
    const why = [
      'Forward active needs the BE junction **on** and the BC junction **off**.',
      'Saturation needs **both** junctions on (and then $|V_{CE}|$ is only about $0.2\\,\\text{V}$).',
      'Cutoff needs **both** junctions off: no injection, no current.',
      'Reverse active is BE off with BC on: the transistor used upside down.',
    ].map((w, j) => (j === reg ? null : w));
    const meaning = [
      'Forward active: the BE junction injects, the reverse-biased BC junction collects, and $I_C = \\beta I_B$. This is the amplifier region.',
      `Saturation: both junctions inject, the collector has fallen to within $${f(Math.abs(V.C - V.E), 3)}\\,\\text{V}$ of the emitter, and the outside circuit, not $\\beta$, sets $I_C$ (now $I_C < \\beta I_B$). A closed switch.`,
      `Cutoff: with $${nm[0]} = ${f(vbe, 3)}\\,\\text{V}$ the injected current is negligible (every $60\\,\\text{mV}$ below about $0.7\\,\\text{V}$ is another factor of 10 less). An open switch.`,
      'Reverse active: the collector junction injects and the emitter collects. It works badly ($\\beta_R$ is about 0.1 to 5), and no circuit in this course uses it on purpose.',
    ][reg];
    const jv = (k) => (k === 0 ? (pnp ? `V_E - V_B = ${f(V.E, 3)} - ${f(V.B, 3)}` : `V_B - V_E = ${f(V.B, 3)} - ${f(V.E, 3)}`)
      : (pnp ? `V_C - V_B = ${f(V.C, 3)} - ${f(V.B, 3)}` : `V_B - V_C = ${f(V.B, 3)} - ${f(V.C, 3)}`));
    return {
      fig: nodesFig(pnp, V),
      q: `A${pnp ? ' PNP' : 'n NPN'} has the node voltages shown. Find the two junction voltages, then the region. (A junction is on with about $0.7\\,\\text{V}$ of forward bias; take a base–collector junction as forward biased from about $0.4\\,\\text{V}$.)`,
      parts: [
        { lbl: nm[0], unit: 'V', ans: vbe, tol: { rel: 0, abs: 0.006 } },
        { lbl: nm[1], unit: 'V', ans: vbc, tol: { rel: 0, abs: 0.006 } },
        { lbl: 'Region', mc: REGS, a: reg, fixed: true, why },
      ],
      hints: [pnp ? 'PNP: every voltage is flipped. $V_{EB} = V_E - V_B$ and $V_{CB} = V_C - V_B$; a junction is forward biased when its **p** side (emitter or collector) is above its **n** side (the base).'
        : 'NPN: $V_{BE} = V_B - V_E$ and $V_{BC} = V_B - V_C$; a junction is forward biased when its **p** side (the base) is above its **n** side.',
      'BE on and BC off: forward active. Both on: saturation. Both off: cutoff. BE off, BC on: reverse active.'],
      sol: `**Junction voltages.** $${nm[0]} = ${jv(0)} = ${f(vbe, 3)}\\,\\text{V}$: the BE junction is ${beOn ? '**on**' : '**off**'}. $${nm[1]} = ${jv(1)} = ${f(vbc, 3)}\\,\\text{V}$: the BC junction is ${bcOn ? '**forward biased**' : '**reverse biased** (off)'}.

| BE | BC | Region |
|---|---|---|
| on | off | forward active |
| on | on | saturation |
| off | off | cutoff |
| off | on | reverse active |

**Region: ${REGS[reg]}.** ${meaning}

Quick check for active: ${pnp ? '$V_C\\le V_B$ for a PNP' : '$V_C\\ge V_B$ for an NPN'}; here $V_C = ${f(V.C, 3)}\\,\\text{V}$ and $V_B = ${f(V.B, 3)}\\,\\text{V}$.`,
      _chk: { kind: 'reg', pnp, V, reg },
    };
  };

  // ---------------------------------------------------------------- DC analysis of one NPN: four bias networks
  // 'vbb' base source + R_B (+ R_E); 'fixed' R_B from V_CC; 'split' R_B to ground, R_E to -V_EE; 'fb' R_B from the collector
  function solveRB(p) {
    const b1 = p.beta + 1;
    if (p.kind === 'fb') {
      const IB = (p.VCC - VON) / (p.RB + b1 * (p.RC + p.RE)), IC = p.beta * IB, IE = IB + IC;
      const VE = IE * p.RE, VB = VE + VON, VC = p.VCC - IE * p.RC;
      return { reg: 'act', IB, IC, IE, VE, VB, VC };
    }
    const VBB = p.kind === 'fixed' ? p.VCC : p.kind === 'split' ? 0 : p.VBB;
    return npnDC({ VCC: p.VCC, VBB, RB: p.RB, RC: p.RC, RE: p.RE, VEE: p.VEE || 0, beta: p.beta });
  }
  function rbFig(p) {
    if (p.kind === 'fb') return biasFig({ type: 'npn', base: 'fb', VCC: p.VCC, RB: p.RB, RC: p.RC, RE: p.RE });
    if (p.kind === 'fixed') return biasFig({ type: 'npn', base: 'fixed', VCC: p.VCC, RB: p.RB, RC: p.RC, RE: p.RE });
    if (p.kind === 'split') return biasFig({ type: 'npn', base: 'gnd', VCC: p.VCC, RB: p.RB, RC: p.RC, RE: p.RE, VEE: p.VEE });
    return biasFig({ type: 'npn', base: 'vbb', VCC: p.VCC, VBB: p.VBB, RB: p.RB, RC: p.RC, RE: p.RE });
  }
  function rbSol(p, s) {
    const b = p.beta, b1 = b + 1, RE = p.RE;
    const reT = RE ? ` + (\\beta + 1)R_E` : '';
    let loop, drive, den;
    if (p.kind === 'fb') {
      loop = `**Step 1: KVL around the loop** from $V_{CC}$, down through $R_C$ (which carries $I_E = I_C + I_B$, both the collector current and the current that turns off into $R_B$), through $R_B$ (which carries $I_B$), across the junction${RE ? ' and through $R_E$' : ''} to ground:
$$V_{CC} - (\\beta + 1)I_BR_C - I_BR_B - 0.7${RE ? ' - (\\beta + 1)I_BR_E' : ''} = 0$$
$$I_B = \\frac{V_{CC} - 0.7}{R_B + (\\beta + 1)(R_C${RE ? ' + R_E' : ''})} = \\frac{${f(p.VCC - VON, 4)}\\,\\text{V}}{${kOs(p.RB)} + ${b1}\\times${kOs(p.RC + RE)}} = ${T.uA(s.IB)}$$`;
    } else {
      const VBBt = p.kind === 'fixed' ? `V_{CC} = ${f(p.VCC, 4)}\\,\\text{V}` : p.kind === 'split' ? '0' : `V_{BB} = ${f(p.VBB, 4)}\\,\\text{V}`;
      drive = p.kind === 'split' ? `0 - 0.7 + ${f(p.VEE, 4)}` : `${f(p.kind === 'fixed' ? p.VCC : p.VBB, 4)} - 0.7`;
      den = RE ? `${kOs(p.RB)} + ${b1}\\times${kOs(RE)}` : kOs(p.RB);
      loop = `**Step 1: KVL around the base loop**, from ${p.kind === 'split' ? 'ground, up through $R_B$ (the base sits slightly *below* ground because $I_B$ flows into it through $R_B$)' : `$${VBBt}$, through $R_B$`}, across the $0.7\\,\\text{V}$ junction${RE ? `, through $R_E$ (which carries $I_E = (\\beta + 1)I_B$)` : ''}, to ${p.kind === 'split' ? `$-V_{EE} = -${f(p.VEE, 4)}\\,\\text{V}$` : 'ground'}:
$$I_B = \\frac{${p.kind === 'split' ? 'V_{EE} - 0.7' : (p.kind === 'fixed' ? 'V_{CC} - 0.7' : 'V_{BB} - 0.7')}}{R_B${reT}} = \\frac{${drive}}{${den}} = ${T.uA(s.IB)}$$`;
    }
    const lines = [loop, `**Step 2: the other currents.** $I_C = \\beta I_B = ${b}\\times${T.uA(s.IB)} = ${T.mA(s.IC)}$ and $I_E = (\\beta + 1)I_B = ${T.mA(s.IE)}$.`];
    const vE = RE ? (p.kind === 'split' ? `V_E = -${f(p.VEE, 4)} + I_ER_E = ${T.V(s.VE)}` : `V_E = I_ER_E = ${T.V(s.VE)}`) : (p.kind === 'split' ? `V_E = -${f(p.VEE, 4)}\\,\\text{V}` : 'V_E = 0');
    const vC = p.kind === 'fb' ? `V_C = V_{CC} - I_ER_C = ${f(p.VCC, 4)} - (${T.mA(s.IE)})(${kOs(p.RC)}) = ${T.V(s.VC)}` : `V_C = V_{CC} - I_CR_C = ${f(p.VCC, 4)} - (${T.mA(s.IC)})(${kOs(p.RC)}) = ${T.V(s.VC)}`;
    lines.push(`**Step 3: node voltages.** $${vE}$, $V_B = V_E + 0.7 = ${T.V(s.VB)}$, $${vC}$.`);
    lines.push(`**Step 4: check.** $V_C = ${T.V(s.VC)}\\ge V_B = ${T.V(s.VB)}$ ✓: forward active, so the answers stand.${p.kind === 'fb' ? ' (This bias can never saturate: $V_C - V_B = I_BR_B > 0$ always.)' : ''}`);
    if (RE && p.kind !== 'fb') {
      const stiff = (p.kind === 'split' ? p.VEE - VON : (p.kind === 'fixed' ? p.VCC : p.VBB) - VON) / RE;
      lines.push(`**Feel.** The same result read from the emitter: $I_E = \\dfrac{${p.kind === 'split' ? 'V_{EE}' : (p.kind === 'fixed' ? 'V_{CC}' : 'V_{BB}')} - 0.7}{R_E + R_B/(\\beta + 1)}$, with $R_B/(\\beta + 1) = ${T.R(p.RB / b1)}$ next to $R_E = ${kOs(RE)}$. ${p.RB / b1 < 0.1 * RE ? `That is small, so $I_E\\approx${T.mA(stiff)}$ almost regardless of $\\beta$: a well-designed bias.` : `That is not small next to $R_E$, so $\\beta$ still matters here (the $\\beta\\to\\infty$ value would be $${T.mA(stiff)}$).`}`);
    } else if (p.kind === 'fixed') lines.push(`**Feel.** $I_C = \\beta I_B$ with $I_B$ fixed by $R_B$: the collector current is proportional to $\\beta$. Swap in a transistor with twice the $\\beta$ and you get twice the current (or saturation). That is why fixed bias is a poor design.`);
    return lines.join('\n\n');
  }
  GENS.bk_dcrb = (opts = {}) => {
    let p, s;
    for (let t = 0; t < 800; t++) {
      const kind = opts.kind || pick(['vbb', 'vbb', 'fixed', 'split', 'fb']);
      const beta = pick([50, 80, 100, 100, 120, 150, 200]);
      const VCC = pick([5, 9, 10, 12, 15]);
      const RC = pick([1, 1.5, 2, 2.2, 3.3, 4.7, 5.6, 6.8, 10]) * 1e3;
      p = { kind, beta, VCC, RC, RE: 0, VEE: 0 };
      if (kind === 'vbb') { p.VBB = pick([1.5, 2, 2.7, 3, 4, 5]); p.RB = pick([10, 20, 47, 100]) * 1e3; p.RE = pick([0.5, 1, 1.5, 2, 3.3]) * 1e3; if (p.VBB >= VCC) continue; }
      else if (kind === 'fixed') { p.RB = pick([100, 220, 330, 470, 680, 1000, 1500]) * 1e3; p.RE = pick([0, 0, 0.5, 1]) * 1e3; }
      else if (kind === 'split') { p.VEE = pick([5, 9, 10, 12, 15]); p.RB = pick([10, 20, 47, 100]) * 1e3; p.RE = pick([2.2, 3.3, 4.7, 5.6, 10]) * 1e3; }
      else { p.RB = pick([47, 100, 200, 330]) * 1e3; p.RE = pick([0, 0, 0.5, 1]) * 1e3; }
      s = solveRB(p);
      if (s.reg === 'act' && s.IC > 0.1e-3 && s.IC < 8e-3 && s.VC - s.VB > 0.5) break;
      s = null;
    }
    const VBBv = p.kind === 'split' ? p.VEE : p.kind === 'fixed' ? p.VCC : p.VBB;
    const traps = [];
    if (p.kind !== 'fb') {
      if (p.RE) traps.push({ v: p.beta * (VBBv - VON) / (p.RB + p.RE) * 1e3, msg: '$R_E$ counted once: it carries $(\\beta + 1)I_B$, so in the base loop it counts as $(\\beta + 1)R_E$.' });
      traps.push({ v: p.beta * VBBv / (p.RB + (p.beta + 1) * p.RE) * 1e3, msg: 'The $0.7\\,\\text{V}$ across the base–emitter junction is missing from the loop.' });
    } else traps.push({ v: p.beta * (p.VCC - VON) / p.RB * 1e3, msg: 'That ignores the drop across $R_C$: it carries $(\\beta + 1)I_B$ and counts $(\\beta + 1)$ times in the loop.' });
    const good = [s.IC * 1e3];
    return {
      fig: rbFig(p),
      q: `$\\beta = ${p.beta}$, $V_{BE} = 0.7\\,\\text{V}$ when on. Assume forward active, find $I_B$, $I_C$ and $V_C$, and check the assumption.`,
      parts: [{ lbl: 'I_B', unit: 'µA', ans: s.IB * 1e6 }, { lbl: 'I_C', unit: 'mA', ans: s.IC * 1e3, traps: notNear(traps, good) }, { lbl: 'V_C', unit: 'V', ans: s.VC, tol: { rel: 0.015, abs: 0.03 } }],
      hints: [p.kind === 'fb' ? 'One loop: $V_{CC}$, $R_C$ (carrying $I_E$), $R_B$ (carrying $I_B$), the $0.7\\,\\text{V}$ junction' + (p.RE ? ', $R_E$' : '') + ', ground.' : 'KVL around the base loop, writing every current in terms of $I_B$: the emitter resistor carries $(\\beta + 1)I_B$.',
        'Then $I_C = \\beta I_B$, the node voltages, and the check $V_C\\ge V_B$.'],
      sol: rbSol(p, s),
      _chk: { kind: 'dcrb', p, ans: [s.IB * 1e6, s.IC * 1e3, s.VC] },
    };
  };

  // ---------------------------------------------------------------- DC: divider bias (NPN or PNP), optionally drawn as a full amplifier
  GENS.bk_dcdiv = (opts = {}) => {
    let p, s, th;
    for (let t = 0; t < 1000; t++) {
      const pnp = opts.pnp ? true : opts.npn ? false : pick([false, false, true]);
      const beta = pick([60, 80, 100, 100, 120, 150, 200]);
      const VCC = pick([9, 10, 12, 15]);
      const big = pick([10, 15, 22, 33, 47, 56, 68, 82, 100]) * 1e3, small = pick([2.2, 3.3, 4.7, 6.8, 10, 12, 15, 22]) * 1e3;
      if (big <= 1.5 * small) continue;
      const R1 = pnp ? small : big, R2 = pnp ? big : small;
      const RE = pick([0.5, 1, 1.2, 1.5, 2.2]) * 1e3, RC = pick([1, 2.2, 3.3, 4.7, 5.6]) * 1e3;
      th = thev(VCC, R1, R2);
      const drive = pnp ? VCC - VON - th.VBB : th.VBB - VON;
      if (drive < 0.8) continue;
      s = pnp ? pnpDC({ VCC, VBB: th.VBB, RB: th.RB, RC, RE, beta }) : npnDC({ VCC, VBB: th.VBB, RB: th.RB, RC, RE, beta });
      if (s.reg !== 'act' || s.IC < 0.2e-3 || s.IC > 8e-3 || Math.abs(s.VC - s.VB) < 0.5) { s = null; continue; }
      p = { pnp, beta, VCC, R1, R2, RE, RC, amp: !pnp && (opts.amp ?? Math.random() < 0.4) };
      if (p.amp) { p.RL = pick([4.7, 10, 22]) * 1e3; p.RS = pick([0.5, 1, 2]) * 1e3; p.bypass = pick([true, false]); }
      break;
    }
    const { pnp, beta, VCC, R1, R2, RE, RC } = p;
    const b1 = beta + 1, drive = pnp ? VCC - VON - th.VBB : th.VBB - VON;
    const stiffIE = drive / RE, stiffIC = stiffIE * beta / b1;
    const fig = p.amp ? ampFig({ VCC, R1, R2, RC, RE, RL: p.RL, RS: p.RS, bypass: p.bypass }) : biasFig({ type: pnp ? 'pnp' : 'npn', base: 'div', VCC, R1, R2, RC, RE });
    const icTraps = notNear([{ v: stiffIE * 1e3, msg: 'That ignores the base current: it treats the divider as perfectly stiff ($V_B = V_{TH}$). Keep $R_{TH}/(\\beta + 1)$ next to $R_E$.' },
      { v: beta * drive / (th.RB + RE) * 1e3, msg: '$R_E$ counted once in the base loop; it carries $(\\beta + 1)I_B$.' }], [s.IC * 1e3]);
    const err = (stiffIE / s.IE - 1) * 100;
    const sol = [
      p.amp ? `**Step 0: the DC circuit.** At DC every capacitor is an open circuit. Erase $C_1$, $C_2$${p.bypass ? ' and $C_E$' : ''}: the source, $R_S$ and $R_L$ are cut off, and what is left is the transistor with its divider, $R_C$ and $R_E$.` : '',
      `**Step 1: Thévenin twin of the divider.** $V_{TH} = V_{CC}\\dfrac{R_2}{R_1 + R_2} = ${f(VCC, 3)}\\times\\dfrac{${kOs(R2)}}{${kOs(R1 + R2)}} = ${T.V(th.VBB)}$, $R_{TH} = R_1\\parallel R_2 = ${T.kO(th.RB)}$.`,
      pnp ? `**Step 2: the base loop** (PNP: from $V_{CC}$ down through $R_E$, which carries $(\\beta + 1)I_B$, across the $0.7\\,\\text{V}$ junction, through $R_{TH}$ to $V_{TH}$):
$$I_B = \\frac{V_{CC} - 0.7 - V_{TH}}{R_{TH} + (\\beta + 1)R_E} = \\frac{${f(drive, 4)}\\,\\text{V}}{${T.kO(th.RB)} + ${b1}\\times${kOs(RE)}} = ${T.uA(s.IB)}$$`
        : `**Step 2: the base loop** (from $V_{TH}$ through $R_{TH}$, the $0.7\\,\\text{V}$ junction and $R_E$, which carries $(\\beta + 1)I_B$):
$$I_B = \\frac{V_{TH} - 0.7}{R_{TH} + (\\beta + 1)R_E} = \\frac{${f(drive, 4)}\\,\\text{V}}{${T.kO(th.RB)} + ${b1}\\times${kOs(RE)}} = ${T.uA(s.IB)}$$`,
      `**Step 3.** $I_C = \\beta I_B = ${T.mA(s.IC)}$, $I_E = ${T.mA(s.IE)}$. ${pnp ? `$V_E = V_{CC} - I_ER_E = ${T.V(s.VE)}$, $V_B = V_E - 0.7 = ${T.V(s.VB)}$, $V_C = I_CR_C = ${T.V(s.VC)}$.` : `$V_E = I_ER_E = ${T.V(s.VE)}$, $V_B = ${T.V(s.VB)}$, $V_C = V_{CC} - I_CR_C = ${T.V(s.VC)}$.`}`,
      `**Step 4: check.** ${pnp ? `$V_C = ${T.V(s.VC)}\\le V_B = ${T.V(s.VB)}$` : `$V_C = ${T.V(s.VC)}\\ge V_B = ${T.V(s.VB)}$`} ✓ forward active.`,
      `**How stiff is the divider?** Ignoring the base current would give $I_E = ${f(drive, 4)}\\,\\text{V}/${kOs(RE)} = ${T.mA(stiffIE)}$, ${f(Math.abs(err), 2)}% ${err > 0 ? 'high' : 'low'}. The reason: $R_{TH}/(\\beta + 1) = ${T.R(th.RB / b1)}$ next to $R_E = ${kOs(RE)}$. ${th.RB < 0.1 * b1 * RE ? 'Since $R_{TH} < 0.1(\\beta + 1)R_E$, the divider is stiff and the shortcut is fine for an estimate.' : 'Since $R_{TH}$ is not small next to $(\\beta + 1)R_E$, the divider is soft: keep the base current.'}`,
    ].filter(Boolean).join('\n\n');
    return {
      fig,
      q: `$\\beta = ${beta}$, $|V_{BE}| = 0.7\\,\\text{V}$.${p.amp ? ' The capacitors are large.' : ''} Find the Thévenin equivalent of the base divider, then $I_C$ and $V_C$ (keep the base current), and check the region.`,
      parts: [{ lbl: 'V_{TH}', unit: 'V', ans: th.VBB }, { lbl: 'R_{TH}', unit: 'kΩ', ans: th.RB / 1e3 }, { lbl: 'I_C', unit: 'mA', ans: s.IC * 1e3, traps: icTraps }, { lbl: 'V_C', unit: 'V', ans: s.VC, tol: { rel: 0.015, abs: 0.03 } }],
      hints: ['$V_{TH} = V_{CC}R_2/(R_1 + R_2)$, $R_{TH} = R_1\\parallel R_2$.' + (p.amp ? ' Capacitors are open at DC.' : ''),
        pnp ? 'PNP base loop: $V_{CC} - (\\beta + 1)I_BR_E - 0.7 - I_BR_{TH} = V_{TH}$.' : 'Base loop: $V_{TH} - I_BR_{TH} - 0.7 - (\\beta + 1)I_BR_E = 0$.'],
      sol,
      _chk: { kind: 'dcdiv', p, ans: [th.VBB, th.RB / 1e3, s.IC * 1e3, s.VC] },
    };
  };

  // ---------------------------------------------------------------- DC: circuits that saturate (NPN with or without R_E, PNP)
  GENS.bk_dcsat = () => {
    let p, s;
    for (let t = 0; t < 2000; t++) {
      const kind = pick(['ge', 're', 're', 'pnp']);
      const beta = pick([50, 80, 100, 100, 150, 200]);
      const VCC = pick([5, 6, 9, 10, 12]);
      const RC = pick([1, 2.2, 3.3, 4.7, 6.8, 10]) * 1e3, RB = pick([4.7, 10, 15, 22, 47]) * 1e3;
      const RE = kind === 'ge' ? 0 : pick([0.5, 1, 1.5, 2.2]) * 1e3;
      p = { kind, beta, VCC, RC, RB, RE };
      if (kind === 'pnp') { p.VBB = r2(VCC - pick([2, 3, 4, 5, VCC])); if (p.VBB < 0) continue; s = pnpDC(p); }
      else { p.VBB = pick([2, 3, 4, 5]); if (p.VBB > VCC) continue; s = npnDC(p); }
      if (s.reg !== 'sat' || s.IB <= 0 || s.IC <= 0.1e-3 || s.IC > 0.8 * beta * s.IB) { s = null; continue; }
      if (kind === 'pnp' ? s.act.VC - s.act.VB < 0.5 : s.act.VB - s.act.VC < 0.5) { s = null; continue; }
      break;
    }
    const pn = p.kind === 'pnp', a = s.act, b1 = p.beta + 1, R = (x) => f(x / 1e3, 4);
    const drive = pn ? p.VCC - VON - p.VBB : p.VBB - VON;
    const fb = s.IC / s.IB;
    const loopA = `**Step 1: assume forward active.** $I_B = \\dfrac{${pn ? 'V_{CC} - 0.7 - V_{BB}' : 'V_{BB} - 0.7'}}{R_B${p.RE ? ' + (\\beta + 1)R_E' : ''}} = \\dfrac{${f(drive, 4)}\\,\\text{V}}{${kOs(p.RB)}${p.RE ? ` + ${b1}\\times${kOs(p.RE)}` : ''}} = ${T.uA(a.IB)}$, so $I_C = \\beta I_B = ${T.mA(a.IC)}$ and $V_C = ${pn ? `I_CR_C = ${T.V(a.VC)}` : `V_{CC} - I_CR_C = ${T.V(a.VC)}`}$.`;
    const chk = `**Step 2: check.** ${pn ? `$V_C = ${T.V(a.VC)} > V_B = ${T.V(a.VB)}$` : `$V_C = ${T.V(a.VC)} < V_B = ${T.V(a.VB)}$`}: the collector has crossed the base, so the BC junction is forward biased. **Saturated.** (No real circuit can deliver that $${T.mA(a.IC)}$: there are not enough volts for $R_C$.)`;
    let satT;
    if (!p.RE) satT = `**Step 3: redo in saturation** ($V_{BE} = 0.7\\,\\text{V}$, $V_{CE} = 0.2\\,\\text{V}$, $I_B$ and $I_C$ now separate unknowns). With no emitter resistor the two loops do not share a resistor:
$$I_B = \\frac{${f(drive, 4)}\\,\\text{V}}{${kOs(p.RB)}} = ${T.uA(s.IB)},\\qquad I_C = \\frac{${f(p.VCC, 4)} - 0.2}{${kOs(p.RC)}} = ${T.mA(s.IC)}.$$`;
    else satT = `**Step 3: redo in saturation** ($|V_{BE}| = 0.7\\,\\text{V}$, $|V_{CE}| = 0.2\\,\\text{V}$, $I_B$ and $I_C$ now separate unknowns). Both loops pass through $R_E$, which carries $I_B + I_C$. In mA and kΩ:
$$\\text{base loop: } ${R(p.RB)}\\,I_B + ${R(p.RE)}\\,(I_B + I_C) = ${f(drive, 4)},\\qquad \\text{collector loop: } ${R(p.RC)}\\,I_C + ${R(p.RE)}\\,(I_B + I_C) = ${f(p.VCC - VSAT, 4)}$$
Solving the pair: $I_B = ${T.uA(s.IB)}$, $I_C = ${T.mA(s.IC)}$.`;
    const vc = pn ? `$V_E = V_{CC} - (I_B + I_C)R_E = ${T.V(s.VE)}$, $V_C = V_E - 0.2 = ${T.V(s.VC)}$` : `$V_E = ${T.V(s.VE)}$, $V_C = V_E + 0.2 = ${T.V(s.VC)}$`;
    return {
      fig: pn ? biasFig({ type: 'pnp', base: 'vbb', VCC: p.VCC, VBB: p.VBB, RB: p.RB, RC: p.RC, RE: p.RE }) : biasFig({ type: 'npn', base: 'vbb', VCC: p.VCC, VBB: p.VBB, RB: p.RB, RC: p.RC, RE: p.RE }),
      q: `$\\beta = ${p.beta}$, $|V_{BE}| = 0.7\\,\\text{V}$ when on, $|V_{CE,sat}| = 0.2\\,\\text{V}$. (1) Assume forward active and find the $V_C$ that predicts. (2) That fails the check: find the actual $I_C$. (3) Find the forced $\\beta = I_C/I_B$.`,
      parts: [{ lbl: 'V_C\\ \\text{(active guess)}', unit: 'V', ans: a.VC, tol: { rel: 0.015, abs: 0.03 } },
        { lbl: 'I_C', unit: 'mA', ans: s.IC * 1e3, traps: notNear([{ v: a.IC * 1e3, msg: 'That is the forward-active value $\\beta I_B$, which the check just ruled out.' }], [s.IC * 1e3]) },
        { lbl: '\\beta_{forced}', unit: '', ans: fb }],
      hints: ['Active first: the usual base loop. Then compare $V_C$ with $V_B$.', p.RE ? 'In saturation write two loops, each through $R_E$ (which carries $I_B + I_C$), with $|V_{BE}| = 0.7\\,\\text{V}$ and $|V_{CE}| = 0.2\\,\\text{V}$.' : 'In saturation $V_{CE} = 0.2\\,\\text{V}$, so $R_C$ has $V_{CC} - 0.2$ across it.'],
      sol: [loopA, chk, satT, `**Step 4: nodes and consistency.** ${vc}. Forced $\\beta = I_C/I_B = ${f(fb, 4)} < \\beta = ${p.beta}$ ✓, and both currents are positive ✓: saturation is consistent.`,
        `**Feel.** The base has more current than the collector circuit can use: ${f(p.beta / fb, 3)} times what would just reach the edge of saturation. In saturation the outside resistors, not $\\beta$, set $I_C$.`].join('\n\n'),
      _chk: { kind: 'dcsat', p, ans: [a.VC, s.IC * 1e3, fb] },
    };
  };

  // ---------------------------------------------------------------- the Early effect: I_C = I_0(1 + V_CE/V_A), r_o = V_A/I_C
  GENS.bk_early = () => {
    const mode = pick(['ro', 'two', 'two', 'new', 'fixed']);
    const VA = pick([20, 30, 40, 50, 60, 75, 80, 100, 120, 150]);
    if (mode === 'ro') {
      const IC = pick([0.1, 0.2, 0.25, 0.5, 1, 2, 4]) * 1e-3, k = pick([2, 4, 10]);
      return {
        q: `A BJT with Early voltage $V_A = ${VA}\\,\\text{V}$ is biased at $I_C = ${T.mA(IC)}$. Find its output resistance $r_o$, and $r_o$ at ${k} times the current.`,
        parts: [{ lbl: 'r_o', unit: 'kΩ', ans: VA / IC / 1e3 }, { lbl: `r_o\\ (${k}I_C)`, unit: 'kΩ', ans: VA / (k * IC) / 1e3, traps: notNear([{ v: k * VA / IC / 1e3, msg: 'Backwards: more current means a steeper output curve, so a **smaller** $r_o$.' }], [VA / (k * IC) / 1e3]) }],
        hints: ['$r_o = V_A/I_C$: volts over milliamps gives kilohms.'],
        sol: `$$r_o = \\frac{V_A}{I_C} = \\frac{${VA}\\,\\text{V}}{${T.mA(IC)}} = ${T.kO(VA / IC)}$$
At ${k} times the current, $r_o = ${T.kO(VA / (k * IC))}$: ${k} times smaller. All the output curves extrapolate to the same point $-V_A$, so a curve twice as high is twice as steep. (The MOSFET twin: $r_{ds} = 1/(\\lambda I_D)$, with $1/\\lambda$ playing the part of $V_A$.)`,
        _chk: { kind: 'early', mode, VA, IC, k },
      };
    }
    if (mode === 'two') {
      const I0 = pick([0.2, 0.4, 0.5, 0.8, 1, 1.5, 2, 3]) * 1e-3, V1 = pick([1, 2, 3]), V2 = V1 + pick([4, 5, 6, 8, 10]);
      const I1 = +f(I0 * (1 + V1 / VA) * 1e3, 5), I2 = +f(I0 * (1 + V2 / VA) * 1e3, 5);           // as displayed, in mA
      const vA = (I1 * V2 - I2 * V1) / (I2 - I1), rs = (V2 - V1) / (I2 - I1);
      return {
        q: `At a fixed $V_{BE}$ you measure $I_C = ${I1}\\,\\text{mA}$ at $V_{CE} = ${V1}\\,\\text{V}$ and $I_C = ${I2}\\,\\text{mA}$ at $V_{CE} = ${V2}\\,\\text{V}$. Find the Early voltage $V_A$ and the output resistance $\\Delta V_{CE}/\\Delta I_C$.`,
        parts: [{ lbl: 'V_A', unit: 'V', ans: vA }, { lbl: '\\Delta V_{CE}/\\Delta I_C', unit: 'kΩ', ans: rs }],
        hints: ['Extend the straight line through the two points back to $I_C = 0$: it crosses at $V_{CE} = -V_A$.', 'Equivalently $I_{C1}/I_{C2} = (V_A + V_{CE1})/(V_A + V_{CE2})$; solve for $V_A$.'],
        sol: `**Slope.** $\\dfrac{\\Delta I_C}{\\Delta V_{CE}} = \\dfrac{${I2} - ${I1}}{${V2} - ${V1}}\\,\\text{mA/V} = ${f((I2 - I1) / (V2 - V1), 4)}\\,\\text{mA/V}$, so $\\Delta V_{CE}/\\Delta I_C = ${f(rs, 4)}\\kO$.

**Early voltage.** The line $I_C = I_0(1 + V_{CE}/V_A)$ through both points meets $I_C = 0$ at $V_{CE} = -V_A$. Walking down from the first point with that slope: $V_A + ${V1} = I_{C1}\\big/\\tfrac{\\Delta I_C}{\\Delta V_{CE}} = ${I1}/${f((I2 - I1) / (V2 - V1), 4)} = ${f(I1 / ((I2 - I1) / (V2 - V1)), 4)}\\,\\text{V}$, so
$$V_A = ${f(vA, 4)}\\,\\text{V}.$$
Check with the ratio: $(V_A + ${V1})/(V_A + ${V2}) = ${f((vA + V1) / (vA + V2), 5)} = I_{C1}/I_{C2}$ ✓. Notice $\\Delta V_{CE}/\\Delta I_C = (V_A + V_{CE1})/I_{C1}$: the course's $r_o = V_A/I_C$ (here $${f(vA / I1, 4)}\\kO$) drops the small $V_{CE}$.`,
        _chk: { kind: 'early', mode, I1, I2, V1, V2 },
      };
    }
    if (mode === 'new') {
      const I1 = pick([0.2, 0.5, 1, 1.2, 2, 2.5]) * 1e-3, V1 = pick([1, 2, 3, 5]), V2 = V1 + pick([3, 5, 7, 10]);
      const I2 = I1 * (VA + V2) / (VA + V1);
      return {
        q: `A BJT with $V_A = ${VA}\\,\\text{V}$ carries $${T.mA(I1)}$ at $V_{CE} = ${V1}\\,\\text{V}$. With $V_{BE}$ unchanged, what does it carry at $V_{CE} = ${V2}\\,\\text{V}$?`,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: I2 * 1e3, tol: { rel: 0.002 } }],
        hints: ['All the active-region lines aim at $V_{CE} = -V_A$: $I_C\\propto(V_A + V_{CE})$.'],
        sol: `$I_C = I_0(1 + V_{CE}/V_A) = \\tfrac{I_0}{V_A}(V_A + V_{CE})$, so at a fixed $V_{BE}$
$$I_{C2} = I_{C1}\\,\\frac{V_A + V_{CE2}}{V_A + V_{CE1}} = ${T.mA(I1)}\\times\\frac{${VA + V2}}{${VA + V1}} = ${T.mA(I2, 5)}$$
A ${V2 - V1} V step in $V_{CE}$ changes the current by only ${f((I2 / I1 - 1) * 100, 3)}%: the collector is a good, but not perfect, current source. (Give four or five significant figures: the change is small.)`,
        _chk: { kind: 'early', mode, VA, I1, V1, V2 },
      };
    }
    // fixed bias with the Early effect included
    const VCC = pick([9, 10, 12, 15]), RC = pick([2.2, 3.3, 4.7, 5]) * 1e3, b0 = pick([80, 100, 150]);
    let IB, IC, VC;
    for (let t = 0; t < 100; t++) {
      IB = pick([5, 8, 10, 12, 15, 20]) * 1e-6;
      const I0 = b0 * IB;
      IC = I0 * (1 + VCC / VA) / (1 + I0 * RC / VA); VC = VCC - IC * RC;
      if (VC > 1.5 && b0 * IB * RC < VCC - 1.5) break;
    }
    const I0 = b0 * IB, VC0 = VCC - I0 * RC;
    return {
      fig: biasFig({ type: 'npn', base: 'fixed', VCC, RB: '', RC }),
      q: `In this fixed-bias circuit $R_B$ sets $I_B = ${T.uA(IB)}$. The transistor follows $I_C = \\beta I_B(1 + V_{CE}/V_A)$ with $\\beta = ${b0}$ (the value extrapolated to $V_{CE} = 0$) and $V_A = ${VA}\\,\\text{V}$. Find $I_C$ and $V_C$ including the Early effect.`,
      parts: [{ lbl: 'I_C', unit: 'mA', ans: IC * 1e3, traps: notNear([{ v: I0 * 1e3, msg: 'That ignores the Early effect: $\\beta I_B$ holds only at $V_{CE} = 0$ here.' }], [IC * 1e3]) }, { lbl: 'V_C', unit: 'V', ans: VC, tol: { rel: 0.015, abs: 0.03 } }],
      hints: ['Two equations: $I_C = \\beta I_B(1 + V_{CE}/V_A)$ and $V_{CE} = V_{CC} - I_CR_C$.', 'Substitute the second into the first and solve for $I_C$: $I_C = \\beta I_B\\dfrac{1 + V_{CC}/V_A}{1 + \\beta I_BR_C/V_A}$.'],
      sol: `Let $I_0 = \\beta I_B = ${T.mA(I0)}$. Put $V_{CE} = V_{CC} - I_CR_C$ into $I_C = I_0(1 + V_{CE}/V_A)$:
$$I_C = I_0\\Big(1 + \\frac{V_{CC} - I_CR_C}{V_A}\\Big)\\quad\\Rightarrow\\quad I_C\\Big(1 + \\frac{I_0R_C}{V_A}\\Big) = I_0\\Big(1 + \\frac{V_{CC}}{V_A}\\Big)$$
$$I_C = ${T.mA(I0)}\\times\\frac{1 + ${VCC}/${VA}}{1 + ${f(I0 * RC, 4)}/${VA}} = ${T.mA(IC)},\\qquad V_C = ${VCC} - (${T.mA(IC)})(${kOs(RC)}) = ${T.V(VC)}.$$
Ignoring the Early effect would give $${T.mA(I0)}$ and $${T.V(VC0)}$: ${f((IC / I0 - 1) * 100, 3)}% off in current. Fixed bias has no feedback to fight it; an emitter resistor would shrink this to a fraction of a percent, which is why the course drops $V_A$ in DC work and keeps it for signals, as $r_o$.`,
      _chk: { kind: 'early', mode: 'fixed', VCC, RC, b0, IB, VA },
    };
  };

  // ================================================================ Chapter 7: the small-signal model
  // ---------------------------------------------------------------- g_m, r_pi, r_o from the bias (given as I_C, I_B, I_E or a circuit)
  GENS.bk_gm = (opts = {}) => {
    const mode = opts.mode || pick(['IC', 'IC', 'IB', 'IE', 'circ']);
    let beta = pick([50, 80, 100, 100, 120, 150, 200]), VA = pick([25, 50, 75, 100, 120]);
    let IC, given, pre = '', fig, s, p;
    if (mode === 'circ') {
      for (let t = 0; t < 500; t++) {
        const VCC = pick([9, 10, 12, 15]), R1 = pick([22, 33, 47, 56, 68, 82]) * 1e3, R2 = pick([4.7, 6.8, 10, 12, 15]) * 1e3;
        const RE = pick([0.5, 1, 1.2, 1.5, 2.2]) * 1e3, RC = pick([2.2, 3.3, 4.7, 5.6]) * 1e3;
        const th = thev(VCC, R1, R2);
        s = npnDC({ VCC, VBB: th.VBB, RB: th.RB, RC, RE, beta });
        if (s.reg === 'act' && s.IC > 0.2e-3 && s.IC < 5e-3 && s.VC - s.VB > 0.5) { p = { VCC, R1, R2, RE, RC, th }; break; }
      }
      IC = s.IC;
      fig = biasFig({ type: 'npn', base: 'div', VCC: p.VCC, R1: p.R1, R2: p.R2, RE: p.RE, RC: p.RC });
      given = `The transistor below has $\\beta = ${beta}$ and $V_A = ${VA}\\,\\text{V}$. Find its bias current $I_C$ first (keep the base current), then`;
      pre = `**Step 0: the bias** ([Chapter 6](#/l/bk06-divider)). $V_{TH} = ${T.V(p.th.VBB)}$, $R_{TH} = ${T.kO(p.th.RB)}$, $I_B = \\dfrac{V_{TH} - 0.7}{R_{TH} + (\\beta + 1)R_E} = ${T.uA(s.IB)}$, so $I_C = ${T.mA(IC)}$ (and $V_C = ${T.V(s.VC)}\\ge V_B$ ✓).\n\n`;
    } else {
      IC = pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.5, 2, 2.5, 4]) * 1e-3;
      if (mode === 'IC') given = `A BJT with $\\beta = ${beta}$ and Early voltage $V_A = ${VA}\\,\\text{V}$ is biased at $I_C = ${T.mA(IC)}$. Find`;
      if (mode === 'IB') { given = `A forward-active BJT with $\\beta = ${beta}$ and $V_A = ${VA}\\,\\text{V}$ draws $I_B = ${T.uA(IC / beta)}$ into its base. Find`; pre = `**Step 0.** $I_C = \\beta I_B = ${T.mA(IC)}$.\n\n`; }
      if (mode === 'IE') { given = `A forward-active BJT with $\\beta = ${beta}$ and $V_A = ${VA}\\,\\text{V}$ carries $I_E = ${T.mA(IC * (beta + 1) / beta)}$ in its emitter. Find`; pre = `**Step 0.** $I_C = \\alpha I_E = \\dfrac{\\beta}{\\beta + 1}I_E = ${T.mA(IC)}$ (using $I_C\\approx I_E$ is within $1/\\beta$ and also accepted).\n\n`; }
    }
    const gm = IC / VT, rpi = beta / gm, ro = VA / IC;
    const parts = [
      { lbl: 'g_m', unit: 'mS', ans: gm * 1e3, traps: notNear([{ v: 2 * IC / 0.2 * 1e3, msg: 'That is the MOSFET formula $2I_D/V_{ov}$ (with $0.2\\,\\text{V}$). A BJT has $g_m = I_C/V_T$.' }, { v: IC / 0.7 * 1e3, msg: 'Divide by $V_T = 25\\,\\text{mV}$, not by $V_{BE} = 0.7\\,\\text{V}$.' }], [gm * 1e3]) },
      { lbl: 'r_\\pi', unit: 'kΩ', ans: rpi / 1e3, traps: notNear([{ v: 1 / gm / 1e3, msg: 'That is $1/g_m$, the emitter-side resistance. Looking into the base is $\\beta$ times bigger: $r_\\pi = \\beta/g_m$.' }], [rpi / 1e3]) },
      { lbl: 'r_o', unit: 'kΩ', ans: ro / 1e3, traps: notNear([{ v: VA * IC, msg: 'Divide: $r_o = V_A/I_C$.' }], [ro / 1e3]) },
    ];
    if (mode === 'IE') { const IEv = IC * (beta + 1) / beta; parts[0].accept = [IEv / VT * 1e3]; parts[1].accept = [beta * VT / IEv / 1e3]; parts[2].accept = [VA / IEv / 1e3]; }
    if (mode === 'circ') parts.unshift({ lbl: 'I_C', unit: 'mA', ans: IC * 1e3 });
    return {
      fig,
      q: `${given} $g_m$, $r_\\pi$ and $r_o$ ($V_T = 25\\,\\text{mV}$).`,
      parts,
      hints: ['$g_m = I_C/V_T$: $40\\,\\text{mS}$ per mA.', '$r_\\pi = \\beta/g_m$ and $r_o = V_A/I_C$.'],
      sol: `${pre}$$g_m = \\frac{I_C}{V_T} = \\frac{${T.mA(IC)}}{25\\,\\text{mV}} = ${T.mS(gm)}\\qquad\\Big(\\frac{1}{g_m} = ${T.R(1 / gm)}\\Big)$$
$$r_\\pi = \\frac{\\beta}{g_m} = ${beta}\\times${T.R(1 / gm)} = ${T.kO(rpi)},\\qquad r_o = \\frac{V_A}{I_C} = \\frac{${VA}\\,\\text{V}}{${T.mA(IC)}} = ${T.kO(ro)}$$
Checks: $g_mr_\\pi = \\beta = ${beta}$ ✓; $g_mr_o = V_A/V_T = ${f(VA / VT, 4)}$, the transistor's intrinsic gain, the same at any current.`,
      _chk: { kind: 'gm', mode, beta, VA, IC, p: p ? { VCC: p.VCC, R1: p.R1, R2: p.R2, RE: p.RE, RC: p.RC } : null },
    };
  };

  // ---------------------------------------------------------------- how small is "small"?
  GENS.bk_lin = () => {
    const mode = pick(['err', 'err', 'max', 'mos']);
    if (mode === 'err') {
      const v = pick([0.5, 1, 2, 2.5, 4, 5, 8, 10]) * 1e-3, IC = pick([0.5, 1, 2]) * 1e-3, x = v / VT;
      const lin = IC / VT * v, ex = IC * (Math.exp(x) - 1);
      return {
        q: `A BJT at $I_C = ${T.mA(IC)}$ gets a step $v_{be} = ${f(v * 1e3, 3)}\\,\\text{mV}$. Find the change of collector current predicted by $g_m$, the exact change from the exponential, and the size of the second-order term relative to the first, $v_{be}/(2V_T)$, in percent.`,
        parts: [{ lbl: 'i_c\\ (g_mv_{be})', unit: 'µA', ans: lin * 1e6 }, { lbl: 'i_c\\ \\text{(exact)}', unit: 'µA', ans: ex * 1e6, tol: { rel: 0.004 } }, { lbl: 'v_{be}/(2V_T)', unit: '%', ans: x / 2 * 100, tol: { rel: 0.01 } }],
        hints: ['Linear: $g_mv_{be} = (I_C/V_T)v_{be}$. Exact: $I_C(e^{v_{be}/V_T} - 1)$.', '$e^x = 1 + x + x^2/2 + \\dots$: the second term over the first is $x/2$.'],
        sol: `With $x = v_{be}/V_T = ${f(x, 4)}$:
- linear: $i_c = g_mv_{be} = I_Cx = ${T.uA(lin)}$;
- exact: $i_c = I_C(e^x - 1) = ${T.mA(IC)}\\times${f(Math.exp(x) - 1, 5)} = ${T.uA(ex)}$;
- second-order over first-order term: $\\dfrac{x^2/2}{x} = \\dfrac{x}{2} = ${f(x / 2 * 100, 3)}\\%$ (the exact excess is $${f((ex / lin - 1) * 100, 3)}\\%$, a little more because of the higher terms).

${x / 2 <= 0.05 ? 'Small enough: the straight line is a good model.' : 'That is a noticeable error: for this step the BJT is not "small-signal".'} Rule: $v_{be}$ must be small next to $2V_T = 50\\,\\text{mV}$; a few millivolts at most.`,
        _chk: { kind: 'lin', mode, v, IC },
      };
    }
    if (mode === 'max') {
      const e = pick([1, 2, 5, 10]) / 100;
      return {
        q: `How large can $v_{be}$ be before the second-order term of the exponential is ${f(e * 100, 3)}% of the linear term? And for a MOSFET with $V_{ov} = 0.2\\,\\text{V}$, where the same ratio is $v_{gs}/(2V_{ov})$, how large can $v_{gs}$ be?`,
        parts: [{ lbl: 'v_{be,max}', unit: 'mV', ans: 2 * VT * e * 1e3 }, { lbl: 'v_{gs,max}', unit: 'mV', ans: 2 * 0.2 * e * 1e3 }],
        hints: ['Set $v_{be}/(2V_T)$ equal to the allowed fraction.'],
        sol: `BJT: $v_{be}/(2V_T) = ${f(e, 3)}\\Rightarrow v_{be} = ${f(e, 3)}\\times50\\,\\text{mV} = ${f(2 * VT * e * 1e3, 3)}\\,\\text{mV}$.
MOSFET: $v_{gs}/(2V_{ov}) = ${f(e, 3)}\\Rightarrow v_{gs} = ${f(e, 3)}\\times400\\,\\text{mV} = ${f(2 * 0.2 * e * 1e3, 3)}\\,\\text{mV}$, eight times more.
The BJT buys its large $g_m$ ($I/V_T$ against $2I/V_{ov}$) with a small linear range: the same $V_T$ sets both.`,
        _chk: { kind: 'lin', mode, e },
      };
    }
    const Vov = pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4]), I = pick([0.5, 1, 2]) * 1e-3;
    return {
      q: `A BJT and a MOSFET ($V_{ov} = ${f(Vov, 3)}\\,\\text{V}$) both carry $${T.mA(I)}$. Find each $g_m$. For the same 10% second-order error, find the largest input step for each.`,
      parts: [{ lbl: 'g_{m,BJT}', unit: 'mS', ans: I / VT * 1e3 }, { lbl: 'g_{m,MOS}', unit: 'mS', ans: 2 * I / Vov * 1e3 }, { lbl: 'v_{be,max}', unit: 'mV', ans: 5 }, { lbl: 'v_{gs,max}', unit: 'mV', ans: 2 * Vov * 0.1 * 1e3 }],
      hints: ['$g_m = I_C/V_T$ and $g_m = 2I_D/V_{ov}$.', 'The second-order term over the first: $v_{be}/(2V_T)$ and $v_{gs}/(2V_{ov})$.'],
      sol: `$g_{m,BJT} = I/V_T = ${T.mS(I / VT)}$; $g_{m,MOS} = 2I/V_{ov} = ${T.mS(2 * I / Vov)}$: the BJT has $V_{ov}/(2V_T) = ${f(Vov / (2 * VT), 3)}$ times more.
Linear range: $v_{be} = 0.1\\times2V_T = 5\\,\\text{mV}$; $v_{gs} = 0.1\\times2V_{ov} = ${f(2 * Vov * 0.1 * 1e3, 3)}\\,\\text{mV}$. The product $g_m\\times(\\text{range})$ is $0.2I$ for the BJT and $0.4I$ for the MOSFET, the same order: at a given current a device trades transconductance for linear range.`,
      _chk: { kind: 'lin', mode, Vov, I },
    };
  };

  // ---------------------------------------------------------------- BJT against MOSFET transconductance
  GENS.bk_gmmos = () => {
    const mode = pick(['same', 'target']);
    const Vov = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
    if (mode === 'same') {
      const I = pick([0.1, 0.25, 0.5, 1, 2]) * 1e-3;
      const gB = I / VT, gM = 2 * I / Vov;
      return {
        q: `At the same current $I = ${T.mA(I)}$, compare a BJT with a MOSFET biased at $V_{ov} = ${f(Vov, 3)}\\,\\text{V}$: find both $g_m$ and their ratio $g_{m,BJT}/g_{m,MOS}$.`,
        parts: [{ lbl: 'g_{m,BJT}', unit: 'mS', ans: gB * 1e3 }, { lbl: 'g_{m,MOS}', unit: 'mS', ans: gM * 1e3, traps: notNear([{ v: I / Vov * 1e3, msg: 'The square law gives $g_m = 2I_D/V_{ov}$: you dropped the 2.' }], [gM * 1e3]) }, { lbl: '\\text{ratio}', unit: '', ans: gB / gM }],
        hints: ['$g_{m,BJT} = I_C/V_T$, $g_{m,MOS} = 2I_D/V_{ov}$; the ratio is $V_{ov}/(2V_T)$.'],
        sol: `$g_{m,BJT} = ${T.mA(I)}/25\\,\\text{mV} = ${T.mS(gB)}$. $g_{m,MOS} = 2(${T.mA(I)})/${f(Vov, 3)}\\,\\text{V} = ${T.mS(gM)}$. Ratio $= \\dfrac{I/V_T}{2I/V_{ov}} = \\dfrac{V_{ov}}{2V_T} = \\dfrac{${f(Vov, 3)}}{0.05} = ${f(gB / gM, 4)}$.
The current cancels: the BJT wins by $V_{ov}/(2V_T)$ at any current. A MOSFET would need $V_{ov} = 2V_T = 50\\,\\text{mV}$ to match, the edge of weak inversion, where it too becomes exponential.`,
        _chk: { kind: 'gmmos', mode, I, Vov },
      };
    }
    const gT = pick([4, 10, 20, 40, 80, 100]) * 1e-3;
    const IB = gT * VT, IM = gT * Vov / 2;
    return {
      q: `A stage needs $g_m = ${T.mS(gT)}$. What collector current does a BJT need, and what drain current does a MOSFET at $V_{ov} = ${f(Vov, 3)}\\,\\text{V}$ need?`,
      parts: [{ lbl: 'I_C', unit: 'mA', ans: IB * 1e3 }, { lbl: 'I_D', unit: 'mA', ans: IM * 1e3, traps: notNear([{ v: gT * Vov * 1e3, msg: 'From $g_m = 2I_D/V_{ov}$: $I_D = g_mV_{ov}/2$. You dropped the 2.' }], [IM * 1e3]) }],
      hints: ['$I_C = g_mV_T$; $I_D = g_mV_{ov}/2$.'],
      sol: `BJT: $I_C = g_mV_T = ${T.mS(gT)}\\times25\\,\\text{mV} = ${T.mA(IB)}$. MOSFET: $I_D = g_mV_{ov}/2 = ${T.mS(gT)}\\times${f(Vov / 2, 3)}\\,\\text{V} = ${T.mA(IM)}$: ${f(IM / IB, 3)} times the current (and the power) for the same $g_m$.`,
      _chk: { kind: 'gmmos', mode, gT, Vov },
    };
  };

  // ---------------------------------------------------------------- r_o: intrinsic gain, when r_o matters, current-source loads
  // common-emitter drawings: resistor load, ideal current-source load, PNP current-source load
  function ceFig(load) {
    const e = [['npn', [1, 1], { n: load === 'pnp' ? 'Q_1' : undefined }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }],
      ['V', [-0.6, 2.4], [-0.6, 3.4], { n: 'V_{BE}', side: 'l' }], ['gnd', [-0.6, 3.4]], ['w', [1, 0], [1.9, 0]], ['term', [1.9, 0], { n: 'v_{out}' }]];
    if (load === 'R') e.push(['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C' }]);
    else if (load === 'I') e.push(['rail', [1, -1.4], { n: 'V_{CC}' }], ['I', [1, -1.4], [1, 0], { n: 'I_{bias}' }]);
    else e.push(['rail', [1, -2], { n: 'V_{CC}' }], ['pnp', [1, -1], { n: 'Q_2' }], ['acg', [0, -1], { dir: 'l' }]);
    return e;
  }
  GENS.bk_ro = () => {
    const mode = pick(['intr', 'matter', 'matter', 'pnp']);
    const VA = pick([25, 40, 50, 60, 80, 100, 120]), IC = pick([0.1, 0.2, 0.25, 0.5, 1, 2]) * 1e-3;
    const gm = IC / VT, ro = VA / IC;
    if (mode === 'intr') {
      return {
        fig: ceFig('I'),
        q: `A common-emitter stage at $I_C = ${T.mA(IC)}$ ($V_A = ${VA}\\,\\text{V}$) has an ideal current-source load, so the collector sees only $r_o$. Find $g_m$, $r_o$ and the voltage gain $A_v = v_{out}/v_{in}$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: gm * 1e3 }, { lbl: 'r_o', unit: 'kΩ', ans: ro / 1e3 }, { lbl: 'A_v', unit: '', ans: -gm * ro, traps: notNear([{ v: gm * ro, msg: 'Magnitude right, sign wrong: a rising base pulls more current out of the collector node, so $v_{out}$ falls.' }], [-gm * ro]) }],
        hints: ['An ideal current source is an open circuit for signals, so the collector node has only $r_o$ to (incremental) ground.', '$A_v = -g_mr_o = -V_A/V_T$.'],
        sol: `$g_m = ${T.mS(gm)}$, $r_o = V_A/I_C = ${T.kO(ro)}$. The current source is open for signals, so all of $g_mv_{in}$ flows in $r_o$: $v_{out} = -g_mv_{in}r_o$ and
$$A_v = -g_mr_o = -\\frac{I_C}{V_T}\\cdot\\frac{V_A}{I_C} = -\\frac{V_A}{V_T} = -${f(VA / VT, 4)}.$$
This is the **intrinsic gain**, the most one transistor can give, and the current cancels: any bias current gives $${f(VA / VT, 4)}$.`,
        _chk: { kind: 'ro', mode, VA, IC },
      };
    }
    if (mode === 'matter') {
      const RC = pick([1, 2.2, 4.7, 10, 22, 47]) * 1e3, Rp = par(RC, ro);
      return {
        fig: ceFig('R'),
        q: `A common emitter at $I_C = ${T.mA(IC)}$ with $R_C = ${kOs(RC)}$ and $V_A = ${VA}\\,\\text{V}$. Find the gain ignoring $r_o$, the gain with $r_o$, and by how many percent $r_o$ reduces it.`,
        parts: [{ lbl: 'A_v\\ (r_o\\to\\infty)', unit: '', ans: -gm * RC }, { lbl: 'A_v\\ (\\text{with } r_o)', unit: '', ans: -gm * Rp }, { lbl: '\\text{reduction}', unit: '%', ans: (1 - Rp / RC) * 100, tol: { rel: 0.03, abs: 0.05 } }],
        hints: ['In the model $R_C$ and $r_o$ both run from the collector to incremental ground: they are in parallel.'],
        sol: `$g_m = ${T.mS(gm)}$, $r_o = ${T.kO(ro)}$. Without $r_o$: $A_v = -g_mR_C = ${f(-gm * RC, 4)}$. With it: $R_C\\parallel r_o = ${T.kO(Rp)}$ and $A_v = -g_m(R_C\\parallel r_o) = ${f(-gm * Rp, 4)}$, ${f((1 - Rp / RC) * 100, 3)}% less. ${RC < 0.1 * ro ? `Here $R_C$ is under a tenth of $r_o$, so dropping $r_o$ is a fair approximation.` : `Here $R_C$ is not small next to $r_o$: keep it.`} The reduction is $R_C/(R_C + r_o)$.`,
        _chk: { kind: 'ro', mode, VA, IC, RC },
      };
    }
    const VA2 = pick([25, 40, 50, 80]), ro2 = VA2 / IC, Rp = par(ro, ro2);
    return {
      fig: ceFig('pnp'),
      q: `An NPN common emitter $Q_1$ ($V_A = ${VA}\\,\\text{V}$) has a PNP current-source load $Q_2$ ($V_A = ${VA2}\\,\\text{V}$, base held at a fixed bias). Both carry $${T.mA(IC)}$. Find $r_{o1}$, $r_{o2}$ and $A_v$.`,
      parts: [{ lbl: 'r_{o1}', unit: 'kΩ', ans: ro / 1e3 }, { lbl: 'r_{o2}', unit: 'kΩ', ans: ro2 / 1e3 }, { lbl: 'A_v', unit: '', ans: -gm * Rp, traps: notNear([{ v: -gm * ro, msg: 'The PNP load is not ideal: its own $r_{o2}$ is in parallel with $r_{o1}$ at the output.' }], [-gm * Rp]) }],
      hints: ['Looking down into $Q_1$\'s collector you see $r_{o1}$; looking up into $Q_2$\'s collector (base and emitter held) you see $r_{o2}$.', '$A_v = -g_{m1}(r_{o1}\\parallel r_{o2})$.'],
      sol: `$g_{m1} = ${T.mS(gm)}$, $r_{o1} = ${T.kO(ro)}$, $r_{o2} = ${T.kO(ro2)}$. With $Q_2$'s base and emitter at incremental ground, its collector looks like $r_{o2}$ (its $g_mv_\\pi$ source is dead: $v_{\\pi2} = 0$). The output node sees $r_{o1}\\parallel r_{o2} = ${T.kO(Rp)}$, so
$$A_v = -g_{m1}(r_{o1}\\parallel r_{o2}) = ${f(-gm * Rp, 4)}.$$
With equal Early voltages this is half the intrinsic gain, $-V_A/(2V_T)$: the classic active-load result, as for the MOSFET ([Chapter 4](#/l/bk04-loads)).`,
      _chk: { kind: 'ro', mode: 'pnp', VA, VA2, IC },
    };
  };
  window.BK5.ceFig = ceFig;

  // ---------------------------------------------------------------- the common-emitter gain from the hybrid-pi model
  // a common emitter driven through R_S (a DC source V_BB in series sets the bias), output through C_2 into R_L if given
  function ceSrcFig(o) {
    const e = [['npn', [1, 1]], ['gnd', [1, 2]], ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: o.RC ? kOs(o.RC) : undefined }]];
    e.push(o.RS ? ['R', [-1.2, 1], [0, 1], { n: 'R_S', s: kOs(o.RS) }] : ['w', [-1.2, 1], [0, 1]]);
    e.push(['Vac', [-1.2, 1], [-1.2, 2.2], { n: 'v_s', side: 'l' }], ['V', [-1.2, 2.2], [-1.2, 3.4], { n: 'V_{BB}', side: 'l' }], ['gnd', [-1.2, 3.4]]);
    if (o.RL) e.push(['w', [1, 0], [1.5, 0]], ['C', [1.5, 0], [2.6, 0], { n: 'C_2' }], ['R', [2.6, 0], [2.6, 1.4], { n: 'R_L', s: kOs(o.RL) }], ['gnd', [2.6, 1.4]], ['w', [2.6, 0], [3.1, 0]], ['term', [3.1, 0], { n: 'v_{out}' }]);
    else e.push(['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }]);
    return e;
  }
  GENS.bk_cegain = () => {
    const IC = pick([0.25, 0.5, 1, 1, 2]) * 1e-3, beta = pick([50, 100, 100, 150, 200]), useRo = pick([true, false]), VA = pick([50, 100]);
    const RC = pick([2.2, 4.7, 5.6, 10]) * 1e3, RS = pick([0, 0.5, 1, 2.5, 5]) * 1e3, RL = pick([0, 0, 10, 22]) * 1e3;
    const gm = IC / VT, rpi = beta / gm, ro = VA / IC;
    const Rout = par(RC, ...(useRo ? [ro] : []), ...(RL ? [RL] : []));
    const div = rpi / (rpi + RS), Av = -gm * Rout * div;
    const outT = ['R_C', ...(useRo ? ['r_o'] : []), ...(RL ? ['R_L'] : [])].join('\\parallel ');
    return {
      fig: ceSrcFig({ RC, RS, RL }),
      q: `The transistor is biased at $I_C = ${T.mA(IC)}$ with $\\beta = ${beta}$; ${useRo ? `$V_A = ${VA}\\,\\text{V}$` : 'ignore $r_o$'}.${RL ? ' $C_2$ is large.' : ''} Find $g_m$, $r_\\pi$ and the gain $A_v = v_{out}/v_s$.`,
      parts: [{ lbl: 'g_m', unit: 'mS', ans: gm * 1e3 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: rpi / 1e3 },
        { lbl: 'A_v', unit: '', ans: Av, traps: notNear([{ v: -gm * RC, msg: 'That is $-g_mR_C$ alone. Account for everything else at the output' + (RS ? ' and for the input divider $R_S$–$r_\\pi$' : '') + '.' }, { v: -Av, msg: 'Sign: a common emitter inverts.' }], [Av]) }],
      hints: ['Small-signal circuit: $V_{CC}$ and $V_{BB}$ become ground' + (RL ? ', $C_2$ a short' : '') + '. Replace the transistor by $r_\\pi$ (base–emitter) and $g_mv_\\pi$' + (useRo ? ' with $r_o$' : '') + ' (collector–emitter).',
        RS ? '$v_\\pi = v_s\\,r_\\pi/(r_\\pi + R_S)$, then $v_{out} = -g_mv_\\pi(' + outT + ')$.' : '$v_\\pi = v_s$, then $v_{out} = -g_mv_\\pi(' + outT + ')$.'],
      sol: `**Parameters.** $g_m = ${T.mS(gm)}$, $r_\\pi = \\beta/g_m = ${T.kO(rpi)}$${useRo ? `, $r_o = ${T.kO(ro)}$` : ''}.

**Small-signal circuit.** $V_{CC}$ and $V_{BB}$ are incremental grounds${RL ? ', $C_2$ is a short' : ''}, the emitter is grounded. Every resistor at the collector ($${outT}$) runs from the collector to ground.

**Input.** ${RS ? `$R_S$ and $r_\\pi$ divide: $v_\\pi = v_s\\dfrac{r_\\pi}{r_\\pi + R_S} = ${f(div, 4)}\\,v_s$.` : 'The source sits right across $r_\\pi$: $v_\\pi = v_s$.'}

**Output.** KCL at the collector: the controlled source pulls $g_mv_\\pi$ out of the node, so $v_{out} = -g_mv_\\pi(${outT})$ with $${outT} = ${T.kO(Rout)}$.

$$A_v = -g_m(${outT})\\,${RS ? '\\frac{r_\\pi}{r_\\pi + R_S}' : ''} = -${T.mS(gm)}\\times${T.kO(Rout)}${RS ? `\\times${f(div, 4)}` : ''} = ${f(Av, 4)}$$`,
      _chk: { kind: 'cegain', IC, beta, useRo, VA, RC, RS, RL },
    };
  };

  // ---------------------------------------------------------------- the T model: r_e and quick gains
  GENS.bk_tgain = () => {
    const mode = pick(['deg', 'deg', 'fol', 'cb']);
    const IC = pick([0.5, 1, 1, 2, 2.5]) * 1e-3, beta = pick([50, 100, 100, 200]);
    const gm = IC / VT, al = beta / (beta + 1), re = al / gm, rpi = beta / gm, b1 = beta + 1;
    const reP = { lbl: 'r_e', unit: 'Ω', ans: re, accept: [1 / gm] };
    if (mode === 'deg') {
      const RC = pick([4.7, 5, 10, 22]) * 1e3, RE = pick([0.1, 0.22, 0.47, 1, 2.2]) * 1e3;
      const Av = -al * RC / (re + RE), ap = -RC / (1 / gm + RE), Rin = b1 * (re + RE);
      return {
        fig: [['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: kOs(RC) }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }],
          ['npn', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E', s: kOs(RE) }], ['gnd', [1, 3.2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.6], { n: 'v_{in}', side: 'l' }],
          ['V', [-0.6, 2.6], [-0.6, 3.8], { n: 'V_{BB}', side: 'l' }], ['gnd', [-0.6, 3.8]]],
        q: `A common emitter with an unbypassed emitter resistor, biased at $I_C = ${T.mA(IC)}$, $\\beta = ${beta}$ (ignore $r_o$). Find $r_e$, the gain $A_v = v_{out}/v_{in}$, and the resistance looking into the base.`,
        parts: [reP, { lbl: 'A_v', unit: '', ans: Av, accept: [ap], traps: notNear([{ v: -gm * RC, msg: 'That ignores $R_E$: the emitter is not grounded here. Use $-\\alpha R_C/(r_e + R_E)$.' }, { v: -RC / RE, msg: 'That drops $r_e$ next to $R_E$. Close for large $R_E$, but keep $r_e$.' }], [Av, ap]) },
          { lbl: 'R_{in}', unit: 'kΩ', ans: Rin / 1e3, accept: [(rpi + beta * RE) / 1e3] }],
        hints: ['$r_e = \\alpha/g_m\\approx1/g_m$.', 'T model: $v_{in} = i_e(r_e + R_E)$, $v_{out} = -\\alpha i_eR_C$. Looking into the base: $(\\beta + 1)(r_e + R_E)$.'],
        sol: `$g_m = ${T.mS(gm)}$, so $r_e = \\alpha/g_m = ${f(al, 4)}/${T.mS(gm)} = ${T.R(re)}$ (about $1/g_m = ${T.R(1 / gm)}$).

**T model.** The base sits at $v_{in}$. The emitter current $i_e$ flows through $r_e$ and then $R_E$, so $v_{in} = i_e(r_e + R_E)$. The collector delivers $\\alpha i_e$ into $R_C$, so $v_{out} = -\\alpha i_eR_C$:
$$A_v = -\\frac{\\alpha R_C}{r_e + R_E} = -\\frac{${f(al, 4)}\\times${kOs(RC)}}{${T.R(re)} + ${T.R(RE)}} = ${f(Av, 4)}$$
(The *Art of Electronics* form $-R_C/(r_e + R_E)$ gives $${f(ap, 4)}$.) "The resistance in the collector over the resistance in the emitter."

**Input.** The base current is $i_e/(\\beta + 1)$, so $R_{in} = v_{in}/i_b = (\\beta + 1)(r_e + R_E) = ${T.kO(Rin)}$ $= r_\\pi + (\\beta + 1)R_E$.`,
        _chk: { kind: 'tgain', mode, IC, beta, RC, RE },
      };
    }
    if (mode === 'fol') {
      const RE = pick([0.5, 1, 2.2, 4.7]) * 1e3, RS = pick([0, 0, 1, 5, 10]) * 1e3;
      const Av = RE / (RE + re + RS / b1), Rout = par(RE, re + RS / b1);
      return {
        fig: [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1]], ['w', [1, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'v_{out}' }], ['R', [1, 2], [1, 3.2], { n: 'R_E', s: kOs(RE) }], ['gnd', [1, 3.2]],
          ...(RS ? [['R', [-1.2, 1], [0, 1], { n: 'R_S', s: kOs(RS) }]] : [['w', [-1.2, 1], [0, 1]]]),
          ['Vac', [-1.2, 1], [-1.2, 2.2], { n: 'v_s', side: 'l' }], ['V', [-1.2, 2.2], [-1.2, 3.4], { n: 'V_{BB}', side: 'l' }], ['gnd', [-1.2, 3.4]]],
        q: `An emitter follower biased at $I_C = ${T.mA(IC)}$, $\\beta = ${beta}$ (ignore $r_o$). Find $r_e$, the gain $v_{out}/v_s$, and the output resistance looking back into the emitter node (including $R_E$).`,
        parts: [reP, { lbl: 'A_v', unit: '', ans: Av, tol: { rel: 0.004 } }, { lbl: 'R_{out}', unit: 'Ω', ans: Rout }],
        hints: ['T model: the emitter current flows through $r_e$ and $R_E$; the base current, $i_e/(\\beta + 1)$, flows through $R_S$.', 'Seen from the emitter, $R_S$ shrinks to $R_S/(\\beta + 1)$: $A_v = R_E/(R_E + r_e + R_S/(\\beta + 1))$.'],
        sol: `$r_e = \\alpha/g_m = ${T.R(re)}$. KVL from the source to ground: $v_s = i_bR_S + i_e(r_e + R_E)$ with $i_b = i_e/(\\beta + 1)$, and $v_{out} = i_eR_E$:
$$\\frac{v_{out}}{v_s} = \\frac{R_E}{R_E + r_e + R_S/(\\beta + 1)} = \\frac{${T.R(RE)}}{${T.R(RE)} + ${T.R(re)} + ${T.R(RS / b1)}} = ${f(Av, 4)}$$
Output resistance: $R_E$ in parallel with what the emitter shows, $r_e + R_S/(\\beta + 1) = ${T.R(re + RS / b1)}$: $R_{out} = ${T.R(Rout)}$. A follower: gain just under 1, low output resistance.`,
        _chk: { kind: 'tgain', mode, IC, beta, RE, RS },
      };
    }
    const RC = pick([2.2, 4.7, 10]) * 1e3, RS = pick([0, 0, 25, 50, 100]);
    const Av = al * RC / (re + RS);
    return {
      fig: [['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: kOs(RC) }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['npn', [1, 1]], ['acg', [0, 1]],
        ...(RS ? [['R', [1, 2], [1, 3.2], { n: 'R_S', s: `${RS}\\,\\Omega` }], ['Vac', [1, 3.2], [1, 4.4], { n: 'v_s', side: 'l' }], ['V', [1, 5.6], [1, 4.4], { n: 'V_{EE}', side: 'l' }], ['gnd', [1, 5.6]]]
          : [['Vac', [1, 2], [1, 3.2], { n: 'v_s', side: 'l' }], ['V', [1, 4.4], [1, 3.2], { n: 'V_{EE}', side: 'l' }], ['gnd', [1, 4.4]]])],
      q: `A common-base stage biased at $I_C = ${T.mA(IC)}$, $\\beta = ${beta}$ (ignore $r_o$; the base is held at a fixed bias). The source drives the emitter${RS ? ` through $R_S = ${RS}\\,\\Omega$` : ''}. Find $r_e$ (the input resistance at the emitter) and $A_v = v_{out}/v_s$.`,
      parts: [reP, { lbl: 'A_v', unit: '', ans: Av, accept: [gm * RC / (1 + gm * RS)], traps: notNear([{ v: -Av, msg: 'Sign: a common base does **not** invert. Raising the emitter reduces $V_{BE}$, less current flows in $R_C$, and the collector rises.' }], [Av]) }],
      hints: ['With the base held, the emitter looks like $r_e$.', 'The source pushes $i_e = v_s/(R_S + r_e)$ out of the emitter (into the transistor in the opposite sense); the collector carries $\\alpha$ of it through $R_C$.'],
      sol: `$r_e = \\alpha/g_m = ${T.R(re)}$. The emitter current is set by the source across $R_S + r_e$ (the base is grounded for signals): a rise $v_s$ at the emitter reduces the current by $v_s/(R_S + r_e)$; the collector current drops by $\\alpha$ of that, so the collector rises:
$$A_v = \\frac{\\alpha R_C}{r_e + R_S} = \\frac{${f(al, 4)}\\times${kOs(RC)}}{${T.R(re)} + ${T.R(RS)}} = ${f(Av, 4)}$$
${RS ? '' : 'With no source resistance this is $\\alpha R_C/r_e = g_mR_C$: the common-emitter magnitude, without the inversion. '}The price is the input resistance: only $r_e = ${T.R(re)}$.`,
      _chk: { kind: 'tgain', mode, IC, beta, RC, RS },
    };
  };

  // ---------------------------------------------------------------- a PNP stage: DC, then the same model
  GENS.bk_pnpgain = () => {
    let p, s;
    for (let t = 0; t < 1000; t++) {
      const VCC = pick([5, 9, 10, 12]), RB = pick([10, 22, 47, 100]) * 1e3, beta = pick([50, 80, 100, 150]);
      const VBB = r2(VCC - pick([1.5, 2, 2.5, 3]));
      const IB = (VCC - VON - VBB) / RB, IC = beta * IB;
      if (IC < 0.2e-3 || IC > 5e-3) continue;
      const RC = pick([0.47, 1, 2.2, 3.3, 4.7]) * 1e3;
      s = pnpDC({ VCC, VBB, RB, RC, RE: 0, beta });
      if (s.reg !== 'act' || s.VB - s.VC < 0.5) continue;
      p = { VCC, RB, beta, VBB, RC };
      break;
    }
    const gm = s.IC / VT, rpi = p.beta / gm, div = rpi / (rpi + p.RB), Av = -gm * p.RC * div;
    const fig = biasFig({ type: 'pnp', base: 'vbb', VCC: p.VCC, VBB: p.VBB, RB: p.RB, RC: p.RC }).flatMap((el) => {
      if (el[0] === 'V' && el[3] && el[3].n === 'V_{BB}') return [['Vac', [-0.2, 1], [-0.2, 2], { n: 'v_s', side: 'l' }], ['V', [-0.2, 2], [-0.2, 3.2], { n: 'V_{BB}', s: Vs(p.VBB), side: 'l' }]];
      if (el[0] === 'gnd' && el[1][0] === -0.2) return [['gnd', [-0.2, 3.2]]];
      return [el];
    }).concat([['w', [2, 2], [2.8, 2]], ['term', [2.8, 2], { n: 'v_{out}' }]]);
    return {
      fig,
      q: `A PNP common emitter: emitter at $V_{CC} = ${p.VCC}\\,\\text{V}$, the base driven from $V_{BB} = ${f(p.VBB, 3)}\\,\\text{V}$ through $R_B = ${kOs(p.RB)}$ with the signal $v_s$ in series, $R_C = ${kOs(p.RC)}$ to ground, $\\beta = ${p.beta}$ (ignore $r_o$). Find $I_C$, $g_m$ and $A_v = v_{out}/v_s$.`,
      parts: [{ lbl: 'I_C', unit: 'mA', ans: s.IC * 1e3 }, { lbl: 'g_m', unit: 'mS', ans: gm * 1e3 },
        { lbl: 'A_v', unit: '', ans: Av, traps: notNear([{ v: -Av, msg: 'A PNP common emitter inverts too: the model is the same as the NPN\'s.' }, { v: -gm * p.RC, msg: 'That ignores the divider $R_B$–$r_\\pi$ at the input.' }], [Av]) }],
      hints: ['DC (PNP): $I_B = (V_{CC} - 0.7 - V_{BB})/R_B$, out of the base.', 'Small signal: the same hybrid-$\\pi$ model as an NPN. $R_B$ is in series with the source, so $v_\\pi = v_s\\,r_\\pi/(r_\\pi + R_B)$; $v_{out} = -g_mv_\\pi R_C$.'],
      sol: `**DC.** $I_B = \\dfrac{${p.VCC} - 0.7 - ${f(p.VBB, 3)}}{${kOs(p.RB)}} = ${T.uA(s.IB)}$, $I_C = ${T.mA(s.IC)}$; $V_B = ${T.V(s.VB)}$, $V_C = I_CR_C = ${T.V(s.VC)}\\le V_B$ ✓.

**Parameters.** $g_m = ${T.mS(gm)}$, $r_\\pi = ${T.kO(rpi)}$.

**Small signal** (the PNP uses the NPN's model unchanged, [Section 7.6](#/l/bk07-pnpmodel)): $V_{CC}$ and $V_{BB}$ are ground; $v_s$ drives $r_\\pi$ through $R_B$: $v_\\pi = ${f(div, 4)}\\,v_s$; the collector source pulls $g_mv_\\pi$ through $R_C$:
$$A_v = -g_mR_C\\frac{r_\\pi}{r_\\pi + R_B} = -${T.mS(gm)}\\times${kOs(p.RC)}\\times${f(div, 4)} = ${f(Av, 4)}$$`,
      _chk: { kind: 'pnpgain', p, ans: [s.IC * 1e3, gm * 1e3, Av] },
    };
  };

  // ---------------------------------------------------------------- the whole exam chain: bias, parameters, R_in, gain
  GENS.bk_full = () => {
    let p, s, th;
    for (let t = 0; t < 2000; t++) {
      const VCC = pick([10, 12, 15]), R1 = pick([33, 47, 56, 68, 82, 100]) * 1e3, R2 = pick([6.8, 10, 12, 15, 22]) * 1e3;
      const RE = pick([0.47, 1, 1.2, 1.5, 2.2]) * 1e3, RC = pick([2.2, 3.3, 4.7, 5.6]) * 1e3, beta = pick([80, 100, 120, 150, 200]);
      th = thev(VCC, R1, R2);
      s = npnDC({ VCC, VBB: th.VBB, RB: th.RB, RC, RE, beta });
      if (s.reg !== 'act' || s.IC < 0.3e-3 || s.IC > 5e-3 || s.VC - s.VB < 1) continue;
      p = { VCC, R1, R2, RE, RC, beta, RL: pick([4.7, 10, 22]) * 1e3, RS: pick([0.5, 1, 2]) * 1e3, bypass: pick([true, true, false]) };
      break;
    }
    const gm = s.IC / VT, rpi = p.beta / gm, Rb = par(p.R1, p.R2), Rcl = par(p.RC, p.RL), b1 = p.beta + 1;
    const Rbase = p.bypass ? rpi : rpi + b1 * p.RE, Rin = par(Rb, Rbase);
    const Avb = -p.beta * Rcl / Rbase, div = Rin / (Rin + p.RS), Av = Avb * div;
    const traps = [{ v: Avb, msg: 'That is the gain from the base. The source sees $R_{in}$ through $R_S$: multiply by $R_{in}/(R_{in} + R_S)$.' },
      { v: -gm * p.RC * div, msg: '$R_L$ is in parallel with $R_C$ for signals ($C_2$ is a short).' }];
    if (!p.bypass) traps.push({ v: -gm * Rcl * par(Rb, rpi) / (par(Rb, rpi) + p.RS), msg: '$R_E$ is **not** bypassed here: the emitter is not at ground for signals.' });
    return {
      fig: ampFig({ VCC: p.VCC, R1: p.R1, R2: p.R2, RC: p.RC, RE: p.RE, RL: p.RL, RS: p.RS, bypass: p.bypass }),
      q: `$\\beta = ${p.beta}$, ignore $r_o$; the capacitors are large${p.bypass ? '' : ' (note: no bypass capacitor across $R_E$)'}. Find $I_C$, $g_m$, the input resistance $R_{in}$ seen by the source (to the right of $R_S$), and $A_v = v_{out}/v_s$.`,
      parts: [{ lbl: 'I_C', unit: 'mA', ans: s.IC * 1e3 }, { lbl: 'g_m', unit: 'mS', ans: gm * 1e3 }, { lbl: 'R_{in}', unit: 'kΩ', ans: Rin / 1e3 },
        { lbl: 'A_v', unit: '', ans: Av, traps: notNear(traps, [Av]) }],
      hints: ['DC: capacitors open; Thévenin the divider; base loop with $(\\beta + 1)R_E$.', `Signal: $R_1\\parallel R_2$ from base to ground; the base itself shows ${p.bypass ? '$r_\\pi$' : '$r_\\pi + (\\beta + 1)R_E$'}; the collector sees $R_C\\parallel R_L$.`],
      sol: `**1. DC** (capacitors open): $V_{TH} = ${T.V(th.VBB)}$, $R_{TH} = ${T.kO(th.RB)}$, $I_B = \\dfrac{V_{TH} - 0.7}{R_{TH} + (\\beta + 1)R_E} = ${T.uA(s.IB)}$, $I_C = ${T.mA(s.IC)}$ ($V_C = ${T.V(s.VC)}\\ge V_B = ${T.V(s.VB)}$ ✓).

**2. Parameters:** $g_m = ${T.mS(gm)}$, $r_\\pi = ${T.kO(rpi)}$.

**3. Input resistance.** For signals $V_{CC}$ is ground, so $R_1$ and $R_2$ both hang from the base to ground: $R_1\\parallel R_2 = ${T.kO(Rb)}$. Into the base: ${p.bypass ? `$r_\\pi = ${T.kO(rpi)}$ (the emitter is grounded by $C_E$)` : `$r_\\pi + (\\beta + 1)R_E = ${T.kO(Rbase)}$ ($R_E$ is not bypassed)`}. So $R_{in} = ${T.kO(Rb)}\\parallel${T.kO(Rbase)} = ${T.kO(Rin)}$.

**4. Gain from the base.** The collector sees $R_C\\parallel R_L = ${T.kO(Rcl)}$. ${p.bypass ? `$v_{out}/v_b = -g_m(R_C\\parallel R_L) = ${f(Avb, 4)}$.` : `With $R_E$ in the emitter, $v_{out}/v_b = -\\dfrac{\\beta(R_C\\parallel R_L)}{r_\\pi + (\\beta + 1)R_E} = ${f(Avb, 4)}$ (the T-model form $-\\alpha(R_C\\parallel R_L)/(r_e + R_E)$).`}

**5. Source divider:** $v_b/v_s = R_{in}/(R_{in} + R_S) = ${f(div, 4)}$.

$$A_v = ${f(Avb, 4)}\\times${f(div, 4)} = ${f(Av, 4)}$$`,
      _chk: { kind: 'full', p, ans: [s.IC * 1e3, gm * 1e3, Rin / 1e3, Av] },
    };
  };

  // ---------------------------------------------------------------- MOSFET result -> BJT twin
  const TWINS = [
    ['common-source gain $-g_m(R_D\\parallel r_{ds})$', '$-g_m(R_C\\parallel r_o)$, with $g_m = I_C/V_T$', ['$-\\beta(R_C\\parallel r_o)$', '$-g_mr_\\pi R_C$', '$-(R_C\\parallel r_o)/r_\\pi$'],
      ['That is the gain from base **current**, not from base voltage.', 'That is $-\\beta R_C$ in disguise ($g_mr_\\pi = \\beta$).', 'Not a transconductance times a resistance.'], 'Nothing in this result involves the gate current, so it carries over with $g_m\\to I_C/V_T$ and $r_{ds}\\to r_o$.'],
    ['resistance looking into the gate: $\\infty$', '$r_\\pi$', ['$\\infty$', '$1/g_m$', '$r_o$'], ['A base draws current: it is not an open circuit.', 'That is the emitter side.', 'That is the collector side.'], 'The gate draws nothing; the base draws $i_b = v_{be}/r_\\pi$.'],
    ['into the gate with $R_S$ under the source: $\\infty$', '$r_\\pi + (\\beta + 1)R_E$', ['$r_\\pi + R_E$', '$\\infty$', '$(\\beta + 1)r_\\pi$'], ['$R_E$ carries $(\\beta + 1)$ times the base current, so it counts $(\\beta + 1)$ times.', 'A base draws current.', 'It is $R_E$ that is multiplied, not $r_\\pi$.'], 'The base current flows through $r_\\pi$; $(\\beta + 1)$ times it flows through $R_E$.'],
    ['looking into the source (gate held): $1/g_m$', '$r_e = r_\\pi/(\\beta + 1)\\approx1/g_m$', ['$r_\\pi$', '$(\\beta + 1)r_\\pi$', '$\\beta/g_m$'], ['That is the base.', 'Backwards: looking from the emitter, base-side resistances are divided by $(\\beta + 1)$.', 'That is $r_\\pi$ again.'], 'The emitter carries $(\\beta + 1)$ times the base current, so $r_\\pi$ looks $(\\beta + 1)$ times smaller from it.'],
    ['source-follower gain $R_S/(R_S + 1/g_m)$ (no body effect, $r_{ds}\\to\\infty$)', '$R_E/(R_E + r_e)$, with $r_e = \\alpha/g_m$', ['$R_E/(R_E + r_\\pi)$', '$g_mR_E$', '$-R_E/(R_E + r_e)$'], ['$r_\\pi$ is what the base sees; the emitter side sees $r_e$.', 'That would be a gain above 1; a follower is just under 1.', 'A follower does not invert.'], 'Same form; $1/g_m$ becomes $r_e$ (with $\\beta$ finite).'],
    ['intrinsic gain $g_mr_{ds} = 2/(\\lambda V_{ov})$', '$g_mr_o = V_A/V_T$', ['$\\beta$', '$g_mr_\\pi$', '$V_A/V_{BE}$'], ['$\\beta$ is $g_mr_\\pi$, a current gain.', 'That is $\\beta$.', 'The 0.7 V plays no part; $V_T = 25\\,\\text{mV}$ does.'], '$g_m = I_C/V_T$ and $r_o = V_A/I_C$; the current cancels.'],
    ['drain resistance with degeneration $r_{ds} + R_S + g_mr_{ds}R_S$', '$r_o + R_E\\parallel r_\\pi + g_mr_o(R_E\\parallel r_\\pi)$', ['$r_o + R_E + g_mr_oR_E$', '$r_o(1 + \\beta)$', '$r_o + (\\beta + 1)R_E$'], ['The base is not an open circuit: $r_\\pi$ sits from the (held) base to the emitter, in parallel with $R_E$.', 'That is only the ceiling, reached when $R_E\\gg r_\\pi$.', 'That is the base-side (β + 1) rule, misapplied.'], 'With the base held, $r_\\pi$ goes from the emitter node to incremental ground, in parallel with $R_E$; then the MOSFET algebra repeats with $R_S\\to R_E\\parallel r_\\pi$ (Chapter 8).'],
  ];
  GENS.bk_twin = () => {
    const [mos, right, wrongs, whys, why] = pick(TWINS);
    const mc = [right, ...wrongs];
    return {
      q: `A MOSFET circuit has the result: ${mos}. In the BJT twin (gate → base, source → emitter, drain → collector), what does it become?`,
      parts: [{ lbl: 'BJT twin', mc, a: 0, why: [null, ...whys] }],
      hints: ['Ask first: did the MOSFET result rely on the gate drawing no current? If not, swap $g_m$ and $r_{ds}\\to r_o$. If it did, the base current changes it: $r_\\pi$ and $(\\beta + 1)$ appear.'],
      sol: `**${right}.** ${why}`,
      _chk: { kind: 'twin' },
    };
  };
})();

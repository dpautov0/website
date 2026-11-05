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
      e.push(['w', [2, 0], [0.6, 0]], ['R', [0.6, 0], [0.6, 1.25], { n: 'R_B', s: s(o.RB), side: 'l' }], ['w', [0.6, 1.25], [0.6, 1], [1, 1]]);
    }
    if (o.nodes) {
      const lab = (pt, t, a = 'l') => ['txt', pt, `$${t}$`, { a }];
      if (pnp) e.push(lab([2.18, -0.12], 'V_E'), lab([2.18, 2.14], 'V_C'), lab([1.05, 0.62], 'V_B', 'r'));
      else e.push(lab([2.18, -0.12], 'V_C'), lab([2.18, 2.14], 'V_E'), lab([1.05, 0.62], 'V_B', 'r'));
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

  window.BK5 = { VT, VON, VSAT, T, kOs, Vs, npnDC, pnpDC, thev, biasFig, plot, label, texL, svg, lab, head, arrow, rect, par };

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
})();

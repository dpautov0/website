/* gens-bk-a7.js — the book's Chapters 10 (capacitors, time constants, transfer functions) and 11 (Bode plots):
   shared drawing helpers (window.BK7: number formatting, answer parts, a log-frequency plotter, a small SVG kit for
   physical pictures) and the randomized drills. Every generator returns _chk (its inputs and answers) so an outside
   script can recompute each answer independently (complex nodal analysis, exact evaluation, numerical roots).
   Plots of transfer functions use E3Bode (gens-e3-bode.js). */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, ri = U.ri, par = U.par;
  const GENS = window.GENS;
  const LOG = Math.log10, DEG = 180 / Math.PI, PI = Math.PI;
  const EB = () => window.E3Bode;

  // ================================================================ formatting (TeX)
  const KO = (r) => `${f(r / 1e3, 3)}\\,\\text{k}\\Omega`;
  const resT = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  const capT = (c) => (c >= 0.9995e-6 ? `${f(c * 1e6, 3)}\\,\\mu\\text{F}` : c >= 0.9995e-9 ? `${f(c * 1e9, 3)}\\,\\text{nF}` : c >= 0.9995e-12 ? `${f(c * 1e12, 3)}\\,\\text{pF}` : `${f(c * 1e15, 3)}\\,\\text{fF}`);
  const MS = (g) => `${f(g * 1e3, 3)}\\,\\text{mS}`;
  const MA = (i) => (i >= 0.9995e-3 ? `${f(i * 1e3, 3)}\\,\\text{mA}` : `${f(i * 1e6, 3)}\\,\\mu\\text{A}`);
  const T_UNITS = [[1, 's'], [1e-3, 'ms'], [1e-6, 'µs'], [1e-9, 'ns'], [1e-12, 'ps']];
  const W_UNITS = [[1e9, 'Grad/s'], [1e6, 'Mrad/s'], [1e3, 'krad/s'], [1, 'rad/s']];
  const F_UNITS = [[1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz'], [1, 'Hz']];
  const R_UNITS = [[1e6, 'MΩ'], [1e3, 'kΩ'], [1, 'Ω']];
  const unitTeX = (u) => u.replace(/(µ)|(Ω)|([A-Za-z/]+)/g, (m, mu, om, w) => (mu ? '\\mu' : om ? '\\Omega' : `\\text{${w}}`));
  const sc = (v, table) => table.find(([x]) => Math.abs(v) >= x * 0.9995) || table[table.length - 1];
  const withU = (v, table, sig = 3) => { const [s, u] = sc(v, table); return `${f(v / s, sig)}\\,${unitTeX(u)}`; };
  const timeT = (t, sig) => withU(t, T_UNITS, sig);
  const wT = (w, sig) => withU(w, W_UNITS, sig);
  const fT = (x, sig) => withU(x, F_UNITS, sig);
  const fd = (x, sig = 3) => f(Math.abs(x) < 0.005 ? 0 : x, sig);          // degrees and dB, float dust shown as 0
  const degT = (d, sig = 3) => `${fd(d, sig)}^\\circ`;
  const dbT = (d, sig = 3) => `${fd(d, sig)}\\,\\text{dB}`;
  const sgn = (x) => (x >= 0 ? '+' : '-');

  // ================================================================ answer parts
  // a value shown in a scaled unit (ns, Mrad/s, kHz, kΩ ...). accept: other values that count as right (SI);
  // traps: known slips {v (SI), msg}, kept only when clearly different (> 4%) from every right answer.
  function part(lbl, v, table, o = {}) {
    const [s, u] = sc(v, table);
    const p = { lbl, unit: u, ans: v / s };
    const goods = [v, ...(o.accept || [])];
    const acc = (o.accept || []).filter((a) => Math.abs(a - v) > 0.012 * Math.abs(v));
    if (acc.length) p.accept = acc.map((a) => a / s);
    // a trap must sit clear of every right answer's window (1.5% or tol.abs) and of its own 1.5% window
    const ta = (o.tol && o.tol.abs) || 0;
    const clear = (t) => goods.every((g) => Math.abs(t - g) > Math.max(0.04 * Math.abs(g), ta + 0.02 * Math.abs(t)) + 1e-12);
    const seen = [];
    const t = (o.traps || []).filter((x) => x && isFinite(x.v) && x.msg && clear(x.v)
      && !seen.some((y) => Math.abs(y - x.v) <= 0.02 * Math.abs(x.v)) && seen.push(x.v));
    if (t.length) p.traps = t.map((x) => ({ v: x.v / s, msg: x.msg }));
    if (o.tol) p.tol = o.tol;
    return p;
  }
  // a plain number with a fixed unit (V/V, dB, °); tol as in Expr.compareNumber
  function plain(lbl, v, unit, o = {}) {
    return part(lbl, v, [[1, unit]], o);
  }
  const tPart = (lbl, v, o) => part(lbl, v, T_UNITS, o);
  const wPart = (lbl, v, o) => part(lbl, v, W_UNITS, o);
  const fPart = (lbl, v, o) => part(lbl, v, F_UNITS, o);
  const rPart = (lbl, v, o) => part(lbl, v, R_UNITS, o);

  // ================================================================ drawing
  // a TeX label as the site's figures write them (a foreignObject that figlabels.js lifts into an HTML layer)
  function lab(x, y, html, anchor = 'c', cls = 'small') {
    if (!html) return '';
    const w = 220, h = 60;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (/l/.test(anchor) && anchor !== 'c') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (/r/.test(anchor)) { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (/^t|t$/.test(anchor) && anchor !== 'c') { fy = y; ai = 'flex-start'; }
    if (/^b|b$/.test(anchor)) { fy = y - h; ai = 'flex-end'; }
    return `<foreignObject x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">${html}</span></div></foreignObject>`;
  }
  const tx = (t) => (t === undefined || t === null || t === '' ? '' : String(t).includes('$') ? String(t) : `$${t}$`);

  // a small SVG kit for physical pictures (pixel units, y down); every drawing gets the "schem" class
  class Pic {
    constructor() { this.s = ''; this.box = [Infinity, Infinity, -Infinity, -Infinity]; }
    grow(x, y) { const b = this.box; b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
    path(d, cls = '', style = '') {
      // grow the box with every point (absolute M L H V C Q Z only)
      let x = 0, y = 0;
      const re = /([MLHVCQZ])([^MLHVCQZ]*)/g;
      let m;
      while ((m = re.exec(d))) {
        const n = (m[2].match(/-?\d*\.?\d+(e-?\d+)?/g) || []).map(Number);
        if (m[1] === 'H') n.forEach((v) => { x = v; this.grow(x, y); });
        else if (m[1] === 'V') n.forEach((v) => { y = v; this.grow(x, y); });
        else for (let i = 0; i + 1 < n.length; i += 2) { x = n[i]; y = n[i + 1]; this.grow(x, y); }
      }
      this.s += `<path${cls ? ` class="${cls}"` : ''} d="${d}"${style ? ` style="${style}"` : ''}/>`; return this;
    }
    line(x1, y1, x2, y2, cls, style) { return this.path(`M${x1},${y1}L${x2},${y2}`, cls, style); }
    head(x, y, ang, sz = 7, style = '') {             // filled arrowhead with its tip at (x, y), pointing along ang (deg)
      const a = ang / DEG, ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
      const p = (k, m) => `${(x - ux * sz * k + px * sz * m).toFixed(1)},${(y - uy * sz * k + py * sz * m).toFixed(1)}`;
      this.s += `<path class="fill" d="M${x.toFixed(1)},${y.toFixed(1)}L${p(1, 0.5)}L${p(1, -0.5)}Z"${style ? ` style="${style}"` : ''}/>`;
      return this;
    }
    arrow(x1, y1, x2, y2, cls = '', style = '', sz = 7) {
      const L = Math.hypot(x2 - x1, y2 - y1), k = (L - sz * 0.8) / L;
      this.line(x1, y1, x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, cls, style);
      return this.head(x2, y2, Math.atan2(y2 - y1, x2 - x1) * DEG, sz, style ? style.replace(/stroke/g, 'fill') : '');
    }
    circle(cx, cy, r, cls = '', style = '') { this.grow(cx - r, cy - r); this.grow(cx + r, cy + r); this.s += `<circle${cls ? ` class="${cls}"` : ''} cx="${cx}" cy="${cy}" r="${r}"${style ? ` style="${style}"` : ''}/>`; return this; }
    rect(x, y, w, h, cls = '', style = '') { this.grow(x, y); this.grow(x + w, y + h); this.s += `<rect${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}"${style ? ` style="${style}"` : ''}/>`; return this; }
    lab(x, y, t, anchor = 'c', cls = 'small', w = 30, h = 18) {
      // grow the box by a rough label size so the view box keeps it
      const dx = /l/.test(anchor) && anchor !== 'c' ? [0, w] : /r/.test(anchor) ? [-w, 0] : [-w / 2, w / 2];
      const dy = /^t|t$/.test(anchor) && anchor !== 'c' ? [0, h] : /^b|b$/.test(anchor) ? [-h, 0] : [-h / 2, h / 2];
      this.grow(x + dx[0], y + dy[0]); this.grow(x + dx[1], y + dy[1]);
      this.s += lab(x, y, tx(t), anchor, cls); return this;
    }
    plus(x, y, r = 4) { return this.path(`M${x - r},${y}H${x + r}M${x},${y - r}V${y + r}`); }
    minus(x, y, r = 4) { return this.path(`M${x - r},${y}H${x + r}`); }
    svg(maxW = 520, pad = 8) {
      const [x0, y0, x1, y1] = this.box;
      const vx = Math.floor(x0 - pad), vy = Math.floor(y0 - pad), vw = Math.ceil(x1 - x0 + 2 * pad), vh = Math.ceil(y1 - y0 + 2 * pad);
      return `<svg class="schem" viewBox="${vx} ${vy} ${vw} ${vh}" width="${Math.min(vw, maxW)}" role="img" aria-label="diagram">${this.s}</svg>`;
    }
  }

  // a plot against log frequency: decades labelled 10^n, linear y.
  // o: { wmin, wmax, y: [lo, hi], yt: [ticks], ytl: v => TeX, yl, xl, w, h,
  //      curves: [{ f: w => y, cls, from, to } | { pts: [[w, y], ...], cls }], marks: [{ w, n }], pts: [{ w, y, n, side }],
  //      notes: [{ w, y, n, anchor }], hlines: [{ y, cls }] }
  let clipN = 0;
  function lplot(o) {
    const W = o.w || 440, H = o.h || 220, ml = 50, mr = 18, mt = 26, mb = 40;
    const L0 = LOG(o.wmin), L1 = LOG(o.wmax), [y0, y1] = o.y;
    const X = (w) => ml + (LOG(w) - L0) / (L1 - L0) * (W - ml - mr);
    const Y = (v) => H - mb - (v - y0) / (y1 - y0) * (H - mt - mb);
    const id = `bk7c${++clipN}${Math.floor(Math.random() * 1e6)}`;
    let s = `<svg class="plot e3bode" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="plot"><defs><clipPath id="${id}"><rect x="${ml}" y="${mt - 2}" width="${W - ml - mr}" height="${H - mt - mb + 4}"/></clipPath></defs>`;
    for (let d = Math.ceil(L0 - 1e-9); d <= Math.floor(L1 + 1e-9); d++) {
      s += `<path class="grid" d="M${X(10 ** d).toFixed(1)},${mt}V${H - mb}"/>`;
      if (d < L1) for (let m = 2; m <= 9; m++) { const lw = d + LOG(m); if (lw < L1 && lw > L0) s += `<path class="grid" style="opacity:.45" d="M${X(10 ** lw).toFixed(1)},${mt}V${H - mb}"/>`; }
    }
    (o.yt || []).forEach((v) => {
      s += `<path class="grid" d="M${ml},${Y(v).toFixed(1)}H${W - mr}"/>`;
      s += lab(ml - 6, Y(v), `<span class="tick">$${o.ytl ? o.ytl(v) : f(v, 4)}$</span>`, 'r');
    });
    (o.hlines || []).forEach((h) => { s += `<path class="axis" style="stroke-dasharray:2 3" d="M${ml},${Y(h.y).toFixed(1)}H${W - mr}"/>`; });
    s += `<path class="axis" d="M${ml},${mt}V${H - mb}H${W - mr}"/>`;
    s += `<g clip-path="url(#${id})">`;
    (o.curves || []).forEach((c) => {
      let pts = c.pts;
      if (c.f) {
        pts = [];
        const a = LOG(c.from || o.wmin), b = LOG(c.to || o.wmax);
        for (let i = 0; i <= 260; i++) { const w = 10 ** (a + (b - a) * i / 260); const v = c.f(w); if (isFinite(v)) pts.push([w, v]); }
      }
      s += `<path class="curve ${c.cls || ''}" d="M${pts.map(([w, v]) => `${X(w).toFixed(1)},${Y(v).toFixed(1)}`).join('L')}"/>`;
    });
    s += '</g>';
    (o.marks || []).forEach((m) => {
      s += `<path class="axis" style="stroke-dasharray:3 3;stroke-width:1" d="M${X(m.w).toFixed(1)},${mt}V${H - mb}"/>`;
      if (m.n) s += lab(X(m.w), mt - 3, `$${m.n}$`, 'b');
    });
    (o.pts || []).forEach((p) => {
      s += `<circle class="fill" cx="${X(p.w).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.6"/>`;
      if (p.n) { const sd = p.side || 'ur', dx = /l/.test(sd) ? -7 : 7, dy = /d/.test(sd) ? 6 : -6; s += lab(X(p.w) + dx, Y(p.y) + dy, `$${p.n}$`, { ur: 'bl', ul: 'br', dr: 'tl', dl: 'tr' }[sd]); }
    });
    (o.notes || []).forEach((n) => { s += lab(X(n.w), Y(n.y), tx(n.n), n.anchor || 'c'); });
    s += lab(6, mt - 4, `$${o.yl || '|H|_{\\text{dB}}'}$`, 'bl');
    const every = (L1 - L0) > 8 ? 2 : 1;
    for (let d = Math.ceil(L0 - 1e-9); d <= Math.floor(L1 + 1e-9); d += every) s += lab(X(10 ** d), H - mb + 5, `<span class="tick">$${d === 0 ? '1' : d === 1 ? '10' : `10^{${d}}`}$</span>`, 't');
    s += lab(W - mr, H - mb + 22, `$${o.xl || '\\omega\\ (\\text{rad/s})'}$`, 'tr');
    return s + '</svg>';
  }

  window.BK7 = { f, KO, resT, capT, MS, MA, timeT, wT, fT, fd, degT, dbT, part, plain, tPart, wPart, fPart, rPart, lab, Pic, lplot, T_UNITS, W_UNITS, F_UNITS, R_UNITS };

  // ================================================================ circuits used by the drills
  // RC low-pass: v_in through R1 into the node; optional R2 and C from the node to ground
  const lpFig = (R1, R2, C, vals = true) => [
    ['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.3, 0]],
    ['R', [0.3, 0], [1.5, 0], { n: 'R_1', s: vals ? resT(R1) : undefined }], ['w', [1.5, 0], [3.5, 0]],
    ...(R2 ? [['R', [2.1, 0], [2.1, 1.6], { n: 'R_2', s: vals ? resT(R2) : undefined, side: 'l' }], ['gnd', [2.1, 1.6]]] : []),
    ['C', [2.9, 0], [2.9, 1.6], { n: 'C', s: vals ? capT(C) : undefined }], ['gnd', [2.9, 1.6]],
    ['term', [3.5, 0], { n: 'v_{out}' }]];
  // coupling capacitor between a source (with R_S) and an amplifier input R_in
  const hpFig = (RS, Rin, C, vals = true) => [
    ['Vac', [0, 0.4], [0, 1.6], { n: 'v_s', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.3, 0]],
    ['R', [0.3, 0], [1.5, 0], { n: 'R_S', s: vals ? resT(RS) : undefined }], ['w', [1.5, 0], [1.8, 0]],
    ['C', [1.8, 0], [3.0, 0], { n: 'C_C', s: vals ? capT(C) : undefined }], ['w', [3.0, 0], [4.2, 0]],
    ['R', [3.6, 0], [3.6, 1.6], { n: 'R_{in}', s: vals ? resT(Rin) : undefined }], ['gnd', [3.6, 1.6]], ['term', [4.2, 0], { n: 'v_{in}' }]];
  // common source / common emitter with a load capacitor (input driven by an ideal source)
  const ampCL = (bjt, o = {}) => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: bjt ? 'R_C' : 'R_D', s: o.R }], ['w', [1, 0], [2.8, 0]], ['term', [2.8, 0], { n: 'v_{out}' }],
    ['C', [2.1, 0], [2.1, 1.2], { n: 'C_L', s: o.C }], ['gnd', [2.1, 1.2]], [bjt ? 'npn' : 'nmos', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
  // two-section RC ladder (unbuffered)
  const ladderFig = (R1, C1, R2, C2, vals = true) => [
    ['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.3, 0]],
    ['R', [0.3, 0], [1.5, 0], { n: 'R_1', s: vals ? resT(R1) : undefined }], ['w', [1.5, 0], [2.1, 0]],
    ['C', [1.8, 0], [1.8, 1.6], { n: 'C_1', s: vals ? capT(C1) : undefined, side: 'l' }], ['gnd', [1.8, 1.6]],
    ['R', [2.1, 0], [3.3, 0], { n: 'R_2', s: vals ? resT(R2) : undefined }], ['w', [3.3, 0], [4.2, 0]],
    ['C', [3.7, 0], [3.7, 1.6], { n: 'C_2', s: vals ? capT(C2) : undefined }], ['gnd', [3.7, 1.6]], ['term', [4.2, 0], { n: 'v_{out}' }]];
  Object.assign(window.BK7, { lpFig, hpFig, ampCL, ladderFig });

  // ================================================================ Chapter 10 drills
  // ---- bk_tau: time constants. 'rc' a plain RC; 'div' a node fed through R1 with R2 to ground; 'cur' a current step
  const LN = Math.log;
  const FR = [[0.5, '50\\%'], [0.9, '90\\%'], [0.95, '95\\%'], [0.99, '99\\%']];
  GENS.bk_tau = (o = {}) => {
    const kind = o.kind || pick(['rc', 'div', 'div', 'cur']);
    if (kind === 'rc') {
      const R = pick([0.5, 1, 2, 4, 5, 10, 20, 50]) * 1e3, C = pick([0.1, 0.2, 0.5, 1, 2, 5, 10]) * 1e-12;
      const tau = R * C;
      const [x, xT] = pick(FR);
      const tx_ = tau * LN(1 / (1 - x));
      const fig = [['V', [0, 0], [0, 1.4], { n: 'V_0', side: 'l' }], ['w', [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R', s: resT(R) }], ['w', [1.5, 0], [2.6, 0]],
        ['C', [2, 0], [2, 1.4], { n: 'C', s: capT(C) }], ['w', [0, 1.4], [2, 1.4]], ['gnd', [1, 1.4]], ['term', [2.6, 0], { n: 'v_C(t)' }]];
      return {
        _chk: { kind, R, C, x, tau, tx: tx_ },
        q: md`The source steps from $0$ to $V_0$ at $t = 0$ (the capacitor starts empty). Find the time constant $\tau$ and the time $t_{${xT}}$ at which $v_C$ reaches ${xT} of its final value.`,
        fig,
        parts: [
          tPart('\\tau', tau, { traps: [{ v: R * C * 1e3, msg: 'Units: $\\text{k}\\Omega\\times\\text{pF} = 10^3\\times10^{-12} = 10^{-9}\\,\\text{s}$, a nanosecond.' }] }),
          tPart(`t_{${xT}}`, tx_, { traps: [{ v: tau, msg: 'One time constant brings the capacitor only to $1 - e^{-1} = 63\\%$.' }, { v: tau * x, msg: 'The charging is not a straight line: solve $1 - e^{-t/\\tau} = x$ for $t$, which gives $t = \\tau\\ln\\frac{1}{1 - x}$.' }, { v: tau * LN(1 / x), msg: 'Check the logarithm: $e^{-t/\\tau} = 1 - x$, so $t = \\tau\\ln\\frac{1}{1 - x}$.' }] }),
        ],
        hints: [md`$\tau = RC$. Keep the units together: $\text{k}\Omega\times\text{pF} = \text{ns}$.`, md`$v_C(t) = V_0\left(1 - e^{-t/\tau}\right)$. Set $v_C/V_0 = x$ and solve: $e^{-t/\tau} = 1 - x$, so $t = \tau\ln\dfrac{1}{1 - x}$.`],
        sol: md`**Time constant.** The capacitor sees the resistance $R$ (the source is a short once zeroed):
$$\tau = RC = ${resT(R)}\times${capT(C)} = ${timeT(tau)}$$

**Time to ${xT}.** The charging curve is $v_C = V_0(1 - e^{-t/\tau})$. Set $v_C/V_0 = ${f(x, 3)}$:
$$e^{-t/\tau} = 1 - ${f(x, 3)} = ${f(1 - x, 3)}\quad\Rightarrow\quad t = \tau\ln\frac{1}{${f(1 - x, 3)}} = ${f(LN(1 / (1 - x)), 4)}\,\tau = ${timeT(tx_)}$$
Worth remembering: $50\%$ at $0.69\tau$, $63\%$ at $\tau$, $90\%$ at $2.3\tau$, $95\%$ at $3\tau$, $99\%$ at $4.6\tau$.`,
      };
    }
    if (kind === 'div') {
      const R1 = pick([1, 2, 4, 5, 10, 20]) * 1e3, k = pick([1, 1, 3, 4, 9]), R2 = R1 * k;
      const C = pick([0.5, 1, 2, 5, 10]) * 1e-12, V0 = pick([1, 2, 5]);
      const Rth = par(R1, R2), tau = Rth * C, vinf = V0 * R2 / (R1 + R2);
      const m = pick([1, 2, 3]);
      const t = m * tau, vt = vinf * (1 - Math.exp(-m));
      const fig = [['V', [0, 0], [0, 1.4], { n: 'V_0', s: `${V0}\\,\\text{V}`, side: 'l' }], ['w', [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R_1', s: resT(R1) }], ['w', [1.5, 0], [3.3, 0]],
        ['R', [2, 0], [2, 1.4], { n: 'R_2', s: resT(R2), side: 'l' }], ['C', [2.8, 0], [2.8, 1.4], { n: 'C', s: capT(C) }], ['w', [0, 1.4], [2.8, 1.4]], ['gnd', [1, 1.4]], ['term', [3.3, 0], { n: 'v_C(t)' }]];
      return {
        _chk: { kind, R1, R2, C, V0, t, tau, vinf, vt },
        q: md`The source steps from $0$ to $V_0 = ${V0}\,\text{V}$ at $t = 0$; the capacitor starts empty. Find the final voltage $v_C(\infty)$, the time constant $\tau$, and $v_C$ at $t = ${timeT(t)}$.`,
        fig,
        parts: [
          plain('v_C(\\infty)', vinf, 'V', { traps: [{ v: V0, msg: 'At $t\\to\\infty$ the capacitor is open, but $R_2$ is still there: the final value is the divider $V_0R_2/(R_1 + R_2)$.' }] }),
          tPart('\\tau', tau, { traps: [{ v: R1 * C, msg: 'The capacitor also sees $R_2$: zero the source and $R_1$ and $R_2$ are **in parallel** across $C$.' }, { v: (R1 + R2) * C, msg: 'Zero the source (a short): $R_1$ then goes to ground, so $R_1$ and $R_2$ are in **parallel** across $C$, not in series.' }, { v: R2 * C, msg: 'With the source zeroed, $R_1$ also connects the node to ground: $R_1\\parallel R_2$.' }] }),
          plain(`v_C(${timeT(t)})`, vt, 'V', { traps: [{ v: V0 * (1 - Math.exp(-m)), msg: 'The curve heads for the **final** value $v_C(\\infty)$, not for $V_0$.' }, { v: vinf * (1 - Math.exp(-t / (R1 * C))), msg: 'Use the time constant with $R_1\\parallel R_2$.' }] }),
        ],
        hints: [md`**Final value:** at $t\to\infty$ nothing changes, so no current flows into $C$ (an open): $R_1$ and $R_2$ form a divider.`, md`**Time constant:** zero the source (a short) and look from the capacitor: $R_1$ and $R_2$ both go from the node to ground. $\tau = (R_1\parallel R_2)\,C$.`, md`$v_C(t) = v_C(\infty)\left(1 - e^{-t/\tau}\right)$.`],
        sol: md`**Final value.** Long after the step the capacitor is an open circuit, so the node is just the divider:
$$v_C(\infty) = V_0\frac{R_2}{R_1 + R_2} = ${V0}\,\text{V}\times\frac{${resT(R2)}}{${resT(R1 + R2)}} = ${f(vinf, 4)}\,\text{V}$$

**Time constant.** Zero the source (it becomes a wire to ground). From the capacitor's two terminals, $R_1$ and $R_2$ both run from the node to ground: they are in parallel.
$$R = R_1\parallel R_2 = ${resT(Rth)},\qquad \tau = RC = ${resT(Rth)}\times${capT(C)} = ${timeT(tau)}$$

**At $t = ${timeT(t)}$** that is $${m}\tau$:
$$v_C = v_C(\infty)\left(1 - e^{-${m}}\right) = ${f(vinf, 4)}\times${f(1 - Math.exp(-m), 4)} = ${f(vt, 4)}\,\text{V}$$
(This is the Thévenin picture: the node behaves like a source of $${f(vinf, 4)}\,\text{V}$ behind $${resT(Rth)}$.)`,
      };
    }
    // a current step into R parallel C (the Norton picture of an amplifier output)
    const I = pick([0.1, 0.2, 0.5, 1, 2]) * 1e-3, R = pick([1, 2, 5, 10, 20]) * 1e3, C = pick([0.2, 0.5, 1, 2, 5]) * 1e-12;
    const tau = R * C, vinf = I * R, slope = I / C;
    const fig = [['I', [0, 1.4], [0, 0], { n: 'I', s: MA(I), side: 'l' }], ['w', [0, 0], [2.8, 0]], ['R', [1.2, 0], [1.2, 1.4], { n: 'R', s: resT(R) }], ['C', [2.2, 0], [2.2, 1.4], { n: 'C', s: capT(C) }],
      ['w', [0, 1.4], [2.2, 1.4]], ['gnd', [1.2, 1.4]], ['term', [2.8, 0], { n: 'v(t)' }]];
    return {
      _chk: { kind, I, R, C, tau, vinf, slope },
      q: md`A current source switches on at $t = 0$ and pushes $I = ${MA(I)}$ into a node with $R = ${resT(R)}$ and $C = ${capT(C)}$ to ground (the node starts at $0\,\text{V}$). Find the final voltage, the time constant, and the initial rate of rise $dv/dt$ at $t = 0^+$ in volts per nanosecond.`,
      fig,
      parts: [
        plain('v(\\infty)', vinf, 'V'),
        tPart('\\tau', tau),
        plain('dv/dt\\,(0^+)', slope * 1e-9, 'V/ns', { traps: [{ v: vinf / tau * 1e-9 * (1 - Math.exp(-1)), msg: 'That is the average rate over the first $\\tau$. At $t = 0^+$ the rate is the steepest: all of $I$ goes into $C$, so $dv/dt = I/C$.' }] }),
      ],
      hints: [md`At $t = 0^+$ the node is still at $0\,\text{V}$, so $R$ carries no current: **all** of $I$ flows into $C$, and $i = C\,dv/dt$.`, md`Long after, $C$ is open: all of $I$ flows in $R$. The capacitor sees $R$ (a current source is an open when zeroed): $\tau = RC$.`],
      sol: md`**At $t = 0^+$.** The voltage across $C$ cannot jump, so $v = 0$ and $R$ carries no current. All of $I$ charges $C$:
$$\frac{dv}{dt} = \frac{I}{C} = \frac{${MA(I)}}{${capT(C)}} = ${f(slope, 4)}\,\text{V/s} = ${f(slope * 1e-9, 4)}\,\text{V/ns}$$
(The handy version: $1\,\text{mA}$ into $1\,\text{pF}$ moves $1\,\text{V}$ per nanosecond.)

**Final value.** $C$ is open: all of $I$ flows in $R$, $v(\infty) = IR = ${MA(I)}\times${resT(R)} = ${f(vinf, 4)}\,\text{V}$.

**Time constant.** Zero the source: a current source becomes an **open**, so the capacitor sees only $R$: $\tau = RC = ${timeT(tau)}$. Check: the initial slope times $\tau$ is $${f(slope * 1e-9, 4)}\,\text{V/ns}\times${timeT(tau)} = ${f(vinf, 4)}\,\text{V}$, the final value. The straight start would arrive in exactly one $\tau$.`,
    };
  };

  // ---- bk_zc: the impedance of a capacitor; where it equals a resistor; R with C in series or parallel
  GENS.bk_zc = (o = {}) => {
    const kind = o.kind || pick(['mag', 'mag', 'cross', 'par', 'ser']);
    if (kind === 'mag') {
      let C, fr, Z;
      do { C = pick([0.1, 0.5, 1, 2, 10]) * pick([1e-12, 1e-12, 1e-9, 1e-6]); fr = pick([1, 10, 100]) * pick([1e3, 1e6]); Z = 1 / (2 * PI * fr * C); } while (Z < 10 || Z > 1e7);
      return {
        _chk: { kind, C, fr, Z },
        q: md`What is the magnitude of the impedance of a $${capT(C)}$ capacitor at $f = ${fT(fr)}$?`,
        parts: [rPart('|Z_C|', Z, { traps: [{ v: 1 / (fr * C), msg: 'Use the angular frequency: $\\omega = 2\\pi f$, and $|Z_C| = 1/(\\omega C)$.' }, { v: 2 * PI * fr * C, msg: 'Upside down: a capacitor\'s impedance **falls** with frequency, $|Z_C| = 1/(\\omega C)$.' }] })],
        hints: [md`$|Z_C| = \dfrac{1}{\omega C}$ with $\omega = 2\pi f$.`],
        sol: md`$$\omega = 2\pi f = 2\pi\times${fT(fr)} = ${f(2 * PI * fr, 4)}\,\text{rad/s}$$
$$|Z_C| = \frac{1}{\omega C} = \frac{1}{${f(2 * PI * fr, 4)}\times${f(C, 3)}} = ${resT(Z)}$$
Sanity check with the memory number: $1\,\text{pF}$ at $1\,\text{GHz}$ is $159\,\Omega$; the impedance scales as $1/(fC)$.`,
      };
    }
    if (kind === 'cross') {
      const R = pick([1, 2, 5, 10, 50]) * 1e3, C = pick([0.2, 0.5, 1, 2, 5]) * 1e-12;
      const w = 1 / (R * C), fr = w / (2 * PI);
      return {
        _chk: { kind, R, C, w, fr },
        q: md`At what angular frequency $\omega$, and at what frequency $f$ in hertz, does a $${capT(C)}$ capacitor have the same impedance magnitude as a $${resT(R)}$ resistor?`,
        parts: [
          wPart('\\omega', w, { traps: [{ v: fr, msg: 'That is $f$ in hertz. $\\omega = 1/(RC)$ is in rad/s.' }] }),
          fPart('f', fr, { traps: [{ v: w, msg: 'That is $\\omega$ in rad/s. In hertz, $f = \\omega/2\\pi$.' }] }),
        ],
        hints: [md`Set $\dfrac{1}{\omega C} = R$ and solve for $\omega$.`],
        sol: md`$$\frac{1}{\omega C} = R\quad\Rightarrow\quad\omega = \frac{1}{RC} = \frac{1}{${resT(R)}\times${capT(C)}} = ${wT(w)}$$
$$f = \frac{\omega}{2\pi} = ${fT(fr)}$$
Below this frequency the capacitor's impedance is the larger one; above it, the smaller. This crossing is exactly the corner $1/RC$ of an RC circuit.`,
      };
    }
    // R and C in series or in parallel at a frequency
    const ser = kind === 'ser';
    const R = pick([1, 2, 5, 10]) * 1e3, C = pick([1, 2, 5, 10]) * 1e-12;
    const wc = 1 / (R * C), m = pick([0.5, 1, 2, 3, 0.25, 4]);
    const w = m * wc;
    const ZC = 1 / (w * C);
    const Zmag = ser ? Math.sqrt(R * R + ZC * ZC) : R / Math.sqrt(1 + (w * R * C) ** 2);
    const ang = ser ? -Math.atan(1 / (w * R * C)) * DEG : -Math.atan(w * R * C) * DEG;
    return {
      _chk: { kind, R, C, w, Zmag, ang },
      q: md`A $${resT(R)}$ resistor and a $${capT(C)}$ capacitor are connected in **${ser ? 'series' : 'parallel'}**. Find the magnitude and the angle of their combined impedance at $\omega = ${wT(w)}$.`,
      parts: [
        rPart('|Z|', Zmag, { traps: ser ? [{ v: R + ZC, msg: 'Impedances add as complex numbers: $R + 1/(j\\omega C)$ has magnitude $\\sqrt{R^2 + (1/\\omega C)^2}$, not $R + 1/\\omega C$.' }] : [{ v: par(R, ZC), msg: 'Combine the complex impedances, not their sizes: $R\\parallel\\frac{1}{j\\omega C} = \\frac{R}{1 + j\\omega RC}$, magnitude $R/\\sqrt{1 + (\\omega RC)^2}$.' }] }),
        plain('\\angle Z', ang, '°', { tol: { abs: 0.6 }, traps: [{ v: -ang, msg: 'A capacitor pulls the angle **negative** ($Z_C = -j/\\omega C$).' }] }),
      ],
      hints: [md`$Z_C = \dfrac{1}{j\omega C} = -\dfrac{j}{\omega C}$. First find $\omega RC$: it is the only number that matters.`, ser ? md`Series: $Z = R - \dfrac{j}{\omega C}$. Magnitude $\sqrt{R^2 + (1/\omega C)^2}$, angle $-\tan^{-1}\dfrac{1/\omega C}{R}$.` : md`Parallel: $Z = \dfrac{R\cdot\frac{1}{j\omega C}}{R + \frac{1}{j\omega C}} = \dfrac{R}{1 + j\omega RC}$.`],
      sol: ser ? md`$$\omega RC = ${f(w * R * C, 4)},\qquad \frac{1}{\omega C} = ${resT(ZC)}$$
$$Z = R + \frac{1}{j\omega C} = ${resT(R)} - j\,${resT(ZC)}$$
$$|Z| = \sqrt{R^2 + (1/\omega C)^2} = ${resT(Zmag)},\qquad \angle Z = -\tan^{-1}\frac{1/\omega C}{R} = -\tan^{-1}${f(1 / (w * R * C), 4)} = ${degT(ang)}$$
At low frequency the capacitor dominates a series pair (open circuit, $-90^\circ$); at high frequency the resistor does ($0^\circ$).`
        : md`Multiply top and bottom by $j\omega C$:
$$Z = R\parallel\frac{1}{j\omega C} = \frac{R}{1 + j\omega RC},\qquad \omega RC = ${f(w * R * C, 4)}$$
$$|Z| = \frac{R}{\sqrt{1 + (\omega RC)^2}} = \frac{${resT(R)}}{${f(Math.sqrt(1 + (w * R * C) ** 2), 4)}} = ${resT(Zmag)},\qquad \angle Z = -\tan^{-1}(\omega RC) = ${degT(ang)}$$
At low frequency the resistor dominates a parallel pair ($Z\approx R$); at high frequency the capacitor shorts it ($Z\to0$, $-90^\circ$).`,
    };
  };

  // ---- bk_cplx: magnitude and angle of products and quotients
  const cT = (a, b) => `${f(a, 3)} ${b < 0 ? '-' : '+'} ${f(Math.abs(b), 3)}j`;
  const ang180 = (d) => { let x = ((d + 180) % 360 + 360) % 360 - 180; if (x <= -180 + 1e-9) x += 360; return x; };
  GENS.bk_cplx = (o = {}) => {
    const kind = o.kind || pick(['pair', 'fac', 'fac']);
    if (kind === 'pair') {
      const nz = () => { let a, b; do { a = ri(-4, 4); b = ri(-4, 4); } while (a === 0 && b === 0); return [a, b]; };
      const [a, b] = nz(); let c, d; do { [c, d] = nz(); } while (c === a && d === b);
      const div = Math.random() < 0.5;
      const m1 = Math.hypot(a, b), m2 = Math.hypot(c, d), t1 = Math.atan2(b, a) * DEG, t2 = Math.atan2(d, c) * DEG;
      const mag = div ? m1 / m2 : m1 * m2, ang = ang180(div ? t1 - t2 : t1 + t2);
      const jT = (y) => `${Math.abs(y) === 1 ? '' : Math.abs(y)}j`;
      const zT = (x, y) => (y === 0 ? `${x}` : x === 0 ? `${y < 0 ? '-' : ''}${jT(y)}` : `${x}${y < 0 ? ' - ' : ' + '}${jT(y)}`);
      const qd = (x, y) => (x < 0 ? ` (the real part is negative, so the angle is $\\tan^{-1}(${y}/${x})$ moved by $180^\\circ$)` : '');
      return {
        _chk: { kind, a, b, c, d, div, mag, ang },
        q: md`$z_1 = ${zT(a, b)}$ and $z_2 = ${zT(c, d)}$. Find the magnitude and the angle of $${div ? 'z_1/z_2' : 'z_1z_2'}$ (angle between $-180^\circ$ and $180^\circ$).`,
        parts: [
          plain(div ? '|z_1/z_2|' : '|z_1z_2|', mag, '', { traps: [{ v: div ? m1 * m2 : m1 + m2, msg: div ? 'Magnitudes **divide** in a quotient: $|z_1/z_2| = |z_1|/|z_2|$.' : 'Magnitudes **multiply**: $|z_1z_2| = |z_1|\\,|z_2|$, they do not add.' }] }),
          plain(div ? '\\angle(z_1/z_2)' : '\\angle(z_1z_2)', ang, '°', { tol: { abs: 0.6 }, accept: [ang - 360, ang + 360], traps: [{ v: ang180(div ? t1 + t2 : t1 - t2), msg: div ? 'Angles **subtract** in a quotient: $\\angle z_1 - \\angle z_2$.' : 'Angles **add** in a product: $\\angle z_1 + \\angle z_2$.' }] }),
        ],
        hints: [md`Turn each number into polar form first: length $\sqrt{a^2 + b^2}$, angle measured from the positive real axis (mind the quadrant).`, md`${div ? 'Divide the lengths, subtract the angles.' : 'Multiply the lengths, add the angles.'}`],
        sol: md`**Polar form.** $|z_1| = \sqrt{${a * a} + ${b * b}} = ${f(m1, 4)}$, $\angle z_1 = ${degT(t1, 4)}$${qd(a, b)}. $|z_2| = \sqrt{${c * c} + ${d * d}} = ${f(m2, 4)}$, $\angle z_2 = ${degT(t2, 4)}$${qd(c, d)}.

**${div ? 'Quotient' : 'Product'}.** ${div ? 'Divide the lengths, subtract the angles' : 'Multiply the lengths, add the angles'}:
$$|${div ? 'z_1/z_2' : 'z_1z_2'}| = ${f(m1, 4)}${div ? '/' : '\\times'}${f(m2, 4)} = ${f(mag, 4)},\qquad \angle = ${degT(t1, 4)} ${div ? '-' : '+'} (${degT(t2, 4)}) = ${degT(div ? t1 - t2 : t1 + t2, 4)}${Math.abs(ang - (div ? t1 - t2 : t1 + t2)) > 1e-6 ? ` \\equiv ${degT(ang, 4)}` : ''}$$
Check in rectangular form: $${div ? 'z_1/z_2' : 'z_1z_2'} = ${cT(mag * Math.cos(ang / DEG), mag * Math.sin(ang / DEG))}$.`,
      };
    }
    // a product of (1 + jx) factors at one frequency
    const k = pick([10, 20, 50, 100, -10, -20, -100]);
    const xs = [0.1, 0.5, 1, 2, 10];
    const w = pick([1, 2, 5]) * 10 ** ri(3, 6);
    const pickX = () => pick(xs);
    const nz = Math.random() < 0.5 ? 1 : 0, np = nz ? ri(1, 2) : 2;
    const fz = Array.from({ length: nz }, pickX), fp = Array.from({ length: np }, pickX);
    const zeros = fz.map((x) => w / x), poles = fp.map((x) => w / x);
    const sp = { k, zeros, poles };
    const tf = EB().tf(sp);
    const mag = tf.mag(w), ang = tf.phase(w);
    const row = (x, z) => `| $1 + j${f(x, 3)}$ (${z ? 'zero' : 'pole'} at $${EB().wTeX(w / x)}$) | $${f(Math.hypot(1, x), 4)}$ | ${'$'}${z ? '+' : '-'}${f(Math.atan(x) * DEG, 4)}^\\circ$ |`;
    return {
      _chk: { kind, sp, w, mag, ang },
      q: md`$$${EB().tex(sp)}$$
Evaluate $H(j\omega)$ at $\omega = ${EB().wTeX(w)}\,\text{rad/s}$: its magnitude and its angle in degrees. (Take the angle of a negative constant as $+180^\circ$.)`,
      parts: [
        plain('|H(j\\omega)|', mag, '', { traps: [{ v: Math.abs(k), msg: 'Each factor $1 + j\\omega/\\omega_c$ has its own magnitude $\\sqrt{1 + (\\omega/\\omega_c)^2}$: multiply them in.' }] }),
        plain('\\angle H(j\\omega)', ang, '°', { tol: { abs: 0.6 }, accept: [ang - 360, ang + 360] }),
      ],
      hints: [md`For each factor compute $x = \omega/\omega_c$, then $|1 + jx| = \sqrt{1 + x^2}$ and $\angle(1 + jx) = \tan^{-1}x$.`, md`Magnitude: $|k|\times$ (zero magnitudes) $\div$ (pole magnitudes). Angle: ${k < 0 ? '$180^\\circ$ + ' : ''}(zero angles) $-$ (pole angles).`],
      sol: md`Put $s = j\omega$ and take each factor on its own, with $x = \omega/\omega_c$:

| Factor | Magnitude $\sqrt{1 + x^2}$ | Angle $\pm\tan^{-1}x$ |
|---|---|---|
${[...fz.map((x) => row(x, true)), ...fp.map((x) => row(x, false))].join('\n')}

**Magnitude:** multiply the zeros' magnitudes, divide by the poles':
$$|H| = ${Math.abs(k)}${fz.map((x) => `\\times${f(Math.hypot(1, x), 4)}`).join('')}\Big/\left(${fp.map((x) => f(Math.hypot(1, x), 4)).join('\\times')}\right) = ${f(mag, 4)}$$

**Angle:** ${k < 0 ? 'the negative constant gives $180^\\circ$; then ' : ''}add the zeros' angles and subtract the poles':
$$\angle H = ${k < 0 ? '180^\\circ' : '0^\\circ'}${fz.map((x) => ` + ${f(Math.atan(x) * DEG, 4)}^\\circ`).join('')}${fp.map((x) => ` - ${f(Math.atan(x) * DEG, 4)}^\\circ`).join('')} = ${degT(ang, 4)}$$`,
    };
  };

  // ---- bk_lp: the RC low-pass (with an optional load resistor)
  GENS.bk_lp = (o = {}) => {
    const R1 = pick([1, 2, 5, 10, 20]) * 1e3, k = pick([0, 0, 1, 3, 4, 9]), R2 = k ? R1 * k : 0;
    const C = pick([0.5, 1, 2, 5, 10, 20]) * 1e-12;
    const H0 = k ? R2 / (R1 + R2) : 1, R = k ? par(R1, R2) : R1;
    const wp = 1 / (R * C), fp = wp / (2 * PI);
    const m = pick([0.5, 2, 3, 5, 10]), fq = m * fp;
    const Hm = H0 / Math.sqrt(1 + m * m), ph = -Math.atan(m) * DEG;
    const askPh = Math.random() < 0.4;
    const parts = [];
    if (k) parts.push(plain('H(0)', H0, 'V/V', { traps: [{ v: 1, msg: 'At DC the capacitor is open, but $R_2$ still divides: $H(0) = R_2/(R_1 + R_2)$.' }] }));
    parts.push(wPart('\\omega_p', wp, { traps: [{ v: 1 / (R1 * C), msg: k ? 'The capacitor sees $R_1\\parallel R_2$ (zero the source: both resistors go to ground).' : '' }, { v: fp, msg: 'That is $f_{3\\text{dB}}$ in hertz; $\\omega_p$ is in rad/s.' }, { v: k ? 1 / ((R1 + R2) * C) : NaN, msg: 'Zero the source: $R_1$ then runs to ground, **in parallel** with $R_2$.' }] }));
    parts.push(fPart('f_{3dB}', fp, { traps: [{ v: wp, msg: 'That is $\\omega_p$ in rad/s; divide by $2\\pi$ for hertz.' }] }));
    if (askPh) parts.push(plain(`\\angle H\\ \\text{at}\\ ${fT(fq)}`, ph, '°', { tol: { abs: 0.6 }, traps: [{ v: -ph, msg: 'A low-pass **lags**: the angle is negative.' }] }));
    else parts.push(plain(`|H|\\ \\text{at}\\ ${fT(fq)}`, Hm, 'V/V', { traps: [{ v: H0 / m, msg: 'That is the high-frequency approximation $H(0)\\,\\omega_p/\\omega$; use the exact $1/\\sqrt{1 + (\\omega/\\omega_p)^2}$.' }, { v: H0 / (1 + m), msg: 'The magnitude of $1 + jx$ is $\\sqrt{1 + x^2}$, not $1 + x$.' }] }));
    return {
      _chk: { kind: 'lp', R1, R2, C, H0, wp, fp, fq, Hm, ph, askPh },
      q: md`Find ${k ? 'the DC gain $H(0) = v_{out}/v_{in}$, ' : ''}the pole $\omega_p$, the $-3\,\text{dB}$ frequency in hertz, and ${askPh ? 'the phase of $H$' : 'the gain magnitude $|H|$'} at $f = ${fT(fq)}$.`,
      fig: lpFig(R1, R2, C),
      parts,
      hints: [md`${k ? 'Thévenin first: the source and $R_1$, $R_2$ become $v_{in}R_2/(R_1 + R_2)$ behind $R_1\\parallel R_2$. ' : ''}Then it is one resistance and one capacitor: $H(s) = \dfrac{H(0)}{1 + sRC}$, $\omega_p = 1/(RC)$.`, md`$|H(j\omega)| = \dfrac{H(0)}{\sqrt{1 + (\omega/\omega_p)^2}}$, $\angle H = -\tan^{-1}(\omega/\omega_p)$. Here $\omega/\omega_p = f/f_{3\text{dB}}$.`],
      sol: md`${k ? `**Thévenin at the capacitor.** Looking back from $C$: $v_{Th} = v_{in}\\dfrac{R_2}{R_1 + R_2} = ${f(H0, 4)}\\,v_{in}$ and $R = R_1\\parallel R_2 = ${resT(R)}$.` : `**One resistance, one capacitor.** With the source zeroed the capacitor sees $R = R_1 = ${resT(R)}$.`}
$$H(s) = \frac{${f(H0, 4)}}{1 + sRC},\qquad \omega_p = \frac{1}{RC} = \frac{1}{${resT(R)}\times${capT(C)}} = ${wT(wp)}$$
$$f_{3\text{dB}} = \frac{\omega_p}{2\pi} = ${fT(fp)}$$
**At $f = ${fT(fq)}$:** $\omega/\omega_p = f/f_{3\text{dB}} = ${f(m, 3)}$, so
$$|H| = \frac{${f(H0, 4)}}{\sqrt{1 + ${f(m * m, 4)}}} = ${f(Hm, 4)},\qquad \angle H = -\tan^{-1}${f(m, 3)} = ${degT(ph)}$$`,
    };
  };

  // ---- bk_hp: a coupling capacitor into an amplifier input
  GENS.bk_hp = (o = {}) => {
    const RS = pick([0.05, 0.5, 1, 2, 5]) * 1e3, Rin = pick([1, 5, 10, 20, 50]) * 1e3;
    const C = pick([0.1, 0.47, 1, 2.2, 10]) * 1e-6;
    const HM = Rin / (RS + Rin), R = RS + Rin, wL = 1 / (R * C), fL = wL / (2 * PI);
    const m = pick([0.1, 0.5, 1, 2, 10]), fq = m * fL;
    const Hm = HM * m / Math.sqrt(1 + m * m);
    return {
      _chk: { kind: 'hp', RS, Rin, C, HM, wL, fL, fq, Hm },
      q: md`A coupling capacitor $C_C$ carries the signal from a source (with resistance $R_S$) into an amplifier whose input resistance is $R_{in}$. Find the mid-band gain $v_{in}/v_s$ (where $C_C$ is a short), the low-frequency corner $f_L$ in hertz, and $|v_{in}/v_s|$ at $f = ${fT(fq)}$.`,
      fig: hpFig(RS, Rin, C),
      parts: [
        plain('\\text{mid-band } v_{in}/v_s', HM, 'V/V', { traps: [{ v: 1, msg: 'Even with $C_C$ shorted, $R_S$ and $R_{in}$ form a divider.' }] }),
        fPart('f_L', fL, { traps: [{ v: 1 / (2 * PI * par(RS, Rin) * C), msg: 'The capacitor sits **between** $R_S$ and $R_{in}$: with the source zeroed, they are in **series** around it, $R_S + R_{in}$.' }, { v: 1 / (2 * PI * Rin * C), msg: 'Include $R_S$: the capacitor sees $R_S + R_{in}$ in series.' }, { v: wL, msg: 'That is $\\omega_L$ in rad/s; divide by $2\\pi$.' }] }),
        plain(`|v_{in}/v_s|\\ \\text{at}\\ ${fT(fq)}`, Hm, 'V/V', { traps: [{ v: HM / Math.sqrt(1 + m * m), msg: 'This is a **high**-pass: below the corner the gain is small. $|H| = H_M\\dfrac{x}{\\sqrt{1 + x^2}}$ with $x = f/f_L$.' }] }),
      ],
      hints: [md`Mid-band: $C_C$ is a short, so $v_{in}/v_s = R_{in}/(R_S + R_{in})$.`, md`Zero the source and look from the capacitor's two terminals: one side goes through $R_S$ to ground, the other through $R_{in}$. In series: $R = R_S + R_{in}$, $\omega_L = 1/(RC_C)$.`],
      sol: md`**Transfer function.** The divider with $Z_C = 1/(sC_C)$ in series:
$$\frac{v_{in}}{v_s} = \frac{R_{in}}{R_S + R_{in} + \frac{1}{sC_C}} = \frac{R_{in}}{R_S + R_{in}}\cdot\frac{s(R_S + R_{in})C_C}{1 + s(R_S + R_{in})C_C}$$
**Mid-band** ($C_C$ a short): $H_M = \dfrac{${resT(Rin)}}{${resT(R)}} = ${f(HM, 4)}$.

**Corner.** $R = R_S + R_{in} = ${resT(R)}$ (series, because the capacitor sits between them):
$$\omega_L = \frac{1}{RC_C} = \frac{1}{${resT(R)}\times${capT(C)}} = ${wT(wL)},\qquad f_L = \frac{\omega_L}{2\pi} = ${fT(fL)}$$
**At $f = ${fT(fq)}$:** $x = f/f_L = ${f(m, 3)}$:
$$|H| = H_M\frac{x}{\sqrt{1 + x^2}} = ${f(HM, 4)}\times\frac{${f(m, 3)}}{${f(Math.sqrt(1 + m * m), 4)}} = ${f(Hm, 4)}$$
Far above $f_L$ the capacitor is a short ("big capacitors are shorts" means exactly this); below $f_L$ it blocks.`,
    };
  };

  // ---- bk_cscl: common source / common emitter with a load capacitor
  GENS.bk_cscl = (o = {}) => {
    const bjt = o.bjt ?? Math.random() < 0.45;
    let gm, ro, R, Rl, desc, model, C;
    if (bjt) {
      const IC = pick([0.25, 0.5, 1, 2]) * 1e-3, VA = pick([25, 50, 100, Infinity]);
      gm = IC / 0.025; ro = VA / IC; Rl = pick([2, 5, 10]) * 1e3; C = pick([1, 2, 5]) * 1e-12;
      R = isFinite(ro) ? par(Rl, ro) : Rl;
      desc = `Common emitter biased at $I_C = ${MA(IC)}$ (${isFinite(VA) ? `$V_A = ${VA}\\,\\text{V}$` : 'ignore the Early effect'}), $R_C = ${KO(Rl)}$, $C_L = ${capT(C)}$.`;
      model = `$g_m = I_C/V_T = ${MA(IC)}/25\\,\\text{mV} = ${MS(gm)}$${isFinite(ro) ? `, $r_o = V_A/I_C = ${KO(ro)}$` : ', $r_o\\to\\infty$'}. The base is driven by an ideal source, so $r_\\pi$ does not matter: $v_\\pi = v_{in}$.`;
    } else {
      let ID, Vov, lam;
      do {
        ID = pick([0.1, 0.2, 0.25, 0.5, 1]) * 1e-3; Vov = pick([0.2, 0.25, 0.4, 0.5]); lam = pick([0.02, 0.05, 0.1, 0]);
        gm = 2 * ID / Vov; ro = lam ? 1 / (lam * ID) : Infinity; Rl = pick([5, 10, 20]) * 1e3; C = pick([0.2, 0.5, 1, 2]) * 1e-12;
        R = isFinite(ro) ? par(Rl, ro) : Rl;
      } while (gm * R < 5);
      desc = `Common source biased at $I_D = ${MA(ID)}$ with $V_{ov} = ${f(Vov, 3)}\\,\\text{V}$ (${lam ? `$\\lambda = ${lam}\\,\\text{V}^{-1}$` : '$\\lambda = 0$'}), $R_D = ${KO(Rl)}$, $C_L = ${capT(C)}$.`;
      model = `$g_m = 2I_D/V_{ov} = ${MS(gm)}$${isFinite(ro) ? `, $r_{ds} = 1/(\\lambda I_D) = ${KO(ro)}$` : ', $r_{ds}\\to\\infty$'}.`;
    }
    const A0 = gm * R, wp = 1 / (R * C), fp = wp / (2 * PI);
    const wu = wp * Math.sqrt(A0 * A0 - 1), fu = wu / (2 * PI), gbw = gm / C;
    const m = pick([2, 5, 10, 0.5]), fq = m * fp, Am = A0 / Math.sqrt(1 + m * m);
    const ro_ = bjt ? 'r_o' : 'r_{ds}', RL_ = bjt ? 'R_C' : 'R_D';
    const askU = Math.random() < 0.5;
    const parts = [
      plain('|A_v(0)|', A0, 'V/V', { traps: [{ v: gm * Rl, msg: `Include $${ro_}$: the output resistance is $${RL_}\\parallel ${ro_}$.` }] }),
      fPart('f_{3dB}', fp, { traps: [{ v: 1 / (2 * PI * Rl * C), msg: `The resistance at the output node is $${RL_}\\parallel ${ro_}$.` }, { v: wp, msg: 'That is $\\omega_p$ in rad/s. In hertz: divide by $2\\pi$.' }] }),
      askU ? fPart('f_u\\ (|A_v| = 1)', fu, { accept: A0 >= 10 ? [gbw / (2 * PI)] : [], traps: [{ v: fp, msg: 'That is the $-3\\,\\text{dB}$ frequency. The gain is still large there; it reaches 1 near $|A_v(0)|\\times f_{3\\text{dB}}$.' }, { v: gbw, msg: 'That is $\\omega_u$ in rad/s; divide by $2\\pi$.' }] })
        : plain(`|A_v|\\ \\text{at}\\ ${fT(fq)}`, Am, 'V/V', { traps: [{ v: A0 / m, msg: 'Use the exact $1/\\sqrt{1 + x^2}$, not the far-above-the-pole approximation.' }, { v: A0 / (1 + m), msg: 'The magnitude of $1 + jx$ is $\\sqrt{1 + x^2}$.' }] }),
    ];
    return {
      _chk: { kind: 'cscl', bjt, gm, ro, Rl, C, R, A0, wp, fp, wu, fu, fq, Am, askU },
      q: md`${desc} The input is driven by an ideal source; ignore the transistor's own capacitances. Find the low-frequency gain magnitude, the $-3\,\text{dB}$ frequency in hertz, and ${askU ? 'the frequency $f_u$ where the gain magnitude has fallen to 1' : `$|A_v|$ at $f = ${fT(fq)}$`}.`,
      fig: ampCL(bjt, { R: KO(Rl), C: capT(C) }),
      parts,
      hints: [md`Small-signal model first: ${model}`, md`One node, one capacitor: $A_v(s) = \dfrac{-g_mR}{1 + sRC_L}$ with $R = ${RL_}\parallel ${ro_}$ (Lecture 25).`, askU ? md`$|A_v| = 1$: $(g_mR)^2 = 1 + (\omega_u/\omega_p)^2$, so $\omega_u = \omega_p\sqrt{(g_mR)^2 - 1}\approx g_m/C_L$.` : md`$|A_v(j\omega)| = \dfrac{g_mR}{\sqrt{1 + (\omega/\omega_p)^2}}$ and $\omega/\omega_p = f/f_{3\text{dB}}$.`],
      sol: md`**Model.** ${model}

**Output node.** The current $g_mv_{in}$ splits between $R = ${RL_}\parallel ${ro_} = ${resT(R)}$ and $C_L$ (KCL: $g_mv_{in} + v_{out}/R + sC_Lv_{out} = 0$):
$$A_v(s) = \frac{-g_mR}{1 + sRC_L},\qquad |A_v(0)| = g_mR = ${MS(gm)}\times${resT(R)} = ${f(A0, 4)}$$
$$\omega_p = \frac{1}{RC_L} = \frac{1}{${resT(R)}\times${capT(C)}} = ${wT(wp)},\qquad f_{3\text{dB}} = \frac{\omega_p}{2\pi} = ${fT(fp)}$$
${askU ? md`**Unity gain.** $|A_v(j\omega_u)| = 1$ means $(g_mR)^2 = 1 + (\omega_u/\omega_p)^2$:
$$\omega_u = \omega_p\sqrt{(g_mR)^2 - 1} = ${wT(wu, 4)},\qquad f_u = ${fT(fu, 4)}$$
Since $g_mR\gg1$ this is $\omega_u\approx g_mR\cdot\omega_p = g_m/C_L = ${wT(gbw, 4)}$: the **gain-bandwidth product**, which does not depend on $R$ at all.` : md`**At $f = ${fT(fq)}$:** $f/f_{3\text{dB}} = ${f(m, 3)}$:
$$|A_v| = \frac{${f(A0, 4)}}{\sqrt{1 + ${f(m * m, 4)}}} = ${f(Am, 4)}$$`}`,
    };
  };

  // ---- bk_std: a transfer function into the standard (1 + s/w) form
  GENS.bk_std = (o = {}) => {
    const kind = o.kind || pick(['zp', 'zp', 'poly']);
    const e = U.shuffle([2, 3, 4, 5, 6, 7]).slice(0, 3).sort((a, b) => a - b);
    const mant = () => pick([1, 1, 2, 5]);
    if (kind === 'poly') {
      const p1 = mant() * 10 ** e[0], p2 = mant() * 10 ** e[2];
      const k = pick([10, 20, 50, 100, 1000]) * (Math.random() < 0.3 ? -1 : 1);
      const K = k * p1 * p2;                           // H(s) = K / (s^2 + (p1 + p2) s + p1 p2)
      const a1 = p1 + p2, a0 = p1 * p2;
      return {
        _chk: { kind, K, a1, a0, k, p1, p2 },
        q: md`$$H(s) = \frac{${f(K, 4)}}{s^2 + ${f(a1, 6)}\,s + ${f(a0, 4)}}$$
Write $H(s)$ in the standard form $\dfrac{k}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})}$: find $k$ (the DC gain) and the two poles, $\omega_{p1} < \omega_{p2}$.`,
        parts: [plain('k', k, 'V/V', { traps: [{ v: K, msg: 'The DC gain is $H(0)$: put $s = 0$, which divides by the constant term of the denominator.' }] }),
          wPart('\\omega_{p1}', p1), wPart('\\omega_{p2}', p2)],
        hints: [md`$k = H(0) = \dfrac{${f(K, 4)}}{${f(a0, 4)}}$.`, md`The poles are the roots of $s^2 + ${f(a1, 6)}s + ${f(a0, 4)} = 0$: two numbers whose sum is $${f(a1, 6)}$ and product $${f(a0, 4)}$ (or the quadratic formula). They come out negative, $s = -\omega_p$.`],
        sol: md`**DC gain.** $k = H(0) = \dfrac{${f(K, 4)}}{${f(a0, 4)}} = ${f(k, 4)}$.

**Poles.** $s^2 + ${f(a1, 6)}s + ${f(a0, 4)} = (s + \omega_{p1})(s + \omega_{p2})$ needs $\omega_{p1} + \omega_{p2} = ${f(a1, 6)}$ and $\omega_{p1}\omega_{p2} = ${f(a0, 4)}$:
$$\omega_{p1} = ${f(p1, 4)}\,\text{rad/s},\qquad \omega_{p2} = ${f(p2, 4)}\,\text{rad/s}$$
(Quadratic formula: $s = \dfrac{-${f(a1, 6)}\pm\sqrt{${f(a1 * a1, 6)} - ${f(4 * a0, 4)}}}{2}$, the roots $-${f(p1, 4)}$ and $-${f(p2, 4)}$.) Factor each corner out: $(s + \omega_p) = \omega_p(1 + s/\omega_p)$, and the $\omega_{p1}\omega_{p2}$ cancels the constant term:
$$H(s) = \frac{${f(k, 4)}}{(1 + s/${EB().wTeX(p1)})(1 + s/${EB().wTeX(p2)})}$$
Notice $\omega_{p1}\ll\omega_{p2}$: then $\omega_{p2}\approx$ the $s$ coefficient, and $\omega_{p1}\approx$ constant / ($s$ coefficient). That is the dominant-pole shortcut.`,
      };
    }
    const z = mant() * 10 ** e[1], p1 = mant() * 10 ** e[0], p2 = mant() * 10 ** e[2];
    const k = pick([1, 2, 5, 10, 20, 100]) * (Math.random() < 0.3 ? -1 : 1);
    const K = k * p1 * p2 / z;                         // H(s) = K (s + z) / ((s + p1)(s + p2))
    return {
      _chk: { kind, K, z, p1, p2, k },
      q: md`$$H(s) = \frac{${f(K, 4)}\,(s + ${f(z, 4)})}{(s + ${f(p1, 4)})(s + ${f(p2, 4)})}$$
Write it in the standard form $k\,\dfrac{1 + s/\omega_z}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})}$. Find $k$, $\omega_z$, $\omega_{p1}$ and $\omega_{p2}$.`,
      parts: [plain('k', k, 'V/V', { traps: [{ v: K, msg: 'That is the leading constant, not the DC gain: each $(s + \\omega)$ factor carries its $\\omega$. Put $s = 0$.' }, { v: K * z, msg: 'Divide by the poles too: $k = H(0) = K\\omega_z/(\\omega_{p1}\\omega_{p2})$.' }] }),
        wPart('\\omega_z', z), wPart('\\omega_{p1}', p1), wPart('\\omega_{p2}', p2)],
      hints: [md`Pull each corner out of its factor: $(s + \omega) = \omega\,(1 + s/\omega)$.`, md`Then $k = \dfrac{K\,\omega_z}{\omega_{p1}\omega_{p2}}$, which is just $H(0)$.`],
      sol: md`Factor each corner out:
$$H(s) = \frac{${f(K, 4)}\cdot${f(z, 4)}\,(1 + s/${EB().wTeX(z)})}{${f(p1, 4)}\cdot${f(p2, 4)}\,(1 + s/${EB().wTeX(p1)})(1 + s/${EB().wTeX(p2)})}$$
$$k = \frac{${f(K, 4)}\times${f(z, 4)}}{${f(p1, 4)}\times${f(p2, 4)}} = ${f(k, 4)}$$
Check: $H(0) = \dfrac{${f(K, 4)}\times${f(z, 4)}}{${f(p1, 4)}\times${f(p2, 4)}}$ is the same number, as it must be (every $1 + s/\omega$ factor is 1 at $s = 0$). The corners are read straight off the factors: $\omega_z = ${f(z, 4)}$, $\omega_{p1} = ${f(p1, 4)}$, $\omega_{p2} = ${f(p2, 4)}\,\text{rad/s}$.
$$${EB().tex({ k, zeros: [z], poles: [p1, p2] })}$$`,
    };
  };

  // ---- bk_poly: two capacitors in an RC ladder: exact poles and the dominant-pole estimate
  GENS.bk_poly = (o = {}) => {
    const R1 = pick([1, 2, 5, 10]) * 1e3, R2 = pick([1, 2, 5, 10, 20]) * 1e3;
    const C1 = pick([1, 2, 5, 10]) * 1e-12, C2 = pick([0.1, 0.2, 0.5, 1]) * 1e-12;
    const b1 = R1 * C1 + R1 * C2 + R2 * C2, b2 = R1 * R2 * C1 * C2;
    const disc = Math.sqrt(b1 * b1 - 4 * b2);
    const w1 = (b1 - disc) / (2 * b2), w2 = (b1 + disc) / (2 * b2);   // pole magnitudes: roots of b2 s^2 + b1 s + 1 at s = -w
    const est1 = 1 / b1, est2 = b1 / b2;
    return {
      _chk: { kind: 'ladder', R1, R2, C1, C2, b1, b2, w1, w2 },
      q: md`Two RC sections in a row, no buffer between them. Find the coefficient $b_1$ of $D(s) = 1 + b_1s + b_2s^2$, the exact low pole $\omega_{p1}$, and the exact high pole $\omega_{p2}$.`,
      fig: ladderFig(R1, C1, R2, C2),
      parts: [
        tPart('b_1', b1, { traps: [{ v: R1 * C1 + R2 * C2, msg: 'The sections interact: $C_2$ also charges through $R_1$, so $b_1$ has a third term $R_1C_2$.' }] }),
        wPart('\\omega_{p1}', w1, { accept: [], traps: [{ v: 1 / (R1 * C1), msg: 'Not $1/(R_1C_1)$: the second section loads the first. Solve $b_2s^2 + b_1s + 1 = 0$.' }] }),
        wPart('\\omega_{p2}', w2, { traps: [{ v: 1 / (R2 * C2), msg: 'Not $1/(R_2C_2)$: solve the quadratic (or use $\\omega_{p2}\\approx b_1/b_2$ when the poles are far apart).' }] }),
      ],
      hints: [md`KCL at both nodes gives $D(s) = 1 + s(R_1C_1 + R_1C_2 + R_2C_2) + s^2R_1R_2C_1C_2$.`, md`The poles are at $s = -\omega$ where $b_2\omega^2 - b_1\omega + 1 = 0$: $\omega = \dfrac{b_1\mp\sqrt{b_1^2 - 4b_2}}{2b_2}$.`],
      sol: md`**Denominator.** KCL at the two nodes (derived in the poles-and-zeros section) gives
$$D(s) = 1 + s\,(R_1C_1 + R_1C_2 + R_2C_2) + s^2R_1R_2C_1C_2$$
$$b_1 = ${timeT(R1 * C1, 4)} + ${timeT(R1 * C2, 4)} + ${timeT(R2 * C2, 4)} = ${timeT(b1, 4)},\qquad b_2 = ${f(b2, 4)}\,\text{s}^2$$
**Exact poles.** $D(s) = 0$ at $s = -\omega$ with $b_2\omega^2 - b_1\omega + 1 = 0$:
$$\omega = \frac{b_1\mp\sqrt{b_1^2 - 4b_2}}{2b_2}:\qquad \omega_{p1} = ${wT(w1, 4)},\qquad \omega_{p2} = ${wT(w2, 4)}$$
**The shortcut.** If the poles are far apart, $\omega_{p1}\approx 1/b_1 = ${wT(est1, 4)}$ and $\omega_{p2}\approx b_1/b_2 = ${wT(est2, 4)}$ (here ${Math.abs(est1 / w1 - 1) < 0.1 ? 'within ' + f(Math.abs(est1 / w1 - 1) * 100, 2) + '\\%' : 'off by ' + f(Math.abs(est1 / w1 - 1) * 100, 2) + '\\%: the poles are not far apart'}). Note that neither pole is $1/(R_1C_1) = ${wT(1 / (R1 * C1), 4)}$ or $1/(R_2C_2) = ${wT(1 / (R2 * C2), 4)}$: the sections load each other.`,
    };
  };

  // ================================================================ Chapter 11 drills (Bode plots)
  const wTeX = (w) => EB().wTeX(w);
  const L10 = Math.log10;
  const corners = (sp) => [...(sp.zeros || []).map((c) => [c, 'z']), ...(sp.rhp || []).map((c) => [c, 'r']), ...(sp.poles || []).map((c) => [c, 'p'])].sort((a, b) => a[0] - b[0]);
  const KIND = { z: 'zero', r: 'RHP zero', p: 'pole' };
  const sgnK = (sp) => ((sp.k ?? 1) < 0 ? -1 : 1);
  // straight-line magnitude, factor by factor: the "products become sums" table
  function magRows(sp, w) {
    const k = Math.abs(sp.k ?? 1);
    const rows = [`| Factor | Corner | Straight line at $\\omega = ${wTeX(w)}$ |`, '|---|---|---|', `| $k = ${f(sp.k ?? 1, 4)}$ | | $20\\log_{10}${f(k, 4)} = ${dbT(20 * L10(k))}$ |`];
    if (sp.origin) rows.push(`| $s/${wTeX(sp.w0 || 1)}$ | (none) | $20\\log_{10}(\\omega/${wTeX(sp.w0 || 1)}) = ${dbT(20 * L10(w / (sp.w0 || 1)))}$ |`);
    corners(sp).forEach(([c, t]) => {
      const d = L10(w / c), on = d > 1e-9, sg = t === 'p' ? -1 : 1;
      rows.push(`| ${KIND[t]} | $${wTeX(c)}$ | ${on ? `$${sg > 0 ? '+' : '-'}20\\times${f(d, 3)} = ${dbT(sg * 20 * d)}$ (${f(d, 3)} dec above)` : '$0$ (not reached yet)'} |`);
    });
    return rows.join('\n');
  }
  // straight-line phase, factor by factor
  const ramp = (w, c) => (w <= c / 10 * (1 + 1e-9) ? 0 : w >= c * 10 * (1 - 1e-9) ? 90 : 45 * (L10(w / c) + 1));
  function phRows(sp, w) {
    const rows = ['| Factor | Corner | Where $\\omega$ is | Straight line |', '|---|---|---|---|'];
    if ((sp.k ?? 1) < 0) rows.push('| $k < 0$ | | every frequency | $+180^\\circ$ |');
    if (sp.origin) rows.push(`| $s^{${sp.origin}}$ | | every frequency | $+${90 * sp.origin}^\\circ$ |`);
    corners(sp).forEach(([c, t]) => {
      const r = ramp(w, c), sg = t === 'z' ? 1 : -1;
      const where = r === 0 ? `below $${wTeX(c / 10)}$: not started` : r === 90 ? `above $${wTeX(c * 10)}$: finished` : `${f(L10(w / c) + 1, 3)} decades into the ramp`;
      rows.push(`| ${KIND[t]} | $${wTeX(c)}$ | ${where} | $${sg * r === 0 ? '0' : (sg > 0 ? '+' : '-') + f(r, 3)}^\\circ$ |`);
    });
    return rows.join('\n');
  }
  const asyMag = (sp, w) => EB().tf(sp).asyDb(w);
  const asyPh = (sp, w) => EB().tf(sp).asyPhase(w);
  const pickE = (n, lo = 1, hi = 8) => U.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, n).sort((a, b) => a - b);

  // ---- bk_db: decibels both ways, and chains of stages
  const DBR = [[2, '2', '6'], [4, '2\\times2', '6 + 6 = 12'], [5, '10/2', '20 - 6 = 14'], [8, '2\\times2\\times2', '18'], [20, '10\\times2', '20 + 6 = 26'], [25, '100/4', '40 - 12 = 28'],
    [40, '10\\times4', '20 + 12 = 32'], [50, '100/2', '40 - 6 = 34'], [200, '100\\times2', '40 + 6 = 46'], [400, '100\\times4', '40 + 12 = 52'], [500, '1000/2', '60 - 6 = 54'],
    [2000, '1000\\times2', '60 + 6 = 66'], [0.5, '1/2', '-6'], [0.25, '1/4', '-12'], [0.2, '2/10', '6 - 20 = -14'], [0.05, '1/20', '-26'], [0.02, '2/100', '6 - 40 = -34'],
    [0.01, '1/100', '-40'], [Math.SQRT2, '\\sqrt2', '3'], [Math.SQRT1_2, '1/\\sqrt2', '-3'], [Math.sqrt(10), '\\sqrt{10}', '10'], [Math.sqrt(1000), '10\\sqrt{10}', '30'], [1 / Math.sqrt(10), '1/\\sqrt{10}', '-10']];
  const rT = (r) => (r === Math.SQRT2 ? '\\sqrt2' : r === Math.SQRT1_2 ? '1/\\sqrt2' : r === Math.sqrt(10) ? '\\sqrt{10}' : r === Math.sqrt(1000) ? '31.6' : r === 1 / Math.sqrt(10) ? '0.316' : f(r, 4));
  GENS.bk_db = (o = {}) => {
    const kind = o.kind || pick(['to', 'from', 'chain']);
    if (kind === 'to') {
      const [r, how, d] = pick(DBR);
      const ans = 20 * L10(r);
      return {
        _chk: { kind, r, ans },
        q: md`A voltage gain has magnitude $${rT(r)}$. What is it in decibels? Do it without a calculator: build it from $\times10\to+20\,\text{dB}$ and $\times2\to+6\,\text{dB}$.`,
        parts: [plain('|A|_{dB}', ans, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 10 * L10(r), msg: '$10\\log_{10}$ is for **power** ratios. A voltage gain uses $20\\log_{10}$.' }, { v: -ans, msg: 'Check the sign: a gain above 1 is positive dB, below 1 negative.' }] })],
        hints: [md`Split the number into factors of 10 and 2: each $\times10$ is $+20\,\text{dB}$, each $\times2$ is $+6\,\text{dB}$, each $\div$ subtracts.`],
        sol: md`Logs turn the product into a sum: $${rT(r)} = ${how}$, so $|A|_{\text{dB}} = ${d}\,\text{dB}$. Exactly: $20\log_{10}${f(r, 4)} = ${dbT(ans, 4)}$.`,
      };
    }
    if (kind === 'from') {
      const [r, how, d] = pick(DBR.filter((x) => x[0] !== Math.sqrt(1000)));
      const D = Math.round(20 * L10(r));
      const ans = 10 ** (D / 20);
      return {
        _chk: { kind, D, ans },
        q: md`A gain is $${D}\,\text{dB}$. What is it as a plain ratio (V/V)?`,
        parts: [plain('|A|', ans, 'V/V', { traps: [{ v: 10 ** (D / 10), msg: 'That undoes $10\\log_{10}$ (power). For voltage, $|A| = 10^{\\text{dB}/20}$.' }, { v: D / 20, msg: 'Raise 10 to that power: $|A| = 10^{\\text{dB}/20}$.' }] })],
        hints: [md`$|A| = 10^{\text{dB}/20}$; or split the dB into $20$s ($\times10$) and $6$s ($\times2$).`],
        sol: md`$$|A| = 10^{${D}/20} = ${f(ans, 4)}$$
In your head: $${d}\,\text{dB}$ is $${how}$, which is $${rT(r)}$.`,
      };
    }
    const G0 = [10, -10, 5, -5, 20, -20, 0.5, 0.2, 2, 50, 100, -100, 0.1];
    const n = ri(2, 3), gs = Array.from({ length: n }, () => pick(G0));
    const tot = gs.reduce((a, b) => a * b, 1), dB = gs.reduce((a, g) => a + 20 * L10(Math.abs(g)), 0);
    return {
      _chk: { kind, gs, tot, dB },
      q: md`${n} amplifier stages are cascaded with (loaded) gains ${gs.map((g) => `$${f(g, 3)}$`).join(', ')}. Find the overall gain magnitude as a ratio and in decibels.`,
      parts: [plain('|A_{tot}|', Math.abs(tot), 'V/V', { traps: [{ v: Math.abs(gs.reduce((a, b) => a + b, 0)), msg: 'Gains of cascaded stages **multiply**; it is their dB values that add.' }] }),
        plain('|A_{tot}|_{dB}', dB, 'dB', { tol: { abs: 0.3 } })],
      hints: [md`Ratios multiply; decibels add. Find each stage's dB, then add.`],
      sol: md`$$|A_{tot}| = ${gs.map((g) => f(Math.abs(g), 3)).join('\\times')} = ${f(Math.abs(tot), 4)}$$
In dB, add the stages: ${gs.map((g) => `$${f(20 * L10(Math.abs(g)), 3)}$`).join(' + ')} $= ${dbT(dB, 4)}$, which is $20\log_{10}${f(Math.abs(tot), 4)}$. ✓ (The signs only add phase: ${gs.filter((g) => g < 0).length} inversion${gs.filter((g) => g < 0).length === 1 ? '' : 's'}.)`,
    };
  };

  // ---- bk_pole: one pole, exact versus straight line
  GENS.bk_pole = (o = {}) => {
    const A0 = pick([10, 20, 50, 100, 1000, -40, -100]), wp = pick([1, 2, 5]) * 10 ** ri(3, 7);
    const m = pick([0.1, 0.2, 0.5, 1, 2, 5, 10, 100]), w = m * wp;
    const sp = { k: A0, poles: [wp] }, T = EB().tf(sp);
    const ad = T.asyDb(w), ed = T.db(w), ap = T.asyPhase(w), ep = T.phase(w);
    const neg = A0 < 0;
    return {
      _chk: { sp, w, ad, ed, ap, ep },
      q: md`$$${EB().tex(sp)}$$
At $\omega = ${wTeX(w)}\,\text{rad/s}$ find the straight-line magnitude, the exact magnitude (both in dB), and the straight-line phase.${neg ? ' Take the phase of a negative constant as $+180^\\circ$.' : ''}`,
      parts: [
        plain('|H|_{dB}\\ \\text{(straight line)}', ad, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 20 * L10(Math.abs(A0)), msg: m > 1 ? 'Above the corner the line falls $20\\,\\text{dB}$ per decade.' : '' }] }),
        plain('|H|_{dB}\\ \\text{(exact)}', ed, 'dB', { tol: { abs: 0.1 }, traps: [{ v: ad, msg: 'That is the straight line. The exact curve is $10\\log_{10}(1 + x^2)$ below the flat level.' }] }),
        plain('\\angle H\\ \\text{(straight line)}', ap, '°', { tol: { abs: 1 }, accept: neg ? [ap - 360] : [], traps: [{ v: ep, msg: 'That is the exact $\\tan^{-1}$. The straight line is $0$ until $0.1\\omega_p$, then $-45^\\circ$ per decade until $10\\omega_p$.' }, { v: neg ? ap - 180 : ap + 180, msg: neg ? 'The negative constant adds $180^\\circ$.' : 'The constant is positive: no $180^\\circ$.' }] }),
      ],
      hints: [md`$x = \omega/\omega_p = ${f(m, 3)}$. Straight line: flat below the corner, $-20\,\text{dB/dec}$ above. Exact: $20\log_{10}|A_0| - 10\log_{10}(1 + x^2)$.`, md`Straight-line phase: $0$ for $x\le0.1$, $-45^\circ(1 + \log_{10}x)$ for $0.1 < x < 10$, $-90^\circ$ for $x\ge10$${neg ? ', plus $180^\\circ$' : ''}.`],
      sol: md`$x = \omega/\omega_p = ${f(m, 3)}$; flat level $20\log_{10}${f(Math.abs(A0), 4)} = ${dbT(20 * L10(Math.abs(A0)))}$.

**Straight line:** ${m <= 1 ? 'at or below the corner, the flat level' : `$${f(L10(m), 3)}$ decades above the corner at $-20\\,\\text{dB/dec}$`}: $${dbT(ad)}$.

**Exact:** $${dbT(20 * L10(Math.abs(A0)))} - 10\log_{10}(1 + ${f(m * m, 4)}) = ${dbT(ed)}$ (the error is $${dbT(ed - ad)}$; it is largest, $-3\,\text{dB}$, at the corner).

**Phase:** ${neg ? '$180^\\circ$ from the constant, then ' : ''}${m <= 0.1 ? 'the ramp has not started' : m >= 10 ? 'the ramp is over' : `$-45^\\circ\\times(1 + \\log_{10}${f(m, 3)}) = ${degT(-45 * (1 + L10(m)))}$ from the ramp`}: straight line $${degT(ap)}$; exact $${degT(ep)}$.

[[fig:p]]`,
      figs: { p: { svg: EB().svg(sp, { show: 'both', marks: [{ w, n: `\\omega = ${wTeX(w)}` }], pts: [{ w }, { w, panel: 'phase' }] }), cap: 'Solid: straight lines. Dashed: exact.' } },
    };
  };

  // ---- bk_zero: a zero, a right-half-plane zero, or s at the origin
  GENS.bk_zero = (o = {}) => {
    const kind = o.kind || pick(['lhp', 'rhp', 'origin', 'hp']);
    const c = pick([1, 1, 2, 5]) * 10 ** ri(2, 6), A0 = pick([1, 2, 10, 100, 0.1]);
    const m = pick([0.1, 1, 10, 100, 0.01]);
    const w = m * c;
    const sp = kind === 'lhp' ? { k: A0, zeros: [c] } : kind === 'rhp' ? { k: A0, rhp: [c] } : kind === 'origin' ? { k: A0, origin: 1, w0: c } : { k: A0, origin: 1, w0: c, poles: [c] };
    const ad = asyMag(sp, w), ap = asyPh(sp, w);
    const what = { lhp: 'an ordinary (left-half-plane) zero', rhp: 'a right-half-plane zero', origin: 'a zero at the origin', hp: 'a high-pass: a zero at the origin and a pole' }[kind];
    return {
      _chk: { kind, sp, w, ad, ap },
      q: md`$$${EB().tex(sp)}$$
This is ${what}. Using the straight-line rules, find $|H|$ in dB and $\angle H$ at $\omega = ${wTeX(w)}\,\text{rad/s}$.`,
      parts: [plain('|H|_{dB}', ad, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 2 * 20 * L10(Math.abs(A0)) - ad, msg: 'Check the direction: an $s$ or a zero makes the magnitude **rise** with frequency.' }] }),
        plain('\\angle H', ap, '°', { tol: { abs: 1 }, traps: [{ v: -ap, msg: kind === 'rhp' ? 'A right-half-plane zero has the magnitude of a zero but the phase of a **pole**: it goes down.' : 'A left-half-plane zero (and an $s$) **adds** phase.' }] })],
      hints: [kind === 'origin' ? md`$|s/\omega_0| = \omega/\omega_0$ exactly: a straight line of $+20\,\text{dB/dec}$ through $0\,\text{dB}$ at $\omega_0$, at every frequency, with $+90^\circ$.` : kind === 'hp' ? md`Below the corner the $s$ rises at $+20\,\text{dB/dec}$; at the corner the pole cancels its slope. Phase: $+90^\circ$ from the $s$, minus the pole's ramp.` : md`Flat below the corner, $+20\,\text{dB/dec}$ above. Phase ramps over $0.1\omega_z\ldots10\omega_z$, ${kind === 'rhp' ? '**down** to $-90^\\circ$' : 'up to $+90^\\circ$'}.`],
      sol: md`Factor by factor, at $\omega = ${wTeX(w)}$:

${magRows(sp, w)}

Total: $|H|_{\text{dB}}\approx${dbT(ad)}$.

${phRows(sp, w)}

Total: $\angle H\approx${degT(ap)}$.${kind === 'rhp' ? ' The magnitude is that of a zero; the phase is that of a pole.' : ''}

[[fig:p]]`,
      figs: { p: { svg: EB().svg(sp, { show: 'both', wmin: Math.min(c, w) / 100, wmax: Math.max(c, w) * 100, marks: [{ w, n: `\\omega = ${wTeX(w)}` }], pts: [{ w }, { w, panel: 'phase' }] }) } },
    };
  };

  // a random transfer function: 2–4 corners at powers of ten (sometimes 2x or 5x), at most as many zeros as poles
  function randTF(o = {}) {
    const n = o.n || ri(2, 4);
    const ex_ = pickE(n, 1, 8);
    for (;;) {
      const sp = { k: pick([1, 10, 10, 100, 100, 1000, 20, 50]) * (o.neg !== false && Math.random() < 0.3 ? -1 : 1), zeros: [], poles: [], rhp: [] };
      ex_.forEach((e) => {
        const c = (o.mant && Math.random() < 0.3 ? pick([2, 5]) : 1) * 10 ** e;
        const r = Math.random();
        if (r < 0.55) sp.poles.push(c); else if (r < 0.85 || o.noRhp) sp.zeros.push(c); else sp.rhp.push(c);
      });
      const nz = sp.zeros.length + sp.rhp.length;
      if (sp.poles.length >= 1 && nz <= sp.poles.length) return sp;
    }
  }
  const cleanSp = (sp) => { const s = { k: sp.k }; ['zeros', 'poles', 'rhp'].forEach((k) => { if (sp[k] && sp[k].length) s[k] = sp[k].slice().sort((a, b) => a - b); }); if (sp.origin) { s.origin = sp.origin; s.w0 = sp.w0; } return s; };

  // ---- bk_asy: straight-line magnitude at one frequency
  GENS.bk_asy = (o = {}) => {
    const sp = cleanSp(randTF({ mant: true }));
    const cs = corners(sp);
    const pickW = () => { const r = Math.random(); if (r < 0.4) return pick(cs)[0]; return 10 ** ri(Math.round(L10(cs[0][0])), Math.min(9, Math.round(L10(cs[cs.length - 1][0])) + 1)); };
    const w = pickW(), ans = asyMag(sp, w);
    const flat = 20 * L10(Math.abs(sp.k));
    const last = cs.filter(([c]) => c < w).slice(-1);
    const lastOnly = flat + (last.length ? (last[0][1] === 'p' ? -1 : 1) * 20 * L10(w / last[0][0]) : 0);
    return {
      _chk: { sp, w, ans },
      q: md`$$${EB().tex(sp)}$$
Using the straight-line approximation, what is $|H(j\omega)|$ in dB at $\omega = ${wTeX(w)}\,\text{rad/s}$?`,
      parts: [plain('|H|_{dB}', ans, 'dB', { tol: { abs: 0.3 }, traps: [{ v: flat, msg: 'That is only the low-frequency level: every corner below this $\\omega$ bends the line.' }, { v: lastOnly, msg: 'Every corner already passed keeps contributing, not just the last one.' }, { v: EB().tf(sp).db(w), msg: 'That is the exact value; the question asks for the straight lines.' }] })],
      hints: [md`Each factor's straight line contributes $0$ below its corner and $\pm20\log_{10}(\omega/\omega_c)$ above it ($+$ for any zero, $-$ for a pole). Add them to $20\log_{10}|k|$.`],
      sol: md`Logs turn the product into a sum; add each factor's straight line at $\omega = ${wTeX(w)}$:

${magRows(sp, w)}

$$|H|_{\text{dB}}\approx${dbT(ans)}$$

[[fig:p]]`,
      figs: { p: { svg: EB().svg(sp, { marks: [{ w, n: `\\omega = ${wTeX(w)}` }], pts: [{ w }] }), cap: 'Solid: straight lines; dashed: exact.' } },
    };
  };

  // ---- bk_phase: straight-line phase at one frequency
  GENS.bk_phase = (o = {}) => {
    const sp = cleanSp(randTF({ n: ri(2, 3) }));
    const cs = corners(sp);
    const w = 10 ** ri(Math.max(0, Math.round(L10(cs[0][0])) - 1), Math.round(L10(cs[cs.length - 1][0])) + 1);
    const ans = asyPh(sp, w), ex_ = EB().tf(sp).phase(w), neg = sp.k < 0;
    return {
      _chk: { sp, w, ans },
      q: md`$$${EB().tex(sp)}$$
Using the straight-line phase rules, find $\angle H(j\omega)$ at $\omega = ${wTeX(w)}\,\text{rad/s}$.${neg ? ' (Take the phase of a negative constant as $+180^\\circ$.)' : ''}`,
      parts: [plain('\\angle H', ans, '°', { tol: { abs: 1 }, accept: [ans - 360, ans + 360], traps: [{ v: ex_, msg: 'That is the exact phase. The straight lines ramp at $\\pm45^\\circ$ per decade from $0.1\\omega_c$ to $10\\omega_c$.' }] })],
      hints: [md`Each pole: $0$ below $0.1\omega_p$, $-45^\circ$ per decade up to $10\omega_p$, then $-90^\circ$. A zero: the same with $+$. A right-half-plane zero: like a pole.${neg ? ' Add $180^\\circ$ for the negative constant.' : ''}`],
      sol: md`${phRows(sp, w)}

$$\angle H\approx${degT(ans)}\qquad(\text{exact: }${degT(ex_)})$$

[[fig:p]]`,
      figs: { p: { svg: EB().svg(sp, { show: 'phase', marks: [{ w, n: `\\omega = ${wTeX(w)}` }], pts: [{ w, panel: 'phase' }] }) } },
    };
  };

  // ---- bk_sketch: from the (s + a) form to numbers on the sketch
  GENS.bk_sketch = (o = {}) => {
    let ex_, sp;
    for (;;) {
      ex_ = pickE(3, 1, 7);
      const zi = ri(0, 2);
      sp = { k: pick([10, 100, 1000, 20, 50, 200]), zeros: [], poles: [] };
      if (Math.random() < 0.35) sp.k = -sp.k;
      ex_.forEach((e, i) => (i === zi && Math.random() < 0.7 ? sp.zeros : sp.poles).push(10 ** e));
      if (sp.poles.length >= 2) break;
    }
    const K = sp.k * sp.poles.reduce((a, c) => a * c, 1) / sp.zeros.reduce((a, c) => a * c, 1);
    const cs = corners(sp);
    const i = ri(0, cs.length - 2), wa = cs[i][0], wb = cs[i + 1][0];
    const slope = EB().tf(sp).slope(Math.sqrt(wa * wb));
    const w1 = 10 ** ri(ex_[0], Math.min(ex_[2] + 1, 8)), w2 = 10 ** ri(ex_[0], ex_[2] + 1);
    const m1 = asyMag(sp, w1), p2 = asyPh(sp, w2), k0 = 20 * L10(Math.abs(sp.k));
    const facs = (arr) => arr.map((c) => `(s + ${wTeX(c)})`).join('');
    return {
      _chk: { sp, K, wa, wb, slope, w1, m1, w2, p2, k0 },
      q: md`$$H(s) = \frac{${f(K, 4)}${sp.zeros.length ? facs(sp.zeros) : ''}}{${facs(sp.poles)}}$$
Sketch the Bode plot, then give: the low-frequency gain in dB; the slope of the magnitude between $${wTeX(wa)}$ and $${wTeX(wb)}\,\text{rad/s}$; the straight-line $|H|_{\text{dB}}$ at $\omega = ${wTeX(w1)}$; and the straight-line phase at $\omega = ${wTeX(w2)}$${sp.k < 0 ? ' (negative constant: $+180^\\circ$)' : ''}.`,
      parts: [plain('|H(0)|_{dB}', k0, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 20 * L10(Math.abs(K)), msg: 'Normalize first: each $(s + \\omega)$ factor carries its $\\omega$. $|H(0)| = |k|$, not the leading constant.' }] }),
        plain('\\text{slope}', slope, 'dB/dec', { tol: { abs: 0.5 }, traps: [{ v: -slope, msg: 'Poles bend the line down ($-20$ each), zeros up ($+20$).' }] }),
        plain(`|H|_{dB}\\ \\text{at}\\ ${wTeX(w1)}`, m1, 'dB', { tol: { abs: 0.3 } }),
        plain(`\\angle H\\ \\text{at}\\ ${wTeX(w2)}`, p2, '°', { tol: { abs: 1 }, accept: [p2 - 360, p2 + 360] })],
      hints: [md`Standard form first: pull every corner out of its factor. $k = H(0)$.`, md`Then walk: slope $= 20\times$(zeros passed $-$ poles passed); phase ramps $\pm45^\circ$/decade over $0.1\omega_c\ldots10\omega_c$.`],
      sol: md`**1. Standard form.** Pull the corners out:
$$${EB().tex(sp)}$$
so $|H(0)| = ${f(Math.abs(sp.k), 4)}$, i.e. $${dbT(k0)}$.

**2. Slope between $${wTeX(wa)}$ and $${wTeX(wb)}$:** the corners passed are ${cs.slice(0, i + 1).map(([c, t]) => `a ${KIND[t]} at $${wTeX(c)}$`).join(', ')}: $${slope}\,\text{dB/dec}$.

**3. Magnitude at $${wTeX(w1)}$:**

${magRows(sp, w1)}

Total $${dbT(m1)}$.

**4. Phase at $${wTeX(w2)}$:**

${phRows(sp, w2)}

Total $${degT(p2)}$.

[[fig:p]]`,
      figs: { p: { svg: EB().svg(sp, { show: 'both', marks: [{ w: w1, n: wTeX(w1) }, ...(w2 !== w1 ? [{ w: w2, n: wTeX(w2) }] : [])] }), cap: 'The sketch: straight lines solid, exact dashed.' } },
    };
  };

  // ---- bk_read: read H(s) back from straight-line plots
  GENS.bk_read = (o = {}) => {
    const sp = cleanSp(randTF({ n: ri(2, 3) }));
    const cs = corners(sp);
    const flip = (x) => JSON.parse(JSON.stringify(x));
    const vars = [];
    { const v = flip(sp); v.k = -v.k; vars.push([v, 'The phase starts at ' + (sp.k < 0 ? '$180^\\circ$, so the constant is **negative**.' : '$0^\\circ$, so the constant is **positive**.')]); }
    const zs = [...(sp.zeros || []), ...(sp.rhp || [])];
    if (zs.length) {
      const v = flip(sp), c = zs[0];
      if ((sp.zeros || []).includes(c)) { v.zeros = v.zeros.filter((x) => x !== c); v.rhp = [...(v.rhp || []), c]; } else { v.rhp = v.rhp.filter((x) => x !== c); v.zeros = [...(v.zeros || []), c]; }
      vars.push([cleanSp(v), `At $${wTeX(c)}$ the magnitude turns up and the phase goes ${(sp.rhp || []).includes(c) ? '**down**: a right-half-plane zero' : '**up**: an ordinary (left-half-plane) zero'}.`]);
    }
    { const v = flip(sp), c = sp.poles[sp.poles.length - 1]; v.poles = v.poles.filter((x) => x !== c); v.zeros = [...(v.zeros || []), c];
      if (v.poles.length) vars.push([cleanSp(v), `At $${wTeX(c)}$ the magnitude turns **down**: a pole, not a zero.`]); }
    { const v = flip(sp), c = cs[0][0], key = cs[0][1] === 'p' ? 'poles' : cs[0][1] === 'z' ? 'zeros' : 'rhp'; v[key] = v[key].map((x) => (x === c ? c * 10 : x));
      if (!cs.some(([x]) => Math.abs(x - c * 10) < 1e-6 * c)) vars.push([cleanSp(v), 'The first corner is a decade off: read it where the slope first changes.']); }
    const opts = vars.slice(0, 3);
    const mc = [`$${EB().tex(sp)}$`, ...opts.map(([v]) => `$${EB().tex(v)}$`)];
    return {
      _chk: { sp, opts: opts.map((x) => x[0]) },
      q: md`The straight-line Bode plots below belong to which transfer function? Read the low-frequency level, the corners and which way each one turns, and the phase. Also give $|k|$, and the lowest and highest corner frequencies.`,
      figHtml: EB().svg(sp, { show: 'both', exact: false }),
      parts: [plain('|k|', Math.abs(sp.k), 'V/V'), wPart('\\text{lowest corner}', cs[0][0]), wPart('\\text{highest corner}', cs[cs.length - 1][0]),
        { lbl: 'Which $H(s)$?', mc, a: 0, why: [null, ...opts.map(([, w]) => w)] }],
      hints: [md`Level at the left: $20\log_{10}|k|$. A kink down is a pole, a kink up a zero. The phase settles the rest: it starts at $180^\circ$ for a negative constant, and a zero whose phase goes down is in the right half-plane.`],
      sol: md`**Level:** $${dbT(20 * L10(Math.abs(sp.k)))}$, so $|k| = ${f(Math.abs(sp.k), 4)}$; the phase starts at $${sp.k < 0 ? '180' : '0'}^\circ$, so $k ${sp.k < 0 ? '< 0' : '> 0'}$.

**Corners, left to right:** ${cs.map(([c, t]) => `$${wTeX(c)}$: ${t === 'p' ? 'the slope drops by $20\\,\\text{dB/dec}$ and the phase falls: a **pole**' : t === 'z' ? 'the slope rises by $20$ and the phase rises: a **zero**' : 'the slope rises by $20$ but the phase **falls**: a **right-half-plane zero**'}`).join('; ')}.

$$${EB().tex(sp)}$$`,
    };
  };

  // ---- bk_unity: unity-gain and -3 dB frequencies, straight-line and exact
  function solveU(sp, lvlDb) {        // exact w where |H| (dB) = lvlDb, bisection on log w (|H| falling)
    const T = EB().tf(sp);
    let a = 1e-3, b = 1e15;
    for (let i = 0; i < 200; i++) { const m = Math.sqrt(a * b); if (T.db(m) > lvlDb) a = m; else b = m; }
    return Math.sqrt(a * b);
  }
  GENS.bk_unity = (o = {}) => {
    const kind = o.kind || pick(['one', 'two', 'two']);
    if (kind === 'one') {
      const A0 = pick([10, 20, 50, 100, 1000]), wp = pick([1, 2, 5]) * 10 ** ri(3, 7);
      const sp = { k: A0, poles: [wp] };
      const su = A0 * wp, eu = wp * Math.sqrt(A0 * A0 - 1);
      return {
        _chk: { kind, sp, su, eu },
        q: md`$$${EB().tex(sp)}$$
Find the unity-gain frequency $\omega_u$ (where $|H| = 1$): first from the straight lines, then exactly.`,
        parts: [wPart('\\omega_u\\ \\text{(straight line)}', su, { traps: [{ v: wp, msg: 'That is the corner. The gain is still large there.' }] }), wPart('\\omega_u\\ \\text{(exact)}', eu, { accept: A0 >= 10 ? [su] : [] })],
        hints: [md`Straight line: from $20\log_{10}A_0$ at $\omega_p$ it falls $20\,\text{dB}$ per decade, so it reaches $0\,\text{dB}$ after $\log_{10}A_0$ decades: $\omega_u\approx A_0\omega_p$.`, md`Exactly: $A_0^2 = 1 + (\omega_u/\omega_p)^2$.`],
        sol: md`**Straight line:** $\omega_u\approx A_0\,\omega_p = ${f(A0, 4)}\times${wTeX(wp)} = ${wT(su, 4)}$ (the gain-bandwidth product).

**Exact:** $\dfrac{A_0}{\sqrt{1 + (\omega_u/\omega_p)^2}} = 1\Rightarrow\omega_u = \omega_p\sqrt{A_0^2 - 1} = ${wT(eu, 4)}$, essentially the same when $A_0\gg1$.

[[fig:p]]`,
        figs: { p: { svg: EB().svg(sp, { marks: [{ w: wp, n: '\\omega_p' }, { w: su, n: '\\omega_u' }] }) } },
      };
    }
    let A0, w1, w2;
    do { A0 = pick([10, 100, 1000, 20, 50]); w1 = 10 ** ri(3, 6); w2 = w1 * pick([10, 100, 2, 5]); } while (A0 * w1 <= w2 * 1.2);
    const sp = { k: A0, poles: [w1, w2] };
    const su = Math.sqrt(A0 * w1 * w2), eu = solveU(sp, 0), e3 = solveU(sp, 20 * L10(A0) - 10 * L10(2));
    return {
      _chk: { kind, sp, su, eu, e3 },
      q: md`$$${EB().tex(sp)}$$
Find (a) the straight-line unity-gain frequency, (b) the exact $\omega_u$, and (c) the exact $-3\,\text{dB}$ frequency.`,
      parts: [wPart('(a)\\ \\omega_u\\ \\text{(straight line)}', su, { traps: [{ v: A0 * w1, msg: 'Past the second pole the line falls at $-40\\,\\text{dB/dec}$, not $-20$: the crossing comes sooner than $A_0\\omega_{p1}$.' }] }),
        wPart('(b)\\ \\omega_u\\ \\text{(exact)}', eu),
        wPart('(c)\\ \\omega_{3dB}', e3, { traps: [{ v: w2, msg: 'The $-3\\,\\text{dB}$ point is set by the **lower** pole.' }] })],
      hints: [md`Straight line: at $\omega_{p2}$ the line is at $20\log_{10}(A_0\omega_{p1}/\omega_{p2})$; then it falls $40\,\text{dB}$ per decade, so it reaches $0\,\text{dB}$ at $\sqrt{A_0\omega_{p1}\omega_{p2}}$.`, md`Exact: solve $(1 + \omega^2/\omega_{p1}^2)(1 + \omega^2/\omega_{p2}^2) = A_0^2$ (for $\omega_u$) or $= 2$ (for $\omega_{3\text{dB}}$): quadratics in $\omega^2$.`],
      sol: md`**(a)** Up to $\omega_{p1}$ the line is flat at $${dbT(20 * L10(A0))}$; it falls $20\,\text{dB/dec}$ to $\omega_{p2}$, reaching $${dbT(20 * L10(A0 * w1 / w2))}$ there, then $40\,\text{dB/dec}$. It hits $0\,\text{dB}$ at $\omega_u = \omega_{p2}\cdot10^{${f(20 * L10(A0 * w1 / w2), 4)}/40} = \sqrt{A_0\omega_{p1}\omega_{p2}} = ${wT(su, 4)}$.

**(b)** Exactly, with $u = \omega^2$: $(1 + u/\omega_{p1}^2)(1 + u/\omega_{p2}^2) = A_0^2$, a quadratic in $u$; its positive root gives $\omega_u = ${wT(eu, 4)}$.

**(c)** The same with $2$ on the right: $\omega_{3\text{dB}} = ${wT(e3, 4)}$, ${Math.abs(e3 / w1 - 1) < 0.02 ? 'essentially the lower pole (the second one is far away)' : `${f((1 - e3 / w1) * 100, 2)}\\%$ below the lower pole, because the second pole is close`}.

[[fig:p]]`,
      figs: { p: { svg: EB().svg(sp, { marks: [{ w: w1, n: '\\omega_{p1}' }, { w: w2, n: '\\omega_{p2}' }, { w: su, n: '\\omega_u' }] }) } },
    };
  };
  Object.assign(window.BK7, { magRows, phRows, corners });
})();

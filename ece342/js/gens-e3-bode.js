/* gens-e3-bode.js — Exam 3 frequency response: the Bode-plot drawer (window.E3Bode) and the randomized drills for
   Unit 13 (decibels, straight-line magnitude and phase, slopes, reading a plot back into H(s), one-pole circuits)
   and Unit 14 (a pole at each node, Miller, the CS/CE stage with the Miller and dominant-pole approximations).
   Every answer comes from the formulas below; each problem carries _chk (its inputs) so an outside script can
   recompute it independently.

   ---------------------------------------------------------------- E3Bode API
   A transfer function is a plain object:
     { k, zeros: [ωz…], poles: [ωp…], rhp: [ωz…], origin: n, w0 }
       H(s) = k · (s/w0)^n · Π(1 + s/ωz) · Π(1 − s/ωr) / Π(1 + s/ωp)
       k may be negative (adds 180° of phase); zeros/poles/rhp are positive corner frequencies in rad/s;
       origin (default 0) is the number of zeros at s = 0 (negative: poles at the origin), w0 defaults to 1.
   E3Bode.tf(spec)  → { mag(ω), db(ω), phase(ω) (deg, exact), asyDb(ω), asyPhase(ω) (straight-line rules),
                        slope(ω) (dB/dec of the asymptote just above ω), corners }
   E3Bode.svg(spec, o) → an SVG string (class "plot e3bode"; colours from the site tokens, light and dark):
       o.show       'mag' (default) | 'phase' | 'both'
       o.wmin/wmax  axis range in rad/s (default: one decade beyond the outer corners, two when the phase is drawn,
                    at least four decades in all)
       o.asym       draw the straight-line asymptotes (default true)
       o.exact      draw the exact curve (default true; dashed when asym is on)
       o.marks      [{ w, n }]: dashed vertical lines at ω with a TeX label n on top
       o.pts        [{ w, panel: 'mag'|'phase', on: 'asym'|'exact', n, side: 'ur'|'ul'|'dr'|'dl' }]: dots with TeX labels
       o.w, o.h     width of the drawing and height of one panel (default 440 × 190)
       o.hideY      hide the y tick numbers (default false)
   E3Bode.tex(spec, name = 'H(s)') → TeX of the transfer function in the lecture's (1 + s/ω) form
   E3Bode.wTeX(ω)  → 10^{4}, 2\times10^{5}, …
   E3Bode.sl(w, c) → straight-line phase of one pole factor at ω (0, then −45° per decade from 0.1c to 10c, then −90) */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, ri = U.ri;
  const GENS = window.GENS;
  const LOG = Math.log10;
  const DEG = 180 / Math.PI;

  // ================================================================ transfer functions
  const seg = (w, c) => (w <= c / 10 ? 0 : w >= c * 10 ? 90 : 45 * (LOG(w / c) + 1));   // straight-line phase size
  function tf(sp) {
    const k = sp.k ?? 1, Z = sp.zeros || [], P = sp.poles || [], RZ = sp.rhp || [], n0 = sp.origin || 0, w0 = sp.w0 || 1;
    const h = (w, c) => Math.sqrt(1 + (w / c) * (w / c));
    const base = k < 0 ? 180 : 0;
    const T = {
      spec: sp, corners: [...Z, ...P, ...RZ].sort((a, b) => a - b),
      mag: (w) => Math.abs(k) * Math.pow(w / w0, n0) * Z.reduce((m, c) => m * h(w, c), 1) * RZ.reduce((m, c) => m * h(w, c), 1) / P.reduce((m, c) => m * h(w, c), 1),
      phase: (w) => base + 90 * n0 + Z.reduce((a, c) => a + Math.atan(w / c) * DEG, 0) - RZ.reduce((a, c) => a + Math.atan(w / c) * DEG, 0) - P.reduce((a, c) => a + Math.atan(w / c) * DEG, 0),
      asyDb: (w) => 20 * LOG(Math.abs(k)) + 20 * n0 * LOG(w / w0)
        + Z.reduce((a, c) => a + (w > c ? 20 * LOG(w / c) : 0), 0) + RZ.reduce((a, c) => a + (w > c ? 20 * LOG(w / c) : 0), 0)
        - P.reduce((a, c) => a + (w > c ? 20 * LOG(w / c) : 0), 0),
      asyPhase: (w) => base + 90 * n0 + Z.reduce((a, c) => a + seg(w, c), 0) - RZ.reduce((a, c) => a + seg(w, c), 0) - P.reduce((a, c) => a + seg(w, c), 0),
      slope: (w) => 20 * n0 + 20 * (Z.filter((c) => c <= w).length + RZ.filter((c) => c <= w).length - P.filter((c) => c <= w).length),
    };
    T.db = (w) => 20 * LOG(T.mag(w));
    return T;
  }

  // ================================================================ TeX
  const p10 = (w) => { const n = Math.round(LOG(w)); return Math.abs(w - 10 ** n) <= 1e-9 * w ? n : null; };
  function wTeX(w) {
    const n = p10(w);
    if (n !== null) return n === 0 ? '1' : n === 1 ? '10' : `10^{${n}}`;
    const e = Math.floor(LOG(w) + 1e-12), m = w / 10 ** e;
    return e === 0 ? f(m, 3) : `${f(m, 3)}\\times10^{${e}}`;
  }
  const kTeX = (k) => f(k, 3);
  function tex(sp, name = 'H(s)') {
    const k = sp.k ?? 1, Z = sp.zeros || [], P = sp.poles || [], RZ = sp.rhp || [], n0 = sp.origin || 0, w0 = sp.w0 || 1;
    const fac = (c, sg) => `(1 ${sg} s/${wTeX(c)})`;
    const sTerm = (n) => (w0 === 1 ? (n === 1 ? 's' : `s^{${n}}`) : (n === 1 ? `\\tfrac{s}{${wTeX(w0)}}` : `\\left(\\tfrac{s}{${wTeX(w0)}}\\right)^{${n}}`));
    let num = Z.map((c) => fac(c, '+')).join('') + RZ.map((c) => fac(c, '-')).join('');
    let den = P.map((c) => fac(c, '+')).join('');
    if (n0 > 0) num = sTerm(n0) + num;
    if (n0 < 0) den = sTerm(-n0) + den;
    const kk = Math.abs(k) === 1 && (num || !den) ? (k < 0 ? '-' : '') : kTeX(k);
    if (!den) return `${name ? `${name} = ` : ''}${kk}${num || (kk === '' || kk === '-' ? `${kk}1` : '')}`;
    if (!num) return `${name ? `${name} = ` : ''}${k < 0 ? '-' : ''}\\dfrac{${kTeX(Math.abs(k))}}{${den}}`;
    const lead = Math.abs(k) === 1 ? (k < 0 ? '-' : '') : `${kTeX(k)}\\,`;
    return `${name ? `${name} = ` : ''}${lead}\\dfrac{${num}}{${den}}`;
  }

  // ================================================================ the drawing
  // a label as the site's figures write them (a foreignObject that figlabels.js lifts into an HTML layer)
  function label(x, y, html, anchor = 'c', cls = 'small') {
    if (!html) return '';
    const w = 190, h = 56;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (anchor === 'l') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (anchor === 'r') { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (anchor === 't') { fy = y; ai = 'flex-start'; }
    if (anchor === 'b') { fy = y - h; ai = 'flex-end'; }
    if (anchor === 'bl') { fx = x; jc = 'flex-start'; ta = 'left'; fy = y - h; ai = 'flex-end'; }
    if (anchor === 'tr') { fx = x - w; jc = 'flex-end'; ta = 'right'; fy = y; ai = 'flex-start'; }
    if (anchor === 'br') { fx = x - w; jc = 'flex-end'; ta = 'right'; fy = y - h; ai = 'flex-end'; }
    if (anchor === 'tl') { fx = x; jc = 'flex-start'; ta = 'left'; fy = y; ai = 'flex-start'; }
    return `<foreignObject x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">${html}</span></div></foreignObject>`;
  }
  const tk = (t) => `<span class="tick">$${t}$</span>`;

  function niceRange(lo, hi, steps) {
    let step = steps[steps.length - 1];
    for (const s of steps) if ((hi - lo) / s <= 7) { step = s; break; }
    let a = Math.floor((lo - 0.12 * step) / step) * step, b = Math.ceil((hi + 0.12 * step) / step) * step;
    if (b - a < 2 * step) { a -= step; b += step; }
    return [a, b, step];
  }

  function svg(sp, o = {}) {
    const T = tf(sp);
    const cs = T.corners;
    const show = o.show || 'mag';
    // default range: a decade past the outer corners (two when the phase is drawn, so its ramps finish), at least 4 decades
    const pad = show === 'mag' ? 1 : 2;
    let L0 = o.wmin ? LOG(o.wmin) : (cs.length ? Math.floor(LOG(cs[0]) + 1e-9) - pad : 0);
    let L1 = o.wmax ? LOG(o.wmax) : (cs.length ? Math.ceil(LOG(cs[cs.length - 1]) - 1e-9) + pad : 4);
    if (!o.wmin && !o.wmax && L1 - L0 < 4) { const e = Math.ceil((4 - (L1 - L0)) / 2); L0 -= e; L1 += e; }
    const panels = show === 'both' ? ['mag', 'phase'] : [show];
    const W = o.w || 440, ph = o.h || 190, ml = 50, mr = 18, mt = 26, gap = 34, mb = 40;
    const H = mt + panels.length * ph + (panels.length - 1) * gap + mb;
    const X = (lw) => ml + (lw - L0) / (L1 - L0) * (W - ml - mr);
    const asym = o.asym !== false, exact = o.exact !== false;
    // samples
    const N = 240, ws = [];
    for (let i = 0; i <= N; i++) ws.push(10 ** (L0 + (L1 - L0) * i / N));
    // breakpoints of the straight lines (exact corners, and 0.1c / 10c for the phase)
    const inR = (w) => LOG(w) > L0 + 1e-9 && LOG(w) < L1 - 1e-9;
    const bpM = [10 ** L0, ...cs.filter(inR), 10 ** L1];
    const bpP = [10 ** L0, ...cs.flatMap((c) => [c / 10, c * 10]).filter(inR), 10 ** L1].sort((a, b) => a - b);
    let s = `<svg class="plot e3bode" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Bode plot">`;
    panels.forEach((kind, pi) => {
      const top = mt + pi * (ph + gap), bot = top + ph;
      const fa = kind === 'mag' ? T.asyDb : T.asyPhase, fe = kind === 'mag' ? T.db : T.phase;
      const vals = [];
      if (asym) bpM.concat(bpP).forEach((w) => vals.push(fa(w)));
      if (exact) ws.forEach((w) => vals.push(fe(w)));
      let lo = Math.min(...vals), hi = Math.max(...vals);
      if (o.yr && o.yr[kind]) [lo, hi] = o.yr[kind];
      const [a, b, step] = kind === 'mag' ? niceRange(lo, hi, [10, 20, 40, 60]) : niceRange(lo, hi, [45, 90, 180]);
      const Y = (v) => bot - (v - a) / (b - a) * ph;
      // grid: decades (and faint 2..9), value ticks
      for (let d = Math.ceil(L0 - 1e-9); d <= Math.floor(L1 + 1e-9); d++) {
        s += `<path class="grid" d="M${X(d).toFixed(1)},${top}V${bot}"/>`;
        if (d < L1) for (let m = 2; m <= 9; m++) { const lx = d + LOG(m); if (lx < L1) s += `<path class="grid" style="opacity:.45" d="M${X(lx).toFixed(1)},${top}V${bot}"/>`; }
      }
      for (let v = a; v <= b + 1e-9; v += step) {
        s += `<path class="grid" d="M${ml},${Y(v).toFixed(1)}H${W - mr}"/>`;
        if (!o.hideY) s += label(ml - 6, Y(v), tk(f(v, 4)), 'r');
      }
      if (kind === 'mag' && a < 0 && b > 0) s += `<path class="axis" style="stroke-dasharray:2 3" d="M${ml},${Y(0).toFixed(1)}H${W - mr}"/>`;
      s += `<path class="axis" d="M${ml},${top}V${bot}H${W - mr}"/>`;
      // curves
      const line = (pts, cls) => `<path class="curve ${cls}" d="M${pts.map(([w, v]) => `${X(LOG(w)).toFixed(1)},${Y(v).toFixed(1)}`).join('L')}"/>`;
      if (exact) s += line(ws.map((w) => [w, fe(w)]), asym ? 'ink dash' : '');
      if (asym) s += line((kind === 'mag' ? bpM : bpP).map((w) => [w, fa(w)]), '');
      // marks and dots
      (o.marks || []).forEach((m) => {
        if (!inR(m.w) && Math.abs(LOG(m.w) - L0) > 1e-9 && Math.abs(LOG(m.w) - L1) > 1e-9) return;
        s += `<path class="axis" style="stroke-dasharray:3 3;stroke-width:1" d="M${X(LOG(m.w)).toFixed(1)},${top}V${bot}"/>`;
        if (pi === 0 && m.n) {
          const mx = X(LOG(m.w));
          s += mx > W - mr - 45 ? label(mx + 4, top - 3, `$${m.n}$`, 'br') : mx < ml + 45 ? label(mx - 4, top - 3, `$${m.n}$`, 'bl') : label(mx, top - 3, `$${m.n}$`, 'b');
        }
      });
      (o.pts || []).filter((p) => (p.panel || 'mag') === kind).forEach((p) => {
        const v = (p.on === 'exact' ? fe : fa)(p.w);
        s += `<circle class="fill" cx="${X(LOG(p.w)).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3.6"/>`;
        if (p.n) {
          const sd = p.side || 'ur', dx = /l/.test(sd) ? -7 : 7, dy = /d/.test(sd) ? 6 : -6;
          s += label(X(LOG(p.w)) + dx, Y(v) + dy, `$${p.n}$`, { ur: 'bl', ul: 'br', dr: 'tl', dl: 'tr' }[sd]);
        }
      });
      // axis titles
      s += label(6, top - 4, kind === 'mag' ? `$${o.yl || '|H|_{\\text{dB}}'}$` : '$\\angle H\\ (^\\circ)$', 'bl', 'small');
      // x ticks under the last panel only
      if (pi === panels.length - 1) {
        const every = (L1 - L0) > 8 ? 2 : 1;
        for (let d = Math.ceil(L0 - 1e-9); d <= Math.floor(L1 + 1e-9); d += every) s += label(X(d), bot + 5, tk(wTeX(10 ** d)), 't');
        s += label(W - mr, bot + 22, `$${o.xl || '\\omega\\ (\\text{rad/s})'}$`, 'tr', 'small');
      }
    });
    return s + '</svg>';
  }
  window.E3Bode = { tf, svg, tex, wTeX, sl: (w, c) => -seg(w, c) };

  // ================================================================ answer helpers
  const near = (a, b, r = 0.02) => Math.abs(a - b) <= r * Math.abs(b) + 1e-12;
  function scaled(lbl, v, table, traps = [], tol) {
    const av = Math.abs(v);
    const [sc, u] = table.find(([x]) => av >= x * 0.9995) || table[table.length - 1];
    const p = { lbl, unit: u, ans: v / sc };
    const t = traps.filter((x) => !near(x.v, v));
    if (t.length) p.traps = t.map((x) => ({ v: x.v / sc, msg: x.msg }));
    if (tol) p.tol = tol;
    return p;
  }
  const W_UNITS = [[1e9, 'Grad/s'], [1e6, 'Mrad/s'], [1e3, 'krad/s'], [1, 'rad/s']];
  const F_UNITS = [[1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz'], [1, 'Hz']];
  const C_UNITS = [[1e-12, 'pF'], [1e-15, 'fF']];
  const wPart = (lbl, w, traps) => scaled(lbl, w, W_UNITS, traps);
  const fPart = (lbl, x, traps) => scaled(lbl, x, F_UNITS, traps);
  const cPart = (lbl, c, traps) => scaled(lbl, c, C_UNITS, traps);
  const sciW = (w) => {           // a rad/s value in TeX with a sensible prefix
    const [sc, u] = W_UNITS.find(([x]) => w >= x * 0.9995) || W_UNITS[3];
    return `${f(w / sc, 3)}\\,\\text{${u}}`;
  };
  const sciF = (x) => { const [sc, u] = F_UNITS.find(([y]) => x >= y * 0.9995) || F_UNITS[3]; return `${f(x / sc, 3)}\\,\\text{${u}}`; };
  const capT = (c) => (c >= 1e-12 * 0.9995 ? `${f(c * 1e12, 3)}\\,\\text{pF}` : `${f(c * 1e15, 3)}\\,\\text{fF}`);
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const resT = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : KO(r));
  const MS = (g) => `${f(g * 1000, 3)}\\,\\text{mS}`;
  const par = U.par;
  const dbT = (x) => `${f(x, 3)}\\,\\text{dB}`;
  const fd = (x) => f(Math.abs(x) < 0.005 ? 0 : x, 3);          // degrees, with float dust shown as 0

  // ================================================================ Unit 13 generators
  // ---- decibels both ways
  const DB_TO = [
    [2, '2 = 6\\text{ dB}'], [4, '4 = 2\\times2 \\to 6 + 6 = 12\\text{ dB}'], [5, '5 = 10/2 \\to 20 - 6 = 14\\text{ dB}'],
    [8, '8 = 2\\times2\\times2 \\to 18\\text{ dB}'], [20, '20 = 10\\times2 \\to 20 + 6 = 26\\text{ dB}'], [40, '40 = 10\\times4 \\to 20 + 12 = 32\\text{ dB}'],
    [50, '50 = 100/2 \\to 40 - 6 = 34\\text{ dB}'], [200, '200 = 100\\times2 \\to 40 + 6 = 46\\text{ dB}'], [500, '500 = 1000/2 \\to 60 - 6 = 54\\text{ dB}'],
    [1000, '1000 = 10^3 \\to 60\\text{ dB}'], [100, '100 = 10^2 \\to 40\\text{ dB}'], [0.5, '0.5 = 1/2 \\to -6\\text{ dB}'],
    [0.1, '0.1 = 10^{-1} \\to -20\\text{ dB}'], [0.01, '0.01 \\to -40\\text{ dB}'], [Math.SQRT1_2, '1/\\sqrt2 \\to -3\\text{ dB}'],
    [Math.sqrt(10), '\\sqrt{10} \\to 10\\text{ dB (half of 20)}'], [25, '25 = 100/4 \\to 40 - 12 = 28\\text{ dB}'], [400, '400 = 100\\times4 \\to 52\\text{ dB}'],
  ];
  GENS.e3_db = () => {
    const toDb = Math.random() < 0.55;
    if (toDb) {
      const [r, how] = pick(DB_TO);
      const rT = r === Math.SQRT1_2 ? '1/\\sqrt2 \\approx 0.707' : r === Math.sqrt(10) ? '\\sqrt{10}\\approx3.16' : f(r, 4);
      const ans = 20 * LOG(r);
      return {
        _chk: { kind: 'todb', r, ans },
        q: md`An amplifier's gain magnitude is $|A| = ${rT}$. What is it in decibels? (No calculator: build it from $\times10 = 20\,\text{dB}$ and $\times2 \approx 6\,\text{dB}$.)`,
        parts: [{ lbl: '|A|_{dB}', unit: 'dB', ans, tol: { abs: 0.35 }, traps: [{ v: 10 * LOG(r), msg: 'That is $10\\log_{10}$, the rule for **power**. Voltage gain uses $20\\log_{10}|A|$.' }, { v: 20 * Math.log(r), msg: 'That used the natural log. Decibels use $\\log_{10}$.' }].filter((t) => Math.abs(t.v - ans) > 0.4) }],
        hints: [md`$|A|_{\text{dB}} = 20\log_{10}|A|$. Factor the number into tens and twos: each $\times10$ adds $20\,\text{dB}$, each $\times2$ adds $6\,\text{dB}$, each $\div2$ takes off $6\,\text{dB}$.`],
        sol: md`$$|A|_{\text{dB}} = 20\log_{10}|A|$$
Build it from the two facts you know: $$${how}$$
(Exactly: $20\log_{10}(${f(r, 4)}) = ${f(ans, 4)}\,\text{dB}$.) A gain below 1 is a **negative** number of dB; a gain of exactly 1 is $0\,\text{dB}$.`,
      };
    }
    const D = pick([6, 12, 14, 20, 26, 28, 34, 40, 46, 54, 60, 80, -3, -6, -20, -40, 3, 32]);
    const ans = 10 ** (D / 20);
    const word = { 6: '6 = 6 \\to \\times2', 12: '12 = 6 + 6 \\to \\times4', 14: '14 = 20 - 6 \\to 10/2 = 5', 20: '20 \\to \\times10', 26: '26 = 20 + 6 \\to 10\\times2 = 20',
      28: '28 = 40 - 12 \\to 100/4 = 25', 34: '34 = 40 - 6 \\to 100/2 = 50', 40: '40 \\to 100', 46: '46 = 40 + 6 \\to 200', 54: '54 = 60 - 6 \\to 500', 60: '60 \\to 1000', 80: '80 \\to 10^4',
      '-3': '-3 \\to 1/\\sqrt2 \\approx 0.707', '-6': '-6 \\to 1/2', '-20': '-20 \\to 1/10', '-40': '-40 \\to 1/100', 3: '3 \\to \\sqrt2 \\approx 1.41', 32: '32 = 20 + 12 \\to 10\\times4 = 40' }[D];
    return {
      _chk: { kind: 'fromdb', D, ans },
      q: md`A gain is $${D}\,\text{dB}$. What is $|A|$ as a plain ratio (volts per volt)?`,
      parts: [{ lbl: '|A|', unit: 'V/V', ans, traps: [{ v: 10 ** (D / 10), msg: 'That is the power rule ($10\\log$). For a voltage gain, $|A| = 10^{\\text{dB}/20}$.' }, { v: D / 20, msg: 'Divide by 20 and then raise 10 to that power: $|A| = 10^{\\text{dB}/20}$.' }].filter((t) => !near(t.v, ans, 0.03)) }],
      hints: [md`Undo $20\log_{10}$: $|A| = 10^{\text{dB}/20}$. Or split the dB into $20$s and $6$s: every $20\,\text{dB}$ is $\times10$, every $6\,\text{dB}$ is $\times2$.`],
      sol: md`$$|A| = 10^{${D}/20} = ${f(ans, 4)}$$
In your head: $${word}$. Signs: a negative dB value is a gain **below 1** (attenuation).`,
    };
  };

  // ---- random transfer functions with corners at powers of ten
  function randSpec(o = {}) {
    const nC = o.n || ri(2, 3);
    const exps = U.shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, nC).sort((a, b) => a - b);
    // at least one pole; never more zeros than poles; the lowest corner is a pole most of the time
    let kinds;
    for (;;) {
      kinds = exps.map(() => (Math.random() < 0.4 ? 'z' : 'p'));
      const np = kinds.filter((x) => x === 'p').length, nz = nC - np;
      if (np >= 1 && nz <= np && (kinds[0] === 'p' || Math.random() < 0.3)) break;
    }
    const sp = { k: o.k ?? pick([1, 10, 10, 100, 100, 1000]), zeros: [], poles: [] };
    exps.forEach((e, i) => sp[kinds[i] === 'z' ? 'zeros' : 'poles'].push(10 ** e));
    if (o.neg) sp.k = -sp.k;
    return sp;
  }
  const corners = (sp) => [...sp.zeros.map((w) => [w, 'z']), ...sp.poles.map((w) => [w, 'p'])].sort((a, b) => a[0] - b[0]);
  // the straight-line walk, as a table the solution can print
  function walkMd(sp, upto) {
    const T = tf(sp);
    const rows = [`| From | To | Slope | Change |`, `|---|---|---|---|`];
    const cs = [0, ...corners(sp).map((c) => c[0])];
    for (let i = 0; i < cs.length; i++) {
      const a = cs[i], b = cs[i + 1] ?? Infinity;
      if (upto !== undefined && a >= upto) break;
      const end = upto !== undefined ? Math.min(b, upto) : b;
      const sl = T.slope(a === 0 ? (cs[1] || 1) / 100 : a);
      const ch = isFinite(end) && a > 0 ? sl * LOG(end / a) : null;
      rows.push(`| $${a === 0 ? '0' : wTeX(a)}$ | $${isFinite(end) ? wTeX(end) : '\\infty'}$ | $${sl}\\,\\text{dB/dec}$ | ${ch === null ? (a === 0 ? `flat at $20\\log_{10}${f(Math.abs(sp.k), 4)} = ${f(20 * LOG(Math.abs(sp.k)), 3)}\\,\\text{dB}$` : '') : `$${ch >= 0 ? '+' : ''}${f(ch, 3)}\\,\\text{dB}$`} |`);
    }
    return rows.join('\n');
  }

  GENS.e3_bode_asy = () => {
    const sp = randSpec();
    const T = tf(sp);
    const cs = corners(sp);
    const lo = Math.round(LOG(cs[0][0])), hi = Math.round(LOG(cs[cs.length - 1][0]));
    const m = ri(lo, Math.min(hi + 2, 9));
    const w = 10 ** m;
    const ans = T.asyDb(w);
    const flat = 20 * LOG(Math.abs(sp.k));
    const lastOnly = flat + (cs.filter((c) => c[0] < w).slice(-1).map((c) => (c[1] === 'p' ? -1 : 1) * 20 * LOG(w / c[0]))[0] || 0);
    const atCorner = cs.some((c) => near(c[0], w, 1e-6));
    return {
      _chk: { kind: 'asy', sp, w, ans },
      q: md`$$${tex(sp)}$$
Using the straight-line (asymptotic) Bode approximation, what is $|H|$ in dB at $\omega = ${wTeX(w)}\,\text{rad/s}$?`,
      parts: [{ lbl: '|H|_{dB}', unit: 'dB', ans, tol: { abs: 0.3 }, traps: [
        { v: flat, msg: 'That is only the low-frequency level. Every corner below this $\\omega$ bends the line: walk across them.' },
        { v: lastOnly, msg: 'You used only the last corner. The slopes **accumulate**: each corner changes the slope from there on, and the earlier corners keep contributing.' },
        { v: T.db(w), msg: 'That is the exact value. The question asks for the straight-line approximation (at a corner the exact curve is 3 dB off the line).' },
      ].filter((t) => Math.abs(t.v - ans) > 0.5) }],
      hints: [md`Start at $20\log_{10}|k|$ at low frequency. Walk right: each pole adds $-20\,\text{dB/dec}$ to the slope from its corner on, each zero adds $+20\,\text{dB/dec}$.`,
        md`Between two corners a decade apart, the line changes by (slope) $\times$ (number of decades).`],
      sol: md`**Low frequency:** every factor is 1, so $|H| = |k| = ${f(Math.abs(sp.k), 4)}$, i.e. $${f(flat, 3)}\,\text{dB}$.

**Walk to the right**, adding $-20\,\text{dB/dec}$ at each pole and $+20\,\text{dB/dec}$ at each zero:

${walkMd(sp, w)}

Adding the changes: $|H|_{\text{dB}}(${wTeX(w)}) \approx ${f(ans, 3)}\,\text{dB}$.${atCorner ? ' This $\\omega$ sits right on a corner: the exact curve is about $3\\,\\text{dB}$ away from the line there (below it for a pole, above it for a zero).' : ''}

[[fig:plot]]`,
      figs: { plot: { svg: svg(sp, { marks: [{ w, n: `\\omega = ${wTeX(w)}` }], pts: [{ w }] }), cap: 'Solid: the straight lines. Dashed: the exact curve.' } },
    };
  };

  GENS.e3_bode_slope = () => {
    const sp = randSpec({ n: ri(3, 4) });
    const T = tf(sp);
    const cs = corners(sp);
    const i = ri(0, cs.length - 2);
    const a = cs[i][0], b = cs[i + 1][0];
    const mid = Math.sqrt(a * b);
    const s1 = T.slope(mid), s2 = T.slope(cs[cs.length - 1][0] * 10);
    const count = (w) => ({ p: sp.poles.filter((c) => c <= w).length, z: sp.zeros.filter((c) => c <= w).length });
    const c1 = count(mid), c2 = count(1e12);
    return {
      _chk: { kind: 'slope', sp, a, b, s1, s2 },
      q: md`$$${tex(sp)}$$
What is the slope of the straight-line magnitude plot (in dB/decade) **between** $\omega = ${wTeX(a)}$ and $${wTeX(b)}\,\text{rad/s}$, and what is it at very high frequency?`,
      parts: [
        { lbl: `\\text{slope between } ${wTeX(a)} \\text{ and } ${wTeX(b)}`, unit: 'dB/dec', ans: s1, tol: { abs: 0.5 }, traps: [{ v: -s1, msg: 'Right size, wrong sign. Poles pull the line **down** ($-20$ each), zeros push it **up** ($+20$ each).' }].filter((t) => t.v !== s1) },
        { lbl: '\\text{slope as } \\omega\\to\\infty', unit: 'dB/dec', ans: s2, tol: { abs: 0.5 }, traps: [{ v: -s2, msg: 'Right size, wrong sign. Each pole gives $-20\\,\\text{dB/dec}$.' }].filter((t) => t.v !== s2) },
      ],
      hints: [md`Count only the corners to the **left** of the region: slope $= 20\times(\#\text{zeros passed} - \#\text{poles passed})$.`],
      sol: md`The slope anywhere is $20\,\text{dB/dec}\times(\text{zeros passed} - \text{poles passed})$, counting only the corners at lower $\omega$.

**Between $${wTeX(a)}$ and $${wTeX(b)}$:** passed ${c1.z} zero${c1.z === 1 ? '' : 's'} and ${c1.p} pole${c1.p === 1 ? '' : 's'}: $20(${c1.z} - ${c1.p}) = ${s1}\,\text{dB/dec}$.

**Far right:** all ${c2.z} zero${c2.z === 1 ? '' : 's'} and ${c2.p} poles passed: $20(${c2.z} - ${c2.p}) = ${s2}\,\text{dB/dec}$. Recognize it on sight: the final slope is $-20\times$(number of poles $-$ number of zeros), which is $-20\,\text{dB/dec}$ per "extra" pole.

[[fig:plot]]`,
      figs: { plot: { svg: svg(sp, { marks: [{ w: a, n: wTeX(a) }, { w: b, n: wTeX(b) }] }) } },
    };
  };

  // opts.n: number of corners (default 1–3); opts.pos: never a negative constant
  GENS.e3_bode_phase = (opts = {}) => {
    const neg = !opts.pos && Math.random() < 0.3;
    const sp = randSpec({ n: opts.n || ri(1, 3), neg });
    const T = tf(sp);
    const cs = corners(sp);
    const lo = Math.round(LOG(cs[0][0])), hi = Math.round(LOG(cs[cs.length - 1][0]));
    const w = 10 ** ri(Math.max(lo - 1, 0), hi + 1);
    const ans = T.asyPhase(w), ex = T.phase(w);
    const acc = [ex];
    if (neg) acc.push(ans - 360, ex - 360);
    const rows = cs.map(([c, t]) => {
      const v = (t === 'z' ? 1 : -1) * seg(w, c);
      const where = w <= c / 10 ? `$\\omega \\le ${wTeX(c)}/10$: not started` : w >= c * 10 ? `$\\omega \\ge 10\\times${wTeX(c)}$: finished` : near(w, c, 1e-6) ? 'at the corner: halfway' : `$${f(LOG(w / c) + 1, 3)}$ decades into its two-decade ramp`;
      return `| ${t === 'z' ? 'zero' : 'pole'} at $${wTeX(c)}$ | ${where} | $${v > 0.005 ? '+' : ''}{${fd(v)}}^\\circ$ | ${'$'}{${fd((t === 'z' ? 1 : -1) * Math.atan(w / c) * DEG)}}^\\circ$ |`;
    }).join('\n');
    return {
      _chk: { kind: 'phase', sp, w, ans, ex },
      q: md`$$${tex(sp)}$$
Using the straight-line phase rules, what is $\angle H(j\omega)$ at $\omega = ${wTeX(w)}\,\text{rad/s}$ (in degrees)?${neg ? ' Take the phase of a negative constant as $+180^\\circ$.' : ''}`,
      parts: [{ lbl: '\\angle H', unit: '°', ans, tol: { abs: 1 }, accept: acc, traps: [
        { v: ans - (neg ? 180 : 0) + (neg ? 0 : 180), msg: neg ? 'The constant is negative: it adds $180^\\circ$ at every frequency.' : 'The constant here is positive: no $180^\\circ$.' },
        { v: -ans + (neg ? 360 : 0), msg: 'Check the signs: a pole **subtracts** phase ($0$ to $-90^\\circ$), a left-half-plane zero **adds** ($0$ to $+90^\\circ$).' },
      ].filter((t) => Math.abs(t.v - ans) > 1.5 && !acc.some((x) => Math.abs(t.v - x) < 1.5)) }],
      hints: [md`Each pole's phase ramps from $0$ at $0.1\omega_p$ to $-90^\circ$ at $10\omega_p$: $-45^\circ$ per decade, $-45^\circ$ right at the corner. A zero does the same with a plus sign.`],
      sol: md`Add one contribution per factor${neg ? ', plus $180^\\circ$ for the negative constant' : ''}:

| Factor | Where $\omega$ is | Straight line | Exact $\pm\tan^{-1}(\omega/\omega_c)$ |
|---|---|---|---|
${rows}

Straight-line total: $${neg ? '180^\\circ + ' : ''}\ldots = {${fd(ans)}}^\circ$. (Exact: ${'$'}{${fd(ex)}}^\circ$; the straight lines are never more than about $6^\circ$ off per factor.)

[[fig:plot]]`,
      figs: { plot: { svg: svg(sp, { show: 'phase', marks: [{ w, n: `\\omega = ${wTeX(w)}` }], pts: [{ w, panel: 'phase' }] }) } },
    };
  };

  // ---- identify H(s) from a drawn magnitude plot
  function sameMag(a, b) {
    const A = tf(a), B = tf(b);
    for (let e = -1; e <= 10; e += 0.25) if (Math.abs(A.asyDb(10 ** e) - B.asyDb(10 ** e)) > 0.5) return false;
    return true;
  }
  GENS.e3_bode_pick = () => {
    const sp = randSpec({ n: ri(2, 3), k: pick([1, 10, 100, 1000]) });
    const all = corners(sp);
    const variants = [];
    // swap one corner's kind (pole <-> zero)
    all.forEach(([c, t]) => {
      const v = JSON.parse(JSON.stringify(sp));
      if (t === 'p') { v.poles = v.poles.filter((x) => x !== c); v.zeros.push(c); } else { v.zeros = v.zeros.filter((x) => x !== c); v.poles.push(c); }
      if (v.poles.length) variants.push([v, 'A zero where the plot has a pole (or the reverse): the slope would turn the other way at that corner.']);
    });
    // move one corner by a decade
    all.forEach(([c, t]) => {
      const v = JSON.parse(JSON.stringify(sp));
      const key = t === 'p' ? 'poles' : 'zeros';
      const nc = c * pick([10, 0.1]);
      if (nc < 1 || nc > 1e9 || all.some(([x]) => near(x, nc, 1e-6))) return;
      v[key] = v[key].map((x) => (x === c ? nc : x));
      variants.push([v, 'One corner is a decade off: read the corner frequencies from where the slope changes.']);
    });
    // wrong constant
    [10, 0.1].forEach((m) => { const v = JSON.parse(JSON.stringify(sp)); v.k = sp.k * m; if (Math.abs(v.k) >= 0.1) variants.push([v, `The low-frequency level is $20\\log_{10}|k|$; this $k$ would put it at $${f(20 * LOG(Math.abs(v.k)), 3)}\\,\\text{dB}$.`]); });
    const opts = [];
    for (const [v, why] of U.shuffle(variants)) {
      if (opts.length >= 3) break;
      v.zeros.sort((a, b) => a - b); v.poles.sort((a, b) => a - b);
      if (sameMag(v, sp) || opts.some(([o]) => sameMag(o, v))) continue;
      opts.push([v, why]);
    }
    const mc = [`$${tex(sp)}$`, ...opts.map(([v]) => `$${tex(v)}$`)];
    return {
      _chk: { kind: 'pick', sp, opts: opts.map((o) => o[0]) },
      q: md`The straight-line magnitude plot below belongs to which transfer function?`,
      figHtml: svg(sp, { exact: false }),
      parts: [{ mc, a: 0, why: [null, ...opts.map(([, w]) => w)] }],
      hints: [md`Read three things: the low-frequency level ($20\log_{10}|k|$), the $\omega$ where the slope changes (the corners), and whether it turns **down** (a pole) or **up** (a zero) there.`],
      sol: md`**Level at the left:** $${f(20 * LOG(Math.abs(sp.k)), 3)}\,\text{dB}$, so $|k| = ${f(Math.abs(sp.k), 4)}$.

**Corners, left to right:** ${all.map(([c, t]) => `at $${wTeX(c)}$ the slope turns ${t === 'p' ? 'down by 20 dB/dec (a **pole**)' : 'up by 20 dB/dec (a **zero**)'}`).join('; ')}.

So $$${tex(sp)}$$`,
    };
  };

  // ---- read numbers off a plot
  GENS.e3_bode_read = () => {
    const sp = randSpec({ n: 2, k: pick([10, 100, 1000]) });
    sp.zeros = []; sp.poles = [];
    const e1 = ri(2, 5), e2 = e1 + ri(1, 3);
    const zeroFirst = Math.random() < 0.3;
    if (zeroFirst) { sp.zeros = [10 ** e2]; sp.poles = [10 ** e1, 10 ** (e2 + ri(1, 2))]; } else sp.poles = [10 ** e1, 10 ** e2];
    const T = tf(sp);
    const cs = corners(sp);
    const parts = [{ lbl: '|k|', unit: 'V/V', ans: Math.abs(sp.k) }, ...cs.map(([c, t], i) => wPart(`\\text{corner ${i + 1} (${t === 'p' ? 'pole' : 'zero'})}`, c))];
    const end = cs[cs.length - 1][0] * 10;
    return {
      _chk: { kind: 'read', sp },
      q: md`Read the straight-line plot: the low-frequency gain $|k|$ (as a ratio), and each corner frequency, from left to right.`,
      figHtml: svg(sp, { exact: false }),
      parts,
      hints: [md`Gain: undo $20\log_{10}$ on the flat level ($40\,\text{dB} \to 100$). Corners: the decade lines where the slope changes.`],
      sol: md`**Flat level:** $${f(20 * LOG(Math.abs(sp.k)), 3)}\,\text{dB} \Rightarrow |k| = 10^{${f(20 * LOG(Math.abs(sp.k)), 3)}/20} = ${f(Math.abs(sp.k), 4)}$.

${cs.map(([c, t], i) => `**Corner ${i + 1}:** the slope changes at $\\omega = ${wTeX(c)}\\,\\text{rad/s}$ and turns ${t === 'p' ? 'more negative by $20\\,\\text{dB/dec}$: a **pole**' : 'up by $20\\,\\text{dB/dec}$: a **zero**'}.`).join('\n\n')}

Check the final slope: $${T.slope(end)}\,\text{dB/dec}$, which is $20\times(${sp.zeros.length} - ${sp.poles.length})$. ✓ So $$${tex(sp)}$$`,
    };
  };

  // ---- one pole from a circuit: the CS stage with a load capacitor
  GENS.e3_f3db = () => {
    const gm = pick([1, 2, 4, 5]) * 1e-3, RD = pick([2, 5, 10, 20]) * 1e3, CL = pick([0.1, 0.2, 0.5, 1, 2]) * 1e-12;
    const withR = Math.random() < 0.5, rds = withR ? pick([20, 50, 100]) * 1e3 : Infinity;
    const R = withR ? par(RD, rds) : RD;
    const A0 = gm * R, wp = 1 / (R * CL), fp = wp / (2 * Math.PI);
    const fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: KO(RD) }], ['w', [1, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'v_{out}', side: 'r' }],
      ['C', [2, 0], [2, 1.2], { n: 'C_L', s: capT(CL) }], ['gnd', [2, 1.2]], ['nmos', [1, 1]], ['gnd', [1, 2]],
      ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
    return {
      _chk: { kind: 'f3db', gm, RD, CL, rds, wp, A0 },
      q: md`Common source, $g_m = ${MS(gm)}$, ${withR ? `$r_{ds} = ${KO(rds)}$` : '$r_{ds}\\to\\infty$'}, $R_D = ${KO(RD)}$, $C_L = ${capT(CL)}$ (ignore the transistor's own capacitances). Find the low-frequency gain in dB, the pole frequency $\omega_p$ and the $-3\,\text{dB}$ bandwidth $f_{3\text{dB}}$ in hertz.`,
      fig,
      parts: [
        { lbl: '|A_v(0)|_{dB}', unit: 'dB', ans: 20 * LOG(A0), tol: { abs: 0.3 }, traps: [{ v: 10 * LOG(A0), msg: 'Voltage gain: $20\\log_{10}$, not $10\\log_{10}$.' }] },
        wPart('\\omega_p', wp, [{ v: 1 / (RD * CL), msg: withR ? 'The resistance at the output node is $R_D\\parallel r_{ds}$, not $R_D$ alone.' : '' }, { v: fp, msg: 'That is $f_p$ in hertz. $\\omega_p$ is in rad/s: $\\omega_p = 2\\pi f_p$.' }].filter((t) => t.msg)),
        fPart('f_{3dB}', fp, [{ v: wp, msg: 'That is $\\omega_p$ in rad/s. In hertz: $f = \\omega/2\\pi$.' }, { v: 1 / (RD * CL) / (2 * Math.PI), msg: 'Use $R_D\\parallel r_{ds}$: $r_{ds}$ is in parallel at the output node.' }].filter((t) => withR || t.v === wp)),
      ],
      hints: [md`At the output node: the resistance to ground is $R_{out} = ${withR ? 'R_D\\parallel r_{ds}' : 'R_D'}$ and the capacitance is $C_L$. One node, one pole: $\omega_p = 1/(R_{out}C_L)$.`],
      sol: md`**Low frequency** ($C_L$ open): $A_v(0) = -g_mR_{out}$ with $R_{out} = ${withR ? `R_D\\parallel r_{ds} = ${KO(R)}` : `R_D = ${KO(R)}`}$:
$$|A_v(0)| = ${f(gm * 1000, 3)}\,\text{mS}\times${KO(R)} = ${f(A0, 4)} \;\Rightarrow\; 20\log_{10}${f(A0, 4)} = ${f(20 * LOG(A0), 3)}\,\text{dB}$$

**With $C_L$:** $R_{out}$ becomes $R_{out}\parallel\dfrac{1}{sC_L}$, so
$$A_v(s) = \frac{-g_mR_{out}}{1 + sR_{out}C_L},\qquad \omega_p = \frac{1}{R_{out}C_L} = \frac{1}{${KO(R)}\times${capT(CL)}} = ${sciW(wp)}$$
$$f_{3\text{dB}} = \frac{\omega_p}{2\pi} = ${sciF(fp)}$$
At $\omega_p$ the gain is down by $\sqrt2$: $|A_v| = ${f(A0 / Math.SQRT2, 3)}$, which is $3\,\text{dB}$ below $${f(20 * LOG(A0), 3)}\,\text{dB}$.`,
    };
  };

  // ================================================================ Unit 14 generators
  // ---- a pole at one node: R seen at the node times C at the node
  GENS.e3_node_pole = () => {
    const kind = pick(['drain', 'gate', 'cg', 'base', 'collector', 'cb']);
    let R, C, fig, what, rule, traps = [], par1 = '', prm = {};
    const RS = pick([0.5, 1, 2, 5]) * 1e3;
    if (kind === 'drain') {
      const RD = pick([5, 10, 20]) * 1e3, rds = pick([50, 100]) * 1e3; C = pick([0.2, 0.5, 1]) * 1e-12; R = par(RD, rds); prm = { RD, rds };
      fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: KO(RD) }], ['w', [1, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'v_{out}' }], ['C', [2, 0], [2, 1.2], { n: 'C_L', s: capT(C) }], ['gnd', [2, 1.2]],
        ['nmos', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
      par1 = `$r_{ds} = ${KO(rds)}$.`;
      what = 'the output (drain) node'; rule = `Looking into the drain (gate driven by an ideal source, source grounded) you see $r_{ds}$, in parallel with $R_D$: $R = ${KO(RD)}\\parallel${KO(rds)} = ${resT(R)}$.`;
      traps = [{ v: 1 / (RD * C), msg: 'Include $r_{ds}$: looking into the drain gives $r_{ds}$, in parallel with $R_D$.' }];
    } else if (kind === 'gate') {
      C = pick([50, 100, 200, 500]) * 1e-15; R = RS;
      fig = [['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_D' }], ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}' }], ['nmos', [3, 1]], ['gnd', [3, 2]],
        ['R', [0.2, 1], [1.4, 1], { n: 'R_S', s: KO(RS) }], ['w', [1.4, 1], [2, 1]], ['C', [1.6, 1], [1.6, 2.2], { n: 'C_{in}', s: capT(C), side: 'l' }], ['gnd', [1.6, 2.2]],
        ['w', [0.2, 1], [-0.4, 1], [-0.4, 1.4]], ['Vac', [-0.4, 1.4], [-0.4, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.4, 2.4]]];
      what = 'the gate node'; rule = `Looking into a gate you see $\\infty$, so the only resistance to (incremental) ground is $R_S$ back through the ideal source: $R = R_S = ${KO(RS)}$.`;
    } else if (kind === 'cg') {
      const gm = pick([2, 5, 10]) * 1e-3; C = pick([0.2, 0.5, 1]) * 1e-12; R = par(RS, 1 / gm); prm = { gm };
      fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['nmos', [1, 1]], ['acg', [0, 1]],
        ['w', [1, 2], [1, 2.3]], ['C', [2.2, 2.3], [2.2, 3.5], { n: 'C_{in}', s: capT(C) }], ['gnd', [2.2, 3.5]], ['w', [1, 2.3], [2.2, 2.3]], ['R', [1, 2.3], [1, 3.5], { n: 'R_S', s: KO(RS), side: 'l' }],
        ['Vac', [1, 3.5], [1, 4.5], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.5]]];
      par1 = `$g_m = ${MS(gm)}$, $r_{ds}\\to\\infty$.`;
      what = 'the source node (the input of this common-gate stage)'; rule = `Two paths to ground: $R_S$ back through the source, and **into the source** of the transistor, which is $1/g_m = ${resT(1 / gm)}$ (gate held). In parallel: $R = R_S\\parallel\\tfrac1{g_m} = ${resT(R)}$.`;
      traps = [{ v: 1 / (RS * C), msg: 'You used $R_S$ alone. The source of the transistor is also at this node, and looking into a source you see $1/g_m$: put it in parallel.' }];
    } else if (kind === 'base') {
      const gm = pick([20, 40, 80]) * 1e-3, beta = 100, rpi = beta / gm; C = pick([2, 5, 10]) * 1e-12; R = par(RS, rpi); prm = { gm, beta, rpi };
      fig = [['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_C' }], ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}' }], ['npn', [3, 1]], ['gnd', [3, 2]],
        ['R', [0.2, 1], [1.4, 1], { n: 'R_S', s: KO(RS) }], ['w', [1.4, 1], [2, 1]], ['C', [1.6, 1], [1.6, 2.2], { n: 'C_\\pi', s: capT(C), side: 'l' }], ['gnd', [1.6, 2.2]],
        ['w', [0.2, 1], [-0.4, 1], [-0.4, 1.4]], ['Vac', [-0.4, 1.4], [-0.4, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.4, 2.4]]];
      par1 = `$g_m = ${MS(gm)}$, $\\beta = 100$ (ignore $C_\\mu$; the emitter is grounded).`;
      what = 'the base node'; rule = `Unlike a gate, a base is **not** an open circuit: looking into the base (emitter grounded) you see $r_\\pi = \\beta/g_m = ${resT(rpi)}$. It is in parallel with $R_S$: $R = ${resT(RS)}\\parallel${resT(rpi)} = ${resT(R)}$. ($C_\\pi$ is drawn from the base to ground here because the emitter is grounded.)`;
      traps = [{ v: 1 / (RS * C), msg: 'A base is not a gate: $r_\\pi$ sits from the base to the (grounded) emitter, in parallel with $R_S$.' }];
    } else if (kind === 'collector') {
      const RC = pick([2, 5, 10]) * 1e3, ro = pick([50, 100]) * 1e3; C = pick([1, 2, 5]) * 1e-12; R = par(RC, ro); prm = { RC, ro };
      fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: KO(RC) }], ['w', [1, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'v_{out}' }], ['C', [2, 0], [2, 1.2], { n: 'C_L', s: capT(C) }], ['gnd', [2, 1.2]],
        ['npn', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
      par1 = `$r_o = ${KO(ro)}$ (ignore $C_\\mu$).`;
      what = 'the collector (output) node'; rule = `Looking into the collector (base driven by an ideal source, emitter grounded) you see $r_o$, in parallel with $R_C$: $R = ${resT(R)}$.`;
      traps = [{ v: 1 / (RC * C), msg: 'Include $r_o$: looking into the collector gives $r_o$, in parallel with $R_C$.' }];
    } else {
      const gm = pick([20, 40]) * 1e-3, beta = 100, rpi = beta / gm; C = pick([2, 5, 10]) * 1e-12; const re = rpi / (beta + 1); R = par(RS, re); prm = { gm, beta, rpi };
      fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['npn', [1, 1]], ['acg', [0, 1]],
        ['w', [1, 2], [1, 2.3]], ['C', [2.2, 2.3], [2.2, 3.5], { n: 'C_\\pi', s: capT(C) }], ['gnd', [2.2, 3.5]], ['w', [1, 2.3], [2.2, 2.3]], ['R', [1, 2.3], [1, 3.5], { n: 'R_S', s: KO(RS), side: 'l' }],
        ['Vac', [1, 3.5], [1, 4.5], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.5]]];
      par1 = `$g_m = ${MS(gm)}$, $\\beta = 100$, $r_o\\to\\infty$. (With the base held, $C_\\pi$ goes from the emitter to incremental ground.)`;
      what = 'the emitter node (the input of this common-base stage)'; rule = `Looking into the emitter with the base held you see $r_\\pi/(\\beta + 1) = ${resT(re)}\\approx 1/g_m$, in parallel with $R_S$: $R = ${resT(R)}$.`;
      traps = [{ v: 1 / (RS * C), msg: 'The emitter of the transistor is at this node too: looking into an emitter you see about $1/g_m$, in parallel with $R_S$.' }];
    }
    const wp = 1 / (R * C);
    return {
      _chk: { kind: 'node', node: kind, R, C, wp, RS, prm },
      q: md`${par1} Find the pole that the capacitor at ${what} makes: $\omega_p$ in rad/s.`,
      fig,
      parts: [wPart('\\omega_p', wp, traps.concat([{ v: wp / (2 * Math.PI), msg: 'That is $f_p$ in hertz; the box asks for $\\omega_p$ in rad/s.' }]))],
      hints: [md`One node, one pole: $\omega_p = \dfrac{1}{R\,C}$, where $R$ is the **total resistance from that node to (incremental) ground** with the input source zeroed, and $C$ the capacitance there.`, md`Find $R$ exactly as in Exam 2: everything that touches the node, in parallel. A gate adds nothing ($\infty$), a source or emitter adds about $1/g_m$, a drain adds $r_{ds}$, a base adds $r_\pi$.`],
      sol: md`**Rule (Lecture 28):** $\omega_p = \dfrac{1}{(\text{resistance seen at the node to ground})\times(\text{capacitance at the node})}$, with the input source set to zero.

**The resistance.** ${rule}

**The pole.**
$$\omega_p = \frac{1}{${resT(R)}\times${capT(C)}} = ${sciW(wp)}\qquad (f_p = ${sciF(wp / (2 * Math.PI))})$$`,
    };
  };

  // ---- Miller's theorem
  GENS.e3_miller = () => {
    const A = pick([5, 9, 10, 19, 20, 49, 50, 99]), CF = pick([10, 20, 50, 100, 200]) * 1e-15;
    const Cin = (1 + A) * CF, Cout = (1 + 1 / A) * CF;
    const fig = [['term', [0, 1], { n: 'v_{in}', side: 'l' }], ['w', [0, 1], [1, 1]], ['box', [1, 0.4], [2.6, 1.6], { n: '$-A_0$' }], ['w', [2.6, 1], [3.6, 1]], ['term', [3.6, 1], { n: 'v_{out}', side: 'r' }],
      ['w', [0.5, 1], [0.5, -0.3]], ['C', [0.5, -0.3], [3.1, -0.3], { n: 'C_F', s: capT(CF) }], ['w', [3.1, -0.3], [3.1, 1]]];
    return {
      _chk: { kind: 'miller', A, CF, Cin, Cout },
      q: md`An ideal inverting amplifier with gain $-A_0 = -${A}$ has a capacitor $C_F = ${capT(CF)}$ connected from its input to its output. Replace $C_F$ by its Miller equivalents: the capacitance to ground at the input and at the output.`,
      fig,
      parts: [cPart('C_{in}', Cin, [{ v: A * CF, msg: 'Close: it is $(1 + A_0)C_F$, not $A_0C_F$. The voltage across $C_F$ is $v_{in} - v_{out} = (1 + A_0)v_{in}$.' }, { v: CF, msg: 'That ignores the gain. The output swings $A_0$ times the input the other way, so $C_F$ carries $(1 + A_0)$ times the current.' }, { v: (1 - A) * CF, msg: 'Sign: the gain is $-A_0$, so $1 - A_v = 1 + A_0$.' }]),
        cPart('C_{out}', Cout, [{ v: (1 + A) * CF, msg: 'The output side gets $(1 + 1/A_0)C_F$, close to $C_F$: the output barely notices the input moving.' }])],
      hints: [md`Miller: $Z_1 = \dfrac{Z_F}{1 - A_v}$ and $Z_2 = \dfrac{Z_F}{1 - 1/A_v}$ with $A_v = v_{out}/v_{in} = -A_0$. A capacitor's impedance is $1/(sC)$, so dividing $Z$ by a number multiplies $C$ by it.`],
      sol: md`**Why it happens.** When $v_{in}$ rises by $1\,\text{mV}$, $v_{out}$ falls by $${A}\,\text{mV}$. The capacitor sees $${1 + A}\,\text{mV}$ across it, so it draws $${1 + A}$ times the current a grounded $C_F$ would. From the input, it **looks like** $(1 + A_0)C_F$ to ground.

**Formulas (Lecture 28):** with $A_v = -A_0$,
$$C_{in} = C_F(1 - A_v) = (1 + A_0)C_F = ${1 + A}\times${capT(CF)} = ${capT(Cin)}$$
$$C_{out} = C_F\Big(1 - \frac{1}{A_v}\Big) = \Big(1 + \frac1{A_0}\Big)C_F = ${capT(Cout)}\approx C_F$$

**Recognize it:** a capacitor **bridging the input and output of an inverting gain stage** gets multiplied by $(1 + |\text{gain}|)$ at the input. That is $C_{gd}$ in a common source and $C_\mu$ in a common emitter.`,
    };
  };

  // ---- the CS / CE stage with Miller: two poles
  function stageFig(bjt, v) {
    const dev = bjt ? 'npn' : 'nmos';
    const n = (a, b) => (bjt ? b : a);
    return [
      ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [-0.6, 1.4], [-0.6, 1]],
      ['R', [-0.6, 1], [0.8, 1], { n: 'R_S', s: v.RS }], ['w', [0.8, 1], [2, 1]],
      ['C', [1.4, 1], [1.4, 2.2], { n: n('C_{gs}', 'C_\\pi'), s: v.C1, side: 'l' }], ['gnd', [1.4, 2.2]],
      ['w', [1.4, 1], [1.4, -0.4]], ['C', [1.4, -0.4], [3, -0.4], { n: n('C_{gd}', 'C_\\mu'), s: v.C2 }], ['w', [3, -0.4], [3, 0]],
      [dev, [3, 1]], ['gnd', [3, 2]],
      ['R', [3, -1.7], [3, -0.4], { n: n('R_L', 'R_L'), s: v.RL }], ['rail', [3, -1.7]],
      ['w', [3, -0.4], [4.8, -0.4]], ['term', [4.8, -0.4], { n: 'v_{out}' }],
      ['C', [4.2, -0.4], [4.2, 0.8], { n: 'C_L', s: v.CL }], ['gnd', [4.2, 0.8]],
    ];
  }
  function stageNums(bjt) {
    if (bjt) {
      const gm = pick([20, 40]) * 1e-3, beta = 100, rpi = beta / gm;
      return { bjt, gm, beta, rpi, RS: pick([0.5, 1, 2]) * 1e3, RL: pick([1, 2, 5]) * 1e3, C1: pick([5, 10, 20]) * 1e-12, C2: pick([0.5, 1, 2]) * 1e-12, CL: pick([1, 2, 5]) * 1e-12 };
    }
    return { bjt, gm: pick([2, 4, 5]) * 1e-3, RS: pick([1, 2, 5, 10]) * 1e3, RL: pick([5, 10, 20]) * 1e3, C1: pick([100, 200, 500]) * 1e-15, C2: pick([10, 20, 50]) * 1e-15, CL: pick([0.1, 0.2, 0.5, 1]) * 1e-12 };
  }
  function millerPoles(v) {
    const RTH = v.bjt ? par(v.RS, v.rpi) : v.RS;
    const A = v.gm * v.RL;
    const Cmi = (1 + A) * v.C2, Cmo = (1 + 1 / A) * v.C2;
    const win = 1 / (RTH * (v.C1 + Cmi)), wout = 1 / (v.RL * (v.CL + Cmo));
    return { RTH, A, Cmi, Cmo, win, wout };
  }
  function millerGen(bjt) {
    return () => {
      const v = stageNums(bjt);
      const M = millerPoles(v);
      const c1 = bjt ? 'C_\\pi' : 'C_{gs}', c2 = bjt ? 'C_\\mu' : 'C_{gd}';
      const lim = M.win < M.wout ? 0 : 1;
      const rthLine = bjt ? `$R_{TH} = R_S\\parallel r_\\pi$, because the base is not an open circuit: $r_\\pi = \\beta/g_m = ${resT(v.rpi)}$, so $R_{TH} = ${resT(v.RS)}\\parallel${resT(v.rpi)} = ${resT(M.RTH)}$.` : `$R_{TH} = R_S = ${resT(v.RS)}$ (looking into the gate adds nothing).`;
      return {
        _chk: { kind: bjt ? 'ce_miller' : 'cs_miller', v, M },
        q: md`${bjt ? 'Common emitter' : 'Common source'}: $g_m = ${MS(v.gm)}$${bjt ? `, $\\beta = 100$` : ''}, ${bjt ? '$r_o\\to\\infty$' : '$r_{ds}\\to\\infty$'}, $R_S = ${resT(v.RS)}$, $R_L = ${resT(v.RL)}$, $${c1} = ${capT(v.C1)}$, $${c2} = ${capT(v.C2)}$, $C_L = ${capT(v.CL)}$. Use Miller's approximation (gain $-g_mR_L$ across $${c2}$). Find the Miller capacitance at the input, the input pole and the output pole.`,
        fig: stageFig(bjt, { RS: resT(v.RS), RL: resT(v.RL), C1: capT(v.C1), C2: capT(v.C2), CL: capT(v.CL) }),
        parts: [
          cPart(`(1 + g_mR_L)${c2}`, M.Cmi, [{ v: v.gm * v.RL * v.C2, msg: 'Miller factor is $1 + g_mR_L$, not $g_mR_L$.' }, { v: v.C2, msg: 'The input side sees $' + c2 + '$ multiplied by $1 + g_mR_L$.' }]),
          wPart('\\omega_{p,in}', M.win, [{ v: 1 / (M.RTH * v.C1), msg: `You left out the Miller capacitance. $${c2}$ looks like $(1 + g_mR_L)${c2}$ from the input, and it adds to $${c1}$.` }, ...(bjt ? [{ v: 1 / (v.RS * (v.C1 + M.Cmi)), msg: 'At a base the resistance is $R_S\\parallel r_\\pi$, not $R_S$: the base draws current through $r_\\pi$.' }] : [])]),
          wPart('\\omega_{p,out}', M.wout, [{ v: 1 / (v.RL * v.CL), msg: `$${c2}$ also loads the output, as $(1 + 1/g_mR_L)${c2}\\approx${c2}$: add it to $C_L$.` }, { v: 1 / (v.RL * (v.CL + M.Cmi)), msg: 'The output side gets $(1 + 1/(g_mR_L))C$, not the big Miller factor.' }]),
          { lbl: 'Which pole sets the bandwidth?', mc: ['The input pole (it is lower)', 'The output pole (it is lower)'], a: lim, why: [lim === 1 ? 'Compare the two numbers: the output pole is the lower one here.' : null, lim === 0 ? 'Compare the two numbers: the input pole is the lower one here.' : null] },
        ],
        hints: [md`Miller splits $${c2}$ into $(1 + g_mR_L)${c2}$ at the input and $(1 + \tfrac1{g_mR_L})${c2}$ at the output. Then each node is a simple $1/RC$.`, md`Input node: ${bjt ? '$R_S\\parallel r_\\pi$' : '$R_S$'} with $${c1} + (1 + g_mR_L)${c2}$. Output node: $R_L$ with $C_L + (1 + \tfrac1{g_mR_L})${c2}$.`],
        sol: md`**Gain across the bridging capacitor.** $g_mR_L = ${MS(v.gm)}\times${resT(v.RL)} = ${f(M.A, 4)}$, so the stage gain is $-${f(M.A, 4)}$.

**Miller split of $${c2}$.**
$$C_{M,in} = (1 + g_mR_L)${c2} = ${f(1 + M.A, 4)}\times${capT(v.C2)} = ${capT(M.Cmi)},\qquad C_{M,out} = \Big(1 + \frac1{g_mR_L}\Big)${c2} = ${capT(M.Cmo)}$$

**Input node.** ${rthLine}
$$\omega_{p,in} = \frac{1}{R_{TH}\,[${c1} + (1 + g_mR_L)${c2}]} = \frac{1}{${resT(M.RTH)}\times${capT(v.C1 + M.Cmi)}} = ${sciW(M.win)}$$

**Output node.** $R_L$ (the ${bjt ? 'collector' : 'drain'} adds ${bjt ? '$r_o\\to\\infty$' : '$r_{ds}\\to\\infty$'}):
$$\omega_{p,out} = \frac{1}{R_L\,[C_L + (1 + \tfrac1{g_mR_L})${c2}]} = \frac{1}{${resT(v.RL)}\times${capT(v.CL + M.Cmo)}} = ${sciW(M.wout)}$$

**Bandwidth.** The lower pole dominates: ${lim === 0 ? 'the input' : 'the output'} pole, $${sciW(Math.min(M.win, M.wout))}$ ($f_{3\text{dB}}\approx${sciF(Math.min(M.win, M.wout) / (2 * Math.PI))}$). ${M.Cmi > 3 * v.C1 ? `Notice the Miller capacitance ($${capT(M.Cmi)}$) is ${f(M.Cmi / v.C1, 2)} times $${c1}$ itself: a small bridging capacitor in a high-gain inverting stage dominates the input.` : ''}`,
      };
    };
  }
  GENS.e3_cs_miller = millerGen(false);
  GENS.e3_ce_miller = millerGen(true);

  // ---- the exact two-node CS model: zero, dominant pole, second pole
  GENS.e3_cs_exact = () => {
    const bjt = Math.random() < 0.35;
    const v = stageNums(bjt);
    const RTH = bjt ? par(v.RS, v.rpi) : v.RS, RL = v.RL, Cin = v.C1, Cxy = v.C2, Cout = v.CL, gm = v.gm;
    const a = RTH * RL * (Cin * Cxy + Cout * Cxy + Cin * Cout);
    const b = (1 + gm * RL) * Cxy * RTH + RTH * Cin + RL * (Cxy + Cout);
    const wp1 = 1 / b, wp2 = b / a, wz = gm / Cxy;
    const disc = Math.sqrt(b * b - 4 * a);
    const r1 = (b - disc) / (2 * a), r2 = (b + disc) / (2 * a);     // exact |poles|: roots of a s^2 + b s + 1
    const c1 = bjt ? 'C_\\pi' : 'C_{gs}', c2 = bjt ? 'C_\\mu' : 'C_{gd}';
    const p1 = wPart('\\omega_{p1}', wp1, [{ v: 1 / (RTH * (Cin + Cxy)), msg: 'The $C_{xy}$ term carries the factor $(1 + g_mR_L)$: that is the Miller effect showing up inside $b$.' }]);
    p1.accept = [r1 / (wp1 >= 1e9 ? 1e9 : wp1 >= 1e6 ? 1e6 : wp1 >= 1e3 ? 1e3 : 1)];
    const p2 = wPart('\\omega_{p2}', wp2);
    p2.accept = [r2 / (wp2 >= 1e9 ? 1e9 : wp2 >= 1e6 ? 1e6 : wp2 >= 1e3 ? 1e3 : 1)];
    return {
      _chk: { kind: 'exact', RTH, RL, Cin, Cxy, Cout, gm, a, b, wp1, wp2, wz, r1, r2 },
      q: md`The ${bjt ? 'common-emitter' : 'common-source'} stage reduced to the lecture's two-node model: $R_{TH} = ${resT(RTH)}$${bjt ? ` (that is $R_S\\parallel r_\\pi$)` : ''}, $C_{in} = ${c1} = ${capT(Cin)}$, $C_{xy} = ${c2} = ${capT(Cxy)}$, $C_{out} = ${capT(Cout)}$, $R_L = ${resT(RL)}$, $g_m = ${MS(gm)}$. With $H(s) = \dfrac{(sC_{xy} - g_m)R_L}{as^2 + bs + 1}$, find $b$, the dominant-pole estimate $\omega_{p1}\approx 1/b$, $\omega_{p2}\approx b/a$, and the zero $\omega_z$.`,
      fig: [
        ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{TH}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [-0.6, 1.4], [-0.6, 1]],
        ['R', [-0.6, 1], [0.8, 1], { n: 'R_{TH}' }], ['w', [0.8, 1], [1.6, 1]], ['node', [1.2, 1], { n: 'X', side: 'a' }],
        ['C', [1.2, 1], [1.2, 2.2], { n: 'C_{in}', side: 'l' }], ['gnd', [1.2, 2.2]],
        ['w', [1.6, 1], [1.6, -0.2]], ['C', [1.6, -0.2], [3, -0.2], { n: 'C_{xy}' }], ['w', [3, -0.2], [3, 0.4]],
        ['G', [3, 0.4], [3, 2.2], { n: 'g_mv_X', side: 'l' }], ['gnd', [3, 2.2]], ['w', [3, -0.2], [5.4, -0.2]], ['node', [3.6, -0.2], { n: 'Y', side: 'a' }],
        ['C', [4, -0.2], [4, 1], { n: 'C_{out}' }], ['gnd', [4, 1]], ['R', [4.8, -0.2], [4.8, 1], { n: 'R_L' }], ['gnd', [4.8, 1]], ['term', [5.4, -0.2], { n: 'v_{out}' }],
      ],
      parts: [
        { lbl: 'b', unit: 'ns', ans: b * 1e9, traps: [{ v: (Cxy * RTH + RTH * Cin + RL * (Cxy + Cout)) * 1e9, msg: 'The $C_{xy}R_{TH}$ term is multiplied by $(1 + g_mR_L)$.' }] },
        p1, p2,
        wPart('\\omega_z', wz, [{ v: 1 / (RL * Cxy), msg: 'The zero is where $sC_{xy} = g_m$: $\\omega_z = g_m/C_{xy}$, no resistor.' }]),
      ],
      hints: [md`$b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$ and $a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out})$.`, md`If $\omega_{p2}\gg\omega_{p1}$: $as^2 + bs + 1 \approx (1 + s/\omega_{p1})(1 + s/\omega_{p2})$ with $b\approx1/\omega_{p1}$ and $a = 1/(\omega_{p1}\omega_{p2})$.`],
      sol: md`**The coefficients.** $g_mR_L = ${f(gm * RL, 4)}$.
$$b = \underbrace{(1 + g_mR_L)C_{xy}R_{TH}}_{${f((1 + gm * RL) * Cxy * RTH * 1e9, 3)}\,\text{ns}} + \underbrace{R_{TH}C_{in}}_{${f(RTH * Cin * 1e9, 3)}\,\text{ns}} + \underbrace{R_L(C_{xy} + C_{out})}_{${f(RL * (Cxy + Cout) * 1e9, 3)}\,\text{ns}} = ${f(b * 1e9, 4)}\,\text{ns}$$
$$a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out}) = ${f(a * 1e18, 4)}\,\text{ns}^2$$

**Dominant pole.** $\omega_{p1}\approx 1/b = ${sciW(wp1)}$. **Second pole.** $\omega_{p2}\approx b/a = ${sciW(wp2)}$. They are ${f(wp2 / wp1, 3)} times apart, so the approximation is ${wp2 / wp1 > 10 ? 'good' : 'rough (the poles are not far apart)'}: the exact roots of $as^2 + bs + 1$ are $${sciW(r1)}$ and $${sciW(r2)}$.

**Zero.** The numerator $(sC_{xy} - g_m)$ vanishes at $s = +g_m/C_{xy}$: $\omega_z = ${sciW(wz)}$, in the **right half plane** (the direct path through $C_{xy}$ fights the inverted path through $g_m$). It is far above both poles, so it barely matters.

**Recognize the biggest term in $b$:** the $(1 + g_mR_L)C_{xy}R_{TH}$ term is the Miller-multiplied bridging capacitor seen from the input. That is why Miller's shortcut usually lands close to $\omega_{p1}$.`,
    };
  };

  // ---- which node sets the bandwidth (recognition, MC)
  GENS.e3_bw_node = () => {
    const bjt = Math.random() < 0.5;
    const v = stageNums(bjt);
    if (Math.random() < 0.5) v.RS *= 10;        // a big source resistance: the input is usually the slow node
    const M = millerPoles(v);
    const ratio = M.win / M.wout;
    const a = Math.abs(LOG(ratio)) < 0.15 ? 2 : (ratio < 1 ? 0 : 1);
    const c1 = bjt ? 'C_\\pi' : 'C_{gs}', c2 = bjt ? 'C_\\mu' : 'C_{gd}';
    return {
      _chk: { kind: 'bw', v, M, a },
      q: md`${bjt ? 'Common emitter' : 'Common source'}: $g_m = ${MS(v.gm)}$${bjt ? ', $\\beta = 100$' : ''}, $R_S = ${resT(v.RS)}$, $R_L = ${resT(v.RL)}$, $${c1} = ${capT(v.C1)}$, $${c2} = ${capT(v.C2)}$, $C_L = ${capT(v.CL)}$. Which node limits the bandwidth? Estimate with Miller, without a calculator if you can: compare the two $RC$ products.`,
      fig: stageFig(bjt, { RS: resT(v.RS), RL: resT(v.RL), C1: capT(v.C1), C2: capT(v.C2), CL: capT(v.CL) }),
      parts: [{ mc: ['The input node (gate/base side)', 'The output node (drain/collector side)', 'Both about the same (within a factor of 1.4)'], a, why: [
        a === 0 ? null : `Input: $\\tau_{in} = R_{TH}[${c1} + (1 + g_mR_L)${c2}] = ${f(1 / M.win * 1e9, 3)}\\,\\text{ns}$; output: $\\tau_{out} = ${f(1 / M.wout * 1e9, 3)}\\,\\text{ns}$. The bigger time constant is the slower node.`,
        a === 1 ? null : `Input: $\\tau_{in} = ${f(1 / M.win * 1e9, 3)}\\,\\text{ns}$; output: $\\tau_{out} = R_L[C_L + ${c2}] = ${f(1 / M.wout * 1e9, 3)}\\,\\text{ns}$. The bigger time constant is the slower node.`,
        a === 2 ? null : `They are ${f(Math.max(ratio, 1 / ratio), 2)}× apart, not close.`] }],
      hints: [md`Slow node = big time constant $\tau = RC$. Input: $R_{TH}$ times $${c1}$ plus the Miller-multiplied $${c2}$. Output: $R_L$ times $C_L + ${c2}$.`],
      sol: md`$g_mR_L = ${f(M.A, 4)}$. ${bjt ? `$R_{TH} = R_S\\parallel r_\\pi = ${resT(v.RS)}\\parallel${resT(v.rpi)} = ${resT(M.RTH)}$.` : `$R_{TH} = R_S = ${resT(v.RS)}$.`}

$$\tau_{in} = R_{TH}\,[${c1} + (1 + g_mR_L)${c2}] = ${resT(M.RTH)}\times${capT(v.C1 + M.Cmi)} = ${f(1 / M.win * 1e9, 3)}\,\text{ns}$$
$$\tau_{out} = R_L\,[C_L + (1 + \tfrac1{g_mR_L})${c2}] = ${resT(v.RL)}\times${capT(v.CL + M.Cmo)} = ${f(1 / M.wout * 1e9, 3)}\,\text{ns}$$

The bigger $\tau$ is the lower pole, and the lower pole sets the bandwidth: **${['the input node', 'the output node', 'both, about equally'][a]}**. Recognize the pattern: a big source resistance plus Miller makes the input slow; a big load capacitance or a big $R_L$ makes the output slow.`,
    };
  };

  // ---- which capacitor gets Miller-multiplied (recognition, MC)
  const MW = {
    cs: { t: 'common source', bjt: false, a: 0, say: '$C_{gd}$ bridges the gate (input) and the drain (output), and the stage inverts with gain $-g_mR_D$: it becomes $(1 + g_mR_D)C_{gd}$ at the input.' },
    ce: { t: 'common emitter', bjt: true, a: 0, say: '$C_\\mu$ bridges the base (input) and the collector (output) of an inverting stage with gain $-g_mR_C$: it becomes $(1 + g_mR_C)C_\\mu$ at the input.' },
    cg: { t: 'common gate', bjt: false, a: 2, say: 'The input is the source and the output is the drain. $C_{gd}$ goes from the drain to the gate, which is **incremental ground**: it is just a capacitor from the output to ground. $C_{gs}$ is from the input to ground. Nothing bridges input and output, so no Miller multiplication. This is why common gate/base stages are fast.' },
    cb: { t: 'common base', bjt: true, a: 2, say: 'Input at the emitter, output at the collector. $C_\\mu$ goes from the collector to the base, which is held (incremental ground): just a capacitor at the output. No bridging capacitor, no Miller multiplication.' },
    cd: { t: 'source follower', bjt: false, a: 3, say: '$C_{gs}$ does bridge the input (gate) and output (source), but the gain is about $+1$, not large and inverting. The Miller factor is $1 - A_v\\approx 0$: the source follows the gate, so $C_{gs}$ almost disappears from the input. $C_{gd}$ goes from the gate to $V_{DD}$ (ground), unmultiplied.' },
    cc: { t: 'emitter follower', bjt: true, a: 3, say: '$C_\\pi$ bridges the base (input) and emitter (output), but the gain is about $+1$, so the Miller factor $1 - A_v$ is near zero: $C_\\pi$ is "bootstrapped" away. $C_\\mu$ goes from the base to the supply (ground), unmultiplied.' },
    cas: { t: 'cascode (input device)', bjt: false, a: 4, say: '$C_{gd1}$ still bridges $M_1$\'s gate and drain, but $M_1$\'s drain is the low-resistance source of $M_2$ (about $1/g_{m2}$). The gain from the input to that node is only about $-g_{m1}/g_{m2}\\approx -1$, so $C_{gd1}$ becomes about $2C_{gd1}$, not $(1 + g_mR_L)C_{gd1}$. That is why cascodes are fast.' },
  };
  GENS.e3_miller_which = () => {
    const k = pick(Object.keys(MW));
    const M = MW[k];
    const opts = [
      M.bjt ? '$C_\\mu$, multiplied by about $(1 + g_mR_C)$' : '$C_{gd}$, multiplied by about $(1 + g_mR_D)$',
      M.bjt ? '$C_\\pi$, multiplied by about $(1 + g_mR_C)$' : '$C_{gs}$, multiplied by about $(1 + g_mR_D)$',
      'None: no capacitor bridges the input and the output',
      'The bridging capacitor almost vanishes (gain near $+1$)',
      'The bridging capacitor is only about doubled (gain near $-1$)',
    ];
    let fig;
    if (k === 'cs' || k === 'ce') fig = (M.bjt ? E3F.ce : E2F.cs)();
    else if (k === 'cg' || k === 'cb') fig = (M.bjt ? E3F.cb : E2F.cg)(false);
    else if (k === 'cd' || k === 'cc') fig = (M.bjt ? E3F.cc : E2F.cd)();
    else fig = E2F.cascode();
    return {
      _chk: { kind: 'mwhich', k },
      q: md`${/^[aeiou]/.test(M.t) ? 'An' : 'A'} ${M.t} stage (high-frequency model: ${M.bjt ? '$C_\\pi$ base–emitter, $C_\\mu$ base–collector' : '$C_{gs}$ gate–source, $C_{gd}$ gate–drain'}). What happens to the capacitor between input and output at the input node?`,
      fig,
      parts: [{ mc: opts, a: M.a, why: opts.map((_, j) => (j === M.a ? null : [
        'That is the common source / common emitter: input on the gate/base, output on the drain/collector, inverting gain.',
        'The input-to-output bridge in a CS/CE is the gate–drain (base–collector) capacitor, not gate–source.',
        'Check whether some capacitor touches both the input node and the output node.',
        'That is the follower: the bridging capacitor sees a gain near $+1$.',
        'That is the cascode input device, whose drain sees only about $1/g_m$.',
      ][j])) }],
      hints: [md`Find the input node and the output node first. Then ask: does a transistor capacitor connect **those two nodes**? If yes, multiply it by $1 - A_v$ (the gain between them).`],
      sol: md`${M.say}

**The rule:** a capacitor $C$ between two nodes with gain $A_v$ from the first to the second looks like $(1 - A_v)C$ from the first node. Big inverting gain ($A_v = -A$): about $(1 + A)C$, huge. Gain $\approx -1$: about $2C$. Gain $\approx +1$: about $0$. No capacitor between the two nodes: no Miller effect at all.`,
    };
  };
})();

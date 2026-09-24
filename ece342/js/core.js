/* core.js — shared utilities and the course registry.
   Loaded first; content files call C.unit(...) to register themselves. */
(function () {
  'use strict';

  const U = {};

  U.rand = (a, b) => a + Math.random() * (b - a);
  U.ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Plain number formatting: up to `sig` significant digits, no trailing zeros.
  U.fmt = (x, sig = 4) => {
    if (x === undefined || x === null || Number.isNaN(x)) return '?';
    if (!isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
    if (Math.abs(x) < 1e-24) return '0';
    const ax = Math.abs(x);
    if (ax >= 1e-4 && ax < 1e7) {
      let s = (+x.toPrecision(sig)).toString();
      if (s.includes('e')) s = (+x.toPrecision(sig)).toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
      return s;
    }
    const e = Math.floor(Math.log10(ax));
    const m = +(x / Math.pow(10, e)).toPrecision(sig);
    return `${m}\\times10^{${e}}`;
  };

  // Engineering (SI-prefix) formatting, returned as TeX.
  const UNIT_TEX = {
    V: '\\text{V}', A: '\\text{A}', 'Ω': '\\Omega', S: '\\text{S}',
    'A/V': '\\text{A/V}', 'A/V2': '\\text{A/V}^2', W: '\\text{W}',
  };
  const PREFIX = [
    [1e6, '\\text{M}'], [1e3, '\\text{k}'], [1, ''], [1e-3, '\\text{m}'],
    [1e-6, '\\mu'], [1e-9, '\\text{n}'], [1e-12, '\\text{p}'],
  ];
  U.si = (x, unit, sig = 4) => {
    const ut = UNIT_TEX[unit] ?? `\\text{${unit}}`;
    if (!isFinite(x)) return `${U.fmt(x)}\\,${ut}`;
    if (Math.abs(x) < 1e-15) return `0\\,${ut}`;
    const ax = Math.abs(x);
    let [scale, p] = PREFIX[PREFIX.length - 1];
    for (const [s, pp] of PREFIX) { if (ax >= s * 0.9995) { scale = s; p = pp; break; } }
    return `${U.fmt(x / scale, sig)}\\,${p}${ut}`;
  };
  U.ohm = (x) => U.si(x, 'Ω');
  U.volt = (x) => U.si(x, 'V');
  U.amp = (x) => U.si(x, 'A');

  // Nice resistor values (E-series mantissas) inside [lo, hi].
  U.E = [1, 1.2, 1.5, 2, 2.2, 2.5, 3, 3.3, 4, 4.7, 5, 6, 6.8, 8];
  U.niceR = (lo, hi) => {
    const opts = [];
    for (let dec = 1; dec <= 1e6; dec *= 10) for (const m of U.E) {
      const v = m * dec;
      if (v >= lo && v <= hi) opts.push(v);
    }
    return U.pick(opts);
  };

  U.par = (...r) => 1 / r.reduce((s, x) => s + 1 / x, 0);
  U.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  window.U = U;

  // ------------------------------------------------------------------
  // Course registry. Content files push units in order.
  window.COURSE = { units: [] };

  window.C = {
    unit(u) { COURSE.units.push(u); return u; },
    R(mdText, fig, after) { return { t: 'read', md: mdText, fig, after }; },
    P(p) { return Object.assign({ t: 'prob' }, p); },
    G(name, opts = {}) { return { t: 'gen', name, need: opts.need ?? 3, opts }; },
  };

  // Tag for content: keeps backslashes literal so TeX can be written naturally.
  window.md = String.raw;
})();

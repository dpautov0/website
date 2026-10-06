/* semi.js — constants and small formulas used across the ECE 340 lessons and drills.
   One place for every number the site assumes. Problems always state the values they use, so a different table in
   class never makes an answer wrong; change a value here and every lesson, drill and solution follows. */
(function () {
  'use strict';

  const S = {
    q: 1.6e-19,            // C
    k: 8.62e-5,            // eV/K
    kT: 0.0259,            // eV at 300 K (kT/q = 0.0259 V)
    h: 6.63e-34,           // J·s
    hbar: 1.055e-34,       // J·s
    m0: 9.11e-31,          // kg
    eps0: 8.85e-14,        // F/cm
    c: 3e8,                // m/s
    // 300 K values used on this site (Streetman & Banerjee 7e, Appendix III style). ni(Si) is the one to confirm in class.
    mat: {
      Si: { name: 'Si', Eg: 1.11, ni: 1e10, Nc: 2.8e19, Nv: 1.04e19, mun: 1350, mup: 480, er: 11.8, a: 5.43, gap: 'indirect' },
      Ge: { name: 'Ge', Eg: 0.67, ni: 2.5e13, Nc: 1.04e19, Nv: 6.0e18, mun: 3900, mup: 1900, er: 16, a: 5.65, gap: 'indirect' },
      GaAs: { name: 'GaAs', Eg: 1.43, ni: 2e6, Nc: 4.7e17, Nv: 7.0e18, mun: 8500, mup: 400, er: 13.2, a: 5.65, gap: 'direct' },
    },
  };

  // kT in eV at temperature T (K)
  S.kTat = (T) => S.k * T;
  // n0 in a sample with donors and acceptors (all ionized), from charge neutrality and n0 p0 = ni²
  S.n0 = (Nd, Na, ni) => { const h = (Nd - Na) / 2; return h >= 0 ? h + Math.sqrt(h * h + ni * ni) : (ni * ni) / (-h + Math.sqrt(h * h + ni * ni)); };
  S.p0 = (Nd, Na, ni) => (ni * ni) / S.n0(Nd, Na, ni);
  // carrier from Fermi level position (eV): n = ni e^{(EF-Ei)/kT}
  S.nFromEF = (dE, ni, kT = S.kT) => ni * Math.exp(dE / kT);
  S.ln = Math.log;

  // ---------------------------------------------------------------- number formatting (TeX), 3 significant figures
  // Scientific notation outside [0.01, 10⁴): 2.25×10³ stays 2250, 1.5×10¹⁰ is written that way.
  S.f = (x, sig = 3) => {
    if (x === 0) return '0';
    if (!isFinite(x)) return '\\infty';
    const ax = Math.abs(x);
    if (ax >= 0.01 && ax < 1e4) {
      return ax >= Math.pow(10, sig) ? String(+x.toPrecision(sig)) : x.toPrecision(sig);   // 2250, 0.300, 41.7
    }
    let e = Math.floor(Math.log10(ax));
    let m = +(x / Math.pow(10, e)).toFixed(sig - 1);
    if (Math.abs(m) >= 10) { m /= 10; e += 1; }
    const ms = m.toFixed(sig - 1);
    return `${ms}\\times10^{${e}}`;
  };
  // same, keeping trailing zeros (answers to exactly 3 s.f., as graded)
  S.g = (x) => S.f(x, 3);
  // a plain short number for problem statements (no trailing zeros): 1e16 -> 10^{16}, 2.5e15 -> 2.5×10^{15}
  S.p = (x) => {
    if (x === 0) return '0';
    const ax = Math.abs(x);
    if (ax >= 0.01 && ax < 1e4) return String(+x.toPrecision(4));
    const e = Math.floor(Math.log10(ax) + 1e-9);
    const m = +(x / Math.pow(10, e)).toPrecision(4);
    return m === 1 ? `10^{${e}}` : m === -1 ? `-10^{${e}}` : `${m}\\times10^{${e}}`;
  };

  // nice random values
  S.dop = (lo = 14, hi = 18) => { const e = U.ri(lo, hi - 1); return U.pick([1, 2, 3, 5]) * Math.pow(10, e); };
  S.mant = () => U.pick([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]);

  window.S = S;
})();

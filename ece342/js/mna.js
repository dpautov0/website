/* mna.js — modified nodal analysis for linear circuits.
   Element shapes (node names are strings, '0' is ground):
     {type:'R', a, b, val}                  resistor (ohms)
     {type:'I', a, b, val}                  current source, val flows a -> b through the source
     {type:'V', a, b, val}                  voltage source, V(a) - V(b) = val
     {type:'G', a, b, gain, ca, cb}         VCCS, gain*(V(ca)-V(cb)) flows a -> b through the source
     {type:'E', a, b, gain, ca, cb}         VCVS, V(a) - V(b) = gain*(V(ca)-V(cb))
   Answers in this site are computed from the same netlist that draws the figure. */
(function () {
  'use strict';

  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (Math.abs(M[piv][c]) < 1e-15) return null;
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        if (f === 0) continue;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((row, i) => row[n] / row[i]);
  }

  function mna(elements) {
    const nodes = new Map();
    const idx = (n) => {
      if (n === '0' || n === 0) return -1;
      if (!nodes.has(n)) nodes.set(n, nodes.size);
      return nodes.get(n);
    };
    elements.forEach((e) => { idx(e.a); idx(e.b); if (e.ca !== undefined) { idx(e.ca); idx(e.cb); } });
    const vsrc = elements.filter((e) => e.type === 'V' || e.type === 'E');
    const N = nodes.size, M = vsrc.length, S = N + M;
    const A = Array.from({ length: S }, () => new Array(S).fill(0));
    const z = new Array(S).fill(0);
    const add = (r, c, v) => { if (r >= 0 && c >= 0) A[r][c] += v; };

    let k = N;
    const vIndex = new Map();
    for (const e of elements) {
      const a = idx(e.a), b = idx(e.b);
      switch (e.type) {
        case 'R': {
          const g = 1 / e.val;
          add(a, a, g); add(b, b, g); add(a, b, -g); add(b, a, -g);
          break;
        }
        case 'I':
          if (a >= 0) z[a] -= e.val;
          if (b >= 0) z[b] += e.val;
          break;
        case 'G': {
          const ca = idx(e.ca), cb = idx(e.cb);
          add(a, ca, e.gain); add(a, cb, -e.gain);
          add(b, ca, -e.gain); add(b, cb, e.gain);
          break;
        }
        case 'V':
        case 'E': {
          const r = k++;
          vIndex.set(e, r);
          add(a, r, 1); add(b, r, -1);
          add(r, a, 1); add(r, b, -1);
          if (e.type === 'V') z[r] = e.val;
          else { const ca = idx(e.ca), cb = idx(e.cb); add(r, ca, -e.gain); add(r, cb, e.gain); }
          break;
        }
        default:
          throw new Error('MNA: unsupported element ' + e.type);
      }
    }
    const x = solveLinear(A, z);
    if (!x) return null;
    const v = (n) => (n === '0' || n === 0 ? 0 : (nodes.has(n) ? x[nodes.get(n)] : NaN));
    // Current *delivered* by a voltage source out of its + terminal.
    const iv = (e) => -x[vIndex.get(e)];
    return { v, iv, x };
  }

  // Thévenin equivalent between nodes p and n (independent sources deactivated for R_TH).
  function thevenin(elements, p, n = '0') {
    const s1 = mna(elements);
    const VTH = s1 ? s1.v(p) - s1.v(n) : NaN;
    const dead = elements.map((e) => (e.type === 'V' || e.type === 'I') && !e.keep ? Object.assign({}, e, { val: 0 }) : e);
    dead.push({ type: 'I', a: n, b: p, val: 1 });
    const s2 = mna(dead);
    const RTH = s2 ? s2.v(p) - s2.v(n) : NaN;
    return { VTH, RTH, IN: VTH / RTH };
  }

  // Resistance seen between p and n with everything as-is except a 1 A probe.
  function resistance(elements, p, n = '0') {
    const probe = elements.concat([{ type: 'I', a: n, b: p, val: 1 }]);
    const s = mna(probe);
    return s ? s.v(p) - s.v(n) : NaN;
  }

  window.MNA = { solveLinear, mna, thevenin, resistance };
})();

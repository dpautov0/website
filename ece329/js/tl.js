/* tl.js — complex numbers and transmission lines for the Exam 3 pages. Everything computed, so every bounce diagram,
   plot and answer on the site comes from one solver.

   Complex:   const z = Cx.of(3, 4);  z.add(w) z.sub(w) z.mul(w) z.div(w) z.conj() z.abs() z.arg() z.sqrt() z.scale(k)
              Cx.polar(r, theta)  Cx.exp(z)  z.tex()  rectangular TeX, "3 + j4"   z.polarTex()  "5\,e^{j0.927}"
   Lines (phasor):  TL.gamma(ZL, Z0)          load reflection coefficient (ZL may be Cx or Infinity)
                    TL.zAt(ZL, Z0, bd)        line impedance Z(d) at electrical length bd = beta*d (returns Cx, or Infinity)
                    TL.gammaAt(GL, bd)        Gamma(d) = GL e^{-j2 bd}
                    TL.vswr(GL)
   Lines (time):    const s = TL.solve({ Vg, Rg, RL, sections: [{ Z0, len, v }, ...], tMax })
                      len in m and v in m/µs gives t in µs; any consistent units work. RL or Rg may be Infinity or 0.
                      s.tauG s.GammaG s.GammaL s.junctions[] s.segs[] s.T[] (one-way delays) s.dc {V, I}
                    TL.arrivals(s, z)         every wave front passing z, in time order: [{ t, v, i, dir }]
                    TL.valueAt(s, z, t, qty)  V or I at (z, t) for a STEP input Vg u(t)
                    TL.stepPts(s, z, tMax, qty)      the staircase V(z, t) as plot points
                    TL.snapshot(s, t, qty)    V(z) at fixed t as plot points
                    TL.diagram(s, opts)       the bounce diagram as an SVG string (PF kit)
                    TL.plotT(s, z, opts)      V or I vs t at z (step, delta or a given pulse), an SVG string
                    TL.plotZ(s, t, opts)      V or I vs z at time t, an SVG string
                    TL.frac(x)                TeX for x as a small fraction if it is one ("\tfrac{20}{3}"), else 3 s.f. */
(function () {
  'use strict';
  const r3 = (x) => +x.toPrecision(3);

  // ---------------------------------------------------------------- complex numbers
  class Cx {
    constructor(re, im = 0) { this.re = re; this.im = im; }
    static of(re, im = 0) { return re instanceof Cx ? re : new Cx(re, im); }
    static polar(r, th) { return new Cx(r * Math.cos(th), r * Math.sin(th)); }
    static exp(z) { z = Cx.of(z); return Cx.polar(Math.exp(z.re), z.im); }
    add(w) { w = Cx.of(w); return new Cx(this.re + w.re, this.im + w.im); }
    sub(w) { w = Cx.of(w); return new Cx(this.re - w.re, this.im - w.im); }
    mul(w) { w = Cx.of(w); return new Cx(this.re * w.re - this.im * w.im, this.re * w.im + this.im * w.re); }
    div(w) { w = Cx.of(w); const d = w.re * w.re + w.im * w.im; return new Cx((this.re * w.re + this.im * w.im) / d, (this.im * w.re - this.re * w.im) / d); }
    scale(k) { return new Cx(this.re * k, this.im * k); }
    conj() { return new Cx(this.re, -this.im); }
    abs() { return Math.hypot(this.re, this.im); }
    arg() { return Math.atan2(this.im, this.re); }
    sqrt() { return Cx.polar(Math.sqrt(this.abs()), this.arg() / 2); }      // principal root: arg in (-pi/2, pi/2]
    // "3 + j4", "-j2", "0.5": drops parts smaller than 1e-9 of the size
    tex(fmt = (x) => EM.p(+x.toPrecision(3))) {
      const eps = 1e-9 * Math.max(this.abs(), 1e-30);
      const re = Math.abs(this.re) > eps, im = Math.abs(this.im) > eps;
      if (!re && !im) return '0';
      const one = (x) => (Math.abs(Math.abs(x) - 1) < 1e-9 ? '' : fmt(Math.abs(x)));
      if (!im) return fmt(this.re);
      if (!re) return `${this.im < 0 ? '-' : ''}j${one(this.im)}`;
      return `${fmt(this.re)} ${this.im < 0 ? '-' : '+'} j${one(this.im)}`;
    }
    polarTex(fmt = (x) => EM.p(+x.toPrecision(3))) {
      const th = this.arg();
      if (Math.abs(th) < 1e-9) return fmt(this.abs());
      return `${fmt(this.abs())}\\,e^{j${fmt(th)}}`;
    }
  }
  window.Cx = Cx;

  const TL = {};

  // TeX for a small fraction (denominator up to 200), else 3 significant figures
  TL.frac = (x, maxQ = 200) => {
    if (!isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
    if (Math.abs(x) < 1e-12) return '0';
    const sign = x < 0 ? '-' : '';
    const a = Math.abs(x);
    for (let q = 1; q <= maxQ; q++) {
      const p = Math.round(a * q);
      if (p > 0 && Math.abs(a - p / q) < 1e-9 * Math.max(a, 1)) return q === 1 ? `${sign}${p}` : `${sign}\\tfrac{${p}}{${q}}`;
    }
    return EM.f(x);
  };

  // ---------------------------------------------------------------- phasor line
  TL.gamma = (ZL, Z0) => {
    if (ZL === Infinity) return Cx.of(1);
    return Cx.of(ZL).sub(Z0).div(Cx.of(ZL).add(Z0));
  };
  TL.gammaAt = (GL, bd) => Cx.of(GL).mul(Cx.polar(1, -2 * bd));
  TL.vswr = (GL) => { const a = Cx.of(GL).abs(); return a >= 1 - 1e-12 ? Infinity : (1 + a) / (1 - a); };
  // Z(d) = Z0 (1 + G(d)) / (1 - G(d)); Infinity at an open point
  TL.zAt = (ZL, Z0, bd) => {
    const G = TL.gammaAt(TL.gamma(ZL, Z0), bd);
    const den = Cx.of(1).sub(G);
    if (den.abs() < 1e-12) return Infinity;
    return Cx.of(1).add(G).div(den).scale(Z0);
  };

  // ---------------------------------------------------------------- time domain: the bounce solver
  const refl = (Rend, Z0) => (Rend === Infinity ? 1 : (Rend - Z0) / (Rend + Z0));

  TL.solve = (o) => {
    const secs = o.sections.map((x) => ({ Z0: x.Z0, len: x.len, v: x.v, T: x.len / x.v }));
    const n = secs.length;
    let z = 0;
    secs.forEach((x) => { x.zL = z; z += x.len; x.zR = z; });
    const total = secs.reduce((s, x) => s + x.T, 0);
    const tMax = o.tMax ?? 6 * total;
    const Vg = o.Vg ?? 1, Rg = o.Rg, RL = o.RL;
    const tauG = secs[0].Z0 / (Rg + secs[0].Z0);
    const GammaG = refl(Rg, secs[0].Z0);
    const GammaL = refl(RL, secs[n - 1].Z0);
    const junctions = [];
    for (let k = 0; k + 1 < n; k++) {
      const a = secs[k].Z0, b = secs[k + 1].Z0;
      const fwd = (b - a) / (b + a), back = (a - b) / (a + b);
      junctions.push({ z: secs[k].zR, fwd, back, tauF: 1 + fwd, tauB: 1 + back });
    }
    // breadth first in time; merging waves is unnecessary: each segment is one traveling step
    const segs = [];
    const queue = [{ k: 0, dir: 1, amp: tauG * Vg, t0: 0, gen: 0 }];
    let guard = 0;
    while (queue.length && guard++ < 4000) {
      queue.sort((p, q) => p.t0 - q.t0);
      const w = queue.shift();
      if (w.t0 >= tMax - 1e-12 || Math.abs(w.amp) < 1e-12 * Math.abs(Vg || 1)) continue;
      const s = secs[w.k];
      const zA = w.dir > 0 ? s.zL : s.zR, zB = w.dir > 0 ? s.zR : s.zL;
      segs.push({ k: w.k, dir: w.dir, v: w.amp, i: (w.dir * w.amp) / s.Z0, zA, zB, tA: w.t0, tB: w.t0 + s.T, speed: s.v, gen: w.gen });
      const tB = w.t0 + s.T;
      if (w.dir > 0) {
        if (w.k === n - 1) { if (GammaL !== 0) queue.push({ k: w.k, dir: -1, amp: w.amp * GammaL, t0: tB, gen: w.gen + 1 }); }
        else {
          const j = junctions[w.k];
          if (j.fwd !== 0) queue.push({ k: w.k, dir: -1, amp: w.amp * j.fwd, t0: tB, gen: w.gen + 1 });
          queue.push({ k: w.k + 1, dir: 1, amp: w.amp * j.tauF, t0: tB, gen: w.gen + 1 });
        }
      } else if (w.k === 0) { if (GammaG !== 0) queue.push({ k: 0, dir: 1, amp: w.amp * GammaG, t0: tB, gen: w.gen + 1 }); }
      else {
        const j = junctions[w.k - 1];
        if (j.back !== 0) queue.push({ k: w.k, dir: 1, amp: w.amp * j.back, t0: tB, gen: w.gen + 1 });
        queue.push({ k: w.k - 1, dir: -1, amp: w.amp * j.tauB, t0: tB, gen: w.gen + 1 });
      }
    }
    const dc = RL === Infinity ? { V: Vg, I: 0 } : { V: (Vg * RL) / (Rg + RL), I: Vg / (Rg + RL) };
    return { Vg, Rg, RL, secs, total, tMax, tauG, GammaG, GammaL, junctions, segs, T: secs.map((x) => x.T), len: secs[n - 1].zR, dc };
  };

  // which section a position belongs to: a junction counts with the section on its left
  const secAt = (s, z) => { for (let k = 0; k < s.secs.length; k++) if (z <= s.secs[k].zR + 1e-12) return k; return s.secs.length - 1; };

  TL.arrivals = (s, z) => {
    const k = secAt(s, z), out = [];
    for (const w of s.segs) {
      if (w.k !== k) continue;
      out.push({ t: w.tA + Math.abs(z - w.zA) / w.speed, v: w.v, i: w.i, dir: w.dir });
    }
    return out.sort((a, b) => a.t - b.t);
  };
  TL.valueAt = (s, z, t, qty = 'V') => TL.arrivals(s, z).filter((a) => a.t <= t + 1e-12).reduce((x, a) => x + (qty === 'I' ? a.i : a.v), 0);

  // merge fronts that arrive together; [[t, value after t], ...]
  const levels = (s, z, tMax, qty) => {
    const arr = TL.arrivals(s, z).filter((a) => a.t < tMax - 1e-12);
    const out = [];
    let val = 0;
    for (const a of arr) {
      val += qty === 'I' ? a.i : a.v;
      if (out.length && Math.abs(out[out.length - 1][0] - a.t) < 1e-9) out[out.length - 1][1] = val;
      else out.push([a.t, val]);
    }
    return out;
  };
  TL.levels = levels;
  TL.stepPts = (s, z, tMax, qty = 'V') => {
    const L = levels(s, z, tMax, qty), pts = [[0, 0]];
    let cur = 0;
    for (const [t, v] of L) { pts.push([t, cur], [t, v]); cur = v; }
    pts.push([tMax, cur]);
    return pts;
  };
  // V(z) at time t: breakpoints at every front and junction, a value on each piece
  TL.snapshot = (s, t, qty = 'V') => {
    const zs = new Set([0, s.len]);
    s.secs.forEach((x) => { zs.add(x.zR); });
    for (const w of s.segs) if (w.tA <= t + 1e-12 && t < w.tB - 1e-12) zs.add(w.zA + w.dir * w.speed * (t - w.tA));
    const sorted = [...zs].sort((a, b) => a - b);
    const pts = [];
    for (let i = 0; i + 1 < sorted.length; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (b - a < 1e-9) continue;
      const m = TL.valueAt(s, (a + b) / 2, t, qty);
      pts.push([a, m], [b, m]);
    }
    return pts;
  };

  // ---------------------------------------------------------------- drawings
  // opts: { tMax, qty 'V'|'I', w, h, unit 'V', tUnit '\\mu s', zUnit 'm', probe: z, amps: true, coeffs: true }
  TL.diagram = (s, o = {}) => {
    const tMax = o.tMax ?? s.tMax, qty = o.qty || 'V', W = o.w || 400, H = o.h || 340;
    const unit = o.unit ?? (qty === 'I' ? 'A' : 'V'), tUnit = o.tUnit ?? '\\mu\\text{s}', zUnit = o.zUnit ?? 'm';
    const g = PF.fig({ alt: o.alt || `Bounce diagram for ${qty}: position across, time downward; each slanted line is one traveling wave, labeled with its ${qty === 'I' ? 'current' : 'voltage'}.` });
    const x0 = 46, y0 = 54, x1 = x0 + W - 90, y1 = y0 + H - 80;
    const X = (z) => x0 + ((x1 - x0) * z) / s.len, Y = (t) => y0 + ((y1 - y0) * t) / tMax;
    g.line(x0, y0, x1 + 20, y0, { cls: 'dim', arrow: 'end', hs: 6 });
    g.line(x0, y0, x0, y1 + 16, { cls: 'dim', arrow: 'end', hs: 6 });
    g.label(x1 + 24, y0, `z\\,(\\text{${zUnit}})`, 'l', 'small');
    g.label(x0, y1 + 20, `t\\,(${tUnit})`, 't', 'small');
    g.line(x1, y0, x1, y1, { cls: 'dim' });
    // z ticks at the ends and junctions
    const zt = [0, ...s.secs.map((x) => x.zR)];
    zt.forEach((z) => g.label(X(z), y0 - 5, TL.frac(z), 'b', 'small'));
    s.junctions.forEach((j) => g.line(X(j.z), y0, X(j.z), y1, { cls: 'dim dash' }));
    // t ticks wherever a wave hits an end or a junction
    const ts = new Set();
    s.segs.forEach((w) => { if (w.tB <= tMax + 1e-9) ts.add(+w.tB.toPrecision(10)); });
    [...ts].sort((a, b) => a - b).forEach((t) => { g.line(x0 - 3, Y(t), x0 + 3, Y(t), { cls: 'dim thin' }); g.label(x0 - 6, Y(t), TL.frac(t), 'r', 'small'); });
    if (o.coeffs !== false) {
      g.label(x0, y0 - 22, `\\Gamma_g = ${TL.frac(s.GammaG)}`, 'b', 'small');
      g.label(x1, y0 - 22, `\\Gamma_L = ${TL.frac(s.GammaL)}`, 'b', 'small');
    }
    const fmt = (v) => `${TL.frac(v)}${unit ? `\\,\\text{${unit}}` : ''}`;
    for (const w of s.segs) {
      if (w.tA >= tMax - 1e-9) continue;
      // clip the segment at tMax
      const f = Math.min(1, (tMax - w.tA) / (w.tB - w.tA));
      const za = w.zA, zb = w.zA + (w.zB - w.zA) * f, tb = w.tA + (w.tB - w.tA) * f;
      g.line(X(za), Y(w.tA), X(zb), Y(tb), { cls: w.dir > 0 ? 'curve' : 'curve dim', mid: f === 1, hs: 7 });
      if (o.amps !== false && f > 0.6) {
        const mx = (X(za) + X(zb)) / 2, my = (Y(w.tA) + Y(tb)) / 2;
        // the label sits above-right of a forward line and above-left of a backward one, near its middle
        const dx = w.dir > 0 ? 8 : -8;
        g.label(mx + dx, my - 6, fmt(qty === 'I' ? w.i : w.v), w.dir > 0 ? 'bl' : 'br', 'small');
      }
    }
    if (o.probe !== undefined) {
      g.line(X(o.probe), y0, X(o.probe), y1, { cls: 'dim dash' });
      g.label(X(o.probe), y1 + 6, `z = ${TL.frac(o.probe)}`, 't', 'small');
      TL.arrivals(s, o.probe).filter((a) => a.t < tMax).forEach((a) => g.dot(X(o.probe), Y(a.t), 2.6));
    }
    return g.svg();
  };

  const niceTicks = (vals) => { const u = []; vals.forEach((v) => { if (!u.some((x) => Math.abs(x - v) < 1e-9)) u.push(v); }); return u; };

  // opts: { tMax, qty, input 'step'|'delta'|fn(t), w, h, unit, tUnit, name }
  TL.plotT = (s, z, o = {}) => {
    const qty = o.qty || 'V', tMax = o.tMax ?? s.tMax, unit = o.unit ?? (qty === 'I' ? 'A' : 'V'), tUnit = o.tUnit ?? '\\mu\\text{s}';
    const yl = `${o.name || `${qty}(${TL.frac(z)},t)`}\\,(\\text{${unit}})`, xl = `t\\,(${tUnit})`;
    const input = o.input || 'step';
    if (input === 'delta') {
      // waves arriving at the same instant (at the load, at the source, at a junction) add into one spike
      const arr = [];
      TL.arrivals(s, z).filter((a) => a.t < tMax).forEach((a) => {
        const v = qty === 'I' ? a.i : a.v, last = arr[arr.length - 1];
        if (last && Math.abs(last[0] - a.t) < 1e-9 * Math.max(1, tMax)) last[1] += v; else arr.push([a.t, v]);
      });
      const vmax = Math.max(...arr.map((a) => Math.abs(a[1])), 1e-12);
      return PF.plot({ w: o.w || 380, h: o.h || 220, x: [0, tMax], y: [-1.25 * vmax, 1.25 * vmax], zero: true, xl, yl,
        xt: niceTicks(arr.map((a) => a[0])).map((t) => [t, TL.frac(t)]),
        curves: arr.map(([t, v]) => ({ pts: [[t, 0], [t, v]] })),
        pts: arr.map(([t, v]) => ({ x: t, y: v, lab: TL.frac(v) })) });
    }
    if (typeof input === 'function') {
      const arr = TL.arrivals(s, z).filter((a) => a.t < tMax);
      const N = o.n || 800, pts = [];
      for (let k = 0; k <= N; k++) { const t = (tMax * k) / N; pts.push([t, arr.reduce((x, a) => x + (qty === 'I' ? a.i : a.v) * input(t - a.t), 0)]); }
      const m = Math.max(...pts.map((p) => Math.abs(p[1])), 1e-12);
      return PF.plot({ w: o.w || 380, h: o.h || 220, x: [0, tMax], y: [-1.2 * m, 1.2 * m], zero: true, xl, yl, xt: o.xt || niceTicks(arr.map((a) => a.t)).map((t) => [t, TL.frac(t)]), yt: o.yt, curves: [{ pts }] });
    }
    const pts = TL.stepPts(s, z, tMax, qty), L = levels(s, z, tMax, qty);
    const vals = pts.map((p) => p[1]), lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
    const curves = [{ pts }];
    if (o.dc !== false) curves.push({ pts: [[0, qty === 'I' ? s.dc.I : s.dc.V], [tMax, qty === 'I' ? s.dc.I : s.dc.V]], cls: 'dash dim thin' });
    return PF.plot({ w: o.w || 380, h: o.h || 230, x: [0, tMax], y: [lo - 0.12 * span, hi + 0.18 * span], zero: true, xl, yl,
      xt: niceTicks(L.map((a) => a[0])).map((t) => [t, TL.frac(t)]),
      curves,
      pts: L.map(([t, v], k) => ({ x: (t + (k + 1 < L.length ? L[k + 1][0] : tMax)) / 2, y: v, lab: TL.frac(v) })) });
  };

  TL.plotZ = (s, t, o = {}) => {
    const qty = o.qty || 'V', unit = o.unit ?? (qty === 'I' ? 'A' : 'V');
    const pts = TL.snapshot(s, t, qty), vals = pts.map((p) => p[1]), lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
    const xs = niceTicks(pts.map((p) => p[0]));
    return PF.plot({ w: o.w || 380, h: o.h || 220, x: [0, s.len], y: [lo - 0.12 * span, hi + 0.18 * span], zero: true,
      xl: `z\\,(\\text{${o.zUnit || 'm'}})`, yl: `${qty}(z,${TL.frac(t)})\\,(\\text{${unit}})`, xt: xs.map((z) => [z, r3(z) === z ? TL.frac(z) : EM.p(r3(z))]),
      curves: [{ pts }] });
  };

  window.TL = TL;
})();

/* Topics 15 and 16: bounce diagrams (Lectures 28-29) and multi-line circuits (Lecture 30).
   Topic 15 builds the diagram one wave at a time, reads V(z,t) at a point and V(z) at an instant, the current diagram,
   step / impulse / pulse / sinusoid inputs, and the 2025 review-session example. Topic 16 derives the junction
   coefficients, the shunt resistor, different speeds, Spring 2024 #4 and the inverse (scope-reading) problems.
   Every number on these pages comes from TL.solve (ece329/js/tl.js) and was recomputed in exact fractions. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- numbers
  // a small fraction (denominator up to 12) as TeX, else 3 significant figures
  const nice = (x) => {
    if (!isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
    if (Math.abs(x) < 1e-12) return '0';
    for (let q = 1; q <= 12; q++) {
      const n = Math.round(x * q);
      if (Math.abs(x * q - n) < 1e-9 * Math.max(1, Math.abs(x * q))) return q === 1 ? `${n}` : `${n < 0 ? '-' : ''}\\tfrac{${Math.abs(n)}}{${q}}`;
    }
    return p(+x.toPrecision(3));
  };
  const d3 = (x) => p(+x.toPrecision(3));            // decimal, 3 s.f.
  // for plot labels: thirds and ninths as fractions, anything else as a decimal
  const niceD = (x) => { const t = nice(x); return /tfrac\{\d+\}\{([369])\}/.test(t) || !/tfrac/.test(t) ? t : d3(x); };
  const sg = (x) => (x < 0 ? `-${nice(-x)}` : `+${nice(x)}`);
  const gam = (R, Z) => (R === Infinity ? 1 : (R - Z) / (R + Z));
  const ohm = (R) => (R === Infinity ? '\\infty' : p(R));
  const NL = String.fromCharCode(10);
  const near = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  // options that are all different (as text) and distinct from the right one
  const wr = (right, list) => { const seen = new Set([right]); return list.filter(([o]) => { if (seen.has(o) || /NaN|Infinity/.test(o)) return false; seen.add(o); return true; }); };

  // ---------------------------------------------------------------- drawing kit
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 30) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // a line circuit on two rails, left to right. Items: { t: 'gen', R, V }  { t: 'line', w, lab, sub, probe, plab }
  //   { t: 'R', lab, last, left }  { t: 'wire', w }. o.ticks = [[item index, 'TeX', fraction of its width], ...]
  function circuit(items, o = {}) {
    const g = PF.fig({ alt: o.alt || 'A generator with internal resistance, a transmission line drawn as two thick rails, and a load resistor.' });
    const T = 30, B = 112, M = (T + B) / 2;
    const rail = (a, b) => { g.line(a, T, b, T); g.line(a, B, b, B); };
    let x = 70;
    const at = [], wid = [];
    items.forEach((it, k) => {
      at.push(x); wid.push(it.w || 0);
      if (it.t === 'gen') {
        zig(g, x, T, x, T + 36, 26);
        g.line(x, T + 36, x, M + 4);
        g.circle(x, M + 15, 11);
        g.line(x - 3, M + 10, x + 3, M + 10, { cls: 'thin' }); g.line(x, M + 7, x, M + 13, { cls: 'thin' });
        g.line(x - 3, M + 21, x + 3, M + 21, { cls: 'thin' });
        g.line(x, M + 26, x, B);
        g.label(x - 10, T + 18, it.R, 'r', 'small');
        g.label(x - 17, M + 15, it.V, 'r', 'small');
        rail(x, x + 26); x += 26;
      } else if (it.t === 'line') {
        g.line(x, T, x + it.w, T, { cls: 'thick' }); g.line(x, B, x + it.w, B, { cls: 'thick' });
        const lx = x + it.w * (it.probe !== undefined && Math.abs(it.probe - 0.5) < 0.25 ? (it.probe < 0.5 ? 0.68 : 0.32) : 0.5);
        if (it.lab) g.label(lx, T + 20, it.lab, 'c', 'small');
        if (it.sub) g.label(lx, B - 20, it.sub, 'c', 'small');
        if (it.probe !== undefined) {
          const px = x + it.w * it.probe;
          g.line(px, T - 14, px, B + 2, { cls: 'dash dim' }); g.dot(px, T, 2.4);
          g.label(px, T - 16, it.plab || '\\text{probe}', 'b', 'small');
        }
        x += it.w;
      } else if (it.t === 'wire') {
        rail(x, x + it.w); x += it.w;
      } else if (it.t === 'R') {
        rail(x, x + 18); x += 18;
        at[k] = x;
        zig(g, x, T, x, B, 32);
        g.dot(x, T, 2.4); g.dot(x, B, 2.4);
        if (it.lab) g.label(x + (it.left ? -10 : 10), M, it.lab, it.left ? 'r' : 'l', 'small');
        if (!it.last) { rail(x, x + 18); x += 18; }
      }
    });
    if (o.ticks) {
      const y = B + 24, xOf = ([k, , fr]) => at[k] + (fr || 0) * wid[k], xs = o.ticks.map(xOf);
      g.line(Math.min(...xs) - 6, y, Math.max(...xs) + 16, y, { cls: 'dim', arrow: 'end', hs: 6 });
      g.label(Math.max(...xs) + 20, y, 'z', 'l', 'small accent');
      o.ticks.forEach((tk) => { const tx = xOf(tk); g.line(tx, y - 4, tx, y + 4, { cls: 'dim' }); g.label(tx, y + 7, tk[1], 't', 'small'); });
    }
    return g.svg();
  }

  // V or I against t at z for a step input, with every level labeled (decimals or small fractions)
  function stair(s, z, o = {}) {
    const qty = o.qty || 'V', tMax = o.tMax ?? s.tMax, unit = o.unit ?? (qty === 'I' ? 'A' : 'V'), tUnit = o.tUnit ?? '\\mu\\text{s}';
    const L = TL.levels(s, z, tMax, qty), pts = TL.stepPts(s, z, tMax, qty);
    const dc = qty === 'I' ? s.dc.I : s.dc.V, vals = pts.map((q) => q[1]).concat(o.dc === false ? [] : [dc]);
    const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
    const curves = [{ pts }];
    if (o.dc !== false) curves.push({ pts: [[0, dc], [tMax, dc]], cls: 'dash dim thin' });
    const fmt = o.fmt || niceD;
    return PF.plot({ w: o.w || 380, h: o.h || 230, x: [0, tMax], y: [lo - 0.12 * span, hi + 0.22 * span], zero: true,
      xl: `t\\,(${tUnit})`, yl: `${o.name || `${qty}(z_0,t)`}\\,(\\text{${unit}})`,
      xt: L.map(([t]) => [t, nice(t)]), curves,
      pts: L.map(([t, v], k) => ({ x: (t + (k + 1 < L.length ? L[k + 1][0] : tMax)) / 2, y: v, lab: fmt(v) })) });
  }
  // impulse response at z: coincident arrivals are merged (TL.plotT's delta mode draws them as two stems)
  function spikes(s, z, o = {}) {
    const qty = o.qty || 'V', tMax = o.tMax ?? s.tMax, tUnit = o.tUnit ?? '\\mu\\text{s}';
    const L = TL.levels(s, z, tMax, qty), W = L.map(([t, v], k) => [t, v - (k ? L[k - 1][1] : 0)]).filter((x) => Math.abs(x[1]) > 1e-12);
    const m = Math.max(...W.map((x) => Math.abs(x[1])), 1e-12), lo = Math.min(0, ...W.map((x) => x[1]));
    return PF.plot({ w: o.w || 380, h: o.h || 210, x: [0, tMax], y: [lo < 0 ? -1.3 * m : -0.1 * m, 1.3 * m], zero: true,
      xl: `t\\,(${tUnit})`, yl: o.name || `h_{z_0}(t)`, xt: W.map(([t]) => [t, nice(t)]),
      curves: W.map(([t, v]) => ({ pts: [[t, 0], [t, v]] })),
      pts: W.map(([t, v]) => ({ x: t, y: v, lab: (o.fmt || niceD)(v), anchor: v < 0 ? 'tl' : 'bl' })) });
  }
  // V(z) at time t for a step (W undefined) or a rectangular pulse of width W; returns the flat pieces
  function pieces(s, t, W) {
    const zs = new Set([0, s.len]);
    const add = (tt) => { if (tt >= 0) TL.snapshot(s, tt).forEach(([z]) => zs.add(+z.toFixed(9))); };
    add(t); if (W !== undefined) add(t - W);
    const sorted = [...zs].sort((a, b) => a - b), out = [];
    for (let i = 0; i + 1 < sorted.length; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (b - a < 1e-6) continue;
      const m = (a + b) / 2;
      const val = TL.valueAt(s, m, t) - (W !== undefined && t - W >= 0 ? TL.valueAt(s, m, t - W) : 0);
      if (out.length && near(out[out.length - 1][2], val)) out[out.length - 1][1] = b; else out.push([a, b, val]);
    }
    return out;
  }
  function snap(s, t, o = {}) {
    const P = pieces(s, t, o.W), pts = [];
    P.forEach(([a, b, v]) => pts.push([a, v], [b, v]));
    const vals = P.map((x) => x[2]), lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
    const [xa, xb] = o.xr || [0, s.len];
    const xs = [xa, xb]; P.forEach(([a, b]) => { [a, b].forEach((z) => { if (z > xa && !xs.some((x) => near(x, z))) xs.push(z); }); });
    const cl = [];
    P.forEach(([a, b, v]) => { if (b > xa) cl.push([Math.max(a, xa), v], [b, v]); });
    return PF.plot({ w: o.w || 380, h: o.h || 210, x: [xa, xb], y: [lo - 0.15 * span, hi + 0.25 * span], zero: true,
      xl: `z\\,(\\text{${o.zUnit || 'm'}})`, yl: `V(z,${d3(t)})\\,(\\text{V})`, xt: xs.map((z) => [z, nice(z)]),
      curves: [{ pts: cl }],
      pts: P.filter(([a, b, v]) => Math.abs(v) > 1e-9 && (b - a) > 0.06 * (xb - xa)).map(([a, b, v]) => ({ x: (Math.max(a, xa) + b) / 2, y: v, lab: niceD(v) })) });
  }
  // V(z0, t) for a rectangular pulse of width W (exact corners), every flat piece labeled
  function pulseT(s, z, W, o = {}) {
    const tMax = o.tMax ?? s.tMax, tUnit = o.tUnit ?? '\\mu\\text{s}';
    const arr = TL.arrivals(s, z).filter((a) => a.t < tMax);
    const ts = new Set([0, tMax]); arr.forEach((a) => { ts.add(+a.t.toFixed(9)); if (a.t + W < tMax) ts.add(+(a.t + W).toFixed(9)); });
    const sorted = [...ts].sort((a, b) => a - b), P = [];
    for (let i = 0; i + 1 < sorted.length; i++) {
      const a = sorted[i], b = sorted[i + 1], m = (a + b) / 2;
      const val = TL.valueAt(s, z, m) - (m - W >= 0 ? TL.valueAt(s, z, m - W) : 0);
      if (P.length && near(P[P.length - 1][2], val)) P[P.length - 1][1] = b; else P.push([a, b, val]);
    }
    const pts = []; P.forEach(([a, b, v]) => pts.push([a, v], [b, v]));
    const vals = P.map((x) => x[2]), lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), span = hi - lo || 1;
    return PF.plot({ w: o.w || 380, h: o.h || 220, x: [0, tMax], y: [lo - 0.15 * span, hi + 0.25 * span], zero: true,
      xl: `t\\,(${tUnit})`, yl: `${o.name || 'V(z_0,t)'}\\,(\\text{V})`, xt: (o.xt || arr.map((a) => a.t)).map((t) => [t, nice(t)]),
      curves: [{ pts }], pts: P.filter(([a, b, v]) => Math.abs(v) > 1e-9).map(([a, b, v]) => ({ x: (a + b) / 2, y: v, lab: niceD(v) })) });
  }
  const diag = (s, o = {}) => TL.diagram(s, Object.assign({ w: 400, h: 330 }, o));

  // ---------------------------------------------------------------- the circuits of Topic 15
  // A: the running example. 120 u(t) V, Rg = 100, Z0 = 50, RL = 200, l = 300 m, v = 150 m/us, T = 2 us
  const sA = TL.solve({ Vg: 120, Rg: 100, RL: 200, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 12 });
  const sA1 = TL.solve({ Vg: 1, Rg: 100, RL: 200, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 12 });   // per volt
  const circA = circuit([{ t: 'gen', R: 'R_g = 100\\ \\Omega', V: 'V_g' }, { t: 'line', w: 230, lab: 'Z_0 = 50\\ \\Omega', sub: 'v = 150\\ \\text{m}/\\mu\\text{s}', probe: 1 / 3, plab: 'z_0 = 100\\ \\text{m}' }, { t: 'R', lab: 'R_L = 200\\ \\Omega', last: true }],
    { ticks: [[1, '0', 0], [1, '300\\ \\text{m}', 1]], alt: 'Circuit A: a 120 volt step generator with 100 ohm internal resistance drives a 300 meter, 50 ohm line ending in a 200 ohm load. A probe is marked at z equals 100 meters.' });
  // the sinusoid example: l = 600 m, v = c, Rg = Z0 = 50, RL = 150, 10 sin(2 pi t) u(t), t in us
  const sS = TL.solve({ Vg: 10, Rg: 50, RL: 150, sections: [{ Z0: 50, len: 600, v: 300 }], tMax: 8 });
  const sine = (t) => (t >= 0 ? Math.sin(2 * Math.PI * t) : 0);
  // the 2025 review session: Vg = 50 delta(t) or 50 u(t), Rg = 50, Z0 = 100, RL = 25, v = 2c/3 = 0.2 m/ns, 4 m
  const sRev = TL.solve({ Vg: 50, Rg: 50, RL: 25, sections: [{ Z0: 100, len: 4, v: 0.2 }], tMax: 80 });
  const ns = { tUnit: '\\text{ns}' };
  const circRev = circuit([{ t: 'gen', R: 'R_g = 50\\ \\Omega', V: 'V_g' }, { t: 'line', w: 230, lab: 'Z_0 = 100\\ \\Omega', sub: 'v = 2c/3', probe: 1 / 4, plab: 'z = 1\\ \\text{m}' }, { t: 'R', lab: 'R_L = 25\\ \\Omega', last: true }],
    { ticks: [[1, '0', 0], [1, '4\\ \\text{m}', 1]], alt: 'The review-session circuit: 50 ohm generator, 4 meter line of 100 ohms at two thirds of c, 25 ohm load, probe at 1 meter.' });
  // pulse snapshots, with the Spring 2017 #5 line: Z0 = 50, l = 750 m, v = 250 m/us, Rg = 100, RL = 25; 30 V for 1 us
  const sP = TL.solve({ Vg: 30, Rg: 100, RL: 25, sections: [{ Z0: 50, len: 750, v: 250 }], tMax: 12 });
  // Spring 2018 #3: Z0 = 50, l = 15 cm, v = 2c/3 = 20 cm/ns, Rg = 30, RL = 150, 10 u(t)
  const s18 = TL.solve({ Vg: 10, Rg: 30, RL: 150, sections: [{ Z0: 50, len: 15, v: 20 }], tMax: 4 });
  const nsc = { tUnit: '\\text{ns}', zUnit: 'cm' };

  // ---------------------------------------------------------------- Topic 15
  EM.lesson('w5', {
    id: 'w5-bounce', topic: 15, ref: 'Lectures 28-29', title: 'Bounce diagrams',
    steps: [
      RF(md`
        !!key Why you care
          Every Exam 3 has a bounce diagram. On Prof. Chen's Spring 2024 paper it was Problem 4, worth 34 of the 100 points: complete the diagram, read the voltage at $z = 100$ m for the first 4 µs, give the steady state. Fall 2023 spent 54 of its 100 points on lines in the time domain. The good news: a bounce diagram is pure bookkeeping. Three numbers and one multiplication rule produce every value, and the steady state checks your work for free.

        ### Notation

        - $z$: position along the line. The generator is at $z = 0$ and the load at $z = l$.
        - $v$: the speed of every wave on the line. $T = l/v$ is the **one-way travel time**.
        - $Z_0$: the **characteristic impedance**, the ratio $V/I$ inside one forward wave.
        - $V_g(t)$: the generator's open-circuit voltage. $R_g$: its internal resistance. $R_L$: the load resistance.
        - $\tau_g = Z_0/(R_g + Z_0)$: the **injection coefficient**, the fraction of $V_g$ that the first wave carries. It is not the transmission coefficient $\tau = 1 + \Gamma$ of [Topic 16](#/l/w5-multi), and not the angle $\tau$ of $\eta$ from [Topic 5](#/l/w2-gamma).
        - $\Gamma_L$, $\Gamma_g$: the **reflection coefficients** at the load and at the generator. Each is reflected voltage over incident voltage, for one wave.
        - $V^+ = \tau_gV_g$: the first wave.
        - $u(t)$: the unit step, 0 before $t = 0$ and 1 after. $\delta(t)$: the unit impulse, a spike of area 1 at $t = 0$. A **rectangular pulse** of width $W$ is on for $0 < t < W$.
        - $h_z(t)$: the **impulse response** at $z$, the voltage there when $V_g = \delta(t)$.

        ### 1. A line carries waves, and voltages add

        On a lossless line, the voltage and current anywhere are built from two traveling shapes ([Topic 13](#/l/w5-telegraph)):
        $$V(z,t) = f(t - z/v) + g(t + z/v)$$
        $$I(z,t) = \frac{f(t - z/v) - g(t + z/v)}{Z_0}$$
        Why does $f(t - z/v)$ move toward the load? Follow one feature of it, say the value $f(0)$. It sits where $t - z/v = 0$, which is
        $$z = vt$$
        As $t$ grows, that point moves to larger $z$ at speed $v$. The same argument puts $g(t + z/v)$ at $z = -vt$: it moves toward the generator.

        So the rule for the whole topic is: **at any point and any moment, the voltage is the sum of the waves that have reached that point.** Each wave keeps its shape and its size while it travels; the line has no loss.

        Where do the waves come from? [Topic 14](#/l/w5-launch) derived three facts from KVL at the two ends. Here they are with the reason in one line each:

        | Event | New wave | Why |
        |---|---|---|
        | the generator switches on | $V^+ = \tau_gV_g$ | the line looks like a resistor $Z_0$, so it is a voltage divider |
        | a wave of size $V_i$ hits the load | $\Gamma_LV_i$ goes back | KVL and Ohm's law at $R_L$ |
        | a wave of size $V_i$ hits the generator | $\Gamma_gV_i$ goes forward | the same physics with $R_g$ in place of $R_L$ |

        with
        $$\tau_g = \frac{Z_0}{R_g + Z_0}$$
        $$\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0}, \quad \Gamma_g = \frac{R_g - Z_0}{R_g + Z_0}$$
        That is all. Every later wave is the previous one times the $\Gamma$ of the end it just hit:
        $$V_1 = \tau_gV_g,\quad V_2 = \Gamma_LV_1,\quad V_3 = \Gamma_gV_2,\ \dots$$

        !!intuition Does this make sense?
          A matched load ($R_L = Z_0$) gives $\Gamma_L = 0$: the wave is swallowed and nothing returns, exactly as if the line went on forever. A load bigger than $Z_0$ gives $\Gamma_L > 0$; smaller gives $\Gamma_L < 0$. The generator end works the same way. And no resistor gives $|\Gamma| > 1$, so the waves can only shrink.
      `, {}),
      Q(md`**Predict.** $V_g = 60u(t)$ V, $R_g = 25\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = 150\ \Omega$. What is the third wave: the one that leaves the generator after the first reflection comes back?`,
        [md`$-\tfrac{20}{3}$ V`, md`$10$ V`, md`$\tfrac{20}{3}$ V`, md`$-10$ V`], 0,
        [null, md`That multiplies the second wave by $\Gamma_L$ again. The second wave hits the **generator**, so the factor is $\Gamma_g$.`, md`That drops the sign of $\Gamma_g$. $R_g = 25\ \Omega$ is less than $Z_0$, so $\Gamma_g = -\tfrac13$.`, md`That starts from $V_g = 60$ V. The first wave is only $\tau_gV_g = \tfrac23\cdot60 = 40$ V.`],
        md`$\tau_g = 50/75 = \tfrac23$, so $V_1 = 40$ V. $\Gamma_L = (150 - 50)/(200) = \tfrac12$, so $V_2 = 20$ V. $\Gamma_g = (25 - 50)/75 = -\tfrac13$, so $V_3 = -\tfrac{20}{3}$ V.`),
      RF(md`
        ### 2. The bounce diagram: a map of every wave

        Keeping track of waves in words gets confusing fast. The bounce diagram draws them. It is a picture with **position $z$ across** and **time $t$ going down**.

        Where is the front of the first wave at time $t$? It left $z = 0$ at $t = 0$ and moves at $v$, so it is at $z = vt$. Turn that around:
        $$t = \frac{z}{v}$$
        In the $(z, t)$ picture that is a straight line from the top-left corner $(0, 0)$ to the point $(l, T)$ on the right edge. A slower wave takes longer to cover the same distance, so **its line is steeper**.

        At $(l, T)$ the wave hits the load and a reflected wave starts back. Its line goes from $(l, T)$ down to $(0, 2T)$. There it hits the generator and a new forward line starts, from $(0, 2T)$ to $(l, 3T)$. The lines zig-zag down the page.

        Now **write each wave's voltage on its line.** The rule from Section 1 becomes a rule about the picture:

        **the label on a line = the label on the line before it × the $\Gamma$ of the end where they meet.**

        Take circuit A, which runs through this whole lesson:

        [[fig:circ]]

        **Step 1: the three numbers.** The injection coefficient:
        $$\tau_g = \frac{50}{100 + 50} = \frac13$$
        The load:
        $$\Gamma_L = \frac{200 - 50}{200 + 50} = \frac{150}{250} = \frac35$$
        The generator:
        $$\Gamma_g = \frac{100 - 50}{100 + 50} = \frac{50}{150} = \frac13$$
        **Step 2: the travel time.**
        $$T = \frac{l}{v} = \frac{300\ \text{m}}{150\ \text{m}/\mu\text{s}} = 2\ \mu\text{s}$$
        **Step 3: the labels, one multiplication each.** First line: $\tfrac13\cdot120 = 40$ V. Second: $40\cdot\tfrac35 = 24$ V. Third: $24\cdot\tfrac13 = 8$ V. Fourth: $8\cdot\tfrac35 = \tfrac{24}{5} = 4.8$ V. Fifth: $4.8\cdot\tfrac13 = \tfrac85 = 1.6$ V.

        [[fig:bd]]

        Look at the pattern. Every round trip (one forward line and one backward line) multiplies the label by $\Gamma_L\Gamma_g$:
        $$\Gamma_L\Gamma_g = \frac35\cdot\frac13 = \frac15$$
        So the forward labels are $40, 8, 1.6, \dots$ and the backward ones $24, 4.8, 0.96, \dots$: each is five times smaller than the one a round trip before.

        !!intuition Does this make sense?
          If both ends had $|\Gamma| = 1$ (a short or an open at each end), the labels would never shrink and the wave would bounce forever: a lossless resonator ([Topic 18](#/l/w6-stubs)). Real resistors absorb a part of every wave that hits them, which is why $|\Gamma_L\Gamma_g| < 1$ and the bouncing dies out.
      `, {
        circ: { svg: circA, cap: md`Circuit A: $V_g = 120u(t)$ V, $R_g = 100\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = 200\ \Omega$, a 300 m line with $v = 150$ m/µs. The dashed mark is the probe used in Section 3.` },
        bd: { svg: diag(sA, { tMax: 10 }), cap: 'The voltage bounce diagram of circuit A for the first 10 µs. Bright lines travel toward the load, gray lines toward the generator. Each label is the line before it times the Γ of the end they share.' },
      }),
      Q(md`**Predict.** In circuit A, the fifth line is labeled $1.6$ V. What is the label on the **seventh** line?`,
        [md`$0.32$ V`, md`$0.576$ V`, md`$0.96$ V`, md`$0.064$ V`], 0,
        [null, md`That is $0.96\cdot\tfrac35$: it uses $\Gamma_L$ for the reflection at the generator. Line 6 travels toward the generator, so line 7 is line 6 times $\Gamma_g = \tfrac13$.`, md`That is the sixth line, $1.6\cdot\tfrac35$. One more reflection is needed.`, md`That divides by 5 once too often. Line 7 is two reflections after line 5, which is one round trip: one factor of $\tfrac15$.`],
        md`Line 6 $= 1.6\cdot\Gamma_L = 0.96$ V. Line 7 $= 0.96\cdot\Gamma_g = 0.32$ V. Faster: two lines later means one round trip, so $1.6\cdot\Gamma_L\Gamma_g = 1.6/5 = 0.32$ V.`),
      RF(md`
        ### 3. Reading $V(z_0, t)$: a vertical line through the diagram

        Pick a point $z_0$ on the line. Draw a vertical line through the diagram at $z_0$. Every slanted line crosses it exactly once, at the moment that wave passes $z_0$.

        **When does each wave pass $z_0$?** Number the forward waves $n = 0, 1, 2, \dots$. Forward wave $n$ leaves the generator at $t = 2nT$ (it waits for $n$ round trips). It then needs $z_0/v$ more to reach $z_0$:
        $$t_{\text{fwd}} = 2nT + \frac{z_0}{v}$$
        Backward wave $n$ leaves the load at $(2n + 1)T$. It has to come back a distance $l - z_0$:
        $$t_{\text{back}} = (2n + 1)T + \frac{l - z_0}{v}$$
        Since $l/v = T$, this is the same as
        $$t_{\text{back}} = (2n + 2)T - \frac{z_0}{v}$$
        **What does $V$ do when a wave passes?** For a step input, every wave is a step: once its front has gone by, its voltage stays. So the voltage at $z_0$ is the running total of the labels crossed so far:
        $$V(z_0, t) = \sum_{\text{lines crossed by } t}(\text{label})$$
        **Circuit A at $z_0 = 100$ m.** Here $z_0/v = 100/150 = \tfrac23$ µs and $2T = 4$ µs. The crossings, in order:

        | Wave | Crosses at (µs) | Label (V) | $V(100\ \text{m}, t)$ after it (V) |
        |---|---|---|---|
        | forward 0 | $\tfrac23$ | 40 | 40 |
        | backward 0 | $4 - \tfrac23 = \tfrac{10}{3}$ | 24 | 64 |
        | forward 1 | $4 + \tfrac23 = \tfrac{14}{3}$ | 8 | 72 |
        | backward 1 | $8 - \tfrac23 = \tfrac{22}{3}$ | 4.8 | 76.8 |
        | forward 2 | $8 + \tfrac23 = \tfrac{26}{3}$ | 1.6 | 78.4 |

        [[fig:probe]]

        [[fig:stair]]

        The gaps between steps alternate. From a forward crossing to the next backward one is $2(l - z_0)/v = \tfrac83$ µs: the wave runs to the load and back. From a backward crossing to the next forward one is $2z_0/v = \tfrac43$ µs: the wave runs to the generator and back.

        !!intuition Does this make sense?
          At $z_0 = l$ (the load) the forward and backward crossings happen at the same moment, $t = T, 3T, \dots$: the incident and reflected waves start together. So the load voltage jumps by **$(1 + \Gamma_L)$ times the incident wave** at once. In circuit A it jumps from 0 to $40(1 + \tfrac35) = 64$ V at $t = 2$ µs.

        Try it yourself. Change any value and the diagram and the voltage at your probe redraw.
      `, {
        probe: { svg: diag(sA, { tMax: 10, probe: 100 }), cap: 'The vertical line at z₀ = 100 m. Each dot is a wave passing the probe; read them top to bottom and keep a running total.' },
        stair: { svg: stair(sA, 100, { tMax: 10, name: 'V(100\\ \\text{m},t)' }), cap: 'V(100 m, t) for circuit A: the running total of the labels. The dashed line is the final value, 80 V (Section 4).' },
      }),
      W3.bounce({ Vg: 120, Rg: 100, Z0: 50, RL: 200, len: 300, v: 150, z: 100, tmax: 10 }),
      Q(md`**Predict.** In circuit A, what is $V(100\ \text{m}, 4\ \mu\text{s})$?`,
        [md`$64$ V`, md`$72$ V`, md`$24$ V`, md`$40$ V`], 0,
        [null, md`That counts the 8 V wave too. It passes $z_0 = 100$ m at $\tfrac{14}{3} \approx 4.67$ µs, which is after 4 µs.`, md`That is only the newest wave. Waves add: the 40 V wave is still there.`, md`That misses the reflected 24 V wave, which passed 100 m at $\tfrac{10}{3} \approx 3.33$ µs.`],
        md`By 4 µs two lines have crossed $z_0$: 40 V at $\tfrac23$ µs and 24 V at $\tfrac{10}{3}$ µs. The third arrives at $\tfrac{14}{3}$ µs. So $V = 40 + 24 = 64$ V.`),
      R(md`
        ### 4. The final value: the sum must equal the DC circuit

        Wait a long time and every wave has passed every point. Then the voltage is the sum of **all** the labels. Split them by direction. The forward labels are
        $$V^+,\ V^+\Gamma_L\Gamma_g,\ V^+(\Gamma_L\Gamma_g)^2,\ \dots$$
        The backward labels are the same list times $\Gamma_L$. Add both lists:
        $$V_\infty = V^+(1 + \Gamma_L)\left[1 + \Gamma_L\Gamma_g + (\Gamma_L\Gamma_g)^2 + \cdots\right]$$
        The bracket is a geometric series. For $|x| < 1$, $1 + x + x^2 + \cdots = 1/(1 - x)$:
        $$V_\infty = \frac{V^+(1 + \Gamma_L)}{1 - \Gamma_L\Gamma_g}$$
        There is no $z$ in it. After a long time the voltage is the same everywhere on the line.

        **Circuit A.** $V^+(1 + \Gamma_L) = 40\cdot\tfrac85 = 64$ V and $1 - \Gamma_L\Gamma_g = \tfrac45$:
        $$V_\infty = 64\cdot\frac54 = 80\ \text{V}$$
        **Now compare with the plain DC circuit.** With the line replaced by two wires, $R_g$ and $R_L$ form a divider:
        $$\frac{V_gR_L}{R_g + R_L} = \frac{120\cdot200}{300} = 80\ \text{V}\ \checkmark$$
        This is no accident. Put the definitions into the formula. First the top:
        $$1 + \Gamma_L = \frac{2R_L}{R_L + Z_0}$$
        Then the bottom, over a common denominator:
        $$1 - \Gamma_L\Gamma_g = \frac{(R_L + Z_0)(R_g + Z_0) - (R_L - Z_0)(R_g - Z_0)}{(R_L + Z_0)(R_g + Z_0)}$$
        Multiply out the top of that. The $R_LR_g$ and $Z_0^2$ terms cancel, and the cross terms double:
        $$(\dots) - (\dots) = 2Z_0(R_g + R_L)$$
        Now assemble $V_\infty$, with $V^+ = V_gZ_0/(R_g + Z_0)$. The factors $(R_L + Z_0)$, $(R_g + Z_0)$, $2$ and $Z_0$ all cancel:
        $$\boxed{V_\infty = \frac{V_gR_L}{R_g + R_L}}$$
        and Ohm's law in the load gives the current
        $$\boxed{I_\infty = \frac{V_g}{R_g + R_L}}$$
        $Z_0$ has disappeared. **After the bouncing dies out, the line is just two wires.**

        !!intuition Does this make sense?
          An open load: $I_\infty = 0$, so no current flows in $R_g$ and $V_\infty = V_g$. A short: $V_\infty = 0$ and $I_\infty = V_g/R_g$. Use this every time: if your staircase is not heading toward the DC value, a label is wrong.
      `),
      Q(md`**Predict.** $V_g = 30u(t)$ V, $R_g = 100\ \Omega$, $Z_0 = 50\ \Omega$, and the load end is **open**. What voltage does the open end settle to?`,
        [md`$30$ V`, md`$20$ V`, md`$10$ V`, md`$60$ V`], 0,
        [null, md`That is the first jump at the open end, $V^+(1 + \Gamma_L) = 10\cdot2$. More waves keep arriving from the generator.`, md`That is the first wave, $\tau_gV_g$. The final value does not depend on $Z_0$.`, md`That doubles the source. Each arriving **wave** doubles at an open end, but the final value is the DC circuit: no current, so no drop in $R_g$.`],
        md`At DC no current flows into an open circuit, so nothing drops across $R_g$ and $V_\infty = V_g = 30$ V. The waves get there in steps: 20 V at $T$, then $20 + 2\cdot\tfrac{10}{3} = 26.7$ V at $3T$, and so on.`),
      RF(md`
        ### 5. $V$ against $z$ at one instant: a horizontal line

        Now fix the time $t_0$ and ask for the voltage everywhere along the line. Draw a **horizontal** line across the diagram at $t_0$. Where it cuts a slanted line, that wave's front is at that point at that moment.

        **Which side of a front has the wave?** A forward front at $z_f$ has already passed every point with $z < z_f$, and has not yet reached $z > z_f$. A backward front at $z_b$ has passed every point with $z > z_b$ and not yet reached $z < z_b$. **The wave is always behind its front.**

        Where is the front? A forward wave that left the generator at $t_s$ has gone $v(t_0 - t_s)$:
        $$z_f = v(t_0 - t_s)$$
        A backward wave that left the load at $t_s$ has come back that far from $l$:
        $$z_b = l - v(t_0 - t_s)$$
        **Circuit A at $t_0 = 3$ µs.** The 40 V wave is done: it has passed every point. The 24 V wave left the load at 2 µs, so
        $$z_b = 300 - 150(3 - 2) = 150\ \text{m}$$
        It has reached $z > 150$ m only. So the snapshot is two flat levels:
        $$V(z, 3) = \begin{cases}40\ \text{V}, & z < 150\ \text{m}\\ 64\ \text{V}, & z > 150\ \text{m}\end{cases}$$
        **At $t_0 = 5$ µs** the 8 V wave left the generator at 4 µs, so its front is at $150(5 - 4) = 150$ m. It has covered $z < 150$ m: 72 V there, 64 V beyond.

        [[fig:snaps]]

        For a step input on one line there is only **one front on the line at a time**: one wave is always in transit, and every older wave has finished. That is why a snapshot is two flat levels with a single step between them.

        !!intuition Does this make sense?
          At the instant the 24 V front passes a point, that point jumps from 40 to 64 V. The snapshot and the vertical-line reading of Section 3 are two slices of the same picture: one at fixed $t$, one at fixed $z$.
      `, { snaps: { svg: PF.row([{ svg: snap(sA, 3, { w: 340 }), cap: 'At t = 3 µs: the reflected 24 V front is at 150 m, moving left.' }, { svg: snap(sA, 5, { w: 340 }), cap: 'At t = 5 µs: the 8 V front is at 150 m, moving right.' }]).svg, cap: '' } }),
      Q(md`**Predict.** Circuit A at $t_0 = 7$ µs. What is $V(250\ \text{m}, 7\ \mu\text{s})$?`,
        [md`$76.8$ V`, md`$72$ V`, md`$80$ V`, md`$78.4$ V`], 0,
        [null, md`That puts the new wave on the wrong side. The 4.8 V wave travels toward the generator; its front is at 150 m, so it has already covered $z > 150$ m, which includes 250 m.`, md`That is the final value. At 7 µs the bouncing is not over.`, md`That adds the next forward wave (1.6 V). It only leaves the generator at 8 µs.`],
        md`The fourth wave (4.8 V) left the load at 6 µs. At 7 µs its front is at $300 - 150(1) = 150$ m, moving left, so it has covered $150 < z < 300$ m. At 250 m: $72 + 4.8 = 76.8$ V.`),
      RF(md`
        ### 6. The current diagram

        Go back to the current in Section 1:
        $$I = \frac{f - g}{Z_0}$$
        The forward wave enters with a plus sign and the backward wave with a minus sign. So a forward wave of voltage $V_i$ carries current
        $$I_i = +\frac{V_i}{Z_0}$$
        and a backward wave of voltage $V_i$ carries
        $$I_i = -\frac{V_i}{Z_0}$$
        **Why the minus?** Positive current means positive charge moving toward $+z$ in the top wire. A wave with positive voltage pushes charge in its own direction of travel. A backward wave travels toward $-z$, so its current is negative.

        So the **current diagram is the voltage diagram with every label divided by $Z_0$ and every backward label's sign flipped.** For circuit A, $Z_0 = 50\ \Omega$:
        $$\frac{40}{50} = 0.8\ \text{A},\quad -\frac{24}{50} = -0.48\ \text{A},\quad \frac{8}{50} = 0.16\ \text{A}$$
        and so on. Another way to say it: the reflection coefficient for current is $-\Gamma$. Check it at the load: the reflected current is
        $$-\frac{\Gamma_LV_1}{Z_0} = -\Gamma_L\,\frac{V_1}{Z_0} = -\Gamma_LI_1$$

        [[fig:cur]]

        **Two free checks.** At the load, Ohm's law must hold at every moment. After $t = 2$ µs the load sees $V = 64$ V and $I = 0.8 - 0.48 = 0.32$ A, and
        $$\frac{64\ \text{V}}{0.32\ \text{A}} = 200\ \Omega = R_L\ \checkmark$$
        At the generator, KVL must hold: $V_g = R_gI(0, t) + V(0, t)$. For $0 < t < 4$ µs, $100(0.8) + 40 = 120$ V ✓.

        **Final value.** $I_\infty = V_g/(R_g + R_L) = 120/300 = 0.4$ A. The current at 100 m goes $0.8 \to 0.32 \to 0.48 \to 0.384 \to 0.416$ A: it overshoots and undershoots its way to 0.4 A, because the backward waves now subtract.

        !!intuition Does this make sense?
          The voltage at 100 m climbs steadily to 80 V while the current rings around 0.4 A. Same waves, different signs. Both are right, and both end at the DC circuit's answer.
      `, { cur: { svg: PF.row([{ svg: diag(sA, { tMax: 10, qty: 'I', w: 360, h: 320 }), cap: 'Current bounce diagram (A).' }, { svg: stair(sA, 100, { tMax: 10, qty: 'I', w: 340, name: 'I(100\\ \\text{m},t)' }), cap: 'I(100 m, t): it rings toward the dashed 0.4 A.' }]).svg, cap: '' } }),
      Q(md`**Predict.** Circuit A. What is the current at the generator end, $I(0, t)$, for $4 < t < 8$ µs?`,
        [md`$0.48$ A`, md`$1.44$ A`, md`$0.32$ A`, md`$0.4$ A`], 0,
        [null, md`That adds $0.8 + 0.48 + 0.16$. The backward wave's current is negative: $-24/50 = -0.48$ A.`, md`That stops after two waves. At $z = 0$ the backward wave arrives and the new forward wave leaves at the same instant, $t = 4$ µs, so both count.`, md`That is the final value, reached only after many round trips.`],
        md`$I(0, t) = 0.8 - 0.48 + 0.16 = 0.48$ A. Check with KVL: $V(0, t) = 40 + 24 + 8 = 72$ V, so $I = (120 - 72)/100 = 0.48$ A ✓.`),
      RF(md`
        ### 7. Step, impulse, pulse: one diagram serves every input

        The line, $R_g$ and $R_L$ are linear, and nothing in them changes with time. So if the input is scaled, every wave is scaled the same way, and if the input is delayed, every wave is delayed the same way. That means the **labels and the crossing times do not depend on what $V_g(t)$ looks like.** Only the shape that rides on each line changes.

        **The impulse.** Let $V_g = \delta(t)$. Each wave is now a spike, and each label is that spike's weight (area). At $z_0$ the voltage is a train of spikes, one per crossing:
        $$h_{z_0}(t) = \sum_k w_k\,\delta(t - t_k)$$
        where $w_k$ is the label of the $k$-th crossing for a 1 V source, and $t_k$ its crossing time. This is the **impulse response**. For circuit A at 100 m, per volt of source:
        $$h_{z_0}(t) = \tfrac13\delta(t - \tfrac23) + \tfrac15\delta(t - \tfrac{10}{3}) + \cdots$$
        with $t$ in µs. The weights $\tfrac13, \tfrac15, \tfrac1{15}, \dots$ are just $40, 24, 8, \dots$ divided by 120.

        **Any input.** A spike $\delta(t - t_k)$ smeared by the input $V_g(t)$ is simply $V_g(t - t_k)$, a delayed copy. So
        $$V(z_0, t) = \sum_k w_k\,V_g(t - t_k)$$
        Every crossing on the diagram contributes one copy of the input, scaled by its label and delayed to its crossing time.

        **Step.** $V_g = V_0u(t)$. Each copy is a step. That is the staircase of Section 3.

        **Rectangular pulse.** A pulse of height $V_0$ and width $W$ is a step that is switched off again:
        $$V_0\,\text{rect} = V_0u(t) - V_0u(t - W)$$
        So the response is the staircase **minus the same staircase delayed by $W$**. In practice: each crossing makes a little pulse of width $W$ at its crossing time, with height equal to its label. If $W$ is shorter than the gaps between crossings, the pulses come out separate. If $W$ is longer, neighbors overlap and their heights add.

        [[fig:inputs]]

        !!intuition Does this make sense?
          Shrink $W$ toward zero and each little pulse becomes a spike of area (label × $W$): the impulse response. Stretch $W$ to infinity and nothing ever switches off: the step response. The pulse sits between the two.
      `, { inputs: { svg: PF.row([{ svg: spikes(sA, 100, { tMax: 10, name: 'h\\ (\\text{V}\\cdot\\mu\\text{s})', w: 340 }), cap: md`$V_g = 120\delta(t)$: spikes at 100 m with weights 40, 24, 8, 4.8, 1.6 V·µs.` }, { svg: pulseT(sA, 100, 1, { tMax: 10, w: 340, name: 'V(100\\ \\text{m},t)' }), cap: 'A 120 V pulse, 1 µs wide: a 1 µs copy at every crossing.' }]).svg, cap: '' } }),
      Q(md`**Predict.** Circuit A, but $V_g$ is a 120 V rectangular pulse **2 µs** wide. What is $V(100\ \text{m}, 5\ \mu\text{s})$?`,
        [md`$32$ V`, md`$8$ V`, md`$24$ V`, md`$72$ V`], 0,
        [null, md`That keeps only the newest copy. The 24 V copy started at $\tfrac{10}{3}$ µs and lasts 2 µs, to $\tfrac{16}{3} \approx 5.33$ µs, so it is still on.`, md`That misses the 8 V copy, which started at $\tfrac{14}{3} \approx 4.67$ µs.`, md`That is the step answer. With a pulse, the 40 V copy switched off at $\tfrac23 + 2 = \tfrac83$ µs.`],
        md`Copies: 40 V on $[\tfrac23, \tfrac83]$, 24 V on $[\tfrac{10}{3}, \tfrac{16}{3}]$, 8 V on $[\tfrac{14}{3}, \tfrac{20}{3}]$. At 5 µs the last two overlap: $24 + 8 = 32$ V.`),
      RF(md`
        ### 8. A sinusoid through the impulse response

        The same recipe works for any input, including one that never settles. Lecture 29 shows it with a sine wave. Here is a version with its own numbers.

        !!graded Setup
          $l = 600$ m, $v = c = 300$ m/µs, $Z_0 = R_g = 50\ \Omega$, $R_L = 150\ \Omega$. The generator is switched on at $t = 0$: $V_g = 10\sin(\omega t)\,u(t)$ V with $f = 1$ MHz, so one period is 1 µs.

        **Step 1: the numbers.** $\tau_g = 50/100 = \tfrac12$, $\Gamma_g = 0$ (the generator is matched) and $\Gamma_L = 100/200 = \tfrac12$. $T = 600/300 = 2$ µs.

        **Step 2: the diagram.** The first wave has weight $\tfrac12$. The load sends back $\tfrac14$. That wave reaches the generator, where $\Gamma_g = 0$ absorbs it. **Only two waves, ever.**

        **Step 3: the impulse response.** With $t$ in µs,
        $$h_z(t) = \tfrac12\delta\!\left(t - \tfrac{z}{v}\right) + \tfrac14\delta\!\left(t - 4 + \tfrac{z}{v}\right)$$
        **Step 4: replace each $\delta$ by a delayed copy of the input.**
        $$V = 5\sin\omega(t - \tfrac{z}{v})\,u(\cdot) + 2.5\sin\omega(t - 4 + \tfrac{z}{v})\,u(\cdot)$$
        where each $u(\cdot)$ has the same argument as its sine: each copy starts when its wave arrives.

        **Step 5: two probes.** At $z = 450$ m the copies arrive at $1.5$ and $2.5$ µs. They are 1 µs apart, exactly one period, so after $2.5$ µs they are **in phase** and add:
        $$5 + 2.5 = 7.5\ \text{V amplitude}$$
        At $z = 525$ m they arrive at $1.75$ and $2.25$ µs, half a period apart. Now they are **opposite** and subtract:
        $$5 - 2.5 = 2.5\ \text{V amplitude}$$

        [[fig:sine]]

        In general the two copies differ in delay by $2(l - z)/v$, and the final amplitude depends on $z$. That is a **standing-wave pattern**, and it is what the phasor methods of [Topic 17](#/l/w6-vd) compute directly for all time.

        !!intuition Does this make sense?
          At the load both copies arrive together, so the amplitude there is $(\tfrac12 + \tfrac14)\cdot10 = 7.5$ V. A lumped check: at 1 MHz the wavelength is $300/1 = 300$ m, so the line is exactly two wavelengths long, and a whole number of half-wavelengths repeats the load impedance at the input ([Topic 19](#/l/w6-qw)). The source then sees 150 Ω in series with 50 Ω, and $10\cdot150/200 = 7.5$ V ✓.
      `, { sine: { svg: PF.row([{ svg: TL.plotT(sS, 450, { input: sine, tMax: 6, w: 340, name: 'V(450\\ \\text{m},t)', yt: [[7.5, '7.5'], [5, '5'], [-7.5, '-7.5']] }), cap: 'At 450 m: 5 V, then 7.5 V once the copies are in phase.' }, { svg: TL.plotT(sS, 525, { input: sine, tMax: 6, w: 340, name: 'V(525\\ \\text{m},t)', yt: [[5, '5'], [2.5, '2.5'], [-2.5, '-2.5']] }), cap: 'At 525 m: 5 V, then 2.5 V once they are opposite.' }]).svg, cap: '' } }),
      Q(md`**Predict.** The sine example. Once both copies have arrived, what is the amplitude at $z = 300$ m (the middle)?`,
        [md`$7.5$ V`, md`$2.5$ V`, md`$5$ V`, md`$10$ V`], 0,
        [null, md`That treats them as opposite. Their delays are 1 µs and 3 µs: 2 µs apart, two whole periods, so they are in phase.`, md`That is only the forward copy. The reflected copy arrives at 3 µs.`, md`That is the source amplitude. The line takes only $\tau_g = \tfrac12$ of it at launch.`],
        md`Delays: $z/v = 1$ µs and $4 - 1 = 3$ µs. The difference, 2 µs, is two periods, so the copies add: $5 + 2.5 = 7.5$ V.`),
      RF(md`
        ### The method

        !!method Bounce diagram, one line, any input
          1. **The three numbers.** $\tau_g = Z_0/(R_g + Z_0)$, $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$, $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)$. Write them at the top of the diagram.
          2. **The clock.** $T = l/v$. Mark $T, 2T, 3T, \dots$ down the time axis.
          3. **Draw the zig-zag.** First line labeled $\tau_gV_0$ (the input's size). Each next label is the previous one times the $\Gamma$ of the end they share.
          4. **At a point $z_0$:** draw a vertical line. Crossings are at $2nT + z_0/v$ (forward) and $(2n + 2)T - z_0/v$ (backward). List them in time order with their labels.
          5. **Choose the input.** Step: running total. Impulse: spikes with those weights. Pulse of width $W$: each crossing makes a pulse of width $W$; add overlaps.
          6. **At a time $t_0$:** draw a horizontal line. A wave counts at $z$ if its front has passed $z$: left of a forward front, right of a backward front.
          7. **Current:** divide each label by $Z_0$ and flip the sign of backward ones.
          8. **Check.** Final value $V_gR_L/(R_g + R_L)$; at the load $V/I = R_L$ at every moment.

        ### Worked example 1: the 2025 review session, slowly

        !!graded Problem
          $V_g = 50\delta(t)$ V, $R_g = 50\ \Omega$, $Z_0 = 100\ \Omega$, $R_L = 25\ \Omega$, $v = \tfrac23c$, and the line is 4 m long. (a) Draw the voltage and current bounce diagrams for the first 70 ns. (b) Find $V(1\ \text{m}, t)$ for the first 70 ns. (c) Repeat (b) for $V_g = 50u(t)$ V, and give the steady-state load voltage and current.

        [[fig:rcirc]]

        **Step 1: the speed and the clock.** $v = \tfrac23(3\times10^8) = 2\times10^8$ m/s. In units that suit a 4 m line, that is $0.2$ m/ns. So
        $$T = \frac{4\ \text{m}}{0.2\ \text{m/ns}} = 20\ \text{ns}$$
        **Step 2: the three numbers.** The injection coefficient:
        $$\tau_g = \frac{100}{50 + 100} = \frac23$$
        The generator, with $R_g$ smaller than $Z_0$:
        $$\Gamma_g = \frac{50 - 100}{50 + 100} = -\frac13$$
        The load, also smaller than $Z_0$:
        $$\Gamma_L = \frac{25 - 100}{25 + 100} = -\frac{75}{125} = -\frac35$$
        **Step 3: the labels.** The impulse has weight 50, so the first line carries $\tfrac23\cdot50 = \tfrac{100}{3}$. Then one multiplication per line:

        | Line | Travels | Leaves at (ns) | Label | Current label (A·ns) |
        |---|---|---|---|---|
        | 1 | forward | 0 | $\tfrac{100}{3}$ | $+\tfrac13$ |
        | 2 | backward | 20 | $\tfrac{100}{3}(-\tfrac35) = -20$ | $+\tfrac{20}{100} = +0.2$ |
        | 3 | forward | 40 | $-20(-\tfrac13) = \tfrac{20}{3}$ | $+\tfrac1{15}$ |
        | 4 | backward | 60 | $\tfrac{20}{3}(-\tfrac35) = -4$ | $+0.04$ |

        Look at the current column: every entry is positive. The backward voltage labels are negative, and flipping their sign for current makes them positive.

        [[fig:rbd]]

        **Step 4: the crossings at $z_0 = 1$ m.** $z_0/v = 1/0.2 = 5$ ns and $2T = 40$ ns. Forward waves cross at $5$ and $45$ ns. Backward waves cross at $40 - 5 = 35$ ns and $80 - 5 = 75$ ns (after the window). So for the impulse:
        $$V(1, t) = \tfrac{100}{3}\delta(t - 5) - 20\,\delta(t - 35) + \tfrac{20}{3}\delta(t - 45)$$
        with $t$ in ns, for $t < 70$ ns.

        **Step 5: the step input.** Replace each $\delta$ by $u$ and keep a running total:

        | Interval (ns) | $V(1\ \text{m}, t)$ (V) |
        |---|---|
        | $0 < t < 5$ | 0 |
        | $5 < t < 35$ | $\tfrac{100}{3} \approx 33.3$ |
        | $35 < t < 45$ | $\tfrac{100}{3} - 20 = \tfrac{40}{3} \approx 13.3$ |
        | $45 < t < 70$ | $\tfrac{40}{3} + \tfrac{20}{3} = 20$ |

        [[fig:rplots]]

        **Step 6: the steady state.** The DC divider:
        $$V_L = \frac{50\cdot25}{50 + 25} = \frac{50}{3} \approx 16.7\ \text{V}$$
        $$I_L = \frac{50}{75} = \frac23\ \text{A}$$
        **Check.** The staircase goes $33.3 \to 13.3 \to 20 \to 16$ (at 75 ns) and rings around $16.7$ ✓. At the load, after the first arrival, $V = \tfrac{100}{3}(1 - \tfrac35) = \tfrac{40}{3}$ V and $I = \tfrac13 + 0.2 = \tfrac{8}{15}$ A, and $\tfrac{40}{3}\div\tfrac{8}{15} = 25\ \Omega$ ✓.

        **Speed path.** Write $\tau_g, \Gamma_g, \Gamma_L, T$ in a row. Multiply down the labels ($\tfrac{100}{3}, -20, \tfrac{20}{3}, -4$). Crossings at $z_0/v + 40n$ and $40(n+1) - z_0/v$. Running total for the step. Ten lines of work.

        **Where points go.** (1) Using 70 ns as if the slide's "7 µs" were meant: the window is 70 ns. (2) Forgetting that both $\Gamma$s are negative here, so the labels alternate in sign. (3) Current labels: a negative backward voltage gives a **positive** current. (4) Reading the step answer as the impulse answer: the impulse response is spikes, not levels.

        ### Worked example 2: a pulse seen as a snapshot

        !!graded Problem
          Spring 2017's line: $Z_0 = 50\ \Omega$, $l = 750$ m, $v = 250$ m/µs, $R_g = 100\ \Omega$, $R_L = 25\ \Omega$. The source is a 30 V rectangular pulse, 1 µs long, starting at $t = 0$. (On that exam it was a burst of sine; the bookkeeping is the same.) Sketch $V(z)$ at $t = 2$, $3.4$ and $4.5$ µs.

        **Step 1: the numbers.** $\tau_g = 50/150 = \tfrac13$, so the pulse on the line is 10 V tall. $\Gamma_L = (25 - 50)/75 = -\tfrac13$, so the reflected pulse is $-\tfrac{10}{3}$ V. $\Gamma_g = (100 - 50)/150 = \tfrac13$. $T = 750/250 = 3$ µs.

        **Step 2: how long is the pulse on the line?** It lasts 1 µs, and in 1 µs a wave moves $250$ m. So the pulse is a 250 m long block.

        **Step 3: $t = 2$ µs.** The leading edge left at 0 and is at $250(2) = 500$ m. The trailing edge left at 1 µs and is at $250(1) = 250$ m. So $V = 10$ V for $250 < z < 500$ m and 0 elsewhere.

        **Step 4: $t = 3.4$ µs, the half-reflected pulse.** The leading edge reached the load at 3 µs. The trailing edge is at $250(2.4) = 600$ m. So the forward pulse covers $600 < z < 750$ m. The reflected part started at 3 µs and has come back $250(0.4) = 100$ m, so it covers $650 < z < 750$ m. Where both are present they add:
        $$10 - \tfrac{10}{3} = \tfrac{20}{3} \approx 6.67\ \text{V}$$
        on $650 < z < 750$ m, and 10 V on $600 < z < 650$ m.

        **Step 5: $t = 4.5$ µs.** The forward pulse ended at the load at 4 µs. The reflected pulse left the load between 3 and 4 µs, so its two edges are $250(1.5) = 375$ m and $250(0.5) = 125$ m from the load: it covers $375 < z < 625$ m at $-\tfrac{10}{3}$ V.

        [[fig:psnap]]

        **Speed path.** The pulse is a block $vW$ long. Track its two edges like two separate fronts. Where the incident and reflected blocks overlap near the load, add them.

        **Where points go.** (1) Drawing the reflected block on the wrong side: a reflected wave moves toward the generator, so its leading edge is the one farther from the load. (2) Forgetting the overlap region near the load at $3 < t < 4$ µs. (3) Making the reflected block a different length: reflection changes height, never length.

        ### Worked example 3: both ends of Spring 2018 #3, fast

        !!graded Problem
          $Z_0 = 50\ \Omega$, $l = 15$ cm, $v = \tfrac23c$, $R_g = 30\ \Omega$, $R_L = 150\ \Omega$, $V_g = 10u(t)$ V. Plot the voltage at the source end and at the load end for $0 < t < 2$ ns.

        **Numbers.** $v = 20$ cm/ns, so $T = 15/20 = 0.75$ ns. $\tau_g = 50/80 = \tfrac58$, $V^+ = 6.25$ V. $\Gamma_g = -20/80 = -\tfrac14$. $\Gamma_L = 100/200 = \tfrac12$. Labels: $6.25$, $3.125$, $-0.78125$, …

        **Source end ($z = 0$).** The first wave starts there at $t = 0$: $V = 6.25$ V. The reflection returns at $2T = 1.5$ ns, and the new forward wave leaves at the same moment, so the jump is $(1 + \Gamma_g)(3.125) = 2.34$ V: $V = 8.59$ V until $3.0$ ns.

        **Load end ($z = l$).** Nothing until $T = 0.75$ ns, then $(1 + \Gamma_L)(6.25) = 9.375$ V. The next jump is at $3T = 2.25$ ns, after the window.

        [[fig:sp18]]

        **Check.** The DC value is $10\cdot150/180 = 8.33$ V. The load end overshoots to 9.375 V and the source end is at 8.59 V; both will ring in toward 8.33 V.

        ### Speed tricks

        !!key Speed tricks
          - **Write $\tau_g$, $\Gamma_g$, $\Gamma_L$, $T$ in one row first.** Every other number is a product of these.
          - **Round trip factor.** Two lines later, the label is multiplied by $\Gamma_L\Gamma_g$. Use it to jump ahead.
          - **Crossing times at $z_0$:** forward $z_0/v + 2nT$, backward $2(n+1)T - z_0/v$. The gaps alternate $2(l - z_0)/v$ and $2z_0/v$.
          - **At an end, two lines meet at once.** The jump at the load is $(1 + \Gamma_L)\times$incident; at the generator $(1 + \Gamma_g)\times$incident.
          - **Matched generator ($\Gamma_g = 0$): at most two waves ever.** Matched load: one wave, and the line is done after $T$.
          - **Final value = the DC divider** $V_gR_L/(R_g + R_L)$. Check your staircase against it.
          - **Current at the load = $V_L/R_L$.** You rarely need the whole current diagram to answer a current question at the load.
          - **A short load has $V_L = 0$ forever; an open load has $I_L = 0$ forever.**

        !!mistake Common mistakes
          - **Starting with $V_g$ instead of $\tau_gV_g$.** The line only takes its share of the source.
          - **Using the wrong end's $\Gamma$.** A forward line ends at the load ($\Gamma_L$); a backward line ends at the generator ($\Gamma_g$).
          - **Forgetting the wave that starts as another arrives.** At $z = 0$ and $z = l$, two lines meet: count both.
          - **Measuring $z_0/v$ from the wrong end** for a backward crossing. A backward wave covers $l - z_0$ after leaving the load.
          - **Putting a backward wave on the wrong side of its front** in a snapshot. It has reached the points between its front and the load.
          - **Keeping the forward sign for backward current.** $I = -V/Z_0$ for a backward wave.
          - **Leaving a pulse on forever.** A pulse input switches each copy off $W$ after it arrives.
          - **Putting $Z_0$ into the DC answer.** The final values do not depend on $Z_0$.

        ### Check questions
      `, {
        rcirc: { svg: circRev, cap: 'The review-session circuit.' },
        rbd: { svg: PF.row([{ svg: diag(sRev, Object.assign({ tMax: 70, w: 360, h: 320, unit: '' }, ns)), cap: 'Voltage weights (V·ns).' }, { svg: diag(sRev, Object.assign({ tMax: 70, w: 360, h: 320, unit: '', qty: 'I' }, ns)), cap: 'Current weights (A·ns): all positive.' }]).svg, cap: '' },
        rplots: { svg: PF.row([{ svg: spikes(sRev, 1, Object.assign({ tMax: 70, w: 340, name: 'V(1\\ \\text{m},t)\\ (\\text{V}\\cdot\\text{ns})' }, ns)), cap: md`$V_g = 50\delta(t)$: three spikes in 70 ns.` }, { svg: stair(sRev, 1, Object.assign({ tMax: 70, w: 340, name: 'V(1\\ \\text{m},t)' }, ns)), cap: 'V_g = 50u(t): the running total, ringing around 50/3 V (dashed).' }]).svg, cap: '' },
        psnap: { svg: PF.row([{ svg: snap(sP, 2, { W: 1, w: 260 }), cap: 't = 2 µs' }, { svg: snap(sP, 3.4, { W: 1, w: 260, xr: [450, 750] }), cap: 't = 3.4 µs (450 to 750 m shown): overlap near the load' }, { svg: snap(sP, 4.5, { W: 1, w: 260 }), cap: 't = 4.5 µs: reflected block' }]).svg, cap: '' },
        sp18: { svg: PF.row([{ svg: stair(s18, 0, Object.assign({ tMax: 2, w: 340, name: 'V(0,t)' }, nsc)), cap: 'Source end: 6.25 V, then 8.59 V at 1.5 ns.' }, { svg: stair(s18, 15, Object.assign({ tMax: 2, w: 340, name: 'V(l,t)' }, nsc)), cap: 'Load end: 9.375 V from 0.75 ns.' }]).svg, cap: '' },
      }),
      Q(md`What does one slanted line in a bounce diagram represent?`,
        ['one traveling wave, from the end where it starts to the end where it stops', 'the total voltage on the line at one moment', 'the voltage at one point as time passes', 'the current that flows through the load'], 0,
        [null, md`The total at one moment is a horizontal slice through all the lines, not one line.`, md`The voltage at one point is read along a vertical line, by adding the labels that cross it.`, md`Each line is a wave on the line itself; the load current comes from the waves at $z = l$.`],
        md`Each line is one wave's front moving at speed $v$; its label is that wave's voltage.`),
      Q(md`$R_g = Z_0$ and $R_L = 3Z_0$. How many slanted lines does the full bounce diagram have?`,
        ['2', '1', '3', 'infinitely many'], 0,
        [null, md`One line would mean a matched load. Here $\Gamma_L = \tfrac12$, so a wave comes back.`, md`The third line would need $\Gamma_g \neq 0$. With $R_g = Z_0$ the returning wave is absorbed.`, md`That needs both ends to reflect. The matched generator stops it after two lines.`],
        md`$\Gamma_L = (3 - 1)/(3 + 1) = \tfrac12$, so one reflection; $\Gamma_g = 0$, so it ends there. Two lines.`),
      Q(md`On a line with $T = 3$ µs, at $z_0 = l/3$, when does the **first backward** wave pass?`,
        ['5 µs', '4 µs', '7 µs', '6 µs'], 0,
        [null, md`That is $T + z_0/v$: it measures the return trip from the wrong end.`, md`That is when the second forward wave passes, $2T + z_0/v$.`, md`That is when it reaches the generator, $2T$.`],
        md`$t = 2T - z_0/v = 6 - 1 = 5$ µs.`),
      Q(md`The voltage diagram has a backward line labeled $-12$ V on a $Z_0 = 60\ \Omega$ line. Its current label is…`,
        [md`$+0.2$ A`, md`$-0.2$ A`, md`$-720$ A`, md`$+0.1$ A`], 0,
        [null, md`That keeps the voltage's sign. A backward wave has $I = -V/Z_0$, which flips it.`, md`That multiplies by $Z_0$.`, md`That divides by $2Z_0$. Only one wave is involved.`],
        md`$I = -(-12)/60 = +0.2$ A.`),
      Q(md`The final (DC) voltage on a line with $V_g = 90u(t)$ V, $R_g = 30\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = 60\ \Omega$ is…`,
        [md`$60$ V`, md`$56.25$ V`, md`$90$ V`, md`$49.1$ V`], 0,
        [null, md`That is $\tau_gV_g$, the first wave only.`, md`That assumes no current, which needs an open load.`, md`That puts $Z_0$ in the divider: $90\cdot60/110$. The line drops out at DC.`],
        md`$V_\infty = 90\cdot60/(30 + 60) = 60$ V. $Z_0$ never enters.`),
      Q(md`A 1 µs pulse is sent down a line where the gaps between crossings at $z_0$ are 0.8 µs and 2 µs, alternating. What will you see at $z_0$?`,
        ['some neighboring pulses overlap and add', 'separate pulses with gaps between all of them', 'a staircase that never comes back down', 'nothing until the steady state'], 0,
        [null, md`A 1 µs pulse is longer than the 0.8 µs gap, so those two copies overlap.`, md`That is the step response. A pulse switches each copy off after 1 µs.`, md`Each wave passes $z_0$ at its crossing time; the response is not delayed to the end.`],
        md`Copies separated by 0.8 µs overlap for $1 - 0.8 = 0.2$ µs. Copies separated by 2 µs do not.`),
      Q(md`Why is $V_L(t) = 0$ for all time when the load is a short circuit?`,
        ['$\\Gamma_L = -1$, so each reflected wave cancels its incident wave at the load', 'no wave ever reaches a short', 'the injection coefficient is zero', 'the current is zero there'], 0,
        [null, md`Waves reach it at $T, 3T, \dots$; the short sends back an equal and opposite wave each time.`, md`$\tau_g$ depends only on $R_g$ and $Z_0$.`, md`The current at a short is as large as it gets; it is the voltage that is zero.`],
        md`At the load the jump is $(1 + \Gamma_L)\times$incident $= 0$ every time.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** one multiplication per line. Forward lines end at the load ($\Gamma_L$), backward lines at the generator ($\Gamma_g$). Eight right completes a card.
      `),
      Object.assign(G('rf_w5b_next', { need: 8 }), { id: 'w5-bounce.r0' }),
      R(md`
        ### Practice, level 1: when does it happen?

        **The trick:** forward crossings at $z_0/v + 2nT$, backward ones at $2(n+1)T - z_0/v$. A front at time $t$ is $v\times$(time since it left its end) away from that end.
      `),
      Object.assign(G('rf_w5b_time', { need: 8 }), { id: 'w5-bounce.r1' }),
      R(md`
        ### Practice, level 1: read a value

        **The trick:** list the crossings in time order and keep a running total; check against the DC divider.
      `),
      Object.assign(G('rf_w5b_read', { need: 8 }), { id: 'w5-bounce.r2' }),
      R(md`
        ### Practice, level 1: other inputs

        **The trick:** the labels and times do not change with the input. An impulse makes spikes, a step makes levels, a pulse makes blocks of width $W$, a sine makes delayed sines.
      `),
      Object.assign(G('rf_w5b_input', { need: 8 }), { id: 'w5-bounce.r3' }),
      R(md`
        ### Practice, level 2: whole readings, new numbers

        Press **New problem** for fresh values. Each one first asks how you will attack it. Two correct answers without opening the solution complete each one.
      `),
      G('w5b_probe', { need: 2 }),
      G('w5b_snap', { need: 2 }),
      G('w5b_current', { need: 2 }),
      G('w5b_pulse', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A whole bounce problem as Prof. Chen writes them: coefficients, the voltage at a point, a current, and the steady state.
      `),
      G('w5b_full', { need: 2 }),
    ],
  });

  // ================================================================ generators, Topic 15
  // clean single-line circuits: R/Z0 from these ratios gives Γ with small denominators
  const RAT = [1 / 4, 1 / 3, 1 / 2, 2, 3, 4];
  const Z0S = [50, 60, 75, 100, 150];
  const isInt = (x) => Math.abs(x - Math.round(x)) < 1e-9;
  const pickR = (Z0, list) => { const ok = list.filter((r) => r === Infinity || r === 0 || isInt(r * Z0)); return pick(ok); };
  // geometry with integer crossing times: T and the probe fraction
  const GEO = [[2, 1 / 2], [2, 1 / 4], [2, 3 / 4], [3, 1 / 3], [3, 2 / 3], [4, 1 / 4], [4, 1 / 2], [4, 3 / 4], [1, 1 / 2]];
  function circ1(o = {}) {
    for (let guard = 0; guard < 200; guard++) {
      const Z0 = pick(Z0S);
      const rg = pickR(Z0, o.rg || RAT), rl = pickR(Z0, o.rl || RAT);
      const Rg = rg * Z0, RL = rl === Infinity ? Infinity : rl * Z0;
      const tg = Z0 / (Rg + Z0), GL = gam(RL, Z0), Gg = gam(Rg, Z0);
      if (o.distinct && near(GL, Gg)) continue;
      const Vp = pick([12, 24, 36, 48, 60, 72, 120]), Vg = Vp / tg;
      if (!isInt(Vg)) continue;
      const [T, fr] = pick(GEO), v = pick([100, 150, 200, 300]), l = v * T, z0 = l * fr;
      const s = TL.solve({ Vg, Rg, RL, sections: [{ Z0, len: l, v }], tMax: o.tMax || 8 * T });
      return { Z0, Rg, RL, rg, rl, tg, GL, Gg, Vp, Vg, T, v, l, z0, s, Vdc: s.dc.V, Idc: s.dc.I };
    }
    throw new Error('circ1: no circuit');
  }
  const cTex = (c) => md`$V_g = ${p(c.Vg)}u(t)$ V, $R_g = ${ohm(c.Rg)}\ \Omega$, $Z_0 = ${c.Z0}\ \Omega$, $R_L = ${ohm(c.RL)}\ \Omega$, $l = ${c.l}$ m, $v = ${c.v}$ m/µs`;
  const opV = (x, u = 'V') => `$${nice(x)}$ ${u}`;

  GENS.rf_w5b_next = () => one([
    // reflected at the load
    () => {
      const Z0 = pick(Z0S), rl = pickR(Z0, RAT), RL = rl * Z0, GL = gam(RL, Z0), X = pick([12, 24, 30, 36, 60]);
      const r = opV(X * GL);
      return MC('Reflected at the load', md`A forward wave of $${X}$ V on a $${Z0}\ \Omega$ line reaches a $${p(RL)}\ \Omega$ load. The reflected wave is…`, r,
        wr(r, [[opV(X * (1 + GL)), md`That is the total load voltage the moment it arrives, incident plus reflected. The new line carries only the reflected part.`],
          [opV(-X * GL), md`Check the sign: $R_L ${RL > Z0 ? '>' : '<'} Z_0$, so $\Gamma_L$ is ${GL > 0 ? 'positive' : 'negative'}.`],
          [opV(X * (RL - Z0) / RL), md`That puts $R_L$ alone in the denominator. $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)$.`],
          [opV(X * (1 - GL)), md`That is $1 - \Gamma_L$, which belongs to currents. The reflected voltage is $\Gamma_L$ times the incident one.`]]),
        md`$\Gamma_L = (${p(RL)} - ${Z0})/(${p(RL)} + ${Z0}) = ${nice(GL)}$, so the reflected wave is $${X}(${nice(GL)}) = ${nice(X * GL)}$ V.`);
    },
    // reflected at the generator, with the load's Γ given as a distractor
    () => {
      const Z0 = pick(Z0S), rg = pickR(Z0, RAT), Rg = rg * Z0, Gg = gam(Rg, Z0);
      let GL = pick([-1 / 2, 1 / 3, 1 / 2, -1 / 3, 3 / 5]); if (near(GL, Gg)) GL = -GL;
      const X = pick([12, 24, 30, 36, 60]) * pick([1, -1]);
      const r = opV(X * Gg);
      return MC('Reflected at the generator', md`On a $${Z0}\ \Omega$ line with $R_g = ${p(Rg)}\ \Omega$ and $\Gamma_L = ${nice(GL)}$, a backward wave of $${X}$ V reaches the generator. The new forward wave is…`, r,
        wr(r, [[opV(X * GL), md`That uses the load's $\Gamma_L$. A backward wave ends at the **generator**, so the factor is $\Gamma_g$.`],
          [opV(X * (1 + Gg)), md`That is the total jump at the generator end, incident plus re-reflected.`],
          [opV(-X * Gg), md`Check the sign: $R_g ${Rg > Z0 ? '>' : '<'} Z_0$, so $\Gamma_g$ is ${Gg > 0 ? 'positive' : 'negative'}.`],
          [opV(X * Z0 / (Rg + Z0)), md`That is $\tau_g$. The injection coefficient applies only to the source's own launch.`]]),
        md`$\Gamma_g = (${p(Rg)} - ${Z0})/(${p(Rg)} + ${Z0}) = ${nice(Gg)}$, so the new wave is $${X}(${nice(Gg)}) = ${nice(X * Gg)}$ V.`);
    },
    // the third or fourth line from scratch
    () => {
      const c = circ1({ distinct: true }), k = pick([3, 4]);
      const val = c.Vp * c.GL * c.Gg * (k === 4 ? c.GL : 1);
      const r = opV(val);
      return MC(`Line ${k}`, md`${cTex(c)}. What is the label on line ${k} of the voltage bounce diagram?`, r,
        wr(r, [[opV(c.Vg * c.GL * c.Gg * (k === 4 ? c.GL : 1)), md`That starts from $V_g$. Line 1 is $\tau_gV_g = ${nice(c.Vp)}$ V.`],
          [opV(c.Vp * c.GL * c.GL * (k === 4 ? c.Gg : 1)), md`That uses $\Gamma_L$ twice in a row. The lines alternate: load, generator, load…`],
          [opV(c.Vp * (1 + c.GL) * c.Gg * (k === 4 ? c.GL : 1)), md`That carries the load's total $(1 + \Gamma_L)$ forward. Only the reflected part travels back.`],
          [opV(c.Vp * c.Gg * c.Gg * (k === 4 ? c.GL : 1)), md`That uses $\Gamma_g$ at the load. Line 1 ends at the load, so line 2 is line 1 times $\Gamma_L$.`]]),
        md`$\tau_g = ${nice(c.tg)}$, $\Gamma_L = ${nice(c.GL)}$, $\Gamma_g = ${nice(c.Gg)}$. Line 1: $${nice(c.Vp)}$. Line 2: $\times\Gamma_L$. Line 3: $\times\Gamma_g$${k === 4 ? md`. Line 4: $\times\Gamma_L$` : ''}. Result $${nice(val)}$ V.`);
    },
    // a current label
    () => {
      const Z0 = pick([50, 60, 100]), X = pick([6, 12, 30, 24]) * pick([1, -1]), back = pick([true, false]);
      const I = (back ? -X : X) / Z0, r = opV(I, 'A');
      return MC('Current label', md`A **${back ? 'backward' : 'forward'}** line in the voltage diagram is labeled $${X}$ V, and $Z_0 = ${Z0}\ \Omega$. Its label in the current diagram is…`, r,
        wr(r, [[opV(-I, 'A'), back ? md`That keeps the voltage's sign. A backward wave has $I = -V/Z_0$.` : md`A forward wave keeps its sign: $I = +V/Z_0$.`],
          [opV(X * Z0, 'A'), md`That multiplies by $Z_0$. Current is voltage divided by $Z_0$.`],
          [opV(I / 2, 'A'), md`That divides by $2Z_0$. One wave has $|I| = |V|/Z_0$.`]]),
        md`${back ? 'Backward' : 'Forward'}: $I = ${back ? '-' : '+'}V/Z_0 = ${back ? '-' : ''}(${X})/${Z0} = ${nice(I)}$ A.`);
    },
    // the jump at the load
    () => {
      const Z0 = pick(Z0S), rl = pickR(Z0, RAT), RL = rl * Z0, GL = gam(RL, Z0), X = pick([12, 24, 30, 36, 60]);
      const r = opV(X * (1 + GL));
      return MC('The jump at the load', md`A $${X}$ V forward wave reaches a $${p(RL)}\ \Omega$ load on a $${Z0}\ \Omega$ line. By how much does the **load voltage** jump at that instant?`, r,
        wr(r, [[opV(X), md`That forgets the reflected wave. It starts at the load at the same instant, so the load sees both.`],
          [opV(X * GL), md`That is only the reflected wave. The incident wave is there too.`],
          [opV(X * (1 - GL)), md`That subtracts the reflected wave. Voltages of the two waves add.`],
          [opV(2 * X), md`Doubling happens only for an open circuit, $\Gamma_L = 1$.`]]),
        md`Incident plus reflected: $${X}(1 ${sg(GL)}) = ${nice(X * (1 + GL))}$ V. Note that this equals $\tau$, the transmission coefficient, times the incident wave.`);
    },
    // how many lines
    () => {
      const kind = pick(['gm', 'lm', 'none']);
      const q = { gm: md`$R_g = Z_0$ and $R_L = ${pick([2, 3, 4])}Z_0$`, lm: md`$R_g = ${pick([2, 3])}Z_0$ and $R_L = Z_0$`, none: md`$R_g = ${pick([2, 3])}Z_0$ and $R_L = ${pick(['Z_0/2', '4Z_0', 'Z_0/3'])}$` }[kind];
      const r = { gm: '2', lm: '1', none: 'infinitely many' }[kind];
      const all = [['1', md`One line means the load absorbs the first wave: that needs $R_L = Z_0$.`], ['2', md`Two lines means the generator absorbs what comes back: that needs $R_g = Z_0$.`], ['3', md`A diagram never stops at three: after the generator reflects once, the load reflects again, and so on.`], ['infinitely many', md`An infinite diagram needs both $\Gamma_L$ and $\Gamma_g$ nonzero.`]];
      return MC('How many lines?', md`For a step input with ${q}, how many slanted lines does the whole bounce diagram have?`, r,
        all.filter(([o]) => o !== r),
        { gm: md`$\Gamma_L \neq 0$ sends one wave back; $\Gamma_g = 0$ absorbs it. Two lines.`, lm: md`$\Gamma_L = 0$: the first wave is absorbed. One line.`, none: md`Both $\Gamma$s are nonzero, so every arrival makes a new wave. The labels shrink but never stop.` }[kind]);
    },
  ]);

  GENS.rf_w5b_time = () => {
    const [T, fr] = pick(GEO), v = pick([100, 150, 200, 300]), l = v * T, z0 = l * fr, a = T * fr;   // a = z0/v
    const giv = md`A line has $l = ${l}$ m and $v = ${v}$ m/µs, so $T = ${T}$ µs. A step is launched at $t = 0$.`;
    const op = (x) => `$${nice(x)}$ µs`, om = (x) => `$${nice(x)}$ m`;
    return one([
      () => MC('First backward crossing', md`${giv} When does the **first reflected** wave pass $z_0 = ${p(z0)}$ m?`, op(2 * T - a),
        wr(op(2 * T - a), [[op(T + a), md`That adds $z_0/v$ to $T$. The reflected wave starts at the load, so it covers $l - z_0$: $T + (l - z_0)/v$.`], [op(2 * T + a), md`That is when the **second forward** wave passes.`], [op(2 * T), md`That is when it reaches the generator.`], [op(a), md`That is the first forward crossing.`]]),
        md`$t = T + (l - z_0)/v = ${T} + ${nice(T - a)} = ${nice(2 * T - a)}$ µs.`),
      () => MC('Second forward crossing', md`${giv} When does the **second forward** wave (the one launched by the generator's reflection) pass $z_0 = ${p(z0)}$ m?`, op(2 * T + a),
        wr(op(2 * T + a), [[op(2 * T - a), md`That is the first backward crossing.`], [op(T + a), md`The second forward wave leaves the generator at $2T$, not $T$.`], [op(3 * T), md`That is when it reaches the load.`], [op(4 * T - a), md`That is the second backward crossing.`]]),
        md`It leaves $z = 0$ at $2T = ${2 * T}$ µs and needs $z_0/v = ${nice(a)}$ µs more: $${nice(2 * T + a)}$ µs.`),
      () => {
        const dt = pick([1 / 4, 1 / 2, 3 / 4]) * T, t0 = T + dt;
        return MC('Where is the front?', md`${giv} At $t = ${nice(t0)}$ µs, where is the front of the first reflected wave?`, om(l - v * dt),
          wr(om(l - v * dt), [[om(v * dt), md`That measures from the generator. The reflected wave started at the load, $z = l$, and moves toward $z = 0$.`], [om(v * t0), md`That ignores the reflection: it would put the front past the end of the line.`], [om(l - v * t0 / 2), md`That halves the time. The reflected front has been moving for $t - T = ${nice(dt)}$ µs.`]]),
          md`It left $z = ${l}$ m at $t = ${T}$ µs and has moved $v(t - T) = ${v}(${nice(dt)}) = ${nice(v * dt)}$ m back: $z = ${nice(l - v * dt)}$ m.`);
      },
      () => MC('First change at the generator', md`${giv} The voltage at the generator end, $V(0, t)$, first changes (after the jump at $t = 0$) at…`, op(2 * T),
        wr(op(2 * T), [[op(T), md`At $T$ the reflection only starts, at the load. It still has to come back.`], [op(4 * T), md`That is the second change.`], [op(T / 2), md`Nothing has even reached the load yet.`]]),
        md`The first reflected wave leaves the load at $T$ and travels back for another $T$: $2T = ${2 * T}$ µs.`),
      () => {
        const tr = 2 * T;
        return MC('Length from a round trip', md`A step is launched at $t = 0$ on a line with $v = ${v}$ m/µs. The voltage at the generator end first changes again at $t = ${tr}$ µs. How long is the line?`, om(v * tr / 2),
          wr(om(v * tr / 2), [[om(v * tr), md`That is the round-trip distance. The wave went to the load **and back**.`], [om(v * tr / 4), md`That divides by 4. One round trip is $2l$.`], [om(tr / v), md`Distance is speed times time, not time over speed.`]]),
          md`The change comes after a round trip: $2l/v = ${tr}$ µs, so $l = ${v}\cdot${tr}/2 = ${v * tr / 2}$ m.`);
      },
      () => MC('Gap between crossings', md`${giv} At $z_0 = ${p(z0)}$ m, how long after the first forward wave passes does the first reflected wave pass?`, op(2 * (T - a)),
        wr(op(2 * (T - a)), [[op(T - a), md`That is the one-way trip to the load. The wave has to come back too.`], [op(2 * a), md`That is the gap to the generator and back, $2z_0/v$.`], [op(2 * T), md`That is a full round trip of the line, measured at the generator.`]]),
        md`From $z_0$ to the load and back: $2(l - z_0)/v = 2(${nice(T - a)}) = ${nice(2 * (T - a))}$ µs.`),
    ]);
  };

  GENS.rf_w5b_read = () => one([
    // V(z0, t) between crossings
    () => {
      const c = circ1({ distinct: true });
      const L = TL.levels(c.s, c.z0, 4.5 * c.T, 'V');
      const k = pick([1, 2, 3].filter((j) => j < L.length));
      const t0 = k + 1 < L.length ? (L[k][0] + L[k + 1][0]) / 2 : L[k][0] + 0.25;
      const val = L[k][1], r = opV(val);
      return MC('V at a probe', md`${cTex(c)}. Find $V(${p(c.z0)}\ \text{m}, ${nice(t0)}\ \mu\text{s})$.`, r,
        wr(r, [[opV(L[k - 1][1]), md`That misses the wave that passed at $${nice(L[k][0])}$ µs.`],
          [opV(k + 1 < L.length ? L[k + 1][1] : c.Vdc), md`That counts a wave that has not arrived yet.`],
          [opV(val - L[k - 1][1]), md`That is only the newest wave. Earlier waves are still there: voltages add.`],
          [opV(c.Vdc), md`That is the final DC value, reached only after many round trips.`]]),
        md`$\tau_gV_g = ${nice(c.Vp)}$ V, $\Gamma_L = ${nice(c.GL)}$, $\Gamma_g = ${nice(c.Gg)}$, $z_0/v = ${nice(c.z0 / c.v)}$ µs. Crossings by $${nice(t0)}$ µs: ${L.slice(0, k + 1).map(([t]) => `$${nice(t)}$`).join(', ')} µs. Running total: $${nice(val)}$ V.`);
    },
    // final voltage
    () => {
      const c = circ1({ rl: [1 / 3, 1 / 2, 2, 3, 4, Infinity] }), r = opV(c.Vdc);
      return MC('Final voltage', md`${cTex(c)}. What voltage does the load settle to?`, r,
        wr(r, [[opV(c.Vp), md`That is the first wave, $\tau_gV_g$. More waves keep arriving.`],
          [opV(c.Vg), md`That would need zero current through $R_g$: an open load.`],
          [opV(c.RL === Infinity ? 2 * c.Vp : c.Vg * c.RL / (c.RL + c.Z0)), md`That puts $Z_0$ in the divider. At DC the line is two wires.`],
          [opV(c.Vp * (1 + c.GL)), md`That is the first jump at the load, $V^+(1 + \Gamma_L)$.`]]),
        c.RL === Infinity ? md`Open load: no DC current, so $V_\infty = V_g = ${p(c.Vg)}$ V.` : md`$V_\infty = V_gR_L/(R_g + R_L) = ${p(c.Vg)}\cdot${p(c.RL)}/${p(c.Rg + c.RL)} = ${nice(c.Vdc)}$ V.`);
    },
    // final current
    () => {
      const c = circ1({ rl: [1 / 4, 1 / 3, 1 / 2, 2, 3, 4] }), r = opV(c.Idc, 'A');
      return MC('Final current', md`${cTex(c)}. What current flows in the load after a long time?`, r,
        wr(r, [[opV(c.Vg / (c.Rg + c.Z0), 'A'), md`That is the first wave's current, $V^+/Z_0$.`],
          [opV(c.Vg / c.RL, 'A'), md`That leaves out $R_g$, which is in series with the load at DC.`],
          [opV(c.Vg / (c.Rg + c.RL + c.Z0), 'A'), md`At DC the line adds no resistance: $Z_0$ is not a resistor in the DC circuit.`]]),
        md`$I_\infty = V_g/(R_g + R_L) = ${p(c.Vg)}/${p(c.Rg + c.RL)} = ${nice(c.Idc)}$ A.`);
    },
    // first value at the load
    () => {
      const c = circ1({ rl: [1 / 4, 1 / 3, 1 / 2, 2, 3, 4, Infinity] }), r = opV(c.Vp * (1 + c.GL));
      return MC('First value at the load', md`${cTex(c)}. What is the load voltage for $T < t < 3T$?`, r,
        wr(r, [[opV(c.Vp), md`That forgets the reflected wave, which starts at the load at the same instant.`],
          [opV(c.Vp * c.GL), md`That is only the reflected wave.`],
          [opV(c.Vdc), md`That is the final value. Before $3T$ only one round of waves has arrived.`],
          [opV(c.Vg * (1 + c.GL)), md`That starts from $V_g$. The first wave is $\tau_gV_g$.`]]),
        md`$V^+ = ${nice(c.Vp)}$ V arrives at $T$ together with its reflection: $${nice(c.Vp)}(1 ${sg(c.GL)}) = ${nice(c.Vp * (1 + c.GL))}$ V. The next arrival is at $3T$.`);
    },
    // snapshot
    () => {
      const c = circ1({ distinct: true }), dt = pick([1 / 4, 1 / 2, 3 / 4]) * c.T, t0 = c.T + dt, zb = c.l - c.v * dt;
      const side = pick(['gen', 'load']), z1 = side === 'gen' ? zb / 2 : (zb + c.l) / 2;
      const val = side === 'gen' ? c.Vp : c.Vp * (1 + c.GL), r = opV(val);
      return MC('A snapshot', md`${cTex(c)}. Find $V(${p(z1)}\ \text{m}, ${nice(t0)}\ \mu\text{s})$.`, r,
        wr(r, [[opV(side === 'gen' ? c.Vp * (1 + c.GL) : c.Vp), md`That puts the reflected wave on the wrong side of its front. The front is at $${nice(zb)}$ m moving toward the generator; it has covered only $z > ${nice(zb)}$ m.`],
          [opV(c.Vp * c.GL), md`That is the reflected wave alone. The first wave has covered the whole line.`],
          [opV(c.Vdc), md`That is the final value.`]]),
        md`The reflected front left the load at $T = ${c.T}$ µs and is at $${c.l} - ${c.v}(${nice(dt)}) = ${nice(zb)}$ m. At $${p(z1)}$ m (${side === 'gen' ? 'between the generator and the front' : 'between the front and the load'}): $${nice(val)}$ V.`);
    },
  ]);

  GENS.rf_w5b_input = () => one([
    // impulse weights
    () => {
      const c = circ1({ distinct: true }), A = c.Vg, k = pick([2, 3]);
      const w = k === 2 ? c.Vp * c.GL : c.Vp * c.GL * c.Gg, r = opV(w, 'V·µs');
      return MC('Impulse weights', md`$V_g = ${p(A)}\delta(t)$ V·µs, $R_g = ${p(c.Rg)}\ \Omega$, $Z_0 = ${c.Z0}\ \Omega$, $R_L = ${p(c.RL)}\ \Omega$. What is the weight of the ${k === 2 ? 'second' : 'third'} spike to pass a point in the middle of the line?`, r,
        wr(r, [[opV(k === 2 ? A * c.GL : A * c.GL * c.Gg, 'V·µs'), md`That leaves out $\tau_g$: the first spike is $\tau_g\cdot${p(A)} = ${nice(c.Vp)}$.`],
          [opV(c.Vp, 'V·µs'), md`That is the first spike.`],
          [opV(k === 2 ? c.Vp * (1 + c.GL) : c.Vp * c.GL * c.GL, 'V·µs'), k === 2 ? md`That is the load's total. In the middle of the line the incident and reflected spikes pass at different times.` : md`That uses $\Gamma_L$ twice. The second spike reflects at the generator.`],
          [opV(k === 2 ? c.Vp * c.GL * c.Gg : c.Vp * c.GL, 'V·µs'), k === 2 ? md`That is the third spike.` : md`That is the second spike.`]]),
        md`Spikes in order: $${nice(c.Vp)}$ (forward), $\times\Gamma_L = ${nice(c.Vp * c.GL)}$ (backward), $\times\Gamma_g = ${nice(c.Vp * c.GL * c.Gg)}$ (forward).`);
    },
    // pulse at a time
    () => {
      const c = circ1({ distinct: true }), arr = TL.arrivals(c.s, c.z0).slice(0, 4), W = pick([0.5, 1, 1.5, 2]) * c.T / 2;
      const t0 = pick([arr[1].t + W / 2, arr[2].t + W / 2, arr[1].t + W + 0.01 * c.T].filter((t) => t > 0));
      const val = TL.valueAt(c.s, c.z0, t0) - TL.valueAt(c.s, c.z0, t0 - W);
      if (Math.abs(val) < 1e-9) return GENS.rf_w5b_input();
      const r = opV(val);
      return MC('A pulse at a probe', md`${cTex(c).replace('u(t)$ V', '$ V tall')}; the source is a rectangular pulse ${nice(W)} µs wide. Find $V(${p(c.z0)}\ \text{m}, ${d3(t0)}\ \mu\text{s})$.`, r,
        wr(r, [[opV(TL.valueAt(c.s, c.z0, t0)), md`That is the step answer. Each copy switches off ${nice(W)} µs after it arrives.`],
          [opV(arr[1].v), md`That keeps only the second copy.`],
          [opV(arr[2].v), md`That keeps only the third copy.`],
          [opV(arr[1].v + arr[2].v), md`That adds two copies that are not both on at this time.`]]),
        md`Copies at $z_0$: ${arr.slice(0, 3).map((a) => `$${nice(a.v)}$ V on $[${nice(a.t)}, ${nice(a.t + W)}]$`).join(', ')} µs. At $${d3(t0)}$ µs the sum of the copies that are on is $${nice(val)}$ V.`);
    },
    // what is a pulse
    () => MC('Building a pulse', md`A rectangular pulse of height $V_0$ from $t = 0$ to $t = W$ is the same as…`, '$V_0[u(t) - u(t - W)]$',
      [['$V_0[u(t) + u(t - W)]$', md`That is a step that steps up again at $W$: it never turns off.`], ['$V_0\\,u(t)\\,u(t - W)$', md`A product of steps is just $u(t - W)$: on forever after $W$.`], ['$V_0[\\delta(t) - \\delta(t - W)]$', md`Those are two spikes, not a flat top.`], ['$V_0[u(t - W) - u(t)]$', md`That is the same pulse upside down: $-V_0$.`]],
      md`$u(t)$ turns on at 0 and $u(t - W)$ cancels it from $W$ on. So the response is the staircase minus the staircase delayed by $W$.`),
    // sine with a matched generator
    () => {
      const GL = pick([1 / 2, 1 / 3, -1 / 2, -1 / 3]), A = pick([8, 12, 24]), inph = pick([true, false]);
      const amp = A / 2 * Math.abs(1 + (inph ? 1 : -1) * GL), r = opV(amp);
      return MC('A sine through two waves', md`$R_g = Z_0$ and $\Gamma_L = ${nice(GL)}$. The source is $${A}\sin\omega t\,u(t)$ V. At a point where the two delays differ by ${inph ? 'a whole number of periods' : 'half a period'}, what is the final amplitude?`, r,
        wr(r, [[opV(A / 2 * Math.abs(1 + (inph ? -1 : 1) * GL)), inph ? md`That subtracts. Delays a whole number of periods apart put the copies in phase.` : md`That adds. Half a period apart, the copies are opposite.`],
          [opV(A / 2), md`That is the forward copy alone. The reflected copy arrives later and stays.`],
          [opV(A * Math.abs(1 + (inph ? 1 : -1) * GL)), md`That forgets $\tau_g = \tfrac12$ at launch.`]]),
        md`$\tau_g = \tfrac12$ gives a forward copy of amplitude $${nice(A / 2)}$ and a reflected copy of $${nice(A / 2 * Math.abs(GL))}$ (sign from $\Gamma_L$). ${inph ? 'In phase' : 'Opposite'}: $${nice(A / 2)}|1 ${inph ? '+' : '-'} (${nice(GL)})| = ${nice(amp)}$ V.`);
    },
    // step from impulse response
    () => {
      const w1 = pick([10, 20, 30]), w2 = pick([5, -5, 10, -10]), t1 = pick([1, 2]), t2 = t1 + pick([2, 4]);
      const tq = t2 + 1, val = w1 + w2, r = opV(val);
      return MC('From spikes to a step', md`At some point, $h(t) = ${w1}\delta(t - ${t1}) ${w2 < 0 ? '-' : '+'} ${Math.abs(w2)}\delta(t - ${t2}) + \cdots$ (per volt of source, the next spike much later). For a ${'1'} V step source, what is $V$ at $t = ${tq}$?`, r,
        wr(r, [[opV(w2), md`That keeps only the latest spike. Each spike becomes a step that stays on.`], [opV(w1), md`That misses the spike at $t = ${t2}$, which is before $${tq}$.`], [opV(0), md`A spike becomes a step, not a spike, when the input is a step.`]]),
        md`Replace each $\delta$ by $u$: $V = ${w1}u(t - ${t1}) ${w2 < 0 ? '-' : '+'} ${Math.abs(w2)}u(t - ${t2})$. At $t = ${tq}$ both are on: $${val}$ V.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2 and 3, Topic 15
  const PLAN_PROBE = {
    q: 'Before any numbers: how do you get V at one point as time goes on?',
    opts: ['Draw the bounce diagram, list the lines that cross z₀ in time order, and keep a running total', 'Use the DC divider V_gR_L/(R_g + R_L) for every time', 'Multiply τ_g V_g by (1 + Γ_L) once', 'Write a phasor and take its magnitude'],
    a: 0,
    why: [null, md`The divider is only the value after the bouncing ends.`, md`That is only the load voltage between $T$ and $3T$.`, md`Phasors describe a sinusoidal steady state, not a switched-on step.`],
    move: md`Three numbers ($\tau_g$, $\Gamma_L$, $\Gamma_g$), the clock $T$, crossing times $2nT + z_0/v$ and $(2n+2)T - z_0/v$, then add.`,
  };
  GENS.w5b_probe = () => {
    const c = circ1({ distinct: true });
    const L = TL.levels(c.s, c.z0, 4.5 * c.T, 'V').slice(0, 3);
    const mid = (k) => (k + 1 < L.length ? (L[k][0] + L[k + 1][0]) / 2 : L[k][0] + 0.5);
    return {
      title: 'The voltage at a probe',
      q: md`${cTex(c)}. A probe sits at $z_0 = ${p(c.z0)}$ m. Find the first wave, the voltage at the probe after each of the first three waves pass, and the final voltage.`,
      plan: PLAN_PROBE,
      parts: [
        N('V^+ = \\tau_gV_g\\ (\\text{V})', c.Vp, 'V'),
        Object.assign(N(`V(z_0, ${nice(mid(0))}\\,\\mu\\text{s})`, L[0][1], 'V'), { traps: [{ v: c.Vg, msg: 'That is V_g. The line takes τ_g of it.' }] }),
        Object.assign(N(`V(z_0, ${nice(mid(1))}\\,\\mu\\text{s})`, L[1][1], 'V'), { traps: [{ v: L[1][1] - L[0][1], msg: 'That is the second wave alone. Add the first one.' }] }),
        N(`V(z_0, ${nice(mid(2))}\\,\\mu\\text{s})`, L[2][1], 'V'),
        Object.assign(N('V_\\infty', c.Vdc, 'V'), { traps: [{ v: c.Vg * c.RL / (c.RL + c.Z0), msg: 'Z₀ is not part of the DC circuit.' }] }),
      ],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$, $\Gamma_L$ and $\Gamma_g$ from their formulas; $T = l/v$.`, md`Crossings at $z_0/v$, $2T - z_0/v$, $2T + z_0/v$.`],
      sol: md`
        **Step 1: the three numbers.**
        $$\tau_g = \frac{${c.Z0}}{${p(c.Rg)} + ${c.Z0}} = ${nice(c.tg)}$$
        $$\Gamma_L = ${nice(c.GL)},\quad \Gamma_g = ${nice(c.Gg)}$$
        So $V^+ = ${nice(c.tg)}\cdot${p(c.Vg)} = ${nice(c.Vp)}$ V.

        **Step 2: the clock.** $T = ${c.l}/${c.v} = ${c.T}$ µs and $z_0/v = ${nice(c.z0 / c.v)}$ µs.

        **Step 3: the crossings.**

        | Wave | Crosses at (µs) | Label (V) | Running total (V) |
        |---|---|---|---|
        | forward | $${nice(L[0][0])}$ | $${nice(c.Vp)}$ | $${nice(L[0][1])}$ |
        | backward | $${nice(L[1][0])}$ | $${nice(c.Vp * c.GL)}$ | $${nice(L[1][1])}$ |
        | forward | $${nice(L[2][0])}$ | $${nice(c.Vp * c.GL * c.Gg)}$ | $${nice(L[2][1])}$ |

        **Step 4: the final value.**
        $$V_\infty = \frac{${p(c.Vg)}\cdot${p(c.RL)}}{${p(c.Rg)} + ${p(c.RL)}} = ${nice(c.Vdc)}\ \text{V}$$
        [[fig:st]]

        **Check.** The staircase heads toward $${nice(c.Vdc)}$ V (dashed).
      `,
      figs: { st: { svg: stair(c.s, c.z0, { tMax: 4.5 * c.T, name: `V(${p(c.z0)}\\ \\text{m},t)` }), cap: 'The voltage at the probe for the first few round trips.' } },
    };
  };

  GENS.w5b_snap = () => {
    const c = circ1({ distinct: true });
    const fwd = pick([true, false]);              // which front is in transit
    const frac = pick([1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4]);
    const t0 = fwd ? 2 * c.T + frac * c.T : c.T + frac * c.T;
    const zf = fwd ? c.v * (t0 - 2 * c.T) : c.l - c.v * (t0 - c.T);
    const before = fwd ? c.Vp * (1 + c.GL) : c.Vp;                   // value where the front has not arrived
    const after = fwd ? before + c.Vp * c.GL * c.Gg : c.Vp * (1 + c.GL);
    const vGen = fwd ? after : before, vLoad = fwd ? before : after;
    return {
      title: 'A snapshot of V(z)',
      q: md`${cTex(c)}. Sketch $V(z)$ at $t = ${nice(t0)}$ µs: where is the moving front, and what is the voltage on each side of it?`,
      plan: { q: 'Before any numbers: how do you get V along the whole line at one instant?', opts: ['Cut the bounce diagram with a horizontal line at that time, find the front in transit, and decide which side of it the wave has reached', 'Read V at every point with the DC divider', 'Draw a vertical line at the load', 'Assume the newest wave covers the whole line'], a: 0, why: [null, md`The divider is the final value, not a snapshot.`, md`A vertical line gives one point for all times; a snapshot needs all points at one time.`, md`A wave covers only the part of the line its front has already swept.`], move: md`Front position from the time since it left its end; the wave is behind its front.` },
      parts: [
        N('\\text{front position } z\\ (\\text{m})', zf, 'm'),
        Object.assign(N('V\\text{ between the generator and the front}', vGen, 'V'), { traps: [{ v: vLoad, msg: 'That is the other side of the front.' }] }),
        Object.assign(N('V\\text{ between the front and the load}', vLoad, 'V'), { traps: [{ v: vGen, msg: 'That is the other side of the front.' }] }),
      ],
      hints: [md`The wave in transit is the ${fwd ? 'second forward wave; it left the generator at $2T$' : 'first reflected wave; it left the load at $T$'}.`, md`A ${fwd ? 'forward' : 'backward'} wave has reached the points ${fwd ? 'between the generator and its front' : 'between its front and the load'}.`],
      sol: md`
        **Step 1: the numbers.** $\tau_g = ${nice(c.tg)}$, $V^+ = ${nice(c.Vp)}$ V, $\Gamma_L = ${nice(c.GL)}$, $\Gamma_g = ${nice(c.Gg)}$, $T = ${c.T}$ µs.

        **Step 2: which wave is in transit at $${nice(t0)}$ µs?** ${fwd ? md`Between $2T = ${2 * c.T}$ and $3T = ${3 * c.T}$ µs it is the second forward wave, label $${nice(c.Vp)}(${nice(c.GL)})(${nice(c.Gg)}) = ${nice(c.Vp * c.GL * c.Gg)}$ V.` : md`Between $T = ${c.T}$ and $2T = ${2 * c.T}$ µs it is the first reflected wave, label $${nice(c.Vp)}(${nice(c.GL)}) = ${nice(c.Vp * c.GL)}$ V.`}

        **Step 3: where is its front?** ${fwd ? md`It left $z = 0$ at $${2 * c.T}$ µs: $z = ${c.v}(${nice(t0 - 2 * c.T)}) = ${nice(zf)}$ m.` : md`It left $z = ${c.l}$ m at $${c.T}$ µs: $z = ${c.l} - ${c.v}(${nice(t0 - c.T)}) = ${nice(zf)}$ m.`}

        **Step 4: the two levels.** Every older wave covers the whole line: they add to $${nice(before)}$ V. The moving wave has covered ${fwd ? 'the generator side' : 'the load side'}, which is at $${nice(after)}$ V.

        [[fig:sn]]
      `,
      figs: { sn: { svg: snap(c.s, t0), cap: 'The snapshot: two flat levels with the moving front between them.' } },
    };
  };

  GENS.w5b_current = () => {
    const c = circ1({ distinct: true, rl: [1 / 4, 1 / 3, 1 / 2, 2, 3, 4] });
    const L = TL.levels(c.s, c.z0, 4.5 * c.T, 'I').slice(0, 3);
    const mid = (k) => (k + 1 < L.length ? (L[k][0] + L[k + 1][0]) / 2 : L[k][0] + 0.5);
    const VL1 = c.Vp * (1 + c.GL), IL1 = VL1 / c.RL;
    return {
      title: 'The current diagram',
      q: md`${cTex(c)}. Find the current at $z_0 = ${p(c.z0)}$ m after the first and second waves pass, the load current for $T < t < 3T$, and the final current.`,
      plan: { q: 'Before any numbers: how do you get the current?', opts: ['Divide each voltage label by Z₀ and flip the sign of every backward wave, then add as before', 'Divide the total voltage at z₀ by Z₀', 'Divide each label by R_L', 'Use the voltage labels unchanged'], a: 0, why: [null, md`$V/I = Z_0$ only inside one forward wave. With a backward wave present, the total $V/I$ is not $Z_0$.`, md`Inside the line each wave sees $Z_0$; $R_L$ matters only at the load.`, md`Current and voltage have different units and backward waves flip sign.`], move: md`Forward: $I = V/Z_0$. Backward: $I = -V/Z_0$. At the load, $I = V/R_L$ as a check.` },
      parts: [
        N(`I(z_0, ${nice(mid(0))}\\,\\mu\\text{s})`, L[0][1], 'A'),
        Object.assign(N(`I(z_0, ${nice(mid(1))}\\,\\mu\\text{s})`, L[1][1], 'A'), { traps: [{ v: L[0][1] * (1 + c.GL), msg: 'The backward wave carries −V/Z₀: its current subtracts when its voltage is positive.' }] }),
        Object.assign(N('I_L\\text{ for }T < t < 3T', IL1, 'A'), { traps: [{ v: c.Vp * (1 + c.GL) / c.Z0, msg: 'At the load, V/I = R_L, not Z₀.' }] }),
        N('I_\\infty', c.Idc, 'A'),
      ],
      hints: [md`First wave current: $V^+/Z_0 = ${nice(c.Vp)}/${c.Z0}$.`, md`At the load: $I_L = V_L/R_L$ with $V_L = V^+(1 + \Gamma_L)$.`],
      sol: md`
        **Step 1: the voltage labels.** $V^+ = ${nice(c.Vp)}$ V, then $\times\Gamma_L = ${nice(c.Vp * c.GL)}$ V (backward), then $\times\Gamma_g = ${nice(c.Vp * c.GL * c.Gg)}$ V.

        **Step 2: the current labels.** Divide by $Z_0 = ${c.Z0}\ \Omega$ and flip the backward one:
        $$${nice(c.Vp / c.Z0)},\quad ${nice(-c.Vp * c.GL / c.Z0)},\quad ${nice(c.Vp * c.GL * c.Gg / c.Z0)}\ \text{A}$$
        **Step 3: at the probe.** After the first wave: $${nice(L[0][1])}$ A. After the reflected wave: $${nice(L[0][1])} ${sg(-c.Vp * c.GL / c.Z0)} = ${nice(L[1][1])}$ A.

        **Step 4: at the load.** For $T < t < 3T$ the load voltage is $${nice(c.Vp)}(1 ${sg(c.GL)}) = ${nice(VL1)}$ V, so
        $$I_L = \frac{${nice(VL1)}}{${p(c.RL)}} = ${nice(IL1)}\ \text{A}$$
        The same from the waves: $${nice(c.Vp / c.Z0)} ${sg(-c.Vp * c.GL / c.Z0)} = ${nice(IL1)}$ A ✓.

        **Step 5: the final current.** $I_\infty = ${p(c.Vg)}/(${p(c.Rg)} + ${p(c.RL)}) = ${nice(c.Idc)}$ A.
      `,
    };
  };

  GENS.w5b_pulse = () => {
    let c, arr, W, ts;
    for (let g = 0; g < 50; g++) {
      c = circ1({ distinct: true });
      arr = TL.arrivals(c.s, c.z0).slice(0, 4);
      W = pick([1 / 2, 1, 3 / 2]) * Math.min(arr[1].t - arr[0].t, arr[2].t - arr[1].t) * pick([0.5, 1.5]);
      W = +W.toFixed(3);
      ts = [arr[0].t + W / 2, arr[1].t + W / 2, arr[2].t + W / 2];
      if (ts.every((t) => Math.abs(TL.valueAt(c.s, c.z0, t) - TL.valueAt(c.s, c.z0, t - W)) > 1e-9)) break;
    }
    const val = (t) => TL.valueAt(c.s, c.z0, t) - (t - W >= 0 ? TL.valueAt(c.s, c.z0, t - W) : 0);
    return {
      title: 'A rectangular pulse',
      q: md`${cTex(c).replace('u(t)$ V', '$ V')}: the source is a rectangular pulse of height $${p(c.Vg)}$ V and width $W = ${nice(W)}$ µs. Find $V(${p(c.z0)}\ \text{m}, t)$ at the three times below.`,
      plan: { q: 'Before any numbers: how do you handle a pulse?', opts: ['Find the step labels and crossing times; each crossing makes a block of width W; add blocks that overlap', 'Find the step response and stop', 'Divide the step response by W', 'Use only the first wave'], a: 0, why: [null, md`The step response never switches off; a pulse does.`, md`Dividing by $W$ has the wrong units and no meaning here.`, md`Every reflection makes a block too.`], move: md`Pulse = step − step delayed by $W$, so each crossing gives a block of height = label and width $W$.` },
      parts: ts.map((t) => N(`V(z_0, ${d3(t)}\\,\\mu\\text{s})`, val(t), 'V')),
      hints: [md`Labels: $${nice(c.Vp)}$, $\times\Gamma_L$, $\times\Gamma_g$. Crossings at $${nice(arr[0].t)}$, $${nice(arr[1].t)}$, $${nice(arr[2].t)}$ µs.`, md`A block is on from its crossing time to that time plus $W$.`],
      sol: md`
        **Step 1: the step labels.** $\tau_g = ${nice(c.tg)}$, $\Gamma_L = ${nice(c.GL)}$, $\Gamma_g = ${nice(c.Gg)}$: labels $${nice(arr[0].v)}$, $${nice(arr[1].v)}$, $${nice(arr[2].v)}$ V.

        **Step 2: the blocks at $z_0$.**

        | Block | On from (µs) | Off at (µs) | Height (V) |
        |---|---|---|---|
        ${arr.slice(0, 3).map((a, k) => `| ${k + 1} | $${nice(a.t)}$ | $${nice(a.t + W)}$ | $${nice(a.v)}$ |`).join(NL + '        ')}

        **Step 3: add the blocks that are on.** ${ts.map((t) => md`At $${d3(t)}$ µs: $${nice(val(t))}$ V.`).join(' ')}

        [[fig:pt]]
      `,
      figs: { pt: { svg: pulseT(c.s, c.z0, W, { tMax: Math.max(arr[2].t + W + 0.6 * c.T, 3 * c.T), name: `V(${p(c.z0)}\\ \\text{m},t)` }), cap: 'The pulse response at the probe: one block per crossing.' } },
    };
  };

  GENS.w5b_full = () => {
    const c = circ1({ distinct: true, rl: [1 / 4, 1 / 3, 1 / 2, 2, 3, 4] });
    const L = TL.levels(c.s, c.z0, 4.5 * c.T, 'V').slice(0, 3), LI = TL.levels(c.s, c.z0, 4.5 * c.T, 'I').slice(0, 3);
    const mid = (k, LL) => (k + 1 < LL.length ? (LL[k][0] + LL[k + 1][0]) / 2 : LL[k][0] + 0.5);
    return {
      title: 'A whole bounce problem',
      big: true,
      q: md`${cTex(c)}. (a) Find $\tau_g$, $\Gamma_g$ and $\Gamma_L$. (b) Draw the voltage bounce diagram for $0 < t < ${4 * c.T}$ µs. (c) Find $V(z_0, t)$ at $z_0 = ${p(c.z0)}$ m on its first three levels. (d) Find $I(z_0, t)$ just after the reflected wave passes. (e) Give the steady-state load voltage and current.`,
      plan: PLAN_PROBE,
      parts: [
        N('\\tau_g', c.tg, ''),
        N('\\Gamma_g', c.Gg, ''),
        N('\\Gamma_L', c.GL, ''),
        N(`V(z_0, ${nice(mid(0, L))}\\,\\mu\\text{s})`, L[0][1], 'V'),
        N(`V(z_0, ${nice(mid(1, L))}\\,\\mu\\text{s})`, L[1][1], 'V'),
        N(`V(z_0, ${nice(mid(2, L))}\\,\\mu\\text{s})`, L[2][1], 'V'),
        Object.assign(N(`I(z_0, ${nice(mid(1, LI))}\\,\\mu\\text{s})`, LI[1][1], 'A'), { traps: [{ v: (c.Vp + c.Vp * c.GL) / c.Z0, msg: 'The backward wave carries −V/Z₀.' }] }),
        N('V_{L,\\infty}', c.Vdc, 'V'),
        N('I_{L,\\infty}', c.Idc, 'A'),
      ],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$; each $\Gamma = (R - Z_0)/(R + Z_0)$.`, md`Crossings at $z_0$: $z_0/v$, $2T - z_0/v$, $2T + z_0/v$.`],
      sol: md`
        **(a)**
        $$\tau_g = \frac{${c.Z0}}{${p(c.Rg)} + ${c.Z0}} = ${nice(c.tg)}$$
        $$\Gamma_g = \frac{${p(c.Rg)} - ${c.Z0}}{${p(c.Rg)} + ${c.Z0}} = ${nice(c.Gg)}$$
        $$\Gamma_L = \frac{${p(c.RL)} - ${c.Z0}}{${p(c.RL)} + ${c.Z0}} = ${nice(c.GL)}$$
        **(b)** $T = ${c.T}$ µs. Labels: $${nice(c.Vp)}$, $${nice(c.Vp * c.GL)}$, $${nice(c.Vp * c.GL * c.Gg)}$, $${nice(c.Vp * c.GL * c.GL * c.Gg)}$ V.

        [[fig:bd]]

        **(c)** Crossings at $${nice(L[0][0])}$, $${nice(L[1][0])}$, $${nice(L[2][0])}$ µs. Running total: $${nice(L[0][1])}$, $${nice(L[1][1])}$, $${nice(L[2][1])}$ V.

        **(d)** Current labels $${nice(c.Vp / c.Z0)}$ and $${nice(-c.Vp * c.GL / c.Z0)}$ A (the backward sign flipped). After both: $${nice(LI[1][1])}$ A.

        **(e)** The DC divider:
        $$V_{L,\infty} = \frac{${p(c.Vg)}\cdot${p(c.RL)}}{${p(c.Rg + c.RL)}} = ${nice(c.Vdc)}\ \text{V}$$
        $$I_{L,\infty} = \frac{${p(c.Vg)}}{${p(c.Rg + c.RL)}} = ${nice(c.Idc)}\ \text{A}$$
        **Speed path.** One row of coefficients, multiply down the diagram, list crossings, add. The DC divider is the check, and it costs ten seconds.

        **Where points go.** $V_g$ in place of $\tau_gV_g$; the wrong $\Gamma$ at an end; a backward current with the wrong sign; $Z_0$ in the DC divider.
      `,
      figs: { bd: { svg: diag(c.s, { tMax: 4 * c.T, probe: c.z0 }), cap: 'The voltage bounce diagram with the probe line; dots mark the crossings.' } },
    };
  };

  // ---------------------------------------------------------------- the question bank, Topic 15
  EM.BANK['w5-bounce'] = [
    Q(md`In a bounce diagram, a steeper line means…`,
      ['a slower wave', 'a faster wave', 'a larger voltage', 'a larger reflection'], 0,
      [null, md`Time runs down the page: a steeper line takes more time per meter.`, md`The slope is about speed; the label carries the voltage.`, md`$\Gamma$ sets the next label, not the slope.`],
      md`The line is $t = z/v$; its slope $dt/dz = 1/v$ grows as $v$ shrinks.`),
    Q(md`$R_g = 3Z_0$. The generator reflection coefficient is…`,
      [md`$\tfrac12$`, md`$-\tfrac12$`, md`$\tfrac14$`, md`$\tfrac34$`], 0,
      [null, md`$R_g > Z_0$ gives a positive $\Gamma_g$.`, md`That is $\tau_g$.`, md`That is $1 - \tau_g$, which is not $\Gamma_g$.`],
      md`$\Gamma_g = (3 - 1)/(3 + 1) = \tfrac12$.`),
    Q(md`The injection coefficient $\tau_g$ is the ratio of…`,
      ['the first wave\'s voltage to the source\'s open-circuit voltage', 'the reflected voltage to the incident voltage at the generator', 'the transmitted voltage to the incident voltage at a junction', 'the load voltage to the source voltage after a long time'], 0,
      [null, md`That is $\Gamma_g$.`, md`That is a transmission coefficient $\tau = 1 + \Gamma$ (Topic 16).`, md`That is the DC divider $R_L/(R_g + R_L)$.`],
      md`$V^+ = \tau_gV_g$ with $\tau_g = Z_0/(R_g + Z_0)$: the line is a resistor $Z_0$ in a divider with $R_g$.`),
    Q(md`$R_g = 0$ and $R_L = Z_0/3$ with a step source $V_0u(t)$. What is the second wave?`,
      [md`$-\tfrac12V_0$`, md`$\tfrac12V_0$`, md`$-\tfrac13V_0$`, md`$-V_0$`], 0,
      [null, md`$R_L < Z_0$ makes $\Gamma_L$ negative.`, md`$\Gamma_L = (\tfrac13 - 1)/(\tfrac13 + 1) = -\tfrac12$, not $-\tfrac13$.`, md`$-V_0$ would come from $\Gamma_g = -1$, which acts on the third wave, not the second.`],
      md`$\tau_g = 1$ (no $R_g$), so $V^+ = V_0$, and $\Gamma_L = -\tfrac12$ gives $-\tfrac12V_0$.`),
    Q(md`On one line, how many wave fronts are on the line at a typical moment, for a step input?`,
      ['one', 'none', 'two', 'all of them'], 0,
      [null, md`One wave is always in transit until the bouncing ends.`, md`Each reflection starts as the previous wave ends, so two fronts are never in transit at once on one line.`, md`Older waves have finished: their fronts have left the line.`],
      md`Each wave starts exactly when the previous one ends at an end of the line. So the snapshot always has exactly one step in it.`),
    Q(md`A forward front at $z_f$ at time $t_0$. Which points has its wave reached?`,
      [md`$0 < z < z_f$`, md`$z_f < z < l$`, md`all of the line`, md`only $z = z_f$`], 0,
      [null, md`That is where it has not arrived yet.`, md`Only after the front reaches the load.`, md`For a step the wave stays on behind its front, not only at it.`],
      md`It started at $z = 0$ and has swept every point up to its front.`),
    Q(md`A backward front at $z_b$. Which points has its wave reached?`,
      [md`$z_b < z < l$`, md`$0 < z < z_b$`, md`all of the line`, md`none until it reaches the generator`], 0,
      [null, md`That is where it has not arrived yet: it is moving toward $z = 0$.`, md`It has not yet reached $z < z_b$.`, md`A wave adds to the voltage as soon as its front passes a point.`],
      md`It started at the load and has swept from $l$ down to $z_b$.`),
    Q(md`At the generator end, which two waves change $V(0, t)$ at $t = 2T$?`,
      ['the first reflected wave arriving and the new forward wave leaving', 'the first forward wave and its reflection', 'only the reflected wave', 'only the new forward wave'], 0,
      [null, md`Those meet at the load at $t = T$.`, md`The generator sends a new wave at the same instant: count both.`, md`It is launched by the arriving wave: count both.`],
      md`The jump at $z = 0$ is $(1 + \Gamma_g)\times$(arriving wave).`),
    Q(md`A step response at some point is $40, 64, 72, 76.8, \dots$ V. What does the DC divider have to give?`,
      ['a value the sequence converges to, here 80 V', 'the first value, 40 V', 'the largest value seen in the first few steps', 'a value that does not depend on the load'], 0,
      [null, md`The first value is $\tau_gV_g$, which depends on $Z_0$; the final value does not.`, md`The sequence may still be climbing (or ringing): the limit is what counts.`, md`$V_gR_L/(R_g + R_L)$ depends on the load.`],
      md`The increments shrink by a factor 5 each round trip here, so the sum converges: $64/(1 - 1/5) = 80$ V.`),
    Q(md`The current reflection coefficient at the load is…`,
      [md`$-\Gamma_L$`, md`$\Gamma_L$`, md`$1 + \Gamma_L$`, md`$1/\Gamma_L$`], 0,
      [null, md`The reflected wave travels backward, so its current has the opposite sign of its voltage.`, md`That is a transmission coefficient for voltage.`, md`There is no inverse anywhere in the derivation.`],
      md`$I_r = -V_r/Z_0 = -\Gamma_LV_i/Z_0 = -\Gamma_LI_i$.`),
    Q(md`The impulse response at $z_0$ is $h(t) = 0.5\delta(t - 1) + 0.2\delta(t - 3)$ (t in µs). The input is a 10 V pulse 1 µs long. At $t = 3.5$ µs the voltage is…`,
      ['2 V', '7 V', '5 V', '0 V'], 0,
      [null, md`That keeps the first block on. It ran from 1 to 2 µs only.`, md`That is the first block, which has ended.`, md`The second block runs from 3 to 4 µs.`],
      md`Blocks: $5$ V on $[1, 2]$ and $2$ V on $[3, 4]$. At 3.5 µs only the second is on: 2 V.`),
    Q(md`Why can one bounce diagram serve a step, an impulse and a pulse?`,
      ['the circuit is linear and time-invariant, so each wave is a scaled, delayed copy of the input', 'the line has no resistance', 'the labels depend only on the input', 'every input becomes a step on the line'], 0,
      [null, md`Losslessness keeps each wave's shape, but the reason the same labels work is linearity and time-invariance.`, md`The labels depend only on $R_g$, $Z_0$ and $R_L$.`, md`A pulse stays a pulse and an impulse stays an impulse.`],
      md`Scaling and delaying commute with the circuit, so $V(z,t) = \sum_k w_kV_g(t - t_k)$ for any $V_g$.`),
    Q(md`With $\Gamma_g = 0$, the impulse response at a point inside the line has at most…`,
      ['two spikes', 'one spike', 'three spikes', 'infinitely many spikes'], 0,
      [null, md`The load still reflects unless $\Gamma_L = 0$.`, md`A third would need the generator to reflect.`, md`That needs both ends to reflect.`],
      md`The forward spike and its reflection from the load; the generator absorbs the rest.`),
    Q(md`$R_L = Z_0$ and a step source. When does the load voltage stop changing?`,
      ['at $t = T$, as soon as the first wave arrives', 'at $t = 2T$', 'never: it approaches its final value forever', 'at $t = 3T$'], 0,
      [null, md`Nothing reflects from a matched load, so nothing more comes.`, md`No wave returns from the load, so the generator has nothing to reflect.`, md`That is the case with two reflecting ends.`],
      md`$\Gamma_L = 0$: the first wave is absorbed. $V_L = \tau_gV_g$ forever, which equals $V_gR_L/(R_g + R_L)$ since $R_L = Z_0$ ✓.`),
    Q(md`For a sinusoidal source switched on at $t = 0$, the voltage at a point after many round trips is…`,
      ['a steady sinusoid whose amplitude depends on the point', 'the DC divider value', 'zero, because the reflections cancel', 'growing without bound'], 0,
      [null, md`DC applies to a step: a sine never settles to a constant.`, md`They cancel only at special points, and only if the reflection is total.`, md`With $|\Gamma| < 1$ the copies shrink, so the sum converges.`],
      md`Each copy is a delayed sine; their sum is a sine of fixed amplitude that depends on the delays, which depend on $z$: a standing-wave pattern.`),
    Q(md`A line with $T = 2$ µs. A probe at $z_0 = l/4$. The two gaps between successive crossings are…`,
      ['3 µs and 1 µs, alternating', '2 µs each', '1.5 µs and 0.5 µs', '4 µs each'], 0,
      [null, md`Equal gaps happen only at the midpoint.`, md`Those are one-way times. A gap is a round trip from the probe to an end and back.`, md`4 µs is the full round trip $2T$; the probe splits it into two parts.`],
      md`$2(l - z_0)/v = 2(1.5) = 3$ µs and $2z_0/v = 2(0.5) = 1$ µs.`),
    Q(md`At the load, the voltage jump when a wave $V_i$ arrives is $(1 + \Gamma_L)V_i$. For a short circuit this is…`,
      ['zero', '$V_i$', '$2V_i$', '$-V_i$'], 0,
      [null, md`That ignores the reflected wave.`, md`That is an open circuit.`, md`That is only the reflected wave.`],
      md`$\Gamma_L = -1$: $(1 - 1)V_i = 0$. A short holds the voltage at zero.`),
    Q(md`$V_g = 100u(t)$ V, $R_g = 50\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = \infty$. Describe the voltage at the open end.`,
      ['0 until $T$, then 100 V forever', '0 until $T$, then 50 V forever', '50 V from $t = 0$', '0 until $T$, then 100 V, then 150 V at $3T$'], 0,
      [null, md`That is the first wave alone. At an open end it doubles.`, md`The wave needs time $T$ to arrive.`, md`The returning wave meets a matched generator ($\Gamma_g = 0$) and is absorbed, so nothing more arrives.`],
      md`$V^+ = 50$ V, doubled at the open end: 100 V at $T$. The reflection is absorbed at the matched generator. Final value $V_g = 100$ V ✓.`),
    Q(md`In a current bounce diagram with $\Gamma_L$ and $\Gamma_g$ both negative, the current labels are…`,
      ['all the same sign', 'alternating in sign', 'all zero after the first', 'growing'], 0,
      [null, md`Voltage labels alternate (two negative $\Gamma$s), and the backward sign flip undoes it for current.`, md`Only a zero $\Gamma$ stops the waves.`, md`$|\Gamma| \le 1$ for resistors.`],
      md`Current reflection coefficients are $-\Gamma_L > 0$ and $-\Gamma_g > 0$, so every current label keeps the first one's sign. The review-session example shows this: $\tfrac13$, $0.2$, $\tfrac1{15}$, $0.04$ A·ns.`),
    Q(md`$V_g = 12u(t)$ V, $R_g = Z_0 = 60\ \Omega$, $R_L = 0$. What is the load current after a long time, and when is it first reached?`,
      ['0.2 A, at $t = T$', '0.2 A, only as $t \\to \\infty$', '0.1 A, at $t = T$', '0.4 A, at $t = 2T$'], 0,
      [null, md`With a matched generator nothing re-reflects, so the load current is final as soon as the first wave arrives.`, md`That is the first wave's current, $6/60$. At the short it doubles.`, md`The DC current is $V_g/R_g$, not twice it.`],
      md`$V^+ = 6$ V, $I^+ = 0.1$ A. The short reflects $-6$ V, whose current is $+0.1$ A: $I_L = 0.2$ A at $t = T$. DC check: $12/60 = 0.2$ A ✓.`),
    Q(md`$V_g = 30u(t)$ V, $R_g = 0$, $Z_0 = 50\ \Omega$, $R_L = 150\ \Omega$. The labels are…`,
      [md`$30,\ 15,\ -15,\ -7.5,\ \dots$`, md`$15,\ 7.5,\ -7.5,\ \dots$`, md`$30,\ 15,\ 15,\ 7.5,\ \dots$`, md`$30,\ -15,\ 15,\ \dots$`], 0,
      [null, md`With $R_g = 0$, $\tau_g = 1$: the first wave is the whole 30 V.`, md`$\Gamma_g = -1$ when $R_g = 0$: the third label flips sign.`, md`$\Gamma_L = (150 - 50)/200 = +\tfrac12$: the second label is positive.`],
      md`$\tau_g = 1$, $\Gamma_L = \tfrac12$, $\Gamma_g = -1$: $30$, $15$, $-15$, $-7.5$, … The load voltage then rings around $V_g = 30$ V.`),
    Q(md`Which change makes the bounce diagram's labels die out faster?`,
      ['making $R_g$ closer to $Z_0$', 'making the line longer', 'making $v$ larger', 'raising $V_g$'], 0,
      [null, md`Length changes the times, not the labels.`, md`Speed changes the times, not the labels.`, md`Every label scales with $V_g$; the ratio between labels stays.`],
      md`The round-trip factor is $\Gamma_L\Gamma_g$; bringing $R_g$ toward $Z_0$ shrinks $|\Gamma_g|$.`),
  ];

  // ================================================================ Topic 16
  // a junction of two lines, optionally with a shunt resistor, and the three waves
  function juncFig(o = {}) {
    const g = PF.fig({ alt: o.alt || 'Two transmission lines meet at a junction. An incident wave arrives on line 1; a reflected wave returns on line 1 and a transmitted wave continues on line 2.' });
    const T = 56, B = 116, xj = 200, x0 = 26, x1 = 374, M = (T + B) / 2;
    g.line(x0, T, x1, T, { cls: 'thick' }); g.line(x0, B, x1, B, { cls: 'thick' });
    g.line(xj, T - 46, xj, B + 34, { cls: 'dash dim' });
    if (o.R) { zig(g, xj, T, xj, B, 32); g.dot(xj, T, 2.4); g.dot(xj, B, 2.4); g.label(xj + 10, M, o.R, 'l', 'small'); }
    g.label(o.R ? 110 : (x0 + xj) / 2, M, o.Z1 || 'Z_1', 'c');
    g.label(o.R ? 300 : (xj + x1) / 2, M, o.Z2 || 'Z_2', 'c');
    g.arrow(58, T - 26, 170, T - 26, { hs: 7 }); g.label(114, T - 30, 'V^+', 'b', 'small');
    g.arrow(170, B + 20, 58, B + 20, { hs: 7, cls: 'dim' }); g.label(114, B + 24, 'V^- = \\Gamma_{12}V^+', 't', 'small');
    g.arrow(230, T - 26, 342, T - 26, { hs: 7 }); g.label(286, T - 30, 'V^{++} = \\tau_{12}V^+', 'b', 'small');
    return g.svg();
  }
  // Spring 2024 #4: Vg = 80u(t), Rg = 50, Z01 = 150 and Z02 = 50 (150 m each, v = c/2 = 150 m/us), RL = 50
  const s24 = TL.solve({ Vg: 80, Rg: 50, RL: 50, sections: [{ Z0: 150, len: 150, v: 150 }, { Z0: 50, len: 150, v: 150 }], tMax: 6 });
  const circ24 = circuit([{ t: 'gen', R: 'R_g = 50\\ \\Omega', V: 'V_g' }, { t: 'line', w: 150, lab: 'Z_{01} = 150\\ \\Omega', sub: 'v = c/2', probe: 2 / 3, plab: '100\\ \\text{m}' }, { t: 'line', w: 150, lab: 'Z_{02} = 50\\ \\Omega', sub: 'v = c/2' }, { t: 'R', lab: 'R_L = 50\\ \\Omega', last: true }],
    { ticks: [[1, '0', 0], [2, '150', 0], [2, '300\\ \\text{m}', 1]], alt: 'Spring 2024 problem 4: a 50 ohm generator drives 150 meters of 150 ohm line, then 150 meters of 50 ohm line, ending in a 50 ohm load. A probe is marked at 100 meters.' });
  // two speeds: Z1 = 50 (200 m at 100 m/us), Z2 = 100 (200 m at 200 m/us), Rg = 50, RL = 300, 60 u(t)
  const sM = TL.solve({ Vg: 60, Rg: 50, RL: 300, sections: [{ Z0: 50, len: 200, v: 100 }, { Z0: 100, len: 200, v: 200 }], tMax: 7 });
  // Fall 2023 #3: delta(t), 100 ohm source; 100, 50, 150 ohm sections of 1 us each; 150 ohm load (drawn 100 m at 100 m/us)
  const sF3 = TL.solve({ Vg: 1, Rg: 100, RL: 150, sections: [{ Z0: 100, len: 100, v: 100 }, { Z0: 50, len: 100, v: 100 }, { Z0: 150, len: 100, v: 100 }], tMax: 5 });
  const circF3 = circuit([{ t: 'gen', R: '100\\ \\Omega', V: '\\delta(t)' }, { t: 'line', w: 100, lab: 'Z_{01} = 100', sub: 'T = 1\\ \\mu\\text{s}' }, { t: 'line', w: 100, lab: 'Z_{02} = 50', sub: 'T = 1\\ \\mu\\text{s}' }, { t: 'line', w: 100, lab: 'Z_{03} = 150', sub: 'T = 1\\ \\mu\\text{s}' }, { t: 'R', lab: '150\\ \\Omega', last: true }],
    { alt: 'Fall 2023 problem 3: an impulse source with 100 ohms drives three line sections of 100, 50 and 150 ohms, each 1 microsecond long, into a 150 ohm load.' });
  // Fall 2023 #4: the scope trace at z = 50 m
  const traceF4 = PF.plot({ w: 360, h: 190, x: [0, 5], y: [-0.15, 1.35], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'V(50\\ \\text{m},t)',
    xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], curves: [{ pts: [[1, 0], [1, 1]] }, { pts: [[3, 0], [3, 0.5]] }],
    pts: [{ x: 1, y: 1, lab: 'A\\,\\delta(t - 1)' }, { x: 3, y: 0.5, lab: '\\tfrac{A}{2}\\delta(t - 3)' }] });
  const circF4 = circuit([{ t: 'gen', R: 'R_g', V: '30\\delta(t)' }, { t: 'line', w: 230, lab: 'Z_0 = 50\\ \\Omega', probe: 1 / 2, plab: 'z = 50\\ \\text{m}' }, { t: 'R', lab: 'R_L', last: true }],
    { ticks: [[1, '0', 0], [1, '100\\ \\text{m}', 1]], alt: 'Fall 2023 problem 4: a 30 delta generator with unknown resistance drives a 100 meter, 50 ohm line ending in an unknown load. A probe is at 50 meters.' });

  EM.lesson('w5', {
    id: 'w5-multi', topic: 16, ref: 'Lecture 30', title: 'Junctions, multi-line circuits, and reading a scope backwards',
    steps: [
      RF(md`
        !!key Why you care
          Prof. Chen's Spring 2024 Problem 4 (34 points) was **two** lines in series: a 150 Ω line into a 50 Ω line. Fall 2023 had a three-section line (12 points) and a "here is what the scope showed, find the circuit" problem (18 points). Both need one new idea: what happens where two lines meet. It turns out to be the load formula again, with the second line playing the load.

        ### Notation

        - $Z_1$, $Z_2$ (also $Z_{01}$, $Z_{02}$): the characteristic impedances of line 1 (nearer the generator) and line 2.
        - $V^+$: a wave arriving at the junction on line 1. $V^-$: the wave it reflects back on line 1. $V^{++}$: the wave it sends on into line 2.
        - $\Gamma_{12} = V^-/V^+$: the **junction reflection coefficient** for a wave going from line 1 toward line 2. $\Gamma_{21}$: the same for a wave coming from line 2.
        - $\tau_{12} = V^{++}/V^+$: the **transmission coefficient** from line 1 into line 2. This is the third $\tau$ of the course: not the injection coefficient $\tau_g$ ([Topic 15](#/l/w5-bounce)) and not the angle of $\eta$ ([Topic 5](#/l/w2-gamma)).
        - $v_k$, $l_k$, $T_k = l_k/v_k$: speed, length and one-way travel time of section $k$.
        - $Z_{\text{eq}}$: the impedance a wave "sees" at a junction, $Z_2$ alone or $Z_2$ in parallel with a resistor there.
        - $t_k$, $h_k$: the time and height (weight) of the $k$-th pulse on a scope trace.

        ### 1. Two lines meet: what must match

        Line 1 runs up to the junction and line 2 starts there. A wave $V^+$ arrives on line 1. Right after it arrives there are three waves near the junction: $V^+$ and its reflection $V^-$ on line 1, and the transmitted wave $V^{++}$ on line 2. Nothing has come back along line 2 yet, so line 2 carries only $V^{++}$.

        [[fig:junc]]

        **Condition 1: one voltage.** The wires of line 1 connect directly to the wires of line 2. There is nothing between them, so the voltage just left of the junction equals the voltage just right of it:
        $$V^+ + V^- = V^{++} \qquad\text{(1)}$$
        **Condition 2: one current.** Charge cannot pile up at a point, so the current arriving from the left equals the current leaving to the right (KCL). On line 1 the backward wave carries $-V^-/Z_1$; on line 2 the forward wave carries $V^{++}/Z_2$:
        $$\frac{V^+ - V^-}{Z_1} = \frac{V^{++}}{Z_2} \qquad\text{(2)}$$
        **Solve.** Put (1) into the right side of (2):
        $$\frac{V^+ - V^-}{Z_1} = \frac{V^+ + V^-}{Z_2}$$
        Multiply both sides by $Z_1Z_2$:
        $$Z_2(V^+ - V^-) = Z_1(V^+ + V^-)$$
        Put the $V^+$ terms on the left and the $V^-$ terms on the right:
        $$V^+(Z_2 - Z_1) = V^-(Z_2 + Z_1)$$
        Divide:
        $$\boxed{\Gamma_{12} = \frac{V^-}{V^+} = \frac{Z_2 - Z_1}{Z_2 + Z_1}}$$
        Now (1) gives the transmitted wave: $V^{++} = V^+ + V^- = V^+(1 + \Gamma_{12})$:
        $$\boxed{\tau_{12} = 1 + \Gamma_{12}}$$
        Add the fractions to see it another way:
        $$\tau_{12} = \frac{(Z_2 + Z_1) + (Z_2 - Z_1)}{Z_2 + Z_1} = \frac{2Z_2}{Z_1 + Z_2}$$
        !!intuition Does this make sense?
          Equal impedances: $\Gamma_{12} = 0$ and $\tau_{12} = 1$. The wave cannot tell that a junction is there. Line 2 very large (almost open): $\Gamma_{12} \to 1$, $\tau_{12} \to 2$, the open-end doubling. Line 2 very small (almost a short): $\Gamma_{12} \to -1$, $\tau_{12} \to 0$.
      `, { junc: { svg: juncFig(), cap: 'At the junction: the incident wave on line 1, its reflection back on line 1, and the transmitted wave on line 2.' } }),
      Q(md`**Predict.** Spring 2024: $Z_{01} = 150\ \Omega$ meets $Z_{02} = 50\ \Omega$. A 60 V wave arrives from line 1. What voltage enters line 2?`,
        [md`$30$ V`, md`$90$ V`, md`$-30$ V`, md`$60$ V`], 0,
        [null, md`That uses $\tau = 2Z_1/(Z_1 + Z_2) = \tfrac32$, the coefficient for a wave coming from line 2. Going into line 2, the top is $2Z_2$.`, md`That is the reflected wave, $\Gamma_{12}V^+$.`, md`That assumes the whole wave passes. It does only when the impedances match.`],
        md`$\Gamma_{12} = (50 - 150)/(50 + 150) = -\tfrac12$, so $\tau_{12} = \tfrac12$ and $V^{++} = 30$ V. The reflected wave is $-30$ V, and $60 - 30 = 30$ V ✓: the same voltage on both sides.`),
      R(md`
        ### 2. A junction is a load (until something comes back)

        Compare the two formulas:
        $$\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0}, \qquad \Gamma_{12} = \frac{Z_2 - Z_1}{Z_2 + Z_1}$$
        They are the same, with $Z_2$ in the place of $R_L$. That is not a coincidence. The transmitted wave $V^{++}$ has $V/I = Z_2$, so to line 1, line 2 behaves exactly like a resistor of value $Z_2$. That stays true **as long as no wave comes back along line 2.**

        **The rule in words.** "The impedance you are going into, minus the one you are in, over their sum." So for a wave coming from line 2 toward line 1, swap the roles:
        $$\Gamma_{21} = \frac{Z_1 - Z_2}{Z_1 + Z_2} = -\Gamma_{12}$$
        $$\tau_{21} = 1 + \Gamma_{21} = \frac{2Z_1}{Z_1 + Z_2}$$
        For the Spring 2024 junction ($150\ \Omega \to 50\ \Omega$):

        | Direction | $\Gamma$ | $\tau = 1 + \Gamma$ |
        |---|---|---|
        | line 1 → line 2 | $\Gamma_{12} = -\tfrac12$ | $\tau_{12} = \tfrac12$ |
        | line 2 → line 1 | $\Gamma_{21} = +\tfrac12$ | $\tau_{21} = \tfrac32$ |

        **A useful consequence.** If line 2 ends in a matched load ($R_L = Z_2$), nothing ever comes back along line 2. Then for line 1, line 2 *is* a resistor $Z_2$ forever, and line 1 is a single-line problem from [Topic 15](#/l/w5-bounce) with "$R_L$" $= Z_2$.

        !!intuition Does this make sense?
          $\tau_{21}$ can be bigger than 1 while $\tau_{12}$ is smaller than 1. The voltage is continuous at the junction; what changes is how voltage and current share the wave. Section 3 shows energy is still conserved.
      `),
      Q(md`**Predict.** A junction has $\Gamma_{12} = \tfrac13$. What is $\tau_{21}$?`,
        [md`$\tfrac23$`, md`$\tfrac43$`, md`$-\tfrac13$`, md`$\tfrac34$`], 0,
        [null, md`That is $\tau_{12} = 1 + \Gamma_{12}$, for the other direction.`, md`That is $\Gamma_{21}$. The transmission coefficient is $1 + \Gamma_{21}$.`, md`That inverts $\tau_{12}$. The two directions are related through $\Gamma_{21} = -\Gamma_{12}$, not by inversion.`],
        md`$\Gamma_{21} = -\Gamma_{12} = -\tfrac13$, so $\tau_{21} = 1 - \tfrac13 = \tfrac23$.`),
      R(md`
        ### 3. $\tau_{12} > 1$ is not free energy

        Going from 50 Ω into 150 Ω, $\Gamma_{12} = \tfrac12$ and $\tau_{12} = \tfrac32$: the transmitted voltage is **bigger** than the incident one. Does the junction create energy? Check the power.

        One wave of voltage $V$ on a line $Z$ carries current $V/Z$, so it carries power
        $$P = V\cdot\frac{V}{Z} = \frac{V^2}{Z}$$
        Write the three powers with $V^- = \Gamma V^+$ and $V^{++} = \tau V^+$ (dropping the subscripts):
        $$P_{\text{inc}} = \frac{(V^+)^2}{Z_1}, \quad P_{\text{ref}} = \Gamma^2\frac{(V^+)^2}{Z_1}, \quad P_{\text{tr}} = \tau^2\frac{(V^+)^2}{Z_2}$$
        Energy is conserved if $P_{\text{ref}} + P_{\text{tr}} = P_{\text{inc}}$. Divide through by $P_{\text{inc}}$:
        $$\Gamma^2 + \tau^2\frac{Z_1}{Z_2} = 1\ ?$$
        Put in $\tau = 2Z_2/(Z_1 + Z_2)$. The second term is
        $$\tau^2\frac{Z_1}{Z_2} = \frac{4Z_2^2}{(Z_1 + Z_2)^2}\cdot\frac{Z_1}{Z_2} = \frac{4Z_1Z_2}{(Z_1 + Z_2)^2}$$
        Add $\Gamma^2 = (Z_2 - Z_1)^2/(Z_1 + Z_2)^2$. The top becomes
        $$Z_2^2 - 2Z_1Z_2 + Z_1^2 + 4Z_1Z_2 = (Z_1 + Z_2)^2$$
        which is the bottom. So the sum is exactly 1 ✓.

        **The numbers for 50 Ω into 150 Ω.** Reflected fraction $\Gamma^2 = \tfrac14$. Transmitted fraction $\tau^2Z_1/Z_2 = \tfrac94\cdot\tfrac{50}{150} = \tfrac34$. Total 1 ✓. The voltage went up by $\tfrac32$, but the current went **down**: $I^{++} = \tau V^+/Z_2 = \tfrac32\cdot\tfrac13\,(V^+/Z_1) = \tfrac12I^+$. More voltage, less current, like a step-up transformer.

        !!intuition Does this make sense?
          The current transmission ratio is $I^{++}/I^+ = \tau Z_1/Z_2 = 1 - \Gamma$. For voltage it is $1 + \Gamma$. One goes up exactly when the other goes down, and their product $1 - \Gamma^2$ is the fraction of the power that gets through.
      `),
      Q(md`**Predict.** Spring 2024's junction, 150 Ω into 50 Ω. What fraction of the incident power goes into line 2?`,
        [md`$\tfrac34$`, md`$\tfrac14$`, md`$\tfrac12$`, md`$\tfrac32$`], 0,
        [null, md`That is $\Gamma_{12}^2$, the reflected fraction (and also $\tau_{12}^2$ without the impedance ratio).`, md`That is $\tau_{12}$ itself. Power needs $\tau^2Z_1/Z_2$.`, md`A fraction of the power cannot exceed 1.`],
        md`$\tau_{12}^2Z_1/Z_2 = \tfrac14\cdot\tfrac{150}{50} = \tfrac34$. Check: $1 - \Gamma_{12}^2 = 1 - \tfrac14 = \tfrac34$ ✓.`),
      RF(md`
        ### 4. A resistor across the junction

        Now put a resistor $R$ across the wires at the junction (a "shunt"). The wires still connect directly, so condition (1) is unchanged:
        $$V^+ + V^- = V^{++}$$
        The current arriving from line 1 now splits: part goes down through $R$, part goes on into line 2. Both see the same voltage $V^{++}$:
        $$\frac{V^+ - V^-}{Z_1} = \frac{V^{++}}{R} + \frac{V^{++}}{Z_2}$$
        The two terms on the right are a parallel combination:
        $$\frac{1}{R} + \frac{1}{Z_2} = \frac{1}{Z_{\text{eq}}}, \qquad Z_{\text{eq}} = \frac{RZ_2}{R + Z_2}$$
        So the equations are the ones of Section 1 with $Z_2$ replaced by $Z_{\text{eq}}$. The algebra goes through unchanged:
        $$\boxed{\Gamma_{12} = \frac{Z_{\text{eq}} - Z_1}{Z_{\text{eq}} + Z_1}}, \qquad \boxed{\tau_{12} = 1 + \Gamma_{12}}$$
        $\tau_{12}$ is still $1 + \Gamma_{12}$ because $R$ and line 2 share one voltage. For a wave coming from line 2, use $Z_{\text{eq}} = R\parallel Z_1$ instead.

        [[fig:shunt]]

        **Example.** $Z_1 = 50\ \Omega$, $Z_2 = 100\ \Omega$, $R = 100\ \Omega$. Then $Z_{\text{eq}} = 100\parallel100 = 50\ \Omega$, so
        $$\Gamma_{12} = \frac{50 - 50}{50 + 50} = 0, \qquad \tau_{12} = 1$$
        No reflection at all, yet line 2 does not get all the power. Each of $R$ and line 2 takes $V^2/100$, which is half of the incident $V^2/50$. The resistor absorbs the other half.

        **Example with a reflection.** $Z_1 = Z_2 = 100\ \Omega$, $R = 100\ \Omega$. $Z_{\text{eq}} = 50\ \Omega$:
        $$\Gamma_{12} = \frac{50 - 100}{150} = -\frac13, \qquad \tau_{12} = \frac23$$
        Power: reflected $\tfrac19$; into line 2 $\tau^2 = \tfrac49$ (same $Z$); into $R$ also $\tfrac49$ (same voltage, same resistance). Total $\tfrac19 + \tfrac49 + \tfrac49 = 1$ ✓.

        !!intuition Does this make sense?
          $R \to \infty$ removes the resistor: $Z_{\text{eq}} \to Z_2$, back to Section 1. $R \to 0$ shorts the junction: $Z_{\text{eq}} \to 0$, $\Gamma_{12} \to -1$ and nothing gets into line 2. (A resistor in **series** at the junction is different: then $Z_{\text{eq}} = R + Z_2$ for $\Gamma$, but line 2 gets only the share $Z_2/(R + Z_2)$ of the junction voltage, so $\tau \neq 1 + \Gamma$ there.)
      `, { shunt: { svg: juncFig({ R: 'R', alt: 'Two lines meet at a junction with a resistor R connected across the wires there.' }), cap: 'A shunt resistor at the junction: the incoming wave sees R in parallel with Z₂.' } }),
      Q(md`**Predict.** $Z_1 = 100\ \Omega$, $Z_2 = 150\ \Omega$, and $R = 75\ \Omega$ across the junction. What is $\Gamma_{12}$?`,
        [md`$-\tfrac13$`, md`$\tfrac15$`, md`$\tfrac5{13}$`, md`$\tfrac13$`], 0,
        [null, md`That ignores the resistor: $(150 - 100)/(250)$.`, md`That puts $R$ in series: $Z_{\text{eq}} = 225\ \Omega$. A shunt is in parallel.`, md`That has the sign flipped. $Z_{\text{eq}} = 50\ \Omega$ is smaller than $Z_1$, so $\Gamma_{12} < 0$.`],
        md`$Z_{\text{eq}} = 75\cdot150/225 = 50\ \Omega$. $\Gamma_{12} = (50 - 100)/(150) = -\tfrac13$.`),
      RF(md`
        ### 5. Different speeds in different sections

        Each section can have its own speed $v_k$ (different dielectric) and length $l_k$, so its own one-way time
        $$T_k = \frac{l_k}{v_k}$$
        On the bounce diagram, lines in a slower section are steeper. **Times add along a path:** the first wave reaches the end of section 2 at $T_1 + T_2$.

        Here is a two-speed circuit: $V_g = 60u(t)$ V, $R_g = 50\ \Omega$; line 1 is 50 Ω, 200 m at 100 m/µs ($T_1 = 2$ µs); line 2 is 100 Ω, 200 m at 200 m/µs ($T_2 = 1$ µs); $R_L = 300\ \Omega$. The coefficients: $\tau_g = \tfrac12$, $\Gamma_g = 0$, $\Gamma_{12} = \tfrac13$, $\tau_{12} = \tfrac43$, $\Gamma_{21} = -\tfrac13$, $\tau_{21} = \tfrac23$, $\Gamma_L = \tfrac12$.

        [[fig:speeds]]

        **Where do $Z_0$ and $v$ come from?** From the line's inductance $L$ and capacitance $C$ per meter ([Topic 13](#/l/w5-telegraph)):
        $$Z_0 = \sqrt{\frac{L}{C}}, \qquad v = \frac{1}{\sqrt{LC}}$$
        Multiply the two: the $L$s cancel and the $C$s combine.
        $$Z_0v = \sqrt{\frac{L}{C}}\cdot\frac{1}{\sqrt{LC}} = \frac1C$$
        Divide them: the $C$s cancel.
        $$\frac{Z_0}{v} = \sqrt{\frac{L}{C}}\cdot\sqrt{LC} = L$$
        So
        $$\boxed{L = \frac{Z_0}{v}, \qquad C = \frac{1}{Z_0v}}$$
        For the two sections above: $L_1 = 50/(10^8) = 0.5\ \mu$H/m and $C_1 = 1/(50\cdot10^8) = 200$ pF/m; $L_2 = 100/(2\times10^8) = 0.5\ \mu$H/m and $C_2 = 1/(100\cdot2\times10^8) = 50$ pF/m. Doubling both $Z_0$ and $v$ keeps $L$ and divides $C$ by 4 (Lecture 30 makes the same point).

        !!intuition Does this make sense?
          A slower line has more $L$ and $C$ per meter (more to charge up). A higher-impedance line has more $L$ or less $C$. The two numbers $Z_0$ and $v$ pin down $L$ and $C$ exactly.
      `, { speeds: { svg: diag(sM, { tMax: 7, w: 400, h: 330 }), cap: 'Two speeds: the 2 µs section on the left has steeper lines than the 1 µs section on the right. The dashed line is the junction at 200 m.' } }),
      Q(md`**Predict.** In the two-speed circuit above, when does the first wave reflected by the load get back to the generator?`,
        [md`$6$ µs`, md`$4$ µs`, md`$8$ µs`, md`$3$ µs`], 0,
        [null, md`That times the return trip at line 2's speed all the way. Line 1 is slower: 2 µs each way.`, md`That uses line 1's speed for all 800 m.`, md`That is when it reaches the load.`],
        md`Out: $T_1 + T_2 = 2 + 1 = 3$ µs. Back: $T_2 + T_1 = 3$ µs. Total 6 µs. (It then meets $\Gamma_g = 0$ and is absorbed.)`),
      RF(md`
        ### 6. Building a multi-line diagram

        The diagram has more lines now, because **a wave that hits a junction makes two new waves**: a reflected one that goes back into its own section, and a transmitted one that goes on into the next. A wave that hits an end (generator or load) makes one.

        The safe way to build it is in **time order**: keep a list of "a wave hits a boundary at time $t$" and handle the earliest one first. Here is Spring 2024 #4.

        [[fig:c24]]

        **The coefficients.** $\tau_g = 150/(50 + 150) = \tfrac34$, $\Gamma_g = (50 - 150)/(200) = -\tfrac12$, $\Gamma_{12} = -\tfrac12$, $\tau_{12} = \tfrac12$, $\Gamma_{21} = \tfrac12$, $\tau_{21} = \tfrac32$, $\Gamma_L = (50 - 50)/100 = 0$. Each section takes $150/150 = 1$ µs.

        | Time (µs) | What hits what | New waves |
        |---|---|---|
        | 0 | the generator switches on | $\tfrac34\cdot80 = 60$ V forward in line 1 |
        | 1 | 60 V hits the junction | $60\Gamma_{12} = -30$ V back in line 1; $60\tau_{12} = 30$ V into line 2 |
        | 2 | $-30$ V hits the generator | $-30\Gamma_g = 15$ V forward in line 1 |
        | 2 | 30 V hits the matched load | none |
        | 3 | 15 V hits the junction | $-7.5$ V back in line 1; $7.5$ V into line 2 |
        | 4 | $-7.5$ V hits the generator | $3.75$ V forward in line 1 |

        [[fig:bd24]]

        When two waves hit the same junction at the same moment from opposite sides, handle each one separately (two new waves each) and add the waves that leave in the same direction.

        !!intuition Does this make sense?
          After every hit, check continuity at the junction. At $t = 1$ µs: left side $60 - 30 = 30$ V, right side 30 V ✓. At $t = 3$ µs: left side gains $15 - 7.5 = 7.5$ V, right side gains 7.5 V ✓.
      `, {
        c24: { svg: circ24, cap: md`Spring 2024 #4: $V_g = 80u(t)$ V, two 150 m sections at $v = c/2 = 150$ m/µs.` },
        bd24: { svg: diag(s24, { tMax: 4.5 }), cap: 'Spring 2024 #4, voltage bounce diagram. The dashed line is the junction at 150 m. Nothing returns from the matched load.' },
      }),
      Q(md`**Predict.** Spring 2024 #4. What is the wave that enters line 2 at $t = 3$ µs?`,
        [md`$7.5$ V`, md`$15$ V`, md`$-7.5$ V`, md`$22.5$ V`], 0,
        [null, md`That passes the 15 V wave through unchanged. It is multiplied by $\tau_{12} = \tfrac12$.`, md`That is the part reflected back into line 1, $15\Gamma_{12}$.`, md`That uses $\tau_{21} = \tfrac32$, the coefficient for waves coming from line 2.`],
        md`$15\tau_{12} = 15\cdot\tfrac12 = 7.5$ V.`),
      RF(md`
        ### 7. Reading $V(z, t)$ when there are several sections

        The vertical-line rule from [Topic 15](#/l/w5-bounce) still works, with one change: **only the lines in the section that contains $z$ cross your vertical line.** A wave in line 2 never passes a point in line 1.

        **Spring 2024 #4 at $z = 100$ m** (in line 1). A forward line that leaves $z = 0$ at time $t_s$ passes 100 m at $t_s + 100/150 = t_s + \tfrac23$. A backward line that leaves the junction (150 m) at $t_s$ passes 100 m at $t_s + 50/150 = t_s + \tfrac13$:

        | Wave in line 1 | Leaves at (µs) | Passes 100 m at (µs) | Label (V) | $V(100, t)$ (V) |
        |---|---|---|---|---|
        | forward | 0 | $\tfrac23$ | 60 | 60 |
        | backward | 1 | $\tfrac43$ | $-30$ | 30 |
        | forward | 2 | $\tfrac83$ | 15 | 45 |
        | backward | 3 | $\tfrac{10}{3}$ | $-7.5$ | 37.5 |

        [[fig:read24]]

        **At $z = 200$ m** (in line 2), only line 2's waves count: 30 V passes at $1 + \tfrac13 = \tfrac43$ µs and 7.5 V at $3 + \tfrac13 = \tfrac{10}{3}$ µs, so $V(200, t)$ goes $0 \to 30 \to 37.5$ V.

        **The steady state** is still the DC circuit, and in DC every line is just two wires:
        $$I_\infty = \frac{80}{50 + 50} = 0.8\ \text{A}, \qquad V_\infty = 40\ \text{V}$$
        everywhere, including at $z = l/2$.

        !!intuition Does this make sense?
          $V(100, t)$ rings $60 \to 30 \to 45 \to 37.5$ around 40 V, because line 1 bounces between two negative reflections ($\Gamma_g = \Gamma_{12} = -\tfrac12$). Line 2 just climbs $30 \to 37.5 \to 39.4$, because it only receives.
      `, { read24: { svg: PF.row([{ svg: diag(s24, { tMax: 4, probe: 100, w: 360, h: 310 }), cap: 'The probe line at 100 m crosses four lines of line 1 by 4 µs.' }, { svg: stair(s24, 100, { tMax: 4, w: 340, name: 'V(100\\ \\text{m},t)' }), cap: 'V(100 m, t): 60, 30, 45, 37.5 V, around the dashed 40 V.' }]).svg, cap: '' } }),
      Q(md`**Predict.** Spring 2024 #4. What is $V(200\ \text{m}, 3.5\ \mu\text{s})$?`,
        [md`$37.5$ V`, md`$30$ V`, md`$45$ V`, md`$7.5$ V`], 0,
        [null, md`That misses the 7.5 V wave, which passed 200 m at $\tfrac{10}{3} \approx 3.33$ µs.`, md`That adds the 15 V wave of line 1. Line 1's waves never pass a point in line 2.`, md`That is only the newest wave; the 30 V wave is still there.`],
        md`Line 2 has 30 V (passes 200 m at $\tfrac43$ µs) and 7.5 V (at $\tfrac{10}{3}$ µs). At 3.5 µs: 37.5 V.`),
      R(md`
        ### 8. Reading a scope trace backwards

        Now turn the problem around. Someone sends a pulse $A_0\delta(t)$ into an unknown circuit and records the voltage at one point $z_0$. From the trace you can recover almost everything. Each pulse carries two numbers, its **time** and its **height**, and each has one job.

        **First pulse: the speed and $\tau_g$.** It is the first forward wave, so it arrives at $t_1 = z_0/v$:
        $$v = \frac{z_0}{t_1}$$
        If the line is non-magnetic, $v = c/\sqrt{\epsilon_r}$, so
        $$\epsilon_r = \left(\frac{c}{v}\right)^2$$
        Its height is $h_1 = \tau_gA_0$. If $A_0$ is known, that gives $\tau_g$ and then $R_g$:
        $$\tau_g = \frac{h_1}{A_0}, \qquad R_g = Z_0\left(\frac{1}{\tau_g} - 1\right)$$
        (The second formula is $\tau_g = Z_0/(R_g + Z_0)$ solved for $R_g$.)

        **Second pulse: the load.** It is the first reflected wave, so $h_2 = \Gamma_Lh_1$:
        $$\Gamma_L = \frac{h_2}{h_1}$$
        Solve $\Gamma_L(R_L + Z_0) = R_L - Z_0$ for $R_L$. Collect the $R_L$ terms:
        $$R_L(1 - \Gamma_L) = Z_0(1 + \Gamma_L)$$
        $$\boxed{R_L = Z_0\,\frac{1 + \Gamma_L}{1 - \Gamma_L}}$$
        Its time $t_2 = (2l - z_0)/v$ gives the length $l$ if you do not know it.

        **Third pulse: the generator.** $h_3 = \Gamma_gh_2$, so $\Gamma_g = h_3/h_2$, and $R_g$ follows from the same boxed formula with $\Gamma_g$. This is a second route to $R_g$; when both routes are available they must agree, and if $A_0$ is unknown it gives you $A_0 = h_1/\tau_g$.

        **Missing pulses are information.**
        - No second pulse: $\Gamma_L = 0$, so $R_L = Z_0$.
        - Second pulse but no third: $\Gamma_g = 0$, so $R_g = Z_0$.
        - No second pulse **and** you want $R_g$: nothing ever comes back to the generator, so $\Gamma_g$ can never show up. Only the first pulse's height (with a known $A_0$) can give $R_g$.

        **Spring 2017.** $30\delta(t)$ into a 100 m, 50 Ω line; at $z = 50$ m the scope shows one pulse, $25\delta(t - 1)$, and nothing else. No second pulse: $R_L = 50\ \Omega$. The height: $\tau_g = 25/30 = \tfrac56$, so
        $$R_g = 50\left(\frac65 - 1\right) = 10\ \Omega$$
        And $v = 50\ \text{m}/1\ \mu\text{s} = 5\times10^7$ m/s, so $\epsilon_r = (3\times10^8/5\times10^7)^2 = 36$.

        !!intuition Does this make sense?
          $h_2/h_1 = \Gamma_L$ is a ratio of two heights at the **same** point, so $\tau_g$ and $A_0$ cancel out of it. That is why the load is the easiest thing to read off a trace, and the generator the hardest.
      `),
      Q(md`**Predict.** On a 75 Ω line a scope shows a first pulse of height $30$ and a second (reflected) pulse of height $-15$. What is $R_L$?`,
        [md`$25\ \Omega$`, md`$225\ \Omega$`, md`$37.5\ \Omega$`, md`$75\ \Omega$`], 0,
        [null, md`That uses $\Gamma_L = +\tfrac12$. The second pulse is negative, so $\Gamma_L = -\tfrac12$.`, md`That is $Z_0|\Gamma_L|$. Use $R_L = Z_0(1 + \Gamma_L)/(1 - \Gamma_L)$.`, md`A matched load would send nothing back.`],
        md`$\Gamma_L = -15/30 = -\tfrac12$. $R_L = 75\cdot\tfrac{1/2}{3/2} = 25\ \Omega$.`),
      R(md`
        ### 9. What never comes back when a section is matched

        A matched end swallows every wave that reaches it. That cuts the bounce diagram down, and it tells you which coefficients you will never need.

        - **Matched load ($R_L = Z_{\text{last}}$).** Every wave that enters the last section is gone after one trip. In Spring 2024, 30 V and 7.5 V enter line 2 and never return. So $\Gamma_{21}$ and $\tau_{21}$ are never used, even though the exam asks you to write them on the diagram.
        - **Matched generator ($R_g = Z_1$).** Whatever comes back to $z = 0$ is absorbed. No wave is ever relaunched.
        - **Matched junction ($Z_1 = Z_2$, or $Z_{\text{eq}} = Z_1$ with a shunt).** No reflection there: the junction is invisible to the voltage.

        In Spring 2024 the only bouncing left is inside line 1, between $\Gamma_g = -\tfrac12$ and $\Gamma_{12} = -\tfrac12$. Each round trip in line 1 multiplies by $\Gamma_g\Gamma_{12} = \tfrac14$. So the waves sent into line 2 are $30, 7.5, 1.875, \dots$, and their total is
        $$\frac{30}{1 - \tfrac14} = 40\ \text{V}$$
        which is the DC voltage ✓.

        **What if the load were not matched?** Say $R_L = 150\ \Omega$ instead. Then $\Gamma_L = (150 - 50)/200 = \tfrac12$, and the 30 V wave comes back as 15 V. At the junction it splits: $15\Gamma_{21} = 7.5$ V back into line 2, and $15\tau_{21} = 22.5$ V on into line 1. Now $\tau_{21} = \tfrac32$ matters.

        !!intuition Does this make sense?
          A matched far end turns a whole section into a resistor. With $R_L = Z_{02}$, line 1 sees "a 50 Ω resistor at 150 m", so line 1 alone is a single-line problem with $\Gamma = -\tfrac12$ at its far end. That is exactly $\Gamma_{12}$.
      `),
      Q(md`**Predict.** Spring 2024 with $R_L = 150\ \Omega$ instead. The 30 V wave in line 2 reflects at the load and returns to the junction. How big is the wave it sends into line 1?`,
        [md`$22.5$ V`, md`$15$ V`, md`$7.5$ V`, md`$45$ V`], 0,
        [null, md`That forgets the junction: going from line 2 into line 1 multiplies by $\tau_{21} = \tfrac32$.`, md`That is the part reflected back into line 2 ($15\Gamma_{21}$), or uses $\tau_{12}$.`, md`That multiplies the 30 V wave by $\tau_{21}$ without the load's $\Gamma_L = \tfrac12$ first.`],
        md`$30\cdot\Gamma_L = 15$ V comes back; $15\cdot\tau_{21} = 15\cdot\tfrac32 = 22.5$ V goes into line 1.`),
      RF(md`
        ### The method

        !!method Multi-line circuits and scope traces
          1. **Every boundary's coefficients.** Ends: $\tau_g$, $\Gamma_g$, $\Gamma_L$. Each junction, both directions: $\Gamma_{jk} = (Z_k - Z_j)/(Z_k + Z_j)$, $\tau_{jk} = 1 + \Gamma_{jk}$. With a shunt $R$, use $Z_{\text{eq}} = Z_k\parallel R$.
          2. **Every section's clock.** $T_k = l_k/v_k$.
          3. **Build in time order.** A wave hitting a junction makes two waves; hitting an end makes one. Add waves that leave the same point in the same direction at the same time.
          4. **Read at a point.** Only the lines of that point's section; running total for a step.
          5. **Check.** Voltage continuity at each junction after each hit; the DC circuit (lines are wires) for the final value.
          6. **Backwards from a trace.** $v = z_0/t_1$; $\tau_g = h_1/A_0$; $\Gamma_L = h_2/h_1$; $\Gamma_g = h_3/h_2$; $R = Z_0(1 + \Gamma)/(1 - \Gamma)$; a missing pulse means a matched end.

        ### Worked example 1: Spring 2024 #4, slowly

        !!graded Problem
          Two lines, each $l/2 = 150$ m long, connect a Thévenin source ($R_g = 50\ \Omega$) at $z = 0$ to a load $R_L = 50\ \Omega$ at $z = l = 300$ m. $Z_{01} = 150\ \Omega$, $Z_{02} = 50\ \Omega$, and $v = c/2$ on both. $V_g = 80u(t)$ V. (a) Complete the voltage bounce diagram for $0 < t < 4$ µs with $\tau_g$, $\Gamma_g$, $\Gamma_L$ and the junction coefficients. (b) Find $V(100\ \text{m}, t)$ for $0 < t < 4$ µs. (c) Find the DC steady-state current at $z = l/2$.

        **Step 1: the clock.** $v = c/2 = 1.5\times10^8$ m/s $= 150$ m/µs. Each section: $T = 150/150 = 1$ µs.

        **Step 2: the generator end.** The first wave sees line 1, 150 Ω:
        $$\tau_g = \frac{150}{50 + 150} = \frac34$$
        so $V^+ = \tfrac34\cdot80 = 60$ V. A wave returning to the generator sees $R_g$:
        $$\Gamma_g = \frac{50 - 150}{50 + 150} = -\frac12$$
        **Step 3: the junction, both ways.** From line 1 into line 2:
        $$\Gamma_{12} = \frac{50 - 150}{50 + 150} = -\frac12, \quad \tau_{12} = \frac12$$
        From line 2 into line 1:
        $$\Gamma_{21} = +\frac12, \quad \tau_{21} = \frac32$$
        **Step 4: the load.** $\Gamma_L = (50 - 50)/(100) = 0$. Matched.

        **Step 5: the diagram, in time order.** 60 V (0 to 1 µs); at the junction $-30$ V back and 30 V on; at the generator $-30 \to +15$; at the junction $-7.5$ back and 7.5 on; at the generator $-7.5 \to 3.75$. That is the diagram in Section 6.

        **Step 6: $V(100\ \text{m}, t)$.** From Section 7: 0 until $\tfrac23$ µs, then 60 V, 30 V at $\tfrac43$ µs, 45 V at $\tfrac83$ µs, 37.5 V at $\tfrac{10}{3}$ µs.

        **Step 7: the DC current.** In DC both lines are wires: $R_g$ and $R_L$ in series.
        $$I_{ss} = \frac{80}{50 + 50} = 0.8\ \text{A}$$
        It is the same at every $z$, including $l/2$.

        **Check.** At the junction, the current from the waves: line 2's waves carry $30/50 + 7.5/50 = 0.75$ A after 3 µs, heading to 0.8 A ✓. The posted key's numbers all agree with these.

        **Speed path.** Write the seven coefficients in a row ($\tfrac34, -\tfrac12, -\tfrac12, \tfrac12, \tfrac12, \tfrac32, 0$). Notice $\Gamma_L = 0$: line 2 is a resistor, so only line 1 rings, with factor $\tfrac14$ per round trip. Labels $60, -30, 15, -7.5$; probe times $\tfrac23 + 2n$ and $\tfrac43 + 2n$. DC: $80/100$.

        **Where points go.** (1) $\tau_{12} = \tfrac32$ (the top of the fraction must be the impedance you go **into**). (2) Adding line 2's 30 V to the reading at 100 m. (3) Probe times measured from the load instead of from the junction for backward waves. (4) Using $Z_{01}$ or $Z_{02}$ in the DC current.

        ### Worked example 2: Fall 2023 #4, the scope trace

        !!graded Problem
          A pulse generator with unknown internal resistance sends $30\delta(t)$ into a lossless 100 m line with $Z_0 = 50\ \Omega$, ending in an unknown resistor $R_L$. At $z = 50$ m the scope shows two pulses, $A\,\delta(t - 1)$ and $\tfrac{A}{2}\delta(t - 3)$ (t in µs), and nothing else. Find (a) $R_g$, (b) $R_L$, (c) $A$, (d) $\epsilon_r$ if $\mu = \mu_0$.

        [[fig:f4]]

        **Step 1: what each pulse is.** The first pulse is the first forward wave. The second is its reflection from the load. A third would be the generator's re-reflection, and there is none.

        **Step 2: (a) the generator.** No third pulse means $\Gamma_g\cdot\tfrac{A}{2} = 0$, so $\Gamma_g = 0$:
        $$R_g = Z_0 = 50\ \Omega$$
        **Step 3: (b) the load.** The ratio of the heights at the same point:
        $$\Gamma_L = \frac{A/2}{A} = \frac12$$
        Then
        $$R_L = 50\cdot\frac{1 + \tfrac12}{1 - \tfrac12} = 50\cdot3 = 150\ \Omega$$
        **Step 4: (c) the height.** With $R_g = 50\ \Omega$, $\tau_g = 50/100 = \tfrac12$, so
        $$A = \tau_g\cdot30 = 15$$
        **Step 5: (d) the material.** The first pulse travels 50 m in 1 µs:
        $$v = 50\ \text{m}/\mu\text{s} = 5\times10^7\ \text{m/s}$$
        $$\sqrt{\epsilon_r} = \frac{c}{v} = \frac{3\times10^8}{5\times10^7} = 6$$
        so $\epsilon_r = 36$.

        **Check the second time.** The reflection travels to the load (50 m more) and back to 50 m (50 m): 100 m at 50 m/µs is 2 µs after the first pulse: $t = 3$ µs ✓.

        **Speed path.** Missing pulse → matched end. Height ratio → $\Gamma_L$. $\tau_g$ times the source → $A$. $z_0/t_1$ → $v$ → square $c/v$.

        **Where points go.** (1) $\epsilon_r = 6$: forgetting to square. (2) $R_L = 50/3\ \Omega$: inverting the $R_L$ formula. (3) $A = 30$: forgetting $\tau_g$. (4) Saying $R_g$ "cannot be found": the missing third pulse is the information.

        ### Worked example 3: Fall 2023 #3, three sections, fast

        !!graded Problem
          $\delta(t)$ source with 100 Ω; sections of 100 Ω, 50 Ω and 150 Ω, each 1 µs long; load 150 Ω. Find (i) $\tau_g$; (ii) the voltage reflection coefficient at the first junction for a wave going right; (iii) the **current** reflection coefficient at the second junction for a wave going right; (iv) the earliest time a wave reflected at the second junction reaches the generator.

        [[fig:c3]]

        **(i)** $\tau_g = 100/(100 + 100) = \tfrac12$.

        **(ii)** $\Gamma_{12} = (50 - 100)/(50 + 100) = -\tfrac13$.

        **(iii)** For voltage, $\Gamma_{23} = (150 - 50)/(150 + 50) = \tfrac12$. The reflected wave travels backward, so its current has the opposite sign: the current reflection coefficient is $-\Gamma_{23} = -\tfrac12$.

        **(iv)** The first wave reaches the second junction after two sections, 2 µs. Its reflection needs two more sections to get back: $t = 4$ µs.

        [[fig:bd3]]

        The diagram also shows what never comes back: the generator ($\Gamma_g = 0$) and the load ($\Gamma_L = 0$) are both matched, so only the middle section rings, between $\Gamma_{21} = \tfrac13$ and $\Gamma_{23} = \tfrac12$.

        ### Speed tricks

        !!key Speed tricks
          - **"Into minus from, over the sum."** $\Gamma_{jk} = (Z_k - Z_j)/(Z_k + Z_j)$, and $\tau = 1 + \Gamma$ always (for a junction with only shunt elements).
          - **Reverse direction: flip the sign of $\Gamma$.** $\Gamma_{21} = -\Gamma_{12}$, $\tau_{21} = 1 - \Gamma_{12}$. Check: $\tau_{12}\tau_{21} = 1 - \Gamma^2$.
          - **Matched far end = resistor.** Replace a section that ends matched by a resistor equal to its $Z_0$.
          - **Shunt at the junction:** $Z_{\text{eq}} = Z_{\text{next}}\parallel R$.
          - **Know these $R/Z_0$ ↔ $\Gamma$ pairs:** $2 \leftrightarrow \tfrac13$, $3 \leftrightarrow \tfrac12$, $4 \leftrightarrow \tfrac35$, and their inverses give the negatives.
          - **Scope trace:** $v = z_0/t_1$, $\epsilon_r = (c/v)^2$, $\Gamma_L = h_2/h_1$, $\Gamma_g = h_3/h_2$, $\tau_g = h_1/A_0$. Missing pulse = matched.
          - **DC:** every line is a wire. One divider gives the final value everywhere.

        !!mistake Common mistakes
          - **Upside-down $\Gamma_{12}$.** The impedance you are going **into** comes first.
          - **$\tau = 1 - \Gamma$.** That is the current ratio. The voltage transmission is $1 + \Gamma$.
          - **Thinking $\tau$ must be at most 1.** Into a higher impedance, $\tau > 1$; energy is still conserved.
          - **Only one new wave at a junction.** There are always two: reflected and transmitted.
          - **One speed for every section.** Each section has its own $T_k$.
          - **Reading a point with lines from another section.**
          - **$\epsilon_r = c/v$.** It is $(c/v)^2$.
          - **$R_L = Z_0(1 - \Gamma)/(1 + \Gamma)$.** Inverted. Check with $\Gamma = 1$: the right formula gives an open.
          - **Ignoring the sign of a pulse.** A negative reflected pulse means $R_L < Z_0$.

        ### Check questions
      `, {
        f4: { svg: PF.row([{ svg: circF4, cap: 'The circuit.' }, { svg: traceF4, cap: 'What the scope at 50 m shows.' }]).svg, cap: '' },
        c3: { svg: circF3, cap: 'Fall 2023 #3: three sections, 1 µs each.' },
        bd3: { svg: diag(sF3, { tMax: 5, unit: '', zUnit: 'm', alt: 'Bounce diagram of the three-section line for a unit impulse, each section drawn 100 m long at 100 meters per microsecond.' }), cap: 'Weights per unit impulse (sections drawn as 100 m at 100 m/µs; only the times matter). The −1/6 wave from the second junction reaches the generator as 2/9 at t = 4 µs.' },
      }),
      Q(md`What two physical facts give the junction coefficients?`,
        ['the voltage is the same on both sides, and the current in equals the current out', 'energy is conserved and the voltage doubles', 'the impedance is continuous and the speed is continuous', 'the reflected and transmitted waves are equal'], 0,
        [null, md`Energy conservation is a consequence you can check afterward, and the voltage doubles only at an open end.`, md`The impedance jumps at a junction; that jump is the whole reason for the reflection.`, md`They are equal only in special cases.`],
        md`KVL (one voltage) and KCL (one current) at the junction give $V^+ + V^- = V^{++}$ and $(V^+ - V^-)/Z_1 = V^{++}/Z_2$.`),
      Q(md`A wave goes from a 100 Ω line into a 300 Ω line. $\tau_{12}$ is…`,
        [md`$\tfrac32$`, md`$\tfrac12$`, md`$\tfrac34$`, md`$\tfrac13$`], 0,
        [null, md`That is $\Gamma_{12}$.`, md`That is $1 - \Gamma_{12}^2$, the transmitted power fraction.`, md`That is $Z_1/Z_2$.`],
        md`$\Gamma_{12} = (300 - 100)/400 = \tfrac12$, $\tau_{12} = \tfrac32$.`),
      Q(md`Two lines with $Z_1 = Z_2$ meet, but the dielectric changes so $v_2 = 2v_1$. What reflects at the junction?`,
        ['nothing', 'half the wave', 'a third of the wave', 'everything'], 0,
        [null, md`Reflection depends only on the impedances, which are equal.`, md`$\Gamma_{12} = 0$ when $Z_1 = Z_2$.`, md`Only a short or open reflects everything.`],
        md`$\Gamma_{12} = (Z_2 - Z_1)/(Z_2 + Z_1) = 0$. The wave just changes speed (its lines on the diagram change slope).`),
      Q(md`Line 2 ends in a matched load. Which coefficients will never appear in the voltage at a point in line 1?`,
        [md`$\Gamma_{21}$ and $\tau_{21}$`, md`$\Gamma_{12}$ and $\tau_{12}$`, md`$\Gamma_g$`, md`$\tau_g$`], 0,
        [null, md`$\Gamma_{12}$ reflects every forward wave back into line 1.`, md`Waves reflected at the junction return to the generator and reflect there.`, md`Every wave starts with $\tau_g$.`],
        md`$\Gamma_{21}$, $\tau_{21}$ act on waves coming from line 2, and none come back from a matched load.`),
      Q(md`$Z_1 = 50\ \Omega$, $Z_2 = 50\ \Omega$, and a $50\ \Omega$ resistor across the junction. $\Gamma_{12}$ is…`,
        [md`$-\tfrac13$`, md`$0$`, md`$\tfrac13$`, md`$-\tfrac12$`], 0,
        [null, md`That ignores the resistor; with it the wave sees $50\parallel50 = 25\ \Omega$.`, md`$Z_{\text{eq}} = 25 < Z_1$ makes $\Gamma$ negative.`, md`$(25 - 50)/(25 + 50) = -\tfrac13$, not $-\tfrac12$.`],
        md`$Z_{\text{eq}} = 25\ \Omega$; $\Gamma_{12} = (25 - 50)/75 = -\tfrac13$.`),
      Q(md`A line has $Z_0 = 100\ \Omega$ and $v = 2\times10^8$ m/s. Its inductance per meter is…`,
        [md`$0.5\ \mu$H/m`, md`$2\ \mu$H/m`, md`$50$ pF/m`, md`$20\ \mu$H/m`], 0,
        [null, md`That is $v/Z_0$ in the wrong units. $L = Z_0/v$.`, md`That is $C = 1/(Z_0v)$, the capacitance.`, md`Check the power of ten: $100/(2\times10^8) = 5\times10^{-7}$ H/m.`],
        md`$L = Z_0/v = 100/(2\times10^8) = 5\times10^{-7}$ H/m $= 0.5\ \mu$H/m.`),
      Q(md`A scope trace at $z_0$ shows a first pulse and nothing else, ever. What can you conclude?`,
        [md`$R_L = Z_0$, and $R_g$ can come only from the first pulse's height`, md`$R_L = Z_0$ and $R_g = Z_0$`, md`$R_g = Z_0$ only`, md`the line is open`], 0,
        [null, md`With no reflected wave, nothing ever reaches the generator, so $\Gamma_g$ is invisible: the missing third pulse says nothing about $R_g$.`, md`A matched generator would still allow a reflected pulse from the load, unless the load is matched too.`, md`An open load reflects everything.`],
        md`No second pulse: $\Gamma_L = 0$. Then no wave ever returns to the generator. Spring 2017 found $R_g = 10\ \Omega$ from the height alone: $\tau_g = 25/30$.`),
      R(md`
        ### Practice, level 1: the junction in one move

        **The trick:** into minus from, over the sum; $\tau = 1 + \Gamma$; reverse direction flips $\Gamma$. With a shunt, $Z_{\text{eq}} = Z_2\parallel R$.
      `),
      Object.assign(G('rf_w5b_junc', { need: 8 }), { id: 'w5-multi.r0' }),
      R(md`
        ### Practice, level 1: several sections

        **The trick:** each section has its own clock $T_k = l_k/v_k$; a junction makes two waves; only a point's own section crosses it.
      `),
      Object.assign(G('rf_w5b_multi', { need: 8 }), { id: 'w5-multi.r1' }),
      R(md`
        ### Practice, level 1: read the trace backwards

        **The trick:** $v = z_0/t_1$; $\Gamma_L = h_2/h_1$; $\tau_g = h_1/A_0$; $R = Z_0(1 + \Gamma)/(1 - \Gamma)$; a missing pulse means a matched end.
      `),
      Object.assign(G('rf_w5b_scope', { need: 8 }), { id: 'w5-multi.r2' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Each asks for the plan first. Two correct answers without opening the solution complete each one.
      `),
      G('w5b_junction', { need: 2 }),
      G('w5b_twoline', { need: 2 }),
      G('w5b_scope', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        Spring 2024 #4 with new numbers: the coefficients, the voltage at a point for four microseconds, and the steady state.
      `),
      G('w5b_twoexam', { need: 2 }),
    ],
  });

  // ================================================================ generators, Topic 16
  const ZJ = [25, 50, 75, 100, 150, 300];
  const pickPair = () => {
    for (let g = 0; g < 100; g++) {
      const Z1 = pick([50, 75, 100, 150]), r = pick([1 / 3, 1 / 2, 2, 3, 4, 1 / 4]), Z2 = Z1 * r;
      if (isInt(Z2) && Z2 >= 25 && Z2 <= 600) return [Z1, Z2];
    }
    return [50, 150];
  };
  // shunt pairs (Z2, R) whose parallel combination is a round number
  const SH = [[100, 100], [150, 75], [100, 300], [50, 50], [300, 150], [150, 150], [75, 150], [200, 200]];
  const par = (a, b) => a * b / (a + b);

  GENS.rf_w5b_junc = () => one([
    () => {
      const [Z1, Z2] = pickPair(), G12 = (Z2 - Z1) / (Z2 + Z1), r = `$${nice(G12)}$`;
      return MC('Γ at a junction', md`A wave on a $${Z1}\ \Omega$ line reaches a junction with a $${Z2}\ \Omega$ line. $\Gamma_{12}$ is…`, r,
        wr(r, [[`$${nice(-G12)}$`, md`That is upside down: the impedance you go **into** ($${Z2}$) comes first.`], [`$${nice(1 + G12)}$`, md`That is $\tau_{12} = 1 + \Gamma_{12}$.`], [`$${nice((Z2 - Z1) / Z2)}$`, md`The denominator is the sum $Z_1 + Z_2$.`], [`$${nice(Z1 / Z2)}$`, md`A ratio of impedances is not a reflection coefficient.`]]),
        md`$\Gamma_{12} = (${Z2} - ${Z1})/(${Z2} + ${Z1}) = ${nice(G12)}$.`);
    },
    () => {
      const [Z1, Z2] = pickPair(), t12 = 2 * Z2 / (Z1 + Z2), r = `$${nice(t12)}$`;
      return MC('τ at a junction', md`From a $${Z1}\ \Omega$ line into a $${Z2}\ \Omega$ line, the voltage transmission coefficient $\tau_{12}$ is…`, r,
        wr(r, [[`$${nice(2 * Z1 / (Z1 + Z2))}$`, md`That is $\tau_{21}$, for the opposite direction. The top is twice the impedance you go into.`], [`$${nice(1 - (Z2 - Z1) / (Z2 + Z1))}$`, md`That is $1 - \Gamma_{12}$, the ratio for current.`], [`$${nice((Z2 - Z1) / (Z2 + Z1))}$`, md`That is $\Gamma_{12}$.`], ['$1$', md`Full transmission needs equal impedances.`]]),
        md`$\tau_{12} = 2Z_2/(Z_1 + Z_2) = ${2 * Z2}/${Z1 + Z2} = ${nice(t12)}$.`);
    },
    () => {
      const [Z1, Z2] = pickPair(), G12 = (Z2 - Z1) / (Z2 + Z1), V = pick([12, 24, 30, 60]), back = pick([true, false]);
      const val = back ? V * (1 - G12) : V * (1 + G12), r = opV(val);
      return MC('A wave crosses', back ? md`A $${V}$ V wave on the $${Z2}\ \Omega$ line travels back toward a junction with a $${Z1}\ \Omega$ line. What voltage continues into the $${Z1}\ \Omega$ line?` : md`A $${V}$ V wave on a $${Z1}\ \Omega$ line reaches a $${Z2}\ \Omega$ line. What voltage continues into the $${Z2}\ \Omega$ line?`, r,
        wr(r, [[opV(back ? V * (1 + G12) : V * (1 - G12)), md`That uses the coefficient for the other direction. Going into $Z_k$, $\tau = 2Z_k/(Z_j + Z_k)$.`], [opV(back ? -V * G12 : V * G12), md`That is the reflected wave.`], [opV(V), md`Only equal impedances pass the wave unchanged.`]]),
        back ? md`$\tau_{21} = 2(${Z1})/(${Z1 + Z2}) = ${nice(1 - G12)}$, so $${V}\cdot${nice(1 - G12)} = ${nice(val)}$ V.` : md`$\tau_{12} = 2(${Z2})/(${Z1 + Z2}) = ${nice(1 + G12)}$, so $${V}\cdot${nice(1 + G12)} = ${nice(val)}$ V.`);
    },
    () => {
      const [Z1, Z2] = pickPair(), G12 = (Z2 - Z1) / (Z2 + Z1), frac = 1 - G12 * G12, r = `$${nice(frac)}$`;
      return MC('Power across a junction', md`A wave goes from a $${Z1}\ \Omega$ line into a $${Z2}\ \Omega$ line. What fraction of its power continues into the second line?`, r,
        wr(r, [[`$${nice((1 + G12) ** 2)}$`, md`That is $\tau^2$ without the impedance change. Power is $\tau^2Z_1/Z_2$.`], [`$${nice(G12 * G12)}$`, md`That is the reflected fraction.`], [`$${nice(1 + G12)}$`, md`That is $\tau$ itself, a voltage ratio.`], [`$${nice(1 - Math.abs(G12))}$`, md`Power goes with squares: $1 - \Gamma^2$.`]]),
        md`$\Gamma = ${nice(G12)}$; transmitted fraction $1 - \Gamma^2 = ${nice(frac)}$. Same as $\tau^2Z_1/Z_2 = ${nice((1 + G12) ** 2)}\cdot${Z1}/${Z2}$.`);
    },
    () => {
      const [Z2, R] = pick(SH), Zeq = par(Z2, R), Z1 = pick([25, 50, 75, 100, 150].filter((z) => z !== Zeq));
      const G = (Zeq - Z1) / (Zeq + Z1), r = `$${nice(G)}$`;
      return MC('Shunt resistor', md`A $${Z1}\ \Omega$ line meets a $${Z2}\ \Omega$ line, with a $${R}\ \Omega$ resistor across the junction. $\Gamma_{12}$ is…`, r,
        wr(r, [[`$${nice((Z2 - Z1) / (Z2 + Z1))}$`, md`That ignores the resistor. The wave sees $R\parallel Z_2 = ${p(Zeq)}\ \Omega$.`], [`$${nice((Z2 + R - Z1) / (Z2 + R + Z1))}$`, md`That puts $R$ in series. Across the wires means parallel.`], [`$${nice(-G)}$`, md`Upside down: $Z_{\text{eq}}$ (where the wave goes) comes first.`], [`$${nice((par(R, Z1) - Z2) / (par(R, Z1) + Z2))}$`, md`That is $\Gamma_{21}$, with $R\parallel Z_1$ seen from line 2.`]]),
        md`$Z_{\text{eq}} = ${R}\parallel${Z2} = ${p(Zeq)}\ \Omega$. $\Gamma_{12} = (${p(Zeq)} - ${Z1})/(${p(Zeq)} + ${Z1}) = ${nice(G)}$.`);
    },
    () => {
      const [Z1, Z2] = pickPair(), G = (Z2 - Z1) / (Z2 + Z1), r = `$${nice(1 - G)}$`;
      return MC('Current across a junction', md`From a $${Z1}\ \Omega$ line into a $${Z2}\ \Omega$ line: transmitted current over incident current is…`, r,
        wr(r, [[`$${nice(1 + G)}$`, md`That is the voltage ratio $\tau_{12}$.`], [`$${nice(-G)}$`, md`That is the current **reflection** coefficient.`], [`$${nice(G)}$`, md`That is the voltage reflection coefficient.`], ['$1$', md`Current is continuous at the junction, but part of it belongs to the reflected wave.`]]),
        md`$I^{++}/I^+ = \tau Z_1/Z_2 = 1 - \Gamma = ${nice(1 - G)}$.`);
    },
  ]);

  // two sections, with equal or different clocks
  function circ2(o = {}) {
    for (let guard = 0; guard < 300; guard++) {
      const [Z1, Z2] = pickPair();
      const rg = pick([1 / 3, 1 / 2, 1, 2, 3]), Rg = rg * Z1;
      if (!isInt(Rg)) continue;
      const matched = o.matched ?? (Math.random() < 0.5);
      const RL = matched ? Z2 : Z2 * pick([1 / 2, 2, 3, 1 / 3]);
      if (!isInt(RL)) continue;
      const tg = Z1 / (Rg + Z1), Vp = pick([24, 36, 48, 60, 72, 120]), Vg = Vp / tg;
      if (!isInt(Vg)) continue;
      const same = o.same ?? true;
      const v1 = pick([100, 150, 300]), T1 = pick([1, 2]), l1 = v1 * T1;
      const v2 = same ? v1 : pick([100, 150, 300].filter((x) => x !== v1)), T2 = same ? T1 : pick([1, 2]), l2 = v2 * T2;
      const s = TL.solve({ Vg, Rg, RL, sections: [{ Z0: Z1, len: l1, v: v1 }, { Z0: Z2, len: l2, v: v2 }], tMax: o.tMax || 6 * (T1 + T2) });
      return { Z1, Z2, Rg, RL, tg, Vp, Vg, v1, v2, T1, T2, l1, l2, s, G12: (Z2 - Z1) / (Z2 + Z1), Gg: gam(Rg, Z1), GL: gam(RL, Z2) };
    }
    throw new Error('circ2: no circuit');
  }
  const c2Tex = (c) => md`$V_g = ${p(c.Vg)}u(t)$ V, $R_g = ${p(c.Rg)}\ \Omega$; line 1: $Z_1 = ${c.Z1}\ \Omega$, $${c.l1}$ m at $${c.v1}$ m/µs; line 2: $Z_2 = ${c.Z2}\ \Omega$, $${c.l2}$ m at $${c.v2}$ m/µs; $R_L = ${p(c.RL)}\ \Omega$`;

  GENS.rf_w5b_multi = () => one([
    () => {
      const c = circ2({ same: false }), r = `$${nice(c.T1 + c.T2)}$ µs`;
      return MC('Time to the load', md`${c2Tex(c)}. When does the first wave reach the load?`, r,
        wr(r, [[`$${nice((c.l1 + c.l2) / c.v1)}$ µs`, md`That uses line 1's speed for both sections.`], [`$${nice((c.l1 + c.l2) / c.v2)}$ µs`, md`That uses line 2's speed for both sections.`], [`$${nice(c.T1)}$ µs`, md`That is only the trip through line 1.`], [`$${nice(2 * (c.T1 + c.T2))}$ µs`, md`That is a round trip.`]]),
        md`$T_1 = ${c.l1}/${c.v1} = ${nice(c.T1)}$ µs and $T_2 = ${c.l2}/${c.v2} = ${nice(c.T2)}$ µs. Total $${nice(c.T1 + c.T2)}$ µs.`);
    },
    () => {
      const c = circ2(), val = c.Vp * (1 + c.G12), r = opV(val);
      return MC('First wave in line 2', md`${c2Tex(c)}. What is the first wave in line 2?`, r,
        wr(r, [[opV(c.Vp), md`That passes the wave through unchanged. Multiply by $\tau_{12}$.`], [opV(c.Vg * (1 + c.G12)), md`That starts from $V_g$. Line 1's first wave is $\tau_gV_g = ${nice(c.Vp)}$ V.`], [opV(c.Vp * c.G12), md`That is the reflected wave in line 1.`], [opV(c.Vp * (1 - c.G12)), md`That uses $\tau_{21}$, the coefficient for waves going the other way.`]]),
        md`$\tau_g = ${nice(c.tg)}$ gives $${nice(c.Vp)}$ V; $\tau_{12} = ${nice(1 + c.G12)}$ gives $${nice(val)}$ V.`);
    },
    () => {
      const c = circ2({ same: false }), r = `$${nice(2 * c.T1)}$ µs`;
      return MC('Back from the junction', md`${c2Tex(c)}. When does the wave reflected at the junction first reach the generator?`, r,
        wr(r, [[`$${nice(c.T1)}$ µs`, md`At $T_1$ the reflection only starts, at the junction.`], [`$${nice(2 * (c.T1 + c.T2))}$ µs`, md`That is the load's reflection coming back.`], [`$${nice(c.T1 + c.T2)}$ µs`, md`That is when the first wave reaches the load.`], [`$${nice(2 * c.l1 / c.v2)}$ µs`, md`That uses line 2's speed for line 1.`]]),
        md`Out and back through line 1 only: $2T_1 = 2(${nice(c.T1)}) = ${nice(2 * c.T1)}$ µs.`);
    },
    () => {
      const a = pick([2, 3, 1 / 2, 1 / 3]), b = pick([2, 1 / 2, 3]), ask = pick(['L', 'C']);
      const val = ask === 'L' ? a / b : 1 / (a * b), r = `$${nice(val)}$`;
      return MC('L and C from Z₀ and v', md`Line 2 has $Z_2 = ${nice(a)}Z_1$ and $v_2 = ${nice(b)}v_1$. Then $${ask}_2/${ask}_1$ is…`, r,
        wr(r, [[`$${nice(ask === 'L' ? a * b : a / b)}$`, ask === 'L' ? md`$L = Z_0/v$: divide by the speed ratio.` : md`$C = 1/(Z_0v)$: both ratios go in the denominator.`], [`$${nice(ask === 'L' ? b / a : a * b)}$`, md`Upside down.`], [`$${nice(ask === 'L' ? 1 / (a * b) : a / b)}$`, md`That is the ratio for $${ask === 'L' ? 'C' : 'L'}$.`]]),
        md`$L = Z_0/v$ and $C = 1/(Z_0v)$. So $L_2/L_1 = ${nice(a)}/${nice(b)} = ${nice(a / b)}$ and $C_2/C_1 = 1/(${nice(a)}\cdot${nice(b)}) = ${nice(1 / (a * b))}$.`);
    },
    () => {
      const c = circ2(), val = c.Vp * c.G12 * c.Gg * (1 + c.G12);
      if (Math.abs(val) < 1e-9) return GENS.rf_w5b_multi();
      const r = opV(val);
      return MC('Second wave into line 2', md`${c2Tex(c)}. The junction's first reflection goes back, reflects at the generator, and returns. What does it send into line 2?`, r,
        wr(r, [[opV(c.Vp * c.G12 * c.Gg), md`That is the wave arriving at the junction. It is multiplied by $\tau_{12}$ on the way through.`], [opV(c.Vp * c.G12 * c.Gg * c.G12), md`That is the part reflected back into line 1 again.`], [opV(c.Vp * c.G12 * (1 + c.G12)), md`That skips the generator's $\Gamma_g$.`], [opV(c.Vp * c.G12 * c.Gg * (1 - c.G12)), md`That uses $\tau_{21}$.`]]),
        md`$${nice(c.Vp)}\cdot\Gamma_{12}\cdot\Gamma_g\cdot\tau_{12} = ${nice(c.Vp)}(${nice(c.G12)})(${nice(c.Gg)})(${nice(1 + c.G12)}) = ${nice(val)}$ V.`);
    },
    () => {
      const [Z1, Z2] = pickPair(), G = (Z2 - Z1) / (Z2 + Z1), V = pick([12, 24, 30, 60]), r = opV(V * (1 + G));
      return MC('V at the junction', md`A $${V}$ V step wave on a $${Z1}\ \Omega$ line reaches a $${Z2}\ \Omega$ line. Right after, what is the voltage **at the junction**?`, r,
        wr(r, [[opV(V), md`That forgets the reflected wave, which adds to the incident one on line 1.`], [opV(V * G), md`That is the reflected wave alone.`], [opV(V * (1 - G)), md`That subtracts the reflected wave; voltages of the two waves add.`]]),
        md`Line 1 side: $${V}(1 ${sg(G)}) = ${nice(V * (1 + G))}$ V. Line 2 side: $\tau_{12}\cdot${V}$, the same ✓.`);
    },
  ]);

  // a scope-trace setup: delta source A0, line Z0, length l, speed v, probe at z0
  function scopeCase(o = {}) {
    for (let guard = 0; guard < 300; guard++) {
      const Z0 = pick([50, 75, 100]), v = pick([50, 100, 150, 300]), T = pick([1, 2]), l = v * T * 2, z0 = l * pick([1 / 4, 1 / 2]);
      const rg = pick(o.rg || [1 / 4, 1 / 3, 1 / 2, 1, 2, 3]), rl = pick(o.rl || [1 / 4, 1 / 3, 1 / 2, 2, 3, 4]);
      const Rg = rg * Z0, RL = rl * Z0;
      if (!isInt(Rg) || !isInt(RL)) continue;
      const A0 = pick([12, 24, 30, 36, 60]);
      const tg = Z0 / (Rg + Z0), GL = gam(RL, Z0), Gg = gam(Rg, Z0);
      const t1 = z0 / v, t2 = (2 * l - z0) / v, t3 = (2 * l + z0) / v;
      const h1 = tg * A0, h2 = GL * h1, h3 = Gg * h2;
      return { Z0, v, l, z0, Rg, RL, A0, tg, GL, Gg, t1, t2, t3, h1, h2, h3, er: (300 / v) ** 2 };
    }
    throw new Error('scopeCase');
  }
  GENS.rf_w5b_scope = () => one([
    () => {
      const c = scopeCase(), r = `$${nice(c.er)}$`;
      return MC('ε_r from the first pulse', md`A non-magnetic line; the first pulse reaches $z_0 = ${p(c.z0)}$ m at $t = ${nice(c.t1)}$ µs. $\epsilon_r$ is…`, r,
        wr(r, [[`$${nice(300 / c.v)}$`, md`That is $\sqrt{\epsilon_r} = c/v$. Square it.`], [`$${nice((c.v / 300) ** 2)}$`, md`Upside down: $\epsilon_r = (c/v)^2$, and $v < c$ makes it larger than 1.`], [`$${nice((600 / c.v) ** 2)}$`, md`That treats the first pulse as a round trip. It is the first forward wave.`]]),
        md`$v = ${p(c.z0)}/${nice(c.t1)} = ${c.v}$ m/µs. $c/v = 300/${c.v} = ${nice(300 / c.v)}$, so $\epsilon_r = ${nice(c.er)}$.`);
    },
    () => {
      const c = scopeCase(), r = `$${p(c.RL)}\\ \\Omega$`;
      return MC('R_L from two heights', md`On a $${c.Z0}\ \Omega$ line the scope shows a first pulse of height $${TL.frac(c.h1)}$ and then a reflected pulse of height $${TL.frac(c.h2)}$. $R_L$ is…`, r,
        wr(r, [[`$${p(+(c.Z0 * (1 - c.GL) / (1 + c.GL)).toPrecision(4))}\\ \\Omega$`, md`That inverts the formula. $R_L = Z_0(1 + \Gamma_L)/(1 - \Gamma_L)$.`], [`$${p(+(c.Z0 * (1 - c.GL) / (1 + c.GL) === c.RL ? 0 : c.Z0 * (1 + Math.abs(c.GL)) / (1 - Math.abs(c.GL))).toPrecision(4))}\\ \\Omega$`, md`That drops the sign of the second pulse. ${c.h2 < 0 ? 'A negative reflection means $R_L < Z_0$.' : ''}`], [`$${c.Z0}\\ \\Omega$`, md`A matched load would send no second pulse.`], [`$${p(+(c.Z0 * Math.abs(c.GL)).toPrecision(4))}\\ \\Omega$`, md`That is $Z_0|\Gamma_L|$, not a resistance formula.`]]),
        md`$\Gamma_L = h_2/h_1 = ${nice(c.GL)}$. $R_L = ${c.Z0}\cdot\frac{1 ${sg(c.GL)}}{1 ${sg(-c.GL)}} = ${p(c.RL)}\ \Omega$.`);
    },
    () => {
      const c = scopeCase(), r = `$${p(c.Rg)}\\ \\Omega$`;
      return MC('R_g from the first height', md`A source $${c.A0}\delta(t)$ drives a $${c.Z0}\ \Omega$ line. The first pulse at the probe has height $${TL.frac(c.h1)}$. $R_g$ is…`, r,
        wr(r, [[`$${p(+(c.Z0 * c.tg / (1 - c.tg)).toPrecision(4))}\\ \\Omega$`, md`That inverts $\tau_g = Z_0/(R_g + Z_0)$ incorrectly. $R_g = Z_0(1/\tau_g - 1)$.`], [`$${p(+(c.Z0 * c.tg).toPrecision(4))}\\ \\Omega$`, md`That is $Z_0\tau_g$, not $R_g$.`], [`$${p(+(c.Z0 / c.tg).toPrecision(4))}\\ \\Omega$`, md`That is $R_g + Z_0$. Subtract $Z_0$.`], [`$${c.Z0}\\ \\Omega$`, md`That would make $\tau_g = \tfrac12$.`]]),
        md`$\tau_g = ${TL.frac(c.h1)}/${c.A0} = ${nice(c.tg)}$, so $R_g = ${c.Z0}(1/${nice(c.tg)} - 1) = ${p(c.Rg)}\ \Omega$.`);
    },
    () => {
      const c = scopeCase(), which = pick(['nosecond', 'nothird']);
      const r = which === 'nosecond' ? md`$R_L = Z_0$; $R_g$ only from the first height` : md`$R_g = Z_0$`;
      return MC('A missing pulse', which === 'nosecond' ? md`A scope at the middle of a line sees one pulse and nothing more, ever. What does that tell you?` : md`A scope sees a first pulse and a reflected pulse, and then nothing more, ever. What does that tell you?`, r,
        [[md`$R_L = Z_0$; $R_g$ only from the first height`, md`That fits a single pulse, not two.`], [md`$R_g = Z_0$`, md`A matched generator only removes the **third** pulse; with no second pulse nothing ever reaches it.`], [md`$R_L = Z_0$ and $R_g = Z_0$`, md`The generator's $\Gamma_g$ cannot be seen if no wave returns to it.`], [md`the load is open`, md`An open load reflects everything: a second pulse as big as the first.`], [md`$R_L = 0$`, md`A short reflects a full negative pulse.`]].filter(([o]) => o !== r),
        which === 'nosecond' ? md`No second pulse: $\Gamma_L = 0$. Nothing ever returns to the generator, so its $\Gamma_g$ is invisible.` : md`The third pulse would be $\Gamma_g h_2$. It is missing and $h_2 \neq 0$, so $\Gamma_g = 0$: $R_g = Z_0$.`);
    },
    () => {
      const c = scopeCase(), r = `$${nice(c.A0)}$`;
      return MC('The source amplitude', md`A generator with $R_g = ${p(c.Rg)}\ \Omega$ drives a $${c.Z0}\ \Omega$ line with $A_0\delta(t)$. The first pulse at the probe has height $${TL.frac(c.h1)}$. $A_0$ is…`, r,
        wr(r, [[`$${TL.frac(c.h1)}$`, md`That forgets $\tau_g$: the line takes only part of the source.`], [`$${nice(c.h1 * c.tg)}$`, md`Divide by $\tau_g$, do not multiply.`], [`$${nice(2 * c.h1)}$`, md`That assumes $\tau_g = \tfrac12$, which needs $R_g = Z_0$.`]]),
        md`$\tau_g = ${c.Z0}/(${p(c.Rg)} + ${c.Z0}) = ${nice(c.tg)}$, so $A_0 = h_1/\tau_g = ${nice(c.A0)}$.`);
    },
    () => {
      const c = scopeCase(), r = `$${p(c.l)}$ m`;
      return MC('Length from the second pulse', md`On a line with $v = ${c.v}$ m/µs, a probe at $z_0 = ${p(c.z0)}$ m sees the first pulse at $${nice(c.t1)}$ µs and the reflected pulse at $${nice(c.t2)}$ µs. How long is the line?`, r,
        wr(r, [[`$${p(c.v * c.t2 / 2)}$ m`, md`That treats $t_2$ as a round trip from $z = 0$. The probe is at $z_0$: $vt_2 = 2l - z_0$.`], [`$${p(c.v * (c.t2 - c.t1))}$ m`, md`That is $2(l - z_0)$, the extra distance between the two pulses.`], [`$${p(c.v * c.t2)}$ m`, md`That is the total distance traveled, $2l - z_0$.`]]),
        md`$vt_2 = 2l - z_0$: $${c.v}(${nice(c.t2)}) = ${p(c.v * c.t2)} = 2l - ${p(c.z0)}$, so $l = ${p(c.l)}$ m.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2 and 3, Topic 16
  GENS.w5b_junction = () => {
    const withR = pick([true, false]);
    let Z1, Z2, R, Zeq;
    for (let g = 0; g < 100; g++) {
      if (withR) { [Z2, R] = pick(SH); Zeq = par(Z2, R); Z1 = pick([25, 50, 75, 100, 150]); }
      else { [Z1, Z2] = pickPair(); Zeq = Z2; }
      if (!near(Zeq, Z1)) break;
    }
    const G = (Zeq - Z1) / (Zeq + Z1), tau = 1 + G, Vp = pick([12, 24, 30, 60]);
    const fL = tau * tau * Z1 / Z2, fR = withR ? tau * tau * Z1 / R : 0;
    return {
      title: withR ? 'A junction with a shunt resistor' : 'A junction',
      q: withR ? md`A $${Vp}$ V wave on a $Z_1 = ${Z1}\ \Omega$ line reaches a junction with a $Z_2 = ${Z2}\ \Omega$ line. A $${R}\ \Omega$ resistor is connected across the wires at the junction. Find $\Gamma_{12}$, $\tau_{12}$, the reflected and transmitted waves, and the fractions of the incident power that go into line 2 and into the resistor.` : md`A $${Vp}$ V wave on a $Z_1 = ${Z1}\ \Omega$ line reaches a junction with a $Z_2 = ${Z2}\ \Omega$ line. Find $\Gamma_{12}$, $\tau_{12}$, the reflected and transmitted waves, and the fraction of the incident power that goes into line 2.`,
      plan: { q: 'Before any numbers: what does the arriving wave see at the junction?', opts: [withR ? 'a resistor equal to Z₂ ∥ R, so use the load formula with that' : 'a resistor equal to Z₂, so use the load formula with Z₂', 'a resistor equal to Z₁', 'an open circuit until the transmitted wave reaches the load', withR ? 'a resistor equal to Z₂ + R' : 'nothing: the voltage passes unchanged'], a: 0, why: [null, md`$Z_1$ is the line the wave is on; it sees what is ahead of it.`, md`The transmitted wave starts immediately, with $V/I = Z_2$.`, withR ? md`The resistor is across the wires: parallel, not series.` : md`It passes unchanged only if $Z_1 = Z_2$.`], move: md`$\Gamma_{12} = (Z_{\text{eq}} - Z_1)/(Z_{\text{eq}} + Z_1)$ and $\tau_{12} = 1 + \Gamma_{12}$; power of a wave is $V^2/Z$.` },
      parts: [
        Object.assign(N('\\Gamma_{12}', G, ''), { traps: [{ v: -G, msg: 'Upside down: the impedance ahead comes first.' }] }),
        Object.assign(N('\\tau_{12}', tau, ''), { traps: [{ v: 1 - G, msg: 'That is 1 − Γ, the current ratio.' }] }),
        N('V^-\\ (\\text{V})', Vp * G, 'V'),
        N('V^{++}\\ (\\text{V})', Vp * tau, 'V'),
        Object.assign(N('\\text{fraction of power into line 2}', fL, ''), { traps: [{ v: tau * tau, msg: 'Power is V²/Z: multiply τ² by Z₁/Z₂.' }] }),
      ].concat(withR ? [N('\\text{fraction into the resistor}', fR, '')] : []),
      hints: [withR ? md`$Z_{\text{eq}} = R\parallel Z_2 = ${p(Zeq)}\ \Omega$.` : md`Line 2 looks like a $${Z2}\ \Omega$ resistor.`, md`A wave of voltage $V$ on a line $Z$ carries power $V^2/Z$.`],
      sol: md`
        **Step 1: what the wave sees.** ${withR ? md`$R$ and line 2 share the junction voltage, so they are in parallel: $Z_{\text{eq}} = ${R}\cdot${Z2}/(${R} + ${Z2}) = ${p(Zeq)}\ \Omega$.` : md`Line 2 acts as a $${Z2}\ \Omega$ resistor.`}

        **Step 2: the coefficients.**
        $$\Gamma_{12} = \frac{${p(Zeq)} - ${Z1}}{${p(Zeq)} + ${Z1}} = ${nice(G)}, \quad \tau_{12} = ${nice(tau)}$$
        **Step 3: the waves.** $V^- = ${Vp}(${nice(G)}) = ${nice(Vp * G)}$ V and $V^{++} = ${Vp}(${nice(tau)}) = ${nice(Vp * tau)}$ V. Check: $${Vp} ${sg(Vp * G)} = ${nice(Vp * tau)}$ ✓.

        **Step 4: power.** Incident $V^2/Z_1$. Reflected fraction $\Gamma^2 = ${nice(G * G)}$. Into line 2: $\tau^2Z_1/Z_2 = ${nice(tau * tau)}\cdot${Z1}/${Z2} = ${nice(fL)}$.${withR ? md` Into $R$: $\tau^2Z_1/R = ${nice(tau * tau)}\cdot${Z1}/${R} = ${nice(fR)}$.` : ''}

        **Check.** $${nice(G * G)} + ${nice(fL)}${withR ? ` + ${nice(fR)}` : ''} = ${nice(G * G + fL + fR)}$ ✓.
      `,
    };
  };

  GENS.w5b_twoline = () => {
    const c = circ2({ same: true });
    const z0 = c.l1 * pick([1 / 3, 2 / 3]);
    const L = TL.levels(c.s, z0, 2 * c.T1 + 2 * c.T1 + 0.01, 'V').slice(0, 3);
    const mid = (k) => (k + 1 < L.length ? (L[k][0] + L[k + 1][0]) / 2 : L[k][0] + c.T1 / 3);
    const zq = c.l1 + c.l2 / 2, tq = c.T1 + c.T2 / 2 + 0.25 * c.T1;
    const v2 = TL.valueAt(c.s, zq, tq);
    const arr = TL.arrivals(c.s, z0).filter((a) => a.t <= L[L.length - 1][0] + 1e-9);
    return {
      title: 'Two lines in series',
      q: md`${c2Tex(c)}. (a) Find $\tau_g$, $\Gamma_{12}$ and $\tau_{12}$. (b) Find the voltage at $z_0 = ${p(z0)}$ m on its first three levels. (c) Find the voltage in the middle of line 2 at $t = ${d3(tq)}$ µs.`,
      plan: { q: 'Before any numbers: how do you read a point in line 1?', opts: ['Build the diagram in time order (two new waves at the junction), then add only the line-1 waves that cross z₀', 'Treat the two lines as one line with the average Z₀', 'Add every wave on the diagram, from both lines', 'Use the DC divider'], a: 0, why: [null, md`A junction reflects; averaging hides that.`, md`Waves in line 2 never pass a point in line 1.`, md`That is only the final value.`], move: md`Coefficients at both ends and both directions of the junction; crossings from each line's start time plus distance over speed.` },
      parts: [
        N('\\tau_g', c.tg, ''),
        N('\\Gamma_{12}', c.G12, ''),
        Object.assign(N('\\tau_{12}', 1 + c.G12, ''), { traps: [{ v: 1 - c.G12, msg: 'That is τ₂₁ (or the current ratio). τ₁₂ = 1 + Γ₁₂.' }] }),
        ...L.map(([t, v], k) => N(`V(z_0, ${nice(mid(k))}\\,\\mu\\text{s})`, v, 'V')),
        N(`V(${p(zq)}\\ \\text{m}, ${d3(tq)}\\,\\mu\\text{s})`, v2, 'V'),
      ],
      hints: [md`$\tau_g = Z_1/(R_g + Z_1)$; $\Gamma_{12} = (Z_2 - Z_1)/(Z_2 + Z_1)$.`, md`Line 1 forward waves pass $z_0$ at $t_s + z_0/v_1$; backward waves leaving the junction at $t_s$ pass at $t_s + (l_1 - z_0)/v_1$.`],
      sol: md`
        **(a)**
        $$\tau_g = \frac{${c.Z1}}{${p(c.Rg)} + ${c.Z1}} = ${nice(c.tg)}, \quad \Gamma_g = ${nice(c.Gg)}$$
        $$\Gamma_{12} = \frac{${c.Z2} - ${c.Z1}}{${c.Z2} + ${c.Z1}} = ${nice(c.G12)}, \quad \tau_{12} = ${nice(1 + c.G12)}$$
        Also $\Gamma_{21} = ${nice(-c.G12)}$, $\tau_{21} = ${nice(1 - c.G12)}$, $\Gamma_L = ${nice(c.GL)}$${c.GL === 0 ? ' (matched: nothing returns from line 2)' : ''}. $T_1 = ${nice(c.T1)}$ µs, $T_2 = ${nice(c.T2)}$ µs.

        **(b)** The line-1 waves that pass $z_0 = ${p(z0)}$ m:

        | Passes at (µs) | Direction | Label (V) |
        |---|---|---|
        ${arr.map((a) => `| $${nice(a.t)}$ | ${a.dir > 0 ? 'forward' : 'backward'} | $${nice(a.v)}$ |`).join(NL + '        ')}

        Running total: ${L.map(([t, v]) => `$${nice(v)}$`).join(', ')} V.

        **(c)** In line 2 the first wave is $${nice(c.Vp)}\cdot${nice(1 + c.G12)} = ${nice(c.Vp * (1 + c.G12))}$ V. It passes the middle of line 2 at $T_1 + T_2/2 = ${nice(c.T1 + c.T2 / 2)}$ µs. At $${d3(tq)}$ µs: $V = ${nice(v2)}$ V.

        [[fig:bd]]
      `,
      figs: { bd: { svg: diag(c.s, { tMax: 4 * c.T1, probe: z0 }), cap: 'The bounce diagram with the probe line in line 1.' } },
    };
  };

  GENS.w5b_scope = () => {
    const mode = pick(['known', 'unknown']);
    const c = scopeCase({ rg: mode === 'known' ? [1 / 4, 1 / 3, 1 / 2, 1, 2, 3] : [1 / 4, 1 / 3, 1 / 2, 2, 3] });
    const third = !near(c.Gg, 0);
    const s = TL.solve({ Vg: c.A0, Rg: c.Rg, RL: c.RL, sections: [{ Z0: c.Z0, len: c.l, v: c.v }], tMax: 10 * c.l / c.v });
    const tEnd = (c.t3 + (4 * c.l - c.z0) / c.v) / 2;
    const pul = [[c.t1, c.h1], [c.t2, c.h2]].concat(third ? [[c.t3, c.h3]] : []);
    const pulTex = pul.map(([t, h]) => `$${TL.frac(h)}$ at $${nice(t)}$ µs`).join(', ');
    const parts = [
      N('v\\ (\\text{m}/\\mu\\text{s})', c.v, 'm/µs'),
      Object.assign(N('\\epsilon_r', c.er, ''), { traps: [{ v: 300 / c.v, msg: 'That is c/v. Square it.' }] }),
      Object.assign(N('R_L\\ (\\Omega)', c.RL, 'Ω'), { traps: [{ v: c.Z0 * (1 - c.GL) / (1 + c.GL), msg: 'Inverted: R_L = Z₀(1 + Γ_L)/(1 − Γ_L).' }] }),
      N('R_g\\ (\\Omega)', c.Rg, 'Ω'),
    ];
    if (mode === 'unknown') parts.push(Object.assign(N('A_0', c.A0, ''), { traps: [{ v: c.h1, msg: 'The first pulse is τ_g A₀, not A₀.' }] }));
    return {
      title: 'Read the scope backwards',
      q: mode === 'known'
        ? md`A generator with unknown $R_g$ sends $${c.A0}\delta(t)$ into a lossless, non-magnetic line with $Z_0 = ${c.Z0}\ \Omega$ and an unknown load. A probe at $z_0 = ${p(c.z0)}$ m records pulses of weight ${pulTex}, and nothing else before $t = ${nice(tEnd)}$ µs. Find the speed, $\epsilon_r$, $R_L$ and $R_g$.`
        : md`A generator with unknown $R_g$ sends $A_0\delta(t)$ (unknown $A_0$) into a lossless, non-magnetic line with $Z_0 = ${c.Z0}\ \Omega$ and an unknown load. A probe at $z_0 = ${p(c.z0)}$ m records pulses of weight ${pulTex}. Find the speed, $\epsilon_r$, $R_L$, $R_g$ and $A_0$.`,
      plan: { q: 'Before any numbers: which pulse tells you what?', opts: ['first pulse: time → v, height → τ_g; second/first → Γ_L; third/second → Γ_g; a missing pulse → a matched end', 'the largest pulse is always the load reflection', 'the time between pulses gives Z₀', 'each height divided by A₀ gives the Γ of the end it came from'], a: 0, why: [null, md`Sizes depend on the $\Gamma$s; order in time tells you which wave is which.`, md`Times give speeds and lengths; $Z_0$ is given.`, md`Only the first height is $\tau_gA_0$. Later heights carry products of $\tau_g$ and $\Gamma$s, so use ratios of successive pulses.`], move: md`$v = z_0/t_1$, $\epsilon_r = (c/v)^2$, $\Gamma_L = h_2/h_1$, then $R = Z_0(1 + \Gamma)/(1 - \Gamma)$.` },
      parts,
      hints: [md`The first pulse is the first forward wave: $t_1 = z_0/v$.`, mode === 'known' ? md`$h_1 = \tau_gA_0$ gives $\tau_g$; ${third ? 'or the third pulse gives $\\Gamma_g = h_3/h_2$.' : 'no third pulse means $\\Gamma_g = 0$.'}` : md`$\Gamma_g = h_3/h_2$ gives $R_g$, then $\tau_g$, then $A_0 = h_1/\tau_g$.`],
      sol: md`
        **Step 1: the speed.** $v = z_0/t_1 = ${p(c.z0)}/${nice(c.t1)} = ${c.v}$ m/µs. Then $c/v = 300/${c.v} = ${nice(300 / c.v)}$, so $\epsilon_r = ${nice(c.er)}$.

        **Step 2: the load.** $\Gamma_L = h_2/h_1 = ${TL.frac(c.h2)}/${TL.frac(c.h1)} = ${nice(c.GL)}$.
        $$R_L = ${c.Z0}\cdot\frac{1 ${sg(c.GL)}}{1 ${sg(-c.GL)}} = ${p(c.RL)}\ \Omega$$
        **Step 3: the generator.** ${mode === 'known' ? md`$\tau_g = h_1/A_0 = ${TL.frac(c.h1)}/${c.A0} = ${nice(c.tg)}$, so $R_g = ${c.Z0}(1/${nice(c.tg)} - 1) = ${p(c.Rg)}\ \Omega$. ${third ? md`Check with the third pulse: $\Gamma_g = ${TL.frac(c.h3)}/${TL.frac(c.h2)} = ${nice(c.Gg)}$, which gives the same $R_g$ ✓.` : md`Check: no third pulse means $\Gamma_g = 0$, so $R_g = Z_0 = ${c.Z0}\ \Omega$ ✓.`}` : md`$\Gamma_g = h_3/h_2 = ${TL.frac(c.h3)}/${TL.frac(c.h2)} = ${nice(c.Gg)}$, so $R_g = ${c.Z0}\cdot\frac{1 ${sg(c.Gg)}}{1 ${sg(-c.Gg)}} = ${p(c.Rg)}\ \Omega$. Then $\tau_g = ${c.Z0}/(${p(c.Rg)} + ${c.Z0}) = ${nice(c.tg)}$ and $A_0 = h_1/\tau_g = ${nice(c.A0)}$.`}

        **Check the times.** The reflection arrives at $(2l - z_0)/v$; here $l = ${p(c.l)}$ m gives $${nice(c.t2)}$ µs ✓.

        [[fig:tr]]
      `,
      figs: { tr: { svg: spikes(s, c.z0, { tMax: tEnd, name: `V(${p(c.z0)}\\ \\text{m},t)` }), cap: 'The scope trace, with the circuit now known.' } },
    };
  };

  GENS.w5b_twoexam = () => {
    const c = circ2({ same: true });
    const z0 = c.l1 * pick([1 / 3, 2 / 3]), tMax = 4 * c.T1;
    const L = TL.levels(c.s, z0, tMax, 'V').slice(0, 4);
    const mid = (k) => (k + 1 < L.length ? (L[k][0] + L[k + 1][0]) / 2 : (L[k][0] + tMax) / 2);
    return {
      title: 'Spring 2024 #4, new numbers',
      big: true,
      q: md`${c2Tex(c)}. (a) Find $\tau_g$, $\Gamma_g$, $\Gamma_{12}$, $\tau_{12}$, $\Gamma_{21}$, $\tau_{21}$ and $\Gamma_L$, and draw the voltage bounce diagram for $0 < t < ${nice(tMax)}$ µs. (b) Find $V(${p(z0)}\ \text{m}, t)$ for $0 < t < ${nice(tMax)}$ µs. (c) Find the DC steady-state current at the junction.`,
      plan: { q: 'Before any numbers: what is the order of work?', opts: ['all seven coefficients and both clocks, then the diagram in time order, then the probe crossings, then the DC circuit', 'the DC circuit first, then work backward to the diagram', 'only the first wave matters for (b)', 'combine the two lines into one equivalent line first'], a: 0, why: [null, md`DC is the last check, not a shortcut to the transient values.`, md`The reflections from the junction and the generator change $V(z_0, t)$ within the window.`, md`There is no single equivalent line for a transient: the junction reflects.`], move: md`Coefficients → diagram (two waves per junction hit) → crossings at $z_0$ from line 1's lines only → $I_\infty = V_g/(R_g + R_L)$.` },
      parts: [
        N('\\tau_g', c.tg, ''), N('\\Gamma_g', c.Gg, ''), N('\\Gamma_{12}', c.G12, ''), N('\\tau_{12}', 1 + c.G12, ''), N('\\tau_{21}', 1 - c.G12, ''),
        ...L.map(([t, v], k) => N(`V(z_0, ${nice(mid(k))}\\,\\mu\\text{s})`, v, 'V')),
        Object.assign(N('I_{ss}\\ (\\text{A})', c.s.dc.I, 'A'), { traps: [{ v: c.Vg / (c.Rg + c.Z1), msg: 'That is the first wave’s current. In DC the lines are wires.' }] }),
      ],
      hints: [md`$\tau_g = Z_1/(R_g + Z_1)$, $\Gamma_g$ uses $Z_1$; the junction coefficients use $Z_1$ and $Z_2$; $\Gamma_L$ uses $Z_2$.`, md`Each section takes $T = ${nice(c.T1)}$ µs.`],
      sol: md`
        **(a) The coefficients.**
        $$\tau_g = \frac{${c.Z1}}{${p(c.Rg)} + ${c.Z1}} = ${nice(c.tg)}, \quad \Gamma_g = ${nice(c.Gg)}$$
        $$\Gamma_{12} = ${nice(c.G12)}, \quad \tau_{12} = ${nice(1 + c.G12)}$$
        $$\Gamma_{21} = ${nice(-c.G12)}, \quad \tau_{21} = ${nice(1 - c.G12)}$$
        $$\Gamma_L = \frac{${p(c.RL)} - ${c.Z2}}{${p(c.RL)} + ${c.Z2}} = ${nice(c.GL)}$$
        Each section: $T = ${nice(c.T1)}$ µs. First wave $${nice(c.Vp)}$ V.

        [[fig:bd]]

        **(b)** The line-1 crossings at $z_0$ and the running total:

        | Interval (µs) | $V(z_0, t)$ (V) |
        |---|---|
        | $0 < t < ${nice(L[0][0])}$ | 0 |
        ${L.map(([t, v], k) => `| $${nice(t)} < t < ${k + 1 < L.length ? nice(L[k + 1][0]) : nice(tMax)}$ | $${nice(v)}$ |`).join(NL + '        ')}

        [[fig:st]]

        **(c)** In DC both lines are wires:
        $$I_{ss} = \frac{${p(c.Vg)}}{${p(c.Rg)} + ${p(c.RL)}} = ${nice(c.s.dc.I)}\ \text{A}$$
        **Speed path.** Seven coefficients in a row; ${c.GL === 0 ? 'the load is matched, so line 2 never sends anything back and only line 1 rings' : 'line 2 rings too, so watch for waves coming back through $\\tau_{21}$'}. Then the probe crossings and a running total.

        **Where points go.** Upside-down junction coefficients; using line 2's waves at a point in line 1; $Z_0$ in the DC current.
      `,
      figs: { bd: { svg: diag(c.s, { tMax, probe: z0 }), cap: 'The voltage bounce diagram; the dots are the crossings at the probe.' }, st: { svg: stair(c.s, z0, { tMax, name: `V(${p(z0)}\\ \\text{m},t)` }), cap: 'V at the probe; dashed: the DC value.' } },
    };
  };

  // ---------------------------------------------------------------- the question bank, Topic 16
  EM.BANK['w5-multi'] = [
    Q(md`Why is $\tau_{12} = 1 + \Gamma_{12}$ at a plain junction?`,
      ['the voltage on line 1 just left of the junction equals the voltage on line 2 just right of it', 'energy must be conserved', 'the current is the same on both sides', 'the two lines have the same speed'], 0,
      [null, md`Energy conservation is a check, not the source of this formula.`, md`Current continuity gives the other equation, the one that fixes $\Gamma_{12}$ itself.`, md`Speeds do not enter the coefficients.`],
      md`$V^+ + V^- = V^{++}$, divided by $V^+$: $1 + \Gamma_{12} = \tau_{12}$.`),
    Q(md`A wave goes from a 75 Ω line into a 25 Ω line. $\Gamma_{12}$ and $\tau_{12}$ are…`,
      [md`$-\tfrac12$ and $\tfrac12$`, md`$\tfrac12$ and $\tfrac32$`, md`$-\tfrac12$ and $\tfrac32$`, md`$-\tfrac13$ and $\tfrac23$`], 0,
      [null, md`That is the other direction, 25 into 75.`, md`$\tau = 1 + \Gamma = \tfrac12$, not $1 - \Gamma$.`, md`$(25 - 75)/(25 + 75) = -\tfrac12$.`],
      md`$\Gamma_{12} = (25 - 75)/100 = -\tfrac12$, $\tau_{12} = \tfrac12$.`),
    Q(md`$\Gamma_{12} = -\tfrac35$. What are $\Gamma_{21}$ and $\tau_{21}$?`,
      [md`$\tfrac35$ and $\tfrac85$`, md`$-\tfrac35$ and $\tfrac25$`, md`$\tfrac35$ and $\tfrac25$`, md`$\tfrac53$ and $\tfrac83$`], 0,
      [null, md`Reversing the direction flips the sign of $\Gamma$.`, md`$\tau_{21} = 1 + \Gamma_{21} = 1 + \tfrac35$.`, md`$\Gamma$ flips sign; it does not invert.`],
      md`$\Gamma_{21} = -\Gamma_{12} = \tfrac35$; $\tau_{21} = \tfrac85$.`),
    Q(md`Into a higher-impedance line the transmitted voltage is larger than the incident. The transmitted **current** is…`,
      ['smaller than the incident current', 'larger than the incident current', 'equal to the incident current', 'zero'], 0,
      [null, md`If both grew, the transmitted power would exceed the incident power.`, md`The reflected wave carries some current too, so the transmitted current differs.`, md`Only an open circuit carries no current.`],
      md`$I^{++}/I^+ = 1 - \Gamma_{12} < 1$ when $\Gamma_{12} > 0$.`),
    Q(md`The fraction of power transmitted across a junction is…`,
      [md`$1 - \Gamma_{12}^2$`, md`$\tau_{12}^2$`, md`$\tau_{12}$`, md`$1 - |\Gamma_{12}|$`], 0,
      [null, md`$\tau^2$ alone ignores that the power is $V^2/Z_2$ on the new line.`, md`$\tau$ is a voltage ratio.`, md`Power goes with the square of $\Gamma$.`],
      md`$\tau^2Z_1/Z_2 = 1 - \Gamma^2$, as shown by expanding the squares.`),
    Q(md`A 100 Ω line feeds a 100 Ω line with a 100 Ω shunt at the junction. What fraction of the incident power does the shunt absorb?`,
      [md`$\tfrac49$`, md`$\tfrac12$`, md`$\tfrac19$`, md`$\tfrac13$`], 0,
      [null, md`Half would need no reflection. Here $Z_{\text{eq}} = 50\ \Omega$ reflects $\tfrac19$.`, md`That is the reflected fraction.`, md`The shunt sees the junction voltage $\tfrac23V^+$: power $\tfrac49(V^+)^2/100$.`],
      md`$\tau = \tfrac23$; $R$ and line 2 each take $\tau^2 = \tfrac49$; the reflection takes $\tfrac19$.`),
    Q(md`$Z_1 = 50\ \Omega$ and line 2 is 100 Ω. What shunt $R$ at the junction removes the reflection for waves from line 1?`,
      [md`$100\ \Omega$`, md`$50\ \Omega$`, md`$150\ \Omega$`, md`no shunt can do that`], 0,
      [null, md`$50\parallel100 = 33\ \Omega \neq 50$.`, md`$150\parallel100 = 60\ \Omega$.`, md`A parallel resistor lowers $Z_{\text{eq}}$ from 100 Ω, and 100 Ω gives exactly 50 Ω.`],
      md`Need $R\parallel100 = 50$, so $R = 100\ \Omega$.`),
    Q(md`Two sections: 300 m at 100 m/µs, then 300 m at 300 m/µs. When does the first wave reach the load?`,
      ['4 µs', '6 µs', '2 µs', '3 µs'], 0,
      [null, md`That uses 100 m/µs for all 600 m.`, md`That uses 300 m/µs for all 600 m.`, md`That is only the first section.`],
      md`$3 + 1 = 4$ µs.`),
    Q(md`On a bounce diagram, which section has the steeper lines?`,
      ['the one with the lower speed', 'the one with the higher impedance', 'the longer one', 'the one nearer the load'], 0,
      [null, md`Impedance sets the labels, not the slopes.`, md`Length sets where the line ends, not its slope.`, md`Position does not matter; speed does.`],
      md`Slope $dt/dz = 1/v$.`),
    Q(md`Line 2 has twice the $Z_0$ and half the speed of line 1. Compared with line 1, line 2 has…`,
      [md`4 times the $L$ and the same $C$`, md`the same $L$ and $\tfrac14$ the $C$`, md`twice the $L$ and twice the $C$`, md`$\tfrac14$ the $L$ and the same $C$`], 0,
      [null, md`That would need double $Z_0$ and double speed.`, md`$C = 1/(Z_0v) = 1/(2\cdot\tfrac12) = 1$ times; $L = Z_0/v = 2/\tfrac12 = 4$ times.`, md`$L$ goes up with $Z_0/v$, which is 4 here.`],
      md`$L_2/L_1 = 2/(1/2) = 4$; $C_2/C_1 = 1/(2\cdot\tfrac12) = 1$.`),
    Q(md`A wave hits a junction. How many new waves start there?`,
      ['two: one reflected, one transmitted', 'one: the transmitted wave', 'one: the reflected wave', 'none unless the impedances differ'], 0,
      [null, md`Unless $Z_1 = Z_2$, a reflected wave starts too.`, md`Something always continues into the next line (unless it is a short).`, md`With equal impedances the transmitted wave still starts; it is just unchanged.`],
      md`$V^- = \Gamma_{12}V^+$ back and $V^{++} = \tau_{12}V^+$ on.`),
    Q(md`Spring 2024 #4. Which coefficients were never needed for $V(100\ \text{m}, t)$?`,
      [md`$\Gamma_{21}$ and $\tau_{21}$`, md`$\Gamma_{12}$ and $\tau_{12}$`, md`$\Gamma_g$ and $\tau_g$`, md`$\Gamma_g$ only`], 0,
      [null, md`$\Gamma_{12}$ made the $-30$ V and $-7.5$ V waves.`, md`$\tau_g$ made the first wave and $\Gamma_g$ the 15 V wave.`, md`$\Gamma_g$ turned $-30$ V into 15 V.`],
      md`The load is matched, so nothing comes back through the junction from line 2.`),
    Q(md`Spring 2024 #4. What is the voltage at the junction for $1 < t < 3$ µs?`,
      [md`$30$ V`, md`$60$ V`, md`$90$ V`, md`$45$ V`], 0,
      [null, md`That forgets the $-30$ V reflection that starts there at 1 µs.`, md`That adds the reflection with the wrong sign.`, md`45 V is $V(100\ \text{m})$ after the 15 V wave passes, at $\tfrac83$ µs.`],
      md`$60 + (-30) = 30$ V on the left, $30$ V on the right ✓.`),
    Q(md`Spring 2024 #4. What is the DC voltage at the junction?`,
      [md`$40$ V`, md`$30$ V`, md`$60$ V`, md`$80$ V`], 0,
      [null, md`That is only after the first wave. The line keeps ringing toward 40 V.`, md`That is the first wave.`, md`That is $V_g$; current flows, so $R_g$ drops 40 V.`],
      md`DC: $80\cdot50/(50 + 50) = 40$ V everywhere.`),
    Q(md`A scope trace: first pulse 12 at 1 µs, second pulse 4 at 5 µs, on a 60 Ω line. $R_L$ is…`,
      [md`$120\ \Omega$`, md`$30\ \Omega$`, md`$20\ \Omega$`, md`$180\ \Omega$`], 0,
      [null, md`Inverted formula.`, md`That is $Z_0|\Gamma_L| = 60\cdot\tfrac13$. Use $Z_0(1 + \Gamma)/(1 - \Gamma)$.`, md`$\Gamma = \tfrac13$ gives $60\cdot\tfrac{4/3}{2/3} = 120$, not $3Z_0$ (that is $\Gamma = \tfrac12$).`],
      md`$\Gamma_L = 4/12 = \tfrac13$; $R_L = 60\cdot\tfrac{4/3}{2/3} = 120\ \Omega$.`),
    Q(md`A first pulse arrives at $z_0 = 90$ m at $t = 0.6$ µs on a non-magnetic line. $\epsilon_r$ is…`,
      [md`$4$`, md`$2$`, md`$\tfrac14$`, md`$16$`], 0,
      [null, md`That is $c/v$. Square it.`, md`Upside down.`, md`That squares twice.`],
      md`$v = 90/0.6 = 150$ m/µs $= c/2$, so $\epsilon_r = 2^2 = 4$.`),
    Q(md`A source of $40\delta(t)$ gives a first pulse of 10 at the probe on a 50 Ω line. $R_g$ is…`,
      [md`$150\ \Omega$`, md`$\tfrac{50}{3}\ \Omega$`, md`$12.5\ \Omega$`, md`$200\ \Omega$`], 0,
      [null, md`That inverts $\tau_g$ the wrong way: $R_g = Z_0(1/\tau_g - 1)$.`, md`That is $Z_0\tau_g$.`, md`That is $R_g + Z_0$.`],
      md`$\tau_g = \tfrac14$, so $R_g = 50(4 - 1) = 150\ \Omega$.`),
    Q(md`Why is the load the easiest thing to read from a scope trace?`,
      ['$h_2/h_1 = \\Gamma_L$ does not depend on the source amplitude or $\\tau_g$', 'the load reflection is always the largest pulse', 'the load pulse arrives first', 'the load is closest to the probe'], 0,
      [null, md`Its size depends on $\Gamma_L$, which can be small.`, md`The first pulse is the forward wave.`, md`Position has nothing to do with it.`],
      md`Both heights carry the same factor $\tau_gA_0$; it cancels in the ratio.`),
    Q(md`A trace shows pulses 20, then $-10$, then nothing else. Which is right?`,
      [md`$\Gamma_L = -\tfrac12$ and $R_g = Z_0$`, md`$\Gamma_L = \tfrac12$ and $R_g = Z_0$`, md`$\Gamma_L = -\tfrac12$ and $R_L = Z_0$`, md`$\Gamma_g = -\tfrac12$`], 0,
      [null, md`The second pulse is negative.`, md`A matched load would not reflect at all.`, md`The second pulse comes from the load; the generator's would be the third.`],
      md`$\Gamma_L = -10/20$; the missing third pulse means $\Gamma_g = 0$.`),
    Q(md`Three sections 100 Ω, 50 Ω, 150 Ω (1 µs each). For a wave going right, the **current** reflection coefficient at the 50/150 junction is…`,
      [md`$-\tfrac12$`, md`$\tfrac12$`, md`$-\tfrac13$`, md`$\tfrac32$`], 0,
      [null, md`That is the voltage coefficient. A reflected wave travels backward, so current flips sign.`, md`That is the voltage coefficient at the first junction.`, md`That is $\tau_{23}$.`],
      md`$\Gamma_{23} = (150 - 50)/200 = \tfrac12$ for voltage; $-\tfrac12$ for current.`),
    Q(md`With a **series** resistor $R$ at a junction, why is $\tau_{12} \neq 1 + \Gamma_{12}$?`,
      ['line 2 gets only part of the junction voltage: the rest drops across R', 'the current is not continuous', 'the reflected wave vanishes', 'the speed changes at R'], 0,
      [null, md`In series, the same current flows through $R$ and into line 2.`, md`A series $R$ still reflects: $Z_{\text{eq}} = R + Z_2$.`, md`A lumped resistor has no travel time.`],
      md`Line 1's end voltage $V^+(1 + \Gamma_{12})$ divides between $R$ and $Z_2$: $\tau_{12} = (1 + \Gamma_{12})Z_2/(R + Z_2)$.`),
    Q(md`A wave arrives at the same junction from both sides at the same instant. How do you handle it?`,
      ['handle each one separately and add the waves that leave in the same direction', 'they cancel', 'use the larger one only', 'average the two'], 0,
      [null, md`They cancel only in special cases; superposition still holds.`, md`Both waves make reflections and transmissions.`, md`Linearity means sums, not averages.`],
      md`Linearity: each incident wave makes its own reflected and transmitted waves, and the outgoing waves in each direction add.`),
  ];
})();

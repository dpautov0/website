/* Exam 3 practice exams J, K, L (unit e3-prac).
     e3-prac-j: the Fall 2023 format (Goddard, Ilie, Zhao): seven questions. Part I is "circle all that apply", typed here
                as one True/False choice per statement, on what the other papers test least (the Poynting theorem's
                terms, radiation pressure, surface resistance, line resonances, LC = mu eps), then transmission-line
                questions with numeric choices; Part II is one worked problem (a plane wave on a metal wall).
                Trap: four times the frequency only doubles the heating of the wall.
     e3-prac-k: Prof. Kudeki's summer style: intuition first, every sketch question turned into a choice between
                candidate plots plus values read off them. A current sheet's truncated sine wave, a circular wave read
                off two snapshots, two lossy media judged from lambda and delta, an interface with E_t given, a bounce
                snapshot V(z). Trap: the power two skin depths down is e^-4, not e^-2.
     e3-prac-l: the hardest, cumulative, in Prof. Chen's four-problem format: a measured H and E in a lossy medium
                (gamma, eta, mu, sigma, eps), a quarter-wave coating on glass and its line analog, a charged line
                shorted at t = 0, and a delta on two lines with different speeds. Trap: eps_r is not (c/v_p)^2.
   Every number was recomputed in Python (work-pracD2/verify.py, exact fractions for the bounces); every bounce value
   on the page is read from TL.valueAt / TL.arrivals and checked against the hand values (work-pracD2/tlcheck.js). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;

  // ---------------------------------------------------------------- helpers
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  // one statement of a "circle all that apply" question: True / False, in that order
  const tf = (lbl, truth, whyWrong) => ({ lbl, mc: ['True', 'False'], a: truth ? 0 : 1, why: truth ? [null, whyWrong] : [whyWrong, null], fixed: true });
  const trap = (part, list) => Object.assign(part, { traps: list.map(([v, msg]) => ({ v, msg })) });
  const plot = (o) => PF.plot(Object.assign({ w: 360, h: 200 }, o));
  const PLOTS = ['Plot A', 'Plot B', 'Plot C', 'Plot D'];
  const row4 = (svgs, caps) => PF.row(svgs.map((svg, i) => ({ svg, cap: (caps || PLOTS)[i] }))).svg;

  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 30) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // A transmission-line circuit on two rails, left to right. Items:
  //   { t: 'gen', R, V }   source with series resistor      { t: 'line', w, lab, sub }  a line section (thick rails)
  //   { t: 'wire', w }     plain wires                      { t: 'R', lab, last }        a resistor across the rails
  //   { t: 'short', lab }  { t: 'open', lab }               how the last section ends
  // o.ticks = [[item index, 'TeX', frac], ...]: position marks under the drawing (start of an item, or a fraction of a
  // line section); o.probe = [item index, frac, 'TeX']: a dashed probe line across the rails.
  function circuit(items, o = {}) {
    const g = PF.fig({ alt: o.alt });
    const T = 30, B = 112, M = (T + B) / 2;
    const rail = (a, b) => { g.line(a, T, b, T); g.line(a, B, b, B); };
    let x = 70;
    const at = [], wid = [];
    items.forEach((it, k) => {
      at.push(x); wid.push(it.w || 0);
      if (it.t === 'R') at[k] = x + 18;
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
        if (it.lab) g.label(x + it.w / 2, T + 20, it.lab, 'c', 'small');
        if (it.sub) g.label(x + it.w / 2, B - 20, it.sub, 'c', 'small');
        x += it.w;
      } else if (it.t === 'wire') {
        rail(x, x + it.w); x += it.w;
      } else if (it.t === 'R') {
        rail(x, x + 18); x += 18;
        zig(g, x, T, x, B, 32);
        g.dot(x, T, 2.4); g.dot(x, B, 2.4);
        if (it.lab) g.label(x + 10, M, it.lab, 'l', 'small');
        if (!it.last) { rail(x, x + 18); x += 18; }
      } else if (it.t === 'short') {
        g.line(x, T, x, B, { cls: 'thick' });
        if (it.lab) g.label(x + 8, M, it.lab, 'l', 'small');
      } else if (it.t === 'open') {
        g.circle(x + 3, T, 3, { cls: 'bgfill' }); g.circle(x + 3, B, 3, { cls: 'bgfill' });
        g.label(x + 10, M, it.lab || '\\text{open}', 'l', 'small');
      }
    });
    at.push(x);
    // dashed marks where two line sections meet
    for (let k = 1; k < items.length; k++) if (items[k].t === 'line' && items[k - 1].t === 'line') g.line(at[k], T - 6, at[k], B + 6, { cls: 'dim dash' });
    if (o.probe) {
      const [k, fr, lab] = o.probe, px = at[k] + fr * wid[k];
      g.line(px, T - 12, px, B + 6, { cls: 'dash' }); g.dot(px, T, 2.6); g.label(px, T - 14, lab, 'b', 'small');
    }
    if (o.ticks) {
      const y = B + 24, xOf = ([k, , fr]) => at[k] + (fr || 0) * wid[k], xs = o.ticks.map(xOf);
      g.line(Math.min(...xs) - 6, y, Math.max(...xs) + 16, y, { cls: 'dim', arrow: 'end', hs: 6 });
      g.label(Math.max(...xs) + 20, y, o.axis || 'z', 'l', 'small accent');
      o.ticks.forEach((tk) => { const tx = xOf(tk); g.line(tx, y - 4, tx, y + 4, { cls: 'dim' }); g.label(tx, y + 7, tk[1], 't', 'small'); });
    }
    return g.svg();
  }
  // a train of delta pulses: [[t, weight, 'label'], ...]
  function deltaPlot(list, o) {
    const m = Math.max(...list.map((p) => Math.abs(p[1])));
    return plot({ w: o.w || 360, h: o.h || 200, x: [0, o.tMax], y: [-1.3 * m, 1.35 * m], zero: true, xl: o.xl || 't\\,(\\mu\\text{s})', yl: o.yl,
      xt: o.xt, curves: list.map(([t, v]) => ({ pts: [[t, 0], [t, v]], cls: 'thick' })),
      pts: list.map(([t, v, lab]) => ({ x: t, y: v, lab, anchor: v > 0 ? 'bl' : 'tl' })) });
  }

  // the header every paper shares
  const RULES = md`**75 minutes, 100 points.** Closed book, **no calculator**. You may use the official [formula sheet](#/l/e3-sheet) and one 4″×6″ card of your own handwritten notes. Show your reasoning, box each answer, and give its units.`;
  const HOWTO = md`**How to use this paper.** Set a 75-minute timer and work it on paper first, as if it were Monday night. Then enter your answers. Open a hint only for a part you could not start. Read every worked solution, including the parts you got right: each one ends with a **speed path** (how to get the answer in well under a minute) and **where points go** (the slips that cost points on this kind of part). The next day, redo every part you missed on a blank sheet.`;
  const CONSTS = md`**Constants.** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m, $c = 3\times10^8$ m/s $= 300$ m/µs, $\eta_0 = 120\pi\ \Omega$. Numeric answers within about 2% count. You can type <code>pi</code> for $\pi$, and arithmetic like <code>1/60</code>.`;

  // ======================================================================================== EXAM J: figures
  // J4: three sections fed by an impulse
  const sJ4 = TL.solve({ Vg: 1, Rg: 50, RL: 100, sections: [{ Z0: 150, len: 300, v: 300 }, { Z0: 50, len: 300, v: 150 }, { Z0: 100, len: 300, v: 300 }], tMax: 6.5 });
  const figJ4 = () => circuit([
    { t: 'gen', R: '50\\,\\Omega', V: '\\delta(t)' }, { t: 'wire', w: 12 },
    { t: 'line', w: 92, lab: 'Z_{01} = 150\\,\\Omega', sub: 'T = 1\\,\\mu\\text{s}' },
    { t: 'line', w: 112, lab: 'Z_{02} = 50\\,\\Omega', sub: 'T = 2\\,\\mu\\text{s}' },
    { t: 'line', w: 92, lab: 'Z_{03} = 100\\,\\Omega', sub: 'T = 1\\,\\mu\\text{s}' },
    { t: 'R', lab: '100\\,\\Omega', last: true },
  ], { alt: 'an impulse source with a 50-ohm internal resistance feeds three line sections in series: 150 ohms with a one-way delay of 1 microsecond, 50 ohms with 2 microseconds, and 100 ohms with 1 microsecond, ending in a 100-ohm load' });

  // J5: the scope trace, read backwards
  const sJ5 = TL.solve({ Vg: 60, Rg: 100, RL: 50, sections: [{ Z0: 100, len: 300, v: 200 }], tMax: 6 });
  const figJ5 = () => circuit([
    { t: 'gen', R: 'R_g\\ ?', V: '60\\,\\delta(t)' }, { t: 'wire', w: 14 },
    { t: 'line', w: 240, lab: 'Z_0 = 100\\,\\Omega', sub: '\\epsilon_r\\ ?,\\ \\mu = \\mu_0' },
    { t: 'R', lab: 'R_L\\ ?', last: true },
  ], { probe: [2, 1 / 3, '\\text{probe}'], ticks: [[2, '0'], [2, '100\\,\\text{m}', 1 / 3], [3, '300\\,\\text{m}']],
    alt: 'a pulse source 60 delta(t) with unknown internal resistance Rg drives a 100-ohm line of length 300 m with an unknown dielectric, ending in an unknown load RL; a probe measures the voltage at z = 100 m' });
  const figJ5trace = () => deltaPlot([[0.5, 1, 'A'], [2.5, -1 / 3, '-A/3']], { tMax: 4, yl: 'V(100\\,\\text{m}, t)', xt: [[0.5, '0.5'], [1, '1'], [2, '2'], [2.5, '2.5'], [3, '3']] });

  // J6: a line shorted at both ends, and four candidate patterns
  function figJ6() {
    const g = PF.fig({ alt: 'a lossless line 100 m long with a short circuit at each end; the distance d is measured from the right-hand end' });
    const x0 = 60, x1 = 330, T = 30, B = 100;
    g.line(x0, T, x1, T, { cls: 'thick' }); g.line(x0, B, x1, B, { cls: 'thick' });
    g.line(x0, T, x0, B, { cls: 'thick' }); g.line(x1, T, x1, B, { cls: 'thick' });
    g.label(x0 - 8, (T + B) / 2, '\\text{short}', 'r', 'small'); g.label(x1 + 8, (T + B) / 2, '\\text{short}', 'l', 'small');
    g.label((x0 + x1) / 2, T + 20, 'v = 2\\times10^8\\,\\text{m/s}', 'c', 'small');
    g.label((x0 + x1) / 2, B - 20, 'l = 100\\,\\text{m}', 'c', 'small');
    g.line(x1 + 6, B + 22, x0 - 14, B + 22, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(x0 - 18, B + 22, 'd', 'r', 'small accent');
    g.label(x1, B + 28, '0', 't', 'small'); g.label(x0, B + 28, '100\\,\\text{m}', 't', 'small');
    return g.svg();
  }
  const modePlot = (fn, o = {}) => plot({ w: 230, h: 130, ml: 26, mr: 16, x: [0, 100], y: [-1.3, 1.3], zero: true, xl: 'd', yl: o.yl || '',
    xt: [[25, '25'], [50, '50'], [75, '75'], [100, '100']], curves: [{ f: fn, n: 300 }] });
  const J6C = [(d) => Math.sin(PI * d / 100), (d) => Math.cos(2 * PI * d / 100), (d) => Math.sin(2 * PI * d / 100), (d) => Math.sin(3 * PI * d / 200)];
  const figJ6cands = () => row4(J6C.map((fn) => modePlot(fn)));
  const figJ6sol = () => PF.row([
    { svg: modePlot((d) => Math.sin(PI * d / 100)), cap: 'Lowest, 1 MHz: Ṽ(d) ∝ sin(πd/100)' },
    { svg: modePlot((d) => Math.cos(PI * d / 100)), cap: 'Lowest, 1 MHz: Ĩ(d) ∝ cos(πd/100)' },
    { svg: modePlot((d) => Math.sin(2 * PI * d / 100)), cap: 'Second, 2 MHz: Ṽ(d) ∝ sin(2πd/100)' },
  ]).svg;

  // J7: the wall, and the standing wave in front of it
  function figJ7() {
    const g = PF.fig({ alt: 'side view: free space on the left, a metal wall filling z > 0 on the right, hatched; the incident wave travels toward the wall along +z, the reflected wave away from it; E along x points up the page' });
    g.hatchBand([[250, 24], [290, 24], [290, 150], [250, 150]]);
    g.line(250, 24, 250, 150, { cls: 'thick' });
    g.label(270, 162, '\\sigma = 5\\times10^7\\,\\text{S/m}', 't', 'small');
    g.arrow(20, 176, 330, 176, { cls: 'dim', hs: 6 }); g.label(334, 176, 'z', 'l', 'small accent'); g.label(250, 182, '0', 't', 'small accent');
    g.arrow(40, 60, 200, 60, { cls: 'thick', hs: 8 }); g.label(120, 52, '\\text{incident: } E_i = 60\\pi\\ \\text{V/m}', 'b', 'small');
    g.arrow(200, 112, 40, 112, { hs: 8 }); g.label(120, 104, '\\text{reflected}', 'b', 'small');
    g.arrow(214, 150, 214, 120, { cls: 'dim', hs: 6 }); g.label(220, 124, '\\hat x', 'l', 'small accent');
    return g.svg();
  }
  const figJ7env = () => plot({
    w: 380, h: 200, x: [-1, 0.06], y: [0, 2.5], xl: 'z/\\lambda', yl: '\\text{peak field}',
    xt: [[-1, '-1'], [-0.75, '-\\tfrac34'], [-0.5, '-\\tfrac12'], [-0.25, '-\\tfrac14'], [0, '0']], yt: [[2, '2']],
    curves: [
      { f: (z) => (z <= 0 ? 2 * Math.abs(Math.sin(2 * PI * z)) : NaN), n: 400 },
      { f: (z) => (z <= 0 ? 2 * Math.abs(Math.cos(2 * PI * z)) : NaN), n: 400, cls: 'dash' },
    ],
    vlines: [[0, '\\text{wall}']],
  });

  // ======================================================================================== EXAM J
  const examJ = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** The Fall 2023 Exam 3 (Goddard, Ilie, Zhao) had seven questions. Part I was multiple choice: "circle all that apply" statements, then transmission-line questions with numeric choices. Part II was worked problems. This paper keeps that shape. Each statement below is one True/False choice: judge every statement on its own, which is what "circle all that apply" asks of you. The statements aim at the topics the other practice papers test least: the terms of the Poynting theorem, radiation pressure, surface resistance, line resonances and $\mathcal L\mathcal C = \mu\epsilon$.

      | Question | Topic | Points |
      |---|---|---|
      | 1 | Circle all that apply: the Poynting theorem, term by term | 12 |
      | 2 | Circle all that apply: radiation pressure and surface resistance | 12 |
      | 3 | Circle all that apply: resonances, $\mathcal L\mathcal C = \mu\epsilon$, a filled coax | 12 |
      | 4 | Three line sections: $\tau_g$, $\Gamma$ at a junction, current reflection, a return time | 12 |
      | 5 | A scope trace read backwards: $R_g$, $R_L$, the pulse weight, $\epsilon_r$ | 16 |
      | 6 | A line shorted at both ends: resonant frequencies and the standing pattern | 12 |
      | 7 | Worked problem: a plane wave on a metal wall | 24 |

      **Draws on:** [the Poynting theorem](#/l/w1-poynting), [power in lossy media and surface resistance](#/l/w2-loss), [reflection and radiation pressure](#/l/w4-gamma), [standing waves](#/l/w4-standing), [fields to telegrapher's equations](#/l/w5-telegraph), [launching waves](#/l/w5-launch), [junctions and scope traces](#/l/w5-multi) and [stubs and resonance](#/l/w6-stubs).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- J Question 1
    R(md`
      ## Part I: multiple choice

      ### Question 1 (12 points): the Poynting theorem, term by term

      The formula sheet writes energy conservation for fields at a point as
      $$\nabla\cdot\mathbf S + \frac{\partial w}{\partial t} + \mathbf J\cdot\mathbf E = 0$$
      with $\mathbf S = \mathbf E\times\mathbf H$ and the stored energy density
      $$w = \tfrac12\epsilon\,\mathbf E\cdot\mathbf E + \tfrac12\mu\,\mathbf H\cdot\mathbf H$$
      Circle all that apply: mark each statement True or False.
    `),
    P({ src: 'Practice J #1 · 12 pts', title: 'Which statements are true?',
      q: md`**(a)–(d) (3 pts each).** Judge each statement on its own.`,
      parts: [
        tf(md`(a) $\nabla\cdot\mathbf S$ at a point is the power per unit volume flowing **out** of that point.`, true,
          md`It is true. The divergence theorem turns $\int\nabla\cdot\mathbf S\,dV$ into $\oint\mathbf S\cdot d\mathbf A$, the power leaving through the closed surface. Per unit volume, that is $\nabla\cdot\mathbf S$, in W/m³.`),
        tf(md`(b) In a lossless dielectric carrying **one** traveling plane wave, the electric and magnetic energy densities are equal at every point and every instant.`, true,
          md`It is true. In one traveling wave $|\mathbf E| = \eta|\mathbf H|$ at every point and instant, so $\tfrac12\epsilon E^2 = \tfrac12\epsilon\eta^2H^2 = \tfrac12\mu H^2$, since $\eta^2 = \mu/\epsilon$.`),
        tf(md`(c) For a traveling wave in a lossless medium, $\partial w/\partial t = 0$ everywhere: the energy just flows through, so the energy density at a fixed point never changes.`, false,
          md`At a fixed point $E = E_0\cos(\omega t - \beta z)$, so $w = \epsilon E_0^2\cos^2(\omega t - \beta z)$ swings between 0 and $\epsilon E_0^2$ twice per period. Only its **time average** is constant. $\partial w/\partial t = -\nabla\cdot\mathbf S$ is not zero at an instant.`),
        tf(md`(d) On the surface of a current-sheet antenna, $\mathbf J_s\cdot\mathbf E > 0$: the sheet absorbs power from its own field.`, false,
          md`At the sheet $\mathbf E = -\frac{\eta}{2}\mathbf J_s$ (formula sheet), so $\mathbf J_s\cdot\mathbf E = -\frac{\eta}{2}|\mathbf J_s|^2 < 0$. A **negative** $\mathbf J\cdot\mathbf E$ is a source: whatever drives the current pushes charge against the field and hands energy to it.`),
      ],
      hints: [md`Read each term as a rate of energy, in W/m³: $\nabla\cdot\mathbf S$ is energy leaving, $\partial w/\partial t$ is energy piling up, $\mathbf J\cdot\mathbf E$ is energy handed from the field to moving charges.`, md`For (c), write $w$ at a fixed $z$ as a function of $t$. For (d), use the sheet formula $\mathbf E = -\frac{\eta}{2}\mathbf J_s$ at $z = 0$.`],
      sol: md`
        **The three terms in words.** Take a tiny box around a point. Energy can do three things there, each counted in watts per cubic meter:

        - $\nabla\cdot\mathbf S$: energy **leaves** the box through its walls, carried by the fields.
        - $\partial w/\partial t$: energy **piles up** inside the box, stored in $\mathbf E$ and $\mathbf H$.
        - $\mathbf J\cdot\mathbf E$: the field does work on moving charges. Positive means the field **gives** energy to the charges (heat in a resistor). Negative means the charges give energy **to** the field (a source).

        Energy is conserved, so the three add to zero.

        **(a) True.** The divergence theorem says
        $$\int_V\nabla\cdot\mathbf S\,dV = \oint_A\mathbf S\cdot d\mathbf A$$
        The right side is the power flowing out through the closed surface $A$, with $d\mathbf A$ pointing outward. Shrink the box to a point and divide by its volume: $\nabla\cdot\mathbf S$ is the outflow per unit volume. Units: (W/m²)/m = W/m³ ✓.

        **(b) True.** In one traveling wave the fields are locked together: $|\mathbf E| = \eta|\mathbf H|$ at every point and instant. Put that into the electric energy density:
        $$\tfrac12\epsilon E^2 = \tfrac12\epsilon\,\eta^2H^2$$
        With $\eta^2 = \mu/\epsilon$, the $\epsilon$ cancels:
        $$\tfrac12\epsilon E^2 = \tfrac12\mu H^2$$
        Equal, everywhere, always. (In a **standing** wave this fails: at a node of $\mathbf E$ all the energy is magnetic.)

        **(c) False.** Freeze a point $z$ and watch it in time. With $E = E_0\cos(\omega t - \beta z)$, part (b) says the two halves of $w$ are equal, so
        $$w = \epsilon E_0^2\cos^2(\omega t - \beta z)$$
        That swings from 0 up to $\epsilon E_0^2$ and back, twice per period. So $\partial w/\partial t \ne 0$ at most instants. The theorem balances it: $\nabla\cdot\mathbf S = -\partial w/\partial t$, so at an instant more energy flows in than out, then the reverse. What is constant is the **time average**: $\langle w\rangle = \tfrac12\epsilon E_0^2$ and $\langle\nabla\cdot\mathbf S\rangle = 0$.

        **(d) False.** The sheet's own field at $z = 0$ is (formula sheet, in vector form)
        $$\mathbf E = -\frac{\eta}{2}\,\mathbf J_s$$
        Dot it with $\mathbf J_s$:
        $$\mathbf J_s\cdot\mathbf E = -\frac{\eta}{2}|\mathbf J_s|^2 < 0$$
        Negative: the sheet is a **source**. Whatever drives its current pushes charge against $\mathbf E$ and does work on the field.

        !!intuition Does this make sense?
          Check (d) with power. Each side gets a wave with $|\mathbf E| = \frac{\eta}{2}J_s$, carrying $S = E^2/\eta = \frac{\eta}{4}J_s^2$ per m². Two sides: $\frac{\eta}{2}J_s^2$. That is exactly $-\mathbf J_s\cdot\mathbf E$ per m² of sheet ✓. The sheet supplies what the two waves carry away.

        **Speed path.** $\mathbf J\cdot\mathbf E > 0$: loss. $\mathbf J\cdot\mathbf E < 0$: source. $\nabla\cdot\mathbf S$: outflow. Equal energies only in a single traveling wave. Constant only on average.

        **Where points go.** Reading "the average is constant" as "it is constant". Thinking an antenna absorbs because current flows in it: the sign of $\mathbf J\cdot\mathbf E$ decides.
      ` }),

    // ---------------------------------------------------------------- J Question 2
    R(md`
      ### Question 2 (12 points): radiation pressure and surface resistance

      Circle all that apply: mark each statement True or False. Treat every wave as a uniform plane wave in free space at normal incidence.
    `),
    P({ src: 'Practice J #2 · 12 pts', title: 'Which statements are true?',
      q: md`**(a)–(d) (3 pts each).** Judge each statement on its own.`,
      parts: [
        tf(md`(a) A wave with $\langle S\rangle = 300$ W/m² hits a perfect mirror head-on. It pushes on the mirror with an average pressure of $2\times10^{-6}$ N/m².`, true,
          md`It is true: a perfect mirror feels $2\langle S\rangle/c = 600/(3\times10^8) = 2\times10^{-6}$ N/m².`),
        tf(md`(b) Replace the mirror with a perfect absorber. The pressure **doubles**, because the absorber takes all of the wave's energy.`, false,
          md`Pressure is momentum delivered per second per m², not energy. The absorber stops the wave's momentum ($\langle S\rangle/c$); the mirror stops it **and** sends it back ($2\langle S\rangle/c$). The absorber feels **half** the mirror's pressure.`),
        tf(md`(c) A better conductor (larger $\sigma$) has a **larger** surface resistance $R_s$, because its current is squeezed into a thinner skin.`, false,
          md`$R_s = \frac{1}{\sigma\delta}$ and $\delta = \frac{1}{\sqrt{\pi f\mu\sigma}}$ give $R_s = \sqrt{\pi f\mu/\sigma}$: it **falls** as $1/\sqrt\sigma$. The skin does get thinner, but only as $1/\sqrt\sigma$, while the metal conducts better as $\sigma$.`),
        tf(md`(d) $R_s$ is the real part of the metal's intrinsic impedance $\eta_c$.`, true,
          md`It is true: in a good conductor $\eta_c = \frac{1 + j}{\sigma\delta}$, whose real part is $\frac{1}{\sigma\delta} = R_s$.`),
      ],
      hints: [md`A wave carries momentum at the rate $\langle S\rangle/c$ per m². What happens to that momentum at an absorber, and at a mirror?`, md`For (c) and (d): $\delta = 1/\sqrt{\pi f\mu\sigma}$, and the good-conductor $\eta$ is $\sqrt{j\omega\mu/\sigma}$. Use $\sqrt j = (1 + j)/\sqrt2$.`],
      sol: md`
        **(a) True. Where the push comes from.** At a perfect mirror the reflected wave has $\Gamma = -1$, so $\mathbf E$ cancels at the surface and $\mathbf H$ doubles. With an incident $H_i\cos\omega t$, the wall carries the surface current
        $$J_s(t) = 2H_i\cos\omega t$$
        That current sits in the wave's own magnetic field and feels the force $\mathbf J_s\times\mathbf B$ per m², pointing **into** the mirror. $\mathbf B$ drops from $2\mu_0H_i\cos\omega t$ just outside to 0 inside the metal, so the current feels the average of the two, $\mu_0H_i\cos\omega t$:
        $$\text{force per m}^2 = (2H_i\cos\omega t)(\mu_0H_i\cos\omega t) = 2\mu_0H_i^2\cos^2\omega t$$
        The average of $\cos^2$ is $\tfrac12$:
        $$p = \mu_0H_i^2$$
        Write it with the incident power, $\langle S\rangle = \tfrac12\eta_0H_i^2$, so $H_i^2 = 2\langle S\rangle/\eta_0$. And $\mu_0/\eta_0 = 1/c$:
        $$p = \frac{2\mu_0\langle S\rangle}{\eta_0} = \boxed{\frac{2\langle S\rangle}{c}}$$
        Numbers:
        $$p = \frac{2(300)}{3\times10^8} = 2\times10^{-6}\ \text{N/m}^2 \quad\checkmark$$

        **(b) False.** The same result in momentum language: a plane wave carries momentum at the rate $\langle S\rangle/c$ per m². A perfect absorber **stops** that momentum: $p = \langle S\rangle/c$. A mirror stops it **and** throws it back with the same size, so the change is twice as large: $p = 2\langle S\rangle/c$. The absorber gets half the mirror's push, $10^{-6}$ N/m², not double. (Think of a ball: catching it pushes you less than letting it bounce off you.)

        **(c) False.** Start from the definitions:
        $$R_s = \frac{1}{\sigma\delta}, \qquad \delta = \frac{1}{\sqrt{\pi f\mu\sigma}}$$
        Substitute $\delta$:
        $$\sigma\delta = \frac{\sigma}{\sqrt{\pi f\mu\sigma}} = \sqrt{\frac{\sigma}{\pi f\mu}}$$
        So
        $$R_s = \sqrt{\frac{\pi f\mu}{\sigma}}$$
        A larger $\sigma$ gives a **smaller** $R_s$. Picture $R_s$ as the resistance of a square of metal one skin depth thick, $\frac{\rho L}{W\delta} = \frac{1}{\sigma\delta}$ when $L = W$. Raising $\sigma$ four times halves the thickness $\delta$ but quarters the resistivity: net, the square's resistance halves.

        **(d) True.** In a good conductor ($\sigma \gg \omega\epsilon$) the sheet's $\eta$ becomes
        $$\eta_c \approx \sqrt{\frac{j\omega\mu}{\sigma}} = \sqrt j\,\sqrt{\frac{\omega\mu}{\sigma}}$$
        With $\sqrt j = \frac{1 + j}{\sqrt2}$:
        $$\eta_c \approx (1 + j)\sqrt{\frac{\omega\mu}{2\sigma}} = (1 + j)\sqrt{\frac{\pi f\mu}{\sigma}}$$
        By (c) the root is $R_s$:
        $$\eta_c = (1 + j)R_s = \frac{1 + j}{\sigma\delta}$$
        Its real part is $R_s$ ✓. That is why the power soaked up per m² is $\tfrac12R_s|\tilde H_{\tan}|^2 = \tfrac12R_s|\tilde J_s|^2$: the power into a medium is $\tfrac12\text{Re}\{\eta\}|\tilde H|^2$.

        **Speed path.** Mirror $2S/c$, absorber $S/c$. $R_s = \sqrt{\pi f\mu/\sigma}$: up with $\sqrt f$, down with $\sqrt\sigma$. $\eta_c = (1 + j)R_s$.

        **Where points go.** Treating pressure like absorbed energy (it is momentum). Reading "thinner skin" as "more resistance" without doing the algebra.
      ` }),

    // ---------------------------------------------------------------- J Question 3
    R(md`
      ### Question 3 (12 points): resonances and $\mathcal L\mathcal C = \mu\epsilon$

      Circle all that apply: mark each statement True or False. All lines are lossless TEM lines; $\mathcal L$ and $\mathcal C$ are the inductance and capacitance per meter, as on the formula sheet.
    `),
    P({ src: 'Practice J #3 · 12 pts', title: 'Which statements are true?',
      q: md`**(a)–(d) (3 pts each).** Judge each statement on its own.`,
      parts: [
        tf(md`(a) A line open at both ends and the same line shorted at both ends have the same resonant frequencies.`, true,
          md`It is true. Shorted at both ends, $\tilde V \propto \sin\beta d$ must vanish at $d = l$; open at both ends, $\tilde I \propto \sin\beta d$ must vanish there. Both give $\beta l = n\pi$: $f = nv/2l$.`),
        tf(md`(b) A line 150 m long with $v = 3\times10^8$ m/s, shorted at one end and open at the other, can ring at 1 MHz.`, false,
          md`One short and one open need $l$ to be an **odd number of quarter wavelengths**: $f = (2n - 1)\frac{v}{4l} = 0.5,\ 1.5,\ 2.5$ MHz. At 1 MHz, $l = \lambda/2$: that fits two ends of the same kind, not a short and an open.`),
        tf(md`(c) For any TEM line filled with one uniform material, $\mathcal L\mathcal C = \mu\epsilon$, whatever the shape of the two conductors.`, true,
          md`It is true. $\mathcal L = \mu/GF$ and $\mathcal C = \epsilon\,GF$ with the same geometric factor $GF$, so the shape cancels in the product.`),
        tf(md`(d) Filling an air coax with a dielectric of $\epsilon_r = 4$ halves its wave speed and **doubles** its $Z_0$.`, false,
          md`$\mathcal L$ is unchanged (still $\mu_0$) and $\mathcal C$ goes up 4 times. Then $v = 1/\sqrt{\mathcal L\mathcal C}$ halves **and** $Z_0 = \sqrt{\mathcal L/\mathcal C}$ halves. Nothing doubles.`),
      ],
      hints: [md`A resonance is a standing wave that fits both ends: a short forces $\tilde V = 0$ there, an open forces $\tilde I = 0$. On a shorted line $\tilde V \propto \sin\beta d$ and $\tilde I \propto \cos\beta d$ (formula sheet).`, md`For (c) and (d): $\mathcal L = \mu/GF$, $\mathcal C = \epsilon\,GF$, $v = 1/\sqrt{\mathcal L\mathcal C}$, $Z_0 = \sqrt{\mathcal L/\mathcal C}$.`],
      sol: md`
        **What a resonance is.** A line with no source can still ring if a standing wave fits between its ends. Each end imposes one condition:

        - a **short** forces $\tilde V = 0$ there (a voltage node);
        - an **open** forces $\tilde I = 0$ there (a current node, so a voltage maximum).

        Measure $d$ back from one end. If that end is shorted, the formula sheet gives
        $$\tilde V(d) = j2\tilde V^+\sin\beta d$$
        and the current is $\propto\cos\beta d$.

        **(a) True.** Shorted at both ends: $\tilde V$ must also vanish at $d = l$:
        $$\sin\beta l = 0 \quad\Rightarrow\quad \beta l = n\pi$$
        Open at both ends: start from the open end, where $\tilde V \propto \cos\beta d$ and $\tilde I \propto \sin\beta d$. The current must vanish at $d = l$: $\sin\beta l = 0$, the same condition. With $\beta = 2\pi f/v$:
        $$\boxed{f_n = \frac{nv}{2l},\quad n = 1, 2, 3, \dots}$$
        The length is a whole number of half wavelengths in both cases. The patterns differ (voltage nodes and antinodes swap places) but the frequencies are the same.

        **(b) False.** Short at $d = 0$, open at $d = l$: now $\tilde I \propto \cos\beta d$ must vanish at $d = l$:
        $$\cos\beta l = 0 \quad\Rightarrow\quad \beta l = \frac{\pi}{2},\ \frac{3\pi}{2},\ \dots$$
        So $l$ is an odd number of quarter wavelengths:
        $$f = (2n - 1)\frac{v}{4l}$$
        Here $\frac{v}{4l} = \frac{3\times10^8}{600} = 0.5$ MHz, so the line rings at 0.5, 1.5, 2.5 MHz. Not at 1 MHz.

        **(c) True.** A TEM line's per-meter inductance and capacitance come from the same 2-D static field picture in the cross-section, through one geometric factor $GF$ (parallel plate: $W/d$; coax: $2\pi/\ln(b/a)$):
        $$\mathcal L = \frac{\mu}{GF}, \qquad \mathcal C = \epsilon\,GF$$
        Multiply them and $GF$ cancels:
        $$\boxed{\mathcal L\mathcal C = \mu\epsilon}$$
        So $v = 1/\sqrt{\mathcal L\mathcal C} = 1/\sqrt{\mu\epsilon}$: a TEM wave on any line travels at the speed of a plane wave in the filling.

        **(d) False.** Fill the coax. $\mu$ is unchanged, so $\mathcal L$ is unchanged; $\epsilon$ goes up 4 times, so $\mathcal C$ goes up 4 times. Then
        $$v = \frac{1}{\sqrt{\mathcal L\cdot4\mathcal C}} = \frac{v_{\text{air}}}{2}, \qquad Z_0 = \sqrt{\frac{\mathcal L}{4\mathcal C}} = \frac{Z_{0,\text{air}}}{2}$$
        Both halve. The coax formula on your card says the same: $Z_0 = \frac{60}{\sqrt{\epsilon_r}}\ln\frac ba$.

        !!intuition Does this make sense?
          A guitar string fixed at both ends and an organ pipe open at both ends both sound $nv/2l$. A pipe closed at one end sounds only the odd harmonics of $v/4l$. A line is the same physics.

        **Speed path.** Same ends: $l = n\lambda/2$. Different ends: $l = (2n - 1)\lambda/4$. $\mathcal L\mathcal C = \mu\epsilon$ always; $\epsilon_r$ divides both $v$ and $Z_0$ by $\sqrt{\epsilon_r}$.

        **Where points go.** Giving a short-open line the half-wave frequencies. Thinking $Z_0$ grows with $\epsilon_r$ because $\eta = \sqrt{\mu/\epsilon}$ is "an impedance": it shrinks, like $\eta$.
      ` }),

    // ---------------------------------------------------------------- J Question 4
    RF(md`
      ### Question 4 (12 points): three line sections

      At $t = 0$ a source with internal resistance $50\ \Omega$ fires a voltage impulse $\delta(t)$ into three lossless line sections in series, ending in a $100\ \Omega$ load. $T$ is each section's one-way travel time.

      [[fig:ckt]]
    `, { ckt: { svg: figJ4(), cap: 'Three sections: 150 Ω for 1 µs, 50 Ω for 2 µs, 100 Ω for 1 µs. The load matches the last section.' } }),
    P({ src: 'Practice J #4 · 12 pts', title: 'Coefficients and a return time',
      q: md`**(i)–(iv) (3 pts each).**`,
      parts: [
        mc(md`(i) The injection coefficient $\tau_g$ is`, [md`$\tfrac14$`, md`$\tfrac13$`, md`$\tfrac12$`, md`$\tfrac34$`], 3,
          [md`That is $R_g/(R_g + Z_{01}) = 50/200$: the source resistor's share. The line takes the voltage across $Z_{01}$.`, md`That divides by $Z_{01}$ alone: $50/150$. The divider is $Z_{01}/(R_g + Z_{01})$.`, md`That uses $Z_{02} = 50\ \Omega$. At $t = 0^+$ the source sees only the first section.`, null], true),
        mc(md`(ii) The voltage reflection coefficient at the junction of sections 1 and 2, for a wave arriving from the left, is`, [md`$-\tfrac12$`, md`$-\tfrac13$`, md`$\tfrac13$`, md`$\tfrac12$`], 0,
          [null, md`That is $(50 - 100)/(50 + 100)$: it uses the load or section 3. The wave arriving at junction 1 sees $Z_{02} = 50\ \Omega$ ahead and comes from $Z_{01} = 150\ \Omega$.`, md`Sign and size both off: that is $(100 - 50)/150$, junction 2.`, md`That is the sign for a wave coming from the **right** (50 into 150). From the left, $(Z_{02} - Z_{01})/(Z_{02} + Z_{01}) = -100/200$.`], true),
        mc(md`(iii) The **current** reflection coefficient at the junction of sections 2 and 3, for a wave arriving from the left, is`, [md`$-\tfrac12$`, md`$-\tfrac13$`, md`$\tfrac13$`, md`$\tfrac12$`], 1,
          [md`That is the **voltage** coefficient of junction 1, $(50 - 150)/200$. At junction 2 the impedances are 50 and 100.`, null, md`That is the **voltage** coefficient, $(100 - 50)/(100 + 50)$. A reflected wave's current is $-V^-/Z_0$, so current reflects with $-\Gamma$.`, md`That is $(100 - 50)/100$: the denominator must be the sum, $150$.`], true),
        mc(md`(iv) The earliest time at which a wave reflected at the junction of sections 2 and 3 reaches the source is`, ['3 µs', '4 µs', '5 µs', '6 µs', '8 µs'], 3,
          [md`That is when the first wave **reaches** junction 2 ($1 + 2$). It still has to come back.`, md`That counts section 2 as 1 µs each way. Section 2 takes 2 µs.`, md`That is when the reflection reaches junction 1 ($3 + 2$). It needs 1 µs more through section 1.`, null, md`That adds one more trip through section 1 or one through section 3. The path is 1 + 2 out, 2 + 1 back.`], true),
      ],
      hints: [md`At $t = 0^+$ the first section looks like a resistor $Z_{01}$ to the source: a voltage divider.`, md`A wave arriving at a junction sees the next line as a resistor equal to its $Z_0$, because nothing has come back from beyond yet: $\Gamma = (Z_{\text{ahead}} - Z_{\text{here}})/(Z_{\text{ahead}} + Z_{\text{here}})$.`],
      sol: md`
        **(i) The launch.** Just after $t = 0$ nothing has come back from the junction, so the first section draws current like a resistor $Z_{01} = 150\ \Omega$. The source sees a voltage divider:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{150}{50 + 150}$$
        $$\boxed{\tau_g = \tfrac34}$$
        This $\tau_g$ is the **injection coefficient**: the fraction of the source voltage that becomes the first wave. So the first wave is $\tfrac34\delta(t)$.

        **(ii) Junction 1, from the left.** A wave arriving at a junction does not yet know what is beyond the next line. To it, the next line is a resistor equal to that line's $Z_0$. So use the load formula with "load" $= Z_{02}$ and "line" $= Z_{01}$:
        $$\Gamma_{12} = \frac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}} = \frac{50 - 150}{50 + 150}$$
        $$\boxed{\Gamma_{12} = -\tfrac12}$$
        Negative, because the wave steps down to a smaller impedance.

        **(iii) Junction 2, current.** First the voltage coefficient, the same way:
        $$\Gamma_{23} = \frac{100 - 50}{100 + 50} = \frac13$$
        Now the current. In the reflected wave, $I^- = -V^-/Z_0$ (it carries power back toward the source), while in the incident wave $I^+ = +V^+/Z_0$. So
        $$\frac{I^-}{I^+} = -\frac{V^-}{V^+} = -\Gamma_{23}$$
        $$\boxed{\Gamma_{c} = -\tfrac13}$$

        **(iv) The return time.** Follow the first wave: it crosses section 1 (1 µs) and section 2 (2 µs) and hits junction 2 at $t = 3$ µs. Its reflection crosses section 2 back (2 µs) and section 1 back (1 µs):
        $$t = 1 + 2 + 2 + 1$$
        $$\boxed{t = 6\ \mu\text{s}}$$
        Its weight on arrival: $\tfrac34\times\tfrac12\times\tfrac13\times\tfrac32 = \tfrac{3}{16}$ (transmitted into 2 with $1 + \Gamma_{12} = \tfrac12$, reflected with $\tfrac13$, transmitted back into 1 with $1 + \tfrac12 = \tfrac32$).

        [[fig:bd]]

        !!intuition Does this make sense?
          The last section is matched ($R_L = Z_{03}$), so nothing ever comes back from the load: every line in the diagram that turns around does so at a junction or at the source.

        **Speed path.** $\tau_g = Z_{01}/(R_g + Z_{01})$; at a junction, "ahead minus here over ahead plus here"; current takes $-\Gamma$; times add along the path.

        **Where points go.** Using the wrong pair of impedances at a junction. Forgetting the minus sign for current. Counting section 2 as 1 µs.
      `,
      figs: { bd: { svg: TL.diagram(sJ4, { tMax: 6.5, w: 400, h: 380, amps: false }), cap: 'Bounce diagram up to 6.5 µs (weights left off to keep the paths readable). The dashed lines are the junctions; the matched load ($\\Gamma_L = 0$) sends nothing back. Follow the line that turns at 600 m at 3 µs: it reaches $z = 0$ at 6 µs.' } } }),

    // ---------------------------------------------------------------- J Question 5
    RF(md`
      ### Question 5 (16 points): read the scope trace backwards

      A pulse generator with an **unknown** internal resistance $R_g$ fires $60\,\delta(t)$ V (an impulse of weight 60 V·µs) at $t = 0$ into a lossless, nonmagnetic line with $Z_0 = 100\ \Omega$ and length 300 m, filled with an unknown dielectric. The load $R_L$ is unknown and resistive. A probe at $z = 100$ m records two impulses: weight $A$ at $t = 0.5$ µs and weight $-A/3$ at $t = 2.5$ µs. **Nothing else ever arrives.**

      [[fig:ckt]]

      [[fig:trace]]
    `, { ckt: { svg: figJ5(), cap: 'Rg, RL and the dielectric are unknown. The probe sits a third of the way along.' },
      trace: { svg: figJ5trace(), cap: 'What the probe records at z = 100 m: two impulses, then nothing.' } }),
    P({ src: 'Practice J #5 · 16 pts', title: 'Rg, RL, A and εr from two pulses',
      q: md`**(a)–(d) (4 pts each).**`,
      parts: [
        mc(md`(a) $R_g$ in ohms is`, ['0', '50', '100', '200', '∞'], 2,
          [md`A short has $\Gamma_g = -1$: the $-A/3$ pulse would come back from the source as $+A/3$ and be seen again at 3.5 µs.`, md`$\Gamma_g = (50 - 100)/150 = -1/3$ would send a third of every returning wave back down the line.`, null, md`$\Gamma_g = 1/3$: the returning wave would bounce back, and the probe would see a third impulse at 3.5 µs.`, md`An open source launches nothing ($\tau_g = 0$) and reflects everything.`], true),
        mc(md`(b) $R_L$ in ohms is`, ['25', '50', '100', '200', '∞'], 1,
          [md`Check it: $(25 - 100)/(25 + 100) = -3/5$, not $-1/3$. Solving $\Gamma_L = -1/3$ gives $R_L = Z_0\frac{1 + \Gamma_L}{1 - \Gamma_L} = 100\cdot\frac{2/3}{4/3}$.`, null, md`A matched load reflects nothing; here a $-A/3$ wave came back.`, md`That load gives $\Gamma_L = +1/3$. The returning pulse is **negative**: the load is smaller than $Z_0$.`, md`An open end reflects with $\Gamma = +1$: the second pulse would be $+A$.`], true),
        mc(md`(c) $A$ in V·µs is`, ['15', '20', '30', '40', '60'], 2,
          [md`That uses $\tau_g = 1/4$, as if $R_g = 3Z_0$. With $R_g = 100\ \Omega$, $\tau_g = 100/200 = 1/2$.`, md`That uses $\tau_g = 1/3$.`, null, md`That uses $\tau_g = 2/3$, from a 50 Ω source resistor.`, md`That is the whole source impulse; only $\tau_g$ of it enters the line.`], true),
        mc(md`(d) The relative permittivity $\epsilon_r$ of the dielectric is`, ['1.5', '2.25', '3', '4', '9'], 1,
          [md`That is $c/v$ itself. $v = c/\sqrt{\epsilon_r}$, so $\epsilon_r = (c/v)^2$.`, null, md`That squares the wrong ratio. The first pulse covers 100 m in 0.5 µs: $v = 200$ m/µs.`, md`That takes $v = 150$ m/µs: the pulse covers 100 m in 0.5 µs, not 300 m in 2 µs.`, md`That takes $v = 100$ m/µs: 200 m in the 2 µs between the pulses. In those 2 µs the wave goes probe to load **and back**, 400 m.`], true),
      ],
      hints: [md`The first impulse is the launched wave, $\tau_g\cdot60$, passing the probe on its way out. When does it reach the probe, and what does that give for $v$?`, md`The second impulse is that wave after one bounce off the load: the ratio of the two weights is $\Gamma_L$. Then ask why no third impulse ever comes.`],
      sol: md`
        **What each pulse is.** The first impulse is the wave the source launched, passing the probe on its way to the load. The second one has the opposite sign and a third of the size: it is that wave after bouncing off the load, passing the probe on its way back.

        **(d) first: the speed.** The launched wave covers the 100 m to the probe in 0.5 µs:
        $$v = \frac{100\ \text{m}}{0.5\ \mu\text{s}} = 200\ \text{m}/\mu\text{s} = 2\times10^8\ \text{m/s}$$
        Check it with the second pulse: probe to load and back is $2\times200 = 400$ m, which takes 2 µs, and $0.5 + 2 = 2.5$ µs ✓. For a nonmagnetic filling $v = c/\sqrt{\epsilon_r}$:
        $$\epsilon_r = \left(\frac{c}{v}\right)^2 = \left(\frac{300}{200}\right)^2$$
        $$\boxed{\epsilon_r = 2.25}$$

        **(b) The load.** The load turned weight $A$ into weight $-A/3$:
        $$\Gamma_L = -\frac13$$
        Solve $\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0}$ for $R_L$. Cross-multiply and collect $R_L$:
        $$R_L = Z_0\,\frac{1 + \Gamma_L}{1 - \Gamma_L} = 100\cdot\frac{2/3}{4/3}$$
        $$\boxed{R_L = 50\ \Omega}$$
        Negative $\Gamma_L$ means a load smaller than $Z_0$ ✓.

        **(a) The source.** The $-A/3$ wave keeps going and reaches the source at $t = 2.5 + 0.5 = 3$ µs. If $\Gamma_g$ were not zero, part of it would bounce back and pass the probe again at 3.5 µs. Nothing ever arrives, so
        $$\Gamma_g = \frac{R_g - Z_0}{R_g + Z_0} = 0 \quad\Rightarrow\quad \boxed{R_g = 100\ \Omega}$$

        **(c) The weight.** Now the launch:
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{100}{200} = \frac12$$
        The first wave has weight
        $$A = \tau_g\cdot60 = \boxed{30\ \text{V}\cdot\mu\text{s}}$$
        and the second $-10$ V·µs.

        [[fig:bd]]

        **Speed path.** First time gives $v$; ratio of weights gives $\Gamma_L$; "nothing else" gives $\Gamma_g = 0$; then $\tau_g = 1/2$.

        **Where points go.** Getting $v$ from the second pulse as if it were a one-way trip. Taking $\Gamma_L = +1/3$ (dropping the sign). Missing what "nothing else ever arrives" is telling you.
      `,
      figs: { bd: { svg: TL.diagram(sJ5, { tMax: 4, w: 360, h: 300, unit: '', probe: 100 }), cap: 'The bounce diagram once everything is known (weights in V·µs). The dots are what the probe at z = 100 m sees.' } } }),

    // ---------------------------------------------------------------- J Question 6
    RF(md`
      ### Question 6 (12 points): a line shorted at both ends

      A lossless line of length $l = 100$ m with $v = 2\times10^8$ m/s is shorted at both ends. With no source, it supports resonant oscillations. In cosinusoidal steady state the voltage phasor is zero at both ends. Measure $d$ from the right-hand end.

      [[fig:line]]
    `, { line: { svg: figJ6(), cap: 'Shorted at both ends: a voltage node at each end.' } }),
    P({ src: 'Practice J #6 · 12 pts', title: 'Resonances and the standing pattern',
      q: md`**(a)–(d) (3 pts each).** For (c) the candidates are drawn below; each shows $\tilde V(d)$ up to a constant factor, for $0 \le d \le 100$ m.

[[fig:cands]]`,
      parts: [
        mc(md`(a) The lowest resonant frequency is`, ['0.5 MHz', '1 MHz', '2 MHz', '4 MHz'], 1,
          [md`That is $v/4l$: a short at one end and an **open** at the other. Two shorts need a half wavelength.`, null, md`That is the second resonance, $2v/2l$.`, md`That makes the line two wavelengths long ($\lambda = 50$ m). The lowest mode needs only half a wavelength: $\lambda = 200$ m.`], true),
        mc(md`(b) The second-lowest resonant frequency is`, ['1 MHz', '1.5 MHz', '2 MHz', '3 MHz'], 2,
          [md`That is the lowest one.`, md`That is the second resonance of a short-**open** line, $3v/4l$.`, null, md`That is the third, $3v/2l$.`], true),
        mc(md`(c) At the second-lowest resonance, $\tilde V(d)$ looks like`, PLOTS, 2,
          [md`That is the **lowest** mode: one half wavelength along the line.`, md`That has voltage maxima at the ends. A short forces $\tilde V = 0$ there. (It is the current pattern of this mode.)`, null, md`That has a maximum at $d = 100$ m: an open end there. Both ends are shorted.`], true),
        mc(md`(d) At the **lowest** resonance, $|\tilde I(d)|$ is largest`, ['at the two shorted ends', 'at the middle, d = 50 m', 'at d = 25 m and d = 75 m', 'nowhere in particular: it is the same everywhere'],
          0, [null, md`The middle is where the **voltage** peaks in the lowest mode. Current and voltage are a quarter wavelength apart.`, md`Those are the voltage peaks of the second mode, not current peaks of the first.`, md`A standing wave has fixed nodes and peaks; only a single traveling wave has the same size everywhere.`]),
      ],
      hints: [md`Measured from a shorted end, $\tilde V(d) = j2\tilde V^+\sin\beta d$. The other end is shorted too: $\sin\beta l = 0$.`, md`The current on a shorted line goes as $\cos\beta d$: largest where the voltage is zero.`],
      sol: md`
        **1. The pattern from one end.** Measured from the right-hand short, the formula sheet gives
        $$\tilde V(d) = j2\tilde V^+\sin\beta d$$
        and the current is $\tilde I(d) \propto \cos\beta d$ (a quarter wavelength out of step with $\tilde V$).

        **2. The other end.** The left end is shorted too, so $\tilde V(l) = 0$:
        $$\sin\beta l = 0 \quad\Rightarrow\quad \beta l = n\pi,\quad n = 1, 2, \dots$$
        ($n = 0$ gives no wave at all.) With $\beta = 2\pi f/v$:
        $$\frac{2\pi f\,l}{v} = n\pi \quad\Rightarrow\quad f_n = \frac{nv}{2l}$$

        **3. Numbers.** $\frac{v}{2l} = \frac{2\times10^8}{200} = 10^6$ Hz:
        $$\boxed{f_1 = 1\ \text{MHz}, \qquad f_2 = 2\ \text{MHz}}$$
        At $f_1$ the line is half a wavelength long ($\lambda = 200$ m); at $f_2$ it is one full wavelength ($\lambda = 100$ m).

        **4. (c) The pattern at f₂.** $\beta = 2\pi/\lambda = 2\pi/100$ per meter:
        $$\tilde V(d) \propto \sin\frac{2\pi d}{100}$$
        Zero at $d = 0$, $50$ and $100$ m, a peak at 25 m and a trough at 75 m. That is **Plot C**.

        **5. (d) The current at f₁.** $\tilde I \propto \cos\frac{\pi d}{100}$: size 1 at $d = 0$ and $d = 100$ m, zero at the middle. The current is largest **at the two shorts**, where the voltage is zero.

        [[fig:modes]]

        !!intuition Does this make sense?
          At a short the voltage must be zero but the current can be anything, so the current piles up there. At the middle of the lowest mode the current has nowhere to go, so the charge piles up and the voltage peaks. Energy sloshes between the two every quarter period.

        **Speed path.** Same kind of ends: $f_n = nv/2l$. Count the half wavelengths that fit: one hump, then two.

        **Where points go.** Using $v/4l$ (that is a short-open line). Picking the plot with peaks at the shorts: that is the current, not the voltage.
      `,
      figs: { cands: { svg: figJ6cands(), cap: 'Candidate voltage patterns for part (c).' }, modes: { svg: figJ6sol(), cap: 'The lowest mode (voltage and current) and the second mode (voltage), up to a constant factor.' } } }),

    // ---------------------------------------------------------------- J Question 7
    RF(md`
      ## Part II: worked problem

      ### Question 7 (24 points): a plane wave on a metal wall

      A uniform plane wave in free space,
      $$\mathbf E_i = \hat x\,60\pi\cos(\omega t - \beta z)\ \text{V/m}$$
      hits a flat metal wall that fills $z > 0$. The metal is a good conductor with $\sigma = 5\times10^7$ S/m, and at this frequency (about 5 GHz) its skin depth is $\delta = 1\ \mu$m.

      [[fig:wall]]
    `, { wall: { svg: figJ7(), cap: 'The wave arrives from the left and meets the metal at z = 0.' } }),
    P({ src: 'Practice J #7(a) · 4 pts', title: 'The surface current',
      q: md`**(a) (4 pts)** The wall reflects almost perfectly. Find the amplitude of the surface current $\mathbf J_s$ on the wall, and its direction.`,
      parts: [trap(N(md`$|\mathbf J_s|$ (A/m)`, 1, 'A/m'), [[0.5, md`That is $H_i = E_i/\eta_0$, the incident field alone. At the wall the reflected $H$ adds to the incident $H$: the total is $2H_i$.`], [0, md`$\mathbf E$ is zero at the wall, but $\mathbf H$ is doubled there, and $\mathbf J_s$ comes from $\mathbf H$.`]]),
        mc(md`$\mathbf J_s$ points along`, [md`$\pm\hat x$, parallel to $\mathbf E_i$`, md`$\pm\hat y$, parallel to $\mathbf H_i$`, md`$\pm\hat z$, into the wall`, md`it has no direction: the wall carries no net current`], 0,
          [null, md`$\mathbf J_s = \hat n\times\mathbf H$ is perpendicular to $\mathbf H$, which lies along $\hat y$.`, md`A surface current flows **along** the surface; $\hat n\times\mathbf H$ is always tangential.`, md`It oscillates, so its average is zero, but at each instant it flows along $\pm\hat x$ with amplitude $2H_i$.`])],
      hints: [md`At a near-perfect conductor $\Gamma \approx -1$: the reflected $\mathbf E$ cancels the incident one at $z = 0$, and the reflected $\mathbf H$ (which carries $-\Gamma$) **adds** to the incident $\mathbf H$.`, md`$\mathbf J_s = \hat n\times\mathbf H$ with $\hat n = -\hat z$, pointing out of the metal into the region where the fields are.`],
      sol: md`
        **1. Why Γ ≈ −1.** The metal's intrinsic impedance is (Question 2(d))
        $$\eta_c = \frac{1 + j}{\sigma\delta} = \frac{1 + j}{(5\times10^7)(10^{-6})} = (1 + j)\,0.02\ \Omega$$
        That is tiny next to $\eta_0 \approx 377\ \Omega$. So
        $$\Gamma = \frac{\eta_c - \eta_0}{\eta_c + \eta_0} \approx \frac{-\eta_0}{\eta_0} = -1$$
        The wall is a mirror, to about one part in ten thousand.

        **2. The incident magnetic field.** For a wave along $+\hat z$ with $\mathbf E$ along $\hat x$, $\mathbf H$ is along $\hat y$ ($\hat x\times\hat y = \hat z$), with size $E_i/\eta_0$:
        $$H_i = \frac{60\pi}{120\pi} = 0.5\ \text{A/m}$$
        $$\mathbf H_i = \hat y\,0.5\cos(\omega t - \beta z)\ \text{A/m}$$

        **3. The total H at the wall.** The reflected $\tilde{\mathbf E}$ carries $\Gamma = -1$, but the reflected $\tilde{\mathbf H}$ carries $-\Gamma = +1$ (its direction of travel reversed). At $z = 0$ the two magnetic fields add:
        $$\mathbf H(0, t) = \hat y\,2(0.5)\cos\omega t = \hat y\,\cos\omega t\ \text{A/m}$$

        **4. The surface current.** $\mathbf J_s = \hat n\times\mathbf H$, with $\hat n$ pointing out of the metal into the field region: $\hat n = -\hat z$. And $\hat z\times\hat y = -\hat x$, so $(-\hat z)\times\hat y = +\hat x$:
        $$\mathbf J_s = \hat x\,\cos\omega t\ \text{A/m}$$
        $$\boxed{|\mathbf J_s| = 2H_i = 1\ \text{A/m, along } \pm\hat x}$$
        It flows parallel to the incident $\mathbf E$.

        [[fig:env]]

        !!intuition Does this make sense?
          A mirror needs a current that radiates the reflected wave. A sheet $\mathbf J_s$ radiates $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$ toward both sides. Toward $-z$ that is the reflected wave; toward $+z$ it cancels the incident wave inside the metal, which takes $\frac{\eta_0}{2}J_s = E_i$, so $J_s = 2E_i/\eta_0 = 1$ A/m ✓.

        **Speed path.** Mirror: $H$ doubles at the wall, $|J_s| = 2E_i/\eta_0$.

        **Where points go.** Using $H_i$ instead of $2H_i$. Saying the current flows along $\mathbf H$.
      `,
      figs: { env: { svg: figJ7env(), cap: 'In front of the wall. Solid: $|\\mathbf E|/E_i$, zero at the wall. Dashed: $|\\mathbf H|/H_i$, doubled at the wall. The two patterns are a quarter wavelength apart.' } } }),
    P({ src: 'Practice J #7(b) · 4 pts', title: 'Radiation pressure',
      q: md`**(b) (4 pts)** Treating the wall as a perfect mirror, find the time-averaged radiation pressure on it.`,
      parts: [trap(N(md`$p$ (N/m²)`, PI * 1e-7, 'N/m²'), [[PI * 1e-7 / 2, md`That is $\langle S_i\rangle/c$, the pressure on an **absorber**. A mirror reverses the momentum: $2\langle S_i\rangle/c$.`], [1e-7, md`Check $\langle S_i\rangle$: $(60\pi)^2/(2\cdot120\pi) = 15\pi$ W/m², so $p = 30\pi/(3\times10^8)$.`]])],
      hints: [md`$\langle S_i\rangle = E_i^2/2\eta_0$, then $p = 2\langle S_i\rangle/c$. Or, from (a): $p = \mu_0H_i^2$.`],
      sol: md`
        **1. The incident power density.**
        $$\langle S_i\rangle = \frac{E_i^2}{2\eta_0} = \frac{(60\pi)^2}{2(120\pi)} = \frac{3600\pi^2}{240\pi}$$
        $$\langle S_i\rangle = 15\pi \approx 47.1\ \text{W/m}^2$$

        **2. The pressure on a mirror** (Question 2(a)): the wave's momentum, $\langle S_i\rangle/c$ per second per m², is reversed, so twice that is delivered:
        $$p = \frac{2\langle S_i\rangle}{c} = \frac{30\pi}{3\times10^8}$$
        $$\boxed{p = \pi\times10^{-7} \approx 3.14\times10^{-7}\ \text{N/m}^2}$$

        **3. Check from (a).** The force on the surface current gave $p = \mu_0H_i^2$:
        $$\mu_0H_i^2 = (4\pi\times10^{-7})(0.5)^2 = \pi\times10^{-7}\ \text{N/m}^2\ \checkmark$$

        !!intuition Does this make sense?
          About a third of a micropascal: sunlight on a mirror is of this order. Radiation pressure is real but tiny, which is why solar sails must be huge and light.

        **Speed path.** $p = \mu_0H_i^2$ with $H_i = 0.5$: one line.

        **Where points go.** Using the absorber formula. Forgetting the $\tfrac12$ in $\langle S\rangle$.
      ` }),
    P({ src: 'Practice J #7(c) · 4 pts', title: 'Surface resistance',
      q: md`**(c) (4 pts)** Find the surface resistance $R_s$ of the wall at this frequency.`,
      parts: [trap(N(md`$R_s$ (Ω)`, 0.02, 'Ω'), [[0.02 * Math.SQRT2, md`That is $|\eta_c| = \sqrt2/(\sigma\delta)$. $R_s$ is the **real part** of $\eta_c$, $1/(\sigma\delta)$.`], [5e-14, md`That is $\sigma\delta^2$... $R_s = 1/(\sigma\delta)$ has $\delta$ to the first power, in the denominator.`]])],
      hints: [md`$R_s = 1/(\sigma\delta)$: the resistance of a square of the metal one skin depth thick.`],
      sol: md`
        **1. Definition.** The current crowds into a layer about one skin depth thick. A square of that layer, current flowing across it, has resistance $\frac{\rho L}{W\delta}$ with $L = W$:
        $$R_s = \frac{1}{\sigma\delta}$$
        **2. Numbers.**
        $$R_s = \frac{1}{(5\times10^7)(10^{-6})} = \frac{1}{50}$$
        $$\boxed{R_s = 0.02\ \Omega}$$
        It is the real part of $\eta_c = (1 + j)0.02\ \Omega$ from (a) ✓.

        **Speed path.** $\sigma\delta = 50$ S; flip it.

        **Where points go.** Reporting $|\eta_c|$ (which has a $\sqrt2$). Mixing up µm and mm.
      ` }),
    P({ src: 'Practice J #7(d) · 4 pts', title: 'Heating of the wall',
      q: md`**(d) (4 pts)** Find the time-averaged power absorbed per square meter of wall.`,
      parts: [trap(N(md`$\langle P_{\text{abs}}\rangle$ (W/m²)`, 0.01, 'W/m²'), [[0.02, md`That is $R_s|J_s|^2$ without the $\tfrac12$. A current $J_s\cos\omega t$ dissipates $R_sJ_s^2\cos^2\omega t$, whose average is half the peak.`], [0.0025, md`That uses $H_i = 0.5$ A/m. The current at the wall is $2H_i = 1$ A/m.`]])],
      hints: [md`A surface current $J_s\cos\omega t$ flowing through the surface resistance $R_s$ heats it at $R_sJ_s^2\cos^2\omega t$ per m².`],
      sol: md`
        **1. Joule heating of the current.** Per square meter of wall, a current per unit width $J_s(t)$ through a resistance $R_s$ per square dissipates $R_sJ_s^2(t)$ watts (the surface version of $I^2R$). With $J_s(t) = 1\cdot\cos\omega t$ A/m:
        $$P(t) = R_s\cos^2\omega t$$
        The average of $\cos^2$ is $\tfrac12$:
        $$\langle P_{\text{abs}}\rangle = \tfrac12R_s|J_s|^2 = \tfrac12(0.02)(1)^2$$
        $$\boxed{\langle P_{\text{abs}}\rangle = 0.01\ \text{W/m}^2}$$

        **2. The same thing as a wave.** Tangential $\mathbf H$ is continuous, so the wave that enters the metal has $|\tilde H_t| = 2H_i = 1$ A/m. The power it carries in is
        $$\tfrac12\text{Re}\{\eta_c\}|\tilde H_t|^2 = \tfrac12(0.02)(1)^2 = 0.01\ \text{W/m}^2\ \checkmark$$
        That power dies within a few skin depths: it all becomes heat.

        **Speed path.** $\tfrac12R_s(2H_i)^2$.

        **Where points go.** Dropping the $\tfrac12$. Using $H_i$ for the current.
      ` }),
    P({ src: 'Practice J #7(e) · 4 pts', title: 'What fraction is lost?',
      q: md`**(e) (4 pts)** What fraction of the incident power does the wall absorb?`,
      parts: [trap(N(md`fraction absorbed`, 1 / (1500 * PI), ''), [[2 / (1500 * PI), md`That divides by $\langle S_i\rangle$ but uses $R_s|J_s|^2$ without the $\tfrac12$.`], [0.01, md`That is the absorbed power in W/m², not divided by the incident $15\pi$ W/m².`]])],
      hints: [md`Divide (d) by $\langle S_i\rangle = 15\pi$ W/m² from (b). Check with $4R_s/\eta_0$.`],
      sol: md`
        **1. Divide.**
        $$\frac{\langle P_{\text{abs}}\rangle}{\langle S_i\rangle} = \frac{0.01}{15\pi} = \frac{1}{1500\pi}$$
        $$\boxed{\text{fraction} \approx 2.12\times10^{-4}}$$
        **2. The shortcut, and why.** Symbolically, $\langle P_{\text{abs}}\rangle = \tfrac12R_s(2H_i)^2 = 2R_sH_i^2$ and $\langle S_i\rangle = \tfrac12\eta_0H_i^2$. The ratio:
        $$\frac{2R_sH_i^2}{\tfrac12\eta_0H_i^2} = \frac{4R_s}{\eta_0} = \frac{0.08}{120\pi} = \frac{1}{1500\pi}\ \checkmark$$
        The exact $1 - |\Gamma|^2$ from $\eta_c = (1 + j)0.02\ \Omega$ agrees to four digits.

        !!intuition Does this make sense?
          The wall reflects 99.98% of the power. That is why metal makes good microwave mirrors, waveguides and cavities, and why their small loss can still be computed: it is $4R_s/\eta_0$.

        **Speed path.** $4R_s/\eta_0 = 0.08/377$.

        **Where points go.** Reporting W/m² for a fraction.
      ` }),
    P({ src: 'Practice J #7(f) · 4 pts', title: 'Four times the frequency',
      q: md`**(f) (4 pts)** The source is retuned to **four times** the frequency, with the same incident amplitude $E_i = 60\pi$ V/m. Find the new time-averaged power absorbed per square meter.`,
      parts: [trap(N(md`$\langle P_{\text{abs}}\rangle$ at $4f$ (W/m²)`, 0.02, 'W/m²'), [[0.04, md`That assumes the heating grows in proportion to $f$. $R_s = \sqrt{\pi f\mu/\sigma}$ grows as $\sqrt f$: only twice.`], [0.01, md`$J_s = 2H_i$ is unchanged, but $R_s$ is not: the skin gets thinner.`], [0.005, md`That halves $R_s$. A thinner skin ($\delta$ halves) means **more** resistance, $1/(\sigma\delta)$.`]])],
      hints: [md`$\delta = 1/\sqrt{\pi f\mu\sigma}$: what does $4f$ do to it? $J_s = 2H_i$ does not depend on $f$.`],
      sol: md`
        !!trap The trap
          The heating depends on $f$ only through $R_s$, and $R_s \propto \sqrt f$.

        **1. What changes.** The incident wave has the same amplitude, so the wall still carries $|J_s| = 2H_i = 1$ A/m. Only the skin depth changes:
        $$\delta = \frac{1}{\sqrt{\pi f\mu\sigma}} \quad\Rightarrow\quad \delta' = \frac{\delta}{\sqrt4} = 0.5\ \mu\text{m}$$
        **2. New surface resistance.**
        $$R_s' = \frac{1}{\sigma\delta'} = 2R_s = 0.04\ \Omega$$
        **3. New heating.**
        $$\langle P_{\text{abs}}\rangle' = \tfrac12(0.04)(1)^2$$
        $$\boxed{\langle P_{\text{abs}}\rangle' = 0.02\ \text{W/m}^2}$$
        Four times the frequency, twice the heating.

        **Speed path.** Everything scales as $R_s \propto \sqrt f$: $\times2$.

        **Where points go.** Scaling with $f$. Keeping $\delta$ fixed.
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-j', order: 10, title: 'Practice exam J', kind: 'mock', sub: '75 min · 100 pts · circle-all-that-apply on Poynting, pressure, surface resistance and resonance; three line sections; a scope trace; a resonant line; a metal wall', steps: examJ });

  // ======================================================================================== EXAM K: figures
  const stepF = (x) => (x > 0 ? 1 : 0);
  // a small waveform plot for the candidate rows
  const wplot = (curves, o) => plot(Object.assign({ w: 240, h: 136, ml: 34, mr: 14, zero: true }, o, { curves: curves.map((c) => (typeof c === 'function' ? { f: c, n: 700 } : c)) }));
  // K1: the sheet, side view
  function figK1() {
    const g = PF.fig({ alt: 'side view: the z axis runs to the right, y up; a current sheet stands in the plane z = 0, drawn dashed, with its current along minus y; arrows show waves leaving toward +z and toward -z' });
    g.arrow(20, 128, 340, 128, { cls: 'dim', hs: 6 }); g.label(344, 128, 'z', 'l', 'small accent');
    g.label(180, 134, '0', 't', 'small accent');
    g.line(180, 26, 180, 150, { cls: 'thick dash' });
    g.arrow(194, 56, 194, 100, { cls: 'thick', hs: 8 }); g.label(202, 92, '\\mathbf J_s(t)', 'l', 'small');
    g.arrow(240, 44, 320, 44, { hs: 8 }); g.label(280, 38, z0Lab('> 0'), 'b', 'small');
    g.arrow(140, 44, 60, 44, { hs: 8 }); g.label(100, 38, z0Lab('< 0'), 'b', 'small');
    g.arrow(40, 108, 40, 70, { cls: 'dim', hs: 6 }); g.label(46, 72, '\\hat y', 'l', 'small accent');
    return g.svg();
  }
  function z0Lab(s) { return `z ${s}`; }
  const K1E = (t) => stepF(t - 1.5) * Math.sin(PI * (t - 1.5));
  const tAx = { x: [0, 5], y: [-1.35, 1.35], xl: 't', yl: 'E_y/120\\pi', xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[1, '1'], [-1, '-1']] };
  const figK1d = () => row4([
    wplot([(t) => -K1E(t)], tAx),
    wplot([K1E], tAx),
    wplot([(t) => Math.sin(PI * t)], tAx),
    wplot([(t) => stepF(t - 1.5) * Math.cos(PI * (t - 1.5))], tAx),
  ]);
  const zAx = { x: [0, 1200], y: [-1.35, 1.35], xl: 'z', yl: 'H_x\\ (\\text{A/m})', xt: [[300, '300'], [600, '600'], [900, '900']], yt: [[1, '1'], [-1, '-1']] };
  const K1H = (z) => (z < 900 ? -Math.sin(PI * z / 300) : 0);
  const figK1e = () => row4([
    wplot([(z) => -Math.sin(PI * z / 300)], zAx),
    wplot([(z) => -K1H(z)], zAx),
    wplot([(z) => (z < 450 ? -Math.sin(PI * z / 300) : 0)], zAx),
    wplot([K1H], zAx),
  ]);
  const figK1sol = () => PF.row([
    { svg: wplot([K1E], Object.assign({}, tAx, { w: 320, h: 170, xl: 't\\,(\\mu\\text{s})', xt: [[1, '1'], [1.5, '1.5'], [2, '2'], [3, '3'], [4, '4']] })), cap: '$E_y(450\\,\\text{m}, t)$: nothing until 1.5 µs, then a sine that starts upward.' },
    { svg: wplot([K1H], Object.assign({}, zAx, { w: 320, h: 170, xl: 'z\\,(\\text{m})', xt: [[150, '150'], [450, '450'], [750, '750'], [900, '900']] })), cap: '$H_x(z, 3\\,\\mu\\text{s})$: the front is at 900 m; behind it, $-\\sin(\\pi z/300)$.' },
  ]).svg;

  // K2: the tip of E in the yz-plane, seen from +x (y to the right, z up, x out of the page)
  function figK2() {
    const g = PF.fig({ alt: 'the yz-plane seen from +x: y to the right, z up; E at t = 0 points up along z; a quarter period later it points right along y; the curved arrow turns clockwise on the page; the wave travels into the page, toward -x' });
    const cx = 130, cy = 120, Rr = 62;
    g.arrow(cx - 92, cy, cx + 100, cy, { cls: 'dim', hs: 7 }); g.label(cx + 104, cy, 'y', 'l', 'small accent');
    g.arrow(cx, cy + 92, cx, cy - 100, { cls: 'dim', hs: 7 }); g.label(cx + 6, cy - 102, 'z', 'bl', 'small accent');
    g.circle(cx, cy, Rr, { cls: 'dash dim' });
    g.otimes(cx, cy, 7);
    g.arrow(cx, cy - 11, cx, cy - Rr, { cls: 'thick', hs: 9 }); g.label(cx - 8, cy - Rr - 4, '\\mathbf E(0)', 'br', 'small');
    g.arrow(cx + 11, cy, cx + Rr, cy, { cls: 'thick dash', hs: 9 }); g.label(cx + Rr + 6, cy + 8, '\\mathbf E(T/4)', 'tl', 'small');
    g.arc(cx, cy, 36, 14, 76, { cls: 'thick', arrow: 'start', hs: 7 });
    g.label(cx - 14, cy + 22, '-\\hat x', 'r', 'small');
    return g.svg();
  }

  // K3: power in the good conductor (medium B), wave going down toward -z
  const figK3 = () => plot({
    w: 360, h: 190, x: [-8.5, 0.6], y: [0, 1.18], xl: 'z\\,(\\text{m})', yl: '\\langle S\\rangle\\ (\\text{W/m}^2)',
    xt: [[-20 / PI, '-2\\delta'], [-10 / PI, '-\\delta'], [0, '0']], yt: [[1, '1']],
    curves: [{ f: (z) => (z <= 0 ? Math.exp(2 * z * PI / 10) : NaN), n: 300 }],
    pts: [{ x: -10 / PI, y: Math.exp(-2), lab: 'e^{-2}', anchor: 'bl' }, { x: -20 / PI, y: Math.exp(-4), lab: 'e^{-4}', anchor: 'bl' }],
  });

  // K4: the interface
  function figK4() {
    const g = PF.fig({ alt: 'side view: free space for z < 0 on the left; a nonmagnetic perfect dielectric of unknown permittivity fills z > 0, shaded; incident and reflected waves on the left, the transmitted wave on the right' });
    g.rect(180, 30, 160, 110, { cls: 'shade' });
    g.line(180, 22, 180, 148, { cls: 'thick' });
    g.arrow(10, 160, 350, 160, { cls: 'dim', hs: 7 }); g.label(354, 160, 'z', 'l', 'small accent'); g.label(180, 166, '0', 't', 'small accent');
    g.arrow(40, 56, 160, 56, { cls: 'thick', hs: 8 }); g.label(100, 50, '\\text{incident}', 'b', 'small');
    g.arrow(160, 100, 40, 100, { cls: 'thick', hs: 8 }); g.label(100, 94, '\\text{reflected}', 'b', 'small');
    g.arrow(200, 70, 320, 70, { cls: 'thick', hs: 8 }); g.label(260, 64, '\\mathbf E_t\\ \\text{given}', 'b', 'small');
    g.label(100, 126, '\\text{free space}', 'c', 'small');
    g.label(262, 116, '\\epsilon_2\\ ?,\\ \\mu_0', 'c', 'small');
    return g.svg();
  }
  const K4b = 2 * PI / 3;
  const K4env = (G, b) => (z) => Math.hypot(12 * Math.cos(b * z) + 12 * G * Math.cos(b * z), -12 * Math.sin(b * z) + 12 * G * Math.sin(b * z));
  const eAx = { x: [-3, 0], y: [0, 21], xl: 'z', yl: '|\\tilde E_1|', xt: [[-2.25, '-2.25'], [-1.5, '-1.5'], [-0.75, '-0.75']], yt: [[6, '6'], [12, '12'], [18, '18']] };
  const figK4d = () => row4([
    wplot([K4env(-0.5, K4b)], eAx),
    wplot([K4env(0.5, K4b)], eAx),
    wplot([K4env(-0.5, K4b / 2)], eAx),
    wplot([() => 12], eAx),
  ]);

  // K5: the line, its candidate snapshots and the solution
  const sK5 = TL.solve({ Vg: 21, Rg: 25, RL: 150, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 8 });
  const figK5 = () => circuit([
    { t: 'gen', R: 'R_g = 25\\,\\Omega', V: '21u(t)\\,\\text{V}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 220, lab: 'Z_0 = 50\\,\\Omega', sub: 'v = 1.5\\times10^8\\,\\text{m/s}' },
    { t: 'R', lab: 'R_L = 150\\,\\Omega', last: true },
  ], { ticks: [[2, '0'], [2, '150', 0.5], [3, '300\\,\\text{m}']], alt: 'a step source 21u(t) volts with Rg = 25 ohms drives a 50-ohm line 300 m long at 1.5e8 m/s, ending in RL = 150 ohms' });
  const vAx = { x: [0, 300], y: [0, 32], zero: false, xl: 'z', yl: 'V\\ (\\text{V})', xt: [[75, '75'], [150, '150'], [225, '225']], yt: [[14, '14'], [21, '21'], [28, '28']] };
  const pw = (a, b) => [{ pts: [[0, a], [150, a], [150, b], [300, b]] }];
  const figK5b = () => row4([
    wplot([{ pts: [[0, 14], [150, 14], [150, 0], [300, 0]] }], vAx),
    wplot(pw(21, 14), vAx),
    wplot(pw(14, 21), vAx),
    wplot(pw(14, 28), vAx),
  ]);

  // ======================================================================================== EXAM K
  const examK = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Prof. Kudeki's summer Exam 3s (2017 to 2020) test intuition more than algebra. They ask you to **sketch**: a field against time at one point, the same field against position at one instant, the standing wave in front of an interface. Here every sketch question is a choice among four candidate plots, followed by values you read off the right one. Do the sketch on paper first, then pick. Each problem is in his style with new numbers; the papers themselves are typed up in [Past exams](#/l/e3-past-su17).

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | A current sheet switched on at $t = 0$: $\mathbf E$ and $\mathbf H$, the waveform at a point, the snapshot along $z$ | 20 |
      | 2 | A circular wave read off two instants: $\beta$, the phasor, the hand, $\langle\mathbf S\rangle$, $\mathbf H$ | 20 |
      | 3 | Two lossy media judged from $\lambda$ and $\delta$: $\epsilon_r$, $\sigma$, power decay | 20 |
      | 4 | An interface with the transmitted field given: $\epsilon_2$, $\Gamma$, the standing wave, power | 20 |
      | 5 | A step on a line: the snapshot $V(z)$ at two instants, current, steady state | 20 |

      **Draws on:** [current-sheet antennas](#/l/w3-antenna), [polarization](#/l/w3-pol), [imperfect dielectrics and good conductors](#/l/w2-limits), [power in lossy media](#/l/w2-loss), [reflection](#/l/w4-gamma), [standing waves](#/l/w4-standing), [launching waves](#/l/w5-launch) and [bounce diagrams](#/l/w5-bounce).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- K Problem 1
    RF(md`
      ### Problem 1 (20 points): a sheet switched on at t = 0

      A current sheet in the plane $z = 0$ in free space carries
      $$\mathbf J_s(t) = -\hat y\,2u(t)\sin(\omega t)\ \text{A/m}$$
      with $f = 0.5$ MHz, so $\omega = \pi\times10^6$ rad/s $= \pi$ rad/µs. $u(t)$ is the unit step: the sheet is off before $t = 0$. The sheet radiates a truncated sine wave toward both $+z$ and $-z$. The field of a sheet is (formula sheet, in vector form)
      $$\mathbf E(z,t) = -\frac{\eta_0}{2}\,\mathbf J_s\!\left(t - \frac{|z|}{c}\right)$$
      on both sides.

      [[fig:sheet]]
    `, { sheet: { svg: figK1(), cap: 'Side view. The sheet current runs along −y at the instant drawn.' } }),
    P({ src: 'Practice K #1(a) · 3 pts', title: 'E on the right',
      q: md`**(a) (3 pts)** Which is $\mathbf E(z,t)$ for $z > 0$, in V/m?`,
      parts: [mc('', [
        md`$\hat y\,120\pi\,u(t - z/c)\sin\bigl(\omega(t - z/c)\bigr)$`,
        md`$-\hat y\,120\pi\,u(t - z/c)\sin\bigl(\omega(t - z/c)\bigr)$`,
        md`$\hat y\,60\pi\,u(t - z/c)\sin\bigl(\omega(t - z/c)\bigr)$`,
        md`$\hat y\,120\pi\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)$`], 0,
      [null, md`That drops the minus sign in $-\frac{\eta_0}{2}\mathbf J_s$. With $\mathbf J_s$ along $-\hat y$, the two minus signs make $\mathbf E$ point along $+\hat y$.`,
        md`That uses $\frac{\eta_0}{2}$ times 1 A/m. The sheet carries 2 A/m: $\frac{\eta_0}{2}(2) = \eta_0 = 120\pi$.`,
        md`$t + z/c$ describes a wave moving toward $-z$. On the right the delay is $|z|/c = z/c$: $t - z/c$.`])],
      hints: [md`Put $\mathbf J_s(t - |z|/c)$ into $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$. Two minus signs; and $\frac{\eta_0}{2}\times2 = \eta_0$.`],
      sol: md`
        **1. Why a sheet makes this field.** Tangential $\mathbf E$ is continuous through the sheet, and the jump in tangential $\mathbf H$ equals the sheet current. A wave leaving on each side has $|\mathbf H| = |\mathbf E|/\eta_0$, and the two $\mathbf H$'s point opposite ways, so the jump is $2|\mathbf E|/\eta_0$. Setting it equal to $J_s$ gives $|\mathbf E| = \frac{\eta_0}{2}J_s$, pointing against the current: $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$ at the sheet. Then each wave carries that field away at $c$, so a point at distance $|z|$ sees it $|z|/c$ later.

        **2. Substitute.** On the right, $|z| = z$:
        $$\mathbf E = -\frac{\eta_0}{2}\left(-\hat y\,2\right)u\!\left(t - \frac zc\right)\sin\omega\!\left(t - \frac zc\right)$$
        The minus signs cancel and $\frac{\eta_0}{2}\cdot2 = \eta_0 = 120\pi$. So $\mathbf E = \hat y\,E_y$ with, writing $t' = t - z/c$ for the delayed time,
        $$\boxed{E_y = 120\pi\,u(t')\sin\omega t'\ \ \text{V/m}}$$
        In µs and m, $\omega t' = \pi(t - z/300)$.

        !!intuition Does this make sense?
          The field at the sheet points against the current: the source pushes charge against $\mathbf E$ and does work, so $\mathbf J_s\cdot\mathbf E < 0$ (a source). Here $\mathbf J_s\cdot\mathbf E = (-2\sin\omega t)(120\pi\sin\omega t) < 0$ ✓.

        **Speed path.** $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(\text{delayed})$: flip the direction, multiply by 60π per A/m.

        **Where points go.** The sign, and $60\pi$ vs $120\pi$.
      ` }),
    P({ src: 'Practice K #1(b) · 4 pts', title: 'H on the left',
      q: md`**(b) (4 pts)** Which is $\mathbf H(z,t)$ for $z < 0$, in A/m?`,
      parts: [mc('', [
        md`$\hat x\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)$`,
        md`$-\hat x\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)$`,
        md`$\hat x\,u(t - z/c)\sin\bigl(\omega(t - z/c)\bigr)$`,
        md`$-\hat y\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)$`], 0,
      [null, md`That is the field on the **right**. $\mathbf E$ is the same on both sides, but the travel reverses, so $\mathbf H = \frac{1}{\eta_0}\hat v\times\mathbf E$ flips.`,
        md`For $z < 0$ the delay is $|z|/c = -z/c$, so the argument is $t + z/c$. With $t - z/c = t + |z|/c$, points on the left would see the field **before** the sheet switched on.`,
        md`$\mathbf H$ is perpendicular to $\mathbf E$ (along $\hat y$) and to the travel. It cannot be along $\hat y$.`])],
      hints: [md`$\mathbf E$ on the left is $\hat y\,120\pi\,u(t + z/c)\sin(\dots)$. The wave travels toward $-\hat z$, and $\mathbf H = \frac{1}{\eta_0}\hat v\times\mathbf E$.`],
      sol: md`
        **1. E on the left.** Now $|z| = -z$, so $t - |z|/c = t + z/c$:
        $$\mathbf E = \hat y\,120\pi\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)$$
        **2. H from E.** For a plane wave, $\mathbf H = \frac{1}{\eta_0}\hat v\times\mathbf E$, with $\hat v = -\hat z$ here. And $\hat z\times\hat y = -\hat x$, so $(-\hat z)\times\hat y = +\hat x$:
        $$\mathbf H = \frac{120\pi}{120\pi}\,\hat x\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)$$
        $$\boxed{\mathbf H = \hat x\,u(t + z/c)\sin\bigl(\omega(t + z/c)\bigr)\ \text{A/m}}$$
        **3. Check with the sheet's jump.** On the right $\mathbf H = -\hat x\,u\sin(\dots)$ (the same steps with $\hat v = +\hat z$). At $z = 0$: $\hat z\times(\mathbf H_+ - \mathbf H_-) = \hat z\times(-2\hat x\sin\omega t) = -2\hat y\sin\omega t = \mathbf J_s$ ✓.

        **Speed path.** $|\mathbf H| = J_s/2 = 1$ A/m on both sides; direction by $\hat v\times\mathbf E$, opposite on the two sides.

        **Where points go.** Copying the right side's $\mathbf H$. Using $t - z/c$ on the left.
      ` }),
    P({ src: 'Practice K #1(c) · 3 pts', title: 'Period and wavelength',
      q: md`**(c) (3 pts)** Find the period $T$ and the wavelength $\lambda$ of the sine.`,
      parts: [N(md`$T$ (µs)`, 2, 'µs'), trap(N(md`$\lambda$ (m)`, 600, 'm'), [[300, md`That is $c\times1\ \mu$s. The period is 2 µs: $\lambda = cT = 300\times2$.`]])],
      hints: [md`$T = 1/f$; $\lambda = c/f = cT$, with $c = 300$ m/µs.`],
      sol: md`
        $$T = \frac1f = \frac{1}{0.5\times10^6} = \boxed{2\ \mu\text{s}}$$
        In one period the wave moves one wavelength:
        $$\lambda = cT = (300\ \text{m}/\mu\text{s})(2\ \mu\text{s}) = \boxed{600\ \text{m}}$$
        **Speed path.** At 1 MHz, $\lambda = 300$ m; at half the frequency, twice that.

        **Where points go.** Using $\omega$ for $f$.
      ` }),
    P({ src: 'Practice K #1(d) · 5 pts', title: 'The waveform at z = 450 m',
      q: md`**(d) (5 pts)** Sketch $E_y(450\ \text{m}, t)$ for $0 < t < 5$ µs, then pick the matching plot (vertical axis $E_y/120\pi$, time in µs). Read off $E_y$ at $t = 2$ µs.

[[fig:c]]`,
      figs: { c: { svg: figK1d(), cap: 'Candidates for $E_y(450\\,\\text{m}, t)$. Time in µs.' }, s: { svg: figK1sol(), cap: '' } },
      parts: [mc('The waveform is', PLOTS, 1,
        [md`That starts downward. Just after the front arrives, $\sin\pi(t - 1.5)$ is small and **positive**.`, null,
          md`That has no delay: the field cannot reach 450 m before $450/300 = 1.5$ µs.`, md`That jumps to its peak when the front arrives. The source turned on as a **sine**, starting from zero, so the front starts from zero too.`], true),
        trap(N(md`$E_y(450\ \text{m}, 2\ \mu\text{s})$ (V/m)`, 120 * PI, 'V/m'), [[0, md`At 2 µs the front passed 450 m half a microsecond ago: $\sin(\pi\cdot0.5) = 1$.`], [60 * PI, md`The amplitude is $\eta_0 = 120\pi$ V/m (2 A/m times $\eta_0/2$).`]])],
      hints: [md`The front reaches 450 m at $t = 450/300 = 1.5$ µs. After that, $E_y = 120\pi\sin\pi(t - 1.5)$.`],
      sol: md`
        **1. When it arrives.** The front left the sheet at $t = 0$ and travels at 300 m/µs:
        $$t_{\text{arrive}} = \frac{450}{300} = 1.5\ \mu\text{s}$$
        Before that, $u(t - 1.5) = 0$ and the field is zero.

        **2. After it arrives.**
        $$E_y(450, t) = 120\pi\sin\bigl(\pi(t - 1.5)\bigr)\ \text{V/m}, \quad t > 1.5$$
        It starts at zero and rises: the point replays what the sheet did, 1.5 µs late. That is **Plot B**.

        **3. Read off.** At $t = 2$ µs, $\pi(2 - 1.5) = \pi/2$:
        $$E_y = 120\pi\sin\frac\pi2 = \boxed{120\pi \approx 377\ \text{V/m}}$$
        Then zero at 2.5 µs, $-120\pi$ at 3 µs, and so on, with period 2 µs.

        [[fig:s]]

        **Speed path.** Arrival $= z/c$; after it, the source's waveform shifted right by the arrival time.

        **Where points go.** Starting the curve at $t = 0$. Starting it at a peak. Flipping its sign.
      ` }),
    P({ src: 'Practice K #1(e) · 5 pts', title: 'The snapshot at t = 3 µs',
      q: md`**(e) (5 pts)** Sketch $H_x(z, 3\ \mu\text{s})$ for $0 < z < 1200$ m and pick the matching plot. Read off $H_x$ at $z = 450$ m.

[[fig:c]]`,
      figs: { c: { svg: figK1e(), cap: 'Candidates for $H_x(z, 3\\,\\mu\\text{s})$. Position in m.' } },
      parts: [mc('The snapshot is', PLOTS, 3,
        [md`That has no front. At 3 µs the front has gone only $300\times3 = 900$ m; beyond it the field is still zero.`, md`That is the left side's sign. On the right, $\mathbf H = -\hat x\,u\sin(\dots)$.`,
          md`That puts the front at 450 m, as if the wave had travelled for 1.5 µs. It has travelled for 3 µs.`, null], true),
        trap(N(md`$H_x(450\ \text{m}, 3\ \mu\text{s})$ (A/m)`, 1, 'A/m'), [[-1, md`$H_x = -\sin\pi(3 - 1.5) = -\sin(1.5\pi) = -(-1) = +1$. Check $\sin(3\pi/2) = -1$.`]])],
      hints: [md`On the right, $H_x = -u(t - z/300)\sin\pi(t - z/300)$. At $t = 3$ µs the front is at $z = 900$ m.`, md`Simplify: $\sin(3\pi - \theta) = \sin\theta$.`],
      sol: md`
        **1. The field on the right.** From (b)'s check, $\mathbf H = -\hat x\,u(t - z/c)\sin\omega(t - z/c)$ for $z > 0$. At $t = 3$ µs, in meters:
        $$H_x(z, 3) = -u\!\left(3 - \frac{z}{300}\right)\sin\pi\!\left(3 - \frac{z}{300}\right)$$
        **2. Where the front is.** $u = 0$ once $z/300 > 3$, that is beyond $z = 900$ m. The front is at 900 m.

        **3. Behind the front.** Use $\sin(3\pi - \theta) = \sin\theta$:
        $$H_x(z, 3) = -\sin\frac{\pi z}{300}, \quad 0 < z < 900\ \text{m}$$
        One and a half wavelengths (600 m each) fit behind the front. That is **Plot D**.

        **4. Read off.** At 450 m, $\pi z/300 = 1.5\pi$ and $\sin1.5\pi = -1$:
        $$\boxed{H_x(450\ \text{m}, 3\ \mu\text{s}) = +1\ \text{A/m}}$$

        !!intuition Does this make sense?
          In a snapshot the **oldest** part of the wave is farthest out: the front at 900 m is what the sheet did at $t = 0$, and the field at $z = 0$ is what it is doing now. A time plot reads left to right as "early to late"; a snapshot reads right to left.

        **Speed path.** Front at $ct$. Behind it, the source's history laid out backwards in $z$.

        **Where points go.** Drawing the field everywhere (no front). The sign of $H$ on the right.
      ` }),

    // ---------------------------------------------------------------- K Problem 2
    R(md`
      ### Problem 2 (20 points): a circular wave read off two instants

      A circularly polarized plane wave travels in free space toward $-\hat x$ at $f = 150$ MHz. At the origin, the instantaneous field is $\mathbf E = 3\hat z$ V/m at $t = 0$ and $\mathbf E = 3\hat y$ V/m a quarter period later, at $t = T/4$. Its phasor is written
      $$\tilde{\mathbf E} = (A\,\hat y + B\,\hat z)\,e^{jbx}\ \text{V/m}$$
    `),
    P({ src: 'Practice K #2(a) · 4 pts', title: 'The exponent',
      q: md`**(a) (4 pts)** Find $b$ (with its sign).`,
      parts: [trap(N(md`$b$ (rad/m)`, PI, 'rad/m'), [[-PI, md`$e^{-j\beta x}$ goes with $\cos(\omega t - \beta x)$, a wave toward $+x$. This one goes toward $-x$: $e^{+j\beta x}$.`], [2 * PI, md`That uses $\lambda = 1$ m. At 150 MHz, $\lambda = 300/150 = 2$ m.`]])],
      hints: [md`$\lambda = c/f$ and $\beta = 2\pi/\lambda$. A wave toward $-x$ is $\cos(\omega t + \beta x)$, phasor $e^{+j\beta x}$.`],
      sol: md`
        **1. β.**
        $$\lambda = \frac cf = \frac{3\times10^8}{1.5\times10^8} = 2\ \text{m}, \qquad \beta = \frac{2\pi}{\lambda} = \pi\ \text{rad/m}$$
        **2. The sign.** A wave toward $-x$ has phase $\omega t + \beta x$: as $t$ grows, a fixed phase moves to smaller $x$. Its phasor is $e^{+j\beta x}$:
        $$\boxed{b = +\pi\ \text{rad/m}}$$
        **Speed path.** 300 MHz is 1 m; 150 MHz is 2 m. Toward $-x$: plus sign.

        **Where points go.** The sign of $b$.
      ` }),
    P({ src: 'Practice K #2(b) · 5 pts', title: 'A and B',
      q: md`**(b) (5 pts)** Which pair $(A, B)$ in V/m is right?`,
      parts: [mc('', [md`$A = -j3,\ B = 3$`, md`$A = j3,\ B = 3$`, md`$A = 3,\ B = 3$`, md`$A = 3,\ B = -j3$`], 0,
        [null, md`$+j$ means $E_y$ **leads** $E_z$ by $90°$: $E_y$ would peak a quarter period **before** $E_z$, at $t = -T/4$. Here it peaks a quarter period after.`,
          md`Equal and in phase is a **linear** wave at $45°$; it would be $3\hat y + 3\hat z$ at $t = 0$, not $3\hat z$.`,
          md`That has $E_y = 3$ at $t = 0$. The field at $t = 0$ is $3\hat z$, so the $\hat z$ phasor is real and the $\hat y$ phasor carries the delay.`])],
      hints: [md`At $x = 0$: $E_z(t) = 3\cos\omega t$ (it is 3 at $t = 0$). $E_y$ is 0 at $t = 0$ and 3 at $\omega t = 90°$: $E_y = 3\cos(\omega t - 90°)$.`],
      sol: md`
        **1. Each component in time, at x = 0.** $E_z$ is 3 at $t = 0$ and 0 a quarter period later:
        $$E_z = 3\cos\omega t$$
        $E_y$ is 0 at $t = 0$ and 3 at $\omega t = 90°$:
        $$E_y = 3\cos(\omega t - 90°)$$
        **2. Phasors.** $\cos\omega t \leftrightarrow 1$, and a $90°$ delay is $e^{-j90°} = -j$:
        $$B = 3, \qquad A = -j3$$
        $$\boxed{\tilde{\mathbf E} = (-j3\,\hat y + 3\,\hat z)\,e^{j\pi x}\ \text{V/m}}$$
        **3. Check.** $\text{Re}\{(-j3\hat y + 3\hat z)e^{j\omega t}\}$ at $\omega t = 0$ is $3\hat z$ ✓; at $\omega t = 90°$, $e^{j90°} = j$ and $(-j3)(j) = 3$: $3\hat y$ ✓.

        **Speed path.** The component that is full at $t = 0$ is real; the one that fills a quarter period later gets $-j$.

        **Where points go.** $+j$ instead of $-j$ (sin is $-j$).
      ` }),
    P({ src: 'Practice K #2(c) · 4 pts', title: 'Which hand?',
      q: md`**(c) (4 pts)** Is the wave right- or left-circularly polarized?`,
      parts: [mc('', ['right-handed', 'left-handed', 'neither: a wave toward −x has no hand', 'it depends on where along x you look'], 0,
        [null, md`$\mathbf E$ turns from $\hat z$ to $\hat y$, and $\hat z\times\hat y = -\hat x$: the turning axis points **along** the travel. That is the right hand.`, md`Every rotating field has a hand, whichever way it travels; you judge it against its own direction of travel.`, md`The hand is the same at every plane; only the starting angle shifts with $x$.`])],
      hints: [md`Point your thumb along the travel, $-\hat x$. Do your right hand's fingers curl from $\mathbf E(0) = 3\hat z$ toward $\mathbf E(T/4) = 3\hat y$?`],
      sol: md`
        **1. The turning axis.** $\mathbf E$ goes from $\hat z$ (at $t = 0$) to $\hat y$ (at $T/4$). The axis of that rotation is
        $$\hat z\times\hat y = -\hat x$$
        **2. Compare with the travel.** The wave travels toward $-\hat x$, the same direction. Thumb along the travel, fingers along the rotation: the **right** hand.
        $$\boxed{\text{right-handed circular}}$$

        [[fig:tip]]

        **Speed path.** $\mathbf E(0)\times\mathbf E(T/4)$ along the travel: right; against: left.

        **Where points go.** Using $+\hat x$ as the reference out of habit. The reference is always the direction of travel.
      `,
      figs: { tip: { svg: figK2(), cap: 'Seen from +x (x out of the page): E turns from z to y, clockwise on the page. The wave goes into the page, toward −x: right hand.' } } }),
    P({ src: 'Practice K #2(d) · 4 pts', title: 'Average power',
      q: md`**(d) (4 pts)** Find the time-averaged Poynting vector's size and direction.`,
      parts: [trap(N(md`$|\langle\mathbf S\rangle|$ (W/m²)`, 3 / (40 * PI), 'W/m²'), [[3 / (80 * PI), md`That is one component alone, $3^2/2\eta_0$. A circular wave carries the power of **both** components: twice that.`], [9 / (120 * PI) * 2, md`That leaves out the $\tfrac12$ of the time average.`]]),
        mc('It points along', [md`$-\hat x$`, md`$+\hat x$`, md`$\hat y$`, md`it rotates with $\mathbf E$`], 0,
          [null, md`Power flows the way the wave travels: $-\hat x$.`, md`$\langle\mathbf S\rangle$ is perpendicular to both $\mathbf E$ and $\mathbf H$, which lie in the $yz$-plane.`, md`For a circular wave $|\mathbf E|$ and $|\mathbf H|$ are constant and $\mathbf S$ points steadily along the travel.`])],
      hints: [md`$\langle S\rangle = \frac{|\tilde E_y|^2 + |\tilde E_z|^2}{2\eta_0}$: the two perpendicular components carry power independently.`],
      sol: md`
        **1. Power adds over perpendicular components.** Each component is a linear wave carrying $|\tilde E|^2/2\eta_0$:
        $$\langle S\rangle = \frac{|{-j3}|^2 + |3|^2}{2\eta_0} = \frac{9 + 9}{240\pi}$$
        $$\boxed{|\langle\mathbf S\rangle| = \frac{3}{40\pi} \approx 0.0239\ \text{W/m}^2,\ \text{along } -\hat x}$$
        **2. Check with phasors.** $\tilde{\mathbf H} = \frac{1}{\eta_0}(-\hat x)\times\tilde{\mathbf E} = \frac{1}{40\pi}(\hat y + j\hat z)e^{j\pi x}$, and $\tfrac12\text{Re}\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$ gives the same, along $-\hat x$.

        !!intuition Does this make sense?
          In a circular wave $|\mathbf E| = 3$ V/m at every instant, so the power is steady, $E^2/\eta_0 = 9/120\pi$, with no $\tfrac12$: the same $3/40\pi$.

        **Speed path.** "Circular is twice the linear value": $2\times\frac{9}{240\pi}$.

        **Where points go.** Counting one component. The direction.
      ` }),
    P({ src: 'Practice K #2(e) · 3 pts', title: 'H at the origin',
      q: md`**(e) (3 pts)** At the origin at $t = 0$, which way does $\mathbf H$ point?`,
      parts: [mc('', [md`$+\hat y$, size $\frac{1}{40\pi}$ A/m`, md`$-\hat y$, size $\frac{1}{40\pi}$ A/m`, md`$+\hat z$, size $\frac{1}{40\pi}$ A/m`, md`$+\hat y$, size $\frac{3}{40\pi}$ A/m`], 0,
        [null, md`That is $\hat x\times\mathbf E$, for travel toward $+x$. Here $\hat v = -\hat x$: $(-\hat x)\times\hat z = +\hat y$.`, md`$\mathbf H$ is perpendicular to $\mathbf E = 3\hat z$.`, md`$|\mathbf H| = |\mathbf E|/\eta_0 = 3/120\pi = 1/40\pi$.`])],
      hints: [md`$\mathbf H = \frac{1}{\eta_0}\hat v\times\mathbf E$ with $\hat v = -\hat x$ and $\mathbf E(0,0) = 3\hat z$.`],
      sol: md`
        $$\mathbf H = \frac{1}{\eta_0}(-\hat x)\times3\hat z$$
        $\hat x\times\hat z = -\hat y$, so $(-\hat x)\times\hat z = +\hat y$:
        $$\boxed{\mathbf H(0,0) = \frac{3}{120\pi}\hat y = \frac{1}{40\pi}\hat y \approx 7.96\ \text{mA/m}\ \hat y}$$
        **Check.** $\mathbf E\times\mathbf H = \hat z\times\hat y = -\hat x$: along the travel ✓.

        **Speed path.** $\hat e\times\hat h = \hat v$: $\hat z\times\hat h = -\hat x$ needs $\hat h = \hat y$.

        **Where points go.** Using $+\hat x$ for the travel.
      ` }),

    // ---------------------------------------------------------------- K Problem 3
    R(md`
      ### Problem 3 (20 points): two lossy media, judged from λ and δ

      Both media are nonmagnetic ($\mu = \mu_0$). Recall that the penetration (skin) depth is $\delta = 1/\alpha$, the distance over which the field falls by $1/e$.

      - **Medium A** at $f = 50$ MHz: the wavelength is $\lambda = 3$ m and the penetration depth is $\delta = 300$ m.
      - **Medium B** at $f = 6.25$ kHz: the wavelength is $\lambda = 20$ m and the penetration depth is $\delta = 10/\pi \approx 3.18$ m.
    `),
    P({ src: 'Practice K #3(a)–(c) · 11 pts', title: 'Medium A',
      q: md`**(a) (3 pts)** Does medium A behave as an imperfect dielectric or as a good conductor? **(b) (4 pts)** Find its $\epsilon_r$. **(c) (4 pts)** Find its conductivity $\sigma$.`,
      parts: [mc('(a) Medium A is', ['an imperfect dielectric', 'a good conductor', 'a perfect dielectric', 'impossible to classify from λ and δ alone'], 0,
        [null, md`A good conductor has $\alpha = \beta$, so $\delta = \lambda/2\pi$: it dies within a wavelength. Here $\delta = 100\lambda$.`, md`A perfect dielectric has $\alpha = 0$, $\delta = \infty$. 300 m is finite.`, md`$\beta/\alpha = 2\pi\delta/\lambda$ is exactly what decides the regime.`]),
        trap(N(md`(b) $\epsilon_r$`, 4, ''), [[2, md`That is $c/v_p$. $v_p = c/\sqrt{\epsilon_r}$, so $\epsilon_r = (c/v_p)^2$.`]]),
        trap(N(md`(c) $\sigma$ (S/m)`, 1 / (9000 * PI), 'S/m'), [[1 / (18000 * PI), md`That is $\alpha/\eta$, or $2\alpha/\eta_0$: a factor 2 is lost either way. In this dielectric $\eta = \eta_0/\sqrt{\epsilon_r} = 60\pi$, and $\alpha = \frac{\sigma}{2}\eta$ gives $\sigma = 2\alpha/\eta$.`], [1 / (4500 * PI), md`That is $4\alpha/\eta$: the factor 2 went into the numerator twice. $\sigma = 2\alpha/\eta = 2/(300\cdot60\pi)$.`]])],
      hints: [md`$\beta = 2\pi/\lambda$ and $\alpha = 1/\delta$. Compare them.`, md`For $\sigma \ll \omega\epsilon$: $\beta \approx \omega\sqrt{\mu\epsilon}$ and $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$ (formula sheet, page 3).`],
      sol: md`
        **(a) Compare α and β.**
        $$\alpha = \frac1\delta = \frac{1}{300}\ \text{Np/m}, \qquad \beta = \frac{2\pi}{\lambda} = \frac{2\pi}{3}\ \text{rad/m}$$
        $\beta/\alpha = 200\pi \approx 630$: the wave runs about a hundred wavelengths before it fades by $1/e$. Loss is a small correction, so this is an **imperfect dielectric** ($\sigma \ll \omega\epsilon$).

        **(b) εr.** For an imperfect dielectric $\beta \approx \omega\sqrt{\mu\epsilon}$, so the speed is the lossless one:
        $$v_p = \lambda f = (3)(5\times10^7) = 1.5\times10^8\ \text{m/s}$$
        $$\epsilon_r = \left(\frac{c}{v_p}\right)^2 = 2^2 = \boxed{4}$$

        **(c) σ.** The sheet's imperfect-dielectric line, with $\sqrt{\mu/\epsilon} = \eta_0/2 = 60\pi\ \Omega$:
        $$\alpha \approx \frac\sigma2\sqrt{\frac\mu\epsilon} = \frac\sigma2(60\pi) = 30\pi\,\sigma$$
        Set it equal to $1/300$:
        $$\sigma = \frac{1}{300\cdot30\pi} = \boxed{\frac{1}{9000\pi} \approx 3.54\times10^{-5}\ \text{S/m}}$$

        !!intuition Does this make sense?
          Check the assumption: $\omega\epsilon = (2\pi\times5\times10^7)(4)\frac{10^{-9}}{36\pi} = \frac{1}{90}$ S/m, so $\sigma/\omega\epsilon = \frac{90}{9000\pi} = \frac{1}{100\pi} \approx 0.003 \ll 1$ ✓.

        **Speed path.** $\delta \gg \lambda$: dielectric. $\epsilon_r = (c/\lambda f)^2$. $\sigma = 2\alpha/\eta$.

        **Where points go.** $\epsilon_r = c/v$ without the square. Dropping the 2 in $\alpha = \sigma\eta/2$.
      ` }),
    P({ src: 'Practice K #3(d)–(e) · 6 pts', title: 'Medium B',
      q: md`**(d) (3 pts)** Does medium B behave as an imperfect dielectric or as a good conductor? **(e) (3 pts)** Find its conductivity $\sigma$.`,
      parts: [mc('(d) Medium B is', ['a good conductor', 'an imperfect dielectric', 'a perfect conductor', 'a perfect dielectric'], 0,
        [null, md`An imperfect dielectric has $\delta \gg \lambda$. Here $\lambda = 2\pi\delta$: the field dies within one wavelength.`, md`A perfect conductor has $\delta = 0$: no field inside at all.`, md`A perfect dielectric does not attenuate at all.`]),
        trap(N(md`(e) $\sigma$ (S/m)`, 4, 'S/m'), [[2, md`That uses $\delta = 1/\sqrt{2\pi f\mu\sigma}$. The sheet's good-conductor $\alpha = \sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$.`], [4 / PI, md`Square $\delta$ fully: $\delta^2 = 100/\pi^2$.`]])],
      hints: [md`$2\pi\delta = 20$ m $= \lambda$. What does $\lambda = 2\pi\delta$ say about $\alpha$ and $\beta$?`, md`$\delta = 1/\sqrt{\pi f\mu\sigma}$, so $\sigma = 1/(\pi f\mu\delta^2)$.`],
      sol: md`
        **(d) Compare.** $\beta = 2\pi/\lambda = 2\pi/20 = \pi/10$ rad/m and $\alpha = 1/\delta = \pi/10$ Np/m. They are **equal**, the signature of a good conductor ($\sigma \gg \omega\epsilon$, $\alpha \approx \beta$, $\lambda = 2\pi\delta$).

        **(e) σ.** For a good conductor $\delta = 1/\sqrt{\pi f\mu\sigma}$. Square and solve:
        $$\sigma = \frac{1}{\pi f\mu_0\delta^2}$$
        The pieces: $\delta^2 = 100/\pi^2$ and $\pi f\mu_0 = \pi(6250)(4\pi\times10^{-7}) = 2.5\times10^{-3}\,\pi^2$:
        $$\sigma = \frac{1}{(2.5\times10^{-3}\,\pi^2)(100/\pi^2)} = \frac{1}{0.25}$$
        $$\boxed{\sigma = 4\ \text{S/m}}$$
        That is seawater.

        !!intuition Does this make sense?
          With seawater's $\epsilon_r \approx 81$, $\omega\epsilon \approx 2.8\times10^{-5}$ S/m at 6.25 kHz, so $\sigma/\omega\epsilon \approx 1.4\times10^5 \gg 1$ ✓. The wave also crawls: $v_p = \lambda f = 125$ km/s.

        **Speed path.** $\lambda = 2\pi\delta$ means conductor. $\sigma = 1/(\pi f\mu\delta^2)$.

        **Where points go.** $2\pi f$ in place of $\pi f$ in $\delta$.
      ` }),
    P({ src: 'Practice K #3(f) · 3 pts', title: 'Two skin depths down',
      q: md`**(f) (3 pts)** A wave in medium B travels **downward**, toward $-z$, from the surface $z = 0$, where it carries 1 W/m². What time-averaged power density does it carry at $z = -2\delta = -20/\pi \approx -6.4$ m?`,
      parts: [trap(N(md`$\langle S\rangle$ at $z = -2\delta$ (W/m²)`, Math.exp(-4), 'W/m²'), [[Math.exp(-2), md`$e^{-2}$ is the **field** ratio after two skin depths. Power goes as the field squared: $e^{-4}$.`], [Math.exp(4), md`The wave goes toward $-z$, so it decays toward $-z$: the power gets **smaller** below the surface.`], [Math.exp(-1), md`That is the field after one skin depth.`]])],
      hints: [md`The field falls as $e^{-\alpha|z|}$ with $\alpha = 1/\delta$. Power goes as field squared.`],
      sol: md`
        !!trap The trap
          $\delta$ is defined for the **field**. Two skin depths cut the field by $e^{-2}$ and the power by $e^{-4}$.

        **1. The field.** A wave toward $-z$ is $E_0e^{+\alpha z}\cos(\omega t + \beta z)$: it shrinks as $z$ goes negative, the way it travels.

        **2. The power.** $\langle S\rangle \propto |E|^2$:
        $$\langle S(z)\rangle = (1\ \text{W/m}^2)\,e^{2\alpha z}$$
        At $z = -2\delta$, $2\alpha z = -4$:
        $$\boxed{\langle S\rangle = e^{-4} \approx 0.0183\ \text{W/m}^2}$$
        In decibels: $4\times4.343 \approx 17.4$ dB down.

        [[fig:pw]]

        **Speed path.** Power: $e^{-2}$ per skin depth, 8.7 dB per skin depth.

        **Where points go.** $e^{-2}$ (field, not power). Making the power grow because $z$ is negative.
      `,
      figs: { pw: { svg: figK3(), cap: 'Power density in medium B against depth. Each skin depth costs a factor e² in power.' } } }),

    // ---------------------------------------------------------------- K Problem 4
    RF(md`
      ### Problem 4 (20 points): an interface with the transmitted field given

      A plane wave in free space ($z < 0$) hits a nonmagnetic perfect dielectric ($z > 0$) head-on. The permittivity $\epsilon_2$ of the dielectric is unknown. The transmitted field is
      $$\mathbf E_t = \hat y\,6\cos(2\pi\times10^8t - 2\pi z)\ \text{V/m}, \quad z > 0$$

      [[fig:if]]
    `, { if: { svg: figK4(), cap: 'Only the transmitted field is given.' } }),
    P({ src: 'Practice K #4(a)–(c) · 12 pts', title: 'ε₂, Γ and the amplitudes',
      q: md`**(a) (4 pts)** Find $\epsilon_{r2}$. **(b) (4 pts)** Find the reflection coefficient $\Gamma$. **(c) (4 pts)** Find the incident amplitude $E_i$ and the reflected amplitude $E_r = \Gamma E_i$ (with its sign).`,
      parts: [trap(N(md`(a) $\epsilon_{r2}$`, 9, ''), [[3, md`That is $c/v_2$. $\epsilon_r = (c/v)^2$.`]]),
        trap(N(md`(b) $\Gamma$`, -0.5, ''), [[0.5, md`That is $(\eta_1 - \eta_2)/(\eta_1 + \eta_2)$. The sheet: $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$, negative going into a denser medium.`]]),
        trap(N(md`(c) $E_i$ (V/m)`, 12, 'V/m'), [[6, md`The transmitted amplitude is $\tau E_i$ with $\tau = 1 + \Gamma = \tfrac12$, so $E_i = 6/\tfrac12$.`], [4, md`That divides by $1 - \Gamma$. The boundary condition is $E_i + E_r = E_t$, so $\tau = 1 + \Gamma$.`]]),
        trap(N(md`(c) $E_r$ (V/m)`, -6, 'V/m'), [[6, md`$\Gamma = -\tfrac12$ is negative: $E_r = \Gamma E_i = -6$ V/m.`]])],
      hints: [md`Read $\omega$ and $\beta_2$ off $\mathbf E_t$. Then $v_2 = \omega/\beta_2$ and $\eta_2 = \eta_0/\sqrt{\epsilon_{r2}}$.`, md`Tangential $\mathbf E$ is continuous: $E_i + E_r = E_t$ at $z = 0$, so $E_t = (1 + \Gamma)E_i$.`],
      sol: md`
        **(a) Read the wave.** $\omega = 2\pi\times10^8$ rad/s and $\beta_2 = 2\pi$ rad/m:
        $$v_2 = \frac{\omega}{\beta_2} = 10^8\ \text{m/s} = \frac c3$$
        $$\epsilon_{r2} = \left(\frac{c}{v_2}\right)^2 = \boxed{9}$$

        **(b) Γ.** $\eta_2 = \eta_0/\sqrt9 = 40\pi\ \Omega$ and $\eta_1 = \eta_0 = 120\pi\ \Omega$:
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = \frac{40\pi - 120\pi}{160\pi} = \boxed{-\tfrac12}$$
        So the transmission coefficient is $\tau = 1 + \Gamma = \tfrac12$ (this $\tau$ is $E_t/E_i$, not the angle of $\eta$).

        **(c) Back to the incident wave.** At $z = 0$ tangential $\mathbf E$ is continuous: $E_i + E_r = E_t$, that is $(1 + \Gamma)E_i = E_t$:
        $$E_i = \frac{6}{1/2} = \boxed{12\ \text{V/m}}, \qquad E_r = \Gamma E_i = \boxed{-6\ \text{V/m}}$$

        !!intuition Does this make sense?
          At the boundary: $12 + (-6) = 6$ ✓. Going into a slower, lower-impedance medium, the field shrinks and the reflection flips sign, like a wave on a light string tied to a heavy one.

        **Speed path.** $\epsilon_r = (c\beta/\omega)^2 = 3^2$. $\Gamma = (1/3 - 1)/(1/3 + 1)$. $E_i = E_t/\tau$.

        **Where points go.** The sign of $\Gamma$. Dividing by $1 - \Gamma$.
      ` }),
    P({ src: 'Practice K #4(d) · 4 pts', title: 'The standing wave in front',
      q: md`**(d) (4 pts)** Sketch $|\tilde E_1(z)|$ in free space for $-3 < z < 0$ m and pick the matching plot. Then give the largest value of $|\tilde E_1|$.

[[fig:c]]`,
      figs: { c: { svg: figK4d(), cap: 'Candidates for |Ẽ₁(z)| in V/m, z in m.' } },
      parts: [mc('The pattern is', PLOTS, 0,
        [null, md`That puts a **maximum** at the interface, which needs $\Gamma > 0$. With $\Gamma < 0$ the reflected field cancels part of the incident one at $z = 0$.`, md`That repeats every 3 m, a full wavelength. $|\tilde E|$ repeats every **half** wavelength, 1.5 m.`, md`A flat line means no reflection. Here $|\Gamma| = \tfrac12$.`], true),
        trap(N(md`largest $|\tilde E_1|$ (V/m)`, 18, 'V/m'), [[12, md`That is the incident amplitude alone. Where the two waves line up, they add: $12 + 6$.`], [6, md`That is the minimum, $(1 - |\Gamma|)E_i$.`]])],
      hints: [md`$\tilde E_1 = E_i(e^{-j\beta_1z} + \Gamma e^{j\beta_1z})$ with $\beta_1 = \omega/c = 2\pi/3$ rad/m. The size swings between $(1 - |\Gamma|)E_i$ and $(1 + |\Gamma|)E_i$.`],
      sol: md`
        **1. The field in front.** With $\beta_1 = \omega/c = \frac{2\pi}{3}$ rad/m ($\lambda_1 = 3$ m):
        $$\tilde E_1(z) = 12\left(e^{-j\beta_1z} - \tfrac12e^{j\beta_1z}\right)$$
        **2. Where it is smallest.** At $z = 0$ the two terms are $12$ and $-6$: they subtract, $|\tilde E_1| = 6$ V/m, the minimum $(1 - |\Gamma|)E_i$. A negative $\Gamma$ puts a minimum on the boundary.

        **3. Where it is largest.** A quarter wavelength back, $z = -0.75$ m, the round trip adds half a wavelength of phase and the two terms line up:
        $$|\tilde E_1|_{\max} = (1 + |\Gamma|)E_i = \boxed{18\ \text{V/m}}$$
        The pattern repeats every $\lambda_1/2 = 1.5$ m: maxima at $-0.75$ and $-2.25$ m, minima at $0$, $-1.5$, $-3$ m. That is **Plot A**.

        **Speed path.** $\Gamma < 0$: minimum at the wall, $(1 \pm |\Gamma|)E_i = 6$ and 18, spacing $\lambda/4$.

        **Where points go.** A maximum at the wall. A period of $\lambda$ instead of $\lambda/2$.
      ` }),
    P({ src: 'Practice K #4(e) · 4 pts', title: 'Power bookkeeping',
      q: md`**(e) (4 pts)** Find the transmitted time-averaged power density $\langle S_t\rangle$, and check that incident = reflected + transmitted.`,
      parts: [trap(N(md`$\langle S_t\rangle$ (W/m²)`, 9 / (20 * PI), 'W/m²'), [[36 / (240 * PI), md`That divides by $2\eta_0$. In the dielectric the impedance is $\eta_2 = 40\pi\ \Omega$.`], [36 / (40 * PI), md`That leaves out the $\tfrac12$ of the time average.`]])],
      hints: [md`$\langle S\rangle = E^2/2\eta$ with each region's own $\eta$.`],
      sol: md`
        **1. Each wave's power.**
        $$\langle S_i\rangle = \frac{12^2}{2(120\pi)} = \frac{3}{5\pi}, \qquad \langle S_r\rangle = \frac{6^2}{2(120\pi)} = \frac{3}{20\pi}$$
        $$\langle S_t\rangle = \frac{6^2}{2(40\pi)} = \boxed{\frac{9}{20\pi} \approx 0.143\ \text{W/m}^2}$$
        **2. Check.** $\frac{3}{20\pi} + \frac{9}{20\pi} = \frac{12}{20\pi} = \frac{3}{5\pi}$ ✓. The fractions: $|\Gamma|^2 = \tfrac14$ reflected, $\tfrac34$ transmitted.

        **Speed path.** Transmitted fraction $1 - |\Gamma|^2 = 3/4$ of $\frac{3}{5\pi}$.

        **Where points go.** Using $\eta_0$ in the dielectric.
      ` }),

    // ---------------------------------------------------------------- K Problem 5
    RF(md`
      ### Problem 5 (20 points): a step on a line, seen in snapshots

      At $t = 0$ a source $21u(t)$ V with $R_g = 25\ \Omega$ is connected to a lossless line with $Z_0 = 50\ \Omega$, length 300 m and $v = 1.5\times10^8$ m/s $= 150$ m/µs. The load is $R_L = 150\ \Omega$. $z$ runs from the source ($z = 0$) to the load ($z = 300$ m).

      [[fig:ckt]]
    `, { ckt: { svg: figK5(), cap: 'One trip along the line takes 2 µs.' } }),
    P({ src: 'Practice K #5(a) · 4 pts', title: 'The coefficients',
      q: md`**(a) (4 pts)** Find $\tau_g$, $\Gamma_g$ and $\Gamma_L$.`,
      parts: [N(md`$\tau_g$`, 2 / 3, ''), trap(N(md`$\Gamma_g$`, -1 / 3, ''), [[1 / 3, md`$R_g = 25 < Z_0 = 50$: a resistor smaller than $Z_0$ reflects with a minus sign.`]]), N(md`$\Gamma_L$`, 0.5, '')],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$, $\Gamma = (R - Z_0)/(R + Z_0)$ at each end.`],
      sol: md`
        $$\tau_g = \frac{50}{25 + 50} = \boxed{\tfrac23}, \qquad \Gamma_g = \frac{25 - 50}{75} = \boxed{-\tfrac13}, \qquad \Gamma_L = \frac{150 - 50}{200} = \boxed{\tfrac12}$$
        So the first wave is $V_1^+ = \tfrac23(21) = 14$ V, its reflection $V_1^- = 7$ V, then $V_2^+ = -\tfrac73$ V.

        **Speed path.** Three divisions: $50/75$, $-25/75$, $100/200$.

        **Where points go.** Signs.
      ` }),
    P({ src: 'Practice K #5(b)–(c) · 9 pts', title: 'The snapshot at t = 3 µs',
      q: md`**(b) (5 pts)** Sketch $V(z, 3\ \mu\text{s})$ along the line and pick the matching plot. **(c) (4 pts)** Read off $V$ and $I$ at $z = 225$ m at $t = 3$ µs.

[[fig:c]]`,
      figs: { c: { svg: figK5b(), cap: 'Candidates for V(z, 3 µs), in V; z in m.' }, sn: { svg: wplot(pw(14, 21), Object.assign({}, vAx, { w: 340, h: 190, xl: 'z\\,(\\text{m})', yl: 'V(z, 3\\,\\mu\\text{s})\\ (\\text{V})', yt: [[14, '14'], [21, '21']] })), cap: '$V(z, 3\\,\\mu\\text{s})$: the 7 V reflection has come halfway back.' }, bd: { svg: TL.diagram(sK5, { tMax: 6, w: 360, h: 300 }), cap: 'Voltage bounce diagram. Times in µs.' } },
      parts: [mc('(b) The snapshot is', PLOTS, 2,
        [md`That shows the first wave still on its way. It reached the load at 2 µs; by 3 µs its reflection is coming back.`, md`That puts the higher voltage on the source side. The reflection starts at the **load** and moves back toward the source, so the load side is higher.`, null, md`That doubles at the load, as an **open** end would. $\Gamma_L = \tfrac12$ adds 7 V, not 14 V.`], true),
        N(md`(c) $V(225\ \text{m}, 3\ \mu\text{s})$ (V)`, 21, 'V'),
        trap(N(md`(c) $I(225\ \text{m}, 3\ \mu\text{s})$ (A)`, 0.14, 'A'), [[0.42, md`A backward wave carries current $-V^-/Z_0$: $I = \frac{14}{50} - \frac{7}{50}$, not plus.`], [0.28, md`That is the first wave alone. At 225 m the reflection has already passed (it left the load at 2 µs).`]])],
      hints: [md`The first wave (14 V) reaches the load at 2 µs. Its reflection (7 V) then travels back for 1 µs: 150 m.`, md`Current: forward waves add $V^+/Z_0$, backward waves add $-V^-/Z_0$.`],
      sol: md`
        **1. Where the fronts are at 3 µs.** The first wave, 14 V, covered the whole line by 2 µs. Its reflection, 7 V, left the load at 2 µs and has travelled 1 µs back: 150 m, so its front is at $z = 300 - 150 = 150$ m.

        **2. The snapshot.** Behind that front (between it and the load) both waves are present; ahead of it only the first one:
        $$V(z, 3) = 14\ \text{V}, \quad 0 < z < 150\ \text{m}$$
        $$V(z, 3) = 14 + 7 = 21\ \text{V}, \quad 150 < z < 300\ \text{m}$$
        A step up at 150 m, high on the load side: **Plot C**.

        [[fig:sn]]

        **3. Read off at 225 m.** $V = \boxed{21\ \text{V}}$. The current: the forward wave carries $+14/50$ A, the backward one $-7/50$ A:
        $$I = \frac{14}{50} - \frac{7}{50} = \boxed{0.14\ \text{A}}$$

        [[fig:bd]]

        !!intuition Does this make sense?
          Behind the reflected front, $V/I = 21/0.14 = 150\ \Omega = R_L$: the region behind the front already "knows" the load ✓.

        **Speed path.** Front of the reflection at $l - v(t - T)$. Load side: $V^+(1 + \Gamma_L)$; source side: $V^+$.

        **Where points go.** Putting the step on the wrong side. Adding the backward wave's current.
      ` }),
    P({ src: 'Practice K #5(d)–(e) · 7 pts', title: 'Later, and forever',
      q: md`**(d) (4 pts)** Find $V(75\ \text{m}, 5\ \mu\text{s})$. **(e) (3 pts)** Find the load voltage as $t\to\infty$.`,
      parts: [trap(N(md`(d) $V(75\ \text{m}, 5\ \mu\text{s})$ (V)`, 56 / 3, 'V'), [[21, md`At 4 µs the 7 V wave reached the source and launched $V_2^+ = \Gamma_g(7) = -\tfrac73$ V, which passes 75 m at 4.5 µs.`], [70 / 3, md`$\Gamma_g = -\tfrac13$ is negative: the re-launched wave **lowers** the voltage.`]]),
        trap(N(md`(e) $V_L(\infty)$ (V)`, 18, 'V'), [[14, md`That is the first wave. In steady state the line is just wires: a divider of $R_g$ and $R_L$.`], [21, md`That is the source voltage. $R_g$ still takes its share.`]])],
      hints: [md`At 4 µs the 7 V wave reaches the source and $V_2^+ = \Gamma_g V_1^-$ starts down the line.`, md`Steady state: $V_L = V_g R_L/(R_g + R_L)$.`],
      sol: md`
        **(d)** The waves that have passed $z = 75$ m by $t = 5$ µs:
        - $V_1^+ = 14$ V at 0.5 µs;
        - $V_1^- = 7$ V at $2 + 1.5 = 3.5$ µs (it had 225 m to come back);
        - $V_2^+ = \Gamma_gV_1^- = -\tfrac73$ V, launched at 4 µs, passing 75 m at 4.5 µs.

        Add them:
        $$V = 14 + 7 - \tfrac73 = \boxed{\tfrac{56}{3} \approx 18.7\ \text{V}}$$

        **(e)** After the bounces die out the lossless line is just two wires, and the circuit is $21$ V, $R_g$ and $R_L$ in series:
        $$V_L(\infty) = 21\cdot\frac{150}{25 + 150} = \boxed{18\ \text{V}}$$

        !!intuition Does this make sense?
          The voltage near the source goes 14, 21, 18.7, ... and the steady value is 18: it rings around 18, overshooting from both sides, because $\Gamma_g\Gamma_L = -\tfrac16 < 0$.

        **Speed path.** List the arrivals at the point with their times; add. Steady state: ignore the line.

        **Where points go.** Forgetting the re-launched wave. Putting $Z_0$ into the steady state.
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-k', order: 11, title: 'Practice exam K', kind: 'mock', sub: '75 min · 100 pts · a sheet switched on (waveform and snapshot), a circular wave from two instants, two lossy media from λ and δ, an interface with E_t given, a bounce snapshot', steps: examK });

  // ======================================================================================== EXAM L: figures
  // L1: gamma and eta in the complex plane: their angles add to 90 degrees
  function figL1() {
    const g = PF.fig({ alt: 'the complex plane: gamma = 1 + j root 3 drawn at 60 degrees, eta drawn at 30 degrees; a dashed arc shows the product of the two at 90 degrees, along the imaginary axis' });
    const ox = 50, oy = 180, s = 62;
    g.arrow(ox - 16, oy, ox + 200, oy, { cls: 'dim', hs: 6 }); g.label(ox + 204, oy, '\\text{Re}', 'l', 'small accent');
    g.arrow(ox, oy + 14, ox, oy - 160, { cls: 'dim', hs: 6 }); g.label(ox + 4, oy - 162, '\\text{Im}', 'bl', 'small accent');
    const at = (r, deg) => [ox + r * Math.cos(deg * PI / 180), oy - r * Math.sin(deg * PI / 180)];
    const G = at(2 * s, 60), H = at(2.4 * s, 30);
    g.arrow(ox, oy, G[0], G[1], { cls: 'thick', hs: 8 }); g.label(G[0] + 6, G[1] - 2, '\\gamma = 1 + j\\sqrt3', 'l', 'small');
    g.arrow(ox, oy, H[0], H[1], { cls: 'thick', hs: 8 }); g.label(H[0] + 6, H[1], '\\eta = 20\\pi\\,e^{j30^\\circ}', 'l', 'small');
    g.angle(ox, oy, 30, 0, 30, '30^\\circ'); g.angle(ox, oy, 56, 30, 60, '30^\\circ');
    return g.svg();
  }

  // L2: the coated glass
  function figL2() {
    const g = PF.fig({ alt: 'side view: air on the left, a thin coating layer of thickness d in the middle, glass on the right; light arrives from the left at normal incidence' });
    g.rect(160, 26, 40, 120, { cls: 'shade' }); g.rect(200, 26, 140, 120, { cls: 'shade' });
    g.line(160, 20, 160, 152, { cls: 'thick' }); g.line(200, 20, 200, 152, { cls: 'thick' });
    g.label(80, 110, '\\text{air},\\ \\eta_0', 'c', 'small');
    g.label(180, 86, '\\epsilon_{rc}', 'c', 'small');
    g.label(270, 110, '\\text{glass},\\ \\epsilon_r = 4', 'c', 'small');
    g.arrow(30, 56, 140, 56, { cls: 'thick', hs: 8 }); g.label(85, 50, '\\lambda_0 = 600\\,\\text{nm}', 'b', 'small');
    g.dim(160, 166, 200, 166, 'd', { at: 'b' });
    return g.svg();
  }
  // fraction of power reflected by the coated glass against f/f0 (the coating is a quarter wave at f0)
  const L2refl = (fr) => {
    const bl = PI / 2 * fr, c = Math.cos(bl), s = Math.sin(bl);
    const ec = Math.SQRT2, eg = 1, e0 = 2;                     // impedances in units of 60 pi
    const zin = Cx.of(eg * c, ec * s).div(Cx.of(ec * c, eg * s)).scale(ec);
    const G = zin.sub(e0).div(zin.add(e0));
    return G.abs() ** 2;
  };
  const figL2sol = () => plot({
    w: 380, h: 210, x: [0, 3.3], y: [0, 0.135], xl: 'f/f_0', yl: '|\\Gamma|^2',
    xt: [[0.5, '\\tfrac12'], [1, '1'], [1.5, '\\tfrac32'], [2, '2'], [3, '3']], yt: [[1 / 17, '\\tfrac{1}{17}'], [1 / 9, '\\tfrac19']],
    curves: [{ f: L2refl, n: 500 }, { f: () => 1 / 9, cls: 'dash dim' }],
    pts: [{ x: 1, y: 0 }, { x: 2, y: 1 / 9 }, { x: 1.5, y: 1 / 17 }],
  });

  // L3: a charged line, shorted at t = 0
  const sL3 = TL.solve({ Vg: -10, Rg: 0, RL: Infinity, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 14 });
  const sL3R = TL.solve({ Vg: -10, Rg: 50, RL: Infinity, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 14 });
  function figL3() {
    const g = PF.fig({ alt: 'a lossless line 300 m long charged to 10 volts, open at the far end; at its near end a switch closes at t = 0 and shorts it' });
    const x0 = 70, x1 = 330, T = 30, B = 112, M = 71;
    g.line(x0, T, x1, T, { cls: 'thick' }); g.line(x0, B, x1, B, { cls: 'thick' });
    g.line(x0, B, x0, M + 14); g.line(x0, M + 14, x0 - 14, M - 16, { cls: 'thick' }); g.dot(x0, M + 14, 2.4); g.line(x0, T, x0, M - 18); g.dot(x0, M - 18, 2.4);
    g.label(x0 - 20, M, '\\text{switch}', 'r', 'small');
    g.circle(x1 + 3, T, 3, { cls: 'bgfill' }); g.circle(x1 + 3, B, 3, { cls: 'bgfill' }); g.label(x1 + 10, M, '\\text{open}', 'l', 'small');
    g.label((x0 + x1) / 2, T + 20, 'Z_0 = 50\\,\\Omega,\\ v = 150\\,\\text{m}/\\mu\\text{s}', 'c', 'small');
    g.label((x0 + x1) / 2, B - 20, 'V = 10\\,\\text{V for } t < 0', 'c', 'small');
    const y = B + 24;
    g.line(x0 - 6, y, x1 + 16, y, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(x1 + 20, y, 'z', 'l', 'small accent');
    g.line(x0, y - 4, x0, y + 4, { cls: 'dim' }); g.label(x0, y + 7, '0', 't', 'small');
    g.line(x1, y - 4, x1, y + 4, { cls: 'dim' }); g.label(x1, y + 7, '300\\,\\text{m}', 't', 'small');
    return g.svg();
  }
  const sq = (pts) => [{ pts }];
  const lvl = (list, tEnd) => { const p = []; list.forEach(([t0, v], k) => { const t1 = k + 1 < list.length ? list[k + 1][0] : tEnd; p.push([t0, v], [t1, v]); }); return p; };
  const L3pts = (s, z, tEnd, qty, add) => TL.stepPts(s, z, tEnd, qty).map(([t, v]) => [t, v + (add || 0)]);
  const tAx3 = { x: [0, 12.5], y: [-13, 13], xl: 't', yl: 'V\\ (\\text{V})', xt: [[2, '2'], [4, '4'], [6, '6'], [8, '8'], [10, '10']], yt: [[10, '10'], [-10, '-10']] };
  const figL3b = () => row4([
    wplot(sq(lvl([[0, 10], [2, 0]], 12.5)), tAx3),
    wplot(sq(L3pts(sL3, 300, 12.5, 'V', 10)), tAx3),
    wplot(sq(lvl([[0, 10], [2, -10], [4, 10], [6, -10], [8, 10], [10, -10]], 12.5)), tAx3),
    wplot(sq(lvl([[0, 10], [2, 0], [4, -10], [6, 0], [8, 10], [10, 0]], 12.5)), tAx3),
  ]);
  const figL3sol = () => PF.row([
    { svg: wplot(sq(L3pts(sL3, 150, 12.5, 'V', 10)), Object.assign({}, tAx3, { w: 300, h: 160, yl: 'V(150\\,\\text{m}, t)' })), cap: 'Halfway along: three levels, period 8 µs.' },
    { svg: wplot(sq(L3pts(sL3, 0, 12.5, 'I')), Object.assign({}, tAx3, { w: 300, h: 160, y: [-0.26, 0.26], yl: 'I(0, t)\\ (\\text{A})', yt: [[0.2, '0.2'], [-0.2, '-0.2']] })), cap: 'Current through the short: ±0.2 A, period 8 µs.' },
  ]).svg;
  const figL3R = () => wplot(sq(L3pts(sL3R, 0, 8, 'V', 10)), Object.assign({}, tAx3, { w: 320, h: 160, x: [0, 8], y: [-1.5, 12], zero: true, yl: 'V_R(t)\\ (\\text{V})', xt: [[2, '2'], [4, '4'], [6, '6']], yt: [[5, '5'], [10, '10']] }));

  // L4: an impulse on two lines with different speeds
  const sL4 = TL.solve({ Vg: 80, Rg: 150, RL: Infinity, sections: [{ Z0: 50, len: 300, v: 300 }, { Z0: 150, len: 450, v: 150 }], tMax: 9 });
  const figL4 = () => circuit([
    { t: 'gen', R: '150\\,\\Omega', V: '80\\,\\delta(t)' }, { t: 'wire', w: 12 },
    { t: 'line', w: 120, lab: 'Z_{01} = 50\\,\\Omega', sub: 'v_1 = c' },
    { t: 'line', w: 180, lab: 'Z_{02} = 150\\,\\Omega', sub: 'v_2 = c/2' },
    { t: 'open' },
  ], { probe: [3, 0.5, '\\text{probe}'], ticks: [[2, '0'], [3, '300'], [3, '525', 0.5], [4, '750\\,\\text{m}']],
    alt: 'an impulse source 80 delta(t) with a 150-ohm internal resistance feeds a 50-ohm line 300 m long at the speed of light, then a 150-ohm line 450 m long at half that speed, open at its end; a probe sits at z = 525 m, the middle of the second line' });
  // merged impulse weights at z: [[t, weight], ...]
  const mergedAt = (s, z, tMax) => {
    const out = [];
    TL.arrivals(s, z).filter((a) => a.t < tMax).forEach((a) => {
      const last = out[out.length - 1];
      if (last && Math.abs(last[0] - a.t) < 1e-9) last[1] += a.v; else out.push([a.t, a.v]);
    });
    return out;
  };
  const figL4trace = () => deltaPlot(mergedAt(sL4, 525, 9).map(([t, v]) => [t, v, TL.frac(v)]), { tMax: 9.4, w: 400, h: 220, yl: 'V(525\\,\\text{m}, t)', xt: mergedAt(sL4, 525, 9).map(([t]) => [t, EM.p(t)]) });

  // ======================================================================================== EXAM L
  const examL = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Prof. Chen's four-problem shape (Spring 2024: 18, 30, 18 and 34 points in short parts), at the hardest level on this site. Every problem mixes two or three topics, the way a cumulative final would. If you can do this paper in 75 minutes, Monday will feel short.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | A measured $\mathbf H$ and $\mathbf E$ in an unknown lossy medium: $\gamma$, $\eta$, $\mu$, $\sigma$, $\epsilon$, power | 28 |
      | 2 | A quarter-wave coating on glass: the line analog, the coating, its thickness, other colors | 24 |
      | 3 | A charged line shorted at $t = 0$: the waveform, its frequencies, energy, a resistor instead | 22 |
      | 4 | An impulse on two lines with different speeds: coefficients, arrivals at a point, a merged pulse | 26 |

      **Draws on:** [where γ and η come from](#/l/w2-gamma), [reading a lossy wave](#/l/w2-read), [power in lossy media](#/l/w2-loss), [reflection](#/l/w4-gamma), [quarter-wave transformers](#/l/w6-qw), [periodic oscillations and stubs](#/l/w6-stubs), [launching waves](#/l/w5-launch) and [junctions](#/l/w5-multi).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- L Problem 1
    R(md`
      ### Problem 1 (28 points): a measured wave in an unknown medium

      A uniform plane wave travels through a homogeneous medium whose $\sigma$, $\epsilon$ and $\mu$ are all unknown. Its magnetic field is measured everywhere as
      $$\mathbf H = \hat x\,5e^{-z}\cos(10^8t - \sqrt3z)\ \text{A/m}$$
      ($z$ in meters, $t$ in seconds), and a probe at $z = 0$ measures the electric field
      $$\mathbf E(0,t) = -\hat y\,100\pi\cos(10^8t + 30°)\ \text{V/m}$$
      Formula sheet: $\eta\gamma = j\omega\mu$ and $\gamma/\eta = \sigma + j\omega\epsilon$.
    `),
    P({ src: 'Practice L #1(a) · 4 pts', title: 'γ from H',
      q: md`**(a) (4 pts)** Read off $\alpha$ and $\beta$, and write $\gamma$ in polar form.`,
      parts: [N(md`$\alpha$ (Np/m)`, 1, 'Np/m'), N(md`$\beta$ (rad/m)`, Math.sqrt(3), 'rad/m'), N(md`$|\gamma|$ (1/m)`, 2, '1/m'),
        trap(N(md`angle of $\gamma$ (degrees)`, 60, '°'), [[30, md`That is $\tan^{-1}(\alpha/\beta)$. The angle of $\alpha + j\beta$ is $\tan^{-1}(\beta/\alpha) = \tan^{-1}\sqrt3$.`]])],
      hints: [md`Match $e^{-\alpha z}\cos(\omega t - \beta z)$. Then $|\gamma| = \sqrt{\alpha^2 + \beta^2}$ and its angle is $\tan^{-1}(\beta/\alpha)$.`],
      sol: md`
        **1. Read the exponent and the phase.** The field has the form $e^{-\alpha z}\cos(\omega t - \beta z)$, a wave toward $+z$ that shrinks the way it goes:
        $$\alpha = 1\ \text{Np/m}, \qquad \beta = \sqrt3 \approx 1.73\ \text{rad/m}, \qquad \omega = 10^8\ \text{rad/s}$$
        **2. Polar form.**
        $$\gamma = \alpha + j\beta = 1 + j\sqrt3$$
        Its size is $\sqrt{1 + 3} = 2$, and its angle is $\tan^{-1}\sqrt3 = 60°$:
        $$\boxed{\gamma = 2e^{j60°}\ \text{m}^{-1}}$$
        It is the $1 : \sqrt3 : 2$ triangle.

        **Speed path.** Spot the triangle: $1 + j\sqrt3 = 2\angle60°$.

        **Where points go.** Writing $\alpha$ and $\beta$ the wrong way round.
      ` }),
    P({ src: 'Practice L #1(b) · 5 pts', title: 'η, and E everywhere',
      q: md`**(b) (5 pts)** Find $\eta = |\eta|e^{j\tau}$, then $\mathbf E(z,t)$ for all $z$.`,
      parts: [N(md`$|\eta|$ (Ω)`, 20 * PI, 'Ω'), trap(N(md`$\tau$ (degrees)`, 30, '°'), [[-30, md`$\mathbf E$ **leads** $\mathbf H$: its phase is $+30°$ against $\mathbf H$'s $0°$. $\tilde{\mathbf H} = \tilde{\mathbf E}/\eta$, so $\eta$ carries $+30°$.`]]),
        mc(md`$\mathbf E(z,t)$ in V/m is`, [md`$-\hat y\,100\pi\,e^{-z}\cos(10^8t - \sqrt3z + 30°)$`, md`$-\hat y\,100\pi\cos(10^8t - \sqrt3z + 30°)$`, md`$-\hat y\,100\pi\,e^{-z}\cos(10^8t - \sqrt3z - 30°)$`, md`$\hat y\,100\pi\,e^{-z}\cos(10^8t - \sqrt3z + 30°)$`], 0,
          [null, md`$\mathbf E$ decays exactly as $\mathbf H$ does; both carry $e^{-z}$.`, md`The probe shows $+30°$ at $z = 0$; the phase does not flip as the wave travels.`, md`At $z = 0$ the probe reads $-\hat y$. And for travel along $+\hat z$ with $\mathbf H$ along $\hat x$, $\mathbf E$ must be along $-\hat y$: $(-\hat y)\times\hat x = \hat z$.`])],
      hints: [md`For a wave toward $+z$ with $\mathbf H$ along $\hat x$, $\eta = -\tilde E_y/\tilde H_x$ (the sign makes $\mathbf E\times\mathbf H$ point along $+\hat z$). Divide the phasors at $z = 0$.`],
      sol: md`
        **1. Phasors at z = 0.** $\tilde H_x(0) = 5$ (phase 0) and $\tilde E_y(0) = -100\pi e^{j30°}$.

        **2. The sign.** In a wave toward $+\hat z$, $\mathbf E\times\mathbf H$ must point along $+\hat z$. With $\mathbf H$ along $\hat x$, that needs $\mathbf E$ along $-\hat y$, because $(-\hat y)\times\hat x = \hat z$. So the impedance compares $-\tilde E_y$ with $\tilde H_x$:
        $$\eta = \frac{-\tilde E_y}{\tilde H_x} = \frac{100\pi e^{j30°}}{5}$$
        $$\boxed{\eta = 20\pi\,e^{j30°} \approx 62.8\angle30°\ \Omega}$$
        **3. E everywhere.** $\mathbf E$ is the same traveling wave as $\mathbf H$, with the same $e^{-\gamma z}$, scaled by $|\eta|$ and advanced by $\tau$:
        $$\boxed{\mathbf E = -\hat y\,100\pi\,e^{-z}\cos(10^8t - \sqrt3z + 30°)\ \text{V/m}}$$

        !!intuition Does this make sense?
          In any lossy medium $\mathbf E$ leads $\mathbf H$ by $\tau$, with $0 < \tau < 45°$. Here $30°$ ✓.

        **Speed path.** $|\eta| = 100\pi/5$; $\tau$ = phase of $E$ minus phase of $H$.

        **Where points go.** The sign of $\tau$. Dropping $e^{-z}$ from $\mathbf E$.
      ` }),
    P({ src: 'Practice L #1(c) · 5 pts', title: 'μ from ηγ = jωμ',
      q: md`**(c) (5 pts)** Find $\mu$, as a multiple of $\mu_0$.`,
      parts: [trap(N(md`$\mu/\mu_0$`, 1, ''), [[0.5, md`$|\eta||\gamma| = 20\pi\cdot2 = 40\pi$, not $20\pi$: multiply by $|\gamma| = 2$.`], [1 / (2 * PI), md`That divides by $2\pi\times10^8$. In $\cos(10^8t - \dots)$ the $10^8$ is already $\omega$, not $f$.`]])],
      hints: [md`$\mu = \eta\gamma/(j\omega)$. Multiply the sizes and add the angles.`],
      sol: md`
        **1. Multiply η and γ.** Sizes multiply, angles add:
        $$\eta\gamma = (20\pi)(2)\,e^{j(30° + 60°)} = 40\pi\,e^{j90°} = j40\pi$$
        **2. Divide by jω.**
        $$\mu = \frac{\eta\gamma}{j\omega} = \frac{j40\pi}{j\,10^8} = 4\pi\times10^{-7}\ \text{H/m}$$
        $$\boxed{\mu = \mu_0}$$

        !!intuition Does this make sense?
          $\mu$ must be a real, positive number. That happens only if the angles of $\eta$ and $\gamma$ add to exactly $90°$. They do: $30° + 60°$. The measurement is consistent, and a nonmagnetic medium is what most lossy materials are.

        **Speed path.** Angles add to $90°$ ✓, then $|\eta||\gamma|/\omega$.

        **Where points go.** Dividing by $\omega$ but forgetting the $j$, leaving a stray $90°$.
      ` }),
    P({ src: 'Practice L #1(d) · 6 pts', title: 'σ and ε',
      q: md`**(d) (6 pts)** Find the conductivity $\sigma$ and the relative permittivity $\epsilon_r$.`,
      parts: [trap(N(md`$\sigma$ (S/m)`, Math.sqrt(3) / (20 * PI), 'S/m'), [[1 / (20 * PI), md`That is the **imaginary** part of $\gamma/\eta$, which is $\omega\epsilon$. $\sigma$ is the real part, $\frac{\cos30°}{10\pi}$.`]]),
        trap(N(md`$\epsilon_r$`, 18, ''), [[27, md`That is $(c/v_p)^2 = (c\beta/\omega)^2$, which holds only without loss. Here loss raised $\beta$, so the lossless formula overestimates $\epsilon$. Use $\omega\epsilon = \text{Im}\{\gamma/\eta\}$.`], [Math.sqrt(27), md`That is $c/v_p$, and it is the lossless formula besides. Use $\text{Im}\{\gamma/\eta\} = \omega\epsilon$.`]])],
      hints: [md`$\gamma/\eta = \sigma + j\omega\epsilon$: divide the sizes, subtract the angles, then split into real and imaginary parts.`, md`$\omega\epsilon_0 = 10^8\cdot\frac{10^{-9}}{36\pi} = \frac{1}{360\pi}$ S/m.`],
      sol: md`
        !!trap The trap
          The lossless shortcut $\epsilon_r = (c/v_p)^2$ gives 27 here. Loss raises $\beta$ above $\omega\sqrt{\mu\epsilon}$, so in a lossy medium only $\gamma/\eta = \sigma + j\omega\epsilon$ gives $\epsilon$.

        **1. Divide γ by η.** Sizes divide, angles subtract:
        $$\frac\gamma\eta = \frac{2}{20\pi}\,e^{j(60° - 30°)} = \frac{1}{10\pi}\,e^{j30°}$$
        **2. Real and imaginary parts.** $\cos30° = \frac{\sqrt3}{2}$ and $\sin30° = \frac12$:
        $$\frac\gamma\eta = \frac{\sqrt3}{20\pi} + j\,\frac{1}{20\pi}$$
        Match with $\sigma + j\omega\epsilon$:
        $$\boxed{\sigma = \frac{\sqrt3}{20\pi} \approx 0.0276\ \text{S/m}}$$
        $$\omega\epsilon = \frac{1}{20\pi}\ \text{S/m}$$
        **3. εr.** Divide by $\omega\epsilon_0 = 10^8\cdot\frac{10^{-9}}{36\pi} = \frac{1}{360\pi}$ S/m:
        $$\epsilon_r = \frac{1/20\pi}{1/360\pi} = \boxed{18}$$

        **4. Check by rebuilding γ.** $\gamma^2 = -\omega^2\mu\epsilon + j\omega\mu\sigma$. With $\omega/c = \frac13$: $\omega^2\mu_0\epsilon_0\epsilon_r = \frac19(18) = 2$, and $\omega\mu_0\sigma = (40\pi)\frac{\sqrt3}{20\pi} = 2\sqrt3$. So $\gamma^2 = -2 + j2\sqrt3 = 4e^{j120°}$ and $\gamma = 2e^{j60°}$ ✓.

        **Speed path.** $\gamma/\eta = \frac{1}{10\pi}\angle30°$; real part $\sigma$, imaginary part over $\omega\epsilon_0$ gives $\epsilon_r$.

        **Where points go.** $(c/v_p)^2 = 27$. Swapping the real and imaginary parts.
      ` }),
    P({ src: 'Practice L #1(e) · 4 pts', title: 'Which regime?',
      q: md`**(e) (4 pts)** Find the loss tangent $\sigma/\omega\epsilon$. Which page-3 approximation (if any) applies?`,
      parts: [trap(N(md`$\sigma/\omega\epsilon$`, Math.sqrt(3), ''), [[1 / Math.sqrt(3), md`Upside down: conduction over displacement is $\frac{\sqrt3/20\pi}{1/20\pi}$.`]]),
        mc('The medium is', ['neither: use the exact formulas', 'a good conductor', 'an imperfect dielectric', 'a perfect dielectric'], 0,
          [null, md`A good conductor needs $\sigma/\omega\epsilon \gg 1$ and then $\tau \approx 45°$, $\alpha \approx \beta$. Here $\tau = 30°$ and $\beta = \sqrt3\,\alpha$.`, md`That needs $\sigma/\omega\epsilon \ll 1$; here the conduction current is the larger one.`, md`$\alpha = 1$ Np/m is far from zero.`])],
      hints: [md`Divide the real part of $\gamma/\eta$ by its imaginary part. Or use $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ with $\tau = 30°$.`],
      sol: md`
        **1. The ratio.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{\sqrt3/20\pi}{1/20\pi} = \boxed{\sqrt3 \approx 1.73}$$
        **2. Check with τ.** The sheet says $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$: $\tan^{-1}\sqrt3 = 60°$, half of it is $30°$ ✓.

        **3. Regime.** 1.73 is neither $\ll 1$ nor $\gg 1$: conduction and displacement currents are comparable. **No** approximation applies; that is why every step above used the exact relations.

        **Speed path.** $\tan2\tau = \tan60° = \sqrt3$.

        **Where points go.** Calling any lossy medium "a good conductor".
      ` }),
    P({ src: 'Practice L #1(f) · 4 pts', title: 'Power, and where it goes',
      q: md`**(f) (4 pts)** Find the time-averaged power density at $z = 0$ and at $z = 1$ m.`,
      parts: [trap(N(md`$\langle S\rangle$ at $z = 0$ (W/m²)`, 125 * Math.sqrt(3) * PI, 'W/m²'), [[250 * PI, md`That leaves out $\cos\tau$: $\mathbf E$ and $\mathbf H$ are $30°$ out of phase, so only $\cos30°$ of the product carries power on average.`], [500 * PI, md`That leaves out both the $\tfrac12$ and the $\cos\tau$.`]]),
        trap(N(md`$\langle S\rangle$ at $z = 1$ m (W/m²)`, 125 * Math.sqrt(3) * PI * Math.exp(-2), 'W/m²'), [[125 * Math.sqrt(3) * PI * Math.exp(-1), md`That uses $e^{-\alpha z}$, the field's decay. Power goes as $e^{-2\alpha z}$.`]])],
      hints: [md`$\langle S\rangle = \tfrac12|E||H|\cos\tau\,e^{-2\alpha z}$.`],
      sol: md`
        **1. At z = 0.** $\langle\mathbf S\rangle = \tfrac12\text{Re}\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. With the phasors of (b), $\tilde{\mathbf E}\times\tilde{\mathbf H}^* = (100\pi)(5)e^{j30°}\,\hat z$ at $z = 0$:
        $$\langle S\rangle = \tfrac12(100\pi)(5)\cos30° = 250\pi\cdot\frac{\sqrt3}{2}$$
        $$\boxed{\langle S(0)\rangle = 125\sqrt3\,\pi \approx 680\ \text{W/m}^2}$$
        It points along $+\hat z$, the way the wave travels.
        **2. At z = 1 m.** Both fields carry $e^{-z}$, so their product carries $e^{-2z}$:
        $$\langle S(1)\rangle = 680\,e^{-2} \approx \boxed{92\ \text{W/m}^2}$$
        The first meter turned $680 - 92 \approx 588$ W per m² of cross-section into heat.

        !!intuition Does this make sense?
          $e^{-2} \approx 0.135$: 86% of the power is gone in one meter, because $2\alpha = 2$ Np/m. That is $8.7$ dB per meter for power: a very lossy medium.

        **Speed path.** $\tfrac12EH\cos\tau$, then $e^{-2\alpha z}$.

        **Where points go.** Dropping $\cos\tau$. Using $e^{-\alpha z}$ for power.
      ` }),
    RF(md`
      **The whole of Problem 1 in one picture.** The two measurements give $\gamma$ and $\eta$ as arrows in the complex plane. Their **product** must point straight up ($j\omega\mu$, with $\mu$ real): the angles must add to $90°$. Their **quotient** $\sigma + j\omega\epsilon$ points at $60° - 30° = 30°$, which splits into $\sigma$ (real) and $\omega\epsilon$ (imaginary).

      [[fig:ge]]
    `, { ge: { svg: figL1(), cap: 'γ at 60°, η at 30°: product at 90° (so μ is real), quotient at 30° (so σ/ωε = tan 60° = √3).' } }),

    // ---------------------------------------------------------------- L Problem 2
    RF(md`
      ### Problem 2 (24 points): a quarter-wave coating on glass

      Orange light, free-space wavelength $\lambda_0 = 600$ nm, hits a flat piece of glass head-on from air. The glass is nonmagnetic with $\epsilon_r = 4$ (a high-index glass, refractive index 2) and fills all of the space behind it. To stop the reflection, a thin nonmagnetic, lossless coating of thickness $d$ and relative permittivity $\epsilon_{rc}$ is laid on the glass.

      [[fig:g]]
    `, { g: { svg: figL2(), cap: 'Air, a coating of thickness d, then glass that goes on forever. Not to scale: d is about a sixth of a wavelength.' } }),
    P({ src: 'Practice L #2(a) · 4 pts', title: 'Bare glass',
      q: md`**(a) (4 pts)** Without the coating, find $\Gamma$ at the air-glass surface and the fraction of the power reflected.`,
      parts: [trap(N(md`$\Gamma$`, -1 / 3, ''), [[1 / 3, md`$\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ with $\eta_2 = 60\pi < \eta_1 = 120\pi$: negative.`]]),
        trap(N(md`fraction reflected`, 1 / 9, ''), [[1 / 3, md`That is $|\Gamma|$. The power goes as the field squared: $|\Gamma|^2$.`]])],
      hints: [md`$\eta_{\text{glass}} = \eta_0/\sqrt{\epsilon_r} = 60\pi\ \Omega$.`],
      sol: md`
        **1. The impedances.** $\eta_0 = 120\pi\ \Omega$ and $\eta_g = \eta_0/\sqrt4 = 60\pi\ \Omega$.

        **2. Γ.**
        $$\Gamma = \frac{\eta_g - \eta_0}{\eta_g + \eta_0} = \frac{60\pi - 120\pi}{180\pi} = \boxed{-\tfrac13}$$
        **3. Power.**
        $$|\Gamma|^2 = \boxed{\tfrac19 \approx 11\%}$$

        **Speed path.** $\Gamma = \frac{1 - n}{1 + n}$ for light from air: $\frac{1 - 2}{3}$.

        **Where points go.** Reporting $|\Gamma|$ as the power fraction.
      ` }),
    P({ src: 'Practice L #2(b) · 4 pts', title: 'The line analog',
      q: md`**(b) (4 pts)** Pick the transmission-line circuit that behaves exactly like air, coating and glass at normal incidence. Then use the same idea on a real line: a 75 Ω line must feed a 300 Ω antenna with no reflection, through a quarter-wave section. What $Z_0$ must that section have?`,
      parts: [mc('The analog is', [
        md`a $120\pi\ \Omega$ line, then a section of $Z_0 = \eta_c$ and length $d$, ending in a **resistor** $60\pi\ \Omega$`,
        md`a $120\pi\ \Omega$ line, then a section of $Z_0 = \eta_c$ and length $d$, ending in a **short** (the glass)`,
        md`a $120\pi\ \Omega$ line ending in a series resistor $\eta_c$ and a resistor $60\pi\ \Omega$`,
        md`a $120\pi\ \Omega$ line, then a section of $Z_0 = \eta_c$, ending in an **open**: the glass is infinitely long`], 0,
        [null, md`A short reflects everything. Glass transmits most of the light: it absorbs the wave like a resistor.`,
          md`The coating is a **line** section: waves travel and turn their phase in it. A resistor has no length and no phase.`,
          md`An infinitely long line never sends anything back: from its front it looks like a **resistor** $Z_0$, not an open.`]),
        trap(N(md`$Z_0$ of the matching section (Ω)`, 150, 'Ω'), [[187.5, md`That is the average, $(75 + 300)/2$. A quarter-wave matcher needs the geometric mean, $\sqrt{75\cdot300}$.`]])],
      hints: [md`Each medium is a line with $Z_0 = \eta$, and $\mathbf E$, $\mathbf H$ play $V$, $I$. A semi-infinite medium sends nothing back.`, md`A quarter-wave section turns a load $R$ into $Z_0^2/R$.`],
      sol: md`
        **1. The analogy.** At normal incidence, tangential $\tilde E$ and $\tilde H$ are continuous at every interface, just as $\tilde V$ and $\tilde I$ are continuous where two lines join. And in each medium $\tilde E^\pm/\tilde H^\pm = \pm\eta$, just as $\tilde V^\pm/\tilde I^\pm = \pm Z_0$ on a line. So each layer **is** a line with $Z_0 = \eta$ and the same $\beta$.

        **2. The glass.** It goes on forever, so no wave ever comes back from inside it. A line with no returning wave has $\tilde V/\tilde I = Z_0$ everywhere: from its front it looks like a **resistor** $\eta_g = 60\pi\ \Omega$. So the analog is: a $120\pi$ line, a section of $Z_0 = \eta_c$ and length $d$, and a $60\pi$ resistor.

        **3. The real line.** A quarter-wave section inverts: $Z_{in} = Z_0^2/R_L$. For no reflection, $Z_{in} = 75\ \Omega$:
        $$Z_0^2 = 75\cdot300 = 22500 \quad\Rightarrow\quad \boxed{Z_0 = 150\ \Omega}$$

        **Speed path.** Medium $\to$ line with $Z_0 = \eta$; semi-infinite $\to$ resistor; matcher $= \sqrt{R_1R_2}$.

        **Where points go.** Modeling the glass as a short or an open. The arithmetic mean.
      ` }),
    P({ src: 'Practice L #2(c)–(d) · 8 pts', title: 'Design the coating',
      q: md`**(c) (4 pts)** Find $\epsilon_{rc}$ so that nothing is reflected at $\lambda_0 = 600$ nm. **(d) (4 pts)** Find the thinnest $d$ that works, and the amplitude of $\mathbf E$ in the glass as a fraction of the incident amplitude.`,
      parts: [trap(N(md`(c) $\epsilon_{rc}$`, 2, ''), [[2.5, md`That is the arithmetic mean of 1 and 4. A quarter-wave matcher needs the **geometric** mean of the impedances, $\eta_c = \sqrt{\eta_0\eta_g}$, which gives $\epsilon_{rc} = \sqrt{1\cdot4}$.`], [Math.SQRT2, md`That is the coating's refractive index $\sqrt{\epsilon_{rc}}$. Square it.`]]),
        trap(N(md`(d) $d$ (nm)`, 75 * Math.SQRT2, 'nm'), [[150, md`That is $\lambda_0/4$, a quarter of the **free-space** wavelength. Inside the coating the wavelength is shorter: $\lambda_0/\sqrt2$.`], [75, md`That divides by $\epsilon_{rc} = 2$. The wavelength shrinks by $\sqrt{\epsilon_{rc}}$.`]]),
        trap(N(md`(d) $E_{\text{glass}}/E_i$`, Math.SQRT1_2, ''), [[1, md`All the **power** goes in, but the glass has a lower impedance: the same power needs a smaller $E$, $|E|^2/2\eta_g = E_i^2/2\eta_0$.`], [0.5, md`That uses $E \propto \eta$; power is $|E|^2/2\eta$, so $E \propto \sqrt\eta$.`]])],
      hints: [md`A quarter-wave coating turns the glass's $\eta_g$ into $\eta_c^2/\eta_g$ at its front face. Set that equal to $\eta_0$.`, md`In the coating $\lambda_c = \lambda_0/\sqrt{\epsilon_{rc}}$; $d = \lambda_c/4$.`],
      sol: md`
        **(c) The coating.** With $d = \lambda_c/4$, the coating inverts: at its front face the wave sees
        $$Z_{in} = \frac{\eta_c^2}{\eta_g}$$
        No reflection needs $Z_{in} = \eta_0$:
        $$\eta_c = \sqrt{\eta_0\eta_g} = \sqrt{(120\pi)(60\pi)} = 60\sqrt2\,\pi\ \Omega$$
        And $\eta_c = \eta_0/\sqrt{\epsilon_{rc}}$, so
        $$\sqrt{\epsilon_{rc}} = \frac{120\pi}{60\sqrt2\,\pi} = \sqrt2 \quad\Rightarrow\quad \boxed{\epsilon_{rc} = 2}$$
        In optics language: the coating's index is $\sqrt{n_g} = \sqrt2$.

        **(d) The thickness.** Inside the coating
        $$\lambda_c = \frac{\lambda_0}{\sqrt{\epsilon_{rc}}} = \frac{600}{\sqrt2} = 300\sqrt2\ \text{nm}$$
        A quarter of it:
        $$\boxed{d = 75\sqrt2 \approx 106\ \text{nm}}$$
        **The field in the glass.** Nothing reflects and nothing is lost, so all of the power enters the glass:
        $$\frac{E_g^2}{2\eta_g} = \frac{E_i^2}{2\eta_0}$$
        $$\frac{E_g}{E_i} = \sqrt{\frac{\eta_g}{\eta_0}} = \boxed{\frac{1}{\sqrt2} \approx 0.707}$$

        !!intuition Does this make sense?
          Why a quarter wave works: the reflections from the front and back faces of the coating are equal in size (both interfaces have the same impedance ratio, $\sqrt2$) and the back one travels an extra half wavelength (there and back), so they cancel.

        **Speed path.** $\epsilon_{rc} = \sqrt{\epsilon_{rg}}$; $d = \lambda_0/(4\sqrt{\epsilon_{rc}})$.

        **Where points go.** $\lambda_0/4$ instead of $\lambda_c/4$. Taking $E_g = E_i$ because "everything is transmitted".
      ` }),
    P({ src: 'Practice L #2(e)–(f) · 8 pts', title: 'Other colors',
      q: md`The coating of (c) and (d) stays the same. **(e) (4 pts)** What fraction of the power is reflected at $\lambda_0 = 300$ nm (ultraviolet)? **(f) (4 pts)** And at $\lambda_0 = 400$ nm (violet)?`,
      parts: [trap(N(md`(e) fraction reflected at 300 nm`, 1 / 9, ''), [[0, md`The coating is a quarter wave only at 600 nm. At 300 nm it is a **half** wave, which repeats the glass's impedance: the coating vanishes.`], [1 / 3, md`That is $|\Gamma|$; the power fraction is $|\Gamma|^2$.`]]),
        trap(N(md`(f) fraction reflected at 400 nm`, 1 / 17, ''), [[1 / 9, md`At 400 nm the coating is $3/8$ of a wavelength, neither a quarter nor a half: it helps partly.`], [Math.sqrt(1 / 17), md`That is $|\Gamma|$. Square it.`]])],
      hints: [md`The coating's electrical length is $\beta_cd = \frac{2\pi\sqrt2}{\lambda_0}\cdot\frac{600}{4\sqrt2} = \frac{\pi}{2}\cdot\frac{600}{\lambda_0}$.`, md`Work in units of $60\pi\ \Omega$: $\eta_0 = 2$, $\eta_c = \sqrt2$, $\eta_g = 1$. Then $Z_{in} = \eta_c\frac{\eta_g + j\eta_c\tan\beta_cd}{\eta_c + j\eta_g\tan\beta_cd}$.`],
      sol: md`
        **1. The electrical length.** The thickness is fixed at $d = \frac{600}{4\sqrt2}$ nm, and $\beta_c = \frac{2\pi\sqrt2}{\lambda_0}$:
        $$\beta_cd = \frac{2\pi\sqrt2}{\lambda_0}\cdot\frac{600}{4\sqrt2} = \frac{\pi}{2}\cdot\frac{600}{\lambda_0}$$

        **(e) 300 nm.** $\beta_cd = \pi$: a half wavelength. A half-wave line repeats its load, $Z_{in} = \eta_g$, as if the coating were not there:
        $$|\Gamma|^2 = \left(\tfrac13\right)^2 = \boxed{\tfrac19}$$
        The coating that kills the reflection at 600 nm does nothing at all at 300 nm.

        **(f) 400 nm.** $\beta_cd = \frac{3\pi}{4}$ and $\tan\frac{3\pi}{4} = -1$. In units of $60\pi\ \Omega$ ($\eta_0 = 2$, $\eta_c = \sqrt2$, $\eta_g = 1$), the input impedance is (the sheet's $Z(d)$, written with the tangent)
        $$z_{in} = \sqrt2\,\frac{1 - j\sqrt2}{\sqrt2 - j}$$
        Multiply top and bottom by $\sqrt2 + j$. The bottom becomes $2 + 1 = 3$. The top:
        $$(1 - j\sqrt2)(\sqrt2 + j) = \sqrt2 + j - 2j + \sqrt2 = 2\sqrt2 - j$$
        So
        $$z_{in} = \frac{\sqrt2(2\sqrt2 - j)}{3} = \frac{4 - j\sqrt2}{3}$$
        Now $\Gamma$ against air ($\eta_0 = 2$). Multiply top and bottom by 3:
        $$\Gamma = \frac{z_{in} - 2}{z_{in} + 2} = \frac{-2 - j\sqrt2}{10 - j\sqrt2}$$
        $$|\Gamma|^2 = \frac{4 + 2}{100 + 2} = \frac{6}{102} = \boxed{\tfrac{1}{17} \approx 5.9\%}$$
        About half of the bare glass's 11%.

        [[fig:r]]

        !!intuition Does this make sense?
          The reflection is zero at $f_0$ (600 nm), climbs back to the bare value $\tfrac19$ at $2f_0$ (300 nm), and is zero again at $3f_0$ (200 nm), where the coating is three quarter waves. A single-layer coating works well only near its design color: that is why coated lenses look purple, since they still reflect the two ends of the spectrum.

        **Speed path.** $\beta_cd = \frac\pi2\cdot\frac{\lambda_{\text{design}}}{\lambda_0}$. A half wave means "no coating"; anything else, compute $Z_{in}$ in units of the smallest $\eta$.

        **Where points go.** Assuming the coating works at every color. Arithmetic with $\sqrt2$: keep it symbolic until $|\Gamma|^2$.
      `,
      figs: { r: { svg: figL2sol(), cap: 'Fraction of power reflected by the coated glass against frequency (f₀ ↔ 600 nm). Dashed: bare glass, 1/9. The dots are 600, 400 and 300 nm.' } } }),

    // ---------------------------------------------------------------- L Problem 3
    RF(md`
      ### Problem 3 (22 points): a charged line, shorted at t = 0

      A lossless line, $Z_0 = 50\ \Omega$, length 300 m, $v = 1.5\times10^8$ m/s $= 150$ m/µs, has been charged to $V_0 = 10$ V and left with its far end ($z = 300$ m) open: for $t < 0$, $V = 10$ V and $I = 0$ everywhere. At $t = 0$ a switch shorts the near end, $z = 0$. There is no source.

      [[fig:ckt]]

      **A tool you will need.** By superposition, the charged line plus a closing switch is the same as an uncharged line driven at $z = 0$ by a source $-10u(t)$ V with zero internal resistance, **added** to the constant 10 V everywhere. (At $z = 0$ the sum is $10 - 10 = 0$: the short.)
    `, { ckt: { svg: figL3(), cap: 'Charged to 10 V, open at the far end. One trip takes 2 µs.' } }),
    P({ src: 'Practice L #3(a) · 4 pts', title: 'The first wave',
      q: md`**(a) (4 pts)** Find the voltage and the current of the wave launched at $t = 0$ (current counted along $+z$).`,
      parts: [trap(N(md`$V^+$ (V)`, -10, 'V'), [[-5, md`That uses $\tau_g = \tfrac12$. The equivalent source has zero resistance: $\tau_g = Z_0/(0 + Z_0) = 1$.`], [10, md`The wave **removes** the charge: it brings the voltage from 10 V down to 0, so it is $-10$ V.`]]),
        trap(N(md`$I^+$ (A)`, -0.2, 'A'), [[0.2, md`$I^+ = V^+/Z_0 = -10/50$: the current flows toward $-z$, into the short.`]])],
      hints: [md`In the equivalent circuit the source is $-10u(t)$ with $R_g = 0$: $\tau_g = 1$.`],
      sol: md`
        **1. The equivalent circuit.** $\tau_g = \frac{Z_0}{R_g + Z_0} = 1$ with $R_g = 0$, so the source launches all of $-10$ V:
        $$\boxed{V^+ = -10\ \text{V}}$$
        Behind its front the line voltage is $10 - 10 = 0$: the front carries the news of the short.
        **2. Its current.** A forward wave has $I^+ = V^+/Z_0$:
        $$\boxed{I^+ = \frac{-10}{50} = -0.2\ \text{A}}$$
        Negative: charge drains backward, toward the short.

        **Speed path.** The wave is $-V_0$, the current $-V_0/Z_0$.

        **Where points go.** Halving it (there is no source resistor). The sign of the current.
      ` }),
    P({ src: 'Practice L #3(b) · 6 pts', title: 'The voltage at the open end',
      q: md`**(b) (6 pts)** Sketch $V(300\ \text{m}, t)$ for $0 < t < 12$ µs and pick the matching plot. Then give its period.

[[fig:c]]`,
      figs: { c: { svg: figL3b(), cap: 'Candidates for V(300 m, t), in V; t in µs.' }, s: { svg: figL3sol(), cap: '' }, bd: { svg: TL.diagram(sL3, { tMax: 8.5, w: 360, h: 320, coeffs: true }), cap: 'Bounce diagram of the equivalent circuit (add 10 V to every sum): $\\Gamma_g = -1$ at the short, $\\Gamma_L = +1$ at the open end.' } },
      parts: [mc('The waveform is', PLOTS, 1,
        [md`That is a line that discharges into a **matched** resistor. A short reflects with $\Gamma = -1$: the energy keeps bouncing.`, null, md`That has period 4 µs, one round trip. The wave must make **two** round trips to return to its starting state: the short flips its sign each time.`, md`That is the waveform at the middle of the line, $z = 150$ m. At the open end the arriving wave and its reflection come together, so the voltage jumps by twice the wave.`], true),
        trap(N(md`period (µs)`, 8, 'µs'), [[4, md`After one round trip (4 µs) the voltage is $-10$ V, not 10 V. It takes two round trips to repeat.`]])],
      hints: [md`The first wave ($-10$ V) reaches the open end at 2 µs and reflects with $+1$: the open end jumps by $-20$ V. It reflects off the short with $-1$, comes back as $+10$ V, and arrives at 6 µs.`],
      sol: md`
        **1. Follow the waves** (equivalent circuit, then add 10 V):
        - $0 < t < 2$ µs: nothing has reached the far end. $V = 10$ V there.
        - $t = 2$ µs: $-10$ V arrives and reflects as $-10$ V ($\Gamma = +1$, open). Both appear at once: $V = 10 - 10 - 10 = -10$ V.
        - $t = 4$ µs: the reflected $-10$ V reaches the short and reflects as $+10$ V ($\Gamma = -1$).
        - $t = 6$ µs: $+10$ V arrives at the open end with its $+10$ V reflection: $V = -10 + 20 = +10$ V.

        So $V(300, t)$ is a square wave between $+10$ and $-10$ V, switching at 2, 6, 10 µs, ...: **Plot B**.

        **2. Period.** Two round trips:
        $$T_{\text{osc}} = 4\cdot\frac{l}{v} = 4(2\ \mu\text{s}) = \boxed{8\ \mu\text{s}}$$

        [[fig:bd]]

        [[fig:s]]

        !!intuition Does this make sense?
          The short flips each wave's sign, the open end keeps it. A wave needs two round trips (two flips) to come back unchanged. The line never discharges: with no resistor anywhere, the energy just sloshes back and forth.

        **Speed path.** Short-open line: period $4l/v$, a square wave of $\pm V_0$ at the open end.

        **Where points go.** Period $2l/v$. Forgetting that the open end sees the arriving wave **and** its reflection.
      ` }),
    P({ src: 'Practice L #3(c) · 4 pts', title: 'Which frequencies ring?',
      q: md`**(c) (4 pts)** Find the lowest frequency in the oscillation, and say which others are present.`,
      parts: [trap(N(md`lowest frequency (kHz)`, 125, 'kHz'), [[250, md`That is $v/2l$, the lowest resonance of a line with the **same** kind of end at both sides. Short-open: $v/4l$.`]]),
        mc('The other frequencies present are', [md`odd multiples only: 375, 625, 875 kHz, ...`, md`all multiples: 250, 375, 500 kHz, ...`, md`none: the oscillation is a pure sinusoid`, md`even multiples only: 250, 500 kHz, ...`], 0,
          [null, md`The even multiples would need $l$ to be a whole number of half wavelengths, which fits a short-short or open-open line, not this one.`, md`A square wave is not a sinusoid; its Fourier series has many terms.`, md`Those do not fit a short at one end and an open at the other.`])],
      hints: [md`A short at one end and an open at the other resonate when $l$ is an odd number of quarter wavelengths. Or: the period is 8 µs.`],
      sol: md`
        **1. From the period.** $f_1 = 1/(8\ \mu\text{s}) = \boxed{125\ \text{kHz}}$.

        **2. From the resonances.** A short at $z = 0$ and an open at $z = l$ allow standing waves with $l = (2n - 1)\lambda/4$, that is
        $$f_n = (2n - 1)\frac{v}{4l} = (2n - 1)\frac{1.5\times10^8}{1200} = (2n - 1)\,125\ \text{kHz}$$
        So the line can only ring at 125, 375, 625 kHz, ...: the **odd** multiples. A square wave is exactly a sum of odd harmonics,
        $$\frac{4V_0}{\pi}\left[\cos\omega_1t - \tfrac13\cos3\omega_1t + \tfrac15\cos5\omega_1t - \dots\right]$$
        (at the open end, with $t$ measured from the middle of a $+10$ V stretch), so the time picture and the resonance picture agree.

        **Speed path.** Short-open: $v/4l$ and its odd multiples.

        **Where points go.** $v/2l$. Including even harmonics.
      ` }),
    P({ src: 'Practice L #3(d) · 4 pts', title: 'Where the energy went',
      q: md`**(d) (4 pts)** At $t = 2$ µs (the instant the first wave reaches the open end), find the current on the line, and the total energy stored in the line.`,
      parts: [N(md`$I$ at $t = 2$ µs (A)`, -0.2, 'A'), trap(N(md`stored energy (µJ)`, 2, 'µJ'), [[0, md`The voltage is zero everywhere, but the current is not: the energy is all **magnetic** now.`], [4, md`$\tfrac12\mathcal Ll\,I^2$ with $\mathcal L = Z_0/v$: check the $\tfrac12$.`]])],
      hints: [md`Behind the first front, $V = 10 - 10 = 0$ and $I = -0.2$ A. At 2 µs the front has covered the whole line.`, md`$\mathcal C = \frac{1}{Z_0v}$ and $\mathcal L = \frac{Z_0}{v}$. Compare $\tfrac12\mathcal Cl V_0^2$ at $t = 0$ with $\tfrac12\mathcal Ll I^2$ at 2 µs.`],
      sol: md`
        **1. The state at 2 µs.** The first front has just covered the line. Everywhere behind it, $V = 10 - 10 = 0$ and $I = \boxed{-0.2\ \text{A}}$.

        **2. The per-meter L and C.** From $Z_0 = \sqrt{\mathcal L/\mathcal C}$ and $v = 1/\sqrt{\mathcal L\mathcal C}$:
        $$\mathcal C = \frac{1}{Z_0v} = \frac{1}{(50)(1.5\times10^8)} = \frac{4}{3}\times10^{-10}\ \text{F/m}$$
        $$\mathcal L = \frac{Z_0}{v} = \frac{50}{1.5\times10^8} = \frac13\times10^{-6}\ \text{H/m}$$
        **3. Energy before (all electric).**
        $$W_e = \tfrac12\mathcal Cl\,V_0^2 = \tfrac12\cdot\tfrac43\times10^{-10}\cdot300\cdot100 = 2\times10^{-6}\ \text{J}$$
        **4. Energy at 2 µs (all magnetic).**
        $$W_m = \tfrac12\mathcal Ll\,I^2 = \tfrac12\cdot\tfrac13\times10^{-6}\cdot300\cdot0.04 = 2\times10^{-6}\ \text{J}$$
        $$\boxed{W = 2\ \mu\text{J}}$$
        Nothing was lost: the charge's electric energy became the current's magnetic energy.

        !!intuition Does this make sense?
          It is an LC circuit, spread out: every quarter period (2 µs) the energy swaps between $\mathbf E$ and $\mathbf H$. That is the same sloshing as in a lumped LC tank, with the line's travel time playing the part of $\sqrt{LC}$.

        **Speed path.** $W = \tfrac12\mathcal ClV_0^2$ with $\mathcal C = 1/(Z_0v)$; the energy is conserved, so no second computation is needed.

        **Where points go.** "Voltage zero, so energy zero."
      ` }),
    P({ src: 'Practice L #3(e) · 4 pts', title: 'A resistor instead of a short',
      q: md`**(e) (4 pts)** Recharge the line to 10 V and close the switch through a resistor $R = Z_0 = 50\ \Omega$ instead of a short. Find the voltage across $R$ just after $t = 0$, and how long it lasts.`,
      parts: [trap(N(md`$V_R$ (V)`, 5, 'V'), [[10, md`With a resistor $Z_0$ in the switch, $\tau_g = \tfrac12$: the wave is $-5$ V, and the line next to $R$ drops only to 5 V.`]]),
        trap(N(md`duration (µs)`, 4, 'µs'), [[2, md`The far end reflects the $-5$ V wave, and it must come back to $z = 0$ before the voltage there changes: a round trip, 4 µs.`]])],
      hints: [md`Equivalent circuit: $-10u(t)$ with $R_g = 50 = Z_0$: $\tau_g = \tfrac12$ and $\Gamma_g = 0$.`],
      sol: md`
        **1. The launch.** $\tau_g = \frac{50}{50 + 50} = \tfrac12$: the wave is $-5$ V, and at $z = 0$
        $$V_R = 10 - 5 = \boxed{5\ \text{V}}$$
        **2. When it ends.** The $-5$ V wave reflects off the open end ($+1$) and returns at $t = 4$ µs, making $V = 10 - 5 - 5 = 0$. At the resistor $\Gamma_g = 0$: nothing reflects, and the line is now fully discharged.
        $$\boxed{\text{a 5 V pulse lasting } 2l/v = 4\ \mu\text{s}}$$

        [[fig:r]]

        **3. Energy check.** $\frac{5^2}{50}(4\times10^{-6}) = 2\times10^{-6}$ J, all of the stored 2 µJ ✓.

        !!intuition Does this make sense?
          This is a **pulse-forming line**: charge a cable, dump it into a matched resistor, and you get a clean rectangular pulse of $V_0/2$ lasting one round trip. Radar transmitters make their pulses this way.

        **Speed path.** Matched discharge: $V_0/2$ for $2l/v$.

        **Where points go.** 10 V (forgetting the divider). 2 µs (one way, not round trip).
      `,
      figs: { r: { svg: figL3R(), cap: 'Voltage across R = Z₀: one clean pulse of 5 V for 4 µs, then nothing.' } } }),

    // ---------------------------------------------------------------- L Problem 4
    RF(md`
      ### Problem 4 (26 points): an impulse on two lines with different speeds

      At $t = 0$ a source with internal resistance $150\ \Omega$ fires an impulse $80\,\delta(t)$ V (weight 80 V·µs). Section 1 is an air line: $Z_{01} = 50\ \Omega$, 300 m, $v_1 = c = 300$ m/µs. Section 2 is filled with a nonmagnetic dielectric: $Z_{02} = 150\ \Omega$, 450 m, $v_2 = c/2 = 150$ m/µs. The end of section 2 ($z = 750$ m) is open. A probe sits at $z = 525$ m, the middle of section 2. "Weight" means the area of an impulse, in V·µs.

      [[fig:ckt]]
    `, { ckt: { svg: figL4(), cap: 'Section 1 takes 1 µs, section 2 takes 3 µs. The probe is 1.5 µs from each end of section 2.' } }),
    P({ src: 'Practice L #4(a) · 6 pts', title: 'All the coefficients',
      q: md`**(a) (6 pts)** Find $\tau_g$ and $\Gamma_g$; at the junction, $\Gamma_{12}$ and $\tau_{12} = 1 + \Gamma_{12}$ for a wave arriving from section 1, and $\Gamma_{21}$ for a wave arriving from section 2.`,
      parts: [N(md`$\tau_g$`, 0.25, ''), trap(N(md`$\Gamma_g$`, 0.5, ''), [[-0.5, md`$R_g = 150 > Z_{01} = 50$: positive.`]]), N(md`$\Gamma_{12}$`, 0.5, ''), trap(N(md`$\tau_{12}$`, 1.5, ''), [[0.5, md`That is $1 - \Gamma_{12}$, or the coefficient for the other direction. Going from 50 Ω into 150 Ω, the voltage **grows**: $1 + \tfrac12$.`]]),
        trap(N(md`$\Gamma_{21}$`, -0.5, ''), [[0.5, md`From section 2 the wave sees 50 Ω ahead and is in 150 Ω: $(50 - 150)/(50 + 150)$.`]])],
      hints: [md`At the junction, "ahead minus here over ahead plus here".`],
      sol: md`
        **1. The source end.**
        $$\tau_g = \frac{50}{150 + 50} = \boxed{\tfrac14}, \qquad \Gamma_g = \frac{150 - 50}{150 + 50} = \boxed{\tfrac12}$$
        **2. The junction, from the left** (50 Ω here, 150 Ω ahead):
        $$\Gamma_{12} = \frac{150 - 50}{150 + 50} = \boxed{\tfrac12}, \qquad \tau_{12} = 1 + \Gamma_{12} = \boxed{\tfrac32}$$
        **3. From the right** (150 Ω here, 50 Ω ahead):
        $$\Gamma_{21} = \frac{50 - 150}{200} = \boxed{-\tfrac12}, \qquad \tau_{21} = \tfrac12$$
        A transmission coefficient bigger than 1 is fine: voltage can grow into a higher impedance; the **power** split still adds up ($\Gamma_{12}^2 + \tau_{12}^2\frac{Z_{01}}{Z_{02}} = \tfrac14 + \tfrac94\cdot\tfrac13 = 1$ ✓).

        **Speed path.** Five fractions with denominator 200.

        **Where points go.** The sign of $\Gamma_g$; mixing up the two directions at the junction.
      ` }),
    P({ src: 'Practice L #4(b)–(c) · 11 pts', title: 'The first arrivals at the probe',
      q: md`**(b) (5 pts)** Find $\epsilon_r$ of section 2, and the time and weight of the first impulse at the probe. **(c) (6 pts)** Find the time and weight of the second and third impulses at the probe.`,
      parts: [N(md`(b) $\epsilon_r$`, 4, ''), N(md`(b) first time (µs)`, 2.5, 'µs'), trap(N(md`(b) first weight (V·µs)`, 30, ''), [[20, md`That is the wave in section 1. Crossing the junction multiplies it by $\tau_{12} = \tfrac32$.`], [80, md`Only $\tau_g = \tfrac14$ of the impulse enters the line.`]]),
        trap(N(md`(c) second time (µs)`, 4.5, 'µs'), [[5.5, md`That is the reflection from the open end. Earlier, a wave that bounced junction → source → junction got into section 2 at 3 µs.`]]),
        trap(N(md`(c) second weight (V·µs)`, 7.5, ''), [[5, md`That is the wave arriving at the junction; it is multiplied by $\tau_{12} = \tfrac32$ on the way in.`]]),
        N(md`(c) third time (µs)`, 5.5, 'µs'), trap(N(md`(c) third weight (V·µs)`, 30, ''), [[60, md`60 is what the **open end** sees (incident plus reflected at the same instant). Back at the probe the reflected wave passes alone.`]])],
      hints: [md`Section 1 takes 1 µs. From the junction the probe is 225 m, 1.5 µs, away; from the open end too.`, md`Two paths reach the probe early: (1) the open-end reflection of the first wave; (2) the first junction reflection, bounced off the source and back through the junction.`],
      sol: md`
        **(b) The medium.** $v_2 = c/2$ and $\mu = \mu_0$, so $\epsilon_r = (c/v_2)^2 = \boxed{4}$.

        **The first impulse.** The source launches $\tau_g\cdot80 = 20$; it reaches the junction at 1 µs, where $\tau_{12}\cdot20 = 30$ enters section 2. It needs 1.5 µs more to reach the probe:
        $$\boxed{t = 2.5\ \mu\text{s},\ \text{weight } 30}$$

        **(c) Every path, in time order.**
        - At 1 µs the junction also reflects $\Gamma_{12}\cdot20 = 10$ back toward the source; it arrives at 2 µs and reflects as $\Gamma_g\cdot10 = 5$; that reaches the junction at 3 µs and enters as $\tfrac32\cdot5 = 7.5$, passing the probe at $3 + 1.5$:
        $$\boxed{t = 4.5\ \mu\text{s},\ \text{weight } 7.5}$$
        - The first 30 reaches the open end at $1 + 3 = 4$ µs, reflects with $+1$, and passes the probe on its way back at $4 + 1.5$:
        $$\boxed{t = 5.5\ \mu\text{s},\ \text{weight } 30}$$

        [[fig:bd]]

        **Speed path.** List the delays: section 1 is 1 µs, junction to probe 1.5 µs, probe to end 1.5 µs. Each path's weight is a product of coefficients.

        **Where points go.** Forgetting the path through the source. Using 60 at the probe.
      `,
      figs: { bd: { svg: TL.diagram(sL4, { tMax: 9, w: 400, h: 470, unit: '', probe: 525 }), cap: 'Bounce diagram for the impulse (weights in V·µs). The dots on the dashed line are the arrivals at the probe, z = 525 m.' } } }),
    P({ src: 'Practice L #4(d)–(e) · 9 pts', title: 'A merged impulse, and the open end',
      q: md`**(d) (5 pts)** The first **negative** impulse at the probe: when, and with what total weight? **(e) (4 pts)** What does a probe at the open end ($z = 750$ m) record first, and when?`,
      parts: [N(md`(d) time (µs)`, 8.5, 'µs'), trap(N(md`(d) total weight (V·µs)`, -465 / 32, ''), [[-15, md`At 8.5 µs a second, small impulse arrives too: the third trip through the source, $+\tfrac{15}{32}$. They add.`], [15, md`The junction reflects a wave coming from section 2 with $\Gamma_{21} = -\tfrac12$: the sign flips.`]]),
        N(md`(e) time (µs)`, 4, 'µs'), trap(N(md`(e) weight (V·µs)`, 60, ''), [[30, md`At an open end the arriving wave and its reflection are there at the same instant: $30(1 + \Gamma_L) = 60$.`]])],
      hints: [md`The 30 coming back from the open end reaches the junction at 7 µs and reflects with $\Gamma_{21} = -\tfrac12$. It reaches the probe 1.5 µs later. Is anything else arriving at that moment?`, md`The source keeps feeding small waves into section 2 every 2 µs: 7.5 at 4.5 µs, then $\tfrac{15}{8}$ at 6.5 µs, then $\tfrac{15}{32}$ at 8.5 µs.`],
      sol: md`
        **(d) Where a minus sign can come from.** The only negative coefficient is $\Gamma_{21} = -\tfrac12$. The first wave to use it is the 30 returning from the open end: it reaches the junction at $5.5 + 1.5 = 7$ µs and reflects as $-15$, which passes the probe at $7 + 1.5 = 8.5$ µs.

        **Something else arrives at 8.5 µs.** The waves that bounce between the source and the junction enter section 2 every 2 µs, each a quarter of the one before ($\Gamma_g\Gamma_{12} = \tfrac14$): $7.5$ at 4.5 µs, $\tfrac{15}{8}$ at 6.5 µs, $\tfrac{15}{32}$ at 8.5 µs. The probe cannot tell two impulses at the same instant apart; it records their sum:
        $$-15 + \frac{15}{32} = -\frac{480}{32} + \frac{15}{32}$$
        $$\boxed{t = 8.5\ \mu\text{s},\ \text{weight } -\tfrac{465}{32} \approx -14.5\ \text{V}\cdot\mu\text{s}}$$
        (For completeness: 7.5 µs brings $+7.5$, the open-end reflection of the 4.5 µs impulse.)

        [[fig:tr]]

        **(e) The open end.** The first 30 arrives at $1 + 3 = 4$ µs, and the open end ($\Gamma = +1$) sends back 30 at the same instant:
        $$\boxed{t = 4\ \mu\text{s},\ \text{weight } 60}$$

        !!intuition Does this make sense?
          The probe's record is a sum over paths, sorted by arrival time. With different speeds, paths of different shapes can tie: here a path with three trips through the source ties with one that went to the open end and back. Ties are where exams hide points.

        **Speed path.** Times first (a table of delays), weights second. Check every arrival time for ties.

        **Where points go.** Missing the tie at 8.5 µs. Using 30 at the open end.
      `,
      figs: { tr: { svg: figL4trace(), cap: 'What the probe at z = 525 m records up to 9 µs (weights in V·µs). The last impulse is two arrivals merged.' } } }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-l', order: 12, title: 'Practice exam L', kind: 'mock', sub: '75 min · 100 pts · the hardest: a measured wave in an unknown medium, a quarter-wave coating on glass, a charged line shorted at t = 0, an impulse on two lines with different speeds', steps: examL });
})();

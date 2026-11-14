/* Exam 3 practice exams G, H, I (unit e3-prac).
   G and H keep Prof. Chen's Spring 2024 format: four problems cut into short parts, clean numbers, one trap part.
     e3-prac-g: a lossy wave read off a snapshot; an elliptical wave from one sheet (trap: the other side's hand);
                a stub filter; voltage and current bounce diagrams.
     e3-prac-h: seawater and a submarine at two frequencies (trap: the good-conductor formula at 10 GHz); two sheets a
                quarter wave apart; a quarter-wave section plus a shunt stub; two lines with a resistor across the junction.
   I keeps the Fall 2023 format: seven questions, "circle all that apply" statements (one True/False part each), TL
     questions with numeric choices, then worked problems (trap: the handedness of a wave going toward -z).
   Every number was recomputed in Python; every bounce value is read from TL.valueAt (or the junction solver below). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;

  // ---------------------------------------------------------------- helpers
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  // one statement of a "circle all that apply" question
  const tf = (lbl, truth, whyWrong) => ({ lbl, mc: ['True', 'False'], a: truth ? 0 : 1, why: truth ? [null, whyWrong] : [whyWrong, null], fixed: true });
  const trap = (part, list) => Object.assign(part, { traps: list.map(([v, msg]) => ({ v, msg })) });
  const plot = (o) => PF.plot(Object.assign({ w: 360, h: 200 }, o));

  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 30) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // A transmission-line circuit on two rails, drawn left to right. Items:
  //   { t: 'gen', R, V }  source branch     { t: 'line', w, lab, sub }  a line section (thick rails)
  //   { t: 'wire', w }    plain wires        { t: 'R', lab } / { t: 'C', lab }  an element across the rails
  //   { t: 'short' } { t: 'open' } { t: 'end', lab }  how the last section ends
  // o.ticks = [[item index, 'TeX', frac], ...] puts position marks under those items: the start of a line section (or a
  // fraction frac of the way along it), or the element itself for R and C.
  function circuit(items, o = {}) {
    const g = PF.fig({ alt: o.alt });
    const T = 30, B = 112, M = (T + B) / 2;
    const rail = (a, b) => { g.line(a, T, b, T); g.line(a, B, b, B); };
    let x = 70;
    const at = [], wid = [];
    items.forEach((it, k) => {
      at.push(x); wid.push(it.w || 0);
      if (it.t === 'R' || it.t === 'C') at[k] = x + 18;
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
      } else if (it.t === 'R' || it.t === 'C') {
        rail(x, x + 18); x += 18;
        if (it.t === 'R') zig(g, x, T, x, B, 32);
        else {
          g.line(x, T, x, M - 4); g.line(x - 11, M - 4, x + 11, M - 4); g.line(x - 11, M + 4, x + 11, M + 4); g.line(x, M + 4, x, B);
        }
        g.dot(x, T, 2.4); g.dot(x, B, 2.4);
        if (it.lab) g.label(x + (it.left ? -10 : 10), M, it.lab, it.left ? 'r' : 'l', 'small');
        if (!it.last) { rail(x, x + 18); x += 18; }
      } else if (it.t === 'short') {
        g.line(x, T, x, B, { cls: 'thick' });
        if (it.lab) g.label(x + 8, M, it.lab, 'l', 'small');
      } else if (it.t === 'open') {
        g.circle(x + 3, T, 3, { cls: 'bgfill' }); g.circle(x + 3, B, 3, { cls: 'bgfill' });
        g.label(x + 10, M, it.lab || '\\text{open}', 'l', 'small');
      } else if (it.t === 'end') {
        g.line(x, T, x, B, { cls: 'dash dim' });
        g.label(x + 8, M, it.lab, 'l', 'small');
      }
    });
    at.push(x);
    if (o.ticks) {
      const y = B + 24, xOf = ([k, , fr]) => at[k] + (fr || 0) * wid[k], xs = o.ticks.map(xOf);
      g.line(Math.min(...xs) - 6, y, Math.max(...xs) + 16, y, { cls: 'dim', arrow: 'end', hs: 6 });
      g.label(Math.max(...xs) + 20, y, 'z', 'l', 'small accent');
      o.ticks.forEach((tk) => { const tx = xOf(tk); g.line(tx, y - 4, tx, y + 4, { cls: 'dim' }); g.label(tx, y + 7, tk[1], 't', 'small'); });
    }
    return g.svg();
  }

  // A two-section line with a resistor Rsh across the junction (TL.solve has no shunt element). Same shape as the object
  // TL.solve returns, so TL.diagram, TL.valueAt, TL.plotT and TL.plotZ all work on it.
  function solveShunt(o) {
    const secs = o.sections.map((x) => ({ Z0: x.Z0, len: x.len, v: x.v, T: x.len / x.v }));
    let z = 0;
    secs.forEach((x) => { x.zL = z; z += x.len; x.zR = z; });
    const par = (a, b) => (a * b) / (a + b);
    const [A, Bs] = secs;
    const fwd = (par(o.Rsh, Bs.Z0) - A.Z0) / (par(o.Rsh, Bs.Z0) + A.Z0);
    const back = (par(o.Rsh, A.Z0) - Bs.Z0) / (par(o.Rsh, A.Z0) + Bs.Z0);
    const junctions = [{ z: A.zR, fwd, back, tauF: 1 + fwd, tauB: 1 + back }];
    const Vg = o.Vg, Rg = o.Rg, RL = o.RL, tMax = o.tMax;
    const tauG = A.Z0 / (Rg + A.Z0), GammaG = (Rg - A.Z0) / (Rg + A.Z0);
    const GammaL = RL === Infinity ? 1 : (RL - Bs.Z0) / (RL + Bs.Z0);
    const segs = [], queue = [{ k: 0, dir: 1, amp: tauG * Vg, t0: 0, gen: 0 }];
    let guard = 0;
    while (queue.length && guard++ < 4000) {
      queue.sort((p, q) => p.t0 - q.t0);
      const w = queue.shift();
      if (w.t0 >= tMax - 1e-12 || Math.abs(w.amp) < 1e-12 * Math.abs(Vg)) continue;
      const s = secs[w.k], zA = w.dir > 0 ? s.zL : s.zR, zB = w.dir > 0 ? s.zR : s.zL, tB = w.t0 + s.T;
      segs.push({ k: w.k, dir: w.dir, v: w.amp, i: (w.dir * w.amp) / s.Z0, zA, zB, tA: w.t0, tB, speed: s.v, gen: w.gen });
      const nx = (k, dir, amp) => queue.push({ k, dir, amp, t0: tB, gen: w.gen + 1 });
      if (w.k === 0 && w.dir > 0) { if (fwd !== 0) nx(0, -1, w.amp * fwd); nx(1, 1, w.amp * (1 + fwd)); }
      else if (w.k === 0) { if (GammaG !== 0) nx(0, 1, w.amp * GammaG); }
      else if (w.dir > 0) { if (GammaL !== 0) nx(1, -1, w.amp * GammaL); }
      else { if (back !== 0) nx(1, 1, w.amp * back); nx(0, -1, w.amp * (1 + back)); }
    }
    const Req = RL === Infinity ? o.Rsh : par(o.Rsh, RL), Vdc = (Vg * Req) / (Rg + Req);
    return { Vg, Rg, RL, secs, total: A.T + Bs.T, tMax, tauG, GammaG, GammaL, junctions, segs, T: secs.map((x) => x.T), len: Bs.zR, dc: { V: Vdc, I: RL === Infinity ? 0 : Vdc / RL } };
  }

  // the header every paper shares
  const RULES = md`**75 minutes, 100 points.** Closed book, **no calculator**. You may use the official [formula sheet](#/l/e3-sheet) and one 4″×6″ card of your own handwritten notes. Show your reasoning, box each answer, and give its units.`;
  const HOWTO = md`**How to use this paper.** Set a 75-minute timer and work it on paper first, as if it were Monday night. Then type your answers into the boxes. Open a hint only for a part you could not start. Read every worked solution, including the parts you got right: each one ends with a **speed path** (how to get the answer in well under a minute) and **where points go** (the slips that cost points on this kind of part). The next day, redo every part you missed on a blank sheet.`;
  const CONSTS = md`**Constants.** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$. Answers within about 2% count. You can type <code>pi</code> for $\pi$, and arithmetic like <code>1/60</code>.`;

  // ======================================================================================== EXAM G: figures
  const G1_A = PI / 2, G1_B = PI;
  const figG1 = () => plot({
    w: 380, h: 220, x: [0, 2.7], y: [-10.8, 11.5], zero: true, xl: 'z\\,(\\text{m})', yl: 'E_x(z,0)\\ (\\text{V/m})',
    xt: [[0.5, '0.5'], [1, '1'], [1.5, '1.5'], [2, '2'], [2.5, '2.5']], yt: [[10, '10'], [-10, '-10']],
    curves: [
      { f: (z) => 10 * Math.exp(-G1_A * z) * Math.cos(G1_B * z), n: 500 },
      { f: (z) => 10 * Math.exp(-G1_A * z), cls: 'dash dim' },
      { f: (z) => -10 * Math.exp(-G1_A * z), cls: 'dash dim' },
    ],
    pts: [{ x: 1, y: -10 * Math.exp(-G1_A), lab: '-10e^{-\\pi/2}', anchor: 'tl' }],
  });
  // G2: the sheet, side view
  function figG2() {
    const g = PF.fig({ alt: 'side view: the z axis runs to the right, x up; a current sheet stands in the plane z = 0, drawn dashed; an arrow to the right labeled with the given field for z > 0; an arrow to the left marked z < 0, unknown' });
    g.arrow(30, 110, 330, 110, { cls: 'dim', hs: 6 }); g.label(334, 110, 'z', 'l', 'small accent');
    g.arrow(180, 160, 180, 30, { cls: 'dim', hs: 6 }); g.label(184, 32, 'x', 'bl', 'small accent');
    g.sheet(180, 44, 170);
    g.label(186, 150, '\\mathbf J_s(t)', 'l', 'small');
    g.label(180, 176, 'z = 0', 't', 'small');
    g.arrow(214, 72, 300, 72, { hs: 7 }); g.label(257, 64, 'z > 0:\\ \\mathbf E\\text{ given}', 'b', 'small');
    g.arrow(146, 72, 60, 72, { hs: 7 }); g.label(103, 64, 'z < 0:\\ ?', 'b', 'small');
    return g.svg();
  }
  // G2 solution: the ellipse traced at z = 0+ and z = 0-, seen from +z (x right, y up)
  function ellipsePanel(out) {
    const g = PF.fig({ alt: `the xy-plane seen from +z: an ellipse twice as wide along x as along y; arrows show the tip turning from +x toward +y, counterclockwise on the page; the wave travels ${out ? 'out of the page, toward +z' : 'into the page, toward -z'}` });
    const cx = 110, cy = 90, rx = 76, ry = 38;
    g.arrow(cx - 96, cy, cx + 100, cy, { cls: 'dim', hs: 6 }); g.label(cx + 104, cy, 'x', 'l', 'small accent');
    g.arrow(cx, cy + 62, cx, cy - 64, { cls: 'dim', hs: 6 }); g.label(cx + 4, cy - 64, 'y', 'bl', 'small accent');
    g.ellipse(cx, cy, rx, ry, { cls: 'curve' });
    for (const th of [40, 220]) {
      const t = th * PI / 180;
      g.head(cx + rx * Math.cos(t), cy - ry * Math.sin(t), -rx * Math.sin(t), -ry * Math.cos(t), { hs: 9 });
    }
    g.arrow(cx, cy, cx + rx, cy, { hs: 7 }); g.label(cx + rx - 4, cy + 6, '120\\pi', 'tr', 'small');
    g.label(cx - 6, cy - ry - 4, '60\\pi', 'br', 'small');
    if (out) g.odot(cx - 46, cy + 48, 7); else g.otimes(cx - 46, cy + 48, 7);
    g.label(cx - 36, cy + 48, out ? '\\text{travel } {+z}' : '\\text{travel } {-z}', 'l', 'small');
    return g.svg();
  }
  const figG2sol = () => PF.row([
    { svg: ellipsePanel(true), cap: 'z > 0: tip turns x → y, travel +z. Right hand.' },
    { svg: ellipsePanel(false), cap: 'z < 0: the same turning, travel −z. Left hand.' },
  ]).svg;
  // G3: the filter
  const figG3 = () => circuit([
    { t: 'gen', R: 'R_g = 50\\,\\Omega', V: 'f_0,\\ 2f_0' }, { t: 'wire', w: 14 },
    { t: 'line', w: 112, lab: 'Z_0 = 50\\,\\Omega', sub: '1.25\\,\\text{m}' },
    { t: 'R', lab: '50\\,\\Omega', left: true }, { t: 'wire', w: 6 },
    { t: 'line', w: 76, lab: '\\text{stub}', sub: 'l\\ ?' }, { t: 'end', lab: '\\text{end ?}' },
  ], { alt: 'a source with Rg = 50 ohms feeds a 50-ohm line 1.25 m long; at its end the 50-ohm receiver sits across the line, and a stub of 50-ohm line of unknown length l continues from the same terminals; its far end is shorted or open, to be chosen' });
  const G3t = (f) => Math.tan(PI * f / 200);
  const figG3sol = () => plot({
    w: 380, h: 210, x: [0, 260], y: [0, 1.18], xl: 'f\\,(\\text{MHz})', yl: '\\text{fraction delivered}',
    xt: [[100, '100'], [150, '150'], [200, '200']], yt: [[0.8, '0.8'], [1, '1']],
    curves: [{ f: (f) => { const t = G3t(f); return (4 * t * t) / (1 + 4 * t * t); }, n: 520 }],
    pts: [{ x: 150, y: 0.8 }],
  });
  // G4
  const sG4 = TL.solve({ Vg: 90, Rg: 25, RL: 100, sections: [{ Z0: 50, len: 200, v: 200 }], tMax: 5 });
  const figG4 = () => circuit([
    { t: 'gen', R: 'R_g = 25\\,\\Omega', V: '90u(t)\\,\\text{V}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 130, lab: 'Z_0 = 50\\,\\Omega', sub: 'T = 1\\,\\mu\\text{s}' },
    { t: 'R', lab: 'R_L = 100\\,\\Omega', last: true },
  ], { ticks: [[2, '0'], [3, '200\\,\\text{m}']], alt: 'a step source 90u(t) volts with Rg = 25 ohms drives a 50-ohm line from z = 0 to z = 200 m, ending in RL = 100 ohms' });

  // ======================================================================================== EXAM G
  const examG = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Prof. Chen's Spring 2024 Exam 3 had four problems of 18 to 34 points cut into short parts, numbers that work without a calculator, statements to judge, and one part that tests a concept rather than algebra. This paper has the same shape.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Reading a lossy wave off a snapshot: $\beta$, $\alpha$, the loss tangent, $\epsilon_r$, $\sigma$, $\eta$ | 24 |
      | 2 | An elliptical wave from one current sheet: type, hand, the sheet current, the other side | 24 |
      | 3 | A stub filter: pass $f_0$, block $2f_0$, and what the source sees | 22 |
      | 4 | Voltage and current bounce diagrams, $I(z,t)$ at a point, the load, steady state | 30 |

      **Draws on:** [where γ and η come from](#/l/w2-gamma), [reading a lossy wave](#/l/w2-read), [polarization](#/l/w3-pol), [current-sheet antennas](#/l/w3-antenna), [stubs and filters](#/l/w6-stubs), [launching waves](#/l/w5-launch) and [bounce diagrams](#/l/w5-bounce).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- G Problem 1
    RF(md`
      ### Problem 1 (24 points): read the wave off a snapshot

      A uniform plane wave at $f = 75$ MHz travels along $z$ in a nonmagnetic material ($\mu = \mu_0$) whose $\epsilon$ and $\sigma$ are unknown. Its field is $\mathbf E = \hat x\,E_x(z,t)$. The figure is a snapshot taken at $t = 0$.

      [[fig:snap]]

      - The solid curve is $E_x(z,0)$. It crosses zero at $z = 0.5$, $1.5$ and $2.5$ m.
      - The dashed curves are its envelope. The solid curve touches the envelope at $z = 0$, $1$ and $2$ m.
      - Two values are known exactly: $E_x(0,0) = 10$ V/m and $E_x(1\,\text{m},0) = -10e^{-\pi/2}$ V/m (the dot).

      The wave has the form $E_x = 10\,e^{\mp\alpha z}\cos(\omega t \mp \beta z)$ V/m with $\alpha > 0$ and $\beta > 0$. Part (b) settles the signs.
    `, { snap: { svg: figG1(), cap: 'E_x(z, 0): the solid curve. Dashed: its envelope.' } }),
    P({ src: 'Practice G #1(a) · 4 pts', title: 'β and the phase speed',
      q: md`**(a) (4 pts)** Find $\beta$ and the phase velocity $v_p$.`,
      parts: [trap(N(md`$\beta$ (rad/m)`, PI, 'rad/m'), [[2 * PI, md`That treats the distance between neighbouring zeros (1 m) as a whole wavelength. A cosine crosses zero twice per wavelength.`]]),
        trap(N(md`$v_p$ (m/s)`, 1.5e8, 'm/s'), [[7.5e7, md`That used $\lambda = 1$ m, the spacing of the zeros. The zeros are half a wavelength apart.`], [3e8, md`That is $c$. In a material the wave is slower; compute $\omega/\beta$.`]])],
      hints: [md`At $t = 0$ the field is $10e^{-\alpha z}\cos(\beta z)$. The exponential is never zero, so the zeros are exactly the zeros of $\cos(\beta z)$. How far apart are those?`],
      sol: md`
        **1. What the zeros tell you.** At $t = 0$ either sign choice gives
        $$E_x(z,0) = 10\,e^{\mp\alpha z}\cos(\beta z)$$
        The exponential is never zero. So $E_x = 0$ exactly where $\cos(\beta z) = 0$, that is where $\beta z = \pi/2,\ 3\pi/2,\ 5\pi/2, \dots$ Neighbouring zeros differ by $\pi$ in $\beta z$, which is **half a wavelength** in $z$.

        **2. Read the spacing.** The zeros are 1 m apart ($1.5 - 0.5$). So
        $$\frac{\lambda}{2} = 1\ \text{m} \quad\Rightarrow\quad \lambda = 2\ \text{m}$$
        **3. β.**
        $$\beta = \frac{2\pi}{\lambda} = \frac{2\pi}{2\ \text{m}}$$
        $$\boxed{\beta = \pi\ \text{rad/m} \approx 3.14\ \text{rad/m}}$$
        **4. Phase velocity.** First $\omega$:
        $$\omega = 2\pi f = 2\pi(75\times10^6) = 1.5\pi\times10^8\ \text{rad/s}$$
        Then
        $$v_p = \frac{\omega}{\beta} = \frac{1.5\pi\times10^8}{\pi}$$
        $$\boxed{v_p = 1.5\times10^8\ \text{m/s} = c/2}$$

        !!intuition Does this make sense?
          Two independent checks: $v_p = \lambda f = (2)(75\times10^6) = 1.5\times10^8$ m/s ✓, and it is slower than $c$, as it must be in a material.

        **Speed path.** Zero spacing is $\lambda/2$, so $\lambda = 2$ m; then $v_p = \lambda f$. Ten seconds.

        **Where points go.** Taking the zero spacing as a full wavelength (doubles $\beta$, halves $v_p$). Measuring $\lambda$ between two troughs of the curve: in a decaying wave the peaks and troughs are **not** where $\cos(\beta z) = \pm1$. Here the first trough is at about 0.85 m, not 1 m. The zeros are exact; read them.
      ` }),
    P({ src: 'Practice G #1(b) · 4 pts', title: 'α, and which way it goes',
      q: md`**(b) (4 pts)** Find $\alpha$, and decide which way the wave travels.`,
      parts: [trap(N(md`$\alpha$ (Np/m)`, PI / 2, 'Np/m'), [[2 / PI, md`That is $1/\alpha$, the distance for a $1/e$ drop, in meters. The question asks for $\alpha$ itself.`], [PI, md`$e^{-\alpha(1\,\text{m})} = e^{-\pi/2}$ gives $\alpha = \pi/2$, not $\pi$. That is $\beta$.`]]),
        mc('The wave travels toward', [md`$+z$: the amplitude shrinks as $z$ grows, and a wave shrinks in the direction it travels`, md`$-z$: the field is biggest at $z = 0$, where the source must be`, md`You cannot tell from a single snapshot`, md`Neither: the fixed zeros mean it is a standing wave`], 0,
          [null, md`A wave going toward $-z$ is $10e^{+\alpha z}\cos(\omega t + \beta z)$: it would **grow** toward $+z$. This one shrinks toward $+z$, so it is moving that way, away from its larger values.`,
            md`In a lossless medium that would be true. Here loss breaks the symmetry: the envelope shrinks only along the direction of travel.`,
            md`Every snapshot of every wave has zeros. A standing wave keeps its zeros fixed in time; one snapshot cannot show that. The envelope here decays smoothly, which a single traveling lossy wave does.`])],
      hints: [md`Where the curve touches the envelope, $|\cos(\beta z)| = 1$, so $|E_x|$ equals the amplitude $10e^{-\alpha z}$ exactly. Use the point at $z = 1$ m.`, md`The material can only take energy from a wave. Which way must the wave move so that it shrinks as it goes?`],
      sol: md`
        **1. The envelope.** The amplitude at position $z$ is $A(z) = 10e^{-\alpha z}$ (taking the decaying sign for now). Where the curve touches the envelope, $\cos(\beta z) = \pm1$. At $z = 1$ m, $\beta z = \pi$ and $\cos\pi = -1$, so
        $$E_x(1\,\text{m},0) = -10\,e^{-\alpha(1\,\text{m})}$$
        **2. Match the marked value.**
        $$-10\,e^{-\alpha(1\,\text{m})} = -10\,e^{-\pi/2}$$
        The exponents must be equal:
        $$\boxed{\alpha = \frac{\pi}{2}\ \text{Np/m} \approx 1.57\ \text{Np/m}}$$
        The amplitude falls by $1/e$ every $1/\alpha = 2/\pi \approx 0.64$ m.

        **3. Direction.** A lossy material only takes energy out of a wave, so a wave's amplitude **shrinks in the direction it travels**. This envelope shrinks toward $+z$. So the wave travels toward $+z$:
        $$E_x = 10\,e^{-\alpha z}\cos(\omega t - \beta z)\ \text{V/m}$$
        A wave going toward $-z$ would be $10e^{+\alpha z}\cos(\omega t + \beta z)$, which grows toward $+z$.

        !!intuition Does this make sense?
          In a lossless medium one snapshot cannot tell you the direction: $\cos(\beta z)$ looks the same either way. Loss breaks the tie. The big end of the envelope points back toward the source.

        **Speed path.** $e^{-\alpha\cdot1} = e^{-\pi/2}$, so $\alpha = \pi/2$. Direction: the way the envelope shrinks.

        **Where points go.** Reading the envelope at the trough of the curve (about 0.85 m) instead of at the touching point. Answering $1/\alpha$ when $\alpha$ is asked. Saying "cannot tell".
      ` }),
    P({ src: 'Practice G #1(c) · 6 pts', title: 'The loss tangent from γ',
      q: md`**(c) (6 pts)** Find $\gamma^2$ and the loss tangent $\sigma/\omega\epsilon$. Which approximation (if any) from page 3 of the formula sheet may you use for this material?`,
      parts: [trap(N(md`$\sigma/\omega\epsilon$`, 4 / 3, ''), [[0.75, md`That is upside down: the ratio of the real part to the imaginary part. The loss tangent is $\text{Im}(\gamma^2)$ over $-\text{Re}(\gamma^2)$, conduction over displacement.`], [0.5, md`That is $\alpha/\beta = \tan\tau$. The loss tangent is $\tan 2\tau$.`]]),
        mc('Which approximation applies?', [md`None: $\sigma/\omega\epsilon$ is close to 1, so use the exact $\gamma$ and $\eta$`, md`Good conductor: $\alpha \approx \beta$`, md`Imperfect dielectric: $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$`, md`Perfect dielectric: $\alpha = 0$`], 0,
          [null, md`A good conductor needs $\sigma/\omega\epsilon \gg 1$, and then $\alpha \approx \beta$. Here $\beta = 2\alpha$.`, md`That needs $\sigma/\omega\epsilon \ll 1$. Here the two currents are about equal.`, md`$\alpha = \pi/2$ Np/m is not zero: the envelope decays.`])],
      hints: [md`$\gamma = \alpha + j\beta = \frac{\pi}{2}(1 + j2)$. Square it, and compare with $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon) = -\omega^2\mu\epsilon + j\omega\mu\sigma$.`, md`The ratio of the imaginary part of $\gamma^2$ to minus its real part is $\omega\mu\sigma/\omega^2\mu\epsilon = \sigma/\omega\epsilon$.`],
      sol: md`
        **1. Write γ.** From (a) and (b):
        $$\gamma = \alpha + j\beta = \frac{\pi}{2} + j\pi = \frac{\pi}{2}(1 + j2)\ \text{m}^{-1}$$
        **2. Square it.** First the bracket:
        $$(1 + j2)^2 = 1 + j4 + (j2)^2 = 1 + j4 - 4$$
        $$(1 + j2)^2 = -3 + j4$$
        So
        $$\gamma^2 = \frac{\pi^2}{4}(-3 + j4)\ \text{m}^{-2}$$
        **3. What γ² is made of.** From [Topic 5](#/l/w2-gamma), $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$. Multiply it out; $j\cdot j = -1$:
        $$\gamma^2 = -\omega^2\mu\epsilon + j\omega\mu\sigma$$
        The real part is the displacement current's, the imaginary part the conduction current's. Match the parts:
        $$\omega^2\mu\epsilon = \frac{3\pi^2}{4},\qquad \omega\mu\sigma = \frac{4\pi^2}{4} = \pi^2$$
        **4. Divide** the second by the first. $\omega\mu$ cancels:
        $$\frac{\omega\mu\sigma}{\omega^2\mu\epsilon} = \frac{\sigma}{\omega\epsilon}$$
        $$\frac{\sigma}{\omega\epsilon} = \frac{4\pi^2/4}{3\pi^2/4}$$
        $$\boxed{\frac{\sigma}{\omega\epsilon} = \frac43 \approx 1.33}$$
        **5. Regime.** $4/3$ is neither much smaller nor much larger than 1: the conduction current is only a third bigger than the displacement current. None of the page-3 approximations holds. Use the exact formulas, which is what parts (d) and (e) do.

        !!intuition Does this make sense?
          The angle of $\gamma$ is $\tan^{-1}(\beta/\alpha) = \tan^{-1}2 \approx 63.4°$, so $\tau = 90° - 63.4° = 26.6°$. The sheet says $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon) = \tfrac12\tan^{-1}(4/3) = \tfrac12(53.1°) = 26.6°$ ✓.

        **Speed path.** Loss tangent $= \text{Im}(\gamma^2)/(-\text{Re}\,\gamma^2)$. Or in one line: $\tan\tau = \alpha/\beta = 1/2$, and $\tan2\tau = \dfrac{2(1/2)}{1 - 1/4} = 4/3$.

        **Where points go.** Sign slips in $(1 + j2)^2$ (writing $5 + j4$ or $-3 - j4$). Calling any lossy material a good conductor.
      ` }),
    P({ src: 'Practice G #1(d) · 6 pts', title: 'The material: εr and σ',
      q: md`**(d) (6 pts)** Find the relative permittivity $\epsilon_r$ and the conductivity $\sigma$.`,
      parts: [trap(N(md`$\epsilon_r$`, 3, ''), [[4, md`That is $(c/v_p)^2 = 2^2$, the lossless guess. Loss raised $\beta$ above $\omega\sqrt{\mu\epsilon}$, so $\epsilon_r$ is smaller than 4.`]]),
        trap(N(md`$\sigma$ (S/m)`, 1 / 60, 'S/m'), [[1 / (60 * 2 * PI), md`That used $f$ instead of $\omega$ somewhere. $\omega = 1.5\pi\times10^8$ rad/s.`]])],
      hints: [md`$\omega\sqrt{\mu_0\epsilon_0} = \omega/c$. Compute it first: it is a clean number.`, md`Real part: $\omega^2\mu_0\epsilon_0\epsilon_r = 3\pi^2/4$. Imaginary part: $\omega\mu_0\sigma = \pi^2$.`],
      sol: md`
        **1. The key number.** $\omega\sqrt{\mu_0\epsilon_0} = \omega/c$:
        $$\frac{\omega}{c} = \frac{1.5\pi\times10^8}{3\times10^8} = \frac{\pi}{2}\ \text{rad/m}$$
        **2. ε from the real part.** $\omega^2\mu_0\epsilon = (\omega/c)^2\epsilon_r$, and (c) says it is $3\pi^2/4$:
        $$\frac{\pi^2}{4}\,\epsilon_r = \frac{3\pi^2}{4}$$
        $$\boxed{\epsilon_r = 3}$$
        **3. σ from the imaginary part.** First $\omega\mu_0$:
        $$\omega\mu_0 = (1.5\pi\times10^8)(4\pi\times10^{-7}) = 60\pi^2\ \Omega/\text{m}$$
        (c) says $\omega\mu_0\sigma = \pi^2$:
        $$\sigma = \frac{\pi^2}{60\pi^2}$$
        $$\boxed{\sigma = \frac{1}{60}\ \text{S/m} \approx 0.0167\ \text{S/m}}$$
        **4. Check against (c).** The displacement term:
        $$\omega\epsilon = (1.5\pi\times10^8)(3)\frac{10^{-9}}{36\pi} = \frac{1}{80}\ \text{S/m}$$
        Then $\sigma/\omega\epsilon = (1/60)/(1/80) = 80/60 = 4/3$ ✓.

        !!intuition Does this make sense?
          With no loss, this material would have $\beta = \omega\sqrt{\mu\epsilon} = (\pi/2)\sqrt3 \approx 2.72$ rad/m. The loss raised $\beta$ to $\pi$: loss always makes $\beta$ bigger than its lossless value. That is why reading $\epsilon_r$ from $(c/v_p)^2 = 4$ would be wrong.

        **Speed path.** Get $\omega/c = \pi/2$ first. Then $\epsilon_r = -\text{Re}(\gamma^2)/(\omega/c)^2$ and $\sigma = \text{Im}(\gamma^2)/\omega\mu_0$. The sheet's version: $\sigma = \text{Re}\{\gamma/\eta\}$ and $\epsilon = \text{Im}\{\gamma/\eta\}/\omega$, which needs $\eta$ from (e) first.

        **Where points go.** Using $f$ for $\omega$. Dropping the $4\pi$ in $\mu_0$. Reporting $\epsilon$ in F/m when $\epsilon_r$ is asked. Taking $\epsilon_r = (c/v_p)^2$, which holds only without loss.
      ` }),
    P({ src: 'Practice G #1(e) · 4 pts', title: 'η and the magnetic field',
      q: md`**(e) (4 pts)** Find $\eta = |\eta|e^{j\tau}$, and write $H_y(z,t)$.`,
      parts: [trap(N(md`$|\eta|$ (Ω)`, 24 * Math.sqrt(5) * PI, 'Ω'), [[120 * PI / Math.sqrt(3), md`That is $\eta_0/\sqrt{\epsilon_r}$, the lossless value. Loss makes $|\eta|$ smaller: divide by $\sqrt{\rho} = \sqrt{5/3}$ too.`]]),
        trap(N(md`$\tau$ (degrees)`, 26.565, '°'), [[53.13, md`That is $\tan^{-1}(4/3)$, the angle of $\eta^2$. The square root halves it.`], [63.43, md`That is the angle of $\gamma$. The angles of $\gamma$ and $\eta$ add to $90°$.`]]),
        mc(md`$H_y(z,t)$ in A/m is`, [md`$0.0593\,e^{-\pi z/2}\cos(\omega t - \pi z - 26.6°)$`, md`$0.0593\,e^{-\pi z/2}\cos(\omega t - \pi z + 26.6°)$`, md`$0.0593\cos(\omega t - \pi z - 26.6°)$`, md`$-0.0593\,e^{-\pi z/2}\cos(\omega t - \pi z - 26.6°)$`], 0,
          [null, md`That adds $\tau$. $\tilde H = \tilde E/\eta$, and dividing by $e^{j\tau}$ subtracts it: $H$ lags $E$.`, md`$H$ decays exactly as $E$ does; the factor $e^{-\pi z/2}$ cannot disappear.`, md`The minus sign belongs to a wave going toward $-z$. This one goes toward $+z$, with $\hat x\times\hat y = \hat z$.`])],
      hints: [md`$\eta\gamma = j\omega\mu$ (formula sheet), so $\eta = j\omega\mu_0/\gamma$ with $\omega\mu_0 = 60\pi^2$ and $\gamma = \frac{\pi}{2}(1 + j2)$.`],
      sol: md`
        **1. η from ηγ = jωμ.**
        $$\eta = \frac{j\omega\mu_0}{\gamma} = \frac{j60\pi^2}{\frac{\pi}{2}(1 + j2)}$$
        Cancel $\pi/2$ into $60\pi^2$:
        $$\eta = \frac{j120\pi}{1 + j2}$$
        Multiply top and bottom by $1 - j2$. The bottom becomes $1^2 + 2^2 = 5$:
        $$\eta = \frac{j120\pi(1 - j2)}{5} = 24\pi\,j(1 - j2)$$
        And $j(1 - j2) = j - j^2 2 = 2 + j$:
        $$\eta = 24\pi(2 + j) \approx 151 + j75.4\ \Omega$$
        **2. Size and angle.** $|2 + j| = \sqrt5$ and its angle is $\tan^{-1}(1/2)$:
        $$\boxed{|\eta| = 24\sqrt5\,\pi \approx 169\ \Omega}$$
        $$\boxed{\tau = \tan^{-1}\tfrac12 \approx 26.6°}$$
        **3. H.** For a wave going toward $+z$, $\tilde H_y = \tilde E_x/\eta$: same decay and $\beta$, amplitude divided by $|\eta|$, phase minus $\tau$. The amplitude is $10/169 = 0.0593$ A/m:
        $$H_y = 0.0593\,e^{-\pi z/2}\cos(\omega t - \pi z - 26.6°)$$
        in A/m, with $\omega = 1.5\pi\times10^8$ rad/s.

        !!intuition Does this make sense?
          $|\gamma||\eta| = \frac{\pi}{2}\sqrt5\cdot24\sqrt5\,\pi = 60\pi^2 = \omega\mu_0$ ✓, and the angles add to $90°$: $63.4° + 26.6°$ ✓. That is $\eta\gamma = j\omega\mu$ checked in ten seconds. Also $\tau < 45°$, as it must be.

        **Speed path.** The angles of $\gamma$ and $\eta$ add to $90°$, so $\tau = 90° - \tan^{-1}(\beta/\alpha) = \tan^{-1}(\alpha/\beta) = \tan^{-1}(1/2)$. The size is $|\eta| = \omega\mu_0/|\gamma| = 60\pi^2/(\tfrac{\pi}{2}\sqrt5)$.

        **Where points go.** Using the lossless $\eta_0/\sqrt{\epsilon_r}$. Adding $\tau$ to $H$'s phase. Dropping $e^{-\alpha z}$ from $H$.
      ` }),

    // ---------------------------------------------------------------- G Problem 2
    RF(md`
      ### Problem 2 (24 points): one sheet, an elliptical wave

      A current sheet in the plane $z = 0$ in free space radiates at $f = 300$ MHz, so $\beta = 2\pi$ rad/m. For $z > 0$ its field is
      $$\begin{aligned}\mathbf E = {}&120\pi\cos(\omega t - \beta z)\,\hat x\\ &+ 60\pi\sin(\omega t - \beta z)\,\hat y\ \ \text{V/m}\end{aligned}$$
      Use $\sin\theta = \cos(\theta - 90°)$. The field of a sheet $\mathbf J_s(t)$ at $z = 0$ is (formula sheet, in vector form)
      $$\mathbf E = -\frac{\eta_0}{2}\,\mathbf J_s\!\left(t \mp \frac zc\right)\quad (z \gtrless 0)$$

      [[fig:sheet]]
    `, { sheet: { svg: figG2(), cap: 'Side view. The sheet radiates both ways; the field is given only for z > 0.' } }),
    P({ src: 'Practice G #2(a) · 4 pts', title: 'Phasor and type',
      q: md`**(a) (4 pts)** Write the phasor $\tilde{\mathbf E}$ for $z > 0$, and name the polarization.`,
      parts: [
        mc(md`$\tilde{\mathbf E}$ for $z > 0$ (V/m)`, [md`$(120\pi\,\hat x - j60\pi\,\hat y)\,e^{-j2\pi z}$`, md`$(120\pi\,\hat x + j60\pi\,\hat y)\,e^{-j2\pi z}$`, md`$(120\pi\,\hat x + 60\pi\,\hat y)\,e^{-j2\pi z}$`, md`$(120\pi\,\hat x - j60\pi\,\hat y)\,e^{+j2\pi z}$`], 0,
          [null, md`$\sin\theta = \cos(\theta - 90°)$: the sine is $90°$ **behind** the cosine, which is $e^{-j90°} = -j$.`, md`That drops the $90°$ between the components: it describes a linear wave.`, md`$e^{+j2\pi z}$ is a wave toward $-z$. $\cos(\omega t - \beta z)$ goes with $e^{-j\beta z}$.`]),
        mc('The polarization is', [md`elliptical`, md`linear`, md`circular`, md`circular, because the components are $90°$ apart`], 0,
          [null, md`Linear needs the components in phase (or $180°$ apart). These are $90°$ apart.`, md`Circular needs equal amplitudes too. $120\pi \ne 60\pi$.`, md`$90°$ apart is half of the condition. The amplitudes must also be equal.`])],
      hints: [md`$\cos(\omega t - \beta z) \leftrightarrow e^{-j\beta z}$. And $\sin(\omega t - \beta z) = \cos(\omega t - \beta z - 90°) \leftrightarrow e^{-j\beta z}e^{-j90°}$.`],
      sol: md`
        **1. Each component as a phasor.** The cosine term maps directly:
        $$120\pi\cos(\omega t - \beta z) \leftrightarrow 120\pi\,e^{-j\beta z}$$
        The sine is a cosine delayed by $90°$:
        $$60\pi\sin(\omega t - \beta z) = 60\pi\cos(\omega t - \beta z - 90°)$$
        A delay of $90°$ is a factor $e^{-j90°} = -j$:
        $$60\pi\sin(\omega t - \beta z) \leftrightarrow -j60\pi\,e^{-j\beta z}$$
        **2. Together,** with $\beta = 2\pi$ rad/m:
        $$\boxed{\tilde{\mathbf E} = (120\pi\,\hat x - j60\pi\,\hat y)\,e^{-j2\pi z}\ \text{V/m}}$$
        **3. Type.** Two perpendicular components, $90°$ apart in time, with **unequal** amplitudes ($120\pi$ and $60\pi$). The tip traces an ellipse with its long axis along $\hat x$, twice as long as its short axis along $\hat y$.
        $$\boxed{\text{elliptical}}$$

        !!intuition Does this make sense?
          Check the three cases. In phase: the ratio $E_y/E_x$ is fixed, so the tip stays on a line. $90°$ apart and equal: $E_x^2 + E_y^2$ is constant, a circle. $90°$ apart and unequal: $(E_x/120\pi)^2 + (E_y/60\pi)^2 = \cos^2 + \sin^2 = 1$, an ellipse.

        **Speed path.** "sin" means $-j$. Unequal amplitudes and a $j$ between them: elliptical, axes along $\hat x$ and $\hat y$.

        **Where points go.** Writing $+j$ for a sine. Calling it circular because of the $90°$.
      ` }),
    P({ src: 'Practice G #2(b) · 4 pts', title: 'Which hand?',
      q: md`**(b) (4 pts)** Is the wave for $z > 0$ right-handed or left-handed?`,
      parts: [mc('For z > 0 the wave is', ['right-handed elliptical', 'left-handed elliptical', 'neither: only circular waves have a hand', 'right-handed at some instants and left-handed at others'], 0,
        [null, md`Freeze $z = 0$: the tip goes from $+\hat x$ (at $t = 0$) to $+\hat y$ (a quarter period later). Point your right thumb along $+z$: your fingers curl from $\hat x$ to $\hat y$. That is the right hand.`, md`Any rotating tip has a sense of rotation. An ellipse has a hand exactly like a circle.`, md`The tip always turns the same way; it never reverses.`])],
      hints: [md`Freeze one plane, $z = 0$. Where is the tip at $\omega t = 0$? At $\omega t = 90°$? Then put your thumb along the direction of travel and see which hand's fingers follow the tip.`],
      sol: md`
        **1. Freeze one plane.** At $z = 0$:
        $$\mathbf E(0,t) = 120\pi\cos\omega t\,\hat x + 60\pi\sin\omega t\,\hat y$$
        **2. Two instants.** At $\omega t = 0$: $\mathbf E = 120\pi\,\hat x$. A quarter period later, $\omega t = 90°$: $\cos = 0$, $\sin = 1$, so $\mathbf E = 60\pi\,\hat y$. The tip moves from $+\hat x$ toward $+\hat y$.

        **3. Match a hand.** The wave travels toward $+z$. Point your **right** thumb along $+z$: the fingers curl from $\hat x$ toward $\hat y$, the same way the tip moves. (Equivalently: $\hat x\times\hat y = +\hat z$, the direction of travel.)
        $$\boxed{\text{right-handed elliptical}}$$

        !!intuition Does this make sense?
          The phasor says the same thing: $\hat x - j\hat y$. The $\hat y$ part lags $\hat x$ by $90°$, so $\hat y$ reaches its peak after $\hat x$ does: the tip goes $\hat x$ then $\hat y$. The lecture's standard example, $\hat x - j\hat y$ toward $+z$, is right circular; this is the same with unequal sizes.

        **Speed path.** Write the phasor as $\hat a - j\hat b$: the tip turns from $\hat a$ to $\hat b$. If $\hat a\times\hat b$ is the direction of travel, it is right-handed.

        **Where points go.** Using the left hand for "counterclockwise". Seen from where? The picture depends on the viewpoint; the thumb rule does not.
      ` }),
    P({ src: 'Practice G #2(c) · 6 pts', title: 'The sheet current',
      q: md`**(c) (6 pts)** Find the sheet current $\mathbf J_s(t)$ that produces this field.`,
      parts: [N(md`amplitude of $J_{sx}$ (A/m)`, 2, 'A/m'), N(md`amplitude of $J_{sy}$ (A/m)`, 1, 'A/m'),
        mc(md`$\mathbf J_s(t)$ in A/m is`, [md`$-2\cos\omega t\,\hat x - \sin\omega t\,\hat y$`, md`$2\cos\omega t\,\hat x + \sin\omega t\,\hat y$`, md`$-2\cos\omega t\,\hat x + \sin\omega t\,\hat y$`, md`$-\cos\omega t\,\hat x - \tfrac12\sin\omega t\,\hat y$`], 0,
          [null, md`That drops the minus sign in $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$. The field at the sheet points opposite to the current that drives it.`, md`Only the $\hat x$ part has the sign flipped. Both components carry the same factor $-2/\eta_0$.`, md`That divides by $\eta_0$ instead of $\eta_0/2$. A sheet shares its field between two sides.`])],
      hints: [md`At $z = 0^+$, $\tilde{\mathbf E}(0) = -\frac{\eta_0}{2}\tilde{\mathbf J}_s$, with $\frac{\eta_0}{2} = 60\pi\ \Omega$. Solve for $\tilde{\mathbf J}_s$, then return to the time domain.`],
      sol: md`
        **1. The sheet law at z = 0.** On the sheet, $z = 0$ and the delay $z/c$ is zero:
        $$\tilde{\mathbf E}(0) = -\frac{\eta_0}{2}\tilde{\mathbf J}_s$$
        Solve for the current. $\eta_0/2 = 60\pi\ \Omega$:
        $$\tilde{\mathbf J}_s = -\frac{\tilde{\mathbf E}(0)}{60\pi}$$
        **2. Substitute** $\tilde{\mathbf E}(0) = 120\pi\,\hat x - j60\pi\,\hat y$:
        $$\tilde{\mathbf J}_s = -\frac{120\pi\,\hat x - j60\pi\,\hat y}{60\pi}$$
        $$\tilde{\mathbf J}_s = -2\,\hat x + j\,\hat y\ \ \text{A/m}$$
        **3. Back to time.** $\mathbf J_s(t) = \text{Re}\{\tilde{\mathbf J}_s e^{j\omega t}\}$. The $\hat x$ part gives $-2\cos\omega t$. For the $\hat y$ part, $j = e^{j90°}$:
        $$\text{Re}\{j\,e^{j\omega t}\} = \cos(\omega t + 90°) = -\sin\omega t$$
        $$\boxed{\mathbf J_s(t) = -2\cos\omega t\,\hat x - \sin\omega t\,\hat y\ \ \text{A/m}}$$
        Amplitudes: 2 A/m along $\hat x$, 1 A/m along $\hat y$.

        !!intuition Does this make sense?
          At $t = 0$ the current is $-2\hat x$ and the field at the sheet is $+120\pi\hat x$: opposite. That is how a source works: $\mathbf J\cdot\mathbf E < 0$ means the sheet pushes current against the field and gives energy to it. Also, the current itself turns: from $-\hat x$ toward $-\hat y$, the same sense as $\mathbf E$.

        **Speed path.** $\tilde{\mathbf J}_s = -\tilde{\mathbf E}(0)/60\pi$, component by component. Then $j \to -\sin$.

        **Where points go.** Losing the minus sign. Using $\eta_0$ instead of $\eta_0/2$. Turning $+j$ into $+\sin$.
      ` }),
    P({ src: 'Practice G #2(d) · 4 pts', title: 'The other side',
      q: md`**(d) (4 pts)** What is the field for $z < 0$, and what is its polarization?`,
      parts: [mc('For z < 0', [md`$\mathbf E = 120\pi\cos(\omega t + \beta z)\,\hat x + 60\pi\sin(\omega t + \beta z)\,\hat y$: left-handed elliptical`, md`$\mathbf E = 120\pi\cos(\omega t + \beta z)\,\hat x + 60\pi\sin(\omega t + \beta z)\,\hat y$: right-handed elliptical`, md`$\mathbf E = -120\pi\cos(\omega t + \beta z)\,\hat x - 60\pi\sin(\omega t + \beta z)\,\hat y$: right-handed elliptical`, md`$\mathbf E = 120\pi\cos(\omega t + \beta z)\,\hat x - 60\pi\sin(\omega t + \beta z)\,\hat y$: right-handed elliptical`], 0,
        [null, md`The expression is right, but the hand is not. The tip turns the same way on both sides, $\hat x\to\hat y$, while the travel direction flips to $-z$. With the thumb on $-z$, only the left hand's fingers curl from $\hat x$ to $\hat y$.`, md`The formula sheet's field has the same sign on both sides: $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t \mp z/c)$. It is $\mathbf H$ that flips sign across the sheet, not $\mathbf E$. Tangential $\mathbf E$ is continuous at $z = 0$.`, md`Flipping the $\hat y$ part to make it "right-handed" breaks continuity: at $z = 0$ both sides must have the same tangential $\mathbf E$.`])],
      hints: [md`Put $t + z/c$ into the same $\mathbf J_s$ for $z < 0$. Then freeze $z = 0$: does the tip turn the same way as before? Which way does this wave travel?`],
      sol: md`
        !!trap The trap
          The field on the left is the **same** pattern as on the right, turning the **same** way, and yet it has the **opposite** hand, because it travels the other way.

        **1. The field.** For $z < 0$ the sheet law uses $t + z/c$. The current from (c) gives, with $\beta = \omega/c$:
        $$\begin{aligned}\mathbf E = {}&120\pi\cos(\omega t + \beta z)\,\hat x\\ &+ 60\pi\sin(\omega t + \beta z)\,\hat y\ \ \text{V/m}\end{aligned}$$
        At $z = 0$ it equals the field on the right, as it must: tangential $\mathbf E$ is continuous across a current sheet.

        **2. Rotation.** Freeze $z = 0$: exactly the same as in (b). The tip turns from $+\hat x$ toward $+\hat y$.

        **3. Hand.** This wave travels toward $-z$. Right thumb on $-z$: the fingers curl from $\hat y$ toward $\hat x$, the wrong way. Left thumb on $-z$: the fingers curl from $\hat x$ toward $\hat y$ ✓.
        $$\boxed{\text{left-handed elliptical for } z < 0}$$

        [[fig:ell]]

        !!intuition Does this make sense?
          Look at the sheet from the right and from the left: the same current turns clockwise for one viewer and counterclockwise for the other. So a single sheet always launches opposite hands on its two sides. To get the same hand on both sides you would need two sheets, or a reflector.

        **Speed path.** Same tip rotation, opposite travel: opposite hand. Write it the moment you see "a sheet radiates both ways".

        **Where points go.** Copying the right side's hand. Flipping the sign of $\mathbf E$ for $z < 0$ (it is $\mathbf H$ that flips).
      `,
      figs: { ell: { svg: figG2sol(), cap: 'Seen from +z (x right, y up). The tip turns the same way on both sides; only the direction of travel differs.' } } }),
    P({ src: 'Practice G #2(e) · 6 pts', title: 'Make it circular; the power',
      q: md`**(e) (6 pts)** Keep $J_{sx} = -2\cos\omega t$. What $J_{sy}(t)$ would make the wave for $z > 0$ right-handed **circular**? And for the original sheet, what time-averaged power per square meter flows into $z > 0$?`,
      parts: [mc(md`$J_{sy}(t)$ for right-handed circular`, [md`$-2\sin\omega t$`, md`$+2\sin\omega t$`, md`$-2\cos\omega t$`, md`$-\sin\omega t$`], 0,
        [null, md`That reverses the rotation: $\tilde E_y$ would be $+j$ times $\tilde E_x$, so the tip turns $\hat x \to -\hat y$, and the wave on $z > 0$ is left-handed.`, md`In phase with $J_{sx}$: the two components rise and fall together, a linear wave at $45°$.`, md`That is the original current: elliptical, not circular. The amplitudes must match.`]),
        N(md`$\langle S_z\rangle$ for $z > 0$ (W/m²)`, 75 * PI, 'W/m²')],
      hints: [md`Circular needs $|\tilde E_y| = |\tilde E_x| = 120\pi$ with the same $-j$ between them. Then $\tilde J_{sy} = -\tilde E_y(0)/60\pi$.`, md`$\langle S\rangle = \dfrac{|\tilde E_x|^2 + |\tilde E_y|^2}{2\eta_0}$ for a wave in free space.`],
      sol: md`
        **1. What circular needs.** Equal amplitudes and the same $90°$ lag as before (so the same right-handed sense):
        $$\tilde E_y(0) = -j\,\tilde E_x(0) = -j120\pi$$
        **2. The current that makes it.** From the sheet law, $\tilde J_{sy} = -\tilde E_y(0)/60\pi$:
        $$\tilde J_{sy} = -\frac{-j120\pi}{60\pi} = j2\ \text{A/m}$$
        Back to time, as in (c):
        $$\boxed{J_{sy}(t) = -2\sin\omega t\ \text{A/m}}$$
        **3. The power of the original wave.** The two components are $90°$ apart, so their powers simply add:
        $$\langle S_z\rangle = \frac{|\tilde E_x|^2 + |\tilde E_y|^2}{2\eta_0}$$
        $$\langle S_z\rangle = \frac{(120\pi)^2 + (60\pi)^2}{240\pi}$$
        The top is $14400\pi^2 + 3600\pi^2 = 18000\pi^2$:
        $$\boxed{\langle S_z\rangle = 75\pi \approx 236\ \text{W/m}^2}$$

        !!intuition Does this make sense?
          The sheet sends the same power to each side, so it delivers $150\pi$ W/m² in total. Check with the source: $-\tfrac12\text{Re}\{\tilde{\mathbf E}(0)\cdot\tilde{\mathbf J}_s^*\}$. Here $\tilde{\mathbf E}\cdot\tilde{\mathbf J}^* = (120\pi)(-2) + (-j60\pi)(-j) = -240\pi - 60\pi = -300\pi$, so the sheet delivers $150\pi$ ✓.

        **Speed path.** Circular: copy $J_{sx}$'s amplitude into $J_{sy}$, keep the sine and its sign. Power: $(E_x^2 + E_y^2)/2\eta_0$ with $\pi^2/\pi = \pi$.

        **Where points go.** Picking $+2\sin$ (left-handed). Writing $(120\pi + 60\pi)^2$ instead of adding the squares. Doubling or halving for "both sides" when the question asks for one side.
      ` }),

    // ---------------------------------------------------------------- G Problem 3
    RF(md`
      ### Problem 3 (22 points): a stub filter

      A source with $R_g = 50\ \Omega$ sends two tones down a $50\ \Omega$ line, 1.25 m long, to a $50\ \Omega$ receiver: the signal at $f_0 = 100$ MHz and an unwanted harmonic at $2f_0 = 200$ MHz. You may connect one **stub** (a piece of $50\ \Omega$ line, **shorted** or **open** at its far end) in parallel with the receiver, right at its terminals. Every line has $v = 2\times10^8$ m/s and no loss. Goal: let $f_0$ through untouched, and stop $2f_0$.

      From the formula sheet, a line of length $d$ ending in a short has $Z = jZ_0\tan\beta d$; one ending in an open has $Y = jY_0\tan\beta d$, so $Z = -jZ_0\cot\beta d$.

      [[fig:filt]]
    `, { filt: { svg: figG3(), cap: 'The stub hangs across the receiver terminals. Its length and its far end are yours to choose.' } }),
    P({ src: 'Practice G #3(a) · 4 pts', title: 'What the stub must look like',
      q: md`**(a) (4 pts)** What impedance must the stub present at $f_0$, and at $2f_0$?`,
      parts: [mc('The stub must look like', [md`an open circuit at $f_0$ and a short circuit at $2f_0$`, md`a short circuit at $f_0$ and an open circuit at $2f_0$`, md`$50\ \Omega$ at $f_0$ and a short circuit at $2f_0$`, md`an open circuit at both frequencies`], 0,
        [null, md`That is the reverse filter: a short across the receiver at $f_0$ would reflect the signal you want.`, md`A lossless stub is a pure reactance $jX$; it can never be a resistor. And $50\parallel50 = 25\ \Omega$ would mismatch $f_0$.`, md`An open in parallel does nothing at all, so $2f_0$ would reach the receiver too.`])],
      hints: [md`The receiver and the stub are in parallel: the line ends in $50\parallel Z_{\text{stub}}$. What $Z_{\text{stub}}$ leaves $50\ \Omega$ alone? What $Z_{\text{stub}}$ shorts the receiver out?`],
      sol: md`
        **1. The line's load.** The stub is in parallel with the receiver, so the feed line ends in
        $$Z_{\text{end}} = 50\parallel Z_{\text{stub}}$$
        A lossless stub has a purely reactive impedance $Z_{\text{stub}} = jX$, with $X$ anywhere from $-\infty$ to $+\infty$.

        **2. Pass f₀ untouched.** We need $Z_{\text{end}} = 50\ \Omega$, a matched load. That happens only if the stub draws no current: $X = \pm\infty$, an **open circuit**.

        **3. Block 2f₀.** We need no 2f₀ power in the receiver. If the stub is a **short circuit**, $Z_{\text{end}} = 50\parallel0 = 0$: the receiver's terminals are shorted, $V = 0$ across it, and $\Gamma = -1$ sends the whole 2f₀ wave back.
        $$\boxed{\text{open at } f_0,\ \text{short at } 2f_0}$$

        **Speed path.** In parallel: open passes, short blocks.

        **Where points go.** Mixing up series and parallel. For a stub in **series** with the receiver it is the other way round: short passes, open blocks.
      ` }),
    P({ src: 'Practice G #3(b) · 5 pts', title: 'Choose the stub',
      q: md`**(b) (5 pts)** Which stub does the job? What is the next-longer stub of the same kind that also works?`,
      parts: [mc('The shortest stub that works', [md`shorted, 0.5 m`, md`open, 0.5 m`, md`shorted, 1 m`, md`open, 1 m`, md`shorted, 0.25 m`], 0,
        [null, md`An open stub of $\lambda_0/4$ is a **short** at $f_0$: it blocks the signal and passes the harmonic. The reverse filter.`, md`A shorted $\lambda_0/2$ stub is a short at $f_0$ (and at $2f_0$): it blocks both tones.`, md`An open $\lambda_0/2$ stub is open at $f_0$, but at $2f_0$ it is a full wavelength, open again. It passes both.`, md`$0.25$ m is $\lambda_0/8$: $jZ_0\tan45° = j50\ \Omega$ at $f_0$, which mismatches the signal.`]),
        trap(N('next-longer one (m)', 1.5, 'm'), [[1, md`A shorted 1 m stub is a half wave at $f_0$: a short there, which blocks the signal.`], [2.5, md`2.5 m works too, but 1.5 m is shorter.`]])],
      hints: [md`Wavelengths: $\lambda_0 = v/f_0 = 2$ m and $\lambda = 1$ m at $2f_0$. A shorted stub is open when $\beta l = \pi/2$ (a quarter wave).`, md`Try each kind: what does a stub that is open at $f_0$ look like at $2f_0$, where $\beta$ doubles?`],
      sol: md`
        **1. Wavelengths.**
        $$\lambda_0 = \frac{v}{f_0} = \frac{2\times10^8}{10^8} = 2\ \text{m},\qquad \lambda_{2f_0} = 1\ \text{m}$$
        At $2f_0$, $\beta$ is twice as large, so the **same** stub is twice as long in electrical terms: $\beta l$ doubles.

        **2. Shorted stub.** $Z = jZ_0\tan\beta l$. To be open at $f_0$, $\tan\beta_0l = \infty$:
        $$\beta_0 l = \frac{\pi}{2} \quad\Rightarrow\quad l = \frac{\lambda_0}{4} = 0.5\ \text{m}$$
        At $2f_0$ the same stub has $\beta l = \pi$, and $\tan\pi = 0$: a **short** ✓. Both conditions hold.
        $$\boxed{\text{a shorted stub, } 0.5\ \text{m long}}$$
        **3. Why no open stub works.** $Z = -jZ_0\cot\beta l$. To be open at $f_0$, $\cot\beta_0l = \infty$, so $\beta_0 l = \pi, 2\pi, \dots$ At $2f_0$ that doubles to $2\pi, 4\pi, \dots$, where $\cot$ is again infinite: still open. An open stub that passes $f_0$ also passes $2f_0$.

        **4. The next-longer shorted stub.** Open at $f_0$ needs $\beta_0l = \pi/2, 3\pi/2, \dots$ At $2f_0$ these double to $\pi, 3\pi, \dots$, all shorts ✓. The next one is
        $$\beta_0 l = \frac{3\pi}{2} \quad\Rightarrow\quad \boxed{l = \frac{3\lambda_0}{4} = 1.5\ \text{m}}$$

        **Speed path.** Shorted quarter wave at $f_0$: open at $f_0$, half wave (short) at $2f_0$. Lengths $\lambda_0/4 + n\lambda_0/2$.

        **Where points go.** Using $\lambda$ at $2f_0$ for the quarter wave. Forgetting that doubling $f$ doubles $\beta l$ for the same physical stub.
      ` }),
    P({ src: 'Practice G #3(c) · 4 pts', title: 'What the line sees',
      q: md`**(c) (4 pts)** With your 0.5 m stub in place: what is the stub's impedance at each frequency, what impedance ends the feed line at $f_0$, and what is the reflection coefficient at the receiver terminals at $2f_0$?`,
      parts: [mc(md`$Z_{\text{stub}}$ at $f_0$ and at $2f_0$`, [md`$\infty$ and $0$`, md`$0$ and $\infty$`, md`$j50\ \Omega$ and $0$`, md`$\infty$ and $\infty$`], 0,
        [null, md`That is an open stub of the same length.`, md`$j50\ \Omega$ is $jZ_0\tan45°$: a $\lambda/8$ shorted stub, not $\lambda/4$.`, md`At $2f_0$ the stub is a half wave long, and a shorted half wave is a short.`]),
        N(md`$Z$ ending the feed line at $f_0$ (Ω)`, 50, 'Ω'),
        trap(N(md`$\Gamma$ at the terminals at $2f_0$`, -1, ''), [[1, md`$\Gamma = (0 - 50)/(0 + 50)$: a short reflects with $-1$, an open with $+1$.`]])],
      hints: [md`$\Gamma = (Z_{\text{end}} - Z_0)/(Z_{\text{end}} + Z_0)$ with $Z_{\text{end}} = 50\parallel Z_{\text{stub}}$.`],
      sol: md`
        **1. The stub.** From (b), $\beta_0 l = \pi/2$ at $f_0$ and $\beta l = \pi$ at $2f_0$:
        $$Z_{\text{stub}}(f_0) = j50\tan\tfrac{\pi}{2} = \infty$$
        $$Z_{\text{stub}}(2f_0) = j50\tan\pi = 0$$
        **2. At f₀.** An open in parallel changes nothing:
        $$\boxed{Z_{\text{end}}(f_0) = 50\ \Omega}$$
        matched to the line, so $\Gamma = 0$ and every bit of the signal reaches the receiver.

        **3. At 2f₀.** $Z_{\text{end}} = 50\parallel0 = 0$:
        $$\Gamma = \frac{0 - 50}{0 + 50}$$
        $$\boxed{\Gamma(2f_0) = -1}$$
        All of the harmonic reflects, and the receiver, which sits across a short, sees no 2f₀ voltage.

        **Speed path.** Open in parallel: invisible. Short in parallel: $\Gamma = -1$.

        **Where points go.** Writing $\Gamma = +1$ for a short.
      ` }),
    P({ src: 'Practice G #3(d) · 3 pts', title: 'What the source sees',
      q: md`**(d) (3 pts)** At $2f_0$, what impedance does the source see at the start of the 1.25 m feed line?`,
      parts: [mc('At 2f₀ the source sees', [md`an open circuit`, md`a short circuit`, md`$50\ \Omega$`, md`$j50\ \Omega$`], 0,
        [null, md`The far end is a short, but 1.25 m is $5\lambda/4$ at $2f_0$. A quarter wave (plus whole half waves) turns a short into an open.`, md`$50\ \Omega$ is what it sees at $f_0$, where the line is matched. At $2f_0$ the load is a short.`, md`$j50\ \Omega$ needs $\tan\beta d = 1$, a line $\lambda/8$ (plus half waves) long.`])],
      hints: [md`At $2f_0$ the feed line ends in a short. Use $Z = jZ_0\tan\beta d$ with $\beta = 2\pi/(1\text{ m})$ and $d = 1.25$ m.`],
      sol: md`
        **1. The load at 2f₀** is the short from (c). So the feed line is a shorted line of length $d = 1.25$ m:
        $$Z_{\text{in}} = jZ_0\tan\beta d$$
        **2. Electrical length.** At $2f_0$, $\beta = 2\pi/(1\ \text{m}) = 2\pi$ rad/m:
        $$\beta d = 2\pi(1.25) = 2.5\pi$$
        $\tan$ repeats every $\pi$, so $\tan2.5\pi = \tan\tfrac{\pi}{2} = \infty$:
        $$\boxed{Z_{\text{in}}(2f_0) = \infty:\ \text{an open circuit}}$$
        The source sends no 2f₀ current at all: the harmonic is not just reflected, it is never drawn.

        **Speed path.** $1.25$ m $= 5\lambda/4$ at $2f_0$: an odd number of quarter waves flips short to open.

        **Where points go.** Using $\lambda_0 = 2$ m (that gives $\beta d = 1.25\pi$ and $Z = j50$, wrong frequency).
      ` }),
    P({ src: 'Practice G #3(e) · 3 pts', title: 'The reverse filter',
      q: md`**(e) (3 pts)** Suppose instead you wanted to pass $2f_0$ and block $f_0$. Which stub would you use?`,
      parts: [mc('To pass 2f₀ and block f₀, use', [md`an open stub 0.5 m long`, md`a shorted stub 0.5 m long`, md`an open stub 1 m long`, md`a shorted stub 1 m long`], 0,
        [null, md`That is the filter from (b): it passes $f_0$ and blocks $2f_0$.`, md`An open $\lambda_0/2$ stub is open at $f_0$: it lets $f_0$ through.`, md`A shorted $\lambda_0/2$ stub is a short at both frequencies.`])],
      hints: [md`Now you need a short at $f_0$ and an open at $2f_0$. An open stub is a short when $\beta l = \pi/2$.`],
      sol: md`
        **1. What is needed.** A short across the receiver at $f_0$ and an open at $2f_0$.

        **2. Open stub.** $Z = -jZ_0\cot\beta l$. A short at $f_0$ needs $\cot\beta_0l = 0$:
        $$\beta_0 l = \frac{\pi}{2} \quad\Rightarrow\quad l = \frac{\lambda_0}{4} = 0.5\ \text{m}$$
        At $2f_0$: $\beta l = \pi$ and $\cot\pi = \infty$: open ✓.
        $$\boxed{\text{an open stub, } 0.5\ \text{m long}}$$

        **Speed path.** Same length, other end: a quarter-wave stub flips its end. Shorted end → open input; open end → shorted input.

        **Where points go.** Picking a shorted half-wave stub: short at $f_0$, but short again at $2f_0$.
      ` }),
    P({ src: 'Practice G #3(f) · 3 pts', title: 'Halfway between',
      q: md`**(f) (3 pts)** With the shorted 0.5 m stub of (b), a third tone at 150 MHz arrives. What fraction of its incident power reaches the receiver?`,
      parts: [trap(N('fraction delivered', 0.8, ''), [[0.2, md`That is $|\Gamma|^2$, the fraction reflected. The receiver gets the rest.`], [0.5, md`That treats the stub as if it took half the power. A lossless stub absorbs nothing; the loss here is reflection.`]])],
      hints: [md`At 150 MHz, $\lambda = 4/3$ m and $\beta l = 3\pi/4$, so $Z_{\text{stub}} = j50\tan135° = -j50\ \Omega$.`, md`$Z_{\text{end}} = 50\parallel(-j50)$; then $\Gamma$; then the fraction delivered is $1 - |\Gamma|^2$ (the stub absorbs nothing).`],
      sol: md`
        **1. The stub at 150 MHz.**
        $$\lambda = \frac{2\times10^8}{1.5\times10^8} = \frac43\ \text{m}$$
        $$\beta l = \frac{2\pi}{4/3}(0.5) = \frac{3\pi}{4}$$
        $\tan(3\pi/4) = -1$, so
        $$Z_{\text{stub}} = j50(-1) = -j50\ \Omega$$
        **2. The parallel combination.**
        $$Z_{\text{end}} = \frac{50(-j50)}{50 - j50} = \frac{-j50}{1 - j}$$
        Multiply top and bottom by $1 + j$; the bottom becomes 2:
        $$Z_{\text{end}} = \frac{-j50(1 + j)}{2} = 25 - j25\ \Omega$$
        **3. Γ.**
        $$\Gamma = \frac{25 - j25 - 50}{25 - j25 + 50} = \frac{-25 - j25}{75 - j25}$$
        Divide top and bottom by 25:
        $$\Gamma = \frac{-1 - j}{3 - j}$$
        **4. Power.** $|\Gamma|^2 = |{-1} - j|^2/|3 - j|^2 = 2/10 = 0.2$. The stub is lossless, so whatever is not reflected goes into the receiver:
        $$\boxed{1 - |\Gamma|^2 = 0.8}$$

        [[fig:resp]]

        !!intuition Does this make sense?
          150 MHz is halfway between the pass frequency and the stop frequency, and it gets most, but not all, of its power through. In general $|\Gamma|^2 = 1/(1 + 4\tan^2\beta l)$ for this filter: 0 at $f_0$, 1 at $2f_0$.

        **Speed path.** Skip the full $\Gamma$: $|\Gamma|^2 = |Z_{\text{end}} - 50|^2/|Z_{\text{end}} + 50|^2 = (25^2 + 25^2)/(75^2 + 25^2) = 2/10$.

        **Where points go.** Reporting $|\Gamma|$ or $|\Gamma|^2$ instead of $1 - |\Gamma|^2$. Using $\tan135° = +1$.
      `,
      figs: { resp: { svg: figG3sol(), cap: 'Fraction of incident power delivered, 1 − |Γ|², for the shorted 0.5 m stub. Full at 100 MHz, zero at 200 MHz.' } } }),

    // ---------------------------------------------------------------- G Problem 4
    RF(md`
      ### Problem 4 (30 points): voltage and current bounce diagrams

      At $t = 0$ a source $V_g(t) = 90\,u(t)$ V with $R_g = 25\ \Omega$ is connected to a lossless line with $Z_0 = 50\ \Omega$, length $l = 200$ m and $v = 2\times10^8$ m/s. The load is $R_L = 100\ \Omega$. Position $z$ runs from the source ($z = 0$) to the load ($z = l$). Give times in µs.

      [[fig:ckt]]
    `, { ckt: { svg: figG4(), cap: 'A step source, one line, a resistive load. One trip down the line takes 1 µs.' } }),
    P({ src: 'Practice G #4(a) · 6 pts', title: 'The three coefficients',
      q: md`**(a) (6 pts)** Find the injection coefficient $\tau_g$ and the reflection coefficients $\Gamma_g$ (at the source) and $\Gamma_L$ (at the load).`,
      parts: [trap(N(md`$\tau_g$`, 2 / 3, ''), [[1 / 3, md`That is $R_g/(R_g + Z_0)$. The line takes the voltage across $Z_0$: $Z_0/(R_g + Z_0)$.`]]),
        trap(N(md`$\Gamma_g$`, -1 / 3, ''), [[1 / 3, md`That is $(Z_0 - R_g)/(Z_0 + R_g)$, upside down in sign. $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$.`]]),
        trap(N(md`$\Gamma_L$`, 1 / 3, ''), [[-1 / 3, md`That is $(Z_0 - R_L)/(Z_0 + R_L)$. A load larger than $Z_0$ reflects with a plus sign.`]])],
      hints: [md`At $t = 0^+$ the line looks like a resistor $Z_0$: a voltage divider with $R_g$. Then $\Gamma = (R - Z_0)/(R + Z_0)$ at each end.`],
      sol: md`
        **1. τg: the launch.** Just after $t = 0$ no wave has come back yet, so the line draws current like a resistor $Z_0$. The source sees a divider:
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{50}{25 + 50}$$
        $$\boxed{\tau_g = \tfrac23}$$
        This $\tau_g$ is the **injection coefficient**: the fraction of $V_g$ that becomes the first wave.

        **2. The reflection coefficients.** At an end with resistance $R$, $\Gamma = (R - Z_0)/(R + Z_0)$:
        $$\Gamma_g = \frac{25 - 50}{25 + 50} = \boxed{-\tfrac13}$$
        $$\Gamma_L = \frac{100 - 50}{100 + 50} = \boxed{\tfrac13}$$

        **Speed path.** All three in one breath: $50/75$, $-25/75$, $50/150$.

        **Where points go.** Writing $\tau_g = R_g/(R_g + Z_0)$. Flipping a sign in $\Gamma$: a resistor smaller than $Z_0$ always gives a negative $\Gamma$.
      ` }),
    P({ src: 'Practice G #4(b) · 6 pts', title: 'The voltage bounce diagram',
      q: md`**(b) (6 pts)** Draw the voltage bounce diagram for $0 \le t \le 5$ µs. Give the first three wave voltages.`,
      parts: [N(md`$V_1^+$, the first wave (V)`, 60, 'V'), N(md`$V_1^-$, its reflection from the load (V)`, 20, 'V'),
        trap(N(md`$V_2^+$, the reflection of $V_1^-$ from the source (V)`, -20 / 3, 'V'), [[20 / 3, md`$\Gamma_g = -1/3$ is negative: the wave that bounces off the source changes sign.`], [-20 / 9, md`That multiplies once more by $\Gamma_L$; that is the next wave, $V_2^-$.`]])],
      hints: [md`$V_1^+ = \tau_gV_g$. Each later wave is the previous one times the reflection coefficient of the end it just hit.`],
      sol: md`
        **1. The first wave.**
        $$V_1^+ = \tau_g V_g = \tfrac23(90) = \boxed{60\ \text{V}}$$
        It reaches the load at $t = l/v = 200/(2\times10^8) = 1$ µs.

        **2. Each bounce multiplies by Γ of that end.**
        $$V_1^- = \Gamma_L V_1^+ = \tfrac13(60) = \boxed{20\ \text{V}}$$
        It is back at the source at $t = 2$ µs:
        $$V_2^+ = \Gamma_g V_1^- = -\tfrac13(20) = \boxed{-\tfrac{20}{3}\ \text{V} \approx -6.67\ \text{V}}$$
        Then $V_2^- = \Gamma_LV_2^+ = -20/9$ V (at 3 µs), $V_3^+ = 20/27$ V (at 4 µs), and so on. Each round trip multiplies by $\Gamma_L\Gamma_g = -1/9$.

        [[fig:vb]]

        **3. Check the steady state.** Adding every wave, $60 + 20 - 6.67 - 2.22 + 0.74 + \dots \to 72$ V, which is the DC divider of part (f) ✓.

        **Speed path.** Write the chain $60 \xrightarrow{\times1/3} 20 \xrightarrow{\times(-1/3)} -6.67 \xrightarrow{\times1/3} -2.22$ along the zigzag. Label every line; that is where the points are.

        **Where points go.** Losing the sign at the source. Forgetting to label $\tau_g$, $\Gamma_g$, $\Gamma_L$ on the diagram (Chen's key gives points for each).
      `,
      figs: { vb: { svg: TL.diagram(sG4, { tMax: 5, w: 380, h: 330 }), cap: 'Voltage bounce diagram. Solid: waves going toward the load; dimmer: waves going back. Times in µs.' } } }),
    P({ src: 'Practice G #4(c) · 6 pts', title: 'The current bounce diagram',
      q: md`**(c) (6 pts)** Draw the current bounce diagram. Give the first three wave currents, with signs.`,
      parts: [N(md`$I_1^+$ (A)`, 1.2, 'A'),
        trap(N(md`$I_1^-$, the current of the load reflection (A)`, -0.4, 'A'), [[0.4, md`A backward wave carries current $-V^-/Z_0$. Its voltage is $+20$ V, so its current is $-0.4$ A: it flows back toward the source.`]]),
        trap(N(md`$I_2^+$ (A)`, -2 / 15, 'A'), [[2 / 15, md`$I_2^+ = V_2^+/Z_0$ with $V_2^+ = -20/3$ V: negative.`]])],
      hints: [md`A forward wave has $I^+ = V^+/Z_0$. A backward wave has $I^- = -V^-/Z_0$: current reflects with $-\Gamma$.`],
      sol: md`
        **1. Why the current has its own sign rule.** A wave going toward $+z$ carries power toward the load: $V^+I^+ > 0$, so $I^+ = +V^+/Z_0$. A wave going back carries power toward the source, so its current along $+z$ is $I^- = -V^-/Z_0$. Equivalently, the current reflects with $-\Gamma$.

        **2. The currents.**
        $$I_1^+ = \frac{60}{50} = \boxed{1.2\ \text{A}}$$
        $$I_1^- = -\frac{20}{50} = \boxed{-0.4\ \text{A}}$$
        $$I_2^+ = \frac{-20/3}{50} = \boxed{-\tfrac{2}{15}\ \text{A} \approx -0.133\ \text{A}}$$
        Then $I_2^- = +2/45$ A, $I_3^+ = +2/135$ A, and so on.

        [[fig:ib]]

        !!intuition Does this make sense?
          At the load, after the first reflection: $V = 60 + 20 = 80$ V and $I = 1.2 - 0.4 = 0.8$ A, and $80/0.8 = 100\ \Omega = R_L$ ✓. Ohm's law at the load is the best check of a current diagram.

        **Speed path.** Draw the current diagram as the voltage diagram divided by $Z_0$, with every backward line's sign flipped.

        **Where points go.** Giving the reflected current the voltage's sign. The ratio is $-\Gamma_L$, not $\Gamma_L$.
      `,
      figs: { ib: { svg: TL.diagram(sG4, { tMax: 5, w: 380, h: 330, qty: 'I', coeffs: false }), cap: 'Current bounce diagram: the voltage diagram divided by Z₀ = 50 Ω, with the sign of every backward wave flipped.' } } }),
    P({ src: 'Practice G #4(d) · 6 pts', title: 'The current at z = 50 m',
      q: md`**(d) (6 pts)** Sketch $I(50\,\text{m}, t)$ for $0 \le t \le 5$ µs. Give its value at $t = 2$, $3$ and $4$ µs.`,
      parts: [N(md`$I(50\,\text{m}, 2\,\mu\text{s})$ (A)`, 0.8, 'A'), N(md`$I(50\,\text{m}, 3\,\mu\text{s})$ (A)`, 2 / 3, 'A'), N(md`$I(50\,\text{m}, 4\,\mu\text{s})$ (A)`, 32 / 45, 'A')],
      hints: [md`Draw a vertical line at $z = 50$ m on the current diagram. A forward wave crosses it 0.25 µs after leaving the source; a backward wave 0.75 µs after leaving the load.`, md`The current at a point is the sum of every wave that has passed it so far.`],
      sol: md`
        **1. When the waves pass z = 50 m.** $50$ m is a quarter of the line, 0.25 µs from the source and 0.75 µs from the load. Forward waves leave the source at 0, 2, 4 µs and pass at 0.25, 2.25, 4.25 µs. Backward waves leave the load at 1, 3, 5 µs and pass at 1.75, 3.75, 5.75 µs.

        **2. Add them up in time order.**
        - $0.25 < t < 1.75$: $I = 1.2$ A
        - $1.75 < t < 2.25$: $I = 1.2 - 0.4 = 0.8$ A
        - $2.25 < t < 3.75$: $I = 0.8 - \tfrac{2}{15} = \tfrac{2}{3}$ A
        - $3.75 < t < 4.25$: $I = \tfrac23 + \tfrac{2}{45} = \tfrac{32}{45}$ A

        $$\boxed{I(2) = 0.8\ \text{A},\ \ I(3) = \tfrac23\ \text{A},\ \ I(4) = \tfrac{32}{45} \approx 0.711\ \text{A}}$$

        [[fig:i50]]

        !!intuition Does this make sense?
          The staircase rings down toward the dashed steady value, 0.72 A, overshooting from both sides because $\Gamma_L\Gamma_g < 0$.

        **Speed path.** Two lists: arrival times ($0.25 + 2n$ and $1.75 + 2n$) and currents ($1.2, -0.4, -2/15, 2/45$). Merge them.

        **Where points go.** Using the voltage diagram's signs. Getting the passing times from the wrong end (a backward wave reaches $z = 50$ m 0.75 µs after the load, not 0.25 µs).
      `,
      figs: { i50: { svg: TL.plotT(sG4, 50, { qty: 'I', tMax: 5 }), cap: 'I(50 m, t) in A. Dashed: the steady state, 0.72 A.' } } }),
    P({ src: 'Practice G #4(e) · 3 pts', title: 'At the load',
      q: md`**(e) (3 pts)** What current flows through the load for $1 < t < 3$ µs, and what voltage is across it for $3 < t < 5$ µs?`,
      parts: [N(md`$I_L$ for $1 < t < 3$ µs (A)`, 0.8, 'A'), trap(N(md`$V_L$ for $3 < t < 5$ µs (V)`, 640 / 9, 'V'), [[80, md`That is the value before 3 µs. At 3 µs $V_2^+ = -20/3$ arrives and $V_2^- = -20/9$ leaves, both at the load.`]])],
      hints: [md`At the load, an arriving wave and its reflection appear at the same instant: the load sees $(1 + \Gamma_L)$ times every arriving wave.`],
      sol: md`
        **1. At 1 µs** the first wave arrives and reflects at once, so the load sees both:
        $$V_L = 60 + 20 = 80\ \text{V}$$
        $$I_L = \frac{80}{100} = \boxed{0.8\ \text{A}}$$
        Same from the current diagram: $1.2 - 0.4 = 0.8$ A ✓.

        **2. At 3 µs** the wave $V_2^+ = -20/3$ V arrives and makes $V_2^- = -20/9$ V:
        $$V_L = 80 - \frac{20}{3} - \frac{20}{9} = 80 - \frac{80}{9}$$
        $$\boxed{V_L = \frac{640}{9} \approx 71.1\ \text{V}}$$

        **Speed path.** At the load, multiply each arriving wave by $1 + \Gamma_L = 4/3$: $60\cdot\tfrac43 = 80$, then $-\tfrac{20}{3}\cdot\tfrac43 = -\tfrac{80}{9}$.

        **Where points go.** Adding only the arriving wave and forgetting the reflection that leaves at the same instant.
      ` }),
    P({ src: 'Practice G #4(f) · 3 pts', title: 'Steady state',
      q: md`**(f) (3 pts)** As $t\to\infty$, what are the voltage across the load and the current in the line?`,
      parts: [N(md`$V(t\to\infty)$ (V)`, 72, 'V'), N(md`$I(t\to\infty)$ (A)`, 0.72, 'A')],
      hints: [md`After every bounce dies out, a lossless line is just a wire. What does the DC circuit look like?`],
      sol: md`
        **1. The DC circuit.** In steady state nothing changes in time, so the lossless line carries the same voltage and current everywhere: it is a plain pair of wires. The circuit is $V_g$, $R_g$ and $R_L$ in series:
        $$I = \frac{V_g}{R_g + R_L} = \frac{90}{125} = \boxed{0.72\ \text{A}}$$
        $$V = IR_L = \boxed{72\ \text{V}}$$

        !!intuition Does this make sense?
          The bounce sums agree: voltage $60 + 20 - 6.67 - 2.22 + \dots \to 72$ V and current $1.2 - 0.4 - 0.133 + 0.044 + \dots \to 0.72$ A. $Z_0$ does not appear in the answer: it only decides how fast the line gets there.

        **Speed path.** Ignore the line. $V_g R_L/(R_g + R_L)$.

        **Where points go.** Putting $Z_0$ into the steady-state divider.
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-g', order: 7, title: 'Practice exam G', kind: 'mock', sub: '75 min · 100 pts · reading a lossy wave, an elliptical wave from a sheet, a stub filter, voltage and current bounce diagrams', steps: examG });

  // ======================================================================================== EXAM H: figures
  function figH1() {
    const g = PF.fig({ alt: 'the sea: a ship floats on the surface, a horizontal line; the water below is shaded; z points down; a submarine sits at depth d below the surface' });
    g.rect(20, 50, 320, 120, { cls: 'shade' });
    g.line(20, 50, 340, 50, { cls: 'thick' });
    g.poly([[54, 36], [134, 36], [122, 50], [66, 50]]);
    g.line(94, 36, 94, 14); g.line(86, 20, 102, 20);
    g.arrow(94, 58, 94, 104, { hs: 7 }); g.label(100, 82, '\\text{signal}', 'l', 'small');
    g.arrow(300, 50, 300, 166, { cls: 'dim', hs: 6 }); g.label(304, 164, 'z', 'l', 'small accent');
    g.label(306, 56, 'z = 0', 'tl', 'small');
    g.ellipse(214, 146, 40, 9); g.rect(204, 128, 14, 9);
    g.dim(170, 50, 170, 146, 'd', { at: 'l' });
    g.label(30, 130, '\\sigma = 4\\ \\text{S/m},\\ \\epsilon_r = 81', 'l', 'small');
    return g.svg();
  }
  const figH1sol = () => plot({
    w: 380, h: 220, x: [0, 62], y: [-80, 6], xl: 'd\\,(\\text{m})', yl: '20\\log_{10}(E/E_s)\\ (\\text{dB})',
    xt: [[5.5, '5.5'], [55, '55']], yt: [[-60, '-60']],
    hlines: [[-60, '']],
    curves: [
      { f: (z) => -8.686 * 0.4 * PI * z, lab: '100\\,\\text{kHz}', labAt: 3.2, dx: 8, dy: 4 },
      { f: (z) => -8.686 * 0.04 * PI * z, lab: '1\\,\\text{kHz}', labAt: 30, dy: -12 },
    ],
  });
  function figH2() {
    const g = PF.fig({ alt: 'side view: the z axis runs to the right; sheet A stands in the plane z = 0 and sheet B in the plane z = 0.25 m, a quarter wavelength further along; both carry current along x' });
    const XA = 130, XB = 230, Y = 120;
    g.arrow(20, Y, 360, Y, { cls: 'dim', hs: 6 }); g.label(364, Y, 'z', 'l', 'small accent');
    g.sheet(XA, 40, 170); g.sheet(XB, 40, 170);
    g.label(XA - 6, 52, '\\text{A: } \\cos\\omega t\\,\\hat x', 'r', 'small');
    g.label(XB + 6, 52, '\\text{B: } \\sin\\omega t\\,\\hat x', 'l', 'small');
    g.label(XA, 176, '0', 't', 'small'); g.label(XB, 176, '0.25\\,\\text{m}', 't', 'small');
    g.dim(XA, 90, XB, 90, '\\lambda/4', { at: 't' });
    g.label(70, 146, 'z < 0', 'c', 'small'); g.label(310, 146, 'z > 0.25', 'c', 'small');
    return g.svg();
  }
  const figH2sol = () => plot({
    w: 380, h: 200, x: [-0.5, 0.8], y: [0, 1.25], xl: 'z\\,(\\text{m})', yl: '|\\tilde E_x(z)|',
    xt: [[0, '0'], [0.25, '0.25']], yt: [[1, '120\\pi'], [0.5, '60\\pi']],
    hlines: [[0.5, '']],
    curves: [{ f: (z) => (z < 0 ? 0 : z < 0.25 ? Math.abs(Math.sin(2 * PI * z)) : 1), n: 520 }],
  });
  const figH3 = () => circuit([
    { t: 'gen', R: 'R_g = 50\\,\\Omega', V: '100\\,\\text{V}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 90, lab: 'Z_0 = 50\\,\\Omega', sub: '\\text{main line}' }, { t: 'wire', w: 8 },
    { t: 'line', w: 84, lab: 'Z_T\\ ?', sub: '\\lambda/4' },
    { t: 'R', lab: '200\\,\\Omega', left: true }, { t: 'C', lab: '-j50\\,\\Omega' }, { t: 'wire', w: 22 },
    { t: 'line', w: 64, lab: '\\text{stub}', sub: 'l_s\\ ?' }, { t: 'short' },
  ], { alt: 'a 100 V source with Rg = 50 ohms drives a long 50-ohm main line, then a quarter-wave section of unknown impedance ZT; at its end the load, a 200-ohm resistor in parallel with a capacitor of impedance -j50 ohms; a shorted 50-ohm stub of unknown length hangs across the load terminals' });
  const sH4 = solveShunt({ Vg: 100, Rg: 50, RL: 300, Rsh: 100, sections: [{ Z0: 50, len: 200, v: 200 }, { Z0: 100, len: 200, v: 200 }], tMax: 6 });
  const figH4 = () => circuit([
    { t: 'gen', R: 'R_g = 50\\,\\Omega', V: '100u(t)\\,\\text{V}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 100, lab: 'Z_{01} = 50\\,\\Omega', sub: '1\\,\\mu\\text{s}' },
    { t: 'R', lab: 'R = 100\\,\\Omega', left: true },
    { t: 'line', w: 100, lab: 'Z_{02} = 100\\,\\Omega', sub: '1\\,\\mu\\text{s}' },
    { t: 'R', lab: 'R_L = 300\\,\\Omega', last: true },
  ], { ticks: [[2, '0'], [3, '200\\,\\text{m}'], [5, '400\\,\\text{m}']], alt: 'a 100u(t) volt source with Rg = 50 ohms drives line 1 (50 ohms, z from 0 to 200 m); at z = 200 m a 100-ohm resistor sits across the junction, and line 2 (100 ohms) runs on to a 300-ohm load at z = 400 m' });

  // ======================================================================================== EXAM H
  const examH = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Same shape as Prof. Chen's Spring 2024 paper: four problems in short parts, numbers that work by hand, one part that is a trap. Where a logarithm is needed, the problem gives it.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Seawater at two frequencies: the regime, the skin depth, how deep a submarine can listen | 26 |
      | 2 | Two sheets a quarter wave apart, $90°$ out of phase: the field and the power on each side | 24 |
      | 3 | Matching a load with a shunt stub and a quarter-wave section | 22 |
      | 4 | Two lines with a resistor across the junction: $\Gamma$ and $\tau$ there, the bounces, steady state | 28 |

      **Draws on:** [the limits: imperfect dielectric and good conductor](#/l/w2-limits), [power in lossy media](#/l/w2-loss), [current-sheet antennas](#/l/w3-antenna), [stubs](#/l/w6-stubs), [quarter-wave transformers](#/l/w6-qw) and [junctions and multi-line circuits](#/l/w5-multi).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- H Problem 1
    RF(md`
      ### Problem 1 (26 points): talking to a submarine

      A ship at the sea surface sends a radio signal straight down to a submarine. Seawater has $\sigma = 4$ S/m, $\epsilon_r = 81$ and $\mu = \mu_0$; treat all three as independent of frequency. Just below the surface the wave's field amplitude is $E_s$. The submarine's receiver works as long as the amplitude reaching it is at least $10^{-3}E_s$, that is, 60 dB down. Use $\ln10 \approx 2.3$.

      [[fig:sea]]

      This is the skill of HW 9 #4 with new numbers and one new twist.
    `, { sea: { svg: figH1(), cap: 'The wave enters at z = 0 and decays as it goes down. How deep can the submarine be?' } }),
    P({ src: 'Practice H #1(a) · 4 pts', title: 'Which regime at 100 kHz?',
      q: md`**(a) (4 pts)** At $f = 100$ kHz, find the loss tangent $\sigma/\omega\epsilon$ and name the regime.`,
      parts: [trap(N(md`$\sigma/\omega\epsilon$`, 8000 / 0.9, ''), [[8000 / 0.9 * 2 * PI, md`That divides by $f\epsilon$ instead of $\omega\epsilon$: off by $2\pi$.`], [8000 / 0.9 * 81, md`That used $\epsilon_0$ instead of $\epsilon = 81\epsilon_0$.`]]),
        mc('At 100 kHz seawater is', ['a good conductor', 'an imperfect dielectric', 'neither: the two currents are comparable', 'a perfect conductor'], 0,
          [null, md`An imperfect dielectric needs $\sigma/\omega\epsilon \ll 1$. Here it is about 9000.`, md`Comparable means a ratio near 1. 9000 is not near 1.`, md`A perfect conductor has $\sigma = \infty$ and lets no field in at all. Seawater lets the wave in a few meters.`])],
      hints: [md`$\omega\epsilon = 2\pi f\cdot81\cdot\dfrac{10^{-9}}{36\pi}$. The $\pi$'s cancel; simplify before putting in $f$.`],
      sol: md`
        **1. The displacement term, in general.** Put $\epsilon = 81\epsilon_0$ and $\omega = 2\pi f$:
        $$\omega\epsilon = 2\pi f\cdot81\cdot\frac{10^{-9}}{36\pi}$$
        The $\pi$ cancels, and $2\cdot81/36 = 4.5$:
        $$\omega\epsilon = 4.5\times10^{-9}f\ \ \text{S/m}$$
        **2. At 100 kHz.**
        $$\omega\epsilon = 4.5\times10^{-9}\times10^5 = 4.5\times10^{-4}\ \text{S/m}$$
        **3. The ratio.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{4}{4.5\times10^{-4}}$$
        $$\boxed{\frac{\sigma}{\omega\epsilon} \approx 8.9\times10^3 \gg 1}$$
        The conduction current is about nine thousand times the displacement current: a **good conductor**.

        !!intuition Does this make sense?
          Keep the general form: $\sigma/\omega\epsilon = 8.9\times10^8/f$ for seawater. It equals 1 near 900 MHz. Below that, seawater acts as a conductor; well above it, as a lossy dielectric. Part (f) uses this.

        **Speed path.** $\omega\epsilon_0 = f\times\tfrac{1}{18}\times10^{-9}$. Times $\epsilon_r = 81$ gives $4.5\times10^{-9}f$.

        **Where points go.** Using $f$ for $\omega$; using $\epsilon_0$ for $\epsilon$.
      ` }),
    P({ src: 'Practice H #1(b) · 6 pts', title: 'α, δ and λ at 100 kHz',
      q: md`**(b) (6 pts)** At 100 kHz find $\alpha$, the skin depth $\delta$, and the wavelength in the water.`,
      parts: [trap(N(md`$\alpha$ (Np/m)`, 0.4 * PI, 'Np/m'), [[0.4 * PI * Math.SQRT2, md`That is $\sqrt{\omega\mu\sigma}$; the formula is $\sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$.`]]),
        N(md`$\delta$ (m)`, 2.5 / PI, 'm'), trap(N(md`$\lambda$ in the water (m)`, 5, 'm'), [[3000, md`That is the free-space wavelength, $c/f$. In seawater $\lambda = 2\pi/\beta$, and $\beta = \alpha$.`]])],
      hints: [md`Good conductor: $\alpha \approx \beta \approx \sqrt{\pi f\mu\sigma}$. Multiply out what is under the root before taking it; it is a perfect square.`],
      sol: md`
        **1. The good-conductor formula.** From the sheet, $\alpha \approx \sqrt{\omega\mu\sigma/2}$. With $\omega = 2\pi f$ this is
        $$\alpha \approx \beta \approx \sqrt{\pi f\mu\sigma}$$
        **2. Under the root.**
        $$\pi f\mu_0\sigma = \pi(10^5)(4\pi\times10^{-7})(4)$$
        $$\pi f\mu_0\sigma = 16\pi^2\times10^{-2}$$
        **3. Take the root.** $\sqrt{16\pi^2} = 4\pi$ and $\sqrt{10^{-2}} = 0.1$:
        $$\boxed{\alpha = 0.4\pi \approx 1.26\ \text{Np/m}}$$
        **4. Skin depth.**
        $$\delta = \frac{1}{\alpha} = \frac{1}{0.4\pi}$$
        $$\boxed{\delta = \frac{2.5}{\pi} \approx 0.80\ \text{m}}$$
        **5. Wavelength.** In a good conductor $\beta = \alpha$:
        $$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{0.4\pi}$$
        $$\boxed{\lambda = 5\ \text{m}}$$

        !!intuition Does this make sense?
          In air this wave has $\lambda = c/f = 3$ km. In seawater it is 5 m: the conduction current makes the wave crawl. And $\lambda = 2\pi\delta$: a good conductor kills the wave within about one wavelength ($e^{-2\pi} \approx 0.002$ per wavelength).

        **Speed path.** $\sqrt{\pi f\mu_0\sigma} = \sqrt{16\pi^2f\times10^{-7}}= 4\pi\sqrt{f\times10^{-7}}$ for seawater. At $f = 10^5$: $4\pi(0.1)$.

        **Where points go.** Dropping the 2 in $\omega\mu\sigma/2$. Using the free-space wavelength.
      ` }),
    P({ src: 'Practice H #1(c) · 4 pts', title: 'The impedance of seawater',
      q: md`**(c) (4 pts)** At 100 kHz, find $|\eta|$ and the angle $\tau$ of $\eta$.`,
      parts: [trap(N(md`$|\eta|$ (Ω)`, 0.1 * PI * Math.SQRT2, 'Ω'), [[120 * PI / 9, md`That is $\sqrt{\mu/\epsilon} = \eta_0/9$, the lossless value. In a good conductor $|\eta| = \sqrt{\omega\mu/\sigma}$, far smaller.`]]),
        mc(md`$\tau$`, ['0°', '22.5°', '45°', '90°'], 2, [md`$\tau = 0$ only without loss.`, md`$22.5°$ is the angle when $\sigma/\omega\epsilon = 1$.`, null, md`$\tau$ never exceeds $45°$; it reaches $45°$ only as $\sigma/\omega\epsilon\to\infty$.`], true)],
      hints: [md`Good conductor: $|\eta| = \sqrt{\omega\mu/\sigma}$ and $\tau = 45°$. Or use $\eta = \gamma/\sigma$ with $\gamma = \alpha(1 + j)$.`],
      sol: md`
        **1. The quick way.** In a good conductor $\gamma/\eta = \sigma + j\omega\epsilon \approx \sigma$. So
        $$\eta \approx \frac{\gamma}{\sigma} = \frac{\alpha(1 + j)}{\sigma}$$
        **2. Substitute** $\alpha = 0.4\pi$ and $\sigma = 4$:
        $$\eta = \frac{0.4\pi}{4}(1 + j) = 0.1\pi(1 + j)\ \Omega$$
        **3. Size and angle.** $|1 + j| = \sqrt2$ and its angle is $45°$:
        $$\boxed{|\eta| = 0.1\sqrt2\,\pi \approx 0.444\ \Omega}$$
        $$\boxed{\tau = 45°}$$
        **4. Check with the sheet's formula.** $|\eta| = \sqrt{\omega\mu/\sigma}$:
        $$\frac{\omega\mu_0}{\sigma} = \frac{(2\pi\times10^5)(4\pi\times10^{-7})}{4} = 0.02\pi^2$$
        and $\sqrt{0.02\pi^2} = 0.1\sqrt2\,\pi$ ✓.

        !!intuition Does this make sense?
          $0.44\ \Omega$ against $377\ \Omega$ in air: for the same $E$, the water carries about 850 times more $H$. Most of the wave's "push" is magnetic, and it reflects strongly at the surface (that is a separate loss, not part of this problem).

        **Speed path.** $\eta = (1 + j)\alpha/\sigma$: one division, no new root.

        **Where points go.** Using $\eta_0/\sqrt{\epsilon_r}$. Writing $\tau = 90°$.
      ` }),
    P({ src: 'Practice H #1(d) · 4 pts', title: 'How deep at 100 kHz?',
      q: md`**(d) (4 pts)** At 100 kHz, how deep can the submarine be and still receive the signal?`,
      parts: [trap(N('depth (m)', 3 * Math.log(10) / (0.4 * PI), 'm'), [[3 / (0.4 * PI), md`That solves $e^{-\alpha d} = e^{-3}$. You need $10^{-3}$, and $\ln10^3 = 3\ln10 \approx 6.9$.`], [6.9 / (0.8 * PI), md`That uses the power decay $e^{-2\alpha d}$ with an amplitude threshold. The $10^{-3}$ is for the field amplitude: $e^{-\alpha d}$.`]])],
      hints: [md`The amplitude is $E_se^{-\alpha d}$. Set $e^{-\alpha d} = 10^{-3}$ and take logarithms.`],
      sol: md`
        **1. The condition.** The amplitude at depth $d$ is $E_se^{-\alpha d}$. The receiver needs
        $$e^{-\alpha d} \ge 10^{-3}$$
        **2. Take natural logs** (they keep the inequality's direction):
        $$-\alpha d \ge -3\ln10$$
        $$d \le \frac{3\ln10}{\alpha}$$
        **3. Numbers.** $3\ln10 \approx 6.9$ and $\alpha = 0.4\pi \approx 1.26$ Np/m:
        $$d_{\max} = \frac{6.9}{1.26}$$
        $$\boxed{d_{\max} \approx 5.5\ \text{m}}$$

        [[fig:db]]

        !!intuition Does this make sense?
          In skin depths: $d_{\max} = 6.9\,\delta$. A 60 dB budget always buys about 6.9 skin depths, at any frequency. That is a number worth having on your card. In dB, the field falls $8.69$ dB per skin depth: $60/8.69 = 6.9$ ✓.

        **Speed path.** $d = 6.9\,\delta = 6.9 \times 0.8$ m.

        **Where points go.** Using $e^{-2\alpha d}$ (power) for an amplitude threshold. Taking $\ln1000 = 3$.
      `,
      figs: { db: { svg: figH1sol(), cap: 'Field level below the surface, in dB. Both lines are straight: the field drops a fixed number of dB per meter. Dashed: the −60 dB threshold.' } } }),
    P({ src: 'Practice H #1(e) · 4 pts', title: 'Drop to 1 kHz',
      q: md`**(e) (4 pts)** The ship drops to $f = 1$ kHz. The water is still a good conductor (the loss tangent only grows). How deep can the submarine be now, and what is the wavelength in the water?`,
      parts: [trap(N('depth (m)', 3 * Math.log(10) / (0.04 * PI), 'm'), [[300 * Math.log(10) / (0.4 * PI), md`That scales the depth by 100. $\alpha \propto \sqrt f$, so a factor of 100 in $f$ is only a factor of 10 in $\alpha$.`]]),
        N(md`$\lambda$ (m)`, 50, 'm')],
      hints: [md`$\alpha = \sqrt{\pi f\mu\sigma}$ goes as $\sqrt f$. Dividing $f$ by 100 divides $\alpha$ by 10.`],
      sol: md`
        **1. Scale α.** $\alpha \propto \sqrt f$. The frequency fell by 100, so $\alpha$ falls by $\sqrt{100} = 10$:
        $$\alpha = \frac{0.4\pi}{10} = 0.04\pi \approx 0.126\ \text{Np/m}$$
        **2. Depth.** Everything that was divided by $\alpha$ is now 10 times larger:
        $$d_{\max} = \frac{6.9}{0.126}$$
        $$\boxed{d_{\max} \approx 55\ \text{m}}$$
        **3. Wavelength.** $\beta = \alpha$ again:
        $$\lambda = \frac{2\pi}{0.04\pi}$$
        $$\boxed{\lambda = 50\ \text{m}}$$

        !!intuition Does this make sense?
          This is why navies talk to submarines at very low frequencies: every factor of 100 in frequency buys a factor of 10 in depth. The price is bandwidth: at 1 kHz you can send very little information per second.

        **Speed path.** Depth $\propto 1/\sqrt f$: $5.5 \times 10$.

        **Where points go.** Scaling linearly with $f$ (550 m) instead of with $\sqrt f$.
      ` }),
    P({ src: 'Practice H #1(f) · 4 pts', title: 'What about radar?',
      q: md`**(f) (4 pts)** Someone proposes 10 GHz instead. How deep could the submarine be?`,
      parts: [mc('At 10 GHz seawater (with these constants) is', ['an imperfect dielectric', 'a good conductor', 'a perfect dielectric', 'a perfect conductor'], 0,
        [null, md`$\sigma/\omega\epsilon = 8.9\times10^8/10^{10} \approx 0.09$. That is small, not large: the good-conductor formula does not apply.`, md`$\sigma = 4$ S/m is not zero, and $\alpha$ is far from zero.`, md`A perfect conductor needs $\sigma/\omega\epsilon \to \infty$.`]),
        trap(N('depth (m)', 3 * Math.log(10) / (80 * PI / 3), 'm'), [[3 * Math.log(10) / Math.sqrt(PI * 1e10 * EM.mu0 * 4), md`That uses the good-conductor formula $\sqrt{\pi f\mu\sigma}$ at a frequency where the loss tangent is 0.09. That formula needs $\sigma/\omega\epsilon \gg 1$.`]])],
      hints: [md`Check the loss tangent first: $8.9\times10^8/f$.`, md`Imperfect dielectric: $\alpha \approx \dfrac{\sigma}{2}\sqrt{\mu/\epsilon} = \dfrac{\sigma}{2}\cdot\dfrac{120\pi}{\sqrt{\epsilon_r}}$.`],
      sol: md`
        !!trap The trap
          Parts (b)-(e) trained you to reach for $\sqrt{\pi f\mu\sigma}$. At 10 GHz that formula is wrong: check the regime **every** time the frequency changes.

        **1. Regime.** From (a), $\sigma/\omega\epsilon = 8.9\times10^8/f$:
        $$\frac{\sigma}{\omega\epsilon} = \frac{8.9\times10^8}{10^{10}} \approx 0.09 \ll 1$$
        An **imperfect dielectric**: the displacement current is about 11 times the conduction current.

        **2. The right α.** From the sheet, $\alpha \approx \dfrac{\sigma}{2}\sqrt{\mu/\epsilon}$. Here $\sqrt{\mu/\epsilon} = \eta_0/\sqrt{81} = 120\pi/9$:
        $$\alpha \approx \frac{4}{2}\cdot\frac{120\pi}{9} = \frac{80\pi}{3}$$
        $$\alpha \approx 84\ \text{Np/m}$$
        **3. Depth.**
        $$d_{\max} = \frac{6.9}{84}$$
        $$\boxed{d_{\max} \approx 0.082\ \text{m} \approx 8\ \text{cm}}$$
        The good-conductor formula would have given $\alpha = 4\pi\sqrt{10^{10}\times10^{-7}} \approx 400$ Np/m and a depth of under 2 cm: wrong by a factor of almost 5.

        !!intuition Does this make sense?
          In an imperfect dielectric, $\alpha$ stops growing with frequency: it is $\frac{\sigma}{2}\sqrt{\mu/\epsilon}$, with no $f$ in it. So above about 1 GHz seawater has a fixed loss of about 84 Np/m, or 730 dB per meter. Radar cannot see a submerged submarine.

        **Speed path.** Loss tangent $8.9\times10^8/f$ first. If it is small: $\alpha = 60\sigma\pi/\sqrt{\epsilon_r}$, which here is $240\pi/9$.

        **Where points go.** Using the good-conductor formula out of habit. Forgetting $\sqrt{\epsilon_r}$ in $\sqrt{\mu/\epsilon}$.
      ` }),

    // ---------------------------------------------------------------- H Problem 2
    RF(md`
      ### Problem 2 (24 points): two sheets, a quarter wave apart

      In free space, two infinite current sheets radiate at $f = 300$ MHz:
      - sheet A, in the plane $z = 0$: $\mathbf J_A(t) = \cos(\omega t)\,\hat x$ A/m;
      - sheet B, in the plane $z = 0.25$ m: $\mathbf J_B(t) = \sin(\omega t)\,\hat x$ A/m.

      A single sheet $\tilde{\mathbf J}_s$ in the plane $z = z_0$ makes, on both sides,
      $$\tilde{\mathbf E} = -\frac{\eta_0}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z - z_0|}$$
      and the total field is the sum of the two sheets' fields.

      [[fig:two]]
    `, { two: { svg: figH2(), cap: 'Side view. Both sheets carry current along x; B is a quarter wavelength to the right of A.' } }),
    P({ src: 'Practice H #2(a) · 4 pts', title: 'Wavelength and the phasors',
      q: md`**(a) (4 pts)** Find $\lambda$, and write the phasors $\tilde{\mathbf J}_A$ and $\tilde{\mathbf J}_B$.`,
      parts: [N(md`$\lambda$ (m)`, 1, 'm'),
        mc(md`$\tilde{\mathbf J}_B$ (A/m)`, [md`$-j\,\hat x$`, md`$j\,\hat x$`, md`$\hat x$`, md`$-\hat x$`], 0,
          [null, md`$\sin\omega t = \cos(\omega t - 90°)$: a lag of $90°$, which is $e^{-j90°} = -j$, not $+j$.`, md`That is $\tilde{\mathbf J}_A$. B is $90°$ out of step with A.`, md`$-\hat x$ is $-\cos\omega t$, $180°$ from A.`])],
      hints: [md`$\lambda = c/f$. And $\sin\omega t = \cos(\omega t - 90°)$.`],
      sol: md`
        **1. Wavelength.**
        $$\lambda = \frac{c}{f} = \frac{3\times10^8}{3\times10^8} = \boxed{1\ \text{m}}$$
        So $\beta = 2\pi$ rad/m, and the sheets are $0.25$ m $= \lambda/4$ apart: a phase of $\beta(0.25) = \pi/2$ for a wave crossing the gap.

        **2. The phasors.** $\cos\omega t \leftrightarrow 1$, and $\sin\omega t = \cos(\omega t - 90°) \leftrightarrow e^{-j90°} = -j$:
        $$\tilde{\mathbf J}_A = \hat x\ \text{A/m},\qquad \boxed{\tilde{\mathbf J}_B = -j\,\hat x\ \text{A/m}}$$
        B's current lags A's by a quarter period.

        **Speed path.** "sin" is $-j$. Spacing $\lambda/4$ is a $90°$ trip.

        **Where points go.** $+j$ for a sine.
      ` }),
    P({ src: 'Practice H #2(b) · 6 pts', title: 'The field beyond sheet B',
      q: md`**(b) (6 pts)** Find $\tilde{\mathbf E}$ for $z > 0.25$ m.`,
      parts: [trap(N(md`$|\tilde E_x|$ for $z > 0.25$ m (V/m)`, 120 * PI, 'V/m'), [[60 * PI * Math.SQRT2, md`That adds the two sheets' phasors without the extra $e^{+j\pi/2}$ from B's position. B's wave started a quarter wave further along.`], [60 * PI, md`That is one sheet's field. Here two equal waves arrive in step.`]]),
        mc(md`$\tilde{\mathbf E}$ for $z > 0.25$ m (V/m)`, [md`$-120\pi\,e^{-j2\pi z}\,\hat x$`, md`$-60\pi(1 - j)\,e^{-j2\pi z}\,\hat x$`, md`$-120\pi\,e^{+j2\pi z}\,\hat x$`, md`$+120\pi\,e^{-j2\pi z}\,\hat x$`], 0,
          [null, md`That forgets that B's field is $e^{-j\beta(z - 0.25)}$, not $e^{-j\beta z}$: the extra factor $e^{+j\pi/2} = j$ turns $-j$ into $+1$.`, md`$e^{+j2\pi z}$ travels toward $-z$. To the right of both sheets every wave travels toward $+z$.`, md`The sheet law has a minus sign: $\tilde{\mathbf E} = -\frac{\eta_0}{2}\tilde{\mathbf J}$.`])],
      hints: [md`For $z > 0.25$, $|z| = z$ and $|z - 0.25| = z - 0.25$. Pull out $e^{-j\beta z}$; what is left of B's term?`],
      sol: md`
        **1. Each sheet's field for z > 0.25.** Both distances are positive: $|z| = z$ and $|z - 0.25| = z - 0.25$. With $\eta_0/2 = 60\pi$:
        $$\tilde E_A = -60\pi\,e^{-j\beta z}$$
        $$\tilde E_B = -60\pi(-j)\,e^{-j\beta(z - 0.25)}$$
        **2. Pull out the common factor.** $e^{-j\beta(z - 0.25)} = e^{-j\beta z}e^{+j\beta(0.25)}$, and $\beta(0.25) = \pi/2$, so $e^{+j\pi/2} = j$:
        $$\tilde E_B = -60\pi(-j)(j)\,e^{-j\beta z}$$
        $(-j)(j) = 1$:
        $$\tilde E_B = -60\pi\,e^{-j\beta z} = \tilde E_A$$
        **3. Add.**
        $$\boxed{\tilde{\mathbf E} = -120\pi\,e^{-j2\pi z}\,\hat x\ \text{V/m}}$$
        Twice one sheet's field. In time, $\mathbf E = -120\pi\cos(\omega t - 2\pi z)\,\hat x$. The magnetic field of this $+z$ wave is $\tilde{\mathbf H} = \hat z\times\tilde{\mathbf E}/\eta_0 = -e^{-j2\pi z}\,\hat y$ A/m.

        !!intuition Does this make sense?
          A's wave reaches B a quarter period late (it had to cross $\lambda/4$). B fires a quarter period late too. So they leave B together, in step, and add.

        **Speed path.** Delay of the path ($-90°$) equals delay of the current ($-90°$): in step, double.

        **Where points go.** Dropping the $e^{j\beta z_0}$ from B's position. Losing the minus sign of the sheet law.
      ` }),
    P({ src: 'Practice H #2(c) · 4 pts', title: 'The field behind sheet A',
      q: md`**(c) (4 pts)** Find $\tilde{\mathbf E}$ for $z < 0$. What single change to $\mathbf J_B(t)$ would instead send all the radiation toward $-z$?`,
      parts: [mc(md`$\tilde{\mathbf E}$ for $z < 0$`, [md`zero`, md`$-120\pi\,e^{+j2\pi z}\,\hat x$`, md`$-60\pi(1 + j)\,e^{+j2\pi z}\,\hat x$`, md`$-60\pi\,e^{+j2\pi z}\,\hat x$`], 0,
        [null, md`To the left, B's wave arrives a quarter period late from its trip **and** was launched a quarter period late: it is $180°$ behind A's. They cancel.`, md`That leaves out B's position factor $e^{-j\beta(0.25)} = -j$.`, md`That is sheet A alone. Sheet B radiates to the left too.`]),
        mc(md`To send everything toward $-z$, change $\mathbf J_B$ to`, [md`$-\sin\omega t\,\hat x$`, md`$\cos\omega t\,\hat x$`, md`$-\cos\omega t\,\hat x$`, md`$\sin\omega t\,\hat x$, but move B to $z = 0.5$ m`], 0,
          [null, md`In step with A, the two waves are $90°$ apart on both sides: equal power both ways, nothing cancels.`, md`$180°$ from A: again $90°$ apart on both sides after the trip; nothing cancels.`, md`A half-wave spacing adds $180°$ of trip both ways; with a $90°$ current lag, the waves end up $90°$ apart on both sides.`])],
      hints: [md`For $z < 0$, $|z| = -z$ and $|z - 0.25| = 0.25 - z$. Pull out $e^{+j\beta z}$.`],
      sol: md`
        **1. Each sheet's field for z < 0.** Now $|z| = -z$ and $|z - 0.25| = 0.25 - z$:
        $$\tilde E_A = -60\pi\,e^{+j\beta z}$$
        $$\tilde E_B = -60\pi(-j)\,e^{-j\beta(0.25 - z)}$$
        **2. Common factor.** $e^{-j\beta(0.25 - z)} = e^{+j\beta z}e^{-j\pi/2} = -j\,e^{+j\beta z}$:
        $$\tilde E_B = -60\pi(-j)(-j)\,e^{+j\beta z}$$
        $(-j)(-j) = j^2 = -1$:
        $$\tilde E_B = +60\pi\,e^{+j\beta z} = -\tilde E_A$$
        **3. Add.**
        $$\boxed{\tilde{\mathbf E} = 0\ \ \text{for } z < 0}$$
        **4. Reversing it.** Make B **lead** A by $90°$: $\tilde{\mathbf J}_B = +j\hat x$, i.e. $\mathbf J_B = -\sin\omega t\,\hat x$. Then on the right the factor is $(+j)(j) = -1$ (cancel), and on the left $(+j)(-j) = +1$ (add):
        $$\boxed{\mathbf J_B(t) = -\sin\omega t\,\hat x}$$

        !!intuition Does this make sense?
          Going left, A's wave passes B immediately, but B's wave must cross the gap to reach A: it arrives $90°$ late on top of being fired $90°$ late. $180°$ apart, equal size: silence. This is an end-fire array, the idea behind the Yagi antenna.

        **Speed path.** Count lags each way. Right: path $-90°$ for A vs current $-90°$ for B: equal, add. Left: B gets both lags, $-180°$: cancel.

        **Where points go.** Treating "two sheets" as "twice the field everywhere".
      ` }),
    P({ src: 'Practice H #2(d) · 4 pts', title: 'Between the sheets',
      q: md`**(d) (4 pts)** Find $\tilde{\mathbf E}$ for $0 < z < 0.25$ m. What kind of field is it?`,
      parts: [mc(md`$\tilde{\mathbf E}$ for $0 < z < 0.25$ m`, [md`$j120\pi\sin(2\pi z)\,\hat x$: a standing wave`, md`$-120\pi\,e^{-j2\pi z}\,\hat x$: the right-going wave already`, md`$-120\pi\cos(2\pi z)\,\hat x$: a standing wave`, md`$-60\pi\,e^{-j2\pi z}\,\hat x$: only A's wave`], 0,
        [null, md`Between the sheets B's wave travels toward $-z$, so it is still there. Two waves going opposite ways.`, md`That gets the product $(-j)(-j)$ as $+1$. It is $-1$, which turns the cosine into a sine.`, md`B radiates toward $-z$ into the gap too.`])],
      hints: [md`Here $|z| = z$ but $|z - 0.25| = 0.25 - z$: A's wave goes right, B's goes left.`, md`$e^{-j\theta} - e^{+j\theta} = -2j\sin\theta$.`],
      sol: md`
        **1. Each sheet's field.** $|z| = z$ and $|z - 0.25| = 0.25 - z$:
        $$\tilde E_A = -60\pi\,e^{-j\beta z}$$
        $$\tilde E_B = -60\pi(-j)(-j)\,e^{+j\beta z} = +60\pi\,e^{+j\beta z}$$
        (the same steps as in (c)).

        **2. Add.**
        $$\tilde E = -60\pi\left(e^{-j\beta z} - e^{+j\beta z}\right)$$
        $e^{-j\theta} - e^{j\theta} = -2j\sin\theta$:
        $$\tilde E = -60\pi(-2j)\sin\beta z$$
        $$\boxed{\tilde{\mathbf E} = j120\pi\sin(2\pi z)\,\hat x\ \text{V/m}}$$
        Two equal waves going opposite ways: a **standing wave**, with a node at sheet A ($z = 0$) and an antinode at sheet B.

        **3. Check the edges.** At $z = 0$: $0$, which matches the left side ✓. At $z = 0.25$: $j120\pi\sin(\pi/2) = j120\pi$; the right side gives $-120\pi e^{-j\pi/2} = j120\pi$ ✓. Tangential $\mathbf E$ is continuous at both sheets.

        [[fig:mag]]

        **Speed path.** Opposite-going equal waves with a node at $z = 0$: $\sin(\beta z)$, size $2\times60\pi$.

        **Where points go.** Getting $\cos$ for $\sin$ through a sign slip; the node has to be where the left-side field is zero.
      `,
      figs: { mag: { svg: figH2sol(), cap: '|Ẽ(z)|: nothing to the left of A, a standing wave between the sheets, a traveling wave of twice one sheet\'s field to the right of B. Dashed: one sheet alone.' } } }),
    P({ src: 'Practice H #2(e) · 6 pts', title: 'Where the power goes, and who supplies it',
      q: md`**(e) (6 pts)** Find the time-averaged power per square meter flowing toward $+z$ for $z > 0.25$ m. Which sheet supplies it?`,
      parts: [trap(N(md`$\langle S_z\rangle$ for $z > 0.25$ m (W/m²)`, 60 * PI, 'W/m²'), [[15 * PI, md`That is one sheet's power on one side, $(60\pi)^2/2\eta_0$. The field here is twice as big, so the power is four times bigger.`], [30 * PI, md`That adds two single-sheet powers. Fields add, not powers: twice the field is four times the power.`]]),
        mc('Who supplies it?', [md`all of it comes from B; A delivers no net power`, md`each sheet supplies half`, md`all of it comes from A`, md`each supplies $60\pi$ W/m², and half of it is lost between the sheets`], 0,
          [null, md`Compute $-\tfrac12\text{Re}\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\}$ at each sheet. At A the total field is zero, so A delivers nothing.`, md`At A the total $\tilde{\mathbf E}$ is zero: a current in zero field does no work.`, md`Free space is lossless; and the left side gets nothing. $60\pi$ is all there is.`])],
      hints: [md`$\langle S\rangle = |\tilde E|^2/2\eta_0$. A sheet delivers $-\tfrac12\text{Re}\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\}$ per square meter, with $\tilde{\mathbf E}$ the **total** field at the sheet.`],
      sol: md`
        **1. Power to the right.**
        $$\langle S_z\rangle = \frac{|\tilde E|^2}{2\eta_0} = \frac{(120\pi)^2}{240\pi}$$
        $$\boxed{\langle S_z\rangle = 60\pi \approx 188\ \text{W/m}^2}$$
        To the left: $\tilde E = 0$, so nothing.

        **2. Power from each sheet.** A sheet delivers $-\tfrac12\text{Re}\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\}$ per m², with the total field at its plane.
        - Sheet A, $z = 0$: $\tilde E = 0$ there (from (c) or (d)). So A delivers **0**.
        - Sheet B, $z = 0.25$: $\tilde E = j120\pi$ and $\tilde J_B^* = (-j)^* = j$:
        $$\tilde E\,\tilde J_B^* = (j120\pi)(j) = -120\pi$$
        $$P_B = -\tfrac12(-120\pi) = 60\pi\ \text{W/m}^2$$
        $$\boxed{\text{B supplies all } 60\pi\ \text{W/m}^2;\ \text{A supplies none}}$$
        The books balance: $60\pi$ out of B, $60\pi$ carried off to the right, nothing to the left ✓.

        !!intuition Does this make sense?
          One sheet alone would send $15\pi$ each way, $30\pi$ in total. Two sheets far apart (no interference) would send $60\pi$ in total. Here the total is also $60\pi$, but all of it goes one way: interference moves power, it does not create it. Sheet A's current sits at a node of $\mathbf E$, so it does no work on average; it only shapes the pattern.

        **Speed path.** Double the field means four times one sheet's one-sided power: $4\times15\pi$.

        **Where points go.** Adding powers instead of fields. Using one sheet's own field, not the total, in $\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*$.
      ` }),

    // ---------------------------------------------------------------- H Problem 3
    RF(md`
      ### Problem 3 (22 points): a stub and a quarter-wave section

      A source with phasor amplitude $\tilde V_g = 100$ V and $R_g = 50\ \Omega$ drives a long $50\ \Omega$ main line at $f = 500$ MHz. The load is a $200\ \Omega$ resistor in parallel with a capacitor whose impedance at 500 MHz is $-j50\ \Omega$. To match it you add two things: a **shorted stub** of $50\ \Omega$ line across the load terminals, and a **quarter-wave section** of impedance $Z_T$ between the main line and the load. Every line is lossless with $v = 2\times10^8$ m/s.

      [[fig:qw]]
    `, { qw: { svg: figH3(), cap: 'The quarter-wave section sits between the main line and the load; the shorted stub sits across the load.' } }),
    P({ src: 'Practice H #3(a) · 4 pts', title: 'What the stub has to cancel',
      q: md`**(a) (4 pts)** Find the load's susceptance $B_L$ (the imaginary part of $Y_L$), and the impedance the stub must have.`,
      parts: [trap(N(md`$B_L$ (S)`, 0.02, 'S'), [[0.005, md`That is the conductance $1/200$, the real part.`], [-0.02, md`$1/(-j50) = j/50$: a capacitor has **positive** susceptance.`]]),
        mc(md`The stub's impedance must be`, [md`$+j50\ \Omega$ (inductive)`, md`$-j50\ \Omega$ (capacitive)`, md`$50\ \Omega$`, md`$-j200\ \Omega$`], 0,
          [null, md`That adds a second capacitor: the susceptance doubles instead of cancelling.`, md`A lossless stub cannot be a resistor, and a resistor would not cancel a susceptance.`, md`Cancelling $+j0.02$ S needs $-j0.02$ S, which is $1/(-j0.02) = +j50\ \Omega$.`])],
      hints: [md`In parallel, admittances add: $Y_L = \dfrac{1}{200} + \dfrac{1}{-j50}$. Since $1/(-j) = j$, the capacitor gives $+j/50$.`],
      sol: md`
        **1. Admittances add in parallel.**
        $$Y_L = \frac{1}{200} + \frac{1}{-j50}$$
        $1/(-j) = j$, so the second term is $+j/50$:
        $$Y_L = 0.005 + j0.02\ \text{S}$$
        $$\boxed{B_L = 0.02\ \text{S}}$$
        **2. What cancels it.** The stub is in parallel too, so its admittance adds. We want the total to be real:
        $$Y_{\text{stub}} = -j0.02\ \text{S}$$
        $$\boxed{Z_{\text{stub}} = \frac{1}{-j0.02} = +j50\ \Omega}$$
        An inductive stub. With it in place the load looks like $Y = 0.005$ S, a plain $200\ \Omega$.

        !!intuition Does this make sense?
          The capacitor ($-j50$) and the stub ($+j50$) in parallel are a parallel resonant tank: their combined impedance is infinite, so they disappear. Only the 200 Ω resistor is left.

        **Speed path.** Parallel tank: the stub must be the capacitor's mirror, $+j50$.

        **Where points go.** Adding impedances instead of admittances. Getting the sign of $1/(-j)$ wrong.
      ` }),
    P({ src: 'Practice H #3(b) · 5 pts', title: 'The stub length',
      q: md`**(b) (5 pts)** Find the shortest shorted stub that does it. Which other stub would also work?`,
      parts: [trap(N(md`$l_s$ (cm)`, 5, 'cm'), [[15, md`$3\lambda/8$ shorted gives $j50\tan135° = -j50\ \Omega$: capacitive, the wrong sign.`], [2.5, md`That is $\lambda/16$, from using $\lambda = 20$ cm. Here $\lambda = v/f = 40$ cm.`]]),
        mc('Another stub that works', [md`an open stub 15 cm long`, md`an open stub 5 cm long`, md`a shorted stub 15 cm long`, md`a shorted stub 10 cm long`], 0,
          [null, md`An open $\lambda/8$ stub is $-jZ_0\cot45° = -j50\ \Omega$: a capacitor.`, md`A shorted $3\lambda/8$ stub is $j50\tan135° = -j50\ \Omega$: a capacitor.`, md`A shorted $\lambda/4$ stub is an open: it does nothing.`])],
      hints: [md`$\lambda = v/f = 40$ cm. Shorted stub: $Z = jZ_0\tan\beta l$. You need $\tan\beta l = 1$.`],
      sol: md`
        **1. Wavelength.**
        $$\lambda = \frac{v}{f} = \frac{2\times10^8}{5\times10^8} = 0.4\ \text{m} = 40\ \text{cm}$$
        **2. Shorted stub.** $Z = j50\tan\beta l$, and we need $+j50$:
        $$\tan\beta l = 1 \quad\Rightarrow\quad \beta l = \frac{\pi}{4}$$
        $$l_s = \frac{\pi/4}{2\pi/\lambda} = \frac{\lambda}{8}$$
        $$\boxed{l_s = 5\ \text{cm}}$$
        **3. Another one.** An open stub has $Z = -j50\cot\beta l$. For $+j50$ we need $\cot\beta l = -1$, so $\beta l = 3\pi/4$:
        $$l = \frac{3\lambda}{8} = 15\ \text{cm}\ \text{(open)}$$

        **Speed path.** $\pm jZ_0$ always means an eighth wave: shorted $\lambda/8$ is $+jZ_0$, open $\lambda/8$ is $-jZ_0$. Add $\lambda/4$ to swap the sign.

        **Where points go.** Picking the open $\lambda/8$ stub, which is capacitive.
      ` }),
    P({ src: 'Practice H #3(c) · 5 pts', title: 'The quarter-wave section',
      q: md`**(c) (5 pts)** Find $Z_T$ and the physical length of the quarter-wave section.`,
      parts: [trap(N(md`$Z_T$ (Ω)`, 100, 'Ω'), [[125, md`That is the average $(50 + 200)/2$. The match needs the geometric mean, $\sqrt{50\cdot200}$.`]]),
        N('length (cm)', 10, 'cm')],
      hints: [md`A quarter-wave line turns $Z_L$ into $Z_T^2/Z_L$. You want $50\ \Omega$ looking in, with $Z_L = 200\ \Omega$ (stub in place).`],
      sol: md`
        **1. What a quarter wave does.** Over $\lambda/4$, $\Gamma(d)$ turns by $180°$, so $Z \to Z_T^2/Z$. With the stub, the load is a real $200\ \Omega$:
        $$Z_{\text{in}} = \frac{Z_T^2}{200}$$
        **2. Match.** Set $Z_{\text{in}} = 50\ \Omega$:
        $$Z_T^2 = 50\times200 = 10^4$$
        $$\boxed{Z_T = 100\ \Omega}$$
        **3. Length.**
        $$\boxed{l_T = \frac{\lambda}{4} = 10\ \text{cm}}$$

        !!intuition Does this make sense?
          Why the stub had to come first: a quarter-wave section only maps a **real** load to a real input. Without the stub, $Z_L = 11.8 - j47.1\ \Omega$ and the same 100 Ω section gives $Z_{\text{in}} = 100^2/Z_L = 50 + j200\ \Omega$: 80% of the power reflects.

        **Speed path.** $Z_T = \sqrt{Z_0R}$ after the reactance is gone.

        **Where points go.** Plugging the complex $Z_L$ (or $|Z_L|$) into $\sqrt{Z_0Z_L}$. Using $\lambda/2$.
      ` }),
    P({ src: 'Practice H #3(d) · 4 pts', title: 'VSWR on each section',
      q: md`**(d) (4 pts)** Find the VSWR on the main line and inside the quarter-wave section.`,
      parts: [N('VSWR on the main line', 1, ''), trap(N('VSWR in the quarter-wave section', 2, ''), [[4, md`That is $200/50$, the mismatch to the main line. Inside the section the line is $Z_T = 100\ \Omega$: $\Gamma = (200 - 100)/(200 + 100)$.`]])],
      hints: [md`Main line: is it matched? Inside the section, $\Gamma_L = (200 - Z_T)/(200 + Z_T)$, and VSWR $= (1 + |\Gamma|)/(1 - |\Gamma|)$.`],
      sol: md`
        **1. Main line.** It sees $Z_{\text{in}} = 50\ \Omega = Z_0$: no reflection, $\Gamma = 0$:
        $$\boxed{\text{VSWR} = 1}$$
        **2. Inside the section.** It is a $100\ \Omega$ line ending in $200\ \Omega$:
        $$\Gamma = \frac{200 - 100}{200 + 100} = \frac13$$
        $$\text{VSWR} = \frac{1 + 1/3}{1 - 1/3}$$
        $$\boxed{\text{VSWR} = 2}$$
        A standing wave lives inside the transformer; that is how it works. The main line never sees it.

        **Speed path.** VSWR of a real load on a line is the ratio of the larger to the smaller resistance: $200/100 = 2$.

        **Where points go.** Using $Z_0 = 50$ for the section.
      ` }),
    P({ src: 'Practice H #3(e) · 4 pts', title: 'Power and voltage at the load',
      q: md`**(e) (4 pts)** Find the average power delivered to the $200\ \Omega$ resistor and the voltage amplitude across the load.`,
      parts: [trap(N('power (W)', 25, 'W'), [[50, md`That is $|\tilde V_g|^2/4R_g$: the factor $\tfrac12$ for a phasor amplitude is missing.`], [12.5, md`The source sees a matched 50 Ω load, so it gives its full available power, $|\tilde V_g|^2/8R_g$.`]]),
        trap(N(md`$|\tilde V_L|$ (V)`, 100, 'V'), [[50, md`50 V is the voltage at the **input** of the section. A quarter-wave section steps the voltage up by $\sqrt{200/50} = 2$.`]])],
      hints: [md`Matched source: $P = |\tilde V_g|^2/(8R_g)$. Every component after it is lossless, so the resistor gets all of it; then $P = |\tilde V_L|^2/(2\cdot200)$.`],
      sol: md`
        **1. Power.** The source sees $50\ \Omega = R_g$, so it delivers its maximum available power. With $\tilde V_g$ an amplitude:
        $$P = \frac{|\tilde V_g|^2}{8R_g} = \frac{100^2}{8\cdot50}$$
        $$\boxed{P = 25\ \text{W}}$$
        The lines, the stub and the capacitor store energy but absorb none, so all 25 W reach the resistor.

        **2. Load voltage.** For the resistor, $P = |\tilde V_L|^2/(2R)$:
        $$|\tilde V_L|^2 = 2(200)(25) = 10^4$$
        $$\boxed{|\tilde V_L| = 100\ \text{V}}$$

        !!intuition Does this make sense?
          At the section's input the voltage is $\tilde V_g/2 = 50$ V (matched divider). The section steps it up to 100 V, by $\sqrt{200/50} = 2$, the way a transformer would. And the stub carries $100/50 = 2$ A of circulating current, exchanging energy with the capacitor every cycle.

        **Speed path.** Matched: $|V_g|^2/8R_g$. Then $V = \sqrt{2PR}$.

        **Where points go.** Using $|V_g|^2/2R$ (forgets the divider) or $|V_g|^2/4R$ (forgets the phasor $\tfrac12$).
      ` }),

    // ---------------------------------------------------------------- H Problem 4
    RF(md`
      ### Problem 4 (28 points): two lines and a resistor across the junction

      At $t = 0$ a source $V_g(t) = 100\,u(t)$ V with $R_g = 50\ \Omega$ drives line 1 ($Z_{01} = 50\ \Omega$, $0 < z < 200$ m). At $z = 200$ m line 1 joins line 2 ($Z_{02} = 100\ \Omega$, $200 < z < 400$ m), and a resistor $R = 100\ \Omega$ is connected across the junction. The load is $R_L = 300\ \Omega$ at $z = 400$ m. Both lines have $v = 2\times10^8$ m/s, so each takes 1 µs to cross.

      [[fig:jx]]
    `, { jx: { svg: figH4(), cap: 'The resistor R sits across the line at the junction, in parallel with whatever lies beyond it.' } }),
    P({ src: 'Practice H #4(a) · 4 pts', title: 'The ends',
      q: md`**(a) (4 pts)** Find $\tau_g$ and $\Gamma_L$. What is $\Gamma_g$?`,
      parts: [N(md`$\tau_g$`, 0.5, ''), trap(N(md`$\Gamma_L$`, 0.5, ''), [[5 / 7, md`That uses $Z_{01} = 50\ \Omega$: $(300 - 50)/(300 + 50)$. The load sits at the end of line 2, so use $Z_{02} = 100\ \Omega$.`]])],
      hints: [md`$\tau_g = Z_{01}/(R_g + Z_{01})$; $\Gamma_L$ uses the line the load is on: $Z_{02}$.`],
      sol: md`
        **1. Launch.** Line 1 looks like $50\ \Omega$ at first:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{50}{100} = \boxed{\tfrac12}$$
        so the first wave is $V_1^+ = 50$ V.

        **2. Source end.** $\Gamma_g = (50 - 50)/(50 + 50) = 0$: the source is matched to line 1, and any wave coming back is absorbed.

        **3. Load end.** The load sits on line 2:
        $$\Gamma_L = \frac{300 - 100}{300 + 100} = \boxed{\tfrac12}$$

        **Speed path.** Matched source: one launch, no source bounces. $300$ on $100$: $200/400$.

        **Where points go.** Computing $\Gamma_L$ with $Z_{01}$.
      ` }),
    P({ src: 'Practice H #4(b) · 8 pts', title: 'The junction, both ways',
      q: md`**(b) (8 pts)** Find the reflection and transmission coefficients at the junction for a wave arriving from line 1, and for a wave arriving from line 2.`,
      parts: [mc('A wave arriving from line 1 sees', [md`$R\parallel Z_{02} = 50\ \Omega$: $\Gamma_{12} = 0$, $\tau_{12} = 1$`, md`$Z_{02} = 100\ \Omega$: $\Gamma_{12} = \tfrac13$, $\tau_{12} = \tfrac43$`, md`$R + Z_{02} = 200\ \Omega$: $\Gamma_{12} = \tfrac35$, $\tau_{12} = \tfrac85$`, md`$R\parallel Z_{02} = 50\ \Omega$: $\Gamma_{12} = 0$, $\tau_{12} = \tfrac12$, since R takes half`], 0,
        [null, md`That ignores the resistor. A wave arriving at the junction sees R and line 2 side by side.`, md`R is across the line, in parallel with line 2, not in series.`, md`$\tau$ is a **voltage** ratio, and the voltage is shared by everything in parallel: $\tau = 1 + \Gamma = 1$. It is the current that splits between R and line 2.`]),
        trap(N(md`$\Gamma_{21}$`, -0.5, ''), [[-1 / 3, md`That ignores R: $(50 - 100)/(50 + 100)$. Looking back from line 2, the wave sees $R\parallel Z_{01} = 100/3\ \Omega$.`]]),
        N(md`$\tau_{21}$`, 0.5, '')],
      hints: [md`A wave on a line sees, at the junction, everything beyond it in parallel. From line 1: $R\parallel Z_{02}$. From line 2: $R\parallel Z_{01}$.`, md`$\Gamma = (Z_{\text{seen}} - Z_{\text{own}})/(Z_{\text{seen}} + Z_{\text{own}})$ and $\tau = 1 + \Gamma$, because the voltage is the same on both sides of the junction.`],
      sol: md`
        **1. Why parallel.** At the instant a wave reaches the junction, nothing has come back yet from beyond it. So the next line looks like a resistor equal to its $Z_0$, sitting across the same two wires as $R$. The arriving wave sees them **in parallel**.

        **2. From line 1.**
        $$Z_{\text{seen}} = R\parallel Z_{02} = 100\parallel100 = 50\ \Omega$$
        $$\Gamma_{12} = \frac{50 - 50}{50 + 50} = 0$$
        $$\tau_{12} = 1 + \Gamma_{12} = \boxed{1}$$
        No reflection: the resistor makes the junction look matched from the left.

        **3. From line 2.**
        $$Z_{\text{seen}} = R\parallel Z_{01} = \frac{100\cdot50}{150} = \frac{100}{3}\ \Omega$$
        $$\Gamma_{21} = \frac{100/3 - 100}{100/3 + 100}$$
        Multiply top and bottom by 3:
        $$\Gamma_{21} = \frac{100 - 300}{100 + 300} = \boxed{-\tfrac12}$$
        $$\tau_{21} = 1 - \tfrac12 = \boxed{\tfrac12}$$
        Here $\tau = 1 + \Gamma$ is the **transmission coefficient**: the voltage just past the junction over the arriving voltage. It is $1 + \Gamma$ because the junction has one voltage.

        !!intuition Does this make sense?
          From the left, R steals current but the voltage passes straight into line 2. From the right, the junction looks like a low resistance (33 Ω on a 100 Ω line), so it reflects with a minus sign, like a partial short.

        **Speed path.** "Across the junction" means parallel, with whichever line is on the other side.

        **Where points go.** Ignoring R. Putting R in series. Splitting $\tau$ between R and the line.
      ` }),
    P({ src: 'Practice H #4(c) · 6 pts', title: 'The bounce diagram',
      q: md`**(c) (6 pts)** Draw the bounce diagram for $0 \le t \le 6$ µs. Give the first wave in line 2, its reflection from the load, and the wave the junction sends back into line 1 at $t = 3$ µs.`,
      parts: [N('first wave in line 2 (V)', 50, 'V'), N('its reflection from the load (V)', 25, 'V'),
        trap(N('wave sent into line 1 at 3 µs (V)', 12.5, 'V'), [[-12.5, md`That is the wave reflected **back into line 2** ($\Gamma_{21}\times25$). Into line 1 goes $\tau_{21}\times25 = +12.5$ V.`]])],
      hints: [md`$V_1^+ = 50$ V crosses the junction unchanged ($\tau_{12} = 1$) at 1 µs, reflects off the load at 2 µs, and is back at the junction at 3 µs, where it splits with $\Gamma_{21}$ and $\tau_{21}$.`],
      sol: md`
        **1. Line 1, first trip.** $V_1^+ = \tau_gV_g = 50$ V. It reaches the junction at 1 µs. $\Gamma_{12} = 0$, so nothing reflects, and line 2 gets
        $$\tau_{12}(50) = \boxed{50\ \text{V}}$$
        **2. The load,** at 2 µs:
        $$\Gamma_L(50) = \tfrac12(50) = \boxed{25\ \text{V}}$$
        **3. Back at the junction,** at 3 µs, the 25 V wave splits:
        $$\text{into line 1: } \tau_{21}(25) = \boxed{12.5\ \text{V}}$$
        $$\text{back into line 2: } \Gamma_{21}(25) = -12.5\ \text{V}$$
        **4. And on.** The $12.5$ V wave reaches the source at 4 µs and is absorbed ($\Gamma_g = 0$). The $-12.5$ V wave hits the load at 4 µs and returns $-6.25$ V, which at 5 µs splits into $-3.125$ V (line 1) and $+3.125$ V (line 2). Each round trip in line 2 multiplies by $\Gamma_L\Gamma_{21} = -\tfrac14$.

        [[fig:bd]]

        **Speed path.** Line 2 is a "cavity" between $\Gamma_{21} = -\tfrac12$ and $\Gamma_L = \tfrac12$; each time a wave hits the junction from the right, half of it leaks into line 1 and never comes back.

        **Where points go.** Sending $\Gamma_{21}$'s wave into line 1. Letting the 12.5 V wave bounce at the matched source.
      `,
      figs: { bd: { svg: TL.diagram(sH4, { tMax: 6, w: 400, h: 340 }), cap: 'Bounce diagram. Dashed: the junction at z = 200 m. The first wave passes the junction unreflected; after that, line 2 rings and leaks into line 1.' } } }),
    P({ src: 'Practice H #4(d) · 5 pts', title: 'V(z, t) at two points',
      q: md`**(d) (5 pts)** Find $V(300\,\text{m}, t)$ at $t = 3$ µs and $t = 5$ µs, and $V(100\,\text{m}, t)$ at $t = 4$ µs.`,
      parts: [N(md`$V(300\,\text{m}, 3\,\mu\text{s})$ (V)`, 75, 'V'), N(md`$V(300\,\text{m}, 5\,\mu\text{s})$ (V)`, 56.25, 'V'), N(md`$V(100\,\text{m}, 4\,\mu\text{s})$ (V)`, 62.5, 'V')],
      hints: [md`$z = 300$ m is the middle of line 2: waves pass it half a microsecond after leaving either end of line 2. $z = 100$ m is the middle of line 1.`],
      sol: md`
        **1. At z = 300 m** (middle of line 2), the waves pass at:
        - 1.5 µs: $+50$ → 50 V
        - 2.5 µs: $+25$ → 75 V
        - 3.5 µs: $-12.5$ → 62.5 V
        - 4.5 µs: $-6.25$ → 56.25 V
        - 5.5 µs: $+3.125$ → 59.375 V

        $$\boxed{V(300, 3) = 75\ \text{V},\quad V(300, 5) = 56.25\ \text{V}}$$
        **2. At z = 100 m** (middle of line 1): $+50$ at 0.5 µs, then nothing comes back until the $12.5$ V wave passes at 3.5 µs:
        $$\boxed{V(100, 4) = 62.5\ \text{V}}$$

        [[fig:v300]]

        **Speed path.** List the arrival times once (odd half-microseconds for both midpoints) and keep a running sum.

        **Where points go.** Forgetting that line 1 is quiet from 0.5 µs to 3.5 µs: the junction sends nothing back at 1 µs.
      `,
      figs: { v300: { svg: TL.plotT(sH4, 300, { tMax: 6 }), cap: 'V(300 m, t). It rings around the dashed steady state, 60 V, with ratio −1/4 per round trip.' } } }),
    P({ src: 'Practice H #4(e) · 5 pts', title: 'Steady state',
      q: md`**(e) (5 pts)** As $t\to\infty$, find the voltage across the load, the current through $R$, and the current leaving the source.`,
      parts: [N(md`$V$ (V)`, 60, 'V'), N(md`$I_R$ (A)`, 0.6, 'A'), N(md`$I_g$ (A)`, 0.8, 'A')],
      hints: [md`In steady state the lines are wires. $R$ and $R_L$ are in parallel, in series with $R_g$.`],
      sol: md`
        **1. The DC circuit.** Both lines become wires, so $R$ and $R_L$ sit in parallel across the same two nodes:
        $$R\parallel R_L = \frac{100\cdot300}{400} = 75\ \Omega$$
        **2. Divider.**
        $$V = 100\cdot\frac{75}{50 + 75} = \boxed{60\ \text{V}}$$
        **3. Currents.**
        $$I_R = \frac{60}{100} = \boxed{0.6\ \text{A}}$$
        $$I_L = \frac{60}{300} = 0.2\ \text{A}$$
        $$I_g = 0.6 + 0.2 = \boxed{0.8\ \text{A}}$$
        Check: $I_g = (100 - 60)/50 = 0.8$ A ✓.

        !!intuition Does this make sense?
          The bounce sum agrees: at the load, $75 - 18.75 + 4.69 - \dots = 75/(1 + 1/4) = 60$ V ✓, a geometric series with ratio $-\tfrac14$.

        **Speed path.** Lines are wires; $R\parallel R_L$; divider.

        **Where points go.** Forgetting R in the DC circuit, which gives $100\cdot300/350 = 85.7$ V.
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-h', order: 8, title: 'Practice exam H', kind: 'mock', sub: '75 min · 100 pts · seawater and a submarine, two sheets a quarter wave apart, a stub plus a quarter-wave section, two lines with a resistor at the junction', steps: examH });

  // ======================================================================================== EXAM I: figures
  // Q1(d): three panels of snapshots, each curve one instant
  const snapPanel = (curves, extra = []) => plot({ w: 290, h: 150, mb: 12, x: [0, 4.2], y: [-2.4, 2.4], zero: true, xl: 'z', curves: curves.concat(extra) });
  const figI1d = () => PF.row([
    { svg: snapPanel([1, 0.6, 0.2, -0.2, -0.6, -1].map((c, k) => ({ f: (z) => 2 * c * Math.sin(PI * z), cls: k % 2 ? 'thin' : '' }))), cap: 'A' },
    { svg: snapPanel([0, PI / 3, (2 * PI) / 3].map((ph, k) => ({ f: (z) => 1.5 * Math.cos(PI * z - ph), cls: k % 2 ? 'thin' : '' }))), cap: 'B' },
    { svg: snapPanel([0, PI / 3, (2 * PI) / 3].map((wt, k) => ({ f: (z) => Math.cos(wt - PI * z) + 0.5 * Math.cos(wt + PI * z), cls: k % 2 ? 'thin' : '' })),
      [{ f: (z) => Math.sqrt(1.25 + Math.cos(2 * PI * z)), cls: 'dash dim' }, { f: (z) => -Math.sqrt(1.25 + Math.cos(2 * PI * z)), cls: 'dash dim' }]), cap: 'C' },
  ]).svg;
  const figI3 = () => circuit([
    { t: 'gen', R: 'R_g = 50\\,\\Omega', V: '\\text{pulse}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 84, lab: 'Z_{01} = 50\\,\\Omega', sub: 'T = 1\\,\\mu\\text{s}' }, { t: 'wire', w: 8 },
    { t: 'line', w: 96, lab: 'Z_{02} = 150\\,\\Omega', sub: 'T = 2\\,\\mu\\text{s}' }, { t: 'wire', w: 8 },
    { t: 'line', w: 84, lab: 'Z_{03} = 75\\,\\Omega', sub: 'T = 1\\,\\mu\\text{s}' },
    { t: 'R', lab: '75\\,\\Omega', last: true },
  ], { alt: 'a pulse source with Rg = 50 ohms drives three line sections in a row: 50 ohms taking 1 microsecond, 150 ohms taking 2 microseconds, 75 ohms taking 1 microsecond, ending in a 75-ohm load' });
  const figI4c = () => circuit([
    { t: 'gen', R: 'R_g\\ ?', V: '45\\delta(t)' }, { t: 'wire', w: 14 },
    { t: 'line', w: 140, lab: 'Z_0 = 60\\,\\Omega', sub: '\\text{probe: middle}' },
    { t: 'R', lab: 'R_L\\ ?', last: true },
  ], { ticks: [[2, '0'], [2, '100\\,\\text{m}', 0.5], [3, '200\\,\\text{m}']], alt: 'a delta-function source of strength 45 with unknown Rg drives a 60-ohm line 200 m long ending in an unknown load; the probe is at the middle, z = 100 m' });
  const figI4t = () => plot({
    w: 360, h: 190, x: [0, 8.5], y: [-0.55, 1.3], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'V(100\\,\\text{m},t)',
    xt: [[1, '1'], [3, '3'], [5, '5'], [7, '7']],
    curves: [[1, 1], [3, -1 / 3], [5, 1 / 9], [7, -1 / 27]].map(([t, a]) => ({ pts: [[t, 0], [t, a]] })),
    pts: [{ x: 1, y: 1, lab: 'A' }, { x: 3, y: -1 / 3, lab: '-A/3', anchor: 'tl' }, { x: 5, y: 1 / 9, lab: 'A/9' }, { x: 7, y: -1 / 27, lab: '-A/27', anchor: 'tl' }],
  });
  const sI5 = TL.solve({ Vg: 100, Rg: 50, RL: Infinity, sections: [{ Z0: 50, len: 400, v: 200 }], tMax: 12 });
  // the 6 µs pulse is a step at 0 minus a step at 6 µs, so V and I come straight from TL.valueAt
  const pulseAt = (z, t, q) => TL.valueAt(sI5, z, t, q) - (t >= 6 ? TL.valueAt(sI5, z, t - 6, q) : 0);
  const figI5plot = (q) => {
    const ts = [0, 4, 6, 10, 12], pts = [[0, 0]];
    for (let k = 0; k + 1 < ts.length; k++) { const v = pulseAt(0, (ts[k] + ts[k + 1]) / 2, q); pts.push([ts[k], v], [ts[k + 1], v]); }
    const V = q === 'V';
    return plot({ w: 380, h: V ? 190 : 210, x: [0, 12.6], y: V ? [0, 122] : [-1.35, 1.4], zero: true, xl: 't\\,(\\mu\\text{s})', yl: V ? 'V(0,t)\\ (\\text{V})' : 'I(0,t)\\ (\\text{A})',
      xt: [[4, '4'], [6, '6'], [10, '10']], yt: V ? [[50, '50'], [100, '100']] : [[1, '1'], [-1, '-1']], curves: [{ pts }] });
  };
  const figI5c = () => circuit([
    { t: 'gen', R: 'R_g = 50\\,\\Omega', V: 'f(t)' }, { t: 'wire', w: 14 },
    { t: 'line', w: 130, lab: 'Z_0 = 50\\,\\Omega', sub: 'T = 2\\,\\mu\\text{s}' },
    { t: 'open' },
  ], { ticks: [[2, '0'], [3, '400\\,\\text{m}']], alt: 'a source f(t) with Rg = 50 ohms drives a 50-ohm line 400 m long; the far end is open' });
  const figI5f = () => plot({
    w: 300, h: 150, x: [-1, 12], y: [0, 125], xl: 't\\,(\\mu\\text{s})', yl: 'f(t)\\ (\\text{V})', xt: [[0, '0'], [6, '6']], yt: [[100, '100']],
    curves: [{ pts: [[-1, 0], [0, 0], [0, 100], [6, 100], [6, 0], [12, 0]] }],
  });
  const figI6 = () => plot({
    w: 360, h: 190, x: [0, 4.3], y: [0, 5.9], xl: 'z\\,(\\text{m})', yl: '\\langle S_z\\rangle\\ (\\text{W/m}^2)',
    xt: [[1, '1'], [2, '2'], [3, '3']], yt: [[5, '5']], curves: [{ f: (z) => 5 * Math.exp(-z) }],
  });
  // Q7: eight candidate shapes, d from the load (d = 0) to the input (d = l)
  const I7 = [['A', (d) => Math.cos(PI * d)], ['B', (d) => Math.sin(PI * d)], ['C', (d) => Math.cos(PI * d / 2)], ['D', (d) => Math.sin(PI * d / 2)],
    ['E', (d) => Math.cos(2 * PI * d)], ['F', (d) => Math.sin(2 * PI * d)], ['G', (d) => Math.cos(1.5 * PI * d)], ['H', (d) => Math.sin(1.5 * PI * d)]];
  const figI7 = () => PF.row(I7.map(([L, f]) => ({
    svg: plot({ w: 150, h: 96, x: [0, 1.15], y: [-1.3, 1.3], zero: true, xl: 'd', xt: [[0.5, 'l/2'], [1, 'l']], curves: [{ f, to: 1 }] }), cap: L,
  }))).svg;

  // ======================================================================================== EXAM I
  const PARTI = md`Part I is multiple choice. In a "circle all that apply" question, each statement is its own True/False part below; on the paper you would circle the true ones. Some need a short calculation; on the exam, work shown can earn partial credit.`;
  const examI = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** This paper copies the shape of the Fall 2023 Exam 3 (Goddard, Ilie, Zhao): seven questions in two parts. **Part I** is multiple choice: "circle all that apply" statements on concepts, polarization cases, and transmission-line questions where you pick a number from a list. **Part II** is worked problems: a pulse on a line to sketch, power in a good conductor, and resonances. A different instructor may write this term's exam in this style, so it is worth one sitting.

      | Question | Topic | Points |
      |---|---|---|
      | 1 | Circle all that apply: loss tangent, standing-wave energy, adding polarizations, which plot is a standing wave | 12 |
      | 2 | Name the polarization of three $\mathbf H$ fields going toward $-z$ | 9 |
      | 3 | A three-section line: $\tau_g$, $\Gamma$, current reflection, timing | 12 |
      | 4 | Read a scope trace backwards: $R_L$, $R_g$, the pulse height, $\epsilon_r$ | 16 |
      | 5 | A pulse on a line with an open end: $V(0,t)$ and $I(0,t)$ | 22 |
      | 6 | Power going down into wet soil: $\eta$, $\langle S\rangle$, dB per meter | 13 |
      | 7 | Resonances of a line open at both ends | 16 |

      **Draws on:** [γ and η](#/l/w2-gamma), [power in lossy media](#/l/w2-loss), [polarization](#/l/w3-pol), [standing waves](#/l/w4-standing), [bounce diagrams](#/l/w5-bounce), [junctions and scope traces](#/l/w5-multi) and [stubs and resonance](#/l/w6-stubs).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- I Question 1
    R(md`
      ### Part I. Question 1 (12 points): circle all that apply

      ${PARTI}
    `),
    P({ src: 'Practice I #1(a) · 3 pts', title: 'The loss tangent',
      q: md`**(a) (3 pts)** Which statements about the loss tangent $\sigma/\omega\epsilon$ are true?`,
      parts: [
        tf(md`(i) It is the ratio of the amplitude of the conduction current density to that of the displacement current density.`, true, md`Conduction current is $\sigma\tilde E$ and displacement current is $j\omega\epsilon\tilde E$. The ratio of their sizes is $\sigma/\omega\epsilon$ exactly: that is its definition.`),
        tf(md`(ii) $\tan^{-1}(\sigma/\omega\epsilon)$ is the angle by which the displacement current density leads the total current density.`, true, md`Displacement current $j\omega\epsilon\tilde E$ sits at $+90°$; the total $(\sigma + j\omega\epsilon)\tilde E$ sits at $\tan^{-1}(\omega\epsilon/\sigma)$. The difference is $90° - \tan^{-1}(\omega\epsilon/\sigma) = \tan^{-1}(\sigma/\omega\epsilon)$.`),
        tf(md`(iii) If $\sigma/\omega\epsilon = 1$, then $H$ lags $E$ by $45°$.`, false, md`$\tau = \tfrac12\tan^{-1}(1) = 22.5°$. The angle of $\eta$ is half the angle $\tan^{-1}(\sigma/\omega\epsilon)$; $45°$ is reached only in the good-conductor limit.`),
        tf(md`(iv) With $\sigma$ and $\epsilon$ fixed, raising the frequency raises the loss tangent.`, false, md`$\omega$ is in the denominator. Higher frequency, smaller loss tangent: a material looks more like a dielectric at high frequency.`),
      ],
      hints: [md`Write both currents as phasors: $\sigma\tilde E$ (in phase with $\tilde E$) and $j\omega\epsilon\tilde E$ ($90°$ ahead). Draw them as arrows.`],
      sol: md`
        **True: (i) and (ii).**

        **(i)** In phasors, $\nabla\times\tilde{\mathbf H} = \sigma\tilde{\mathbf E} + j\omega\epsilon\tilde{\mathbf E}$. The sizes of the two terms are $\sigma|\tilde E|$ and $\omega\epsilon|\tilde E|$, and their ratio is $\sigma/\omega\epsilon$. True.

        **(ii)** Draw the arrows. Conduction current: along the real axis (length $\sigma$). Displacement current: straight up (length $\omega\epsilon$). The total is the diagonal, at angle $\tan^{-1}(\omega\epsilon/\sigma)$ above the real axis. The displacement arrow is at $90°$, so it leads the total by
        $$90° - \tan^{-1}\frac{\omega\epsilon}{\sigma} = \tan^{-1}\frac{\sigma}{\omega\epsilon}$$
        (the two acute angles of a right triangle add to $90°$). True.

        **(iii)** $\tau = \tfrac12\tan^{-1}(1) = 22.5°$. False.

        **(iv)** $\sigma/\omega\epsilon\propto1/\omega$: it falls as $f$ rises. False.

        **Speed path.** Know the triangle: legs $\sigma$ and $\omega\epsilon$. Every loss-tangent statement is about that triangle, then a halving for $\tau$.

        **Where points go.** Forgetting to halve for $\tau$. Mixing up which current leads which.
      ` }),
    P({ src: 'Practice I #1(b) · 3 pts', title: 'Energy in a standing wave',
      q: md`**(b) (3 pts)** In free space ($z < 0$) a plane wave hits a perfect conductor at $z = 0$, and the total field is the standing wave
      $$\mathbf E = 2E_0\sin(\beta z)\sin(\omega t)\,\hat x$$
      $$\mathbf H = \frac{2E_0}{\eta_0}\cos(\beta z)\cos(\omega t)\,\hat y$$
      Which statements are true?`,
      parts: [
        tf(md`(i) The time-averaged Poynting vector is zero at every point.`, true, md`$\tilde E \propto -j\sin\beta z$ and $\tilde H \propto \cos\beta z$ are $90°$ apart in time, so $\tilde E\tilde H^*$ is purely imaginary and its real part is zero everywhere.`),
        tf(md`(ii) At the instants when $\mathbf E = 0$ everywhere, the energy density $\tfrac12\epsilon_0\mathbf E\cdot\mathbf E + \tfrac12\mu_0\mathbf H\cdot\mathbf H$ is zero everywhere.`, false, md`$\mathbf E = 0$ everywhere when $\sin\omega t = 0$, and then $\cos\omega t = \pm1$: $\mathbf H$ is at its peak. The energy is all magnetic at that instant, not gone.`),
        tf(md`(iii) On the conductor's surface ($z = 0$) the stored energy is all magnetic.`, true, md`$\sin(\beta\cdot0) = 0$, so $\mathbf E = 0$ there at all times, while $\cos(0) = 1$ puts $\mathbf H$ at its largest. Only the magnetic term is left.`),
        tf(md`(iv) The instantaneous Poynting vector $\mathbf E\times\mathbf H$ is zero everywhere at all times.`, false, md`$\mathbf E\times\mathbf H \propto \sin\beta z\cos\beta z\sin\omega t\cos\omega t = \tfrac14\sin2\beta z\sin2\omega t$. It sloshes energy back and forth at $2\omega$; only its time average is zero.`),
      ],
      hints: [md`Compare the time factors: $\sin\omega t$ for $\mathbf E$, $\cos\omega t$ for $\mathbf H$. When one is zero, the other is at its peak.`],
      sol: md`
        **True: (i) and (iii).**

        **(i)** The phasors are $\tilde E_x = -j2E_0\sin\beta z$ and $\tilde H_y = (2E_0/\eta_0)\cos\beta z$. Then
        $$\tilde E_x\tilde H_y^* = -j\frac{4E_0^2}{\eta_0}\sin\beta z\cos\beta z$$
        which is purely imaginary, so $\langle S_z\rangle = \tfrac12\text{Re}\{\cdot\} = 0$. True. A standing wave carries no net power.

        **(ii)** At $\sin\omega t = 0$, $\mathbf E$ vanishes everywhere, but $\cos\omega t = \pm1$, so the energy density is $\tfrac12\mu_0(2E_0/\eta_0)^2\cos^2\beta z$: not zero (except at the $\mathbf H$ nodes). False. The energy swaps between electric and magnetic form; the total in each half wavelength stays constant.

        **(iii)** At $z = 0$, $\sin0 = 0$ kills $\mathbf E$ for all time; $\cos0 = 1$. True.

        **(iv)** Multiply the two fields: $\mathbf E\times\mathbf H$ is along $\hat z$ with size proportional to $\sin2\beta z\,\sin2\omega t$. Not zero. False.

        **Speed path.** In a standing wave, $E$ and $H$ are $90°$ apart in **both** space and time. Zero average power, nonzero instantaneous power, energy that changes form.

        **Where points go.** Treating "no average power" as "no power at any instant", and "no $E$" as "no energy".
      ` }),
    P({ src: 'Practice I #1(c) · 3 pts', title: 'Adding polarizations',
      q: md`**(c) (3 pts)** All waves here have the same frequency and travel toward $+z$. Which statements are true?`,
      parts: [
        tf(md`(i) Any linearly polarized wave is the sum of a right-handed and a left-handed circularly polarized wave of equal amplitude.`, true, md`$\hat x = \tfrac12(\hat x - j\hat y) + \tfrac12(\hat x + j\hat y)$: a right-handed and a left-handed circular wave of equal size. Rotate the axes for any other direction.`),
        tf(md`(ii) The sum of two linearly polarized waves is always linearly polarized.`, false, md`$\hat x\cos(\omega t - \beta z)$ and $\hat y\sin(\omega t - \beta z)$ are both linear, and their sum is circular. Linear plus linear stays linear only when the two are in phase or $180°$ apart.`),
        tf(md`(iii) Any elliptically polarized wave is the sum of two linearly polarized waves, one along $\hat x$ and one along $\hat y$.`, true, md`Any phasor $\tilde E_x\hat x + \tilde E_y\hat y$ already is such a sum: each component alone is a linear wave.`),
        tf(md`(iv) A right-handed and a left-handed circular wave of different amplitudes add to a circularly polarized wave.`, false, md`$2(\hat x - j\hat y) + (\hat x + j\hat y) = 3\hat x - j\hat y$: unequal components $90°$ apart. That is elliptical (right-handed: the bigger one wins).`),
      ],
      hints: [md`Write each circular wave as a phasor: right-handed toward $+z$ is $\hat x - j\hat y$, left-handed is $\hat x + j\hat y$. Then just add phasors.`],
      sol: md`
        **True: (i) and (iii).**

        **(i)** Add the two circular phasors of equal size:
        $$\tfrac12(\hat x - j\hat y) + \tfrac12(\hat x + j\hat y) = \hat x$$
        The $\hat y$ parts cancel and the result is linear along $\hat x$. True.

        **(ii)** Counterexample: $\hat x$ plus $-j\hat y$ (a linear wave along $\hat y$ that lags by $90°$) is $\hat x - j\hat y$, circular. False.

        **(iii)** A phasor $\tilde E_x\hat x + \tilde E_y\hat y$ is, by its very form, an $\hat x$-linear wave plus a $\hat y$-linear wave. True.

        **(iv)**
        $$2(\hat x - j\hat y) + (\hat x + j\hat y) = 3\hat x - j\hat y$$
        Unequal sizes (3 and 1), $90°$ apart: elliptical. False.

        **Speed path.** Turn every wave into a phasor and add. Polarization is a property of the sum's two components: their size ratio and their phase difference.

        **Where points go.** Thinking polarization types add like labels ("linear + linear = linear").
      ` }),
    P({ src: 'Practice I #1(d) · 3 pts', title: 'Which plot is a standing wave?',
      q: md`**(d) (3 pts)** Each panel shows one field component along $z$ at several instants (one curve per instant; panel C also shows its envelope, dashed). Which statements are true?

      [[fig:pan]]`,
      figs: { pan: { svg: figI1d(), cap: 'Three fields, each drawn at several instants.' } },
      parts: [
        tf(md`(i) Panel A could show the electric field of a standing wave.`, true, md`A's zeros stay put while its height changes with time: the signature of a standing wave, $\sin(\beta z)\cos(\omega t)$.`),
        tf(md`(ii) Panel A could show the magnetic field of a standing wave.`, true, md`$\mathbf H$ of a standing wave is also a standing pattern with fixed nodes, just shifted $\lambda/4$ from $\mathbf E$'s. Nothing in the picture tells you which field it is.`),
        tf(md`(iii) Panel B could show a standing wave.`, false, md`In B every snapshot has the same height and the pattern slides along $z$: a traveling wave. A standing wave keeps its zeros fixed and changes height.`),
        tf(md`(iv) Panel C shows total reflection, $|\Gamma| = 1$.`, false, md`C's envelope never reaches zero: its minimum is one third of its maximum. That is a VSWR of 3, so $|\Gamma| = (3 - 1)/(3 + 1) = \tfrac12$. Total reflection has true nodes.`),
      ],
      hints: [md`Standing: zeros fixed, height changes. Traveling: height fixed, pattern moves. Partial: a wave on top of a standing wave, with an envelope that never reaches zero.`],
      sol: md`
        **True: (i) and (ii).**

        **(i), (ii)** Panel A is $2\sin(\beta z)\times$ (a number that changes with time): every curve has its zeros at the same places. A standing wave. Both $\mathbf E$ and $\mathbf H$ of a standing wave look like this; $\mathbf H$'s nodes sit where $\mathbf E$'s peaks are, but one panel alone cannot show that. Both true.

        **(iii)** Panel B's curves all have the same height and are shifted copies of each other: $\cos(\omega t - \beta z)$ at three instants. Traveling. False.

        **(iv)** Panel C's envelope swings between $0.5$ and $1.5$:
        $$\text{VSWR} = \frac{1.5}{0.5} = 3$$
        $$|\Gamma| = \frac{\text{VSWR} - 1}{\text{VSWR} + 1} = \frac12$$
        A partial standing wave, not total reflection. False.

        **Speed path.** Look at the zeros first. Fixed zeros: standing. Moving zeros, same height: traveling. No zeros at all in the envelope: partial.

        **Where points go.** Choosing "E only" for A: the picture cannot tell $E$ from $H$.
      ` }),

    // ---------------------------------------------------------------- I Question 2
    P({ src: 'Practice I #2 · 9 pts', title: 'Question 2 (9 points): name the polarization',
      q: md`A wave in a lossless medium carries the magnetic field
      $$\begin{aligned}\mathbf H = {}&\hat x\,A\cos(\omega t + kz)\\ &+ \hat y\,B\cos(\omega t + kz + \phi)\end{aligned}$$
      with $k > 0$. Identify the polarization in each case, 3 points each ($A$ and $B$ in A/m).`,
      parts: [
        mc(md`**(a)** $A = 3$, $B = 3$, $\phi = -\pi/2$`, ['linear', 'right-handed circular', 'left-handed circular', 'right-handed elliptical', 'left-handed elliptical'], 2,
          [md`Linear needs $\phi = 0$ or $\pi$. Here $\phi = -\pi/2$.`, md`The tip turns $\hat x\to\hat y$, and $\hat x\times\hat y = +\hat z$, but this wave travels toward $-z$ ($\omega t + kz$). With the thumb on $-z$ that rotation is left-handed.`, null, md`$A = B$ and $90°$: circular, not elliptical.`, md`$A = B$ and $90°$: circular, not elliptical.`], true),
        mc(md`**(b)** $A = 2$, $B = 6$, $\phi = \pi$`, ['linear', 'right-handed circular', 'left-handed circular', 'right-handed elliptical', 'left-handed elliptical'], 0,
          [null, md`$\phi = \pi$ means the components are exactly opposite: $H_y/H_x = -3$ at every instant. The tip moves back and forth on a line.`, md`$\phi = \pi$ means the components are exactly opposite: $H_y/H_x = -3$ at every instant. The tip moves back and forth on a line.`, md`Unequal amplitudes alone do not make an ellipse; there must also be a phase difference other than $0$ or $\pi$.`, md`Unequal amplitudes alone do not make an ellipse; there must also be a phase difference other than $0$ or $\pi$.`], true),
        mc(md`**(c)** $A = 4$, $B = 2$, $\phi = \pi/2$`, ['linear', 'right-handed circular', 'left-handed circular', 'right-handed elliptical', 'left-handed elliptical'], 3,
          [md`$\phi = \pi/2$ is not $0$ or $\pi$: the tip does not stay on a line.`, md`$A \ne B$: elliptical, not circular.`, md`$A \ne B$: elliptical, not circular.`, null, md`At $z = 0$ the tip goes from $4\hat x$ to $-2\hat y$: $\hat x\times(-\hat y) = -\hat z$, which **is** the direction of travel. Right hand.`], true),
      ],
      hints: [md`First the direction: $\omega t + kz$ means the wave travels toward $-z$. Then freeze $z = 0$ and find $\mathbf H$ at $\omega t = 0$ and at $\omega t = 90°$.`, md`Thumb along the travel direction ($-z$); the fingers must curl the way the tip turns.`],
      sol: md`
        !!trap The trap
          This wave travels toward $-z$. The usual shortcut ("$\hat x$ then $\hat y$ is right-handed") assumes $+z$. Here it flips. And it does not matter that the field given is $\mathbf H$: $\mathbf E$ and $\mathbf H$ of one wave turn together, so they have the same hand.

        **1. Direction.** The phase is $\omega t + kz$: constant phase moves toward $-z$ as $t$ grows. Travel toward $-\hat z$.

        **2. (a)** At $z = 0$: $\mathbf H = 3\cos\omega t\,\hat x + 3\cos(\omega t - 90°)\,\hat y = 3\cos\omega t\,\hat x + 3\sin\omega t\,\hat y$.
        - $\omega t = 0$: $3\hat x$. $\omega t = 90°$: $3\hat y$. The tip turns $\hat x\to\hat y$ on a circle (equal sizes, $90°$ apart).
        - $\hat x\times\hat y = +\hat z$, opposite to the travel direction. Left thumb on $-z$: the fingers curl $\hat x\to\hat y$ ✓.
        $$\boxed{\text{(a) left-handed circular}}$$
        **3. (b)** $\phi = \pi$: $\mathbf H = (2\hat x - 6\hat y)\cos(\omega t + kz)$. One direction, one cosine:
        $$\boxed{\text{(b) linear}}$$
        **4. (c)** At $z = 0$: $\mathbf H = 4\cos\omega t\,\hat x + 2\cos(\omega t + 90°)\,\hat y = 4\cos\omega t\,\hat x - 2\sin\omega t\,\hat y$.
        - $\omega t = 0$: $4\hat x$. $\omega t = 90°$: $-2\hat y$. The tip turns $\hat x\to-\hat y$ on an ellipse.
        - $\hat x\times(-\hat y) = -\hat z$, the travel direction: right hand ✓.
        $$\boxed{\text{(c) right-handed elliptical}}$$

        **Speed path.** Turning $\hat a\to\hat b$ is right-handed exactly when $\hat a\times\hat b$ is the travel direction. Read the travel direction from the sign of $kz$ first.

        **Where points go.** Assuming $+z$. Calling (b) elliptical because $A \ne B$.
      ` }),

    // ---------------------------------------------------------------- I Question 3
    RF(md`
      ### Question 3 (12 points): a three-section line

      At $t = 0$ a short pulse source with $R_g = 50\ \Omega$ launches a wave into the line below: three lossless sections, $Z_{01} = 50\ \Omega$ (one-way time 1 µs), $Z_{02} = 150\ \Omega$ (2 µs) and $Z_{03} = 75\ \Omega$ (1 µs), ending in a $75\ \Omega$ load.

      [[fig:three]]
    `, { three: { svg: figI3(), cap: 'Three sections in a row. T is each section\'s one-way travel time.' } }),
    P({ src: 'Practice I #3 · 12 pts', title: 'Coefficients and timing',
      q: md`Choose one answer for each.

      - **(i) (3 pts)** The injection coefficient $\tau_g$.
      - **(ii) (3 pts)** The voltage reflection coefficient at the junction of sections 1 and 2, for a wave going right.
      - **(iii) (3 pts)** The **current** reflection coefficient at the junction of sections 2 and 3, for a wave going right.
      - **(iv) (3 pts)** The earliest time at which the wave reflected at the junction of sections 2 and 3 reaches the source.`,
      parts: [
        mc(md`(i) $\tau_g$`, ['1/3', '1/2', '2/3', '3/4'], 1, [md`$1/3$ would need $R_g = 100\ \Omega$. Here $\tau_g = Z_{01}/(R_g + Z_{01}) = 50/100$.`, null, md`That would need $R_g = 25\ \Omega$.`, md`That uses $Z_{02} = 150$: $150/200$. The source only sees section 1 at first.`], true),
        mc(md`(ii) $\Gamma_{12}$`, ['−1/2', '−1/3', '1/3', '1/2'], 3, [md`That is $(Z_{01} - Z_{02})/(Z_{01} + Z_{02})$, the coefficient for a wave going left.`, md`Going from $50\ \Omega$ into the larger $150\ \Omega$ reflects with a plus sign, and the size is $100/200$.`, md`$100/200 = 1/2$, not $1/3$.`, null], true),
        mc(md`(iii) current reflection at junction 2-3`, ['−1/2', '−1/3', '1/3', '1/2'], 2, [md`$(75 - 150)/(75 + 150) = -1/3$ is the voltage coefficient; and the size is $1/3$, not $1/2$.`, md`That is the **voltage** reflection coefficient. Current reflects with $-\Gamma$.`, null, md`The size is $75/225 = 1/3$.`], true),
        mc('(iv) earliest arrival back at the source (µs)', ['3', '4', '5', '6', '8'], 3, [md`3 µs is the one-way time out to the 2-3 junction. The reflection still has to come back.`, md`That treats every section as 1 µs; section 2 takes 2 µs each way.`, md`That counts section 2 once each way but section 1 only once.`, null, md`That goes on to the load and back; the reflection from the 2-3 junction turns around earlier.`], true),
      ],
      hints: [md`Each junction: $\Gamma = (Z_{\text{next}} - Z_{\text{here}})/(Z_{\text{next}} + Z_{\text{here}})$ for the voltage; the current's is $-\Gamma$.`, md`Time: out through sections 1 and 2, back through sections 2 and 1.`],
      sol: md`
        **(i)** At first the source sees section 1:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{50}{100} = \boxed{\tfrac12}$$
        **(ii)** Going right from 50 Ω into 150 Ω:
        $$\Gamma_{12} = \frac{150 - 50}{150 + 50} = \boxed{\tfrac12}$$
        **(iii)** Going right from 150 Ω into 75 Ω, the voltage coefficient is
        $$\Gamma_{23} = \frac{75 - 150}{75 + 150} = -\frac13$$
        A reflected wave's current is $-V^-/Z_0$, so the current reflects with the opposite sign:
        $$\Gamma_I = -\Gamma_{23} = \boxed{\tfrac13}$$
        **(iv)** Out: section 1 (1 µs) and section 2 (2 µs) reach the 2-3 junction at 3 µs. Back: 2 µs + 1 µs. Total:
        $$1 + 2 + 2 + 1 = \boxed{6\ \mu\text{s}}$$
        (On the way back it also passes the 1-2 junction, where part of it reflects, but the transmitted part arrives at 6 µs.)

        **Speed path.** Voltage $\Gamma$: (next − here)/(next + here). Current: flip the sign. Time: add the one-way times out and back.

        **Where points go.** Giving the voltage coefficient when the current one is asked. Treating every section as 1 µs.
      ` }),

    // ---------------------------------------------------------------- I Question 4
    RF(md`
      ### Question 4 (16 points): read the scope trace backwards

      A pulse generator with unknown internal resistance $R_g$ sends a narrow pulse $45\,\delta(t)$ (strength in V·µs) at $t = 0$ down a lossless $60\ \Omega$ line, 200 m long, ending in an unknown resistor $R_L$. A probe at the middle of the line, $z = 100$ m, records pulses at $t = 1, 3, 5, 7, \dots$ µs, with strengths $A$, $-A/3$, $A/9$, $-A/27$, and so on.

      [[fig:scope]]

      [[fig:trace]]
    `, { scope: { svg: figI4c(), cap: 'The probe sits at the middle of the line.' }, trace: { svg: figI4t(), cap: 'What the probe records: impulses at odd microseconds, shrinking by a factor of −1/3 each time.' } }),
    P({ src: 'Practice I #4 · 16 pts', title: 'Rg, RL, A and the dielectric',
      q: md`Choose one answer for each.

      **(a) (4 pts)** $R_L$ in Ω. **(b) (4 pts)** $R_g$ in Ω. **(c) (4 pts)** $A$ in V·µs. **(d) (4 pts)** The line is nonmagnetic. Its relative permittivity $\epsilon_r$.`,
      parts: [
        mc(md`(a) $R_L$ (Ω)`, ['0', '15', '20', '30', '60', '120', '180', '∞'], 3, [md`A short reflects with $-1$; here the ratio is $-1/3$.`, md`$15\ \Omega$ gives $\Gamma = (15 - 60)/75 = -3/5$.`, md`$20\ \Omega$ gives $\Gamma = -40/80 = -1/2$.`, null, md`A matched load would leave only the first pulse.`, md`$120\ \Omega$ gives $\Gamma = +1/3$: the sign is wrong. The second pulse is negative.`, md`$180\ \Omega$ gives $\Gamma = +1/2$.`, md`An open reflects with $+1$.`], true),
        mc(md`(b) $R_g$ (Ω)`, ['0', '15', '20', '30', '60', '120', '180', '∞'], 3, [md`A short source would reflect with $-1$.`, md`$15\ \Omega$ gives $\Gamma_g = -3/5$.`, md`$20\ \Omega$ gives $\Gamma_g = -1/2$.`, null, md`A matched source absorbs the returning pulse; there would be no third pulse.`, md`$120\ \Omega$ gives $\Gamma_g = +1/3$; the third pulse would then be $-A/9$.`, md`$180\ \Omega$ gives $\Gamma_g = +1/2$.`, md`An open source end reflects with $+1$.`], true),
        mc(md`(c) $A$ (V·µs)`, ['15', '22.5', '30', '45', '60', '90'], 2, [md`That uses $R_g/(R_g + Z_0) = 1/3$. The line takes the share across $Z_0$: $Z_0/(R_g + Z_0) = 60/90 = 2/3$.`, md`That is half of 45: it assumes a matched source.`, null, md`That assumes the whole source pulse enters the line. The line takes $\tau_g = 2/3$ of it.`, md`That is $45\times\tfrac43$, using $1 - \Gamma_g$ in place of $\tau_g$.`, md`That doubles the pulse, as an open end would. The line takes only $\tau_g = 2/3$ of it.`], true),
        mc(md`(d) $\epsilon_r$`, ['1', '2', '3', '4', '9', '36'], 4, [md`$\epsilon_r = 1$ means $v = c = 300$ m/µs; here $v = 100$ m/µs.`, md`$(c/v)^2 = 3^2$, not 2.`, md`That is $c/v$; $\epsilon_r$ is its square.`, md`That would be $v = 150$ m/µs: a trip of 100 m in 1 µs gives $v = 100$ m/µs.`, null, md`That would be $v = 50$ m/µs.`], true),
      ],
      hints: [md`The first pulse at the probe is forward. The second has bounced off the load; the third has bounced off the load and then the source. Their ratios are $\Gamma_L$ and $\Gamma_g$.`, md`$A = \tau_g\times45$, and the first pulse takes 1 µs to cover 100 m.`],
      sol: md`
        **1. Which pulse is which.** The probe is 100 m from each end.
        - $t = 1$ µs: the first forward pulse, strength $A = \tau_g(45)$.
        - $t = 3$ µs: it went on to the load (2 µs), bounced, and came back to the middle: strength $A\Gamma_L$.
        - $t = 5$ µs: that went back to the source, bounced, and returned: $A\Gamma_L\Gamma_g$.

        **2. (a) Load.** $A\Gamma_L = -A/3$:
        $$\Gamma_L = -\frac13$$
        Solve $\Gamma = (R - Z_0)/(R + Z_0)$ for $R$: $R = Z_0\dfrac{1 + \Gamma}{1 - \Gamma}$:
        $$R_L = 60\cdot\frac{2/3}{4/3} = \boxed{30\ \Omega}$$
        **3. (b) Source.** Third over second: $(A/9)/(-A/3) = -1/3 = \Gamma_g$. The same coefficient, so
        $$R_g = \boxed{30\ \Omega}$$
        The fourth pulse checks it: $(-A/27)/(A/9) = -1/3 = \Gamma_L$ ✓.

        **4. (c) A.**
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{60}{90} = \frac23$$
        $$A = \tfrac23(45) = \boxed{30\ \text{V}\cdot\mu\text{s}}$$
        **5. (d) εr.** The first pulse covers 100 m in 1 µs:
        $$v = 10^8\ \text{m/s} = \frac{c}{3}$$
        $$\epsilon_r = \left(\frac{c}{v}\right)^2 = \boxed{9}$$

        **Speed path.** Ratios of successive pulses alternate $\Gamma_L$, $\Gamma_g$. $R = Z_0(1 + \Gamma)/(1 - \Gamma)$: $\Gamma = -1/3$ always means $R = Z_0/2$.

        **Where points go.** Swapping which ratio belongs to which end. Taking $\epsilon_r = c/v$ instead of $(c/v)^2$.
      ` }),

    // ---------------------------------------------------------------- I Question 5
    RF(md`
      ### Part II. Question 5 (22 points): a pulse on a line with an open end

      A source $f(t)$ with internal resistance $R_g = 50\ \Omega$ drives a lossless $50\ \Omega$ line, 400 m long, with $v = 2\times10^8$ m/s. The far end ($z = 400$ m) is **open**.

      [[fig:c5]]
    `, { c5: { svg: figI5c(), cap: 'One trip along the line takes 2 µs. The far end is open.' } }),
    P({ src: 'Practice I #5(a)(b) · 4 pts', title: 'Steady state for a step',
      q: md`Suppose $f(t) = 100\,u(t)$ V. **(a) (2 pts)** The steady-state voltage at $z = 0$, in V. **(b) (2 pts)** The steady-state current at $z = 400$ m, in A.`,
      parts: [
        mc('(a) V at z = 0 (V)', ['0', '50', '100', '200'], 2, [md`Zero would need a short somewhere. The line is open at the far end.`, md`50 V is the first wave, $\tau_gV_g$, before anything comes back.`, null, md`An open end doubles the arriving wave, but in steady state there is no current, so no drop across $R_g$: the voltage is $V_g$ itself.`], true),
        mc('(b) I at z = 400 m (A)', ['−1', '0', '1', '2'], 1, [md`The far end is open: no current can flow into it, at any time.`, null, md`1 A is the first wave's current. At the open end it is cancelled by its own reflection, at all times.`, md`No current flows into an open.`], true),
      ],
      hints: [md`In steady state the line is a pair of wires. What current flows into an open circuit?`],
      sol: md`
        **1. The DC circuit.** In steady state the lossless line is just two wires, ending in an open. No current flows anywhere:
        $$I = 0 \quad\Rightarrow\quad \text{no drop across } R_g$$
        **(a)** So the voltage at $z = 0$ is the source voltage:
        $$\boxed{V(0, \infty) = 100\ \text{V}}$$
        **(b)** The current at the open end is zero, always:
        $$\boxed{I(400\,\text{m}, \infty) = 0}$$

        **Speed path.** Open load: $I = 0$ and $V = V_g$ everywhere in steady state.

        **Where points go.** Answering 50 V (the first wave, not the steady state).
      ` }),
    P({ src: 'Practice I #5(c) · 9 pts', title: 'The voltage at z = 0 for a pulse',
      q: md`Now $f(t)$ is a 100 V pulse that lasts 6 µs:

      [[fig:f]]

      **(c) (9 pts)** Sketch $V(0, t)$ for $0 \le t \le 12$ µs. Give its value at $t = 1$, $5$ and $8$ µs, and the time after which it stays at 0.`,
      parts: [N(md`$V(0, 1\,\mu\text{s})$ (V)`, 50, 'V'),
        trap(N(md`$V(0, 5\,\mu\text{s})$ (V)`, 100, 'V'), [[50, md`At 5 µs the returning pulse (back at $z = 0$ from 4 µs) and the outgoing pulse (still running until 6 µs) overlap: $50 + 50$.`]]),
        N(md`$V(0, 8\,\mu\text{s})$ (V)`, 50, 'V'), N('it stays 0 after t = (µs)', 10, 'µs')],
      hints: [md`$\tau_g = 1/2$ and $\Gamma_g = 0$: the line carries a 50 V pulse from 0 to 6 µs. The open end returns it unchanged ($\Gamma_L = 1$), and it reaches $z = 0$ after a round trip of 4 µs, where the matched source absorbs it.`, md`At $z = 0$, add the outgoing pulse (0 to 6 µs) and the returning one (4 to 10 µs).`],
      sol: md`
        **1. The coefficients.**
        $$\tau_g = \frac{50}{50 + 50} = \frac12,\quad \Gamma_g = 0,\quad \Gamma_L = +1$$
        **2. The outgoing pulse.** The line takes $\tau_g(100) = 50$ V, for as long as $f(t)$ lasts: $0 < t < 6$ µs at $z = 0$.

        **3. The returning pulse.** The front reaches the open end at 2 µs and reflects with $\Gamma_L = 1$: another $+50$ V pulse, heading back. Its front reaches $z = 0$ at 4 µs and its tail at $6 + 4 = 10$ µs. There $\Gamma_g = 0$: it is absorbed, and nothing more happens.

        **4. Add them at z = 0.**
        - $0 < t < 4$: outgoing only: 50 V
        - $4 < t < 6$: both: 100 V
        - $6 < t < 10$: returning only: 50 V
        - $t > 10$: 0

        $$\boxed{V(0,1) = 50,\ V(0,5) = 100,\ V(0,8) = 50\ \text{V}}$$
        $$\boxed{V(0,t) = 0\ \text{for } t > 10\ \mu\text{s}}$$

        [[fig:v0]]

        **Speed path.** Draw two boxes on the time axis, $[0, 6]$ and $[4, 10]$, each 50 V high, and stack them.

        **Where points go.** Missing the overlap from 4 to 6 µs (the pulse is longer than the round trip). Letting the returning pulse bounce again at the matched source.
      `,
      figs: { f: { svg: figI5f(), cap: 'f(t): 100 V from t = 0 to t = 6 µs.' }, v0: { svg: figI5plot('V'), cap: 'V(0, t) in V: the outgoing and the returning pulse overlap from 4 to 6 µs.' } } }),
    P({ src: 'Practice I #5(d) · 9 pts', title: 'The current at z = 0, and the open end',
      q: md`**(d) (9 pts)** For the same 6 µs pulse, sketch $I(0, t)$ for $0 \le t \le 12$ µs. Give $I(0, 1\,\mu\text{s})$ and $I(0, 8\,\mu\text{s})$, say what it is for $4 < t < 6$ µs, and give the voltage at the open end at $t = 3$ µs.`,
      parts: [N(md`$I(0, 1\,\mu\text{s})$ (A)`, 1, 'A'),
        trap(N(md`$I(0, 8\,\mu\text{s})$ (A)`, -1, 'A'), [[1, md`The returning pulse travels toward the source: its current is $-V^-/Z_0 = -50/50$.`]]),
        mc(md`$I(0,t)$ for $4 < t < 6$ µs`, ['zero: the two currents cancel', '2 A: the two currents add', '1 A: only the outgoing pulse counts', '−1 A: only the returning pulse counts'], 0,
          [null, md`Voltages add there (100 V), but a returning wave's current has the opposite sign: $1 - 1$.`, md`The returning pulse arrives at 4 µs; both are present until 6 µs.`, md`The outgoing pulse is still running until 6 µs.`]),
        trap(N(md`$V(400\,\text{m}, 3\,\mu\text{s})$ (V)`, 100, 'V'), [[50, md`At the open end the arriving 50 V and its reflection are there at the same moment: $(1 + \Gamma_L)50$.`]])],
      hints: [md`Outgoing current: $+50/50 = 1$ A for $0 < t < 6$. Returning current: $-50/50 = -1$ A for $4 < t < 10$.`],
      sol: md`
        **1. Currents of the two pulses.** The outgoing pulse goes toward $+z$: $I = +V/Z_0 = +1$ A. The returning pulse goes toward $-z$: $I = -V/Z_0 = -1$ A.

        **2. Add them at z = 0.**
        - $0 < t < 4$: $+1$ A
        - $4 < t < 6$: $1 - 1 = 0$
        - $6 < t < 10$: $-1$ A
        - $t > 10$: 0

        $$\boxed{I(0,1) = 1\ \text{A},\quad I(0,8) = -1\ \text{A}}$$
        and zero for $4 < t < 6$ µs.

        [[fig:i0]]

        **3. The open end.** The 50 V pulse arrives at 2 µs and reflects with $\Gamma_L = 1$ at the same moment, so for $2 < t < 8$ µs:
        $$V(400\,\text{m}, t) = 50 + 50 = \boxed{100\ \text{V}}$$
        and the current there is $1 - 1 = 0$, as an open end demands.

        !!intuition Does this make sense?
          Check Ohm's law at the source for $6 < t < 10$: $f = 0$, so the source is just $R_g$, and $V(0,t) = -R_gI(0,t) = -50(-1) = 50$ V ✓. The returning pulse drives current backward into $R_g$, where its energy ends up as heat.

        **Speed path.** Copy the voltage boxes, divide by 50, and flip the sign of the returning one.

        **Where points go.** Giving the returning pulse a positive current. Forgetting the doubling at the open end.
      `,
      figs: { i0: { svg: figI5plot('I'), cap: 'I(0, t) in A: +1 going out, −1 coming back, zero while they overlap.' } } }),

    // ---------------------------------------------------------------- I Question 6
    RF(md`
      ### Question 6 (13 points): power going down into wet soil

      The phasor electric field of a plane wave going down into wet soil is
      $$\tilde{\mathbf E} = \hat x\,10\,e^{-z/2}e^{-jz/2}\ \text{V/m}$$
      where $z$ is the depth in meters, measured down from the surface $z = 0$. The soil is nonmagnetic, with $\sigma = 0.1$ S/m, and at this frequency $\sigma \gg \omega\epsilon$.
    `),
    P({ src: 'Practice I #6(a) · 3 pts', title: 'The soil\'s impedance',
      q: md`**(a) (3 pts)** Find $|\eta|$ and $\tau$.`,
      parts: [trap(N(md`$|\eta|$ (Ω)`, 5 * Math.SQRT2, 'Ω'), [[5, md`That is the real part of $\eta = 5(1 + j)$; the size is $5\sqrt2$.`], [377, md`That is free space. In a good conductor $\eta = \gamma/\sigma$, small.`]]),
        mc(md`$\tau$`, ['0°', '22.5°', '45°', '90°'], 2, [md`$\tau = 0$ means no loss; this wave decays.`, md`$22.5°$ needs $\sigma/\omega\epsilon = 1$.`, null, md`$\tau$ never exceeds $45°$.`], true)],
      hints: [md`Read $\gamma$ off the phasor: $e^{-\gamma z}$ with $\gamma = \alpha + j\beta$. Then $\gamma/\eta = \sigma + j\omega\epsilon \approx \sigma$.`],
      sol: md`
        **1. Read γ.** The phasor is $10e^{-(1/2 + j/2)z}$:
        $$\gamma = \tfrac12 + j\tfrac12 = \tfrac12(1 + j)\ \text{m}^{-1}$$
        $\alpha = \beta$: a good conductor, consistent with $\sigma \gg \omega\epsilon$.

        **2. η.** The sheet's $\gamma/\eta = \sigma + j\omega\epsilon \approx \sigma$:
        $$\eta \approx \frac{\gamma}{\sigma} = \frac{0.5(1 + j)}{0.1} = 5(1 + j)\ \Omega$$
        $$\boxed{|\eta| = 5\sqrt2 \approx 7.07\ \Omega}$$
        $$\boxed{\tau = 45°}$$

        **Speed path.** $\eta = \gamma/\sigma$ in a good conductor: one division.

        **Where points go.** Trying to find $\omega$ first; you never need it.
      ` }),
    P({ src: 'Practice I #6(b) · 4 pts', title: 'The power density',
      q: md`**(b) (4 pts)** Find the time-averaged Poynting vector $\langle\mathbf S\rangle$ as a function of depth.`,
      parts: [trap(N(md`$\langle S_z\rangle$ at $z = 0$ (W/m²)`, 5, 'W/m²'), [[100 / (2 * 5 * Math.SQRT2), md`That is $|E|^2/2|\eta|$: it leaves out $\cos\tau$. With a complex $\eta$, $\langle S\rangle = \frac{|E|^2}{2|\eta|}\cos\tau$.`], [10, md`That leaves out the $\tfrac12$ of the time average.`]]),
        mc(md`$\langle\mathbf S\rangle$ in W/m² is`, [md`$5e^{-z}\,\hat z$`, md`$5e^{-z/2}\,\hat z$`, md`$5e^{-2z}\,\hat z$`, md`$5e^{-z}\cos(z)\,\hat z$`], 0,
          [null, md`That decays like the field. Power goes as the field squared: $e^{-2\alpha z} = e^{-z}$.`, md`That squares $e^{-z}$ again. $|e^{-z/2}|^2 = e^{-z}$.`, md`The phase $e^{-jz/2}$ cancels against its conjugate in $\tilde E\tilde H^*$; no oscillation is left in the average.`])],
      hints: [md`$\tilde H_y = \tilde E_x/\eta$ and $\langle S_z\rangle = \tfrac12\text{Re}\{\tilde E_x\tilde H_y^*\} = \frac{|\tilde E_x|^2}{2}\text{Re}\{1/\eta^*\}$.`],
      sol: md`
        **1. H.** The wave goes toward $+z$, so $\tilde H_y = \tilde E_x/\eta$.

        **2. The product.**
        $$\tilde E_x\tilde H_y^* = \frac{|\tilde E_x|^2}{\eta^*}$$
        The phases $e^{-jz/2}$ and $e^{+jz/2}$ cancel, leaving $|\tilde E_x|^2 = 100e^{-z}$.

        **3. The real part of 1/η\*.** $\eta^* = 5(1 - j)$, so
        $$\frac{1}{\eta^*} = \frac{1 + j}{5\cdot2} = 0.1 + j0.1$$
        **4. Assemble.**
        $$\langle S_z\rangle = \tfrac12(100e^{-z})(0.1)$$
        $$\boxed{\langle\mathbf S\rangle = 5e^{-z}\,\hat z\ \text{W/m}^2}$$

        [[fig:s]]

        !!intuition Does this make sense?
          The sheet's form gives the same: $\frac{|E|^2}{2|\eta|}\cos\tau = \frac{100}{2(5\sqrt2)}\cdot\frac{1}{\sqrt2} = 5$ ✓. The power decays at $2\alpha = 1$ Np/m, twice the field's rate.

        **Speed path.** $\langle S\rangle = \frac{|E_0|^2}{2|\eta|}\cos\tau\,e^{-2\alpha z}$, straight from the sheet.

        **Where points go.** Leaving out $\cos\tau$. Decaying the power at $\alpha$ instead of $2\alpha$.
      `,
      figs: { s: { svg: figI6(), cap: '⟨S_z⟩ in W/m²: it falls by e every meter.' } } }),
    P({ src: 'Practice I #6(c)(d) · 6 pts', title: 'dB per meter, and what the soil absorbs',
      q: md`**(c) (3 pts)** Find the attenuation rate of the power in dB/m. **(d) (3 pts)** How much power per square meter does the top 2 m of soil absorb? Use $e^{-2} \approx 0.135$ and $\log_{10}e \approx 0.434$.`,
      parts: [trap(N('attenuation (dB/m)', 10 * Math.log10(Math.E), 'dB/m'), [[20 * Math.log10(Math.E), md`That is $20\log_{10}e$, the rule for a field ratio. This is a power ratio: $10\log_{10}$.`], [1, md`1 Np/m is the rate in nepers. In dB it is $10\log_{10}(e^1)$.`]]),
        trap(N('absorbed in 0 < z < 2 m (W/m²)', 5 * (1 - Math.exp(-2)), 'W/m²'), [[5 * Math.exp(-2), md`That is the power still flowing at $z = 2$ m. The absorbed part is what went in minus what came out.`]])],
      hints: [md`Per meter the power falls by $e^{1}$. In dB: $10\log_{10}(e)$.`, md`Absorbed = power in at $z = 0$ minus power out at $z = 2$ m.`],
      sol: md`
        **(c) dB per meter.** Over 1 m the power falls by $e^{-2\alpha\cdot1} = e^{-1}$:
        $$10\log_{10}\frac{S(0)}{S(1)} = 10\log_{10}e$$
        $$\boxed{10(0.434) \approx 4.34\ \text{dB/m}}$$
        **(d) Absorbed.** What goes in at the top minus what leaves at 2 m (per m²):
        $$P = 5 - 5e^{-2} = 5(1 - 0.135)$$
        $$\boxed{P \approx 4.32\ \text{W/m}^2}$$
        This is the time-averaged Poynting theorem: $-\nabla\cdot\langle\mathbf S\rangle$ is the power turned into heat per unit volume.

        **Speed path.** 1 Np of power is 4.34 dB. Absorbed = $S_{\text{in}} - S_{\text{out}}$.

        **Where points go.** $20\log$ instead of $10\log$ for power. Reporting $S(2)$ as the absorbed power.
      ` }),

    // ---------------------------------------------------------------- I Question 7
    RF(md`
      ### Question 7 (16 points): resonances of a line open at both ends

      A lossless line of length $l = 500$ m with $v = 2\times10^8$ m/s rings in a resonant oscillation, a cosinusoidal steady state with no source connected. The current phasor is zero at the input ($d = l$) and also zero at the load ($d = 0$). Here $d$ is the distance back from the load.

      The graphs show eight candidate shapes for a phasor as a function of $d$, from the load ($d = 0$, left) to the input ($d = l$, right). Each shows the shape only: the actual phasor may be the graph times any constant, real or complex.

      [[fig:gr]]
    `, { gr: { svg: figI7(), cap: 'Eight shapes, d from 0 (load) to l (input).' } }),
    P({ src: 'Practice I #7(a)(b) · 10 pts', title: 'The ends and the lowest resonance',
      q: md`**(a) (4 pts)** What are $Z_{\text{in}}$ (at $d = l$) and $Z_L$? **(b) (6 pts)** Find the lowest resonant $\omega$, and pick the graphs for $\tilde V(d)$ and $\tilde I(d)$ at that resonance.`,
      parts: [
        mc(md`(a) $Z_{\text{in}}$ and $Z_L$`, [md`$Z_{\text{in}} = \infty$, $Z_L = \infty$`, md`$Z_{\text{in}} = 0$, $Z_L = 0$`, md`$Z_{\text{in}} = \infty$, $Z_L = 0$`, md`$Z_{\text{in}} = 0$, $Z_L = \infty$`], 0,
          [null, md`Zero current with a nonzero voltage is an open, $Z = V/I = \infty$, not a short.`, md`At the load the current is zero too, so the load is also an open.`, md`At the input the current is zero: $Z_{\text{in}} = \infty$.`]),
        trap(N(md`lowest $\omega$ (rad/s)`, 4 * PI * 1e5, 'rad/s'), [[2 * PI * 1e5, md`That is a quarter-wave resonance ($\lambda = 4l$), which belongs to a line open at one end and shorted at the other.`], [2e5, md`That is $f$ in Hz. Multiply by $2\pi$.`]]),
        mc(md`(b) graph of $\tilde V(d)$`, ['A', 'B', 'C', 'D', 'E', 'F'], 0, [null, md`B is zero at both ends: that is the current's shape (zero at both opens), not the voltage's.`, md`C is a quarter wave: it fits a line open at one end and shorted at the other.`, md`D is a quarter wave too.`, md`E is a full wavelength: the second resonance.`, md`F is a full wavelength: the second resonance's current.`], true),
        mc(md`(b) graph of $\tilde I(d)$`, ['A', 'B', 'C', 'D', 'E', 'F'], 1, [md`A is largest at both ends; the current must be zero at both ends.`, null, md`C is not zero at $d = 0$.`, md`D is zero at $d = 0$ but largest at $d = l$, where the current must vanish.`, md`E is not zero at the ends.`, md`F is zero at both ends but is a full wavelength: the second resonance.`], true),
      ],
      hints: [md`Open load: $\tilde V(d) = 2\tilde V^+\cos\beta d$ and $\tilde I(d) = j\frac{2\tilde V^+}{Z_0}\sin\beta d$ (formula sheet, $Y(d) = jY_0\tan\beta d$).`, md`The current must also vanish at $d = l$: $\sin\beta l = 0$, so $\beta l = n\pi$.`],
      sol: md`
        **(a)** At both ends the current is zero while the voltage is not (otherwise nothing would be oscillating). $Z = V/I$:
        $$\boxed{Z_{\text{in}} = \infty,\quad Z_L = \infty}$$
        Both ends are open.

        **(b) 1. The pattern from an open load.** From the sheet:
        $$\tilde V(d) = 2\tilde V^+\cos\beta d$$
        $$\tilde I(d) = j\frac{2\tilde V^+}{Z_0}\sin\beta d$$
        **2. The input must be open too.** $\tilde I(l) = 0$ needs
        $$\sin\beta l = 0 \quad\Rightarrow\quad \beta l = n\pi$$
        The lowest is $n = 1$: $\beta l = \pi$, so $l = \lambda/2$ and
        $$\lambda = 2l = 1000\ \text{m}$$
        **3. Frequency.**
        $$f = \frac{v}{\lambda} = \frac{2\times10^8}{10^3} = 2\times10^5\ \text{Hz}$$
        $$\boxed{\omega = 2\pi f = 4\pi\times10^5 \approx 1.26\times10^6\ \text{rad/s}}$$
        **4. Graphs.** With $\beta = \pi/l$: $\tilde V \propto \cos(\pi d/l)$, largest at both ends and opposite in sign: **A**. $\tilde I \propto \sin(\pi d/l)$, zero at both ends and largest in the middle: **B**.

        **Speed path.** Open-open (or short-short): half-wave resonances, $f_n = nv/2l$. Open-short: quarter-wave, $f_n = (2n - 1)v/4l$.

        **Where points go.** Using the quarter-wave rule from the Fall 2023 version (open at one end, shorted at the other). Swapping the $V$ and $I$ graphs.
      ` }),
    P({ src: 'Practice I #7(c)(d) · 6 pts', title: 'The second resonance',
      q: md`**(c) (4 pts)** Find the second-lowest resonant $\omega$, and pick the graphs for $\tilde V$ and $\tilde I$. **(d) (2 pts)** At that resonance, how far from the load is the nearest point where the line's voltage is zero (where it acts like a short)?`,
      parts: [N(md`second $\omega$ (rad/s)`, 8 * PI * 1e5, 'rad/s'),
        mc(md`(c) graphs of $\tilde V$ and $\tilde I$`, ['E and F', 'F and E', 'G and H', 'A and B'], 0,
          [null, md`That swaps them: the current, not the voltage, must be zero at the open ends.`, md`G and H are three quarter waves: they fit an open-short line.`, md`That is the lowest resonance.`]),
        trap(N(md`$d$ (m)`, 125, 'm'), [[250, md`That is $\lambda/2$, where the voltage is at a (negative) peak. The first zero of $\cos\beta d$ is at $\lambda/4$.`]])],
      hints: [md`$n = 2$: $\beta l = 2\pi$, so $\lambda = l$. The voltage $\cos\beta d$ is first zero at $\beta d = \pi/2$.`],
      sol: md`
        **(c) 1. n = 2.** $\beta l = 2\pi$, so $\lambda = l = 500$ m:
        $$f = \frac{2\times10^8}{500} = 4\times10^5\ \text{Hz}$$
        $$\boxed{\omega = 8\pi\times10^5 \approx 2.51\times10^6\ \text{rad/s}}$$
        **2. Graphs.** $\tilde V \propto \cos(2\pi d/l)$: one full cycle, largest at both ends: **E**. $\tilde I \propto \sin(2\pi d/l)$: zero at $0$, $l/2$ and $l$: **F**.

        **(d)** $\tilde V \propto \cos\beta d$ is first zero at $\beta d = \pi/2$, a quarter wavelength from the load:
        $$d = \frac{\lambda}{4} = \frac{500}{4} = \boxed{125\ \text{m}}$$
        There the line looks like a short: a voltage node, and the current is at its peak.

        **Speed path.** Resonances of an open-open line are multiples of the first: $\omega_n = n(4\pi\times10^5)$. Voltage nodes sit $\lambda/4$ from each open end.

        **Where points go.** Answering $\lambda/2$. Using $l$ in place of $\lambda$.
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-i', order: 9, title: 'Practice exam I', kind: 'mock', sub: '75 min · 100 pts · Fall 2023 format: circle-all-that-apply concepts, polarization, TL numbers, a scope trace, a pulse on an open line, power in soil, resonances', steps: examI });
})();

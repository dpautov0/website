/* e3-gym-decks.js — the Exam 3 recognition gym's decks (the engine is E3Drill.gym in e3-drill.js; the pages are in
   content/e3-gym.js). Each deck trains ONE read that should take a few seconds on the exam: which way a wave travels,
   which hand it turns, what Gamma is, what the next bounce adds.
   A deck is { id, title, chip, sub, rule (md), make() }; make() returns a fresh item
     { figHtml?, q (md), opts: [md], a: index, why: [md | null], rule (md: the read for THIS item) }.
   Every wrong option's "why" names the calculation that produces it. Numbers are chosen to work without a calculator.
   Conventions as on the site: E(t) = Re{E~ e^{jwt}}, cosine reference; eta0 = 120 pi; c = 3e8 m/s. */
(function () {
  'use strict';
  const pick = U.pick, shuffle = U.shuffle;
  const F = (x) => TL.frac(x);
  const P = (x) => EM.p(x);
  const AX = ['x', 'y', 'z'];

  // a number that needs a calculator: a decimal with 4 or more significant digits, or a fraction over 100 or more
  const messy = (t) => (t.match(/\d+\.\d+/g) || []).some((x) => x.replace('.', '').replace(/^0+/, '').length >= 4) || /\\tfrac\{\d+\}\{\d{3,}\}/.test(t);
  // the right option and the wrong ones ([text, why]); duplicates of any text are dropped; at most n wrongs are kept.
  // When the right answer is a clean number, messy wrong ones are used only if fewer than 2 clean ones are left (a lone
  // clean number among messy ones would give the answer away).
  function mc(right, wrongs, n = 3) {
    const seen = new Set([right]);
    let keep = [];
    for (const w of wrongs) if (w && !seen.has(w[0])) { seen.add(w[0]); keep.push(w); }
    if (!messy(right)) {
      const clean = keep.filter((w) => !messy(w[0]));
      keep = clean.length >= 2 ? clean : clean.concat(shuffle(keep.filter((w) => messy(w[0]))).slice(0, 2 - clean.length));
    }
    const use = keep.length > n ? shuffle(keep).slice(0, n) : keep;
    const all = shuffle([[right, null], ...use]);
    return { opts: all.map((x) => x[0]), a: all.findIndex((x) => x[1] === null), why: all.map((x) => x[1]) };
  }
  // a fixed list of categories (same order every time, so the keys become habits); whys[k] for each wrong one
  function fixed(list, right, whyOf) {
    return { opts: list.slice(), a: right, why: list.map((_, k) => (k === right ? null : whyOf(k))) };
  }

  // ---------------------------------------------------------------- small helpers
  const vec = (ax, s = 1) => ({ ax, s });
  const neg = (v) => ({ ax: v.ax, s: -v.s });
  const cross = (a, b) => {
    const i = AX.indexOf(a.ax), j = AX.indexOf(b.ax);
    if (i === j) return null;
    return { ax: AX[3 - i - j], s: a.s * b.s * ((j - i + 3) % 3 === 1 ? 1 : -1) };
  };
  const vT = (v) => `${v.s < 0 ? '-' : '+'}\\hat ${v.ax}`;
  // a phase constant as TeX and its value
  const kOf = () => pick([['2', 2], ['3', 3], ['4', 4], ['10', 10], ['\\pi', Math.PI], ['2\\pi', 2 * Math.PI], ['0.5', 0.5]]);
  // x = p/q exactly (q up to 1000), else null
  const rat = (x, maxQ = 1000) => {
    const a = Math.abs(x);
    for (let q = 1; q <= maxQ; q++) { const p = Math.round(a * q); if (p > 0 && Math.abs(a - p / q) < 1e-9 * Math.max(a, 1)) return [Math.sign(x) * p, q]; }
    return null;
  };
  // n * pi^pw as TeX (pw = -1, 0 or 1)
  function piT(n, pw) {
    if (pw === 0) return F(n);
    const r = rat(n);
    if (!r) return pw > 0 ? `${P(n)}\\pi` : `\\tfrac{${P(n)}}{\\pi}`;
    const [p, q] = r, sg = p < 0 ? '-' : '', a = Math.abs(p);
    if (pw > 0) return q === 1 ? `${sg}${a === 1 ? '' : a}\\pi` : `${sg}\\tfrac{${a === 1 ? '' : a}\\pi}{${q}}`;
    return `${sg}\\tfrac{${a}}{${q === 1 ? '' : q}\\pi}`;
  }
  // a length n * pi^pw metres, in mm when it is short
  const lenT = (n, pw) => (Math.abs(n * Math.pow(Math.PI, pw)) < 0.05 ? `${piT(n * 1000, pw)}\\ \\text{mm}` : `${piT(n, pw)}\\ \\text{m}`);
  const ohm = (x) => (x === Infinity ? '\\infty' : `${F(x)}\\ \\Omega`);
  const rT = (x) => (x === Infinity ? '\\infty' : `${P(x)}\\ \\Omega`);
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 28) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // a two-wire line drawn as two thick rails from x0 to x1, wires at y0 and y1
  function rails(g, x0, x1, y0, y1, lab) {
    g.line(x0, y0, x1, y0, { cls: 'thick' }); g.line(x0, y1, x1, y1, { cls: 'thick' });
    if (lab) g.label((x0 + x1) / 2, (y0 + y1) / 2, lab, 'c', 'small');
  }
  // generator (source + R_g) -> line -> load
  function circuitFig(o) {
    const g = PF.fig({ alt: 'A step generator with a source resistor drives a transmission line that ends in a load.' });
    const y0 = 20, y1 = 84, xs = 22, xa = 118, xb = 238;
    g.circle(xs, 52, 13);
    g.label(xs, 45, '+', 'c', 'small'); g.label(xs, 59, '-', 'c', 'small');
    g.line(xs, 39, xs, y0); g.line(xs, 65, xs, y1);
    g.line(xs, y0, 52, y0); zig(g, 52, y0, 92, y0); g.line(92, y0, xa, y0);
    g.line(xs, y1, xa, y1);
    g.dot(xa, y0); g.dot(xa, y1); g.dot(xb, y0); g.dot(xb, y1);
    rails(g, xa, xb, y0, y1, o.Z0 ? `Z_0 = ${F(o.Z0)}\\,\\Omega` : 'Z_0');
    if (o.RL === Infinity) g.text(xb + 8, (y0 + y1) / 2, 'open', 'l', 'small');
    else if (o.RL === 0) { g.line(xb, y0, xb + 22, y0); g.line(xb + 22, y0, xb + 22, y1, { cls: 'thick' }); g.line(xb + 22, y1, xb, y1); }
    else { g.line(xb, y0, xb + 26, y0); zig(g, xb + 26, y0, xb + 26, y1); g.line(xb + 26, y1, xb, y1); g.label(xb + 36, (y0 + y1) / 2, `R_L${o.RL !== undefined ? ` = ${F(o.RL)}\\,\\Omega` : ''}`, 'l', 'small'); }
    g.label(xs - 18, 52, o.Vg !== undefined ? `V_g = ${F(o.Vg)}\\,\\text{V}` : 'V_g', 'r', 'small');
    g.label(72, y0 - 10, o.Rg !== undefined ? `R_g = ${F(o.Rg)}\\,\\Omega` : 'R_g', 'b', 'small');
    return g.svg();
  }
  // a stub or a matching section: input terminals on the left, the end (short, open or load) on the right
  function stubFig(end, lenLab, lineLab, loadLab) {
    const g = PF.fig({ alt: `A transmission line of length ${lenLab}, input on the left, ending in ${end === 'short' ? 'a short circuit' : end === 'open' ? 'an open circuit' : 'a load'}.` });
    const y0 = 20, y1 = 70, xa = 50, xb = 220;
    g.dot(xa, y0); g.dot(xa, y1);
    rails(g, xa, xb, y0, y1, lineLab);
    g.arrow(xa - 6, 45, xa - 34, 45, { hs: 6 });
    g.label(xa - 38, 45, 'Z_{in}', 'r', 'small');
    if (end === 'short') g.line(xb, y0, xb, y1, { cls: 'thick' });
    else if (end === 'open') { g.dot(xb, y0); g.dot(xb, y1); g.text(xb + 8, 45, 'open', 'l', 'small'); }
    else { g.line(xb, y0, xb + 24, y0); zig(g, xb + 24, y0, xb + 24, y1); g.line(xb + 24, y1, xb, y1); g.label(xb + 34, 45, loadLab, 'l', 'small'); }
    g.dim(xa, y1 + 14, xb, y1 + 14, lenLab, { at: 'b' });
    return g.svg();
  }
  // a junction of two lines; extra = { R } (a resistor across the junction) or { Z3 } (line 2 splits into two lines)
  function junctionFig(Z1, Z2, extra = {}) {
    const g = PF.fig({ alt: 'Line 1 on the left meets line 2 on the right at a junction.' });
    const xj = 150;
    if (extra.Z3) {
      rails(g, 10, xj, 46, 74, `Z_1 = ${F(Z1)}\\,\\Omega`);
      g.line(xj, 10, xj, 46); g.line(xj, 74, xj, 110);
      rails(g, xj, 290, 10, 38, `Z_2 = ${F(Z2)}\\,\\Omega`);
      rails(g, xj, 290, 82, 110, `Z_3 = ${F(extra.Z3)}\\,\\Omega`);
      g.line(xj, 38, xj + 12, 38); g.line(xj, 82, xj + 12, 82);
      [10, 38, 82, 110].forEach((y) => g.dot(xj, y, 2.2));
      return g.svg();
    }
    if (extra.R) {
      // the resistor's label sits between the rails, so the line labels go above them
      rails(g, 10, xj, 20, 70); rails(g, xj, 290, 20, 70);
      g.label((10 + xj) / 2, 12, `Z_1 = ${F(Z1)}\\,\\Omega`, 'b', 'small'); g.label((xj + 290) / 2, 12, `Z_2 = ${F(Z2)}\\,\\Omega`, 'b', 'small');
      zig(g, xj, 20, xj, 70, 26); g.label(xj + 10, 45, `R = ${F(extra.R)}\\,\\Omega`, 'l', 'small');
    } else {
      rails(g, 10, xj, 20, 70, `Z_1 = ${F(Z1)}\\,\\Omega`);
      rails(g, xj, 290, 20, 70, `Z_2 = ${F(Z2)}\\,\\Omega`);
      g.line(xj, 4, xj, 86, { cls: 'dim dash' });
    }
    g.dot(xj, 20); g.dot(xj, 70);
    return g.svg();
  }

  const DECKS = [];
  // every deck draws again (up to 40 times) until it has at least 3 distinct options and, for decks with a clean()
  // test, numbers that work without a calculator
  const deck = (d) => {
    const make0 = d.make;
    d.make = () => {
      let it;
      for (let k = 0; k < 40; k++) { it = make0(); if (it.opts.length >= 3 && (!d.clean || d.clean(it))) return it; }
      return it;
    };
    DECKS.push(d);
    return d;
  };
  // an option is clean if it is a whole number or a small fraction (TL.frac falls back to decimals otherwise)
  const cleanOpts = (it) => it.opts.every((o) => !/\d\.\d|\\times10/.test(o));

  // ================================================================ 1. direction of travel
  deck({
    id: 'g3_dir', title: 'Which way does it travel?', chip: 'Direction',
    sub: 'Read the direction of travel off a time-domain or phasor expression',
    rule: md`Look at the coordinate inside the phase: the wave moves along it. **Opposite signs** on $\omega t$ and the space term ($\omega t - \beta z$, or $\beta z - \omega t$): toward **$+z$**. **Same signs** ($\omega t + \beta z$): toward **$-z$**. In a phasor the $e^{j\omega t}$ is hidden and carries a plus sign, so $e^{-j\beta z}$ means $+z$ and $e^{+j\beta z}$ means $-z$; $e^{-\gamma z}$ means $+z$. The unit vector in front tells you where the field **points**, never where it goes. A minus sign on the amplitude changes nothing.`,
    make() {
      const u = pick(AX), s = pick([1, -1]), fAx = pick(AX.filter((a) => a !== u)), other = AX.find((a) => a !== u && a !== fAx);
      const [k] = kOf(), a = pick(['0.1', '0.5', '2', '3']);
      const A = pick([2, 3, 5, 6, 10]), amp = `${pick(['', '', '-'])}${A}`;
      const m = s > 0 ? '-' : '+', R = vec(u, s), dT = `$${vT(R)}$`;
      const ex = s > 0 ? '-' : '';
      let E, how;
      const timeHow = md`A crest is where the phase $\omega t ${m} ${k} ${u}$ stays constant. As $t$ grows, $${u}$ must ${s > 0 ? 'grow' : 'shrink'} to keep it constant (${s > 0 ? 'opposite' : 'the same'} signs on $\omega t$ and $${k} ${u}$): the wave moves toward ${dT}.`;
      switch (pick(['cos', 'rev', 'sin', 'decay', 'dal', 'ph', 'phG', 'phD'])) {
        case 'cos': E = md`\mathbf E = ${amp}\cos(\omega t ${m} ${k} ${u})\,\hat ${fAx}`; how = timeHow; break;
        case 'sin': E = md`\mathbf E = ${amp}\sin(\omega t ${m} ${k} ${u})\,\hat ${fAx}`; how = timeHow; break;
        case 'decay': E = md`\mathbf E = ${amp}e^{${ex}${a} ${u}}\cos(\omega t ${m} ${k} ${u})\,\hat ${fAx}`; how = md`${timeHow} The decay factor agrees: it shrinks toward ${dT}.`; break;
        case 'rev':
          E = md`\mathbf E = ${amp}\cos(${k} ${u} ${s > 0 ? '-' : '+'} \omega t)\,\hat ${fAx}`;
          how = md`The order inside the cosine does not matter; the signs do. $${k} ${u}$ and $\omega t$ have ${s > 0 ? 'opposite' : 'the same'} signs ($\cos$ is even, so this is $\cos(\omega t ${m} ${k} ${u})$): the wave moves toward ${dT}.`;
          break;
        case 'dal':
          E = md`\mathbf E = ${amp}\cos\big(\omega(t ${m} ${u}/v)\big)\,\hat ${fAx}`;
          how = md`$f(t ${m} ${u}/v)$ is a d'Alembert wave: ${s > 0 ? `$t - ${u}/v$ stays fixed when $${u}$ grows with $t$` : `$t + ${u}/v$ stays fixed when $${u}$ shrinks as $t$ grows`}, so it moves toward ${dT}.`;
          break;
        case 'ph':
          E = md`\Et = ${amp}\,e^{${ex}j${k} ${u}}\,\hat ${fAx}`;
          how = md`Put back the hidden $e^{j\omega t}$: the phase is $\omega t ${m} ${k} ${u}$, ${s > 0 ? 'opposite' : 'the same'} signs, so the wave moves toward ${dT}.`;
          break;
        case 'phG':
          E = md`\Et = ${amp}\,e^{${ex}\gamma ${u}}\,\hat ${fAx}`;
          how = md`$e^{${ex}\gamma ${u}} = e^{${ex}\alpha ${u}}e^{${ex}j\beta ${u}}$. Put back $e^{j\omega t}$: the phase is $\omega t ${m} \beta ${u}$, so the wave moves toward ${dT} (and decays that way).`;
          break;
        default:
          E = md`\Et = ${amp}\,e^{${ex}${a} ${u}}e^{${ex}j${k} ${u}}\,\hat ${fAx}`;
          how = md`Put back the hidden $e^{j\omega t}$: the phase is $\omega t ${m} ${k} ${u}$, so the wave moves toward ${dT}. The decay $e^{${ex}${a} ${u}}$ shrinks the same way.`;
      }
      const w = [
        [`$${vT(neg(R))}$`, md`Backwards. ${how}`],
        [`$${vT(vec(fAx, pick([1, -1])))}$`, md`$\hat ${fAx}$ is the direction the field **points**, not the way it moves. A plane wave moves along the coordinate inside its phase, here $${u}$.`],
        [`$${vT(vec(other, pick([1, -1])))}$`, md`Nothing in the expression depends on $${other}$. The wave moves along the coordinate inside its phase, $${u}$.`],
      ];
      return { q: md`Which way does this wave travel? $$${E}$$`, ...mc(`$${vT(R)}$`, w), rule: how };
    },
  });

  // ================================================================ 2. which way H points
  deck({
    id: 'g3_hdir', title: 'Which way does H point?', chip: 'H from E',
    sub: 'Given E and the direction of travel, the direction and sign of H',
    rule: md`$\mathbf E\times\mathbf H$ points the way the wave travels. So $\mathbf H$ points along $\hat k\times\hat E$, where $\hat k$ is the travel direction (from the phase) and $\hat E$ is where $\mathbf E$ points **including the sign of its amplitude**. The size is $|E|/\eta$ and the time or phasor factor is the same as E's. Cyclic order: $\hat x\times\hat y = \hat z$, $\hat y\times\hat z = \hat x$, $\hat z\times\hat x = \hat y$; reversing the order flips the sign.`,
    make() {
      const u = pick(AX), s = pick([1, -1]), k = vec(u, s);
      const e = pick(AX.filter((a) => a !== u)), sg = pick([1, -1]);
      const A = pick([2, 3, 4, 5, 6, 8, 10, 12]), [kb] = kOf();
      const Ev = vec(e, sg), H = cross(k, Ev), m = s > 0 ? '-' : '+', ex = s > 0 ? '-' : '';
      const phasor = Math.random() < 0.4, jj = phasor ? pick(['', 'j']) : '';
      let Et, Ht;
      if (!phasor) {
        Et = md`\mathbf E = ${sg < 0 ? '-' : ''}${A}\,\hat ${e}\cos(\omega t ${m} ${kb} ${u})`;
        Ht = md`\mathbf H = \dfrac{${A}}{\eta}\,\square\,\cos(\omega t ${m} ${kb} ${u})`;
      } else {
        Et = md`\Et = ${sg < 0 ? '-' : ''}${jj}${A}\,\hat ${e}\,e^{${ex}j${kb} ${u}}`;
        Ht = md`\Ht = \dfrac{${jj}${A}}{\eta}\,\square\,e^{${ex}j${kb} ${u}}`;
      }
      const how = md`Travel: $${vT(k)}$ (${s > 0 ? 'opposite' : 'the same'} signs on $\omega t$ and $${kb} ${u}$${phasor ? ' once $e^{j\\omega t}$ is put back' : ''}). $\mathbf E$ points along $${vT(Ev)}$${sg < 0 ? ' (the minus sign belongs to the direction)' : ''}. So $\mathbf H$ points along $\hat k\times\hat E = (${vT(k)})\times(${vT(Ev)}) = ${vT(H)}$.`;
      const w = [
        [`$${vT(neg(H))}$`, md`That makes $\mathbf E\times\mathbf H$ point along $${vT(neg(k))}$, against the travel. Either the travel direction was read backwards, the minus sign on E was dropped, or the cross product was taken in the wrong order. ${how}`],
        [`$${vT(k)}$`, md`That is the travel direction. A plane wave is TEM: $\mathbf H$ has no component along the way it travels.`],
        [`$${vT(Ev)}$`, md`That is where $\mathbf E$ points. $\mathbf H$ is perpendicular to $\mathbf E$: use $\hat k\times\hat E$.`],
      ];
      return { q: md`In a lossless medium, $$${Et}.$$ Then $$${Ht}.$$ What is $\square$ (a unit vector, with its sign)?`, ...mc(`$${vT(H)}$`, w), rule: how };
    },
  });

  // ================================================================ 3. phasor <-> time
  // E = A cos(wt -/+ k u + th): th in degrees, one of 0, 90, -90, 180
  const timeTx = (A, th, ph) => ({ 0: `${A}\\cos(${ph})`, '-90': `${A}\\sin(${ph})`, 90: `-${A}\\sin(${ph})`, 180: `-${A}\\cos(${ph})` })[th];
  const phCoef = (A, th) => ({ 0: `${A}`, 90: `j${A}`, '-90': `-j${A}`, 180: `-${A}` })[th];
  const wrap = (th) => { let t = ((th % 360) + 360) % 360; if (t > 180) t -= 360; return t; };
  const thWord = { 0: 'a plain cosine (phasor $A$)', '-90': 'a sine: $\\sin x = \\cos(x - 90^\\circ)$, phasor $-jA$', 90: 'a minus sine: $-\\sin x = \\cos(x + 90^\\circ)$, phasor $+jA$', 180: 'a minus cosine: phasor $-A$' };
  deck({
    id: 'g3_phasor', title: 'Phasor and time form', chip: 'Phasor ↔ time',
    sub: 'Convert between E(t) and its phasor, with sines and signs',
    rule: md`Cosine is the reference: $E(t) = \Re\{\tilde E e^{j\omega t}\}$. So $A\cos(\cdot)\leftrightarrow A$, $A\sin(\cdot) = A\cos(\cdot - 90^\circ)\leftrightarrow -jA$, $-A\sin(\cdot)\leftrightarrow +jA$, $-A\cos(\cdot)\leftrightarrow -A$. The space part keeps its sign: $\omega t - \beta z\leftrightarrow e^{-j\beta z}$, $\omega t + \beta z\leftrightarrow e^{+j\beta z}$. Going back, multiply by $e^{j\omega t}$ and take the real part: $j$ is $+90^\circ$, $-j$ is $-90^\circ$.`,
    make() {
      const u = pick(AX), c = pick(AX.filter((a) => a !== u)), s = pick([1, -1]), [k] = kOf();
      const A = pick([2, 3, 4, 5, 6, 8, 10]), th = pick([0, 90, -90, 180, -90, 90]);
      const ph = (ss) => `\\omega t ${ss > 0 ? '-' : '+'} ${k} ${u}`;
      const tT = (t, ss) => timeTx(A, t, ph(ss));
      const pT = (t, ss) => `${phCoef(A, t)}\\,e^{${ss > 0 ? '-' : ''}j${k} ${u}}`;
      const toPh = Math.random() < 0.5;
      const how = md`$${tT(th, s)}$ is ${thWord[th]}. The space term keeps its sign: $${ph(s)}\leftrightarrow e^{${s > 0 ? '-' : ''}j${k} ${u}}$. So $${tT(th, s)}\leftrightarrow ${pT(th, s)}$.`;
      const opt = (t, ss) => `$${toPh ? pT(t, ss) : tT(t, ss)}$`;
      const why = (t, ss) => {
        const bits = [];
        if (wrap(t) !== th) {
          const d = wrap(t - th);
          if (Math.abs(d) === 180) bits.push(th === 90 || th === -90 ? (toPh ? 'The sign of the $j$ is flipped: a sine lags the cosine by $90^\\circ$, so $\\sin\\leftrightarrow -j$ and $-\\sin\\leftrightarrow +j$.' : 'The sign is flipped: $j$ means $+90^\\circ$, and $\\cos(x + 90^\\circ) = -\\sin x$; $-j$ means $\\cos(x - 90^\\circ) = +\\sin x$.') : 'A sign error: a minus sign is a $180^\\circ$ phase, and it has to stay.');
          else if (th === 0 || th === 180) bits.push(toPh ? 'A cosine is the reference: it needs no $j$.' : 'A real phasor gives a cosine, with no $90^\\circ$ shift: $j$ appears only for a sine.');
          else bits.push(toPh ? 'The $j$ is missing: a sine is $90^\\circ$ away from the cosine reference, and $j$ (or $-j$) carries those $90^\\circ$.' : 'The $j$ was dropped: it is a $90^\\circ$ shift, which turns the cosine into a sine.');
        }
        if (ss !== s) bits.push(`The space term flipped sign: $${ph(s)}$ goes with $e^{${s > 0 ? '-' : ''}j${k} ${u}}$ (travel toward $${s > 0 ? '+' : '-'}${u}$); the other sign is a wave going the other way.`);
        return bits.join(' ') + ` ${how}`;
      };
      const w = [[wrap(th + 180), s], [th === 0 || th === 180 ? wrap(th - 90) : wrap(th - th), s], [th, -s], [wrap(th + 180), -s]].map(([t, ss]) => [opt(t, ss), why(t, ss)]);
      const q = toPh ? md`What is the phasor $\tilde E_${c}$ of $$E_${c} = ${tT(th, s)}?$$` : md`The phasor is $$\tilde E_${c} = ${pT(th, s)}.$$ What is $E_${c}(t)$?`;
      return { q, ...mc(opt(th, s), w), rule: how };
    },
  });

  // ================================================================ 4. read alpha, beta, lambda, delta
  deck({
    id: 'g3_read', title: 'Read α, β, λ, δ off a wave', chip: 'Read α β λ δ',
    sub: 'The decay constant, the phase constant, the wavelength and the skin depth from a written wave',
    rule: md`In $e^{-\alpha z}\cos(\omega t - \beta z)$ or $e^{-(\alpha + j\beta)z}$: the number with the **decay** is $\alpha$ (Np/m), the number with the **phase** is $\beta$ (rad/m). Then $\lambda = 2\pi/\beta$ and $\delta = 1/\alpha$ (the distance over which the field falls by $e$). In a good conductor $\alpha = \beta = 1/\delta$, so $\lambda = 2\pi\delta$. Power decays at $2\alpha$, so $1/(2\alpha)$ is the power's $1/e$ depth, not $\delta$.`,
    make() {
      const u = pick(AX), c = pick(AX.filter((x) => x !== u)), s = pick([1, -1]);
      // beta = bn * pi^bp
      let an, bn, bp;
      if (Math.random() < 0.3) { an = pick([2, 10, 100, 1000]); bn = an; bp = 0; }
      else {
        an = pick([0.1, 0.2, 0.5, 1, 2, 4, 5, 10, 20]);
        if (Math.random() < 0.6) { bn = pick([0.5, 1, 2, 4, 5, 10, 20]); bp = 1; } else { bn = pick([1, 2, 4, 5, 10, 20, 100].filter((x) => x !== an)); bp = 0; }
      }
      const aT = P(an), bT = piT(bn, bp), E0 = pick([2, 5, 10, 20]);
      const ex = s > 0 ? '-' : '', m = s > 0 ? '-' : '+';
      const E = Math.random() < 0.5 ? md`\mathbf E = ${E0}e^{${ex}${aT} ${u}}\cos(\omega t ${m} ${bT} ${u})\,\hat ${c}` : md`\Et = ${E0}e^{${ex}(${aT} + j${bT})${u}}\,\hat ${c}`;
      const ask = pick(['a', 'b', 'l', 'd', 'l', 'd']);
      const lam = [2 / bn, -bp + 1];              // 2 pi / beta = (2/bn) pi^(1 - bp)
      const Np = (x) => `${P(x)}\\ \\text{Np/m}`, Rad = (n, pw) => `${piT(n, pw)}\\ \\text{rad/m}`;
      const intro = md`The decay factor holds $\alpha = ${aT}$ Np/m; the phase holds $\beta = ${bT}$ rad/m.`;
      let right, w, name, how;
      if (ask === 'a') {
        name = '\\alpha'; right = `$${Np(an)}$`; how = intro;
        w = [[`$${bT}\\ \\text{Np/m}$`, md`That is $\beta$, the number multiplying $${u}$ in the phase. $\alpha$ is the one in the decay. ${intro}`],
          [`$${Np(2 * an)}$`, md`$2\alpha$ is the decay rate of the **power** ($|E|^2$). The field decays as $e^{-\alpha ${u}}$. ${intro}`],
          [`$${Np(1 / an)}$`, md`$1/\alpha$ is $\delta$, a length, not $\alpha$. ${intro}`]];
      } else if (ask === 'b') {
        name = '\\beta'; right = `$${Rad(bn, bp)}$`; how = intro;
        w = [[`$${Rad(an, 0)}$`, md`That is $\alpha$, the number in the decay factor. $\beta$ multiplies $${u}$ in the phase. ${intro}`],
          [`$${Rad(lam[0], lam[1])}$`, md`$2\pi/\beta$ is $\lambda$, a length. ${intro}`],
          [`$${Rad(bn / 2, bp - 1)}$`, md`$\beta/2\pi$ is $1/\lambda$. ${intro}`]];
      } else if (ask === 'l') {
        name = '\\lambda'; right = `$${lenT(lam[0], lam[1])}$`;
        how = md`${intro} So $\lambda = 2\pi/\beta = 2\pi/(${bT}) = ${lenT(lam[0], lam[1])}$.`;
        w = [[`$${lenT(1 / bn, -bp)}$`, md`That is $1/\beta$: the $2\pi$ is missing. ${how}`],
          [`$${lenT(1 / bn, 1 - bp)}$`, md`That is $\pi/\beta$, half a wavelength. ${how}`],
          [`$${lenT(2 / an, 1)}$`, md`That used $\alpha$; the wavelength comes from the phase constant $\beta$. ${how}`],
          [`$${lenT(1 / an, 0)}$`, md`That is $1/\alpha = \delta$, the decay length. ${how}`]];
      } else {
        name = '\\delta'; right = `$${lenT(1 / an, 0)}$`;
        how = md`${intro} So $\delta = 1/\alpha = 1/${aT} = ${lenT(1 / an, 0)}$: the field falls by $e$ in that distance.`;
        w = [[`$${lenT(1 / (2 * an), 0)}$`, md`$1/(2\alpha)$ is where the **power** falls by $e$. $\delta$ is defined on the field: $1/\alpha$. ${how}`],
          [`$${lenT(lam[0], lam[1])}$`, md`That is $\lambda = 2\pi/\beta$. ${how}`],
          [`$${lenT(1 / bn, -bp)}$`, md`That is $1/\beta$; $\delta$ comes from the decay, $1/\alpha$. ${how}`]];
      }
      return { q: md`$$${E}$$ What is $${name}$?`, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 5. loss regime
  const FREQS = [['180\\ \\text{kHz}', 1e-5], ['1.8\\ \\text{MHz}', 1e-4], ['18\\ \\text{MHz}', 1e-3], ['180\\ \\text{MHz}', 1e-2], ['1.8\\ \\text{GHz}', 0.1], ['18\\ \\text{GHz}', 1]];
  const REG = ['Perfect dielectric ($\\sigma = 0$)', 'Imperfect (low-loss) dielectric', 'Neither: use the full $\\gamma$ and $\\eta$', 'Good conductor'];
  deck({
    id: 'g3_regime', title: 'Which regime: the loss tangent', chip: 'Loss regime',
    sub: 'Perfect, low-loss, in between, or good conductor, from σ/ωε',
    rule: md`Compute the loss tangent $\sigma/\omega\epsilon$, conduction current over displacement current. **$\ll 1$ (0.01 or less): imperfect (low-loss) dielectric**, $\beta\approx\omega\sqrt{\mu\epsilon}$, small $\alpha$. **$\gg 1$ (100 or more): good conductor**, $\alpha = \beta = 1/\delta$. Near 1: neither, use the full $\gamma$. **Speed trick:** $\omega\epsilon_0 = 2\pi f\cdot\dfrac{10^{-9}}{36\pi} = \dfrac{f}{18}\times10^{-9}$ S/m, so at 18 MHz $\omega\epsilon_0 = 10^{-3}$ S/m, and every factor of 10 in $f$ is a factor of 10 here. Multiply by $\epsilon_r$.`,
    make() {
      const [fT, w0] = pick(FREQS), er = pick([1, 2, 4, 5, 10, 80]);
      const cls = Math.random() < 0.08 ? 0 : pick([1, 2, 3]);
      const r = cls === 0 ? 0 : cls === 1 ? pick([1e-4, 1e-3, 2e-3, 5e-3, 0.01]) : cls === 2 ? pick([0.5, 1, 2]) : pick([100, 1e3, 1e4, 1e6]);
      const sig = r * er * w0;
      const verdict = ['$\\sigma = 0$: a perfect dielectric, no loss at all', 'far below 1, so an imperfect (low-loss) dielectric', 'near 1, so neither approximation holds: use the full $\\gamma$', 'far above 1, so a good conductor'][cls];
      const how = cls === 0 ? md`$\sigma = 0$: no conduction current at all, so a perfect dielectric ($\alpha = 0$).`
        : md`At $f = ${fT}$, $\omega\epsilon_0 =\tfrac{f}{18}\times10^{-9} = ${P(w0)}$ S/m, so $\omega\epsilon = ${er}\times${P(w0)} = ${P(er * w0)}$ S/m. Loss tangent $\sigma/\omega\epsilon = ${P(sig)}/${P(er * w0)} = ${P(r)}$: ${verdict}.`;
      const whyOf = (k) => {
        if (cls === 0) return k === 1 ? md`Low-loss means small but nonzero $\sigma$. Here $\sigma = 0$ exactly: no conduction current, $\alpha = 0$.` : md`With $\sigma = 0$ there is no conduction current at all; the loss tangent is 0.`;
        if (cls === 1) return [md`$\sigma$ is not zero, only small next to $\omega\epsilon$: the wave still decays a little. ${how}`, null, md`The loss tangent is far below 1, so the low-loss formulas are accurate. "Neither" is for a ratio near 1 (roughly 0.1 to 10). ${how}`, md`Upside down: $\omega\epsilon/\sigma = ${P(1 / r)}$ is large, but the loss tangent is $\sigma/\omega\epsilon$. ${how}`][k];
        if (cls === 2) return [md`$\sigma\ne0$, and conduction current is comparable to displacement current. ${how}`, md`A loss tangent of $${P(r)}$ is not $\ll 1$: the low-loss formulas would be badly off. ${how}`, null, md`A loss tangent of $${P(r)}$ is not $\gg 1$: the good-conductor formulas would be badly off. ${how}`][k];
        return [md`Far from it: conduction current dominates. ${how}`, md`Upside down: $\omega\epsilon/\sigma = ${P(1 / r)}$ is small, but the loss tangent is $\sigma/\omega\epsilon$, which is huge. ${how}`, md`The loss tangent is far above 10, so the good-conductor formulas ($\alpha = \beta = 1/\delta$) are accurate. ${how}`, null][k];
      };
      return { q: md`A material has $\sigma = ${P(sig)}$ S/m, $\epsilon_r = ${er}$, $\mu_r = 1$. At $f = ${fT}$ it behaves as a:`, ...fixed(REG, cls, whyOf), rule: how };
    },
  });

  // ================================================================ 6. polarization
  // a phasor coefficient: kind 'ax' (magnitude m, phase th in 0/90/-90/180) or 'd' (k(+-1 +- j), th an odd multiple of 45)
  // or 'e' (m e^{+-j pi/3})
  const coefT = (c) => {
    if (c.kind === 'ax') return phCoef(c.m === 1 ? '' : c.m, c.th).replace(/^$/, '1').replace(/^-$/, '-1');
    if (c.kind === 'e') return `${c.m === 1 ? '' : c.m}e^{${c.th < 0 ? '-' : ''}j\\pi/3}`;
    const re = Math.abs(c.th) < 90 ? '1' : '-1', im = c.th > 0 ? '+' : '-';
    return `${c.m === 1 ? '' : c.m}(${re} ${im} j)`;
  };
  const magT = (c) => (c.kind === 'd' ? `${c.m === 1 ? '' : c.m}\\sqrt2` : `${c.m}`);
  const magV = (c) => (c.kind === 'd' ? c.m * Math.SQRT2 : c.m);
  // a time-domain term m cos(ph + th)
  const tTerm = (m, th, ph) => {
    const M = m === 1 ? '' : m;
    if ([0, 90, -90, 180].includes(th)) return timeTx(M, th, ph);
    return `${M}\\cos(${ph} ${th > 0 ? '+' : '-'} ${Math.abs(th)}^\\circ)`;
  };
  const join2 = (a, b) => `${a} ${b.startsWith('-') ? '- ' + b.slice(1) : '+ ' + b}`;
  const POL = ['Linear', 'Circular', 'Elliptical'];
  deck({
    id: 'g3_pol', title: 'Linear, circular or elliptical?', chip: 'Polarization',
    sub: 'The polarization type from two field components, time form or phasor',
    rule: md`Write each component's **phase** (cosine $0^\circ$, sine $-90^\circ$, minus sign $180^\circ$; in a phasor $j$ is $+90^\circ$, $-j$ is $-90^\circ$, $1 + j$ is $45^\circ$) and its **size**. **Phases equal or $180^\circ$ apart** (the ratio of the two phasors is real): **linear**, whatever the sizes. **$90^\circ$ apart and equal sizes: circular.** Anything else: **elliptical**.`,
    make() {
      const w = pick(AX), s = pick([1, -1]), uv = AX.filter((a) => a !== w);
      const [u, v] = Math.random() < 0.5 ? uv : uv.slice().reverse();
      const [k] = kOf(), ph = `\\omega t ${s > 0 ? '-' : '+'} ${k} ${w}`;
      const cls = pick([0, 1, 2]);
      const four = [0, 90, -90, 180], phasor = Math.random() < 0.5;
      const mm = () => pick([1, 2, 3, 4, 5]);
      let cu, cv;   // coefficients { kind, m, th }
      if (cls === 0) {
        if (phasor && Math.random() < 0.3) { const t = pick([45, -45, 135, -135]); cu = { kind: 'd', m: pick([1, 2]), th: t }; cv = { kind: 'd', m: pick([1, 2, 3]), th: wrap(t + pick([0, 180])) }; }
        else { const t = pick(four); cu = { kind: 'ax', m: mm(), th: t }; cv = { kind: 'ax', m: mm(), th: wrap(t + pick([0, 180])) }; }
      } else if (cls === 1) {
        if (phasor && Math.random() < 0.3) { const t = pick([45, -45, 135, -135]), m = pick([1, 2]); cu = { kind: 'd', m, th: t }; cv = { kind: 'd', m, th: wrap(t + pick([90, -90])) }; }
        else { const t = pick(four), m = mm(); cu = { kind: 'ax', m, th: t }; cv = { kind: 'ax', m, th: wrap(t + pick([90, -90])) }; }
      } else {
        const sub = pick(['size', 'size', 'phase']);
        if (sub === 'size') { const t = pick(four), a = mm(); let b = mm(); while (b === a) b = mm(); cu = { kind: 'ax', m: a, th: t }; cv = { kind: 'ax', m: b, th: wrap(t + pick([90, -90])) }; }
        else if (phasor) {
          if (Math.random() < 0.5) { cu = { kind: 'd', m: 1, th: pick([45, -45, 135, -135]) }; cv = { kind: 'ax', m: pick([1, 2, 3]), th: pick(four) }; }
          else { const m = mm(); cu = { kind: 'ax', m, th: 0 }; cv = { kind: 'e', m: pick([m, mm()]), th: pick([60, -60]) }; }
        } else { const m = mm(); cu = { kind: 'ax', m, th: 0 }; cv = { kind: 'ax', m: pick([m, mm()]), th: pick([45, -45, 60, -60, 135, -135]) }; }
      }
      if (Math.random() < 0.5) [cu, cv] = [cv, cu];
      const d = wrap(cv.th - cu.th), eq = Math.abs(magV(cu) - magV(cv)) < 1e-9;
      let E;
      if (phasor && !(cu.kind === 'ax' && cv.kind === 'ax' && Math.random() < 0.2)) E = md`\Et = \big(${join2(md`${coefT(cu)}\,\hat ${u}`, md`${coefT(cv)}\,\hat ${v}`)}\big)e^{${s > 0 ? '-' : ''}j${k} ${w}}`;
      else E = md`\mathbf E = ${join2(md`${tTerm(cu.m, cu.th, ph)}\,\hat ${u}`, md`${tTerm(cv.m, cv.th, ph)}\,\hat ${v}`)}`;
      const facts = md`Phases: $\hat ${u}$ at $${cu.th}^\circ$, $\hat ${v}$ at $${cv.th}^\circ$, so $${Math.abs(d)}^\circ$ apart; sizes $${magT(cu)}$ and $${magT(cv)}$.`;
      const how = md`${facts} ${['In phase or opposite: the tip stays on a line, so linear.', '90° apart and equal sizes: circular.', Math.abs(d) === 90 ? '90° apart but unequal sizes: elliptical.' : `Neither 0°, 180° nor 90°: elliptical.`][cls]}`;
      const whyOf = (j) => {
        if (cls === 0) return j === 1 ? md`Circular needs a $90^\circ$ phase difference${eq ? '; equal sizes alone are not enough' : ''}. ${how}` : md`Elliptical needs a phase difference other than $0^\circ$ and $180^\circ$ (a minus sign is just $180^\circ$). ${how}`;
        if (cls === 1) return j === 0 ? md`The components are $90^\circ$ apart, so the tip rotates. Linear needs $0^\circ$ or $180^\circ$. ${how}` : md`Equal sizes and exactly $90^\circ$ apart trace a circle (the special ellipse). Elliptical would need unequal sizes or another phase difference. ${how}`;
        return j === 0 ? md`The phase difference is $${Math.abs(d)}^\circ$, not $0^\circ$ or $180^\circ$: the tip rotates. ${how}` : md`${Math.abs(d) === 90 ? 'The components are 90° apart, but their sizes differ: that is an ellipse.' : `Circular needs exactly 90°; here the difference is ${Math.abs(d)}°${eq ? ' (equal sizes are not enough)' : ''}.`} ${how}`;
      };
      return { q: md`What is the polarization? $$${E}$$`, ...fixed(POL, cls, whyOf), rule: how };
    },
  });

  // ================================================================ 7. handedness
  const HAND = ['Right-handed', 'Left-handed', 'Linear: it does not rotate'];
  deck({
    id: 'g3_hand', title: 'Which hand?', chip: 'Handedness',
    sub: 'Right- or left-handed rotation, any axis, time form or phasor',
    rule: md`Four steps. (1) The **travel direction** $\hat k$ from the phase. (2) Which component **leads** by $90^\circ$ (cosine leads sine; in a phasor, the one without the extra $-j$ leads: in $\hat x - j\hat y$, $x$ leads). (3) $\mathbf E$ turns **from the leading component toward the lagging one**. (4) If (leading $\times$ lagging) $= +\hat k$, it is **right-handed** (right thumb along the travel, fingers curl with $\mathbf E$); if it is $-\hat k$, left-handed. Example: $\cos(\omega t - \beta z)\hat x + \sin(\omega t - \beta z)\hat y$: $x$ leads, $\hat x\times\hat y = +\hat z$, travel $+\hat z$: right-handed.`,
    make() {
      const w = pick(AX), s = pick([1, -1]), k = vec(w, s);
      const i = AX.indexOf(w), u = AX[(i + 1) % 3], v = AX[(i + 2) % 3];    // u x v = +w
      const [kb] = kOf(), ph = `\\omega t ${s > 0 ? '-' : '+'} ${kb} ${w}`;
      const thu = pick([0, 90, -90, 180]), D = pick([90, -90]), thv = wrap(thu + D);
      const mu = pick([1, 2, 3, 4]), mv = Math.random() < 0.7 ? mu : pick([1, 2, 3, 4, 5].filter((x) => x !== mu));
      const lead = D > 0 ? v : u, lag = D > 0 ? u : v;
      const axis = cross(vec(lead), vec(lag)), rightH = axis.ax === k.ax && axis.s === k.s;
      let tu, tv;
      const phasor = Math.random() < 0.5;
      if (phasor) { tu = `${phCoef(mu === 1 ? '' : mu, thu).replace(/^$/, '1').replace(/^-$/, '-1')}\\,\\hat ${u}`; tv = `${phCoef(mv === 1 ? '' : mv, thv).replace(/^$/, '1').replace(/^-$/, '-1')}\\,\\hat ${v}`; }
      else { tu = `${tTerm(mu, thu, ph)}\\,\\hat ${u}`; tv = `${tTerm(mv, thv, ph)}\\,\\hat ${v}`; }
      const [t1, t2] = Math.random() < 0.5 ? [tu, tv] : [tv, tu];
      const E = phasor ? md`\Et = \big(${join2(t1, t2)}\big)e^{${s > 0 ? '-' : ''}j${kb} ${w}}` : md`\mathbf E = ${join2(t1, t2)}`;
      const how = md`Travel: $${vT(k)}$. Phases: $\hat ${u}$ at $${thu}^\circ$, $\hat ${v}$ at $${thv}^\circ$, so $${lead}$ leads $${lag}$ by $90^\circ$ and $\mathbf E$ turns from $\hat ${lead}$ toward $\hat ${lag}$: $\hat ${lead}\times\hat ${lag} = ${vT(axis)}$, ${rightH ? 'the same as' : 'opposite to'} the travel. ${rightH ? 'Right' : 'Left'}-handed.`;
      const whyOf = (j) => (j === 2 ? md`The components are $90^\circ$ apart in phase, so the tip rotates. Linear needs $0^\circ$ or $180^\circ$. ${how}` : md`Wrong hand: check which component leads and read the travel direction from the phase. ${how}`);
      return { q: md`Which hand? $$${E}$$`, ...fixed(HAND, rightH ? 0 : 1, whyOf), rule: how };
    },
  });

  // ================================================================ 8. Gamma and tau at a boundary
  const NS = [1, 1.5, 2, 3, 4, 5];               // refractive index n = sqrt(eps_r); eta = eta0 / n
  const erT = (n) => P(n * n);
  const etaT = (n) => (n === 1 ? '120\\pi' : `${P(120 / n)}\\pi`);
  deck({
    id: 'g3_gamma', title: 'Γ and τ at a boundary', chip: 'Γ, τ at a boundary',
    sub: 'Sign and size of the reflection and transmission coefficients at normal incidence',
    rule: md`$\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$, $\tau = 1 + \Gamma = \dfrac{2\eta_2}{\eta_2 + \eta_1}$ (E is continuous: $1 + \Gamma = \tau$). Medium 1 holds the incident wave. Non-magnetic media: $\eta = \eta_0/\sqrt{\epsilon_r}$, so $\Gamma = \dfrac{\sqrt{\epsilon_{r1}} - \sqrt{\epsilon_{r2}}}{\sqrt{\epsilon_{r1}} + \sqrt{\epsilon_{r2}}}$. **Into a denser medium (bigger $\epsilon_r$, smaller $\eta$): $\Gamma < 0$.** Out of it: $\Gamma > 0$. A perfect conductor: $\Gamma = -1$, $\tau = 0$.`,
    make() {
      if (Math.random() < 0.1) {
        const how = md`A perfect conductor has $\eta_2 = 0$, and E must vanish on its surface: incident plus reflected is 0, so $\Gamma = -1$.`;
        return { q: md`A plane wave in air hits a perfect conductor at normal incidence. What is $\Gamma$?`, ...mc('$-1$', [['$+1$', md`$+1$ is an open circuit ($\eta_2\to\infty$). ${how}`], ['$0$', md`0 means no reflection: a matched medium. ${how}`], ['$2$', md`That is $1 + \Gamma$ for an open end, a transmission coefficient, not $\Gamma$. ${how}`]]), rule: how };
      }
      const n1 = pick(NS), n2 = pick(NS.filter((x) => x !== n1));
      const G = (n1 - n2) / (n1 + n2), tau = 1 + G;
      const useEta = Math.random() < 0.3;
      const given = useEta ? md`$\eta_1 = ${etaT(n1)}\ \Omega$ and $\eta_2 = ${etaT(n2)}\ \Omega$` : md`$\epsilon_{r1} = ${erT(n1)}$ and $\epsilon_{r2} = ${erT(n2)}$ (both $\mu_r = 1$)`;
      const step = useEta ? md`$\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = ${F(G)}$` : md`$\sqrt{\epsilon_r}$ is ${P(n1)} and ${P(n2)}, so $\Gamma = \dfrac{${P(n1)} - ${P(n2)}}{${P(n1)} + ${P(n2)}} = ${F(G)}$`;
      const Ge = (n1 * n1 - n2 * n2) / (n1 * n1 + n2 * n2);
      const askT = Math.random() < 0.35;
      const how = md`${step}${askT ? `, and $\\tau = 1 + \\Gamma = ${F(tau)}$` : ''}. ${G < 0 ? 'Into the denser medium (smaller η): negative.' : 'Out of the denser medium (bigger η): positive.'}`;
      if (!askT) {
        return { q: md`Normal incidence from medium 1 onto medium 2, with ${given}. What is $\Gamma$?`, ...mc(`$${F(G)}$`, [
          [`$${F(-G)}$`, md`Upside down: that is $(\eta_1 - \eta_2)/(\eta_1 + \eta_2)$, the $\Gamma$ for a wave coming from medium 2. ${how}`],
          [`$${F(tau)}$`, md`That is $\tau = 1 + \Gamma$, the transmission coefficient. ${how}`],
          useEta ? [`$${F(Ge)}$`, md`That squared the $\eta$'s: $(\eta_2^2 - \eta_1^2)/(\eta_2^2 + \eta_1^2)$. $\Gamma$ is linear in $\eta$. ${how}`] : [`$${F(Ge)}$`, md`That used $\epsilon_r$ where $\sqrt{\epsilon_r}$ belongs: $\eta = \eta_0/\sqrt{\epsilon_r}$. ${how}`],
        ]), rule: how };
      }
      return { q: md`Normal incidence from medium 1 onto medium 2, with ${given}. What is the transmission coefficient $\tau = E_t/E_i$?`, ...mc(`$${F(tau)}$`, [
        [`$${F(G)}$`, md`That is $\Gamma$. $\tau = 1 + \Gamma$. ${how}`],
        [`$${F(1 - G)}$`, md`That is $1 - \Gamma = 2\eta_1/(\eta_1 + \eta_2)$: the $\tau$ for a wave going the other way (and the ratio for H). E is continuous, so $\tau = 1 + \Gamma$, with the entered medium's $\eta_2$ on top. ${how}`],
        [`$${F(tau / 2)}$`, md`The factor 2 is missing: $\tau = 2\eta_2/(\eta_1 + \eta_2)$. ${how}`],
        useEta ? [`$${F(1 + Ge)}$`, md`That squared the $\eta$'s inside $\Gamma$: $1 + (\eta_2^2 - \eta_1^2)/(\eta_2^2 + \eta_1^2)$. $\Gamma$ and $\tau$ are linear in $\eta$. ${how}`] : [`$${F(1 + Ge)}$`, md`That used $\epsilon_r$ where $\sqrt{\epsilon_r}$ belongs. ${how}`],
      ]), rule: how };
    },
  });

  // ================================================================ 9. power split
  deck({
    id: 'g3_power', title: 'How much power gets through?', chip: 'Power split',
    sub: 'Reflected and transmitted fractions of the average power, from Γ',
    rule: md`Between lossless media: reflected fraction $|\Gamma|^2$, transmitted fraction $1 - |\Gamma|^2$. **Square first** (power goes as the field squared), then subtract. The transmitted fraction is also $\tau^2\,\eta_1/\eta_2$; $\tau^2$ alone is wrong whenever $\eta$ changes. Handy pairs: $|\Gamma| = \tfrac13\to\tfrac19$ reflected, $\tfrac89$ through; $\tfrac12\to\tfrac14,\tfrac34$; $\tfrac15\to\tfrac{1}{25},\tfrac{24}{25}$.`,
    make() {
      const n1 = pick(NS), n2 = pick(NS.filter((x) => x !== n1));
      const G = (n1 - n2) / (n1 + n2), tau = 1 + G, g = Math.abs(G);
      const givenG = Math.random() < 0.5;
      const given = givenG ? md`The reflection coefficient at a boundary between two lossless media is $\Gamma = ${F(G)}$.` : md`A plane wave goes from a lossless medium with $\epsilon_r = ${erT(n1)}$ into one with $\epsilon_r = ${erT(n2)}$ (both $\mu_r = 1$), at normal incidence.`;
      const refl = Math.random() < 0.5;
      const how = md`${givenG ? '' : `$\\Gamma = \\dfrac{${P(n1)} - ${P(n2)}}{${P(n1)} + ${P(n2)}} = ${F(G)}$. `}Reflected: $|\Gamma|^2 = ${F(g * g)}$; transmitted: $1 - |\Gamma|^2 = ${F(1 - g * g)}$.`;
      const right = refl ? g * g : 1 - g * g;
      const w = [
        [`$${F(g)}$`, md`That is $|\Gamma|$, a ratio of fields. Power goes as the field squared. ${how}`],
        [`$${F(1 - g)}$`, md`That is $1 - |\Gamma|$: it subtracts field ratios. Powers add, fields do not: use $1 - |\Gamma|^2$. ${how}`],
        [`$${F(refl ? 1 - g * g : g * g)}$`, md`That is the ${refl ? 'transmitted' : 'reflected'} fraction; the question asks for the ${refl ? 'reflected' : 'transmitted'} one. ${how}`],
        refl ? null : [`$${F(tau * tau)}$`, md`$\tau^2$ forgets that $\eta$ changes: the transmitted fraction is $\tau^2\eta_1/\eta_2$, which equals $1 - |\Gamma|^2$. ${how}`],
      ];
      return { q: md`${given} What fraction of the incident average power is ${refl ? '**reflected**' : '**transmitted**'}?`, ...mc(`$${F(right)}$`, w), rule: how };
    },
  });

  // ================================================================ 10. standing-wave nodes
  // lambda in metres; positions shown in cm (lambda up to 2 m) or m
  const posT = (x, lam) => (lam <= 2 ? `z = ${P(x * 100)}\\ \\text{cm}` : `z = ${P(x)}\\ \\text{m}`).replace('z = 0\\ \\text{cm}', 'z = 0').replace('z = 0\\ \\text{m}', 'z = 0');
  deck({
    id: 'g3_nodes', title: 'Where are the nodes?', chip: 'Standing waves',
    sub: 'E and H nulls and peaks in front of a conductor or a dielectric boundary',
    rule: md`In front of a **perfect conductor** at $z = 0$: $|E| = 2E_0|\sin\beta z|$ and $|H| = \tfrac{2E_0}{\eta}|\cos\beta z|$. So **E is zero on the wall** and every $\lambda/2$ from it; **H is largest on the wall** (it carries the surface current) and every $\lambda/2$. The E peaks and H nulls sit halfway, at $\lambda/4$, $3\lambda/4$, ... Behind the wall there is no field. At a **dielectric** boundary: $\Gamma < 0$ (into a denser medium) puts an **E minimum** on the boundary; $\Gamma > 0$ puts an **E maximum** there. The pattern repeats every $\lambda/2$ of medium 1.`,
    make() {
      if (Math.random() < 0.3) {
        // dielectric boundary at z = 0, incident from z < 0
        const pair = pick([[1, 4, 'air', 'a dielectric with $\\epsilon_r = 4$'], [1, 9, 'air', 'a dielectric with $\\epsilon_r = 9$'], [4, 1, 'glass ($\\epsilon_r = 4$)', 'air'], [9, 1, 'a dielectric with $\\epsilon_r = 9$', 'air']]);
        const G = (Math.sqrt(pair[0]) - Math.sqrt(pair[1])) / (Math.sqrt(pair[0]) + Math.sqrt(pair[1]));
        const lam = pick([0.4, 0.6, 1, 2, 0.2]), wantMax = Math.random() < 0.5;
        const at0 = (G > 0) === wantMax;           // is the asked extreme on the boundary?
        const right = at0 ? 0 : -lam / 4;
        const how = md`$\Gamma = ${F(G)}$ (${G < 0 ? 'into a denser medium' : 'into a less dense medium'}). At the boundary the reflected E ${G < 0 ? 'subtracts from' : 'adds to'} the incident E, so the boundary is an E ${G < 0 ? 'minimum' : 'maximum'}, and the E ${G < 0 ? 'maximum' : 'minimum'} is $\lambda_1/4$ in front of it. The ${wantMax ? 'maximum' : 'minimum'} nearest the boundary: $${posT(right, lam)}$.`;
        const w = [[`$${posT(at0 ? -lam / 4 : 0, lam)}$`, md`That is where the E ${wantMax ? 'minimum' : 'maximum'} is. ${how}`],
          [`$${posT(-lam / 8, lam)}$`, md`Maxima and minima sit $\lambda/4$ apart, on the boundary and at $\lambda/4$; nothing special happens at $\lambda/8$. ${how}`],
          [`$${posT(lam / 4, lam)}$`, md`That is inside medium 2, where there is only the transmitted wave: $|E|$ is constant there. ${how}`]];
        return { q: md`A plane wave in ${pair[2]} ($z < 0$) hits ${pair[3]} ($z > 0$) at normal incidence. The wavelength in medium 1 is $\lambda_1 = ${P(lam * 100)}$ cm. Where is the $|E|$ **${wantMax ? 'maximum' : 'minimum'}** nearest the boundary?`, ...mc(`$${posT(right, lam)}$`, w), rule: how };
      }
      const [lam, lamGiven] = pick([[1, 'f = 300 MHz'], [2, 'f = 150 MHz'], [0.6, 'f = 500 MHz'], [0.4, 'f = 750 MHz'], [0.2, 'f = 1.5 GHz'], [4, 'f = 75 MHz'], [1, ''], [0.4, ''], [2, ''], [0.12, '']]);
      const giveT = lamGiven ? md`$${lamGiven.replace(' MHz', '\\ \\text{MHz}').replace(' GHz', '\\ \\text{GHz}')}$ (so $\lambda = c/f$)` : md`$\lambda = ${lam <= 2 ? `${P(lam * 100)}\\ \\text{cm}` : `${P(lam)}\\ \\text{m}`}$`;
      const ask = pick(['En', 'Hn', 'Em', 'Hm']);
      const lamT = lam <= 2 ? `${P(lam * 100)}\\ \\text{cm}` : `${P(lam)}\\ \\text{m}`;
      const base = md`$\lambda = ${lamT}$. E is zero on the wall and every $\lambda/2$; H is largest there. E peaks and H nulls are halfway, at $\lambda/4$.`;
      const askT = { En: 'the nearest point **in front of the wall** (not the wall itself) where $\\mathbf E = 0$ at all times', Hn: 'the nearest point to the wall where $\\mathbf H = 0$ at all times', Em: 'the $|\\mathbf E|$ maximum nearest the wall', Hm: 'the $|\\mathbf H|$ maximum nearest the wall' }[ask];
      const right = { En: -lam / 2, Hn: -lam / 4, Em: -lam / 4, Hm: 0 }[ask];
      const p = (x) => `$${posT(x, lam)}$`;
      const how = md`${base} So ${askT.replace(/\*\*/g, '')}: $${posT(right, lam)}$.`;
      const W = {
        En: [[p(-lam / 4), md`That is an E **maximum** (and an H null). ${how}`], [p(-lam), md`That is the second E null; they repeat every $\lambda/2$. ${how}`], [p(lam / 2), md`That is behind the wall, inside the conductor, where there is no field. ${how}`], [p(-lam / 8), md`Nulls and peaks are $\lambda/4$ apart; nothing special happens at $\lambda/8$. ${how}`]],
        Hn: [[p(0), md`On the wall E is zero and H is **largest**: H there equals the surface current. ${how}`], [p(-lam / 2), md`That is an E null, where H is largest. ${how}`], [p(-lam / 8), md`Nulls and peaks are $\lambda/4$ apart; nothing special happens at $\lambda/8$. ${how}`], [p(lam / 4), md`That is behind the wall, inside the conductor, where there is no field. ${how}`]],
        Em: [[p(0), md`E is **zero** on a perfect conductor (tangential E vanishes there). ${how}`], [p(-lam / 2), md`That is an E null. ${how}`], [p(-lam / 8), md`Nulls and peaks are $\lambda/4$ apart; nothing special happens at $\lambda/8$. ${how}`]],
        Hm: [[p(-lam / 4), md`That is an H **null** (and an E peak). ${how}`], [p(-lam / 8), md`Nulls and peaks are $\lambda/4$ apart; nothing special happens at $\lambda/8$. ${how}`], [p(lam / 4), md`That is behind the wall, inside the conductor, where there is no field. ${how}`]],
      }[ask];
      return { q: md`A plane wave in air travels in $+z$ and hits a perfect conductor at $z = 0$; ${giveT}. Where is ${askT}?`, ...mc(p(right), W), rule: how };
    },
  });

  // ================================================================ 11. Z0 and v from L and C
  const LC = [];
  [25, 40, 50, 75, 100, 150, 200, 250, 300].forEach((Z0) => [1e8, 1.5e8, 2e8, 2.5e8, 3e8].forEach((v) => {
    const L = Z0 / v, C = 1 / (Z0 * v);
    if (Math.abs(L * 1e9 - Math.round(L * 1e9)) < 1e-6 && Math.abs(C * 1e12 - Math.round(C * 1e12)) < 1e-6) LC.push({ Z0, v, L, C });
  }));
  const nH = (L) => (L >= 1e-6 ? `${P(L * 1e6)}\\ \\mu\\text{H/m}` : `${P(L * 1e9)}\\ \\text{nH/m}`);
  const pF = (C) => `${P(C * 1e12)}\\ \\text{pF/m}`;
  const ms = (v) => `${P(v)}\\ \\text{m/s}`;
  deck({
    id: 'g3_lc', title: 'Z₀ and v from L and C', chip: 'Z₀, v, L, C',
    sub: 'Characteristic impedance and speed from the per-metre inductance and capacitance, and back',
    rule: md`$Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$ (per-metre $L$ and $C$). Turned around: $L = Z_0/v$ and $C = 1/(Z_0v)$. **Speed trick:** take the ratio and the product first ($250\,\text{nH}/100\,\text{pF} = 2500$, so $Z_0 = 50\ \Omega$), and keep powers of 10 separate. Check: $v$ must come out at most $3\times10^8$ m/s.`,
    make() {
      const o = pick(LC), ask = pick(['Z', 'v', 'L', 'C']);
      const givenLC = md`A line has $L = ${nH(o.L)}$ and $C = ${pF(o.C)}$.`;
      const givenZv = md`A line has $Z_0 = ${o.Z0}\ \Omega$ and $v = ${ms(o.v)}$.`;
      let q, right, w, how;
      if (ask === 'Z') {
        how = md`$L/C = ${P(o.L / o.C)}\ \Omega^2$, so $Z_0 = \sqrt{L/C} = ${o.Z0}\ \Omega$.`;
        q = md`${givenLC} What is $Z_0$?`; right = `$${o.Z0}\\ \\Omega$`;
        w = [[`$${P(o.L / o.C)}\\ \\Omega$`, md`That is $L/C$ without the square root. ${how}`], [`$${P(1 / o.Z0)}\\ \\Omega$`, md`Upside down: that is $\sqrt{C/L} = 1/Z_0$. ${how}`],
          [`$${P(o.v)}\\ \\Omega$`, md`That is $1/\sqrt{LC}$, the speed (in m/s): the product formula. $Z_0$ uses the **ratio**, $\sqrt{L/C}$. ${how}`]];
      } else if (ask === 'v') {
        how = md`$LC = ${P(o.L * o.C)}\ \text{s}^2/\text{m}^2$, so $v = 1/\sqrt{LC} = ${ms(o.v)}$.`;
        q = md`${givenLC} What is the speed $v$ on the line?`; right = `$${ms(o.v)}$`;
        w = [[`$${P(1 / o.v)}\\ \\text{m/s}$`, md`That is $\sqrt{LC} = 1/v$ (in s/m): the reciprocal was not taken. ${how}`], [`$${P(1 / (o.L * o.C))}\\ \\text{m/s}$`, md`That is $1/(LC)$ without the square root. ${how}`],
          o.v !== 3e8 ? [`$${ms(3e8)}$`, md`That is the speed in air. A line filled with a dielectric is slower: use $1/\sqrt{LC}$. ${how}`] : null,
          [`$${o.Z0}\\ \\text{m/s}$`, md`That is $\sqrt{L/C} = Z_0$ (in ohms): the ratio formula. The speed uses the **product**, $1/\sqrt{LC}$. ${how}`]];
      } else if (ask === 'L') {
        how = md`$Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$ multiply to $Z_0 v = 1/C$ and divide to $Z_0/v = L$: $L = ${o.Z0}/(${P(o.v)}) = ${nH(o.L)}$.`;
        q = md`${givenZv} What is $L$ per metre?`; right = `$${nH(o.L)}$`;
        w = [[`$${nH(1 / (o.Z0 * o.v))}$`, md`That is $1/(Z_0v)$, which is $C$, not $L$. ${how}`], [`$${nH(o.L / 10)}$`, md`A power of 10 slipped: $Z_0/v = ${o.Z0}/(${P(o.v)})$. ${how}`],
          o.v !== 3e8 ? [`$${nH(o.Z0 / 3e8)}$`, md`That used $c = 3\times10^8$ m/s for the speed. This line's speed is $v = ${ms(o.v)}$. ${how}`] : null];
      } else {
        how = md`$Z_0 v = \sqrt{L/C}/\sqrt{LC} = 1/C$, so $C = 1/(Z_0v) = 1/(${o.Z0}\times${P(o.v)}) = ${pF(o.C)}$.`;
        q = md`${givenZv} What is $C$ per metre?`; right = `$${pF(o.C)}$`;
        w = [[`$${pF(o.L)}$`, md`That is $Z_0/v$, which is $L$, not $C$. ${how}`], [`$${pF(o.C * 10)}$`, md`A power of 10 slipped: $1/(${o.Z0}\times${P(o.v)})$. ${how}`],
          o.v !== 3e8 ? [`$${pF(1 / (o.Z0 * 3e8))}$`, md`That used $c = 3\times10^8$ m/s for the speed. This line's speed is $v = ${ms(o.v)}$. ${how}`] : null];
      }
      return { q, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 12. tau_g, Gamma_g, Gamma_L
  const RSET = { 50: [0, 25, 50, 100, 150, 200], 100: [0, 50, 100, 200, 300] };
  deck({
    id: 'g3_launch', title: 'τ_g, Γ_g, Γ_L and the first wave', chip: 'τg, Γg, ΓL',
    sub: 'The injection coefficient, the two end reflection coefficients and the first launched voltage',
    rule: md`At $t = 0$ the line looks like a resistor $Z_0$ (no wave has come back yet), so the first wave is a **voltage divider**: $V^+ = \tau_gV_g$ with $\tau_g = \dfrac{Z_0}{R_g + Z_0}$ (the injection coefficient). Each end reflects with $\Gamma = \dfrac{R - Z_0}{R + Z_0}$: $\Gamma_L$ with $R_L$, $\Gamma_g$ with $R_g$. Open: $+1$. Short: $-1$. Matched: 0. Bigger than $Z_0$: positive.`,
    make() {
      const Z0 = pick([50, 50, 100]), Rg = pick(RSET[Z0]), RL = pick(RSET[Z0].concat([Infinity])), Vg = pick([12, 24, 30, 60, 90]);
      const tg = Z0 / (Rg + Z0), Gg = (Rg - Z0) / (Rg + Z0), GL = RL === Infinity ? 1 : (RL - Z0) / (RL + Z0);
      const ask = pick(['tg', 'Gg', 'GL', 'V1']);
      const vals = md`$R_g = ${rT(Rg)}$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${rT(RL)}$`;
      let q, right, w, how;
      if (ask === 'tg') {
        how = md`$\tau_g = \dfrac{Z_0}{R_g + Z_0} = \dfrac{${Z0}}{${Rg} + ${Z0}} = ${F(tg)}$: the line is a resistor $Z_0$ until a reflection comes back.`;
        q = md`${vals}. What is the injection coefficient $\tau_g$?`; right = `$${F(tg)}$`;
        w = [[`$${F(Rg / (Rg + Z0))}$`, md`The divider is upside down: that is the share across $R_g$. ${how}`], [`$${F(1 + Gg)}$`, md`That is $1 + \Gamma_g$. "$\tau = 1 + \Gamma$" is the transmission coefficient at a junction, not the generator's divider. ${how}`], RL !== Infinity ? [`$${F(Z0 / (RL + Z0))}$`, md`That used $R_L$. The load plays no part until the first wave reaches it. ${how}`] : [`$1$`, md`Only an ideal source ($R_g = 0$) launches all of $V_g$. ${how}`],
          [`$${F(Gg)}$`, md`That is $\Gamma_g$, the reflection coefficient at the generator, not the injection coefficient. ${how}`],
          RL !== Infinity ? [`$${F(Z0 / (Rg + Z0 + RL))}$`, md`That puts $R_L$ in the divider too. At $t = 0^+$ the load is hidden: the line looks like $Z_0$ alone. ${how}`] : null];
      } else if (ask === 'Gg') {
        how = md`$\Gamma_g = \dfrac{R_g - Z_0}{R_g + Z_0} = \dfrac{${Rg} - ${Z0}}{${Rg} + ${Z0}} = ${F(Gg)}$.`;
        q = md`${vals}. What is $\Gamma_g$, the reflection coefficient at the generator end?`; right = `$${F(Gg)}$`;
        w = [[`$${F(-Gg)}$`, md`Sign flipped: that is $(Z_0 - R_g)/(R_g + Z_0)$. ${how}`], [`$${F(GL)}$`, md`That is $\Gamma_L$, the load end. ${how}`], [`$${F(tg)}$`, md`That is $\tau_g$, the injection coefficient. ${how}`],
          [`$${F(1 + Gg)}$`, md`That is $1 + \Gamma_g$, a transmission-style coefficient, not $\Gamma_g$. ${how}`],
          [`$${F(Rg / (Rg + Z0))}$`, md`That is the share of $V_g$ across $R_g$, a divider, not a reflection coefficient. ${how}`]];
      } else if (ask === 'GL') {
        how = RL === Infinity ? md`An open end: $\Gamma_L = +1$ (the current must be 0, so the reflected current cancels the incident one and the voltage doubles).` : md`$\Gamma_L = \dfrac{R_L - Z_0}{R_L + Z_0} = \dfrac{${RL} - ${Z0}}{${RL} + ${Z0}} = ${F(GL)}$.`;
        q = md`${vals}. What is $\Gamma_L$?`; right = `$${F(GL)}$`;
        w = [[`$${F(-GL)}$`, md`Sign flipped. ${RL === Infinity ? '$-1$ is a short.' : 'That is $(Z_0 - R_L)/(R_L + Z_0)$.'} ${how}`], [`$${F(Gg)}$`, md`That is $\Gamma_g$, the generator end. ${how}`], [`$${F(1 + GL)}$`, md`That is $1 + \Gamma_L$, the load voltage per unit incident voltage, not $\Gamma_L$. ${how}`],
          [`$0$`, md`0 is a matched load, $R_L = Z_0$. ${how}`]];
      } else {
        how = md`$V^+ = \tau_gV_g = \dfrac{Z_0}{R_g + Z_0}V_g = \dfrac{${Z0}}{${Rg + Z0}}\times${Vg} = ${F(tg * Vg)}$ V.`;
        q = md`$V_g = ${Vg}$ V steps on at $t = 0$; ${vals}. What voltage wave $V^+$ is launched first?`; right = `$${F(tg * Vg)}\\ \\text{V}$`;
        // a steady state exists unless both ends reflect totally (an ideal source with a short or an open at the far end)
        const hasSS = !(Rg === 0 && (RL === 0 || RL === Infinity));
        w = [hasSS ? [`$${F(RL === Infinity ? Vg : (Vg * RL) / (Rg + RL))}\\ \\text{V}$`, md`That is the steady state, reached only after many bounces. At $t = 0^+$ the line looks like $Z_0$. ${how}`] : null, [`$${Vg}\\ \\text{V}$`, md`That ignores the drop across $R_g$. ${how}`], [`$${F((Vg * Rg) / (Rg + Z0))}\\ \\text{V}$`, md`That is the drop across $R_g$: the divider is upside down. ${how}`],
          RL !== Infinity && RL > 0 ? [`$${F((Vg * Z0) / (RL + Z0))}\\ \\text{V}$`, md`That used $R_L$ in place of $R_g$. The load plays no part until the first wave reaches it. ${how}`] : null,
          [`$${F(Vg / 2)}\\ \\text{V}$`, md`Half of $V_g$ is launched only when $R_g = Z_0$. ${how}`]];
      }
      return { figHtml: circuitFig({ Rg, Z0, RL }), q, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 13. steady state
  const mA = (x) => (x === 0 ? '0' : Math.abs(x) < 1 ? `${P(x * 1000)}\\ \\text{mA}` : `${P(x)}\\ \\text{A}`);
  const VV = (x) => `${P(x)}\\ \\text{V}`;
  deck({
    id: 'g3_ss', title: 'Steady state on a line', chip: 'Steady state',
    sub: 'The final voltage and current after the bounces die out: the line disappears',
    rule: md`After the bounces die out, a lossless line is just two wires: **forget $Z_0$** and solve the DC circuit. $V_\infty = V_g\dfrac{R_L}{R_g + R_L}$ and $I_\infty = \dfrac{V_g}{R_g + R_L}$, the same everywhere on the line. Open load: $V_\infty = V_g$, $I_\infty = 0$. Shorted load: $V_\infty = 0$, $I_\infty = V_g/R_g$. The first wave $\tau_gV_g$ is where it starts, not where it ends.`,
    make() {
      const Z0 = pick([50, 75, 100]), Rg = pick([25, 50, 100]), RL = pick([0, 25, 50, 100, 150, 200, Infinity]);
      // a source voltage that makes the steady current a whole number of mA and, when possible, the first wave and the
      // steady voltage multiples of 0.5 V (so the distractors are clean numbers too)
      const half = (x) => Number.isInteger(+(x * 2).toFixed(9));
      const cands = [12, 14, 15, 20, 21, 24, 28, 30, 35, 36, 42, 45, 60, 70, 75, 90].filter((v) => RL === Infinity || Number.isInteger(+((v * 1000) / (Rg + RL)).toFixed(9)));
      const nice = cands.filter((v) => half((v * Z0) / (Rg + Z0)) && (RL === Infinity || half((v * RL) / (Rg + RL))));
      const Vg = pick(nice.length ? nice : cands);
      const askI = RL === 0 ? true : RL === Infinity ? Math.random() < 0.4 : Math.random() < 0.4;
      const V = RL === Infinity ? Vg : (Vg * RL) / (Rg + RL), I = RL === Infinity ? 0 : Vg / (Rg + RL);
      const tg = Z0 / (Rg + Z0);
      const vals = md`$V_g = ${Vg}$ V (a step), $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${rT(RL)}$`;
      const how = RL === Infinity ? md`The line is two open wires at DC: no current, so no drop across $R_g$: $V_\infty = V_g = ${Vg}$ V and $I_\infty = 0$.` : md`DC circuit, $Z_0$ gone: $I_\infty = \dfrac{${Vg}}{${Rg} + ${RL}} = ${mA(I)}$ and $V_\infty = I_\infty R_L = ${VV(V)}$.${RL === Z0 ? ' Here $R_L = Z_0$: the load is matched, nothing reflects, and the first wave is already the final value.' : ''}`;
      let q, right, w;
      if (!askI) {
        q = md`${vals}. What is the load voltage once the bounces have died out?`; right = `$${VV(V)}$`;
        w = [[`$${VV(tg * Vg)}$`, md`That is the first wave, $\tau_gV_g$. It is where the voltage starts, not where it settles. ${how}`],
          RL === Infinity ? [`$${VV(2 * tg * Vg)}$`, md`That is the first wave plus its reflection from the open, the value after one round trip. Reflections from the generator keep adding until it reaches $V_g$. ${how}`] : [`$${VV((Vg * RL) / (Z0 + RL))}$`, md`That used $Z_0$ in place of $R_g$. In steady state the line is just wires: $Z_0$ drops out. ${how}`],
          [`$${VV(Vg)}$`, md`That ignores the drop across $R_g$${RL === Infinity ? '' : ', which carries the steady current'}. ${how}`],
          RL === Infinity ? [`$${VV(0)}$`, md`0 is the voltage across a short. An open end ends up at the full $V_g$. ${how}`] : [`$${VV((Vg * Rg) / (Rg + RL))}$`, md`That is the drop across $R_g$: the divider is upside down. ${how}`],
          RL === Infinity ? null : [`$${VV(I * Z0)}$`, md`That is $I_\infty Z_0$. In steady state there is no single traveling wave, so $V = IZ_0$ does not hold: $V_\infty = I_\infty R_L$. ${how}`],
          RL === Infinity ? null : [`$${VV((Vg * RL) / (Rg + Z0 + RL))}$`, md`That puts $Z_0$ in series as a third resistor. In steady state the line is just two wires. ${how}`]];
      } else {
        q = md`${vals}. What current flows into the load once the bounces have died out?`; right = `$${mA(I)}$`;
        w = [[`$${mA(Vg / (Rg + Z0))}$`, md`That is the first wave's current, $V_g/(R_g + Z_0)$. ${how}`],
          RL === Infinity ? [`$${mA(Vg / Rg)}$`, md`That is the current into a short. No steady current flows into an open. ${how}`] : [`$${mA(Vg / (Z0 + RL))}$`, md`That used $Z_0$ in place of $R_g$. ${how}`],
          RL > 0 && RL !== Infinity ? [`$${mA(Vg / RL)}$`, md`That ignores $R_g$, which carries the same current in series. ${how}`] : RL === 0 ? [`$${mA(2 * Vg / (Rg + Z0))}$`, md`That doubles the first wave's current, the value after one round trip at a short. The bounces keep adding until the DC value. ${how}`] : null,
          RL === 0 ? [`$0$`, md`0 is the **voltage** across a short. The current through it is largest: only $R_g$ limits it. ${how}`] : null,
          RL === Infinity ? null : [`$${mA(V / Z0)}$`, md`That is $V_\infty/Z_0$. In steady state there is no single traveling wave, so $I = V/Z_0$ does not hold: $I_\infty = V_g/(R_g + R_L)$. ${how}`],
          RL === Infinity ? [`$${mA(Vg / (2 * Rg))}$`, md`That treats the open as a resistor equal to $R_g$. An open draws no current. ${how}`] : [`$${mA(Vg / (Rg + Z0 + RL))}$`, md`That puts $Z_0$ in series as a third resistor. In steady state the line is just two wires. ${how}`]];
      }
      return { figHtml: circuitFig({ Vg, Rg, Z0, RL }), q, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 14. bounce: the value after the k-th arrival
  deck({
    id: 'g3_bounce', title: 'Bounce diagram: V or I at a point', chip: 'Bounce V(z,t)', clean: cleanOpts,
    sub: 'Count the waves that have passed a point and add them',
    rule: md`On the bounce diagram, draw the vertical line at your $z$ and the horizontal line at your $t$. **Every wave that crosses the vertical line above your $t$ has arrived; add them all.** The waves are $V^+$, then $\Gamma_LV^+$, then $\Gamma_g\Gamma_LV^+$, then $\Gamma_L\Gamma_g\Gamma_LV^+$, ... At an end, the incident and reflected waves arrive together. For **current**, a forward wave carries $+V/Z_0$ and a backward wave carries $-V/Z_0$.`,
    make() {
      const Z0 = 50, Rg = pick([25, 25, 150, 0]), RL = pick([150, 25, Infinity, 0, 100]);
      const qI = Math.random() < 0.25, V1 = qI ? pick([50, 100, 150]) : pick([12, 36, 36, 72]);
      const tg = Z0 / (Rg + Z0), Vg = V1 / tg;
      const s = TL.solve({ Vg, Rg, RL, sections: [{ Z0, len: 200, v: 200 }], tMax: 12 });
      const z0 = pick([0, 50, 100, 150, 200, 100]);
      const arr = TL.arrivals(s, z0);
      const times = []; arr.forEach((a) => { if (!times.some((t) => Math.abs(t - a.t) < 1e-9)) times.push(a.t); });
      const kmax = Math.min(3, times.length), kk = pick((z0 === 200 ? [1, 2, 2, 3] : [2, 2, 3, 3]).filter((x) => x <= kmax)) || 1;
      const t0 = kk < times.length ? (times[kk - 1] + times[kk]) / 2 : times[kk - 1] + 0.5;
      const val = (a) => (qI ? a.i : a.v);
      const sumUp = (n) => arr.filter((a) => a.t <= times[n - 1] + 1e-9).reduce((x, a) => x + val(a), 0);
      const right = sumUp(kk);
      const unit = qI ? '\\ \\text{A}' : '\\ \\text{V}', fmt = (x) => `$${F(x)}${unit}$`;
      const passed = arr.filter((a) => a.t <= t0);
      const list = passed.map((a) => `${F(val(a))}`).join(' + ').replace(/\+ -/g, '- ');
      const how = md`$\Gamma_g = ${F(s.GammaG)}$, $\Gamma_L = ${F(s.GammaL)}$. The waves that have passed $z = ${z0}$ m by $t = ${P(t0)}\ \mu\text{s}$ (dots on the dashed line above that time)${qI ? ', as currents $\\pm V/Z_0$' : ''}: $${list} = ${F(right)}${unit}$.`;
      const w = [];
      if (kk < times.length) w.push([fmt(sumUp(kk + 1)), md`That includes the wave that reaches $z = ${z0}$ m at $t = ${P(times[kk])}\ \mu\text{s}$, after the time asked. ${how}`]);
      if (kk > 1) w.push([fmt(sumUp(kk - 1)), md`That leaves out the wave that passed at $t = ${P(times[kk - 1])}\ \mu\text{s}$. ${how}`]);
      const last = arr.filter((a) => Math.abs(a.t - times[kk - 1]) < 1e-9).reduce((x, a) => x + val(a), 0);
      const group = arr.filter((a) => Math.abs(a.t - times[kk - 1]) < 1e-9);
      if (kk > 1 || group.length > 1) w.push([fmt(last), md`That is only the newest ${group.length > 1 ? 'pair of waves' : 'wave'}. The value at a point is the sum of every wave that has passed it. ${how}`]);
      if (group.length > 1) w.push([fmt(right - val(group[1])), md`That leaves out the reflected wave: at an end, the incident and the reflected wave arrive at the same instant, so both count. ${how}`]);
      // with a short or an open at both ends (|Gamma_g Gamma_L| = 1) the bounces never die out: no steady state
      if (Math.abs(s.GammaG * s.GammaL) < 1 - 1e-9) w.push([fmt(qI ? s.dc.I : s.dc.V), md`That is the steady state, reached only after many bounces. ${how}`]);
      if (qI) w.push([fmt(passed.reduce((x, a) => x + Math.abs(a.v) / Z0 * Math.sign(a.v), 0)), md`That gave every wave the current $+V/Z_0$. A backward wave carries $-V/Z_0$. ${how}`]);
      else if (kk > 1) w.push([fmt(passed.reduce((x, a) => x + Math.abs(a.v), 0)), md`That added the sizes and ignored the signs of the reflection coefficients. ${how}`]);
      const fig = TL.diagram(s, { tMax: Math.max(3, Math.ceil(t0 + 0.6)), probe: z0, amps: false, w: 300, h: 240, alt: 'Bounce diagram: position across, time down; the dashed line marks the probe position, the dots the arrivals there.' });
      const q = md`A step launches $V^+ = ${V1}$ V on a ${Z0}-$\Omega$ line, 200 m long, $v = 2\times10^8$ m/s (one-way time $1\ \mu\text{s}$), with $\Gamma_g = ${F(s.GammaG)}$ and $\Gamma_L = ${F(s.GammaL)}$. What is ${qI ? '$I$' : '$V$'} at $z = ${z0}$ m, $t = ${P(t0)}\ \mu\text{s}$?`;
      return { figHtml: fig, q, ...mc(fmt(right), w), rule: how };
    },
  });

  // ================================================================ 15. the next bounce: when it arrives and what it adds
  // [length in m, v in m/s, one-way time in us]
  const LINE = [[300, 3e8, 1], [200, 2e8, 1], [300, 1.5e8, 2], [400, 2e8, 2], [600, 2e8, 3]];
  const usT = (x) => `$${P(x)}\\ \\mu\\text{s}$`;
  // generator, line and load with the two reflection coefficients; o.zf marks a point (fraction of the length)
  function lineFig(o) {
    const g = PF.fig({ alt: `A generator on the left drives a line that ends in a load on the right${o.zf !== undefined ? '; a dashed line marks the point z' : ''}.` });
    const y0 = 24, y1 = 76, xs = 22, xa = 60, xb = 250;
    g.circle(xs, 50, 13);
    g.label(xs, 43, '+', 'c', 'small'); g.label(xs, 57, '-', 'c', 'small');
    g.line(xs, 37, xs, y0); g.line(xs, 63, xs, y1); g.line(xs, y0, xa, y0); g.line(xs, y1, xa, y1);
    g.dot(xa, y0); g.dot(xa, y1); g.dot(xb, y0); g.dot(xb, y1);
    rails(g, xa, xb, y0, y1);
    g.line(xb, y0, xb + 24, y0); zig(g, xb + 24, y0, xb + 24, y1); g.line(xb + 24, y1, xb, y1);
    g.label(xa - 10, y0 - 8, `\\Gamma_g = ${F(o.Gg)}`, 'b', 'small');
    g.label(xb + 14, y0 - 8, `\\Gamma_L = ${F(o.GL)}`, 'b', 'small');
    if (o.zf !== undefined) {
      const xz = xa + (xb - xa) * o.zf;
      g.line(xz, y0 - 6, xz, y1 + 6, { cls: 'dim dash' });
      g.label(xz, y1 + 8, o.zLab, 't', 'small');
    }
    if (o.lenLab) g.dim(xa, y1 + 36, xb, y1 + 36, o.lenLab, { at: 'b' });
    return g.svg();
  }
  deck({
    id: 'g3_next', title: 'The next bounce: when and how big', chip: 'Next bounce',
    sub: 'When the next wave passes a point or reaches an end, and how much it adds',
    rule: md`Let $T = \ell/v$ (one way) and $t_z = z/v$. Follow the waves past your point: the first passes at $t_z$, the load's reflection on its way back at $2T - t_z$, the generator's reflection of that at $2T + t_z$, then $4T - t_z$, $4T + t_z$, ... The load changes at $T, 3T, 5T$; the generator end at $0, 2T, 4T$. **Each new wave is the last one times the $\Gamma$ of the end it just hit**: $V^+$, then $\Gamma_LV^+$, then $\Gamma_g\Gamma_LV^+$. At an end, the arriving wave and its reflection appear at the same instant, so the voltage there jumps by $(1 + \Gamma)$ times the arriving wave.`,
    make() {
      const [Lm, v, T] = pick(LINE), kind = pick(['when', 'when', 'end', 'size', 'jump']);
      const GS = [0.5, -0.5, 1 / 3, -1 / 3];
      const Gg = pick(GS), GL = pick(kind === 'size' ? GS : GS.concat([1]));
      const lineT = md`$\ell = ${Lm}\ \text{m}$, $v = ${P(v)}\ \text{m/s}$`;
      const coefT = md`$\Gamma_g = ${F(Gg)}$, $\Gamma_L = ${F(GL)}$`;
      let q, right, w, how, fig;
      if (kind === 'when') {
        const zf = pick(T === 3 ? [1 / 3, 2 / 3, 0.5] : [0.25, 0.5, 0.75]), z = Lm * zf, tz = T * zf, k = pick([2, 3]);
        right = k === 2 ? 2 * T - tz : 2 * T + tz;
        how = md`$T = \ell/v = ${P(T)}\ \mu\text{s}$ and $t_z = z/v = ${P(tz)}\ \mu\text{s}$. Waves pass $z$ at $t_z$, $2T - t_z$, $2T + t_z$, $4T - t_z$, ...: number ${k} is at $${k === 2 ? '2T - t_z' : '2T + t_z'} = ${P(right)}\ \mu\text{s}$.`;
        q = md`At $t = 0$ a step starts a wave at the generator end, $z = 0$. The line has ${lineT}; ${coefT}. When does the **${k === 2 ? 'second' : 'third'}** wave arrive at $z = ${z}\ \text{m}$?`;
        w = k === 2 ? [[usT(T + tz), md`That added the distance. After the load ($t = T$) the reflection travels **back** to $z$, a distance $\ell - z$, which takes $T - t_z$, not $t_z$. ${how}`],
          [usT(T), md`That is when the first wave reaches the load ($z = \ell$), not $z$. ${how}`],
          [usT(2 * T), md`That is when the reflection is back at the generator ($z = 0$); it passed $z$ before that. ${how}`],
          [usT(2 * T + tz), md`That is the third wave: the generator's reflection on its way out again. The second wave is the load's reflection on its way back. ${how}`],
          [usT(T - tz), md`That is only the trip back from the load to $z$, $(\ell - z)/v$. The reflection starts at the load at $t = T$. ${how}`]]
          : [[usT(2 * T - tz), md`That is the second wave, the load's reflection on its way back. ${how}`],
            [usT(4 * T - tz), md`That is the fourth wave: the third wave's reflection from the load, on its way back. ${how}`],
            [usT(2 * T), md`That is when the third wave leaves the generator; it still has to travel to $z$, which takes $t_z$. ${how}`],
            [usT(T + tz), md`That counts a round trip as $T$. The load's reflection is back at the generator at $2T$, and the third wave starts there. ${how}`]];
        right = usT(right);
        fig = lineFig({ Gg, GL, zf, zLab: `z = ${z}\\,\\text{m}`, lenLab: `\\ell = ${Lm}\\,\\text{m}` });
      } else if (kind === 'end') {
        const atLoad = Math.random() < 0.6;
        if (atLoad) {
          how = md`$T = \ell/v = ${P(T)}\ \mu\text{s}$. A wave reaches the load at $T$, its reflection is back at the generator at $2T$, and the generator's reflection reaches the load at $3T$: the load changes at $T, 3T, 5T$, ... The second change is at $3T = ${P(3 * T)}\ \mu\text{s}$.`;
          q = md`A step starts a wave at the generator at $t = 0$. The line has ${lineT}; ${coefT}. When does the voltage at the **load** change for the second time?`;
          right = usT(3 * T);
          w = [[usT(2 * T), md`That is when the load's reflection reaches the generator. The generator's reflection then needs another $T$ to reach the load. ${how}`],
            [usT(T), md`That is the first change, when the first wave arrives. ${how}`],
            [usT(5 * T), md`That is the third change. ${how}`],
            [usT(4 * T), md`That is when the generator end changes for the third time. The load changes only at odd multiples of $T$. ${how}`]];
        } else {
          how = md`$T = \ell/v = ${P(T)}\ \mu\text{s}$. The generator end changes when a reflection gets back to it: at $0$ (the step), $2T$, $4T$, ... The second change is at $2T = ${P(2 * T)}\ \mu\text{s}$.`;
          q = md`A step starts a wave at the generator at $t = 0$ (the first change of the voltage there). The line has ${lineT}; ${coefT}. When does the voltage at the **generator end** ($z = 0$) change for the second time?`;
          right = usT(2 * T);
          w = [[usT(T), md`That is when the first wave reaches the load. Its reflection needs another $T$ to come back. ${how}`],
            [usT(3 * T), md`That is the load's second change. ${how}`],
            [usT(4 * T), md`That is the generator end's third change. ${how}`]];
        }
        fig = lineFig({ Gg, GL, lenLab: `\\ell = ${Lm}\\,\\text{m}` });
      } else if (kind === 'size') {
        const V1 = pick([36, 72]), r = Gg * GL * V1;
        how = md`Each new wave is the last one times the $\Gamma$ of the end it just hit. The second wave, $\Gamma_LV^+ = ${F(GL * V1)}$ V, travels to the generator, so the third is $\Gamma_g\Gamma_LV^+ = ${F(Gg)}\times(${F(GL * V1)}) = ${F(r)}$ V.`;
        q = md`A step launches $V^+ = ${V1}\ \text{V}$ on a line with ${coefT}. The first two waves to pass a point $z$ inside the line add $${V1}$ V and $${F(GL * V1)}$ V. What does the **third** wave add at $z$?`;
        right = `$${F(r)}\\ \\text{V}$`;
        w = [[`$${F(GL * GL * V1)}\\ \\text{V}$`, md`That reflected off the load again. The second wave travels toward the generator, so it reflects there next: multiply by $\Gamma_g$. ${how}`],
          [`$${F(Gg * V1)}\\ \\text{V}$`, md`That skips the load: the third wave is the generator's reflection of the **second** wave, $\Gamma_g(\Gamma_LV^+)$. ${how}`],
          [`$${F(V1 + GL * V1 + r)}\\ \\text{V}$`, md`That is the total voltage at $z$ after the third wave passes, not what it adds. ${how}`],
          [`$${F((1 + Gg) * GL * V1)}\\ \\text{V}$`, md`That multiplied by $1 + \Gamma_g$, the jump of the voltage **at the generator end**. The wave sent back into the line is $\Gamma_g$ times the arriving wave. ${how}`]];
        fig = lineFig({ Gg, GL, zf: 0.5, zLab: 'z' });
      } else {
        const V1 = pick([36, 72]), A = Gg * GL * V1, r = (1 + GL) * A;
        how = md`At an end the arriving wave and its reflection appear together: the jump is $(1 + \Gamma_L)\times(${F(A)}) = ${F(r)}$ V.`;
        q = md`A step launches $V^+ = ${V1}\ \text{V}$ on a line with ${coefT}. At $t = 3T$ ($T$ is the one-way time) the wave $\Gamma_g\Gamma_LV^+ = ${F(A)}\ \text{V}$ reaches the load. By how much does the load voltage jump at that instant?`;
        right = `$${F(r)}\\ \\text{V}$`;
        w = [[`$${F(A)}\\ \\text{V}$`, md`That leaves out the reflected wave. At the load the arriving wave and its reflection, $\Gamma_L\times(${F(A)})$ V, appear at the same instant. ${how}`],
          [`$${F(GL * A)}\\ \\text{V}$`, md`That is only the reflected wave. The arriving wave is there too. ${how}`],
          [`$${F((1 - GL) * A)}\\ \\text{V}$`, md`$1 - \Gamma_L$ is the factor for the **current** (a backward wave carries $-V/Z_0$). The voltage jumps by $(1 + \Gamma_L)$ times the arriving wave. ${how}`],
          [`$${F((1 + GL) * V1 + r)}\\ \\text{V}$`, md`That is the load voltage after the jump, not the jump. ${how}`]];
        fig = lineFig({ Gg, GL });
      }
      return { figHtml: fig, q, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 16. junctions
  const PAR = [[100, 100], [150, 300], [300, 150], [75, 150], [100, 300], [200, 200], [300, 300], [150, 150]];
  deck({
    id: 'g3_junction', title: 'Junction: Γ₁₂ and τ₁₂', chip: 'Junctions',
    sub: 'Reflection and transmission where one line meets another, a resistor or two lines',
    rule: md`A wave on line 1 sees whatever is on the other side of the junction as a resistor: line 2's $Z_2$, **in parallel with** anything else hanging on the junction. $\Gamma_{12} = \dfrac{Z_{\text{after}} - Z_1}{Z_{\text{after}} + Z_1}$ and $\tau_{12} = 1 + \Gamma_{12} = \dfrac{2Z_{\text{after}}}{Z_{\text{after}} + Z_1}$ (the junction voltage is shared). A wave coming back from line 2 uses the same formula with the roles swapped, so $\Gamma_{21} = -\Gamma_{12}$ for two plain lines. $\tau$ can exceed 1; that is not a power gain.`,
    make() {
      const kind = pick(['plain', 'plain', 'R', 'Z3']);
      const Zs = [50, 75, 100, 150, 200, 300];
      let Z1, Z2, Zeff, extra = {}, desc;
      if (kind === 'plain') { Z1 = pick(Zs); Z2 = pick(Zs.filter((x) => x !== Z1)); Zeff = Z2; desc = ''; }
      else {
        const [a, b] = pick(PAR); Z2 = a; Zeff = (a * b) / (a + b); Z1 = pick(Zs.filter((x) => x !== Zeff && x !== Z2));
        if (kind === 'R') { extra = { R: b }; desc = md` A resistor $R = ${b}\ \Omega$ is connected across the junction.`; }
        else { extra = { Z3: b }; desc = md` At the junction line 1 feeds **two** lines, $Z_2 = ${a}\ \Omega$ and $Z_3 = ${b}\ \Omega$ (both matched far away).`; }
      }
      const back = kind === 'plain' && Math.random() < 0.35;
      const [Za, Zb] = back ? [Z2, Z1] : [Z1, Zeff];    // from Za into Zb
      const G = (Zb - Za) / (Zb + Za), T = 1 + G;
      const askT = Math.random() < 0.45;
      const nm = back ? ['21', 'line 2', 'line 1'] : ['12', 'line 1', 'the junction'];
      const after = kind === 'plain' ? '' : md`The wave sees $${kind === 'R' ? `${Z2}\\parallel${extra.R}` : `${Z2}\\parallel${extra.Z3}`} = ${F(Zeff)}\ \Omega$.`;
      const how = md`${after}${after ? ' ' : ''}$\Gamma_{${nm[0]}} =\dfrac{${F(Zb)} - ${F(Za)}}{${F(Zb)} + ${F(Za)}} = ${F(G)}$${askT ? `, $\\tau_{${nm[0]}} = 1 + \\Gamma_{${nm[0]}} = ${F(T)}$` : ''}.`;
      const q = md`Line 1 ($Z_1 = ${Z1}\ \Omega$) meets line 2 ($Z_2 = ${Z2}\ \Omega$).${desc} A wave on ${nm[1]} hits the junction. What is ${askT ? `$\\tau_{${nm[0]}}$, the transmitted over the incident voltage` : `$\\Gamma_{${nm[0]}}$`}?`;
      const plainG = (Z2 - Za) / (Z2 + Za);
      let right, w;
      if (!askT) {
        right = `$${F(G)}$`;
        w = [[`$${F(-G)}$`, md`Sign flipped: that is the $\Gamma$ for a wave coming from the other side. ${how}`], [`$${F(T)}$`, md`That is $\tau = 1 + \Gamma$. ${how}`],
          kind !== 'plain' ? [`$${F(plainG)}$`, md`That ignores the ${kind === 'R' ? 'resistor' : 'second line'} in parallel with line 2. ${how}`] : [`$${F(Za / (Za + Zb))}$`, md`That is a voltage divider, not a reflection coefficient. ${how}`]];
      } else {
        right = `$${F(T)}$`;
        w = [[`$${F(1 - G)}$`, md`$\tau = 1 + \Gamma$, not $1 - \Gamma$ (the voltage on both sides of the junction is the same: $V^+ + V^- = V_t$). ${how}`], [`$${F(Zb / (Zb + Za))}$`, md`The factor 2 is missing: $\tau = 2Z_{\text{after}}/(Z_{\text{after}} + Z_{\text{before}})$. ${how}`], [`$${F(G)}$`, md`That is $\Gamma$, not $\tau$. ${how}`],
          kind !== 'plain' ? [`$${F(1 + plainG)}$`, md`That ignores the ${kind === 'R' ? 'resistor' : 'second line'} in parallel with line 2. ${how}`] : [`$${F(1 - G)}$`, md`That is $\tau$ for a wave going the other way. ${how}`]];
      }
      return { figHtml: junctionFig(Z1, Z2, extra), q, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 17. stubs
  const STUB = (Z0) => ['$0$ (a short)', '$\\infty$ (an open)', `$+j${Z0}\\ \\Omega$ (inductive)`, `$-j${Z0}\\ \\Omega$ (capacitive)`];
  // index into STUB for a short (sh) or an open of electrical length n * 45 degrees
  const stubIdx = (sh, n) => { const m = ((n % 4) + 4) % 4; return sh ? [0, 2, 1, 3][m] : [1, 3, 0, 2][m]; };
  const WHO = ['a short at length 0 or $\\lambda/2$, or an open at $\\lambda/4$', 'a short at $\\lambda/4$, or an open at 0 or $\\lambda/2$', 'a short at $\\lambda/8$, or an open at $3\\lambda/8$', 'a short at $3\\lambda/8$, or an open at $\\lambda/8$'];
  deck({
    id: 'g3_stub', title: 'Shorted and open stubs', chip: 'Stubs',
    sub: 'Input impedance of a shorted or open stub at λ/8, λ/4, 3λ/8, λ/2',
    rule: md`Short: $Z_{in} = jZ_0\tan\beta\ell$. Open: $Z_{in} = -jZ_0\cot\beta\ell$. With $\beta\ell = 2\pi\ell/\lambda$: **every $\lambda/4$ swaps short and open; every $\lambda/2$ repeats.** In between, a short starts **inductive** ($+j$) and an open starts **capacitive** ($-j$); at the $\lambda/8$ points $|Z_{in}| = Z_0$. Table: short at $\lambda/8, \lambda/4, 3\lambda/8, \lambda/2$: $+jZ_0, \infty, -jZ_0, 0$. Open: $-jZ_0, 0, +jZ_0, \infty$.`,
    make() {
      const Z0 = pick([50, 75, 100]), sh = Math.random() < 0.5, n = pick([1, 2, 3, 4, 1, 3, 5, 6]);
      const lenL = { 1: '\\lambda/8', 2: '\\lambda/4', 3: '3\\lambda/8', 4: '\\lambda/2', 5: '5\\lambda/8', 6: '3\\lambda/4' }[n];
      let lenTxt = md`$\ell = ${lenL}$`, figLen = `\\ell = ${lenL}`;
      if (n <= 4 && Math.random() < 0.4) {
        const [lam, fT] = pick([[1, '300\\ \\text{MHz}'], [2, '150\\ \\text{MHz}'], [0.5, '600\\ \\text{MHz}']]);
        const cm = (lam * n * 100) / 8;
        lenTxt = md`$\ell = ${P(cm)}$ cm, air-filled, at $f = ${fT}$`; figLen = `\\ell = ${P(cm)}\\ \\text{cm}`;
      }
      const r = stubIdx(sh, n), O = STUB(Z0), deg = n * 45;
      const how = md`$\ell = ${lenL}$, so $\beta\ell = ${deg}^\circ$. ${sh ? `Short: $jZ_0\\tan ${deg}^\\circ$` : `Open: $-jZ_0\\cot ${deg}^\\circ$`} $=$ ${O[r]}.${n > 4 ? ' (Subtract $\\lambda/2$ first: it changes nothing.)' : ''}`;
      const q = md`A ${Z0}-$\Omega$ line, ${lenTxt}, is ${sh ? '**shorted**' : '**open**'} at the far end. What is $Z_{in}$?`;
      return { figHtml: stubFig(sh ? 'short' : 'open', figLen, `Z_0 = ${Z0}\\,\\Omega`), q, ...fixed(O, r, (k) => md`That is what ${WHO[k]} gives. ${how}`), rule: how };
    },
  });

  // ================================================================ 18. quarter- and half-wave lines
  const QW = [];
  [50, 60, 75, 100, 150].forEach((Z0) => [25, 36, 50, 75, 100, 150, 200, 300, 450].forEach((ZL) => { const z = (Z0 * Z0) / ZL; if (ZL !== Z0 && Math.abs(z - Math.round(z)) < 1e-9 && z <= 900 && z >= 10) QW.push([Z0, ZL]); }));
  const MATCH = [[25, 100], [50, 200], [36, 100], [50, 72], [75, 300], [50, 450], [100, 400], [25, 400], [20, 80]];
  deck({
    id: 'g3_qw', title: 'Quarter-wave and half-wave lines', chip: 'λ/4 and λ/2',
    sub: 'Input impedance of a λ/4 or λ/2 line, and the quarter-wave matching Z₀',
    rule: md`**Half wave ($\lambda/2$, or any multiple): $Z_{in} = Z_L$**, whatever $Z_0$ is. **Quarter wave ($\lambda/4$, $3\lambda/4$, ...): $Z_{in} = Z_0^2/Z_L$**: it inverts the load around $Z_0$ (big becomes small, short becomes open). To match $R_L$ to $R_{in}$ with a quarter wave: $Z_0 = \sqrt{R_{in}R_L}$, the **geometric** mean.`,
    make() {
      const kind = pick(['q', 'q', 'h', 'm', 'q3']);
      let q, right, w, how, fig;
      if (kind === 'm') {
        const [a, b] = pick(MATCH), Z = Math.sqrt(a * b), [Rin, RL] = Math.random() < 0.5 ? [a, b] : [b, a];
        how = md`$Z_0 = \sqrt{R_{in}R_L} = \sqrt{${Rin}\times${RL}} = \sqrt{${Rin * RL}} = ${F(Z)}\ \Omega$.`;
        q = md`A quarter-wave section must make a $${RL}\ \Omega$ load look like $${Rin}\ \Omega$. What $Z_0$ does it need?`; right = `$${F(Z)}\\ \\Omega$`;
        fig = stubFig('load', '\\lambda/4', 'Z_0 = ?', `R_L = ${RL}\\,\\Omega`);
        w = [[`$${F((a + b) / 2)}\\ \\Omega$`, md`That is the arithmetic mean. A quarter wave needs $Z_0^2 = R_{in}R_L$: the geometric mean. ${how}`], [`$${F((a * b) / (a + b))}\\ \\Omega$`, md`That is $R_{in}\parallel R_L$, which has nothing to do with matching. ${how}`], [`$${F(a * b)}\\ \\Omega$`, md`The square root is missing: $R_{in}R_L = ${a * b}$ is $Z_0^2$ (in $\Omega^2$), not $Z_0$. ${how}`]];
      } else {
        const [Z0, ZL] = pick(QW), qtr = kind !== 'h', zin = qtr ? (Z0 * Z0) / ZL : ZL;
        const lenL = kind === 'q3' ? '3\\lambda/4' : qtr ? '\\lambda/4' : '\\lambda/2';
        how = qtr ? md`A ${kind === 'q3' ? 'three-quarter' : 'quarter'} wave inverts: $Z_{in} = Z_0^2/Z_L = ${Z0}^2/${ZL} = ${F(zin)}\ \Omega$.` : md`A half wave repeats the load: $Z_{in} = Z_L = ${ZL}\ \Omega$, whatever $Z_0$ is.`;
        q = md`A $${Z0}\ \Omega$ line of length $${lenL}$ ends in $Z_L = ${ZL}\ \Omega$. What is $Z_{in}$?`; right = `$${F(zin)}\\ \\Omega$`;
        fig = stubFig('load', lenL, `Z_0 = ${Z0}\\,\\Omega`, `Z_L = ${ZL}\\,\\Omega`);
        w = qtr ? [[`$${ZL}\\ \\Omega$`, md`That is the half-wave rule: a $\lambda/2$ line repeats the load. ${how}`], [`$${Z0}\\ \\Omega$`, md`$Z_{in} = Z_0$ only for a matched load ($Z_L = Z_0$). ${how}`], [`$${F((ZL * ZL) / Z0)}\\ \\Omega$`, md`Upside down: $Z_L^2/Z_0$. The line's $Z_0$ is squared. ${how}`], Number.isInteger(Math.sqrt(Z0 * ZL)) ? [`$${F(Math.sqrt(Z0 * ZL))}\\ \\Omega$`, md`$\sqrt{Z_0Z_L}$ is the matching formula turned around, not the input impedance. ${how}`] : null]
          : [[`$${F((Z0 * Z0) / ZL)}\\ \\Omega$`, md`That is the quarter-wave rule. A half wave turns the impedance all the way around back to $Z_L$. ${how}`], [`$${Z0}\\ \\Omega$`, md`$Z_{in} = Z_0$ only for a matched load. ${how}`], Number.isInteger(Math.sqrt(Z0 * ZL)) ? [`$${F(Math.sqrt(Z0 * ZL))}\\ \\Omega$`, md`$\sqrt{Z_0Z_L}$ is the quarter-wave matching formula: it gives the $Z_0$ a matching section needs, not an input impedance. ${how}`] : null];
      }
      return { figHtml: fig, q, ...mc(right, w), rule: how };
    },
  });

  // ================================================================ 19. VSWR
  const VS = [[1 / 9, 1.25], [1 / 5, 1.5], [1 / 3, 2], [1 / 2, 3], [3 / 5, 4], [2 / 3, 5], [4 / 5, 9]];
  deck({
    id: 'g3_vswr', title: 'VSWR and |Γ|', chip: 'VSWR',
    sub: 'Standing-wave ratio from the reflection coefficient and back, and from a resistive load',
    rule: md`$\text{VSWR} = \dfrac{|V|_{max}}{|V|_{min}} = \dfrac{1 + |\Gamma|}{1 - |\Gamma|}$, and back: $|\Gamma| = \dfrac{\text{VSWR} - 1}{\text{VSWR} + 1}$. VSWR is always $\ge 1$; $|\Gamma|\le 1$. For a **resistive** load, $\text{VSWR} = R_L/Z_0$ or $Z_0/R_L$, whichever is $\ge 1$. Pairs to know: $|\Gamma| = \tfrac13\leftrightarrow 2$, $\tfrac12\leftrightarrow 3$, $\tfrac15\leftrightarrow 1.5$.`,
    make() {
      const [g, S] = pick(VS), kind = pick(['g2s', 's2g', 'r2s']);
      let q, right, w, how;
      if (kind === 'g2s') {
        how = md`$\text{VSWR} = \dfrac{1 + ${F(g)}}{1 - ${F(g)}} = ${F(S)}$.`;
        q = md`A line has $|\Gamma| = ${F(g)}$. What is the VSWR?`; right = `$${F(S)}$`;
        w = [[`$${F(1 / S)}$`, md`Upside down: $(1 - |\Gamma|)/(1 + |\Gamma|) < 1$. VSWR is max over min, always $\ge 1$. ${how}`], [`$${F(1 + g)}$`, md`That is $|V|_{max}/|V^+| = 1 + |\Gamma|$, the maximum alone. ${how}`], [`$${F((1 + g * g) / (1 - g * g))}$`, md`That squares $|\Gamma|$, as for power. The VSWR is a ratio of **voltages**: $(1 + |\Gamma|)/(1 - |\Gamma|)$ with $|\Gamma|$ itself. ${how}`]];
      } else if (kind === 's2g') {
        how = md`$|\Gamma| = \dfrac{${F(S)} - 1}{${F(S)} + 1} = ${F(g)}$.`;
        q = md`The VSWR on a line is $${F(S)}$. What is $|\Gamma|$?`; right = `$${F(g)}$`;
        w = [[`$${F(1 / S)}$`, md`$1/\text{VSWR}$ is $|V|_{min}/|V|_{max}$, not $|\Gamma|$. ${how}`], [`$${F(S - 1)}$`, md`The division by $\text{VSWR} + 1$ is missing. ${how}`], [`$${F((S + 1) / (S - 1))}$`, md`Upside down: $|\Gamma|$ cannot exceed 1. ${how}`]];
      } else {
        const Z0 = pick([50, 50, 75, 100]), up = Math.random() < 0.5, RL = up ? Z0 * S : Z0 / S;
        how = md`A resistive load: $\text{VSWR} = ${up ? `R_L/Z_0 = ${F(RL)}/${Z0}` : `Z_0/R_L = ${Z0}/${F(RL)}`} = ${F(S)}$ (whichever ratio is $\ge 1$). Check: $|\Gamma| = ${F(g)}$.`;
        q = md`A $${Z0}\ \Omega$ line ends in $R_L = ${F(RL)}\ \Omega$. What is the VSWR?`; right = `$${F(S)}$`;
        w = [[`$${F(1 / S)}$`, md`That ratio is upside down: VSWR is always $\ge 1$. ${how}`], [`$${F(g)}$`, md`That is $|\Gamma|$, not the VSWR. ${how}`], [`$${F(1 + g)}$`, md`That is $1 + |\Gamma|$, the voltage maximum alone. ${how}`]];
      }
      return { q, ...mc(right, w), rule: how };
    },
  });

  // exam order: waves first, then lines
  const ORDER = ['g3_dir', 'g3_hdir', 'g3_phasor', 'g3_read', 'g3_regime', 'g3_pol', 'g3_hand', 'g3_gamma', 'g3_power', 'g3_nodes', 'g3_lc', 'g3_launch', 'g3_ss', 'g3_bounce', 'g3_next', 'g3_junction', 'g3_stub', 'g3_qw', 'g3_vswr'];
  const byId = {};
  DECKS.forEach((d) => { byId[d.id] = d; });
  window.GYM = { DECKS: ORDER.map((id) => byId[id]), byId };
})();

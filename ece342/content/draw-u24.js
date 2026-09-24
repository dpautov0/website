/* draw-u24.js — drawings (circuits and plots) for every reading and figure-less problem in Units 2–4. */
(function () {
  const Dw = window.DRAW;
  const unit = (id) => COURSE.units.find((u) => u.id === id);
  const lesson = (uid, lid) => unit(uid).lessons.find((l) => l.id === lid);
  const byId = (id) => { for (const u of COURSE.units) for (const l of u.lessons) for (const s of l.steps) if (s.id === id) return s; return null; };
  const probs = (uid, lid) => lesson(uid, lid).steps.filter((s) => s.t === 'prob');
  // append drawings to reading i of a lesson
  const add = (uid, lid, i, figs) => {
    const s = lesson(uid, lid).steps[i];
    s.md += '\n\n' + Object.keys(figs).map((k) => `[[fig:${k}]]`).join('\n\n');
    s.figs = Object.assign(s.figs || {}, figs);
  };
  const plot = (o) => Schem.plot(Object.assign({ w: 360, h: 230 }, o));
  const NLBOX = FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' });

  // ================================================================ Unit 2
  const llCirc = [['V', [0, 0.5], [0, 1.5], { n: 'V_{TH}', s: '6\\,\\text{V}', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_{TH}', s: '2\\kO' }], ['X', [1.8, 0], [1.8, 2], { n: '\\text{device}' }],
    ['w', [0, 1.5], [0, 2], [1.8, 2]], ['vlab', [2.3, 0.2], [2.3, 1.8], { n: 'V' }], ['iarr', [0.9, 0], 'r', { n: 'I' }]];
  const llPlot = plot({ x: [0, 6.5], y: [0, 3.4], xl: 'V\\,(\\text{V})', yl: 'I\\,(\\text{mA})', xt: [0, 2, 4, 6], yt: [0, 1, 2, 3],
    curves: [{ f: (v) => (v < 2 ? 0 : (v - 2) / 2), cls: 'dc' }, { f: (v) => (6 - v) / 2, from: 0, to: 6 }], pts: [{ x: 4, y: 1, n: 'Q = (4\\,\\text{V}, 1\\,\\text{mA})' }, { x: 0, y: 3, n: 'V_{TH}/R_{TH}' }, { x: 6, y: 0, n: 'V_{TH}' }] });
  add('u2', 'u2-loadline', 0, { ll: Dw.row([{ fig: llCirc, cap: 'the device behind the Thévenin equivalent' }, { svg: llPlot, cap: 'device curve (amber) and load line: $Q$ where they cross' }]) });

  const pwlPlot = plot({ x: [0, 7], y: [0, 3], xl: 'V\\,(\\text{V})', yl: 'I\\,(\\text{mA})', xt: [0, 2, 4, 6], yt: [0, 1, 2],
    curves: [{ f: (v) => (v < 2 ? 0 : v < 4 ? (v - 2) / 2 : 1 + (v - 4) / 4), cls: 'dc' }], pts: [{ x: 1, y: 0, n: '\\text{seg. 1: } I = 0' }, { x: 3, y: 0.5, n: '\\text{seg. 2: slope } 1/2\\,\\text{k}' }, { x: 5.5, y: 1.375, n: '\\text{seg. 3: slope } 1/4\\,\\text{k}' }] });
  add('u2', 'u2-pwl', 0, { pwl: { svg: pwlPlot, cap: 'a piecewise-linear device: each segment is a straight line (a resistor plus an offset)' } });

  const tayPlot = plot({ x: [0, 3.5], y: [0, 7.5], xl: 'x', yl: 'f(x)', xt: [0, 1, 2, 3], yt: [0, 2, 4, 6],
    curves: [{ f: (x) => 0.5 * x * x + 1, cls: 'dc' }, { f: (x) => 3 + 2 * (x - 2), from: 0.8, to: 3.3 }], pts: [{ x: 2, y: 3, n: '(x_0, f(x_0))' }] });
  add('u2', 'u2-taylor', 0, { tay: { svg: tayPlot, cap: 'near $x_0$ the curve (amber) and its tangent (slope $f\'(x_0)$) are almost the same line' } });

  const wave = (dc, a, yl) => plot({ w: 260, h: 170, x: [0, 12.6], y: [dc - 2.5 * Math.abs(a), dc + 2.5 * Math.abs(a)], xl: 't', yl, xt: [], yt: [dc],
    curves: [{ f: (t) => dc + a * Math.sin(t) }, { f: () => dc, cls: 'dash' }] });
  add('u2', 'u2-sines', 0, { sn: Dw.row([{ svg: wave(1, 0.1, 'v_{IN}'), cap: '$v_{IN} = 1 + 0.1\\sin\\omega t$' }, { fig: NLBOX, cap: 'nonlinear block' }, { svg: wave(2, -0.2, 'v_{OUT}'), cap: '$v_{OUT} = 2 - 0.2\\sin\\omega t$: gain $-2$' }]) });

  const rincPlot = plot({ x: [0, 3], y: [0, 5], xl: 'V', yl: 'I', xt: [0, 1, 2, 3], yt: [0, 2, 4],
    curves: [{ f: (v) => 0.5 * v * v, cls: 'dc' }, { f: (v) => 2 + 2 * (v - 2), from: 1.2, to: 2.9 }], pts: [{ x: 2, y: 2, n: 'Q' }] });
  const Xel = [['term', [0, -0.4]], ['w', [0, -0.4], [0, 0]], ['X', [0, 0], [0, 1.6], { n: 'I = f(V)' }], ['w', [0, 1.6], [0, 2]], ['term', [0, 2]], ['vlab', [0.55, 0.1], [0.55, 1.5], { n: 'v' }], ['iarr', [0, -0.25], 'd', { n: 'i', side: 'l', off: [-14, 0] }]];
  const Rel = [['term', [0, -0.4]], ['w', [0, -0.4], [0, 0]], ['R', [0, 0], [0, 1.6], { n: 'r = \\dfrac{1}{f\'(V_0)}' }], ['w', [0, 1.6], [0, 2]], ['term', [0, 2]]];
  add('u2', 'u2-rinc', 0, { ri: Dw.row([{ fig: Xel, cap: 'the device' }, { svg: rincPlot, cap: 'its slope at $Q$' }, { fig: Rel, cap: 'for small signals: a resistor' }]) });

  const tpOrig = [['Vac', [0, 0.2], [0, 1.2], { n: 'v_s', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_S', side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]],
    ['R', [0, -0.4], [1.8, -0.4], { n: 'R' }], ['D', [1.8, -0.4], [1.8, 2.2], { side: 'l' }], ['gnd', [1.8, 2.2]], ['vlab', [2.25, 0], [2.25, 1.8], { n: 'V_D + v_d' }]];
  const tpDC = [['V', [0, 0.2], [0, 2.2], { n: 'V_S', side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R' }], ['V', [1.8, -0.4], [1.8, 2.2], { n: '0.7\\,\\text{V}' }], ['gnd', [1.8, 2.2]], ['iarr', [1.8, 0], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }]];
  const tpSS = Dw.ss(tpOrig, { rds: '\\tfrac{V_T}{I_D}' });
  add('u2', 'u2-twopass', 0, { tp: Dw.row([{ fig: tpOrig, cap: 'the circuit' }, { fig: tpDC, cap: 'DC pass: $v_s = 0$, diode $\\to 0.7\\,\\text{V}$' }, { fig: tpSS, cap: 'small-signal pass: $V_S$ shorted, diode $\\to r_d$' }]) });

  const nlSrc = [['term', [0, 0]], ['term', [0, 1.6]], ['vlab', [0.3, 0.2], [0.3, 1.4], { n: 'v_X' }], ['G', [1.8, 0], [1.8, 1.6], { n: '\\tfrac{G_M\\,v_X^2}{V_A}' }], ['w', [1.8, 0], [2.8, 0]], ['w', [1.8, 1.6], [2.8, 1.6]], ['term', [2.8, 0]], ['term', [2.8, 1.6]]];
  const linSrc = nlSrc.map((e) => (e[0] === 'G' ? ['G', e[1], e[2], { n: 'K\\,v_x' }] : e[0] === 'vlab' ? ['vlab', e[1], e[2], { n: 'v_x' }] : e));
  add('u2', 'u2-nlsrc', 0, { ns: Dw.row([{ fig: nlSrc, cap: 'large signal: nonlinear' }, { fig: linSrc, cap: 'small signal: $K = \\frac{2G_MV_{X0}}{V_A}$' }]) });
  const nl2 = [['box', [1.2, -0.3], [3.4, 2.1], { n: 'nonlinear<br/>two-port' }], ['w', [0.4, 0], [1.2, 0]], ['w', [0.4, 1.8], [1.2, 1.8]], ['w', [3.4, 0], [4.2, 0]], ['w', [3.4, 1.8], [4.2, 1.8]],
    ['term', [0.4, 0]], ['term', [0.4, 1.8]], ['term', [4.2, 0]], ['term', [4.2, 1.8]], ['vlab', [0.55, 0.35], [0.55, 1.45], { n: 'v_{IN}' }], ['vlab', [4.05, 0.35], [4.05, 1.45], { n: 'v_{OUT}', side: 'l' }],
    ['iarr', [0.8, 0], 'r', { n: 'i_{IN}' }], ['iarr', [3.8, 0], 'l', { n: 'i_{OUT}' }]];
  const nl2m = [['term', [0, 0]], ['w', [0, 0], [3, 0]], ['R', [1.4, 0], [1.4, 1.8], { n: '1/y_{11}' }], ['G', [3, 1.8], [3, 0], { n: 'y_{12}v_{out}' }], ['w', [0, 1.8], [3, 1.8]], ['term', [0, 1.8]],
    ['G', [6, 1.8], [6, 0], { n: 'y_{21}v_{in}', side: 'l' }], ['w', [6, 0], [8.2, 0]], ['R', [7.2, 0], [7.2, 1.8], { n: '1/y_{22}' }], ['w', [6, 1.8], [8.2, 1.8]], ['term', [8.2, 0]], ['term', [8.2, 1.8]]];
  add('u2', 'u2-nlsrc', 2, { n2: Dw.row([{ fig: nl2, cap: 'the nonlinear two-port' }, { fig: nl2m, cap: 'its incremental model (partial derivatives at $Q$)' }]) });
  const nlP = probs('u2', 'u2-nlsrc').find((p) => /two-port/.test(p.q));
  if (nlP) nlP.fig = nl2;

  const invS = FIGS.shuntX(), invSe = FIGS.seriesX();
  add('u2', 'u2-inverse', 0, { inv: Dw.row([
    { fig: invS, cap: '$X$ from the output to ground' }, { fig: Dw.ss(invS, { side: 'l' }), cap: 'incremental: $A_v = \\frac{r_x}{R_1 + r_x}$' },
    { fig: invSe, cap: '$X$ in series' }, { fig: Dw.ss(invSe), cap: 'incremental: $A_v = \\frac{R_1}{R_1 + r_x}$' }]) });

  const p1b = byId('P1-P1b'); if (p1b) p1b.fig = NLBOX;
  const snP = probs('u2', 'u2-sines'); if (snP[0]) snP[0].fig = NLBOX;
  const twP = probs('u2', 'u2-twopass');
  twP[0].figHtml = Dw.row([{ fig: [['I', [0, 1.6], [0, 0], { n: 'I_{DC}' }], ['term', [0, 0]], ['term', [0, 1.6]]], cap: 'a DC current source' }, { fig: [['term', [0, 0]], ['term', [0, 1.6]], ['txt', [0.3, 0.8], '$\\text{open}$', { a: 'l' }]], cap: 'for small signals: open' }]).svg;
  twP[1].fig = [['Vac', [0, 0.2], [0, 1.2], { n: '\\Delta V_S', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_S', side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R', s: '100\\,\\Omega' }],
    ['X', [1.8, -0.4], [1.8, 2.2], { n: 'V = 0.5I + 200I^2' }], ['gnd', [1.8, 2.2]], ['iarr', [0.9, -0.4], 'r', { n: 'I_0 + \\Delta I' }]];
  const f23c = byId('F23-P1c');
  if (f23c) f23c.fig = [['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R' }],
    ['D', [1.8, -0.4], [1.8, 2.2]], ['gnd', [1.8, 2.2]], ['iarr', [1.8, 0.2], 'd', { n: 'i_D = I_D + i_d', side: 'l', off: [-14, 0] }]];

  // ================================================================ Unit 3
  const expPlot = plot({ x: [0, 0.8], y: [0, 10], xl: 'V_D\\,(\\text{V})', yl: 'I_D\\,(\\text{mA})', xt: [0, 0.2, 0.4, 0.6, 0.8], yt: [0, 5, 10],
    curves: [{ f: (v) => 1e-12 * Math.exp(v / 0.025) * 1e3, cls: 'dc' }], pts: [{ x: 0.69, y: 1e-12 * Math.exp(0.69 / 0.025) * 1e3, n: '\\approx 0.7\\,\\text{V}' }] });
  add('u3', 'u3-exp', 0, { ex: Dw.row([{ fig: FIGS.diode1('V_D', 'I_D'), cap: 'anode on top: current flows down' }, { svg: expPlot, cap: 'exponential: nothing, then a wall near 0.7 V' }]) });

  const mOn = [['term', [0, 0]], ['w', [0, 0], [0, 1.6]], ['term', [0, 1.6]]];
  const mCvd = [['term', [0, -0.3]], ['w', [0, -0.3], [0, 0]], ['V', [0, 0], [0, 1.6], { n: '0.7\\,\\text{V}' }], ['w', [0, 1.6], [0, 1.9]], ['term', [0, 1.9]]];
  const mBpr = [['term', [0, -0.3]], ['w', [0, -0.3], [0, 0]], ['V', [0, 0], [0, 1], { n: '0.7\\,\\text{V}' }], ['R', [0, 1], [0, 2.2], { n: 'r' }], ['w', [0, 2.2], [0, 2.5]], ['term', [0, 2.5]]];
  const mOff = [['term', [0, 0]], ['term', [0, 1.6]], ['txt', [0.3, 0.8], '$\\text{open}$', { a: 'l' }]];
  add('u3', 'u3-models', 0, { mo: Dw.row([{ fig: FIGS.diode1('V_D', 'I_D'), cap: 'diode' }, { fig: mOn, cap: 'ideal, ON: short' }, { fig: mCvd, cap: 'CVD, ON: 0.7 V source' }, { fig: mBpr, cap: 'BPR, ON: 0.7 V + $r$' }, { fig: mOff, cap: 'any model, OFF: open' }]) });

  const onoff = [['V', [0, 0.5], [0, 1.5], { n: 'V_S', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_1' }], ['node', [1.8, 0], { n: 'V_X', side: 'a' }],
    ['D', [1.8, 0], [1.8, 1]], ['D', [1.8, 1], [1.8, 2]], ['w', [1.8, 0], [3, 0]], ['R', [3, 0], [3, 2], { n: 'R_2' }], ['w', [0, 1.5], [0, 2], [3, 2]], ['gnd', [1, 2]]];
  const onA = onoff.filter((e) => e[0] !== 'D').concat([['V', [1.8, 0], [1.8, 2], { n: '1.4\\,\\text{V}' }]]);
  const offA = onoff.filter((e) => e[0] !== 'D');
  add('u3', 'u3-onoff', 0, { oo: Dw.row([{ fig: onoff, cap: 'the circuit' }, { fig: onA, cap: 'assume ON: check $I_D > 0$' }, { fig: offA, cap: 'assume OFF: check $V_X < 1.4\\,\\text{V}$' }]) });

  const itPlot = plot({ x: [0, 1.1], y: [0, 5], xl: 'V_D\\,(\\text{V})', yl: 'I_D\\,(\\text{mA})', xt: [0, 0.5, 1], yt: [0, 2, 4],
    curves: [{ f: (v) => 6.9e-16 * Math.exp(v / 0.025) * 1e3, cls: 'dc' }, { f: (v) => (5 - v), from: 0, to: 1.1 }], pts: [{ x: 0.736, y: 4.26, n: 'Q' }] });
  add('u3', 'u3-iterate', 0, { it: Dw.row([{ fig: FIGS.vrd('5\\,\\text{V}', '1\\kO'), cap: 'the circuit' }, { svg: itPlot, cap: 'the iteration walks to the crossing $Q$' }]) });
  const nrPlot = plot({ x: [0.6, 0.8], y: [-3, 3], xl: 'v_D\\,(\\text{V})', yl: 'f(v_D)\\,(\\text{mA})', xt: [0.6, 0.7, 0.8], yt: [-2, 0, 2],
    curves: [{ f: (v) => (2 - v) - Math.exp((v - 0.7) / 0.025), cls: 'dc' }, { f: (v) => 0.3 - 41 * (v - 0.7), from: 0.66, to: 0.74 }], pts: [{ x: 0.7, y: 0.3, n: 'V_{D,0}' }, { x: 0.7073, y: 0, n: 'V_{D,1}' }] });
  add('u3', 'u3-iterate', 2, { nr: Dw.row([{ fig: FIGS.vrd('V_S', 'R_S'), cap: 'same circuit' }, { svg: nrPlot, cap: 'Newton: follow the tangent to zero' }]) });
  const itP = probs('u3', 'u3-iterate'); const nrP = itP.find((p) => /Newton/.test(p.q)); if (nrP) nrP.fig = FIGS.vrd('2\\,\\text{V}', '1\\kO');

  const rdPlot = plot({ x: [0.6, 0.8], y: [0, 10], xl: 'V_D', yl: 'I_D\\,(\\text{mA})', xt: [0.6, 0.7, 0.8], yt: [0, 5, 10],
    curves: [{ f: (v) => 2 * Math.exp((v - 0.7) / 0.025), cls: 'dc' }, { f: (v) => 2 + 80 * (v - 0.7), from: 0.66, to: 0.78 }], pts: [{ x: 0.7, y: 2, n: 'Q\\ (I_{D0} = 2\\,\\text{mA})' }] });
  add('u3', 'u3-rd', 0, { rd: Dw.row([{ fig: FIGS.diode1('V_{D0}+v_d', 'I_{D0}+i_d'), cap: 'diode at $Q$' }, { svg: rdPlot, cap: 'tangent slope $I_{D0}/V_T$' }, { fig: [['term', [0, -0.4]], ['w', [0, -0.4], [0, 0]], ['R', [0, 0], [0, 1.4], { n: 'r_d = V_T/I_{D0}' }], ['w', [0, 1.4], [0, 1.8]], ['term', [0, 1.8]]], cap: 'small-signal model' }]) });
  const errC = [['Vac', [0, 0.2], [0, 1.2], { n: 'v_s', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_S', side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R' }], ['D', [1.8, -0.4], [1.8, 2.2]], ['gnd', [1.8, 2.2]], ['vlab', [2.25, 0], [2.25, 1.8], { n: 'v_d' }]];
  add('u3', 'u3-rd', 2, { er: Dw.row([{ fig: errC, cap: 'the circuit' }, { fig: Dw.ss(errC), cap: 'small signal: $v_d = \\frac{r_d}{R + r_d}v_s$' }]) });
  const rdP = probs('u3', 'u3-rd');
  const swP = rdP.find((p) => /5% rule/.test(p.q)); if (swP) swP.fig = errC.map((e) => (e[0] === 'R' ? ['R', e[1], e[2], { n: 'R', s: '1\\kO' }] : e));
  const ho2 = byId('HO2-EX');
  if (ho2) {
    ho2.fig = [['Vac', [0, 0.2], [0, 1.2], { n: '\\Delta V = 0.1\\,\\text{V}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: '5\\,\\text{V}', side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: '2.15\\kO' }], ['D', [1.8, -0.4], [1.8, 2.2]], ['gnd', [1.8, 2.2]], ['iarr', [1.8, 0.1], 'd', { n: 'I_1 + \\Delta I', side: 'l', off: [-14, 0] }]];
    ho2.figs = { ss: { fig: Dw.ss(ho2.fig, { rds: '12.5\\,\\Omega' }), cap: 'incremental circuit' } };
    ho2.sol = `${ho2.sol}\n\n[[fig:ss]]`;
  }
  const ssEx = byId('P4-P2');
  if (ssEx) add('u3', 'u3-ss', 0, { se: Dw.row([{ fig: ssEx.fig, cap: 'Practice 4 P2' }, { fig: Dw.ss(ssEx.fig, { rds: '25\\,\\Omega' }), cap: 'small-signal: $V_{IN}$ short, $I_{OUT}$ open, diodes $\\to r_d$' }]) });

  // ================================================================ Unit 4
  const b0 = probs('u4', 'u4-basics');
  b0[0].fig = [['nmos', [1, 1]], ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'V_G = 2.3\\,\\text{V}', side: 'l' }], ['w', [1, 2], [1, 2.3]], ['term', [1, 2.3], { n: 'V_S = 1.1\\,\\text{V}' }], ['w', [1, 0], [1, -0.3]], ['term', [1, -0.3], { n: 'D' }]];
  b0[1].fig = [['rail', [0, 0], { n: 'V_{DD}' }], ['R', [0, 0], [0, 1.5], { n: 'R_1', side: 'l' }], ['R', [0, 1.5], [0, 3], { n: 'R_2', side: 'l' }], ['gnd', [0, 3]], ['w', [0, 1.5], [1.6, 1.5]], ['nmos', [2.6, 1.5]], ['gnd', [2.6, 2.5]], ['iarr', [0.8, 1.5], 'r', { n: 'I_G = 0' }]];

  const nLab = [['nmos', [1, 1]], ['w', [1, 0], [1, -0.3]], ['term', [1, -0.3], { n: 'D' }], ['w', [0, 1], [-0.3, 1]], ['term', [-0.3, 1], { n: 'G', side: 'l' }], ['w', [1, 2], [1, 2.3]], ['term', [1, 2.3], { n: 'S' }],
    ['iarr', [1, -0.15], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }], ['vlab', [1.6, 0.1], [1.6, 1.9], { n: 'V_{DS}' }]];
  const regPlot = plot({ x: [0, 4], y: [0, 2.6], xl: 'V_{DS}', yl: 'I_D', xt: [], yt: [],
    curves: [1, 1.5, 2].map((ov) => ({ f: (v) => (v < ov ? ov * v - v * v / 2 : ov * ov / 2), cls: 'dc' })).concat([{ f: (v) => v * v / 2, from: 0, to: 2.2, cls: 'dash' }]),
    pts: [{ x: 2, y: 2, n: 'V_{DS} = V_{ov}' }] });
  add('u4', 'u4-regions', 0, { rg: Dw.row([{ fig: nLab, cap: 'NMOS: $V_{GS} = V_G - V_S$, $V_{DS} = V_D - V_S$' }, { svg: regPlot, cap: '$I_D$ vs $V_{DS}$ for three $V_{GS}$: triode left of the dashed boundary, saturation right' }]) });
  const sqPlot = plot({ x: [0, 2], y: [0, 5], xl: 'V_{GS}\\,(\\text{V})', yl: 'I_D', xt: [0, 1, 2], yt: [],
    curves: [{ f: (v) => (v < 1 ? 0 : 5 * (v - 1) * (v - 1)), cls: 'dc' }], pts: [{ x: 1, y: 0, n: 'V_T' }, { x: 1.6, y: 1.8, n: '\\tfrac12\\mu_nC_{ox}\\tfrac WL V_{ov}^2' }] });
  add('u4', 'u4-square', 0, { sq: { svg: sqPlot, cap: 'nothing below $V_T$, then a parabola in $V_{ov}$' } });
  const pLab = [['pmos', [1, 1]], ['w', [1, 0], [1, -0.3]], ['term', [1, -0.3], { n: 'S' }], ['w', [0, 1], [-0.3, 1]], ['term', [-0.3, 1], { n: 'G', side: 'l' }], ['w', [1, 2], [1, 2.3]], ['term', [1, 2.3], { n: 'D' }],
    ['iarr', [1, 2.15], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }], ['vlab', [1.6, 0.1], [1.6, 1.9], { n: 'V_{SD}' }]];
  add('u4', 'u4-pmos', 0, { pm: Dw.row([{ fig: nLab, cap: 'NMOS: $V_{GS} = V_G - V_S$, $V_{DS} = V_D - V_S$, current into the drain' }, { fig: pLab, cap: 'PMOS: $V_{SG} = V_S - V_G$, $V_{SD} = V_S - V_D$, current out of the drain' }]) });
  const pmP = probs('u4', 'u4-pmos'); const pm2 = pmP.find((p) => /W\/L = 200/.test(p.q));
  if (pm2) pm2.fig = [['pmos', [1, 1], { sz: 'W/L=200' }], ['w', [1, 0], [1, -0.3]], ['term', [1, -0.3], { n: 'V_S = 5\\,\\text{V}' }], ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'V_G = 3.6\\,\\text{V}', side: 'l' }], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: 'D' }], ['iarr', [1, 2.2], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }]];
  add('u4', 'u4-bias', 0, { bi: Dw.row([{ fig: FIGS.nbias({ vdds: 'V_{DD}', RDs: '', RSs: '', wls: '', vgs: 'V_G' }), cap: 'NMOS: $V_{GS} = V_G - I_DR_S$' }, { fig: FIGS.pbias({ vdds: 'V_{DD}', RDs: '', RSs: '', wls: '', vgs: 'V_G' }), cap: 'PMOS: $V_{SG} = (V_{DD} - I_DR_S) - V_G$' }]) });

  const ronC = [['term', [0, 0]], ['w', [0, 0], [1, 0]], ['nmos', [1, 1]], ['w', [1, 2], [1, 2.3]], ['term', [1, 2.3]], ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'V_{GS}', side: 'l' }], ['vlab', [1.6, 0.1], [1.6, 1.9], { n: 'V_{DS}\\ \\text{small}' }]];
  const ronR = [['term', [0, 0]], ['w', [0, 0], [1, 0]], ['R', [1, 0], [1, 2.3], { n: 'R_{ON} = \\frac{1}{\\mu_nC_{ox}\\frac WL V_{ov}}' }], ['term', [1, 2.3]]];
  const vga = [['term', [-0.6, 0], { n: 'v_{in}', side: 'l' }], ['w', [-0.6, 0], [1, 0]], ['nmos', [1, 1]], ['w', [0, 1], [-0.6, 1]], ['term', [-0.6, 1], { n: 'V_{ctrl}', side: 'l' }],
    ['w', [1, 2], [2.5, 2]], ['opamp', [3.5, 2.5]], ['w', [2.5, 3], [2.1, 3]], ['gnd', [2.1, 3]], ['w', [2, 2], [2, 1]], ['R', [2, 1], [4.9, 1], { n: 'R_2' }], ['w', [4.9, 1], [4.9, 2.5]], ['w', [4.5, 2.5], [5.5, 2.5]], ['term', [5.5, 2.5], { n: 'v_{out}' }]];
  const tri = lesson('u4', 'u4-triode');
  if (tri) {
    add('u4', 'u4-triode', 0, { tr: Dw.row([{ fig: ronC, cap: 'NMOS with a small $V_{DS}$' }, { fig: ronR, cap: 'acts as a resistor' }, { fig: vga, cap: 'Lecture 7: $v_{out}/v_{in} = -R_2/R_{ON}$' }]) });
    const ronP = probs('u4', 'u4-triode').find((p) => /R_\{ON\}/.test(p.q));
    if (ronP) ronP.fig = ronC.map((e) => (e[0] === 'term' && Dw.optOf(e).n === 'V_{GS}' ? ['term', e[1], { n: 'V_{GS} = 3\\,\\text{V}', side: 'l' }] : e[0] === 'nmos' ? ['nmos', e[1], { sz: 'W/L=20' }] : e));
  }
  const dcN = [['rail', [1, 0], { n: 'V_{DD}' }], ['I', [1, 0], [1, 1.4], { n: 'I', side: 'l' }], ['nmos', [1, 2.4], { flip: true, dc: true }], ['gnd', [1, 3.4]], ['node', [1, 1.4], { n: 'V_{GS}', side: 'l' }]];
  const dcP = [['rail', [1, 0], { n: 'V_{DD}' }], ['pmos', [1, 1], { flip: true }], ['w', [2, 1], [2, 2], [1, 2]], ['I', [1, 2], [1, 3.4], { n: 'I', side: 'l' }], ['gnd', [1, 3.4]], ['node', [1, 2], { n: 'V_{DD} - V_{SG}', side: 'l' }]];
  add('u4', 'u4-diodeconn', 0, { dc: Dw.row([{ fig: dcN, cap: 'diode-connected NMOS: $V_{DS} = V_{GS}$' }, { fig: dcP, cap: 'diode-connected PMOS' }]) });
  add('u4', 'u4-mirror', 0, { mi: Dw.row([{ fig: FIGS.nmirror({ s1: '1X', s2: 'mX', irefs: '', RDs: '' }), cap: 'NMOS mirror: same $V_{GS}$, $I_{out} = m\\,I_{REF}$' }, { fig: FIGS.pmirror({ s1: '1X', s2: 'mX', irefs: '', RDs: '' }), cap: 'PMOS mirror' }]) });
  const mP = probs('u4', 'u4-mirror').find((p) => /share a gate/.test(p.q));
  if (mP) mP.fig = [['rail', [2, -0.4], { n: 'V_{DD}' }], ['w', [0.5, -0.4], [3.5, -0.4]], ['I', [0.5, -0.4], [0.5, 1], { n: 'I_{REF}', side: 'l' }], ['nmos', [0.5, 2], { flip: true, dc: true }], ['gnd', [0.5, 3]],
    ['w', [1.5, 2], [2.5, 2]], ['R', [3.5, -0.4], [3.5, 1], { n: 'R_D' }], ['nmos', [3.5, 2]], ['R', [3.5, 3], [3.5, 4.2], { n: 'R_S' }], ['gnd', [3.5, 4.2]]];
  const stackF = [['rail', [0, -0.4], { n: 'V_{DD}' }], ['I', [0, -0.4], [0, 1], { n: 'I', side: 'l' }], ['node', [0, 1], { n: 'V_3', side: 'l' }], ['nmos', [0, 2], { flip: true, dc: true, sz: '1X' }], ['node', [0, 3], { n: 'V_2', side: 'l' }],
    ['nmos', [0, 4], { flip: true, dc: true, sz: '4X' }], ['node', [0, 5], { n: 'V_1', side: 'l' }], ['nmos', [0, 6], { flip: true, dc: true, sz: '\\tfrac14X' }], ['gnd', [0, 7]]];
  const folPair = [['rail', [0, 0], { n: 'V_{DD}' }], ['w', [0, 0], [0, 0.3]], ['nmos', [0, 1.3]], ['w', [-1, 1.3], [-1.6, 1.3]], ['term', [-1.6, 1.3], { n: 'V_2', side: 'l' }], ['node', [0, 2.3], { n: 'V_3', side: 'r' }],
    ['nmos', [0, 3.3], { flip: true, dc: true }], ['gnd', [0, 4.3]]];
  add('u4', 'u4-stack', 0, { st: Dw.row([{ fig: stackF, cap: 'a stack: one current, each device drops its own $V_{GS}$' }, { fig: folPair, cap: 'follower on an identical diode: $V_3 = V_2/2$' }]) });
  if (lesson('u4', 'u4-stackmirror')) add('u4', 'u4-stackmirror', 0, { sm: { fig: FIGS.stackMirror({ s1: '1X', s2: '1X', s3: '\\tfrac12X', s4: '\\tfrac12X', i1s: '', i2s: '', vdd: 'V_{DD}' }), cap: 'Spring 2026 Problem 3 layout' } });
  const gmPlot = plot({ x: [0.8, 2], y: [0, 5], xl: 'V_{GS}', yl: 'I_D', xt: [1, 1.5, 2], yt: [],
    curves: [{ f: (v) => (v < 1 ? 0 : 5 * (v - 1) ** 2), cls: 'dc' }, { f: (v) => 1.25 + 5 * (v - 1.5), from: 1.25, to: 1.8 }], pts: [{ x: 1.5, y: 1.25, n: 'Q:\\ \\text{slope } g_m' }] });
  add('u4', 'u4-gm', 0, { gm: { svg: gmPlot, cap: '$g_m$ is the slope of $I_D$ vs $V_{GS}$ at the operating point' } });
  // ================================================================ remaining gaps found by the audit
  const nx = byId('NX-P1c');
  if (nx) nx.fig = [['box', [1.4, -0.3], [3.6, 2.3], { n: 'Non-linear<br/>circuit' }], ['w', [0.6, 0], [1.4, 0]], ['term', [0.6, 0], { n: 'v_A', side: 'l' }], ['w', [0.6, 1], [1.4, 1]], ['term', [0.6, 1], { n: 'v_B', side: 'l' }],
    ['w', [0.6, 2], [1.4, 2]], ['gnd', [0.6, 2]], ['w', [3.6, 0.4], [4.4, 0.4]], ['term', [4.4, 0.4], { n: 'v_{OUT}' }], ['w', [3.6, 1.8], [4.4, 1.8]], ['gnd', [4.4, 1.8]]];
  const linPlot = (f, cap, extra2) => ({ svg: plot({ w: 230, h: 170, x: [-2, 2], y: [-4, 4], xl: 'x', yl: 'f', xt: [0], yt: [0], curves: [{ f, cls: extra2 || '' }] }), cap });
  add('u1', 'u1-linear', 0, { lp: Dw.row([linPlot((x) => 1.5 * x, 'linear: straight, through the origin'), linPlot((x) => 1.5 * x + 1.5, 'affine: straight, misses the origin', 'dc'), linPlot((x) => x * x - 2, 'nonlinear: curved', 'ink')]) });
  const att = lesson('u1', 'u1-canonical').steps.find((s) => s.t === 'read' && /How to attack/.test(s.md));
  if (att) {
    const ann = FIGS.cs().concat([['txt', [0.9, 0.2], '$\text{gate}$', { a: 'r' }], ['txt', [3, 2.3], '$\text{source}$', { a: 'l' }], ['txt', [3, -0.35], '$\text{drain}$', { a: 'l' }]]);
    att.md += '\n\n[[fig:ann]]';
    att.figs = { ann: { fig: ann, cap: 'reading a model: $+$ of the sensing port is the gate, $-$ is the source, the diamond runs drain → source' } };
  }
})();

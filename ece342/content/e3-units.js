/* Exam 3: the units, in study order, plus the helpers every Exam 3 file uses.
   Units are registered with exam 'e3'. Exam 2's units stay on the same study path (site.js: include ['e2']).
   Content files add lessons with E3.lesson(unitId, {...}).
   Problem ids in Exam 3 files start with "e3" and never contain "-P<digit>": the Exam 1 question bank (gens-lec.js)
   files any id matching that pattern under its own topics.

   Figures: E3F is the BJT figure library (NPN at [x, y]: C [x, y−1], B [x−1, y], E [x, y+1]; PNP: E on top, C below,
   like a PMOS). The MOSFET library is E2F (e2-figs.js). */
(function () {
  'use strict';

  const unit = (id, num, title, extra = {}) => C.unit(Object.assign({ id, exam: 'e3', num, title, lessons: [] }, extra));
  unit('e3start', 'Start', 'Recognize any circuit: the five-second read', { blurb: 'The three questions to ask of every transistor (MOS or BJT), the one table of what each terminal looks like, and how to name a stage from where the signal goes in and comes out. Read this first, then drill it in the gym.' });
  unit('e3u10', 'Unit 10', 'The BJT: DC operating point and the small-signal model', { blurb: 'NPN and PNP, the four regions, $I_C = \\beta I_B$, DC analysis with $V_{BE} = 0.7\\,\\text{V}$, then $g_m = I_C/V_T$, $r_\\pi = \\beta/g_m$, $r_o = V_A/I_C$ and the hybrid-$\\pi$ model.' });
  unit('e3u11', 'Unit 11', 'BJT terminal impedances', { blurb: 'Looking into the base, the emitter and the collector; the $(\\beta + 1)$ rule both ways; the diode-connected BJT; $R_{UP}\\parallel R_{DN}$ with BJTs and MOSFETs mixed.' });
  unit('e3u12', 'Unit 12', 'BJT amplifiers: the $G_mR_{out}$ method', { blurb: 'Common emitter (with and without $R_E$), common base, emitter follower, the BJT cascode, then chains that mix BJTs and MOSFETs. $A_v = -G_mR_{out}$, exactly as in Unit 8.' });
  unit('e3u13', 'Unit 13', 'Frequency response and Bode plots', { blurb: 'Transfer functions, poles and zeros, decibels, the straight-line magnitude and phase rules, and reading a Bode plot back into $H(s)$.' });
  unit('e3u14', 'Unit 14', 'Transistor capacitances, poles at nodes, and Miller', { blurb: 'The high-frequency models ($C_\\pi$, $C_\\mu$; $C_{gs}$, $C_{gd}$, $C_{db}$), one pole per node ($1/RC$), the CS/CE stage exactly and with the dominant-pole approximation, and Miller\'s theorem.' });
  unit('e3u15', 'Unit 15', 'Open-circuit time constants', { blurb: 'Bandwidth from $1/\\sum R_{jo}C_j$: the resistance each capacitor sees with the others removed. CS, degenerated CS, CG, the cascode, and their BJT twins.' });
  unit('e3-gymu', 'Exam 3', 'Recognition gym', { tools: true });
  unit('e3-cardsu', 'Exam 3', 'Flashcards', { tools: true });
  unit('e3-pracu', 'Exam 3', 'Practice exams', { tools: true });
  unit('e3-xu', 'Exam 3', 'Sheet and mixed practice', { tools: true });

  // last semester's BJT problems (typed in e2-sp26.js) open the practice-exam unit
  (window.E3_SAVED || []).forEach((l) => COURSE.units.find((u) => u.id === 'e3-pracu').lessons.push(l));

  // ---------------------------------------------------------------- symbolic answers
  // Variable ranges keep beta >= 50 and g_m r_o, g_m r_ds >= 100, so the beta >> 1 and g_m r_o >> 1 approximations
  // land within 3% of the exact form and both are accepted (pass {exact: true} to demand the exact one).
  // r_pi is tied to beta/g_m (same suffix) whenever both appear, so 1/g_m and r_pi/(beta + 1) are interchangeable.
  const rangeOf = (n) => {
    const l = n.toLowerCase();
    if (/^beta/.test(l)) return [50, 200];
    if (/^gm/.test(l)) return [2e-3, 40e-3];
    if (/^rpi/.test(l)) return [1e3, 2e4];
    if (/^r(ds|o)\d*$/.test(l)) return [1e5, 3e5];
    if (/^c/.test(l)) return [1e-13, 1e-11];
    if (/^r/.test(l)) return [1e3, 1e4];
    if (/^a/.test(l)) return [20, 100];
    if (/^k/.test(l)) return [0.1, 0.9];
    if (/^v/.test(l)) return [0.01, 0.1];
    if (/^(w|s)/.test(l)) return [1e5, 1e8];
    return [0.5, 2];
  };
  const texOf = (n) => {
    let m;
    if ((m = /^gm(\w*)$/.exec(n))) return `g_{m${m[1]}}`;
    if ((m = /^rpi(\w*)$/.exec(n))) return `r_{\\pi${m[1]}}`;
    if ((m = /^beta(\w*)$/.exec(n))) return m[1] ? `\\beta_{${m[1]}}` : '\\beta';
    if ((m = /^rds(\w*)$/.exec(n))) return `r_{ds${m[1]}}`;
    if ((m = /^ro(\w*)$/.exec(n))) return m[1] ? `r_{o${m[1]}}` : 'r_o';
    if ((m = /^Cpi(\w*)$/.exec(n))) return `C_{\\pi${m[1]}}`;
    if ((m = /^Cmu(\w*)$/.exec(n))) return `C_{\\mu${m[1]}}`;
    if ((m = /^v(\w+)$/.exec(n))) return `v_{${m[1]}}`;
    if ((m = /^w(\w+)$/.exec(n))) return `\\omega_{${m[1]}}`;
    if ((m = /^([A-Za-z])(\w+)$/.exec(n))) return `${m[1]}_{${m[2]}}`;
    return n;
  };
  function ex(expr, names, lbl, o = {}) {
    const vars = {}, disp = {};
    names.forEach((n) => { vars[n] = o.ranges && o.ranges[n] ? o.ranges[n] : rangeOf(n); disp[n] = texOf(n); });
    const derived = {};
    if (!o.free) names.forEach((n) => {
      const m = /^rpi(\w*)$/.exec(n);
      if (m && names.includes(`gm${m[1]}`) && names.includes(`beta${m[1]}`)) derived[n] = (env) => env[`beta${m[1]}`] / env[`gm${m[1]}`];
    });
    const part = { lbl, expr, vars, disp, rtol: o.exact ? undefined : (o.rtol ?? 0.03) };
    if (Object.keys(derived).length) part.derived = derived;
    return part;
  }

  // ---------------------------------------------------------------- numbers
  const f = U.fmt;
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const MS = (g) => `${f(g * 1000, 3)}\\,\\text{mS}`;
  const resTeX = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  // a resistance answer box in a sensible unit; the approximate form accepted too; traps = known slips with a message
  const resPart = (lbl, exact, approx, traps = []) => {
    const [unitS, s] = exact < 1e3 ? ['Ω', 1] : exact < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    const p = { lbl, unit: unitS, ans: exact * s };
    if (approx !== undefined && Math.abs(approx - exact) > 0.012 * exact) p.accept = [approx * s];
    const t = traps.filter((x) => Math.abs(x.v - exact) > 0.02 * exact && (approx === undefined || Math.abs(x.v - approx) > 0.02 * approx));
    if (t.length) p.traps = t.map((x) => ({ v: x.v * s, msg: x.msg }));
    return p;
  };

  window.E3 = {
    unit: (id) => COURSE.units.find((u) => u.id === id),
    lesson(uid, l) { const u = this.unit(uid); if (!u) throw new Error(`E3: no unit ${uid}`); u.lessons.push(l); return l; },
    ex, texOf, rangeOf, KO, MS, resTeX, resPart,
  };

  // ---------------------------------------------------------------- BJT figure library
  const F = {};
  const look = (p, name, side = 'r') => ['term', p, { n: side === 'l' ? `${name}\\,\\rightarrow` : `\\leftarrow\\,${name}`, side }];
  const lookUp = (p, name) => ['term', p, { n: `\\uparrow ${name}`, side: 'r' }];
  const lookDn = (p, name) => ['term', p, { n: `\\downarrow ${name}`, side: 'r' }];
  const vin = (x, y, n = 'v_{in}') => [['Vac', [x, y], [x, y + 1], { n, side: 'l' }], ['gnd', [x, y + 1]]];
  const out = (p, n = 'v_{out}') => ['term', p, { n, side: 'r' }];
  const inB = (bx, y, n) => [['w', [bx, y], [bx - 0.6, y], [bx - 0.6, y + 0.4]], ...vin(bx - 0.6, y + 0.4, n)];
  Object.assign(F, { look, lookUp, lookDn, vin, out, inB });

  // looking into one terminal (Lecture 24 summary)
  F.base = () => [['rail', [1, 0]], ['npn', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.7, 1]], look([-0.7, 1], 'R_{in}', 'l')];
  F.baseRE = (re = 'R_E') => [['rail', [1, 0]], ['npn', [1, 1]], ['R', [1, 2], [1, 3.2], { n: re }], ['gnd', [1, 3.2]], ['w', [0, 1], [-0.7, 1]], look([-0.7, 1], 'R_{in}', 'l')];
  F.emitter = () => [['rail', [1, 0]], ['npn', [1, 1]], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], 'R_E')];
  F.emitterRB = (rb = 'R_B') => [['rail', [1, 0]], ['npn', [1, 1]], ['R', [-1.2, 1], [0, 1], { n: rb }], ['acg', [-1.2, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], 'R_E')];
  F.collector = () => [['npn', [1, 1]], ['acg', [0, 1]], ['gnd', [1, 2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], 'R_C')];
  F.collectorRE = (re = 'R_E') => [['npn', [1, 1]], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: re }], ['gnd', [1, 3.2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], 'R_C')];
  F.diode = () => [['npn', [1, 1], { dc: true }], ['gnd', [1, 2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], 'R')];
  F.diodeRB = (rb = 'R_B') => [['npn', [1, 1]], ['gnd', [1, 2]], ['R', [0, 1], [0, -0.3], { n: rb, side: 'l' }], ['w', [0, -0.3], [1, -0.3], [1, 0]], ['w', [1, -0.3], [1, -0.7]], lookDn([1, -0.7], 'R')];

  // single stages (NPN). Output at the collector [1, 0] or the emitter [1, 2].
  F.ce = () => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]), ['npn', [1, 1]], ['gnd', [1, 2]], ...inB(0, 1)];
  F.ceDeg = () => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]), ['npn', [1, 1]],
    ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]], ...inB(0, 1)];
  F.ceRB = () => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]), ['npn', [1, 1]], ['gnd', [1, 2]],
    ['R', [-1.2, 1], [0, 1], { n: 'R_B' }], ['w', [-1.2, 1], [-1.6, 1], [-1.6, 1.4]], ...vin(-1.6, 1.4)];
  F.cb = (re = true) => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]), ['npn', [1, 1]], ['acg', [0, 1]],
    ...(re ? [['R', [1, 2], [1, 3.2], { n: 'R_E' }], ...vin(1, 3.2)] : vin(1, 2))];
  F.cc = (rb = false) => [['rail', [1, 0]], ['npn', [1, 1]], ['w', [1, 2], [1.8, 2]], out([1.8, 2]), ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]],
    ...(rb ? [['R', [-1.2, 1], [0, 1], { n: 'R_B' }], ['w', [-1.2, 1], [-1.6, 1], [-1.6, 1.4]], ...vin(-1.6, 1.4)] : inB(0, 1))];
  F.cascode = () => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['gnd', [1, 4]], ...inB(0, 3)];

  // the hybrid-pi model of one BJT: B on the left, r_pi from B to E, g_m v_pi from C to E, r_o across it
  F.hybridPi = (o = {}) => [
    ['term', [0, 0], { n: 'B', side: 'l' }], ['w', [0, 0], [1, 0]], ['R', [1, 0], [1, 2], { n: 'r_\\pi', side: 'l' }],
    ['vlab', [1.35, 0.35], [1.35, 1.65], { n: 'v_\\pi' }],
    ['w', [1, 2], [4.2, 2]], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi', side: 'l' }], ['w', [3, 0], [4.2, 0]],
    ...(o.ro === false ? [] : [['R', [4.2, 0], [4.2, 2], { n: 'r_o' }]]),
    ['w', [3, 0], [3, -0.5]], ['term', [3, -0.5], { n: 'C', side: 'r' }],
    ['w', [2.2, 2], [2.2, 2.5]], ['term', [2.2, 2.5], { n: 'E', side: 'r' }],
  ];
  window.E3F = F;
})();

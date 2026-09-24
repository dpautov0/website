/* draw-sol.js — the circuits a solution works on, drawn inside the solution:
   test-source setups for every R_TH / R_N, and the incremental model for every small-signal problem. */
(function () {
  const Dw = window.DRAW;
  const byId = (id) => { for (const u of COURSE.units) for (const l of u.lessons) for (const s of l.steps) if (s.id === id) return s; return null; };
  // put a drawing into a solution: before the first matching heading if there is one, else at the end
  const put = (p, key, F, before) => {
    if (!p) return;
    p.figs = Object.assign(p.figs || {}, { [key]: F });
    const i = before ? p.sol.search(before) : -1;
    p.sol = i >= 0 ? `${p.sol.slice(0, i)}[[fig:${key}]]\n\n${p.sol.slice(i)}` : `${p.sol}\n\n[[fig:${key}]]`;
  };
  const RTH_AT = /\*\*\$\\R(TH|N)\$|\*\*\$\\RTH\$|\*\*\$R_\{TH\}|\\RTH\$\*\*|\*\*R/;

  // ---------------------------------------------------------------- test-source setups (Problem 1 type)
  const tests = {
    'PS1-1': { at: [4.6, 1] }, 'PS1-2': { at: [2.6, -0.7], x: 5.4 }, 'PS1-3': { at: [5, 2] },
    'F22-P1': { at: [6.2, 1], ref: [6.2, 2.3], ground: [[4, -1.1]], drop: [[6.2, 2.3]], remove: ['R_L'] },
    'MA-P1': { at: [1.8, -2.2] }, 'MB-P1': { at: [5.8, 0] },
  };
  for (const [id, o] of Object.entries(tests)) {
    const p = byId(id);
    if (!p || !p.fig) continue;
    put(p, 'test', { fig: Dw.test(p.fig, o), cap: 'for $R_{TH}$: independent sources off, dependent sources kept, test source $v_t$ at the port' }, RTH_AT);
  }
  const ma = byId('MA-P1');
  if (ma) {
    const inS = ma.fig.filter((e) => !(e[0] === 'V' || (e[0] === 'R' && Dw.optOf(e).n === 'R_S') || (e[0] === 'gnd' && e[1][0] === 0) || (e[0] === 'w' && e[1][0] === 0)))
      .concat([['w', [1.8, 0], [0.6, 0]], ['V', [0.6, 0], [0.6, 1.4], { n: 'v_t', side: 'l' }], ['gnd', [0.6, 1.4]], ['iarr', [1.2, 0], 'r', { n: 'i_t' }]]);
    put(ma, 'rin', { fig: inS, cap: 'for $R_{in,s}$: $v_t$ applied at $s$ ($v_{in}$ and $R_S$ removed)' });
  }

  // ---------------------------------------------------------------- incremental models (Problem 2 type)
  const K = 'K\\,v_x';
  const ss = {
    'PS2-1': { rx: 'r' },
    'PS2-2': { rxs: { 'g(I_1)': 'r_1', 'f(V_2)': 'r_2' } },
    'PS2-3': { src: { '\\tfrac{G_Mv_X^2}{V_A}': K } },
    'F22-P2': { src: { '\\tfrac{G_Mv_X^2}{V_A}': K }, rds: '\\tfrac{25}{3}\\,\\Omega' },
    'F23-P2': { src: { 'Av_X^3': '42\\,v_x' }, rds: '25\\,\\Omega' },
    'P1-P2': { rds: '25\\,\\Omega' }, 'P4-P2': { rds: '25\\,\\Omega' }, 'P5-P2': { rds: '25\\,\\Omega' },
    'P6-P2': { src: { 'G_M\\tfrac{V_X^3}{V_A^2}': K } },
    'S26-P2': { side: 'l' }, 'MC-P2': { side: 'l' }, 'MD-P2': {}, 'NX-P2a': { side: 'l' },
    'MA-P2': { src: { 'G_M\\tfrac{v_X^2}{V_A}': K } },
    'MB-P2': {}, 'NX-P2b': { rds: '12.5\\,\\Omega' },
  };
  for (const [id, o] of Object.entries(ss)) {
    const p = byId(id);
    if (!p || !p.fig) continue;
    put(p, 'ss', { fig: Dw.ss(p.fig, o), cap: 'incremental model: DC sources off, diodes $\\to r_d$, nonlinear elements linearised' }, /\*\*(Small|Linearise|Incremental|Small-signal)|\(ii\)|\*\*\(ii\)/);
  }
  const s26 = byId('S26-P2');
  if (s26 && !/\[\[fig:ss\]\]/.test(s26.sol)) put(s26, 'ss', { fig: Dw.ss(s26.fig), cap: 'incremental model' });

  // ---------------------------------------------------------------- generated problems draw their solution circuits too
  const wrap = (name, fn) => { const g = GENS[name]; if (!g) return; GENS[name] = (o) => { const p = g(o); try { fn(p); } catch (e) { /* keep the problem even if a drawing fails */ } return p; }; };
  wrap('thev_dep', (p) => {
    const o = p.fig.find((e) => e[0] === 'term' && Dw.optOf(e).name === 'o');
    if (!o) return;
    p.figs = { test: { fig: Dw.test(p.fig, { at: o[1] }), cap: 'for $R_{TH}$: input off, dependent source kept, $v_t$ at the output' } };
    p.sol = `${p.sol}\n\n[[fig:test]]`;
  });
  for (const name of ['diode_ss', 'diode_isrc', 'inverse_op']) {
    wrap(name, (p) => {
      p.figs = { ss: { fig: Dw.ss(p.fig), cap: 'incremental model' } };
      p.sol = `${p.sol}\n\n[[fig:ss]]`;
    });
  }
  wrap('pwl_q', (p) => {
    p.figs = { ss: { fig: Dw.ss(p.fig, { rx: 'r_d' }), cap: 'small-signal circuit: $V_S$ shorted, device $\\to r_d$' } };
    p.sol = `${p.sol}\n\n[[fig:ss]]`;
  });
})();

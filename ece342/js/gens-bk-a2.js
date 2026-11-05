/* gens-bk-a2.js — Chapter 3 (Looking into a MOSFET): the chapter's figure library (window.BK3F, shared with
   content/bk03-mos-imped.js) and its randomized drills (GENS.bk_mi_*). Every formula here was checked against an
   independent nodal solve of the small-signal circuit, and the PMOS results against a large-signal square-law solve.
   Drawing conventions (js/schem.js): NMOS at [x, y] has D [x, y-1], S [x, y+1], G [x-1, y]; PMOS has S on top
   [x, y-1] and D below [x, y+1]. In the small-signal pictures the model's current g_m v_gs always points from drain to
   source: down for an NMOS drawn drain-up, UP for a PMOS (source on top). */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, par = U.par;
  const GENS = window.GENS;

  // ================================================================ formatting
  const RT = (r) => (!isFinite(r) ? '\\infty' : r < 1e3 ? `${f(r, 4)}\\,\\Omega` : r < 1e6 ? `${f(r / 1e3, 4)}\\,\\text{k}\\Omega`
    : r < 1e9 ? `${f(r / 1e6, 4)}\\,\\text{M}\\Omega` : `${f(r / 1e9, 4)}\\,\\text{G}\\Omega`);
  const MS = (g) => `${f(g * 1e3, 4)}\\,\\text{mS}`;
  const MA = (i) => `${f(i * 1e3, 4)}\\,\\text{mA}`;
  // a resistance as a figure value label (short)
  const RV = (r) => RT(r).replace(/\\,/g, '\\,');

  // ================================================================ figure library: transistor level
  const F = {};
  const lookDn = (p, n) => ['term', p, { n: `\\downarrow ${n}`, side: 'r' }];
  const lookUp = (p, n) => ['term', p, { n: `\\uparrow ${n}`, side: 'r' }];
  const lookL = (p, n) => ['term', p, { n: `${n}\\,\\rightarrow`, side: 'l' }];
  const lookR = (p, n) => ['term', p, { n: `\\leftarrow ${n}`, side: 'r' }];
  Object.assign(F, { lookDn, lookUp, lookL, lookR });
  const lab = (n, v) => (v ? { n, s: v } : { n });

  // the gate: anything on the drain and source, test on the gate lead
  F.gate = (o = {}) => [
    ...(o.rd ? [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], lab('R_D', o.rdv)]] : [['rail', [1, 0]]]),
    ['nmos', [1, 1], { n: o.n }],
    ...(o.rs ? [['R', [1, 2], [1, 3.2], lab('R_S', o.rsv)], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]]),
    ['w', [0, 1], [-0.8, 1]], lookL([-0.8, 1], o.look || 'R_G'),
  ];

  // looking into a drain with the gate held. NMOS: look down; PMOS (source on top): look up. o.rs: a resistor
  // between the source and its rail (degeneration).
  F.drain = (o = {}) => (o.p
    ? [...(o.rs ? [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], lab(o.rs, o.rsv)]] : [['rail', [1, 0]]]),
      ['pmos', [1, 1], { n: o.n }], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], o.look || 'R')]
    : [['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], o.look || 'R'), ['nmos', [1, 1], { n: o.n }], ['acg', [0, 1]],
      ...(o.rs ? [['R', [1, 2], [1, 3.2], lab(o.rs, o.rsv)], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]])]);

  // looking into a source with the gate held. o.load on the drain: 'rail' | 'R' | 'I' (ideal current source) | 'M'
  // (a transistor current source). NMOS: drain up, look up into the source from below. PMOS: the source is on top and
  // we look down into it; the drain load hangs below.
  F.source = (o = {}) => {
    const ld = o.load || 'rail';
    if (o.p) {
      const below = ld === 'rail' ? [['gnd', [1, 2]]]
        : ld === 'R' ? [['R', [1, 2], [1, 3.2], lab(o.rdn || 'R_D', o.rdv)], ['gnd', [1, 3.2]]]
        : ld === 'I' ? [['I', [1, 2], [1, 3.2], { n: 'I_B' }], ['gnd', [1, 3.2]]]
        : [['nmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]], ['gnd', [1, 4]]];
      return [['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], o.look || 'R'), ['pmos', [1, 1], { n: o.n || (ld === 'M' ? 'M_1' : undefined) }], ['acg', [0, 1]], ...below];
    }
    const above = ld === 'rail' ? [['rail', [1, 0]]]
      : ld === 'R' ? [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], lab(o.rdn || 'R_D', o.rdv)]]
      : ld === 'I' ? [['rail', [1, -1.2]], ['I', [1, -1.2], [1, 0], { n: 'I_B' }]]
      : [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]]];
    return [...above, ['nmos', [1, 1], { n: o.n || (ld === 'M' ? 'M_1' : undefined) }], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], o.look || 'R')];
  };

  // diode-connected: NMOS (look down; o.rs = resistor from source to ground, o.rtop = resistor above the drain)
  // PMOS (source to the rail, or through o.rs to the rail; look up into the drain)
  F.diode = (o = {}) => (o.p
    ? [...(o.rs ? [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], lab(o.rs, o.rsv)]] : [['rail', [1, 0]]]),
      ['pmos', [1, 1], { n: o.n, dc: true }], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], o.look || 'R')]
    : [...(o.rtop ? [['R', [1, -1.2], [1, 0], lab(o.rtop, o.rtv)], ['w', [1, -1.2], [1, -1.6]], lookDn([1, -1.6], o.look || 'R')]
      : [['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], o.look || 'R')]),
      ['nmos', [1, 1], { n: o.n, dc: true }],
      ...(o.rs ? [['R', [1, 2], [1, 3.2], lab(o.rs, o.rsv)], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]])]);

  // the K picture: the gate is driven so that it moves K times the drain voltage
  F.k = (o = {}) => [['nmos', [1, 1], { n: o.n }], ...(o.rs === false ? [['gnd', [1, 2]]] : [['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]]]),
    ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], o.look || 'R'), ['node', [1, -0.1], { n: 'v_t', side: 'l' }],
    ['w', [0, 1], [-0.5, 1]], ['term', [-0.5, 1], { n: 'v_g = K\\,v_t', side: 'l' }]];
  // a gate on a divider R_a (top), R_b (bottom) hung from the test node
  F.kdiv = (o = {}) => [
    ['w', [-1, -0.4], [2.2, -0.4]], ['w', [1, 0], [1, -0.4]], lookR([2.2, -0.4], o.look || 'R_{EQ}'),
    ['R', [-1, -0.4], [-1, 1], lab('R_a', o.rav)], ['R', [-1, 1], [-1, 2.4], lab('R_b', o.rbv)], ['gnd', [-1, 2.4]],
    ['w', [-1, 1], [0, 1]], ['nmos', [1, 1], { n: o.n }],
    ...(o.rs ? [['R', [1, 2], [1, 3.2], lab('R_S', o.rsv)], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]]),
  ];
  // a diode stack M_a over M_b hung from the test node; M_c's drain on the node, its gate on the middle node X
  F.kstack = (o = {}) => [
    ['w', [1, -0.4], [3.2, -0.4]], ['w', [1, 0], [1, -0.4]], ['w', [3, 0], [3, -0.4]], lookR([3.2, -0.4], o.look || 'R_{EQ}'),
    ['nmos', [1, 1], { n: 'M_a', dc: true }], ['node', [1, 2], { n: 'X', side: 'l' }], ['nmos', [1, 3], { n: 'M_b', dc: true }], ['gnd', [1, 4]],
    ['w', [1, 2], [1.6, 2], [1.6, 1], [2, 1]], ['nmos', [3, 1], { n: 'M_c' }], ['gnd', [3, 2]],
  ];

  // stacks. NMOS cascode (M_2 on M_1, gates held; o.rs: a resistor under M_1; o.n3: a third device on top)
  F.casc = (o = {}) => {
    const top = o.triple ? [['nmos', [1, -1], { n: 'M_3' }], ['acg', [0, -1]], ['w', [1, -2], [1, -2.4]], lookDn([1, -2.4], o.look || 'R')]
      : [['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], o.look || 'R')];
    return [...top, ['nmos', [1, 1], { n: 'M_2' }], ['acg', [0, 1]], ['nmos', [1, 3], { n: 'M_1' }], ['acg', [0, 3]],
      ...(o.rs ? [['R', [1, 4], [1, 5.2], lab('R_S', o.rsv)], ['gnd', [1, 5.2]]] : [['gnd', [1, 4]]])];
  };
  // PMOS cascode load: V_DD on top, M_3 then M_4, look up into M_4's drain
  F.pcasc = (o = {}) => [['rail', [1, -2]], ['pmos', [1, -1], { n: o.n1 || 'M_3' }], ['acg', [0, -1]], ['pmos', [1, 1], { n: o.n2 || 'M_4' }], ['acg', [0, 1]],
    ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], o.look || 'R')];
  // the regulated cascode (Practice 2 #2(b)): M_1 on R_Y, its gate driven by M_3 with an ideal current-source load
  F.reg = (o = {}) => [
    ['nmos', [2, 1], { n: 'M_1' }], ['w', [2, 0], [2, -0.4]], lookDn([2, -0.4], o.look || 'R_{out}'),
    ['node', [2, 2], { n: 'Y', side: 'r' }], ['R', [2, 2], [2, 3.4], lab('R_Y', o.ryv)], ['gnd', [2, 3.4]],
    ['nmos', [0.4, 2.6], { n: 'M_3', flip: true }], ['gnd', [0.4, 3.6]], ['w', [1.4, 2.6], [1.4, 2], [2, 2]],
    ['w', [0.4, 1.6], [0.4, 1], [1, 1]], ['node', [0.4, 1.3], { n: 'N', side: 'l' }], ['rail', [0.4, -0.2]], ['I', [0.4, -0.2], [0.4, 1], { n: 'I_B', side: 'l' }],
  ];

  // ---------------------------------------------------------------- node branches, meeting at the node [x, 0]
  // up branches (toward V_DD) and down branches (toward ground); each takes x and an options object
  const UPB = {
    R: (x, o) => [['rail', [x, -1.2]], ['R', [x, -1.2], [x, 0], lab(o.rn || 'R_D', o.rv)]],
    drain: (x, o) => [['rail', [x, -2]], ['pmos', [x, -1], { n: o.n }], ['acg', [x - 1, -1]]],
    degen: (x, o) => [['rail', [x, -3.2]], ['R', [x, -3.2], [x, -2], lab(o.rn || 'R_1', o.rv)], ['pmos', [x, -1], { n: o.n }], ['acg', [x - 1, -1]]],
    diode: (x, o) => [['rail', [x, -2]], ['pmos', [x, -1], { n: o.n, dc: true }]],
    diodeR: (x, o) => [['rail', [x, -3.2]], ['R', [x, -3.2], [x, -2], lab(o.rn || 'R_1', o.rv)], ['pmos', [x, -1], { n: o.n, dc: true }]],
    casc: (x, o) => [['rail', [x, -4]], ['pmos', [x, -3], { n: o.n2 || 'M_4' }], ['acg', [x - 1, -3]], ['pmos', [x, -1], { n: o.n || 'M_3' }], ['acg', [x - 1, -1]]],
    src: (x, o) => [['rail', [x, -2]], ['nmos', [x, -1], { n: o.n }], ['acg', [x - 1, -1]]],     // looking up into an NMOS source
  };
  const DNB = {
    R: (x, o) => [['R', [x, 0], [x, 1.2], lab(o.rn || 'R_S', o.rv)], ['gnd', [x, 1.2]]],
    drain: (x, o) => [['nmos', [x, 1], { n: o.n }], ['acg', [x - 1, 1]], ['gnd', [x, 2]]],
    degen: (x, o) => [['nmos', [x, 1], { n: o.n }], ['acg', [x - 1, 1]], ['R', [x, 2], [x, 3.2], lab(o.rn || 'R_S', o.rv)], ['gnd', [x, 3.2]]],
    diode: (x, o) => [['nmos', [x, 1], { n: o.n, dc: true }], ['gnd', [x, 2]]],
    diodeR: (x, o) => [['nmos', [x, 1], { n: o.n, dc: true }], ['R', [x, 2], [x, 3.2], lab(o.rn || 'R_S', o.rv)], ['gnd', [x, 3.2]]],
    casc: (x, o) => [['nmos', [x, 1], { n: o.n || 'M_2' }], ['acg', [x - 1, 1]], ['nmos', [x, 3], { n: o.n2 || 'M_1' }], ['acg', [x - 1, 3]], ['gnd', [x, 4]]],
    src: (x, o) => [['pmos', [x, 1], { n: o.n }], ['acg', [x - 1, 1]], ['gnd', [x, 2]]],      // looking down into a PMOS source
  };
  // a node with one up and one down branch, plus the look-in label on a stub to the right
  F.node = (up, dn, o = {}) => [...UPB[up[0]](1, up[1] || {}), ...DNB[dn[0]](1, dn[1] || {}),
    ['w', [1, 0], [2, 0]], ['node', [1, 0], { n: o.name || '', side: 'l' }], lookR([2, 0], o.look || 'R_{EQ}')];
  F.UPB = UPB; F.DNB = DNB;

  // ================================================================ figure library: small-signal pieces
  const S = {};
  // the MOSFET model between drain (x, yd) and source (x, ys): dependent source g_m v_gs pointing drain -> source, and
  // r_ds beside it at x + w. Down for an NMOS drawn drain-up; up for a PMOS (yd > ys).
  S.mos = (x, yd, ys, o = {}) => {
    const w = o.w ?? 1.3;
    return [['G', [x, yd], [x, ys], { n: o.g ?? 'g_mv_{gs}', side: o.gside || 'l' }], ['w', [x, yd], [x + w, yd]],
      ['R', [x + w, yd], [x + w, ys], { n: o.r ?? 'r_{ds}' }], ['w', [x, ys], [x + w, ys]]];
  };
  // test source to the right of node (x, y): v_t to ground, i_t flowing INTO the node
  S.test = (x, y, o = {}) => {
    const dx = o.dx ?? 1.4;
    return [['w', [x, y], [x + dx, y]], ['V', [x + dx, y], [x + dx, y + 1.2], { n: o.n || 'v_t', side: 'r' }], ['gnd', [x + dx, y + 1.2]],
      ['iarr', [x + dx * 0.5, y], 'l', { n: o.i || 'i_t' }]];
  };
  // test source hanging below node (x, y), i_t flowing up into the node
  S.testDn = (x, y, o = {}) => {
    const dy = o.dy ?? 0.8;
    return [['w', [x, y], [x, y + dy]], ['V', [x, y + dy], [x, y + dy + 1.2], { n: o.n || 'v_t', side: 'r' }], ['gnd', [x, y + dy + 1.2]],
      ['iarr', [x, y + dy * 0.5], 'u', { n: o.i || 'i_t', side: 'l' }]];
  };
  // the gate port: G at (gx, gy) and a stub of the source node at (gx, gy + 0.9), +v_gs- between them. The stub is wired
  // to the source node at (sx, sy). o.gnd: the gate is held (wired to ground on its left).
  S.gport = (gx, gy, sx, sy, o = {}) => [
    ['term', [gx, gy], { n: 'G', side: 'a' }], ['term', [gx, gy + 0.9]], ['w', [gx, gy + 0.9], [gx, sy], [sx, sy]],
    ['vlab', [gx + 0.25, gy + 0.15], [gx + 0.25, gy + 0.75], { n: o.v || 'v_{gs}' }],
    ...(o.gnd ? [['w', [gx, gy], [gx - 0.6, gy]], ['gnd', [gx - 0.6, gy]]] : []),
  ];

  window.BK3F = { F, S, RT, MS, MA, RV };

  // ================================================================ generators
  const T = (window.BK3F._test = {});
  // number pools (SI units)
  const GM = [0.5e-3, 1e-3, 2e-3, 4e-3], RDS = [20e3, 25e3, 40e3, 50e3, 100e3], RSMALL = [500, 1e3, 2e3, 5e3], RBIG = [10e3, 20e3, 50e3, 100e3];
  const dio = (g, r) => 1 / (g + 1 / r);                       // 1/g_m || r_ds
  const pnote = (pm) => (pm ? '\n\nA PMOS uses the same model: $g_mv_{gs}$ flows from its drain to its source (drawn pointing **up**, since the source is on top), so every equation is the same as for an NMOS.' : '');

  // ---------------------------------------------------------------- bk03-test: v_gs, then R, for one transistor
  const VGS_OPTS = ['$0$', '$v_t$', '$-v_t$', '$-v_s$', '$v_t - v_s$'];
  const VGS_WHEN = [
    '$v_{gs} = 0$ needs the gate and the source both still (a drain test with the source on its rail).',
    '$v_{gs} = v_t$ needs the gate at $v_t$ and the source still (a diode whose source sits on its rail).',
    '$v_{gs} = -v_t$ needs the gate still and the source **at** the test node (a source test).',
    '$v_{gs} = -v_s$ needs the gate still and a source that moves because current flows through something under it.',
    '$v_{gs} = v_t - v_s$ needs the gate on the test node (a diode) and a source that moves.',
  ];
  const VGS_CFG = {
    dr: { a: 0, fig: (pm) => F.drain({ p: pm }), look: 'drain', here: 'Here the gate is held and the source is on its rail, so $v_{gs} = 0 - 0 = 0$.' },
    src: { a: 2, fig: (pm) => F.source({ p: pm }), look: 'source', here: 'Here the gate is held (0) and the test source drives the source: $v_{gs} = 0 - v_t$.' },
    dio: { a: 1, fig: (pm) => F.diode({ p: pm }), look: 'drain (= gate)', here: 'Here gate and drain are both the test node ($v_t$) and the source is on its rail: $v_{gs} = v_t - 0$.' },
    deg: { a: 3, fig: (pm, v) => F.drain({ p: pm, rs: 'R_S', rsv: RT(v) }), look: 'drain', here: 'Here the gate is held (0) and the source sits on $R_S$, where it moves by $v_s = i_tR_S$: $v_{gs} = 0 - v_s$.' },
    srd: { a: 2, fig: (pm, v) => F.source({ p: pm, load: 'R', rdv: RT(v) }), look: 'source', here: 'Here the gate is held and the test source drives the source: $v_{gs} = 0 - v_t$. The resistor on the drain does not change that.' },
    dios: { a: 4, fig: (pm, v) => F.diode({ p: pm, rs: 'R_S', rsv: RT(v) }), look: 'drain (= gate)', here: 'Here the gate is tied to the drain, the test node ($v_t$), and the source moves by $v_s = i_tR_S$: $v_{gs} = v_t - v_s$.' },
  };
  const vgsSolve = (k, gm, rds, Rx) => {
    if (k === 'dr') return rds;
    if (k === 'src' || k === 'dio') return dio(gm, rds);
    if (k === 'deg') return rds + Rx + gm * rds * Rx;
    if (k === 'srd') return (rds + Rx) / (1 + gm * rds);
    return Rx + dio(gm, rds);                                   // dios
  };
  T.vgsSolve = vgsSolve;
  GENS.bk_mi_vgs = () => {
    const k = pick(Object.keys(VGS_CFG)), pm = Math.random() < 0.4, cf = VGS_CFG[k];
    const gm = pick(GM), rds = pick(RDS), Rx = k === 'srd' ? pick(RBIG) : pick(RSMALL);
    const ans = vgsSolve(k, gm, rds, Rx), gr = gm * rds;
    const name = pm ? 'PMOS' : 'NMOS';
    const xs = k === 'deg' || k === 'dios' ? `, $R_S = ${RT(Rx)}$` : k === 'srd' ? `, $R_D = ${RT(Rx)}$` : '';
    const rails = pm ? '$V_{DD}$ (the PMOS source rail) and the gate bias become ground' : 'The rails and the gate bias become ground';
    let kcl, res;
    if (k === 'dr') {
      kcl = '$v_{gs} = 0$, so the dependent source carries nothing (an open circuit). The test current flows through $r_{ds}$ alone: $i_t = v_t/r_{ds}$.';
      res = `R = r_{ds} = ${RT(ans)}`;
    } else if (k === 'src') {
      kcl = 'Two currents meet at the source node: $i_t$, and the device current $i_d = g_mv_{gs} + v_{ds}/r_{ds} = -g_mv_t - v_t/r_{ds}$ (drain to source). Nothing else touches the node, so $i_t = -i_d = (g_m + 1/r_{ds})\\,v_t$.';
      res = `R = \\frac{1}{g_m + 1/r_{ds}} = \\frac{1}{${MS(gm)} + ${MS(1 / rds)}} = ${RT(ans)}`;
    } else if (k === 'dio') {
      kcl = 'Gate and drain are the same node, so $v_{gs} = v_{ds} = v_t$. All of $i_t$ goes through the device: $i_t = g_mv_t + v_t/r_{ds}$.';
      res = `R = \\frac{1}{g_m + 1/r_{ds}} = \\frac{1}{${MS(gm)} + ${MS(1 / rds)}} = ${RT(ans)}`;
    } else if (k === 'deg') {
      kcl = 'All of $i_t$ flows through the device and then $R_S$, so $v_s = i_tR_S$ and $v_{gs} = -i_tR_S$. The device equation: $i_t = -g_mR_S\\,i_t + (v_t - i_tR_S)/r_{ds}$. Multiply by $r_{ds}$ and collect: $v_t = i_t\\,(r_{ds} + R_S + g_mr_{ds}R_S)$.';
      res = `R = r_{ds} + R_S + g_mr_{ds}R_S = ${RT(rds)} + ${RT(Rx)} + ${f(gr, 4)}\\times${RT(Rx)} = ${RT(ans)}`;
    } else if (k === 'srd') {
      kcl = 'The test current enters the source, flows through the device to the drain and out through $R_D$, so $v_d = i_tR_D$. The device current (drain to source) is $-i_t$: $-i_t = -g_mv_t + (i_tR_D - v_t)/r_{ds}$. Multiply by $r_{ds}$ and collect: $v_t\\,(1 + g_mr_{ds}) = i_t\\,(r_{ds} + R_D)$.';
      res = `R = \\frac{r_{ds} + R_D}{1 + g_mr_{ds}} = \\frac{${RT(rds + Rx)}}{${f(1 + gr, 4)}} = ${RT(ans)}`;
    } else {
      kcl = 'All of $i_t$ flows through the device and then $R_S$, so $v_s = i_tR_S$. Gate = drain, so $v_{gs} = v_{ds} = v_t - v_s$, and $i_t = (g_m + 1/r_{ds})(v_t - i_tR_S)$. Solve: $v_t = i_t\\big(R_S + \\tfrac{1}{g_m + 1/r_{ds}}\\big)$.';
      res = `R = R_S + \\frac{1}{g_m + 1/r_{ds}} = ${RT(Rx)} + ${RT(dio(gm, rds))} = ${RT(ans)}`;
    }
    const traps = [];
    if (k !== 'dr') traps.push({ v: rds, msg: 'That is $r_{ds}$ alone, the drain with a still gate. Check what the test voltage does to $v_{gs}$ here.' });
    if (k === 'dr') traps.push({ v: dio(gm, rds), msg: 'That is the **source** (or diode) result. At the drain, with gate and source still, $v_{gs} = 0$.' }, { v: 1 / gm, msg: 'That is $1/g_m$, a source or diode. Here $v_{gs} = 0$.' });
    if (k === 'src' || k === 'dio') traps.push({ v: 1 / gm, msg: 'That is $1/g_m$ alone; the problem gives $r_{ds}$, and it is in parallel: $1/(g_m + 1/r_{ds})$.' });
    if (k === 'deg') traps.push({ v: rds + Rx, msg: '$r_{ds} + R_S$ leaves out the feedback: the current through $R_S$ lowers $v_{gs}$, which adds $g_mr_{ds}R_S$.' }, { v: gm * rds * Rx, msg: '$g_mr_{ds}R_S$ is only the largest term; add $r_{ds} + R_S$.' });
    if (k === 'srd') traps.push({ v: dio(gm, rds), msg: 'That ignores $R_D$. The drain is not at incremental ground: it moves by $i_tR_D$.' }, { v: Rx + 1 / gm, msg: '$R_D$ is not seen in full from the source: it is divided by $1 + g_mr_{ds}$.' });
    if (k === 'dios') traps.push({ v: rds + Rx + gm * rds * Rx, msg: 'That magnifies $R_S$ as if the gate were held. Here the gate rides with the drain, so the diode simply adds $\\tfrac1{g_m}\\parallel r_{ds}$ in series with $R_S$.' }, { v: dio(gm, rds), msg: 'You left out $R_S$, which is in series.' });
    return {
      fig: cf.fig(pm, Rx),
      q: `${name}, $g_m = ${MS(gm)}$, $r_{ds} = ${RT(rds)}$${xs}. A test source $v_t$ drives the ${cf.look} at the arrow; triangles are incremental grounds. First name $v_{gs}$ ($v_s$ is the small-signal voltage of the source node), then find $R$ (keep $r_{ds}$).`,
      parts: [
        { lbl: '1. $v_{gs} =$', mc: VGS_OPTS, a: cf.a, why: VGS_OPTS.map((_, j) => (j === cf.a ? null : `${VGS_WHEN[j]} ${cf.here}`)) },
        BK.res('R', ans, undefined, traps),
      ],
      hints: ['Write $v_{gs} = v_g - v_s$ with small-signal voltages: 0 at every rail and every held gate.', 'Then write KCL for the current the test source pushes in, using $i_d = g_mv_{gs} + v_{ds}/r_{ds}$ (drain to source).'],
      sol: `**Small-signal circuit.** ${rails}; the transistor becomes $g_mv_{gs}$ (drain to source) in parallel with $r_{ds}$.\n\n**$v_{gs}$.** ${cf.here}\n\n**KCL.** ${kcl}\n\n$$${res}$$${pnote(pm)}`,
      _t: { g: 'vgs', k, gm, rds, Rx, ans },
    };
  };

  // ---------------------------------------------------------------- bk03-gate: input resistance = the bias network
  GENS.bk_mi_gate = () => {
    const k = pick(['div', 'rg', 'divrg', 'sig']), sf = Math.random() < 0.5;
    const R1 = pick([200e3, 300e3, 500e3, 1e6, 2e6]), R2 = pick([100e3, 200e3, 300e3, 500e3, 1e6]), RG = pick([100e3, 500e3, 1e6, 2e6]), Rsig = pick([10e3, 50e3, 100e3]);
    const stage = sf ? [['rail', [4, 0]], ['nmos', [4, 1], { n: 'M_1' }], ['w', [4, 2], [4.8, 2]], ['term', [4.8, 2], { n: 'v_{out}', side: 'r' }], ['R', [4, 2], [4, 3.2], { n: 'R_S' }], ['gnd', [4, 3.2]]]
      : [['rail', [4, -1.2]], ['R', [4, -1.2], [4, 0], { n: 'R_D' }], ['w', [4, 0], [4.8, 0]], ['term', [4.8, 0], { n: 'v_{out}', side: 'r' }], ['nmos', [4, 1], { n: 'M_1' }], ['R', [4, 2], [4, 3.2], { n: 'R_S' }], ['gnd', [4, 3.2]]];
    let net, ans, how, traps;
    const par12 = par(R1, R2);
    if (k === 'div') {
      net = [['rail', [1.6, -1.2]], ['R', [1.6, -1.2], [1.6, 1], { n: 'R_1', s: RT(R1), side: 'l' }], ['R', [1.6, 1], [1.6, 3.2], { n: 'R_2', s: RT(R2), side: 'l' }], ['gnd', [1.6, 3.2]],
        ['w', [1.6, 1], [3, 1]], ['C', [0.4, 1], [1.6, 1], { n: 'C_{in}' }], ['w', [0.4, 1], [0, 1]], lookL([0, 1], 'R_{in}')];
      ans = par12;
      how = `With $V_{DD}$ at ground, $R_1$ and $R_2$ both run from the gate node to ground; the gate adds nothing.\n$$R_{in} = R_1\\parallel R_2 = \\frac{${RT(R1)}\\times${RT(R2)}}{${RT(R1)} + ${RT(R2)}} = ${RT(ans)}$$`;
      traps = [{ v: R1 + R2, msg: '$V_{DD}$ is ground for signals, so $R_1$ and $R_2$ are both branches from the gate node to ground: in parallel, not in series.' }, { v: R2, msg: '$R_1$ goes to $V_{DD}$, which is an incremental ground: it is a branch too.' }];
    } else if (k === 'rg') {
      net = [['R', [1.6, 1], [1.6, 2.2], { n: 'R_G', s: RT(RG), side: 'l' }], ['V', [1.6, 2.2], [1.6, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [1.6, 3.4]],
        ['w', [1.6, 1], [3, 1]], ['C', [0.4, 1], [1.6, 1], { n: 'C_{in}' }], ['w', [0.4, 1], [0, 1]], lookL([0, 1], 'R_{in}')];
      ans = RG;
      how = `$V_B$ is a fixed voltage, so it becomes ground: $R_G$ runs from the gate node to ground. The gate adds nothing, and nothing on the drain or source side reaches the input.\n$$R_{in} = R_G = ${RT(ans)}$$`;
      traps = [];
    } else if (k === 'divrg') {
      net = [['rail', [1.2, -1.2]], ['R', [1.2, -1.2], [1.2, 1], { n: 'R_1', s: RT(R1), side: 'l' }], ['R', [1.2, 1], [1.2, 3.2], { n: 'R_2', s: RT(R2), side: 'l' }], ['gnd', [1.2, 3.2]],
        ['node', [1.2, 1], { n: 'M', side: 'ar' }], ['R', [1.2, 1], [2.6, 1], { n: 'R_G', s: RT(RG), side: 'b' }], ['w', [2.6, 1], [3, 1]], ['C', [0, 1], [1.2, 1], { n: 'C_{in}' }], ['w', [0, 1], [-0.4, 1]], lookL([-0.4, 1], 'R_{in}')];
      ans = par12;
      how = `The input lands on node $M$. From $M$: $R_1$ to ground (it went to $V_{DD}$), $R_2$ to ground, and $R_G$ leading to the gate. The gate takes no current, so $R_G$ carries none: that branch is open.\n$$R_{in} = R_1\\parallel R_2 = ${RT(ans)}$$`;
      traps = [{ v: par12 + RG, msg: '$R_G$ leads only to the gate, which takes no current, so $R_G$ carries nothing and adds nothing.' }, { v: R1 + R2, msg: 'Parallel, not series: both divider resistors go from $M$ to (incremental) ground.' }];
    } else {
      net = [['R', [2.2, 1], [2.2, 2.2], { n: 'R_G', s: RT(RG), side: 'l' }], ['V', [2.2, 2.2], [2.2, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [2.2, 3.4]], ['w', [2.2, 1], [3, 1]],
        ['R', [0.8, 1], [2.2, 1], { n: 'R_{sig}', s: RT(Rsig) }], ['w', [0.8, 1], [0.4, 1]], lookL([0.4, 1], 'R_{in}')];
      ans = Rsig + RG;
      how = `From the input terminal the test current must pass through $R_{sig}$; at the gate node it can only continue through $R_G$ to $V_B$ (ground), because the gate takes nothing. Series path:\n$$R_{in} = R_{sig} + R_G = ${RT(Rsig)} + ${RT(RG)} = ${RT(ans)}$$`;
      traps = [{ v: par(Rsig, RG), msg: '$R_{sig}$ and $R_G$ carry the same current (the gate takes none): they are in series.' }, { v: RG, msg: 'You left out $R_{sig}$: the test current flows through it first.' }];
    }
    return {
      fig: [...stage, ...net],
      q: `A ${sf ? 'source follower' : 'common-source stage'} with its gate bias network (capacitors are large). Find the small-signal resistance $R_{in}$ at the arrow. The transistor has $g_m = 2\\,\\text{mS}$, $r_{ds} = 50\\kO$; $R_D$ and $R_S$ are a few kΩ.`,
      parts: [BK.res('R_{in}', ans, undefined, traps)],
      hints: ['$V_{DD}$ and $V_B$ are incremental grounds; large capacitors are shorts.', 'The gate is an open circuit: list the resistors that carry current from the input node to ground.'],
      sol: `**Recognize it:** the signal arrives at a gate, which takes no current. Only the bias resistors can carry current.\n\n${how}\n\nNone of $g_m$, $r_{ds}$, $R_D$ or $R_S$ appears: they sit on the far side of an open circuit.`,
      _t: { g: 'gate', k, sf, R1, R2, RG, Rsig, ans },
    };
  };

  // ---------------------------------------------------------------- bk03-drain: r_ds from the bias; loads; mirrors
  const LAMS = [0.02, 0.025, 0.04, 0.05, 0.1], IDS = [0.1e-3, 0.2e-3, 0.25e-3, 0.4e-3, 0.5e-3, 1e-3];
  const lamT = (l) => `${f(l, 3)}\\,\\text{V}^{-1}`;
  GENS.bk_mi_drain = () => {
    const k = pick(['one', 'one', 'cs', 'mir']);
    if (k === 'one') {
      const pm = Math.random() < 0.5, lam = pick(LAMS), I = pick(IDS), ans = 1 / (lam * I);
      return {
        fig: F.drain({ p: pm, look: 'R' }),
        q: `A ${pm ? 'PMOS' : 'NMOS'} current source (gate on a fixed bias, source on its rail) carries $I_D = ${MA(I)}$ with $\\lambda = ${lamT(lam)}$. Find the resistance looking into its drain.`,
        parts: [BK.res('R', ans, undefined, [{ v: lam / I, msg: '$r_{ds} = 1/(\\lambda I_D)$: multiply $\\lambda$ by the current, then invert.' }])],
        hints: ['Gate and source are both still, so $v_{gs} = 0$ and the dependent source is open.', '$r_{ds} = 1/(\\lambda I_D)$.'],
        sol: `Gate held and source on a rail: $v_{gs} = 0$, so only $r_{ds}$ connects the drain to ground.\n$$R = r_{ds} = \\frac{1}{\\lambda I_D} = \\frac{1}{(${f(lam, 3)}\\,\\text{V}^{-1})(${MA(I)})} = ${RT(ans)}$$${pnote(pm)}`,
        _t: { g: 'drain', k, lam, I, ans },
      };
    }
    if (k === 'cs') {
      const I = pick(IDS), ln = pick(LAMS), lp = pick(LAMS), r1 = 1 / (ln * I), r2 = 1 / (lp * I), ans = par(r1, r2);
      return {
        fig: F.node(['drain', { n: 'M_2' }], ['drain', { n: 'M_1' }], { look: 'R_{out}' }),
        q: `A common-source stage: $M_1$ (NMOS, $\\lambda_n = ${lamT(ln)}$) with a PMOS current-source load $M_2$ ($\\lambda_p = ${lamT(lp)}$), both at $I_D = ${MA(I)}$. With the input off (the triangle on $M_1$'s gate), find $R_{out}$.`,
        parts: [BK.res('R_{out}', ans, undefined, [{ v: r1 + r2, msg: 'Both transistors connect the output to an incremental ground: they are in parallel, not in series.' }, { v: r1, msg: 'That is $r_{ds1}$ alone; $M_2$ is a branch too.' }, { v: r2, msg: 'That is $r_{ds2}$ alone; $M_1$ is a branch too.' }])],
        hints: ['Each transistor has a still gate and its source on a rail: each one is just its $r_{ds}$.', '$R_{out} = r_{ds1}\\parallel r_{ds2}$.'],
        sol: `Input off: both gates are still and both sources sit on rails, so each transistor is a drain with $v_{gs} = 0$: just its $r_{ds}$.\n$$r_{ds1} = \\frac{1}{\\lambda_nI_D} = ${RT(r1)},\\qquad r_{ds2} = \\frac{1}{\\lambda_pI_D} = ${RT(r2)}$$\nOne goes up to $V_{DD}$ (ground), one down to ground: parallel.\n$$R_{out} = r_{ds1}\\parallel r_{ds2} = ${RT(ans)}$$`,
        _t: { g: 'drain', k, I, ln, lp, ans },
      };
    }
    const Iref = pick([0.05e-3, 0.1e-3, 0.2e-3]), m = pick([1, 2, 4, 5]), lam = pick(LAMS), I2 = m * Iref, ans = 1 / (lam * I2);
    return {
      fig: [['rail', [1, -0.4]], ['I', [1, -0.4], [1, 0.8], { n: 'I_{REF}', side: 'l' }], ['w', [1, 0.8], [1, 1]], ['nmos', [1, 2], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 3]],
        ['nmos', [3, 2], { n: 'M_2' }], ['gnd', [3, 3]], ['w', [3, 1], [3, 0.4]], lookDn([3, 0.4], 'R_{out}')],
      q: `A current mirror: $I_{REF} = ${MA(Iref)}$ into the diode $M_1$; $M_2$ is ${m === 1 ? 'identical to $M_1$' : `$${m}$ times wider than $M_1$`}. $\\lambda = ${lamT(lam)}$. Find the resistance looking into $M_2$'s drain.`,
      parts: [BK.res('R_{out}', ans, undefined, m > 1 ? [{ v: 1 / (lam * Iref), msg: `$M_2$ carries $${m}I_{REF}$, not $I_{REF}$: use its own current in $r_{ds}$.` }] : [])],
      hints: ['First the bias: a mirror copies the current in proportion to $W/L$.', 'Nothing pushes signal current into the shared gate node, so $M_2$ has a still gate: $R_{out} = r_{ds2}$.'],
      sol: `**Bias.** Same $V_{GS}$, ${m} times the width: $I_{D2} = ${m}\\times${MA(Iref)} = ${MA(I2)}$.\n\n**Small signal.** The gate node touches $I_{REF}$ (open), the diode $M_1$, and $M_2$'s gate (no current). A test source on $M_2$'s drain cannot push current into that node, so $v_{g2} = 0$: $M_2$ is a drain with a still gate.\n$$R_{out} = r_{ds2} = \\frac{1}{\\lambda I_{D2}} = \\frac{1}{(${f(lam, 3)})(${MA(I2)})} = ${RT(ans)}$$`,
      _t: { g: 'drain', k, Iref, m, lam, ans },
    };
  };

  // ---------------------------------------------------------------- bk03-source: looking into a source, gate still
  GENS.bk_mi_src = () => {
    const ld = pick(['rail', 'R', 'R', 'M', 'I']), pm = Math.random() < 0.4, gm = pick(GM), rds = pick(RDS), gr = gm * rds;
    const dev = pm ? 'PMOS' : 'NMOS';
    const fig = F.source({ p: pm, load: ld, rdv: undefined });
    if (ld === 'I') {
      const ans2 = 2 * rds / (1 + gr);
      return {
        fig,
        q: `${dev} $M_1$: $g_m = ${MS(gm)}$, $r_{ds} = ${RT(rds)}$, gate held. Its drain hangs on an **ideal** current source $I_B$. (1) What do you see looking into its source? (2) The ideal source is replaced by a transistor current source with the same $r_{ds}$ as $M_1$. Find the resistance now.`,
        parts: [
          { lbl: '1. Looking into the source:', mc: ['$\\infty$', '$1/g_m$', '$\\tfrac{1}{g_m}\\parallel r_{ds}$', '$2/g_m$'], a: 0,
            why: [null, 'That needs a path for the current at the drain. $I_B$ is open, so no current can enter the source at all.', 'That is the source with its drain on a rail. Here the drain has no path to ground.', 'That is the case of part 2 (a real current source with $r_{ds}$), not of an ideal one.'] },
          BK.res('R', ans2, undefined, [{ v: dio(gm, rds), msg: 'That ignores the load: $r_{ds2}$ on the drain adds $r_{ds2}/(1 + g_mr_{ds})$.' }, { v: rds, msg: 'That is a drain resistance, not a source resistance.' }]),
        ],
        hints: ['Whatever enters the source must leave through the drain. What else is at the drain?', 'Part 2: $R_S = (r_{ds} + R_D)/(1 + g_mr_{ds})$ with $R_D = r_{ds}$.'],
        sol: `**1.** The gate takes no current, so the test current must leave through the drain; there the only other element is $I_B$, an open circuit. No current can flow: $R = \\infty$. (Formula: $R_D\\to\\infty$.)\n\n**2.** With $R_D = r_{ds}$:\n$$R = \\frac{r_{ds} + r_{ds}}{1 + g_mr_{ds}} = \\frac{${RT(2 * rds)}}{${f(1 + gr, 4)}} = ${RT(ans2)}\\approx\\frac{2}{g_m}$$${pnote(pm)}`,
        _t: { g: 'src', ld, gm, rds, RD: rds, ans: ans2 },
      };
    }
    const RD = ld === 'rail' ? 0 : ld === 'R' ? pick([5e3, 10e3, 20e3, 50e3, 100e3, 200e3, 500e3]) : pick(RDS);
    const ans = (rds + RD) / (1 + gr);
    const load = ld === 'rail' ? `its drain is on ${pm ? 'ground' : '$V_{DD}$'}` : ld === 'R' ? `$R_D = ${RT(RD)}$ connects its drain to ${pm ? 'ground' : '$V_{DD}$'}` : `its drain load is the current source $M_2$ with $r_{ds2} = ${RT(RD)}$`;
    const traps = [{ v: rds, msg: 'That is $r_{ds}$, the drain resistance. At the source, $v_{gs} = -v_t$ and the strong handle acts.' }];
    if (ld === 'rail') traps.push({ v: 1 / gm, msg: 'Close: that is $1/g_m$ alone. The problem gives $r_{ds}$: $1/(g_m + 1/r_{ds})$.' });
    else traps.push({ v: dio(gm, rds), msg: 'That ignores the drain load: the drain moves by $i_tR_D$, which adds $R_D/(1 + g_mr_{ds})$.' }, { v: RD + 1 / gm, msg: 'The drain resistance is not seen in full from the source: it is divided by $1 + g_mr_{ds}$.' });
    return {
      fig,
      q: `${dev} $M_1$: $g_m = ${MS(gm)}$, $r_{ds} = ${RT(rds)}$, gate held; ${load}. Find the resistance looking into the source of $M_1$ (keep $r_{ds}$).`,
      parts: [BK.res('R_S', ans, undefined, traps)],
      hints: ['Gate held: $v_{gs} = -v_t$. The test current flows through the device and out through whatever is on the drain.', '$R_S = \\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$, with $R_D = 0$ for a drain on a rail.'],
      sol: `**Recognize it:** a source with a held gate. $g_mr_{ds} = (${MS(gm)})(${RT(rds)}) = ${f(gr, 4)}$.\n\n${ld === 'rail' ? `The drain is at incremental ground ($R_D = 0$):\n$$R_S = \\frac{1}{g_m + 1/r_{ds}} = \\frac{r_{ds}}{1 + g_mr_{ds}} = \\frac{${RT(rds)}}{${f(1 + gr, 4)}} = ${RT(ans)}$$` : `The test current leaves through ${ld === 'R' ? '$R_D$' : '$M_2$ (a drain with a still gate: $r_{ds2}$)'}, so the drain moves by $i_tR_D$ with $R_D = ${RT(RD)}$:\n$$R_S = \\frac{r_{ds} + R_D}{1 + g_mr_{ds}} = \\frac{${RT(rds + RD)}}{${f(1 + gr, 4)}} = ${RT(ans)}$$\nCompare $1/g_m = ${RT(1 / gm)}$: the drain load adds $R_D/(1 + g_mr_{ds}) = ${RT(RD / (1 + gr))}$.`}${pnote(pm)}`,
      _t: { g: 'src', ld, gm, rds, RD, ans },
    };
  };

  // ---------------------------------------------------------------- bk03-diode: NMOS / PMOS diodes, sizes, series R
  GENS.bk_mi_diode = () => {
    const pm = Math.random() < 0.5, useSize = Math.random() < 0.5, withR = Math.random() < 0.6;
    const withRds = !useSize || Math.random() < 0.5;
    const muc = pm ? 50e-6 : 100e-6;
    let gm, wl, I;
    if (useSize) { wl = pick([10, 20, 25, 40, 50, 100]); I = pick([0.1e-3, 0.2e-3, 0.25e-3, 0.4e-3, 0.5e-3]); gm = Math.sqrt(2 * muc * wl * I); } else gm = pick(GM);
    const rds = withRds ? pick(RDS) : Infinity;
    const Rs = withR ? pick([500, 1e3, 2e3, 5e3]) : 0;
    const top = !pm && withR && Math.random() < 0.35;
    const rd = isFinite(rds) ? dio(gm, rds) : 1 / gm, ans = Rs + rd;
    const fig = pm ? F.diode({ p: 1, rs: withR ? 'R' : undefined, rsv: withR ? RT(Rs) : undefined, look: 'R_{in}' })
      : top ? F.diode({ rtop: 'R', rtv: RT(Rs), look: 'R_{in}' }) : F.diode({ rs: withR ? 'R' : undefined, rsv: withR ? RT(Rs) : undefined, look: 'R_{in}' });
    const devTxt = useSize ? `$W/L = ${wl}$, carrying $I_D = ${MA(I)}$ ($\\mu_${pm ? 'p' : 'n'}C_{ox} = ${pm ? 50 : 100}\\,\\mu\\text{A/V}^2$)` : `$g_m = ${MS(gm)}$`;
    const rTxt = withR ? (pm ? `; $R = ${RT(Rs)}$ connects its source to $V_{DD}$` : top ? `; $R = ${RT(Rs)}$ sits between the test node and its drain` : `; $R = ${RT(Rs)}$ connects its source to ground`) : '';
    const traps = [];
    if (isFinite(rds)) traps.push({ v: rds + Rs, msg: 'That treats the transistor as $r_{ds}$, as if its gate were held. Here the gate rides with the drain.' }, { v: Rs + 1 / gm, msg: 'Close: that drops $r_{ds}$. The problem gives it: use $1/(g_m + 1/r_{ds})$.' });
    if (withR) traps.push({ v: rd, msg: `You left out $R$, which carries the same current: it adds in series.` });
    if (withR && isFinite(rds)) traps.push({ v: rds + Rs + gm * rds * Rs, msg: 'That magnifies $R$ as if the gate were held. The diode\'s gate moves with its drain: no magnification, $R$ just adds.' });
    if (useSize && pm) traps.push({ v: Rs + 1 / Math.sqrt(2 * 100e-6 * wl * I), msg: 'For a PMOS use $\\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2$.' });
    const gmLine = useSize ? `$g_m = \\sqrt{2\\mu C_{ox}(W/L)I_D} = \\sqrt{2(${pm ? 50 : 100}\\,\\mu\\text{A/V}^2)(${wl})(${MA(I)})} = ${MS(gm)}$.\n\n` : '';
    return {
      fig,
      q: `A diode-connected ${pm ? 'PMOS (source toward $V_{DD}$)' : 'NMOS'} with ${devTxt}${isFinite(rds) ? `, $r_{ds} = ${RT(rds)}$` : ' (ignore $r_{ds}$)'}${rTxt}. Find the small-signal resistance $R_{in}$ at the arrow.`,
      parts: [BK.res('R_{in}', ans, undefined, traps)],
      hints: ['Gate and drain are one node, so $v_{gs} = v_{ds}$: the transistor is a two-terminal resistor $\\tfrac{1}{g_m}\\parallel r_{ds}$.', 'A resistor in series with it simply adds (no magnification: the gate is not held).'],
      sol: `${gmLine}**The diode.** Gate tied to drain: $v_{gs} = v_{ds}$, so the transistor is a resistor ${isFinite(rds) ? `$\\tfrac{1}{g_m}\\parallel r_{ds} = \\dfrac{1}{${MS(gm)} + ${MS(1 / rds)}} = ${RT(rd)}$` : `$1/g_m = ${RT(rd)}$`}.\n\n${withR ? `**The resistor** carries the same current (the gate takes none), so it adds in series:\n$$R_{in} = R + ${isFinite(rds) ? '\\tfrac{1}{g_m}\\parallel r_{ds}' : '\\tfrac{1}{g_m}'} = ${RT(Rs)} + ${RT(rd)} = ${RT(ans)}$$` : `$$R_{in} = ${RT(ans)}$$`}${pnote(pm)}`,
      _t: { g: 'diode', pm, gm, rds: isFinite(rds) ? rds : null, Rs, top, wl: useSize ? wl : null, I: useSize ? I : null, ans },
    };
  };

  // ---------------------------------------------------------------- bk03-degen: R_S under a held gate (resistor, diode, r_ds)
  GENS.bk_mi_degen = () => {
    const kind = pick(['R', 'R', 'diode', 'rds']), pm = Math.random() < 0.4, gm = pick(GM), rds = pick(RDS), gr = gm * rds;
    let Rs, fig, under, extra = '';
    const top = pm ? [['rail', [1, -2.4]]] : [];
    if (kind === 'R') {
      Rs = pick([200, 500, 1e3, 2e3, 5e3, 10e3]);
      fig = F.drain({ p: pm, rs: 'R_S', rsv: RT(Rs), look: pm ? 'R_{UP}' : 'R_{DN}' });
      under = `$R_S = ${RT(Rs)}$ between its source and ${pm ? '$V_{DD}$' : 'ground'}`;
    } else {
      const g2 = pick(GM), r2 = pick(RDS);
      Rs = kind === 'diode' ? dio(g2, r2) : r2;
      // M_2 sits between M_1's source and the rail: a diode, or a held-gate current source
      fig = pm ? [...top, ['pmos', [1, -1], { n: 'M_2', dc: kind === 'diode' }], ...(kind === 'rds' ? [['acg', [0, -1]]] : []), ['pmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4], 'R_{UP}')]
        : [['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], 'R_{DN}'), ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['nmos', [1, 3], { n: 'M_2', dc: kind === 'diode' }], ...(kind === 'rds' ? [['acg', [0, 3]]] : []), ['gnd', [1, 4]]];
      if (pm) fig = fig.map((e) => (e[0] === 'rail' ? ['rail', [1, -2]] : e));
      under = `under its source ${kind === 'diode' ? 'a diode-connected' : 'a held-gate'} ${pm ? 'PMOS' : 'NMOS'} $M_2$ with $g_{m2} = ${MS(g2)}$, $r_{ds2} = ${RT(r2)}$`;
      extra = kind === 'diode' ? `**What is under the source.** $M_2$ is a diode: $R_S = \\tfrac{1}{g_{m2}}\\parallel r_{ds2} = ${RT(Rs)}$.\n\n` : `**What is under the source.** $M_2$ has its gate held and its far end on a rail: it is just $r_{ds2}$, so $R_S = ${RT(Rs)}$ (this is a cascode).\n\n`;
      Object.assign(T, { lastDeg: { g2, r2 } });
    }
    const ans = rds + Rs + gr * Rs;
    const traps = [{ v: rds + Rs, msg: '$r_{ds} + R_S$ leaves out the feedback: the current through $R_S$ lowers $v_{gs}$, which adds $g_mr_{ds}R_S$.' }, { v: rds, msg: 'That ignores what is under the source.' }];
    if (Math.abs(gr * Rs - ans) > 0.03 * ans) traps.push({ v: gr * Rs, msg: '$g_mr_{ds}R_S$ alone is too small here ($g_mR_S$ is not $\\gg1$): keep $r_{ds}(1 + g_mR_S) + R_S$.' });
    return {
      fig,
      q: `${pm ? 'PMOS' : 'NMOS'} $M_1$: $g_m = ${MS(gm)}$, $r_{ds} = ${RT(rds)}$, gate held; ${under}. Find the resistance looking into the drain of $M_1$.`,
      parts: [BK.res(pm ? 'R_{UP}' : 'R_{DN}', ans, undefined, traps)],
      hints: ['First reduce whatever is under the source to one resistance $R_S$ (a diode is $\\tfrac{1}{g_m}\\parallel r_{ds}$; a held-gate transistor is $r_{ds}$).', 'Then $R = r_{ds} + R_S + g_mr_{ds}R_S$ for the transistor you look into.'],
      sol: `${extra}**Degeneration.** The gate of $M_1$ is held and all of $i_t$ flows through $R_S$, so $v_s = i_tR_S$ and $v_{gs} = -i_tR_S$; the transistor fights the change. With $g_mr_{ds} = ${f(gr, 4)}$:\n$$R = r_{ds} + R_S + g_mr_{ds}R_S = ${RT(rds)} + ${RT(Rs)} + ${f(gr, 4)}\\times${RT(Rs)} = ${RT(ans)}$$\nCheck: $r_{ds}(1 + g_mR_S) = ${RT(rds * (1 + gm * Rs))}$.${pnote(pm)}`,
      _t: { g: 'degen', kind, pm, gm, rds, Rs, ...(kind === 'R' ? {} : T.lastDeg), ans },
    };
  };
})();

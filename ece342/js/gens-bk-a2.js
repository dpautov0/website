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

  // ================================================================ generators (added below, one per result)
  const T = (window.BK3F._test = {});
  void T; void pick; void par;
})();

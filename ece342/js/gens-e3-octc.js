/* gens-e3-octc.js — Unit 15 drills: open-circuit time constants. Eight canonical circuits (CS, CE, degenerated CS,
   CG, cascode, source follower, CB, emitter follower), each drawn with its transistor capacitances. For each capacitor:
   the resistance it sees with the input source zeroed and every other capacitor removed, its time constant, and
   the bandwidth estimate 1/sum(tau). Every formula below was checked against an exact complex nodal solve
   (test-source R_jo for each capacitor, and the true -3 dB frequency) in the build scratchpad.
   Exposes window.E3OC = { FIG, TOPO, capFig } for the Unit 15 lessons. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, par = U.par;
  const GENS = window.GENS;
  const { KO, MS, resTeX, resPart } = E3;
  const pF = (c) => `${f(c * 1e12, 3)}\\,\\text{pF}`;
  const ns = (t) => `${f(t * 1e9, 3)}\\,\\text{ns}`;
  const kOs = (r) => `${f(r / 1000, 3)}\\kO`;
  const INF = Infinity;
  // resistance looking into a source (gate held) with R_D on the drain; r_ds = infinity gives 1/g_m
  const srcR = (gm, rds, RD) => (rds === INF ? 1 / gm : (rds + RD) / (1 + gm * rds));

  // ================================================================ figures
  // o.hi: the key of the capacitor to box; o.v: shown values {RS, RL, RG, Cgs, ...} (TeX); o.noC: leave capacitors out
  const capL = (o, key, name, side) => ({ n: o.hi === key ? `\\boxed{${name}}` : name, s: o.v && o.v[key], side });
  const resL = (o, key, name, side) => ({ n: name, s: o.v && o.v[key], side });
  const vinAt = (x, y) => [['Vac', [x, y], [x, y + 1], { n: 'v_{in}', side: 'l' }], ['gnd', [x, y + 1]]];
  // input network on the left: v_in, a series resistor, then the control node at (2, y)
  const inNet = (o, y, rk, rn) => [...vinAt(-0.6, y + 0.5), ['w', [-0.6, y + 0.5], [-0.6, y]], ['R', [-0.6, y], [0.8, y], resL(o, rk, rn)], ['w', [0.8, y], [2, y]]];
  const outT = (x, y, n = 'v_{out}') => ['term', [x, y], { n, side: 'r' }];

  const FIG = {
    // common source: C_gs gate-ground, C_gd gate-drain (the bridge), C_L drain-ground
    cs: (o = {}, dev = 'nmos') => {
      const b = dev === 'npn', g = b ? ['C_\\pi', 'C_\\mu'] : ['C_{gs}', 'C_{gd}'], k = b ? ['Cpi', 'Cmu'] : ['Cgs', 'Cgd'];
      return [
        ...inNet(o, 1, 'RS', 'R_S'), [dev, [3, 1], {}], ['gnd', [3, 2]],
        ['rail', [3, -2]], ['R', [3, -2], [3, -0.6], resL(o, 'RL', 'R_L')], ['w', [3, -0.6], [3, 0]],
        ...(o.noC ? [] : [
          ['C', [1.1, 1], [1.1, 2.4], capL(o, k[0], g[0], 'l')], ['gnd', [1.1, 2.4]],
          ['w', [1.6, 1], [1.6, -0.6]], ['C', [1.6, -0.6], [3, -0.6], capL(o, k[1], g[1])],
          ['C', [4, 0], [4, 1.4], capL(o, 'CL', 'C_L')], ['gnd', [4, 1.4]],
        ]),
        ['w', [3, 0], [4.8, 0]], outT(4.8, 0),
      ];
    },
    ce: (o = {}) => FIG.cs(o, 'npn'),
    // common source with source degeneration: R_G at the gate, R_S under the source; C_gs bridges gate and source
    csdeg: (o = {}) => [
      ...inNet(o, 1, 'RG', 'R_G'), ['nmos', [3, 1], {}],
      ['w', [3, 2], [3, 2.6]], ['R', [3, 2.6], [3, 3.9], resL(o, 'RS', 'R_S')], ['gnd', [3, 3.9]],
      ['rail', [3, -2]], ['R', [3, -2], [3, -0.6], resL(o, 'RL', 'R_L')], ['w', [3, -0.6], [3, 0]],
      ...(o.noC ? [] : [
        ['C', [1.1, 1], [1.1, 2.6], capL(o, 'Cgs', 'C_{gs}', 'l')], ['w', [1.1, 2.6], [3, 2.6]],
        ['w', [1.6, 1], [1.6, -0.6]], ['C', [1.6, -0.6], [3, -0.6], capL(o, 'Cgd', 'C_{gd}')],
        ['C', [4, 0], [4, 1.4], capL(o, 'CL', 'C_L')], ['gnd', [4, 1.4]],
      ]),
      ['w', [3, 0], [4.8, 0]], outT(4.8, 0),
    ],
    // common gate: input into the source through R_S; the gate is an incremental ground, so C_gs hangs from the source
    // to the gate's ground and C_gd from the drain to it
    cg: (o = {}, dev = 'nmos') => {
      const b = dev === 'npn', g = b ? ['C_\\pi', 'C_\\mu'] : ['C_{gs}', 'C_{gd}'], k = b ? ['Cpi', 'Cmu'] : ['Cgs', 'Cgd'];
      return [
        [dev, [3, 1], {}], ['acg', [2, 1]],
        ['w', [3, 2], [3, 2.6]], ['R', [0.8, 2.6], [3, 2.6], resL(o, 'RS', 'R_S', 'b')], ...vinAt(0.2, 2.6), ['w', [0.2, 2.6], [0.8, 2.6]],
        ['rail', [3, -1.6]], ['R', [3, -1.6], [3, 0], resL(o, 'RL', 'R_L')],
        ...(o.noC ? [] : [
          ['C', [3, 2.6], [3, 3.9], capL(o, k[0], g[0])], ['acg', [3, 3.9]],
          ['C', [3.9, 0], [3.9, 1.3], capL(o, k[1], g[1])], ['acg', [3.9, 1.3]],
          ['C', [5.1, 0], [5.1, 1.3], capL(o, 'CL', 'C_L')], ['gnd', [5.1, 1.3]],
        ]),
        ['w', [3, 0], [6, 0]], outT(6, 0),
      ];
    },
    cb: (o = {}) => FIG.cg(o, 'npn'),
    // NMOS cascode: M1 (input) under M2 (gate held); node X between them
    casc: (o = {}) => [
      ...inNet(o, 3, 'RS', 'R_S'), ['nmos', [3, 3], { n: 'M_1' }], ['gnd', [3, 4]],
      ['nmos', [3, 1], { n: 'M_2' }], ['acg', [2, 1]], ['txt', [3.6, 1.78], '$X$'],
      ['rail', [3, -1.6]], ['R', [3, -1.6], [3, 0], resL(o, 'RL', 'R_L')],
      ...(o.noC ? [] : [
        ['C', [1.1, 3], [1.1, 4.4], capL(o, 'Cgs1', 'C_{gs1}', 'l')], ['gnd', [1.1, 4.4]],
        ['C', [1.6, 3], [1.6, 2], capL(o, 'Cgd1', 'C_{gd1}')], ['w', [1.6, 2], [3, 2]],
        ['w', [3, 2], [4.4, 2]], ['C', [4.4, 2], [4.4, 3.3], capL(o, 'Cgs2', 'C_{gs2}')], ['acg', [4.4, 3.3]],
        ['C', [3.9, 0], [3.9, 1.2], capL(o, 'Cgd2', 'C_{gd2}')], ['acg', [3.9, 1.2]],
        ['C', [5.2, 0], [5.2, 1.2], capL(o, 'CL', 'C_L')], ['gnd', [5.2, 1.2]],
      ]),
      ['w', [3, 0], [6, 0]], outT(6, 0),
    ],
    // source / emitter follower: drain at V_DD (incremental ground), output at the source
    sf: (o = {}, dev = 'nmos') => {
      const b = dev === 'npn', g = b ? ['C_\\pi', 'C_\\mu'] : ['C_{gs}', 'C_{gd}'], k = b ? ['Cpi', 'Cmu'] : ['Cgs', 'Cgd'];
      return [
        ...inNet(o, 1, 'RS', 'R_S'), [dev, [3, 1], {}], ['w', [3, 0], [3, -0.6]], ['rail', [3, -0.6]],
        ['w', [3, 2], [3, 2.6]], ['R', [3, 2.6], [3, 3.9], resL(o, 'RL', 'R_L')], ['gnd', [3, 3.9]],
        ...(o.noC ? [] : [
          ['C', [1.1, 1], [1.1, 2.6], capL(o, k[0], g[0], 'l')], ['w', [1.1, 2.6], [3, 2.6]],
          ['C', [1.6, 1], [1.6, -0.6], capL(o, k[1], g[1], 'l')], ['w', [1.6, -0.6], [3, -0.6]],
          ['C', [4, 2.6], [4, 3.9], capL(o, 'CL', 'C_L')], ['gnd', [4, 3.9]],
        ]),
        ['w', [3, 2.6], [4.8, 2.6]], outT(4.8, 2.6),
      ];
    },
    ef: (o = {}) => FIG.sf(o, 'npn'),
  };

  // ================================================================ the eight circuits
  // Each capacitor: R(p) exact (r_ds / r_o may be Infinity), sym = the answer in TeX with r_ds / r_o ignored,
  // kind 'gnd' (node to ground) or 'bridge', why = the one-line reason, slips = [TeX, message] wrong answers.
  const TOPO = {
    cs: {
      name: 'common source', dev: 'MOS', caps: ['Cgs', 'Cgd', 'CL'],
      cap: {
        Cgs: { tex: 'C_{gs}', kind: 'gnd', sym: 'R_S', R: (p) => p.RS,
          why: 'Source grounded, so $C_{gs}$ runs from the gate node to ground. The gate draws no current: the only path from the gate node to ground is $R_S$ (with $v_{in}$ zeroed).',
          slips: [['R_S\\parallel R_L', 'The gate does not connect to $R_L$: no current flows into a gate.'], ['R_S + R_L + g_mR_SR_L', 'That is $C_{gd}$, the capacitor that bridges gate and drain.'], ['\\dfrac{1}{g_m}', 'That is looking into a source. $C_{gs}$ here sits on the gate node, and the gate is a dead end.']] },
        Cgd: { tex: 'C_{gd}', kind: 'bridge', sym: 'R_S + R_L + g_mR_SR_L', R: (p) => { const Rr = par(p.RL, p.rds); return p.RS + Rr + p.gm * p.RS * Rr; },
          why: 'It bridges the gate (left node, $R_S$ to ground) and the drain (right node, $R_L\\parallel r_{ds}$ to ground), and the transistor turns gate voltage into drain current: $R = R_{left} + R_{right} + g_mR_{left}R_{right}$.',
          slips: [['R_S + R_L', 'You added the two node resistances but dropped $g_mR_SR_L$: the transistor amplifies the test voltage. That term is the Miller effect and usually the biggest.'], ['(1 + g_mR_L)R_S', 'That is only the input-side part. Add $R_L$ itself: $R_L + (1 + g_mR_L)R_S$.'], ['R_S\\parallel R_L', 'A bridging capacitor sees the two sides in series (plus the gain term), never in parallel.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.rds),
          why: 'From the output node to ground: the output resistance $R_L\\parallel r_{ds}$. With $v_{in}$ zeroed and $C_{gd}$ removed, the gate is at 0, so the transistor is just $r_{ds}$.',
          slips: [['R_L\\parallel \\tfrac{1}{g_m}', 'The output is a drain, not a source or a diode: the transistor adds $r_{ds}$ (big), not $1/g_m$.'], ['R_L + (1 + g_mR_L)R_S', 'That is $C_{gd}$. $C_L$ goes from the output to ground, so it sees only the output node.'], ['R_S', 'That is the gate node ($C_{gs}$). $C_L$ sits on the output.']] },
      },
    },
    ce: {
      name: 'common emitter', dev: 'BJT', caps: ['Cpi', 'Cmu', 'CL'],
      cap: {
        Cpi: { tex: 'C_\\pi', kind: 'gnd', sym: 'R_S\\parallel r_\\pi', R: (p) => par(p.RS, p.rpi),
          why: 'Emitter grounded, so $C_\\pi$ runs from the base node to ground, and $r_\\pi$ sits right across it. Two paths from the base to ground: $R_S$ (to the zeroed source) and $r_\\pi$.',
          slips: [['R_S', 'That is the MOSFET answer. A base is not a gate: $r_\\pi$ also goes from the base to ground, in parallel with $R_S$.'], ['r_\\pi', 'Do not forget $R_S$: with $v_{in}$ zeroed it is also a path from the base to ground.'], ['R_S + r_\\pi', 'Both go from the base node to ground: parallel, not series.']] },
        Cmu: { tex: 'C_\\mu', kind: 'bridge', sym: '(R_S\\parallel r_\\pi) + R_L + g_m(R_S\\parallel r_\\pi)R_L', R: (p) => { const Rl = par(p.RS, p.rpi), Rr = par(p.RL, p.ro); return Rl + Rr + p.gm * Rl * Rr; },
          why: 'It bridges base (left: $R_S\\parallel r_\\pi$) and collector (right: $R_L\\parallel r_o$), with $g_m$ between them: $R_{left} + R_{right} + g_mR_{left}R_{right}$, where the BJT left side includes $r_\\pi$.',
          slips: [['R_S + R_L + g_mR_SR_L', 'Right rule, wrong left resistance: the base node also has $r_\\pi$ to ground, so use $R_S\\parallel r_\\pi$.'], ['(R_S\\parallel r_\\pi) + R_L', 'You dropped the gain term $g_m(R_S\\parallel r_\\pi)R_L$, the Miller part, which is usually the biggest.'], ['(R_S\\parallel r_\\pi)\\parallel R_L', 'A bridging capacitor sees the two sides in series plus the gain term, never in parallel.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.ro),
          why: 'From the output (collector) to ground: $R_L\\parallel r_o$. The base is at a fixed voltage once $C_\\mu$ is removed and $v_{in}$ zeroed, so the BJT is just $r_o$.',
          slips: [['R_L\\parallel \\tfrac{1}{g_m}', 'A collector looks big ($r_o$), not like $1/g_m$.'], ['R_L\\parallel r_\\pi', '$r_\\pi$ is on the base side, not at the collector.'], ['R_S\\parallel r_\\pi', 'That is the base node ($C_\\pi$). $C_L$ sits on the collector.']] },
      },
    },
    csdeg: {
      name: 'common source with source degeneration', dev: 'MOS', caps: ['Cgs', 'Cgd', 'CL'],
      cap: {
        Cgs: { tex: 'C_{gs}', kind: 'bridge', sym: '\\dfrac{R_G + R_S}{1 + g_mR_S}', R: (p) => (p.RG + p.RS) / (1 + p.gm * p.RS),
          why: 'It bridges gate and source. A test voltage across it is exactly $v_{gs}$, so the transistor pushes $g_mv_t$ through $R_S$, which helps the test source: $R_G + R_S$ shrunk by $1 + g_mR_S$ (Lecture 29, $r_{ds}$ ignored).',
          slips: [['R_G', 'That is the common-source answer, where the source is grounded. Here $C_{gs}$ ends on the source node, which moves.'], ['R_G + R_S', 'Right path, but the transistor helps: its current $g_mv_t$ flows through $R_S$ the same way, dividing the total by $1 + g_mR_S$.'], ['\\dfrac{R_G}{1 + g_mR_S}', 'Both resistors are in the loop: the numerator is $R_G + R_S$.']] },
        Cgd: { tex: 'C_{gd}', kind: 'bridge', sym: 'R_G + R_L + \\dfrac{g_mR_GR_L}{1 + g_mR_S}', R: (p) => p.RG + p.RL + p.gm * p.RG * p.RL / (1 + p.gm * p.RS),
          why: 'The bridging rule with the degenerated transconductance $G_M = \\dfrac{g_m}{1 + g_mR_S}$: $R_{left} + R_{right} + G_MR_{left}R_{right}$ with $R_{left} = R_G$, $R_{right} = R_L$ ($r_{ds}$ ignored).',
          slips: [['R_G + R_L + g_mR_GR_L', 'Right rule, wrong transconductance: with $R_S$ the stage only turns gate voltage into $\\tfrac{g_m}{1 + g_mR_S}$ of drain current.'], ['R_G + R_L', 'You dropped the gain term $G_MR_GR_L$ (the Miller part).'], ['R_L(1 + g_mR_S) + R_G', 'Degeneration divides the gain term by $1 + g_mR_S$; it does not multiply $R_L$.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.rds + p.RS + p.gm * p.rds * p.RS),
          why: 'Output node to ground: $R_L\\parallel R_x$, where $R_x = r_{ds} + R_S + g_mr_{ds}R_S$ is the degenerated drain. With $r_{ds}$ ignored $R_x\\to\\infty$, leaving $R_L$.',
          slips: [['R_L\\parallel R_S', '$R_S$ is under the source; from the drain it is magnified by $g_mr_{ds}$ into a huge $R_x$, not seen directly.'], ['R_L\\parallel\\tfrac{1}{g_m}', 'The output is a drain: it looks big, not like $1/g_m$.'], ['\\dfrac{R_G + R_S}{1 + g_mR_S}', 'That is $C_{gs}$, the gate–source bridge. $C_L$ sits on the output.']] },
      },
    },
    cg: {
      name: 'common gate', dev: 'MOS', caps: ['Cgs', 'Cgd', 'CL'],
      cap: {
        Cgs: { tex: 'C_{gs}', kind: 'gnd', sym: 'R_S\\parallel\\tfrac{1}{g_m}', R: (p) => par(p.RS, srcR(p.gm, p.rds, p.RL)),
          why: 'The gate is an incremental ground, so $C_{gs}$ hangs from the source node to ground. That node has $R_S$ down to the zeroed source and the transistor\'s source looking up: $\\tfrac{r_{ds} + R_L}{1 + g_mr_{ds}}\\approx\\tfrac{1}{g_m}$. Small, so this pole is fast.',
          slips: [['R_S', 'The source node also has the transistor on it: looking up into a source gives about $1/g_m$, in parallel with $R_S$.'], ['\\tfrac{1}{g_m}', 'Do not forget $R_S$: with $v_{in}$ zeroed, it is also a path from the source node to ground.'], ['R_S + \\tfrac{1}{g_m}', 'Both go from the source node to ground: parallel.']] },
        Cgd: { tex: 'C_{gd}', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.rds + p.RS + p.gm * p.rds * p.RS),
          why: 'The gate is held, so $C_{gd}$ goes from the output to ground, in parallel with $C_L$: no Miller multiplication. The output node is $R_L\\parallel(r_{ds} + R_S + g_mr_{ds}R_S)\\approx R_L$.',
          slips: [['R_S + R_L + g_mR_SR_L', 'That is the common-source Miller answer. In a common gate the gate is an incremental ground, so $C_{gd}$ does not bridge input and output.'], ['R_L\\parallel R_S', 'From the drain, $R_S$ is magnified by the transistor, not seen directly.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.rds + p.RS + p.gm * p.rds * p.RS),
          why: 'Output node to ground: $R_L\\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$, the degenerated drain in parallel with $R_L$; about $R_L$.',
          slips: [['R_L\\parallel\\tfrac{1}{g_m}', 'The output is a drain: big, not $1/g_m$.'], ['R_L\\parallel R_S', 'From the drain, $R_S$ is magnified by $g_mr_{ds}$.']] },
      },
    },
    casc: {
      name: 'cascode', dev: 'MOS', caps: ['Cgs1', 'Cgd1', 'Cgs2', 'Cgd2', 'CL'],
      cap: {
        Cgs1: { tex: 'C_{gs1}', kind: 'gnd', sym: 'R_S', R: (p) => p.RS,
          why: '$M_1$\'s source is grounded: $C_{gs1}$ goes from the input gate to ground, which sees only $R_S$.',
          slips: [['R_S\\parallel\\tfrac{1}{g_m}', 'The gate node does not touch the transistor\'s channel: only $R_S$.'], ['2R_S + \\tfrac{1}{g_m}', 'That is $C_{gd1}$, which bridges the gate and node $X$.']] },
        Cgd1: { tex: 'C_{gd1}', kind: 'bridge', sym: 'R_S + R_X + g_mR_SR_X,\\ R_X\\approx\\tfrac{1}{g_m}', R: (p) => { const RX = par(p.rds, srcR(p.gm, p.rds, p.RL)); return p.RS + RX + p.gm * p.RS * RX; },
          why: 'It bridges $M_1$\'s gate ($R_S$) and node $X$. Node $X$ is the source of $M_2$, about $1/g_m$, so the gain term is only $g_mR_S\\cdot\\tfrac{1}{g_m} = R_S$: about $2R_S + 1/g_m$. The cascode kills the Miller multiplication.',
          slips: [['R_S + R_L + g_mR_SR_L', 'That is the plain common-source answer. In a cascode $C_{gd1}$ ends on node $X$, not on the output, and node $X$ is small (about $1/g_m$).'], ['R_S', 'That is $C_{gs1}$. $C_{gd1}$ bridges two nodes: add both sides and the gain term.'], ['R_S + \\tfrac{1}{g_m}', 'Add the gain term $g_mR_SR_X\\approx R_S$: total about $2R_S + 1/g_m$.']] },
        Cgs2: { tex: 'C_{gs2}', kind: 'gnd', sym: 'R_X = r_{ds1}\\parallel\\dfrac{r_{ds2} + R_L}{1 + g_mr_{ds2}}\\approx\\tfrac{1}{g_m}', R: (p) => par(p.rds, srcR(p.gm, p.rds, p.RL)),
          why: '$M_2$\'s gate is held, so $C_{gs2}$ goes from node $X$ to ground. $X$ sees $r_{ds1}$ down and the source of $M_2$ up (about $1/g_m$): small.',
          slips: [['r_{ds1}', 'Looking up from $X$ you see $M_2$\'s source, about $1/g_m$, in parallel: that wins.'], ['R_L', '$R_L$ is at the output; from $X$ it is divided by $g_mr_{ds2}$.']] },
        Cgd2: { tex: 'C_{gd2}', kind: 'gnd', sym: 'R_{out} = R_L\\parallel(r_{ds1} + r_{ds2} + g_mr_{ds2}r_{ds1})\\approx R_L', R: (p) => par(p.RL, 2 * p.rds + p.gm * p.rds * p.rds),
          why: '$M_2$\'s gate is held, so $C_{gd2}$ goes from the output to ground, in parallel with $C_L$. The output node is $R_L$ in parallel with the cascode\'s huge resistance.',
          slips: [['R_X + R_L + g_mR_XR_L', 'The gate of $M_2$ is an incremental ground: $C_{gd2}$ does not bridge anything.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_{out} = R_L\\parallel(r_{ds1} + r_{ds2} + g_mr_{ds2}r_{ds1})\\approx R_L', R: (p) => par(p.RL, 2 * p.rds + p.gm * p.rds * p.rds),
          why: 'Output node to ground: $R_L\\parallel R_{cascode}$, and the cascode resistance is huge, so about $R_L$.',
          slips: [['R_L\\parallel r_{ds}', 'Looking down from the output you see the whole cascode, $\\approx g_mr_{ds}^2$, not one $r_{ds}$.']] },
      },
    },
    sf: {
      name: 'source follower', dev: 'MOS', caps: ['Cgs', 'Cgd', 'CL'],
      cap: {
        Cgs: { tex: 'C_{gs}', kind: 'bridge', sym: '\\dfrac{R_S + R_L}{1 + g_mR_L}', R: (p) => (p.RS + p.RL) / (1 + p.gm * p.RL),
          why: 'It bridges gate and source, and the source follows the gate: the transistor\'s current through $R_L$ helps the test source, so $R_S + R_L$ is divided by $1 + g_mR_L$. Small ("bootstrapped").',
          slips: [['R_S + R_L + g_mR_SR_L', 'The bridging rule with $+g_m$ is for a capacitor across an inverting gain. Across a follower the gain term has the other sign: it divides by $1 + g_mR_L$.'], ['R_S', 'That would be true with the source grounded. Here $C_{gs}$ ends on the source node, which moves.'], ['R_S + R_L', 'Right loop, but the transistor\'s current $g_mv_t$ flows through $R_L$ and helps: divide by $1 + g_mR_L$.']] },
        Cgd: { tex: 'C_{gd}', kind: 'gnd', sym: 'R_S', R: (p) => p.RS,
          why: 'The drain is on $V_{DD}$ (incremental ground), so $C_{gd}$ goes from the gate to ground. With $C_{gs}$ removed the gate draws no current: only $R_S$.',
          slips: [['R_S + R_L + g_mR_SR_L', 'The drain does not move (it is on $V_{DD}$): $C_{gd}$ hangs from the gate to ground, no Miller term.'], ['R_S\\parallel R_L', 'The gate draws no current, so $R_L$ is not seen from the gate.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L\\parallel\\tfrac{1}{g_m}', R: (p) => par(p.RL, 1 / p.gm, p.rds),
          why: 'The output is the source, gate held at 0 (through $R_S$, no current): looking into a source gives $1/g_m$, in parallel with $R_L$.',
          slips: [['R_L', 'The output node also has the transistor\'s source on it, about $1/g_m$: small, and it wins in parallel.'], ['R_L + R_S', '$R_S$ is on the gate side and carries no current.']] },
      },
    },
    cb: {
      name: 'common base', dev: 'BJT', caps: ['Cpi', 'Cmu', 'CL'],
      cap: {
        Cpi: { tex: 'C_\\pi', kind: 'gnd', sym: 'R_S\\parallel\\dfrac{r_\\pi}{\\beta + 1}\\approx R_S\\parallel\\tfrac{1}{g_m}', R: (p) => par(p.RS, p.rpi / (p.beta + 1)),
          why: 'The base is an incremental ground, so $C_\\pi$ hangs from the emitter to ground. The emitter node has $R_S$ and the BJT\'s emitter, $\\tfrac{r_\\pi}{\\beta + 1}\\approx\\tfrac{1}{g_m}$ ($r_o$ ignored).',
          slips: [['R_S\\parallel r_\\pi', 'Looking into the emitter, $r_\\pi$ is divided by $\\beta + 1$: the emitter is a low-resistance node.'], ['R_S', 'The emitter node also has the transistor on it, about $1/g_m$, in parallel.']] },
        Cmu: { tex: 'C_\\mu', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.ro === INF ? INF : p.ro * (1 + p.gm * par(p.RS, p.rpi)) + par(p.RS, p.rpi)),
          why: 'The base is held, so $C_\\mu$ goes from the collector (output) to ground, in parallel with $C_L$: no Miller term. The collector node is $R_L$ ($r_o$ ignored).',
          slips: [['(R_S\\parallel r_\\pi) + R_L + g_m(R_S\\parallel r_\\pi)R_L', 'That is the common-emitter Miller answer. Here the base is an incremental ground, so $C_\\mu$ does not bridge input and output.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L', R: (p) => par(p.RL, p.ro === INF ? INF : p.ro * (1 + p.gm * par(p.RS, p.rpi)) + par(p.RS, p.rpi)),
          why: 'Output node to ground: $R_L$ in parallel with a collector (huge, $r_o$ ignored).',
          slips: [['R_L\\parallel\\tfrac{1}{g_m}', 'A collector looks big, not like $1/g_m$.']] },
      },
    },
    ef: {
      name: 'emitter follower', dev: 'BJT', caps: ['Cpi', 'Cmu', 'CL'],
      cap: {
        Cpi: { tex: 'C_\\pi', kind: 'bridge', sym: 'r_\\pi\\parallel\\dfrac{R_S + R_L}{1 + g_mR_L}', R: (p) => par(p.rpi, (p.RS + p.RL) / (1 + p.gm * p.RL)),
          why: 'It bridges base and emitter, with $r_\\pi$ right across it. Without $r_\\pi$ it would be the source-follower answer $\\tfrac{R_S + R_L}{1 + g_mR_L}$; $r_\\pi$ sits in parallel with that.',
          slips: [['\\dfrac{R_S + R_L}{1 + g_mR_L}', 'That is the source-follower answer. In a BJT, $r_\\pi$ sits right across $C_\\pi$: put it in parallel.'], ['R_S\\parallel r_\\pi', 'The emitter is not grounded here: it follows the base, which shrinks the resistance by about $1 + g_mR_L$.']] },
        Cmu: { tex: 'C_\\mu', kind: 'gnd', sym: 'R_S\\parallel[r_\\pi + (\\beta + 1)R_L]', R: (p) => par(p.RS, p.rpi + (p.beta + 1) * p.RL),
          why: 'The collector is on $V_{CC}$, so $C_\\mu$ goes from the base to ground. The base node has $R_S$ and the BJT\'s base looking in, $r_\\pi + (\\beta + 1)R_L$.',
          slips: [['R_S', 'That is the MOSFET answer. A base draws current: looking in you see $r_\\pi + (\\beta + 1)R_L$, in parallel with $R_S$.'], ['R_S\\parallel r_\\pi', 'The emitter is not grounded: $R_L$ appears $(\\beta + 1)$ times bigger from the base.']] },
        CL: { tex: 'C_L', kind: 'gnd', sym: 'R_L\\parallel\\dfrac{r_\\pi + R_S}{\\beta + 1}', R: (p) => par(p.RL, (p.rpi + p.RS) / (p.beta + 1)),
          why: 'The output is the emitter: looking up you see $\\tfrac{r_\\pi + R_S}{\\beta + 1}$ (the base resistance divided by $\\beta + 1$), in parallel with $R_L$.',
          slips: [['R_L\\parallel\\tfrac{1}{g_m}', 'Close, but $R_S$ on the base also shows up at the emitter, divided by $\\beta + 1$.'], ['R_L', 'The emitter node also has the transistor on it: small, and it wins in parallel.']] },
      },
    },
  };
  // more wrong answers, so every "which resistance" question has four options
  const EXTRA = {
    cg: {
      Cgd: [['R_S\\parallel\\tfrac{1}{g_m}', 'That is the source node ($C_{gs}$). $C_{gd}$ hangs on the output.']],
      CL: [['R_S\\parallel\\tfrac{1}{g_m}', 'That is the source node ($C_{gs}$). $C_L$ hangs on the output.']],
    },
    casc: {
      Cgs1: [['R_S + R_L + g_mR_SR_L', 'That would be a capacitor bridging the gate and the output. $C_{gs1}$ goes from the gate to the grounded source.']],
      Cgs2: [['2R_S + \\tfrac{1}{g_m}', 'That is $C_{gd1}$, the bridge from the input gate to $X$.']],
      Cgd2: [['R_L\\parallel\\tfrac{1}{g_m}', 'The output is the drain of $M_2$: it looks big, not like $1/g_m$.'], ['R_S + R_L + g_mR_SR_L', 'That is the plain common-source Miller answer. In a cascode $C_{gd2}$ hangs from the output to the held gate of $M_2$.']],
      CL: [['R_L\\parallel\\tfrac{1}{g_m}', 'The output is a drain: big, not $1/g_m$.'], ['2R_S + \\tfrac{1}{g_m}', 'That is $C_{gd1}$, on the input side.']],
    },
    sf: {
      Cgd: [['\\dfrac{R_S + R_L}{1 + g_mR_L}', 'That is $C_{gs}$, the capacitor that bridges gate and source.']],
      CL: [['\\dfrac{R_S + R_L}{1 + g_mR_L}', 'That is $C_{gs}$. $C_L$ hangs from the output (the source) to ground.']],
    },
    cb: {
      Cpi: [['\\tfrac{1}{g_m}', 'Do not forget $R_S$: with $v_{in}$ zeroed it also goes from the emitter to ground.']],
      Cmu: [['R_L\\parallel\\tfrac{1}{g_m}', 'A collector looks big, not like $1/g_m$.'], ['R_S\\parallel\\dfrac{r_\\pi}{\\beta + 1}', 'That is the emitter node ($C_\\pi$). $C_\\mu$ hangs on the collector.']],
      CL: [['R_S\\parallel\\dfrac{r_\\pi}{\\beta + 1}', 'That is the emitter node ($C_\\pi$).'], ['(R_S\\parallel r_\\pi) + R_L + g_m(R_S\\parallel r_\\pi)R_L', 'That is the common-emitter Miller answer; nothing bridges input and output here.']],
    },
    ef: {
      Cpi: [['r_\\pi', '$r_\\pi$ is across it, but so is the rest of the circuit: the follower bridge $\\tfrac{R_S + R_L}{1 + g_mR_L}$, which is much smaller, sits in parallel.']],
      Cmu: [['R_S + r_\\pi + (\\beta + 1)R_L', 'Both $R_S$ and the base go from the base node to ground: parallel, not series.']],
      CL: [['R_L + \\dfrac{r_\\pi + R_S}{\\beta + 1}', 'Both are paths from the emitter to ground: parallel.']],
    },
  };
  Object.entries(EXTRA).forEach(([k, m]) => Object.entries(m).forEach(([c, arr]) => TOPO[k].cap[c].slips.push(...arr)));
  // the cap's name for prose (C_gs, C_pi, ...)
  const CAPTEX = { Cgs: 'C_{gs}', Cgd: 'C_{gd}', CL: 'C_L', Cpi: 'C_\\pi', Cmu: 'C_\\mu', Cgs1: 'C_{gs1}', Cgd1: 'C_{gd1}', Cgs2: 'C_{gs2}', Cgd2: 'C_{gd2}' };

  // ================================================================ random parameters
  function params(k, o = {}) {
    const bjt = TOPO[k].dev === 'BJT';
    const p = {};
    if (bjt) {
      p.IC = pick([0.5, 1, 2]) * 1e-3; p.gm = p.IC / 0.025; p.beta = pick([100, 100, 200]); p.rpi = p.beta / p.gm;
      p.ro = o.rds === false ? INF : (k === 'ce' && pick([0, 1]) ? pick([50, 100]) * 1e3 : INF);
      p.RS = pick([0.5, 1, 2, 5]) * 1e3; p.RL = pick([1, 2, 5]) * 1e3;
      p.C = { Cpi: pick([5, 10, 20]) * 1e-12, Cmu: pick([0.5, 1]) * 1e-12, CL: pick([1, 2, 5]) * 1e-12 };
    } else {
      p.gm = pick([1, 2, 4, 5]) * 1e-3;
      p.rds = (o.rds === false || k === 'csdeg' || k === 'sf') ? INF : (k === 'casc' || k === 'cg' ? pick([50, 100, 200]) * 1e3 : pick([INF, 100e3, 200e3]));
      p.RS = pick([1, 2, 5, 10]) * 1e3; p.RL = pick([2, 5, 10, 20]) * 1e3; p.RG = pick([5, 10, 20]) * 1e3;
      if (k === 'csdeg') p.RS = pick([0.5, 1, 2]) * 1e3;
      if (k === 'sf') p.RL = pick([1, 2, 5]) * 1e3;
      p.C = { Cgs: pick([0.5, 1, 2]) * 1e-12, Cgd: pick([0.05, 0.1, 0.2]) * 1e-12, CL: pick([0.5, 1, 2]) * 1e-12 };
      if (k === 'casc') Object.assign(p.C, { Cgs1: p.C.Cgs, Cgd1: p.C.Cgd, Cgs2: p.C.Cgs, Cgd2: p.C.Cgd });
    }
    if (o.noRds) { p.rds = INF; p.ro = INF; }
    return p;
  }
  // the values printed on the figure and in the question
  function shown(k, p) {
    const T = TOPO[k], v = {};
    ['RS', 'RL', 'RG'].forEach((r) => { if (p[r] !== undefined && (r !== 'RG' || k === 'csdeg')) v[r] = kOs(p[r]); });
    T.caps.forEach((c) => { v[c] = pF(p.C[c]); });
    return v;
  }
  function devLine(k, p) {
    if (TOPO[k].dev === 'BJT') return `$I_C = ${f(p.IC * 1e3, 3)}\\,\\text{mA}$ so $g_m = I_C/V_T = ${MS(p.gm)}$, $\\beta = ${p.beta}$ so $r_\\pi = \\beta/g_m = ${KO(p.rpi)}$, ${p.ro === INF ? '$r_o\\to\\infty$' : `$r_o = ${KO(p.ro)}$`}.`;
    return `$g_m = ${MS(p.gm)}$${k === 'casc' ? ' for both transistors' : ''}, ${p.rds === INF ? 'ignore $r_{ds}$' : `$r_{ds} = ${KO(p.rds)}$${k === 'casc' ? ' for both' : ''}`}.`;
  }
  const capName = (k, c) => TOPO[k].cap[c].tex;
  // output-node capacitors that share one resistance (C_gd with C_L in a CG or a cascode): grouped for the BW sum
  function groups(k) {
    const T = TOPO[k];
    if (k === 'cg') return [['Cgs'], ['Cgd', 'CL']];
    if (k === 'cb') return [['Cpi'], ['Cmu', 'CL']];
    if (k === 'casc') return [['Cgs1'], ['Cgd1'], ['Cgs2'], ['Cgd2', 'CL']];
    return T.caps.map((c) => [c]);
  }
  function taus(k, p) {
    return groups(k).map((g) => { const R = TOPO[k].cap[g[0]].R(p); const Cs = g.reduce((s, c) => s + p.C[c], 0); return { g, R, C: Cs, tau: R * Cs }; });
  }

  // ================================================================ GENS.e3_octc_which: what does this capacitor see?
  const WHICH_K = ['cs', 'ce', 'csdeg', 'cg', 'casc', 'sf', 'cb', 'ef'];
  // the bridge without its gain term: the most common slip (only for the inverting stages)
  const noGain = (k, c, p) => {
    const msg = 'You added the two sides but left out the gain term $g_mR_{left}R_{right}$, the Miller part.';
    if (k === 'cs' && c === 'Cgd') return [{ v: p.RS + par(p.RL, p.rds), msg }];
    if (k === 'ce' && c === 'Cmu') return [{ v: par(p.RS, p.rpi) + par(p.RL, p.ro), msg }];
    if (k === 'casc' && c === 'Cgd1') return [{ v: p.RS + par(p.rds, srcR(p.gm, p.rds, p.RL)), msg }];
    if (k === 'csdeg' && c === 'Cgd') return [{ v: p.RG + par(p.RL, p.rds + p.RS + p.gm * p.rds * p.RS), msg }];
    if (k === 'ce' && c === 'Cpi') return [{ v: p.RS, msg: 'For a BJT the base node also has $r_\\pi$ to ground: use $R_S\\parallel r_\\pi$.' }];
    return [];
  };
  GENS.e3_octc_which = (opts = {}) => {
    const k = pick(opts.kinds || WHICH_K);
    const T = TOPO[k];
    const c = pick(T.caps);
    const K = T.cap[c];
    const p = params(k, { noRds: true });
    const raw = [K.sym, ...U.shuffle(K.slips).slice(0, 3).map((s) => s[0])];
    const whyAligned = raw.map((o, j) => (j === 0 ? null : (K.slips.find((s) => s[0] === o) || [0, 'Not that one.'])[1]));
    const opt = raw.map((o) => `$${o}$`);   // the options are TeX: delimit them so they render as math
    const R = K.R(p);
    return {
      fig: FIG[k]({ hi: c, v: shown(k, p) }),
      q: `A ${T.name} stage. ${devLine(k, p)} For the open-circuit time constant of the boxed capacitor $${K.tex}$: zero $v_{in}$, remove every other capacitor, and find the resistance between its two ends. Triangles are incremental grounds.`,
      parts: [
        { lbl: `1. What resistance does $${K.tex}$ see?`, mc: opt, a: 0, why: whyAligned },
        resPart(`R_{${K.tex}}`, R, undefined, noGain(k, c, p)),
        { lbl: `3. $\\tau = R\\,${K.tex}$`, unit: 'ns', ans: R * p.C[c] * 1e9 },
      ],
      hints: [
        `First ask: does $${K.tex}$ go from a node to ground (then it sees that node's resistance), or does it bridge two nodes of the transistor (then $R_{left} + R_{right} + g_mR_{left}R_{right}$, with care for followers)? Triangles and $V_{DD}$ count as ground.`,
        K.kind === 'bridge' ? 'Find each end\'s resistance to ground with the capacitor removed, then add the gain term. For the base of a BJT include $r_\\pi$.' : 'List every path from that node to ground with $v_{in}$ zeroed: resistors, and what each transistor terminal looks like (gate: open, source/emitter: small, drain/collector: big).',
      ],
      sol: `**Picture.** ${K.why}

$$R_{${K.tex}} = ${K.sym}$$

**Numbers.** $R = ${resTeX(R)}$, so $\\tau = R\\,${K.tex} = ${resTeX(R)}\\times${pF(p.C[c])} = ${ns(R * p.C[c])}$.

**Recognize it next time.** ${K.kind === 'bridge' ? 'Two ends on two different moving nodes: a bridge. Across an inverting stage it is $R_{left} + R_{right} + G_mR_{left}R_{right}$; across a follower the gain term divides instead.' : 'One end on a node, the other on ground (or a triangle, or $V_{DD}$): the capacitor sees that node\'s resistance, $R_{UP}\\parallel R_{DN}$, exactly as in Exam 2.'}`,
    };
  };

  // ================================================================ GENS.e3_octc_bw: the full estimate
  const BW_K = ['cs', 'ce', 'csdeg', 'cg', 'casc', 'sf', 'cb', 'ef'];
  GENS.e3_octc_bw = (opts = {}) => {
    const k = pick(opts.kinds || BW_K);
    const T = TOPO[k];
    const p = params(k, opts);
    const ts = taus(k, p);
    const sum = ts.reduce((s, t) => s + t.tau, 0);
    const w = 1 / sum, fr = w / (2 * Math.PI);
    const gname = (g) => g.map((c) => capName(k, c)).join(' + ');
    const parts = ts.map((t) => resPart(`R\\ \\text{seen by}\\ ${gname(t.g)}`, t.R, undefined, t.g.length === 1 ? noGain(k, t.g[0], p) : []));
    parts.push({ lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: w / 1e6 });
    parts.push({ lbl: 'f_{-3dB}', unit: 'MHz', ans: fr / 1e6, traps: [{ v: w / 1e6, msg: 'That is $\\omega$ in Mrad/s. Hertz: divide by $2\\pi$.' }] });
    const rows = ts.map((t) => `| $${gname(t.g)}$ | ${T.cap[t.g[0]].kind === 'bridge' ? 'bridge' : 'node to ground'} | $${resTeX(t.R)}$ | $${pF(t.C)}$ | $${ns(t.tau)}$ |`).join('\n');
    const big = ts.reduce((a, b) => (b.tau > a.tau ? b : a));
    const grpNote = ts.some((t) => t.g.length > 1) ? `\n\nCapacitors from the same node to ground add: ${ts.filter((t) => t.g.length > 1).map((t) => `$${gname(t.g)}$`).join(', ')} see the same resistance, so one time constant with the summed capacitance.` : '';
    return {
      fig: FIG[k]({ v: shown(k, p) }),
      q: `Estimate the $-3\\,\\text{dB}$ bandwidth of this ${T.name} stage with open-circuit time constants. ${devLine(k, p)} Triangles are incremental grounds.`,
      parts,
      hints: [
        'One capacitor at a time: zero $v_{in}$ (keep its resistor), open every other capacitor, find the resistance between that capacitor\'s ends.',
        'Node to ground: that node\'s resistance. Bridging gate/base and drain/collector of an inverting stage: $R_{left} + R_{right} + g_mR_{left}R_{right}$.',
        '$\\omega_{-3dB}\\approx 1/\\sum R_jC_j$ in rad/s; $f = \\omega/2\\pi$.',
      ],
      sol: `**Each capacitor alone** (input zeroed, the others open):

| Capacitor | Kind | $R$ | $C$ | $\\tau = RC$ |
|---|---|---|---|---|
${rows}

${ts.map((t) => `- $${gname(t.g)}$: ${T.cap[t.g[0]].why}`).join('\n')}${grpNote}

**Sum:** $\\sum\\tau = ${ns(sum)}$, so
$$\\omega_{-3dB}\\approx\\frac{1}{\\sum\\tau} = ${f(w / 1e6, 4)}\\,\\text{Mrad/s},\\qquad f_{-3dB} = \\frac{\\omega}{2\\pi} = ${f(fr / 1e6, 4)}\\,\\text{MHz}$$

**Biggest:** $${gname(big.g)}$ (${f(100 * big.tau / sum, 3)}% of the sum). That is the capacitor that limits this stage. The true bandwidth is a little higher: the estimate is pessimistic.`,
    };
  };

  // ================================================================ GENS.e3_octc_dom: which tau dominates, and what to change
  const DOM_K = ['cs', 'ce', 'csdeg', 'cg', 'casc'];
  GENS.e3_octc_dom = (opts = {}) => {
    let k, p, ts, sum, changes, best, guard = 0;
    for (;;) {
      k = pick(opts.kinds || DOM_K); p = params(k); ts = taus(k, p); sum = ts.reduce((s, t) => s + t.tau, 0);
      const T = TOPO[k];
      const cIn = T.caps[0], cBr = k === 'casc' ? 'Cgd1' : T.caps[1];
      const rIn = k === 'csdeg' ? 'RG' : 'RS';
      const mk = (lbl, mut) => { const q = JSON.parse(JSON.stringify(p)); ['rds', 'ro'].forEach((x) => { if (p[x] === INF) q[x] = INF; }); mut(q); const s = taus(k, q).reduce((a, t) => a + t.tau, 0); return { lbl, w: 1 / s }; };
      changes = [
        mk(`Halve $R_${rIn === 'RG' ? 'G' : 'S'}$ (the source resistance)`, (q) => { q[rIn] /= 2; }),
        mk('Halve $C_L$', (q) => { q.C.CL /= 2; }),
        mk(`Halve $${capName(k, cBr)}$${k === 'casc' ? '' : ''}`, (q) => { q.C[cBr] /= 2; }),
        mk(`Halve $${capName(k, cIn)}$`, (q) => { q.C[cIn] /= 2; }),
      ];
      const sorted = changes.slice().sort((a, b) => b.w - a.w);
      const sortedT = ts.slice().sort((a, b) => b.tau - a.tau);
      best = changes.indexOf(sorted[0]);
      if ((sorted[0].w - sorted[1].w) / sorted[0].w > 0.04 && (sortedT[0].tau - sortedT[1].tau) / sortedT[0].tau > 0.08) break;
      if (++guard > 60) break;
    }
    const T = TOPO[k];
    const gname = (g) => g.map((c) => capName(k, c)).join(' + ');
    const domI = ts.indexOf(ts.reduce((a, b) => (b.tau > a.tau ? b : a)));
    const w0 = 1 / sum;
    const tbl = ts.map((t) => `| $${gname(t.g)}$ | $${resTeX(t.R)}$ | $${ns(t.tau)}$ |`).join('\n');
    return {
      fig: FIG[k]({ v: shown(k, p) }),
      q: `A ${T.name} stage. ${devLine(k, p)} Without computing everything exactly, reason it out: which capacitor limits the bandwidth, and which single change raises the bandwidth the most?`,
      parts: [
        { lbl: '1. Which time constant is the biggest?', mc: ts.map((t) => `$${gname(t.g)}$`), a: domI, fixed: true,
          why: ts.map((t, j) => (j === domI ? null : `$\\tau = ${resTeX(t.R)}\\times${pF(t.C)} = ${ns(t.tau)}$; the biggest is $${gname(ts[domI].g)}$ with $${ns(ts[domI].tau)}$.`)) },
        { lbl: '2. Which single change raises $\\omega_{-3dB}$ the most?', mc: changes.map((c) => c.lbl), a: best,
          why: changes.map((c, j) => (j === best ? null : `That gives $\\omega_{-3dB}\\approx ${f(c.w / 1e6, 3)}\\,\\text{Mrad/s}$; the best change gives $${f(changes[best].w / 1e6, 3)}\\,\\text{Mrad/s}$ (now $${f(w0 / 1e6, 3)}$).`)) },
        { lbl: '3. $\\omega_{-3dB}$ now (OCTC)', unit: 'Mrad/s', ans: w0 / 1e6 },
      ],
      hints: [
        'Size each resistance by eye first: the bridging capacitor of an inverting stage (Miller) is usually huge because of the $g_mR_{left}R_{right}$ term; a capacitor on a source or emitter node is small.',
        'A change helps only through the time constants it touches. Halving the source resistance shrinks both the input capacitor\'s $\\tau$ and the Miller term.',
      ],
      sol: `| Capacitor | $R$ | $\\tau$ |
|---|---|---|
${tbl}

$\\sum\\tau = ${ns(sum)}$, $\\omega_{-3dB}\\approx ${f(w0 / 1e6, 4)}\\,\\text{Mrad/s}$. The biggest is **$${gname(ts[domI].g)}$**.

Each change, recomputed:
${changes.map((c) => `- ${c.lbl}: $${f(c.w / 1e6, 4)}\\,\\text{Mrad/s}$`).join('\n')}

**Best: ${changes[best].lbl}.** A change only pays off through the time constants it touches, and the biggest time constant is the one worth attacking.`,
    };
  };

  // ================================================================ GENS.e3_octc_bridge: the bridging rule on its own
  const bridgeFig = (sign) => [
    ['node', [0, 0], { n: 'v_1', side: 'l', dot: true }], ['R', [0, 0], [0, 1.5], { n: 'R_{left}', side: 'l' }], ['gnd', [0, 1.5]],
    ['w', [0, 0], [0, -1]], ['C', [0, -1], [3.4, -1], { n: '\\boxed{C}' }], ['w', [3.4, -1], [3.4, 0]],
    ['node', [3.4, 0], { n: 'v_2', side: 'a' }], ['w', [2.4, 0], [4.4, 0]],
    ['G', [2.4, 0], [2.4, 1.5], { n: sign > 0 ? 'G_mv_1' : 'G_mv_1', side: 'l' }], ['gnd', [2.4, 1.5]],
    ['R', [4.4, 0], [4.4, 1.5], { n: 'R_{right}' }], ['gnd', [4.4, 1.5]],
  ];
  GENS.e3_octc_bridge = () => {
    const Rl = pick([0.5, 1, 2, 5, 10]) * 1e3, Rr = pick([2, 5, 10, 20]) * 1e3, Gm = pick([1, 2, 4, 10, 20, 40]) * 1e-3;
    const R = Rl + Rr + Gm * Rl * Rr;
    return {
      fig: bridgeFig(1),
      q: `The core picture behind every Miller capacitor: node $v_1$ has $R_{left} = ${KO(Rl)}$ to ground, node $v_2$ has $R_{right} = ${KO(Rr)}$ to ground, and a transconductor pulls $G_mv_1$ out of node $v_2$ with $G_m = ${MS(Gm)}$. What resistance does the boxed capacitor see?`,
      parts: [resPart('R_C', R, undefined, [{ v: Rl + Rr, msg: 'You added the two sides but forgot $G_mR_{left}R_{right}$: the transconductor amplifies the test voltage.' }, { v: par(Rl, Rr), msg: 'Not parallel: the test current has to go through both sides.' }])],
      hints: ['Push a test current $i_t$ from $v_1$ to $v_2$ through where the capacitor was. $v_1 = -i_tR_{left}$.', 'At $v_2$: $i_t = v_2/R_{right} + G_mv_1$, so $v_2 = i_tR_{right}(1 + G_mR_{left})$. Then $R = (v_2 - v_1)/i_t$.'],
      sol: `Test current $i_t$ out of node 1, into node 2. Node 1: $v_1 = -i_tR_{left}$. Node 2: $i_t = v_2/R_{right} + G_mv_1$, so $v_2 = R_{right}\\,i_t(1 + G_mR_{left})$.
$$R = \\frac{v_2 - v_1}{i_t} = R_{left} + R_{right} + G_mR_{left}R_{right} = ${f(Rl / 1e3, 3)} + ${f(Rr / 1e3, 3)} + ${f(Gm * Rl * Rr / 1e3, 4)} = ${resTeX(R)}$$
The last term is $G_mR_{right}$ (the gain from node 1 to node 2) times $R_{left}$: the **Miller** part. When the gain is big it dwarfs the rest.`,
    };
  };

  // ================================================================ GENS.e3_octc_est: why the estimate is pessimistic
  GENS.e3_octc_est = () => {
    const w1 = pick([1, 2, 5, 10]) * 1e6, ratio = pick([1, 2, 5, 10, 100]);
    const w2 = w1 * ratio, t1 = 1 / w1, t2 = 1 / w2;
    const est = 1 / (t1 + t2);
    const x = (-(t1 * t1 + t2 * t2) + Math.sqrt((t1 * t1 + t2 * t2) ** 2 + 4 * t1 * t1 * t2 * t2)) / (2 * t1 * t1 * t2 * t2);
    const ex = Math.sqrt(x);
    const Mr = (w) => `${f(w / 1e6, 4)}\\,\\text{Mrad/s}`;
    return {
      q: `An amplifier has $H(s) = \\dfrac{a_0}{(1 + s/\\omega_1)(1 + s/\\omega_2)}$ with $\\omega_1 = ${Mr(w1)}$ and $\\omega_2 = ${Mr(w2)}$. The open-circuit time-constant sum equals $b_1 = \\tau_1 + \\tau_2$ exactly. What bandwidth does $1/b_1$ predict, and how does the true $\\omega_{-3dB}$ compare?`,
      parts: [
        { lbl: '1/b_1', unit: 'Mrad/s', ans: est / 1e6, traps: [{ v: w1 / 1e6, msg: 'That is the lower pole alone. The estimate uses the sum of both time constants.' }] },
        { lbl: 'The true $\\omega_{-3dB}$ is', mc: [ratio === 1 ? 'higher: about $0.644/\\tau$ instead of $0.5/\\tau$' : 'a little higher than the estimate', 'lower than the estimate', 'exactly the estimate'], a: 0,
          why: [null, 'The estimate drops the $s^2$ term of $D(s)$, which only ever helps at $\\omega_{-3dB}$: the estimate is pessimistic.', `Not exactly: the true value is $${Mr(ex)}$.`] },
      ],
      hints: ['$\\tau = 1/\\omega$ for each pole. Add them: $b_1 = \\tau_1 + \\tau_2$.'],
      sol: `$\\tau_1 = 1/\\omega_1$, $\\tau_2 = 1/\\omega_2$, $b_1 = \\tau_1 + \\tau_2 = ${ns(t1 + t2)}$:
$$\\omega_{-3dB}\\approx\\frac{1}{b_1} = ${Mr(est)}$$
The exact value (solve $|D(j\\omega)|^2 = 2$) is $${Mr(ex)}$, ${f(100 * (ex / est - 1), 3)}% higher. ${ratio >= 10 ? 'With the poles a decade or more apart, one pole dominates and the estimate is nearly exact.' : ratio === 1 ? 'Two equal poles are the worst case: $0.5/\\tau$ estimated against $\\sqrt{\\sqrt2 - 1}/\\tau = 0.644/\\tau$ true, so the estimate is 22% low, and always on the safe side.' : 'Close poles make the estimate more pessimistic; the worst case is equal poles, where it is 22% low.'}`,
    };
  };

  window.E3OC = { FIG, TOPO, params, taus, groups, shown, devLine, bridgeFig };
})();

/* gens.js — randomized problem generators for circuit fundamentals,
   Thévenin/Norton, two-ports and small-signal basics.
   Every linear-circuit answer is computed by solving the drawn netlist. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, sh = U.shuffle;
  const GENS = (window.GENS = window.GENS || {});
  const FIGS = (window.FIGS = window.FIGS || {});

  const RK = [1, 2, 3, 4, 5, 6, 8, 10];
  const pk = (arr = RK) => pick(arr) * 1000;
  const kO = (r) => U.si(r, 'Ω');
  const Vv = (v) => `${f(v)}\\,\\text{V}`;
  const mA = (i) => `${f(i * 1e3)}\\,\\text{mA}`;
  const k = (r) => f(r / 1000);          // ohms -> number in kΩ, as text
  const clean = (x, d = 3) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

  function tryUntil(fn, ok, n = 300) {
    let r;
    for (let i = 0; i < n; i++) { r = fn(); if (ok(r)) return r; }
    return r;
  }

  // Ground a named node (for networks drawn without a ground symbol).
  function elementsGrounded(fig, gname) {
    const nl = Schem.netlist(fig);
    const g = nl.names[gname];
    return { nl, els: nl.elements.map((e) => {
      const c = Object.assign({}, e);
      ['a', 'b', 'ca', 'cb'].forEach((key) => { if (c[key] === g) c[key] = '0'; });
      return c;
    }) };
  }

  // ================================================================ figures shared with content
  FIGS.cs = (o = {}) => [
    ['V', [0, 1], [0, 2], { n: 'v_{in}', s: o.vins, v: o.vin ?? 0 }], ['gnd', [0, 2]],
    ['w', [0, 1], [0, 0.4], [1.2, 0.4]], ['term', [1.2, 0.4], { name: 'g' }],
    ['term', [1.2, 1.4]], ['w', [1.2, 1.4], [1.2, 2], [2.6, 2]],
    ['vlab', [1.45, 0.55], [1.45, 1.25], { n: 'v_x' }],
    ['G', [2.6, 0], [2.6, 2], { n: 'g_m v_x', s: o.gms, g: o.gm ?? 1e-3, c: ['g', 's'] }],
    ['node', [2.6, 2], { name: 's' }],
    ['w', [2.6, 0], [4, 0]], ['R', [4, 0], [4, 1.5], { n: 'R_D', s: o.RDs, v: o.RD ?? 1e3 }], ['gnd', [4, 1.5]],
    ['w', [2.6, 0], [2.6, -0.7]], ['term', [2.6, -0.7], { n: 'v_{out}', name: 'o', side: 'r' }],
    ['R', [2.6, 2], [2.6, 3.4], { n: 'R_S', s: o.RSs, v: o.RS ?? 1e3 }], ['gnd', [2.6, 3.4]],
  ];

  FIGS.follower = (o = {}) => [
    ['V', [0, 1], [0, 2], { n: 'v_{in}', s: o.vins, v: o.vin ?? 0 }], ['gnd', [0, 2]],
    ['w', [0, 1], [0, 0.4], [1.2, 0.4]], ['term', [1.2, 0.4], { name: 'g' }],
    ['term', [1.2, 1.4]], ['w', [1.2, 1.4], [1.2, 2], [2.6, 2]],
    ['vlab', [1.45, 0.55], [1.45, 1.25], { n: 'v_x' }],
    ['G', [2.6, 0], [2.6, 2], { n: 'g_m v_x', s: o.gms, g: o.gm ?? 1e-3, c: ['g', 's'] }],
    ['R', [3.9, 0], [3.9, 2], { n: 'R_O', s: o.ROs, v: o.RO ?? 1e4 }],
    ['w', [2.6, 0], [3.9, 0], [4.6, 0]], ['gnd', [4.6, 0]],
    ['node', [2.6, 2], { name: 's' }], ['w', [2.6, 2], [3.9, 2], [5, 2]],
    ['term', [5, 2], { n: 'v_{out}', name: 'o' }],
    ['R', [2.6, 2], [2.6, 3.4], { n: 'R_S', s: o.RSs, v: o.RS ?? 1e3 }], ['gnd', [2.6, 3.4]],
  ];

  FIGS.feedback = (o = {}) => [
    ['I', [0, 2.4], [0, 1], { n: 'i_{in}', s: o.iins, v: o.iin ?? 0, side: 'l' }], ['gnd', [0, 2.4]],
    ['w', [0, 1], [0, 0]], ['R', [0, 0], [3.6, 0], { n: 'R_F', s: o.RFs, v: o.RF ?? 1e4 }], ['w', [3.6, 0], [3.6, 1]],
    ['w', [0, 1], [1, 1]], ['term', [1, 1], { name: 'x' }], ['term', [1, 1.8]], ['w', [1, 1.8], [1, 2.4]], ['gnd', [1, 2.4]],
    ['vlab', [1.25, 1.1], [1.25, 1.7], { n: 'v_x' }],
    ['E', [2.2, 1.4], [2.2, 2.4], { n: 'A_v v_x', s: o.Avs, g: o.Av ?? 1, c: ['x', '0'] }], ['gnd', [2.2, 2.4]],
    ['w', [2.2, 1.4], [2.2, 1]], ['R', [2.2, 1], [3.6, 1], { n: 'R_O', s: o.ROs, v: o.RO ?? 1e3 }],
    ['R', [3.6, 1], [3.6, 2.4], { n: 'R_L', s: o.RLs, v: o.RL ?? 1e3 }], ['gnd', [3.6, 2.4]],
    ['w', [3.6, 1], [4.6, 1]], ['term', [4.6, 1], { n: 'v_{out}', name: 'o' }],
  ];

  FIGS.transR = (o = {}) => [
    ['I', [0, 2.2], [0, 1], { n: 'I_{IN}', s: o.iins, v: o.iin ?? 0, side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 1], [0, 0]], ['R', [0, 0], [2.6, 0], { n: 'R_F', s: o.RFs, v: o.RF ?? 1e4 }],
    ['w', [0, 1], [1.1, 1]], ['term', [1.1, 1], { name: 'x' }], ['term', [1.1, 1.7]], ['w', [1.1, 1.7], [1.1, 2.2]], ['gnd', [1.1, 2.2]],
    ['vlab', [1.35, 1.1], [1.35, 1.6], { n: 'v_x' }],
    ['G', [2.6, 0], [2.6, 2.2], { n: 'g_{m1} v_x', s: o.gms, g: o.gm ?? 1e-3, c: ['x', '0'] }], ['gnd', [2.6, 2.2]],
    ['w', [2.6, 0], [3.9, 0], [4.7, 0]], ['R', [3.9, 0], [3.9, 2.2], { n: 'R_1', s: o.R1s, v: o.R1 ?? 1e3 }], ['gnd', [3.9, 2.2]],
    ['term', [4.7, 0], { n: 'V_{OUT}', name: 'o' }],
  ];

  // ================================================================ Unit 0 — toolkit
  GENS.ohm = () => {
    const R = U.niceR(100, 10000);
    const I = pick([0.2, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5]) * 1e-3;
    const flip = Math.random() < 0.4;
    const V = (flip ? -1 : 1) * I * R;
    const ask = pick(['V', 'I', 'R']);
    const Rk = R >= 1000;
    const fig = [
      ['term', [0, -0.7]], ['w', [0, -0.7], [0, 0]],
      ['R', [0, 0], [0, 2], { n: 'R', s: ask === 'R' ? '' : kO(R), side: 'l' }],
      ['w', [0, 2], [0, 2.7]], ['term', [0, 2.7]],
      ['vlab', [0.5, 0.25], [0.5, 1.75], { n: ask === 'V' ? 'v = \\,?' : `v = ${Vv(V)}` }],
      ['iarr', [0, -0.35], flip ? 'u' : 'd', { n: ask === 'I' ? 'i = \\,?' : `i = ${mA(I)}`, side: 'l', off: [-13, 0] }],
    ];
    const rule = flip
      ? 'The arrow points **up**, so the reference current enters the **−** terminal. That is against the passive sign convention, so $v = -iR$.'
      : 'The reference current enters the **+** terminal (passive sign convention), so $v = iR$.';
    let parts, work;
    if (ask === 'V') { parts = [{ lbl: 'v', unit: 'V', ans: V }]; work = `$v = ${flip ? '-' : ''}(${f(I * 1e3)}\\,\\text{mA})(${kO(R)}) = ${Vv(V)}$`; }
    else if (ask === 'I') { parts = [{ lbl: 'i', unit: 'mA', ans: I * 1e3 }]; work = `$i = ${flip ? '-' : ''}\\dfrac{v}{R} = ${flip ? '-' : ''}\\dfrac{${f(V)}}{${f(R / 1000)}\\,\\text{k}\\Omega} = ${mA(I)}$`; }
    else { parts = Rk ? [{ lbl: 'R', unit: 'kΩ', ans: R / 1000 }] : [{ lbl: 'R', unit: 'Ω', ans: R }]; work = `$R = \\left|\\dfrac{v}{i}\\right| = \\dfrac{${f(Math.abs(V))}\\,\\text{V}}{${f(I * 1e3)}\\,\\text{mA}} = ${kO(R)}$`; }
    return {
      q: `Find the missing quantity. Watch the direction of the current arrow relative to the $+/-$ marks.`,
      fig, parts,
      hints: ['Does the current arrow point *into* the $+$ terminal or into the $-$ terminal?', rule],
      sol: `${rule}\n\n${work}`,
    };
  };

  GENS.kcl = () => {
    const P = {
      L: { w: [[0, 1.5], [2, 1.5]], a: [1, 1.5], into: 'r', out: 'l', end: [0, 1.5] },
      R: { w: [[2, 1.5], [4, 1.5]], a: [3, 1.5], into: 'l', out: 'r', end: [4, 1.5] },
      U: { w: [[2, 0], [2, 1.5]], a: [2, 0.75], into: 'd', out: 'u', end: [2, 0] },
      D: { w: [[2, 1.5], [2, 3]], a: [2, 2.25], into: 'u', out: 'd', end: [2, 3] },
    };
    const order = sh(['L', 'R', 'U', 'D']);
    const br = order.map((d, i) => ({ d, into: Math.random() < 0.5, val: i ? pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6]) : null, nm: i ? `i_${i}` : 'i_x' }));
    const kn = br.slice(1);
    const sin = kn.filter((b) => b.into).reduce((s, b) => s + b.val, 0);
    const sout = kn.filter((b) => !b.into).reduce((s, b) => s + b.val, 0);
    const ux = br[0];
    const ans = ux.into ? sout - sin : sin - sout;
    const fig = [];
    for (const b of br) {
      const p = P[b.d];
      fig.push(['w', ...p.w], ['term', p.end]);
      fig.push(['iarr', p.a, b.into ? p.into : p.out, { n: b.val === null ? 'i_x' : `${b.nm} = ${f(b.val)}\\,\\text{mA}` }]);
    }
    fig.push(['dot', [2, 1.5]]);
    const ins = br.filter((b) => b.into).map((b) => b.val === null ? 'i_x' : f(b.val));
    const outs = br.filter((b) => !b.into).map((b) => b.val === null ? 'i_x' : f(b.val));
    return {
      q: 'Four branches meet at one node. Find $i_x$ in the direction of its arrow.',
      fig, parts: [{ lbl: 'i_x', unit: 'mA', ans }],
      hints: ['KCL: the total current flowing **in** equals the total flowing **out**. Sort the four arrows into "in" and "out".'],
      sol: `Currents in = currents out:\n\n$$${ins.join(' + ') || '0'} = ${outs.join(' + ') || '0'}$$\n\nSo $i_x = ${f(ans)}\\,\\text{mA}$.${ans < 0 ? ' The negative sign just means the real current flows opposite to the drawn arrow. That is fine: the arrow is only a reference direction.' : ''}`,
    };
  };

  GENS.kvl = () => {
    const vs = pick([3, 5, 6, 9, 10, 12]);
    const srcTop = Math.random() < 0.5;          // + terminal of source at top
    const sides = ['T', 'Rt', 'B'];
    const unk = pick(sides);
    const pol = { T: pick([1, -1]), Rt: pick([1, -1]), B: pick([1, -1]) };
    const val = {};
    // choose known values, then solve for the unknown so the loop balances
    const res = tryUntil(() => {
      sides.forEach((s) => { val[s] = pick([1, 2, 3, 4, 5, 6, 7]); });
      const srcTerm = srcTop ? -vs : vs;              // walking up the left side
      const others = sides.filter((s) => s !== unk).reduce((a, s) => a + pol[s] * val[s], 0);
      return -(srcTerm + others) / pol[unk];
    }, (x) => x !== 0 && Math.abs(x) <= 20);
    val[unk] = res;
    const lab = (s) => (s === unk ? 'v_x' : `${f(val[s])}\\,\\text{V}`);
    const vl = {
      T: pol.T > 0 ? [[1.15, -0.35], [1.85, -0.35]] : [[1.85, -0.35], [1.15, -0.35]],
      Rt: pol.Rt > 0 ? [[3.4, 0.65], [3.4, 1.35]] : [[3.4, 1.35], [3.4, 0.65]],
      B: pol.B > 0 ? [[1.85, 2.35], [1.15, 2.35]] : [[1.15, 2.35], [1.85, 2.35]],
    };
    const fig = [
      srcTop ? ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: Vv(vs), side: 'l' }] : ['V', [0, 1.5], [0, 0.5], { n: 'V_S', s: Vv(vs), side: 'l' }],
      ['w', [0, 0.5], [0, 0], [1, 0]], ['R', [1, 0], [2, 0]], ['w', [2, 0], [3, 0], [3, 0.5]],
      ['R', [3, 0.5], [3, 1.5]], ['w', [3, 1.5], [3, 2], [2, 2]], ['R', [2, 2], [1, 2]], ['w', [1, 2], [0, 2], [0, 1.5]],
      ['vlab', ...vl.T, { n: lab('T'), side: 'a' }], ['vlab', ...vl.Rt, { n: lab('Rt'), side: 'r' }], ['vlab', ...vl.B, { n: lab('B'), side: 'b' }],
      ['txt', [1.5, 1], '$\\circlearrowright$', { a: 'c' }],
    ];
    const term = (s, name) => `${pol[s] > 0 ? '+' : '-'}${s === unk ? 'v_x' : f(val[s])}`;
    const srcT = srcTop ? `-${vs}` : `+${vs}`;
    return {
      q: 'Walk the loop clockwise and find $v_x$ (with the polarity marked on it).',
      fig, parts: [{ lbl: 'v_x', unit: 'V', ans: val[unk] }],
      hints: [
        'KVL: going around a closed loop, the voltage drops add to zero. Entering an element at its $+$ mark counts as a drop ($+v$); entering at $-$ counts as a rise ($-v$).',
        `Start at the bottom-left corner and go up through $V_S$: you enter at its ${srcTop ? '$-$' : '$+$'} terminal, so that term is $${srcT}$.`,
      ],
      sol: `Clockwise from the bottom-left corner: up through $V_S$, right along the top, down the right side, left along the bottom.\n\n$$${srcT} ${term('T')} ${term('Rt')} ${term('B')} = 0$$\n\n(Each term is $+v$ if you enter that element at its $+$ mark.) Solving gives $v_x = ${f(val[unk])}\\,\\text{V}$.`,
    };
  };

  GENS.req = () => {
    const T = pick([1, 2, 3]);
    const r = [pk(), pk(), pk(), pk()];
    const L = (i, extra = {}) => Object.assign({ n: `R_${i + 1}`, s: kO(r[i]), v: r[i] }, extra);
    let fig, formula;
    if (T === 1) {
      fig = [['term', [0, 0], { n: 'a', name: 'a', side: 'l' }], ['R', [0, 0], [2, 0], L(0)], ['R', [2, 0], [2, 2], L(1)], ['w', [2, 0], [4, 0]], ['R', [4, 0], [4, 2], L(2)], ['w', [0, 2], [4, 2]], ['term', [0, 2], { n: 'b', name: 'b', side: 'l' }]];
      formula = 'R_1 + (R_2 \\pl R_3)';
    } else if (T === 2) {
      fig = [['term', [0, 0], { n: 'a', name: 'a', side: 'l' }], ['w', [0, 0], [1, 0]], ['R', [1, 0], [1, 2], L(0)], ['R', [1, 0], [3, 0], L(1)], ['R', [3, 0], [3, 2], L(2)], ['w', [0, 2], [3, 2]], ['term', [0, 2], { n: 'b', name: 'b', side: 'l' }]];
      formula = 'R_1 \\pl (R_2 + R_3)';
    } else {
      fig = [['term', [0, 0], { n: 'a', name: 'a', side: 'l' }], ['R', [0, 0], [2, 0], L(0)], ['R', [2, 0], [2, 2], L(1)], ['R', [2, 0], [4, 0], L(2)], ['R', [4, 0], [4, 2], L(3)], ['w', [0, 2], [4, 2]], ['term', [0, 2], { n: 'b', name: 'b', side: 'l' }]];
      formula = 'R_1 + \\big(R_2 \\pl (R_3 + R_4)\\big)';
    }
    const { nl, els } = elementsGrounded(fig, 'b');
    const Req = MNA.resistance(els, nl.names.a, '0');
    return {
      q: 'Find the equivalent resistance seen between terminals $a$ and $b$.',
      fig, parts: [{ lbl: 'R_{eq}', unit: 'kΩ', ans: Req / 1000 }],
      hints: ['Start from the end **farthest** from the terminals and collapse toward $a$–$b$.', 'Parallel: $R_x \\pl R_y = \\dfrac{R_xR_y}{R_x+R_y}$. Series: just add.'],
      sol: `Collapse from the far end: $R_{eq} = ${formula} = ${f(Req / 1000)}\\kO$.`,
    };
  };

  GENS.vdiv = () => {
    const Vs = pick([5, 6, 9, 10, 12, 15]);
    const R1 = pk(), R2 = pk();
    const loaded = Math.random() < 0.4;
    const RL = pk();
    const fig = [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: Vv(Vs), v: Vs, side: 'l' }], ['w', [0, 0.5], [0, 0], [1, 0]],
      ['R', [1, 0], [3, 0], { n: 'R_1', s: kO(R1), v: R1 }], ['R', [3, 0], [3, 2], { n: 'R_2', s: kO(R2), v: R2 }],
      ['node', [3, 0], { n: 'v_{out}', name: 'o', side: 'ar' }],
      ['w', [3, 2], [0, 2], [0, 1.5]], ['gnd', [0, 2]],
    ];
    if (loaded) fig.push(['w', [3, 0], [4.6, 0]], ['R', [4.6, 0], [4.6, 2], { n: 'R_L', s: kO(RL), v: RL }], ['w', [3, 2], [4.6, 2]]);
    const S = Schem.solve(fig);
    const Rb = loaded ? U.par(R2, RL) : R2;
    return {
      q: loaded ? 'Find $v_{out}$. Note the load $R_L$ hanging on the output.' : 'Find $v_{out}$.',
      fig, parts: [{ lbl: 'v_{out}', unit: 'V', ans: S.v('o') }],
      hints: loaded
        ? ['The load sits in parallel with $R_2$. Combine them first; then it is an ordinary divider.']
        : ['Voltage divider: $v_{out} = V_S\\dfrac{R_2}{R_1+R_2}$.'],
      sol: loaded
        ? `The bottom leg is $R_2 \\pl R_L = ${kO(Rb)}$. Then $v_{out} = ${f(Vs)}\\cdot\\dfrac{${k(Rb)}}{${k(R1)} + ${k(Rb)}} = ${Vv(S.v('o'))}$. Loading always pulls a divider's output down.`
        : `$v_{out} = ${f(Vs)}\\cdot\\dfrac{${k(R2)}}{${k(R1)} + ${k(R2)}} = ${Vv(S.v('o'))}$.`,
    };
  };

  GENS.idiv = () => {
    const Is = pick([1, 2, 3, 4, 5, 6]) * 1e-3;
    const R1 = pk(), R2 = pk();
    const fig = [
      ['I', [0, 1.5], [0, 0.5], { n: 'I_S', s: mA(Is), v: Is, side: 'l' }], ['w', [0, 0.5], [0, 0], [3, 0]],
      ['R', [1.5, 0], [1.5, 2], { n: 'R_1', s: kO(R1), v: R1 }], ['R', [3, 0], [3, 2], { n: 'R_2', s: kO(R2), v: R2, id: 'R2' }],
      ['iarr', [3, 0.25], 'd', { n: 'i_2', side: 'l', off: [-12, 0] }],
      ['w', [3, 2], [0, 2], [0, 1.5]], ['gnd', [0, 2]],
    ];
    const S = Schem.solve(fig);
    const i2 = S.iR('R2');
    return {
      q: 'Find the current $i_2$ through $R_2$.',
      fig, parts: [{ lbl: 'i_2', unit: 'mA', ans: i2 * 1e3 }],
      hints: ['Current divider: current splits in inverse proportion to resistance. $i_2 = I_S\\dfrac{R_1}{R_1+R_2}$ (note: the *other* resistor on top).'],
      sol: `$i_2 = I_S\\dfrac{R_1}{R_1+R_2} = ${f(Is * 1e3)}\\cdot\\dfrac{${k(R1)}}{${k(R1)}+${k(R2)}} = ${mA(i2)}$.\n\nSanity check: the smaller resistor takes the larger share.`,
    };
  };

  // --- nodal analysis --------------------------------------------------------
  function nodal1Fig(Vs, R1, R2, Is, into) {
    return [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: Vv(Vs), v: Vs, side: 'l' }], ['w', [0, 0.5], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1', s: kO(R1), v: R1 }], ['node', [2, 0], { n: 'v_1', name: '1', side: 'ar' }],
      ['R', [2, 0], [2, 2], { n: 'R_2', s: kO(R2), v: R2 }], ['w', [2, 0], [3.6, 0]],
      into ? ['I', [3.6, 2], [3.6, 0], { n: 'I_S', s: mA(Is), v: Is }] : ['I', [3.6, 0], [3.6, 2], { n: 'I_S', s: mA(Is), v: Is }],
      ['w', [0, 1.5], [0, 2], [3.6, 2]], ['gnd', [2, 2]],
    ];
  }

  GENS.nodal1 = () => {
    const Vs = pick([4, 5, 6, 8, 10, 12]), R1 = pk(), R2 = pk(), Is = pick([0.5, 1, 1.5, 2, 3]) * 1e-3, into = Math.random() < 0.6;
    const fig = nodal1Fig(Vs, R1, R2, Is, into);
    const v1 = Schem.solve(fig).v('1');
    const sgn = into ? '-' : '+';
    return {
      q: 'Use nodal analysis to find $v_1$. (Tip: with resistors in kΩ, currents come out in mA.)',
      fig, parts: [{ lbl: 'v_1', unit: 'V', ans: v1 }],
      hints: [
        'Only one node is unknown: $v_1$. Write KCL there as "sum of currents **leaving** = 0".',
        'Through each resistor, the current leaving is $\\dfrac{v_1 - v_{\\text{other end}}}{R}$. A source pushing current **into** the node counts as a negative "leaving" term.',
      ],
      sol: `KCL at node 1, currents leaving:\n\n$$\\frac{v_1 - ${f(Vs)}}{${k(R1)}} + \\frac{v_1}{${k(R2)}} ${sgn} ${f(Is * 1e3)} = 0$$\n\n$$v_1\\left(\\frac{1}{${k(R1)}} + \\frac{1}{${k(R2)}}\\right) = \\frac{${f(Vs)}}{${k(R1)}} ${into ? '+' : '-'} ${f(Is * 1e3)}\\quad\\Rightarrow\\quad v_1 = ${Vv(v1)}$$`,
    };
  };

  function nodal2Fig(o) {
    return [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: Vv(o.Vs), v: o.Vs, side: 'l' }], ['w', [0, 0.5], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1', s: kO(o.R1), v: o.R1 }], ['node', [2, 0], { n: 'v_1', name: '1', side: 'ar' }],
      ['R', [2, 0], [2, 2], { n: 'R_2', s: kO(o.R2), v: o.R2 }], ['R', [2, 0], [4, 0], { n: 'R_3', s: kO(o.R3), v: o.R3 }],
      ['node', [4, 0], { n: 'v_2', name: '2', side: 'ar' }], ['R', [4, 0], [4, 2], { n: 'R_4', s: kO(o.R4), v: o.R4 }],
      ['w', [4, 0], [5.6, 0]],
      o.into ? ['I', [5.6, 2], [5.6, 0], { n: 'I_S', s: mA(o.Is), v: o.Is }] : ['I', [5.6, 0], [5.6, 2], { n: 'I_S', s: mA(o.Is), v: o.Is }],
      ['w', [0, 1.5], [0, 2], [5.6, 2]], ['gnd', [2, 2]],
    ];
  }
  const nodal2Params = () => ({
    Vs: pick([5, 6, 8, 10, 12]), R1: pk(), R2: pk(), R3: pk(), R4: pk(),
    Is: pick([0.5, 1, 1.5, 2]) * 1e-3, into: Math.random() < 0.65,
  });

  GENS.nodal2 = () => {
    const o = nodal2Params();
    const fig = nodal2Fig(o);
    const S = Schem.solve(fig);
    const v1 = S.v('1'), v2 = S.v('2');
    const g = (r) => `\\tfrac{1}{${k(r)}}`;
    const a11 = 1e3 / o.R1 + 1e3 / o.R2 + 1e3 / o.R3, a22 = 1e3 / o.R3 + 1e3 / o.R4, a12 = -1e3 / o.R3;
    const b1 = o.Vs * 1e3 / o.R1, b2 = (o.into ? 1 : -1) * o.Is * 1e3;
    return {
      q: 'Find the node voltages $v_1$ and $v_2$.',
      fig, parts: [{ lbl: 'v_1', unit: 'V', ans: v1 }, { lbl: 'v_2', unit: 'V', ans: v2 }],
      hints: [
        'Two unknown nodes, so write two KCL equations, one at each node. Use "currents leaving = 0" everywhere.',
        '$R_3$ connects the two nodes. At node 1 its term is $\\dfrac{v_1 - v_2}{R_3}$; at node 2 it is $\\dfrac{v_2 - v_1}{R_3}$.',
        'Shortcut ("by inspection"): diagonal = sum of conductances touching that node; off-diagonal = minus the conductance between the two nodes; right side = current pushed **in** by sources.',
      ],
      sol: `**KCL at node 1:** $\\;\\dfrac{v_1-${f(o.Vs)}}{${k(o.R1)}}+\\dfrac{v_1}{${k(o.R2)}}+\\dfrac{v_1-v_2}{${k(o.R3)}}=0$\n\n**KCL at node 2:** $\\;\\dfrac{v_2-v_1}{${k(o.R3)}}+\\dfrac{v_2}{${k(o.R4)}}${o.into ? '-' : '+'}${f(o.Is * 1e3)}=0$\n\nCollect terms (conductances in mS, currents in mA):\n\n$$\\begin{bmatrix}${g(o.R1)}+${g(o.R2)}+${g(o.R3)} & -${g(o.R3)}\\\\ -${g(o.R3)} & ${g(o.R3)}+${g(o.R4)}\\end{bmatrix}\\begin{bmatrix}v_1\\\\v_2\\end{bmatrix}=\\begin{bmatrix}${f(b1)}\\\\${f(b2)}\\end{bmatrix}$$\n\ni.e. $${f(a11)}\\,v_1 ${f(a12)}\\,v_2 = ${f(b1)}$ and $${f(a12)}\\,v_1 + ${f(a22)}\\,v_2 = ${f(b2)}$. Solving:\n\n$$v_1 = ${Vv(v1)},\\qquad v_2 = ${Vv(v2)}$$`,
    };
  };

  GENS.nodal_setup = () => {
    const o = nodal2Params();
    const fig = nodal2Fig(o);
    const at2 = Math.random() < 0.5;
    let opts;
    if (!at2) {
      opts = [
        ['\\dfrac{v_1-V_S}{R_1}+\\dfrac{v_1}{R_2}+\\dfrac{v_1-v_2}{R_3}=0', null],
        ['\\dfrac{V_S-v_1}{R_1}+\\dfrac{v_1}{R_2}+\\dfrac{v_1-v_2}{R_3}=0', 'The first term is written as current **entering**, the others as **leaving**. Pick one convention and use it for every term.'],
        ['\\dfrac{v_1-V_S}{R_1}+\\dfrac{v_1}{R_2}=0', 'This drops the branch through $R_3$. Every element touching node 1 needs a term.'],
        ['\\dfrac{v_1-V_S}{R_1}+\\dfrac{v_1}{R_2}+\\dfrac{v_2-v_1}{R_3}=0', 'The $R_3$ term is the current *entering* node 1. Leaving is $(v_1-v_2)/R_3$.'],
      ];
    } else {
      const s = o.into ? '-' : '+';
      const w = o.into ? '+' : '-';
      opts = [
        [`\\dfrac{v_2-v_1}{R_3}+\\dfrac{v_2}{R_4}${s}I_S=0`, null],
        [`\\dfrac{v_2-v_1}{R_3}+\\dfrac{v_2}{R_4}${w}I_S=0`, `The source's arrow points ${o.into ? '**into**' : '**out of**'} node 2, so in a "leaving" sum it carries a ${o.into ? 'minus' : 'plus'} sign.`],
        [`\\dfrac{v_2}{R_3}+\\dfrac{v_2}{R_4}${s}I_S=0`, 'The current in $R_3$ depends on the voltage *across* it: $v_2 - v_1$, not $v_2$ alone.'],
        [`\\dfrac{v_2-v_1}{R_3}+\\dfrac{v_2}{R_4}+\\dfrac{v_2-V_S}{R_1}${s}I_S=0`, '$R_1$ does not touch node 2. Only elements connected to the node belong in its equation.'],
      ];
    }
    const order = sh(opts.map((x, i) => i));
    return {
      q: `Which equation is the correct KCL at **node ${at2 ? 2 : 1}**, written as currents leaving the node?`,
      fig,
      parts: [{ mc: order.map((i) => `$${opts[i][0]}$`), a: order.indexOf(0), why: order.map((i) => opts[i][1]) }],
      hints: ['List every element touching the node. Each one contributes exactly one term.'],
      sol: `Correct: $${opts[0][0]}$.\n\nEvery element touching the node contributes one term. Resistor currents leaving are $(v_{\\text{this}} - v_{\\text{other}})/R$, and a current source is $+I$ if its arrow leaves the node, $-I$ if it enters.`,
    };
  };

  GENS.supernode = () => {
    const Is = pick([1, 2, 3, 4]) * 1e-3, Vf = pick([2, 3, 4, 5, 6]);
    const R1 = pk(), R2 = pk(), R3 = pk();
    const plusRight = Math.random() < 0.5;
    const fig = [
      ['I', [0, 2], [0, 0], { n: 'I_S', s: mA(Is), v: Is, side: 'l' }], ['w', [0, 0], [1, 0]],
      ['node', [1, 0], { n: 'v_1', name: '1', side: 'al' }], ['R', [1, 0], [1, 2], { n: 'R_1', s: kO(R1), v: R1 }],
      plusRight ? ['V', [3, 0], [1, 0], { n: 'V_F', s: Vv(Vf), v: Vf }] : ['V', [1, 0], [3, 0], { n: 'V_F', s: Vv(Vf), v: Vf }],
      ['node', [3, 0], { n: 'v_2', name: '2', side: 'ar' }], ['R', [3, 0], [3, 2], { n: 'R_2', s: kO(R2), v: R2 }],
      ['w', [3, 0], [4.6, 0]], ['R', [4.6, 0], [4.6, 2], { n: 'R_3', s: kO(R3), v: R3 }],
      ['w', [0, 2], [4.6, 2]], ['gnd', [1, 2]],
    ];
    const S = Schem.solve(fig);
    const v1 = S.v('1'), v2 = S.v('2');
    const cons = plusRight ? `v_2 - v_1 = ${f(Vf)}` : `v_1 - v_2 = ${f(Vf)}`;
    return {
      q: 'The voltage source $V_F$ floats between two unknown nodes. Find $v_1$ and $v_2$.',
      fig, parts: [{ lbl: 'v_1', unit: 'V', ans: v1 }, { lbl: 'v_2', unit: 'V', ans: v2 }],
      hints: [
        "You can't write the current through a voltage source directly. Draw a closed bubble around **both** nodes and the source: that bubble is a **supernode**.",
        'Write one KCL for everything leaving the bubble, plus the constraint the source imposes on $v_1$ and $v_2$.',
      ],
      sol: `**Supernode KCL** (everything leaving the bubble):\n\n$$-${f(Is * 1e3)} + \\frac{v_1}{${k(R1)}} + \\frac{v_2}{${k(R2)}} + \\frac{v_2}{${k(R3)}} = 0$$\n\n**Constraint** from the source: $${cons}$.\n\nSubstitute and solve: $v_1 = ${Vv(v1)}$, $v_2 = ${Vv(v2)}$.`,
    };
  };

  GENS.mesh2 = () => {
    const V1 = pick([5, 6, 8, 10, 12]), V2 = pick([2, 3, 4, 5, 6]);
    const R1 = pk(), R2 = pk(), R3 = pk();
    const v2Top = Math.random() < 0.5;
    const fig = [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_1', s: Vv(V1), v: V1, side: 'l' }], ['w', [0, 0.5], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1', s: kO(R1), v: R1, id: 'R1' }], ['R', [2, 0], [2, 2], { n: 'R_3', s: kO(R3), v: R3 }],
      ['R', [2, 0], [4, 0], { n: 'R_2', s: kO(R2), v: R2, id: 'R2' }], ['w', [4, 0], [4, 0.5]],
      v2Top ? ['V', [4, 0.5], [4, 1.5], { n: 'V_2', s: Vv(V2), v: V2 }] : ['V', [4, 1.5], [4, 0.5], { n: 'V_2', s: Vv(V2), v: V2 }],
      ['w', [4, 1.5], [4, 2], [0, 2], [0, 1.5]], ['gnd', [2, 2]],
      ['txt', [1, 1.05], '$i_1\\;\\circlearrowright$', { a: 'c' }], ['txt', [3.05, 1.05], '$i_2\\;\\circlearrowright$', { a: 'c' }],
    ];
    const S = Schem.solve(fig);
    const i1 = S.iR('R1'), i2 = S.iR('R2');
    const d2 = v2Top ? `+ ${f(V2)}` : `- ${f(V2)}`;
    return {
      q: 'Use mesh analysis with both mesh currents clockwise. Find $i_1$ and $i_2$.',
      fig, parts: [{ lbl: 'i_1', unit: 'mA', ans: i1 * 1e3 }, { lbl: 'i_2', unit: 'mA', ans: i2 * 1e3 }],
      hints: [
        'Write KVL around each mesh, walking in the direction of that mesh current.',
        'The shared resistor $R_3$ carries $i_1 - i_2$ when you are in mesh 1 (and $i_2 - i_1$ in mesh 2).',
        'Sources: walking into the $+$ terminal is a drop ($+V$); walking into the $-$ terminal is a rise ($-V$).',
      ],
      sol: `**Mesh 1:** $\\;-${f(V1)} + ${k(R1)}\\,i_1 + ${k(R3)}(i_1 - i_2) = 0$\n\n**Mesh 2:** $\\;${k(R3)}(i_2 - i_1) + ${k(R2)}\\,i_2 ${d2} = 0$\n\n(kΩ and mA.) Solving: $i_1 = ${mA(i1)}$, $i_2 = ${mA(i2)}$. The current in $R_3$ (downward) is $i_1 - i_2 = ${mA(i1 - i2)}$.`,
    };
  };

  GENS.depnodal = () => {
    const Vs = pick([1, 2, 3, 5]), R1 = pk([1, 2, 5, 10]), R2 = pk([2, 4, 5, 10]), R3 = pk([2, 5, 10, 20]), RL = pk([2, 4, 5, 10]);
    const gm = pick([0.5, 1, 2]) * 1e-3;
    const fig = [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: Vv(Vs), v: Vs, side: 'l' }], ['w', [0, 0.5], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1', s: kO(R1), v: R1 }], ['node', [2, 0], { n: 'v_x', name: 'x', side: 'al' }],
      ['R', [2, 0], [2, 2], { n: 'R_2', s: kO(R2), v: R2 }], ['R', [2, 0], [4, 0], { n: 'R_3', s: kO(R3), v: R3 }],
      ['node', [4, 0], { n: 'v_o', name: 'o', side: 'ar' }],
      ['G', [4, 0], [4, 2], { n: 'g_m v_x', s: `g_m=${f(gm * 1e3)}\\,\\text{mS}`, g: gm, c: ['x', '0'] }],
      ['w', [4, 0], [5.8, 0]], ['R', [5.8, 0], [5.8, 2], { n: 'R_L', s: kO(RL), v: RL }],
      ['w', [0, 1.5], [0, 2], [5.8, 2]], ['gnd', [2, 2]],
    ];
    const S = Schem.solve(fig);
    const vx = S.v('x'), vo = S.v('o');
    return {
      q: 'The diamond is a voltage-controlled current source, $g_m v_x$, pulling current down out of node $v_o$. Find $v_x$ and $v_o$.',
      fig, parts: [{ lbl: 'v_x', unit: 'V', ans: vx }, { lbl: 'v_o', unit: 'V', ans: vo }],
      hints: [
        'Treat the dependent source like an ordinary current source of value $g_m v_x$ when writing KCL.',
        'Here the controlling voltage $v_x$ is already a node voltage, so no extra equation is needed. Write KCL at $v_x$ and at $v_o$.',
      ],
      sol: `**KCL at $v_x$:** $\\;\\dfrac{v_x-${f(Vs)}}{${k(R1)}}+\\dfrac{v_x}{${k(R2)}}+\\dfrac{v_x-v_o}{${k(R3)}}=0$\n\n**KCL at $v_o$:** $\\;\\dfrac{v_o-v_x}{${k(R3)}}+\\dfrac{v_o}{${k(RL)}}+${f(gm * 1e3)}\\,v_x=0$\n\n(The source's current *leaves* $v_o$ downward, so it is $+g_mv_x$ in the leaving sum.) Solving: $v_x = ${Vv(vx)}$, $v_o = ${Vv(vo)}$.`,
    };
  };

  // ================================================================ Unit 1 — linearity & equivalents
  GENS.superpos = () => {
    const Vs = pick([4, 5, 6, 8, 10, 12]), R1 = pk(), R2 = pk(), Is = pick([0.5, 1, 1.5, 2, 3]) * 1e-3, into = Math.random() < 0.6;
    const fig = nodal1Fig(Vs, R1, R2, Is, into);
    const va = Vs * R2 / (R1 + R2), vb = (into ? 1 : -1) * Is * U.par(R1, R2);
    const tot = Schem.solve(fig).v('1');
    return {
      q: 'Use superposition. Find the part of $v_1$ due to $V_S$ alone, the part due to $I_S$ alone, and the total.',
      fig,
      parts: [{ lbl: "v_1'\\ (V_S\\text{ only})", unit: 'V', ans: va }, { lbl: "v_1''\\ (I_S\\text{ only})", unit: 'V', ans: vb }, { lbl: 'v_1', unit: 'V', ans: tot }],
      hints: [
        'With $I_S$ turned off (**open** circuit), the circuit is a plain voltage divider.',
        'With $V_S$ turned off (**short** circuit), $R_1$ and $R_2$ are in parallel from node 1 to ground, and $I_S$ flows into that parallel pair.',
      ],
      sol: `**$V_S$ alone** ($I_S$ open): $v_1' = ${f(Vs)}\\cdot\\dfrac{${k(R2)}}{${k(R1)}+${k(R2)}} = ${Vv(va)}$\n\n**$I_S$ alone** ($V_S$ shorted): $v_1'' = ${into ? '' : '-'}I_S\\,(R_1\\pl R_2) = ${into ? '' : '-'}${f(Is * 1e3)}\\times${f(U.par(R1, R2) / 1000)} = ${Vv(vb)}$\n\n**Total:** $v_1 = v_1' + v_1'' = ${Vv(tot)}$. Superposition works here only because every element is linear.`,
    };
  };

  GENS.thev_indep = () => {
    const Vs = pick([6, 8, 10, 12, 15]), R1 = pk(), R2 = pk(), R3 = pk();
    const withI = Math.random() < 0.4;
    const Is = pick([1, 2]) * 1e-3;
    const fig = [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: Vv(Vs), v: Vs, side: 'l' }], ['w', [0, 0.5], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1', s: kO(R1), v: R1 }], ['R', [2, 0], [2, 2], { n: 'R_2', s: kO(R2), v: R2 }],
      ['R', [2, 0], [4, 0], { n: 'R_3', s: kO(R3), v: R3 }], ['term', [4, 0], { n: 'a', name: 'a' }],
      ['w', [0, 1.5], [0, 2], [4, 2]], ['term', [4, 2], { n: 'b' }], ['gnd', [2, 2]],
    ];
    if (withI) fig.splice(4, 0, ['w', [2, 0], [2, -0.9], [3.2, -0.9]], ['I', [3.2, -0.9], [4.4, -0.9], { n: 'I_S', s: mA(Is), v: Is }], ['w', [4.4, -0.9], [4.4, 0], [4, 0]]);
    const T = Schem.thevenin(fig, 'a');
    return {
      q: 'Find the Thévenin equivalent seen at terminals $a$–$b$.',
      fig, parts: [{ lbl: '\\VTH', unit: 'V', ans: T.VTH }, { lbl: '\\RTH', unit: 'kΩ', ans: T.RTH / 1000 }],
      hints: [
        '$\\VTH$ is the **open-circuit** voltage at $a$. With nothing connected at $a$, $R_3$ carries ' + (withI ? 'only the source current $I_S$.' : 'no current, so it has no voltage drop.'),
        '$\\RTH$: turn off independent sources ($V_S$ → short' + (withI ? ', $I_S$ → open' : '') + ') and combine the resistors as seen from $a$–$b$.',
      ],
      sol: withI
        ? `**$\\RTH$:** $V_S$ shorted, $I_S$ opened: $\\RTH = (R_1\\pl R_2) + R_3 = ${f(T.RTH / 1000)}\\kO$.\n\n**$\\VTH$** by superposition. $V_S$ alone ($I_S$ open): no current in $R_3$, so $v_a = ${f(Vs)}\\frac{${k(R2)}}{${k(R1)}+${k(R2)}} = ${Vv(Vs * R2 / (R1 + R2))}$. $I_S$ alone ($V_S$ shorted): with $a$ open, the source current has nowhere to go but back through $R_3$, so it circulates in that little loop and adds $I_SR_3 = ${Vv(Is * R3)}$ across $R_3$. Total: $\\VTH = ${Vv(T.VTH)}$. Check: $\\IN = \\VTH/\\RTH = ${mA(T.IN)}$.`
        : `**$\\VTH$:** no current in $R_3$, so $\\VTH$ is just the divider voltage: $${f(Vs)}\\cdot\\dfrac{${k(R2)}}{${k(R1)}+${k(R2)}} = ${Vv(T.VTH)}$.\n\n**$\\RTH$:** short $V_S$; then $R_1 \\pl R_2$ in series with $R_3$: $\\RTH = ${f(U.par(R1, R2) / 1000)} + ${k(R3)} = ${f(T.RTH / 1000)}\\kO$.\n\nCheck: $\\IN = \\VTH/\\RTH = ${mA(T.IN)}$.`,
    };
  };

  GENS.thev_dep = () => {
    const v = pick(['cs', 'follower', 'transR', 'feedback']);
    let fig, sol, q, units = { vth: 'mV', scale: 1e3 };
    if (v === 'cs') {
      const gm = pick([1, 2, 4, 5]) * 1e-3, RD = pk([2, 4, 5, 10]), RS = pick([200, 250, 500, 1000]);
      fig = FIGS.cs({ vin: 0.01, vins: '10\\,\\text{mV}', gm, gms: `${f(gm * 1e3)}\\,\\text{mS}`, RD, RDs: kO(RD), RS, RSs: kO(RS) });
      const T = Schem.thevenin(fig, 'o');
      q = 'Small-signal model of a degenerated common-source stage. Find $\\VTH$ and $\\RTH$ at $v_{out}$.';
      sol = `$\\VTH = -\\dfrac{g_mR_D}{1+g_mR_S}v_{in} = -\\dfrac{${f(gm * RD)}}{1+${f(gm * RS)}}(10\\,\\text{mV}) = ${f(T.VTH * 1e3)}\\,\\text{mV}$\n\n$\\RTH = R_D = ${kO(RD)}$. Grounding $v_{in}$ forces $v_x = 0$ (KCL at the source node gives $v_s(g_m + 1/R_S) = 0$), so the dependent source is dead and the test source sees only $R_D$.`;
      return { q, fig, parts: [{ lbl: '\\VTH', unit: 'mV', ans: T.VTH * 1e3 }, { lbl: '\\RTH', unit: 'kΩ', ans: T.RTH / 1000 }], hints: hintsDep, sol };
    }
    if (v === 'follower') {
      const gm = pick([1, 2, 4, 5]) * 1e-3, RO = pk([10, 20, 50]), RS = pk([1, 2, 4]);
      fig = FIGS.follower({ vin: 0.01, vins: '10\\,\\text{mV}', gm, gms: `${f(gm * 1e3)}\\,\\text{mS}`, RO, ROs: kO(RO), RS, RSs: kO(RS) });
      const T = Schem.thevenin(fig, 'o');
      const Rp = U.par(RS, RO);
      q = 'Small-signal model of a source follower. Find $\\VTH$ and $\\RTH$ at $v_{out}$.';
      sol = `With $R' = R_S\\pl R_O = ${kO(Rp)}$: $\\VTH = \\dfrac{g_mR'}{1+g_mR'}v_{in} = ${f(T.VTH * 1e3)}\\,\\text{mV}$.\n\n$\\RTH = \\dfrac{1}{g_m}\\pl R_S\\pl R_O = ${f(1 / gm / 1000)}\\pl${k(RS)}\\pl${k(RO)} = ${f(T.RTH / 1000)}\\kO$. With the input grounded, the dependent source acts exactly like a resistor $1/g_m$.`;
      return { q, fig, parts: [{ lbl: '\\VTH', unit: 'mV', ans: T.VTH * 1e3 }, { lbl: '\\RTH', unit: 'kΩ', ans: T.RTH / 1000 }], hints: hintsDep, sol };
    }
    if (v === 'transR') {
      const gm = pick([1, 2, 5]) * 1e-3, RF = pk([5, 10, 20]), R1 = pk([1, 2, 5]);
      const iin = 0.1e-3;
      fig = FIGS.transR({ iin, iins: '0.1\\,\\text{mA}', gm, gms: `${f(gm * 1e3)}\\,\\text{mS}`, RF, RFs: kO(RF), R1, R1s: kO(R1) });
      const T = Schem.thevenin(fig, 'o');
      q = 'A shunt-feedback stage. Find the open-circuit output voltage $\\VTH$ and the output resistance $\\RTH$.';
      sol = `KCL: $I_{IN}$ flows through $R_F$ (the $v_x$ port draws nothing), so $v_x = v_{out} + I_{IN}R_F$. At the output: $v_{out}/R_1 + g_mv_x = I_{IN}$. Together:\n\n$$v_{out} = \\frac{1-g_mR_F}{1/R_1+g_m}I_{IN} = ${Vv(T.VTH)}$$\n\n**$\\RTH$:** with $I_{IN}$ open, no current flows in $R_F$, so $v_x = v_t$ and the source draws $g_mv_t$: $\\RTH = R_1\\pl\\dfrac{1}{g_m} = ${f(T.RTH / 1000)}\\kO$.`;
      return { q, fig, parts: [{ lbl: '\\VTH', unit: 'V', ans: T.VTH }, { lbl: '\\RTH', unit: 'kΩ', ans: T.RTH / 1000 }], hints: hintsDep, sol };
    }
    // feedback amplifier (HW1 P1 structure)
    // reject combinations where R_O + (1 - A_v) R_L = 0 (R_N would be infinite)
    const { Av, RF, RO, RL } = tryUntil(
      () => ({ Av: pick([-20, -10, -5, 2, 5]), RF: pk([10, 20]), RO: pk([1, 2]), RL: pk([1, 2, 4]) }),
      (o) => Math.abs(o.RO + (1 - o.Av) * o.RL) > 200);
    const iin = 0.1e-3;
    fig = FIGS.feedback({ iin, iins: '0.1\\,\\text{mA}', Av, Avs: `A_v=${Av}`, RF, RFs: kO(RF), RO, ROs: kO(RO), RL, RLs: kO(RL) });
    const T = Schem.thevenin(fig, 'o');
    q = `The feedback amplifier from Problem Set 1, now with numbers ($A_v = ${Av}$). Find $\\VTH$ and $\\RTH$ at $v_{out}$.`;
    sol = `From PS1.1: $\\IN = i_{in}\\dfrac{R_O+A_vR_F}{R_O}$ and $\\RN = \\dfrac{R_OR_L}{R_O+(1-A_v)R_L}$.\n\n$\\RTH = ${f(T.RTH / 1000)}\\kO$, $\\VTH = \\IN\\RTH = ${Vv(T.VTH)}$.${T.RTH < 0 ? ' The resistance is **negative**, which is legal with a dependent source: here $A_v > 1 + R_O/R_L$.' : ''}`;
    return { q, fig, parts: [{ lbl: '\\VTH', unit: 'V', ans: T.VTH }, { lbl: '\\RTH', unit: 'kΩ', ans: T.RTH / 1000 }], hints: hintsDep, sol };
  };
  const hintsDep = [
    '$\\VTH$: leave the output open. Remember the $v_x$ terminals draw **no current**.',
    '$\\RTH$: turn off the **independent** input only, keep the dependent source, apply a test voltage $v_t$ at the output and find the current $i_t$ it supplies. $\\RTH = v_t/i_t$.',
  ];

  GENS.two_meas = () => {
    const c = tryUntil(() => {
      const VTH = pick([6, 8, 9, 10, 12]), RTH = pick([0.5, 1, 1.5, 2, 3, 4]);
      const [RL1, RL2] = sh([1, 2, 3, 4, 5, 6, 8]).slice(0, 2);
      return { VTH, RTH, RL1, RL2, I1: VTH / (RTH + RL1), I2: VTH / (RTH + RL2) };
    }, (o) => clean(o.I1, 3) && clean(o.I2, 3));
    return {
      q: `A linear circuit (sources and resistors inside, unknown) drives a load. With $R_L = ${c.RL1}\\kO$ the load current is $${f(c.I1)}\\,\\text{mA}$. With $R_L = ${c.RL2}\\kO$ it is $${f(c.I2)}\\,\\text{mA}$. Find the Thévenin equivalent, and the voltage at the terminals if they were left open.`,
      fig: [['box', [0, 0], [2.2, 2], { n: 'Linear<br/>circuit' }], ['w', [2.2, 0.4], [3.4, 0.4]], ['w', [2.2, 1.6], [3.4, 1.6]], ['R', [3.4, 0.4], [3.4, 1.6], { n: 'R_L' }], ['iarr', [2.8, 0.4], 'r', { n: 'I_L' }]],
      parts: [{ lbl: '\\RTH', unit: 'kΩ', ans: c.RTH }, { lbl: 'V_{open}', unit: 'V', ans: c.VTH }],
      hints: ['Any linear two-terminal circuit is $\\VTH$ in series with $\\RTH$, so $I_L = \\VTH/(\\RTH + R_L)$ for **both** measurements.', 'Set $I_1(\\RTH + R_{L1}) = I_2(\\RTH + R_{L2})$. That is one equation in $\\RTH$.'],
      sol: `$$\\VTH = ${f(c.I1)}(\\RTH + ${c.RL1}) = ${f(c.I2)}(\\RTH + ${c.RL2})$$\n\nSolving gives $\\RTH = ${f(c.RTH)}\\kO$, then $\\VTH = ${f(c.I1)}(${f(c.RTH)} + ${c.RL1}) = ${f(c.VTH)}\\,\\text{V}$. The open-circuit voltage **is** $\\VTH$.`,
    };
  };

  GENS.reverse_thev = () => {
    const c = tryUntil(() => {
      const Vs = pick([6, 9, 10, 12, 15, 18]);
      const R1 = pick([1, 2, 3, 4, 6]), R2 = pick([1, 2, 3, 4, 6, 12]);
      return { Vs, R1, R2, VTH: Vs * R2 / (R1 + R2), RTH: R1 * R2 / (R1 + R2) };
    }, (o) => clean(o.VTH, 2) && clean(o.RTH, 2));
    const fig = [
      ['V', [0, 0.5], [0, 1.5], { s: Vv(c.Vs), v: c.Vs, side: 'l' }], ['w', [0, 0.5], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1' }], ['R', [2, 0], [2, 2], { n: 'R_2' }], ['w', [2, 0], [3, 0]], ['term', [3, 0], { n: 'A' }],
      ['w', [0, 1.5], [0, 2], [3, 2]], ['term', [3, 2], { n: 'B' }], ['gnd', [0, 2]],
    ];
    return {
      q: `The Thévenin equivalent at $A$–$B$ has $\\VTH = ${f(c.VTH)}\\,\\text{V}$ and $\\RTH = ${f(c.RTH)}\\kO$. Find $R_1$ and $R_2$.`,
      fig, parts: [{ lbl: 'R_1', unit: 'kΩ', ans: c.R1 }, { lbl: 'R_2', unit: 'kΩ', ans: c.R2 }],
      hints: ['Write both quantities symbolically: $\\VTH = V_S\\frac{R_2}{R_1+R_2}$ and $\\RTH = R_1\\pl R_2$.', 'Divide them: $\\VTH/\\RTH = V_S/R_1$. That gives $R_1$ in one line.'],
      sol: `$\\dfrac{\\VTH}{\\RTH} = \\dfrac{V_SR_2/(R_1+R_2)}{R_1R_2/(R_1+R_2)} = \\dfrac{V_S}{R_1}$ (this ratio is also the Norton current: shorting $A$–$B$ shorts out $R_2$).\n\nSo $R_1 = V_S\\RTH/\\VTH = ${f(c.Vs)}\\cdot${f(c.RTH)}/${f(c.VTH)} = ${c.R1}\\kO$. Then $R_1\\pl R_2 = ${f(c.RTH)}$ gives $R_2 = ${c.R2}\\kO$.`,
    };
  };

  GENS.twoport_gain = () => {
    const Ri = pk([5, 10, 20, 50, 100]), Avo = pick([10, 20, 50, 100]), Ro = pick([100, 200, 500, 1000]);
    const RS = pk([1, 2, 5, 10]), RL = pick([500, 1000, 2000, 5000]);
    const Av = Ri / (Ri + RS) * Avo * RL / (RL + Ro);
    const fig = [
      ['V', [0, 0.6], [0, 1.6], { n: 'v_s', side: 'l' }], ['w', [0, 0.6], [0, 0]], ['R', [0, 0], [1.6, 0], { n: 'R_S', s: kO(RS) }],
      ['R', [1.6, 0], [1.6, 2], { n: 'R_i', s: kO(Ri) }], ['vlab', [1.25, 0.3], [1.25, 1.7], { n: 'v_i', side: 'l' }],
      ['w', [0, 1.6], [0, 2], [1.6, 2]],
      ['E', [3.2, 0.6], [3.2, 1.6], { n: 'A_{vo}v_i', s: `A_{vo}=${Avo}` }], ['w', [3.2, 0.6], [3.2, 0]], ['R', [3.2, 0], [4.8, 0], { n: 'R_o', s: kO(Ro) }],
      ['R', [4.8, 0], [4.8, 2], { n: 'R_L', s: kO(RL) }], ['w', [3.2, 1.6], [3.2, 2], [4.8, 2]], ['node', [4.8, 0], { n: 'v_o', side: 'ar' }],
    ];
    return {
      q: 'A voltage-amplifier two-port is driven by a source with resistance $R_S$ and loaded by $R_L$. Find the overall gain $v_o/v_s$.',
      fig, parts: [{ lbl: 'v_o/v_s', unit: 'V/V', ans: Av }],
      hints: ['Two dividers sandwich the ideal gain: one at the input ($R_S$ vs $R_i$) and one at the output ($R_o$ vs $R_L$).'],
      sol: `$$\\frac{v_o}{v_s} = \\underbrace{\\frac{R_i}{R_i+R_S}}_{${f(Ri / (Ri + RS))}}\\cdot A_{vo}\\cdot\\underbrace{\\frac{R_L}{R_L+R_o}}_{${f(RL / (RL + Ro))}} = ${f(Av)}$$\n\nLoading only ever costs gain: both dividers are less than 1.`,
    };
  };

  GENS.yparam = () => {
    const y11 = pick([1, 2, 4]), y12 = pick([-0.5, -1, -0.25]), y21 = pick([10, 20, 40]), y22 = pick([0.5, 1, 2]);
    const vdrive = Math.random() < 0.5;
    const R = vdrive ? 1 / y22 : 1 / (y22 - y12 * y21 / y11);
    return {
      fig: FIGS.yport(vdrive),
      q: `A linear two-port has $y_{11}=${y11}$, $y_{12}=${y12}$, $y_{21}=${y21}$, $y_{22}=${y22}$ (all in mS). Port 1 is ${vdrive ? 'driven by an **ideal voltage source**' : 'driven by an **ideal current source**'}. Find $\\RTH$ looking into port 2.`,
      parts: [{ lbl: '\\RTH', unit: 'kΩ', ans: R }],
      hints: ['$I_1 = y_{11}V_1 + y_{12}V_2$ and $I_2 = y_{21}V_1 + y_{22}V_2$. Deactivate the port-1 source, apply $V_2$ and find $I_2$.', vdrive ? 'A deactivated voltage source is a **short**, so $V_1 = 0$.' : 'A deactivated current source is an **open**, so $I_1 = 0$, which ties $V_1$ to $V_2$.'],
      sol: vdrive
        ? `Voltage source off $\\Rightarrow V_1 = 0 \\Rightarrow I_2 = y_{22}V_2$. So $\\RTH = 1/y_{22} = 1/${y22}\\,\\text{mS} = ${f(R)}\\kO$. Here $y_{21}$ plays no role.`
        : `Current source off $\\Rightarrow I_1 = 0 \\Rightarrow V_1 = -\\dfrac{y_{12}}{y_{11}}V_2$. Then $I_2 = \\left(y_{22} - \\dfrac{y_{12}y_{21}}{y_{11}}\\right)V_2 = ${f(y22 - y12 * y21 / y11)}\\,\\text{mS}\\cdot V_2$, so $\\RTH = ${f(R)}\\kO$.`,
    };
  };

  GENS.cascade = () => {
    const g1 = pick([1, 2, 4]) * 1e-3, g2 = pick([1, 2, 5]) * 1e-3, R1 = pk([2, 5, 10]), R2 = pk([2, 5, 10]);
    const withLoad = Math.random() < 0.5;
    const Rin = pk([5, 10, 20]);
    const A = withLoad ? (-g1 * U.par(R1, Rin)) * (-g2 * R2) : g1 * g2 * R1 * R2;
    return {
      fig: FIGS.cascade2(withLoad),
      q: withLoad
        ? `Two common-source stages in cascade: $g_{m1}=${f(g1 * 1e3)}\\,\\text{mS}$, $R_1 = ${k(R1)}\\kO$, $g_{m2}=${f(g2 * 1e3)}\\,\\text{mS}$, $R_2=${k(R2)}\\kO$. This time the second stage has a finite input resistance $R_{in2}=${k(Rin)}\\kO$ (from its input node to ground). Find $v_{out}/v_{in}$.`
        : `Two common-source stages (each $v_{out} = -g_mRv_x$, infinite input resistance) in cascade: $g_{m1}=${f(g1 * 1e3)}\\,\\text{mS}$, $R_1 = ${k(R1)}\\kO$, $g_{m2}=${f(g2 * 1e3)}\\,\\text{mS}$, $R_2=${k(R2)}\\kO$. Find $v_{out}/v_{in}$.`,
      parts: [{ lbl: 'v_{out}/v_{in}', unit: 'V/V', ans: A }],
      hints: withLoad ? ['The second stage\'s input resistance sits in parallel with $R_1$, so stage 1 sees $R_1 \\pl R_{in2}$.'] : ['Infinite input resistance means no loading: multiply the stage gains.'],
      sol: withLoad
        ? `Stage 1 drives $R_1\\pl R_{in2} = ${f(U.par(R1, Rin) / 1000)}\\kO$: gain $-${f(g1 * U.par(R1, Rin))}$. Stage 2: $-${f(g2 * R2)}$. Product: $${f(A)}$.`
        : `$(-g_{m1}R_1)(-g_{m2}R_2) = (-${f(g1 * R1)})(-${f(g2 * R2)}) = ${f(A)}$. Two inversions make the total non-inverting.`,
    };
  };

  // ================================================================ Unit 2 — nonlinear & small-signal
  GENS.loadline = () => {
    const Vs = pick([4, 5, 6, 8, 10]), R = pk([1, 2]);
    const Von = pick([0.5, 1, 1.5, 2]), ron = pick([0.5, 1, 2]) * 1000;
    // device: I = 0 for V < Von; I = (V - Von)/ron above
    const V0 = (Vs / R + Von / ron) / (1 / R + 1 / ron), I0 = (Vs - V0) / R;
    const figHtml = Schem.plot({
      x: [0, Vs * 1.08], y: [0, Vs / R * 1e3 * 1.15], xl: 'V\\,(\\text{V})', yl: 'I\\,(\\text{mA})',
      xt: Array.from({ length: Math.floor(Vs) + 1 }, (_, i) => i).filter((i) => i % (Vs > 6 ? 2 : 1) === 0),
      yt: [0, f(Vs / R * 1e3 / 2), f(Vs / R * 1e3)].map(Number),
      curves: [{ f: (v) => (v < Von ? 0 : (v - Von) / ron * 1e3), cls: 'dc' }, { f: (v) => (Vs - v) / R * 1e3, from: 0, to: Vs, cls: '' }],
    });
    return {
      q: `A device with the amber $I$–$V$ curve ($I = 0$ below $${f(Von)}\\,\\text{V}$, then slope $1/${f(ron / 1000)}\\kO$) is driven by $V_S = ${f(Vs)}\\,\\text{V}$ through $R = ${k(R)}\\kO$. The teal line is the load line. Find its current-axis intercept and the operating point.`,
      figHtml,
      parts: [{ lbl: 'I_{sc}=V_S/R', unit: 'mA', ans: Vs / R * 1e3 }, { lbl: 'V_0', unit: 'V', ans: V0 }, { lbl: 'I_0', unit: 'mA', ans: I0 * 1e3 }],
      hints: ['The load line is $I = (V_S - V)/R$. It hits $V = V_S$ when $I = 0$ and $I = V_S/R$ when $V = 0$.', `Assume the device is on its sloped part: set $(V_S - V)/R = (V - ${f(Von)})/r_{on}$.`],
      sol: `Load line intercepts: $V_S = ${f(Vs)}\\,\\text{V}$ and $V_S/R = ${f(Vs / R * 1e3)}\\,\\text{mA}$.\n\nOn the sloped part: $\\dfrac{${f(Vs)} - V}{${k(R)}} = \\dfrac{V - ${f(Von)}}{${f(ron / 1000)}}$ gives $V_0 = ${Vv(V0)}$, $I_0 = ${mA(I0)}$. Check: $V_0 > ${f(Von)}\\,\\text{V}$, so the device really is on the sloped segment.`,
    };
  };

  GENS.pwl_q = () => {
    const c = tryUntil(() => {
      const Va = pick([1, 2]), r1 = pick([2, 3, 4]) * 1000, Vb = Va + pick([1, 2]), r2 = pick([1, 2, 4, 5]) * 1000;
      const Vs = pick([5, 6, 8, 10, 12]), R = pk([1, 2, 3]);
      const Ib = (Vb - Va) / r1;
      // try segment 2 then segment 3
      let V0 = (Vs / R + Va / r1) / (1 / R + 1 / r1), seg = 2;
      if (V0 >= Vb) { V0 = (Vs / R - Ib + Vb / r2) / (1 / R + 1 / r2); seg = 3; }
      if (V0 < Va) { V0 = Vs; seg = 1; }
      return { Va, r1, Vb, r2, Vs, R, Ib, V0, I0: (Vs - V0) / R, seg };
    }, (o) => o.seg > 1 && clean(o.V0, 2) && clean(o.I0 * 1e3, 3));
    const rd = c.seg === 2 ? c.r1 : c.r2;
    const vs = 20e-3;
    const vo = vs * rd / (rd + c.R);
    return {
      fig: FIGS.vrx(c.Vs, c.R),
      figHtml: FIGS.pwlPlot(c),
      q: `A nonlinear device has
$$I(V)=\\begin{cases}0, & V<${c.Va}\\,\\text{V}\\\\ \\dfrac{V-${c.Va}}{${k(c.r1)}\\,\\text{k}\\Omega}, & ${c.Va}\\le V<${c.Vb}\\,\\text{V}\\\\ ${f(c.Ib * 1e3)}\\,\\text{mA}+\\dfrac{V-${c.Vb}}{${k(c.r2)}\\,\\text{k}\\Omega}, & V\\ge ${c.Vb}\\,\\text{V}\\end{cases}$$
It is driven by $V_S = ${c.Vs}\\,\\text{V}$ in series with $R = ${k(c.R)}\\kO$, plus a small signal $v_s = 20\\,\\text{mV}\\sin\\omega t$. Find the operating point, the incremental resistance, and the small-signal amplitude across the device.`,
      parts: [{ lbl: 'V_0', unit: 'V', ans: c.V0 }, { lbl: 'I_0', unit: 'mA', ans: c.I0 * 1e3 }, { lbl: 'r_d', unit: 'kΩ', ans: rd / 1000 }, { lbl: '|v_o|', unit: 'mV', ans: vo * 1e3 }],
      hints: ['Guess a segment, solve the linear equation $\\frac{V_S - V}{R} = I(V)$, then check the answer really lies in that segment.', 'The incremental resistance is $1/\\text{slope}$ of the segment you land on.', 'Small-signal circuit: $v_s$, $R$ and $r_d$ in series. It\'s a divider.'],
      sol: `Try segment ${c.seg}: solving $\\frac{${c.Vs} - V}{${k(c.R)}} = I(V)$ gives $V_0 = ${Vv(c.V0)}$, $I_0 = ${mA(c.I0)}$. Check: ${c.seg === 2 ? `$${c.Va} \\le ${f(c.V0)} < ${c.Vb}$` : `$${f(c.V0)} \\ge ${c.Vb}$`}, so the guess holds.\n\n$r_d = ${kO(rd)}$ (the reciprocal of that segment's slope).\n\n$|v_o| = 20\\,\\text{mV}\\cdot\\dfrac{${k(rd)}}{${k(rd)}+${k(c.R)}} = ${f(vo * 1e3)}\\,\\text{mV}$.`,
    };
  };

  GENS.deriv_r = () => {
    const t = pick(['poly', 'square', 'exp']);
    if (t === 'poly') {
      const a = pick([500, 1000, 2000]), b = pick([2000, 5000, 10000]), I0 = pick([1, 2, 3, 5]) * 1e-3;
      const r = a + 2 * b * I0;
      return {
      fig: FIGS.elemVI(),
        q: `A device obeys $V = g(I) = ${a}\\,I + ${b}\\,I^2$ (volts, amps). It is biased at $I_0 = ${f(I0 * 1e3)}\\,\\text{mA}$. Find its incremental resistance.`,
        parts: [{ lbl: 'r', unit: 'Ω', ans: r }],
        hints: ['$r = \\left.dV/dI\\right|_{I_0}$. Differentiate, then plug in the bias current.'],
        sol: `$r = \\dfrac{dg}{dI} = ${a} + ${2 * b}I_0 = ${a} + ${2 * b}(${f(I0)}) = ${f(r)}\\,\\Omega$.`,
      };
    }
    if (t === 'square') {
      const K = pick([0.5, 1, 2, 4]) * 1e-3, Vt = pick([0.5, 1]), V0 = Vt + pick([0.2, 0.4, 0.5, 1]);
      const gd = 2 * K * (V0 - Vt);
      return {
      fig: FIGS.elemVI(),
        q: `A device obeys $I = ${f(K * 1e3)}\\,\\text{mA/V}^2\\,(V - ${Vt})^2$ for $V > ${Vt}\\,\\text{V}$. At $V_0 = ${f(V0)}\\,\\text{V}$, find the incremental resistance.`,
        parts: [{ lbl: 'r', unit: 'Ω', ans: 1 / gd }],
        hints: ['This time $I$ is given as a function of $V$, so find $dI/dV$ and invert it.'],
        sol: `$\\dfrac{dI}{dV} = 2(${f(K * 1e3)}\\,\\text{mA/V}^2)(V_0 - ${Vt}) = ${f(gd * 1e3)}\\,\\text{mS}$, so $r = 1/${f(gd * 1e3)}\\,\\text{mS} = ${f(1 / gd)}\\,\\Omega$.`,
      };
    }
    const I0 = pick([0.25, 0.5, 1, 2, 5]) * 1e-3;
    return {
      fig: FIGS.elemVI(),
      q: `An exponential device $I = I_Se^{V/V_T}$ ($V_T = 25\\,\\text{mV}$) carries $I_0 = ${f(I0 * 1e3)}\\,\\text{mA}$. Find its incremental resistance.`,
      parts: [{ lbl: 'r', unit: 'Ω', ans: 0.025 / I0 }],
      hints: ['$dI/dV = I_Se^{V/V_T}/V_T = I/V_T$. The $I_S$ drops out.'],
      sol: `$r = \\dfrac{V_T}{I_0} = \\dfrac{25\\,\\text{mV}}{${f(I0 * 1e3)}\\,\\text{mA}} = ${f(0.025 / I0)}\\,\\Omega$.`,
    };
  };

  GENS.two_point = () => {
    const x0 = pick([1, 2, 3]), y0 = pick([2, 3, 4, 5]), dx = pick([0.1, 0.2]), slope = pick([2, 3, 4, 5, -2, -3]);
    const y1 = y0 + slope * dx, dq = pick([-0.05, -0.1, 0.05, 0.15]);
    const ans = y0 + slope * dq;
    return {
      fig: FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' }),
      q: `A nonlinear block gives $v_{OUT} = ${f(y0)}\\,\\text{V}$ at $v_{IN} = ${f(x0)}\\,\\text{V}$, and $v_{OUT} = ${f(y1)}\\,\\text{V}$ at $v_{IN} = ${f(x0 + dx)}\\,\\text{V}$. Using a first-order Taylor approximation about the first point, predict $v_{OUT}$ at $v_{IN} = ${f(x0 + dq)}\\,\\text{V}$.`,
      parts: [{ lbl: 'v_{OUT}', unit: 'V', ans }],
      hints: ['The two measurements give the slope (the small-signal gain) at the operating point.', `Then $v_{OUT} \\approx ${f(y0)} + \\text{slope}\\cdot(v_{IN} - ${f(x0)})$.`],
      sol: `Slope $= \\dfrac{${f(y1)} - ${f(y0)}}{${f(dx)}} = ${f(slope)}$. So $v_{OUT} \\approx ${f(y0)} + ${f(slope)}(${f(dq)}) = ${Vv(ans)}$.`,
    };
  };

  GENS.nl_src = () => {
    const t = pick(['sq', 'cube', 'vcvs']);
    if (t === 'sq') {
      const GM = pick([1, 2, 4]) * 1e-3, VA = pick([1, 2]), vx0 = pick([0.5, 1, 1.5, 2]);
      const K = 2 * GM * vx0 / VA;
      return {
      fig: FIGS.depsrc(t),
        q: `A dependent current source obeys $I = G_M\\dfrac{v_X^2}{V_A}$ with $G_M = ${f(GM * 1e3)}\\,\\text{mA/V}$ and $V_A = ${VA}\\,\\text{V}$. At the operating point $V_{X0} = ${f(vx0)}\\,\\text{V}$, what is its incremental transconductance $K$ (so that $i = Kv_x$)?`,
        parts: [{ lbl: 'K', unit: 'mA/V', ans: K * 1e3 }],
        hints: ['$K = dI/dv_X$ evaluated at $V_{X0}$. $G_M$ itself is **not** the answer.'],
        sol: `$K = \\dfrac{2G_MV_{X0}}{V_A} = \\dfrac{2(${f(GM * 1e3)})(${f(vx0)})}{${VA}} = ${f(K * 1e3)}\\,\\text{mA/V}$.`,
      };
    }
    if (t === 'cube') {
      const GM = pick([1, 2]) * 1e-3, VA = pick([1, 2]), vx0 = pick([0.5, 1, 2]);
      const K = 3 * GM * vx0 * vx0 / (VA * VA);
      return {
      fig: FIGS.depsrc(t),
        q: `A dependent current source obeys $I = G_M\\dfrac{v_X^3}{V_A^2}$ with $G_M = ${f(GM * 1e3)}\\,\\text{mA/V}$, $V_A = ${VA}\\,\\text{V}$. At $V_{X0} = ${f(vx0)}\\,\\text{V}$, find $K$.`,
        parts: [{ lbl: 'K', unit: 'mA/V', ans: K * 1e3 }],
        hints: ['Differentiate: $\\dfrac{d}{dv}\\,v^3 = 3v^2$.'],
        sol: `$K = \\dfrac{3G_MV_{X0}^2}{V_A^2} = \\dfrac{3(${f(GM * 1e3)})(${f(vx0)})^2}{${VA * VA}} = ${f(K * 1e3)}\\,\\text{mA/V}$.`,
      };
    }
    const A = pick([2, 5, 10]), vx0 = pick([0.5, 1, 1.4, 2]);
    return {
      fig: FIGS.depsrc(t),
      q: `A dependent **voltage** source produces $V = A\\,v_X^3$ with $A = ${A}\\,\\text{V}^{-2}$. At $V_{X0} = ${f(vx0)}\\,\\text{V}$, what is its small-signal voltage gain $dV/dv_X$?`,
      parts: [{ lbl: 'dV/dv_X', unit: 'V/V', ans: 3 * A * vx0 * vx0 }],
      hints: ['Same idea as a current source: differentiate the law at the operating point.'],
      sol: `$\\dfrac{dV}{dv_X} = 3AV_{X0}^2 = 3(${A})(${f(vx0)})^2 = ${f(3 * A * vx0 * vx0)}$.`,
    };
  };

  FIGS.nodal1 = nodal1Fig;
  FIGS.nodal2 = nodal2Fig;
  window.GEN_HELPERS = { tryUntil, clean, kO, Vv, mA, k, pk, elementsGrounded };
})();

/* gens-e3-amp.js — Exam 3 Unit 12 (BJT amplifiers, the G_M R_out method): figure builders shared with the lessons
   (window.E3AMP) and the randomized drills:
     e3_amp_stage  one BJT stage (CE, CE + R_E, CB, CC; NPN or PNP; with or without R_B): G_M, R_out, A_v, R_in in numbers
     e3_amp_sym    the same stages, symbolic: A_v and R_in (or R_out) as expressions
     e3_amp_name   recognition: input terminal, output terminal, the stage's name, the sign and size of the gain
                   (BJT and MOSFET, both polarities)
     e3_amp_chain  two stages, BJT and MOSFET mixed, with loading (CE→CC, CC→CE, CS→CC, CE→CS, CE with a PMOS load)
     e3_amp_bias   the full exam problem: DC bias → I_C → g_m, r_π → the gain (bypass and coupling capacitors, dividers)
     e3_amp_casc   the BJT cascode: r_o, r_π, R_out (the β r_o ceiling) and the gain
   Convention as in Exam 2 and Lecture 24: A_v = −G_M R_out, i_out flows from the output short into the stage.
   Every formula here was checked against an independent small-signal nodal solve (r_o → ∞ unless stated). */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, par = U.par;
  const GENS = window.GENS;
  const KO = E3.KO, MS = E3.MS, resTeX = E3.resTeX, resPart = E3.resPart;
  const VT = 0.025;
  const mA = (i) => `${f(i * 1e3, 3)}\\,\\text{mA}`;
  const Rv = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : KO(r));        // a resistor value as TeX
  // a plain numeric answer box; accept: other values that count as right (the beta >> 1 forms); traps: known slips
  const num = (lbl, unit, ans, accept = [], traps = []) => {
    const p = { lbl, unit, ans };
    const acc = accept.filter((a) => Math.abs(a - ans) > 0.012 * Math.abs(ans));
    if (acc.length) p.accept = acc;
    const ok = [ans, ...acc];
    const t = traps.filter((x) => ok.every((a) => Math.abs(x.v - a) > 0.025 * Math.abs(a)));
    if (t.length) p.traps = t;
    return p;
  };

  // ================================================================ figures
  // One transistor stage drawn the way the lectures draw it. dev: 'npn' | 'pnp' | 'nmos' | 'pmos'.
  // kind: 'ce' (input at base, output at collector; RE optional), 'cb' (base held, input at the emitter through RE),
  // 'cc' (input at base, output at the emitter, RE to the rail). RB: a resistor in series with the base.
  // NPN/NMOS: collector/drain on top. PNP/PMOS are the vertical mirror (emitter/source on top, toward V_CC).
  // flip puts the base on the right. lab: { C, E, B } = { n, s } labels; defaults R_C/R_E/R_B or R_D/R_S/R_G.
  function stage(o) {
    const P = o.dev === 'pnp' || o.dev === 'pmos', mos = o.dev === 'nmos' || o.dev === 'pmos';
    const s = o.flip ? -1 : 1;
    const X = (x) => 1 + s * (x - 1), Y = (y) => (P ? 2 - y : y);
    const pt = (x, y) => [X(x), Y(y)];
    const side = s > 0 ? 'r' : 'l', oside = s > 0 ? 'l' : 'r';
    const L = Object.assign({ C: { n: mos ? 'R_D' : 'R_C' }, E: { n: mos ? 'R_S' : 'R_E' }, B: { n: mos ? 'R_G' : 'R_B' } }, o.lab || {});
    const supC = (p) => (P ? ['gnd', p] : ['rail', p]);            // supply on the collector side
    const supE = (p) => (P ? ['rail', p] : ['gnd', p]);            // supply on the emitter side
    const sigG = (p) => (P ? ['gndu', p] : ['gnd', p]);            // the return of a source in the emitter lead
    const e = [[o.dev, [1, 1], { n: o.n || '', flip: !!o.flip }]];
    const outAt = (y) => e.push(['w', pt(1, y), pt(1.8, y)], ['term', pt(1.8, y), { n: o.out || 'v_{out}', side }]);
    // collector side
    if (o.kind === 'cc') e.push(supC(pt(1, 0)));
    else { e.push(['R', pt(1, -1.2), pt(1, 0), Object.assign({ side: oside }, L.C)], supC(pt(1, -1.2))); outAt(0); }
    // emitter side
    if (o.kind === 'cb') {
      if (o.RE) e.push(['R', pt(1, 2), pt(1, 3.2), Object.assign({ side }, L.E)], ['Vac', pt(1, 3.2), pt(1, 4.2), { n: 'v_{in}', side }], sigG(pt(1, 4.2)));
      else e.push(['Vac', pt(1, 2), pt(1, 3), { n: 'v_{in}', side }], sigG(pt(1, 3)));
    } else if (o.kind === 'cc') {
      e.push(['R', pt(1, 2), pt(1, 3.2), Object.assign({ side: oside }, L.E)], supE(pt(1, 3.2)));
      outAt(2);
    } else if (o.RE) e.push(['R', pt(1, 2), pt(1, 3.2), Object.assign({ side }, L.E)], supE(pt(1, 3.2)));
    else e.push(supE(pt(1, 2)));
    // base side (never mirrored vertically: the input source always returns to a ground below it)
    const bx = (x) => X(x);
    if (o.kind === 'cb') {
      if (o.RB) e.push(['R', [bx(-1.2), 1], [bx(0), 1], L.B], ['acg', [bx(-1.2), 1]]);
      else e.push(['acg', [bx(0), 1]]);
    } else if (o.RB) {
      e.push(['R', [bx(-1.2), 1], [bx(0), 1], L.B], ['w', [bx(-1.2), 1], [bx(-1.6), 1], [bx(-1.6), 1.4]],
        ['Vac', [bx(-1.6), 1.4], [bx(-1.6), 2.4], { n: 'v_{in}', side: s > 0 ? 'l' : 'r' }], ['gnd', [bx(-1.6), 2.4]]);
    } else {
      e.push(['w', [bx(0), 1], [bx(-0.6), 1], [bx(-0.6), 1.4]], ['Vac', [bx(-0.6), 1.4], [bx(-0.6), 2.4], { n: 'v_{in}', side: s > 0 ? 'l' : 'r' }], ['gnd', [bx(-0.6), 2.4]]);
    }
    return e;
  }

  // The hybrid-pi small-signal circuit of one stage, laid out like Lecture 24: B node with r_pi down to the E node,
  // g_m v_pi from C down to E, r_o across it (o.ro).
  //   o.b: 'vin' | 'vinRB' | 'gnd' | 'gndRB' | 'test'      what drives the base
  //   o.e: 'gnd' | 'RE' | 'REvin' | 'RLout' | 'RLtest'      what hangs on the emitter ('RLout' = R_E and the output short)
  //   o.c: 'RCshort' | 'RCtest' | 'RC' | 'gnd'              what hangs on the collector
  function model(o) {
    const e = [];
    const bxn = 1.6, xr = o.ro ? 4.4 : 3;
    e.push(['R', [bxn, 0], [bxn, 2], { n: 'r_\\pi', side: 'l' }], ['vlab', [bxn + 0.35, 0.35], [bxn + 0.35, 1.65], { n: 'v_\\pi' }]);
    e.push(['w', [bxn, 2], [3, 2]], ['G', [3, 0], [3, 2], { n: o.gm || 'g_mv_\\pi', side: 'r' }]);
    if (o.ro) e.push(['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_o' }], ['w', [3, 2], [4.4, 2]]);
    e.push(['txt', [bxn - 0.15, -0.3], '$B$', { a: 'r' }], ['txt', [3.15, -0.3], '$C$', { a: 'l' }], ['txt', [2.6, 2.35], '$E$', { a: 'l' }]);
    const short = (y, n = 'i_{out}') => [['w', [xr, y], [6, y], [6, y + 0.7]], ['gnd', [6, y + 0.7]], ['iarr', [5.2, y], 'l', { n, side: y ? 'b' : 'a' }]];
    const test = (y) => [['w', [xr, y], [5.8, y]], ['V', [5.8, y], [5.8, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [5.8, y + 1.2]], ['iarr', [5.1, y], 'l', { n: 'i_t' }]];
    // base
    if (o.b === 'vin') e.push(['w', [bxn, 0], [0, 0], [0, 0.5]], ['Vac', [0, 0.5], [0, 1.5], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.5]]);
    if (o.b === 'vinRB') e.push(['R', [-0.6, 0], [bxn, 0], { n: 'R_B' }], ['w', [-0.6, 0], [-0.6, 0.5]], ['Vac', [-0.6, 0.5], [-0.6, 1.5], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 1.5]]);
    if (o.b === 'gnd') e.push(['w', [bxn, 0], [0.6, 0], [0.6, 0.4]], ['gnd', [0.6, 0.4]]);
    if (o.b === 'gndRB') e.push(['R', [-0.4, 0], [bxn, 0], { n: 'R_B' }], ['w', [-0.4, 0], [-0.4, 0.4]], ['gnd', [-0.4, 0.4]]);
    if (o.b === 'test') e.push(['w', [bxn, 0], [0, 0]], ['V', [0, 0], [0, 1.2], { n: 'v_t', side: 'l' }], ['gnd', [0, 1.2]], ['iarr', [0.8, 0], 'r', { n: 'i_t' }]);
    // emitter
    if (o.e === 'gnd') e.push(['w', [2.3, 2], [2.3, 2.5]], ['gnd', [2.3, 2.5]]);
    if (o.e === 'RE' || o.e === 'RLout' || o.e === 'RLtest') e.push(['R', [2.3, 2], [2.3, 3.4], { n: 'R_E', side: 'l' }], ['gnd', [2.3, 3.4]]);
    if (o.e === 'REvin') e.push(['R', [2.3, 2], [2.3, 3.4], { n: 'R_E', side: 'l' }], ['Vac', [2.3, 3.4], [2.3, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [2.3, 4.4]]);
    if (o.e === 'RLout') e.push(...short(2));
    if (o.e === 'RLtest') e.push(...test(2));
    // collector
    if (o.c === 'gnd') e.push(['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]]);
    if (/^RC/.test(o.c)) e.push(['R', [3, -1.4], [3, 0], { n: 'R_C', side: 'l' }], ['gndu', [3, -1.4]]);
    if (o.c === 'RCshort') e.push(...short(0));
    if (o.c === 'RCtest') e.push(...test(0));
    return e;
  }

  // ================================================================ stage formulas (r_o -> infinity)
  // p: { gm, beta, RB, RE, RC } (rpi = beta/gm). Exact (Lecture 24) and the beta >> 1 forms.
  function stageVals(kind, p) {
    const rpi = p.beta / p.gm, b = p.beta, RB = p.RB || 0, RE = p.RE || 0, RC = p.RC;
    if (kind === 'ce' || kind === 'ceRE') {
      const den = RB + rpi + (b + 1) * RE;
      return { GM: b / den, GMa: 1 / (RB / b + 1 / p.gm + RE), Rout: RC, Av: -b * RC / den, Ava: -RC / (RB / b + 1 / p.gm + RE), Rin: den, Rina: RB + rpi + b * RE };
    }
    if (kind === 'cb') {
      const den = RB + rpi + (b + 1) * RE;
      return { GM: -b / den, GMa: -1 / (RB / b + 1 / p.gm + RE), Rout: RC, Av: b * RC / den, Ava: RC / (RB / b + 1 / p.gm + RE), Rin: RE + (RB + rpi) / (b + 1), Rina: RE + 1 / p.gm + RB / b };
    }
    // cc: RE is the emitter resistor (the output node)
    const look = (rpi + RB) / (b + 1), looka = 1 / p.gm + RB / b;
    return { GM: -(b + 1) / (rpi + RB), GMa: -1 / looka, Rout: par(RE, look), Routa: par(RE, looka), Av: RE / (RE + look), Ava: RE / (RE + looka), Rin: RB + rpi + (b + 1) * RE, Rina: RB + rpi + b * RE };
  }

  const NAMES = {
    bjt: { ce: 'common emitter', ceRE: 'common emitter with emitter degeneration', cb: 'common base', cc: 'common collector (emitter follower)' },
    mos: { ce: 'common source', ceRE: 'common source with source degeneration', cb: 'common gate', cc: 'common drain (source follower)' },
  };
  const devName = (d) => ({ npn: 'NPN', pnp: 'PNP', nmos: 'NMOS', pmos: 'PMOS' }[d]);

  // the "name it" sentence for a BJT stage
  function readStage(kind, dev, RB) {
    const pnp = dev === 'pnp';
    const where = pnp ? 'This is a **PNP** (arrow on the top lead, pointing in): emitter on top toward $V_{CC}$, collector at the bottom. Small-signal it is identical to an NPN.' : 'An **NPN**: arrow on the bottom lead pointing out, so the emitter is at the bottom and the collector on top.';
    const io = {
      ce: `$v_{in}$ reaches the **base**${RB ? ' (through $R_B$)' : ''}, $v_{out}$ is taken at the **collector**, and the emitter goes straight to its rail: the emitter is common. **Common emitter.**`,
      ceRE: `$v_{in}$ reaches the **base**${RB ? ' (through $R_B$)' : ''}, $v_{out}$ is at the **collector**, and $R_E$ sits between the emitter and its rail. **Common emitter with emitter degeneration.**`,
      cb: `The base is held (triangle${RB ? ', through $R_B$' : ''}), $v_{in}$ drives the **emitter**, $v_{out}$ is at the **collector**. The base is common. **Common base.**`,
      cc: `$v_{in}$ reaches the **base**${RB ? ' (through $R_B$)' : ''}, $v_{out}$ is taken at the **emitter**, the collector sits on its rail. The collector is common. **Common collector (emitter follower).**`,
    }[kind];
    return `${where} ${io}`;
  }

  // ================================================================ e3_amp_stage: one stage, in numbers
  const pickVals = (kind) => {
    const IC = pick([0.25, 0.5, 1, 1, 2]) * 1e-3, beta = pick([50, 100, 100, 200]);
    const gm = IC / VT;
    const RC = pick([2, 4, 5, 10]) * 1e3;
    const RE = kind === 'cc' ? pick([0.5, 1, 2, 5]) * 1e3 : kind === 'ce' ? 0 : kind === 'cb' ? pick([0, 50, 100, 200, 500]) : pick([100, 200, 250, 500, 1000]);
    const RB = Math.random() < (kind === 'cb' ? 0.5 : 0.6) ? pick([1, 2, 5, 10]) * 1e3 : 0;
    return { IC, beta, gm, RC, RE, RB };
  };

  GENS.e3_amp_stage = (o = {}) => {
    const kind = pick(o.only || ['ce', 'ceRE', 'cb', 'cc']);
    const dev = pick(['npn', 'npn', 'pnp']), flip = Math.random() < 0.3;
    const p = pickVals(kind), rpi = p.beta / p.gm;
    const v = stageVals(kind, p);
    const lab = { C: { n: 'R_C', s: Rv(p.RC) }, E: { n: 'R_E', s: Rv(p.RE) }, B: { n: 'R_B', s: Rv(p.RB) } };
    const fig = stage({ dev, kind: kind === 'ceRE' ? 'ce' : kind, RE: !!p.RE, RB: !!p.RB, flip, lab });
    const rinWhat = kind === 'cb' ? `the resistance $v_{in}$ sees (into ${p.RE ? '$R_E$ and ' : ''}the emitter)` : `the resistance $v_{in}$ sees (into ${p.RB ? '$R_B$ and ' : ''}the base)`;
    const parts = [
      num('G_M', 'mS', v.GM * 1e3, [v.GMa * 1e3], kind === 'ceRE' ? [{ v: p.gm * 1e3, msg: 'That is $g_m$ alone. $R_E$ is in the emitter: it degenerates $G_M$ to about $g_m/(1 + g_mR_E)$.' }]
        : kind === 'ce' && p.RB ? [{ v: p.gm * 1e3, msg: 'That is $g_m$, which assumes $v_\\pi = v_{in}$. The base current flows through $R_B$, so $v_\\pi = v_{in}\\,r_\\pi/(r_\\pi + R_B)$.' }] : []),
      resPart('R_{out}', v.Rout, v.Routa, kind === 'cc' ? [{ v: p.RE, msg: 'That is $R_E$ alone. The output also looks back into the emitter, which is small: $(r_\\pi + R_B)/(\\beta + 1)$, in parallel with $R_E$.' }] : []),
      num('A_v', '', v.Av, [v.Ava], kind === 'ce' && p.RB ? [{ v: -p.gm * p.RC, msg: '$-g_mR_C$ forgets the input divider: the base draws current, so only $r_\\pi/(r_\\pi + R_B)$ of $v_{in}$ reaches $v_\\pi$.' }]
        : kind === 'ceRE' ? [{ v: -p.gm * p.RC, msg: 'That ignores $R_E$. With degeneration the gain is about $-R_C/(R_E + 1/g_m)$.' }]
        : kind === 'cc' ? [{ v: 1, msg: 'Close, but not exactly 1: the follower loses the drop across $(r_\\pi + R_B)/(\\beta+1)$. Compute $R_E/(R_E + (r_\\pi + R_B)/(\\beta + 1))$.' }] : []),
      resPart('R_{in}', v.Rin, v.Rina, kind === 'ceRE' || kind === 'cc' ? [{ v: (p.RB || 0) + rpi + p.RE, msg: 'You added $R_E$ as it is. Seen from the base, an emitter resistor is $(\\beta + 1)$ times bigger.' }]
        : kind === 'cb' ? [{ v: p.RE + p.RB + rpi, msg: 'Seen from the emitter, the base side is $(\\beta + 1)$ times **smaller**: $(R_B + r_\\pi)/(\\beta + 1)$.' }] : []),
    ];
    const vals = [`\\beta = ${p.beta}`, `I_C = ${mA(p.IC)}`, `R_C = ${Rv(p.RC)}`, p.RE ? `R_E = ${Rv(p.RE)}` : '', p.RB ? `R_B = ${Rv(p.RB)}` : ''].filter(Boolean).map((x) => `$${x}$`).join(', ');
    const gmS = `g_m = \\dfrac{I_C}{V_T} = \\dfrac{${mA(p.IC)}}{25\\,\\text{mV}} = ${MS(p.gm)}`;
    const rpiS = `r_\\pi = \\dfrac{\\beta}{g_m} = ${Rv(rpi)}`;
    const b = p.beta, RB = p.RB, RE = p.RE;
    let steps;
    if (kind === 'ce' || kind === 'ceRE') {
      steps = `**$G_M$ (short the output).** The base loop: $v_{in}$ drives ${RB ? '$R_B$, then ' : ''}$r_\\pi$${RE ? ', then $R_E$, which carries $(\\beta+1)i_b$' : ''}:
$$i_b = \\frac{v_{in}}{${RB ? 'R_B + ' : ''}r_\\pi${RE ? ' + (\\beta + 1)R_E' : ''}} \\qquad i_{out} = \\beta i_b$$
$$G_M = \\frac{\\beta}{${RB ? 'R_B + ' : ''}r_\\pi${RE ? ' + (\\beta+1)R_E' : ''}} = \\frac{${b}}{${Rv(v.Rin)}} = ${MS(v.GM)}$$
${RE || RB ? `(The $\\beta\\gg1$ form $\\dfrac{1}{${RB ? 'R_B/\\beta + ' : ''}1/g_m${RE ? ' + R_E' : ''}} = ${MS(v.GMa)}$ is accepted too.)` : 'That is just $g_m$: with the emitter grounded and no $R_B$, $v_\\pi = v_{in}$.'}

**$R_{out}$ (input off).** $v_{in} = 0$ makes $v_\\pi = 0$${RE ? ' (the loop $r_\\pi$, $R_E$ has nothing driving it)' : ''}, so $g_mv_\\pi$ is dead and only $R_C$ is left ($r_o\\to\\infty$): $R_{out} = R_C = ${Rv(p.RC)}$.

**Gain.** $A_v = -G_MR_{out} = -(${MS(v.GM)})(${Rv(p.RC)}) = ${f(v.Av, 4)}$. Inverting: $v_{in}$ up pushes more current down through the collector.

**$R_{in}$.** ${RB ? '$R_B$ in series with ' : ''}the base, and the base sees $r_\\pi$${RE ? ' plus $R_E$ multiplied by $(\\beta+1)$' : ''}: $R_{in} = ${RB ? 'R_B + ' : ''}r_\\pi${RE ? ' + (\\beta + 1)R_E' : ''} = ${Rv(v.Rin)}$.`;
    } else if (kind === 'cb') {
      steps = `**$G_M$ (short the output).** KVL from ground, up through $v_{in}$${RE ? ', $R_E$ (carrying $(\\beta+1)i_b$)' : ''}, then $r_\\pi$${RB ? ' and $R_B$' : ''} back to the held base (Lecture 24):
$$0 = i_b\\,(${RB ? 'R_B + ' : ''}r_\\pi)${RE ? ' + (\\beta + 1)i_bR_E' : ''} + v_{in}\\qquad i_{out} = \\beta i_b$$
$$G_M = -\\frac{\\beta}{${RB ? 'R_B + ' : ''}r_\\pi${RE ? ' + (\\beta + 1)R_E' : ''}} = -\\frac{${b}}{${Rv(RB + rpi + (b + 1) * RE)}} = ${MS(v.GM)}$$
Negative: $v_{in}$ up lifts the emitter, $v_\\pi$ falls, the stage pulls **less** current. ($\\beta\\gg1$ form: $-1/(${RB ? 'R_B/\\beta + ' : ''}1/g_m${RE ? ' + R_E' : ''}) = ${MS(v.GMa)}$, accepted.)

**$R_{out}$.** Input off: no drive, $v_\\pi = 0$, $R_{out} = R_C = ${Rv(p.RC)}$.

**Gain.** $A_v = -G_MR_{out} = ${f(v.Av, 4)}$: positive, and as big as a common emitter with the same resistors.

**$R_{in}$.** From the emitter the base side is divided by $(\\beta + 1)$: $R_{in} = ${RE ? 'R_E + ' : ''}\\dfrac{${RB ? 'R_B + ' : ''}r_\\pi}{\\beta + 1} = ${Rv(v.Rin)}$. Small: a common base is a current buffer.`;
    } else {
      steps = `**$G_M$ (short the output, the emitter).** Now $v_\\pi = v_{in}\\dfrac{r_\\pi}{r_\\pi${RB ? ' + R_B' : ''}}$, and the short carries the whole emitter current, $(\\beta+1)i_b$, out of the stage:
$$G_M = -\\frac{\\beta + 1}{r_\\pi${RB ? ' + R_B' : ''}} = -\\frac{${b + 1}}{${Rv(rpi + RB)}} = ${MS(v.GM)}$$

**$R_{out}$.** $R_E$ in parallel with the emitter looking back in, $(r_\\pi${RB ? ' + R_B' : ''})/(\\beta + 1) = ${Rv((rpi + RB) / (b + 1))}$:
$$R_{out} = R_E\\parallel\\frac{r_\\pi${RB ? ' + R_B' : ''}}{\\beta + 1} = ${Rv(v.Rout)}$$

**Gain.** $A_v = -G_MR_{out} = \\dfrac{R_E}{R_E + (r_\\pi${RB ? ' + R_B' : ''})/(\\beta+1)} = ${f(v.Av, 4)}$: just under $+1$.

**$R_{in}$.** ${RB ? '$R_B$ plus ' : ''}the base, which sees $r_\\pi$ plus $R_E$ multiplied by $(\\beta + 1)$: $R_{in} = ${RB ? 'R_B + ' : ''}r_\\pi + (\\beta+1)R_E = ${Rv(v.Rin)}$. Big: that is why a follower is a buffer.`;
    }
    return {
      fig,
      q: `${vals}, $V_T = 25\\,\\text{mV}$, ignore $r_o$. Triangles are incremental grounds. Find $G_M$, $R_{out}$, $A_v = v_{out}/v_{in}$, and $R_{in}$, ${rinWhat}.`,
      parts,
      hints: [
        'Name the stage first: which terminal does $v_{in}$ reach, which one is $v_{out}$ taken from? The terminal left over is the "common" one.',
        `$${gmS}$ and $${rpiS}$. From the base, anything in the emitter looks $(\\beta+1)$ times bigger; from the emitter, anything at the base looks $(\\beta+1)$ times smaller.`,
      ],
      sol: `**Read the circuit.** ${readStage(kind, dev, p.RB)}

**Device numbers.** $${gmS}$, $${rpiS}$.

${steps}`,
    };
  };

  // ================================================================ e3_amp_sym: the same stages, symbolic
  GENS.e3_amp_sym = (o = {}) => {
    const kind = pick(o.only || ['ce', 'ceRE', 'cb', 'cc']);
    const dev = pick(['npn', 'pnp']), flip = Math.random() < 0.3;
    const RB = Math.random() < 0.6, RE = kind === 'ceRE' || kind === 'cc' || (kind === 'cb' && Math.random() < 0.7);
    const fig = stage({ dev, kind: kind === 'ceRE' ? 'ce' : kind, RE, RB, flip });
    const loop = ['RB', 'rpi', '(beta + 1)*RE'].filter((t, i) => (i === 0 ? RB : i === 2 ? RE : true)).join(' + ');
    const loopTeX = [RB ? 'R_B' : '', 'r_\\pi', RE ? '(\\beta + 1)R_E' : ''].filter(Boolean).join(' + ');
    const names = ['gm', 'rpi', 'beta', ...(kind === 'cc' ? [] : ['RC']), ...(RE ? ['RE'] : []), ...(RB ? ['RB'] : [])];
    let av, second, ansAv, ansSecond, why;
    if (kind === 'ce' || kind === 'ceRE') {
      av = `-beta*RC/(${loop})`; second = E3.ex(loop, names, 'R_{in}');
      ansAv = `A_v = -\\dfrac{\\beta R_C}{${loopTeX}}`; ansSecond = `R_{in} = ${loopTeX}`;
      why = `$i_b = v_{in}/(${loopTeX})$ around the base loop, $i_{out} = \\beta i_b$, $R_{out} = R_C$. In the $\\beta\\gg1$ form: $A_v\\approx -\\dfrac{R_C}{${RB ? 'R_B/\\beta + ' : ''}1/g_m${RE ? ' + R_E' : ''}}$, "collector resistance over emitter-path resistance".`;
    } else if (kind === 'cb') {
      av = `beta*RC/(${loop})`;
      const rin = `${RE ? 'RE + ' : ''}(${RB ? 'RB + ' : ''}rpi)/(beta + 1)`;
      second = E3.ex(rin, names, 'R_{in}');
      ansAv = `A_v = +\\dfrac{\\beta R_C}{${loopTeX}}`; ansSecond = `R_{in} = ${RE ? 'R_E + ' : ''}\\dfrac{${RB ? 'R_B + ' : ''}r_\\pi}{\\beta + 1}`;
      why = `Lecture 24: $G_M = -\\beta/(${loopTeX})$, $R_{out} = R_C$, so $A_v = -G_MR_{out}$ is positive. $R_{in}$: from the emitter, the base side is divided by $(\\beta + 1)$.`;
    } else {
      av = `(beta + 1)*RE/(${loop})`;
      const ro = `RE || ((rpi${RB ? ' + RB' : ''})/(beta + 1))`;
      second = E3.ex(ro, names, 'R_{out}');
      ansAv = `A_v = \\dfrac{(\\beta+1)R_E}{${loopTeX}}`; ansSecond = `R_{out} = R_E\\parallel\\dfrac{r_\\pi${RB ? ' + R_B' : ''}}{\\beta + 1}`;
      why = `$G_M = -(\\beta+1)/(r_\\pi${RB ? ' + R_B' : ''})$ and $R_{out} = R_E\\parallel(r_\\pi${RB ? ' + R_B' : ''})/(\\beta+1)$; multiply and simplify. In the $\\beta\\gg1$ form $A_v\\approx R_E/(R_E + 1/g_m${RB ? ' + R_B/\\beta' : ''})$.`;
    }
    return {
      fig,
      q: `Find $A_v = v_{out}/v_{in}$ and ${kind === 'cc' ? '$R_{out}$' : '$R_{in}$ (the resistance $v_{in}$ sees)'} symbolically. Ignore $r_o$. Use \`gm\`, \`rpi\`, \`beta\`${kind === 'cc' ? '' : ', `RC`'}${RE ? ', `RE`' : ''}${RB ? ', `RB`' : ''}. The $\\beta\\gg1$ forms (with $r_\\pi/\\beta = 1/g_m$) are accepted.`,
      parts: [E3.ex(av, names, 'A_v'), second],
      hints: ['Name the stage, then write its $G_M$ and $R_{out}$ (Lecture 24 table).', 'The base loop always holds $r_\\pi$ plus anything at the base, plus $(\\beta+1)\\times$ anything in the emitter.'],
      sol: `${readStage(kind, dev, RB)}

$$${ansAv}\\qquad ${ansSecond}$$

${why}`,
    };
  };

  // ================================================================ e3_amp_name: read the circuit, name it, predict the gain
  GENS.e3_amp_name = () => {
    const dev = pick(['npn', 'pnp', 'npn', 'pnp', 'nmos', 'pmos']);
    const kind = pick(['ce', 'ceRE', 'cb', 'cb', 'cc', 'cc']);
    const mos = dev === 'nmos' || dev === 'pmos';
    const flip = Math.random() < 0.4;
    const RB = Math.random() < 0.4, RE = kind === 'ceRE' || kind === 'cc' || (kind === 'cb' && Math.random() < 0.5);
    const fig = stage({ dev, kind: kind === 'ceRE' ? 'ce' : kind, RE, RB, flip });
    const T = mos ? ['Gate', 'Source', 'Drain'] : ['Base', 'Emitter', 'Collector'];
    const [tb, te, tc] = T;
    const inT = kind === 'cb' ? 1 : 0, outT = kind === 'cc' ? 1 : 2;
    const top = (dev === 'npn' || dev === 'nmos') ? tc : te, bot = (dev === 'npn' || dev === 'nmos') ? te : tc;
    const arrow = mos ? (dev === 'nmos' ? 'NMOS: arrow on the bottom lead, pointing out (the source)' : 'PMOS: arrow on the top lead, pointing in (the source, toward $V_{DD}$)')
      : (dev === 'npn' ? 'NPN: arrow on the bottom lead, pointing out (the emitter)' : 'PNP: arrow on the top lead, pointing in (the emitter, toward $V_{CC}$)');
    const nm = NAMES[mos ? 'mos' : 'bjt'];
    const kinds = ['ce', 'ceRE', 'cb', 'cc'];
    const RC = mos ? 'R_D' : 'R_C', REn = mos ? 'R_S' : 'R_E';
    const sizes = [
      `Inverting and large: about $-g_m${RC}$`,
      `Inverting, set by the resistors: about $-${RC}/(${REn} + 1/g_m)$`,
      `Non-inverting: $+${RC}$ over the ${mos ? 'source' : 'emitter'}-path resistance (about $+g_m${RC}$ with no ${'$' + REn + '$'})`,
      'Non-inverting, just under $+1$ (a follower)',
    ];
    const sizeIx = { ce: 0, ceRE: 1, cb: 2, cc: 3 }[kind];
    const tWhy = (j, want, what) => (j === want ? null
      : `Follow the ${what} wire: it lands on the ${T[want].toLowerCase()}. ${arrow}; the top lead is the ${top.toLowerCase()}, the bottom lead the ${bot.toLowerCase()}${mos ? ', the plate on the side the gate' : ', the bar on the side the base'}.`);
    const nameWhy = (j) => (j === kinds.indexOf(kind) ? null : `That is the ${nm[kinds[j]]}. ${{
      ce: `It needs the input on the ${tb.toLowerCase()}, the output on the ${tc.toLowerCase()} and the ${te.toLowerCase()} straight on its rail.`,
      ceRE: `It needs a resistor between the ${te.toLowerCase()} and its rail, with input on the ${tb.toLowerCase()} and output on the ${tc.toLowerCase()}.`,
      cb: `It needs the ${tb.toLowerCase()} held and the input on the ${te.toLowerCase()}.`,
      cc: `It needs the output on the ${te.toLowerCase()} with the ${tc.toLowerCase()} on its rail.`,
    }[kinds[j]]}`);
    const sizeWhy = [
      `That is the ${nm.ce}: input on the ${tb.toLowerCase()}, output on the ${tc.toLowerCase()}, nothing in the ${te.toLowerCase()} lead.`,
      `That is the degenerated ${mos ? 'common source' : 'common emitter'}: the resistor in the ${te.toLowerCase()} sets the gain.`,
      `That is the ${nm.cb}: ${te.toLowerCase()} in, ${tc.toLowerCase()} out, same size as the ${mos ? 'common source' : 'common emitter'} but no inversion.`,
      `That is the follower: the output (the ${te.toLowerCase()}) copies the input (the ${tb.toLowerCase()}) minus a nearly fixed drop.`,
    ].map((w, j) => (j === sizeIx ? null : w));
    const common = kind === 'cb' ? tb : kind === 'cc' ? tc : te;
    return {
      fig,
      q: `A single ${devName(dev)} stage${mos ? '' : ''}. Triangles are incremental grounds. Read it before you compute anything.`,
      parts: [
        { lbl: `1. $v_{in}$ drives which terminal?`, mc: T, a: inT, why: T.map((_, j) => tWhy(j, inT, '$v_{in}$')) },
        { lbl: '2. $v_{out}$ is taken from which terminal?', mc: T, a: outT, why: T.map((_, j) => tWhy(j, outT, '$v_{out}$')) },
        { lbl: '3. So this stage is a...', mc: kinds.map((k) => nm[k][0].toUpperCase() + nm[k].slice(1)), a: kinds.indexOf(kind), why: kinds.map((_, j) => nameWhy(j)) },
        { lbl: '4. Before any algebra, its gain is...', mc: sizes, a: sizeIx, why: sizeWhy },
      ],
      hints: [`${arrow}. Find that first.`, 'The terminal that is neither the input nor the output is the "common" one, and it names the stage.'],
      sol: `**Which end is which.** ${arrow}. So the top lead is the ${top.toLowerCase()} and the bottom lead the ${bot.toLowerCase()}.

**In and out.** $v_{in}$ reaches the ${T[inT].toLowerCase()}${RB && kind !== 'cb' ? ` (through $${mos ? 'R_G' : 'R_B'}$)` : ''}; $v_{out}$ is the ${T[outT].toLowerCase()}. The ${common.toLowerCase()} is neither: it is common, so this is the **${nm[kind]}**.

**Sign and size.** ${sizes[sizeIx]}. ${{
        ce: `More input on the ${tb.toLowerCase()} pulls more current down through $${RC}$: the output falls. Large because $g_m${RC}$ is large.`,
        ceRE: `Same inversion, but the current is set by the input voltage across the ${te.toLowerCase()} path, $${REn} + 1/g_m$, so the gain is about $-${RC}/(${REn} + 1/g_m)$, close to $-${RC}/${REn}$.`,
        cb: `Pushing the ${te.toLowerCase()} up with the ${tb.toLowerCase()} held shrinks $v_{${mos ? 'gs' : '\\pi'}}$: less current through $${RC}$, the output rises. No inversion; the size is $${RC}$ over the resistance in the ${te.toLowerCase()} path.`,
        cc: `The ${te.toLowerCase()} follows the ${tb.toLowerCase()} at a nearly constant $V_{${mos ? 'GS' : 'BE'}}$, so the gain is a bit under 1. Its job is buffering, not gain.`,
      }[kind]}${mos ? '' : ` The ${mos ? 'MOSFET' : 'MOSFET'} twin is the ${NAMES.mos[kind]}.`}`,
    };
  };

  // ================================================================ e3_amp_chain: two stages, BJT and MOS mixed
  const inB = (bx, y) => [['w', [bx, y], [bx - 0.6, y], [bx - 0.6, y + 0.4]], ['Vac', [bx - 0.6, y + 0.4], [bx - 0.6, y + 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [bx - 0.6, y + 1.4]]];
  const outT = (p) => ['term', p, { n: 'v_{out}', side: 'r' }];

  GENS.e3_amp_chain = (o = {}) => {
    const kind = pick(o.only || ['ceCc', 'ccCe', 'csCc', 'ceCs', 'ceActive']);
    const beta = pick([100, 100, 200]);
    if (kind === 'ceCc' || kind === 'csCc') {
      const mos = kind === 'csCc';
      const g1 = mos ? pick([1, 2, 4]) * 1e-3 : pick([0.5, 1, 2]) * 1e-3 / VT;
      const I2 = pick([0.5, 1, 2]) * 1e-3, g2 = I2 / VT, rpi2 = beta / g2;
      const R1 = pick([5, 10, 20]) * 1e3, RE = pick([100, 200, 500, 1000]);
      const Rin2 = rpi2 + (beta + 1) * RE, A1 = -g1 * par(R1, Rin2), A2 = (beta + 1) * RE / Rin2;
      const A1a = -g1 * par(R1, rpi2 + beta * RE), A2a = RE / (RE + 1 / g2);
      const fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: mos ? 'R_D' : 'R_C', s: KO(R1), side: 'l' }],
        [mos ? 'nmos' : 'npn', [1, 1], { n: mos ? 'M_1' : 'Q_1' }], ['gnd', [1, 2]], ...inB(0, 1),
        ['w', [1, 0], [2.4, 0], [2.4, 1]], ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['npn', [3.4, 1], { n: 'Q_2' }], ['rail', [3.4, 0]],
        ['R', [3.4, 2], [3.4, 3.2], { n: 'R_E', s: Rv(RE) }], ['gnd', [3.4, 3.2]], ['w', [3.4, 2], [4.2, 2]], outT([4.2, 2])];
      return {
        fig,
        q: `${mos ? `$M_1$: $g_{m1} = ${MS(g1)}$ (ignore $r_{ds}$)` : `$Q_1$: $g_{m1} = ${MS(g1)}$`}; $Q_2$: $I_{C2} = ${mA(I2)}$, $\\beta = ${beta}$${mos ? '' : ' for both'}; $V_T = 25\\,\\text{mV}$, ignore $r_o$. Find $R_{in2}$ (looking into $Q_2$'s base), $A_1 = v_1/v_{in}$ and $A_v = v_{out}/v_{in}$.`,
        parts: [resPart('R_{in2}', Rin2, rpi2 + beta * RE, [{ v: rpi2 + RE, msg: 'Seen from the base, $R_E$ is multiplied by $(\\beta + 1)$.' }]),
          num('A_1', '', A1, [A1a], [{ v: -g1 * R1, msg: `That ignores the loading: $Q_2$'s base draws current, so the first stage sees $${mos ? 'R_D' : 'R_C'}\\parallel R_{in2}$.` }]),
          num('A_v', '', A1 * A2, [A1a * A2a, A1 * A2a, A1a * A2], [{ v: -g1 * R1 * A2, msg: `The follower gain is right, but stage 1 is loaded by $R_{in2}$: use $${mos ? 'R_D' : 'R_C'}\\parallel R_{in2}$.` }])],
        hints: ['The follower $Q_2$ is stage 2. Its input resistance (from the base) is $r_{\\pi2} + (\\beta + 1)R_E$, and it hangs on node $v_1$.', `Stage 1 is a ${mos ? 'common source' : 'common emitter'}: $A_1 = -g_{m1}(${mos ? 'R_D' : 'R_C'}\\parallel R_{in2})$. Stage 2: $A_2 = (\\beta+1)R_E/R_{in2}$.`],
        sol: `**Stage 2 first (it loads stage 1).** $g_{m2} = ${MS(g2)}$, $r_{\\pi2} = ${Rv(rpi2)}$.
$$R_{in2} = r_{\\pi2} + (\\beta+1)R_E = ${Rv(rpi2)} + (${beta + 1})(${Rv(RE)}) = ${Rv(Rin2)}$$

**Stage 1** (${mos ? 'common source' : 'common emitter'}) drives $${mos ? 'R_D' : 'R_C'}\\parallel R_{in2} = ${Rv(par(R1, Rin2))}$:
$$A_1 = -g_{m1}(${mos ? 'R_D' : 'R_C'}\\parallel R_{in2}) = ${f(A1, 4)}$$

**Stage 2** (emitter follower, driven at its base by $v_1$): $A_2 = \\dfrac{(\\beta+1)R_E}{R_{in2}} = ${f(A2, 4)}$.

$$A_v = A_1A_2 = ${f(A1 * A2, 4)}$$

The follower lets a small $R_E$ hang on the output without wrecking stage 1: tied straight to $v_1$, $R_E = ${Rv(RE)}$ would have cut the gain to $-g_{m1}(${mos ? 'R_D' : 'R_C'}\\parallel R_E) = ${f(-g1 * par(R1, RE), 3)}$.${mos ? ' A MOSFET stage driving a BJT base **is** loaded (unlike a MOSFET driving a gate).' : ''}`,
      };
    }
    if (kind === 'ccCe') {
      const I1 = pick([0.5, 1, 2]) * 1e-3, g1 = I1 / VT, rpi1 = beta / g1;
      const I2 = pick([0.5, 1, 2]) * 1e-3, g2 = I2 / VT, rpi2 = beta / g2;
      const RE1 = pick([1, 2, 5]) * 1e3, RC = pick([2, 5, 10]) * 1e3;
      const load = par(RE1, rpi2), A1 = (beta + 1) * load / (rpi1 + (beta + 1) * load), A2 = -g2 * RC;
      const A1a = load / (load + 1 / g1);
      const fig = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ...inB(0, 1), ['R', [1, 2], [1, 3.4], { n: 'R_{E1}', s: KO(RE1), side: 'l' }], ['gnd', [1, 3.4]],
        ['w', [1, 2], [2.4, 2]], ['node', [1.7, 2], { n: 'v_1', side: 'a' }], ['npn', [3.4, 2], { n: 'Q_2' }], ['gnd', [3.4, 3]],
        ['R', [3.4, -0.2], [3.4, 1], { n: 'R_C', s: KO(RC) }], ['rail', [3.4, -0.2]], ['w', [3.4, 1], [4.2, 1]], outT([4.2, 1])];
      return {
        fig,
        q: `$I_{C1} = ${mA(I1)}$, $I_{C2} = ${mA(I2)}$, $\\beta = ${beta}$ for both, $V_T = 25\\,\\text{mV}$, ignore $r_o$. Find $A_1 = v_1/v_{in}$ and $A_v = v_{out}/v_{in}$.`,
        parts: [num('A_1', '', A1, [A1a], [{ v: (beta + 1) * RE1 / (rpi1 + (beta + 1) * RE1), msg: `That is the follower with only $R_{E1}$ on its emitter. $Q_2$'s base hangs there too: the emitter sees $R_{E1}\\parallel r_{\\pi2}$.` }]),
          num('A_v', '', A1 * A2, [A1a * A2], [{ v: A2, msg: 'That is stage 2 alone. Multiply by the follower gain $A_1$ (a little under 1, here noticeably).' }])],
        hints: ['Stage 2 is a common emitter: from its base it looks like $r_{\\pi2}$, and that resistor hangs on $Q_1$\'s emitter.', 'Follower with load $R = R_{E1}\\parallel r_{\\pi2}$: $A_1 = (\\beta+1)R/(r_{\\pi1} + (\\beta+1)R)$.'],
        sol: `$g_{m1} = ${MS(g1)}$, $r_{\\pi1} = ${Rv(rpi1)}$; $g_{m2} = ${MS(g2)}$, $r_{\\pi2} = ${Rv(rpi2)}$.

**Load on the follower.** $Q_2$'s base looks like $r_{\\pi2}$ (emitter grounded), in parallel with $R_{E1}$: $R = ${Rv(load)}$.

**Stage 1** (emitter follower): $A_1 = \\dfrac{(\\beta+1)R}{r_{\\pi1} + (\\beta+1)R} = ${f(A1, 4)}$.

**Stage 2** (common emitter, driven at the base by $v_1$): $A_2 = -g_{m2}R_C = ${f(A2, 4)}$.

$$A_v = A_1A_2 = ${f(A1 * A2, 4)}$$`,
      };
    }
    if (kind === 'ceCs') {
      const I1 = pick([0.25, 0.5, 1]) * 1e-3, g1 = I1 / VT, RC = pick([2, 5, 10]) * 1e3;
      const g2 = pick([1, 2, 4]) * 1e-3, RD = pick([2, 5, 10]) * 1e3;
      const A1 = -g1 * RC, A2 = -g2 * RD;
      const fig = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: KO(RC), side: 'l' }], ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ...inB(0, 1),
        ['w', [1, 0], [2.4, 0], [2.4, 1]], ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['nmos', [3.4, 1], { n: 'M_2' }], ['gnd', [3.4, 2]],
        ['R', [3.4, -1.2], [3.4, 0], { n: 'R_D', s: KO(RD) }], ['rail', [3.4, -1.2]], ['w', [3.4, 0], [4.2, 0]], outT([4.2, 0])];
      return {
        fig,
        q: `$Q_1$: $I_C = ${mA(I1)}$, $V_T = 25\\,\\text{mV}$. $M_2$: $g_{m2} = ${MS(g2)}$. Ignore $r_o$ and $r_{ds}$. Find $A_1 = v_1/v_{in}$ and $A_v$.`,
        parts: [num('A_1', '', A1), num('A_v', '', A1 * A2, [], [{ v: -A1 * A2, msg: 'Two inverting stages: the total is positive.' }])],
        hints: ['A gate draws no current: $M_2$ does not load $Q_1$ at all.', 'Two common-emitter/common-source stages: each inverts.'],
        sol: `$g_{m1} = I_C/V_T = ${MS(g1)}$.

**No loading.** $M_2$'s gate is an open circuit, so $Q_1$'s collector sees only $R_C$: $A_1 = -g_{m1}R_C = ${f(A1, 4)}$.

**Stage 2:** $A_2 = -g_{m2}R_D = ${f(A2, 4)}$.

$$A_v = A_1A_2 = ${f(A1 * A2, 4)}$$ (positive: two inversions). Compare: if stage 2 were a BJT, its $r_\\pi$ would sit in parallel with $R_C$ and cut $A_1$.`,
      };
    }
    // ceActive: CE with a PMOS current-source load, r_o and r_ds kept
    const IC = pick([0.25, 0.5, 1]) * 1e-3, g1 = IC / VT, VA = pick([50, 100]), ro = VA / IC, rds = pick([50, 100, 200]) * 1e3;
    const Av = -g1 * par(ro, rds);
    const fig = [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]], ['w', [1, 0], [1.8, 0]], outT([1.8, 0]),
      ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ...inB(0, 1)];
    return {
      fig,
      q: `$Q_1$: $I_C = ${mA(IC)}$, $V_A = ${VA}\\,\\text{V}$ (so $r_o = V_A/I_C$), $V_T = 25\\,\\text{mV}$. The PMOS current source $M_2$ has $r_{ds2} = ${KO(rds)}$. Find $r_{o1}$ and $A_v$.`,
      parts: [resPart('r_{o1}', ro), num('A_v', '', Av, [], [{ v: -g1 * ro, msg: 'That is $-g_mr_o$, the intrinsic gain. $M_2$\'s $r_{ds}$ is in parallel at the output.' }, { v: -g1 * rds, msg: 'You used only $r_{ds2}$. $Q_1$\'s own $r_o$ is in parallel with it.' }])],
      hints: ['With the input off, $Q_1$ is just $r_{o1}$ to ground and $M_2$ (gate held) is $r_{ds2}$ to $V_{DD}$.', '$A_v = -g_{m1}(r_{o1}\\parallel r_{ds2})$.'],
      sol: `$g_{m1} = ${MS(g1)}$, $r_{o1} = V_A/I_C = ${KO(ro)}$.

**Name it:** input on the base, output on the collector, emitter grounded: a common emitter. The load is $M_2$ with its gate held: looking into its drain you see $r_{ds2}$.

$$R_{out} = r_{o1}\\parallel r_{ds2} = ${Rv(par(ro, rds))}\\qquad A_v = -g_{m1}R_{out} = ${f(Av, 4)}$$

The ceiling is the BJT's **intrinsic gain** $g_mr_o = \\dfrac{I_C}{V_T}\\cdot\\dfrac{V_A}{I_C} = \\dfrac{V_A}{V_T} = ${f(VA / VT)}$, the same at any current.`,
    };
  };

  // ================================================================ e3_amp_bias: DC → g_m → gain
  const V = (v) => `${f(v, 3)}\\,\\text{V}`;
  function biasBase(vb, x = 0, y = 0) {   // V_B with v_in on top of it, into the base at (x, y)
    return [['w', [x, y], [x - 0.6, y], [x - 0.6, y + 0.2]], ['Vac', [x - 0.6, y + 0.2], [x - 0.6, y + 1.2], { n: 'v_{in}', side: 'l' }],
      ['V', [x - 0.6, y + 1.2], [x - 0.6, y + 2.2], { n: 'V_B', s: V(vb), side: 'l' }], ['gnd', [x - 0.6, y + 2.2]]];
  }
  const capOut = (y, RL, cs) => [['w', [1, y], [1.7, y]], ['C', [1.7, y], [2.5, y], { n: '\\infty', side: cs }], ['w', [2.5, y], [3, y]], ['term', [3, y], { n: 'v_{out}', side: 'a' }],
    ['R', [3, y], [3, y + 1.4], { n: 'R_L', s: KO(RL) }], ['gnd', [3, y + 1.4]]];

  GENS.e3_amp_bias = (o = {}) => {
    const kind = pick(o.only || ['ceBypass', 'cePartial', 'follower', 'cbStage', 'ceDivider']);
    const beta = pick([50, 100, 100, 200]), VCC = pick([9, 10, 12]);
    for (let tries = 0; tries < 50; tries++) {
      if (kind === 'ceBypass' || kind === 'cePartial') {
        const IE = pick([0.5, 1, 2]) * 1e-3, VB = pick([1.7, 2.7, 3.2]);
        const REt = (VB - 0.7) / IE;
        const RE1 = kind === 'cePartial' ? pick([50, 100, 200]) : 0;
        if (RE1 >= REt * 0.6) continue;
        const RC = pick([2, 3, 4, 5]) * 1e3, RL = pick([2, 4, 10]) * 1e3;
        const IC = IE * beta / (beta + 1), VC = VCC - IC * RC;
        if (VC < VB + 0.5) continue;
        const gm = IC / VT, gma = IE / VT, rpi = beta / gm, Rp = par(RC, RL);
        const Av = RE1 ? -beta * Rp / (rpi + (beta + 1) * RE1) : -gm * Rp;
        const accAv = RE1 ? [-Rp / (1 / gm + RE1), -Rp / (1 / gma + RE1), -beta * Rp / (beta / gma + (beta + 1) * RE1)] : [-gma * Rp];
        const fig = [['rail', [1, -2.2], { n: `V_{CC} = ${V(VCC)}` }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: KO(RC), side: 'l' }],
          ['npn', [1, 0]], ...capOut(-1, RL), ...biasBase(VB),
          ...(RE1 ? [['R', [1, 1], [1, 2.2], { n: 'R_{E1}', s: Rv(RE1), side: 'l' }], ['R', [1, 2.2], [1, 3.4], { n: 'R_{E2}', s: Rv(REt - RE1), side: 'l' }], ['gnd', [1, 3.4]],
            ['w', [1, 2.2], [2.3, 2.2]], ['C', [2.3, 2.2], [2.3, 3.4], { n: '\\infty' }], ['w', [2.3, 3.4], [1, 3.4]]]
            : [['R', [1, 1], [1, 2.4], { n: 'R_E', s: Rv(REt), side: 'l' }], ['gnd', [1, 2.4]], ['w', [1, 1], [2.3, 1]], ['C', [2.3, 1], [2.3, 2.4], { n: '\\infty' }], ['w', [2.3, 2.4], [1, 2.4]]])];
        return {
          fig,
          q: `$\\beta = ${beta}$, $V_{BE,on} = 0.7\\,\\text{V}$, $V_T = 25\\,\\text{mV}$, $r_o = \\infty$. The capacitors are open at DC and short for the signal. Find $I_C$, $V_C$ (DC), $g_m$ and $A_v = v_{out}/v_{in}$. (Taking $I_C\\approx I_E$ is accepted.)`,
          parts: [num('I_C', 'mA', IC * 1e3, [IE * 1e3]), num('V_C', 'V', VC, [VCC - IE * RC]), num('g_m', 'mS', gm * 1e3, [gma * 1e3]),
            num('A_v', '', Av, accAv, RE1 ? [{ v: -gm * Rp, msg: `The bypass capacitor shorts only $R_{E2}$. $R_{E1}$ stays in the emitter for the signal: it degenerates the gain.` }, { v: -beta * RC / (rpi + (beta + 1) * RE1), msg: 'The output capacitor connects $R_L$ for the signal: the collector sees $R_C\\parallel R_L$.' }]
              : [{ v: -gm * RC, msg: 'The output capacitor connects $R_L$ for the signal: the collector sees $R_C\\parallel R_L$.' }, { v: -Rp / REt, msg: 'For the signal the bypass capacitor shorts $R_E$: the emitter is at incremental ground, so this is a plain common emitter.' }])],
          hints: [`DC: capacitors open. The emitter sits $0.7\\,\\text{V}$ below $V_B$: $I_E = (V_B - 0.7)/${RE1 ? '(R_{E1} + R_{E2})' : 'R_E'}$.`, `Signal: ${RE1 ? '$R_{E2}$ is shorted, $R_{E1}$ is not' : '$R_E$ is shorted (emitter at incremental ground)'}; $R_L$ joins $R_C$ in parallel.`],
          sol: `**DC (capacitors open).** $V_E = V_B - 0.7 = ${V(VB - 0.7)}$, so $I_E = \\dfrac{${V(VB - 0.7)}}{${Rv(REt)}} = ${mA(IE)}$ and $I_C = \\dfrac{\\beta}{\\beta + 1}I_E = ${mA(IC)}$ ($\\approx I_E$).
$V_C = V_{CC} - I_CR_C = ${V(VC)}$, above $V_B = ${V(VB)}$: the base–collector junction is reverse biased, forward active. ✓

**Small-signal numbers.** $g_m = I_C/V_T = ${MS(gm)}$, $r_\\pi = \\beta/g_m = ${Rv(rpi)}$.

**Small-signal circuit.** $V_B$ and $V_{CC}$ are incremental ground. ${RE1 ? `The capacitor shorts $R_{E2}$, leaving $R_{E1} = ${Rv(RE1)}$ in the emitter: a **degenerated common emitter**.` : 'The capacitor shorts $R_E$: the emitter is at incremental ground, a plain **common emitter**.'} The output capacitor puts $R_L$ in parallel with $R_C$: $R_C\\parallel R_L = ${Rv(Rp)}$.

$$A_v = ${RE1 ? `-\\frac{\\beta(R_C\\parallel R_L)}{r_\\pi + (\\beta+1)R_{E1}}` : '-g_m(R_C\\parallel R_L)'} = ${f(Av, 4)}$$
${RE1 ? `(The shortcut $-\\dfrac{R_C\\parallel R_L}{1/g_m + R_{E1}} = ${f(-Rp / (1 / gm + RE1), 4)}$ is within a couple of percent.)` : ''}`,
        };
      }
      if (kind === 'follower') {
        const IE = pick([0.5, 1, 2]) * 1e-3, VB = pick([2.7, 3.2, 5.7]), RE = (VB - 0.7) / IE, RL = pick([0.5, 1, 2, 5]) * 1e3;
        const IC = IE * beta / (beta + 1), gm = IC / VT, rpi = beta / gm, Rp = par(RE, RL);
        const Av = (beta + 1) * Rp / (rpi + (beta + 1) * Rp), Rin = rpi + (beta + 1) * Rp;
        const fig = [['rail', [1, -1], { n: `V_{CC} = ${V(VCC)}` }], ['npn', [1, 0]], ...biasBase(VB),
          ['R', [1, 1], [1, 2.4], { n: 'R_E', s: Rv(RE), side: 'l' }], ['gnd', [1, 2.4]], ...capOut(1, RL, 'b')];
        return {
          fig,
          q: `$\\beta = ${beta}$, $V_{BE,on} = 0.7\\,\\text{V}$, $V_T = 25\\,\\text{mV}$, $r_o = \\infty$. The capacitor is open at DC and a short for the signal. Find $I_C$, $r_\\pi$, $A_v = v_{out}/v_{in}$, and $R_{in}$ looking into the base.`,
          parts: [num('I_C', 'mA', IC * 1e3, [IE * 1e3]), resPart('r_\\pi', rpi, beta * VT / IE), num('A_v', '', Av, [Rp / (Rp + 1 / gm), Rp / (Rp + VT / IE)], [{ v: (beta + 1) * RE / (rpi + (beta + 1) * RE), msg: 'The capacitor connects $R_L$ for the signal: the emitter sees $R_E\\parallel R_L$.' }]),
            resPart('R_{in}', Rin, rpi + beta * Rp, [{ v: rpi + (beta + 1) * RE, msg: 'For the signal, $R_L$ is in parallel with $R_E$: the base sees $r_\\pi + (\\beta+1)(R_E\\parallel R_L)$.' }])],
          hints: ['DC: $I_E = (V_B - 0.7)/R_E$; the capacitor keeps $R_L$ out of the DC.', 'Signal: input at the base, output at the emitter: a follower with $R_E\\parallel R_L$ on the emitter.'],
          sol: `**DC.** $I_E = (${V(VB)} - 0.7)/${Rv(RE)} = ${mA(IE)}$, $I_C = ${mA(IC)}$. $V_{CE} = ${V(VCC - (VB - 0.7))}$: forward active. ✓

$g_m = ${MS(gm)}$, $r_\\pi = \\beta/g_m = ${Rv(rpi)}$.

**Small signal.** Input at the base, output at the emitter, collector on $V_{CC}$ (incremental ground): an **emitter follower** with $R_E\\parallel R_L = ${Rv(Rp)}$ on the emitter.
$$A_v = \\frac{(\\beta+1)(R_E\\parallel R_L)}{r_\\pi + (\\beta+1)(R_E\\parallel R_L)} = ${f(Av, 4)}\\qquad R_{in} = r_\\pi + (\\beta+1)(R_E\\parallel R_L) = ${Rv(Rin)}$$`,
        };
      }
      if (kind === 'cbStage') {
        const IE = pick([0.5, 1, 2]) * 1e-3, VB = pick([1.7, 2.7]), RE = (VB - 0.7) / IE;
        const RC = pick([2, 4, 5]) * 1e3, RS = pick([25, 50, 100]);
        const IC = IE * beta / (beta + 1), VC = VCC - IC * RC;
        if (VC < VB + 0.5) continue;
        const gm = IC / VT, rpi = beta / gm, re = rpi / (beta + 1), Rin = par(RE, re);
        const Av = gm * RC * Rin / (RS + Rin);
        const gma = IE / VT, Rina = par(RE, 1 / gma), Ava = gma * RC * Rina / (RS + Rina);
        const fig = [['rail', [1, -2.2], { n: `V_{CC} = ${V(VCC)}` }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: KO(RC), side: 'l' }],
          ['w', [1, -1], [1.8, -1]], ['term', [1.8, -1], { n: 'v_{out}', side: 'r' }], ['npn', [1, 0]],
          ['w', [0, 0], [-0.6, 0], [-0.6, 0.4]], ['V', [-0.6, 0.4], [-0.6, 1.4], { n: 'V_B', s: V(VB), side: 'l' }], ['gnd', [-0.6, 1.4]],
          ['R', [1, 1], [1, 2.4], { n: 'R_E', s: KO(RE), side: 'l' }], ['gnd', [1, 2.4]],
          ['w', [1, 1], [1.8, 1]], ['C', [1.8, 1], [2.6, 1], { n: '\\infty' }], ['R', [2.6, 1], [3.8, 1], { n: 'R_S', s: Rv(RS), side: 'b' }],
          ['w', [3.8, 1], [4.3, 1]], ['Vac', [4.3, 1], [4.3, 2.2], { n: 'v_{in}' }], ['gnd', [4.3, 2.2]]];
        return {
          fig,
          q: `$\\beta = ${beta}$, $V_{BE,on} = 0.7\\,\\text{V}$, $V_T = 25\\,\\text{mV}$, $r_o = \\infty$. The capacitor is open at DC and a short for the signal. Find $I_C$, $g_m$, $R_{in}$ (looking into the emitter node from the capacitor, $R_E$ included) and $A_v = v_{out}/v_{in}$.`,
          parts: [num('I_C', 'mA', IC * 1e3, [IE * 1e3]), num('g_m', 'mS', gm * 1e3, [gma * 1e3]),
            resPart('R_{in}', Rin, Rina, [{ v: RE, msg: 'That is $R_E$ alone. The emitter itself looks like $r_\\pi/(\\beta+1)\\approx 1/g_m$, in parallel with $R_E$, and it is the smaller one.' }]),
            num('A_v', '', Av, [Ava, gm * RC * Rina / (RS + Rina)], [{ v: gm * RC, msg: '$g_mR_C$ forgets $R_S$: the input divides between $R_S$ and the small $R_{in}$.' }, { v: -Av, msg: 'A common base does not invert: input up lifts the emitter, $v_\\pi$ falls, the collector current falls, the output rises.' }])],
          hints: ['The base sits on a DC source: incremental ground. The input enters at the emitter, the output is the collector: a common base.', 'From the emitter you see $R_E\\parallel r_\\pi/(\\beta + 1)$. Divide $v_{in}$ between $R_S$ and that, then $A = g_mR_C$ from the emitter to the output.'],
          sol: `**DC.** $V_E = ${V(VB)} - 0.7 = ${V(VB - 0.7)}$, $I_E = ${mA(IE)}$, $I_C = ${mA(IC)}$, $V_C = ${V(VC)} > V_B$: forward active. ✓
$g_m = ${MS(gm)}$, $r_\\pi = ${Rv(rpi)}$, and looking into the emitter $r_\\pi/(\\beta+1) = ${Rv(re)}$ ($\\approx 1/g_m$).

**Small signal.** Base held, input at the emitter, output at the collector: **common base**.
$$R_{in} = R_E\\parallel\\frac{r_\\pi}{\\beta + 1} = ${Rv(Rin)}\\qquad v_e = v_{in}\\frac{R_{in}}{R_S + R_{in}}$$
From the emitter to the collector the gain is $g_mR_C = ${f(gm * RC, 4)}$ (positive), so
$$A_v = g_mR_C\\,\\frac{R_{in}}{R_S + R_{in}} = ${f(Av, 4)}$$
$R_S = ${Rv(RS)}$ is comparable to the tiny input resistance, so it costs a lot of gain: the common base wants to be driven by a current, not a voltage.`,
        };
      }
      // ceDivider: base divider, coupling caps, bypassed R_E
      const R2 = pick([10, 20, 22]) * 1e3, VTH = pick([2, 2.5, 3]), R1 = R2 * (VCC - VTH) / VTH;
      const RE = pick([1, 1.5, 2]) * 1e3, RC = pick([2, 3, 4]) * 1e3, RL = pick([4, 10]) * 1e3, RS = pick([0.5, 1, 2]) * 1e3;
      const RTH = par(R1, R2);
      const IB = (VTH - 0.7) / (RTH + (beta + 1) * RE), IC = beta * IB, ICa = (VTH - 0.7) / RE;
      const VC = VCC - IC * RC;
      if (VC < VTH + 0.5) continue;
      const gm = IC / VT, rpi = beta / gm, Rin = par(RTH, rpi), Av = -gm * par(RC, RL) * Rin / (RS + Rin);
      const gma = ICa / VT, Rina = par(RTH, beta / gma), Ava = -gma * par(RC, RL) * Rina / (RS + Rina);
      const fig = [['rail', [1, -2.2], { n: `V_{CC} = ${V(VCC)}` }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: KO(RC), side: 'l' }], ['npn', [1, 0]], ...capOut(-1, RL),
        ['R', [1, 1], [1, 2.4], { n: 'R_E', s: KO(RE), side: 'l' }], ['gnd', [1, 2.4]], ['w', [1, 1], [2.3, 1]], ['C', [2.3, 1], [2.3, 2.4], { n: '\\infty' }], ['w', [2.3, 2.4], [1, 2.4]],
        ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: KO(R1), side: 'l' }], ['R', [-0.6, 0], [-0.6, 1.4], { n: 'R_2', s: KO(R2), side: 'l' }], ['gnd', [-0.6, 1.4]],
        ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: '\\infty' }], ['R', [-2, 0], [-3.2, 0], { n: 'R_S', s: KO(RS) }],
        ['w', [-3.2, 0], [-3.2, 0.4]], ['Vac', [-3.2, 0.4], [-3.2, 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-3.2, 1.4]]];
      return {
        fig,
        q: `$\\beta = ${beta}$, $V_{BE,on} = 0.7\\,\\text{V}$, $V_T = 25\\,\\text{mV}$, $r_o = \\infty$. Capacitors: open at DC, short for the signal. Find $I_C$ (a stiff-divider answer that ignores the base current is accepted), $g_m$, the input resistance $R_{in}$ to the right of the input capacitor, and $A_v = v_{out}/v_{in}$.`,
        parts: [num('I_C', 'mA', IC * 1e3, [ICa * 1e3]), num('g_m', 'mS', gm * 1e3, [gma * 1e3]),
          resPart('R_{in}', Rin, Rina, [{ v: rpi, msg: 'That is the base alone. The divider $R_1\\parallel R_2$ also goes to incremental ground from the base: it is in parallel.' }]),
          num('A_v', '', Av, [Ava, -gm * par(RC, RL) * Rina / (RS + Rina), -gma * par(RC, RL) * Rin / (RS + Rin)], [{ v: -gm * par(RC, RL), msg: 'That is the gain from the base. $v_{in}$ first divides between $R_S$ and $R_{in}$.' }, { v: -gm * RC * Rin / (RS + Rin), msg: 'The output capacitor connects $R_L$ for the signal: use $R_C\\parallel R_L$.' }])],
        hints: ['DC: replace the divider by its Thévenin equivalent, $V_{TH} = V_{CC}R_2/(R_1 + R_2)$ behind $R_1\\parallel R_2$. Then $I_B = (V_{TH} - 0.7)/(R_{TH} + (\\beta+1)R_E)$.', 'Signal: $R_1$ and $R_2$ both go to incremental ground, so they sit in parallel with $r_\\pi$ at the base. The emitter is bypassed.'],
        sol: `**DC (capacitors open).** Thévenin of the divider: $V_{TH} = ${V(VCC)}\\cdot\\dfrac{${KO(R2)}}{${KO(R1 + R2)}} = ${V(VTH)}$, $R_{TH} = R_1\\parallel R_2 = ${Rv(RTH)}$.
$$I_B = \\frac{V_{TH} - 0.7}{R_{TH} + (\\beta+1)R_E} = \\frac{${V(VTH - 0.7)}}{${Rv(RTH + (beta + 1) * RE)}} = ${f(IB * 1e6, 4)}\\,\\mu\\text{A}\\qquad I_C = \\beta I_B = ${mA(IC)}$$
(Stiff divider, ignoring $I_B$: $I_C\\approx(V_{TH} - 0.7)/R_E = ${mA(ICa)}$.) $V_C = ${V(VC)}$: forward active. ✓

**Small signal.** $g_m = ${MS(gm)}$, $r_\\pi = ${Rv(rpi)}$. $V_{CC}$ is ground, so $R_1$ and $R_2$ both run from the base to ground: $R_{in} = R_1\\parallel R_2\\parallel r_\\pi = ${Rv(Rin)}$. The emitter is bypassed: a **common emitter** with $R_C\\parallel R_L = ${Rv(par(RC, RL))}$ at the collector.
$$A_v = \\frac{R_{in}}{R_S + R_{in}}\\cdot\\big(-g_m(R_C\\parallel R_L)\\big) = ${f(Rin / (RS + Rin), 4)}\\times(${f(-gm * par(RC, RL), 4)}) = ${f(Av, 4)}$$`,
      };
    }
    return GENS.e3_amp_bias({ only: ['ceBypass'] });
  };

  // ================================================================ e3_amp_casc: the BJT cascode
  GENS.e3_amp_casc = () => {
    const IC = pick([0.5, 1, 2]) * 1e-3, beta = pick([50, 100, 200]), VA = pick([25, 50, 100]);
    const gm = IC / VT, rpi = beta / gm, ro = VA / IC;
    const load = pick(['ideal', 'ideal', 'RC']);
    const RC = pick([5, 10, 20]) * 1e3;
    const p = par(ro, rpi), Rc = ro + p + gm * ro * p;
    const GM = gm * (gm + 1 / ro) / (gm + 1 / rpi + 2 / ro);
    const Rout = load === 'ideal' ? Rc : par(RC, Rc);
    const Av = -GM * Rout;
    const fig = [['rail', [1, -1.2]], load === 'ideal' ? ['I', [1, -1.2], [1, 0], { n: 'I_B', side: 'l' }] : ['R', [1, -1.2], [1, 0], { n: 'R_C', s: KO(RC), side: 'l' }],
      ['w', [1, 0], [1.8, 0]], outT([1.8, 0]), ['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['node', [1, 2], { n: 'X', side: 'r' }],
      ['npn', [1, 3], { n: 'Q_1' }], ['gnd', [1, 4]], ...inB(0, 3)];
    return {
      fig,
      q: `Both transistors: $I_C = ${mA(IC)}$, $\\beta = ${beta}$, $V_A = ${VA}\\,\\text{V}$, $V_T = 25\\,\\text{mV}$. ${load === 'ideal' ? '$I_B$ is an ideal current source.' : `The load is $R_C = ${KO(RC)}$.`} Find $r_o$, $r_\\pi$, the resistance looking into $Q_2$'s collector $R_{C2}$, and $A_v$.`,
      parts: [resPart('r_o', ro), resPart('r_\\pi', rpi), resPart('R_{C2}', Rc, gm * ro * p, [{ v: gm * ro * ro, msg: 'That is the MOSFET cascode result $g_mr_o\\cdot r_o$. For a BJT the emitter of $Q_2$ sees $r_{o1}\\parallel r_{\\pi2}$, and $r_{\\pi2}$ is much smaller.' }]),
        num('A_v', '', Av, [-gm * Rout, -gm * (load === 'ideal' ? gm * ro * p : par(RC, gm * ro * p)), -gm * (load === 'ideal' ? beta * ro : par(RC, beta * ro))], load === 'ideal' ? [{ v: -gm * ro, msg: 'That is a single common emitter with a current-source load. The cascode multiplies the output resistance by about $g_m(r_o\\parallel r_\\pi)$.' }] : [{ v: -gm * ro, msg: 'With a resistor load, the output resistance is $R_C\\parallel R_{C2}\\approx R_C$.' }])],
      hints: ['$Q_2$ is a collector with $r_{o1}\\parallel r_{\\pi2}$ in its emitter (its base is held): $R_{C2} = r_o + R + g_mr_oR$ with $R = r_{o1}\\parallel r_{\\pi2}$.', 'The signal current $g_{m1}v_{in}$ goes up through $Q_2$ almost unchanged ($G_M\\approx g_{m1}$).'],
      sol: `$g_m = ${MS(gm)}$, $r_\\pi = \\beta/g_m = ${Rv(rpi)}$, $r_o = V_A/I_C = ${KO(ro)}$.

**Name it.** $Q_1$: input at the base, output at its collector, emitter grounded (common emitter). $Q_2$: base held, driven at its emitter (node $X$), output at its collector (common base). Stacked: a **cascode**.

**$R_{C2}$.** With $v_{in} = 0$, $Q_1$ is just $r_{o1}$ from $X$ to ground. Looking down from $Q_2$'s emitter there is also $r_{\\pi2}$ (base held), so $Q_2$ has $R = r_{o1}\\parallel r_{\\pi2} = ${Rv(p)}$ in its emitter:
$$R_{C2} = r_{o2} + R + g_{m2}r_{o2}R = ${Rv(Rc)}\\ \\approx\\ g_mr_o(r_o\\parallel r_\\pi) \\le \\beta r_o = ${Rv(beta * ro)}$$

**$G_M$.** $Q_1$ pulls $g_{m1}v_{in}$ out of $X$; almost all of it comes up through $Q_2$ (a fraction $\\approx 1/\\beta$ leaks into $Q_2$'s base): $G_M = ${MS(GM)}\\approx g_m$.

**Gain.** $R_{out} = ${load === 'ideal' ? 'R_{C2}' : 'R_C\\parallel R_{C2}'} = ${Rv(Rout)}$, $A_v = -G_MR_{out} = ${f(Av, 4)}$.${load === 'ideal' ? '' : ' With a resistor load the cascode buys almost nothing: $R_C$ dominates the output resistance. It pays off with a current-source load.'}

**Why the ceiling $\\beta r_o$.** In a MOSFET cascode every extra level multiplies by $g_mr_{ds}$. In a BJT the signal leaks out through $r_{\\pi2}$ into the held base, so the resistance under $Q_2$ can never look bigger than $r_\\pi$: $R_{C2}\\to g_mr_or_\\pi = \\beta r_o$.`,
    };
  };

  window.E3AMP = { stage, model, stageVals, NAMES, readStage };
})();

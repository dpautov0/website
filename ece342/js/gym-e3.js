/* gym-e3.js — the recognition gym's decks: one-tap items that train seeing a circuit, not solving it.
   Every deck is { id, title, chip, rule (md), make() }; make() returns one item:
     { fig (Schem netlist) | figHtml, q (md), opts: [md], a: index, why: [md | null per option], rule (md) }
   Circuits are drawn at random as NMOS, PMOS, NPN or PNP, gate/base on either side, so the student has to READ the
   picture every time. Formulas use r_o, r_ds -> infinity unless the item says otherwise (the lecture's default). */
(function () {
  'use strict';
  const pick = U.pick, shuffle = U.shuffle;

  // shuffle the options, keep each one's "why" with it
  function mc(right, wrongs) {
    const all = [[right, null], ...wrongs.filter((w, i, arr) => w && w[0] !== right && arr.findIndex((x) => x && x[0] === w[0]) === i)];
    const s = shuffle(all);
    return { opts: s.map((x) => x[0]), a: s.findIndex((x) => x[1] === null), why: s.map((x) => x[1]) };
  }

  // ------------------------------------------------------------------ devices
  const DEV = {
    nmos: { mos: true, n: true, name: 'NMOS', g: 'gate', d: 'drain', s: 'source', R: { d: 'R_D', s: 'R_S' } },
    pmos: { mos: true, n: false, name: 'PMOS', g: 'gate', d: 'drain', s: 'source', R: { d: 'R_D', s: 'R_S' } },
    npn: { mos: false, n: true, name: 'NPN', g: 'base', d: 'collector', s: 'emitter', R: { d: 'R_C', s: 'R_E' } },
    pnp: { mos: false, n: false, name: 'PNP', g: 'base', d: 'collector', s: 'emitter', R: { d: 'R_C', s: 'R_E' } },
  };
  const anyDev = () => pick(['nmos', 'pmos', 'npn', 'pnp']);
  const pinsOf = (x, y, flip) => ({ top: [x, y - 1], bot: [x, y + 1], side: [flip ? x + 1 : x - 1, y] });
  const dPin = (t, P) => (DEV[t].n ? P.top : P.bot);
  const sPin = (t, P) => (DEV[t].n ? P.bot : P.top);
  const isTop = (p, P) => p === P.top;
  // a pin straight onto its rail: a top pin to the supply, a bottom pin to ground
  const toRail = (p, P) => (isTop(p, P) ? ['rail', p] : ['gnd', p]);
  // a resistor from a pin to its rail
  const resRail = (p, P, n, side) => (isTop(p, P)
    ? [['R', [p[0], p[1] - 1.2], p, { n, side }], ['rail', [p[0], p[1] - 1.2]]]
    : [['R', p, [p[0], p[1] + 1.2], { n, side }], ['gnd', [p[0], p[1] + 1.2]]]);
  const outAt = (p, dir, n = 'v_{out}') => [['w', p, [p[0] + 0.8 * dir, p[1]]], ['term', [p[0] + 0.8 * dir, p[1]], { n, side: dir > 0 ? 'r' : 'l' }]];
  // v_in on the gate/base, drawn on the outside of the side pin
  const vinSide = (P, dir) => {
    const x = P.side[0] - 0.6 * dir, y = P.side[1];
    return [['w', P.side, [x, y], [x, y + 0.4]], ['Vac', [x, y + 0.4], [x, y + 1.4], { n: 'v_{in}', side: dir > 0 ? 'l' : 'r' }], ['gnd', [x, y + 1.4]]];
  };
  // v_in through a resistor into a source/emitter pin (common gate / common base)
  const vinPin = (p, P, dir, n) => {
    if (!isTop(p, P)) return [['R', p, [p[0], p[1] + 1.2], { n }], ['Vac', [p[0], p[1] + 1.2], [p[0], p[1] + 2.2], { n: 'v_{in}', side: 'l' }], ['gnd', [p[0], p[1] + 2.2]]];
    const y = p[1] - 0.5, x0 = p[0] + 0.6 * dir, x1 = p[0] + 1.8 * dir;
    return [['w', p, [p[0], y], [x0, y]], ['R', [x0, y], [x1, y], { n }], ['Vac', [x1, y], [x1, y + 1], { n: 'v_{in}', side: dir > 0 ? 'r' : 'l' }], ['gnd', [x1, y + 1]]];
  };

  // ------------------------------------------------------------------ deck: name the stage / predict it
  const STAGE_NAME = {
    mos: { cs: 'Common source', deg: 'Common source with source degeneration', cg: 'Common gate', cd: 'Common drain (source follower)', casc: 'Cascode (common source under a common gate)' },
    bjt: { cs: 'Common emitter', deg: 'Common emitter with emitter degeneration', cg: 'Common base', cd: 'Common collector (emitter follower)', casc: 'Cascode (common emitter under a common base)' },
  };
  const looksLike = (D) => ({
    cs: `that needs the input on the ${D.g}, the output on the ${D.d}, and the ${D.s} straight on its rail.`,
    deg: `that needs the input on the ${D.g}, the output on the ${D.d}, and a resistor between the ${D.s} and its rail.`,
    cg: `that needs the ${D.g} held still (a bias), the input into the ${D.s}, and the output on the ${D.d}.`,
    cd: `that needs the input on the ${D.g} and the output taken from the ${D.s}, with the ${D.d} on its rail.`,
    casc: `that needs two transistors stacked: the input on the lower one's ${D.g}, the upper one's ${D.g} held, the output on top.`,
  });

  function stageFig(t, kind, flip) {
    const D = DEV[t], dir = flip ? -1 : 1, e = [];
    if (kind === 'casc') {
      // n-type: input device at the bottom; p-type: input device on top (its source/emitter on the supply)
      const lo = pinsOf(1, 3, flip), hi = pinsOf(1, 1, flip);
      if (D.n) {
        e.push([t, [1, 3], { n: D.mos ? 'M_1' : 'Q_1', flip }], [t, [1, 1], { n: D.mos ? 'M_2' : 'Q_2', flip }], ['acg', hi.side], ['gnd', lo.bot], ...vinSide(lo, dir), ...resRail(hi.top, hi, D.R.d), ...outAt(hi.top, dir));
      } else {
        e.push([t, [1, 1], { n: D.mos ? 'M_1' : 'Q_1', flip }], [t, [1, 3], { n: D.mos ? 'M_2' : 'Q_2', flip }], ['acg', lo.side], ['rail', hi.top], ...vinSide(hi, dir), ...resRail(lo.bot, lo, D.R.d), ...outAt(lo.bot, dir));
      }
      return e;
    }
    const P = pinsOf(1, 1, flip), dp = dPin(t, P), sp = sPin(t, P);
    e.push([t, [1, 1], { flip }]);
    if (kind === 'cs' || kind === 'deg') {
      e.push(...vinSide(P, dir), ...resRail(dp, P, D.R.d), ...outAt(dp, dir));
      e.push(...(kind === 'deg' ? resRail(sp, P, D.R.s) : [toRail(sp, P)]));
    } else if (kind === 'cg') {
      e.push(['acg', P.side], ...vinPin(sp, P, dir, D.R.s), ...resRail(dp, P, D.R.d), ...outAt(dp, dir));
    } else if (kind === 'cd') {
      e.push(...vinSide(P, dir), toRail(dp, P), ...resRail(sp, P, D.R.s), ...outAt(sp, dir));
    }
    return e;
  }

  const stageIntro = (t) => `${DEV[t].name} devices. Small-signal view: the supply and ground are both incremental ground, and a triangle is a held bias (incremental ground too).`;

  function stageRule(t, kind) {
    const D = DEV[t], B = !D.mos, nm = STAGE_NAME[B ? 'bjt' : 'mos'][kind];
    const Rd = D.R.d, Rs = D.R.s;
    const where = {
      cs: `In on the **${D.g}**, out on the **${D.d}**. The terminal that is neither, the **${D.s}**, sits on its rail: it is *common* to input and output.`,
      deg: `In on the **${D.g}**, out on the **${D.d}**, and a resistor $${Rs}$ between the **${D.s}** and its rail: the ${D.s} is "common", but through a resistor. That resistor is the degeneration.`,
      cg: `The **${D.g}** is held (triangle), the signal comes **into the ${D.s}**, and the output is the **${D.d}**. Held ${D.g} = common ${D.g}.`,
      cd: `In on the **${D.g}**, out on the **${D.s}**, and the **${D.d}** straight on its rail (common). The ${D.s} follows the ${D.g}.`,
      casc: `Two devices stacked. The lower one has the input on its ${D.g} (a common-${D.s} stage); the upper one has its ${D.g} held and takes the current in at its ${D.s} (a common-${D.g} stage). Output on top.`,
    }[kind];
    const what = {
      cs: `Gain $A_v = -g_m${Rd}$ (inverting, large).`,
      deg: `Gain $A_v = -\\dfrac{${Rd}}{1/g_m + ${Rs}}\\approx-\\dfrac{${Rd}}{${Rs}}$ (inverting, set by the resistors).`,
      cg: `Gain $A_v = +\\dfrac{${Rd}}{${Rs} + 1/g_m}$ (non-inverting; $+g_m${Rd}$ if nothing is in series with the input).`,
      cd: `Gain just under 1 (a buffer: low output resistance, about $1/g_m$).`,
      casc: `With a resistor load the gain is still $\\approx -g_{m1}${Rd}$: the upper device only passes the current up. The cascode pays off with a current-source load (huge $R_{out}$) and against Miller.`,
    }[kind];
    return `**${nm}.** ${where} ${what}`;
  }

  const stageDeck = {
    id: 'stage', title: 'Name the stage', chip: 'Name it',
    rule: md`Find where the signal **enters** and where it **leaves**. The third terminal is the "common" one, and it names the stage. Input on the gate/base and output on the drain/collector: common source/emitter. Held gate/base with the input on the source/emitter: common gate/base. Output on the source/emitter: a follower (common drain/collector). Two stacked with a held gate/base on top: a cascode. A resistor between the source/emitter and its rail: degeneration.`,
    make() {
      const t = anyDev(), kind = pick(['cs', 'cs', 'deg', 'cg', 'cg', 'cd', 'cd', 'casc']), flip = pick([false, true]);
      const fam = DEV[t].mos ? 'mos' : 'bjt', names = STAGE_NAME[fam], L = looksLike(DEV[t]);
      const m = mc(names[kind], Object.keys(names).filter((k) => k !== kind).map((k) => [names[k], `Not quite: ${L[k]}`]));
      return { fig: stageFig(t, kind, flip), q: `${stageIntro(t)} **Which stage is this?**`, ...m, rule: stageRule(t, kind) };
    },
  };

  const PREDICT = (D) => ({
    inv: `Inverting, large: $A_v\\approx-g_m${D.R.d}$`,
    deg: `Inverting, set by resistors: $A_v\\approx-\\dfrac{${D.R.d}}{${D.R.s}+1/g_m}$`,
    ni: `Non-inverting: $A_v\\approx+\\dfrac{${D.R.d}}{${D.R.s}+1/g_m}$`,
    buf: 'Non-inverting, just under 1 (a buffer)',
  });
  const PREDICT_WHY = {
    inv: 'That is the plain common source/emitter (and a cascode with a resistor load): the input on the gate/base pulls current through the drain/collector resistor.',
    deg: 'That is a common source/emitter with a resistor in the source/emitter: the resistor sets the current, $i\\approx v_{in}/(R + 1/g_m)$.',
    ni: 'That is a common gate/base: the input pushes the source/emitter, the same current comes out of the drain/collector, and the output moves the same way as the input.',
    buf: 'That is a follower: the output is taken from the source/emitter, which follows the gate/base.',
  };
  const predictDeck = {
    id: 'predict', title: 'Predict the gain before computing', chip: 'Predict it',
    rule: md`Before any algebra, say the sign and the size. **In on the gate/base, out on the drain/collector: inverting.** Big ($g_mR$) if nothing is in the source/emitter, about $-R_{out}/R_{emitter}$ if there is a resistor there. **In on the source/emitter (gate/base held): non-inverting**, same size as the inverting one. **Out on the source/emitter: a buffer**, just under 1. A cascode with a resistor load gains no more than the common source.`,
    make() {
      const t = anyDev(), kind = pick(['cs', 'deg', 'cg', 'cd', 'casc']), flip = pick([false, true]);
      const P = PREDICT(DEV[t]);
      const key = { cs: 'inv', deg: 'deg', cg: 'ni', cd: 'buf', casc: 'inv' }[kind];
      const m = mc(P[key], Object.keys(P).filter((k) => k !== key).map((k) => [P[k], PREDICT_WHY[k]]));
      return { fig: stageFig(t, kind, flip), q: `${stageIntro(t)} **What does this stage do to $v_{in}$?** ($r_o$, $r_{ds}$ ignored.)`, ...m, rule: stageRule(t, kind) };
    },
  };

  // ------------------------------------------------------------------ deck: what do you see looking in?
  const LOOK_MOS = [
    ['$\\infty$', 'That is a gate: no current ever flows into a gate.'],
    ['$r_{ds}$', 'That is a drain with the gate held and the source straight on its rail.'],
    ['$r_{ds}(1 + g_mR)$ (plus $R$): big', 'That is a drain with the gate held and a resistor $R$ between the source and its rail (degeneration multiplies $R$ by about $g_mr_{ds}$).'],
    ['$\\dfrac{1}{g_m}$ (small)', 'That is a source with the gate held (drain on its rail), or a diode-connected transistor.'],
    ['$\\dfrac{1}{g_m}\\Big(1 + \\dfrac{R}{r_{ds}}\\Big)$: still small', 'That is a source with the gate held and a resistor $R$ on the drain side.'],
  ];
  const LOOK_BJT = [
    ['$\\infty$', 'Not for a BJT base: the base draws current, $i_b = v_\\pi/r_\\pi$. ($\\infty$ is a MOSFET gate, or a collector if you drop $r_o$.)'],
    ['$r_\\pi$', 'That is the base with the emitter straight on its rail.'],
    ['$r_\\pi + (\\beta + 1)R$', 'That is the base with a resistor $R$ in the emitter: $R$ looks $(\\beta + 1)$ times bigger from the base.'],
    ['$r_o$', 'That is the collector with the base held and the emitter straight on its rail.'],
    ['$r_o[1 + g_m(R\\parallel r_\\pi)]$: big', 'That is the collector with the base held and $R$ in the emitter (degeneration; the ceiling is $\\beta r_o$).'],
    ['$\\dfrac{r_\\pi}{\\beta + 1}\\approx\\dfrac{1}{g_m}$', 'That is the emitter with the base held (no resistor at the base), or a diode-connected BJT.'],
    ['$\\dfrac{r_\\pi + R}{\\beta + 1}$', 'That is the emitter with a resistor $R$ in series with the base: $R$ looks $(\\beta + 1)$ times smaller from the emitter.'],
  ];
  const LOOK_CASES = {
    mos: {
      gate: { a: 0, at: 'side', s: 'rail', d: 'rail', why: 'The test node is on the gate. A gate is an insulated plate: no current flows in, so $R = \\infty$.' },
      drain: { a: 1, at: 'd', s: 'rail', g: 'held', why: 'Drain, gate held, source on its rail: $v_{gs} = 0$, the controlled source is off, only $r_{ds}$ is left.' },
      drainDeg: { a: 2, at: 'd', s: 'R', g: 'held', why: 'Drain with $R$ under the source: the test current lifts the source, which turns the device down and fights the current. $R_X = r_{ds} + R + g_mr_{ds}R\\approx r_{ds}(1 + g_mR)$.' },
      source: { a: 3, at: 's', d: 'rail', g: 'held', why: 'Source, gate held: pushing the source by $v$ changes $v_{gs}$ by $-v$ and the current by $g_mv$. That is $1/g_m$ (in parallel with $r_{ds}$).' },
      sourceRD: { a: 4, at: 's', d: 'R', g: 'held', why: 'Source with $R$ on the drain: still about $1/g_m$, raised by $R/r_{ds}$: $R_X = \\dfrac{r_{ds} + R}{1 + g_mr_{ds}}$.' },
      diode: { a: 3, at: 'd', s: 'rail', g: 'diode', why: 'Diode-connected (gate tied to drain): the test voltage moves the gate too, $v_{gs} = v$, current $g_mv$. That is $1/g_m$.' },
    },
    bjt: {
      base: { a: 1, at: 'side', s: 'rail', d: 'rail', why: 'Base with the emitter on its rail: the base current is $v_\\pi/r_\\pi$, so $R = r_\\pi = \\beta/g_m$. Not infinite: the BJT\'s big difference from a MOSFET.' },
      baseRE: { a: 2, at: 'side', s: 'R', d: 'rail', why: 'Base with $R$ in the emitter: the emitter carries $(\\beta + 1)$ times the base current, so $R$ looks $(\\beta + 1)$ times bigger: $r_\\pi + (\\beta + 1)R$.' },
      collector: { a: 3, at: 'd', s: 'rail', g: 'held', why: 'Collector, base held, emitter on its rail: $v_\\pi = 0$, the controlled source is off, only $r_o$ is left.' },
      collectorRE: { a: 4, at: 'd', s: 'R', g: 'held', why: 'Collector with $R$ in the emitter: the same degeneration as a MOSFET drain, except $r_\\pi$ sits in parallel with $R$: $r_o[1 + g_m(R\\parallel r_\\pi)] + R\\parallel r_\\pi$, at most about $\\beta r_o$.' },
      emitter: { a: 5, at: 's', d: 'rail', g: 'held', why: 'Emitter, base held: $v_\\pi = -v$, the emitter current changes by $(g_m + 1/r_\\pi)v$. That is $r_\\pi/(\\beta + 1)\\approx 1/g_m$.' },
      emitterRB: { a: 6, at: 's', d: 'rail', g: 'RB', why: 'Emitter with $R$ in series with the base: going from the base side to the emitter side divides by $(\\beta + 1)$: $\\dfrac{r_\\pi + R}{\\beta + 1}$.' },
      diode: { a: 5, at: 'd', s: 'rail', g: 'diode', why: 'Diode-connected BJT (base tied to collector): $v_\\pi = v$, current $(g_m + 1/r_\\pi)v$, so $R = r_\\pi/(\\beta + 1)\\approx 1/g_m$.' },
    },
  };
  function lookFig(t, C, flip) {
    const D = DEV[t], dir = flip ? -1 : 1, P = pinsOf(1, 1, flip), e = [[t, [1, 1], { flip, dc: C.g === 'diode' }]];
    const dp = dPin(t, P), sp = sPin(t, P);
    const test = (p) => {
      if (p === P.side) { const x = P.side[0] - 0.8 * dir; return [['w', p, [x, p[1]]], ['term', [x, p[1]], { n: dir > 0 ? 'R_X\\rightarrow' : '\\leftarrow R_X', side: dir > 0 ? 'l' : 'r' }]]; }
      const y = isTop(p, P) ? p[1] - 0.5 : p[1] + 0.5, x = p[0] + 1.4 * dir;
      return [['w', p, [p[0], y], [x, y]], ['term', [x, y], { n: dir > 0 ? '\\leftarrow R_X' : 'R_X\\rightarrow', side: dir > 0 ? 'r' : 'l' }]];
    };
    if (C.at === 'side') e.push(...test(P.side));
    else if (C.g === 'held') e.push(['acg', P.side]);
    else if (C.g === 'RB') { const x = P.side[0] - 1.2 * dir; e.push(['R', [Math.min(x, P.side[0]), P.side[1]], [Math.max(x, P.side[0]), P.side[1]], { n: 'R' }], ['acg', [x, P.side[1]]]); }
    if (C.at === 'd') e.push(...test(dp)); else if (C.d === 'rail') e.push(toRail(dp, P)); else if (C.d === 'R') e.push(...resRail(dp, P, 'R'));
    if (C.at === 's') e.push(...test(sp)); else if (C.s === 'rail') e.push(toRail(sp, P)); else if (C.s === 'R') e.push(...resRail(sp, P, 'R'));
    return e;
  }
  const lookDeck = {
    id: 'look', title: 'What do you see looking in?', chip: 'Look in',
    rule: md`**Arrow = source/emitter** (NMOS/NPN arrow out at the bottom; PMOS/PNP arrow in at the top). Then: **gate $\infty$, base $r_\pi$**; **drain/collector big** ($r_o$, times $(1 + g_mR)$ with a resistor under it); **source/emitter small** ($1/g_m$, plus $R/(\beta + 1)$ for a base resistor); **diode small** ($1/g_m$). A resistor seen through the base–emitter junction is multiplied by $(\beta + 1)$ going up into the base and divided by $(\beta + 1)$ going down into the emitter.`,
    make() {
      const t = anyDev(), fam = DEV[t].mos ? 'mos' : 'bjt', kase = pick(Object.keys(LOOK_CASES[fam])), C = LOOK_CASES[fam][kase];
      const O = fam === 'mos' ? LOOK_MOS : LOOK_BJT;
      const m = mc(O[C.a][0], O.filter((_, j) => j !== C.a).map((o) => [o[0], o[1]]));
      return {
        fig: lookFig(t, C, pick([false, true])),
        q: `${DEV[t].name}. Triangles are held biases (incremental ground). ${fam === 'bjt' ? 'Use the full model ($r_\\pi$, $g_m$, $r_o$). ' : ''}**What resistance $R_X$ do you see at the arrow?**`,
        ...m,
        rule: `${DEV[t].n ? `${DEV[t].name}: the arrow is on the bottom lead, so the ${DEV[t].s} is at the bottom.` : `${DEV[t].name}: the arrow is on the top lead (pointing in), so the ${DEV[t].s} is on top, toward the supply.`} ${C.why}`,
      };
    },
  };

  // ------------------------------------------------------------------ deck: how big is the node? (R_UP || R_DN, smallest wins)
  // size classes: 1 = about 1/g_m, 2 = kilohms (R, r_pi), 3 = r_o, 4 = degenerated / cascode, 5 = infinite
  const SIZE_WORD = { 1: 'small (about $1/g_m$: tens to hundreds of ohms)', 2: 'kilohms', 3: 'big ($r_o$: about 100 kΩ)', 4: 'huge (megohms)', 5: 'infinite' };
  function sizeBlocks(B) {
    const Q = B ? 'Q' : 'M', ro = B ? 'r_{o' : 'r_{ds';
    const up = {
      R: { e: [['R', [1, -1.4], [1, 0], { n: B ? 'R_C' : 'R_D' }], ['rail', [1, -1.4]]], c: 2, t: B ? 'R_C' : 'R_D', say: `a resistor to the supply: $${B ? 'R_C' : 'R_D'}$` },
      cur: { e: [[B ? 'pnp' : 'pmos', [1, -1], { n: `${Q}_2` }], ['acg', [0, -1]], ['rail', [1, -2]]], c: 3, t: `${ro}2}`, say: `a ${B ? 'PNP' : 'PMOS'} with its ${B ? 'base' : 'gate'} held, seen from its ${B ? 'collector' : 'drain'}: $${ro}2}$` },
      dio: { e: [[B ? 'pnp' : 'pmos', [1, -1], { n: `${Q}_2`, dc: true }], ['rail', [1, -2]]], c: 1, t: '\\tfrac{1}{g_{m2}}', say: `a diode-connected ${B ? 'PNP' : 'PMOS'}: $1/g_{m2}$` },
      deg: { e: [[B ? 'pnp' : 'pmos', [1, -1], { n: `${Q}_2` }], ['acg', [0, -1]], ['R', [1, -3.2], [1, -2], { n: 'R_2' }], ['rail', [1, -3.2]]], c: 4, t: B ? 'r_{o2}[1 + g_{m2}(R_2\\parallel r_{\\pi2})]' : 'r_{ds2}(1 + g_{m2}R_2)', say: `a degenerated ${B ? 'PNP collector' : 'PMOS drain'}: huge` },
      fol: { e: [[B ? 'npn' : 'nmos', [1, -1], { n: `${Q}_2` }], ['acg', [0, -1]], ['rail', [1, -2]]], c: 1, t: '\\tfrac{1}{g_{m2}}', say: `looking up into the ${B ? 'emitter of an NPN' : 'source of an NMOS'} whose ${B ? 'base' : 'gate'} is held: $1/g_{m2}$` },
      src: { e: [['rail', [1, -1.4]], ['I', [1, -1.4], [1, 0], { n: 'I_B' }]], c: 5, t: '\\infty', say: 'an ideal current source: infinite' },
    };
    const dn = {
      R: { e: [['R', [1, 0], [1, 1.4], { n: 'R_L' }], ['gnd', [1, 1.4]]], c: 2, t: 'R_L', say: 'a resistor to ground: $R_L$' },
      cur: { e: [[B ? 'npn' : 'nmos', [1, 1], { n: `${Q}_1` }], ['acg', [0, 1]], ['gnd', [1, 2]]], c: 3, t: `${ro}1}`, say: `a ${B ? 'collector' : 'drain'} with its ${B ? 'base' : 'gate'} held: $${ro}1}$` },
      dio: { e: [[B ? 'npn' : 'nmos', [1, 1], { n: `${Q}_1`, dc: true }], ['gnd', [1, 2]]], c: 1, t: '\\tfrac{1}{g_{m1}}', say: `a diode-connected ${B ? 'NPN' : 'NMOS'}: $1/g_{m1}$` },
      deg: { e: [[B ? 'npn' : 'nmos', [1, 1], { n: `${Q}_1` }], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_1' }], ['gnd', [1, 3.2]]], c: 4, t: B ? 'r_{o1}[1 + g_{m1}(R_1\\parallel r_{\\pi1})]' : 'r_{ds1}(1 + g_{m1}R_1)', say: `a degenerated ${B ? 'collector' : 'drain'}: huge` },
      casc: { e: [[B ? 'npn' : 'nmos', [1, 1], { n: `${Q}_1` }], ['acg', [0, 1]], [B ? 'npn' : 'nmos', [1, 3], { n: `${Q}_0` }], ['acg', [0, 3]], ['gnd', [1, 4]]], c: 4, t: B ? 'g_{m1}r_{o1}(r_{o0}\\parallel r_{\\pi1})' : 'g_{m1}r_{ds1}r_{ds0}', say: 'a cascode: huge' },
    };
    const side = {
      gate: { e: [['w', [1, 0], [2.6, 0]], ['nmos', [3.6, 0], { n: 'M_3' }], ['rail', [3.6, -1]], ['gnd', [3.6, 1]]], c: 5, t: '\\infty', say: 'the gate of $M_3$: it draws no current, so it does not load $X$ at all' },
      base: { e: [['w', [1, 0], [2.6, 0]], ['npn', [3.6, 0], { n: 'Q_3' }], ['rail', [3.6, -1]], ['gnd', [3.6, 1]]], c: 2, t: 'r_{\\pi3}', say: 'the base of $Q_3$: a base is NOT infinite, it loads $X$ with $r_{\\pi3}$' },
    };
    return { up, dn, side };
  }
  const sizeDeck = {
    id: 'size', title: 'How big is the node?', chip: 'Node size',
    rule: md`Every branch from the node to ground **or to the supply** is in parallel (the supply is incremental ground). **In parallel, the smallest wins.** Size ladder: $1/g_m$ (a source, an emitter, a diode: tens to hundreds of ohms) $\ll$ resistors and $r_\pi$ (kilohms) $\ll r_o$, $r_{ds}$ (about 100 kΩ) $\ll$ degenerated or cascoded drains/collectors (megohms) $\ll$ a gate or an ideal current source ($\infty$). A gate hanging on the node adds nothing; **a BJT base adds $r_\pi$.**`,
    make() {
      const B = pick([false, true]), K = sizeBlocks(B);
      const uk = pick(Object.keys(K.up)), dk = pick(Object.keys(K.dn)), sk = Math.random() < 0.45 ? pick(Object.keys(K.side)) : null;
      const blocks = [K.up[uk], K.dn[dk]].concat(sk ? [K.side[sk]] : []);
      const minC = Math.min(...blocks.map((b) => b.c));
      const win = blocks.filter((b) => b.c === minC);
      const ans = win.map((b) => b.t).join('\\parallel ');
      const right = win.length > 1 ? `$\\approx ${ans}$ (${win.length === 2 && win[0].t === win[1].t ? 'two equal ones' : 'comparable, so both count'})` : `$\\approx ${ans}$`;
      const wrong = [];
      blocks.filter((b) => b.c < 5 && (b.c !== minC || win.length > 1)).forEach((b) => wrong.push([`$\\approx ${b.t}$`, b.c > minC ? `Too big: in parallel, $${b.t}$ is swamped by $${ans}$.` : `Only one of the comparable branches: $${win.map((w) => w.t).join('$ and $')}$ are the same size, so both count.`]));
      const fin = blocks.filter((b) => b.c < 5);
      if (fin.length >= 2) wrong.push([`$${fin[0].t} + ${fin[1].t}$`, 'They are not in series: both run from $X$ to an incremental ground (supply or ground), so they are in parallel.']);
      if (minC < 5) wrong.push(['$\\infty$', blocks.some((b) => b.c === 5) ? 'One branch is infinite (a gate, or an ideal current source), but it is in parallel with finite ones: the finite ones decide.' : 'Something finite connects $X$ to ground, so the node is not infinite.']);
      const m = mc(right, wrong);
      const fig = [...K.up[uk].e, ...K.dn[dk].e, ...(sk ? K.side[sk].e : []), ['node', [1, 0], { n: 'X', side: 'ar', dot: true }]];
      return {
        fig, q: `${B ? 'BJTs' : 'MOSFETs'}; triangles are held biases. **Roughly, what is the small-signal resistance from node $X$ to ground?**`, ...m,
        rule: `The branches at $X$: ${blocks.map((b) => `${b.say} (${SIZE_WORD[b.c]})`).join('; ')}. In parallel the smallest wins: $R_X\\approx ${ans}$.`,
      };
    },
  };

  // ------------------------------------------------------------------ deck: MOS <-> BJT twins (fixed items)
  const TWINS = [
    { q: 'A MOSFET gate looks like $\\infty$. What does a BJT base look like (emitter on its rail)?', a: '$r_\\pi = \\beta/g_m$', w: [['$\\infty$', 'The base draws current: $i_b = v_\\pi/r_\\pi$.'], ['$1/g_m$', 'That is the emitter (or a diode). The base is $\\beta$ times bigger: $r_\\pi = \\beta/g_m$.'], ['$r_o$', 'That is the collector.']], rule: 'The single biggest difference: the base is not an open circuit. $r_\\pi = \\beta/g_m$ (2.5 kΩ at 1 mA, $\\beta = 100$).' },
    { q: 'A MOSFET source with the gate held looks like $1/g_m$. A BJT emitter with the base held?', a: '$\\dfrac{r_\\pi}{\\beta + 1}\\approx\\dfrac{1}{g_m}$', w: [['$r_\\pi$', 'That is looking into the base.'], ['$(\\beta + 1)/g_m$', 'Wrong way: the emitter side is the low side, divided by $(\\beta + 1)$, not multiplied.'], ['$r_o$', 'That is the collector.']], rule: 'Same as the MOSFET: about $1/g_m$. Exactly $r_\\pi/(\\beta + 1)$ because $r_\\pi$ also carries a little current.' },
    { q: 'MOSFET: $R_S$ under the source looks like $\\infty$ from the gate (no gate current). BJT: $R_E$ under the emitter, looking into the base?', a: '$r_\\pi + (\\beta + 1)R_E$', w: [['$\\infty$', 'Only for a gate. A base passes current, and the emitter passes $(\\beta + 1)$ times as much.'], ['$r_\\pi + R_E$', 'Forgot the $(\\beta + 1)$: $R_E$ carries $(\\beta + 1)i_b$, so it looks $(\\beta + 1)$ times bigger from the base.'], ['$(r_\\pi + R_E)/(\\beta + 1)$', 'That is the other direction (a base resistor seen from the emitter).']], rule: '"Up through the junction, multiply by $(\\beta + 1)$." $R_E$ seen from the base is $(\\beta + 1)R_E$.' },
    { q: 'MOSFET: a resistor $R_G$ in series with the gate changes nothing (no gate current). BJT: $R_B$ in series with the base of a common emitter does what to the gain?', a: 'Divides it by $(1 + R_B/r_\\pi)$: $A_v = -g_mR_C\\dfrac{r_\\pi}{r_\\pi + R_B}$', w: [['Nothing', 'Only for a gate. $R_B$ and $r_\\pi$ form a divider at the input.'], ['Multiplies it by $(\\beta + 1)$', 'No: $R_B$ only adds loss at the input.'], ['Adds $R_B/(\\beta + 1)$ to $R_{out}$', 'That happens in an emitter follower (output at the emitter), not in a common emitter.']], rule: 'With a BJT, any resistance in series with the base eats part of $v_{in}$: only $v_\\pi = v_{in}\\,r_\\pi/(r_\\pi + R_B)$ reaches the junction.' },
    { q: 'At $1\\,\\text{mA}$, a MOSFET with $V_{ov} = 0.2\\,\\text{V}$ has $g_m = 10\\,\\text{mS}$. A BJT at $1\\,\\text{mA}$ ($V_T = 25\\,\\text{mV}$)?', a: '$40\\,\\text{mS}$', w: [['$10\\,\\text{mS}$', 'That is the MOSFET: $2I_D/V_{ov}$. The BJT uses $I_C/V_T$.'], ['$80\\,\\text{mS}$', 'No factor of 2 for a BJT: $g_m = I_C/V_T$.'], ['$4\\,\\text{mS}$', 'Off by 10: $1\\,\\text{mA}/25\\,\\text{mV} = 0.04\\,\\text{S}$.']], rule: '$g_m = I_C/V_T$: 40 mS per mA. A BJT gives several times more $g_m$ per unit current than a MOSFET.' },
    { q: 'MOSFET drain with $R_S$ under the source: $\\approx r_{ds}(1 + g_mR_S)$, no limit as $R_S$ grows. BJT collector with $R_E$: the limit as $R_E\\to\\infty$?', a: '$\\approx\\beta r_o$', w: [['No limit', 'For a BJT, $R_E$ is paralleled by $r_\\pi$: $g_m(R_E\\parallel r_\\pi)$ tops out at $g_mr_\\pi = \\beta$.'], ['$r_o$', 'That is with $R_E = 0$.'], ['$g_mr_o^2$', 'That is a MOSFET cascode with $R_S = r_{ds}$.']], rule: '$r_o[1 + g_m(R_E\\parallel r_\\pi)]$: once $R_E\\gg r_\\pi$ the multiplier is $1 + \\beta$. So a BJT cascode or degenerated collector is at most about $\\beta r_o$.' },
    { q: 'Common-source gain is $-g_mR_D$. Common-emitter gain (source driving the base directly, $r_o$ ignored)?', a: '$-g_mR_C$', w: [['$-\\beta R_C$', 'No: $\\beta$ is a current gain. The voltage gain uses $g_m$.'], ['$-g_mR_C/\\beta$', 'No extra $\\beta$: with an ideal source on the base, $v_\\pi = v_{in}$.'], ['$-g_mr_\\pi$', 'That is $-\\beta$, not a voltage gain into $R_C$.']], rule: 'Same form: $G_M = g_m$, $R_{out} = R_C\\parallel r_o$. Only $g_m$ is bigger.' },
    { q: 'MOSFET follower output resistance: $\\approx 1/g_m$. BJT emitter follower driven through $R_B$?', a: '$R_E\\parallel\\dfrac{r_\\pi + R_B}{\\beta + 1}$', w: [['$R_E\\parallel\\dfrac{1}{g_m}$', 'That ignores $R_B$. For a BJT the base resistance shows up at the emitter, divided by $(\\beta + 1)$.'], ['$R_E + R_B$', 'Not in series: the emitter sees $R_B$ through the junction, divided by $(\\beta + 1)$.'], ['$r_\\pi + (\\beta + 1)R_E$', 'That is the input resistance (looking into the base).']], rule: '"Down through the junction, divide by $(\\beta + 1)$." The source resistance $R_B$ appears at the emitter as $R_B/(\\beta + 1)$.' },
    { q: 'A diode-connected NMOS looks like $1/g_m$. A diode-connected NPN (base tied to collector)?', a: '$\\dfrac{r_\\pi}{\\beta + 1}\\approx\\dfrac{1}{g_m}$', w: [['$r_\\pi$', 'The collector current $g_mv$ dominates: much smaller than $r_\\pi$.'], ['$r_o$', 'That is a collector with the base held.'], ['$\\infty$', 'No: the device conducts $g_mv$ for a voltage $v$.']], rule: 'Same as the MOSFET: about $1/g_m$.' },
    { q: 'Exam 2: looking down into a cascode drain gives $\\approx g_{m2}r_{ds2}r_{ds1}$. A BJT cascode collector?', a: '$\\approx g_{m2}r_{o2}(r_{o1}\\parallel r_{\\pi2})$', w: [['$g_{m2}r_{o2}r_{o1}$', 'Forgot $r_{\\pi2}$: the lower device\'s $r_{o1}$ sits in the upper emitter, in parallel with $r_{\\pi2}$.'], ['$r_{o1} + r_{o2}$', 'Missing the $g_m$ multiplication of degeneration.'], ['$\\beta r_{o1}$', 'Close in size if $r_{o1}\\gg r_{\\pi2}$, but the general form keeps $r_{o1}\\parallel r_{\\pi2}$.']], rule: 'Degenerated collector with $R_E = r_{o1}$: $r_{o2}[1 + g_{m2}(r_{o1}\\parallel r_{\\pi2})]$. Since $r_{o1}\\gg r_{\\pi2}$, this is about $\\beta r_{o2}$.' },
    { q: 'Which result is the **same** formula for a MOSFET and a BJT?', a: 'Looking into the drain/collector with the source/emitter on its rail: $r_{ds}$ / $r_o$', w: [['Looking into the gate/base', 'Gate $\\infty$, base $r_\\pi$: different.'], ['A resistor under the source/emitter, seen from the gate/base', 'Gate: $\\infty$. Base: $r_\\pi + (\\beta + 1)R_E$.'], ['The degenerated drain/collector for any $R$', 'The BJT one has $R\\parallel r_\\pi$ inside and a $\\beta r_o$ ceiling.']], rule: 'Everything that does not involve current into the control terminal is the same. Everything that does (base current) picks up $r_\\pi$ or a factor $(\\beta + 1)$.' },
    { q: 'MOSFET common gate: input resistance $\\approx 1/g_m$ (plus nothing at the gate). BJT common base with $R_B$ at the base?', a: '$\\dfrac{r_\\pi + R_B}{\\beta + 1}\\approx\\dfrac{1}{g_m} + \\dfrac{R_B}{\\beta + 1}$', w: [['$1/g_m$', 'Only when $R_B = 0$. A base resistor shows up at the emitter divided by $(\\beta + 1)$.'], ['$r_\\pi + R_B$', 'That is looking into the base side, not the emitter.'], ['$R_B$', 'Not directly: through the junction, divided by $(\\beta + 1)$.']], rule: 'Input of a common base = looking into the emitter.' },
  ];
  const twinDeck = {
    id: 'twin', title: 'MOSFET ↔ BJT twins', chip: 'MOS ↔ BJT',
    rule: md`A BJT is a MOSFET whose control terminal leaks: the base draws $i_b = i_c/\beta$. Whatever never involved gate current is unchanged (drain ↔ collector, $1/g_m$ at the source ↔ emitter, $G_M = g_m$, $A_v = -G_MR_{out}$). Whatever crosses the base–emitter junction picks up $r_\pi$ or a factor $(\beta + 1)$: **multiply going up into the base, divide going down into the emitter.** And $g_m = I_C/V_T$ (40 mS per mA).`,
    make() {
      const T = pick(TWINS);
      return { q: T.q, ...mc(T.a, T.w), rule: T.rule };
    },
  };

  // ------------------------------------------------------------------ deck: what resistance does this capacitor see?
  // Circuits with r_o, r_ds -> infinity. The input source is shorted (v_in = 0), the other capacitors are removed.
  function capCircuit(B, fam, cap) {
    const t = B ? 'npn' : 'nmos', e = [];
    const inp = (y, rn) => [['w', [0, y], [-0.4, y]], ['R', [-2, y], [-0.4, y], { n: rn }], ['Vac', [-2, y], [-2, y + 1], { n: 'v_{in}', side: 'l' }], ['gnd', [-2, y + 1]]];
    const load = (p, rn = 'R_L') => [['R', [p[0], p[1] - 1.2], p, { n: rn }], ['rail', [p[0], p[1] - 1.2]], ['w', p, [2.6, p[1]]], ['term', [2.6, p[1]], { n: 'v_{out}' }]];
    const toGnd = (p, n) => [['C', p, [p[0], p[1] + 1], { n }], ['gnd', [p[0], p[1] + 1]]];
    const Cn = (k) => ({ gs: B ? 'C_\\pi' : 'C_{gs}', gd: B ? 'C_\\mu' : 'C_{gd}', L: 'C_L', gs1: B ? 'C_{\\pi1}' : 'C_{gs1}', gd1: B ? 'C_{\\mu1}' : 'C_{gd1}', gs2: B ? 'C_{\\pi2}' : 'C_{gs2}' }[k]);
    if (fam === 'cs') {
      e.push([t, [1, 1]], ['gnd', [1, 2]], ...inp(1, 'R_S'), ...load([1, 0]));
      if (cap === 'gs') e.push(...toGnd([-0.4, 1], Cn('gs')));
      if (cap === 'gd') e.push(['w', [-0.4, 1], [-0.4, 0]], ['C', [-0.4, 0], [1, 0], { n: Cn('gd') }]);
    } else if (fam === 'cg') {
      e.push([t, [1, 1]], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['Vac', [1, 3.2], [1, 4.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.2]], ...load([1, 0]));
      if (cap === 'gs') e.push(['w', [1, 2], [2, 2]], ...toGnd([2, 2], Cn('gs')));
      if (cap === 'gd') e.push(...toGnd([2, 0], Cn('gd')));
    } else if (fam === 'cd') {
      e.push([t, [1, 1]], ['rail', [1, 0]], ...inp(1, 'R_S'), ['R', [1, 2], [1, 3.2], { n: 'R_L' }], ['gnd', [1, 3.2]], ['w', [1, 2], [2.6, 2]], ['term', [2.6, 2], { n: 'v_{out}' }]);
      if (cap === 'gs') e.push(['w', [-0.4, 1], [-0.4, 2]], ['C', [-0.4, 2], [1, 2], { n: Cn('gs'), side: 'b' }]);
      if (cap === 'gd') e.push(...toGnd([-0.4, 1], Cn('gd')));
      if (cap === 'L') e.push(...toGnd([2, 2], 'C_L'));
    } else if (fam === 'deg') {
      e.push([t, [1, 1]], ['R', [1, 2], [1, 3.2], { n: B ? 'R_E' : 'R_S' }], ['gnd', [1, 3.2]], ...inp(1, B ? 'R_B' : 'R_G'), ...load([1, 0]));
      if (cap === 'gs') e.push(['w', [-0.4, 1], [-0.4, 2]], ['C', [-0.4, 2], [1, 2], { n: Cn('gs'), side: 'b' }]);
      if (cap === 'gd') e.push(['w', [-0.4, 1], [-0.4, 0]], ['C', [-0.4, 0], [1, 0], { n: Cn('gd') }]);
    } else if (fam === 'casc') {
      e.push([t, [1, 3], { n: B ? 'Q_1' : 'M_1' }], [t, [1, 1], { n: B ? 'Q_2' : 'M_2' }], ['acg', [0, 1]], ['gnd', [1, 4]], ['node', [1, 2], { n: 'X', side: 'br' }], ...inp(3, 'R_S'), ...load([1, 0]));
      if (cap === 'gs1') e.push(...toGnd([-0.4, 3], Cn('gs1')));
      if (cap === 'gd1') e.push(['w', [-0.4, 3], [-0.4, 2]], ['C', [-0.4, 2], [1, 2], { n: Cn('gd1') }]);
      if (cap === 'gs2') e.push(['w', [1, 2], [2, 2]], ...toGnd([2, 2], Cn('gs2')));
    }
    if (cap === 'L' && fam !== 'cd') e.push(...toGnd([2, 0], 'C_L'));
    return e;
  }
  // the formulas, by circuit and capacitor: [tex, what it is (for the "why" of a wrong pick)]
  const CAPF = {
    mos: {
      cs: { gs: 'R_S', gd: 'R_S + R_L + g_mR_SR_L', L: 'R_L' },
      cg: { gs: 'R_S\\parallel\\tfrac{1}{g_m}', gd: 'R_L', L: 'R_L' },
      cd: { gs: '\\dfrac{R_S + R_L}{1 + g_mR_L}', gd: 'R_S', L: 'R_L\\parallel\\tfrac{1}{g_m}' },
      deg: { gs: '\\dfrac{R_G + R_S}{1 + g_mR_S}', gd: 'R_G + R_L + \\dfrac{g_m}{1 + g_mR_S}R_GR_L', L: 'R_L' },
      casc: { gs1: 'R_S', gd1: 'R_S + \\tfrac{1}{g_{m2}} + \\dfrac{g_{m1}}{g_{m2}}R_S', gs2: '\\tfrac{1}{g_{m2}}', L: 'R_L' },
    },
    bjt: {
      cs: { gs: 'R_S\\parallel r_\\pi', gd: "R' + R_L + g_mR'R_L,\\ R' = R_S\\parallel r_\\pi", L: 'R_L' },
      cg: { gs: 'R_S\\parallel\\dfrac{r_\\pi}{\\beta + 1}', gd: 'R_L', L: 'R_L' },
      cd: { gs: 'r_\\pi\\parallel\\dfrac{R_S + R_L}{1 + g_mR_L}', gd: 'R_S\\parallel[r_\\pi + (\\beta + 1)R_L]', L: 'R_L\\parallel\\dfrac{R_S + r_\\pi}{\\beta + 1}' },
      casc: { gs1: 'R_S\\parallel r_{\\pi1}', gd1: "R' + \\tfrac{1}{g_{m2}} + \\dfrac{g_{m1}}{g_{m2}}R',\\ R' = R_S\\parallel r_{\\pi1}", gs2: '\\dfrac{r_{\\pi2}}{\\beta + 1}\\approx\\tfrac{1}{g_{m2}}', L: 'R_L' },
    },
  };
  // the classic wrong answers for each circuit, written in that circuit's own symbols
  const CAPSLIP = {
    mos: {
      cs: [['R_S + R_L', 'Missing the Miller term $g_mR_SR_L$: the drain swings $-g_mR_L$ times the gate, so the bridge capacitor sees much more than $R_S + R_L$.'], ['(1 + g_mR_L)R_S', 'That is only the Miller-multiplied input part. The bridge rule adds $R_L$ too: $R_S + R_L + g_mR_SR_L$.'], ['R_S\\parallel R_L', 'The two ends of a capacitor are not in parallel through ground: stand at its two terminals and push a test current through it.'], ['\\tfrac{1}{g_m}', 'Nothing in a common source looks like $1/g_m$: the source is grounded and nobody looks into it.'], ['R_L\\parallel\\tfrac{1}{g_m}', 'That would need a diode or a source at the output. The drain looks infinite here.']],
      cg: [['R_S', 'Forgot the transistor: looking into the source gives $1/g_m$, in parallel with $R_S$.'], ['\\tfrac{1}{g_m}', 'Forgot $R_S$: the source node also has $R_S$ to the shorted input, in parallel.'], ['R_S + R_L + g_mR_SR_L', 'That is the common-source Miller result. In a common gate the gate is grounded, so no capacitor bridges input and output.'], ['R_L\\parallel\\tfrac{1}{g_m}', 'The output node is a drain: it looks infinite, so only $R_L$ is left there.'], ['R_S + \\tfrac{1}{g_m}', 'Series? $R_S$ and the source resistance both go from the source node to ground: parallel.']],
      cd: [['R_S + R_L', 'Missing the bootstrap: the source follows the gate, which divides by $1 + g_mR_L$.'], ['R_S + R_L + g_mR_SR_L', 'That is the common-source $C_{gd}$ result (inverting gain multiplies). A follower does the opposite: it shrinks the capacitor\'s resistance.'], ['\\tfrac{1}{g_m}', 'That forgets $R_L$ (and, for $C_{gs}$, $R_S$).'], ['R_L', 'Forgot the source itself: looking up into the source gives $1/g_m$ in parallel with $R_L$.'], ['R_S\\parallel R_L', 'Stand at the capacitor\'s own two terminals: these resistors are not simply in parallel.']],
      deg: [['R_G', 'That treats the source as grounded. With $R_S$ in the source, the capacitor sees $R_G$ and $R_S$, divided by $1 + g_mR_S$.'], ['R_G + R_S', 'Missing the feedback: the transistor fights the source movement, dividing by $1 + g_mR_S$.'], ['R_G + R_L + g_mR_GR_L', 'Forgot the degeneration: the effective transconductance is $g_m/(1 + g_mR_S)$.'], ['\\dfrac{R_G + R_L}{1 + g_mR_S}', 'Mixes the two results: the $C_{gs}$ formula uses $R_G$ and $R_S$; the $C_{gd}$ one is a bridge with $g_m/(1 + g_mR_S)$.'], ['R_L\\parallel R_S', 'The drain looks huge (degenerated), so the output node is just $R_L$; $R_S$ is not on that node.']],
      casc: [['R_S + R_L + g_{m1}R_SR_L', 'That is the plain common-source Miller result. In a cascode $C_{gd1}$ lands on node $X$ (about $1/g_{m2}$), not on the output.'], ['R_S + \\tfrac{1}{g_{m2}}', 'Missing the (small) Miller term $g_{m1}R_S/g_{m2}$.'], ['R_L\\parallel\\tfrac{1}{g_{m2}}', 'The output is the upper drain: it looks huge, so only $R_L$ remains there. $1/g_{m2}$ is node $X$.'], ['r_{ds1}', 'Node $X$ has the lower drain ($r_{ds1}$) in parallel with the upper source ($1/g_{m2}$): the small one wins.'], ['R_S\\parallel\\tfrac{1}{g_{m2}}', 'The gate node and node $X$ are different nodes; nothing connects $R_S$ to $X$ directly.']],
    },
    bjt: {
      cs: [['R_S', 'Forgot $r_\\pi$: it sits right across $C_\\pi$, so the base node is $R_S\\parallel r_\\pi$.'], ['r_\\pi', 'Forgot $R_S$: the base also has $R_S$ to the shorted source, in parallel.'], ['R_S + R_L + g_mR_SR_L', 'Right shape, but $R_{left}$ is the whole base node: $R_S\\parallel r_\\pi$, not $R_S$.'], ['R_S + R_L', 'Missing the Miller term: the collector swings $-g_mR_L$ times the base.'], ["(1 + g_mR_L)(R_S\\parallel r_\\pi)", 'Only the input half of the bridge rule: add $R_L$.']],
      cg: [['R_S\\parallel r_\\pi', 'That is the base node of a common emitter. Here $C_\\pi$ sits at the emitter (base grounded): looking into the emitter gives $r_\\pi/(\\beta + 1)$.'], ['R_S', 'Forgot the transistor: the emitter looks like $r_\\pi/(\\beta + 1)\\approx1/g_m$, in parallel with $R_S$.'], ['\\dfrac{r_\\pi}{\\beta + 1}', 'Forgot $R_S$: it also goes from the emitter node to (the shorted) ground.'], ['R_S + R_L + g_mR_SR_L', 'No Miller in a common base: the base is grounded, so $C_\\mu$ is just the output node to ground.'], ['R_L\\parallel\\tfrac{1}{g_m}', 'The collector looks infinite ($r_o\\to\\infty$): only $R_L$ is at the output.']],
      cd: [['\\dfrac{R_S + R_L}{1 + g_mR_L}', 'That is the MOSFET follower. A BJT has $r_\\pi$ directly across $C_\\pi$: put it in parallel.'], ['R_S', 'Forgot the base loading: the base node also sees $r_\\pi + (\\beta + 1)R_L$.'], ['R_L\\parallel\\tfrac{1}{g_m}', 'Forgot $R_S$: it shows up at the emitter divided by $(\\beta + 1)$: $(R_S + r_\\pi)/(\\beta + 1)$.'], ['r_\\pi + (\\beta + 1)R_L', 'That is only looking into the base. The base node also has $R_S$ in parallel.'], ['R_S + R_L + g_mR_SR_L', 'That is the common-emitter Miller result. A follower shrinks, not grows.']],
      casc: [['R_S', 'Forgot $r_{\\pi1}$: it sits across $C_{\\pi1}$, so the base node is $R_S\\parallel r_{\\pi1}$.'], ['R_S + R_L + g_{m1}R_SR_L', 'That is the plain common-emitter Miller result. In a cascode $C_{\\mu1}$ lands on node $X$ (about $1/g_{m2}$).'], ['r_{\\pi2}', 'That is looking into the base of $Q_2$. Node $X$ is its emitter: $r_{\\pi2}/(\\beta + 1)$.'], ['R_L\\parallel\\tfrac{1}{g_{m2}}', 'The output is the upper collector: it looks huge, so only $R_L$ remains there.'], ['R_S + \\tfrac{1}{g_{m2}}', 'Missing pieces: the left node is $R_S\\parallel r_{\\pi1}$, and there is a small Miller term.']],
    },
  };
  const FAMNAME = { mos: { cs: 'common source', cg: 'common gate', cd: 'source follower', deg: 'degenerated common source', casc: 'cascode' }, bjt: { cs: 'common emitter', cg: 'common base', cd: 'emitter follower', casc: 'cascode' } };
  function capWhy(B, fam, cap) {
    const g = B ? 'base' : 'gate', d = B ? 'collector' : 'drain', s = B ? 'emitter' : 'source';
    const W = {
      cs: {
        gs: B ? `$C_\\pi$ goes from the base to the emitter (ground). The base node sees $R_S$ (to the shorted source) in parallel with $r_\\pi$.` : `$C_{gs}$ goes from the gate to the source (ground). The gate node sees only $R_S$ back to the shorted source: the gate draws nothing.`,
        gd: `$${B ? 'C_\\mu' : 'C_{gd}'}$ bridges the ${g} (input) and the ${d} (output). Bridge rule: $R_{left} + R_{right} + g_mR_{left}R_{right}$ with $R_{left} = ${B ? 'R_S\\parallel r_\\pi' : 'R_S'}$ and $R_{right} = R_L$. The $g_m$ term is the Miller effect.`,
        L: `$C_L$ hangs from the output to ground. With the ${g} at zero (no signal), the controlled source is off; the output sees $R_L$ (and $r_o\\to\\infty$).`,
      },
      cg: {
        gs: `The ${g} is held, so $${B ? 'C_\\pi' : 'C_{gs}'}$ goes from the ${s} to ground. Looking into the ${s} gives ${B ? '$r_\\pi/(\\beta + 1)\\approx1/g_m$' : '$1/g_m$'}, in parallel with $R_S$ to the shorted source.`,
        gd: `The ${g} is held, so $${B ? 'C_\\mu' : 'C_{gd}'}$ goes from the ${d} (output) to ground: it sees the output node, $R_L$ (the ${d} itself looks infinite with $r_o\\to\\infty$). No Miller multiplication in a common ${g}.`,
        L: `$C_L$ at the output sees $R_L$ (the ${d} looks infinite with $r_o\\to\\infty$).`,
      },
      cd: {
        gs: B ? `$C_\\pi$ bridges base and emitter. The MOSFET answer $(R_S + R_L)/(1 + g_mR_L)$ applies, with $r_\\pi$ in parallel (it sits right across $C_\\pi$). The output follows the input, so this capacitor is "bootstrapped": small.` : `$C_{gs}$ bridges gate and source, and the source follows the gate: $(R_S + R_L)/(1 + g_mR_L)$. Small: the follower bootstraps it.`,
        gd: `The ${d} is on the supply (incremental ground), so $${B ? 'C_\\mu' : 'C_{gd}'}$ goes from the ${g} to ground. The ${g} node sees $R_S$ ${B ? 'in parallel with looking into the base: $r_\\pi + (\\beta + 1)R_L$' : '(the gate draws nothing)'}.`,
        L: `$C_L$ at the ${s} (the output) sees $R_L$ in parallel with looking up into the ${s}: ${B ? '$(R_S + r_\\pi)/(\\beta + 1)$' : '$1/g_m$ ($R_S$ does not matter: no gate current)'}.`,
      },
      deg: {
        gs: `$C_{gs}$ bridges gate and source. Push current through it: $R_G$ and $R_S$ both carry it, and the source movement is fought by $g_m$: $(R_G + R_S)/(1 + g_mR_S)$ (Lecture 29).`,
        gd: `$C_{gd}$ bridges gate and drain. Bridge rule with the degenerated transconductance $g_m/(1 + g_mR_S)$: $R_G + R_L + \\dfrac{g_m}{1 + g_mR_S}R_GR_L$.`,
        L: `$C_L$ at the output: the drain looks huge (degenerated), so $C_L$ sees $R_L$.`,
      },
      casc: {
        gs1: `$${B ? 'C_{\\pi1}' : 'C_{gs1}'}$ goes from the input ${g} to ground: $R_S$${B ? ' in parallel with $r_{\\pi1}$' : ''}.`,
        gd1: `$${B ? 'C_{\\mu1}' : 'C_{gd1}'}$ bridges the input ${g} and node $X$. $R_{right}$ is node $X$: looking into the upper ${s}, about $1/g_{m2}$. Bridge rule: $R_{left} + 1/g_{m2} + g_{m1}R_{left}/g_{m2}$. The Miller factor is only $1 + g_{m1}/g_{m2}\\approx2$: that is why the cascode is fast.`,
        gs2: `The upper ${g} is held, so $${B ? 'C_{\\pi2}' : 'C_{gs2}'}$ goes from $X$ to ground. $X$ sees the upper ${s} (about $1/g_{m2}$) in parallel with the lower ${d} (huge).`,
        L: '$C_L$ at the output sees $R_L$ in parallel with the cascode\'s huge output resistance: $R_L$.',
      },
    };
    return W[fam][cap];
  }
  const capDeck = {
    id: 'cap', title: 'What does this capacitor see?', chip: 'Cap sees R',
    rule: md`Open-circuit time constants: short the input source, remove every other capacitor, and stand at the two ends of this one. **Capacitor from a node to ground: the resistance at that node** (the Exam 2 skill). **Capacitor bridging the gate/base and the drain/collector: $R_{left} + R_{right} + G_mR_{left}R_{right}$**, the $G_m$ term being Miller. For a BJT, $r_\pi$ sits across $C_\pi$ and in every base-node resistance.`,
    make() {
      const B = pick([false, true]), fam = pick(B ? ['cs', 'cs', 'cg', 'cd', 'casc'] : ['cs', 'cs', 'cg', 'cd', 'deg', 'casc']);
      const F = CAPF[B ? 'bjt' : 'mos'][fam], cap = pick(Object.keys(F));
      const right = `$${F[cap]}$`;
      // distractors use only this circuit's symbols: what its other capacitors see, then the classic slips
      const wrong = [];
      shuffle(Object.keys(F).filter((k) => k !== cap && F[k] !== F[cap])).slice(0, 2).forEach((k) => wrong.push([`$${F[k]}$`, `That is what ${k === 'L' ? '$C_L$' : 'another capacitor'} in this circuit sees.`]));
      shuffle(CAPSLIP[B ? 'bjt' : 'mos'][fam]).forEach(([x, why]) => { if (wrong.length < 4 && x !== F[cap] && !wrong.some((w) => w[0] === `$${x}$`)) wrong.push([`$${x}$`, why]); });
      const capName = { gs: B ? 'C_\\pi' : 'C_{gs}', gd: B ? 'C_\\mu' : 'C_{gd}', L: 'C_L', gs1: B ? 'C_{\\pi1}' : 'C_{gs1}', gd1: B ? 'C_{\\mu1}' : 'C_{gd1}', gs2: B ? 'C_{\\pi2}' : 'C_{gs2}' }[cap];
      return {
        fig: capCircuit(B, fam, cap),
        q: `A ${FAMNAME[B ? 'bjt' : 'mos'][fam]}${B ? ' ($\\beta$, $r_\\pi$, $g_m$)' : ''}; $r_o$, $r_{ds}\\to\\infty$. Only $${capName}$ is drawn (the others are removed) and $v_{in}$ is shorted. **What resistance does $${capName}$ see?**`,
        ...mc(right, wrong),
        rule: capWhy(B, fam, cap),
      };
    },
  };

  // ------------------------------------------------------------------ deck: read a transfer function (Bode)
  const sup = (e) => `10^{${e}}`;
  function tfTeX(k, cs) {
    const z = cs.filter((c) => c.z), p = cs.filter((c) => !c.z);
    const fac = (c) => `\\left(1 + \\dfrac{s}{${sup(c.e)}}\\right)`;
    const num = `${k}${z.map(fac).join('')}`;
    return p.length ? `H(s) = \\dfrac{${num}}{${p.map(fac).join('')}}` : `H(s) = ${num}`;
  }
  const dB = (x) => 20 * Math.log10(Math.abs(x));
  // the four candidates closest to the right value (so the options are never a giveaway)
  const near = (cands, v) => cands.filter((c) => c !== v).sort((a, b) => Math.abs(a - v) - Math.abs(b - v)).slice(0, 4);
  const fdb = (x) => `${U.fmt(x, 3)}\\,\\text{dB}`;
  const bodeDeck = {
    id: 'bode', title: 'Read the transfer function', chip: 'Bode read',
    rule: md`Write $H(s)$ as $A_{dc}\cdot\dfrac{\prod(1 + s/\omega_z)}{\prod(1 + s/\omega_p)}$. **Magnitude:** start at $20\log_{10}|A_{dc}|$; at each pole the slope drops 20 dB/decade, at each zero it rises 20 dB/decade. **Phase:** each pole adds $-90°$ spread over 0.1× to 10× its frequency ($-45°$ right at it), each (left-half-plane) zero $+90°$; a negative $A_{dc}$ adds $180°$.`,
    make() {
      const k = pick([10, 20, 50, 100, 200, 1000]);
      const n = pick([2, 3, 3]);
      const es = shuffle([2, 3, 4, 5, 6, 7, 8]).slice(0, n).sort((a, b) => a - b);
      let cs = es.map((e) => ({ e, z: Math.random() < 0.35 }));
      if (cs.every((c) => c.z)) cs[0].z = false;
      const slopeAt = (w) => 20 * cs.reduce((s, c) => s + (w > c.e ? (c.z ? 1 : -1) : 0), 0);
      const magAt = (w) => dB(k) + cs.reduce((s, c) => s + (w > c.e ? (c.z ? 20 : -20) * (w - c.e) : 0), 0);
      const phAt = (w) => cs.reduce((s, c) => s + (c.z ? 1 : -1) * (w <= c.e - 1 ? 0 : w >= c.e + 1 ? 90 : 45 * (w - c.e + 1)), 0);
      const H = tfTeX(k, cs);
      const kind = pick(['dc', 'slope', 'slope', 'mag', 'mag', 'phase', 'hiphase']);
      const nm = (v, u) => `$${v > 0 && u !== 'dB' ? '+' : ''}${U.fmt(v, 3)}${u}$`;
      let q, right, wrong, rule;
      const corners = cs.map((c) => `$${sup(c.e)}$ (${c.z ? 'zero' : 'pole'})`).join(', ');
      if (kind === 'dc') {
        q = `$${H}$. **What is the low-frequency gain in dB?**`;
        right = `$${fdb(dB(k))}$`;
        wrong = [[`$${fdb(10 * Math.log10(k))}$`, 'That is $10\\log_{10}$: voltage gains use $20\\log_{10}$.'], [`$${fdb(k)}$`, `That is the plain ratio ${k}, not decibels.`], [`$${fdb(dB(k) + 20)}$`, 'One decade too many: $\\times10$ is $+20$ dB.'], [`$${fdb(dB(k) - 20)}$`, 'One decade too few.']];
        rule = `At low frequency every $(1 + s/\\omega)$ is 1, so $H\\to${k}$: $20\\log_{10}${k} = ${U.fmt(dB(k), 3)}$ dB.`;
      } else if (kind === 'slope' || kind === 'hiphase') {
        const i = U.ri(0, cs.length);  // region above the i-th corner (i = 0: below the first)
        const lo = i === 0 ? null : cs[i - 1].e, hi = i < cs.length ? cs[i].e : null;
        const w = lo === null ? hi - 1 : hi === null ? lo + 1 : (lo + hi) / 2;
        if (kind === 'slope') {
          const sl = slopeAt(w);
          const where = lo === null ? `below $\\omega = ${sup(hi)}$` : hi === null ? `above $\\omega = ${sup(lo)}$` : `between $${sup(lo)}$ and $${sup(hi)}$ rad/s`;
          q = `$${H}$. **What is the slope of $|H|_{dB}$ ${where}?**`;
          right = nm(sl, '\\,\\text{dB/dec}');
          wrong = near([-60, -40, -20, 0, 20, 40, 60], sl).map((v) => [nm(v, '\\,\\text{dB/dec}'), `Count the corners below this region: ${cs.filter((c) => lo !== null && c.e <= lo && !c.z).length} pole(s) at $-20$ each and ${cs.filter((c) => lo !== null && c.e <= lo && c.z).length} zero(s) at $+20$ each.`]);
          rule = `Corners: ${corners}. The slope is $20\\times$(zeros passed $-$ poles passed) dB/decade: ${sl} dB/dec here.`;
        } else {
          const ph = 90 * cs.reduce((s, c) => s + (c.z ? 1 : -1), 0);
          q = `$${H}$. **What does the phase of $H$ approach at very high frequency?**`;
          right = nm(ph, '°');
          wrong = near([-270, -180, -90, 0, 90, 180], ph).map((v) => [nm(v, '°'), `Each pole ends at $-90°$, each zero at $+90°$: ${cs.filter((c) => !c.z).length} pole(s), ${cs.filter((c) => c.z).length} zero(s).`]);
          rule = `Far above every corner each pole contributes $-90°$ and each zero $+90°$: total ${ph}°.`;
        }
      } else if (kind === 'mag') {
        const w = U.ri(cs[0].e, cs[cs.length - 1].e + 1);
        const v = magAt(w);
        q = `$${H}$. **Using straight-line asymptotes, what is $|H|$ in dB at $\\omega = ${sup(w)}$ rad/s?**`;
        right = `$${fdb(v)}$`;
        wrong = [[`$${fdb(v + 20)}$`, 'Off by one decade of slope: recount the decades from each corner up to this $\\omega$.'], [`$${fdb(v - 20)}$`, 'Off by one decade of slope: recount the decades from each corner up to this $\\omega$.'], [`$${fdb(v + 40)}$`, 'Off by two decades of slope.'], [`$${fdb(dB(k))}$`, 'That is the low-frequency level: corners below this frequency have already bent the curve.'], [`$${fdb(v - 3)}$`, 'The $-3$ dB correction applies only right at an isolated corner, and the question asks for straight lines.']];
        rule = `Start at $${fdb(dB(k))}$. ${cs.filter((c) => c.e < w).map((c) => `From $${sup(c.e)}$ to $${sup(w)}$ is ${w - c.e} decade(s) of ${c.z ? '+' : '−'}20 dB`).join('; ') || 'No corner lies below this frequency'}. Total ${U.fmt(v, 3)} dB.`;
      } else {
        const w = U.ri(cs[0].e - 1, cs[cs.length - 1].e + 1);
        const ph = phAt(w);
        q = `$${H}$. **Using the straight-line phase rule, what is $\\angle H$ at $\\omega = ${sup(w)}$ rad/s?**`;
        right = nm(ph, '°');
        wrong = near([-270, -225, -180, -135, -90, -45, 0, 45, 90, 135], ph).map((v) => [nm(v, '°'), 'Each corner moves the phase over two decades: $0°$ at a tenth of it, $\\mp45°$ at it, $\\mp90°$ at ten times it.']);
        rule = `Each pole: $0°$ up to $0.1\\omega_p$, $-45°$ at $\\omega_p$, $-90°$ from $10\\omega_p$ (zeros the same with $+$). At $${sup(w)}$: ${cs.map((c) => `${c.z ? 'zero' : 'pole'} at $${sup(c.e)}$ gives ${(c.z ? 1 : -1) * (w <= c.e - 1 ? 0 : w >= c.e + 1 ? 90 : 45 * (w - c.e + 1))}°`).join(', ')}. Sum: ${ph}°.`;
      }
      const m = mc(right, wrong.filter((x) => x[0] !== right).slice(0, 4));
      return { q, ...m, rule };
    },
  };

  // ------------------------------------------------------------------ deck: decibels in your head
  const DBS = [[1, 0], [2, 6], [4, 12], [5, 14], [8, 18], [10, 20], [20, 26], [40, 32], [50, 34], [100, 40], [200, 46], [500, 54], [1000, 60], [0.5, -6], [0.1, -20], [0.01, -40], ['1/\\sqrt2', -3], ['\\sqrt2', 3]];
  const dbDeck = {
    id: 'db', title: 'Decibels in your head', chip: 'dB',
    rule: md`$|H|_{dB} = 20\log_{10}|H|$. Anchors: $\times10 = +20$ dB, $\times2\approx+6$ dB, $\times\sqrt2\approx+3$ dB. Multiplying ratios adds decibels: $50 = 100/2\to40 - 6 = 34$ dB. Below 1 is negative: $0.1\to-20$ dB, $1/\sqrt2\to-3$ dB.`,
    make() {
      const [r, d] = pick(DBS);
      const rt = typeof r === 'string' ? r : U.fmt(r, 3);
      if (Math.random() < 0.5) {
        const right = `$${d}\\,\\text{dB}$`;
        const wrong = [d + 6, d - 6, d + 20, d - 20, d / 2, 2 * d].filter((x) => x !== d).map((x) => [`$${U.fmt(x, 3)}\\,\\text{dB}$`, x === d / 2 ? 'That is $10\\log_{10}$ (power). Voltage gain uses $20\\log_{10}$.' : 'Build it from the anchors: $\\times10 = 20$ dB, $\\times2 = 6$ dB, and products add.']);
        return { q: `**A gain of $${rt}$ is how many dB?**`, ...mc(right, shuffle(wrong).slice(0, 4)), rule: `$20\\log_{10}(${rt})\\approx${d}$ dB.` };
      }
      const right = `$${rt}$`;
      const pool = DBS.filter((x) => x[1] !== d).map((x) => [`$${typeof x[0] === 'string' ? x[0] : U.fmt(x[0], 3)}$`, `That is ${x[1]} dB.`]);
      return { q: `**$${d}\\,\\text{dB}$ is what gain (as a ratio)?**`, ...mc(right, shuffle(pool).slice(0, 4)), rule: `${d} dB is a ratio of $${rt}$.` };
    },
  };

  // ------------------------------------------------------------------ deck: Miller
  const millerDeck = {
    id: 'miller', title: 'Miller in one look', chip: 'Miller',
    rule: md`A capacitor $C_F$ across an amplifier of gain $A_v$ looks like $C_F(1 - A_v)$ from the input and $C_F(1 - 1/A_v)$ from the output. **Inverting gain $-A$: the input sees $(1 + A)C_F$** (Miller multiplication; $C_{gd}$, $C_\mu$ in a common source/emitter). **Follower, $A_v\approx1$: $C_F(1 - A_v)\approx0$** (bootstrapped). **Common gate/base: the gate/base is grounded, so nothing bridges input and output.**`,
    make() {
      const kind = pick(['in', 'in', 'out', 'cs', 'fol', 'which']);
      const c = pick([0.1, 0.2, 0.5, 1, 2]), A = pick([4, 9, 19, 49, 99]);
      const pf = (x) => `$${U.fmt(x, 3)}\\,\\text{pF}$`;
      if (kind === 'in' || kind === 'out') {
        const isIn = kind === 'in';
        const right = isIn ? pf((1 + A) * c) : pf(c * (1 + 1 / A));
        const wrong = [[pf(A * c), 'Close, but the factor is $1 + A$: the voltage across $C_F$ is $v_{in}(1 + A)$.'], [pf(c), isIn ? 'That ignores the gain: the far end of $C_F$ swings $A$ times harder in the opposite direction.' : 'Nearly (it is $C_F(1 + 1/A)$), but pick the exact one.'], [pf(c / (1 + A)), 'Upside down: the capacitance is multiplied, not divided.'], [pf(Math.abs(1 - A) * c), 'Sign slip: the gain is $-A$, so $1 - A_v = 1 + A$.'], [pf((1 + A) * c), 'That is the input side. The output side is $C_F(1 + 1/A)\\approx C_F$.']].filter((x) => x[0] !== right);
        return { q: `$C_F = ${c}\\,\\text{pF}$ connects the input and output of an inverting amplifier with gain $-${A}$. **What capacitance does it look like from the ${isIn ? 'input' : 'output'} (to ground)?**`, ...mc(right, wrong.slice(0, 4)), rule: isIn ? `$C_{in} = C_F(1 - A_v) = ${c}(1 + ${A}) = ${U.fmt((1 + A) * c, 3)}$ pF.` : `$C_{out} = C_F(1 - 1/A_v) = ${c}(1 + 1/${A})\\approx${U.fmt(c * (1 + 1 / A), 3)}$ pF.` };
      }
      if (kind === 'cs') {
        const cgs = pick([0.5, 1, 2]), g = A;
        const right = pf(cgs + (1 + g) * c);
        const wrong = [[pf(cgs + c), 'That leaves out the Miller multiplication of $C_{gd}$.'], [pf((1 + g) * c), 'That forgets $C_{gs}$, which also hangs on the gate.'], [pf(cgs + g * c), 'The factor is $1 + g_mR_L$, not $g_mR_L$.'], [pf((1 + g) * (cgs + c)), 'Only $C_{gd}$ bridges input and output; $C_{gs}$ goes to the grounded source and is not multiplied.']];
        return { q: `A common source with $g_mR_L = ${g}$, $C_{gs} = ${cgs}\\,\\text{pF}$, $C_{gd} = ${c}\\,\\text{pF}$. **Total capacitance at the gate (Miller approximation)?**`, ...mc(right, wrong), rule: `$C_{in} = C_{gs} + (1 + g_mR_L)C_{gd} = ${cgs} + ${1 + g}(${c}) = ${U.fmt(cgs + (1 + g) * c, 3)}$ pF. The input pole is $1/(R_SC_{in})$.` };
      }
      if (kind === 'fol') {
        const av = pick([0.8, 0.9, 0.95]);
        const right = pf(c * (1 - av));
        const wrong = [[pf(c * (1 + av)), 'The follower does not invert: $1 - A_v$ with $A_v = +' + av + '$.'], [pf(c), 'The far end moves with the input, so less current flows: the capacitance shrinks.'], [pf(c * 2), 'No doubling: the far end follows, it does not oppose.']];
        return { q: `In a follower with $A_v = ${av}$, $C_{gs} = ${c}\\,\\text{pF}$ connects the input (gate) and the output (source). **What does it look like from the input?**`, ...mc(right, wrong), rule: `$C_F(1 - A_v) = ${c}(1 - ${av}) = ${U.fmt(c * (1 - av), 3)}$ pF. The output follows the input, so almost no voltage appears across $C_{gs}$: it is "bootstrapped" away.` };
      }
      const right = 'Common gate / common base';
      return {
        q: '**Which stage has no Miller multiplication of $C_{gd}$ ($C_\\mu$) at its input?**', ...mc(right, [
          ['Common source / common emitter', 'That is the classic Miller case: $C_{gd}$ bridges an inverting gain of $-g_mR_L$.'],
          ['Common source with source degeneration', 'Still inverting from gate to drain: $C_{gd}$ is multiplied by $1 + |A_v|$.'],
          ['The bottom device of a cascode, with a large factor', 'The cascode keeps the factor small (about 2), but it is not zero.'],
        ]),
        rule: 'In a common gate/base the gate/base is grounded: $C_{gd}$ ($C_\\mu$) goes from the output to ground and $C_{gs}$ ($C_\\pi$) from the input to ground. Nothing bridges input and output, so nothing is multiplied.',
      };
    },
  };

  // ------------------------------------------------------------------ deck: bias at a glance
  const biasDeck = {
    id: 'bias', title: 'Bias at a glance', chip: 'Bias',
    rule: md`BJT: $g_m = I_C/V_T$ (**40 mS per mA**), $r_\pi = \beta/g_m$ (2.5 kΩ at 1 mA, $\beta = 100$), $r_o = V_A/I_C$. NPN forward active: $V_{BE}\approx0.7$ V and the collector **not below** the base ($V_C\ge V_B$); collector below the base (by more than about 0.4 V) means saturation, $V_{BE} < 0.5$ V means cutoff. PNP: everything flipped ($V_{EB}\approx0.7$, $V_C\le V_B$). MOSFET: $g_m = 2I_D/V_{ov}$.`,
    make() {
      const kind = pick(['gm', 'rpi', 'ro', 'npn', 'npn', 'pnp', 'mos']);
      if (kind === 'gm') {
        const I = pick([0.1, 0.25, 0.5, 1, 2, 5]);
        const right = `$${U.fmt(I * 40, 3)}\\,\\text{mS}$`;
        return { q: `**A BJT at $I_C = ${I}\\,\\text{mA}$ ($V_T = 25\\,\\text{mV}$): $g_m$?**`, ...mc(right, [[`$${U.fmt(I * 4, 3)}\\,\\text{mS}$`, 'Off by 10: $1/0.025 = 40$.'], [`$${U.fmt(I * 80, 3)}\\,\\text{mS}$`, 'No factor of 2 for a BJT ($2I/V_{ov}$ is the MOSFET).'], [`$${U.fmt(I * 25, 3)}\\,\\text{mS}$`, 'Divide by $V_T$, do not multiply by 25.'], [`$${U.fmt(I * 400, 3)}\\,\\text{mS}$`, 'Off by 10.']]), rule: `$g_m = I_C/V_T = ${I}\\,\\text{mA}/25\\,\\text{mV} = ${U.fmt(I * 40, 3)}$ mS.` };
      }
      if (kind === 'rpi') {
        const I = pick([0.25, 0.5, 1, 2]), b = pick([50, 100, 200]);
        const r = b / (I * 0.04);
        const k = (x) => `$${U.fmt(x / 1000, 3)}\\,\\text{k}\\Omega$`;
        return { q: `**$I_C = ${I}\\,\\text{mA}$, $\\beta = ${b}$: $r_\\pi$?**`, ...mc(k(r), [[k(1 / (I * 0.04)), 'That is $1/g_m$. $r_\\pi$ is $\\beta$ times bigger.'], [k(r * 10), 'Off by 10: $g_m = 40$ mS per mA.'], [k(r / 2), 'No factor of 2.'], [k(b * 25), 'That is $\\beta V_T$ in ohms with $I_C$ forgotten.']].filter((x) => x[0] !== k(r))), rule: `$g_m = ${U.fmt(I * 40, 3)}$ mS, $r_\\pi = \\beta/g_m = ${U.fmt(r / 1000, 3)}$ kΩ.` };
      }
      if (kind === 'ro') {
        const V = pick([25, 50, 100]), I = pick([0.5, 1, 2]);
        const k = (x) => `$${U.fmt(x, 3)}\\,\\text{k}\\Omega$`;
        return { q: `**$V_A = ${V}\\,\\text{V}$, $I_C = ${I}\\,\\text{mA}$: $r_o$?**`, ...mc(k(V / I), [[k(V * I), 'Divide, do not multiply: $r_o = V_A/I_C$.'], [k(V / I / 40), 'That divides by $V_T$ too: $r_o$ uses only $V_A$.'], [k(2 * V / I), 'No factor of 2.']]), rule: `$r_o = V_A/I_C = ${V}/${I}\\,\\text{mA} = ${U.fmt(V / I, 3)}$ kΩ.` };
      }
      if (kind === 'mos') {
        const I = pick([0.5, 1, 2]), Vov = pick([0.1, 0.2, 0.25, 0.5]);
        const g = 2 * I / Vov;
        const ms = (x) => `$${U.fmt(x, 3)}\\,\\text{mS}$`;
        return { q: `**A MOSFET (Exam 2) at $I_D = ${I}\\,\\text{mA}$, $V_{ov} = ${Vov}\\,\\text{V}$: $g_m$?**`, ...mc(ms(g), [[ms(I / Vov), 'Missing the 2: $g_m = 2I_D/V_{ov}$.'], [ms(I * 40), 'That is the BJT formula $I_C/V_T$.'], [ms(4 * I / Vov), 'One factor of 2 too many.']]), rule: `$g_m = 2I_D/V_{ov} = 2(${I})/${Vov} = ${U.fmt(g, 3)}$ mS. Same current through a BJT would give ${U.fmt(40 * I, 3)} mS.` };
      }
      // region from node voltages
      const npn = kind === 'npn';
      const reg = pick(['active', 'active', 'sat', 'cut']);
      const VB = pick([1, 1.5, 2, 2.5, 3]);
      let VE, VC;
      if (npn) {
        VE = reg === 'cut' ? VB - pick([0, 0.2]) : VB - 0.7;
        VC = reg === 'sat' ? VE + 0.2 : reg === 'active' ? VB + pick([0.5, 1, 2, 3]) : VB + pick([1, 2]);
      } else {
        VE = reg === 'cut' ? VB + pick([0, 0.2]) : VB + 0.7;
        VC = reg === 'sat' ? VE - 0.2 : reg === 'active' ? VB - pick([0.5, 1, 1.5]) : VB - pick([1, 1.5]);
      }
      const v = (x) => `${U.fmt(x, 3)}\\,\\text{V}`;
      const names = { active: 'Forward active', sat: 'Saturation', cut: 'Cutoff' };
      const why = {
        active: npn ? 'Forward active needs $V_{BE}\\approx0.7$ V and $V_C\\ge V_B$ (base–collector not forward-biased).' : 'Forward active (PNP) needs $V_{EB}\\approx0.7$ V and $V_C\\le V_B$.',
        sat: npn ? 'Saturation: $V_{BE}\\approx0.7$ V but the collector has fallen below the base, both junctions forward ($V_{CE}\\approx0.2$ V).' : 'Saturation (PNP): the collector has risen above the base, $V_{EC}\\approx0.2$ V.',
        cut: 'Cutoff: the base–emitter junction is not turned on (well under 0.7 V across it).',
      };
      return {
        q: `**${npn ? 'NPN' : 'PNP'} with $V_B = ${v(VB)}$, $V_E = ${v(VE)}$, $V_C = ${v(VC)}$. Which region?**`,
        ...mc(names[reg], Object.keys(names).filter((x) => x !== reg).map((x) => [names[x], why[x]]).concat([['Reverse active', 'Reverse active needs the base–collector junction on and the base–emitter junction off: rare, and not this one.']])),
        rule: `${npn ? `$V_{BE} = ${v(VB - VE)}$, $V_{CE} = ${v(VC - VE)}$` : `$V_{EB} = ${v(VE - VB)}$, $V_{EC} = ${v(VE - VC)}$`}. ${why[reg]}`,
      };
    },
  };

  const DECKS = [stageDeck, predictDeck, lookDeck, sizeDeck, twinDeck, capDeck, bodeDeck, dbDeck, millerDeck, biasDeck];
  window.GYM = { DECKS, byId: Object.fromEntries(DECKS.map((d) => [d.id, d])), mc, DEV, stageFig, lookFig, capCircuit };
})();

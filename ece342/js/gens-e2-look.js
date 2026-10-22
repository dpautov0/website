/* gens-e2-look.js — "which end is which, and what do I see?" One transistor (NMOS or PMOS) in a random canonical
   setup; the student names the source, names the terminal the test node touches, picks the resistance, then
   computes it. Answers from the exact formulas; the g_m r_ds >> 1 forms are accepted too. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick;
  const GENS = window.GENS;
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const MS = (g) => `${f(g * 1000, 3)}\\,\\text{mS}`;
  const resTeX = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  const resPart = (lbl, exact, approx) => {
    const [unit, s] = exact < 1e3 ? ['Ω', 1] : exact < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    const p = { lbl, unit, ans: exact * s };
    if (approx !== undefined && Math.abs(approx - exact) > 0.012 * exact) p.accept = [approx * s];
    return p;
  };

  // the five canonical answers, each with what it describes (used as the "why" when picked wrongly)
  const OPTS = [
    ['$\\infty$ (no current can flow in)', 'That is the gate: no current ever flows into a gate. The test node here is not on the gate.'],
    ['$r_{ds}$', 'That is a drain with its gate held and its source straight on its rail (ground for NMOS, $V_{DD}$ for PMOS).'],
    ['$r_{ds} + R + g_mr_{ds}R \\approx r_{ds}(1 + g_mR)$', 'That is a drain with its gate held and a resistor $R$ between its source and its rail (degeneration).'],
    ['$\\dfrac{1}{g_m}\\parallel r_{ds} \\approx \\dfrac{1}{g_m}$', 'That is a source (gate held, drain straight on its rail), or a diode-connected transistor.'],
    ['$\\dfrac{r_{ds} + R}{1 + g_mr_{ds}} \\approx \\dfrac{1}{g_m}\\Big(1 + \\dfrac{R}{r_{ds}}\\Big)$', 'That is a source with its gate held and a resistor $R$ on the drain side.'],
  ];

  const CASES = {
    gate: { term: 'Gate', opt: 0, name: 'looking into the gate',
      rule: 'No current ever flows into a gate (it is an insulated plate). So $i_t = 0$ for any $v_t$: the resistance is infinite.' },
    drain: { term: 'Drain', opt: 1, name: 'looking into the drain, gate held, source on its rail',
      rule: 'Gate and source are both at incremental ground, so $v_{gs} = 0$ and the dependent source is off. Only $r_{ds}$ is left between the drain and the rail.',
      r: (p) => p.r, ap: (p) => p.r },
    drainDeg: { term: 'Drain', opt: 2, name: 'looking into the drain, gate held, $R$ under the source (degeneration)',
      rule: 'The test current flows through $r_{ds}$ and then $R$. The current makes a voltage on $R$ at the source, which turns the transistor down ($v_{gs} = -i_tR$) and fights the current. That multiplies $R$ by about $g_mr_{ds}$: $R_X = r_{ds} + R + g_mr_{ds}R$.',
      r: (p) => p.r + p.R + p.g * p.r * p.R, ap: (p) => p.r * (1 + p.g * p.R) },
    source: { term: 'Source', opt: 3, name: 'looking into the source, gate held, drain on its rail',
      rule: 'Push the source by $v_t$ with the gate held: $v_{gs} = -v_t$, so the transistor changes its current by $g_mv_t$, all of it through the test node. A current $g_mv_t$ for a voltage $v_t$ is a resistor $1/g_m$ (in parallel with $r_{ds}$).',
      r: (p) => 1 / (p.g + 1 / p.r), ap: (p) => 1 / p.g },
    sourceRD: { term: 'Source', opt: 4, name: 'looking into the source, gate held, $R$ on the drain side',
      rule: 'Same as the plain source ($v_{gs} = -v_t$, roughly $1/g_m$), but the current also has to get through $R$ on the drain side, which adds the small correction $R/r_{ds}$: $R_X = \\dfrac{r_{ds} + R}{1 + g_mr_{ds}}$.',
      r: (p) => (p.r + p.R) / (1 + p.g * p.r), ap: (p) => (1 + p.R / p.r) / p.g },
    diode: { term: 'Drain', opt: 3, name: 'a diode-connected transistor (gate tied to drain), looking into that node',
      rule: 'The gate is wired to the drain, so the test voltage also moves the gate: $v_{gs} = v_t$. The transistor then carries $g_mv_t$ through the test node: a resistor $1/g_m$, in parallel with $r_{ds}$.',
      r: (p) => 1 / (p.g + 1 / p.r), ap: (p) => 1 / p.g },
  };

  // figure: device at [1,1]. NMOS: D [1,0] top, S [1,2] bottom. PMOS: S [1,0] top, D [1,2] bottom.
  function figure(type, kase, flip) {
    const n = type === 'nmos';
    const gx = flip ? 2 : 0;
    const e = [[type, [1, 1], { n: 'M_1', flip, dc: kase === 'diode' }]];
    const look = (pt, side) => ['term', pt, { n: side === 'l' ? 'R_X\\rightarrow' : '\\leftarrow R_X', side }];
    const topT = () => { e.push(['w', [1, 0], [1, -0.5], [2.4, -0.5]], look([2.4, -0.5], 'r')); };
    const botT = () => { e.push(['w', [1, 2], [1, 2.5], [2.4, 2.5]], look([2.4, 2.5], 'r')); };
    const topRail = (R) => { if (R) e.push(['R', [1, -1.2], [1, 0], { n: 'R', side: flip ? 'l' : 'r' }], ['rail', [1, -1.2]]); else e.push(['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]]); };
    const botGnd = (R) => { if (R) e.push(['R', [1, 2], [1, 3.2], { n: 'R', side: flip ? 'l' : 'r' }], ['gnd', [1, 3.2]]); else e.push(['gnd', [1, 2]]); };
    if (kase === 'gate') {
      const tx = flip ? 2.8 : -0.8;
      e.push(['w', [gx, 1], [tx, 1]], look([tx, 1], flip ? 'r' : 'l'));
      topRail(false); botGnd(false);
      return e;
    }
    if (kase !== 'diode') e.push(['acg', [gx, 1]]);
    // the terminal the test node touches, and what sits on the other end
    const drainTop = n;                       // NMOS drain is on top, PMOS drain at the bottom
    if (kase === 'drain' || kase === 'drainDeg' || kase === 'diode') {
      const R = kase === 'drainDeg';
      if (drainTop) { topT(); botGnd(R); } else { botT(); topRail(R); }
    } else {
      const R = kase === 'sourceRD';
      if (drainTop) { botT(); topRail(R); } else { topT(); botGnd(R); }
    }
    return e;
  }

  GENS.e2_look = () => {
    const type = pick(['nmos', 'pmos', 'pmos']);   // PMOS more often: it is the one that trips people up
    const kase = pick(['gate', 'drain', 'drainDeg', 'drainDeg', 'source', 'sourceRD', 'diode', 'diode']);
    const flip = pick([false, true]);
    const C = CASES[kase];
    const p = { g: pick([1, 2, 4, 5]) * 1e-3, r: pick([50, 100, 200]) * 1e3, R: pick([1, 2, 5, 10]) * 1e3 };
    const n = type === 'nmos';
    const T = n ? 'NMOS' : 'PMOS';
    const hasR = kase === 'drainDeg' || kase === 'sourceRD';

    const srcAns = n ? 1 : 0;   // 0 top, 1 bottom, 2 side
    const srcPart = {
      lbl: `1. Which terminal of $M_1$ (${T}) is its **source**?`,
      mc: ['The top one', 'The bottom one', 'The one on the side (the gate plate)'], a: srcAns,
      why: [
        n ? 'The arrow is on the source. For an NMOS it sits on the bottom lead and points **out**. The top is the drain.' : null,
        n ? null : 'The arrow is on the source. For a PMOS it sits on the **top** lead (toward $V_{DD}$) and points **in**. The bottom is the drain.',
        'The side terminal, at the plate, is always the gate.',
      ],
    };
    const termIdx = { Gate: 0, Drain: 1, Source: 2 }[C.term];
    const termPart = {
      lbl: '2. The test node ($R_X$) touches which terminal?',
      mc: ['Gate', 'Drain', 'Source'], a: termIdx,
      why: [0, 1, 2].map((j) => (j === termIdx ? null
        : kase === 'diode' && j === 0 ? 'The node does touch the gate too (gate tied to drain), but the current flows into the drain lead. Call it the drain of a diode-connected transistor.'
        : j === 0 ? 'The gate is the plate on the side. Follow the wire from $R_X$: it lands on the top or bottom lead.'
        : `Follow the wire from $R_X$ to the lead it lands on. For ${n ? 'an NMOS the top lead is the drain and the bottom is the source' : 'a PMOS the top lead is the source and the bottom is the drain'}.`)),
    };
    const resPick = { lbl: '3. What resistance do you see?', mc: OPTS.map((o) => o[0]), a: C.opt, why: OPTS.map((o, j) => (j === C.opt ? null : o[1])) };

    const parts = [srcPart, termPart, resPick];
    let num = '';
    if (C.r) {
      const ex = C.r(p), ap = C.ap(p);
      parts.push(resPart('R_X', ex, ap));
      num = `\n\n**Step 4: numbers.** $g_m = ${MS(p.g)}$, $r_{ds} = ${KO(p.r)}$${hasR ? `, $R = ${KO(p.R)}$` : ''}: $R_X = ${resTeX(ex)}$${Math.abs(ap - ex) > 0.012 * ex ? ` (the $g_mr_{ds}\\gg1$ form gives ${resTeX(ap)}, also accepted)` : ''}.`;
    }
    const where = n ? 'NMOS: the arrow is on the **bottom** lead, pointing **out**. Source at the bottom (toward ground), drain on top.'
      : 'PMOS: the arrow is on the **top** lead, pointing **in**. Source on top (toward $V_{DD}$), drain at the bottom.';
    const nums = C.r ? `$g_m = ${MS(p.g)}$, $r_{ds} = ${KO(p.r)}$${hasR ? `, $R = ${KO(p.R)}$` : ''}. ` : '';
    return {
      fig: figure(type, kase, flip),
      q: `${nums}Triangles are incremental grounds (the gate is held still). Answer in order: where is the source, what does the test node touch, and what does it see?`,
      parts,
      hints: [
        'Find the arrow first: it is always on the source. NMOS arrow points out (source at the bottom); PMOS arrow points in (source on top, at $V_{DD}$).',
        'Drain looks big ($r_{ds}$ or more), source looks small (about $1/g_m$), gate looks infinite. A diode (gate tied to drain) looks like $1/g_m$.',
      ],
      sol: `**Step 1: the source.** ${where}

**Step 2: the test node.** Follow the wire from $R_X$: this is ${C.name}.

**Step 3: the resistance.** ${C.rule}${kase !== 'gate' && !n ? '\n\nPMOS or NMOS makes no difference to the small-signal answer: the PMOS picture is the NMOS one upside down, with $V_{DD}$ playing the role of ground.' : ''}${num}`,
    };
  };
})();

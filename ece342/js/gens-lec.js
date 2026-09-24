/* gens-lec.js — the triode-region solver from Handout 3 / Lecture 7, and the random question bank.
   The bank draws from every stored problem in the course (past midterms, practice papers, homework,
   lecture examples, originals) plus exam-style generators, filtered by topic and source. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick;
  const GENS = window.GENS, FIGS = window.FIGS;
  const { tryUntil, clean, kO, Vv } = window.GEN_HELPERS;
  const KN = 100e-6;
  const mA = (i) => `${f(i * 1e3)}\\,\\text{mA}`;

  // NMOS, grounded source, drain resistor to V_DD, gate held by a source (optionally through R_G).
  FIGS.nsimple = (o = {}) => [
    ['rail', [2, 0], { n: o.vdds }], ['R', [2, 0], [2, 1.2], { n: 'R_D', s: o.RDs }],
    ['iarr', [2, 0.6], 'd', { n: 'I_D', side: 'l', off: [-15, 0] }],
    ['w', [2, 1.2], [2.9, 1.2]], ['term', [2.9, 1.2], { n: 'V_D' }],
    ['nmos', [2, 2.2], { sz: o.wls }], ['gnd', [2, 3.2]],
    ...(o.RG
      ? [['R', [1, 2.2], [-0.5, 2.2], { n: 'R_G', s: o.RGs }], ['w', [-0.5, 2.2], [-0.5, 2.6]], ['V', [-0.5, 2.6], [-0.5, 3.6], { n: o.vgn || 'V_G', s: o.vgs, side: 'l' }], ['gnd', [-0.5, 3.6]]]
      : [['w', [1, 2.2], [0, 2.2], [0, 2.6]], ['V', [0, 2.6], [0, 3.6], { n: o.vgn || 'V_G', s: o.vgs, side: 'l' }], ['gnd', [0, 3.6]]]),
  ];

  // ================================================================ triode: saturation fails, solve the triode quadratic
  GENS.triode_solve = () => {
    const c = tryUntil(() => {
      const WL = pick([10, 20, 40]), k = KN * WL;              // k = µnCox·W/L
      const vov = pick([2, 3, 4]), VD = pick([0.5, 1, 1.5, 2]);
      const ID = k * (vov * VD - VD * VD / 2);
      const RD = pick([500, 1000, 2000]);
      const VDD = VD + ID * RD;
      const Isat = 0.5 * k * vov * vov;
      return { WL, k, vov, VG: 1 + vov, VD, ID, RD, VDD, Isat, VDsat: VDD - Isat * RD };
    }, (o) => o.VD < o.vov - 0.4 && o.VDsat < o.vov && clean(o.VDD, 2) && o.VDD <= 12 && o.VDD >= o.VG);
    const a = c.k * c.RD / 2, b = -(c.k * c.RD * c.vov + 1);
    const disc = Math.sqrt(b * b - 4 * a * c.VDD);
    const r1 = (-b - disc) / (2 * a), r2 = (-b + disc) / (2 * a);
    return {
      q: `The NMOS below has $W/L = ${c.WL}$ ($\\mu_nC_{ox} = 100\\,\\mu\\text{A/V}^2$, $V_T = 1\\,\\text{V}$, $\\lambda = 0$). $V_G = ${Vv(c.VG)}$, $R_D = ${kO(c.RD)}$, $V_{DD} = ${Vv(c.VDD)}$. First **assume saturation** and find the drain voltage that assumption predicts. Then find the actual $I_D$ and $V_D$.`,
      fig: FIGS.nsimple({ vdds: `V_{DD}=${Vv(c.VDD)}`, RDs: kO(c.RD), wls: `W/L=${c.WL}`, vgs: Vv(c.VG) }),
      parts: [{ lbl: 'V_D\\text{ (if saturated)}', unit: 'V', ans: c.VDsat }, { lbl: 'I_D', unit: 'mA', ans: c.ID * 1e3 }, { lbl: 'V_D', unit: 'V', ans: c.VD }],
      hints: [
        md`Saturation: $I_D = \tfrac12\mu_nC_{ox}\tfrac{W}{L}V_{ov}^2$, then $V_D = V_{DD} - I_DR_D$. Compare with $V_{ov}$: saturation needs $V_{DS} \ge V_{ov}$.`,
        md`Triode: $I_D = \mu_nC_{ox}\tfrac{W}{L}\left[V_{ov}V_D - \tfrac12V_D^2\right]$ (source grounded, so $V_{DS} = V_D$). Set it equal to $\dfrac{V_{DD} - V_D}{R_D}$: a quadratic in $V_D$.`,
        md`Keep the root with $V_D < V_{ov}$. The other root is above $V_{ov}$, where the triode law doesn't apply.`,
      ],
      sol: `**Assume saturation:** $I_D = \\tfrac12(${f(c.k * 1e3)}\\,\\text{mA/V}^2)(${c.vov})^2 = ${mA(c.Isat)}$, so $V_D = ${f(c.VDD)} - ${f(c.Isat * c.RD)} = ${Vv(c.VDsat)}$. That's below $V_{ov} = ${c.vov}\\,\\text{V}$${c.VDsat < 0 ? ' (even negative)' : ''}: **not saturated**. The device is on, so it's in **triode**.

**Triode:** $\\mu_nC_{ox}\\tfrac{W}{L} = ${f(c.k * 1e3)}\\,\\text{mA/V}^2$:
$$\\frac{${f(c.VDD)} - V_D}{${f(c.RD)}} = ${f(c.k)}\\left[${c.vov}V_D - \\tfrac12V_D^2\\right] \\;\\Rightarrow\\; ${f(a)}V_D^2 - ${f(-b)}V_D + ${f(c.VDD)} = 0$$
Roots: $V_D = ${f(r1)}\\,\\text{V}$ or $${f(r2)}\\,\\text{V}$. The second is above $V_{ov}$ (not triode), so $V_D = ${Vv(c.VD)}$ and $I_D = \\dfrac{${f(c.VDD)} - ${f(c.VD)}}{${kO(c.RD)}} = ${mA(c.ID)}$.

**Check:** $V_{DS} = ${f(c.VD)} < V_{ov} = ${c.vov}$. Triode confirmed. (A big $V_{GS}$ alone never guarantees saturation; the drain has to stay high enough.)`,
    };
  };

  // ================================================================ the question bank
  const TOPIC = { lin: 'Linear circuits', nl: 'Nonlinear & diodes', mos: 'MOSFET DC' };
  // Problems whose number doesn't match their topic (e.g. a MOSFET short answer inside Problem 1).
  const OVERRIDE = { 'P1-P1b': 'nl', 'P1-P1c': 'mos', 'F23-P1c': 'nl', 'S26-P1b': 'nl', 'MC-P1b': 'nl', 'MD-P1b': 'nl' };
  const GEN_POOL = {
    lin: ['bb_scale', 'two_meas', 'reverse_thev', 'thev_dep', 'yparam', 'superpos', 'twoport_gain'],
    nl: ['sine_gain', 'inverse_op', 'two_point', 'diode_ss', 'diode_isrc', 'nl_src', 'pwl_q', 'cvd_branch', 'newton_step', 'swing_max'],
    mos: ['stack_mirror_rmax', 'mos_rs_bias', 'pmos_rs_bias', 'mirror_rmax', 'stack_vov', 'size_for_current', 'diode_conn', 'triode_solve', 'size_rules'],
  };
  const topicOf = (p) => {
    if (p.cat) return p.cat;
    if (OVERRIDE[p.id]) return OVERRIDE[p.id];
    const ps = /^PS(\d)/.exec(p.id);
    if (ps) return ['lin', 'nl', 'mos'][+ps[1] - 1];
    const m = /-P(\d)/.exec(p.id);
    return m ? ['lin', 'nl', 'mos'][+m[1] - 1] : null;
  };
  const sourceOf = (p) => {
    if (p.kind) return p.kind;
    if (/^PS/.test(p.id)) return 'hw';
    if (/^(MA|MB|MC|MD|NX)-/.test(p.id)) return 'orig';
    return 'real';
  };

  // Cached, but rebuilt whenever lessons are added (e.g. a newly transcribed paper loaded later).
  let ALL = null, SIZE = -1;
  function collect() {
    const size = COURSE.units.reduce((n, u) => n + u.lessons.reduce((m, l) => m + l.steps.length, 0), 0);
    if (ALL && size === SIZE) return ALL;
    SIZE = size;
    const seen = new Map();
    const pref = { exam: 0, mock: 1, pset: 2 };
    for (const u of COURSE.units) for (const l of u.lessons) for (const s of l.steps) {
      if (s.t !== 'prob' || !s.id || l.id === 'u5-bank') continue;
      const e = seen.get(s.id);
      const rank = pref[l.kind] ?? 3;
      if (!e) seen.set(s.id, { p: s, lesson: l.id, rank, topic: topicOf(s), source: sourceOf(s) });
      else if (rank < e.rank) Object.assign(e, { lesson: l.id, rank });
    }
    ALL = [...seen.values()].filter((e) => e.topic);
    return ALL;
  }

  const queues = new Map();
  GENS.bank = (o = {}) => {
    const topics = o.cat && o.cat !== 'any' ? [o.cat] : ['lin', 'nl', 'mos'];
    const from = o.from || ['real', 'hw', 'lec', 'orig', 'gen'];
    const stat = collect().filter((e) => topics.includes(e.topic) && from.includes(e.source));
    const useGen = from.includes('gen') && (!stat.length || Math.random() < 0.3);
    if (useGen) {
      const name = pick(topics.flatMap((t) => GEN_POOL[t]));
      const g = GENS[name]();
      return Object.assign(g, { src: `Generated · ${TOPIC[topics.length === 1 ? topics[0] : Object.keys(GEN_POOL).find((t) => GEN_POOL[t].includes(name))]}` });
    }
    // Deal questions from a shuffled deck so none repeats until the deck runs out.
    const key = topics.join() + '|' + from.join();
    let q = queues.get(key);
    if (!q || !q.length) { q = U.shuffle(stat.map((e) => e.p.id)); queues.set(key, q); }
    const id = q.pop();
    const e = stat.find((x) => x.p.id === id);
    return Object.assign({}, e.p);
  };

  window.BANK = { collect, TOPIC };
})();

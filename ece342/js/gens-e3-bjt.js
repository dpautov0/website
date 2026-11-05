/* gens-e3-bjt.js — randomized Exam 3 drills for Units 10–11 (the BJT): which lead is which, operating regions, DC bias,
   g_m / r_pi / r_o from the bias, "which terminal + what do you see", R_UP || R_DN with BJT and MOS blocks, and the
   (beta + 1) elevator. Every answer comes from the exact formula (checked against a nodal solve); the beta >> 1 and
   g_m r_o >> 1 forms are accepted where a problem allows them. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick;
  const GENS = window.GENS;
  const par = U.par;
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const MS = (g) => `${f(g * 1000, 3)}\\,\\text{mS}`;
  const MA = (i) => `${f(i * 1000, 3)}\\,\\text{mA}`;
  const VV = (v) => `${f(v, 3)}\\,\\text{V}`;
  const resTeX = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  const VT = 0.025;

  // a resistance answer in a sensible unit; accepts = other forms that count as right; traps = known slips
  const resAns = (lbl, exact, accepts = [], traps = []) => {
    const [unit, s] = exact < 1e3 ? ['Ω', 1] : exact < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    const p = { lbl, unit, ans: exact * s };
    const acc = accepts.filter((a) => Math.abs(a - exact) > 0.012 * exact);
    if (acc.length) p.accept = acc.map((a) => a * s);
    const good = [exact, ...accepts];
    const t = traps.filter((x) => isFinite(x.v) && good.every((v) => Math.abs(x.v - v) > 0.02 * v));
    if (t.length) p.traps = t.map((x) => ({ v: x.v * s, msg: x.msg }));
    return p;
  };
  // one random BJT at a sensible bias
  const randQ = () => {
    const beta = pick([50, 100, 100, 200]), IC = pick([0.25, 0.5, 1, 1, 2]) * 1e-3, VA = pick([50, 100]);
    const gm = IC / VT;
    return { beta, IC, VA, gm, rpi: beta / gm, ro: VA / IC };
  };
  const qText = (q, name = '') => `${name ? `${name}: ` : ''}$\\beta = ${q.beta}$, $g_m = ${MS(q.gm)}$, $r_\\pi = ${KO(q.rpi)}$, $r_o = ${KO(q.ro)}$`;
  window.E3B = { resAns, randQ, qText, KO, MS, MA, VV, resTeX };
  const T = (window.E3B._test = {});

  // ================================================================ which lead is which
  GENS.e3_bwhich = () => {
    const type = pick(['npn', 'pnp']);
    const flip = pick([false, true]);
    const n = type === 'npn';
    const names = U.shuffle(['A', 'B', 'C']);           // labels on (top, side, bottom)
    const [top, side, bot] = names;
    const gx = flip ? 2 : 0;
    const fig = [[type, [1, 1], { flip }], ['w', [1, 0], [1, -0.35]], ['w', [1, 2], [1, 2.35]], ['w', [gx, 1], [flip ? 2.35 : -0.35, 1]],
      ['txt', [1.22, -0.3], `$${top}$`, { a: 'l' }], ['txt', [1.22, 2.3], `$${bot}$`, { a: 'l' }], ['txt', [flip ? 2.45 : -0.45, 0.72], `$${side}$`]];
    const L3 = ['A', 'B', 'C'];
    const opts = L3.map((x) => `Lead ${x}`);
    const E = n ? bot : top, Cc = n ? top : bot, B = side;
    const idx = (nm) => L3.indexOf(nm);
    const whyLead = (nm, role) => L3.map((x) => (x === nm ? null
      : x === side ? 'The lead on the side, at the bar, is always the **base**.'
      : x === E ? `Lead ${x} carries the arrow, so it is the **emitter**${role === 'collector' ? ', not the collector' : ''}.`
      : `Lead ${x} has no arrow and is not on the side: it is the **collector**.`));
    const hiIdx = idx(n ? Cc : E);
    return {
      fig,
      q: 'Read the symbol. Answer from the arrow alone: it is always on the emitter.',
      parts: [
        { lbl: '1. NPN or PNP?', mc: ['NPN', 'PNP'], a: n ? 0 : 1, fixed: true,
          why: [n ? null : 'The arrow points **in** toward the bar: that is a PNP ("Pointing iN").', n ? 'The arrow points **out**, away from the bar: that is an NPN ("Not Pointing iN").' : null] },
        { lbl: '2. Which lead is the emitter?', mc: opts, a: idx(E), why: whyLead(E, 'emitter'), fixed: true },
        { lbl: '3. Which lead is the collector?', mc: opts, a: idx(Cc), why: whyLead(Cc, 'collector'), fixed: true },
        { lbl: '4. Forward active: which lead sits at the highest voltage?', mc: opts, a: hiIdx, fixed: true,
          why: L3.map((x) => (L3.indexOf(x) === hiIdx ? null
            : n ? (x === E ? 'For an NPN the emitter is the **lowest** node (base is 0.7 V above it, collector above the base).' : 'For an NPN the base is only 0.7 V above the emitter; the collector is higher still.')
              : (x === Cc ? 'For a PNP the collector is the **lowest** node (it sits below the base).' : 'For a PNP the base is 0.7 V **below** the emitter.'))) },
      ],
      hints: ['The arrow is always on the emitter, and it shows the direction conventional current flows through the emitter lead: out of an NPN, into a PNP.',
        'In the standard drawing current flows from top to bottom: NPN collector on top, PNP emitter on top.'],
      sol: `**1.** The arrow points ${n ? '**out** of the device: NPN' : '**in** toward the bar: PNP'}.

**2–3.** The arrow is on lead ${E}, so that is the emitter. The side lead (${B}) is the base. The remaining lead, ${Cc}, is the collector.

**4.** ${n ? `NPN in forward active: $V_E < V_B = V_E + 0.7\\,\\text{V} \\le V_C$. The **collector** (lead ${Cc}) is highest.` : `PNP in forward active: everything flips: $V_C \\le V_B = V_E - 0.7\\,\\text{V} < V_E$. The **emitter** (lead ${E}) is highest; it hangs off $V_{CC}$.`}

MOSFET twin: emitter ↔ source (the arrow is on the source there too), base ↔ gate, collector ↔ drain. A PNP is drawn like a PMOS: emitter on top, toward the supply.`,
    };
  };

  // ================================================================ regions from node voltages
  const REG = ['Forward active', 'Saturation', 'Cutoff', 'Reverse active'];
  GENS.e3_bregion = () => {
    const type = pick(['npn', 'npn', 'pnp']);
    const n = type === 'npn';
    const reg = pick([0, 0, 0, 1, 1, 2, 3]);
    const r2 = (x) => Math.round(x * 100) / 100;
    // build in "NPN coordinates" (x = V for NPN, x = -V for PNP), then flip for PNP
    const e = pick([0, 0.5, 1, 1.3, 2, 2.5, 3]);
    let b, c;
    if (reg === 0) { b = e + 0.7; c = b + pick([0.3, 0.8, 1.5, 2.3, 3.2, 4.5]); }
    else if (reg === 1) { b = e + pick([0.7, 0.75, 0.8]); c = e + pick([0.1, 0.2, 0.2, 0.3]); }
    else if (reg === 2) { b = e + pick([0, 0.2, -0.5, -1]); c = b + pick([1, 2, 3]); }
    else { c = e + pick([-1.5, -1, -0.5]); b = c + 0.7; if (b - e > 0.3) b = e + 0.2; c = b - 0.7; }
    const s = n ? 1 : -1;
    const base0 = n ? 0 : 5;                               // PNP voltages sit below a 5 V supply
    const V = { B: r2(base0 + s * b), C: r2(base0 + s * c), E: r2(base0 + s * e) };
    const fig = [[type, [1, 1], {}], ['w', [1, 0], [1, -0.3]], ['w', [1, 2], [1, 2.3]], ['w', [0, 1], [-0.3, 1]],
      ['txt', [1.2, -0.3], `$V_${n ? 'C' : 'E'} = ${f(n ? V.C : V.E)}\\,\\text{V}$`, { a: 'l' }],
      ['txt', [1.2, 2.3], `$V_${n ? 'E' : 'C'} = ${f(n ? V.E : V.C)}\\,\\text{V}$`, { a: 'l' }],
      ['txt', [-0.4, 1], `$V_B = ${f(V.B)}\\,\\text{V}$`, { a: 'r' }]];
    const vbe = r2(n ? V.B - V.E : V.E - V.B), vbc = r2(n ? V.B - V.C : V.C - V.B);
    const beOn = vbe >= 0.6, bcOn = vbc >= 0.4;
    const nm = n ? ['V_{BE}', 'V_{BC}'] : ['V_{EB}', 'V_{CB}'];
    return {
      fig,
      q: `A${n ? 'n NPN' : ' PNP'} with the node voltages shown. Decide each junction, then the region. (On: about $0.7\\,\\text{V}$ of forward bias. A base–collector junction counts as forward biased from about $0.4\\,\\text{V}$.)`,
      parts: [
        { lbl: `1. Base–emitter junction ($${nm[0]} = ${f(vbe)}\\,\\text{V}$)`, mc: ['Forward biased (on)', 'Off'], a: beOn ? 0 : 1, fixed: true,
          why: [beOn ? null : `$${nm[0]} = ${f(vbe)}\\,\\text{V}$ is well under the $0.7\\,\\text{V}$ a silicon junction needs to conduct.`, beOn ? `$${nm[0]} = ${f(vbe)}\\,\\text{V}$: that is the turn-on voltage, so it conducts.` : null] },
        { lbl: `2. Base–collector junction ($${nm[1]} = ${f(vbc)}\\,\\text{V}$)`, mc: ['Reverse biased (or zero)', 'Forward biased'], a: bcOn ? 1 : 0, fixed: true,
          why: [bcOn ? `$${nm[1]} = ${f(vbc)}\\,\\text{V}$ is positive and large enough to forward bias it: the ${n ? 'collector is below the base' : 'collector is above the base'}.` : null, bcOn ? null : `$${nm[1]} = ${f(vbc)}\\,\\text{V}$: the collector is ${n ? 'at or above' : 'at or below'} the base, so that junction is not forward biased.`] },
        { lbl: '3. Region', mc: REG, a: reg, fixed: true,
          why: [
            'Forward active needs BE on **and** BC off.', 'Saturation needs **both** junctions on: then $V_{CE}$ collapses to about $0.2\\,\\text{V}$.',
            'Cutoff is BE off and BC off: no current at all.', 'Reverse active is BE off and BC on: the transistor used upside down.'].map((w, j) => (j === reg ? null : w)) },
      ],
      hints: [n ? 'NPN: $V_{BE} = V_B - V_E$, $V_{BC} = V_B - V_C$.' : 'PNP: everything is flipped. $V_{EB} = V_E - V_B$, $V_{CB} = V_C - V_B$.',
        'BE on + BC off: forward active. Both on: saturation. Both off: cutoff.'],
      sol: `**Junctions.** $${nm[0]} = ${f(vbe)}\\,\\text{V}$: BE ${beOn ? '**on**' : '**off**'}. $${nm[1]} = ${f(vbc)}\\,\\text{V}$: BC ${bcOn ? '**forward biased**' : '**reverse biased** (or zero)'}.

**Region: ${REG[reg]}.**

| BE | BC | Region |
|---|---|---|
| on | off | forward active (the amplifier region) |
| on | on | saturation ($|V_{CE}|\\approx0.2\\,\\text{V}$) |
| off | off | cutoff |
| off | on | reverse active |

${n ? 'NPN quick check for active: $V_C \\ge V_B$ (collector at or above the base).' : 'PNP quick check for active: $V_C \\le V_B$ (collector at or below the base).'} Here $V_C = ${f(V.C)}\\,\\text{V}$, $V_B = ${f(V.B)}\\,\\text{V}$.`,
    };
  };

  // ================================================================ DC bias
  // NPN: base from a Thevenin source (V_BB, R_B) or a divider; R_C to V_CC; R_E to ground or to -V_EE.
  // PNP: R_E to V_CC on top, base from (V_BB, R_B), R_C to ground.
  function solveNpn(p) {
    const { VCC, VBB, RB, RC, RE, VEE, beta } = p;
    const drive = VBB + VEE - 0.7;
    if (drive <= 0) return { reg: 2, IC: 0, IB: 0, VC: VCC, VB: VBB, VE: -VEE };
    let IB = drive / (RB + (beta + 1) * RE), IC = beta * IB;
    let VE = -VEE + (IB + IC) * RE, VB = VE + 0.7, VC = VCC - IC * RC;
    if (VC >= VB) return { reg: 0, IB, IC, VE, VB, VC };
    // saturation: V_CE = 0.2
    const a11 = RB + RE, a12 = RE, b1 = drive, a21 = RE, a22 = RC + RE, b2 = VCC + VEE - 0.2;
    const det = a11 * a22 - a12 * a21;
    IB = (b1 * a22 - a12 * b2) / det; IC = (a11 * b2 - a21 * b1) / det;
    VE = -VEE + (IB + IC) * RE; VB = VE + 0.7; VC = VE + 0.2;
    return { reg: 1, IB, IC, VE, VB, VC };
  }
  function solvePnp(p) {
    const { VCC, VBB, RB, RC, RE, beta } = p;
    const drive = VCC - 0.7 - VBB;
    if (drive <= 0) return { reg: 2, IC: 0, IB: 0, VC: 0, VB: VBB, VE: VCC };
    let IB = drive / (RB + (beta + 1) * RE), IC = beta * IB;
    let VE = VCC - (IB + IC) * RE, VB = VE - 0.7, VC = IC * RC;
    if (VC <= VB) return { reg: 0, IB, IC, VE, VB, VC };
    const a11 = RB + RE, a12 = RE, b1 = drive, a21 = RE, a22 = RE + RC, b2 = VCC - 0.2;
    const det = a11 * a22 - a12 * a21;
    IB = (b1 * a22 - a12 * b2) / det; IC = (a11 * b2 - a21 * b1) / det;
    VE = VCC - (IB + IC) * RE; VB = VE - 0.7; VC = VE - 0.2;
    return { reg: 1, IB, IC, VE, VB, VC };
  }
  function dcCircuit(want) {
    for (let t = 0; t < 400; t++) {
      const kind = pick(['rb', 'rb', 'div', 'pnp', 'pnp', 'neg']);
      const beta = pick([50, 100, 100, 100, 200]);
      const VCC = pick([5, 10, 10, 12]);
      const RE = pick([0, 0.5, 1, 1, 2]) * 1e3;
      const RC = pick([1, 2, 3, 4, 5, 8, 10]) * 1e3;
      const p = { kind, beta, VCC, RE, RC, VEE: 0 };
      if (kind === 'rb') { p.VBB = pick([1.5, 2, 2.7, 3, 4]); p.RB = pick([10, 20, 50, 100, 200]) * 1e3; }
      else if (kind === 'div') { p.R1 = pick([20, 30, 40, 50, 80, 100]) * 1e3; p.R2 = pick([10, 20, 30]) * 1e3; p.VBB = VCC * p.R2 / (p.R1 + p.R2); p.RB = par(p.R1, p.R2); }
      else if (kind === 'neg') { p.VBB = 0; p.RB = pick([10, 20, 50]) * 1e3; p.VEE = pick([3, 5]); if (!p.RE) p.RE = 1e3; }
      else { p.VBB = VCC - pick([1.5, 2, 2.7, 3]); p.RB = pick([10, 20, 50, 100]) * 1e3; }
      const s = kind === 'pnp' ? solvePnp(p) : solveNpn(p);
      if (s.reg !== want) continue;
      if (s.reg !== 2 && (s.IC < 0.05e-3 || s.IC > 10e-3)) continue;
      if (s.reg === 1 && s.IC >= beta * s.IB) continue;       // must really be saturated
      return { p, s };
    }
    return null;
  }
  function dcFig(p) {
    const e = [];
    const kO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
    const rail = (pt) => ['rail', pt, { n: `${p.VCC}\\,\\text{V}` }];
    if (p.kind === 'pnp') {
      e.push(['pnp', [2, 1], {}]);
      if (p.RE) e.push(rail([2, -1.2]), ['R', [2, -1.2], [2, 0], { n: 'R_E', s: kO(p.RE) }]); else e.push(['w', [2, 0], [2, -0.4]], rail([2, -0.4]));
      e.push(['R', [2, 2], [2, 3.2], { n: 'R_C', s: kO(p.RC) }], ['gnd', [2, 3.2]], ['txt', [1.82, 2.18], '$V_C$', { a: 'r' }]);
    } else {
      e.push(['npn', [2, 1], {}], rail([2, -1.2]), ['R', [2, -1.2], [2, 0], { n: 'R_C', s: kO(p.RC) }], ['txt', [2.2, 0.05], '$V_C$', { a: 'l' }]);
      if (p.RE) {
        e.push(['R', [2, 2], [2, 3.2], { n: 'R_E', s: kO(p.RE) }]);
        e.push(p.VEE ? ['term', [2, 3.2], { n: `-${p.VEE}\\,\\text{V}`, side: 'r' }] : ['gnd', [2, 3.2]]);
      } else e.push(p.VEE ? ['w', [2, 2], [2, 2.4]] : ['gnd', [2, 2]], ...(p.VEE ? [['term', [2, 2.4], { n: `-${p.VEE}\\,\\text{V}`, side: 'r' }]] : []));
    }
    if (p.kind === 'div') {
      e.push(['rail', [0.6, -1.2], { n: `${p.VCC}\\,\\text{V}` }], ['R', [0.6, -1.2], [0.6, 1], { n: 'R_1', s: kO(p.R1), side: 'l' }],
        ['R', [0.6, 1], [0.6, 2.4], { n: 'R_2', s: kO(p.R2), side: 'l' }], ['gnd', [0.6, 2.4]], ['w', [0.6, 1], [1, 1]]);
    } else if (p.kind === 'neg') {
      e.push(['R', [0, 1], [1, 1], { n: 'R_B', s: kO(p.RB) }], ['w', [0, 1], [0, 1.4]], ['gnd', [0, 1.4]]);
    } else {
      e.push(['R', [-0.2, 1], [1, 1], { n: 'R_B', s: kO(p.RB) }], ['V', [-0.2, 1], [-0.2, 2.2], { n: 'V_{BB}', s: VV(p.VBB), side: 'l' }], ['gnd', [-0.2, 2.2]]);
    }
    return e;
  }
  function dcSolText(p, s) {
    const n = p.kind !== 'pnp';
    const B = p.beta, b1 = B + 1;
    const lines = [];
    if (p.kind === 'div') lines.push(`**Step 0: replace the divider by its Thévenin twin.** $V_{BB} = ${p.VCC}\\cdot\\dfrac{R_2}{R_1 + R_2} = ${VV(p.VBB)}$, $R_B = R_1\\parallel R_2 = ${KO(p.RB)}$.`);
    if (s.reg === 2) {
      lines.push(`**Step 1: is the base–emitter junction even on?** The base drive ${n ? `$V_{BB}${p.VEE ? ` + ${p.VEE}` : ''}$` : `$V_{CC} - V_{BB}$`} is not more than $0.7\\,\\text{V}$, so no base current can flow: **cutoff**, $I_C = 0$, and with no drop on $R_C$, $V_C = ${n ? `V_{CC} = ${p.VCC}` : '0'}\\,\\text{V}$.`);
      return lines.join('\n\n');
    }
    const drive = n ? `${f(p.VBB)}${p.VEE ? ` + ${p.VEE}` : ''} - 0.7` : `${p.VCC} - 0.7 - ${f(p.VBB)}`;
    const IBa = (n ? p.VBB + p.VEE - 0.7 : p.VCC - 0.7 - p.VBB) / (p.RB + b1 * p.RE);
    const ICa = B * IBa;
    lines.push(`**Step 1: assume forward active** ($|V_{BE}| = 0.7\\,\\text{V}$, $I_C = \\beta I_B$, $I_E = (\\beta + 1)I_B$). KVL ${n ? 'from the base source, through $R_B$, the junction and $R_E$' : 'from $V_{CC}$, down through $R_E$, the junction and $R_B$'}:
$$I_B = \\frac{${drive}}{R_B + (\\beta + 1)R_E} = \\frac{${f(n ? p.VBB + p.VEE - 0.7 : p.VCC - 0.7 - p.VBB)}\\,\\text{V}}{${KO(p.RB)} + ${b1}\\times${KO(p.RE)}} = ${f(IBa * 1e6, 4)}\\,\\mu\\text{A}$$
$$I_C = \\beta I_B = ${MA(ICa)}$$`);
    const VEa = n ? -p.VEE + (b1 * IBa) * p.RE : p.VCC - b1 * IBa * p.RE;
    const VBa = n ? VEa + 0.7 : VEa - 0.7;
    const VCa = n ? p.VCC - ICa * p.RC : ICa * p.RC;
    lines.push(`**Step 2: node voltages.** $V_E = ${VV(VEa)}$, $V_B = V_E ${n ? '+' : '-'} 0.7 = ${VV(VBa)}$, $V_C = ${n ? `V_{CC} - I_CR_C = ${p.VCC} - (${MA(ICa)})(${KO(p.RC)})` : `I_CR_C = (${MA(ICa)})(${KO(p.RC)})`} = ${VV(VCa)}$.`);
    if (s.reg === 0) {
      lines.push(`**Step 3: check.** ${n ? `$V_C = ${VV(VCa)} \\ge V_B = ${VV(VBa)}$` : `$V_C = ${VV(VCa)} \\le V_B = ${VV(VBa)}$`}: the base–collector junction is not forward biased. **Forward active** ✓. So $I_C = ${MA(s.IC)}$ and $V_C = ${VV(s.VC)}$.`);
    } else {
      lines.push(`**Step 3: check.** ${n ? `$V_C = ${VV(VCa)} < V_B = ${VV(VBa)}$` : `$V_C = ${VV(VCa)} > V_B = ${VV(VBa)}$`}: the collector has crossed the base, so the base–collector junction is forward biased. The assumption fails: **saturation**.

**Step 4: redo in saturation** with $|V_{CE}| = 0.2\\,\\text{V}$ and $I_B$, $I_C$ as two separate unknowns (now $I_C < \\beta I_B$). Two KVLs, one through the base and one through the collector:
$$I_B(R_B + R_E) + I_CR_E = ${f(n ? p.VBB + p.VEE - 0.7 : p.VCC - 0.7 - p.VBB)}\\,\\text{V},\\qquad I_BR_E + I_C(R_C + R_E) = ${f(n ? p.VCC + p.VEE - 0.2 : p.VCC - 0.2)}\\,\\text{V}$$
which give $I_B = ${f(s.IB * 1e6, 4)}\\,\\mu\\text{A}$, $I_C = ${MA(s.IC)}$ (check: $\\beta I_B = ${MA(B * s.IB)} > I_C$ ✓), and $V_C = V_E ${n ? '+' : '-'} 0.2 = ${VV(s.VC)}$.`);
    }
    return lines.join('\n\n');
  }
  Object.assign(window.E3B, { dcFig, solveNpn, solvePnp });
  GENS.e3_bdc = (opts = {}) => {
    const want = opts.active ? 0 : pick([0, 0, 0, 0, 0, 1, 1, 2]);
    const c = dcCircuit(want) || dcCircuit(0);
    const { p, s } = c;
    const n = p.kind !== 'pnp';
    const parts = [
      { lbl: 'Region', mc: ['Forward active', 'Saturation', 'Cutoff'], a: s.reg, fixed: true,
        why: [s.reg === 1 ? `Assuming active gives $V_C$ ${n ? 'below' : 'above'} $V_B$: the base–collector junction turns on.` : 'Is the base–emitter junction on at all?',
          `Check: with the active-region currents, $V_C$ stays ${n ? 'at or above' : 'at or below'} $V_B$, so the base–collector junction is off.`,
          'The base drive is more than $0.7\\,\\text{V}$, so the base–emitter junction conducts.'].map((w, j) => (j === s.reg ? null : w)) },
      { lbl: 'I_C', unit: 'mA', ans: s.IC * 1e3, tol: { abs: 1e-4 } },
      { lbl: 'V_C', unit: 'V', ans: s.VC, tol: { abs: 0.01 } },
    ];
    if (s.reg === 0) {
      const IBnoB = (n ? p.VBB + p.VEE - 0.7 : p.VCC - 0.7 - p.VBB) / (p.RB + p.beta * p.RE);
      if (p.RE && Math.abs(IBnoB - s.IB) > 0.02 * s.IB) parts[1].accept = [p.beta * IBnoB * 1e3];   // beta + 1 ~ beta, as the course allows
      if (p.RE) parts[1].traps = [{ v: p.beta * (n ? p.VBB + p.VEE - 0.7 : p.VCC - 0.7 - p.VBB) / (p.RB + p.RE) * 1e3, msg: 'That puts $R_E$ in series with $R_B$ as if the base current flowed through it. $R_E$ carries $(\\beta + 1)I_B$, so from the base loop it counts $(\\beta + 1)$ times: $R_B + (\\beta + 1)R_E$.' }]
        .filter((t) => Math.abs(t.v - s.IC * 1e3) > 0.03 * s.IC * 1e3);
    }
    return {
      fig: dcFig(p),
      q: `$\\beta = ${p.beta}$, $|V_{BE}| = 0.7\\,\\text{V}$ when on, $|V_{CE,sat}| = 0.2\\,\\text{V}$. Find the region, $I_C$ and $V_C$. (Assume forward active, compute, check; if the check fails, redo in saturation.)`,
      parts,
      hints: [
        n ? 'Base loop: $V_{BB} - I_BR_B - 0.7 - (\\beta + 1)I_BR_E = 0$ (use the bottom supply instead of 0 if the emitter returns to a negative rail).' : 'PNP: start at $V_{CC}$, go down through $R_E$ ($(\\beta + 1)I_B$ flows there), drop 0.7 V across the junction, then through $R_B$ to $V_{BB}$.',
        n ? 'Active check for an NPN: $V_C \\ge V_B$.' : 'Active check for a PNP: $V_C \\le V_B$.',
      ],
      sol: dcSolText(p, s),
    };
  };

  // ================================================================ g_m, r_pi, r_o from the bias
  GENS.e3_bgm = () => {
    const beta = pick([50, 80, 100, 100, 150, 200]);
    const VA = pick([20, 50, 80, 100]);
    const mode = pick(['IC', 'IC', 'IB', 'IE', 'circ']);
    let IC, given, fig, extra = '';
    if (mode === 'circ') {
      const c = dcCircuit(0); const { p, s } = c; IC = s.IC;
      fig = dcFig(p);
      given = `The transistor below ($\\beta = ${p.beta}$, $V_A = ${VA}\\,\\text{V}$) is forward active. Find $I_C$ first (use the exact $\\beta + 1$).`;
      extra = `\n\n**Step 0: the bias.** ${dcSolText(p, s).replace(/\*\*Step (\d)/g, '**$1')}`;
      return finish(p.beta, VA, IC, given, fig, extra, true);
    }
    IC = pick([0.1, 0.2, 0.25, 0.5, 1, 1.5, 2, 4]) * 1e-3;
    if (mode === 'IC') given = `A BJT with $\\beta = ${beta}$ and Early voltage $V_A = ${VA}\\,\\text{V}$ is biased at $I_C = ${MA(IC)}$.`;
    if (mode === 'IB') given = `A BJT with $\\beta = ${beta}$ and $V_A = ${VA}\\,\\text{V}$ has a DC base current $I_B = ${f(IC / beta * 1e6, 4)}\\,\\mu\\text{A}$ (forward active).`;
    if (mode === 'IE') { given = `A BJT with $\\beta = ${beta}$ and $V_A = ${VA}\\,\\text{V}$ carries an emitter current $I_E = ${MA(IC * (beta + 1) / beta)}$ (forward active).`; }
    return finish(beta, VA, IC, given, null, mode === 'IB' ? `\n\n$I_C = \\beta I_B = ${MA(IC)}$.` : mode === 'IE' ? `\n\n$I_C = \\alpha I_E = \\dfrac{\\beta}{\\beta + 1}I_E = ${MA(IC)}$ (or $\\approx I_E$; both accepted).` : '', false);

    function finish(B, Va, Ic, txt, fg, pre, circ) {
      const gm = Ic / VT, rpi = B / gm, ro = Va / Ic;
      const parts = [
        { lbl: 'g_m', unit: 'mS', ans: gm * 1e3, traps: [{ v: 2 * Ic / 0.2 * 1e3, msg: 'That is the MOSFET formula $2I_D/V_{ov}$. A BJT uses $g_m = I_C/V_T$ with $V_T = 25\\,\\text{mV}$.' }] },
        { lbl: 'r_\\pi', unit: 'kΩ', ans: rpi / 1e3, traps: [{ v: 1 / gm / 1e3, msg: 'That is $1/g_m$ (what you see looking into the emitter). Looking into the base is $\\beta$ times bigger: $r_\\pi = \\beta/g_m$.' }] },
        { lbl: 'r_o', unit: 'kΩ', ans: ro / 1e3 },
      ];
      if (mode === 'IE' && !circ) {
        const icA = Ic * (B + 1) / B;
        parts[0].accept = [icA / VT * 1e3]; parts[1].accept = [B * VT / icA / 1e3]; parts[2].accept = [Va / icA / 1e3];
      }
      if (circ && fg) {
        parts.unshift({ lbl: 'I_C', unit: 'mA', ans: Ic * 1e3 });
      }
      const mosGm = 2 * Ic / 0.2;
      return {
        fig: fg || undefined,
        q: `${txt} Find the small-signal parameters ($V_T = 25\\,\\text{mV}$).`,
        parts,
        hints: ['$g_m = I_C/V_T$. At $1\\,\\text{mA}$ that is $40\\,\\text{mS}$ ($1/g_m = 25\\,\\Omega$): scale from there.', '$r_\\pi = \\beta/g_m$, $r_o = V_A/I_C$.'],
        sol: `${pre ? pre.trim() + '\n\n' : ''}$$g_m = \\frac{I_C}{V_T} = \\frac{${MA(Ic)}}{25\\,\\text{mV}} = ${MS(gm)}\\qquad\\Big(\\frac1{g_m} = ${resTeX(1 / gm)}\\Big)$$
$$r_\\pi = \\frac{\\beta}{g_m} = \\frac{${B}}{${MS(gm)}} = ${KO(rpi)}\\qquad r_o = \\frac{V_A}{I_C} = \\frac{${Va}\\,\\text{V}}{${MA(Ic)}} = ${KO(ro)}$$

Sanity: $g_mr_\\pi = \\beta = ${B}$ ✓, and $g_mr_o = V_A/V_T = ${f(Va / VT)}$ (the BJT's intrinsic gain). A MOSFET at the same current with $V_{ov} = 0.2\\,\\text{V}$ would have $g_m = 2I_D/V_{ov} = ${MS(mosGm)}$: the BJT's $g_m$ is $V_{ov}/(2V_T) = 4$ times bigger here.`,
      };
    }
  };

  // ================================================================ which terminal, and what do you see (BJT)
  const LOOK = [
    ['$r_\\pi$', 'That is the base with the emitter straight on its rail.'],
    ['$r_\\pi + (\\beta + 1)R_E$', 'That is the base with $R_E$ between the emitter and its rail.'],
    ['$\\dfrac{r_\\pi}{\\beta + 1}\\approx\\dfrac{1}{g_m}$', 'That is the emitter with the base held (or a diode-connected BJT).'],
    ['$\\dfrac{r_\\pi + R_B}{\\beta + 1}$', 'That is the emitter with $R_B$ in the base (or a BJT with $R_B$ from collector to base).'],
    ['$r_o$', 'That is the collector with the base held and the emitter on its rail.'],
    ['$r_o\\big[1 + g_m(R_E\\parallel r_\\pi)\\big] + R_E\\parallel r_\\pi$', 'That is the collector with the base held and $R_E$ in the emitter (degeneration).'],
    ['$\\infty$', 'Nothing in a BJT looks infinite (with $r_o$ finite). $\\infty$ is a MOSFET gate: a base draws current.'],
  ];
  const BCASE = {
    base: { term: 'Base', opt: 0, name: 'the base, emitter on its rail',
      rule: 'The test voltage sits right across $r_\\pi$ (the emitter is grounded), so $i_t = v_t/r_\\pi$. The $g_mv_\\pi$ current flows collector to emitter, between two grounded nodes: none of it goes through the test source.',
      r: (q) => q.rpi, acc: () => [], traps: (q) => [{ v: 1 / q.gm, msg: 'That is $1/g_m$, the emitter. Looking into the base you see $r_\\pi = \\beta/g_m$, $\\beta$ times bigger.' }] },
    baseRE: { term: 'Base', opt: 1, name: 'the base, with $R_E$ under the emitter',
      rule: '$i_t$ goes through $r_\\pi$, but $(\\beta + 1)i_t$ comes out of the emitter and flows through $R_E$. So $v_t = i_tr_\\pi + (\\beta + 1)i_tR_E$: **$R_E$ looks $(\\beta + 1)$ times bigger from the base.**',
      r: (q, R) => q.rpi + (q.beta + 1) * par(R, q.ro), acc: (q, R) => [q.rpi + (q.beta + 1) * R, q.rpi + q.beta * R],
      traps: (q, R) => [{ v: q.rpi + R, msg: 'You added $R_E$ once. The emitter carries $(\\beta + 1)$ times the base current, so $R_E$ counts $(\\beta + 1)$ times.' }, { v: (q.beta + 1) * R, msg: 'Close, but $r_\\pi$ is still in series in front of it: $r_\\pi + (\\beta + 1)R_E$.' }] },
    emitter: { term: 'Emitter', opt: 2, name: 'the emitter, base held, collector on its rail',
      rule: 'Push the emitter by $v_t$ with the base held: $v_\\pi = -v_t$, so the base current changes by $v_t/r_\\pi$ and the collector current by $g_mv_t$. Both pass through the emitter: $i_t = (\\beta + 1)v_t/r_\\pi$. **The emitter is a low-impedance node**, about $1/g_m$.',
      r: (q) => par(q.ro, q.rpi / (q.beta + 1)), acc: (q) => [1 / q.gm, q.rpi / (q.beta + 1)], traps: (q) => [{ v: q.rpi, msg: 'That is the base. From the emitter, $r_\\pi$ is divided by $\\beta + 1$.' }] },
    emitterRB: { term: 'Emitter', opt: 3, name: 'the emitter, with $R_B$ in the base',
      rule: 'Same as the plain emitter, but the base current now flows through $R_B$ as well as $r_\\pi$. Everything in the base, $R_B + r_\\pi$, looks $(\\beta + 1)$ times **smaller** from the emitter.',
      r: (q, R) => par(q.ro, (q.rpi + R) / (q.beta + 1)), acc: (q, R) => [(q.rpi + R) / (q.beta + 1), 1 / q.gm + R / (q.beta + 1)],
      traps: (q, R) => [{ v: 1 / q.gm, msg: 'That ignores $R_B$. With a BJT the base current is real, so $R_B$ matters: it shows up divided by $\\beta + 1$.' }, { v: q.rpi + R, msg: 'That is what the **base** loop sees. From the emitter, divide by $\\beta + 1$.' }, { v: R / (q.beta + 1) + q.rpi, msg: 'Divide $r_\\pi$ by $\\beta + 1$ too: both sit in the base.' }] },
    collector: { term: 'Collector', opt: 4, name: 'the collector, base held, emitter on its rail',
      rule: 'Base and emitter are both at incremental ground, so $v_\\pi = 0$ and $g_mv_\\pi$ is dead. Only $r_o$ is left. (With $r_o\\to\\infty$, as in Lecture 24: $\\infty$.)',
      r: (q) => q.ro, acc: () => [], traps: (q) => [{ v: q.rpi, msg: 'That is the base.' }] },
    collectorRE: { term: 'Collector', opt: 5, name: 'the collector, base held, with $R_E$ under the emitter',
      rule: 'The test current makes a voltage on $R_E\\parallel r_\\pi$ at the emitter; with the base held that is $v_\\pi = -i_t(R_E\\parallel r_\\pi)$, which turns the transistor down and fights the current. Degeneration multiplies by about $1 + g_m(R_E\\parallel r_\\pi)$. Note $R_E\\parallel r_\\pi$, not $R_E$: the base current leaks the boost away, so it can never exceed about $\\beta r_o$.',
      r: (q, R) => { const x = par(R, q.rpi); return q.ro * (1 + q.gm * x) + x; }, acc: (q, R) => [q.ro * (1 + q.gm * par(R, q.rpi))],
      traps: (q, R) => [{ v: q.ro, msg: 'That ignores $R_E$. Degeneration multiplies $r_o$.' }, { v: q.ro * (1 + q.gm * R) + R, msg: 'That is the MOSFET formula with $R_E$. A BJT\'s base current flows in $r_\\pi$, which sits in parallel with $R_E$: use $R_E\\parallel r_\\pi$.' }] },
    diode: { term: 'Collector', opt: 2, name: 'a diode-connected BJT (base tied to collector)',
      rule: 'The base is tied to the collector, so $v_\\pi = v_t$: $r_\\pi$ draws $v_t/r_\\pi$ and the collector draws $g_mv_t$. Total $(\\beta + 1)v_t/r_\\pi$: $R = \\dfrac{r_\\pi}{\\beta + 1}\\parallel r_o\\approx\\dfrac1{g_m}$.',
      r: (q) => 1 / (q.gm + 1 / q.rpi + 1 / q.ro), acc: (q) => [1 / q.gm, q.rpi / (q.beta + 1)], traps: (q) => [{ v: q.rpi, msg: 'Tying base to collector also turns on $g_mv_\\pi$: the device carries $\\beta$ times more current than $r_\\pi$ alone.' }] },
    diodeRB: { term: 'Collector', opt: 3, name: 'a BJT with $R_B$ from collector to base',
      rule: 'The test voltage drives $R_B + r_\\pi$ in series; the base current $i_b = v_t/(R_B + r_\\pi)$ comes with $\\beta i_b$ into the collector. $i_t = (\\beta + 1)i_b$: $R = \\dfrac{R_B + r_\\pi}{\\beta + 1}$ (Lecture 24 summary).',
      r: (q, R) => par(q.ro, (q.rpi + R) / (q.beta + 1)), acc: (q, R) => [(q.rpi + R) / (q.beta + 1)], traps: (q, R) => [{ v: q.rpi + R, msg: 'Only the base current flows through $R_B + r_\\pi$; the collector adds $\\beta$ times more. Divide by $\\beta + 1$.' }] },
  };
  T.BCASE = BCASE; T.solveNpn = solveNpn; T.solvePnp = solvePnp;
  // figure: device at [1,1]. NPN: C top [1,0], E bottom [1,2]. PNP: E top, C bottom. Base at [0,1] or [2,1] (flip).
  function lookFig(type, kase, flip) {
    const n = type === 'npn';
    const gx = flip ? 2 : 0, gd = flip ? 1 : -1;               // gd: direction away from the device
    const e = [[type, [1, 1], { n: 'Q_1', flip, dc: kase === 'diode' }]];
    const lookT = (y) => { const yy = y === 0 ? -0.5 : 2.5; e.push(['w', [1, y], [1, yy], [flip ? -0.4 : 2.4, yy]], ['term', [flip ? -0.4 : 2.4, yy], { n: flip ? 'R_X\\rightarrow' : '\\leftarrow R_X', side: flip ? 'l' : 'r' }]); };
    const topRail = (R) => { if (R) e.push(['R', [1, -1.2], [1, 0], { n: R, side: flip ? 'l' : 'r' }], ['rail', [1, -1.2]]); else e.push(['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]]); };
    const botGnd = (R) => { if (R) e.push(['R', [1, 2], [1, 3.2], { n: R, side: flip ? 'l' : 'r' }], ['gnd', [1, 3.2]]); else e.push(['gnd', [1, 2]]); };
    const eTop = !n;                                            // emitter on top for a PNP
    const emitterSide = (R) => (eTop ? topRail(R) : botGnd(R));
    const collectorSide = () => (eTop ? botGnd() : topRail());
    const baseHeld = (R) => { if (R) e.push(['R', [gx, 1], [gx + gd * 1.2, 1], { n: R }], ['acg', [gx + gd * 1.2, 1]]); else e.push(['acg', [gx, 1]]); };
    if (kase === 'base' || kase === 'baseRE') {
      const tx = gx + gd * 0.9;
      e.push(['w', [gx, 1], [tx, 1]], ['term', [tx, 1], { n: flip ? '\\leftarrow R_X' : 'R_X\\rightarrow', side: flip ? 'r' : 'l' }]);
      emitterSide(kase === 'baseRE' ? 'R_E' : null); collectorSide();
      return e;
    }
    if (kase === 'emitter' || kase === 'emitterRB') {
      baseHeld(kase === 'emitterRB' ? 'R_B' : null); collectorSide(); lookT(eTop ? 0 : 2);
      return e;
    }
    if (kase === 'collector' || kase === 'collectorRE') {
      baseHeld(null); emitterSide(kase === 'collectorRE' ? 'R_E' : null); lookT(eTop ? 2 : 0);
      return e;
    }
    if (kase === 'diode') { emitterSide(null); lookT(eTop ? 2 : 0); return e; }
    // diodeRB: R_B from the collector lead to the base
    const cy = eTop ? 2 : 0, yy = eTop ? 2.5 : -0.5;
    e.push(['R', [gx, 1], [gx, yy], { n: 'R_B', side: flip ? 'r' : 'l' }], ['w', [gx, yy], [1, yy], [1, cy]]);
    e.push(['w', [1, yy], [flip ? -0.4 : 2.4, yy]], ['term', [flip ? -0.4 : 2.4, yy], { n: flip ? 'R_X\\rightarrow' : '\\leftarrow R_X', side: flip ? 'l' : 'r' }]);
    emitterSide(null);
    return e;
  }
  GENS.e3_blook = () => {
    const type = pick(['npn', 'npn', 'pnp']);
    const kase = pick(['base', 'baseRE', 'baseRE', 'emitter', 'emitterRB', 'emitterRB', 'collector', 'collectorRE', 'collectorRE', 'diode', 'diodeRB']);
    const flip = pick([false, true]);
    const Cs = BCASE[kase];
    const q = randQ();
    const R = /RB/.test(kase) ? pick([1, 2, 5, 10, 20]) * 1e3 : pick([100, 200, 500, 1000, 2000]);
    const hasR = /RE|RB/.test(kase);
    const Rname = /RB/.test(kase) ? 'R_B' : 'R_E';
    const n = type === 'npn';
    const T = n ? 'NPN' : 'PNP';
    const eAns = n ? 1 : 0;
    const termIdx = { Base: 0, Collector: 1, Emitter: 2 }[Cs.term];
    const exact = Cs.r(q, R);
    const parts = [
      { lbl: `1. Which lead of $Q_1$ (${T}) is its **emitter**?`, mc: ['The top one', 'The bottom one', 'The one on the side (at the bar)'], a: eAns, fixed: true,
        why: [n ? 'The arrow is on the emitter. An NPN arrow sits on the **bottom** lead and points out; the top is the collector.' : null,
          n ? null : 'The arrow is on the emitter. A PNP arrow sits on the **top** lead (toward $V_{CC}$) and points in.', 'The side lead, at the bar, is always the base.'] },
      { lbl: '2. The test node ($R_X$) touches which terminal?', mc: ['Base', 'Collector', 'Emitter'], a: termIdx, fixed: true,
        why: [0, 1, 2].map((j) => (j === termIdx ? null : kase === 'diode' && j === 0 ? 'The base is tied to that node too, but the current goes in at the collector lead: call it a diode-connected BJT, looking into the collector.'
          : kase === 'diodeRB' && j === 0 ? 'The node reaches the base only through $R_B$; the lead it lands on directly is the collector.'
            : `Follow the wire from $R_X$ to the lead it lands on. ${n ? 'NPN: collector on top, emitter (arrow) at the bottom.' : 'PNP: emitter (arrow) on top, collector at the bottom.'}`)) },
      { lbl: '3. What resistance do you see?', mc: LOOK.map((o) => o[0]), a: Cs.opt, why: LOOK.map((o, j) => (j === Cs.opt ? null : o[1])) },
      resAns('R_X', exact, Cs.acc(q, R), Cs.traps(q, R)),
    ];
    const where = n ? 'NPN: the arrow is on the **bottom** lead, pointing out. Emitter at the bottom, collector on top.' : 'PNP: the arrow is on the **top** lead, pointing in. Emitter on top (toward $V_{CC}$), collector at the bottom.';
    const nums = `${qText(q)}${hasR ? `, $${Rname} = ${resTeX(R)}$` : ''}`;
    return {
      fig: lookFig(type, kase, flip),
      q: `${nums}. Triangles are incremental grounds (a held base). Answer in order: where is the emitter, what does the test node touch, what does it see? Then the number (the $\\beta\\gg1$, $r_o\\to\\infty$ forms are accepted too).`,
      parts,
      hints: ['Find the arrow: it is on the emitter. NPN arrow out (emitter at the bottom); PNP arrow in (emitter on top).',
        'Base: $r_\\pi$, plus $(\\beta + 1)\\times$ whatever is under the emitter. Emitter: everything in the base divided by $\\beta + 1$. Collector: $r_o$, boosted by degeneration.'],
      sol: `**Step 1: the emitter.** ${where}

**Step 2: the test node.** Follow the wire from $R_X$: this is ${Cs.name}.

**Step 3: the resistance.** ${Cs.rule}${!n ? '\n\nPNP or NPN makes no difference to the small-signal answer: the PNP picture is the NPN one upside down, with $V_{CC}$ as incremental ground.' : ''}

**Step 4: numbers.** ${nums}: $R_X = ${resTeX(exact)}$.`,
    };
  };

  // ================================================================ R_UP || R_DN with BJT and MOS blocks
  const DOWN = {
    qC: { dev: 'Q1', fig: () => [['npn', [1, 1], { n: 'Q_1' }], ['acg', [0, 1]], ['gnd', [1, 2]]],
      r: (p) => p.q1.ro, ap: (p) => p.q1.ro, say: 'an NPN collector, base held, emitter grounded: $R_{DN} = r_{o1}$' },
    qCRE: { dev: 'Q1', fig: (p) => [['npn', [1, 1], { n: 'Q_1' }], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_1', s: resTeX(p.R1) }], ['gnd', [1, 3.2]]],
      r: (p) => { const x = par(p.R1, p.q1.rpi); return p.q1.ro * (1 + p.q1.gm * x) + x; }, ap: (p) => p.q1.ro * (1 + p.q1.gm * par(p.R1, p.q1.rpi)),
      say: 'an NPN collector with $R_1$ in the emitter: $R_{DN} = r_{o1}[1 + g_{m1}(R_1\\parallel r_{\\pi1})] + R_1\\parallel r_{\\pi1}$' },
    qD: { dev: 'Q1', fig: () => [['npn', [1, 1], { n: 'Q_1', dc: true }], ['gnd', [1, 2]]],
      r: (p) => 1 / (p.q1.gm + 1 / p.q1.rpi + 1 / p.q1.ro), ap: (p) => 1 / p.q1.gm, say: 'a diode-connected NPN: $R_{DN}\\approx\\frac1{g_{m1}}$' },
    qB: { dev: 'Q1', fig: (p) => [['w', [1, 0], [1, 1], [0.2, 1]], ['npn', [-0.8, 1], { n: 'Q_1', flip: true }], ['w', [-0.8, 0], [-0.8, -0.3]], ['rail', [-0.8, -0.3]],
      ['R', [-0.8, 2], [-0.8, 3.2], { n: 'R_1', s: resTeX(p.R1), side: 'l' }], ['gnd', [-0.8, 3.2]]],
      r: (p) => p.q1.rpi + (p.q1.beta + 1) * par(p.R1, p.q1.ro), ap: (p) => p.q1.rpi + (p.q1.beta + 1) * p.R1,
      say: 'the **base** of $Q_1$, with $R_1$ under its emitter: $R_{DN} = r_{\\pi1} + (\\beta_1 + 1)R_1$ (a base is not a gate: it draws current)' },
    nI: { dev: 'M1', fig: () => [['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['gnd', [1, 2]]], r: (p) => p.m1.r, ap: (p) => p.m1.r, say: 'an NMOS drain, gate held: $R_{DN} = r_{ds1}$' },
    nD: { dev: 'M1', fig: () => [['nmos', [1, 1], { n: 'M_1', dc: true }], ['gnd', [1, 2]]], r: (p) => 1 / (p.m1.g + 1 / p.m1.r), ap: (p) => 1 / p.m1.g, say: 'a diode-connected NMOS: $R_{DN}\\approx\\frac1{g_{m1}}$' },
  };
  const UP = {
    R: { fig: (p) => [['R', [1, -1.4], [1, 0], { n: 'R_2', s: resTeX(p.R2) }], ['rail', [1, -1.4]]], r: (p) => p.R2, ap: (p) => p.R2, say: 'a resistor to $V_{CC}$: $R_{UP} = R_2$' },
    pC: { dev: 'Q2', fig: () => [['pnp', [1, -1], { n: 'Q_2' }], ['acg', [0, -1]], ['rail', [1, -2]]], r: (p) => p.q2.ro, ap: (p) => p.q2.ro, say: 'a PNP collector, base held, emitter on $V_{CC}$: $R_{UP} = r_{o2}$' },
    pCRE: { dev: 'Q2', fig: (p) => [['pnp', [1, -1], { n: 'Q_2' }], ['acg', [0, -1]], ['R', [1, -3.2], [1, -2], { n: 'R_2', s: resTeX(p.R2) }], ['rail', [1, -3.2]]],
      r: (p) => { const x = par(p.R2, p.q2.rpi); return p.q2.ro * (1 + p.q2.gm * x) + x; }, ap: (p) => p.q2.ro * (1 + p.q2.gm * par(p.R2, p.q2.rpi)),
      say: 'a PNP collector with $R_2$ in its emitter: $R_{UP} = r_{o2}[1 + g_{m2}(R_2\\parallel r_{\\pi2})] + R_2\\parallel r_{\\pi2}$' },
    pD: { dev: 'Q2', fig: () => [['pnp', [1, -1], { n: 'Q_2', dc: true }], ['rail', [1, -2]]], r: (p) => 1 / (p.q2.gm + 1 / p.q2.rpi + 1 / p.q2.ro), ap: (p) => 1 / p.q2.gm, say: 'a diode-connected PNP: $R_{UP}\\approx\\frac1{g_{m2}}$' },
    qE: { dev: 'Q2', fig: () => [['npn', [1, -1], { n: 'Q_2' }], ['acg', [0, -1]], ['rail', [1, -2]]], r: (p) => par(p.q2.ro, p.q2.rpi / (p.q2.beta + 1)), ap: (p) => 1 / p.q2.gm,
      say: 'the **emitter** of an NPN, base held, collector on $V_{CC}$: $R_{UP} = \\frac{r_{\\pi2}}{\\beta_2 + 1}\\approx\\frac1{g_{m2}}$' },
    qERB: { dev: 'Q2', fig: (p) => [['npn', [1, -1], { n: 'Q_2' }], ['R', [-1.2, -1], [0, -1], { n: 'R_2', s: resTeX(p.R2) }], ['acg', [-1.2, -1]], ['rail', [1, -2]]],
      r: (p) => par(p.q2.ro, (p.q2.rpi + p.R2) / (p.q2.beta + 1)), ap: (p) => (p.q2.rpi + p.R2) / (p.q2.beta + 1),
      say: 'the emitter of an NPN with $R_2$ in its base: $R_{UP} = \\frac{r_{\\pi2} + R_2}{\\beta_2 + 1}$' },
    mP: { dev: 'M2', fig: () => [['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]], ['rail', [1, -2]]], r: (p) => p.m2.r, ap: (p) => p.m2.r, say: 'a PMOS drain, gate held: $R_{UP} = r_{ds2}$' },
  };
  T.DOWN = DOWN; T.UP = UP;
  GENS.e3_bupdn = () => {
    let dk, uk;
    do { dk = pick(Object.keys(DOWN)); uk = pick(Object.keys(UP)); } while (!/^q/.test(dk) && !/^(q|p)/.test(uk));   // at least one BJT
    const p = { q1: randQ(), q2: randQ(), m1: { g: pick([1, 2, 4]) * 1e-3, r: pick([50, 100, 200]) * 1e3 }, m2: { g: pick([1, 2, 4]) * 1e-3, r: pick([50, 100, 200]) * 1e3 },
      R1: pick([200, 500, 1000, 2000]), R2: pick([1, 2, 5, 10]) * 1e3 };
    const D = DOWN[dk], Up = UP[uk];
    const rd = D.r(p), ru = Up.r(p), req = par(rd, ru), ap = par(D.ap(p), Up.ap(p));
    const used = [D.dev, Up.dev];
    const devs = [used.includes('Q1') ? qText(p.q1, '$Q_1$') : '', used.includes('M1') ? `$M_1$: $g_m = ${MS(p.m1.g)}$, $r_{ds} = ${KO(p.m1.r)}$` : '',
      used.includes('Q2') ? qText(p.q2, '$Q_2$') : '', used.includes('M2') ? `$M_2$: $g_m = ${MS(p.m2.g)}$, $r_{ds} = ${KO(p.m2.r)}$` : ''].filter(Boolean).join('; ');
    const bigger = rd > ru ? 'down' : 'up';
    const sideAns = Math.abs(Math.log(rd / ru)) < Math.log(1.5) ? 2 : bigger === 'down' ? 0 : 1;
    const est = 'Estimate each side first: emitters and diodes are about $1/g_m$ (tens of ohms), bases about $r_\\pi$ (kΩ) or more, collectors and drains $r_o$ or more (tens of kΩ and up).';
    return {
      fig: [...Up.fig(p), ...D.fig(p), ['w', [1, 0], [2.2, 0]], ['term', [2.2, 0], { n: '\\leftarrow R_{EQ}', side: 'r' }]],
      q: `Find the small-signal resistance $R_{EQ}$ at the node. ${devs}. Triangles are incremental grounds.`,
      parts: [
        { lbl: 'Before computing: which side is smaller (it will set $R_{EQ}$)?', mc: ['Looking up', 'Looking down', 'About equal'], a: sideAns, fixed: true,
          why: [est, est, 'They differ by more than a factor of 1.5 here.'].map((w, j) => (j === sideAns ? null : w)) },
        resAns('R_{EQ}', req, [ap], [{ v: rd, msg: 'That is $R_{DN}$ alone. Put $R_{UP}$ in parallel.' }, { v: ru, msg: 'That is $R_{UP}$ alone. Put $R_{DN}$ in parallel.' }]),
      ],
      hints: ['Split the node: everything above it is $R_{UP}$, everything below is $R_{DN}$; $R_{EQ} = R_{UP}\\parallel R_{DN}$.', 'Name each block by the terminal that touches the node, then use the table: base $r_\\pi + (\\beta + 1)R_E$, emitter $\\frac{r_\\pi + R_B}{\\beta + 1}$, collector $r_o$ (boosted by $R_E$).'],
      sol: `**Looking up:** ${Up.say}. $R_{UP} = ${resTeX(ru)}$.

**Looking down:** ${D.say}. $R_{DN} = ${resTeX(rd)}$.

$$R_{EQ} = R_{UP}\\parallel R_{DN} = ${resTeX(req)}$$
The smaller side (${rd < ru ? 'down' : 'up'}, ${resTeX(Math.min(rd, ru))}) sets the answer${Math.max(rd, ru) / Math.min(rd, ru) > 10 ? ': the other side is more than 10 times bigger and barely matters' : ''}.`,
    };
  };

  // ================================================================ the (beta + 1) elevator (r_o -> infinity)
  GENS.e3_belev = () => {
    const kase = pick(['baseRE', 'emitRB', 'darl', 'darlUp', 'pairBase']);
    const b1 = pick([50, 100, 100, 200]), b2 = pick([50, 100, 100, 200]);
    const I1 = pick([0.1, 0.25, 0.5, 1]) * 1e-3, I2 = pick([0.5, 1, 2]) * 1e-3;
    const g1 = I1 / VT, g2 = I2 / VT, rp1 = b1 / g1, rp2 = b2 / g2;
    const R = kase === 'emitRB' || kase === 'darlUp' ? pick([2, 5, 10, 20, 50]) * 1e3 : pick([100, 200, 500, 1000, 2000]);
    let fig, ans, approx, steps, traps = [];
    const lookL = (pt) => ['term', pt, { n: 'R_X\\rightarrow', side: 'l' }];
    if (kase === 'baseRE') {
      fig = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_E', s: resTeX(R) }], ['gnd', [1, 3.2]], ['w', [0, 1], [-0.7, 1]], lookL([-0.7, 1])];
      ans = rp1 + (b1 + 1) * R; approx = rp1 + b1 * R;
      steps = `Looking into the base: $r_{\\pi1}$, then **up the elevator** from the emitter: $R_E$ looks $(\\beta + 1)$ times bigger. $R_X = r_{\\pi1} + (\\beta_1 + 1)R_E = ${resTeX(rp1)} + ${b1 + 1}\\times${resTeX(R)} = ${resTeX(ans)}$.`;
      traps = [{ v: rp1 + R, msg: '$R_E$ counts $(\\beta + 1)$ times from the base.' }];
    } else if (kase === 'emitRB') {
      fig = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ['R', [-1.2, 1], [0, 1], { n: 'R_B', s: resTeX(R) }], ['acg', [-1.2, 1]], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: '\\uparrow R_X', side: 'r' }]];
      ans = (rp1 + R) / (b1 + 1); approx = 1 / g1 + R / (b1 + 1);
      steps = `Looking into the emitter: everything in the base ($R_B + r_{\\pi1}$) comes **down the elevator**, divided by $\\beta + 1$. $R_X = \\dfrac{R_B + r_{\\pi1}}{\\beta_1 + 1} = \\dfrac{${resTeX(R)} + ${resTeX(rp1)}}{${b1 + 1}} = ${resTeX(ans)}$.`;
      traps = [{ v: 1 / g1, msg: 'That is $1/g_m$ alone: $R_B$ also comes down the elevator, as $R_B/(\\beta + 1)$.' }, { v: R + rp1, msg: 'Divide by $\\beta + 1$: you are looking into the emitter.' }];
    } else if (kase === 'darl') {
      fig = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ['w', [1, 2], [1, 3]], ['npn', [2, 3], { n: 'Q_2' }], ['w', [2, 2], [2, 1.7]], ['rail', [2, 1.7]],
        ['R', [2, 4], [2, 5.2], { n: 'R_E', s: resTeX(R) }], ['gnd', [2, 5.2]], ['w', [0, 1], [-0.7, 1]], lookL([-0.7, 1])];
      const inner = rp2 + (b2 + 1) * R;
      ans = rp1 + (b1 + 1) * inner; approx = rp1 + b1 * (rp2 + b2 * R);
      steps = `Work from the bottom up. Into $Q_2$'s base: $R_2 = r_{\\pi2} + (\\beta_2 + 1)R_E = ${resTeX(inner)}$. That is what sits under $Q_1$'s emitter, so into $Q_1$'s base: $R_X = r_{\\pi1} + (\\beta_1 + 1)R_2 = ${resTeX(ans)}$. Two floors up the elevator: $R_E$ is multiplied by about $\\beta_1\\beta_2$.`;
      traps = [{ v: rp1 + rp2 + (b1 + b2 + 2) * R, msg: 'The multipliers compound: $Q_1$ multiplies everything under its emitter, including $Q_2$\'s $(\\beta_2 + 1)R_E$.' }];
    } else if (kase === 'darlUp') {
      fig = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ['R', [-1.2, 1], [0, 1], { n: 'R_B', s: resTeX(R) }], ['acg', [-1.2, 1]], ['w', [1, 2], [1, 3]],
        ['npn', [2, 3], { n: 'Q_2' }], ['w', [2, 2], [2, 1.7]], ['rail', [2, 1.7]], ['w', [2, 4], [2, 4.4]], ['term', [2, 4.4], { n: '\\uparrow R_X', side: 'r' }]];
      const mid = (R + rp1) / (b1 + 1);
      ans = (mid + rp2) / (b2 + 1); approx = (R / b1 + 1 / g1 + rp2) / b2;
      steps = `Work from the top down. Out of $Q_1$'s emitter: $\\dfrac{R_B + r_{\\pi1}}{\\beta_1 + 1} = ${resTeX(mid)}$. That sits in $Q_2$'s base, in series with $r_{\\pi2}$; down one more floor: $R_X = \\dfrac{${resTeX(mid)} + r_{\\pi2}}{\\beta_2 + 1} = ${resTeX(ans)}$.`;
      traps = [{ v: mid, msg: 'That is the resistance at $Q_1$\'s emitter. $R_X$ is one more floor down, through $Q_2$.' }];
    } else {
      // base of Q1 whose emitter meets the emitter of Q2 (base held) and R_E to ground
      fig = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ['w', [1, 2], [3, 2]], ['npn', [3, 1], { n: 'Q_2', flip: true }], ['acg', [4, 1]], ['rail', [3, 0]],
        ['R', [2, 2], [2, 3.2], { n: 'R_E', s: resTeX(R) }], ['gnd', [2, 3.2]], ['w', [0, 1], [-0.7, 1]], lookL([-0.7, 1])];
      const re2 = rp2 / (b2 + 1), node = par(R, re2);
      ans = rp1 + (b1 + 1) * node; approx = rp1 + b1 * par(R, 1 / g2);
      steps = `Under $Q_1$'s emitter sit $R_E$ and $Q_2$'s emitter in parallel. $Q_2$'s emitter (base held) is $\\frac{r_{\\pi2}}{\\beta_2 + 1}\\approx\\frac1{g_{m2}} = ${resTeX(re2)}$, so the node is $R_E\\parallel ${resTeX(re2)} = ${resTeX(node)}$ (the emitter wins: it is the small one). Up the elevator: $R_X = r_{\\pi1} + (\\beta_1 + 1)(${resTeX(node)}) = ${resTeX(ans)}$.${Math.abs(I1 - I2) < 1e-9 && b1 === b2 ? ' For identical transistors and a big $R_E$ this is about $2r_\\pi$: the differential-pair input.' : ''}`;
      traps = [{ v: rp1 + (b1 + 1) * R, msg: '$Q_2$\'s emitter is also hanging on that node, and it is small ($\\approx 1/g_{m2}$): it is in parallel with $R_E$ and dominates.' }];
    }
    return {
      fig,
      q: `$r_o\\to\\infty$. $Q_1$: $\\beta_1 = ${b1}$, $I_{C1} = ${MA(I1)}$${/darl|pair/.test(kase) ? `; $Q_2$: $\\beta_2 = ${b2}$, $I_{C2} = ${MA(I2)}$` : ''}; $V_T = 25\\,\\text{mV}$. Find $R_X$. (Start with $g_m = I_C/V_T$ and $r_\\pi = \\beta/g_m$.)`,
      parts: [resAns('R_X', ans, [approx], traps)],
      hints: ['$g_m = I_C/V_T$, $r_\\pi = \\beta/g_m$.', 'Going **up** from an emitter into a base multiplies by $\\beta + 1$. Going **down** from a base to an emitter divides by $\\beta + 1$.'],
      sol: `$g_{m1} = ${MS(g1)}$, $r_{\\pi1} = ${KO(rp1)}$${/darl|pair/.test(kase) ? `; $g_{m2} = ${MS(g2)}$, $r_{\\pi2} = ${KO(rp2)}$` : ''}.

${steps}`,
    };
  };
})();

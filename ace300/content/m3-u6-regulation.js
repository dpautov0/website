/* Mini Exam 3 · Part 12: monopoly taxes and regulation (Lecture 19, Perloff ch. 11, DS10 Q1(c)–(e) and Q2).
   Lecture 19 slides are not in the materials, so this Part is built from first principles, consistent with the
   formula sheet: specific tax (MR − t = MC), ad valorem tax ((1 − v)MR = MC), pass-through dPc/dt, natural
   monopoly, and P = MC vs P = AC price ceilings. Same layout as the exemplar (m3-u2-srsupply.js). */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, X, FIX, plan, gen, F, pick, ri } = M3;

  // small TeX helpers: "a - bQ", "c + dQ"
  const cq = (k, v = 'Q') => (k === 1 ? v : `${F(k)}${v}`);
  const dem = (a, b) => `${F(a)} - ${cq(b)}`;
  const mcT = (c, d) => (d === 0 ? `${F(c)}` : c === 0 ? cq(d) : `${F(c)} + ${cq(d)}`);

  // ------------------------------------------------------------------ figures, lesson 1
  // the ski resort: P = 100 - Q, MC = 20, t = 20. No tax: Q = 40, P = 60. Tax: Q = 30, Pc = 70, Pp = 50. Efficient Q = 80.
  const taxFig = EC.graph({
    w: 340, h: 280, x: [0, 104], y: [0, 104], xl: 'Q', yl: '\\$',
    xt: [[30, 'Q^t'], [40, 'Q^m'], [80, 'Q^e']], yt: [20, [50, 'P_p'], [70, 'P_c'], 100],
    items: [
      { poly: [[0, 70], [30, 70], [0, 100]], cls: 'cs' },
      { poly: [[0, 50], [30, 50], [30, 70], [0, 70]], cls: 'ex' },
      { poly: [[0, 20], [30, 20], [30, 50], [0, 50]], cls: 'gain' },
      { poly: [[30, 70], [80, 20], [30, 20]], cls: 'loss' },
      { f: (x) => 100 - x, from: 0, to: 100, lab: 'D', labX: 90, anchor: 'bl', dx: 5, dy: -2 },
      { f: (x) => 80 - x, from: 0, to: 80, cls: 'c2 dash', lab: 'D - t', labX: 70, anchor: 'tr', dx: -3, dy: 4 },
      { f: (x) => 100 - 2 * x, from: 0, to: 50, cls: 'c4', lab: 'MR', labX: 50, anchor: 'bl', dx: 3, dy: -3 },
      { f: (x) => 80 - 2 * x, from: 0, to: 40, cls: 'c4 dash', lab: 'MR - t', labX: 40, anchor: 'br', dx: -3, dy: -3 },
      { seg: [[0, 20], [104, 20]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { pt: [30, 70], guide: true }, { pt: [30, 50], guide: 'y' }, { pt: [80, 20], guide: 'x' },
      { pt: [40, 60], lab: '\\text{no tax}', at: 'tr' },
      { text: [21, 74.5], t: 'CS' }, { text: [5, 59], t: 'G' }, { text: [8, 34], t: 'PS' }, { text: [51, 37], t: '\\text{DWL}' },
    ],
  });
  // total after-tax DWL (1250) = the monopoly's own DWL (800) + the extra DWL from the tax (450, drawn darker)
  const extraFig = EC.graph({
    w: 340, h: 260, x: [0, 104], y: [0, 104], xl: 'Q', yl: '\\$',
    xt: [[30, 'Q^t'], [40, 'Q^m'], [80, 'Q^e']], yt: [20, 60, 70, 100],
    items: [
      { poly: [[30, 70], [80, 20], [30, 20]], cls: 'loss' },
      { poly: [[30, 70], [40, 60], [40, 20], [30, 20]], cls: 'loss' },
      { f: (x) => 100 - x, from: 0, to: 100, lab: 'D', labX: 90, anchor: 'bl', dx: 5, dy: -2 },
      { seg: [[0, 20], [104, 20]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { seg: [[40, 20], [40, 60]], cls: 'guide' },
      { pt: [30, 70], lab: '\\text{taxed}', at: 'tr', guide: true }, { pt: [40, 60], lab: '\\text{no tax}', at: 'tr', guide: true },
      { pt: [80, 20], guide: 'x' },
      { text: [35, 36], t: '450' }, { text: [52, 32], t: '800' },
    ],
  });

  // ------------------------------------------------------------------ generators, lesson 1
  const PLAN_SPEC_Q = (a, b, t, mc, onWho) => plan('What equation gives the after-tax output?', `$MR(Q) - ${t} = MC$: here $${F(a)} - ${cq(2 * b)} - ${t} = ${mc}$`, [
    [`$MR(Q) = MC$, because the tax is collected from ${onWho}`, 'Who hands the money to the government does not matter. The firm keeps only $P(Q) - t$ per unit either way, so its marginal revenue falls by $t$.'],
    [`$P(Q) - ${t} = MC$`, 'That sets effective **demand** equal to MC, the competitive rule. A monopolist sets effective **MR** equal to MC.'],
    [`$MR(Q) = MC - ${t}$`, 'The tax makes each unit cost the firm more, not less. Moving $t$ to the cost side gives $MR = MC + t$.'],
  ], `Effective MR $= ${F(a)} - ${cq(2 * b)} - ${t}$. Set it equal to $MC = ${mc}$ and solve for $Q$.`);
  const PLAN_PC = plan('With the after-tax $Q$ in hand, where does the consumer price come from?', 'The original demand curve, $P_c = P(Q^t)$; then $P_p = P_c - t$', [
    ['The effective demand curve $P(Q) - t$', 'That gives what the firm **keeps**, $P_p$. Consumers pay the full demand price.'],
    ['The untaxed price plus $t$', 'That assumes the whole tax reaches consumers. A monopolist passes on only part of it (see the pass-through lesson).'],
    ['Plug $Q^t$ into MR', 'MR is not a price anyone pays. Prices come from the demand curve.'],
  ], 'Plug $Q^t$ into the demand curve for $P_c$. Subtract $t$ for $P_p$.');

  gen('m3_mt_specific', () => {
    const b = pick([1, 2]), d = pick([0, 0, 1]), k = 2 * b + d;
    const m = pick([2, 3, 4, 5]), t = k * m, Qt = ri(8, 25);
    const c = d === 0 ? pick([4, 6, 10, 12, 20]) : pick([0, 2, 4, 10]);
    const a = c + t + k * Qt, Qm = Qt + m;
    const Pc = a - b * Qt, Pp = Pc - t, Gv = t * Qt, VC = c * Qt + d * Qt * Qt / 2, pi = Pp * Qt - VC, Pm = a - b * Qm;
    const onWho = pick(['consumers', 'the monopolist']), mc = mcT(c, d);
    return {
      title: 'A per-unit tax on a monopolist',
      q: md`A monopolist faces inverse demand $P = ${dem(a, b)}$ and has marginal cost $MC = ${mc}$ (no fixed cost). The government imposes a specific tax of \$${t} per unit, collected from ${onWho}. Find the after-tax quantity, the price consumers pay, the price the firm keeps, tax revenue, and the firm's profit.`,
      plan: [PLAN_SPEC_Q(a, b, t, mc, onWho), PLAN_PC],
      parts: [N('Q^t', Qt), N('P_c', Pc), N('P_p', Pp), N('G', Gv), N('\\pi', pi)],
      hints: [`$MR = ${F(a)} - ${cq(2 * b)}$. Effective MR $= ${F(a - t)} - ${cq(2 * b)}$.`, `Profit $= P_p Q - VC$, where $VC = ${d === 0 ? `${c}Q` : c === 0 ? `${F(d / 2)}Q^2` : `${c}Q + ${F(d / 2)}Q^2`}$ (the area under MC).`],
      sol: md`
        **Move 1: effective MR.** The firm keeps $P(Q) - ${t}$ per unit (it does not matter that the tax is collected from ${onWho}). Effective demand is $${dem(a - t, b)}$, so effective MR is
        $$MR(Q) - ${t} = ${F(a)} - ${cq(2 * b)} - ${t} = ${F(a - t)} - ${cq(2 * b)}$$

        **Move 2: set it equal to MC.**
        $$${F(a - t)} - ${cq(2 * b)} = ${mc} \;\Rightarrow\; ${F(a - t - c)} = ${cq(k)} \;\Rightarrow\; Q^t = ${Qt}$$

        **Move 3: prices.** Consumers pay the demand price: $P_c = ${F(a)} - ${b === 1 ? '' : b}(${Qt}) = ${F(Pc)}$. The firm keeps $P_p = ${F(Pc)} - ${t} = ${F(Pp)}$.

        **Move 4: revenue.** $G = tQ^t = ${t} \times ${Qt} = ${F(Gv)}$.

        **Move 5: profit.** $TR_{\text{firm}} = P_pQ = ${F(Pp)} \times ${Qt} = ${F(Pp * Qt)}$. $VC = ${F(VC)}$. So $\pi = ${F(Pp * Qt)} - ${F(VC)} = ${F(pi)}$.

        Does this make sense? Without the tax the firm would sell $${Qm}$ at \$${F(Pm)}. The consumer price rose by $${F(Pc - Pm)}$, less than the \$${t} tax: the monopolist absorbed the rest.
      `,
    };
  });

  gen('m3_mt_dwl', () => {
    const b = pick([1, 2]), c = pick([10, 20, 30]), Qm = pick([20, 30, 40, 50]), mm = pick([5, 10]);
    const t = 2 * b * mm, Qt = Qm - mm, a = c + 2 * b * Qm, Qe = 2 * Qm;
    const Pm = a - b * Qm, Pc = a - b * Qt, Pp = Pc - t;
    const dwlM = 0.5 * (Qe - Qm) * (Pm - c), dwlT = 0.5 * (Qe - Qt) * (Pc - c), extra = dwlT - dwlM, Gv = t * Qt;
    return {
      title: 'How much deadweight loss does the tax add?',
      q: md`A monopolist faces $P = ${dem(a, b)}$ and has constant $MC = ${c}$. A specific tax of \$${t} per unit is imposed. Find the efficient output, the deadweight loss before the tax, the total deadweight loss after the tax, the extra deadweight loss caused by the tax, and tax revenue.`,
      plan: [
        plan('Against what output do you measure the after-tax deadweight loss?', 'The efficient output, where demand meets $MC$ ($P = MC$)', [
          ['The untaxed monopoly output $Q^m$', 'Measuring from $Q^m$ gives only the part the tax added. Total DWL is measured from the efficient point.'],
          ['Where effective demand $P(Q) - t$ meets MC', 'That point has no welfare meaning. Society’s benchmark uses what consumers value (demand) and what units cost (MC).'],
          ['Where $MR = 0$', 'That maximizes revenue, not total surplus.'],
        ], `Set $${dem(a, b)} = ${c}$: $Q^e = ${Qe}$. Every unit between the market quantity and $Q^e$ is worth more than it costs: that gap is the DWL.`),
        plan('How do you get the extra DWL caused by the tax?', 'After-tax DWL minus the untaxed monopoly DWL', [
          ['$\\tfrac12 \\times t \\times (Q^m - Q^t)$', 'That is the competitive shortcut. Here the monopoly already priced above MC, so on the lost units demand sits more than $t$ above MC.'],
          ['Tax revenue $tQ^t$', 'Revenue is a transfer to the government, not a loss.'],
          ['The whole after-tax triangle', 'Part of that triangle existed before the tax: the monopoly caused it.'],
        ], 'Compute both triangles against $Q^e$ and subtract. The difference is a trapezoid between $Q^t$ and $Q^m$.'),
      ],
      parts: [N('Q^e', Qe), N('\\text{DWL}_{\\text{no tax}}', dwlM), N('\\text{DWL}_{\\text{after tax}}', dwlT), N('\\text{extra DWL}', extra), N('G', Gv)],
      hints: [`Untaxed: $${F(a)} - ${cq(2 * b)} = ${c}$. Taxed: $${F(a)} - ${cq(2 * b)} - ${t} = ${c}$.`, 'Each DWL is a triangle: base from the market quantity to $Q^e$, height from MC up to the consumer price.'],
      sol: md`
        **Move 1: three quantities.** Efficient: $${dem(a, b)} = ${c} \Rightarrow Q^e = ${Qe}$. Untaxed monopoly: $${F(a)} - ${cq(2 * b)} = ${c} \Rightarrow Q^m = ${Qm}$, $P^m = ${F(Pm)}$. Taxed: $${F(a)} - ${cq(2 * b)} - ${t} = ${c} \Rightarrow Q^t = ${Qt}$, $P_c = ${F(Pc)}$, $P_p = ${F(Pp)}$.

        **Move 2: DWL before the tax.**
        $$\text{DWL}_{\text{no tax}} = \tfrac12(${Qe} - ${Qm})(${F(Pm)} - ${c}) = ${F(dwlM)}$$

        **Move 3: DWL after the tax** (same benchmark, $Q^e$):
        $$\text{DWL}_{\text{after}} = \tfrac12(${Qe} - ${Qt})(${F(Pc)} - ${c}) = ${F(dwlT)}$$

        **Move 4: the extra loss.** $${F(dwlT)} - ${F(dwlM)} = ${F(extra)}$. Compare the competitive shortcut $\tfrac12 \cdot ${t} \cdot ${mm} = ${F(0.5 * t * mm)}$: too small, because the lost units were worth far more than MC.

        **Move 5: revenue.** $G = ${t} \times ${Qt} = ${F(Gv)}$ (a transfer, not a loss).
      `,
    };
  });

  // ------------------------------------------------------------------ figures, lesson 2
  // parallel shift (specific t = 20) vs pivot (ad valorem v = 0.5) of P = 100 - Q
  const rotFig = EC.graph({
    w: 330, h: 250, x: [0, 104], y: [0, 104], xl: 'Q', yl: '\\$', xt: [80, 100], yt: [50, 80, 100],
    items: [
      { f: (x) => 100 - x, from: 0, to: 100, lab: 'D', labX: 10, anchor: 'bl', dx: 6, dy: -2 },
      { f: (x) => 80 - x, from: 0, to: 80, cls: 'c2 dash', lab: 'D - t', labX: 70, anchor: 'tr', dx: -4, dy: 4 },
      { f: (x) => 50 - 0.5 * x, from: 0, to: 100, cls: 'c3 dash', lab: '(1 - v)D', labX: 20, anchor: 'tr', dx: -2, dy: 5 },
      { pt: [100, 0], lab: '\\text{pivot}', at: 'tl' },
    ],
  });
  // DS10 Q1: P = 500 - 2Q, MC = Q, v = 0.4. Q = 88.235, Pc = 323.53, Pp = 194.12, efficient Q = 166.67
  const QV = 300 / 3.4, PCV = 500 - 2 * QV, PPV = 0.6 * PCV, QEV = 500 / 3;
  const avCurvesFig = EC.graph({
    w: 340, h: 280, x: [0, 262], y: [0, 520], xl: 'Q', yl: '\\$',
    xt: [[QV, '88.2'], [125, '125'], [250, '250']], yt: [[PPV, '194.1'], [PCV, '323.5'], [500, '500']],
    items: [
      { f: (x) => 500 - 2 * x, from: 0, to: 250, lab: 'D', labX: 20, anchor: 'bl', dx: 6, dy: -2 },
      { f: (x) => 300 - 1.2 * x, from: 0, to: 250, cls: 'c2 dash', lab: '0.6D', labX: 200, anchor: 'bl', dx: 4, dy: -2 },
      { f: (x) => 500 - 4 * x, from: 0, to: 125, cls: 'c4', lab: 'MR', labX: 95, anchor: 'bl', dx: 6, dy: -2 },
      { f: (x) => 300 - 2.4 * x, from: 0, to: 125, cls: 'c4 dash', lab: '0.6MR', labX: 40, anchor: 'tr', dx: -4, dy: 6 },
      { f: (x) => x, from: 0, to: 255, cls: 'c5', lab: 'MC', labX: 255, anchor: 'br', dx: -4, dy: -4 },
      { pt: [QV, PCV], lab: 'P_c', at: 'tr', guide: true }, { pt: [QV, PPV], lab: 'P_p', at: 'tr', guide: 'y' }, { pt: [QV, QV], guide: false },
    ],
  });
  const avAreasFig = EC.graph({
    w: 340, h: 270, x: [0, 262], y: [0, 520], xl: 'Q', yl: '\\$',
    xt: [[QV, '88.2'], [QEV, '166.7']], yt: [[PPV, '194.1'], [PCV, '323.5'], [500, '500']],
    items: [
      { poly: [[0, PCV], [QV, PCV], [0, 500]], cls: 'cs' },
      { poly: [[0, PPV], [QV, PPV], [QV, PCV], [0, PCV]], cls: 'ex' },
      { poly: [[0, 0], [QV, QV], [QV, PPV], [0, PPV]], cls: 'gain' },
      { poly: [[QV, PCV], [QEV, QEV], [QV, QV]], cls: 'loss' },
      { f: (x) => 500 - 2 * x, from: 0, to: 250, lab: 'D', labX: 230, anchor: 'bl', dx: 5, dy: -2 },
      { f: (x) => x, from: 0, to: 255, cls: 'c5', lab: 'MC', labX: 255, anchor: 'br', dx: -4, dy: -4 },
      { pt: [QV, PCV], guide: true }, { pt: [QEV, QEV], guide: 'x' },
      { text: [25, 375], t: 'CS' }, { text: [44, 259], t: 'G' }, { text: [52, 130], t: 'PS' }, { text: [116, 192], t: '\\text{DWL}' },
    ],
  });

  // ------------------------------------------------------------------ generators, lesson 2
  // constant MC: (1 - v)(a - 2bQ) = c  =>  MR(Q) = c/(1 - v) = m. Pick m and Q, then a = m + 2bQ.
  const advDraw = () => {
    const k = pick([0.5, 0.6, 0.75, 0.8]), v = Math.round((1 - k) * 100) / 100, m = pick([20, 40, 60]), c = Math.round(k * m * 100) / 100;
    const b = pick([1, 2]), Qv = ri(10, 30), a = m + 2 * b * Qv;
    const Pc = a - b * Qv, Pp = k * Pc;
    return { k, v, m, c, b, a, Qv, Pc, Pp, Gv: (Pc - Pp) * Qv, pct: Math.round(v * 100) };
  };
  const PLAN_AV_Q = (k, a, b, c, pct) => plan('What equation gives the output under the ad valorem tax?', `$${F(k)}(${F(a)} - ${cq(2 * b)}) = ${F(c)}$: effective MR equals MC`, [
    [`$${F(a)} - ${cq(2 * b)} - ${F(1 - k)} = ${F(c)}$`, `That subtracts ${F(1 - k)} like a dollar amount. A ${pct}% tax takes a share of each dollar, so it **multiplies** MR by ${F(k)}.`],
    [`$${F(a)} - ${cq(2 * b)} = ${F(1 + (1 - k))} \\times ${F(c)}$`, `Close, but the right move divides: $(1 - v)MR = MC$ means $MR = MC/${F(k)}$, not $MC \\times ${F(1 + (1 - k))}$.`],
    [`$${F(k)}(${dem(a, b)}) = ${F(c)}$`, 'That sets effective **demand** equal to MC (the competitive rule). A monopolist uses effective MR.'],
  ], `Effective MR $= ${F(k)}(${F(a)} - ${cq(2 * b)}) = ${F(k * a)} - ${cq(2 * b * k)}$. Set it equal to ${F(c)} and solve.`);

  gen('m3_mt_advalorem', () => {
    const { k, m, c, b, a, Qv, Pc, Pp, Gv, pct } = advDraw();
    return {
      title: 'An ad valorem tax on a monopolist',
      q: md`A monopolist faces $P = ${dem(a, b)}$ and has constant $MC = ${F(c)}$. The government imposes a ${pct}% ad valorem tax on the price consumers pay. Write the effective demand and effective MR, then find the quantity, both prices, and tax revenue.`,
      plan: [PLAN_AV_Q(k, a, b, c, pct), PLAN_PC_AV],
      parts: [X('\\text{effective demand } P_p(Q)', `${k * a} - ${k * b}*Q`, { Q: [1, 30] }), X('\\text{effective } MR(Q)', `${k * a} - ${2 * k * b}*Q`, { Q: [1, 30] }),
        N('Q^v', Qv), N('P_c', Pc), N('P_p', Pp), N('G', Gv)],
      hints: [`The firm keeps ${F(k)} of each dollar: multiply demand and MR by ${F(k)}.`, `$${F(k * a)} - ${cq(2 * b * k)} = ${F(c)}$.`],
      sol: md`
        **Move 1: effective demand.** The firm keeps $1 - ${F(1 - k)} = ${F(k)}$ of each dollar: $P_p = ${F(k)}(${dem(a, b)}) = ${dem(k * a, k * b)}$.

        **Move 2: effective MR.** Multiply MR by ${F(k)}: $${F(k)}(${F(a)} - ${cq(2 * b)}) = ${dem(k * a, 2 * k * b)}$.

        **Move 3: set it equal to MC.**
        $$${dem(k * a, 2 * k * b)} = ${F(c)} \;\Rightarrow\; ${cq(2 * k * b)} = ${F(k * a - c)} \;\Rightarrow\; Q^v = ${Qv}$$

        **Move 4: prices.** $P_c = ${F(a)} - ${b === 1 ? '' : b}(${Qv}) = ${F(Pc)}$ (original demand). $P_p = ${F(k)} \times ${F(Pc)} = ${F(Pp)}$.

        **Move 5: revenue.** $G = (P_c - P_p)Q = (${F(Pc)} - ${F(Pp)})(${Qv}) = ${F(Gv)}$.
      `,
    };
  });

  gen('m3_mt_compare', () => {
    const { k, v, m, c, b, a, Qv, Pc, Pp, Gv, pct } = advDraw();
    const t = v * m, Gt = t * Qv;
    return {
      title: 'Same output, which tax raises more?',
      q: md`A monopolist faces $P = ${dem(a, b)}$ with constant $MC = ${F(c)}$. Under a ${pct}% ad valorem tax it sells ${Qv} units at $P_c = ${F(Pc)}$. (a) What specific tax per unit would lead to the same output? (b) Compare the revenue the two taxes raise.`,
      plan: [
        plan('How do you find the specific tax with the same output?', `Keep $Q = ${Qv}$ and solve $MR(${Qv}) - t = MC$ for $t$`, [
          [`$t = ${F(v)} \\times P_c = ${F(v * Pc)}$`, 'That is what the ad valorem tax collects per unit. Used as a specific tax it would cut output below the target.'],
          [`$t = ${F(v)} \\times MC = ${F(v * c)}$`, 'The tax that matters at the margin bites marginal revenue, not marginal cost.'],
          ['$t = P_c - MC$', 'That is the whole markup. A tax that size would push output to where effective MR is far below MC.'],
        ], `$MR(${Qv}) = ${F(a)} - ${F(2 * b * Qv)} = ${F(m)}$. So $t = ${F(m)} - ${F(c)} = ${F(t)}$, which equals $v \\times MR = ${F(v)} \\times ${F(m)}$.`),
        plan('Which tax raises more revenue at the same output?', 'The ad valorem tax: per unit it collects $vP_c$, and $P_c > MR$', [
          ['The same: same output, same tax base', 'Same units, but not the same tax per unit: $vP_c$ versus $t = v\\,MR$.'],
          ['The specific tax, because it does not fall when prices fall', 'At this output prices are identical under both. Per unit, $vP_c$ beats $v\\,MR$.'],
          ['Cannot tell without the elasticity', 'You can: a monopolist always sells where $P > MR$, so $vP > v\\,MR$.'],
        ], `$G_v = ${F(v)}(${F(Pc)})(${Qv})$ versus $G_t = ${F(t)}(${Qv})$.`),
      ],
      parts: [N('t', t), N('G_{\\text{ad valorem}}', Gv), N('G_{\\text{specific}}', Gt)],
      hints: [`Under the ad valorem tax, $${F(k)}\\,MR = MC$, so $MR(${Qv}) = ${F(c)}/${F(k)} = ${F(m)}$.`],
      sol: md`
        **Move 1: MR at the target output.** $MR(${Qv}) = ${F(a)} - ${cq(2 * b, `(${Qv})`)} = ${F(m)}$.

        **Move 2: the matching specific tax.** The specific-tax rule is $MR - t = MC$, so at $Q = ${Qv}$:
        $$t = MR - MC = ${F(m)} - ${F(c)} = ${F(t)}$$
        Shortcut: $t = v \times MR = ${F(v)} \times ${F(m)} = ${F(t)}$.

        **Move 3: revenues.** Same $Q$ and the same demand, so the same $P_c = ${F(Pc)}$.
        $$G_{\text{ad valorem}} = vP_cQ = ${F(v)}(${F(Pc)})(${Qv}) = ${F(Gv)}, \qquad G_{\text{specific}} = tQ = ${F(t)}(${Qv}) = ${F(Gt)}$$
        The ad valorem tax raises ${F(Gv / Gt, 2)} times as much, exactly $P_c/MR = ${F(Pc)}/${F(m)}$. Same output means the same CS and the same DWL; the extra revenue comes out of the firm's profit ($P_p = ${F(Pp)}$ versus $${F(Pc - t)}$).
      `,
    };
  });
  const PLAN_PC_AV = plan('With $Q^v$ in hand, how do you get the two prices?', '$P_c$ from the original demand, then $P_p = (1 - v)P_c$', [
    ['$P_c$ from the effective demand', 'Effective demand gives $P_p$, what the firm keeps.'],
    ['$P_p = P_c - v$', 'An ad valorem tax takes a **share**: $P_p = (1 - v)P_c$. Subtracting $v$ treats a percent as dollars.'],
    ['$P_c = (1 + v)P_p$', 'The tax is a share of the consumer price, so $P_p = (1 - v)P_c$, which gives $P_c = P_p/(1 - v)$, not $(1 + v)P_p$.'],
  ], 'Plug $Q^v$ into demand for $P_c$; multiply by $(1 - v)$ for $P_p$.');

  // ------------------------------------------------------------------ figures, lesson 3
  // linear: P = 100 - Q, MC = 20, t = 20. Monopoly 60 -> 70; competition with flat MC 20 -> 40.
  const passLinFig = EC.graph({
    w: 340, h: 270, x: [0, 104], y: [0, 104], xl: 'Q', yl: '\\$', xt: [30, 40, 60, 80], yt: [20, 40, 60, 70],
    items: [
      { f: (x) => 100 - x, from: 0, to: 100, lab: 'D', labX: 92, anchor: 'bl', dx: 5, dy: -2 },
      { f: (x) => 100 - 2 * x, from: 0, to: 50, cls: 'c4', lab: 'MR', labX: 50, anchor: 'bl', dx: 3, dy: -3 },
      { seg: [[0, 20], [104, 20]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { seg: [[0, 40], [104, 40]], cls: 'curve c5 dash', lab: 'MC + t', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { pt: [40, 60], lab: 'M_0', at: 'tr', guide: true }, { pt: [30, 70], lab: 'M_1', at: 'tr', guide: true },
      { pt: [80, 20], lab: 'C_0', at: 'tr', guide: 'x' }, { pt: [60, 40], lab: 'C_1', at: 'tr', guide: 'x' },
    ],
  });
  // constant elasticity e = 2, Q = 4000 P^-2, MC = 10, t = 4: P = 2(MC + t): 20 -> 28
  const ceD = (x) => Math.sqrt(4000 / x);
  const ceFig = EC.graph({
    w: 330, h: 270, x: [0, 22], y: [0, 48], xl: 'Q', yl: '\\$', xt: [[4000 / 784, '5.1'], 10], yt: [10, 14, 20, 28],
    items: [
      { f: ceD, from: 1.75, to: 21.5, lab: 'D', labX: 21.5, anchor: 'bl', dx: 2, dy: -3 },
      { f: (x) => ceD(x) / 2, from: 0.45, to: 21.5, cls: 'c4', lab: 'MR = P/2', labX: 18, anchor: 'tr', dx: 0, dy: 5 },
      { seg: [[0, 10], [22, 10]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { seg: [[0, 14], [22, 14]], cls: 'curve c5 dash', lab: 'MC + t', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { pt: [10, 20], lab: '\\text{no tax}', at: 'tr', guide: true }, { pt: [4000 / 784, 28], lab: '\\text{tax } 4', at: 'tr', guide: true },
      { pt: [10, 10] }, { pt: [4000 / 784, 14] },
    ],
  });

  // ------------------------------------------------------------------ generators, lesson 3
  gen('m3_mt_passlin', () => {
    const b = pick([1, 2]), dm = pick([0, 0, 1, 2]), d = dm * b, k = 2 * b + d;
    const c = d === 0 ? pick([10, 20, 30]) : pick([0, 10]), Q0 = pick([20, 30, 40]), a = c + k * Q0;
    const i = pick([1, 2]), j = i + pick([1, 2, 3]), t1 = k * i, t2 = k * j;
    const Pc = (t) => a - b * (a - c - t) / k, P1 = Pc(t1), P2 = Pc(t2), pass = b / k;
    const passTex = d === 0 ? '\\tfrac12' : `\\tfrac{${b}}{${k}}`;
    return {
      title: 'Pass-through with linear demand',
      q: md`A monopolist faces $P = ${dem(a, b)}$ and has $MC = ${mcT(c, d)}$. A specific tax rises from \$${t1} to \$${t2} per unit. Find the consumer price at each tax, the pass-through $dP_c/dt$, and $P_c$ as a function of $t$.`,
      plan: [
        plan('How do you get $P_c$ as a function of $t$?', 'Solve $MR - t = MC$ for $Q(t)$, then plug $Q(t)$ into demand', [
          ['Add $t$ to the untaxed monopoly price', 'That assumes full pass-through. The monopolist re-optimizes and absorbs part of the tax.'],
          ['Solve $P(Q) = MC + t$', 'That is the competitive market. A monopolist sets MR, not price, equal to cost.'],
          ['Plug $t$ into MR and read off the price', 'MR is not a price; prices come from demand at the chosen $Q$.'],
        ], `$${F(a)} - ${cq(2 * b)} - t = ${mcT(c, d)} \\Rightarrow Q(t) = \\dfrac{${F(a - c)} - t}{${k}}$. Then $P_c = ${F(a)} - ${b === 1 ? '' : b}Q(t)$.`),
        plan('Before computing: what will $dP_c/dt$ be?', d === 0 ? 'Exactly $\\tfrac12$: linear demand and constant MC' : 'Less than $\\tfrac12$: MC rises with output', d === 0 ? [
          ['It depends on the demand slope', 'With flat MC the slope cancels: $P_c = (a + c + t)/2$ for any $b$.'],
          ['1: the whole tax', 'Full pass-through is the competitive case with flat MC.'],
          ['More than 1', 'That happens with constant-elasticity demand, not linear demand.'],
        ] : [
          ['Exactly $\\tfrac12$', 'Only with flat MC. Here cutting output also saves cost, so the firm cuts more and the price rises less.'],
          ['1: the whole tax', 'Full pass-through is the competitive case with flat MC.'],
          ['More than 1', 'That happens with constant-elasticity demand, not linear demand.'],
        ], `$dP_c/dt = b/(2b + d) = ${passTex}$ here.`),
      ],
      parts: [N(`P_c\\text{ at }t = ${t1}`, P1), N(`P_c\\text{ at }t = ${t2}`, P2), N('dP_c/dt', pass), X('P_c(t)', `${a} - ${b}*(${a - c} - t)/${k}`, { t: [0, 20] })],
      hints: [`$Q(t) = (${F(a - c)} - t)/${k}$.`],
      sol: md`
        **Move 1: output as a function of $t$.** Effective MR $= ${F(a)} - ${cq(2 * b)} - t$. Set it equal to $MC = ${mcT(c, d)}$:
        $$${F(a - c)} - t = ${cq(k)} \;\Rightarrow\; Q(t) = \frac{${F(a - c)} - t}{${k}}$$

        **Move 2: the consumer price.** Plug into demand:
        $$P_c(t) = ${F(a)} - ${b === 1 ? '' : b}\cdot\frac{${F(a - c)} - t}{${k}} = ${F(a - b * (a - c) / k)} + ${passTex}\,t$$

        **Move 3: numbers.** $t = ${t1}$: $Q = ${F((a - c - t1) / k)}$, $P_c = ${F(P1)}$. $t = ${t2}$: $Q = ${F((a - c - t2) / k)}$, $P_c = ${F(P2)}$.

        **Move 4: pass-through.** $\dfrac{dP_c}{dt} = ${passTex} = ${F(pass)}$. Check: $\dfrac{${F(P2)} - ${F(P1)}}{${t2} - ${t1}} = ${F((P2 - P1) / (t2 - t1))}$. ✓
      `,
    };
  });

  gen('m3_mt_passce', () => {
    const e = pick([1.5, 2, 3, 4, 5]), unit = { 1.5: 1, 2: 1, 3: 2, 4: 3, 5: 4 }[e], mk = e / (e - 1);
    const c = unit * pick([3, 4, 5, 6, 8, 10]), t = unit * pick([1, 2, 3]), kk = pick([1000, 5000, 10000]);
    const P0 = c * mk, P1 = (c + t) * mk, Pp = P1 - t;
    return {
      title: 'Pass-through with constant-elasticity demand',
      q: md`A monopolist faces constant-elasticity demand $Q = ${kk}P^{-${e}}$ and has constant $MC = ${c}$. A specific tax of \$${t} per unit is imposed. Find the price before and after the tax, the pass-through, the price the firm keeps, and the consumers' share of the tax in percent.`,
      plan: [
        plan('Which pricing rule do you use?', `$MR = P(1 - 1/e)$, so $P = \\dfrac{e}{e - 1}(MC + t)$: a constant markup over cost`, [
          ['$MR = a - 2bQ$', 'That is for linear demand. This demand has constant elasticity, so use $MR = P(1 + 1/\\varepsilon_p)$.'],
          ['$P = MC + t$', 'That is the competitive answer. The monopolist marks up.'],
          ['$P = \\tfrac12(\\text{intercept} + MC + t)$', 'Constant-elasticity demand has no intercept; that formula is for linear demand.'],
        ], `$\\varepsilon_p = -${e}$, so $MR = P(1 - 1/${e})$. Set $MR = MC + t$ and solve for $P$.`),
        plan('Before computing: will the price rise by more or less than the tax?', `More: by $\\tfrac{e}{e - 1} = ${F(mk)}$ times the tax`, [
          ['Less: a monopolist always absorbs part of a tax', 'True for linear demand, not here: a constant percentage markup on a higher cost raises the price by more than the cost.'],
          ['Exactly the tax', 'That is the competitive case with flat MC.'],
          ['Half the tax', 'That is the linear-demand, flat-MC case.'],
        ], `$dP_c/dt = e/(e - 1) = ${F(mk)} > 1$.`),
      ],
      parts: [N('P\\text{ before}', P0), N('P_c\\text{ after}', P1), N('dP_c/dt', mk), N('P_p\\text{ after}', Pp), N('\\text{consumer share }(\\%)', mk * 100)],
      hints: [`Markup factor $e/(e - 1) = ${e}/${F(e - 1)} = ${F(mk)}$.`],
      sol: md`
        **Move 1: MR from elasticity.** For $Q = kP^{-e}$, $\varepsilon_p = -${e}$, so $MR = P\big(1 + \tfrac{1}{-${e}}\big) = P\cdot\tfrac{${F(e - 1)}}{${e}}$.

        **Move 2: no tax.** $P\cdot\tfrac{${F(e - 1)}}{${e}} = ${c} \Rightarrow P = ${c} \times ${F(mk)} = ${F(P0)}$.

        **Move 3: with the tax.** Set $MR = MC + t = ${c + t}$: $P_c = ${c + t} \times ${F(mk)} = ${F(P1)}$.

        **Move 4: pass-through.** $\dfrac{dP_c}{dt} = \dfrac{e}{e - 1} = ${F(mk)}$: the price rose by $${F(P1 - P0)}$ on a \$${t} tax. The firm keeps $P_p = ${F(P1)} - ${t} = ${F(Pp)}$, **more** than its untaxed price ${F(P0)}.

        **Move 5: incidence.** Consumer share $= (P_c - P)/t = (${F(P1)} - ${F(P0)})/${t} = ${F(mk)}$, i.e. ${F(mk * 100)}%. The producer share $(P - P_p)/t = ${F((P0 - Pp) / t)}$ is negative: the firm's price per unit went up, though it sells fewer units and its profit falls.
      `,
    };
  });

  // ------------------------------------------------------------------ figures, lesson 4
  // DS10 Q2 water utility: P = 28 - Q, C = 80 + 4Q, AC = 4 + 80/Q, MC = 4
  const ACw = (q) => 4 + 80 / q;
  const natFig = EC.graph({
    w: 330, h: 270, x: [0, 30], y: [0, 30], xl: 'Q', yl: '\\$', xt: [10, 20], yt: [4, 8, 12],
    items: [
      { f: (x) => 28 - x, from: 0, to: 28, cls: 'dim', lab: 'D', labX: 26, anchor: 'bl', dx: 4, dy: -2 },
      { f: ACw, from: 2.75, to: 29.5, lab: 'AC = 4 + 80/Q', labX: 25, anchor: 'bl', dx: -10, dy: -8 },
      { seg: [[0, 4], [30, 4]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { pt: [20, 8], lab: '\\text{one firm}', at: 'br', guide: true }, { pt: [10, 12], lab: '\\text{each of two}', at: 'tr', guide: true },
    ],
  });

  // ------------------------------------------------------------------ generators, lesson 4
  gen('m3_rg_natural', () => {
    const Fx = pick([60, 120, 240, 300]), c = pick([2, 4, 5, 10]), n = pick([2, 3, 4]), Qt = n * pick([10, 20, 30]);
    const TC1 = Fx + c * Qt, AC1 = TC1 / Qt, TCn = n * Fx + c * Qt, ACn = TCn / Qt;
    return {
      title: 'One firm or several?',
      q: md`A local utility has cost $C(Q) = ${Fx} + ${c}Q$ (the network costs ${Fx}; each unit served costs ${c}). The town needs ${Qt} units. Compare one firm serving everyone with ${n} identical firms that split the market equally (each builds its own network).`,
      plan: [
        plan('What makes this a natural monopoly?', `$AC = ${c} + ${Fx}/Q$ falls at every $Q$: spreading the network over more units lowers cost per unit`, [
          [`MC is constant at ${c}`, 'Constant MC alone is not enough: with no fixed cost, AC = MC and splitting the market would cost nothing extra.'],
          ['The firm could get a patent', 'A patent is a legal barrier. A natural monopoly is about costs.'],
          ['Demand for water is inelastic', 'Elasticity says how buyers respond to price. Natural monopoly is about the cost of supplying them.'],
        ], 'Large fixed cost plus constant MC gives AC falling forever. One network can serve everyone.'),
        plan(`How do you compare one firm with ${n} firms?`, `Total cost of serving the same ${Qt} units: $F + cQ$ versus $${n}F + cQ$`, [
          ['Compare marginal costs', `Both setups have MC = ${c}. The difference is how many times the fixed cost is paid.`],
          ['Compare the prices they would charge', 'No price is needed: the question is which setup produces the same output more cheaply.'],
          [`Compare AC at ${Qt} for one firm with AC at ${Qt} for each small firm`, `Each small firm makes only ${Qt / n} units, so its AC is evaluated at ${Qt / n}.`],
        ], `Each of the ${n} firms makes ${Qt / n} units and pays the full ${Fx} network cost.`),
      ],
      parts: [N('TC\\text{ one firm}', TC1), N('AC\\text{ one firm}', AC1), N(`TC\\text{ with ${n} firms}`, TCn), N('AC\\text{ each small firm}', ACn), N('\\text{extra cost of splitting}', TCn - TC1)],
      hints: [`One firm: $${Fx} + ${c}(${Qt})$. Each small firm: $${Fx} + ${c}(${Qt / n})$.`],
      sol: md`
        **Move 1: one firm.** $TC = ${Fx} + ${c}(${Qt}) = ${TC1}$, so $AC = ${TC1}/${Qt} = ${F(AC1)}$.

        **Move 2: ${n} firms.** Each makes ${Qt / n} units: $TC_i = ${Fx} + ${c}(${Qt / n}) = ${Fx + c * Qt / n}$, $AC_i = ${F(ACn)}$. Together: $${n} \times ${Fx + c * Qt / n} = ${TCn}$.

        **Move 3: compare.** Splitting costs $${TCn} - ${TC1} = ${TCn - TC1} = ${n - 1} \times ${Fx}$ more: the network is built ${n - 1} extra time${n - 1 > 1 ? 's' : ''}. That is why the market is a natural monopoly, and why regulators keep one firm and control its price instead of breaking it up.
      `,
    };
  });

  // ------------------------------------------------------------------ figures, lesson 5
  const regBase = [
    { f: (x) => 28 - x, from: 0, to: 28, lab: 'D', labX: 26.5, anchor: 'bl', dx: 4, dy: -2 },
    { f: ACw, from: 2.75, to: 29.5, cls: 'c3', lab: 'AC', labX: 29.5, anchor: 'bl', dx: -6, dy: -8 },
    { seg: [[0, 4], [30, 4]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
  ];
  const regFig = EC.graph({
    w: 340, h: 280, x: [0, 30], y: [0, 30], xl: 'Q', yl: '\\$', xt: [4, 12, 20, 24], yt: [4, 8, 16, 24],
    items: [
      ...regBase,
      { f: (x) => 28 - 2 * x, from: 0, to: 14, cls: 'c4 dash', lab: 'MR', labX: 14, anchor: 'bl', dx: 3, dy: -3 },
      { pt: [12, 16], lab: '\\text{M: no rule}', at: 'tr', guide: true }, { pt: [20, 8], lab: 'P = AC', at: 'tr', guide: true },
      { pt: [24, 4], lab: 'P = MC', at: 'br', guide: 'x' }, { pt: [4, 24], lab: '\\text{other root}', at: 'tr', guide: true },
    ],
  });
  const dwlRegFig = EC.graph({
    w: 330, h: 260, x: [0, 30], y: [0, 30], xl: 'Q', yl: '\\$', xt: [12, 20, 24], yt: [4, 8, 16],
    items: [
      { poly: [[12, 16], [24, 4], [12, 4]], cls: 'loss' }, { poly: [[20, 8], [24, 4], [20, 4]], cls: 'loss' },
      ...regBase,
      { pt: [12, 16], guide: true }, { pt: [20, 8], guide: true }, { pt: [24, 4], guide: 'x' },
      { text: [15.5, 8], t: '72' }, { text: [21.4, 5.4], t: '8' },
    ],
  });
  const mcLossFig = EC.graph({
    w: 330, h: 260, x: [0, 30], y: [0, 30], xl: 'Q', yl: '\\$', xt: [24], yt: [4, [ACw(24), '7.33']],
    items: [
      { poly: [[0, 0], [24, 0], [24, 4], [0, 4]], cls: 'ex' }, { poly: [[0, 4], [24, 4], [24, ACw(24)], [0, ACw(24)]], cls: 'loss' },
      ...regBase,
      { pt: [24, 4], guide: 'x' }, { pt: [24, ACw(24)], guide: 'y' },
      { text: [12, 2], t: 'TR = 96' }, { text: [12, 5.67], t: '\\text{loss} = 80' },
    ],
  });
  const ceilFig = EC.graph({
    w: 330, h: 260, x: [0, 30], y: [0, 30], xl: 'Q', yl: '\\$', xt: [12, 20], yt: [4, 8, 16],
    items: [
      { f: (x) => 28 - x, from: 0, to: 28, cls: 'dim', lab: 'D', labX: 4, anchor: 'bl', dx: 4, dy: -2 },
      { f: (x) => 28 - 2 * x, from: 0, to: 14, cls: 'dim dash', lab: '\\text{old } MR', labX: 11, anchor: 'tr', dx: -4, dy: 4 },
      { pts: [[0, 8], [20, 8], [28, 0]], cls: 'curve c2', lab: '\\text{firm’s demand}', labI: 2, anchor: 'bl', dx: -8, dy: -16 },
      { seg: [[0, 8], [20, 8]], cls: 'curve c4', lab: 'MR = \\bar P = 8', at: 0.05, anchor: 'bl', dx: 0, dy: -6 },
      { seg: [[20, 8], [20, 0]], cls: 'curve c4 dash' },
      { seg: [[0, 4], [30, 4]], cls: 'curve c5', lab: 'MC', at: 'end', anchor: 'br', dx: -2, dy: -4 },
      { pt: [20, 8], lab: 'Q = 20', at: 'tr' },
    ],
  });

  // ------------------------------------------------------------------ generators, lesson 5
  // P = a - bQ, C = F + cQ with P = AC roots r1 < r2: a - c = b(r1 + r2), F = b r1 r2. Then Qm = (r1 + r2)/2, P_AC = c + b r1.
  const regDraw = () => {
    const b = pick([1, 2]), r1 = pick([2, 4, 5, 6, 8, 10]), r2 = r1 + 2 * pick([3, 4, 5, 6, 8]), c = pick([2, 4, 5, 6, 10]);
    const a = c + b * (r1 + r2), Fx = b * r1 * r2, Qm = (r1 + r2) / 2, Pm = a - b * Qm, Qe = r1 + r2;
    return { b, r1, r2, c, a, Fx, Qm, Pm, Qe, Pac: c + b * r1, piM: b * (r2 - r1) ** 2 / 4, dwlM: b * Qe * Qe / 8, dwlAC: b * r1 * r1 / 2 };
  };
  gen('m3_rg_regulate', () => {
    const { b, r1, r2, c, a, Fx, Qm, Pm, Qe, Pac, dwlM, dwlAC } = regDraw();
    const disc = (a - c) ** 2 - 4 * b * Fx, sq = Math.sqrt(disc);
    return {
      title: 'Regulate a natural monopoly: P = MC, then P = AC',
      q: md`A natural monopoly faces $P = ${dem(a, b)}$ and has $C(Q) = ${Fx} + ${c}Q$. Unregulated, it sells ${Qm} at \$${Pm}. (a) Regulators set a price ceiling at $P = MC$: find quantity and profit, and say what happens in the long run. (b) They set the ceiling at $P = AC$ instead: find quantity, price, and the remaining deadweight loss.`,
      plan: [
        plan('Under the $P = MC$ ceiling, what is profit, before computing anything?', `$-F = -${Fx}$: every unit covers its MC, nothing pays for the network`, [
          ['Zero, as in a competitive market', 'Competitive firms earn zero at $P = MC$ only where MC meets the bottom of AC. Here MC is below AC everywhere.'],
          ['Positive: it is still a monopoly', 'The ceiling removes the markup entirely.'],
          ['It depends on demand', `$\\pi = (P - AC)Q = (c - c - F/Q)Q = -F$ for any $Q$.`],
        ], `$Q$ from demand at $P = ${c}$; $\\pi = -${Fx}$; without a subsidy of ${Fx} the firm exits in the long run.`),
        plan('How do you find the $P = AC$ outcome?', 'Set demand equal to AC, multiply by $Q$, solve the quadratic, take the larger root', [
          ['Set $MR = AC$', 'The ceiling is a price consumers pay, so it must be on the demand curve: $P(Q) = AC(Q)$.'],
          ['Find the minimum of AC', 'AC = F/Q + c falls forever; it has no minimum.'],
          ['Solve the quadratic and take the smaller root', 'The smaller root is a high price, above the unregulated monopoly price: that ceiling would not even bind.'],
        ], `$${dem(a, b)} = ${c} + ${Fx}/Q \\Rightarrow ${b === 1 ? '' : b}Q^2 - ${a - c}Q + ${Fx} = 0$. Roots ${r1} and ${r2}; take ${r2}.`),
      ],
      parts: [N('Q\\text{ at }P = MC', Qe), N('\\pi\\text{ at }P = MC', -Fx),
        FIX('In the long run under the $P = MC$ ceiling, without a subsidy, the firm…', ['exits', 'stays, earning zero', 'stays, earning a profit'], 0, [null, `Profit is $-${Fx}$, not zero.`, 'Price equals MC, below AC: a loss.']),
        N('Q\\text{ at }P = AC', r2), N('P\\text{ at }P = AC', Pac), N('\\text{DWL at }P = AC', dwlAC)],
      hints: [`Multiply $${dem(a, b)} = ${c} + \\dfrac{${Fx}}{Q}$ through by $Q$.`, `Efficient output: $${dem(a, b)} = ${c} \\Rightarrow Q^e = ${Qe}$.`],
      sol: md`
        **Move 1: $P = MC$ ceiling.** $MC = ${c}$, so $P = ${c}$ and $Q = (${a} - ${c})/${b} = ${Qe}$ from demand.
        $$\pi = ${c}(${Qe}) - [${Fx} + ${c}(${Qe})] = -${Fx}$$
        Long run: a loss equal to the fixed cost, so the firm exits unless the government pays a subsidy of ${Fx}. Efficient (DWL = 0) but not self-financing.

        **Move 2: $P = AC$ ceiling.** Demand equals AC:
        $$${dem(a, b)} = ${c} + \frac{${Fx}}{Q}$$
        Multiply by $Q$: $${a}Q - ${cq(b, 'Q^2')} = ${c}Q + ${Fx}$. Move everything to one side:
        $$${cq(b, 'Q^2')} - ${a - c}Q + ${Fx} = 0$$

        **Move 3: quadratic formula.**
        $$Q = \frac{${a - c} \pm \sqrt{${a - c}^2 - 4(${b})(${Fx})}}{2(${b})} = \frac{${a - c} \pm \sqrt{${disc}}}{${2 * b}} = \frac{${a - c} \pm ${sq}}{${2 * b}}$$
        So $Q = ${r2}$ or $Q = ${r1}$. Take the **larger** root, $Q = ${r2}$: the lowest price that still covers cost. (The smaller root means $P = ${a - b * r1}$, above the monopoly price ${Pm}.)

        **Move 4: price and profit.** $P = ${a} - ${b === 1 ? '' : b}(${r2}) = ${Pac}$. Check: $AC(${r2}) = ${c} + ${Fx}/${r2} = ${Pac}$ ✓, so $\pi = 0$: the firm stays.

        **Move 5: remaining DWL** between demand and MC from ${r2} to ${Qe}:
        $$\text{DWL} = \tfrac12(${Qe} - ${r2})(${Pac} - ${c}) = ${F(dwlAC)}$$
        Unregulated it was $\tfrac12(${Qe} - ${Qm})(${Pm} - ${c}) = ${F(dwlM)}$.
      `,
    };
  });

  gen('m3_rg_ceiling', () => {
    const { b, r2, c, a, Fx, Qm, Pm, Qe, Pac } = regDraw();
    const kind = pick(['bind', 'bind', 'none', 'loss']);
    const Qbar = kind === 'bind' ? ri(Qm + 1, r2 - 1) : kind === 'loss' ? ri(r2 + 1, Qe - 1) : null;
    const Pbar = kind === 'none' ? Pm + pick([2, 4, 6]) : a - b * Qbar;
    const Q = kind === 'none' ? Qm : Qbar, Pq = kind === 'none' ? Pm : Pbar;
    const pi = (Pq - c) * Q - Fx, dwl = 0.5 * (Qe - Q) * (Pq - c);
    return {
      title: 'A price ceiling on a natural monopoly',
      q: md`A natural monopoly faces $P = ${dem(a, b)}$ and has $C(Q) = ${Fx} + ${c}Q$. A regulator caps the price at \$${Pbar}. Find the quantity sold, the firm's profit, and the deadweight loss, and say whether the firm stays in the long run without a subsidy.`,
      plan: [
        plan('How do you find the quantity under the ceiling?', 'Compare the ceiling with the unregulated monopoly price; if it binds, $Q$ comes from demand at the ceiling', [
          ['$Q$ from MC at the ceiling price', 'That is a competitive supply idea. MC is flat here; the monopolist sells all that consumers want at the ceiling, as long as the ceiling is above MC.'],
          ['$Q$ from $MR = MC$ as usual', 'A binding ceiling makes MR flat at the ceiling up to the demand curve, so the old MR = MC point no longer applies.'],
          ['$Q$ from AC at the ceiling', 'AC tells you about profit, not how much is sold.'],
        ], kind === 'none' ? `Unregulated: $${F(a)} - ${cq(2 * b)} = ${c} \\Rightarrow Q = ${Qm}$, $P = ${Pm}$. The cap of ${Pbar} is above ${Pm}: it does not bind.` : `Unregulated price is ${Pm}; the cap ${Pbar} is below it, so it binds: $Q = (${a} - ${Pbar})/${b} = ${Q}$.`),
        plan('How do you decide whether the firm stays in the long run?', 'The sign of economic profit: $\\pi \\ge 0$ stays, $\\pi < 0$ exits without a subsidy', [
          ['Whether $P \\ge MC$', 'Covering MC covers variable cost only: enough to operate in the short run, not to stay forever.'],
          ['Whether $P \\ge \\min AVC$', 'That is the short-run shutdown test.'],
          ['Whether DWL is positive', 'DWL is about society’s surplus, not the firm’s decision.'],
        ], `$\\pi = (P - ${c})Q - ${Fx}$.`),
      ],
      parts: [N('Q', Q), N('\\pi', pi), N('\\text{DWL}', dwl),
        FIX('Long run, without a subsidy, the firm…', ['stays', 'exits'], pi >= 0 ? 0 : 1, pi >= 0 ? [null, 'Profit is not negative, so it covers all costs.'] : ['Profit is negative: revenue does not cover the network cost.', null])],
      hints: [`Unregulated: $MR = ${F(a)} - ${cq(2 * b)} = ${c}$ gives $Q = ${Qm}$, $P = ${Pm}$. Efficient: $Q^e = ${Qe}$.`],
      sol: md`
        **Move 1: does it bind?** Unregulated, $${F(a)} - ${cq(2 * b)} = ${c} \Rightarrow Q = ${Qm}$, $P = ${Pm}$. ${kind === 'none' ? `The cap \\$${Pbar} is **above** \\$${Pm}, so it does not bind: the firm keeps $Q = ${Qm}$, $P = ${Pm}$.` : `The cap \\$${Pbar} is below \\$${Pm}, so it binds. Up to the demand curve, each unit sells for exactly \\$${Pbar}: MR is flat at ${Pbar}, above MC = ${c}. The firm sells all that consumers want: $Q = (${a} - ${Pbar})/${b} = ${Q}$.`}

        **Move 2: profit.** $\pi = ${Pq}(${Q}) - [${Fx} + ${c}(${Q})] = ${F(Pq * Q)} - ${F(Fx + c * Q)} = ${F(pi)}$. ${pi >= 0 ? 'Not negative: the firm stays.' : `Negative: the cap is below AC (the AC price is \\$${Pac}), so without a subsidy the firm exits in the long run.`}

        **Move 3: DWL** against $Q^e = ${Qe}$ (where $P = MC$):
        $$\text{DWL} = \tfrac12(${Qe} - ${Q})(${Pq} - ${c}) = ${F(dwl)}$$
      `,
    };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3u6', exam: 'm3', num: 'Part 12', title: 'Monopoly taxes and regulation',
    blurb: 'Specific and ad valorem taxes on a monopoly, pass-through, natural monopoly, P = MC vs P = AC price ceilings',
    lessons: [
      // ================================================================ lesson 1
      {
        id: 'm3-mt1', title: 'A specific tax on a monopoly', ref: 'Lecture 19 · Perloff ch. 11 · DS10',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "a specific (per-unit) tax of \$t on the monopolist" | what does the firm keep per unit now? | $P_p = P(Q) - t$, so set $MR(Q) - t = MC$ |
            | "a per-unit tax collected from consumers" | does it matter who pays? | no: same $Q$, same $P_c$, same $P_p$ |
            | "effective demand", "effective MR" | the curves as the firm sees them | $P(Q) - t$ and $MR(Q) - t$ |
            | "price consumers pay", "price the monopolist receives" | the two sides of the wedge | $P_c = P(Q^t)$ from demand, then $P_p = P_c - t$ |
            | "tax revenue" | the rectangle between the two prices | $G = (P_c - P_p)Q^t = tQ^t$ |
            | "after-tax deadweight loss" | lost surplus against the efficient point | triangle between demand and MC from $Q^t$ to $Q^e$ (where $P = MC$) |
            | "how much DWL does the tax add?" | compare with the untaxed monopoly | after-tax DWL minus untaxed DWL |

            By the end of this page you should see "per-unit tax" and "monopoly" in one problem and write $MR(Q) - t = MC$ before reading any numbers.

            Notation for the whole Part: $Q^m$ = untaxed monopoly output, $Q^t$ = output with the tax, $Q^e$ = efficient output (where $P = MC$), $P_c$ = price consumers pay, $P_p$ = price the producer keeps, $t$ = tax per unit, $G$ = government tax revenue.
          `),
          R(md`
            ### The story: one ski lift on the mountain

            A ski resort owns the only lift on the mountain. Daily demand for lift passes is
            $$P = 100 - Q$$
            ($Q$ in hundreds of passes; we will just call them units). Each extra skier costs the resort \$20 in grooming, staff and power: $MC = 20$, constant, and we ignore fixed cost.

            **No tax first (Part 11).** Revenue is $TR = PQ = (100 - Q)Q$, so marginal revenue is
            $$MR = \frac{dTR}{dQ} = 100 - 2Q$$
            Set $MR = MC$:
            $$100 - 2Q = 20 \;\Rightarrow\; 2Q = 80 \;\Rightarrow\; Q^m = 40$$
            Then the price from demand: $P^m = 100 - 40 = 60$. That is the [monopoly routine](#/l/m3-mo2): $MR = MC$ for the quantity, then demand for the price.
          `),
          R(md`
            ### What a per-unit tax does to the firm

            Now the county charges \$20 for every pass sold. The resort collects the price from each skier, sends \$20 to the county, and keeps the rest.

            Two prices now exist. Skiers pay $P_c$. The resort keeps $P_p$. The tax sits between them:
            $$P_c - P_p = t$$

            Ask the resort's question: **if I sell $Q$ passes, how much do I keep per pass?** Skiers still decide how many passes to buy from the price they pay, so to sell $Q$ passes the price skiers pay must be the demand price, $P_c = 100 - Q$. The resort keeps \$20 less:
            $$P_p = (100 - Q) - 20 = 80 - Q$$

            That is the **effective demand**: the demand curve as the firm sees it. In general
            $$P_p(Q) = P(Q) - t$$
            Every point of demand slides straight down by $t$. Consumers did not change their minds; the firm just keeps less of each sale.
          `),
          R(md`
            ### Effective MR, one step at a time

            The firm's own revenue is what it keeps per unit times the number of units:
            $$TR_{\text{firm}} = \big(P(Q) - t\big)Q = P(Q)Q - tQ = TR(Q) - tQ$$

            Differentiate term by term. The derivative of $TR(Q)$ is $MR(Q)$; the derivative of $tQ$ is $t$:
            $$\text{effective } MR = MR(Q) - t$$

            Each extra unit now brings the firm \$$t$ less than before. Profit is largest where the next unit just pays for itself:
            $$MR(Q) - t = MC(Q)$$

            !!key Two ways to see the same equation
              **Demand side:** the firm's demand and MR shift down by $t$: $MR - t = MC$.

              **Cost side:** treat the tax as an extra cost of $t$ per unit, so cost becomes $C(Q) + tQ$ and marginal cost becomes $MC + t$: $MR = MC + t$.

              Move $t$ across the equals sign and they are the same equation. Use whichever feels natural.

            !!method The specific-tax routine
              **Move 1.** Effective MR: $MR(Q) - t$. (For $P = a - bQ$ this is $a - 2bQ - t$.)

              **Move 2.** Set $MR(Q) - t = MC$ and solve for $Q^t$.

              **Move 3.** $P_c = P(Q^t)$ from the **original** demand. Then $P_p = P_c - t$.

              **Move 4.** Revenue $G = tQ^t$. Profit $\pi = P_pQ^t - C(Q^t)$.
          `),
          RF(md`
            ### Worked example 1: the ski resort with a \$20 tax

            **Move 1: effective MR.** $MR - t = 100 - 2Q - 20 = 80 - 2Q$. (Same as differentiating effective revenue $(80 - Q)Q$.)

            **Move 2: set it equal to MC.**
            $$80 - 2Q = 20$$
            Subtract 20 from both sides and add $2Q$:
            $$60 = 2Q \;\Rightarrow\; Q^t = 30$$

            **Move 3: the two prices.** Skiers pay the demand price at 30 units:
            $$P_c = 100 - 30 = 70$$
            The resort keeps $P_p = 70 - 20 = 50$. Check with effective demand: $80 - 30 = 50$. ✓

            **Move 4: revenue and profit.** $G = 20 \times 30 = 600$. Profit $= (P_p - MC)Q = (50 - 20)(30) = 900$, down from $(60 - 20)(40) = 1600$.

            [[fig:tax]]

            !!intuition Does this make sense?
              The tax is \$20, but the skiers' price rose only \$10 (60 to 70), and the resort's price fell \$10 (60 to 50). The monopolist was already choosing the best price; raising it a full \$20 would chase away too many skiers. With linear demand and constant MC the split is exactly half and half. The [pass-through lesson](#/l/m3-mt3) explains why.

            !!trap $P_c$ comes from the original demand
              Plugging $Q^t$ into the **effective** demand gives $P_p$, not $P_c$. Consumers pay what the real demand curve says.
          `, { tax: { svg: taxFig, cap: 'Specific tax t = 20. The firm sees demand and MR shifted down by 20 (dashed). It sells Q^t = 30, where MR − t meets MC. Consumers pay 70, the firm keeps 50. Gray: revenue G = 20 × 30. Blue: CS. Green: PS. Red: DWL against the efficient Q^e = 80.' } }),
          Q(md`A \$$t$ specific tax is imposed on a monopolist. As the firm sees it, the tax…`, ['shifts its demand and its MR down by $t$', 'shifts demand down by $t$ but leaves MR alone', 'rotates demand down around the quantity intercept', 'shifts the consumers’ demand curve to the left'], 0,
            [null, 'MR comes from the demand the firm faces. If every price it keeps drops by t, every unit’s marginal revenue drops by t too.', 'That is what an ad valorem (percent) tax does. A per-unit tax takes the same dollars from every unit: a parallel shift.', 'Consumers value passes exactly as before; their demand curve does not move. Only what the firm keeps changes.'],
            md`Effective demand $P(Q) - t$, effective MR $MR(Q) - t$: both slide down by $t$, parallel.`),
          Q(md`After a specific tax, you found $Q^t$. To get the price **consumers pay**, plug $Q^t$ into…`, ['the original demand curve', 'the effective demand curve', 'the MR curve', 'the MC curve'], 0,
            [null, 'That gives what the firm keeps, $P_p = P_c - t$.', 'MR is not a price anyone pays.', 'MC is the cost of the last unit, not a price here: a monopolist charges above MC.'],
            md`$P_c = P(Q^t)$. Then $P_p = P_c - t$.`),
          Q(md`A monopolist with linear demand and constant MC is taxed \$$t$ per unit. Compared with no tax, output…`, ['falls', 'rises', 'stays the same', 'could go either way'], 0,
            [null, 'The tax lowers the marginal revenue the firm keeps, so fewer units pass the MR = MC test.', 'A monopolist does not absorb a tax by keeping output fixed: MR − t = MC is reached at a smaller Q.', 'Effective MR is lower at every Q, and MR slopes down, so the crossing with MC moves left.'],
            md`Effective MR is below MR everywhere, so it meets MC at a smaller $Q$. Smaller $Q$ means a higher $P_c$.`),
          Q(md`A \$5 tax per unit is collected from a monopolist's customers instead of from the monopolist. Compared with taxing the firm, the price consumers pay in total…`, ['is the same', 'is \\$5 higher', 'is \\$5 lower', 'is higher by half the tax'], 0,
            [null, 'The posted price changes, but the all-in price is the same: either way the firm keeps $P(Q) - 5$ when it sells $Q$.', 'Consumers do not pay the tax twice.', 'The firm’s problem is identical, so nothing about the outcome changes.'],
            md`Legal liability does not determine incidence. In both cases the firm faces effective demand $P(Q) - t$, so it picks the same $Q$, and $P_c$ and $P_p$ are the same.`),
          Q(md`Tax revenue from a \$$t$ specific tax on a monopolist is…`, ['$t$ times the after-tax quantity', '$t$ times the untaxed quantity', '$P_c$ times the after-tax quantity', '$(P_c - MC)$ times the after-tax quantity'], 0,
            [null, 'The tax is paid only on units actually sold, and fewer are sold after the tax.', 'That is total spending by consumers.', 'That mixes the firm’s margin with the tax.'],
            md`$G = (P_c - P_p)Q^t = tQ^t$: the gray rectangle, height $t$, width $Q^t$.`),
          R(md`
            ### Who pays the tax legally does not matter

            Suppose the county instead collects the \$20 from skiers at a kiosk. Now the resort posts its own price $P_p$ and skiers pay $P_p + 20$ in total.

            Skiers buy $Q$ passes when the total they pay equals their demand price:
            $$P_p + 20 = 100 - Q \;\Rightarrow\; P_p = 80 - Q$$

            That is **exactly** the effective demand from before. Same curve, same MR, same $Q^t = 30$.

            | | Tax collected from the resort | Tax collected from skiers |
            |---|---|---|
            | Posted price | 70 | 50 |
            | Skiers pay in total, $P_c$ | 70 | 50 + 20 = 70 |
            | Resort keeps, $P_p$ | 70 − 20 = 50 | 50 |
            | Passes sold | 30 | 30 |

            !!key Legal liability does not determine incidence
              Only the wedge matters. Whoever writes the check, the firm ends up facing $P(Q) - t$, so $Q$, $P_c$ and $P_p$ come out the same. The **economics** (demand and cost) decides who bears the tax.
          `),
          RF(md`
            ### Welfare: before, after, change

            The benchmark for every deadweight loss is the **efficient** output, where price equals marginal cost (what a competitive market would do):
            $$100 - Q = 20 \;\Rightarrow\; Q^e = 80$$

            Each area is a triangle or a rectangle. Recall the formula sheet: CS is under demand and above $P_c$; PS is above MC and below $P_p$; $G$ is the wedge rectangle.

            | | Before (no tax) | After ($t = 20$) | Change |
            |---|---|---|---|
            | CS | $\tfrac12(40)(100 - 60) = 800$ | $\tfrac12(30)(100 - 70) = 450$ | $-350$ |
            | PS | $(60 - 20)(40) = 1600$ | $(50 - 20)(30) = 900$ | $-700$ |
            | $G$ | 0 | $20 \times 30 = 600$ | $+600$ |
            | $W$ = CS + PS + G | 2400 | 1950 | $-450$ |
            | DWL (against $Q^e = 80$) | $\tfrac12(80 - 40)(60 - 20) = 800$ | $\tfrac12(80 - 30)(70 - 20) = 1250$ | $+450$ |

            Check: the efficient total is $\tfrac12(80)(100 - 20) = 3200$, and $2400 + 800 = 1950 + 1250 = 3200$. ✓

            [[fig:extra]]

            !!key Two different DWL numbers: read the question
              **"After-tax DWL"** is the whole triangle against the efficient point: 1250.

              **"The DWL caused by the tax"** (or "how much does DWL increase") is after minus before: $1250 - 800 = 450$. It is the trapezoid between $Q^t = 30$ and $Q^m = 40$: $\tfrac12\big[(70 - 20) + (60 - 20)\big](10) = 450$.

            !!intuition Taxing a market that already produces too little hurts more
              Put the same \$20 tax on a competitive market with this demand and $MC = 20$: output falls from 80 to 60 and DWL is $\tfrac12(20)(20) = 200$. On the monopoly the tax adds 450. The units the monopoly gives up (30 to 40) were each worth \$40 to \$50 more to skiers than they cost to provide; the competitive units near 80 were worth almost nothing extra.
          `, { extra: { svg: extraFig, cap: 'Total after-tax DWL = 1250 (all red, from Q^t = 30 to Q^e = 80). The monopoly already caused 800 (from 40 to 80). The tax adds the darker trapezoid, 450.' } }),
          Q(md`A question asks for "the after-tax deadweight loss" of a taxed monopoly. You measure it against…`, ['the efficient output, where $P = MC$', 'the untaxed monopoly output', 'the output where effective demand meets MC', 'zero output'], 0,
            [null, 'That gives only the extra DWL from the tax, not the total.', 'That point has no welfare meaning; the benchmark uses the real demand and the real MC.', 'DWL is lost surplus relative to the best possible outcome, which is $P = MC$.'],
            md`Total after-tax DWL: triangle between demand and MC from $Q^t$ to $Q^e$. The extra DWL from the tax: after minus before.`),
          R(md`
            ### Worked example 2: rising marginal cost

            Demand $P = 120 - Q$, marginal cost $MC = Q$ (so variable cost is $VC = \tfrac12 Q^2$, the area under MC), and a \$30 per-unit tax.

            **Untaxed (for comparison).** $MR = 120 - 2Q = Q \Rightarrow 3Q = 120 \Rightarrow Q^m = 40$, $P^m = 80$.

            **Move 1: effective MR.** $120 - 2Q - 30 = 90 - 2Q$.

            **Move 2: set it equal to MC.**
            $$90 - 2Q = Q \;\Rightarrow\; 90 = 3Q \;\Rightarrow\; Q^t = 30$$

            **Move 3: prices.** $P_c = 120 - 30 = 90$, $P_p = 90 - 30 = 60$.

            **Move 4: revenue and surplus.** $G = 30 \times 30 = 900$. $CS = \tfrac12(30)(120 - 90) = 450$. $PS = P_pQ - VC = 60(30) - \tfrac12(30)^2 = 1800 - 450 = 1350$.

            **Move 5: DWL.** Efficient: $120 - Q = Q \Rightarrow Q^e = 60$. MC at $Q^t$ is 30, so
            $$\text{DWL}_{\text{after}} = \tfrac12(60 - 30)(90 - 30) = 900$$
            Before the tax it was $\tfrac12(60 - 40)(80 - 40) = 400$, so the tax adds 500.

            !!intuition Does this make sense?
              The consumer price rose by \$10 on a \$30 tax: one third. With rising MC, cutting output also saves the firm cost, so it lets output fall further and holds the price down. Less of the tax reaches consumers than the one half with flat MC.
          `),
          R(md`
            ### Spot it: no numbers needed

            Each card below is only a plan question. Decide, then read why.
          `),
          P({ q: md`A monopolist has $MR = 200 - 4Q$ and $MC = 40$. A \$20 per-unit tax is collected from **consumers**.`,
            plan: plan('Which equation gives the after-tax output?', '$200 - 4Q - 20 = 40$', [
              ['$200 - 4Q = 40$, since the firm does not pay the tax', 'Legal liability does not matter: the firm keeps $P(Q) - 20$ whoever writes the check.'],
              ['$P(Q) - 20 = 40$', 'That is the competitive rule (price equals cost). A monopolist uses MR.'],
              ['$200 - 4Q = 40 - 20$', 'The tax raises the firm’s cost per unit; it does not lower it.'],
            ], '$MR - t = MC$: $180 - 4Q = 40 \\Rightarrow Q = 35$.') }),
          P({ q: md`Demand is $P = 100 - Q$, the tax is \$20 per unit, and you found $Q^t = 30$.`,
            plan: plan('What do consumers pay?', 'Plug 30 into the original demand: $P_c = 70$', [
              ['Plug 30 into effective demand: $80 - 30 = 50$', 'Effective demand gives $P_p$, what the firm keeps.'],
              ['Untaxed price plus the tax: $60 + 20 = 80$', 'That assumes full pass-through. The monopolist absorbed half the tax.'],
              ['$MC + t = 40$', 'That is the competitive answer with flat supply. A monopolist prices above cost.'],
            ], '$P_c = P(Q^t) = 70$, then $P_p = 70 - 20 = 50$.') }),
          P({ q: md`The question says: "By how much does the tax **increase** deadweight loss relative to the unregulated, untaxed monopoly?"`,
            plan: plan('What do you compute?', 'After-tax DWL minus the untaxed monopoly DWL', [
              ['The after-tax triangle from $Q^t$ to $Q^e$', 'That is the total after-tax DWL, which includes the loss the monopoly caused before any tax.'],
              ['$\\tfrac12 \\cdot t \\cdot (Q^m - Q^t)$', 'That competitive shortcut is too small here: on the lost units demand sits more than $t$ above MC.'],
              ['Tax revenue', 'Revenue is a transfer to the government, not a loss.'],
            ], 'Two triangles against $Q^e$, then subtract. Or the trapezoid between $Q^t$ and $Q^m$.') }),
          P({ q: md`A monopolist sold 40 units before a \$10 tax and 35 units after.`,
            plan: plan('What is tax revenue?', '$10 \\times 35 = 350$', [
              ['$10 \\times 40 = 400$', 'Tax is collected only on units actually sold after the tax.'],
              ['$10 \\times (40 - 35) = 50$', 'That counts the lost units, which pay no tax at all.'],
              ['$P_c \\times 35$', 'That is what consumers spend in total, not what the government collects.'],
            ], '$G = tQ^t$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Ski resort, \\$10 tax', q: md`Demand $P = 100 - Q$, $MC = 20$, no fixed cost. The county charges \$10 per pass.`,
            plan: [
              plan('First equation?', '$100 - 2Q - 10 = 20$', [
                ['$100 - Q - 10 = 20$', 'That sets effective demand equal to MC, the competitive rule.'],
                ['$100 - 2Q = 30 - 10$', 'The tax adds to the firm’s cost: $MR = MC + t = 30$.'],
                ['$100 - 2Q = 20$', 'That is the untaxed monopoly. The tax changes what the firm keeps.'],
              ], '$90 - 2Q = 20 \\Rightarrow Q = 35$.'),
              plan('Against what output do you measure DWL?', 'The efficient $Q^e = 80$, where $100 - Q = 20$', [
                ['The untaxed $Q^m = 40$', 'That would give only the extra DWL from the tax.'],
                ['$Q = 90$, where effective demand hits zero', 'Not a welfare benchmark.'],
                ['$Q = 50$, where MR = 0', 'That maximizes revenue, not surplus.'],
              ], 'DWL triangle: base $80 - Q^t$, height $P_c - MC$.'),
            ],
            parts: [N('Q^t', 35), N('P_c', 65), N('P_p', 55), N('G', 350), N('\\pi', 1225), N('\\text{DWL}_{\\text{after}}', 1012.5)],
            sol: md`
              **Move 1.** $90 - 2Q = 20 \Rightarrow 2Q = 70 \Rightarrow Q^t = 35$.

              **Move 2.** $P_c = 100 - 35 = 65$; $P_p = 65 - 10 = 55$.

              **Move 3.** $G = 10 \times 35 = 350$. $\pi = (55 - 20)(35) = 1225$.

              **Move 4.** $\text{DWL} = \tfrac12(80 - 35)(65 - 20) = \tfrac12(45)(45) = 1012.5$. (Untaxed it was 800, so this tax adds 212.5.)
            ` }),
          P({ title: 'DS10 demand with a specific tax', q: md`DS10: $P = 500 - 2Q$, $MC = Q$. Untaxed, $Q^m = 100$, $P^m = 300$, DWL $= 6666.67$. Now impose a specific tax of \$50 per unit.`,
            plan: plan('First equation?', '$500 - 4Q - 50 = Q$', [
              ['$500 - 2Q - 50 = Q$', 'That uses effective demand, not effective MR. A monopolist sets MR = MC.'],
              ['$500 - 4Q = Q + 50Q$', 'The tax adds \\$50 per unit to cost, not 50 times the quantity to MC.'],
              ['$0.5(500 - 4Q) = Q$', 'That treats 50 as a percent: an ad valorem tax. This tax is \\$50 per unit.'],
            ], '$450 - 4Q = Q \\Rightarrow 5Q = 450 \\Rightarrow Q = 90$.'),
            parts: [N('Q^t', 90), N('P_c', 320), N('P_p', 270), N('G', 4500), N('\\text{DWL}_{\\text{after}}', 8816.67), N('\\text{extra DWL}', 2150)],
            sol: md`
              **Move 1.** $450 - 4Q = Q \Rightarrow Q^t = 90$.

              **Move 2.** $P_c = 500 - 2(90) = 320$; $P_p = 320 - 50 = 270$. $G = 50 \times 90 = 4500$.

              **Move 3.** Efficient $Q^e = 500/3 = 166.67$ (where $500 - 2Q = Q$). MC at 90 is 90.
              $$\text{DWL}_{\text{after}} = \tfrac12(166.67 - 90)(320 - 90) = \tfrac12(76.67)(230) = 8816.67$$

              **Move 4.** Extra: $8816.67 - 6666.67 = 2150$.
            ` }),
          P({ title: 'A tax on consumers', q: md`$P = 60 - 2Q$, $MC = 12$. An \$8 per-unit tax is collected **from consumers** at the register.`,
            plan: plan('Does collecting from consumers change the firm’s equation?', 'No: it still sets $MR(Q) - 8 = MC$', [
              ['Yes: the firm sets $MR = MC$ and consumers pay 8 on top', 'Consumers buy fewer units at the higher all-in price, so the firm’s effective demand is $P(Q) - 8$ anyway.'],
              ['Yes: the firm sets $MR = MC - 8$', 'The tax never lowers the firm’s cost.'],
              ['Yes: the firm sets $P = MC$', 'It is still a monopolist.'],
            ], '$60 - 4Q - 8 = 12 \\Rightarrow 4Q = 40 \\Rightarrow Q = 10$.'),
            parts: [N('Q^t', 10), N('P_c', 40), N('P_p', 32), N('G', 80),
              FIX('If the tax were collected from the firm instead, $P_c$ would be…', ['the same', '8 higher', '8 lower'], 0, [null, 'Same effective demand, same Q, same prices.', 'Same effective demand, same Q, same prices.'])],
            sol: md`
              **Move 1.** Effective MR $= 60 - 4Q - 8 = 52 - 4Q$. Set equal to 12: $Q^t = 10$.

              **Move 2.** $P_c = 60 - 20 = 40$ (all-in, what consumers pay). $P_p = 32$ (the posted price the firm keeps). $G = 8 \times 10 = 80$.

              Untaxed it was $Q = 12$, $P = 36$: consumers pay \$4 more, the firm keeps \$4 less. Half each, whoever writes the check.
            ` }),
          P({ title: 'Welfare table', q: md`$P = 80 - Q$, $MC = 10$, no fixed cost. A \$10 per-unit tax.`,
            plan: plan('Which areas go into total welfare after the tax?', 'CS + PS + G; DWL is what is missing from the efficient total', [
              ['CS + PS only', 'Tax revenue is still surplus: it funds public spending. Leaving it out counts it as lost.'],
              ['CS + PS − G', 'G is a transfer to the government, not a cost to society.'],
              ['CS + PS + G + DWL', 'DWL is the surplus nobody gets; adding it gives the efficient total, not actual welfare.'],
            ], 'Find $Q^m$, $Q^t$ and $Q^e$ first; then each area is a triangle or a rectangle.'),
            parts: [N('CS_{\\text{after}}', 450), N('PS_{\\text{after}}', 900), N('G', 300), N('W_{\\text{after}}', 1650), N('\\text{DWL}_{\\text{after}}', 800), N('\\Delta W', -187.5)],
            sol: md`
              **Move 1: quantities.** No tax: $80 - 2Q = 10 \Rightarrow Q^m = 35$, $P = 45$. Tax: $70 - 2Q = 10 \Rightarrow Q^t = 30$, $P_c = 50$, $P_p = 40$. Efficient: $80 - Q = 10 \Rightarrow Q^e = 70$.

              **Move 2: after.** $CS = \tfrac12(30)(80 - 50) = 450$. $PS = (40 - 10)(30) = 900$. $G = 10 \times 30 = 300$. $W = 1650$. $\text{DWL} = \tfrac12(70 - 30)(50 - 10) = 800$.

              **Move 3: before.** $CS = \tfrac12(35)(35) = 612.5$, $PS = (45 - 10)(35) = 1225$, $W = 1837.5$, DWL $= \tfrac12(35)(35) = 612.5$.

              **Move 4: change.** $\Delta W = 1650 - 1837.5 = -187.5$ = the extra DWL ($800 - 612.5$). Efficient total $\tfrac12(70)(70) = 2450$ ✓ in both columns.
            ` }),
          G('m3_mt_specific', { need: 3 }),
          G('m3_mt_dwl', { need: 2 }),
        ],
      },
      // ================================================================ lesson 2
      {
        id: 'm3-mt2', title: 'An ad valorem tax; comparing it with a specific tax', ref: 'Lecture 19 · DS10 Q1(c)–(e)',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "a 40% ad valorem tax", "a sales tax of $v$ percent" | the firm keeps a **share** $1 - v$ of each dollar | $P_p = (1 - v)P_c$ |
            | "find the effective demand and effective MR" (DS10 Q1c) | multiply by $1 - v$ | $(1 - v)P(Q)$ and $(1 - v)MR(Q)$ |
            | "equilibrium quantity" (DS10 Q1d) | effective MR = MC | $(1 - v)MR(Q) = MC$ |
            | "price consumers pay, price the monopolist receives" | the two sides of the wedge | $P_c = P(Q^v)$, $P_p = (1 - v)P_c$ |
            | "tax revenue" | the wedge rectangle | $G = (P_c - P_p)Q^v = vP_cQ^v$ |
            | "after-tax deadweight loss" (DS10 Q1e) | lost surplus against $P = MC$ | triangle from $Q^v$ to $Q^e$ |
            | "a specific tax that yields the same output" | same $Q$, solve for $t$ | $t = MR(Q^v) - MC(Q^v) = v\,MR(Q^v)$ |
            | "which raises more revenue?" | per-unit take $vP_c$ versus $t$ | the ad valorem tax, since $P_c > MR$ |

            The one new idea: a percent tax **multiplies** what the firm keeps; a per-unit tax **subtracts** from it.
          `),
          R(md`
            ### From scratch: the firm keeps a share

            A state charges a 40% tax on the price of every sale. A customer pays \$100; the state takes \$40; the firm keeps \$60. In symbols, with $v$ the tax rate as a decimal ($v = 0.4$):
            $$P_p = (1 - v)P_c$$

            Same question as before: **if the firm sells $Q$ units, what does it keep per unit?** Customers pay the demand price $P(Q)$, and the firm keeps the share $1 - v$ of it:
            $$P_p(Q) = (1 - v)P(Q)$$
            That is the **effective demand** under an ad valorem tax.

            The firm's revenue is what it keeps per unit times units:
            $$TR_{\text{firm}} = (1 - v)P(Q)\,Q = (1 - v)\,TR(Q)$$

            The constant $(1 - v)$ comes straight out of the derivative:
            $$\text{effective } MR = (1 - v)\,MR(Q)$$

            Set it equal to marginal cost:
            $$(1 - v)\,MR(Q) = MC(Q)$$

            !!trap Do not subtract the percent
              $MR - 0.4 = MC$ treats a 40% tax as a 40-cent tax. A share **multiplies**: $0.6\,MR = MC$. And if you move it to the other side, divide: $MR = MC/0.6$, not $MR = 1.4\,MC$.
          `),
          RF(md`
            ### Shift versus pivot

            Take the ski resort demand, $P = 100 - Q$.

            - A \$20 **specific** tax: effective demand $80 - Q$. Every price drops by 20: a **parallel shift**.
            - A 50% **ad valorem** tax: effective demand $0.5(100 - Q) = 50 - 0.5Q$. High prices lose a lot (half of \$90 is \$45), low prices lose little (half of \$4 is \$2), and at $P = 0$ there is nothing to tax. The curve **pivots** down around the quantity intercept, $Q = 100$.

            [[fig:rot]]

            | | Specific tax $t$ | Ad valorem tax $v$ |
            |---|---|---|
            | wedge | $P_c - P_p = t$ | $P_p = (1 - v)P_c$ |
            | effective demand | $P(Q) - t$: parallel shift down | $(1 - v)P(Q)$: pivot down |
            | linear $P = a - bQ$ | $(a - t) - bQ$ | $(1 - v)a - (1 - v)bQ$ |
            | effective MR | $MR(Q) - t$ | $(1 - v)MR(Q)$ |
            | the equation | $MR - t = MC$ | $(1 - v)MR = MC$ |
            | revenue | $tQ$ | $vP_cQ$ |
          `, { rot: { svg: rotFig, cap: 'From D: P = 100 − Q. A \\$20 per-unit tax shifts it down in parallel (orange). A 50% tax halves every price, so it pivots around Q = 100 (green).' } }),
          Q(md`A 25% ad valorem tax. The firm keeps…`, ['$P_p = 0.75P_c$', '$P_p = P_c - 0.25$', '$P_p = 1.25P_c$', '$P_c = 0.75P_p$'], 0,
            [null, 'That subtracts a quarter of a dollar, not a quarter of the price.', 'The firm keeps less than consumers pay, not more.', 'Backwards: consumers pay the full price, the firm keeps 75% of it.'],
            md`$P_p = (1 - v)P_c = 0.75P_c$.`),
          Q(md`$MR = 100 - 4Q$ and the ad valorem tax is 20%. Effective MR is…`, ['$80 - 3.2Q$', '$99.8 - 4Q$', '$80 - 4Q$', '$100 - 3.2Q$'], 0,
            [null, 'That subtracts 0.2 like a dollar amount. A share multiplies every term.', 'Multiply the slope too: $0.8 \\times 4 = 3.2$.', 'Multiply the intercept too: $0.8 \\times 100 = 80$.'],
            md`$0.8(100 - 4Q) = 80 - 3.2Q$. Both the intercept and the slope scale by $1 - v$.`),
          Q(md`An ad valorem tax changes a linear demand curve as the firm sees it by…`, ['pivoting it down around the quantity intercept', 'shifting it down in parallel', 'shifting it to the left in parallel', 'leaving it unchanged'], 0,
            [null, 'That is a specific tax: the same dollars off every price.', 'Every price is cut by the same share, so high prices fall more than low ones; at P = 0 nothing changes.', 'The firm keeps less of every sale.'],
            md`$(1 - v)(a - bQ)$ still hits zero at $Q = a/b$, but starts lower: a pivot.`),
          RF(md`
            ### Worked example (DS10 Q1): the whole problem

            $P = 500 - 2Q$, $MC = Q$. A 40% ad valorem tax on consumers.

            **(a) Untaxed.** $MR = 500 - 4Q$. Set $MR = MC$:
            $$500 - 4Q = Q \;\Rightarrow\; 500 = 5Q \;\Rightarrow\; Q^m = 100, \qquad P^m = 500 - 200 = 300$$

            **(b) Untaxed DWL.** Efficient output where demand meets MC: $500 - 2Q = Q \Rightarrow Q^e = 500/3 \approx 166.67$. MC at $Q^m$ is 100.
            $$\text{DWL} = \tfrac12(166.67 - 100)(300 - 100) = \tfrac12(66.67)(200) = 6666.67$$

            **(c) Move 1: effective demand and MR.** The firm keeps 60% of each dollar:
            $$P_p = 0.6(500 - 2Q) = 300 - 1.2Q, \qquad \text{effective } MR = 0.6(500 - 4Q) = 300 - 2.4Q$$

            **(d) Move 2: effective MR = MC.**
            $$300 - 2.4Q = Q \;\Rightarrow\; 300 = 3.4Q \;\Rightarrow\; Q^v = \frac{300}{3.4} = 88.235$$

            **Move 3: the prices.** Consumers pay the demand price:
            $$P_c = 500 - 2(88.235) = 323.53$$
            The firm keeps 60%: $P_p = 0.6 \times 323.53 = 194.12$. Check with effective demand: $300 - 1.2(88.235) = 194.12$. ✓

            **(e) Move 4: after-tax DWL** against the same efficient $Q^e = 166.67$. MC at $Q^v$ is 88.235:
            $$\text{DWL} = \tfrac12(166.67 - 88.235)(323.53 - 88.235) = \tfrac12(78.43)(235.29) = 9227.2$$
            Up from 6666.67: the tax adds about 2560.5.

            [[fig:avc]]

            **Revenue and the rest of the welfare picture.** $G = (323.53 - 194.12)(88.235) = 11{,}418.7$. $CS = \tfrac12(88.235)(500 - 323.53) = 7785.5$. $PS = P_pQ - VC = 194.12(88.235) - \tfrac12(88.235)^2 = 13{,}235.3$. Efficient total: $\tfrac12(166.67)(500) = 41{,}666.7 = 7785.5 + 13{,}235.3 + 11{,}418.7 + 9227.2$. ✓

            [[fig:ava]]
          `, { avc: { svg: avCurvesFig, cap: 'DS10 Q1. The 40% tax pivots demand and MR down to 60% (dashed). Effective MR meets MC at Q = 88.2; consumers pay 323.5 (on D), the firm keeps 194.1 (on 0.6D).' },
            ava: { svg: avAreasFig, cap: 'After the tax: CS (blue), revenue G (gray, between 194.1 and 323.5), PS (green, above MC and below P_p), DWL (red) from 88.2 to the efficient 166.7.' } }),
          Q(md`In DS10, why is the after-tax DWL triangle's height $323.53 - 88.235$ and not $323.53 - 194.12$?`, ['DWL runs between demand and MC: MC at $Q^v$ is 88.235', 'because $P_p$ is irrelevant to welfare', 'because the tax revenue is part of the DWL', 'it should be $323.53 - 194.12$'], 0,
            [null, 'P_p matters for splitting surplus between the firm and the government; it just is not an edge of the DWL triangle.', 'Revenue is a transfer, kept in welfare. The DWL is to the right of $Q^v$.', 'The gap between $P_c$ and $P_p$ is the tax per unit; DWL measures value minus cost on the units not produced.'],
            md`Lost units are worth what demand says and cost what MC says. At $Q^v$ that gap is $323.53 - 88.235$, closing to zero at $Q^e$.`),
          R(md`
            ### Same output, more revenue: why the ad valorem tax wins

            Go back to the ski resort ($P = 100 - Q$, $MC = 20$) and compare a \$20 specific tax with a 50% ad valorem tax.

            **Specific, $t = 20$** (lesson 1): $100 - 2Q - 20 = 20 \Rightarrow Q = 30$, $P_c = 70$, $P_p = 50$, $G = 20 \times 30 = 600$.

            **Ad valorem, $v = 0.5$.** Effective MR $= 0.5(100 - 2Q) = 50 - Q$. Set it equal to 20:
            $$50 - Q = 20 \;\Rightarrow\; Q = 30$$
            Same output. Same demand, so the same $P_c = 70$. But the firm keeps only $P_p = 0.5 \times 70 = 35$, and
            $$G = (70 - 35)(30) = 1050$$

            | | Specific \$20 | Ad valorem 50% |
            |---|---|---|
            | $Q$ | 30 | 30 |
            | $P_c$ | 70 | 70 |
            | $P_p$ | 50 | 35 |
            | CS | 450 | 450 |
            | Profit $(P_p - 20)Q$ | 900 | 450 |
            | Revenue $G$ | 600 | 1050 |
            | DWL | 1250 | 1250 |

            Same output means same CS and same DWL (DWL depends only on how many units are lost). The extra 450 of revenue comes straight out of the firm's profit.
          `),
          R(md`
            ### The proof in three lines

            Both taxes lead to the same output $Q$. So both first-order conditions hold at that $Q$.

            Specific: $MR - t = MC$, so
            $$t = MR - MC$$

            Ad valorem: $(1 - v)MR = MC$. Expand: $MR - v\,MR = MC$, so
            $$MR - MC = v\,MR$$

            Put them together: $t = v\,MR$. The specific tax per unit equals $v$ times **marginal revenue**. The ad valorem tax per unit is $v$ times the **price**, $vP_c$. A monopolist always sells where $P > MR$ ([Part 11](#/l/m3-mo1)), so
            $$vP_c > v\,MR = t$$

            Same units, more per unit: more revenue. The ratio is $P_c/MR$. Ski resort: $70/40 = 1.75$, and $1050/600 = 1.75$. ✓

            !!intuition Why: the margin versus the average
              The firm's output decision depends only on how the tax bites its **last** unit. A percent tax on the last unit takes $v$ of that unit's marginal revenue, which is small for a monopolist. But on **every** unit it collects $v$ of the price, which is large. A specific tax takes the same $t$ at the margin and on average. So for the same distortion at the margin (the same $Q$), the ad valorem tax collects more. For a competitive firm $P = MR$, and the two would raise the same.

            !!key DS10 in numbers
              Ad valorem 40%: $Q = 88.235$, $MR = 500 - 4(88.235) = 147.06$. Matching specific tax: $t = 0.4 \times 147.06 = 58.82$ (check: $147.06 - 88.235 = 58.82$ ✓).

              Revenue: specific $58.82 \times 88.235 = 5190.3$; ad valorem $0.4 \times 323.53 \times 88.235 = 11{,}418.7$. Ratio $323.53/147.06 = 2.2$. Same DWL (9227.2) either way.
          `),
          Q(md`A specific tax and an ad valorem tax lead a monopolist to the same output. Which is **different** under the two taxes?`, ['the price the firm keeps and tax revenue', 'the price consumers pay', 'consumer surplus', 'deadweight loss'], 0,
            [null, 'Same Q on the same demand curve means the same $P_c$.', 'CS depends only on $Q$ and $P_c$, both the same.', 'DWL depends only on how many units are lost, the same.'],
            md`$P_c$, CS and DWL match. The ad valorem tax collects $vP_c > t$ per unit, so $P_p$ and profit are lower and $G$ is higher.`),
          Q(md`For the same output from a monopolist, an ad valorem tax raises…`, ['more revenue than a specific tax', 'less revenue than a specific tax', 'the same revenue', 'more or less depending on MC'], 0,
            [null, 'Backwards: $vP > v\\,MR = t$.', 'Same units but more per unit.', 'The argument only uses $P > MR$, true for any monopolist.'],
            md`$t = v\,MR$ and the ad valorem tax collects $vP$ per unit; $P > MR$.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`A 30% tax is collected from consumers. Demand $P = 200 - Q$, $MC = 20$.`,
            plan: plan('First equation?', '$0.7(200 - 2Q) = 20$', [
              ['$200 - 2Q - 0.3 = 20$', 'A 30% tax takes a share of each dollar; it multiplies, it does not subtract 30 cents.'],
              ['$200 - 2Q = 1.3 \\times 20$', 'Moving 0.7 across divides: $MR = 20/0.7 = 28.57$, not $1.3 \\times 20 = 26$.'],
              ['$0.7(200 - Q) = 20$', 'That is effective demand equal to MC, the competitive rule.'],
            ], '$140 - 1.4Q = 20 \\Rightarrow Q = 85.7$. (Who collects the tax does not matter.)') }),
          P({ q: md`Under a 20% tax you found $Q^v = 50$. Demand is $P = 150 - Q$.`,
            plan: plan('How do you get the two prices?', '$P_c = 150 - 50 = 100$, then $P_p = 0.8 \\times 100 = 80$', [
              ['$P_c = 0.8(150 - 50) = 80$', 'That is effective demand: it gives $P_p$, not $P_c$.'],
              ['$P_c = 100$, $P_p = 100 - 0.2 = 99.8$', 'A percent tax takes a share of the price.'],
              ['$P_p = 100$, $P_c = 1.2 \\times 100 = 120$', 'Consumers pay the demand price at $Q = 50$, which is 100.'],
            ], 'Demand for $P_c$, then multiply by $1 - v$.') }),
          P({ q: md`"Find the specific tax that would yield the same output as the 40% ad valorem tax."`,
            plan: plan('What is the method?', 'Keep $Q^v$; solve $MR(Q^v) - t = MC(Q^v)$ for $t$', [
              ['$t = 0.4 \\times P_c$', 'That is the ad valorem tax’s take per unit. As a specific tax it would be too big and cut output further.'],
              ['$t = 0.4 \\times$ the untaxed price', 'A guess with no first-order condition behind it.'],
              ['$t = P_c - P_p$ under the ad valorem tax', 'Same: that is $vP_c$, larger than the $t$ that gives the same output.'],
            ], '$t = MR(Q^v) - MC(Q^v)$, which equals $v\\,MR(Q^v)$.') }),
          P({ q: md`A government wants to raise money from a monopoly while causing as little extra deadweight loss as possible per dollar raised.`,
            plan: plan('Specific or ad valorem?', 'Ad valorem: for the same output (same DWL) it raises more', [
              ['Specific: a fixed amount per unit distorts less', 'At the same output they cause the same DWL; the ad valorem one collects $vP > v\\,MR = t$ per unit.'],
              ['They are equivalent', 'Same output, different revenue.'],
              ['Neither: any tax on a monopoly raises no revenue', 'The firm still sells units, and each is taxed.'],
            ], 'Ad valorem: more revenue at the same $Q$ (and the same DWL).') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'DS10 demand, a 25% tax', q: md`$P = 500 - 2Q$, $MC = Q$. A 25% ad valorem tax.`,
            plan: [
              PLAN_AV_Q(0.75, 500, 2, 'Q', 25),
              plan('Height of the after-tax DWL triangle?', '$P_c - MC(Q^v)$', [
                ['$P_c - P_p$', 'That is the tax per unit, the height of the revenue rectangle.'],
                ['$P_c - P^m$', 'That is how much the consumer price rose.'],
                ['$P_p - MC(Q^v)$', 'The DWL runs from demand (what units are worth) down to MC.'],
              ], 'Base $Q^e - Q^v$ with $Q^e = 166.67$.'),
            ],
            parts: [N('Q^v', 93.75), N('P_c', 312.5), N('P_p', 234.375), N('G', 7324.2), N('\\text{DWL}_{\\text{after}}', 7975.3)],
            sol: md`
              **Move 1.** $0.75(500 - 4Q) = Q \Rightarrow 375 - 3Q = Q \Rightarrow Q^v = 93.75$.

              **Move 2.** $P_c = 500 - 187.5 = 312.5$; $P_p = 0.75 \times 312.5 = 234.375$.

              **Move 3.** $G = (312.5 - 234.375)(93.75) = 78.125 \times 93.75 = 7324.2$.

              **Move 4.** $\text{DWL} = \tfrac12(166.67 - 93.75)(312.5 - 93.75) = \tfrac12(72.92)(218.75) = 7975.3$. Smaller tax, smaller DWL than the 40% case (9227.2), but still above the untaxed 6666.67.
            ` }),
          P({ title: 'Effective curves as formulas', q: md`$P = 240 - 3Q$, $MC = 30$. A 25% ad valorem tax.`,
            plan: PLAN_AV_Q(0.75, 240, 3, 30, 25),
            parts: [X('\\text{effective demand } P_p(Q)', '180 - 2.25*Q', { Q: [1, 60] }), X('\\text{effective } MR(Q)', '180 - 4.5*Q', { Q: [1, 30] }), N('Q^v', 33.333), N('P_c', 140), N('P_p', 105), N('G', 1166.7)],
            sol: md`
              **Move 1.** $P_p = 0.75(240 - 3Q) = 180 - 2.25Q$. MR $= 240 - 6Q$, so effective MR $= 0.75(240 - 6Q) = 180 - 4.5Q$.

              **Move 2.** $180 - 4.5Q = 30 \Rightarrow 4.5Q = 150 \Rightarrow Q^v = 33.33$.

              **Move 3.** $P_c = 240 - 3(33.33) = 140$; $P_p = 0.75 \times 140 = 105$; $G = 35 \times 33.33 = 1166.7$.
            ` }),
          P({ title: 'Ski resort, 20%', q: md`$P = 100 - Q$, $MC = 20$. Compare a 20% ad valorem tax with the specific tax that gives the same output.`,
            plan: plan('How do you find the matching specific tax?', 'Find $Q^v$, then $t = MR(Q^v) - MC$', [
              ['$t = 0.2 \\times P_c$', 'That is what the ad valorem tax collects per unit, more than the matching $t$.'],
              ['$t = 0.2 \\times 20$', 'The margin that matters is MR, not MC.'],
              ['$t = 20$', 'A \\$20 tax gives $Q = 30$, not the same output as a 20% tax.'],
            ], '$0.8(100 - 2Q) = 20 \\Rightarrow Q^v = 37.5$; $MR = 25$; $t = 25 - 20 = 5$.'),
            parts: [N('Q^v', 37.5), N('P_c', 62.5), N('t', 5), N('G_{\\text{ad valorem}}', 468.75), N('G_{\\text{specific}}', 187.5)],
            sol: md`
              **Move 1.** $80 - 1.6Q = 20 \Rightarrow Q^v = 37.5$; $P_c = 62.5$; $P_p = 0.8 \times 62.5 = 50$.

              **Move 2.** $MR(37.5) = 100 - 75 = 25$. $t = 25 - 20 = 5$ (or $0.2 \times 25$). Check: $100 - 2Q - 5 = 20 \Rightarrow Q = 37.5$ ✓.

              **Move 3.** $G_v = (62.5 - 50)(37.5) = 468.75$; $G_t = 5 \times 37.5 = 187.5$. Ratio $2.5 = P_c/MR = 62.5/25$.
            ` }),
          P({ title: 'Rising MC, same output', q: md`$P = 120 - Q$, $MC = Q$. A 25% ad valorem tax, and the specific tax with the same output.`,
            plan: PLAN_AV_Q(0.75, 120, 1, 'Q', 25),
            parts: [N('Q^v', 36), N('P_c', 84), N('P_p', 63), N('t', 12), N('G_{\\text{ad valorem}}', 756), N('G_{\\text{specific}}', 432)],
            sol: md`
              **Move 1.** $0.75(120 - 2Q) = Q \Rightarrow 90 - 1.5Q = Q \Rightarrow Q^v = 36$.

              **Move 2.** $P_c = 84$, $P_p = 0.75 \times 84 = 63$, $G_v = 21 \times 36 = 756$.

              **Move 3.** $MR(36) = 120 - 72 = 48$, $MC(36) = 36$, so $t = 12$ ($= 0.25 \times 48$ ✓). $G_t = 12 \times 36 = 432$.

              Profit: $VC = \tfrac12(36)^2 = 648$. Ad valorem $63(36) - 648 = 1620$; specific $72(36) - 648 = 1944$. The gap, 324, is exactly $756 - 432$.
            ` }),
          G('m3_mt_advalorem', { need: 3 }),
          G('m3_mt_compare', { need: 2 }),
        ],
      },
      // ================================================================ lesson 3
      {
        id: 'm3-mt3', title: 'Pass-through: how much of a tax shows up in the price?', ref: 'Lecture 19 · Perloff ch. 11',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The answer shape |
            |---|---|---|
            | "by how much does the consumer price rise per \$1 of tax?", "interpret $dP/dt$" | marginal pass-through $dP_c/dt$ | a number like 0.5, 1, 2 |
            | "linear demand, constant MC" | the pass-through you should expect | exactly $\tfrac12$ |
            | linear demand, MC rising | the pass-through you should expect | less than $\tfrac12$ |
            | "constant-elasticity demand $Q = kP^{-e}$", constant MC | the pass-through you should expect | $\dfrac{e}{e - 1}$, **more than 1** |
            | "can the price rise by more than the tax?" | the constant-elasticity example | yes: e.g. $e = 2$ gives 2 |
            | competitive industry, flat MC | the benchmark | exactly 1 |
            | "what share of the tax do consumers bear?" | incidence | $(P_c - P)/t$; above 100% is possible |

            Pass-through is one number. The skill is knowing which number to expect **before** computing, from the shape of demand and MC.
          `),
          R(md`
            ### What pass-through means

            The formula sheet defines **marginal pass-through** as $\dfrac{dP_c}{dt}$: the change in the consumer price per \$1 increase in the per-unit tax.

            - $dP_c/dt = 1$: every extra tax dollar lands on consumers.
            - $dP_c/dt = \tfrac12$: consumers pay 50 cents of each extra dollar; the firm absorbs the rest.
            - $dP_c/dt = 2$: each extra tax dollar raises the consumer price by \$2.

            When $P_c$ is a straight line in $t$ (all our linear examples), the derivative is just the change: $\Delta P_c/\Delta t$.
          `),
          RF(md`
            ### Linear demand, constant MC: exactly one half

            Demand $P = a - bQ$, so $MR = a - 2bQ$. Constant marginal cost $c$. Tax $t$ per unit.

            **Move 1: output.** Effective MR equals MC:
            $$a - 2bQ - t = c$$
            Move $2bQ$ to the right and $c$ to the left:
            $$a - c - t = 2bQ \;\Rightarrow\; Q = \frac{a - c - t}{2b}$$

            **Move 2: price.** Plug into demand:
            $$P_c = a - b\cdot\frac{a - c - t}{2b} = a - \frac{a - c - t}{2}$$
            Put both over 2:
            $$P_c = \frac{2a - a + c + t}{2} = \frac{a + c + t}{2}$$

            **Move 3: differentiate with respect to $t$.**
            $$\frac{dP_c}{dt} = \frac12$$

            Ski resort check: $(100 + 20 + 20)/2 = 70$. ✓ And the slope $b$ cancelled: **any** linear demand with flat MC gives one half.

            !!intuition Why one half
              With linear demand the monopoly price sits exactly halfway between the top of demand, $a$, and marginal cost: $P = (a + c)/2$. A tax acts like a higher cost, $c + t$. The price moves to halfway between $a$ and $c + t$, so it rises by half of $t$.

            **Compare a competitive market with flat MC.** Supply is the flat line $P = c$, so $P_c = c + t$ and pass-through is **1**. Competitive firms already earn zero profit; they cannot absorb anything.

            [[fig:pl]]
          `, { pl: { svg: passLinFig, cap: 'Tax t = 20. Monopoly: MR meets MC + t at Q = 30, and the price goes from 60 (M₀) to 70 (M₁): half the tax. Competition with flat MC: the price goes from 20 (C₀) to 40 (C₁): all of it.' } }),
          R(md`
            ### Rising MC: less than one half

            Now $MC = c + dQ$ with $d > 0$. Effective MR = MC:
            $$a - 2bQ - t = c + dQ \;\Rightarrow\; Q = \frac{a - c - t}{2b + d}$$
            Then $P_c = a - bQ$, and only the $-t$ inside $Q$ depends on the tax:
            $$\frac{dP_c}{dt} = \frac{b}{2b + d}$$
            With $d = 0$ this is $\tfrac12$ again. With $d > 0$ the denominator is bigger, so pass-through is **below** one half.

            Lesson 1, worked example 2: $P = 120 - Q$, $MC = Q$, so $b = 1$, $d = 1$: $\dfrac{1}{3}$. Indeed the price went 80 → 90 on a \$30 tax.

            !!intuition Does this make sense?
              When MC rises, cutting output also lowers the cost of the last unit. So the firm cuts output more readily, and a bigger cut in $Q$ holds the price down.
          `),
          Q(md`Linear demand, constant MC. The per-unit tax on a monopolist rises by \$6. The consumer price rises by…`, ['\\$3', '\\$6', '\\$12', 'it depends on the demand slope'], 0,
            [null, 'That is full pass-through, the competitive flat-MC case.', 'More than the tax happens only with constant-elasticity demand.', 'The slope cancels: $P_c = (a + c + t)/2$.'],
            md`$dP_c/dt = \tfrac12$, so $\Delta P_c = 3$.`),
          Q(md`Compared with flat MC, a monopolist with **rising** MC passes on…`, ['less of a tax to consumers', 'more of a tax to consumers', 'exactly half either way', 'all of the tax'], 0,
            [null, 'Rising MC makes it cheaper to cut output, which holds the price down.', 'Half needs flat MC.', 'Full pass-through is competition with flat MC.'],
            md`$dP_c/dt = b/(2b + d) < \tfrac12$ when $d > 0$.`),
          R(md`
            ### Constant-elasticity demand: more than 100%

            Now demand is $Q = kP^{-e}$ with $e > 1$ (formula sheet: own-price elasticity $\varepsilon_p = -e$ at every price). A monopolist only ever operates where demand is elastic ([Part 11](#/l/m3-mo4)), so $e > 1$.

            **Move 1: MR from elasticity** (formula sheet):
            $$MR = P\left(1 + \frac{1}{\varepsilon_p}\right) = P\left(1 - \frac1e\right) = P\cdot\frac{e - 1}{e}$$

            **Move 2: effective MR = MC.** With a specific tax, set $MR - t = c$, i.e. $MR = c + t$:
            $$P\cdot\frac{e - 1}{e} = c + t$$

            **Move 3: solve for $P$.** Multiply both sides by $\dfrac{e}{e - 1}$:
            $$P_c = \frac{e}{e - 1}\,(c + t)$$

            **Move 4: differentiate.**
            $$\frac{dP_c}{dt} = \frac{e}{e - 1}$$
            Since $e > e - 1$, this is **greater than 1**. The price rises by more than the tax.

            | $e$ | $\dfrac{e}{e - 1}$ | a \$1 tax raises $P_c$ by |
            |---|---|---|
            | 1.5 | 3 | \$3 |
            | 2 | 2 | \$2 |
            | 3 | 1.5 | \$1.50 |
            | 5 | 1.25 | \$1.25 |
            | very large | close to 1 | about \$1 (almost competitive) |
          `),
          RF(md`
            ### Worked example: $e = 2$, $MC = 10$, $t = 4$

            **Move 1: no tax.** Markup factor $\dfrac{e}{e - 1} = \dfrac{2}{1} = 2$. $P = 2 \times 10 = 20$.

            **Move 2: with the tax.** $P_c = 2 \times (10 + 4) = 28$. The price rose by 8 on a tax of 4: pass-through 2.

            **Move 3: what the firm keeps.** $P_p = 28 - 4 = 24$. That is **more** than the 20 it charged before the tax.

            **Move 4: incidence** (formula sheet). Consumer share $= (P_c - P)/t = (28 - 20)/4 = 2$, i.e. 200%. Producer share $= (P - P_p)/t = (20 - 24)/4 = -1$, i.e. $-100\%$. The shares still add to 100%.

            Is the firm better off? No. With $Q = 4000P^{-2}$: before, $Q = 4000/400 = 10$ and profit $(20 - 10)(10) = 100$. After, $Q = 4000/784 = 5.10$ and profit $(24 - 10)(5.10) = 71.4$. Higher margin, far fewer units.

            [[fig:ce]]

            !!intuition Why more than the tax: a constant percentage markup
              With constant elasticity, the Lerner index $(P - MC)/P = 1/e$ is the same at every cost, so the price is always the same **multiple** of marginal cost: $P = \tfrac{e}{e-1} \times MC$. Think of a store that always prices at double its wholesale cost. If wholesale rises by \$1, the shelf price rises by \$2. A per-unit tax is exactly a rise in the firm's marginal cost, so it gets marked up too.

              With linear demand the opposite happens: the markup shrinks as cost rises (the price stays halfway between cost and the top of demand), so less than the full tax shows up.
          `, { ce: { svg: ceFig, cap: 'Constant elasticity e = 2: MR = P/2. MR meets MC = 10 at Q = 10, P = 20. With t = 4, MR meets 14 at Q = 5.1, P = 28: the price rose 8 on a 4 tax.' } }),
          Q(md`$Q = kP^{-2}$, constant MC. A \$1 increase in a per-unit tax raises the monopoly price by…`, ['\\$2', '\\$1', '\\$0.50', 'it depends on $k$'], 0,
            [null, 'Full pass-through is competition with flat MC.', 'One half is linear demand with flat MC.', '$k$ scales quantity, not the markup: $P = 2(MC + t)$ for any $k$.'],
            md`$dP_c/dt = e/(e - 1) = 2/1 = 2$.`),
          Q(md`With constant-elasticity demand ($e = 2$), a per-unit tax makes the price the **firm keeps**…`, ['rise', 'fall by the full tax', 'fall by half the tax', 'stay the same'], 0,
            [null, 'It would only fall by the full tax if the consumer price did not move.', 'That is the linear case: $P_p$ falls by half.', 'The consumer price rises by 2t, so $P_p = P_c - t$ rises by t.'],
            md`$P_c$ rises by $2t$, so $P_p = P_c - t$ rises by $t$. The firm's margin goes up even though its profit falls.`),
          Q(md`As $e$ gets very large (demand nearly perfectly elastic), constant-elasticity pass-through $e/(e - 1)$ approaches…`, ['1', '0', '2', 'infinity'], 0,
            [null, 'It never falls below 1.', 'That is $e = 2$.', 'That is the limit as $e$ approaches 1 from above.'],
            md`Very elastic demand means a tiny markup: the firm behaves almost like a competitive firm, and pass-through approaches 1.`),
          Q(md`Which setup gives a consumer price that rises by **more** than the tax?`, ['monopoly, constant-elasticity demand, constant MC', 'monopoly, linear demand, constant MC', 'competitive market, flat supply', 'monopoly, linear demand, rising MC'], 0,
            [null, 'Exactly half.', 'Exactly the tax.', 'Less than half.'],
            md`Only the constant-markup case multiplies the tax: $dP_c/dt = e/(e - 1) > 1$.`),
          R(md`
            ### Spot it: no numbers needed

            !!key Pass-through cheat sheet
              Linear demand, flat MC: $\tfrac12$. Linear demand, $MC = c + dQ$: $\dfrac{b}{2b + d}$. Constant elasticity, flat MC: $\dfrac{e}{e - 1}$. Competition, flat MC: 1.
          `),
          P({ q: md`Demand $P = 300 - 5Q$, $MC = 40$. The per-unit tax rises from \$10 to \$16.`,
            plan: plan('How much does the consumer price rise?', '\\$3: linear demand and flat MC give pass-through one half', [
              ['\\$6, the whole tax increase', 'That is competition with flat MC.'],
              ['$\\$6/5$, using the demand slope', 'The slope cancels: $P_c = (300 + 40 + t)/2$.'],
              ['\\$12', 'More than the tax needs constant-elasticity demand.'],
            ], '$P_c = (340 + t)/2$: 175 → 178.') }),
          P({ q: md`$Q = 900P^{-3}$, $MC = 8$, and a \$2 per-unit tax is introduced.`,
            plan: plan('Which formula gives the new price?', '$P_c = \\tfrac{3}{2}(8 + 2) = 15$', [
              ['$P_c = 8 + 2 = 10$', 'That is the competitive price; a monopolist marks up.'],
              ['$P_c = \\tfrac12(a + c + t)$', 'There is no intercept $a$: this demand is not linear.'],
              ['$P_c = \\tfrac{3}{2}(8) + 2 = 14$', 'The tax is part of the cost the markup applies to: multiply $(c + t)$.'],
            ], 'Markup factor $e/(e - 1) = 1.5$: 12 → 15, pass-through 1.5.') }),
          P({ q: md`Demand $P = 100 - Q$, $MC = 10 + 2Q$. A per-unit tax is imposed on a monopolist.`,
            plan: plan('What do you expect $dP_c/dt$ to be?', 'Less than one half: $b/(2b + d) = 1/4$', [
              ['Exactly one half', 'Only with flat MC.'],
              ['1', 'Competition with flat MC.'],
              ['More than 1', 'Linear demand never gives more than one half.'],
            ], '$100 - 2Q - t = 10 + 2Q \\Rightarrow Q = (90 - t)/4$, $P_c = 100 - Q = 77.5 + t/4$.') }),
          P({ q: md`You found $P = 20$ before a \$4 tax and $P_c = 28$, $P_p = 24$ after. The question asks for the consumers' share of the tax.`,
            plan: plan('Which formula?', '$(P_c - P)/t = 8/4 = 200\\%$', [
              ['$(P - P_p)/t$', 'That is the producer share (here $-100\\%$).'],
              ['$P_c/t$', 'That compares the whole price with the tax.'],
              ['It cannot exceed 100%', 'It can: the consumer price rose by twice the tax.'],
            ], 'Consumer share $(P_c - P)/t$; producer share $(P - P_p)/t$; they add to 1.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Linear pass-through', q: md`$P = 200 - 2Q$, $MC = 40$.`,
            plan: plan('How do you get $P_c(t)$?', 'Solve $200 - 4Q - t = 40$ for $Q$, then plug into demand', [
              ['$P_c = 120 + t$', 'Full pass-through assumes the firm does not re-optimize.'],
              ['Solve $200 - 2Q = 40 + t$', 'That is the competitive condition.'],
              ['$P_c = 2(40 + t)$', 'That is the constant-elasticity rule with $e = 2$; this demand is linear.'],
            ], '$Q = (160 - t)/4$; $P_c = 200 - 2Q = (240 + t)/2$.'),
            parts: [X('P_c(t)', '(240 + t)/2', { t: [0, 40] }), N('P_c\\text{ at }t = 0', 120), N('P_c\\text{ at }t = 20', 130), N('dP_c/dt', 0.5)],
            sol: md`
              **Move 1.** $200 - 4Q - t = 40 \Rightarrow Q = \dfrac{160 - t}{4}$.

              **Move 2.** $P_c = 200 - 2\cdot\dfrac{160 - t}{4} = 200 - 80 + \dfrac t2 = 120 + \dfrac t2 = \dfrac{240 + t}{2}$.

              **Move 3.** $t = 0$: 120. $t = 20$: 130. Pass-through $\tfrac12$, matching $(a + c + t)/2$ with $a = 200$, $c = 40$.
            ` }),
          P({ title: 'Constant elasticity, e = 2', q: md`$Q = 3600P^{-2}$, $MC = 15$. A \$5 per-unit tax.`,
            plan: plan('Which pricing rule?', '$P = \\tfrac{e}{e - 1}(MC + t) = 2(MC + t)$', [
              ['$P = MC + t$', 'Competitive. A monopolist marks up.'],
              ['$MR = a - 2bQ$', 'Linear-demand formula; this demand has constant elasticity.'],
              ['$P = 2\\,MC + t$', 'The markup applies to the whole cost the firm faces, $MC + t$.'],
            ], '$\\varepsilon_p = -2$, $MR = P/2$. Set $P/2 = 15 + t$.'),
            parts: [N('P\\text{ before}', 30), N('P_c\\text{ after}', 40), N('dP_c/dt', 2), N('P_p\\text{ after}', 35), N('Q\\text{ before}', 4), N('Q\\text{ after}', 2.25)],
            sol: md`
              **Move 1.** $MR = P(1 - 1/2) = P/2$. No tax: $P/2 = 15 \Rightarrow P = 30$; $Q = 3600/900 = 4$.

              **Move 2.** Tax: $P/2 = 20 \Rightarrow P_c = 40$; $Q = 3600/1600 = 2.25$. $P_p = 35$.

              **Move 3.** Pass-through $10/5 = 2$. Profit falls from $(30 - 15)(4) = 60$ to $(35 - 15)(2.25) = 45$, even though the firm keeps more per unit.
            ` }),
          P({ title: 'Constant elasticity, e = 3', q: md`$Q = kP^{-3}$, $MC = 20$. A \$4 per-unit tax.`,
            plan: plan('What markup factor?', '$\\tfrac{e}{e - 1} = \\tfrac32$', [
              ['$\\tfrac{e - 1}{e} = \\tfrac23$', 'That is the ratio of MR to P. The price is MC divided by it, i.e. times $\\tfrac32$.'],
              ['$e = 3$', 'The markup factor is $e/(e - 1)$, not $e$.'],
              ['$\\tfrac1e = \\tfrac13$', 'That is the Lerner index $(P - MC)/P$, not the factor.'],
            ], '$P = 1.5(20) = 30$ before; $1.5(24) = 36$ after.'),
            parts: [N('P\\text{ before}', 30), N('P_c\\text{ after}', 36), N('dP_c/dt', 1.5), N('P_p\\text{ after}', 32)],
            sol: md`$MR = P(1 - 1/3) = \tfrac23 P$. No tax: $\tfrac23P = 20 \Rightarrow P = 30$. Tax: $\tfrac23 P = 24 \Rightarrow P_c = 36$. Rise 6 on a 4 tax: 1.5. $P_p = 32 > 30$. Lerner check: $(30 - 20)/30 = 1/3 = 1/e$ ✓.` }),
          P({ title: 'Monopoly versus competition', q: md`Demand $P = 100 - Q$ and $MC = 20$ (flat). A \$10 per-unit tax. Compare a competitive industry with a monopoly.`,
            plan: plan('Which equations?', 'Competition: $P_c = MC + t$. Monopoly: $MR - t = MC$, then demand', [
              ['Both: $MR - t = MC$', 'A competitive industry has no MR below price: price equals cost.'],
              ['Both: $P = MC + t$', 'A monopolist uses MR.'],
              ['Both pass through half', 'Competition with flat MC passes through all of it.'],
            ], 'Competition: $P_c = 30$. Monopoly: $90 - 2Q = 20 \\Rightarrow Q = 35$, $P_c = 65$.'),
            parts: [N('P_c\\text{ competitive}', 30), N('P_c\\text{ monopoly}', 65), N('\\Delta P_c\\text{ competitive}', 10), N('\\Delta P_c\\text{ monopoly}', 5)],
            sol: md`Competition: price was 20, now $20 + 10 = 30$ (pass-through 1). Monopoly: was 60, now $(100 + 20 + 10)/2 = 65$ (pass-through $\tfrac12$).` }),
          G('m3_mt_passlin', { need: 3 }),
          G('m3_mt_passce', { need: 3 }),
        ],
      },
      // ================================================================ lesson 4
      {
        id: 'm3-rg1', title: 'Natural monopoly', ref: 'Lecture 19 · Perloff ch. 11 · DS10 Q2',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "a natural monopoly provides local water distribution" | why one firm is cheapest | large fixed cost, falling AC |
            | "$C(Q) = 80 + 4Q$" | read the cost structure | $F = 80$, $MC = 4$, $AC = 4 + 80/Q$, always falling |
            | "explain natural monopoly using fixed costs and declining AC" | the cost argument | one network serves everyone; two duplicate $F$ |
            | "describe policies that prevent monopoly power or encourage entry" | the policy menu | antitrust, patent time limits, lowering entry barriers |
            | "policies that regulate prices" | price ceilings | $P = MC$ or $P = AC$ ([next lesson](#/l/m3-rg2)) |
            | "why not break it up?" | cost of competition here | each firm would pay $F$ again |
          `),
          R(md`
            ### The story: pipes under every street

            A town's water utility has to dig a pipe network under every street before it can deliver a single gallon. That network is a huge **fixed cost** $F$. After that, each extra unit of water costs a small, constant amount $c$ to pump and treat: **marginal cost** $MC = c$.

            $$C(Q) = F + cQ$$

            Average cost spreads the network over every unit sold:
            $$AC(Q) = \frac{C(Q)}{Q} = \frac{F}{Q} + c$$

            As $Q$ grows, $F/Q$ shrinks, so **AC falls at every output**, getting closer and closer to $c$ but never reaching it. And since $F/Q > 0$:
            $$MC = c < \frac{F}{Q} + c = AC \quad\text{at every } Q$$

            That inequality is the whole reason regulation is tricky (next lesson): pricing at marginal cost means pricing below average cost.

            !!intuition Same class-average logic as Part 8
              When the next unit (MC) costs less than the average, producing it pulls the average down. Here MC is below AC everywhere, so AC falls everywhere. See [the four price zones](#/l/m3-sr1).
          `),
          RF(md`
            ### One firm is cheaper than two

            DS10 Q2: $C(Q) = 80 + 4Q$, and the town buys 20 units.

            **One firm** serves all 20:
            $$C = 80 + 4(20) = 160, \qquad AC = 8$$

            **Two firms** split the town, 10 units each. Each builds its own network:
            $$C_{\text{each}} = 80 + 4(10) = 120, \qquad AC_{\text{each}} = 12, \qquad \text{total} = 240$$

            Same water, 80 more in cost: the network was built twice. In general two firms cost $2F + cQ$ versus $F + cQ$ for one.

            [[fig:nat]]

            !!key Natural monopoly
              A market is a **natural monopoly** when one firm can produce the whole output the market wants at lower total cost than two or more firms could. The usual cause is a large fixed cost with low marginal cost, so AC is still falling where the demand curve crosses it.
          `, { nat: { svg: natFig, cap: 'C = 80 + 4Q. One firm making 20 has AC = 8. Two firms making 10 each have AC = 12 each. AC (blue) falls at every Q toward MC = 4 (red) and is still falling where it meets demand (gray).' } }),
          Q(md`For $C(Q) = 200 + 5Q$, as output rises, average cost…`, ['falls toward 5 but never reaches it', 'rises', 'is constant at 5', 'falls, then rises'], 0,
            [null, 'AC = 200/Q + 5: the first term shrinks as Q grows.', 'That is MC. AC includes 200/Q on top.', 'That U-shape needs MC to rise eventually; here MC is constant.'],
            md`$AC = 200/Q + 5$: the fixed cost is spread over more units.`),
          Q(md`With $C(Q) = F + cQ$ and $F > 0$, marginal cost is…`, ['below AC at every output', 'above AC at every output', 'equal to AC at the bottom of AC', 'equal to AC at every output'], 0,
            [null, 'MC = c and AC = F/Q + c, which is always bigger.', 'AC has no bottom here: it falls forever.', 'Only if F = 0.'],
            md`$AC - MC = F/Q > 0$. This is why $P = MC$ pricing loses money for a natural monopoly.`),
          Q(md`Why don't regulators usually split a natural monopoly into several competing firms?`, ['each firm would pay the fixed cost again, raising total cost', 'competition always raises prices', 'the firms would merge immediately by law', 'marginal cost would rise'], 0,
            [null, 'Usually competition lowers prices; the problem here is cost.', 'There is no such law; the issue is duplicated fixed cost.', 'MC is the same; the duplicated network is the extra cost.'],
            md`Two water networks under the same streets double $F$. Also, with falling AC the larger firm can undercut the smaller one, so the market drifts back to one firm anyway.`),
          R(md`
            ### Where monopoly comes from, and the policy menu

            **Barriers to entry** (from [Part 11](#/l/m3-mo2)) come in two families:

            - **Cost advantages:** a natural monopoly (economies of scale), a superior technology, control of a key input.
            - **Government actions:** patents, licenses, exclusive franchises.

            Policy responses fall into three groups. Learn which goal each one serves.

            | Goal | Examples | Works best when… |
            |---|---|---|
            | **Prevent** monopoly power from forming | antitrust law: block mergers that would create a monopoly, ban collusion and predatory pricing | many firms could produce at low cost |
            | **Encourage entry** | time limits on patents (protection expires, generics enter); remove unneeded licensing; open access to essential networks | the monopoly rests on a legal or removable barrier |
            | **Regulate prices** | a price ceiling at $P = MC$ or $P = AC$; rate-of-return rules; public ownership | a natural monopoly: entry would only duplicate the fixed cost |

            !!key The punchline for a natural monopoly
              Breaking it up or forcing entry raises costs. So the usual answer is: **keep one firm and regulate its price.** How to pick that price is the next lesson.
          `),
          Q(md`A drug is under patent and sells far above marginal cost. A policy that **encourages entry** without regulating the price is…`, ['a fixed time limit on the patent', 'a price ceiling at average cost', 'a subsidy to the patent holder', 'nationalizing the firm'], 0,
            [null, 'That regulates price.', 'That does not invite anyone in.', 'That replaces the firm; it does not bring in competitors.'],
            md`When the patent expires, generic makers enter and the price falls toward marginal cost.`),
          Q(md`Average cost is U-shaped with its minimum at $q = 10$, and at that price the market buys 500 units. Is this a natural monopoly?`, ['no: many firms can each produce near minimum AC', 'yes: every firm has a fixed cost', 'yes: AC falls at first', 'cannot tell without MC'], 0,
            [null, 'A fixed cost alone is not enough; what matters is the scale at which AC bottoms out versus the market size.', 'It falls only up to 10 units, a tiny slice of a 500-unit market.', 'You have what you need: the cost bottom (10) versus the market (500).'],
            md`About 50 firms at the bottom of AC beat one firm making 500 units far up the rising part of AC. Natural monopoly needs AC still falling at the market's output.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`The city considers letting a second water company lay its own pipes. Each firm's cost would be $C = 80 + 4Q$, and the town uses 20 units.`,
            plan: plan('What happens to the total cost of supplying the town?', 'It rises by 80: the network is built twice', [
              ['It falls, because competition lowers costs', 'Competition can lower prices and markups, but here the cost of supplying the water itself rises.'],
              ['It stays the same: MC is 4 either way', 'MC is the same, but the fixed cost is paid twice.'],
              ['It rises by 4 per unit', 'Per-unit cost is unchanged; the extra is the second network.'],
            ], '$160$ with one firm; $2(80 + 40) = 240$ with two.') }),
          P({ q: md`Two large airlines that already account for most flights on a route want to merge.`,
            plan: plan('Which policy tool applies?', 'Antitrust: block or condition the merger to prevent monopoly power', [
              ['A price ceiling at P = AC', 'Price regulation is for natural monopolies, where one firm is cheapest. Here competition is possible.'],
              ['A patent time limit', 'Nothing here is patented.'],
              ['A per-unit subsidy', 'A subsidy raises output, but it does not stop the merger from creating market power.'],
            ], 'Prevent monopoly power from forming when many firms can operate at low cost.') }),
          P({ q: md`Is $C(Q) = 50 + 2Q^2$ a natural monopoly?`,
            plan: plan('How do you decide?', 'Find where AC bottoms out and compare that scale with the market’s size', [
              ['Yes: it has a fixed cost', 'A fixed cost alone is not enough when MC rises.'],
              ['No: MC rises', 'Rising MC does not rule it out if the market is small.'],
              ['Yes: AC falls at first', 'AC falls only up to its minimum; what matters is where the market sits.'],
            ], '$AC = 50/Q + 2Q$, minimum at $Q = 5$. For a small market (say 6) one firm is cheaper; for a big one (say 12) two are.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Water: AC at three outputs', q: md`$C(Q) = 80 + 4Q$.`,
            plan: plan('What is AC?', '$AC = 4 + 80/Q$', [
              ['$AC = 4$', 'That is MC. AC adds the fixed cost per unit.'],
              ['$AC = 80 + 4$', 'Divide the fixed cost by $Q$.'],
              ['$AC = 80/Q$', 'That is average fixed cost; add the variable cost per unit, 4.'],
            ], 'Divide each term of $C$ by $Q$.'),
            parts: [N('AC(10)', 12), N('AC(20)', 8), N('AC(40)', 6), N('MC', 4)],
            sol: md`$AC(10) = 4 + 8 = 12$, $AC(20) = 4 + 4 = 8$, $AC(40) = 4 + 2 = 6$. It keeps falling toward $MC = 4$.` }),
          P({ title: 'Four firms or one?', q: md`$C = 500 + 10Q$ per firm. The market buys 100 units.`,
            plan: plan('What do you compare?', 'Total cost of 100 units: one firm $500 + 10(100)$ versus four firms, each $500 + 10(25)$', [
              ['Each firm’s MC', 'MC is 10 in every case.'],
              ['AC of one firm at 100 with AC of a small firm at 100', 'A small firm makes only 25.'],
              ['Only the fixed costs', 'That gets the difference right, but the question asks for the totals.'],
            ], 'One: 1500. Four: $4 \\times 750 = 3000$.'),
            parts: [N('TC\\text{ one firm}', 1500), N('AC\\text{ one firm}', 15), N('TC\\text{ four firms}', 3000), N('AC\\text{ each small firm}', 30)],
            sol: md`One firm: $500 + 1000 = 1500$, $AC = 15$. Four firms: each $500 + 250 = 750$, $AC = 30$; total 3000. Splitting costs $3 \times 500 = 1500$ more.` }),
          P({ title: 'When is it natural?', q: md`$C(Q) = 50 + 2Q^2$ (rising MC).`,
            plan: plan('First step?', 'Find min AC: $MC = AC$, i.e. $4Q = 2Q + 50/Q$', [
              ['Set $MC = 0$', 'Not a cost landmark.'],
              ['Assume one firm is always cheapest', 'With rising MC, splitting a big output can save cost.'],
              ['Set $P = MC$', 'There is no price here; this is about cost.'],
            ], '$2Q = 50/Q \\Rightarrow Q = 5$, min AC = 20. Then compare one versus two firms at 6 and 12.'),
            parts: [N('Q_{\\min AC}', 5), N('TC\\text{ one firm, }Q = 6', 122), N('TC\\text{ two firms, }Q = 6', 136), N('TC\\text{ one firm, }Q = 12', 338), N('TC\\text{ two firms, }Q = 12', 244)],
            sol: md`
              **Move 1.** $MC = 4Q$, $AC = 2Q + 50/Q$. $4Q = 2Q + 50/Q \Rightarrow Q^2 = 25 \Rightarrow Q = 5$.

              **Move 2: market of 6.** One firm: $50 + 2(36) = 122$. Two firms making 3 each: $2(50 + 18) = 136$. One firm cheaper: natural monopoly at this size.

              **Move 3: market of 12.** One firm: $50 + 288 = 338$. Two firms making 6 each: $2(50 + 72) = 244$. Two firms cheaper: not a natural monopoly.

              Natural monopoly depends on the market's size relative to where AC bottoms out.
            ` }),
          P({ title: 'The unregulated water monopoly (DS10 Q2 setup)', q: md`$P = 28 - Q$, $C = 80 + 4Q$. No regulation.`,
            plan: plan('Output rule?', '$MR = MC$: $28 - 2Q = 4$', [
              ['$P = MC$: $28 - Q = 4$', 'That is the efficient (regulated) outcome, not what an unregulated monopolist picks.'],
              ['$P = AC$', 'That is a regulator’s choice, not the firm’s.'],
              ['Minimize AC', 'AC falls forever; there is no minimum.'],
            ], '$Q = 12$, then $P = 16$ from demand.'),
            parts: [N('Q^m', 12), N('P^m', 16), N('\\pi', 64), N('\\text{DWL}', 72)],
            sol: md`$28 - 2Q = 4 \Rightarrow Q = 12$, $P = 16$. $\pi = 16(12) - (80 + 48) = 192 - 128 = 64$. Efficient: $28 - Q = 4 \Rightarrow Q = 24$. $\text{DWL} = \tfrac12(24 - 12)(16 - 4) = 72$.` }),
          G('m3_rg_natural', { need: 2 }),
        ],
      },
      // ================================================================ lesson 5
      {
        id: 'm3-rg2', title: 'Regulating a natural monopoly: P = MC vs P = AC', ref: 'Lecture 19 · DS10 Q2',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "regulators set a price ceiling equal to marginal cost" | the efficient price | $P = MC = c$; $Q$ from demand at $c$ |
            | "calculate the economic profit at that price" | does price cover AC? | $\pi = PQ - (F + cQ) = -F$ |
            | "what would the firm do in the long run?" | sign of profit | $\pi < 0$: exits unless subsidized by $F$ |
            | "a price ceiling where $P = AC$" | the break-even price | demand = AC → quadratic → **larger root** |
            | "economic profit at the AC ceiling" | does revenue cover all costs? | $\pi = 0$: stays |
            | "deadweight loss remaining" | lost surplus against $P = MC$ | $\tfrac12(Q^e - Q_{AC})(P_{AC} - MC)$ |
            | "compare efficiency and cost recovery" | the trade-off | table: unregulated / MC / AC |

            Everything here runs on one fact from the last lesson: for a natural monopoly **MC is below AC** at every output.
          `),
          RF(md`
            ### The water utility (DS10 Q2)

            Inverse demand $P = 28 - Q$. Cost $C(Q) = 80 + 4Q$: fixed cost $F = 80$, $MC = 4$, $AC = 4 + 80/Q$.

            **Unregulated (Part 11).** $MR = 28 - 2Q$. Set $MR = MC$:
            $$28 - 2Q = 4 \;\Rightarrow\; 2Q = 24 \;\Rightarrow\; Q = 12, \qquad P = 28 - 12 = 16$$
            $\pi = 16(12) - (80 + 48) = 64$. Efficient output: $28 - Q = 4 \Rightarrow Q^e = 24$. $\text{DWL} = \tfrac12(24 - 12)(16 - 4) = 72$.

            The regulator wants more water at a lower price. Two natural targets: the efficient price $P = MC$, and the break-even price $P = AC$.

            [[fig:reg]]
          `, { reg: { svg: regFig, cap: 'Three outcomes on one demand curve. M: unregulated (12, 16). P = AC: demand crosses AC at (20, 8). P = MC: demand crosses MC at (24, 4). Demand also crosses AC at (4, 24): the other root of the quadratic.' } }),
          RF(md`
            ### Option 1: a ceiling at $P = MC$

            **Move 1: the regulated price.** $P = MC = 4$.

            **Move 2: the quantity.** At a price of 4, consumers want $28 - Q = 4 \Rightarrow Q = 24$. The firm supplies all of it: every unit brings in 4 and costs 4 at the margin.

            **Move 3: profit.**
            $$TR = 4 \times 24 = 96, \qquad TC = 80 + 4(24) = 176, \qquad \pi = 96 - 176 = -80$$
            Or with the rectangle: $AC(24) = 4 + 80/24 = 7.33$, so $\pi = (4 - 7.33)(24) = -80$.

            **Move 4: the long run.** The loss is exactly the fixed cost. Price covers marginal cost on every unit but contributes nothing toward the network. In the short run the firm can keep pumping (price covers AVC = 4), but in the long run it will not replace worn-out pipes at a loss: it **exits**, unless the government pays a **subsidy of 80** (= $F$) each period.

            [[fig:loss]]

            !!key Why $P = MC$ always loses exactly $F$ here
              $\pi = (P - AC)Q = \big(c - (c + F/Q)\big)Q = -\dfrac{F}{Q}Q = -F$. No numbers needed: under marginal-cost pricing a firm with $C = F + cQ$ loses its whole fixed cost.

            Efficient? Yes: $Q = 24 = Q^e$, so DWL = 0, and $CS = \tfrac12(24)(28 - 4) = 288$.
          `, { loss: { svg: mcLossFig, cap: 'P = MC = 4, Q = 24. Revenue (gray) is 4 × 24 = 96. Cost per unit is AC(24) = 7.33, so the red strip (7.33 − 4) × 24 = 80 is the loss: the whole fixed cost.' } }),
          Q(md`A natural monopoly with $C = 300 + 6Q$ is forced to price at marginal cost. Its economic profit is…`, ['$-300$', '0', 'positive', 'impossible to tell without demand'], 0,
            [null, 'Zero profit at P = MC happens only where MC meets the bottom of AC; here AC is above MC everywhere.', 'The ceiling removes all markup.', 'You do not need demand: $(P - AC)Q = -F$ at any Q.'],
            md`$\pi = (6 - 6 - 300/Q)Q = -300$.`),
          Q(md`Under a binding price ceiling, the regulated quantity comes from…`, ['the demand curve at the ceiling price', 'the MR curve at the ceiling price', 'the AC curve at the ceiling price', 'the firm’s untaxed MR = MC point'], 0,
            [null, 'With a ceiling, MR is flat at the ceiling up to demand; the firm sells what consumers buy.', 'AC tells you profit, not quantity.', 'A binding ceiling changes MR, so the old point no longer applies.'],
            md`As long as the ceiling is at or above MC, every unit consumers want at that price is worth selling.`),
          RF(md`
            ### How a ceiling changes the monopolist's MR (briefly)

            Without regulation, selling one more unit means cutting the price on all units: that is why $MR < P$.

            With a ceiling $\bar P$ below the monopoly price, the firm **cannot** charge more than $\bar P$ anyway. So up to the quantity consumers want at $\bar P$, each extra unit sells for exactly $\bar P$ with no price cut on the others: **MR is flat at $\bar P$**, like a price taker. Past that quantity, selling more needs a price below $\bar P$, and MR drops down to the ordinary MR curve.

            At $\bar P = 8$: MR $= 8 > MC = 4$ for every unit up to 20, then at $Q = 20$ it jumps down to $28 - 2(20) = -12$. The firm sells exactly 20.

            [[fig:ceil]]
          `, { ceil: { svg: ceilFig, cap: 'Ceiling at 8. The firm’s demand is flat at 8 until it meets D at Q = 20, then follows D. Its MR is flat at 8 (above MC) up to 20, then drops below zero. So it produces 20.' } }),
          R(md`
            ### Option 2: a ceiling at $P = AC$

            The regulator now wants the **lowest price that still covers cost**, so the firm earns zero economic profit and stays. That is where the demand curve meets AC.

            **Move 1: set demand equal to AC.**
            $$28 - Q = 4 + \frac{80}{Q}$$

            **Move 2: clear the fraction.** Multiply every term by $Q$:
            $$28Q - Q^2 = 4Q + 80$$

            **Move 3: one side equals zero.** Move everything to the right (add $Q^2$, subtract $28Q$):
            $$0 = Q^2 + 4Q - 28Q + 80 \;\Rightarrow\; Q^2 - 24Q + 80 = 0$$

            **Move 4: quadratic formula** with $a = 1$, $b = -24$, $c = 80$ (these $a, b, c$ are the quadratic's coefficients, not demand's):
            $$Q = \frac{24 \pm \sqrt{(-24)^2 - 4(1)(80)}}{2(1)} = \frac{24 \pm \sqrt{576 - 320}}{2} = \frac{24 \pm \sqrt{256}}{2} = \frac{24 \pm 16}{2}$$
            $$Q = \frac{40}{2} = 20 \qquad\text{or}\qquad Q = \frac{8}{2} = 4$$

            **Move 5: pick the root.** Two places where demand crosses AC: $(4, 24)$ and $(20, 8)$.

            - $Q = 4$ means $P = 24$. That is **above** the unregulated price of 16: a ceiling at 24 would not even bind, and consumers would get less water than with no rule at all.
            - $Q = 20$ means $P = 8$: the lowest price at which the firm breaks even.

            **Take the larger root: $Q = 20$, $P = 28 - 20 = 8$.**

            **Move 6: profit.** $TR = 8 \times 20 = 160$, $TC = 80 + 4(20) = 160$, $\pi = 0$. Zero economic profit means the owners earn exactly their next-best return: the firm **stays** in the long run with no subsidy.

            **Move 7: remaining DWL.** Price 8 is still above $MC = 4$, so units from 20 to 24 are lost:
            $$\text{DWL} = \tfrac12(24 - 20)(8 - 4) = \tfrac12(4)(4) = 8$$
            Down from 72 unregulated: average-cost pricing removes about 89% of the deadweight loss.

            !!trap Which root
              The quadratic always has two roots here. Demand crosses the falling AC curve twice: once high and steep (small $Q$, high $P$) and once on the far side (large $Q$, low $P$). The regulator wants the far-side crossing: **the larger $Q$**.
          `),
          RF(md`
            ### The comparison

            | | Unregulated | Ceiling $P = MC$ | Ceiling $P = AC$ |
            |---|---|---|---|
            | Price | 16 | 4 | 8 |
            | Quantity | 12 | 24 | 20 |
            | Profit $\pi$ | 64 | $-80$ | 0 |
            | CS | $\tfrac12(12)(12) = 72$ | $\tfrac12(24)(24) = 288$ | $\tfrac12(20)(20) = 200$ |
            | PS $= (P - MC)Q$ | 144 | 0 | 80 |
            | DWL | 72 | 0 | 8 |
            | Survives in the long run? | yes | only with a subsidy of 80 | yes |

            Check: $CS + PS + \text{DWL} = 288$ in every column (the efficient total). PS here is revenue minus variable cost, so it ignores $F$; profit is $PS - F$.

            [[fig:dwl]]

            !!key Efficiency versus cost recovery
              **$P = MC$** is efficient (no DWL) but the firm loses $F$, so it needs a subsidy, paid by taxpayers.

              **$P = AC$** pays its own way ($\pi = 0$) at the cost of a small DWL.

              **No regulation** is profitable for the firm and the worst for society.
          `, { dwl: { svg: dwlRegFig, cap: 'Red, all of it: the unregulated DWL, 72, from Q = 12 to 24. Darker: the DWL left under P = AC, 8, from Q = 20 to 24.' } }),
          Q(md`Solving $P(Q) = AC(Q)$ for a natural monopoly gives $Q = 5$ and $Q = 45$. The regulated quantity is…`, ['45', '5', '25, the average', 'either; both give zero profit'], 0,
            [null, 'The small root is a high price, above what the monopolist would charge anyway.', 'Not a crossing of demand and AC.', 'Both break even, but the regulator wants the lower price and more output.'],
            md`Larger root: the lowest price that covers cost.`),
          Q(md`Under average-cost pricing, deadweight loss is…`, ['positive but smaller than unregulated', 'zero', 'larger than unregulated', 'equal to the fixed cost'], 0,
            [null, 'P = AC is above MC, so some efficient units are still missing.', 'The price is lower and output higher than the monopoly’s.', 'F is the loss under P = MC, not a DWL.'],
            md`The remaining triangle runs from $Q_{AC}$ to $Q^e$, with height $P_{AC} - MC$.`),
          Q(md`Under a $P = MC$ ceiling with no subsidy, in the long run the natural monopoly…`, ['exits', 'stays and earns zero profit', 'raises its price to AC', 'cuts output to the monopoly level'], 0,
            [null, 'Profit is −F, not zero.', 'The ceiling forbids that.', 'Any output at P = MC still loses F.'],
            md`$\pi = -F < 0$. Long run means no cost is fixed: the firm will not rebuild its network at a loss.`),
          Q(md`Which regime gives the highest **consumer** surplus?`, ['$P = MC$', '$P = AC$', 'no regulation', 'they are all the same'], 0,
            [null, 'Higher price, less output than P = MC.', 'The highest price and the least output.', 'Price and quantity differ across regimes.'],
            md`Lowest price, most output: CS = 288 in DS10 Q2 (versus 200 and 72).`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`A utility has $C = 500 + 6Q$ and is forced to price at marginal cost.`,
            plan: plan('What subsidy keeps it in business?', '500 per period, the fixed cost', [
              ['Zero: P = MC is efficient', 'Efficient for society, but the firm loses its fixed cost.'],
              ['6 per unit', 'Price already covers the 6 per unit; what is missing is the network cost.'],
              ['It depends on demand', 'The loss is $F$ at any quantity.'],
            ], '$\\pi = -F = -500$, so a subsidy of 500 makes $\\pi = 0$.') }),
          P({ q: md`You solved $P(Q) = AC(Q)$ and got $Q = 4$ and $Q = 20$ (DS10 Q2).`,
            plan: plan('Which root do you use, and why?', '$Q = 20$: the lowest price that covers cost', [
              ['$Q = 4$: the first root is the one the firm prefers', 'The regulator picks the ceiling, and $P = 24$ would be above the monopoly price of 16.'],
              ['Either: both give zero profit', 'Both break even, but only the larger root lowers the price.'],
              ['Neither: use MR = AC', 'The ceiling is a price consumers pay, so it sits on demand.'],
            ], '$P = 28 - 20 = 8$.') }),
          P({ q: md`"Calculate the deadweight loss remaining when the price ceiling is set at $P = AC$."`,
            plan: plan('Which triangle?', 'Between demand and MC, from $Q_{AC}$ to $Q^e$ (where $P = MC$)', [
              ['Between demand and AC, from $Q_{AC}$ to $Q^e$', 'DWL compares value with marginal cost; AC is not the cost of an extra unit.'],
              ['Between demand and MC, from the monopoly $Q$ to $Q^e$', 'That is the unregulated DWL.'],
              ['The fixed cost $F$', 'That is the loss under $P = MC$, not a DWL.'],
            ], 'DS10: $\\tfrac12(24 - 20)(8 - 4) = 8$.') }),
          P({ q: md`A regulator caps the water price at \$20; the unregulated monopoly price is \$16.`,
            plan: plan('What happens?', 'Nothing: the cap is above the price the firm already charges, so it does not bind', [
              ['The firm raises its price to \\$20', 'It already chose 16 as its best price; a cap does not make 20 more profitable.'],
              ['Quantity comes from demand at \\$20', 'Only a binding cap (below 16) sets quantity from demand.'],
              ['The firm exits', 'It still earns its unregulated profit.'],
            ], 'A ceiling binds only if it is below the unregulated price.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'DS10 Q2, all parts', q: md`$P = 28 - Q$, $C = 80 + 4Q$. (a)–(c) A price ceiling at $P = MC$. (d)–(f) A ceiling at $P = AC$.`,
            plan: [
              plan('(a) Regulated quantity under $P = MC$?', 'Demand at $P = 4$: $Q = 24$', [
                ['From $MR = 4$: $Q = 12$', 'That is the unregulated choice. A binding ceiling makes MR flat at 4.'],
                ['From $AC = 4$', 'AC never reaches 4.'],
                ['From $P = AC$', 'That is the second regulation.'],
              ], '$28 - Q = 4$.'),
              plan('(d) The equation for $P = AC$?', '$28 - Q = 4 + 80/Q$, i.e. $Q^2 - 24Q + 80 = 0$', [
                ['$28 - 2Q = 4 + 80/Q$', 'That uses MR. The ceiling is on the demand curve.'],
                ['$4 + 80/Q = 4$', 'No finite $Q$ solves that.'],
                ['$28 - Q = 80/Q$', 'You dropped the variable cost per unit, 4.'],
              ], 'Quadratic formula; larger root.'),
            ],
            parts: [N('P_{MC}', 4), N('Q_{MC}', 24), N('\\pi_{MC}', -80),
              FIX('(c) Long run under $P = MC$ with no subsidy:', ['exits', 'stays'], 0, [null, 'Profit is −80.']),
              N('Q_{AC}', 20), N('P_{AC}', 8), N('\\pi_{AC}', 0), N('\\text{DWL}_{AC}', 8)],
            sol: md`
              **(a)** $P = 4$, $Q = 24$. **(b)** $\pi = 96 - 176 = -80$. **(c)** Exits in the long run unless subsidized 80.

              **(d)** $Q^2 - 24Q + 80 = 0 \Rightarrow Q = (24 \pm 16)/2 = 20$ or 4. Take 20; $P = 8$.

              **(e)** $\pi = 160 - 160 = 0$: stays. **(f)** $\text{DWL} = \tfrac12(4)(4) = 8$, versus 72 unregulated.
            ` }),
          P({ title: 'A second utility', q: md`$P = 40 - Q$, $C = 125 + 10Q$.`,
            plan: plan('Steps for the $P = AC$ ceiling?', 'Demand = AC, multiply by $Q$, quadratic, larger root', [
              ['Set $MR = MC$, then charge AC there', 'That is the unregulated quantity; the ceiling changes it.'],
              ['Set $P = MC$, then add the fixed cost', 'P = MC gives Q = 30 and a loss of 125; that is the other regulation.'],
              ['Minimize AC', 'AC falls forever.'],
            ], '$40 - Q = 10 + 125/Q \\Rightarrow Q^2 - 30Q + 125 = 0$.'),
            parts: [N('Q^m', 15), N('\\pi^m', 100), N('Q_{MC}', 30), N('\\pi_{MC}', -125), N('Q_{AC}', 25), N('P_{AC}', 15), N('\\text{DWL}_{AC}', 12.5), N('\\text{DWL}^m', 112.5)],
            sol: md`
              **Unregulated.** $40 - 2Q = 10 \Rightarrow Q = 15$, $P = 25$, $\pi = 25(15) - (125 + 150) = 100$. DWL $= \tfrac12(30 - 15)(25 - 10) = 112.5$.

              **P = MC.** $P = 10$, $Q = 30$, $\pi = 300 - 425 = -125$.

              **P = AC.** $Q = \dfrac{30 \pm \sqrt{900 - 500}}{2} = \dfrac{30 \pm 20}{2} = 25$ or 5. Take 25: $P = 15$ (check $AC = 10 + 5 = 15$ ✓). DWL $= \tfrac12(30 - 25)(15 - 10) = 12.5$.
            ` }),
          P({ title: 'Steeper demand', q: md`$P = 100 - 2Q$, $C = 600 + 20Q$.`,
            plan: plan('After you clear the fraction, what quadratic do you get?', '$2Q^2 - 80Q + 600 = 0$', [
              ['$Q^2 - 80Q + 600 = 0$', 'Multiplying $-2Q$ by $Q$ gives $-2Q^2$; keep the 2.'],
              ['$2Q^2 - 100Q + 600 = 0$', 'You forgot to subtract the $20Q$ from the cost side.'],
              ['$2Q^2 - 80Q - 600 = 0$', 'Moving $+600$ across and back: check the sign.'],
            ], 'Divide by 2: $Q^2 - 40Q + 300 = 0 \\Rightarrow Q = 30$ or 10.'),
            parts: [N('Q_{AC}', 30), N('P_{AC}', 40), N('Q_{MC}', 40), N('\\pi_{MC}', -600), N('\\text{DWL}_{AC}', 100)],
            sol: md`
              **Move 1.** $100 - 2Q = 20 + 600/Q \Rightarrow 100Q - 2Q^2 = 20Q + 600 \Rightarrow 2Q^2 - 80Q + 600 = 0 \Rightarrow Q^2 - 40Q + 300 = 0$.

              **Move 2.** $Q = \dfrac{40 \pm \sqrt{1600 - 1200}}{2} = \dfrac{40 \pm 20}{2} = 30$ or 10. Take 30: $P = 100 - 60 = 40$ ($AC = 20 + 20 = 40$ ✓).

              **Move 3.** $P = MC = 20$: $Q = 40$, $\pi = -600$. DWL under AC pricing: $\tfrac12(40 - 30)(40 - 20) = 100$ (unregulated: $Q = 20$, $P = 60$, DWL 400).
            ` }),
          P({ title: 'A ceiling in between', q: md`$P = 28 - Q$, $C = 80 + 4Q$. The regulator caps the price at \$10.`,
            plan: plan('Quantity?', 'Demand at the cap: $Q = 18$ (the cap binds, since $10 < 16$)', [
              ['$MR = MC$: $Q = 12$', 'The cap is below the monopoly price, so it binds: MR is flat at 10 up to demand.'],
              ['$MC = 10$', 'MC is flat at 4; it never equals 10.'],
              ['$AC = 10$: $Q = 13.3$', 'AC tells you profit, not quantity.'],
            ], '$28 - Q = 10$.'),
            parts: [N('Q', 18), N('\\pi', 28), N('CS', 162), N('\\text{DWL}', 18)],
            sol: md`$Q = 18$. $\pi = 10(18) - (80 + 72) = 28 > 0$: stays. $CS = \tfrac12(18)(28 - 10) = 162$. $\text{DWL} = \tfrac12(24 - 18)(10 - 4) = 18$: between the AC-pricing 8 and the unregulated 72.` }),
          G('m3_rg_regulate', { need: 3 }),
          G('m3_rg_ceiling', { need: 3 }),
          R(md`
            ### Which tax, which regulation, which equation

            | Situation | Equation for $Q$ | Then the prices | Money |
            |---|---|---|---|
            | untaxed monopoly | $MR = MC$ | $P$ from demand | $\pi = (P - AC)Q$ |
            | specific tax $t$ (on either side) | $MR - t = MC$ | $P_c = P(Q)$, $P_p = P_c - t$ | $G = tQ$ |
            | ad valorem tax $v$ | $(1 - v)MR = MC$ | $P_c = P(Q)$, $P_p = (1 - v)P_c$ | $G = vP_cQ$ |
            | specific tax with the same $Q$ as $v$ | $t = MR - MC = v\,MR$ at that $Q$ | same $P_c$ | $tQ < vP_cQ$ |
            | pass-through, linear demand, flat MC | $a - 2bQ - t = c$ | $P_c = (a + c + t)/2$, so $dP_c/dt = \tfrac12$ | consumers bear half |
            | pass-through, linear demand, $MC = c + dQ$ | $a - 2bQ - t = c + dQ$ | $dP_c/dt = b/(2b + d) < \tfrac12$ | consumers bear less than half |
            | pass-through, $Q = kP^{-e}$, flat MC | $P(1 - 1/e) = c + t$ | $P_c = \tfrac{e}{e - 1}(c + t)$, so $dP_c/dt = \tfrac{e}{e - 1} > 1$ | consumers bear more than 100% |
            | efficient benchmark | $P = MC$ | price equals marginal cost | every DWL is measured from here |
            | natural monopoly, ceiling $P = MC$ | $Q$ from demand at $c$ | $P = MC = c$ | $\pi = -F$: exits without a subsidy |
            | natural monopoly, ceiling $P = AC$ | $P(Q) = AC(Q)$, larger root | $P = AC(Q)$ | $\pi = 0$: stays |
            | any binding ceiling $\bar P$ | $Q$ from demand at $\bar P$ | $P = \bar P$ | $\pi = \bar PQ - C(Q)$ |

            !!method Two questions decide every problem in this Part
              **1. Who keeps what per unit?** Specific: $P(Q) - t$. Ad valorem: $(1 - v)P(Q)$. Ceiling: $\bar P$ up to demand. That fixes the firm's MR.

              **2. Which benchmark?** DWL always against $P = MC$. Long-run survival always from the sign of $\pi$.
          `),
        ],
      },
    ],
  });
})();

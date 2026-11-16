/* Mini Exam 3 · Part 11: monopoly. Lecture 18 is not in the materials, so this Part is taught from first principles,
   consistent with the formula sheet and DS10 Q1 (P = 500 - 2Q, MC = Q: Q = 100, P = 300, DWL = 6666.67).
   Four lessons: why MR < P, MR = MC then price from demand, welfare against the P = MC benchmark, elasticity and
   the Lerner index. Every lesson opens with the exam phrasings and every practice problem asks for the plan first. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, X, FIX, plan, gen, F, pick, ri } = M3;

  const co = (v) => (v === 1 ? '' : F(v));                      // a coefficient: 1Q prints as Q
  const tm = (c, x) => (c === 1 ? F(x) : `${F(c)}(${F(x)})`);   // c times x, written out
  const ORD = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' };

  // ------------------------------------------------------------------ lesson 1 figures
  // the well: P = 10 - Q. From 3 barrels to 4: gain the new barrel's price (6), lose 1 on each of the 3 old ones.
  const wellFig = EC.graph({
    w: 330, h: 260, x: [0, 10.8], y: [0, 10.8], xl: 'Q', yl: 'P', xt: [3, 4, 5, 10], yt: [6, 7, 10],
    items: [
      { poly: [[3, 0], [4, 0], [4, 6], [3, 6]], cls: 'gain' },
      { poly: [[0, 6], [3, 6], [3, 7], [0, 7]], cls: 'loss' },
      { seg: [[0, 10], [10, 0]], lab: 'P = 10 - Q', at: 0.8, dx: 6, dy: -4, anchor: 'bl' },
      { seg: [[0, 10], [5, 0]], cls: 'curve c2 dash', lab: 'MR = 10 - 2Q', at: 0.86, dx: 8, dy: 0, anchor: 'l' },
      { pt: [3, 7], guide: true }, { pt: [4, 6], guide: true },
      { text: [3.5, 2.4], t: '+6' }, { text: [1.5, 6.5], t: '-3' },
    ],
  });
  // the TR hill for the well: TR = 10Q - Q^2, top at Q = 5 where MR = 0
  const trFig = EC.graph({
    w: 320, h: 230, x: [0, 10.8], y: [0, 29], xl: 'Q', yl: 'TR', xt: [5, 10], yt: [25],
    items: [
      { f: (q) => 10 * q - q * q, from: 0, to: 10, cls: 'c3', lab: 'TR = 10Q - Q^2', labX: 8.4, dx: 8, dy: -2, anchor: 'l' },
      { pt: [5, 25], lab: 'MR = 0', at: 't', guide: true },
      { text: [2.2, 22], t: 'MR > 0' }, { text: [8.1, 22], t: 'MR < 0' },
    ],
  });
  // DS10 demand and its MR: same intercept, twice the slope
  const linFig = EC.graph({
    w: 330, h: 260, x: [0, 270], y: [0, 540], xl: 'Q', yl: 'P', xt: [125, 250], yt: [500],
    items: [
      { seg: [[0, 500], [250, 0]], lab: 'P = 500 - 2Q', at: 0.62, dx: 6, dy: -2, anchor: 'bl' },
      { seg: [[0, 500], [125, 0]], cls: 'curve c2', lab: 'MR = 500 - 4Q', at: 0.72, dx: 8, dy: 0, anchor: 'l' },
    ],
  });

  // ------------------------------------------------------------------ lesson 1 generators
  gen('m3_mo_mr', () => {
    const direct = Math.random() < 0.5;
    let a, b, Bd = 1, Qmax;
    if (direct) { a = pick([20, 30, 40, 50, 60, 80, 100]); Bd = pick([2, 4, 5, 10]); b = 1 / Bd; Qmax = a * Bd / 2; }
    else { b = pick([1, 2, 3, 4, 5]); Qmax = pick([10, 15, 20, 25, 30, 40]); a = 2 * b * Qmax; }
    const Q0 = Math.round(Qmax * pick([0.4, 0.5, 0.6, 0.8, 1.2]) * 10) / 10;
    const P0 = a - b * Q0, MR0 = a - 2 * b * Q0, TRmax = a * Qmax / 2;
    const inv = `P = ${a} - ${co(b)}Q`, mr = `${a} - ${co(2 * b)}Q`, tr = `${a}Q - ${co(b)}Q^2`, dem = `Q = ${a * Bd} - ${co(Bd)}P`;
    const mrStep = direct
      ? plan('The demand is written as $Q = \\ldots$. What is your first move?', 'Invert it: solve for $P$, then build $TR = P(Q)\\,Q$', [
        ['Differentiate $Q$ with respect to $P$ and call that MR', '$dQ/dP$ is the slope of demand, not marginal revenue. MR is extra **revenue** per extra unit of **output**, so revenue must be a function of $Q$.'],
        ['Double the coefficient of $P$ in $Q = \\ldots$', 'The twice-the-slope rule is for the **inverse** demand $P = a - bQ$. Doubling inside the direct form gives a meaningless line.'],
        ['Use the demand curve itself as MR', 'That is the price taker’s case. This seller must cut its price to sell more, so MR lies below demand.'],
      ], `$${co(Bd)}P = ${a * Bd} - Q \\Rightarrow ${inv}$. Then $MR = ${mr}$.`)
      : plan('How do you get MR from this demand?', '$TR = P(Q)\\,Q = aQ - bQ^2$, then differentiate: $MR = a - 2bQ$', [
        ['$MR = P(Q)$: demand is the MR curve', 'Only for a price taker. A monopolist cuts the price on every unit to sell one more, so MR is below the price.'],
        ['$MR = a - \\tfrac{b}{2}Q$: half the slope', 'Backwards. $TR = aQ - bQ^2$ differentiates to $a - 2bQ$: twice as steep, not half.'],
        ['$MR = TR/Q$', 'Total revenue over quantity is the price (average revenue), not the extra revenue from one more unit.'],
      ], `$TR = ${tr}$, so $MR = ${mr}$.`);
    return {
      title: 'TR and MR from a demand curve',
      q: md`A firm is the only seller of its product. Its demand is $${direct ? dem : inv}$. (a) Write total revenue and marginal revenue as functions of $Q$. (b) At what output is total revenue largest, and what is that revenue? (c) Find the price and the marginal revenue at $Q = ${F(Q0)}$.`,
      plan: [mrStep,
        plan('For (b): where is total revenue largest?', 'Where $MR = 0$', [
          ['Where $P = 0$', 'At a zero price revenue is zero: that is the bottom of the TR hill, not the top.'],
          ['Where $MR = P$', 'MR equals P only at $Q = 0$, where revenue is zero.'],
          ['At the largest quantity buyers will take', 'Selling more needs a lower price on every unit; past the $MR = 0$ point each extra unit lowers revenue.'],
        ], `$MR = 0$ at $Q = ${F(Qmax)}$, half of the quantity where demand hits zero.`)],
      parts: [X('TR(Q)', `${a}*Q - ${b}*Q^2`, { Q: [1, 2 * Qmax - 1] }), X('MR(Q)', `${a} - ${2 * b}*Q`, { Q: [1, 2 * Qmax - 1] }),
        N('Q\\text{ at the top of TR}', Qmax), N('TR_{\\max}', TRmax), N(`P\\text{ at }Q = ${F(Q0)}`, P0), N(`MR\\text{ at }Q = ${F(Q0)}`, MR0)],
      hints: [direct ? `Solve $${dem}$ for $P$ first.` : `$TR = (${a} - ${co(b)}Q)Q$.`, `$MR = ${mr}$. Set it to zero for (b).`],
      sol: md`
        ${direct ? `**Move 1: invert.** $${dem}$, so $${co(Bd)}P = ${a * Bd} - Q$ and $${inv}$.` : `The demand is already inverse: $${inv}$, so $a = ${a}$ and $b = ${F(b)}$.`}

        **Move ${direct ? 2 : 1}: total revenue.** $TR = P(Q)\,Q = (${a} - ${co(b)}Q)\,Q = ${tr}$.

        **Move ${direct ? 3 : 2}: marginal revenue.** Differentiate with the power rule: $MR = ${mr}$. Same intercept (${a}), twice the slope.

        **Move ${direct ? 4 : 3}: top of the TR hill.** $MR = 0$: $${co(2 * b)}Q = ${a} \Rightarrow Q = ${F(Qmax)}$, half of $${F(2 * Qmax)}$ where demand hits zero. There $P = ${a} - ${tm(b, Qmax)} = ${F(a / 2)}$ and $TR_{\max} = ${F(a / 2)} \times ${F(Qmax)} = ${F(TRmax)}$.

        **Move ${direct ? 5 : 4}: at $Q = ${F(Q0)}$.** $P = ${a} - ${tm(b, Q0)} = ${F(P0)}$ and $MR = ${a} - ${tm(2 * b, Q0)} = ${F(MR0)}$. MR is below the price by $bQ = ${F(b * Q0)}$: the loss from cutting the price ${F(b)} per extra unit on each of the ${F(Q0)} units already sold. ${MR0 < 0 ? 'MR is negative here: past the top of the TR hill, one more unit lowers revenue.' : ''}
      `,
    };
  });

  gen('m3_mo_table', () => {
    const b = pick([1, 2, 3, 4]), a = 6 * b + pick([2, 4, 6, 8, 10]), k = ri(2, 6);
    const Pk = a - b * k, Pk1 = a - b * (k - 1), TRk = Pk * k, TRk1 = Pk1 * (k - 1), MRk = TRk - TRk1, loss = (k - 1) * b;
    const rows = ['| $Q$ | $P$ |', '|---|---|'];
    for (let q = 1; q <= 6; q++) rows.push(`| ${q} | ${a - b * q} |`);
    const old = `${k - 1} unit${k - 1 === 1 ? '' : 's'}`;
    return {
      title: 'Marginal revenue from a demand table',
      q: `A firm is the only seller in its market and charges one price to everybody. Its demand schedule:\n\n${rows.join('\n')}\n\nFind total revenue at $Q = ${k}$ and the marginal revenue of the ${ORD[k]} unit. Then split that MR into the gain on the new unit and the loss on the units already sold.`,
      plan: plan(`How do you get the MR of the ${ORD[k]} unit from a table?`, `$TR(${k}) - TR(${k - 1})$: the change in total revenue`, [
        [`The price at $Q = ${k}$`, 'That is only the gain on the new unit. Selling it forced the price down on every earlier unit too.'],
        [`$P(${k}) - P(${k - 1})$`, 'That is the change in **price**, not the change in revenue.'],
        [`$TR(${k})$ divided by ${k}`, 'Total revenue over quantity is the price again (average revenue).'],
      ], `$TR = P \\times Q$ on each row, then subtract the row above. Check: gain $= P(${k})$, loss $= ${k - 1} \\times$ the price drop.`),
      parts: [N(`TR\\text{ at }Q = ${k}`, TRk), N(`MR\\text{ of unit }${k}`, MRk), N('\\text{gain on the new unit}', Pk), N('\\text{loss on the old units}', loss)],
      hints: [`$TR(${k - 1}) = ${Pk1} \\times ${k - 1}$ and $TR(${k}) = ${Pk} \\times ${k}$.`],
      sol: md`
        **Move 1: revenue on each row.** $TR(${k - 1}) = ${Pk1} \times ${k - 1} = ${TRk1}$ and $TR(${k}) = ${Pk} \times ${k} = ${TRk}$.

        **Move 2: MR is the change.** $MR = ${TRk} - ${TRk1} = ${MRk}$.

        **Move 3: split it.** Gain: the ${ORD[k]} unit sells for ${Pk}. Loss: the price fell by ${b} on each of the ${old} already sold, $${k - 1} \times ${b} = ${loss}$. Net: $${Pk} - ${loss} = ${MRk}$ ✓. ${MRk < 0 ? 'Negative: the loss on the old units is bigger than the new unit’s price, so this unit lowers revenue.' : 'MR is below the price, as it must be for a seller facing a downward demand.'}
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 2 figures
  // DS10: P = 500 - 2Q, MR = 500 - 4Q, MC = Q. MR = MC at Q = 100 (height 100); go up to demand: P = 300.
  const QC10 = 500 / 3;
  const monoFig = EC.graph({
    w: 340, h: 270, x: [0, 270], y: [0, 540], xl: 'Q', yl: 'P', xt: [100, [QC10, '166.7']], yt: [100, [QC10, '166.7'], 300, 500],
    items: [
      { seg: [[0, 500], [250, 0]], lab: 'D', at: 0.93, dx: 6, dy: -2, anchor: 'bl' },
      { seg: [[0, 500], [125, 0]], cls: 'curve c2', lab: 'MR', at: 0.9, dx: 8, dy: 0, anchor: 'l' },
      { seg: [[0, 0], [260, 260]], cls: 'curve c5', lab: 'MC = Q', at: 0.97, dx: -4, dy: -6, anchor: 'br' },
      { arrow: [[100, 112], [100, 288]] },
      { pt: [100, 100], lab: 'MR = MC', at: 'r', guide: 'x' },
      { pt: [100, 300], lab: '(100,\\ 300)', at: 'tr', guide: 'y' },
      { pt: [QC10, QC10], lab: 'P = MC', at: 'tl' },
    ],
  });
  // patent drug: P = 100 - 2Q, C = 200 + 20Q. Q = 20, P = 60, AC = 30, profit (60 - 30)(20) = 600
  const profitFig = EC.graph({
    w: 330, h: 260, x: [0, 55], y: [0, 110], xl: 'Q', yl: '\\$', xt: [20, 40], yt: [20, 30, 60, 100],
    items: [
      { poly: [[0, 30], [20, 30], [20, 60], [0, 60]], cls: 'gain' },
      { seg: [[0, 100], [50, 0]], lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 100], [25, 0]], cls: 'curve c2', lab: 'MR', at: 0.92, dx: 8, dy: 0, anchor: 'l' },
      { seg: [[0, 20], [55, 20]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 4, anchor: 'tr' },
      { f: (q) => 20 + 200 / q, from: 3, to: 55, lab: 'AC', labX: 52, dx: 0, dy: -6, anchor: 'b' },
      { pt: [20, 60], guide: true }, { pt: [20, 30] }, { pt: [20, 20], lab: 'MR = MC', at: 'bl' },
      { text: [10, 45], t: '\\pi = 600' },
    ],
  });

  // ------------------------------------------------------------------ lesson 2 generator
  // demand P = a - bQ, MC = c + dQ, C = F + cQ + (d/2)Q^2; Qm = (b + d)k so every number is clean
  const costTxt = (Fx, c, d) => [Fx ? `${Fx}` : '', c ? `${c}Q` : '', d ? `${co(d / 2)}Q^2` : ''].filter(Boolean).join(' + ');
  const mcTxt = (c, d) => (d ? (c ? `${c} + ${co(d)}Q` : `${co(d)}Q`) : `${c}`);
  const monoDraw = () => {
    const b = pick([1, 2, 3, 4]), d = pick([0, 0, 1, 2]), c = d ? pick([0, 2, 4, 5, 10]) : pick([2, 4, 5, 10, 20]);
    const k = pick([3, 4, 5, 6, 8, 10]), Qm = (b + d) * k, a = c + (2 * b + d) * Qm;
    const Pm = a - b * Qm, MCm = c + d * Qm, Qc = (2 * b + d) * k, Pc = a - b * Qc;
    const PS = (b + d / 2) * Qm * Qm, Fx = Math.round(pick([0, 0.1, 0.2, 0.3, 0.5]) * PS / 10) * 10, pi = PS - Fx;
    const CS = 0.5 * b * Qm * Qm, DWL = 0.5 * (Qc - Qm) * (Pm - MCm), CSc = 0.5 * b * Qc * Qc, PSc = 0.5 * d * Qc * Qc;
    return { a, b, c, d, k, Qm, Pm, MCm, Qc, Pc, PS, Fx, pi, CS, DWL, CSc, PSc, cost: costTxt(Fx, c, d), mc: mcTxt(c, d), mr: `${a} - ${co(2 * b)}Q`, dem: `P = ${a} - ${co(b)}Q` };
  };
  const PLAN_MRMC = (m) => plan('What is your first equation?', `$MR = MC$: $${m.mr} = ${m.mc}$`, [
    [`$P = MC$: $${m.a} - ${co(m.b)}Q = ${m.mc}$`, 'That is the price taker’s rule. A monopolist must cut its price to sell more, so it compares MC with MR, which is below the price.'],
    [`$MR = 0$: $${m.mr} = 0$`, 'That maximizes **revenue** and ignores cost. Each unit costs MC to make.'],
    ['$P = AC$', 'That is where profit is **zero**, not where it is largest.'],
  ], `MR: same intercept as demand, twice the slope. MC $= dC/dQ = ${m.mc}$ (the fixed cost drops out). Set them equal and solve for $Q$.`);
  const PLAN_UP = plan('You have $Q_m$. How do you get the price?', 'Plug $Q_m$ into the **demand** curve', [
    ['Read it where MR meets MC', 'That height is the marginal revenue and marginal cost of the last unit. Buyers pay what **demand** says they will pay for $Q_m$ units, which is higher.'],
    ['Plug $Q_m$ into MC', 'MC is what the last unit costs the firm, not what buyers pay.'],
    ['Set $P = AC(Q_m)$', 'AC is cost per unit; it gives profit per unit when compared with the price, not the price itself.'],
  ], 'Demand is the list of deals: the highest price at which buyers take $Q_m$ units. Charge that.');

  gen('m3_mo_qp', () => {
    const m = monoDraw();
    return {
      title: 'Monopoly price, quantity and profit',
      q: md`A monopolist faces inverse demand $${m.dem}$ and has total cost $C(Q) = ${m.cost}$. (a) Find the profit-maximizing quantity and price. (b) Find its economic profit. (c) If the industry were perfectly competitive instead (same demand, and MC as the supply curve), what would quantity and price be?`,
      plan: [PLAN_MRMC(m), PLAN_UP,
        plan('For (c): what is the competitive outcome?', 'Where demand meets MC: $P = MC$', [
          ['$MR = MC$ again', 'That is the monopoly answer from (a). Competitive firms are price takers: each produces until $P = MC$.'],
          ['$MR = 0$', 'That is the revenue-maximizing point of a single seller, not a competitive market.'],
          ['Double the monopoly quantity', 'That shortcut holds only for straight-line demand with **constant** MC. Solve demand $=$ MC.'],
        ], `$${m.a} - ${co(m.b)}Q = ${m.mc}$.`)],
      parts: [N('Q_m', m.Qm), N('P_m', m.Pm), N('\\pi', m.pi), N('Q_c', m.Qc), N('P_c', m.Pc)],
      hints: [`$MR = ${m.mr}$ and $MC = ${m.mc}$.`, `Profit $= P_m Q_m - C(Q_m)$.`],
      sol: md`
        **Move 1: MR and MC.** $MR = ${m.mr}$ (twice the slope of demand). $MC = \dfrac{dC}{dQ} = ${m.mc}$${m.Fx ? `; the fixed cost ${m.Fx} drops out` : ''}.

        **Move 2: $MR = MC$.**
        $$${m.mr} = ${m.mc} \;\Rightarrow\; ${m.a - m.c} = ${co(2 * m.b + m.d)}Q \;\Rightarrow\; Q_m = ${m.Qm}$$

        **Move 3: up to demand.** $P_m = ${m.a} - ${tm(m.b, m.Qm)} = ${m.Pm}$. (MR and MC at $Q_m$ are only ${m.MCm}: never quote that as the price.)

        **Move 4: profit.** $TR = ${m.Pm} \times ${m.Qm} = ${F(m.Pm * m.Qm)}$. $C(${m.Qm}) = ${F(m.Pm * m.Qm - m.pi)}$. $\pi = ${F(m.Pm * m.Qm)} - ${F(m.Pm * m.Qm - m.pi)} = ${F(m.pi)}$.

        **Move 5: competitive benchmark.** $P = MC$: $${m.a} - ${co(m.b)}Q = ${m.mc} \Rightarrow ${m.a - m.c} = ${co(m.b + m.d)}Q \Rightarrow Q_c = ${m.Qc}$, $P_c = ${m.Pc}$. The monopoly sells less (${m.Qm} < ${m.Qc}) at a higher price (${m.Pm} > ${m.Pc}).
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 3 figures
  const ds10Base = (extra) => EC.graph({
    w: 340, h: 270, x: [0, 270], y: [0, 540], xl: 'Q', yl: 'P', xt: [100, [QC10, '166.7']], yt: [100, [QC10, '166.7'], 300, 500],
    items: [
      ...extra,
      { seg: [[0, 500], [250, 0]], lab: 'D', at: 0.93, dx: 6, dy: -2, anchor: 'bl' },
      { seg: [[0, 0], [260, 260]], cls: 'curve c5', lab: 'MC', at: 0.97, dx: -4, dy: -6, anchor: 'br' },
    ],
  });
  // monopoly: CS triangle, PS trapezoid, DWL triangle
  const welfFig = ds10Base([
    { poly: [[0, 300], [0, 500], [100, 300]], cls: 'cs' },
    { poly: [[0, 0], [0, 300], [100, 300], [100, 100]], cls: 'gain' },
    { poly: [[100, 300], [100, 100], [QC10, QC10]], cls: 'loss' },
    { seg: [[0, 500], [125, 0]], cls: 'curve c2 dash', lab: 'MR', at: 0.9, dx: 8, dy: 0, anchor: 'l' },
    { pt: [100, 300], guide: 'y' }, { pt: [100, 100], guide: 'x' }, { pt: [QC10, QC10] },
    { text: [30, 365], t: '\\text{CS}' }, { text: [45, 200], t: '\\text{PS}' }, { text: [124, 195], t: '\\text{DWL}' },
  ]);
  // competitive benchmark: CS and PS triangles
  const compFig = ds10Base([
    { poly: [[0, QC10], [0, 500], [QC10, QC10]], cls: 'cs' },
    { poly: [[0, 0], [0, QC10], [QC10, QC10]], cls: 'gain' },
    { pt: [QC10, QC10], guide: true },
    { text: [50, 270], t: '\\text{CS}' }, { text: [55, 115], t: '\\text{PS}' },
  ]);
  // what monopoly does to the competitive surplus: A = transfer rectangle, B and C = the two pieces of DWL
  const transFig = ds10Base([
    { poly: [[0, QC10], [100, QC10], [100, 300], [0, 300]], cls: 'ex' },
    { poly: [[100, 300], [100, QC10], [QC10, QC10]], cls: 'loss' },
    { poly: [[100, QC10], [100, 100], [QC10, QC10]], cls: 'loss' },
    { seg: [[0, QC10], [QC10, QC10]], cls: 'guide' },
    { pt: [100, 300], guide: 'y' }, { pt: [100, 100], guide: 'x' }, { pt: [QC10, QC10] },
    { text: [50, 233], t: 'A' }, { text: [118, 212], t: 'B' }, { text: [118, 140], t: 'C' },
  ]);
  // constant MC (the drug): P = 100 - 2Q, MC = 20. CS 400, PS rectangle 800, DWL 400
  const cmcFig = EC.graph({
    w: 330, h: 260, x: [0, 55], y: [0, 110], xl: 'Q', yl: 'P', xt: [20, 40], yt: [20, 60, 100],
    items: [
      { poly: [[0, 60], [0, 100], [20, 60]], cls: 'cs' },
      { poly: [[0, 20], [20, 20], [20, 60], [0, 60]], cls: 'gain' },
      { poly: [[20, 60], [20, 20], [40, 20]], cls: 'loss' },
      { seg: [[0, 100], [50, 0]], lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 100], [25, 0]], cls: 'curve c2 dash', lab: 'MR', at: 0.92, dx: 8, dy: 0, anchor: 'l' },
      { seg: [[0, 20], [55, 20]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 4, anchor: 'tr' },
      { pt: [20, 60], guide: 'y' }, { pt: [40, 20] },
      { text: [6, 71], t: '\\text{CS}' }, { text: [10, 40], t: '\\text{PS}' }, { text: [25.5, 32], t: '\\text{DWL}' },
    ],
  });

  // ------------------------------------------------------------------ lesson 3 generator: the classic monopoly problem
  gen('m3_mo_classic', () => {
    const m = monoDraw();
    const W = m.CS + m.PS, Wc = m.CSc + m.PSc;
    const psStep = m.d
      ? plan(`MC rises ($MC = ${m.mc}$). What shape is producer surplus?`, 'A trapezoid between the price line and MC from 0 to $Q_m$ (equivalently $TR - VC$)', [
        ['A rectangle, $(P_m - MC(Q_m))\\,Q_m$', 'That misses the triangle under the rectangle: earlier units cost less than $MC(Q_m)$, so they earn more than $P_m - MC(Q_m)$ each.'],
        ['$P_m \\times Q_m$', 'That is total revenue. PS subtracts the variable cost (the area under MC).'],
        ['A triangle between demand and MC', 'That is (part of) the deadweight loss, out past $Q_m$.'],
      ], `Left side $P_m - MC(0) = ${m.Pm - m.c}$, right side $P_m - MC(Q_m) = ${m.Pm - m.MCm}$, width $Q_m = ${m.Qm}$.`)
      : plan(`MC is constant at ${m.c}. What shape is producer surplus?`, 'A rectangle: $(P_m - MC)\\,Q_m$', [
        ['A triangle under the price line', 'With a flat MC the area between price and MC has the same height on every unit: a rectangle.'],
        ['$P_m \\times Q_m$', 'That is total revenue; PS subtracts variable cost $MC \\times Q_m$.'],
        ['Zero, because $P = MC$', '$P = MC$ only in competition. The monopolist prices above MC.'],
      ], `$(${m.Pm} - ${m.c}) \\times ${m.Qm}$.`);
    return {
      title: 'The classic monopoly problem',
      q: md`A monopolist faces $${m.dem}$ and has total cost $C(Q) = ${m.cost}$. Find (a) its quantity and price, (b) its economic profit, (c) the efficient (competitive) quantity and price, and (d) consumer surplus, producer surplus and the deadweight loss under monopoly.`,
      plan: [PLAN_MRMC(m),
        plan('For the deadweight loss: what is the efficient benchmark, and what is the triangle?', 'Demand $=$ MC gives $Q_c$; DWL is the triangle between demand and MC from $Q_m$ to $Q_c$', [
          ['$Q_c$ from $MR = 0$; the triangle under MR', 'MR = 0 is the revenue maximum and has nothing to do with efficiency. Efficiency compares what buyers value (demand) with what units cost (MC).'],
          ['$Q_c$ where demand hits zero', 'Units past $Q_c$ cost more than buyers value them, so making them would lower surplus.'],
          ['The triangle between demand and MR', 'MR is a revenue concept for the seller. Lost surplus is value (demand) minus cost (MC) on the units not made.'],
        ], `$${m.a} - ${co(m.b)}Q = ${m.mc} \\Rightarrow Q_c = ${m.Qc}$. DWL $= \\tfrac12 (Q_c - Q_m)(P_m - MC(Q_m))$.`),
        psStep],
      parts: [N('Q_m', m.Qm), N('P_m', m.Pm), N('\\pi', m.pi), N('Q_c', m.Qc), N('P_c', m.Pc), N('CS', m.CS), N('PS', m.PS), N('DWL', m.DWL)],
      hints: [`$MR = ${m.mr}$, $MC = ${m.mc}$.`, `$MC(Q_m) = ${m.MCm}$. The DWL triangle's vertical side runs from ${m.MCm} up to ${m.Pm}.`],
      sol: md`
        **Move 1: monopoly point.** $${m.mr} = ${m.mc} \Rightarrow Q_m = ${m.Qm}$; up to demand: $P_m = ${m.Pm}$. Here $MC(Q_m) = ${m.MCm}$.

        **Move 2: profit.** $\pi = PS - F$. $PS = ${F(m.PS)}$ (Move 5), and the fixed cost is ${m.Fx}, so $\pi = ${F(m.pi)}$.

        **Move 3: efficient point.** Demand $=$ MC: $${m.a} - ${co(m.b)}Q = ${m.mc} \Rightarrow Q_c = ${m.Qc}$, $P_c = ${m.Pc}$.

        **Move 4: CS.** Triangle above $P_m$: $\tfrac12 \times ${m.Qm} \times (${m.a} - ${m.Pm}) = ${F(m.CS)}$.

        **Move 5: PS.** ${m.d ? `Trapezoid between $P_m$ and MC: $\\tfrac12[(${m.Pm} - ${m.c}) + (${m.Pm} - ${m.MCm})] \\times ${m.Qm} = ${F(m.PS)}$. (Same as $TR - VC = ${F(m.Pm * m.Qm)} - ${F(m.Pm * m.Qm - m.PS)}$.)` : `Rectangle: $(${m.Pm} - ${m.c}) \\times ${m.Qm} = ${F(m.PS)}$.`}

        **Move 6: DWL.** Triangle with base $Q_c - Q_m = ${m.Qc - m.Qm}$ and height $P_m - MC(Q_m) = ${m.Pm} - ${m.MCm} = ${m.Pm - m.MCm}$: $\tfrac12 \times ${m.Qc - m.Qm} \times ${m.Pm - m.MCm} = ${F(m.DWL)}$.

        **Check.** Competitive welfare $= ${F(m.CSc)} + ${F(m.PSc)} = ${F(Wc)}$; monopoly welfare $= ${F(m.CS)} + ${F(m.PS)} = ${F(W)}$. The gap is ${F(Wc - W)} $=$ DWL ✓.
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 4 figures
  // DS10 demand split at its midpoint (125, 250): elastic above, inelastic below. MR = 0 at the midpoint quantity.
  const elasFig = EC.graph({
    w: 340, h: 270, x: [0, 270], y: [0, 540], xl: 'Q', yl: 'P', xt: [100, 125, 250], yt: [250, 300, 500],
    items: [
      { seg: [[0, 500], [125, 250]], cls: 'curve c3', lab: '\\text{elastic: } \\lvert\\varepsilon\\rvert > 1', at: 0.3, dx: 14, dy: 0, anchor: 'l' },
      { seg: [[125, 250], [250, 0]], cls: 'curve c4', lab: '\\text{inelastic: } \\lvert\\varepsilon\\rvert < 1', at: 0.55, dx: 10, dy: 0, anchor: 'l' },
      { seg: [[0, 500], [125, 0]], cls: 'curve c2 dash', lab: 'MR', at: 0.92, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 0], [260, 260]], cls: 'curve c5', lab: 'MC', at: 0.97, dx: -4, dy: -6, anchor: 'br' },
      { pt: [125, 250], lab: '\\varepsilon = -1', at: 'r', guide: 'x' },
      { pt: [100, 300], lab: '\\text{monopoly}', at: 'bl', guide: 'y' },
    ],
  });
  // constant elasticity: Q = 1000 P^-2, so P = sqrt(1000/Q); MR = P/2; MC = 5 -> Q = 10, P = 10
  const ceFig = EC.graph({
    w: 330, h: 250, x: [0, 42], y: [0, 26], xl: 'Q', yl: 'P', xt: [10, 40], yt: [5, 10],
    items: [
      { f: (q) => Math.sqrt(1000 / q), from: 1.6, to: 40, lab: 'D:\\ Q = 1000P^{-2}', labX: 30, dx: 0, dy: -8, anchor: 'b' },
      { f: (q) => Math.sqrt(1000 / q) / 2, from: 0.45, to: 40, cls: 'c2 dash', lab: 'MR = P/2', labX: 34, dx: 0, dy: -6, anchor: 'b' },
      { seg: [[0, 5], [42, 5]], cls: 'curve c5', lab: 'MC = 5', at: 'end', dx: -2, dy: 4, anchor: 'tr' },
      { pt: [10, 5], guide: 'x' }, { pt: [10, 10], lab: '(10,\\ 10)', at: 'tr', guide: 'y' },
    ],
  });

  // ------------------------------------------------------------------ lesson 4 generators
  const PLAN_EPS = plan('How do you get the elasticity at the monopoly point?', '$\\varepsilon = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q}$, with $\\dfrac{dQ}{dP} = -\\dfrac{1}{b}$ from $P = a - bQ$', [
    ['The inverse-demand slope $-b$ times $P/Q$', '$-b$ is $dP/dQ$. Elasticity needs $dQ/dP$, which is its reciprocal, $-1/b$.'],
    ['$\\dfrac{dQ}{dP}\\cdot\\dfrac{Q}{P}$', 'The ratio is upside down: elasticity multiplies the slope by $P/Q$.'],
    ['$\\varepsilon = -b$, the slope', 'A straight line has one slope but a different elasticity at every point. You need $P/Q$ at the point.'],
  ], 'Solve demand for $Q$ (or flip the slope), then multiply by $P_m/Q_m$.');
  const PLAN_L = plan('What is the Lerner index?', '$L = \\dfrac{P - MC}{P}$', [
    ['$\\dfrac{P - MC}{MC}$', 'That is the markup as a share of **cost**. The Lerner index divides by the **price**.'],
    ['$\\dfrac{P}{MC}$', 'A ratio of price to cost; it is 1 (not 0) under competition.'],
    ['$\\dfrac{P - AC}{P}$', 'That is the profit margin per dollar. The Lerner index uses marginal cost.'],
  ], 'Price minus MC, over price. At the untaxed optimum it also equals $-1/\\varepsilon$.');

  gen('m3_mo_lerner', () => {
    const [a, c] = pick([[100, 20], [90, 30], [100, 60], [120, 40], [80, 20], [110, 10], [140, 60], [60, 20], [150, 50], [200, 40], [70, 30], [130, 30]]);
    const b = pick([1, 2, 5]), Qm = (a - c) / (2 * b), Pm = (a + c) / 2, L = (Pm - c) / Pm, eps = (-1 / b) * (Pm / Qm), Qmid = a / (2 * b);
    return {
      title: 'Lerner index and elasticity',
      q: md`A monopolist faces $P = ${a} - ${co(b)}Q$ and has constant marginal cost ${c}. (a) Find its quantity and price. (b) Compute the Lerner index. (c) Compute the price elasticity of demand at the optimum, and check that $L = -1/\varepsilon$. (d) For which quantities is demand elastic?`,
      plan: [PLAN_MRMC({ mr: `${a} - ${co(2 * b)}Q`, mc: `${c}`, a, b }), PLAN_L, PLAN_EPS],
      parts: [N('Q_m', Qm), N('P_m', Pm), N('L', L), N('\\varepsilon', eps), N('\\text{elastic for }Q <', Qmid)],
      hints: [`$MR = ${a} - ${co(2 * b)}Q$.`, `$dQ/dP = -1/${b}$.`],
      sol: md`
        **Move 1: $MR = MC$.** $${a} - ${co(2 * b)}Q = ${c} \Rightarrow Q_m = ${F(Qm)}$. Up to demand: $P_m = ${a} - ${tm(b, Qm)} = ${F(Pm)}$.

        **Move 2: Lerner.** $L = \dfrac{${F(Pm)} - ${c}}{${F(Pm)}} = ${F(L)}$: ${F(100 * L, 1)}% of the price is markup over marginal cost.

        **Move 3: elasticity.** From $P = ${a} - ${co(b)}Q$: $Q = (${a} - P)/${b}$, so $dQ/dP = -1/${b}$.
        $$\varepsilon = -\frac{1}{${b}} \cdot \frac{${F(Pm)}}{${F(Qm)}} = ${F(eps)}$$
        Check: $-1/\varepsilon = ${F(-1 / eps)} = L$ ✓.

        **Move 4: elastic range.** Elastic above the midpoint of the line, $Q < \dfrac{a}{2b} = ${F(Qmid)}$ (where $MR > 0$). The optimum $Q_m = ${F(Qm)}$ is inside it, as it must be with $MC > 0$: $|\varepsilon| = ${F(-eps)} > 1$.
      `,
    };
  });

  gen('m3_mo_markup', () => {
    const e = pick([1.5, 2, 3, 4, 5]), c = e === 4 ? pick([3, 6, 9, 12, 15, 30]) : pick([4, 6, 8, 10, 12, 20, 30]);
    const k = pick([500, 1000, 2000, 5000]), Pm = c * e / (e - 1), L = 1 / e;
    return {
      title: 'The markup rule (constant elasticity)',
      q: md`A monopolist faces demand $Q = ${k}P^{-${F(e)}}$ and has constant marginal cost ${c}. (a) What is the price elasticity of demand? (b) Find the profit-maximizing price. (c) Find the Lerner index and the markup $P - MC$.`,
      plan: [
        plan('This demand is not a straight line. What is the fastest route to the price?', `Elasticity is $-${F(e)}$ everywhere; set $MR = P(1 + 1/\\varepsilon) = MC$`, [
          ['Use $MR = a - 2bQ$', 'That shortcut is for straight-line demand only.'],
          ['Set $P = MC$', 'That is the competitive rule; a monopolist marks its price up over MC.'],
          ['Find the midpoint of demand, where $\\varepsilon = -1$', 'A constant-elasticity curve has the same elasticity at every point; there is no special midpoint.'],
        ], `$P\\left(1 - \\tfrac{1}{${F(e)}}\\right) = ${c} \\Rightarrow P = ${c} \\cdot \\dfrac{${F(e)}}{${F(e - 1)}}$.`),
        PLAN_L,
      ],
      parts: [N('\\varepsilon', -e), N('P_m', Pm), N('L', L), N('P - MC', Pm - c)],
      hints: [`For $Q = kP^{-e}$, $\\varepsilon = -e$.`, `$P(1 - 1/${F(e)}) = ${c}$.`],
      sol: md`
        **Move 1: elasticity.** $Q = kP^{-e}$ has $\varepsilon = -e$ at every price, so $\varepsilon = -${F(e)}$.

        **Move 2: MR = MC.** $MR = P\left(1 + \dfrac{1}{\varepsilon}\right) = P\left(1 - \dfrac{1}{${F(e)}}\right) = \dfrac{${F(e - 1)}}{${F(e)}}P$. Set it equal to ${c}:
        $$\dfrac{${F(e - 1)}}{${F(e)}}P = ${c} \;\Rightarrow\; P_m = ${c} \cdot \frac{${F(e)}}{${F(e - 1)}} = ${F(Pm)}$$

        **Move 3: Lerner and markup.** $L = \dfrac{${F(Pm)} - ${c}}{${F(Pm)}} = ${F(L)} = \dfrac{1}{${F(e)}}$ ✓ (that is $-1/\varepsilon$). Markup $P - MC = ${F(Pm - c)}$.

        Does this make sense? The more elastic the demand (bigger $e$), the closer the price sits to MC. Here $e = ${F(e)}$, so the price is ${F(e / (e - 1))} times MC.
      `,
    };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3u5', exam: 'm3', num: 'Part 11', title: 'Monopoly', blurb: 'MR below price, MR = MC then the price from demand, CS, PS and DWL against P = MC, elasticity and the Lerner index',
    lessons: [
      // ================================================================ lesson 1
      {
        id: 'm3-mo1', title: 'Why marginal revenue is below price', ref: 'Lecture 18 · formula sheet · DS10 Q1',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | Your move |
            |---|---|---|
            | "find total revenue and marginal revenue" for $P = a - bQ$ | revenue as a function of output, then its slope | $TR = aQ - bQ^2$, then $MR = a - 2bQ$ |
            | demand written as $Q = 250 - 0.5P$ | the same, but demand is written the other way round | invert first: $P = 500 - 2Q$, then $MR = 500 - 4Q$ |
            | a table of $Q$ and $P$: "fill in TR and MR" | revenue on each row, then the change between rows | $TR = P \times Q$; $MR = \Delta TR / \Delta Q$ |
            | "explain why MR is below price" | the price cut on the units already being sold | $MR = P + Q\,\dfrac{dP}{dQ}$; the second term is negative |
            | "at what output is revenue largest?" | the top of the TR hill | $MR = 0$: half the demand's horizontal intercept |
            | "how does this differ from a competitive firm?" | a price taker faces a flat demand | $MR = P$ for the price taker |
          `),
          R(md`
            ### One seller, from scratch

            A desert town has one well, and you own it. You sell water by the barrel. Nobody else can sell water there, so the town's whole demand curve is **your** demand curve.

            Demand is $P = 10 - Q$, where $P$ is the price of a barrel in dollars and $Q$ is barrels per day. Read it as a list of deals: at \$9 the town buys 1 barrel, at \$8 it buys 2, at \$7 it buys 3, and so on.

            A competitive firm (Parts 7 and 8) never faced this. It was one seller among hundreds and could sell as much as it liked at the market price. You cannot. **To sell more, you must lower the price.** And you charge one price to everybody, so the lower price applies to **every** barrel you sell, not only the extra one.

            That one fact drives this whole Part.

            !!key Notation
              - $Q$: the monopolist's output. It is also the market quantity, because there is only one seller.
              - $P(Q)$: inverse demand, the highest price at which buyers take $Q$ units.
              - $TR(Q) = P(Q)\,Q$: total revenue.
              - $MR(Q) = \dfrac{dTR}{dQ}$: marginal revenue, the extra revenue from one more unit.
          `),
          RF(md`
            ### The revenue table

            Fill in revenue at each price, $TR = P \times Q$, and the change in revenue from one row to the next, which is MR.

            | $Q$ | $P$ | $TR = P \times Q$ | $MR = \Delta TR$ |
            |---|---|---|---|
            | 0 | 10 | 0 | – |
            | 1 | 9 | 9 | 9 |
            | 2 | 8 | 16 | 7 |
            | 3 | 7 | 21 | 5 |
            | 4 | 6 | 24 | 3 |
            | 5 | 5 | 25 | 1 |
            | 6 | 4 | 24 | −1 |

            Look at the MR column. After the first row it is **below** the price every time, and it falls twice as fast as the price: 9, 7, 5, 3, 1, −1 against 9, 8, 7, 6, 5, 4.

            Zoom in on going from 3 barrels to 4.

            - At 3 barrels the price is \$7. Revenue is $7 \times 3 = 21$.
            - To sell a 4th barrel you drop the price to \$6. Revenue is $6 \times 4 = 24$.
            - So the 4th barrel adds $24 - 21 = 3$. That is its marginal revenue.

            Why only \$3, when the 4th barrel sells for \$6? Split the change in two:

            - **Gain:** the new barrel brings in its price, +\$6 (green in the figure).
            - **Loss:** the 3 barrels you were already selling at \$7 now sell at \$6. That is \$1 less on each of 3 barrels, −\$3 (red).
            - **Net:** $6 - 3 = 3$. That is MR.

            [[fig:well]]
          `, { well: { svg: wellFig, cap: 'Going from 3 to 4 barrels: the green bar is the new barrel’s price (+6); the red strip is the \\$1 price cut on the 3 old barrels (−3). MR = 3, which sits on the orange MR line.' } }),
          Q(md`The well sells 5 barrels at \$5. To sell a 6th, the price must fall to \$4. The marginal revenue of the 6th barrel is…`, ['$-1$', '$4$', '$5$', '$0$'], 0,
            [null, '4 is the new barrel’s price, the gain only. You forgot the \\$1 cut on the 5 barrels already sold.', '5 is the old price, which no barrel fetches any more.', 'Revenue does change: from 25 to 24.'],
            md`$TR$ goes from $5 \times 5 = 25$ to $6 \times 4 = 24$, so $MR = -1$. Split: gain 4, loss $5 \times 1 = 5$, net $-1$.`),
          R(md`
            ### From the table to a formula

            Total revenue is price times quantity, with the price read off demand:

            $$TR(Q) = P(Q)\cdot Q$$

            Marginal revenue is its slope. TR is a product of two things that both depend on $Q$, so use the product rule:

            $$MR = \frac{dTR}{dQ} = P(Q)\cdot 1 + Q\cdot\frac{dP}{dQ}$$

            Read the two terms:

            - $P(Q)$ is the price the new unit sells for. That is the **gain**.
            - $Q\,\dfrac{dP}{dQ}$ is how much the price drops per extra unit ($dP/dQ$) times the number of units already being sold ($Q$). That is the **loss** on the old units. Demand slopes down, so $dP/dQ < 0$ and this term is negative.

            So, for any $Q > 0$:

            $$MR = P + Q\,\frac{dP}{dQ} < P$$

            This is the formula sheet's line $MR(Q) = P(Q) + Q\,dP(Q)/dQ$.

            !!intuition Does this make sense?
              At $Q = 0$ there are no old units to lose on, so the first unit's MR equals its price. In the table, the first barrel's MR is 9, its price. ✓

              The more you already sell, the bigger the loss term, so MR falls further below the price as $Q$ grows. ✓

            **Check with the well.** $P = 10 - Q$, so $dP/dQ = -1$. Halfway between 3 and 4 barrels, at $Q = 3.5$: $MR = (10 - 3.5) + 3.5 \times (-1) = 6.5 - 3.5 = 3$. Same as the table. (With straight-line demand, the table's MR between two rows equals the calculus MR at the midpoint.)
          `),
          Q(md`In $MR = P + Q\,\dfrac{dP}{dQ}$, the term $Q\,\dfrac{dP}{dQ}$ is…`, ['the revenue lost on the units already being sold', 'the revenue from the new unit', 'the extra cost of the new unit', 'always positive'], 0,
            [null, 'That is the first term, $P$.', 'Cost never appears in MR; that would be MC.', '$dP/dQ < 0$ for a downward demand, so the term is negative.'],
            md`$dP/dQ$ is the price cut needed per extra unit; $Q$ is how many units suffer that cut. Their product is the loss, and it is negative.`),
          R(md`
            ### The competitive firm: no loss term

            A wheat farmer is one seller among thousands. If she sells one more bushel, the market price does not move. From her point of view $dP/dQ = 0$, so the loss term vanishes:

            $$MR = P + Q \cdot 0 = P$$

            That is why Parts 7 and 8 used $MR = P$ and the rule $P = MC$. The monopolist's rule will be $MR = MC$, with MR **below** P.

            | | Price taker (competition) | Monopolist |
            |---|---|---|
            | demand it faces | flat at the market price | the whole downward-sloping market demand |
            | to sell one more unit | no price cut needed | cut the price on **every** unit |
            | $dP/dQ$ | 0 | negative |
            | marginal revenue | $MR = P$ | $MR = P + Q\,dP/dQ < P$ |
          `),
          Q(md`A wheat farmer sells 1,000 bushels at the market price of \$6. The marginal revenue of her 1,001st bushel is…`, ['\\$6', 'less than \\$6, because demand slopes down', '\\$0', '\\$6 divided by 1,000'], 0,
            [null, 'Market demand slopes down, but the demand **she** faces is flat: her extra bushel does not move the market price.', 'The extra bushel still sells for \\$6.', 'There is no reason to divide; the bushel brings in the price.'],
            md`A price taker sells every bushel at the market price, so $MR = P = 6$.`),
          RF(md`
            ### Linear demand: same intercept, twice the slope

            Most exam demands are straight lines: $P = a - bQ$. Here $a > 0$ is the vertical intercept (the price at which buyers stop buying) and $b > 0$ is how much the price must fall for each extra unit sold.

            **Move 1: build TR.** Multiply demand by $Q$:

            $$TR = P(Q)\cdot Q = (a - bQ)\,Q = aQ - bQ^2$$

            **Move 2: differentiate** with the power rule ($aQ \to a$, $bQ^2 \to 2bQ$):

            $$MR = \frac{dTR}{dQ} = a - 2bQ$$

            Put the two lines side by side:

            $$\text{demand: } P = a - bQ \qquad\qquad \text{marginal revenue: } MR = a - 2bQ$$

            - **Same vertical intercept** $a$: the first unit's MR is its price.
            - **Twice the slope**: $-2b$ instead of $-b$. MR falls twice as fast.
            - So MR hits zero at $Q = \dfrac{a}{2b}$, **half** of the quantity where demand hits zero, $\dfrac{a}{b}$.

            Check with the general formula: $MR = P + Q\,\dfrac{dP}{dQ} = (a - bQ) + Q(-b) = a - 2bQ$. ✓ The extra $-bQ$ is the loss on the old units.

            **DS10 demand.** $P = 500 - 2Q$, so $a = 500$ and $b = 2$:

            $$TR = 500Q - 2Q^2, \qquad MR = 500 - 4Q$$

            Demand hits zero at $Q = 250$; MR hits zero at $Q = 125$, half of 250.

            [[fig:lin]]
          `, { lin: { svg: linFig, cap: 'DS10: demand P = 500 − 2Q (blue) and MR = 500 − 4Q (orange). Both start at 500; MR is twice as steep and reaches zero at Q = 125, half of 250.' } }),
          Q(md`Demand is $P = 80 - 4Q$. Marginal revenue is…`, ['$MR = 80 - 8Q$', '$MR = 80 - 4Q$', '$MR = 80 - 2Q$', '$MR = 40 - 4Q$'], 0,
            [null, 'That is the demand itself: the price taker’s MR, not a monopolist’s.', 'Half the slope instead of twice.', 'Halving the intercept is not the rule; the intercept stays the same.'],
            md`$TR = 80Q - 4Q^2$, so $MR = 80 - 8Q$: same intercept, twice the slope.`),
          RF(md`
            ### Where is revenue largest? Where MR = 0

            TR rises while $MR > 0$ (each unit adds revenue) and falls once $MR < 0$. So the top of the TR hill is where

            $$MR = 0$$

            For the well: $TR = 10Q - Q^2$ and $MR = 10 - 2Q$. Set $10 - 2Q = 0$, so $Q = 5$ and $TR = 50 - 25 = 25$. In the table TR peaks at 25 at 5 barrels. ✓

            [[fig:tr]]

            !!trap MR can be negative
              Past the top of the TR hill, $MR < 0$: selling one more unit **lowers** revenue, because the price cut on all the old units is bigger than the new unit's price. The well's 6th barrel: gain \$4, loss \$5, $MR = -1$. A negative MR is not an algebra mistake.

            !!trap Revenue-maximizing is not profit-maximizing
              $MR = 0$ maximizes **revenue**. A firm maximizes **profit**, which also subtracts cost. When each unit costs something to make, the profit-maximizing output is smaller (next lesson).
          `, { tr: { svg: trFig, cap: 'TR = 10Q − Q² rises while MR > 0 and falls once MR < 0. The top, TR = 25 at Q = 5, is where MR = 0.' } }),
          Q(md`Demand is $P = 60 - 3Q$. Total revenue is largest at $Q =$`, ['10', '20', '30', '60'], 0,
            [null, 'At $Q = 20$ the price is zero, so revenue is zero: that is where **demand** hits zero.', 'That is $60/2$: you dropped the $b = 3$. $MR = 60 - 6Q = 0$ gives 10.', '60 is the price intercept, not a quantity.'],
            md`$MR = 60 - 6Q = 0 \Rightarrow Q = 10$, half of 20. $TR = 60(10) - 3(100) = 300$.`),
          R(md`
            ### Demand written the other way round

            Sometimes demand comes as **direct** demand, quantity as a function of price: $Q = 250 - 0.5P$. The twice-the-slope rule is for **inverse** demand, $P$ as a function of $Q$, because MR is a derivative with respect to $Q$.

            !!method Direct demand to MR
              **Move 1. Invert.** Solve for $P$: $0.5P = 250 - Q$, so $P = 500 - 2Q$.

              **Move 2. Double the slope.** $MR = 500 - 4Q$.

            !!trap Do not double the wrong thing
              From $Q = 250 - 0.5P$, writing $MR = 250 - Q$ or $MR = 250 - P$ mixes up which variable is which. MR is measured in dollars per unit and is a function of $Q$. Invert first, every time.
          `),
          Q(md`Demand is $Q = 100 - 2P$. Marginal revenue is…`, ['$MR = 50 - Q$', '$MR = 100 - 4P$', '$MR = 50 - \\tfrac{1}{2}Q$', '$MR = 100 - 4Q$'], 0,
            [null, 'Doubling inside the direct form is not a rule; MR must be a function of $Q$.', 'That is the inverse demand itself, $P = 50 - Q/2$, not MR.', 'That swaps $P$ and $Q$ in the original demand before doubling.'],
            md`Invert: $2P = 100 - Q \Rightarrow P = 50 - \tfrac{1}{2}Q$. Double the slope: $MR = 50 - Q$.`),
          Q(md`A seller's marginal revenue is negative at its current output. That means…`, ['selling one more unit would lower total revenue', 'it is selling at a negative price', 'it has made an algebra mistake', 'it is losing money'], 0,
            [null, 'The price is still positive; it is the change in revenue that is negative.', 'Negative MR is normal past the top of the TR hill.', 'MR says nothing about cost, so it cannot tell you about profit or loss.'],
            md`Negative MR: the price cut on all the old units outweighs the new unit's price, so revenue falls.`),
          R(md`
            ### Spot it: no numbers needed

            Each card below is only a plan question. Decide how you would start, then read why.
          `),
          P({ q: md`A problem gives this table and asks for "the marginal revenue of the 3rd unit".

| $Q$ | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| $P$ | 40 | 36 | 32 | 28 |`,
            plan: plan('What do you compute?', '$TR(3) - TR(2) = 96 - 72 = 24$', [
              ['The price at $Q = 3$, \\$32', 'That is only the gain on the new unit. Selling the 3rd unit also cut the price by \\$4 on the 2 units already sold.'],
              ['$P(3) - P(2) = -4$', 'That is the change in **price**, not the change in revenue.'],
              ['$TR(3)/3 = 32$', 'Revenue divided by quantity is the price (average revenue), not the extra revenue.'],
            ], 'MR of the 3rd unit $= 3(32) - 2(36) = 96 - 72 = 24$. Check: gain 32, loss $2 \\times 4 = 8$, net 24.') }),
          P({ q: md`Demand is $Q = 400 - 4P$. The problem asks for marginal revenue.`,
            plan: plan('What is your first move?', 'Invert: $P = 100 - Q/4$, then double the slope', [
              ['$MR = 400 - 8P$', 'Doubling the coefficient of $P$ in the direct form is not a rule. MR is a derivative with respect to $Q$.'],
              ['$MR = 400 - 8Q$', 'That treats the direct demand as if $P$ were on the left. It is not.'],
              ['$MR = dQ/dP = -4$', 'That is the slope of demand, not extra revenue per unit.'],
            ], '$4P = 400 - Q \\Rightarrow P = 100 - 0.25Q$. Double the slope: $MR = 100 - 0.5Q$.') }),
          P({ q: md`"Explain in one sentence why a monopolist's marginal revenue is below its price."`,
            plan: plan('Which explanation earns the points?', 'To sell one more unit it must lower the price on **all** its units, so MR is the new unit’s price minus the loss on the old units', [
              ['Its marginal cost rises with output', 'MC is about cost, not revenue. MR < P holds even when MC is constant.'],
              ['It wants to restrict output', 'Restricting output is a consequence of MR < P, not the reason for it.'],
              ['Buyers pay less for the later units', 'With one price, every unit sells at the same (lower) price; the later units get no special price.'],
            ], '$MR = P + Q\\,dP/dQ$: the second term, the price cut times the units already sold, is negative.') }),
          P({ q: md`Demand is $P = 90 - 3Q$. "At what quantity is total revenue maximized?"`,
            plan: plan('Which equation do you solve?', '$MR = 0$: $90 - 6Q = 0$', [
              ['$P = 0$: $90 - 3Q = 0$', 'A zero price means zero revenue: the bottom of the TR hill, not the top.'],
              ['$MR = MC$', 'That maximizes **profit**. This question is only about revenue, and no cost is given.'],
              ['$P = MR$', 'They are equal only at $Q = 0$.'],
            ], '$Q = 15$, $P = 90 - 45 = 45$, $TR = 675$. Half of the demand intercept 30.') }),
          P({ q: md`A firm sells in a market with thousands of identical sellers at the going price of \$12.`,
            plan: plan('What is this firm’s marginal revenue?', '$MR = 12$: it is a price taker', [
              ['$MR = 12 - 2bQ$, using the market demand slope $b$', 'Only a seller facing the whole downward demand must cut its price to sell more. This firm’s output does not move the market price.'],
              ['$MR = 0$', 'Each extra unit still brings in \\$12.'],
              ['Less than \\$12, because demand slopes down', 'Market demand slopes down, but the demand **this firm** faces is flat at \\$12.'],
            ], 'Flat demand: $dP/dQ = 0$, so $MR = P = 12$, and its rule is $P = MC$.') }),
          R(md`
            ### Practice: plan first, then numbers

            Every card asks how you would attack the problem before any number. Pick, read why, then do it.
          `),
          P({ title: 'DS10 demand: TR and MR', q: md`A monopolist faces $P = 500 - 2Q$ (DS10 Q1). (a) Write $TR(Q)$ and $MR(Q)$. (b) At $Q = 100$, find the price and the marginal revenue. (c) At what output is revenue largest, and how large is it?`,
            plan: [
              plan('How do you get MR?', 'Build $TR = (500 - 2Q)Q$, then differentiate', [
                ['$MR = 500 - 2Q$, the demand itself', 'That would be a price taker. A monopolist must cut the price on every unit to sell one more.'],
                ['$MR = 500 - Q$: half the slope', '$TR = 500Q - 2Q^2$ differentiates to $500 - 4Q$: twice the slope, not half.'],
                ['$MR = TR/Q$', 'That is the price again (average revenue).'],
              ], '$TR = 500Q - 2Q^2$, so $MR = 500 - 4Q$.'),
              plan('For (c), which equation?', '$MR = 0$', [
                ['$P = 0$', 'That is where revenue is zero, at $Q = 250$.'],
                ['$MR = P$', 'Only at $Q = 0$.'],
                ['$P = MC$', 'No cost appears in a revenue question.'],
              ], '$500 - 4Q = 0 \\Rightarrow Q = 125$.'),
            ],
            parts: [X('TR(Q)', '500*Q - 2*Q^2', { Q: [1, 240] }), X('MR(Q)', '500 - 4*Q', { Q: [1, 240] }), N('P\\text{ at }Q = 100', 300), N('MR\\text{ at }Q = 100', 100), N('Q\\text{ at the top of TR}', 125), N('TR_{\\max}', 31250)],
            sol: md`
              **Move 1: TR.** $TR = (500 - 2Q)Q = 500Q - 2Q^2$.

              **Move 2: MR.** $MR = 500 - 4Q$.

              **Move 3: at $Q = 100$.** $P = 500 - 200 = 300$ and $MR = 500 - 400 = 100$. The gap, $300 - 100 = 200$, is the loss term $Q \times |dP/dQ| = 100 \times 2$.

              **Move 4: top of TR.** $500 - 4Q = 0 \Rightarrow Q = 125$, $P = 500 - 250 = 250$, $TR = 250 \times 125 = 31{,}250$.
            ` }),
          P({ title: 'A revenue table', q: md`A monopolist's demand schedule:

| $Q$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $P$ | 22 | 20 | 18 | 16 | 14 | 12 |

Find TR at $Q = 4$, the MR of the 4th unit, and the MR of the 6th unit.`,
            plan: plan('How do you get the MR of the 4th unit?', '$TR(4) - TR(3)$', [
              ['The price at $Q = 4$, \\$16', 'That is the gain on the new unit only; you lose \\$2 on each of the 3 units already sold.'],
              ['$TR(4)/4$', 'That is the price, \\$16, again.'],
              ['$P(4) - P(3) = -2$', 'That is the change in price, not revenue.'],
            ], 'Fill the TR row: 22, 40, 54, 64, 70, 72. Then subtract each row from the next.'),
            parts: [N('TR\\text{ at }Q = 4', 64), N('MR\\text{ of unit 4}', 10), N('MR\\text{ of unit 6}', 2)],
            sol: md`
              **Move 1: TR row.** $TR = P \times Q$: 22, 40, 54, 64, 70, 72.

              **Move 2: MR = change in TR.** Unit 4: $64 - 54 = 10$. Unit 6: $72 - 70 = 2$.

              **Check unit 4 by splitting.** Gain: it sells for 16. Loss: the price fell \$2 on each of 3 old units, $3 \times 2 = 6$. Net $16 - 6 = 10$. ✓
            ` }),
          P({ title: 'Direct demand', q: md`A concert promoter is the only seller of tickets to a show. Demand is $Q = 120 - 4P$. Find inverse demand, MR, and the price and quantity that maximize ticket revenue.`,
            plan: plan('What is your first move?', 'Invert to $P = 30 - Q/4$', [
              ['$MR = 120 - 8P$', 'Doubling inside the direct form is not a rule. Invert first.'],
              ['Set $Q = 0$ to find the best price', 'At $Q = 0$ nobody buys a ticket and revenue is zero.'],
              ['$MR = 120 - 8Q$', 'That treats the direct demand as if it were inverse.'],
            ], '$4P = 120 - Q \\Rightarrow P = 30 - 0.25Q$, so $MR = 30 - 0.5Q$. Set $MR = 0$.'),
            parts: [X('P(Q)', '30 - Q/4', { Q: [1, 110] }), X('MR(Q)', '30 - Q/2', { Q: [1, 110] }), N('Q\\text{ (max revenue)}', 60), N('P\\text{ (max revenue)}', 15), N('TR_{\\max}', 900)],
            sol: md`
              **Move 1: invert.** $4P = 120 - Q$, so $P = 30 - 0.25Q$.

              **Move 2: MR.** Same intercept, twice the slope: $MR = 30 - 0.5Q$.

              **Move 3: top of TR.** $30 - 0.5Q = 0 \Rightarrow Q = 60$. Price from demand: $P = 30 - 15 = 15$. $TR = 15 \times 60 = 900$.

              Does this make sense? Demand hits zero at $Q = 120$ (where $P = 0$); revenue peaks at half of that. ✓
            ` }),
          P({ title: 'A curved demand', q: md`A seller faces $P = 60 - Q^2$. Find $MR(Q)$, the price and MR at $Q = 2$, and the output that maximizes revenue.`,
            plan: plan('The demand is not a straight line. How do you get MR?', 'Use $MR = P + Q\\,\\dfrac{dP}{dQ}$ (or differentiate $TR = 60Q - Q^3$)', [
              ['Double the slope: $MR = 60 - 2Q^2$', 'Twice the slope is a shortcut for **straight-line** demand only.'],
              ['$MR = \\dfrac{dP}{dQ} = -2Q$', 'That is the slope of demand, not the change in revenue.'],
              ['$MR = P$', 'Only a price taker has $MR = P$.'],
            ], '$dP/dQ = -2Q$, so $MR = (60 - Q^2) + Q(-2Q) = 60 - 3Q^2$.'),
            parts: [X('MR(Q)', '60 - 3*Q^2', { Q: [0.5, 4] }), N('P\\text{ at }Q = 2', 56), N('MR\\text{ at }Q = 2', 48), N('Q\\text{ at the top of TR}', 4.472)],
            sol: md`
              **Move 1: the formula.** $\dfrac{dP}{dQ} = -2Q$, so
              $$MR = P + Q\,\frac{dP}{dQ} = (60 - Q^2) + Q(-2Q) = 60 - 3Q^2$$
              Same thing from $TR = (60 - Q^2)Q = 60Q - Q^3$: $MR = 60 - 3Q^2$. ✓

              **Move 2: at $Q = 2$.** $P = 60 - 4 = 56$, $MR = 60 - 12 = 48$. The gap of 8 is the loss term: $Q \times |dP/dQ| = 2 \times 4$.

              **Move 3: top of TR.** $60 - 3Q^2 = 0 \Rightarrow Q^2 = 20 \Rightarrow Q = \sqrt{20} \approx 4.47$ (take the positive root). There $P = 60 - 20 = 40$.
            ` }),
          P({ title: 'Should it sell one more?', q: md`A monopolist with demand $P = 50 - Q$ is selling 30 units. Making one more unit costs it nothing. Find the price and the marginal revenue at $Q = 30$, and decide whether selling one more unit raises revenue.`,
            plan: plan('What decides whether one more unit raises revenue?', 'The sign of MR at $Q = 30$', [
              ['Whether the price is positive', '$P = 20 > 0$, yet revenue can still fall: the price cut on 30 old units can outweigh the new unit’s price.'],
              ['Whether demand slopes down', 'It always does for a monopolist; the question is whether the gain beats the loss.'],
              ['Whether TR is positive', 'TR is positive on the whole line; what matters is whether it is still rising.'],
            ], '$MR = 50 - 2Q$. At 30 that is $-10$: past the top of the TR hill (at $Q = 25$).'),
            parts: [N('P', 20), N('MR', -10), FIX('Does one more unit raise revenue?', ['no', 'yes'], 0, [null, 'MR is negative, so revenue falls even though the unit costs nothing.'])],
            sol: md`
              **Move 1: MR.** $MR = 50 - 2Q$. At $Q = 30$: $P = 50 - 30 = 20$ and $MR = 50 - 60 = -10$.

              **Move 2: read the sign.** Negative: the 31st unit would bring in about \$19 but cut the price about \$1 on 30 old units. Revenue falls. Even with free production, this seller should sell **less**, down to $Q = 25$ where $MR = 0$.
            ` }),
          G('m3_mo_mr', { need: 3 }),
          G('m3_mo_table', { need: 2 }),
        ],
      },
      // ================================================================ lesson 2
      {
        id: 'm3-mo2', title: 'MR = MC, then go up to demand for the price', ref: 'Lecture 18 · DS10 Q1(a)',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | Your move |
            |---|---|---|
            | "a monopolist faces demand … and cost …: find the profit-maximizing quantity and price" | the monopoly optimum | $MR = MC$ for $Q$, then plug $Q$ into **demand** for $P$ |
            | "marginal costs of $MC(Q) = Q$", or "$C(Q) = 80 + 4Q$" | MC from the cost function | $MC = dC/dQ$; the fixed cost drops out |
            | "calculate economic profit" | revenue minus all cost | $\pi = P_m Q_m - C(Q_m) = (P_m - AC)\,Q_m$ |
            | "compare with perfect competition" | the $P = MC$ outcome on the same demand and MC | demand $=$ MC: more output, lower price |
            | "why can the monopolist keep its profit in the long run?" | barriers to entry | name the barrier: patent, license, key input, scale, network |
            | "graph: label demand, MR, MC, $P_m$ and $Q_m$" | the monopoly picture | MR meets MC, then go straight up to demand |
          `),
          R(md`
            ### The rule, from one more unit

            Back at the well, with demand $P = 10 - Q$. Now pumping a barrel costs \$2: marginal cost $MC = 2$. How many barrels should you sell?

            Ask the marginal question, one barrel at a time. Another barrel:

            - adds **MR** to revenue (the new barrel's price minus the loss on the old ones), and
            - adds **MC** to cost.

            If $MR > MC$ it raises profit: sell it. If $MR < MC$ it lowers profit: don't.

            | Barrel | $P$ | $MR$ | $MC$ | Sell it? |
            |---|---|---|---|---|
            | 1st | 9 | 9 | 2 | yes, +7 |
            | 2nd | 8 | 7 | 2 | yes, +5 |
            | 3rd | 7 | 5 | 2 | yes, +3 |
            | 4th | 6 | 3 | 2 | yes, +1 |
            | 5th | 5 | 1 | 2 | no, −1 |

            Stop at 4 barrels. The price is whatever buyers pay for 4 barrels: \$6. Profit $= 6 \times 4 - 2 \times 4 = 16$. (Check: 3 barrels give $21 - 6 = 15$ and 5 give $25 - 10 = 15$. Four is the top.)

            Now the same thing with calculus. Profit is revenue minus cost:

            $$\pi(Q) = TR(Q) - C(Q)$$

            At the top of the profit hill the slope is zero:

            $$\frac{d\pi}{dQ} = \frac{dTR}{dQ} - \frac{dC}{dQ} = MR(Q) - MC(Q) = 0$$

            So the monopolist produces where

            $$MR(Q) = MC(Q)$$

            For the well: $10 - 2Q = 2 \Rightarrow 2Q = 8 \Rightarrow Q = 4$, and the price from demand is $10 - 4 = 6$. Same as the table. ✓

            !!method The monopoly recipe
              **Move 1. MR from demand.** Straight line $P = a - bQ$: $MR = a - 2bQ$. (Direct demand: invert first.)

              **Move 2. MC from cost.** $MC = dC/dQ$. The fixed cost is a constant, so it drops out.

              **Move 3. $MR = MC$.** Solve for $Q_m$.

              **Move 4. Go up to demand.** $P_m = P(Q_m)$.

              **Move 5. Profit.** $\pi = P_m Q_m - C(Q_m)$, or the rectangle $(P_m - AC)\,Q_m$.
          `),
          RF(md`
            ### Go up to demand for the price

            Solving $MR = MC$ gives a **quantity**. At that quantity there are three heights on the graph, and only one is the price:

            - where MR and MC meet: what the last unit adds to revenue and to cost (they are equal there);
            - **on the demand curve**: the highest price at which buyers take $Q_m$ units. **That is the price.**

            Demand is the list of deals. Once you have chosen to sell $Q_m$ units, the best you can charge is what demand says buyers will pay for $Q_m$ units.

            [[fig:mono]]

            !!trap The classic error
              Reading the price where MR crosses MC. In DS10 that gives 100 instead of 300: a third of the right answer. The crossing tells you **how many**. Demand tells you **how much buyers pay**.
          `, { mono: { svg: monoFig, cap: 'DS10: MR (orange) meets MC = Q (red) at Q = 100, height 100. Go straight up to demand (blue): P = 300. The competitive point, where demand meets MC, is (166.7, 166.7).' } }),
          Q(md`A monopolist solves $MR = MC$ and gets $Q = 20$, where $MR = MC = 20$. Demand is $P = 100 - 2Q$. What price does it charge?`, ['\\$60', '\\$20', '\\$40', '\\$100'], 0,
            [null, '20 is the height where MR meets MC: the value of the last unit to the firm, not what buyers pay.', 'That is halfway, from no rule.', '100 is the price at which buyers buy nothing.'],
            md`Go up to demand: $P = 100 - 2(20) = 60$.`),
          RF(md`
            ### Worked example 1: constant MC and a fixed cost

            A drug company holds the patent on a medicine, so it is the only seller. Demand is $P = 100 - 2Q$ and total cost is $C(Q) = 200 + 20Q$.

            **Move 1: MR.** Same intercept, twice the slope: $MR = 100 - 4Q$.

            **Move 2: MC.** $MC = \dfrac{dC}{dQ} = 20$. The 200 is a fixed cost: its derivative is zero.

            **Move 3: $MR = MC$.**
            $$100 - 4Q = 20 \;\Rightarrow\; 80 = 4Q \;\Rightarrow\; Q_m = 20$$

            **Move 4: up to demand.**
            $$P_m = 100 - 2(20) = 60$$

            **Move 5: profit.** $TR = 60 \times 20 = 1200$. $C(20) = 200 + 20(20) = 600$.
            $$\pi = 1200 - 600 = 600$$
            Rectangle check: $AC(20) = 600/20 = 30$, so $\pi = (60 - 30)(20) = 600$. ✓

            [[fig:prof]]

            !!intuition Does this make sense?
              The price (60) is far above MC (20): each unit sells for three times what it costs to make. A competitive firm could never hold its price above MC, but there is no rival here to undercut.

              The fixed cost 200 changed the profit and nothing else. Double it to 400 and $Q_m$ and $P_m$ stay 20 and 60; profit falls to 400.
          `, { prof: { svg: profitFig, cap: 'Q = 20 from MR = MC; the price 60 is read off demand. Green: profit = (P − AC) × Q = (60 − 30) × 20 = 600.' } }),
          Q(md`The drug company's fixed cost rises from \$200 to \$400. Its profit-maximizing quantity and price…`, ['stay the same; only profit falls', 'both rise, to cover the cost', 'quantity falls, price rises', 'price rises by \\$10 per unit'], 0,
            [null, 'MR and MC do not contain the fixed cost, so the $MR = MC$ point does not move.', 'Same reason: a fixed cost is not part of MC.', 'Spreading a fixed cost over units is an average-cost idea; the optimum depends on marginal values only.'],
            md`$MC = dC/dQ$ and the derivative of a constant is zero. A fixed cost changes **profit**, never the best output or price (as long as the firm stays open).`),
          RF(md`
            ### Worked example 2: rising MC (DS10 Q1a)

            A monopolist faces $P = 500 - 2Q$ and has marginal cost $MC(Q) = Q$. Find the equilibrium price and quantity.

            **Move 1: MR.** $MR = 500 - 4Q$.

            **Move 2: MC** is given: $MC = Q$. Each unit costs a little more than the last.

            **Move 3: $MR = MC$.**
            $$500 - 4Q = Q \;\Rightarrow\; 500 = 5Q \;\Rightarrow\; Q_m = 100$$

            **Move 4: up to demand.**
            $$P_m = 500 - 2(100) = 300$$

            **Move 5: profit.** The problem gives MC, not total cost. With no fixed cost, cost is the area under MC: $C(Q) = \tfrac{1}{2}Q^2$ (check: $dC/dQ = Q$ ✓), so $C(100) = 5000$.
            $$\pi = 300 \times 100 - 5000 = 30{,}000 - 5000 = 25{,}000$$

            !!intuition Does this make sense?
              $P_m = 300$ is above $MC(100) = 100$. ✓ And $Q_m = 100$ is below 125, the top of the TR hill from lesson 1: with positive MC the monopolist stops **before** revenue peaks, because the last few revenue-adding units cost more than they add. ✓

            Look back at the figure above: MR meets MC at (100, 100), and the arrow goes up to demand at (100, 300).
          `, {}),
          Q(md`At the monopoly optimum, compare the price with marginal cost.`, ['$P > MC$', '$P = MC$', '$P < MC$', 'it depends on the fixed cost'], 0,
            [null, 'That is the competitive outcome. The monopolist sets MR = MC, and MR is below P.', 'MC = MR < P at the optimum.', 'Fixed cost does not touch the optimum.'],
            md`At $Q_m$: $MC = MR$, and $MR < P$ for any $Q > 0$. So $P > MC$: the monopolist marks up its price over marginal cost.`),
          R(md`
            ### Monopoly versus perfect competition

            Keep the same demand and the same MC curve, but imagine the industry is many small price takers instead of one seller. The MC curve is then the industry supply curve (Part 8), and the market settles where supply meets demand: $P = MC$.

            **DS10, competitive version.** Set demand equal to MC:
            $$500 - 2Q = Q \;\Rightarrow\; 500 = 3Q \;\Rightarrow\; Q_c = \frac{500}{3} \approx 166.7, \qquad P_c = Q_c \approx 166.7$$

            | | Perfect competition | Monopoly |
            |---|---|---|
            | sellers | many price takers | one |
            | output rule | $P = MC$ | $MR = MC$, with $MR < P$ |
            | price versus MC | $P = MC$ | $P > MC$ |
            | DS10 quantity | 166.7 | 100 |
            | DS10 price | 166.7 | 300 |
            | long-run profit | zero: entry competes it away | can stay positive: barriers keep rivals out |

            **Why does the monopolist stop short?** Between $Q = 100$ and $Q = 166.7$, every unit is worth more to some buyer (demand height) than it costs to make (MC). A price taker would sell those units. The monopolist does not, because selling them means cutting the price on all the units it already sells. That lost revenue on the old units is the whole difference.

            !!trap "Twice the monopoly quantity" is not a rule
              With constant MC and straight-line demand, $Q_c = 2Q_m$ (the drug company: 40 versus 20). With rising MC it fails: DS10 gives $166.7 \neq 200$. Always solve demand $=$ MC.
          `),
          Q(md`Same demand and same MC curve. Compared with perfect competition, a monopoly…`, ['sells less at a higher price', 'sells more at a lower price', 'sells the same quantity at a higher price', 'sells less at a lower price'], 0,
            [null, 'Backwards: the monopolist restricts output to keep the price up.', 'Quantity falls too: MR = MC is reached before demand = MC.', 'Less output means buyers bid a **higher** price along demand.'],
            md`$MR = MC$ is reached at a smaller $Q$ than demand $=$ MC, because MR lies below demand. Less output, so a higher point on demand.`),
          R(md`
            ### Barriers to entry: why the profit lasts

            In Part 9 a competitive industry's profit attracted entry: new firms shifted supply right and pushed the price down until profit was zero ([entry and exit](#/l/m3-lr1)). A monopoly's profit survives only if something stops that from happening. That something is a **barrier to entry**.

            - **Legal barriers:** patents and copyrights, licenses, exclusive government franchises (a city lets one company pipe water or gas).
            - **Control of a key input:** one firm owns the only well, mine or site.
            - **Economies of scale:** average cost keeps falling over the whole range of market demand, so one firm can serve the market more cheaply than two. This is a **natural monopoly** ([Part 12](#/l/m3-rg1)).
            - **Network effects:** the product is worth more the more people use it (a social network, a payment app), so a newcomer with few users cannot attract any.

            !!key Profit is the bait, the barrier is the fence
              A large profit is not itself a barrier: it is the reason rivals **want** to enter. Without a barrier, entry would erode a monopoly profit just as it does a competitive one.
          `),
          Q(md`Which of these is **not** a barrier to entry?`, ['a large economic profit', 'a patent on the product', 'economies of scale over the whole market', 'owning the only source of a key input'], 0,
            [null, 'A patent legally stops others from selling the product.', 'One firm can serve the market at a lower AC than any newcomer.', 'Rivals cannot produce without the input.'],
            md`Profit attracts entrants; it does not stop them. Barriers are what keep them out despite the profit.`),
          Q(md`Why can a monopoly earn positive economic profit in the long run when a competitive firm cannot?`, ['barriers to entry keep rivals out', 'monopolies always have lower costs', 'monopolies set $P = MC$', 'demand for monopoly products never changes'], 0,
            [null, 'Not always; many monopolies come from patents or licenses, not lower costs.', 'Monopolies set MR = MC, with P above MC.', 'Demand can change; the profit survives because no one can enter.'],
            md`In a competitive market, profit triggers entry and entry drives profit to zero. A barrier blocks that, so the profit can persist.`),
          R(md`
            ### Spot it: no numbers needed

            Each card is only a plan question. Decide how you would start, then read why.
          `),
          P({ q: md`A monopolist faces demand $P = 120 - 3Q$ and has constant $MC = 30$.`,
            plan: plan('What is your first equation?', '$120 - 6Q = 30$', [
              ['$120 - 3Q = 30$', 'That is $P = MC$, the competitive rule. It finds the benchmark, not the monopoly output.'],
              ['$120 - 6Q = 0$', 'That is $MR = 0$, the revenue maximum. It ignores the \\$30 cost of each unit.'],
              ['$120 - 3Q = AC$', 'Price equal to AC is the zero-profit point.'],
            ], '$MR = MC$: $120 - 6Q = 30 \\Rightarrow Q = 15$. Then price from demand.') }),
          P({ q: md`You solved $MR = MC$ and got $Q = 15$, with $MR = MC = 30$ there. Demand is $P = 120 - 3Q$.`,
            plan: plan('What is the price?', 'Plug 15 into demand: $P = 120 - 45 = 75$', [
              ['\\$30, the height where MR meets MC', 'That is the marginal value of the last unit, not what buyers pay. Buyers pay the demand height at $Q = 15$.'],
              ['The competitive price, where demand meets MC', 'That is the benchmark the monopolist avoids by restricting output.'],
              ['$AC$ at $Q = 15$', 'AC is cost per unit; compare it with the price to get profit, but it is not the price.'],
            ], 'Go straight up from $Q = 15$ to the demand curve: $P_m = 75$.') }),
          P({ q: md`A monopolist has $C(Q) = 500 + 10Q + Q^2$ and faces $P = 70 - 2Q$.`,
            plan: plan('What does the 500 do to the monopoly quantity and price?', 'Nothing: it drops out of MC; it only lowers profit by 500', [
              ['It lowers the quantity', 'Quantity comes from $MR = MC$, and $MC = 10 + 2Q$ has no 500 in it.'],
              ['It raises the price, to pass the cost on', 'The price comes from demand at $Q_m$, and $Q_m$ does not depend on the fixed cost.'],
              ['It means you should set $P = AC$', 'P = AC is a zero-profit condition (a regulation idea in Part 12), not the monopolist’s choice.'],
            ], 'Optimum from $70 - 4Q = 10 + 2Q$. Then subtract the 500 when you compute profit.') }),
          P({ q: md`After finding the monopoly outcome, the problem asks: "What would price and quantity be if this industry were perfectly competitive?"`,
            plan: plan('Which equation?', 'Demand $=$ MC ($P = MC$)', [
              ['$MR = MC$ again', 'That is the monopoly answer. Competitive firms are price takers and produce until $P = MC$.'],
              ['$MR = 0$', 'That is the revenue maximum of a single seller.'],
              ['Double the monopoly quantity', 'Only true with constant MC and straight-line demand. Solve demand $=$ MC to be safe.'],
            ], 'Set the demand price equal to MC and solve for $Q_c$; $P_c$ from demand (or MC).') }),
          P({ q: md`"Explain why this firm's economic profit is not competed away in the long run, as it would be in a competitive industry."`,
            plan: plan('Which answer earns the points?', 'A barrier to entry (for example a patent, license or control of a key input) keeps rivals from entering', [
              ['Its profit is high, so it can afford to stay', 'Staying is not the question. In a competitive industry, high profit attracts entrants who push the price down.'],
              ['It sets price equal to marginal cost', 'A monopolist sets MR = MC with P above MC.'],
              ['Demand is downward sloping', 'Every market demand slopes down, including competitive ones.'],
            ], 'Name the barrier and say what it blocks: entry, which in Part 9 is what pushed profit to zero.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Constant MC', q: md`A monopolist faces $P = 120 - 3Q$ and has total cost $C(Q) = 30Q$. Find its quantity, price and profit, and the quantity and price under perfect competition.`,
            plan: [
              plan('First equation?', '$MR = MC$: $120 - 6Q = 30$', [
                ['$P = MC$: $120 - 3Q = 30$', 'That is the competitive benchmark, part two of the question.'],
                ['$MR = 0$', 'Ignores the \\$30 cost per unit.'],
                ['$P = AC$', 'Zero-profit point, not the profit maximum.'],
              ], '$6Q = 90 \\Rightarrow Q = 15$.'),
              PLAN_UP,
            ],
            parts: [N('Q_m', 15), N('P_m', 75), N('\\pi', 675), N('Q_c', 30), N('P_c', 30)],
            sol: md`
              **Move 1:** $MR = 120 - 6Q$, $MC = 30$. **Move 2:** $120 - 6Q = 30 \Rightarrow Q_m = 15$. **Move 3:** $P_m = 120 - 45 = 75$.

              **Move 4: profit.** $\pi = 75(15) - 30(15) = 1125 - 450 = 675$. (Rectangle: $(75 - 30) \times 15$.)

              **Move 5: competition.** $120 - 3Q = 30 \Rightarrow Q_c = 30$, $P_c = 30$. Constant MC and a straight line: $Q_c = 2Q_m$ here.
            ` }),
          P({ title: 'A water utility (DS10 Q2, unregulated)', q: md`A town's water utility faces $P = 28 - Q$ and has total cost $C(Q) = 80 + 4Q$. Find the unregulated quantity, price and economic profit, and the average cost at that output.`,
            plan: [
              plan('What is MC?', '$MC = 4$: the 80 is fixed and drops out', [
                ['$MC = 80 + 4Q$', 'That is total cost. MC is its derivative.'],
                ['$MC = AC = 80/Q + 4$', 'That is average cost, which includes the fixed cost spread over units.'],
                ['$MC = 84$', 'Cost of the first unit including the fixed cost is not marginal cost.'],
              ], '$dC/dQ = 4$.'),
              PLAN_UP,
            ],
            parts: [N('Q_m', 12), N('P_m', 16), N('AC(Q_m)', 10.667), N('\\pi', 64)],
            sol: md`
              **Move 1:** $MR = 28 - 2Q$, $MC = 4$. **Move 2:** $28 - 2Q = 4 \Rightarrow Q_m = 12$. **Move 3:** $P_m = 28 - 12 = 16$.

              **Move 4: profit.** $TR = 16 \times 12 = 192$. $C(12) = 80 + 48 = 128$. $\pi = 192 - 128 = 64$. $AC = 128/12 \approx 10.67$, and $(16 - 10.67)(12) = 64$. ✓

              (Part 12 asks what happens when a regulator caps the price: [regulation](#/l/m3-rg2).)
            ` }),
          P({ title: 'Rising MC and a fixed cost', q: md`A monopolist has $C(Q) = 100 + 10Q + Q^2$ and faces $P = 70 - 2Q$. Find $Q_m$, $P_m$, profit, and the competitive $Q_c$ and $P_c$.`,
            plan: [PLAN_MRMC({ mr: '70 - 4Q', mc: '10 + 2Q', a: 70, b: 2 }), PLAN_UP],
            parts: [N('Q_m', 10), N('P_m', 50), N('\\pi', 200), N('Q_c', 15), N('P_c', 40)],
            sol: md`
              **Move 1:** $MR = 70 - 4Q$; $MC = 10 + 2Q$ (the 100 drops out).

              **Move 2:** $70 - 4Q = 10 + 2Q \Rightarrow 60 = 6Q \Rightarrow Q_m = 10$. **Move 3:** $P_m = 70 - 20 = 50$.

              **Move 4: profit.** $TR = 500$. $C(10) = 100 + 100 + 100 = 300$. $\pi = 200$.

              **Move 5: competition.** $70 - 2Q = 10 + 2Q \Rightarrow 60 = 4Q \Rightarrow Q_c = 15$, $P_c = 70 - 30 = 40$. Not $2Q_m$: MC rises.
            ` }),
          P({ title: 'Direct demand', q: md`A monopolist faces demand $Q = 200 - 2P$ and has total cost $C(Q) = 20Q$. Find its quantity, price and profit, and the competitive quantity.`,
            plan: [
              plan('First move?', 'Invert: $P = 100 - Q/2$, so $MR = 100 - Q$', [
                ['$MR = 200 - 4P$', 'MR must be a function of $Q$. Invert first.'],
                ['Set $Q = 200 - 2(20)$', 'That plugs MC into demand as if it were the price: the competitive answer.'],
                ['$MR = 200 - 4Q$', 'That treats the direct demand as if it were inverse.'],
              ], 'Then $100 - Q = 20$.'),
              PLAN_UP,
            ],
            parts: [N('Q_m', 80), N('P_m', 60), N('\\pi', 3200), N('Q_c', 160)],
            sol: md`
              **Move 1: invert.** $2P = 200 - Q \Rightarrow P = 100 - 0.5Q$, so $MR = 100 - Q$. $MC = 20$.

              **Move 2:** $100 - Q = 20 \Rightarrow Q_m = 80$. **Move 3:** $P_m = 100 - 40 = 60$.

              **Move 4:** $\pi = (60 - 20)(80) = 3200$. **Move 5:** $100 - 0.5Q = 20 \Rightarrow Q_c = 160$.
            ` }),
          P({ title: 'MR = MC from a table', q: md`A monopolist faces the schedule below and each unit costs \$8 to make (no fixed cost).

| $Q$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $P$ | 22 | 20 | 18 | 16 | 14 | 12 |

How many units does it sell, at what price, and what is its profit?`,
            plan: plan('How do you use the table?', 'Compute MR unit by unit and sell every unit whose MR is at least MC', [
              ['Sell every unit whose **price** is above \\$8', 'That is the competitive rule. Each unit’s contribution is its MR, which is below its price.'],
              ['Pick the row with the largest TR', 'That maximizes revenue and ignores the \\$8 per unit.'],
              ['Pick the row where $P = 8$', 'No row has that price, and it would be the competitive rule anyway.'],
            ], 'MR: 22, 18, 14, 10, 6, 2. Units 1–4 have MR above 8; the 5th adds only 6.'),
            parts: [N('Q', 4), N('P', 16), N('\\pi', 32)],
            sol: md`
              **Move 1: TR and MR.** TR: 22, 40, 54, 64, 70, 72. MR: 22, 18, 14, 10, 6, 2.

              **Move 2: compare with MC = 8.** The 4th unit adds $10 - 8 = 2$ to profit; the 5th would add $6 - 8 = -2$. Stop at 4.

              **Move 3: price from demand.** $P = 16$. **Profit:** $64 - 8 \times 4 = 32$. (Check: 3 units give $54 - 24 = 30$; 5 give $70 - 40 = 30$.)
            ` }),
          G('m3_mo_qp', { need: 3 }),
        ],
      },
      // ================================================================ lesson 3
      {
        id: 'm3-mo3', title: 'Monopoly welfare: CS, PS, DWL against the efficient benchmark', ref: 'Lecture 18 · DS10 Q1(b)',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | Your move |
            |---|---|---|
            | "what is the deadweight loss created by this monopolist's market power?" | monopoly against the efficient $P = MC$ outcome | $Q_c$ from demand $=$ MC; DWL $= \tfrac12 (Q_c - Q_m)(P_m - MC(Q_m))$ |
            | "find the efficient (socially optimal) output" | where the buyer's value of the last unit equals its cost | demand $=$ MC |
            | "calculate CS and PS under monopoly" | the areas at the monopoly price | CS: triangle above $P_m$; PS: between $P_m$ and MC, out to $Q_m$ |
            | "label and shade CS, PS and DWL" | the monopoly welfare picture | see the figure below |
            | "how much surplus is transferred from consumers to the monopolist?" | the rectangle, not the triangle | $(P_m - P_c) \times Q_m$ |
            | "by how much does total welfare fall?" | a Before / After / Change table | $\Delta W = -\text{DWL}$ |
          `),
          R(md`
            ### What "efficient" means, from scratch

            Look at any one unit of output.

            - Its **value** to the buyer who would get it is the height of the **demand** curve at that unit.
            - Its **cost** to society is the height of the **MC** curve at that unit.

            Making the unit creates surplus equal to value minus cost. So total surplus is largest when every unit with value above cost gets made, and none with value below cost. Production should stop exactly where

            $$\text{demand} = MC \qquad (P = MC)$$

            Call that quantity $Q_c$. It is also what a competitive market would produce (Part 9, [efficiency](#/l/m3-lr5)).

            The monopolist stops earlier, at $Q_m$, where demand is still **above** MC. Every unit between $Q_m$ and $Q_c$ is worth more to a buyer than it costs to make, yet it is never made. The surplus those units would have created is gone. That is the **deadweight loss**: the triangle between demand (on top) and MC (below), from $Q_m$ to $Q_c$.

            !!key The three areas under monopoly
              - **CS**: below demand, above the price $P_m$, over the units bought, $0$ to $Q_m$. With straight-line demand: a triangle.
              - **PS**: above MC, below the price $P_m$, over the units sold, $0$ to $Q_m$. Constant MC: a rectangle. Rising MC: a trapezoid. Either way $PS = TR - VC$, and profit is $\pi = PS - F$.
              - **DWL**: between demand and MC from $Q_m$ to $Q_c$. Its vertical side, at $Q_m$, runs from $MC(Q_m)$ up to $P_m$.
          `),
          RF(md`
            ### Worked example: DS10 Q1(b)

            Demand $P = 500 - 2Q$, $MC = Q$. Lesson 2 found $Q_m = 100$, $P_m = 300$. What deadweight loss does the market power create? Find CS and PS too.

            **Move 1: the monopoly point and MC there.** $Q_m = 100$, $P_m = 300$, $MC(100) = 100$.

            **Move 2: the efficient point.** Demand $=$ MC:
            $$500 - 2Q = Q \;\Rightarrow\; 500 = 3Q \;\Rightarrow\; Q_c = \frac{500}{3} \approx 166.67, \qquad P_c \approx 166.67$$

            **Move 3: DWL.** A triangle. Base along $Q$: $Q_c - Q_m = 166.67 - 100 = 66.67$. Height at $Q_m$: $P_m - MC(Q_m) = 300 - 100 = 200$.
            $$\text{DWL} = \tfrac12 \times 66.67 \times 200 = 6666.67$$

            **Move 4: CS.** Triangle above $P_m = 300$ under demand, out to 100. Height $500 - 300 = 200$.
            $$CS = \tfrac12 \times 100 \times 200 = 10{,}000$$

            **Move 5: PS.** Between the price line 300 and $MC = Q$, from 0 to 100. MC rises, so it is a trapezoid: the left side is $300 - 0 = 300$, the right side is $300 - 100 = 200$, the width is 100.
            $$PS = \tfrac12 (300 + 200) \times 100 = 25{,}000$$
            Check with $PS = TR - VC$: $TR = 30{,}000$, $VC$ = area under MC $= \tfrac12 \times 100 \times 100 = 5000$, so $PS = 25{,}000$. ✓

            Total welfare under monopoly: $W_m = 10{,}000 + 25{,}000 = 35{,}000$.

            [[fig:welf]]

            !!trap The DWL height is $P_m - MC(Q_m)$, not $P_m - P_c$
              With rising MC, $P_c$ (166.67) sits **between** $MC(Q_m)$ (100) and $P_m$ (300). Using $300 - 166.67$ gives $\tfrac12 (66.67)(133.33) = 4444$, which is only the consumers' share of the loss. The triangle reaches all the way down to MC.
          `, { welf: { svg: welfFig, cap: 'DS10 under monopoly. Blue: CS = 10,000. Green: PS, a trapezoid between P = 300 and MC = Q, = 25,000. Red: DWL between demand and MC from Q = 100 to 166.7, = 6,666.67.' } }),
          Q(md`On the monopoly graph, the vertical side of the DWL triangle (at $Q_m$) runs from…`, ['$MC(Q_m)$ up to $P_m$', '$P_c$ up to $P_m$', '0 up to $P_m$', '$MR(Q_m)$ up to the demand intercept'], 0,
            [null, 'That stops at the competitive price and drops the producers’ part of the loss. With rising MC the triangle reaches down to MC.', 'The area below MC is cost, not lost surplus.', 'The demand intercept is not on the triangle.'],
            md`DWL is value minus cost on the units not made. At $Q_m$ value is $P_m$ and cost is $MC(Q_m)$.`),
          Q(md`The efficient quantity in a monopoly market is where…`, ['demand meets MC', 'MR meets MC', 'MR is zero', 'demand meets MR'], 0,
            [null, 'That is the monopolist’s choice, which stops short of efficient.', 'That is the revenue maximum, unrelated to cost.', 'Demand and MR meet only at $Q = 0$.'],
            md`Efficiency: produce every unit whose value (demand height) is at least its cost (MC height).`),
          RF(md`
            ### The benchmark and the welfare table

            Under the efficient (competitive) outcome, $P_c = Q_c = 166.67$.

            - $CS_c$: triangle above 166.67 under demand: $\tfrac12 \times 166.67 \times (500 - 166.67) = \tfrac12 \times 166.67 \times 333.33 = 27{,}777.78$.
            - $PS_c$: triangle between 166.67 and $MC = Q$: $\tfrac12 \times 166.67 \times 166.67 = 13{,}888.89$.
            - $W_c = 41{,}666.67$.

            [[fig:comp]]

            | | Competition (efficient) | Monopoly | Change |
            |---|---|---|---|
            | CS | 27,777.78 | 10,000 | −17,777.78 |
            | PS | 13,888.89 | 25,000 | +11,111.11 |
            | W = CS + PS | 41,666.67 | 35,000 | −6,666.67 |

            The change in total welfare is exactly minus the DWL. ✓ Consumers lose much more than the DWL; the producer gains. The next figure shows where each piece goes.
          `, { comp: { svg: compFig, cap: 'The efficient benchmark for DS10: P = MC at (166.7, 166.7). Blue: CS = 27,777.78. Green: PS = 13,888.89. No DWL.' } }),
          RF(md`
            ### Transfer versus loss

            Compare the two pictures and cut the change into three pieces.

            [[fig:trans]]

            - **A, the rectangle:** $(P_m - P_c) \times Q_m = (300 - 166.67) \times 100 = 13{,}333.33$. Consumers still buy these 100 units but pay 133.33 more for each. That money goes to the monopolist. It is a **transfer**: nobody's surplus disappears, it changes hands.
            - **B, the upper triangle:** $\tfrac12 (Q_c - Q_m)(P_m - P_c) = \tfrac12 (66.67)(133.33) = 4444.44$. Consumer surplus on units no longer bought. **Lost.**
            - **C, the lower triangle:** $\tfrac12 (Q_c - Q_m)(P_c - MC(Q_m)) = \tfrac12 (66.67)(66.67) = 2222.22$. Producer surplus on units no longer made. **Lost.**

            Now every change in the table is a sum of these pieces:

            $$\Delta CS = -A - B = -13{,}333.33 - 4444.44 = -17{,}777.78$$
            $$\Delta PS = +A - C = 13{,}333.33 - 2222.22 = +11{,}111.11$$
            $$\Delta W = -B - C = -6666.67 = -\text{DWL}$$

            !!key Transfers move surplus; DWL destroys it
              Market power hurts society **only** through the units it stops from being made (B + C). The higher price on the units still sold (A) is bad for consumers and good for the firm, but it cancels out in total welfare.
          `, { trans: { svg: transFig, cap: 'Gray A: the transfer from consumers to the monopolist. Red B + C: the deadweight loss, split into the consumers’ part (above 166.7) and the producer’s part (below).' } }),
          Q(md`The rectangle $(P_m - P_c) \times Q_m$ is…`, ['a transfer from consumers to the monopolist', 'part of the deadweight loss', 'the monopolist’s fixed cost', 'lost by both sides'], 0,
            [null, 'It does not vanish: consumers pay it and the firm receives it.', 'Fixed cost is not on this graph at all.', 'One side’s loss is the other side’s gain; total welfare does not change.'],
            md`It is the extra price on units still bought. It moves surplus from CS to PS; only the triangles are lost.`),
          RF(md`
            ### Constant MC: PS is a rectangle

            Back to the drug company: $P = 100 - 2Q$, $MC = 20$, fixed cost 200. Lesson 2 found $Q_m = 20$, $P_m = 60$.

            **Move 1: efficient point.** $100 - 2Q = 20 \Rightarrow Q_c = 40$, $P_c = 20$.

            **Move 2: CS.** $\tfrac12 \times 20 \times (100 - 60) = 400$.

            **Move 3: PS.** MC is flat, so the area between the price and MC is a rectangle: $(60 - 20) \times 20 = 800$. Profit is $PS - F = 800 - 200 = 600$, as in lesson 2. ✓

            **Move 4: DWL.** Base $40 - 20 = 20$, height $60 - 20 = 40$: $\tfrac12 \times 20 \times 40 = 400$.

            [[fig:cmc]]

            | | Competition | Monopoly | Change |
            |---|---|---|---|
            | CS | $\tfrac12 \times 40 \times 80 = 1600$ | 400 | −1200 |
            | PS | 0 | 800 | +800 |
            | W | 1600 | 1200 | −400 |

            With constant MC, the competitive PS is zero ($P = MC$ on every unit), and the lower piece C of the DWL disappears: the whole DWL comes out of consumer surplus. The transfer A is the whole monopoly PS, 800.
          `, { cmc: { svg: cmcFig, cap: 'Constant MC = 20. Blue: CS = 400. Green: PS, a rectangle (60 − 20) × 20 = 800. Red: DWL ½ × 20 × 40 = 400.' } }),
          Q(md`With **constant** MC, the monopolist's producer surplus on the graph is a…`, ['rectangle', 'triangle', 'trapezoid', 'zero area'], 0,
            [null, 'A triangle would need MC to rise from the price axis.', 'A trapezoid is the rising-MC case.', 'Zero is the competitive case, $P = MC$.'],
            md`Every unit earns the same $P_m - MC$, so PS $= (P_m - MC) \times Q_m$: a rectangle.`),
          Q(md`A monopolist's PS is \$800 and its fixed cost is \$200. Its economic profit is…`, ['\\$600', '\\$800', '\\$1,000', '\\$200'], 0,
            [null, 'PS ignores fixed cost; profit subtracts it.', 'Fixed cost is subtracted, not added.', 'That is the fixed cost itself.'],
            md`$\pi = PS - F = 800 - 200 = 600$.`),
          Q(md`Compared with competition, monopoly changes total welfare by…`, ['minus the deadweight loss', 'minus the change in CS', 'minus the transfer rectangle', 'zero, because the firm gains what consumers lose'], 0,
            [null, 'CS falls by more than welfare does: part of the CS loss is the transfer, which the firm gains.', 'The transfer cancels: consumers lose it and the firm gains it.', 'The firm gains only the rectangle; the triangles are lost by everybody.'],
            md`$\Delta W = \Delta CS + \Delta PS = (-A - B) + (A - C) = -(B + C) = -\text{DWL}$.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`"What is the deadweight loss created by this monopolist's market power?" You already have $Q_m$ and $P_m$.`,
            plan: plan('Which second quantity do you need?', '$Q_c$, where demand meets MC', [
              ['The $Q$ where $MR = 0$', 'That is the revenue maximum. The DWL compares monopoly with the **efficient** output, where value equals cost.'],
              ['The $Q$ where demand hits zero', 'Units past $Q_c$ cost more than buyers value them; making them would destroy surplus.'],
              ['The $Q$ where $P = AC$', 'That is a zero-profit point (Part 12 regulation), not the efficient benchmark.'],
            ], 'Solve demand $=$ MC for $Q_c$. Then DWL $= \\tfrac12 (Q_c - Q_m)(P_m - MC(Q_m))$.') }),
          P({ q: md`A monopolist with $MC = 2Q$ faces $P = 90 - 2Q$; it sells $Q_m = 15$ at $P_m = 60$, where $MC = 30$. The problem asks for producer surplus.`,
            plan: plan('How do you compute PS?', 'The area between the price line and MC from 0 to 15: $60(15) - \\tfrac12 (15)(30) = 675$', [
              ['$(60 - 30) \\times 15 = 450$', 'That rectangle leaves out the triangle below it: earlier units cost less than 30, so they earn more than \\$30 each.'],
              ['$60 \\times 15 = 900$', 'That is total revenue; PS subtracts variable cost.'],
              ['$\\tfrac12 \\times 15 \\times 30 = 225$', 'That is only the triangle between MC and 30. PS also includes the rectangle from 30 up to the price, $(60 - 30) \\times 15 = 450$.'],
            ], 'PS = TR − VC $= 900 - \\tfrac12(15)(30) = 900 - 225 = 675$. Or the trapezoid $\\tfrac12(60 + 30)(15) = 675$.') }),
          P({ q: md`Rising MC. The problem gives $P_m = 50$, $P_c = 40$, $MC(Q_m) = 30$, $Q_m = 10$ and $Q_c = 15$, and asks for the DWL.`,
            plan: plan('What is the height of the DWL triangle?', '$P_m - MC(Q_m) = 50 - 30 = 20$', [
              ['$P_m - P_c = 10$', 'That is only the consumers’ part of the triangle. The loss reaches down to MC.'],
              ['$P_c - MC(Q_m) = 10$', 'That is only the producer’s part.'],
              ['$P_m = 50$', 'The area below MC is cost, not lost surplus.'],
            ], 'DWL $= \\tfrac12 (15 - 10)(50 - 30) = 50$.') }),
          P({ q: md`The problem asks you to shade consumer surplus under monopoly.`,
            plan: plan('Which area?', 'Below demand, above $P_m$, from 0 to $Q_m$', [
              ['Below demand, above $P_c$, out to $Q_c$', 'That is CS under competition, the benchmark.'],
              ['Below demand, above MC, out to $Q_m$', 'That is CS + PS together (total surplus under monopoly).'],
              ['Between demand and MR', 'MR is not a price anyone pays; CS is measured against the price.'],
            ], 'A triangle with base $Q_m$ and height (demand intercept $- P_m$).') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Constant MC welfare', q: md`A monopolist faces $P = 120 - 3Q$ and has $MC = 30$ (no fixed cost). It sells $Q_m = 15$ at $P_m = 75$. Find the efficient $Q_c$ and $P_c$, CS, PS and DWL under monopoly, and the change in total welfare relative to competition.`,
            plan: plan('What is the efficient benchmark?', 'Demand $=$ MC: $120 - 3Q = 30$', [
              ['$MR = MC$', 'That is how you found $Q_m$. Efficiency uses demand, the value to buyers.'],
              ['$MR = 0$', 'Revenue maximum; not about efficiency.'],
              ['$P = AC$', 'Zero profit, not efficiency.'],
            ], '$Q_c = 30$, $P_c = 30$. DWL $= \\tfrac12 (30 - 15)(75 - 30)$.'),
            parts: [N('Q_c', 30), N('CS', 337.5), N('PS', 675), N('DWL', 337.5), N('\\Delta W', -337.5)],
            sol: md`
              **Move 1: efficient point.** $120 - 3Q = 30 \Rightarrow Q_c = 30$, $P_c = 30$.

              **Move 2: CS** $= \tfrac12 \times 15 \times (120 - 75) = 337.5$. **PS** (rectangle) $= (75 - 30) \times 15 = 675$.

              **Move 3: DWL** $= \tfrac12 \times (30 - 15) \times (75 - 30) = 337.5$.

              **Move 4: welfare table.** Competition: $CS_c = \tfrac12 \times 30 \times 90 = 1350$, $PS_c = 0$, $W_c = 1350$. Monopoly: $W_m = 337.5 + 675 = 1012.5$. Change $= -337.5 = -\text{DWL}$ ✓.
            ` }),
          P({ title: 'Rising MC welfare', q: md`A monopolist has $C(Q) = 100 + 10Q + Q^2$ and faces $P = 70 - 2Q$ (lesson 2: $Q_m = 10$, $P_m = 50$). Find $Q_c$, CS, PS, profit and DWL under monopoly.`,
            plan: [
              plan('Where does the DWL triangle’s vertical side (at $Q_m = 10$) start and end?', 'From $MC(10) = 10 + 2(10) = 30$ up to $P_m = 50$', [
                ['From $P_c = 40$ up to 50', 'That is only the consumers’ part. With rising MC the triangle reaches down to MC.'],
                ['From 0 up to 50', 'The area below MC is the cost of making those units, not lost surplus.'],
                ['From 50 up to 70, the demand intercept', 'That is the height of the CS triangle, on the other side of the price.'],
              ], 'The DWL triangle sits on MC: from 30 up to 50 at $Q = 10$, with its tip at $(15, 40)$.'),
              plan('What shape is PS?', 'A trapezoid between 50 and MC from 0 to 10', [
                ['A rectangle $(50 - 30) \\times 10$', 'MC rises from 10 to 30, so the early units earn more than 20 each.'],
                ['A triangle $\\tfrac12 \\times 10 \\times 20$', 'That drops the rectangle below it.'],
                ['$50 \\times 10$', 'That is TR.'],
              ], '$\\tfrac12[(50 - 10) + (50 - 30)] \\times 10$.'),
            ],
            parts: [N('Q_c', 15), N('CS', 100), N('PS', 300), N('\\pi', 200), N('DWL', 50)],
            sol: md`
              **Move 1: efficient point.** $70 - 2Q = 10 + 2Q \Rightarrow Q_c = 15$, $P_c = 40$.

              **Move 2: CS** $= \tfrac12 \times 10 \times (70 - 50) = 100$.

              **Move 3: PS** (trapezoid) $= \tfrac12[(50 - 10) + (50 - 30)] \times 10 = \tfrac12 (40 + 20)(10) = 300$. Check: $TR - VC = 500 - (100 + 100) = 300$ ✓. **Profit** $= 300 - 100 = 200$ ✓ (lesson 2).

              **Move 4: DWL** $= \tfrac12 (15 - 10)(50 - 30) = 50$. Check: $W_c = 225 + 225 = 450$, $W_m = 100 + 300 = 400$, gap 50 ✓.
            ` }),
          P({ title: 'Transfer and the two triangles', q: md`Same market: $P = 70 - 2Q$, $MC = 10 + 2Q$; monopoly $Q_m = 10$, $P_m = 50$, $MC(Q_m) = 30$; efficient $Q_c = 15$, $P_c = 40$. Split the effect of monopoly into the transfer A and the lost triangles B (consumers) and C (producer). Then give the change in CS and in PS.`,
            plan: plan('What is the transfer A?', '$(P_m - P_c) \\times Q_m = (50 - 40) \\times 10$', [
              ['$(P_m - P_c) \\times Q_c$', 'The extra price is paid only on units still bought, $Q_m$, not on units that disappear.'],
              ['$(P_m - MC(Q_m)) \\times Q_m$', 'That rectangle goes below the competitive price and mixes in producer surplus the firm had anyway.'],
              ['The DWL triangle', 'The triangle is lost by everybody; the transfer is gained by the firm.'],
            ], '$A = 100$, $B = \\tfrac12(5)(10) = 25$, $C = \\tfrac12(5)(40 - 30) = 25$.'),
            parts: [N('A', 100), N('B', 25), N('C', 25), N('\\Delta CS', -125), N('\\Delta PS', 75)],
            sol: md`
              **Move 1: A** $= (50 - 40) \times 10 = 100$. **B** $= \tfrac12 (15 - 10)(50 - 40) = 25$. **C** $= \tfrac12 (15 - 10)(40 - 30) = 25$.

              **Move 2:** $\Delta CS = -A - B = -125$ (from 225 to 100 ✓). $\Delta PS = A - C = +75$ (from 225 to 300 ✓). $\Delta W = -(B + C) = -50 = -\text{DWL}$.
            ` }),
          P({ title: 'Water utility DWL', q: md`DS10 Q2's water utility: $P = 28 - Q$, $C(Q) = 80 + 4Q$. Unregulated it sells 12 units at \$16. Find the efficient quantity, CS, PS and the DWL.`,
            plan: plan('What is MC, and what is the efficient quantity?', '$MC = 4$; demand $=$ MC gives $Q_c = 24$', [
              ['$MC = AC$, so $Q_c$ is where $28 - Q = 80/Q + 4$', 'That is average-cost pricing (Part 12). The efficient benchmark uses marginal cost.'],
              ['$Q_c$ from $28 - 2Q = 4$', 'That is MR = MC, the monopoly choice, $Q = 12$.'],
              ['$Q_c = 28$, where demand hits zero', 'Past $Q = 24$ each unit costs more than it is worth.'],
            ], 'DWL $= \\tfrac12 (24 - 12)(16 - 4)$.'),
            parts: [N('Q_c', 24), N('CS', 72), N('PS', 144), N('DWL', 72)],
            sol: md`
              **Move 1:** $MC = 4$. $28 - Q = 4 \Rightarrow Q_c = 24$.

              **Move 2:** $CS = \tfrac12 \times 12 \times (28 - 16) = 72$. $PS = (16 - 4) \times 12 = 144$ (rectangle; profit $= 144 - 80 = 64$).

              **Move 3:** DWL $= \tfrac12 \times 12 \times 12 = 72$, as DS10 states.
            ` }),
          P({ title: 'Rising MC from MC = Q', q: md`A monopolist faces $P = 300 - Q$ and $MC = Q$ (no fixed cost). Find $Q_m$, $P_m$, $Q_c$, CS, PS and the DWL.`,
            plan: [PLAN_MRMC({ mr: '300 - 2Q', mc: 'Q', a: 300, b: 1 }), PLAN_UP],
            parts: [N('Q_m', 100), N('P_m', 200), N('Q_c', 150), N('CS', 5000), N('PS', 15000), N('DWL', 2500)],
            sol: md`
              **Move 1:** $300 - 2Q = Q \Rightarrow Q_m = 100$; $P_m = 200$; $MC(100) = 100$.

              **Move 2:** $300 - Q = Q \Rightarrow Q_c = 150$, $P_c = 150$.

              **Move 3:** $CS = \tfrac12 \times 100 \times 100 = 5000$. $PS = \tfrac12 (200 + 100) \times 100 = 15{,}000$ (trapezoid; or $20{,}000 - 5000$).

              **Move 4:** DWL $= \tfrac12 (150 - 100)(200 - 100) = 2500$. Check: $W_c = 11{,}250 + 11{,}250 = 22{,}500$; $W_m = 20{,}000$; gap 2500 ✓.
            ` }),
          G('m3_mo_classic', { need: 3 }),
        ],
      },
      // ================================================================ lesson 4
      {
        id: 'm3-mo4', title: 'Elasticity and market power: the elastic portion and the Lerner index', ref: 'Lecture 18 · formula sheet · DS10 Q1',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | Your move |
            |---|---|---|
            | "calculate the own-price elasticity of demand at the monopoly optimum" | $\varepsilon$ at the point $(Q_m, P_m)$ | $\varepsilon = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q}$; for $P = a - bQ$, $\dfrac{dQ}{dP} = -\dfrac1b$ |
            | "calculate and interpret the Lerner index" | the markup as a share of the price | $L = \dfrac{P - MC}{P}$: 0 under competition, larger means more market power |
            | "show that $L = -1/\varepsilon$" | the link at the optimum | compute both and compare |
            | "why does a monopolist with positive MC operate on the elastic portion of demand?" | $MR > 0$ needs $\lvert\varepsilon\rvert > 1$ | $MR = P(1 + 1/\varepsilon) = MC > 0$ |
            | "demand is $Q = kP^{-e}$" | constant elasticity $-e$ | $P = MC \cdot \dfrac{e}{e - 1}$ and $L = \dfrac1e$ |
            | "write MR in terms of elasticity" | the formula sheet line | $MR = P\left(1 + \dfrac{1}{\varepsilon}\right)$ |
          `),
          R(md`
            ### Elasticity, from scratch

            Elasticity measures how strongly buyers react to the price: the percent change in quantity for a 1% change in price. The formula sheet writes it as

            $$\varepsilon = \frac{dQ}{dP}\cdot\frac{P}{Q}$$

            Demand slopes down, so $dQ/dP < 0$ and $\varepsilon$ is negative. We describe its size, $|\varepsilon|$:

            - $|\varepsilon| > 1$: **elastic**. A 1% price rise loses more than 1% of the buyers.
            - $|\varepsilon| = 1$: **unit elastic**.
            - $|\varepsilon| < 1$: **inelastic**. Buyers hardly react.

            **Getting $dQ/dP$ from inverse demand.** Exam demands come as $P = a - bQ$. Solve for $Q$:

            $$bQ = a - P \;\Rightarrow\; Q = \frac{a - P}{b} \;\Rightarrow\; \frac{dQ}{dP} = -\frac{1}{b}$$

            So for a straight line:

            $$\varepsilon = -\frac{1}{b}\cdot\frac{P}{Q}$$

            **DS10 at the monopoly point** ($Q = 100$, $P = 300$, $b = 2$):

            $$\varepsilon = -\frac{1}{2}\cdot\frac{300}{100} = -1.5$$

            Elastic.

            !!trap Flip the slope
              $-b = -2$ is $dP/dQ$, the slope of the **inverse** demand. Elasticity needs $dQ/dP = -1/2$. Using $-2$ gives $-2 \times 3 = -6$, four times too big.
          `),
          R(md`
            ### Elasticity changes along a straight line

            The slope of a straight line never changes, but $P/Q$ does. Near the top (high price, few units) $P/Q$ is large, so demand is elastic. Near the bottom (low price, many units) it is inelastic.

            Where is $|\varepsilon| = 1$? Try the **midpoint**, $Q = \dfrac{a}{2b}$, where $P = a - b\cdot\dfrac{a}{2b} = \dfrac{a}{2}$:

            $$\frac{P}{Q} = \frac{a/2}{a/(2b)} = \frac{a}{2}\cdot\frac{2b}{a} = b \qquad\Rightarrow\qquad \varepsilon = -\frac1b \cdot b = -1$$

            So on a straight-line demand: **elastic above the midpoint** ($Q < a/2b$), unit elastic at it, inelastic below it. For DS10 the midpoint is $(125, 250)$.

            The midpoint quantity $a/(2b)$ is also where $MR = 0$ (lesson 1). That is no accident, as the next step shows.
          `),
          Q(md`Demand is $P = 100 - Q$. The price elasticity at $Q = 20$ is…`, ['$-4$', '$-0.25$', '$-1$', '$-80$'], 0,
            [null, 'That is $(dQ/dP)(Q/P)$, the ratio upside down.', '$-1$ is the midpoint, $Q = 50$.', 'You multiplied by $P$ only; divide by $Q$ too.'],
            md`$P = 80$, $dQ/dP = -1$, so $\varepsilon = -1 \times 80/20 = -4$. Elastic: near the top of the line.`),
          Q(md`On a straight-line demand, the price elasticity at the midpoint is…`, ['$-1$', '$-b$', '0', 'different for every line'], 0,
            [null, 'The slope is not the elasticity.', 'Zero is at the bottom, where $Q$ is largest and $P = 0$.', 'At the midpoint $P/Q = b$ and $dQ/dP = -1/b$, so it is always $-1$.'],
            md`At the midpoint $P/Q = b$, so $\varepsilon = -\tfrac1b \cdot b = -1$ for every straight line.`),
          R(md`
            ### MR in terms of elasticity

            Start from lesson 1:

            $$MR = P + Q\,\frac{dP}{dQ}$$

            Factor out $P$:

            $$MR = P\left(1 + \frac{Q}{P}\cdot\frac{dP}{dQ}\right)$$

            The term $\dfrac{Q}{P}\cdot\dfrac{dP}{dQ}$ is the reciprocal of $\dfrac{P}{Q}\cdot\dfrac{dQ}{dP} = \varepsilon$ (because $\dfrac{dP}{dQ} = 1 \big/ \dfrac{dQ}{dP}$). So it equals $\dfrac{1}{\varepsilon}$:

            $$MR = P\left(1 + \frac{1}{\varepsilon}\right)$$

            **Check with DS10.** At $Q = 100$: $\varepsilon = -1.5$, so $MR = 300\left(1 - \tfrac{1}{1.5}\right) = 300 \times \tfrac13 = 100$. From the line: $MR = 500 - 4(100) = 100$. ✓

            Now read off the sign of MR:

            | Demand at this point | $1/\varepsilon$ | $MR = P(1 + 1/\varepsilon)$ |
            |---|---|---|
            | elastic, $\lvert\varepsilon\rvert > 1$ | between $-1$ and 0 | **positive** |
            | unit elastic, $\varepsilon = -1$ | $-1$ | zero |
            | inelastic, $\lvert\varepsilon\rvert < 1$ | below $-1$ | **negative** |

            This is the TR hill again: TR rises (MR > 0) on the elastic part, peaks at the midpoint, and falls on the inelastic part.
          `),
          Q(md`At a monopolist's current output, $P = 40$ and $\varepsilon = -2$. Its marginal revenue is…`, ['20', '40', '60', '$-20$'], 0,
            [null, 'That is the price; MR is below it.', 'That adds the markup instead of taking it away: $1 + 1/(-2) = 0.5$, not 1.5.', 'MR is negative only on the inelastic part; here $\\lvert\\varepsilon\\rvert = 2 > 1$.'],
            md`$MR = 40\left(1 + \tfrac{1}{-2}\right) = 40 \times 0.5 = 20$.`),
          RF(md`
            ### Why a monopolist with positive MC stays on the elastic part

            At the optimum $MR = MC$. If $MC > 0$, then $MR > 0$ too, and the table says $MR > 0$ only where demand is **elastic**. So the monopolist always operates where $|\varepsilon| > 1$: on a straight line, **above the midpoint**.

            The intuition: suppose it were on the inelastic part. There $MR < 0$, so the last unit **lowered** revenue. Make one unit less: revenue goes **up** and cost goes **down** (it saves MC). Profit rises on both counts. It keeps cutting output and raising the price until demand becomes elastic. No profit-maximizing monopolist with positive MC stops on the inelastic part.

            [[fig:elas]]

            DS10: $Q_m = 100 < 125$, and $|\varepsilon| = 1.5 > 1$. ✓
          `, { elas: { svg: elasFig, cap: 'DS10 demand: elastic above the midpoint (125, 250), inelastic below, where MR is negative. With MC > 0, MR = MC can only happen where MR > 0, so the monopoly point (100, 300) is on the elastic part.' } }),
          Q(md`A consultant tells a monopolist (with $MC > 0$) that its demand is inelastic at the current price. To raise profit it should…`, ['raise the price and sell less', 'lower the price and sell more', 'keep the price: inelastic buyers will pay anything', 'shut down'], 0,
            [null, 'On the inelastic part MR < 0: selling more lowers revenue **and** raises cost.', 'It is not maximizing now: cutting output raises revenue and saves cost.', 'Nothing here says it is losing money; it is just producing too much.'],
            md`Inelastic means $MR < 0 < MC$. Cut output: revenue rises and cost falls. Keep going until demand is elastic and $MR = MC$.`),
          R(md`
            ### The Lerner index: how much market power?

            A competitive firm sells at $P = MC$. A monopolist marks the price up above MC. The **Lerner index** measures the markup as a share of the price:

            $$L = \frac{P - MC}{P}$$

            - Competition: $P = MC$, so $L = 0$.
            - The bigger the markup, the closer $L$ gets to 1. With $MC > 0$, $L$ stays below 1.
            - Read $L = 0.4$ as "40% of the price is markup over marginal cost".

            **The link to elasticity.** At the monopoly optimum, $MC = MR = P(1 + 1/\varepsilon)$. Subtract that from $P$:

            $$P - MC = P - P\left(1 + \frac{1}{\varepsilon}\right) = P - P - \frac{P}{\varepsilon} = -\frac{P}{\varepsilon}$$

            Divide both sides by $P$:

            $$L = \frac{P - MC}{P} = -\frac{1}{\varepsilon}$$

            **Interpretation.** The more elastic the demand (the bigger $|\varepsilon|$), the smaller the markup. Buyers with good substitutes walk away when the price rises, so the seller has little power. At $\varepsilon = -1.5$, $L = 2/3$; at $\varepsilon = -5$, $L = 0.2$. A price taker faces perfectly elastic demand ($|\varepsilon|$ infinitely large) and $L = 0$.

            **DS10.** $L = \dfrac{300 - 100}{300} = \dfrac{2}{3} \approx 0.667$: two-thirds of the price is markup. Check: $\varepsilon = -1.5$, so $-1/\varepsilon = 1/1.5 = 2/3$. ✓

            !!trap Divide by the price, not by MC
              $\dfrac{P - MC}{MC} = \dfrac{200}{100} = 2$ is the markup over **cost**. The Lerner index divides by $P$ and is always between 0 and 1.

            !!trap $L = -1/\varepsilon$ holds only at the optimum
              The formula sheet says "at the untaxed single-price monopoly's interior optimum". At any other point, or with a tax on the monopoly (Part 12), compute $L$ from its definition, $(P - MC)/P$.
          `),
          Q(md`At a monopolist's optimum, $L = 0.25$. The price elasticity of demand there is…`, ['$-4$', '$-0.25$', '$-1.25$', '$-0.75$'], 0,
            [null, 'That is $-L$; the link is $L = -1/\\varepsilon$, so $\\varepsilon = -1/L$.', 'No rule adds 1.', '$|\\varepsilon| < 1$ is inelastic, where no monopolist with MC > 0 operates.'],
            md`$\varepsilon = -1/L = -1/0.25 = -4$.`),
          Q(md`Two monopolists are at their optima. Firm A faces $\varepsilon = -1.5$; firm B faces $\varepsilon = -5$. Which has more market power?`, ['A, with $L = 0.67$', 'B, with $L = 0.2$', 'B, because its demand is more elastic', 'they are the same; both are monopolists'], 0,
            [null, '0.2 is less than 0.67: B has the smaller markup.', 'More elastic demand means buyers react more, so **less** power.', 'Being the only seller is not enough; how much buyers react sets the markup.'],
            md`$L = -1/\varepsilon$: A gets $1/1.5 = 0.67$, B gets $1/5 = 0.2$. Less elastic demand, more power.`),
          RF(md`
            ### Constant-elasticity demand: the markup rule

            Some demands have the **same** elasticity at every price: $Q = kP^{-e}$, with $k > 0$ and $e > 0$.

            **Move 1: differentiate** with the power rule:
            $$\frac{dQ}{dP} = -e\,k\,P^{-e-1}$$

            **Move 2: multiply by $P/Q$**, with $Q = kP^{-e}$:
            $$\varepsilon = -e\,k\,P^{-e-1}\cdot\frac{P}{k\,P^{-e}} = -e\cdot\frac{P^{-e-1}\cdot P}{P^{-e}} = -e\cdot\frac{P^{-e}}{P^{-e}} = -e$$

            The $k$'s cancel and the powers of $P$ cancel: $\varepsilon = -e$ everywhere. That is the formula sheet's line.

            **Move 3: $MR = MC$** with constant marginal cost $MC$:
            $$P\left(1 - \frac{1}{e}\right) = MC \;\Rightarrow\; P\cdot\frac{e - 1}{e} = MC \;\Rightarrow\; P = MC\cdot\frac{e}{e - 1}$$

            The price is a fixed multiple of MC: the **markup rule**. And $L = \dfrac{P - MC}{P} = 1 - \dfrac{e - 1}{e} = \dfrac{1}{e}$, which is $-1/\varepsilon$. ✓

            | $e$ | 1.5 | 2 | 3 | 5 |
            |---|---|---|---|---|
            | $P$ as a multiple of MC | 3 | 2 | 1.5 | 1.25 |
            | $L = 1/e$ | 0.667 | 0.5 | 0.333 | 0.2 |

            **Example.** $Q = 1000P^{-2}$ and $MC = 5$: $P = 5 \times \tfrac{2}{1} = 10$, and $Q = 1000 \times 10^{-2} = 10$.

            [[fig:ce]]

            !!key $e$ must be bigger than 1
              If $e \le 1$, then $MR = P(1 - 1/e) \le 0$ at **every** price. Cutting output always raises revenue and saves cost, so there is no finite best price. This is the elastic-portion rule again: a monopolist with $MC > 0$ needs $|\varepsilon| > 1$.
          `, { ce: { svg: ceFig, cap: 'Q = 1000P⁻²: elasticity −2 everywhere, so MR = P/2 (orange). MR meets MC = 5 at Q = 10; demand there gives P = 10, twice MC.' } }),
          Q(md`Demand is $Q = 800P^{-2}$ and marginal cost is constant at \$15. The monopoly price is…`, ['\\$30', '\\$15', '\\$22.50', '\\$7.50'], 0,
            [null, 'That is $P = MC$, the competitive price.', 'That uses $e = 3$; here $e = 2$.', 'That is $MC(1 - 1/e)$: the rule upside down, a price below cost.'],
            md`$e = 2$: $P = 15 \times \tfrac{2}{1} = 30$. Half the price is markup, $L = 0.5$.`),
          Q(md`Demand is $Q = 50P^{-0.8}$ and $MC = 4$. What happens?`, ['there is no finite profit-maximizing price', '$P = 4 \\times 0.8 / (-0.2) = -16$', '$P = 4$', '$P = 20$'], 0,
            [null, 'A negative price is a sign the rule does not apply: $e < 1$ means MR is negative at every price.', 'That is the competitive rule.', 'No formula gives 20; with $e < 1$ the markup rule breaks down.'],
            md`$e = 0.8 < 1$: demand is inelastic everywhere, so $MR < 0$ at every price. The seller always gains by cutting output and raising the price.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`Demand is $P = 200 - 4Q$. The problem asks for the price elasticity at $Q = 20$.`,
            plan: plan('How do you compute it?', '$\\dfrac{dQ}{dP} = -\\dfrac14$, times $\\dfrac{P}{Q} = \\dfrac{120}{20}$: $\\varepsilon = -1.5$', [
              ['$-4 \\times \\dfrac{120}{20} = -24$', '$-4$ is $dP/dQ$. Elasticity needs $dQ/dP = -1/4$.'],
              ['$-\\dfrac14 \\times \\dfrac{20}{120}$', 'The ratio is upside down: use $P/Q$.'],
              ['$\\varepsilon = -4$, the slope', 'The slope alone is not the elasticity; it changes along the line.'],
            ], 'Find $P$ at $Q = 20$ first: $200 - 80 = 120$.') }),
          P({ q: md`At the optimum, $P = \$50$ and $MC = \$20$. "Compute and interpret the Lerner index."`,
            plan: plan('Which formula?', '$L = (P - MC)/P = 30/50 = 0.6$', [
              ['$(P - MC)/MC = 1.5$', 'That is the markup over cost. Lerner divides by the price.'],
              ['$P/MC = 2.5$', 'A price-to-cost ratio; Lerner is 0, not 1, under competition.'],
              ['$MC/P = 0.4$', 'That is $1 - L$: the share of the price that is cost.'],
            ], '60% of the price is markup over marginal cost.') }),
          P({ q: md`Demand is $Q = 500P^{-3}$ and $MC = 8$. The problem asks for the monopoly price.`,
            plan: plan('What do you do?', 'Markup rule: $P = 8 \\cdot \\dfrac{3}{3 - 1} = 12$', [
              ['Invert demand and use $MR = a - 2bQ$', 'That shortcut is for straight-line demand only.'],
              ['$P = MC = 8$', 'The competitive price; a monopolist marks up.'],
              ['$P = 8\\left(1 - \\tfrac13\\right) = 5.33$', 'That is the rule upside down: a price below MC. Solve $P(1 - 1/e) = MC$ for $P$.'],
            ], '$\\varepsilon = -3$, so $P(2/3) = 8$ and $P = 12$; $L = 1/3$.') }),
          P({ q: md`The only information given is that the monopolist's demand elasticity at its optimum is $-2.5$. "Find the Lerner index."`,
            plan: plan('How?', '$L = -1/\\varepsilon = 0.4$', [
              ['You cannot without P and MC', 'At the untaxed optimum $L = -1/\\varepsilon$ needs only the elasticity.'],
              ['$L = 2.5$', 'The Lerner index is between 0 and 1.'],
              ['$L = 1 - 2.5$', 'No such rule; take $-1/\\varepsilon$.'],
            ], '$L = 1/2.5 = 0.4$: 40% of the price is markup.') }),
          P({ q: md`A monopolist with $MC > 0$ is producing where demand has $\varepsilon = -0.6$.`,
            plan: plan('Is it maximizing profit?', 'No: demand is inelastic, so $MR < 0 < MC$; it should cut output and raise the price', [
              ['Yes, inelastic demand lets it charge a lot', 'On the inelastic part, the last unit lowered revenue; dropping it raises revenue and saves cost.'],
              ['No: it should lower the price to sell more', 'Selling more on the inelastic part lowers revenue and raises cost.'],
              ['Cannot tell without MC', 'Any positive MC is above a negative MR.'],
            ], '$MR = P(1 - 1/0.6) < 0$. Cut output until demand is elastic and $MR = MC$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'DS10: Lerner and elasticity', q: md`DS10 Q1: $P = 500 - 2Q$, $MC = Q$, and the monopolist sells $Q_m = 100$ at $P_m = 300$. (a) Compute the Lerner index. (b) Compute the price elasticity of demand at the optimum and check $L = -1/\varepsilon$. (c) Use $MR = P(1 + 1/\varepsilon)$ to get MR at the optimum. (d) Up to what quantity is demand elastic?`,
            plan: [PLAN_L, PLAN_EPS],
            parts: [N('L', 0.6667), N('\\varepsilon', -1.5), N('MR', 100), N('\\text{elastic for }Q <', 125)],
            sol: md`
              **Move 1: Lerner.** $MC(100) = 100$. $L = \dfrac{300 - 100}{300} = \dfrac{2}{3} \approx 0.667$.

              **Move 2: elasticity.** $Q = (500 - P)/2$, so $dQ/dP = -\tfrac12$. $\varepsilon = -\tfrac12 \times \tfrac{300}{100} = -1.5$. Check: $-1/\varepsilon = 0.667 = L$ ✓.

              **Move 3: MR.** $300\left(1 - \tfrac{1}{1.5}\right) = 300 \times \tfrac13 = 100$, the same as $500 - 4(100)$ and as $MC(100)$ ✓.

              **Move 4: elastic range.** Above the midpoint: $Q < \dfrac{500}{2 \times 2} = 125$. The optimum, 100, is inside it.
            ` }),
          P({ title: 'Constant MC: power and elasticity', q: md`A monopolist faces $P = 120 - 3Q$ with constant $MC = 30$. Find $Q_m$, $P_m$, the Lerner index, and the elasticity at the optimum.`,
            plan: [PLAN_MRMC({ mr: '120 - 6Q', mc: '30', a: 120, b: 3 }), PLAN_L, PLAN_EPS],
            parts: [N('Q_m', 15), N('P_m', 75), N('L', 0.6), N('\\varepsilon', -1.6667)],
            sol: md`
              **Move 1:** $120 - 6Q = 30 \Rightarrow Q_m = 15$; $P_m = 120 - 45 = 75$.

              **Move 2:** $L = (75 - 30)/75 = 0.6$.

              **Move 3:** $dQ/dP = -\tfrac13$; $\varepsilon = -\tfrac13 \times \tfrac{75}{15} = -\tfrac53 \approx -1.667$. Check $-1/\varepsilon = 0.6$ ✓. Elastic, as it must be.
            ` }),
          P({ title: 'Constant elasticity', q: md`A monopolist faces $Q = 1000P^{-2}$ and has constant $MC = 5$ (no fixed cost). Find the elasticity, the price, the quantity, the Lerner index and the profit.`,
            plan: plan('First move?', 'Read $\\varepsilon = -2$ off the exponent, then the markup rule $P = MC \\cdot \\tfrac{e}{e - 1}$', [
              ['Invert demand and use $MR = a - 2bQ$', 'Not a straight line: twice-the-slope does not apply.'],
              ['Compute $dQ/dP$ at the midpoint', 'Constant elasticity: the same $\\varepsilon$ at every price.'],
              ['Set $P = MC = 5$', 'That is the competitive price.'],
            ], '$P = 5 \\times 2 = 10$; then $Q = 1000 \\times 10^{-2}$.'),
            parts: [N('\\varepsilon', -2), N('P_m', 10), N('Q_m', 10), N('L', 0.5), N('\\pi', 50)],
            sol: md`
              **Move 1:** $Q = kP^{-e}$ with $e = 2$, so $\varepsilon = -2$.

              **Move 2:** $P\left(1 - \tfrac12\right) = 5 \Rightarrow P_m = 10$.

              **Move 3:** $Q_m = 1000 \times 10^{-2} = 1000/100 = 10$.

              **Move 4:** $L = (10 - 5)/10 = 0.5 = 1/e$ ✓. $\pi = (10 - 5) \times 10 = 50$.
            ` }),
          P({ title: 'Working backwards from L', q: md`At its profit-maximizing output a monopolist's Lerner index is 0.25 and its marginal cost is \$30. Find the price elasticity of demand there, and the price.`,
            plan: plan('How do you get the price from L and MC?', 'Rearrange $L = (P - MC)/P$: $P = \\dfrac{MC}{1 - L}$', [
              ['$P = MC(1 + L) = 37.50$', 'That treats L as a markup over cost. L is a share of the **price**: $MC = P(1 - L)$.'],
              ['$P = MC/L = 120$', 'Dividing by L alone drops the 1. Write the definition and solve for $P$.'],
              ['$P = MC = 30$', 'Only if $L = 0$.'],
            ], '$\\varepsilon = -1/L = -4$; $P = 30/0.75 = 40$.'),
            parts: [N('\\varepsilon', -4), N('P', 40)],
            sol: md`
              **Move 1:** $L = -1/\varepsilon \Rightarrow \varepsilon = -1/0.25 = -4$.

              **Move 2:** $L = \dfrac{P - MC}{P} \Rightarrow LP = P - MC \Rightarrow MC = P(1 - L) \Rightarrow P = \dfrac{30}{0.75} = 40$.

              Check: $(40 - 30)/40 = 0.25$ ✓, and $MR = 40(1 - \tfrac14) = 30 = MC$ ✓.
            ` }),
          P({ title: 'More or less?', q: md`A monopolist currently charges \$60, where its demand elasticity is $-3$. Its marginal cost is \$25. Find its marginal revenue and decide which way it should move.`,
            plan: plan('What do you compare?', '$MR = P(1 + 1/\\varepsilon)$ with MC', [
              ['$P$ with MC', '$P > MC$ at every monopoly optimum; that comparison cannot tell you which way to move.'],
              ['$\\varepsilon$ with $-1$', 'Elastic only says MR is positive, not whether it beats MC.'],
              ['$L$ with $1/3$', 'That checks the optimum condition indirectly, but MR against MC tells you the direction directly.'],
            ], '$MR = 60(1 - 1/3) = 40 > 25$: the next unit adds more revenue than cost.'),
            parts: [N('MR', 40), FIX('It should…', ['sell more (lower the price)', 'sell less (raise the price)', 'stay put'], 0, [null, 'Cutting output gives up units that add 40 of revenue for 25 of cost.', '$MR \\neq MC$, so it is not at the optimum.'])],
            sol: md`
              **Move 1:** $MR = 60\left(1 + \tfrac{1}{-3}\right) = 60 \times \tfrac23 = 40$.

              **Move 2:** $MR = 40 > MC = 25$: one more unit raises profit by about 15. Expand output, lowering the price along demand, until $MR = MC$.

              Check with Lerner: now $L = (60 - 25)/60 = 0.583$, but the optimum needs $L = -1/\varepsilon = 0.333$. The markup is too big. ✓
            ` }),
          P({ title: 'The elastic range', q: md`A monopolist faces $P = 100 - 2Q$ and has constant $MC = 20$. (a) For which quantities is demand elastic? (b) Find $Q_m$ and $P_m$ and confirm the optimum is elastic. (c) Find the Lerner index.`,
            plan: plan('For (a): where is a straight-line demand elastic?', 'Above the midpoint: $Q < \\dfrac{a}{2b} = 25$', [
              ['Below the midpoint, $Q > 25$', 'Backwards: near the bottom of the line $P/Q$ is small, so demand is inelastic there.'],
              ['Everywhere, since the slope is $-2$', 'A straight line has one slope but changing elasticity.'],
              ['Where $P > MC$', 'Elasticity is a property of demand alone; MC does not enter.'],
            ], 'The midpoint is where $MR = 100 - 4Q = 0$: $Q = 25$, $P = 50$.'),
            parts: [N('\\text{elastic for }Q <', 25), N('Q_m', 20), N('P_m', 60), N('\\varepsilon', -1.5), N('L', 0.6667)],
            sol: md`
              **Move 1:** Midpoint $Q = 100/4 = 25$ ($P = 50$). Elastic for $Q < 25$.

              **Move 2:** $100 - 4Q = 20 \Rightarrow Q_m = 20$, $P_m = 60$. $\varepsilon = -\tfrac12 \times \tfrac{60}{20} = -1.5$: elastic ✓ (20 < 25).

              **Move 3:** $L = (60 - 20)/60 = 0.667 = 1/1.5$ ✓.
            ` }),
          G('m3_mo_lerner', { need: 3 }),
          G('m3_mo_markup', { need: 2 }),
          R(md`
            ### Monopoly versus competition: which rule?

            The whole Part in one table. Read the setting, pick the rule, then know where the price comes from.

            | The setting or question | The rule | Where the price comes from |
            |---|---|---|
            | a competitive firm: "price taker", "the market price is \$20" | $P = MC$ (rising part of MC, above min AVC) | the market |
            | one seller: "monopolist", "only seller", demand $P = a - bQ$ | $MR = MC$, with $MR = a - 2bQ$ | **demand** at $Q_m$ |
            | "efficient", "socially optimal", "if the industry were competitive" | demand $=$ MC | demand (equal to MC) at $Q_c$ |
            | "maximize revenue", "where is TR largest?" | $MR = 0$ | demand |
            | competitive long run with free entry | $P = \min LRAC$ | the bottom of LRAC |
            | constant-elasticity demand $Q = kP^{-e}$ | $P(1 - 1/e) = MC$ | $P = MC \cdot \dfrac{e}{e - 1}$ |
            | "Lerner index", "market power" | $L = \dfrac{P - MC}{P}$ | at the optimum $L = -1/\varepsilon$ |
            | "deadweight loss of monopoly" | triangle between demand and MC | from $Q_m$ to $Q_c$ |

            ### Recognition run

            Ten setups from across this Part, in mixed order. For each, name the first move. No numbers needed beyond the first step.
          `),
          P({ q: md`Demand is $P = 80 - 2Q$ and the only seller has $C(Q) = 50 + 8Q$. "Find the profit-maximizing output."`,
            plan: plan('What is your first equation?', '$80 - 4Q = 8$ ($MR = MC$)', [
              ['$80 - 2Q = 8$', 'That is $P = MC$: the competitive benchmark, not the monopoly choice.'],
              ['$80 - 4Q = 0$', 'That maximizes revenue and ignores the \\$8 per unit.'],
              ['$80 - 2Q = 50/Q + 8$', 'That is $P = AC$, the zero-profit point.'],
            ], '$Q_m = 18$, then $P_m = 80 - 36 = 44$ from demand.') }),
          P({ q: md`Same market ($P = 80 - 2Q$, $MC = 8$). "What quantity would a perfectly competitive industry produce?"`,
            plan: plan('What is your first equation?', '$80 - 2Q = 8$ (demand $=$ MC)', [
              ['$80 - 4Q = 8$', 'That is the monopoly rule again.'],
              ['$Q = 2 \\times 18$ without checking', 'True here only because MC is constant and demand is a line. Solve demand $=$ MC to be safe.'],
              ['$P = \\min AC$', 'With constant MC and a fixed cost, AC never reaches a minimum; the benchmark is demand $=$ MC.'],
            ], '$Q_c = 36$, $P_c = 8$.') }),
          P({ q: md`Demand is $Q = 300 - 3P$. "Find marginal revenue."`,
            plan: plan('First move?', 'Invert: $P = 100 - Q/3$, then $MR = 100 - 2Q/3$', [
              ['$MR = 300 - 6P$', 'MR must be a function of $Q$; doubling inside the direct form is not a rule.'],
              ['$MR = 300 - 6Q$', 'That pretends $P$ was on the left.'],
              ['$MR = P$', 'Only for a price taker.'],
            ], 'Invert, then double the slope.') }),
          P({ q: md`"Calculate the deadweight loss created by the monopolist's market power." You have $Q_m$, $P_m$ and $MC = 2Q$.`,
            plan: plan('What do you find next?', '$Q_c$ from demand $=$ MC, and $MC(Q_m)$ for the bottom of the triangle', [
              ['$P_c$ only, then $\\tfrac12 (Q_c - Q_m)(P_m - P_c)$', 'With rising MC that is only the consumers’ part; the triangle reaches down to $MC(Q_m)$.'],
              ['The $Q$ where $MR = 0$', 'Revenue maximum; not the efficient benchmark.'],
              ['The profit rectangle', 'Profit is a transfer plus PS, not a loss to society.'],
            ], 'DWL $= \\tfrac12 (Q_c - Q_m)(P_m - MC(Q_m))$.') }),
          P({ q: md`Demand is $Q = 2000P^{-4}$ and $MC = 9$. "Find the monopoly price."`,
            plan: plan('First move?', 'Markup rule with $e = 4$: $P = 9 \\cdot \\tfrac43 = 12$', [
              ['$MR = a - 2bQ$', 'Not a straight line.'],
              ['$P = 9$', 'The competitive price.'],
              ['$P = 9\\left(1 - \\tfrac14\\right)$', 'Upside down: that gives a price below MC.'],
            ], '$\\varepsilon = -4$, $P(3/4) = 9$, $P = 12$, $L = 0.25$.') }),
          P({ q: md`At the optimum $P = 50$ and $MC = 20$. "Compute the Lerner index."`,
            plan: plan('Which formula?', '$(50 - 20)/50 = 0.6$', [
              ['$(50 - 20)/20 = 1.5$', 'Divides by MC; Lerner divides by the price.'],
              ['$50/20$', 'A ratio, not the Lerner index.'],
              ['$-1/\\varepsilon$, but you need $\\varepsilon$ first', 'With P and MC in hand the definition is faster; $-1/\\varepsilon$ is the check.'],
            ], '60% of the price is markup.') }),
          P({ q: md`Demand is $P = 80 - 2Q$. "Find the price elasticity at $Q = 15$, $P = 50$."`,
            plan: plan('First move?', '$dQ/dP = -\\tfrac12$, so $\\varepsilon = -\\tfrac12 \\cdot \\tfrac{50}{15} = -1.67$', [
              ['$-2 \\cdot \\tfrac{50}{15}$', 'Uses $dP/dQ$; flip it.'],
              ['$-\\tfrac12 \\cdot \\tfrac{15}{50}$', 'Ratio upside down.'],
              ['$-2$', 'The slope is not the elasticity.'],
            ], 'Elastic. Here $MR = 80 - 60 = 20$, so if $MC = 20$ this is the optimum of the card before, and $-1/\\varepsilon = 0.6 = L$ ✓.') }),
          P({ q: md`A competitive firm has $MC = 2q + 4$ and the market price is \$20. "How much does it produce?"`,
            plan: plan('First equation?', '$20 = 2q + 4$ ($P = MC$)', [
              ['$MR = 20 - 2bq = 2q + 4$', 'A price taker’s MR is the price; there is no downward demand to double.'],
              ['$20 = AC$', 'Zero profit, not maximum profit.'],
              ['$MR = 0$', 'Revenue keeps rising with every unit at a fixed price.'],
            ], '$q = 8$. Price takers use $P = MC$.') }),
          P({ q: md`Demand is $P = 80 - 2Q$. "At what output is total revenue largest?"`,
            plan: plan('Which equation?', '$80 - 4Q = 0$ ($MR = 0$)', [
              ['$80 - 2Q = 0$', 'Price zero: revenue zero.'],
              ['$MR = MC$', 'That is profit, and no cost is involved in a revenue question.'],
              ['$P = MR$', 'Only at $Q = 0$.'],
            ], '$Q = 20$, $P = 40$, $TR = 800$: the midpoint, where $\\varepsilon = -1$.') }),
          P({ q: md`A monopolist's fixed cost rises by \$100. "What happens to its price and output?"`,
            plan: plan('What do you check?', 'Whether MR or MC changed: neither does, so price and output stay the same', [
              ['Price rises by \\$100 divided by output', 'That is an average-cost idea. The optimum depends only on MR and MC.'],
              ['Output falls to cut costs', 'The fixed cost is paid whatever the output; it does not enter MC.'],
              ['It must now set $P = AC$', 'P = AC is a regulation idea (Part 12), not the monopolist’s choice.'],
            ], 'Same $Q_m$ and $P_m$; profit falls by 100 (as long as it stays open).') }),
        ],
      },
    ],
  });
})();

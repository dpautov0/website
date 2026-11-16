/* Mini Exam 3 · Part 10: taxes, ceilings, floors and price supports (Lecture 17, DS9 Q3).
   Running market for the whole Part (Lecture 17): Qd = 200 - 5P, Qs = 5P, so P* = 20, Q* = 100, CS = PS = 1000.
   Inverse curves: demand P = 40 - Q/5, supply P = Q/5. Every lesson opens with what the problem looks like on the exam,
   names the moves in the worked examples, and every practice problem asks for the plan before the numbers. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, X, FIX, plan, gen, F, pick } = M3;

  // ------------------------------------------------------------------ text helpers
  // cv(5) = '5P', cv(1) = 'P'; mi(40) = ' - 40', mi(0) = ''
  const cv = (c, v = 'P') => (c === 1 ? v : `${F(c)}${v}`);
  const mi = (e) => (e ? ` - ${F(e)}` : '');
  const dTxt = (a, b) => `Q^d = ${F(a)} - ${cv(b)}`;
  const sTxt = (d, e) => `Q^s = ${cv(d)}${mi(e)}`;
  // a linear market Qd = a - bP, Qs = dP - e: equilibrium, choke price, supply intercept, no-policy surpluses
  const mkt = (a, b, d, e) => {
    const Ps = (a + e) / (b + d), Qs = d * Ps - e, choke = a / b, smin = e / d;
    return { a, b, d, e, Ps, Qs, choke, smin, D: (p) => a - b * p, S: (p) => d * p - e, PD: (q) => (a - q) / b, PSf: (q) => (q + e) / d,
      CS0: 0.5 * Qs * (choke - Ps), PS0: 0.5 * Qs * (Ps - smin) };
  };

  // ------------------------------------------------------------------ figures: the Lecture 17 market
  const LD = { seg: [[0, 40], [150, 10]], lab: 'D', at: 'end', dx: 4, dy: 0, anchor: 'l' };
  const LS = { seg: [[0, 0], [150, 30]], lab: 'S', at: 'end', dx: 4, dy: 0, anchor: 'l' };
  const lec = (xt, yt, items) => EC.graph({ w: 330, h: 270, x: [0, 150], y: [0, 42], xl: 'Q', yl: '\\$', xt, yt, items: [...items, LD, LS] });

  // t = 4: Pc = 22, Pp = 18, Q = 90
  const wedgeFig = lec([90, 100], [18, 20, 22], [
    { pt: [100, 20], lab: '\\text{no tax}', at: 'r' },
    { pt: [90, 22], lab: 'P_c', at: 'tl', guide: true },
    { pt: [90, 18], lab: 'P_p', at: 'bl', guide: 'y' },
    { arrow: [[80, 20], [80, 21.8]] }, { arrow: [[80, 20], [80, 18.2]] },
    { text: [78, 20], t: 't = 4', anchor: 'r' },
  ]);
  const shiftSFig = lec([90], [18, 22], [
    { seg: [[0, 4], [150, 34]], cls: 'curve c2', lab: 'S + t', at: 'end', dx: 4, dy: 0, anchor: 'l' },
    { arrow: [[40, 8], [40, 12]] }, { text: [38, 10], t: '+t', anchor: 'r' },
    { pt: [100, 20] },
    { pt: [90, 22], lab: 'P_c', at: 'tl', guide: true },
    { pt: [90, 18], lab: 'P_p', at: 'br', guide: 'y' },
  ]);
  const shiftDFig = lec([90], [18, 22], [
    { seg: [[0, 36], [150, 6]], cls: 'curve c2', lab: 'D - t', at: 'end', dx: 4, dy: 0, anchor: 'l' },
    { arrow: [[40, 32], [40, 28]] }, { text: [38, 30], t: '-t', anchor: 'r' },
    { pt: [100, 20] },
    { pt: [90, 22], lab: 'P_c', at: 'tr', guide: 'y' },
    { pt: [90, 18], lab: 'P_p', at: 'bl', guide: true },
  ]);
  const gapFig = lec([60, 90, 100], [12, 18, 22, 28], [
    { arrow: [[60, 12], [60, 28]] }, { text: [62, 20], t: '\\text{gap} = 16', anchor: 'l' },
    { pt: [60, 28], guide: 'y' }, { pt: [60, 12], guide: 'y' },
    { pt: [90, 22], guide: 'y' }, { pt: [90, 18], guide: 'y' },
    { text: [98, 12.5], t: '\\text{at } 90\\text{: gap} = 4 = t', anchor: 'l' },
    { pt: [100, 20], lab: '\\text{gap} = 0', at: 'r' },
  ]);

  // lesson 2: every welfare area with a $4 tax (CS 810, PS 810, revenue 360, DWL 20)
  const taxWelfFig = lec([90, 100], [18, 20, 22], [
    { poly: [[0, 40], [90, 22], [0, 22]], cls: 'cs' },
    { poly: [[0, 18], [90, 18], [90, 22], [0, 22]], cls: 'ex' },
    { poly: [[0, 0], [90, 18], [0, 18]], cls: 'gain' },
    { poly: [[90, 22], [100, 20], [90, 18]], cls: 'loss' },
    { text: [24, 27.5], t: 'CS' }, { text: [42, 20], t: '\\text{tax revenue}' }, { text: [26, 12], t: 'PS' },
    { text: [118, 33], t: '\\text{DWL}', anchor: 'l' }, { arrow: [[117, 32], [96.5, 20.6]] },
  ]);
  // incidence A: Qd = 120 - 2P, Qs = 4P (demand less responsive), t = 6: P* 20, Pc 24, Pp 18, Q 72
  const incAFig = EC.graph({
    w: 330, h: 270, x: [0, 130], y: [0, 62], xl: 'Q', yl: '\\$', xt: [72, 80], yt: [18, 20, 24],
    items: [
      { poly: [[0, 18], [72, 18], [72, 24], [0, 24]], cls: 'ex' },
      { poly: [[72, 24], [80, 20], [72, 18]], cls: 'loss' },
      { seg: [[0, 20], [80, 20]], cls: 'curve dim dash' },
      { seg: [[0, 60], [120, 0]], lab: 'D', at: 0.97, dx: 6, dy: 0, anchor: 'l' },
      { seg: [[0, 0], [130, 32.5]], lab: 'S', at: 'end', dx: 4, dy: 0, anchor: 'l' },
      { pt: [80, 20] }, { pt: [72, 24] }, { pt: [72, 18] },
      { text: [80, 33], t: '\\text{buyers: } 4', anchor: 'l' }, { arrow: [[79, 32], [50, 22.4]] },
      { text: [80, 6], t: '\\text{sellers: } 2', anchor: 'l' }, { arrow: [[79, 7], [50, 18.8]] },
    ],
  });
  // incidence B: Qd = 120 - 4P, Qs = 2P (supply less responsive), t = 6: P* 20, Pc 22, Pp 16, Q 32
  const incBFig = EC.graph({
    w: 330, h: 270, x: [0, 70], y: [0, 33], xl: 'Q', yl: '\\$', xt: [32, 40], yt: [16, 20, 22],
    items: [
      { poly: [[0, 16], [32, 16], [32, 22], [0, 22]], cls: 'ex' },
      { poly: [[32, 22], [40, 20], [32, 16]], cls: 'loss' },
      { seg: [[0, 20], [40, 20]], cls: 'curve dim dash' },
      { seg: [[0, 30], [70, 12.5]], lab: 'D', at: 'end', dx: 4, dy: 0, anchor: 'l' },
      { seg: [[0, 0], [64, 32]], lab: 'S', at: 'end', dx: 4, dy: 0, anchor: 'l' },
      { pt: [40, 20] }, { pt: [32, 22] }, { pt: [32, 16] },
      { text: [41, 29.5], t: '\\text{buyers: } 2', anchor: 'l' }, { arrow: [[40, 29], [20, 21.2]] },
      { text: [44, 6], t: '\\text{sellers: } 4', anchor: 'l' }, { arrow: [[43, 6.6], [20, 17.6]] },
    ],
  });

  // lesson 3: ceilings in the Lecture 17 market (efficient rationing). c = 18: Qs 90, Qd 110, P_D(90) = 22; c = 16: Qs 80, Qd 120, P_D(80) = 24
  const ceilFig = (c, xt) => {
    const qs = 5 * c, qd = 200 - 5 * c, pd = 40 - qs / 5;
    return lec(xt, [c, pd], [
      { poly: [[0, 40], [qs, pd], [qs, c], [0, c]], cls: 'cs' },
      { poly: [[0, 0], [qs, c], [0, c]], cls: 'gain' },
      { poly: [[qs, pd], [100, 20], [qs, c]], cls: 'loss' },
      { seg: [[0, c], [150, c]], cls: 'curve c4 dash', lab: `P_{\\max} = ${c}`, at: 'end', dx: -2, dy: -5, anchor: 'br' },
      { pt: [qs, pd], guide: true }, { pt: [qs, c], lab: 'Q_s', at: 'bl' }, { pt: [qd, c], lab: 'Q_d', at: 'br' }, { pt: [100, 20] },
      { text: [24, c + (40 - c) * 0.38], t: 'CS' }, { text: [24, c * 0.62], t: 'PS' },
      { text: [(qs + qd) / 2, c - 2.4], t: '\\text{shortage}' },
      { text: [112, 34], t: '\\text{DWL}', anchor: 'l' }, { arrow: [[111, 33], [qs + (100 - qs) / 3 + 0.5, (pd + 20 + c) / 3]] },
    ]);
  };
  const ceil18Fig = ceilFig(18, [90, 110]), ceil16Fig = ceilFig(16, [80, 100, 120]);
  const ceilNBFig = lec([100], [20, 25], [
    { seg: [[0, 25], [150, 25]], cls: 'curve c4 dash', lab: 'P_{\\max} = 25', at: 'end', dx: -2, dy: -5, anchor: 'br' },
    { pt: [100, 20], lab: 'P^* = 20', at: 'br', guide: 'x' },
    { text: [36, 21.5], t: '\\text{legal: below the cap}' },
  ]);

  // lesson 4: floors in the Lecture 17 market (sellers produce only what sells). f = 22: Qd 90, Qs 110, P_S(90) = 18; f = 24: Qd 80, Qs 120, P_S(80) = 16
  const floorFig = (f, xt) => {
    const qd = 200 - 5 * f, qs = 5 * f, ps = qd / 5;
    return lec(xt, [ps, f], [
      { poly: [[0, 40], [qd, f], [0, f]], cls: 'cs' },
      { poly: [[0, 0], [qd, ps], [qd, f], [0, f]], cls: 'gain' },
      { poly: [[qd, f], [100, 20], [qd, ps]], cls: 'loss' },
      { seg: [[0, f], [150, f]], cls: 'curve c4 dash', lab: `P_{\\min} = ${f}`, at: 'end', dx: -2, dy: 5, anchor: 'tr' },
      { pt: [qd, ps], guide: true }, { pt: [qd, f], lab: 'Q_d', at: 'tl' }, { pt: [qs, f], lab: 'Q_s', at: 'tl' }, { pt: [100, 20] },
      { text: [20, f + (40 - f) * 0.3], t: 'CS' }, { text: [26, f * 0.5], t: 'PS' },
      { text: [(qd + qs) / 2, f + 2.6], t: '\\text{excess supply}' },
      { text: [116, 36], t: '\\text{DWL}', anchor: 'l' }, { arrow: [[115, 35], [qd + (100 - qd) / 3 + 0.5, (f + 20 + ps) / 3]] },
    ]);
  };
  const floor22Fig = floorFig(22, [90, 110]), floor24Fig = floorFig(24, [80, 100, 120]);
  const floorNBFig = lec([100], [18, 20], [
    { seg: [[0, 18], [150, 18]], cls: 'curve c4 dash', lab: 'P_{\\min} = 18', at: 'end', dx: -2, dy: 5, anchor: 'tr' },
    { pt: [100, 20], lab: 'P^* = 20', at: 'tr', guide: 'x' },
    { text: [36, 22.5], t: '\\text{legal: above the floor}' },
  ]);

  // lesson 5: DS9 market Qd = 600 - 10P, Qs = 10P (P* 30, Q* 300); support at 45: Qd 150, Qs 450, government buys 300
  const ds9 = (xt, yt, items) => EC.graph({ w: 330, h: 270, x: [0, 620], y: [0, 64], xl: 'Q', yl: '\\$', xt, yt, items: [...items,
    { seg: [[0, 60], [600, 0]], lab: 'D', at: 'end', dx: 4, dy: -4, anchor: 'l' },
    { seg: [[0, 0], [620, 62]], lab: 'S', at: 'end', dx: -4, dy: -4, anchor: 'br' }] });
  const sup45Line = { seg: [[0, 45], [620, 45]], cls: 'curve c4 dash' };
  const supCSPSFig = ds9([150, 300, 450], [30, 45, 60], [
    { poly: [[0, 60], [150, 45], [0, 45]], cls: 'cs' },
    { poly: [[0, 0], [450, 45], [0, 45]], cls: 'gain' },
    sup45Line,
    { pt: [150, 45], lab: 'Q_d', at: 'tr' }, { pt: [450, 45], lab: 'Q_s', at: 'tl' }, { pt: [300, 30] },
    { text: [36, 49.5], t: 'CS' }, { text: [140, 31], t: 'PS' },
    { text: [300, 50], t: '\\text{gov buys } 300' },
  ]);
  const supGovFig = ds9([150, 300, 450], [30, 45], [
    { poly: [[150, 0], [450, 0], [450, 45], [150, 45]], cls: 'ex' },
    sup45Line, { pt: [150, 45] }, { pt: [450, 45] }, { pt: [300, 30] },
    { text: [300, 10], t: 'G = 45 \\times 300' },
  ]);
  const supLossFig = ds9([150, 300, 450], [30, 45], [
    { poly: [[150, 0], [150, 45], [300, 30], [450, 45], [450, 0]], cls: 'loss' },
    { seg: [[300, 0], [300, 30]], cls: 'curve dim dash' },
    sup45Line, { pt: [150, 45] }, { pt: [450, 45] }, { pt: [300, 30] },
    { text: [225, 20], t: '\\text{value lost}' }, { text: [225, 13], t: '5625' },
    { text: [375, 20], t: '\\text{extra cost}' }, { text: [375, 13], t: '5625' },
  ]);
  const floor45Fig = ds9([150, 300, 450], [15, 30, 45], [
    { poly: [[0, 60], [150, 45], [0, 45]], cls: 'cs' },
    { poly: [[0, 0], [150, 15], [150, 45], [0, 45]], cls: 'gain' },
    { poly: [[150, 45], [300, 30], [150, 15]], cls: 'loss' },
    sup45Line, { pt: [150, 45], lab: 'Q_d', at: 'tr' }, { pt: [450, 45], lab: 'Q_s', at: 'tl' }, { pt: [150, 15], guide: 'y' },
    { text: [36, 49.5], t: 'CS' }, { text: [60, 30], t: 'PS' }, { text: [195, 30], t: '\\text{DWL}' },
  ]);
  // the atlas: price support at 24 in the Lecture 17 market (Qd 80, Qs 120, government buys 40 for 960)
  const atlasSupFig = lec([80, 100, 120], [24], [
    { poly: [[0, 40], [80, 24], [0, 24]], cls: 'cs' },
    { poly: [[0, 0], [120, 24], [0, 24]], cls: 'gain' },
    { poly: [[80, 0], [120, 0], [120, 24], [80, 24]], cls: 'ex' },
    { seg: [[0, 24], [150, 24]], cls: 'curve c4 dash', lab: 'P_{\\min} = 24', at: 'end', dx: -2, dy: 5, anchor: 'tr' },
    { pt: [80, 24], lab: 'Q_d', at: 'tl' }, { pt: [120, 24], lab: 'Q_s', at: 'tl' },
    { text: [20, 28.5], t: 'CS' }, { text: [32, 14], t: 'PS' }, { text: [100, 6], t: 'G' },
  ]);


  // ------------------------------------------------------------------ generators: lesson 1 (every one asks for the plan first)
  gen('m3_po_tax', () => {
    // Qd = a - bP, Qs = dP - e. The tax is t = (b + d)s, so the buyer price rises by ds and the seller price falls by bs.
    for (;;) {
      const b = pick([1, 2, 3, 4, 5, 10]), d = pick([1, 2, 3, 4, 5, 10]), s = pick([0.5, 1, 2]);
      const t = (b + d) * s;
      if (t < 2 || t > 15) continue;
      const Ps = pick([10, 12, 15, 20, 24, 30, 40]), pmin = pick([0, 0, 2, 4, 5]);
      const Pc = Ps + d * s, Pp = Ps - b * s;
      if (Pp <= pmin + 1) continue;
      const e = d * pmin, Q0 = d * Ps - e, a = Q0 + b * Ps, Qt = d * Pp - e;
      const onBuyers = Math.random() < 0.5, who = onBuyers ? 'buyers' : 'sellers';
      return {
        title: 'A per-unit tax: the two prices',
        q: md`Demand is $${dTxt(a, b)}$ and supply is $${sTxt(d, e)}$. The government puts a tax of \$${F(t)} on every unit, collected from ${who}. Find the price before the tax, the price buyers pay, the price sellers keep, and the quantity traded.`,
        plan: [
          plan('Which two equations do you solve together?', `$P_c - P_p = ${F(t)}$ and $Q^d(P_c) = Q^s(P_p)$`, [
            ['$Q^d(P) = Q^s(P)$, then add the whole tax to that price', 'That assumes buyers carry all of the tax. Both prices move; how far each moves depends on the slopes.'],
            ['$Q^d(P_p) = Q^s(P_c)$', 'Swapped. Buyers react to the price **they pay**, $P_c$. Sellers react to the price **they keep**, $P_p$.'],
            [`$Q^d(P) = Q^s(P) - ${F(t)}$`, 'That takes the tax off a **quantity**. The tax is dollars per unit: it moves prices, not units.'],
          ], `Write $P_c = P_p + ${F(t)}$, put it into demand, set demand equal to supply, solve for $P_p$.`),
          plan(`The tax is collected from ${who}. Does that change the answer?`, 'No: the same $P_c$, $P_p$ and $Q$ either way', [
            ['Yes: whoever sends the tax to the government bears all of it', 'Legal liability does not decide the burden. The wedge is the same; the slopes decide how it splits.'],
            [`Yes: the quantity falls more when ${who} pay`, 'Both versions solve the same two equations, so they give the same quantity.'],
            ['Yes: $P_c$ and $P_p$ trade places', 'Buyers always pay the higher price $P_c$; sellers always keep the lower price $P_p$.'],
          ], `Shifting supply up by $t$ or demand down by $t$ lands on the same crossing.`),
        ],
        parts: [N('P^*\\text{ (no tax)}', Ps), N('P_c', Pc), N('P_p', Pp), N('Q', Qt)],
        hints: [`No tax: $${F(a)} - ${cv(b)} = ${cv(d)}${mi(e)}$.`, `With the tax: $${F(a)} - ${b === 1 ? '' : F(b)}(P_p + ${F(t)}) = ${cv(d, 'P_p')}${mi(e)}$.`],
        sol: md`
          **Move 0: the no-tax market** (the benchmark).
          $$${F(a)} - ${cv(b)} = ${cv(d)}${mi(e)} \;\Rightarrow\; ${F(a + e)} = ${F(b + d)}P \;\Rightarrow\; P^* = ${F(Ps)}, \quad Q^* = ${F(Q0)}$$

          **Move 1: the wedge.** $P_c = P_p + ${F(t)}$. It does not matter that the tax is collected from ${who}.

          **Move 2: substitute into demand and set it equal to supply.**
          $$${F(a)} - ${b === 1 ? '' : F(b)}(P_p + ${F(t)}) = ${cv(d, 'P_p')}${mi(e)}$$
          Expand the left side:
          $$${F(a)} - ${cv(b, 'P_p')} - ${F(b * t)} = ${cv(d, 'P_p')}${mi(e)}$$
          Collect the $P_p$ terms on the right and the numbers on the left:
          $$${F(a)} - ${F(b * t)}${e ? ` + ${F(e)}` : ''} = ${F(b + d)}P_p \;\Rightarrow\; P_p = \frac{${F(a - b * t + e)}}{${F(b + d)}} = ${F(Pp)}$$

          **Move 3: the buyer price.** $P_c = ${F(Pp)} + ${F(t)} = ${F(Pc)}$.

          **Move 4: the quantity, from both curves.** Supply at $P_p$: $${cv(d, `(${F(Pp)})`)}${mi(e)} = ${F(Qt)}$. Demand at $P_c$: $${F(a)} - ${cv(b, `(${F(Pc)})`)} = ${F(Qt)}$. ✓

          **Does this make sense?** $P_c = ${F(Pc)} > P^* = ${F(Ps)} > P_p = ${F(Pp)}$: buyers pay more and sellers keep less. The two moves, $${F(Pc - Ps)}$ and $${F(Ps - Pp)}$, add up to the tax, $${F(t)}$. The quantity fell from ${F(Q0)} to ${F(Qt)}.
        `,
      };
    }
  });

  gen('m3_po_gap', () => {
    // inverse demand P = al - be Q, inverse supply P = ga + de Q; after-tax quantity Qt chosen first
    for (;;) {
      const be = pick([0.5, 1, 2, 3]), de = pick([0.5, 1, 2]), Qt = pick([10, 12, 16, 20, 24, 30, 40]);
      const t = pick([2, 3, 4, 5, 6, 8, 10]), ga = pick([0, 2, 4, 5, 10]);
      const dQ = t / (be + de);
      if (!Number.isInteger(2 * dQ)) continue;
      const Pp = ga + de * Qt, Pc = Pp + t, al = Pc + be * Qt, Q0 = Qt + dQ, P0 = ga + de * Q0;
      const supE = ga ? `${F(ga)} + ${cv(de, 'Q')}` : cv(de, 'Q');
      const dem = `P = ${F(al)} - ${cv(be, 'Q')}`, sup = `P = ${supE}`;
      return {
        title: 'Inverse curves: find where the gap equals the tax',
        q: md`Inverse demand is $${dem}$ and inverse supply is $${sup}$. A per-unit tax of \$${t} is imposed. Find the no-tax quantity, the quantity with the tax, and the two prices $P_c$ and $P_p$.`,
        plan: plan('The curves are written as $P = \\ldots$. What is the fastest way to the after-tax quantity?', 'Find the $Q$ where the demand price minus the supply price equals $t$', [
          ['Set the curves equal, then subtract $t$ from that $Q$', 'The tax is dollars per unit, not units. Taking it off a quantity mixes units.'],
          ['Add the two curves and set the sum equal to $t$', 'The tax is the **gap** between what buyers pay and what sellers keep: a difference, not a sum.'],
          ['Subtract $t$ from both curves, then set them equal', 'Moving both curves by the same amount leaves the gap where it was, so you get the no-tax answer back.'],
        ], `$(${F(al)} - ${cv(be, 'Q')}) - (${supE}) = ${t}$. Solve for $Q$; then $P_c$ from demand and $P_p$ from supply.`),
        parts: [N('Q^*\\text{ (no tax)}', Q0), N('Q\\text{ with the tax}', Qt), N('P_c', Pc), N('P_p', Pp)],
        hints: [`No tax: the gap is zero, $${F(al)} - ${cv(be, 'Q')} = ${supE}$.`, `With the tax: $${F(al - ga)} - ${cv(be + de, 'Q')} = ${t}$.`],
        sol: md`
          **Move 0: no tax, the gap is zero.**
          $$${F(al)} - ${cv(be, 'Q')} = ${supE} \;\Rightarrow\; ${F(al - ga)} = ${cv(be + de, 'Q')} \;\Rightarrow\; Q^* = ${F(Q0)}$$
          (The price there is $${F(P0)}$.)

          **Move 1: with the tax, the gap is $t$.** At the traded quantity buyers pay the demand height and sellers keep the supply height, and the difference goes to the government:
          $$(${F(al)} - ${cv(be, 'Q')}) - (${supE}) = ${t}$$
          $$${F(al - ga)} - ${cv(be + de, 'Q')} = ${t} \;\Rightarrow\; ${cv(be + de, 'Q')} = ${F(al - ga - t)} \;\Rightarrow\; Q = ${F(Qt)}$$

          **Move 2: read the two prices off the two curves.** $P_c = ${F(al)} - ${F(be)}(${F(Qt)}) = ${F(Pc)}$ and $P_p = ${ga ? `${F(ga)} + ` : ''}${F(de)}(${F(Qt)}) = ${F(Pp)}$.

          **Check:** $P_c - P_p = ${F(Pc)} - ${F(Pp)} = ${t}$ ✓, and the quantity fell by $${F(dQ)}$.
        `,
      };
    }
  });

  // ------------------------------------------------------------------ generators: lesson 2
  // a taxed market with clean numbers: Qd = a - bP, Qs = dP - e, t = (b + d)s, buyer price up ds, seller price down bs
  const taxDraw = (ss, bs = [1, 2, 3, 4, 5, 10], ds = [1, 2, 3, 4, 5, 10]) => {
    for (;;) {
      const b = pick(bs), d = pick(ds), s = pick(ss), t = (b + d) * s;
      if (t < 2 || t > 15) continue;
      const Ps = pick([10, 12, 15, 20, 24, 30, 40]), pmin = pick([0, 0, 2, 4, 5]);
      const Pc = Ps + d * s, Pp = Ps - b * s;
      if (Pp <= pmin + 1) continue;
      const e = d * pmin, Q0 = d * Ps - e, a = Q0 + b * Ps, Qt = d * Pp - e;
      return { b, d, s, t, Ps, pmin, Pc, Pp, e, Q0, a, Qt, choke: a / b };
    }
  };
  // two solution paragraphs; joined with the 8-space indent the generator sol bodies use, so the md dedent stays intact
  const TAX_SOLVE = (m) => [
    md`**Move 0: no tax.** $${F(m.a)} - ${cv(m.b)} = ${cv(m.d)}${mi(m.e)} \Rightarrow ${F(m.a + m.e)} = ${F(m.b + m.d)}P \Rightarrow P^* = ${F(m.Ps)}$, $Q^* = ${F(m.Q0)}$.`,
    md`**Move 1: the wedge.** $${F(m.a)} - ${m.b === 1 ? '' : F(m.b)}(P_p + ${F(m.t)}) = ${cv(m.d, 'P_p')}${mi(m.e)} \Rightarrow ${F(m.a - m.b * m.t + m.e)} = ${F(m.b + m.d)}P_p \Rightarrow P_p = ${F(m.Pp)}$, so $P_c = ${F(m.Pc)}$ and $Q = ${F(m.Qt)}$.`,
  ].join('\n\n        ');

  gen('m3_po_incid', () => {
    const m = taxDraw([0.5, 1, 2]);
    const { b, d, t, Ps, Pc, Pp, Q0, Qt } = m;
    const cs = (Pc - Ps) / t, R = t * Qt, DWL = 0.5 * t * (Q0 - Qt);
    const side = b < d ? 0 : b > d ? 1 : 2;
    const opts = ['Buyers bear more', 'Sellers bear more', 'They split it evenly'];
    const whys = [
      `Demand drops ${F(b)} units per \\$1 and supply drops ${F(d)}: buyers are ${b > d ? 'more' : 'just as'} responsive, so they do not carry the larger part.`,
      `Supply drops ${F(d)} units per \\$1 and demand drops ${F(b)}: sellers are ${d > b ? 'more' : 'just as'} responsive, so they do not carry the larger part.`,
      `An even split needs equal responses. Here demand drops ${F(b)} units per \\$1 and supply ${F(d)}.`,
    ];
    const wr = [0, 1, 2].filter((k) => k !== side).map((k) => [opts[k], whys[k]]);
    wr.push(['Whoever the tax is collected from', 'Legal liability does not decide the burden; the responsiveness of the two sides does.']);
    return {
      title: 'Who bears the tax, and what does it cost?',
      q: md`Demand is $${dTxt(m.a, b)}$ and supply is $${sTxt(d, m.e)}$. A \$${F(t)} per-unit tax is imposed. Find $P_c$, $P_p$, the share of the tax borne by consumers (in percent), tax revenue, and the deadweight loss.`,
      plan: [
        plan(`Demand drops ${F(b)} units for each \\$1 rise in price; supply drops ${F(d)} units for each \\$1 fall. Before computing: who bears more of the tax?`, opts[side], wr,
          'The less responsive side cannot dodge the tax by changing its quantity much, so its price moves more.'),
        plan('How do you get the consumer share?', 'Compare $P_c$ with the **no-tax** price: $(P_c - P^*)/t$', [
          ['$P_c / t$', 'That compares the whole price with the tax. The burden is only the **rise** in price.'],
          ['$(P_c - P_p)/t$', 'That is always $t/t = 1$: it is the whole wedge, not the consumers\' part.'],
          ['$(P^* - P_p)/t$', 'That is the **producer** share: how far the sellers\' price fell.'],
        ], 'Solve for $P^*$ and $P_c$ first; revenue is $tQ$ at the after-tax $Q$; DWL is $\\tfrac12 t(Q^* - Q)$.'),
      ],
      parts: [N('P_c', Pc), N('P_p', Pp), N('\\text{consumer share }(\\%)', 100 * cs), N('\\text{tax revenue}', R), N('\\text{DWL}', DWL)],
      hints: [`Find $P^*$ from $Q^d = Q^s$ first.`, `Consumer share $= (P_c - P^*)/t$. Shortcut: supply's response over the sum, $${F(d)}/(${F(b)} + ${F(d)})$.`],
      sol: md`
        ${TAX_SOLVE(m)}

        **Move 2: incidence.** Consumers: $P_c - P^* = ${F(Pc)} - ${F(Ps)} = ${F(Pc - Ps)}$ per unit, a share of $${F(Pc - Ps)}/${F(t)} = ${F(100 * cs, 2)}\%$. Producers: $P^* - P_p = ${F(Ps - Pp)}$, a share of $${F(100 - 100 * cs, 2)}\%$. Shortcut check: $\dfrac{${F(d)}}{${F(b)} + ${F(d)}} = ${F(100 * cs, 2)}\%$ ✓.

        **Move 3: revenue** $= t \times Q = ${F(t)} \times ${F(Qt)} = ${F(R)}$ (the after-tax quantity).

        **Move 4: DWL** $= \tfrac12 \times t \times (Q^* - Q) = \tfrac12 \times ${F(t)} \times (${F(Q0)} - ${F(Qt)}) = ${F(DWL)}$.
      `,
    };
  });

  gen('m3_po_twel', () => {
    const m = taxDraw([1, 2], [1, 2, 5, 10], [1, 2, 5, 10]);
    const { b, d, t, Ps, Pc, Pp, Q0, Qt, choke, pmin } = m;
    const CS0 = 0.5 * Q0 * (choke - Ps), CS1 = 0.5 * Qt * (choke - Pc), PS0 = 0.5 * Q0 * (Ps - pmin), PS1 = 0.5 * Qt * (Pp - pmin);
    const R = t * Qt, W0 = CS0 + PS0, W1 = CS1 + PS1 + R;
    return {
      title: 'The welfare table for a tax',
      q: md`Demand is $${dTxt(m.a, b)}$ and supply is $${sTxt(d, m.e)}$. A \$${F(t)} per-unit tax is imposed. Fill in the welfare table: CS, PS and tax revenue before and after, and the change in total welfare.`,
      plan: [
        plan('After the tax, consumer surplus is the triangle under demand and above…', '$P_c$, over the $Q$ units still bought', [
          ['$P_p$', 'Buyers pay $P_c$, not $P_p$. The strip between them is tax revenue, not buyers\' surplus.'],
          ['$P^*$, over the $Q^*$ units', 'That is CS **before** the tax.'],
          ['$P_c$, over the $Q^*$ units', 'Only $Q$ units are bought now; the lost units give no surplus to anyone.'],
        ], `Choke price $${F(choke)}$ (where demand hits zero). CS $= \\tfrac12 \\times Q \\times (${F(choke)} - P_c)$.`),
        plan('What goes into total welfare after the tax?', 'CS + PS + tax revenue', [
          ['CS + PS only', 'The tax revenue is not lost: the government spends it on something people value. Leaving it out overstates the loss.'],
          ['CS + PS − tax revenue', 'Revenue is a gain to the government, so it is added, not subtracted.'],
          ['Tax revenue − DWL', 'Total welfare counts everyone: buyers, sellers and the government.'],
        ], 'Then the change in welfare is $-$DWL: everything else is a transfer.'),
      ],
      parts: [N('CS\\text{ before}', CS0), N('CS\\text{ after}', CS1), N('PS\\text{ before}', PS0), N('PS\\text{ after}', PS1), N('\\text{tax revenue}', R), N('\\Delta W', W1 - W0)],
      hints: [`Demand hits zero at $P = ${F(choke)}$; supply starts at $P = ${F(pmin)}$.`, `After: $P_c = ${F(Pc)}$, $P_p = ${F(Pp)}$, $Q = ${F(Qt)}$.`],
      sol: md`
        ${TAX_SOLVE(m)}

        **Move 2: the corners of the triangles.** Demand reaches zero at the choke price $${F(m.a)}/${F(b)} = ${F(choke)}$. Supply starts at $P = ${F(pmin)}$.

        **Move 3: before.** $CS = \tfrac12(${F(Q0)})(${F(choke)} - ${F(Ps)}) = ${F(CS0)}$, $PS = \tfrac12(${F(Q0)})(${F(Ps)} - ${F(pmin)}) = ${F(PS0)}$, $W = ${F(W0)}$.

        **Move 4: after.** $CS = \tfrac12(${F(Qt)})(${F(choke)} - ${F(Pc)}) = ${F(CS1)}$, $PS = \tfrac12(${F(Qt)})(${F(Pp)} - ${F(pmin)}) = ${F(PS1)}$, revenue $= ${F(t)} \times ${F(Qt)} = ${F(R)}$.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | ${F(CS0)} | ${F(CS1)} | ${F(CS1 - CS0)} |
        | PS | ${F(PS0)} | ${F(PS1)} | ${F(PS1 - PS0)} |
        | Tax revenue | 0 | ${F(R)} | +${F(R)} |
        | Total welfare | ${F(W0)} | ${F(W1)} | ${F(W1 - W0)} |

        **Check:** DWL $= \tfrac12 \times ${F(t)} \times (${F(Q0)} - ${F(Qt)}) = ${F(0.5 * t * (Q0 - Qt))}$, the size of the welfare drop ✓.
      `,
    };
  });

  // ------------------------------------------------------------------ generators: lessons 3 and 4 (ceilings and floors)
  // Qd = a - bP, Qs = dP - e with a whole-number equilibrium; the policy price is P* -/+ k
  const pfDraw = () => {
    for (;;) {
      const b = pick([1, 2, 4, 5, 10]), d = pick([1, 2, 4, 5, 10]), Ps = pick([10, 12, 15, 20, 24, 30]), pmin = pick([0, 0, 2, 4]);
      const e = d * pmin, Q0 = d * (Ps - pmin), a = Q0 + b * Ps;
      if (Q0 < 10) continue;
      return { b, d, Ps, pmin, e, Q0, a, choke: a / b };
    }
  };
  const PF_STEP1 = (kind) => plan(`What do you check before anything else?`, `Compare the ${kind} with the no-policy price $P^*$`, [
    [`Nothing: a ${kind} always changes the market`, kind === 'ceiling' ? 'A ceiling above $P^*$ is not binding: the market price is already legal.' : 'A floor below $P^*$ is not binding: the market price is already legal.'],
    [`Compare the ${kind} with where supply starts`, 'That tells you whether sellers sell at all, not whether the policy bites.'],
    ['Compare $Q^d$ and $Q^s$ at the policy price, and trade the larger one', 'Nobody can be forced to buy or sell: the **smaller** one trades. And first you need to know whether the policy binds.'],
  ], kind === 'ceiling' ? 'A ceiling binds only if it is **below** $P^*$; a floor binds only if it is **above** $P^*$.' : 'A floor binds only if it is **above** $P^*$; a ceiling binds only if it is **below** $P^*$.');

  gen('m3_po_ceil', () => {
    const m = pfDraw(), { a, b, d, e, Ps, pmin, Q0 } = m;
    let k, c, binds;
    for (;;) {
      k = pick([1, 2, 3, 4, 5, 6]); binds = Math.random() < 0.75; c = binds ? Ps - k : Ps + k;
      if (!binds || c - pmin >= 1) break;
    }
    const qs = d * c - e, qd = a - b * c, pd = (a - qs) / b, DWL = 0.5 * (Q0 - qs) * (pd - c);
    const q = md`Demand is $${dTxt(a, b)}$ and supply is $${sTxt(d, e)}$. The government sets a price ceiling of \$${F(c)}. Decide whether it binds; then find the shortage, the quantity traded and the deadweight loss (assume efficient rationing).`;
    const stepTr = plan('If the ceiling binds, how many units change hands?', '$Q^s$ at the ceiling: sellers are the short side', [
      ['$Q^d$ at the ceiling', 'Buyers want that many, but sellers offer fewer at the capped price, and nobody can be forced to sell.'],
      ['$Q^*$, the no-policy quantity', 'Sellers will not supply $Q^*$ at a price below $P^*$.'],
      ['$Q^d - Q^s$', 'That is the shortage, the units people want and cannot get.'],
    ], 'Traded $= Q^s(P_{\\max})$. The DWL height is the demand price at that quantity minus the ceiling.');
    const why = binds ? [null, `$${F(c)} < P^* = ${F(Ps)}$: the cap is below the market price, so it bites.`] : [`$${F(c)} > P^* = ${F(Ps)}$: the market price is already below the cap.`, null];
    const parts = binds
      ? [FIX('Does the ceiling bind?', ['yes', 'no'], 0, why), N('Q^d\\text{ at the ceiling}', qd), N('Q^s\\text{ at the ceiling}', qs), N('\\text{shortage}', qd - qs), N('Q\\text{ traded}', qs), N('\\text{DWL}', DWL)]
      : [FIX('Does the ceiling bind?', ['yes', 'no'], 1, why), N('Q\\text{ traded}', Q0), N('\\text{shortage}', 0), N('\\text{DWL}', 0)];
    const s0 = md`**Move 1: no-policy equilibrium.** $${F(a)} - ${cv(b)} = ${cv(d)}${mi(e)} \Rightarrow ${F(a + e)} = ${F(b + d)}P \Rightarrow P^* = ${F(Ps)}$, $Q^* = ${F(Q0)}$.`;
    const sol = binds ? md`
        ${s0}

        **Move 2: does it bind?** $${F(c)} < ${F(Ps)}$: yes.

        **Move 3: both sides at the ceiling.** $Q^d = ${F(a)} - ${F(b)}(${F(c)}) = ${F(qd)}$, $Q^s = ${F(d)}(${F(c)})${mi(e)} = ${F(qs)}$. Shortage $= ${F(qd)} - ${F(qs)} = ${F(qd - qs)}$.

        **Move 4: traded quantity** = the short side = $Q^s = ${F(qs)}$.

        **Move 5: DWL.** The buyer of the last unit traded (unit ${F(qs)}) would pay $P_D(${F(qs)}) = (${F(a)} - ${F(qs)})/${F(b)} = ${F(pd)}$. The triangle runs from $Q = ${F(qs)}$ to $Q^* = ${F(Q0)}$, and its height at $Q = ${F(qs)}$ is $${F(pd)} - ${F(c)}$:
        $$\text{DWL} = \tfrac12 \times (${F(Q0)} - ${F(qs)}) \times (${F(pd)} - ${F(c)}) = ${F(DWL)}$$
      ` : md`
        ${s0}

        **Move 2: does it bind?** $${F(c)} > ${F(Ps)}$: no. The market price $${F(Ps)}$ is already legal, so nothing changes: $${F(Q0)}$ units trade, no shortage, no DWL.
      `;
    return {
      title: 'A price ceiling: binding or not?', q, plan: [PF_STEP1('ceiling'), stepTr], parts,
      hints: ['Find $P^*$ first, then compare it with the ceiling.', 'If it binds, plug the ceiling into both curves; the smaller quantity trades.'],
      sol,
    };
  });

  gen('m3_po_floor', () => {
    const m = pfDraw(), { a, b, d, e, Ps, Q0 } = m;
    let k, f, binds;
    for (;;) {
      k = pick([1, 2, 3, 4, 5, 6]); binds = Math.random() < 0.75; f = binds ? Ps + k : Ps - k;
      if (binds ? Q0 - b * k >= 1 : f > 0) break;
    }
    const qd = a - b * f, qs = d * f - e, ps = (qd + e) / d, DWL = 0.5 * (Q0 - qd) * (f - ps);
    const q = md`Demand is $${dTxt(a, b)}$ and supply is $${sTxt(d, e)}$. The government sets a price floor of \$${F(f)}. Decide whether it binds; then find the excess supply, the quantity sold and the deadweight loss (sellers produce only what they can sell).`;
    const stepTr = plan('If the floor binds, how many units are sold?', '$Q^d$ at the floor: buyers are the short side', [
      ['$Q^s$ at the floor', 'Sellers would like to sell that many, but buyers will not buy them at the high price.'],
      ['$Q^*$, the no-policy quantity', 'Buyers will not take $Q^*$ at a price above $P^*$.'],
      ['$Q^s - Q^d$', 'That is the excess supply, the units nobody buys.'],
    ], 'Sold $= Q^d(P_{\\min})$. The DWL height is the floor minus the supply price at that quantity.');
    const why = binds ? [null, `$${F(f)} > P^* = ${F(Ps)}$: the floor is above the market price, so it bites.`] : [`$${F(f)} < P^* = ${F(Ps)}$: the market price is already above the floor.`, null];
    const parts = binds
      ? [FIX('Does the floor bind?', ['yes', 'no'], 0, why), N('Q^d\\text{ at the floor}', qd), N('Q^s\\text{ at the floor}', qs), N('\\text{excess supply}', qs - qd), N('Q\\text{ sold}', qd), N('\\text{DWL}', DWL)]
      : [FIX('Does the floor bind?', ['yes', 'no'], 1, why), N('Q\\text{ sold}', Q0), N('\\text{excess supply}', 0), N('\\text{DWL}', 0)];
    const s0 = md`**Move 1: no-policy equilibrium.** $${F(a)} - ${cv(b)} = ${cv(d)}${mi(e)} \Rightarrow ${F(a + e)} = ${F(b + d)}P \Rightarrow P^* = ${F(Ps)}$, $Q^* = ${F(Q0)}$.`;
    const sol = binds ? md`
        ${s0}

        **Move 2: does it bind?** $${F(f)} > ${F(Ps)}$: yes.

        **Move 3: both sides at the floor.** $Q^d = ${F(a)} - ${F(b)}(${F(f)}) = ${F(qd)}$, $Q^s = ${F(d)}(${F(f)})${mi(e)} = ${F(qs)}$. Excess supply $= ${F(qs)} - ${F(qd)} = ${F(qs - qd)}$.

        **Move 4: quantity sold** = the short side = $Q^d = ${F(qd)}$.

        **Move 5: DWL.** The seller of the last unit sold (unit ${F(qd)}) needs only $P_S(${F(qd)}) = (${F(qd)}${e ? ` + ${F(e)}` : ''})/${F(d)} = ${F(ps)}$. The triangle runs from $Q = ${F(qd)}$ to $Q^* = ${F(Q0)}$, with height $${F(f)} - ${F(ps)}$ at $Q = ${F(qd)}$:
        $$\text{DWL} = \tfrac12 \times (${F(Q0)} - ${F(qd)}) \times (${F(f)} - ${F(ps)}) = ${F(DWL)}$$
      ` : md`
        ${s0}

        **Move 2: does it bind?** $${F(f)} < ${F(Ps)}$: no. The market price $${F(Ps)}$ is already legal, so nothing changes: $${F(Q0)}$ units trade, no excess supply, no DWL.
      `;
    return {
      title: 'A price floor: binding or not?', q, plan: [PF_STEP1('floor'), stepTr], parts,
      hints: ['Find $P^*$ first, then compare it with the floor.', 'If it binds, plug the floor into both curves; the smaller quantity is what sells.'],
      sol,
    };
  });

  // ------------------------------------------------------------------ generators: lesson 5 (price supports, and the mixed "which quantity" drill)
  gen('m3_po_support', () => {
    let m, k;
    do { m = pfDraw(); k = pick([2, 3, 4, 5, 6, 8, 10]); } while (m.Q0 - m.b * k < 5);
    const { a, b, d, e, Ps, pmin, Q0, choke } = m, f = Ps + k;
    const qd = a - b * f, qs = d * f - e, g = qs - qd, Gx = f * g;
    const CS0 = 0.5 * Q0 * (choke - Ps), PS0 = 0.5 * Q0 * (Ps - pmin), CS1 = 0.5 * qd * (choke - f), PS1 = 0.5 * qs * (f - pmin);
    const SS0 = CS0 + PS0, SS1 = CS1 + PS1 - Gx;
    return {
      title: 'A price support with government purchases',
      q: md`Demand is $${dTxt(a, b)}$ and supply is $${sTxt(d, e)}$. The government sets a support price of \$${F(f)} and promises to buy any output consumers do not buy. Find what producers sell, what consumers buy, what the government buys and spends, CS and PS after the policy, and the change in social surplus.`,
      plan: [
        plan('How many units do producers sell?', `$Q^s(${F(f)})$: every unit sells at the support price, to consumers or to the government`, [
          [`$Q^d(${F(f)})$`, 'That is an ordinary floor. Here the government buys whatever consumers leave, so producers sell all they want.'],
          ['$Q^*$', 'At a price above $P^*$ producers want to sell more than $Q^*$, and now they can.'],
          ['$Q^s - Q^d$', 'That is the government\'s share, not everything producers sell.'],
        ], `Producers: $Q^s$. Consumers: $Q^d$. Government: the gap, at a cost of $${F(f)}$ per unit.`),
        plan('How does the government purchase enter social surplus?', 'Subtract the whole expenditure: $SS = CS + PS - G$', [
          ['Ignore it: it is a transfer to farmers', 'It is paid by taxpayers, who are part of society, and the output it buys is counted as worth nothing.'],
          ['Add it, like tax revenue', 'Tax revenue is money **coming in** to the government; this is money **going out**.'],
          ['Subtract only the part that becomes PS', 'The whole amount leaves taxpayers\' pockets.'],
        ], 'DS9 convention: $G$ goes in the table as $-G$.'),
      ],
      parts: [N('\\text{producers sell}', qs), N('\\text{consumers buy}', qd), N('\\text{government buys}', g), N('G\\text{ (spending)}', Gx), N('CS\\text{ after}', CS1), N('PS\\text{ after}', PS1), N('\\Delta SS', SS1 - SS0)],
      hints: [`$P^* = ${F(Ps)}$ (no policy). Demand hits zero at $${F(choke)}$; supply starts at $${F(pmin)}$.`, `CS is a triangle over $Q^d$ units, PS a triangle over $Q^s$ units, both cut at $${F(f)}$.`],
      sol: md`
        **Move 0: no policy.** $${F(a)} - ${cv(b)} = ${cv(d)}${mi(e)} \Rightarrow P^* = ${F(Ps)}$, $Q^* = ${F(Q0)}$. $CS = \tfrac12(${F(Q0)})(${F(choke)} - ${F(Ps)}) = ${F(CS0)}$, $PS = \tfrac12(${F(Q0)})(${F(Ps)} - ${F(pmin)}) = ${F(PS0)}$, $SS = ${F(SS0)}$.

        **Move 1: binding?** $${F(f)} > ${F(Ps)}$: yes.

        **Move 2: producers** sell $Q^s = ${F(d)}(${F(f)})${mi(e)} = ${F(qs)}$. **Move 3: consumers** buy $Q^d = ${F(a)} - ${F(b)}(${F(f)}) = ${F(qd)}$.

        **Move 4: government** buys $${F(qs)} - ${F(qd)} = ${F(g)}$ units and spends $G = ${F(f)} \times ${F(g)} = ${F(Gx)}$.

        **Move 5: surpluses.** $CS = \tfrac12(${F(qd)})(${F(choke)} - ${F(f)}) = ${F(CS1)}$. $PS = \tfrac12(${F(qs)})(${F(f)} - ${F(pmin)}) = ${F(PS1)}$.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | ${F(CS0)} | ${F(CS1)} | ${F(CS1 - CS0)} |
        | PS | ${F(PS0)} | ${F(PS1)} | ${F(PS1 - PS0)} |
        | G | 0 | ${F(-Gx)} | ${F(-Gx)} |
        | SS | ${F(SS0)} | ${F(SS1)} | ${F(SS1 - SS0)} |
      `,
    };
  });

  gen('m3_po_which', () => {
    const type = pick(['tax', 'ceiling', 'floor', 'support']);
    const OPTS = ['The $Q$ where the demand price minus the supply price equals $t$', '$Q^s$ at the policy price', '$Q^d$ at the policy price',
      'Producers sell $Q^s$, consumers buy $Q^d$, the government buys the difference'];
    const WHY = {
      tax: [null, 'There is no legal price here; buyers and sellers face two different prices.', 'One curve at one price cannot give the answer: the quantity comes from the wedge.', 'Nobody buys up a surplus under a tax.'],
      ceiling: ['There is no tax wedge; the price is capped by law.', null, 'Buyers want $Q^d$, but sellers offer less at the cap and cannot be forced.', 'That is a price support: a floor plus government purchases.'],
      floor: ['There is no tax here; the price is held up by law.', 'Sellers would like to sell $Q^s$, but buyers take only $Q^d$.', null, 'Only with a promise to buy the leftovers; an ordinary floor has no buyer for them.'],
      support: ['There is no tax here.', 'Producers do sell $Q^s$, but consumers take only $Q^d$; who buys the rest?', 'Consumers buy $Q^d$, but producers sell more, to the government.', null],
    }[type];
    const ai = { tax: 0, ceiling: 1, floor: 2, support: 3 }[type];
    const step = { q: 'Which quantity does this policy put on the market?', opts: OPTS, a: ai, why: WHY,
      move: { tax: 'Solve $P_c = P_p + t$ with $Q^d(P_c) = Q^s(P_p)$.', ceiling: 'Plug the ceiling into supply.', floor: 'Plug the floor into demand.', support: 'Plug the support price into both curves; the government buys the gap.' }[type] };
    if (type === 'tax') {
      const m = taxDraw([1, 2]);
      const DWL = 0.5 * m.t * (m.Q0 - m.Qt);
      return {
        title: 'Which policy, which quantity: a tax',
        q: md`Demand is $${dTxt(m.a, m.b)}$, supply is $${sTxt(m.d, m.e)}$. The government levies \$${F(m.t)} on every unit sold. How many units are traded, and what is the deadweight loss?`,
        plan: step, parts: [N('Q\\text{ traded}', m.Qt), N('\\text{DWL}', DWL)],
        sol: md`
        ${TAX_SOLVE(m)}

        **Move 2.** DWL $= \tfrac12 \times ${F(m.t)} \times (${F(m.Q0)} - ${F(m.Qt)}) = ${F(DWL)}$.
        `,
      };
    }
    let m, k;
    do { m = pfDraw(); k = pick([1, 2, 3, 4, 5]); } while (m.Q0 - m.b * k < 5 || m.Ps - k - m.pmin < 1);
    const { a, b, d, e, Ps, Q0 } = m;
    const p = type === 'ceiling' ? Ps - k : Ps + k, qd = a - b * p, qs = d * p - e;
    const head = md`Demand is $${dTxt(a, b)}$, supply is $${sTxt(d, e)}$ ($P^* = ${F(Ps)}$).`;
    const s0 = md`**Move 1.** At \$${F(p)}: $Q^d = ${F(a)} - ${F(b)}(${F(p)}) = ${F(qd)}$ and $Q^s = ${F(d)}(${F(p)})${mi(e)} = ${F(qs)}$.`;
    if (type === 'support') {
      return {
        title: 'Which policy, which quantity: a support',
        q: md`${head} The government guarantees farmers \$${F(p)} and buys whatever consumers do not. How many units do producers sell, and how much does the government spend?`,
        plan: step, parts: [N('\\text{producers sell}', qs), N('G', p * (qs - qd))],
        sol: md`
          ${s0}

          **Move 2.** Producers sell all ${F(qs)}; consumers buy ${F(qd)}; the government buys $${F(qs - qd)}$ and spends $${F(p)} \times ${F(qs - qd)} = ${F(p * (qs - qd))}$.
        `,
      };
    }
    const Qt = type === 'ceiling' ? qs : qd;
    const other = type === 'ceiling' ? (a - Qt) / b : (Qt + e) / d;     // demand price at Qs (ceiling) or supply price at Qd (floor)
    const DWL = 0.5 * (Q0 - Qt) * Math.abs(other - p);
    return {
      title: `Which policy, which quantity: a ${type}`,
      q: md`${head} The government sets a price ${type} of \$${F(p)}. How many units are traded, and what is the deadweight loss?`,
      plan: step, parts: [N('Q\\text{ traded}', Qt), N('\\text{DWL}', DWL)],
      sol: md`
        ${s0}

        **Move 2.** ${type === 'ceiling' ? `The ceiling is below $P^*$, so sellers are short: $${F(Qt)}$ trade. The demand price there is $(${F(a)} - ${F(Qt)})/${F(b)} = ${F(other)}$.` : `The floor is above $P^*$, so buyers are short: $${F(Qt)}$ trade. The supply price there is $(${F(Qt)}${e ? ` + ${F(e)}` : ''})/${F(d)} = ${F(other)}$.`}

        **Move 3.** DWL $= \tfrac12 \times (${F(Q0)} - ${F(Qt)}) \times ${F(Math.abs(other - p))} = ${F(DWL)}$.
      `,
    };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3u4', exam: 'm3', num: 'Part 10', title: 'Taxes, ceilings, floors, and price supports',
    blurb: 'the tax wedge, who really pays, ceilings and floors (which quantity trades), price supports and government purchases, every welfare area',
    lessons: [
      // ================================================================ lesson 1
      {
        id: 'm3-po1', title: 'A per-unit tax: the wedge and the new equilibrium', ref: 'Lecture 17',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "a \$2 per-unit (specific) tax is imposed; find the price buyers pay and the price sellers receive" | the two prices on either side of the tax | $P_c = P_p + t$, then $Q^d(P_c) = Q^s(P_p)$ |
            | "how many units are traded after the tax?" | the new quantity | plug $P_c$ into demand or $P_p$ into supply; both give the same $Q$ |
            | "the tax is collected from sellers" or "from buyers" | a distraction: legal liability | the same two equations, the same answer |
            | "show the tax on a graph" | which curve moves, and by how much | supply up by $t$ (or demand down by $t$); read the new crossing |
            | curves given as $P = \ldots$ (inverse form) | where is the vertical gap between D and S equal to $t$? | $P_D(Q) - P_S(Q) = t$ |

            By the end of this page you should see a tax problem and write the two equations without thinking.
          `),
          R(md`
            ### Four policies that drive a wedge into a market

            Lecture 17 is about what happens when the government steps into a competitive market. Each policy drives a **wedge** between the two sides of the market.

            | Policy | What the government does | The wedge |
            |---|---|---|
            | per-unit tax | takes $t$ dollars on every unit sold | a **price** wedge: buyers pay more than sellers keep |
            | price ceiling | makes it illegal to charge more than $P_{\max}$ | a **quantity** wedge: buyers want more than sellers offer (shortage) |
            | price floor | makes it illegal to charge less than $P_{\min}$ | a quantity wedge: sellers offer more than buyers want (excess supply) |
            | price support | a floor, plus a promise to buy whatever is left over | producers sell more than consumers buy; the government buys the gap |

            Without any policy, the competitive market trades the quantity where demand meets supply. There, the value of the last unit to a buyer equals its cost to a seller. That is the efficient quantity (Part 9, [efficiency and DWL](#/l/m3-lr5)). Every one of these policies moves the market away from it, so every one of them **shrinks total surplus**. Governments use them anyway: to raise money, or to move surplus toward one group.
          `),
          R(md`
            ### The story: a tax on every taco

            A city's taco trucks sell to lunch crowds. Lecture 17's market:

            $$Q^d = 200 - 5P, \qquad Q^s = 5P$$

            $Q^d$ is how many tacos buyers want at price $P$; $Q^s$ is how many the trucks want to sell. With no tax, set them equal:

            $$200 - 5P = 5P \;\Rightarrow\; 200 = 10P \;\Rightarrow\; P^* = 20, \qquad Q^* = 5(20) = 100$$

            The star marks the **no-policy equilibrium**. We will compare everything with it.

            Now the city charges \$2 on every taco sold. Follow one taco:

            - The buyer hands over some price. Call it $P_c$, the **consumer price** (tax included).
            - The city takes its \$2.
            - The truck keeps what is left. Call it $P_p$, the **producer price**.

            So the two prices differ by exactly the tax, $t$ (dollars per unit):

            $$P_c - P_p = t$$

            Does this make sense? With $t = 0$ the two prices are equal: one market price, as before. ✓
          `),
          R(md`
            ### The second equation: every taco bought is a taco sold

            Who looks at which price?

            - A **buyer** decides how many to buy by looking at what leaves her wallet: $P_c$. So the quantity demanded is $Q^d(P_c)$.
            - A **truck** decides how many to sell by looking at what it keeps: $P_p$. So the quantity supplied is $Q^s(P_p)$.

            The market still clears: every taco bought is a taco sold. So

            $$Q^d(P_c) = Q^s(P_p)$$

            Two unknowns ($P_c$ and $P_p$), two equations. That is the whole method.

            !!method The tax recipe
              **Move 0.** Find the no-tax equilibrium $P^*$, $Q^*$ (you will need it to compare).

              **Move 1.** Write the wedge as $P_c = P_p + t$.

              **Move 2.** Substitute it into $Q^d(P_c) = Q^s(P_p)$. Now only $P_p$ is unknown. Solve.

              **Move 3.** $P_c = P_p + t$.

              **Move 4.** $Q$ from supply at $P_p$, and check it with demand at $P_c$.
          `),
          R(md`
            ### Worked example (Lecture 17): a \$2 tax

            **Move 0.** No tax: $P^* = 20$, $Q^* = 100$ (above).

            **Move 1.** $P_c = P_p + 2$.

            **Move 2.** Put that into demand and set demand equal to supply:
            $$200 - 5(P_p + 2) = 5P_p$$
            Multiply out the bracket:
            $$200 - 5P_p - 10 = 5P_p$$
            Combine the numbers on the left:
            $$190 - 5P_p = 5P_p$$
            Add $5P_p$ to both sides:
            $$190 = 10P_p \;\Rightarrow\; P_p = 19$$

            **Move 3.** $P_c = 19 + 2 = 21$.

            **Move 4.** Supply at $P_p$: $Q = 5(19) = 95$. Demand at $P_c$: $200 - 5(21) = 200 - 105 = 95$. ✓

            !!intuition Does this make sense?
              Buyers pay \$21 instead of \$20. Trucks keep \$19 instead of \$20. The two moves, \$1 and \$1, add up to the \$2 tax. Both sides face a worse price, so buyers want fewer tacos and trucks offer fewer: the market shrinks from 100 to 95.

            !!trap Do not add the whole tax to the old price
              A common wrong answer: "$P_c = 20 + 2 = 22$". That would mean sellers keep the full \$20, but at \$20 they want to sell 100 tacos while buyers paying \$22 want only 90. The market would not clear. Both prices have to move.
          `),
          Q(md`A \$3 per-unit tax is in place. Buyers pay \$25 per unit. How much does a seller keep per unit?`, ['\\$22', '\\$28', '\\$25', 'cannot tell without the curves'], 0,
            [null, 'The seller keeps the buyer price **minus** the tax, not plus.', 'Then the government would collect nothing: the two prices must differ by the tax.', 'The wedge alone settles it: $P_p = P_c - t$.'],
            md`$P_c - P_p = t \Rightarrow P_p = 25 - 3 = 22$. You need the curves to find $P_c$ in the first place, but once you know one price the wedge gives the other.`),
          Q(md`In the Lecture 17 market ($P^* = 20$), after a per-unit tax $P_c$ is ___ than 20 and $P_p$ is ___ than 20.`, ['higher, lower', 'higher, equal', 'higher, higher', 'lower, lower'], 0,
            [null, 'Sellers keep less too: with fewer units sold, they move down their supply curve to a lower price.', 'Sellers gain nothing from a tax; the government takes the wedge.', 'Buyers pay the tax-inclusive price, which is above the old price.'],
            md`The tax splits the old price in two: buyers above it, sellers below it. Here $21 > 20 > 19$.`),
          Q(md`A buyer deciding how many units to buy responds to…`, ['$P_c$, the price she pays, tax included', '$P_p$, the price the seller keeps', 'the tax $t$ alone', 'the old price $P^*$'], 0,
            [null, 'She does not care how the money is split after it leaves her wallet.', 'The tax matters only through what she pays in total.', 'The old price is gone; nobody trades at it now.'],
            md`That is why the market-clearing equation is $Q^d(P_c) = Q^s(P_p)$: each side reacts to its own price.`),
          RF(md`
            ### The tax on a graph: one curve shifts by $t$

            The algebra has a picture. Use the Lecture 17 "Your turn" tax, $t = 4$, so the wedge is wide enough to see.

            **Tax collected from sellers.** For each taco a truck now has to send \$4 to the city. To be willing to sell the 90th taco, a truck used to need its supply price, $90/5 = 18$. Now it needs \$18 **plus** \$4. Every point on the supply curve moves **up by $t$**:

            $$\text{new inverse supply: } P = \frac{Q}{5} + 4$$

            Where does it meet demand, $P = 40 - Q/5$?
            $$40 - \frac{Q}{5} = \frac{Q}{5} + 4 \;\Rightarrow\; 36 = \frac{2Q}{5} \;\Rightarrow\; Q = 90$$
            The height of that crossing is what buyers pay: $P_c = 40 - 90/5 = 22$. Drop straight down to the **original** supply curve to get what trucks keep: $P_p = 90/5 = 18$ (or $22 - 4$).

            [[fig:s]]
          `, { s: { svg: shiftSFig, cap: 'Tax on sellers: supply shifts up by t = 4 (orange). It meets demand at Q = 90, P_c = 22. Directly below, on the original supply curve, sellers keep P_p = 18.' } }),
          RF(md`
            **Tax collected from buyers.** Now each buyer hands \$4 to the city on top of what she pays the truck. A buyer who values the 90th taco at \$22 will now pay the truck at most $22 - 4 = 18$. Every point on the demand curve, as the trucks see it, moves **down by $t$**:

            $$\text{demand as sellers see it: } P = 36 - \frac{Q}{5}$$

            It meets supply where $36 - Q/5 = Q/5$, so $Q = 90$ and $P_p = 18$. Go straight up to the original demand curve for what buyers pay in total: $P_c = 22$.

            [[fig:d]]

            !!key Same $Q$, same $P_c$, same $P_p$
              Shifting supply up by $t$ or demand down by $t$ opens the **same** vertical gap of $t$ between the curves at $Q = 90$. Who mails the check to the government changes nothing. Lesson 2 comes back to this ("legal liability does not matter").
          `, { d: { svg: shiftDFig, cap: 'Tax on buyers: demand shifts down by t = 4 (orange). It meets supply at Q = 90, P_p = 18. Directly above, on the original demand curve, buyers pay P_c = 22 in total.' } }),
          Q(md`A per-unit tax is collected from **sellers**. On the graph, which curve moves and which way?`, ['supply shifts up by $t$', 'supply shifts down by $t$', 'supply shifts right by $t$', 'demand shifts down by $t$'], 0,
            [null, 'Sellers now need **more** per unit to be willing to sell, so their curve rises.', 'The tax is dollars per unit, so the shift is vertical, not sideways.', 'That is the picture when the tax is collected from buyers. It gives the same answer, but it is not the curve that moves here.'],
            md`Each unit now costs the seller $t$ more to sell, so the price needed for every quantity rises by $t$.`),
          RF(md`
            ### The shortcut for inverse curves: the gap equals $t$

            Look at the original two curves only. At any quantity $Q$, the **vertical gap** between them is

            $$\text{gap}(Q) = P_D(Q) - P_S(Q)$$

            where $P_D(Q)$ is the most buyers would pay for the $Q$-th unit (demand height) and $P_S(Q)$ is the least sellers would take (supply height).

            - At the no-tax equilibrium the gap is zero: the curves cross.
            - To the left of it, the gap is positive and grows as $Q$ shrinks.

            With a tax, buyers pay the demand height and sellers keep the supply height, and the government takes the difference. So the market settles at the quantity where **the gap equals $t$**.

            [[fig:g]]

            **Worked: Lecture 17 with inverse curves.** Solve each curve for $P$. Demand: $Q = 200 - 5P \Rightarrow 5P = 200 - Q \Rightarrow P_D = 40 - Q/5$. Supply: $Q = 5P \Rightarrow P_S = Q/5$.

            **Move 1.** Set the gap equal to $t = 2$:
            $$\left(40 - \frac{Q}{5}\right) - \frac{Q}{5} = 2$$
            **Move 2.** Combine the $Q$ terms:
            $$40 - \frac{2Q}{5} = 2 \;\Rightarrow\; \frac{2Q}{5} = 38 \;\Rightarrow\; Q = 95$$
            **Move 3.** Read each price off its own curve: $P_c = 40 - 95/5 = 21$ and $P_p = 95/5 = 19$. Same answer as before, with no substitution step.
          `, { g: { svg: gapFig, cap: 'The vertical gap between demand and supply: 16 at Q = 60, 4 at Q = 90, 0 at Q = 100. A tax of t = 4 settles the market where the gap is 4.' } }),
          R(md`
            ### Which tool when

            | What you are given | Fastest route |
            |---|---|
            | direct curves, $Q^d(P)$ and $Q^s(P)$ | substitute $P_c = P_p + t$ into $Q^d(P_c) = Q^s(P_p)$ |
            | inverse curves, $P = \ldots$ | the gap: $P_D(Q) - P_S(Q) = t$, then each price from its own curve |
            | a graph | shift supply up by $t$ (or demand down by $t$) and read the crossing |
            | a percent (ad valorem) tax $v$ | a different wedge: $P_p = (1 - v)P_c$ (see [Part 12](#/l/m3-mt2)) |

            !!trap Three ways to break the wedge
              $Q^d(P) = Q^s(P) - t$ subtracts dollars from units. $Q^d(P_p) = Q^s(P_c)$ swaps who reacts to which price. "Shift both curves by $t$" cancels out and gives the no-tax answer.
          `),
          Q(md`Using inverse curves, at the after-tax quantity the vertical distance between demand and supply equals…`, ['the tax $t$', 'zero', 'the price buyers pay', 'half the tax'], 0,
            [null, 'Zero gap is the no-tax crossing.', 'The demand height alone is $P_c$; the gap is $P_c - P_p$.', 'The whole tax sits between the two prices, not half of it.'],
            md`Demand height $= P_c$, supply height $= P_p$, and $P_c - P_p = t$.`),
          Q(md`Inverse demand is $P = 40 - Q/5$ and inverse supply is $P = Q/5$. A tax of \$8 per unit. The quantity traded is…`, ['80', '92', '100', '60'], 0,
            [null, 'That subtracts the tax from the quantity, 100 − 8. The gap equation is in dollars: $40 - 2Q/5 = 8$.', 'That is the no-tax quantity.', 'At $Q = 60$ the gap is 16, which would be a \\$16 tax.'],
            md`$40 - \dfrac{2Q}{5} = 8 \Rightarrow \dfrac{2Q}{5} = 32 \Rightarrow Q = 80$. Then $P_c = 24$, $P_p = 16$.`),
          R(md`
            ### Spot it: plan only

            No numbers to type. Decide how you would start, then read why the other starts fail.
          `),
          P({ q: md`Demand is $Q^d = 300 - 3P$ and supply is $Q^s = 2P - 20$. A \$5 tax per unit is collected from sellers. Find the price buyers pay.`,
            plan: plan('Which equations do you solve together?', '$Q^d(P_c) = Q^s(P_p)$ with $P_c = P_p + 5$', [
              ['$Q^d(P) = Q^s(P) + 5$', 'That adds 5 **units** to supply. The tax is \\$5 per unit: it separates two prices.'],
              ['Solve $Q^d = Q^s$ first, then $P_c = P^* + 5$', 'That puts the whole tax on buyers. Sellers also give up part of it unless supply is perfectly flat.'],
              ['$Q^d(P_p) = Q^s(P_c)$', 'Swapped: buyers react to what they pay, sellers to what they keep.'],
            ], '$300 - 3(P_p + 5) = 2P_p - 20$, solve for $P_p$, add 5.') }),
          P({ q: md`Inverse demand is $P = 50 - Q$ and inverse supply is $P = 10 + Q$. A \$6 per-unit tax is imposed. You want the new quantity fast.`,
            plan: plan('Which equation gives the new quantity?', '$(50 - Q) - (10 + Q) = 6$', [
              ['$50 - Q = 10 + Q$, then subtract 6 from $Q$', 'The tax is dollars, not units. You cannot subtract it from a quantity.'],
              ['$(50 - Q) + (10 + Q) = 6$', 'The tax is the **difference** between the two heights, not their sum.'],
              ['$(50 - Q) - 6 = (10 + Q) - 6$', 'Moving both curves down by 6 leaves the gap at zero: the no-tax answer.'],
            ], '$40 - 2Q = 6 \\Rightarrow Q = 17$; then $P_c = 33$, $P_p = 27$.') }),
          P({ q: md`A textbook graph shows the original supply $S$ and a new curve labeled $S + t$, $t = 3$. Demand crosses $S + t$ at a price of \$15.`,
            plan: plan('Where do you read the price sellers keep?', 'Straight below the new crossing, on the original $S$: $P_p = 15 - 3 = 12$', [
              ['At the new crossing: \\$15', 'The crossing with $S + t$ is what buyers pay, $P_c$.'],
              ['At the old crossing of $S$ and $D$', 'Nobody trades at the old price any more.'],
              ['Where $S + t$ meets the price axis', 'That is just the intercept of the shifted curve, $t$ above the original intercept.'],
            ], 'Buyers pay the crossing height; sellers keep that minus $t$, which is the height of the original supply curve at the same $Q$.') }),
          P({ q: md`A friend solves a tax problem and gets $P_c = 23$, $P_p = 19$, with a \$2 tax.`,
            plan: plan('Before redoing the algebra, what tells you something is wrong?', 'The prices differ by 4, not by the tax of 2', [
              ['Nothing: $P_c$ is above $P_p$ as it should be', 'Above is not enough: the gap must be exactly $t$.'],
              ['$P_p$ should be above $P_c$', 'Buyers pay the tax-inclusive price, so $P_c$ is the higher one.'],
              ['The quantity was not given', 'You can test the prices with the wedge alone: $P_c - P_p$ must equal $t$.'],
            ], 'Check $P_c - P_p = t$ every time. Then check that $Q^d(P_c)$ and $Q^s(P_p)$ give the same number.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Your turn (Lecture 17): a \\$4 tax', q: md`Same market: $Q^d = 200 - 5P$, $Q^s = 5P$. The tax rises to \$4 per unit. Find $P_c$, $P_p$ and the quantity traded.`,
            plan: plan('First equation?', '$200 - 5(P_p + 4) = 5P_p$', [
              ['$200 - 5P = 5P - 4$', 'That subtracts \\$4 from a quantity. The tax separates two prices.'],
              ['$200 - 5P_p = 5(P_p + 4)$', 'Swapped: demand must be evaluated at the price buyers pay, $P_p + 4$.'],
              ['$P_c = 20 + 4 = 24$', 'That loads the whole tax on buyers; sellers would keep \\$20 and offer 100 units while buyers want 80.'],
            ], 'Expand, collect $P_p$, solve. Then $P_c = P_p + 4$ and $Q = 5P_p$.'),
            parts: [N('P_c', 22), N('P_p', 18), N('Q', 90)],
            sol: md`
              **Move 1.** $P_c = P_p + 4$.

              **Move 2.** $200 - 5(P_p + 4) = 5P_p \Rightarrow 200 - 5P_p - 20 = 5P_p \Rightarrow 180 = 10P_p \Rightarrow P_p = 18$.

              **Move 3.** $P_c = 22$. **Move 4.** $Q = 5(18) = 90$; check $200 - 5(22) = 90$ ✓.

              Twice the tax, twice the price moves: buyers +2, sellers −2, and the quantity falls by 10 instead of 5.
            ` }),
          P({ title: 'Curves with intercepts', q: md`Demand is $Q^d = 100 - 2P$ and supply is $Q^s = 3P - 10$. A \$5 per-unit tax is collected from sellers.`,
            plan: plan('What is the order of work?', 'No-tax equilibrium first, then substitute $P_c = P_p + 5$ into $Q^d(P_c) = Q^s(P_p)$', [
              ['Shift supply right by 5 units and re-solve', 'The tax is \\$5 per unit, a vertical shift of the inverse supply, not 5 more units.'],
              ['Only the tax equation matters; skip the no-tax market', 'You need $P^*$ to say how much each side\'s price moved.'],
              ['Set $P_c = P^* + 5$', 'Sellers also give up part of the tax; both prices move.'],
            ], 'No tax: $100 - 2P = 3P - 10$. Tax: $100 - 2(P_p + 5) = 3P_p - 10$.'),
            parts: [N('P^*', 22), N('Q^*', 56), N('P_c', 25), N('P_p', 20), N('Q', 50)],
            sol: md`
              **Move 0.** $100 - 2P = 3P - 10 \Rightarrow 110 = 5P \Rightarrow P^* = 22$, $Q^* = 3(22) - 10 = 56$.

              **Move 1–2.** $100 - 2(P_p + 5) = 3P_p - 10$. Expand: $100 - 2P_p - 10 = 3P_p - 10$, so $90 - 2P_p = 3P_p - 10$. Collect: $100 = 5P_p$, so $P_p = 20$.

              **Move 3.** $P_c = 25$. **Move 4.** $Q = 3(20) - 10 = 50$; check $100 - 2(25) = 50$ ✓.

              Buyers' price rose by 3, sellers' fell by 2: not an even split, because the two curves respond differently to price (lesson 2).
            ` }),
          P({ title: 'Inverse curves, tax on buyers', q: md`Inverse demand is $P = 60 - 2Q$ and inverse supply is $P = 12 + Q$. A \$9 per-unit tax is collected from buyers.`,
            plan: plan('Fastest route to the after-tax quantity?', 'Set the gap equal to the tax: $(60 - 2Q) - (12 + Q) = 9$', [
              ['Shift demand **up** by 9 and re-solve', 'A tax on buyers shifts demand (as sellers see it) **down**: buyers will hand the seller less.'],
              ['Set $60 - 2Q = 12 + Q$ and subtract 9 from $Q$', 'Dollars and units do not mix.'],
              ['It depends on who pays, so solve with demand only', 'Who pays does not matter; you still need both curves.'],
            ], '$48 - 3Q = 9 \\Rightarrow Q = 13$. Then $P_c = 60 - 2(13)$, $P_p = 12 + 13$.'),
            parts: [N('Q^*', 16), N('P^*', 28), N('Q', 13), N('P_c', 34), N('P_p', 25)],
            sol: md`
              **Move 0.** $60 - 2Q = 12 + Q \Rightarrow 48 = 3Q \Rightarrow Q^* = 16$, $P^* = 12 + 16 = 28$.

              **Move 1.** Gap $= t$: $(60 - 2Q) - (12 + Q) = 9 \Rightarrow 48 - 3Q = 9 \Rightarrow 3Q = 39 \Rightarrow Q = 13$.

              **Move 2.** $P_c = 60 - 26 = 34$ (demand height), $P_p = 12 + 13 = 25$ (supply height). Check $34 - 25 = 9$ ✓.

              Collected from buyers, so buyers hand \$25 to the seller and \$9 to the government: \$34 in all.
            ` }),
          P({ title: 'Demand as the sellers see it', q: md`Lecture market, $Q^d = 200 - 5P$, $Q^s = 5P$, with a \$2 tax collected from **buyers**. Write demand as a function of the price the sellers receive (call that price $P$), then solve.`,
            plan: plan('A buyer who pays the seller $P$ also pays the tax. What total does she face?', '$P + 2$, so demand as sellers see it is $200 - 5(P + 2)$', [
              ['$P - 2$', 'The tax is added on top of what the seller gets, so she pays more, not less.'],
              ['$P$: the tax does not affect buyers', 'She pays it directly, so it is part of her price.'],
              ['$2P$', 'A per-unit tax adds a fixed \\$2, it does not double the price.'],
            ], 'Expand: $200 - 5P - 10 = 190 - 5P$. Set it equal to $5P$.'),
            parts: [X('Q^d\\text{ in terms of the seller price }P', '190 - 5*P', { P: [0, 30] }), N('P_p', 19), N('P_c', 21), N('Q', 95)],
            sol: md`
              **Move 1.** Buyers pay $P + 2$ in total, so $Q^d = 200 - 5(P + 2) = 190 - 5P$. That is demand shifted **down by \$2** (in inverse form, $P = 38 - Q/5$ instead of $40 - Q/5$).

              **Move 2.** $190 - 5P = 5P \Rightarrow P = 19 = P_p$.

              **Move 3.** Buyers pay $19 + 2 = 21$, and $Q = 95$: exactly the tax-on-sellers answer.
            ` }),
          P({ title: 'Food trucks downtown', q: md`Demand for burritos is $Q^d = 400 - 10P$ and supply is $Q^s = 10P - 40$. The city adds a \$4 tax per burrito.`,
            plan: plan('First equation with the tax?', '$400 - 10(P_p + 4) = 10P_p - 40$', [
              ['$400 - 10P = 10P - 40 - 4$', 'Subtracting 4 from the supply **quantity** is not a \\$4 tax.'],
              ['$400 - 10(P_p - 4) = 10P_p - 40$', 'Buyers pay **more** than sellers keep: $P_c = P_p + 4$.'],
              ['$400 - 10P_c = 10P_c - 40$', 'One price for both sides is the no-tax market.'],
            ], 'Expand and solve for $P_p$.'),
            parts: [N('P^*', 22), N('P_c', 24), N('P_p', 20), N('Q', 160)],
            sol: md`
              **Move 0.** $400 - 10P = 10P - 40 \Rightarrow 440 = 20P \Rightarrow P^* = 22$, $Q^* = 180$.

              **Move 2.** $400 - 10P_p - 40 = 10P_p - 40 \Rightarrow 400 = 20P_p \Rightarrow P_p = 20$. **Move 3.** $P_c = 24$. **Move 4.** $Q = 10(20) - 40 = 160$ ✓ ($400 - 240 = 160$).
            ` }),
          G('m3_po_tax', { need: 3 }),
          G('m3_po_gap', { need: 2 }),
        ],
      },
      // ================================================================ lesson 2
      {
        id: 'm3-po2', title: 'Who pays? Incidence, revenue, deadweight loss', ref: 'Lecture 17',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "what share of the tax do consumers bear?", "tax incidence" | how far the buyers' price rose, as a fraction of $t$ | $(P_c - P^*)/t$; producers $(P^* - P_p)/t$ |
            | "who bears more of the tax, and why?" | which side responds less to price | the less responsive (steeper) side bears more |
            | "does it matter whether buyers or sellers pay the tax?" | legal versus economic incidence | no: same prices, same welfare |
            | "calculate tax revenue", "shade tax revenue" | the rectangle between $P_c$ and $P_p$ | $t \times Q$, with the **after-tax** $Q$ |
            | "calculate the deadweight loss", "shade the DWL" | the triangle of lost trades | $\tfrac12 \times t \times (Q^* - Q)$ |
            | "fill in the welfare table" | CS, PS, revenue before and after | $W = CS + PS + \text{revenue}$; the change in $W$ is $-$DWL |
          `),
          R(md`
            ### Who really pays? Watch the prices, not the paperwork

            The city's taco tax is mailed in by the trucks. Does that mean the trucks pay it? Look at what happened to the prices with $t = 2$ (lesson 1):

            - Buyers pay \$21 instead of \$20: they are \$1 worse off per taco.
            - Trucks keep \$19 instead of \$20: they are \$1 worse off per taco.

            The **economic burden** (the incidence) is how much each side's price moved. It has nothing to do with who mails the check. As shares of the tax:

            $$\text{consumer share} = \frac{P_c - P^*}{t}, \qquad \text{producer share} = \frac{P^* - P_p}{t}$$

            Here $P^*$ is the **no-tax** price (the formula sheet writes it as $P$). The two shares always add to 1, because $(P_c - P^*) + (P^* - P_p) = P_c - P_p = t$.

            Lecture 17: consumer share $= (21 - 20)/2 = 50\%$, producer share $= (20 - 19)/2 = 50\%$.

            **Why an even split here?** Both curves change quantity by 5 units for each \$1 change in price ($Q^d = 200 - 5P$, $Q^s = 5P$). Equal responses, equal burdens. Change the slopes and the split changes.
          `),
          RF(md`
            ### Unequal slopes: the side that cannot escape pays more

            **Worked example A.** Demand $Q^d = 120 - 2P$, supply $Q^s = 4P$, tax $t = 6$.

            **Move 0: no tax.** $120 - 2P = 4P \Rightarrow 120 = 6P \Rightarrow P^* = 20$, $Q^* = 80$.

            **Move 1–2: the wedge.** $120 - 2(P_p + 6) = 4P_p$. Expand: $120 - 2P_p - 12 = 4P_p$. Collect: $108 = 6P_p$, so $P_p = 18$.

            **Move 3.** $P_c = 18 + 6 = 24$, and $Q = 4(18) = 72$ (check: $120 - 48 = 72$ ✓).

            **Move 4: incidence.** Consumers: $(24 - 20)/6 = 4/6 = 2/3$. Producers: $(20 - 18)/6 = 1/3$.

            [[fig:a]]

            Demand drops only 2 units per \$1; supply drops 4 units per \$1. Buyers are the **less responsive** side: they keep buying almost as much even when the price rises, so the price can rise a lot before the market clears. They carry two thirds.
          `, { a: { svg: incAFig, cap: 'Example A: demand is the steeper (less responsive) curve. The gray revenue rectangle is split by the old price 20 (dashed): buyers carry 4 of each 6 dollars, sellers 2. Red: DWL.' } }),
          RF(md`
            **Worked example B: flip the slopes.** Demand $Q^d = 120 - 4P$, supply $Q^s = 2P$, tax $t = 6$.

            No tax: $120 - 4P = 2P \Rightarrow P^* = 20$, $Q^* = 40$. With the tax: $120 - 4(P_p + 6) = 2P_p \Rightarrow 96 = 6P_p \Rightarrow P_p = 16$, $P_c = 22$, $Q = 32$.

            Consumers: $(22 - 20)/6 = 1/3$. Producers: $(20 - 16)/6 = 2/3$. Now supply is the less responsive side, and sellers carry two thirds.

            [[fig:b]]
          `, { b: { svg: incBFig, cap: 'Example B: now supply is the steeper curve. Buyers carry 2 of each 6 dollars, sellers 4.' } }),
          R(md`
            ### Why the less responsive side pays more: one line of algebra

            Write demand as $Q^d = a - bP$ and supply as $Q^s = c + dP$. Here $b$ is how many units buyers drop per \$1 rise in their price, and $d$ is how many units sellers drop per \$1 fall in theirs.

            The tax lowers the quantity bought and the quantity sold by the **same** amount (they are the same units). Buyers' quantity falls by $b(P_c - P^*)$; sellers' falls by $d(P^* - P_p)$. Set them equal:

            $$b\,(P_c - P^*) = d\,(P^* - P_p)$$

            The two price moves are in the ratio $d : b$. Since they add up to $t$:

            $$P_c - P^* = \frac{d}{b + d}\,t, \qquad P^* - P_p = \frac{b}{b + d}\,t$$

            Check with Lecture 17: $b = d = 5$, so each side's share is $5/10 = 1/2$ ✓. Example A: $b = 2$, $d = 4$, consumer share $4/6$ ✓.

            !!key Incidence in one sentence
              The less responsive (less elastic, steeper on the graph) side of the market bears more of the tax. If demand is perfectly inelastic (vertical, $b = 0$), consumers bear all of it. If supply is perfectly elastic (flat), consumers also bear all of it.

            !!intuition Why "elastic" and "slope" agree here
              Elasticity is $\varepsilon = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q}$. At the no-tax point both curves share the same $P^*$ and $Q^*$, so comparing $b$ with $d$ is the same as comparing the two elasticities there.
          `),
          Q(md`Demand for insulin is very inelastic; supply is very elastic. A per-unit tax on insulin is borne…`, ['mostly by buyers', 'mostly by sellers', 'evenly', 'entirely by whoever the law names'], 0,
            [null, 'Sellers can cut output easily (elastic supply), so the price they keep barely falls.', 'An even split needs equally responsive sides.', 'Legal liability does not decide the economic burden.'],
            md`Buyers keep buying whatever the price, so the price they pay absorbs almost all of the tax.`),
          Q(md`Demand is $Q^d = 500 - 20P$ and supply is $Q^s = 5P$. Without solving, the producer share of a per-unit tax is…`, ['80%', '20%', '50%', '25%'], 0,
            [null, 'That is the consumer share: $d/(b + d) = 5/25$.', 'An even split needs $b = d$.', 'Shares are $b/(b + d)$ and $d/(b + d)$, not $d/b$.'],
            md`Producer share $= \dfrac{b}{b + d} = \dfrac{20}{25} = 80\%$. Supply responds 5 units per \$1, demand 20: sellers are the less responsive side.`),
          R(md`
            ### Legal liability does not matter

            Lecture 17 says it plainly: **it does not matter who is legally required to pay the per-unit tax.**

            - Collected from sellers: supply shifts up by \$2 and meets demand where buyers pay \$21.
            - Collected from buyers: demand shifts down by \$2 and meets supply where sellers keep \$19.

            Either way buyers are out \$21 per taco in total, sellers keep \$19, 95 tacos trade, and every welfare number below is identical. The burden depends only on how responsive the two sides are.
          `),
          Q(md`The city moves the taco tax from the trucks to the buyers (buyers now pay it at the register). The price buyers pay **in total**, tax included…`, ['does not change', 'falls by the tax', 'rises by the tax', 'falls by half the tax'], 0,
            [null, 'Buyers now pay a lower sticker price to the truck, but the tax on top brings them back to the same total.', 'Both versions solve the same two equations.', 'Moving the paperwork moves no burden.'],
            md`Same wedge, same curves, same answer: $P_c = 21$, $P_p = 19$, $Q = 95$.`),
          RF(md`
            ### Tax revenue and deadweight loss

            **Tax revenue** is $t$ dollars on every unit **still sold**:

            $$\text{revenue} = t \times Q = 2 \times 95 = 190$$

            On the graph it is the rectangle between $P_p$ and $P_c$, out to the after-tax quantity.

            **Deadweight loss.** Units 95 to 100 used to trade. Each of them was worth more to some buyer than it cost some seller (demand is above supply there), so each one created surplus. The tax kills those trades, and nobody gets that surplus: not buyers, not sellers, not the government. It is the triangle between demand and supply over the lost units, with base $Q^* - Q$ and height $t$ (the gap at $Q$):

            $$\text{DWL} = \tfrac12 \times t \times (Q^* - Q) = \tfrac12 \times 2 \times (100 - 95) = 5$$

            [[fig:w]]
          `, { w: { svg: taxWelfFig, cap: 'Tax of 4 in the Lecture 17 market. Blue: CS above P_c = 22. Green: PS below P_p = 18. Gray: tax revenue 4 × 90 = 360. Red: DWL ½ × 4 × (100 − 90) = 20.' } }),
          R(md`
            ### The full welfare table (Lecture 17, $t = 2$)

            Corners first. Demand $Q = 200 - 5P$ hits zero at $P = 40$ (the **choke price**). Supply $Q = 5P$ starts at $P = 0$.

            **Before.** $CS = \tfrac12 \times 100 \times (40 - 20) = 1000$, $PS = \tfrac12 \times 100 \times (20 - 0) = 1000$.

            **After.** CS is the triangle under demand above **$P_c$**, over the 95 units still bought:
            $$CS = \tfrac12 \times 95 \times (40 - 21) = \tfrac12 \times 95 \times 19 = 902.5$$
            PS is the triangle above supply below **$P_p$**, over the 95 units sold:
            $$PS = \tfrac12 \times 95 \times (19 - 0) = 902.5$$

            | Measure | No tax | With tax | Change |
            |---|---|---|---|
            | Consumer surplus | 1000 | 902.50 | $-97.50$ |
            | Producer surplus | 1000 | 902.50 | $-97.50$ |
            | Tax revenue | 0 | 190 | $+190$ |
            | Total welfare | 2000 | 1995 | $-5$ |

            Buyers and sellers lose 195 together. The government collects 190 of it, which it can spend on things people value. The other 5 is gone: that is the DWL.

            !!method Welfare with a tax
              $W = CS + PS + \text{revenue}$, and $\Delta W = \Delta CS + \Delta PS + \text{revenue} = -\text{DWL}$.
          `),
          R(md`
            ### Why DWL grows with the **square** of the tax

            In the Lecture 17 market the quantity is $Q = 100 - 2.5t$ (from the gap equation $40 - 2Q/5 = t$). So the lost quantity, $2.5t$, grows in step with $t$, and the DWL triangle grows in **both** directions at once:

            $$\text{DWL} = \tfrac12 \times t \times 2.5t = 1.25\,t^2$$

            | Tax $t$ | Quantity $Q$ | Revenue $tQ$ | DWL |
            |---|---|---|---|
            | 1 | 97.5 | 97.5 | 1.25 |
            | 2 | 95 | 190 | 5 |
            | 4 | 90 | 360 | 20 |
            | 8 | 80 | 640 | 80 |

            Double the tax: revenue less than doubles (the base shrinks), DWL quadruples. That is why economists prefer many small taxes to one big one.
          `),
          Q(md`With linear curves, a \$3 tax creates a DWL of \$9. A \$6 tax in the same market creates a DWL of…`, ['\\$36', '\\$18', '\\$9', '\\$27'], 0,
            [null, 'Doubling the height alone would double it, but the base (lost quantity) doubles too.', 'A bigger tax always loses more trades.', 'DWL scales with the square: $2^2 = 4$, not 3.'],
            md`$\text{DWL} \propto t^2$: twice the tax, four times the DWL: $4 \times 9 = 36$.`),
          Q(md`Demand is perfectly inelastic (vertical) at 100 units. A per-unit tax creates a deadweight loss of…`, ['zero', '$\\tfrac12 t \\times 100$', '$t \\times 100$', 'it depends on supply'], 0,
            [null, 'The DWL base is the lost quantity, which is zero here.', 'That is the tax revenue.', 'With vertical demand the quantity cannot change whatever supply looks like.'],
            md`Nobody stops buying, so no trades are lost: DWL = 0. Buyers bear the whole tax, and revenue is $100t$.`),
          Q(md`In a welfare table for a tax, $\Delta CS + \Delta PS + \text{tax revenue}$ equals…`, ['minus the DWL', 'zero', 'the tax revenue', 'the DWL'], 0,
            [null, 'It would be zero only if the tax lost no trades.', 'Revenue is one of the three pieces, not the total.', 'The change is a loss, so it is negative.'],
            md`Lecture 17, $t = 2$: $-97.5 - 97.5 + 190 = -5 = -\text{DWL}$.`),
          R(md`
            ### Spot it: plan only
          `),
          P({ q: md`After a tax, $P_c = 26$, $P_p = 20$, and the no-tax price was 24. What share of the tax do consumers bear?`,
            plan: plan('Which ratio?', '$(P_c - P^*)/t = (26 - 24)/6$', [
              ['$P_c / t = 26/6$', 'The burden is the **rise** in the buyers\' price, not the whole price.'],
              ['$(P_c - P_p)/t = 6/6$', 'That is the whole wedge: always 1.'],
              ['$(P^* - P_p)/t = 4/6$', 'That is the **producer** share.'],
            ], 'Consumers bear $2/6 = 1/3$; producers $4/6 = 2/3$.') }),
          P({ q: md`A \$5 tax cuts the quantity from 400 to 360. Find the tax revenue.`,
            plan: plan('Which quantity multiplies the tax?', 'The after-tax quantity: $5 \\times 360$', [
              ['The no-tax quantity: $5 \\times 400$', 'The 40 units that stopped trading pay no tax.'],
              ['The lost quantity: $5 \\times 40$', 'That rectangle is not anything; the DWL is half of it.'],
              ['$P_c \\times 360$', 'That is what buyers spend in total, not what the government collects.'],
            ], 'Revenue $= 5 \\times 360 = 1800$. (DWL $= \\tfrac12 \\times 5 \\times 40 = 100$.)') }),
          P({ q: md`Same tax: \$5, quantity from 400 to 360. Find the deadweight loss.`,
            plan: plan('Which area?', '$\\tfrac12 \\times t \\times (Q^* - Q) = \\tfrac12 \\times 5 \\times 40$', [
              ['$t \\times (Q^* - Q) = 5 \\times 40$', 'DWL is a **triangle** between the curves, not a rectangle.'],
              ['$\\tfrac12 \\times (P_c - P^*) \\times 40$', 'The height of the triangle is the whole gap $t$, not just the buyers\' part.'],
              ['$\\tfrac12 \\times 5 \\times 360$', 'The base is the **lost** quantity, not the quantity still traded.'],
            ], 'DWL $= 100$.') }),
          P({ q: md`Demand is $Q^d = 500 - 20P$, supply is $Q^s = 5P$. A per-unit tax is imposed. Your friend says: "Buyers pay more, so buyers bear most of the tax."`,
            plan: plan('Who actually bears more?', 'Sellers: supply responds only 5 units per \\$1, demand 20', [
              ['Buyers: they pay the higher price', 'Buyers always pay the higher price; the burden is how far each price **moves** from the old one.'],
              ['Evenly: the tax is the same dollar amount for both', 'The split depends on responsiveness, which differs here.'],
              ['Whoever the tax is collected from', 'Legal liability does not decide it.'],
            ], 'Producer share $= 20/25 = 80\\%$; consumer share $= 5/25 = 20\\%$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Incidence with unequal slopes', q: md`Demand is $Q^d = 90 - 3P$, supply is $Q^s = 6P$. A \$3 per-unit tax is imposed.`,
            plan: [
              plan('Before computing: who bears more?', 'Buyers: demand drops 3 units per \\$1, supply 6', [
                ['Sellers: they mail in the tax', 'Who mails it in is irrelevant.'],
                ['Evenly', 'That needs equal responses; here they differ.'],
                ['Sellers: supply is the steeper curve', 'Supply $Q = 6P$ is the **flatter** curve on a price-quantity graph ($P = Q/6$); demand $P = 30 - Q/3$ is steeper.'],
              ], 'Consumer share should come out $6/9 = 2/3$.'),
              plan('Revenue and DWL use which quantities?', 'Revenue: $t$ times the after-tax $Q$. DWL: $\\tfrac12 t$ times the lost quantity', [
                ['Both use the no-tax quantity', 'Lost units pay no tax.'],
                ['Revenue uses the lost quantity', 'Revenue comes from units that still trade.'],
                ['DWL $= t \\times$ lost quantity', 'Half of that: it is a triangle.'],
              ], 'Solve the wedge first, then the two areas.'),
            ],
            parts: [N('P^*', 10), N('P_c', 12), N('P_p', 9), N('\\text{consumer share }(\\%)', 66.667), N('\\text{tax revenue}', 162), N('\\text{DWL}', 9)],
            sol: md`
              **Move 0.** $90 - 3P = 6P \Rightarrow P^* = 10$, $Q^* = 60$.

              **Move 1–2.** $90 - 3(P_p + 3) = 6P_p \Rightarrow 81 = 9P_p \Rightarrow P_p = 9$, $P_c = 12$, $Q = 54$.

              **Move 3.** Consumer share $(12 - 10)/3 = 66.7\%$; producer $(10 - 9)/3 = 33.3\%$. Shortcut: $6/(3 + 6) = 2/3$ ✓.

              **Move 4.** Revenue $= 3 \times 54 = 162$. DWL $= \tfrac12 \times 3 \times (60 - 54) = 9$.
            ` }),
          P({ title: 'Your turn (Lecture 17): welfare with a \\$4 tax', q: md`$Q^d = 200 - 5P$, $Q^s = 5P$, $t = 4$ (so $P_c = 22$, $P_p = 18$, $Q = 90$). Fill in the after-tax column.`,
            plan: plan('Which price bounds the CS triangle after the tax?', '$P_c = 22$: CS $= \\tfrac12 \\times 90 \\times (40 - 22)$', [
              ['$P_p = 18$', 'Buyers pay 22; the strip from 18 to 22 is the government\'s.'],
              ['$P^* = 20$', 'Nobody pays 20 any more.'],
              ['$P_c = 22$, but over 100 units', 'Only 90 units are bought.'],
            ], 'PS $= \\tfrac12 \\times 90 \\times 18$; revenue $= 4 \\times 90$; $W = CS + PS + \\text{revenue}$.'),
            parts: [N('CS', 810), N('PS', 810), N('\\text{tax revenue}', 360), N('W', 1980), N('\\Delta CS', -190), N('\\text{DWL}', 20)],
            sol: md`
              $CS = \tfrac12(90)(40 - 22) = 810$ (down 190). $PS = \tfrac12(90)(18) = 810$ (down 190). Revenue $= 4 \times 90 = 360$. $W = 810 + 810 + 360 = 1980$, down 20 from 2000.

              DWL $= \tfrac12 \times 4 \times (100 - 90) = 20$ ✓, four times the DWL of the \$2 tax.
            ` }),
          P({ title: 'A big tax, full accounting', q: md`Demand is $Q^d = 150 - P$, supply is $Q^s = 2P$, and a \$15 per-unit tax is imposed.`,
            plan: plan('What do you need before any area?', 'Both equilibria: $P^*, Q^*$ without the tax and $P_c, P_p, Q$ with it, plus the choke price 150', [
              ['Only the after-tax equilibrium', 'The "change" columns and the DWL base need the no-tax numbers too.'],
              ['Only $P^*$ and $Q^*$; then subtract the tax', 'Both prices move; you need the wedge.'],
              ['The elasticities at the new point', 'Elasticities explain the split, but areas need prices and quantities.'],
            ], 'No tax: $150 - P = 2P$. Tax: $150 - (P_p + 15) = 2P_p$.'),
            parts: [N('P_c', 60), N('P_p', 45), N('\\text{consumer share }(\\%)', 66.667), N('\\text{tax revenue}', 1350), N('\\Delta CS', -950), N('\\Delta PS', -475), N('\\text{DWL}', 75)],
            sol: md`
              **Move 0.** $150 - P = 2P \Rightarrow P^* = 50$, $Q^* = 100$.

              **Move 1–2.** $150 - P_p - 15 = 2P_p \Rightarrow 135 = 3P_p \Rightarrow P_p = 45$, $P_c = 60$, $Q = 90$.

              **Move 3.** Consumer share $(60 - 50)/15 = 2/3$ (demand drops 1 unit per \$1, supply 2).

              **Move 4: areas.** CS before $\tfrac12(100)(150 - 50) = 5000$, after $\tfrac12(90)(150 - 60) = 4050$: $\Delta CS = -950$. PS before $\tfrac12(100)(50) = 2500$, after $\tfrac12(90)(45) = 2025$: $\Delta PS = -475$. Revenue $15 \times 90 = 1350$.

              **Check:** $-950 - 475 + 1350 = -75 = -\tfrac12(15)(10)$ ✓. Consumers lose twice what producers lose: their 2/3 share.
            ` }),
          P({ title: 'Vertical demand', q: md`A life-saving drug has perfectly inelastic demand: $Q^d = 100$ at any price. Supply is $Q^s = 2P$. A \$10 per-unit tax is imposed.`,
            plan: plan('What happens to the quantity?', 'Nothing: buyers take 100 whatever they pay, so $Q = 100$', [
              ['It falls by 10', 'The tax is dollars; and here buyers do not respond to price at all.'],
              ['It falls until the gap equals 10', 'A vertical demand curve takes every height at $Q = 100$, so a gap of 10 opens right there: the quantity does not move.'],
              ['It falls by half the tax times the supply slope', 'Only the side that responds can change the quantity, and buyers set it here.'],
            ], 'Sellers need $P_p$ with $2P_p = 100$; buyers pay $P_p + 10$.'),
            parts: [N('Q', 100), N('P_p', 50), N('P_c', 60), N('\\text{consumer share }(\\%)', 100), N('\\text{DWL}', 0)],
            sol: md`$Q = 100$ always, so $2P_p = 100 \Rightarrow P_p = 50 = P^*$, and $P_c = 60$. Buyers carry 100% of the tax; no trade is lost, so DWL $= 0$; revenue $= 10 \times 100 = 1000$. The limiting case of "the less responsive side pays".` }),
          P({ title: 'Scaling the tax', q: md`In a market with linear demand and supply, a \$3 per-unit tax produces a DWL of \$9. What is the DWL of a \$6 tax? Of a \$1.50 tax?`,
            plan: plan('How does DWL scale with the tax?', 'With $t^2$: double the tax, four times the DWL', [
              ['In proportion to $t$', 'Both the height ($t$) and the base (lost quantity, proportional to $t$) grow.'],
              ['It does not change', 'More tax kills more trades.'],
              ['You need the curves', 'With linear curves the ratio is enough: DWL $= k t^2$ for some $k$.'],
            ], '$9 = k(3)^2 \\Rightarrow k = 1$; then DWL $= t^2$.'),
            parts: [N('\\text{DWL at }t = 6', 36), N('\\text{DWL at }t = 1.5', 2.25)],
            sol: md`DWL $= k t^2$ with $9 = 9k$, so $k = 1$. At \$6: $36$. At \$1.50: $2.25$. Halving the tax cuts the DWL to a quarter.` }),
          G('m3_po_incid', { need: 3 }),
          G('m3_po_twel', { need: 2 }),
        ],
      },
      // ================================================================ lesson 3
      {
        id: 'm3-po3', title: 'Price ceilings', ref: 'Lecture 17',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "the government sets a maximum price of \$18" | does it bind? | compare with $P^*$: binds only if **below** $P^*$ |
            | "calculate $Q^d$ and $Q^s$", "find the shortage" | both curves at the ceiling | shortage $= Q^d(P_{\max}) - Q^s(P_{\max})$ |
            | "how many units are traded / sold?" | which side is short | $Q^s(P_{\max})$: sellers |
            | "calculate CS, PS, DWL, assuming efficient rationing" | areas cut off at $Q^s$ | find the demand price at $Q^s$ first |
            | "a ceiling of \$25" when $P^* = 20$ | a non-binding ceiling | nothing changes |
            | "why might welfare be even lower?" | how the scarce units are handed out | lines, lotteries, favoritism: inefficient rationing |
          `),
          RF(md`
            ### The story: capping the price of tacos

            The city decides tacos are too expensive and passes a law: no taco may sell for more than $P_{\max}$ dollars. That is a **price ceiling**: a maximum legal price. (Rent control is the classic real one.)

            Same market as before: $Q^d = 200 - 5P$, $Q^s = 5P$, with $P^* = 20$, $Q^* = 100$.

            **First question, always: does the ceiling bind?** Suppose $P_{\max} = 25$. The market price of \$20 is already below \$25, so it is legal. Nobody changes anything. A ceiling **above** $P^*$ is **not binding**.

            [[fig:nb]]

            A ceiling matters only when it is **below** $P^*$: then the market price becomes illegal and the price is forced down to the ceiling.
          `, { nb: { svg: ceilNBFig, cap: 'A ceiling of 25 sits above the equilibrium price 20. The market already trades below the cap, so nothing changes.' } }),
          R(md`
            ### A binding ceiling: who gets the tacos?

            Now set $P_{\max} = 18$. At \$18:

            $$Q^d(18) = 200 - 5(18) = 200 - 90 = 110, \qquad Q^s(18) = 5(18) = 90$$

            Buyers want 110 tacos. Trucks offer 90. The difference is the **shortage**:

            $$\text{shortage} = Q^d - Q^s = 110 - 90 = 20$$

            How many tacos actually change hands? A trade needs a willing buyer **and** a willing seller. Nobody can force a truck to make more than it wants at \$18, so only 90 tacos exist. The **short side** of the market decides:

            $$Q_{\text{traded}} = \min(Q^d, Q^s) = Q^s(P_{\max}) = 90$$

            !!method The ceiling recipe
              **Move 1.** Find $P^*$, $Q^*$.

              **Move 2.** Binding? Only if $P_{\max} < P^*$. If not, stop: nothing changes.

              **Move 3.** Plug $P_{\max}$ into both curves; shortage $= Q^d - Q^s$.

              **Move 4.** Traded quantity $= Q^s(P_{\max})$.

              **Move 5.** For welfare, find the **demand price at the traded quantity**, $P_D(Q^s)$. Every area has a corner there.

            !!trap The shortage is not the lost trade
              The shortage (20) compares $Q^d$ with $Q^s$ **at the ceiling**. The trades lost compare $Q^*$ with $Q^s$: $100 - 90 = 10$. The DWL base is the lost trades, 10.
          `),
          Q(md`$P^* = 20$. The government imposes a price ceiling of \$25. The quantity traded…`, ['stays at $Q^*$', 'falls to $Q^s(25)$', 'rises to $Q^d(25)$', 'falls to zero'], 0,
            [null, 'At \\$25 sellers would offer more than buyers want; the market just stays at \\$20, which is legal.', 'A ceiling cannot push the price up; the market price 20 is already under the cap.', 'Nothing forbids trading at \\$20.'],
            md`A ceiling above the equilibrium price is not binding. Check this first on every ceiling problem.`),
          Q(md`A binding ceiling. Buyers want 130 units, sellers offer 70. How many units are traded?`, ['70', '130', '100', '60'], 0,
            [null, 'Sellers cannot be forced to supply 130 at the capped price.', 'Averaging is not how markets work: trades need both sides.', 'That is the shortage, the units that **cannot** be bought.'],
            md`The short side decides: sellers supply 70, so 70 trade.`),
          RF(md`
            ### Welfare under the ceiling (efficient rationing)

            "Efficient rationing" means the 90 scarce tacos go to the 90 buyers who value them **most**. The course assumes this unless it says otherwise.

            **Move 5: the key corner.** The 90th buyer values a taco at the demand height at $Q = 90$:

            $$P_D(90) = 40 - \frac{90}{5} = 22$$

            **Consumer surplus** is the area under demand and above the price paid (\$18), over the 90 units bought. Split it at height 22:

            $$CS = \underbrace{\tfrac12 \times 90 \times (40 - 22)}_{\text{triangle}} + \underbrace{(22 - 18) \times 90}_{\text{rectangle}} = 810 + 360 = 1170$$

            **Producer surplus** is the area above supply and below the price received (\$18), over the 90 units sold:

            $$PS = \tfrac12 \times 90 \times (18 - 0) = 810$$

            **Deadweight loss** is the triangle between demand and supply over the lost units 90 to 100. Its height at $Q = 90$ is demand minus supply there, $22 - 18$:

            $$\text{DWL} = \tfrac12 \times (100 - 90) \times (22 - 18) = 20$$

            [[fig:c18]]

            | Measure | No ceiling | Ceiling \$18 | Change |
            |---|---|---|---|
            | Consumer surplus | 1000 | 1170 | $+170$ |
            | Producer surplus | 1000 | 810 | $-190$ |
            | Total welfare | 2000 | 1980 | $-20$ |

            !!intuition Where the numbers come from
              On the 90 units still sold, buyers now pay \$2 less: a **transfer** of $2 \times 90 = 180$ from trucks to buyers. On the 10 lost units, buyers lose a small triangle (10) and trucks lose a small triangle (10). Buyers: $+180 - 10 = +170$. Trucks: $-180 - 10 = -190$. Society: $-20$.
          `, { c18: { svg: ceil18Fig, cap: 'Ceiling at 18. Blue: CS (triangle above 22 plus the rectangle from 18 to 22). Green: PS below 18. Red: DWL over the lost units 90 to 100, height 22 − 18. The shortage is 110 − 90.' } }),
          Q(md`Under a binding ceiling, the height of the DWL triangle at the traded quantity is…`, ['the demand price at $Q^s$ minus the ceiling', '$P^*$ minus the ceiling', 'the ceiling minus zero', 'the demand price at $Q^d$ minus the ceiling'], 0,
            [null, 'The triangle\'s point is at $(Q^*, P^*)$, but its tall side is at the traded quantity, where demand is **above** $P^*$.', 'That is the PS triangle\'s height.', 'At $Q^d$ the demand price equals the ceiling: height zero.'],
            md`Lecture 17, ceiling 16: height $24 - 16 = 8$, not $20 - 16 = 4$.`),
          P({ title: 'Your turn (Lecture 17): a ceiling at \\$16', q: md`$Q^d = 200 - 5P$, $Q^s = 5P$. The ceiling drops to \$16. Find $Q^d$, $Q^s$, the shortage, the units traded, and the DWL (efficient rationing).`,
            plan: [
              plan('Does it bind?', 'Yes: 16 is below $P^* = 20$', [
                ['No: ceilings only matter above $P^*$', 'Backwards. A cap above the market price is harmless; a cap below it bites.'],
                ['Only if $Q^d > 200$', 'Binding is about the price, not about a quantity threshold.'],
                ['Cannot tell without the shortage', 'Compare prices first; the shortage follows.'],
              ], 'Plug 16 into both curves.'),
              plan('What is the height of the DWL triangle?', 'Demand price at $Q^s = 80$ minus 16: $24 - 16$', [
                ['$20 - 16$', 'At the traded quantity, 80, demand is at 24, not 20. The triangle is taller than the price drop.'],
                ['$16$', 'That is the PS triangle\'s height.'],
                ['$40 - 16$', 'That is the full height of demand above the ceiling at $Q = 0$.'],
              ], '$P_D(80) = 40 - 80/5 = 24$. DWL $= \\tfrac12 \\times (100 - 80) \\times (24 - 16)$.'),
            ],
            parts: [N('Q^d', 120), N('Q^s', 80), N('\\text{shortage}', 40), N('Q\\text{ traded}', 80), N('\\text{DWL}', 80)],
            sol: md`
              **Move 2.** $16 < 20$: binding. **Move 3.** $Q^d = 200 - 80 = 120$, $Q^s = 80$, shortage $= 40$. **Move 4.** 80 traded.

              **Move 5.** $P_D(80) = 40 - 16 = 24$. DWL $= \tfrac12 \times (100 - 80) \times (24 - 16) = \tfrac12 \times 20 \times 8 = 80$.

              Welfare: $CS = \tfrac12(80)(40 - 24) + (24 - 16)(80) = 640 + 640 = 1280$; $PS = \tfrac12(80)(16) = 640$; $W = 1920 = 2000 - 80$ ✓.
            ` }),
          RF(md`
            ### The \$16 ceiling on the graph

            [[fig:c16]]

            Compare with the \$18 ceiling: the shortage doubled (20 to 40), the lost trades doubled (10 to 20), and the DWL quadrupled (20 to 80), because the triangle grew in both directions. Same square law as the tax.

            !!key A ceiling and a tax that trade the same quantity do the same damage
              The \$16 ceiling leaves 80 trades. A tax of \$8 also leaves 80 trades ($Q = 100 - 2.5 \times 8$). Both have DWL 80: the lost triangle depends only on **which units stop trading**. What differs is who gets the rest: with the tax the government collects revenue; with the ceiling the buyers who get tacos keep it.
          `, { c16: { svg: ceil16Fig, cap: 'Ceiling at 16. Traded quantity 80 (sellers are short). The DWL triangle is 20 wide and 24 − 16 = 8 tall at Q = 80.' } }),
          R(md`
            ### Does a ceiling help buyers? Usually, but not always

            The \$18 ceiling raised CS by 170, the \$16 ceiling by 280. Push it further and buyers start to lose: at \$4 only $5 \times 4 = 20$ tacos are made. The buyers who get one are thrilled, but 80 buyers who used to eat tacos get none.

            $$P_D(20) = 40 - 4 = 36, \qquad CS = \tfrac12(20)(40 - 36) + (36 - 4)(20) = 40 + 640 = 680 < 1000$$

            ### Rationing: who gets the scarce units?

            With a shortage, the price can no longer decide who buys. Something else does: **waiting lines**, search effort, favoritism, **lotteries**, or informal resale. Our CS numbers assumed the scarce tacos go to the buyers who value them most. If instead a lottery hands them out, some go to buyers who value a taco at \$17 while others who would pay \$35 go without. Time spent in line is also burned value. So with real-world rationing:

            !!trap The DWL formula is the minimum damage
              Inefficient rationing makes CS smaller and the welfare loss **larger** than $\tfrac12 \times \text{lost units} \times \text{gap}$.
          `),
          Q(md`The government lowers a binding ceiling from \$18 to \$12 in the Lecture 17 market. Consumer surplus…`, ['can rise or fall: buyers pay less, but fewer units are made', 'always rises: buyers pay less', 'always falls: there is a shortage', 'is unchanged'], 0,
            [null, 'Each remaining unit is cheaper, but units disappear. At \\$12 CS is 1320 (up); at \\$4 it is 680 (down).', 'Shortages alone do not mean a loss to buyers as a group; it depends on the two effects.', 'Both the price and the quantity change.'],
            md`Two forces: a lower price on the units that still trade (gain), fewer units traded (loss). Close to $P^*$ the gain wins; far below it the loss wins.`),
          Q(md`Tickets for a concert are capped below the market price and handed out by lottery. Compared with the DWL formula, the true welfare loss is…`, ['larger', 'smaller', 'the same', 'zero, because the price is fair'], 0,
            [null, 'The formula already assumes the best possible allocation; any other allocation only adds loss.', 'Only if the lottery happened to pick exactly the highest-value fans.', 'A capped price destroys trades whatever we think of fairness.'],
            md`Efficient rationing gives the **smallest** possible loss. A lottery gives some tickets to low-value fans, so welfare falls further.`),
          R(md`
            ### Spot it: plan only
          `),
          P({ q: md`The equilibrium price of apartments is \$1,200 a month. The city caps rent at \$1,500.`,
            plan: plan('What happens?', 'Nothing: the cap is above the market rent, so it does not bind', [
              ['A shortage of $Q^d(1500) - Q^s(1500)$', 'At \\$1,500 there would be **excess supply**; but the market rent stays at \\$1,200, which is legal.'],
              ['Rents rise to \\$1,500', 'A ceiling is a maximum, not a target.'],
              ['Fewer apartments are rented', 'Only a binding cap cuts quantity.'],
            ], 'Binding only if $P_{\\max} < P^*$.') }),
          P({ q: md`A binding ceiling of \$6 is set. At \$6, $Q^d = 90$ and $Q^s = 50$; without the ceiling $Q^* = 70$.`,
            plan: plan('How many units are traded?', '50: sellers are the short side', [
              ['90', 'Buyers want 90 but only 50 are offered.'],
              ['70', 'At \\$6 sellers will not supply the old 70.'],
              ['40', 'That is the shortage.'],
            ], 'Traded $= Q^s(P_{\\max}) = 50$. Lost trades $= 70 - 50 = 20$.') }),
          P({ q: md`Same ceiling. You are asked for the deadweight loss.`,
            plan: plan('Which formula?', '$\\tfrac12 \\times (Q^* - Q^s) \\times (P_D(Q^s) - P_{\\max})$', [
              ['$\\tfrac12 \\times (Q^d - Q^s) \\times (P^* - P_{\\max})$', 'The base is the lost trades ($Q^* - Q^s$), not the shortage, and the height is measured at $Q^s$ where demand is above $P^*$.'],
              ['$(Q^* - Q^s) \\times (P^* - P_{\\max})$', 'A triangle, and the height is wrong.'],
              ['$\\tfrac12 \\times (Q^* - Q^s) \\times (P^* - P_{\\max})$', 'Right base, wrong height: at $Q^s$ demand is above $P^*$.'],
            ], 'Find the demand price at $Q = 50$ first.') }),
          P({ q: md`Same ceiling, efficient rationing. You need consumer surplus.`,
            plan: plan('Which area?', 'Under demand and above \\$6, over the 50 units bought: a triangle above $P_D(50)$ plus a rectangle from 6 to $P_D(50)$', [
              ['A triangle under demand above \\$6, over 90 units', 'Only 50 units are bought; the other 40 buyers get nothing.'],
              ['The old CS triangle above $P^*$', 'The price and the quantity both changed.'],
              ['A triangle above $P_D(50)$ only', 'That leaves out the rectangle: the buyers of those 50 units pay only \\$6, well below $P_D(50)$.'],
            ], 'CS $= \\tfrac12 \\times 50 \\times (\\text{choke} - P_D(50)) + (P_D(50) - 6) \\times 50$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'A steep cap', q: md`Demand is $Q^d = 300 - 10P$ and supply is $Q^s = 20P$. A price ceiling of \$7 is imposed (efficient rationing).`,
            plan: plan('After checking that it binds, what is the key extra number for the welfare areas?', 'The demand price at $Q^s(7)$', [
              ['The supply price at $Q^d(7)$', 'Units beyond $Q^s$ are never produced; that point is irrelevant.'],
              ['The shortage', 'It is asked for, but no area has a corner at it.'],
              ['The choke price only', 'You need it for CS, but the DWL height and the CS rectangle need $P_D(Q^s)$.'],
            ], '$Q^s(7) = 140$; $P_D(140) = (300 - 140)/10 = 16$.'),
            parts: [N('P^*', 10), N('\\text{shortage}', 90), N('Q\\text{ traded}', 140), N('\\text{DWL}', 270), N('\\Delta CS', 240), N('\\Delta PS', -510)],
            sol: md`
              **Move 1.** $300 - 10P = 20P \Rightarrow P^* = 10$, $Q^* = 200$. Choke price $300/10 = 30$.

              **Moves 2–4.** $7 < 10$: binds. $Q^d = 230$, $Q^s = 140$, shortage 90, 140 traded.

              **Move 5.** $P_D(140) = 16$. DWL $= \tfrac12(200 - 140)(16 - 7) = \tfrac12(60)(9) = 270$.

              CS: before $\tfrac12(200)(30 - 10) = 2000$; after $\tfrac12(140)(30 - 16) + (16 - 7)(140) = 980 + 1260 = 2240$: $+240$. PS: before $\tfrac12(200)(10) = 1000$; after $\tfrac12(140)(7) = 490$: $-510$. Check: $240 - 510 = -270$ ✓.
            ` }),
          P({ title: 'Rent control', q: md`Apartments: $Q^d = 1000 - 2P$, $Q^s = 3P - 500$ ($P$ = monthly rent). (a) The city caps rent at \$350. (b) It then lowers the cap to \$250.`,
            plan: plan('Part (a) first: what do you check?', 'Whether \\$350 is below the market rent', [
              ['Plug \\$350 into both curves and report the shortage', 'If the cap is above the market rent, there is no shortage at all.'],
              ['Assume every ceiling binds', 'That gives a "shortage" that is negative: a sure sign the cap is above $P^*$.'],
              ['Use the supply curve only', 'You need both curves to find the market rent.'],
            ], '$1000 - 2P = 3P - 500 \\Rightarrow P^* = 300$. So \\$350 does not bind; \\$250 does.'),
            parts: [N('P^*', 300), N('Q\\text{ traded at cap }350', 400), N('\\text{shortage at cap }250', 250), N('Q\\text{ traded at cap }250', 250), N('\\text{DWL at cap }250', 9375)],
            sol: md`
              $1000 - 2P = 3P - 500 \Rightarrow 1500 = 5P \Rightarrow P^* = 300$, $Q^* = 400$.

              (a) $350 > 300$: not binding. 400 apartments rent at \$300.

              (b) $250 < 300$: binding. $Q^d = 1000 - 500 = 500$, $Q^s = 750 - 500 = 250$. Shortage 250; 250 apartments rented. $P_D(250) = (1000 - 250)/2 = 375$. DWL $= \tfrac12(400 - 250)(375 - 250) = \tfrac12(150)(125) = 9375$.
            ` }),
          P({ title: 'Ceiling with inverse curves', q: md`Inverse demand is $P = 80 - Q$ and inverse supply is $P = 20 + Q/2$. A price ceiling of \$35 is imposed.`,
            plan: plan('How do you get $Q^s$ at the ceiling from an inverse supply?', 'Set the supply price equal to the ceiling: $35 = 20 + Q/2$', [
              ['Plug $P = 35$ into $20 + Q/2$', 'There is no $Q$ to plug a price into; set the supply **height** equal to 35 and solve for $Q$.'],
              ['Set $35 = 80 - Q$', 'That is $Q^d$ at the ceiling, the long side.'],
              ['Use the equilibrium quantity', 'Sellers will not supply $Q^*$ at a price below $P^*$.'],
            ], '$Q^s = 30$, $Q^d = 45$. The demand price at 30 is $80 - 30 = 50$.'),
            parts: [N('Q^*', 40), N('Q^s', 30), N('\\text{shortage}', 15), N('\\text{DWL}', 75)],
            sol: md`
              **Move 1.** $80 - Q = 20 + Q/2 \Rightarrow 60 = 1.5Q \Rightarrow Q^* = 40$, $P^* = 40$. $35 < 40$: binds.

              **Move 3.** Supply: $35 = 20 + Q/2 \Rightarrow Q^s = 30$. Demand: $35 = 80 - Q \Rightarrow Q^d = 45$. Shortage 15.

              **Move 5.** $P_D(30) = 50$. DWL $= \tfrac12(40 - 30)(50 - 35) = \tfrac12(10)(15) = 75$.
            ` }),
          P({ title: 'A cap that hurts buyers', q: md`Lecture 17 market, $Q^d = 200 - 5P$, $Q^s = 5P$. The city sets a ceiling of \$4 (efficient rationing).`,
            plan: plan('Buyers pay \\$16 less per taco. Can consumer surplus still fall?', 'Yes: only 20 tacos are made, so most buyers get none', [
              ['No: a lower price always helps buyers', 'It helps the buyers who still get tacos; the 80 who lose their tacos are worse off.'],
              ['No: CS rises whenever $Q^d$ rises', 'CS counts only units actually bought.'],
              ['Yes, but only if rationing is inefficient', 'Even with efficient rationing the lost units can outweigh the cheaper ones.'],
            ], '$Q^s = 20$; $P_D(20) = 36$; CS $= \\tfrac12(20)(4) + (36 - 4)(20)$.'),
            parts: [N('Q\\text{ traded}', 20), N('CS', 680), N('\\Delta CS', -320), N('\\text{DWL}', 1280)],
            sol: md`$Q^s = 20$, $P_D(20) = 40 - 4 = 36$. $CS = \tfrac12(20)(40 - 36) + (36 - 4)(20) = 40 + 640 = 680$, down 320 from 1000. DWL $= \tfrac12(100 - 20)(36 - 4) = \tfrac12(80)(32) = 1280$. Producers keep only $\tfrac12(20)(4) = 40$.` }),
          G('m3_po_ceil', { need: 3 }),
        ],
      },
      // ================================================================ lesson 4
      {
        id: 'm3-po4', title: 'Price floors', ref: 'Lecture 17',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "the government sets a minimum price of \$22" | does it bind? | compare with $P^*$: binds only if **above** $P^*$ |
            | "find the excess supply", "the surplus" | both curves at the floor | excess supply $= Q^s(P_{\min}) - Q^d(P_{\min})$ |
            | "how many units are sold?" | which side is short | $Q^d(P_{\min})$: buyers |
            | "calculate CS, PS, DWL" | areas cut off at $Q^d$ | find the **supply** price at $Q^d$ first |
            | "a minimum wage of \$13" | a floor in a labor market | unemployment $= L^s - L^d$ at the wage; employment $= L^d$ |
            | "compare with the ceiling" | mirror images | ceiling: trade $Q^s$; floor: trade $Q^d$ |
          `),
          RF(md`
            ### The story: a guaranteed minimum price

            Now the city worries about the taco trucks' incomes and passes the opposite law: no taco may sell for **less** than $P_{\min}$. That is a **price floor**, a minimum legal price. Minimum wages and some farm price programs are floors.

            Same market: $Q^d = 200 - 5P$, $Q^s = 5P$, $P^* = 20$, $Q^* = 100$.

            **Does it bind?** A floor of \$18 is below the market price: trading at \$20 is legal, so nothing changes. A floor binds only when it is **above** $P^*$.

            [[fig:nb]]
          `, { nb: { svg: floorNBFig, cap: 'A floor of 18 sits below the equilibrium price 20. The market already trades above the floor, so nothing changes.' } }),
          R(md`
            ### A binding floor: who is short now?

            Set $P_{\min} = 22$. At \$22:

            $$Q^d(22) = 200 - 5(22) = 90, \qquad Q^s(22) = 5(22) = 110$$

            Trucks want to sell 110; buyers want only 90. The difference is **excess supply**:

            $$\text{excess supply} = Q^s - Q^d = 110 - 90 = 20$$

            Buyers cannot be forced to buy. So at most 90 tacos are sold. Now the **buyers** are the short side:

            $$Q_{\text{sold}} = \min(Q^d, Q^s) = Q^d(P_{\min}) = 90$$

            !!method The floor recipe
              **Move 1.** Find $P^*$, $Q^*$.

              **Move 2.** Binding? Only if $P_{\min} > P^*$.

              **Move 3.** Plug $P_{\min}$ into both curves; excess supply $= Q^s - Q^d$.

              **Move 4.** Quantity sold $= Q^d(P_{\min})$.

              **Move 5.** For welfare, find the **supply price at the quantity sold**, $P_S(Q^d)$: what the last seller actually needs.

            !!key Which side is short?
              A ceiling makes **selling** unattractive, so sellers are short and $Q^s$ trades. A floor makes **buying** unattractive, so buyers are short and $Q^d$ trades. Either way: the smaller of $Q^d$ and $Q^s$ at the policy price.
          `),
          Q(md`$P^* = 20$. A price floor of \$18 is imposed. The quantity traded…`, ['stays at $Q^*$', 'falls to $Q^d(18)$', 'rises to $Q^s(18)$', 'becomes the excess supply'], 0,
            [null, 'At \\$18 buyers would want more than sellers offer, but the market just stays at \\$20, which is legal.', 'A floor cannot push the price down; 20 is already above it.', 'There is no excess supply when the floor does not bind.'],
            md`A floor below the equilibrium price is not binding.`),
          Q(md`A binding floor. At the floor, $Q^d = 60$ and $Q^s = 140$. Units sold:`, ['60', '140', '80', '100'], 0,
            [null, 'Sellers would like to sell 140, but buyers take only 60.', 'That is the excess supply.', 'The market does not split the difference.'],
            md`Buyers are the short side under a floor: 60 sold.`),
          RF(md`
            ### Welfare under the floor

            The lecture assumes sellers produce only the 90 tacos they can sell (no wasted output). Then every area is cut off at $Q = 90$.

            **Move 5: the key corner.** The seller of the 90th taco needs only the supply height at $Q = 90$:

            $$P_S(90) = \frac{90}{5} = 18$$

            **Consumer surplus**: under demand, above the \$22 paid, over 90 units.
            $$CS = \tfrac12 \times 90 \times (40 - 22) = 810$$

            **Producer surplus**: above supply, below the \$22 received, over 90 units. Split it at height 18:
            $$PS = \underbrace{\tfrac12 \times 90 \times (18 - 0)}_{\text{triangle}} + \underbrace{(22 - 18) \times 90}_{\text{rectangle}} = 810 + 360 = 1170$$

            **DWL**: the triangle over the lost units 90 to 100, with height $22 - 18$ at $Q = 90$:
            $$\text{DWL} = \tfrac12 \times (100 - 90) \times (22 - 18) = 20$$

            [[fig:f22]]

            | Measure | No floor | Floor \$22 | Change |
            |---|---|---|---|
            | Consumer surplus | 1000 | 810 | $-190$ |
            | Producer surplus | 1000 | 1170 | $+170$ |
            | Total welfare | 2000 | 1980 | $-20$ |

            !!trap If the extra output is actually produced
              If trucks really cook all 110 tacos and 20 go in the trash, they also pay for 20 tacos nobody eats, and welfare falls by more. The course numbers assume production equals sales under an ordinary floor. (A price **support**, next lesson, is the case where the extra output is produced and the government buys it.)
          `, { f22: { svg: floor22Fig, cap: 'Floor at 22. Blue: CS above 22. Green: PS (triangle below 18 plus the rectangle from 18 to 22). Red: DWL over the lost units 90 to 100, height 22 − 18. Excess supply 110 − 90.' } }),
          Q(md`Under a binding floor, the height of the DWL triangle at the quantity sold is…`, ['the floor minus the supply price at $Q^d$', 'the floor minus $P^*$', 'the demand price at $Q^d$ minus the supply price at $Q^s$', 'the floor itself'], 0,
            [null, 'At the quantity sold, supply is **below** $P^*$, so the gap is bigger than the price rise.', 'Those two points are at different quantities; the triangle\'s tall side sits at one quantity, $Q^d$.', 'That is the full height of the PS region at $Q^d$.'],
            md`At $Q^d$, buyers value the last unit at the floor and sellers need only $P_S(Q^d)$. Lecture 17, floor 24: $24 - 16 = 8$.`),
          P({ title: 'Your turn (Lecture 17): a floor at \\$24', q: md`$Q^d = 200 - 5P$, $Q^s = 5P$. The floor rises to \$24. Find $Q^d$, $Q^s$, the excess supply, the units sold, CS, PS and the DWL.`,
            plan: [
              plan('Which quantity is sold?', '$Q^d(24) = 80$: buyers are the short side', [
                ['$Q^s(24) = 120$', 'Sellers want to sell 120, but only 80 are bought.'],
                ['$Q^* = 100$', 'Buyers will not take 100 at \\$24.'],
                ['$40$', 'That is the excess supply.'],
              ], 'Every area is cut off at $Q = 80$.'),
              plan('What is the height of the DWL triangle?', '$24 - P_S(80) = 24 - 16$', [
                ['$24 - 20$', 'At $Q = 80$ supply is at 16, not 20.'],
                ['$24$', 'That is the height of the floor above zero.'],
                ['$P_D(80) - 20$', 'The triangle\'s tall side runs from the floor (= demand price at 80) down to the supply price at 80.'],
              ], 'DWL $= \\tfrac12 \\times (100 - 80) \\times (24 - 16)$.'),
            ],
            parts: [N('Q^d', 80), N('Q^s', 120), N('\\text{excess supply}', 40), N('Q\\text{ sold}', 80), N('CS', 640), N('PS', 1280), N('\\text{DWL}', 80)],
            sol: md`
              **Move 2.** $24 > 20$: binding. **Move 3.** $Q^d = 200 - 120 = 80$, $Q^s = 120$, excess supply 40. **Move 4.** 80 sold.

              **Move 5.** $P_S(80) = 16$. $CS = \tfrac12(80)(40 - 24) = 640$. $PS = \tfrac12(80)(16) + (24 - 16)(80) = 640 + 640 = 1280$. DWL $= \tfrac12(20)(8) = 80$. Check: $640 + 1280 = 1920 = 2000 - 80$ ✓.
            ` }),
          RF(md`
            ### The \$24 floor on the graph, and the mirror image

            [[fig:f24]]

            Put the ceilings and floors of this market side by side:

            | Policy | Units traded | CS | PS | W | DWL |
            |---|---|---|---|---|---|
            | ceiling \$18 | 90 | 1170 | 810 | 1980 | 20 |
            | floor \$22 | 90 | 810 | 1170 | 1980 | 20 |
            | ceiling \$16 | 80 | 1280 | 640 | 1920 | 80 |
            | floor \$24 | 80 | 640 | 1280 | 1920 | 80 |

            In this market the curves are mirror images (both slopes 5), so a ceiling $k$ dollars below $P^*$ and a floor $k$ dollars above it trade the same quantity and lose the same DWL; only the winner flips. A ceiling hands the rectangle to buyers, a floor hands it to sellers.

            In any market the rule is the same as for the tax: **the DWL depends only on how many units stop trading.** With inverse demand $P = 80 - Q$ and supply $P = 20 + Q/2$, a ceiling of \$35 and a floor of \$50 both leave 30 trades, and both lose 75.
          `, { f24: { svg: floor24Fig, cap: 'Floor at 24. Sold 80 (buyers are short). PS gets the rectangle from 16 to 24; the DWL triangle is 20 wide and 24 − 16 = 8 tall.' } }),
          Q(md`At a binding floor of \$24 there is excess supply of 40, but the DWL base is only 20. Why?`, ['the base is the lost trades $Q^* - Q^d$, not $Q^s - Q^d$', 'the DWL formula halves the excess supply', 'half of the excess supply is sold anyway', 'it is a coincidence of this market'], 0,
            [null, 'The ½ in the formula comes from the triangle shape, not from halving the base.', 'None of the excess supply is sold under an ordinary floor.', 'It is general: the units 100 to 120 were never traded even before the floor.'],
            md`Units 80 to 100 used to trade and now do not: that is the loss. Units 100 to 120 were never worth making; offering them at \$24 does not create surplus.`),
          Q(md`A binding floor raises producer surplus…`, ['when the gain on units still sold beats the loss on units no longer sold', 'always', 'never', 'only if demand is elastic'], 0,
            [null, 'A very high floor sells so few units that sellers lose overall.', 'At \\$22 and \\$24 in Lecture 17 PS rises.', 'Elasticity matters through those two effects, not as a separate rule.'],
            md`Same two forces as the ceiling, with the roles swapped. Lecture 17: floor 22 gives $+170$, floor 24 gives $+280$; a floor close to the choke price would leave sellers almost nothing.`),
          R(md`
            ### Spot it: plan only
          `),
          P({ q: md`The market price of wheat is \$5 a bushel. The government sets a floor of \$3.`,
            plan: plan('What happens?', 'Nothing: the floor is below the market price', [
              ['Excess demand of $Q^d(3) - Q^s(3)$', 'The price stays at \\$5, which is legal; nobody trades at \\$3.'],
              ['The price falls to \\$3', 'A floor is a minimum, not a target.'],
              ['Excess supply appears', 'Only a floor above $P^*$ creates excess supply.'],
            ], 'Binding only if $P_{\\min} > P^*$.') }),
          P({ q: md`A binding floor. You are asked for producer surplus (sellers produce only what sells).`,
            plan: plan('Which area?', 'Above supply and below the floor, over the $Q^d$ units sold', [
              ['Above supply and below the floor, over $Q^s$ units', 'Only $Q^d$ units are sold; the rest are never made (or never paid for).'],
              ['The old PS triangle below $P^*$', 'The price and quantity both changed.'],
              ['A triangle below $P_S(Q^d)$ only', 'That forgets the rectangle: sellers get the floor, well above $P_S(Q^d)$, on every unit sold.'],
            ], 'PS $= \\tfrac12 \\times Q^d \\times (P_S(Q^d) - \\text{supply intercept}) + (P_{\\min} - P_S(Q^d)) \\times Q^d$.') }),
          P({ q: md`A binding floor; you need the deadweight loss.`,
            plan: plan('Which formula?', '$\\tfrac12 \\times (Q^* - Q^d) \\times (P_{\\min} - P_S(Q^d))$', [
              ['$\\tfrac12 \\times (Q^s - Q^d) \\times (P_{\\min} - P^*)$', 'The base is the lost trades $Q^* - Q^d$, and the height is measured at $Q^d$.'],
              ['$\\tfrac12 \\times (Q^* - Q^d) \\times (P_{\\min} - P^*)$', 'Right base, wrong height: at $Q^d$ supply is below $P^*$.'],
              ['$(Q^* - Q^d) \\times (P_{\\min} - P_S(Q^d))$', 'Right sides, but it is a triangle: half of that.'],
            ], 'Find the supply price at $Q^d$ first.') }),
          P({ q: md`Labor market: firms' demand for workers is $L^d = 1000 - 50w$, workers' supply is $L^s = 50w - 100$. A minimum wage of \$13 is set.`,
            plan: plan('How many people are employed, and how many unemployed?', 'Employed $= L^d(13)$; unemployed $= L^s(13) - L^d(13)$', [
              ['Employed $= L^s(13)$', 'Workers want those jobs, but firms hire only $L^d$.'],
              ['Unemployed $= L^* - L^d(13)$', 'That counts only jobs lost. Unemployment also includes new people drawn in by the higher wage.'],
              ['The wage is below equilibrium, so nothing changes', 'Check: $1000 - 50w = 50w - 100$ gives $w^* = 11 < 13$, so it binds.'],
            ], 'Here firms are the buyers. $L^d(13) = 350$, $L^s(13) = 550$: 350 employed, 200 unemployed.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'A floor with steep demand', q: md`Demand is $Q^d = 300 - 10P$ and supply is $Q^s = 20P$. A price floor of \$13 is imposed (sellers produce only what sells).`,
            plan: plan('After checking that it binds, what is the key extra number for the welfare areas?', 'The supply price at $Q^d(13)$', [
              ['The demand price at $Q^s(13)$', 'Units beyond $Q^d$ are not sold, so that point never matters.'],
              ['The excess supply', 'Asked for, but no area has a corner there.'],
              ['The choke price only', 'Needed for CS; but PS and DWL need $P_S(Q^d)$.'],
            ], '$Q^d(13) = 170$; $P_S(170) = 170/20 = 8.5$.'),
            parts: [N('\\text{excess supply}', 90), N('Q\\text{ sold}', 170), N('\\text{DWL}', 67.5), N('\\Delta CS', -555), N('\\Delta PS', 487.5)],
            sol: md`
              **Move 1.** $P^* = 10$, $Q^* = 200$; choke price 30. $13 > 10$: binds.

              **Moves 3–4.** $Q^d = 300 - 130 = 170$, $Q^s = 260$; excess supply 90; 170 sold.

              **Move 5.** $P_S(170) = 8.5$. DWL $= \tfrac12(200 - 170)(13 - 8.5) = \tfrac12(30)(4.5) = 67.5$.

              CS: $\tfrac12(170)(30 - 13) = 1445$, down 555 from 2000. PS: $\tfrac12(170)(8.5) + (13 - 8.5)(170) = 722.5 + 765 = 1487.5$, up 487.5 from 1000. Check: $-555 + 487.5 = -67.5$ ✓.
            ` }),
          P({ title: 'Minimum wage', q: md`Labor demand $L^d = 1000 - 50w$, labor supply $L^s = 50w - 100$ ($w$ = hourly wage). A minimum wage of \$13.`,
            plan: plan('Map the floor recipe onto the labor market: who is on the short side?', 'Firms (the buyers of labor): employment $= L^d(13)$', [
              ['Workers: employment $= L^s(13)$', 'Workers are the sellers here; under a floor the sellers are the long side.'],
              ['Neither: employment stays at $L^*$', 'At \\$13 firms hire fewer than at \\$11.'],
              ['Whoever is larger', 'Trades need both sides: the smaller one decides.'],
            ], 'Then DWL $= \\tfrac12(L^* - L^d)(13 - w_S(L^d))$, where $w_S$ is the supply wage.'),
            parts: [N('w^*', 11), N('L^*', 450), N('\\text{employed}', 350), N('\\text{unemployed}', 200), N('\\text{DWL}', 200)],
            sol: md`
              **Move 1.** $1000 - 50w = 50w - 100 \Rightarrow 1100 = 100w \Rightarrow w^* = 11$, $L^* = 450$. $13 > 11$: binds.

              **Moves 3–4.** $L^d = 1000 - 650 = 350$ employed; $L^s = 650 - 100 = 550$ want work; unemployment $= 200$.

              **Move 5.** The 350th worker would work for $w_S = (350 + 100)/50 = 9$. DWL $= \tfrac12(450 - 350)(13 - 9) = 200$.
            ` }),
          P({ title: 'Floor with inverse curves', q: md`Inverse demand $P = 80 - Q$, inverse supply $P = 20 + Q/2$. A floor of \$50.`,
            plan: plan('How do you get $Q^d$ at the floor from an inverse demand?', 'Set the demand price equal to the floor: $50 = 80 - Q$', [
              ['Set $50 = 20 + Q/2$', 'That gives $Q^s$, the long side.'],
              ['Use $Q^* = 40$', 'Buyers take fewer than 40 at a price above $P^*$.'],
              ['Subtract the floor from the choke price and halve it', 'There is no halving: demand drops one unit per dollar here.'],
            ], '$Q^d = 30$, $Q^s = 60$. Supply price at 30: $20 + 15 = 35$.'),
            parts: [N('Q\\text{ sold}', 30), N('\\text{excess supply}', 30), N('P_S(Q^d)', 35), N('\\text{DWL}', 75)],
            sol: md`$P^* = 40$, $Q^* = 40$; $50 > 40$ binds. $Q^d = 30$, $Q^s$: $50 = 20 + Q/2 \Rightarrow Q = 60$; excess 30. $P_S(30) = 35$. DWL $= \tfrac12(40 - 30)(50 - 35) = 75$, the same as the \$35 ceiling, which also left 30 trades.` }),
          P({ title: 'Two floors, one market', q: md`Lecture 17 market ($Q^d = 200 - 5P$, $Q^s = 5P$). (a) A floor of \$18. (b) A floor of \$26.`,
            plan: plan('Part (a): what is the first thing to say?', 'It does not bind: 18 is below $P^* = 20$', [
              ['Excess supply $Q^s(18) - Q^d(18)$', 'That is negative ($90 - 110$): the sign tells you the floor is below the market price.'],
              ['80 units are sold', 'Nothing changes; 100 are sold at \\$20.'],
              ['The DWL is the triangle above 18', 'A non-binding floor creates no DWL.'],
            ], 'For (b): $Q^d(26) = 70$, $Q^s(26) = 130$, $P_S(70) = 14$.'),
            parts: [N('Q\\text{ sold, floor }18', 100), N('Q\\text{ sold, floor }26', 70), N('\\text{excess supply, floor }26', 60), N('CS\\text{, floor }26', 490), N('PS\\text{, floor }26', 1330), N('\\text{DWL, floor }26', 180)],
            sol: md`
              (a) Not binding: 100 sold at \$20.

              (b) $Q^d = 200 - 130 = 70$, $Q^s = 130$, excess 60. $P_S(70) = 14$. $CS = \tfrac12(70)(40 - 26) = 490$. $PS = \tfrac12(70)(14) + (26 - 14)(70) = 490 + 840 = 1330$. DWL $= \tfrac12(30)(12) = 180$. Check $490 + 1330 = 1820 = 2000 - 180$ ✓.
            ` }),
          G('m3_po_floor', { need: 3 }),
        ],
      },
      // ================================================================ lesson 5
      {
        id: 'm3-po5', title: 'Price supports: the government buys the surplus', ref: 'Lecture 17 · DS9 Q3',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "a price support", "a floor at \$45 and the government promises to buy any excess supply" | a floor **plus** government purchases | producers $Q^s$, consumers $Q^d$, government the gap |
            | "how many units will producers sell?" | supply at the support price | $Q^s(P_{\min})$, not $Q^d$ |
            | "how many are purchased by consumers? by the government?" | split the producers' sales | $Q^d(P_{\min})$ and $Q^s - Q^d$ |
            | "what is the government expenditure?" | price times units bought | $G = P_{\min} \times (Q^s - Q^d)$ |
            | "change in CS", "change in PS" | triangles cut at the support price | CS over $Q^d$ units, PS over $Q^s$ units |
            | "change in social surplus" | the welfare table with a $G$ row | $SS = CS + PS - G$ |
            | "how is this different from an ordinary floor?" | who sells what | ordinary floor: producers sell only $Q^d$ |
          `),
          R(md`
            ### The story: a farm program

            DS9's commodity market: $Q^d = 600 - 10P$, $Q^s = 10P$. With no policy (DS9 Q2):

            $$600 - 10P = 10P \;\Rightarrow\; P^* = 30, \qquad Q^* = 300$$
            $$CS = \tfrac12 \times 300 \times (60 - 30) = 4500, \qquad PS = \tfrac12 \times 300 \times 30 = 4500, \qquad SS = 9000$$

            (60 is the choke price: $600 - 10P = 0$ at $P = 60$.)

            Farmers lobby for help. The government announces: **the price will be \$45, and we will buy any output consumers do not buy.** That is a **price support**: a floor plus a promise to purchase the leftovers.

            Think about one farmer. Under an ordinary floor she worries: "if I grow more, who will buy it?" Under the support she does not: every bushel sells at \$45, to a consumer or to the government. So she grows as much as \$45 calls for, **all the way out along her supply curve**.

            Consumers still pay \$45, so they buy only what demand says at \$45. The government buys the rest.
          `),
          RF(md`
            ### Worked example (DS9 Q3): a support at \$45

            **Move 1: binding?** $45 > P^* = 30$: yes.

            **Move 2: producers sell** (DS9 Q3a)
            $$Q^s(45) = 10 \times 45 = 450$$

            **Move 3: consumers buy** (DS9 Q3b)
            $$Q^d(45) = 600 - 10 \times 45 = 150$$

            **Move 4: the government buys the gap and pays the support price for each unit** (DS9 Q3b–c)
            $$450 - 150 = 300 \text{ units}, \qquad G = 45 \times 300 = 13{,}500$$

            [[fig:cp]]
          `, { cp: { svg: supCSPSFig, cap: 'Support at 45. Blue: CS above 45 over the 150 units consumers buy. Green: PS below 45 over all 450 units producers sell. The government buys the 300 units in between.' } }),
          RF(md`
            **Move 5: consumer surplus** (DS9 Q3d). Consumers buy 150 units at \$45:
            $$CS = \tfrac12 \times 150 \times (60 - 45) = 1125, \qquad \Delta CS = 1125 - 4500 = -3375$$

            **Move 6: producer surplus** (DS9 Q3e). Producers sell **450** units at \$45, so the PS triangle runs out to 450:
            $$PS = \tfrac12 \times 450 \times (45 - 0) = 10{,}125, \qquad \Delta PS = 10{,}125 - 4500 = +5625$$

            **Move 7: social surplus** (DS9 Q3f). The government's spending is paid by taxpayers, and the crop it buys is counted as worth nothing to anyone, so it enters as **minus** $G$:

            $$SS = CS + PS - G = 1125 + 10{,}125 - 13{,}500 = -2250$$

            | Surplus | Before | After | Change |
            |---|---|---|---|
            | CS | 4500 | 1125 | $-3375$ |
            | PS | 4500 | 10,125 | $+5625$ |
            | G | 0 | $-13{,}500$ | $-13{,}500$ |
            | SS | 9000 | $-2250$ | $-11{,}250$ |

            [[fig:g]]

            !!trap Two places students slip
              PS uses **$Q^s$** (450 units sold), not $Q^d$. And $G$ is **subtracted** in social surplus: unlike tax revenue, it is money going out.
          `, { g: { svg: supGovFig, cap: 'Government spending: 45 per unit on the 300 units between Q_d = 150 and Q_s = 450, a rectangle of 13,500.' } }),
          Q(md`Under a price support at $P_{\min}$, producers sell…`, ['$Q^s(P_{\\min})$', '$Q^d(P_{\\min})$', '$Q^*$', '$Q^s - Q^d$'], 0,
            [null, 'That is what consumers buy; the government buys the rest from producers.', 'At a price above $P^*$ producers want more than $Q^*$, and now every unit has a buyer.', 'That is the government\'s purchase.'],
            md`Every unit sells at the support price, so producers move out along supply: $Q^s(P_{\min})$.`),
          Q(md`Government expenditure under a price support is…`, ['$P_{\\min} \\times (Q^s - Q^d)$', '$P_{\\min} \\times Q^s$', '$(P_{\\min} - P^*) \\times (Q^s - Q^d)$', '$P^* \\times (Q^s - Q^d)$'], 0,
            [null, 'Consumers pay for the $Q^d$ units they buy; the government pays only for the rest.', 'The government pays the full support price per unit, not just the markup over the old price.', 'It buys at the support price, not at the old market price.'],
            md`Formula sheet: government purchases $G$ = purchase price × quantity bought. DS9: $45 \times 300 = 13{,}500$.`),
          RF(md`
            ### Where did 11,250 of surplus go?

            The table says society is 11,250 worse off. Here is the picture behind that number (a check, not something the exam asks you to draw):

            - Consumers used to eat units 150 to 300. They valued them at the area under demand from 150 to 300: **5625**. Those units now sit in a government warehouse, valued at zero.
            - Farmers now grow units 300 to 450 that nobody eats. Growing them costs the area under supply from 300 to 450: **5625**.

            $$5625 + 5625 = 11{,}250 \;✓$$

            [[fig:l]]

            Another way to see the waste: taxpayers spend 13,500 so that farmers gain 5625. Each dollar of spending raises farmers' surplus by only about 42 cents.
          `, { l: { svg: supLossFig, cap: 'Red: the social loss of the support. Left of 300: value consumers no longer get (under demand). Right of 300: the cost of growing units nobody eats (under supply).' } }),
          RF(md`
            ### Contrast: an ordinary floor at the same \$45

            Under an **ordinary** floor nobody buys the leftovers, so producers sell (and grow) only what consumers buy: 150. CS is the same; PS is cut off at 150 units.

            The supply price at 150 is $150/10 = 15$, so
            $$PS = \tfrac12 \times 150 \times 15 + (45 - 15) \times 150 = 1125 + 4500 = 5625$$
            $$\text{DWL} = \tfrac12 \times (300 - 150) \times (45 - 15) = 2250$$

            [[fig:f]]

            | | Ordinary floor \$45 | Price support \$45 |
            |---|---|---|
            | producers sell | 150 | 450 |
            | consumers buy | 150 | 150 |
            | government buys | 0 | 300 |
            | CS | 1125 | 1125 |
            | PS | 5625 | 10,125 |
            | government spending | 0 | 13,500 |
            | total surplus | 6750 | $-2250$ |
            | change from 9000 | $-2250$ | $-11{,}250$ |

            !!key Which quantity is "traded"?
              Ordinary floor: one quantity, $Q^d$, bought and sold. Price support: two quantities. Producers sell $Q^s$; consumers buy $Q^d$; the government absorbs $Q^s - Q^d$. Farmers are much better off under the support, and society is much worse off.
          `, { f: { svg: floor45Fig, cap: 'An ordinary floor at 45 in the DS9 market: only 150 units are sold. Blue: CS. Green: PS (triangle below 15 plus the rectangle from 15 to 45). Red: DWL, 2250.' } }),
          Q(md`Compared with an ordinary floor at the same price, a price support leaves consumer surplus…`, ['the same', 'higher', 'lower', 'at zero'], 0,
            [null, 'Consumers pay the same price and buy the same $Q^d$ in both cases.', 'Same price, same quantity for consumers.', 'Consumers still buy $Q^d$ and get the triangle above the price.'],
            md`The difference is entirely on the producer and government side.`),
          Q(md`DS9 market ($P^* = 30$). The government announces a support price of \$25. It buys…`, ['nothing', '$Q^s(25) - Q^d(25)$', '$Q^d(25) - Q^s(25)$', 'all output'], 0,
            [null, 'At \\$25 that is negative: there is no surplus to buy.', 'The market price stays at \\$30; nobody sells to the government at \\$25 when consumers pay \\$30.', 'Consumers buy everything at \\$30.'],
            md`A support below $P^*$ does not bind, like any floor below $P^*$.`),
          Q(md`In the social surplus row of a price support table, government spending is…`, ['subtracted', 'added', 'left out because it is a transfer', 'subtracted only if consumers lose'], 0,
            [null, 'Tax revenue is added; spending is the opposite.', 'Taxpayers are part of society, and the purchased crop is valued at zero.', 'It is subtracted in every case.'],
            md`$SS = CS + PS - G$. In DS9 that makes social surplus negative: $-2250$.`),
          R(md`
            ### Spot it: plan only
          `),
          P({ q: md`"The government sets a price floor at \$45 and promises to buy any excess supply. How many units will producers sell?"`,
            plan: plan('Which quantity?', '$Q^s(45)$', [
              ['$Q^d(45)$', 'That is the ordinary-floor answer. The promise to buy changes it.'],
              ['$Q^s(45) - Q^d(45)$', 'That is what the **government** buys.'],
              ['$Q^*$', 'At \\$45 producers want to sell more, and they can.'],
            ], 'Producers sell everything they want to at \\$45.') }),
          P({ q: md`Same program. "What is the government expenditure?"`,
            plan: plan('Which product?', '$45 \\times (Q^s - Q^d)$', [
              ['$45 \\times Q^s$', 'Consumers pay for the units they buy.'],
              ['$(45 - P^*) \\times (Q^s - Q^d)$', 'The government pays the whole \\$45 per unit.'],
              ['$\\tfrac12 \\times 45 \\times (Q^s - Q^d)$', 'It is a rectangle: price times quantity.'],
            ], 'Then $G$ goes into the table with a minus sign.') }),
          P({ q: md`Same program. "What is the change in producer surplus?"`,
            plan: plan('Which area after the policy?', 'The triangle above supply, below 45, over all $Q^s$ units', [
              ['The triangle over $Q^d$ units only', 'Producers sell $Q^s$ units at \\$45, not just the ones consumers buy.'],
              ['$G$, since the government pays the producers', 'The government payment is revenue for producers, but PS subtracts their cost of growing it.'],
              ['The same as under an ordinary floor', 'Under an ordinary floor they sell only $Q^d$.'],
            ], 'Then subtract the old PS.') }),
          P({ q: md`Same program. "What is the change in social surplus?"`,
            plan: plan('Which sum?', '$\\Delta CS + \\Delta PS - G$', [
              ['$\\Delta CS + \\Delta PS$', 'Leaves out the 13,500 taxpayers paid.'],
              ['$\\Delta CS + \\Delta PS + G$', 'Spending is money out, not in.'],
              ['$-\\tfrac12 \\times (Q^s - Q^d) \\times (45 - P^*)$', 'That is a guess at a DWL triangle; the support\'s loss is much larger and comes from the table.'],
            ], 'DS9: $-3375 + 5625 - 13{,}500 = -11{,}250$.') }),
          P({ q: md`A question says "price floor" with no promise of government purchases.`,
            plan: plan('How many units do producers sell?', '$Q^d(P_{\\min})$: only what consumers buy', [
              ['$Q^s(P_{\\min})$', 'Only with a government promise to buy the rest.'],
              ['$Q^s - Q^d$', 'That is the excess supply, which nobody buys.'],
              ['$Q^*$', 'Consumers will not buy $Q^*$ at a price above $P^*$.'],
            ], 'Read the problem for the words "government buys" or "price support".') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'A support in the Lecture 17 market', q: md`$Q^d = 200 - 5P$, $Q^s = 5P$ ($P^* = 20$, $CS = PS = 1000$). The government supports the price at \$24 and buys any surplus.`,
            plan: [
              plan('How many units does the government buy?', '$Q^s(24) - Q^d(24) = 120 - 80$', [
                ['$Q^s(24) = 120$', 'Consumers buy 80 of those.'],
                ['$Q^* - Q^d(24) = 20$', 'Producers expand to 120, not stay at 100.'],
                ['None: a floor has no buyer for the surplus', 'This is a support, not an ordinary floor.'],
              ], 'Government buys 40 at \\$24.'),
              plan('PS after the policy covers how many units?', '120: everything producers sell', [
                ['80', 'That is the ordinary-floor PS.'],
                ['100', 'Producers moved out to 120.'],
                ['40', 'Those are only the government\'s units.'],
              ], 'PS $= \\tfrac12 \\times 120 \\times 24$.'),
            ],
            parts: [N('\\text{producers sell}', 120), N('\\text{consumers buy}', 80), N('G', 960), N('CS', 640), N('PS', 1440), N('\\Delta SS', -880)],
            sol: md`
              **Moves 2–4.** $Q^s = 120$, $Q^d = 80$, government buys 40, $G = 24 \times 40 = 960$.

              **Moves 5–7.** $CS = \tfrac12(80)(40 - 24) = 640$ ($-360$). $PS = \tfrac12(120)(24) = 1440$ ($+440$). $SS = 640 + 1440 - 960 = 1120$, down 880 from 2000.

              Check with the loss picture: value lost on units 80 to 100 is $\tfrac12(28 + 24) \times 20 = 520$… wait, that is the trapezoid under demand: heights 24 at $Q = 80$ and 20 at $Q = 100$, so $\tfrac12(24 + 20)(20) = 440$. Cost of units 100 to 120: $\tfrac12(20 + 24)(20) = 440$. Total 880 ✓.
            ` }),
          P({ title: 'The DS9 slide example', q: md`Demand $Q^d = 525 - 15P$, supply $Q^s = 15P - 105$. The government supports the price at \$28 and buys the surplus.`,
            plan: plan('What do you need besides the two quantities at \\$28?', 'The no-policy equilibrium and the two curve intercepts, for the "before" surpluses and the triangles', [
              ['Nothing: the change in SS is just $-G$', 'CS and PS change too.'],
              ['Only the choke price', 'PS needs the supply intercept: supply starts at $P = 7$, not 0.'],
              ['The elasticities', 'Areas need prices and quantities.'],
            ], '$P^* = 21$, $Q^* = 210$; choke price 35; supply starts at 7.'),
            parts: [N('\\text{producers sell}', 315), N('\\text{consumers buy}', 105), N('G', 5880), N('\\Delta CS', -1102.5), N('\\Delta PS', 1837.5), N('\\Delta SS', -5145)],
            sol: md`
              **Move 0.** $525 - 15P = 15P - 105 \Rightarrow 630 = 30P \Rightarrow P^* = 21$, $Q^* = 210$. Choke price $525/15 = 35$; supply starts at $105/15 = 7$. $CS = \tfrac12(210)(35 - 21) = 1470$, $PS = \tfrac12(210)(21 - 7) = 1470$.

              **Moves 2–4.** $Q^s = 420 - 105 = 315$, $Q^d = 525 - 420 = 105$, government buys 210, $G = 28 \times 210 = 5880$.

              **Moves 5–7.** $CS = \tfrac12(105)(35 - 28) = 367.5$ ($-1102.5$). $PS = \tfrac12(315)(28 - 7) = 3307.5$ ($+1837.5$). $\Delta SS = -1102.5 + 1837.5 - 5880 = -5145$.

              These are the numbers in the DS9 picture: producers expand 210 → 315, consumers cut 210 → 105.
            ` }),
          P({ title: 'Support versus ordinary floor at \\$40', q: md`DS9 market, $Q^d = 600 - 10P$, $Q^s = 10P$. Compare an ordinary floor at \$40 with a price support at \$40.`,
            plan: plan('What is the one difference that drives everything?', 'How many units producers sell: $Q^d(40) = 200$ under the floor, $Q^s(40) = 400$ under the support', [
              ['The price consumers pay', 'Consumers pay \\$40 in both.'],
              ['The amount consumers buy', 'They buy 200 in both.'],
              ['Nothing: they are the same policy', 'Only the support has a buyer for the extra 200 units.'],
            ], 'Floor: PS over 200 units, DWL triangle. Support: PS over 400 units, minus $G = 40 \\times 200$.'),
            parts: [N('PS\\text{, ordinary floor}', 6000), N('W\\text{, ordinary floor}', 8000), N('PS\\text{, support}', 8000), N('G\\text{, support}', 8000), N('SS\\text{, support}', 2000)],
            sol: md`
              **Ordinary floor.** 200 sold. Supply price at 200 is 20. $CS = \tfrac12(200)(60 - 40) = 2000$. $PS = \tfrac12(200)(20) + (40 - 20)(200) = 2000 + 4000 = 6000$. $W = 8000$ (DWL $= \tfrac12(100)(20) = 1000$).

              **Support.** Producers sell 400, consumers buy 200, government buys 200 for $G = 8000$. $CS = 2000$. $PS = \tfrac12(400)(40) = 8000$. $SS = 2000 + 8000 - 8000 = 2000$, down 7000 from 9000.

              Farmers gain 2000 more under the support; society loses 6000 more.
            ` }),
          G('m3_po_support', { need: 3 }),
          R(md`
            ### Mixed: which policy is it?

            The next generator draws a tax, a ceiling, a floor or a support at random. Name the quantity before you compute anything.
          `),
          G('m3_po_which', { need: 4 }),
          R(md`
            ### Summary: which policy, which quantity

            | Policy | Binds when | Quantity on the market | Key extra number | DWL or welfare change |
            |---|---|---|---|---|
            | per-unit tax $t$ | always ($t > 0$) | $Q$ from the wedge: $Q^d(P_c) = Q^s(P_p)$, $P_c - P_p = t$ | $P_c$, $P_p$ | $\tfrac12 t(Q^* - Q)$; revenue $tQ$ |
            | ceiling $P_{\max}$ | $P_{\max} < P^*$ | $Q^s(P_{\max})$: sellers are short | $P_D(Q^s)$ | $\tfrac12 (Q^* - Q^s)(P_D(Q^s) - P_{\max})$ |
            | floor $P_{\min}$ | $P_{\min} > P^*$ | $Q^d(P_{\min})$: buyers are short | $P_S(Q^d)$ | $\tfrac12 (Q^* - Q^d)(P_{\min} - P_S(Q^d))$ |
            | price support $P_{\min}$ | $P_{\min} > P^*$ | producers sell $Q^s$, consumers buy $Q^d$, government buys $Q^s - Q^d$ | $G = P_{\min}(Q^s - Q^d)$ | $\Delta SS = \Delta CS + \Delta PS - G$ |

            !!method The four questions to ask every policy problem
              1. Does it bind? (Compare with $P^*$.)
              2. Which quantity trades? (Wedge, $Q^s$, $Q^d$, or both.)
              3. Where is the corner? ($P_c$ and $P_p$; $P_D(Q^s)$; $P_S(Q^d)$; the support price on $Q^s$.)
              4. Who is in the welfare sum? (CS + PS, plus tax revenue, or minus government spending.)
          `),
          RF(md`
            ### The welfare-area atlas (Lecture 17 market, $P^* = 20$, $Q^* = 100$)

            Blue is CS, green is PS, gray is tax revenue or government spending, red is DWL.

            **Tax of \$4.** CS 810, PS 810, revenue 360, DWL 20.

            [[fig:t]]

            **Ceiling of \$16.** CS 1280 (triangle + rectangle), PS 640, DWL 80.

            [[fig:c]]

            **Floor of \$24.** CS 640, PS 1280 (triangle + rectangle), DWL 80.

            [[fig:f]]

            **Support at \$24.** CS 640, PS 1440 (out to 120 units), government spends $24 \times 40 = 960$; SS $= 1120$, down 880.

            [[fig:s]]
          `, {
            t: { svg: taxWelfFig, cap: 'Tax 4: the revenue rectangle sits between P_p = 18 and P_c = 22 out to Q = 90; the DWL triangle points at the old equilibrium.' },
            c: { svg: ceil16Fig, cap: 'Ceiling 16: everything is cut at Q_s = 80; the DWL height is P_D(80) − 16 = 24 − 16.' },
            f: { svg: floor24Fig, cap: 'Floor 24: everything is cut at Q_d = 80; the DWL height is 24 − P_S(80) = 24 − 16.' },
            s: { svg: atlasSupFig, cap: 'Support 24: CS over the 80 units consumers buy, PS over all 120 units sold, gray government spending on units 80 to 120 (it overlaps the green: part of that spending ends up as producer surplus).' },
          }),
        ],
      },
    ],
  });
})();

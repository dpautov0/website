/* Mini Exam 3 · Part 9: long-run supply and welfare (Lecture 16, DS9 Q1–Q2).
   Entry and exit, the long-run price (min LRAC) and the number of firms, short run versus long run after a demand
   shift, producer surplus versus profit, and welfare accounting with deadweight loss. Same patterns as m3-u2. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, FIX, plan, gen, F, pick, ri } = M3;
  // two graphs side by side (wraps on a phone)
  const pair = (a, b) => `<div class="figrow"><div>${a}</div><div>${b}</div></div>`;
  const co = (v) => (v === 1 ? '' : F(v));     // coefficient: 1q^2 is written q^2

  // ------------------------------------------------------------------ lesson 1 figures
  // the lecture's review firm: VC = q^3 - 8q^2 + 30q, fixed cost 43.75. min AVC = 14 at q = 4; min AC ≈ 23.75 near q = 5
  const rMC = (q) => 3 * q * q - 16 * q + 30, rAVC = (q) => q * q - 8 * q + 30, rAC = (q) => rAVC(q) + 43.75 / q;
  const priceLine = (p, lab) => ({ seg: [[0, p], [7.7, p]], cls: 'curve dim dash', lab, at: 'end', dx: 2, dy: 0, anchor: 'l' });
  const reviewFig = EC.graph({
    w: 340, h: 270, x: [0, 8], y: [0, 46], xl: 'q', yl: '\\$', xt: [2, 4, 6], yt: [14, 18, 23.75, 40], mr: 40,
    items: [
      priceLine(40, ''), priceLine(23.75, ''), priceLine(18, ''), priceLine(14, ''),
      { f: rMC, from: 1.3, to: 6.3, cls: 'c5', lab: 'MC', labX: 6.25, dx: 6, dy: 4, anchor: 'l' },
      { f: rAC, from: 1.6, to: 7.7, lab: 'AC', labX: 7.7, dx: -2, dy: -8, anchor: 'br' },
      { f: rAVC, from: 0.6, to: 7.7, cls: 'c2', lab: 'AVC', labX: 7.7, dx: -2, dy: 12, anchor: 'tr' },
      { pt: [4, 14], lab: '\\min AVC', at: 'b' }, { pt: [4.91, 23.74], lab: '\\min AC', at: 'tl' },
    ],
  });
  // DS9 Q1: LRC = 2q^2 + 8, LRMC = 4q, LRAC = 2q + 8/q, min LRAC = 8 at q = 2. Long-run supply drawn in green.
  const lrSupplyFig = EC.graph({
    w: 320, h: 260, x: [0, 6.2], y: [0, 24], xl: 'q', yl: '\\$', xt: [2, 3], yt: [8, 12],
    items: [
      { f: (q) => 4 * q, from: 0, to: 5.6, cls: 'c5', lab: 'LRMC = 4q', labX: 5.0, dx: -6, dy: -2, anchor: 'r' },
      { f: (q) => 2 * q + 8 / q, from: 0.42, to: 6, lab: 'LRAC', labX: 6, dx: -2, dy: 10, anchor: 'tr' },
      { seg: [[2, 8], [5.6, 22.4]], cls: 'curve c3', lab: '', at: 'end' },
      { seg: [[0, 0], [0, 8]], cls: 'curve c3' },
      { seg: [[0, 8], [2, 8]], cls: 'curve c3 dash' },
      { pt: [2, 8], lab: '\\min LRAC', at: 'br', guide: 'x' }, { pt: [3, 12], lab: 'P = 12', at: 'tl', guide: true },
      { text: [0.25, 4], t: 'q = 0', anchor: 'l' },
    ],
  });

  // ------------------------------------------------------------------ lesson 1 generators
  gen('m3_lr_signal', () => {
    const v = pick([6, 8, 10, 12, 14, 20]), a = v + pick([4, 6, 8, 10]);
    const z = ri(0, 4);                                   // 0 below AVC, 1 at AVC, 2 between, 3 at AC, 4 above AC
    const Pr = [v - pick([1, 2, 3]), v, (v + a) / 2, a, a + pick([3, 5, 10])][z];
    const SR = ['shut down', 'indifferent', 'operate at a loss', 'break even', 'earn a profit'];
    const srWhy = [
      `Shutting down is right only when $P < \\min AVC = ${v}$.`,
      `Indifference happens only at exactly $P = \\min AVC = ${v}$.`,
      `Operating at a loss needs $${v} < P < ${a}$.`,
      `Breaking even happens only at exactly $P = \\min AC = ${a}$.`,
      `A profit needs $P > \\min AC = ${a}$.`,
    ].map((w, j) => (j === z ? null : w));
    const lrA = z <= 2 ? 1 : z === 3 ? 2 : 0;
    const LR = ['firms enter and the price falls', 'firms exit and the price rises', 'no entry or exit'];
    const lrWhy = ['Entry needs positive economic profit, $P > \\min AC$.', 'Exit happens when firms lose money, $P < \\min AC$.', 'Firms stay put only at zero economic profit, $P = \\min AC$.'].map((w, j) => (j === lrA ? null : w));
    return {
      title: 'Short-run action, long-run signal',
      q: md`A competitive firm's cost curves have min AVC $= ${v}$ and min AC $= ${a}$, and every firm in the industry has the same curves. The market price is \$${F(Pr)}. What does the firm do this period, and what happens to the number of firms over time?`,
      plan: [
        plan('Which comparison decides what the firm does this period (short run)?', `$P$ versus $\\min AVC = ${v}$`, [
          [`$P$ versus $\\min AC = ${a}$`, 'That decides profit or loss. In the short run the fixed cost is paid either way, so operate-or-shut-down compares price with the **avoidable** cost per unit, AVC.'],
          ['$P$ versus $MC$', 'At the chosen output $P = MC$ always. That decides how much, not whether.'],
          ['Whether profit is negative', 'A loss smaller than the fixed cost still beats shutting down, which loses all of the fixed cost.'],
        ], `Below ${v}: shut down. At ${v}: indifferent. Above ${v}: operate.`),
        plan('Which comparison decides whether firms enter or exit (long run)?', `$P$ versus $\\min AC = ${a}$: the sign of economic profit`, [
          [`$P$ versus $\\min AVC = ${v}$`, 'Covering AVC keeps a firm open this period. A firm that never covers its full cost leaves as soon as its commitments run out.'],
          ['Whether accounting profit is positive', 'Accounting profit ignores the owner’s opportunity costs. Entry and exit follow **economic** profit.'],
          ['Whether the price went up recently', 'Entry and exit respond to the level of profit, not to the price trend.'],
        ], `Above ${a}: profit, so entry. At ${a}: zero profit, nobody moves. Below ${a}: losses, so exit.`),
      ],
      parts: [FIX('This period the firm should…', SR, z, srWhy), FIX('Over time…', LR, lrA, lrWhy)],
      hints: [`Place \\$${F(Pr)} on the line: shutdown at ${v}, break-even at ${a}.`],
      sol: md`
        **Move 1: short run, price versus min AVC.** $P = ${F(Pr)}$ and $\min AVC = ${v}$. ${z === 0 ? `The price is below min AVC: every unit loses money on top of the fixed cost. **Shut down**, lose only the fixed cost.` : z === 1 ? `The price equals min AVC: producing and shutting down both lose exactly the fixed cost. **Indifferent.**` : `The price is above min AVC, so the firm operates.`}

        **Move 2: profit sign, price versus min AC.** $\min AC = ${a}$. ${z <= 2 ? `$P < ${a}$: economic loss${z === 2 ? ' (so it **operates at a loss**)' : ''}.` : z === 3 ? `$P = ${a}$: zero economic profit, **break even**.` : `$P > ${a}$: positive economic profit.`}

        **Move 3: long-run signal.** ${lrA === 0 ? 'Profit attracts entry: market supply shifts right and the price falls toward the bottom of AC.' : lrA === 1 ? 'Losses push firms out as their commitments end: market supply shifts left and the price rises toward the bottom of AC.' : 'Zero economic profit: owners earn exactly their next-best option, so nobody enters or leaves.'}
      `,
    };
  });

  gen('m3_lr_exitprice', () => {
    const a = pick([1, 2, 3, 4, 5]), qs = pick([2, 3, 4, 5, 6]), F0 = a * qs * qs, Ps = 2 * a * qs;
    const q2 = qs + pick([1, 2, 3]), P2 = 2 * a * q2, pi2 = P2 * q2 - (a * q2 * q2 + F0);
    return {
      title: 'The long-run exit price',
      q: md`A competitive firm has long-run cost $LRC(q) = ${co(a)}q^2 + ${F0}$ for $q > 0$ (zero if it exits). (a) In the long run it supplies a positive amount only if the price is above what amount? (b) How much does it produce at that price? (c) How much does it supply in the long run at $P = ${P2}$, and what is its profit there?`,
      plan: [
        plan('What does "supplies a positive amount in the long run only if the price is above…" ask for?', 'Minimum LRAC: set $LRMC = LRAC$', [
          ['Minimum AVC', 'In the long run every cost can be avoided by leaving, so the test uses the **full** average cost, LRAC.'],
          ['Where $LRMC = 0$', 'That is $q = 0$ here and says nothing about covering cost.'],
          ['The price where $LRMC = P$', 'No price is given in (a): the exit price is a property of the cost curve alone.'],
        ], `$LRAC = ${co(a)}q + ${F0}/q$, $LRMC = ${2 * a}q$. Set them equal, solve for $q$, then plug in.`),
        plan(`For (c): how do you get the long-run quantity at $P = ${P2}$?`, '$P = LRMC$, since the price is above min LRAC', [
          ['$P = LRAC$', 'That is where profit is zero, not where it is largest.'],
          ['It stays at the min-LRAC quantity', 'The firm’s own supply still slopes up: a higher price calls for more output along LRMC.'],
          ['Zero: competitive firms earn nothing in the long run', 'Zero profit is the **market** outcome after entry. At a given price above min LRAC this firm produces and profits.'],
        ], `Solve $${P2} = ${2 * a}q$; profit $= Pq - LRC(q)$.`),
      ],
      parts: [N('P_{\\text{exit}} = \\min LRAC', Ps), N('q\\text{ at }\\min LRAC', qs), N(`q\\text{ at }P = ${P2}`, q2), N('\\pi', pi2)],
      hints: [`$${2 * a}q = ${co(a)}q + \\dfrac{${F0}}{q}$. Multiply through by $q$.`],
      sol: md`
        **Move 1: the two curves.** $LRAC = \dfrac{LRC}{q} = ${co(a)}q + \dfrac{${F0}}{q}$ and $LRMC = \dfrac{dLRC}{dq} = ${2 * a}q$.

        **Move 2: bottom of LRAC, where $LRMC = LRAC$.**
        $$${2 * a}q = ${co(a)}q + \frac{${F0}}{q}$$
        Subtract $${co(a)}q$ from both sides, then multiply by $q$:
        $$${co(a)}q^2 = ${F0} \;\Rightarrow\; q^2 = ${qs * qs} \;\Rightarrow\; q = ${qs}$$

        **Move 3: the exit price.** $LRMC(${qs}) = ${Ps}$. Check: $LRAC(${qs}) = ${a * qs} + ${F0}/${qs} = ${a * qs} + ${F0 / qs} = ${Ps}$ ✓. Below \$${Ps} the firm exits; at \$${Ps} it is indifferent.

        **Move 4: supply at $P = ${P2}$.** $${P2} = ${2 * a}q \Rightarrow q = ${q2}$. Profit $= ${P2}(${q2}) - [${co(a)}(${q2})^2 + ${F0}] = ${P2 * q2} - ${a * q2 * q2 + F0} = ${pi2}$. Positive, as it must be above min LRAC.
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 2 figures
  // DS9 firm (LRC = 2q^2 + 8) with demand Q = 200 - 10P, i.e. P = 20 - Q/10: P* = 8, q* = 2, Q* = 120, n = 60
  const ds9Firm = EC.graph({
    w: 280, h: 240, x: [0, 6], y: [0, 22], xl: 'q', yl: '\\$', xt: [[2, 'q^* = 2']], yt: [8],
    items: [
      { f: (q) => 4 * q, from: 0, to: 5.4, cls: 'c5', lab: 'LRMC', labX: 5.1, dx: -6, dy: -2, anchor: 'r' },
      { f: (q) => 2 * q + 8 / q, from: 0.45, to: 5.9, lab: 'LRAC', labX: 5.9, dx: -2, dy: 10, anchor: 'tr' },
      { seg: [[0, 8], [5.9, 8]], cls: 'curve c3 dash', lab: 'P^* = 8', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [2, 8], guide: 'x' },
      { text: [4.4, 3], t: '\\text{one firm}' },
    ],
  });
  const ds9Mkt = EC.graph({
    w: 280, h: 240, x: [0, 220], y: [0, 22], xl: 'Q', yl: 'P', xt: [[120, '120']], yt: [8, 20],
    items: [
      { f: (Q) => 20 - Q / 10, from: 0, to: 200, lab: 'D', labX: 190, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 8], [215, 8]], cls: 'curve c3', lab: 'S_{LR}', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [120, 8], guide: 'x' },
      { text: [55, 4], t: 'n = 120/2 = 60' },
    ],
  });
  // constant-cost (flat) versus increasing-cost (rising) long-run industry supply
  const incFig = EC.graph({
    w: 320, h: 250, x: [0, 100], y: [0, 20], xl: 'Q', yl: 'P', xt: [40, 60], yt: [8, [28 / 3, 'P_2']],
    items: [
      { f: (Q) => 16 - Q / 5, from: 0, to: 75, cls: 'dim', lab: 'D_1', labX: 72, dx: 4, dy: 0, anchor: 'l' },
      { f: (Q) => 20 - Q / 5, from: 10, to: 95, cls: 'dim', lab: 'D_2', labX: 92, dx: 2, dy: -6, anchor: 'bl' },
      { seg: [[0, 8], [98, 8]], cls: 'curve c3', lab: '\\text{constant cost}', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
      { seg: [[0, 4], [90, 13]], cls: 'curve c2 dash', lab: '\\text{increasing cost}', at: 0.95, dx: -4, dy: -6, anchor: 'br' },
      { pt: [40, 8], lab: 'A', at: 'bl' }, { pt: [60, 8], lab: 'B', at: 'br' }, { pt: [160 / 3, 28 / 3], lab: 'B\'', at: 'tr', guide: 'y' },
    ],
  });

  // ------------------------------------------------------------------ lesson 2 generators
  const PLAN_LRP = (lrac) => plan('What do you find first?', 'Minimum LRAC: that is the long-run price $P^*$, and its $q$ is each firm’s output $q^*$', [
    ['Set the market demand equal to one firm’s LRMC', 'Demand is for the whole market and the number of firms is not known yet. In the long run the price is pinned by cost, not by one firm meeting demand.'],
    ['Solve $n\\,q(P) = Q^D(P)$', 'That is the short-run move, when $n$ is fixed. In the long run $n$ is the unknown.'],
    ['Set $MR = MC$ using market demand', 'That is the monopoly rule. These firms are price takers.'],
  ], `Free entry and exit push profit to zero, which happens only at the bottom of $LRAC = ${lrac}$.`);
  const PLAN_N = plan('With $P^*$ and $q^*$ in hand, how do you count the firms?', '$Q^* = Q^D(P^*)$ from demand, then $n = Q^*/q^*$', [
    ['$n = Q^*/P^*$', 'Dividing a quantity by a price does not count anything. Each firm makes $q^*$ units, so divide by $q^*$.'],
    ['Plug $q^*$ into the demand curve', 'Demand takes a **price** and gives the **market** quantity. Plug in $P^*$, not $q^*$.'],
    ['$n = Q^*$', 'That assumes each firm makes one unit. Each makes $q^*$.'],
  ], 'Market quantity at the long-run price, shared equally: $n = Q^*/q^*$.');

  gen('m3_lr_quad', () => {
    const a = pick([0.5, 1, 2, 3, 4]), qs = pick([2, 3, 4, 5, 6, 10]), F0 = a * qs * qs, Ps = 2 * a * qs;
    const n = pick([20, 30, 40, 50, 60, 80, 100, 150]), B = pick([5, 10, 20]), Qs = n * qs, A = Qs + B * Ps;
    return {
      title: 'Long-run equilibrium: price, quantity, number of firms',
      q: md`Every firm in a competitive industry has long-run cost $LRC(q) = ${co(a)}q^2 + ${F(F0)}$ (zero if it exits). Entry and exit are free and input prices are constant. Market demand is $Q = ${F(A)} - ${B}P$. Find each firm's output, the long-run price, the market quantity and the number of firms.`,
      plan: [PLAN_LRP(`${co(a)}q + ${F(F0)}/q`), PLAN_N],
      parts: [N('q^*', qs), N('P^*', Ps), N('Q^*', Qs), N('n', n)],
      hints: [`$LRMC = ${co(2 * a)}q$ and $LRAC = ${co(a)}q + ${F(F0)}/q$. Set them equal.`, `$Q^* = ${F(A)} - ${B}(${F(Ps)})$.`],
      sol: md`
        **Move 1: bottom of LRAC.** $LRAC = ${co(a)}q + \dfrac{${F(F0)}}{q}$, $LRMC = ${co(2 * a)}q$. Set them equal:
        $$${co(2 * a)}q = ${co(a)}q + \frac{${F(F0)}}{q} \;\Rightarrow\; ${co(a)}q = \frac{${F(F0)}}{q} \;\Rightarrow\; ${co(a)}q^2 = ${F(F0)} \;\Rightarrow\; q^2 = ${qs * qs} \;\Rightarrow\; q^* = ${qs}$$

        **Move 2: long-run price.** $P^* = LRMC(${qs}) = ${F(Ps)}$. Check: $LRAC(${qs}) = ${F(a * qs)} + ${F(F0 / qs)} = ${F(Ps)}$ ✓. (Shortcut for $aq^2 + F$: $q^* = \sqrt{F/a}$, $P^* = 2\sqrt{aF}$.)

        **Move 3: market quantity from demand at $P^*$.** $Q^* = ${F(A)} - ${B}(${F(Ps)}) = ${F(A)} - ${F(B * Ps)} = ${F(Qs)}$.

        **Move 4: count the firms.** $n = Q^*/q^* = ${F(Qs)}/${qs} = ${n}$.

        **Check:** each firm earns $${F(Ps)}(${qs}) - [${co(a)}(${qs})^2 + ${F(F0)}] = ${F(Ps * qs)} - ${F(a * qs * qs + F0)} = 0$ ✓.
      `,
    };
  });

  gen('m3_lr_cubic', () => {
    const k = pick([2, 3, 4, 5, 6]), m = k * k + pick([4, 6, 9, 10, 12, 16]), Ps = m - k * k;
    const n = pick([20, 40, 50, 60, 100, 200]), B = pick([5, 10, 20, 25]), Qs = n * k, A = Qs + B * Ps;
    return {
      title: 'Long-run equilibrium from a cubic cost',
      q: md`Identical competitive firms each have $LRC(q) = q^3 - ${2 * k}q^2 + ${m}q$. Entry is free and input prices are constant. Demand is $Q = ${A} - ${B}P$. Find $q^*$, $P^*$, $Q^*$ and the number of firms.`,
      plan: [
        plan('LRC has no constant term. What is the fastest way to the bottom of LRAC?', `Divide by $q$ to get $LRAC = q^2 - ${2 * k}q + ${m}$, then set $dLRAC/dq = 0$`, [
          ['Set $LRMC = 0$', 'The bottom of **average** cost is where LRAC stops falling, not where marginal cost is zero.'],
          ['Find the bottom of LRMC', 'LRMC bottoms out before LRAC does; LRMC crosses LRAC at LRAC’s minimum.'],
          ['Set $P = LRMC$', 'No price is known yet; the long-run price is what you are solving for.'],
        ], `$dLRAC/dq = 2q - ${2 * k} = 0 \\Rightarrow q = ${k}$. ($LRMC = LRAC$ gives the same $q$.)`),
        PLAN_N,
      ],
      parts: [N('q^*', k), N('P^*', Ps), N('Q^*', Qs), N('n', n)],
      hints: [`$LRAC = q^2 - ${2 * k}q + ${m}$, a parabola with its bottom at $q = ${k}$.`],
      sol: md`
        **Move 1: LRAC.** $LRAC = \dfrac{LRC}{q} = q^2 - ${2 * k}q + ${m}$.

        **Move 2: its bottom.** $\dfrac{dLRAC}{dq} = 2q - ${2 * k} = 0 \Rightarrow q^* = ${k}$.

        **Move 3: the price.** $P^* = LRAC(${k}) = ${k * k} - ${2 * k * k} + ${m} = ${Ps}$. Check with LRMC $= 3q^2 - ${4 * k}q + ${m}$: $3(${k * k}) - ${4 * k * k} + ${m} = ${Ps}$ ✓.

        **Move 4: demand at $P^*$.** $Q^* = ${A} - ${B}(${Ps}) = ${Qs}$.

        **Move 5: firms.** $n = ${Qs}/${k} = ${n}$.
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 3 figures
  // lecture figure, reconstructed: LRMC = 5 + q/2, LRC = 25 + 5q + q^2/4 (min LRAC 10 at q = 10), demand Q = 90 - 5P.
  // n firms: Q = n(2P - 10). n = 2: P = 110/9; n = 3: P = 120/11; n = 4: P = 10.
  const lecAC = (q) => 5 + q / 4 + 25 / q, P2f = 110 / 9, P3f = 120 / 11, q2f = 2 * P2f - 10;
  const lecFirm = EC.graph({
    w: 280, h: 240, x: [0, 18], y: [0, 17], xl: 'q', yl: '\\$', xt: [10, [q2f, 'q_1']], yt: [10, [P2f, 'P_1']],
    items: [
      { poly: [[0, lecAC(q2f)], [q2f, lecAC(q2f)], [q2f, P2f], [0, P2f]], cls: 'gain' },
      { f: (q) => 5 + q / 2, from: 2, to: 17, cls: 'c5', lab: 'LRMC', labX: 17, dx: -2, dy: -6, anchor: 'br' },
      { f: lecAC, from: 2.2, to: 17.5, lab: 'LRAC', labX: 17.5, dx: -2, dy: 10, anchor: 'tr' },
      { seg: [[0, P3f], [17, P3f]], cls: 'curve dim dash' },
      { pt: [q2f, P2f], guide: 'x' }, { pt: [10, 10], guide: 'x' },
      { text: [5, 4], t: '\\pi > 0\\text{ with 2 firms}' },
    ],
  });
  const lecMkt = EC.graph({
    w: 280, h: 240, x: [0, 56], y: [0, 19], xl: 'Q', yl: 'P', xt: [40], yt: [10, [P2f, 'P_1']],
    items: [
      { f: (Q) => 18 - Q / 5, from: 0, to: 54, lab: 'D', labX: 54, dx: 2, dy: -4, anchor: 'bl' },
      { f: (Q) => 5 + Q / 4, from: 0, to: 52, cls: 'c2', lab: 'S^{(2)}', labX: 52, dx: -2, dy: -4, anchor: 'br' },
      { f: (Q) => 5 + Q / 6, from: 0, to: 54, cls: 'c4', lab: 'S^{(3)}', labX: 54, dx: -2, dy: -4, anchor: 'br' },
      { f: (Q) => 5 + Q / 8, from: 0, to: 54, cls: 'c5', lab: 'S^{(4)}', labX: 54, dx: -2, dy: 12, anchor: 'tr' },
      { seg: [[0, 10], [56, 10]], cls: 'curve c3 dash' },
      { pt: [4 * P2f - 20, P2f] }, { pt: [6 * P3f - 30, P3f] }, { pt: [40, 10], guide: 'x' },
    ],
  });
  // worked example: C = q^2 + 16 (MC = 2q, min AC 8 at q = 4), 60 firms: SR supply Q = 30P.
  // demand 400 - 20P -> 500 - 20P (up) or 300 - 20P (down)
  const cofFirm = (Pr) => {
    const q = Pr / 2, ac = q + 16 / q, prof = Pr >= ac;
    return EC.graph({
      w: 280, h: 240, x: [0, 8], y: [0, 16], xl: 'q', yl: '\\$', xt: [[q, String(q)], 4], yt: [8, Pr],
      items: [
        { poly: [[0, Math.min(Pr, ac)], [q, Math.min(Pr, ac)], [q, Math.max(Pr, ac)], [0, Math.max(Pr, ac)]], cls: prof ? 'gain' : 'loss' },
        { f: (x) => 2 * x, from: 0, to: 7.8, cls: 'c5', lab: 'MC', labX: 7.4, dx: -6, dy: 0, anchor: 'r' },
        { f: (x) => x + 16 / x, from: 1.2, to: 7.9, lab: 'AC', labX: 7.9, dx: -2, dy: -6, anchor: 'br' },
        { seg: [[0, Pr], [7.9, Pr]], cls: 'curve c3 dash' },
        { pt: [q, Pr], guide: 'x' }, { pt: [4, 8], lab: '\\min AC', at: 'br' },
        { text: [q / 2, Math.max(Pr, ac) + 1.2], t: prof ? '\\pi = 9' : '\\pi = -7' },
      ],
    });
  };
  const cofMkt = (up) => {
    const A1 = up ? 500 : 300, Psr = A1 / 50, Qlr = A1 - 160;
    return EC.graph({
      w: 280, h: 240, x: [0, 440], y: [0, 26], xl: 'Q', yl: 'P', xt: up ? [240, 340] : [140, 240], yt: [8, Psr],
      items: [
        { f: (Q) => 20 - Q / 20, from: 0, to: 400, cls: 'dim', lab: 'D_0', labX: 395, dx: 2, dy: -4, anchor: 'bl' },
        { f: (Q) => A1 / 20 - Q / 20, from: 0, to: A1 - 5, lab: 'D_1', labX: A1 - 20, dx: 4, dy: -4, anchor: 'bl' },
        { f: (Q) => Q / 30, from: 0, to: 430, cls: 'c2', lab: 'S_{SR}', labX: 430, dx: -2, dy: -6, anchor: 'br' },
        { seg: [[0, 8], [435, 8]], cls: 'curve c3', lab: 'S_{LR}', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
        { pt: [240, 8], lab: 'A', at: 'tl' }, { pt: [30 * Psr, Psr], lab: 'B', at: up ? 'tl' : 'br', guide: true }, { pt: [Qlr, 8], lab: 'C', at: up ? 'tr' : 'tl', guide: 'x' },
      ],
    });
  };

  // ------------------------------------------------------------------ lesson 3 generators
  gen('m3_lr_shift', () => {
    let o = null;
    for (let t = 0; t < 200 && !o; t++) {
      const a = pick([1, 2]), qs = pick([4, 5, 6]), F0 = a * qs * qs, Ps = 2 * a * qs;
      const n0 = pick([40, 60, 80, 100]), s = n0 / (2 * a), B = pick([10, 20]), A0 = n0 * qs + B * Ps;
      const up = Math.random() < 0.5, d = pick([1, 2]), P1 = up ? Ps + d : Ps - d;
      const A1 = P1 * (s + B), q1 = P1 / (2 * a), n1 = (A1 - B * Ps) / qs;
      if (!Number.isInteger(n1) || n1 <= 0 || !Number.isInteger(A1) || Math.abs(q1 * 100 - Math.round(q1 * 100)) > 1e-9) continue;
      o = { a, qs, F0, Ps, n0, s, B, A0, up, P1, A1, q1, n1, Q1: s * P1, pi1: P1 * q1 - (a * q1 * q1 + F0) };
    }
    const { a, qs, F0, Ps, n0, s, B, A0, up, P1, A1, q1, n1, Q1, pi1 } = o;
    return {
      title: `Demand ${up ? 'rises' : 'falls'}: short run, then long run`,
      q: md`An industry is in long-run equilibrium with ${n0} identical firms, each with cost $C(q) = ${co(a)}q^2 + ${F0}$ (the ${F0} is fixed in the short run; in the long run every cost is avoidable). Demand is $Q = ${A0} - ${B}P$. Demand then ${up ? 'rises' : 'falls'} to $Q = ${A1} - ${B}P$. Find the short-run price, each firm's short-run output and profit, and the number of firms in the new long-run equilibrium.`,
      plan: [
        plan('Right after the shift, what is fixed and how do you get the price?', `The number of firms is fixed at ${n0}: solve $${n0}\\,q(P) = Q^D_{\\text{new}}(P)$`, [
          [`The price jumps straight to min AC $= ${Ps}$`, 'That is where the price ends up **after** entry or exit. In the short run nobody has entered or left yet.'],
          ['Each firm keeps making the same output', 'Existing firms respond to the new price by moving along their MC curves.'],
          ['Use the old demand curve', 'The shift is the whole point: the short-run equilibrium is new demand against the old firms’ supply.'],
        ], `One firm: $P = ${2 * a}q \\Rightarrow q = P/${2 * a}$. Market: $Q = ${n0} \\cdot P/${2 * a} = ${F(s)}P$. Set equal to new demand.`),
        plan('In the long run, how do you get the number of firms?', `The price returns to min AC $= ${Ps}$; then $n = Q^D_{\\text{new}}(${Ps})/q^*$`, [
          ['Keep the short-run price and divide', `In the short run firms ${up ? 'profit' : 'lose'}, so ${up ? 'entry' : 'exit'} continues until the price is back at min AC.`],
          [`The number of firms stays ${n0}`, 'In the long run firms enter and exit; that is how the price gets back to min AC.'],
          ['Divide the new demand intercept by $q^*$', 'Use demand **at the long-run price**, not at a price of zero.'],
        ], `$q^* = ${qs}$ (bottom of AC). Market quantity at $P = ${Ps}$ from the new demand, divided by ${qs}.`),
      ],
      parts: [N('P_{SR}', P1), N('q_{SR}', q1), N('\\pi_{SR}', pi1), N('n_{LR}', n1)],
      hints: [`$${F(s)}P = ${A1} - ${B}P$.`, `Long run: $Q = ${A1} - ${B}(${Ps})$.`],
      sol: md`
        **Move 1: old equilibrium (check).** Min AC: $${2 * a}q = ${co(a)}q + ${F0}/q \Rightarrow q^* = ${qs}$, $P^* = ${Ps}$. Demand at ${Ps}: $${A0} - ${B * Ps} = ${n0 * qs} = ${n0} \times ${qs}$ ✓.

        **Move 2: short-run supply with ${n0} firms.** $q = P/${2 * a}$, so $Q^S = ${F(s)}P$.

        **Move 3: short-run price.** $${F(s)}P = ${A1} - ${B}P \Rightarrow ${F(s + B)}P = ${A1} \Rightarrow P_{SR} = ${F(P1)}$. Market $Q = ${F(Q1)}$.

        **Move 4: each firm.** $q_{SR} = ${F(P1)}/${2 * a} = ${F(q1)}$. $\pi = ${F(P1)}(${F(q1)}) - [${co(a)}(${F(q1)})^2 + ${F0}] = ${F(P1 * q1)} - ${F(a * q1 * q1 + F0)} = ${F(pi1)}$. ${up ? 'Profit: entry follows.' : `A loss, but smaller than the fixed cost ${F0} (price covers AVC $= ${co(a)}q$), so firms operate now and some exit later.`}

        **Move 5: long run.** The price returns to ${Ps}; $Q = ${A1} - ${B}(${Ps}) = ${F(A1 - B * Ps)}$; each firm makes ${qs}, so $n = ${F(A1 - B * Ps)}/${qs} = ${n1}$ (${up ? 'up' : 'down'} from ${n0}).
      `,
    };
  });

  // direction table: [variable][up][period] -> 0 rises, 1 falls, 2 stays the same
  const DIRS = {
    'the market price': { up: [0, 2], dn: [1, 2], why: { SR: 'With the number of firms fixed, the new demand meets the old upward-sloping supply.', LR: 'Entry or exit continues until the price is back at min LRAC.' } },
    'the market quantity': { up: [0, 0], dn: [1, 1], why: { SR: 'Moving along the short-run supply curve.', LR: 'At the original price, the new demand curve calls for a different quantity, and the flat long-run supply delivers it.' } },
    'the number of firms': { up: [2, 0], dn: [2, 1], why: { SR: 'In the short run nobody can enter or leave.', LR: 'Profit brings entrants; losses push firms out.' } },
    'each firm’s output': { up: [0, 2], dn: [1, 2], why: { SR: 'Each firm moves along its MC to the new price.', LR: 'Every firm ends at the bottom of LRAC, q*, as before.' } },
    'each firm’s economic profit': { up: [0, 2], dn: [1, 2], why: { SR: 'The price moved away from min AC.', LR: 'Entry and exit drive it back to zero.' } },
  };
  gen('m3_lr_direction', () => {
    const up = Math.random() < 0.5, per = pick(['SR', 'LR']), k = per === 'SR' ? 0 : 1;
    const vars = Object.keys(DIRS).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = ['rises', 'falls', 'stays the same'];
    const parts = vars.map((v) => {
      const a = DIRS[v][up ? 'up' : 'dn'][k];
      return FIX(v, opts, a, opts.map((_, j) => (j === a ? null : DIRS[v].why[per])));
    });
    return {
      title: `Demand ${up ? 'up' : 'down'}: which way does it move?`,
      q: md`A constant-cost competitive industry (identical firms, free entry, constant input prices) starts in long-run equilibrium. Demand ${up ? 'increases' : 'decreases'} permanently. Compared with the original equilibrium, in the **${per === 'SR' ? 'short run (before any entry or exit)' : 'long run (after entry and exit finish)'}**, what happens to each item?`,
      plan: per === 'SR'
        ? plan('What is held fixed in the short run?', 'The number of firms: existing firms move along their MC curves', [
          ['The price', 'The price is what moves first: new demand meets the old supply curve.'],
          ['Each firm’s output', 'Firms respond to the new price by moving along MC.'],
          ['Nothing: everything adjusts at once', 'Entry and exit take time; that is what separates the short run from the long run.'],
        ], `Same firms, new demand: price and quantity both ${up ? 'rise' : 'fall'}, and so do each firm’s output and profit.`)
        : plan('Where does the price end up in the long run?', 'Back at min LRAC, so each firm is back at q* with zero profit', [
          [`Higher than before if demand rose`, 'Only in an increasing-cost industry. With constant costs, long-run supply is flat.'],
          ['Wherever the short-run price was', 'Short-run profit or loss triggers entry or exit, which moves the price again.'],
          ['At zero', 'Zero **profit**, not zero price: the price returns to min LRAC.'],
        ], `Price and each firm’s output and profit return to where they started; the market quantity and the number of firms ${up ? 'rise' : 'fall'}.`),
      parts,
      sol: md`
        ${per === 'SR' ? `**Short run.** The number of firms is fixed, so the ${up ? 'higher' : 'lower'} demand meets the old short-run supply curve: the price ${up ? 'rises' : 'falls'} and the market quantity ${up ? 'rises' : 'falls'}. Each firm moves along its MC to the new price, so its output ${up ? 'rises' : 'falls'} and it ${up ? 'earns a profit' : 'makes a loss'}. Number of firms: unchanged.` : `**Long run.** ${up ? 'Profit attracts entry' : 'Losses push firms out'} until the price is back at min LRAC. So the price, each firm's output ($q^*$) and profit (zero) are where they started. The market quantity is read off the new demand at the old price, so it ${up ? 'rises' : 'falls'}, and the number of firms ${up ? 'rises' : 'falls'} with it.`}
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 4 figures
  // lecture: units cost 1, 2, 3, 4; price 4. PS = 3 + 2 + 1 + 0 = 6, VC = 10
  const stepFig = EC.graph({
    w: 300, h: 240, x: [0, 5], y: [0, 5], xl: 'q', yl: '\\$', xt: [1, 2, 3, 4], yt: [1, 2, 3, 4],
    items: [
      { poly: [[0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [0, 4]], cls: 'gain' },
      { poly: [[0, 0], [4, 0], [4, 4], [3, 4], [3, 3], [2, 3], [2, 2], [1, 2], [1, 1], [0, 1]], cls: 'ex' },
      { seg: [[0, 4], [4.8, 4]], cls: 'curve c3', lab: 'P = 4', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pts: [[0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4]], cls: 'curve c5', lab: 'MC', labI: 0, dx: 4, dy: 12, anchor: 'tl' },
      { text: [1, 3.2], t: '\\text{PS} = 6' }, { text: [2.6, 1.2], t: '\\text{VC} = 10' },
    ],
  });
  // lecture: market supply P = Q + 5. PS at 7 = 2, at 9 = 8, change 6 (trapezoid)
  const psS = (Q) => Q + 5;
  const ps7 = EC.graph({
    w: 280, h: 240, x: [0, 7], y: [0, 12], xl: 'Q', yl: '\\$', xt: [2, 4], yt: [5, 7, 9],
    items: [
      { poly: [[0, 5], [2, 7], [0, 7]], cls: 'gain' },
      { poly: [[0, 0], [2, 0], [2, 7], [0, 5]], cls: 'ex' },
      { f: psS, from: 0, to: 6.5, cls: 'c5', lab: 'S', labX: 6.5, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 7], [2, 7]], cls: 'curve c3' }, { pt: [2, 7], guide: 'x' },
      { text: [0.7, 6.35], t: '2' }, { text: [1, 2.5], t: 'VC' },
    ],
  });
  const ps9 = EC.graph({
    w: 280, h: 240, x: [0, 7], y: [0, 12], xl: 'Q', yl: '\\$', xt: [2, 4], yt: [5, 7, 9],
    items: [
      { poly: [[0, 5], [2, 7], [0, 7]], cls: 'ex' },
      { poly: [[0, 7], [2, 7], [4, 9], [0, 9]], cls: 'gain' },
      { f: psS, from: 0, to: 6.5, cls: 'c5', lab: 'S', labX: 6.5, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 9], [4, 9]], cls: 'curve c3' }, { seg: [[0, 7], [2, 7]], cls: 'curve dim dash' },
      { pt: [2, 7], guide: 'x' }, { pt: [4, 9], guide: 'x' },
      { text: [1.6, 8.05], t: '+6' }, { text: [0.7, 6.35], t: '2' },
    ],
  });
  // Dent: C = 2q^2 + 100, MC = 4q, P = 40: q = 10, PS = 200 (triangle), VC = 200, profit 100
  const dentPS = EC.graph({
    w: 300, h: 240, x: [0, 13], y: [0, 52], xl: 'q', yl: '\\$', xt: [10], yt: [40],
    items: [
      { poly: [[0, 0], [10, 40], [0, 40]], cls: 'gain' },
      { poly: [[0, 0], [10, 0], [10, 40]], cls: 'ex' },
      { f: (q) => 4 * q, from: 0, to: 12.5, cls: 'c5', lab: 'MC = 4q', labX: 12, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 40], [12.5, 40]], cls: 'curve c3', lab: 'P = 40', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [10, 40], guide: 'x' },
      { text: [3.3, 30], t: '\\text{PS} = 200' }, { text: [7, 9], t: '\\text{VC} = 200' },
    ],
  });
  // DS9 Q2: Qd = 600 - 10P (P = 60 - Q/10), Qs = 10P (P = Q/10): P = 30, Q = 300, CS = PS = 4500
  const ds9Wel = EC.graph({
    w: 320, h: 250, x: [0, 640], y: [0, 66], xl: 'Q', yl: 'P', xt: [300], yt: [30, 60],
    items: [
      { poly: [[0, 60], [300, 30], [0, 30]], cls: 'cs' },
      { poly: [[0, 0], [300, 30], [0, 30]], cls: 'gain' },
      { f: (Q) => 60 - Q / 10, from: 0, to: 600, lab: 'D', labX: 590, dx: 2, dy: -4, anchor: 'bl' },
      { f: (Q) => Q / 10, from: 0, to: 620, cls: 'c5', lab: 'S', labX: 610, dx: -2, dy: -6, anchor: 'br' },
      { pt: [300, 30], guide: true },
      { text: [95, 40], t: '\\text{CS}' }, { text: [95, 20], t: '\\text{PS}' },
    ],
  });

  // ------------------------------------------------------------------ lesson 4 generators
  gen('m3_lr_ps_lin', () => {
    const c = pick([2, 4, 5, 10]), d = pick([0.5, 1, 2, 3]), Q1 = ri(2, 8), Q2 = Q1 + ri(1, 4);
    const P1 = c + d * Q1, P2 = c + d * Q2, PS1 = 0.5 * d * Q1 * Q1, PS2 = 0.5 * d * Q2 * Q2, dPS = PS2 - PS1;
    const sl = d === 1 ? 'Q' : `${F(d)}Q`;
    return {
      title: 'Producer surplus from a supply line',
      q: md`Inverse market supply is $P = ${c} + ${sl}$. Find producer surplus when the price is \$${F(P1)}, when it is \$${F(P2)}, and the change.`,
      plan: [
        plan('What shape is producer surplus at one price?', `A triangle: $\\tfrac12 \\times Q \\times (P - ${c})$`, [
          ['$P \\times Q$', 'That is total revenue. PS subtracts what each unit cost to make.'],
          ['$\\tfrac12 \\times Q \\times P$', `Supply starts at ${c}, not at 0: the triangle's height is $P - ${c}$.`],
          ['The area under the supply curve', 'That is variable cost. PS is the area **above** supply and below the price.'],
        ], `Quantity from supply: $Q = (P - ${c})/${F(d)}$. Then the triangle between the price line and supply.`),
        plan('How do you get the change in PS?', `$PS_2 - PS_1$, or the trapezoid $\\tfrac12(Q_1 + Q_2)(P_2 - P_1)$`, [
          ['$(P_2 - P_1) \\times Q_1$', 'That is only the gain on the units already sold. The new units add a sliver too.'],
          ['$(P_2 - P_1) \\times Q_2$', 'The extra units between $Q_1$ and $Q_2$ do not earn the full price rise: their MC is higher.'],
          ['$\\tfrac12 (Q_2 - Q_1)(P_2 - P_1)$', 'That is only the small triangle on the new units.'],
        ], 'Both routes give the same number; use one to check the other.'),
      ],
      parts: [N(`PS\\text{ at }${F(P1)}`, PS1), N(`PS\\text{ at }${F(P2)}`, PS2), N('\\Delta PS', dPS)],
      hints: [`At \\$${F(P1)}: $Q = (${F(P1)} - ${c})/${F(d)} = ${Q1}$.`],
      sol: md`
        **Move 1: quantities.** $Q = (P - ${c})/${F(d)}$: at \$${F(P1)}, $Q_1 = ${Q1}$; at \$${F(P2)}, $Q_2 = ${Q2}$.

        **Move 2: triangles.** $PS_1 = \tfrac12(${Q1})(${F(P1)} - ${c}) = ${F(PS1)}$. $PS_2 = \tfrac12(${Q2})(${F(P2)} - ${c}) = ${F(PS2)}$.

        **Move 3: change.** $\Delta PS = ${F(PS2)} - ${F(PS1)} = ${F(dPS)}$. Trapezoid check: $\tfrac12(${Q1} + ${Q2})(${F(P2)} - ${F(P1)}) = ${F(dPS)}$ ✓.
      `,
    };
  });

  gen('m3_lr_ps_firm', () => {
    const a = pick([0.5, 1, 2]), b = pick([2, 4, 6, 10]), q = ri(3, 12), F0 = pick([20, 50, 100, 200]);
    const Pr = b + 2 * a * q, TR = Pr * q, VC = b * q + a * q * q, PS = TR - VC, pi = PS - F0;
    return {
      title: 'A firm’s producer surplus and profit',
      q: md`A competitive firm has short-run cost $C(q) = ${F0} + ${b}q + ${co(a)}q^2$. The price is \$${F(Pr)}. Find its output, producer surplus and profit.`,
      plan: [
        plan('Which formula gives the firm’s producer surplus?', '$PS = TR - VC$', [
          ['$PS = TR - TC$', 'That is profit. PS leaves the fixed cost out.'],
          ['$PS = P \\times q$', 'That is revenue.'],
          ['$PS = \\tfrac12 \\times q \\times P$', `MC starts at ${b}, not 0, so the triangle's height is $P - ${b}$, not $P$.`],
        ], `$q$ from $P = MC = ${b} + ${co(2 * a)}q$; then $TR - VC$ with $VC = ${b}q + ${co(a)}q^2$.`),
        plan('How do you get profit from PS?', '$\\pi = PS - F$', [
          ['$\\pi = PS$', 'Only when there is no fixed cost, as in the long run.'],
          ['$\\pi = PS + F$', 'Profit subtracts the fixed cost; it does not add it.'],
          ['$\\pi = PS - VC$', 'PS already has variable cost taken out.'],
        ], `Subtract the fixed cost ${F0}.`),
      ],
      parts: [N('q^*', q), N('PS', PS), N('\\pi', pi)],
      hints: [`$${F(Pr)} = ${b} + ${co(2 * a)}q$.`],
      sol: md`
        **Move 1: output.** $${F(Pr)} = ${b} + ${co(2 * a)}q \Rightarrow q = ${F(Pr - b)}/${F(2 * a)} = ${q}$.

        **Move 2: PS = TR − VC.** $TR = ${F(Pr)}(${q}) = ${F(TR)}$. $VC = ${b}(${q}) + ${co(a)}(${q})^2 = ${F(VC)}$. $PS = ${F(TR)} - ${F(VC)} = ${F(PS)}$.
        Triangle check (MC is a straight line from ${b}): $\tfrac12(${q})(${F(Pr)} - ${b}) = ${F(PS)}$ ✓.

        **Move 3: profit.** $\pi = PS - F = ${F(PS)} - ${F0} = ${F(pi)}$.${pi < 0 ? ` Negative, but PS is positive, so producing still beats shutting down (which would give $-${F0}$).` : ''}
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 5 figures
  // lecture: S: P = 2 + Q, D: P = 14 - Q. Competitive Q = 6, P = 8. Restricted Q = 4 (P = 10); forced Q = 8 (P = 6).
  const wD = (Q) => 14 - Q, wS = (Q) => 2 + Q;
  const welBase = [
    { f: wD, from: 0, to: 12, lab: 'D: P = 14 - Q', labX: 11.6, dx: -2, dy: 12, anchor: 'tr' },
    { f: wS, from: 0, to: 11.5, cls: 'c5', lab: 'S: P = 2 + Q', labX: 11.5, dx: -2, dy: -6, anchor: 'br' },
  ];
  const welEq = EC.graph({
    w: 320, h: 260, x: [0, 12.5], y: [0, 15], xl: 'Q', yl: '\\$', xt: [6], yt: [2, 8, 14],
    items: [
      { poly: [[0, 14], [6, 8], [0, 8]], cls: 'cs' }, { poly: [[0, 2], [6, 8], [0, 8]], cls: 'gain' },
      ...welBase, { pt: [6, 8], guide: true },
      { text: [1.8, 10], t: '\\text{CS} = 18' }, { text: [1.8, 6], t: '\\text{PS} = 18' },
    ],
  });
  const welLow = EC.graph({
    w: 320, h: 260, x: [0, 12.5], y: [0, 15], xl: 'Q', yl: '\\$', xt: [4, 6], yt: [6, 8, 10],
    items: [
      { poly: [[0, 14], [4, 10], [0, 10]], cls: 'cs' },
      { poly: [[0, 8], [4, 8], [4, 10], [0, 10]], cls: 'ex' },
      { poly: [[0, 2], [4, 6], [4, 8], [0, 8]], cls: 'gain' },
      { poly: [[4, 10], [6, 8], [4, 6]], cls: 'loss' },
      ...welBase, { seg: [[4, 0], [4, 10]], cls: 'curve dim dash' }, { pt: [4, 10], guide: 'y' }, { pt: [6, 8], guide: 'y' },
      { text: [1.2, 11], t: '8' }, { text: [2, 9], t: '\\text{transfer } 8' }, { text: [1.8, 6], t: '16' },
      { text: [6.4, 9.6], t: '\\text{DWL} = 4', anchor: 'l' },
    ],
  });
  const welHigh = EC.graph({
    w: 320, h: 260, x: [0, 12.5], y: [0, 15], xl: 'Q', yl: '\\$', xt: [4, 6, 8], yt: [6, 8, 10],
    items: [
      { poly: [[0, 14], [8, 6], [0, 6]], cls: 'cs' },
      { poly: [[0, 2], [4, 6], [0, 6]], cls: 'gain' },
      { poly: [[6, 8], [8, 10], [8, 6]], cls: 'loss' },
      ...welBase, { seg: [[0, 6], [8, 6]], cls: 'curve c3 dash' }, { pt: [8, 6], guide: 'x' }, { pt: [8, 10], guide: 'y' }, { pt: [6, 8] },
      { text: [2, 9], t: '\\text{CS} = 32' }, { text: [1, 5], t: '+8' }, { text: [8.3, 8], t: '\\text{DWL} = 4', anchor: 'l' },
    ],
  });

  // ------------------------------------------------------------------ lesson 5 generators
  gen('m3_lr_dwl', () => {
    const b = pick([1, 2]), d = pick([1, 2]), Qs = pick([4, 6, 8, 10]), c = ri(1, 5), Ps = c + d * Qs, a = Ps + b * Qs;
    const low = Math.random() < 0.5, k = pick([1, 2]), Qx = low ? Qs - k : Qs + k, Px = a - b * Qx;
    const CS = 0.5 * b * Qx * Qx, PS = (Px - c) * Qx - 0.5 * d * Qx * Qx, W = CS + PS, Ws = 0.5 * Qs * (a - c), DWL = Ws - W;
    const gap = Math.abs((a - b * Qx) - (c + d * Qx));
    const lin = (k0, s, sg) => `${k0} ${sg} ${s === 1 ? '' : s}Q`;
    return {
      title: low ? 'Too little output: welfare accounting' : 'Too much output: welfare accounting',
      q: md`Demand is $P = ${lin(a, b, '-')}$ and supply is $P = ${lin(c, d, '+')}$. A policy ${low ? `restricts output to $Q = ${Qx}$` : `requires output of $Q = ${Qx}$`}; the price is whatever buyers will pay for that quantity. Find the price, CS, PS and the deadweight loss.`,
      plan: [
        plan(`At $Q = ${Qx}$, what is the market price?`, `The demand price: $P = ${a} - ${b === 1 ? '' : b}(${Qx})$`, [
          ['The supply price at that quantity', `The lecture's setup: the price is what buyers will pay for $Q = ${Qx}$, read off demand.`],
          ['The competitive price', `At $Q = ${Qx}$ buyers ${low ? 'compete for fewer units and bid the price up' : 'take more units only at a lower price'}.`],
          ['Wherever supply equals demand', 'That is the competitive outcome, which the policy overrides.'],
        ], `$P = ${Px}$. Then CS, PS (= TR − VC), and DWL.`),
        plan('Fastest way to the deadweight loss?', `A triangle between demand and supply over the units between $Q^* = ${Qs}$ and $${Qx}$`, [
          ['Change in CS', 'CS also changes because of a transfer; DWL is the total welfare lost.'],
          [`$(P - P^*) \\times ${Qx}$`, 'That rectangle is a transfer between consumers and producers, not a loss.'],
          ['Half of the change in CS', 'There is no rule like that; the DWL is the triangle between D and S.'],
        ], `Base $|${Qs} - ${Qx}| = ${k}$; height = gap between D and S at $Q = ${Qx}$, which is ${gap}.`),
      ],
      parts: [N('P', Px), N('CS', CS), N('PS', PS), N('\\text{DWL}', DWL)],
      hints: [`Competitive: $${lin(a, b, '-')} = ${lin(c, d, '+')} \\Rightarrow Q^* = ${Qs}$, $P^* = ${Ps}$.`, `$PS = TR - VC$, with $VC$ the area under supply: $${c}Q + ${co(d / 2)}Q^2$.`],
      sol: md`
        **Move 1: the benchmark.** $${lin(a, b, '-')} = ${lin(c, d, '+')} \Rightarrow ${b + d}Q = ${a - c} \Rightarrow Q^* = ${Qs}$, $P^* = ${Ps}$. Total welfare $W^* = \tfrac12(${Qs})(${a} - ${c}) = ${F(Ws)}$.

        **Move 2: price at $Q = ${Qx}$.** $P = ${a} - ${b === 1 ? '' : b}(${Qx}) = ${Px}$.

        **Move 3: CS.** Triangle under demand above ${Px}: $\tfrac12(${Qx})(${a} - ${Px}) = ${F(CS)}$.

        **Move 4: PS = TR − VC.** $TR = ${Px}(${Qx}) = ${Px * Qx}$; $VC = ${c}(${Qx}) + ${co(d / 2)}(${Qx})^2 = ${F(c * Qx + 0.5 * d * Qx * Qx)}$; $PS = ${F(PS)}$.

        **Move 5: DWL.** $W = ${F(CS)} + ${F(PS)} = ${F(W)}$, so $DWL = ${F(Ws)} - ${F(W)} = ${F(DWL)}$. Triangle check: at $Q = ${Qx}$ demand is ${a - b * Qx} and supply is ${c + d * Qx}, a gap of ${gap}; $\tfrac12(${k})(${gap}) = ${F(DWL)}$ ✓.
      `,
    };
  });

  gen('m3_lr_eqsurplus', () => {
    const p0 = pick([0, 2, 4]), u = pick([5, 10, 15, 20]), D = pick([10, 20]), B = pick([5, 10, 20]);
    const Ps = p0 + u, Qs = D * u, A = B * Ps + Qs, choke = A / B;
    const CS = 0.5 * Qs * (choke - Ps), PS = 0.5 * Qs * (Ps - p0);
    return {
      title: 'Equilibrium surplus (DS9 style)',
      q: md`Market demand is $Q^D = ${A} - ${B}P$ and market supply is $Q^S = ${D}P${p0 ? ` - ${D * p0}` : ''}$. Find the equilibrium price and quantity, consumer surplus, producer surplus and total (social) surplus.`,
      plan: [
        plan('First move?', 'Set $Q^D = Q^S$ and solve for $P$', [
          ['Find where demand hits zero', 'That is the top of the CS triangle, not the equilibrium.'],
          ['Set $P = MC$ for one firm', 'There is no firm here: use the market curves.'],
          ['Set $Q^D = 0$ and $Q^S = 0$', 'Those are the two intercepts; you need them later, but the equilibrium comes first.'],
        ], 'Then plug $P$ into either curve for $Q$.'),
        plan('What is the height of the CS triangle?', `From $P^*$ up to the price where demand hits zero, $${A}/${B} = ${F(choke)}$`, [
          [`From $P^*$ up to ${A}`, `${A} is the **quantity** intercept. Solve $Q^D = 0$ for the price.`],
          ['From 0 up to $P^*$', 'That region is below the price: PS territory, not CS.'],
          ['$P^*$ itself', 'CS is the gap between what buyers would pay and what they do pay.'],
        ], `$CS = \\tfrac12 Q^*(${F(choke)} - P^*)$; $PS = \\tfrac12 Q^*(P^* - ${p0})$.`),
      ],
      parts: [N('P^*', Ps), N('Q^*', Qs), N('CS', CS), N('PS', PS), N('W', CS + PS)],
      hints: [`$${A} - ${B}P = ${D}P${p0 ? ` - ${D * p0}` : ''}$.`, `Supply starts at $P = ${p0}$.`],
      sol: md`
        **Move 1: equilibrium.** $${A} - ${B}P = ${D}P${p0 ? ` - ${D * p0}` : ''} \Rightarrow ${A + D * p0} = ${B + D}P \Rightarrow P^* = ${Ps}$. $Q^* = ${A} - ${B}(${Ps}) = ${Qs}$.

        **Move 2: the intercepts.** Demand hits zero at $P = ${A}/${B} = ${F(choke)}$. Supply starts at $P = ${p0}$.

        **Move 3: CS.** $\tfrac12(${Qs})(${F(choke)} - ${Ps}) = ${F(CS)}$.

        **Move 4: PS.** $\tfrac12(${Qs})(${Ps} - ${p0}) = ${F(PS)}$.

        **Move 5: total.** $W = ${F(CS)} + ${F(PS)} = ${F(CS + PS)}$.
      `,
    };
  });


  // ------------------------------------------------------------------ the unit
  const L1 = {
    id: 'm3-lr1', title: 'Entry and exit: shutdown is short run, exit is long run', ref: 'Lecture 16 · DS9 Q1',
    steps: [
      R(md`
        ### What this looks like on the exam

        | The problem says… | It is really asking… | The move |
        |---|---|---|
        | "will the firm shut down?", "in the short run, will it produce?" | Is $P$ below **min AVC**? | $MC = AVC$, then compare |
        | "will the firm exit?", "in the long run it supplies a positive amount if the price is above…" | Is $P$ below **min LRAC**? | $LRMC = LRAC$, then compare |
        | "will firms enter or exit?", "what happens to the number of firms?" | What is the **sign of economic profit**? | $P > AC$: entry. $P < AC$: exit |
        | "the price is between AVC and AC; what happens?" | Short run versus long run | operate now, exit eventually |
        | "what happens to the market price as firms enter?" | Which way does market supply shift? | entry: right, price falls |
        | "the firm's long-run supply curve" | Where does LRMC count as supply? | rising LRMC at or above min LRAC |

        One idea runs through all of it: **a firm stops producing when the price does not cover the cost it could avoid by stopping.** What can be avoided depends on the time horizon.
      `),
      R(md`
        ### Short run and long run, from a food truck

        Maria runs a food truck. She signed a one-year lease on the truck. Ingredients and her helper's wages depend on how many meals she sells.

        **This month (short run).** The lease is owed whether the truck moves or not. Her choices: open and sell $q$ meals, or **shut down** for the month ($q = 0$) and still pay the lease. Shutting down is a pause, not a goodbye.

        **Next year (long run).** The lease is up. She can hand back the keys and owe nothing at all. That is **exit**. Also, anyone else can buy a truck and **enter**.

        | | Short run | Long run |
        |---|---|---|
        | Inputs | at least one is fixed (the truck) | all can be adjusted |
        | Costs | some are unavoidable (the fixed cost $F$) | every cost can be avoided by leaving |
        | Number of firms | fixed | firms enter and exit |
        | "Stop" means | **shut down**: $q = 0$, still pay $F$ | **exit**: leave, pay nothing |
        | Stop if | $P < \min AVC$ | $P < \min LRAC$ |
        | Firm's supply curve | rising MC above min AVC | rising LRMC above min LRAC |

        Here LRAC is long-run average cost (total long-run cost divided by $q$) and LRMC is long-run marginal cost (its derivative).
      `),
      RF(md`
        ### The lecture's review question

        A firm has min AVC $= 14$ and min AC $= 23.75$. What does it do at prices \$14, \$18, \$23.75 and \$40?

        [[fig:rev]]

        Use the two comparisons from Part 8. Price versus min AVC decides operate or shut down. Price versus min AC decides profit or loss. Then add the new column: what profit **signals** about the long run.

        | Price | This period (short run) | Economic profit | Long-run signal |
        |---|---|---|---|
        | \$14 | indifferent: at min AVC, producing and shutting down both lose $F$ | negative | exit |
        | \$18 | operate at a loss: price covers AVC but not AC | negative | exit |
        | \$23.75 | break even: at min AC | zero | nobody enters or exits |
        | \$40 | operate at a profit | positive | entry |

        !!intuition Short-run profit is a signal
          Positive economic profit means this industry beats every other use of the owners' money and time. Outsiders notice and come in. Negative economic profit means the owners would do better elsewhere, so they leave when they can.
      `, { rev: { svg: reviewFig, cap: 'The lecture’s firm: the dashed price lines are \\$14 (bottom of AVC), \\$18, \\$23.75 (bottom of AC) and \\$40.' } }),
      Q(md`Lecture "Your Turn": the market price is below a firm's AC but above its AVC. What happens?`, ['The firm operates now but eventually exits', 'The firm shuts down immediately', 'The firm operates at a loss forever', 'More firms enter because profit is positive'], 0,
        [null, 'Price covers AVC, so producing loses less than shutting down this period.', 'Losses are a signal to leave. Once the fixed commitments end, the firm exits.', 'Price below AC means negative economic profit, which repels entrants.'],
        md`Short run: price covers variable cost, so producing shrinks the loss compared with shutting down. Long run: negative profit means exit, and as firms leave, market supply falls and the price rises.`),
      R(md`
        ### How entry and exit move the market price

        Profit does not stay put. Follow the chain.

        **Profit ($P > AC$ at the chosen output).** New firms enter. More firms means more output at every price: **market supply shifts right**. Along the demand curve, more output sells only at a lower price: **the price falls**. Each firm's profit shrinks.

        **Loss ($P < AC$).** Firms exit. **Market supply shifts left.** The price **rises**. The losses of the firms that stay shrink.

        When does it stop? Only when there is no reason to enter or leave: **economic profit is zero.** With identical firms that happens at $P = \min LRAC$ (next lesson).

        !!key The entry-exit chain
          $P > AC \Rightarrow \pi > 0 \Rightarrow$ entry $\Rightarrow$ supply shifts right $\Rightarrow P$ falls.

          $P < AC \Rightarrow \pi < 0 \Rightarrow$ exit $\Rightarrow$ supply shifts left $\Rightarrow P$ rises.

          Long-run free-entry equilibrium: $\pi = 0$.

        !!trap Zero economic profit is not "doing badly"
          Economic cost includes the owner's forgone wage and the return her money could earn elsewhere. Zero economic profit means she earns exactly that. Accounting profit is still positive.
      `),
      Q(md`Firms in an industry earn positive economic profit and nothing stops new firms from coming in. Over time…`, ['firms enter, market supply shifts right, and the price falls', 'firms enter and the price rises', 'existing firms raise their prices', 'nothing changes: profit is good for everyone'], 0,
        [null, 'More sellers at every price push the price down, not up.', 'Price takers cannot raise their price; buyers would go elsewhere.', 'Profit above the next-best option attracts outsiders until it is gone.'],
        md`More firms, more output at every price, and the only way to sell more is a lower price. Entry continues until profit is zero.`),
      Q(md`In a long-run free-entry equilibrium, each firm's **economic** profit is…`, ['zero', 'positive but small', 'negative', 'equal to its accounting profit'], 0,
        [null, 'Any positive profit would still attract entry.', 'Any loss would still push firms out.', 'Accounting profit leaves out implicit costs, so it is positive when economic profit is zero.'],
        md`Entry and exit stop only when nobody gains by moving: $\pi = 0$. The owners still earn their opportunity cost.`),
      RF(md`
        ### The long-run exit decision

        In the long run there is no fixed cost: every cost is a choice. So the firm compares price with its **full** cost per unit, LRAC.

        Write profit as a rectangle:

        $$\pi(q) = Pq - LRC(q) = \big[P - LRAC(q)\big]\,q$$

        If $P < \min LRAC$, then $P$ is below LRAC at **every** $q$, so every positive output loses money. Exiting gives $\pi = 0$. **Exit.**

        If $P \ge \min LRAC$, produce where $P = LRMC$ on the rising branch, exactly like the short-run rule. At $P = \min LRAC$ exactly, profit is zero whether it produces or exits: indifferent.

        !!key One principle, two tests
          Stop producing when the price does not cover the **avoidable** cost per unit.

          Short run: only variable cost is avoidable $\Rightarrow$ compare $P$ with **min AVC** (shut down).

          Long run: every cost is avoidable $\Rightarrow$ compare $P$ with **min LRAC** (exit).

        ### Worked example (DS9 Q1)

        A competitive firm has long-run cost $LRC(q) = 2q^2 + 8$. In the long run it supplies a positive amount if the price is above what amount?

        **Read the cost first.** The 8 looks like a fixed cost, but in the long run it is not sunk: it is the cost of having a plant at all, and the firm avoids it by exiting. So it stays inside LRAC.

        **Move 1: write LRAC and LRMC.**
        $$LRAC = \frac{2q^2 + 8}{q} = 2q + \frac{8}{q}, \qquad LRMC = \frac{dLRC}{dq} = 4q$$

        **Move 2: bottom of LRAC, where LRMC crosses it.**
        $$4q = 2q + \frac{8}{q}$$
        Subtract $2q$ from both sides:
        $$2q = \frac{8}{q}$$
        Multiply both sides by $q$, then divide by 2:
        $$2q^2 = 8 \;\Rightarrow\; q^2 = 4 \;\Rightarrow\; q = 2$$

        **Move 3: the price there.** $LRMC(2) = 4(2) = 8$. Check with LRAC: $2(2) + 8/2 = 4 + 4 = 8$ ✓.

        **Answer:** it produces only if $P > 8$; at \$8 it is indifferent.

        [[fig:lrs]]

        **Its long-run supply curve.** Below \$8: $q = 0$. At or above \$8: $P = 4q$, so $q = P/4$. At $P = 12$: $q = 3$ and $\pi = 12(3) - (18 + 8) = 10$.

        !!intuition Does this make sense?
          Supply jumps from 0 straight to 2 units at \$8. There is no price at which the firm wants to make just 1 unit: at $q = 1$, LRAC is $2 + 8 = 10$, and at a price of 10 it would rather make $10/4 = 2.5$ units.

        **Short run versus long run, same firm.** Suppose this year the 8 is a lease already signed (sunk). Then $AVC = 2q$, whose minimum is 0. At $P = 5$ the firm produces $q = 5/4 = 1.25$ this year and loses $6.25 - (3.125 + 8) = -4.875$, better than losing the 8. Next year, $5 < 8$: it exits.
      `, { lrs: { svg: lrSupplyFig, cap: 'Green: the firm’s long-run supply. Zero output below \\$8 (the vertical axis), then the rising LRMC from the bottom of LRAC. At \\$12 it supplies 3.' } }),
      Q(md`Lecture "Your Turn": for a competitive firm, the long-run supply curve is…`, ['the rising LRMC curve at or above minimum LRAC', 'the entire LRMC curve', 'LRMC above minimum AVC', 'a horizontal line at the market price'], 0,
        [null, 'Below min LRAC the firm exits and supplies zero, so the lower part of LRMC is not supply.', 'In the long run there is no separate fixed cost: the test is min LRAC, not min AVC.', 'A horizontal line is the industry’s long-run supply (identical firms, free entry), not one firm’s.'],
        md`The firm picks $P = LRMC$ as long as $P$ covers min LRAC. The flat line at min LRAC is the **industry** curve (next lesson).`),
      Q(md`In the long run, the firm's "shutdown point" is the minimum of…`, ['LRAC', 'AVC', 'LRMC', 'AFC'], 0,
        [null, 'AVC is the short-run test, when part of cost is sunk.', 'The minimum of MC is not a decision point.', 'There is no fixed cost in the long run.'],
        md`All costs are variable in the long run, so the firm leaves if it would suffer an economic loss: $P < \min LRAC$.`),
      Q(md`Min AVC is \$9 and min AC is \$18. Which price makes the firm shut down this period **and** exit in the long run?`, ['\\$7', '\\$12', '\\$18', '\\$25'], 0,
        [null, '\\$12 covers AVC: operate now, exit later.', 'At \\$18 the firm breaks even and stays.', 'At \\$25 the firm profits and attracts entry.'],
        md`Below min AVC it cannot even cover variable cost: shut down now. A price that low also means losses, so it leaves in the long run.`),
      R(md`
        ### Spot it: no numbers needed

        Each card is only a plan question. Decide, then read why.
      `),
      P({ q: md`Min AVC = \$6 and min AC = \$9 for every firm. The market price is \$7.`,
        plan: plan('What happens in the short run and in the long run?', 'Operate at a loss now; firms exit in the long run', [
          ['Shut down now', 'The price covers AVC (7 > 6), so producing loses less than the fixed cost.'],
          ['Operate at a loss forever', 'Losses are a signal. When fixed commitments end, firms leave and the price rises.'],
          ['Firms enter', 'Entry needs positive profit; 7 is below min AC.'],
        ], 'Short run: compare with min AVC (operate). Long run: compare with min AC (loss, so exit, price rises toward \\$9).') }),
      P({ q: md`Every firm earns positive economic profit at the current price of \$15. Min LRAC is \$12. Entry is free.`,
        plan: plan('What happens next?', 'Firms enter, market supply shifts right, and the price falls toward \\$12', [
          ['Firms exit', 'Exit follows losses. These firms are profitable.'],
          ['The price stays at \\$15 because firms are price takers', 'Price takers cannot set the price, but entry changes market supply, and that moves the price.'],
          ['The price falls below \\$12', 'Entry stops once profit hits zero, at \\$12. Below that, firms would leave again.'],
        ], 'Profit attracts entry until $P = \\min LRAC = 12$.') }),
      P({ q: md`DS9 phrasing: "In the long run, the firm will supply a positive amount of output if the price is greater than what amount?" You are given $LRC(q)$.`,
        plan: plan('What do you compute?', 'Minimum LRAC: solve $LRMC = LRAC$ (or $dLRAC/dq = 0$), then evaluate', [
          ['Minimum AVC', 'That is the short-run shutdown price. The question says long run, where every cost can be avoided.'],
          ['The price where $LRMC = 0$', 'Marginal cost being zero says nothing about covering cost.'],
          ['Set $P = LRMC$', 'No price is given: you are finding a threshold that comes from the cost curve alone.'],
        ], 'Find the $q$ at the bottom of LRAC, then the price is $LRAC$ (= LRMC) there.') }),
      P({ q: md`A shop owner's accounting profit is \$50,000 a year. She could earn \$50,000 a year managing someone else's shop.`,
        plan: plan('What happens to the number of shops in the long run?', 'Nothing: economic profit is zero', [
          ['Shops enter: profit is \\$50,000', 'That is accounting profit. Subtract her \\$50,000 opportunity cost: economic profit is zero.'],
          ['Shops exit: she earns nothing', 'Zero economic profit means she earns exactly her next-best option, not nothing.'],
          ['She should shut down', 'Shutdown compares price with AVC, and nothing here says price is below AVC.'],
        ], 'Economic profit $= 50{,}000 - 50{,}000 = 0$: no reason to enter or leave.') }),
      P({ q: md`A firm loses money but the price is above its min AVC. A classmate says: "It covers its variable cost, so it will stay in business forever."`,
        plan: plan('Is the classmate right?', 'No: it operates now, but once its fixed costs become avoidable it exits', [
          ['Yes: covering AVC means it never has a reason to leave', 'Covering AVC only beats shutting down **while the fixed cost is sunk**. In the long run that cost can be avoided too.'],
          ['No: it should shut down right now', 'Shutting down now loses the whole fixed cost; producing loses less.'],
          ['Yes, because other firms will exit and raise the price for it', 'Exit does raise the price, but that is the long-run adjustment; the firm itself still faces the exit test, $P$ versus min LRAC.'],
        ], 'Short run: $P$ vs min AVC (operate). Long run: $P$ vs min LRAC (exit).') }),
      R(md`
        ### Practice: plan first, then numbers
      `),
      P({ title: 'Lecture review: four prices', q: md`A firm has min AVC = \$14 and min AC = \$23.75. Classify the firm's short-run decision at each price, then say what happens in the long run at \$18.`,
        plan: plan('Which two numbers decide everything?', 'min AVC (operate or shut down) and min AC (profit or loss)', [
          ['MC and AC at the current output', 'You do not need the output: the two minimums split every price into zones.'],
          ['Only min AC', 'Min AC alone cannot tell "shut down" from "operate at a loss".'],
          ['Only min AVC', 'Min AVC alone cannot tell a loss from a profit.'],
        ], 'Place each price relative to 14 and 23.75.'),
        parts: [
          FIX('P = 14', ['shut down', 'indifferent', 'operate at a loss', 'break even', 'earn a profit'], 1, ['At exactly min AVC both choices lose the fixed cost.', null, 'At exactly 14 producing gains nothing over shutting down.', 'Break-even is at 23.75.', 'Profit needs a price above 23.75.']),
          FIX('P = 18', ['shut down', 'indifferent', 'operate at a loss', 'break even', 'earn a profit'], 2, ['18 covers AVC.', 'Indifference is only at 14.', null, 'Break-even is at 23.75.', '18 is below min AC.']),
          FIX('P = 23.75', ['shut down', 'indifferent', 'operate at a loss', 'break even', 'earn a profit'], 3, ['23.75 covers AVC.', 'Indifference is only at 14.', 'At min AC the loss is exactly zero.', null, 'Profit needs a price above min AC.']),
          FIX('P = 40', ['shut down', 'indifferent', 'operate at a loss', 'break even', 'earn a profit'], 4, ['40 covers AVC.', 'Indifference is only at 14.', '40 is above min AC.', '40 is above min AC.', null]),
          FIX('At \\$18, in the long run', ['firms exit and the price rises', 'firms enter and the price falls', 'nothing changes'], 0, [null, 'Entry follows profit; at 18 firms lose money.', 'Losses are a signal to leave.']),
        ],
        sol: md`**Move 1:** $14 = \min AVC$: indifferent. **Move 2:** $14 < 18 < 23.75$: operate at a loss. **Move 3:** $23.75 = \min AC$: break even. **Move 4:** $40 > 23.75$: profit. **Long run at \$18:** losses, so firms exit, market supply shifts left, and the price rises until profit is zero.` }),
      P({ title: 'Exit price from a quadratic cost', q: md`A competitive firm has long-run cost $LRC(q) = 3q^2 + 48$ for $q > 0$.`,
        plan: [
          plan('To find the long-run exit price, set…', '$LRMC = LRAC$', [
            ['$LRMC = 0$', 'That gives $q = 0$, which is not a cost landmark that matters.'],
            ['$MC = AVC$', 'That is the short-run shutdown test. In the long run the 48 is avoidable, so it stays in the average.'],
            ['$P = LRMC$', 'No price is given yet; the exit price comes from the cost curve alone.'],
          ], '$LRAC = 3q + 48/q$ and $LRMC = 6q$.'),
        ],
        parts: [N('q\\text{ at }\\min LRAC', 4), N('P_{\\text{exit}}', 24), N('q\\text{ at }P = 30', 5), N('\\pi\\text{ at }P = 30', 27)],
        hints: ['$6q = 3q + 48/q$.'],
        sol: md`**Move 1:** $LRAC = 3q + 48/q$, $LRMC = 6q$. **Move 2:** $6q = 3q + 48/q \Rightarrow 3q = 48/q \Rightarrow 3q^2 = 48 \Rightarrow q^2 = 16 \Rightarrow q = 4$. **Move 3:** $P_{\text{exit}} = LRMC(4) = 24$ (check: $LRAC(4) = 12 + 12 = 24$ ✓). **Move 4:** at $P = 30$: $30 = 6q \Rightarrow q = 5$; $\pi = 150 - (75 + 48) = 27$.` }),
      P({ title: 'Operate now, exit later', q: md`A firm has $C(q) = q^3 - 6q^2 + 18q + 32$. The price is \$12.75. Assume that in the long run the same curve applies but the 32 can also be avoided by leaving.`,
        plan: [
          plan('First: what is the shutdown price?', 'Min AVC: set $MC = AVC$', [
            ['Min AC', 'That is the break-even price. The 32 is sunk this period, so it does not enter the shutdown test.'],
            ['$MC(0) = 18$', 'The intercept of MC is not the bottom of AVC.'],
            ['The price, 12.75', 'The shutdown price is a property of the cost curves, not of today’s price.'],
          ], '$AVC = q^2 - 6q + 18$, $MC = 3q^2 - 12q + 18$.'),
          plan('$12.75 = 3q^2 - 12q + 18$ has roots $q = 0.5$ and $q = 3.5$. Which is the output?', '$q = 3.5$, on the rising branch of MC', [
            ['$q = 0.5$', 'There MC is falling: the next units cost less than the price, so profit is still rising.'],
            ['Their average, 2', 'Only the larger root is a profit maximum.'],
            ['Zero: the firm loses money', 'Losing money is not the shutdown test; compare the price with min AVC.'],
          ], 'Larger root: $q = 3.5$. Then profit and the two decisions.'),
        ],
        parts: [N('\\min AVC', 9), N('\\min AC', 18), N('q^*', 3.5), N('\\pi', -19.75),
          FIX('This period', ['operate', 'shut down'], 0, [null, '12.75 > 9 covers AVC; operating loses 19.75, shutting down loses 32.']),
          FIX('In the long run', ['exit', 'stay'], 0, [null, '12.75 < 18: every output loses money once the 32 is avoidable.'])],
        hints: ['For min AC try $q = 4$ in $MC = AC$.'],
        sol: md`
          **Move 1: min AVC.** $3q^2 - 12q + 18 = q^2 - 6q + 18 \Rightarrow 2q^2 - 6q = 0 \Rightarrow 2q(q - 3) = 0 \Rightarrow q = 3$. $AVC(3) = 9 - 18 + 18 = 9$.

          **Move 2: min AC.** $MC = AC$: $3q^2 - 12q + 18 = q^2 - 6q + 18 + 32/q \Rightarrow 2q^2 - 6q = 32/q \Rightarrow 2q^3 - 6q^2 - 32 = 0$. Try $q = 4$: $128 - 96 - 32 = 0$ ✓. $AC(4) = 16 - 24 + 18 + 8 = 18$.

          **Move 3: output.** $3q^2 - 12q + 5.25 = 0 \Rightarrow q^2 - 4q + 1.75 = 0 \Rightarrow q = \dfrac{4 \pm \sqrt{16 - 7}}{2} = \dfrac{4 \pm 3}{2}$, so $q = 3.5$.

          **Move 4: profit.** $TR = 12.75 \times 3.5 = 44.625$; $C(3.5) = 42.875 - 73.5 + 63 + 32 = 64.375$; $\pi = -19.75$.

          **Move 5: decisions.** This period $12.75 > 9$: operate (lose 19.75 instead of 32). Long run $12.75 < 18$: exit.
        ` }),
      P({ title: 'A profit that will not last', q: md`Every firm in an industry has $LRC(q) = q^2 + 64$. The market price is currently \$40.`,
        plan: [
          plan('How much does one firm produce at \\$40?', '$40 = LRMC = 2q$', [
            ['$40 = LRAC = q + 64/q$', 'That finds zero profit, not the best output.'],
            ['The min-LRAC quantity', 'That is where firms end up after entry, not what one firm picks at \\$40.'],
            ['$40 = MR = 40 - 2q$', 'A price taker’s MR is the price itself.'],
          ], '$q = 20$. Then profit, then ask what profit does to entry.'),
          plan('Where does the price end up in the long run?', 'At min LRAC: $LRMC = LRAC$', [
            ['It stays at \\$40', 'Positive profit attracts entry, which lowers the price.'],
            ['At zero', 'Entry stops when profit is zero, which happens at min LRAC, not at a zero price.'],
            ['At min AVC', 'There is no sunk cost in the long run; the resting point is min LRAC.'],
          ], '$2q = q + 64/q \\Rightarrow q^2 = 64 \\Rightarrow q = 8$; price $= 16$.'),
        ],
        parts: [N('q\\text{ at }P = 40', 20), N('\\pi\\text{ at }P = 40', 336),
          FIX('Over time', ['firms enter', 'firms exit', 'nothing changes'], 0, [null, 'Exit follows losses.', 'Profit of 336 attracts entrants.']),
          N('\\text{long-run }P', 16), N('\\text{long-run }q\\text{ per firm}', 8)],
        sol: md`**Move 1:** $40 = 2q \Rightarrow q = 20$. $\pi = 40(20) - (400 + 64) = 800 - 464 = 336 > 0$. **Move 2:** profit attracts entry; supply shifts right; price falls. **Move 3:** it stops at min LRAC: $2q = q + 64/q \Rightarrow q^2 = 64 \Rightarrow q = 8$, $P = 2(8) = 16$ (check $LRAC(8) = 8 + 8 = 16$ ✓).` }),
      G('m3_lr_signal', { need: 3 }),
      G('m3_lr_exitprice', { need: 2 }),
    ],
  };

  C.unit({
    id: 'm3u3', exam: 'm3', num: 'Part 9', title: 'Long-run supply and welfare', blurb: 'shutdown versus exit, P = min LRAC and the number of firms, short run versus long run, producer surplus, deadweight loss',
    lessons: [
      L1,
      // ================================================================ lesson 2
      {
        id: 'm3-lr2', title: 'Long-run equilibrium: P = min LRAC, then count the firms', ref: 'Lecture 16 · DS9 Q1',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "find the long-run equilibrium price" | Where is profit zero for every firm? | $P^* = \min LRAC$ |
            | "how much does each firm produce in the long run?" | Where is the bottom of LRAC? | $q^*$: $LRMC = LRAC$ or $dLRAC/dq = 0$ |
            | "how many firms are in the industry in the long run?" | Market quantity at $P^*$, shared out | $n = Q^D(P^*)/q^*$ |
            | "what does the long-run market supply curve look like?" | What price can supply any quantity? | flat at min LRAC |
            | "demand doubles; what is the new long-run price?" | Does cost per unit change? | same $P^*$; only $n$ changes |
            | "why identical firms, free entry, constant input prices?" | What makes the curve flat? | each failure tilts or breaks it |
          `),
          R(md`
            ### Why the price must end at the bottom of LRAC

            Picture a town's bakeries. Every bakery has the same cost curves, anyone can open one, and flour costs the same no matter how many bakeries there are.

            **Suppose the price is above min LRAC.** An outsider can open a bakery, produce at the bottom of LRAC, and earn $P - \min LRAC > 0$ on every loaf. So outsiders enter, market supply shifts right, and the price falls. The price cannot stay above min LRAC.

            **Suppose the price is below min LRAC.** Then $P < LRAC$ at every output: every bakery loses money. Some close, supply shifts left, and the price rises. The price cannot stay below min LRAC either.

            The only price where nobody wants to move:

            $$P^* = \min LRAC$$

            **How much does each firm make?** Each firm still sets $P = LRMC$. At the bottom of LRAC, LRMC crosses LRAC, so $P^* = LRMC$ there too. Every firm produces at the bottom of its LRAC: call that output $q^*$.

            !!key Long-run competitive equilibrium (identical firms)
              $$P^* = LRMC(q^*) = LRAC(q^*) = \min LRAC$$
              Each firm makes $q^*$ and earns zero economic profit.

            !!intuition The long run adjusts the number of firms, not the price
              With these three assumptions, any market quantity can be produced at the same cost per unit: just add or remove copies of the $q^*$-sized firm. So the long-run market supply curve is **flat** at min LRAC. Demand decides only how many firms there are.
          `),
          Q(md`Every firm has min LRAC = \$8. In the long run the market price is \$8. Demand then rises permanently. The new long-run price is…`, ['\\$8', 'above \\$8', 'below \\$8', 'cannot tell without the demand curve'], 0,
            [null, 'Above \\$8 there is profit, which keeps attracting entrants until the price is back at \\$8.', 'Below \\$8 every firm loses money.', 'With a flat long-run supply curve, demand sets the quantity, not the price.'],
            md`The long-run price is pinned by cost: min LRAC. Higher demand means more firms, each still making $q^*$.`),
          R(md`
            ### Finding the bottom of LRAC: two ways

            **Way A: $LRMC = LRAC$.** Marginal cost crosses average cost at average cost's minimum (Part 8: a below-average unit pulls the average down, an above-average unit pulls it up).

            **Way B: $dLRAC/dq = 0$.** The bottom of a U-shaped curve is where its slope is zero.

            Both give the same $q^*$. Pick the easier algebra:

            | Cost shape | Easier way | Why |
            |---|---|---|
            | $LRC = aq^2 + F$ (constant term) | either; Way A is short | $2aq = aq + F/q \Rightarrow aq^2 = F$ |
            | $LRC = q^3 + bq^2 + cq$ (no constant) | Way B | $LRAC = q^2 + bq + c$ is a parabola |
            | cubic **with** a constant | Way A, then try small whole numbers | the cubic equation usually has a whole-number root |

            **The shortcut for $aq^2 + F$.** Here $a$ and $F$ are the numbers in the cost function.
            $$LRMC = 2aq, \qquad LRAC = aq + \frac{F}{q}$$
            Set them equal and subtract $aq$:
            $$aq = \frac{F}{q} \;\Rightarrow\; aq^2 = F \;\Rightarrow\; q^* = \sqrt{F/a}$$
            Then $P^* = 2aq^* = 2a\sqrt{F/a} = 2\sqrt{aF}$.

            DS9 Q1 check: $a = 2$, $F = 8$: $q^* = \sqrt{4} = 2$, $P^* = 2\sqrt{16} = 8$ ✓.
          `),
          Q(md`$LRC(q) = q^3 - 10q^2 + 40q$. The quickest way to $q^*$ is…`, ['divide by $q$ and set $dLRAC/dq = 2q - 10 = 0$', 'set $LRMC = 0$', 'find the bottom of LRMC', 'set $LRC = 0$'], 0,
            [null, 'Zero marginal cost is not the bottom of average cost.', 'LRMC bottoms out to the left of LRAC’s minimum.', 'Total cost being zero tells you nothing about cost per unit.'],
            md`$LRAC = q^2 - 10q + 40$, a parabola. Its slope $2q - 10$ is zero at $q^* = 5$, and $P^* = 25 - 50 + 40 = 15$.`),
          RF(md`
            ### Worked example 1: DS9 firms meet a demand curve

            Every firm has $LRC(q) = 2q^2 + 8$. Market demand is $Q = 200 - 10P$. Find $q^*$, $P^*$, $Q^*$ and $n$.

            **Move 1: bottom of LRAC.** From DS9 Q1: $LRMC = 4q$, $LRAC = 2q + 8/q$, equal at $q^* = 2$.

            **Move 2: long-run price.** $P^* = LRAC(2) = 4 + 4 = 8$.

            **Move 3: market quantity from demand at $P^*$.** Demand takes a price and returns the market quantity:
            $$Q^* = 200 - 10(8) = 200 - 80 = 120$$

            **Move 4: count the firms.** Each firm makes $q^* = 2$, so
            $$n = \frac{Q^*}{q^*} = \frac{120}{2} = 60$$

            **Move 5: check.** Each firm: $TR = 8 \times 2 = 16$ and $LRC(2) = 8 + 8 = 16$, so $\pi = 0$ ✓.

            [[fig:ds9]]
          `, { ds9: { svg: pair(ds9Firm, ds9Mkt), cap: 'Left: one firm produces q* = 2 at the bottom of LRAC, where P* = 8. Right: the long-run market supply is flat at 8; demand at 8 is 120 units, so 60 firms.' } }),
          R(md`
            ### Worked example 2: a cubic cost

            Every firm has $LRC(q) = q^3 - 10q^2 + 40q$. Demand is $Q = 1000 - 20P$.

            **Move 1: LRAC.** Divide every term by $q$:
            $$LRAC = q^2 - 10q + 40$$

            **Move 2: its bottom.** Set the slope to zero:
            $$\frac{dLRAC}{dq} = 2q - 10 = 0 \;\Rightarrow\; q^* = 5$$

            **Move 3: price.** $P^* = LRAC(5) = 25 - 50 + 40 = 15$. Check with $LRMC = 3q^2 - 20q + 40$: $75 - 100 + 40 = 15$ ✓.

            **Move 4: demand at \$15.** $Q^* = 1000 - 20(15) = 700$.

            **Move 5: firms.** $n = 700/5 = 140$.

            !!trap Plug the price into demand, not the firm's output
              $Q^D(P^*)$ is the **market** quantity. A common slip is to plug $q^* = 5$ into demand. Demand takes a price.
          `),
          Q(md`Same industry ($q^* = 5$, $P^* = 15$). Demand becomes $Q = 2000 - 40P$ (twice as large at every price). In the long run…`, ['P stays 15 and the number of firms doubles to 280', 'P doubles and n stays 140', 'P and n both double', 'each firm doubles its output to 10'], 0,
            [null, 'The long-run price is set by cost, which did not change.', 'The price stays at min LRAC; only n adjusts.', 'Each firm returns to the bottom of LRAC, q* = 5.'],
            md`$Q^* = 2000 - 600 = 1400$, $n = 1400/5 = 280$. The flat long-run supply serves any quantity at \$15.`),
          Q(md`Demand at $P^*$ divided by $q^*$ gives 40.5. The lecture's rule says the long-run number of firms is the largest number for which the price is at least min LRAC. So…`, ['40 firms', '41 firms', '40.5 firms', 'zero firms'], 0,
            [null, 'With 41 firms, supplying at min LRAC would overshoot demand, so the price would fall below min LRAC: losses.', 'Firms come in whole units.', 'There is plenty of demand for 40 firms at a price at or above min LRAC.'],
            md`With 40 firms the price sits at or slightly above min LRAC (no losses). A 41st entrant would push the price below min LRAC and lose money, so it stays out.`),
          R(md`
            ### Which test when

            Four look-alike conditions. Each answers a different question.

            | You want… | Use | Why |
            |---|---|---|
            | one firm's output at a given price | $P = MC$ (short run) or $P = LRMC$ (long run), rising branch | the next unit just pays for itself |
            | the short-run shutdown price | min AVC: $MC = AVC$ | the fixed cost is paid either way |
            | the long-run exit price, or the long-run market price | min LRAC: $LRMC = LRAC$ | every cost can be avoided; entry and exit push profit to zero |
            | the short-run market price ($n$ fixed) | $n\,q(P) = Q^D(P)$ | supply equals demand |
            | the long-run number of firms | $n = Q^D(P^*)/q^*$ | the price is pinned; $n$ adjusts |

            !!trap Short-run equilibrium is not $P = \min LRAC$
              If the problem fixes the number of firms ("there are 60 firms"), the price comes from supply equals demand and can be anything. $P = \min LRAC$ is the answer only after entry and exit have finished.
          `),
          RF(md`
            ### The three assumptions behind a flat long-run supply curve

            The lecture: **identical firms, free entry and exit, constant input prices** make the long-run market supply flat at min LRAC.

            | Assumption | Why it makes supply flat | If it fails |
            |---|---|---|
            | identical firms | every entrant has the same min LRAC | cheaper firms enter first; supply rises as costlier firms are needed |
            | free entry and exit | anyone can copy a profitable firm | licenses or patents block entry; price can stay above min LRAC |
            | constant input prices | entrants do not raise anyone's cost | **increasing-cost industry**: min LRAC rises as the industry grows |

            Increasing input prices, briefly: when vineyards expand, land in the valley gets more expensive for **every** vineyard. Each firm's min LRAC rises as output grows, so the long-run supply curve slopes **up**. A demand increase then raises the long-run price a little, not zero.

            [[fig:inc]]
          `, { inc: { svg: incFig, cap: 'Demand rises from D₁ to D₂. Constant input prices: the industry moves from A to B at the same price, 8. Increasing input prices: it moves along the rising dashed curve to B′, at a higher price P₂ and a smaller quantity.' } }),
          Q(md`As an industry expands, the price of a key input rises for every firm. The long-run industry supply curve is…`, ['upward sloping', 'flat at the original min LRAC', 'downward sloping', 'vertical'], 0,
            [null, 'Flat requires constant input prices: entrants must not raise anyone’s cost.', 'That would need input prices to fall as the industry grows.', 'Entry still adds output; it just costs more per unit.'],
            md`Bigger industry, costlier inputs, higher min LRAC: a higher price is needed to call forth more output.`),
          Q(md`Why does the flat long-run market supply curve sit exactly at min LRAC?`, ['Entrants are copies of existing firms, and any price above min LRAC invites more copies', 'Each firm’s LRMC is flat', 'The government sets the price at min LRAC', 'Consumers refuse to pay more than min LRAC'], 0,
            [null, 'Each firm’s LRMC still slopes up; the flatness comes from adding and removing firms.', 'No regulation is involved; entry and exit do it.', 'Consumers would pay more; competition from entrants is what holds the price down.'],
            md`More output comes from more firms, each at $q^*$ and cost per unit min LRAC. So the industry can supply any amount at that one price.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`"Each firm has $LRC(q) = \ldots$ and market demand is $Q = \ldots$. Find the long-run equilibrium price."`,
            plan: PLAN_LRP('LRC/q') }),
          P({ q: md`You found $P^* = 12$ and $q^* = 6$. Demand is $Q = 900 - 25P$. "How many firms are in the market in the long run?"`,
            plan: plan('What is the calculation?', '$Q^* = 900 - 25(12) = 600$, then $n = 600/6 = 100$', [
              ['$n = 900/6 = 150$', '900 is demand at a price of zero, not at the long-run price 12.'],
              ['$n = 600/12 = 50$', 'Divide by the output per firm (6), not by the price.'],
              ['Plug $q^* = 6$ into demand: $900 - 150 = 750$', 'Demand takes a price, not one firm’s output.'],
            ], 'Market quantity at $P^*$, divided by output per firm.') }),
          P({ q: md`An industry with identical firms, free entry and constant input prices is in long-run equilibrium at \$20. A health fad doubles demand.`,
            plan: plan('What is the new long-run price?', '\\$20: only the number of firms changes', [
              ['\\$40: demand doubled', 'The long-run price is set by min LRAC, which the fad does not change.'],
              ['Somewhat above \\$20', 'That happens only in an increasing-cost industry. Here input prices are constant.'],
              ['Below \\$20: more firms compete', 'More firms push the price down only to min LRAC; below it they lose money.'],
            ], 'Long-run supply is flat at \\$20; the market quantity and $n$ double.') }),
          P({ q: md`$LRC(q) = q^3 - 12q^2 + 60q$. "What output minimizes long-run average cost?"`,
            plan: plan('Fastest route?', '$LRAC = q^2 - 12q + 60$; set $2q - 12 = 0$, so $q^* = 6$', [
              ['Set $LRMC = 3q^2 - 24q + 60 = 0$', 'The bottom of average cost is not where marginal cost is zero (and this has no real root).'],
              ['Minimize LRMC: $6q - 24 = 0$, $q = 4$', 'LRMC bottoms out before LRAC does.'],
              ['Set $LRC = 0$', 'Total cost is zero only at $q = 0$.'],
            ], 'No constant term, so divide by $q$ and take the slope of the parabola. $P^* = 36 - 72 + 60 = 24$.') }),
          P({ q: md`More wineries open in a valley, and the rent on valley land rises for every winery.`,
            plan: plan('What does the long-run industry supply curve look like?', 'Upward sloping: an increasing-cost industry', [
              ['Flat at min LRAC', 'Flat needs constant input prices. Here entry raises everyone’s land cost.'],
              ['Vertical', 'Entry still adds output.'],
              ['The same as one winery’s LRMC', 'Industry supply also counts entry; it is not one firm’s curve.'],
            ], 'Min LRAC rises with industry size, so a bigger industry needs a higher price.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'DS9 firms, new demand', q: md`Every firm has $LRC(q) = 2q^2 + 8$. Demand is $Q = 300 - 15P$. Entry is free and input prices are constant.`,
            plan: [PLAN_LRP('2q + 8/q'), PLAN_N],
            parts: [N('q^*', 2), N('P^*', 8), N('Q^*', 180), N('n', 90)],
            sol: md`**Move 1:** $4q = 2q + 8/q \Rightarrow q^* = 2$. **Move 2:** $P^* = 8$. **Move 3:** $Q^* = 300 - 15(8) = 300 - 120 = 180$. **Move 4:** $n = 180/2 = 90$. Each firm: $16 - 16 = 0$ profit ✓.` }),
          P({ title: 'Quadratic cost', q: md`Every firm has $LRC(q) = 3q^2 + 27$. Demand is $Q = 900 - 25P$.`,
            plan: [PLAN_LRP('3q + 27/q'), PLAN_N],
            parts: [N('q^*', 3), N('P^*', 18), N('Q^*', 450), N('n', 150)],
            hints: ['Shortcut: $q^* = \\sqrt{F/a} = \\sqrt{27/3}$.'],
            sol: md`**Move 1:** $6q = 3q + 27/q \Rightarrow 3q^2 = 27 \Rightarrow q^2 = 9 \Rightarrow q^* = 3$. **Move 2:** $P^* = 6(3) = 18$ (check $LRAC(3) = 9 + 9 = 18$ ✓; shortcut $2\sqrt{81} = 18$ ✓). **Move 3:** $Q^* = 900 - 25(18) = 900 - 450 = 450$. **Move 4:** $n = 450/3 = 150$.` }),
          P({ title: 'Cubic cost, no constant', q: md`Every firm has $LRC(q) = q^3 - 8q^2 + 32q$. Demand is $Q = 2000 - 50P$.`,
            plan: [PLAN_LRP('q^2 - 8q + 32'), PLAN_N],
            parts: [N('q^*', 4), N('P^*', 16), N('Q^*', 1200), N('n', 300)],
            sol: md`**Move 1:** $LRAC = q^2 - 8q + 32$; $dLRAC/dq = 2q - 8 = 0 \Rightarrow q^* = 4$. **Move 2:** $P^* = 16 - 32 + 32 = 16$ (LRMC $= 3(16) - 64 + 32 = 16$ ✓). **Move 3:** $Q^* = 2000 - 800 = 1200$. **Move 4:** $n = 1200/4 = 300$.` }),
          P({ title: 'Cubic cost with a constant', q: md`Every firm has $LRC(q) = q^3 - 6q^2 + 18q + 32$ for $q > 0$. Demand is $Q = 360 - 10P$.`,
            plan: [
              plan('LRC has a constant, so $dLRAC/dq$ is messy. What do you do?', 'Set $LRMC = LRAC$, clear the fraction, and try small whole numbers', [
                ['Ignore the 32: it is a fixed cost', 'In the long run the 32 is avoidable by exiting, so it belongs in LRAC.'],
                ['Set $LRMC = 0$', 'That is not the bottom of average cost.'],
                ['Set $LRMC = AVC$', 'That is the short-run shutdown point, without the 32.'],
              ], '$3q^2 - 12q + 18 = q^2 - 6q + 18 + 32/q \\Rightarrow 2q^3 - 6q^2 - 32 = 0$. Try $q = 4$.'),
              PLAN_N,
            ],
            parts: [N('q^*', 4), N('P^*', 18), N('Q^*', 180), N('n', 45)],
            sol: md`**Move 1:** $2q^2 - 6q = 32/q \Rightarrow 2q^3 - 6q^2 - 32 = 0$. At $q = 4$: $128 - 96 - 32 = 0$ ✓, so $q^* = 4$. **Move 2:** $P^* = LRAC(4) = 16 - 24 + 18 + 8 = 18$. **Move 3:** $Q^* = 360 - 180 = 180$. **Move 4:** $n = 180/4 = 45$.` }),
          P({ title: 'Demand doubles', q: md`Every firm has $LRC(q) = 2q^2 + 8$. Demand doubles from $Q = 200 - 10P$ to $Q = 400 - 20P$.`,
            plan: plan('What changes in the long run?', 'Only the number of firms: the price stays at min LRAC = 8 and each firm still makes 2', [
              ['The price doubles', 'Cost per unit is unchanged, and entry keeps the price at min LRAC.'],
              ['Each firm doubles its output', 'Each firm returns to the bottom of LRAC, $q^* = 2$.'],
              ['Nothing changes', 'The market quantity at \\$8 doubles, so twice as many firms are needed.'],
            ], 'Before: $Q = 120$, $n = 60$. After: $Q = 400 - 160 = 240$, $n = 120$.'),
            parts: [N('P^*\\text{ after}', 8), N('n\\text{ before}', 60), N('n\\text{ after}', 120), N('q\\text{ per firm after}', 2)],
            sol: md`**Move 1:** $P^* = \min LRAC = 8$, $q^* = 2$, before and after. **Move 2:** before, $Q = 200 - 80 = 120$, $n = 60$. **Move 3:** after, $Q = 400 - 160 = 240$, $n = 240/2 = 120$.` }),
          G('m3_lr_quad', { need: 3 }),
          G('m3_lr_cubic', { need: 2 }),
        ],
      },
      // ================================================================ lesson 3
      {
        id: 'm3-lr3', title: 'Short run vs long run after a demand shift', ref: 'Lecture 16',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "demand increases; what happens in the short run?" | Same firms, new demand | move along short-run supply: $P$ up, $Q$ up, each $q$ up, $\pi > 0$ |
            | "…and in the long run?" | Where does entry stop? | $P$ back to min LRAC; $Q$ up more; $n$ up; each $q$ back to $q^*$ |
            | "demand falls" | The mirror image | short run: $P$ down, losses; long run: exit, $P$ back |
            | "there are 60 firms… demand shifts to…; find the short-run price" | $n$ is fixed | $n\,q(P) = $ new demand |
            | "how many firms in the new long-run equilibrium?" | Price is pinned again | $n = Q^D_{\text{new}}(P^*)/q^*$ |
            | a graph with $S_{SR}$, $S_{LR}$, $D_1$, $D_2$ | Which crossing is which? | short run: $D_2$ with $S_{SR}$; long run: $D_2$ with flat $S_{LR}$ |
          `),
          R(md`
            ### A college town gets a new campus

            Coffee shops in a town are in long-run equilibrium: the price is at min LRAC and every shop makes zero economic profit. Then a new campus opens and demand for coffee jumps.

            **The first semester (short run).** No new shop can open overnight: leases, permits and espresso machines take time. The same shops face more customers. Lines form, the price rises, and each shop runs its machines harder, moving **up its MC curve**. Price is now above AC: **profit**.

            **A year or two later (long run).** Entrepreneurs see the profit and open new shops. Market supply shifts right and the price falls. Entry stops only when profit is zero again, at the **same** min LRAC. Each shop is back to its efficient size $q^*$; there are simply more shops.

            | | Before | Short run | Long run |
            |---|---|---|---|
            | Price | min LRAC | higher | back to min LRAC |
            | Market quantity | $Q_0$ | higher | higher still |
            | Number of firms | $n_0$ | $n_0$ (fixed) | more |
            | Output per firm | $q^*$ | higher (up MC) | back to $q^*$ |
            | Profit per firm | 0 | positive | 0 |

            !!key The long run changes the number of firms, not the price
              Constant-cost industry: the short run absorbs a demand shift with **price** and per-firm output; the long run absorbs it with the **number of firms**.

            !!intuition Why the market quantity rises more in the long run
              In the short run the higher price chokes off some of the new demand. In the long run the price falls back, so buyers take everything the new demand curve says they want at the old price.
          `),
          Q(md`Demand rises. In the short run, each existing firm's output…`, ['rises, as it moves up its MC curve', 'stays at $q^*$', 'falls, because new firms take customers', 'drops to zero'], 0,
            [null, '$q^*$ is the long-run resting point. At the higher short-run price, P = MC calls for more output.', 'No firms have entered yet in the short run.', 'Nothing here pushes the price below AVC.'],
            md`The price rises and each firm sets $P = MC$ at the new price, which is further up its MC curve.`),
          RF(md`
            ### Worked example: demand rises

            Every firm has short-run cost $C(q) = q^2 + 16$, where 16 is fixed in the short run; in the long run all of it is avoidable. So $MC = 2q$ and $AC = q + 16/q$.

            **Start: long-run equilibrium.** Min AC: $2q = q + 16/q \Rightarrow q^2 = 16 \Rightarrow q^* = 4$, $P^* = 8$. Demand is $Q = 400 - 20P$: at \$8, $Q = 400 - 160 = 240$, so $n_0 = 240/4 = 60$ firms.

            **The shock.** Demand rises to $Q = 500 - 20P$.

            **Move 1: short-run supply with the 60 firms.** Each firm: $P = 2q \Rightarrow q = P/2$. Sixty of them:
            $$Q^S = 60 \cdot \frac{P}{2} = 30P$$
            (Check: at \$8 that is 240, the old quantity ✓.)

            **Move 2: short-run price.** Old firms, new demand:
            $$30P = 500 - 20P \;\Rightarrow\; 50P = 500 \;\Rightarrow\; P_{SR} = 10$$
            Market quantity $Q = 30(10) = 300$.

            **Move 3: each firm in the short run.** $q = 10/2 = 5$. Profit $= 10(5) - (25 + 16) = 50 - 41 = 9 > 0$. Rectangle check: $AC(5) = 5 + 3.2 = 8.2$, and $(10 - 8.2)(5) = 9$ ✓.

            **Move 4: long run.** Profit attracts entry until $P = \min AC = 8$. New demand at \$8: $Q = 500 - 160 = 340$. Each firm makes $q^* = 4$:
            $$n = \frac{340}{4} = 85 \text{ firms}$$

            [[fig:up]]

            Read the market graph: A (old equilibrium) $\to$ B (short run, on $S_{SR}$) $\to$ C (long run, on the flat $S_{LR}$). Price goes 8, 10, 8. Quantity goes 240, 300, 340.
          `, { up: { svg: pair(cofFirm(10), cofMkt(true)), cap: 'Left: at the short-run price 10 each firm makes 5 and earns 9 (green). Right: A = (240, 8), B = (300, 10) where new demand meets short-run supply, C = (340, 8) after entry.' } }),
          Q(md`Same example. In the new long-run equilibrium, each firm produces…`, ['4, the bottom of AC, as before', '5, the short-run output', '340/60 ≈ 5.67', '10'], 0,
            [null, 'Five is where the firm sat while the price was 10. Entry pushes the price back to 8.', 'That divides the long-run quantity by the old number of firms; but firms entered.', 'Ten is the short-run price, not an output.'],
            md`Back at $P = 8$, $P = MC$ gives $8 = 2q$, so $q = 4 = q^*$. The extra output comes from 25 new firms.`),
          RF(md`
            ### The mirror image: demand falls

            Same industry, but demand falls from $Q = 400 - 20P$ to $Q = 300 - 20P$.

            **Move 1: short-run price.** $30P = 300 - 20P \Rightarrow 50P = 300 \Rightarrow P_{SR} = 6$. Market $Q = 180$.

            **Move 2: each firm.** $q = 6/2 = 3$. Profit $= 18 - (9 + 16) = -7$.

            **Move 3: shut down?** No. $AVC = q$ has minimum 0, so the price covers AVC. Producing loses 7; shutting down would lose the fixed 16.

            **Move 4: long run.** Losses push firms out until $P = 8$ again. New demand at \$8: $Q = 300 - 160 = 140$; $n = 140/4 = 35$. So 25 firms leave.

            [[fig:dn]]
          `, { dn: { svg: pair(cofFirm(6), cofMkt(false)), cap: 'Left: at the short-run price 6 each firm makes 3 and loses 7 (red), less than its fixed cost of 16. Right: A = (240, 8), B = (180, 6), C = (140, 8) after exit.' } }),
          Q(md`After a demand fall, the short-run price is below min AC but above min AVC. Existing firms…`, ['keep operating at a loss now; some exit in the long run', 'shut down immediately', 'raise their prices back to min AC', 'all exit at once'], 0,
            [null, 'Price above min AVC: producing loses less than the fixed cost.', 'Price takers cannot set their own price.', 'Exit happens over time, and only until the price is back at min LRAC; the rest stay.'],
            md`Short run: operate (price covers AVC). Long run: enough firms leave to bring the price back to min LRAC, and the survivors break even.`),
          RF(md`
            ### The lecture's figures: two firms, then a third enters

            The lecture shows entry one firm at a time. The numbers below are chosen to match its figure: each firm has $LRMC = 5 + q/2$ with min LRAC \$10 at $q = 10$, and demand is $Q = 90 - 5P$.

            Each firm's supply from $P = LRMC$: $P = 5 + q/2 \Rightarrow q = 2P - 10$. With $n$ firms, $Q^S = n(2P - 10)$. Set it equal to demand for each $n$:

            | Firms | Market supply | Price | Output per firm | Profit per firm |
            |---|---|---|---|---|
            | 2 | $4P - 20$ | $110/9 \approx 12.22$ | 14.44 | about 27: entry |
            | 3 | $6P - 30$ | $120/11 \approx 10.91$ | 11.82 | about 10: entry |
            | 4 | $8P - 40$ | 10 | 10 | 0: stop |
            | 5 | $10P - 50$ | 9.33 | 8.67 | negative: the 5th would not come |

            For 2 firms: $4P - 20 = 90 - 5P \Rightarrow 9P = 110 \Rightarrow P = 12.22$. Each firm: $q = 2(12.22) - 10 = 14.44$.

            [[fig:lec]]

            Each entrant shifts market supply right (flatter, more firms responding), lowers the price, and shrinks every firm's profit. **The process continues until economic profit is zero**: 4 firms, each at $q^* = 10$, price 10. Shortcut: $Q^D(10) = 90 - 50 = 40$ and $40/10 = 4$.
          `, { lec: { svg: pair(lecFirm, lecMkt), cap: 'Left: with 2 firms the price is P₁ ≈ 12.22 and each firm earns the green profit; the dashed line is the 3-firm price, 10.91. Right: supply with 2, 3 and 4 firms; with 4 the price is 10 = min LRAC.' } }),
          Q(md`In the lecture's figure, why does entry stop at 4 firms?`, ['With 4 firms the price equals min LRAC, so profit is zero', 'The government limits the number of licenses', 'Demand stops growing', 'Each firm reaches its capacity'], 0,
            [null, 'Nothing in the model limits entry; that is the free-entry assumption.', 'Demand is fixed here; entry responds to profit.', 'Firms can produce more; they choose not to below a profitable price.'],
            md`A 5th firm would push the price to 9.33, below min LRAC: everyone, including it, would lose money.`),
          Q(md`Which is flatter: the short-run market supply curve (fixed number of firms) or the long-run market supply curve (constant-cost industry)?`, ['the long-run curve: it is horizontal', 'the short-run curve', 'they have the same slope', 'neither: both are vertical'], 0,
            [null, 'In the short run more output needs a higher price (rising MC); in the long run new firms supply it at the same cost.', 'Entry makes the long-run response much bigger.', 'Supply responds to price in both cases.'],
            md`Short run: more output only by pushing existing firms up their MC curves. Long run: more output by adding firms at min LRAC.`),
          Q(md`A new technology lowers every firm's min LRAC from \$8 to \$6. In the new long-run equilibrium the price is…`, ['\\$6', '\\$8', '\\$7', 'below \\$6'], 0,
            [null, 'At \\$8, firms with the new technology earn profit, which attracts entry.', 'There is no reason to stop halfway: profit stays positive until \\$6.', 'Below \\$6 every firm loses money.'],
            md`The long-run price tracks the cost per unit at the bottom of LRAC. A cost change, unlike a demand change, moves it.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`"There are 60 firms, each with $C(q) = q^2 + 16$. Demand rises to $Q = 500 - 20P$. How much does each firm produce in the short run?"`,
            plan: plan('What is the plan?', 'Build short-run supply $Q = 60 \\cdot P/2$, set it equal to the new demand, then $q = P/2$', [
              ['Each firm makes $q^* = 4$, the bottom of AC', 'That is the long-run answer. In the short run the price differs from min AC.'],
              ['Divide new demand at the old price by 60', 'At the old price the market would not clear: demand exceeds what 60 firms supply there.'],
              ['Set the price to min AC and solve demand', 'In the short run the price is set by supply and demand with $n$ fixed.'],
            ], 'Short run: $n$ fixed, price from supply = demand, then each firm’s $P = MC$.') }),
          P({ q: md`Same industry. "How many firms will there be in the new long-run equilibrium?"`,
            plan: plan('What is the plan?', 'New demand at the old long-run price (min AC), divided by $q^*$', [
              ['New demand at the short-run price, divided by 60', 'The short-run price does not last: profit attracts entry.'],
              ['Keep 60 firms', 'Free entry means the number of firms adjusts.'],
              ['Short-run market quantity divided by $q^*$', 'The market quantity keeps growing as the price falls back; use demand at $P^*$.'],
            ], '$Q = 500 - 20(8) = 340$; $n = 340/4 = 85$.') }),
          P({ q: md`A newspaper: "Demand for kayaks has doubled, so in the long run kayak prices will double too." The kayak industry has identical firms, free entry and constant input prices.`,
            plan: plan('Is the newspaper right?', 'No: the long-run price returns to min LRAC; only the number of firms grows', [
              ['Yes: price is proportional to demand', 'Price rises in the short run, but entry brings it back down to min LRAC.'],
              ['Partly: the price rises a little in the long run', 'That needs rising input prices; this industry has constant input prices.'],
              ['No: the price falls in the long run', 'Entry stops at min LRAC; below that firms lose money.'],
            ], 'Flat long-run supply: demand decides quantity and the number of firms, not the price.') }),
          P({ q: md`A graph shows $D_1$, a higher $D_2$, an upward-sloping $S_{SR}$ through the original point, and a flat $S_{LR}$. "Mark the short-run equilibrium after the shift."`,
            plan: plan('Which crossing?', '$D_2$ with $S_{SR}$', [
              ['$D_2$ with $S_{LR}$', 'That is the long-run equilibrium, after entry.'],
              ['$D_1$ with $S_{SR}$', 'That is the starting point, before the shift.'],
              ['$S_{SR}$ with $S_{LR}$', 'Two supply curves crossing is not an equilibrium: some demand curve must be involved.'],
            ], 'Short run: new demand, old firms. Long run: new demand, flat supply.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Demand rises', q: md`An industry has 160 identical firms in long-run equilibrium, each with cost $C(q) = 2q^2 + 50$ (50 fixed in the short run, avoidable in the long run). Demand is $Q = 1200 - 20P$. Demand rises to $Q = 1500 - 20P$.`,
            plan: [
              plan('Short run: how do you get the price?', 'Market supply $160 \\cdot P/4 = 40P$, then $40P = 1500 - 20P$', [
                ['$P = \\min AC = 20$', 'That is where the price returns after entry, not right after the shift.'],
                ['$P = MC$ with $q$ from new demand divided by 160 at the old price', 'At the old price, quantity demanded exceeds what 160 firms supply.'],
                ['Use the old demand', 'The short-run equilibrium uses the **new** demand.'],
              ], 'One firm: $P = 4q \\Rightarrow q = P/4$. Then supply = new demand.'),
              plan('Long run: how many firms?', 'Price back to min AC; $n = Q^D_{\\text{new}}(20)/5$', [
                ['Stay at 160', 'Profit attracts entrants.'],
                ['$Q_{SR}/5$', 'Quantity keeps rising after the short run as the price falls back.'],
                ['$1500/5$', 'Use demand at the long-run price, not at zero.'],
              ], 'Min AC: $4q = 2q + 50/q \\Rightarrow q^* = 5$, $P^* = 20$.'),
            ],
            parts: [N('P_{SR}', 25), N('q_{SR}', 6.25), N('\\pi_{SR}', 28.125), N('Q_{LR}', 1100), N('n_{LR}', 220)],
            sol: md`**Move 1:** check the start: min AC at $q^* = 5$, $P^* = 20$; demand at 20 is 800 $= 160 \times 5$ ✓. **Move 2:** $40P = 1500 - 20P \Rightarrow 60P = 1500 \Rightarrow P_{SR} = 25$. **Move 3:** $q = 25/4 = 6.25$; $\pi = 25(6.25) - [2(39.0625) + 50] = 156.25 - 128.125 = 28.125$. **Move 4:** long run $P = 20$, $Q = 1500 - 400 = 1100$, $n = 1100/5 = 220$.` }),
          P({ title: 'Demand falls', q: md`An industry has 60 identical firms in long-run equilibrium, each with cost $C(q) = q^2 + 25$ (25 fixed in the short run). Demand is $Q = 600 - 30P$. Demand falls to $Q = 480 - 30P$.`,
            plan: [
              plan('Short run: how do you get the price?', 'Market supply $60 \\cdot P/2 = 30P$, then $30P = 480 - 30P$', [
                ['$P = \\min AC = 10$', 'That is the long-run price, after exit.'],
                ['Firms shut down because demand fell', 'Shutdown needs $P < \\min AVC$, which is 0 here.'],
                ['Keep $P = 10$ and let quantity fall', 'With 60 firms supplying along MC, a lower demand lowers the price.'],
              ], 'One firm: $q = P/2$.'),
              plan('In the long run?', 'Firms exit until $P = 10$; $n = Q^D_{\\text{new}}(10)/5$', [
                ['All firms exit', 'Exit stops once the price is back at min AC; the rest break even.'],
                ['Nothing: they are still covering AVC', 'Covering AVC only matters while the fixed cost is sunk.'],
                ['The price stays at the short-run level', 'Exit shifts supply left and raises the price.'],
              ], 'Min AC: $2q = q + 25/q \\Rightarrow q^* = 5$, $P^* = 10$.'),
            ],
            parts: [N('P_{SR}', 8), N('q_{SR}', 4), N('\\pi_{SR}', -9), N('n_{LR}', 36)],
            sol: md`**Move 1:** start: $q^* = 5$, $P^* = 10$, demand at 10 is 300 $= 60 \times 5$ ✓. **Move 2:** $30P = 480 - 30P \Rightarrow 60P = 480 \Rightarrow P_{SR} = 8$. **Move 3:** $q = 4$; $\pi = 32 - (16 + 25) = -9$, better than shutting down ($-25$). **Move 4:** long run $P = 10$, $Q = 480 - 300 = 180$, $n = 180/5 = 36$: 24 firms exit.` }),
          P({ title: 'The lecture’s entry story in numbers', q: md`Each firm has $LRMC = 5 + q/2$ and min LRAC = \$10 at $q = 10$. Demand is $Q = 90 - 5P$.`,
            plan: plan('With a given number of firms $n$, how do you find the price?', 'Each firm $q = 2P - 10$; market $n(2P - 10)$; set equal to demand', [
              ['$P = 10$ always', 'Only once entry is finished. With 2 firms the price is higher.'],
              ['Set demand equal to one firm’s LRMC', 'There are $n$ firms; add them up first.'],
              ['Add the inverse supplies: $P = n(5 + q/2)$', 'Add quantities at a price, never prices.'],
            ], 'Invert $P = 5 + q/2$, multiply by $n$, solve with demand. Long run: $n = Q^D(10)/10$.'),
            parts: [N('P\\text{ with 2 firms}', 12.222), N('q\\text{ per firm with 2}', 14.444), N('P\\text{ with 3 firms}', 10.909), N('n_{LR}', 4)],
            sol: md`**Move 1:** $q = 2P - 10$. **Move 2:** 2 firms: $4P - 20 = 90 - 5P \Rightarrow 9P = 110 \Rightarrow P = 12.22$; $q = 14.44$. **Move 3:** 3 firms: $6P - 30 = 90 - 5P \Rightarrow 11P = 120 \Rightarrow P = 10.91$. **Move 4:** long run $P = 10$: $Q = 40$, $n = 40/10 = 4$.` }),
          P({ title: 'Directions after a demand fall', q: md`A constant-cost industry starts in long-run equilibrium. Demand falls permanently. Compare each item with the starting point.`,
            plan: plan('Which single fact organizes the whole table?', 'Short run: number of firms fixed. Long run: price back to min LRAC', [
              ['Everything falls in both runs', 'In the long run the price, per-firm output and profit return to their starting values.'],
              ['Nothing changes in the long run', 'The market quantity and the number of firms stay lower.'],
              ['The long run is the short run, only bigger', 'The long run reverses the price change and moves the number of firms instead.'],
            ], 'Short run: P, Q, q, π fall; n same. Long run: P, q, π back; Q and n lower.'),
            parts: [
              FIX('Short-run price', ['rises', 'falls', 'stays the same'], 1, ['Lower demand against the same supply lowers the price.', null, 'Supply is upward-sloping in the short run.']),
              FIX('Short-run number of firms', ['rises', 'falls', 'stays the same'], 2, ['Nobody enters in a downturn.', 'Exit takes time; in the short run firms are stuck.', null]),
              FIX('Long-run price', ['rises', 'falls', 'stays the same'], 2, ['Exit stops at min LRAC.', 'Exit raises the price back up to min LRAC.', null]),
              FIX('Long-run output per firm', ['rises', 'falls', 'stays the same'], 2, ['Survivors return to q*.', 'Survivors return to q*.', null]),
              FIX('Long-run market quantity', ['rises', 'falls', 'stays the same'], 1, ['Demand is lower at the same price.', null, 'The new demand at min LRAC is a smaller quantity.']),
              FIX('Long-run number of firms', ['rises', 'falls', 'stays the same'], 1, ['Losses push firms out.', null, 'A smaller quantity at q* each means fewer firms.']),
            ],
            sol: md`Short run: same firms, lower demand: price, market quantity, each firm's output and profit all fall; $n$ is unchanged. Long run: losses push firms out until the price is back at min LRAC, so price, $q^*$ and zero profit return; the market quantity (new demand at the old price) and the number of firms are lower.` }),
          G('m3_lr_shift', { need: 3 }),
          G('m3_lr_direction', { need: 3 }),
        ],
      },
      // ================================================================ lesson 4
      {
        id: 'm3-lr4', title: 'Producer surplus versus profit', ref: 'Lecture 16 · DS9 Q2',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "inverse supply is $P = Q + 5$; find PS at \$7" | Area above supply, below the price | triangle $\tfrac12 \times Q \times (P - \text{intercept})$ |
            | "what is the change in PS when the price rises to \$9?" | Old area versus new area | $PS_2 - PS_1$, or the trapezoid |
            | "a firm has $C(q) = \ldots$; find its producer surplus" | Revenue minus avoidable cost | $PS = TR - VC$ |
            | "how does PS differ from profit?" | What about the fixed cost? | $\pi = PS - F$; equal when $F = 0$ |
            | "label and shade PS on the graph" | Which region? | between the price line and supply, from 0 to $Q$ sold |
            | "the firm's profit is \$X and its fixed cost \$F; its PS?" | Run the identity backwards | $PS = \pi + F$ |
          `),
          RF(md`
            ### Producer surplus, one unit at a time

            A farmer can grow up to four crates of berries. The 1st crate costs her \$1 extra to grow, the 2nd \$2, the 3rd \$3, the 4th \$4: her marginal cost rises as she uses worse land. The market price is \$4 a crate.

            Ask, crate by crate, what she gains from selling it. She gets the price; she gives up its marginal cost:

            $$\text{PS on one unit} = \text{price received} - MC \text{ of that unit}$$

            | Crate | Price | MC | Surplus on it |
            |---|---|---|---|
            | 1st | 4 | 1 | 3 |
            | 2nd | 4 | 2 | 2 |
            | 3rd | 4 | 3 | 1 |
            | 4th | 4 | 4 | 0 |

            Add them up: **producer surplus** $PS = 3 + 2 + 1 + 0 = 6$.

            [[fig:step]]

            On the graph each crate is a bar of width 1. The MC bars stack up as the staircase; the green part above the staircase and below the price is PS.
          `, { step: { svg: stepFig, cap: 'Lecture: price \\$4, unit costs 1, 2, 3, 4. Green: PS = 6, the area between the price and the MC staircase. Gray: VC = 1 + 2 + 3 + 4 = 10.' } }),
          R(md`
            ### Why $PS = TR - VC$

            Write the sum crate by crate:

            $$PS = (4 - 1) + (4 - 2) + (4 - 3) + (4 - 4)$$

            Regroup: four copies of the price, minus all the MCs:

            $$PS = 4 \times 4 - (1 + 2 + 3 + 4) = 16 - 10 = 6$$

            The first part is total revenue, $TR = Pq$. The second is the sum of the marginal costs of every unit made, and that is exactly **variable cost** (fixed cost is not part of any unit's MC). So:

            $$PS = TR - VC$$

            With a smooth MC curve the same thing holds as areas: the area under MC from 0 to $q$ is VC, the rectangle $P \times q$ is TR, and the region between them, above MC and below the price, is PS.

            !!key Two ways to compute PS
              **As an area:** above the supply (MC) curve, below the price, from 0 to the quantity sold. Use it when supply is a straight line.

              **As a formula:** $PS = TR - VC$. Use it when MC is curved or you are given the cost function.
          `),
          Q(md`The price is \$10. The 5th unit costs \$7 to make. The producer surplus on that unit is…`, ['\\$3', '\\$10', '\\$7', '\\$17'], 0,
            [null, 'That is the price, ignoring the cost of making the unit.', 'That is the cost, not the gain.', 'Surplus subtracts the cost; it does not add it.'],
            md`$PS = P - MC = 10 - 7 = 3$ on that unit.`),
          RF(md`
            ### A market's producer surplus (lecture example)

            Inverse market supply is $P(Q) = Q + 5$. Supply starts at \$5: below that, nobody sells.

            **At \$7. Move 1: quantity.** $7 = Q + 5 \Rightarrow Q = 2$.

            **Move 2: the triangle.** Its base is the quantity, 2. Its height runs from where supply starts (5) up to the price (7):
            $$PS = \tfrac12 \times 2 \times (7 - 5) = 2$$

            **At \$9.** $9 = Q + 5 \Rightarrow Q = 4$, and $PS = \tfrac12 \times 4 \times (9 - 5) = 8$.

            **The change.** $\Delta PS = 8 - 2 = 6$.

            [[fig:ps]]

            **Trapezoid check.** The added PS is the band between the prices 7 and 9, from the vertical axis to the supply curve. Its two parallel sides are the quantities at the two prices, 2 and 4; its height is the price change, 2:
            $$\Delta PS = \tfrac12 (2 + 4)(9 - 7) = 6 \;✓$$

            **TR − VC check at \$9.** $TR = 9 \times 4 = 36$. VC is the area under supply from 0 to 4: a rectangle $5 \times 4 = 20$ plus a triangle $\tfrac12 \times 4 \times 4 = 8$, so $VC = 28$. $PS = 36 - 28 = 8$ ✓.

            !!intuition Who gains from the price rise?
              The two units already sold each earn \$2 more: that is the rectangle $2 \times 2 = 4$. The two new units (3rd and 4th) earn less than \$2 each, because their MC is higher: that is the triangle $\tfrac12 \times 2 \times 2 = 2$. Together, 6.
          `, { ps: { svg: pair(ps7, ps9), cap: 'Left: at P = 7, PS = 2 (green); gray is VC. Right: at P = 9 the old PS (gray, 2) plus the green trapezoid (6) gives PS = 8.' } }),
          Q(md`The price rises. On a supply graph, the **change** in producer surplus is shaped like…`, ['a trapezoid between the old and new price lines, out to the supply curve', 'a triangle to the right of the old quantity', 'a rectangle: price change times the new quantity', 'the area under the supply curve between the two quantities'], 0,
            [null, 'That triangle is only part of it: the units already sold gain the full price rise.', 'The new units do not gain the full price rise, so the rectangle overstates.', 'That is the extra variable cost of the new units, not surplus.'],
            md`Old units: a rectangle (full price rise). New units: a triangle. Rectangle plus triangle is the trapezoid $\tfrac12(Q_1 + Q_2)(P_2 - P_1)$.`),
          RF(md`
            ### Producer surplus versus profit

            Profit subtracts **every** cost. PS subtracts only the variable cost. The difference is the fixed cost:

            $$\pi = TR - VC - F = PS - F$$

            | | Short run | Long run |
            |---|---|---|
            | Fixed cost | $F > 0$ (sunk) | none: all costs variable |
            | Relation | $\pi = PS - F$, so $PS > \pi$ | $\pi = PS$ |

            **Example: Dent's repair shop** (Part 8), $C(q) = 2q^2 + 100$, so $VC = 2q^2$, $F = 100$, $MC = 4q$.

            **At \$40.** $q = 10$. $TR = 400$, $VC = 2(100) = 200$.
            $$PS = 400 - 200 = 200, \qquad \pi = 200 - 100 = 100$$
            Graph check: MC $= 4q$ is a line from the origin, so PS is a triangle $\tfrac12 \times 10 \times 40 = 200$ ✓.

            [[fig:dent]]

            **At \$20.** $q = 5$. $TR = 100$, $VC = 50$, $PS = 50$, $\pi = 50 - 100 = -50$.

            !!key PS tells you whether to operate
              $PS = TR - VC \ge 0$ exactly when revenue covers variable cost, i.e. when $P \ge AVC$. So **positive PS means producing beats shutting down**, even when profit is negative. At \$20 Dent's profit is $-50$, but his PS is $+50$: producing is \$50 better than closing (which gives $\pi = -F = -100$).
          `, { dent: { svg: dentPS, cap: 'Dent at P = 40: PS is the green triangle above MC (200); VC is the gray triangle under MC (200). Profit = PS − F = 200 − 100 = 100.' } }),
          Q(md`A firm's profit is $-\$20$ and its fixed cost is \$50. Its producer surplus is…`, ['\\$30, so it should keep operating', '$-\\$20$, so it should shut down', '$-\\$70$', '\\$50'], 0,
            [null, 'PS adds the fixed cost back: $-20 + 50 = 30$.', 'That subtracts the fixed cost twice.', 'That is the fixed cost alone.'],
            md`$PS = \pi + F = -20 + 50 = 30 > 0$: revenue covers variable cost with \$30 to spare, so operating beats shutting down.`),
          R(md`
            ### When MC is curved: use $TR - VC$

            Part 8's running firm: $C(q) = q^3 - 8q^2 + 30q + 50$. At \$42 it produces $q = 6$ (from $P = MC$).

            MC is a parabola, so the region above it is **not** a triangle. Do not try to find its area with $\tfrac12 bh$. Use the formula:

            **Move 1: revenue.** $TR = 42 \times 6 = 252$.

            **Move 2: variable cost.** Drop the constant 50: $VC(6) = 216 - 288 + 180 = 108$.

            **Move 3: PS.** $PS = 252 - 108 = 144$.

            **Move 4: profit.** $\pi = 144 - 50 = 94$, matching Part 8 ✓.

            !!trap A triangle only works for straight lines
              $\tfrac12 bh$ is right only if supply (MC) is a straight line over the units sold. For a cubic cost, always $TR - VC$.
          `),
          Q(md`In the long run, a firm has no fixed costs. Its producer surplus and its economic profit are…`, ['equal', 'PS is larger by the fixed cost', 'profit is larger', 'unrelated'], 0,
            [null, 'There is no fixed cost in the long run, so nothing separates them.', 'Profit subtracts more cost than PS, never less.', '$\\pi = PS - F$ always links them.'],
            md`$\pi = PS - F$ with $F = 0$ gives $\pi = PS$. In the short run they differ by exactly the fixed cost.`),
          RF(md`
            ### DS9 Q2: producer surplus in a market

            Demand $Q^D = 600 - 10P$, supply $Q^S = 10P$.

            **Move 1: equilibrium.** $600 - 10P = 10P \Rightarrow 20P = 600 \Rightarrow P = 30$, $Q = 300$.

            **Move 2: where supply starts.** $Q^S = 10P$ means $P = Q/10$: supply starts at the origin, $P = 0$.

            **Move 3: the PS triangle.** Base 300 (units sold), height $30 - 0 = 30$:
            $$PS = \tfrac12 \times 300 \times 30 = 4500$$

            [[fig:ds9]]

            Consumer surplus and the welfare total for this market are in the [next lesson](#/l/m3-lr5).
          `, { ds9: { svg: ds9Wel, cap: 'DS9 Q2: supply P = Q/10 starts at the origin. PS (green) is the triangle under the price 30 and above supply, out to Q = 300: 4500. CS (blue) is above the price.' } }),
          Q(md`On a market supply-and-demand graph, producer surplus is the area…`, ['below the price and above the supply curve, from 0 to the quantity sold', 'below the supply curve, from 0 to the quantity sold', 'below the demand curve and above the price', 'between demand and supply'], 0,
            [null, 'That is variable cost.', 'That is consumer surplus.', 'That is total welfare, CS + PS.'],
            md`Each unit's gain is price minus MC, and supply is the MC curve. Add those vertical gaps across the units sold.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`Inverse supply is $P = 2Q + 4$ and the price is \$10. "Find producer surplus."`,
            plan: plan('What do you compute?', 'Triangle: $Q = 3$, height $10 - 4 = 6$, so $\\tfrac12(3)(6)$', [
              ['$\\tfrac12(3)(10)$', 'Supply starts at 4, not 0: the height is $10 - 4$.'],
              ['$10 \\times 3$', 'That is revenue.'],
              ['The area under supply from 0 to 3', 'That is variable cost.'],
            ], 'Quantity from supply at the price, then the triangle between the price line and supply.') }),
          P({ q: md`$C(q) = q^3 - 8q^2 + 30q + 50$ and the price is \$42 (so $q = 6$). "Find producer surplus."`,
            plan: plan('What is the right route?', '$PS = TR - VC = 252 - VC(6)$', [
              ['A triangle under the price and above MC', 'MC is a parabola here, so the region is not a triangle.'],
              ['$TR - TC$', 'That is profit; PS keeps the fixed 50 out.'],
              ['$\\tfrac12 \\times 6 \\times 42$', 'That assumes MC is a straight line from the origin.'],
            ], 'Curved MC: use the formula, not geometry.') }),
          P({ q: md`"Find the change in producer surplus when the price rises from \$7 to \$9." Supply is a straight line.`,
            plan: plan('What do you compute?', 'Either $PS(9) - PS(7)$ or the trapezoid $\\tfrac12(Q_7 + Q_9)(9 - 7)$', [
              ['$(9 - 7) \\times Q_7$', 'That misses the surplus on the new units.'],
              ['$(9 - 7) \\times Q_9$', 'That overcounts: the new units have higher MC and do not gain the full \\$2.'],
              ['$PS(9)$ alone', 'The question asks for the change.'],
            ], 'Do it both ways and check they agree.') }),
          P({ q: md`A firm earns economic profit of \$40 and has a fixed cost of \$60. "What is its producer surplus?"`,
            plan: plan('How do you get PS?', '$PS = \\pi + F = 100$', [
              ['$PS = \\pi = 40$', 'Only with no fixed cost.'],
              ['$PS = \\pi - F = -20$', 'Profit is PS **minus** F, so PS is profit **plus** F.'],
              ['Not enough information without the cost function', 'The identity $\\pi = PS - F$ is all you need.'],
            ], 'Rearrange $\\pi = PS - F$.') }),
          P({ q: md`Market supply is $Q^S = 10P$ and the market price is \$30.`,
            plan: plan('What is the PS triangle?', 'Base $Q = 300$, height $30 - 0$: supply starts at the origin', [
              ['Base 300, height $30 - 10$', 'The 10 is the slope in $Q = 10P$, not an intercept. Inverse supply $P = Q/10$ starts at 0.'],
              ['Base 30, height 300', 'Base is the quantity (horizontal), height is a price gap (vertical).'],
              ['Base 300, height 30, no one-half', 'The region is a triangle, so take half of base times height.'],
            ], '$PS = \\tfrac12(300)(30) = 4500$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Lecture: PS at two prices', q: md`Inverse market supply is $P(Q) = Q + 5$. Find PS at \$7, at \$9, and the change.`,
            plan: plan('What shape is PS at one price?', 'A triangle from the supply intercept (5) up to the price', [
              ['A rectangle $P \\times Q$', 'That is revenue.'],
              ['A triangle from 0 up to the price', 'Supply starts at 5: nobody sells for less.'],
              ['The area under supply', 'That is VC.'],
            ], '$Q = P - 5$; $PS = \\tfrac12 Q (P - 5)$.'),
            parts: [N('PS\\text{ at }7', 2), N('PS\\text{ at }9', 8), N('\\Delta PS', 6)],
            sol: md`**Move 1:** $Q_7 = 2$, $Q_9 = 4$. **Move 2:** $PS_7 = \tfrac12(2)(2) = 2$; $PS_9 = \tfrac12(4)(4) = 8$. **Move 3:** $\Delta PS = 6$; trapezoid $\tfrac12(2 + 4)(2) = 6$ ✓.` }),
          P({ title: 'DS9 Q2: producer surplus', q: md`Market demand is $Q^D = 600 - 10P$ and supply is $Q^S = 10P$.`,
            plan: plan('First move?', 'Equilibrium: $600 - 10P = 10P$', [
              ['PS $= \\tfrac12 \\times 600 \\times 60$', 'Those are the demand intercepts. PS needs the traded quantity and price.'],
              ['PS $= P \\times Q$ at equilibrium', 'That is revenue.'],
              ['Set $P = MC = 0$', 'There is no single firm here; use market supply and demand.'],
            ], '$P = 30$, $Q = 300$; then the triangle under the price and above $P = Q/10$.'),
            parts: [N('P', 30), N('Q', 300), N('PS', 4500)],
            sol: md`**Move 1:** $20P = 600 \Rightarrow P = 30$, $Q = 300$. **Move 2:** inverse supply $P = Q/10$ starts at 0. **Move 3:** $PS = \tfrac12(300)(30) = 4500$.` }),
          P({ title: 'Dent: PS and profit', q: md`Dent's cost is $C(q) = 2q^2 + 100$. Find PS and profit at \$40 and at \$20.`,
            plan: plan('Which formulas?', '$PS = TR - VC$ with $VC = 2q^2$; then $\\pi = PS - 100$', [
              ['$PS = TR - TC$', 'That is profit; PS leaves out the fixed 100.'],
              ['$PS = \\pi$', 'Only with no fixed cost.'],
              ['$PS = \\tfrac12 q P$ with $q$ from $P = AC$', 'Output comes from $P = MC$, not $P = AC$.'],
            ], '$q = P/4$ from $P = 4q$.'),
            parts: [N('PS\\text{ at }40', 200), N('\\pi\\text{ at }40', 100), N('PS\\text{ at }20', 50), N('\\pi\\text{ at }20', -50)],
            sol: md`**At \$40:** $q = 10$; $TR = 400$, $VC = 200$, $PS = 200$, $\pi = 100$. **At \$20:** $q = 5$; $TR = 100$, $VC = 50$, $PS = 50$, $\pi = -50$. Positive PS at \$20: operate, even at a loss.` }),
          P({ title: 'Curved MC', q: md`$C(q) = q^3 - 8q^2 + 30q + 50$. The price is \$42, so $q = 6$.`,
            plan: plan('How do you get PS?', '$TR - VC$, because MC is curved', [
              ['$\\tfrac12 \\times 6 \\times 42$', 'MC is a parabola, not a line from the origin.'],
              ['$TR - TC$', 'That is profit.'],
              ['$\\tfrac12 \\times 6 \\times (42 - 30)$', 'Using MC’s intercept assumes MC is a straight line; it dips and rises here.'],
            ], '$VC = q^3 - 8q^2 + 30q$ at $q = 6$.'),
            parts: [N('TR', 252), N('VC', 108), N('PS', 144), N('\\pi', 94)],
            sol: md`**Move 1:** $TR = 252$. **Move 2:** $VC(6) = 216 - 288 + 180 = 108$. **Move 3:** $PS = 144$. **Move 4:** $\pi = 144 - 50 = 94$.` }),
          P({ title: 'Price rise on a supply line', q: md`Inverse market supply is $P = 4 + 2Q$. The price rises from \$10 to \$16.`,
            plan: plan('How do you get the change in PS?', '$PS(16) - PS(10)$, checked by the trapezoid $\\tfrac12(3 + 6)(6)$', [
              ['$(16 - 10) \\times 3$', 'Misses the surplus on the 3 new units.'],
              ['$(16 - 10) \\times 6$', 'Overcounts: the new units have higher MC.'],
              ['$\\tfrac12(6 - 3)(16 - 10)$', 'Only the small triangle on the new units.'],
            ], '$Q = (P - 4)/2$: 3 at \\$10, 6 at \\$16.'),
            parts: [N('PS\\text{ at }10', 9), N('PS\\text{ at }16', 36), N('\\Delta PS', 27)],
            sol: md`**Move 1:** $Q_{10} = 3$, $Q_{16} = 6$. **Move 2:** $PS_{10} = \tfrac12(3)(6) = 9$, $PS_{16} = \tfrac12(6)(12) = 36$. **Move 3:** $\Delta PS = 27$; trapezoid $\tfrac12(3 + 6)(6) = 27$ ✓.` }),
          P({ title: 'A staircase of costs', q: md`A small producer can make up to five units. Their marginal costs are \$2, \$3, \$5, \$6 and \$8. The price is \$6.`,
            plan: plan('Which units does it sell, and what is PS?', 'Every unit with $MC \\le 6$: four units; PS $= (6 - 2) + (6 - 3) + (6 - 5) + (6 - 6)$', [
              ['All five units', 'The 5th costs \\$8 and sells for \\$6: it loses \\$2.'],
              ['Three units, then PS $= 3 \\times (6 - \\text{average MC})$', 'The 4th unit (MC = 6) adds zero surplus; the lecture counts a unit with $MC = P$ as sold, and PS is the same either way. Sum $P - MC$ unit by unit.'],
              ['$PS = 6 \\times 5 - (2 + 3 + 5 + 6 + 8)$', 'That includes the money-losing 5th unit.'],
            ], 'Sell while price covers MC; add up $P - MC$.'),
            parts: [N('\\text{units sold}', 4), N('PS', 8), N('VC', 16)],
            sol: md`**Move 1:** units 1–4 have $MC \le 6$; the 5th ($MC = 8$) is not made. **Move 2:** $PS = 4 + 3 + 1 + 0 = 8$. **Move 3:** check $TR - VC = 24 - (2 + 3 + 5 + 6) = 24 - 16 = 8$ ✓.` }),
          G('m3_lr_ps_lin', { need: 3 }),
          G('m3_lr_ps_firm', { need: 2 }),
        ],
      },
      // ================================================================ lesson 5
      {
        id: 'm3-lr5', title: 'Efficiency and deadweight loss: welfare accounting', ref: 'Lecture 16 · DS9 Q2',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "find CS, PS and total welfare (social surplus) at equilibrium" | Two triangles | $W = CS + PS$ |
            | "quantity is restricted to $Q = 4$; find the price and the welfare change" | Too little output | price from demand at 4; Before / After / Change table |
            | "a policy requires output of 8" | Too much output | price from demand at 8; DWL over the extra units |
            | "which part is a transfer and which is a loss?" | Rectangle or triangle? | rectangle moves between groups; triangle vanishes |
            | "find the deadweight loss" | Value of units lost (or wasted) | $\tfrac12 \times |Q^* - Q| \times$ gap between D and S at $Q$ |
            | "why is the competitive quantity efficient?" | Last unit: value versus cost | $MB = MC$ at $Q^*$ |
          `),
          R(md`
            ### Every unit creates value: MB minus MC

            Read the two curves unit by unit.

            - The height of **demand** at a quantity is the **marginal benefit** (MB): what the buyer of that unit would pay for it.
            - The height of **supply** is the **marginal cost** (MC): what it costs to make that unit.

            Making and selling one unit creates $MB - MC$ of value for society. The price only decides **who gets it**: the buyer keeps $MB - P$ (consumer surplus), the seller keeps $P - MC$ (producer surplus). Add them:

            $$(MB - P) + (P - MC) = MB - MC$$

            The price cancels. So total welfare, $W = CS + PS$, is the area **between demand and supply** over the units traded.

            **Which quantity makes $W$ biggest?** Make every unit with $MB > MC$ (each adds value) and no unit with $MB < MC$ (each destroys value). Stop exactly where $MB = MC$: where demand crosses supply. That is the **competitive quantity**.

            !!key Efficiency
              The competitive equilibrium maximizes $W = CS + PS$ because at $Q^*$ the last unit's marginal benefit equals its marginal cost: $P = MB = MC$.

            !!intuition Prices move value; quantities create or destroy it
              Change the price with the quantity fixed, and value just moves between buyers and sellers. Change the quantity away from $Q^*$, and value is created or lost. That lost value is the **deadweight loss** (DWL).
          `),
          RF(md`
            ### The lecture's market at the competitive outcome

            Supply $P = 2 + Q$, demand $P = 14 - Q$.

            **Move 1: equilibrium.** $2 + Q = 14 - Q \Rightarrow 2Q = 12 \Rightarrow Q^* = 6$, $P^* = 8$.

            **Move 2: CS.** Triangle under demand (top at 14) and above the price 8, out to 6:
            $$CS = \tfrac12 \times 6 \times (14 - 8) = 18$$

            **Move 3: PS.** Triangle above supply (starts at 2) and below the price 8:
            $$PS = \tfrac12 \times 6 \times (8 - 2) = 18$$

            **Move 4: welfare.** $W = 18 + 18 = 36$.

            [[fig:eq]]
          `, { eq: { svg: welEq, cap: 'At Q* = 6, P* = 8: CS (blue) = 18 and PS (green) = 18, so W = 36, the whole area between demand and supply.' } }),
          Q(md`Why does the competitive quantity maximize total welfare?`, ['For the last unit, marginal benefit equals marginal cost', 'Consumers pay the lowest possible price', 'Producers earn the most profit', 'CS equals PS'], 0,
            [null, 'A lower price only moves value from producers to consumers.', 'Producers would earn more with a restricted quantity and a higher price.', 'CS = PS here by coincidence of the slopes; it is not the reason.'],
            md`Below $Q^*$, extra units have $MB > MC$ and would add value; above it, $MB < MC$ and units destroy value. $Q^*$ makes every valuable unit and no wasteful one.`),
          RF(md`
            ### Too little output: $Q$ restricted to 4

            Suppose a rule caps output at 4. Buyers compete for 4 units, so the price is what demand says buyers pay for 4: $P = 14 - 4 = 10$.

            **Move 1: CS after.** Triangle under demand above 10, out to 4: $\tfrac12 \times 4 \times (14 - 10) = 8$.

            **Move 2: PS after.** Area below 10 and above supply, from 0 to 4. It is a trapezoid: at $Q = 0$ the gap is $10 - 2 = 8$, at $Q = 4$ it is $10 - 6 = 4$:
            $$PS = \tfrac12(8 + 4)(4) = 24$$

            **Move 3: the table.**

            | Surplus | Competition ($Q = 6$, $P = 8$) | Restricted ($Q = 4$, $P = 10$) | Change |
            |---|---|---|---|
            | CS | 18 | 8 | $-10$ |
            | PS | 18 | 24 | $+6$ |
            | W | 36 | 32 | $-4$ |

            **Move 4: DWL = 4.** Producers gain 6 but consumers lose 10: the gains do not offset the losses.

            [[fig:low]]

            **Where each number comes from.**

            - **The transfer (gray).** On the 4 units still sold, buyers now pay \$2 more: a rectangle $(10 - 8) \times 4 = 8$ moves from consumers to producers.
            - **The lost triangle (red).** Units 5 and 6 are no longer made, though each was worth more to buyers than it cost. The value they would have created, $\tfrac12 \times (6 - 4) \times (10 - 6) = 4$, belongs to nobody now. Half of it was consumers' (2), half producers' (2).
            - Consumers: $-8 - 2 = -10$ ✓. Producers: $+8 - 2 = +6$ ✓. Total: $-4$ ✓.
          `, { low: { svg: welLow, cap: 'Q restricted to 4, P = 10. Blue: CS = 8. Gray: the transfer rectangle, 8, now producers’. Green + gray: PS = 16 + 8 = 24. Red: DWL = 4, the value of units 5–6 that are not made.' } }),
          Q(md`With output restricted to 4, the rectangle of height $10 - 8$ and width 4 is…`, ['a transfer from consumers to producers', 'part of the deadweight loss', 'a gain to society', 'a loss to producers'], 0,
            [null, 'Those 4 units are still made and sold; the value just changes hands.', 'Moving money between groups creates nothing; W counts both groups equally.', 'Producers receive it.'],
            md`Same units, higher price: consumers pay 8 more and producers get 8 more. The total is unchanged by this rectangle.`),
          RF(md`
            ### Too much output: $Q$ forced up to 8

            Now a policy requires 8 units. To sell 8, the price must fall to what buyers pay for the 8th: $P = 14 - 8 = 6$.

            **Move 1: CS after.** $\tfrac12 \times 8 \times (14 - 6) = 32$.

            **Move 2: PS after = TR − VC.** $TR = 6 \times 8 = 48$. VC is the area under supply from 0 to 8: a rectangle $2 \times 8 = 16$ plus a triangle $\tfrac12 \times 8 \times 8 = 32$, so $VC = 48$.
            $$PS = 48 - 48 = 0$$
            As areas: units 1–4 cost less than \$6 (PS $+\tfrac12 \times 4 \times 4 = +8$), units 5–8 cost more than \$6 (PS $-8$). Net zero.

            **Move 3: the table.**

            | Surplus | Competition ($Q = 6$, $P = 8$) | Required ($Q = 8$, $P = 6$) | Change |
            |---|---|---|---|
            | CS | 18 | 32 | $+14$ |
            | PS | 18 | 0 | $-18$ |
            | W | 36 | 32 | $-4$ |

            **Move 4: DWL = 4.** Consumers gain 14 but producers lose 18.

            [[fig:high]]

            **Why value is destroyed.** Units 7 and 8 cost between \$8 and \$10 to make (supply), but buyers value them between \$8 and \$6 (demand). Each is worth less than it costs. The red triangle between supply (above) and demand (below), $\tfrac12 \times (8 - 6) \times (10 - 6) = 4$, is that waste.
          `, { high: { svg: welHigh, cap: 'Q forced to 8, P = 6. Blue: CS = 32. Green: the +8 of PS on units 1–4 (units 5–8 lose 8, so PS = 0). Red: DWL = 4, between supply above and demand below over units 6–8.' } }),
          Q(md`With output forced to 8 and the price at \$6, why does producer surplus fall all the way to 0?`, ['Units 5 to 8 cost more than \\$6 to make, and their losses cancel the gains on units 1 to 4', 'Producers sell fewer units', 'The price is below min AVC so firms shut down', 'Consumers capture the deadweight loss'], 0,
            [null, 'They sell more units (8 instead of 6), not fewer.', 'There is no firm-level shutdown here; the policy requires 8 units.', 'Nobody captures a deadweight loss: it is value that no one gets.'],
            md`PS on units 1–4: $+8$. On units 5–8 (MC from 7 up to 10, price 6): $-8$. Net 0.`),
          R(md`
            ### Transfers versus losses, and DWL in one step

            !!key Two kinds of area
              **Transfer: a rectangle.** A price change on units that are still traded. One group loses exactly what the other gains. $W$ does not change.

              **Loss (DWL): a triangle.** Units not made that should be (too little), or units made that should not be (too much). That value is gone for everyone.

            Check your table: the CS change plus the PS change (plus any government change) must equal $-$DWL.

            !!method DWL fast
              **Move 1.** Find the efficient quantity $Q^*$ (demand = supply).

              **Move 2.** Find the actual quantity $Q$.

              **Move 3.** At $Q$, read the vertical gap between demand and supply.

              **Move 4.** $\text{DWL} = \tfrac12 \times |Q^* - Q| \times \text{gap}$.

            Lecture, $Q = 4$: at 4, demand is 10 and supply is 6, gap 4; $\tfrac12 \times 2 \times 4 = 4$ ✓. Lecture, $Q = 8$: at 8, supply is 10 and demand is 6, gap 4; $\tfrac12 \times 2 \times 4 = 4$ ✓.

            !!trap The DWL triangle's tip is at $Q^*$
              The triangle runs from the actual quantity to $Q^*$, between the two curves. It is **not** the triangle under the new price, and it is **not** the change in CS.
          `),
          Q(md`Output is restricted below the competitive level. Who bears the deadweight loss?`, ['both groups: part comes out of CS and part out of PS', 'only consumers', 'only producers', 'nobody: it is a transfer'], 0,
            [null, 'Producers also lose the surplus they would have earned on the units no longer made.', 'Consumers lose too, both the transfer rectangle and their share of the triangle.', 'A transfer is a rectangle that moves between groups; DWL is value that disappears.'],
            md`In the lecture example each group loses 2 of the 4. Producers still come out ahead overall because the 8 transfer outweighs their 2.`),
          RF(md`
            ### DS9 Q2 in full

            Demand $Q^D = 600 - 10P$, supply $Q^S = 10P$.

            **Move 1: equilibrium.** $600 - 10P = 10P \Rightarrow 20P = 600 \Rightarrow P = 30$. $Q = 10(30) = 300$.

            **Move 2: intercepts.** Demand hits zero when $600 - 10P = 0$: $P = 60$. Supply starts at $P = 0$.

            **Move 3: CS.** Under demand, above 30, out to 300:
            $$CS = \tfrac12 \times 300 \times (60 - 30) = 4500$$

            **Move 4: PS.** Above supply, below 30:
            $$PS = \tfrac12 \times 300 \times (30 - 0) = 4500$$

            **Move 5: social surplus.** $SS = 4500 + 4500 = 9000$.

            [[fig:ds9]]

            !!trap The demand intercept is a price
              $Q^D = 600 - 10P$: the 600 is a **quantity**. The top of the CS triangle is the **price** where demand hits zero, $600/10 = 60$.
          `, { ds9: { svg: ds9Wel, cap: 'DS9 Q2: CS (blue) = ½ · 300 · (60 − 30) = 4500; PS (green) = ½ · 300 · 30 = 4500; social surplus 9000.' } }),
          R(md`
            ### Which tool when: the whole of Part 9

            | Question | Tool |
            |---|---|
            | How much does one firm produce at this price? | $P = MC$ (or $P = LRMC$) on the rising branch |
            | Shut down this period? | $P$ versus min AVC ($MC = AVC$) |
            | Exit in the long run? Long-run price? | $P$ versus min LRAC ($LRMC = LRAC$); long-run price $= \min LRAC$ |
            | Enter or exit? | sign of economic profit: $P$ versus AC |
            | Number of firms in the long run | $n = Q^D(\min LRAC)/q^*$ |
            | Short-run price after a demand shift | $n\,q(P) = $ new demand, $n$ fixed |
            | PS | area above supply, below price; or $TR - VC$ |
            | Profit from PS | $\pi = PS - F$ |
            | CS | area below demand, above the price buyers pay |
            | DWL | triangle between D and S from $Q$ to $Q^*$ |

            **Naming areas on a graph:**

            | Area | Top edge | Bottom edge | From… to… |
            |---|---|---|---|
            | CS | demand | price buyers pay | 0 to $Q$ bought |
            | PS | price sellers get | supply | 0 to $Q$ sold |
            | Transfer | new price | old price | 0 to $Q$ still traded |
            | DWL, too little | demand | supply | $Q$ to $Q^*$ |
            | DWL, too much | supply | demand | $Q^*$ to $Q$ |
          `),
          Q(md`A rule raises the price buyers pay from \$8 to \$9 without changing the quantity traded or anyone's costs. Total welfare…`, ['does not change', 'falls by the price rise times the quantity', 'rises', 'falls by a triangle'], 0,
            [null, 'That rectangle is a transfer: producers gain exactly what consumers lose.', 'Nothing is created; value only moves.', 'Triangles appear only when the quantity moves away from $Q^*$.'],
            md`$W$ counts consumers and producers equally, so a transfer from one to the other leaves $W$ unchanged.`),
          Q(md`Demand is $P = 14 - Q$ and supply $P = 2 + Q$. Output is 5. The DWL is…`, ['1', '4', '2', '0.5'], 0,
            [null, 'That is the DWL for $Q = 4$, two units short.', 'You forgot the one-half.', 'Gap at $Q = 5$ is 9 − 7 = 2, base 1: ½(1)(2) = 1.'],
            md`At $Q = 5$: demand 9, supply 7, gap 2; one unit short of $Q^* = 6$. $\tfrac12 \times 1 \times 2 = 1$.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`Competitive output is 50. A quota caps output at 30. "Find the deadweight loss."`,
            plan: plan('What do you compute?', 'Triangle between demand and supply from 30 to 50: $\\tfrac12 \\times 20 \\times$ (gap at 30)', [
              ['The change in CS', 'CS also loses a transfer rectangle, which is not a social loss.'],
              ['$(P_{\\text{new}} - P^*) \\times 30$', 'That rectangle is the transfer from buyers to sellers.'],
              ['The triangle under the new price from 0 to 30', 'That is (part of) CS, not DWL.'],
            ], 'Gap at $Q = 30$: demand price minus supply price.') }),
          P({ q: md`"Output is restricted to 4 units. What price do buyers pay?" Demand $P = 14 - Q$, supply $P = 2 + Q$.`,
            plan: plan('Which curve gives the price?', 'Demand at $Q = 4$: buyers bid the price up to 10', [
              ['Supply at $Q = 4$: \\$6', 'Sellers would accept 6, but buyers competing for 4 units pay up to 10.'],
              ['The competitive price, \\$8', 'At 8 buyers want 6 units, but only 4 exist.'],
              ['Halfway between demand and supply: \\$8', 'There is no averaging; the lecture reads the price off demand.'],
            ], 'Price from demand; then CS, PS, the table.') }),
          P({ q: md`"Find total welfare at the competitive equilibrium." Linear supply and demand are given.`,
            plan: plan('What is the fastest route?', 'CS + PS, which together are the triangle between D and S out to $Q^*$', [
              ['TR at equilibrium', 'Revenue is a transfer from buyers to sellers; it is not welfare.'],
              ['CS only', 'Welfare counts producers too.'],
              ['CS + PS − TR', 'Revenue is already inside both: it is what consumers pay and producers receive.'],
            ], '$W = \\tfrac12 Q^*(\\text{demand intercept} - \\text{supply intercept})$.') }),
          P({ q: md`A program requires farmers to grow more than the competitive amount and sell it for whatever buyers will pay.`,
            plan: plan('Where is the deadweight loss on the graph?', 'Triangle to the right of $Q^*$: supply above, demand below', [
              ['Triangle to the left of $Q^*$', 'That is the too-little case.'],
              ['Rectangle between the old and new price', 'That is a transfer.'],
              ['There is no DWL: consumers gain', 'Consumers gain less than producers lose; the extra units cost more than they are worth.'],
            ], 'DWL runs from $Q^*$ to the forced $Q$, between the curves.') }),
          P({ q: md`In a before/after table, CS falls by 10 and PS rises by 6.`,
            plan: plan('What is the DWL, and what does the rest represent?', 'DWL = 4; the other 6 of the consumers’ loss went to producers as a transfer (net of their own lost triangle)', [
              ['DWL = 16', 'A transfer counted twice: the producer gain offsets part of the consumer loss.'],
              ['DWL = 10, the consumer loss', 'Part of what consumers lost went to producers.'],
              ['DWL = 6', 'That is the producer gain, not the net loss.'],
            ], '$\\Delta W = -10 + 6 = -4$, so DWL = 4.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Lecture: too little output', q: md`Supply $P = 2 + Q$, demand $P = 14 - Q$. Output is restricted to $Q = 4$.`,
            plan: [
              plan('What price do buyers pay at $Q = 4$?', 'Demand price: $14 - 4 = 10$', [
                ['Supply price: 6', 'Buyers competing for 4 units bid the price up to their willingness to pay.'],
                ['8, the competitive price', 'At 8, buyers want 6 units; only 4 are available.'],
                ['14', 'That is the demand intercept, the value of the very first unit.'],
              ], '$P = 10$.'),
              plan('How do you get PS at $Q = 4$, $P = 10$?', 'Trapezoid between 10 and supply from 0 to 4 (or $TR - VC$)', [
                ['$\\tfrac12 \\times 4 \\times (10 - 2)$', 'That is a triangle; the region between a flat price line and a sloped supply over 0–4 is a trapezoid.'],
                ['$10 \\times 4$', 'That is revenue.'],
                ['Same as before, 18', 'The higher price raises PS on the units sold.'],
              ], '$\\tfrac12(8 + 4)(4) = 24$.'),
            ],
            parts: [N('P', 10), N('CS', 8), N('PS', 24), N('W', 32), N('\\text{DWL}', 4)],
            sol: md`**Move 1:** $P = 10$. **Move 2:** $CS = \tfrac12(4)(4) = 8$. **Move 3:** $PS = \tfrac12(8 + 4)(4) = 24$ (or $TR - VC = 40 - (8 + 8) = 24$). **Move 4:** $W = 32$, down from 36: DWL $= 4$ $= \tfrac12(2)(10 - 6)$ ✓.` }),
          P({ title: 'Lecture: too much output', q: md`Supply $P = 2 + Q$, demand $P = 14 - Q$. A policy requires $Q = 8$.`,
            plan: [
              plan('What price clears 8 units?', 'Demand price: $14 - 8 = 6$', [
                ['Supply price: 10', 'Buyers will take 8 units only at the price they pay for the 8th: 6.'],
                ['8', 'At 8, buyers want only 6 units.'],
                ['2', 'That is the supply intercept.'],
              ], '$P = 6$.'),
              plan('PS at $Q = 8$, $P = 6$?', '$TR - VC = 48 - 48$', [
                ['$\\tfrac12 \\times 8 \\times (6 - 2)$', 'Supply rises above 6 after $Q = 4$: units 5–8 have negative surplus.'],
                ['$6 \\times 8$', 'That is revenue.'],
                ['It cannot be computed', '$TR - VC$ always works.'],
              ], '$VC = 2(8) + \\tfrac12(8)^2 = 48$.'),
            ],
            parts: [N('P', 6), N('CS', 32), N('PS', 0), N('W', 32), N('\\text{DWL}', 4)],
            sol: md`**Move 1:** $P = 6$. **Move 2:** $CS = \tfrac12(8)(8) = 32$. **Move 3:** $PS = 48 - 48 = 0$. **Move 4:** $W = 32$; DWL $= 36 - 32 = 4 = \tfrac12(2)(10 - 6)$ ✓.` }),
          P({ title: 'DS9 Q2 in full', q: md`Demand $Q^D = 600 - 10P$, supply $Q^S = 10P$. Find the equilibrium, CS, PS and social surplus.`,
            plan: plan('What is the top of the CS triangle?', '60: the price where $Q^D = 0$', [
              ['600', 'That is a quantity intercept. Solve $600 - 10P = 0$.'],
              ['30', 'That is the equilibrium price, the bottom of the CS triangle.'],
              ['0', 'That is where supply starts, the bottom of PS.'],
            ], '$P = 30$, $Q = 300$; CS from 30 to 60; PS from 0 to 30.'),
            parts: [N('P', 30), N('Q', 300), N('CS', 4500), N('PS', 4500), N('SS', 9000)],
            sol: md`**Move 1:** $20P = 600 \Rightarrow P = 30$, $Q = 300$. **Move 2:** $CS = \tfrac12(300)(60 - 30) = 4500$. **Move 3:** $PS = \tfrac12(300)(30) = 4500$. **Move 4:** $SS = 9000$.` }),
          P({ title: 'A new market: restricted output', q: md`Demand $P = 20 - Q$, supply $P = 4 + Q$. Output is restricted to 6.`,
            plan: plan('Plan?', 'Benchmark first ($Q^* = 8$), then demand price at 6, then CS, PS, DWL', [
              ['Go straight to DWL as $\\tfrac12 \\times 6 \\times$ gap', 'The base is the lost units, $8 - 6 = 2$, not 6.'],
              ['Use supply at 6 for the price', 'Buyers bid the price to their willingness to pay for 6 units.'],
              ['Compute CS and PS at $Q^* = 8$ only', 'You need both outcomes to fill in the change column.'],
            ], '$Q^* = 8$, $P^* = 12$, $W^* = 64$. At 6: $P = 14$.'),
            parts: [N('P', 14), N('CS', 18), N('PS', 42), N('\\text{DWL}', 4), N('\\text{transfer}', 12)],
            sol: md`**Move 1:** $20 - Q = 4 + Q \Rightarrow Q^* = 8$, $P^* = 12$; $CS = PS = 32$, $W^* = 64$. **Move 2:** $P = 20 - 6 = 14$. **Move 3:** $CS = \tfrac12(6)(6) = 18$. **Move 4:** $PS = \tfrac12(10 + 4)(6) = 42$. **Move 5:** $W = 60$, DWL $= 4$ $= \tfrac12(2)(14 - 10)$ ✓. Transfer: $(14 - 12)(6) = 12$ from consumers to producers.` }),
          P({ title: 'Same market: forced output', q: md`Demand $P = 20 - Q$, supply $P = 4 + Q$. A policy requires $Q = 10$.`,
            plan: plan('Which way is the DWL triangle?', 'To the right of $Q^* = 8$: supply above demand from 8 to 10', [
              ['To the left of $Q^*$', 'Output is above $Q^*$ here.'],
              ['The whole area between supply and the new price', 'That mixes PS on profitable units with the waste.'],
              ['There is no DWL because CS rises', 'CS rises by less than PS falls.'],
            ], 'At $Q = 10$: supply 14, demand 10, gap 4; base 2.'),
            parts: [N('P', 10), N('CS', 50), N('PS', 10), N('\\text{DWL}', 4)],
            sol: md`**Move 1:** $P = 20 - 10 = 10$. **Move 2:** $CS = \tfrac12(10)(10) = 50$. **Move 3:** $PS = TR - VC = 100 - (40 + 50) = 10$. **Move 4:** $W = 60$; DWL $= 64 - 60 = 4 = \tfrac12(2)(14 - 10)$ ✓.` }),
          P({ title: 'Transfer or loss?', q: md`Lecture market, output restricted to 4 (price 10 instead of 8). Classify each area.`,
            plan: plan('What distinguishes a transfer from a loss?', 'Transfer: units still traded at a new price (rectangle). Loss: units no longer traded (triangle)', [
              ['Anything consumers lose is a loss', 'Some of what consumers lose goes to producers: that part is a transfer.'],
              ['Anything producers gain is a gain to society', 'Their gain comes out of consumers’ pockets.'],
              ['Rectangles are losses and triangles are transfers', 'Backwards.'],
            ], 'Rectangle on units 1–4 between 8 and 10: transfer. Triangle over units 5–6: DWL.'),
            parts: [
              FIX('Rectangle $(10 - 8) \\times 4$', ['transfer to producers', 'deadweight loss', 'transfer to consumers'], 0, [null, 'Those units are still traded; only the price changed.', 'Consumers pay more, so the money moves toward producers.']),
              FIX('Triangle between D and S from 4 to 6', ['deadweight loss', 'transfer to producers', 'transfer to consumers'], 0, [null, 'Nobody receives it: those units are not made.', 'Nobody receives it: those units are not made.']),
              N('\\text{transfer}', 8), N('\\text{DWL}', 4),
            ],
            sol: md`Transfer $= (10 - 8)(4) = 8$, consumers to producers. DWL $= \tfrac12(6 - 4)(10 - 6) = 4$. Consumers: $-8 - 2 = -10$; producers: $+8 - 2 = +6$; total $-4$ ✓.` }),
          G('m3_lr_dwl', { need: 3 }),
          G('m3_lr_eqsurplus', { need: 2 }),
        ],
      },
    ],
  });
})();

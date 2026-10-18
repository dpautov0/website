/* Practice exams in the Mini Exam 2 format: Q1 is five multiple-choice items (20 points), Q2–Q6 are multipart written
   problems (16 points each). Plus endless exam-style problems drawn from every generator. */
(function () {
  'use strict';
  const { R, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const VY = { y: [1, 9] };
  const intro = (t) => R(md`
    ${t}

    **Format, like the real exam:** 50 minutes, 100 points. Q1 is five multiple-choice items (4 points each). Q2–Q6 are written problems worth 16 points each. Pencil, calculator, and the formula sheet only.

    Set a timer, do the whole exam on paper, **then** type your answers. Every part has a worked solution.
  `);

  const xa = [
    intro('Practice exam A.'),
    R(md`### Q1. Multiple choice (20 points)`),
    Q(md`**(a)** As income rises, a consumer’s Engel curve for good X bends backward. At those incomes good X is…`, ['inferior', 'normal', 'a luxury', 'Giffen'], 0,
      [null, 'Normal goods have upward-sloping Engel curves.', 'Luxury Engel curves slope up.', 'Giffen is about own price.'], md`Backward-bending: quantity falls as income rises, so inferior.`, { src: 'Q1a · 4 pts' }),
    Q(md`**(b)** Demand is elastic at the current price. A firm cuts its price slightly. Total revenue…`, ['rises', 'falls', 'stays the same', 'cannot be determined'], 0,
      [null, 'That happens with inelastic demand.', 'Only at unit elasticity.', 'Elasticity determines it.'], md`Elastic: quantity rises by a larger percent than the price falls, so revenue rises.`, { src: 'Q1b · 4 pts' }),
    Q(md`**(c)** Compensating variation is computed using…`, ['the new prices and the original utility', 'the original prices and the new utility', 'the new prices and the new utility', 'the original prices and the original utility'], 0,
      [null, 'That is EV.', 'That is just bundle B.', 'That is just bundle A.'], md`CV: new prices, original utility.`, { src: 'Q1c · 4 pts' }),
    Q(md`**(d)** $y = 5x_1^{0.3}x_2^{0.6}$ has…`, ['decreasing returns to scale', 'increasing returns to scale', 'constant returns to scale', 'increasing returns, because of the 5'], 0,
      [null, 'Sum is 0.9.', 'Sum is 0.9.', '$A$ never matters for RTS.'], md`$0.3 + 0.6 = 0.9 < 1$: DRS.`, { src: 'Q1d · 4 pts' }),
    Q(md`**(e)** At the current output $MC = \$30$, $AVC = \$22$, $ATC = \$35$. As output rises slightly…`, ['AVC rises and ATC falls', 'both AVC and ATC fall', 'both AVC and ATC rise', 'AVC falls and ATC rises'], 0,
      [null, 'MC is above AVC.', 'MC is below ATC.', 'Reversed.'], md`MC > AVC pulls AVC up; MC < ATC pulls ATC down.`, { src: 'Q1e · 4 pts' }),

    R(md`### Q2. Price effects (16 points)

    $U = x_1^{0.5}x_2^{0.5}$, income \$120, $p_2 = \$2$. The price of good 1 rises from \$3 to \$6.`),
    P({ src: 'Q2 · 16 pts', q: md`(a) Find the original bundle A and new bundle B. (b) Find the Slutsky-adjusted income and the compensated bundle C. (c) Find the substitution, income, and total effects on good 1. (d) Is good 1 normal or inferior?`,
      parts: [N('x_1^A', 20), N('x_2^A', 30), N('x_1^B', 10), N("m'", 180), N('x_1^C', 15), N('x_2^C', 45), N('\\text{substitution}', -5), N('\\text{income}', -5), N('\\text{total}', -10), FIX('(d)', ['normal', 'inferior'], 0, [null, 'The income effect reinforced the substitution effect.'])],
      hints: ['$x_1 = 0.5m/p_1$, $x_2 = 0.5m/p_2$.', "$m' = 6(20) + 2(30)$."],
      sol: md`(a) A: $x_1 = 60/3 = 20$, $x_2 = 60/2 = 30$. B: $x_1 = 60/6 = 10$, $x_2 = 30$.
      (b) $m' = 6(20) + 2(30) = 180$. C: $x_1 = 90/6 = 15$, $x_2 = 90/2 = 45$.
      (c) Substitution $15 - 20 = -5$; income $10 - 15 = -5$; total $-10$.
      (d) The price rise lowered purchasing power and the consumer bought less: normal (both effects negative).` }),

    R(md`### Q3. Market demand and elasticity (16 points)

    Two consumers: $q_1 = 60 - 2P$ and $q_2 = 40 - 4P$.`),
    P({ src: 'Q3 · 16 pts', q: md`(a) Each choke price. (b) Market demand on each range. (c) Market quantity and price elasticity at $P = 5$. (d) The same at $P = 20$. (e) Classify each.`,
      parts: [N('\\text{choke}_1', 30), N('\\text{choke}_2', 10), X('Q\\ (0 \\le P \\le 10)', '100 - 6*P', { P: [0, 10] }), X('Q\\ (10 < P \\le 30)', '60 - 2*P', { P: [10, 30] }),
        N('Q(5)', 70), N('\\varepsilon\\text{ at }5', -30 / 70), N('Q(20)', 20), N('\\varepsilon\\text{ at }20', -2),
        FIX('At $P = 5$, demand is…', ['elastic', 'unit elastic', 'inelastic'], 2), FIX('At $P = 20$, demand is…', ['elastic', 'unit elastic', 'inelastic'], 0)],
      hints: ['Use the slope of the segment you are on: −6 below \$10, −2 above.'],
      sol: md`(a) 30 and 10. (b) $Q = 100 - 6P$ for $P \le 10$; $Q = 60 - 2P$ for $10 < P \le 30$.
      (c) $Q(5) = 70$; $\varepsilon = -6 \cdot 5/70 = -0.43$: inelastic.
      (d) $Q(20) = 20$; only consumer 1 buys; $\varepsilon = -2 \cdot 20/20 = -2$: elastic.` }),

    R(md`### Q4. Consumer welfare (16 points)

    Market demand $P = 50 - 2Q$.`),
    P({ src: 'Q4 · 16 pts', q: md`(a) At $P = 10$: quantity, spending, CS. (b) The price rises to \$20: new quantity and CS. (c) ΔCS, and the sizes of its rectangle and triangle. (d) For this price increase, answer the CV/EV questions.`,
      parts: [N('Q\\text{ at \\$10}', 20), N('\\text{spending}', 200), N('CS\\text{ at \\$10}', 400), N('Q\\text{ at \\$20}', 15), N('CS\\text{ at \\$20}', 225), N('\\Delta CS', -175), N('\\text{rectangle}', 150), N('\\text{triangle}', 25),
        FIX('CV: income is…', ['given', 'taken away'], 0), FIX('EV uses which prices?', ['original', 'new'], 0)],
      sol: md`(a) $10 = 50 - 2Q \Rightarrow Q = 20$; spending 200; CS $= \tfrac12(20)(40) = 400$.
      (b) $Q = 15$; CS $= \tfrac12(15)(30) = 225$.
      (c) $\Delta CS = -175$: rectangle $15 \times 10 = 150$ (paying \$10 more on 15 units) plus triangle $\tfrac12 \times 5 \times 10 = 25$ (units no longer bought).
      (d) CV (new prices, original utility): income **given**. EV uses the **original** prices (new utility; income taken away).` }),

    R(md`### Q5. Production and cost minimization (16 points)

    $y = 2x_1^{0.5}x_2^{0.5}$, $w_1 = \$9$, $w_2 = \$1$.`),
    P({ src: 'Q5 · 16 pts', q: md`(a) Returns to scale. (b) $MP_1$ and $MP_2$ as expressions. (c) The tangency condition gives $x_2 = ?\,x_1$. (d) The cheapest bundle for $y = 60$ and its cost. (e) $C(y)$ and average cost.`,
      parts: [FIX('(a)', ['increasing', 'constant', 'decreasing'], 1), X('MP_1', 'x1^(-0.5)*x2^0.5', { x1: [1, 6], x2: [1, 6] }), X('MP_2', 'x1^0.5*x2^(-0.5)', { x1: [1, 6], x2: [1, 6] }), N('x_2/x_1', 9),
        N('x_1^*', 10), N('x_2^*', 90), N('C', 180), X('C(y)', '3*y', VY), N('AC', 3)],
      hints: ['$MP_1/MP_2 = x_2/x_1$.', '$2\\sqrt{x_1 \\cdot 9x_1} = 6x_1$.'],
      sol: md`(a) $0.5 + 0.5 = 1$: CRS. (b) $MP_1 = x_1^{-0.5}x_2^{0.5}$, $MP_2 = x_1^{0.5}x_2^{-0.5}$. (c) $MP_1/MP_2 = x_2/x_1 = 9/1 \Rightarrow x_2 = 9x_1$.
      (d) $2\sqrt{9x_1^2} = 6x_1 = 60 \Rightarrow x_1 = 10$, $x_2 = 90$; $C = 90 + 90 = 180$.
      (e) $x_1 = y/6$, $x_2 = 1.5y$, $C(y) = 9(y/6) + 1.5y = 3y$; $AC = 3$, constant, as CRS predicts.` }),

    R(md`### Q6. Cost curves (16 points)

    $TC(y) = 200 + 4y + 0.5y^2$.`),
    P({ src: 'Q6 · 16 pts', q: md`(a) Fixed cost, AVC, ATC, MC. (b) The output that minimizes ATC and the minimum ATC. (c) At $y = 10$, compare MC with AVC and say what AVC does as output rises.`,
      parts: [N('F', 200), X('AVC', '4 + 0.5*y', VY), X('ATC', '200/y + 4 + 0.5*y', VY), X('MC', '4 + y', VY), N('y^*', 20), N('\\min ATC', 24), N('MC(10)', 14), N('AVC(10)', 9), FIX('AVC is…', ['rising', 'falling', 'at its minimum'], 0)],
      hints: ['Set MC = ATC: $4 + y = 200/y + 4 + 0.5y$.'],
      sol: md`(a) $F = 200$, $AVC = 4 + 0.5y$, $ATC = 200/y + 4 + 0.5y$, $MC = 4 + y$.
      (b) $200/y = 0.5y \Rightarrow y^2 = 400 \Rightarrow y = 20$. $ATC(20) = 10 + 4 + 10 = 24 = MC(20)$ ✓.
      (c) $MC(10) = 14 > AVC(10) = 9$: AVC is rising (here AVC rises from the very first unit, since $AVC = 4 + 0.5y$).` }),
  ];

  const xb = [
    intro('Practice exam B. Different numbers and a few new twists.'),
    R(md`### Q1. Multiple choice (20 points)`),
    Q(md`**(a)** $x_1 = 50 - 3p_1 - 2p_2 + 0.1m$. Goods 1 and 2 are…`, ['gross complements', 'gross substitutes', 'unrelated', 'both inferior'], 0,
      [null, 'The cross-price derivative is negative.', 'The $p_2$ term is not zero.', 'Good 1 rises with income.'], md`$\partial x_1/\partial p_2 = -2 < 0$: complements.`, { src: 'Q1a · 4 pts' }),
    Q(md`**(b)** $Q = 300P^{-0.5}$. A 10% price increase changes total spending by roughly…`, ['+5%', '−5%', '0%', '+10%'], 0,
      [null, 'Inelastic: spending moves with price.', 'Only at unit elasticity.', 'Quantity also falls about 5%.'], md`$\%\Delta Q \approx -0.5 \times 10 = -5\%$, so spending changes by about $10 - 5 = +5\%$.`, { src: 'Q1b · 4 pts' }),
    Q(md`**(c)** The price of a normal good **falls**. Equivalent variation is…`, ['income given at the old prices', 'income taken at the old prices', 'income given at the new prices', 'income taken at the new prices'], 0,
      [null, 'For a price fall, EV must raise utility to the new level.', 'EV uses old prices, but here it gives.', 'That is not EV.'], md`EV: old prices, new (higher) utility, so income is **given**.`, { src: 'Q1c · 4 pts' }),
    Q(md`**(d)** $y = 3x_1 + x_2$, $w_1 = \$12$, $w_2 = \$3$. The firm uses…`, ['only x₂', 'only x₁', 'x₁ and x₂ in a 1:3 ratio', 'any bundle on the isoquant'], 0,
      [null, '$x_1$ costs $12/3 = 4$ per output; $x_2$ costs 3.', 'Substitutes: corner unless costs tie.', 'Costs per output differ.'], md`Per output: $x_1$ \$4, $x_2$ \$3. Use only $x_2$.`, { src: 'Q1d · 4 pts' }),
    Q(md`**(e)** The long-run average cost curve is…`, ['the lower envelope of the SRAC curves', 'the short-run AC of the largest plant', 'always horizontal, whatever the technology', 'above every short-run AC curve'], 0,
      [null, 'The long run can pick any plant.', 'Only with CRS.', 'It is below (or touching) every SRAC.'], md`At each output the long run picks the cheapest plant.`, { src: 'Q1e · 4 pts' }),

    R(md`### Q2. Income and price effects (16 points)

    $U = x_1^{0.3}x_2^{0.7}$, income \$100, $p_2 = \$1$. The price of good 1 **falls** from \$5 to \$2.`),
    P({ src: 'Q2 · 16 pts', q: md`(a) Bundles A and B. (b) Slutsky income and $x_1^C$. (c) Substitution and income effects on good 1. (d) The Engel curve for good 1 at $p_1 = 2$.`,
      parts: [N('x_1^A', 6), N('x_2^A', 70), N('x_1^B', 15), N("m'", 82), N('x_1^C', 12.3), N('\\text{substitution}', 6.3), N('\\text{income}', 2.7), X('m(x_1)', '(20/3)*x1', { x1: [1, 9] })],
      hints: ["$m' = 2(6) + 1(70)$.", 'Engel: solve $x_1 = 0.3m/2$ for $m$.'],
      sol: md`(a) A: $x_1 = 30/5 = 6$, $x_2 = 70$. B: $x_1 = 30/2 = 15$. (b) $m' = 12 + 70 = 82$; $x_1^C = 0.3(82)/2 = 12.3$.
      (c) Substitution $12.3 - 6 = 6.3$; income $15 - 12.3 = 2.7$; total 9 ✓. (d) $x_1 = 0.15m \Rightarrow m = x_1/0.15 = 6.67x_1$.` }),

    R(md`### Q3. Market demand and income elasticity (16 points)

    Three consumers: $q_1 = 24 - 2P$, $q_2 = 18 - 3P$, $q_3 = 10 - 5P$.`),
    P({ src: 'Q3 · 16 pts', q: md`(a) Market demand on each range. (b) $Q$ at $P = 1$, $4$, $8$. (c) A separate good has $Q = 20 + 0.04m$. Find its income elasticity at $m = 500$ and classify it.`,
      parts: [X('Q\\ (0 \\le P \\le 2)', '52 - 10*P', { P: [0, 2] }), X('Q\\ (2 < P \\le 6)', '42 - 5*P', { P: [2, 6] }), X('Q\\ (6 < P \\le 12)', '24 - 2*P', { P: [6, 12] }),
        N('Q(1)', 42), N('Q(4)', 22), N('Q(8)', 8), N('\\varepsilon_m', 0.5), FIX('The good is…', ['a necessity', 'a luxury', 'inferior'], 0)],
      hints: ['Choke prices: 12, 6, 2.'],
      sol: md`(a) $52 - 10P$ for $P \le 2$; $42 - 5P$ for $2 < P \le 6$; $24 - 2P$ for $6 < P \le 12$. (b) 42, 22, 8.
      (c) $Q = 40$; $\varepsilon_m = 0.04 \times 500/40 = 0.5$: normal, a necessity.` }),

    R(md`### Q4. Consumer welfare (16 points)

    WTP for each extra unit: \$14, \$11, \$8, \$5, \$2.`),
    P({ src: 'Q4 · 16 pts', q: md`(a) At a price of \$6: units, TWTP, spending, CS. (b) The price falls to \$4: new CS and ΔCS. (c) For this price fall (a normal good), is CV given or taken? EV?`,
      parts: [N('\\text{units}', 3), N('\\text{TWTP}', 33), N('\\text{spending}', 18), N('CS', 15), N('CS\\text{ at \\$4}', 22), N('\\Delta CS', 7),
        FIX('CV: income is…', ['given', 'taken away'], 1), FIX('EV: income is…', ['given', 'taken away'], 0)],
      sol: md`(a) Buy units worth ≥ \$6: 3 units. TWTP $= 14 + 11 + 8 = 33$; spending 18; CS 15.
      (b) At \$4 buy 4: CS $= 10 + 7 + 4 + 1 = 22$; $\Delta CS = +7$.
      (c) Price fall: CV (new prices, old utility) takes income away; EV (old prices, new utility) gives income.` }),

    R(md`### Q5. Production and cost minimization (16 points)`),
    P({ src: 'Q5 · 16 pts', q: md`(a) $y = \min\{2L, K\}$, $w = \$10$, $r = \$4$: inputs and cost for $y = 50$, and $C(y)$. (b) $y = 4L + 2K$ with the same prices: cheapest bundle and cost for $y = 40$. (c) For $y = L^{0.4}K^{0.6}$, the TRS at $(L, K) = (2, 6)$.`,
      parts: [N('L\\ (a)', 25), N('K\\ (a)', 50), N('C\\ (a)', 450), X('C(y)\\ (a)', '9*y', VY), N('L\\ (b)', 0), N('K\\ (b)', 20), N('C\\ (b)', 80), N('TRS\\ (c)', -2)],
      hints: ['(a) Each term equals $y$. (b) Cost per output: $L$: $10/4$, $K$: $4/2$.', '(c) $TRS = -\\tfrac{a}{b}\\cdot\\tfrac{K}{L}$.'],
      sol: md`(a) $2L = 50 \Rightarrow L = 25$; $K = 50$; $C = 250 + 200 = 450$; $C(y) = (10/2 + 4)y = 9y$.
      (b) $L$: \$2.50 per output; $K$: \$2 per output. Use only $K$: $K = 20$, cost \$80.
      (c) $-\tfrac{0.4}{0.6}\cdot\tfrac{6}{2} = -2$.` }),

    R(md`### Q6. Cost curves (16 points)

    $F = \$60$. Variable cost at $y = 0, 1, 2, 3, 4, 5$: 0, 30, 50, 66, 88, 130.`),
    P({ src: 'Q6 · 16 pts', q: md`(a) MC of units 1–5. (b) AVC and ATC at $y = 3$. (c) AFC at $y = 5$. (d) Between which outputs is AVC lowest?`,
      parts: [N('MC_1', 30), N('MC_2', 20), N('MC_3', 16), N('MC_4', 22), N('MC_5', 42), N('AVC(3)', 22), N('ATC(3)', 42), N('AFC(5)', 12), FIX('(d)', ['at 3 and 4 (tied)', 'at 2', 'at 5'], 0)],
      sol: md`(a) Differences of VC: 30, 20, 16, 22, 42. (b) $AVC(3) = 66/3 = 22$; $ATC(3) = 126/3 = 42$. (c) $60/5 = 12$.
      (d) AVC: 30, 25, 22, 22, 26. The 4th unit’s MC (22) equals AVC(3), so the average stays flat at 22: AVC is lowest at 3 and 4.` }),
  ];

  const ALL = ['cd_demand', 'income_mix', 'slutsky', 'shift_move', 'market_demand', 'elasticity', 'income_elas', 'cs_mix', 'cvev', 'prod_basics', 'mp_trs', 'rts', 'isocost_mp', 'cd_costmin', 'corner_kink', 'cost_func', 'mc_avg', 'cost_sched'];

  C.unit({
    id: 'exams', exam: 'm2', tools: true, num: 'Mini Exam 2', title: 'Practice exams',
    lessons: [
      { id: 'x-a', title: 'Practice exam A', kind: 'mock', steps: xa },
      { id: 'x-b', title: 'Practice exam B', kind: 'mock', steps: xb },
      { id: 'x-gen', title: 'Endless exam-style problems', kind: 'review', steps: [R(md`A random problem from every topic each time. Keep going until nothing surprises you.`), G('any', { pool: ALL, need: 25 })] },
    ],
  });
})();

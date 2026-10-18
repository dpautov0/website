/* gens.js — randomized ACE 300 practice. Every generator returns a new problem each time with hints and a worked
   solution. Lessons call them with G(name, {need}).

   Math:        math_mix
   Part 1:      cd_demand, income_mix, slutsky, shift_move
   Part 2:      market_demand, elasticity, income_elas
   Part 3:      cs_mix, cvev
   Part 4:      prod_basics, mp_trs, rts
   Part 5:      isocost_mp, cd_costmin, corner_kink
   Part 6:      cost_func, mc_avg, cost_sched */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri } = U;
  const F = (v, d = 3) => EC.fmt(v, d);
  const N = (lbl, ans, rel = 0.01) => ({ lbl, ans, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const M = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // shuffled
  const FX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // order kept
  const sgn = (v) => (v < 0 ? `- ${F(-v)}` : `+ ${F(v)}`);
  const any = (...g) => (o) => pick(g)(o);

  // ======================================================================== math warm-ups
  const mSolve = () => {
    const a = pick([20, 30, 40, 60, 100]), b = pick([2, 3, 4, 5]), q = b * ri(1, Math.floor(a / b) - 1);
    const P = (a - q) / b;
    return { title: 'Solve for a letter', q: md`Demand is $Q = ${a} - ${b}P$. (a) What price makes $Q = ${q}$? (b) Write inverse demand $P(Q)$.`,
      parts: [N('P', P), X('P(Q)', `(${a} - Q)/${b}`, { Q: [0, 10] })],
      hints: [`Plug in $Q = ${q}$ and solve for $P$.`, `Move $${b}P$ to the left and $Q$ to the right, then divide by ${b}.`],
      sol: md`(a) $${q} = ${a} - ${b}P \Rightarrow ${b}P = ${a - q} \Rightarrow P = ${F(P)}$. (b) $${b}P = ${a} - Q \Rightarrow P = \dfrac{${a} - Q}{${b}} = ${F(a / b)} - ${F(1 / b)}Q$.` };
  };
  const mPartial = () => {
    const A = pick([1, 2, 3, 4, 6]), a = pick([0.2, 0.25, 0.4, 0.5, 0.6]), b = pick([0.3, 0.5, 0.6, 0.75, 0.8]);
    const V = { x1: [1, 6], x2: [1, 6] };
    return { title: 'Partial derivatives', q: md`$f(x_1, x_2) = ${A === 1 ? '' : A}x_1^{${a}}x_2^{${b}}$. Find $\partial f/\partial x_1$ and $\partial f/\partial x_2$.`,
      parts: [X('\\partial f/\\partial x_1', `${A * a}*x1^(${a - 1})*x2^${b}`, V), X('\\partial f/\\partial x_2', `${A * b}*x1^${a}*x2^(${+(b - 1).toFixed(2)})`, V)],
      hints: ['Treat the other variable as a constant.', 'Bring the power down in front and subtract 1 from it.'],
      sol: md`$\partial f/\partial x_1 = ${F(A * a)}x_1^{${F(a - 1)}}x_2^{${b}}$ and $\partial f/\partial x_2 = ${F(A * b)}x_1^{${a}}x_2^{${F(b - 1)}}$.` };
  };
  const mPct = () => {
    const o = ri(4, 20) * 5, n = o + pick([-1, 1]) * ri(1, 6) * 5;
    const pct = (n - o) / o * 100;
    return { title: 'Percent change', q: md`A quantity goes from ${o} to ${n}. What is the percent change? (Use the starting value as the base; type e.g. $-12.5$ for a 12.5% drop.)`,
      parts: [N('\\%\\Delta', pct)], hints: ['$\\%\\Delta = (\\text{new} - \\text{old})/\\text{old} \\times 100$.'],
      sol: md`$\dfrac{${n} - ${o}}{${o}} \times 100 = ${F(pct)}\%$.` };
  };
  const mTri = () => {
    const a = pick([12, 20, 24, 30, 40]), b = pick([1, 2, 3, 4]), P = ri(1, Math.floor(a / 2));
    const Q = (a - P) / b, cs = 0.5 * Q * (a - P);
    return { title: 'Triangle area', q: md`Demand $P = ${a} - ${b}Q$ meets the horizontal line $P = ${P}$. Find $Q$ there and the area of the triangle between the line, the demand curve, and the vertical axis.`,
      parts: [N('Q', Q), N('\\text{area}', cs)], hints: ['Base = $Q$, height = $' + a + ' - ' + P + '$.', 'Triangle: $\\tfrac12 \\times$ base $\\times$ height.'],
      sol: md`$Q = (${a} - ${P})/${b} = ${F(Q)}$. Area $= \tfrac12 \times ${F(Q)} \times ${a - P} = ${F(cs)}$.` };
  };
  const mSys = () => {
    const k = pick([2, 3, 4]), x1 = ri(2, 9), y = pick([2, 3, 4]) * k * x1;
    const c = y / (k * x1 + x1);
    return { title: 'Two equations', q: md`Solve: $x_2 = ${k}x_1$ and $${F(c)}x_1 + ${F(c)}x_2 = ${y}$.`,
      parts: [N('x_1', x1), N('x_2', k * x1)], hints: [`Substitute $x_2 = ${k}x_1$ into the second equation.`],
      sol: md`$${F(c)}x_1 + ${F(c)}(${k}x_1) = ${F(c * (k + 1))}x_1 = ${y} \Rightarrow x_1 = ${x1}$, $x_2 = ${k * x1}$.` };
  };
  GENS.math_mix = any(mSolve, mPartial, mPct, mTri, mSys);

  // ======================================================================== Part 1
  const cdNice = () => {
    const a = pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]);
    const m = pick([20, 40, 60, 80, 100, 120, 200]);
    return { a, m };
  };
  GENS.cd_demand = () => {
    const { a, m } = cdNice(), p1 = pick([1, 2, 4, 5]), p2 = pick([1, 2, 4, 5]);
    const x1 = a * m / p1, x2 = (1 - a) * m / p2;
    return { title: 'Cobb–Douglas demand', q: md`$U = x_1^{${a}}x_2^{${F(1 - a)}}$, income $m = \$${m}$, $p_1 = \$${p1}$, $p_2 = \$${p2}$. Find the optimal bundle and the share of income spent on good 1.`,
      parts: [N('x_1^*', x1), N('x_2^*', x2), N('\\text{share on good 1}', a)],
      hints: ['$x_1^* = am/p_1$ and $x_2^* = (1-a)m/p_2$.', 'With Cobb–Douglas, the exponent is the budget share.'],
      sol: md`$x_1^* = ${a}(${m})/${p1} = ${F(x1)}$, $x_2^* = ${F(1 - a)}(${m})/${p2} = ${F(x2)}$. Spending on good 1: $${p1} \times ${F(x1)} = ${F(a * m)}$, a share of $${a}$. Check: $${F(a * m)} + ${F((1 - a) * m)} = ${m}$ ✓.` };
  };
  const incEngel = () => {
    const a = pick([0.2, 0.25, 0.4, 0.5]), p1 = pick([2, 4, 5, 10]);
    return { title: 'Engel curve', q: md`Demand for good 1 is $x_1 = ${a}m/${p1}$. Write the Engel curve as $m$ in terms of $x_1$, and find $x_1$ at $m = ${p1 * 20}$.`,
      parts: [X('m(x_1)', `${p1 / a}*x1`, { x1: [1, 9] }), N('x_1\\text{ at that income}', a * 20),
        FX('Good 1 is…', ['normal', 'inferior'], 0, [null, '$x_1$ rises with $m$.'])],
      hints: ['Solve $x_1 = ' + a + 'm/' + p1 + '$ for $m$.'],
      sol: md`$m = \dfrac{${p1}}{${a}}x_1 = ${F(p1 / a)}x_1$: an upward-sloping straight line, so good 1 is normal. At $m = ${p1 * 20}$: $x_1 = ${a}(${p1 * 20})/${p1} = ${F(a * 20)}$.` };
  };
  const incSign = () => {
    const inf = Math.random() < 0.5, c = pick([0.02, 0.05, 0.1, 0.2]), b = pick([1, 2, 3]);
    const fn = `x = ${ri(20, 60)} - ${b}p ${inf ? '-' : '+'} ${c}m`;
    return { title: 'Normal or inferior?', q: md`Demand is $${fn}$. Income rises by \$100, with $p$ fixed. What happens to $x$, and what kind of good is it?`,
      parts: [N('\\Delta x', (inf ? -1 : 1) * c * 100), FX('The good is…', ['normal', 'inferior'], inf ? 1 : 0, inf ? ['Quantity fell when income rose.', null] : [null, 'Quantity rose when income rose.'])],
      hints: ['$\\Delta x = (\\partial x/\\partial m) \\times \\Delta m$.'],
      sol: md`$\partial x/\partial m = ${inf ? '-' : ''}${c}$, so $\Delta x = ${inf ? '-' : ''}${c} \times 100 = ${F((inf ? -1 : 1) * c * 100)}$. The good is **${inf ? 'inferior' : 'normal'}**.` };
  };
  const incOffer = () => {
    const a = pick([0.25, 0.4, 0.5, 0.6, 0.75]), p1 = pick([1, 2, 3, 4]), p2 = pick([1, 2, 3, 4]);
    const s = (1 - a) * p1 / (a * p2);
    return { title: 'Income-offer curve', q: md`$U = x_1^{${a}}x_2^{${F(1 - a)}}$ with $p_1 = ${p1}$, $p_2 = ${p2}$. As income changes, the optimal bundles lie on a straight line through the origin. What is its slope $x_2/x_1$?`,
      parts: [N('x_2/x_1', s)], hints: ['Divide $x_2^* = (1-a)m/p_2$ by $x_1^* = am/p_1$; the $m$ cancels.'],
      sol: md`$\dfrac{x_2}{x_1} = \dfrac{(1-a)m/p_2}{am/p_1} = \dfrac{(1-a)p_1}{a\,p_2} = \dfrac{${F(1 - a)} \cdot ${p1}}{${a} \cdot ${p2}} = ${F(s)}$. The income-offer curve is the ray $x_2 = ${F(s)}x_1$.` };
  };
  GENS.income_mix = any(incEngel, incSign, incOffer);

  GENS.slutsky = () => {
    const a = pick([0.25, 0.4, 0.5, 0.6]), m = pick([40, 60, 80, 100, 120]), p2 = pick([1, 2]);
    let p1 = pick([1, 2, 4]), q1 = pick([1, 2, 4, 5].filter((v) => v !== p1));
    const x1A = a * m / p1, x2A = (1 - a) * m / p2, x1B = a * m / q1;
    const mp = q1 * x1A + p2 * x2A, x1C = a * mp / q1;
    const sub = x1C - x1A, inc = x1B - x1C;
    return { title: 'Slutsky decomposition', q: md`$U = x_1^{${a}}x_2^{${F(1 - a)}}$ (so $x_1 = ${a}m/p_1$, $x_2 = ${F(1 - a)}m/p_2$), $m = \$${m}$, $p_2 = \$${p2}$. The price of good 1 ${q1 > p1 ? 'rises' : 'falls'} from \$${p1} to \$${q1}. Decompose the change in $x_1$.`,
      parts: [N('x_1^A', x1A), N('x_1^B', x1B), N("m'", mp), N('x_1^C', x1C), N('\\text{substitution effect}', sub), N('\\text{income effect}', inc)],
      hints: ['A: old prices, old income. B: new prices, old income.', "$m' = p_1^{new}x_1^A + p_2x_2^A$ (the old bundle at new prices).", 'C: new prices with income $m\'$.'],
      sol: md`$A$: $x_1 = ${F(x1A)}$, $x_2 = ${F(x2A)}$. $B$: $x_1 = ${a}(${m})/${q1} = ${F(x1B)}$.
        $m' = ${q1}(${F(x1A)}) + ${p2}(${F(x2A)}) = ${F(mp)}$. $C$: $x_1 = ${a}(${F(mp)})/${q1} = ${F(x1C)}$.
        Substitution $= ${F(x1C)} - ${F(x1A)} = ${F(sub)}$; income $= ${F(x1B)} - ${F(x1C)} = ${F(inc)}$; total $= ${F(x1B - x1A)}$ ✓.
        The substitution effect always goes opposite to the price change; here the good is normal, so the income effect goes the same way.` };
  };

  const SHIFTS = [
    ['Income rises and people buy more steak.', 'shifts right', 'normal good'],
    ['Income rises and people buy fewer instant noodles.', 'shifts left', 'inferior good'],
    ['The price of coffee falls and people buy more coffee.', 'movement along the curve', 'own-price change'],
    ['The price of hot dog buns rises and people buy fewer hot dogs.', 'shifts left', 'complements'],
    ['The price of Pepsi rises and people buy more Coke.', 'shifts right', 'substitutes'],
    ['The price of gasoline rises and people buy fewer large SUVs.', 'shifts left', 'complements'],
    ['The price of butter rises and people buy more margarine.', 'shifts right', 'substitutes'],
    ['Income falls and people take more bus trips.', 'shifts right', 'inferior good'],
    ['The price of tea rises and people buy less tea.', 'movement along the curve', 'own-price change'],
    ['Income falls and people eat out less.', 'shifts left', 'normal good'],
  ];
  GENS.shift_move = () => {
    const [txt, mv, why] = pick(SHIFTS);
    const good = txt.match(/buy (?:more|fewer|less) ([a-zA-Z ]+?)\.|take more ([a-z ]+?)\.|eat out/);
    const name = good ? (good[1] || good[2] || 'meals out') : 'the good';
    const reason = ['normal good', 'inferior good', 'substitutes', 'complements', 'own-price change'];
    return { title: 'Shift or movement?', q: md`${txt} What happens to the demand curve for ${name}, and why?`,
      parts: [FX('Demand…', ['shifts right', 'shifts left', 'movement along the curve'], ['shifts right', 'shifts left', 'movement along the curve'].indexOf(mv),
        ['More bought at every price.', 'Less bought at every price.', 'Only a change in the good’s own price moves you along its curve.']),
      FX('Because it is a…', reason, reason.indexOf(why), ['Income and quantity move together.', 'Income and quantity move in opposite directions.', 'The other good’s price and this quantity move together.', 'The other good’s price and this quantity move in opposite directions.', 'The good’s own price changed.'])],
      sol: md`**${mv[0].toUpperCase() + mv.slice(1)}** (${why}). A change in the good’s own price is a movement along its demand curve; a change in income or in another good’s price shifts the whole curve.` };
  };

  // ======================================================================== Part 2
  GENS.market_demand = () => {
    const bA = pick([1, 2]), cA = pick([20, 24, 30, 40]), bB = pick([2, 3, 4, 5]), cB = bB * pick([2, 4, 5, 6]);
    const chA = cA / bA, chB = cB / bB;
    if (Math.abs(chA - chB) < 1e-9) return GENS.market_demand();
    const lo = Math.min(chA, chB), hi = Math.max(chA, chB);
    const pLow = Math.max(1, Math.floor(lo / 2)), pMid = Math.floor((lo + hi) / 2) === lo ? lo + 1 : Math.floor((lo + hi) / 2);
    const Qlow = cA - bA * pLow + cB - bB * pLow, Qmid = (chA > pMid ? cA - bA * pMid : 0) + (chB > pMid ? cB - bB * pMid : 0);
    return { title: 'Market demand', q: md`Two consumers: $q_A = ${cA} - ${bA === 1 ? '' : bA}P$ and $q_B = ${cB} - ${bB}P$. Find each choke price, the market quantity at $P = ${pLow}$ and at $P = ${pMid}$, and the market demand when both buy.`,
      parts: [N('\\text{A’s choke price}', chA), N('\\text{B’s choke price}', chB), N('Q\\text{ at }P = ' + pLow, Qlow), N('Q\\text{ at }P = ' + pMid, Qmid), X('Q(P)\\text{ when both buy}', `${cA + cB} - ${bA + bB}*P`, { P: [0, lo] })],
      hints: ['Choke price: set each $q_i = 0$.', `At $P = ${pMid}$, only the consumer whose choke price is above ${pMid} buys.`, 'When both buy, add the two formulas.'],
      sol: md`Choke prices: A at $${F(chA)}$, B at $${F(chB)}$. At $P = ${pLow}$ (below both): $Q = ${cA - bA * pLow} + ${cB - bB * pLow} = ${F(Qlow)}$. At $P = ${pMid}$ only ${chA > pMid ? 'A' : 'B'} buys: $Q = ${F(Qmid)}$. When both buy ($P \le ${F(lo)}$): $Q = ${cA + cB} - ${bA + bB}P$. The kink is at $P = ${F(lo)}$.` };
  };

  const elLin = () => {
    const a = pick([20, 40, 60, 100, 120]), b = pick([1, 2, 4, 5]), P = ri(1, Math.floor(a / b) - 1);
    const Q = a - b * P, e = -b * P / Q;
    const cls = Math.abs(Math.abs(e) - 1) < 1e-9 ? 1 : Math.abs(e) > 1 ? 0 : 2;
    return { title: 'Price elasticity (linear)', q: md`$Q = ${a} - ${b}P$. Find the price elasticity of demand at $P = ${P}$ and classify it.`,
      parts: [N('Q', Q), N('\\varepsilon', e), FX('Demand here is…', ['elastic', 'unit elastic', 'inelastic'], cls, ['Need $|\\varepsilon| > 1$.', 'Need $|\\varepsilon| = 1$.', 'Need $|\\varepsilon| < 1$.'])],
      hints: ['$\\varepsilon = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q}$ with $dQ/dP = -' + b + '$.'],
      sol: md`$Q = ${a} - ${b}(${P}) = ${Q}$. $\varepsilon = -${b} \times \dfrac{${P}}{${Q}} = ${F(e)}$. $|\varepsilon| ${cls === 0 ? '>' : cls === 1 ? '=' : '<'} 1$: **${['elastic', 'unit elastic', 'inelastic'][cls]}**. Unit elastic for this line is at the midpoint $P = ${F(a / (2 * b))}$.` };
  };
  const elConst = () => {
    const k = pick([50, 100, 200, 500]), e = pick([0.5, 0.8, 1, 1.5, 2, 3]), P = pick([2, 4, 5, 10]);
    const cls = e > 1 ? 0 : e === 1 ? 1 : 2;
    const rev = e > 1 ? 1 : e === 1 ? 2 : 0;
    return { title: 'Constant elasticity', q: md`$Q = ${k}P^{-${e}}$. What is the price elasticity at $P = ${P}$? If the price rises a little, what happens to total revenue?`,
      parts: [N('\\varepsilon', -e), FX('Revenue…', ['rises', 'falls', 'stays the same'], rev, ['Revenue rises with price only when demand is inelastic.', 'Revenue falls with price only when demand is elastic.', 'Only when $|\\varepsilon| = 1$.']), FX('Demand is…', ['elastic', 'unit elastic', 'inelastic'], cls)],
      hints: ['For $Q = kP^{-e}$, $\\varepsilon = -e$ at every price.'],
      sol: md`Constant-elasticity demand: $\varepsilon = -${e}$ at **every** price, including $P = ${P}$. ${e > 1 ? 'Elastic, so a price rise lowers revenue.' : e === 1 ? 'Unit elastic, so revenue does not change.' : 'Inelastic, so a price rise raises revenue.'}` };
  };
  const elPct = () => {
    const dp = pick([2, 4, 5, 10]), e = pick([0.4, 0.5, 1.5, 2, 2.5, 0.8]);
    const dq = -e * dp;
    return { title: 'Elasticity from percent changes', q: md`The price rises ${dp}% and quantity demanded falls ${F(-dq)}%. Find the elasticity and say what happened to spending on the good.`,
      parts: [N('\\varepsilon', -e), FX('Total spending…', ['rose', 'fell', 'stayed the same'], e < 1 ? 0 : 1, ['Spending rises after a price increase only when demand is inelastic.', 'Spending falls after a price increase only when demand is elastic.', 'That needs $|\\varepsilon| = 1$.'])],
      hints: ['$\\varepsilon = \\%\\Delta Q / \\%\\Delta P$.'],
      sol: md`$\varepsilon = ${F(dq)}/${dp} = ${F(-e)}$. ${e < 1 ? 'Inelastic: quantity fell by a smaller percent than price rose, so spending rose.' : 'Elastic: quantity fell by a bigger percent than price rose, so spending fell.'}` };
  };
  GENS.elasticity = any(elLin, elLin, elConst, elPct);

  const ieLin = () => {
    const inf = Math.random() < 0.3, a = pick([10, 20, 40, 50]), b = pick([0.01, 0.02, 0.05, 0.1]), m = pick([100, 200, 400, 500, 1000]);
    const Q = inf ? a + 80 - b * m : a + b * m;
    if (Q <= 0) return ieLin();
    const e = (inf ? -b : b) * m / Q;
    const cls = e < 0 ? 1 : e > 1 ? 2 : 0;
    return { title: 'Income elasticity', q: md`Demand is $Q = ${inf ? a + 80 : a} ${inf ? '-' : '+'} ${b}m$ (prices fixed). Find the income elasticity at $m = ${m}$ and classify the good.`,
      parts: [N('Q', Q), N('\\varepsilon_m', e), FX('The good is…', ['normal (necessity)', 'inferior', 'luxury'], cls, ['Need $0 < \\varepsilon_m \\le 1$.', 'Need $\\varepsilon_m < 0$.', 'Need $\\varepsilon_m > 1$.'])],
      hints: ['$\\varepsilon_m = \\dfrac{dQ}{dm}\\cdot\\dfrac{m}{Q}$.'],
      sol: md`$Q = ${F(Q)}$. $\varepsilon_m = ${inf ? '-' : ''}${b} \times \dfrac{${m}}{${F(Q)}} = ${F(e)}$: **${['a normal good (a necessity, since it is below 1)', 'an inferior good', 'a luxury'][cls]}**.` };
  };
  const iePct = () => {
    const dm = pick([5, 10, 20]), e = pick([-0.5, -1.2, 0.3, 0.6, 1.5, 2]);
    const cls = e < 0 ? 1 : e > 1 ? 2 : 0;
    return { title: 'Income elasticity from percents', q: md`Income rises ${dm}% and the quantity demanded ${e < 0 ? 'falls' : 'rises'} ${F(Math.abs(e * dm))}%. Find $\varepsilon_m$ and classify.`,
      parts: [N('\\varepsilon_m', e), FX('The good is…', ['normal (necessity)', 'inferior', 'luxury'], cls)],
      sol: md`$\varepsilon_m = ${F(e * dm)}/${dm} = ${F(e)}$: ${['normal (necessity)', 'inferior', 'luxury'][cls]}.` };
  };
  GENS.income_elas = any(ieLin, ieLin, iePct);

  // ======================================================================== Part 3
  const csLin = () => {
    const a = pick([20, 30, 40, 50, 60]), b = pick([1, 2, 5]);
    const P = ri(2, Math.floor(a / 2)), Q = (a - P) / b, cs = 0.5 * Q * (a - P);
    return { title: 'Consumer surplus', q: md`Demand is $P = ${a} - ${b === 1 ? '' : b}Q$ and the price is \$${P}. Find quantity, expenditure, CS, and total willingness to pay.`,
      parts: [N('Q', Q), N('\\text{expenditure}', P * Q), N('CS', cs), N('\\text{TWTP}', cs + P * Q)],
      hints: [`Choke price is \\$${a}; CS height is ${a} − ${P}.`, 'CS $= \\tfrac12 \\times Q \\times$ height; TWTP = CS + spending.'],
      sol: md`$Q = (${a} - ${P})/${b} = ${F(Q)}$. Spending $= ${P} \times ${F(Q)} = ${F(P * Q)}$. CS $= \tfrac12 \times ${F(Q)} \times ${a - P} = ${F(cs)}$. TWTP $= ${F(cs + P * Q)}$.` };
  };
  const csChange = () => {
    const a = pick([20, 30, 40, 60]), b = pick([1, 2]);
    const p0 = ri(2, Math.floor(a / 2)), p1 = p0 + pick([-1, 1]) * pick([1, 2, 3, 4]);
    if (p1 <= 0 || p1 >= a) return csChange();
    const q0 = (a - p0) / b, q1 = (a - p1) / b, c0 = 0.5 * q0 * (a - p0), c1 = 0.5 * q1 * (a - p1);
    const up = p1 > p0, rect = Math.min(q0, q1) * Math.abs(p1 - p0), tri = 0.5 * Math.abs(q1 - q0) * Math.abs(p1 - p0);
    return { title: 'Change in consumer surplus', q: md`Demand is $P = ${a} - ${b === 1 ? '' : b}Q$. The price ${up ? 'rises' : 'falls'} from \$${p0} to \$${p1}. Find ΔCS and split it into its rectangle and triangle.`,
      parts: [N('CS_{\\text{before}}', c0), N('CS_{\\text{after}}', c1), N('\\Delta CS', c1 - c0), N('\\text{rectangle (size)}', rect), N('\\text{triangle (size)}', tri)],
      hints: ['ΔCS = after − before.', `Rectangle: price change × the smaller quantity (${F(Math.min(q0, q1))}).`],
      sol: md`$Q$: ${F(q0)} → ${F(q1)}. CS: ${F(c0)} → ${F(c1)}, so $\Delta CS = ${F(c1 - c0)}$ (${up ? 'negative: a price rise hurts buyers' : 'positive: a price cut helps buyers'}). Rectangle $= ${F(Math.abs(p1 - p0))} \times ${F(Math.min(q0, q1))} = ${F(rect)}$; triangle $= \tfrac12 \times ${F(Math.abs(q1 - q0))} \times ${F(Math.abs(p1 - p0))} = ${F(tri)}$; sum ${F(rect + tri)} ✓.` };
  };
  const csDisc = () => {
    const w = [ri(9, 14), 0, 0, 0, 0];
    for (let i = 1; i < 5; i++) w[i] = w[i - 1] - ri(1, 3);
    const P = w[ri(1, 3)] - pick([0, 0.5]);
    const buy = w.filter((v) => v >= P), tw = buy.reduce((s, v) => s + v, 0), E = buy.length * P;
    return { title: 'Discrete consumer surplus', q: md`Willingness to pay for each extra unit: ${w.map((v, i) => `unit ${i + 1}: \\$${v}`).join(', ')}. The price is \$${F(P, 2)}.`,
      parts: [N('\\text{units bought}', buy.length), N('\\text{TWTP}', tw), N('\\text{expenditure}', E), N('CS', tw - E)],
      hints: ['Buy every unit whose WTP is at least the price.', 'TWTP adds the WTPs of the units bought.'],
      sol: md`Buy units with WTP ≥ \$${F(P, 2)}: ${buy.length} units. TWTP $= ${buy.join(' + ')} = ${tw}$. Spending $= ${buy.length} \times ${F(P, 2)} = ${F(E)}$. CS $= ${F(tw - E)}$.` };
  };
  GENS.cs_mix = any(csLin, csChange, csChange, csDisc);

  const CVEV = [
    () => { const up = Math.random() < 0.5, cv = Math.random() < 0.5;
      const given = cv ? up : !up;
      return { q: md`The price of a good **${up ? 'rises' : 'falls'}**. For **${cv ? 'CV' : 'EV'}**, is income given to the consumer or taken away?`,
        parts: [FX('Income is…', ['given', 'taken away'], given ? 0 : 1)],
        sol: md`${cv ? 'CV uses new prices and moves the new line to the **original** utility.' : 'EV uses old prices and moves the old line to the **new** utility.'} After a price ${up ? 'rise the consumer is worse off' : 'fall the consumer is better off'}, so ${cv ? 'reaching the old utility' : 'reaching the new utility at old prices'} needs income to be **${given ? 'given' : 'taken away'}**.` }; },
    () => { const cv = Math.random() < 0.5;
      return { q: md`Which **prices** does the ${cv ? 'CV' : 'EV'} budget line use, and which **utility level** does it hold fixed?`,
        parts: [FX('Prices', ['new', 'original'], cv ? 0 : 1), FX('Utility', ['new', 'original'], cv ? 1 : 0)],
        sol: md`CV: new prices, original utility. EV: original prices, new utility. They always pair opposite labels.` }; },
    () => { const norm = Math.random() < 0.5;
      return { q: md`A price rises and the good is **${norm ? 'normal' : 'inferior'}**. Which ordering holds?`,
        parts: [M('Ordering', norm ? ['CV > |ΔCS| > EV', 'EV > |ΔCS| > CV', '|ΔCS| > CV > EV'] : ['EV > |ΔCS| > CV', 'CV > |ΔCS| > EV', '|ΔCS| > EV > CV'], 0)],
        sol: md`ΔCS always lies between CV and EV. Normal good: $CV > |\Delta CS| > EV$; inferior good: reversed.` }; },
    () => { const cv = Math.random() < 0.5;
      return { q: md`On the standard graph (A = old bundle, B = new bundle, C = new prices with old utility, D = old prices with new utility), which move is the **${cv ? 'compensating' : 'equivalent'} variation**?`,
        parts: [M('Move', cv ? ['B to C', 'A to D', 'A to C', 'B to D'] : ['A to D', 'B to C', 'A to C', 'B to D'], 0)],
        sol: md`CV: from the new situation B to C (same new prices, back on the old curve). EV: from the old situation A to D (same old prices, down to the new curve).` }; },
    () => { const m = pick([30, 40, 50, 60]), cv = +(m * (1 + pick([0.2, 0.3, 0.32]))).toFixed(2), ev = +(m * (1 - pick([0.15, 0.24, 0.2]))).toFixed(2);
      return { q: md`Income is \$${m}. After a price increase, the CV budget line has income \$${cv} and the EV budget line has income \$${ev}. Find CV and EV (positive amounts).`,
        parts: [N('CV', cv - m), N('EV', m - ev)],
        sol: md`$CV = ${cv} - ${m} = ${F(cv - m)}$ (given). $EV = ${m} - ${ev} = ${F(m - ev)}$ (taken away).` }; },
  ];
  GENS.cvev = () => Object.assign({ title: 'CV and EV' }, pick(CVEV)());

  // ======================================================================== Part 4
  const pbCD = () => {
    const A = pick([1, 2, 3]), e = pick([[0.5, 0.5, [[4, 9], [9, 16], [16, 4], [25, 4]]], [1 / 3, 1 / 3, [[8, 1], [8, 8], [27, 1], [1, 27]]], [1 / 3, 2 / 3, [[8, 1], [1, 8], [8, 27], [27, 8]]]]);
    const [a, b, bs] = e, [x1, x2] = pick(bs);
    const y = A * Math.pow(x1, a) * Math.pow(x2, b);
    const ex = (v) => (Math.abs(v - 0.5) < 1e-9 ? '0.5' : Math.abs(v - 1 / 3) < 1e-9 ? '1/3' : '2/3');
    return { title: 'Output of a bundle', q: md`$y = ${A === 1 ? '' : A}x_1^{${ex(a)}}x_2^{${ex(b)}}$. What output does $(x_1, x_2) = (${x1}, ${x2})$ produce?`,
      parts: [N('y', y)], hints: ['$x^{1/2}$ is a square root; $x^{1/3}$ is a cube root.'],
      sol: md`$y = ${A} \cdot ${x1}^{${ex(a)}} \cdot ${x2}^{${ex(b)}} = ${A} \cdot ${F(Math.pow(x1, a))} \cdot ${F(Math.pow(x2, b))} = ${F(y)}$.` };
  };
  const pbMin = () => {
    const a1 = pick([1, 2, 3]), a2 = pick([1, 2, 3, 4]), x1 = ri(2, 12), x2 = ri(2, 12);
    const y = Math.min(a1 * x1, a2 * x2), bind = a1 * x1 <= a2 * x2 ? 1 : 2;
    const k1 = a1 === 1 ? '' : a1, k2 = a2 === 1 ? '' : a2;
    return { title: 'Perfect complements', q: md`$y = \min\{${k1}x_1,\ ${k2}x_2\}$. Find the output from $(${x1}, ${x2})$ and the amount of the **other** input needed for no waste.`,
      parts: [N('y', y), FX('The bottleneck input is…', ['input 1', 'input 2', 'neither (no waste)'], a1 * x1 === a2 * x2 ? 2 : bind - 1),
        N(bind === 1 ? 'x_2\\text{ needed for no waste}' : 'x_1\\text{ needed for no waste}', bind === 1 ? y / a2 : y / a1)],
      hints: [`Terms: $${k1}x_1 = ${a1 * x1}$ and $${k2}x_2 = ${a2 * x2}$; take the smaller.`],
      sol: md`$\min\{${a1 * x1}, ${a2 * x2}\} = ${y}$. No waste needs both terms equal to ${y}: $x_1 = ${F(y / a1)}$, $x_2 = ${F(y / a2)}$.` };
  };
  const pbType = () => {
    const T = [['$y = 3x_1 + 2x_2$', 1], ['$y = \\min\\{x_1, 3x_2\\}$', 0], ['$y = 5x_1^{0.4}x_2^{0.6}$', 2], ['$y = x_1 + x_2$', 1], ['$y = \\min\\{2x_1, x_2\\}$', 0], ['$y = x_1^{0.5}x_2^{0.5}$', 2]];
    const [f, k] = pick(T);
    const names = ['perfect complements (L-shaped isoquants)', 'perfect substitutes (straight-line isoquants)', 'Cobb–Douglas (smooth curved isoquants)'];
    return { title: 'Name the technology', q: md`What kind of production function is ${f}, and what do its isoquants look like?`,
      parts: [FX('Type', names, k)], sol: md`${f}: ${names[k]}.` };
  };
  GENS.prod_basics = any(pbCD, pbMin, pbMin, pbType);

  GENS.mp_trs = () => {
    const A = pick([1, 2, 4, 10]), a = pick([0.25, 0.3, 0.4, 0.5, 0.6]), b = pick([0.25, 0.4, 0.5, 0.6, 0.75]);
    const x1 = pick([1, 2, 4, 8, 9, 16]), x2 = pick([1, 2, 4, 8, 9, 16]);
    const mp1 = A * a * Math.pow(x1, a - 1) * Math.pow(x2, b), mp2 = A * b * Math.pow(x1, a) * Math.pow(x2, b - 1);
    return { title: 'MP and TRS', q: md`$y = ${A === 1 ? '' : A}x_1^{${a}}x_2^{${b}}$. At $(x_1, x_2) = (${x1}, ${x2})$, find $MP_1$, $MP_2$, and the TRS. Then say whether $MP_1$ diminishes.`,
      parts: [N('MP_1', mp1), N('MP_2', mp2), N('TRS', -mp1 / mp2), FX('Does MP₁ diminish as x₁ rises?', ['yes', 'no'], a < 1 ? 0 : 1)],
      hints: ['$MP_1 = aAx_1^{a-1}x_2^b$.', 'Shortcut: $TRS = -\\dfrac{a}{b}\\cdot\\dfrac{x_2}{x_1}$.'],
      sol: md`$MP_1 = ${F(A * a)}x_1^{${F(a - 1)}}x_2^{${b}} = ${F(mp1)}$. $MP_2 = ${F(A * b)}x_1^{${a}}x_2^{${F(b - 1)}} = ${F(mp2)}$. $TRS = -\dfrac{${a}}{${b}}\cdot\dfrac{${x2}}{${x1}} = ${F(-mp1 / mp2)}$. $MP_1$ diminishes because $a = ${a} < 1$.` };
  };

  const rtsCD = () => {
    const A = pick([1, 2, 5, 10]), a = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), b = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
    const s = +(a + b).toFixed(2), k = s > 1 ? 0 : s === 1 ? 1 : 2;
    return { title: 'Returns to scale', q: md`$y = ${A === 1 ? '' : A}x_1^{${a}}x_2^{${b}}$. If both inputs double, output is multiplied by what? Classify the returns to scale.`,
      parts: [N('\\text{multiplier}', Math.pow(2, s)), FX('Returns to scale', ['increasing', 'constant', 'decreasing'], k)],
      hints: ['$f(2x_1, 2x_2) = 2^{a+b}f(x_1, x_2)$.', '$A$ does not matter.'],
      sol: md`$a + b = ${s}$, so doubling multiplies output by $2^{${s}} = ${F(Math.pow(2, s))}$: **${['increasing', 'constant', 'decreasing'][k]}** returns.` };
  };
  const rtsOther = () => {
    const T = [['$y = 4x_1 + 3x_2$', 1, 'Pull out $k$: $k(4x_1 + 3x_2)$.'], ['$y = \\min\\{2x_1, 5x_2\\}$', 1, '$\\min\\{2kx_1, 5kx_2\\} = k\\min\\{\\dots\\}$.'],
      ['$y = x_1^{0.5} + x_2^{0.5}$', 2, 'Doubling gives $\\sqrt2 \\approx 1.41$ times the output.'], ['$y = x_1^2 + x_2^2$', 0, 'Doubling gives $4$ times the output.'],
      ['$y = x_1x_2$', 0, 'Doubling gives $4$ times the output.'], ['$y = (x_1 + x_2)^{0.5}$', 2, 'Doubling gives $\\sqrt2$ times the output.']];
    const [f, k, why] = pick(T);
    return { title: 'Returns to scale (by definition)', q: md`What are the returns to scale of ${f}?`,
      parts: [FX('Returns to scale', ['increasing', 'constant', 'decreasing'], k)], sol: md`${why} So **${['increasing', 'constant', 'decreasing'][k]}** returns to scale.` };
  };
  const rtsTrap = () => {
    const a = pick([0.6, 0.7, 0.8, 0.9]);
    return { title: 'MP vs returns to scale', q: md`$y = x_1^{${a}}x_2^{${a}}$. Does each input have diminishing marginal product? What are the returns to scale?`,
      parts: [FX('Diminishing MP for each input?', ['yes', 'no'], 0, [null, 'Each exponent is below 1.']), FX('Returns to scale', ['increasing', 'constant', 'decreasing'], 0, [null, 'The sum is not 1.', 'Diminishing MP is not the same as decreasing returns to scale.'])],
      sol: md`Each exponent ${a} < 1, so each MP diminishes. The sum ${F(2 * a)} > 1, so returns to scale are increasing. One input alone hits crowding; all inputs together do not.` };
  };
  GENS.rts = any(rtsCD, rtsCD, rtsOther, rtsTrap);

  // ======================================================================== Part 5
  const icLine = () => {
    const w1 = pick([2, 4, 5, 10, 20]), w2 = pick([1, 2, 4, 5, 10]), C0 = w1 * w2 * pick([2, 3, 4, 6]);
    return { title: 'Isocost line', q: md`$w_1 = \$${w1}$, $w_2 = \$${w2}$. Find the intercepts and slope of the \$${C0} isocost line ($x_1$ on the horizontal axis).`,
      parts: [N('x_1\\text{ intercept}', C0 / w1), N('x_2\\text{ intercept}', C0 / w2), N('\\text{slope}', -w1 / w2)],
      hints: ['Intercepts $\\bar C/w_1$ and $\\bar C/w_2$; slope $-w_1/w_2$.'],
      sol: md`$${w1}x_1 + ${w2}x_2 = ${C0}$. Intercepts $${C0}/${w1} = ${F(C0 / w1)}$ and $${C0}/${w2} = ${F(C0 / w2)}$. Slope $-${w1}/${w2} = ${F(-w1 / w2)}$.` };
  };
  const icMP = () => {
    const mp1 = ri(2, 12) * 2, w1 = pick([2, 4, 5, 8]), mp2 = ri(2, 12) * 2, w2 = pick([1, 2, 4, 5]);
    const r1 = mp1 / w1, r2 = mp2 / w2;
    if (Math.abs(r1 - r2) < 1e-9) return icMP();
    return { title: 'Output per dollar', q: md`At the current bundle $MP_1 = ${mp1}$, $w_1 = \$${w1}$, $MP_2 = ${mp2}$, $w_2 = \$${w2}$. Is the firm minimizing cost? If not, which input should it use more of?`,
      parts: [N('MP_1/w_1', r1), N('MP_2/w_2', r2), FX('To cut cost at the same output, use more of…', ['input 1', 'input 2'], r1 > r2 ? 0 : 1)],
      hints: ['Compare output per dollar; spend more on the input that gives more.'],
      sol: md`$MP_1/w_1 = ${F(r1)}$, $MP_2/w_2 = ${F(r2)}$. Input ${r1 > r2 ? 1 : 2} gives more output per dollar, so shift toward input ${r1 > r2 ? 1 : 2} and away from input ${r1 > r2 ? 2 : 1}.` };
  };
  GENS.isocost_mp = any(icLine, icMP, icMP);

  GENS.cd_costmin = () => {
    const A = pick([1, 2, 4]), r = pick([[4, 1, 2], [1, 4, 0.5], [9, 1, 3], [1, 9, 1 / 3], [9, 4, 1.5], [4, 9, 2 / 3], [1, 1, 1], [16, 1, 4]]);
    const [w1, w2, sq] = r, mult = pick([1, 2, 3, 4, 5]);
    const x1 = (sq < 1 ? 18 : 6) * mult;
    const y = A * x1 * sq, x2 = (w1 / w2) * x1, C0 = w1 * x1 + w2 * x2;
    const VY = { y: [1, 50] }, k = (v) => (Math.abs(v - 1) < 1e-9 ? '' : F(v));
    return { title: 'Cost minimization (Cobb–Douglas)', q: md`$y = ${A === 1 ? '' : A}\sqrt{x_1x_2}$, $w_1 = \$${w1}$, $w_2 = \$${w2}$. Find the cheapest way to make $y = ${F(y)}$, its cost, and the cost function $C(y)$.`,
      parts: [N('x_2/x_1', w1 / w2), N('x_1^*', x1), N('x_2^*', x2), N('C', C0), X('C(y)', `${C0 / y}*y`, VY)],
      hints: ['Equal exponents: $x_2/x_1 = w_1/w_2$.', `Substitute: $${k(A)}\\sqrt{x_1 \\cdot ${k(w1 / w2)}x_1} = ${k(A * sq)}x_1$.`],
      sol: md`Tangency: $x_2/x_1 = ${w1}/${w2} = ${F(w1 / w2)}$. Target: $${k(A)}\sqrt{${k(w1 / w2)}x_1^2} = ${k(A * sq)}x_1 = ${F(y)} \Rightarrow x_1^* = ${F(x1)}$, $x_2^* = ${F(x2)}$. Cost $= ${w1}(${F(x1)}) + ${w2}(${F(x2)}) = ${F(C0)}$. In general $x_1^* = ${Math.abs(A * sq - 1) < 1e-9 ? 'y' : 'y/' + F(A * sq)}$, so $C(y) = ${k(C0 / y)}y$ (constant AC: CRS).` };
  };

  const ckSub = () => {
    const a1 = pick([1, 2, 3]), a2 = pick([1, 2, 3, 4]), w1 = pick([1, 2, 3, 4, 6]), w2 = pick([1, 2, 3, 4, 6]);
    const c1 = w1 / a1, c2 = w2 / a2;
    if (Math.abs(c1 - c2) < 1e-9) return ckSub();
    const y = a1 * a2 * pick([2, 3, 4, 5]);
    const use1 = c1 < c2, x1 = use1 ? y / a1 : 0, x2 = use1 ? 0 : y / a2;
    const k1 = a1 === 1 ? '' : a1, k2 = a2 === 1 ? '' : a2;
    return { title: 'Perfect substitutes: corner', q: md`$y = ${k1}x_1 + ${k2}x_2$, $w_1 = \$${w1}$, $w_2 = \$${w2}$. Find the cost-minimizing bundle for $y = ${y}$ and its cost.`,
      parts: [N('x_1^*', x1), N('x_2^*', x2), N('C', Math.min(c1, c2) * y)],
      hints: ['Cost per unit of output: $w_1/a_1$ versus $w_2/a_2$.', 'Use only the cheaper one.'],
      sol: md`Cost per output: input 1 $${w1}/${a1} = ${F(c1)}$, input 2 $${w2}/${a2} = ${F(c2)}$. Use only input ${use1 ? 1 : 2}: $x_${use1 ? 1 : 2} = ${y}/${use1 ? a1 : a2} = ${F(use1 ? x1 : x2)}$. Cost $= ${F(Math.min(c1, c2) * y)}$.` };
  };
  const ckComp = () => {
    const a1 = pick([1, 2, 3]), a2 = pick([1, 2, 4]), w1 = pick([1, 2, 3, 5]), w2 = pick([1, 2, 3, 4]);
    const y = a1 * a2 * pick([2, 3, 5]);
    const x1 = y / a1, x2 = y / a2, k1 = a1 === 1 ? '' : a1, k2 = a2 === 1 ? '' : a2;
    return { title: 'Perfect complements: kink', q: md`$y = \min\{${k1}x_1,\ ${k2}x_2\}$, $w_1 = \$${w1}$, $w_2 = \$${w2}$. Find the cost-minimizing bundle for $y = ${y}$, its cost, and $C(y)$.`,
      parts: [N('x_1^*', x1), N('x_2^*', x2), N('C', w1 * x1 + w2 * x2), X('C(y)', `(${w1}/${a1} + ${w2}/${a2})*y`, { y: [1, 50] })],
      hints: ['Set each term equal to $y$.'],
      sol: md`$${k1}x_1 = ${y} \Rightarrow x_1 = ${F(x1)}$; $${k2}x_2 = ${y} \Rightarrow x_2 = ${F(x2)}$. Cost $= ${w1}(${F(x1)}) + ${w2}(${F(x2)}) = ${F(w1 * x1 + w2 * x2)}$. $C(y) = (${F(w1 / a1)} + ${F(w2 / a2)})y = ${F(w1 / a1 + w2 / a2)}y$.` };
  };
  const ckScale = () => {
    const a = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7]), b = pick([0.3, 0.4, 0.5, 0.6, 0.8]), s = +(a + b).toFixed(2);
    const k = s > 1 ? 0 : s === 1 ? 1 : 2;
    return { title: 'Returns to scale and AC', q: md`$y = x_1^{${a}}x_2^{${b}}$ with fixed input prices. As output grows, what happens to long-run average cost?`,
      parts: [FX('Long-run AC…', ['falls (economies of scale)', 'stays constant', 'rises (diseconomies of scale)'], k)],
      sol: md`$a + b = ${s}$: ${['increasing', 'constant', 'decreasing'][k]} returns, so AC ${['falls', 'is constant', 'rises'][k]}.` };
  };
  GENS.corner_kink = any(ckSub, ckComp, ckScale);

  // ======================================================================== Part 6
  GENS.cost_func = () => {
    const Fc = pick([50, 100, 120, 200, 500]), b = pick([2, 5, 10, 20]), c = pick([0.5, 1, 2, 3]), d = pick([0, 0, 0.1, 0.2]);
    const y = pick([2, 4, 5, 10]);
    const vc = b * y + c * y * y + d * y ** 3, mc = b + 2 * c * y + 3 * d * y * y;
    const tc = `${Fc} + ${b}y + ${c}y^2${d ? ` + ${d}y^3` : ''}`;
    return { title: 'Cost functions', q: md`$TC(y) = ${tc}$. Find the fixed cost and, at $y = ${y}$, AFC, AVC, ATC, and MC.`,
      parts: [N('F', Fc), N('AFC', Fc / y), N('AVC', vc / y), N('ATC', (Fc + vc) / y), N('MC', mc)],
      hints: ['The constant is $F$; everything else is $VC$.', `$MC = TC'(y) = ${b} + ${2 * c}y${d ? ` + ${F(3 * d)}y^2` : ''}$.`],
      sol: md`$F = ${Fc}$, $VC(${y}) = ${F(vc)}$. $AFC = ${F(Fc / y)}$, $AVC = ${F(vc / y)}$, $ATC = ${F((Fc + vc) / y)}$ ($= AFC + AVC$). $MC(${y}) = ${F(mc)}$.` };
  };

  const maCubic = () => {
    const al = pick([4, 6, 8, 10]), be = al * al / 4 + pick([1, 3, 4, 5, 10]);
    const y = al / 2, avc = be - al * al / 4;
    return { title: 'Minimum AVC', q: md`$VC(y) = y^3 - ${al}y^2 + ${be}y$. Find AVC, MC, the output that minimizes AVC, and min AVC.`,
      parts: [X('AVC(y)', `y^2 - ${al}*y + ${be}`, { y: [1, 9] }), X('MC(y)', `3*y^2 - ${2 * al}*y + ${be}`, { y: [1, 9] }), N('y^*', y), N('\\min AVC', avc)],
      hints: ['$AVC = VC/y$.', `Set $MC = AVC$: $2y^2 - ${al}y = 0$.`],
      sol: md`$AVC = y^2 - ${al}y + ${be}$, $MC = 3y^2 - ${2 * al}y + ${be}$. $MC = AVC \Rightarrow 2y^2 - ${al}y = 0 \Rightarrow y = ${F(y)}$. $AVC(${F(y)}) = ${F(avc)}$ (and $MC$ there is also ${F(avc)} ✓).` };
  };
  const maQuad = () => {
    const c = pick([0.5, 1, 2]), y = pick([5, 10, 20]), Fc = c * y * y, b = pick([2, 4, 10]);
    return { title: 'Minimum ATC', q: md`$TC(y) = ${Fc} + ${b}y + ${c}y^2$. Find the output that minimizes ATC and the minimum ATC.`,
      parts: [N('y^*', y), N('\\min ATC', Fc / y + b + c * y)],
      hints: [`Set $MC = ATC$: $${b} + ${2 * c}y = ${Fc}/y + ${b} + ${c}y$.`],
      sol: md`$ATC = ${Fc}/y + ${b} + ${c}y$, $MC = ${b} + ${2 * c}y$. Equal when $${Fc}/y = ${c}y \Rightarrow y^2 = ${F(Fc / c)} \Rightarrow y = ${y}$. $\min ATC = ${F(Fc / y)} + ${b} + ${F(c * y)} = ${F(Fc / y + b + c * y)}$.` };
  };
  const maDir = () => {
    const avc = ri(8, 20), atc = avc + ri(3, 10), mc = pick([avc - ri(1, 5), ri(avc + 1, atc - 1), atc + ri(1, 5)]);
    const avD = mc < avc ? 1 : 0, atD = mc < atc ? 1 : 0;
    return { title: 'Which way do the averages move?', q: md`At the current output $MC = \$${mc}$, $AVC = \$${avc}$, $ATC = \$${atc}$. If output rises a little, what happens to AVC and to ATC?`,
      parts: [FX('AVC', ['rises', 'falls'], avD), FX('ATC', ['rises', 'falls'], atD)],
      sol: md`MC ${mc < avc ? 'below' : 'above'} AVC → AVC ${avD ? 'falls' : 'rises'}. MC ${mc < atc ? 'below' : 'above'} ATC → ATC ${atD ? 'falls' : 'rises'}.` };
  };
  GENS.mc_avg = any(maCubic, maQuad, maDir, maDir);

  GENS.cost_sched = () => {
    const al = pick([4, 5, 6]), be = Math.ceil(al * al / 3) + ri(1, 4), Fc = pick([20, 30, 32, 40, 50]);
    const VC = (y) => y ** 3 - al * y * y + be * y;
    const rows = [0, 1, 2, 3, 4, 5].map((y) => [y, VC(y)]);
    const y = ri(2, 5);
    return { title: 'Cost schedule', q: md`Fixed cost is \$${Fc}. Variable cost:

| $y$ | ${rows.map((r) => r[0]).join(' | ')} |
|---|${rows.map(() => '---').join('|')}|
| $VC$ | ${rows.map((r) => r[1]).join(' | ')} |

Find TC, AFC, AVC, ATC at $y = ${y}$, and the marginal cost of unit ${y}.`,
      parts: [N('TC', Fc + VC(y)), N('AFC', Fc / y), N('AVC', VC(y) / y), N('ATC', (Fc + VC(y)) / y), N('MC\\text{ of unit } ' + y, VC(y) - VC(y - 1))],
      hints: ['TC = F + VC.', `MC of unit ${y} $= VC(${y}) - VC(${y - 1})$.`],
      sol: md`$TC = ${Fc} + ${VC(y)} = ${Fc + VC(y)}$. $AFC = ${F(Fc / y)}$, $AVC = ${F(VC(y) / y)}$, $ATC = ${F((Fc + VC(y)) / y)}$. MC of unit ${y} $= ${VC(y)} - ${VC(y - 1)} = ${VC(y) - VC(y - 1)}$.` };
  };
})();

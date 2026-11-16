/* Mini Exam 3 · Part 7: profit and input choice (Lecture 14, DS8 Q1). Written to the pattern of m3-u2-srsupply.js:
   each lesson opens with what the problem looks like on the exam, builds the idea slowly, names the moves, and every
   practice problem asks for the plan before the numbers. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, X, FIX, plan, gen, F, pick, ri } = M3;
  const cm = (v) => Math.round(v).toLocaleString('en-US');              // 15000 -> "15,000"
  const money = (v) => `${v < 0 ? '−' : ''}\\$${cm(Math.abs(v))}`;      // for normal strings: "\$15,000" / "−\$15,000"

  // ------------------------------------------------------------------ lesson 1 figures
  const takerFig = EC.graph({
    w: 320, h: 240, x: [0, 16], y: [0, 16], xl: 'q\\ (\\text{one truck})', yl: '\\$', xt: [6, 12], yt: [8],
    items: [
      { seg: [[0, 8], [16, 8]], cls: 'curve c3', lab: 'd = MR = P', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [6, 8] }, { pt: [12, 8] },
      { text: [0.6, 13], t: '\\text{charge } 8.50\\text{: sell } 0', anchor: 'l' },
      { text: [0.6, 3.5], t: '\\text{charge } 7.50\\text{: give away revenue}', anchor: 'l' },
    ],
  });
  const marketFig = EC.graph({
    w: 300, h: 240, x: [0, 16], y: [0, 16], xl: 'Q\\ (\\text{market})', yl: 'P', xt: [8], yt: [8],
    items: [
      { seg: [[0, 0], [15, 15]], cls: 'curve c5', lab: 'S', at: 'end', dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 16], [15, 1]], cls: 'curve', lab: 'D', at: 'end', dx: 4, dy: 2, anchor: 'l' },
      { pt: [8, 8], guide: true, lab: 'P = 8', at: 'r' },
    ],
  });

  // ------------------------------------------------------------------ lesson 1 generators
  gen('m3_pr_econprofit', () => {
    const [nm, pos, Sub, biz] = pick([['Maria', 'her', 'She', 'bakery'], ['Jamal', 'his', 'He', 'bike repair shop'], ['Lena', 'her', 'She', 'yoga studio'],
      ['Diego', 'his', 'He', 'landscaping business'], ['Priya', 'her', 'She', 'coffee cart'], ['Owen', 'his', 'He', 'print shop']]);
    const E1 = pick([20, 30, 40, 50]) * 1000, E2 = pick([10, 15, 20, 25]) * 1000, AP = pick([20, 30, 40, 50, 60]) * 1000;
    const E = E1 + E2, Rv = E + AP;
    const sal = pick([25, 30, 35, 40, 45, 50, 55]) * 1000;
    const useRent = pick([true, false]), useSav = !useRent || pick([true, false]);
    const rentM = pick([500, 750, 1000, 1500]), rentY = useRent ? 12 * rentM : 0;
    const S = pick([50, 80, 100, 150, 200]) * 1000, rr = pick([3, 4, 5]), intr = useSav ? S * rr / 100 : 0;
    const imp = sal + rentY + intr, EP = AP - imp;
    const a = EP > 0 ? 0 : EP < 0 ? 1 : 2;
    const facts = [`${Sub} quit a job paying ${money(sal)} a year to run it.`];
    if (useRent) facts.push(`${Sub} owns the space the business uses; it could be rented out for ${money(rentM)} a month.`);
    if (useSav) facts.push(`${Sub} put ${money(S)} of ${pos} own savings into the business; a savings account would have paid ${rr}% a year.`);
    const third = useSav
      ? [`The cash costs, the forgone salary, and the full ${money(S)} of savings`, `The savings are still ${nm}’s money, now inside the business. What is given up is the **interest** they would have earned: ${rr}% of ${money(S)}.`]
      : [`The cash costs, the forgone salary, and one month of rent`, `Everything else here is per year, so the forgone rent is 12 months: ${money(rentY)}.`];
    const impLines = [`forgone salary ${money(sal)}`];
    if (useRent) impLines.push(`forgone rent $12 \\times ${cm(rentM).replace(',', '{,}')} = ${cm(rentY).replace(',', '{,}')}$`);
    if (useSav) impLines.push(`forgone interest $0.0${rr} \\times ${cm(S).replace(',', '{,}')} = ${cm(intr).replace(',', '{,}')}$`);
    return {
      title: 'Accounting vs economic profit',
      q: md`${nm} runs a ${biz}. Last year it brought in ${money(Rv)} in sales. ${nm} paid ${money(E1)} for supplies and ${money(E2)} in wages to hired help. ${facts.join(' ')} Find accounting profit and economic profit, and decide whether ${nm} stays in the business in the long run.`,
      plan: [
        plan('Which costs come out of revenue for **economic** profit?', 'The cash costs **and** the value of everything the owner gave up', [
          ['Only the cash costs', 'That gives **accounting** profit. Economic profit also charges for what the owner’s time, space and money could have earned elsewhere.'],
          ['Only what the owner gave up', 'The cash paid to suppliers and workers is a cost too. Economic profit subtracts both kinds.'],
          third,
        ], `Accounting: revenue minus cash (explicit) costs. Economic: also subtract the implicit costs: ${impLines.join('; ')}.`),
      ],
      parts: [N('\\text{accounting profit}', AP), N('\\text{economic profit}', EP),
        FIX(`In the long run, does ${nm} stay?`, ['stay: the business beats the next-best option', 'leave: the next-best option pays more', 'indifferent: exactly as good as the next-best option'], a,
          [0, 1, 2].map((j) => (j === a ? null : j === 0 ? 'Staying needs **positive** economic profit.' : j === 1 ? 'Leaving needs **negative** economic profit.' : 'Indifference needs economic profit of exactly zero.')))],
      hints: ['Explicit costs are checks written to someone else. Implicit costs are what the owner’s own resources could have earned.', 'Convert monthly amounts to yearly ones; for savings, the cost is the interest, not the savings.'],
      sol: md`
        **Move 1: sort.** Revenue ${money(Rv)}. Explicit: ${money(E1)} + ${money(E2)} = ${money(E)}. Implicit: ${impLines.join('; ')}. Total implicit ${money(imp)}.

        **Move 2: accounting profit** = revenue − explicit = ${money(Rv)} − ${money(E)} = **${money(AP)}**.

        **Move 3: economic profit** = accounting profit − implicit = ${money(AP)} − ${money(imp)} = **${money(EP)}**.

        **Move 4: decide.** ${EP > 0 ? `Positive: the business beats everything else ${nm} could do with ${pos} time and money. Stay (and expect others to want in).` : EP < 0 ? `Negative, even though the books show a profit of ${money(AP)}. ${nm}’s time and resources earn more elsewhere, so in the long run ${nm} leaves.` : `Zero: ${nm} earns exactly what the next-best option pays. No reason to leave or to celebrate.`}
      `,
    };
  });

  gen('m3_pr_margin', () => {
    const [good, Good] = pick([['pies', 'Pie'], ['haircuts', 'Haircut'], ['bike tune-ups', 'Tune-up'], ['pita sandwiches', 'Sandwich']]);
    const MC = [pick([2, 3, 4, 5])];
    for (let i = 0; i < 5; i++) MC.push(MC[i] + pick([2, 3]));
    const k = pick([2, 3, 4, 5]), Pr = MC[k - 1] + 1, Fx = pick([5, 8, 10, 15]);
    const sumMC = MC.slice(0, k).reduce((s, v) => s + v, 0), pi = Pr * k - Fx - sumMC, nxt = Pr - MC[k];
    return {
      title: 'One more unit?',
      q: md`A competitive seller of ${good} takes the market price of \$${Pr}. Its fixed cost is \$${Fx}. The cost of each additional unit is:

| ${Good} | 1st | 2nd | 3rd | 4th | 5th | 6th |
|---|---|---|---|---|---|---|
| $MC$ | ${MC.join(' | ')} |

How many should it make, what is its profit, and by how much would profit change if it made one more than that?`,
      plan: [
        plan('How do you decide how many to make?', 'Keep adding units while the next unit’s $MC$ is below the price (which is $MR$)', [
          ['Make only the unit with the lowest $MC$', 'Later units still add profit as long as each one costs less than the price it sells for.'],
          ['Make all six: every unit sells at the market price', `Units whose $MC$ is above \\$${Pr} cost more than they bring in; each one lowers profit.`],
          ['Stop where total revenue equals total cost', 'That is where profit is **zero**, not where it is largest.'],
        ], `Walk down the table: make a unit if $MC < ${Pr}$. Stop at the first unit with $MC > ${Pr}$.`),
      ],
      parts: [N('q^*', k), N('\\pi', pi), N(`\\Delta\\pi\\text{ from unit }${k + 1}`, nxt)],
      hints: [`For a price taker $MR = P = ${Pr}$ for every unit.`, `Profit $= ${Pr} \\times q - ${Fx} - (\\text{sum of the } MC\\text{'s of the units made})$.`],
      sol: md`
        **Move 1: MR is the price.** A price taker sells every unit at \$${Pr}, so each unit adds $MR = ${Pr}$.

        **Move 2: compare unit by unit.** Units 1 to ${k} have $MC$ of ${MC.slice(0, k).join(', ')}: all below ${Pr}, so each adds profit. Unit ${k + 1} costs $${MC[k]} > ${Pr}$: it loses money. So $q^* = ${k}$.

        **Move 3: profit.** Revenue $${Pr} \times ${k} = ${Pr * k}$. Variable cost is the sum of the marginal costs: $${MC.slice(0, k).join(' + ')} = ${sumMC}$. Then
        $$\pi = ${Pr * k} - ${sumMC} - ${Fx} = ${pi}$$

        **Move 4: one more unit** adds $MR - MC = ${Pr} - ${MC[k]} = ${nxt}$ to profit. Negative, which confirms the stopping point.
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 2 figures (DS8 Q1: q = 8√x1, p = 8, w1 = 16, w2·x̄2 = 16)
  const f8 = (x) => 8 * Math.sqrt(x);
  const isoFamilyFig = EC.graph({
    w: 320, h: 250, x: [0, 8], y: [0, 28], xl: 'x_1', yl: 'q', xt: [2, 4, 6], yt: [4, 8, 12],
    items: [
      { seg: [[0, 4], [8, 20]], cls: 'curve c2', lab: '\\pi = 16', at: 'end', dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 8], [8, 24]], cls: 'curve c3', lab: '\\pi = 48', at: 'end', dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 12], [8, 28]], cls: 'curve c4', lab: '\\pi = 80', at: 'end', dx: 4, dy: 8, anchor: 'l' },
      { arrow: [[5.6, 12.5], [4.6, 21.5]] }, { text: [5.9, 13], t: '\\text{higher profit}', anchor: 'l' },
      { text: [0.3, 25], t: '\\text{slope} = w_1/p = 2', anchor: 'l' },
    ],
  });
  const ds8Fig = EC.graph({
    w: 330, h: 270, x: [0, 8], y: [0, 28], xl: 'x_1', yl: 'q', xt: [4], yt: [4, 8, 12, 16],
    items: [
      { f: f8, from: 0, to: 8, cls: 'c5', lab: 'q = 8\\sqrt{x_1}', labX: 8, dx: -4, dy: 12, anchor: 'tr' },
      { seg: [[0, 4], [8, 20]], cls: 'curve c2 dash', lab: '\\pi = 16', at: 'end', dx: 4, dy: 4, anchor: 'l' },
      { seg: [[0, 8], [8, 24]], cls: 'curve c3', lab: '\\pi = 48', at: 'end', dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 12], [8, 28]], cls: 'curve c4 dash', lab: '\\pi = 80', at: 'end', dx: 4, dy: 8, anchor: 'l' },
      { pt: [4, 16], guide: true, lab: '(4, 16)', at: 'tl' },
    ],
  });
  const vmpFig = EC.graph({
    w: 320, h: 250, x: [0, 9], y: [0, 48], xl: 'x_1', yl: '\\$', xt: [4], yt: [16],
    items: [
      { poly: [[0.45, 16], ...Array.from({ length: 30 }, (_, i) => { const x = 0.45 + (4 - 0.45) * i / 29; return [x, 32 / Math.sqrt(x)]; }), [4, 16]], cls: 'gain' },
      { f: (x) => 32 / Math.sqrt(x), from: 0.45, to: 9, cls: 'c5', lab: 'p\\cdot MP_1 = 32/\\sqrt{x_1}', labX: 9, dx: -2, dy: -8, anchor: 'br' },
      { seg: [[0, 16], [9, 16]], cls: 'curve c3', lab: 'w_1 = 16', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
      { pt: [4, 16], guide: 'x' },
      { text: [1.5, 6], t: '\\text{hire}', anchor: 'c' }, { text: [6.5, 6], t: '\\text{don’t hire}', anchor: 'c' },
    ],
  });

  // ------------------------------------------------------------------ lesson 2 generators
  // q = c·√(x1·x2) with x2 fixed at a perfect square, so q = A√x1 with A = c√x̄2. pMP1 = pA/(2√x1) = w1 ⇒ √x1 = pA/(2w1) = s.
  const srDraw = () => {
    for (;;) {
      const c = pick([2, 3, 4, 6]), x2 = pick([4, 9, 16]), s = pick([2, 3, 4, 5, 6]), w1 = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20]);
      const A = c * Math.sqrt(x2), p = 2 * s * w1 / A;
      if (!Number.isInteger(2 * p) || p < 1 || p > 50 || A * s > 200) continue;
      const w2 = pick([1, 2, 3, 4, 5, 10]);
      if (w1 * s * s - w2 * x2 <= 0) continue;
      return { c, x2, s, w1, A, p, w2, x1: s * s, q: A * s, FC: w2 * x2, pi: p * A * s - w1 * s * s - w2 * x2 };
    }
  };
  const PLAN_SR_SUB = (x2) => plan('What is the first move?', `Plug $\\bar x_2 = ${x2}$ into $f$ so output depends on $x_1$ alone`, [
    ['Take both partial derivatives and set $pMP_1 = w_1$ and $pMP_2 = w_2$', 'That is the **long run**. Here $x_2$ is fixed, so there is only one choice, $x_1$, and one condition.'],
    ['Push $x_1$ as high as it can go to maximize output', 'More output is not more profit: every unit of $x_1$ costs $w_1$. The goal is the most profit.'],
    ['Set $q$ equal to the price', 'Output and price are different things; nothing sets them equal.'],
  ], `$q = f(x_1, ${x2})$. Then profit is $\\pi(x_1) = p\\,q - w_1x_1 - w_2\\bar x_2$.`);
  const PLAN_PMP = plan('Which condition picks $x_1$?', '$p \\cdot MP_1 = w_1$', [
    ['$MP_1 = w_1$', '$MP_1$ is in units of output, $w_1$ in dollars. Multiply by the price to turn the extra output into dollars.'],
    ['$MP_1 = 0$', 'That is where output stops rising: maximum **output**, not maximum profit. Labor is not free.'],
    ['$p \\cdot MP_1 = w_2$', '$w_2$ is the price of the fixed input. The extra unit of $x_1$ costs $w_1$.'],
  ], 'Differentiate $f$ with respect to $x_1$, multiply by $p$, set it equal to $w_1$, solve for $x_1$.');

  gen('m3_pr_sr', () => {
    const d = srDraw(), { c, x2, s, w1, A, p, w2, x1, q, FC, pi } = d;
    const sl = w1 / p, ic = (pi + FC) / p;
    return {
      title: 'Short-run input choice',
      q: md`A competitive firm has $q = ${c}\sqrt{x_1 x_2}$. In the short run $x_2$ is fixed at $\bar x_2 = ${x2}$. The output price is $p = ${F(p)}$, the price of $x_1$ is $w_1 = ${w1}$, and the price of $x_2$ is $w_2 = ${w2}$. Find $x_1^*$, $q^*$ and $\pi^*$, and the slope and intercept of the isoprofit line through the optimum.`,
      plan: [PLAN_SR_SUB(x2), PLAN_PMP],
      parts: [N('x_1^*', x1), N('q^*', q), N('\\pi^*', pi), N('\\text{isoprofit slope}', sl), N('\\text{isoprofit intercept}', ic)],
      hints: [`$q = ${c}\\sqrt{${x2}}\\sqrt{x_1} = ${F(A)}\\sqrt{x_1}$, so $MP_1 = \\dfrac{${F(A)}}{2\\sqrt{x_1}}$.`, `$${F(p)} \\cdot \\dfrac{${F(A)}}{2\\sqrt{x_1}} = ${w1}$. Solve for $\\sqrt{x_1}$ first.`],
      sol: md`
        **Move 1: fix $x_2$.** $q = ${c}\sqrt{${x2}\,x_1} = ${c}\cdot ${Math.sqrt(x2)}\sqrt{x_1} = ${F(A)}\sqrt{x_1}$.

        **Move 2: $MP_1$.** Write $q = ${F(A)}x_1^{1/2}$. Power rule:
        $$MP_1 = ${F(A)}\cdot\tfrac{1}{2}x_1^{-1/2} = \frac{${F(A / 2)}}{\sqrt{x_1}}$$

        **Move 3: $pMP_1 = w_1$.**
        $$${F(p)}\cdot\frac{${F(A / 2)}}{\sqrt{x_1}} = ${w1} \;\Rightarrow\; \frac{${F(p * A / 2)}}{\sqrt{x_1}} = ${w1} \;\Rightarrow\; \sqrt{x_1} = \frac{${F(p * A / 2)}}{${w1}} = ${s} \;\Rightarrow\; x_1^* = ${x1}$$

        **Move 4: output.** $q^* = ${F(A)}\sqrt{${x1}} = ${F(A)}\times ${s} = ${F(q)}$.

        **Move 5: profit.**
        $$\pi^* = p\,q - w_1x_1 - w_2\bar x_2 = ${F(p)}(${F(q)}) - ${w1}(${x1}) - ${w2}(${x2}) = ${F(p * q)} - ${w1 * x1} - ${FC} = ${F(pi)}$$

        **Move 6: isoprofit line** $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$. Slope $= ${w1}/${F(p)} = ${F(sl)}$. Intercept $= (${F(pi)} + ${FC})/${F(p)} = ${F(ic)}$.
        Check: $${F(sl)}(${x1}) + ${F(ic)} = ${F(sl * x1 + ic)} = q^*$ ✓ (the line passes through the optimum).
      `,
    };
  });

  gen('m3_pr_iso', () => {
    const p = pick([2, 4, 5, 8, 10]), m = pick([0.5, 1, 2, 3]), w1 = m * p;
    if (!Number.isInteger(w1)) return GENS.m3_pr_iso();
    const x2 = pick([2, 4, 5]), w2 = pick([3, 4, 5, 10]), FC = w2 * x2;
    const xa = ri(2, 8), xb = ri(2, 8), ia = ri(6, 20);
    let ib = ri(6, 20); if (ib === ia) ib = ia + pick([-2, 2, 3]);
    const qa = ia + m * xa, qb = ib + m * xb, pa = p * qa - w1 * xa - FC, pb = p * qb - w1 * xb - FC;
    const better = pb > pa ? 1 : 0;
    return {
      title: 'Reading isoprofit lines',
      q: md`A firm sells output at $p = ${p}$, pays $w_1 = ${w1}$ per unit of $x_1$, and has $\bar x_2 = ${x2}$ units of a fixed input at $w_2 = ${w2}$ each. Plan A uses $x_1 = ${xa}$ to make $q = ${F(qa)}$. Plan B uses $x_1 = ${xb}$ to make $q = ${F(qb)}$. Find each plan's profit and the intercept of the isoprofit line through plan A. Which plan is on the higher isoprofit line?`,
      plan: [
        plan('How do you get the profit of a plan $(x_1, q)$?', '$\\pi = p\\,q - w_1x_1 - w_2\\bar x_2$', [
          ['$\\pi = p\\,q - w_1x_1$', 'The fixed input still has to be paid: subtract $w_2\\bar x_2$ too.'],
          ['$\\pi = q - (w_1/p)\\,x_1$', 'That is the isoprofit intercept, measured in units of output. Profit is in dollars: $\\pi = p \\cdot \\text{intercept} - w_2\\bar x_2$.'],
          ['Read it from the slope $w_1/p$', 'Every isoprofit line has the same slope. The **height** (intercept) tells profit apart.'],
        ], `Revenue minus both input bills. Fixed bill: $${w2} \\times ${x2} = ${FC}$.`),
        plan('Which plan is better?', 'The one on the higher isoprofit line: the larger intercept $q - (w_1/p)x_1$', [
          ['The one with more output', 'More output can cost more labor than it is worth. Compare profit, not output.'],
          ['The one with less $x_1$', 'Saving labor is good only if it does not cost too much output.'],
          ['They tie: isoprofit lines are parallel', 'Parallel lines are different lines; a higher one means more profit.'],
        ], `Intercepts: A: $${F(qa)} - ${F(m)}(${xa}) = ${ia}$; B: $${F(qb)} - ${F(m)}(${xb}) = ${ib}$.`),
      ],
      parts: [N('\\pi_A', pa), N('\\pi_B', pb), N('\\text{intercept through A}', ia),
        FIX('Higher isoprofit line:', ['plan A', 'plan B'], better, better ? ['Plan A’s line has the lower intercept.', null] : [null, 'Plan B’s line has the lower intercept.'])],
      hints: [`$w_2\\bar x_2 = ${FC}$ is paid by both plans.`, 'Intercept $= q - (w_1/p)x_1 = (\\pi + w_2\\bar x_2)/p$.'],
      sol: md`
        **Move 1: profits.** $\pi_A = ${p}(${F(qa)}) - ${w1}(${xa}) - ${FC} = ${F(pa)}$. $\pi_B = ${p}(${F(qb)}) - ${w1}(${xb}) - ${FC} = ${F(pb)}$.

        **Move 2: intercept through A.** Slope $w_1/p = ${w1}/${p} = ${F(m)}$. Intercept $= q - ${F(m)}x_1 = ${F(qa)} - ${F(m * xa)} = ${ia}$. Check: $(\pi_A + ${FC})/${p} = ${F((pa + FC) / p)}$ ✓.

        **Move 3: compare.** Plan ${better ? 'B' : 'A'} has the larger intercept (${Math.max(ia, ib)} vs ${Math.min(ia, ib)}), so it sits on the higher isoprofit line and earns more: ${F(Math.max(pa, pb))} vs ${F(Math.min(pa, pb))}.
      `,
    };
  });

  // ------------------------------------------------------------------ lesson 3 figures
  // lecture picture: the numbers fit q = √(2x1); w1/p = 1/2 → tangent at (2, 2); w1/p = 1/3 → tangent at (4.5, 3)
  const lecPFig = EC.graph({
    w: 330, h: 260, x: [0, 9.5], y: [0, 5.6], xl: 'x_1', yl: 'q', xt: [2, 4.5], yt: [2, 3],
    items: [
      { f: (x) => Math.sqrt(2 * x), from: 0, to: 9.5, cls: 'c5', lab: 'f(x_1, \\bar x_2)', labX: 9.4, dx: -2, dy: 12, anchor: 'tr' },
      { seg: [[0, 1], [9, 5.5]], cls: 'curve c2', lab: '\\text{slope } w_1/p = 1/2', at: 0.62, dx: -6, dy: -4, anchor: 'br' },
      { seg: [[0, 4 / 3], [9.5, 4 / 3 + 9.5 / 3]], cls: 'curve c4 dash', lab: '\\text{flatter, same }\\pi', at: 1, dx: -2, dy: 12, anchor: 'tr' },
      { seg: [[0, 1.5], [9.5, 1.5 + 9.5 / 3]], cls: 'curve c3', lab: '\\text{flatter, higher}', at: 1, dx: -2, dy: -6, anchor: 'br' },
      { pt: [2, 2], guide: true, lab: '(2, 2)', at: 'tl' }, { pt: [4.5, 3], guide: true, lab: '(4.5, 3)', at: 'tl' },
    ],
  });
  const ds8WageFig = EC.graph({
    w: 330, h: 270, x: [0, 8], y: [0, 26], xl: 'x_1', yl: 'q', xt: [1, 4], yt: [4, 8, 16],
    items: [
      { f: f8, from: 0, to: 8, cls: 'c5', lab: 'q = 8\\sqrt{x_1}', labX: 8, dx: -4, dy: 12, anchor: 'tr' },
      { seg: [[0, 8], [8, 24]], cls: 'curve c3', lab: 'q = 2x_1 + 8', at: 1, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 4], [5.5, 26]], cls: 'curve c2', lab: 'q = 4x_1 + 4', at: 0.9, dx: 6, dy: 4, anchor: 'l' },
      { pt: [4, 16], guide: true, lab: '(4, 16)', at: 'br' }, { pt: [1, 8], guide: true, lab: '(1, 8)', at: 'br' },
    ],
  });
  const w2Fig = EC.graph({
    w: 330, h: 260, x: [0, 8], y: [0, 28], xl: 'x_1', yl: 'q', xt: [4], yt: [8, 11, 16],
    items: [
      { f: f8, from: 0, to: 8, cls: 'c5', lab: 'q = 8\\sqrt{x_1}', labX: 8, dx: -4, dy: 14, anchor: 'tr' },
      { seg: [[0, 8], [8, 24]], cls: 'curve c3', lab: '\\pi = 48 \\to 24', at: 1, dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 11], [8, 27]], cls: 'curve c4 dash', lab: '\\pi = 48\\text{ now}', at: 1, dx: 4, dy: 2, anchor: 'l' },
      { pt: [4, 16], guide: true, lab: '(4, 16)', at: 'br' },
    ],
  });

  // ------------------------------------------------------------------ lesson 3 generators
  gen('m3_pr_cs', () => {
    const kind = pick(['p', 'w1', 'w2']);
    let c, x2, A, s1, s2, p, p2, w1, w12, w2, w22;
    for (;;) {
      c = pick([2, 3, 4, 6]); x2 = pick([4, 9, 16]); A = c * Math.sqrt(x2); s1 = pick([2, 3, 4, 5, 6]); s2 = pick([1, 2, 3, 4, 5, 6]);
      w2 = pick([1, 2, 3, 4, 5]); w22 = w2; p2 = 0; w12 = 0;
      if (kind === 'w2') { s2 = s1; w22 = w2 + pick([1, 2, 3, 5]); }
      if (s1 === s2 && kind !== 'w2') continue;
      if (kind === 'p') { w1 = pick([2, 4, 5, 6, 8, 10, 12, 15, 16, 20]); p = 2 * s1 * w1 / A; p2 = 2 * s2 * w1 / A; w12 = w1; if (!Number.isInteger(2 * p) || !Number.isInteger(2 * p2) || p < 1 || p2 < 1 || p > 60 || p2 > 60) continue; }
      else { p = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20]); p2 = p; w1 = p * A / (2 * s1); w12 = kind === 'w1' ? p * A / (2 * s2) : w1; if (!Number.isInteger(w1) || !Number.isInteger(w12)) continue; }
      if (w1 * s1 * s1 - w2 * x2 <= 0 || w12 * s2 * s2 - w22 * x2 <= 0) continue;   // keep both profits positive
      break;
    }
    const pi1 = p * A * s1 - w1 * s1 * s1 - w2 * x2, x1n = s2 * s2, qn = A * s2, pin = p2 * qn - w12 * x1n - w22 * x2;
    const dir = s2 > s1 ? 0 : s2 < s1 ? 1 : 2;
    const what = kind === 'p' ? `the output price ${p2 > p ? 'rises' : 'falls'} from ${F(p)} to ${F(p2)}` : kind === 'w1' ? `the price of $x_1$ ${w12 > w1 ? 'rises' : 'falls'} from ${w1} to ${w12}` : `the price of the fixed input rises from ${w2} to ${w22}`;
    const steps = kind === 'w2'
      ? 'Nothing in $pMP_1 = w_1$ changed, so $x_1^*$ and $q^*$ stay put. Only the fixed bill $w_2\\bar x_2$, and so profit, changes.'
      : `Redo $pMP_1 = w_1$ with the new ${kind === 'p' ? 'price' : 'wage'}: the isoprofit slope $w_1/p$ goes from ${F(w1 / p)} to ${F(w12 / p2)}.`;
    return {
      title: 'What happens when a price changes',
      q: md`A firm has $q = ${c}\sqrt{x_1x_2}$ with $\bar x_2 = ${x2}$. At first $p = ${F(p)}$, $w_1 = ${w1}$, $w_2 = ${w2}$, so $x_1^* = ${s1 * s1}$, $q^* = ${F(A * s1)}$ and $\pi^* = ${F(pi1)}$. Now ${what}, everything else the same. Find the new $x_1^*$, $q^*$ and $\pi^*$.`,
      plan: [
        plan('What changes in the solution?', kind === 'w2' ? 'Only profit: $w_2$ is not in $pMP_1 = w_1$' : `The condition $pMP_1 = w_1$ has a new ${kind === 'p' ? '$p$' : '$w_1$'}, so $x_1^*$ moves`, [
          kind === 'w2' ? ['$x_1^*$ falls: the firm has less money to spend', 'Profit-maximizing choices do not depend on a cost that is paid no matter what. $pMP_1 = w_1$ has no $w_2$ in it.'] : ['Only profit changes; $x_1^*$ stays', `That is what a change in $w_2$ does. A change in ${kind === 'p' ? 'the output price' : 'the wage'} changes the slope $w_1/p$, so the tangency moves.`],
          ['Nothing: the firm is a price taker', 'Price takers cannot set prices, but they do respond to them.'],
          ['Everything scales by the same percentage as the price', 'The answer comes from solving $pMP_1 = w_1$ again; with a square root, $x_1^*$ moves with the **square** of $p/w_1$.'],
        ], steps),
      ],
      parts: [N('x_1^*\\text{ new}', x1n), N('q^*\\text{ new}', qn), N('\\pi^*\\text{ new}', pin),
        FIX('Labor use…', ['rises', 'falls', 'does not change'], dir, [0, 1, 2].map((j) => (j === dir ? null : 'Compare the new $\\sqrt{x_1} = pA/(2w_1)$ with the old one.')))],
      hints: [`$q = ${F(A)}\\sqrt{x_1}$, $MP_1 = ${F(A / 2)}/\\sqrt{x_1}$.`, `$pMP_1 = w_1 \\Rightarrow \\sqrt{x_1} = \\dfrac{${F(A / 2)}\\,p}{w_1}$.`],
      sol: md`
        **Move 1: the setup is unchanged.** $q = ${F(A)}\sqrt{x_1}$, $MP_1 = ${F(A / 2)}/\sqrt{x_1}$.

        **Move 2: redo $pMP_1 = w_1$ with the new numbers.**
        $$${F(p2)}\cdot\frac{${F(A / 2)}}{\sqrt{x_1}} = ${w12} \;\Rightarrow\; \sqrt{x_1} = \frac{${F(p2 * A / 2)}}{${w12}} = ${s2} \;\Rightarrow\; x_1^* = ${x1n}$$
        ${kind === 'w2' ? 'Same as before: $w_2$ never entered this equation.' : `Before it was ${s1 * s1}.`}

        **Move 3: output** $q^* = ${F(A)}(${s2}) = ${F(qn)}$.

        **Move 4: profit** $\pi^* = ${F(p2)}(${F(qn)}) - ${w12}(${x1n}) - ${w22}(${x2}) = ${F(pin)}$ (was ${F(pi1)}).

        **Does this make sense?** ${kind === 'p' ? (p2 > p ? 'Higher price: flatter isoprofit lines, tangency further right: more input, more output, more profit.' : 'Lower price: steeper isoprofit lines, tangency further left: less input, less output, less profit.') : kind === 'w1' ? (w12 > w1 ? 'Dearer input: steeper isoprofit lines, tangency further left: less input, less output, less profit.' : 'Cheaper input: flatter isoprofit lines, tangency further right: more input, more output, more profit.') : `The fixed bill rose by ${(w22 - w2) * x2}, and profit fell by exactly that much. The plan itself did not move.`}
      `,
    };
  });

  const DIRS = [
    ['the output price $p$ rises', 'flatter', 'rises', 'rises', 'rises', '$w_1/p$ falls: the line is flatter and touches $f$ further right.'],
    ['the output price $p$ falls', 'steeper', 'falls', 'falls', 'falls', '$w_1/p$ rises: the line is steeper and touches $f$ further left.'],
    ['the wage $w_1$ rises', 'steeper', 'falls', 'falls', 'falls', '$w_1/p$ rises: steeper line, tangency further left (DS8 Q1c).'],
    ['the wage $w_1$ falls', 'flatter', 'rises', 'rises', 'rises', '$w_1/p$ falls: flatter line, tangency further right.'],
    ['the rental price $w_2$ of the fixed input rises', 'unchanged', 'does not change', 'does not change', 'falls', '$w_2$ is not in $w_1/p$, so the tangency does not move. The fixed bill is bigger, so profit falls.'],
    ['the rental price $w_2$ of the fixed input falls', 'unchanged', 'does not change', 'does not change', 'rises', '$w_2$ is not in $w_1/p$: same plan, smaller fixed bill.'],
    ['the city adds a yearly license fee', 'unchanged', 'does not change', 'does not change', 'falls', 'A fixed fee is like a bigger $w_2\\bar x_2$: the plan stays, profit falls by the fee.'],
    ['$p$ and $w_1$ both double', 'unchanged', 'does not change', 'does not change', 'rises', '$w_1/p$ is unchanged, so the plan is the same. Revenue minus labor cost doubles while the fixed bill does not, so profit rises.'],
  ];
  gen('m3_pr_dir', () => {
    const [chg, sl, xd, qd, pd, why] = pick(DIRS);
    const o3 = ['rises', 'falls', 'does not change'], oS = ['steeper', 'flatter', 'unchanged'];
    const mk = (lbl, opts, ans) => { const a = opts.indexOf(ans); return FIX(lbl, opts, a, opts.map((_, j) => (j === a ? null : why))); };
    return {
      title: 'Which way does it move?',
      q: md`A competitive firm is at its short-run profit maximum, with $x_2$ fixed. Then ${chg}, everything else the same. What happens?`,
      plan: [plan('What do you look at first?', 'The slope $w_1/p$ of the isoprofit lines', [
        ['The intercept: a higher intercept means more input', 'The intercept moves with the profit **level**. Where the line touches $f$ is set by its slope.'],
        ['Whether profit goes up', 'Profit can fall while the plan stays put (a fixed cost) or change along with it. The slope decides the plan.'],
        ['The fixed input’s price', 'That only matters for profit, never for where the tangency is.'],
      ], 'Slope falls: flatter, tangency moves right (more $x_1$, more $q$). Slope rises: steeper, moves left. Slope unchanged: same plan.')],
      parts: [mk('The isoprofit lines become…', oS, sl), mk('$x_1^*$…', o3, xd), mk('$q^*$…', o3, qd), mk('$\\pi^*$…', o3, pd)],
      sol: md`${why}`,
    };
  });

  // ------------------------------------------------------------------ lesson 4 figures
  // the long-run bundle for q = x1^(1/4) x2^(1/4), w1 = w2 = 2, p = 40: (25, 25), q = 5, cost 100
  const costMinFig = EC.graph({
    w: 320, h: 260, x: [0, 56], y: [0, 56], xl: 'x_1', yl: 'x_2', xt: [25, 50], yt: [25, 50],
    items: [
      { f: (x) => 625 / x, from: 11.5, to: 55, cls: 'c5', lab: 'q = 5', labX: 54, dx: -2, dy: -8, anchor: 'br' },
      { seg: [[0, 50], [50, 0]], cls: 'curve c3', lab: '2x_1 + 2x_2 = 100', at: 0.15, dx: 8, dy: -2, anchor: 'l' },
      { pt: [25, 25], guide: true, lab: '(25, 25)', at: 'tr' },
    ],
  });
  const drsFig = EC.graph({
    w: 300, h: 240, x: [0, 10], y: [0, 15], xl: '\\text{scale } x', yl: 'q', xt: [4], yt: [8],
    items: [
      { f: (x) => 4 * Math.sqrt(x), from: 0, to: 10, cls: 'c5', lab: 'f\\ (\\text{DRS})', labX: 10, dx: -2, dy: 12, anchor: 'tr' },
      { seg: [[0, 4], [10, 14]], cls: 'curve c3', lab: '\\text{best line}', at: 1, dx: -2, dy: -6, anchor: 'br' },
      { pt: [4, 8], guide: true, lab: '\\text{one optimum}', at: 'tl' },
    ],
  });
  const irsFig = EC.graph({
    w: 300, h: 240, x: [0, 8], y: [0, 16], xl: '\\text{scale } x', yl: 'q', xt: [4, 6], yt: [],
    items: [
      { f: (x) => x * x / 4, from: 0, to: 8, cls: 'c5', lab: 'f\\ (\\text{IRS})', labX: 7.8, dx: -6, dy: 2, anchor: 'r' },
      { seg: [[0, 0], [8, 8]], cls: 'curve c2', lab: '\\pi\'', at: 1, dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 3], [8, 11]], cls: 'curve c3', lab: '\\pi\'\' > \\pi\'', at: 1, dx: 4, dy: 2, anchor: 'l' },
      { pt: [4, 4] }, { pt: [6, 9] },
      { arrow: [[2.2, 1.4], [1.2, 4.6]] }, { text: [0.3, 6.3], t: '\\text{profit rises}', anchor: 'l' },
    ],
  });
  const crsFig = EC.graph({
    w: 300, h: 240, x: [0, 8], y: [0, 16], xl: '\\text{scale } x', yl: 'q', xt: [2, 4], yt: [],
    items: [
      { f: (x) => 2 * x, from: 0, to: 8, cls: 'c5', lab: 'f\\ (\\text{CRS})', labX: 7.6, dx: -6, dy: 2, anchor: 'r' },
      { seg: [[0, 2], [8, 10]], cls: 'curve c2', lab: '\\pi\'', at: 1, dx: 4, dy: 2, anchor: 'l' },
      { seg: [[0, 4], [8, 12]], cls: 'curve c3', lab: '\\pi\'\' > \\pi\'', at: 1, dx: 4, dy: 2, anchor: 'l' },
      { pt: [2, 4] }, { pt: [4, 8] },
    ],
  });

  // ------------------------------------------------------------------ lesson 4 generators
  const PLAN_LR = plan('How many conditions do you need?', 'Two: $pMP_1 = w_1$ and $pMP_2 = w_2$', [
    ['One: $pMP_1 = w_1$ with $x_2$ held fixed', 'That is the short run. In the long run nothing is fixed, so each input gets its own condition.'],
    ['One: $MP_1/MP_2 = w_1/w_2$', 'That gives the cheapest **mix** of inputs, not how much to produce. You still need one $pMP = w$ to set the scale.'],
    ['$P = \\min LRAC$', 'That is the long-run **market** price under free entry, not one firm’s input choice.'],
  ], 'Divide the two to get the input mix, then put the mix into one of them to get the scale.');

  gen('m3_pr_lr', () => {
    if (pick([true, false])) {
      // q = A x1^(1/4) x2^(1/4), w1 = w2 = w: x1 = x2 = s^2, q = A s, p = 4ws/A
      let A, s, w, p;
      do { A = pick([1, 2, 4, 10]); s = pick([2, 3, 4, 5, 6, 8, 10]); w = pick([1, 2, 3, 4, 5]); p = 4 * w * s / A; } while (!Number.isInteger(2 * p) || p > 200);
      const x = s * s, q = A * s, pi = p * q - 2 * w * x, Ac = A === 1 ? '' : A;
      return {
        title: 'Long-run profit maximum',
        q: md`In the long run a competitive firm chooses both inputs. $q = ${Ac}x_1^{1/4}x_2^{1/4}$, $p = ${F(p)}$, $w_1 = w_2 = ${w}$. Find $x_1^*$, $x_2^*$, $q^*$ and $\pi^*$, and name the returns to scale.`,
        plan: [PLAN_LR],
        parts: [N('x_1^*', x), N('x_2^*', x), N('q^*', q), N('\\pi^*', pi), FIX('Returns to scale', ['decreasing', 'constant', 'increasing'], 0, [null, 'Exponents add to $1/4 + 1/4 = 1/2$, not 1.', 'The exponent sum is $1/2 < 1$.'])],
        hints: ['$MP_1/MP_2 = x_2/x_1$. With equal input prices, $x_2 = x_1$.', `Then $q = ${Ac}x_1^{1/2}$ and $pMP_1 = ${F(p)}\\cdot\\tfrac{${A}}{4}x_1^{-1/2}$.`],
        sol: md`
          **Move 1: the two conditions.** $MP_1 = \tfrac{${A}}{4}x_1^{-3/4}x_2^{1/4}$ and $MP_2 = \tfrac{${A}}{4}x_1^{1/4}x_2^{-3/4}$.

          **Move 2: divide** to get the mix: $\dfrac{MP_1}{MP_2} = \dfrac{x_2}{x_1} = \dfrac{w_1}{w_2} = 1$, so $x_2 = x_1$.

          **Move 3: one condition with the mix.** With $x_2 = x_1$: $MP_1 = \tfrac{${A}}{4}x_1^{-3/4}x_1^{1/4} = \tfrac{${A}}{4}x_1^{-1/2}$.
          $$${F(p)}\cdot\frac{${A}}{4\sqrt{x_1}} = ${w} \;\Rightarrow\; \sqrt{x_1} = \frac{${F(p * A / 4)}}{${w}} = ${s} \;\Rightarrow\; x_1^* = x_2^* = ${x}$$

          **Move 4:** $q^* = ${Ac}(${x})^{1/4}(${x})^{1/4} = ${Ac}\sqrt{${x}} = ${q}$. $\pi^* = ${F(p)}(${q}) - ${w}(${x}) - ${w}(${x}) = ${F(p * q)} - ${2 * w * x} = ${F(pi)}$.

          **Move 5: returns to scale.** $1/4 + 1/4 = 1/2 < 1$: decreasing. That is why there is one finite optimum.
        `,
      };
    }
    // q = A x1^(1/2) x2^(1/4), w1 = 2 w2: x1 = x2 = t^4, q = A t^3, p = 2 w1 t / A
    let A, t, w1, p;
    do { A = pick([1, 2, 4]); t = pick([2, 3]); w1 = pick([2, 4, 6, 8, 10]); p = 2 * w1 * t / A; } while (!Number.isInteger(2 * p));
    const w2 = w1 / 2, x = t ** 4, q = A * t ** 3, pi = p * q - w1 * x - w2 * x, Ac = A === 1 ? '' : A;
    return {
      title: 'Long-run profit maximum',
      q: md`In the long run a competitive firm chooses both inputs. $q = ${Ac}x_1^{1/2}x_2^{1/4}$, $p = ${F(p)}$, $w_1 = ${w1}$, $w_2 = ${F(w2)}$. Find $x_1^*$, $x_2^*$, $q^*$ and $\pi^*$, and name the returns to scale.`,
      plan: [PLAN_LR],
      parts: [N('x_1^*', x), N('x_2^*', x), N('q^*', q), N('\\pi^*', pi), FIX('Returns to scale', ['decreasing', 'constant', 'increasing'], 0, [null, 'Exponents add to $1/2 + 1/4 = 3/4$, not 1.', 'The exponent sum is $3/4 < 1$.'])],
      hints: ['$MP_1/MP_2 = \\dfrac{\\tfrac12 x_1^{-1/2}x_2^{1/4}}{\\tfrac14 x_1^{1/2}x_2^{-3/4}} = \\dfrac{2x_2}{x_1}$.', `Set $2x_2/x_1 = ${w1}/${F(w2)} = 2$: $x_2 = x_1$.`],
      sol: md`
        **Move 1: the two conditions.** $MP_1 = \tfrac{${A}}{2}x_1^{-1/2}x_2^{1/4}$ and $MP_2 = \tfrac{${A}}{4}x_1^{1/2}x_2^{-3/4}$.

        **Move 2: divide.** $\dfrac{MP_1}{MP_2} = \dfrac{2x_2}{x_1} = \dfrac{w_1}{w_2} = \dfrac{${w1}}{${F(w2)}} = 2$, so $x_2 = x_1$.

        **Move 3: one condition with the mix.** With $x_2 = x_1$: $MP_1 = \tfrac{${A}}{2}x_1^{-1/2}x_1^{1/4} = \tfrac{${A}}{2}x_1^{-1/4}$.
        $$${F(p)}\cdot\tfrac{${A}}{2}x_1^{-1/4} = ${w1} \;\Rightarrow\; x_1^{1/4} = \frac{${F(p * A / 2)}}{${w1}} = ${t} \;\Rightarrow\; x_1^* = ${t}^4 = ${x} = x_2^*$$

        **Move 4:** $q^* = ${Ac}(${x})^{1/2}(${x})^{1/4} = ${Ac}(${x})^{3/4} = ${Ac}(${t})^3 = ${q}$. $\pi^* = ${F(p)}(${q}) - ${w1}(${x}) - ${F(w2)}(${x}) = ${F(pi)}$.

        **Move 5: returns to scale.** $1/2 + 1/4 = 3/4 < 1$: decreasing, so one finite optimum exists.
      `,
    };
  });

  const RTS_FN = [
    ['x_1^{1/4}x_2^{1/4}', 0.5, '1/2'], ['x_1^{0.3}x_2^{0.5}', 0.8, '0.8'], ['x_1^{1/3}x_2^{1/3}', 2 / 3, '2/3'], ['x_1^{1/2}x_2^{1/4}', 0.75, '3/4'], ['5x_1^{0.2}x_2^{0.6}', 0.8, '0.8'],
    ['x_1^{1/2}x_2^{1/2}', 1, '1'], ['x_1^{0.3}x_2^{0.7}', 1, '1'], ['4x_1^{1/4}x_2^{3/4}', 1, '1'], ['2\\sqrt{x_1x_2}', 1, '1/2 + 1/2 = 1'],
    ['x_1^{0.6}x_2^{0.6}', 1.2, '1.2'], ['x_1x_2', 2, '2'], ['x_1^{3/4}x_2^{1/2}', 1.25, '5/4'], ['10x_1^{0.8}x_2^{0.4}', 1.2, '1.2'],
  ];
  gen('m3_pr_rts', () => {
    const [fn, sum, sumT] = pick(RTS_FN), rts = sum < 1 ? 0 : sum === 1 ? 1 : 2;
    const sumS = `$${sumT}$`;
    const lrac = pick([4, 5, 6, 8, 10]), rel = pick([1, 0, -1]), Pr = lrac + rel * pick([1, 2]);
    const beh = rts === 0 ? 0 : rts === 2 ? 1 : rel > 0 ? 1 : rel === 0 ? 2 : 3;
    const behO = ['one finite profit-maximizing scale', 'no finite optimum: profit keeps rising with scale', 'zero profit at every scale: size not pinned down', 'produce nothing'];
    const behWhy = [
      'That needs decreasing returns: growing eventually adds less revenue than cost.',
      rts === 1 ? 'With constant returns that needs $P > LRAC$: then each unit earns a fixed margin and bigger is always better.' : 'That needs increasing returns, or constant returns with $P > LRAC$.',
      'That is constant returns with $P$ exactly equal to $LRAC$.',
      'That is constant returns with $P < LRAC$: every unit loses money.',
    ];
    return {
      title: 'Returns to scale and the long-run optimum',
      q: md`A competitive firm in the long run has $q = ${fn}$. ${rts === 1 ? `Its long-run average cost is constant at \\$${lrac}, and the market price is \\$${Pr}.` : `The market price is \\$${Pr}.`} Name the returns to scale and describe the firm's long-run profit maximum.`,
      plan: [plan('What do you check first?', 'Returns to scale: add the exponents', [
        ['Whether each $MP$ is diminishing', 'Diminishing marginal products can hold under any returns to scale ($x_1^{0.6}x_2^{0.6}$ has both). The question is what happens when **all** inputs grow together.'],
        ['Whether the price is high', 'The price matters only under constant returns, and then only compared with LRAC. Check the returns first.'],
        ['Solve $pMP_1 = w_1$, $pMP_2 = w_2$ right away', 'Without decreasing returns those conditions do not find a maximum (with increasing returns they find a profit **minimum**).'],
      ], `Exponent sum ${sumS}: ${['decreasing', 'constant', 'increasing'][rts]} returns.${rts === 1 ? ` Then compare $P = ${Pr}$ with $LRAC = ${lrac}$.` : ''}`)],
      parts: [FIX('Returns to scale', ['decreasing', 'constant', 'increasing'], rts, [0, 1, 2].map((j) => (j === rts ? null : `The exponents add to ${sumS}.`))),
        FIX('Long-run profit maximum', behO, beh, behO.map((_, j) => (j === beh ? null : behWhy[j])))],
      sol: md`
        **Move 1: returns to scale.** Exponents add to ${sumS}: ${sum < 1 ? 'less than 1: **decreasing** returns' : sum === 1 ? 'exactly 1: **constant** returns' : 'more than 1: **increasing** returns'}.

        **Move 2: what scaling up does.** Multiply every input by $k$: cost rises by exactly $k$. Revenue rises by ${sum < 1 ? 'less than $k$. Growing eventually costs more than it brings in, so there is **one optimal scale**: solve $pMP_1 = w_1$, $pMP_2 = w_2$.' : sum === 1 ? `exactly $k$ too, so profit scales by $k$. Per unit the firm earns $P - LRAC = ${Pr} - ${lrac} = ${Pr - lrac}$. ${rel > 0 ? 'Positive: profit rises without limit as it grows, **no finite optimum**.' : rel === 0 ? 'Zero: **zero profit at every scale**; the size of the firm is not pinned down.' : 'Negative: every unit loses money, so the best is to **produce nothing**.'}` : 'more than $k$. Once any scale breaks even, doubling more than doubles profit: **no finite optimum**. (Solving the first-order conditions here finds the profit **minimum**.)'}
      `,
    };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3u1', exam: 'm3', num: 'Part 7', title: 'Profit and input choice', blurb: 'economic vs accounting profit, price taking, pMP = w and isoprofit lines, what price changes do, the long run and returns to scale',
    lessons: [
      // ================================================================ lesson 1
      {
        id: 'm3-pr1', title: 'Economic profit, price taking, and thinking at the margin', ref: 'Lecture 14',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "find accounting profit and economic profit" | which costs were paid in cash, which were given up | accounting = revenue − explicit; economic = accounting − implicit |
            | "she could have earned \$40,000 at her old job", "the building could be rented out", "her own savings could earn 5%" | these are **implicit costs** | subtract them for economic profit only |
            | "the firm earns zero economic profit: is it failing?" | what zero means | no: the owner earns exactly her next-best option |
            | "will firms enter or leave?" | the sign of **economic** profit | positive: entry; negative: exit |
            | "why can a competitive firm not charge more than the market price?" | price taking | it would sell nothing: its demand is flat at $P$ |
            | "should the firm make one more unit?" | marginal thinking | compare $MR$ with $MC$ |

            By the end of this page you should read a word problem and sort every dollar into revenue, explicit cost, or implicit cost without thinking twice.
          `),
          R(md`
            ### Two ways to count profit

            You open a pita food truck. At the end of the year you add up what came in and what went out.

            - Sales brought in \$60,000.
            - You paid \$45,000 for wages, ingredients and permits.

            Your accountant says your profit is \$15,000. That is **accounting profit**: revenue minus the money you actually paid out.

            But the truck cost you more than that. You gave up two things without writing any check:

            - You could have worked at a restaurant all year and earned \$7,000.
            - You own the truck. You could have rented it to another student for \$3,000.

            Those are real costs of choosing the food truck. Economists call them **opportunity costs**: the value of the best alternative use of a resource you own.

            | Word | Meaning | Food truck |
            |---|---|---|
            | **Explicit cost** | money actually paid to someone else (out of pocket) | wages, ingredients, permits: \$45,000 |
            | **Implicit cost** | what your own resources could have earned in their best other use; no check is written | forgone wages \$7,000; forgone truck rental \$3,000 |
          `),
          R(md`
            ### The two formulas, one step at a time

            Accounting profit subtracts only explicit costs:
            $$\text{accounting profit} = \text{revenue} - \text{explicit costs}$$

            Economic profit subtracts every cost, explicit and implicit:
            $$\text{economic profit} = \text{revenue} - \text{explicit costs} - \text{implicit costs}$$

            Put the two together and you get a shortcut:
            $$\text{economic profit} = \text{accounting profit} - \text{implicit costs}$$

            **Move 1: sort every number** into revenue, explicit, or implicit. Revenue 60,000. Explicit 45,000. Implicit 7,000 and 3,000.

            **Move 2: accounting profit.**
            $$60{,}000 - 45{,}000 = 15{,}000$$

            **Move 3: economic profit.** Take the implicit costs away too:
            $$15{,}000 - 7{,}000 - 3{,}000 = 5{,}000$$

            !!intuition Does this make sense?
              Implicit costs are never negative, so economic profit is never larger than accounting profit. If you ever get the opposite, you subtracted something twice or added an implicit cost.

            From now on, **profit** in this course means **economic** profit. The formula sheet writes it as $\pi = TR - TC$, where $TC$ includes explicit and implicit costs. The symbol $\pi$ (Greek "pi") is just the name for profit here, not 3.14.
          `),
          Q(md`Lecture example: sales \$60,000; wages, ingredients and permits \$45,000; owner’s forgone wages \$7,000; forgone truck rental \$3,000. Accounting and economic profit are…`,
            ['accounting \\$15,000; economic \\$5,000', 'accounting \\$5,000; economic \\$15,000', 'both \\$15,000', 'both \\$5,000'], 0,
            [null, 'Swapped: economic profit subtracts more costs, so it is the smaller one.', 'Economic profit must also subtract the \\$10,000 of implicit costs.', 'Accounting profit subtracts only the cash costs, so it is \\$15,000.'],
            md`Accounting: $60{,}000 - 45{,}000 = 15{,}000$. Economic: $15{,}000 - 7{,}000 - 3{,}000 = 5{,}000$.`),
          R(md`
            ### What zero economic profit means

            Suppose sales had been \$55,000 instead. Accounting profit $= 55{,}000 - 45{,}000 = 10{,}000$. Economic profit $= 10{,}000 - 7{,}000 - 3{,}000 = 0$.

            Is the truck a failure? No. You made \$10,000 in cash, which is exactly what the restaurant job (\$7,000) and renting out the truck (\$3,000) would have paid together. You did exactly as well as your next-best option.

            !!key The sign of economic profit tells you who moves
              **Positive:** the owner does better here than anywhere else. Outsiders see it too and want in: **entry**.

              **Zero:** the owner does exactly as well as the best alternative. Nobody wants to enter or leave. This is "normal", not failure.

              **Negative:** the owner's time and money earn more elsewhere. In the long run she leaves: **exit**.

            This is the engine behind long-run supply: [entry and exit](#/l/m3-lr1).

            !!trap The books can look fine while economic profit is negative
              If the forgone wage were \$20,000 instead of \$7,000, accounting profit would still be \$15,000 but economic profit would be $15{,}000 - 20{,}000 - 3{,}000 = -8{,}000$. The owner should leave in the long run even though the accountant reports a profit.
          `),
          Q(md`A firm earns zero economic profit. Which is true?`,
            ['the owner earns exactly what her next-best option would pay', 'the firm is losing money and should close', 'its accounting profit is also zero', 'its revenue covers only its explicit costs'], 0,
            [null, 'Zero economic profit covers every cost, including what the owner gave up. Nothing to escape from.', 'Accounting profit is larger by the implicit costs, so it is positive whenever implicit costs are.', 'Covering only explicit costs is zero **accounting** profit, which is an economic loss.'],
            md`Economic cost already includes the owner’s forgone wage and capital. Zero means "doing exactly as well as the alternative".`),
          Q(md`Accounting profit is \$20,000. The owner gave up a \$35,000 salary to run the firm. In the long run the owner…`,
            ['leaves: economic profit is −\\$15,000', 'stays: accounting profit is positive', 'is indifferent: economic profit is zero', 'cannot decide without the market price'], 0,
            [null, 'Positive accounting profit ignores the salary she gave up.', '$20{,}000 - 35{,}000$ is not zero.', 'Everything needed is here: economic profit is already negative.'],
            md`$20{,}000 - 35{,}000 = -15{,}000$. Her next-best option pays more, so in the long run she exits.`),
          R(md`
            ### Spotting implicit costs in a word problem

            Implicit costs hide in phrases. Look for **could have**, **forgone**, **own**, **instead**.

            | The problem says… | Implicit cost | Amount per year |
            |---|---|---|
            | "She quit a job that paid \$50,000" | forgone salary | \$50,000 |
            | "He owns the building; similar space rents for \$2,000 a month" | forgone rent | $12 \times 2{,}000 = 24{,}000$ |
            | "She put \$100,000 of her own savings in; the bank pays 4%" | forgone interest | $0.04 \times 100{,}000 = 4{,}000$ |
            | "The family land could be leased to a neighbor for \$30,000" | forgone lease income | \$30,000 |
            | "He works in the shop and pays himself nothing" | his time: what he could earn elsewhere | his outside wage |

            !!trap Three classic slips
              **The savings are not the cost.** The \$100,000 is still the owner's money, now inside the business. What she gives up is the **interest** it would have earned: \$4,000.

              **Hired workers' wages are explicit.** Only the owner's own forgone wage is implicit.

              **Match the time units.** A monthly rent becomes 12 times as much per year.
          `),
          Q(md`Which of these is an **implicit** cost for a bakery owner?`,
            ['the interest her own \\$50,000 of savings could earn at the bank', 'the wages she pays her two employees', 'the flour she buys each week', 'the rent she pays her landlord'], 0,
            [null, 'Wages paid to employees are cash out the door: explicit.', 'Flour is bought with cash: explicit.', 'Rent paid to a landlord is a check written: explicit. Forgone rent on a building she **owns** would be implicit.'],
            md`No check is written for the interest she gives up, but it is a real cost of tying her savings up in the bakery.`),
          RF(md`
            ### Why a competitive firm takes the price as given

            A **perfectly competitive** market has four features:

            | Feature | What it means | Why it matters for one firm |
            |---|---|---|
            | Many buyers and sellers | each one is tiny next to the market | nobody can move the price |
            | Identical (homogeneous) products | buyers don't care whose pita they get | charge more and buyers switch |
            | Perfect information | everyone knows the prices | buyers find the cheaper seller instantly |
            | Free entry and exit | firms can come and go | in the long run, economic profit is driven to zero |

            The market price comes from market supply and demand. Customers line up willing to pay \$8, the market price.

            [[fig:mkt]]

            What if your truck charges \$8.50? Every customer walks to the next truck, which sells an identical pita for \$8. You sell **nothing**.

            What if you charge \$7.50? You sell all you can make, but you could have sold all of it at \$8. You give away 50 cents a sandwich for nothing.

            So you charge exactly \$8, and your only choice is **how many** to make. Your demand curve is a horizontal line at the market price.

            [[fig:firm]]

            !!key Price taker: $P = MR$
              Every extra sandwich sells for the same \$8, so each one adds exactly \$8 to revenue. **Marginal revenue** $MR$ (the extra revenue from one more unit) equals the price: $MR = P$.
          `, {
            mkt: { svg: marketFig, cap: 'The market: supply and demand set the price at 8.' },
            firm: { svg: takerFig, cap: 'One truck: the demand it faces is flat at 8. It can sell 6 or 12 at that price; above 8 it sells nothing.' },
          }),
          Q(md`A competitive wheat farm raises its price above the market price. It sells…`,
            ['nothing', 'a little less', 'the same amount at a higher price', 'more, because buyers read a high price as high quality'], 0,
            [null, 'A small drop is what a firm with some market power sees. Here buyers have identical wheat available at the market price.', 'Buyers know the market price and the wheat is identical, so none pay more.', 'Products are identical and information is perfect: there is no quality signal.'],
            md`Its demand is horizontal at the market price. Any price above it, and every buyer goes elsewhere.`),
          Q(md`Which is **not** a feature of perfect competition?`,
            ['firms sell differentiated, brand-name products', 'many buyers and sellers', 'free entry and exit', 'buyers and sellers know the prices'], 0,
            [null, 'Many small participants is a defining feature.', 'Free entry and exit is a defining feature: it drives long-run profit to zero.', 'Perfect information is a defining feature.'],
            md`Perfect competition needs **identical** products. Brand names give a firm some power over its price.`),
          R(md`
            ### Thinking at the margin

            Your only choice is $q$, the number of sandwiches. The right question is not "what is my average profit?" It is: **"What happens if I make one more?"**

            - One more sandwich brings in $MR$, the marginal revenue. For you, $MR = P = 8$.
            - It costs $MC$, the **marginal cost**: the extra cost of that one sandwich.

            Suppose the extra cost of each sandwich is:

            | Sandwich | $MR$ | $MC$ | Make it? |
            |---|---|---|---|
            | 1st | 8 | 3 | yes: adds 5 |
            | 2nd | 8 | 4 | yes: adds 4 |
            | 3rd | 8 | 5 | yes: adds 3 |
            | 4th | 8 | 6 | yes: adds 2 |
            | 5th | 8 | 7 | yes: adds 1 |
            | 6th | 8 | 9 | **no**: loses 1 |

            Make 5. The first five add $5 + 4 + 3 + 2 + 1 = 15$ to profit; the sixth would take 1 back.

            !!method The marginal rule
              If $MR > MC$: produce more. If $MR < MC$: produce less. Stop where $MR = MC$.

              For a price taker $MR = P$, so the rule becomes $P = MC$. That is the whole of [Part 8](#/l/m3-sr2).

            !!intuition Averages mislead
              The average $MC$ of the first six sandwiches is $(3 + 4 + 5 + 6 + 7 + 9)/6 \approx 5.67$, well below \$8. Yet the sixth sandwich itself loses \$1. A decision about "one more" uses the cost of that one more.
          `),
          Q(md`At the current output a firm’s $MR$ is \$12 and its $MC$ is \$9. To raise profit it should…`,
            ['produce more', 'produce less', 'keep output where it is', 'raise its price'], 0,
            [null, 'Cutting back gives up a unit that adds \\$3.', 'The next unit adds \\$12 − \\$9 = \\$3; staying put leaves that on the table.', 'A price taker cannot: buyers would go elsewhere.'],
            md`$MR > MC$: the next unit brings in more than it costs. Keep going until the two are equal.`),
          R(md`
            ### Spot it: no numbers needed

            Each card is only a plan question. Decide the move, then read why the others fail.
          `),
          P({ q: md`Jake quits a \$45,000 job to run a bike shop. The shop brings in \$120,000 and he pays \$70,000 to suppliers and staff.`,
            plan: plan('To find **economic** profit, what do you take away from \\$120,000?', '\\$70,000 and his forgone \\$45,000 salary', [
              ['Only the \\$70,000', 'That gives accounting profit. The salary he gave up is a cost of running the shop.'],
              ['Only the \\$45,000', 'The \\$70,000 paid to suppliers and staff is a cost too.'],
              ['Nothing: what comes in is profit', 'Revenue is not profit; every cost comes out.'],
            ], 'Accounting: $120{,}000 - 70{,}000 = 50{,}000$. Economic: $50{,}000 - 45{,}000 = 5{,}000$.') }),
          P({ q: md`Ana runs her catering firm with \$200,000 of her own money, which could earn 5% a year in bonds.`,
            plan: plan('What is the yearly implicit cost of that money?', '\\$10,000: the interest she gives up', [
              ['\\$200,000: the money itself', 'The \\$200,000 is still hers, inside the business. The cost is what it could have earned.'],
              ['\\$0: she paid nobody', 'No check is written, but she gives up \\$10,000 of interest. That is exactly what an implicit cost is.'],
              ['\\$210,000', 'Neither the principal nor principal plus interest is the cost. Only the forgone return is.'],
            ], '$0.05 \\times 200{,}000 = 10{,}000$ a year, subtracted for economic profit only.') }),
          P({ q: md`A wheat farmer sells at the market price of \$6 a bushel. His manager wants to charge \$6.20 because "our wheat is just as good as anyone’s".`,
            plan: plan('What happens if he charges \\$6.20?', 'He sells nothing: buyers get identical wheat at \\$6', [
              ['He sells a bit less but earns more per bushel', 'That is a firm with a downward-sloping demand. A price taker’s demand is flat at the market price.'],
              ['Everyone else follows him to \\$6.20', 'One small farm cannot move the market price.'],
              ['He sells the same amount: "just as good" means buyers stay', 'Just as good means identical, so buyers have no reason to pay more.'],
            ], 'Price taker: demand is horizontal at \\$6. He picks only how much to sell.') }),
          P({ q: md`A pita truck sells at \$8. Making one more sandwich would cost \$6.50.`,
            plan: plan('Should the truck make it?', 'Yes: it adds \\$1.50 to profit', [
              ['No: average cost might be higher', 'The decision about one more unit compares that unit’s $MR$ and $MC$, not averages.'],
              ['Only if it brings average cost down', 'Profit rises whenever $MR > MC$, whatever happens to the average.'],
              ['No: the truck should make the price higher instead', 'A price taker cannot raise its price.'],
            ], '$MR - MC = 8 - 6.50 = 1.50 > 0$: make it, and keep asking until $MC$ reaches \\$8.') }),
          P({ q: md`A firm’s economic profit is zero. Its accountant reports a profit of \$80,000.`,
            plan: plan('What does the \\$80,000 tell you?', 'Its implicit costs add up to exactly \\$80,000', [
              ['The economist made a mistake', 'Both can be right: accounting profit leaves out implicit costs.'],
              ['The owner should leave', 'Zero economic profit means she does exactly as well as her best alternative.'],
              ['Its explicit costs are \\$80,000', 'Accounting profit is revenue minus explicit costs; it says nothing about their size.'],
            ], 'Economic = accounting − implicit, so $0 = 80{,}000 - \\text{implicit}$: implicit $= 80{,}000$.') }),
          R(md`
            ### Practice: plan first, then numbers

            Every card asks how you would attack it before any number. Pick, read why, then compute.
          `),
          P({ title: 'The lecture food truck', q: md`Sales revenue \$60,000. Wages, ingredients and permits \$45,000. The owner could have earned \$7,000 working at a restaurant, and could have rented the truck to another student for \$3,000.`,
            plan: plan('How do you sort the four numbers?', 'Revenue 60,000; explicit 45,000; implicit 7,000 and 3,000', [
              ['All three costs are explicit', 'The forgone wage and the forgone rental are never paid to anyone. They are implicit.'],
              ['The 7,000 is explicit because it is a wage', 'It is a wage the owner did **not** receive: an opportunity cost, so implicit.'],
              ['Ignore the 7,000 and 3,000: no money changed hands', 'That gives accounting profit only. Economic profit counts them.'],
            ], 'Accounting = revenue − explicit. Economic = accounting − implicit.'),
            parts: [N('\\text{accounting profit}', 15000), N('\\text{economic profit}', 5000)],
            sol: md`
              **Move 1: sort.** Revenue 60,000. Explicit 45,000. Implicit $7{,}000 + 3{,}000 = 10{,}000$.

              **Move 2: accounting profit** $= 60{,}000 - 45{,}000 = 15{,}000$.

              **Move 3: economic profit** $= 15{,}000 - 10{,}000 = 5{,}000$. Positive: the truck beats the owner's next-best plan by \$5,000 a year.
            ` }),
          P({ title: 'A dentist’s practice', q: md`A dentist's practice brings in \$400,000 a year. She pays \$250,000 for staff, supplies and equipment leases. She could earn \$120,000 a year working for a hospital. She owns her office building, which she could rent out for \$2,000 a month. She also put \$100,000 of her savings into the practice; it could have earned 5% a year.`,
            plan: [
              plan('Which implicit costs go into economic profit (per year)?', '120,000 + 24,000 + 5,000', [
                ['120,000 + 2,000 + 100,000', 'Two slips: the rent is per month (12 × 2,000 per year), and the cost of the savings is the interest, not the savings.'],
                ['120,000 + 24,000 + 100,000', 'The \\$100,000 is still her money, now in the practice. Only the 5% it would have earned is given up.'],
                ['120,000 only', 'The building and the savings are her own resources too. What they could have earned is also given up.'],
              ], 'Salary 120,000; rent $12 \\times 2{,}000 = 24{,}000$; interest $0.05 \\times 100{,}000 = 5{,}000$. Total 149,000.'),
            ],
            parts: [N('\\text{accounting profit}', 150000), N('\\text{implicit costs}', 149000), N('\\text{economic profit}', 1000),
              FIX('In the long run she…', ['stays', 'leaves', 'is exactly indifferent'], 0, [null, 'Economic profit is positive, if small: the practice beats her alternatives.', 'Indifference needs exactly zero.'])],
            sol: md`
              **Move 1: accounting profit** $= 400{,}000 - 250{,}000 = 150{,}000$.

              **Move 2: implicit costs**, all per year:
              $$120{,}000 + 12 \times 2{,}000 + 0.05 \times 100{,}000 = 120{,}000 + 24{,}000 + 5{,}000 = 149{,}000$$

              **Move 3: economic profit** $= 150{,}000 - 149{,}000 = 1{,}000$.

              The accountant reports \$150,000, but the practice beats her best alternative by only \$1,000. Still positive, so she stays.
            ` }),
          P({ title: 'Break-even revenue', q: md`Same food truck: explicit costs \$45,000, forgone wages \$7,000, forgone truck rental \$3,000. How much revenue gives exactly zero economic profit? What would accounting profit be then?`,
            plan: plan('Zero economic profit means revenue equals…', 'explicit costs plus implicit costs', [
              ['explicit costs only', 'Revenue equal to explicit costs is zero **accounting** profit, which is an economic loss of 10,000.'],
              ['implicit costs only', 'The cash costs still have to be covered.'],
              ['the forgone wage', 'That is one implicit cost; all costs have to be covered.'],
            ], 'Revenue $= 45{,}000 + 7{,}000 + 3{,}000$. Accounting profit is then the implicit costs.'),
            parts: [N('\\text{revenue}', 55000), N('\\text{accounting profit}', 10000)],
            sol: md`
              **Move 1:** economic profit $= R - 45{,}000 - 7{,}000 - 3{,}000 = 0 \Rightarrow R = 55{,}000$.

              **Move 2:** accounting profit $= 55{,}000 - 45{,}000 = 10{,}000$, exactly the implicit costs. The owner pockets \$10,000, the same as the restaurant job plus renting out the truck.
            ` }),
          P({ title: 'A family farm', q: md`A farm sells \$250,000 of corn. Seed, fuel, fertilizer and hired labor cost \$190,000. The family owns the land, which a neighbor would lease for \$40,000 a year. The farmer could earn \$35,000 a year as a crop consultant.`,
            plan: plan('Before computing: what decides whether the family keeps farming in the long run?', 'The sign of **economic** profit', [
              ['The sign of accounting profit', 'Accounting profit ignores the lease income and the consulting salary they give up.'],
              ['Whether revenue covers the \\$190,000', 'That is accounting profit again. The land and the farmer’s time have other uses.'],
              ['Whether the price is above the market price', 'A price taker sells at the market price; that is not the question here.'],
            ], 'Accounting $= 250{,}000 - 190{,}000$. Economic: also subtract 40,000 and 35,000.'),
            parts: [N('\\text{accounting profit}', 60000), N('\\text{economic profit}', -15000),
              FIX('In the long run the family…', ['leases the land out and takes the consulting job', 'keeps farming: the books show \\$60,000', 'is indifferent'], 0, [null, 'The \\$60,000 is less than the \\$75,000 the land and the farmer could earn elsewhere.', 'Indifference needs economic profit of exactly zero.'])],
            sol: md`
              **Move 1: accounting profit** $= 250{,}000 - 190{,}000 = 60{,}000$.

              **Move 2: economic profit** $= 60{,}000 - 40{,}000 - 35{,}000 = -15{,}000$.

              **Move 3: decide.** Leasing the land (\$40,000) and consulting (\$35,000) pays \$75,000, which beats farming's \$60,000 by \$15,000. In the long run the family exits farming, even though the books show a profit.
            ` }),
          P({ title: 'How many units?', q: md`A competitive seller of pies takes the market price of \$10. Its fixed cost is \$12. The cost of each additional pie is:

| Pie | 1st | 2nd | 3rd | 4th | 5th | 6th |
|---|---|---|---|---|---|---|
| $MC$ | 4 | 5 | 7 | 9 | 12 | 15 |`,
            plan: plan('How do you decide how many pies?', 'Add pies while the next pie’s $MC$ is below the price, \\$10', [
              ['Make only the pie with the lowest $MC$', 'Pies 2 to 4 also cost less than \\$10, so each adds profit.'],
              ['Make all six: every pie sells for \\$10', 'Pies 5 and 6 cost \\$12 and \\$15, more than they sell for.'],
              ['Stop where total revenue equals total cost', 'That is zero profit, not the most profit.'],
            ], 'Pies 1–4 have $MC < 10$; pie 5 has $MC = 12 > 10$. Make 4.'),
            parts: [N('q^*', 4), N('\\pi', 3), N('\\Delta\\pi\\text{ from the 5th pie}', -2)],
            sol: md`
              **Move 1:** $MR = P = 10$ for every pie.

              **Move 2:** pies 1 to 4 cost 4, 5, 7, 9: all below 10. Pie 5 costs 12. So $q^* = 4$.

              **Move 3: profit.** Revenue $10 \times 4 = 40$. Variable cost $4 + 5 + 7 + 9 = 25$. $\pi = 40 - 25 - 12 = 3$.

              **Move 4:** the 5th pie would add $10 - 12 = -2$. Profit would drop to 1.
            ` }),
          G('m3_pr_econprofit', { need: 3 }),
          G('m3_pr_margin', { need: 2 }),
        ],
      },
      // ================================================================ lesson 2
      {
        id: 'm3-pr2', title: 'Short-run input choice: pMP = w and isoprofit lines', ref: 'Lecture 14 · DS8 Q1',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "$q = f(x_1, x_2)$, $x_2$ fixed at $\bar x_2$; write short-run profit as a function of $x_1$" | the profit function | plug in $\bar x_2$: $\pi(x_1) = p\,f(x_1, \bar x_2) - w_1x_1 - w_2\bar x_2$ |
            | "use $pMP_1 = w_1$ to find $x_1^*$, $q^*$, $\pi^*$" | the input rule | $MP_1 = \partial f/\partial x_1$; set $p \cdot MP_1 = w_1$; solve; plug back |
            | "value of the marginal product", "marginal revenue product" | $p \cdot MP_1$ | the dollars one more unit of input brings in |
            | "if $pMP_1 > w_1$, should the firm hire more?" | compare | yes: the next unit brings in more than it costs |
            | "write the isoprofit line", "what is its slope?" | profit solved for $q$ | $q = \frac{w_1}{p}x_1 + \frac{\pi + w_2\bar x_2}{p}$; slope $w_1/p$ |
            | "sketch the production function and the profit-maximizing isoprofit line" | the tangency | slope $w_1/p$, touching $f$ at $(x_1^*, q^*)$ |
          `),
          R(md`
            ### The symbols

            The firm makes output $q$ from two inputs.

            - $x_1$: the **variable** input, the one the firm can change now (hours of labor).
            - $x_2$: the **fixed** input (the truck's capacity). The bar in $\bar x_2$ means "stuck at this amount" in the short run.
            - $q = f(x_1, x_2)$: the **production function**, how much output a bundle of inputs makes.
            - $p$: the price of output. $w_1$, $w_2$: the prices of the inputs (wage, rental rate).
            - $MP_1 = \dfrac{\partial f}{\partial x_1}$: the **marginal product** of $x_1$, the extra output from one more unit of $x_1$ with $x_2$ held fixed.

            Profit is revenue minus what both inputs cost:
            $$\pi = p\,q - w_1x_1 - w_2\bar x_2$$
            The last term, $w_2\bar x_2$, is the **fixed cost**: the truck is paid for no matter how many hours you hire.
          `),
          R(md`
            ### Should you hire one more hour?

            Back to the food truck (DS8). One truck, $\bar x_2 = 4$ units of capacity. Pitas sell for $p = 8$. An hour of labor costs $w_1 = 16$. With this truck, $x_1$ hours make $q = 8\sqrt{x_1}$ pitas.

            Hire one more hour and ask two questions:

            - **What does it bring in?** It adds $MP_1$ pitas, each sold for $p$. So it adds $p \cdot MP_1$ dollars. That is the **value of the marginal product**.
            - **What does it cost?** The wage, $w_1 = 16$.

            Look at it hour by hour:

            | Hour | Pitas made | Extra pitas | Extra dollars ($\times 8$) | vs wage 16 |
            |---|---|---|---|---|
            | 1st | 8.00 | 8.00 | 64.0 | hire |
            | 2nd | 11.31 | 3.31 | 26.5 | hire |
            | 3rd | 13.86 | 2.54 | 20.3 | hire |
            | 4th | 16.00 | 2.14 | 17.1 | hire |
            | 5th | 17.89 | 1.89 | 15.1 | **stop** |

            Each extra hour adds fewer pitas than the one before: more workers crowd the same truck. That is **diminishing marginal product**. So the dollars each hour brings in fall, and at some point they drop below the wage. Here the 4th hour still pays (17.1 > 16), the 5th does not (15.1 < 16). Hire 4.

            !!method The input rule in words
              Hire more of $x_1$ while $p \cdot MP_1 > w_1$. Hire less if $p \cdot MP_1 < w_1$. Stop where they are equal:
              $$p \cdot MP_1 = w_1$$
          `),
          RF(md`
            ### The same rule with calculus

            Write profit as a function of the one thing you choose, $x_1$:
            $$\pi(x_1) = p\,f(x_1, \bar x_2) - w_1x_1 - w_2\bar x_2$$

            At the top of the profit hill the slope is zero. Differentiate term by term. The first term gives $p$ times $\partial f/\partial x_1 = MP_1$. The second gives $w_1$. The third, $w_2\bar x_2$, is a constant, so its derivative is zero:
            $$\frac{d\pi}{dx_1} = p \cdot MP_1 - w_1 = 0$$

            Move $w_1$ across:
            $$p \cdot MP_1 = w_1 \qquad\Longleftrightarrow\qquad MP_1 = \frac{w_1}{p}$$

            [[fig:vmp]]

            !!trap Do not drop the $p$
              $MP_1 = w_1$ compares pitas with dollars. The extra pitas have to be turned into dollars first: multiply by the price.

            !!key Why the fixed cost does not matter for $x_1^*$
              $w_2\bar x_2$ drops out when you differentiate. A cost you pay no matter what cannot change the best choice. It changes **profit**, never $x_1^*$ or $q^*$.
          `, { vmp: { svg: vmpFig, cap: 'The value of the marginal product falls as hours are added. Left of 4 each hour brings in more than the 16 it costs (green); right of 4 it brings in less.' } }),
          Q(md`At the current labor level, $p \cdot MP_1 = \$40$ and the wage is $w_1 = \$25$. The firm should…`,
            ['hire more labor', 'hire less labor', 'keep labor where it is', 'raise the wage'], 0,
            [null, 'Cutting back gives up an hour that brings in \\$40 for a \\$25 cost.', 'The next hour adds \\$15 more than it costs; there is profit left to take.', 'The wage is a market price the firm takes as given.'],
            md`$pMP_1 > w_1$: the next hour pays for itself and then some. As it hires more, $MP_1$ falls until $pMP_1 = w_1$.`),
          Q(md`Why does $w_2\bar x_2$ not appear in the condition $pMP_1 = w_1$?`,
            ['it is a constant, so its derivative with respect to $x_1$ is zero', 'the fixed input is free in the short run', 'it is already counted inside $MP_1$', 'it cancels against revenue'], 0,
            [null, 'It is not free: it is paid every period. It just does not change with $x_1$.', '$MP_1$ is a physical quantity (extra output); no prices are inside it.', 'Nothing cancels: it still lowers profit, it just does not move the best $x_1$.'],
            md`Fixed cost shifts the whole profit hill down without moving its peak.`),
          RF(md`
            ### Isoprofit lines: every plan with the same profit

            Now a picture. Put $x_1$ on the horizontal axis and $q$ on the vertical. Pick a profit level, say $\pi = 48$, and ask: **which $(x_1, q)$ plans earn exactly that?**

            Start from profit:
            $$\pi = p\,q - w_1x_1 - w_2\bar x_2$$
            Move the cost terms to the left:
            $$p\,q = \pi + w_1x_1 + w_2\bar x_2$$
            Divide by $p$:
            $$q = \frac{w_1}{p}\,x_1 + \frac{\pi + w_2\bar x_2}{p}$$

            That is a straight line, the **isoprofit line** ("iso" means "same"). For the truck, $w_1/p = 16/8 = 2$ and $w_2\bar x_2 = 4 \times 4 = 16$:
            $$q = 2x_1 + \frac{\pi + 16}{8}$$
            So $\pi = 16$ gives $q = 2x_1 + 4$, $\pi = 48$ gives $q = 2x_1 + 8$, $\pi = 80$ gives $q = 2x_1 + 12$.

            [[fig:fam]]

            **The slope $w_1/p$** is what one more unit of $x_1$ costs, measured in output. One more hour costs \$16, which is $16/8 = 2$ pitas' worth. To keep profit the same, that hour must bring 2 more pitas.

            **The intercept $(\pi + w_2\bar x_2)/p$** is the output you would need with zero labor to pay the fixed cost and still earn $\pi$.

            **Higher line, higher profit.** Same slope, bigger intercept. The lines never cross.
          `, { fam: { svg: isoFamilyFig, cap: 'Three isoprofit lines for the truck. All have slope w₁/p = 2; the higher the line, the higher the profit.' } }),
          Q(md`$p = 10$ and $w_1 = 30$. The slope of every isoprofit line is…`, ['3', '1/3', '−3', '300'], 0,
            [null, 'Upside down: the slope is $w_1/p$, not $p/w_1$.', 'Isoprofit lines slope **up**: more input needs more output to keep profit the same.', 'Divide the prices, do not multiply them.'],
            md`$w_1/p = 30/10 = 3$: one more unit of $x_1$ costs 3 units of output.`),
          Q(md`Two isoprofit lines for the same firm have intercepts 6 and 9. Which is true?`,
            ['the line with intercept 9 has higher profit', 'the line with intercept 6 has higher profit', 'they have the same profit because they are parallel', 'you need the production function to tell'], 0,
            [null, 'The intercept $(\\pi + w_2\\bar x_2)/p$ grows with $\\pi$.', 'Parallel lines with different intercepts are different profit levels.', 'Comparing profit levels of lines needs only the intercepts.'],
            md`Intercept $= (\pi + w_2\bar x_2)/p$. Same $p$ and fixed cost, so a bigger intercept means a bigger $\pi$.`),
          RF(md`
            ### The best plan: the highest line that still touches $f$

            The firm can only pick plans it can actually produce: points on the production function $q = 8\sqrt{x_1}$ (points below it waste inputs, points above it are impossible).

            [[fig:tan]]

            - The $\pi = 80$ line is all above $f$: no plan earns that much.
            - The $\pi = 16$ line cuts through $f$. Plans on $f$ above that line earn more than 16, so 16 is not the best.
            - Slide the line up until it **just touches** $f$. That is $\pi = 48$, touching at $(4, 16)$.

            At the touching point the line and the curve have the same slope. The curve's slope is $MP_1$; the line's slope is $w_1/p$:
            $$MP_1 = \frac{w_1}{p} \quad\Longleftrightarrow\quad p \cdot MP_1 = w_1$$
            The picture and the calculus give the same rule.
          `, { tan: { svg: ds8Fig, cap: 'DS8: the production function q = 8√x₁ (red) and three isoprofit lines of slope 2. The π = 48 line is tangent at (4, 16): the best plan.' } }),
          Q(md`At the profit-maximizing plan, the isoprofit line is…`,
            ['tangent to the production function', 'crossing the production function twice', 'entirely above the production function', 'flat'], 0,
            [null, 'If it crosses, plans between the crossings sit on a higher line: more profit is available.', 'Then the plan is impossible: no point on that line can be produced.', 'Its slope is $w_1/p > 0$.'],
            md`Highest line you can still reach: it just touches $f$, so the slopes match, $MP_1 = w_1/p$.`),
          R(md`
            ### Worked example (DS8 Q1): the whole problem

            $q = 4\sqrt{x_1x_2}$, $\bar x_2 = 4$, $p = 8$, $w_1 = 16$, $w_2 = 4$. Find short-run profit as a function of $x_1$, then $x_1^*$, $q^*$, $\pi^*$, and the isoprofit line through the optimum.

            **Move 1: plug in the fixed input.**
            $$q = 4\sqrt{4x_1} = 4 \cdot \sqrt{4} \cdot \sqrt{x_1} = 4 \cdot 2\sqrt{x_1} = 8\sqrt{x_1}$$

            **Move 2: the short-run profit function.**
            $$\pi(x_1) = 8\,(8\sqrt{x_1}) - 16x_1 - 4 \cdot 4 = 64\sqrt{x_1} - 16x_1 - 16$$

            **Move 3: $MP_1$.** Write $q = 8x_1^{1/2}$ and use the power rule:
            $$MP_1 = 8 \cdot \tfrac{1}{2}x_1^{-1/2} = \frac{4}{\sqrt{x_1}}$$

            **Move 4: $pMP_1 = w_1$.**
            $$8 \cdot \frac{4}{\sqrt{x_1}} = 16 \;\Rightarrow\; \frac{32}{\sqrt{x_1}} = 16 \;\Rightarrow\; \sqrt{x_1} = 2 \;\Rightarrow\; x_1^* = 4$$

            **Move 5: output.** $q^* = 8\sqrt{4} = 16$.

            **Move 6: profit.**
            $$\pi^* = 8(16) - 16(4) - 16 = 128 - 64 - 16 = 48$$

            **Move 7: the isoprofit line.** Slope $w_1/p = 16/8 = 2$. Intercept $(\pi^* + w_2\bar x_2)/p = (48 + 16)/8 = 8$:
            $$q = 2x_1 + 8$$
            Check: at $x_1 = 4$, $2(4) + 8 = 16 = q^*$ ✓. The line passes through the optimum, as it must.

            !!intuition Two roads, same answer
              You could also build the cost of pitas and use $P = MC$. From $q = 8\sqrt{x_1}$, $x_1 = q^2/64$, so $C(q) = 16 \cdot q^2/64 + 16 = q^2/4 + 16$ and $MC = q/2$. Then $8 = q/2$ gives $q = 16$. Same plan. The reason: $pMP_1 = w_1$ rearranges to $p = w_1/MP_1$, and $w_1/MP_1$ is what one more pita costs when you make it with more labor, which is $MC$.
          `),
          R(md`
            ### Spot it: no numbers needed

            Decide the move, then read why the others fail.
          `),
          P({ q: md`A firm's short-run production function, with its fixed input already plugged in, is $q = 6x_1^{1/3}$. The output price is $p = 4$ and $w_1 = 2$.`,
            plan: plan('What equation finds $x_1^*$?', '$4 \\cdot 2x_1^{-2/3} = 2$, which is $p \\cdot MP_1 = w_1$', [
              ['$2x_1^{-2/3} = 2$', 'That is $MP_1 = w_1$: extra output compared with a dollar wage. Multiply by $p = 4$ first.'],
              ['$2x_1^{-2/3} = 0$', 'That would maximize output, and it has no solution anyway: $MP_1$ is always positive here.'],
              ['$4 = MC$ with $MC = 2$', 'There is no cost function given; work with inputs: $pMP_1 = w_1$.'],
            ], '$MP_1 = 6 \\cdot \\tfrac13 x_1^{-2/3} = 2x_1^{-2/3}$. Then $8x_1^{-2/3} = 2 \\Rightarrow x_1^{2/3} = 4 \\Rightarrow x_1 = 8$.') }),
          P({ q: md`A classmate solving DS8 writes: "$MP_1 = 4/\sqrt{x_1} = 16$, so $\sqrt{x_1} = 1/4$ and $x_1 = 1/16$."`,
            plan: plan('What went wrong?', 'The price is missing: it should be $8 \\cdot 4/\\sqrt{x_1} = 16$', [
              ['Nothing: the algebra is right', 'The algebra is fine, but the condition is wrong. $MP_1$ is pitas; $w_1$ is dollars.'],
              ['She should have used $w_2$', '$w_2$ prices the fixed input; the hour of labor costs $w_1$.'],
              ['She should have set $MP_1 = 0$', 'That maximizes output, not profit.'],
            ], 'With the price: $32/\\sqrt{x_1} = 16 \\Rightarrow x_1 = 4$. A tiny answer like $1/16$ is a red flag.') }),
          P({ q: md`On a graph, the isoprofit line through the firm's current plan cuts the production function at two points.`,
            plan: plan('Is the current plan the profit maximum?', 'No: slide to a higher parallel line until it just touches $f$', [
              ['Yes: it is on the production function', 'Being on $f$ means no waste, not the most profit. Plans between the crossings are on higher isoprofit lines.'],
              ['Yes, if the two crossings are close together', 'Any crossing means some reachable plan earns more.'],
              ['No: move to a steeper isoprofit line', 'The slope is $w_1/p$, set by prices. The firm can only move to a higher line with the same slope.'],
            ], 'The best plan is where the isoprofit line is tangent: $MP_1 = w_1/p$.') }),
          P({ q: md`DS8 graph: the isoprofit line tangent to $q = 8\sqrt{x_1}$ meets the vertical axis at $q = 8$. You know $p = 8$ and $w_2\bar x_2 = 16$.`,
            plan: plan('How do you get $\\pi^*$ from the graph?', '$\\pi^* = p \\cdot \\text{intercept} - w_2\\bar x_2 = 64 - 16 = 48$', [
              ['$\\pi^* = 8$, the intercept', 'The intercept is in **units of output**, and it includes the fixed cost.'],
              ['$\\pi^* = 8 \\times 8 = 64$', 'That still includes the fixed cost: intercept $= (\\pi + w_2\\bar x_2)/p$.'],
              ['You need $x_1^*$ first', 'Not here: the intercept already pins down $\\pi$.'],
            ], 'Solve intercept $= (\\pi + w_2\\bar x_2)/p$ for $\\pi$: $\\pi = p \\cdot 8 - 16 = 48$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'DS8 Q1a–b', q: md`A food truck sells pitas for \$8 each. $q = 4\sqrt{x_1x_2}$, with labor $x_1$ and truck capacity $x_2$. In the short run $\bar x_2 = 4$, $w_1 = 16$, $w_2 = 4$. Write short-run profit as a function of $x_1$, then find $x_1^*$, $q^*$, $\pi^*$, and the isoprofit line through the optimum.`,
            plan: [PLAN_SR_SUB(4), PLAN_PMP],
            parts: [X('\\pi(x_1)', '64*sqrt(x1) - 16*x1 - 16', { x1: [1, 9] }), N('x_1^*', 4), N('q^*', 16), N('\\pi^*', 48), N('\\text{isoprofit slope}', 2), N('\\text{isoprofit intercept}', 8)],
            hints: ['$\\sqrt{4x_1} = 2\\sqrt{x_1}$.', '$MP_1 = 4/\\sqrt{x_1}$.'],
            sol: md`
              **Move 1:** $q = 4\sqrt{4x_1} = 8\sqrt{x_1}$.

              **Move 2:** $\pi(x_1) = 8(8\sqrt{x_1}) - 16x_1 - 4(4) = 64\sqrt{x_1} - 16x_1 - 16$.

              **Move 3:** $MP_1 = 4/\sqrt{x_1}$. $pMP_1 = w_1$: $32/\sqrt{x_1} = 16 \Rightarrow \sqrt{x_1} = 2 \Rightarrow x_1^* = 4$.

              **Move 4:** $q^* = 8(2) = 16$; $\pi^* = 128 - 64 - 16 = 48$.

              **Move 5:** isoprofit $q = (16/8)x_1 + (48 + 16)/8 = 2x_1 + 8$.
            ` }),
          P({ title: 'A farm with fixed acres', q: md`A farm grows $q = 6\sqrt{x_1x_2}$ bushels from $x_1$ hours of labor and $x_2$ acres. This season it has $\bar x_2 = 4$ acres, rented at $w_2 = 5$ each. Wheat sells for $p = 2$ a bushel and labor costs $w_1 = 4$ an hour.`,
            plan: [PLAN_SR_SUB(4), PLAN_PMP],
            parts: [N('x_1^*', 9), N('q^*', 36), N('\\pi^*', 16), X('\\text{isoprofit line } q(x_1)', '2*x1 + 18', { x1: [0, 10] })],
            hints: ['$q = 6\\sqrt{4}\\sqrt{x_1} = 12\\sqrt{x_1}$, so $MP_1 = 6/\\sqrt{x_1}$.'],
            sol: md`
              **Move 1: fix the acres.** $q = 6\sqrt{4x_1} = 6 \cdot 2\sqrt{x_1} = 12\sqrt{x_1}$.

              **Move 2: $MP_1$.** $MP_1 = 12 \cdot \tfrac12 x_1^{-1/2} = 6/\sqrt{x_1}$.

              **Move 3: $pMP_1 = w_1$.** $2 \cdot 6/\sqrt{x_1} = 4 \Rightarrow 12/\sqrt{x_1} = 4 \Rightarrow \sqrt{x_1} = 3 \Rightarrow x_1^* = 9$.

              **Move 4:** $q^* = 12 \times 3 = 36$. $\pi^* = 2(36) - 4(9) - 5(4) = 72 - 36 - 20 = 16$.

              **Move 5: isoprofit.** Slope $4/2 = 2$; intercept $(16 + 20)/2 = 18$: $q = 2x_1 + 18$. Check: $2(9) + 18 = 36$ ✓.
            ` }),
          P({ title: 'A cube-root technology', q: md`$q = x_1^{1/3}x_2^{1/3}$. In the short run $\bar x_2 = 8$. $p = 12$, $w_1 = 2$, $w_2 = 1$.`,
            plan: [
              PLAN_SR_SUB(8),
              plan('After setting $12 \\cdot \\tfrac23 x_1^{-2/3} = 2$, how do you solve for $x_1$?', 'Get $x_1^{2/3}$ alone, then raise both sides to the power $3/2$', [
                ['Multiply both sides by $-2/3$', 'Exponents are undone with exponents, not by multiplying.'],
                ['Take the square root of both sides', 'That would undo a power of 2, not $2/3$.'],
                ['Set $x_1^{-2/3} = 0$', 'A negative power of a positive number is never zero.'],
              ], '$8x_1^{-2/3} = 2 \\Rightarrow x_1^{2/3} = 4 \\Rightarrow x_1 = 4^{3/2} = (\\sqrt4)^3 = 8$.'),
            ],
            parts: [N('x_1^*', 8), N('q^*', 4), N('\\pi^*', 24), N('\\text{isoprofit slope}', 1 / 6), N('\\text{isoprofit intercept}', 8 / 3)],
            hints: ['$q = x_1^{1/3} \\cdot 8^{1/3} = 2x_1^{1/3}$.', '$MP_1 = 2 \\cdot \\tfrac13 x_1^{-2/3} = \\tfrac23 x_1^{-2/3}$.'],
            sol: md`
              **Move 1:** $8^{1/3} = 2$, so $q = 2x_1^{1/3}$.

              **Move 2:** $MP_1 = 2 \cdot \tfrac13 x_1^{-2/3} = \tfrac23 x_1^{-2/3}$.

              **Move 3:** $pMP_1 = w_1$:
              $$12 \cdot \tfrac23 x_1^{-2/3} = 2 \;\Rightarrow\; 8x_1^{-2/3} = 2 \;\Rightarrow\; x_1^{2/3} = 4 \;\Rightarrow\; x_1^* = 4^{3/2} = 8$$

              **Move 4:** $q^* = 2 \cdot 8^{1/3} = 4$. $\pi^* = 12(4) - 2(8) - 1(8) = 48 - 16 - 8 = 24$.

              **Move 5:** isoprofit slope $2/12 = 1/6$, intercept $(24 + 8)/12 = 8/3 \approx 2.67$. Check: $\tfrac16(8) + \tfrac83 = \tfrac43 + \tfrac83 = 4$ ✓.
            ` }),
          P({ title: 'Reading isoprofit lines', q: md`$p = 5$, $w_1 = 10$, and the fixed input costs $w_2\bar x_2 = 30$. (a) Write the isoprofit line for $\pi = 20$. (b) Plan A is $(x_1, q) = (3, 15)$; plan B is $(5, 21)$. Find each profit.`,
            plan: plan('For (a), what are the slope and intercept?', 'Slope $w_1/p = 2$; intercept $(20 + 30)/5 = 10$', [
              ['Slope $p/w_1 = 1/2$', 'Upside down. One more unit of $x_1$ costs $w_1/p$ units of output.'],
              ['Intercept $20/5 = 4$', 'The fixed cost also has to be covered: $(\\pi + w_2\\bar x_2)/p$.'],
              ['Slope $-2$', 'Isoprofit lines slope up: more input needs more output for the same profit.'],
            ], '$q = 2x_1 + 10$. For a plan, $\\pi = pq - w_1x_1 - 30$.'),
            parts: [X('q(x_1)\\text{ for }\\pi = 20', '2*x1 + 10', { x1: [0, 10] }), N('\\pi_A', 15), N('\\pi_B', 25)],
            sol: md`
              **(a)** $q = \tfrac{10}{5}x_1 + \tfrac{20 + 30}{5} = 2x_1 + 10$.

              **(b)** $\pi_A = 5(15) - 10(3) - 30 = 15$. $\pi_B = 5(21) - 10(5) - 30 = 25$. Check with intercepts: A's line has intercept $15 - 2(3) = 9$, B's has $21 - 2(5) = 11$. B is higher, so B earns more ✓.
            ` }),
          P({ title: 'Hiring from a table', q: md`A bakery sells bread at \$3 a loaf. Each worker costs \$15 a day. The extra loaves from each worker are:

| Worker | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| $MP$ (loaves) | 10 | 8 | 6 | 4 | 2 |`,
            plan: plan('How many workers?', 'Hire while $p \\cdot MP \\ge w$: compare $3 \\times MP$ with 15', [
              ['Hire while $MP \\ge 15$', 'Loaves are not dollars: turn them into dollars with the price first.'],
              ['Hire all five: each one adds loaves', 'The 4th adds only \\$12 of bread for a \\$15 wage.'],
              ['Hire one: it has the highest $MP$', 'The 2nd and 3rd still bring in more than they cost.'],
            ], 'Values: 30, 24, 18, 12, 6. The first three beat 15; the 4th does not.'),
            parts: [N('\\text{workers}', 3), N('\\text{value of the 4th worker’s output}', 12)],
            sol: md`Value of the marginal product $= 3 \times MP$: 30, 24, 18, 12, 6. Workers 1 to 3 bring in more than \$15; the 4th brings in \$12 < \$15. Hire 3.` }),
          G('m3_pr_sr', { need: 3 }),
          G('m3_pr_iso', { need: 2 }),
        ],
      },
      // ================================================================ lesson 3
      {
        id: 'm3-pr3', title: 'What happens when p or w changes', ref: 'Lecture 14 · DS8 Q1c–d',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "the output price increases; what happens to $x_1$ and $q$?" | which way the slope $w_1/p$ moves | smaller slope: flatter line, tangency moves right: more $x_1$, more $q$ |
            | "the labor price increases from \$16 to \$32; find the new $x_1^*$, $q^*$, $\pi^*$" | redo the input rule | solve $pMP_1 = w_1$ with the new $w_1$, then plug back |
            | "the price of the fixed input rises" | does $w_2$ appear in $pMP_1 = w_1$? | no: $x_1^*$ and $q^*$ stay; profit falls by $\Delta w_2 \cdot \bar x_2$ |
            | "sketch the original and new isoprofit lines; label both tangency points" | two tangent lines | each line has its own slope and touches $f$ once |
            | "what happens to the slope when labor gets more expensive? why do labor and output change?" | read $w_1/p$ | steeper; only hours with a higher $MP_1$ are worth it, so fewer hours |

            Most of these are answered **without numbers**: look at what happens to $w_1/p$.
          `),
          R(md`
            ### One number runs the whole picture: the slope $w_1/p$

            The best plan is where the isoprofit line touches the production function:
            $$MP_1 = \frac{w_1}{p}$$

            The production function is steep near zero and flattens out as you add labor, because each extra hour adds less than the one before (diminishing $MP_1$). So:

            - A **flatter** line (smaller $w_1/p$) touches $f$ where $f$ is flatter: **further right**. More $x_1$, and more $q$.
            - A **steeper** line (bigger $w_1/p$) touches $f$ where $f$ is steeper: **further left**. Less $x_1$, less $q$.
            - If $w_1/p$ does not change, the touching point does not move.

            !!key The comparative-statics table
              | Change | $w_1/p$ | Isoprofit lines | $x_1^*$ | $q^*$ | $\pi^*$ |
              |---|---|---|---|---|---|
              | $p$ up | down | flatter | up | up | up |
              | $p$ down | up | steeper | down | down | down |
              | $w_1$ up | up | steeper | down | down | down |
              | $w_1$ down | down | flatter | up | up | up |
              | $w_2$ up (fixed input) | same | same slope | same | same | down |

            "Comparative statics" just means comparing the best plan before and after one thing changes.
          `),
          RF(md`
            ### The price rises (Lecture 14)

            **Story first.** Pitas sell for more. Each hour of labor makes the same extra pitas as before, but now they are worth more dollars, so $p \cdot MP_1$ rises. Hours that were not quite worth hiring now are. The firm hires more and makes more.

            **The picture**, in the lecture's three steps:

            1. The higher price makes the slope $w_1/p$ smaller: the old line rotates **flatter** (dashed). Through the old point it is no longer tangent; it cuts $f$, so better plans exist to the right.
            2. Slide the flatter line **up**, keeping its slope, until it just touches $f$ again.
            3. The new touching point is to the right and higher: more input, more output.

            [[fig:lp]]

            **The numbers.** The lecture's graph fits $q = \sqrt{2x_1}$. Its marginal product, by the chain rule:
            $$MP_1 = \tfrac12(2x_1)^{-1/2} \cdot 2 = \frac{1}{\sqrt{2x_1}}$$
            Before, $w_1/p = 1/2$:
            $$\frac{1}{\sqrt{2x_1}} = \frac12 \;\Rightarrow\; \sqrt{2x_1} = 2 \;\Rightarrow\; 2x_1 = 4 \;\Rightarrow\; x_1 = 2,\quad q = 2$$
            After the price rises by half, $w_1/p = 1/3$:
            $$\frac{1}{\sqrt{2x_1}} = \frac13 \;\Rightarrow\; \sqrt{2x_1} = 3 \;\Rightarrow\; 2x_1 = 9 \;\Rightarrow\; x_1 = 4.5,\quad q = 3$$
            The plan moves from $(2, 2)$ to $(4.5, 3)$, exactly the lecture's two dots.
          `, { lp: { svg: lecPFig, cap: 'Lecture 14: the price rises. The tangent line rotates flatter (dashed, now cutting f), then shifts up until it touches f again at (4.5, 3).' } }),
          Q(md`The output price rises. The isoprofit lines become…`, ['flatter', 'steeper', 'higher but with the same slope', 'vertical'], 0,
            [null, 'Steeper needs $w_1/p$ to rise. A bigger $p$ makes it smaller.', 'The slope is $w_1/p$, and $p$ is in it.', 'The slope is $w_1/p$, a finite number.'],
            md`$w_1/p$ falls when $p$ rises. Each unit of input now costs fewer units of output.`),
          Q(md`Why does a flatter isoprofit line touch the production function further to the right?`,
            ['the production function gets flatter as $x_1$ grows (diminishing $MP_1$)', 'flatter lines are always higher', 'the firm wants more output when prices rise', 'the intercept falls'], 0,
            [null, 'Slope and height are separate. The tangency is about matching slopes.', 'True, but the reason is geometric: $MP_1$ has to fall to match the smaller $w_1/p$, and $MP_1$ falls only as $x_1$ grows.', 'The intercept tells profit, not where the tangency is.'],
            md`Tangency needs $MP_1 = w_1/p$. A smaller $w_1/p$ needs a smaller $MP_1$, which is found at a larger $x_1$.`),
          RF(md`
            ### The wage rises (DS8 Q1c–d)

            Same truck: $q = 8\sqrt{x_1}$, $p = 8$, $w_2\bar x_2 = 16$. The wage doubles from \$16 to \$32.

            **Story first.** Each hour now costs $32/8 = 4$ pitas' worth instead of 2. Only hours that add at least 4 pitas are worth it. Fewer hours qualify.

            **Move 1: same $MP_1$.** The technology did not change: $MP_1 = 4/\sqrt{x_1}$.

            **Move 2: $pMP_1 = w_1$ with the new wage.**
            $$8 \cdot \frac{4}{\sqrt{x_1}} = 32 \;\Rightarrow\; \frac{32}{\sqrt{x_1}} = 32 \;\Rightarrow\; \sqrt{x_1} = 1 \;\Rightarrow\; x_1^* = 1$$

            **Move 3: output and profit.**
            $$q^* = 8\sqrt{1} = 8, \qquad \pi^* = 8(8) - 32(1) - 4(4) = 64 - 32 - 16 = 16$$

            **Move 4: the new isoprofit line.** Slope $32/8 = 4$; intercept $(16 + 16)/8 = 4$:
            $$q = 4x_1 + 4$$
            Check: $4(1) + 4 = 8 = q^*$ ✓.

            | Outcome | $w_1 = 16$ | $w_1 = 32$ |
            |---|---|---|
            | labor $x_1^*$ | 4 | 1 |
            | output $q^*$ | 16 | 8 |
            | profit $\pi^*$ | 48 | 16 |
            | isoprofit line | $q = 2x_1 + 8$ | $q = 4x_1 + 4$ |

            [[fig:w]]

            A higher wage **steepens** the isoprofit lines. The tangency moves left and down.
          `, { w: { svg: ds8WageFig, cap: 'DS8 Q1d: the steeper line q = 4x₁ + 4 (orange, w₁ = 32) touches at (1, 8); the original q = 2x₁ + 8 (green, w₁ = 16) touches at (4, 16).' } }),
          Q(md`In DS8, doubling the wage cut labor from 4 to 1, a factor of 4, not 2. Why?`,
            ['$\\sqrt{x_1^*} = 32/w_1$, so $x_1^*$ moves with the **square** of $1/w_1$', 'the firm also lost profit, so it cut back extra', 'the fixed cost doubled too', 'it is a rounding effect'], 0,
            [null, 'Profit does not enter the choice; only $pMP_1 = w_1$ does.', 'The fixed cost $w_2\\bar x_2 = 16$ did not change.', 'The numbers are exact: $x_1 = 4$ and $x_1 = 1$.'],
            md`$32/\sqrt{x_1} = w_1 \Rightarrow \sqrt{x_1} = 32/w_1 \Rightarrow x_1 = (32/w_1)^2$. Double $w_1$, and $x_1$ falls to a quarter.`),
          RF(md`
            ### The fixed input's price rises: only profit moves

            Now the truck rental $w_2$ rises from \$4 to \$10 per unit of capacity. Wage and price are back at 16 and 8.

            **Move 1: does $w_2$ appear in $pMP_1 = w_1$?** No. That condition is $32/\sqrt{x_1} = 16$, exactly as before. So $x_1^* = 4$ and $q^* = 16$. **Nothing about the plan changes.**

            **Move 2: profit.** The fixed bill rises from $4 \times 4 = 16$ to $10 \times 4 = 40$:
            $$\pi^* = 8(16) - 16(4) - 40 = 128 - 64 - 40 = 24$$
            Profit fell by $48 - 24 = 24$, exactly the rise in the fixed bill, $(10 - 4) \times 4$.

            **The picture.** The slope $w_1/p = 2$ did not change, so the tangent line is **the same line**, $q = 2x_1 + 8$. It just carries a smaller profit label now: $(24 + 40)/8 = 8$ ✓. The line that would give the old profit of 48 has moved up to $q = 2x_1 + (48 + 40)/8 = 2x_1 + 11$, which never touches $f$: 48 is out of reach.

            [[fig:w2]]

            !!trap The most tested recognition point
              A change in a **fixed** cost (rent on the fixed input, a license fee, a lump-sum tax) never changes $x_1^*$ or $q^*$ in the short run. It changes profit only. If you find yourself redoing $pMP_1 = w_1$ and getting a new answer, check whether the changed price is even in that equation.
          `, { w2: { svg: w2Fig, cap: 'w₂ rises from 4 to 10: the tangent line q = 2x₁ + 8 (green) is unchanged and still touches at (4, 16), but now means π = 24. Earning 48 would need the dashed line, which f never reaches.' } }),
          Q(md`The rent on the fixed input rises. In the short run the firm's best $x_1$…`,
            ['does not change', 'falls', 'rises', 'drops to zero'], 0,
            [null, 'The rent is paid whatever $x_1$ is, so it cannot change which $x_1$ is best.', 'Nothing in $pMP_1 = w_1$ changed.', 'Only if the firm shuts down, which a fixed cost cannot cause in the short run.'],
            md`$w_2$ is not in $pMP_1 = w_1$. Profit falls by $\Delta w_2 \cdot \bar x_2$; the plan stays put.`),
          Q(md`The output price rises. Could the firm's profit **fall**?`,
            ['no: even the old plan earns more now, and the new plan is better still', 'yes: it hires more labor, which costs more', 'yes, if the isoprofit line gets flatter', 'only if the wage is above the price'], 0,
            [null, 'It hires more only because each extra hour now brings in more than it costs.', 'Flatter lines are a consequence of the higher price, not a source of loss.', 'The wage and the price are in different units; comparing them says nothing here.'],
            md`At the old plan, revenue rises and costs do not. The firm then moves to a plan it likes even more.`),
          R(md`
            ### Direction drill: which way does it move?

            Every card is a change and a question. No algebra: find what happens to $w_1/p$, then read the answer off the table above.
          `),
          P({ q: md`Pita prices fall from \$8 to \$6. The wage and the truck stay the same.`,
            plan: plan('What happens to hours hired and pitas made?', 'Both fall: $w_1/p$ rises, the line gets steeper, the tangency moves left', [
              ['Both rise: the truck must sell more to make up for the lower price', 'Making up for it is not how profit works. Each hour now brings in less ($pMP_1$ fell), so fewer hours are worth their wage.'],
              ['Hours stay the same; only profit falls', 'That is what a **fixed** cost change does. The price is in $pMP_1 = w_1$.'],
              ['Hours rise but pitas fall', 'In the short run output comes only from $x_1$: fewer hours, fewer pitas.'],
            ], '$w_1/p$: $16/8 = 2 \\to 16/6 \\approx 2.67$. Steeper: less $x_1$, less $q$, less $\\pi$.') }),
          P({ q: md`A hiring subsidy pays \$4 of each \$16 hour, so the truck's effective wage falls to \$12.`,
            plan: plan('What happens to labor and output?', 'Both rise: $w_1/p$ falls, the line gets flatter', [
              ['Nothing: the subsidy is a transfer', 'The firm’s cost of an hour fell, and that cost is in $pMP_1 = w_1$.'],
              ['Labor rises, output stays', 'More hours with the same truck make more pitas.'],
              ['Labor falls: the firm needs fewer workers when they are cheaper', 'Cheaper hours make more hours worth hiring, not fewer.'],
            ], 'DS8 numbers: $32/\\sqrt{x_1} = 12 \\Rightarrow x_1 \\approx 7.1$ hours, up from 4.') }),
          P({ q: md`The city doubles the yearly permit fee every food truck pays.`,
            plan: plan('What happens to hours, pitas and profit in the short run?', 'Hours and pitas stay the same; profit falls by the fee increase', [
              ['Hours fall to save money', 'The fee is paid whatever the hours are. It is not in $pMP_1 = w_1$.'],
              ['Everything falls', 'Only profit falls. The plan that was best before is still best.'],
              ['Pitas rise to cover the fee', 'Producing past $pMP_1 = w_1$ loses more on each extra hour. The fee is sunk either way.'],
            ], 'A fixed cost moves profit only. Same tangency, same line, lower profit label.') }),
          P({ q: md`Inflation: the pita price and the wage both double. The truck rent does not change.`,
            plan: plan('What happens to hours and pitas?', 'Nothing: $w_1/p$ is unchanged', [
              ['Both rise: the price doubled', 'The wage doubled too. Each hour brings in twice as many dollars and costs twice as many.'],
              ['Both fall: the wage doubled', 'The price doubled as well, so $w_1/p$ did not move.'],
              ['Hours rise, pitas fall', 'Hours and pitas move together in the short run.'],
            ], '$2w_1/2p = w_1/p$: same slope, same tangency. (Profit rises: revenue minus labor cost doubles while rent stays.)') }),
          P({ q: md`A graph shows the new isoprofit lines are **steeper** than before.`,
            plan: plan('Which change could have caused that?', 'A higher wage $w_1$, or a lower output price $p$', [
              ['A higher output price', 'That makes $w_1/p$ smaller: flatter lines.'],
              ['A higher rent on the fixed input', 'Rent is not in the slope $w_1/p$; it only moves the profit labels.'],
              ['A higher profit target', 'A higher $\\pi$ shifts the line up in parallel; the slope stays $w_1/p$.'],
            ], 'Slope $= w_1/p$. Steeper means $w_1$ up or $p$ down. Either way: less $x_1$, less $q$.') }),
          P({ q: md`The truck rental $w_2$ rises from \$4 to \$10. A classmate says: "Costs went up, so the truck should hire fewer hours."`,
            plan: plan('Is she right?', 'No: $x_1^*$ solves $pMP_1 = w_1$, which has no $w_2$ in it', [
              ['Yes: higher costs always mean less output', 'Only costs that change with output matter for the plan. The rental is paid whatever the hours.'],
              ['Yes, but only by a little', 'Not even a little: the condition for $x_1^*$ is identical.'],
              ['No: the truck should hire more to cover the rent', 'Hiring past $pMP_1 = w_1$ loses money on each extra hour.'],
            ], 'Same plan $(4, 16)$; profit falls from 48 to 24.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'DS8 Q1c–d: the wage doubles', q: md`$q = 8\sqrt{x_1}$ (truck fixed), $p = 8$, $w_2\bar x_2 = 16$. The wage rises from \$16 to \$32. Find the new $x_1^*$, $q^*$, $\pi^*$ and the new isoprofit line.`,
            plan: plan('What do you redo?', '$pMP_1 = w_1$ with $w_1 = 32$, then plug back', [
              ['Halve the old $x_1^* = 4$: the wage doubled', 'With a square root, $x_1^*$ moves with the square of $1/w_1$. Solve it; do not scale it.'],
              ['Keep $x_1^* = 4$ and only recompute profit', 'That is the fixed-cost case. The wage is in $pMP_1 = w_1$.'],
              ['Find a new production function', 'The technology is unchanged: $MP_1 = 4/\\sqrt{x_1}$ as before.'],
            ], '$32/\\sqrt{x_1} = 32 \\Rightarrow x_1 = 1$. Isoprofit slope $32/8 = 4$.'),
            parts: [N('x_1^*', 1), N('q^*', 8), N('\\pi^*', 16), X('\\text{isoprofit } q(x_1)', '4*x1 + 4', { x1: [0, 6] }),
              FIX('The isoprofit lines became', ['steeper', 'flatter'], 0, [null, 'The slope $w_1/p$ went from 2 to 4.'])],
            sol: md`
              **Move 1:** $8 \cdot 4/\sqrt{x_1} = 32 \Rightarrow \sqrt{x_1} = 1 \Rightarrow x_1^* = 1$.

              **Move 2:** $q^* = 8$; $\pi^* = 64 - 32 - 16 = 16$.

              **Move 3:** $q = (32/8)x_1 + (16 + 16)/8 = 4x_1 + 4$. Steeper than $q = 2x_1 + 8$: the tangency moved left and down, from $(4, 16)$ to $(1, 8)$.
            ` }),
          P({ title: 'DS8: the pita price doubles', q: md`Back to $w_1 = 16$, $w_2\bar x_2 = 16$, $q = 8\sqrt{x_1}$. Now pitas sell for $p = 16$.`,
            plan: plan('Before computing: which way will $x_1^*$ move?', 'Up: $w_1/p$ falls from 2 to 1, so the line is flatter', [
              ['Down: a higher price means fewer customers', 'A price taker sells all it wants at the market price. Its demand is flat.'],
              ['No change: only profit moves', 'That is the fixed-cost case. The price is in $pMP_1 = w_1$.'],
              ['Up by exactly double', 'With a square root, $x_1^* = (4p/w_1)^2$: it moves with the square.'],
            ], '$16 \\cdot 4/\\sqrt{x_1} = 16 \\Rightarrow \\sqrt{x_1} = 4 \\Rightarrow x_1 = 16$.'),
            parts: [N('x_1^*', 16), N('q^*', 32), N('\\pi^*', 240), X('\\text{isoprofit } q(x_1)', 'x1 + 16', { x1: [0, 20] })],
            sol: md`
              **Move 1:** $pMP_1 = w_1$: $16 \cdot \dfrac{4}{\sqrt{x_1}} = 16 \Rightarrow \dfrac{64}{\sqrt{x_1}} = 16 \Rightarrow \sqrt{x_1} = 4 \Rightarrow x_1^* = 16$.

              **Move 2:** $q^* = 8 \times 4 = 32$. $\pi^* = 16(32) - 16(16) - 16 = 512 - 256 - 16 = 240$.

              **Move 3:** isoprofit slope $16/16 = 1$; intercept $(240 + 16)/16 = 16$: $q = x_1 + 16$. Check: $16 + 16 = 32$ ✓.
            ` }),
          P({ title: 'DS8: the truck rent rises', q: md`$q = 8\sqrt{x_1}$, $\bar x_2 = 4$, $p = 8$, $w_1 = 16$. The rent per unit of capacity rises from $w_2 = 4$ to $w_2 = 10$.`,
            plan: plan('What changes?', 'Only profit: $w_2$ is not in $pMP_1 = w_1$', [
              ['$x_1^*$ falls because costs rose', 'The rent is paid whatever $x_1$ is. The input rule is unchanged.'],
              ['The isoprofit slope rises', 'The slope is $w_1/p$, and neither of those moved.'],
              ['Everything: redo the whole problem', 'You can, but you will get the same $x_1^*$ and $q^*$. Only the fixed bill changed.'],
            ], '$x_1^* = 4$, $q^* = 16$ as before. Fixed bill $10 \\times 4 = 40$.'),
            parts: [N('x_1^*', 4), N('q^*', 16), N('\\pi^*', 24), N('\\text{intercept of the tangent line}', 8), N('\\text{intercept of the }\\pi = 48\\text{ line}', 11)],
            sol: md`
              **Move 1:** the plan is unchanged: $x_1^* = 4$, $q^* = 16$.

              **Move 2:** $\pi^* = 128 - 64 - 40 = 24$, down by $(10 - 4)(4) = 24$.

              **Move 3:** tangent line intercept $(24 + 40)/8 = 8$: the same line $q = 2x_1 + 8$ as before. The line for $\pi = 48$ is now $(48 + 40)/8 = 11$ high, above $f$ everywhere: no longer reachable.
            ` }),
          P({ title: 'Lecture 14: the price rises by half', q: md`A firm's short-run production function is $q = \sqrt{2x_1}$. At first $w_1 = 1$ and $p = 2$. Then the price rises to $p = 3$. Find the plan before and after.`,
            plan: plan('How do you find each tangency?', 'Set $MP_1 = w_1/p$ each time, with $MP_1 = 1/\\sqrt{2x_1}$', [
              ['Set $MP_1 = p/w_1$', 'Upside down: the isoprofit slope is $w_1/p$.'],
              ['Find the first plan, then scale it by $3/2$', 'The tangency is not proportional to the price. Solve the condition again.'],
              ['Set $\\sqrt{2x_1} = p$', 'That sets output equal to the price, which no condition says.'],
            ], 'Before: $1/\\sqrt{2x_1} = 1/2$. After: $1/\\sqrt{2x_1} = 1/3$.'),
            parts: [N('x_1\\text{ before}', 2), N('q\\text{ before}', 2), N('x_1\\text{ after}', 4.5), N('q\\text{ after}', 3)],
            sol: md`
              **Move 1: $MP_1$.** $q = (2x_1)^{1/2}$, so $MP_1 = \tfrac12(2x_1)^{-1/2}\cdot 2 = 1/\sqrt{2x_1}$.

              **Move 2: before** ($w_1/p = 1/2$): $\sqrt{2x_1} = 2 \Rightarrow x_1 = 2$, $q = 2$.

              **Move 3: after** ($w_1/p = 1/3$): $\sqrt{2x_1} = 3 \Rightarrow x_1 = 4.5$, $q = 3$.

              Flatter line, tangency to the right: $(2, 2) \to (4.5, 3)$, as on the lecture slide.
            ` }),
          P({ title: 'Stretch: a bigger truck', q: md`DS8 again ($q = 4\sqrt{x_1x_2}$, $p = 8$, $w_1 = 16$, $w_2 = 4$), but the owner now has a bigger truck: $\bar x_2 = 9$ instead of 4.`,
            plan: plan('What is different this time?', 'The production function itself: with $\\bar x_2 = 9$, $q = 12\\sqrt{x_1}$ and every hour is more productive', [
              ['Only the fixed cost: $x_1^*$ stays 4', 'The amount of the fixed input is inside $f$. A bigger truck raises $MP_1$, so more hours are worth hiring.'],
              ['Only the isoprofit slope', 'Prices did not change: the slope is still $16/8 = 2$. The **curve** moved.'],
              ['Nothing: the truck is a fixed input', 'Fixed means the firm cannot change it this period, not that its size does not matter.'],
            ], '$q = 4\\sqrt{9x_1} = 12\\sqrt{x_1}$, $MP_1 = 6/\\sqrt{x_1}$. Then $pMP_1 = w_1$.'),
            parts: [N('x_1^*', 9), N('q^*', 36), N('\\pi^*', 108)],
            sol: md`
              **Move 1:** $q = 4\sqrt{9}\sqrt{x_1} = 12\sqrt{x_1}$, so $MP_1 = 6/\sqrt{x_1}$.

              **Move 2:** $8 \cdot 6/\sqrt{x_1} = 16 \Rightarrow 48/\sqrt{x_1} = 16 \Rightarrow \sqrt{x_1} = 3 \Rightarrow x_1^* = 9$.

              **Move 3:** $q^* = 36$; $\pi^* = 8(36) - 16(9) - 4(9) = 288 - 144 - 36 = 108$.

              Contrast with a rent increase: changing the **price** of the fixed input leaves the plan alone; changing its **amount** changes the technology, and the plan moves.
            ` }),
          G('m3_pr_cs', { need: 3 }),
          G('m3_pr_dir', { need: 4 }),
        ],
      },
      // ================================================================ lesson 4
      {
        id: 'm3-pr4', title: 'Long run: both inputs vary; profit max implies cost min; returns to scale', ref: 'Lecture 14',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… | The move |
            |---|---|---|
            | "in the long run the firm can vary both inputs" | no fixed input, no fixed cost | two conditions: $pMP_1 = w_1$ and $pMP_2 = w_2$ |
            | "show that a profit-maximizing firm minimizes cost" | divide the two conditions | $MP_1/MP_2 = w_1/w_2$: the Mini Exam 2 tangency |
            | "the technology has increasing returns to scale: does a profit maximum exist?" | what scaling up does to profit | no finite optimum: profit grows with scale |
            | "constant returns; compare $P$ with $LRAC$" | the sign of profit per unit | $P > LRAC$: no finite optimum; $P = LRAC$: zero profit at any size; $P < LRAC$: produce nothing |
            | "decreasing returns; find the long-run plan" | the one optimal scale | solve both $pMP = w$ conditions |

            The first question on any long-run problem: **what are the returns to scale?** That decides whether there is anything to solve.
          `),
          R(md`
            ### The long run: nothing is fixed

            The truck's lease is up. Now you choose how much truck capacity to rent, $x_2$, as well as how many hours to hire, $x_1$. With no input stuck, there is **no fixed cost**:
            $$\pi(x_1, x_2) = p\,f(x_1, x_2) - w_1x_1 - w_2x_2$$

            Two choices, so two "one more unit" questions:

            - One more hour: brings in $p \cdot MP_1$, costs $w_1$.
            - One more unit of capacity: brings in $p \cdot MP_2$, costs $w_2$.

            Keep adding each input until its value of marginal product equals its price. With calculus, set each partial derivative of profit to zero:
            $$\frac{\partial \pi}{\partial x_1} = p \cdot MP_1 - w_1 = 0, \qquad \frac{\partial \pi}{\partial x_2} = p \cdot MP_2 - w_2 = 0$$
            So:
            $$p \cdot MP_1 = w_1 \qquad\text{and}\qquad p \cdot MP_2 = w_2$$

            It is the short-run rule, applied to **both** inputs. Each is still "marginal revenue = marginal cost", one input at a time.
          `),
          RF(md`
            ### Profit maximization implies cost minimization

            Divide the first condition by the second:
            $$\frac{p \cdot MP_1}{p \cdot MP_2} = \frac{w_1}{w_2}$$
            The $p$'s cancel:
            $$\frac{MP_1}{MP_2} = \frac{w_1}{w_2}$$

            That is exactly the **cost-minimizing condition** from Mini Exam 2 ([the tangency rule](#/l/l13)): the isoquant's slope, $MP_1/MP_2$ (the technical rate of substitution), equals the isocost line's slope, $w_1/w_2$.

            **Why it has to be true.** Suppose the profit-maximizing firm made its output $q^*$ in a way that was not the cheapest. Then it could make the same $q^*$ more cheaply, sell it for the same revenue, and earn more. That contradicts "maximum profit". So the profit-maximizing plan **must** be the cheapest way to make $q^*$.

            [[fig:cm]]

            !!key The division of labor between the two conditions
              $\dfrac{MP_1}{MP_2} = \dfrac{w_1}{w_2}$ picks the **mix** of inputs (the cheapest way to make any amount).

              One $p \cdot MP = w$ condition then picks the **scale** (how much to make).

              Cost minimization alone cannot tell you how much to produce; it has no price of output in it. Profit maximization does both.
          `, { cm: { svg: costMinFig, cap: 'Worked example below: the profit-maximizing bundle (25, 25) is where the q = 5 isoquant (red) is tangent to the 100-dollar isocost line (green). Profit max lands on a cost-min tangency.' } }),
          Q(md`Dividing $pMP_1 = w_1$ by $pMP_2 = w_2$ gives…`,
            ['$MP_1/MP_2 = w_1/w_2$, the cost-minimizing tangency', '$MP_1 = MP_2$', '$p = w_1/w_2$', '$MP_1/MP_2 = w_2/w_1$'], 0,
            [null, 'Only if $w_1 = w_2$.', 'The $p$ cancels; it does not survive the division.', 'Flipped: $w_1$ goes with $MP_1$.'],
            md`The output price cancels, leaving the Mini Exam 2 condition: the profit-maximizing bundle is a least-cost bundle.`),
          Q(md`A long-run firm is producing its profit-maximizing output. Could it make that same output more cheaply?`,
            ['no: if it could, it would earn more, so it was not maximizing profit', 'yes: profit max and cost min are different problems', 'only if returns to scale are constant', 'yes, by cutting output'], 0,
            [null, 'They are different problems, but the profit-max answer must solve the cost-min problem for its own output.', 'This holds whatever the returns to scale.', 'Cutting output changes the output; the question is about the same output.'],
            md`Profit max $\Rightarrow$ cost min. The reverse is not true: cost min works for any output, including unprofitable ones.`),
          RF(md`
            ### Worked example: decreasing returns, one optimal scale

            $q = x_1^{1/4}x_2^{1/4}$, $p = 40$, $w_1 = w_2 = 2$. Find the long-run plan.

            **Move 1: the two marginal products** (power rule, one variable at a time):
            $$MP_1 = \tfrac14 x_1^{-3/4}x_2^{1/4}, \qquad MP_2 = \tfrac14 x_1^{1/4}x_2^{-3/4}$$

            **Move 2: divide to get the mix.** The $\tfrac14$'s cancel. Subtract exponents: $x_1^{-3/4 - 1/4} = x_1^{-1}$ and $x_2^{1/4 - (-3/4)} = x_2^{1}$:
            $$\frac{MP_1}{MP_2} = \frac{x_2}{x_1} = \frac{w_1}{w_2} = \frac22 = 1 \;\Rightarrow\; x_2 = x_1$$

            **Move 3: put the mix into one condition.** With $x_2 = x_1$, $MP_1 = \tfrac14 x_1^{-3/4}x_1^{1/4} = \tfrac14 x_1^{-1/2}$. Then $pMP_1 = w_1$:
            $$40 \cdot \frac{1}{4\sqrt{x_1}} = 2 \;\Rightarrow\; \frac{10}{\sqrt{x_1}} = 2 \;\Rightarrow\; \sqrt{x_1} = 5 \;\Rightarrow\; x_1^* = 25 = x_2^*$$

            **Move 4: output and profit.**
            $$q^* = 25^{1/4} \cdot 25^{1/4} = 25^{1/2} = 5, \qquad \pi^* = 40(5) - 2(25) - 2(25) = 200 - 100 = 100$$

            **Move 5: is it really a maximum?** Try other scales with the same mix:

            | $x_1 = x_2$ | $q$ | cost | $\pi$ |
            |---|---|---|---|
            | 12.5 (half) | 3.54 | 50 | 91.4 |
            | **25** | **5** | **100** | **100** |
            | 50 (double) | 7.07 | 200 | 82.8 |

            Doubling the inputs doubles cost but raises output only by $\sqrt2 \approx 1.41$ times. That is **decreasing returns** ($1/4 + 1/4 = 1/2 < 1$), and it is why there is one best size.

            [[fig:drs]]

            !!intuition Does this make sense?
              Average cost here is $100/5 = 20$, below the price of 40, so profit is positive. In a market, positive profit attracts entry and pushes the price down ([Part 9](#/l/m3-lr1)).
          `, { drs: { svg: drsFig, cap: 'Decreasing returns: f bends down. The highest isoprofit line touches it once: one optimal scale.' } }),
          RF(md`
            ### Returns to scale decide whether a maximum exists

            Recall [returns to scale](#/l/l12): multiply **every** input by $k > 1$. For Cobb–Douglas $Ax_1^ax_2^b$, add the exponents: $a + b < 1$ decreasing, $= 1$ constant, $> 1$ increasing.

            Now look at profit. Scaling every input by $k$ multiplies **cost** by exactly $k$ (you buy $k$ times as much of each input at the same prices). What happens to **revenue** depends on returns to scale.

            **Decreasing returns.** Revenue rises by less than $k$. Growing eventually adds more cost than revenue. One optimal scale: solve the two conditions (figure above).

            **Increasing returns.** Revenue rises by more than $k$. Once some size breaks even, doubling it more than doubles profit, and doubling again does it again. Profit rises without limit: **no finite optimum**. The point where the conditions hold is a profit **minimum** here.

            [[fig:irs]]

            **Constant returns.** Revenue rises by exactly $k$, so profit is multiplied by $k$, whatever its sign. Long-run average cost is a constant, $LRAC$, and every unit earns $P - LRAC$:

            - $P > LRAC$: every unit earns a margin; bigger is always better. **No finite optimum.**
            - $P = LRAC$: **zero profit at every scale**; the firm's size is not pinned down.
            - $P < LRAC$: every unit loses money. **Produce nothing.**

            [[fig:crs]]

            !!key Returns to scale and the long-run profit maximum
              | Returns to scale | Exponent sum | Long-run profit maximum |
              |---|---|---|
              | decreasing | $< 1$ | one optimal scale: solve $pMP_1 = w_1$, $pMP_2 = w_2$ |
              | increasing | $> 1$ | no finite optimum: profit rises with scale |
              | constant, $P > LRAC$ | $= 1$ | no finite optimum |
              | constant, $P = LRAC$ | $= 1$ | zero profit at any scale |
              | constant, $P < LRAC$ | $= 1$ | produce nothing |

            !!trap Diminishing marginal product is not decreasing returns
              $q = x_1^{0.6}x_2^{0.6}$: each input alone has diminishing $MP$ (exponent below 1), yet doubling **both** multiplies output by $2^{1.2} \approx 2.3$: increasing returns. Returns to scale is about all inputs together; add the exponents.

            Increasing returns are why a single big firm can beat many small ones: see [natural monopoly](#/l/m3-rg1).
          `, {
            irs: { svg: irsFig, cap: 'Increasing returns: f bends up. Moving to a bigger scale always reaches a higher isoprofit line.' },
            crs: { svg: crsFig, cap: 'Constant returns with P above LRAC: f is a ray, and every step out reaches a higher isoprofit line.' },
          }),
          Q(md`A long-run firm has $q = x_1^{0.6}x_2^{0.6}$ and sells at a positive price. Its long-run profit maximum…`,
            ['does not exist: profit keeps rising with scale', 'is at one finite scale, where $pMP_1 = w_1$ and $pMP_2 = w_2$', 'is zero output', 'is where $MP_1 = MP_2$'], 0,
            [null, 'With increasing returns those conditions find the profit minimum along the scale.', 'Bigger scales are profitable once any scale breaks even.', 'That is a mix condition (with equal prices), not a profit maximum.'],
            md`$0.6 + 0.6 = 1.2 > 1$: increasing returns. Doubling inputs doubles cost but multiplies output by $2^{1.2} \approx 2.3$.`),
          Q(md`Constant returns, $LRAC = \$5$, and the market price is \$4. The firm…`,
            ['produces nothing', 'produces an infinite amount', 'earns zero profit at any scale', 'produces where $P = MC$ at one finite scale'], 0,
            [null, 'That needs $P > LRAC$.', 'That needs $P = LRAC$.', 'With constant returns $MC = LRAC = 5$ at every output, so $P = MC$ never holds at 4.'],
            md`Each unit loses \$1, and doubling the size doubles the loss. Best is zero output.`),
          Q(md`Constant returns, $LRAC = \$5$, and the market price is \$5. The firm…`,
            ['earns zero profit at every scale', 'produces nothing', 'grows without limit', 'has one best scale'], 0,
            [null, 'Producing nothing gives zero too, but so does every other size: the firm is indifferent.', 'There is no margin to grow on: profit is zero per unit.', 'With constant returns no size is better than another here.'],
            md`$P - LRAC = 0$ on every unit. Size is not pinned down; in a market, it is set by demand and the number of firms.`),
          Q(md`Which production function has **decreasing** returns to scale?`,
            ['$q = x_1^{0.3}x_2^{0.5}$', '$q = x_1^{0.5}x_2^{0.5}$', '$q = x_1^{0.6}x_2^{0.6}$', '$q = 10x_1^{0.3}x_2^{0.7}$'], 0,
            [null, 'Sum 1: constant.', 'Sum 1.2: increasing.', 'Sum 1: constant (the 10 in front never matters).'],
            md`$0.3 + 0.5 = 0.8 < 1$. Doubling inputs multiplies output by $2^{0.8} \approx 1.74$.`),
          R(md`
            ### Spot it: no numbers needed
          `),
          P({ q: md`Long run: $q = x_1^{1/3}x_2^{1/3}$ with given $p$, $w_1$, $w_2$. A classmate keeps $x_2$ at last year's level and solves $pMP_1 = w_1$.`,
            plan: plan('What is wrong?', 'In the long run $x_2$ is a choice too: use both $pMP_1 = w_1$ and $pMP_2 = w_2$', [
              ['Nothing: that is the input rule', 'It is the **short-run** rule. With nothing fixed, holding $x_2$ at an old level leaves profit on the table.'],
              ['She should use $P = MC$ instead', 'That works only once you have a cost function. With a production function and input prices, use the input rules.'],
              ['She should set $MP_1 = MP_2$', 'That is the mix only when $w_1 = w_2$, and it still does not set the scale.'],
            ], 'Two conditions. Divide for the mix, then one of them for the scale. (Exponents add to $2/3 < 1$, so a finite answer exists.)') }),
          P({ q: md`The exam asks: "Show that the long-run profit-maximizing bundle minimizes cost."`,
            plan: plan('What do you write?', 'Divide $pMP_1 = w_1$ by $pMP_2 = w_2$: the $p$ cancels, leaving $MP_1/MP_2 = w_1/w_2$', [
              ['Set $p = MC$ and $p = AC$', 'Those are output conditions. The question is about the input bundle.'],
              ['Show that profit is positive', 'Positive profit says nothing about whether the inputs were the cheapest mix.'],
              ['Set $MP_1 = w_1$ and $MP_2 = w_2$', 'Missing the price; and you still have to divide them to reach the cost-min condition.'],
            ], 'Then say: that is the isoquant–isocost tangency, the cost-minimizing condition. If the bundle were not cheapest, the same output could be made for less and profit would rise.') }),
          P({ q: md`$q = x_1^{0.6}x_2^{0.6}$, competitive price \$10, $w_1 = w_2 = 1$. Find the long-run profit-maximizing bundle.`,
            plan: plan('What is your first move?', 'Check returns to scale: $1.2 > 1$, increasing, so there is no finite maximum', [
              ['Solve $pMP_1 = w_1$, $pMP_2 = w_2$', 'With increasing returns those find a profit minimum along the scale, not a maximum.'],
              ['Set $P = \\min LRAC$', 'That is the long-run market price under free entry; it is not one firm’s input choice.'],
              ['Divide the two conditions and stop', 'That gives the mix, not the size. And here no size is best.'],
            ], 'Answer: no finite optimum. Profit rises without limit as the firm grows.') }),
          P({ q: md`$q = 2\sqrt{x_1x_2}$; the firm's long-run average cost is constant at \$6. The market price is \$8.`,
            plan: plan('What does the firm want in the long run?', 'To grow without limit: constant returns and $P > LRAC$', [
              ['One optimal scale where $P = MC$', 'With constant returns $MC = LRAC = 6$ at every output, so $P = 8 = MC$ never happens.'],
              ['Zero profit at any scale', 'That needs $P = LRAC$.'],
              ['Produce nothing', 'That needs $P < LRAC$.'],
            ], 'Each unit earns $8 - 6 = 2$, and constant returns let it repeat that forever. In a market, this attracts entry until $P = 6$.') }),
          P({ q: md`Decreasing returns: $q = x_1^{1/2}x_2^{1/4}$ with given prices. You need $x_1^*$ and $x_2^*$.`,
            plan: plan('What is the fastest route?', 'Divide the two conditions to get $x_2$ in terms of $x_1$, then put that into one $pMP = w$', [
              ['Solve each condition for its own input separately', 'Each condition contains both inputs. Divide first to link them.'],
              ['Set $MP_1 = MP_2$', 'The right ratio is $MP_1/MP_2 = w_1/w_2$, which is 1 only when the input prices are equal.'],
              ['Use $P = \\min LRAC$', 'That is a market condition, not this firm’s input choice.'],
            ], '$MP_1/MP_2 = 2x_2/x_1 = w_1/w_2$, so $x_2 = \\dfrac{w_1}{2w_2}x_1$. Substitute into $pMP_1 = w_1$.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'Different exponents, different prices', q: md`Long run: $q = x_1^{1/2}x_2^{1/4}$, $p = 16$, $w_1 = 4$, $w_2 = 2$.`,
            plan: [PLAN_LR,
              plan('Dividing gives $\\dfrac{2x_2}{x_1} = \\dfrac{4}{2}$. What is the mix?', '$x_2 = x_1$', [
                ['$x_2 = 2x_1$', 'Solve carefully: $2x_2/x_1 = 2 \\Rightarrow x_2 = x_1$.'],
                ['$x_2 = 4x_1$', 'That ignores the 2 from the exponents.'],
                ['$x_1 = 2$', 'The ratio gives a relation between the inputs, not a level.'],
              ], 'Then $q = x_1^{3/4}$ and $MP_1 = \\tfrac12 x_1^{-1/4}$.')],
            parts: [N('x_1^*', 16), N('x_2^*', 16), N('q^*', 8), N('\\pi^*', 32)],
            sol: md`
              **Move 1:** $MP_1 = \tfrac12 x_1^{-1/2}x_2^{1/4}$, $MP_2 = \tfrac14 x_1^{1/2}x_2^{-3/4}$.

              **Move 2: mix.** $\dfrac{MP_1}{MP_2} = \dfrac{\tfrac12}{\tfrac14}\, x_1^{-1}x_2^{1} = \dfrac{2x_2}{x_1} = \dfrac{4}{2} = 2 \Rightarrow x_2 = x_1$.

              **Move 3: scale.** With $x_2 = x_1$: $MP_1 = \tfrac12 x_1^{-1/2}x_1^{1/4} = \tfrac12 x_1^{-1/4}$. $16 \cdot \tfrac12 x_1^{-1/4} = 4 \Rightarrow x_1^{1/4} = 2 \Rightarrow x_1^* = 16 = x_2^*$.

              **Move 4:** $q^* = 16^{1/2} \cdot 16^{1/4} = 4 \cdot 2 = 8$. $\pi^* = 16(8) - 4(16) - 2(16) = 128 - 64 - 32 = 32$.

              Check $pMP_2 = 16 \cdot \tfrac14 (4)(16^{-3/4}) = 16 \cdot \tfrac14 \cdot 4 \cdot \tfrac18 = 2 = w_2$ ✓. Returns: $3/4 < 1$, decreasing, so this is the one optimum.
            ` }),
          P({ title: 'A scaled-up technology', q: md`Long run: $q = 10x_1^{1/4}x_2^{1/4}$, $p = 8$, $w_1 = w_2 = 4$.`,
            plan: PLAN_LR,
            parts: [N('x_1^*', 25), N('x_2^*', 25), N('q^*', 50), N('\\pi^*', 200)],
            sol: md`
              **Move 1: mix.** $MP_1/MP_2 = x_2/x_1 = 4/4 \Rightarrow x_2 = x_1$.

              **Move 2: scale.** With $x_2 = x_1$, $MP_1 = 10 \cdot \tfrac14 x_1^{-1/2} = 2.5/\sqrt{x_1}$. $8 \cdot 2.5/\sqrt{x_1} = 4 \Rightarrow 20/\sqrt{x_1} = 4 \Rightarrow \sqrt{x_1} = 5 \Rightarrow x_1^* = x_2^* = 25$.

              **Move 3:** $q^* = 10\sqrt{25} = 50$. $\pi^* = 8(50) - 4(25) - 4(25) = 400 - 200 = 200$.
            ` }),
          P({ title: 'DS8’s truck in the long run', q: md`The DS8 technology is $q = 4\sqrt{x_1x_2}$, with $p = 8$, $w_1 = 16$, $w_2 = 4$. In the short run (truck fixed at 4) the best plan was $x_1 = 4$, $q = 16$, $\pi = 48$. Now the truck size can change too.`,
            plan: [
              plan('What do you check first?', 'Returns to scale: $1/2 + 1/2 = 1$, constant', [
                ['Solve $pMP_1 = w_1$ and $pMP_2 = w_2$', 'With constant returns there is no single best size to solve for. Compare $P$ with $LRAC$ instead.'],
                ['Redo the short-run problem with a bigger truck', 'That still holds one input fixed.'],
                ['Nothing changes in the long run', 'The truck size is now a choice, and the short-run truck was not the cheapest mix.'],
              ], 'Constant returns: find $LRAC$ from the cheapest mix, then compare with $P = 8$.'),
              plan('How do you get $LRAC$?', 'Cost-minimizing mix from $MP_1/MP_2 = w_1/w_2$, then cost per unit', [
                ['Divide the short-run cost 80 by 16', 'The short-run truck (4 units) is not the cheapest mix for 16 pitas, so that overstates long-run cost.'],
                ['$LRAC = w_1 + w_2 = 20$', 'Cost per unit depends on how many units of each input one unit of output needs.'],
                ['Set $LRAC = P$', 'That is the market outcome after entry, not this firm’s cost.'],
              ], '$x_2/x_1 = 16/4 \\Rightarrow x_2 = 4x_1$; then $q = 4\\sqrt{4x_1^2} = 8x_1$.'),
            ],
            parts: [FIX('Returns to scale', ['decreasing', 'constant', 'increasing'], 1, ['The exponents add to exactly 1.', null, 'The exponents add to exactly 1.']),
              N('x_2/x_1\\text{ (cheapest mix)}', 4), N('LRAC', 4), N('\\text{cheapest cost of }q = 16', 64),
              FIX('In the long run the firm…', ['wants to grow without limit', 'stays at q = 16', 'produces nothing'], 0, [null, 'At $P = 8 > LRAC = 4$ every pita earns 4, and constant returns let it repeat that at any size.', 'That needs $P < LRAC$.'])],
            sol: md`
              **Move 1: returns.** $q = 4x_1^{1/2}x_2^{1/2}$: $1/2 + 1/2 = 1$, constant.

              **Move 2: cheapest mix.** $MP_1/MP_2 = x_2/x_1 = w_1/w_2 = 16/4 = 4$, so $x_2 = 4x_1$. Then $q = 4\sqrt{x_1 \cdot 4x_1} = 4 \cdot 2x_1 = 8x_1$, so $x_1 = q/8$ and $x_2 = q/2$.

              **Move 3: cost.** $C = 16(q/8) + 4(q/2) = 2q + 2q = 4q$, so $LRAC = 4$. Making 16 pitas the cheap way ($x_1 = 2$, $x_2 = 8$) costs 64, less than the short-run 80, which used too small a truck.

              **Move 4: compare.** $P = 8 > LRAC = 4$: every pita earns 4, at any scale. Constant returns: no finite optimum. In a real market, entry would push the price down to 4 ([Part 9](#/l/m3-lr2)).
            ` }),
          P({ title: 'Increasing returns in numbers', q: md`Long run: $q = x_1x_2$, $p = 1$, $w_1 = w_2 = 10$. The firm keeps $x_1 = x_2 = x$ (the cheapest mix at equal prices). Find profit at $x = 10$, $20$ and $40$.`,
            plan: plan('What is profit as a function of $x$?', '$\\pi = x^2 - 20x$', [
              ['$\\pi = x^2 - 10x$', 'Both inputs cost 10 each: $10x + 10x = 20x$.'],
              ['$\\pi = 2x - 20x$', 'Output is $x \\cdot x = x^2$, not $2x$.'],
              ['$\\pi = x - 20x$', 'Output is $x_1x_2 = x^2$.'],
            ], 'Revenue $1 \\cdot x^2$, cost $20x$. Plug in each $x$.'),
            parts: [N('\\pi(10)', -100), N('\\pi(20)', 0), N('\\pi(40)', 800),
              FIX('The long-run profit maximum is…', ['not finite: profit keeps rising with scale', 'at x = 10', 'at x = 20'], 0, [null, 'At $x = 10$, $d\\pi/dx = 2x - 20 = 0$: that is the profit **minimum**.', 'That is only the break-even point; beyond it profit keeps climbing.'])],
            sol: md`
              **Move 1:** $q = x^2$, cost $= 20x$, so $\pi = x^2 - 20x$.

              **Move 2:** $\pi(10) = 100 - 200 = -100$; $\pi(20) = 400 - 400 = 0$; $\pi(40) = 1600 - 800 = 800$.

              **Move 3:** doubling inputs from 20 to 40 doubles cost but quadruples output: increasing returns ($1 + 1 = 2 > 1$). Profit keeps rising: no finite optimum. Setting $d\pi/dx = 0$ gives $x = 10$, the **worst** scale.
            ` }),
          P({ title: 'Constant returns at three prices', q: md`Long run: $q = \sqrt{x_1x_2}$, $w_1 = w_2 = 3$.`,
            plan: plan('How do you find $LRAC$?', 'Cheapest mix $x_1 = x_2$, so $q = x_1$ and cost $= 3q + 3q = 6q$', [
              ['$LRAC = w_1 = 3$', 'Each unit of output needs one unit of **each** input here: $3 + 3$.'],
              ['Solve $pMP_1 = w_1$ and $pMP_2 = w_2$', 'With constant returns those do not pin down one size. Find cost per unit instead.'],
              ['$LRAC = \\sqrt{3 \\cdot 3} = 3$', 'Costs add; they do not combine like the production function.'],
            ], '$LRAC = 6$. Then compare each price with 6.'),
            parts: [N('LRAC', 6), N('\\pi\\text{ at }q = 100\\text{ if }P = 8', 200),
              FIX('At P = 8 the firm…', ['grows without limit', 'produces nothing', 'earns zero at any size'], 0, [null, '8 > 6: each unit earns 2.', '8 ≠ 6.']),
              FIX('At P = 6 the firm…', ['earns zero at any size', 'grows without limit', 'produces nothing'], 0, [null, 'No margin per unit: 6 − 6 = 0.', 'Producing nothing also gives zero, but so does every size.']),
              FIX('At P = 4 the firm…', ['produces nothing', 'earns zero at any size', 'grows without limit'], 0, [null, 'Every unit loses 2.', 'Every unit loses 2; growing makes it worse.'])],
            sol: md`
              **Move 1: mix.** $MP_1/MP_2 = x_2/x_1 = 3/3$, so $x_1 = x_2$. Then $q = \sqrt{x_1^2} = x_1$.

              **Move 2: cost.** $C = 3q + 3q = 6q$, so $LRAC = 6$ at every output (constant returns: a flat LRAC).

              **Move 3: compare.** $P = 8$: profit $= (8 - 6)q$; at $q = 100$, $\pi = 200$; at $q = 200$, 400: no finite optimum. $P = 6$: zero at every size. $P = 4$: $-2q$, so $q = 0$.
            ` }),
          G('m3_pr_lr', { need: 3 }),
          G('m3_pr_rts', { need: 4 }),
          R(md`
            ### Which tool when: the whole Part on one page

            | The problem gives you… | and asks for… | Your first equation |
            |---|---|---|
            | revenue and a list of costs, some "forgone" | accounting or economic profit | accounting = revenue − explicit; economic = accounting − implicit |
            | a production function with one input **fixed**, $p$ and $w_1$ | how much of the variable input | $p \cdot MP_1 = w_1$ |
            | the same, and asks for the isoprofit line | slope and intercept | $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$ |
            | a cost function $C(q)$ and a price | how much output | $P = MC$ (Part 8) |
            | both inputs variable, $p$, $w_1$, $w_2$ | the long-run plan | $pMP_1 = w_1$ **and** $pMP_2 = w_2$ |
            | only "which mix is cheapest" | the input ratio | $MP_1/MP_2 = w_1/w_2$ |
            | exponents that add to 1 or more | whether a finite optimum exists | returns to scale, then compare $P$ with $LRAC$ |

            !!key Inputs versus output: the same idea twice
              $p \cdot MP_1 = w_1$ says "hire until the last worker's output is worth her wage." $P = MC$ says "produce until the last unit's price equals its cost." Both compare a marginal benefit with a marginal cost; one is measured per worker, the other per unit of output.

            !!trap Short run or long run?
              Look for the word **fixed** or a bar over a variable ($\bar x_2$). If one input is fixed, it is the short run: one first-order condition, and the fixed input's cost is a fixed cost. If nothing is fixed, it is the long run: two conditions, no fixed cost.
          `),
          P({ title: 'Spot it: which condition?', q: md`A farm uses labor $L$ and land $T$. Land is fixed at 50 acres this season. Corn sells for \$4 a bushel and labor costs \$12 an hour. How many hours of labor should the farm hire?`,
            plan: plan('What is the first equation?', '$4 \\cdot MP_L = 12$', [
              ['$4 \\cdot MP_L = 12$ and $4 \\cdot MP_T = r$', 'Land is fixed this season, so there is no land decision to optimize: one condition only.'],
              ['$MP_L/MP_T = 12/r$', 'That is the long-run cheapest-mix rule. With land fixed, the mix is not a choice.'],
              ['$P = MC$', 'You are choosing an input, not output, and there is no cost function given. Use the value of the marginal product.'],
            ], 'Short run (land fixed): hire labor until $p \\cdot MP_L = w$, then $q$ from the production function.') }),
          P({ title: 'Spot it: short or long run?', q: md`$q = 6x_1^{1/3}x_2^{1/3}$, $p = 3$, $w_1 = 2$, $w_2 = 2$. Both inputs can be changed. Find the profit-maximizing plan.`,
            plan: plan('What do you solve?', '$pMP_1 = w_1$ and $pMP_2 = w_2$ together', [
              ['$pMP_1 = w_1$ only', 'Both inputs are variable, so both get a condition.'],
              ['Nothing: there is no finite optimum', 'The exponents add to $2/3 < 1$ (decreasing returns), so there is one best scale.'],
              ['$MP_1/MP_2 = w_1/w_2$ only', 'That gives the cheapest mix but not the scale. You need both conditions to pin down the size.'],
            ], 'Decreasing returns, long run: two conditions. Symmetric prices and exponents give $x_1 = x_2$, then one equation in one unknown.') }),
        ],
      },
    ],
  });
})();

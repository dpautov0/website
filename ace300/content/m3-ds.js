/* Mini Exam 3 · discussion sections DS8–DS10 rebuilt as plan-first problems with full worked solutions, plus a set of
   fresh homework-style problems for Lectures 14–19. Every card asks how to attack the question before any number. */
(function () {
  'use strict';
  const { R, P, G } = C;
  const { N, X, FIX, plan, gen, F, pick, ri } = M3;

  // ------------------------------------------------------------------ DS8 figures
  // Q1: q = 8 sqrt(x1); isoprofit q = 2x1 + 8 touches at (4, 16); q = 4x1 + 4 touches at (1, 8)
  const isoFig = EC.graph({
    w: 330, h: 270, x: [0, 8.6], y: [0, 26], xl: 'x_1', yl: 'q', xt: [1, 4, 8], yt: [4, 8, 16, 24],
    items: [
      { f: (x) => 8 * Math.sqrt(x), from: 0, to: 8, lab: 'q = 8\\sqrt{x_1}', labX: 8, dx: -2, dy: 14, anchor: 'tr' },
      { seg: [[0, 8], [8, 24]], cls: 'curve c4', lab: 'q = 2x_1 + 8', at: 0.97, dx: -6, dy: -4, anchor: 'br' },
      { seg: [[0, 4], [5.5, 26]], cls: 'curve c2', lab: 'q = 4x_1 + 4', at: 0.93, dx: -6, dy: 0, anchor: 'r' },
      { pt: [4, 16], lab: '(4,\\,16)', at: 'br', guide: true },
      { pt: [1, 8], lab: '(1,\\,8)', at: 'br', guide: true },
    ],
  });
  // Q2: Dent at P = 40: q = 10, AC(10) = 30
  const dentFig = EC.graph({
    w: 330, h: 270, x: [0, 21], y: [0, 82], xl: 'q', yl: '\\$', xt: [5, 10, 20], yt: [20, 30, 40, 80],
    items: [
      { poly: [[0, 0], [10, 0], [10, 30], [0, 30]], cls: 'ex' },
      { poly: [[0, 30], [10, 30], [10, 40], [0, 40]], cls: 'gain' },
      { seg: [[0, 40], [21, 40]], cls: 'curve c3 dash', lab: 'P = 40', at: 0.72, dx: 0, dy: -6, anchor: 'b' },
      { f: (x) => 4 * x, from: 0, to: 20, cls: 'c5', lab: 'MC', labX: 19, dx: -6, dy: 0, anchor: 'r' },
      { f: (x) => 2 * x + 100 / x, from: 1.3, to: 20.5, lab: 'AC', labX: 20.5, dx: -2, dy: -6, anchor: 'br' },
      { f: (x) => 2 * x, from: 0, to: 20.5, cls: 'c2', lab: 'AVC', labX: 18, dx: 2, dy: 10, anchor: 'tl' },
      { pt: [10, 40], guide: 'x' }, { pt: [10, 30] },
      { text: [5, 15], t: 'TC = 300' }, { text: [5, 35], t: '\\pi = 100' },
    ],
  });
  // Q3: C = q^3 - 8q^2 + 30q + 5
  const MC3 = (q) => 3 * q * q - 16 * q + 30, AVC3 = (q) => q * q - 8 * q + 30;
  const cubicFig = EC.graph({
    w: 330, h: 270, x: [0, 7.6], y: [0, 50], xl: 'q', yl: '\\$', xt: [4, 6], yt: [14, 42],
    items: [
      { seg: [[0, 14], [7.6, 14]], cls: 'curve c3 dash', lab: '\\text{shutdown price}', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { f: MC3, from: 0, to: 6.4, cls: 'c5', lab: 'MC', labX: 6.3, dx: 6, dy: 0, anchor: 'l' },
      { f: AVC3, from: 0, to: 7.5, cls: 'c2', lab: 'AVC', labX: 7.5, dx: -2, dy: -6, anchor: 'br' },
      { pt: [4, 14], lab: '(4,\\,14)', at: 'br', guide: 'x' },
      { pt: [6, 42], lab: '(6,\\,42)', at: 'tl', guide: true },
    ],
  });

  // ------------------------------------------------------------------ shared plan steps
  const PLAN_FIX_X2 = (sub) => plan('How do you turn the two-input production function into a short-run one?', `Plug in the fixed amount of $x_2$${sub ? `: ${sub}` : ''}`, [
    ['Set $x_2 = 0$ because it is fixed', 'Fixed means stuck at its current level, not zero. With $x_2 = 0$ nothing gets made.'],
    ['Keep both inputs and use $MP_1/MP_2 = w_1/w_2$', 'That tangency is long-run cost minimization, where both inputs can change. In the short run $x_2$ is stuck.'],
    ['Differentiate with respect to $x_2$', 'The fixed input is not a choice in the short run, so there is nothing to optimize over it.'],
  ], 'Substitute $\\bar{x}_2$, pull the number out of the square root, and you have $q$ as a function of $x_1$ alone.');
  const PLAN_PMP = plan('Which equation picks the best amount of the variable input?', '$pMP_1 = w_1$: the dollars the last unit brings in equal what it costs', [
    ['$MP_1 = w_1$', 'That compares units of output with dollars. Multiply the extra output by the price to get the dollars it brings in.'],
    ['$MP_1 = 0$ (make as much as possible)', 'Most output is not most profit. With a square-root technology $MP_1$ is never zero anyway.'],
    ['$\\pi(x_1) = 0$', 'That finds where profit is zero (break-even), not where it is largest.'],
  ], 'Differentiate $q(x_1)$ to get $MP_1$, set $p \\cdot MP_1 = w_1$, solve for $\\sqrt{x_1}$ first, then square.');
  const PLAN_PIECES = (cost) => plan(`Which piece of $C(q) = ${cost}$ goes into which curve?`, 'AC divides all of $C$ by $q$; AVC divides only the variable part; MC is the derivative, so the constant drops out', [
    ['AVC divides all of $C$ by $q$', 'That is AC. AVC leaves out the fixed cost, the part paid even with zero output.'],
    ['MC keeps the constant', 'The derivative of a constant is zero: fixed cost never changes the cost of the next unit.'],
    ['AVC is the variable cost itself', 'That is VC. "Average" means per unit: divide by $q$.'],
  ], 'The constant is the fixed cost $F$; everything with a $q$ in it is $VC$. Divide by $q$ for the averages; differentiate for MC.');
  const PLAN_PMC = plan('How many units at a given price?', 'Set $P = MC$', [
    ['Set $P = AC$', 'That is break-even, not the best output. It can even have no solution when the price is below min AC.'],
    ['Set $P = AVC$', 'AVC is for the shutdown test. Producing until $P = AVC$ means the last units cost more than they bring in.'],
    ['Set $MR = MC$ with MR below the price', 'A price taker sells every unit at the same $P$, so $MR = P$. MR below price is the monopoly case.'],
  ], 'Differentiate cost, set $MC$ equal to the price, solve for $q$. Then check that the price is at least min AVC.');

  // ------------------------------------------------------------------ DS8 generators (same questions, new numbers)
  gen('m3_ds_truck', () => {
    let A = 4, K = 4, p = 8, s = 2, w1 = 16, w2 = 4;
    for (let k = 0; k < 60; k++) {
      const a = pick([2, 4, 6]), kk = pick([1, 4, 9]), pp = pick([2, 4, 5, 8, 10]), ss = pick([1, 2, 3, 4]), ww2 = pick([1, 2, 3, 4]);
      const ww1 = pp * a * Math.sqrt(kk) / (2 * ss);
      if (Number.isInteger(ww1) && ww1 >= 2 && ww1 * ss * ss > ww2 * kk) { A = a; K = kk; p = pp; s = ss; w1 = ww1; w2 = ww2; break; }
    }
    const rk = Math.sqrt(K), B = A * rk, x1 = s * s, q = B * s, pi = p * q - w1 * x1 - w2 * K;
    const qx = `${B}\\sqrt{x_1}`;
    return {
      title: 'Short-run input choice (DS8 Q1, new numbers)',
      q: md`A competitive firm sells its output at $p = ${p}$ and produces with $q = ${A}\sqrt{x_1x_2}$. In the short run $x_2$ is fixed at $\bar{x}_2 = ${K}$. The variable input costs $w_1 = ${w1}$ per unit and the fixed input $w_2 = ${w2}$ per unit. Find $x_1^*$, $q^*$, $\pi^*$, and the slope of the isoprofit line through the optimum.`,
      plan: [PLAN_FIX_X2(`$q = ${A}\\sqrt{${K}x_1} = ${qx}$`), PLAN_PMP],
      parts: [N('x_1^*', x1), N('q^*', q), N('\\pi^*', pi), N('\\text{isoprofit slope } w_1/p', w1 / p)],
      hints: [`$q = ${qx}$, so $MP_1 = \\dfrac{${F(B / 2)}}{\\sqrt{x_1}}$.`, `$${p} \\cdot \\dfrac{${F(B / 2)}}{\\sqrt{x_1}} = ${w1}$.`],
      sol: md`
        **Move 1: fix $x_2$.** $q = ${A}\sqrt{${K}x_1} = ${A}\cdot ${rk}\sqrt{x_1} = ${qx}$.

        **Move 2: marginal product.** $MP_1 = ${B}\cdot\tfrac12 x_1^{-1/2} = \dfrac{${F(B / 2)}}{\sqrt{x_1}}$.

        **Move 3: $pMP_1 = w_1$.**
        $$${p}\cdot\frac{${F(B / 2)}}{\sqrt{x_1}} = ${w1} \;\Rightarrow\; \sqrt{x_1} = \frac{${F(p * B / 2)}}{${w1}} = ${s} \;\Rightarrow\; x_1^* = ${x1}$$

        **Move 4: output and profit.** $q^* = ${B}(${s}) = ${q}$. $\pi^* = ${p}(${q}) - ${w1}(${x1}) - ${w2}(${K}) = ${p * q} - ${w1 * x1} - ${w2 * K} = ${pi}$.

        **Move 5: isoprofit line.** $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar{x}_2}{p}$: slope $${w1}/${p} = ${F(w1 / p)}$, intercept $(${pi} + ${w2 * K})/${p} = ${F((pi + w2 * K) / p)}$. Check: at $x_1 = ${x1}$ the line gives $${F(w1 / p)}(${x1}) + ${F((pi + w2 * K) / p)} = ${q}$ ✓.
      `,
    };
  });

  gen('m3_ds_dent', () => {
    const a = pick([1, 2, 3, 5]), Fx = pick([50, 100, 150, 200, 300]), q = ri(3, 12), Pr = 2 * a * q;
    const TR = Pr * q, TC = a * q * q + Fx, pi = TR - TC, ac = TC / q, A = a === 1 ? '' : a;
    return {
      title: 'Cost curves, output and profit (DS8 Q2, new numbers)',
      q: md`A competitive firm's short-run cost is $C(q) = ${A}q^2 + ${Fx}$. Find its AC, AVC and MC functions. The market price is \$${Pr}: how much does it produce, what is its total cost, and what is its profit?`,
      plan: [PLAN_PIECES(`${A}q^2 + ${Fx}`), PLAN_PMC],
      parts: [X('AC(q)', `${a}*q + ${Fx}/q`, { q: [1, 20] }), X('AVC(q)', `${a}*q`, { q: [1, 20] }), X('MC(q)', `${2 * a}*q`, { q: [1, 20] }),
        N('q^*', q), N('TC', TC), N('\\pi', pi)],
      hints: [`$MC = ${2 * a}q$. Set $${Pr} = ${2 * a}q$.`, `$TC = AC(q^*) \\times q^*$.`],
      sol: md`
        **Move 1: split the cost.** $F = ${Fx}$ (the constant), $VC = ${A}q^2$.
        $$AC = ${A}q + \frac{${Fx}}{q}, \qquad AVC = ${A}q, \qquad MC = ${2 * a}q$$

        **Move 2: $P = MC$.** $${Pr} = ${2 * a}q \Rightarrow q^* = ${q}$. Min AVC is 0 (at $q \to 0$), so any positive price keeps the firm open.

        **Move 3: the rectangles.** $TR = ${Pr} \times ${q} = ${TR}$. $AC(${q}) = ${A ? `${a}(${q})` : q} + ${Fx}/${q} = ${F(ac)}$, so $TC = ${F(ac)} \times ${q} = ${TC}$.
        $$\pi = ${TR} - ${TC} = ${pi}$$
        ${pi < 0 ? `A loss, but smaller than the ${Fx} the firm would lose by shutting down: it stays open in the short run.` : 'Positive: price is above AC at this output.'}
      `,
    };
  });

  // ------------------------------------------------------------------ DS8
  const ds8 = [
    R(md`
      ### What this looks like on the exam

      DS8 has three questions, and each one is a type you will see again. Read the left column, recognize the type, then use the move.

      | The question says… | It is really asking… | The move |
      |---|---|---|
      | "$x_2$ is fixed; write short-run profit as a function of labor" | short-run production with one variable input | plug $\bar{x}_2$ into $q$; $\pi = pq - w_1x_1 - w_2\bar{x}_2$ |
      | "use $pMP_1 = w_1$ to find $x_1^*$" | hire until the last unit pays for itself | differentiate $q$, set $p \cdot MP_1 = w_1$ |
      | "the wage rises: find the new $x_1^*$, $q^*$, $\pi^*$" | comparative statics | same condition, new $w_1$ |
      | "sketch the isoprofit lines and label the tangencies" | line $q = \frac{w_1}{p}x_1 + \frac{\pi + w_2\bar{x}_2}{p}$ touching $q(x_1)$ | slope $w_1/p$, intercept from $\pi^*$ |
      | "AC, AVC, MC functions" | read $F$ as the constant | divide by $q$; differentiate |
      | "how many cars at a price of \$20?" | the supply curve | $P = MC$ |
      | "shade total revenue, total cost and profit" | three rectangles | $P \times q$, $AC \times q$, $(P - AC)q$ |
      | "output at the minimum of AVC", "shutdown price" | the bottom of AVC | $MC = AVC$, then AVC there |
      | "at what price does it supply exactly 6 units?" | inverse supply | $P = MC(6)$ |

      Work each card on paper first. The plan question comes before any box: pick the approach, read why the others fail, then compute.
    `),
    P({ src: 'DS8 Q1a–1b', title: 'Food truck: short-run labor choice',
      q: md`A food truck sells pita sandwiches for \$8 each in a perfectly competitive market. It uses labor ($x_1$) and truck capacity ($x_2$):
      $$q = 4\sqrt{x_1x_2}$$
      In the short run capacity is fixed at $\bar{x}_2 = 4$. Labor costs \$16 per unit ($w_1 = 16$) and capacity \$4 per unit ($w_2 = 4$).

      **(a)** Substitute the fixed capacity into production. Write short-run profit as a function of labor.

      **(b)** Find $MP_1$, then use $pMP_1 = w_1$ to find optimal labor $x_1^*$, output $q^*$ and profit $\pi^*$.`,
      plan: [PLAN_FIX_X2('$q = 4\\sqrt{4x_1} = 8\\sqrt{x_1}$'), PLAN_PMP],
      parts: [X('q(x_1)', '8*sqrt(x1)', { x1: [1, 9] }), X('\\pi(x_1)', '64*sqrt(x1) - 16*x1 - 16', { x1: [1, 9] }), X('MP_1', '4/sqrt(x1)', { x1: [1, 9] }),
        N('x_1^*', 4), N('q^*', 16), N('\\pi^*', 48)],
      hints: ['$\\sqrt{4x_1} = 2\\sqrt{x_1}$.', 'Capacity costs $w_2\\bar{x}_2 = 16$ whether or not the truck opens.', '$8 \\cdot \\dfrac{4}{\\sqrt{x_1}} = 16$.'],
      sol: md`
        **Move 1: fix capacity (part a).** Put $x_2 = 4$ into the production function and pull the 4 out of the root:
        $$q = 4\sqrt{4x_1} = 4 \cdot 2\sqrt{x_1} = 8\sqrt{x_1}$$
        Profit is revenue minus both input bills. The capacity bill is $w_2\bar{x}_2 = 4 \times 4 = 16$, paid no matter how much labor is hired:
        $$\pi(x_1) = pq - w_1x_1 - w_2\bar{x}_2 = 8(8\sqrt{x_1}) - 16x_1 - 16 = 64\sqrt{x_1} - 16x_1 - 16$$

        **Move 2: marginal product (part b).** Write $8\sqrt{x_1} = 8x_1^{1/2}$ and use the power rule:
        $$MP_1 = \frac{dq}{dx_1} = 8 \cdot \tfrac12 x_1^{-1/2} = \frac{4}{\sqrt{x_1}}$$

        **Move 3: $pMP_1 = w_1$.** The last unit of labor adds $MP_1$ sandwiches, each worth \$8. Hire until that value equals the \$16 it costs:
        $$8 \cdot \frac{4}{\sqrt{x_1}} = 16 \;\Rightarrow\; \frac{32}{\sqrt{x_1}} = 16 \;\Rightarrow\; \sqrt{x_1} = 2 \;\Rightarrow\; x_1^* = 4$$

        **Move 4: output and profit.** $q^* = 8\sqrt{4} = 16$ sandwiches.
        $$\pi^* = 8(16) - 16(4) - 16 = 128 - 64 - 16 = 48$$
        Check with the profit function from (a): $64(2) - 16(4) - 16 = 48$ ✓.

        **Does this make sense?** At $x_1 = 4$ the last unit of labor adds $MP_1 = 4/2 = 2$ sandwiches, worth \$16: exactly its wage. Hire less and you skip units that pay more than they cost; hire more and each extra unit brings in less than \$16.
      ` }),
    P({ src: 'DS8 Q1c', title: 'The wage doubles',
      q: md`Same food truck: $q = 8\sqrt{x_1}$ in the short run, $p = 8$, capacity bill $w_2\bar{x}_2 = 16$. The price of labor **rises from \$16 to \$32**. The output price and capacity are unchanged. Find the new $x_1^*$, $q^*$ and $\pi^*$.`,
      plan: plan('What do you redo?', 'The same condition $pMP_1 = w_1$, now with $w_1 = 32$', [
        ['Halve labor because the wage doubled: $x_1 = 2$', 'Labor demand is not proportional to the wage. Solving the condition gives a quarter of the old labor, not half.'],
        ['Keep $x_1 = 4$ and recompute profit with the new wage', 'The truck re-optimizes: at $x_1 = 4$ the last unit of labor brings in \\$16 but now costs \\$32.'],
        ['Use more capacity to replace labor', 'Capacity is fixed at 4 in the short run. Only labor adjusts.'],
      ], 'Solve $8 \\cdot 4/\\sqrt{x_1} = 32$, then $q = 8\\sqrt{x_1}$ and $\\pi = 8q - 32x_1 - 16$.'),
      parts: [N('x_1^*', 1), N('q^*', 8), N('\\pi^*', 16),
        FIX('Compared with $w_1 = 16$, labor, output and profit all…', ['fall', 'rise', 'stay the same'], 0, [null, 'A costlier input is used less, so output falls too, and every unit of labor now costs more.', 'The firm re-optimizes when an input price changes.'])],
      sol: md`
        **Move 1: $pMP_1 = w_1$ with the new wage.**
        $$8 \cdot \frac{4}{\sqrt{x_1}} = 32 \;\Rightarrow\; \frac{32}{\sqrt{x_1}} = 32 \;\Rightarrow\; \sqrt{x_1} = 1 \;\Rightarrow\; x_1^* = 1$$

        **Move 2: output.** $q^* = 8\sqrt{1} = 8$.

        **Move 3: profit.** $\pi^* = 8(8) - 32(1) - 4(4) = 64 - 32 - 16 = 16$.

        | Outcome | $w_1 = 16$ | $w_1 = 32$ |
        |---|---|---|
        | labor $x_1^*$ | 4 | 1 |
        | output $q^*$ | 16 | 8 |
        | profit $\pi^*$ | 48 | 16 |

        **Why a quarter, not a half?** In general $8 \cdot 4/\sqrt{x_1} = w_1$ gives $\sqrt{x_1} = 32/w_1$, so $x_1^* = (32/w_1)^2$. Doubling $w_1$ halves $\sqrt{x_1}$ and so quarters $x_1$.
      ` }),
    P({ src: 'DS8 Q1d', title: 'Isoprofit lines and the two tangencies',
      q: md`On a graph with labor $x_1$ (0 to 8) across and output $q$ (0 to 24) up, sketch the production function $q = 8\sqrt{x_1}$ and the profit-maximizing isoprofit lines at $w_1 = 16$ and at $w_1 = 32$ ($p = 8$, $w_2\bar{x}_2 = 16$). Label both tangency points (labor, output). What happens to the slope of the isoprofit line when labor becomes more expensive? Why do labor use and output change?`,
      plan: [
        plan('How do you get the equation of an isoprofit line?', 'Solve $\\pi = pq - w_1x_1 - w_2\\bar{x}_2$ for $q$: $q = \\frac{w_1}{p}x_1 + \\frac{\\pi + w_2\\bar{x}_2}{p}$', [
          ['Slope $p/w_1$', 'Flipped. Output is on the vertical axis, so solve for $q$: the slope is $w_1/p$, the extra output needed to pay for one more unit of labor.'],
          ['A horizontal line at $q^*$', 'More labor costs more, so holding profit fixed needs more output: isoprofit lines slope up.'],
          ['Intercept $\\pi/p$', 'That forgets the capacity bill $w_2\\bar{x}_2 = 16$, paid even at zero labor.'],
        ], 'Slope $w_1/p$. Intercept $(\\pi^* + 16)/8$, using the profit from (b) and (c).'),
        plan('Which isoprofit line do you draw for each wage?', 'The one with profit $\\pi^*$: it just touches the production function at the optimum', [
          ['The one through the origin', 'Right slope, but too low: higher parallel lines still reach the curve, so profit can rise.'],
          ['Any line with the right slope that crosses the curve twice', 'If it crosses, a higher parallel line still touches the curve: profit can still go up.'],
          ['The same tangent point for both wages', 'Each wage has its own slope, so its own tangency point.'],
        ], 'The highest reachable line is the tangent one. Tangency means slope of $q(x_1)$ = slope of the line: $MP_1 = w_1/p$, the same as $pMP_1 = w_1$.'),
      ],
      parts: [N('\\text{slope at }w_1 = 16', 2), N('\\text{intercept at }w_1 = 16', 8), N('\\text{slope at }w_1 = 32', 4), N('\\text{intercept at }w_1 = 32', 4),
        FIX('When labor gets more expensive the isoprofit lines get…', ['steeper', 'flatter', 'no steeper: they shift down in parallel'], 0, [null, 'The slope is $w_1/p$, and $w_1$ went up.', 'The slope $w_1/p$ changed, so the lines are not parallel to the old ones.']),
        FIX('The tangency point moves…', ['left and down', 'right and up', 'straight down at the same labor'], 0, [null, 'A steeper line touches the curve where the curve is steeper: at less labor.', 'Labor changes too: the tangency is where $MP_1$ equals the new, larger $w_1/p$.'])],
      sol: md`
        **Move 1: the lines.** Isoprofit: $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar{x}_2}{p}$.

        - $w_1 = 16$, $\pi^* = 48$: slope $16/8 = 2$, intercept $(48 + 16)/8 = 8$. So $q = 2x_1 + 8$.
        - $w_1 = 32$, $\pi^* = 16$: slope $32/8 = 4$, intercept $(16 + 16)/8 = 4$. So $q = 4x_1 + 4$.

        **Move 2: check the tangencies.** At $(4, 16)$: the line gives $2(4) + 8 = 16$ ✓ and $MP_1(4) = 4/\sqrt4 = 2$, the line's slope ✓. At $(1, 8)$: $4(1) + 4 = 8$ ✓ and $MP_1(1) = 4$ ✓.

        [[fig:iso]]

        **Move 3: explain.** A higher wage makes the isoprofit line **steeper** (slope $w_1/p$ doubles from 2 to 4). The production function gets flatter as labor grows (diminishing marginal product), so a steeper line can only touch it further **left**, where the curve is still steep. The optimum moves left and down: less labor, less output. In words: each unit of labor now has to bring in \$32 of sandwiches, and only the first, most productive units clear that bar.
      `, figs: { iso: { svg: isoFig, cap: 'Black: $q = 8\\sqrt{x_1}$. Purple: the isoprofit line at $w_1 = 16$, tangent at (4, 16). Orange: the steeper line at $w_1 = 32$, tangent at (1, 8).' } } }),
    G('m3_ds_truck', { need: 2 }),
    P({ src: 'DS8 Q2a–2c', title: 'Dent’s cost curves',
      q: md`Dent is in the auto repair business. His short-run cost of repairing $q$ cars is
      $$C(q) = 2q^2 + 100$$
      **(a)** What is his average cost function? **(b)** His average variable cost function? **(c)** His marginal cost function?`,
      plan: PLAN_PIECES('2q^2 + 100'),
      parts: [X('AC(q)', '2*q + 100/q', { q: [1, 20] }), X('AVC(q)', '2*q', { q: [1, 20] }), X('MC(q)', '4*q', { q: [1, 20] })],
      sol: md`
        **Move 1: split the cost.** The constant 100 is the fixed cost $F$ (the shop lease: paid even with zero repairs). The rest is variable cost: $VC = 2q^2$.

        **Move 2: average cost (a)** divides **all** of cost by the number of cars:
        $$AC(q) = \frac{2q^2 + 100}{q} = 2q + \frac{100}{q}$$

        **Move 3: average variable cost (b)** divides only the variable part:
        $$AVC(q) = \frac{2q^2}{q} = 2q$$

        **Move 4: marginal cost (c)** is the derivative; the 100 drops out:
        $$MC(q) = \frac{dC}{dq} = 4q$$

        **Does this make sense?** $AC - AVC = 100/q$: the fixed cost spread over the cars, which shrinks as Dent repairs more. MC should cut AC at its bottom: $4q = 2q + 100/q \Rightarrow q^2 = 50 \Rightarrow q \approx 7.07$, where $AC \approx 28.28$. Below \$28.28 Dent cannot break even.
      ` }),
    P({ src: 'DS8 Q2d–2f', title: 'Dent at \$20 and at \$40',
      q: md`Dent: $C(q) = 2q^2 + 100$, so $MC = 4q$, $AC = 2q + 100/q$ and $AVC = 2q$.

      **(d)** If the market price is \$20, how many cars will Dent be willing to repair? **(e)** If the market price is \$40? **(f)** At \$40, on a graph of MC, AC and AVC, shade and label total revenue, total cost and total profit.`,
      plan: [
        PLAN_PMC,
        plan('Part (f): how do you draw total cost on a cost-curve graph?', 'A rectangle with height $AC(q^*)$ and width $q^*$', [
          ['Height $MC(q^*)$, width $q^*$', 'MC is the cost of the last car only. $40 \\times 10 = 400$ overstates total cost, which is 300.'],
          ['The area under the MC curve', 'That area is variable cost only: it leaves out the fixed 100.'],
          ['Height $P$, width $q^*$', 'That rectangle is total revenue.'],
        ], 'TR = $P \\times q^*$ (up to the price line). TC = $AC(q^*) \\times q^*$ (up to AC). Profit = the strip between them, $(P - AC)q^*$.'),
      ],
      parts: [N('q\\text{ at }P = 20', 5), N('q\\text{ at }P = 40', 10), N('TR\\text{ at }P = 40', 400), N('TC\\text{ at }P = 40', 300), N('\\pi\\text{ at }P = 40', 100),
        FIX('The total cost rectangle at $P = 40$ has height…', ['$AC(10) = 30$', '$P = 40$', '$MC(10) = 40$', '$AVC(10) = 20$'], 0,
          [null, 'Height $P$ times $q$ is total revenue.', 'MC is the cost of the last car only; MC × q is not total cost.', 'AVC × q is variable cost only; it leaves out the fixed 100.'])],
      sol: md`
        **Move 1: $P = MC$ (d).** $20 = 4q \Rightarrow q = 5$ cars. Shutdown check: $AVC = 2q$ has minimum 0, so any positive price keeps Dent open. (At \$20 he loses money: $TR = 100$, $TC = 2(25) + 100 = 150$, $\pi = -50$. Closing would lose the whole 100 of fixed cost, so repairing 5 cars is still better.)

        **Move 2: $P = MC$ (e).** $40 = 4q \Rightarrow q = 10$ cars.

        **Move 3: the three rectangles at \$40 (f).**

        - Total revenue: $P \times q = 40 \times 10 = 400$. From 0 up to the price line, across to $q = 10$.
        - Total cost: $AC(10) \times 10$. $AC(10) = 2(10) + 100/10 = 30$, so $TC = 30 \times 10 = 300$. From 0 up to the AC curve.
        - Profit: $(P - AC)\,q = (40 - 30)(10) = 100$. The strip between the price line and AC.

        Check: $TR - TC = 400 - 300 = 100$ ✓.

        [[fig:dent]]
      `, figs: { dent: { svg: dentFig, cap: 'P = 40: q = 10 where the price line meets MC. Gray: total cost $AC \\times q = 30 \\times 10$. Green: profit $(40 - 30) \\times 10 = 100$. Total revenue is gray + green, $40 \\times 10 = 400$.' } } }),
    G('m3_ds_dent', { need: 2 }),
    P({ src: 'DS8 Q3', title: 'A cubic cost and the shutdown price',
      q: md`A perfectly competitive firm has the short-run cost function
      $$C(q) = q^3 - 8q^2 + 30q + 5$$
      **(a)** What is its marginal cost function? **(b)** Its average variable cost function? **(c)** What is the level of output at the minimum of AVC? **(d)** The firm supplies zero output if the price is below what (the shutdown price)? **(e)** At what price would the firm supply exactly 6 units?`,
      plan: [
        plan('Parts (a)–(b): what do you do with the constant 5?', 'It is the fixed cost: it drops out of MC and is left out of AVC', [
          ['Keep it in AVC as $5/q$', '$5/q$ is average **fixed** cost. AVC counts only the costs that change with output.'],
          ['Keep it in MC', 'The derivative of a constant is 0.'],
          ['Drop it everywhere, including AC and profit', 'It does belong in AC and in profit. It is only out of MC and AVC.'],
        ], '$MC = 3q^2 - 16q + 30$. $AVC = (q^3 - 8q^2 + 30q)/q = q^2 - 8q + 30$.'),
        plan('Parts (c)–(d): how do you find the bottom of AVC and the shutdown price?', 'Set $MC = AVC$ (MC cuts AVC at its minimum); the shutdown price is AVC there', [
          ['Set $MC = 0$', 'That has no real solution here, and the bottom of MC is not the bottom of AVC anyway (MC bottoms out first, at $q = 8/3$).'],
          ['Set $MC = AC$', 'That is the bottom of AC: the break-even price. Shutdown ignores the fixed 5, which is paid either way.'],
          ['Set $AVC = 0$', 'AVC is never zero here; you want its lowest value, not a zero.'],
        ], '$3q^2 - 16q + 30 = q^2 - 8q + 30 \\Rightarrow 2q(q - 4) = 0$, so $q = 4$. Shutdown price $= AVC(4)$.'),
        plan('Part (e): the price at which the firm supplies exactly 6?', 'Plug $q = 6$ into MC: along the supply curve $P = MC(q)$', [
          ['Plug $q = 6$ into AVC', '$AVC(6) = 18$ is cost per unit, not the price that makes 6 the best output. At \\$18 the firm would choose about 4.4 units.'],
          ['Plug $q = 6$ into AC', 'AC is cost per unit including the fixed cost. Output is chosen where price meets MC.'],
          ['Solve $MC(q) = 6$', 'That treats 6 as a price. The 6 is the quantity; you are solving for the price.'],
        ], '$P = MC(6)$, then check it is above the shutdown price.'),
      ],
      parts: [X('MC(q)', '3*q^2 - 16*q + 30', { q: [1, 8] }), X('AVC(q)', 'q^2 - 8*q + 30', { q: [1, 8] }),
        N('q\\text{ at min }AVC', 4), N('P_{\\text{shutdown}}', 14), N('P\\text{ for }q = 6', 42)],
      hints: ['$VC = q^3 - 8q^2 + 30q$ (everything but the 5).', 'The 30s cancel when you set MC = AVC.'],
      sol: md`
        **Move 1: split the cost.** Fixed cost 5 (the constant). $VC = q^3 - 8q^2 + 30q$.

        **Move 2: MC (a)** by the power rule, term by term:
        $$MC(q) = 3q^2 - 16q + 30$$

        **Move 3: AVC (b)** divides the variable part by $q$:
        $$AVC(q) = \frac{q^3 - 8q^2 + 30q}{q} = q^2 - 8q + 30$$

        **Move 4: bottom of AVC (c).** MC cuts AVC at its minimum, so set them equal:
        $$3q^2 - 16q + 30 = q^2 - 8q + 30$$
        The 30s cancel. Move everything to the left:
        $$2q^2 - 8q = 0 \;\Rightarrow\; 2q(q - 4) = 0$$
        So $q = 0$ or $q = 4$. AVC is an average over positive output, so $q = 4$. (Same answer from $dAVC/dq = 2q - 8 = 0$.)

        **Move 5: shutdown price (d)** $= AVC(4) = 16 - 32 + 30 = 14$. Below \$14 the firm supplies zero.

        **Move 6: price for 6 units (e).** On the supply curve $P = MC$:
        $$MC(6) = 3(36) - 16(6) + 30 = 108 - 96 + 30 = 42$$
        \$42 is above \$14, so at \$42 the firm really does supply 6 units.

        [[fig:cub]]

        **Does this make sense?** The supply curve is the rising part of MC above (4, 14). A higher price (42) calls forth more output (6) than the shutdown point (4). ✓
      `, figs: { cub: { svg: cubicFig, cap: 'MC (red) cuts AVC (orange) at its bottom, (4, 14): the shutdown point. The supply curve is MC above that point; at P = 42 the firm makes 6.' } } }),
    R(md`
      !!key DS8 in three lines
        **Input choice:** plug in the fixed input, then $pMP_1 = w_1$. A higher wage means steeper isoprofit lines, less labor, less output.

        **Cost curves:** the constant is $F$. $AC = C/q$, $AVC = VC/q$, $MC = C'(q)$.

        **Supply:** $q$ from $P = MC$; shut down below min AVC (found from $MC = AVC$); the price for a given $q$ is $MC(q)$.
    `),
  ];

  // ------------------------------------------------------------------ DS9 figures
  const exitFig = EC.graph({
    w: 320, h: 250, x: [0, 6.4], y: [0, 26], xl: 'q', yl: '\\$', xt: [2], yt: [8],
    items: [
      { seg: [[0, 8], [6.4, 8]], cls: 'curve c3 dash', lab: '\\text{exit price}', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { f: (x) => 4 * x, from: 0, to: 6.3, cls: 'c5', lab: 'LRMC', labX: 6.2, dx: -6, dy: 0, anchor: 'r' },
      { f: (x) => 2 * x + 8 / x, from: 0.33, to: 6.3, lab: 'LRAC', labX: 6.3, dx: -2, dy: -6, anchor: 'br' },
      { pt: [2, 8], lab: '(2,\\,8)', at: 'br', guide: 'x' },
    ],
  });
  const mktFig = EC.graph({
    w: 330, h: 260, x: [0, 640], y: [0, 64], xl: 'Q', yl: 'P', xt: [300, 600], yt: [30, 60],
    items: [
      { poly: [[0, 30], [0, 60], [300, 30]], cls: 'cs' },
      { poly: [[0, 0], [0, 30], [300, 30]], cls: 'gain' },
      { seg: [[0, 60], [600, 0]], cls: 'curve', lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 0], [640, 64]], cls: 'curve c2', lab: 'S', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { pt: [300, 30], guide: true },
      { text: [80, 38], t: 'CS' }, { text: [80, 22], t: 'PS' },
    ],
  });
  // price support at 45: consumers buy 150, producers sell 450
  const supWelFig = EC.graph({
    w: 330, h: 260, x: [0, 640], y: [0, 64], xl: 'Q', yl: 'P', xt: [150, 300, 450], yt: [30, 45, 60],
    items: [
      { poly: [[0, 45], [0, 60], [150, 45]], cls: 'cs' },
      { poly: [[0, 0], [0, 45], [450, 45]], cls: 'gain' },
      { seg: [[0, 60], [600, 0]], cls: 'curve', lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 0], [640, 64]], cls: 'curve c2', lab: 'S', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 45], [640, 45]], cls: 'curve c5 dash', lab: '\\text{support } 45', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [150, 45], guide: 'x' }, { pt: [450, 45], guide: 'x' },
      { text: [45, 49], t: 'CS' }, { text: [250, 34], t: 'PS' },
    ],
  });
  const supLossFig = EC.graph({
    w: 330, h: 260, x: [0, 640], y: [0, 64], xl: 'Q', yl: 'P', xt: [150, 300, 450], yt: [30, 45],
    items: [
      { poly: [[150, 0], [150, 45], [300, 30], [450, 45], [450, 0]], cls: 'loss' },
      { pts: [[150, 0], [150, 45], [450, 45], [450, 0]], cls: 'curve c4 dash' },
      { seg: [[0, 60], [600, 0]], cls: 'curve', lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 0], [640, 64]], cls: 'curve c2', lab: 'S', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { pt: [300, 30] },
      { text: [300, 14], t: '\\text{lost } 11{,}250' }, { text: [300, 49], t: 'G = 13{,}500' },
    ],
  });

  // ------------------------------------------------------------------ DS9 plan steps and generators
  const PLAN_EXIT = plan('"In the long run it supplies a positive amount only if the price is above…" What are you looking for?', 'The minimum of LRAC: the exit price', [
    ['The minimum of AVC, treating the constant as fixed', 'In the long run nothing is fixed: that cost can be avoided by leaving, so the firm stays only if price covers all of its cost per unit, LRAC.'],
    ['Where $P = LRMC$', 'No price is given: you are looking for the price itself. $P = LRMC$ tells you how much to supply once you know the price.'],
    ['Where $LRMC = 0$', 'That is $q = 0$, which says nothing about whether staying in pays.'],
  ], 'Find the bottom of LRAC by setting $LRMC = LRAC$, then evaluate LRAC (or LRMC) there.');
  const PLAN_SUPPORT = plan('At the support price, who sells and who buys?', 'Producers sell $Q^S$ at the support price; consumers buy $Q^D$; the government buys the gap', [
    ['Producers sell only what consumers buy, $Q^D$', 'That is a plain price floor, where the excess goes unsold. Under a support the government buys the excess, so producers sell all they want.'],
    ['Both still trade the old equilibrium quantity', 'At the higher price buyers want less and sellers want more: the old quantity no longer clears anything.'],
    ['The government buys $Q^D$', 'The government buys only what consumers leave: the excess $Q^S - Q^D$.'],
  ], 'Plug the support price into both curves. Government buys $Q^S - Q^D$ and pays the support price for each unit.');
  const PLAN_G = plan('How does government spending enter social surplus?', 'Subtract it: $SS = CS + PS - G$', [
    ['Add it, like tax revenue', 'Tax revenue is money coming **in** to the government. Here money goes **out**: taxpayers pay for the purchases.'],
    ['Ignore it: it is just a transfer', 'The money comes from taxpayers, and the units the government buys get no value in this accounting, so the spending is a real cost.'],
    ['Subtract only the markup over the old price', 'Taxpayers pay the full support price for every unit bought.'],
  ], 'Before: $G = 0$. After: $G$ = support price × units bought. $SS = CS + PS - G$.');

  gen('m3_ds_exit', () => {
    const a = pick([1, 2, 3, 5]), q = pick([2, 3, 4, 5, 6]), K = a * q * q, Pe = 2 * a * q, m = pick([1, 2, 3]), P2 = 2 * a * (q + m);
    const A = a === 1 ? '' : a;
    return {
      title: 'Exit price from long-run cost (DS9 Q1, new numbers)',
      q: md`A perfectly competitive firm has long-run cost $C(q) = ${A}q^2 + ${K}$ for $q > 0$. **(a)** In the long run it supplies a positive amount only if the price is above what? **(b)** How much does it supply in the long run if the price is \$${P2}?`,
      plan: [PLAN_EXIT, PLAN_PMC],
      parts: [N('q\\text{ at min }LRAC', q), N('\\text{exit price}', Pe), N(`q\\text{ at }P = ${P2}`, q + m)],
      hints: [`$LRMC = ${2 * a}q$ and $LRAC = ${A}q + ${K}/q$.`, `$${2 * a}q = ${A}q + \\dfrac{${K}}{q} \\Rightarrow ${A}q^2 = ${K}$.`],
      sol: md`
        **Move 1: the two curves.** $LRMC = ${2 * a}q$, $LRAC = \dfrac{C}{q} = ${A}q + \dfrac{${K}}{q}$.

        **Move 2: bottom of LRAC where $LRMC = LRAC$.**
        $$${2 * a}q = ${A}q + \frac{${K}}{q} \;\Rightarrow\; ${A}q = \frac{${K}}{q} \;\Rightarrow\; ${A}q^2 = ${K} \;\Rightarrow\; q^2 = ${q * q} \;\Rightarrow\; q = ${q}$$

        **Move 3: exit price** $= LRAC(${q}) = ${a * q} + ${K / q} = ${Pe}$ (and $LRMC(${q}) = ${Pe}$ ✓). Below \$${Pe} the firm leaves; at exactly \$${Pe} it earns zero economic profit.

        **Move 4: supply at \$${P2}.** Above the exit price, $P = LRMC$: $${P2} = ${2 * a}q \Rightarrow q = ${q + m}$.
      `,
    };
  });

  gen('m3_ds_support', () => {
    let b = 10, s = 10, Pe = 30, k = 15;
    for (let t = 0; t < 60; t++) {
      const bb = pick([5, 10, 20]), ss = pick([5, 10, 20]), pe = pick([20, 30, 40]), kk = pick([5, 10, 15]);
      if (pe + kk < (bb + ss) * pe / bb - 1e-9) { b = bb; s = ss; Pe = pe; k = kk; break; }
    }
    const A = (b + s) * Pe, ch = A / b, Qe = s * Pe, Ps = Pe + k, Qs = s * Ps, Qd = A - b * Ps, Gq = Qs - Qd, Gx = Ps * Gq;
    const CS0 = 0.5 * Qe * (ch - Pe), PS0 = 0.5 * Qe * Pe, CS1 = 0.5 * Qd * (ch - Ps), PS1 = 0.5 * Qs * Ps, SS1 = CS1 + PS1 - Gx;
    return {
      title: 'Price support welfare table (DS9 Q2–Q3, new numbers)',
      q: md`Market demand is $Q^D = ${A} - ${b}P$ and market supply is $Q^S = ${s}P$. Find the equilibrium. Then the government sets a price support at \$${Ps} and buys any excess supply. Find what producers sell, what consumers buy, government spending, and the changes in CS, PS and social surplus.`,
      plan: [
        plan('First: the equilibrium?', 'Set $Q^D = Q^S$', [
          ['Set $Q^D = 0$', 'That gives the choke price, needed for CS but not the equilibrium.'],
          ['Start at the support price', 'You need the no-policy equilibrium first: the "Before" column of the table.'],
          ['Add $Q^D + Q^S$', 'The market clears where the two are equal, not where they add up to anything.'],
        ], `$${A} - ${b}P = ${s}P \\Rightarrow P^* = ${Pe}$, $Q^* = ${Qe}$.`),
        PLAN_SUPPORT, PLAN_G,
      ],
      parts: [N('P^*', Pe), N('Q^*', Qe), N('Q^S\\text{ at support}', Qs), N('Q^D\\text{ at support}', Qd), N('G', Gx), N('\\Delta CS', CS1 - CS0), N('\\Delta PS', PS1 - PS0), N('\\Delta SS', SS1 - CS0 - PS0)],
      hints: [`The choke price (where $Q^D = 0$) is $${F(ch)}$; supply starts at $P = 0$.`, `After: CS $= \\tfrac12(${Qd})(${F(ch)} - ${Ps})$, PS $= \\tfrac12(${Qs})(${Ps})$.`],
      sol: md`
        **Move 1: equilibrium.** $${A} - ${b}P = ${s}P \Rightarrow ${b + s}P = ${A} \Rightarrow P^* = ${Pe}$, $Q^* = ${s}(${Pe}) = ${Qe}$. Choke price: $${A}/${b} = ${F(ch)}$.
        Before: $CS = \tfrac12(${Qe})(${F(ch)} - ${Pe}) = ${F(CS0)}$, $PS = \tfrac12(${Qe})(${Pe}) = ${F(PS0)}$, $SS = ${F(CS0 + PS0)}$.

        **Move 2: quantities at \$${Ps}.** Producers sell $Q^S = ${s}(${Ps}) = ${Qs}$. Consumers buy $Q^D = ${A} - ${b}(${Ps}) = ${Qd}$. The government buys $${Qs} - ${Qd} = ${Gq}$ and spends $G = ${Ps} \times ${Gq} = ${F(Gx)}$.

        **Move 3: surpluses after.** $CS = \tfrac12(${Qd})(${F(ch)} - ${Ps}) = ${F(CS1)}$. $PS = \tfrac12(${Qs})(${Ps}) = ${F(PS1)}$.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | ${F(CS0)} | ${F(CS1)} | ${F(CS1 - CS0)} |
        | PS | ${F(PS0)} | ${F(PS1)} | ${F(PS1 - PS0)} |
        | G | 0 | ${F(-Gx)} | ${F(-Gx)} |
        | SS | ${F(CS0 + PS0)} | ${F(SS1)} | ${F(SS1 - CS0 - PS0)} |

        Producers gain, consumers lose, and taxpayers lose more than producers gain.
      `,
    };
  });

  // ------------------------------------------------------------------ DS9
  const ds9 = [
    R(md`
      ### What this looks like on the exam

      | The question says… | It is really asking… | The move |
      |---|---|---|
      | "in the long run, it supplies a positive amount if the price is greater than…" | the exit price | min LRAC: set $LRMC = LRAC$ |
      | "in the short run, it supplies zero below…" | the shutdown price (contrast!) | min AVC: set $MC = AVC$ |
      | "equilibrium price and quantity" | supply meets demand | $Q^D = Q^S$ |
      | "consumer surplus", "producer surplus", "social surplus" | triangles off the inverse curves | CS: demand above price; PS: supply below price; SS = CS + PS |
      | "price support: the government buys any excess supply" | a floor plus a buyer of last resort | producers sell $Q^S$, consumers buy $Q^D$, government buys the gap |
      | "change in social surplus" under a support | a Before / After / Change table | $SS = CS + PS - G$ |

      !!trap Shutdown versus exit
        **Short run:** fixed cost is already paid, so the firm stays open if $P \ge \min AVC$. **Long run:** every cost can be avoided by leaving, so it stays only if $P \ge \min LRAC$.
    `),
    P({ src: 'DS9 Q1', title: 'The exit price',
      q: md`A perfectly competitive firm has the long-run cost function $C(q) = 2q^2 + 8$. In the long run, it will supply a positive amount of output if the price is greater than what amount?`,
      plan: PLAN_EXIT,
      parts: [X('LRAC(q)', '2*q + 8/q', { q: [1, 9] }), X('LRMC(q)', '4*q', { q: [1, 9] }), N('q\\text{ at min }LRAC', 2), N('\\text{exit price}', 8),
        FIX('At a price of exactly \\$8, the firm…', ['earns zero economic profit and is indifferent between staying and exiting', 'earns a positive economic profit', 'loses money and exits'], 0,
          [null, 'At min LRAC the price just covers cost per unit: profit is zero.', 'It covers every cost exactly, including the owner\'s opportunity costs, so it has no reason to leave.'])],
      sol: md`
        **Move 1: the two curves.**
        $$LRMC = \frac{dC}{dq} = 4q, \qquad LRAC = \frac{C(q)}{q} = 2q + \frac{8}{q}$$

        **Move 2: bottom of LRAC.** Marginal cost cuts average cost at its minimum, so set them equal:
        $$4q = 2q + \frac{8}{q}$$
        Take $2q$ from both sides, then multiply by $q$:
        $$2q = \frac{8}{q} \;\Rightarrow\; 2q^2 = 8 \;\Rightarrow\; q^2 = 4 \;\Rightarrow\; q = 2$$

        **Move 3: the exit price.** Plug $q = 2$ into either curve: $LRMC(2) = 4(2) = 8$, and $LRAC(2) = 4 + 4 = 8$ ✓.

        The firm produces if $P > \$8$. At \$8 it is indifferent (zero economic profit). Below \$8 every output loses money, and in the long run it can escape the loss by exiting.

        [[fig:exit]]

        **Contrast.** If the 8 were a short-run fixed cost already paid, the shutdown price would be min AVC $= \min 2q = 0$: the firm would operate at any positive price in the short run. The long run is stricter because nothing is sunk.
      `, figs: { exit: { svg: exitFig, cap: 'LRMC cuts LRAC at its bottom, (2, 8). Below the exit price of \\$8 the firm leaves the market in the long run.' } } }),
    G('m3_ds_exit', { need: 2 }),
    P({ src: 'DS9 Q2', title: 'Equilibrium and the surplus triangles',
      q: md`Consider the market for an agricultural commodity. Market demand is $Q^D(P) = 600 - 10P$ and market supply is $Q^S(P) = 10P$. **(a)** What are the equilibrium price and quantity? **(b)** What is the consumer surplus? **(c)** The producer surplus? **(d)** The social surplus?`,
      plan: [
        plan('Part (a): how do you find the equilibrium?', 'Set $Q^D = Q^S$, solve for $P$, then plug back in for $Q$', [
          ['Set $Q^D = 0$', 'That finds the choke price (60), where nobody buys. You need it for CS, but it is not the equilibrium.'],
          ['Add the two: $Q^D + Q^S$', 'The market clears where the amount buyers want equals the amount sellers offer, not where the two add to something.'],
          ['Set $P = MC$ for one firm', 'There is no firm cost here; the market supply curve already adds up the firms\' MC curves.'],
        ], '$600 - 10P = 10P \\Rightarrow P = 30$; $Q = 10(30) = 300$.'),
        plan('Parts (b)–(c): what shapes are CS and PS?', 'Two triangles out to $Q^* = 300$: CS between demand and the price, PS between the price and supply', [
          ['CS $= P^* \\times Q^*$', 'That rectangle is what consumers spend. CS is what they would have paid **minus** what they pay.'],
          ['CS = the whole area under demand out to $Q^*$', 'That is total willingness to pay (13,500). Subtract spending to get CS.'],
          ['PS $= \\tfrac12(300)(60)$, using the choke price as the height', 'The choke price belongs to demand. PS runs from the supply curve (which starts at 0) up to the price, 30.'],
        ], 'Inverse demand $P = 60 - Q/10$ starts at 60; inverse supply $P = Q/10$ starts at 0. CS $= \\tfrac12(300)(60 - 30)$, PS $= \\tfrac12(300)(30)$.'),
      ],
      parts: [N('P^*', 30), N('Q^*', 300), N('CS', 4500), N('PS', 4500), N('SS', 9000)],
      sol: md`
        **Move 1: equilibrium (a).** Set demand equal to supply:
        $$600 - 10P = 10P \;\Rightarrow\; 600 = 20P \;\Rightarrow\; P^* = 30$$
        $Q^* = 10(30) = 300$ (check with demand: $600 - 300 = 300$ ✓).

        **Move 2: invert the curves** to read heights. Demand: $Q = 600 - 10P \Rightarrow P = 60 - Q/10$, so the choke price is 60. Supply: $Q = 10P \Rightarrow P = Q/10$, starting at 0.

        **Move 3: CS (b).** Triangle under demand, above the price, out to 300:
        $$CS = \tfrac12(300)(60 - 30) = 4500$$

        **Move 4: PS (c).** Triangle above supply, below the price, out to 300:
        $$PS = \tfrac12(300)(30 - 0) = 4500$$

        **Move 5: SS (d).** $SS = CS + PS = 4500 + 4500 = 9000$.

        [[fig:mkt]]
      `, figs: { mkt: { svg: mktFig, cap: 'Blue: consumer surplus, $\\tfrac12(300)(30) = 4500$. Green: producer surplus, $\\tfrac12(300)(30) = 4500$.' } } }),
    P({ src: 'DS9 Q3a–3c', title: 'Price support: who buys what',
      q: md`Same market: $Q^D = 600 - 10P$, $Q^S = 10P$ (equilibrium \$30 and 300 units). The government sets a **price support**: a price floor at \$45, and it promises to buy any excess supply. **(a)** How many units will producers sell? **(b)** Of the units sold by producers, how many are bought by consumers and how many by the government? **(c)** What is government expenditure?`,
      plan: [
        PLAN_SUPPORT,
        plan('Part (c): how much does the government spend?', 'The support price times what it buys: $45 \\times (Q^S - Q^D)$', [
          ['$(45 - 30) \\times 300$', 'The government pays the full \\$45 for each unit it buys, not just the markup over the old price.'],
          ['$45 \\times 450$', 'Consumers pay for their 150 units themselves; the government pays only for its 300.'],
          ['$\\tfrac12 \\times 300 \\times 15$', 'Spending is price times quantity: a rectangle, not a triangle.'],
        ], '$G = 45 \\times 300$.'),
      ],
      parts: [N('Q^S\\text{ (producers sell)}', 450), N('Q^D\\text{ (consumers buy)}', 150), N('\\text{government buys}', 300), N('G', 13500)],
      sol: md`
        **Move 1: producers (a).** At \$45 they sell all they want, because the government stands ready to buy whatever is left: $Q^S(45) = 10(45) = 450$.

        **Move 2: consumers (b).** They buy what they want at \$45: $Q^D(45) = 600 - 10(45) = 150$. The government buys the rest: $450 - 150 = 300$.

        **Move 3: spending (c).**
        $$G = 45 \times (450 - 150) = 45 \times 300 = \$13{,}500$$

        **Does this make sense?** Producers expand (300 → 450), consumers cut back (300 → 150), and the gap between them, 300 units, is exactly what the government ends up holding.
      ` }),
    P({ src: 'DS9 Q3d–3f', title: 'Price support: the welfare table',
      q: md`Same support at \$45: producers sell 450, consumers buy 150, the government buys 300 for \$13,500. Before the policy $CS = PS = 4500$. **(d)** What is the change in consumer surplus? **(e)** The change in producer surplus? **(f)** The change in social surplus? Fill in a Before / After / Change table for CS, PS, G and SS.`,
      plan: [
        plan('Part (d): which triangle is the new CS?', 'Under demand, above \\$45, out to the 150 units consumers buy: $\\tfrac12(150)(60 - 45)$', [
          ['Out to 450, the units producers sell', 'Consumers buy only 150. The other 300 go to the government, and no consumer enjoys them.'],
          ['Height $45 - 30$, the price increase', 'CS runs from the price consumers pay up to the demand curve (60 at the axis), not between the old and new prices.'],
          ['Unchanged, because the government pays', 'Consumers pay \\$45 a unit themselves now; the government only buys the leftovers.'],
        ], 'New CS $= 1125$. Change $= 1125 - 4500$.'),
        plan('Part (e): which triangle is the new PS?', 'Above supply, below \\$45, out to the 450 units producers sell: $\\tfrac12(450)(45)$', [
          ['Out to 150, the units consumers buy', 'Producers sell 450: 150 to consumers and 300 to the government, all at \\$45.'],
          ['The rectangle $45 \\times 450$', 'That is revenue. PS subtracts the cost of producing, the area under supply.'],
          ['Height $45 - 30$', 'PS runs from the supply curve (starting at 0 here) up to the price, not from the old price.'],
        ], 'New PS $= 10{,}125$. Change $= 10{,}125 - 4500$.'),
        PLAN_G,
      ],
      parts: [N('CS\\text{ after}', 1125), N('\\Delta CS', -3375), N('PS\\text{ after}', 10125), N('\\Delta PS', 5625), N('SS\\text{ after}', -2250), N('\\Delta SS', -11250)],
      sol: md`
        **Move 1: new CS (d).** $CS = \tfrac12(150)(60 - 45) = \tfrac12(150)(15) = 1125$. Change: $1125 - 4500 = -3375$.

        **Move 2: new PS (e).** $PS = \tfrac12(450)(45 - 0) = 10{,}125$. Change: $10{,}125 - 4500 = +5625$.

        [[fig:wel]]

        **Move 3: social surplus (f).** Government spending is a cost to taxpayers, so it enters with a minus sign:
        $$SS = CS + PS - G = 1125 + 10{,}125 - 13{,}500 = -2250$$

        | Surplus | Before | After | Change |
        |---|---|---|---|
        | CS | 4500 | 1125 | −3375 |
        | PS | 4500 | 10,125 | +5625 |
        | G | 0 | −13,500 | −13,500 |
        | SS | 9000 | −2250 | −11,250 |

        **Where do the 11,250 go?** Two wastes, each a trapezoid of 5625:

        - The 150 units consumers no longer buy (300 → 150) were worth the area under demand there: $\tfrac12(45 + 30)(150) = 5625$.
        - The extra 150 units producers now make (300 → 450) cost the area under supply there: $\tfrac12(30 + 45)(150) = 5625$, and the government holds them.

        $5625 + 5625 = 11{,}250$ ✓.

        [[fig:loss]]
      `, figs: { wel: { svg: supWelFig, cap: 'After the support: CS (blue) shrinks to $\\tfrac12(150)(15) = 1125$; PS (green) grows to $\\tfrac12(450)(45) = 10{,}125$.' },
        loss: { svg: supLossFig, cap: 'Dashed purple: what the government spends, $45 \\times 300$. Red: the social surplus lost, the area under the V between 150 and 450, $11{,}250$.' } } }),
    G('m3_ds_support', { need: 2 }),
    R(md`
      !!key DS9 in three lines
        **Exit price** $= \min LRAC$, from $LRMC = LRAC$. (Shutdown price $= \min AVC$ is the short-run version.)

        **Surplus triangles:** CS from the price up to demand; PS from supply up to the price; both out to the quantity each side actually trades.

        **Price support:** producers sell $Q^S$, consumers buy $Q^D$, $G$ = support price × gap, and $SS = CS + PS - G$.
    `),
  ];

  // ------------------------------------------------------------------ DS10 figures
  // Q1: P = 500 - 2Q, MC = Q. Monopoly (100, 300); efficient Q = 500/3. With a 40% ad valorem tax: Q = 300/3.4
  const Qe1 = 500 / 3, Qt1 = 300 / 3.4, Pc1 = 500 - 2 * Qt1, Pp1 = 0.6 * Pc1;
  const monoFig = EC.graph({
    w: 330, h: 270, x: [0, 265], y: [0, 530], xl: 'Q', yl: 'P', xt: [100, [Qe1, '\\tfrac{500}{3}'], 250], yt: [100, 300, 500],
    items: [
      { poly: [[0, 300], [0, 500], [100, 300]], cls: 'cs' },
      { poly: [[0, 0], [0, 300], [100, 300], [100, 100]], cls: 'gain' },
      { poly: [[100, 300], [100, 100], [Qe1, Qe1]], cls: 'loss' },
      { seg: [[0, 500], [250, 0]], cls: 'curve', lab: 'D', at: 0.92, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 500], [125, 0]], cls: 'curve c4', lab: 'MR', at: 0.9, dx: 4, dy: 0, anchor: 'l' },
      { seg: [[0, 0], [265, 265]], cls: 'curve c5', lab: 'MC', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { pt: [100, 300], guide: true }, { pt: [100, 100], guide: 'y' }, { pt: [Qe1, Qe1] },
      { text: [30, 350], t: 'CS' }, { text: [45, 210], t: 'PS' }, { text: [128, 190], t: '\\text{DWL}' },
    ],
  });
  const taxFig = EC.graph({
    w: 330, h: 270, x: [0, 265], y: [0, 530], xl: 'Q', yl: 'P', xt: [[Qt1, 'Q^t'], [Qe1, '\\tfrac{500}{3}']], yt: [[Pp1, 'P_p'], [Pc1, 'P_c']],
    items: [
      { poly: [[0, Pp1], [Qt1, Pp1], [Qt1, Pc1], [0, Pc1]], cls: 'ex' },
      { poly: [[Qt1, Pc1], [Qt1, Qt1], [Qe1, Qe1]], cls: 'loss' },
      { seg: [[0, 500], [250, 0]], cls: 'curve', lab: 'D', at: 0.92, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 300], [250, 0]], cls: 'curve c2 dash', lab: '0.6D', at: 0.85, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 300], [125, 0]], cls: 'curve c4', lab: 'MR_{\\text{eff}}', at: 0.9, dx: 4, dy: 0, anchor: 'l' },
      { seg: [[0, 0], [265, 265]], cls: 'curve c5', lab: 'MC', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { pt: [Qt1, Pc1], guide: 'x' }, { pt: [Qt1, Pp1] }, { pt: [Qt1, Qt1] },
      { text: [44, 260], t: '\\text{tax}' }, { text: [118, 200], t: '\\text{DWL}' },
    ],
  });

  // ------------------------------------------------------------------ DS10 plan steps
  const PLAN_MRMC = plan('How do you find the monopoly quantity?', '$MR = MC$, with MR from the demand curve (same intercept, twice the slope)', [
    ['$P = MC$', 'That is the competitive outcome. A monopolist knows one more unit lowers the price on every unit, so it stops where MR, not P, meets MC.'],
    ['$MR = MC$ using the demand curve as MR', 'Demand is $P(Q)$. For $P = a - bQ$, $MR = a - 2bQ$: twice as steep.'],
    ['$MR = 0$ (maximize revenue)', 'That ignores cost. The last unit must also cover its marginal cost.'],
  ], 'Write $MR$, set it equal to $MC$, solve for $Q$. Then read the price off the demand curve, not off MR.');
  const PLAN_DWL = plan('Which triangle is the deadweight loss?', 'Between demand and MC, from the quantity actually sold out to the efficient quantity where demand meets MC', [
    ['Between demand and MR', 'MR is neither a value nor a cost. Lost surplus is value (demand height) minus cost (MC) on the units not made.'],
    ['Height = monopoly price minus competitive price', 'That is only the consumers\' part. At the quantity sold the full gap is demand height minus MC.'],
    ['Out to where demand hits zero', 'Units past the efficient quantity cost more than they are worth, so they are not lost surplus.'],
  ], 'Efficient $Q$: demand = MC. DWL $= \\tfrac12 \\times (Q^{\\text{eff}} - Q) \\times (P_c - MC(Q))$.');
  const PLAN_ADV = plan('A tax of $v$ (ad valorem) on consumers: how do you build the demand the firm faces?', 'The firm keeps $P_p = (1 - v)P_c$: multiply the whole inverse demand by $1 - v$', [
    ['Subtract $v$ from the demand curve', 'An ad valorem rate is a percentage of the price, not a fixed number of dollars. Subtracting a constant is a specific tax.'],
    ['Multiply demand by $1 + v$', 'The tax takes a share of what buyers pay; the firm keeps less. The formula sheet: $P_p = (1 - v)P_c$.'],
    ['Leave demand alone, since the tax is on consumers', 'Who writes the check does not matter: either way the firm can keep only $(1 - v)$ of each dollar buyers pay.'],
  ], 'Effective demand $(1 - v)P(Q)$. Its MR is $(1 - v)$ times the old MR. Set that equal to MC.');
  const PLAN_PCPP = plan('After you find the taxed $Q$, where do the two prices come from?', '$P_c$ from the original demand; $P_p = (1 - v)P_c$ (or the effective demand)', [
    ['$P_c$ from the effective demand', 'The effective demand gives what the firm keeps, $P_p$. Buyers pay the original demand height.'],
    ['$P_p$ from the original demand', 'That is what buyers pay. The firm keeps only the $(1 - v)$ share.'],
    ['$P_c = (1 + v)P_p$', 'The tax is $v$ of the **consumer** price, so $P_c = P_p/(1 - v)$, which is more than $(1 + v)P_p$.'],
  ], 'Plug $Q$ into $P(Q)$ for $P_c$; multiply by $1 - v$ for $P_p$.');

  // ------------------------------------------------------------------ DS10 generators
  gen('m3_ds_mono_tax', () => {
    const sets = [{ b: 1, c: 1, u: 0.5, as: [120, 240, 300, 360, 600] }, { b: 1, c: 1, u: 0.75, as: [120, 240, 300, 360, 600] },
      { b: 2, c: 1, u: 0.5, as: [150, 300, 450, 600] }, { b: 1, c: 2, u: 0.5, as: [120, 240, 360, 480, 600] }];
    const { b, c, u, as } = pick(sets), a = pick(as), v = 1 - u;
    const B = b === 1 ? '' : b, Cq = c === 1 ? 'Q' : `${c}Q`;
    const Qm = a / (2 * b + c), Pm = a - b * Qm, Qe = a / (b + c), Qt = u * a / (2 * b * u + c), Pc = a - b * Qt, Pp = u * Pc;
    const dwl0 = 0.5 * (Qe - Qm) * (Pm - c * Qm), dwl1 = 0.5 * (Qe - Qt) * (Pc - c * Qt);
    return {
      title: 'Monopoly with an ad valorem tax (DS10 Q1, new numbers)',
      q: md`A monopolist faces $P(Q) = ${a} - ${B}Q$ and has $MC(Q) = ${Cq}$. (a) Find its price and quantity. Then the government puts a ${F(v * 100)}% ad valorem tax on consumers. (b) Find the effective MR, the taxed quantity, the price consumers pay and the price the monopolist keeps. (c) Find the deadweight loss before and after the tax.`,
      plan: [PLAN_MRMC, PLAN_ADV, PLAN_PCPP, PLAN_DWL],
      parts: [N('Q^M', Qm), N('P^M', Pm), X('MR_{\\text{eff}}(Q)', `${F(u * a)} - ${F(2 * b * u)}*Q`, { Q: [0, a / b / 2] }), N('Q^t', Qt), N('P_c', Pc), N('P_p', Pp), N('DWL\\text{ before}', dwl0), N('DWL\\text{ after}', dwl1)],
      hints: [`$MR = ${a} - ${2 * b}Q$.`, `Effective demand $${F(u)}(${a} - ${B}Q) = ${F(u * a)} - ${F(u * b)}Q$, so $MR_{\\text{eff}} = ${F(u * a)} - ${F(2 * u * b)}Q$.`, `Efficient: $${a} - ${B}Q = ${Cq} \\Rightarrow Q = ${F(Qe)}$.`],
      sol: md`
        **Move 1: untaxed $MR = MC$.** $${a} - ${2 * b}Q = ${Cq} \Rightarrow ${2 * b + c}Q = ${a} \Rightarrow Q^M = ${F(Qm)}$. Price from demand: $P^M = ${a} - ${B ? `${b}(${F(Qm)})` : F(Qm)} = ${F(Pm)}$.

        **Move 2: effective demand and MR.** The firm keeps $P_p = ${F(u)}P_c$: $${F(u)}(${a} - ${B}Q) = ${F(u * a)} - ${F(u * b)}Q$, so $MR_{\text{eff}} = ${F(u * a)} - ${F(2 * u * b)}Q$.

        **Move 3: taxed $Q$.** $${F(u * a)} - ${F(2 * u * b)}Q = ${Cq} \Rightarrow ${F(2 * u * b + c)}Q = ${F(u * a)} \Rightarrow Q^t = ${F(Qt)}$.

        **Move 4: prices.** $P_c = ${a} - ${B ? `${b}(${F(Qt)})` : F(Qt)} = ${F(Pc)}$. $P_p = ${F(u)} \times ${F(Pc)} = ${F(Pp)}$.

        **Move 5: deadweight loss.** Efficient output: $${a} - ${B}Q = ${Cq} \Rightarrow Q = ${F(Qe)}$.
        Before: $\tfrac12(${F(Qe)} - ${F(Qm)})(${F(Pm)} - ${F(c * Qm)}) = ${F(dwl0)}$.
        After: $\tfrac12(${F(Qe)} - ${F(Qt)})(${F(Pc)} - ${F(c * Qt)}) = ${F(dwl1)}$. The tax shrinks output further, so the triangle grows.
      `,
    };
  });

  // ------------------------------------------------------------------ DS10 Q2: natural monopoly P = 28 - Q, C = 80 + 4Q
  const natBase = [
    { seg: [[0, 28], [28, 0]], cls: 'curve', lab: 'D', at: 0.93, dx: 4, dy: -4, anchor: 'bl' },
    { seg: [[0, 28], [14, 0]], cls: 'curve c4', lab: 'MR', at: 0.85, dx: 4, dy: 0, anchor: 'l' },
    { seg: [[0, 4], [30, 4]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
    { f: (x) => 4 + 80 / x, from: 3.1, to: 30, cls: 'c2', lab: 'AC', labX: 30, dx: -2, dy: -6, anchor: 'br' },
    { pt: [12, 16], lab: 'M', at: 'tr' },
  ];
  const natFigMC = EC.graph({
    w: 330, h: 260, x: [0, 30.5], y: [0, 30], xl: 'Q', yl: 'P', xt: [12, 24], yt: [4, [22 / 3, '7.33'], 16],
    items: [{ poly: [[0, 4], [24, 4], [24, 22 / 3], [0, 22 / 3]], cls: 'loss' }, ...natBase, { pt: [24, 4], guide: 'x' }, { pt: [24, 22 / 3] }, { text: [12, 5.7], t: '\\pi = -80' }],
  });
  const natFigAC = EC.graph({
    w: 330, h: 260, x: [0, 30.5], y: [0, 30], xl: 'Q', yl: 'P', xt: [4, 20, 24], yt: [4, 8, 24],
    items: [{ poly: [[20, 8], [20, 4], [24, 4]], cls: 'loss' }, ...natBase, { pt: [20, 8], lab: '(20,\\,8)', at: 'tr', guide: true }, { pt: [4, 24], lab: '(4,\\,24)', at: 'tr', guide: true }],
  });
  const PLAN_MCCEIL = (c, Qc) => plan('A price ceiling at $P = MC$: where does the firm end up?', `MC is a constant ${c}, so the ceiling is \\$${c}, and the quantity comes from demand at that price: ${Qc}`, [
    ['$MR = MC$ again', 'That is the unregulated monopoly. With a ceiling the firm cannot charge more than MC, so it sells what buyers want at that price.'],
    ['$P = AC$', 'That is a different rule (the average-cost ceiling).'],
    ['Keep the monopoly quantity and charge the ceiling price', 'At the ceiling buyers want more, and each extra unit still covers its MC, so the regulated firm serves them all.'],
  ], `Set $P(Q) = ${c}$ and solve for $Q$.`);
  const PLAN_MCPROFIT = (Fx) => plan('What is profit at the $P = MC$ ceiling?', `Negative: $\\pi = -${Fx}$, the whole fixed cost`, [
    ['Zero, because $P = MC$', '$P = MC$ means no margin on any unit, which covers the variable cost only. The fixed cost is never paid.'],
    ['Positive, because it sells more', 'Selling more at a price equal to MC adds nothing to profit.'],
    ['$(P - MC)Q = 0$', 'That formula leaves out the fixed cost. Use $TR - TC$ or $(P - AC)Q$.'],
  ], `$TR - TC = cQ - (${Fx} + cQ) = -${Fx}$ when the price is the constant MC $c$.`);
  const PLAN_LR = (Fx) => plan('What does the firm do in the long run under the $P = MC$ ceiling?', `Exit, unless the government covers the loss with a subsidy of at least ${Fx}`, [
    ['Keep operating because $P \\ge AVC$', 'That is the short-run shutdown test. In the long run the fixed cost can be avoided by leaving, so the firm needs $P \\ge AC$.'],
    ['Raise its price to cover cost', 'The ceiling forbids it.'],
    ['Expand until AC falls to MC', 'With $C = F + cQ$, $AC = c + F/Q$ is above $c$ at every output. It never gets there.'],
  ], 'Persistent losses: exit in the long run, or a subsidy equal to the fixed cost.');
  const PLAN_ACEQ = (dem, ac, quad) => plan('A ceiling at $P = AC$: what equation do you solve?', `Demand = AC: $${dem} = ${ac}$, then multiply through by $Q$`, [
    ['$MC = AC$', 'With constant MC, $AC = c + F/Q$ is always above MC: they never meet. That is what makes this a natural monopoly.'],
    ['$MR = AC$', 'The regulated price is a point on the demand curve: buyers pay $P(Q)$, and the regulator sets it equal to cost per unit.'],
    ['$AC = 0$', 'AC is never zero; you want the price that just covers it.'],
  ], `This gives $${quad}$. Use the quadratic formula.`);
  const PLAN_ROOT = (r1, r2, Psm, Pm) => plan(`The quadratic gives $Q = ${r1}$ and $Q = ${r2}$. Which one?`, `$Q = ${r2}$, the larger root: lower price, more output`, [
    [`$Q = ${r1}$, the first root`, `At $Q = ${r1}$ the price would be ${Psm}, above the unregulated monopoly price of ${Pm}: a ceiling there would not even bind.`],
    ['Either one: both give zero profit', 'The firm does not care, but buyers do: the larger root has the much lower price and the smaller deadweight loss.'],
    ['The midpoint of the two roots', 'The midpoint is the unregulated monopoly output, where price is above AC (positive profit), not equal to it.'],
  ], `$Q = ${r2}$; the price is the demand height there.`);
  const PLAN_REGDWL = (Qr, Qc) => plan('Which triangle is the remaining deadweight loss?', `Between demand and MC, from the regulated $Q = ${Qr}$ out to the efficient $Q = ${Qc}$`, [
    ['Between demand and AC', 'AC is not the cost of one more unit. A unit is worth making if buyers value it above its MC.'],
    ['Zero, because profit is zero', 'Zero profit is not efficiency. The units between the regulated and the efficient quantity are worth more than they cost and are not made.'],
    ['From the unregulated quantity to the efficient one', 'That is the unregulated DWL. The ceiling already moved output up.'],
  ], `DWL $= \\tfrac12(${Qc} - ${Qr})(P - MC)$ with $P$ the regulated price.`);

  gen('m3_ds_natmono', () => {
    const b = pick([1, 1, 2]), c = pick([2, 4, 5, 6, 10]), r1 = pick([2, 3, 4, 5, 6]), d = pick([4, 6, 8, 10, 12, 14]), r2 = r1 + d;
    const a = c + b * (r1 + r2), Fx = b * r1 * r2, Qm = (r1 + r2) / 2, Pm = a - b * Qm, Qc = r1 + r2, Pac = a - b * r2, Psm = a - b * r1;
    const piM = Pm * Qm - Fx - c * Qm, dwlM = 0.5 * (Qc - Qm) * (Pm - c), dwlA = 0.5 * (Qc - r2) * (Pac - c);
    const B = b === 1 ? '' : b, quad = b === 1 ? `Q^2 - ${a - c}Q + ${Fx} = 0` : `${b}Q^2 - ${a - c}Q + ${Fx} = 0`;
    return {
      title: 'Regulating a natural monopoly (DS10 Q2, new numbers)',
      q: md`A natural monopoly faces $P(Q) = ${a} - ${B}Q$ and has total cost $C(Q) = ${Fx} + ${c}Q$. Find (a) the unregulated $Q$, $P$ and DWL; (b) the outcome and profit under a $P = MC$ ceiling; (c) the outcome and remaining DWL under a $P = AC$ ceiling.`,
      plan: [PLAN_MRMC, PLAN_MCCEIL(c, Qc), PLAN_ACEQ(`${a} - ${B}Q`, `${c} + \\dfrac{${Fx}}{Q}`, quad), PLAN_ROOT(r1, r2, Psm, Pm), PLAN_REGDWL(r2, Qc)],
      parts: [N('Q^M', Qm), N('P^M', Pm), N('DWL^M', dwlM), N('Q\\text{ at }P = MC', Qc), N('\\pi\\text{ at }P = MC', -Fx), N('Q\\text{ at }P = AC', r2), N('P\\text{ at }P = AC', Pac), N('DWL\\text{ at }P = AC', dwlA)],
      hints: [`$MR = ${a} - ${2 * b}Q$, $MC = ${c}$.`, `Demand = AC gives $${quad}$, with roots ${r1} and ${r2}.`],
      sol: md`
        **Move 1: unregulated.** $${a} - ${2 * b}Q = ${c} \Rightarrow Q^M = ${F(Qm)}$, $P^M = ${F(Pm)}$, profit $${F(Pm)}(${F(Qm)}) - ${Fx} - ${c}(${F(Qm)}) = ${F(piM)}$. Efficient: $${a} - ${B}Q = ${c} \Rightarrow Q = ${Qc}$. $DWL = \tfrac12(${Qc} - ${F(Qm)})(${F(Pm)} - ${c}) = ${F(dwlM)}$.

        **Move 2: $P = MC$ ceiling.** $P = ${c}$, $Q = ${Qc}$. $\pi = ${c}(${Qc}) - (${Fx} + ${c}(${Qc})) = -${Fx}$: the firm loses its fixed cost and exits in the long run without a subsidy.

        **Move 3: $P = AC$ ceiling.** $${a} - ${B}Q = ${c} + \dfrac{${Fx}}{Q}$. Multiply by $Q$ and collect: $${quad}$. Roots: $Q = ${r1}$ and $Q = ${r2}$. Take $Q = ${r2}$: $P = ${Pac}$ (check $AC(${r2}) = ${c} + ${Fx}/${r2} = ${F(c + Fx / r2)}$ ✓). The other root has price ${Psm}, above the monopoly price ${F(Pm)}, so that ceiling would not bind.

        **Move 4: remaining DWL.** $\tfrac12(${Qc} - ${r2})(${Pac} - ${c}) = ${F(dwlA)}$, down from ${F(dwlM)}.
      `,
    };
  });

  // ------------------------------------------------------------------ DS10
  const ds10 = [
    R(md`
      ### What this looks like on the exam

      The DS10 handout has no posted solutions. Every answer below is worked from first principles and checked twice. If a step feels new, the matching lessons are [MR = MC](#/l/m3-mo2), [monopoly welfare](#/l/m3-mo3), [the ad valorem tax](#/l/m3-mt2) and [regulating a natural monopoly](#/l/m3-rg2).

      | The question says… | It is really asking… | The move |
      |---|---|---|
      | "a monopolist faces $P(Q) = \ldots$ with marginal cost…" | the monopoly optimum | $MR = MC$ ($MR = a - 2bQ$), then $P$ from demand |
      | "deadweight loss created by market power" | the triangle between demand and MC | from $Q^M$ to where demand meets MC |
      | "an ad valorem tax of 40% on consumers" | the firm keeps 60% of each dollar | effective demand $0.6P(Q)$, effective MR $0.6MR$ |
      | "price consumers pay, price the monopolist receives" | the wedge | $P_c$ from demand, $P_p = (1 - v)P_c$ |
      | "natural monopoly", "$C = F + cQ$" | AC falls forever, MC is flat below it | MC ceiling loses $F$; AC ceiling breaks even |
      | "price ceiling where $P = AC$" | demand = AC, a quadratic | take the larger root (lower price, more output) |
      | "deadweight loss remaining" | triangle from the regulated $Q$ to the efficient $Q$ | between demand and MC |
    `),
    P({ src: 'DS10 Q1a–1b', title: 'Monopoly price, quantity and DWL',
      q: md`A monopolist faces the demand curve $P(Q) = 500 - 2Q$ and has marginal cost $MC(Q) = Q$. **(a)** What are the equilibrium price and quantity? **(b)** What is the deadweight loss created by the monopolist's market power?`,
      plan: [
        PLAN_MRMC,
        plan('Once you have $Q = 100$, where do you read the price?', 'On the demand curve: $P = 500 - 2(100)$', [
          ['On the MR curve: $500 - 4(100) = 100$', 'MR is not a price anyone pays. The monopolist charges the most buyers will pay for 100 units: the demand height.'],
          ['On the MC curve: $P = 100$', 'That is the cost of the 100th unit. The price is far above it; that gap is market power.'],
          ['At the height where MR and MC cross', 'The crossing (100) is MC at the optimum, not the price.'],
        ], '$P = 500 - 200 = 300$.'),
        PLAN_DWL,
      ],
      parts: [N('Q^M', 100), N('P^M', 300), N('Q^{\\text{eff}}\\ (\\text{demand} = MC)', 500 / 3), N('DWL', 20000 / 3)],
      hints: ['$TR = (500 - 2Q)Q = 500Q - 2Q^2$.', 'At $Q = 100$, $MC = 100$.'],
      sol: md`
        **Move 1: MR.** $TR = P(Q) \cdot Q = 500Q - 2Q^2$, so
        $$MR = \frac{dTR}{dQ} = 500 - 4Q$$
        Same intercept as demand, twice the slope.

        **Move 2: $MR = MC$.**
        $$500 - 4Q = Q \;\Rightarrow\; 500 = 5Q \;\Rightarrow\; Q^M = 100$$

        **Move 3: price from demand.** $P^M = 500 - 2(100) = 300$.

        **Move 4: the efficient benchmark.** A competitive market (or a planner) produces until price equals MC:
        $$500 - 2Q = Q \;\Rightarrow\; Q = \frac{500}{3} \approx 166.67, \qquad P = 166.67$$

        **Move 5: DWL.** At $Q^M = 100$ buyers value the next unit at 300 but it costs only $MC(100) = 100$. The gap closes linearly to zero at $Q = 166.67$, so the lost surplus is a triangle:
        $$DWL = \tfrac12\left(\tfrac{500}{3} - 100\right)(300 - 100) = \tfrac12(66.67)(200) \approx 6666.67$$

        **Check by totals.** Efficient welfare = area between demand and MC out to $500/3$: $\tfrac12(500/3)(500) = 41{,}666.67$. Monopoly: $CS = \tfrac12(100)(500 - 300) = 10{,}000$; $PS = TR - VC = 30{,}000 - \tfrac12(100)^2 = 25{,}000$; total 35,000. Difference $= 6666.67$ ✓.

        [[fig:m]]
      `, figs: { m: { svg: monoFig, cap: 'Monopoly at (100, 300), where MR (purple) meets MC (red) at a height of 100. Blue: CS. Green: PS. Red: the DWL triangle between demand and MC from 100 to 500/3.' } } }),
    P({ src: 'DS10 Q1c–1e', title: 'A 40% ad valorem tax on consumers',
      q: md`Same monopolist: $P(Q) = 500 - 2Q$, $MC(Q) = Q$. The government imposes a **40% ad valorem tax on consumers** (course convention: $P_p = (1 - v)P_c$). **(c)** What are the effective demand and effective marginal revenue functions? **(d)** Find the equilibrium quantity, the price consumers pay and the price the monopolist receives. **(e)** Calculate the after-tax deadweight loss.`,
      plan: [PLAN_ADV, PLAN_PCPP,
        plan('Part (e): the after-tax DWL is measured against which quantity?', 'The efficient quantity, where demand meets MC: $500/3$', [
          ['The untaxed monopoly quantity, 100', 'That measures only the **extra** loss the tax adds (about 2560). DWL compares with the efficient outcome.'],
          ['Where the effective demand meets MC', 'Effective demand is what the firm keeps, not what units are worth to buyers. The tax revenue is a transfer that still counts in welfare.'],
          ['Subtract the tax revenue from welfare as a loss', 'Tax revenue goes to the government and counts in total welfare. Only the units no longer made are lost.'],
        ], 'DWL $= \\tfrac12(500/3 - Q^t)(P_c - MC(Q^t))$.'),
      ],
      parts: [X('P_p(Q)\\ \\text{(effective demand)}', '300 - 1.2*Q', { Q: [0, 200] }), X('MR_{\\text{eff}}(Q)', '300 - 2.4*Q', { Q: [0, 120] }),
        N('Q^t', Qt1), N('P_c', Pc1), N('P_p', Pp1), N('DWL\\text{ after tax}', 0.5 * (Qe1 - Qt1) * (Pc1 - Qt1))],
      hints: ['$0.6(500 - 2Q) = 300 - 1.2Q$.', '$300 - 2.4Q = Q$.'],
      sol: md`
        **Move 1: effective demand (c).** Buyers still pay the demand height $P_c = 500 - 2Q$. Of each dollar, the government takes 40 cents, so the firm keeps 60%:
        $$P_p(Q) = (1 - 0.4)(500 - 2Q) = 300 - 1.2Q$$

        **Move 2: effective MR (c).** Same intercept, twice the slope:
        $$MR_{\text{eff}}(Q) = 300 - 2.4Q$$
        (Or: the firm's revenue is $(300 - 1.2Q)Q$; differentiate.)

        **Move 3: effective MR = MC (d).**
        $$300 - 2.4Q = Q \;\Rightarrow\; 300 = 3.4Q \;\Rightarrow\; Q^t = \frac{300}{3.4} \approx 88.24$$

        **Move 4: the two prices (d).** Buyers pay the demand height: $P_c = 500 - 2(88.24) \approx 323.53$. The firm keeps 60%: $P_p = 0.6(323.53) \approx 194.12$ (check on the effective demand: $300 - 1.2(88.24) = 194.12$ ✓). The tax per unit is $323.53 - 194.12 = 129.41$.

        **Move 5: after-tax DWL (e).** Efficient output is still $500/3 \approx 166.67$: the tax changes who gets the money, not what units are worth or cost. At $Q^t$ the gap between demand and MC is $323.53 - 88.24 = 235.29$:
        $$DWL = \tfrac12(166.67 - 88.24)(235.29) = \tfrac12(78.43)(235.29) \approx 9227.2$$

        **Does this make sense?** The tax pushes output down from 100 to 88.24, further from the efficient 166.67, so the DWL grows from 6666.67 to 9227.2. Buyers pay more (300 → 323.53), the firm keeps less (300 → 194.12), and the government collects $129.41 \times 88.24 \approx 11{,}418.7$.

        [[fig:t]]
      `, figs: { t: { svg: taxFig, cap: 'Dashed orange: effective demand 0.6D. Purple: effective MR. Gray: tax revenue between $P_c$ and $P_p$. Red: DWL from $Q^t$ to 500/3, between demand and MC.' } } }),
    G('m3_ds_mono_tax', { need: 2 }),
    P({ src: 'DS10 Q2a–2c', title: 'Natural monopoly: a ceiling at P = MC',
      q: md`A natural monopoly provides local water distribution. Market inverse demand is $P(Q) = 28 - Q$ and the firm's total cost is $C(Q) = 80 + 4Q$. The unregulated monopolist produces $Q = 12$, charges $P = 16$, and creates a deadweight loss of 72.

      **(a)** Regulators set a price ceiling equal to marginal cost ($P = MC$). What are the regulated price and quantity? **(b)** Calculate the monopolist's economic profit at that price and quantity. **(c)** What would the firm do in the long run if this regulation were maintained? Explain briefly.`,
      plan: [PLAN_MCCEIL(4, 24), PLAN_MCPROFIT(80), PLAN_LR(80)],
      parts: [N('P', 4), N('Q', 24), N('\\pi', -80),
        FIX('In the long run, with the $P = MC$ ceiling kept and no subsidy, the firm…', ['exits: it loses 80 every period', 'stays: price covers marginal cost', 'stays and grows until AC falls to 4'], 0,
          [null, 'Covering MC covers the variable cost only. In the long run the 80 can be avoided by leaving.', 'AC $= 4 + 80/Q$ is above 4 at every output: it never gets there.'])],
      sol: md`
        **Move 0: read the cost.** $C = 80 + 4Q$: fixed cost 80 (the pipes), $MC = 4$ (constant), $AC = 4 + 80/Q$. AC falls at every output and always sits above MC: one firm can serve the whole market more cheaply than two. That is a **natural monopoly**.

        **Move 1: the ceiling (a).** MC is a flat 4, so the ceiling is \$4. The firm cannot charge more, and every unit up to what buyers want at \$4 still covers its MC, so quantity comes from demand:
        $$28 - Q = 4 \;\Rightarrow\; Q = 24$$
        That is the efficient quantity: price equals MC.

        **Move 2: profit (b).** $TR = 4 \times 24 = 96$. $TC = 80 + 4(24) = 176$.
        $$\pi = 96 - 176 = -80$$
        Same thing as a rectangle: $AC(24) = 4 + 80/24 \approx 7.33$, so $\pi = (4 - 7.33)(24) = -80$. The firm covers its variable cost exactly and none of the 80 fixed cost.

        **Move 3: long run (c).** A loss of 80 every period. In the long run the 80 is not sunk (the firm can sell the pipes and leave), so it **exits**, unless the government pays a subsidy of at least 80 per period. A $P = MC$ ceiling gives the efficient quantity but cannot last on its own.

        [[fig:mc]]
      `, figs: { mc: { svg: natFigMC, cap: 'The ceiling at MC = 4 gives Q = 24 on demand. AC at 24 is 7.33, so the red rectangle is the loss: $(7.33 - 4) \\times 24 = 80$, exactly the fixed cost. M marks the unregulated monopoly (12, 16).' } } }),
    P({ src: 'DS10 Q2d–2f', title: 'Natural monopoly: a ceiling at P = AC',
      q: md`Same water utility: $P(Q) = 28 - Q$, $C(Q) = 80 + 4Q$ (unregulated: $Q = 12$, $P = 16$, DWL 72).

      **(d)** Regulators instead set a price ceiling where $P = AC$. Calculate the regulated price and quantity. **(e)** At the average-cost ceiling, calculate the firm's economic profit. What does it imply about the firm's long-run operation? **(f)** Calculate the deadweight loss remaining at the $P = AC$ ceiling. How does it compare with the unregulated deadweight loss?`,
      plan: [PLAN_ACEQ('28 - Q', '4 + \\dfrac{80}{Q}', 'Q^2 - 24Q + 80 = 0'), PLAN_ROOT(4, 20, 24, 16), PLAN_REGDWL(20, 24)],
      parts: [N('Q', 20), N('P', 8), N('\\pi', 0),
        FIX('In the long run under the $P = AC$ ceiling the firm…', ['stays: it covers all its costs (zero economic profit)', 'exits: zero profit is a loss', 'needs a subsidy to stay'], 0,
          [null, 'Zero **economic** profit already pays the owners what they could earn elsewhere: no reason to leave.', 'Price equals AC, so revenue covers every cost; no subsidy is needed.']),
        N('DWL\\text{ remaining}', 8),
        FIX('Compared with the unregulated DWL of 72, the remaining DWL is…', ['much smaller: 8', 'the same: regulation only moves money', 'larger: profit is now zero'], 0,
          [null, 'Output rose from 12 to 20, so most of the lost units are now made.', 'Welfare is about units made, not profit. 8 units more are made than before.'])],
      hints: ['Multiply $28 - Q = 4 + 80/Q$ through by $Q$.', '$Q = \\dfrac{24 \\pm \\sqrt{576 - 320}}{2}$.'],
      sol: md`
        **Move 1: set demand equal to AC (d).** The regulator picks the price at which the firm just covers its cost per unit:
        $$28 - Q = 4 + \frac{80}{Q}$$
        Multiply both sides by $Q$:
        $$28Q - Q^2 = 4Q + 80$$
        Move everything to one side:
        $$Q^2 - 24Q + 80 = 0$$

        **Move 2: quadratic formula.**
        $$Q = \frac{24 \pm \sqrt{24^2 - 4(80)}}{2} = \frac{24 \pm \sqrt{576 - 320}}{2} = \frac{24 \pm 16}{2}$$
        So $Q = 4$ or $Q = 20$.

        **Move 3: pick the root.** Take $Q = 20$, so $P = 28 - 20 = 8$ (check: $AC(20) = 4 + 4 = 8$ ✓). Why the larger root: at $Q = 4$ the price would be \$24, which is above the unregulated price of \$16, so a ceiling at \$24 would not even bind (the firm would just charge 16). The regulator wants the low price and the large output: \$8 and 20 units.

        **Move 4: profit (e).** $TR = 8 \times 20 = 160$, $TC = 80 + 4(20) = 160$, so $\pi = 0$. Zero **economic** profit means the owners earn exactly their opportunity cost: the firm **stays** in the long run with no subsidy.

        **Move 5: remaining DWL (f).** The efficient quantity is still 24 (demand = MC). Units 20 to 24 are worth more than their MC of 4 but are not made. At $Q = 20$ the gap is $8 - 4 = 4$:
        $$DWL = \tfrac12(24 - 20)(8 - 4) = 8$$
        Down from 72 unregulated. The AC ceiling gives up a small triangle of efficiency in exchange for a firm that survives without a subsidy.

        | Rule | $Q$ | $P$ | Profit | DWL |
        |---|---|---|---|---|
        | unregulated ($MR = MC$) | 12 | 16 | 64 | 72 |
        | $P = MC$ ceiling | 24 | 4 | −80 | 0 |
        | $P = AC$ ceiling | 20 | 8 | 0 | 8 |

        [[fig:ac]]
      `, figs: { ac: { svg: natFigAC, cap: 'Demand meets AC twice: (4, 24) and (20, 8). The ceiling uses the lower price, \\$8. Red: the remaining DWL, $\\tfrac12(4)(4) = 8$, between demand and MC from 20 to 24.' } } }),
    G('m3_ds_natmono', { need: 2 }),
    R(md`
      !!key DS10 in four lines
        **Monopoly:** $MR = MC$ (MR has twice the slope of linear demand), then the price from **demand**.

        **DWL:** the triangle between demand and MC, from the quantity sold to the efficient quantity.

        **Ad valorem tax $v$:** the firm faces $(1 - v)P(Q)$; set $(1 - v)MR = MC$; $P_c$ from demand, $P_p = (1 - v)P_c$.

        **Natural monopoly:** $P = MC$ is efficient but loses $F$; $P = AC$ breaks even (larger root of the quadratic) with a small DWL left.
    `),
  ];

  // ------------------------------------------------------------------ HW-style figures
  const greenFig = EC.graph({
    w: 330, h: 260, x: [0, 17], y: [0, 84], xl: 'L', yl: 'q', xt: [9, 16], yt: [27, 54, 72],
    items: [
      { f: (x) => 18 * Math.sqrt(x), from: 0, to: 16.5, lab: 'q = 18\\sqrt{L}', labX: 16.5, dx: -2, dy: 14, anchor: 'tr' },
      { seg: [[0, 27], [17, 78]], cls: 'curve c4', lab: 'q = 3L + 27', at: 0.6, dx: -6, dy: -4, anchor: 'br' },
      { pt: [9, 54], lab: '(9,\\,54)', at: 'br', guide: true },
    ],
  });
  const lrFig = EC.graph({
    w: 340, h: 270, x: [0, 1120], y: [0, 68], xl: 'Q', yl: 'P', xt: [600, 780, 900], yt: [20, 26],
    items: [
      { seg: [[0, 50], [1000, 0]], cls: 'curve', lab: 'D_1', at: 0.93, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 65], [1120, 9]], cls: 'curve c4', lab: 'D_2', at: 0.97, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 0], [1120, 112 / 3]], cls: 'curve c2', lab: 'S_{SR}\\ (120\\text{ firms})', at: 0.97, dx: -4, dy: -8, anchor: 'br' },
      { seg: [[0, 20], [1120, 20]], cls: 'curve c3 dash', lab: 'S_{LR}', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
      { pt: [600, 20], lab: 'A', at: 'bl', guide: 'x' }, { pt: [780, 26], lab: 'B', at: 'tl', guide: true }, { pt: [900, 20], lab: 'C', at: 'br', guide: 'x' },
    ],
  });

  // ------------------------------------------------------------------ HW-style set, part A (Lectures 14–16)
  const hwA = [
    R(md`
      ### How to use this page

      Fresh problems in the style of HW8–HW10 and the exam's written questions, in lecture order. Each card first asks **how** you would attack it. That is the skill the exam tests: look at a setup and know the technique. Do the numbers on paper, then check.

      ### Which tool when

      | You see… | The tool | Not this look-alike |
      |---|---|---|
      | a price taker choosing output | $P = MC$ | $P = AC$ (break-even), $MR = MC$ with MR below price (monopoly) |
      | a price taker choosing an input | $pMP = w$ | $MP = w$ (forgets the price) |
      | "will it operate this period?" | $P$ vs min **AVC** | min AC (that is profit vs loss) |
      | "will it stay in the long run?", "long-run price" | $P$ = min **LRAC** | min AVC (nothing is sunk in the long run) |
      | "how many firms?" | $n = Q/q^*$ at the long-run price | dividing by a short-run output |
      | a per-unit tax $t$ | wedge $P_c - P_p = t$ | adding $t$ to both curves |
      | a binding ceiling | traded $Q = Q^S$ (sellers are short) | $Q^D$ (buyers can't get it) |
      | a binding floor | traded $Q = Q^D$ (buyers are short) | $Q^S$ (unless the government buys: support) |
      | a monopolist | $MR = MC$, price from demand | $P = MC$, price from MR |
      | an ad valorem tax $v$ | $P_p = (1 - v)P_c$: scale demand | subtracting $v$ like a specific tax |
      | natural monopoly regulation | $P = MC$ loses $F$; $P = AC$: larger root | $MC = AC$ (they never meet) |
    `),
    P({ src: 'HW-style 1', title: 'Two kinds of profit (warm-up)',
      q: md`Maya runs a bike-repair shop. Last year it brought in \$180,000 of revenue and paid \$110,000 of explicit costs (rent, parts, a part-time helper). To run it she quit a job paying \$60,000 a year, and she put \$50,000 of her savings into tools; that money could have earned 4% a year in a bond fund.

      **(a)** Accounting profit? **(b)** Implicit costs? **(c)** Economic profit? **(d)** Should she stay in business? **(e)** Her old employer now offers \$75,000 a year. What is her economic profit now?`,
      plan: [
        plan('Part (a): what goes into accounting profit?', 'Revenue minus explicit costs only: the bills actually paid', [
          ['Revenue minus explicit costs minus her forgone salary', 'Forgone salary is an implicit cost: no check is written. It belongs in economic profit.'],
          ['Revenue minus explicit costs minus the \\$50,000 of savings', 'The savings are not used up; they are tied up in tools. Their yearly cost is the interest they could have earned.'],
          ['Revenue alone', 'Accounting profit still subtracts every bill paid.'],
        ], '$180{,}000 - 110{,}000$.'),
        plan('Parts (b)–(c): what are her implicit costs?', 'What her time and money would earn in their next-best use: the \\$60,000 salary plus \\$2,000 of forgone interest', [
          ['The \\$60,000 salary plus the whole \\$50,000', 'She still owns the tools. What she gives up each year is the 4% the money would have earned.'],
          ['Nothing: she pays herself nothing', 'That is exactly why her time is an implicit cost: she gave up a \\$60,000 job to do this.'],
          ['Only the \\$2,000 of interest', 'Her own time has an opportunity cost too: the salary she quit.'],
        ], 'Implicit $= 60{,}000 + 0.04(50{,}000)$. Economic profit = accounting profit − implicit costs.'),
      ],
      parts: [N('\\text{accounting profit}', 70000), N('\\text{implicit costs}', 62000), N('\\text{economic profit}', 8000),
        FIX('(d) Should she stay in business?', ['yes: economic profit is positive', 'no: her profit is less than her revenue', 'no: she could earn \\$60,000 elsewhere'], 0,
          [null, 'Revenue is not the benchmark. Economic profit already subtracts every cost, explicit and implicit.', 'Economic profit already counts the \\$60,000: after paying herself that and the interest she is still \\$8,000 ahead.']),
        N('\\text{(e) economic profit}', -7000)],
      sol: md`
        **Move 1: accounting profit (a).** Revenue minus the bills: $180{,}000 - 110{,}000 = \$70{,}000$.

        **Move 2: implicit costs (b).** Her time: the \$60,000 salary she gave up. Her money: 4% of \$50,000 $= \$2{,}000$ a year. Total $= \$62{,}000$.

        **Move 3: economic profit (c).** $70{,}000 - 62{,}000 = \$8{,}000$.

        **Move 4: decide (d).** Positive economic profit means the shop beats her best alternative by \$8,000 a year: stay.

        **Move 5: the new offer (e).** Implicit costs become $75{,}000 + 2{,}000 = 77{,}000$, so economic profit $= 70{,}000 - 77{,}000 = -\$7{,}000$. Her accounting profit is unchanged, but she would do \$7,000 better at the job: in the long run she should leave.
      ` }),
    P({ src: 'HW-style 2', title: 'Greenhouse: short-run labor and the isoprofit line',
      q: md`A greenhouse grows tomatoes with $q = 6\sqrt{LK}$, where $L$ is labor and $K$ is greenhouse space. Space is fixed in the short run at $\bar{K} = 9$. Tomatoes sell for \$2 a crate in a competitive market, labor costs $w = 6$ per unit and space rents for $r = 4$ per unit.

      **(a)** Write the short-run production function and $MP_L$. **(b)** Find $L^*$, $q^*$ and $\pi^*$. **(c)** Write the isoprofit line through the optimum and check that it is tangent to the production function.`,
      plan: [
        plan('Part (a): how do you get the short-run production function?', 'Plug in $\\bar{K} = 9$: $q = 6\\sqrt{9L} = 18\\sqrt{L}$', [
          ['Set $K = 0$ because it is fixed', 'Fixed means stuck at 9, not zero. With $K = 0$ there are no tomatoes.'],
          ['Use $MP_L/MP_K = w/r$', 'That is long-run cost minimization; space cannot change in the short run.'],
          ['Leave $K$ in and differentiate with respect to $K$', 'Space is not a choice in the short run.'],
        ], '$\\sqrt{9L} = 3\\sqrt{L}$. Then $MP_L = 18 \\cdot \\tfrac12 L^{-1/2} = 9/\\sqrt{L}$.'),
        plan('Part (b): which condition picks $L^*$?', '$p \\cdot MP_L = w$', [
          ['$MP_L = w$', 'Tomatoes and dollars are different units: multiply the extra crates by \\$2.'],
          ['$p \\cdot MP_L = w + r$', 'Space is fixed and paid either way, so its rent is not part of the cost of one more worker.'],
          ['$q = 18\\sqrt{L}$ as large as possible', 'Output grows forever with $L$; profit does not.'],
        ], '$2 \\cdot 9/\\sqrt{L} = 6 \\Rightarrow \\sqrt{L} = 3$.'),
        plan('Part (c): the isoprofit line through the optimum is…', '$q = \\frac{w}{p}L + \\frac{\\pi^* + r\\bar{K}}{p}$', [
          ['$q = \\frac{p}{w}L + \\frac{\\pi^*}{p}$', 'Slope flipped and the space bill left out. Solve $\\pi = pq - wL - r\\bar{K}$ for $q$.'],
          ['$q = q^*$, a horizontal line', 'Hiring more costs money, so to keep profit fixed output must rise: the line slopes up.'],
          ['$q = \\frac{w}{p}L$, through the origin', 'That is the line with profit $-r\\bar{K}$, not $\\pi^*$.'],
        ], 'Slope $6/2 = 3$; intercept $(18 + 36)/2 = 27$.'),
      ],
      parts: [X('q(L)', '18*sqrt(L)', { L: [1, 16] }), X('MP_L', '9/sqrt(L)', { L: [1, 16] }), N('L^*', 9), N('q^*', 54), N('\\pi^*', 18),
        N('\\text{isoprofit slope}', 3), N('\\text{isoprofit intercept}', 27)],
      sol: md`
        **Move 1: fix space (a).** $q = 6\sqrt{9L} = 6 \cdot 3\sqrt{L} = 18\sqrt{L}$. Then $MP_L = \dfrac{dq}{dL} = 18 \cdot \tfrac12 L^{-1/2} = \dfrac{9}{\sqrt{L}}$.

        **Move 2: $pMP_L = w$ (b).**
        $$2 \cdot \frac{9}{\sqrt{L}} = 6 \;\Rightarrow\; \frac{18}{\sqrt{L}} = 6 \;\Rightarrow\; \sqrt{L} = 3 \;\Rightarrow\; L^* = 9$$
        $q^* = 18(3) = 54$. $\pi^* = 2(54) - 6(9) - 4(9) = 108 - 54 - 36 = 18$.

        **Move 3: the isoprofit line (c).** Solve $\pi = pq - wL - r\bar{K}$ for $q$:
        $$q = \frac{w}{p}L + \frac{\pi + r\bar{K}}{p} = \frac{6}{2}L + \frac{18 + 36}{2} = 3L + 27$$
        Tangency check: at $L = 9$ the line gives $3(9) + 27 = 54 = q^*$ ✓, and the curve's slope there is $MP_L(9) = 9/3 = 3$, the line's slope ✓.

        [[fig:g]]
      `, figs: { g: { svg: greenFig, cap: 'The isoprofit line $q = 3L + 27$ (purple) just touches $q = 18\\sqrt{L}$ at (9, 54). Any higher line misses the curve; any lower one crosses it.' } } }),
    P({ src: 'HW-style 3', title: 'Greenhouse: a price rise, then a wage rise',
      q: md`Same greenhouse: $q = 18\sqrt{L}$ in the short run, space bill $r\bar{K} = 36$, so $\sqrt{L^*} = 9p/w$ from $pMP_L = w$.

      **(a)** The tomato price rises from \$2 to \$3 (wage still 6). Find the new $L^*$, $q^*$, $\pi^*$, and say what happens to the isoprofit lines. **(b)** Instead the price stays at \$2 and the wage rises from 6 to 9. Find $L^*$, $q^*$ and $\pi^*$.`,
      plan: plan('Which way does each change tilt the isoprofit line, and so which way does labor move?', 'Slope $w/p$: a higher price flattens it (more labor); a higher wage steepens it (less labor)', [
        ['Both changes steepen it', 'Price is in the denominator of $w/p$: a higher $p$ makes the slope smaller, so the line is flatter.'],
        ['A price change moves profit but not labor', 'A higher price makes each worker\'s crates worth more, so $pMP_L = w$ now holds at more labor.'],
        ['Both raise labor', 'A higher wage makes labor costlier: the greenhouse hires less.'],
      ], 'Redo $p \\cdot 9/\\sqrt{L} = w$: $\\sqrt{L} = 9p/w$. Then $q = 18\\sqrt{L}$ and $\\pi = pq - wL - 36$.'),
      parts: [N('L^*\\ (p = 3)', 20.25), N('q^*\\ (p = 3)', 81), N('\\pi^*\\ (p = 3)', 85.5),
        FIX('At $p = 3$ the isoprofit lines are…', ['flatter: slope 2', 'steeper: slope 4.5', 'unchanged: slope 3'], 0, [null, 'That is the wage rise in (b): $9/2 = 4.5$.', 'The slope $w/p$ depends on the price.']),
        N('L^*\\ (w = 9)', 4), N('q^*\\ (w = 9)', 36), N('\\pi^*\\ (w = 9)', 0)],
      sol: md`
        **Move 1: price rise (a).** $\sqrt{L} = 9(3)/6 = 4.5$, so $L^* = 20.25$. $q^* = 18(4.5) = 81$.
        $$\pi^* = 3(81) - 6(20.25) - 36 = 243 - 121.5 - 36 = 85.5$$
        Isoprofit slope $w/p = 6/3 = 2$, down from 3: flatter lines touch the curve further right, where it is flatter. More labor, more output.

        **Move 2: wage rise (b).** $\sqrt{L} = 9(2)/9 = 2$, so $L^* = 4$. $q^* = 18(2) = 36$.
        $$\pi^* = 2(36) - 9(4) - 36 = 72 - 36 - 36 = 0$$
        Slope $9/2 = 4.5$: steeper, so the tangency moves left. Zero economic profit, but revenue (72) more than covers the labor bill (36), so the greenhouse operates.

        | | $L^*$ | $q^*$ | $\pi^*$ | slope $w/p$ |
        |---|---|---|---|---|
        | $p = 2$, $w = 6$ | 9 | 54 | 18 | 3 |
        | $p = 3$, $w = 6$ | 20.25 | 81 | 85.5 | 2 |
        | $p = 2$, $w = 9$ | 4 | 36 | 0 | 4.5 |
      ` }),
    P({ src: 'HW-style 4', title: 'A cubic cost at two prices',
      q: md`A competitive firm has $C(q) = q^3 - 6q^2 + 20q + 40$. **(a)** Find MC and AVC. **(b)** Find the shutdown price. **(c)** The price is \$20. How much does the firm produce, what is its profit, and does it stay open this period? **(d)** The price is \$56. Output and profit?`,
      plan: [
        plan('Part (b): how do you get the shutdown price?', 'Bottom of AVC: set $MC = AVC$, then evaluate AVC there', [
          ['Bottom of AC', 'That is the break-even price. Shutdown ignores the fixed 40, which is paid either way in the short run.'],
          ['Set $MC = 0$', 'The bottom of AVC is where MC crosses it, not where MC is zero.'],
          ['The constant term, 40', 'That is the fixed cost in dollars, not a price.'],
        ], '$3q^2 - 12q + 20 = q^2 - 6q + 20 \\Rightarrow 2q(q - 3) = 0$, so $q = 3$; shutdown price $AVC(3)$.'),
        plan('Part (c): $20 = 3q^2 - 12q + 20$ gives $q = 0$ and $q = 4$. Which one?', '$q = 4$: the root on the rising part of MC', [
          ['$q = 0$', 'At $q = 0$ MC is falling: just to the right MC is below 20, so each unit there adds profit. $q = 0$ is the bottom of the profit hill.'],
          ['Either, since both satisfy $P = MC$', 'Only one is a maximum: the one where MC cuts the price line from below.'],
          ['Neither: \\$20 is below the shutdown price', '\\$20 is above min AVC (11), so the firm operates.'],
        ], '$q = 4$. Then compare the loss with $-F = -40$.'),
        plan('Part (c): profit at \\$20 comes out to $-8$. Should the firm stay open this period?', 'Yes: shutting down would lose the whole fixed cost, 40', [
          ['No: any loss means shut down', 'In the short run the 40 is paid either way. Losing 8 beats losing 40.'],
          ['No: price is below AC', 'Below AC means a loss. The shutdown test is price versus min **AVC** (11).'],
          ['It depends on the long run', 'This period is the short run: the fixed cost is already committed.'],
        ], 'Stay open. (In the long run, if the price stays at \\$20, it would rather leave.)'),
      ],
      parts: [X('MC(q)', '3*q^2 - 12*q + 20', { q: [1, 8] }), X('AVC(q)', 'q^2 - 6*q + 20', { q: [1, 8] }), N('P_{\\text{shutdown}}', 11),
        N('q\\text{ at }P = 20', 4), N('\\pi\\text{ at }P = 20', -8), N('q\\text{ at }P = 56', 6), N('\\pi\\text{ at }P = 56', 176)],
      sol: md`
        **Move 1: the curves (a).** $F = 40$, $VC = q^3 - 6q^2 + 20q$.
        $$MC = 3q^2 - 12q + 20, \qquad AVC = q^2 - 6q + 20$$

        **Move 2: shutdown price (b).** $MC = AVC$: $2q^2 - 6q = 0 \Rightarrow 2q(q - 3) = 0 \Rightarrow q = 3$. $AVC(3) = 9 - 18 + 20 = 11$.

        **Move 3: price \$20 (c).** $3q^2 - 12q + 20 = 20 \Rightarrow 3q(q - 4) = 0$. Take the rising-branch root, $q = 4$ (and $20 > 11$, so the firm operates).
        $C(4) = 64 - 96 + 80 + 40 = 88$, so $\pi = 20(4) - 88 = -8$. Shutting down would give $-40$. Stay open: the loss is 32 smaller.

        **Move 4: price \$56 (d).** $3q^2 - 12q + 20 = 56 \Rightarrow 3q^2 - 12q - 36 = 0 \Rightarrow q^2 - 4q - 12 = 0 \Rightarrow (q - 6)(q + 2) = 0$, so $q = 6$.
        $C(6) = 216 - 216 + 120 + 40 = 160$, $\pi = 56(6) - 160 = 336 - 160 = 176$.
      ` }),
    P({ src: 'HW-style 5', title: 'Two kinds of farms make one market',
      q: md`A market has 30 small farms, each supplying $q_s = 2P - 8$ for $P \ge 4$ (zero below), and 20 large farms, each supplying $q_\ell = 5P - 50$ for $P \ge 10$ (zero below).

      **(a)** Write market supply on each price range and find the quantity at the kink. **(b)** How much does the market supply at $P = 12$? **(c)** Demand is $Q^D = 2360 - 40P$. Find the equilibrium price and quantity and the output of each small and each large farm. **(d)** Demand falls to $Q^D = 480 - 30P$. Find the new equilibrium.`,
      plan: [
        plan('Part (a): how do you build market supply?', 'Multiply each firm\'s $q(P)$ by the number of firms of that type, then add **quantities** price range by price range', [
          ['Add the two firm supplies once: $(2P - 8) + (5P - 50)$', 'That counts one farm of each kind. There are 30 and 20 of them.'],
          ['Add the inverse supplies', 'That adds prices. At one price, add what everyone sells.'],
          ['Use $7P - 58$ at every price', 'Large farms sell nothing below \\$10, so below 10 only the small farms count: the curve is piecewise.'],
        ], '$4 \\le P < 10$: $Q = 30(2P - 8)$. $P \\ge 10$: add $20(5P - 50)$.'),
        plan('Parts (c)–(d): which piece of supply do you set equal to demand?', 'Guess a piece, solve, and check the price lands in that piece\'s range', [
          ['Always the top piece', 'If demand is low the price may land below 10, where large farms sell nothing.'],
          ['Always the bottom piece', 'If demand is high the price lands above 10, and the large farms join.'],
          ['Average the two pieces', 'At any one price exactly one formula applies.'],
        ], 'Try the top piece; if $P < 10$ comes out, redo with the middle piece.'),
      ],
      parts: [N('Q_{\\text{kink}}', 360), N('Q^S(12)', 680), N('P^*', 18), N('Q^*', 1640), N('q_s', 28), N('q_\\ell', 40), N('P^*\\text{ (low demand)}', 8), N('Q^*\\text{ (low demand)}', 240)],
      sol: md`
        **Move 1: market supply (a).**

        - $P < 4$: nobody sells, $Q = 0$.
        - $4 \le P < 10$: only small farms: $Q = 30(2P - 8) = 60P - 240$.
        - $P \ge 10$: both: $Q = 60P - 240 + 20(5P - 50) = 160P - 1240$.

        Kink at $P = 10$: $Q = 60(10) - 240 = 360$ (the top formula agrees: $1600 - 1240 = 360$ ✓).

        **Move 2: at \$12 (b).** $160(12) - 1240 = 680$. Check: small farms $30(16) = 480$, large $20(10) = 200$, total 680 ✓.

        **Move 3: equilibrium (c).** Try the top piece: $160P - 1240 = 2360 - 40P \Rightarrow 200P = 3600 \Rightarrow P = 18 \ge 10$ ✓. $Q = 2360 - 720 = 1640$. Each small farm: $2(18) - 8 = 28$. Each large farm: $5(18) - 50 = 40$. Check: $30(28) + 20(40) = 840 + 800 = 1640$ ✓.

        **Move 4: low demand (d).** Try the top piece: $160P - 1240 = 480 - 30P \Rightarrow 190P = 1720 \Rightarrow P \approx 9.05$, which is **below** 10: the top piece does not apply there. Use the middle piece: $60P - 240 = 480 - 30P \Rightarrow 90P = 720 \Rightarrow P = 8$ ✓ (between 4 and 10). $Q = 480 - 240 = 240$. Small farms make 8 each; large farms make nothing.
      ` }),
    P({ src: 'HW-style 6', title: 'Long-run equilibrium, then a demand boom',
      q: md`Every firm, current or potential, in a competitive industry has cost $C(q) = 2q^2 + 50$ for $q > 0$; in the short run the 50 is fixed. Market demand is $Q^D = 1000 - 20P$.

      **(a)** Find the long-run price, output per firm, market quantity and number of firms. **(b)** Demand rises to $Q^D = 1300 - 20P$. In the short run the number of firms cannot change. Find the short-run price, output per firm and profit per firm. **(c)** Find the new long-run price, market quantity and number of firms.`,
      plan: [
        plan('Part (a): what pins down the long-run price?', 'Free entry and exit drive price to min LRAC', [
          ['Set market supply equal to demand using one firm\'s MC', 'You do not know how many firms there are yet; that is what entry decides. The price comes first.'],
          ['$P = \\min AVC$', 'That is the short-run shutdown price. In the long run firms need all costs covered.'],
          ['$MR = MC$', 'These are price takers, not a monopolist.'],
        ], '$LRMC = LRAC$: $4q = 2q + 50/q \\Rightarrow q = 5$, $P = 20$. Then $Q$ from demand and $n = Q/q$.'),
        plan('Part (b): in the short run after the boom, how do you find the price?', 'Fixed $n = 120$: market supply $= 120 \\cdot q(P)$ with $q = P/4$ from $P = MC$; set it equal to the new demand', [
          ['The price stays at min LRAC, 20', 'That is the long-run answer. Until new firms arrive, the 120 firms must move up their MC curves, so the price rises.'],
          ['Divide the new demand by 120', 'You still need a price. Build market supply first, then meet demand.'],
          ['Use the long-run number of firms, 180', 'Entry takes time; in the short run there are still 120 firms.'],
        ], '$Q^S = 120 \\cdot P/4 = 30P$. Set $30P = 1300 - 20P$.'),
        plan('Part (c): where does the long run end up?', 'Back at $P = 20$, with more firms each making 5', [
          ['At the short-run price, 26', 'Profit is positive at 26, so firms enter until it is gone.'],
          ['Same 120 firms, each making more', 'Entry adds firms; each firm returns to the bottom of its LRAC, $q = 5$.'],
          ['A price below 20', 'Below min LRAC every firm loses money; exit would push it back up.'],
        ], '$P = 20$, $Q = 1300 - 400 = 900$, $n = 900/5$.'),
      ],
      parts: [N('P_{LR}', 20), N('q^*', 5), N('Q', 600), N('n', 120), N('P_{SR}', 26), N('q_{SR}', 6.5), N('\\pi_{SR}', 34.5), N('Q\\text{ (new LR)}', 900), N('n\\text{ (new LR)}', 180)],
      sol: md`
        **Move 1: long-run price (a).** $LRMC = 4q$, $LRAC = 2q + 50/q$. Set equal: $2q = 50/q \Rightarrow q^2 = 25 \Rightarrow q^* = 5$, and $P = LRAC(5) = 10 + 10 = 20$.
        Market quantity from demand: $Q = 1000 - 20(20) = 600$. Firms: $n = 600/5 = 120$.

        **Move 2: short run after the boom (b).** Each firm: $P = MC = 4q \Rightarrow q = P/4$ (min AVC $= \min 2q = 0$, so no shutdown issue). 120 firms: $Q^S = 30P$.
        $$30P = 1300 - 20P \;\Rightarrow\; 50P = 1300 \;\Rightarrow\; P_{SR} = 26$$
        $Q = 780$, $q = 26/4 = 6.5$. Profit: $26(6.5) - [2(6.5)^2 + 50] = 169 - 134.5 = 34.5 > 0$.

        **Move 3: entry (c).** Positive profit attracts entrants. Each new firm shifts supply right until the price is back at min LRAC, 20. Then $Q = 1300 - 20(20) = 900$, and $n = 900/5 = 180$: 60 new firms.

        [[fig:lr]]

        **Does this make sense?** The short-run response is a price spike (20 → 26) with each firm working harder (5 → 6.5). The long-run response is all quantity: same price, more firms. Long-run supply here is flat at min LRAC.
      `, figs: { lr: { svg: lrFig, cap: 'A: the old long run (600, 20). B: short run after demand shifts to $D_2$, along the supply of 120 firms (26 and 780). C: the new long run (900, 20) after 60 firms enter. Long-run supply is flat at min LRAC = 20.' } } }),
  ];

  // ------------------------------------------------------------------ HW-style, part B figures (Lectures 16–17)
  const psFig = EC.graph({
    w: 320, h: 250, x: [0, 9.2], y: [0, 20.5], xl: 'q', yl: '\\$', xt: [5, 7], yt: [2, 12, 16],
    items: [
      { poly: [[0, 2], [0, 12], [5, 12]], cls: 'gain' },
      { poly: [[0, 12], [0, 16], [7, 16], [5, 12]], cls: 'cs' },
      { f: (x) => 2 + 2 * x, from: 0, to: 9, cls: 'c5', lab: 'MC', labX: 8.8, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 12], [9.2, 12]], cls: 'curve c3 dash', lab: 'P = 12', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
      { seg: [[0, 16], [9.2, 16]], cls: 'curve c3 dash', lab: 'P = 16', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [5, 12], guide: 'x' }, { pt: [7, 16], guide: 'x' },
      { text: [1.6, 9.5], t: '25' }, { text: [2.6, 14], t: '+24' },
    ],
  });
  const quotaFig = EC.graph({
    w: 320, h: 250, x: [0, 42], y: [0, 42], xl: 'Q', yl: 'P', xt: [14, 20], yt: [10, 17, 20, 26, 40],
    items: [
      { poly: [[0, 26], [0, 40], [14, 26]], cls: 'cs' },
      { poly: [[0, 10], [0, 26], [14, 26], [14, 17]], cls: 'gain' },
      { poly: [[14, 26], [14, 17], [20, 20]], cls: 'loss' },
      { seg: [[0, 40], [40, 0]], cls: 'curve', lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 10], [42, 31]], cls: 'curve c2', lab: 'S', at: 0.97, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[14, 0], [14, 40]], cls: 'curve c4 dash', lab: '\\text{quota}', at: 0.97, dx: 4, dy: 0, anchor: 'l' },
      { pt: [14, 26] }, { pt: [20, 20], guide: true },
    ],
  });
  const taxIncFig = EC.graph({
    w: 330, h: 260, x: [0, 125], y: [0, 64], xl: 'Q', yl: 'P', xt: [72, 80], yt: [18, 24, 60],
    items: [
      { poly: [[0, 24], [0, 60], [72, 24]], cls: 'cs' },
      { poly: [[0, 18], [72, 18], [72, 24], [0, 24]], cls: 'ex' },
      { poly: [[0, 0], [0, 18], [72, 18]], cls: 'gain' },
      { poly: [[72, 24], [72, 18], [80, 20]], cls: 'loss' },
      { seg: [[0, 60], [120, 0]], cls: 'curve', lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 0], [125, 31.25]], cls: 'curve c2', lab: 'S', at: 0.97, dx: -2, dy: -6, anchor: 'br' },
      { pt: [80, 20] }, { pt: [72, 24], guide: 'x' }, { pt: [72, 18] },
      { text: [36, 21], t: 'G = 432' },
    ],
  });

  // Qd = 100 - 2P (P = 50 - Q/2), Qs = 2P - 20 (P = 10 + Q/2): equilibrium (40, 30)
  const ctrlBase = [
    { seg: [[0, 50], [100, 0]], cls: 'curve', lab: 'D', at: 0.95, dx: 4, dy: -4, anchor: 'bl' },
    { seg: [[0, 10], [80, 50]], cls: 'curve c2', lab: 'S', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
    { pt: [40, 30] },
  ];
  const ceilFig = EC.graph({
    w: 330, h: 260, x: [0, 104], y: [0, 54], xl: 'Q', yl: 'P', xt: [30, 40, 50], yt: [10, 25, 30, 35, 50],
    items: [
      { poly: [[0, 25], [0, 50], [30, 35], [30, 25]], cls: 'cs' },
      { poly: [[0, 10], [0, 25], [30, 25]], cls: 'gain' },
      { poly: [[30, 35], [30, 25], [40, 30]], cls: 'loss' },
      ...ctrlBase,
      { seg: [[0, 25], [104, 25]], cls: 'curve c5 dash', lab: '\\text{ceiling } 25', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
      { pt: [30, 25], guide: 'x' }, { pt: [50, 25], guide: 'x' }, { pt: [30, 35] },
    ],
  });
  const floorFig = EC.graph({
    w: 330, h: 260, x: [0, 104], y: [0, 54], xl: 'Q', yl: 'P', xt: [30, 40, 50], yt: [10, 25, 30, 35, 50],
    items: [
      { poly: [[0, 35], [0, 50], [30, 35]], cls: 'cs' },
      { poly: [[0, 10], [0, 35], [30, 35], [30, 25]], cls: 'gain' },
      { poly: [[30, 35], [30, 25], [40, 30]], cls: 'loss' },
      ...ctrlBase,
      { seg: [[0, 35], [104, 35]], cls: 'curve c5 dash', lab: '\\text{floor } 35', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [30, 35], guide: 'x' }, { pt: [50, 35], guide: 'x' }, { pt: [30, 25] },
    ],
  });
  const PLAN_DWL_PC = plan('Which area is the deadweight loss?', 'The triangle between demand and supply over the units no longer traded, from 30 to 40', [
    ['The shortage times the price gap', 'The shortage (20) counts units buyers want at the ceiling price, not units society loses. Only units 30 to 40 stop being made.'],
    ['The fall in PS', 'Part of that fall goes to buyers as a lower price: a transfer, not a loss.'],
    ['Zero: buyers pay less', 'The units from 30 to 40 are worth more to buyers than they cost to make, and they are not made.'],
  ], '$DWL = \\tfrac12(40 - 30)(35 - 25)$: base the lost units, height the gap between demand and supply at 30.');

  gen('m3_hw_tax', () => {
    const b = pick([1, 2, 3, 4]), s = pick([1, 2, 3, 4, 6]), k = pick([1, 2]), Pe = pick([20, 30, 40]);
    const t = (b + s) * k, A = (b + s) * Pe, Qe = s * Pe, Pc = Pe + s * k, Pp = Pe - b * k, Qt = s * Pp;
    const share = 100 * s / (b + s), rev = t * Qt, dwl = 0.5 * t * (Qe - Qt);
    return {
      title: 'Who pays a per-unit tax?',
      q: md`Demand is $Q^D = ${A} - ${b === 1 ? '' : b}P$ and supply is $Q^S = ${s === 1 ? '' : s}P$. A tax of \$${t} per unit is collected from sellers. Find the equilibrium before the tax, then $P_c$, $P_p$, the taxed quantity, the consumers' share of the tax (in %), tax revenue and the deadweight loss.`,
      plan: [
        plan('How do you find the after-tax prices?', `Use the wedge: $Q^D(P_c) = Q^S(P_c - ${t})$`, [
          [`Add the whole tax to the old price: $P_c = ${Pe + t}$`, 'Buyers pay the whole tax only if supply is perfectly flat. Here the quantity falls, so sellers absorb part of it.'],
          ['Split the tax half and half', 'The split depends on the slopes of the two curves, not on a rule of halves.'],
          ['Shift supply up by the tax and demand down by the tax', 'That taxes the market twice. Use one wedge: $P_c - P_p = t$.'],
        ], `$${A} - ${b}P_c = ${s}(P_c - ${t})$. Solve for $P_c$, then $P_p = P_c - ${t}$.`),
        plan('Who bears more of the tax?', 'The side whose curve is steeper (less responsive): check with $(P_c - P^*)/t$', [
          ['The sellers, because the tax is collected from them', 'Who hands over the money does not decide who bears it. The burden depends only on the slopes.'],
          ['The side with the flatter curve', 'A flat curve means that side can walk away easily, so it bears **less**.'],
          ['Always half each', 'Only when the two sides respond equally to price.'],
        ], 'Consumer share $= (P_c - P^*)/t$; producer share $= (P^* - P_p)/t$.'),
      ],
      parts: [N('P^*', Pe), N('P_c', Pc), N('P_p', Pp), N('Q^t', Qt), N('\\text{consumer share (\\%)}', share), N('\\text{tax revenue}', rev), N('DWL', dwl)],
      hints: [`Before: $${A} - ${b}P = ${s}P \\Rightarrow P^* = ${Pe}$.`, `$${b + s}P_c = ${A} + ${s * t}$.`],
      sol: md`
        **Move 1: no tax.** $${A} - ${b}P = ${s}P \Rightarrow ${b + s}P = ${A} \Rightarrow P^* = ${Pe}$, $Q^* = ${Qe}$.

        **Move 2: the wedge.** Sellers keep $P_p = P_c - ${t}$:
        $$${A} - ${b}P_c = ${s}(P_c - ${t}) \;\Rightarrow\; ${b + s}P_c = ${A + s * t} \;\Rightarrow\; P_c = ${Pc}, \quad P_p = ${Pp}$$
        $Q^t = ${s}(${Pp}) = ${Qt}$ (check: $${A} - ${b}(${Pc}) = ${A - b * Pc}$ ✓).

        **Move 3: incidence.** Consumers: $(${Pc} - ${Pe})/${t} = ${F(share)}\%$. Producers: $(${Pe} - ${Pp})/${t} = ${F(100 - share)}\%$. ${share > 50 ? 'Consumers bear more: demand is the steeper (less responsive) side.' : share < 50 ? 'Producers bear more: supply is the steeper (less responsive) side.' : 'Equal slopes, equal shares.'}

        **Move 4: revenue and DWL.** $G = ${t} \times ${Qt} = ${rev}$. $DWL = \tfrac12 \times ${t} \times (${Qe} - ${Qt}) = ${F(dwl)}$.
      `,
    };
  });

  // ------------------------------------------------------------------ HW-style set, part B
  const hwB = [
    P({ src: 'HW-style 7', title: 'Producer surplus versus profit',
      q: md`A competitive firm has $C(q) = q^2 + 2q + 25$. **(a)** At $P = 12$, find output, revenue, variable cost, producer surplus and profit. **(b)** Show PS as an area on a graph of MC. **(c)** The price rises to \$16. Find the new PS, the change in PS, and the change in profit.`,
      plan: [
        plan('Part (a): how are PS and profit related?', 'PS = TR − VC, and profit = PS − F', [
          ['They are the same thing', 'They differ by the fixed cost: PS ignores it, profit subtracts it.'],
          ['PS = TR − TC', 'That is profit.'],
          ['PS = the area under MC', 'The area under MC is variable cost. PS is the area **above** MC and below the price.'],
        ], '$q$ from $P = MC = 2 + 2q$. Then $TR$, $VC = q^2 + 2q$, $PS = TR - VC$, $\\pi = PS - 25$.'),
        plan('Part (c): what shape is the change in PS when the price rises from 12 to 16?', 'A trapezoid: the strip between the two prices, to the left of MC', [
          ['A triangle $\\tfrac12(7 - 5)(16 - 12)$', 'That is only the gain on the 2 new units. The 5 old units each earn \\$4 more too.'],
          ['The rectangle $4 \\times 7$', 'The 2 new units do not each earn the full \\$4 extra: they cost more to make.'],
          ['Zero: the firm is a price taker', 'Price takers gain when the market price rises; they just cannot set it.'],
        ], '$\\Delta PS = \\tfrac12(5 + 7)(16 - 12)$. Check with $TR - VC$ at the new price.'),
      ],
      parts: [N('q\\ (P = 12)', 5), N('TR', 60), N('VC', 35), N('PS', 25), N('\\pi', 0), N('PS\\ (P = 16)', 49), N('\\Delta PS', 24), N('\\Delta \\pi', 24)],
      sol: md`
        **Move 1: output (a).** $MC = 2 + 2q = 12 \Rightarrow q = 5$.

        **Move 2: the pieces.** $TR = 12 \times 5 = 60$. $VC = 25 + 10 = 35$. $PS = 60 - 35 = 25$. $\pi = PS - F = 25 - 25 = 0$: zero economic profit, but a positive PS, which is what pays the fixed cost.

        **Move 3: PS as an area (b).** MC runs from 2 (at $q = 0$) to 12 (at $q = 5$). The area above MC and below the price is a triangle: $\tfrac12(5)(12 - 2) = 25$ ✓.

        **Move 4: price \$16 (c).** $2 + 2q = 16 \Rightarrow q = 7$. $PS = 16(7) - (49 + 14) = 112 - 63 = 49$ (triangle: $\tfrac12(7)(14) = 49$ ✓). $\Delta PS = 49 - 25 = 24$, the trapezoid $\tfrac12(5 + 7)(4) = 24$ ✓. The fixed cost does not change, so $\Delta\pi = \Delta PS = 24$ (profit goes from 0 to 24).

        [[fig:ps]]
      `, figs: { ps: { svg: psFig, cap: 'Green: PS at P = 12, $\\tfrac12(5)(10) = 25$. Blue: the extra PS when the price rises to 16, the trapezoid $\\tfrac12(5 + 7)(4) = 24$.' } } }),
    P({ src: 'HW-style 8', title: 'A quota: who wins, who loses, what is lost',
      q: md`Inverse demand is $P = 40 - Q$ and inverse supply is $P = 10 + 0.5Q$. **(a)** Find the competitive equilibrium and CS, PS and total welfare $W$. **(b)** A quota limits output to $Q = 14$. Find the price buyers pay, CS, PS, $W$ and the deadweight loss, and fill in a Before / After / Change table.`,
      plan: [
        plan('Part (b): with only 14 units, what price do buyers pay?', 'The demand height at 14: $P = 40 - 14 = 26$', [
          ['The supply height at 14, \\$17', 'Sellers would sell 14 for \\$17, but buyers compete for the scarce units and bid the price up to what the 14th is worth to them.'],
          ['The old price, \\$20', 'At \\$20 buyers want 20 units and only 14 exist: the price rises.'],
          ['The average of 26 and 17', 'A market with 14 units clears at the price where buyers want exactly 14.'],
        ], '$P = 26$. Producers sell 14 units whose supply cost runs from 10 up to 17.'),
        plan('Which area is the new PS?', 'Between the price 26 and the supply curve, out to 14: a trapezoid', [
          ['A triangle out to 20, the old quantity', 'Only 14 units are sold now.'],
          ['$\\tfrac12(14)(26 - 10)$', 'Supply is only at 17 at $Q = 14$, not 26. The region is a rectangle ($14 \\times 9$) plus a triangle ($\\tfrac12 \\times 14 \\times 7$).'],
          ['The same as before', 'The price rose from 20 to 26 on the units still sold.'],
        ], '$PS = 14(26 - 17) + \\tfrac12(14)(17 - 10)$.'),
        plan('Which area is the DWL?', 'The triangle between demand and supply from 14 to 20', [
          ['All of the lost CS', 'Part of what consumers lose (the rectangle from 20 to 26 on 14 units) goes to producers: a transfer, not a loss.'],
          ['The rectangle $(26 - 20) \\times 14$', 'That is the transfer from buyers to sellers.'],
          ['Zero, because the market still clears', 'Units 14 to 20 are worth more to buyers than they cost to make, and they are not made.'],
        ], '$DWL = \\tfrac12(20 - 14)(26 - 17)$.'),
      ],
      parts: [N('P^*', 20), N('Q^*', 20), N('CS', 200), N('PS', 100), N('P\\text{ with quota}', 26), N('CS\\text{ after}', 98), N('PS\\text{ after}', 175), N('DWL', 27)],
      sol: md`
        **Move 1: equilibrium (a).** $40 - Q = 10 + 0.5Q \Rightarrow 30 = 1.5Q \Rightarrow Q^* = 20$, $P^* = 20$.
        $CS = \tfrac12(20)(40 - 20) = 200$. $PS = \tfrac12(20)(20 - 10) = 100$. $W = 300$.

        **Move 2: the quota price (b).** Buyers pay the demand height at 14: $P = 26$. The supply height there is $10 + 7 = 17$.

        **Move 3: the new areas.**
        $CS = \tfrac12(14)(40 - 26) = 98$.
        $PS = 14(26 - 17) + \tfrac12(14)(17 - 10) = 126 + 49 = 175$.
        $W = 98 + 175 = 273$.

        **Move 4: DWL.** $\tfrac12(20 - 14)(26 - 17) = \tfrac12(6)(9) = 27 = 300 - 273$ ✓.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | 200 | 98 | −102 |
        | PS | 100 | 175 | +75 |
        | W | 300 | 273 | −27 |

        Producers gain from the quota (they act like a cartel restricting output); buyers lose more than producers gain.

        [[fig:q]]
      `, figs: { q: { svg: quotaFig, cap: 'Quota at 14: buyers pay 26. Blue: CS. Green: PS (a trapezoid). Red: DWL, $\\tfrac12(6)(9) = 27$.' } } }),
    P({ src: 'HW-style 9', title: 'A per-unit tax with unequal slopes',
      q: md`Demand is $Q^D = 120 - 2P$ and supply is $Q^S = 4P$. **(a)** Find the equilibrium, CS and PS. **(b)** A \$6 per-unit tax is collected from sellers. Find $P_c$, $P_p$, the new quantity, each side's share of the tax, tax revenue and the DWL; fill in a welfare table. **(c)** Would anything change if the tax were collected from buyers?`,
      plan: [
        plan('Part (b): how do you find the after-tax prices?', 'Wedge: $Q^D(P_c) = Q^S(P_c - 6)$', [
          ['Add 6 to the old price: $P_c = 26$', 'Buyers pay the whole tax only when supply is perfectly flat. Here quantity falls, so sellers absorb part.'],
          ['Split it: \\$3 each', 'The split depends on the slopes, not a rule of halves.'],
          ['Shift supply up by 6 and demand down by 6', 'That taxes the market twice. One wedge: $P_c - P_p = 6$.'],
        ], '$120 - 2P_c = 4(P_c - 6) \\Rightarrow 6P_c = 144$.'),
        plan('Who bears more of the tax, and why?', 'Consumers: demand is the steeper (less responsive) curve here', [
          ['Sellers, because the tax is collected from them', 'Legal liability does not decide the burden. The slopes do.'],
          ['Sellers, because supply is flatter', 'A flatter curve means that side responds more and escapes more of the tax. Flatter pays **less**.'],
          ['Half each', 'Only with equally responsive sides.'],
        ], 'Inverse demand $P = 60 - Q/2$ (slope $-1/2$); inverse supply $P = Q/4$ (slope $1/4$). Shares: $(P_c - 20)/6$ and $(20 - P_p)/6$.'),
        plan('Which area is the DWL?', '$\\tfrac12 \\times t \\times$ (lost quantity)', [
          ['Tax revenue', 'Revenue goes to the government and counts in welfare: a transfer.'],
          ['$t \\times$ lost quantity, a rectangle', 'The lost units were worth between \\$18 and \\$24 to the market: a triangle, not a rectangle.'],
          ['The fall in CS', 'Most of that fall becomes tax revenue.'],
        ], '$\\tfrac12(6)(80 - 72)$.'),
      ],
      parts: [N('P^*', 20), N('Q^*', 80), N('P_c', 24), N('P_p', 18), N('Q^t', 72), N('\\text{consumer share (\\%)}', 200 / 3), N('\\text{tax revenue}', 432), N('DWL', 24),
        FIX('(c) Collecting the tax from buyers instead…', ['changes nothing: same $P_c$, $P_p$ and quantity', 'makes buyers pay all of it', 'makes sellers pay all of it'], 0,
          [null, 'The wedge is the same \\$6 either way; only the slopes decide the split.', 'The wedge is the same \\$6 either way; only the slopes decide the split.'])],
      sol: md`
        **Move 1: no tax (a).** $120 - 2P = 4P \Rightarrow P^* = 20$, $Q^* = 80$. Choke price 60. $CS = \tfrac12(80)(40) = 1600$. $PS = \tfrac12(80)(20) = 800$.

        **Move 2: the wedge (b).** Sellers keep $P_p = P_c - 6$:
        $$120 - 2P_c = 4(P_c - 6) \;\Rightarrow\; 120 + 24 = 6P_c \;\Rightarrow\; P_c = 24, \quad P_p = 18$$
        $Q^t = 4(18) = 72$ (check: $120 - 48 = 72$ ✓).

        **Move 3: incidence.** Consumers: $(24 - 20)/6 = 2/3 \approx 66.7\%$. Producers: $(20 - 18)/6 = 1/3$. Demand is steeper, so buyers bear more.

        **Move 4: revenue and DWL.** $G = 6 \times 72 = 432$. $DWL = \tfrac12(6)(80 - 72) = 24$.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | 1600 | $\tfrac12(72)(60 - 24) = 1296$ | −304 |
        | PS | 800 | $\tfrac12(72)(18) = 648$ | −152 |
        | G | 0 | 432 | +432 |
        | W | 2400 | 2376 | −24 |

        **Move 5: legal liability (c).** Nothing changes: a \$6 wedge between what buyers pay and sellers keep gives the same $P_c$, $P_p$ and $Q$ whoever writes the check.

        [[fig:tx]]
      `, figs: { tx: { svg: taxIncFig, cap: 'Blue: CS above 24. Gray: tax revenue $6 \\times 72$. Green: PS below 18. Red: DWL, $\\tfrac12(6)(8) = 24$.' } } }),
    G('m3_hw_tax', { need: 2 }),
    P({ src: 'HW-style 10', title: 'A binding price ceiling',
      q: md`Demand is $Q^D = 100 - 2P$ and supply is $Q^S = 2P - 20$. **(a)** Find the equilibrium, CS and PS. **(b)** A price ceiling of \$25 is imposed. Find the quantity traded, the shortage, CS, PS, total welfare and the DWL. Assume the units that are sold go to the buyers who value them most.`,
      plan: [
        plan('Part (b): does the ceiling bind, and how much is traded?', 'It binds (25 is below 30); traded quantity is $Q^S(25) = 30$: sellers decide how much is offered', [
          ['Traded quantity is $Q^D(25) = 50$', 'Buyers want 50, but they cannot buy what is not produced. Only 30 are offered.'],
          ['It does not bind: a ceiling only matters above the equilibrium', 'Reversed. A ceiling above the market price is harmless; a ceiling **below** it binds.'],
          ['Traded quantity stays at 40', 'At \\$25 sellers offer only 30.'],
        ], 'Traded $= Q^S(25) = 30$. Shortage $= Q^D(25) - Q^S(25)$.'),
        plan('Which area is the new CS?', 'Under demand, above \\$25, out to the 30 units bought: a trapezoid', [
          ['$\\tfrac12(50)(50 - 25)$, using the 50 units demanded', 'Only 30 units are bought; CS is earned only on units actually bought.'],
          ['$\\tfrac12(30)(50 - 25)$', 'Demand is at 35 (not 25) when $Q = 30$, so the region is a trapezoid with heights 25 and 10, not a triangle.'],
          ['The same as before', 'Buyers pay less per unit but get fewer units: both change CS.'],
        ], 'Inverse demand $P = 50 - Q/2$; at $Q = 30$ it is 35. $CS = \\tfrac12[(50 - 25) + (35 - 25)](30)$.'),
        PLAN_DWL_PC,
      ],
      parts: [N('P^*', 30), N('Q^*', 40), N('CS', 400), N('PS', 400), N('Q\\text{ traded}', 30), N('\\text{shortage}', 20), N('CS\\text{ after}', 525), N('PS\\text{ after}', 225), N('DWL', 50)],
      sol: md`
        **Move 1: equilibrium (a).** $100 - 2P = 2P - 20 \Rightarrow 4P = 120 \Rightarrow P^* = 30$, $Q^* = 40$. Inverse demand $P = 50 - Q/2$ (choke 50); inverse supply $P = 10 + Q/2$ (starts at 10).
        $CS = \tfrac12(40)(50 - 30) = 400$. $PS = \tfrac12(40)(30 - 10) = 400$.

        **Move 2: the ceiling (b).** \$25 is below \$30, so it binds. $Q^S(25) = 30$, $Q^D(25) = 50$: 30 traded, shortage 20.

        **Move 3: new areas.** Demand height at 30: $50 - 15 = 35$.
        $CS = \tfrac12[(50 - 25) + (35 - 25)](30) = \tfrac12(35)(30) = 525$.
        $PS = \tfrac12(30)(25 - 10) = 225$.
        $W = 750$.

        **Move 4: DWL.** $\tfrac12(40 - 30)(35 - 25) = 50 = 800 - 750$ ✓.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | 400 | 525 | +125 |
        | PS | 400 | 225 | −175 |
        | W | 800 | 750 | −50 |

        Buyers who still get the good gain \$5 a unit (150 in all) but lose the 10 units no longer made (25 of CS); sellers lose more.

        [[fig:c]]
      `, figs: { c: { svg: ceilFig, cap: 'Ceiling at 25: sellers offer 30, buyers want 50. Blue: CS (a trapezoid). Green: PS. Red: DWL between 30 and 40.' } } }),
    P({ src: 'HW-style 11', title: 'A price floor versus a price support',
      q: md`Same market: $Q^D = 100 - 2P$, $Q^S = 2P - 20$ (equilibrium \$30 and 40 units, $CS = PS = 400$).

      **(a)** A price floor of \$35 with **no** government purchases. Find the quantity traded, the excess supply, CS, PS and the DWL (assume the lowest-cost sellers make the sales). **(b)** Instead, a price **support** at \$35: the government buys all excess supply. Find producers' sales, government spending, CS, PS, social surplus and its change.`,
      plan: [
        plan('Part (a): with a plain floor, how much is traded?', '$Q^D(35) = 30$: buyers decide how much is bought', [
          ['$Q^S(35) = 50$', 'Sellers offer 50 but nobody buys the last 20: they go unsold.'],
          ['The old 40', 'At \\$35 buyers want only 30.'],
          ['It does not bind: floors only matter below the equilibrium', 'Reversed. A floor **above** the market price binds.'],
        ], 'Traded 30. PS uses the 30 lowest-cost units: supply runs from 10 up to 25 over them.'),
        PLAN_SUPPORT, PLAN_G,
      ],
      parts: [N('Q\\text{ traded (floor)}', 30), N('\\text{excess supply}', 20), N('CS\\text{ (floor)}', 225), N('PS\\text{ (floor)}', 525), N('DWL\\text{ (floor)}', 50),
        N('Q^S\\text{ (support)}', 50), N('G', 700), N('PS\\text{ (support)}', 625), N('SS\\text{ (support)}', 150), N('\\Delta SS\\text{ (support)}', -650)],
      sol: md`
        **Move 1: plain floor (a).** $Q^D(35) = 30$, $Q^S(35) = 50$: 30 traded, 20 unsold.
        $CS = \tfrac12(30)(50 - 35) = 225$. Supply height at 30: $10 + 15 = 25$, so
        $PS = 30(35 - 25) + \tfrac12(30)(25 - 10) = 300 + 225 = 525$.
        $W = 750$, $DWL = 800 - 750 = 50$ (the triangle $\tfrac12(40 - 30)(35 - 25)$ ✓).

        **Move 2: support (b).** Producers sell $Q^S(35) = 50$. Consumers still buy 30, still with $CS = 225$. The government buys $50 - 30 = 20$ and spends $G = 35 \times 20 = 700$.
        $PS = \tfrac12(50)(35 - 10) = 625$.
        $$SS = CS + PS - G = 225 + 625 - 700 = 150, \qquad \Delta SS = 150 - 800 = -650$$

        | | Before | Floor | Support |
        |---|---|---|---|
        | CS | 400 | 225 | 225 |
        | PS | 400 | 525 | 625 |
        | G | 0 | 0 | −700 |
        | SS | 800 | 750 | 150 |

        **Why the support is so much worse:** on top of the 10 units buyers no longer get (worth $\tfrac12(35 + 30)(10) = 325$), society pays to produce 10 extra units that nobody consumes (cost $\tfrac12(30 + 35)(10) = 325$). $325 + 325 = 650$ ✓. Producers like the support best: their PS is highest.

        [[fig:f]]
      `, figs: { f: { svg: floorFig, cap: 'Plain floor at 35: buyers take 30, sellers would offer 50. Blue: CS. Green: PS on the 30 units sold. Red: DWL between 30 and 40.' } } }),
    P({ src: 'HW-style 12', title: 'Short run or long run? Four prices',
      q: md`A competitive firm's short-run curves have min AVC = \$10 and min AC = \$14. Its long-run average cost has a minimum of \$12 (with a better-sized plant). For each price, say what it does **this period** and what it does **if the price stays there**.`,
      plan: plan('Which two comparisons settle everything here?', 'This period: $P$ vs min AVC (operate?) and min AC (profit?). If the price stays: $P$ vs min LRAC (stay or exit?)', [
        ['Only $P$ vs min AC, in both runs', 'Min AC decides profit or loss. Whether to operate this period depends on min AVC, and the long run uses LRAC.'],
        ['Only $P$ vs min AVC, in both runs', 'That is the short-run test only. In the long run nothing is fixed, so the firm needs min LRAC covered.'],
        ['Shut down whenever there is a loss', 'In the short run a loss smaller than the fixed cost beats shutting down.'],
      ], 'Short run: below 10 shut down; 10–14 operate at a loss; above 14 profit. Long run: below 12 exit; above 12 stay.'),
      parts: [
        FIX('$P = 9$, this period', ['shut down', 'operate at a loss', 'operate at a profit'], 0, [null, '9 < min AVC = 10: every unit loses money even before fixed cost.', 'Profit needs P above min AC = 14.']),
        FIX('$P = 9$, if it stays', ['exit', 'stay'], 0, [null, '9 < min LRAC = 12: no plant size breaks even.']),
        FIX('$P = 11$, this period', ['shut down', 'operate at a loss', 'operate at a profit'], 1, ['11 > min AVC = 10: producing covers variable cost and part of the fixed cost.', null, '11 < min AC = 14: a loss.']),
        FIX('$P = 11$, if it stays', ['exit', 'stay'], 0, [null, '11 < min LRAC = 12: even the best plant loses money.']),
        FIX('$P = 13$, this period', ['shut down', 'operate at a loss', 'operate at a profit'], 1, ['13 > min AVC = 10.', null, '13 < min AC = 14 with the current plant.']),
        FIX('$P = 13$, if it stays', ['exit', 'stay'], 1, ['13 > min LRAC = 12: with a better-sized plant it makes a profit, so it re-sizes and stays.', null]),
        FIX('$P = 15$, this period', ['shut down', 'operate at a loss', 'operate at a profit'], 2, ['15 > min AVC.', '15 > min AC = 14: profit.', null]),
      ],
      sol: md`
        **Move 1: three short-run zones.** Below min AVC (10): shut down. Between 10 and min AC (14): operate at a loss. Above 14: profit.

        **Move 2: one long-run cutoff.** Below min LRAC (12): exit. Above 12: stay (re-sizing the plant if that helps).

        | Price | This period | If it stays |
        |---|---|---|
        | 9 | shut down, lose $F$ | exit |
        | 11 | operate at a loss | exit |
        | 13 | operate at a loss | stay, with a better plant: profit |
        | 15 | operate at a profit | stay (and entry will push the price down toward 12) |

        **The interesting one is \$13:** a loss with today's plant, yet worth staying, because in the long run the firm can choose a plant whose average cost dips to 12.
      ` }),
  ];

  // ------------------------------------------------------------------ HW-style, part C (Lectures 18–19)
  const mono2Fig = EC.graph({
    w: 330, h: 260, x: [0, 64], y: [0, 126], xl: 'Q', yl: 'P', xt: [20, 30, 60], yt: [40, 60, 80, 120],
    items: [
      { poly: [[0, 80], [0, 120], [20, 80]], cls: 'cs' },
      { poly: [[0, 0], [0, 80], [20, 80], [20, 40]], cls: 'gain' },
      { poly: [[20, 80], [20, 40], [30, 60]], cls: 'loss' },
      { seg: [[0, 120], [60, 0]], cls: 'curve', lab: 'D', at: 0.93, dx: 4, dy: -4, anchor: 'bl' },
      { seg: [[0, 120], [30, 0]], cls: 'curve c4', lab: 'MR', at: 0.9, dx: 4, dy: 0, anchor: 'l' },
      { seg: [[0, 0], [62, 124]], cls: 'curve c5', lab: 'MC', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { pt: [20, 80], guide: true }, { pt: [20, 40], guide: 'y' }, { pt: [30, 60] },
      { text: [6, 90], t: 'CS' }, { text: [9, 52], t: 'PS' },
    ],
  });
  const hwC = [
    P({ src: 'HW-style 13', title: 'Monopoly with rising marginal cost',
      q: md`A monopolist faces $P = 120 - 2Q$ and has $C(Q) = Q^2 + 100$. **(a)** Find MR, the profit-maximizing $Q$ and $P$, and profit. **(b)** Find CS, PS and the deadweight loss relative to the $P = MC$ outcome. **(c)** Find the Lerner index and the price elasticity of demand at the optimum, and check that $L = -1/\varepsilon_p$.`,
      plan: [PLAN_MRMC, PLAN_DWL,
        plan('Part (c): how do you get the elasticity at the optimum?', '$\\varepsilon_p = \\frac{dQ}{dP}\\cdot\\frac{P}{Q}$, with $dQ/dP = -\\tfrac12$ from $Q = 60 - P/2$', [
          ['Use $-2$ as $dQ/dP$', 'That is $dP/dQ$, the slope of the **inverse** demand. Elasticity needs $dQ/dP = -1/2$.'],
          ['$\\frac{dQ}{dP}\\cdot\\frac{Q}{P}$', 'Price over quantity, not quantity over price.'],
          ['Lerner $= (P - MC)/MC$', 'The Lerner index divides by the price: $(P - MC)/P$.'],
        ], 'At $(20, 80)$: $\\varepsilon_p = -\\tfrac12 \\cdot 80/20$. $L = (80 - MC(20))/80$.'),
      ],
      parts: [X('MR(Q)', '120 - 4*Q', { Q: [0, 30] }), N('Q^*', 20), N('P^*', 80), N('\\pi', 1100), N('CS', 400), N('PS', 1200), N('DWL', 200), N('L', 0.5), N('\\varepsilon_p', -2)],
      sol: md`
        **Move 1: MR = MC (a).** $MR = 120 - 4Q$ (twice the slope), $MC = 2Q$:
        $$120 - 4Q = 2Q \;\Rightarrow\; Q^* = 20, \qquad P^* = 120 - 40 = 80$$
        $TR = 1600$, $TC = 400 + 100 = 500$, $\pi = 1100$.

        **Move 2: surpluses (b).** $CS = \tfrac12(20)(120 - 80) = 400$. $PS = TR - VC = 1600 - 400 = 1200$ (and $\pi = PS - F = 1100$ ✓). Competitive benchmark: $120 - 2Q = 2Q \Rightarrow Q = 30$. At $Q = 20$ the gap between demand and MC is $80 - 40 = 40$:
        $$DWL = \tfrac12(30 - 20)(40) = 200$$
        Check: competitive welfare $= \tfrac12(30)(120) = 1800$; monopoly $400 + 1200 = 1600$; difference 200 ✓.

        **Move 3: Lerner and elasticity (c).** $L = (80 - 40)/80 = 0.5$. Direct demand $Q = 60 - P/2$, so $\varepsilon_p = -\tfrac12 \cdot \tfrac{80}{20} = -2$, and $-1/\varepsilon_p = 0.5 = L$ ✓. Elastic ($|\varepsilon_p| > 1$), as a monopoly optimum must be.

        [[fig:m]]
      `, figs: { m: { svg: mono2Fig, cap: 'MR meets MC at Q = 20 (height 40); the price 80 is read off demand. Blue: CS 400. Green: PS 1200. Red: DWL 200 between 20 and 30.' } } }),
    P({ src: 'HW-style 14', title: 'Marginal revenue from a table',
      q: md`A monopolist's demand schedule is below. Marginal cost is a constant \$6 per unit, and the fixed cost is \$10.

      | $Q$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
      |---|---|---|---|---|---|---|---|
      | $P$ | 22 | 20 | 18 | 16 | 14 | 12 | 10 |

      **(a)** Find total revenue and the marginal revenue of each unit. **(b)** How many units does it sell, at what price, and what is its profit? **(c)** Why not 5 or 6 units, where total revenue is largest?`,
      plan: [
        plan('Part (a): how do you get MR from a table?', 'MR of the $n$th unit $= TR(n) - TR(n - 1)$', [
          ['MR = the price of that unit', 'To sell one more unit the monopolist cuts the price on all earlier units too, so MR is below the price.'],
          ['MR $= TR/Q$', 'That is average revenue, which is just the price.'],
          ['MR = the change in price', 'The price falls by 2 each step, but revenue changes by more than that.'],
        ], 'TR row: $P \\times Q$. Then subtract neighbors.'),
        plan('Part (b): how many units?', 'Keep selling while the next unit\'s MR is at least MC (6)', [
          ['Where TR is largest', 'That ignores cost: units 5 and 6 add 4 and 0 to revenue but cost 6 each.'],
          ['Where $P = MC$', 'That is the competitive rule. A monopolist compares MC with MR, not with the price.'],
          ['Where profit per unit is largest', 'The goal is total profit, not profit per unit.'],
        ], 'MR of units 1 to 4: 20, 16, 12, 8 (all ≥ 6). Unit 5: 4 < 6. Stop at 4.'),
      ],
      parts: [N('TR(3)', 48), N('MR\\text{ of unit 3}', 12), N('MR\\text{ of unit 5}', 4), N('Q^*', 4), N('P^*', 14), N('\\pi', 22),
        FIX('(c) It stops before TR peaks because…', ['units 5 and 6 add less revenue than they cost', 'demand is inelastic at 4 units', 'the price would fall below MC'], 0,
          [null, 'At $Q = 4$, $P = 14$: $\\varepsilon_p = -\\tfrac12 \\cdot 14/4 = -1.75$, elastic.', 'At 5 units the price is 12, still above MC; the problem is MR (4), not the price.'])],
      sol: md`
        **Move 1: TR and MR (a).**

        | $Q$ | 1 | 2 | 3 | 4 | 5 | 6 |
        |---|---|---|---|---|---|---|
        | $TR$ | 20 | 36 | 48 | 56 | 60 | 60 |
        | $MR$ | 20 | 16 | 12 | 8 | 4 | 0 |

        **Move 2: compare MR with MC = 6 (b).** Units 1–4 each add at least \$8 of revenue for \$6 of cost: sell them. Unit 5 adds \$4 for \$6: don't. So $Q^* = 4$ at $P^* = 14$.
        $$\pi = 56 - 6(4) - 10 = 22$$
        Check the neighbors: $Q = 3$: $48 - 18 - 10 = 20$; $Q = 5$: $60 - 30 - 10 = 20$. Both lower ✓.

        **Move 3: why not 5 or 6 (c).** Revenue peaks at 5–6 units, but the 5th unit adds only \$4 and the 6th \$0 of revenue while each costs \$6. Profit, not revenue, is the goal.

        **Link to the formula.** Demand is $P = 22 - 2Q$, so $MR = 22 - 4Q$. Setting $22 - 4Q = 6$ gives $Q = 4$ ✓. (The table's MR of unit $n$ equals the formula at $n - \tfrac12$: e.g. unit 3: $22 - 4(2.5) = 12$.)
      ` }),
    P({ src: 'HW-style 15', title: 'Elasticity, markups and the Lerner index',
      q: md`**(a)** A monopolist faces constant-elasticity demand $Q = 270{,}000\,P^{-3}$ and has $MC = 20$. Find its price, quantity and Lerner index. **(b)** Another monopolist charges \$40 and has a Lerner index of 0.25. Find its marginal cost and the elasticity of demand at its price. **(c)** A third monopolist says the elasticity of demand at its current price is $-0.8$. Is it maximizing profit?`,
      plan: [
        plan('Part (a): how do you get MR for $Q = kP^{-3}$?', '$MR = P(1 + 1/\\varepsilon_p)$ with $\\varepsilon_p = -3$; set it equal to MC', [
          ['$MR = a - 2bQ$', 'That shortcut is for linear demand only.'],
          ['Set $P = MC$', 'That is the competitive price.'],
          ['Use $\\varepsilon_p = -1/3$', 'For $Q = kP^{-e}$ the elasticity is $-e$, here $-3$.'],
        ], '$P(1 - \\tfrac13) = 20 \\Rightarrow P = 30$. Then $Q = 270{,}000/30^3$.'),
        plan('Part (b): you know $P$ and $L$. How do you get MC and the elasticity?', 'Solve $L = (P - MC)/P$ for MC; then $L = -1/\\varepsilon_p$ gives $\\varepsilon_p$', [
          ['$MC = L \\times P$', '$L \\times P$ is the markup $P - MC$, not MC itself.'],
          ['$\\varepsilon_p = -L$', '$L = -1/\\varepsilon_p$, so $\\varepsilon_p = -1/L$.'],
          ['$\\varepsilon_p = 1/L$', 'Demand elasticity is negative.'],
        ], '$0.25 = (40 - MC)/40 \\Rightarrow MC = 30$; $\\varepsilon_p = -1/0.25$.'),
        plan('Part (c): elasticity $-0.8$ at the current price. Profit-maximizing?', 'No: demand is inelastic, so MR is negative; raising the price raises revenue and cuts cost', [
          ['Yes, if MR = MC there', 'With $\\varepsilon_p = -0.8$, $MR = P(1 - 1.25) < 0$, which can never equal a positive MC.'],
          ['Yes: inelastic demand is good for a seller', 'It is a signal to raise the price further, until demand becomes elastic.'],
          ['It should lower its price', 'On inelastic demand a lower price cuts revenue and raises output and cost.'],
        ], 'A monopolist always prices on the elastic part of demand ($|\\varepsilon_p| > 1$).'),
      ],
      parts: [N('P', 30), N('Q', 10), N('L', 1 / 3), N('MC\\text{ (b)}', 30), N('\\varepsilon_p\\text{ (b)}', -4),
        FIX('(c) Is it maximizing profit?', ['no: it should raise its price', 'yes', 'no: it should lower its price'], 0, [null, 'MR is negative at an inelastic point, so MR ≠ MC.', 'A lower price on inelastic demand lowers revenue.'])],
      sol: md`
        **Move 1: constant elasticity (a).** $MR = P(1 + 1/\varepsilon_p) = P(1 - \tfrac13) = \tfrac23P$. Set $\tfrac23P = 20 \Rightarrow P = 30$. $Q = 270{,}000/27{,}000 = 10$. $L = (30 - 20)/30 = 1/3 = -1/(-3)$ ✓.

        **Move 2: back out MC (b).** $0.25 = (40 - MC)/40 \Rightarrow 40 - MC = 10 \Rightarrow MC = 30$. $\varepsilon_p = -1/L = -4$.

        **Move 3: inelastic means not optimal (c).** $MR = P(1 + 1/(-0.8)) = P(1 - 1.25) = -0.25P < 0$. The last unit **lowers** revenue and still costs something. Raise the price: revenue rises, output and cost fall. Keep going until demand is elastic.
      ` }),
    P({ src: 'HW-style 16', title: 'Specific versus ad valorem tax on a monopoly',
      q: md`A monopolist faces $P = 100 - Q$ with $MC = 20$ and no fixed cost. **(a)** Find the untaxed $Q$, $P$ and DWL. **(b)** A specific tax of \$10 per unit: find $Q$, $P_c$, $P_p$, tax revenue, DWL and the pass-through $\Delta P_c/t$. **(c)** Instead, a 20% ad valorem tax: find $Q$, $P_c$, $P_p$, revenue and DWL. **(d)** Which tax raises more revenue, and which leaves more output?`,
      plan: [
        plan('Part (b): how does a \\$10 specific tax change the monopolist\'s problem?', 'It keeps $P_c - 10$: effective demand $90 - Q$, so set $90 - 2Q = 20$ (equivalently $MR = MC + 10$)', [
          ['Add 10 to the untaxed price', 'With linear demand and constant MC the monopolist passes on only half of the tax.'],
          ['Set $P = MC + 10$', 'That is the competitive rule.'],
          ['Multiply demand by 0.9', 'That is a 10% ad valorem tax, not \\$10 a unit.'],
        ], '$Q = 35$; $P_c$ from demand; $P_p = P_c - 10$.'),
        PLAN_ADV, PLAN_DWL,
      ],
      parts: [N('Q\\text{ untaxed}', 40), N('P\\text{ untaxed}', 60), N('DWL\\text{ untaxed}', 800),
        N('Q\\ (t = 10)', 35), N('P_c\\ (t = 10)', 65), N('P_p\\ (t = 10)', 55), N('\\text{revenue}\\ (t = 10)', 350), N('DWL\\ (t = 10)', 1012.5), N('\\Delta P_c/t', 0.5),
        N('Q\\ (v = 0.2)', 37.5), N('P_c\\ (v = 0.2)', 62.5), N('P_p\\ (v = 0.2)', 50), N('\\text{revenue}\\ (v = 0.2)', 468.75), N('DWL\\ (v = 0.2)', 903.125),
        FIX('(d) Here the ad valorem tax…', ['raises more revenue and leaves more output', 'raises less revenue but leaves more output', 'raises more revenue but leaves less output'], 0,
          [null, '468.75 > 350.', '37.5 > 35 units.'])],
      sol: md`
        **Move 1: untaxed (a).** $MR = 100 - 2Q = 20 \Rightarrow Q = 40$, $P = 60$. Efficient: $100 - Q = 20 \Rightarrow Q = 80$. $DWL = \tfrac12(80 - 40)(60 - 20) = 800$.

        **Move 2: specific tax (b).** The firm keeps $P_c - 10$: effective demand $P_p = 90 - Q$, effective $MR = 90 - 2Q$.
        $$90 - 2Q = 20 \;\Rightarrow\; Q = 35, \quad P_c = 100 - 35 = 65, \quad P_p = 55$$
        Revenue $= 10 \times 35 = 350$. $DWL = \tfrac12(80 - 35)(65 - 20) = 1012.5$. Pass-through $= (65 - 60)/10 = 0.5$: half the tax shows up in the price.

        **Move 3: ad valorem tax (c).** The firm keeps 80%: $P_p = 0.8(100 - Q) = 80 - 0.8Q$, so $MR_{\text{eff}} = 80 - 1.6Q$.
        $$80 - 1.6Q = 20 \;\Rightarrow\; Q = 37.5, \quad P_c = 62.5, \quad P_p = 0.8(62.5) = 50$$
        Revenue $= (62.5 - 50)(37.5) = 468.75$. $DWL = \tfrac12(80 - 37.5)(62.5 - 20) = 903.125$.

        **Move 4: compare (d).** The 20% tax raises **more** revenue (468.75 vs 350) and leaves **more** output (37.5 vs 35), so less DWL. An ad valorem tax shrinks the monopolist's markup along with its revenue, so it distorts output less per dollar raised.
      ` }),
    P({ src: 'HW-style 17', title: 'Pass-through above 100%',
      q: md`**(a)** A monopolist faces constant-elasticity demand with $\varepsilon_p = -2$ and has $MC = 10$. Find its price. A specific tax of \$5 per unit is imposed: find the new consumer price, the pass-through $\Delta P_c/t$, and the price the firm keeps. **(b)** Compare: linear demand $P = 40 - Q$, the same $MC = 10$ and \$5 tax. Find the consumer price before and after the tax, and the pass-through.`,
      plan: [
        plan('Part (a): how does the tax enter with constant elasticity?', 'The firm\'s cost per unit becomes $MC + t$: set $P(1 + 1/\\varepsilon_p) = MC + t$, so $P = 2(MC + t)$', [
          ['Pass-through is always 50%', 'That is the linear-demand result. With constant elasticity the price is a fixed multiple of cost, so it rises by a multiple of the tax.'],
          ['Pass-through can never exceed 100%', 'Here $P = 2(MC + t)$: each \\$1 of tax adds \\$2 to the price.'],
          ['Set $P = MC + t$', 'That is the competitive rule.'],
        ], 'Untaxed $P = 2(10)$; taxed $P_c = 2(15)$; $P_p = P_c - 5$.'),
        plan('Part (b): linear demand with the tax?', 'Set $MR = MC + t$: $40 - 2Q = 15$, then $P_c$ from demand', [
          ['$P_c = 25 + 5$', 'With linear demand the monopolist absorbs half the tax.'],
          ['$P_c = 2(MC + t)$', 'That markup rule is for constant elasticity $-2$ only.'],
          ['$40 - Q = 15$', 'That uses demand as MR: the competitive rule with the tax.'],
        ], '$Q = 12.5$, $P_c = 27.5$, pass-through $(27.5 - 25)/5$.'),
      ],
      parts: [N('P\\text{ untaxed (a)}', 20), N('P_c\\text{ (a)}', 30), N('\\Delta P_c/t\\text{ (a)}', 2), N('P_p\\text{ (a)}', 25),
        N('P\\text{ untaxed (b)}', 25), N('P_c\\text{ (b)}', 27.5), N('\\Delta P_c/t\\text{ (b)}', 0.5)],
      sol: md`
        **Move 1: constant elasticity (a).** $MR = P(1 + 1/(-2)) = P/2$. Untaxed: $P/2 = 10 \Rightarrow P = 20$. With the tax the cost per unit is $10 + 5 = 15$: $P_c/2 = 15 \Rightarrow P_c = 30$.
        Pass-through $= (30 - 20)/5 = 2$: **200%**. The firm keeps $P_p = 30 - 5 = 25$, more than its untaxed price of 20.

        **Move 2: linear (b).** $MR = 40 - 2Q$. Untaxed: $40 - 2Q = 10 \Rightarrow Q = 15$, $P = 25$. Taxed: $40 - 2Q = 15 \Rightarrow Q = 12.5$, $P_c = 27.5$. Pass-through $= 2.5/5 = 0.5$: 50%.

        **Why so different?** With constant elasticity the monopolist always charges the same **multiple** of its cost (here twice). The tax raises cost by 5, so the price rises by 10. With linear demand MR falls twice as fast as demand, so only half of a cost increase reaches the price.
      ` }),
    P({ src: 'HW-style 18', title: 'Regulating a gas utility',
      q: md`A city's gas utility faces $P = 50 - Q$ and has $C(Q) = 300 + 10Q$. **(a)** Unregulated: find $Q$, $P$, profit and the DWL. **(b)** A $P = MC$ ceiling: find $Q$ and profit. What happens in the long run? **(c)** A $P = AC$ ceiling: find $Q$, $P$ and the remaining DWL.`,
      plan: [PLAN_MRMC, PLAN_MCCEIL(10, 40), PLAN_ACEQ('50 - Q', '10 + \\dfrac{300}{Q}', 'Q^2 - 40Q + 300 = 0'), PLAN_ROOT(10, 30, 40, 30), PLAN_REGDWL(30, 40)],
      parts: [N('Q^M', 20), N('P^M', 30), N('\\pi^M', 100), N('DWL^M', 200), N('Q\\text{ at }P = MC', 40), N('\\pi\\text{ at }P = MC', -300), N('Q\\text{ at }P = AC', 30), N('P\\text{ at }P = AC', 20), N('DWL\\text{ at }P = AC', 50)],
      sol: md`
        **Move 1: unregulated (a).** $MR = 50 - 2Q = 10 \Rightarrow Q = 20$, $P = 30$. $\pi = 600 - (300 + 200) = 100$. Efficient: $50 - Q = 10 \Rightarrow Q = 40$. $DWL = \tfrac12(40 - 20)(30 - 10) = 200$.

        **Move 2: $P = MC$ ceiling (b).** $P = 10$, $Q = 40$. $\pi = 400 - (300 + 400) = -300$: the whole fixed cost. In the long run the utility exits unless it gets a subsidy of 300 a period.

        **Move 3: $P = AC$ ceiling (c).** $50 - Q = 10 + \dfrac{300}{Q}$. Multiply by $Q$: $50Q - Q^2 = 10Q + 300$, so
        $$Q^2 - 40Q + 300 = 0 \;\Rightarrow\; Q = \frac{40 \pm \sqrt{1600 - 1200}}{2} = \frac{40 \pm 20}{2} = 10 \text{ or } 30$$
        Take $Q = 30$ (at 10 the price would be 40, above the monopoly price 30, so that ceiling would not bind). $P = 20$; check $AC(30) = 10 + 10 = 20$ ✓; profit 0.

        **Move 4: remaining DWL.** $\tfrac12(40 - 30)(20 - 10) = 50$, down from 200.
      ` }),
    G('m3_ds_natmono', { need: 1 }),
    G('m3_ds_mono_tax', { need: 1 }),
  ];

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3ds', exam: 'm3', tools: true, num: 'Mini Exam 3', title: 'DS8–DS10 and homework-style problems',
    lessons: [
      { id: 'm3-ds8', title: 'DS8 · profits and supply', kind: 'hw', ref: 'Lectures 14–15', sub: 'Food truck: pMP = w and isoprofit lines · Dent: AC, AVC, MC and the profit rectangle · the shutdown price', steps: ds8 },
      { id: 'm3-ds9', title: 'DS9 · long-run supply and policy', kind: 'hw', ref: 'Lectures 16–17', sub: 'The exit price · equilibrium and surplus triangles · a price support and its welfare table', steps: ds9 },
      { id: 'm3-ds10', title: 'DS10 · monopoly', kind: 'hw', ref: 'Lectures 18–19', sub: 'MR = MC and the DWL triangle · a 40% ad valorem tax · regulating a natural monopoly (MC and AC ceilings)', steps: ds10 },
      { id: 'm3-hw', title: 'HW8–HW10 style: fresh problems', kind: 'hw', ref: 'Lectures 14–19', sub: 'Profit, input choice, supply, long run, welfare, taxes and price controls, monopoly, regulation: plan first, then numbers', steps: [...hwA, ...hwB, ...hwC] },
    ],
  });
})();

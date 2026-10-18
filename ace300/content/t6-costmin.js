/* Part 5: cost minimization. Isocost lines, tangency, Cobb–Douglas solutions, corners and kinks, scale. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const VY = { y: [1, 50] };

  const isoFig = EC.graph({
    w: 300, h: 230, x: [0, 18], y: [0, 35], xl: 'x_1', yl: 'x_2', xt: [8, 12, 16], yt: [16, 24, 32],
    items: [
      { seg: [[0, 16], [8, 0]], cls: 'curve dim', lab: '\\$160', at: 0.75, dx: 4 },
      { seg: [[0, 24], [12, 0]], lab: '\\$240', at: 0.8, dx: 4 },
      { seg: [[0, 32], [16, 0]], cls: 'curve dim', lab: '\\$320', at: 0.85, dx: 4 },
      { pt: [0, 24] }, { pt: [12, 0] },
    ],
  });
  const tanFig = EC.graph({
    w: 310, h: 250, x: [0, 32], y: [0, 105], xl: 'x_1', yl: 'x_2', xt: [10, 20, 25], yt: [40, 80, 100],
    items: [
      { f: (x) => 400 / x, from: 3.9, to: 31.5, cls: 'c2', lab: 'y = 80', labX: 31, dy: -6, anchor: 'br', dx: 0 },
      { seg: [[0, 60], [15, 0]], cls: 'curve dim dash' },
      { seg: [[0, 80], [20, 0]] },
      { seg: [[0, 100], [25, 0]], cls: 'curve dim dash' },
      { pt: [10, 40], lab: 'A\\,(10,\\,40)', at: 'tr', guide: true },
    ],
  });
  const subFig = EC.graph({
    w: 300, h: 220, x: [0, 23], y: [0, 13], xl: 'x_1', yl: 'x_2', xt: [10, 20], yt: [10],
    items: [
      { seg: [[0, 10], [20, 0]], cls: 'curve c2', lab: 'x_1 + 2x_2 = 20', at: 0.55, dx: 6 },
      { seg: [[0, 10], [10, 0]], lab: '\\text{cost } 10', at: 0.75, anchor: 'tr', dx: -4, dy: 0 },
      { pt: [0, 10], lab: '(0,\\,10)', at: 'tr' },
    ],
  });
  const compFig = EC.graph({
    w: 300, h: 230, x: [0, 18], y: [0, 16], xl: 'x_1', yl: 'x_2', xt: [10, 15], yt: [5, 15],
    items: [
      { pts: [[10, 15], [10, 5], [17.5, 5]], cls: 'curve c2', lab: 'y = 10', labI: 2, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 15], [15, 0]], lab: '\\text{cost } 15', at: 0.1, dx: 6 },
      { pt: [10, 5], lab: '(10,\\,5)', at: 'tr' },
    ],
  });

  C.unit({
    id: 'u5', exam: 'm2', num: 'Part 5', title: 'Cost minimization',
    lessons: [
      // ------------------------------------------------------------------ l13
      {
        id: 'l13', title: 'Isocost lines and the tangency rule',
        steps: [
          R(md`
            ### The firm’s problem

            The firm has an order to fill: make $y$ units. There are many input bundles that make $y$ (the whole isoquant). Which one is **cheapest**?

            This is the consumer’s problem turned around:
            - The consumer fixes a **budget** and looks for the highest indifference curve.
            - The firm fixes an **output** and looks for the lowest cost line.
          `),
          RF(md`
            ### Isocost lines

            An **isocost line** is every input bundle that costs the **same** total amount:
            $$\bar C = w_1x_1 + w_2x_2$$
            where $w_1, w_2$ are the input prices (wage, rental rate, price per pound…).

            **Example.** $w_1 = \$20$, $w_2 = \$10$, total cost \$240: $20x_1 + 10x_2 = 240$.

            - Vertical intercept (all $x_2$): $\bar C/w_2 = 240/10 = 24$.
            - Horizontal intercept (all $x_1$): $\bar C/w_1 = 240/20 = 12$.
            - Slope: $-w_1/w_2 = -20/10 = -2$. Solving for $x_2$: $x_2 = 24 - 2x_1$.

            [[fig:iso]]

            A **higher** cost with the **same** prices shifts the line **out in parallel** (the slope $-w_1/w_2$ does not change).

            !!key Isocost facts
              Intercepts $\bar C/w_1$ and $\bar C/w_2$. Slope $-w_1/w_2$. Exactly like a budget line, with $\bar C$ for income and $w$ for prices.
          `, { iso: { svg: isoFig, cap: 'Three isocost lines with the same prices: parallel, slope −2.' } }),
          P({ q: md`Labor costs \$15 an hour ($w_1$) and capital rents for \$5 an hour ($w_2$). Draw the \$300 isocost line.`,
            parts: [N('x_1\\text{ intercept}', 20), N('x_2\\text{ intercept}', 60), N('\\text{slope}', -3)],
            hints: ['Intercepts: $300/15$ and $300/5$.'],
            sol: md`$15x_1 + 5x_2 = 300$. Intercepts $300/15 = 20$ and $300/5 = 60$. Slope $-15/5 = -3$.` }),
          Q(md`Input prices stay the same, but the firm considers a **more expensive** input bundle. Its isocost line…`, ['shifts outward in parallel', 'pivots inward around the x₂-intercept', 'becomes flatter', 'stays exactly where it is'], 0,
            [null, 'A pivot needs a price change.', 'Flatter would need $w_1/w_2$ to fall.', 'More cost means a different line.'],
            md`With prices fixed the slope $-w_1/w_2$ is fixed. Only the intercepts $\bar C/w_i$ grow, so the line shifts out in parallel.`),
          Q(md`The price of input 1 ($w_1$, horizontal axis) **rises**, everything else fixed. The isocost line for the same $\bar C$…`, ['pivots inward around the x₂-intercept', 'shifts inward in parallel', 'pivots outward around the x₁-intercept', 'becomes flatter'], 0,
            [null, 'Parallel needs both intercepts to move by the same proportion.', 'The $x_1$-intercept $\\bar C/w_1$ shrinks.', 'The slope $-w_1/w_2$ gets steeper.'],
            md`$\bar C/w_1$ falls, $\bar C/w_2$ stays. The line pivots in around the $x_2$-intercept and gets steeper.`),

          RF(md`
            ### Finding the cheapest bundle

            Draw the required isoquant. Then slide an isocost line in toward the origin as far as you can while it still **touches** the isoquant.

            - Too low ($\$240$): never reaches the isoquant. Cannot make 80 units.
            - Too high ($\$400$): crosses the isoquant. Works, but wastes money.
            - Just right ($\$320$): touches at one point, **A**. That is the least-cost bundle.

            [[fig:tan]]

            At A the isocost line and the isoquant are **tangent**: same slope.

            !!key The tangency condition (smooth, interior case)
              $$\underbrace{\frac{MP_1}{MP_2}}_{\text{isoquant slope}} = \underbrace{\frac{w_1}{w_2}}_{\text{isocost slope}} \quad\Longleftrightarrow\quad \frac{MP_1}{w_1} = \frac{MP_2}{w_2}$$
          `, { tan: { svg: tanFig, cap: 'Solid: the \\$320 isocost line, tangent to the 80-unit isoquant at A. Dashed: \\$240 (cannot reach 80 units) and \\$400 (wasteful).' } }),
          R(md`
            ### Why the tangency makes sense: output per dollar

            $MP_1/w_1$ is the **extra output from one more dollar** spent on input 1. Same for input 2.

            Suppose $MP_1/w_1 = 3$ and $MP_2/w_2 = 1$. Move \$1 from input 2 to input 1:
            - Lose 1 unit of output from input 2.
            - Gain 3 units from input 1.

            Output goes **up** and cost is unchanged. So the firm could make the same output for **less** money. The firm keeps shifting until the two are **equal**; that is the cheapest bundle.

            !!method Which way to move
              If $MP_1/w_1 > MP_2/w_2$: use **more input 1, less input 2**.
              If $MP_1/w_1 < MP_2/w_2$: use **more input 2, less input 1**.
              Equal: you are at the cost-minimizing bundle (if both inputs are used).
          `),
          Q(md`At the current bundle, $MP_1/w_1$ is **greater** than $MP_2/w_2$. How can the firm cut cost without lowering output?`, ['Use more input 1 and less input 2', 'Use less input 1 and more input 2', 'Increase both inputs', 'Decrease both inputs'], 0,
            [null, 'That moves money toward the input with lower output per dollar.', 'That raises output and cost.', 'That lowers output.'],
            md`Input 1 gives more output per dollar. Shift spending toward input 1 and away from input 2.`),
          P({ q: md`$MP_1 = 10$, $w_1 = \$5$, $MP_2 = 6$, $w_2 = \$2$.`,
            parts: [N('MP_1/w_1', 2), N('MP_2/w_2', 3), FIX('To cut cost at the same output, use more of…', ['input 1', 'input 2'], 1, ['Input 1 gives only 2 units per dollar.', null])],
            sol: md`$MP_1/w_1 = 2$, $MP_2/w_2 = 3$. A dollar on input 2 buys more output, so use more input 2 and less input 1.` }),
          Q(md`A firm is at a bundle where $MP_1/MP_2 = 2$, and $w_1/w_2 = 3$. Which is true?`, ['It should use less input 1 and more input 2', 'It is minimizing cost already', 'It should use more input 1 and less input 2', 'It should increase both inputs equally'], 0,
            [null, 'It would need $MP_1/MP_2 = w_1/w_2$.', 'Compare output per dollar: here input 1 gives less per dollar, not more.', 'Scaling both changes output.'],
            md`$MP_1/MP_2 = 2 < 3 = w_1/w_2$ means $MP_1/w_1 < MP_2/w_2$: input 1 is less productive per dollar. Use less input 1, more input 2.`),
          G('isocost_mp', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l14
      {
        id: 'l14', title: 'Solving Cobb–Douglas cost minimization',
        steps: [
          R(md`
            ### Two equations, two unknowns

            For a Cobb–Douglas technology with both inputs used, the cheapest bundle satisfies:

            1. **Tangency:** $\dfrac{MP_1}{MP_2} = \dfrac{w_1}{w_2}$. This gives the **ratio** of the inputs.
            2. **Output target:** $f(x_1, x_2) = y$. This pins down the **level**.

            Then the cost is $C = w_1x_1^* + w_2x_2^*$.
          `),
          R(md`
            ### Worked example: the candy factory

            $y = 4\sqrt{x_1x_2} = 4x_1^{0.5}x_2^{0.5}$, $w_1 = \$16$, $w_2 = \$4$, target $y = 80$.

            **Step 1. Set up.** Minimize $C = 16x_1 + 4x_2$ subject to $4\sqrt{x_1x_2} = 80$.

            **Step 2. Ratio from tangency.** $MP_1 = 2\sqrt{x_2/x_1}$ and $MP_2 = 2\sqrt{x_1/x_2}$, so
            $$\frac{MP_1}{MP_2} = \frac{x_2}{x_1} = \frac{w_1}{w_2} = \frac{16}{4} = 4 \quad\Rightarrow\quad x_2 = 4x_1$$

            **Step 3. Plug into the target.** $4\sqrt{x_1 \cdot 4x_1} = 4 \cdot 2x_1 = 8x_1 = 80 \Rightarrow x_1^* = 10$, so $x_2^* = 40$.

            **Step 4. Cost.** $C = 16(10) + 4(40) = 160 + 160 = \$320$.

            **Check:** $4\sqrt{10 \cdot 40} = 4 \cdot 20 = 80$ ✓.

            !!intuition The cheaper input gets used more
              Input 2 costs a quarter as much, so the firm uses four times as much of it: $x_2 = 4x_1$.
          `),
          Q(md`In the candy example, why is $x_2 = 4x_1$ at the optimum?`, ['Input 2 costs one fourth as much as input 1', 'Input 2 has four times the exponent of input 1', 'The firm must spend 4 times as much on input 2', 'Output is 4 times input 2'], 0,
            [null, 'The exponents are equal (both 0.5).', 'Spending is equal: \\$160 on each.', 'Unrelated.'],
            md`With equal exponents, $x_2/x_1 = w_1/w_2 = 16/4 = 4$. The input that is 4× cheaper is used 4× as much. (Spending ends up equal.)`),
          P({ q: md`A firm makes 24 units with $y = 2\sqrt{x_1x_2}$, $w_1 = \$4$, $w_2 = \$1$.`,
            parts: [N('x_2/x_1\\text{ (input ratio)}', 4), N('x_1^*', 6), N('x_2^*', 24), N('C', 48)],
            hints: ['Equal exponents: $x_2/x_1 = w_1/w_2$.', '$2\\sqrt{x_1 \\cdot 4x_1} = 4x_1 = 24$.'],
            sol: md`Tangency: $x_2/x_1 = 4/1 \Rightarrow x_2 = 4x_1$. Target: $2\sqrt{4x_1^2} = 4x_1 = 24 \Rightarrow x_1 = 6$, $x_2 = 24$. $C = 4(6) + 1(24) = \$48$. Check: $2\sqrt{144} = 24$ ✓.` }),
          P({ q: md`$y = x_1^{0.5}x_2^{0.5}$, $w_1 = \$9$, $w_2 = \$4$, target $y = 12$.`,
            parts: [N('x_1^*', 8), N('x_2^*', 18), N('C', 144)],
            hints: ['$x_2/x_1 = 9/4$, so $x_2 = 2.25x_1$.', '$\\sqrt{x_1 \\cdot 2.25x_1} = 1.5x_1$.'],
            sol: md`$x_2 = 2.25x_1$. Target: $\sqrt{2.25x_1^2} = 1.5x_1 = 12 \Rightarrow x_1 = 8$, $x_2 = 18$. $C = 9(8) + 4(18) = 72 + 72 = \$144$.` }),

          R(md`
            ### When the exponents are different

            The ratio is no longer just $w_1/w_2$. Use the TRS shortcut from Part 4: for $y = Ax_1^ax_2^b$, $\dfrac{MP_1}{MP_2} = \dfrac{a}{b}\cdot\dfrac{x_2}{x_1}$.

            **Example.** $y = x_1^{1/3}x_2^{2/3}$, $w_1 = \$2$, $w_2 = \$4$, $y = 10$.

            - Tangency: $\dfrac{1/3}{2/3}\cdot\dfrac{x_2}{x_1} = \dfrac{x_2}{2x_1} = \dfrac{2}{4} \Rightarrow x_2 = x_1$.
            - Target: $x_1^{1/3}x_1^{2/3} = x_1 = 10$. So $(x_1^*, x_2^*) = (10, 10)$.
            - Cost: $2(10) + 4(10) = \$60$.

            !!mistake Dropping the a/b factor
              $x_2/x_1 = w_1/w_2$ only works when $a = b$. With unequal exponents, keep the $a/b$.
          `),
          P({ q: md`$y = x_1^{0.25}x_2^{0.75}$, $w_1 = \$1$, $w_2 = \$3$, target $y = 20$.`,
            parts: [X('x_2 \\text{ in terms of } x_1', 'x1', { x1: [1, 9] }), N('x_1^*', 20), N('x_2^*', 20), N('C', 80)],
            hints: ['$\\dfrac{MP_1}{MP_2} = \\dfrac{0.25}{0.75}\\cdot\\dfrac{x_2}{x_1} = \\dfrac{x_2}{3x_1}$.', 'Set $\\dfrac{x_2}{3x_1} = \\dfrac13$.'],
            sol: md`Tangency: $\dfrac{x_2}{3x_1} = \dfrac{1}{3} \Rightarrow x_2 = x_1$. Target: $x_1^{0.25}x_1^{0.75} = x_1 = 20$. So $(20, 20)$ and $C = 1(20) + 3(20) = \$80$.` }),

          R(md`
            ### Conditional input demands and the cost function

            Instead of a number like $y = 80$, keep $y$ as a letter. The answer then works for **any** output.

            Candy factory ($w_1 = 16$, $w_2 = 4$), with $x_2 = 4x_1$:
            - $y = 4\sqrt{x_1 \cdot 4x_1} = 8x_1 \Rightarrow x_1^*(y) = y/8$.
            - $x_2^*(y) = 4 \cdot y/8 = y/2$.
            - $C(y) = 16 \cdot \dfrac{y}{8} + 4 \cdot \dfrac{y}{2} = 2y + 2y = 4y$.

            These $x_1^*(w_1, w_2, y)$ and $x_2^*(w_1, w_2, y)$ are called **conditional input demands**: "conditional" because they depend on the output target as well as the prices. $C(y)$ is the **cost function**.

            Check: $C(80) = 320$ ✓, matching the worked example.
          `),
          P({ q: md`Using $y = 2\sqrt{x_1x_2}$, $w_1 = 4$, $w_2 = 1$ (so $x_2 = 4x_1$), write each as a function of $y$.`,
            parts: [X('x_1^*(y)', 'y/4', VY), X('x_2^*(y)', 'y', VY), X('C(y)', '2*y', VY)],
            hints: ['$2\\sqrt{x_1 \\cdot 4x_1} = 4x_1 = y$.'],
            sol: md`$4x_1 = y \Rightarrow x_1^* = y/4$, $x_2^* = 4x_1^* = y$. $C(y) = 4(y/4) + 1(y) = 2y$. Check: $C(24) = 48$ ✓.` }),
          P({ q: md`Same technology $y = 2\sqrt{x_1x_2}$, but now with general prices $w_1, w_2$. Find $x_1^*$ (it will contain $y$, $w_1$, $w_2$).`,
            parts: [X('x_1^*', '(y/2)*sqrt(w2/w1)', { y: [1, 10], w1: [1, 5], w2: [1, 5] }), X('x_2^*', '(y/2)*sqrt(w1/w2)', { y: [1, 10], w1: [1, 5], w2: [1, 5] })],
            hints: ['Tangency: $x_2 = (w_1/w_2)x_1$.', '$2\\sqrt{x_1 \\cdot (w_1/w_2)x_1} = 2x_1\\sqrt{w_1/w_2} = y$.'],
            sol: md`$x_2 = \tfrac{w_1}{w_2}x_1$. Then $y = 2x_1\sqrt{w_1/w_2}$, so $x_1^* = \tfrac{y}{2}\sqrt{w_2/w_1}$ and $x_2^* = \tfrac{y}{2}\sqrt{w_1/w_2}$. With $w_1 = 4$, $w_2 = 1$: $x_1^* = y/4$ ✓.` }),
          Q(md`Why are they called **conditional** input demands?`, ['They depend on the output target too', 'They only hold in the short run', 'They assume the firm’s budget is fixed', 'They hold only when inputs are perfect complements'], 0,
            [null, 'They are long-run (all inputs chosen).', 'The output is fixed, not the budget.', 'They exist for every technology.'],
            md`$x_i^*(w_1, w_2, y)$: the quantity is conditional on how much output must be produced.`),
          G('cd_costmin', { need: 4 }),
        ],
      },
      // ------------------------------------------------------------------ l15
      {
        id: 'l15', title: 'Corners, kinks, and economies of scale',
        steps: [
          R(md`
            ### When tangency does not work

            Tangency needs a smooth, bowed isoquant. Two technologies break it:
            - **Perfect substitutes:** straight isoquants. The answer is usually a **corner** (use only one input).
            - **Perfect complements:** L-shaped isoquants. The answer is at the **kink**.
          `),
          RF(md`
            ### Perfect substitutes: use only the cheaper-per-output input

            Dragan’s software firm: $y = x_1 + 2x_2$ ($x_1$ = unskilled labor, $x_2$ = skilled labor), $w_1 = w_2 = \$1$, target $y = 20$.

            Compare **cost per unit of output**:
            - Unskilled: each unit makes 1 output and costs \$1. Cost per output $= w_1/a_1 = 1/1 = \$1$.
            - Skilled: each unit makes 2 outputs and costs \$1. Cost per output $= w_2/a_2 = 1/2 = \$0.50$.

            Skilled is cheaper per unit of output, so use **only** skilled labor: $2x_2 = 20 \Rightarrow x_2 = 10$, $x_1 = 0$. Cost $= \$10$.

            [[fig:sub]]

            !!key Perfect substitutes rule ($y = a_1x_1 + a_2x_2$)
              - If $w_1/a_1 < w_2/a_2$: use only input 1, $x_1^* = y/a_1$.
              - If $w_1/a_1 > w_2/a_2$: use only input 2, $x_2^* = y/a_2$.
              - If equal: any bundle on the isoquant is cheapest.
              Cost $C(y) = \min\{w_1/a_1,\ w_2/a_2\} \cdot y$.
          `, { sub: { svg: subFig, cap: 'The lowest isocost line touches the straight isoquant at a corner: all skilled labor.' } }),
          Q(md`Same firm $y = x_1 + 2x_2$, but now $w_1 = \$1$ and $w_2 = \$3$. What does the firm use to make 20 units?`, ['20 units of x₁ only', '10 units of x₂ only', '10 of x₁ and 5 of x₂', 'Any bundle on the isoquant'], 0,
            [null, 'Skilled now costs $3/2 = \\$1.50$ per output, more than \\$1.', 'Substitutes give a corner unless costs per output tie.', 'Costs per output differ (\\$1 vs \\$1.50).'],
            md`Cost per output: $x_1$: $1/1 = 1$; $x_2$: $3/2 = 1.5$. Use only $x_1$: $x_1 = 20$, cost \$20.`),
          P({ q: md`$y = x_1 + 2x_2$. For each price pair, give the cost-minimizing bundle for $y = 20$ and its cost.`,
            parts: [N('x_1^*\\text{ at }(w_1, w_2) = (1, 1)', 0), N('x_2^*\\text{ at }(1, 1)', 10), N('C\\text{ at }(1, 1)', 10),
              N('x_1^*\\text{ at }(2, 5)', 20), N('x_2^*\\text{ at }(2, 5)', 0), N('C\\text{ at }(2, 5)', 40)],
            hints: ['At (2, 5): $x_1$ costs \\$2 per output; $x_2$ costs \\$2.50 per output.'],
            sol: md`$(1, 1)$: skilled is \$0.50 per output vs \$1, so $(0, 10)$, cost \$10. $(2, 5)$: unskilled \$2 per output vs skilled \$2.50, so $(20, 0)$, cost \$40.` }),
          P({ q: md`Dragan, $y = x_1 + 2x_2$, makes $q$ units.`,
            parts: [X('\\text{unskilled needed if only } x_1 \\text{ is used}', 'q', { q: [1, 50] }), X('\\text{skilled needed if only } x_2 \\text{ is used}', 'q/2', { q: [1, 50] }),
              FIX('With general prices, he uses only unskilled labor when…', ['$w_1 < w_2/2$', '$w_1 < 2w_2$', '$w_1 < w_2$', '$2w_1 < w_2/2$'], 0, [null, 'Skilled labor makes 2 units, so its cost per output is $w_2/2$.', 'That ignores that skilled labor is twice as productive.', 'No.'])],
            sol: md`Only $x_1$: $x_1 = q$. Only $x_2$: $x_2 = q/2$. Compare cost per output: $w_1$ versus $w_2/2$. If $w_1 < w_2/2$ use $(q, 0)$; if $w_1 > w_2/2$ use $(0, q/2)$; if equal, any mix on the isoquant.` }),

          RF(md`
            ### Perfect complements: always at the kink

            Fran makes brass sculptures from copper ($x_1$) and zinc ($x_2$): $y = \min\{x_1, 2x_2\}$. Target: 10 sculptures.

            Extra copper or zinc beyond the fixed ratio is wasted, so the firm uses **exactly** the no-waste amounts:
            $$x_1 = y = 10, \qquad 2x_2 = y \Rightarrow x_2 = 5$$

            With $w_1 = w_2 = \$1$: cost $= 10 + 5 = \$15$.

            [[fig:comp]]

            !!key Perfect complements rule ($y = \min\{a_1x_1, a_2x_2\}$)
              Set **each** term equal to $y$: $x_1^* = y/a_1$, $x_2^* = y/a_2$.
              Cost $C(y) = \left(\dfrac{w_1}{a_1} + \dfrac{w_2}{a_2}\right)y$.
              Prices change the **cost**, never the **mix**.
          `, { comp: { svg: compFig, cap: 'The cheapest isocost line touches the L-shaped isoquant at its corner.' } }),
          Q(md`Fran: $y = \min\{x_1, 2x_2\}$. The price of copper doubles. What happens to the cost-minimizing bundle for 10 sculptures?`, ['It stays (10, 5); only cost rises', 'Fran switches toward using more zinc', 'Fran switches to using only zinc', 'Fran uses half as much copper as before'], 0,
            [null, 'Fixed proportions: zinc cannot replace copper.', 'Without copper, output is zero.', 'Then she could only make 5 sculptures.'],
            md`With fixed proportions there is no substitution: still $(10, 5)$. The cost goes from \$15 to $2(10) + 5 = \$25$.`),
          P({ q: md`$y = \min\{2x_1, x_2\}$, $w_1 = \$3$, $w_2 = \$2$.`,
            parts: [N('x_1^*\\text{ for } y = 12', 6), N('x_2^*\\text{ for } y = 12', 12), N('C\\text{ for } y = 12', 42), X('C(y)', '3.5*y', VY)],
            hints: ['$2x_1 = 12$ and $x_2 = 12$.', '$C(y) = (3/2 + 2/1)y$.'],
            sol: md`$x_1 = 12/2 = 6$, $x_2 = 12$. $C = 3(6) + 2(12) = 18 + 24 = \$42$. In general $C(y) = (\tfrac32 + 2)y = 3.5y$; $C(12) = 42$ ✓.` }),
          Q(md`Which technology is most likely to give a **corner** solution (only one input used)?`, ['$y = 3x_1 + x_2$', '$y = \\min\\{3x_1, x_2\\}$', '$y = x_1^{0.5}x_2^{0.5}$', '$y = 3x_1^{0.2}x_2^{0.8}$'], 0,
            [null, 'Min functions use both inputs, at the kink.', 'Cobb–Douglas always uses both (interior tangency).', 'Cobb–Douglas always uses both.'],
            md`Perfect substitutes: straight-line isoquants, so the cheapest point is usually a corner.`),

          R(md`
            ### From technology to average cost

            Once you have $C(y)$:
            - **Average cost** $AC(y) = C(y)/y$: cost per unit.
            - **Marginal cost** $MC(y) = C'(y)$: cost of one more unit.

            Candy: $C(y) = 4y$, so $AC = 4$ and $MC = 4$. Flat.

            **Economies of scale** describe what happens to **average cost** as output grows:
            - Economies of scale: AC **falls**.
            - Constant AC.
            - Diseconomies of scale: AC **rises**.

            !!key Linking returns to scale and average cost (input prices fixed)
              | Technology | Total cost as output grows | Average cost |
              |---|---|---|
              | Increasing RTS | rises less than proportionally | **falls** (economies of scale) |
              | Constant RTS | rises proportionally | **constant** |
              | Decreasing RTS | rises more than proportionally | **rises** (diseconomies) |
          `),
          Q(md`$y = x_1^{0.4}x_2^{0.8}$, input prices constant. As output grows, long-run average cost…`, ['decreases', 'increases', 'stays constant', 'first rises, then falls'], 0,
            [null, 'That would need DRS.', 'That would need CRS.', 'Cobb–Douglas has the same RTS at every scale.'],
            md`$0.4 + 0.8 = 1.2 > 1$: increasing returns. Doubling inputs (and cost) more than doubles output, so cost per unit falls.`),
          Q(md`The candy factory ($y = 4\sqrt{x_1x_2}$) has $C(y) = 4y$. Which explains the flat average cost?`, ['Its technology has constant returns', 'Its inputs are perfect substitutes', 'Its marginal products are all constant', 'It has no fixed inputs, so AC must be flat'], 0,
            [null, 'It is Cobb–Douglas.', 'MPs here diminish (exponents 0.5).', 'No fixed inputs does not by itself make AC flat; DRS would make it rise.'],
            md`$0.5 + 0.5 = 1$: CRS. Doubling output exactly doubles cost, so AC stays at 4.`),
          P({ q: md`Match each cost function to its scale economies. ($C$ is long-run cost.)`,
            parts: [FIX('$C(y) = 5y$', ['economies of scale', 'constant AC', 'diseconomies of scale'], 1, ['$AC = 5$ is flat.', null, '$AC = 5$ is flat.']),
              FIX('$C(y) = 2y^2$', ['economies of scale', 'constant AC', 'diseconomies of scale'], 2, ['$AC = 2y$ rises.', '$AC = 2y$ rises.', null]),
              FIX('$C(y) = 6y^{0.5}$', ['economies of scale', 'constant AC', 'diseconomies of scale'], 0, [null, '$AC = 6y^{-0.5}$ falls.', '$AC = 6y^{-0.5}$ falls.'])],
            sol: md`Divide by $y$: $AC = 5$ (constant), $AC = 2y$ (rising: diseconomies), $AC = 6/\sqrt y$ (falling: economies).` }),
          G('corner_kink', { need: 5 }),
        ],
      },
    ],
  });
})();

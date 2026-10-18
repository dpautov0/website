/* Start here: the math the exam uses, taught from zero and drilled. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });

  const lineFig = EC.graph({
    w: 300, h: 230, x: [0, 14], y: [0, 26], xl: 'x_1', yl: 'x_2', xt: [4, 8, 12], yt: [8, 16, 24],
    items: [{ seg: [[0, 24], [12, 0]], lab: '20x_1 + 10x_2 = 240', at: 0.55, dx: 8 }, { pt: [0, 24], lab: '(0,\\,24)', at: 'r' }, { pt: [12, 0], lab: '(12,\\,0)', at: 'tr' }],
  });
  const areaFig = EC.graph({
    w: 300, h: 230, x: [0, 11], y: [0, 22], xl: 'Q', yl: 'P', xt: [6, 10], yt: [8, 20],
    items: [
      { poly: [[0, 20], [6, 8], [0, 8]], cls: 'cs' }, { poly: [[0, 8], [6, 8], [6, 0], [0, 0]], cls: 'ex' },
      { seg: [[0, 20], [10, 0]], lab: 'P = 20 - 2Q', at: 0.75, dx: 8 },
      { pt: [6, 8], guide: true }, { text: [1.8, 11], t: '\\text{triangle}', anchor: 'c' }, { text: [3, 4], t: '\\text{rectangle}', anchor: 'c' },
    ],
  });

  C.unit({
    id: 'u0', exam: 'm2', num: 'Start here', title: 'The math you need',
    lessons: [{
      id: 'm0', title: 'The math toolkit (algebra, exponents, derivatives, areas)',
      steps: [
        R(md`
          ### Why start with math?

          Almost every point you can lose on this exam is lost in one of a few small math moves: solving an equation for one letter, handling an exponent like $x^{0.4}$, taking a derivative, plugging in the right number, or finding the area of a triangle. The economics is usually the easy part once those moves are automatic.

          So this page does just those moves, slowly, with a check after each one. Nothing here is economics yet; it is the toolbox. If a section feels easy, answer its questions and move on.

          !!intuition How to use the checks
            Every question below is answered **before** you read on. Get it wrong? Good: read the explanation that appears, then do the next one. Mistakes on this page are free.
        `),

        R(md`
          ### 1. Solving for one letter

          The rule: whatever you do to one side, do to the other. Your goal is to get the letter you want alone.

          **Example.** A demand curve is written $Q = 20 - 2P$. Solve it for $P$ (this is called the *inverse demand*, and you need it to draw the curve with price on the vertical axis).

          - Move the $P$ term to the left and $Q$ to the right: $2P = 20 - Q$
          - Divide everything by 2: $P = 10 - \tfrac12 Q$

          **Check it** by plugging in a number: if $P = 4$, the first form gives $Q = 20 - 8 = 12$. The second form with $Q = 12$ gives $P = 10 - 6 = 4$. Same point, so the algebra is right.

          !!method A habit that saves points
            After any rearrangement, plug one easy number into both versions. If they disagree, you made a sign or division error. It takes ten seconds.
        `),
        P({ q: md`Solve $Q = 30 - 3P$ for $P$.`, parts: [X('P', '10 - Q/3', { Q: [0, 30] })],
          hints: ['Get the $3P$ alone first: $3P = 30 - Q$.'],
          sol: md`$3P = 30 - Q$, so $P = 10 - Q/3$. Check: $P = 5$ gives $Q = 15$; and $10 - 15/3 = 5$. ✓` }),
        P({ q: md`A budget line is $4x_1 + 2x_2 = 48$. Solve it for $x_2$ (so you can graph $x_2$ on the vertical axis).`, parts: [X('x_2', '24 - 2*x1', { x1: [0, 12] })],
          hints: ['Subtract $4x_1$ from both sides, then divide by 2.'],
          sol: md`$2x_2 = 48 - 4x_1$, so $x_2 = 24 - 2x_1$. The vertical intercept is 24, the slope is $-2$.` }),
        Q(md`Which is the correct first step to solve $m = p_1x_1 + p_2x_2$ for $x_1$?`, [md`subtract $p_2x_2$ from both sides`, md`divide both sides by $p_2$`, md`multiply both sides by $p_1$`, md`subtract $p_1$ from both sides`], 0,
          [null, 'That isolates nothing useful: $x_1$ is still tied to $p_1$.', 'That makes it worse; you want to divide by $p_1$, later.', '$p_1$ multiplies $x_1$; you can’t subtract it off.'],
          md`$p_1x_1 = m - p_2x_2$, then divide by $p_1$: $x_1 = (m - p_2x_2)/p_1$.`),

        RF(md`
          ### 2. Lines: intercepts and slope

          Lines are everywhere in this class: budget lines, isocost lines, demand curves. The fastest way to draw one is to find where it hits each axis.

          **Example.** Graph $20x_1 + 10x_2 = 240$.

          - Vertical intercept: set $x_1 = 0$. Then $10x_2 = 240$, so $x_2 = 24$. The point $(0, 24)$.
          - Horizontal intercept: set $x_2 = 0$. Then $20x_1 = 240$, so $x_1 = 12$. The point $(12, 0)$.
          - Slope = rise / run $= \dfrac{0 - 24}{12 - 0} = -2$.

          [[fig:line]]

          Notice the slope is $-\dfrac{20}{10}$: **minus the coefficient of the horizontal variable over the coefficient of the vertical variable.** For a budget line $p_1x_1 + p_2x_2 = m$ that means the slope is $-p_1/p_2$, and for an isocost line $w_1x_1 + w_2x_2 = C$ it is $-w_1/w_2$. That one fact answers a lot of exam questions.
        `, { line: { svg: lineFig, cap: 'Find the two intercepts, connect them.' } }),
        P({ q: md`For the budget line $3x_1 + 6x_2 = 36$ (good 1 on the horizontal axis), find both intercepts and the slope.`,
          parts: [N('x_1\\text{-intercept}', 12), N('x_2\\text{-intercept}', 6), N('\\text{slope}', -0.5)],
          sol: md`$x_1 = 36/3 = 12$; $x_2 = 36/6 = 6$; slope $= -3/6 = -0.5$.` }),
        Q(md`Income doubles and both prices stay the same. The budget line…`, ['shifts out, keeping the same slope', 'rotates around the vertical intercept', 'becomes twice as steep', 'shifts out and becomes flatter'], 0,
          [null, 'A rotation happens when one price changes.', 'The slope is $-p_1/p_2$, and prices didn’t change.', 'Same prices, same slope.'],
          md`Both intercepts $m/p_1$ and $m/p_2$ double; the slope $-p_1/p_2$ is unchanged: a parallel shift.`),
        Q(md`The price of good 1 (horizontal axis) falls; income and $p_2$ stay the same. The budget line…`, ['pivots outward around the vertical intercept', 'shifts out parallel to itself', 'pivots outward around the horizontal intercept', 'does not move'], 0,
          [null, 'Parallel shifts come from income changes.', 'The horizontal intercept $m/p_1$ is the one that moves.', 'Cheaper good 1 means you can buy more of it.'],
          md`The vertical intercept $m/p_2$ stays put; the horizontal intercept $m/p_1$ moves right. The line gets flatter.`),

        R(md`
          ### 3. Exponents

          Cobb–Douglas functions are full of exponents like $x^{0.4}$ or $x^{1/2}$. Five rules cover all of it:

          | Rule | Example |
          |---|---|
          | $x^a\cdot x^b = x^{a+b}$ | $x^{0.4}x^{0.6} = x^1 = x$ |
          | $x^a / x^b = x^{a-b}$ | $x^{1/3}/x = x^{-2/3}$ |
          | $(x^a)^b = x^{ab}$ | $(x^{1/2})^2 = x$ |
          | $x^{-a} = 1/x^a$ | $x^{-1/2} = 1/\sqrt{x}$ |
          | $x^{1/2} = \sqrt{x}$, $x^{1/3} = \sqrt[3]{x}$ | $8^{1/3} = 2$ |

          **Example.** Simplify $\sqrt{x_1}\,\sqrt{4x_1}$. Write it as $\sqrt{4x_1^2} = 2x_1$. This exact move appears when you solve cost-minimization problems.
        `),
        P({ q: md`Compute $8^{1/3}\cdot 8^{1/3}$.`, parts: [N('', 4)], sol: md`$8^{1/3} = 2$, so $2\cdot2 = 4$. Or: $8^{2/3} = (8^{1/3})^2 = 4$.` }),
        P({ q: md`Simplify $\sqrt{x_1\cdot 9x_1}$ for $x_1 > 0$.`, parts: [X('', '3*x1', { x1: [0.5, 9] })], sol: md`$\sqrt{9x_1^2} = 3x_1$.` }),
        Q(md`What is $x^{1/3}\,x^{2/3}$?`, [md`$x$`, md`$x^{2/9}$`, md`$x^{1/2}$`, md`$x^{3/3}\cdot 2$`], 0,
          [null, 'You multiplied the exponents; add them when the bases multiply.', 'Add: $1/3 + 2/3 = 1$.', '$x^{3/3} = x$; there is no factor 2.'], md`Add exponents: $1/3 + 2/3 = 1$.`),

        R(md`
          ### 4. Derivatives: the power rule

          A derivative measures how fast something changes. In this class it gives you **marginal** things: marginal cost, marginal product. You only need one rule (plus "constants disappear"):

          $$\frac{d}{dx}\,x^r = r\,x^{r-1}$$

          Bring the exponent down in front, then lower the exponent by one.

          - $\dfrac{d}{dq}\big(0.6q^3\big) = 0.6\cdot3q^2 = 1.8q^2$
          - $\dfrac{d}{dq}\big(-4q^2\big) = -8q$
          - $\dfrac{d}{dq}\big(220q\big) = 220$
          - $\dfrac{d}{dq}\big(800\big) = 0$ — a constant (like a fixed cost) has derivative zero.

          !!key Why this matters
            Marginal cost is the derivative of total cost. A fixed cost is a constant, so it **never** affects marginal cost.
        `),
        P({ q: md`Find the derivative of $TC(q) = 220q - 4q^2 + 0.6q^3 + 800$.`, parts: [X('MC(q)', '220 - 8*q + 1.8*q^2', { q: [1, 20] })],
          hints: ['Do one term at a time; 800 is a constant.'],
          sol: md`$MC(q) = 220 - 8q + 1.8q^2$. The 800 disappears.` }),
        P({ q: md`Find $\dfrac{d}{dy}\big(y^3 - 6y^2 + 13y\big)$ and evaluate it at $y = 4$.`, parts: [X('\\text{derivative}', '3*y^2 - 12*y + 13', { y: [1, 9] }), N('\\text{at } y = 4', 13)],
          sol: md`$3y^2 - 12y + 13$; at $y = 4$: $48 - 48 + 13 = 13$.` }),
        P({ q: md`Differentiate $f(x) = x^{1/2}$.`, parts: [X("f'(x)", '0.5*x^(-0.5)', { x: [0.5, 9] })],
          hints: ['Bring down the $1/2$ and subtract 1 from the exponent: $1/2 - 1 = -1/2$.'],
          sol: md`$f'(x) = \tfrac12x^{-1/2} = \dfrac{1}{2\sqrt{x}}$.` }),

        R(md`
          ### 5. Partial derivatives

          When a function has two variables, like output $y = f(x_1, x_2)$, a **partial derivative** asks: how does $y$ change when I nudge **one** input and freeze the other?

          The trick is simple: **treat the other variable as a fixed number**, then use the power rule.

          **Example.** $f(x_1, x_2) = x_1^{1/3}x_2^{2/3}$.

          - With respect to $x_1$ ($x_2$ frozen): $\dfrac{\partial f}{\partial x_1} = \tfrac13x_1^{-2/3}x_2^{2/3}$
          - With respect to $x_2$ ($x_1$ frozen): $\dfrac{\partial f}{\partial x_2} = \tfrac23x_1^{1/3}x_2^{-1/3}$

          **Example.** $f(x_1, x_2) = x_1 + 2x_2$: $\partial f/\partial x_1 = 1$ and $\partial f/\partial x_2 = 2$.

          These partial derivatives are the **marginal products**, and you will use them in every production and cost question.
        `),
        P({ q: md`For $f(x_1, x_2) = 4x_1^{1/2}x_2^{1/2}$, find $\partial f/\partial x_1$.`, parts: [X('\\partial f/\\partial x_1', '2*x2^0.5/x1^0.5', { x1: [0.5, 9], x2: [0.5, 9] })],
          hints: ['Freeze $x_2^{1/2}$ as a number. The derivative of $x_1^{1/2}$ is $\\tfrac12x_1^{-1/2}$.'],
          sol: md`$4\cdot\tfrac12x_1^{-1/2}x_2^{1/2} = 2\sqrt{x_2/x_1}$.` }),
        Q(md`For $f(x_1, x_2) = 3x_1 + 5x_2$, what is $\partial f/\partial x_2$?`, ['5', '3', md`$3x_1 + 5$`, '8'], 0,
          [null, 'That is the partial with respect to $x_1$.', 'Freeze $x_1$: the $3x_1$ term is a constant and disappears.', 'Partials don’t add the coefficients.'], md`Freeze $x_1$; only $5x_2$ changes, slope 5.`),

        R(md`
          ### 6. Two equations, two unknowns

          Cost minimization always ends with two equations in $x_1$ and $x_2$. The method is **substitution**: solve one equation for one variable, plug it into the other.

          **Example.** $x_2 = 4x_1$ and $8x_1 = 80$… the second gives $x_1 = 10$ directly, then $x_2 = 40$.

          **Example.** $x_2 = 4x_1$ and $2\sqrt{x_1x_2} = 24$. Substitute: $2\sqrt{x_1\cdot4x_1} = 2\sqrt{4x_1^2} = 2\cdot2x_1 = 4x_1 = 24$, so $x_1 = 6$ and $x_2 = 24$.
        `),
        P({ q: md`Solve $x_2 = 2x_1$ and $x_1 + 3x_2 = 21$.`, parts: [N('x_1', 3), N('x_2', 6)], sol: md`$x_1 + 6x_1 = 21$, so $x_1 = 3$, $x_2 = 6$.` }),
        P({ q: md`Solve $x_2 = x_1$ and $5\sqrt{x_1x_2} = 50$.`, parts: [N('x_1', 10), N('x_2', 10)], sol: md`$5\sqrt{x_1^2} = 5x_1 = 50$, so $x_1 = x_2 = 10$.` }),

        RF(md`
          ### 7. Areas: triangles and rectangles

          Consumer surplus is an area on a graph. For straight-line demand you only ever need:

          - Rectangle: base × height
          - Triangle: $\tfrac12$ × base × height

          [[fig:area]]

          With demand $P = 20 - 2Q$ and price $8$: quantity is $Q = 6$. The triangle above the price has base 6 and height $20 - 8 = 12$: area $\tfrac12\cdot6\cdot12 = 36$. The rectangle below the price has area $8\cdot6 = 48$.

          !!mistake The most common slip
            Forgetting the $\tfrac12$ for a triangle. If an answer is exactly double the right one, this is almost always why.
        `, { area: { svg: areaFig, cap: 'Shaded triangle above the price, gray rectangle below it.' } }),
        P({ q: md`A triangle on a demand graph has base 5 and height 10. What is its area?`, parts: [N('', 25)], sol: md`$\tfrac12\cdot5\cdot10 = 25$.` }),

        R(md`
          ### 8. Percent changes

          A percent change is (new − old) / old × 100%. Elasticity, later, is just one percent change divided by another.

          - Price from \$4 to \$5: $(5-4)/4 = 25\%$.
          - Quantity from 100 to 90: $(90 - 100)/100 = -10\%$.

          The ratio $-10\% / 25\% = -0.4$ is what an elasticity looks like.
        `),
        P({ q: md`Quantity rises from 200 to 230. What is the percent change?`, parts: [N('\\%', 15)], sol: md`$(230 - 200)/200 = 0.15 = 15\%$.` }),
        Q(md`A price rises 10% and quantity falls 20%. The ratio %ΔQ / %ΔP is…`, ['−2', '−0.5', '2', '−20'], 0,
          [null, 'Upside down: quantity change goes on top.', 'Quantity fell, so the ratio is negative.', 'Divide the percentages: $-20/10$.'], md`$-20\%/10\% = -2$.`),

        R(md`
          ### Practice until it is automatic

          New problems every time. Aim for three in a row without hesitating.
        `),
        G('math_mix', { need: 6 }),
      ],
    }],
  });
})();

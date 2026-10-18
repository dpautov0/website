/* Part 4: production. Production functions, isoquants, marginal product, TRS, returns to scale. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const V = { x1: [1, 6], x2: [1, 6] };

  const cdIso = EC.graph({
    w: 300, h: 240, x: [0, 20], y: [0, 20], xl: 'x_1', yl: 'x_2', xt: [8, 16], yt: [1, 8, 16],
    items: [
      { f: (x) => 8 / x, from: 0.45, to: 19.5, cls: '', lab: 'y = 4', labX: 19, dy: -4, anchor: 'br', dx: 0 },
      { f: (x) => 64 / x, from: 3.3, to: 19.5, cls: 'c2', lab: 'y = 8', labX: 19, dy: -4, anchor: 'br', dx: 0 },
      { f: (x) => 125 / x, from: 6.3, to: 19.5, cls: 'c3', lab: 'y = 10', labX: 19, dy: -4, anchor: 'br', dx: 0 },
      { pt: [8, 1], lab: '(8,\\,1)', at: 'tr' }, { pt: [8, 8], lab: '(8,\\,8)', at: 'tr' },
    ],
  });
  const compIso = EC.graph({
    w: 300, h: 230, x: [0, 18], y: [0, 10], xl: 'x_1', yl: 'x_2', xt: [4, 8, 14], yt: [2, 4, 7],
    items: [
      { pts: [[4, 9.5], [4, 2], [17.5, 2]], cls: 'curve', lab: 'y = 4', labI: 2, dx: -2, dy: -6, anchor: 'br' },
      { pts: [[8, 9.5], [8, 4], [17.5, 4]], cls: 'curve c2', lab: 'y = 8', labI: 2, dx: -2, dy: -6, anchor: 'br' },
      { pts: [[14, 9.5], [14, 7], [17.5, 7]], cls: 'curve c3', lab: 'y = 14', labI: 2, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 0], [18, 9]], cls: 'guide' },
      { pt: [4, 2] }, { pt: [8, 4] }, { pt: [14, 7] },
    ],
  });
  const subIso = EC.graph({
    w: 300, h: 220, x: [0, 26], y: [0, 9.5], xl: 'x_1', yl: 'x_2', xt: [9, 18, 24], yt: [3, 6, 8],
    items: [
      { seg: [[0, 3], [9, 0]], lab: 'y = 9', at: 0.15, dx: 4, dy: -2 },
      { seg: [[0, 6], [18, 0]], cls: 'curve c2', lab: 'y = 18', at: 0.12, dx: 4, dy: -2 },
      { seg: [[0, 8], [24, 0]], cls: 'curve c3', lab: 'y = 24', at: 0.1, dx: 4, dy: -2 },
    ],
  });
  const dimFig = EC.graph({
    w: 300, h: 220, x: [0, 10], y: [0, 16], xl: 'x_1', yl: 'y', xt: [1, 4, 9], yt: [5, 10, 15],
    items: [
      { f: (x) => 5 * Math.sqrt(x), from: 0, to: 9.8, lab: 'y = 5\\sqrt{x_1}', labX: 9.2, dy: 10, anchor: 'tr', dx: 0 },
      { pt: [1, 5], guide: true }, { pt: [4, 10], guide: true }, { pt: [9, 15], guide: true },
      { text: [2.4, 9.4], t: '+5', anchor: 'r' }, { text: [6.3, 14.2], t: '+5', anchor: 'r' },
    ],
  });

  C.unit({
    id: 'u4', exam: 'm2', num: 'Part 4', title: 'Production',
    lessons: [
      // ------------------------------------------------------------------ l10
      {
        id: 'l10', title: 'Production functions and isoquants',
        steps: [
          R(md`
            ### From consumers to firms

            Everything so far was about **consumers**. Now we switch sides. A **firm** takes **inputs** (workers, machines, ingredients) and turns them into **output**.

            The good news: the math is almost the same as consumer theory. Here is the dictionary:

            | Consumer theory | Producer theory |
            |---|---|
            | goods $x_1, x_2$ | **inputs** $x_1, x_2$ (factors of production) |
            | utility $U(x_1, x_2)$ | **output** $y = f(x_1, x_2)$ |
            | indifference curve (same utility) | **isoquant** (same output) |
            | MRS | **TRS** |
            | budget line | **isocost line** (next part) |

            !!key Production function
              $y = f(x_1, x_2)$ is the **most** output the firm can make from the input bundle $(x_1, x_2)$. It describes the firm’s **technology**: what is possible, not necessarily "high tech".
          `),
          R(md`
            ### Input bundles and one big difference from utility

            An **input bundle** lists how much of each input is used. $(x_1, x_2, x_3) = (6, 0, 9)$ means 6 units of input 1, none of input 2, 9 of input 3.

            One difference from utility: **output is a real, countable number.** Utility of 8 versus 4 means nothing except "more is better". Output of 8 versus 4 means twice as many cars. That is why "doubling output" is meaningful, and it is why returns to scale (later in this part) matter.
          `),
          RF(md`
            ### Isoquants

            An **isoquant** ("same quantity") is every input bundle that makes the **same** output. It plays the role of an indifference curve.

            Example: $y = 2x_1^{1/3}x_2^{1/3}$.
            - $(8, 1)$: $y = 2 \cdot 8^{1/3} \cdot 1^{1/3} = 2 \cdot 2 \cdot 1 = 4$.
            - $(8, 8)$: $y = 2 \cdot 2 \cdot 2 = 8$.

            [[fig:cd]]

            Isoquants farther from the origin mean **more output**. They slope down: to keep output fixed while using less of one input, you need more of the other.
          `, { cd: { svg: cdIso, cap: 'Cobb–Douglas isoquants: smooth curves bowed toward the origin.' } }),
          Q(md`For $y = 2x_1^{1/3}x_2^{1/3}$, what output does the bundle $(1, 8)$ produce?`, ['4', '8', '2', '16'], 0,
            [null, 'That is the output of $(8, 8)$.', 'Do not forget the 2 in front.', 'Cube roots: $1^{1/3} = 1$ and $8^{1/3} = 2$.'],
            md`$y = 2 \cdot 1^{1/3} \cdot 8^{1/3} = 2 \cdot 1 \cdot 2 = 4$. Same isoquant as $(8, 1)$.`),
          Q(md`Why does an isoquant slope **downward**?`,
            ['Less of one input needs more of the other', 'Each input becomes more expensive as the firm uses more', 'Output falls as the firm adds more inputs', 'The firm must spend the same total amount on inputs'], 0,
            [null, 'Isoquants are about technology, not prices.', 'Output is constant along an isoquant.', 'That describes an isocost line, not an isoquant.'],
            md`Along an isoquant output stays fixed. Give up some $x_2$, and you must add some $x_1$ to make up the lost output.`),

          R(md`
            ### Three production functions to know cold

            **1. Cobb–Douglas:** $y = Ax_1^a x_2^b$.
            - $A$ scales output up or down. $a$ and $b$ say how strongly output responds to each input.
            - Isoquants are smooth curves (picture above). Inputs can be swapped, but not one-for-one.

            **2. Perfect complements (fixed proportions):** $y = \min\{a_1x_1,\ a_2x_2\}$.
            - Inputs must be used **together** in a fixed ratio. Extra of one input alone is wasted.
            - Bubble tea: $y = \min\{\text{cups},\ 2 \times \text{syrup packets}\}$. One packet serves two cups.

            **3. Perfect substitutes:** $y = a_1x_1 + a_2x_2$.
            - Inputs can replace each other at a **constant** rate.
            - Cashiers ($x_1$) and self-service kiosks ($x_2$) both process orders.
          `),
          RF(md`
            ### Perfect complements: L-shaped isoquants

            $y = \min\{x_1, 2x_2\}$.

            - $(4, 2)$: $\min\{4, 4\} = 4$.
            - $(8, 4)$: $\min\{8, 8\} = 8$.
            - $(14, 7)$: $\min\{14, 14\} = 14$.

            [[fig:comp]]

            The corners sit on the line where the two terms are equal: $x_1 = 2x_2$. That is the **no-waste** ratio.

            What about $(10, 2)$? $\min\{10, 4\} = 4$. Same output as $(4, 2)$: the extra 6 units of $x_1$ do nothing. That is why the isoquant is flat to the right of the corner.

            !!method Output of a min function
              Compute **each** term inside the min, then take the **smaller** one. The smaller term is the bottleneck.
          `, { comp: { svg: compIso, cap: 'Perfect complements: corners on the line x₁ = 2x₂. Off the corner, extra input is wasted.' } }),
          Q(md`$y = \min\{x_1, 2x_2\}$. What output does $(6, 5)$ produce?`, ['6', '10', '5', '16'], 0,
            [null, '$2x_2 = 10$, but the min takes the smaller term.', 'That is $x_2$ alone; the term is $2x_2 = 10$.', 'You do not add inside a min.'],
            md`Terms: $x_1 = 6$ and $2x_2 = 10$. The smaller is $6$, so $y = 6$. Input 1 is the bottleneck; 2 units of $x_2$ are wasted.`),
          P({ q: md`Bubble tea: $y = \min\{\text{cups},\ 2s\}$ where $s$ is syrup packets.`,
            parts: [N('y\\text{ with 20 cups and 6 packets}', 12), N('\\text{packets needed for 20 cups (no waste)}', 10), N('\\text{cups needed for 30 teas}', 30), N('\\text{packets needed for 30 teas}', 15)],
            hints: ['With 6 packets, $2s = 12$, smaller than 20.', 'No waste: cups $= 2s$.'],
            sol: md`$\min\{20, 12\} = 12$ teas (8 cups idle). No waste needs cups $= 2s$, so 20 cups need 10 packets. For $y = 30$: cups $= 30$ and $2s = 30 \Rightarrow s = 15$.` }),
          RF(md`
            ### Perfect substitutes: straight-line isoquants

            $y = x_1 + 3x_2$: one unit of $x_2$ does the work of three units of $x_1$, always.

            [[fig:sub]]

            The isoquants are straight lines with a constant slope of $-1/3$: you can always swap 3 units of $x_1$ for 1 unit of $x_2$.
          `, { sub: { svg: subIso, cap: 'Perfect substitutes: parallel straight-line isoquants.' } }),
          Q(md`$y = x_1 + 3x_2$. Which bundle produces the **same** output as $(9, 0)$?`, ['(0, 3)', '(3, 3)', '(0, 9)', '(3, 1)'], 0,
            [null, '$3 + 9 = 12$, not 9.', '$0 + 27 = 27$.', '$3 + 3 = 6$.'],
            md`$(9, 0)$ gives $9$. $(0, 3)$ gives $0 + 3 \cdot 3 = 9$ ✓.`),
          Q(md`Which production function describes inputs that must be used in a fixed ratio?`, ['$y = \\min\\{2x_1, x_2\\}$', '$y = 2x_1 + x_2$', '$y = 2x_1^{0.5}x_2^{0.5}$', '$y = x_1x_2$'], 0,
            [null, 'That is perfect substitutes.', 'That is Cobb–Douglas.', 'That is Cobb–Douglas too.'],
            md`A min function means fixed proportions (perfect complements).`),

          R(md`
            ### Short run versus long run

            This has nothing to do with the calendar. It is about **what the firm can change**.

            - **Short run:** at least one input is **fixed**. The plant size or the machines cannot change yet, or a legal rule locks something in place.
            - **Long run:** **all** inputs are variable. The firm can build a bigger factory, buy new equipment, change its whole scale.

            !!key Which tool goes with which run
              - Marginal product (add one input, hold the other fixed) is a **short-run** idea.
              - Returns to scale (scale **all** inputs together) is a **long-run** idea.
          `),
          Q(md`A bakery can hire more workers this month, but its oven cannot be replaced for a year. This month, the bakery is in…`, ['the short run', 'the long run', 'both the short and the long run', 'neither, since the time frame is under a year'], 0,
            [null, 'In the long run every input, including the oven, can change.', 'At least one input is fixed, which is the definition of the short run.', 'The runs are defined by what is fixed, not by calendar length.'],
            md`One input (the oven) is fixed, so this is the short run.`),
          G('prod_basics', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l11
      {
        id: 'l11', title: 'Marginal product and TRS',
        steps: [
          R(md`
            ### Marginal product: what one more unit of an input adds

            The **marginal product** of an input is the extra output from one more unit of **that** input, holding the other input **fixed**.

            $$MP_1 = \frac{\partial f}{\partial x_1}, \qquad MP_2 = \frac{\partial f}{\partial x_2}$$

            A **partial derivative** is just a regular derivative where you treat every other letter as a plain number.

            !!method Partial derivative of a Cobb–Douglas term
              For $MP_1$ of $Ax_1^a x_2^b$: bring $a$ down in front, lower the power of $x_1$ by 1, and leave $x_2^b$ alone.
              $$MP_1 = aAx_1^{a-1}x_2^b, \qquad MP_2 = bAx_1^a x_2^{b-1}$$
          `),
          R(md`
            ### Worked example

            $y = x_1^{1/3}x_2^{2/3}$.

            - $MP_1$: bring down $\tfrac13$, power of $x_1$ becomes $\tfrac13 - 1 = -\tfrac23$:
            $$MP_1 = \tfrac13 x_1^{-2/3}x_2^{2/3}$$
            - $MP_2$: bring down $\tfrac23$, power of $x_2$ becomes $\tfrac23 - 1 = -\tfrac13$:
            $$MP_2 = \tfrac23 x_1^{1/3}x_2^{-1/3}$$

            At $(8, 8)$: $MP_1 = \tfrac13 \cdot 8^{-2/3} \cdot 8^{2/3} = \tfrac13$, and $MP_2 = \tfrac23 \cdot 2 \cdot \tfrac12 = \tfrac23$.

            For perfect substitutes $y = a_1x_1 + a_2x_2$ the MPs are just the coefficients: $MP_1 = a_1$, $MP_2 = a_2$. Constant, no matter how much you use.
          `),
          P({ q: md`$y = x_1^{0.5}x_2^{0.5}$. Type each marginal product as an expression in $x_1$ and $x_2$.`,
            parts: [X('MP_1', '0.5*x1^(-0.5)*x2^0.5', V), X('MP_2', '0.5*x1^0.5*x2^(-0.5)', V), N('MP_1\\text{ at }(4, 9)', 0.75)],
            hints: ['Bring the 0.5 down, then the power of $x_1$ becomes $-0.5$.', 'At $(4, 9)$: $0.5 \\cdot 4^{-0.5} \\cdot 9^{0.5} = 0.5 \\cdot \\tfrac12 \\cdot 3$.'],
            sol: md`$MP_1 = 0.5x_1^{-0.5}x_2^{0.5}$, $MP_2 = 0.5x_1^{0.5}x_2^{-0.5}$. At $(4, 9)$: $MP_1 = 0.5 \cdot \tfrac12 \cdot 3 = 0.75$.` }),
          P({ q: md`$y = 4x_1^{0.25}x_2^{0.75}$. Find the marginal products.`,
            parts: [X('MP_1', 'x1^(-0.75)*x2^0.75', V), X('MP_2', '3*x1^0.25*x2^(-0.25)', V)],
            hints: ['$0.25 \\times 4 = 1$.', '$0.75 \\times 4 = 3$.'],
            sol: md`$MP_1 = 0.25 \cdot 4 \cdot x_1^{-0.75}x_2^{0.75} = x_1^{-0.75}x_2^{0.75}$. $MP_2 = 0.75 \cdot 4 \cdot x_1^{0.25}x_2^{-0.25} = 3x_1^{0.25}x_2^{-0.25}$.` }),
          Q(md`A store’s output is $y = x_1 + 2x_2$, where $x_1$ is cashiers and $x_2$ is kiosks. What is the marginal product of a kiosk?`, ['2', '1', '2x₂', 'x₁ + 2'], 0,
            [null, 'That is the MP of a cashier.', 'Differentiate: the $x_2$ disappears.', 'Hold $x_1$ fixed; it drops out.'],
            md`$MP_2 = \partial(x_1 + 2x_2)/\partial x_2 = 2$. Every extra kiosk processes 2 more orders, no matter how many there already are.`),

          RF(md`
            ### Diminishing marginal product

            Hold the kitchen fixed and keep adding cooks. The first cook adds a lot. By the tenth cook, people are bumping into each other, and each extra cook adds less. That is the **law of diminishing marginal product**: as you use more of one input (others fixed), its MP **falls**.

            [[fig:dim]]

            In $y = 5\sqrt{x_1}$: going from 1 to 4 hours adds 5 units, but going from 4 to 9 hours (more hours!) also adds only 5. The curve gets **flatter**.

            !!method How to check for diminishing MP
              Take the derivative of the MP with respect to the same input. If it is **negative**, MP is diminishing.
              For Cobb–Douglas, $MP_1 = aAx_1^{a-1}x_2^b$ falls in $x_1$ exactly when $a < 1$ (the power $a - 1$ is negative).
          `, { dim: { svg: dimFig, cap: 'Diminishing MP: equal output gains need more and more extra input.' } }),
          Q(md`For $y = x_1^{0.4}x_2^{0.8}$, which inputs have **diminishing** marginal product?`, ['Both inputs', 'Only x₁', 'Only x₂', 'Neither input'], 0,
            [null, '$x_2$’s exponent 0.8 is also below 1.', '$x_1$’s exponent 0.4 is also below 1.', 'Both exponents are below 1.'],
            md`Each exponent is below 1, so each MP falls as that input rises. ($a + b = 1.2$ is a different question: returns to scale.)`),
          Q(md`For $y = x_1^{1.5}x_2^{0.5}$, the marginal product of $x_1$…`, ['rises as x₁ rises', 'falls as x₁ rises', 'is constant', 'is negative'], 0,
            [null, 'The exponent on $x_1$ is above 1.', '$MP_1 = 1.5x_1^{0.5}x_2^{0.5}$ depends on $x_1$.', 'MPs here are positive.'],
            md`$MP_1 = 1.5x_1^{0.5}x_2^{0.5}$, which **increases** with $x_1$ because $0.5 > 0$. Diminishing MP needs an exponent below 1.`),

          R(md`
            ### Technical rate of substitution (TRS)

            The **TRS** is the slope of the isoquant: how many units of $x_2$ the firm can give up for one more unit of $x_1$ **without changing output**.

            $$TRS = -\frac{MP_1}{MP_2}$$

            It is the producer’s version of the MRS ($-MU_1/MU_2$).

            **Why the formula works.** Moving along an isoquant, output doesn’t change: $MP_1\,\Delta x_1 + MP_2\,\Delta x_2 = 0$. Solve: $\Delta x_2/\Delta x_1 = -MP_1/MP_2$.

            **Example.** $y = x_1^{1/3}x_2^{2/3}$:
            $$TRS = -\frac{\tfrac13 x_1^{-2/3}x_2^{2/3}}{\tfrac23 x_1^{1/3}x_2^{-1/3}} = -\frac{x_2}{2x_1}$$

            !!key Cobb–Douglas TRS shortcut
              For $y = Ax_1^a x_2^b$: $\;TRS = -\dfrac{a}{b}\cdot\dfrac{x_2}{x_1}$. The $A$ cancels.
          `),
          Q(md`At bundle $(x_1, x_2) = (2, 6)$ with $y = x_1^{1/3}x_2^{2/3}$, what is the TRS?`, ['−1.5', '−6', '−0.67', '−3'], 0,
            [null, 'Use $-x_2/(2x_1)$, not $-x_2/x_1 \\cdot 2$.', 'That is $-x_1/x_2 \\cdot 2$; it is upside down.', 'You forgot the $a/b = 1/2$ factor.'],
            md`$TRS = -\dfrac{x_2}{2x_1} = -\dfrac{6}{4} = -1.5$. The firm can drop 1.5 units of $x_2$ for one more unit of $x_1$ and keep output the same.`),
          P({ q: md`$y = 5x_1^{0.3}x_2^{0.6}$. Find the TRS as an expression, then evaluate it at $(4, 2)$.`,
            parts: [X('TRS', '-0.5*x2/x1', V), N('TRS\\text{ at }(4, 2)', -0.25)],
            hints: ['$a/b = 0.3/0.6 = 0.5$.'],
            sol: md`$TRS = -\tfrac{0.3}{0.6}\cdot\tfrac{x_2}{x_1} = -0.5\,\tfrac{x_2}{x_1}$. At $(4, 2)$: $-0.5 \cdot 2/4 = -0.25$.` }),
          P({ q: md`Perfect substitutes $y = 2x_1 + x_2$.`,
            parts: [N('MP_1', 2), N('MP_2', 1), N('TRS', -2), FIX('The TRS…', ['is the same at every bundle', 'gets flatter as x₁ rises', 'gets steeper as x₁ rises'], 0, [null, 'That happens with Cobb–Douglas.', 'No: the MPs are constants.'])],
            sol: md`$MP_1 = 2$, $MP_2 = 1$, $TRS = -2/1 = -2$ everywhere: straight-line isoquants.` }),
          G('mp_trs', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l12
      {
        id: 'l12', title: 'Returns to scale',
        steps: [
          R(md`
            ### Scaling everything up

            Returns to scale (RTS) asks a **long-run** question: if the firm **doubles every input**, what happens to output?

            | If inputs double, output… | Name | In symbols ($k > 1$) |
            |---|---|---|
            | exactly doubles | **constant** returns (CRS) | $f(kx_1, kx_2) = k\,f(x_1, x_2)$ |
            | more than doubles | **increasing** returns (IRS) | $f(kx_1, kx_2) > k\,f(x_1, x_2)$ |
            | less than doubles | **decreasing** returns (DRS) | $f(kx_1, kx_2) < k\,f(x_1, x_2)$ |

            !!method The test, step by step
              1. Replace every $x_1$ with $kx_1$ and every $x_2$ with $kx_2$.
              2. Pull all the $k$’s out front.
              3. Compare: is it $k \cdot y$, more, or less?
          `),
          R(md`
            ### Cobb–Douglas: just add the exponents

            $f(kx_1, kx_2) = A(kx_1)^a(kx_2)^b = k^{a+b}\,Ax_1^a x_2^b = k^{a+b}\,y$.

            | $a + b$ | Returns to scale |
            |---|---|
            | $= 1$ | constant |
            | $> 1$ | increasing |
            | $< 1$ | decreasing |

            The $A$ in front **never** matters for returns to scale.

            **Perfect substitutes** $y = a_1x_1 + a_2x_2$: $a_1kx_1 + a_2kx_2 = k(a_1x_1 + a_2x_2) = ky$. **Constant.**

            **Perfect complements** $y = \min\{a_1x_1, a_2x_2\}$: $\min\{a_1kx_1, a_2kx_2\} = k\min\{\dots\} = ky$. **Constant.**
          `),
          Q(md`$y = 10x_1^{0.3}x_2^{0.5}$ has…`, ['decreasing returns to scale', 'increasing returns to scale', 'constant returns to scale', 'increasing returns, because A = 10 > 1'], 0,
            [null, '$0.3 + 0.5 = 0.8 < 1$.', 'The exponents sum to 0.8, not 1.', '$A$ never affects returns to scale.'],
            md`$a + b = 0.8 < 1$: decreasing returns. Doubling inputs multiplies output by $2^{0.8} \approx 1.74$.`),
          Q(md`$y = x_1x_2$ has…`, ['increasing returns to scale', 'constant returns to scale', 'decreasing returns to scale', 'no defined returns to scale'], 0,
            [null, 'Each exponent is 1, so the sum is 2.', 'The sum is 2.', 'It is just Cobb–Douglas with $a = b = 1$.'],
            md`$(kx_1)(kx_2) = k^2x_1x_2$: doubling inputs **quadruples** output. Increasing returns.`),
          Q(md`$y = 3x_1 + 7x_2$ has…`, ['constant returns to scale', 'increasing returns, since 3 + 7 > 1', 'decreasing returns to scale', 'increasing returns to scale only for x₂'], 0,
            [null, 'Adding coefficients is the Cobb–Douglas rule for exponents; it does not apply to a sum.', 'Pull out the $k$: exactly $ky$.', 'Returns to scale is about all inputs together.'],
            md`$3kx_1 + 7kx_2 = k(3x_1 + 7x_2)$: constant returns. All perfect-substitute functions are CRS.`),
          P({ q: md`For each production function, choose its returns to scale.`,
            parts: [FIX('$y = x_1^{0.5}x_2^{0.5}$', ['increasing', 'constant', 'decreasing'], 1, ['Sum is exactly 1.', null, 'Sum is exactly 1.']),
              FIX('$y = \\min\\{x_1, 2x_2\\}$', ['increasing', 'constant', 'decreasing'], 1, ['Min functions scale exactly.', null, 'Min functions scale exactly.']),
              FIX('$y = 2x_1^{0.6}x_2^{0.6}$', ['increasing', 'constant', 'decreasing'], 0, [null, '$0.6 + 0.6 = 1.2$.', '$0.6 + 0.6 = 1.2$.']),
              FIX('$y = x_1^{0.2}x_2^{0.3}$', ['increasing', 'constant', 'decreasing'], 2, ['$0.5 < 1$.', '$0.5 < 1$.', null]),
              FIX('$y = x_1 + 2x_2$', ['increasing', 'constant', 'decreasing'], 1, ['Perfect substitutes are CRS.', null, 'Perfect substitutes are CRS.'])],
            sol: md`CRS, CRS, IRS (sum 1.2), DRS (sum 0.5), CRS.` }),
          P({ q: md`Use the definition with $k = 2$ for $y = x_1^{0.5} + x_2^{0.5}$ (not Cobb–Douglas, so the shortcut does not apply).`,
            parts: [N('\\text{output multiplier when inputs double}', Math.SQRT2), FIX('Returns to scale', ['increasing', 'constant', 'decreasing'], 2, ['$\\sqrt2 < 2$.', '$\\sqrt2 \\ne 2$.', null])],
            hints: ['$(2x_1)^{0.5} = \\sqrt2\\,x_1^{0.5}$.'],
            sol: md`$(2x_1)^{0.5} + (2x_2)^{0.5} = \sqrt2(x_1^{0.5} + x_2^{0.5}) = 1.414\,y$. Doubling inputs multiplies output by only 1.414: **decreasing** returns.` }),

          R(md`
            ### Diminishing MP is **not** decreasing returns to scale

            This is the most-tested trap in this part.

            - **Diminishing marginal product:** add more of **one** input, others fixed (short run). Cobb–Douglas: each exponent below 1.
            - **Returns to scale:** increase **all** inputs together (long run). Cobb–Douglas: **sum** of exponents.

            $y = x_1^{0.6}x_2^{0.6}$: each MP diminishes (0.6 < 1), **and** it has **increasing** returns (1.2 > 1). No contradiction: one input alone runs into crowding, but growing everything together does not.

            !!trap Two different questions
              "Does MP diminish?" → look at **each** exponent. "What are the returns to scale?" → look at the **sum**.
          `),
          Q(md`$y = x_1^{0.7}x_2^{0.7}$. Which statement is **true**?`,
            ['Each MP diminishes, yet returns to scale are increasing', 'MP diminishes, so returns to scale must be decreasing', 'Returns to scale are increasing, so MPs must be increasing', 'MPs are constant and returns to scale are constant'], 0,
            [null, 'Diminishing MP and DRS are different questions.', 'Each MP has exponent $0.7 - 1 < 0$, so each diminishes.', 'Neither is constant here.'],
            md`Each exponent is 0.7 < 1, so each MP diminishes. The sum is 1.4 > 1, so returns to scale are increasing.`),
          Q(md`A firm doubles all inputs and output goes from 10 to 15. Its technology shows…`, ['decreasing returns to scale', 'increasing returns to scale', 'constant returns to scale', 'diminishing marginal product of each input'], 0,
            [null, 'Output only rose 1.5×.', 'Output would need to reach exactly 20.', 'MP is about one input; here all inputs changed.'],
            md`Doubling inputs gave only 1.5× output (15 < 20): decreasing returns. (10 → 20 would be CRS; 10 → 25 would be IRS.)`),
          G('rts', { need: 6 }),
        ],
      },
    ],
  });
})();

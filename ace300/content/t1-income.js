/* Part 1: the consumer's choice, and what happens when income changes. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });

  // p1 = 4, p2 = 2, U = x1^0.5 x2^0.5
  const choiceFig = EC.graph({
    w: 300, h: 240, x: [0, 10], y: [0, 18], xl: 'x_1', yl: 'x_2', xt: [4, 8], yt: [8, 16],
    items: [
      { seg: [[0, 16], [8, 0]], lab: '\\text{budget: } 4x_1 + 2x_2 = 32', at: 0.75, dx: 10, dy: -2 },
      { f: EC.ic(0.5, Math.sqrt(32)), from: 1.9, to: 9.5, cls: 'c2', lab: '\\text{indifference curve}', labX: 9.3, dy: -10, anchor: 'br' },
      { pt: [4, 8], lab: 'A = (4,\\,8)', at: 'tr', guide: true },
    ],
  });
  const offerFig = EC.graph({
    w: 320, h: 260, x: [0, 18], y: [0, 34], xl: 'x_1', yl: 'x_2', xt: [4, 8, 12, 16], yt: [8, 16, 24, 32],
    items: [
      { seg: [[0, 16], [8, 0]], cls: 'curve dim' }, { seg: [[0, 24], [12, 0]], cls: 'curve dim' }, { seg: [[0, 32], [16, 0]], cls: 'curve dim' },
      { f: EC.ic(0.5, Math.sqrt(32)), from: 1.4, to: 17, cls: 'c2 thin' }, { f: EC.ic(0.5, Math.sqrt(72)), from: 2.3, to: 17, cls: 'c2 thin' }, { f: EC.ic(0.5, Math.sqrt(128)), from: 3.9, to: 17, cls: 'c2 thin' },
      { seg: [[0, 0], [15, 30]], cls: 'curve c3', lab: '\\text{income offer curve}', at: 0.92, dx: 6, dy: 2, anchor: 'l' },
      { pt: [4, 8], lab: '\\$32', at: 'l' }, { pt: [6, 12], lab: '\\$48', at: 'l' }, { pt: [8, 16], lab: '\\$64', at: 'l' },
    ],
  });
  const engelFig = EC.graph({
    w: 300, h: 240, x: [0, 10], y: [0, 80], xl: 'x_1', yl: 'm\\ (\\$)', xt: [4, 6, 8], yt: [32, 48, 64],
    items: [{ seg: [[0, 0], [9.5, 76]], cls: 'curve c3', lab: '\\text{Engel curve for good 1}', at: 0.6, dx: 10, dy: 6, anchor: 'tl' }, { pt: [4, 32], lab: 'A', at: 'tl' }, { pt: [6, 48], lab: 'B', at: 'tl' }, { pt: [8, 64], lab: 'C', at: 'tl' }],
  });
  const infFig = EC.graph({
    w: 300, h: 250, x: [0, 34], y: [0, 64], xl: 'x_1', yl: 'x_2', xt: [6, 8, 20, 30], yt: [24, 40, 48, 60],
    items: [
      { seg: [[0, 40], [20, 0]], cls: 'curve dim', lab: 'm = 40', at: 0.85, dx: 6 }, { seg: [[0, 60], [30, 0]], cls: 'curve dim', lab: 'm = 60', at: 0.85, dx: 6 },
      { seg: [[8, 24], [6, 48]], cls: 'curve c3', lab: '\\text{income offer curve}', at: 1, dx: 8, dy: -4 },
      { pt: [8, 24], lab: 'A', at: 'br' }, { pt: [6, 48], lab: 'B', at: 'tl' },
    ],
  });

  C.unit({
    id: 'u1', exam: 'm2', num: 'Part 1', title: 'Income and price effects',
    lessons: [
      // ------------------------------------------------------------------ l1
      {
        id: 'l1', title: 'The starting point: the consumer’s best bundle',
        steps: [
          R(md`
            ### What this part of the course is about

            Everything in Part 1 asks one question: **when something in a shopper’s world changes, how does what they buy change?** The "something" is either their income or a price. Before we change anything, we need the starting point: what does a person buy in the first place?

            The consumer has a **budget** and **preferences**, and picks the affordable bundle they like best. That bundle is called the **optimal bundle**, written $(x_1^*, x_2^*)$. The star means "the best choice".
          `),
          RF(md`
            ### The picture

            [[fig:choice]]

            - The straight line is the **budget line**: every bundle that costs exactly the income $m$. Here prices are $p_1 = \$4$, $p_2 = \$2$ and income is $\$32$, so the line is $4x_1 + 2x_2 = 32$. Its slope is $-p_1/p_2 = -2$: to get one more unit of good 1 you must give up two units of good 2.
            - The curve is an **indifference curve**: all bundles the person likes equally. Curves farther from the origin are better.
            - The best affordable bundle is where the budget line just **touches** (is tangent to) the highest indifference curve it can reach. Here that is $A = (4, 8)$.

            !!intuition Why tangency?
              At a crossing point, the indifference curve and the budget line have different slopes, which means the person would trade goods at a different rate than the market does. They can always trade along the line and end up on a higher curve. Only where the slopes match is there nothing left to gain.
          `, { choice: { svg: choiceFig, cap: 'Budget line, the highest reachable indifference curve, and the best bundle A.' } }),
          Q(md`On a budget line with good 1 on the horizontal axis, the slope tells you…`, ['units of good 2 given up for one more unit of good 1', 'how many units of good 1 you can buy with all your income', 'how much the consumer likes good 1 compared with good 2', 'how far the line shifts when income rises by a dollar'], 0,
            [null, 'That is the horizontal intercept, $m/p_1$.', 'That is the slope of the indifference curve (the MRS), not the budget line.', 'Shifts come from income; the slope is about prices.'],
            md`Slope $= -p_1/p_2$: the market’s trade-off rate between the goods.`),

          R(md`
            ### The Cobb–Douglas shortcut (it is on your formula sheet)

            Most exam problems use **Cobb–Douglas** preferences:
            $$U(x_1, x_2) = x_1^{a}x_2^{1-a}, \qquad 0 < a < 1$$

            For these preferences the optimal bundle has a beautiful formula:
            $$x_1^* = \frac{a\,m}{p_1}, \qquad x_2^* = \frac{(1-a)\,m}{p_2}$$

            **Read it in words:** the person spends the fraction $a$ of their income on good 1 and the fraction $1-a$ on good 2, always. With $a = 0.4$ and $m = \$24$, they spend $0.4\times24 = \$9.60$ on good 1. If good 1 costs \$4, that buys $9.60/4 = 2.4$ units.

            !!key Two facts that fall out of the formula
              - Raise income and **both** quantities rise in proportion: both goods are normal.
              - $x_1^*$ does **not** contain $p_2$. Changing the price of good 2 leaves the amount of good 1 unchanged. Keep that in mind for substitutes and complements later.

            !!mistake Where the exponents go
              The exponent on good 1 goes with good 1’s price: $x_1^* = am/p_1$. Students often swap $a$ and $1-a$ under time pressure. Say it out loud: "share of income on good 1, divided by price of good 1".
          `),
          Q(md`With $U = x_1^{0.3}x_2^{0.7}$, what fraction of income is spent on good 2?`, ['70%', '30%', '50%', 'it depends on the prices'], 0,
            [null, 'That is the share for good 1 (its exponent).', 'Only if the exponents were equal.', 'For Cobb–Douglas the shares never depend on prices.'],
            md`The exponent on a good is its budget share: 0.7 for good 2.`),
          P({ q: md`A student has $U(C, M) = C^{0.4}M^{0.6}$ for coffee $C$ and muffins $M$, income \$24, $p_M = \$2$, $p_C = \$4$. Find the optimal bundle.`,
            parts: [N('C^*', 2.4), N('M^*', 7.2)],
            hints: ['Coffee gets 40% of \\$24 = \\$9.60. Divide by its price.'],
            sol: md`$C^* = 0.4\cdot24/4 = 2.4$ cups; $M^* = 0.6\cdot24/2 = 7.2$ muffins. Check: $4(2.4) + 2(7.2) = 9.6 + 14.4 = 24$. ✓ (This is the start of Discussion 5, Question 1.)` }),
          P({ q: md`$U = x_1^{1/2}x_2^{1/2}$, $p_1 = \$4$, $p_2 = \$2$, $m = \$32$. Find $(x_1^*, x_2^*)$.`, parts: [N('x_1^*', 4), N('x_2^*', 8)],
            sol: md`Half the income on each: $x_1^* = 16/4 = 4$, $x_2^* = 16/2 = 8$. This is point A in the picture above.` }),
          P({ q: md`Same preferences ($a = 1/2$) and prices, but income is \$48. Find the bundle. What happened to each quantity compared with \$32?`, parts: [N('x_1^*', 6), N('x_2^*', 12), FIX('Both quantities…', ['rose by 50%', 'stayed the same', 'rose by \\$16 each'], 0, [null, 'More income buys more of both.', 'Quantities, not dollars: each rose by half.'])],
            sol: md`$x_1^* = 24/4 = 6$, $x_2^* = 24/2 = 12$. Income rose 50% and so did both quantities: Cobb–Douglas quantities are proportional to income.` }),
          Q(md`With Cobb–Douglas preferences, the price of good 2 doubles. The quantity of good 1…`, ['stays the same', 'doubles', 'falls by half', 'rises a little'], 0,
            [null, md`$x_1^* = am/p_1$ has no $p_2$ in it.`, 'Good 1’s own price didn’t change.', 'Spending on good 1 is fixed at $am$, and $p_1$ is unchanged.'],
            md`The consumer keeps spending $am$ on good 1 at the same price $p_1$.`),
          G('cd_demand', { need: 4 }),
        ],
      },
      // ------------------------------------------------------------------ l2
      {
        id: 'l2', title: 'Income changes: income-offer curves, Engel curves, normal and inferior goods',
        steps: [
          R(md`
            ### Changing one thing at a time

            Economists study change by moving **one** thing and freezing everything else. This is called *comparative statics*. There are three experiments in Part 1:

            | We change | We hold fixed | The question |
            |---|---|---|
            | income $m$ | $p_1$ and $p_2$ | What if the budget grows? |
            | own price $p_1$ | $m$ and $p_2$ | What if good 1 gets cheaper? |
            | other price $p_2$ | $m$ and $p_1$ | What if a related good changes price? |

            Preferences are held fixed in all three. This lesson is the first row: **income**.
          `),
          R(md`
            ### What an income change does to the budget line

            The budget line is $p_1x_1 + p_2x_2 = m$. Its intercepts are $m/p_1$ and $m/p_2$; its slope is $-p_1/p_2$.

            Raise $m$ and both intercepts move out, but the slope **does not change** (prices didn’t change). So the line makes a **parallel shift outward**. Lower $m$ and it shifts inward.

            With $p_1 = \$4$ and $p_2 = \$2$:
            - $m = \$32$: intercepts 8 and 16
            - $m = \$48$: intercepts 12 and 24
            - $m = \$64$: intercepts 16 and 32
          `),
          Q(md`Income falls from \$60 to \$40, prices unchanged. The budget line…`, ['shifts inward, staying parallel', 'pivots in around the vertical axis', 'becomes steeper but keeps its intercepts', 'shifts inward and becomes flatter'], 0,
            [null, 'A pivot means a price changed.', md`The slope is $-p_1/p_2$, unchanged.`, 'Same prices, same slope.'], md`Income moves both intercepts in proportion; the slope stays.`),

          RF(md`
            ### The income offer curve

            At each income the consumer picks a new best bundle. With $U = x_1^{1/2}x_2^{1/2}$ (half of income on each good):

            | Income $m$ | $x_1^* = m/8$ | $x_2^* = m/4$ |
            |---|---|---|
            | \$32 | 4 | 8 |
            | \$48 | 6 | 12 |
            | \$64 | 8 | 16 |

            Connect those bundles and you get the **income offer curve** (sometimes called the income expansion path): the path of best bundles as income changes, prices fixed.

            [[fig:offer]]

            - If **both goods are normal**, the income offer curve slopes **upward**: more income, more of both.
            - If one good is **inferior**, the curve slopes downward or bends backward: more income, less of that good.
          `, { offer: { svg: offerFig, cap: 'Three budget lines (parallel), their tangent indifference curves, and the path of best bundles.' } }),
          RF(md`
            ### The Engel curve

            The income offer curve lives in the $(x_1, x_2)$ picture. An **Engel curve** takes one good and plots its quantity against income: $(x_1^*(m),\ m)$.

            From the table: $(4, \$32)$, $(6, \$48)$, $(8, \$64)$.

            [[fig:engel]]

            The Engel curve for good 1 slopes **upward**, so good 1 is **normal**. (On the formula sheet: "Engel for good $i$: $(x_i^*(m), m)$". Quantity goes on the horizontal axis, income on the vertical.)
          `, { engel: { svg: engelFig, cap: 'Engel curve for good 1: quantity on the horizontal axis, income on the vertical.' } }),
          Q(md`An Engel curve plots…`, ['a good’s quantity against income', 'both goods’ quantities against each other', 'one good’s quantity against its own price', 'income against price'], 0,
            [null, 'That is the income offer curve.', 'That is a demand curve.', 'Prices are held fixed on an Engel curve.'], md`Engel curve: $(x_i^*(m), m)$.`),

          R(md`
            ### Normal and inferior goods

            The classification is about **how quantity responds when income rises**, with prices fixed:

            | When income rises… | the good is | Engel curve |
            |---|---|---|
            | quantity rises | **normal** | slopes up |
            | quantity falls | **inferior** | slopes down |

            Inferior does **not** mean low quality in an absolute sense. It means people buy less of it as they get richer: instant noodles, bus rides, store-brand goods for some people. The same good can be normal at low incomes and inferior at high incomes.

            !!intuition Can both goods be inferior?
              No. If income rises and you spend all of it, you must buy more of **something**. At most one of two goods can be inferior over a given income change.
          `),
          RF(md`
            ### Your turn: classify from a table

            Prices are fixed at $p_1 = \$2$, $p_2 = \$1$. Income rises from \$40 to \$60:

            | Income | $x_1^*$ | $x_2^*$ |
            |---|---|---|
            | \$40 | 8 | 24 |
            | \$60 | 6 | 48 |

            [[fig:inf]]
          `, { inf: { svg: infFig, cap: 'Higher income moves the best bundle up and to the left.' } }),
          P({ q: md`Using the table above: classify each good, and say which way each Engel curve slopes over this range.`,
            parts: [FIX('Good 1 is…', ['normal', 'inferior'], 1, ['Its quantity fell (8 → 6) when income rose.', null]), FIX('Good 2 is…', ['normal', 'inferior'], 0, [null, 'Its quantity rose (24 → 48).']),
              FIX('Engel curve for good 1', ['slopes up', 'slopes down'], 1, ['More income, less good 1: down.', null])],
            sol: md`Good 1: $8 \to 6$ as income rises, so it is **inferior** here and its Engel curve slopes down. Good 2: $24 \to 48$, **normal**, Engel curve slopes up. The income offer curve moves **up and to the left**. (Check the budget: $2\cdot6 + 48 = 60$ ✓.)` }),
          Q(md`The income offer curve between two incomes goes **up and to the left**. Which is true?`, ['good 1 is inferior and good 2 is normal', 'both goods are normal', 'good 1 is normal and good 2 is inferior', 'both goods are inferior'], 0,
            [null, 'Both normal would mean up and to the right.', 'Up means more good 2; left means less good 1.', 'Impossible when all income is spent.'], md`Left = less $x_1$ (inferior); up = more $x_2$ (normal).`),
          Q(md`A good is normal at low incomes and inferior at high incomes. Its Engel curve…`, ['rises, then bends backward', 'is a straight line through the origin', 'is horizontal', 'slopes down at every income level'], 0,
            [null, 'That is Cobb–Douglas: normal at every income.', 'A horizontal Engel curve would mean income stays fixed.', 'It is normal at low incomes, so it rises there.'],
            md`Quantity rises with income at first, then falls: the curve turns back toward the vertical axis.`),
          Q(md`For Cobb–Douglas preferences, the Engel curve for good 1 is…`, [md`a ray from the origin, $m = (p_1/a)\,x_1$`, 'downward sloping, like a demand curve', 'horizontal at the current income level', 'vertical at the current quantity bought'], 0,
            [null, md`$x_1^* = am/p_1$ rises with $m$.`, 'Income is on the vertical axis; it varies along the curve.', 'Quantity changes as income changes.'],
            md`Solve $x_1 = am/p_1$ for $m$: $m = (p_1/a)\,x_1$. Proportional: both goods always normal.`),
          P({ q: md`$U = x_1^{0.25}x_2^{0.75}$, $p_1 = \$5$, $p_2 = \$3$. Find $x_1^*$ at incomes \$40 and \$80. Is good 1 normal or inferior?`,
            parts: [N('x_1^*\\ (m = 40)', 2), N('x_1^*\\ (m = 80)', 4), FIX('Good 1 is…', ['normal', 'inferior'], 0, [null, 'Quantity doubled when income doubled.'])],
            sol: md`$x_1^* = 0.25m/5 = m/20$: 2 at \$40, 4 at \$80. Normal (as every Cobb–Douglas good is).` }),
          Q(md`Income rises and the quantity of bus trips falls, all prices fixed. On a graph with the price of bus trips on the vertical axis, the demand curve for bus trips…`, ['shifts left', 'shifts right', 'does not move; we move along it', 'becomes vertical'], 0,
            [null, 'Fewer trips at every price means left.', 'A change in income shifts demand; only an own-price change moves along it.', 'Nothing here says demand stops responding to price.'],
            md`Income is not on the axes, so changing it shifts the whole curve. Bus trips are inferior here.`),
          R(md`
            ### Practice
            Each card gives a new table or situation. Classify, compute, and check.
          `),
          G('income_mix', { need: 5 }),
        ],
      },
    ],
  });
})();

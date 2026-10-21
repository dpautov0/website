/* Part 1 continued: price changes, the Slutsky decomposition, Giffen goods, substitutes and complements. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });

  // m = 48, p2 = 2, p1: 4 -> 2, U = x1^.5 x2^.5
  const pivotFig = EC.graph({
    w: 310, h: 250, x: [0, 26], y: [0, 26], xl: 'x_1', yl: 'x_2', xt: [6, 12, 24], yt: [12, 24],
    items: [
      { seg: [[0, 24], [12, 0]], cls: 'curve dim', lab: '\\text{old: } p_1 = 4', at: 0.82, dx: 6 },
      { seg: [[0, 24], [24, 0]], lab: '\\text{new: } p_1 = 2', at: 0.86, dx: 6 },
      { pt: [6, 12], lab: 'A', at: 'bl' }, { pt: [12, 12], lab: 'B', at: 'tr' },
    ],
  });
  const demandFig = EC.graph({
    w: 280, h: 220, x: [0, 16], y: [0, 6], xl: 'x_1', yl: 'p_1', xt: [6, 12], yt: [2, 4],
    items: [{ f: (x) => 24 / x, from: 4.2, to: 15.5, lab: '\\text{demand for good 1}', labX: 15.5, dy: -10, anchor: 'br' }, { pt: [6, 4], lab: 'A', at: 'tr', guide: true }, { pt: [12, 2], lab: 'B', at: 'tr', guide: true }],
  });
  const slutskyFig = EC.graph({
    w: 330, h: 270, x: [0, 26], y: [0, 26], xl: 'x_1', yl: 'x_2', xt: [6, 9, 12, 18, 24], yt: [9, 12, 18, 24],
    items: [
      { seg: [[0, 24], [12, 0]], cls: 'curve dim', lab: '\\text{original}', at: 0.8, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 24], [24, 0]], lab: '\\text{new}', at: 0.85, dx: 6, dy: 0, anchor: 'l' },
      { seg: [[0, 18], [18, 0]], cls: 'curve c4 dash', lab: '\\text{comp.}', at: 0.88, dx: 6, dy: 0, anchor: 'l' },
      { f: EC.ic(0.5, Math.sqrt(72)), from: 3, to: 25, cls: 'c2 thin' }, { f: EC.ic(0.5, 12), from: 5.6, to: 25, cls: 'c2 thin' },
      { pt: [6, 12], lab: 'A', at: 'tl' }, { pt: [9, 9], lab: 'C', at: 'bl' }, { pt: [12, 12], lab: 'B', at: 'tr' },
    ],
  });
  const incFig = EC.graph({
    w: 320, h: 260, x: [0, 34], y: [0, 34], xl: 'x_1', yl: 'x_2', xt: [5, 7.5, 10, 20, 30], yt: [10, 15, 20, 30],
    items: [
      { seg: [[0, 20], [20, 0]], cls: 'curve dim', lab: '\\text{original } (p_1 = 2)', at: 0.8, dx: 8, dy: 0, anchor: 'l' },
      { seg: [[0, 20], [10, 0]] },
      { seg: [[0, 30], [15, 0]], cls: 'curve c4 dash', lab: '\\text{compensated } (m = 60)', at: 0.15, dx: 10 },
      { pt: [10, 10], lab: 'A', at: 'tr' }, { pt: [7.5, 15], lab: 'C', at: 'tr' }, { pt: [5, 10], lab: 'B', at: 'bl' },
    ],
  });
  const giffenFig = EC.graph({
    w: 300, h: 220, x: [0, 10], y: [0, 10], xl: 'x_1', yl: 'p_1', xt: [], yt: [],
    items: [
      { pts: [[1.5, 8.5], [2.6, 6.6], [3.8, 5.0], [5.0, 3.6]], cls: 'curve', lab: '\\text{demand}', labI: 0, dx: 10, dy: 4, anchor: 'l' },
      { pts: [[5.0, 3.6], [4.2, 2.4]], cls: 'curve c5' },
      { pts: [[4.2, 2.4], [5.4, 1.5], [7.2, 0.9], [9.2, 0.6]], cls: 'curve' },
      { text: [5.4, 3.2], t: '\\text{Giffen range: } p_1\\uparrow\\ \\Rightarrow\\ x_1\\uparrow', anchor: 'l' }],
  });
  const relFig = EC.graph({
    w: 300, h: 220, x: [0, 20], y: [0, 6], xl: '\\text{tea}', yl: 'p_{\\text{tea}}', xt: [8, 12], yt: [2],
    items: [{ seg: [[0, 4], [16, 0]], cls: 'curve dim', lab: '\\text{before}', at: 0.3, dx: -4, dy: 6, anchor: 'tr' }, { seg: [[0, 5], [20, 0]], cls: 'curve', lab: '\\text{after}', at: 0.3, dx: 4, dy: -4, anchor: 'bl' },
      { pt: [8, 2], guide: 'x' }, { pt: [12, 2], guide: 'x' }, { arrow: [[8.6, 2.5], [11.4, 2.5]], cls: 'dim' }],
  });

  C.unit({
    id: 'u1b', exam: 'm2', num: 'Part 1', title: 'Price changes',
    lessons: [
      // ------------------------------------------------------------------ l3
      {
        id: 'l3', title: 'A price change and the Slutsky decomposition',
        steps: [
          RF(md`
            ### When a price falls, two things happen at once

            Suppose income is \$48, good 2 costs \$2, and good 1’s price falls from \$4 to \$2. The budget line **pivots** around its vertical intercept (you can still buy 24 units of good 2 if you spend everything on it), and the horizontal intercept jumps from 12 to 24.

            [[fig:pivot]]

            With $U = x_1^{1/2}x_2^{1/2}$ the best bundle moves from $A = (6, 12)$ to $B = (12, 12)$: good 1 doubles.

            Plotting $p_1$ against $x_1^*$ traces the **demand curve** for good 1: the point $(6, \$4)$ and the point $(12, \$2)$. A change in a good’s **own price** is a movement **along** its demand curve.

            [[fig:dem]]
          `, { pivot: { svg: pivotFig, cap: 'Cheaper good 1: the line pivots out around the vertical intercept.' }, dem: { svg: demandFig, cap: 'The two bundles give two points on the demand curve.' } }),
          R(md`
            ### Why did good 1 go up? Two separate reasons

            1. **Substitution effect.** Good 1 became cheaper **relative to** good 2. Even if the person were no richer, they would shift toward the relatively cheaper good.
            2. **Income effect.** With the same \$48, the person can now afford more of everything. A price drop is like a raise. They spend part of that "raise" on good 1 (if it is normal).

            The **total effect** (A to B) is the sum: total = substitution + income. The Slutsky decomposition is the recipe that splits the total into its two pieces.

            !!intuition The question behind Slutsky
              "If I took away just enough income that the person could **exactly** afford their old bundle at the **new** prices, what would they buy?" Whatever change remains is pure substitution, because their buying power was held fixed.
          `),
          Q(md`The substitution effect of a price change is the change in quantity caused by…`, ['the change in relative prices, with buying power held fixed', 'the change in buying power, with relative prices held fixed', 'the change in income that the consumer receives', 'the change in preferences after the price change'], 0,
            [null, 'That describes the income effect.', 'Income doesn’t change in a price experiment.', 'Preferences are fixed throughout.'], md`Substitution = reaction to new relative prices only.`),

          RF(md`
            ### The Slutsky method, step by step

            **Step 1. Find A and B.** Use the demand formulas at the old prices (A) and the new prices (B), with the real income.
            - $A$: $x_1 = 48/(2\cdot4) = 6$, $x_2 = 48/(2\cdot2) = 12$
            - $B$: $x_1 = 48/(2\cdot2) = 12$, $x_2 = 12$

            **Step 2. Price the old bundle A at the new prices.** That is the "adjusted income":
            $$m' = p_1^{\text{new}}x_1^A + p_2x_2^A = 2(6) + 2(12) = \$36$$

            **Step 3. Find C** with the new prices and the adjusted income $m'$:
            - $x_1^C = 36/(2\cdot2) = 9$, $x_2^C = 36/(2\cdot2) = 9$, so $C = (9, 9)$

            **Step 4. Subtract quantities of the same good.**
            - Substitution effect $= x_1^C - x_1^A = 9 - 6 = +3$
            - Income effect $= x_1^B - x_1^C = 12 - 9 = +3$
            - Total effect $= x_1^B - x_1^A = 12 - 6 = +6$ ✓ (3 + 3)

            [[fig:sl]]

            On the graph, the **compensated budget line** (dashed) is parallel to the **new** line (new prices) and passes through **A** (just affords the old bundle). C is the best point on it.
          `, { sl: { svg: slutskyFig, cap: 'Grey: original line. Blue: new line. Purple dashed: compensated line. A → C is the substitution effect; C → B is the income effect.' } }),
          Q(md`The Slutsky compensated budget line is…`, ['parallel to the new budget line and passes through the old bundle A', 'parallel to the old budget line and passes through the new bundle B', 'parallel to the new budget line and tangent to the old indifference curve', 'the old budget line shifted out by the price change'], 0,
            [null, 'That mixes up which line and which bundle.', 'Tangent to the old curve is the compensating variation (CV) line, a different tool.', 'It uses the new prices, so it has the new slope.'],
            md`New prices (so parallel to the new line), old bundle just affordable (so through A).`),
          Q(md`To find the adjusted income in the Slutsky method, you compute…`, ['the cost of the old bundle at the new prices', 'the cost of the new bundle at the old prices', 'the cost of the old bundle at the old prices', 'the original income times the price ratio'], 0,
            [null, 'Backwards: the old bundle, priced at new prices.', 'That is just the original income.', 'No such rule.'], md`$m' = p_1^{\text{new}}x_1^A + p_2^{\text{new}}x_2^A$.`),
          Q(md`In the Slutsky decomposition, the income effect on good 1 is…`, [md`$x_1^B - x_1^C$`, md`$x_1^C - x_1^A$`, md`$x_1^B - x_1^A$`, md`$x_1^A - x_1^C$`], 0,
            [null, 'That is the substitution effect.', 'That is the total effect.', 'Wrong order and wrong pair.'], md`Income effect: from C (compensated) to B (final).`),

          RF(md`
            ### Worked example: a price **increase**

            $x_1 = m/(2p_1)$, $x_2 = m/(2p_2)$, $m = \$40$, $p_2 = \$2$, and $p_1$ **rises** from \$2 to \$4.

            1. $A = (40/4,\ 40/4) = (10, 10)$; $B = (40/8,\ 10) = (5, 10)$.
            2. Adjusted income $m' = 4(10) + 2(10) = \$60$. (More than 40: to afford the old bundle at the higher price, the person would need **more** money.)
            3. $C$: $x_1 = 60/8 = 7.5$, $x_2 = 60/4 = 15$.
            4. Substitution $= 7.5 - 10 = -2.5$; income $= 5 - 7.5 = -2.5$; total $= 5 - 10 = -5$.

            [[fig:inc]]

            Both effects are negative: good 1 got relatively more expensive (substitute away from it) and the person is poorer (buy less of a normal good).
          `, { inc: { svg: incFig, cap: 'Blue: new line (p₁ = 4). For a price increase the compensated line is farther out than the new line.' } }),
          P({ q: md`Same setup as the price-increase example ($x_1 = m/(2p_1)$, $x_2 = m/(2p_2)$, $m = \$40$, $p_2 = \$2$), but $p_1$ rises from \$2 to **\$5**. Find the adjusted income, $C$, and the three effects on good 1.`,
            parts: [N("m'", 70), N('x_1^C', 7), N('x_2^C', 17.5), N('\\text{substitution}', -3), N('\\text{income}', -3), N('\\text{total}', -6)],
            hints: ['A = (10, 10) as before. B: $x_1 = 40/10 = 4$.', '$m\' = 5(10) + 2(10)$.'],
            sol: md`$A = (10, 10)$, $B = (4, 10)$. $m' = 5\cdot10 + 2\cdot10 = 70$. $C$: $x_1 = 70/10 = 7$, $x_2 = 70/4 = 17.5$. Substitution $7 - 10 = -3$, income $4 - 7 = -3$, total $4 - 10 = -6$.` }),
          P({ q: md`$U = x_1^{0.4}x_2^{0.6}$ (so $x_1 = 0.4m/p_1$), $m = \$30$, $p_2 = \$1$, $p_1$ falls from \$2 to \$1. Decompose the change in good 1.`,
            parts: [N('x_1^A', 6), N('x_1^B', 12), N("m'", 24), N('x_1^C', 9.6), N('\\text{substitution}', 3.6), N('\\text{income}', 2.4)],
            hints: ['$A$: $x_1 = 0.4(30)/2 = 6$ and $x_2 = 0.6(30)/1 = 18$.', '$m\' = 1(6) + 1(18)$.'],
            sol: md`$A = (6, 18)$, $B = (12, 18)$. $m' = 1\cdot6 + 1\cdot18 = 24$. $C$: $x_1 = 0.4\cdot24/1 = 9.6$. Substitution $9.6 - 6 = 3.6$; income $12 - 9.6 = 2.4$; total $6$ ✓.` }),

          R(md`
            ### Which way does each effect point?

            The **substitution effect always works against the price change**: price down, quantity up (along the compensated line); price up, quantity down. No exceptions.

            The **income effect depends on the type of good**. A price drop makes you richer:
            - normal good: richer → buy more, so the income effect is also **positive**, and the two effects **reinforce**;
            - inferior good: richer → buy less, so the income effect is **negative** and **opposes** the substitution effect.

            | Good 1 is… (price falls) | Substitution | Income | Together |
            |---|---|---|---|
            | normal | + | + | reinforce |
            | inferior | + | − | oppose; the bigger one wins |

            !!mistake Sign slips
              Effects are measured as **changes in quantity**, so they carry signs. A price **increase** on a normal good gives a negative substitution effect **and** a negative income effect.
          `),
          Q(md`Coffee is a normal good and its price falls (income and other prices fixed). The signs of the substitution, income and total effects on coffee are…`, ['+, +, +', '+, −, +', '−, +, −', '−, −, −'], 0,
            [null, 'For a normal good the income effect of a price drop is positive.', 'The substitution effect of a price drop is always positive.', 'That would be a price increase.'],
            md`Cheaper coffee: substitute toward it (+); richer, and coffee is normal (+); total +.`),
          Q(md`A good is inferior and its price rises. The substitution effect and income effect on its quantity are…`, ['negative and positive', 'negative and negative', 'positive and negative', 'positive and positive'], 0,
            [null, 'For an inferior good, being poorer raises quantity: income effect positive.', 'A price rise gives a negative substitution effect.', 'Neither: substitution is negative.'],
            md`Price up: substitute away (−). Poorer: buy **more** of an inferior good (+). They oppose.`),
          Q(md`For a price decrease, the Slutsky substitution effect is 0.48 and the income effect is 0.32. The total effect is…`, ['0.80', '0.16', '−0.16', '1.50'], 0,
            [null, 'Total = substitution + income, not the difference.', 'Both are positive, so the total is positive.', 'Add them; don’t divide.'], md`$0.48 + 0.32 = 0.80$.`),
          G('slutsky', { need: 4 }),
        ],
      },
      // ------------------------------------------------------------------ l4
      {
        id: 'l4', title: 'Giffen goods, substitutes and complements, shifts versus movements',
        steps: [
          RF(md`
            ### Ordinary and Giffen goods

            Almost always, when a good’s own price rises, people buy less of it. That is an **ordinary** good (downward-sloping demand).

            A **Giffen** good is the rare exception: for some prices, **quantity rises when its own price rises**.

            How is that even possible? From the table in the last lesson: when $p_1$ rises, the substitution effect is negative. For quantity to rise anyway, the income effect must be **positive and bigger**. A positive income effect from a price rise (you are poorer, yet buy more) means the good is **inferior**. So:

            - every Giffen good is inferior, and its income effect outweighs its substitution effect;
            - an inferior good is still ordinary if the substitution effect is bigger (the usual case).

            [[fig:g]]
          `, { g: { svg: giffenFig, cap: 'Red: the Giffen range, where demand slopes upward (price and quantity move together).' } }),
          Q(md`Which statement is true?`, ['every Giffen good is inferior', 'every inferior good is Giffen', 'every normal good is Giffen', 'Giffen goods have no income effect'], 0,
            [null, 'Most inferior goods are ordinary: their substitution effect wins.', 'For a normal good both effects push quantity opposite to the price.', 'The income effect is exactly what makes them Giffen.'],
            md`Giffen needs an income effect that outweighs substitution, and pushing the "wrong" way, which only an inferior good has.`),
          Q(md`A good’s price falls and its quantity **falls**. The good is…`, ['Giffen in this range', 'normal', 'ordinary, since the price fell', 'a complement to another good'], 0,
            [null, 'For a normal good both effects raise quantity when price falls.', 'Ordinary means quantity moves opposite to price.', 'Complements is about another good’s price.'],
            md`Quantity moved in the same direction as its own price: Giffen.`),

          RF(md`
            ### Prices of related goods

            Now change the **other** good’s price, $p_2$, holding $m$ and $p_1$ fixed, and watch good 1:

            | When $p_2$ rises, $x_1$… | Relationship | Example |
            |---|---|---|
            | rises | **gross substitutes** ($\partial x_1/\partial p_2 > 0$) | coffee price ↑ → tea demand ↑ |
            | falls | **gross complements** ($\partial x_1/\partial p_2 < 0$) | burrito price ↑ → guacamole demand ↓ |

            Substitutes replace each other; complements are used together. Notice the signs flip for a price **decrease**: if coffee gets cheaper, tea demand falls.

            Because $p_2$ is not on good 1’s axes, a change in $p_2$ **shifts** good 1’s whole demand curve. Below, coffee got more expensive, so tea demand shifted right: at the same tea price of \$2, people buy 12 cups instead of 8.

            [[fig:rel]]

            !!key Cobb–Douglas is neither
              With Cobb–Douglas, $x_1^* = am/p_1$ has no $p_2$ in it, so $\partial x_1/\partial p_2 = 0$: the goods are neither gross substitutes nor gross complements.
          `, { rel: { svg: relFig, cap: 'Tea demand shifts right when coffee (a substitute) gets more expensive.' } }),
          Q(md`Hot dogs and buns are complements. Hot dog prices rise (bun prices and income fixed). The demand curve for buns…`, ['shifts left', 'shifts right', 'does not move; we move up along it', 'becomes steeper'], 0,
            [null, 'Right would mean substitutes.', 'The bun price didn’t change, so it is not a movement along bun demand.', 'Nothing here changes how buns respond to their own price.'],
            md`Pricier hot dogs → fewer hot dogs → fewer buns needed at every bun price: shift left.`),
          Q(md`The price of tea falls and coffee purchases fall (income and coffee price fixed). Coffee and tea are…`, ['gross substitutes', 'gross complements', 'neither', 'both inferior'], 0,
            [null, 'Complements would move the other way: cheaper tea → more coffee.', 'Coffee changed, so they are related.', 'Income didn’t change; this is a cross-price question.'],
            md`$p_{\text{tea}}$ ↓ and $x_{\text{coffee}}$ ↓: same direction, $\partial x/\partial p > 0$, substitutes.`),
          P({ q: md`Demand for good 1 is $x_1 = 20 - 2p_1 + 0.5p_2 + 0.1m$. Find $\partial x_1/\partial p_2$ and classify the goods.`,
            parts: [N('\\partial x_1/\\partial p_2', 0.5), FIX('The goods are…', ['gross substitutes', 'gross complements', 'neither'], 0, [null, 'The derivative is positive.', 'It is not zero.'])],
            sol: md`$\partial x_1/\partial p_2 = 0.5 > 0$: raising $p_2$ raises $x_1$, so they are gross substitutes.` }),

          R(md`
            ### Shift or movement? The one rule

            **If the thing that changed is on the graph’s axes (the good’s own price), you move along the curve. If it is anything else (income, another price, tastes, number of buyers), the whole curve shifts.**

            | What changes | Budget line | Demand for good 1 | Classification |
            |---|---|---|---|
            | income $m$ | parallel shift | curve shifts | normal / inferior |
            | own price $p_1$ | pivot | move along the curve | ordinary / Giffen |
            | other price $p_2$ | pivot | curve shifts | substitutes / complements |
          `),
          P({ q: md`For each case, all other demand factors stay fixed.

            1. Income rises; the consumer buys fewer bus trips.
            2. Coffee’s price falls; coffee purchases rise.
            3. Tea’s price rises; coffee purchases rise.`,
            parts: [FIX('1. Bus-trip demand…', ['shifts left', 'shifts right', 'moves along the curve'], 0, [null, 'Fewer trips at the same price.', 'Income is not on the axes.']),
              FIX('1. Bus trips are…', ['normal', 'inferior'], 1, ['Quantity fell as income rose.', null]),
              FIX('2. Coffee demand…', ['shifts left', 'shifts right', 'moves along the curve'], 2, ['Own price changed: no shift.', 'Own price changed: no shift.', null]),
              FIX('2. Coffee is…', ['ordinary', 'Giffen'], 0, [null, 'Quantity moved opposite to price.']),
              FIX('3. Coffee demand…', ['shifts left', 'shifts right', 'moves along the curve'], 1, ['More coffee at the same coffee price is a rightward shift.', null, 'Tea’s price is not on coffee’s axes.']),
              FIX('3. Coffee and tea are…', ['substitutes', 'complements'], 0, [null, 'Tea price up and coffee up: same direction.'])],
            sol: md`1. Bus demand shifts left; bus trips are inferior here. 2. A movement along coffee demand; coffee is ordinary. 3. Coffee demand shifts right; coffee and tea are substitutes.` }),
          Q(md`A rise in a good’s **own** price causes…`, ['a movement along its demand curve', 'a shift of its demand curve to the left', 'a shift of its demand curve to the right', 'a pivot of its demand curve'], 0,
            [null, 'Own price is on the axis: move along, don’t shift.', 'Only factors off the axes shift the curve.', 'Demand curves shift; budget lines pivot.'], md`Own price → movement along.`),
          G('shift_move', { need: 5 }),
        ],
      },
    ],
  });
})();

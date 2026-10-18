/* Part 2: market demand (horizontal summation) and elasticity. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });

  const burekInd = EC.graph({
    w: 300, h: 230, x: [0, 32], y: [0, 22], xl: 'q', yl: 'P', xt: [10, 20], yt: [5, 20],
    items: [{ seg: [[0, 20], [20, 0]], cls: 'curve', lab: 'q_A = 20 - P', at: 0.3, dx: 8 }, { seg: [[0, 5], [10, 0]], cls: 'curve c2', lab: 'q_B = 10 - 2P', at: 0.6, dx: 6 }],
  });
  const burekMkt = EC.graph({
    w: 300, h: 230, x: [0, 34], y: [0, 22], xl: 'Q', yl: 'P', xt: [15, 30], yt: [5, 20],
    items: [{ pts: [[0, 20], [15, 5], [30, 0]], cls: 'curve c3', lab: 'Q(P)', labI: 0, dx: 10, dy: 4, anchor: 'l' }, { pt: [15, 5], lab: '\\text{kink } (15,\\,5)', at: 'tr', guide: true }],
  });
  const threeMkt = EC.graph({
    w: 310, h: 240, x: [0, 36], y: [0, 22], xl: 'Q', yl: 'P', xt: [15, 24, 34], yt: [2, 5, 20],
    items: [{ pts: [[0, 20], [15, 5], [24, 2], [34, 0]], cls: 'curve c3', lab: 'Q(P)', labI: 0, dx: 10, dy: 4, anchor: 'l' }, { pt: [15, 5], guide: true }, { pt: [24, 2], guide: true }],
  });
  const elasFig = EC.graph({
    w: 300, h: 240, x: [0, 11], y: [0, 11], xl: 'Q', yl: 'P', xt: [5, 10], yt: [5, 10],
    items: [{ seg: [[0, 10], [10, 0]], lab: 'Q = 10 - P', at: 0.85, dx: 6 }, { pt: [5, 5], lab: '|\\varepsilon| = 1', at: 'tr', guide: true },
      { text: [2.4, 8.6], t: '\\text{elastic: } |\\varepsilon| > 1', anchor: 'l' }, { text: [6.6, 2.3], t: '\\text{inelastic: } |\\varepsilon| < 1', anchor: 'l' }],
  });

  C.unit({
    id: 'u2', exam: 'm2', num: 'Part 2', title: 'Market demand and elasticity',
    lessons: [
      // ------------------------------------------------------------------ l5
      {
        id: 'l5', title: 'Market demand: adding up the buyers',
        steps: [
          R(md`
            ### From one person to a whole market

            So far we studied one consumer. A store or a farmer faces **everyone**. Market demand answers: at each price, how much will **all** consumers buy together?

            The answer is simple: **at each price, add up everybody’s quantity.**
            $$Q(P) = q_1(P) + q_2(P) + \dots + q_n(P)$$

            On a graph with price on the vertical axis, adding quantities at the same price means adding **horizontally** (sideways). That is why it is called the **horizontal sum**.

            !!mistake Add quantities, never prices
              You add $q$’s at the same $P$. Adding inverse demands (adding the $P$’s at the same $q$) is a classic wrong answer.
          `),
          RF(md`
            ### The catch: people drop out at high prices

            Each person has a **choke price**: the price at which they stop buying altogether (their quantity hits zero). Above it they are simply not in the market, and their formula would give a **negative** quantity, which is meaningless.

            Two consumers: $q_A(P) = 20 - P$ and $q_B(P) = 10 - 2P$.

            [[fig:ind]]

            - A buys whenever $P < 20$ (set $20 - P = 0$: $P = 20$).
            - B buys only when $P < 5$ (set $10 - 2P = 0$: $P = 5$).

            So the market has **three price ranges**:
            - $P > 20$: nobody buys, $Q = 0$.
            - $5 < P \le 20$: only A buys, $Q = 20 - P$.
            - $0 \le P \le 5$: both buy, $Q = (20 - P) + (10 - 2P) = 30 - 3P$.
          `, { ind: { svg: burekInd, cap: 'Two individual demand curves. B drops out at P = 5.' } }),
          Q(md`Consumer $q(P) = 12 - 3P$. At what price does this consumer enter the market (start buying)?`, ['below \\$4', 'below \\$12', 'below \\$3', 'below \\$9'], 0,
            [null, 'That is the quantity at a price of zero, not the choke price.', 'Set $12 - 3P = 0$: $P = 4$.', 'No.'], md`$12 - 3P = 0 \Rightarrow P = 4$. For prices below \$4 they buy a positive amount.`),

          RF(md`
            ### The three-step method

            **Step 1. Choke prices.** Set each $q_i(P) = 0$ and solve for $P$. Here: A at \$20, B at \$5.

            **Step 2. Add, range by range.** In each price range, add only the people who are buying:
            $$Q(P) = \begin{cases} 30 - 3P, & 0 \le P \le 5 \\ 20 - P, & 5 < P \le 20 \\ 0, & P > 20 \end{cases}$$

            **Step 3. Endpoints.** Find $Q$ at the boundaries, then connect the dots:
            - $P = 0$: $Q = 30$
            - $P = 5$: $Q = 30 - 15 = 15$ (and the other formula gives $20 - 5 = 15$ too: the pieces meet)
            - $P = 20$: $Q = 0$

            [[fig:mkt]]

            The market demand has a **kink** at $(15, 5)$: above \$5 it is just A’s demand; below \$5 B joins and the curve gets flatter (more responsive).
          `, { mkt: { svg: burekMkt, cap: 'Market demand: A alone above P = 5, both below. Kink where B enters.' } }),
          Q(md`Why is market demand **flatter** below the kink?`, ['another buyer joins, adding more quantity', 'the first buyer becomes more price sensitive', 'prices are lower, so the slope is always flatter', 'the formula switches over to inverse demand'], 0,
            [null, 'Each person’s own demand is unchanged.', 'Linear pieces have constant slopes; the change comes from who is buying.', 'Nothing switches; we still add quantities.'],
            md`Below \$5 a \$1 cut adds $1$ unit from A **plus** $2$ units from B: $\Delta Q = 3$ instead of 1.`),
          P({ q: md`Three consumers: $q_1 = 20 - P$, $q_2 = 10 - 2P$, $q_3 = 4 - 2P$. Find each choke price, then $Q(P)$ on each range, then the quantities at the boundaries.`,
            parts: [N('\\text{choke } q_1', 20), N('\\text{choke } q_2', 5), N('\\text{choke } q_3', 2),
              X('Q(P),\\ 0 \\le P \\le 2', '34 - 5*P', { P: [0, 2] }), X('Q(P),\\ 2 < P \\le 5', '30 - 3*P', { P: [2, 5] }), X('Q(P),\\ 5 < P \\le 20', '20 - P', { P: [5, 20] }),
              N('Q(0)', 34), N('Q(2)', 24), N('Q(5)', 15)],
            hints: ['Choke prices: 20, 5 and 2. Below \\$2 all three buy.', 'Below \\$2: $(20 - P) + (10 - 2P) + (4 - 2P)$.'],
            sol: md`Choke prices \$20, \$5, \$2.
            $$Q(P) = \begin{cases} 34 - 5P, & 0 \le P \le 2 \\ 30 - 3P, & 2 < P \le 5 \\ 20 - P, & 5 < P \le 20 \end{cases}$$
            $Q(0) = 34$, $Q(2) = 24$, $Q(5) = 15$, $Q(20) = 0$. Two kinks: at $(24, 2)$ and $(15, 5)$.

            [[fig:three]]`, figs: { three: { svg: threeMkt, cap: 'Two kinks, one for each consumer who joins.' } } }),
          P({ q: md`With $Q(P) = 30 - 3P$ for $P \le 5$ and $20 - P$ for $5 < P \le 20$: how much is demanded at \$3? At \$8? At \$25?`,
            parts: [N('Q(3)', 21), N('Q(8)', 12), N('Q(25)', 0)],
            sol: md`\$3 is in the low range: $30 - 9 = 21$. \$8 is in the middle range: $20 - 8 = 12$. \$25 is above every choke price: nobody buys, $Q = 0$.` }),
          Q(md`Using $Q = 30 - 3P$ (below \$5) and $20 - P$ (\$5 to \$20): when the price rises from \$1 to \$1.10, quantity falls by…`, ['0.3', '0.1', '3', '0.03'], 0,
            [null, 'That is the slope of the upper piece; \\$1 is on the lower piece.', 'Off by 10: the price change is \\$0.10.', 'No.'],
            md`On the lower piece, $\Delta Q = -3\Delta P = -3(0.10) = -0.3$.`),
          R(md`
            ### Movements versus shifts, for the market

            - A change in the price itself moves us **along** the market demand curve.
            - The market demand curve **shifts** when anything else changes: incomes, tastes, prices of related goods, or **the number of consumers**. More buyers shift market demand to the right.
          `),
          Q(md`A new apartment building opens and 200 new customers move near a coffee shop. Market demand for its coffee…`, ['shifts right', 'shifts left', 'moves along the curve to a higher quantity', 'becomes vertical'], 0,
            [null, 'More buyers means more quantity at every price.', 'The price didn’t change; this is not a movement along.', 'No.'], md`More consumers in the sum → more quantity at every price.`),
          G('market_demand', { need: 4 }),
        ],
      },
      // ------------------------------------------------------------------ l6
      {
        id: 'l6', title: 'Price elasticity of demand and revenue',
        steps: [
          R(md`
            ### Why not just use the slope?

            We want to know how **responsive** buyers are to price. The slope of demand ($\Delta Q/\Delta P$) seems like an answer, but it depends on units: measure milk in gallons instead of quarts and the slope changes by a factor of 4 even though buyers behave the same.

            The fix is to use **percent changes**, which have no units. The **price elasticity of demand** is
            $$\varepsilon = \frac{\%\Delta Q}{\%\Delta P} = \frac{\Delta Q/Q}{\Delta P/P} = \frac{P}{Q}\cdot\frac{\Delta Q}{\Delta P} \;\to\; \frac{P}{Q}\cdot\frac{\partial Q}{\partial P}$$

            It answers: "if the price goes up 1%, by what percent does quantity change?" Because demand slopes down, $\varepsilon$ is **negative**.

            !!key How to read the size
              - $|\varepsilon| > 1$: **elastic** (buyers respond a lot)
              - $|\varepsilon| < 1$: **inelastic** (buyers respond little)
              - $|\varepsilon| = 1$: **unit elastic**
              - $\varepsilon = 0$: perfectly inelastic (vertical demand)
              - $|\varepsilon| = \infty$: perfectly elastic (horizontal demand)
          `),
          Q(md`A 10% price increase cuts quantity demanded by 5%. Demand is…`, ['inelastic, ε = −0.5', 'elastic, ε = −2', 'unit elastic, ε = −1', 'inelastic, ε = −2'], 0,
            [null, 'Quantity changes less than price: $|\\varepsilon| < 1$.', 'Unit elastic needs equal percentages.', '$-5/10 = -0.5$, not $-2$.'], md`$\varepsilon = -5\%/10\% = -0.5$: inelastic.`),

          RF(md`
            ### Computing it from a demand function

            For $Q(P) = 10 - P$: $\partial Q/\partial P = -1$, so
            $$\varepsilon = \frac{P}{Q}\cdot(-1) = \frac{-P}{10 - P}$$

            | $P$ | $\varepsilon$ | |
            |---|---|---|
            | 0 | 0 | perfectly inelastic |
            | 2.5 | $-2.5/7.5 = -1/3$ | inelastic |
            | 5 | $-5/5 = -1$ | unit elastic |
            | 7.5 | $-7.5/2.5 = -3$ | elastic |
            | near 10 | → $-\infty$ | perfectly elastic |

            [[fig:el]]

            **The same straight line has every elasticity.** Elastic at the top, unit elastic at the midpoint, inelastic at the bottom. Why? Near the top, the price is high and the quantity is small, so a \$1 change is a **small** percent of price but a **large** percent of quantity. Near the bottom it is the reverse.

            !!mistake Slope is not elasticity
              A straight demand line has the **same slope** everywhere but a **different elasticity** at every point. Never call a demand curve "elastic" just because it looks flat without computing.
          `, { el: { svg: elasFig, cap: 'One straight line: elastic above the midpoint, inelastic below it.' } }),
          P({ q: md`Market demand is $Q(P) = 30 - P$. Find the price elasticity at $P = 20$ and classify it.`,
            parts: [N('\\varepsilon', -2), FIX('Demand at P = 20 is…', ['elastic', 'inelastic', 'unit elastic'], 0, [null, '$|\\varepsilon| = 2 > 1$.', 'Only at the midpoint P = 15.'])],
            hints: ['$\\varepsilon = \\dfrac{P}{Q}\\cdot\\dfrac{\\partial Q}{\\partial P}$, with $Q = 30 - 20 = 10$ and $\\partial Q/\\partial P = -1$.'],
            sol: md`$Q = 10$, slope $-1$: $\varepsilon = (20/10)(-1) = -2$. Elastic.` }),
          P({ q: md`Demand $Q = 100 - 4P$. Find $\varepsilon$ at $P = 5$ and at $P = 20$. At what price is demand unit elastic?`,
            parts: [N('\\varepsilon\\ (P = 5)', -0.25), N('\\varepsilon\\ (P = 20)', -4), N('P\\ \\text{unit elastic}', 12.5)],
            hints: ['$\\varepsilon = -4P/(100 - 4P)$.', 'Unit elastic: $4P = 100 - 4P$.'],
            sol: md`$\varepsilon = \dfrac{-4P}{100 - 4P}$. At $P = 5$: $-20/80 = -0.25$ (inelastic). At $P = 20$: $-80/20 = -4$ (elastic). Unit elastic where $4P = 100 - 4P$, $P = 12.5$, the midpoint of the line.` }),
          Q(md`On a straight-line demand curve, where is demand unit elastic?`, ['at the midpoint of the line', 'at the vertical intercept', 'at the horizontal intercept', 'everywhere, since the slope is constant'], 0,
            [null, 'There it is perfectly elastic.', 'There it is perfectly inelastic.', 'Slope is constant; elasticity is not.'], md`At the midpoint, $P/Q$ equals the inverse slope, giving $|\varepsilon| = 1$.`),

          R(md`
            ### Elasticity and revenue (what a seller cares about)

            Revenue is $R = P\times Q$. Raise the price and two things happen:
            - **price effect**: each unit sold brings in more (revenue up);
            - **quantity effect**: fewer units are sold (revenue down).

            Which wins depends on elasticity:

            | Demand is… | Raise the price → revenue | Why |
            |---|---|---|
            | elastic ($|\varepsilon| > 1$) | **falls** | quantity drops by a bigger % than price rises |
            | unit elastic | unchanged | the two effects cancel |
            | inelastic ($|\varepsilon| < 1$) | **rises** | quantity drops by a smaller % |

            So a seller facing inelastic demand should raise the price; facing elastic demand, lower it. For a straight-line demand, revenue is largest at the unit-elastic midpoint.
          `),
          Q(md`Demand for a bakery’s bread is inelastic at the current price. If the bakery raises its price, revenue…`, ['rises', 'falls', 'stays the same', 'cannot be predicted from elasticity'], 0,
            [null, 'That happens with elastic demand.', 'Only at unit elasticity.', 'That is exactly what elasticity predicts.'],
            md`Inelastic: quantity falls by a smaller percent than price rises, so $P\times Q$ goes up.`),
          Q(md`A ticket seller finds that lowering the price **raised** total revenue. Demand in that range was…`, ['elastic', 'inelastic', 'unit elastic', 'perfectly inelastic'], 0,
            [null, 'With inelastic demand a price cut lowers revenue.', 'Revenue would not change.', 'Quantity would not respond at all.'], md`A price cut raises revenue only when quantity rises by a bigger percent: elastic.`),

          R(md`
            ### Constant-elasticity demand

            Some demand curves have the **same** elasticity at every price:
            $$Q(P) = kP^{-e}, \qquad \varepsilon = -e \text{ everywhere}$$

            **Check:** $\partial Q/\partial P = -ekP^{-e-1}$, so $\varepsilon = \dfrac{P}{kP^{-e}}\cdot(-ekP^{-e-1}) = -e$. The $P$’s cancel.

            Example: $Q = 55P^{-1}$ has $\varepsilon = -1$ everywhere (unit elastic, so revenue $PQ = 55$ no matter the price).
          `),
          Q(md`Demand is $Q = 200P^{-0.5}$. Its price elasticity…`, ['is −0.5 at every price', 'is −2 at every price', 'is −0.5 only at the price P = 1', 'changes as you move along the curve'], 0,
            [null, 'The exponent itself is the elasticity, not its inverse.', 'For this form it is the same everywhere.', 'That is the point of constant-elasticity demand.'],
            md`$Q = kP^{-e}$ with $e = 0.5$: $\varepsilon = -0.5$ everywhere.`),
          G('elasticity', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l7
      {
        id: 'l7', title: 'Income elasticity: normal, inferior and luxury goods',
        steps: [
          R(md`
            ### The same idea, with income

            The **income elasticity of demand** measures how quantity responds to **income**:
            $$\varepsilon_m = \frac{\%\Delta Q}{\%\Delta m} = \frac{m}{Q}\cdot\frac{\partial Q}{\partial m}$$

            Its sign and size classify goods:

            | Income elasticity | Type of good | Meaning |
            |---|---|---|
            | $\varepsilon_m < 0$ | **inferior** | richer → buy less |
            | $\varepsilon_m > 0$ | **normal** | richer → buy more |
            | $\varepsilon_m > 1$ | **luxury** (a normal good) | spending on it grows faster than income |
            | $0 < \varepsilon_m < 1$ | normal, not luxury (a necessity) | grows, but slower than income |

            Notice how this lines up with Engel curves: an upward Engel curve means $\varepsilon_m > 0$.
          `),
          Q(md`A 10% rise in income raises the quantity of restaurant meals by 25%. Restaurant meals are…`, ['a luxury (εm = 2.5)', 'a normal necessity (εm = 0.4)', 'inferior', 'unit elastic in price'], 0,
            [null, 'Divide 25 by 10, not 10 by 25.', 'Quantity rose with income.', 'This is an income elasticity, not a price one.'], md`$\varepsilon_m = 25\%/10\% = 2.5 > 1$: luxury.`),
          RF(md`
            ### Worked example

            $Q = 500 - 2P + 0.05m$, with $P = 50$ and $m = \$100{,}000$.

            1. Quantity: $Q = 500 - 100 + 5000 = 5400$.
            2. Derivative: $\partial Q/\partial m = 0.05$.
            3. Elasticity: $\varepsilon_m = \dfrac{100{,}000}{5400}\times0.05 = 0.926$.

            Positive and below 1: a **normal good, but not a luxury**. A 1% raise in income increases quantity by about 0.93%.
          `, {}),
          P({ q: md`$Q = 500 - 2P + 0.05m$. Find the income elasticity at $P = 50$ and $m = \$100{,}000$.`, parts: [N('\\varepsilon_m', 0.926, '', 0.005)],
            sol: md`$Q = 5400$; $\varepsilon_m = (100000/5400)(0.05) = 0.926$.` }),
          P({ q: md`$Q = 80 - 4P - 0.002m$ at $P = 5$ and $m = 10{,}000$. Find $\varepsilon_m$ and classify the good.`,
            parts: [N('Q', 40), N('\\varepsilon_m', -0.5), FIX('The good is…', ['normal', 'inferior', 'a luxury'], 1, ['Negative elasticity.', null, 'Luxury needs εm > 1.'])],
            sol: md`$Q = 80 - 20 - 20 = 40$. $\varepsilon_m = (10000/40)(-0.002) = -0.5$: inferior.` }),
          Q(md`For Cobb–Douglas preferences ($x_1^* = am/p_1$), the income elasticity of good 1 is…`, ['exactly 1', '$a$', 'zero', 'more than 1'], 0,
            [null, md`The share $a$ cancels out of the elasticity.`, 'Quantity does respond to income.', 'Quantity is exactly proportional to income.'],
            md`$\dfrac{m}{x_1}\cdot\dfrac{a}{p_1} = \dfrac{m}{am/p_1}\cdot\dfrac{a}{p_1} = 1$: double income, double quantity.`),
          Q(md`A good has income elasticity 0.3. Which is true?`, ['it is normal and a necessity', 'it is inferior', 'it is a luxury, since 0.3 is positive', 'its quantity falls as income rises'], 0,
            [null, 'Inferior needs a negative elasticity.', 'Luxury needs more than 1.', 'A positive elasticity means quantity rises.'],
            md`Quantity grows 0.3% per 1% of income: spending grows slower than income, so its share shrinks.`),
          G('income_elas', { need: 4 }),
        ],
      },
    ],
  });
})();

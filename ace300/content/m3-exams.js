/* Mini Exam 3 · practice exams A, B, C in the real format: Q1 is five multiple-choice items (4 points each), Q2–Q6
   are multipart written problems (16 points each). Every written problem asks for the plan first, one plan step per
   part that needs a different technique, then gives a full worked solution with the moves named. Across A–C every
   skill on the study guide appears at least once. All numbers were checked with Node. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const { N, X, FIX, plan } = M3;

  const intro = (name, covers) => R(md`
    ### ${name}

    **Format, exactly like the real exam:** 50 minutes, 100 points. **Q1** is five multiple-choice items worth 4 points each (20 points). **Q2–Q6** are written problems worth 16 points each (80 points): calculations, graphs, brief explanations. Pencil, calculator, and the formula sheet ([what each line is for](#/l/m3-sheet)).

    **How to use it.** Do the whole exam on paper first, with a 50-minute timer, no notes. **Then** come back and work through each card: answer its plan question (how would you attack this part?), type your answers, and read the worked solution even when you were right.

    **This exam covers:** ${covers}
  `);

  // ================================================================== exam A figures
  // A Q2: q = 6 sqrt(x1); isoprofit q = 1.5 x1 + 6 touches at (4, 12); after p = 15, q = x1 + 9 touches at (9, 18)
  const aIsoFig = EC.graph({
    w: 330, h: 260, x: [0, 13], y: [0, 26], xl: 'x_1', yl: 'q', xt: [4, 9], yt: [6, 9, 12, 18],
    items: [
      { f: (x) => 6 * Math.sqrt(x), from: 0, to: 12.6, lab: 'q = 6\\sqrt{x_1}', labX: 12.6, dx: -4, dy: 14, anchor: 'tr' },
      { f: (x) => 1.5 * x + 6, from: 0, to: 12.6, cls: 'c2 dash', lab: '\\pi = 15', labX: 12, dx: -6, dy: 0, anchor: 'r' },
      { f: (x) => x + 9, from: 0, to: 12.6, cls: 'c3 dash', lab: '\\pi = 90\\ (p = 15)', labX: 12.6, dx: -2, dy: -8, anchor: 'br' },
      { pt: [4, 12], lab: 'p = 10', at: 'tl', guide: true }, { pt: [9, 18], lab: 'p = 15', at: 'br', guide: true },
    ],
  });

  // ================================================================== exam A
  const xa = [
    intro('Practice exam A', 'short-run input choice and isoprofit lines; a cubic cost, the shutdown price and operating at a loss; long-run equilibrium and a demand shift; a per-unit tax with incidence and welfare; a linear monopoly with CS, PS, DWL and the Lerner index.'),
    R(md`### Q1. Multiple choice (20 points)`),
    Q(md`**(a)** A dentist's practice brings in \$300,000 a year. She pays \$180,000 in explicit costs (rent, staff, supplies). To run it she gave up a hospital job paying \$140,000. Her accounting profit and economic profit are…`,
      ['\\$120,000 and −\\$20,000', '\\$120,000 and \\$120,000', '−\\$20,000 and \\$120,000', '\\$120,000 and \\$260,000'], 0,
      [null, 'Economic profit also subtracts the implicit cost, the \\$140,000 salary she gave up.', 'Swapped: accounting profit ignores the forgone salary, so it is the bigger number.', 'The forgone salary is a cost, so it is subtracted, not added.'],
      md`Accounting: $300{,}000 - 180{,}000 = 120{,}000$. Economic: $120{,}000 - 140{,}000 = -20{,}000$. She would earn \$20,000 more at the hospital.`, { src: 'Q1a · 4 pts' }),
    Q(md`**(b)** A price-taking firm uses input 1 (input 2 fixed). The price of input 1, $w_1$, rises; the output price $p$ does not change. Its short-run isoprofit lines become…`,
      ['steeper', 'flatter', 'shifted up but with the same slope', 'unchanged'], 0,
      [null, 'Flatter is what a higher output price does: the slope $w_1/p$ falls when $p$ rises.', 'The slope is $w_1/p$, and $w_1$ just rose.', 'The slope $w_1/p$ depends on $w_1$.'],
      md`The isoprofit slope is $w_1/p$: the output one more unit of input 1 must produce to pay for itself. A higher $w_1$ makes it steeper, so the best line touches the production function further left: the firm hires less.`, { src: 'Q1b · 4 pts' }),
    Q(md`**(c)** A competitive firm has min AVC = \$10 and min LRAC = \$16. The price is \$13 and is expected to stay there. The firm…`,
      ['produces now and exits in the long run', 'shuts down now', 'stays in the industry forever because $P > \\min AVC$', 'earns zero economic profit'], 0,
      [null, 'Shutting down is for $P < \\min AVC$; \\$13 covers variable cost.', 'In the long run every cost is avoidable, so the test becomes $P$ versus min LRAC, and \\$13 < \\$16.', 'Profit is negative: the price is below the cost per unit.'],
      md`Short run: $13 > \min AVC = 10$, so operate (lose less than the fixed cost). Long run: $13 < \min LRAC = 16$, so exit.`, { src: 'Q1c · 4 pts' }),
    Q(md`**(d)** A price ceiling is set **below** the equilibrium price. The quantity actually traded equals…`,
      ['the quantity supplied at the ceiling', 'the quantity demanded at the ceiling', 'the equilibrium quantity', 'the shortage'], 0,
      [null, 'Buyers want that much, but sellers will not supply it at the low price. Trade needs both sides.', 'A binding ceiling cuts the quantity below equilibrium.', 'The shortage is the gap $Q^D - Q^S$, not what is traded.'],
      md`Trade happens only up to the **short side** of the market. Below equilibrium, sellers are the short side, so $Q = Q^S(\bar P)$.`, { src: 'Q1d · 4 pts' }),
    Q(md`**(e)** A single-price monopolist with positive marginal cost maximizes profit. At its chosen price, demand is…`,
      ['elastic', 'inelastic', 'unit elastic', 'elastic or inelastic, depending on its fixed cost'], 0,
      [null, 'On the inelastic part $MR < 0$, so cutting output would raise revenue and cut cost: not a maximum.', 'Unit elastic means $MR = 0$, but $MR = MC > 0$.', 'Fixed cost never changes the $MR = MC$ point.'],
      md`$MR = P(1 + 1/\varepsilon_p) = MC > 0$ requires $1 + 1/\varepsilon_p > 0$, i.e. $|\varepsilon_p| > 1$.`, { src: 'Q1e · 4 pts' }),

    R(md`
      ### Q2. Profit and input choice (16 points)

      A price-taking bakery has production function $q = 2x_1^{1/2}x_2^{1/2}$, where $x_1$ is labor hours and $x_2$ is oven capacity. In the short run oven capacity is fixed at $\bar x_2 = 9$. The output price is $p = \$10$, the wage is $w_1 = \$15$, and capacity rents for $w_2 = \$5$ per unit.
    `),
    P({ src: 'Q2 · 16 pts', title: 'Bakery: inputs, isoprofit, a price change',
      q: md`(a) Find $MP_1$ as a function of $x_1$. (b) Find the profit-maximizing $x_1$, output and profit. (c) Write the isoprofit line through the optimum and give its slope and intercept. (d) The output price rises to \$15. Find the new $x_1$, output and profit, and say what happened to the isoprofit lines. (e) Briefly: if instead the rental price of capacity $w_2$ rose, what would happen to $x_1^*$?`,
      plan: [
        plan('Parts (a) and (b) ask for the best amount of labor. Which condition do you use?', '$p\\,MP_1 = w_1$, with $MP_1 = \\partial q/\\partial x_1$ at $x_2 = 9$', [
          ['$MP_1 = w_1$', '$MP_1$ is in loaves, $w_1$ in dollars. Multiply by the price to get what the extra hour is worth: $p\\,MP_1$.'],
          ['$MP_1/MP_2 = w_1/w_2$', 'That is the long-run cost-minimizing tangency. In the short run $x_2$ is fixed, so there is no choice of $x_2$ to balance.'],
          ['Hire as much labor as possible', 'More labor always adds output, but once $p\\,MP_1 < w_1$ each hour costs more than it brings in.'],
        ], '$MP_1 = x_1^{-1/2}x_2^{1/2} = 3/\\sqrt{x_1}$ at $x_2 = 9$. Set $10 \\cdot 3/\\sqrt{x_1} = 15$ and solve.'),
        plan('Part (c) asks for the isoprofit line. What do you write down?', 'Solve $\\pi = pq - w_1x_1 - w_2\\bar x_2$ for $q$: slope $w_1/p$, intercept $(\\pi + w_2\\bar x_2)/p$', [
          ['The production function $q = 6\\sqrt{x_1}$', 'That is the technology: what can be made. An isoprofit line is a set of plans with the same profit.'],
          ['A line with slope $p/w_1$', 'Upside down. One more hour costs $w_1$ dollars, which is $w_1/p$ loaves of output: the slope is $w_1/p$.'],
          ['A line with slope $w_2/w_1$', 'That ratio belongs to an isocost line in cost minimization, not to profit.'],
        ], 'Plug the optimal profit $\\pi^* = 15$, $\\bar x_2 = 9$, $w_2 = 5$, $p = 10$ into the sheet formula.'),
        plan('Part (d) raises $p$ to \\$15. How do you find the new plan?', 'Redo $p\\,MP_1 = w_1$ with $p = 15$; the slope $w_1/p$ falls, so the lines get flatter and touch further right', [
          ['Keep $x_1 = 4$ and scale revenue by 1.5', 'A higher price makes each extra hour worth more, so the firm hires more. The plan changes.'],
          ['The lines get steeper, so the firm hires less', 'The slope is $w_1/p$; a bigger denominator makes it smaller (flatter).'],
          ['Nothing changes in the short run', 'Labor is the **variable** input in the short run. Only capacity is fixed.'],
        ], '$15 \\cdot 3/\\sqrt{x_1} = 15$. Then $q = 6\\sqrt{x_1}$ and $\\pi = pq - w_1x_1 - w_2\\bar x_2$.'),
        plan('Part (e) changes $w_2$, the price of the fixed input. What does that move?', 'Only profit (the isoprofit intercept), not $x_1^*$', [
          ['$x_1^*$ falls, because costs rose', '$w_2$ does not appear in $p\\,MP_1 = w_1$. The cost of the fixed input is paid whatever $x_1$ is.'],
          ['The isoprofit slope', 'The slope is $w_1/p$; $w_2$ sits only in the intercept.'],
          ['The bakery shuts down at once', 'A fixed cost cannot change the short-run choice. It only lowers profit.'],
        ], 'A fixed cost is a constant in $\\pi(x_1)$; constants vanish when you differentiate. The choice of $x_1$ is unchanged.'),
      ],
      parts: [
        X('MP_1', '3*x1^(-0.5)', { x1: [1, 16] }),
        N('x_1^*', 4), N('q^*', 12), N('\\pi^*', 15),
        N('\\text{isoprofit slope}', 1.5), N('\\text{isoprofit intercept}', 6),
        N('x_1^*\\ (p = 15)', 9), N('q^*\\ (p = 15)', 18), N('\\pi^*\\ (p = 15)', 90),
        FIX('(d) At $p = 15$ the isoprofit lines are…', ['flatter (slope 1)', 'steeper (slope 2.25)', 'parallel to the old ones'], 0,
          [null, 'Steeper would need $w_1/p$ to rise; $p$ went up, so it fell.', 'The slope $w_1/p$ changed from 1.5 to 1.']),
        FIX('(e) If $w_2$ rose from \\$5 to \\$20, $x_1^*$ would…', ['stay at 4', 'fall', 'rise'], 0,
          [null, '$w_2$ is a fixed cost here; it is not in $p\\,MP_1 = w_1$.', 'Nothing in the hiring condition changed.']),
      ],
      hints: ['$x_2^{1/2} = 3$, so $q = 6\\sqrt{x_1}$ and $MP_1 = 3x_1^{-1/2}$.', '$30/\\sqrt{x_1} = 15 \\Rightarrow \\sqrt{x_1} = 2$.'],
      figs: { iso: { svg: aIsoFig, cap: 'The best isoprofit line just touches $q = 6\\sqrt{x_1}$. At $p = 10$ (orange, slope 1.5) it touches at (4, 12). At $p = 15$ the lines are flatter (green, slope 1) and touch at (9, 18).' } },
      sol: md`
        **Move 1: short-run production function.** With $\bar x_2 = 9$, $x_2^{1/2} = 3$, so
        $$q = 2x_1^{1/2}(3) = 6\sqrt{x_1}$$

        **Move 2 (a): $MP_1$.** Treat $x_2$ as a constant and use the power rule:
        $$MP_1 = \frac{\partial q}{\partial x_1} = 2 \cdot \tfrac12 x_1^{-1/2}x_2^{1/2} = x_1^{-1/2}(3) = \frac{3}{\sqrt{x_1}}$$

        **Move 3 (b): hire until $p\,MP_1 = w_1$.**
        $$10 \cdot \frac{3}{\sqrt{x_1}} = 15 \;\Rightarrow\; \frac{30}{\sqrt{x_1}} = 15 \;\Rightarrow\; \sqrt{x_1} = 2 \;\Rightarrow\; x_1^* = 4$$
        Output: $q^* = 6\sqrt 4 = 12$. Profit:
        $$\pi^* = pq - w_1x_1 - w_2\bar x_2 = 10(12) - 15(4) - 5(9) = 120 - 60 - 45 = 15$$

        **Move 4 (c): the isoprofit line.** Solve $\pi = pq - w_1x_1 - w_2\bar x_2$ for $q$:
        $$q = \frac{w_1}{p}x_1 + \frac{\pi + w_2\bar x_2}{p} = \frac{15}{10}x_1 + \frac{15 + 45}{10} = 1.5x_1 + 6$$
        Slope 1.5: one more labor hour costs \$15, which is 1.5 loaves' worth of revenue. Intercept 6. Check: at $x_1 = 4$, $1.5(4) + 6 = 12 = q^*$ ✓.

        **Move 5 (d): new price, same condition.**
        $$15 \cdot \frac{3}{\sqrt{x_1}} = 15 \;\Rightarrow\; \sqrt{x_1} = 3 \;\Rightarrow\; x_1^* = 9, \qquad q^* = 6(3) = 18$$
        $$\pi^* = 15(18) - 15(9) - 45 = 270 - 135 - 45 = 90$$
        The slope $w_1/p$ fell from $15/10 = 1.5$ to $15/15 = 1$: **flatter** lines, which touch the production function further right (more labor, more output). New line: $q = x_1 + (90 + 45)/15 = x_1 + 9$; at $x_1 = 9$ it gives 18 ✓.

        [[fig:iso]]

        **Move 6 (e): a fixed-input price.** $w_2\bar x_2$ is a fixed cost: it does not change with $x_1$, so it drops out of $p\,MP_1 = w_1$. $x_1^*$ stays 4 and $q^*$ stays 12; only profit falls (to $120 - 60 - 180 = -120$) and the isoprofit intercept moves.
      `,
    }),
    R(md`
      ### Q3. Short-run cost, shutdown and profit (16 points)

      A competitive firm has short-run cost $C(q) = q^3 - 12q^2 + 60q + 256$.
    `),
    P({ src: 'Q3 · 16 pts', title: 'A cubic cost: shutdown, break-even, a loss',
      q: md`(a) Give the fixed cost, $AVC(q)$ and $MC(q)$. (b) Find the output where AVC is smallest and the shutdown price. (c) Show that AC is smallest at $q = 8$ and give the break-even price. (d) The price is \$39. Find the output, profit and producer surplus, and say whether the firm should operate. Shade total revenue and the loss. (e) At what price does the firm supply 9 units?`,
      plan: [
        plan('Part (a): how do you split $C(q)$?', 'The constant 256 is $F$; the rest is $VC$; then $AVC = VC/q$ and $MC = dC/dq$', [
          ['$AVC = C(q)/q$', 'That is AC: it still contains the fixed cost, $256/q$.'],
          ['$F = C(1) = 305$', '$C(1)$ also includes the variable cost of the first unit. $F$ is the cost at $q = 0$.'],
          ['$MC = C(q)/q$', 'That is an average. MC is the derivative: the cost of the next unit.'],
        ], '$F = 256$, $VC = q^3 - 12q^2 + 60q$, $AVC = q^2 - 12q + 60$, $MC = 3q^2 - 24q + 60$.'),
        plan('Parts (b) and (c) ask for two special prices. What are they?', 'Shutdown = bottom of AVC ($MC = AVC$); break-even = bottom of AC ($MC = AC$)', [
          ['Both are the bottom of AC', 'Shutdown ignores the fixed cost, which is paid either way in the short run, so it uses AVC.'],
          ['Shutdown is where $MC = 0$', '$MC = 0$ is not a landmark. Shutdown compares the price with the lowest possible variable cost per unit.'],
          ['Shutdown is where $P = AC$', 'That is break-even. Between min AVC and min AC the firm loses money but still operates.'],
        ], 'Set $MC = AVC$ for (b). For (c) evaluate $MC(8)$ and $AC(8)$: if they are equal, $q = 8$ is the bottom of AC.'),
        plan('Part (d): $39 = MC$ gives $q = 1$ or $q = 7$. What do you do?', 'Take $q = 7$ (MC rising), check $39 >$ min AVC, then $\\pi = TR - TC$ and $PS = TR - VC$', [
          ['Take $q = 1$, the cheaper output', 'At $q = 1$ MC is falling: units just beyond it cost less than \\$39, so profit is still rising. It is the profit minimum.'],
          ['Shut down: \\$39 is below min AC = 60', 'Below min AC means a loss, not shutdown. Compare with min AVC = 24 for that.'],
          ['Average the roots: $q = 4$', 'Neither root is chosen by averaging. The maximum is the root on the rising branch.'],
        ], '$q = 7$. $TR = 39 \\times 7$, $TC = C(7)$, $VC = VC(7)$. Operate if the loss is smaller than $F$.'),
        plan('Part (e): at what price does it supply 9 units?', 'Plug $q = 9$ into $MC$: the supply curve is $P = MC(q)$ above min AVC', [
          ['Plug $q = 9$ into $AC$', 'AC is cost per unit, not the price that makes 9 the best output.'],
          ['Plug $q = 9$ into $AVC$', 'The firm picks $q$ where the **next** unit pays for itself: $P = MC$.'],
          ['Solve $MC = AVC$ again', 'That is the shutdown point; it does not depend on the quantity supplied.'],
        ], '$MC(9) = 3(81) - 24(9) + 60$. Check it is above 24.'),
      ],
      parts: [
        N('F', 256), X('AVC(q)', 'q^2 - 12*q + 60', { q: [1, 10] }), X('MC(q)', '3*q^2 - 24*q + 60', { q: [1, 10] }),
        N('q_{\\min AVC}', 6), N('P_{\\text{shutdown}}', 24), N('P_{\\text{break-even}}', 60),
        N('q^*\\ (P = 39)', 7), N('\\pi', -158), N('PS', 98),
        FIX('(d) Should the firm operate at \\$39?', ['yes: it loses \\$158, less than the \\$256 it loses by shutting down', 'no: the price is below AC, so it loses money', 'no: it should produce where $P = AC$ instead'], 0,
          [null, 'Below AC means a loss either way. Shutting down loses all of $F = 256$; producing loses only 158.', 'Output is chosen by $P = MC$. $P = AC$ is never the rule for how much to make.']),
        N('P\\text{ for }q = 9', 87),
      ],
      hints: ['$MC = AVC$: $3q^2 - 24q + 60 = q^2 - 12q + 60 \\Rightarrow 2q^2 - 12q = 0$.', '$39 = 3q^2 - 24q + 60 \\Rightarrow q^2 - 8q + 7 = 0 \\Rightarrow (q - 1)(q - 7) = 0$.'],
      figs: { loss: { svg: EC.graph({
        w: 330, h: 270, x: [0, 10.5], y: [0, 100], xl: 'q', yl: '\\$', xt: [6, 7, 8], yt: [24, 39, 60],
        items: [
          { poly: [[0, 0], [7, 0], [7, 39], [0, 39]], cls: 'ex' },
          { poly: [[0, 39], [7, 39], [7, 431 / 7], [0, 431 / 7]], cls: 'loss' },
          { seg: [[0, 39], [10.5, 39]], cls: 'curve c3', lab: 'P = 39', at: 'end', dx: -2, dy: -6, anchor: 'br' },
          { f: (q) => 3 * q * q - 24 * q + 60, from: 1.2, to: 9.4, cls: 'c5', lab: 'MC', labX: 9.4, dx: 4, dy: 4, anchor: 'l' },
          { f: (q) => q * q - 12 * q + 60, from: 0.5, to: 10.5, cls: 'c2', lab: 'AVC', labX: 10.5, dx: -2, dy: -6, anchor: 'br' },
          { f: (q) => q * q - 12 * q + 60 + 256 / q, from: 3.5, to: 10.5, lab: 'AC', labX: 10.5, dx: -2, dy: -6, anchor: 'br' },
          { pt: [6, 24], guide: true }, { pt: [8, 60] }, { pt: [7, 39] }, { pt: [7, 431 / 7] },
          { text: [3.5, 50], t: '\\text{loss} = 158' }, { text: [3.5, 19], t: 'TR = 273' },
        ],
      }), cap: 'At $P = 39$ the firm makes 7 units. Gray: total revenue $39 \\times 7 = 273$. Red: the loss $(61.57 - 39)\\times 7 = 158$. Gray plus red is total cost, $AC \\times q = 431$.' } },
      sol: md`
        **Move 1 (a): split the cost.** The constant is the fixed cost: $F = 256$. The rest is variable:
        $$VC = q^3 - 12q^2 + 60q, \qquad AVC = \frac{VC}{q} = q^2 - 12q + 60, \qquad MC = \frac{dC}{dq} = 3q^2 - 24q + 60$$

        **Move 2 (b): bottom of AVC, where $MC = AVC$.**
        $$3q^2 - 24q + 60 = q^2 - 12q + 60 \;\Rightarrow\; 2q^2 - 12q = 0 \;\Rightarrow\; 2q(q - 6) = 0 \;\Rightarrow\; q = 6$$
        Shutdown price $= AVC(6) = 36 - 72 + 60 = 24$. Below \$24 the firm makes nothing.

        **Move 3 (c): bottom of AC.** MC crosses AC at AC's minimum, so check $MC(8) = AC(8)$:
        $$MC(8) = 192 - 192 + 60 = 60, \qquad AC(8) = \frac{512 - 768 + 480 + 256}{8} = \frac{480}{8} = 60$$
        They match ✓. Break-even price $= 60$.

        **Move 4 (d): $P = MC$, rising branch.**
        $$39 = 3q^2 - 24q + 60 \;\Rightarrow\; 3q^2 - 24q + 21 = 0 \;\Rightarrow\; q^2 - 8q + 7 = 0 \;\Rightarrow\; (q - 1)(q - 7) = 0$$
        Take $q = 7$, where MC is rising. Is $39 \ge 24$? Yes, so the firm operates.
        $$TR = 39 \times 7 = 273, \quad VC(7) = 343 - 588 + 420 = 175, \quad TC = 175 + 256 = 431$$
        $$\pi = 273 - 431 = -158, \qquad PS = TR - VC = 273 - 175 = 98$$
        Check: $\pi = PS - F = 98 - 256 = -158$ ✓.

        **Why operate at a loss?** Shut down: lose $F = 256$. Operate: lose 158. Revenue covers all of the variable cost and \$98 of the fixed cost. Price (39) is between min AVC (24) and min AC (60): zone "operate at a loss".

        [[fig:loss]]

        **Move 5 (e): price for 9 units.** On the supply curve $P = MC$: $MC(9) = 243 - 216 + 60 = 87$, above 24 ✓. So at \$87 the firm supplies 9 units (and then earns a profit, since $87 > 60$).
      `,
    }),

    R(md`
      ### Q4. Long-run equilibrium and a demand shift (16 points)

      A constant-cost competitive industry has identical firms, free entry and exit, and constant input prices. Each firm's long-run cost is $LRC(q) = 4q^2 + 100$. Market demand is $Q = 2000 - 20P$. In the short run, the number of firms is fixed and each firm's short-run cost is also $4q^2 + 100$ (the 100 is fixed in the short run).
    `),
    P({ src: 'Q4 · 16 pts', title: 'Long run, then demand jumps',
      q: md`(a) Find each firm's output and the price in long-run equilibrium. (b) Find the market quantity and the number of firms. (c) Demand rises to $Q = 2600 - 20P$. Before any firm can enter, find the short-run price, market quantity, output per firm and profit per firm. (d) Find the new long-run price, market quantity and number of firms, and briefly explain how the market gets there.`,
      plan: [
        plan('Parts (a) and (b): what pins down the long-run price?', '$P = \\min LRAC$: set $LRMC = LRAC$; then $Q$ from demand at that price, $n = Q/q^*$', [
          ['Set market demand equal to one firm’s LRMC', 'One firm is a sliver of the market. Entry and exit pin the price at the bottom of LRAC; demand only sets how much is bought there.'],
          ['Set $MR = MC$ with the market demand', 'That is a monopolist. These firms are price takers.'],
          ['Set $LRAC = 0$', 'Zero is the **profit**, not the cost: $P = LRAC$ at its minimum makes profit zero.'],
        ], '$LRAC = 4q + 100/q$, $LRMC = 8q$. Set them equal, find $q^*$ and $P = LRAC(q^*)$. Then $Q = 2000 - 20P$ and $n = Q/q^*$.'),
        plan('Part (c): demand jumps, no time for entry. How do you get the short-run price?', 'Hold $n$ fixed: one firm’s supply from $P = MC$, times $n$, set equal to the new demand', [
          ['The price stays at min LRAC = 40', 'That is where the market ends up **after** entry. With $n$ fixed, more demand bids the price up first.'],
          ['Use the long-run number of firms', 'Entry takes time. In the short run you have the old $n$.'],
          ['Set new demand equal to the old market quantity, 1200', 'Each firm can raise output along its MC, so quantity rises too: you need the short-run supply curve.'],
        ], '$MC = 8q \\Rightarrow q = P/8$. With $n$ firms, $Q^S = nP/8$. Set it equal to $2600 - 20P$.'),
        plan('Part (d): what happens in the long run?', 'Positive profit attracts entry until $P = \\min LRAC$ again; $Q$ from the new demand at that price; $n = Q/q^*$', [
          ['The price stays at the short-run level: demand is higher now', 'Higher price means profit, which pulls in firms. Entry shifts supply right until profit is zero.'],
          ['Each firm keeps making its short-run output', 'In the long run each firm returns to the bottom of LRAC, $q^* = 5$. The extra output comes from more firms.'],
          ['Firms exit, so the price rises further', 'Firms are earning profit, so they enter, not exit.'],
        ], 'With constant input prices, long-run supply is flat at min LRAC. New $Q = 2600 - 20(40)$, $n = Q/5$.'),
      ],
      parts: [
        N('q^*', 5), N('P_{LR}', 40), N('Q', 1200), N('n', 240),
        N('P_{SR}', 52), N('Q_{SR}', 1560), N('q_{SR}', 6.5), N('\\pi_{SR}', 69),
        N('P\\text{ (new long run)}', 40), N('Q\\text{ (new long run)}', 1800), N('n\\text{ (new long run)}', 360),
        FIX('(d) Why does the price return to \\$40?', ['profit draws in identical entrants at constant input prices until $P = \\min LRAC$', 'the government caps the price at \\$40', 'demand falls back to its old level'], 0,
          [null, 'Nothing in the problem caps the price; entry does the work.', 'Demand stays at $2600 - 20P$; the market moves along it.']),
      ],
      hints: ['$8q = 4q + 100/q \\Rightarrow 4q^2 = 100$.', 'Short run: $Q^S = 240 \\cdot P/8 = 30P$.'],
      figs: { lr: { svg: EC.graph({
        w: 340, h: 270, x: [0, 2300], y: [0, 80], xl: 'Q', yl: 'P', xt: [[1200, '1200'], [1800, '1800']], yt: [40, 52],
        items: [
          { f: (Q) => 100 - Q / 20, from: 400, to: 2000, cls: 'c4', lab: 'D', labX: 1950, dx: 2, dy: -4, anchor: 'bl' },
          { f: (Q) => 130 - Q / 20, from: 1000, to: 2300, cls: 'c4 dash', lab: "D'", labX: 2250, dx: 0, dy: -6, anchor: 'br' },
          { f: (Q) => Q / 30, from: 0, to: 2300, cls: 'c5', lab: 'S_{240}', labX: 2200, dx: -4, dy: -2, anchor: 'r' },
          { f: (Q) => Q / 45, from: 0, to: 2300, cls: 'c5 dash', lab: 'S_{360}', labX: 2300, dx: -2, dy: 12, anchor: 'tr' },
          { seg: [[0, 40], [2300, 40]], cls: 'curve c3', lab: 'LRS', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
          { pt: [1200, 40], lab: 'A', at: 'tl', guide: 'x' }, { pt: [1560, 52], lab: 'B', at: 'tl', guide: 'y' }, { pt: [1800, 40], lab: 'C', at: 'br', guide: 'x' },
        ],
      }), cap: 'A: the old long-run equilibrium. B: demand jumps, 240 firms move up their MC curves (price 52, profit). C: entry shifts short-run supply right until the price is back at min LRAC = 40 with 360 firms. Long-run supply (green) is flat.' } },
      sol: md`
        **Move 1 (a): bottom of LRAC.**
        $$LRAC = \frac{4q^2 + 100}{q} = 4q + \frac{100}{q}, \qquad LRMC = 8q$$
        $$8q = 4q + \frac{100}{q} \;\Rightarrow\; 4q = \frac{100}{q} \;\Rightarrow\; q^2 = 25 \;\Rightarrow\; q^* = 5$$
        $P = LRAC(5) = 20 + 20 = 40$ (and $LRMC(5) = 40$ ✓).

        **Move 2 (b): demand at that price, then count firms.** $Q = 2000 - 20(40) = 1200$. $n = Q/q^* = 1200/5 = 240$.

        **Move 3 (c): short run, $n = 240$ fixed.** One firm: $P = MC = 8q \Rightarrow q = P/8$ (AVC $= 4q$ has minimum 0, so no shutdown issue). Market: $Q^S = 240 \cdot P/8 = 30P$. Check: at $P = 40$, $30(40) = 1200$ ✓.
        $$30P = 2600 - 20P \;\Rightarrow\; 50P = 2600 \;\Rightarrow\; P_{SR} = 52$$
        $Q_{SR} = 30(52) = 1560$, $q_{SR} = 52/8 = 6.5$ (and $1560/240 = 6.5$ ✓).
        $$\pi_{SR} = 52(6.5) - [4(6.5)^2 + 100] = 338 - (169 + 100) = 69$$

        **Move 4 (d): entry.** Profit of \$69 per firm attracts identical entrants. Each entrant shifts short-run supply right and pushes the price down. Entry stops when profit is zero: $P = \min LRAC = 40$. With constant input prices the bottom of LRAC does not move, so long-run supply is flat at \$40.
        $$Q = 2600 - 20(40) = 1800, \qquad n = \frac{1800}{5} = 360$$
        So 120 firms enter.

        [[fig:lr]]

        **Short run versus long run.** Short run: price jumps (40 to 52), quantity rises a little (1200 to 1560), each firm works harder (6.5 units). Long run: price back to 40, quantity rises a lot (to 1800), each firm back to 5 units; all the extra output comes from new firms.
      `,
    }),
    R(md`
      ### Q5. A per-unit tax (16 points)

      Market demand is $Q^D = 120 - 2P$ and market supply is $Q^S = 4P - 60$. The government collects a tax of \$6 per unit from sellers.
    `),
    P({ src: 'Q5 · 16 pts', title: 'Tax: prices, incidence, welfare',
      q: md`(a) Find the equilibrium price and quantity with no tax. (b) Find the consumer price, producer price and quantity with the tax. (c) Find the tax revenue and the share of the tax borne by consumers and by producers. (d) Fill in a welfare table (CS, PS, tax revenue, total welfare before and after) and find the deadweight loss. Shade the areas. (e) Briefly: why do consumers bear more of this tax? (f) Briefly: what would change if the law made buyers pay the tax instead?`,
      plan: [
        plan('Part (b): how do you find the prices with the tax?', 'Demand at $P_c = P_p + 6$ equals supply at $P_p$: $120 - 2(P_p + 6) = 4P_p - 60$', [
          ['Add the tax to the old price: $P_c = 36$', 'That assumes buyers absorb the whole tax. Quantity falls and sellers absorb part of it, so $P_c$ rises by less than 6.'],
          ['Shift demand **up** by 6', 'The tax drives a wedge: seen from sellers, demand shifts **down** by 6 (or supply shifts up by 6).'],
          ['Set $Q^D(P) = Q^S(P) - 6$', 'That subtracts 6 **units**. The tax is 6 **dollars** between the two prices.'],
        ], 'Solve for $P_p$, then $P_c = P_p + 6$, then $Q = Q^S(P_p)$ (check with $Q^D(P_c)$).'),
        plan('Part (c): how do you measure each side’s share?', 'From the pre-tax price: consumers $(P_c - P)/t$, producers $(P - P_p)/t$', [
          ['Whoever the law makes pay bears it all', 'Legal liability does not decide who bears a tax; the prices adjust.'],
          ['Always half each', 'Only when demand and supply respond equally. Here they do not.'],
          ['Compare $P_c$ with $P_p$', 'That gap is always the whole tax, $t$. Each share is measured from the old price.'],
        ], 'Revenue $= tQ$ at the new quantity. Shares use $P = 30$.'),
        plan('Part (d): how do you get the welfare change?', 'Before/after table: CS above $P_c$, PS below $P_p$, both over the new $Q$; add revenue; $\\Delta W = -\\text{DWL} = -\\tfrac12 t\\,\\Delta Q$', [
          ['The DWL equals the tax revenue', 'Revenue is a transfer to the government: it is counted in $W$. The loss is only the triangle of trades that no longer happen.'],
          ['Compute CS at the producer price', 'Buyers pay $P_c$; their surplus sits above $P_c$.'],
          ['$\\Delta W = \\Delta CS + \\Delta PS$, leave out $G$', 'Tax revenue is part of total welfare: $W = CS + PS + G$.'],
        ], 'Find the demand choke price (60) and the supply intercept (15) for the triangles.'),
        plan('Parts (e) and (f): what decides who bears more of a tax?', 'Relative elasticities: the less elastic side bears more; legal liability changes nothing', [
          ['Who the law makes pay', 'Same equilibrium either way: the side that sends the check passes part of it on through the price.'],
          ['Which side has more people', 'Numbers of buyers and sellers are already inside the curves; what matters is how strongly each side responds to price.'],
          ['The side with the higher intercept', 'Intercepts locate the curves. Incidence depends on their slopes (elasticities) at the equilibrium.'],
        ], 'At $(Q, P) = (60, 30)$: $\\varepsilon_D = -2(30/60) = -1$ and $\\varepsilon_S = 4(30/60) = 2$. Buyers are less responsive.'),
      ],
      parts: [
        N('P^*', 30), N('Q^*', 60),
        N('P_c', 34), N('P_p', 28), N('Q_t', 52),
        N('\\text{revenue}', 312), N('\\text{consumer share}', 2 / 3), N('\\text{producer share}', 1 / 3),
        N('CS\\text{ before}', 900), N('CS\\text{ after}', 676), N('PS\\text{ before}', 450), N('PS\\text{ after}', 338),
        N('W\\text{ after}', 1326), N('\\text{DWL}', 24),
        FIX('(e) Consumers bear more because…', ['demand is less elastic than supply at the equilibrium', 'the tax is collected from sellers', 'demand has the higher intercept'], 0,
          [null, 'Collected from sellers, yet buyers bear two thirds: legal liability is not the reason.', 'Intercepts do not decide incidence; responsiveness does.']),
        FIX('(f) If buyers legally paid the tax…', ['nothing changes: $P_c = 34$, $P_p = 28$, $Q = 52$', 'consumers would bear all \\$6', 'producers would bear all \\$6'], 0,
          [null, 'The wedge is the same \\$6 between the same two curves, so the same prices solve it.', 'Sellers would lower their price because fewer units sell; the burden is shared the same way.']),
      ],
      hints: ['$120 - 2P_p - 12 = 4P_p - 60 \\Rightarrow 168 = 6P_p$.', 'Choke price: $Q^D = 0$ at $P = 60$. Supply intercept: $Q^S = 0$ at $P = 15$.'],
      figs: { tax: { svg: EC.graph({
        w: 330, h: 270, x: [0, 72], y: [0, 66], xl: 'Q', yl: 'P', xt: [52, 60], yt: [15, 28, 34, 60],
        items: [
          { poly: [[0, 60], [0, 34], [52, 34]], cls: 'cs' },
          { poly: [[0, 34], [52, 34], [52, 28], [0, 28]], cls: 'ex' },
          { poly: [[0, 28], [52, 28], [0, 15]], cls: 'gain' },
          { poly: [[52, 34], [52, 28], [60, 30]], cls: 'loss' },
          { f: (Q) => 60 - Q / 2, from: 0, to: 72, cls: 'c4', lab: 'D', labX: 70, dx: 0, dy: -6, anchor: 'b' },
          { f: (Q) => 15 + Q / 4, from: 0, to: 72, cls: 'c5', lab: 'S', labX: 70, dx: 0, dy: -6, anchor: 'b' },
          { pt: [52, 34], guide: 'x' }, { pt: [52, 28] }, { pt: [60, 30], lab: 'E', at: 'r', guide: 'x' },
          { text: [12, 40], t: 'CS' }, { text: [22, 31], t: 'G' }, { text: [12, 24], t: 'PS' }, { text: [62, 36], t: '\\text{DWL}' },
        ],
      }), cap: 'Blue: CS = 676. Gray: tax revenue $6 \\times 52 = 312$. Green: PS = 338. Red: DWL = $\\tfrac12(6)(8) = 24$, trades between 52 and 60 that no longer happen.' } },
      sol: md`
        **Move 1 (a): supply = demand.** $120 - 2P = 4P - 60 \Rightarrow 180 = 6P \Rightarrow P^* = 30$, $Q^* = 120 - 60 = 60$.

        **Move 2 (b): the wedge.** Sellers keep $P_p$; buyers pay $P_c = P_p + 6$.
        $$120 - 2(P_p + 6) = 4P_p - 60 \;\Rightarrow\; 108 - 2P_p = 4P_p - 60 \;\Rightarrow\; 168 = 6P_p \;\Rightarrow\; P_p = 28$$
        $P_c = 28 + 6 = 34$. $Q = 4(28) - 60 = 52$; check $120 - 2(34) = 52$ ✓.

        **Move 3 (c): revenue and incidence.** $G = (P_c - P_p)Q = 6 \times 52 = 312$.
        $$\text{consumers: } \frac{34 - 30}{6} = \frac{4}{6} \approx 66.7\%, \qquad \text{producers: } \frac{30 - 28}{6} = \frac{2}{6} \approx 33.3\%$$

        **Move 4 (d): the welfare table.** Demand hits $Q = 0$ at $P = 60$; supply starts at $P = 15$.

        | | Before | After | Change |
        |---|---|---|---|
        | CS | $\tfrac12(60)(60 - 30) = 900$ | $\tfrac12(52)(60 - 34) = 676$ | $-224$ |
        | PS | $\tfrac12(60)(30 - 15) = 450$ | $\tfrac12(52)(28 - 15) = 338$ | $-112$ |
        | G | 0 | 312 | $+312$ |
        | W | 1350 | 1326 | $-24$ |

        DWL $= \tfrac12 \times t \times \Delta Q = \tfrac12(6)(60 - 52) = 24$, matching the drop in $W$ ✓. Of the \$336 that buyers and sellers lose, \$312 goes to the government (a transfer); only \$24 vanishes.

        [[fig:tax]]

        **Move 5 (e): elasticities.** At the old equilibrium $\varepsilon_D = \dfrac{dQ}{dP}\dfrac{P}{Q} = -2\cdot\dfrac{30}{60} = -1$ and $\varepsilon_S = 4\cdot\dfrac{30}{60} = 2$. Sellers respond twice as strongly to price, so they can "walk away" more easily; buyers, who respond less, end up with the bigger share (\$4 of the \$6).

        **Move 6 (f): legal liability.** If buyers paid the tax, supply at $P_p$ would still have to equal demand at $P_p + 6$: the same equation, the same answer. Who sends the check does not change who bears the tax.
      `,
    }),

    R(md`
      ### Q6. Monopoly (16 points)

      A monopolist faces inverse demand $P = 120 - 2Q$ and has cost $C(Q) = 300 + Q^2$.
    `),
    P({ src: 'Q6 · 16 pts', title: 'Monopoly: price, welfare, Lerner',
      q: md`(a) Write total revenue and marginal revenue. Briefly explain why MR is below the price. (b) Find the profit-maximizing quantity, price and profit. (c) Find the efficient (perfectly competitive, $P = MC$) quantity and price. (d) At the monopoly outcome find CS, PS and the deadweight loss; label and shade them. (e) Find the Lerner index and the price elasticity of demand at the monopoly point. Is demand elastic there?`,
      plan: [
        plan('Parts (a) and (b): how does the monopolist pick its quantity and price?', '$MR = MC$ with $MR = 120 - 4Q$ (twice the slope); then read the price off **demand**', [
          ['$P = MC$', 'That is the competitive (efficient) benchmark of part (c). A monopolist knows selling more lowers its price, so it stops where $MR = MC$.'],
          ['$MR = MC$, and the price is $MR$ at that $Q$', 'MR is not a price anyone pays. Buyers pay what demand says they will pay for that quantity.'],
          ['$MR = 0$ (maximize revenue)', 'That ignores cost. With MC > 0 the monopolist stops before revenue peaks.'],
        ], '$TR = 120Q - 2Q^2$, $MR = 120 - 4Q$, $MC = 2Q$. Solve $MR = MC$, then $P = 120 - 2Q$.'),
        plan('Part (c): what is the efficient benchmark?', 'Demand meets MC: $120 - 2Q = 2Q$', [
          ['$MR = MC$ again', 'That is the monopoly quantity, the one that is too low.'],
          ['$P = AC$', 'That is a zero-profit (regulation) rule, not the efficient one.'],
          ['The bottom of AC', 'The efficient quantity is where the value of the last unit (demand) equals its cost (MC).'],
        ], 'Solve $120 - 2Q = 2Q$, then read $P$ off demand.'),
        plan('Part (d): how do you find PS at the monopoly outcome?', 'Area above MC and below $P = 80$ over the 20 units sold, or $TR - VC$', [
          ['PS equals profit, 900', 'PS ignores the fixed cost: $PS = \\pi + F$.'],
          ['Area below MR and above MC', 'Producers are paid the price, 80, not MR.'],
          ['The triangle between demand and MC from 20 to 30', 'That is the deadweight loss: surplus nobody gets.'],
        ], 'PS: a trapezoid with parallel sides $80 - 0$ and $80 - 40$ over width 20. CS: a triangle above 80. DWL: the triangle from $Q = 20$ to $30$.'),
        plan('Part (e): what do you plug in?', '$L = (P - MC)/P$ with $MC = 2(20) = 40$; $\\varepsilon = \\frac{dQ}{dP}\\frac{P}{Q}$ with $\\frac{dQ}{dP} = -\\frac12$', [
          ['$\\frac{dQ}{dP} = -2$', 'That is $dP/dQ$, the slope of inverse demand. Flip it: $Q = 60 - P/2$, so $dQ/dP = -1/2$.'],
          ['$MC = 2$ in the Lerner index', '$MC = 2Q$ depends on $Q$; at $Q = 20$ it is 40.'],
          ['$L = (P - AC)/P$', 'That is a profit margin. The Lerner index is the markup over **marginal** cost.'],
        ], 'Check: $L = -1/\\varepsilon_p$ at the untaxed optimum.'),
      ],
      parts: [
        X('TR(Q)', '120*Q - 2*Q^2', { Q: [1, 40] }), X('MR(Q)', '120 - 4*Q', { Q: [1, 40] }),
        FIX('(a) MR is below the price because…', ['to sell one more unit the monopolist must cut the price on every unit it sells', 'the monopolist pays a tax on each unit', 'marginal cost is rising'], 0,
          [null, 'There is no tax here; MR < P comes from the downward-sloping demand alone.', 'MR comes from demand only; costs play no part in it.']),
        N('Q_m', 20), N('P_m', 80), N('\\pi', 900),
        N('Q_{\\text{eff}}', 30), N('P_{\\text{eff}}', 60),
        N('CS', 400), N('PS', 1200), N('\\text{DWL}', 200),
        N('L', 0.5), N('\\varepsilon_p', -2),
        FIX('(e) Demand at the monopoly point is…', ['elastic', 'unit elastic', 'inelastic'], 0,
          [null, 'Unit elastic would mean $MR = 0$, but $MR = MC = 40 > 0$.', 'On the inelastic part MR is negative; no monopolist with MC > 0 stops there.']),
      ],
      hints: ['$120 - 4Q = 2Q \\Rightarrow Q = 20$.', 'PS $= TR - VC = 80(20) - 20^2$.'],
      figs: { mono: { svg: EC.graph({
        w: 330, h: 270, x: [0, 64], y: [0, 125], xl: 'Q', yl: 'P', xt: [20, 30], yt: [40, 60, 80, 120],
        items: [
          { poly: [[0, 120], [0, 80], [20, 80]], cls: 'cs' },
          { poly: [[0, 80], [20, 80], [20, 40], [0, 0]], cls: 'gain' },
          { poly: [[20, 80], [20, 40], [30, 60]], cls: 'loss' },
          { f: (Q) => 120 - 2 * Q, from: 0, to: 60, cls: 'c4', lab: 'D', labX: 56, dx: 4, dy: -2, anchor: 'l' },
          { f: (Q) => 120 - 4 * Q, from: 0, to: 30, cls: 'c2 dash', lab: 'MR', labX: 29, dx: 4, dy: 0, anchor: 'l' },
          { f: (Q) => 2 * Q, from: 0, to: 60, cls: 'c5', lab: 'MC', labX: 58, dx: -4, dy: 0, anchor: 'r' },
          { pt: [20, 80], lab: '(20, 80)', at: 'tr', guide: true }, { pt: [20, 40], guide: 'y' }, { pt: [30, 60], guide: true },
          { text: [6, 92], t: 'CS' }, { text: [9, 52], t: 'PS' }, { text: [23.5, 60], t: '\\text{DWL}' },
        ],
      }), cap: 'Monopoly at $Q = 20$, $P = 80$. Blue: CS = 400. Green: PS = 1200 (above MC, below the price). Red: DWL = 200, the units from 20 to 30 worth more than their MC that are never made.' } },
      sol: md`
        **Move 1 (a): TR and MR.** $TR = P(Q)\,Q = (120 - 2Q)Q = 120Q - 2Q^2$, so
        $$MR = \frac{dTR}{dQ} = 120 - 4Q$$
        Same intercept as demand, twice the slope. Why below price: $MR = P + Q\dfrac{dP}{dQ} = P - 2Q$. Selling one more unit brings in its price $P$, but the price on **all** $Q$ units must drop by 2 to sell it. That second term is the gap.

        **Move 2 (b): $MR = MC$, then demand.** $MC = \dfrac{dC}{dQ} = 2Q$.
        $$120 - 4Q = 2Q \;\Rightarrow\; 6Q = 120 \;\Rightarrow\; Q_m = 20, \qquad P_m = 120 - 2(20) = 80$$
        $$\pi = TR - TC = 80(20) - (300 + 400) = 1600 - 700 = 900$$

        **Move 3 (c): efficient benchmark, $P = MC$.**
        $$120 - 2Q = 2Q \;\Rightarrow\; Q_{\text{eff}} = 30, \qquad P_{\text{eff}} = 120 - 60 = 60$$

        **Move 4 (d): areas.** At $Q = 20$, $MC = 40$.
        $$CS = \tfrac12(20)(120 - 80) = 400$$
        $$PS = \tfrac12\big[(80 - 0) + (80 - 40)\big](20) = \tfrac12(120)(20) = 1200 \quad (\text{or } TR - VC = 1600 - 400)$$
        $$\text{DWL} = \tfrac12(30 - 20)(80 - 40) = \tfrac12(10)(40) = 200$$
        Check: competitive $W = \tfrac12(30)(60) + \tfrac12(30)(60) = 1800$; monopoly $W = 400 + 1200 = 1600$; difference 200 ✓.

        [[fig:mono]]

        **Move 5 (e): Lerner and elasticity.**
        $$L = \frac{P - MC}{P} = \frac{80 - 40}{80} = 0.5$$
        Demand as $Q = 60 - P/2$, so $dQ/dP = -1/2$:
        $$\varepsilon_p = -\frac12 \cdot \frac{80}{20} = -2$$
        Check: $-1/\varepsilon_p = 1/2 = L$ ✓. $|\varepsilon_p| = 2 > 1$: **elastic**, as it must be when $MR = MC > 0$.
      `,
    }),
    R(md`
      ### After you finish

      Score yourself: Q1 is 4 points each; give each written part equal weight within its 16 points. Then go back to the lesson behind your weakest question: [input choice](#/l/m3-pr2), [shutdown and profit](#/l/m3-sr2), [long-run equilibrium](#/l/m3-lr2), [taxes](#/l/m3-po1), [monopoly welfare](#/l/m3-mo3).
    `),
  ];

  // ================================================================== exam B
  const xb = [
    intro('Practice exam B', 'economic profit, input-price changes and returns to scale; piecewise market supply with a trapezoid PS; under- and overproduction in a welfare table; a binding ceiling and floor; a specific tax on a monopoly.'),
    R(md`### Q1. Multiple choice (20 points)`),
    Q(md`**(a)** A farm earns exactly zero economic profit. Its explicit costs are \$200,000, and its only implicit cost is the \$50,000 the owner could earn working elsewhere. Its accounting profit is…`,
      ['\\$50,000', '\\$0', '−\\$50,000', '\\$250,000'], 0,
      [null, 'Accounting profit ignores the implicit cost, so it is larger than economic profit by exactly that cost.', 'Accounting profit is never below economic profit: it subtracts fewer costs.', 'That is the revenue: $200{,}000 + 50{,}000$.'],
      md`Zero economic profit: revenue $= 200{,}000 + 50{,}000 = 250{,}000$. Accounting profit $= 250{,}000 - 200{,}000 = 50{,}000$: exactly what the owner's time is worth elsewhere.`, { src: 'Q1a · 4 pts' }),
    Q(md`**(b)** A competitive firm has fixed cost \$400 and producer surplus \$1,000 at its chosen output. Its economic profit is…`,
      ['\\$600', '\\$1,400', '\\$1,000', '−\\$400'], 0,
      [null, 'Profit subtracts the fixed cost from PS; it does not add it.', 'PS equals profit only when the fixed cost is zero.', 'That is the profit from shutting down, not from producing.'],
      md`$PS = TR - VC$ and $\pi = TR - VC - F = PS - F = 1000 - 400 = 600$.`, { src: 'Q1b · 4 pts' }),
    Q(md`**(c)** An industry has identical firms, free entry and exit, and constant input prices. Its long-run market supply curve is…`,
      ['horizontal at the minimum of LRAC', 'the horizontal sum of the current firms’ MC curves', 'vertical at the current market quantity', 'downward sloping'], 0,
      [null, 'That is short-run supply, with the number of firms fixed. In the long run firms enter and exit.', 'Quantity can grow without limit through entry.', 'With constant input prices, entry does not lower costs.'],
      md`Any price above min LRAC brings entry, any price below brings exit, so the long-run price can only be min LRAC. Identical firms make every entrant's cost the same; constant input prices keep min LRAC from moving as the industry grows.`, { src: 'Q1c · 4 pts' }),
    Q(md`**(d)** A monopolist faces inverse demand $P = 90 - 3Q$. Its marginal revenue is…`,
      ['$MR = 90 - 6Q$', '$MR = 90 - 3Q$', '$MR = 45 - 3Q$', '$MR = 90 - 1.5Q$'], 0,
      [null, 'That is demand itself. MR lies below demand.', 'MR keeps the same intercept, 90; only the slope doubles.', 'The slope doubles, it does not halve.'],
      md`$TR = 90Q - 3Q^2$, so $MR = 90 - 6Q$: same intercept, twice the slope.`, { src: 'Q1d · 4 pts' }),
    Q(md`**(e)** Which of these is **not** a barrier to entry that can protect a monopoly?`,
      ['any firm can buy the same inputs at the same prices', 'a patent on the product', 'a fixed cost so large that average cost falls over the whole market', 'a government license granted to one firm'], 0,
      [null, 'A patent legally bars others from making the product.', 'That is a natural monopoly: one firm can serve the market more cheaply than two.', 'A license makes entry illegal for everyone else.'],
      md`Barriers are what stop entrants: legal ones (patents, licenses), cost advantages (natural monopoly), control of a key input. Equal access to inputs is the opposite: it is part of what makes free entry work.`, { src: 'Q1e · 4 pts' }),

    R(md`
      ### Q2. Profit, inputs and scale (16 points)

      Maya quit a job paying \$55,000 a year to run a food truck. Last year the truck brought in \$180,000. She paid \$110,000 in explicit costs (food, fuel, permits, the truck lease). She also put \$50,000 of her own savings into the business, money that could have earned 6% a year in a bank.

      Each day the truck's output is $q = 4x_1^{1/2}x_2^{1/4}$ meals, where $x_1$ is labor hours and $x_2$ is grill capacity, fixed in the short run at $\bar x_2 = 16$. A meal sells for $p = \$10$, labor costs $w_1 = \$10$ an hour, and capacity costs $w_2 = \$5$ per unit per day.
    `),
    P({ src: 'Q2 · 16 pts', title: 'Food truck: two profits, a wage rise, scale',
      q: md`(a) Find Maya's accounting profit and economic profit for the year. (b) Briefly: should she keep the truck? (c) Find $MP_1$. (d) Find the daily profit-maximizing labor, output and profit. (e) The wage rises to \$16. Find the new labor, output and profit, and the new slope of the isoprofit lines. (f) What returns to scale does $q = 4x_1^{1/2}x_2^{1/4}$ have? (g) Briefly: is the profit-maximizing bundle also the cheapest way to make that output?`,
      plan: [
        plan('Parts (a) and (b): which costs go into each profit?', 'Accounting: explicit costs only. Economic: also the implicit costs, the forgone \\$55,000 and the forgone 6% return on her savings', [
          ['Economic profit also subtracts the whole \\$50,000 of savings', 'The savings are not used up: she still owns them. The cost is what they could have earned, $0.06 \\times 50{,}000$.'],
          ['Both profits subtract only the explicit costs', 'Then they would be equal. Economic profit counts what she gave up, too.'],
          ['Accounting profit subtracts the forgone salary', 'The salary was never paid out, so the books never show it. It is an implicit cost.'],
        ], 'Accounting $= 180{,}000 - 110{,}000$. Economic $=$ accounting $- 55{,}000 - 3{,}000$. Keep the truck if economic profit $\\ge 0$.'),
        plan('Parts (c) and (d): how much labor per day?', '$p\\,MP_1 = w_1$, with $MP_1 = \\partial q/\\partial x_1$ at $x_2 = 16$', [
          ['$MP_1 = w_1$', 'Meals and dollars do not compare. Value the extra meals at the price: $p\\,MP_1$.'],
          ['$MP_1/MP_2 = w_1/w_2$', 'That balances two inputs the firm can both choose. Capacity is fixed today.'],
          ['$P = AC$', 'That is the zero-profit condition, not the profit-maximizing one.'],
        ], '$x_2^{1/4} = 16^{1/4} = 2$, so $q = 8\\sqrt{x_1}$ and $MP_1 = 4/\\sqrt{x_1}$. Solve $10 \\cdot 4/\\sqrt{x_1} = 10$.'),
        plan('Part (e): the wage rises from \\$10 to \\$16. What happens?', 'Redo $p\\,MP_1 = w_1$ with $w_1 = 16$; the isoprofit slope $w_1/p$ rises to 1.6, so the best line touches further left: less labor', [
          ['Same labor; profit falls by the extra wage bill', 'The extra hour now costs more than it brings in at the old $x_1$, so she cuts hours.'],
          ['The isoprofit lines get flatter', 'Flatter needs $w_1/p$ to fall. A higher wage raises it.'],
          ['Output rises to cover the higher cost', 'A price taker cannot pass the cost on; the extra hours are now worth less than they cost, so output falls.'],
        ], '$40/\\sqrt{x_1} = 16 \\Rightarrow \\sqrt{x_1} = 2.5$. Then $q = 8\\sqrt{x_1}$, $\\pi = 10q - 16x_1 - 80$.'),
        plan('Parts (f) and (g): what decides returns to scale, and how does profit maximization relate to cost minimization?', 'Add the exponents ($\\tfrac12 + \\tfrac14 < 1$: decreasing); a profit-maximizing plan must make its output at least cost', [
          ['The 4 in front: bigger than 1 means increasing returns', 'The constant scales output at every size equally; it never affects returns to scale.'],
          ['The largest exponent decides it', 'Double **both** inputs: output is multiplied by $2^{1/2 + 1/4}$. The sum is what matters.'],
          ['Profit maximization and cost minimization can pick different bundles for the same output', 'If a cheaper bundle made the same output, using it would raise profit, so the first plan was not profit-maximizing.'],
        ], '$2^{3/4} \\approx 1.68 < 2$: doubling inputs less than doubles output.'),
      ],
      parts: [
        N('\\text{accounting profit}', 70000), N('\\text{economic profit}', 12000),
        FIX('(b) Should she keep the truck?', ['yes: it beats her next-best option by \\$12,000 a year', 'no: accounting profit is less than her old salary plus her savings', 'yes, because accounting profit is positive'], 0,
          [null, 'Compare with what the savings **earn** (\\$3,000), not the savings themselves. Economic profit already makes the right comparison, and it is positive.', 'Positive accounting profit is not enough: it ignores the \\$58,000 of implicit cost. The right reason is that **economic** profit is positive.']),
        X('MP_1', '4*x1^(-0.5)', { x1: [1, 25] }),
        N('x_1^*', 16), N('q^*', 32), N('\\pi^*', 80),
        N('x_1^*\\ (w_1 = 16)', 6.25), N('q^*\\ (w_1 = 16)', 20), N('\\pi^*\\ (w_1 = 16)', 20), N('\\text{isoprofit slope}\\ (w_1 = 16)', 1.6),
        FIX('(f) Returns to scale', ['decreasing', 'constant', 'increasing'], 0,
          [null, 'Constant needs the exponents to sum to 1; here $3/4$.', 'Increasing needs a sum above 1.']),
        FIX('(g) Is the profit-maximizing bundle cost-minimizing for its output?', ['yes: a cheaper bundle for the same output would give more profit', 'no: profit maximization ignores costs', 'only with constant returns to scale'], 0,
          [null, 'Profit is revenue **minus** cost; it cannot ignore cost.', 'The argument works for any technology.']),
      ],
      hints: ['$16^{1/4} = 2$.', '$MP_1 = 4 \\cdot \\tfrac12 x_1^{-1/2} \\cdot 2 = 4x_1^{-1/2}$.'],
      sol: md`
        **Move 1 (a): two profits.**
        $$\text{accounting} = 180{,}000 - 110{,}000 = 70{,}000$$
        Implicit costs: the forgone salary, \$55,000, and the forgone return on savings, $0.06 \times 50{,}000 = 3{,}000$.
        $$\text{economic} = 70{,}000 - 55{,}000 - 3{,}000 = 12{,}000$$

        **Move 2 (b): interpret.** Economic profit already compares the truck with her best alternative. It is positive: she earns \$12,000 a year more than she would at her old job with her money in the bank. Keep it.

        **Move 3 (c): short-run production function and $MP_1$.** $16^{1/4} = 2$, so $q = 4x_1^{1/2}(2) = 8\sqrt{x_1}$.
        $$MP_1 = \frac{\partial q}{\partial x_1} = 4 \cdot \tfrac12 x_1^{-1/2} \cdot 2 = \frac{4}{\sqrt{x_1}}$$

        **Move 4 (d): $p\,MP_1 = w_1$.**
        $$10 \cdot \frac{4}{\sqrt{x_1}} = 10 \;\Rightarrow\; \sqrt{x_1} = 4 \;\Rightarrow\; x_1^* = 16, \qquad q^* = 8(4) = 32$$
        $$\pi^* = 10(32) - 10(16) - 5(16) = 320 - 160 - 80 = 80$$

        **Move 5 (e): higher wage.**
        $$10 \cdot \frac{4}{\sqrt{x_1}} = 16 \;\Rightarrow\; \sqrt{x_1} = \frac{40}{16} = 2.5 \;\Rightarrow\; x_1^* = 6.25, \qquad q^* = 8(2.5) = 20$$
        $$\pi^* = 10(20) - 16(6.25) - 80 = 200 - 100 - 80 = 20$$
        Isoprofit slope $w_1/p$: from $10/10 = 1$ to $16/10 = 1.6$. Steeper lines touch the production function where it is steeper, at a smaller $x_1$: fewer hours, fewer meals.

        **Move 6 (f): returns to scale.** Double both inputs: $4(2x_1)^{1/2}(2x_2)^{1/4} = 2^{3/4}\cdot q \approx 1.68q$. Output less than doubles: **decreasing** returns ($\tfrac12 + \tfrac14 = \tfrac34 < 1$).

        **Move 7 (g): profit max implies cost min.** Suppose some cheaper bundle also made 32 meals. Same revenue, lower cost, more profit: so the plan with $x_1 = 16$ could not have been the profit maximum. A profit-maximizing firm always makes its output at the lowest possible cost.
      `,
    }),
    R(md`
      ### Q3. Market supply with two kinds of firms (16 points)

      A competitive market has 20 type-A firms, each with short-run cost $C_A(q) = 50 + 2q + \tfrac12 q^2$, and 10 type-B firms, each with $C_B(q) = 30 + 8q + q^2$. Market demand is $Q = 340 - 10P$.
    `),
    P({ src: 'Q3 · 16 pts', title: 'Two firm types: a kinked supply curve',
      q: md`(a) Find each type's direct supply curve and the price below which it supplies nothing. (b) Find market supply on each price range and the market quantity at the kink. Graph it. (c) Find the equilibrium price, market quantity, and output of each type-A and each type-B firm. (d) Find the market producer surplus at the equilibrium. (e) Demand falls to $Q = 140 - 10P$. Find the new price and quantity, and say what type-B firms do.`,
      plan: [
        plan('Part (a): what is each firm’s supply curve?', 'The rising part of $MC$ above min AVC: set $P = MC$ and solve for $q$', [
          ['Set $P = AC$', '$P = AC$ is the break-even point, not the best output at each price.'],
          ['Set $P = AVC$', 'AVC tells you **where supply starts** (its minimum), not how much is supplied at each price.'],
          ['Set $MR = MC$ with MR below the price', 'These are price takers: $MR = P$.'],
        ], 'A: $MC = 2 + q$, $AVC = 2 + q/2$ (min 2). B: $MC = 8 + 2q$, $AVC = 8 + q$ (min 8). Invert $P = MC$.'),
        plan('Part (b): how do you build market supply?', 'At each price, multiply each type’s $q$ by its number of firms and add; below \\$8 only type A sells', [
          ['Add the two inverse supplies', 'That adds prices. Market supply adds **quantities** at one price.'],
          ['Multiply one firm’s supply by 30', 'The two types have different costs, so they supply different amounts. Count each type separately.'],
          ['Use one formula for every price', 'Type B sells nothing below \\$8, so the formula changes there: market supply is piecewise.'],
        ], '$2 \\le P < 8$: $Q = 20(P - 2)$. $P \\ge 8$: $Q = 20(P - 2) + 10\\cdot\\frac{P - 8}{2}$. Kink: $Q$ at $P = 8$.'),
        plan('Part (c): which piece do you set equal to demand?', 'Try the upper piece (both types sell), then check that the price is at least \\$8', [
          ['Always the lower piece', 'Demand is high here; the lower piece would give a price above 8, where B also sells.'],
          ['Set demand equal to one firm’s supply', 'Demand is the whole market. Use the market supply.'],
          ['Solve with both pieces and average', 'At any price only one piece is the real supply. Pick the one whose range contains the answer.'],
        ], '$25P - 80 = 340 - 10P$. Then $q_A = P - 2$, $q_B = (P - 8)/2$.'),
        plan('Part (d): how do you get market PS?', 'Area left of market supply and below $P = 12$: a triangle up to the kink plus a trapezoid above it (or add each firm’s PS)', [
          ['One triangle: $\\tfrac12(220)(12 - 2)$', 'Supply bends at the kink, so the region is not one triangle. That formula overstates PS.'],
          ['Industry profit', 'PS ignores fixed costs: profit is PS minus the fixed costs.'],
          ['The area between demand and supply', 'That is total welfare, $CS + PS$.'],
        ], 'Below the kink: $\\tfrac12(120)(8 - 2)$. From 8 to 12: $\\tfrac12(120 + 220)(12 - 8)$.'),
        plan('Part (e): demand falls. What changes in the method?', 'Try the upper piece; if the price comes out below \\$8, redo it on the lower piece (only type A sells)', [
          ['Keep the upper-piece answer', 'The upper piece assumes B sells, which it does not below \\$8. That answer is not on the real supply curve.'],
          ['Type B firms sell their old output', 'Below min AVC = 8 each B firm would lose more than its fixed cost by producing. It shuts down.'],
          ['Type B firms exit the industry', 'They shut down for now (short run). Exit is a long-run decision about LRAC.'],
        ], '$25P - 80 = 140 - 10P$ gives $P \\approx 6.29 < 8$: wrong piece. Use $20P - 40 = 140 - 10P$.'),
      ],
      parts: [
        X('q_A(P)\\ (P \\ge 2)', 'P - 2', { P: [3, 20] }), X('q_B(P)\\ (P \\ge 8)', '(P - 8)/2', { P: [9, 20] }),
        X('Q^S\\ (2 \\le P < 8)', '20*P - 40', { P: [2, 8] }), X('Q^S\\ (P \\ge 8)', '25*P - 80', { P: [8, 20] }), N('Q_{\\text{kink}}', 120),
        N('P^*', 12), N('Q^*', 220), N('q_A', 10), N('q_B', 2),
        N('PS', 1040),
        N('P\\text{ (low demand)}', 6), N('Q\\text{ (low demand)}', 80),
        FIX('(e) At the low demand, each type-B firm…', ['shuts down: \\$6 is below its min AVC of \\$8', 'keeps producing 2 units', 'produces where $P = AC$'], 0,
          [null, 'At \\$6 every unit costs at least \\$8 in variable cost; producing loses more than shutting down.', 'There is no $q$ with $P = AC$ here, and $P = AC$ is never the output rule.']),
      ],
      hints: ['A: $P = 2 + q$. B: $P = 8 + 2q$.', 'Above \\$8: $Q = 20P - 40 + 5P - 40 = 25P - 80$.'],
      figs: { kink: { svg: EC.graph({
        w: 340, h: 270, x: [0, 310], y: [0, 36], xl: 'Q', yl: 'P', xt: [80, 120, 220], yt: [2, 6, 8, 12],
        items: [
          { poly: [[0, 2], [120, 8], [220, 12], [0, 12]], cls: 'gain' },
          { pts: [[0, 2], [120, 8], [300, 15.2]], cls: 'curve c5', lab: 'S', labI: 2, dx: 4, dy: -4, anchor: 'bl' },
          { f: (Q) => 34 - Q / 10, from: 0, to: 300, cls: 'c4', lab: 'D', labX: 290, dx: 0, dy: -6, anchor: 'b' },
          { f: (Q) => 14 - Q / 10, from: 0, to: 140, cls: 'c4 dash', lab: "D'", labX: 135, dx: 4, dy: -4, anchor: 'bl' },
          { pt: [120, 8], lab: '\\text{kink}', at: 'br' }, { pt: [220, 12], guide: true }, { pt: [80, 6], guide: true },
          { text: [70, 10.2], t: 'PS' },
        ],
      }), cap: 'Market supply (red) is only type A up to the kink at (120, 8), then flatter as type B joins. Green: PS = 1040 at $P = 12$. With the low demand $D\'$ the market lands on the lower piece at $P = 6$.' } },
      sol: md`
        **Move 1 (a): firm supply from $P = MC$.**
        Type A: $MC = 2 + q$, $AVC = 2 + \tfrac12 q$, min AVC $= 2$. $P = 2 + q \Rightarrow q_A = P - 2$ for $P \ge 2$.
        Type B: $MC = 8 + 2q$, $AVC = 8 + q$, min AVC $= 8$. $P = 8 + 2q \Rightarrow q_B = \dfrac{P - 8}{2}$ for $P \ge 8$.

        **Move 2 (b): add quantities, range by range.**

        - $P < 2$: nobody sells, $Q = 0$.
        - $2 \le P < 8$: only A. $Q = 20(P - 2) = 20P - 40$.
        - $P \ge 8$: both. $Q = 20P - 40 + 10\cdot\dfrac{P - 8}{2} = 20P - 40 + 5P - 40 = 25P - 80$.

        Kink at $P = 8$: $Q = 20(8) - 40 = 120$. Inverse form: $P = 2 + Q/20$ below the kink, $P = (Q + 80)/25$ above it.

        **Move 3 (c): equilibrium on the upper piece.**
        $$25P - 80 = 340 - 10P \;\Rightarrow\; 35P = 420 \;\Rightarrow\; P^* = 12$$
        $12 \ge 8$, so B really is selling ✓. $Q^* = 340 - 120 = 220$. Each A firm: $q_A = 12 - 2 = 10$. Each B firm: $q_B = (12 - 8)/2 = 2$. Check: $20(10) + 10(2) = 220$ ✓.

        **Move 4 (d): PS, a triangle plus a trapezoid.**
        $$\underbrace{\tfrac12(120)(8 - 2)}_{\text{up to the kink}} + \underbrace{\tfrac12(120 + 220)(12 - 8)}_{\text{trapezoid}} = 360 + 680 = 1040$$
        Check firm by firm: each A firm $\tfrac12(10)(12 - 2) = 50$, times 20 is 1000; each B firm $\tfrac12(2)(12 - 8) = 4$, times 10 is 40. Total 1040 ✓.

        [[fig:kink]]

        **Move 5 (e): low demand.** Upper piece: $25P - 80 = 140 - 10P \Rightarrow P = 220/35 \approx 6.29$, below 8, so B would not be selling: wrong piece. Lower piece:
        $$20P - 40 = 140 - 10P \;\Rightarrow\; 30P = 180 \;\Rightarrow\; P = 6, \qquad Q = 140 - 60 = 80$$
        Each A firm makes $6 - 2 = 4$ ($20 \times 4 = 80$ ✓). Type-B firms **shut down**: \$6 is below their min AVC of \$8, so producing would lose more than their fixed cost of \$30.
      `,
    }),
    R(md`
      ### Q4. Surplus, efficiency and deadweight loss (16 points)

      In a competitive market, inverse demand is $P = 100 - Q$ and inverse supply (the sum of the firms' MC curves) is $P = 20 + Q$. Together the firms have fixed costs of \$300.
    `),
    P({ src: 'Q4 · 16 pts', title: 'Too little, too much: welfare tables',
      q: md`(a) Find the equilibrium price and quantity, CS, PS and total welfare. (b) Find the industry's economic profit and explain why it differs from PS. (c) A quota limits sales to 30 units. Find the price buyers pay, CS, PS, total welfare and the DWL; shade them. (d) Briefly: which part of the change is a transfer and which is a loss? (e) Instead, a program forces 50 units to be produced and sold. Find total welfare and the DWL, and explain the loss.`,
      plan: [
        plan('Parts (a) and (b): what are CS, PS and profit here?', 'CS and PS are triangles from the equilibrium to the demand intercept (100) and the supply intercept (20); profit $= PS - $ fixed costs', [
          ['PS equals profit', 'PS is revenue minus **variable** cost. The \\$300 fixed cost still has to come out.'],
          ['PS is total revenue, $60 \\times 40$', 'Revenue includes the variable cost of making the goods. PS is only the part above supply.'],
          ['Profit $= PS + 300$', 'Fixed cost lowers profit; it is subtracted.'],
        ], '$100 - Q = 20 + Q \\Rightarrow Q = 40$, $P = 60$. CS $= \\tfrac12(40)(100 - 60)$, PS $= \\tfrac12(40)(60 - 20)$.'),
        plan('Part (c): with only 30 units allowed, what price do buyers pay, and what shape is PS?', 'Buyers pay the **demand** price at 30 ($P = 70$); PS is a trapezoid above supply and below 70 over 30 units', [
          ['The supply price at 30, \\$50', 'With only 30 units for sale, buyers bid the price up to what the 30th buyer will pay: 70.'],
          ['The old price, \\$60', 'At \\$60 buyers want 40 units but only 30 exist. The price rises.'],
          ['PS is the triangle $\\tfrac12(30)(70 - 20)$', 'Supply has risen to 50 at $Q = 30$, so the right edge of the region has height $70 - 50 = 20$: a trapezoid.'],
        ], 'CS $= \\tfrac12(30)(100 - 70)$. PS $= \\tfrac12[(70 - 20) + (70 - 50)](30)$. DWL: the triangle from 30 to 40.'),
        plan('Part (d): transfer or loss?', 'The rectangle $(70 - 60)\\times 30$ moves from consumers to producers (a transfer); the triangle from 30 to 40 is lost by everyone (DWL)', [
          ['All of the CS decline is deadweight loss', 'Most of it is picked up by producers through the higher price. Only the triangle disappears.'],
          ['The producers’ gain is a loss to society', 'A transfer just moves surplus between people; total welfare counts both sides.'],
          ['There is no DWL because producers gain', 'Producers gain the rectangle but lose a triangle, and consumers lose a triangle too. Ten units that were worth more than they cost are not traded.'],
        ], '$\\Delta CS = -300 - 50$, $\\Delta PS = +300 - 50$. The rectangle cancels in $W$; the two small triangles add up to the DWL.'),
        plan('Part (e): 50 units are forced. How do you find total welfare?', 'W = area between demand and supply from 0 to 50, where units 41–50 count **negative** (they cost more than they are worth)', [
          ['More output always raises welfare', 'Past 40, each unit costs more (its MC) than any buyer will pay. Making it destroys surplus.'],
          ['Same as the competitive equilibrium: the market still clears', 'Buyers take 50 units only at a price of 50, below the MC of the last units.'],
          ['DWL is the triangle from 30 to 40 again', 'That is underproduction. Overproduction loses the triangle on the **other** side of 40.'],
        ], 'W $= 1600 - \\tfrac12(50 - 40)(70 - 50)$: the triangle between supply (above) and demand (below) from 40 to 50.'),
      ],
      parts: [
        N('P^*', 60), N('Q^*', 40), N('CS', 800), N('PS', 800), N('W', 1600),
        N('\\pi_{\\text{industry}}', 500),
        N('P\\text{ (quota)}', 70), N('CS\\text{ (quota)}', 450), N('PS\\text{ (quota)}', 1050), N('W\\text{ (quota)}', 1500), N('\\text{DWL (quota)}', 100),
        FIX('(d) The \\$300 rectangle $(70 - 60)\\times 30$ is…', ['a transfer from consumers to producers', 'part of the deadweight loss', 'a gain to society'], 0,
          [null, 'It leaves CS and appears in PS: nobody loses it overall.', 'It is gained by producers exactly as much as it is lost by consumers: welfare does not change.']),
        N('W\\ (Q = 50)', 1500), N('\\text{DWL}\\ (Q = 50)', 100),
      ],
      hints: ['Quota PS trapezoid: parallel sides $70 - 20 = 50$ and $70 - 50 = 20$, width 30.', 'Overproduction DWL: base $50 - 40$, height $MC(50) - P^D(50) = 70 - 50$.'],
      figs: {
        quota: { svg: EC.graph({
          w: 320, h: 260, x: [0, 82], y: [0, 105], xl: 'Q', yl: 'P', xt: [30, 40], yt: [20, 50, 60, 70, 100],
          items: [
            { poly: [[0, 100], [0, 70], [30, 70]], cls: 'cs' },
            { poly: [[0, 70], [30, 70], [30, 50], [0, 20]], cls: 'gain' },
            { poly: [[30, 70], [30, 50], [40, 60]], cls: 'loss' },
            { f: (Q) => 100 - Q, from: 0, to: 80, cls: 'c4', lab: 'D', labX: 78, dx: 2, dy: -4, anchor: 'bl' },
            { f: (Q) => 20 + Q, from: 0, to: 80, cls: 'c5', lab: 'S', labX: 78, dx: -4, dy: 0, anchor: 'r' },
            { seg: [[30, 0], [30, 100]], cls: 'curve dim dash', lab: '\\text{quota}', at: 1, dx: 4, dy: 10, anchor: 'tl' },
            { pt: [30, 70], guide: 'y' }, { pt: [30, 50], guide: 'y' }, { pt: [40, 60], guide: true },
            { text: [8, 79], t: 'CS' }, { text: [11, 55], t: 'PS' }, { text: [44, 64], t: '\\text{DWL}' },
          ],
        }), cap: 'Quota of 30: buyers pay 70. Blue: CS = 450. Green: PS = 1050, a trapezoid. Red: DWL = 100, the 10 units between 30 and 40 that were worth more than they cost.' },
        over: { svg: EC.graph({
          w: 320, h: 250, x: [0, 82], y: [0, 105], xl: 'Q', yl: 'P', xt: [40, 50], yt: [50, 60, 70],
          items: [
            { poly: [[40, 60], [50, 70], [50, 50]], cls: 'loss' },
            { f: (Q) => 100 - Q, from: 0, to: 80, cls: 'c4', lab: 'D', labX: 78, dx: 2, dy: -4, anchor: 'bl' },
            { f: (Q) => 20 + Q, from: 0, to: 80, cls: 'c5', lab: 'S = MC', labX: 72, dx: -4, dy: -4, anchor: 'br' },
            { pt: [40, 60], guide: true }, { pt: [50, 70], guide: 'y' }, { pt: [50, 50], guide: true },
            { text: [57, 60], t: '\\text{DWL}' },
          ],
        }), cap: 'Forcing 50 units: units 41 to 50 cost between 60 and 70 to make but are worth only 60 down to 50 to buyers. The red triangle, $\\tfrac12(10)(20) = 100$, is surplus destroyed.' },
      },
      sol: md`
        **Move 1 (a): equilibrium and triangles.** $100 - Q = 20 + Q \Rightarrow Q^* = 40$, $P^* = 60$.
        $$CS = \tfrac12(40)(100 - 60) = 800, \qquad PS = \tfrac12(40)(60 - 20) = 800, \qquad W = 1600$$

        **Move 2 (b): profit = PS − fixed cost.** $\pi = 800 - 300 = 500$. PS is revenue minus **variable** cost (the area under MC); the fixed cost is not under the MC curve, so PS overstates profit by exactly \$300.

        **Move 3 (c): quota of 30.** Buyers pay the demand price: $P = 100 - 30 = 70$. The supply price at 30 is $20 + 30 = 50$.
        $$CS = \tfrac12(30)(100 - 70) = 450$$
        $$PS = \tfrac12\big[(70 - 20) + (70 - 50)\big](30) = \tfrac12(70)(30) = 1050$$
        $$\text{DWL} = \tfrac12(40 - 30)(70 - 50) = 100$$

        | | Before | Quota | Change |
        |---|---|---|---|
        | CS | 800 | 450 | $-350$ |
        | PS | 800 | 1050 | $+250$ |
        | W | 1600 | 1500 | $-100$ |

        [[fig:quota]]

        **Move 4 (d): split the changes.** The rectangle $(70 - 60)(30) = 300$: consumers pay \$10 more on each of the 30 units, and producers get it. That is a **transfer**. What is left: consumers also lose the triangle $\tfrac12(10)(70 - 60) = 50$ and producers lose $\tfrac12(10)(60 - 50) = 50$. So $\Delta CS = -300 - 50 = -350$, $\Delta PS = +300 - 50 = +250$, and the two triangles, $50 + 50 = 100$, are the **deadweight loss**.

        **Move 5 (e): overproduction.** Total welfare is total value (area under demand) minus total variable cost (area under supply) for the units made. Up to 40 each unit adds surplus; from 40 to 50 each unit **subtracts**, because MC is above what buyers value it at.
        $$\text{DWL} = \tfrac12(50 - 40)(70 - 50) = 100, \qquad W = 1600 - 100 = 1500$$
        Check directly: value $= \int_0^{50}(100 - Q)\,dQ = 5000 - 1250 = 3750$; cost $= \int_0^{50}(20 + Q)\,dQ = 1000 + 1250 = 2250$; $W = 3750 - 2250 = 1500$ ✓.

        [[fig:over]]
      `,
    }),

    R(md`
      ### Q5. A price ceiling and a price floor (16 points)

      Market demand is $Q^D = 240 - 4P$ and market supply is $Q^S = 2P - 30$.
    `),
    P({ src: 'Q5 · 16 pts', title: 'Ceiling at \\$40, floor at \\$50',
      q: md`(a) Find the equilibrium price and quantity, CS, PS and total welfare. (b) The government sets a price ceiling of \$40. Find quantity demanded, quantity supplied, the shortage, CS, PS and the DWL (assume the units go to the buyers who value them most). Shade the areas. (c) Instead, a price floor of \$50 (with no government purchases). Find the excess supply, the quantity traded, CS, PS and the DWL. (d) Briefly: what would a ceiling of \$50 do?`,
      plan: [
        plan('Part (a): which shapes and corners?', 'Equilibrium from $Q^D = Q^S$; CS and PS are triangles up to the demand choke price (60) and down to the supply intercept (15)', [
          ['Use $P = 0$ as the bottom of PS', 'Supply starts at $P = 15$ (where $Q^S = 0$); no unit is sold below that.'],
          ['Use the slopes 4 and 2 as heights', 'Heights are price gaps on the vertical axis: choke price minus $P^*$, $P^*$ minus supply intercept.'],
          ['Read CS and PS off the direct curves without inverting', 'You need prices as functions of quantity for the triangle corners: $P = 60 - Q/4$ and $P = 15 + Q/2$.'],
        ], '$240 - 4P = 2P - 30 \\Rightarrow P^* = 45$, $Q^* = 60$.'),
        plan('Part (b): the ceiling is \\$40. How much is traded, and what is CS?', 'Traded $= Q^S(40) = 50$ (sellers are the short side); CS is a trapezoid under demand above 40 over those 50 units', [
          ['Traded $= Q^D(40) = 80$', 'Buyers want 80, but sellers make only 50 at \\$40. No one can buy what is not made.'],
          ['CS $= \\tfrac12(50)(60 - 40)$', 'Demand is not flat: at $Q = 50$ the demand price is 47.5, so the region has a right edge of height 7.5. It is a trapezoid.'],
          ['Traded stays at 60', 'A binding ceiling cuts output: sellers move down their supply curve.'],
        ], 'Demand price at 50: $60 - 50/4 = 47.5$. CS $= \\tfrac12[(60 - 40) + (47.5 - 40)](50)$. DWL: triangle from 50 to 60.'),
        plan('Part (c): the floor is \\$50, no government buying. How much is traded, and what is PS?', 'Traded $= Q^D(50) = 40$ (buyers are the short side); PS is a trapezoid above supply below 50 over those 40 units', [
          ['Traded $= Q^S(50) = 70$', 'Sellers would like to sell 70, but buyers take only 40. With no government purchases the extra 30 go unsold.'],
          ['The government buys the 30 extra units', 'That is a price **support**. An ordinary floor has no buyer for the excess.'],
          ['PS $= \\tfrac12(70)(50 - 15)$', 'Only 40 units are sold. And at $Q = 40$ the supply price is 35, so the region is a trapezoid.'],
        ], 'Supply price at 40: $15 + 40/2 = 35$. PS $= \\tfrac12[(50 - 15) + (50 - 35)](40)$. DWL: triangle from 40 to 60.'),
        plan('Part (d): a ceiling of \\$50?', 'Nothing: a ceiling only binds below the equilibrium price (45)', [
          ['It lowers the price to \\$50', 'The price is already 45, below the ceiling. The ceiling never comes into play.'],
          ['It creates a surplus', 'Surpluses come from binding floors, not ceilings.'],
          ['It creates a shortage of 30', 'That happened at a ceiling of 40. At 50 the market price is legal.'],
        ], 'Compare the ceiling with $P^* = 45$. Above it: not binding.'),
      ],
      parts: [
        N('P^*', 45), N('Q^*', 60), N('CS', 450), N('PS', 900), N('W', 1350),
        N('Q^D\\ (40)', 80), N('Q^S\\ (40)', 50), N('\\text{shortage}', 30), N('CS\\text{ (ceiling)}', 687.5), N('PS\\text{ (ceiling)}', 625), N('\\text{DWL (ceiling)}', 37.5),
        N('\\text{excess supply}', 30), N('Q\\text{ traded (floor)}', 40), N('CS\\text{ (floor)}', 200), N('PS\\text{ (floor)}', 1000), N('\\text{DWL (floor)}', 150),
        FIX('(d) A ceiling of \\$50 would…', ['change nothing: it is above the equilibrium price', 'lower the price to \\$50', 'create a shortage'], 0,
          [null, 'The price is 45; a ceiling of 50 does not force anything.', 'At 45 the market clears; nothing stops it.']),
      ],
      hints: ['Inverse curves: $P = 60 - Q/4$ and $P = 15 + Q/2$.', 'Ceiling DWL: base $60 - 50$, height $47.5 - 40$.'],
      figs: { ceil: { svg: EC.graph({
        w: 330, h: 260, x: [0, 92], y: [0, 64], xl: 'Q', yl: 'P', xt: [50, 60, 80], yt: [15, 40, 45, 60],
        items: [
          { poly: [[0, 60], [0, 40], [50, 40], [50, 47.5]], cls: 'cs' },
          { poly: [[0, 40], [50, 40], [0, 15]], cls: 'gain' },
          { poly: [[50, 47.5], [50, 40], [60, 45]], cls: 'loss' },
          { f: (Q) => 60 - Q / 4, from: 0, to: 92, cls: 'c4', lab: 'D', labX: 90, dx: 0, dy: -6, anchor: 'b' },
          { f: (Q) => 15 + Q / 2, from: 0, to: 92, cls: 'c5', lab: 'S', labX: 88, dx: -4, dy: 0, anchor: 'r' },
          { seg: [[0, 40], [92, 40]], cls: 'curve dim dash', lab: '\\bar P = 40', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
          { pt: [50, 40], guide: 'x' }, { pt: [80, 40], guide: 'x' }, { pt: [60, 45], guide: 'x' }, { pt: [50, 47.5] },
          { arrow: [[52, 35], [78, 35]] }, { text: [65, 31], t: '\\text{shortage}' },
          { text: [14, 46], t: 'CS' }, { text: [12, 34], t: 'PS' },
        ],
      }), cap: 'Ceiling at 40: only 50 units are made. Blue: CS = 687.5 (a trapezoid). Green: PS = 625. Red: DWL = 37.5. The shortage is $80 - 50 = 30$.' } },
      sol: md`
        **Move 1 (a): equilibrium and triangles.** $240 - 4P = 2P - 30 \Rightarrow 270 = 6P \Rightarrow P^* = 45$, $Q^* = 240 - 180 = 60$. Inverse demand $P = 60 - Q/4$ (choke price 60); inverse supply $P = 15 + Q/2$ (intercept 15).
        $$CS = \tfrac12(60)(60 - 45) = 450, \qquad PS = \tfrac12(60)(45 - 15) = 900, \qquad W = 1350$$

        **Move 2 (b): binding ceiling at 40** (below 45). $Q^D = 240 - 160 = 80$; $Q^S = 80 - 30 = 50$; shortage $= 80 - 50 = 30$. Traded: 50, the short side. At $Q = 50$ the demand price is $60 - 12.5 = 47.5$.
        $$CS = \tfrac12\big[(60 - 40) + (47.5 - 40)\big](50) = \tfrac12(27.5)(50) = 687.5$$
        $$PS = \tfrac12(50)(40 - 15) = 625$$
        $$\text{DWL} = \tfrac12(60 - 50)(47.5 - 40) = 37.5$$
        Check: $W = 687.5 + 625 = 1312.5 = 1350 - 37.5$ ✓. Consumers who get the good gain ($+237.5$); producers lose ($-275$).

        [[fig:ceil]]

        **Move 3 (c): binding floor at 50** (above 45). $Q^D = 240 - 200 = 40$; $Q^S = 100 - 30 = 70$; excess supply $= 30$. Traded: 40, the short side. At $Q = 40$ the supply price is $15 + 20 = 35$.
        $$CS = \tfrac12(40)(60 - 50) = 200$$
        $$PS = \tfrac12\big[(50 - 15) + (50 - 35)\big](40) = \tfrac12(50)(40) = 1000$$
        $$\text{DWL} = \tfrac12(60 - 40)(50 - 35) = 150$$
        Check: $W = 200 + 1000 = 1200 = 1350 - 150$ ✓.

        **Move 4 (d): a ceiling of 50.** The market price, 45, is already below 50, so the ceiling never binds: price 45, quantity 60, no shortage, no DWL.
      `,
    }),
    R(md`
      ### Q6. A specific tax on a monopoly (16 points)

      A monopolist faces inverse demand $P = 150 - Q$ and has cost $C(Q) = 30Q$. The government levies a tax of \$20 per unit, collected from the monopolist.
    `),
    P({ src: 'Q6 · 16 pts', title: 'Monopoly with a \\$20 per-unit tax',
      q: md`(a) Find the untaxed quantity, price and profit. (b) Write the monopolist's effective MR with the tax, and find the after-tax quantity, consumer price and producer price. (c) Find the tax revenue, the monopolist's profit, the consumers' share of the tax, and the pass-through $dP_c/dt$. (d) Find the deadweight loss of the untaxed monopoly, the total deadweight loss after the tax (both against the efficient outcome), and the extra DWL caused by the tax. Shade the after-tax areas. (e) Briefly: would anything change if consumers were legally required to pay the tax?`,
      plan: [
        plan('Part (a): the untaxed monopoly?', '$MR = MC$: $150 - 2Q = 30$, then the price from demand', [
          ['$P = MC$', 'That is the efficient (competitive) quantity, needed in part (d), not the monopoly choice.'],
          ['$MR = 0$', 'Maximizing revenue ignores the \\$30 cost of each unit.'],
          ['$MR = MC$, and the price is MR there', 'The price is what buyers pay for that quantity: read it off demand.'],
        ], '$Q = 60$, then $P = 150 - 60$, $\\pi = (P - 30)Q$.'),
        plan('Part (b): how does a \\$20 per-unit tax enter the monopolist’s choice?', 'It keeps $P - 20$ per unit, so effective MR is $MR - 20$: set $150 - 2Q - 20 = 30$, i.e. $MR = MC + t$', [
          ['Add the tax to the old price: $P_c = 110$', 'The monopolist chooses again. Raising the price by the full tax loses too many sales; it absorbs part of the tax.'],
          ['Subtract the tax from MC', 'The tax makes each unit **more** costly to sell, so it acts like a higher MC, not a lower one.'],
          ['Keep $Q = 60$; the tax only changes profit', 'A per-unit tax changes the margin on every unit, so the best quantity changes. (A lump-sum tax would not.)'],
        ], 'Effective demand $P_p = 130 - Q$, effective MR $= 130 - 2Q$. Set it equal to 30.'),
        plan('After you have $Q$: which curve gives the consumer price?', 'The **original** demand: $P_c = 150 - Q$; then $P_p = P_c - 20$', [
          ['The effective demand $130 - Q$', 'That gives what the firm keeps, $P_p$, not what buyers pay.'],
          ['$P_c = MC + t = 50$', 'That is where effective MR meets MC, not a price anyone pays. A monopolist prices off demand.'],
          ['$P_c = P_p$', 'The tax is a \\$20 wedge between them.'],
        ], '$P_c = 150 - 50$, $P_p = 100 - 20$. Revenue $= tQ$. Consumers’ share $= (P_c - P)/t$ with the untaxed $P = 90$.'),
        plan('Part (d): total after-tax DWL versus the extra DWL from the tax?', 'Total: the triangle between demand and MC from $Q = 50$ to the efficient $Q = 120$. Extra: total minus the untaxed monopoly’s DWL', [
          ['$\\tfrac12 \\times t \\times \\Delta Q = \\tfrac12(20)(10)$', 'That works in a competitive market, where demand and MC meet at the old quantity. Here there is already a monopoly markup above MC, so the lost units are worth much more than \\$20 above their cost.'],
          ['The tax revenue is lost too', 'Revenue goes to the government and counts in welfare: it is a transfer.'],
          ['Measure the total from the untaxed monopoly quantity, 60', 'That gives only the **extra** DWL. The total is measured from the efficient quantity, where $P = MC$.'],
        ], 'Efficient: $150 - Q = 30 \\Rightarrow Q = 120$. Total $= \\tfrac12(120 - 50)(100 - 30)$. Untaxed $= \\tfrac12(120 - 60)(90 - 30)$.'),
      ],
      parts: [
        N('Q_0', 60), N('P_0', 90), N('\\pi_0', 3600),
        X('\\text{effective }MR(Q)', '130 - 2*Q', { Q: [1, 60] }), N('Q_t', 50), N('P_c', 100), N('P_p', 80),
        N('\\text{tax revenue}', 1000), N('\\pi_t', 2500), N('\\text{consumer share}', 0.5), N('dP_c/dt', 0.5),
        N('\\text{DWL untaxed}', 1800), N('\\text{DWL total after tax}', 2450), N('\\text{extra DWL from the tax}', 650),
        FIX('(e) If consumers legally paid the tax…', ['nothing changes: same $Q$, $P_c$, $P_p$', 'consumers would bear all \\$20', 'the monopolist would bear all \\$20'], 0,
          [null, 'The monopolist would face demand net of the tax, $150 - Q - 20$, the same effective demand as before.', 'Who sends the check never decides incidence.']),
      ],
      hints: ['$130 - 2Q = 30 \\Rightarrow Q = 50$.', 'Extra DWL: a trapezoid from 50 to 60 with heights $100 - 30$ and $90 - 30$.'],
      figs: { mtax: { svg: EC.graph({
        w: 330, h: 270, x: [0, 135], y: [0, 155], xl: 'Q', yl: 'P', xt: [50, 60, 120], yt: [30, 50, 80, 100, 150],
        items: [
          { poly: [[0, 150], [0, 100], [50, 100]], cls: 'cs' },
          { poly: [[0, 100], [50, 100], [50, 80], [0, 80]], cls: 'ex' },
          { poly: [[0, 80], [50, 80], [50, 30], [0, 30]], cls: 'gain' },
          { poly: [[50, 100], [50, 30], [120, 30]], cls: 'loss' },
          { f: (Q) => 150 - Q, from: 0, to: 135, cls: 'c4', lab: 'D', labX: 128, dx: 2, dy: -6, anchor: 'bl' },
          { f: (Q) => 150 - 2 * Q, from: 0, to: 75, cls: 'c2 dash', lab: 'MR', labX: 72, dx: 4, dy: 0, anchor: 'l' },
          { seg: [[0, 30], [135, 30]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
          { seg: [[0, 50], [135, 50]], cls: 'curve c5 dash', lab: 'MC + t', at: 'end', dx: -2, dy: -4, anchor: 'br' },
          { pt: [50, 100], guide: 'x' }, { pt: [50, 80] }, { pt: [50, 50] }, { pt: [120, 30], guide: 'x' },
          { text: [12, 112], t: 'CS' }, { text: [22, 90], t: 'G' }, { text: [22, 55], t: '\\pi' }, { text: [70, 50], t: '\\text{DWL}' },
        ],
      }), cap: 'After the tax: $MR = MC + t$ at $Q = 50$; buyers pay 100, the firm keeps 80. Blue: CS = 1250. Gray: tax revenue 1000. Green: profit 2500. Red: total DWL = 2450, from 50 to the efficient 120.' } },
      sol: md`
        **Move 1 (a): untaxed.** $MR = 150 - 2Q$, $MC = 30$.
        $$150 - 2Q = 30 \;\Rightarrow\; Q_0 = 60, \qquad P_0 = 150 - 60 = 90, \qquad \pi_0 = (90 - 30)(60) = 3600$$

        **Move 2 (b): effective demand and MR.** For each unit the firm keeps $P - 20$:
        $$P_p = (150 - Q) - 20 = 130 - Q, \qquad \text{effective } MR = 130 - 2Q$$
        $$130 - 2Q = 30 \;\Rightarrow\; Q_t = 50$$
        **Move 3: prices.** Buyers pay off the original demand: $P_c = 150 - 50 = 100$. The firm keeps $P_p = 100 - 20 = 80$.

        **Move 4 (c): revenue, profit, incidence, pass-through.**
        $$G = 20 \times 50 = 1000, \qquad \pi_t = (80 - 30)(50) = 2500$$
        Consumers' share $= (100 - 90)/20 = 0.5$; producer's share $= (90 - 80)/20 = 0.5$. In general $Q_t = (150 - 30 - t)/2$ and $P_c = 150 - Q_t = 90 + t/2$, so
        $$\frac{dP_c}{dt} = \frac12$$
        Linear demand with constant MC: half of any tax increase shows up in the consumer price.

        **Move 5 (d): DWL against the efficient outcome.** Efficient: $P = MC \Rightarrow 150 - Q = 30 \Rightarrow Q = 120$.
        $$\text{untaxed: } \tfrac12(120 - 60)(90 - 30) = 1800, \qquad \text{after tax: } \tfrac12(120 - 50)(100 - 30) = 2450$$
        Extra DWL from the tax $= 2450 - 1800 = 650$ (the trapezoid from 50 to 60: $\tfrac12(70 + 60)(10) = 650$ ✓).

        | | Untaxed | Taxed | Change |
        |---|---|---|---|
        | CS | $\tfrac12(60)(60) = 1800$ | $\tfrac12(50)(50) = 1250$ | $-550$ |
        | PS (= profit, no fixed cost) | 3600 | 2500 | $-1100$ |
        | G | 0 | 1000 | $+1000$ |
        | W | 5400 | 4750 | $-650$ |

        Efficient $W = \tfrac12(120)(150 - 30) = 7200$; $7200 - 5400 = 1800$ and $7200 - 4750 = 2450$ ✓.

        [[fig:mtax]]

        **Move 6 (e): legal liability.** If buyers paid the \$20, the monopolist would face demand net of the tax, $P = 150 - Q - 20$: the same effective demand. Same $Q$, same $P_c$ and $P_p$. Who writes the check does not decide who bears the tax.
      `,
    }),
    R(md`
      ### After you finish

      Score yourself, then revisit the weakest area: [economic profit and scale](#/l/m3-pr4), [market supply](#/l/m3-sr3), [welfare and DWL](#/l/m3-lr5), [ceilings](#/l/m3-po3) and [floors](#/l/m3-po4), [the specific tax on a monopoly](#/l/m3-mt1).
    `),
  ];

  // ================================================================== exam C
  const xc = [
    intro('Practice exam C', 'identical firms losing money in the short run and the exit that follows; a price support compared with an ordinary floor; market power from a revenue table and from constant-elasticity demand (pass-through above 100%); an ad valorem tax on a monopoly compared with a specific tax; regulating a natural monopoly at $P = MC$ and $P = AC$.'),
    R(md`### Q1. Multiple choice (20 points)`),
    Q(md`**(a)** Demand for a drug is perfectly inelastic (vertical). The government collects a \$2 per-unit tax from sellers. The price consumers pay rises by…`,
      ['\\$2', '\\$1', '\\$0', 'it depends on who is legally liable'], 0,
      [null, 'An even split needs buyers and sellers to respond equally. Here buyers do not respond at all.', 'Sellers could absorb the tax only if buyers would walk away from a higher price; they will not.', 'Legal liability never decides incidence.'],
      md`The side that cannot respond bears the tax. With vertical demand the quantity does not change, so $P_c$ rises by the full \$2 and $P_p$ stays put.`, { src: 'Q1a · 4 pts' }),
    Q(md`**(b)** At its best output a competitive firm has revenue \$5,000, variable cost \$4,000 and fixed cost \$1,500. In the short run it should…`,
      ['keep producing: it loses \\$500 instead of \\$1,500', 'shut down: it is losing money', 'raise its price until it breaks even', 'keep producing: it earns a profit of \\$1,000'], 0,
      [null, 'Shutting down still costs the \\$1,500 fixed cost. Producing loses only \\$500.', 'A price taker cannot raise its price; buyers would go elsewhere.', '\\$1,000 is producer surplus. Profit subtracts the fixed cost: $1000 - 1500 = -500$.'],
      md`$PS = 5000 - 4000 = 1000 > 0$ means revenue covers variable cost, so produce. $\pi = PS - F = -500$, better than $-1500$.`, { src: 'Q1b · 4 pts' }),
    Q(md`**(c)** At a monopolist's current output, $MR = \$12$ and $MC = \$15$. To raise profit it should…`,
      ['produce less, which raises its price', 'produce more', 'keep the same output and raise its price', 'produce where $P = MC$'], 0,
      [null, 'The last unit brought in \\$12 and cost \\$15: more units lose even more.', 'Demand fixes the price for each quantity; a higher price means selling fewer units.', 'That is the efficient (competitive) rule, not the profit-maximizing one.'],
      md`Cutting one unit saves \$15 of cost and loses only \$12 of revenue: profit rises by \$3. Keep cutting until $MR = MC$; with fewer units, demand allows a higher price.`, { src: 'Q1c · 4 pts' }),
    Q(md`**(d)** A monopolist faces constant-elasticity demand with $\varepsilon_p = -4$ and has $MC = \$30$. Its price is…`,
      ['\\$40', '\\$120', '\\$37.50', '\\$30'], 0,
      [null, 'That multiplies MC by $e$. The markup factor is $e/(e - 1) = 4/3$.', 'That is $MC(1 + 1/4)$. Solve $P(1 - 1/4) = 30$ instead.', 'Pricing at MC is the competitive outcome; a monopolist marks up.'],
      md`$MR = P(1 + 1/\varepsilon_p) = P(1 - \tfrac14) = 0.75P = 30 \Rightarrow P = 40$. Check: $L = (40 - 30)/40 = 0.25 = -1/\varepsilon_p$ ✓.`, { src: 'Q1d · 4 pts' }),
    Q(md`**(e)** Which policy is aimed at **preventing** monopoly power rather than regulating the price of an existing monopoly?`,
      ['blocking a merger between the two largest firms in a market', 'a price ceiling set at average cost', 'a per-unit tax on the monopolist', 'granting a patent to the first inventor'], 0,
      [null, 'That regulates the price of a monopoly that already exists.', 'A tax on a monopolist raises its price and cuts output further; it does nothing about market power.', 'A patent **creates** a temporary monopoly.'],
      md`Antitrust policy (blocking mergers, breaking up cartels, removing entry barriers) keeps markets competitive. Price ceilings at $P = MC$ or $P = AC$ regulate a monopoly that is already there.`, { src: 'Q1e · 4 pts' }),

    R(md`
      ### Q2. Short-run losses and long-run exit (16 points)

      A competitive market has 50 identical firms, each with cost $C(q) = 100 + 4q + q^2$. Market demand is $Q = 900 - 25P$. In the long run each firm's cost is the same, but the 100 can be avoided by leaving the industry; firms are free to enter and exit, and input prices do not change.
    `),
    P({ src: 'Q2 · 16 pts', title: 'Fifty firms losing money',
      q: md`(a) Find one firm's direct supply curve and its shutdown price. (b) Find market supply, in direct and inverse form. (c) Find the short-run equilibrium price, market quantity, output per firm, profit per firm and producer surplus per firm. Should the firms operate? Shade one firm's loss. (d) Find the long-run equilibrium price, output per firm, market quantity and number of firms. (e) Briefly explain how the market gets from (c) to (d).`,
      plan: [
        plan('Parts (a) and (b): what do you build first?', 'One firm’s supply from $P = MC = 4 + 2q$ above min AVC; then multiply by 50 firms', [
          ['Set demand equal to one firm’s MC', 'Demand is for the whole market. Add up the 50 firms first.'],
          ['Set $P = \\min AC$', 'That is the long-run price, part (d). In the short run the 50 firms are stuck and the price comes from supply = demand.'],
          ['Divide one firm’s supply by 50', 'Market supply is 50 firms’ worth of output at each price: multiply.'],
        ], '$P = 4 + 2q \\Rightarrow q = (P - 4)/2$ for $P \\ge 4$ ($AVC = 4 + q$, min 4). $Q = 50q = 25P - 100$.'),
        plan('Part (c): the firms lose money. Should they operate?', 'Yes, if $P \\ge \\min AVC$: the loss is then smaller than the fixed cost', [
          ['No: any loss means shut down', 'In the short run the \\$100 is paid either way. Shutting down loses all of it.'],
          ['No: the price is below min AC', 'That decides profit or loss, not operate or shut down.'],
          ['Yes, because they will make a profit next period', 'The reason is today’s comparison: the loss from producing is smaller than the loss from shutting down.'],
        ], 'Find $P$ from $25P - 100 = 900 - 25P$, then $q = (P - 4)/2$, $\\pi = Pq - C(q)$, $PS = Pq - VC(q)$.'),
        plan('Parts (d) and (e): what happens in the long run?', 'Losses drive exit until $P = \\min AC$; each firm makes the $q$ at the bottom of AC; $Q$ from demand; $n = Q/q$', [
          ['Nothing: demand did not change, so the price stays', 'Exit shifts the market supply curve left, which raises the price.'],
          ['Every firm leaves, because every firm is losing money', 'As firms leave the price rises. Exit stops once the remaining firms break even.'],
          ['The price falls further as firms leave', 'Fewer firms means less supply at each price, so the price rises.'],
        ], 'Min AC: $4 + 2q = 100/q + 4 + q \\Rightarrow q = 10$, $P = 24$. $Q = 900 - 25(24)$, $n = Q/10$.'),
      ],
      parts: [
        X('q(P)\\ (P \\ge 4)', '(P - 4)/2', { P: [5, 30] }), N('P_{\\text{shutdown}}', 4),
        X('Q^S(P)', '25*P - 100', { P: [5, 30] }), X('P(Q)\\text{ (inverse supply)}', '4 + Q/25', { Q: [10, 500] }),
        N('P_{SR}', 20), N('Q_{SR}', 400), N('q_{SR}', 8), N('\\pi_{SR}', -36), N('PS_{SR}', 64),
        FIX('(c) Should the firms operate?', ['yes: each loses \\$36, less than the \\$100 fixed cost', 'no: they are losing money', 'no: the price is below AC'], 0,
          [null, 'Shutting down would lose \\$100 each; producing loses \\$36.', 'Below AC means a loss either way; the shutdown test is min AVC = 4.']),
        N('P_{LR}', 24), N('q_{LR}', 10), N('Q_{LR}', 300), N('n_{LR}', 30),
        FIX('(e) How does the market get there?', ['losing firms exit, market supply shifts left, and the price rises until it reaches min AC', 'demand rises until firms break even', 'the remaining firms cut output until the price rises'], 0,
          [null, 'Nothing in the story moves demand; the market moves along it.', 'Each remaining firm actually makes **more** (10 instead of 8). The price rises because there are fewer firms.']),
      ],
      hints: ['$25P - 100 = 900 - 25P \\Rightarrow P = 20$.', 'Min AC: $q = 100/q$.'],
      figs: { closs: { svg: EC.graph({
        w: 330, h: 260, x: [0, 16], y: [0, 48], xl: 'q', yl: '\\$', xt: [8, 10], yt: [4, 20, 24],
        items: [
          { poly: [[0, 0], [8, 0], [8, 20], [0, 20]], cls: 'ex' },
          { poly: [[0, 20], [8, 20], [8, 24.5], [0, 24.5]], cls: 'loss' },
          { seg: [[0, 20], [16, 20]], cls: 'curve c3', lab: 'P = 20', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
          { f: (q) => 4 + 2 * q, from: 0, to: 16, cls: 'c5', lab: 'MC', labX: 15.5, dx: -6, dy: 0, anchor: 'r' },
          { f: (q) => 4 + q, from: 0, to: 16, cls: 'c2 dash', lab: 'AVC', labX: 16, dx: -2, dy: 10, anchor: 'tr' },
          { f: (q) => 100 / q + 4 + q, from: 2.5, to: 16, lab: 'AC', labX: 16, dx: -2, dy: -6, anchor: 'br' },
          { pt: [8, 20], guide: 'x' }, { pt: [8, 24.5] }, { pt: [10, 24], guide: true },
          { text: [4, 10], t: 'TR = 160' }, { text: [4, 28], t: '\\text{loss} = 36' },
        ],
      }), cap: 'One firm at $P = 20$: it makes 8 units where $P = MC$. Gray: revenue 160. Red: the loss $(24.5 - 20)\\times 8 = 36$, smaller than the fixed cost of 100. The bottom of AC, (10, 24), is where the long run ends up.' } },
      sol: md`
        **Move 1 (a): one firm's supply.** $MC = 4 + 2q$, $AVC = \dfrac{4q + q^2}{q} = 4 + q$, smallest at $q \to 0$: min AVC $= 4$ (the shutdown price).
        $$P = 4 + 2q \;\Rightarrow\; q = \frac{P - 4}{2} \quad (P \ge 4)$$

        **Move 2 (b): 50 copies, added sideways.** $Q^S = 50\cdot\dfrac{P - 4}{2} = 25P - 100$. Inverse: $P = 4 + \dfrac{Q}{25}$.

        **Move 3 (c): short-run equilibrium.**
        $$25P - 100 = 900 - 25P \;\Rightarrow\; 50P = 1000 \;\Rightarrow\; P_{SR} = 20$$
        $Q_{SR} = 25(20) - 100 = 400$; $q_{SR} = 400/50 = 8$ (and $(20 - 4)/2 = 8$ ✓).
        $$\pi = 20(8) - (100 + 32 + 64) = 160 - 196 = -36, \qquad PS = 160 - (32 + 64) = 64$$
        Check: $\pi = PS - F = 64 - 100 = -36$ ✓. $AC(8) = 196/8 = 24.5 > 20$: a loss. But $20 > \min AVC = 4$: operate. Shutting down loses 100; producing loses 36.

        [[fig:closs]]

        **Move 4 (d): long run, bottom of AC.**
        $$4 + 2q = \frac{100}{q} + 4 + q \;\Rightarrow\; q = \frac{100}{q} \;\Rightarrow\; q^2 = 100 \;\Rightarrow\; q_{LR} = 10$$
        $P_{LR} = AC(10) = 10 + 4 + 10 = 24$. $Q_{LR} = 900 - 25(24) = 300$. $n = 300/10 = 30$: 20 firms leave.

        **Move 5 (e): the path.** At \$20 every firm loses money. In the long run the \$100 is avoidable, so firms compare $P$ with min AC (\$24) and some leave. Each exit shifts market supply left, the price climbs, and losses shrink. Exit stops at $P = 24$, where the 30 survivors break even. Short run: **shutdown** test (min AVC = 4). Long run: **exit** test (min AC = 24).
      `,
    }),
    R(md`
      ### Q3. A price support versus an ordinary floor (16 points)

      In a grain market (quantities in thousands of bushels, prices in dollars per bushel), demand is $Q^D = 120 - P$ and supply is $Q^S = 2P$.
    `),
    P({ src: 'Q3 · 16 pts', title: 'Grain: support at \\$50',
      q: md`(a) Find the equilibrium price and quantity, CS, PS and total welfare. (b) The government sets a support price of \$50 and buys whatever consumers do not. Find how much producers sell, how much consumers buy, how much the government buys and what it spends. Then find CS, PS, total welfare and the change in total welfare; shade the areas. (c) Instead, an ordinary price floor of \$50 with no government purchases. Find the quantity traded, the unsold quantity, PS, total welfare and the DWL. (d) Briefly: which policy do farmers prefer, and which costs society more?`,
      plan: [
        plan('Part (a): what are the triangles?', 'Equilibrium from $Q^D = Q^S$; CS up to the choke price 120; PS down to the supply intercept 0', [
          ['PS down to \\$40 (the equilibrium price)', 'PS is the area between the price and the supply curve, which starts at $P = 0$ here.'],
          ['CS up to \\$60', 'Demand reaches $Q = 0$ at $P = 120$.'],
          ['Use 120 and 2 as the triangle heights', 'Heights are price gaps: $120 - P^*$ for CS and $P^* - 0$ for PS.'],
        ], '$120 - P = 2P \\Rightarrow P^* = 40$, $Q^* = 80$. CS $= \\tfrac12(80)(120 - 40)$, PS $= \\tfrac12(80)(40)$.'),
        plan('Part (b): with the support, who sells and who buys?', 'Producers sell $Q^S(50) = 100$; consumers buy $Q^D(50) = 70$; the government buys the difference, 30, at \\$50', [
          ['Traded is $Q^D(50) = 70$, as with any floor', 'Under a support the government buys the excess, so producers sell everything they supply at \\$50.'],
          ['The government buys all 100', 'Consumers still buy their 70 at \\$50; the government takes only what they leave.'],
          ['Producers keep selling the old 80', 'At \\$50 they move up their supply curve to 100.'],
        ], 'Spending $G = 50 \\times 30$. CS: triangle over 70 units. PS: triangle over 100 units.'),
        plan('How do you count total welfare under the support?', '$W = CS + PS - G$: the purchases are paid for by taxpayers, and the grain bought has no use here', [
          ['$W = CS + PS + G$, like tax revenue', 'Tax revenue is money **coming in** to the government. Here money goes **out**.'],
          ['$W = CS + PS$: spending is just a transfer to farmers', 'Taxpayers lose all \\$1,500 while farmers gain much less, and the extra grain cost real resources to grow.'],
          ['Only the triangle between demand and supply is lost', 'That is the ordinary-floor DWL. A support also wastes the government spending.'],
        ], 'Before / After / Change, with a G row of $-1500$.'),
        plan('Part (c): an ordinary floor at the same price. What changes?', 'No government buyer: traded $= Q^D(50) = 70$; PS is a trapezoid over those 70 units', [
          ['Producers still sell 100', 'Without the government, nobody buys the extra 30.'],
          ['Nothing: a floor is a floor', 'Who buys the excess changes producers’ sales, PS and taxpayers’ bill.'],
          ['PS is the triangle $\\tfrac12(100)(50)$', 'Only 70 units are sold, and at $Q = 70$ the supply price is 35: a trapezoid.'],
        ], 'Supply price at 70: $70/2 = 35$. PS $= \\tfrac12[(50 - 0) + (50 - 35)](70)$. DWL: triangle from 70 to 80.'),
      ],
      parts: [
        N('P^*', 40), N('Q^*', 80), N('CS', 3200), N('PS', 1600), N('W', 4800),
        N('Q^S\\ (50)', 100), N('Q^D\\ (50)', 70), N('\\text{government buys}', 30), N('G', 1500),
        N('CS\\text{ (support)}', 2450), N('PS\\text{ (support)}', 2500), N('W\\text{ (support)}', 3450), N('\\Delta W\\text{ (support)}', -1350),
        N('Q\\text{ traded (floor)}', 70), N('\\text{unsold}', 30), N('PS\\text{ (floor)}', 2275), N('W\\text{ (floor)}', 4725), N('\\text{DWL (floor)}', 75),
        FIX('(d) Which is true?', ['farmers prefer the support (PS 2500 vs 2275), and the support costs society far more (1350 vs 75)', 'farmers prefer the floor, and the floor costs society more', 'both policies cost society the same, since the price is the same'], 0,
          [null, 'Under the floor farmers sell only 70 units; under the support they sell 100 at the same price.', 'The price is the same, but the support also pays for 30 units nobody consumes.']),
      ],
      hints: ['Support: $Q^S = 2(50) = 100$, $Q^D = 120 - 50 = 70$.', '$W = CS + PS - G = 2450 + 2500 - 1500$.'],
      figs: { sup: { svg: EC.graph({
        w: 330, h: 270, x: [0, 128], y: [0, 125], xl: 'Q', yl: 'P', xt: [70, 80, 100], yt: [35, 40, 50, 120],
        items: [
          { poly: [[0, 120], [0, 50], [70, 50]], cls: 'cs' },
          { poly: [[0, 50], [100, 50], [0, 0]], cls: 'gain' },
          { poly: [[70, 50], [100, 50], [100, 0], [70, 0]], cls: 'ex' },
          { f: (Q) => 120 - Q, from: 0, to: 120, cls: 'c4', lab: 'D', labX: 112, dx: 4, dy: -2, anchor: 'l' },
          { f: (Q) => Q / 2, from: 0, to: 128, cls: 'c5', lab: 'S', labX: 124, dx: -2, dy: -6, anchor: 'br' },
          { seg: [[0, 50], [128, 50]], cls: 'curve dim dash', lab: '\\$50', at: 'end', dx: -2, dy: -4, anchor: 'br' },
          { pt: [70, 50], guide: 'x' }, { pt: [100, 50], guide: 'x' }, { pt: [80, 40], guide: true },
          { text: [16, 70], t: 'CS' }, { text: [35, 38], t: 'PS' }, { text: [85, 22], t: 'G = 1500' },
        ],
      }), cap: 'Support at 50: consumers buy 70 (blue CS = 2450), producers sell 100 (green PS = 2500), the government buys 30 for 1500 (gray, counted as $-G$).' } },
      sol: md`
        **Move 1 (a): equilibrium.** $120 - P = 2P \Rightarrow P^* = 40$, $Q^* = 80$. Inverse demand $P = 120 - Q$; inverse supply $P = Q/2$.
        $$CS = \tfrac12(80)(120 - 40) = 3200, \qquad PS = \tfrac12(80)(40 - 0) = 1600, \qquad W = 4800$$

        **Move 2 (b): quantities under the support.** Producers: $Q^S = 2(50) = 100$. Consumers: $Q^D = 120 - 50 = 70$. Government: $100 - 70 = 30$, spending $G = 50 \times 30 = 1500$.

        **Move 3: welfare under the support.**
        $$CS = \tfrac12(70)(120 - 50) = 2450, \qquad PS = \tfrac12(100)(50 - 0) = 2500$$

        | | Before | Support | Change |
        |---|---|---|---|
        | CS | 3200 | 2450 | $-750$ |
        | PS | 1600 | 2500 | $+900$ |
        | G | 0 | $-1500$ | $-1500$ |
        | W | 4800 | 3450 | $-1350$ |

        Farmers gain \$900, but consumers lose \$750 and taxpayers \$1,500.

        [[fig:sup]]

        **Move 4 (c): ordinary floor.** Traded $= Q^D(50) = 70$; unsold $= 100 - 70 = 30$. At $Q = 70$ the supply price is 35.
        $$PS = \tfrac12\big[(50 - 0) + (50 - 35)\big](70) = \tfrac12(65)(70) = 2275$$
        CS is the same 2450 (buyers face the same \$50). $W = 2450 + 2275 = 4725$.
        $$\text{DWL} = \tfrac12(80 - 70)(50 - 35) = 75$$
        And $4800 - 4725 = 75$ ✓.

        **Move 5 (d): compare.** Farmers prefer the support: they sell 100 instead of 70 at the same \$50 (PS 2500 vs 2275). Society loses far more under the support (1350 vs 75): taxpayers pay \$1,500 for 30 bushels that cost real resources to grow and are never eaten.
      `,
    }),

    R(md`
      ### Q4. Market power (16 points)

      **Part 1.** A monopolist can sell the following quantities at these prices, and each unit costs \$25 to make (no fixed cost).

      | $Q$ | 1 | 2 | 3 | 4 | 5 | 6 |
      |---|---|---|---|---|---|---|
      | $P$ | 50 | 45 | 40 | 35 | 30 | 25 |

      **Part 2.** A different monopolist faces constant-elasticity demand $Q = 270{,}000\,P^{-3}$ and has constant $MC = \$20$.
    `),
    P({ src: 'Q4 · 16 pts', title: 'Revenue table, then constant elasticity',
      q: md`(a) For Part 1, find the MR of the 3rd and of the 4th unit. (b) Find the profit-maximizing quantity, price, profit and Lerner index. (c) Briefly: why is the MR of the 4th unit below its price? (d) For Part 2, find the price, quantity and Lerner index. (e) The government taxes the Part 2 monopolist \$6 per unit. Find the new consumer price and the pass-through $dP_c/dt$, and explain briefly why it exceeds 1.`,
      plan: [
        plan('Parts (a) and (b): how do you find the best quantity from a table?', 'MR = the change in TR from one more unit; produce every unit whose MR is at least MC = 25', [
          ['Produce every unit whose **price** is at least 25', 'That is the competitive rule. To sell another unit the monopolist must cut the price on all earlier units, so the unit adds less than its price.'],
          ['Maximize total revenue', 'Revenue peaks at 5 or 6 units, but each of those last units costs \\$25 and adds only \\$10 or \\$0.'],
          ['MR = TR divided by Q', 'TR/Q is the price (average revenue). MR is the **change** in TR.'],
        ], 'TR: 50, 90, 120, 140, 150, 150. MR: 50, 40, 30, 20, 10, 0. Stop before MR drops below 25.'),
        plan('Part (d): constant elasticity. How do you get the price?', '$MR = P(1 + 1/\\varepsilon_p) = P(1 - \\tfrac13)$; set it equal to MC: $P = MC\\cdot\\dfrac{e}{e - 1}$', [
          ['$MR = a - 2bQ$', 'That shortcut is for **linear** demand. This demand is a power function.'],
          ['$P = MC(1 + 1/e)$', 'That adds a third of MC. Solve $\\tfrac23P = MC$ instead: the markup factor is $3/2$.'],
          ['$P = MC$: constant elasticity means no market power', 'Market power depends on how elastic demand is, not on whether elasticity is constant. Here $e = 3$, so $L = 1/3$.'],
        ], '$\\tfrac23P = 20 \\Rightarrow P = 30$. $Q = 270{,}000/30^3$. Check $L = -1/\\varepsilon_p$.'),
        plan('Part (e): a \\$6 tax. How does the consumer price move?', 'Same markup on the higher marginal cost: $P_c = (20 + 6)\\cdot\\tfrac32$; pass-through $e/(e - 1) = 1.5$', [
          ['Half the tax, as with linear demand', 'The 1/2 rule is for linear demand with constant MC. With constant elasticity the markup is a fixed **percentage**.'],
          ['Exactly the tax: $P_c = 36$', 'That would keep the markup at \\$10 in dollars. Here the markup is 50% of MC, so it grows when MC grows.'],
          ['The monopolist absorbs it: $P_c = 30$', 'The tax raises its marginal cost, so it raises its price.'],
        ], 'Constant elasticity $e$: $dP_c/dt = e/(e - 1)$.'),
      ],
      parts: [
        N('MR_3', 30), N('MR_4', 20),
        N('Q^*', 3), N('P^*', 40), N('\\pi', 45), N('L', 0.375),
        FIX('(c) The 4th unit’s MR (20) is below its price (35) because…', ['to sell it the price falls by \\$5 on the first 3 units too', 'the 4th unit costs more to make', 'consumers pay a tax on it'], 0,
          [null, 'Every unit costs \\$25; MR comes from demand alone.', 'There is no tax in Part 1.']),
        N('P\\text{ (Part 2)}', 30), N('Q\\text{ (Part 2)}', 10), N('L\\text{ (Part 2)}', 1 / 3),
        N('P_c\\ (t = 6)', 39), N('dP_c/dt', 1.5),
        FIX('(e) Pass-through exceeds 1 because…', ['the monopolist keeps the same percentage markup over a higher marginal cost', 'consumers are legally liable for the tax', 'demand becomes less elastic after the tax'], 0,
          [null, 'Who pays legally does not matter.', 'Elasticity is constant: it is $-3$ at every price.']),
      ],
      hints: ['$MR_4 = TR(4) - TR(3) = 140 - 120$.', 'Part 2: $MR = \\tfrac23P$.'],
      sol: md`
        **Move 1 (a): TR, then MR as differences.**

        | $Q$ | 1 | 2 | 3 | 4 | 5 | 6 |
        |---|---|---|---|---|---|---|
        | $TR = PQ$ | 50 | 90 | 120 | 140 | 150 | 150 |
        | $MR$ | 50 | 40 | 30 | 20 | 10 | 0 |

        $MR_3 = 120 - 90 = 30$; $MR_4 = 140 - 120 = 20$.

        **Move 2 (b): $MR \ge MC$.** The 3rd unit adds \$30 of revenue for \$25 of cost: make it. The 4th adds \$20 for \$25: don't. $Q^* = 3$, $P^* = 40$ (read off the demand row).
        $$\pi = 120 - 3(25) = 45, \qquad L = \frac{40 - 25}{40} = 0.375$$
        (Check: at $Q = 4$, $\pi = 140 - 100 = 40 < 45$.)

        **Move 3 (c): why MR < P.** Selling the 4th unit means cutting the price from 40 to 35 on **all** units. Gain: \$35 from the new unit. Loss: \$5 on each of the first 3, \$15. $MR_4 = 35 - 15 = 20$.

        **Move 4 (d): constant elasticity.** $\varepsilon_p = -3$, so
        $$MR = P\left(1 + \frac{1}{-3}\right) = \frac23P = 20 \;\Rightarrow\; P = 30$$
        $Q = 270{,}000/30^3 = 270{,}000/27{,}000 = 10$. $L = (30 - 20)/30 = 1/3 = -1/\varepsilon_p$ ✓.

        **Move 5 (e): tax.** The tax adds \$6 to the cost of each unit: $\tfrac23P_c = 20 + 6 = 26 \Rightarrow P_c = 39$. The price rose by \$9 for a \$6 tax:
        $$\frac{dP_c}{dt} = \frac{e}{e - 1} = \frac32 = 1.5$$
        With constant elasticity the monopolist charges 50% above marginal cost whatever MC is. A \$6 rise in MC brings a \$6 rise **plus** 50% of it in markup. Consumers pay more than 100% of the tax.
      `,
    }),
    R(md`
      ### Q5. An ad valorem tax on a monopoly (16 points)

      A monopolist faces inverse demand $P = 100 - Q$ and has cost $C(Q) = 40Q$. The government levies a 20% ad valorem tax on the consumer price, so the monopolist keeps $P_p = 0.8P_c$.
    `),
    P({ src: 'Q5 · 16 pts', title: '20% of every dollar',
      q: md`(a) Find the untaxed quantity, price and profit. (b) Write the effective demand and effective MR the monopolist faces, and find the after-tax quantity, consumer price and producer price. (c) Find the tax revenue and the monopolist's profit. (d) Find the DWL of the untaxed monopoly and the total DWL after the tax (both against the efficient outcome). Shade the after-tax areas. (e) Find the specific (per-unit) tax that would lead to the same output, and its revenue. Briefly compare the two taxes.`,
      plan: [
        plan('Part (a): the untaxed monopoly?', '$MR = MC$: $100 - 2Q = 40$, price from demand', [
          ['$P = MC$: $100 - Q = 40$', 'That is the efficient quantity (60), needed for the DWL in part (d).'],
          ['$MR = 0$', 'That maximizes revenue and ignores the \\$40 cost per unit.'],
          ['$P = AC$', 'That is a regulation rule, not what an unregulated monopolist does.'],
        ], '$Q = 30$, $P = 70$, $\\pi = (70 - 40)(30)$.'),
        plan('Part (b): how does a 20% ad valorem tax enter the monopolist’s choice?', 'It keeps 80% of each dollar: effective demand $0.8(100 - Q)$, effective MR $0.8(100 - 2Q)$; set that equal to MC', [
          ['Subtract 20 from demand, like a \\$20 per-unit tax', 'The tax is 20% of the price, not \\$20. It takes more from high prices than from low ones, so it scales the curve.'],
          ['Set $MR = 1.2\\,MC$', '$(1 - v)MR = MC$ means $MR = MC/0.8 = 1.25\\,MC$, not $1.2\\,MC$.'],
          ['Keep $Q = 30$ and add 20% to the price', 'The tax changes what each extra unit earns the firm, so it chooses a new quantity.'],
        ], '$80 - 1.6Q = 40 \\Rightarrow Q = 25$. Then $P_c$ from the **original** demand and $P_p = 0.8P_c$.'),
        plan('Part (d): which quantities bound each DWL triangle?', 'Both run to the efficient quantity, where $P = MC$ ($Q = 60$): from 30 (untaxed) and from 25 (taxed)', [
          ['The taxed DWL runs from 25 to 30 only', 'That is the **extra** DWL from the tax. The total also includes the monopoly’s own triangle.'],
          ['The DWL is the tax revenue', 'Revenue is a transfer to the government.'],
          ['Use $\\tfrac12 \\times (P_c - P_p) \\times \\Delta Q$', 'That shortcut assumes the old quantity was efficient. A monopoly already had a markup above MC.'],
        ], 'Untaxed $\\tfrac12(60 - 30)(70 - 40)$. Taxed $\\tfrac12(60 - 25)(75 - 40)$.'),
        plan('Part (e): which specific tax gives the same output?', 'The $t$ with $MR(25) = MC + t$: $t = (100 - 50) - 40$', [
          ['$t = P_c - P_p = 15$, the ad valorem wedge', 'A \\$15 specific tax gives $Q = (100 - 40 - 15)/2 = 22.5$, not 25.'],
          ['$t = 20\\% \\times 70 = 14$', 'The untaxed price has nothing to do with it; what matters is MR at the target output.'],
          ['$t = 20$', 'The 20 is a percentage, not dollars.'],
        ], 'Then $P_c = 75$ (same demand, same $Q$), $P_p = 75 - t$, revenue $= tQ$.'),
      ],
      parts: [
        N('Q_0', 30), N('P_0', 70), N('\\pi_0', 900),
        X('\\text{effective demand } P_p(Q)', '80 - 0.8*Q', { Q: [1, 60] }), X('\\text{effective }MR(Q)', '80 - 1.6*Q', { Q: [1, 40] }),
        N('Q_v', 25), N('P_c', 75), N('P_p', 60),
        N('\\text{tax revenue}', 375), N('\\pi_v', 500),
        N('\\text{DWL untaxed}', 450), N('\\text{DWL total after tax}', 612.5),
        N('t\\text{ (same output)}', 10), N('\\text{its revenue}', 250),
        FIX('(e) At the same output, the ad valorem tax…', ['raises more revenue (375 vs 250) with the same consumer price and the same DWL', 'raises less revenue', 'gives consumers a lower price'], 0,
          [null, 'At $Q = 25$ the ad valorem wedge is \\$15 per unit; the equivalent specific tax is \\$10.', 'Same $Q$ on the same demand curve means the same $P_c = 75$.']),
      ],
      hints: ['$0.8(100 - 2Q) = 40 \\Rightarrow 100 - 2Q = 50$.', '$P_c = 100 - 25$; $P_p = 0.8 \\times 75$.'],
      figs: { adv: { svg: EC.graph({
        w: 330, h: 270, x: [0, 106], y: [0, 105], xl: 'Q', yl: 'P', xt: [25, 30, 60], yt: [40, 60, 75, 100],
        items: [
          { poly: [[0, 100], [0, 75], [25, 75]], cls: 'cs' },
          { poly: [[0, 75], [25, 75], [25, 60], [0, 60]], cls: 'ex' },
          { poly: [[0, 60], [25, 60], [25, 40], [0, 40]], cls: 'gain' },
          { poly: [[25, 75], [25, 40], [60, 40]], cls: 'loss' },
          { f: (Q) => 100 - Q, from: 0, to: 100, cls: 'c4', lab: 'D', labX: 92, dx: 4, dy: -2, anchor: 'l' },
          { f: (Q) => 0.8 * (100 - Q), from: 0, to: 100, cls: 'c4 dash', lab: '0.8D', labX: 96, dx: 2, dy: -6, anchor: 'bl' },
          { f: (Q) => 80 - 1.6 * Q, from: 0, to: 50, cls: 'c2 dash', lab: '0.8MR', labX: 40, dx: 4, dy: 4, anchor: 'tl' },
          { seg: [[0, 40], [106, 40]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
          { pt: [25, 75], guide: 'x' }, { pt: [25, 60] }, { pt: [60, 40], guide: 'x' },
          { text: [7, 85], t: 'CS' }, { text: [11, 67.5], t: 'G' }, { text: [11, 50], t: '\\pi' }, { text: [34, 50], t: '\\text{DWL}' },
        ],
      }), cap: 'Ad valorem 20%: effective MR (dashed orange) meets MC at $Q = 25$. Buyers pay 75; the firm keeps 60. Blue: CS = 312.5. Gray: revenue 375. Green: profit 500. Red: total DWL = 612.5.' } },
      sol: md`
        **Move 1 (a): untaxed.** $100 - 2Q = 40 \Rightarrow Q_0 = 30$, $P_0 = 70$, $\pi_0 = (70 - 40)(30) = 900$.

        **Move 2 (b): effective demand and MR.** The firm keeps 80% of the price:
        $$P_p(Q) = 0.8(100 - Q) = 80 - 0.8Q, \qquad \text{effective } MR = \frac{d[(80 - 0.8Q)Q]}{dQ} = 80 - 1.6Q$$
        (the same as $(1 - v)MR = 0.8(100 - 2Q)$).
        $$80 - 1.6Q = 40 \;\Rightarrow\; 1.6Q = 40 \;\Rightarrow\; Q_v = 25$$
        **Move 3: prices.** $P_c = 100 - 25 = 75$ (original demand). $P_p = 0.8(75) = 60$.

        **Move 4 (c): revenue and profit.**
        $$G = (P_c - P_p)Q = (75 - 60)(25) = 375, \qquad \pi_v = (60 - 40)(25) = 500$$

        **Move 5 (d): DWL against $Q = 60$** (where $100 - Q = 40$).
        $$\text{untaxed: } \tfrac12(60 - 30)(70 - 40) = 450, \qquad \text{after tax: } \tfrac12(60 - 25)(75 - 40) = 612.5$$
        The tax adds $612.5 - 450 = 162.5$. Check with welfare: efficient $W = \tfrac12(60)(60) = 1800$; after tax $W = CS + \pi + G = \tfrac12(25)(25) + 500 + 375 = 312.5 + 875 = 1187.5$; $1800 - 1187.5 = 612.5$ ✓.

        [[fig:adv]]

        **Move 6 (e): the equivalent specific tax.** Same output means $MR(25) = MC + t$:
        $$100 - 2(25) = 40 + t \;\Rightarrow\; 50 = 40 + t \;\Rightarrow\; t = 10$$
        Then $P_c = 75$ (same), $P_p = 65$, revenue $= 10 \times 25 = 250$, profit $= (65 - 40)(25) = 625$.

        **Compare.** Same output, same consumer price, same CS and same DWL. But the ad valorem tax takes \$15 a unit at that price, the specific tax only \$10: the ad valorem tax raises **more revenue** (375 vs 250) and leaves the monopolist less profit (500 vs 625). Total welfare is identical ($312.5 + 625 + 250 = 1187.5$).
      `,
    }),

    R(md`
      ### Q6. Regulating a natural monopoly (16 points)

      A town's water utility faces inverse demand $P = 60 - Q$ and has cost $C(Q) = 400 + 10Q$.
    `),
    P({ src: 'Q6 · 16 pts', title: 'Water utility: P = MC or P = AC?',
      q: md`(a) Show that this is a natural monopoly: compare the cost of producing 40 units with one firm and with two firms of 20 each, and say what AC does. (b) Find the unregulated quantity, price, profit and DWL. (c) Regulators set a price ceiling at $P = MC$. Find the price, quantity, revenue, total cost and profit. What happens in the long run without a subsidy? (d) Instead they set the ceiling at $P = AC$. Find the quantity (say which root you use and why), price, profit and the remaining DWL. Shade it. (e) Briefly compare the two regulations.`,
      plan: [
        plan('Part (a): what makes a natural monopoly?', 'AC $= 10 + 400/Q$ falls at every output: one firm can make any market quantity more cheaply than two', [
          ['MC is rising', 'MC is a flat \\$10 here. The point is that the big fixed cost is spread over more units.'],
          ['The utility holds a license', 'A license is a legal barrier. A natural monopoly comes from **costs**.'],
          ['It earns a positive profit', 'Any monopoly might. The defining fact is that average cost falls over the whole market.'],
        ], 'One firm: $400 + 10(40)$. Two firms: $2[400 + 10(20)]$.'),
        plan('Part (b): unregulated?', '$MR = MC$: $60 - 2Q = 10$; price from demand; DWL against the efficient $Q$ where $P = MC$', [
          ['$P = MC$', 'That is the efficient quantity, the ceiling in part (c).'],
          ['$P = AC$', 'That is the ceiling in part (d).'],
          ['$MR = AC$', 'Average cost is not the margin. Marginal decisions compare MR with MC.'],
        ], '$Q = 25$, $P = 35$. Efficient: $60 - Q = 10 \\Rightarrow Q = 50$. DWL $= \\tfrac12(50 - 25)(35 - 10)$.'),
        plan('Part (c): a ceiling at $P = MC$. What happens to profit?', 'Price \\$10, quantity from demand (50); with constant MC, $P = MC < AC$, so the firm loses its fixed cost', [
          ['Profit is zero: price covers cost', 'Price covers **marginal** cost only. The \\$400 fixed cost is not covered.'],
          ['The quantity comes from $MR = MC$', 'Under a binding ceiling the firm sells whatever buyers want at \\$10, as long as $P \\ge MC$.'],
          ['The firm earns $10 \\times 50$ in profit', 'That is revenue. Subtract total cost, $400 + 10(50)$.'],
        ], '$\\pi = 500 - 900 = -400$. In the long run it exits unless it gets a \\$400 subsidy.'),
        plan('Part (d): a ceiling at $P = AC$. How do you solve it, and which root?', 'Set $60 - Q = 10 + 400/Q$, get $Q^2 - 50Q + 400 = 0$; take the **larger** root (more water, lower price)', [
          ['The smaller root', 'Both roots give zero profit, but the smaller one means less water at a higher price. Regulators want the larger quantity.'],
          ['Average the two roots', 'Neither root is chosen by averaging; only the roots satisfy $P = AC$.'],
          ['Set $MR = AC$', 'The ceiling sets the **price** equal to AC; buyers then choose the quantity off demand.'],
        ], '$Q = \\dfrac{50 \\pm \\sqrt{2500 - 1600}}{2} = \\dfrac{50 \\pm 30}{2}$. DWL: triangle from 40 to 50 between demand and MC.'),
      ],
      parts: [
        N('TC\\text{ (one firm, 40)}', 800), N('TC\\text{ (two firms, 20 each)}', 1200),
        N('Q_m', 25), N('P_m', 35), N('\\pi_m', 225), N('\\text{DWL}_m', 312.5),
        N('P\\ (P = MC)', 10), N('Q\\ (P = MC)', 50), N('TR\\ (P = MC)', 500), N('TC\\ (P = MC)', 900), N('\\pi\\ (P = MC)', -400),
        FIX('(c) In the long run, without a subsidy, the utility…', ['exits: it loses its \\$400 fixed cost every period', 'stays: price covers marginal cost', 'raises its price to \\$35'], 0,
          [null, 'Covering MC is enough only in the short run. In the long run every cost must be covered.', 'The ceiling forbids prices above \\$10.']),
        N('Q\\ (P = AC)', 40), N('P\\ (P = AC)', 20), N('\\pi\\ (P = AC)', 0), N('\\text{DWL}\\ (P = AC)', 50),
        FIX('(e) Compare the two ceilings.', ['$P = MC$ is efficient but needs a subsidy; $P = AC$ covers cost and leaves a small DWL (50 vs 312.5 unregulated)', '$P = AC$ is efficient and $P = MC$ leaves a DWL', 'both are efficient'], 0,
          [null, 'Reversed: $P = MC$ produces the efficient 50 units; $P = AC$ stops at 40.', 'Only the $P = MC$ quantity is efficient, and only with a subsidy does the firm stay.']),
      ],
      hints: ['$AC = 10 + 400/Q$.', '$60 - Q = 10 + 400/Q \\Rightarrow 60Q - Q^2 = 10Q + 400$.'],
      figs: { reg: { svg: EC.graph({
        w: 330, h: 270, x: [0, 64], y: [0, 64], xl: 'Q', yl: 'P', xt: [25, 40, 50], yt: [10, 20, 35, 60],
        items: [
          { poly: [[40, 20], [40, 10], [50, 10]], cls: 'loss' },
          { f: (Q) => 60 - Q, from: 0, to: 60, cls: 'c4', lab: 'D', labX: 58, dx: 4, dy: -2, anchor: 'l' },
          { f: (Q) => 60 - 2 * Q, from: 0, to: 30, cls: 'c2 dash', lab: 'MR', labX: 28, dx: 4, dy: 0, anchor: 'l' },
          { seg: [[0, 10], [64, 10]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 12, anchor: 'tr' },
          { f: (Q) => 10 + 400 / Q, from: 7.6, to: 64, lab: 'AC', labX: 64, dx: -2, dy: -6, anchor: 'br' },
          { pt: [25, 35], lab: '\\text{unregulated}', at: 'tr', guide: true }, { pt: [40, 20], lab: 'P = AC', at: 'tr', guide: true }, { pt: [50, 10], lab: 'P = MC', at: 'tr', guide: 'x' },
          { pt: [10, 50] }, { text: [44.5, 13.5], t: '\\text{DWL}' },
        ],
      }), cap: 'AC falls everywhere: a natural monopoly. Unregulated: (25, 35). $P = AC$: demand meets AC at $Q = 40$ (the larger root; the other crossing is at $Q = 10$). $P = MC$: $Q = 50$, but price 10 is below AC. Red: the DWL left under $P = AC$, 50.' } },
      sol: md`
        **Move 1 (a): natural monopoly.** One firm making 40: $TC = 400 + 10(40) = 800$. Two firms making 20 each: $2[400 + 10(20)] = 2(600) = 1200$. Splitting the market pays the \$400 fixed cost twice. $AC = 10 + \dfrac{400}{Q}$ falls at every $Q$: the bigger the single firm, the cheaper each unit.

        **Move 2 (b): unregulated, $MR = MC$.**
        $$60 - 2Q = 10 \;\Rightarrow\; Q_m = 25, \qquad P_m = 60 - 25 = 35$$
        $$\pi_m = 35(25) - [400 + 10(25)] = 875 - 650 = 225$$
        Efficient quantity: $60 - Q = 10 \Rightarrow Q = 50$.
        $$\text{DWL}_m = \tfrac12(50 - 25)(35 - 10) = \tfrac12(25)(25) = 312.5$$

        **Move 3 (c): $P = MC$ ceiling.** $P = 10$; buyers want $Q = 60 - 10 = 50$.
        $$TR = 10(50) = 500, \qquad TC = 400 + 10(50) = 900, \qquad \pi = -400$$
        Efficient (no DWL), but the firm loses exactly its fixed cost. In the short run it may keep running (price covers MC = AVC), but in the long run it exits unless the town pays it a \$400 subsidy.

        **Move 4 (d): $P = AC$ ceiling.** Demand meets AC:
        $$60 - Q = 10 + \frac{400}{Q} \;\Rightarrow\; 60Q - Q^2 = 10Q + 400 \;\Rightarrow\; Q^2 - 50Q + 400 = 0$$
        $$Q = \frac{50 \pm \sqrt{50^2 - 4(400)}}{2} = \frac{50 \pm \sqrt{900}}{2} = \frac{50 \pm 30}{2} = 40 \text{ or } 10$$
        Take $Q = 40$: the larger root gives more water at a lower price (20 instead of 50), and that is the point where the ceiling binds with buyers on demand. $P = 60 - 40 = 20$. $TR = 800$, $TC = 400 + 400 = 800$, $\pi = 0$.
        $$\text{DWL} = \tfrac12(50 - 40)(20 - 10) = 50$$

        [[fig:reg]]

        **Move 5 (e): compare.**

        | Rule | $Q$ | $P$ | Profit | DWL |
        |---|---|---|---|---|
        | unregulated | 25 | 35 | 225 | 312.5 |
        | $P = MC$ | 50 | 10 | $-400$ (needs a subsidy) | 0 |
        | $P = AC$ | 40 | 20 | 0 | 50 |

        $P = MC$ is fully efficient but the firm cannot cover its fixed cost on its own. $P = AC$ covers every cost with no subsidy and removes most of the monopoly DWL (from 312.5 to 50).
      `,
    }),
    R(md`
      ### After you finish

      Score yourself, then revisit the weakest area: [shutdown versus exit](#/l/m3-lr1), [price supports](#/l/m3-po5), [elasticity and Lerner](#/l/m3-mo4), [pass-through](#/l/m3-mt3), [ad valorem taxes](#/l/m3-mt2), [regulation](#/l/m3-rg2). Then the [formula sheet guide](#/l/m3-sheet) and [mixed practice](#/l/m3-mix).
    `),
  ];


  C.unit({
    id: 'm3x', exam: 'm3', tools: true, num: 'Mini Exam 3', title: 'Practice exams',
    lessons: [
      { id: 'm3-xa', title: 'Practice exam A', sub: 'input choice · cubic cost · long run · per-unit tax · monopoly', kind: 'mock', steps: xa },
      { id: 'm3-xb', title: 'Practice exam B', sub: 'profit and scale · market supply · welfare · ceiling and floor · monopoly tax', kind: 'mock', steps: xb },
      { id: 'm3-xc', title: 'Practice exam C', sub: 'exit · price support · market power · ad valorem tax · regulation', kind: 'mock', steps: xc },
    ],
  });
})();

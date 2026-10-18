/* Part 6: short-run and long-run cost curves. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const VQ = { q: [1, 9] }, VY = { y: [1, 9] };

  const VC = (y) => y * y * y - 6 * y * y + 13 * y;
  const tcFig = EC.graph({
    w: 300, h: 240, x: [0, 6.6], y: [0, 125], xl: 'y', yl: '\\$', xt: [2, 4, 6], yt: [32, 80, 120],
    items: [
      { seg: [[0, 32], [6.4, 32]], cls: 'curve dim dash', lab: 'F', at: 'end', dx: 4, dy: 4, anchor: 'l' },
      { f: VC, from: 0, to: 6.2, cls: 'c2', lab: 'VC', labX: 6.1, dx: 6, dy: 4, anchor: 'l' },
      { f: (y) => VC(y) + 32, from: 0, to: 5.75, lab: 'TC', labX: 5.7, dx: 6, dy: 4, anchor: 'l' },
      { arrow: [[3, 44], [3, 12.5]], cls: 'dim' }, { text: [3.15, 28], t: '32', anchor: 'l' },
    ],
  });
  const avgFig = EC.graph({
    w: 310, h: 260, x: [0, 6.4], y: [0, 32], xl: 'y', yl: '\\$/\\text{unit}', xt: [2, 3, 4], yt: [4, 13, 30],
    items: [
      { f: (y) => 32 / y, from: 1.1, to: 6.2, cls: 'dim', lab: 'AFC', labX: 6.2, dx: 4, dy: 2, anchor: 'l' },
      { f: (y) => y * y - 6 * y + 13, from: 0.6, to: 6.2, cls: 'c2', lab: 'AVC', labX: 6.2, dx: 4, dy: 2, anchor: 'l' },
      { f: (y) => y * y - 6 * y + 13 + 32 / y, from: 1.25, to: 6.2, lab: 'ATC', labX: 6.2, dx: 4, dy: 2, anchor: 'l' },
      { f: (y) => 3 * y * y - 12 * y + 13, from: 0.6, to: 5.1, cls: 'c5', lab: 'MC', labX: 5.0, dx: 6, dy: 2, anchor: 'l' },
      { pt: [3, 4], lab: '\\min AVC', at: 'br', guide: true }, { pt: [4, 13], lab: '\\min ATC', at: 'br', guide: true },
    ],
  });
  const lrac = (y) => 9 + 0.01 * (y - 20) ** 2;
  const envFig = EC.graph({
    w: 320, h: 250, x: [0, 40], y: [7, 17], xl: 'y', yl: '\\$/\\text{unit}', xt: [10, 20, 30], yt: [9, 10, 12],
    items: [
      { f: (y) => 10 - 0.2 * (y - 10) + 0.04 * (y - 10) ** 2, from: 1.5, to: 18.5, cls: 'c2' },
      { f: (y) => 9 + 0.03 * (y - 20) ** 2, from: 7, to: 33, cls: 'c3' },
      { f: (y) => 10 + 0.2 * (y - 30) + 0.04 * (y - 30) ** 2, from: 21.5, to: 38.5, cls: 'c4' },
      { f: lrac, from: 2, to: 38, cls: 'dash' },
      { pt: [10, 10], lab: 'X', at: 'bl' }, { pt: [20, 9], lab: 'Y', at: 'b' }, { pt: [30, 10], lab: 'Z', at: 'br' },
    ],
  });

  C.unit({
    id: 'u6', exam: 'm2', num: 'Part 6', title: 'Cost curves',
    lessons: [
      // ------------------------------------------------------------------ l16
      {
        id: 'l16', title: 'Fixed, variable, average, and marginal cost',
        steps: [
          R(md`
            ### Two kinds of cost

            In the **short run** some input is stuck (the factory lease, the installed machines). That splits cost in two:

            - **Fixed cost $F$:** does **not** change with output. You pay it even if you make nothing. Lease, installed equipment, existing contracts.
            - **Variable cost $VC(y)$:** changes with output. Hourly labor, raw materials, packaging. $VC(0) = 0$.

            $$TC(y) = F + VC(y)$$

            !!key At zero output
              $VC(0) = 0$, so $TC(0) = F$. If a cost function has a constant term, that constant is the fixed cost.
          `),
          RF(md`
            ### Example: a factory cost schedule

            | $y$ | $F$ | $VC$ | $TC$ |
            |---|---|---|---|
            | 0 | 32 | 0 | 32 |
            | 1 | 32 | 8 | 40 |
            | 2 | 32 | 10 | 42 |
            | 3 | 32 | 12 | 44 |
            | 4 | 32 | 20 | 52 |
            | 5 | 32 | 40 | 72 |
            | 6 | 32 | 78 | 110 |

            [[fig:tc]]

            TC is just VC shifted **up** by the fixed cost: the two curves have the same shape and the same slope at every $y$.
          `, { tc: { svg: tcFig, cap: 'TC = F + VC: the vertical gap between TC and VC is always F = 32.' } }),
          Q(md`A firm’s total cost is $TC(y) = 50 + 4y + y^2$. What is its fixed cost?`, ['50', '54', '4y + y²', '0, since VC(0) = 0'], 0,
            [null, 'That is $TC(1) - 1$; fixed cost is the part that does not depend on $y$.', 'That is the variable cost.', 'VC is zero at $y = 0$, but TC is not; it equals $F = 50$.'],
            md`The constant term is the fixed cost: $F = TC(0) = 50$. $VC(y) = 4y + y^2$.`),
          Q(md`Fixed cost \$32. At $y = 4$, VC is \$20; at $y = 5$, VC is \$40. What is the additional cost of producing the **fifth** unit?`, ['\\$20', '\\$40', '\\$72', '\\$8'], 0,
            [null, 'That is all of VC at 5 units, not the change.', 'That is TC at 5 units.', 'That is VC at 1 unit.'],
            md`$TC(5) - TC(4) = 72 - 52 = \$20$. The fixed cost cancels when you take a difference.`),

          R(md`
            ### Three averages

            "Per unit" versions of each cost:

            | Name | Formula | Meaning |
            |---|---|---|
            | Average fixed cost | $AFC = F/y$ | fixed cost per unit |
            | Average variable cost | $AVC = VC(y)/y$ | variable cost per unit |
            | Average total cost | $ATC = TC(y)/y$ | total cost per unit |

            Because $TC = F + VC$, dividing by $y$ gives
            $$ATC = AFC + AVC$$

            At $y = 4$ in the schedule: $AFC = 32/4 = 8$, $AVC = 20/4 = 5$, $ATC = 52/4 = 13$, and $8 + 5 = 13$ ✓.

            !!intuition AFC always falls
              The fixed cost is spread over more and more units: $32/1, 32/2, 32/4, \dots$ = 32, 16, 8, … So AFC falls forever, and the gap between ATC and AVC (which **is** AFC) keeps shrinking.
          `),
          P({ q: md`Use the schedule ($F = 32$). Find each value at $y = 2$.`,
            parts: [N('AFC', 16), N('AVC', 5), N('ATC', 21)],
            hints: ['VC(2) = 10, TC(2) = 42.'],
            sol: md`$AFC = 32/2 = 16$. $AVC = 10/2 = 5$. $ATC = 42/2 = 21 = 16 + 5$ ✓.` }),
          P({ q: md`Same schedule at $y = 5$ and $y = 6$.`,
            parts: [N('AVC(5)', 8), N('ATC(5)', 14.4), N('AVC(6)', 13), N('ATC(6)', 18.33)],
            sol: md`$y = 5$: $AVC = 40/5 = 8$, $ATC = 72/5 = 14.4$. $y = 6$: $AVC = 78/6 = 13$, $ATC = 110/6 = 18.33$.` }),

          R(md`
            ### Marginal cost

            **Marginal cost** is the cost of **one more** unit.

            - From a schedule (discrete): $MC \approx \dfrac{\Delta TC}{\Delta y}$. For one more unit, $MC = TC(y) - TC(y-1)$.
            - From a formula (smooth): $MC(y) = \dfrac{dTC}{dy} = \dfrac{dVC}{dy}$.

            The fixed cost **disappears** when you take a difference or a derivative, so MC is the same whether you start from TC or VC.

            MC is the **slope** of the TC curve (and of the VC curve). Steeper TC means higher MC.

            !!intuition Why MC eventually rises
              Diminishing marginal product: with the factory fixed, each extra worker adds less output. So each extra unit of output needs more labor, and costs more.
          `),
          P({ q: md`Use the schedule to find the marginal cost of each unit.`,
            parts: [N('MC\\text{ of unit 1}', 8), N('MC\\text{ of unit 2}', 2), N('MC\\text{ of unit 3}', 2), N('MC\\text{ of unit 4}', 8), N('MC\\text{ of unit 6}', 38)],
            hints: ['Differences of TC: 40 − 32, 42 − 40, …'],
            sol: md`Differences of TC: $8, 2, 2, 8, 20, 38$. MC falls at first and then rises sharply.` }),
          P({ q: md`$TC(y) = 100 + 10y + 2y^2$. Write each cost function.`,
            parts: [X('VC(y)', '10*y + 2*y^2', VY), X('AFC(y)', '100/y', VY), X('AVC(y)', '10 + 2*y', VY), X('ATC(y)', '100/y + 10 + 2*y', VY), X('MC(y)', '10 + 4*y', VY)],
            hints: ['F is the constant: 100.', 'Divide each piece by $y$ for the averages. MC: differentiate.'],
            sol: md`$F = 100$, $VC = 10y + 2y^2$. $AFC = 100/y$, $AVC = 10 + 2y$, $ATC = 100/y + 10 + 2y$, $MC = 10 + 4y$.` }),
          Q(md`For $TC(y) = 100 + 10y + 2y^2$, is $MC$ different if you differentiate $VC$ instead of $TC$?`, ['No: the derivative of 100 is 0', 'Yes, MC from VC is smaller by 100', 'Yes, MC from VC is smaller by 100/y', 'Only in the long run, when F is zero'], 0,
            [null, 'The constant 100 differentiates to 0.', 'That is the AFC gap between ATC and AVC, not an MC gap.', 'This is a short-run cost function.'],
            md`$d(100)/dy = 0$, so $MC = dTC/dy = dVC/dy = 10 + 4y$.`),
          G('cost_func', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l17
      {
        id: 'l17', title: 'How MC pulls the averages',
        steps: [
          R(md`
            ### The grade-average rule

            Your average grade is 80. Your next exam (the "marginal" one) is a 70. Your average **falls**. If the next exam is a 90, the average **rises**.

            Costs work exactly the same way:
            - **MC below the average** → the next unit costs less than the average → the average **falls**.
            - **MC above the average** → the average **rises**.
            - **MC equal to the average** → the average is flat: it is at its **minimum**.

            This holds for AVC (compare MC with AVC) and for ATC (compare MC with ATC).
          `),
          Q(md`At some output, $MC = \$6$ and $AVC = \$9$. If output rises a little, AVC…`, ['falls', 'rises', 'stays the same', 'cannot be determined'], 0,
            [null, 'The next unit costs less than the average, pulling it down.', 'Only if MC equaled AVC.', 'The rule settles it: MC below the average lowers it.'],
            md`MC (\$6) < AVC (\$9): the next unit is cheaper than the average, so AVC falls.`),
          Q(md`At some output, $MC = \$15$, $AVC = \$10$, and $ATC = \$18$. As output rises a little…`, ['AVC rises and ATC falls', 'both AVC and ATC rise', 'both AVC and ATC fall', 'AVC falls and ATC rises'], 0,
            [null, 'MC is below ATC (15 < 18).', 'MC is above AVC (15 > 10).', 'Reversed.'],
            md`MC above AVC pulls AVC up. MC below ATC pulls ATC down. Both at once is normal: this output is between min AVC and min ATC.`),
          RF(md`
            ### MC crosses both averages at their lowest points

            Using $VC(y) = y^3 - 6y^2 + 13y$ and $F = 32$:

            [[fig:avg]]

            - MC crosses AVC at its minimum: $y = 3$, where $MC = AVC = \$4$.
            - MC crosses ATC at its minimum: $y = 4$, where $MC = ATC = \$13$.
            - Min ATC is to the **right** of min AVC. Why? Past $y = 3$, AVC rises, but AFC is still falling. ATC keeps falling until MC climbs all the way up to ATC.

            !!key To find the output that minimizes an average
              Set $MC$ equal to that average and solve. (Or take the derivative of the average and set it to 0. Same answer.)
          `, { avg: { svg: avgFig, cap: 'MC (red) passes through the bottom of AVC and the bottom of ATC.' } }),
          R(md`
            ### Worked example: minimum AVC

            $VC(y) = y^3 - 6y^2 + 13y$.

            **Step 1.** $AVC = VC/y = y^2 - 6y + 13$.

            **Step 2.** $MC = VC'(y) = 3y^2 - 12y + 13$.

            **Step 3.** Set them equal:
            $$3y^2 - 12y + 13 = y^2 - 6y + 13 \;\Rightarrow\; 2y^2 - 6y = 0 \;\Rightarrow\; 2y(y - 3) = 0$$
            $y = 0$ is not allowed (AVC is undefined there), so $y = 3$.

            **Check:** $MC(3) = 27 - 36 + 13 = 4$ and $AVC(3) = 9 - 18 + 13 = 4$ ✓.

            **Faster alternative:** $AVC = y^2 - 6y + 13$ is a parabola; set its derivative to zero: $2y - 6 = 0 \Rightarrow y = 3$.
          `),
          P({ q: md`$VC(y) = y^3 - 6y^2 + 13y$ and $F = 32$. Find ATC and MC at $y = 4$.`,
            parts: [N('VC(4)', 20), N('ATC(4)', 13), N('MC(4)', 13), FIX('So at y = 4, ATC is…', ['at its minimum', 'falling', 'rising'], 0, [null, 'MC = ATC means the average is flat.', 'MC = ATC means the average is flat.'])],
            hints: ['$TC(4) = 32 + 20 = 52$.', '$MC(4) = 3(16) - 48 + 13$.'],
            sol: md`$VC(4) = 64 - 96 + 52 = 20$, $TC = 52$, $ATC = 13$. $MC(4) = 48 - 48 + 13 = 13$. MC = ATC, so ATC is at its minimum.` }),
          P({ q: md`$TC(y) = 20 + 2y + 0.2y^2$. Find the output that minimizes ATC, and the minimum ATC.`,
            parts: [X('ATC(y)', '20/y + 2 + 0.2*y', VY), X('MC(y)', '2 + 0.4*y', VY), N('y\\text{ at min ATC}', 10), N('\\min ATC', 6)],
            hints: ['Set $20/y + 2 + 0.2y = 2 + 0.4y$.', '$20/y = 0.2y \\Rightarrow y^2 = 100$.'],
            sol: md`$ATC = 20/y + 2 + 0.2y$, $MC = 2 + 0.4y$. Setting them equal: $20/y = 0.2y \Rightarrow y^2 = 100 \Rightarrow y = 10$. $ATC(10) = 2 + 2 + 2 = 6$ (and $MC(10) = 6$ ✓).` }),
          R(md`
            ### Dent’s auto repair (a full problem)

            $TC(q) = 220q - 4q^2 + 0.6q^3 + 800$.

            - $TFC = 800$ (the constant).
            - $TVC = 220q - 4q^2 + 0.6q^3$.
            - $AVC = 220 - 4q + 0.6q^2$.
            - $AFC = 800/q$.
            - $ATC = 220 - 4q + 0.6q^2 + 800/q$.
            - $MC = 220 - 8q + 1.8q^2$.

            Min AVC: $\dfrac{d}{dq}AVC = -4 + 1.2q = 0 \Rightarrow q = 10/3 \approx 3.33$.

            Long run: $TC = 380q - 12q^2 + 0.6q^3$ (no fixed cost: in the long run nothing is fixed). $LRAC = 380 - 12q + 0.6q^2$. Minimize: $-12 + 1.2q = 0 \Rightarrow q = 10$ cars.
          `),
          P({ q: md`Dent: $TC(q) = 220q - 4q^2 + 0.6q^3 + 800$. Type each function.`,
            parts: [X('TVC', '220*q - 4*q^2 + 0.6*q^3', VQ), X('AVC', '220 - 4*q + 0.6*q^2', VQ), X('ATC', '220 - 4*q + 0.6*q^2 + 800/q', VQ), X('MC', '220 - 8*q + 1.8*q^2', VQ), N('TFC', 800)],
            sol: md`TFC $= 800$. TVC $= 220q - 4q^2 + 0.6q^3$. AVC $= 220 - 4q + 0.6q^2$. ATC $= AVC + 800/q$. MC $= 220 - 8q + 1.8q^2$.` }),
          P({ q: md`Dent at $q = 10$.`,
            parts: [N('AVC(10)', 240), N('AFC(10)', 80), N('ATC(10)', 320), N('MC(10)', 320), FIX('At q = 10, ATC is…', ['at its minimum', 'falling', 'rising'], 0, [null, 'MC = ATC.', 'MC = ATC.'])],
            sol: md`$AVC = 220 - 40 + 60 = 240$. $AFC = 80$. $ATC = 320$. $MC = 220 - 80 + 180 = 320$. MC = ATC, so $q = 10$ minimizes short-run ATC.` }),
          P({ q: md`Dent’s long-run cost is $TC(q) = 380q - 12q^2 + 0.6q^3$. How many cars minimize long-run average cost, and what is that cost per car?`,
            parts: [N('q', 10), N('\\min LRAC', 320)],
            hints: ['$LRAC = 380 - 12q + 0.6q^2$.'],
            sol: md`$LRAC = 380 - 12q + 0.6q^2$. Derivative $-12 + 1.2q = 0 \Rightarrow q = 10$. $LRAC(10) = 380 - 120 + 60 = 320$.` }),
          G('mc_avg', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l18
      {
        id: 'l18', title: 'Short run vs long run: plant size',
        steps: [
          R(md`
            ### Fixed plant versus flexible plant

            - **Short run:** plant size $K$ is fixed. The firm adjusts only labor and other variable inputs. $TC = F + VC(y)$.
            - **Long run:** the firm picks **both** plant size and labor, choosing the cheapest combination for each output.

            Each plant size has its **own** short-run cost curve. Changing the plant moves the firm onto a different short-run curve.
          `),
          R(md`
            ### Why plant size matters

            A firm owns a medium plant.

            | Output | Short-run cost (medium plant) | Long-run minimum cost | Extra short-run cost |
            |---|---|---|---|
            | 10 | \$120 | \$100 | \$20 |
            | 20 | \$180 | \$180 | \$0 |
            | 30 | \$360 | \$300 | \$60 |

            The medium plant is the best plant **only** at $y = 20$. At 10 units it is too big (a smaller plant is cheaper); at 30 units it is too small (crowded, so a larger plant is cheaper).

            !!key Short-run cost can never beat long-run cost
              The long run can choose any plant, **including** the one the firm already has. So $SRTC(y) \ge LRTC(y)$ at every output, with equality where the current plant is the best one.
          `),
          Q(md`At $y = 10$, the medium plant costs \$120 but the long-run minimum is \$100. If the firm keeps producing 10 units, what should it consider in the long run?`, ['Switching to a smaller plant', 'Keeping the current plant', 'Cutting output until average cost is lowest', 'Expanding output to spread the fixed cost'], 0,
            [null, 'That costs \\$20 more than necessary.', 'The question holds output at 10.', 'The question holds output at 10.'],
            md`A smaller plant makes the same 10 units for \$100, saving \$20.`),
          Q(md`Which statement is **always** true?`, ['Short-run total cost is at least long-run total cost', 'Long-run total cost is at least short-run total cost', 'Short-run and long-run costs are equal at every output', 'Short-run average cost is lowest at the LRAC minimum'], 0,
            [null, 'Reversed: the long run has more choices.', 'Only at the output where the current plant is best.', 'Each SRAC touches LRAC at one point, generally not its own minimum or the LRAC minimum.'],
            md`The long run can always pick the current plant, so it can never cost more: $SRTC \ge LRTC$.`),
          RF(md`
            ### The long-run average cost curve is a lower envelope

            Draw the short-run average cost curve of every possible plant size. The **long-run average cost (LRAC)** is the **lowest** of them at each output: it wraps underneath all the short-run curves like an envelope.

            [[fig:env]]

            - At **X** ($y = 10$): the small plant is best.
            - At **Y** ($y = 20$): the medium plant is best.
            - At **Z** ($y = 30$): the large plant is best.

            Each short-run curve **touches** the LRAC at exactly one point and lies above it everywhere else. At a touching point, SR cost = LR cost **and** they have the same slope, so $SRMC = LRMC$ there.

            The LRAC here is U-shaped: falling (economies of scale) up to $y = 20$, then rising (diseconomies of scale).
          `, { env: { svg: envFig, cap: 'Orange: small plant. Green: medium. Purple: large. Dashed: LRAC, the lower envelope of all short-run AC curves.' } }),
          Q(md`In the envelope graph, the firm plans to produce 30 units for years. Which plant should it build?`, ['The large plant', 'The medium plant, since it has the lowest AC overall', 'The small plant', 'Whichever plant has the lowest minimum SRAC'], 0,
            [null, 'At 30 units the medium plant is crowded and costs more per unit.', 'The small plant is far too small for 30 units.', 'Choose the plant that is cheapest **at the output you will make**.'],
            md`At $y = 30$ the large plant’s SRAC touches the LRAC (point Z): it is the cheapest way to make 30 units.`),
          Q(md`Where a short-run average cost curve touches the LRAC curve…`, ['SR and LR costs are equal and SRMC = LRMC', 'the short-run curve is always at its own minimum', 'the long-run curve is always at its minimum', 'short-run cost is lower than long-run cost'], 0,
            [null, 'Only at the bottom of the LRAC (like Y) does that happen.', 'Only at Y.', 'SR cost can never be below LR cost.'],
            md`At a tangency, same cost and same slope, so the marginal costs match too. Only at the bottom of the LRAC is it also the SRAC minimum.`),
          R(md`
            ### Two linked decisions

            - **Cost minimization:** given output $y$, produce it as cheaply as possible (Parts 5 and 6).
            - **Profit maximization:** given the market price, choose how much to produce (after this exam).

            A profit-maximizing firm always minimizes the cost of whatever output it picks. In the short run it uses short-run MC; in the long run, long-run MC.
          `),
          G('cost_sched', { need: 5 }),
        ],
      },
    ],
  });
})();

/* Part 3: consumer welfare. Willingness to pay, consumer surplus, CV and EV. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });

  const steps = [[0, 10], [1, 10], [1, 7.5], [2, 7.5], [2, 5], [3, 5], [3, 2.5], [4, 2.5], [4, 0]];
  const teaFig = EC.graph({
    w: 300, h: 230, x: [0, 5], y: [0, 11.5], xl: 'Q', yl: 'P', xt: [1, 2, 3, 4], yt: [2.5, [4.5, '4.5'], 7.5, 10],
    items: [
      { poly: [[0, 4.5], [1, 4.5], [1, 10], [0, 10]], cls: 'cs' }, { poly: [[1, 4.5], [2, 4.5], [2, 7.5], [1, 7.5]], cls: 'cs' }, { poly: [[2, 4.5], [3, 4.5], [3, 5], [2, 5]], cls: 'cs' },
      { poly: [[0, 0], [3, 0], [3, 4.5], [0, 4.5]], cls: 'ex' },
      { pts: steps, cls: 'curve' }, { seg: [[0, 4.5], [4.8, 4.5]], cls: 'curve c2 dash', lab: 'P = 4.50', at: 'end', anchor: 'r', dx: 0, dy: -8 },
      { text: [0.5, 7.3], t: '5.50' }, { text: [1.5, 6], t: '3' }, { text: [2.5, 5.9], t: '0.50' }, { text: [1.5, 2.2], t: '\\text{spending}' },
    ],
  });
  const csFig = EC.graph({
    w: 300, h: 230, x: [0, 11], y: [0, 22], xl: 'Q', yl: 'P', xt: [6, 10], yt: [8, 20],
    items: [
      { poly: [[0, 8], [6, 8], [0, 20]], cls: 'cs' }, { poly: [[0, 0], [6, 0], [6, 8], [0, 8]], cls: 'ex' },
      { seg: [[0, 20], [10, 0]], lab: 'P = 20 - 2Q', at: 0.82, dx: 6 }, { pt: [6, 8], guide: true },
      { text: [1.9, 11.6], t: 'CS = 36' }, { text: [3, 4], t: '\\text{spending} = 48' },
    ],
  });
  const lossFig = EC.graph({
    w: 300, h: 230, x: [0, 11], y: [0, 22], xl: 'Q', yl: 'P', xt: [5, 6, 10], yt: [8, 10, 20],
    items: [
      { poly: [[0, 10], [5, 10], [0, 20]], cls: 'cs' }, { poly: [[0, 8], [5, 8], [5, 10], [0, 10]], cls: 'loss' }, { poly: [[5, 8], [6, 8], [5, 10]], cls: 'loss' },
      { seg: [[0, 20], [10, 0]], lab: 'D', at: 0.9, dx: 6 }, { pt: [5, 10], guide: true }, { pt: [6, 8], guide: true },
      { text: [2.5, 9], t: '10' }, { text: [7.2, 10.6], t: '1', anchor: 'l' }, { arrow: [[7, 10.4], [5.5, 8.8]] }, { text: [1.4, 12.6], t: 'CS = 25' },
    ],
  });
  const gainFig = EC.graph({
    w: 300, h: 230, x: [0, 5.5], y: [0, 14], xl: 'Q', yl: 'P', xt: [3, 4, 5], yt: [2.5, 5, 12.5],
    items: [
      { poly: [[0, 5], [3, 5], [0, 12.5]], cls: 'cs' }, { poly: [[0, 2.5], [3, 2.5], [3, 5], [0, 5]], cls: 'gain' }, { poly: [[3, 2.5], [4, 2.5], [3, 5]], cls: 'gain' },
      { seg: [[0, 12.5], [5, 0]], lab: 'P = 12.5 - 2.5Q', at: 0.55, dx: 8 }, { pt: [3, 5], guide: true }, { pt: [4, 2.5], guide: true },
      { text: [1.5, 3.75], t: '7.50' }, { text: [4.3, 5.2], t: '1.25', anchor: 'l' }, { arrow: [[4.25, 4.9], [3.35, 3.5]] },
    ],
  });

  // Jesse: U = q1^0.4 q2^0.6, m = 30, p2 = 1, p1: 1 -> 2
  const UA = EC.U(0.4, 12, 18), UB = EC.U(0.4, 6, 18), mC = 30 * Math.pow(2, 0.4), mE = 30 * Math.pow(2, -0.4);
  const jesseFig = EC.graph({
    w: 330, h: 290, x: [0, 34], y: [0, 44], xl: 'q_1\\ (\\text{pizza})', yl: 'q_2\\ (\\text{soda})', xt: [15, 30], yt: [30],
    items: [
      { seg: [[0, 30], [30, 0]], cls: 'curve', lab: '\\text{old}', at: 0.93, dx: 4, dy: -4 },
      { seg: [[0, 30], [15, 0]], cls: 'curve c2', lab: '\\text{new}', at: 0.85, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, mC], [mC / 2, 0]], cls: 'curve c3 dash', lab: 'CV', at: 0.04, dx: 6, dy: 0, anchor: 'l' },
      { seg: [[0, mE], [mE, 0]], cls: 'curve c4 dash', lab: 'EV', at: 0.92, dx: 6, dy: 0, anchor: 'l' },
      { f: EC.ic(0.4, UA), from: 4.2, to: 33, cls: 'dim', lab: 'U_A', labX: 33, dx: -2, dy: -6, anchor: 'br' },
      { f: EC.ic(0.4, UB), from: 2.4, to: 33, cls: 'dim', lab: 'U_B', labX: 33, dx: -2, dy: -6, anchor: 'br' },
      { pt: [12, 18], lab: 'A', at: 'tr' }, { pt: [6, 18], lab: 'B', at: 'tl' }, { pt: [mC * 0.2, mC * 0.6], lab: 'C', at: 'tr' }, { pt: [mE * 0.4, mE * 0.6], lab: 'D', at: 'bl' },
    ],
  });

  C.unit({
    id: 'u3', exam: 'm2', num: 'Part 3', title: 'Consumer welfare',
    lessons: [
      // ------------------------------------------------------------------ l8
      {
        id: 'l8', title: 'Willingness to pay and consumer surplus',
        steps: [
          R(md`
            ### What is a good deal worth?

            Imagine a cup of bubble tea. Before you look at the menu, there is a **most** you would pay for it. Maybe \$10 when you are thirsty. That number is your **willingness to pay** (WTP), also called your **reservation price**.

            If the tea costs \$4.50 and you would have paid \$10, you walk away \$5.50 "ahead". That gap, what you **would** pay minus what you **do** pay, is **consumer surplus**.

            !!key Two words, one idea
              - **Buyer’s reservation price = willingness to pay (WTP):** the **highest** price the buyer would pay for that particular unit.
              - **Seller’s reservation price = willingness to accept (WTA):** the **lowest** price the seller would take for that unit.
          `),
          R(md`
            ### Why WTP falls with each extra cup

            Your second cup of tea is worth less to you than the first. The third, even less. This is **diminishing marginal benefit**:

            - 1st cup: wow, worth \$10
            - 2nd cup: nice, worth \$7.50
            - 3rd cup: meh, worth \$5
            - 4th cup: tired of it, worth \$2.50

            Each number is the value of **that one extra cup**, not of all the cups together. Lining these numbers up from highest to lowest gives a staircase that slopes **down**. That staircase **is** the demand curve.

            !!intuition Demand comes from WTP; supply comes from WTA
              Falling WTP for each extra unit is why demand slopes down. Rising WTA (each extra unit costs the seller more to make) is why supply slopes up.
          `),
          Q(md`Why does a demand curve slope downward, in the language of this lesson?`,
            ['Each extra unit is worth less to the buyer', 'Sellers ask a lower price for each extra unit they sell', 'Buyers spend a smaller share of income on later units', 'Later units cost less to make'], 0,
            [null, 'That is about sellers (WTA), and it would make supply slope down, not demand.', 'Budget shares are not the reason; the value of the extra unit is.', 'Production cost is a supply-side idea.'],
            md`Diminishing marginal benefit: WTP for the 1st unit > WTP for the 2nd > … Plotting WTP unit by unit gives a downward staircase, which is the demand curve.`),
          Q(md`A seller’s **willingness to accept** for a unit is…`,
            ['the lowest price they would accept', 'the best offer from a buyer', 'the price that maximizes their total revenue', 'the average price across all units they sell'], 0,
            [null, 'That is about the buyer, not the seller’s own reservation price.', 'Revenue is not part of the definition.', 'It is a per-unit (marginal) idea, not an average.'],
            md`WTA is the seller’s reservation price: the **lowest** price they would accept for that particular unit.`),

          RF(md`
            ### Consumer surplus with a staircase (discrete units)

            The tea costs **\$4.50** a cup. Which cups does this person buy?

            | Cup | WTP | Buy? | Surplus on this cup |
            |---|---|---|---|
            | 1st | \$10.00 | Yes | $10 - 4.50 = 5.50$ |
            | 2nd | \$7.50 | Yes | $7.50 - 4.50 = 3.00$ |
            | 3rd | \$5.00 | Yes | $5 - 4.50 = 0.50$ |
            | 4th | \$2.50 | **No** (worth less than the price) | none |

            **Rule:** buy every unit whose WTP is at least the price. Stop at the first one that is worth less than the price.

            [[fig:tea]]

            Three ways to get the same answer:
            - Add the surpluses: $5.50 + 3 + 0.50 = \$9$.
            - **Total willingness to pay (TWTP)** minus **spending**: TWTP $= 10 + 7.50 + 5 = \$22.50$; spending $= 3 \times 4.50 = \$13.50$; CS $= 22.50 - 13.50 = \$9$.
            - On the graph: the shaded area between the staircase and the price line.

            !!key Consumer surplus
              $$CS = \text{TWTP} - \text{expenditure}$$
              It is what you would have paid **minus** what you did pay, summed over the units you buy.
          `, { tea: { svg: teaFig, cap: 'Blue: surplus on each cup bought. Grey: what was actually spent.' } }),
          Q(md`Same WTP list (\$10, \$7.50, \$5, \$2.50). The price rises to **\$6**. How many cups are bought?`, ['2', '3', '1', '4'], 0,
            [null, 'The 3rd cup is worth only \\$5, less than \\$6.', 'The 2nd cup (\\$7.50) is still worth more than \\$6.', 'The 4th cup is worth only \\$2.50.'],
            md`Buy every cup with WTP ≥ \$6: the 1st (\$10) and the 2nd (\$7.50). The 3rd is worth \$5 < \$6, so stop. **2 cups.**`),
          P({ q: md`Same WTP list (\$10, \$7.50, \$5, \$2.50), price **\$6**. Find each piece.`,
            parts: [N('\\text{cups bought}', 2), N('\\text{TWTP}', 17.5), N('\\text{expenditure}', 12), N('CS', 5.5)],
            hints: ['Only the first two cups are bought.', 'TWTP adds the WTP of the cups bought: $10 + 7.50$.'],
            sol: md`Buy 2 cups. TWTP $= 10 + 7.50 = \$17.50$. Spending $= 2 \times 6 = \$12$. CS $= 17.50 - 12 = \$5.50$. Check by cup: $(10 - 6) + (7.50 - 6) = 4 + 1.50 = 5.50$ ✓.` }),
          P({ q: md`A student’s WTP for slices of pizza: 1st \$8, 2nd \$6, 3rd \$4, 4th \$2. A slice costs **\$3.50**.`,
            parts: [N('\\text{slices}', 3), N('\\text{TWTP}', 18), N('\\text{expenditure}', 10.5), N('CS', 7.5)],
            hints: ['The 4th slice is worth \\$2 < \\$3.50.'],
            sol: md`Buy slices worth at least \$3.50: the first three. TWTP $= 8 + 6 + 4 = 18$. Spending $= 3 \times 3.50 = 10.50$. CS $= 18 - 10.50 = \$7.50$. By slice: $4.50 + 2.50 + 0.50 = 7.50$ ✓.` }),
          Q(md`With WTP \$8, \$6, \$4, \$2 and price \$3.50, what is the surplus on the **third** slice alone?`, ['\\$0.50', '\\$4.00', '\\$7.50', '\\$1.50'], 0,
            [null, 'That is the WTP of the third slice, not its surplus.', 'That is the total CS on all three.', 'Check: $4 - 3.50$.'],
            md`Surplus on one unit = its WTP − price $= 4 - 3.50 = \$0.50$. The last unit bought always has the smallest surplus.`),

          RF(md`
            ### Consumer surplus with a smooth demand curve

            When quantity can be any amount (gallons, pounds), the staircase becomes a straight line or a curve. The idea is identical:

            - **CS** = area **below the demand curve** and **above the price**, from 0 up to the quantity bought.
            - **Expenditure** = price × quantity = the rectangle **below** the price.
            - **TWTP** = the whole area under demand up to $Q$ = CS + expenditure.

            **Example.** Demand $P = 20 - 2Q$; price \$8.

            1. Quantity: $8 = 20 - 2Q \Rightarrow Q = 6$.
            2. Expenditure: $8 \times 6 = \$48$.
            3. CS: a triangle with base $6$ and height $20 - 8 = 12$: $\tfrac12 \times 6 \times 12 = \$36$.
            4. TWTP $= 48 + 36 = \$84$.

            [[fig:cs]]

            !!method Linear demand, every time
              1. Plug the price in, solve for $Q$.
              2. Find the **choke price** (the $P$-intercept, where $Q = 0$). Here: \$20.
              3. CS $= \tfrac12 \times Q \times (\text{choke price} - P)$.

            !!mistake Forgetting the ½
              CS for linear demand is a **triangle**. Base × height without the ½ doubles your answer.
          `, { cs: { svg: csFig, cap: 'Blue triangle: consumer surplus. Grey rectangle: expenditure.' } }),
          Q(md`Demand $P = 20 - 2Q$ and the price is \$8. What is the **height** of the CS triangle?`, ['12', '8', '20', '6'], 0,
            [null, 'That is the price, the bottom edge of the triangle.', 'That is the top of the triangle, the choke price. The height is the gap.', 'That is the base (quantity).'],
            md`Height = choke price − price $= 20 - 8 = 12$. Base = $Q = 6$. CS $= \tfrac12 (6)(12) = 36$.`),
          P({ q: md`Demand is $P = 30 - 3Q$ and the price is \$12.`,
            parts: [N('Q', 6), N('\\text{expenditure}', 72), N('CS', 54), N('\\text{TWTP}', 126)],
            hints: ['$12 = 30 - 3Q$.', 'Choke price is \\$30, so the height is $30 - 12 = 18$.'],
            sol: md`$12 = 30 - 3Q \Rightarrow Q = 6$. Spending $= 12 \times 6 = 72$. CS $= \tfrac12 \times 6 \times 18 = 54$. TWTP $= 72 + 54 = 126$.` }),
          P({ q: md`Rocky’s demand for glasses of milk is $q = 100 - p$, where $p$ is in **cents**. The price is 50¢.

            Answer in cents.`,
            parts: [N('q', 50), N('\\text{TWTP (cents)}', 3750), N('\\text{expenditure (cents)}', 2500), N('CS\\ (\\text{cents})', 1250)],
            hints: ['Here demand is written as quantity in terms of price. The choke price is $p = 100$ (where $q = 0$).', 'TWTP is the area under demand from 0 to 50: a trapezoid, or $\\int_0^{50}(100 - q)\\,dq$.'],
            sol: md`$q = 100 - 50 = 50$ glasses. Inverse demand: $p = 100 - q$. TWTP $= \int_0^{50}(100 - q)\,dq = 100(50) - \tfrac{50^2}{2} = 5000 - 1250 = 3750$¢. Spending $= 50 \times 50 = 2500$¢. CS $= 3750 - 2500 = 1250$¢ $= \$12.50$. (Triangle check: $\tfrac12 \times 50 \times (100 - 50) = 1250$ ✓.)` }),
          Q(md`Demand is written as $Q = 40 - 2P$. Where is the top corner (choke price) of the CS triangle?`, ['P = 20', 'P = 40', 'P = 80', 'P = 2'], 0,
            [null, 'That is the quantity when $P = 0$.', 'Set $Q = 0$: $40 - 2P = 0$.', 'That is the slope coefficient.'],
            md`The choke price is where $Q = 0$: $40 - 2P = 0 \Rightarrow P = 20$. When demand is "Q in terms of P", **always** find this first.`),

          RF(md`
            ### When the price rises: the change in CS

            Same demand, $P = 20 - 2Q$. The price rises from \$8 to **\$10**.

            - New quantity: $10 = 20 - 2Q \Rightarrow Q = 5$.
            - New CS $= \tfrac12 \times 5 \times (20 - 10) = \$25$.
            - $\Delta CS = \text{CS}_{\text{after}} - \text{CS}_{\text{before}} = 25 - 36 = -\$11$.

            [[fig:loss]]

            The red loss has **two pieces**, and you should be able to explain each:
            - **Rectangle** ($\$10$): on the 5 units still bought, each costs \$2 more. $5 \times 2 = 10$.
            - **Triangle** ($\$1$): the 6th unit is no longer bought, so the surplus on it is lost. $\tfrac12 \times 1 \times 2 = 1$.

            Total loss $= 10 + 1 = 11$ ✓.

            !!intuition The sign tells the story
              Price up → consumers are worse off → $\Delta CS < 0$. Price down → $\Delta CS > 0$. If your sign disagrees with this, recheck the order of subtraction (after − before).
          `, { loss: { svg: lossFig, cap: 'Price rises from \\$8 to \\$10. Red: lost surplus (rectangle + triangle).' } }),
          Q(md`In the price-rise example, what does the red **rectangle** represent?`,
            ['Paying more on units still bought', 'Surplus lost on units no longer bought', 'Extra profit that the sellers lose', 'The new consumer surplus above \\$10'], 0,
            [null, 'That is the small triangle.', 'Sellers actually collect this money; it moves from buyers to sellers.', 'The new CS is the blue triangle above \\$10.'],
            md`Rectangle = (price increase) × (units still bought) $= 2 \times 5 = 10$. The triangle is the surplus on the unit that is no longer bought.`),
          RF(md`
            ### When the price falls

            Demand $P = 12.5 - 2.5Q$. The price falls from \$5 to **\$2.50**.

            | | Before ($P = \$5$) | After ($P = \$2.50$) |
            |---|---|---|
            | Quantity | $5 = 12.5 - 2.5Q \Rightarrow Q = 3$ | $Q = 4$ |
            | CS | $\tfrac12 \times 3 \times 7.5 = \$11.25$ | $\tfrac12 \times 4 \times 10 = \$20$ |

            $\Delta CS = 20 - 11.25 = +\$8.75$. **Positive**, because a lower price makes buyers better off.

            [[fig:gain]]

            The green gain is again a rectangle plus a triangle: $3 \times 2.50 = 7.50$ (paying less on the 3 old units) plus $\tfrac12 \times 1 \times 2.50 = 1.25$ (surplus on the new 4th unit). $7.50 + 1.25 = 8.75$ ✓.
          `, { gain: { svg: gainFig, cap: 'Price falls from \\$5 to \\$2.50. Green: gained surplus.' } }),
          P({ q: md`Demand $P = 20 - 2Q$. The price **falls** from \$10 to \$6. Find the new quantity, the new CS, and $\Delta CS$.`,
            parts: [N('Q_{\\text{new}}', 7), N('CS_{\\text{new}}', 49), N('\\Delta CS', 24)],
            hints: ['Old: $Q = 5$, CS = 25.', 'New CS $= \\tfrac12 \\times 7 \\times (20 - 6)$.'],
            sol: md`New $Q$: $6 = 20 - 2Q \Rightarrow Q = 7$. New CS $= \tfrac12 \times 7 \times 14 = 49$. Old CS (at \$10) $= 25$. $\Delta CS = 49 - 25 = +24$. Pieces: rectangle $5 \times 4 = 20$ plus triangle $\tfrac12 \times 2 \times 4 = 4$.` }),
          P({ q: md`Rocky again: $q = 100 - p$ (cents). The price of milk rises from 50¢ to **60¢**. How much consumer surplus does he lose? Give $\Delta CS$ in cents (it should be negative).`,
            parts: [N('q_{\\text{new}}', 40), N('CS_{\\text{new}}\\ (\\text{cents})', 800), N('\\Delta CS\\ (\\text{cents})', -450)],
            hints: ['Old CS = 1250¢.', 'New CS $= \\tfrac12 \\times 40 \\times (100 - 60)$.'],
            sol: md`$q = 100 - 60 = 40$. New CS $= \tfrac12 \times 40 \times 40 = 800$¢. $\Delta CS = 800 - 1250 = -450$¢ $= -\$4.50$. Pieces: rectangle $40 \times 10 = 400$ plus triangle $\tfrac12 \times 10 \times 10 = 50$.` }),
          P({ q: md`Demand $Q = 60 - 4P$. The price rises from \$5 to \$10.`,
            parts: [N('Q\\text{ at }\\$5', 40), N('Q\\text{ at }\\$10', 20), N('CS\\text{ at }\\$5', 200), N('CS\\text{ at }\\$10', 50), N('\\Delta CS', -150)],
            hints: ['Choke price: $60 - 4P = 0 \\Rightarrow P = 15$.', 'CS at \\$5 $= \\tfrac12 \\times 40 \\times (15 - 5)$.'],
            sol: md`Choke price \$15. At \$5: $Q = 40$, CS $= \tfrac12(40)(10) = 200$. At \$10: $Q = 20$, CS $= \tfrac12(20)(5) = 50$. $\Delta CS = 50 - 200 = -150$. Check by pieces: rectangle $20 \times 5 = 100$, triangle $\tfrac12 \times 20 \times 5 = 50$, total 150 ✓.` }),

          R(md`
            ### What consumer surplus does, and does not, measure

            - It is a **net benefit**, not spending. The money you paid is subtracted out.
            - It is in **dollars**, not "utils". Subtracting utility numbers never gives a dollar amount.
            - It is **useful but not exact**. It uses the ordinary demand curve, along which utility changes as the price changes. The exact measures, CV and EV (next lesson), hold utility fixed.
          `),
          Q(md`Which statement about consumer surplus is **true**?`,
            ['It is a dollar measure, but only approximate', 'It equals total spending on the good', 'It equals the change in the consumer’s utility number', 'It is an exact measure that holds utility fixed'], 0,
            [null, 'Spending is subtracted out of CS.', 'Utility numbers have no dollar meaning.', 'That describes CV and EV, not CS.'],
            md`CS is a money measure of net benefit. Because it comes from ordinary demand (utility moves along it), it is an approximation; CV and EV are the exact measures.`),
          G('cs_mix', { need: 5 }),
        ],
      },
      // ------------------------------------------------------------------ l9
      {
        id: 'l9', title: 'Compensating and equivalent variation',
        steps: [
          R(md`
            ### The question CV and EV answer

            Pizza gets more expensive. You are worse off. **By how many dollars?**

            ΔCS gives a rough answer. CV and EV give exact answers by asking an **income question**: how much money would make up for the change, or be just as bad as the change?

            Both use the same picture you already know: budget lines and indifference curves. The trick is **which prices** and **which indifference curve** you use.
          `),
          RF(md`
            ### The setup we will use all lesson

            Jesse buys pizza ($q_1$) and soda ($q_2$) with $U = q_1^{0.4}q_2^{0.6}$, income \$30, soda \$1. Pizza **doubles** from \$1 to \$2.

            Cobb–Douglas shortcut: $q_1 = 0.4m/p_1$, $q_2 = 0.6m/p_2$.

            - **A** (before): $q_1 = 0.4(30)/1 = 12$, $q_2 = 0.6(30)/1 = 18$. Budget: $q_1 + q_2 = 30$.
            - **B** (after): $q_1 = 0.4(30)/2 = 6$, $q_2 = 18$ (unchanged). Budget: $2q_1 + q_2 = 30$.

            The budget line pivots in around the soda intercept, and Jesse drops to a lower indifference curve ($U_B < U_A$).

            [[fig:j]]

            Two imaginary budget lines:
            - **CV line** (green, dashed): **parallel to the new** line, pushed **out** until it just touches the **original** curve $U_A$. Touches at **C**.
            - **EV line** (purple, dashed): **parallel to the old** line, pushed **in** until it just touches the **new** curve $U_B$. Touches at **D**.
          `, { j: { svg: jesseFig, cap: 'A: before. B: after. C: new prices, old utility. D: old prices, new utility.' } }),
          Q(md`In Jesse’s graph, the CV budget line is parallel to which line?`, ['The new budget line', 'The original budget line', 'The EV budget line', 'The soda axis'], 0,
            [null, 'That is the EV line’s partner.', 'The EV line is parallel to the old line, so they are not parallel to each other here.', 'Budget lines are never vertical here.'],
            md`CV uses the **new prices**, so its slope matches the **new** budget line. It is shifted out until it touches the original indifference curve.`),
          Q(md`Point **D** is where…`, ['the old-price line touches the new indifference curve', 'the new-price line touches the old indifference curve', 'the new budget line touches the new indifference curve', 'the old budget line touches the old indifference curve'], 0,
            [null, 'That describes C.', 'That describes B.', 'That describes A.'],
            md`D sits on the EV line: original prices (parallel to the old line), new utility $U_B$.`),

          R(md`
            ### Compensating variation (CV)

            **Question:** after the price has changed, how much money must we **give** Jesse so he can get back to his **original** happiness?

            - Prices: **new** (the change already happened).
            - Utility held fixed: **original** ($U_A$).
            - Graph: shift the **new** budget line out until it touches $U_A$ (point C).
            - $CV = m_C - m$, where $m_C$ is the income on the CV line.

            For a **price increase**, Jesse must be **given** money (CV > 0).
            For a **price decrease**, CV is the money you could **take away** and leave him as happy as before.

            !!key Memory hook for CV
              "**C**ompensate me for what happened." Use the **new** prices and get me back to my **old** utility.
          `),
          R(md`
            ### Equivalent variation (EV)

            **Question:** before the price changes, how much money could we **take** from Jesse that would hurt him exactly as much as the price increase?

            - Prices: **old** (the change has not happened yet).
            - Utility held fixed: **new** ($U_B$).
            - Graph: shift the **old** budget line in until it touches $U_B$ (point D).
            - $EV = m - m_E$, where $m_E$ is the income on the EV line.

            For a **price increase**, money is **taken away**. It is what he would give up to **avoid** the increase.
            For a **price decrease**, EV is money he would need to be **given** at the old prices to be as happy as after the decrease.

            !!key Memory hook for EV
              "What is **equivalent** to the change?" Use the **old** prices and land on the **new** utility.
          `),
          R(md`
            ### The table to memorize

            | Measure | Prices used | Utility held fixed | Price increase: income is… | Graph move |
            |---|---|---|---|---|
            | **CV** | **new** | **original** | **given** | from B to C |
            | **EV** | **old** | **new** | **taken away** | from A to D |

            !!trap Prices and utility are always opposite
              CV pairs **new** prices with **old** utility. EV pairs **old** prices with **new** utility. Neither one uses both "new" or both "old"; if your answer does, it is wrong.
          `),
          Q(md`Which measure uses the **new prices** and the **original** utility level?`, ['CV', 'EV', 'ΔCS', 'Both CV and EV'], 0,
            [null, 'EV is the reverse: old prices, new utility.', 'ΔCS does not hold utility fixed.', 'They hold opposite things fixed.'],
            md`CV: new prices, original utility. EV: original prices, new utility.`),
          Q(md`Pizza’s price **rises**. For EV, is income given to Jesse or taken away?`, ['Taken away', 'Given', 'Neither: EV is always zero', 'Given, then taken back'], 0,
            [null, 'That is CV for a price increase.', 'EV is only zero if the price change does not matter to him.', 'There is just one income change.'],
            md`EV moves the **old** budget line **in** to the lower curve $U_B$: income is **taken away**. It is what he would give up to avoid the increase.`),
          Q(md`Which move on the graph is the **compensating variation**?`, ['From B to C', 'From A to C', 'From B to D', 'From A to D'], 0,
            [null, 'A and C are on the same curve but different lines; CV starts from the new situation B.', 'D is the EV point.', 'That is EV.'],
            md`CV starts **after** the change (B, on the new line) and adds income at new prices until he is back on $U_A$ (C). EV is from A to D.`),
          Q(md`Which move on the graph is the **equivalent variation**?`, ['From A to D', 'From B to C', 'From A to C', 'From B to D'], 0,
            [null, 'That is CV.', 'C uses new prices.', 'B and D are on the same curve; EV starts from the old line through A.'],
            md`EV starts from the **old** budget line (A) and removes income at old prices until he reaches the new curve $U_B$ (D).`),
          Q(md`The price of a good **falls**. What does CV measure?`,
            ['Income taken after the fall to return to the old utility', 'Income that must be given after the fall to reach the old utility', 'Income given before the fall to reach the new utility level', 'Income taken before the fall to reach the old utility level'], 0,
            [null, 'After a price fall, the consumer is already happier; we do not need to give them anything.', 'That mixes old prices with new utility, which is EV.', 'At old prices with old utility nothing changes.'],
            md`CV always uses new prices and old utility. After a price fall the consumer is better off, so we would have to **take** income away to bring them back down to the old utility.`),

          R(md`
            ### Jesse in numbers

            You will not need the formula for this on the exam, but seeing the numbers builds intuition. For this Cobb–Douglas setup:

            - **C**: Jesse needs income $m_C = 30 \times 2^{0.4} \approx \$39.59$ at the new prices to reach $U_A$. So $CV = 39.59 - 30 \approx \$9.59$ **given**.
            - **D**: at the old prices, income $m_E = 30 \times 2^{-0.4} \approx \$22.74$ reaches $U_B$. So $EV = 30 - 22.74 \approx \$7.26$ **taken away**.
            - $|\Delta CS|$: the area to the left of his pizza demand between \$1 and \$2 is about \$8.32.

            $$CV\ (9.59) \;>\; |\Delta CS|\ (8.32) \;>\; EV\ (7.26)$$

            !!key How CV, ΔCS, and EV compare
              ΔCS always lies **between** CV and EV.
              - **Normal good:** $CV > |\Delta CS| > EV$.
              - **Inferior good:** the order flips: $CV < |\Delta CS| < EV$.
              (Sizes are compared, which is why we use absolute values.)

            !!trap The rule is stated for a price increase
              For a **price decrease** of a normal good the roles swap: $EV > |\Delta CS| > CV$. One way to remember both: whichever measure is computed at the **higher** prices is the bigger one.

            !!intuition Why CV is the big one for a normal good
              CV hands Jesse the money **after** prices have risen, at the expensive new prices. Getting back to the old utility at high prices takes more cash than the EV comparison made at the old, cheap prices.
          `),
          Q(md`A good is **normal**, and its price rises. Which ordering is correct?`, ['CV > |ΔCS| > EV', 'EV > |ΔCS| > CV', '|ΔCS| > CV > EV', 'CV = EV = |ΔCS|'], 0,
            [null, 'That is the inferior-good order.', 'ΔCS is always in the middle.', 'They are equal only with no income effect.'],
            md`For a normal good, $CV > |\Delta CS| > EV$. Jesse’s numbers: 9.59 > 8.32 > 7.26.`),
          Q(md`For an **inferior** good, which ordering is correct?`, ['EV > |ΔCS| > CV', 'CV > |ΔCS| > EV', 'CV > EV > |ΔCS|', '|ΔCS| > EV > CV'], 0,
            [null, 'That is the normal-good order.', 'ΔCS always lies between the two.', 'ΔCS always lies between the two.'],
            md`Inferior good: $CV < |\Delta CS| < EV$, the reverse of the normal case. ΔCS stays in the middle either way.`),
          Q(md`Why is ΔCS called an **approximation** while CV and EV are **exact**?`,
            ['CV and EV fix a utility level; ΔCS does not', 'ΔCS ignores the price of the other good entirely', 'ΔCS is measured in utils rather than in dollars', 'CV and EV ignore income effects completely'], 0,
            [null, 'That is not the issue.', 'ΔCS is in dollars.', 'CV and EV include income effects; that is why they differ from each other.'],
            md`CV and EV each pin down one indifference curve and ask an exact income question. ΔCS comes from the ordinary demand curve, along which utility changes as the price moves.`),
          P({ q: md`Fill in the table for a **price increase**.`,
            parts: [FIX('CV uses which prices?', ['new', 'original'], 0, [null, 'CV is measured after the change, at new prices.']),
              FIX('CV holds which utility fixed?', ['new', 'original'], 1, ['CV restores the original utility.', null]),
              FIX('For CV, income is…', ['given', 'taken away'], 0, [null, 'After a price increase he is worse off; restoring him takes extra money.']),
              FIX('EV uses which prices?', ['new', 'original'], 1, ['EV is measured before the change, at old prices.', null]),
              FIX('EV holds which utility fixed?', ['new', 'original'], 0, [null, 'EV lands on the new (lower) utility.']),
              FIX('For EV, income is…', ['given', 'taken away'], 1, ['Moving the old line down to a lower curve removes income.', null])],
            sol: md`| | Prices | Utility fixed | Price increase |
            |---|---|---|---|
            | CV | new | original | given |
            | EV | original | new | taken away |` }),
          P({ q: md`Same table, but now the price **falls**.`,
            parts: [FIX('For CV, income is…', ['given', 'taken away'], 1, ['After a price fall he is better off; to get back to the old utility you remove income.', null]),
              FIX('For EV, income is…', ['given', 'taken away'], 0, [null, 'At old prices, reaching the new (higher) utility requires extra income.']),
              FIX('The CV line is parallel to…', ['the new budget line', 'the old budget line'], 0, [null, 'CV uses new prices.']),
              FIX('The EV line touches…', ['the new indifference curve', 'the old indifference curve'], 0, [null, 'EV holds the new utility.'])],
            sol: md`For a price **decrease** the "given / taken" answers flip, but the prices and utility each measure uses never change: CV = new prices + old utility (income taken away); EV = old prices + new utility (income given).` }),
          P({ q: md`Quick numbers. $m = \$30$. The compensated income on the CV line is \$39.59 and the income on the EV line is \$22.74. Find CV and EV as positive dollar amounts.`,
            parts: [N('CV', 9.59), N('EV', 7.26)],
            sol: md`$CV = m_C - m = 39.59 - 30 = 9.59$. $EV = m - m_E = 30 - 22.74 = 7.26$.` }),
          G('cvev', { need: 6 }),
        ],
      },
    ],
  });
})();

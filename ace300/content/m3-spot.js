/* Mini Exam 3 · Drill: spot the technique. Plan-only cards: an exam-style problem with real numbers, then only the
   question "what is your first move?" (and often "then what?"). No answer boxes: the point is recognition. Sets 1–5 follow
   the Parts; the mix serves a random card from a separate pool through gen('m3_spot_any'). */
(function () {
  'use strict';
  const { R, P, G } = C;
  const { plan, gen, pick } = M3;
  // a plan-only card: the problem text and one or more plan steps
  const S = (q, ...steps) => P({ q, plan: steps.length > 1 ? steps : steps[0] });
  const intro = (title, body) => R(md`
    ### ${title}

    **How to use this set.** Read the problem. Before you look at the options, say your first move out loud (or write the first equation). Then pick, and read why the other options fail: each one is a mistake real students make on this exam.

    ${body}
  `);

  // ------------------------------------------------------------------ the pool for the mixed drill (m3_spot_any)
  const POOL = [];
  const add = (q, ...steps) => POOL.push({ q, steps });
  // pool, part 1: profit, inputs, short-run supply
  add(md`A dentist's practice takes in \$400,000. Staff, rent and supplies cost \$250,000. She could earn \$120,000 at a clinic, and the \$200,000 of her own savings tied up in equipment could earn 5% a year elsewhere. Find her economic profit.`,
    plan('Which costs count?', 'Explicit \\$250,000, plus the forgone \\$120,000 salary, plus the forgone interest $0.05 \\times 200{,}000 = 10{,}000$', [
      ['Only the \\$250,000', 'That gives accounting profit. Economic profit also charges for her time and her money.'],
      ['The \\$200,000 of savings itself', 'The money is not used up; what she gives up is the **return** it could earn, \\$10,000 a year.'],
      ['Explicit costs and the salary, but not the interest', 'Owner-supplied capital has an opportunity cost too.'],
    ], 'Economic profit $= 400 - 250 - 120 - 10 = 20$ thousand: she beats her alternatives.'));
  add(md`A firm's short-run output is $q = 12\sqrt{x_1}$. Output sells for \$5 and the variable input costs \$15 a unit. How much $x_1$ does it use?`,
    plan('First equation?', '$p\\,MP_1 = w_1$: $5 \\cdot \\dfrac{6}{\\sqrt{x_1}} = 15$', [
      ['$\\dfrac{6}{\\sqrt{x_1}} = 15$', 'Forgot the price: MP is in units of output, the wage in dollars.'],
      ['$5 \\cdot \\dfrac{12}{\\sqrt{x_1}} = 15$', 'The power rule brings down ½: $MP_1 = 12 \\cdot \\tfrac12 x_1^{-1/2} = 6/\\sqrt{x_1}$.'],
      ['$5 \\cdot 12\\sqrt{x_1} = 15x_1$', 'That sets revenue equal to input cost, a break-even idea, not the marginal rule.'],
    ], '$\\sqrt{x_1} = 2 \\Rightarrow x_1 = 4$, $q = 24$.'));
  add(md`The wage a firm pays falls while the output price stays the same. Using isoprofit lines, what happens to its short-run plan?`,
    plan('Which way?', 'Isoprofit lines get flatter (slope $w_1/p$ falls); the tangency moves right: more labor, more output', [
      ['Steeper lines; less labor', 'A lower $w_1$ makes $w_1/p$ smaller: flatter.'],
      ['Only profit changes; the plan is the same', 'The marginal condition $MP_1 = w_1/p$ changes, so the plan moves.'],
      ['Less output, because profit is already high', 'Cheaper labor makes more workers worth hiring.'],
    ], 'Hire until $MP_1$ falls to the new, lower $w_1/p$.'));
  add(md`In the long run a competitive firm chooses both inputs. Which conditions describe its choice, and what do they imply?`,
    plan('Which conditions?', '$p\\,MP_1 = w_1$ and $p\\,MP_2 = w_2$; dividing gives $MP_1/MP_2 = w_1/w_2$: it also minimizes cost', [
      ['Only $p\\,MP_1 = w_1$', 'That is the short run, with input 2 fixed.'],
      ['$MP_1 = MP_2$', 'The inputs have different prices; the ratio of MPs matches the ratio of prices.'],
      ['$P = \\min AVC$', 'That is a shutdown test, not an input choice.'],
    ], 'Profit maximization implies cost minimization (the tangency $MRTS = w_1/w_2$).'));
  add(md`A price-taking firm has increasing returns to scale everywhere: $q = x_1 x_2$. A classmate solves for its profit-maximizing size.`,
    plan('What is the catch?', 'With increasing returns profit keeps rising with scale: there is no finite optimum', [
      ['It has one best size, found from $p\\,MP_i = w_i$', 'Here those conditions do not find a maximum: doubling both inputs more than doubles output, so profit has no top.'],
      ['It produces nothing', 'Only if the price never covers cost; with IRS, cost per unit keeps falling as it grows.'],
      ['It earns exactly zero profit', 'That is constant returns with $P = LRAC$.'],
    ], 'Decreasing returns: one best scale. Increasing: none. Constant: depends on $P$ vs LRAC.'));
  add(md`A competitive firm has $C(q) = 100 + 2q + 0.5q^2$. The price is \$12. Find output and profit, and decide whether it stays open.`,
    plan('First equation?', '$12 = MC = 2 + q$', [
      ['$12 = AC$', 'That is break-even, not the best output.'],
      ['$12 = 2 + 0.5q$', 'The derivative of $0.5q^2$ is $q$.'],
      ['$MR = 12 - q$', 'A price taker’s MR is the price, 12.'],
    ], '$q = 10$; $\\pi = 120 - (100 + 20 + 50) = -50$.'),
    plan('Profit is $-50$. Stay open?', 'Yes: $P = 12$ exceeds min AVC $= 2$; closing would lose the \\$100 fixed cost', [
      ['No: it loses money', 'Closing loses \\$100, more than \\$50.'],
      ['No: $P < \\min AC$', 'That says it loses money; the shutdown test is AVC.'],
      ['Only if profit is positive', 'In the short run, compare the two losses.'],
    ], 'Operate at a loss now; in the long run it exits unless the price rises.'));
  add(md`A competitive firm has $C(q) = q^3 - 4q^2 + 10q + 20$. The price is \$5. What does it do?`,
    plan('What do you check first?', 'Min AVC: $AVC = q^2 - 4q + 10$ is lowest at $q = 2$, where it is \\$6', [
      ['Solve $5 = MC$ and produce there', 'First check the price covers min AVC; here it does not.'],
      ['Compare \\$5 with min AC', 'That decides profit versus loss, not operate versus shut down.'],
      ['Produce where $MC$ is lowest', 'There is no rule like that.'],
    ], '$5 < 6$: shut down, $q = 0$, loss $= F = 20$.'));
  add(md`On a firm's graph, the horizontal price line crosses its U-shaped MC curve at 2 units and at 9 units, and the price is above min AVC. How much does it produce?`,
    plan('Which crossing?', '9 units: the crossing where MC is rising', [
      ['2 units, the first crossing', 'Just past 2 units MC is below the price, so more output adds profit.'],
      ['5.5 units, halfway', 'There is nothing special about the midpoint.'],
      ['Wherever AC is lowest', 'Output comes from $P = MC$ on the rising branch.'],
    ], 'Between the crossings every unit has $MC < P$: keep going to 9.'));
  add(md`Firm A's inverse supply is $P = 10 + q_A$ and firm B's is $P = 10 + 2q_B$. Find the market's inverse supply.`,
    plan('How do you combine them?', 'Invert: $q_A = P - 10$, $q_B = (P - 10)/2$; add: $Q = 1.5(P - 10)$; invert back', [
      ['Add the inverses: $P = 20 + 3Q$', 'That adds prices. At one price, add quantities.'],
      ['Average them: $P = 10 + 1.5Q$', 'Averaging is not adding quantities.'],
      ['Use the flatter one only', 'Both sell at every price above \\$10.'],
    ], '$P = 10 + Q/1.5$: flatter than either firm’s curve.'));
  add(md`There are 60 identical firms, each with supply $q = P - 5$ for $P \ge 5$. Market demand is $Q = 1500 - 40P$. Find price, market quantity and output per firm.`,
    plan('First move?', 'Market supply $Q = 60(P - 5) = 60P - 300$, then set it equal to demand', [
      ['Set $P - 5 = 1500 - 40P$', 'That compares one firm with the whole market.'],
      ['$Q = (P - 5)/60$', 'Each of 60 firms adds its own $q$: multiply, do not divide.'],
      ['Set $P = 5$', '\\$5 is only where firms start supplying.'],
    ], '$100P = 1800 \\Rightarrow P = 18$, $Q = 780$, $q = 13$.'));
  // pool, part 2: long run, surplus, efficiency
  add(md`Identical firms have long-run cost $LRC(q) = q^2 + 16$. With free entry, what is the long-run price?`,
    plan('What do you find?', 'Min LRAC: $2q = q + 16/q$, so $q = 4$ and $P = LRAC(4) = 8$', [
      ['$P = LRMC = 2q$ at some given price', 'There is no given price: free entry pins it at min LRAC.'],
      ['$P = 16$', '16 is a cost total, not a price.'],
      ['Min AVC, which is 0', 'In the long run the 16 is avoidable by exiting, so the test uses LRAC.'],
    ], '$q^2 = 16 \\Rightarrow q = 4$; $P = 4 + 4 = 8$.'));
  add(md`Min LRAC is \$8 at $q = 4$. Market demand is $Q = 2000 - 100P$. How many firms survive in the long run?`,
    plan('Moves in order?', '$P = 8$; $Q = 2000 - 800 = 1200$; $n = 1200/4 = 300$', [
      ['$n = 2000/4$', '2000 is the demand intercept, not the quantity bought at \\$8.'],
      ['$n = 1200/8$', 'Divide by output per firm (4), not by the price.'],
      ['Set demand equal to one firm’s LRMC', 'The long-run price comes from min LRAC; demand only gives the total.'],
    ], '300 firms, each making 4 units at \\$8.'));
  add(md`In a constant-cost competitive industry, demand doubles permanently. Compare the new long-run equilibrium with the old one.`,
    plan('What changes?', 'Price unchanged at min LRAC, each firm still makes $q^*$, the number of firms roughly doubles', [
      ['Price doubles', 'Long-run supply is flat: entry absorbs the extra demand at the same price.'],
      ['Each firm doubles its output', 'Each firm stays at the bottom of LRAC; new firms supply the rest.'],
      ['Profit stays positive', 'Entry continues until profit is zero again.'],
    ], 'Long run: $P = \\min LRAC$, $q = q^*$, $n = Q/q^*$ rises.'));
  add(md`An industry's expansion bids up the wage of a scarce skilled input. What does that do to the long-run industry supply curve?`,
    plan('What shape?', 'It slopes up: as the industry grows, every firm’s costs rise, so min LRAC rises with output', [
      ['Still horizontal', 'Flat long-run supply needs **constant** input prices.'],
      ['It slopes down', 'Rising input prices raise costs, not lower them.'],
      ['It becomes vertical', 'Entry still adds output; it just costs more per unit.'],
    ], 'The three assumptions behind a flat curve: identical firms, free entry, constant input prices.'));
  add(md`A competitive firm earns zero economic profit at \$10, which equals its min LRAC. The owner asks whether to quit.`,
    plan('What is the answer?', 'No need: zero economic profit means she earns exactly her next-best option', [
      ['Quit: there is no profit', 'Her time and money are already paid their opportunity cost inside economic cost.'],
      ['Expand to earn a profit', 'At the bottom of LRAC, more output raises cost per unit above \\$10.'],
      ['Raise the price', 'A price taker cannot.'],
    ], 'Zero economic profit is the normal long-run state, not failure.'));
  add(md`Demand is $Q = 100 - 2P$. The price is \$20. Find consumer surplus.`,
    plan('What do you need first?', 'The choke price: set $Q = 0$, $P = 50$; then CS $= \\tfrac12(60)(50 - 20)$', [
      ['$\\tfrac12(60)(100 - 20)$', '100 is the quantity intercept; the triangle’s height is in dollars.'],
      ['$\\tfrac12(60)(20)$', 'That is the area under the price, not above it.'],
      ['$60 \\times 20$', 'That is spending.'],
    ], '$Q = 60$ at \\$20. CS $= 900$.'));
  add(md`Supply is $Q = 3P$. The price rises from \$20 to \$30. By how much does producer surplus rise?`,
    plan('Which shape?', 'A trapezoid between \\$20 and \\$30, left of supply: $\\tfrac12(60 + 90)(10)$', [
      ['A rectangle $10 \\times 90$', 'Units 60 to 90 do not all gain the full \\$10.'],
      ['A rectangle $10 \\times 60$', 'That leaves out the gain on the new units 60 to 90.'],
      ['$30 \\times 90 - 20 \\times 60$', 'That is the change in revenue; PS subtracts the cost of the new units.'],
    ], '$\\Delta PS = 750$ (from 600 to 1350).'));
  add(md`Demand $P = 100 - Q$, supply $P = 20 + Q$. A quota caps sales at 30 units. Find the DWL.`,
    plan('What are the base and height?', 'Base: $40 - 30$ (lost units). Height: demand minus supply at 30, $70 - 50$', [
      ['Height $70 - 60$', 'That is the price rise; the gap that is lost runs down to MC at 30, which is 50.'],
      ['Base 30', 'Only the 10 lost units count.'],
      ['Height 70', 'The triangle sits between demand and supply, not above zero.'],
    ], 'DWL $= \\tfrac12(10)(20) = 100$.'));
  add(md`A subsidy pushes a competitive market past its efficient quantity. A classmate says: "Buyers and sellers both gain, so welfare must rise."`,
    plan('What is wrong?', 'The extra units cost more to make than buyers value them; with the subsidy’s cost counted, total welfare falls', [
      ['Nothing: both groups gain', 'Their gains come from taxpayers. Counting everyone, the extra units destroy value.'],
      ['Buyers lose', 'Buyers pay less and buy more: they gain.'],
      ['There is no DWL because more is traded', 'More trade past $MB = MC$ creates DWL.'],
    ], 'Overproduction DWL: units where $MC > MB$.'));
  add(md`A competitive firm has no fixed costs (long run). A classmate correctly finds $PS = TR - VC = 500$, then reports profit as 300.`,
    plan('What is wrong?', 'With no fixed cost, $\\pi = PS - F = PS$: profit is 500 too', [
      ['Nothing: they always differ', 'They differ only by the fixed cost.'],
      ['PS should be 300', 'PS was computed correctly; with $F = 0$, profit equals it.'],
      ['Profit should be 800', 'Profit never exceeds PS.'],
    ], 'Short run: $\\pi = PS - F$. Long run: $\\pi = PS$.'));
  // pool, part 3: taxes, ceilings, floors, supports (market Qd = 100 - P, Qs = 4P: P* = 20, Q* = 80)
  add(md`$Q_d = 100 - P$ and $Q_s = 4P$. A \$5 per-unit tax is imposed. Who bears more of it?`,
    plan('How do you decide?', 'Solve the wedge: $100 - (P_p + 5) = 4P_p$ gives $P_p = 19$, $P_c = 24$; consumers bear $4/5 = 80\\%$', [
      ['Sellers: they hand the tax to the government', 'Legal liability does not decide incidence.'],
      ['Half each', 'Only when both sides respond equally to price.'],
      ['Sellers: supply is more responsive', 'The **more** responsive side escapes more of the tax; the less responsive side (buyers here) bears more.'],
    ], 'Consumer share $(24 - 20)/5 = 80\\%$, producer share $(20 - 19)/5 = 20\\%$.'));
  add(md`Same tax ($P_c = 24$, $P_p = 19$, $Q = 76$; before: $Q^* = 80$). Find revenue and DWL.`,
    plan('Which formulas?', 'Revenue $= t \\times Q_{\\text{tax}} = 5 \\times 76$; DWL $= \\tfrac12 \\times 5 \\times (80 - 76)$', [
      ['Revenue $= 5 \\times 80$', 'Only the 76 traded units are taxed.'],
      ['DWL $= \\tfrac12 \\times 5 \\times 76$', 'The base is the lost quantity, 4.'],
      ['DWL $= 5 \\times 4$', 'It is a triangle: include the ½.'],
    ], 'Revenue 380; DWL 10.'));
  add(md`A per-unit tax is collected from buyers. On the supply-and-demand graph, which curve do you shift, and which way?`,
    plan('Which shift?', 'Demand shifts **down** by $t$: buyers will pay sellers $t$ less than before for each quantity', [
      ['Supply shifts up by $t$', 'That is how you draw a tax collected from sellers (same outcome, different picture).'],
      ['Demand shifts up by $t$', 'Buyers who must also pay the tax will pay sellers less, not more.'],
      ['No curve shifts; draw a horizontal line', 'That is a price control, not a tax.'],
    ], 'Either shift gives the same $P_c$, $P_p$ and $Q$.'));
  add(md`$Q_d = 100 - P$ and $Q_s = 4P$. The government caps the price at \$15. How many units trade, and what is the shortage?`,
    plan('Which quantity trades?', '$Q_s(15) = 60$; the shortage is $Q_d - Q_s = 85 - 60 = 25$', [
      ['$Q_d(15) = 85$', 'Sellers make only 60 at \\$15.'],
      ['80', 'The ceiling is below \\$20, so it binds.'],
      ['25', 'That is the shortage, not trade.'],
    ], 'Binding ceiling: sellers are the short side.'));
  add(md`Same market. A minimum price of \$25 is set, and nobody buys the extra. How many units sell?`,
    plan('Which quantity?', '$Q_d(25) = 75$; producers would like to sell 100', [
      ['$Q_s(25) = 100$', 'Buyers take only 75 at \\$25.'],
      ['80', 'The floor binds (25 > 20).'],
      ['25', 'That is the excess supply.'],
    ], 'Binding floor: buyers are the short side.'));
  add(md`Same market and floor (\$25), but now the government buys any excess. What does it spend?`,
    plan('What does it buy?', 'The gap $Q_s(25) - Q_d(25) = 100 - 75 = 25$ units, at \\$25 each', [
      ['Nothing: it is a floor', 'With a support the government buys the excess.'],
      ['All 100 units', 'Consumers still buy 75.'],
      ['25 units at \\$20', 'It pays the support price, \\$25.'],
    ], 'Spending $= 25 \\times 25 = 625$; subtract it in total welfare.'));
  add(md`Same market. A price ceiling is set at \$22.`,
    plan('What happens?', 'Nothing: a ceiling above $P^* = 20$ does not bind', [
      ['A shortage appears', 'At \\$20 buyers and sellers already agree; the ceiling allows that price.'],
      ['The price rises to \\$22', 'A ceiling is a maximum, not a target.'],
      ['Excess supply of 10', 'That would happen only if the price were **held** at \\$22.'],
    ], 'Non-binding: $P = 20$, $Q = 80$.'));
  add(md`Same market ($S$: $P = Q/4$), floor at \$25 with 75 units sold. Find the DWL.`,
    plan('What is the height of the triangle?', 'The floor minus the supply height at 75: $25 - 75/4 = 6.25$', [
      ['$25 - 20$', 'That is only the part above the old price. The triangle reaches down to supply at $Q = 75$.'],
      ['$100 - 75 = 25$', 'That is excess supply, a quantity.'],
      ['The floor, 25', 'The triangle is between demand and supply, not above zero.'],
    ], 'DWL $= \\tfrac12(80 - 75)(6.25) = 15.625$.'));
  add(md`In the lecture market, raising the tax from \$2 to \$4 raised the DWL from \$5 to \$20. Explain why it quadrupled.`,
    plan('Why four times?', 'Both the height (the tax) and the base (the lost quantity) doubled', [
      ['Revenue doubled', 'Revenue went from 190 to 360; the DWL is a separate triangle.'],
      ['Demand became more elastic', 'The curves did not change.'],
      ['It is a coincidence of the numbers', 'With straight lines, DWL $= \\tfrac12 t \\Delta Q$ and $\\Delta Q$ grows in proportion to $t$: DWL grows with $t^2$.'],
    ], 'Twice the tax, twice the lost units: four times the triangle.'));
  add(md`A classmate computes welfare under a price support as $W = CS + PS$ and finds it went up.`,
    plan('What is missing?', 'Government spending on the surplus: $W = CS + PS - G$', [
      ['Tax revenue', 'A support raises no revenue; it spends.'],
      ['The DWL, added in', 'DWL is the fall in $W$, never added to it.'],
      ['Nothing: supports raise welfare', 'Counting taxpayers, DS9’s support turned $W$ from 9000 into $-2250$.'],
    ], 'Taxpayers fund the purchases: subtract them.'));
  // pool, part 4: monopoly, monopoly taxes, regulation
  add(md`A monopolist faces $P = 200 - 4Q$ and has constant $MC = 40$. Find its price.`,
    plan('First equation?', '$200 - 8Q = 40$ ($MR = MC$), then the price from demand', [
      ['$200 - 4Q = 40$', 'That is $P = MC$, the competitive point.'],
      ['$200 - 8Q = 0$', 'That ignores cost: revenue max.'],
      ['$200 - 2Q = 40$', 'MR has **twice** the slope of demand, not half.'],
    ], '$Q = 20$, $P = 200 - 80 = 120$.'));
  add(md`A monopolist faces demand $Q = 300 - 2P$ and has $MC = 30$.`,
    plan('What comes first?', 'Invert: $P = 150 - Q/2$, so $MR = 150 - Q$', [
      ['$MR = 300 - 4P$', 'Double the slope of the **inverse** demand, $P = a - bQ$.'],
      ['$MR = 150 - Q/2$', 'That is inverse demand itself.'],
      ['$MR = 300 - 2P$', 'That is demand.'],
    ], '$150 - Q = 30 \\Rightarrow Q = 120$, $P = 90$.'));
  add(md`At a monopolist's profit-maximizing output, the price elasticity of demand is $-5$ and $MC = \$40$. What price does it charge?`,
    plan('Which relation?', 'Lerner: $\\dfrac{P - MC}{P} = -\\dfrac{1}{\\varepsilon} = 0.2$', [
      ['$P = MC = 40$', 'That is competition. A monopolist marks up over MC.'],
      ['$P = 40 \\times 5 = 200$', 'The markup comes from $L = 1/5$, not multiplying by 5.'],
      ['$P = 40(1 - 1/5)$', 'That puts the price below MC.'],
    ], '$P - 40 = 0.2P \\Rightarrow 0.8P = 40 \\Rightarrow P = 50$.'));
  add(md`A monopolist finds that at its current output the price elasticity of demand is $-0.5$. What should it do?`,
    plan('Which way?', 'Raise the price (cut output): on the inelastic part, MR is negative', [
      ['Lower the price to sell more', 'With inelastic demand, a lower price **lowers** revenue and raises cost.'],
      ['Stay: inelastic demand is ideal', 'MR $= P(1 - 2) < 0$ here: the last units lose revenue.'],
      ['Set $P = MC$', 'That is the competitive rule.'],
    ], 'Cutting output raises revenue and saves cost until demand becomes elastic.'));
  add(md`$P = 200 - 4Q$, $MC = 40$, monopoly at $Q = 20$, $P = 120$. Find the DWL.`,
    plan('What is the benchmark?', '$P = MC$: $200 - 4Q = 40$, $Q_c = 40$; DWL $= \\tfrac12(40 - 20)(120 - 40)$', [
      ['$Q_c$ from $MR = 0$', 'Revenue max is not efficiency.'],
      ['Height $120 - 80$', 'The triangle runs from demand (120) down to MC (40).'],
      ['DWL $= (120 - 40) \\times 20$', 'That rectangle is the monopoly’s PS.'],
    ], 'DWL $= 800$.'));
  add(md`
    A monopolist's demand:

    | $Q$ | 1 | 2 | 3 | 4 |
    |---|---|---|---|---|
    | $P$ (\$) | 50 | 45 | 40 | 35 |

    Marginal cost is \$25. What does it choose?
  `,
    plan('What do you compute?', 'MR from the change in TR: TR 50, 90, 120, 140, so MR 50, 40, 30, 20', [
      ['Sell while $P \\ge 25$: all 4', 'That is the competitive rule; a monopolist compares MR with MC.'],
      ['Pick the largest TR', 'That ignores the \\$25 cost.'],
      ['Use AR = TR/Q', 'Average revenue is just the price.'],
    ], 'Sell while $MR \\ge 25$: $Q = 3$, $P = 40$.'));
  add(md`A monopolist with $P = 200 - 4Q$ and $MC = 40$ faces an \$8 per-unit tax.`,
    plan('First equation?', '$MR = MC + t$: $200 - 8Q = 48$', [
      ['$200 - 4Q = 48$', 'That is the competitive response.'],
      ['$200 - 8Q = 32$', 'The tax raises the firm’s cost of each unit.'],
      ['Keep $Q = 20$ and add 8 to the price', 'It reoptimizes: less output.'],
    ], '$Q = 19$, $P_c = 124$ (up 4: pass-through ½), $P_p = 116$.'));
  add(md`A monopolist with $P = 200 - 4Q$ and $MC = 40$ faces a 20% ad valorem tax paid by consumers.`,
    plan('What does the firm maximize against?', 'Effective demand $P_p = 0.8(200 - 4Q)$, effective MR $= 160 - 6.4Q$', [
      ['$P_p = 200 - 4Q - 20$', 'An ad valorem tax is a percent: multiply by $(1 - v)$.'],
      ['$P_p = 200 - 4Q - 0.2$', 'Same slip: 20% of the price, not 0.2 dollars.'],
      ['$MR = 200 - 8Q$, then multiply the price by 1.2', 'The firm chooses $Q$ knowing it keeps only 80%.'],
    ], '$160 - 6.4Q = 40 \\Rightarrow Q = 18.75$; $P_c = 125$ from demand; $P_p = 100$.'));
  add(md`A natural monopoly faces $P = 60 - Q$ with $C(Q) = 400 + 10Q$. Regulators set price equal to average cost.`,
    plan('Which equation and which root?', '$60 - Q = 10 + 400/Q$, i.e. $Q^2 - 50Q + 400 = 0$: roots 10 and 40, keep 40', [
      ['$60 - Q = 10$', 'That is marginal-cost pricing.'],
      ['Keep $Q = 10$', 'Both roots break even; the larger has more output and a lower price.'],
      ['$60 - 2Q = 10 + 400/Q$', 'The regulated price sits on demand, not MR.'],
    ], '$Q = 40$, $P = 20$, $\\pi = 0$.'));
  add(md`Same utility ($P = 60 - Q$, $C = 400 + 10Q$) under a price ceiling at marginal cost.`,
    plan('What happens to profit?', '$P = 10$, $Q = 50$: $\\pi = 500 - 900 = -400$, the whole fixed cost', [
      ['Zero profit', 'Only average-cost pricing breaks even.'],
      ['A profit, since it sells more', 'Each unit covers only its marginal cost; the fixed 400 is unpaid.'],
      ['It depends on demand elasticity', 'Here $\\pi = (P - AC)Q = -F$ exactly.'],
    ], 'Without a \\$400 subsidy, it exits in the long run.'));
  add(md`A monopolist faces constant-elasticity demand with $\varepsilon = -1.5$. What is the pass-through of a per-unit tax?`,
    plan('Which formula?', '$dP_c/dt = \\dfrac{e}{e - 1} = \\dfrac{1.5}{0.5} = 3$', [
      ['$\\tfrac12$', 'That is for linear demand.'],
      ['1', 'That is a competitive market with flat supply.'],
      ['$\\dfrac{e - 1}{e}$', 'Upside down: with constant elasticity pass-through exceeds 1.'],
    ], 'Each \\$1 of tax raises the consumer price by \\$3.'));
  add(md`A regulator wants a natural monopoly to produce the efficient output **and** stay in business. What policy does that?`,
    plan('Which policy?', 'Price at marginal cost plus a lump-sum subsidy equal to the fixed cost', [
      ['Price at average cost', 'That covers cost but leaves output below the efficient level.'],
      ['Leave it unregulated', 'It restricts output: the largest DWL.'],
      ['A per-unit tax', 'That lowers output further.'],
    ], 'The subsidy covers the loss ($-F$) that $P = MC$ creates.'));
  add(md`What keeps a natural monopoly a monopoly even without any law against entry?`,
    plan('Which barrier?', 'Economies of scale: AC falls over the whole market, so a second firm would have higher costs', [
      ['A patent', 'That is a legal barrier.'],
      ['A government license', 'Also legal.'],
      ['Collusion with rivals', 'There are no rivals to collude with; that is a different story.'],
    ], 'A large fixed cost spread over all output gives the incumbent the lowest AC.'));
  add(md`At a monopolist's output the price is \$40 and the price elasticity of demand is $-2$. Find marginal revenue.`,
    plan('Which formula?', '$MR = P\\left(1 + \\dfrac{1}{\\varepsilon}\\right) = 40(1 - 0.5)$', [
      ['$MR = P(1 + \\varepsilon) = 40(1 - 2)$', 'The formula has $1/\\varepsilon$.'],
      ['$MR = P = 40$', 'That is a price taker.'],
      ['$MR = P/\\varepsilon$', 'Not on the formula sheet, and the sign is wrong.'],
    ], '$MR = 20$.'));
  add(md`A monopolist's marginal cost rises by \$10 at every output because a supplier raised prices. How do you find its new output?`,
    plan('Which equation?', '$MR = MC + 10$: exactly like a \\$10 per-unit tax', [
      ['$P = MC + 10$', 'A monopolist still sets MR equal to its (new) MC.'],
      ['Same output; raise the price by \\$10', 'Higher MC moves the $MR = MC$ point to less output.'],
      ['$MR + 10 = MC$', 'The cost rose, so MC goes up, not MR.'],
    ], 'With linear demand the price rises by half the cost increase.'));

  gen('m3_spot_any', () => {
    const c = pick(POOL);
    return { title: 'Spot the technique', q: c.q, plan: c.steps.length > 1 ? c.steps : c.steps[0] };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3spot', exam: 'm3', num: 'Drill', title: 'Spot the technique',
    blurb: 'recognition only: read an exam problem, name the first move, see why the tempting moves fail',
    lessons: [
      // ================================================================ set 1
      {
        id: 'm3-spot-1', title: 'Spot it: profit, inputs, short-run supply', ref: 'Lectures 14–15 · DS8',
        steps: [
          intro('Set 1: profit, inputs, short-run supply', md`The triggers here: "economic profit", "implicit cost", "production function", "isoprofit", "cost function and a price", "shutdown", "two firms", "identical firms". If you need the full list, see [the problem-type map](#/l/m3-map).`),
          S(md`A landscaping business takes in \$250,000 a year and pays \$180,000 in wages, fuel and insurance. The owner could earn \$60,000 working for a rival, and she could rent her equipment out for \$15,000 a year. (a) Find accounting and economic profit. (b) Should she stay in the business in the long run?`,
            plan('Which costs go into economic profit?', 'The \\$180,000 of explicit costs plus the forgone \\$60,000 salary and \\$15,000 rent', [
              ['Only the \\$180,000 of explicit costs', 'That gives accounting profit (\\$70,000). Economic profit also charges the owner for what she gives up.'],
              ['Only the \\$75,000 of implicit costs', 'The wages and fuel are real costs too: economic cost includes both kinds.'],
              ['Explicit costs plus the price she paid for the equipment', 'What she paid long ago is not this year’s cost. The opportunity cost is the \\$15,000 a year she could rent it for.'],
            ], 'Accounting $= 250 - 180 = 70$ thousand. Economic $= 70 - 60 - 15 = -5$ thousand.'),
            plan('Economic profit is $-\\$5{,}000$. What does that mean for the long run?', 'Her next-best option pays a little more: she should leave', [
              ['Stay: accounting profit is \\$70,000', 'Accounting profit ignores what she gives up. She would be \\$5,000 better off working for the rival and renting out the gear.'],
              ['Shut down this week', 'A negative economic profit is a long-run signal to exit; nothing here says this month’s revenue fails to cover avoidable costs.'],
              ['It means nothing: economic profit is a theory number', 'It is the comparison with her real alternatives: exactly what decides staying or leaving.'],
            ], 'Negative economic profit means the resources earn more elsewhere: exit in the long run.')),
          S(md`A bakery's daily output is $q = 20\sqrt{L}$, where $L$ is labor hours. The oven is fixed and rents for \$20 a day. Bread sells for \$2 a loaf and labor costs \$10 an hour.`,
            plan('What is your first equation?', '$p\\,MP_L = w$: $2 \\cdot \\dfrac{10}{\\sqrt L} = 10$', [
              ['$MP_L = w$: $\\dfrac{10}{\\sqrt L} = 10$', 'MP is in loaves; the wage is in dollars. Multiply MP by the price.'],
              ['$p\\,q = wL$', 'That sets revenue equal to labor cost; it is not the marginal condition.'],
              ['$MP_L = 0$', 'Hiring until the last hour adds nothing ignores that hours cost \\$10.'],
            ], '$MP_L = 20 \\cdot \\tfrac12 L^{-1/2} = 10/\\sqrt L$. Then $20/\\sqrt L = 10 \\Rightarrow L = 4$, $q = 40$.'),
            plan('Where does the \\$20 oven rent enter?', 'Only in profit: $\\pi = 2(40) - 10(4) - 20 = 20$; it does not change $L^*$', [
              ['It raises the effective wage', 'The rent is paid whatever $L$ is, so it does not change the cost of one more hour.'],
              ['It lowers the best $L$', 'A fixed cost has no marginal effect: $p\\,MP_L = w$ does not contain it.'],
              ['Leave it out of profit too', 'It is a real cost of running the bakery: it belongs in profit.'],
            ], 'Fixed costs move profit, never the marginal condition.')),
          S(md`
            A farm's output from different numbers of workers (land fixed):

            | Workers $L$ | 1 | 2 | 3 | 4 | 5 |
            |---|---|---|---|---|---|
            | Output $q$ (bushels) | 10 | 18 | 24 | 28 | 30 |

            Wheat sells for \$5 a bushel and each worker costs \$25 a day. How many workers does the farm hire?
          `,
            plan('What do you build from the table?', 'Each worker’s marginal product (the change in $q$), times \\$5, compared with the \\$25 wage', [
              ['Average product $q/L$ for each row', 'Average product mixes in the earlier workers. The decision about the next worker needs his extra output.'],
              ['MP compared with \\$25 directly', 'MP is in bushels: convert to dollars with the price first.'],
              ['Hire 5: that gives the most output', 'More output is not the goal. The 4th and 5th workers add less in value than they cost.'],
            ], 'MP: 10, 8, 6, 4, 2. Value: 50, 40, 30, 20, 10. Hire while value $\\ge 25$: 3 workers.')),
          S(md`A graph shows a production function and an isoprofit line tangent to it at $x_1 = 4$, $q = 16$. The isoprofit line has slope 2. Then the output price doubles (the wage stays the same).`,
            plan('What happens to the isoprofit lines and to the best plan?', 'Slope $w_1/p$ halves to 1: flatter lines, tangency moves right: more labor and more output', [
              ['Steeper lines; less labor', 'A higher $p$ is in the **denominator** of $w_1/p$: the lines get flatter.'],
              ['Only the intercept moves; same plan', 'The slope $w_1/p$ changes, so the point of tangency moves.'],
              ['Nothing: the price does not enter the isoprofit line', 'The line is $q = (w_1/p)x_1 + (\\pi + w_2\\bar x_2)/p$: $p$ is in both terms.'],
            ], 'Output is worth more, so each worker is worth more: hire until $MP_1$ falls to the new $w_1/p$.')),
          S(md`A classmate writes the short-run isoprofit line as $q = \dfrac{p}{w_1}x_1 + \dfrac{\pi}{p}$.`,
            plan('What is wrong?', 'The slope is $w_1/p$, and the intercept must include the fixed input cost: $(\\pi + w_2\\bar x_2)/p$', [
              ['Nothing', 'Solve $\\pi = pq - w_1x_1 - w_2\\bar x_2$ for $q$: you get $q = (w_1/p)x_1 + (\\pi + w_2\\bar x_2)/p$.'],
              ['Only the slope is wrong', 'The intercept also drops the fixed cost $w_2\\bar x_2$.'],
              ['Only the intercept is wrong', 'The slope is upside down too: one more unit of $x_1$ costs $w_1$, which must be covered by $w_1/p$ units of output.'],
            ], 'Start from $\\pi = pq - w_1x_1 - w_2\\bar x_2$; add the costs to both sides and divide by $p$.')),
          S(md`A competitive firm has $C(q) = 50 + 4q + q^2$. The market price is \$24. Find its output and profit.`,
            plan('What is your first equation?', '$24 = MC = 4 + 2q$', [
              ['$24 = AC = 50/q + 4 + q$', '$P = AC$ is break-even. The best output is where the next unit just pays: $P = MC$.'],
              ['$24 = AVC = 4 + q$', 'AVC is for the shutdown test, not for how much to make.'],
              ['$MR = 24 - 2q$', 'A price taker gets \\$24 for every unit: $MR = 24$.'],
            ], '$q = 10$. $\\pi = 240 - (50 + 40 + 100) = 50$.'),
            plan('Does the firm need a shutdown check here?', 'Quick one: $AVC = 4 + q$ has minimum \\$4, far below \\$24, so it operates', [
              ['Yes: compare \\$24 with min AC', 'Min AC decides profit versus loss, not operate versus shut down.'],
              ['No check is ever needed', 'Always check: if $P$ were below min AVC, the $P = MC$ answer would be wrong (output 0).'],
              ['Shut down if profit is below the fixed cost', 'The test is price against min AVC (equivalently, loss smaller than $F$).'],
            ], 'Price above min AVC: produce the $P = MC$ output.')),
          S(md`
            A competitive firm's total cost:

            | $q$ | 0 | 1 | 2 | 3 | 4 | 5 |
            |---|---|---|---|---|---|---|
            | TC (\$) | 30 | 40 | 46 | 54 | 66 | 82 |

            The price is \$14. How many units does it make, and should it stay open this month?
          `,
            plan('What column do you build?', 'Marginal cost: the change in TC for each unit', [
              ['AC = TC/q, then pick its minimum', 'The bottom of AC is break-even; it does not depend on the price, so it cannot answer "how much at \\$14?"'],
              ['Pick the $q$ where TC is smallest', 'That is $q = 0$. The firm compares what each unit brings in with what it costs.'],
              ['TC/q compared with \\$14', 'That compares the price with the average; the output choice compares it with the **marginal** cost.'],
            ], 'MC: 10, 6, 8, 12, 16. Make every unit with $MC \\le 14$: $q = 4$.'),
            plan('Profit at $q = 4$ is $56 - 66 = -10$. Shut down?', 'No: shutting down loses the fixed cost, \\$30 (TC at $q = 0$)', [
              ['Yes: any loss means close', 'Closing still leaves the \\$30 fixed cost. Losing \\$10 beats losing \\$30.'],
              ['Yes, because $P < AC$', '$P < AC$ means a loss; shutdown compares $P$ with **AVC**. Here $AVC(4) = 36/4 = 9 < 14$.'],
              ['It cannot tell without a cost function', 'The table gives $F$ (TC at zero) and VC directly.'],
            ], 'Revenue 56 covers variable cost $66 - 30 = 36$, with \\$20 left toward the fixed cost.')),
          S(md`A firm's cost curves: min AVC is \$12 at 40 units, min AC is \$18 at 50 units. The market price is \$15. Sketch and shade the firm's short-run outcome.`,
            plan('What do you draw?', 'Produce where $P = MC$ (between 40 and 50 units) and shade a loss rectangle from \\$15 up to AC', [
              ['A profit rectangle above AC', 'Profit needs $P >$ min AC = 18. At \\$15 the price line is below AC everywhere.'],
              ['Nothing: the firm shuts down', '\\$15 is above min AVC (\\$12): producing loses less than shutting down.'],
              ['Produce at the bottom of AC, 50 units', 'Output comes from $P = MC$; at \\$15 MC crosses the price before 50 units.'],
            ], 'Zone "operate at a loss": width $q^*$ from $P = MC$, height $AC(q^*) - 15$, sitting above the price line.')),
          S(md`$C(q) = q^3 - 6q^2 + 20q + 40$. What is the firm's shutdown price?`,
            plan('What is your first move?', 'Write $AVC = q^2 - 6q + 20$ and find its minimum ($MC = AVC$ or $dAVC/dq = 0$)', [
              ['Find the bottom of $AC = q^2 - 6q + 20 + 40/q$', 'That is the break-even price. The \\$40 is fixed: paid even when shut down.'],
              ['Set $MC = 0$', 'MC = 0 is not a landmark that matters.'],
              ['The shutdown price is the fixed cost, \\$40', 'A price is per unit; the fixed cost is a total. The shutdown price is min AVC.'],
            ], '$2q - 6 = 0 \\Rightarrow q = 3$; shutdown price $= AVC(3) = 9 - 18 + 20 = 11$.')),
          S(md`Same firm, $C(q) = q^3 - 6q^2 + 20q + 40$. At what price does it supply exactly 5 units?`,
            plan('What do you plug 5 into?', '$MC(5) = 3(25) - 12(5) + 20 = 35$', [
              ['$AC(5)$', 'AC gives the cost per unit, not the price at which 5 is the best output.'],
              ['$AVC(5)$', 'On the supply curve the price equals the cost of the **last** unit: MC.'],
              ['Demand at $q = 5$', 'There is no demand here; a firm’s supply curve comes from its MC.'],
            ], 'Supply curve $=$ MC above min AVC. $35 > 11$, so at \\$35 it really does supply 5.')),
          S(md`Explain briefly why a competitive firm might keep operating in the short run while losing money.`,
            plan('Which explanation earns full credit?', 'Price is above AVC: revenue covers the variable cost and part of the fixed cost, while shutting down would lose all of the fixed cost', [
              ['It hopes the price will rise', 'Expectations are not the reason in this model. The comparison of the two losses is.'],
              ['Shutting down is illegal in the short run', 'It may shut down; it chooses not to because producing loses less.'],
              ['Price is above AC', 'Then it would not be losing money.'],
            ], 'Compare: produce $\\Rightarrow \\pi = TR - VC - F$; shut down $\\Rightarrow \\pi = -F$. Produce if $TR \\ge VC$, i.e. $P \\ge AVC$.')),
          S(md`Firm 1 supplies $q_1 = 2P - 10$ for $P \ge 5$ (zero below). Firm 2 supplies $q_2 = P - 2$ for $P \ge 2$. Find market supply at $P = 4$ and at $P = 8$.`,
            plan('At $P = 4$, what do you add?', 'Only firm 2: $q_2 = 2$; firm 1 sells nothing below \\$5', [
              ['$q_1 + q_2 = (8 - 10) + 2 = 0$', 'Firm 1’s formula gives $-2$ at \\$4, but a firm cannot sell negative output: it sells zero.'],
              ['Only firm 1', 'Firm 1 is the one that is shut out below \\$5.'],
              ['Add the inverse supplies', 'Never add prices. At one price, add what each firm sells.'],
            ], 'At \\$4: $Q = 2$. At \\$8: $q_1 = 6$, $q_2 = 6$, $Q = 12$. The kink is at $P = 5$.')),
          S(md`There are 40 identical firms, each with $C(q) = 20 + 2q^2$. Market demand is $Q = 400 - 10P$. Find the price, the output of each firm, and each firm's profit.`,
            plan('What is the first thing to build?', 'One firm’s supply from $P = 4q$, so $q = P/4$; market supply $Q = 40 \\cdot P/4 = 10P$', [
              ['Set demand equal to $MC = 4q$', 'Demand is for the whole market. One firm is only 1/40 of supply.'],
              ['$P = \\min AC$', 'That is the long-run price with free entry. Here the 40 firms are fixed.'],
              ['$MR = MC$ from market demand', 'These firms are price takers: $P = MC$.'],
            ], 'Market supply $Q = 10P$.'),
            plan('Supply meets demand at $P = 20$, $Q = 200$. How much does each firm make?', '$q = Q/n = 200/40 = 5$', [
              ['$q = 200$', 'That is the market total.'],
              ['$q = P/n$', 'Divide the market quantity, not the price, by the number of firms.'],
              ['$q$ from $P = AC$', 'Each firm still sets $P = MC$: $20 = 4q$, $q = 5$, the same answer.'],
            ], '$q = 5$; $\\pi = 100 - (20 + 50) = 30 > 0$: in the long run firms would enter.')),
          S(md`A firm's inverse supply curve is $P = 3 + 0.5q$. Write its direct supply curve.`,
            plan('How do you get the direct form?', 'Solve for $q$: $q = 2P - 6$ for $P \\ge 3$ (zero below)', [
              ['$q = 3 + 0.5P$', 'That swaps the letters without solving the equation.'],
              ['$q = 0.5P - 3$', 'Dividing by 0.5 means multiplying by 2: $q = 2(P - 3)$.'],
              ['$q = 2P + 6$', 'Sign slip: move the 3 across first, $0.5q = P - 3$.'],
            ], '$0.5q = P - 3 \\Rightarrow q = 2P - 6$, and zero for prices below \\$3.')),
          S(md`A classmate says: "In long-run competitive equilibrium firms earn zero economic profit, so the owners are earning nothing. Why would anyone stay?"`,
            plan('What is the answer?', 'Zero economic profit means the owners earn exactly what their next-best use pays: their time and money are already paid for in cost', [
              ['They stay only out of habit', 'There is a real reason: their opportunity cost is covered.'],
              ['They are really losing money', 'Zero economic profit is not a loss; accounting profit is usually positive.'],
              ['They expect a monopoly later', 'Nothing in the competitive model needs that.'],
            ], 'Economic cost includes the forgone wage and the return on owned capital. Zero economic profit = doing as well as the alternative.')),
        ],
      },
      // ================================================================ set 2
      {
        id: 'm3-spot-2', title: 'Spot it: long run, surplus, efficiency', ref: 'Lecture 16 · DS9 Q1–Q2',
        steps: [
          intro('Set 2: long run, surplus, efficiency', md`The triggers here: "long run", "free entry", "number of firms", "exit", "demand rises/falls", "producer surplus", "consumer surplus", "efficient", "output is restricted", "welfare table".`),
          S(md`Every firm in a competitive industry has long-run cost $LRC(q) = 3q^2 + 27$. What is the long-run equilibrium price?`,
            plan('What do you find?', 'The bottom of LRAC: set $LRMC = LRAC$, $6q = 3q + 27/q$', [
              ['Set $LRMC$ equal to a price', 'No price is given: with free entry the price is pinned at min LRAC.'],
              ['The bottom of AVC', 'Long run: the 27 is avoidable by exiting, so the test uses the full LRAC.'],
              ['$LRAC = 27$', 'The 27 is a cost total, not a price.'],
            ], '$3q = 27/q \\Rightarrow q^2 = 9 \\Rightarrow q = 3$; $P = LRAC(3) = 9 + 9 = 18$.')),
          S(md`Same industry (min LRAC = \$18 at $q = 3$). Market demand is $Q = 900 - 20P$. How many firms are there in the long run?`,
            plan('Which order of moves?', '$P = 18$, then $Q = 900 - 20(18) = 540$ from demand, then $n = 540/3$', [
              ['Set demand equal to one firm’s LRMC', 'One firm is a sliver of the market; the price is pinned by min LRAC and demand gives the total.'],
              ['$n = Q/P = 540/18$', 'Divide by output **per firm**, $q^* = 3$.'],
              ['$n = 900/3$', '900 is the demand intercept, not the quantity sold at \\$18.'],
            ], '$n = 540/3 = 180$ firms.')),
          S(md`The market price is \$15. Every firm has min AVC = \$10 and min LRAC = \$18. What do firms do now, and what happens over time?`,
            plan('Short run and long run?', 'Short run: operate (price covers AVC). Long run: firms exit, supply shifts left, the price rises toward \\$18', [
              ['Shut down now', 'Shutdown is $P < \\min AVC$; \\$15 > \\$10.'],
              ['Operate forever at a loss', 'In the long run nothing is fixed; firms that cannot cover LRAC leave.'],
              ['Enter: price is above AVC', 'Entry needs $P > \\min LRAC$.'],
            ], 'Two tests, two horizons: $P$ vs min AVC today, $P$ vs min LRAC in the long run.')),
          S(md`A competitive industry with free entry and identical firms is in long-run equilibrium. Demand **falls** permanently. Describe the short-run and long-run effects on price, firm output, and the number of firms.`,
            plan('What happens?', 'SR: price falls, each firm moves down its MC and loses money. LR: firms exit until the price is back at min LRAC; fewer firms, each at $q^*$', [
              ['The price stays low in the long run', 'With flat long-run supply, exit pushes the price back up to min LRAC.'],
              ['Firms shut down immediately', 'Only if the price falls below min AVC. Otherwise they operate at a loss for now.'],
              ['Each firm shrinks permanently', 'In the long run every remaining firm is back at the bottom of LRAC, $q^*$; the market shrinks by losing firms.'],
            ], 'Adjustment runs through the number of firms, not the size of each one.')),
          S(md`Explain briefly why the long-run market supply curve of a competitive industry is horizontal.`,
            plan('Which three assumptions make it flat?', 'Identical firms, free entry and exit, and constant input prices: any price above min LRAC brings entry, any price below brings exit', [
              ['Each firm’s LRMC is flat', 'Each firm’s supply slopes up. The flatness comes from changing the number of firms.'],
              ['Demand is very elastic', 'Supply’s shape does not depend on demand.'],
              ['Firms earn positive profit in the long run', 'Long-run profit is zero; that is why the price cannot stay above min LRAC.'],
            ], 'More output comes from more firms, each producing $q^*$ at cost min LRAC, so the price never has to rise.')),
          S(md`A classmate says: "A firm's long-run supply curve is horizontal at min LRAC."`,
            plan('What is the correct statement?', 'The **firm’s** long-run supply is its LRMC above min LRAC; the **industry’s** long-run supply is horizontal', [
              ['The classmate is right', 'One firm still has rising LRMC. Only industry supply is flat (through entry and exit).'],
              ['The firm’s supply is LRMC above min AVC', 'That mixes the short-run test into the long run.'],
              ['The firm’s supply is all of LRMC', 'Below min LRAC the firm exits, so supply is zero there.'],
            ], 'Individual firm: how one firm responds to price. Industry: also counts firms entering and leaving.')),
          S(md`Inverse market supply is $P = 4 + 2Q$. The price is \$16. Find producer surplus.`,
            plan('Which area?', 'The triangle above supply and below \\$16 out to $Q = 6$: $\\tfrac12(6)(16 - 4)$', [
              ['$16 \\times 6$', 'That is revenue; PS subtracts the area under supply.'],
              ['$\\tfrac12(6)(16)$', 'Supply starts at \\$4: PS is only the part above it.'],
              ['$\\tfrac12(12)(16 - 4)$', '$Q$ at \\$16 is $(16 - 4)/2 = 6$, not 12.'],
            ], '$Q = 6$; $PS = \\tfrac12(6)(12) = 36$.')),
          S(md`A firm's producer surplus this year is \$800 and its fixed cost is \$300. A classmate reports its economic profit as \$800.`,
            plan('What is the correct profit, and why?', '$\\pi = PS - F = 500$: PS ignores the fixed cost', [
              ['\\$800: PS and profit are the same thing', 'Only when there is no fixed cost (the long run). $PS = TR - VC$; profit also subtracts $F$.'],
              ['\\$1,100', 'Fixed cost is subtracted, not added.'],
              ['It cannot be found without TR', '$\\pi = PS - F$ needs only these two numbers.'],
            ], '$PS = TR - VC$, $\\pi = TR - VC - F = PS - F = 800 - 300 = 500$.')),
          S(md`Demand is $P = 50 - Q$ and supply is $P = 10 + Q$. Find total welfare at the competitive equilibrium.`,
            plan('What is the plan?', 'Equilibrium $Q = 20$, $P = 30$; CS and PS triangles; add them', [
              ['$W = P \\times Q$', 'That is total spending, not surplus.'],
              ['$W = CS$ only', 'Welfare counts producers too: $W = CS + PS$.'],
              ['$W$ = the area under demand', 'That is total value to buyers; subtract the cost (area under supply).'],
            ], '$CS = \\tfrac12(20)(50 - 30) = 200$, $PS = \\tfrac12(20)(30 - 10) = 200$, $W = 400$.')),
          S(md`Same market ($P = 50 - Q$, $P = 10 + Q$). A quota limits output to 14 units. What is the market price, and what is the DWL?`,
            plan('Where does the new price come from?', 'From **demand** at $Q = 14$: $P = 50 - 14 = 36$', [
              ['From supply at 14: $P = 24$', 'Buyers compete for the scarce 14 units, so the price rises to what the 14th buyer will pay.'],
              ['It stays at \\$30', 'With fewer units, buyers bid the price up along demand.'],
              ['Halfway between, \\$30', 'The price is set by the buyers’ willingness to pay for the scarce units.'],
            ], 'Price 36.'),
            plan('The DWL triangle’s height is…', 'Demand minus supply at $Q = 14$: $36 - 24 = 12$', [
              ['New price minus old price, $36 - 30$', 'That is only the consumer half of the gap; MC at 14 is 24, not 30.'],
              ['The price, 36', 'The triangle is between demand and supply, not down to zero.'],
              ['$30 - 24$', 'That is only the producer half.'],
            ], 'DWL $= \\tfrac12(20 - 14)(12) = 36$.')),
          S(md`Same market. A program forces output up to 26 units. Find the DWL.`,
            plan('What does the triangle look like?', 'Units 20 to 26, between supply **above** ($MC = 36$ at 26) and demand **below** ($24$ at 26)', [
              ['There is no DWL: more output is better', 'Units past 20 cost more than they are worth to buyers.'],
              ['Units 0 to 26 between demand and supply', 'Units 0 to 20 are worth more than they cost; only 20 to 26 are wasteful.'],
              ['Height $36 - 30$', 'The height is the full gap between MC and MB at 26: $36 - 24 = 12$.'],
            ], 'DWL $= \\tfrac12(26 - 20)(36 - 24) = 36$.')),
          S(md`
            A welfare table for the quota at 14 units:

            | | Before | After | Change |
            |---|---|---|---|
            | CS | 200 | 98 | −102 |
            | PS | 200 | 266 | +66 |

            What is the deadweight loss, and how much was transferred from consumers to producers?
          `,
            plan('How do you read it?', 'DWL $= -\\Delta W = 102 - 66 = 36$; the transfer is the rectangle $(36 - 30) \\times 14 = 84$', [
              ['DWL = 102, the fall in CS', 'Part of what consumers lose goes to producers. Only the net fall in $W$ is DWL.'],
              ['DWL = 66 + 102 = 168', 'Producers gained 66; gains offset losses. Net change is $-36$.'],
              ['Transfer = 66', 'Producers’ net gain is the transfer (84) minus their part of the DWL (18).'],
            ], '$\\Delta W = -102 + 66 = -36$. Consumers lost $84 + 18$; producers gained $84 - 18$.')),
          S(md`Explain briefly why the competitive quantity maximizes total welfare.`,
            plan('Which explanation is right?', 'At the competitive $Q$, $MB = MC$: every unit worth more than it costs is made, and none worth less', [
              ['Because the price is lowest there', 'Low prices help buyers and hurt sellers; welfare is about value minus cost.'],
              ['Because firms earn zero profit', 'That is a long-run property; efficiency holds in the short run too.'],
              ['Because the most units are sold', 'Selling more past $MB = MC$ lowers welfare.'],
            ], 'Fewer units: lost gains (MB > MC). More units: units costing more than they are worth (MC > MB).')),
          S(md`A lime producer faces a price of \$5. At its best output (50 thousand tons) its AC is above \$5, and the price is above min AVC. Areas A and C on the graph are labeled as its loss.`,
            plan('What happens now, and in the long run?', 'Now: it operates at a loss (price covers AVC). Long run: it exits unless the price rises', [
              ['It shuts down now', 'Price above min AVC: producing loses less than closing.'],
              ['It stays forever', 'A persistent loss means the resources earn more elsewhere: exit.'],
              ['Others enter', 'Entry follows profit, not losses.'],
            ], 'Short run: shutdown test (AVC). Long run: exit test (LRAC).')),
        ],
      },
      // ================================================================ set 3
      {
        id: 'm3-spot-3', title: 'Spot it: taxes, ceilings, floors, supports', ref: 'Lecture 17 · DS9 Q3',
        steps: [
          intro('Set 3: taxes, ceilings, floors, supports', md`Most cards use one market: $Q_d = 240 - 4P$, $Q_s = 2P$, so $P^* = 40$, $Q^* = 80$ (inverse: $P = 60 - Q/4$ and $P = Q/2$). The triggers: "per-unit tax", "who bears", "collected from", "maximum price", "minimum price", "the government buys any excess".`),
          S(md`$Q_d = 240 - 4P$, $Q_s = 2P$. A \$6 per-unit tax is collected from sellers. Find the price buyers pay, the price sellers keep, and the quantity.`,
            plan('What is your first equation?', '$240 - 4P_c = 2P_p$ with $P_c = P_p + 6$', [
              ['$240 - 4P = 2P - 6$', 'The tax is a wedge between two **prices**, not 6 units of quantity.'],
              ['$P_c = 40 + 6 = 46$', 'Sellers keep less than \\$40 after the tax: the burden is shared, so $P_c$ rises by less than 6.'],
              ['Sellers pay it, so $P_c = 40$ and $P_p = 34$', 'Who mails the check does not decide who bears it. Solve the wedge equation.'],
            ], '$240 - 4(P_p + 6) = 2P_p \\Rightarrow 216 = 6P_p \\Rightarrow P_p = 36$, $P_c = 42$, $Q = 72$.')),
          S(md`Same tax: $P_c = 42$, $P_p = 36$, and $P^* = 40$. Who bears more of the tax, and why?`,
            plan('Who bears more?', 'Sellers: their share is $(40 - 36)/6 = 2/3$. Supply responds less to price (2 units per dollar, against 4)', [
              ['Buyers, because the price they pay rose', 'It rose by only \\$2 of the \\$6. Sellers lost \\$4 per unit.'],
              ['Sellers, because the law makes them pay it', 'They do bear more, but because supply is less responsive, not because of the law.'],
              ['Half each', 'Half only when both sides respond equally to price.'],
            ], 'Consumer share $(42 - 40)/6 = 33\\%$, producer share $(40 - 36)/6 = 67\\%$. The less responsive side bears more.')),
          S(md`The government switches the same \$6 tax so that buyers, not sellers, must send it in. What changes?`,
            plan('What happens to $P_c$, $P_p$ and $Q$?', 'Nothing: buyers still pay \\$42 in total, sellers still keep \\$36, and 72 units trade', [
              ['Buyers now bear all of it', 'Legal liability does not set incidence. The market price adjusts to give the same split.'],
              ['Sellers now bear none of it', 'The posted price falls to \\$36; sellers still keep \\$36.'],
              ['Quantity rises', 'The wedge is the same size, so the quantity is the same.'],
            ], 'Taxing buyers shifts demand down by 6; taxing sellers shifts supply up by 6. Same wedge, same outcome.')),
          S(md`A classmate computes the tax revenue as $6 \times 80 = 480$.`,
            plan('What is wrong?', 'The tax is collected only on units actually traded: $6 \\times 72 = 432$', [
              ['Nothing', 'Eighty units would trade only without the tax.'],
              ['It should be $6 \\times 72 / 2$', 'Revenue is a rectangle, not a triangle.'],
              ['It should be $42 \\times 72$', 'That is total spending by buyers; the government gets only the wedge.'],
            ], 'Revenue $= tQ_{\\text{tax}} = 432$. DWL $= \\tfrac12(6)(80 - 72) = 24$.')),
          S(md`Fill in a welfare table (before, after, change) for the \$6 tax. Which rows does it need?`,
            plan('Which rows?', 'CS, PS, tax revenue, and total welfare; DWL is minus the change in total welfare', [
              ['CS and PS only', 'Without the revenue row, the table shows a loss of 456 instead of 24: the revenue goes to the government, not into thin air.'],
              ['CS, PS, and DWL added to welfare', 'DWL is not a gain to anyone; it is the drop in $W$.'],
              ['Revenue only', 'The question is who wins and loses: CS and PS change too.'],
            ], 'CS 800 → 648, PS 1600 → 1296, revenue 0 → 432, W 2400 → 2376: DWL 24.')),
          S(md`In the same market ($P^* = 40$) the government sets a maximum price of \$35. How many units are traded?`,
            plan('Which quantity?', '$Q_s(35) = 70$: the ceiling binds and sellers are the short side', [
              ['$Q_d(35) = 100$', 'Buyers want 100, but sellers make only 70 at \\$35.'],
              ['80, the old equilibrium', '\\$35 is below \\$40, so the ceiling binds.'],
              ['The shortage, 30', 'The shortage is unmet demand, not units traded.'],
            ], 'Traded 70; shortage $100 - 70 = 30$.')),
          S(md`Same market. The maximum price is \$45 instead.`,
            plan('What happens?', 'Nothing: a ceiling above $P^* = 40$ does not bind', [
              ['A shortage of $Q_d(45) - Q_s(45)$', 'At \\$45 there would be a surplus, not a shortage; but the market price is \\$40 anyway, which the ceiling allows.'],
              ['The price rises to \\$45', 'A ceiling is a maximum. Nothing pushes the price up to it.'],
              ['Quantity traded is $Q_s(45) = 90$', 'Buyers would take only 60 at \\$45; but the price stays at \\$40 and 80 trade.'],
            ], 'Non-binding: $P = 40$, $Q = 80$.')),
          S(md`Same market, binding ceiling at \$35 (70 units traded). Find the DWL.`,
            plan('What is the height of the DWL triangle?', 'Demand height at 70 minus supply height at 70: $42.5 - 35$', [
              ['$40 - 35$', 'That is only the part below the old price. The triangle runs from demand (42.5) down to supply (35) at $Q = 70$.'],
              ['$Q_d - Q_s = 30$', 'That is the shortage, a quantity; the height is in dollars.'],
              ['$60 - 35$', '60 is the choke price; the triangle is at $Q = 70$.'],
            ], 'Demand at 70: $60 - 70/4 = 42.5$. DWL $= \\tfrac12(80 - 70)(42.5 - 35) = 37.5$.')),
          S(md`Under the \$35 ceiling, what shape is consumer surplus, and between which lines?`,
            plan('Which shape?', 'A trapezoid: under demand, above \\$35, over the 70 units bought', [
              ['A triangle above \\$40', 'Buyers pay \\$35 now, and only 70 units are bought.'],
              ['A triangle above \\$35 out to $Q_d = 100$', 'Only 70 units are bought; the other 30 buyers get nothing.'],
              ['A rectangle', 'The top edge is the sloped demand curve.'],
            ], 'Left side $60 - 35 = 25$, right side $42.5 - 35 = 7.5$, width 70: $\\tfrac12(25 + 7.5)(70) = 1137.5$.')),
          S(md`Same market. A minimum price of \$45 is set, with no government purchases.`,
            plan('How many units are sold?', '$Q_d(45) = 60$: buyers are the short side', [
              ['$Q_s(45) = 90$', 'Sellers would like to sell 90, but buyers take only 60 at \\$45.'],
              ['80', 'The floor binds (45 > 40), so the quantity changes.'],
              ['The excess supply, 30', 'That is the unsold amount, not sales.'],
            ], 'Sold 60; excess supply $90 - 60 = 30$.')),
          S(md`Same market, but now the government sets a support price of \$45 and buys any excess. How many units do producers sell, and what does the government spend?`,
            plan('What is different from an ordinary floor?', 'Producers sell all of $Q_s(45) = 90$: consumers buy 60, the government buys 30', [
              ['Nothing: 60 units are sold', 'That is the ordinary floor. With a support, the government buys what consumers do not.'],
              ['The government buys all 90', 'Consumers still buy their 60 at \\$45.'],
              ['The government pays only the markup, $45 - 40$, per unit', 'It pays the full support price for every unit it buys.'],
            ], 'Spending $= 45 \\times 30 = 1350$.')),
          S(md`A classmate says: "The \$45 support raises PS by 425 and lowers CS by only 350, so it raises welfare."`,
            plan('What did the classmate forget?', 'The government’s spending, 1350, which taxpayers pay: $\\Delta W = -350 + 425 - 1350 = -1275$', [
              ['Nothing: welfare rises by 75', 'Taxpayers fund the purchases. Leaving them out makes the program look free.'],
              ['The tax revenue it raises', 'A support raises no revenue: it spends money.'],
              ['That CS actually rises', 'Buyers pay more and buy less: CS falls.'],
            ], 'CS 800 → 450, PS 1600 → 2025, spending 1350. $W$: 2400 → 1125.')),
          S(md`A city sets a minimum wage of \$18 an hour. At \$18, firms want 400 workers and 520 people want jobs. The market wage would be \$15.`,
            plan('How many people are employed?', '400: the demand side of the labor market is short', [
              ['520', 'Workers can supply 520, but firms hire only 400 at \\$18.'],
              ['The no-floor employment level', 'The floor binds (18 > 15), so employment changes.'],
              ['120', 'That is the excess supply of labor: unemployment created by the floor.'],
            ], 'A floor in the labor market: traded quantity = quantity demanded (by firms) = 400.')),
          S(md`The supply of a rare painting style is perfectly inelastic: the same number exist whatever the price. A per-unit sales tax is imposed. Who bears it?`,
            plan('Who bears it?', 'Sellers, entirely: the quantity cannot change, so the price buyers pay stays the same', [
              ['Buyers, entirely', 'Buyers bear the tax when demand is the inelastic side.'],
              ['Half each', 'Only with equally responsive sides.'],
              ['Whoever the law names', 'Legal liability never decides incidence.'],
            ], 'Vertical supply: the tax cannot move $Q$, so $P_c$ stays at $P^*$ and $P_p = P^* - t$. No DWL either.')),
          S(md`Under a binding rent ceiling the textbook assumes the scarce apartments go to the renters who value them most. Explain briefly why the real DWL may be larger.`,
            plan('Which reason is right?', 'With rationing by queues or luck, some apartments go to renters who value them less: lost value on top of the triangle', [
              ['Landlords then raise the rent', 'A binding ceiling makes that illegal.'],
              ['More apartments get built', 'A low ceiling reduces supply, not raises it.'],
              ['The DWL is always exactly the triangle', 'The triangle assumes efficient rationing. Misallocation adds more loss.'],
            ], 'Efficient rationing gives the smallest possible DWL; time spent searching and misallocated units add to it.')),
        ],
      },
      // ================================================================ set 4
      {
        id: 'm3-spot-4', title: 'Spot it: monopoly', ref: 'Lecture 18 · DS10 Q1',
        steps: [
          intro('Set 4: monopoly', md`The triggers: "monopolist", "only seller", "revenue table", "marginal revenue", "competitive benchmark", "Lerner index", "elasticity", "elastic portion", "barriers to entry". The first move is almost always $MR = MC$, then the price from **demand**.`),
          S(md`A monopolist faces inverse demand $P = 90 - 3Q$ and has $MC = 3Q$. Find its quantity and price.`,
            plan('What is your first equation?', '$MR = MC$: $90 - 6Q = 3Q$', [
              ['$90 - 3Q = 3Q$', 'That is $P = MC$, the competitive outcome.'],
              ['$90 - 3Q = 0$', 'That finds where the price hits zero.'],
              ['$90 - 6Q = 0$', 'That maximizes revenue and ignores the cost of each unit.'],
            ], '$9Q = 90 \\Rightarrow Q = 10$.'),
            plan('With $Q_m = 10$, where do you read the price?', 'From demand: $P = 90 - 3(10) = 60$', [
              ['From MR: $90 - 6(10) = 30$', 'MR at $Q_m$ equals MC (30). Buyers pay what **demand** says.'],
              ['From MC: $3(10) = 30$', 'That is the cost of the last unit, not the price.'],
              ['Halfway between MR and demand', 'The price is on the demand curve, full stop.'],
            ], '$P_m = 60$: well above $MC(10) = 30$.')),
          S(md`A monopolist faces demand $Q = 200 - 4P$ and has constant $MC = 10$.`,
            plan('What do you do before writing MR?', 'Invert demand: $P = 50 - Q/4$, so $MR = 50 - Q/2$', [
              ['Double the slope of $Q = 200 - 4P$: $MR = 200 - 8P$', 'The "twice the slope" rule applies to **inverse** demand $P = a - bQ$.'],
              ['$MR = 50 - Q/4$', 'That is demand itself. MR has twice the slope.'],
              ['$MR = 200 - 4P$', 'That is the demand curve in direct form.'],
            ], '$50 - Q/2 = 10 \\Rightarrow Q = 80$, $P = 50 - 20 = 30$.')),
          S(md`
            A monopolist's demand schedule:

            | $Q$ | 1 | 2 | 3 | 4 | 5 | 6 |
            |---|---|---|---|---|---|---|
            | $P$ (\$) | 20 | 18 | 16 | 14 | 12 | 10 |

            Each unit costs \$9 to make. What quantity and price does it choose?
          `,
            plan('What do you compute first?', 'TR $= P \\times Q$ for each row, then MR as the change in TR', [
              ['Compare the price column with \\$9', 'That is the competitive rule. Selling one more unit lowers the price on all units, so MR is below the price.'],
              ['Find the largest TR', 'That ignores the \\$9 cost per unit.'],
              ['Average revenue TR/Q', 'Average revenue is just the price again.'],
            ], 'TR: 20, 36, 48, 56, 60, 60. MR: 20, 16, 12, 8, 4, 0. Sell while $MR \\ge 9$: $Q = 3$, $P = 16$.')),
          S(md`Explain briefly why a monopolist's marginal revenue is below its price.`,
            plan('Which explanation is right?', 'To sell one more unit it must lower the price on **every** unit, so the extra revenue is the price minus the loss on the earlier units', [
              ['Because it pays a tax on each unit', 'MR < P holds with no tax at all.'],
              ['Because its costs rise with output', 'MR is about revenue; costs do not enter it.'],
              ['Because buyers are price takers', 'Buyers facing a downward demand curve is the point; the monopolist is the one who is not a price taker.'],
            ], '$MR = P + Q\\,\\dfrac{dP}{dQ}$; the second term (negative) is the price cut times the units already sold.')),
          S(md`A classmate writes: "Demand is $P = 120 - 2Q$, so $MR = 120 - 2Q$ as well."`,
            plan('What is the right MR, and why?', '$MR = 120 - 4Q$: $TR = 120Q - 2Q^2$, and its derivative doubles the slope', [
              ['The classmate is right', 'That is only true for a price taker (flat demand).'],
              ['$MR = 60 - 2Q$', 'The intercept stays at 120; only the slope doubles.'],
              ['$MR = 120 - Q$', 'Halving the slope goes the wrong way.'],
            ], 'Linear $P = a - bQ \\Rightarrow MR = a - 2bQ$: same intercept, twice as steep.')),
          S(md`The monopolist with $P = 90 - 3Q$ has total cost $C(Q) = 100 + 1.5Q^2$ and chooses $Q = 10$, $P = 60$. Find its profit.`,
            plan('Which formula?', '$\\pi = TR - TC = 600 - (100 + 150)$, or $(P - AC)Q$', [
              ['$(P - MC)Q = (60 - 30)(10)$', 'MC is the cost of the last unit. Profit needs **average** cost (and the fixed 100).'],
              ['$P \\times Q = 600$', 'That is revenue; subtract total cost.'],
              ['$\\pi = 0$, as in the long run', 'Zero long-run profit comes from free entry; a monopoly has barriers.'],
            ], '$\\pi = 600 - 250 = 350$. Check: $AC = 25$, $(60 - 25)(10) = 350$.')),
          S(md`Same market ($P = 90 - 3Q$, $MC = 3Q$). If the industry were competitive with the same marginal cost, what would it produce, and what is the monopoly DWL?`,
            plan('What is the benchmark?', '$P = MC$: $90 - 3Q = 3Q$, so $Q_c = 15$, $P_c = 45$', [
              ['$MR = MC$ again', 'That is the monopoly choice; the benchmark is $P = MC$.'],
              ['$Q$ where demand hits zero, 30', 'Units beyond 15 cost more than buyers value them.'],
              ['$MR = 0$', 'Revenue max has nothing to do with efficiency.'],
            ], 'Benchmark $Q_c = 15$.'),
            plan('The DWL triangle’s height is…', '$P_m - MC(Q_m) = 60 - 30$', [
              ['$P_m - P_c = 60 - 45$', 'MC rises here, so that leaves out the producer side of the triangle.'],
              ['$P_m = 60$', 'The triangle runs from demand down to MC, not to zero.'],
              ['$P_c - MC(Q_m) = 45 - 30$', 'That is only the bottom part.'],
            ], 'DWL $= \\tfrac12(15 - 10)(60 - 30) = 75$.')),
          S(md`On a monopoly graph (D, MR, MC with $Q_m$ and $P_m$ marked), label CS, PS and DWL.`,
            plan('Where is PS?', 'Between $P_m$ and MC, from 0 to $Q_m$', [
              ['Between $P_m$ and MR, from 0 to $Q_m$', 'MR is not a cost curve. PS is price minus marginal cost on each unit sold.'],
              ['Between demand and MC out to the efficient $Q$', 'That is total surplus under competition.'],
              ['The triangle between $Q_m$ and $Q_c$', 'That triangle is the DWL.'],
            ], 'CS: above $P_m$ under demand, 0 to $Q_m$. PS: below $P_m$ above MC, 0 to $Q_m$. DWL: between demand and MC, $Q_m$ to $Q_c$.')),
          S(md`A monopolist charges \$60 and its marginal cost at that output is \$30. Find the Lerner index and the price elasticity of demand there.`,
            plan('Which formulas?', '$L = (P - MC)/P = 0.5$; at the optimum $L = -1/\\varepsilon$, so $\\varepsilon = -2$', [
              ['$L = (P - MC)/MC = 1$', 'The Lerner index divides by the price.'],
              ['$\\varepsilon = -0.5$', 'Take the reciprocal: $\\varepsilon = -1/L$.'],
              ['$\\varepsilon = -1$ at any monopoly', 'Unit elasticity maximizes revenue, not profit (unless MC = 0).'],
            ], '$L = 30/60 = 0.5$; $\\varepsilon = -1/0.5 = -2$.')),
          S(md`Demand is $Q = 200 - 4P$ and the monopolist charges \$30 (selling 80). Find the elasticity of demand at that point.`,
            plan('Which formula?', '$\\varepsilon = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q} = -4 \\cdot \\dfrac{30}{80}$', [
              ['$\\varepsilon = -4$', 'That is the slope $dQ/dP$ alone; multiply by $P/Q$.'],
              ['$\\varepsilon = \\dfrac{dP}{dQ}\\cdot\\dfrac{P}{Q} = -\\tfrac14 \\cdot \\tfrac{30}{80}$', 'Upside down: elasticity uses $dQ/dP$.'],
              ['$\\varepsilon = -4 \\cdot \\dfrac{80}{30}$', 'The ratio is $P/Q$, not $Q/P$.'],
            ], '$\\varepsilon = -1.5$: elastic, as it must be at a monopoly optimum with $MC > 0$.')),
          S(md`Explain briefly why a monopolist with positive marginal cost never produces on the inelastic part of demand.`,
            plan('Which explanation is right?', 'On the inelastic part $MR = P(1 + 1/\\varepsilon) < 0$, but the optimum needs $MR = MC > 0$', [
              ['Because inelastic demand means buyers do not care about price', 'That makes raising the price **more** attractive, which moves it off the inelastic part.'],
              ['Because the government forbids it', 'No law is involved: it is the profit calculation.'],
              ['Because elastic demand gives the most revenue', 'Revenue peaks at unit elasticity; the reason is that MR must be positive to equal a positive MC.'],
            ], 'Where $\\lvert\\varepsilon\\rvert < 1$, cutting output raises revenue and lowers cost: profit rises, so it keeps cutting.')),
          S(md`Which of these is **not** a barrier to entry that can sustain a monopoly?`,
            plan('Pick the one that is not a barrier', 'Many small sellers of an identical product', [
              ['A patent on the product', 'A patent legally blocks rivals for years: a classic barrier.'],
              ['Control of a key input', 'If rivals cannot get the input, they cannot enter.'],
              ['Large fixed costs with falling AC', 'Scale economies make one firm cheapest: a natural monopoly.'],
            ], 'Many small sellers of an identical good is the competitive case, the opposite of a barrier.')),
          S(md`A classmate says: "A monopolist charges the highest price any buyer is willing to pay."`,
            plan('What is wrong?', 'It picks the point on demand where $MR = MC$; a higher price sells too few units to maximize profit', [
              ['Nothing: that is how monopoly works', 'At the choke price it sells nothing and earns nothing.'],
              ['It charges $P = MC$', 'That is the competitive outcome.'],
              ['It charges the average of all buyers’ values', 'A single-price monopolist picks one price on the demand curve, from $MR = MC$.'],
            ], 'Demand still limits it: a higher price means fewer sales.')),
          S(md`A monopolist faces constant-elasticity demand $Q = kP^{-3}$ and has $MC = 20$. Find its price.`,
            plan('Which form of MR do you use?', '$MR = P(1 + 1/\\varepsilon) = P(1 - 1/3) = \\tfrac23 P$; set it equal to 20', [
              ['Invert and double the slope', 'That rule is for **linear** demand. Constant elasticity has $\\varepsilon = -3$ everywhere.'],
              ['$P = MC = 20$', 'That ignores the markup a monopolist charges.'],
              ['$MR = P(1 + \\varepsilon) = -2P$', 'The formula has $1/\\varepsilon$, not $\\varepsilon$.'],
            ], '$\\tfrac23 P = 20 \\Rightarrow P = 30$. Check: $L = 10/30 = 1/3 = -1/\\varepsilon$ ✓.')),
          S(md`A software firm's marginal cost is zero. Which output does it choose?`,
            plan('What is the condition?', '$MR = 0$: with no cost per unit, profit max is revenue max (unit-elastic point)', [
              ['As many copies as people will take at any price', 'Selling more lowers the price on all copies; past $MR = 0$, revenue falls.'],
              ['$P = 0$', 'That is $P = MC$, the efficient point, not the monopoly choice.'],
              ['Where demand is most inelastic', 'It stops exactly where $\\varepsilon = -1$.'],
            ], '$MR = MC = 0$; there $\\varepsilon = -1$ and the Lerner index is $L = 1$.')),
        ],
      },
      // ================================================================ set 5
      {
        id: 'm3-spot-5', title: 'Spot it: monopoly taxes and regulation', ref: 'Lecture 19 · DS10 Q1–Q2',
        steps: [
          intro('Set 5: monopoly taxes and regulation', md`The triggers: "specific tax on the monopolist", "ad valorem", "effective demand", "after-tax DWL", "pass-through", "constant elasticity", "natural monopoly", "price ceiling at $P = MC$ / $P = AC$", "which root", "subsidy".`),
          S(md`A monopolist faces $P = 100 - 2Q$ with $MC = 20$. The government levies an \$8 tax on each unit sold.`,
            plan('What is your first equation?', '$MR = MC + t$: $100 - 4Q = 28$', [
              ['$100 - 2Q = 28$', 'That is $P = MC + t$, a competitive industry’s response. A monopolist still uses MR.'],
              ['$100 - 4Q = 20$, then add \\$8 to the price', 'The firm reoptimizes: a higher marginal cost means less output.'],
              ['$100 - 4Q = 12$', 'The tax raises the cost of each unit: add it to MC.'],
            ], '$Q = 18$; $P_c = 100 - 36 = 64$; $P_p = 64 - 8 = 56$.'),
            plan('Before the tax the price was \\$60. What is the pass-through?', '$\\Delta P_c/t = 4/8 = \\tfrac12$', [
              ['1: the whole tax', 'With linear demand and constant MC a monopolist passes on exactly half.'],
              ['$64/8$', 'Pass-through is the **change** in the consumer price per dollar of tax.'],
              ['0: the monopolist absorbs it', 'Its MC rose, so it cut output and the price rose.'],
            ], 'Linear demand, constant MC: $dP_c/dt = \\tfrac12$.')),
          S(md`Same monopolist ($P = 100 - 2Q$, $MC = 20$), but instead consumers pay a 25% ad valorem tax. What curve does the monopolist effectively face?`,
            plan('Effective demand?', '$P_p = 0.75(100 - 2Q) = 75 - 1.5Q$, so effective $MR = 75 - 3Q$', [
              ['$P_p = 100 - 2Q - 25$', 'That is a \\$25 specific tax. An ad valorem tax takes a **share** of the price.'],
              ['$P_p = 1.25(100 - 2Q)$', 'The firm keeps less than buyers pay, not more.'],
              ['$P_p = 100 - 2Q$; the tax only changes $P_c$', 'The firm keeps 75% of every price, so its revenue curve shrinks.'],
            ], '$75 - 3Q = 20 \\Rightarrow Q = 18.33$; $P_c = 100 - 2Q = 63.33$ from **demand**; $P_p = 0.75 P_c = 47.5$.')),
          S(md`The 25% ad valorem tax and an \$6.67 specific tax lead this monopolist to the same output, 18.33 units. Which raises more tax revenue?`,
            plan('Which raises more, and why?', 'The ad valorem tax: same $Q$ and same $P_c$, but it takes 25% of \\$63.33 per unit (\\$15.83) instead of \\$6.67', [
              ['They raise the same, since output is the same', 'Same output means the same $P_c$, but the producer prices differ: 47.5 against 56.67.'],
              ['The specific tax, because it is a fixed amount', 'Per unit, the ad valorem tax takes \\$15.83, more than \\$6.67.'],
              ['It cannot be compared without elasticities', 'With the same $Q$, just compare $(P_c - P_p) \\times Q$.'],
            ], 'Revenue: ad valorem $15.83 \\times 18.33 \\approx 290$; specific $6.67 \\times 18.33 \\approx 122$.')),
          S(md`After the \$8 tax ($Q = 18$, $P_c = 64$), a classmate computes the after-tax DWL as the triangle between $Q = 18$ and the untaxed monopoly output $Q = 20$.`,
            plan('Against what quantity is the total after-tax DWL measured?', 'The efficient quantity from $P = MC$: $100 - 2Q = 20$, $Q = 40$', [
              ['The untaxed monopoly output, 20', 'That gives only the **extra** DWL from the tax. The total counts every lost unit from 18 to 40.'],
              ['The quantity where $MR = MC + t$', 'That is the taxed output itself.'],
              ['Zero output', 'Units 0 to 18 are still traded.'],
            ], 'Total DWL $= \\tfrac12(40 - 18)(64 - 20) = 484$; untaxed monopoly DWL $= \\tfrac12(40 - 20)(60 - 20) = 400$; the tax adds 84.')),
          S(md`A classmate says: "If the per-unit tax is collected from the monopolist's customers instead of from the monopolist, the customers bear all of it."`,
            plan('What is right?', 'Legal liability does not set incidence: the outcome ($P_c$, $P_p$, $Q$) is the same either way', [
              ['The classmate is right', 'If buyers send the tax, the monopolist’s effective demand falls by $t$, and it lands at the same $Q$ and prices.'],
              ['The monopolist then bears all of it', 'Either way, the split comes from demand and costs.'],
              ['It depends on who files the paperwork first', 'Paperwork does not change prices.'],
            ], 'Taxing buyers shifts the demand the firm sees down by $t$; taxing the firm shifts MC up by $t$. Same $MR = MC + t$.')),
          S(md`A monopolist faces constant-elasticity demand with $\varepsilon = -4$ and has $MC = 6$. A \$1 per-unit tax is imposed. By how much does the consumer price rise?`,
            plan('What relation do you use?', '$P(1 + 1/\\varepsilon) = MC + t$: $\\tfrac34 P = 6 + t$, so $P = \\tfrac43(6 + t)$', [
              ['Half the tax, as with linear demand', 'The one-half rule is for linear demand. Here the markup is a fixed multiple of cost.'],
              ['Exactly \\$1', 'That would need a fixed markup in dollars; here the markup is a fixed **percent**.'],
              ['$\\varepsilon$ changes, so it cannot be found', 'Constant elasticity: $\\varepsilon = -4$ at every price.'],
            ], 'Before $P = 8$, after $P = 9.33$: $dP_c/dt = e/(e - 1) = 4/3 \\approx 133\\%$, more than the tax.')),
          S(md`A local water company has a huge fixed cost for pipes and a constant marginal cost. One analyst calls it a natural monopoly. What evidence supports that?`,
            plan('What is the test?', 'AC is still falling where demand meets it: one firm can supply the whole market more cheaply than two', [
              ['It has a patent', 'A patent is a legal barrier, not a natural one.'],
              ['Its MC is lower than its price', 'Every monopoly has that. Natural monopoly is about costs: falling AC.'],
              ['It makes a big profit', 'Profit does not show why one firm is cheapest.'],
            ], 'With $C = F + cQ$, $AC = c + F/Q$ falls forever: splitting output between firms repeats the fixed cost.')),
          S(md`A natural monopoly faces $P = 50 - Q$ and has $C(Q) = 300 + 10Q$. Regulators set a price ceiling equal to marginal cost.`,
            plan('What are the regulated price and quantity?', '$P = MC = 10$; $Q$ from demand: $50 - Q = 10$, $Q = 40$', [
              ['$Q$ from $MR = MC$: 20', 'With a binding ceiling the firm sells where demand meets the ceiling price.'],
              ['$P = AC$', 'That is the other rule (average-cost pricing).'],
              ['$P = 10$, $Q$ from $MR = 10$', 'At a fixed price, the firm’s MR is the ceiling itself: it sells all buyers want.'],
            ], 'Efficient: $Q = 40$, $P = 10$.'),
            plan('Profit, and the long run?', '$\\pi = 400 - 700 = -300$: it exits in the long run unless subsidized \\$300', [
              ['Zero: price covers marginal cost', 'MC is below AC everywhere, so price = MC leaves the fixed cost unpaid.'],
              ['It stays: in the long run fixed costs vanish', 'In the long run the \\$300 is avoidable **by leaving**, which is what a loss makes it do.'],
              ['It shuts down this month', 'In the short run it covers its variable cost (price = AVC = 10), so it is indifferent; the pressure is in the long run.'],
            ], 'TR $= 10 \\times 40 = 400$; TC $= 300 + 400 = 700$. Needs a \\$300 subsidy.')),
          S(md`Same firm ($P = 50 - Q$, $C = 300 + 10Q$). Regulators instead set the price equal to average cost.`,
            plan('Which equation?', '$50 - Q = 10 + 300/Q$: price on demand equals AC', [
              ['$50 - 2Q = 10 + 300/Q$', 'The regulated price is the one buyers pay: it sits on **demand**, not MR.'],
              ['$10 = 10 + 300/Q$', 'MC never equals AC here: AC falls forever.'],
              ['$50 - Q = 10$', 'That is marginal-cost pricing.'],
            ], 'Multiply by $Q$: $Q^2 - 40Q + 300 = 0$.'),
            plan('The roots are 10 and 30. Which one?', '$Q = 30$, $P = 20$: the larger root', [
              ['$Q = 10$, $P = 40$', 'Also zero profit, but a higher price and less output; the regulator wants the larger quantity.'],
              ['Average them: 20', 'That is the unregulated monopoly output, not a root.'],
              ['Neither: the firm makes a loss', 'Both roots give exactly zero profit.'],
            ], '$Q = 30$, $P = 20$, $\\pi = 0$. Remaining DWL $= \\tfrac12(40 - 30)(20 - 10) = 50$.')),
          S(md`Compare the three outcomes for this water company: unregulated ($Q = 20$, $P = 30$), $P = AC$ ($Q = 30$, $P = 20$), $P = MC$ ($Q = 40$, $P = 10$).`,
            plan('Which statement is right?', 'Unregulated: profit 100, DWL 200. $P = AC$: zero profit, DWL 50. $P = MC$: no DWL, loss 300', [
              ['$P = MC$ is best in every way', 'It is efficient, but the firm cannot cover its costs without a subsidy.'],
              ['$P = AC$ removes all DWL', 'Output 30 is still below the efficient 40: a DWL of 50 remains.'],
              ['Regulation always lowers output', 'Both ceilings **raise** output here, by cutting the price toward MC.'],
            ], 'The trade-off: efficiency ($P = MC$) against cost recovery ($P = AC$).')),
          S(md`Same natural monopoly. A regulator sets a ceiling of \$25 (between the AC price \$20 and the monopoly price \$30). What happens?`,
            plan('What does the firm sell?', 'It sells what buyers want at \\$25: $Q = 25$, more than the unregulated 20', [
              ['It cuts output below 20', 'A binding ceiling makes the firm a price taker at \\$25 up to demand; each unit adds \\$25 at a cost of \\$10.'],
              ['It still uses $MR = MC$ and sells 20', 'Under the ceiling, MR is flat at \\$25 out to demand, so it sells 25.'],
              ['It exits', 'Profit is $25(25) - (300 + 250) = 75 > 0$.'],
            ], 'A ceiling on a monopoly can raise output: the firm no longer gains by restricting sales.')),
          S(md`Which policy is aimed at **preventing** monopoly power rather than regulating a monopoly's price?`,
            plan('Pick it', 'Antitrust law blocking a merger of the two largest firms', [
              ['A price ceiling at average cost', 'That regulates an existing monopoly’s price.'],
              ['A subsidy so a utility can price at marginal cost', 'That also regulates an existing monopoly.'],
              ['A per-unit tax on the monopolist', 'Taxes raise revenue; they do not stop market power.'],
            ], 'Preventing: antitrust, blocking mergers, encouraging entry. Regulating: price ceilings at MC or AC.')),
          S(md`A classmate argues: "A per-unit tax on a monopolist hurts only the monopolist, since it already charges the profit-maximizing price."`,
            plan('What is wrong?', 'The tax raises its marginal cost, so it cuts output and raises the price: consumers pay part of it', [
              ['Nothing: the monopolist absorbs all taxes', 'Its optimal price depends on MC; a higher MC means a higher price.'],
              ['Consumers pay all of it', 'With linear demand and constant MC, consumers pay half.'],
              ['The tax lowers the price', 'Higher MC never lowers the monopoly price.'],
            ], 'Linear demand, constant MC: pass-through $\\tfrac12$; constant elasticity: more than 1.')),
        ],
      },
      // ================================================================ mix
      {
        id: 'm3-spot-mix', title: 'Spot it: everything mixed', ref: 'Lectures 14–19 · DS8–DS10',
        steps: [
          R(md`
            ### Set 6: everything mixed

            On the exam the problems do not come labeled by Part. This set mixes them on purpose. First, five warm-up cards about **reading the first line** of a problem; then a stream of random cards from every Part.

            **How to use it.** Read the problem, name the trigger, say the first move, then pick. A card counts toward the meter only when your first pick is right, so do not guess: decide first. Fifteen first-try cards and you are reading problems the way the exam needs.

            If a card stumps you, look up its trigger in [the problem-type map](#/l/m3-map).
          `),
          S(md`A problem opens: "Firm X is the only seller of a patented drug. It faces demand $Q = 500 - 5P$ and has constant marginal cost \$20."`,
            plan('What kind of problem is it, and what is the first move?', 'Monopoly: invert demand ($P = 100 - Q/5$), write $MR = 100 - 2Q/5$, set $MR = MC$', [
              ['Competitive firm: $P = MC = 20$', '"Only seller" and a demand curve mean the firm sets its price: monopoly.'],
              ['Market problem: set demand equal to supply', 'There is no supply curve; a monopolist has none.'],
              ['Monopoly: $MR = 500 - 10P$', 'Double the slope of the **inverse** demand, not the direct one.'],
            ], '$100 - 0.4Q = 20 \\Rightarrow Q = 200$, $P = 60$.')),
          S(md`A problem opens: "Wheat farms are identical, each with long-run cost $LRC(q) = \ldots$. Market demand is $Q = \ldots$. Farms can freely enter and leave."`,
            plan('What is the first move?', 'Long run: find min LRAC (set $LRMC = LRAC$); that is the price', [
              ['Set $P = MC$ at the current price', 'There is no given price: free entry pins it at min LRAC.'],
              ['Find min AVC', 'That is the short-run shutdown test; this is the long run.'],
              ['Set $MR = MC$', 'Farms are price takers.'],
            ], 'Then $Q$ from demand at that price, and $n = Q/q^*$.')),
          S(md`A problem opens: "The government guarantees corn farmers \$4 a bushel and buys whatever consumers do not."`,
            plan('Which policy, and which quantities?', 'A price support: producers sell $Q_s(4)$, consumers buy $Q_d(4)$, the government buys the difference', [
              ['An ordinary floor: only $Q_d(4)$ is sold', '"Buys whatever consumers do not" makes it a support.'],
              ['A price ceiling at \\$4', 'A guaranteed minimum is a floor, not a ceiling.'],
              ['A subsidy of \\$4 per bushel', 'The government fixes the price; it does not pay \\$4 on top.'],
            ], 'Then CS, PS, spending $= 4(Q_s - Q_d)$, and $W = CS + PS - \\text{spending}$.')),
          S(md`A problem opens: "Gasoline demand is $Q_d = \ldots$ and supply $Q_s = \ldots$. A \$0.30 tax per gallon is paid by gas stations."`,
            plan('What is the first equation?', '$Q_d(P_c) = Q_s(P_p)$ with $P_c = P_p + 0.30$; who pays it legally does not matter', [
              ['Shift supply up and assume stations bear it all', 'The shift is right; the incidence comes out of the equilibrium, not the law.'],
              ['$P_c = P^* + 0.30$', 'Buyers do not usually pay the whole tax.'],
              ['$MR = MC + 0.30$', 'Gas stations here are a competitive market, not a monopoly.'],
            ], 'Solve for $P_p$, then $P_c$, $Q$, revenue $tQ$, DWL $\\tfrac12 t\\Delta Q$.')),
          S(md`A problem opens: "A city's water utility has a large fixed cost and constant marginal cost. Regulators want it to earn zero economic profit."`,
            plan('What is the first move?', 'Average-cost pricing: set demand equal to AC; solve the quadratic; take the larger root', [
              ['Set demand equal to MC', 'That is efficient but leaves a loss equal to the fixed cost.'],
              ['Set $MR = MC$', 'That is the unregulated monopoly.'],
              ['Set $MC = AC$', 'With falling AC they never meet.'],
            ], 'Then profit is zero and some DWL remains between the AC quantity and the $P = MC$ quantity.')),
          R(md`
            ### The stream: 15 first-try cards

            Each card below is drawn at random from more than 40 problems across every Part. Press **New problem** for the next one.
          `),
          G('m3_spot_any', { need: 15 }),
        ],
      },
    ],
  });
})();

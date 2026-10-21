/* Homework and discussion problems: DS5–DS7 rebuilt as blank problems with full solutions, the worked examples to redo
   from scratch, and homework-style sets for HW5–HW7 topics. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const VQ = { q: [1, 9] }, VY = { y: [1, 9] };

  // DS5 Q1: U = C^0.4 M^0.6, m = 24, pM = 2, pC 4 -> 3
  const UA = EC.U(0.4, 2.4, 7.2), UB = EC.U(0.4, 3.2, 7.2);
  const coffeeFig = EC.graph({
    w: 320, h: 270, x: [0, 9], y: [0, 13.5], xl: 'C\\ (\\text{coffee})', yl: 'M\\ (\\text{muffins})', xt: [6, 7.2, 8], yt: [10.8, 12],
    items: [
      { seg: [[0, 12], [6, 0]], cls: 'curve' },
      { seg: [[0, 12], [8, 0]], cls: 'curve c2' },
      { seg: [[0, 10.8], [7.2, 0]], cls: 'curve c3 dash' },
      { f: EC.ic(0.4, UA), from: 1.2, to: 8.8, cls: 'dim' }, { f: EC.ic(0.4, UB), from: 1.7, to: 8.8, cls: 'dim' },
      { pt: [2.4, 7.2], lab: 'A', at: 'tl' }, { pt: [3.2, 7.2], lab: 'B', at: 'tr' }, { pt: [2.88, 6.48], lab: 'C', at: 'bl' },
    ],
  });
  const gasFig = EC.graph({
    w: 320, h: 240, x: [0, 3000], y: [0, 6], xl: 'Q', yl: 'P', xt: [[750, '750'], [2000, '2000'], [2750, '2750']], yt: [4, 5],
    items: [
      { seg: [[0, 4], [2000, 0]], cls: 'curve c2', lab: 'P(q_B)', at: 0.6, dx: -4, dy: 4, anchor: 'tr' },
      { seg: [[0, 5], [750, 0]], cls: 'curve c4', lab: 'P(q_F)', at: 0.7, dx: -6, dy: 0, anchor: 'r' },
      { pts: [[0, 5], [150, 4], [2750, 0]], cls: 'curve c3', lab: 'P(Q)', labI: 2, dx: -2, dy: -8, anchor: 'br' },
      { pt: [150, 4], lab: '(150,\\,4)', at: 'tr' },
    ],
  });
  const mA = 30, jUA = EC.U(0.4, 12, 18), jUB = EC.U(0.4, 6, 18), mC = mA * Math.pow(2, 0.4), mE = mA * Math.pow(2, -0.4);
  const jesseFig = EC.graph({
    w: 330, h: 290, x: [0, 34], y: [0, 44], xl: 'q_1', yl: 'q_2', xt: [15, 30], yt: [30],
    items: [
      { seg: [[0, 30], [30, 0]], cls: 'curve', lab: '\\text{old}', at: 0.93, dx: 4, dy: -4 },
      { seg: [[0, 30], [15, 0]], cls: 'curve c2', lab: '\\text{new}', at: 0.85, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, mC], [mC / 2, 0]], cls: 'curve c3 dash', lab: 'CV', at: 0.04, dx: 6, dy: 0, anchor: 'l' },
      { seg: [[0, mE], [mE, 0]], cls: 'curve c4 dash', lab: 'EV', at: 0.92, dx: 6, dy: 0, anchor: 'l' },
      { f: EC.ic(0.4, jUA), from: 4.2, to: 33, cls: 'dim' }, { f: EC.ic(0.4, jUB), from: 2.4, to: 33, cls: 'dim' },
      { pt: [12, 18], lab: 'A', at: 'tr' }, { pt: [6, 18], lab: 'B', at: 'tl' }, { pt: [mC * 0.2, mC * 0.6], lab: 'C', at: 'tr' }, { pt: [mE * 0.4, mE * 0.6], lab: 'D', at: 'bl' },
    ],
  });

  // ------------------------------------------------------------------ DS5
  const ds5 = [
    R(md`
      Work every part on paper first, then type your answers. Each problem has hints and a full worked solution.

      **Problem 1 setup.** A student buys coffee ($C$) and muffins ($M$) with $U(C, M) = C^{0.4}M^{0.6}$. Budget \$24, muffins cost \$2. Coffee **falls** from \$4 to \$3.
    `),
    P({ src: 'DS5 · 1a', q: md`Find the optimal bundles **before** (A) and **after** (B) the price change.`,
      parts: [N('C^A', 2.4), N('M^A', 7.2), N('C^B', 3.2), N('M^B', 7.2)],
      hints: ['Cobb–Douglas: $C = 0.4m/p_C$ and $M = 0.6m/p_M$.', 'Muffin demand does not involve $p_C$.'],
      sol: md`Before: $C = 0.4(24)/4 = 2.4$, $M = 0.6(24)/2 = 7.2$. After: $C = 0.4(24)/3 = 3.2$, $M = 7.2$ (unchanged: with Cobb–Douglas, spending on muffins is always 60% of income no matter what coffee costs).` }),
    P({ src: 'DS5 · 1b–1d', q: md`Graph the budget lines. Where does each line hit the axes?`,
      parts: [N('\\text{old line, coffee intercept}', 6), N('\\text{new line, coffee intercept}', 8), N('\\text{muffin intercept (both)}', 12)],
      sol: md`Old: $4C + 2M = 24$ hits $C = 6$ and $M = 12$. New: $3C + 2M = 24$ hits $C = 8$ and $M = 12$. The line **pivots out** around the muffin intercept.

      [[fig:g]]`, figs: { g: { svg: coffeeFig, cap: 'Blue: old budget line. Orange: new budget line. Green dashed: compensated line (new prices, income just enough to buy A).' } } }),
    P({ src: 'DS5 · 1c', q: md`What adjusted income makes the original bundle A just affordable at the **new** prices? Then find the compensated bundle C.`,
      parts: [N("m'", 21.6), N('C^C', 2.88), N('M^C', 6.48)],
      hints: ["$m' = p_C^{\\text{new}}C^A + p_MM^A$.", 'C uses new prices with income $m\'$.'],
      sol: md`$m' = 3(2.4) + 2(7.2) = 7.2 + 14.4 = 21.6$. Compensated bundle: $C = 0.4(21.6)/3 = 2.88$, $M = 0.6(21.6)/2 = 6.48$.

      Why less income? Coffee got cheaper, so the old bundle costs less now. We take away just enough income that the student can still **barely** buy A.` }),
    P({ src: 'DS5 · 1e', q: md`Decompose the change in coffee into substitution and income effects.`,
      parts: [N('\\text{total effect}', 0.8), N('\\text{substitution effect}', 0.48), N('\\text{income effect}', 0.32),
        FIX('Coffee is…', ['normal', 'inferior', 'Giffen'], 0, [null, 'The income effect has the same sign as the substitution effect here.', 'Total effect is positive after a price drop: ordinary.'])],
      hints: ['Total = B − A; substitution = C − A; income = B − C.'],
      sol: md`Total $= 3.2 - 2.4 = 0.8$. Substitution $= 2.88 - 2.4 = 0.48$ (coffee got relatively cheaper, so buy more). Income $= 3.2 - 2.88 = 0.32$ (purchasing power went up, so buy more of a normal good). $0.48 + 0.32 = 0.8$ ✓.` }),
    R(md`
      **Problem 2 setup.** In a town, Buick owners demand gasoline $q_B = 2000 - 500P$ and Ford owners $q_F = 750 - 150P$ (gallons per week, \$ per gallon).
    `),
    P({ src: 'DS5 · 2a', q: md`At what price does each group enter the market?`,
      parts: [N('\\text{Buick owners}', 4), N('\\text{Ford owners}', 5)],
      hints: ['Set each demand to zero.'],
      sol: md`$2000 - 500P = 0 \Rightarrow P = 4$. $750 - 150P = 0 \Rightarrow P = 5$. Fords buy whenever $P < 5$; Buicks only when $P < 4$.` }),
    P({ src: 'DS5 · 2b', q: md`Find market demand $Q(P)$ on each price range.`,
      parts: [X('Q(P)\\text{ for } 0 \\le P \\le 4', '2750 - 650*P', { P: [0, 4] }), X('Q(P)\\text{ for } 4 < P \\le 5', '750 - 150*P', { P: [4, 5] })],
      hints: ['Between \\$4 and \\$5 only Ford owners buy.'],
      sol: md`$4 < P \le 5$: only Fords, $Q = 750 - 150P$. $0 \le P \le 4$: both, $Q = (2000 - 500P) + (750 - 150P) = 2750 - 650P$.` }),
    P({ src: 'DS5 · 2c–2d', q: md`Find the market quantity at the ends of each range, then sketch.`,
      parts: [N('Q(0)', 2750), N('Q(4)', 150), N('Q(5)', 0)],
      sol: md`$Q(0) = 2750$, $Q(4) = 750 - 600 = 150$ (both formulas agree at the kink), $Q(5) = 0$.

      [[fig:g]]`, figs: { g: { svg: gasFig, cap: 'The market curve follows the Ford curve above \\$4 and bends out at the kink (150, 4).' } } }),
    P({ src: 'DS5 · 2e–2g', q: md`(e) Total quantity at \$3? (f) At \$1, how much does weekly demand change if the price rises by \$0.10? (g) Same question at \$10.`,
      parts: [N('Q(3)', 800), N('\\Delta Q\\text{ at \\$1}', -65), N('\\Delta Q\\text{ at \\$10}', 0)],
      hints: ['\\$3 is below the kink: use $2750 - 650P$.', 'At \\$10, nobody is buying.'],
      sol: md`(e) $Q(3) = 2750 - 1950 = 800$. (f) On the lower segment, slope $-650$: $\Delta Q = -650 \times 0.10 = -65$ gallons. (g) \$10 is above both choke prices, so $Q = 0$ and it cannot fall further: $\Delta Q = 0$.` }),
  ];

  // ------------------------------------------------------------------ DS6
  const ds6 = [
    R(md`**Problem 2 setup.** Rocky’s demand for glasses of milk is $q(p) = 100 - p$, with $p$ in **cents**.`),
    P({ src: 'DS6 · 2a–2d', q: md`The price is 50¢. Find (a) glasses bought, (b) total willingness to pay, (c) spending, (d) consumer surplus. Answer in cents.`,
      parts: [N('q', 50), N('\\text{TWTP}', 3750), N('\\text{spending}', 2500), N('CS', 1250)],
      hints: ['Inverse demand $p = 100 - q$. TWTP = area under it from 0 to 50.', 'Area under a line from 0 to 50: a trapezoid with heights 100 and 50.'],
      sol: md`(a) $q = 50$. (b) $\text{TWTP} = \int_0^{50}(100 - q)\,dq = 100(50) - 50^2/2 = 3750$¢ (trapezoid: $\tfrac{100 + 50}{2} \times 50$). (c) $50 \times 50 = 2500$¢. (d) $CS = 3750 - 2500 = 1250$¢ $= \$12.50$.` }),
    P({ src: 'DS6 · 2e', q: md`The price rises from 50¢ to 60¢. What is Rocky’s change in consumer surplus (in cents)?`,
      parts: [N('CS\\text{ at 60 cents}', 800), N('\\Delta CS', -450)],
      hints: ['At 60¢, $q = 40$.'],
      sol: md`New CS $= \tfrac12 \times 40 \times (100 - 60) = 800$. $\Delta CS = 800 - 1250 = -450$¢ (a loss of \$4.50). Pieces: $40 \times 10 = 400$ on the glasses still bought plus $\tfrac12 \times 10 \times 10 = 50$ on the glasses no longer bought.` }),
    R(md`**Problem 3 setup.** Jesse buys pizza ($q_1$) and soda ($q_2$): $U = q_1^{0.4}q_2^{0.6}$. Budget \$30, soda \$1. Pizza **doubles** from \$1 to \$2.`),
    P({ src: 'DS6 · 3a', q: md`Find Jesse’s optimal bundles before and after, and the two budget lines.`,
      parts: [N('q_1^A', 12), N('q_2^A', 18), N('q_1^B', 6), N('q_2^B', 18), N('\\text{new line, pizza intercept}', 15)],
      sol: md`Before: $q_1 = 0.4(30)/1 = 12$, $q_2 = 0.6(30)/1 = 18$; budget $q_1 + q_2 = 30$. After: $q_1 = 0.4(30)/2 = 6$, $q_2 = 18$; budget $2q_1 + q_2 = 30$, which hits the pizza axis at 15.` }),
    P({ src: 'DS6 · 3b–3e', q: md`Draw both budget lines, the indifference curves through A and B, the CV line (tangent point C) and the EV line (tangent point D). Then answer.`,
      parts: [FIX('The CV line is parallel to…', ['the new budget line', 'the original budget line'], 0, [null, 'CV uses new prices.']),
        FIX('The CV line is tangent to…', ['the original indifference curve', 'the new indifference curve'], 0, [null, 'CV restores the original utility.']),
        FIX('The EV line is parallel to…', ['the new budget line', 'the original budget line'], 1, ['EV uses original prices.', null]),
        FIX('The EV line is tangent to…', ['the original indifference curve', 'the new indifference curve'], 1, ['EV lands on the new utility.', null])],
      sol: md`[[fig:j]]

      CV: parallel to the new line, pushed out to touch $U_A$ at C. EV: parallel to the old line, pushed in to touch $U_B$ at D.`, figs: { j: { svg: jesseFig, cap: 'Jesse: CV (green) and EV (purple) budget lines.' } } }),
    P({ src: 'DS6 · 3d, 3f, 3g', q: md`Complete the table for this price **increase**.`,
      parts: [FIX('CV: income is…', ['given', 'taken away'], 0, [null, 'He is worse off after the increase; restoring him takes money.']),
        FIX('CV holds which utility fixed?', ['original', 'new'], 0, [null, 'CV restores the original utility.']),
        FIX('CV uses which prices?', ['original', 'new'], 1, ['CV is after the change.', null]),
        FIX('EV: income is…', ['given', 'taken away'], 1, ['EV moves the old line down.', null]),
        FIX('EV holds which utility fixed?', ['original', 'new'], 1, ['EV lands on the new utility.', null]),
        FIX('EV uses which prices?', ['original', 'new'], 0, [null, 'EV is measured at the old prices.'])],
      sol: md`| Measure | Prices used | Utility held fixed | Price increase: income is… |
      |---|---|---|---|
      | CV | new | original | given |
      | EV | original | new | taken away |

      For Jesse, $CV \approx \$9.59$ and $EV \approx \$7.26$; $|\Delta CS| \approx \$8.32$ sits between them, as it always does.` }),
    Q(md`For Jesse, which is the correct ordering of the welfare measures (pizza is a normal good)?`, ['CV > |ΔCS| > EV', 'EV > |ΔCS| > CV', '|ΔCS| > CV > EV', 'CV = |ΔCS| = EV'], 0,
      [null, 'That is the inferior-good order.', 'ΔCS lies between CV and EV.', 'They differ because of the income effect.'],
      md`Normal good: $CV > |\Delta CS| > EV$, here $9.59 > 8.32 > 7.26$.`),
  ];

  // ------------------------------------------------------------------ DS7
  const ds7 = [
    R(md`**Problem 1 setup.** Dent repairs cars. His total cost of repairing $q$ cars is $TC(q) = 220q - 4q^2 + 0.6q^3 + 800$.`),
    P({ src: 'DS7 · 1a–1f', q: md`Write out each cost function.`,
      parts: [X('TVC', '220*q - 4*q^2 + 0.6*q^3', VQ), N('TFC', 800), X('AVC', '220 - 4*q + 0.6*q^2', VQ), X('AFC', '800/q', VQ), X('ATC', '220 - 4*q + 0.6*q^2 + 800/q', VQ), X('MC', '220 - 8*q + 1.8*q^2', VQ)],
      hints: ['The constant is the fixed cost.', 'Averages: divide by $q$. MC: differentiate TC.'],
      sol: md`TVC $= 220q - 4q^2 + 0.6q^3$; TFC $= 800$. AVC $= 220 - 4q + 0.6q^2$; AFC $= 800/q$; ATC $= 220 - 4q + 0.6q^2 + 800/q$. MC $= 220 - 8q + 1.8q^2$.` }),
    P({ src: 'DS7 · 1g', q: md`Dent’s **long-run** cost is $TC(q) = 380q - 12q^2 + 0.6q^3$. How many cars minimize long-run average cost?`,
      parts: [X('LRAC', '380 - 12*q + 0.6*q^2', VQ), N('q^*', 10), N('\\min LRAC', 320)],
      hints: ['Divide by $q$, then set the derivative to zero.'],
      sol: md`$LRAC = 380 - 12q + 0.6q^2$. $dLRAC/dq = -12 + 1.2q = 0 \Rightarrow q = 10$. $LRAC(10) = 380 - 120 + 60 = 320$. (Check with $LRMC = 380 - 24q + 1.8q^2$: at 10, $380 - 240 + 180 = 320 = LRAC$ ✓.)` }),
    R(md`**Problem 2 setup.** Dragan sells software: $f(x_1, x_2) = x_1 + 2x_2$, where $x_1$ is unskilled and $x_2$ is skilled labor.`),
    P({ src: 'DS7 · 2a–2c', q: md`(a) Returns to scale? (b) Unskilled labor needed for $q$ units if he uses only unskilled. (c) Skilled labor needed if only skilled.`,
      parts: [FIX('(a) Returns to scale', ['increasing', 'constant', 'decreasing'], 1, ['Pull out $k$: exactly $kq$.', null, 'Pull out $k$: exactly $kq$.']), X('(b)\\ x_1', 'q', VQ), X('(c)\\ x_2', 'q/2', VQ)],
      sol: md`(a) $kx_1 + 2kx_2 = k(x_1 + 2x_2)$: constant returns. (b) $x_1 = q$. (c) $2x_2 = q \Rightarrow x_2 = q/2$.` }),
    P({ src: 'DS7 · 2d', q: md`With $(w_1, w_2) = (1, 1)$, find the cost-efficient bundle for 20 units and its cost.`,
      parts: [N('x_1^*', 0), N('x_2^*', 10), N('C', 10)],
      hints: ['Cost per unit of output: unskilled $1/1$, skilled $1/2$.'],
      sol: md`Skilled labor makes 2 units for \$1, so \$0.50 per unit; unskilled makes 1 unit for \$1. Use only skilled: $x_2 = 10$, $x_1 = 0$, cost \$10.` }),
    P({ src: 'DS7 · 2e', q: md`For general prices $(w_1, w_2)$, what is the cost-efficient bundle for $q$ units?`,
      parts: [FIX('If $w_1 < w_2/2$, use…', ['$(q, 0)$', '$(0, q/2)$', 'any bundle with $x_1 + 2x_2 = q$'], 0, [null, 'Unskilled is cheaper per unit of output here.', 'Only when costs per output tie.']),
        FIX('If $w_1 > w_2/2$, use…', ['$(q, 0)$', '$(0, q/2)$', 'any bundle with $x_1 + 2x_2 = q$'], 1, ['Skilled is cheaper per unit of output here.', null, 'Only when costs per output tie.']),
        FIX('If $w_1 = w_2/2$…', ['$(q, 0)$ only', '$(0, q/2)$ only', 'any bundle on the isoquant'], 2, ['Both cost the same per output.', 'Both cost the same per output.', null])],
      sol: md`Compare cost per unit of output: $w_1/1$ versus $w_2/2$. Use only the cheaper input. If they tie, every bundle on the isoquant costs the same.` }),
    R(md`**Problem 3 setup.** Fran makes brass sculptures: $f(x_1, x_2) = \min\{x_1, 2x_2\}$, where $x_1$ is copper and $x_2$ is zinc.`),
    P({ src: 'DS7 · 3a–3c', q: md`(a) Returns to scale? (b) Copper and zinc needed for 10 sculptures. (c) With $(w_1, w_2) = (1, 1)$, the cost-efficient bundle for 10 sculptures and its cost.`,
      parts: [FIX('(a) Returns to scale', ['increasing', 'constant', 'decreasing'], 1), N('x_1', 10), N('x_2', 5), N('C', 15)],
      hints: ['Set each term equal to 10.'],
      sol: md`(a) $\min\{kx_1, 2kx_2\} = k\min\{x_1, 2x_2\}$: constant returns. (b) $x_1 = 10$ and $2x_2 = 10 \Rightarrow x_2 = 5$. (c) Fixed proportions, so prices don’t change the mix: $(10, 5)$, cost $10 + 5 = \$15$.` }),
  ];

  // ------------------------------------------------------------------ worked examples to redo
  const redo = [
    R(md`These are the standard examples of each topic. Try each one **cold**, without looking back at the lesson.`),
    P({ src: 'Example · income', q: md`$U = x_1^{0.5}x_2^{0.5}$ (so $x_1 = m/(2p_1)$), $p_1 = \$2$, $p_2 = \$2$. Income rises from \$40 to \$80. Find $x_1$ before and after, and write the Engel curve for good 1.`,
      parts: [N('x_1\\text{ at }m = 40', 10), N('x_1\\text{ at }m = 80', 20), X('m(x_1)', '4*x1', { x1: [1, 9] })],
      sol: md`$x_1 = m/4$: 10, then 20. Engel curve: $m = 4x_1$, an upward line, so good 1 is normal.` }),
    P({ src: 'Example · Slutsky', q: md`$x_1 = m/(2p_1)$, $x_2 = m/(2p_2)$, $m = \$40$, $p_2 = \$2$. $p_1$ rises from \$2 to \$4. Decompose the change in $x_1$.`,
      parts: [N('x_1^A', 10), N('x_1^B', 5), N("m'", 60), N('x_1^C', 7.5), N('\\text{substitution}', -2.5), N('\\text{income}', -2.5)],
      sol: md`$A = (10, 10)$, $B = (5, 10)$. $m' = 4(10) + 2(10) = 60$. $C$: $x_1 = 60/8 = 7.5$. Substitution $7.5 - 10 = -2.5$; income $5 - 7.5 = -2.5$; total $-5$.` }),
    P({ src: 'Example · market demand', q: md`$q_1 = 20 - P$, $q_2 = 10 - 2P$, $q_3 = 4 - 2P$. Find the market demand on each price range and the quantities at the kinks.`,
      parts: [X('Q\\ (0 \\le P \\le 2)', '34 - 5*P', { P: [0, 2] }), X('Q\\ (2 < P \\le 5)', '30 - 3*P', { P: [2, 5] }), X('Q\\ (5 < P \\le 20)', '20 - P', { P: [5, 20] }), N('Q(2)', 24), N('Q(5)', 15)],
      sol: md`Choke prices 20, 5, 2. $Q = 34 - 5P$ for $P \le 2$; $30 - 3P$ for $2 < P \le 5$; $20 - P$ for $5 < P \le 20$. $Q(2) = 24$, $Q(5) = 15$, $Q(0) = 34$.` }),
    P({ src: 'Example · consumer surplus', q: md`Demand $P = 12.5 - 2.5Q$. The price falls from \$5 to \$2.50. Fill in the table and find ΔCS.`,
      parts: [N('Q\\text{ before}', 3), N('Q\\text{ after}', 4), N('CS\\text{ before}', 11.25), N('CS\\text{ after}', 20), N('\\Delta CS', 8.75)],
      sol: md`Before: $Q = 3$, CS $= \tfrac12(3)(7.5) = 11.25$. After: $Q = 4$, CS $= \tfrac12(4)(10) = 20$. $\Delta CS = +8.75$: positive because a price cut makes buyers better off.` }),
    P({ src: 'Example · cost minimization', q: md`Candy: $y = 4\sqrt{x_1x_2}$, $w_1 = \$16$, $w_2 = \$4$, target 80. Find the bundle, cost, and $C(y)$.`,
      parts: [N('x_1^*', 10), N('x_2^*', 40), N('C', 320), X('C(y)', '4*y', VY)],
      sol: md`Tangency $x_2/x_1 = 16/4 = 4$. Target $4\sqrt{4x_1^2} = 8x_1 = 80 \Rightarrow x_1 = 10$, $x_2 = 40$. $C = 160 + 160 = 320$. In general $x_1 = y/8$, $x_2 = y/2$, $C(y) = 4y$.` }),
    P({ src: 'Example · cost curves', q: md`$VC(y) = y^3 - 6y^2 + 13y$, $F = 32$. Find the output that minimizes AVC, min AVC, and ATC and MC at $y = 4$.`,
      parts: [N('y\\text{ at min AVC}', 3), N('\\min AVC', 4), N('ATC(4)', 13), N('MC(4)', 13)],
      sol: md`$AVC = y^2 - 6y + 13$, $MC = 3y^2 - 12y + 13$. $MC = AVC \Rightarrow 2y^2 - 6y = 0 \Rightarrow y = 3$, AVC $= 4$. At 4: $TC = 52$, $ATC = 13$, $MC = 13$: the minimum of ATC.` }),
    Q(md`At $y = 10$ a medium plant costs \$120, but the long-run minimum cost is \$100. If output stays at 10, the firm should, in the long run…`, ['switch to a smaller plant', 'keep the medium plant', 'expand to spread fixed cost', 'cut output to the AC minimum'], 0,
      [null, 'It is paying \\$20 more than necessary.', 'The question fixes output at 10.', 'The question fixes output at 10.'],
      md`A smaller plant makes 10 units for \$100, saving \$20.`),
  ];

  // ------------------------------------------------------------------ HW5-style
  const hw5 = [
    R(md`Homework 5 topics: income and price effects, market demand, elasticity. Each problem is in the style of the homework; work it fully on paper.`),
    P({ src: 'HW5-style · 1', q: md`Lisa’s demand for movie tickets is $x = 0.25m/p$. Tickets cost \$10.

      (a) How many tickets does she buy with \$200 of income? (b) With \$400? (c) Write her Engel curve. (d) What is her income elasticity of demand?`,
      parts: [N('(a)', 5), N('(b)', 10), X('(c)\\ m(x)', '40*x', { x: [1, 9] }), N('(d)\\ \\varepsilon_m', 1)],
      hints: ['$\\varepsilon_m = \\dfrac{dx}{dm}\\cdot\\dfrac{m}{x}$.'],
      sol: md`(a) $0.25(200)/10 = 5$. (b) $10$. (c) $m = 40x$. (d) $dx/dm = 0.025$, so $\varepsilon_m = 0.025 \times 200/5 = 1$. Cobb–Douglas demand always has income elasticity 1: doubling income doubles quantity.` }),
    P({ src: 'HW5-style · 2', q: md`Demand for good 1 is $x_1 = 40 - 3p_1 + 2p_2 - 0.01m$.

      (a) Is good 1 normal or inferior? (b) Are goods 1 and 2 substitutes or complements? (c) If $p_2$ rises by \$3, how does $x_1$ change?`,
      parts: [FIX('(a)', ['normal', 'inferior'], 1, ['The coefficient on $m$ is negative.', null]), FIX('(b)', ['gross substitutes', 'gross complements'], 0, [null, '$\\partial x_1/\\partial p_2 = +2$.']), N('(c)\\ \\Delta x_1', 6)],
      sol: md`(a) $\partial x_1/\partial m = -0.01 < 0$: inferior. (b) $\partial x_1/\partial p_2 = 2 > 0$: gross substitutes. (c) $\Delta x_1 = 2 \times 3 = 6$.` }),
    P({ src: 'HW5-style · 3', q: md`$U = x_1^{0.25}x_2^{0.75}$, $m = \$80$, $p_2 = \$1$. The price of good 1 rises from \$1 to \$4.

      Find A, B, the Slutsky income, C, and the substitution and income effects on good 1.`,
      parts: [N('x_1^A', 20), N('x_1^B', 5), N("m'", 140), N('x_1^C', 8.75), N('\\text{substitution}', -11.25), N('\\text{income}', -3.75)],
      hints: ['$x_2^A = 0.75(80)/1 = 60$.', "$m' = 4(20) + 1(60)$."],
      sol: md`A: $x_1 = 0.25(80)/1 = 20$, $x_2 = 60$. B: $x_1 = 20/4 = 5$. $m' = 4(20) + 60 = 140$. C: $x_1 = 0.25(140)/4 = 8.75$. Substitution $= 8.75 - 20 = -11.25$; income $= 5 - 8.75 = -3.75$; total $-15$ ✓.` }),
    P({ src: 'HW5-style · 4', q: md`Two types of buyers for e-scooters: students $q_s = 300 - 3P$ and commuters $q_c = 200 - P$.

      (a) Each group’s choke price. (b) Market demand when both buy. (c) Quantity at $P = 120$. (d) Quantity at $P = 50$.`,
      parts: [N('(a)\\text{ students}', 100), N('(a)\\text{ commuters}', 200), X('(b)\\ Q(P)', '500 - 4*P', { P: [0, 100] }), N('(c)', 80), N('(d)', 300)],
      hints: ['At $P = 120$ students are out of the market.'],
      sol: md`(a) Students \$100, commuters \$200. (b) For $P \le 100$: $Q = 500 - 4P$. (c) At 120 only commuters: $Q = 80$. (d) $500 - 200 = 300$.` }),
    P({ src: 'HW5-style · 5', q: md`Demand for concert tickets: $Q = 1000 - 20P$.

      (a) Price elasticity at $P = 20$. (b) At $P = 30$. (c) At what price is demand unit elastic? (d) At $P = 30$, does a small price **cut** raise or lower revenue?`,
      parts: [N('(a)', -2 / 3), N('(b)', -1.5), N('(c)', 25), FIX('(d) Revenue…', ['rises', 'falls', 'unchanged'], 0, [null, 'Demand is elastic at \\$30.', 'Only at unit elasticity.'])],
      hints: ['$\\varepsilon = -20P/Q$.', 'Unit elastic at the midpoint of a linear demand.'],
      sol: md`(a) $Q = 600$, $\varepsilon = -20(20)/600 = -0.667$. (b) $Q = 400$, $\varepsilon = -600/400 = -1.5$. (c) Midpoint: choke price is 50, so $P = 25$. (d) Elastic at \$30, so a price cut raises quantity by a bigger percent: revenue **rises**.` }),
    P({ src: 'HW5-style · 6', q: md`Demand for coffee is $Q = 600P^{-0.4}$.

      (a) Price elasticity at $P = 3$. (b) If the price rises 10%, by roughly what percent does quantity change? (c) Does revenue rise or fall?`,
      parts: [N('(a)', -0.4), N('(b)\\ \\%\\Delta Q', -4), FIX('(c)', ['rises', 'falls'], 0, [null, 'Inelastic demand: revenue moves with price.'])],
      sol: md`(a) Constant elasticity: $-0.4$ at every price. (b) $\%\Delta Q \approx -0.4 \times 10\% = -4\%$. (c) Price up 10%, quantity down 4%: revenue rises (by about 6%).` }),
    P({ src: 'HW5-style · 7', q: md`When Tom’s income rises from \$40,000 to \$44,000, his spending on dining out rises from 20 meals to 24 meals a month.

      (a) Percent change in income. (b) Percent change in quantity. (c) Income elasticity. (d) Classify.`,
      parts: [N('(a)', 10), N('(b)', 20), N('(c)', 2), FIX('(d)', ['necessity', 'luxury', 'inferior'], 1, ['Needs $0 < \\varepsilon_m < 1$.', null, 'Needs $\\varepsilon_m < 0$.'])],
      sol: md`(a) $4000/40000 = 10\%$. (b) $4/20 = 20\%$. (c) $20/10 = 2$. (d) $\varepsilon_m > 1$: a luxury.` }),
    G('income_mix', { need: 2 }), G('market_demand', { need: 2 }), G('elasticity', { need: 2 }),
  ];

  // ------------------------------------------------------------------ HW6-style
  const hw6 = [
    R(md`Homework 6 topics: consumer welfare and production functions.`),
    P({ src: 'HW6-style · 1', q: md`Willingness to pay for concert t-shirts: 1st \$30, 2nd \$22, 3rd \$15, 4th \$9, 5th \$4. Shirts cost \$12.

      (a) Shirts bought. (b) TWTP. (c) Spending. (d) CS. (e) The price rises to \$16. New CS?`,
      parts: [N('(a)', 3), N('(b)', 67), N('(c)', 36), N('(d)', 31), N('(e)', 20)],
      hints: ['At \\$16 only the first two shirts are worth it.'],
      sol: md`(a) WTP ≥ 12: shirts 1–3. (b) $30 + 22 + 15 = 67$. (c) $3 \times 12 = 36$. (d) $67 - 36 = 31$. (e) At \$16 buy 2: CS $= (30 - 16) + (22 - 16) = 14 + 6 = 20$.` }),
    P({ src: 'HW6-style · 2', q: md`Market demand for strawberries is $Q = 100 - 5P$ (pounds, \$/lb). A frost raises the price from \$8 to \$12.

      (a) CS at \$8. (b) CS at \$12. (c) ΔCS. (d) The rectangle part of the loss.`,
      parts: [N('(a)', 360), N('(b)', 160), N('(c)', -200), N('(d)', 160)],
      hints: ['Choke price: \\$20. At \\$8, $Q = 60$; at \\$12, $Q = 40$.'],
      sol: md`(a) $Q = 60$: $\tfrac12(60)(20 - 8) = 360$. (b) $Q = 40$: $\tfrac12(40)(8) = 160$. (c) $-200$. (d) Rectangle $= 40 \times 4 = 160$; triangle $= \tfrac12(20)(4) = 40$; $160 + 40 = 200$ ✓.` }),
    P({ src: 'HW6-style · 3', q: md`The price of gasoline **falls**. Gasoline is a normal good.`,
      parts: [FIX('CV: income is…', ['given', 'taken away'], 1, ['After a price fall he is better off; to return him to the old utility, take income away.', null]),
        FIX('EV: income is…', ['given', 'taken away'], 0, [null, 'At old prices, reaching the new (higher) utility needs extra income.']),
        FIX('Ordering of sizes', ['EV > |ΔCS| > CV', 'CV > |ΔCS| > EV'], 0, [null, 'For a price fall of a normal good, EV is the biggest.'])],
      sol: md`CV (new prices, old utility) takes income away; EV (old prices, new utility) gives income. For a price **fall** of a normal good, $EV > |\Delta CS| > CV$. (For a price **rise**, $CV > |\Delta CS| > EV$.) Tip: the measure that uses the **higher** prices needs more money to reach a given utility, so it is the larger one.` }),
    P({ src: 'HW6-style · 4', q: md`$y = 6L^{0.5}K^{0.5}$ ($L$ labor, $K$ capital). The firm uses $L = 16$, $K = 4$.

      (a) Output. (b) $MP_L$. (c) $MP_K$. (d) TRS. (e) Returns to scale.`,
      parts: [N('(a)', 48), N('(b)', 1.5), N('(c)', 6), N('(d)', -0.25), FIX('(e)', ['increasing', 'constant', 'decreasing'], 1)],
      hints: ['$MP_L = 3L^{-0.5}K^{0.5}$.'],
      sol: md`(a) $6 \times 4 \times 2 = 48$. (b) $MP_L = 3 \cdot \tfrac14 \cdot 2 = 1.5$. (c) $MP_K = 3 \cdot 4 \cdot \tfrac12 = 6$. (d) $-1.5/6 = -0.25$ (with labor on the horizontal axis). (e) $0.5 + 0.5 = 1$: CRS.` }),
    P({ src: 'HW6-style · 5', q: md`A short-run production function for a farm with fixed land: $y = 10L - L^2$ (bushels, $L$ workers).

      (a) $MP_L$ as a function of $L$. (b) $MP_L$ at $L = 2$. (c) At $L = 4$. (d) At what $L$ does $MP_L$ hit zero?`,
      parts: [X('(a)', '10 - 2*L', { L: [0, 5] }), N('(b)', 6), N('(c)', 2), N('(d)', 5)],
      sol: md`(a) $MP_L = 10 - 2L$. (b) 6. (c) 2. (d) $10 - 2L = 0 \Rightarrow L = 5$. Each extra worker adds less: diminishing marginal product.` }),
    P({ src: 'HW6-style · 6', q: md`For each technology, classify returns to scale.`,
      parts: [FIX('$y = 2L^{0.3}K^{0.6}$', ['increasing', 'constant', 'decreasing'], 2), FIX('$y = L^{0.75}K^{0.5}$', ['increasing', 'constant', 'decreasing'], 0), FIX('$y = \\min\\{4L, K\\}$', ['increasing', 'constant', 'decreasing'], 1), FIX('$y = 5L + 2K$', ['increasing', 'constant', 'decreasing'], 1)],
      sol: md`Sums 0.9 (DRS) and 1.25 (IRS). Min and linear functions are always CRS.` }),
    G('cs_mix', { need: 2 }), G('cvev', { need: 2 }), G('mp_trs', { need: 2 }), G('rts', { need: 2 }),
  ];

  // ------------------------------------------------------------------ HW7-style
  const hw7 = [
    R(md`Homework 7 topics: cost minimization and cost curves.`),
    P({ src: 'HW7-style · 1', q: md`$y = L^{0.5}K^{0.5}$, wage $w = \$8$, rental rate $r = \$2$. The firm must make 40 units.

      (a) Ratio $K/L$. (b) $L^*$. (c) $K^*$. (d) Minimum cost. (e) $C(y)$.`,
      parts: [N('(a)', 4), N('(b)', 20), N('(c)', 80), N('(d)', 320), X('(e)', '8*y', VY)],
      hints: ['Tangency: $K/L = w/r$.', '$\\sqrt{L \\cdot 4L} = 2L = 40$.'],
      sol: md`(a) $MP_L/MP_K = K/L = 8/2 = 4$. (b) $2L = 40 \Rightarrow L = 20$. (c) $K = 80$. (d) $8(20) + 2(80) = 320$. (e) $L = y/2$, $K = 2y$, $C = 8(y/2) + 2(2y) = 8y$.` }),
    P({ src: 'HW7-style · 2', q: md`$y = L^{0.25}K^{0.75}$, $w = \$3$, $r = \$1$, target $y = 50$.`,
      parts: [X('K\\text{ in terms of }L', 'L*9', { L: [1, 9] }), N('L^*', 50 / Math.pow(9, 0.75)), N('K^*', 450 / Math.pow(9, 0.75)), N('C', 600 / Math.pow(9, 0.75))],
      hints: ['$\\dfrac{MP_L}{MP_K} = \\dfrac{0.25}{0.75}\\cdot\\dfrac{K}{L} = \\dfrac{K}{3L} = \\dfrac{3}{1}$.', '$L^{0.25}(9L)^{0.75} = 9^{0.75}L = 5.196L$.'],
      sol: md`Tangency: $K/(3L) = 3 \Rightarrow K = 9L$. Target: $L^{0.25}(9L)^{0.75} = 9^{0.75}L \approx 5.196L = 50 \Rightarrow L \approx 9.62$, $K \approx 86.6$. Cost $= 3(9.62) + 86.6 \approx \$115.5$.` }),
    P({ src: 'HW7-style · 3', q: md`A bakery can make bread with ovens run by workers ($L$) or by robots ($R$): $y = 3L + 5R$. A worker costs \$60 a shift and a robot \$90.

      (a) Cost per loaf with workers only. (b) With robots only. (c) Cheapest way to make 300 loaves and its cost.`,
      parts: [N('(a)', 20), N('(b)', 18), N('L^*', 0), N('R^*', 60), N('C', 5400)],
      sol: md`(a) $60/3 = \$20$ per loaf. (b) $90/5 = \$18$ per loaf. (c) Robots only: $R = 300/5 = 60$, cost $60 \times 90 = \$5400$.` }),
    P({ src: 'HW7-style · 4', q: md`Each bicycle needs one frame ($x_1$) and two wheels ($x_2$): $y = \min\{x_1, x_2/2\}$. Frames cost \$50 and wheels \$20.

      (a) Inputs for 100 bikes. (b) Cost. (c) $C(y)$. (d) If wheels rise to \$30, how many wheels are used for 100 bikes?`,
      parts: [N('x_1', 100), N('x_2', 200), N('C', 9000), X('C(y)', '90*y', VY), N('(d)', 200)],
      sol: md`(a) $x_1 = 100$, $x_2/2 = 100 \Rightarrow x_2 = 200$. (b) $50(100) + 20(200) = 9000$. (c) $C(y) = (50 + 2 \cdot 20)y = 90y$. (d) Still 200: fixed proportions, no substitution.` }),
    P({ src: 'HW7-style · 5', q: md`$TC(y) = 400 + 20y + y^2$.

      (a) Fixed cost. (b) AVC. (c) MC. (d) Output that minimizes ATC. (e) Min ATC.`,
      parts: [N('(a)', 400), X('(b)', '20 + y', VY), X('(c)', '20 + 2*y', VY), N('(d)', 20), N('(e)', 60)],
      hints: ['Set $MC = ATC$: $20 + 2y = 400/y + 20 + y$.'],
      sol: md`(a) 400. (b) $AVC = 20 + y$. (c) $MC = 20 + 2y$. (d) $400/y = y \Rightarrow y = 20$. (e) $ATC(20) = 20 + 20 + 20 = 60$ (and $MC(20) = 60$ ✓).` }),
    P({ src: 'HW7-style · 6', q: md`A cost schedule: $F = \$100$; VC at $y = 0, 1, 2, 3, 4, 5$ is 0, 50, 90, 120, 160, 220.

      (a) MC of the 3rd unit. (b) AVC at 4. (c) ATC at 4. (d) AFC at 5. (e) At $y = 4$, MC of the 4th unit (40) vs AVC (40): what does AVC do next?`,
      parts: [N('(a)', 30), N('(b)', 40), N('(c)', 65), N('(d)', 20), FIX('(e)', ['it is at its minimum', 'it is falling', 'it is rising'], 0, [null, 'MC = AVC: the average is flat.', 'MC = AVC: the average is flat.'])],
      sol: md`(a) $120 - 90 = 30$. (b) $160/4 = 40$. (c) $260/4 = 65$. (d) $100/5 = 20$. (e) MC equals AVC at 40, so AVC is at its minimum (the 5th unit costs 60, pulling AVC up after).` }),
    P({ src: 'HW7-style · 7', q: md`A firm’s technology is $y = x_1^{0.6}x_2^{0.6}$ and input prices are fixed. Choose the shape of each.`,
      parts: [FIX('Returns to scale', ['increasing', 'constant', 'decreasing'], 0), FIX('Long-run AC as output grows', ['falls', 'constant', 'rises'], 0), FIX('Short-run MP of each input', ['diminishing', 'constant', 'increasing'], 0)],
      sol: md`$0.6 + 0.6 = 1.2$: IRS, so LRAC falls (economies of scale). Each exponent 0.6 < 1: each MP diminishes.` }),
    G('cd_costmin', { need: 2 }), G('corner_kink', { need: 2 }), G('mc_avg', { need: 2 }), G('cost_sched', { need: 2 }),
  ];

  C.unit({
    id: 'hw', exam: 'm2', tools: true, num: 'Mini Exam 2', title: 'Homework and discussion problems',
    lessons: [
      { id: 'ds5', title: 'DS5 · income and price effects, market demand', kind: 'hw', steps: ds5 },
      { id: 'ds6', title: 'DS6 · consumer welfare', kind: 'hw', steps: ds6 },
      { id: 'ds7', title: 'DS7 · production costs', kind: 'hw', steps: ds7 },
      { id: 'redo', title: 'Standard examples to redo cold', kind: 'hw', steps: redo },
      { id: 'hw5', title: 'HW5-style · effects, market demand, elasticity', kind: 'hw', steps: hw5 },
      { id: 'hw6', title: 'HW6-style · welfare and production', kind: 'hw', steps: hw6 },
      { id: 'hw7', title: 'HW7-style · cost minimization and cost curves', kind: 'hw', steps: hw7 },
    ],
  });
})();

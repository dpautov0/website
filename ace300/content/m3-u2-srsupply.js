/* Mini Exam 3 · Part 8: short-run supply (Lecture 15, DS8 Q2–Q3). The exemplar file for the Mini Exam 3 pages:
   every lesson opens with what the problem looks like on the exam, builds the idea from scratch, names each move in
   the worked examples, and every practice problem asks for the plan before the numbers. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, X, FIX, plan, gen, F, pick, ri } = M3;

  // ------------------------------------------------------------------ figures
  // the running example: C(q) = q^3 - 8q^2 + 30q + 50, so VC = q^3 - 8q^2 + 30q and F = 50.
  // min AVC = 14 at q = 4, min AC = 25 at q = 5.
  const MCc = (q) => 3 * q * q - 16 * q + 30, AVCc = (q) => q * q - 8 * q + 30, ACc = (q) => q * q - 8 * q + 30 + 50 / q;
  const zonesFig = EC.graph({
    w: 340, h: 270, x: [0, 7.2], y: [0, 50], xl: 'q', yl: '\\$', xt: [4, 5], yt: [14, 25],
    items: [
      { poly: [[0, 25], [7.2, 25], [7.2, 50], [0, 50]], cls: 'gain' },
      { poly: [[0, 14], [7.2, 14], [7.2, 25], [0, 25]], cls: 'loss' },
      { poly: [[0, 0], [7.2, 0], [7.2, 14], [0, 14]], cls: 'ex' },
      { f: MCc, from: 1.25, to: 6.3, cls: 'c5', lab: 'MC', labX: 6.3, dx: 4, dy: 2, anchor: 'l' },
      { f: AVCc, from: 0.6, to: 7, cls: 'c2', lab: 'AVC', labX: 7, dx: -2, dy: -6, anchor: 'br' },
      { f: ACc, from: 1.75, to: 7, lab: 'AC', labX: 7, dx: -2, dy: -6, anchor: 'br' },
      { pt: [4, 14], guide: true }, { pt: [5, 25], guide: true },
      { text: [1.1, 44], t: '\\text{profit}', anchor: 'l' },
      { text: [0.2, 18], t: '\\text{loss, but operate}', anchor: 'l' },
      { text: [0.2, 7], t: '\\text{shut down}', anchor: 'l' },
    ],
  });
  // Dent: C = 2q^2 + 100, MC = 4q, AC = 2q + 100/q, AVC = 2q
  const dentFig = (Pr) => {
    const q = Pr / 4, ac = 2 * q + 100 / q, prof = Pr >= ac;
    return EC.graph({
      w: 330, h: 260, x: [0, 14], y: [0, 60], xl: 'q', yl: '\\$', xt: [q], yt: prof ? [Pr, ac] : [ac, Pr],
      items: [
        { poly: [[0, 0], [q, 0], [q, Math.min(Pr, ac)], [0, Math.min(Pr, ac)]], cls: 'ex' },
        { poly: [[0, Math.min(Pr, ac)], [q, Math.min(Pr, ac)], [q, Math.max(Pr, ac)], [0, Math.max(Pr, ac)]], cls: prof ? 'gain' : 'loss' },
        { seg: [[0, Pr], [14, Pr]], cls: 'curve c3', lab: 'P = MR', at: 'end', dx: -2, dy: -6, anchor: 'br' },
        { f: (x) => 4 * x, from: 0, to: 14, cls: 'c5', lab: 'MC', labX: 13.4, dx: -6, dy: 0, anchor: 'r' },
        { f: (x) => 2 * x + 100 / x, from: 1.8, to: 14, lab: 'AC', labX: 14, dx: -2, dy: 10, anchor: 'tr' },
        { f: (x) => 2 * x, from: 0, to: 14, cls: 'c2 dash', lab: 'AVC', labX: 14, dx: -2, dy: 10, anchor: 'tr' },
        { pt: [q, Pr], guide: 'x' }, { pt: [q, ac] },
        { text: [q / 2, (Pr + ac) / 2], t: prof ? '\\pi > 0' : '\\pi < 0' },
        { text: [q / 2, Math.min(Pr, ac) / 2], t: prof ? 'TC' : 'TR' },
      ],
    });
  };
  // two crossings of a U-shaped MC: A (falling branch) and B (rising branch)
  const qA = (16 - Math.sqrt(256 - 96)) / 6, qB = (16 + Math.sqrt(256 - 96)) / 6;
  const twoRootsFig = EC.graph({
    w: 320, h: 240, x: [0, 6.6], y: [0, 50], xl: 'q', yl: '\\$', xt: [[qA, 'q_A'], [qB, 'q_B']], yt: [22],
    items: [
      { seg: [[0, 22], [6.6, 22]], cls: 'curve c3', lab: 'P = 22', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { f: MCc, from: 0, to: 6.3, cls: 'c5', lab: 'MC', labX: 6.3, dx: 4, dy: 2, anchor: 'l' },
      { pt: [qA, 22], lab: 'A', at: 'tr', guide: 'x' }, { pt: [qB, 22], lab: 'B', at: 'tl', guide: 'x' },
    ],
  });
  // two firms summed horizontally: q_A = 2P - 4 (P >= 2), q_B = 3P - 15 (P >= 5)
  const sumFig = EC.graph({
    w: 340, h: 260, x: [0, 34], y: [0, 10.5], xl: 'q,\\ Q', yl: 'P', xt: [6, 9, 12, 21], yt: [2, 5, 8],
    items: [
      { seg: [[0, 2], [17, 10.5]], cls: 'curve c2 dash', lab: '\\text{A}', at: 0.97, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 5], [16.5, 10.5]], cls: 'curve c4 dash', lab: '\\text{B}', at: 0.97, dx: 6, dy: 4, anchor: 'l' },
      { pts: [[0, 2], [6, 5], [33.5, 10.5]], cls: 'curve', lab: '\\text{market}', labI: 2, dx: -4, dy: 12, anchor: 'tr' },
      { seg: [[0, 8], [21, 8]], cls: 'guide' },
      { pt: [12, 8], lab: 'q_A = 12', at: 'tl' }, { pt: [9, 8], lab: 'q_B = 9', at: 'bl' }, { pt: [21, 8], lab: 'Q = 21', at: 'br' },
      { pt: [6, 5], lab: '\\text{kink}', at: 'br' },
    ],
  });

  // ------------------------------------------------------------------ generators (every one asks for the plan first)
  const PLAN_PMC = (mc) => plan('What is the first equation you write?', `$P = MC$, with $MC = ${mc}$`, [
    ['$P = AC$', '$P = AC$ is where profit is **zero** (break-even). The best output is where the next unit stops paying for itself: $P = MC$.'],
    ['$MR = MC$ with $MR$ below the price', 'A competitive firm is a price taker: every unit sells at the same $P$, so $MR = P$. MR below price is the monopoly case.'],
    ['Minimize $AC$', 'Minimum AC is the break-even point, a property of the cost curves. It does not depend on the price, so it cannot be the answer to "how much at this price?"'],
  ], `Differentiate cost to get $MC$, set it equal to the price, solve for $q$.`);

  gen('m3_sr_firm', () => {
    const a = pick([0.5, 1, 2]), b = pick([2, 4, 6, 10]), Fx = pick([50, 100, 200, 300]);
    const q = ri(3, 12), Pr = b + 2 * a * q;
    const TR = Pr * q, TC = Fx + b * q + a * q * q, pi = TR - TC, ac = TC / q;
    const mc = `${F(b)} + ${F(2 * a)}q`;
    return {
      title: 'One firm, one price',
      q: md`A competitive firm has short-run cost $C(q) = ${Fx} + ${F(b)}q + ${a === 1 ? '' : F(a)}q^2$. The market price is \$${F(Pr)}. Find the profit-maximizing output, profit, and decide whether the firm operates.`,
      plan: [
        PLAN_PMC(mc),
        plan('Suppose the profit comes out negative. How do you decide whether to keep operating?', `Compare $P$ with minimum $AVC$: operate if $P \ge \min AVC$`, [
          ['Shut down whenever profit is negative', 'In the short run the fixed cost is paid either way. Shutting down still loses $F$, so a negative profit smaller than $F$ beats shutting down.'],
          ['Compare $P$ with minimum $AC$', 'That tells you profit versus loss, not operate versus shut down. Between min AVC and min AC the firm loses money but still operates.'],
          ['Compare $MC$ with $AC$', 'MC meets AC at the bottom of AC; that locates break-even, not the shutdown decision.'],
        ], `Here $AVC = ${F(b)} + ${a === 1 ? '' : F(a)}q$, whose minimum is $${F(b)}$ (at $q \to 0$). Any price above $${F(b)}$ covers variable cost, so the firm operates.`),
      ],
      parts: [N('q^*', q), N('\\pi', pi), FIX('Does the firm operate?', ['yes', 'no'], 0, [null, `$P = ${F(Pr)}$ is above min AVC $= ${F(b)}$, so revenue covers variable cost.`])],
      hints: [`$MC = ${mc}$. Set $${F(Pr)} = ${mc}$.`, `Profit $= Pq - C(q)$, or $(P - AC)q$.`],
      sol: md`
        **Move 1: $P = MC$.** $MC = \dfrac{dC}{dq} = ${mc}$. Set it equal to the price:
        $$${F(Pr)} = ${mc} \;\Rightarrow\; ${F(2 * a)}q = ${F(Pr - b)} \;\Rightarrow\; q^* = ${q}$$

        **Move 2: profit.** $TR = ${F(Pr)} \times ${q} = ${F(TR)}$. $TC = ${Fx} + ${F(b)}(${q}) + ${a === 1 ? '' : F(a)}(${q})^2 = ${F(TC)}$.
        $$\pi = ${F(TR)} - ${F(TC)} = ${F(pi)}$$
        Check with the rectangle: $AC = ${F(TC)}/${q} = ${F(ac)}$, so $(P - AC)q = (${F(Pr)} - ${F(ac)})(${q}) = ${F(pi)}$.

        **Move 3: operate?** $AVC = ${F(b)} + ${a === 1 ? '' : F(a)}q \ge ${F(b)}$ and $P = ${F(Pr)} > ${F(b)}$: revenue covers every variable dollar, so the firm operates${pi < 0 ? `, at a loss of $${F(-pi)}$, which beats the shutdown loss of $${Fx}$ (the fixed cost)` : ''}.
      `,
    };
  });

  gen('m3_sr_cubic', () => {
    // VC = q^3 - 2k q^2 + m q: AVC = q^2 - 2k q + m, min at q = k, min AVC = m - k^2; MC = 3q^2 - 4kq + m
    const k = pick([2, 3, 4, 5]), m = k * k + pick([4, 6, 10, 14, 20]), Fx = pick([5, 10, 20, 40]);
    const minAVC = m - k * k, qS = k + pick([1, 2, 3]), Ps = 3 * qS * qS - 4 * k * qS + m;
    return {
      title: 'Shutdown price from a cubic cost',
      q: md`A competitive firm has $C(q) = q^3 - ${2 * k}q^2 + ${m}q + ${Fx}$. (a) At what output is AVC smallest? (b) What is the shutdown price? (c) At what price does the firm supply exactly ${qS} units?`,
      plan: [
        plan('For (a) and (b): what do you need to find?', 'The minimum of $AVC$, where $MC = AVC$', [
          ['The minimum of $AC$', 'Min AC is the break-even price. The shutdown price compares price with **variable** cost, because fixed cost is paid either way.'],
          ['Where $MC = 0$', 'MC = 0 is not a cost-curve landmark that matters here. The shutdown point is the bottom of AVC.'],
          ['Where $P = MC$', 'There is no price yet in (a)–(b): the shutdown price is a property of the cost curves alone.'],
        ], `Write $AVC = VC/q$ (drop the constant ${Fx}: it is the fixed cost). Then either set $MC = AVC$ or set $dAVC/dq = 0$. Plug that $q$ into AVC.`),
        plan('For (c): how do you get the price at which the firm supplies a given quantity?', `Plug $q = ${qS}$ into $MC$: on the supply curve, $P = MC(q)$`, [
          ['Plug it into $AC$', 'AC gives cost per unit, not the price at which this output is chosen.'],
          ['Plug it into $AVC$', 'The firm chooses where price equals the cost of the **next** unit, which is MC.'],
          ['Solve $MC = AVC$ again', 'That is the shutdown point; it does not depend on how much the firm supplies.'],
        ], `The supply curve is the rising MC above min AVC, so the price that calls forth $q = ${qS}$ is $MC(${qS})$. Check it is above the shutdown price.`),
      ],
      parts: [N('q_{\\min AVC}', k), N('P_{\\text{shutdown}}', minAVC), N(`P\\text{ for }q = ${qS}`, Ps)],
      hints: [`$AVC = q^2 - ${2 * k}q + ${m}$ and $MC = 3q^2 - ${4 * k}q + ${m}$.`, `$MC = AVC \\Rightarrow 2q^2 - ${2 * k}q = 0$.`],
      sol: md`
        **Move 1: split the cost.** The constant ${Fx} is the fixed cost; $VC = q^3 - ${2 * k}q^2 + ${m}q$.
        $$AVC = \frac{VC}{q} = q^2 - ${2 * k}q + ${m}, \qquad MC = \frac{dC}{dq} = 3q^2 - ${4 * k}q + ${m}$$

        **Move 2: bottom of AVC, where $MC = AVC$** (MC cuts AVC at its minimum):
        $$3q^2 - ${4 * k}q + ${m} = q^2 - ${2 * k}q + ${m} \;\Rightarrow\; 2q^2 - ${2 * k}q = 0 \;\Rightarrow\; 2q(q - ${k}) = 0$$
        $q = 0$ is not a real output for an average, so $q = ${k}$. (Same answer from $dAVC/dq = 2q - ${2 * k} = 0$.)

        **Move 3: shutdown price** $= AVC(${k}) = ${k * k} - ${2 * k * k} + ${m} = ${minAVC}$. Below \$${minAVC} the firm makes zero.

        **Move 4: price for $q = ${qS}$.** On the supply curve $P = MC$: $MC(${qS}) = 3(${qS * qS}) - ${4 * k}(${qS}) + ${m} = ${Ps}$. That is above ${minAVC}, so the firm really does supply ${qS} units at \$${Ps}.
      `,
    };
  });

  gen('m3_mkt_sum', () => {
    const s1 = pick([1, 2, 3, 4]), c1 = pick([1, 2, 3, 4]), s2 = pick([1, 2, 3, 5]), c2 = c1 + pick([2, 3, 4, 6]);
    const Pq = c2 + pick([1, 2, 3, 4]);
    const qa = s1 * (Pq - c1), qb = s2 * (Pq - c2), Qt = qa + qb, Qk = s1 * (c2 - c1);
    const S = s1 + s2, K = s1 * c1 + s2 * c2;
    const inv = (s, c) => `P = ${c} + ${s === 1 ? 'q' : `\\tfrac{q}{${s}}`}`;
    return {
      title: 'Add two firms’ supply',
      q: md`Two price-taking firms have inverse supply curves $${inv(s1, c1)}_A$ for firm A and $${inv(s2, c2)}_B$ for firm B (each supplies zero below its intercept). (a) How much does the market supply at $P = ${Pq}$? (b) At what market quantity is the kink? (c) Write the market's inverse supply above the kink.`,
      plan: [
        plan('How do you combine two supply curves into market supply?', 'Turn each into $q = \\ldots$ (direct supply) and add the **quantities** at the same price', [
          ['Add the two inverse supplies: $P_A + P_B$', 'Adding prices has no meaning: two firms each willing to sell at \\$5 do not make a \\$10 market price. Market supply adds what the firms **sell** at one price.'],
          ['Average the two inverse supplies', 'Averaging prices is not how markets add up either. At any price, market quantity is firm A’s quantity plus firm B’s.'],
          ['Set the two supplies equal to each other', 'Setting supply equal to supply finds nothing useful. Equilibrium is supply equals **demand**.'],
        ], `Direct: $q_A = ${s1}(P - ${c1})$ for $P \ge ${c1}$, $q_B = ${s2}(P - ${c2})$ for $P \ge ${c2}$. Add them where both are positive; below $P = ${c2}$ only A sells.`),
      ],
      parts: [N(`Q\\text{ at }P = ${Pq}`, Qt), N('Q_{\\text{kink}}', Qk), X('P(Q)\\text{ above the kink}', `(Q + ${K})/${S}`, { Q: [Qk + 1, Qk + 20] })],
      hints: [`Invert: $P = ${c1} + q/${s1} \\Rightarrow q = ${s1}(P - ${c1})$.`, `The kink is where firm B starts: $P = ${c2}$. How much is A selling there?`],
      sol: md`
        **Move 1: invert each firm** (solve for $q$):
        $$q_A = ${s1}(P - ${c1}) = ${s1}P - ${s1 * c1}\quad (P \ge ${c1}), \qquad q_B = ${s2}(P - ${c2}) = ${s2}P - ${s2 * c2}\quad (P \ge ${c2})$$

        **Move 2: add quantities at one price.** At $P = ${Pq}$: $q_A = ${qa}$, $q_B = ${qb}$, so $Q = ${Qt}$.

        **Move 3: the kink.** Below $P = ${c2}$ only firm A sells. At $P = ${c2}$ firm A sells $${s1}(${c2} - ${c1}) = ${Qk}$. That is the kink: $(Q, P) = (${Qk}, ${c2})$.

        **Move 4: above the kink** both sell: $Q = ${S}P - ${K}$. Solve for $P$:
        $$P = \frac{Q + ${K}}{${S}}$$
        Check: at $Q = ${Qt}$ this gives $P = ${F((Qt + K) / S)}$. ✓
      `,
    };
  });

  gen('m3_mkt_ident', () => {
    // n firms, C = F + a q^2: MC = 2aq, q = P/(2a); market Q = nP/(2a); demand Q = A - B P
    const a = pick([1, 2, 2.5, 5]), n = pick([10, 20, 40, 50, 100]), Fx = pick([20, 50, 100]);
    const sQ = n / (2 * a);                       // market supply slope dQ/dP
    const Pe = pick([10, 12, 15, 20, 24, 30]), B = pick([2, 5, 10]), A = (sQ + B) * Pe;
    const Qe = sQ * Pe, qe = Pe / (2 * a), pi = Pe * qe - (Fx + a * qe * qe);
    return {
      title: 'Identical firms meet demand',
      q: md`A market has ${n} identical price-taking firms, each with short-run cost $C(q) = ${Fx} + ${a === 1 ? '' : F(a)}q^2$. Market demand is $Q = ${F(A)} - ${B}P$. Find the equilibrium price, market quantity, output per firm, and each firm's profit.`,
      plan: [
        plan('What is the first thing to build?', `Market supply: one firm’s supply $q(P)$ from $P = MC$, then $Q = ${n} \\cdot q(P)$`, [
          ['Set demand equal to one firm’s MC', 'Demand is for the whole market; one firm supplies only a sliver of it. Add up all the firms first.'],
          ['Set $P = \\min AC$', 'That is the long-run price under free entry. In the short run the number of firms is fixed and price comes from supply = demand.'],
          ['Set $MR = MC$ using the market demand', 'That is what a monopolist does. Each of these firms is a price taker, so it sets $P = MC$.'],
        ], `$MC = ${F(2 * a)}q$, so $q = P/${F(2 * a)}$. Market: $Q = ${n} \\cdot P/${F(2 * a)} = ${F(sQ)}P$. Then set supply equal to demand.`),
      ],
      parts: [N('P^*', Pe), N('Q^*', Qe), N('q^*', qe), N('\\pi', pi)],
      hints: [`One firm: $P = ${F(2 * a)}q$. ${n} firms: $Q = ${F(sQ)}P$.`, `$${F(sQ)}P = ${F(A)} - ${B}P$.`],
      sol: md`
        **Move 1: one firm’s supply.** $MC = ${F(2 * a)}q$; $P = MC$ gives $q = P/${F(2 * a)}$ (AVC $= ${a === 1 ? '' : F(a)}q$ has minimum 0, so every positive price is above shutdown).

        **Move 2: market supply = ${n} copies, added sideways.** $Q^S = ${n}\cdot\dfrac{P}{${F(2 * a)}} = ${F(sQ)}P$.

        **Move 3: supply = demand.**
        $$${F(sQ)}P = ${F(A)} - ${B}P \;\Rightarrow\; ${F(sQ + B)}P = ${F(A)} \;\Rightarrow\; P^* = ${Pe}$$
        $Q^* = ${F(sQ)} \times ${Pe} = ${F(Qe)}$.

        **Move 4: per firm.** $q^* = Q^*/n = ${F(Qe)}/${n} = ${F(qe)}$ (same as $P/${F(2 * a)}$ ✓).

        **Move 5: profit.** $\pi = ${Pe}(${F(qe)}) - [${Fx} + ${a === 1 ? '' : F(a)}(${F(qe)})^2] = ${F(Pe * qe)} - ${F(Fx + a * qe * qe)} = ${F(pi)}$.
        ${pi > 0 ? 'Positive: in the long run this attracts entry (Part 9).' : pi < 0 ? 'Negative but bigger than $-F$: firms operate now, and in the long run some exit (Part 9).' : 'Zero: no entry or exit.'}
      `,
    };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3u2', exam: 'm3', num: 'Part 8', title: 'Short-run supply', blurb: 'P = MC on the rising branch, the shutdown price, profit rectangles, adding supply curves',
    lessons: [
      // ================================================================ lesson 1
      {
        id: 'm3-sr1', title: 'The cost picture and the four price zones', ref: 'Lecture 15 · DS8 Q2–Q3',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | It is really asking… |
            |---|---|
            | "Will the firm operate?", "shutdown price", "supply zero if the price is below…" | Is $P$ above or below **minimum AVC**? |
            | "Is the firm making a profit?", "break even", "zero economic profit" | Is $P$ above or below **minimum AC**? |
            | "operating at a loss", "covers some of its fixed cost" | Is $P$ **between** min AVC and min AC? |
            | a graph of MC, AVC, AC with a price line | Which of the four zones is the price in? |

            By the end of this page you should look at a price and two numbers (min AVC, min AC) and know, with no algebra, what the firm does and whether it makes money.
          `),
          R(md`
            ### The firm’s situation, from scratch

            A competitive firm is small. The market sets the price $P$, and the firm can sell as much as it wants at that price and nothing above it. So its only choice is **how much to make**, $q$, including $q = 0$.

            Its costs come in two kinds (Part 6):

            - **Fixed cost $F$**: the truck lease, the rented building. Paid in the short run **even if $q = 0$**. It is the constant term in $C(q)$.
            - **Variable cost $VC(q)$**: ingredients, hourly labor. Zero if $q = 0$.

            $$C(q) = F + VC(q)$$

            Three per-unit curves matter. Each answers a different question:

            | Curve | Formula | The question it answers |
            |---|---|---|
            | $MC(q)$ | $\dfrac{dC}{dq}$ | What does the **next** unit cost? |
            | $AVC(q)$ | $\dfrac{VC(q)}{q}$ | Per unit, what do I spend that I could **avoid** by shutting down? |
            | $AC(q)$ | $\dfrac{C(q)}{q} = AFC + AVC$ | Per unit, what do I spend **in total**, fixed cost included? |

            AC is always above AVC: the gap is $F/q$, fixed cost spread over the units.
          `),
          RF(md`
            ### Why MC goes through the bottom of AVC and AC

            Think of a class average. If your next exam score is **below** your average, the average falls. If it is **above**, the average rises. The average stops falling exactly when the next score equals it.

            Costs work the same way. MC is "the next unit's cost"; AVC and AC are averages. While MC is below an average, it pulls the average down; once MC is above it, it pulls it up. So **MC crosses AVC at AVC's minimum, and AC at AC's minimum.**

            That gives the fastest way to find either minimum:

            $$\min AVC: \; MC = AVC \qquad\qquad \min AC: \; MC = AC$$

            Here is the running example for this Part: $C(q) = q^3 - 8q^2 + 30q + 50$. The fixed cost is 50. Min AVC is \$14 (at $q = 4$) and min AC is \$25 (at $q = 5$).

            [[fig:z]]
          `, { z: { svg: zonesFig, cap: 'MC (red) cuts AVC (orange) at its bottom, (4, 14), and AC (blue) at its bottom, (5, 25). Those two heights split every possible price into zones.' } }),
          Q(md`MC is below AVC at the current output. If the firm makes one more unit, AVC…`, ['falls', 'rises', 'stays the same', 'cannot tell'], 0,
            [null, 'The next unit is cheaper than the current average, so it pulls the average down.', 'Only if MC equals AVC exactly.', 'MC below the average always pulls the average down.'],
            md`Like a below-average exam score: the average falls. That is why AVC is still falling to the left of where MC crosses it.`),
          R(md`
            ### The four price zones

            Now lower the price step by step and ask what the firm does. The answer depends only on where $P$ sits relative to **min AC** and **min AVC**.

            **Zone 1: $P > \min AC$. Profit.** At the best output, price is above cost per unit, so every unit earns $P - AC > 0$. Profit is positive.

            **Zone 2: $P = \min AC$. Break even.** The best the firm can do is $P = AC$: zero economic profit. Zero economic profit is fine: the owner earns exactly what the next-best use of her time and money would pay (Part 7).

            **Zone 3: $\min AVC < P < \min AC$. Operate at a loss.** Price is below AC, so the firm loses money whatever it does. But price is above AVC, so each unit brings in more than its variable cost. The extra covers **part** of the fixed cost. Shutting down would lose **all** of $F$. Producing loses less.

            **Zone 4: $P < \min AVC$. Shut down.** Now even the variable cost is not covered: each unit made loses money on top of $F$. Make nothing and lose only $F$.

            At $P = \min AVC$ exactly, operating and shutting down give the same profit, $-F$; the firm is indifferent.
          `),
          R(md`
            !!key The whole page in two comparisons
              $P$ vs **min AVC** decides **operate or shut down** (short run).

              $P$ vs **min AC** decides **profit or loss**.

            !!intuition Why fixed cost does not matter for the shutdown decision
              In the short run $F$ is already committed: the lease is signed. You pay it whether you open or not. A cost you pay either way cannot change which choice is better. Only costs you can still **avoid**, the variable ones, enter the decision. That is why the shutdown test uses AVC, not AC.

            Using the running example (min AVC = 14, min AC = 25):

            | Price | Zone | What the firm does |
            |---|---|---|
            | \$10 | below min AVC | shuts down, loses $F = 50$ |
            | \$14 | at min AVC | indifferent; loses 50 either way |
            | \$18 | between | operates at $q \approx 4.43$, loses about 33 (better than 50) |
            | \$25 | at min AC | operates at $q = 5$, profit 0 |
            | \$42 | above min AC | operates at $q = 6$, profit 94 |
          `),
          Q(md`Min AVC is \$14 and min AC is \$25. The price is \$18. In the short run the firm…`, ['operates at a loss', 'shuts down', 'earns a profit', 'breaks even'], 0,
            [null, 'The price covers AVC (18 > 14), so producing loses less than shutting down.', 'Profit needs P above min AC; 18 < 25.', 'Break-even is P = min AC = 25.'],
            md`$14 < 18 < 25$: zone 3. Revenue covers variable cost and part of the fixed cost, so it operates, at a loss.`),
          Q(md`Min AVC is \$14 and min AC is \$25. The price is \$12. The firm’s short-run loss is…`, ['exactly its fixed cost', 'zero', 'larger than its fixed cost', 'smaller than its fixed cost'], 0,
            [null, 'Shutting down still leaves the fixed cost to pay.', 'If it produced, it would lose more than F; so it shuts down and loses exactly F.', 'Losing more than F would only happen if it kept producing below min AVC.'],
            md`$12 < 14$: shut down. With $q = 0$, revenue and variable cost are both zero, so $\pi = -F$.`),
          Q(md`A firm is earning zero economic profit. Which is true?`, ['its owner earns exactly what her next-best option pays', 'it should exit immediately', 'its accounting profit is zero too', 'the price is below min AVC'], 0,
            [null, 'Zero economic profit is not a loss; no reason to leave.', 'Accounting profit ignores implicit costs, so it is usually positive when economic profit is zero.', 'Then it would be shut down with a loss of F.'],
            md`Economic cost already includes the owner’s forgone wage and capital. Zero economic profit means "doing exactly as well as the alternative".`),
          Q(md`A firm’s fixed cost doubles. Its short-run shutdown price…`, ['does not change', 'doubles', 'rises', 'falls'], 0,
            [null, 'The shutdown price is min AVC, which has no fixed cost in it.', 'Fixed cost moves AC, not AVC.', 'Fixed cost moves AC, not AVC.'],
            md`Shutdown compares price with **avoidable** cost. A bigger $F$ raises AC (so the break-even price rises) but leaves AVC and MC alone.`),
          Q(md`A firm’s fixed cost doubles. Its short-run **output** at a given price…`, ['does not change', 'falls', 'rises', 'drops to zero'], 0,
            [null, 'Output comes from P = MC, and MC has no fixed cost in it.', 'MC is unchanged, so the P = MC point is unchanged.', 'Only if the price fell below min AVC, which F does not affect.'],
            md`$MC = dC/dq$, and the derivative of a constant is zero. The fixed cost changes **profit**, never the best output.`),
          R(md`
            ### Spot it: no numbers needed

            Each problem below is only a plan question. Decide what the firm does, then read why.
          `),
          P({ q: md`A firm’s cost curves show min AVC = \$5 and min AC = \$6. The price is \$5.50.`,
            plan: plan('What does the firm do in the short run?', 'Produce where $P = MC$ and lose money, but less than its fixed cost', [
              ['Shut down', 'The price covers AVC (5.50 > 5), so producing beats shutting down.'],
              ['Produce and earn a profit', 'Profit needs $P >$ min AC = 6.'],
              ['Produce where $P = AC$', 'There is no point where 5.50 equals AC: AC never falls below 6.'],
            ], `Zone 3: $\\min AVC < P < \\min AC$. Operate at the $P = MC$ output; the loss is smaller than $F$.`) }),
          P({ q: md`At the profit-maximizing output, $P = \$30$, $AC = \$36$ and $AVC = \$24$. The fixed cost is \$600.`,
            plan: plan('What should the firm do this period?', 'Keep producing: price covers AVC', [
              ['Shut down: price is below AC', 'Below AC means a loss, but shutting down loses the whole \\$600. Compare with AVC.'],
              ['Raise its price to \\$36', 'A price taker cannot: customers buy from someone else at \\$30.'],
              ['Produce more until $P = AC$', 'Output is set by $P = MC$; producing past that raises cost faster than revenue.'],
            ], `$P = 30 > AVC = 24$: each unit covers its variable cost plus \\$6 toward fixed cost. Loss $= (P - AC)q = -6q$, which is smaller than \\$600 (since $6q < (36 - 24)q = 600$).`) }),
          P({ q: md`$C(q) = 2q^2 + 100$. A classmate says: "When the price is \$20 the firm loses \$50, so it should shut down."`,
            plan: plan('Is the classmate right?', 'No: shutting down loses \\$100 (the fixed cost), so producing is better', [
              ['Yes: any loss means shut down', 'In the short run the \\$100 fixed cost is paid either way. A \\$50 loss beats a \\$100 loss.'],
              ['Yes, because $P < AC$', '$P < AC$ means a loss; the shutdown test is $P$ versus min AVC, and $AVC = 2q$ has minimum 0.'],
              ['No: the firm is actually profitable', 'At $P = 20$, $q = 5$, $AC = 30 > 20$, so it really does lose money.'],
            ], `Compare the two losses: produce $\\Rightarrow -50$; shut down $\\Rightarrow -F = -100$. Equivalently, $P = 20 > \\min AVC = 0$.`) }),
          P({ q: md`A firm's minimum AC is \$40. The market price rises from \$35 to \$45.`,
            plan: plan('What happens to the firm’s profit?', 'It goes from a loss to a profit', [
              ['It stays a loss', '\\$45 is above min AC, so the firm can now cover all costs and then some.'],
              ['It goes from profit to a bigger profit', 'At \\$35 the price is below min AC: that was a loss.'],
              ['Nothing: the firm is a price taker', 'Price takers still gain when the market price rises; they just cannot set it.'],
            ], `Below min AC: loss. Above min AC: profit. The price crossed \\$40.`) }),
        ],
      },
      // ================================================================ lesson 2
      {
        id: 'm3-sr2', title: 'Solving a firm problem: P = MC, the shutdown check, profit', ref: 'Lecture 15 · DS8 Q2–Q3',
        steps: [
          R(md`
            ### What this looks like on the exam

            "A competitive firm has cost $C(q) = \ldots$. The price is \$P. How much does it produce? What is its profit? What is its shutdown price? At what price does it supply exactly 6 units? Shade total revenue, total cost and profit."

            Every one of those is the same three-move routine. Learn the routine and the problem is mechanical.

            !!method The routine
              **Move 1. $P = MC$.** Differentiate cost, set it equal to the price, solve for $q$. If MC is a parabola you get two roots: take the one where **MC is rising** (the larger one).

              **Move 2. Check shutdown.** Is $P \ge \min AVC$? If not, $q = 0$. (Find min AVC from $MC = AVC$.)

              **Move 3. Profit.** $\pi = Pq - C(q)$, or the rectangle $(P - AC)\,q$.
          `),
          R(md`
            ### Why $P = MC$: think about one more unit

            You make $q$ units. Should you make one more?

            - It brings in the price, $P$. For a price taker, **marginal revenue is the price**: $MR = P$.
            - It costs $MC(q)$.

            If $P > MC$, the extra unit adds $P - MC > 0$ to profit: make it. If $P < MC$, it loses money: don't. You stop exactly where the next unit **just** pays for itself:

            $$P = MC(q)$$

            The same thing with calculus: profit is $\pi(q) = Pq - C(q)$. At the top of the profit hill the slope is zero:

            $$\frac{d\pi}{dq} = P - \frac{dC}{dq} = P - MC(q) = 0$$

            !!trap $P = MC$, not $P = AC$
              $P = AC$ is where profit is **zero**. $P = MC$ is where profit is **largest**. They coincide only at the bottom of AC (break-even). If a problem asks "how much does the firm produce", it is always $P = MC$.
          `),
          RF(md`
            ### Two crossings: which one?

            A U-shaped MC can cross the price line twice. At $P = 22$ with our running example, $3q^2 - 16q + 30 = 22$ has two roots, $q_A \approx 0.56$ and $q_B \approx 4.78$.

            [[fig:two]]

            Stand at A and make one more unit. Just right of A, MC is **below** the price (MC is still falling there), so that unit adds profit. Keep going and you keep gaining until B, where MC climbs back up through the price. Past B every unit costs more than it brings in.

            So A is the **bottom** of the profit hill, B is the top. **Always take the crossing on the rising part of MC: the larger root.**
          `, { two: { svg: twoRootsFig, cap: 'Between A and B, MC is below the price: every unit there adds profit. A is a profit minimum; B is the maximum.' } }),
          Q(md`Solving $P = MC$ gives $q = 1$ and $q = 7$, and MC is U-shaped. The profit-maximizing output (if the firm operates) is…`, ['7', '1', 'either one', 'the average, 4'], 0,
            [null, 'At q = 1 MC is falling: the units just after it cost less than P, so profit is still rising.', 'Only one is a maximum.', 'There is nothing special about the average.'],
            md`The larger root is on the rising branch. Between the roots MC < P, so every unit there adds profit.`),
          RF(md`
            ### Worked example 1 (DS8 Q2): Dent's auto repair

            Dent's short-run cost of repairing $q$ cars is $C(q) = 2q^2 + 100$.

            **Read the cost function first.** The constant 100 is the fixed cost. The rest, $2q^2$, is variable cost.

            $$AC = \frac{2q^2 + 100}{q} = 2q + \frac{100}{q}, \qquad AVC = \frac{2q^2}{q} = 2q, \qquad MC = \frac{dC}{dq} = 4q$$

            **Price \$40. Move 1:** $40 = 4q \Rightarrow q = 10$ cars.

            **Move 2:** min AVC: $AVC = 2q$ is smallest (zero) as $q \to 0$. Any positive price covers it, so Dent operates.

            **Move 3:** $TR = 40 \times 10 = 400$. $TC = 2(100) + 100 = 300$. Profit $= 100$. Rectangle check: $AC(10) = 20 + 10 = 30$, and $(40 - 30) \times 10 = 100$. ✓

            [[fig:p40]]

            **Reading the graph.** Total revenue is the rectangle $P \times q$: from 0 up to the price line, across to $q = 10$. Total cost is the rectangle $AC \times q$: up to the AC curve at $q = 10$. Profit is the strip between them, $(P - AC)\times q$.
          `, { p40: { svg: dentFig(40), cap: 'P = 40: q = 10 where the price line meets MC. Gray: total cost AC × q = 30 × 10. Green: profit (40 − 30) × 10 = 100. Gray + green = total revenue.' } }),
          RF(md`
            **Same firm, price \$20.** Move 1: $20 = 4q \Rightarrow q = 5$. Move 3: $TR = 100$, $TC = 2(25) + 100 = 150$, profit $= -50$. $AC(5) = 10 + 20 = 30 > 20$, so each car loses \$10.

            Should Dent close? Move 2 says no: price \$20 is above min AVC (0). Check it directly: shut down and lose the \$100 fixed cost; stay open and lose \$50. Staying open is \$50 better.

            [[fig:p20]]
          `, { p20: { svg: dentFig(20), cap: 'P = 20: q = 5. Gray: total revenue 20 × 5. Red: the loss (30 − 20) × 5 = 50, smaller than the fixed cost of 100.' } }),
          Q(md`On a cost-curve graph, which rectangle is **total cost** at the chosen output $q^*$?`, ['height AC(q*), width q*', 'height P, width q*', 'height MC(q*), width q*', 'height AVC(q*), width q*'], 0,
            [null, 'That is total revenue.', 'MC times q is not total cost (MC is the cost of the last unit only).', 'That is variable cost only.'],
            md`Average cost times quantity is total cost: $AC \times q = \dfrac{C}{q}\times q = C$.`),
          Q(md`On the same graph, the rectangle with height $AVC(q^*)$ and width $q^*$ is…`, ['variable cost', 'fixed cost', 'total cost', 'producer surplus'], 0,
            [null, 'Fixed cost is the gap between AC and AVC times q.', 'That needs AC.', 'PS is revenue minus variable cost.'],
            md`$AVC \times q = VC$. The strip between AC and AVC is fixed cost, $(AC - AVC)q = F$.`),
          RF(md`
            ### Worked example 2 (DS8 Q3): a cubic cost and the shutdown price

            $C(q) = q^3 - 8q^2 + 30q + 5$. Find the minimum of AVC, the shutdown price, and the price at which the firm supplies 6 units.

            **Read the cost function.** Fixed cost 5 (the constant). $VC = q^3 - 8q^2 + 30q$.

            $$AVC = q^2 - 8q + 30, \qquad MC = 3q^2 - 16q + 30$$

            **Bottom of AVC: set $MC = AVC$.**
            $$3q^2 - 16q + 30 = q^2 - 8q + 30$$
            The 30s cancel. Move everything to one side:
            $$2q^2 - 8q = 0 \;\Rightarrow\; 2q(q - 4) = 0$$
            $q = 0$ makes no sense for an average, so $q = 4$.

            **Shutdown price** $= AVC(4) = 16 - 32 + 30 = 14$. Below \$14 the firm supplies nothing.

            **Price for 6 units.** Along the supply curve $P = MC$, so plug in: $MC(6) = 3(36) - 16(6) + 30 = 108 - 96 + 30 = 42$. Is \$42 above \$14? Yes, so at \$42 the firm really does supply 6.

            !!intuition Does this make sense?
              The shutdown price (14) is lower than any price at which the firm makes a profit, and the price for 6 units (42) is far above it. Higher price, more output: supply slopes up. ✓
          `, {}),
          R(md`
            ### The firm's short-run supply curve

            Put the routine together for **every** price and you get the supply curve:

            $$q(P) = \begin{cases} 0 & P < \min AVC \\ \text{the } q \text{ with } MC(q) = P & P \ge \min AVC \end{cases}$$

            In pictures: **the rising part of MC above the bottom of AVC**, plus the vertical axis below the shutdown price. For Dent ($MC = 4q$, min AVC = 0): $q = P/4$ for every positive price.

            !!key Direct versus inverse supply
              **Inverse supply** gives price as a function of quantity: $P = 4q$. That is just MC. **Direct supply** solves it for quantity: $q = P/4$. You need the direct form to add firms together (next lesson).
          `),
          Q(md`A firm's MC is $MC = 2 + 4q$ and min AVC is \$2. Its direct supply curve is…`, ['q = (P − 2)/4 for P ≥ 2', 'q = 2 + 4P', 'P = 2 + 4q for all q', 'q = P/4'], 0,
            [null, 'That swaps the roles of P and q.', 'That is the inverse supply (it is fine, but it is not the direct form).', 'You dropped the intercept.'],
            md`Set $P = 2 + 4q$ and solve for $q$: $q = (P - 2)/4$, and zero below $P = 2$.`),
          R(md`
            ### Practice: plan first, then numbers

            Every card asks how you would attack the problem before any number. Pick, read why, then do it.
          `),
          P({ title: 'Dent at a new price', q: md`Dent’s cost is $C(q) = 2q^2 + 100$. The price is \$48.`,
            plan: [
              plan('What is your first equation?', '$48 = MC = 4q$', [
                ['$48 = AC = 2q + 100/q$', 'That finds where profit is zero, not where it is largest.'],
                ['$48 = AVC = 2q$', 'AVC is for the shutdown test, not the output choice.'],
                ['$48 = MR = 48 - 2q$', 'A price taker’s MR is the price itself, a flat 48.'],
              ], 'Solve $48 = 4q$.'),
            ],
            parts: [N('q^*', 12), N('TR', 576), N('TC', 388), N('\\pi', 188)],
            sol: md`$q = 48/4 = 12$. $TR = 48 \times 12 = 576$. $TC = 2(144) + 100 = 388$. $\pi = 188$. Rectangle check: $AC(12) = 24 + 8.33 = 32.33$; $(48 - 32.33)(12) = 188$. ✓` }),
          P({ title: 'Break-even price', q: md`Dent’s cost is $C(q) = 2q^2 + 100$. At what price does Dent earn exactly zero economic profit, and how many cars does he repair then?`,
            plan: plan('What do you look for?', 'The bottom of AC: where $MC = AC$', [
              ['The bottom of AVC', 'That is the shutdown price (here 0). Zero **profit** needs price to cover fixed cost too.'],
              ['Where $MC = 0$', 'MC = 0 at q = 0; that tells you nothing about profit.'],
              ['Where $P = MC$', 'There is no price given; you are solving for it. The break-even price is a property of the cost curves.'],
            ], 'Set $MC = AC$: $4q = 2q + 100/q$. Then the break-even price is $AC$ (= MC) at that $q$.'),
            parts: [N('q', 7.071), N('P_{\\text{break-even}}', 28.28)],
            sol: md`$4q = 2q + 100/q \Rightarrow 2q = 100/q \Rightarrow q^2 = 50 \Rightarrow q = \sqrt{50} \approx 7.07$. Then $P = MC = 4(7.07) \approx 28.28$ (check: $AC = 14.14 + 14.14 = 28.28$ ✓). At any price above \$28.28 Dent profits; between 0 and 28.28 he operates at a loss.` }),
          P({ title: 'Lime producer', q: md`A lime producer's cost curves give: at $P = \$7$ the firm chooses $q = 215{,}000$ tons and $AC = \$6.20$ there.`,
            plan: plan('How do you get profit fastest?', 'The rectangle: $\\pi = (P - AC)\\,q$', [
              ['$\\pi = (P - MC)\\,q$', 'At the chosen output $P = MC$, so this would always give zero.'],
              ['$\\pi = P \\times q$', 'That is revenue; you still have to take away cost.'],
              ['$\\pi = (P - AVC)\\,q$', 'That is producer surplus (revenue minus variable cost), not profit.'],
            ], 'Profit per unit is $P - AC$; multiply by the number of units.'),
            parts: [N('\\pi', 172000)],
            sol: md`$\pi = (7 - 6.20)(215{,}000) = 0.80 \times 215{,}000 = \$172{,}000$ (Lecture 15).` }),
          P({ title: 'Shutdown from a cubic', q: md`$C(q) = q^3 - 10q^2 + 40q + 30$.`,
            plan: [
              plan('To find the shutdown price, set…', '$MC = AVC$ (or $dAVC/dq = 0$), then evaluate AVC there', [
                ['$MC = AC$', 'That gives the break-even price. Shutdown ignores the fixed 30, because it is paid either way.'],
                ['$P = MC$', 'No price is given; you are finding a property of the cost curves.'],
                ['$MC = 0$', 'Not a landmark that matters here.'],
              ], '$AVC = q^2 - 10q + 40$, $MC = 3q^2 - 20q + 40$.'),
            ],
            parts: [N('q_{\\min AVC}', 5), N('P_{\\text{shutdown}}', 15), N('P\\text{ to supply }8', 72)],
            sol: md`$MC = AVC$: $3q^2 - 20q + 40 = q^2 - 10q + 40 \Rightarrow 2q^2 - 10q = 0 \Rightarrow q = 5$. Shutdown price $= AVC(5) = 25 - 50 + 40 = 15$. To supply 8: $P = MC(8) = 192 - 160 + 40 = 72 \ge 15$ ✓.` }),
          P({ title: 'Profit or loss from the curves', q: md`Same running example: $C(q) = q^3 - 8q^2 + 30q + 50$ (min AVC = 14 at $q = 4$; min AC = 25 at $q = 5$). The price is \$42.`,
            plan: [
              plan('Before computing: what sign will profit have?', 'Positive: $42 > \\min AC = 25$', [
                ['Negative: 42 is far above min AVC', 'Being above AVC only means "operate". Above **AC** means profit.'],
                ['Zero: the firm is competitive', 'Zero profit is the **long-run** outcome after entry. In the short run price can be above min AC.'],
                ['Cannot tell without $q$', 'You can: price above min AC guarantees $P > AC$ at the best output.'],
              ], 'Above min AC, so profit is positive. Now find $q$ from $P = MC$ and take $(P - AC)q$.'),
              plan('Solving $42 = 3q^2 - 16q + 30$ gives $q = 6$ and $q = -2/3$. Which do you use?', '$q = 6$', [
                ['$q = -2/3$', 'Output cannot be negative, and that root is not on the rising branch.'],
                ['Both: average them', 'Only one root is the profit maximum: the larger one, on the rising part of MC.'],
                ['Neither: shut down', '42 is far above min AVC (14), so the firm operates.'],
              ], 'Larger root: $q = 6$.'),
            ],
            parts: [N('q^*', 6), N('AC(q^*)', 26.333), N('\\pi', 94)],
            sol: md`$3q^2 - 16q - 12 = 0 \Rightarrow q = \dfrac{16 \pm \sqrt{256 + 144}}{6} = \dfrac{16 \pm 20}{6}$, so $q = 6$. $AC(6) = 36 - 48 + 30 + 50/6 = 26.33$. $\pi = (42 - 26.33)(6) = 94$. (Or $TR - TC = 252 - 158 = 94$.)` }),
          G('m3_sr_firm', { need: 3 }),
          G('m3_sr_cubic', { need: 3 }),
        ],
      },
      // ================================================================ lesson 3
      {
        id: 'm3-sr3', title: 'Market supply: add quantities, not prices', ref: 'Lecture 15',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | Your move |
            |---|---|
            | "two firms with inverse supply $P = \ldots$; find market supply" | invert each to $q = \ldots$, add the $q$'s, invert back |
            | "firm B supplies nothing below \$5" | market supply is **piecewise**, with a kink at \$5 |
            | "$n$ identical firms, each with cost…" | one firm's $q(P)$ from $P = MC$, then $Q = n\,q(P)$ |
            | "find equilibrium price, market quantity, and output per firm" | supply = demand for $P$; then $Q$; then $q = Q/n$ |
          `),
          R(md`
            ### Why "horizontal" summation

            Stand at one price, say \$8. Ask each firm how much it will sell at \$8. Firm A says 12, firm B says 9. How much does the **market** offer at \$8? $12 + 9 = 21$.

            That is all market supply is: at each price, **add the quantities**.

            $$Q^S(P) = q_A(P) + q_B(P) + \cdots$$

            On a graph with price on the vertical axis, adding quantities means adding **sideways**, which is why it is called horizontal summation.

            !!trap Never add inverse supplies
              $P_A(q) + P_B(q)$ adds two **prices**. If firm A will sell its 10th unit for \$4 and firm B its 10th for \$6, nothing in the market sells for \$10. Always switch to $q = \ldots$ form before adding.
          `),
          RF(md`
            ### Worked example: two firms that start at different prices

            Firm A: inverse supply $P = 2 + q_A/2$, sells nothing below \$2. Firm B: inverse supply $P = 5 + q_B/3$, sells nothing below \$5.

            **Move 1: invert each.**
            $$P = 2 + \frac{q_A}{2} \Rightarrow q_A = 2(P - 2) = 2P - 4 \quad (P \ge 2)$$
            $$P = 5 + \frac{q_B}{3} \Rightarrow q_B = 3(P - 5) = 3P - 15 \quad (P \ge 5)$$

            **Move 2: add, price range by price range.**

            - $P < 2$: nobody sells. $Q = 0$.
            - $2 \le P < 5$: only A sells. $Q = 2P - 4$.
            - $P \ge 5$: both sell. $Q = (2P - 4) + (3P - 15) = 5P - 19$.

            **Move 3: the kink.** At $P = 5$, A sells $2(5) - 4 = 6$ and B is just starting. So the market supply curve bends at $(Q, P) = (6, 5)$: it gets **flatter** there, because now two firms respond to each price rise.

            **Move 4: invert back** for graphing (above the kink): $Q = 5P - 19 \Rightarrow P = \dfrac{Q + 19}{5}$.

            [[fig:sum]]

            **Check at \$8:** A sells $2(8) - 4 = 12$, B sells $3(8) - 15 = 9$, market $5(8) - 19 = 21 = 12 + 9$. ✓
          `, { sum: { svg: sumFig, cap: 'At P = 8 the market quantity is 12 + 9 = 21: the dashed firm curves added sideways. Below P = 5 the market curve is just firm A.' } }),
          Q(md`Above the kink, the market supply curve is ___ than either firm's supply curve.`, ['flatter', 'steeper', 'exactly as steep', 'vertical'], 0,
            [null, 'Two firms respond to each price change, so quantity responds more.', 'Adding firms adds quantity response.', 'The responses add up.'],
            md`A \$1 price rise adds 2 units from A and 3 from B: 5 units in total, more than either firm alone. More quantity per dollar means a flatter line.`),
          Q(md`Lecture example: firm A has $q_A = 20P$ and firm B has $q_B = 40P$. Market supply is…`, ['Q = 60P', 'P = Q/20 + Q/40 (add the inverses)', 'Q = 30P', 'Q = 800P'], 0,
            [null, 'Never add the inverse supplies: that adds prices.', 'That is the average, not the sum.', 'Multiplying makes no sense: at one price, add what each firm sells.'],
            md`$Q = 20P + 40P = 60P$, so inverse market supply is $P = Q/60$. At \$0.80: $16 + 32 = 48$.`),
          R(md`
            ### Identical firms: multiply

            With $n$ identical firms, every firm sells the same $q(P)$, so

            $$Q^S(P) = n \cdot q(P), \qquad q = \frac{Q}{n}$$

            **Example.** 100 firms, each Dent ($C = 2q^2 + 100$, so $q = P/4$). Market supply $Q = 100 \cdot P/4 = 25P$. If demand is $Q = 600 - 5P$:

            $$25P = 600 - 5P \Rightarrow 30P = 600 \Rightarrow P = 20, \qquad Q = 25(20) = 500, \qquad q = 500/100 = 5$$

            Each firm makes 5 repairs at \$20, which we found earlier loses \$50 each. They stay open in the short run (price covers AVC), but this is not a resting point: in the long run some will **exit**. That story is Part 9.

            !!intuition The order of moves for any "market" problem
              One firm's supply ($P = MC$) $\to$ market supply (add or multiply) $\to$ meet demand ($Q^S = Q^D$) $\to$ back to one firm ($q = Q/n$) $\to$ profit.
          `),
          P({ title: 'Lecture: two firms with the same start', q: md`Firm A: $P = 2 + q_A/4$. Firm B: $P = 2 + q_B/2$. Both sell nothing below \$2.`,
            plan: plan('First move?', 'Invert each: $q_A = 4P - 8$, $q_B = 2P - 4$', [
              ['Add them: $P = 4 + q/4 + q/2$', 'That adds prices. Add quantities instead.'],
              ['Set them equal to find the market price', 'Supply equals demand sets the price; there is no demand here.'],
              ['Average the intercepts and slopes', 'Market supply is a sum of quantities, not an average.'],
            ], 'Invert, add: $Q = 6P - 12$ for $P \\ge 2$, then invert back: $P = 2 + Q/6$.'),
            parts: [X('Q^S(P)\\text{ for }P \\ge 2', '6*P - 12', { P: [2, 10] }), N('Q\\text{ at }P = 4', 12), N('Q\\text{ at }P = 6', 24)],
            sol: md`$q_A = 4(P - 2) = 4P - 8$, $q_B = 2(P - 2) = 2P - 4$. $Q = 6P - 12$, i.e. $P = 2 + Q/6$. At \$4: $8 + 4 = 12$. At \$6: $16 + 8 = 24$.` }),
          P({ title: 'Kinked market supply', q: md`Firm A: $q_A = 3P - 6$ for $P \ge 2$. Firm B: $q_B = P - 6$ for $P \ge 6$. Demand: $Q = 30 - P$.`,
            plan: [
              plan('Where is the kink in market supply?', 'At $P = 6$, where firm B starts selling', [
                ['At $P = 2$, where firm A starts', 'That is where the market curve **starts**. The kink is where the second firm joins.'],
                ['Where the two supply curves cross', 'Crossing points do not matter when adding sideways.'],
                ['There is no kink with straight lines', 'Each piece is straight, but the slope jumps when B joins.'],
              ], 'Below \\$6: $Q = 3P - 6$. From \\$6 up: $Q = 4P - 12$.'),
              plan('To find equilibrium, which piece of supply do you use?', 'Try one piece, then check the price lands in that piece’s range', [
                ['Always the last piece', 'If demand is low, equilibrium can be on the first piece.'],
                ['Always the first piece', 'If demand is high, equilibrium is above the kink.'],
                ['Average the two pieces', 'Supply is one piece or the other at any given price.'],
              ], 'Try both firms: $4P - 12 = 30 - P \\Rightarrow P = 8.4 \\ge 6$ ✓. So both firms sell.'),
            ],
            parts: [N('Q_{\\text{kink}}', 12), N('P^*', 8.4), N('Q^*', 21.6), N('q_A', 19.2), N('q_B', 2.4)],
            sol: md`Kink: at $P = 6$, $q_A = 12$, so $(12, 6)$. Above it $Q = 3P - 6 + P - 6 = 4P - 12$. Equilibrium: $4P - 12 = 30 - P \Rightarrow 5P = 42 \Rightarrow P = 8.4 \ge 6$ ✓. $Q = 21.6$; $q_A = 3(8.4) - 6 = 19.2$, $q_B = 8.4 - 6 = 2.4$ (sum 21.6 ✓).` }),
          P({ title: 'Identical firms', q: md`50 identical firms each have $C(q) = 10 + q^2$. Demand is $Q = 300 - 25P$.`,
            plan: plan('First move?', 'One firm: $P = MC = 2q \\Rightarrow q = P/2$; then $Q^S = 50 \\cdot P/2 = 25P$', [
              ['Set demand equal to $MC = 2q$', 'Demand is the whole market. Add up the 50 firms first.'],
              ['Set $P = \\min AC$', 'That is the long-run answer with free entry. Here the number of firms is fixed.'],
              ['Divide demand by 50, then set $MR = MC$', 'Price takers set $P = MC$; there is no MR below price here.'],
            ], 'Market supply $25P$; set $25P = 300 - 25P$.'),
            parts: [N('P^*', 6), N('Q^*', 150), N('q^*', 3), N('\\pi', -1)],
            sol: md`$25P = 300 - 25P \Rightarrow P = 6$, $Q = 150$, $q = 3$. $\pi = 6(3) - (10 + 9) = -1$. A small loss; price covers AVC ($AVC = q$, min 0), so they operate. In the long run some exit.` }),
          G('m3_mkt_sum', { need: 3 }),
          G('m3_mkt_ident', { need: 2 }),
        ],
      },
    ],
  });
})();

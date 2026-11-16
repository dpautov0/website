/* Mini Exam 3 · tools: the provided formula sheet line by line (when you use each line, and the tell in the problem),
   what is NOT on the sheet, a which-formula-for-which-question index, and mixed practice drawn from every m3
   generator. This file loads last, so M3.GENS already lists every Mini Exam 3 generator when it runs. */
(function () {
  'use strict';
  const { R, G } = C;

  // ------------------------------------------------------------------ the sheet, group by group
  const sheet = [
    R(md`
      ### How to use this page

      In the exam you get a two-page formula sheet. It gives you **formulas**, never **which one to use**. That second part is the whole game.

      Below is every line of the sheet, grouped exactly as the sheet groups them. For each line: when you use it, and the **tell**, the words in a problem that should make your eyes jump to that line.

      Then come the things the sheet does **not** give you. Those you must know cold.
    `),
    R(md`
      ### Selected algebra, exponent, and area rules

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | $y = mx + b$; $m = \dfrac{y_2 - y_1}{x_2 - x_1}$; intercepts: set $x = 0$ or $y = 0$ | turning direct supply or demand into inverse form; finding a choke price (demand at $Q = 0$) or a supply intercept (the lowest price anyone sells at) | "inverse supply", "draw demand", "below what price does nobody sell", a CS or PS triangle that needs its top or bottom corner |
      | $\dfrac{a}{b} \div \dfrac{c}{d} = \dfrac{ad}{bc}$ | simplifying $MP_1$ ratios and elasticity fractions | a fraction inside a fraction, e.g. $\dfrac{w_1}{p}$ divided by something |
      | $ax^2 + bx + c = 0 \Rightarrow x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ | $P = MC$ with a quadratic $MC$ (cubic cost); average-cost regulation $P(Q) = AC(Q)$ | "cubic cost function", "price ceiling set equal to average cost", "the regulated quantity" |
      | $x^r x^s = x^{r+s}$; $x^r/x^s = x^{r-s}$ | Cobb–Douglas marginal products; returns to scale | $q = A x_1^{a} x_2^{b}$ |
      | $(x^r)^s = x^{rs}$; $x^0 = 1$; $x^{-r} = 1/x^r$ | rewriting $MP_1 = 4x_1^{-1/2}$ as $4/\sqrt{x_1}$ before solving $pMP_1 = w_1$ | a negative exponent after differentiating |
      | $x^{1/n} = \sqrt[n]{x}$; $x^{r/n} = \sqrt[n]{x^r}$ | square-root production functions; constant-elasticity demand $Q = kP^{-e}$ | $q = 8\sqrt{x_1}$, $Q = 270{,}000P^{-3}$ |
      | Rectangle $bh$; triangle $\tfrac12 bh$; trapezoid $\tfrac12(b_1 + b_2)h$ | every surplus: CS and PS triangles, tax revenue and transfer rectangles, DWL triangles, PS trapezoids when a policy cuts the quantity | "calculate CS, PS, total welfare", "deadweight loss", "label and shade" |

      !!trap The quadratic gives two roots: pick on purpose
        With a U-shaped MC, $P = MC$ has two roots: take the **larger** one, where MC is rising. With average-cost regulation, $P(Q) = AC(Q)$ also has two roots: take the **larger** quantity, which comes with the lower price. A negative root is never an output.
    `),
    R(md`
      ### Selected differentiation rules

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | constant: $c \to 0$ | the fixed cost disappears from MC | "fixed cost", "the constant term in $C(q)$" |
      | constant multiple: $cf(x) \to cf'(x)$ | $MC$ of $4q^2$ is $8q$ | any coefficient in front of a power |
      | power: $x^r \to rx^{r-1}$ | $MC$, $MP_1$, $MR$ from $TR$ | "marginal" anything |
      | sum or difference: differentiate term by term | $MC$ of a cubic cost; $MR$ of $TR = aQ - bQ^2$ | a cost or revenue function with several terms |
      | product: $f'g + fg'$ | $MR = \dfrac{d[P(Q)Q]}{dQ} = P(Q) + Q\dfrac{dP}{dQ}$ | "derive MR", "why is MR below price" |
      | partial derivative: treat the other variables as constants | $MP_1 = \partial f/\partial x_1$ with $x_2$ held at $\bar x_2$ | "short run, input 2 is fixed", "marginal product of input 1" |

      !!intuition Every derivative on this exam answers one question
        "What does **one more** unit do?" One more unit of output costs $MC$ and brings in $MR$ (or $P$). One more unit of input 1 makes $MP_1$ more output, worth $pMP_1$, and costs $w_1$.
    `),
    R(md`
      ### Costs, revenue, and profit

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | $TC(q) = F + VC(q)$ | splitting a cost function: the constant is $F$, the rest is $VC$ | "fixed cost", "variable cost", any $C(q)$ with a constant |
      | $AFC = F/q$; $AVC = VC/q$; $AC = TC/q = AFC + AVC$ | the shutdown test (min AVC), the break-even test (min AC), the profit rectangle | "shutdown price", "break even", "average cost at the chosen output" |
      | $MC = dTC/dq = dVC/dq$ | the output choice ($P = MC$, $MR = MC$) | "how much does the firm produce" |
      | $TR = Pq$ | revenue rectangles; the start of every profit | "total revenue", "shade revenue" |
      | accounting profit = revenue − explicit costs | money actually paid out | "the accountant", "explicit costs", "books" |
      | $\pi = TR - TC = [P - AC(q)]q$, $TC$ includes explicit and implicit costs | economic profit; the profit (or loss) rectangle | "economic profit", "forgone salary", "could have earned", "shade profit or loss" |
      | $PS = TR - VC$; $\pi = PS - F$ | producer surplus of a firm; linking PS and profit | "producer surplus", "how much better off than shutting down" |

      !!key Two profits, two rectangles
        Accounting profit subtracts only what was paid out. Economic profit also subtracts the **implicit** cost: the owner's forgone salary and the return her own money could earn elsewhere. Zero economic profit means "doing exactly as well as the next-best option", not "losing".
    `),
    R(md`
      ### Competitive firms, input choice, and market supply

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | $MR = MC$; price taker: $P = MR = MC$ | **the** output rule; a price taker's MR is the price itself | "competitive firm", "price taker", "how much does it produce" |
      | $MP_i = \partial f/\partial x_i$; $pMP_i = w_i$ | the short-run input choice: hire until one more unit of input pays exactly its price | "short run, $x_2$ fixed", "how much of input 1", "wage", "rental rate" |
      | $\pi = pq - w_1x_1 - w_2x_2$ | profit with two inputs, after you know $x_1^*$ and $q^*$ | "find profit" in an input-choice problem |
      | $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$ | the isoprofit line: slope $w_1/p$, intercept $(\pi + w_2\bar x_2)/p$ | "isoprofit", "slope of the isoprofit line", "what happens to the isoprofit lines when $p$ (or $w_1$) changes" |
      | $Q^S(P) = \sum_i q_i^S(P)$ | market supply: add **quantities** at one price | "market supply", "two firms", "firm B sells nothing below…" |
      | $Q = nq$; $n = Q/q$ | identical firms: build market supply; count firms in the long run | "$n$ identical firms", "how many firms" |

      !!trap The isoprofit line is a profit level, not a production function
        Every point on one isoprofit line gives the same profit. The firm wants the **highest** line it can reach; the best one just touches the production function, where the slopes match: $MP_1 = w_1/p$. A higher $p$ makes the lines **flatter**; a higher $w_1$ makes them **steeper**. The fixed input's price $w_2$ only moves the intercept, never the choice of $x_1$.
    `),
    R(md`
      ### Monopoly, marginal revenue, and elasticity

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | $Q = Q(P)$; $P = P(Q)$; $TR(Q) = P(Q)Q$ | switching demand to inverse form before anything monopoly; building TR | "a monopolist faces demand $Q = \ldots$" (invert it first) |
      | $MR = \dfrac{dTR}{dQ} = P(Q) + Q\dfrac{dP}{dQ}$ | MR for any demand; the reason MR is below price (the second term is negative) | "derive MR", "explain why MR is less than price", a revenue table (MR = change in TR) |
      | $P = a - bQ \Rightarrow MR = a - 2bQ$ | the shortcut for linear demand: same intercept, twice the slope | any linear inverse demand with a monopolist |
      | $\varepsilon_p = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q}$ | elasticity at the monopoly point; checking the elastic portion | "own-price elasticity at the profit-maximizing point" |
      | $Q = kP^{-e} \Rightarrow \varepsilon_p = -e$ | constant-elasticity demand: the same elasticity at every price | $Q = kP^{-e}$, "constant elasticity" |
      | $MR = P\left(1 + \dfrac{1}{\varepsilon_p}\right)$ | MR when you know elasticity, not the demand line; with $MR = MC$ gives $P = MC\cdot\dfrac{e}{e - 1}$ | constant-elasticity monopoly, "markup" |
      | $L = \dfrac{P - MC}{P}$ | market power: the markup as a share of the price | "Lerner index", "market power" |
      | $L = -\dfrac{1}{\varepsilon_p}$ at the untaxed single-price monopoly optimum | a check on your answer, or a shortcut when only elasticity is given | "elasticity is −4; what is the Lerner index?" |

      !!trap The Lerner link holds only at the untaxed optimum
        $L = -1/\varepsilon_p$ comes from $MR = MC$. Under a tax the monopolist sets $MR = MC + t$ (or $(1 - v)MR = MC$), so the link breaks. With a tax, compute $L = (P - MC)/P$ directly.
    `),
    R(md`
      ### Taxes, price wedges, and incidence

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | $P_c - P_p = t$ | a per-unit (specific) tax: the gap between what buyers pay and sellers keep | "\$2 per unit", "per-unit tax", "excise tax" |
      | $P_p = (1 - v)P_c$ | an ad valorem tax: the seller keeps the fraction $1 - v$ of every dollar | "20% tax", "a tax on the value of sales" |
      | $G = (P_c - P_p)Q$ | tax revenue: the wedge times the quantity **after** the tax | "tax revenue", "government revenue" |
      | $G$ = purchase price × quantity the government buys | price-support spending | "the government buys the surplus", "price support" |
      | consumer share $(P_c - P)/t$; producer share $(P - P_p)/t$ | incidence: who bears the tax, measured from the **pre-tax** price $P$ | "incidence", "what share of the tax do consumers bear" |
      | $dP_c/dt$ | pass-through: how much the consumer price rises per \$1 of tax | "pass-through", "if the tax rises by \$1" |

      !!key Legal liability never decides incidence
        Whether the law makes sellers or buyers send the check, the equilibrium $P_c$, $P_p$ and $Q$ are the same. The side that is **less elastic** (less able to walk away) bears more of the tax.
    `),
    R(md`
      ### Welfare and policy analysis

      | On the sheet | When you use it | The tell in the problem |
      |---|---|---|
      | CS = area below demand, above the consumer price, over the units consumers buy | every policy and monopoly welfare question | "consumer surplus", "shade CS" |
      | PS = area above MC or inverse supply, below the producer price, over the units producers sell; $PS = TR - VC$ | market PS (a triangle or trapezoid) or one firm's PS | "producer surplus", "shade PS" |
      | $W = CS + PS\ (+G)$ | total welfare: add tax revenue $+G$; subtract price-support spending (it counts as $-G$) | "total welfare", "social surplus", "change in welfare" |

      !!method The welfare table, every time
        Make three columns: **Before**, **After**, **Change**. Rows: CS, PS, G (if any), W. Fill Before, fill After, subtract. The W row's change is minus the DWL. A rectangle that leaves CS and shows up in PS (or G) is a **transfer**; a triangle that shows up nowhere is a **loss**.
    `),
    R(md`
      ### NOT on the sheet: know these cold

      The sheet gives formulas. It does not tell you any of these decision rules.

      !!key Short-run shutdown
        Shut down if $P < \min AVC$. Find min AVC from $MC = AVC$ (or $dAVC/dq = 0$). Between min AVC and min AC the firm **operates at a loss**: the loss is smaller than the fixed cost it would lose by shutting down.

      !!key Long-run exit and equilibrium
        Exit if $P < \min LRAC$. Long-run competitive equilibrium (identical firms, free entry, constant input prices): $P = \min LRAC$, each firm makes $q^* = \arg\min LRAC$, the market quantity $Q$ comes from **demand** at that price, and $n = Q/q^*$.

      !!key MC crosses AVC and AC at their minimums
        So $\min AVC$: set $MC = AVC$. $\min AC$: set $MC = AC$. $\min LRAC$: set $LRMC = LRAC$.

      !!key Take the rising-branch root
        $P = MC$ with a U-shaped MC has two roots. The profit maximum is the larger one, where MC is rising.

      !!key Which quantity trades
        | Policy | Quantity traded |
        |---|---|
        | binding ceiling (below equilibrium) | $Q^S$ at the ceiling (sellers are the short side) |
        | binding floor (above equilibrium) | $Q^D$ at the floor (buyers are the short side) |
        | price support | producers sell $Q^S$ at the support price; consumers buy $Q^D$; the government buys $Q^S - Q^D$ |

      !!key DWL is a triangle
        $\text{DWL} = \tfrac12 \times \text{base} \times \text{height}$. **Base** = the efficient quantity minus the quantity actually traded (or the other way for overproduction). **Height** = the vertical gap between demand and supply (or demand and MC) at the traded quantity. For a tax the height is the tax itself: $\tfrac12 \times t \times \Delta Q$.

      !!key Solving a per-unit tax
        Write supply at the producer price and demand at the consumer price: $Q^D(P_p + t) = Q^S(P_p)$. Solve for $P_p$, then $P_c = P_p + t$, then $Q$.

      !!key Monopoly reads its price off demand
        $MR = MC$ gives the **quantity**. The price is the demand curve at that quantity, never MR or MC at it.

      !!key Linear MR has twice the slope
        $P = a - bQ \Rightarrow MR = a - 2bQ$: same vertical intercept, hits zero at half the quantity.

      !!key Effective MR under a tax on a monopoly
        Specific tax $t$: the firm keeps $P - t$, so effective MR is $MR - t$; set $MR - t = MC$, i.e. $MR = MC + t$.
        Ad valorem tax $v$: the firm keeps $(1 - v)P$, so effective MR is $(1 - v)MR$; set $(1 - v)MR = MC$.
        Then read $P_c$ off the **original** demand at the new $Q$, and $P_p = P_c - t$ or $(1 - v)P_c$.

      !!key Pass-through on a monopoly
        Linear demand, constant MC: $dP_c/dt = 1/2$ (half the tax). Constant elasticity $e$, constant MC: $P = MC\cdot\dfrac{e}{e - 1}$, so $dP_c/dt = \dfrac{e}{e - 1} > 1$: consumers pay **more** than the tax.

      !!key Regulating a natural monopoly
        **$P = MC$ ceiling:** efficient quantity, but with constant MC price equals MC, so the firm loses its fixed cost $F$ and exits in the long run without a subsidy.
        **$P = AC$ ceiling:** zero economic profit; solve $P(Q) = AC(Q)$, a quadratic, and take the **larger** root (more output, lower price). A small DWL remains between that quantity and the $P = MC$ quantity.
    `),
    R(md`
      ### Which formula for which question: a quick index

      | The question asks for… | Go to | First equation |
      |---|---|---|
      | economic vs accounting profit | Costs, revenue, profit | subtract implicit costs too |
      | how much input 1 to hire | Competitive firms | $p\,MP_1 = w_1$ |
      | the isoprofit line or its slope | Competitive firms | $q = \tfrac{w_1}{p}x_1 + \tfrac{\pi + w_2\bar x_2}{p}$ |
      | a competitive firm's output | Competitive firms | $P = MC$ (larger root) |
      | the shutdown price | not on the sheet | $\min AVC$: $MC = AVC$ |
      | the break-even price | not on the sheet | $\min AC$: $MC = AC$ |
      | profit, or "shade profit/loss" | Costs, revenue, profit | $\pi = (P - AC)q$ |
      | producer surplus of a firm | Costs, revenue, profit | $PS = TR - VC = \pi + F$ |
      | market supply | Competitive firms | invert each firm, add $q$'s at one price |
      | the long-run price, number of firms | not on the sheet | $P = \min LRAC$; $n = Q/q^*$ |
      | CS, PS, total welfare, DWL | Welfare; area rules | triangles, trapezoids, rectangles |
      | a per-unit tax on a competitive market | Taxes | $Q^D(P_p + t) = Q^S(P_p)$ |
      | incidence | Taxes | $(P_c - P)/t$ and $(P - P_p)/t$ |
      | a binding ceiling or floor | not on the sheet | traded $Q$ = the short side |
      | a price support | Taxes (government purchases) | $G$ = price × $(Q^S - Q^D)$; $W = CS + PS - G$ |
      | monopoly quantity and price | Monopoly | $MR = MC$, then $P$ from demand |
      | monopoly DWL | Welfare | triangle from $Q_m$ to the $P = MC$ quantity |
      | Lerner index, elasticity | Monopoly | $L = (P - MC)/P = -1/\varepsilon_p$ |
      | monopoly under a specific tax | Monopoly; Taxes | $MR = MC + t$ |
      | monopoly under an ad valorem tax | Monopoly; Taxes | $(1 - v)MR = MC$ |
      | pass-through | Taxes | $dP_c/dt$: 1/2 (linear), $e/(e - 1)$ (constant elasticity) |
      | regulating a natural monopoly | not on the sheet | $P = MC$, or $P(Q) = AC(Q)$ with the larger root |

      Practice the hunt: open the [practice exams](#/l/m3-xa), and for every part, put your finger on the sheet line **before** you write anything.
    `),
  ];

  // ------------------------------------------------------------------ mixed practice
  // M3.GENS lists every m3 generator registered so far; this file loads last, so that is all of them.
  const all = (window.M3 && M3.GENS ? M3.GENS : []).filter((n) => GENS[n]);
  const pick = (re) => all.filter((n) => re.test(n));
  const block = (title, pool, need, intro) => (pool.length ? [R(md`${intro}`), G(pool[0], { need, pool: pool.slice() })] : []);
  const PARTS = [
    ['Part 7: profit and input choice', /^m3_pr_/, 'Economic profit, $pMP_1 = w_1$, isoprofit lines, price changes.'],
    ['Part 8: short-run supply', /^m3_(sr|mkt)_/, '$P = MC$ on the rising branch, the shutdown price, profit, adding supply curves.'],
    ['Part 9: long-run supply and welfare', /^m3_lr_/, 'Min LRAC, the number of firms, short run versus long run, CS, PS and deadweight loss.'],
    ['Part 10: taxes, ceilings, floors, supports', /^m3_po_/, 'The tax wedge, incidence, binding ceilings and floors, price supports.'],
    ['Part 11: monopoly', /^m3_mo_/, '$MR = MC$, price from demand, CS, PS, DWL, the Lerner index.'],
    ['Part 12: monopoly taxes and regulation', /^m3_(mt|rg)_/, 'Effective MR under a tax, pass-through, $P = MC$ and $P = AC$ regulation.'],
  ];
  const mixSteps = [
    R(md`
      ### Mixed practice: every generator

      The exam does not tell you which lesson a question comes from. This page does not either.

      The first block draws a random problem from **every** Mini Exam 3 generator: profit and inputs, short-run and long-run supply, welfare, policies, monopoly, monopoly taxes, regulation. Each one asks for the plan before any number, exactly as you should on paper:

      1. Read the problem and name the type (the [problem-type map](#/l/m3-map) has them all).
      2. Say the first equation out loud before you write it: $P = MC$? $MR = MC$? $P = \min LRAC$? $Q^D(P_p + t) = Q^S(P_p)$?
      3. Only then compute.

      Ten right answers in a row with no peeking at the solution, and you are ready. Below it, one block per Part, for when one area still feels slow.
    `),
    ...(all.length ? [G(all[0], { need: 10, pool: all.slice() })] : [R(md`*(The generators load with the lessons; reload the page if this block is empty.)*`)]),
    ...PARTS.flatMap(([t, re, blurb]) => block(t, pick(re), 5, `### ${t}\n\n${blurb} Five in a row.`)),
  ];

  C.unit({
    id: 'm3tools', exam: 'm3', tools: true, num: 'Mini Exam 3', title: 'Formula sheet and mixed practice',
    lessons: [
      { id: 'm3-sheet', title: 'Formula sheet: what each line is for', sub: 'every line, when to use it, the tell; what is not on it', kind: 'read', steps: sheet },
      { id: 'm3-mix', title: 'Mixed practice: every generator', sub: 'random problems from all six Parts, plan first', kind: 'review', steps: mixSteps },
    ],
  });
})();

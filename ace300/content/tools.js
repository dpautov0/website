/* The formula sheet (what the exam gives you, and what it does not) and mixed practice across every part. */
(function () {
  'use strict';
  const { R, G } = C;
  const UNITS = ['u0', 'u1', 'u1b', 'u2', 'u3', 'u4', 'u5', 'u6', 'intu'];
  const ALL = ['math_mix', 'cd_demand', 'income_mix', 'slutsky', 'shift_move', 'market_demand', 'elasticity', 'income_elas', 'cs_mix', 'cvev', 'prod_basics', 'mp_trs', 'rts', 'isocost_mp', 'cd_costmin', 'corner_kink', 'cost_func', 'mc_avg', 'cost_sched'];

  C.unit({ id: 'tools', exam: 'm2', tools: true, num: 'Mini Exam 2', title: 'Formula sheet and mixed practice', lessons: [
    { id: 'sheet', title: 'Formula sheet', kind: 'read', steps: [
      R(md`
        ### What the exam hands you

        You get a formula sheet in the exam. Knowing **where** each formula sits, and **when** to use it, saves minutes. Here is everything on it, with a note on when it applies.
      `),
      R(md`
        ### Math tools

        | On the sheet | When you use it |
        |---|---|
        | $y = mx + b$, slope $= \dfrac{y_2 - y_1}{x_2 - x_1}$ | budget lines, isocost lines, linear demand |
        | $\dfrac{a}{b} \div \dfrac{c}{d} = \dfrac{ad}{bc}$ | MRS, TRS, $MP_1/MP_2$ |
        | $x^ax^b = x^{a+b}$, $x^a/x^b = x^{a-b}$, $(x^a)^b = x^{ab}$ | simplifying Cobb–Douglas ratios |
        | $x^0 = 1$, $x^{-a} = 1/x^a$, $x^{1/2} = \sqrt x$ | marginal products |
        | power rule $\dfrac{d}{dx}x^r = rx^{r-1}$; constants and sums | MP, MC, elasticity slopes |
        | partial derivative: treat the other variable as a constant | $MP_1$, $MP_2$ |
      `),
      R(md`
        ### Demand

        | On the sheet | When you use it |
        |---|---|
        | Cobb–Douglas demand: $x_1^* = am/p_1$, $x_2^* = (1-a)m/p_2$ | every Slutsky and CV/EV problem |
        | Income-offer: $(x_1^*(m), x_2^*(m))$ with prices fixed; Engel: $(x_i^*(m), m)$ | income-change graphs |
        | $\partial x_1/\partial p_2 > 0$: substitutes; $< 0$: complements | classifying related goods |
        | Market demand $Q(P) = \sum q_i(P)$ | horizontal summation |
        | Inverse demand $P = P(Q)$ | CS triangles |
        | $\varepsilon = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q}$ | price elasticity at a point |
        | $Q = kP^{-e} \Rightarrow \varepsilon = -e$ everywhere | constant-elasticity questions |
        | $\varepsilon_m = \dfrac{dQ}{dm}\cdot\dfrac{m}{Q}$; normal $> 0$, inferior $< 0$, luxury $> 1$ | income elasticity |
      `),
      R(md`
        ### Welfare, production, costs

        | On the sheet | When you use it |
        |---|---|
        | Discrete: TWTP = sum of reservation prices bought; $E = PQ$; $CS = \text{TWTP} - E$ | WTP schedules |
        | Continuous: TWTP = area under inverse demand up to $Q$; CS = area below demand, above price | linear demand CS |
        | "CS need not equal CV or EV when income effects matter" | the approximation question |
        | $MP_i = \partial f/\partial x_i$; Cobb–Douglas $y = Ax_1^ax_2^b$ | production |
        | $TRS = -MP_1/MP_2$ | isoquant slope |
        | Short run: at least one input fixed; diminishing $MP_1$: $MP_1$ falls as $x_1$ rises | definitions |
        | Isocost $\bar C = w_1x_1 + w_2x_2$; intercepts $\bar C/w_i$; slope $-w_1/w_2$ | drawing cost lines |
        | Tangency $MP_1/MP_2 = w_1/w_2$, i.e. $MP_1/w_1 = MP_2/w_2$; plus $f(x_1, x_2) = y$ | Cobb–Douglas cost minimization |
        | $x_i^*(w_1, w_2, y)$; $C = w_1x_1^* + w_2x_2^*$ | conditional demands, $C(y)$ |
        | $TC = F + VC$; $AFC = F/y$, $AVC = VC/y$, $ATC = AFC + AVC$ | cost tables |
        | $MC \approx \Delta TC/\Delta y$; $MC = dTC/dy = dVC/dy$ | marginal cost |
      `),
      R(md`
        ### Not on the sheet: memorize these

        !!key Slutsky in four steps
          1. A: old prices, old income. 2. B: new prices, old income.
          3. $m' = p_1^{\text{new}}x_1^A + p_2x_2^A$; C: new prices with $m'$.
          4. Substitution $= C - A$; income $= B - C$; total $= B - A$.

        !!key Giffen and the signs
          Substitution effect is always opposite to the price change. Normal: income effect reinforces. Inferior: opposes. Giffen: inferior **and** the income effect wins.

        !!key Elasticity and revenue
          Elastic ($|\varepsilon| > 1$): price and revenue move **opposite**. Inelastic: **together**. Unit elastic: revenue unchanged. Linear demand is unit elastic at its **midpoint**.

        !!key CV and EV
          | | Prices | Utility fixed | Price rise |
          |---|---|---|---|
          | CV | new | original | given |
          | EV | original | new | taken away |
          Normal good, price rise: $CV > |\Delta CS| > EV$ (inferior: reversed).

        !!key Returns to scale
          Cobb–Douglas: $a + b$ vs 1. Perfect substitutes and perfect complements: always CRS. IRS → falling AC; CRS → flat; DRS → rising.

        !!key Corners and kinks
          Perfect substitutes $a_1x_1 + a_2x_2$: compare $w_1/a_1$ with $w_2/a_2$; use only the cheaper per unit of output.
          Perfect complements $\min\{a_1x_1, a_2x_2\}$: $x_i = y/a_i$; $C(y) = (w_1/a_1 + w_2/a_2)y$.

        !!key MC and the averages
          MC below an average pulls it down; above pulls it up; MC crosses AVC and ATC at their minima. To minimize an average, set it equal to MC (or set its derivative to 0).

        !!key Short run vs long run
          $SRTC \ge LRTC$. LRAC is the lower envelope of the SRAC curves. At a tangency, $SRMC = LRMC$.
      `),
    ] },
    { id: 'mix', title: 'Mixed practice', kind: 'review', steps: [
      R(md`
        The exam mixes topics, so this does too. The first block pulls conceptual questions from every lesson at random. The second gives a new calculation from a random topic each time.
      `),
      G('concept', { need: 25, units: UNITS }),
      G('any', { pool: ALL, need: 20 }),
    ] },
  ] });
})();

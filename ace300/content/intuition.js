/* Intuition drills: short "what happens and why" questions in real-world settings, no calculator needed. */
(function () {
  'use strict';
  const { R, Q, G } = C;
  const lesson = (id, title, items) => ({ id, title, kind: 'quiz', steps: [R(md`${items.length} quick questions. No math needed: think about what a real person or firm would do, pick an answer, then read why.`), ...items] });

  const i1 = [
    Q(md`Ramen is inferior for a college student. She graduates and her income triples. Her ramen purchases…`, ['fall', 'rise', 'stay the same', 'triple'], 0,
      [null, 'Inferior means quantity moves opposite to income.', 'Income changed, so an inferior good’s quantity changes.', 'That is a normal good with income elasticity 1.'],
      md`Inferior goods get replaced as you get richer: more income, less ramen.`),
    Q(md`Gas prices double. Why does a commuter buy less gas, even if her income were raised to cover her old fill-ups?`, ['gas is now pricier relative to other things', 'she is poorer than before', 'gas became an inferior good', 'her preferences changed'], 0,
      [null, 'The income was restored, so this is not the income effect.', 'Goods do not switch type because of their own price.', 'Preferences stay fixed in these problems.'],
      md`That leftover drop is the **substitution effect**: even with purchasing power restored, the relative price change makes her switch away from gas.`),
    Q(md`Coffee gets cheaper. Which part of her extra coffee is the **income effect**?`, ['the part from feeling richer', 'the part from coffee being relatively cheaper', 'the part from tea getting pricier', 'all of the extra coffee'], 0,
      [null, 'That is the substitution effect.', 'Tea’s price did not change.', 'The total splits into two effects.'],
      md`A lower price frees up money, like a small raise. What she does with that "raise" is the income effect.`),
    Q(md`Why can’t a luxury good like caviar be Giffen?`, ['it is normal, so both effects cut quantity', 'its price is already too high', 'rich people ignore prices', 'it has no substitutes'], 0,
      [null, 'High prices do not rule it out; the income effect does.', 'Everyone faces a budget.', 'Giffen needs an inferior good, not a lack of substitutes.'],
      md`For a normal good a price rise lowers quantity through **both** effects. Only an inferior good’s income effect can push the "wrong" way.`),
    Q(md`Peanut butter gets more expensive and people buy less jelly. Jelly and peanut butter are…`, ['complements', 'substitutes', 'inferior goods', 'unrelated'], 0,
      [null, 'Substitutes would see jelly sales rise.', 'This is about another good’s price, not income.', 'Jelly reacted to it.'],
      md`Used together: pricier peanut butter means fewer sandwiches, so less jelly.`),
    Q(md`A student’s income rises 10% and she spends exactly 10% more on each good. Her preferences look like…`, ['Cobb–Douglas', 'perfect complements only', 'all goods are inferior', 'all goods are luxuries'], 0,
      [null, 'Proportional spending also happens with Cobb–Douglas; this is the standard case.', 'Spending rose.', 'Luxury spending would rise faster than income.'],
      md`Cobb–Douglas spends a fixed share on each good, so every quantity rises in proportion to income (income elasticity exactly 1).`),
  ];

  const i2 = [
    Q(md`A movie theater raises ticket prices and its revenue falls. Demand at the old price was…`, ['elastic', 'inelastic', 'unit elastic', 'perfectly inelastic'], 0,
      [null, 'Inelastic demand would raise revenue.', 'Revenue would not change.', 'Quantity would not move at all and revenue would rise.'],
      md`Moviegoers left in bigger proportion than the price rose: elastic demand.`),
    Q(md`Why is demand for insulin very inelastic?`, ['it has no close substitutes and is a necessity', 'it is very cheap', 'buyers are wealthy', 'it is an inferior good'], 0,
      [null, 'Cheapness can lower elasticity, but the key here is no substitutes.', 'Wealth is not the reason.', 'It is not inferior.'],
      md`No substitutes and you need it: people buy almost the same amount whatever the price.`),
    Q(md`Demand for "food" is inelastic, but demand for one brand of cereal is elastic. Why?`, ['the brand has many close substitutes', 'cereal is a luxury', 'food prices are fixed', 'brands are inferior goods'], 0,
      [null, 'Not necessarily.', 'Food prices move too.', 'Brands are not inferior just for being brands.'],
      md`If one cereal gets pricier you switch brands easily. You cannot switch away from food.`),
    Q(md`On a straight-line demand curve, why is demand elastic at high prices?`, ['quantity is small, so a change is a big percent', 'the slope is steeper up there', 'buyers are richer up there', 'the curve is curved up there'], 0,
      [null, 'A straight line has the same slope everywhere.', 'Income is fixed along a demand curve.', 'It is a straight line.'],
      md`Elasticity is about **percent** changes. At high prices $Q$ is small, so losing a few units is a huge percent drop while the price change is a small percent.`),
    Q(md`A city adds student buyers who only buy below \$5. The market demand curve below \$5 becomes…`, ['flatter', 'steeper', 'vertical', 'unchanged'], 0,
      [null, 'More buyers responding means more quantity per price cut.', 'Not vertical.', 'New buyers change it.'],
      md`Below \$5, each price cut now brings in quantity from two groups, so quantity responds more: flatter.`),
    Q(md`Spending on restaurant meals rises faster than income. Restaurant meals are…`, ['a luxury', 'a necessity', 'inferior', 'Giffen'], 0,
      [null, 'Necessity spending rises slower than income.', 'Spending rose with income.', 'Giffen is about own price.'],
      md`Income elasticity above 1: a luxury.`),
  ];

  const i3 = [
    Q(md`You would pay \$8 for a sandwich and it costs \$5. You buy it. Your consumer surplus is the…`, ['\\$3 you keep beyond what it was worth paying', '\\$5 you spent on it', '\\$8 you thought it was worth', '\\$13 of total value'], 0,
      [null, 'That is spending, not surplus.', 'That is willingness to pay.', 'Nothing adds these.'],
      md`Surplus = what you would have paid − what you did pay = \$3.`),
    Q(md`Why does a price increase hurt buyers in **two** ways?`, ['they pay more and also give up some units', 'they pay more and sellers lose profit', 'they pay more and their income falls', 'they pay more and the good gets worse'], 0,
      [null, 'Seller profit is not part of buyer surplus.', 'Income is held fixed.', 'Quality is unchanged.'],
      md`Rectangle: paying more on units still bought. Triangle: surplus lost on units no longer bought.`),
    Q(md`Why is the last unit you buy worth only a bit more than its price?`, ['you stop buying exactly where value meets price', 'sellers charge more for the last unit', 'the last unit is lower quality', 'income runs out at that point'], 0,
      [null, 'Price is the same for every unit.', 'Units are identical.', 'You stop because the next one is not worth the price.'],
      md`You keep buying while each extra unit is worth at least the price. So the last one bought barely beats the price.`),
    Q(md`Gas prices rise. CV asks how much money to give a driver **after** the rise. Why does that take more money than EV (for a normal good)?`, ['she must buy back happiness at the high prices', 'CV ignores the income effect', 'EV is measured in utils', 'CV counts the money twice'], 0,
      [null, 'Both include income effects; that is why they differ.', 'Both are in dollars.', 'Nothing is double counted.'],
      md`Getting back to the old happiness when everything (gas) is expensive costs more than the equivalent loss measured at the old, cheaper prices.`),
    Q(md`EV for a price increase is like asking the consumer…`, ['"what would you pay to stop this?"', '"what must we pay you after this?"', '"how many utils did you lose?"', '"how much less will you buy?"'], 0,
      [null, 'That is CV.', 'Utils have no dollar meaning.', 'That is the quantity effect.'],
      md`EV is measured before the change, at old prices: the most she would give up to avoid the price increase.`),
  ];

  const i4 = [
    Q(md`A pizza shop keeps adding cooks to one small kitchen. Why does each new cook add fewer pizzas?`, ['the kitchen is fixed, so they get crowded', 'later cooks are less skilled', 'customers stop ordering', 'wages rise with each cook'], 0,
      [null, 'Workers are assumed identical.', 'This is about production, not demand.', 'Wages do not change output.'],
      md`Diminishing marginal product: more of one input with the others fixed means crowding.`),
    Q(md`A bakery doubles its ovens **and** its bakers and makes more than double the bread. Why might that happen?`, ['bigger scale allows specialization', 'each baker works twice as fast', 'the ovens get cheaper', 'demand doubles'], 0,
      [null, 'Not by assumption.', 'Prices do not change output.', 'Returns to scale is about technology, not demand.'],
      md`Increasing returns to scale often come from specialization and dividing up tasks at bigger scale.`),
    Q(md`Why does a bike factory waste money if it buys 3 wheels per frame?`, ['bikes need exactly 2 wheels per frame', 'wheels are a luxury input', 'frames have diminishing MP', 'wheels and frames are substitutes'], 0,
      [null, 'Inputs are not luxuries.', 'The issue is fixed proportions.', 'You cannot swap a wheel for a frame.'],
      md`Perfect complements: extra wheels beyond 2 per frame add nothing.`),
    Q(md`Cashiers and kiosks are perfect substitutes. Kiosks get cheaper per order handled. The store will…`, ['switch entirely to kiosks', 'use more of both', 'keep the same mix', 'switch entirely to cashiers'], 0,
      [null, 'With substitutes, use the cheaper one only.', 'Prices matter for substitutes.', 'Cashiers are now the expensive way.'],
      md`Straight-line isoquants: the cheapest point is the corner that uses only the input with the lower cost per unit of output.`),
    Q(md`A factory’s labor is giving 4 units per dollar and machines 2 units per dollar. Without changing output, it should…`, ['shift spending from machines to labor', 'shift spending from labor to machines', 'cut both inputs', 'keep its current mix'], 0,
      [null, 'That moves money to the less productive dollar.', 'That lowers output.', 'Output per dollar is not equal yet.'],
      md`Move dollars to where they buy more output until output per dollar is equal.`),
  ];

  const i5 = [
    Q(md`A food truck pays \$500 a month for its permit whether it sells 10 tacos or 1,000. As it sells more, the permit cost **per taco**…`, ['falls', 'rises', 'stays the same', 'first rises then falls'], 0,
      [null, 'The same \\$500 is spread thinner.', 'It is divided by more tacos.', 'AFC only falls.'],
      md`Average fixed cost $= 500/y$ always falls.`),
    Q(md`Your GPA is 3.2 and you get a 4.0 this semester. Which cost idea is this like?`, ['MC above ATC pulls ATC up', 'MC below ATC pulls ATC up', 'AFC always falls', 'fixed cost does not change'], 0,
      [null, 'Below the average pulls it down.', 'Not related.', 'Not related.'],
      md`A "marginal" grade above the average raises the average, just like MC above ATC raises ATC.`),
    Q(md`Why does marginal cost eventually rise in the short run?`, ['diminishing marginal product of the variable input', 'fixed cost grows with output', 'input prices rise automatically', 'the firm has increasing returns'], 0,
      [null, 'Fixed cost is fixed.', 'Input prices are fixed in these models.', 'That would lower cost per unit.'],
      md`With the plant fixed, each extra unit needs more and more labor, so it costs more.`),
    Q(md`A firm expects to make far more output for years. Why might it build a bigger plant even though the current one works?`, ['a bigger plant is cheaper at high output', 'fixed costs disappear in a bigger plant', 'MC is always zero in the long run', 'bigger plants have no variable costs'], 0,
      [null, 'A bigger plant usually has bigger fixed costs.', 'MC is positive.', 'They still pay workers and materials.'],
      md`The small plant gets crowded at high output. In the long run the firm moves to the plant whose SRAC is lowest at that output.`),
    Q(md`Why can short-run cost never be **below** long-run cost?`, ['the long run can always keep the current plant', 'the short run has no fixed cost', 'long-run prices are lower', 'the long run ignores labor'], 0,
      [null, 'The short run has fixed cost.', 'Prices are the same.', 'Labor is still used.'],
      md`The long run has every choice the short run has, and more, so it can only do as well or better.`),
  ];

  C.unit({
    id: 'intu', exam: 'm2', tools: true, num: 'Mini Exam 2', title: 'Intuition drills',
    lessons: [
      lesson('in-1', 'Intuition · income and price effects', i1),
      lesson('in-2', 'Intuition · demand and elasticity', i2),
      lesson('in-3', 'Intuition · consumer welfare', i3),
      lesson('in-4', 'Intuition · production and cost minimization', i4),
      lesson('in-5', 'Intuition · cost curves', i5),
      { id: 'in-all', title: 'Intuition · random mix', kind: 'quiz', steps: [R(md`All the intuition questions shuffled, plus every lesson’s concept questions. Keep going until every answer feels obvious.`), G('concept', { units: ['intu', 'u1', 'u1b', 'u2', 'u3', 'u4', 'u5', 'u6'], need: 40 })] },
    ],
  });
})();

/* gym-m3.js — the Mini Exam 3 recognition gym's decks: one-tap items that train SEEING the move, not computing it.
   Every deck is GYM.add({ id, title, chip, rule (md), make() }); make() returns one item
     { figHtml? (EC.graph svg), q (md), opts: [md], a, why: [md | null], rule (md) }, built with GYM.mc(right, wrongs).
   Numbers come from small lists so every draw is clean; each wrong option is a real confusion with its own why.
   The pages for these decks are in content/m3-gym.js. */
(function () {
  'use strict';
  const { pick, ri, shuffle } = U;
  const mc = GYM.mc;
  const F = (v, d = 2) => EC.fmt(v, d);
  const some = (arr, k) => shuffle(arr).slice(0, k);
  const item = (q, m, rule, figHtml) => Object.assign(figHtml ? { figHtml } : {}, { q }, m, { rule });
  const pct = (x) => `${F(100 * x, 1)}\\%`; // inside math
  const pctT = (x) => `$${pct(x)}$`; // in text

  // ================================================================== 1. which first equation?
  const EQ = {
    pmc: '$P = MC$',
    mrmc: '$MR = MC$, then the price from demand',
    pac: '$P = AC$',
    mcavc: '$MC = AVC$ (the bottom of AVC)',
    mcac: '$MC = AC$ (the bottom of AC)',
    lrac: '$P = \\min LRAC$ (set $LRMC = LRAC$)',
    pmp: '$p \\cdot MP_1 = w_1$',
    mp: '$MP_1 = w_1$',
    tang: '$\\dfrac{MP_1}{MP_2} = \\dfrac{w_1}{w_2}$',
    tax: '$Q^D(P_c) = Q^S(P_p)$ with $P_c = P_p + t$',
    mrt: '$MR - t = MC$',
    mrv: '$(1 - v)\\,MR = MC$',
    dmc: 'Demand meets MC: $P(Q) = MC$',
    dac: 'Demand meets AC: $P(Q) = AC(Q)$',
    mr0: '$MR = 0$',
    nq: '$P = MC$ for one firm, then $Q^S = n\\,q(P)$',
  };
  const FIRST = [
    () => {
      const Fx = pick([50, 100, 200]), b = pick([2, 4, 6]), a = pick([1, 2, 3]), Pr = pick([20, 24, 30, 40]);
      return {
        q: pick([
          md`A price-taking firm has $C(q) = ${Fx} + ${b}q + ${a}q^2$. The market price is \$${Pr}. How much does it produce?`,
          md`A wheat farm sells at the market price of \$${Pr} a bushel. Its cost is $C(q) = ${Fx} + ${b}q + ${a}q^2$. What output maximizes its profit?`,
          md`A competitive firm with cost $C(q) = ${a}q^2 + ${b}q + ${Fx}$ faces a price of \$${Pr}. Find its output.`,
        ]),
        right: EQ.pmc,
        wrongs: [[EQ.pac, '$P = AC$ is where profit is **zero** (break-even), not where it is largest.'],
          [EQ.mrmc, 'A price taker sells every unit at the same price, so $MR = P$. MR below the price is the monopoly case.'],
          [EQ.mcavc, 'That finds the shutdown price, a property of the cost curves alone. It never uses the price you were given.'],
          [EQ.lrac, 'That is the long-run price with free entry, not one firm’s output at a given price.']],
        rule: md`A price taker gets $P$ for every unit, so $MR = P$. Produce until the next unit costs the price: **$P = MC$**, on the rising part of MC, and check $P \ge \min AVC$.`,
      };
    },
    () => {
      const k = pick([2, 3, 4, 5]), m = k * k + pick([4, 6, 10]), Fx = pick([5, 10, 20, 40]);
      return {
        q: pick([
          md`A competitive firm has $C(q) = q^3 - ${2 * k}q^2 + ${m}q + ${Fx}$. Find its **shutdown price**.`,
          md`$C(q) = q^3 - ${2 * k}q^2 + ${m}q + ${Fx}$. Below what price does the firm produce nothing in the **short run**?`,
          md`$C(q) = q^3 - ${2 * k}q^2 + ${m}q + ${Fx}$. What is the lowest price at which the firm keeps operating this period?`,
        ]),
        right: EQ.mcavc,
        wrongs: [[EQ.mcac, 'The bottom of AC is the break-even price. In the short run the fixed cost is paid either way, so only the avoidable cost (AVC) decides shutting down.'],
          [EQ.pmc, 'No price is given: the shutdown price is a property of the cost curves.'],
          [EQ.lrac, 'That is the long-run **exit** price, where every cost is avoidable. This question is about the short run.'],
          ['$AVC = 0$', 'AVC = 0 is not a landmark. You want the lowest point of AVC.']],
        rule: md`Shutdown is a short-run test against **avoidable** cost: the bottom of AVC, found where $MC = AVC$ (or $dAVC/dq = 0$).`,
      };
    },
    () => {
      const a = pick([1, 2, 3]), Fx = pick([50, 72, 100, 128]);
      return {
        q: pick([
          md`$C(q) = ${a}q^2 + ${Fx}$ in the short run. At what price does the firm earn exactly **zero economic profit**?`,
          md`A firm’s cost is $C(q) = ${a}q^2 + ${Fx}$. Find its **break-even** price.`,
          md`$C(q) = ${a}q^2 + ${Fx}$. Above what price does the firm make a profit?`,
        ]),
        right: EQ.mcac,
        wrongs: [[EQ.mcavc, 'That is the shutdown price. Zero profit needs revenue to cover the fixed cost too, so use AC.'],
          [EQ.pmc, 'No price is given; you are solving for it. Break-even is a property of the cost curves.'],
          [EQ.mrmc, 'There is no demand curve for a price taker: $MR = P$.'],
          ['$AC = 0$', 'With a fixed cost, AC never reaches zero. You want its lowest point.']],
        rule: md`Break-even price $=$ the **bottom of AC**, where MC crosses AC. Above it, profit; below it, loss.`,
      };
    },
    () => {
      const a = pick([1, 2, 3]), qs = pick([2, 3, 4, 5]), Fx = a * qs * qs, B = pick([5, 10, 20]);
      const exit = Math.random() < 0.4;
      return {
        q: exit
          ? pick([md`A competitive firm has long-run cost $LRC(q) = ${a}q^2 + ${Fx}$. Below what price does it **exit** the industry?`,
            md`$LRC(q) = ${a}q^2 + ${Fx}$. In the long run, the firm supplies a positive amount only if the price is above what?`])
          : pick([md`Identical firms each have $LRC(q) = ${a}q^2 + ${Fx}$; entry is free; demand is $Q = ${B * 50} - ${B}P$. Find the **long-run** price and the number of firms.`,
            md`A constant-cost competitive industry: every firm has $LRC(q) = ${a}q^2 + ${Fx}$ and anyone can enter. What is the long-run equilibrium price?`]),
        right: EQ.lrac,
        wrongs: [['$Q^D = Q^S$ with today’s firms', 'With free entry the number of firms is not fixed. It adjusts until profit is zero, which pins the price at the bottom of LRAC.'],
          ['$P = MC$ at the current price', 'There is no given price. In the long run, entry and exit push the price to the bottom of LRAC.'],
          [EQ.mcavc, 'AVC is the short-run shutdown test. In the long run every cost is avoidable, so the test is LRAC.'],
          [EQ.mrmc, 'Competitive firms are price takers. MR = MC with MR below price is a monopoly.']],
        rule: exit
          ? md`Exit is the long-run test: every cost is avoidable, so compare $P$ with the **bottom of LRAC** ($LRMC = LRAC$).`
          : md`Free entry and exit drive profit to zero: **$P = \min LRAC$**. Then $q^*$ = where LRAC bottoms out, $Q$ from demand at that price, $n = Q/q^*$.`,
      };
    },
    () => {
      const c = pick([2, 4, 6]), x2 = pick([4, 9, 16]), p = pick([2, 4, 5, 8]), w = pick([4, 8, 10, 16]);
      return {
        q: pick([
          md`Short run: $q = ${c}\sqrt{x_1 x_2}$ with capital fixed at $\bar x_2 = ${x2}$. The output price is $p = ${p}$ and the wage is $w_1 = ${w}$. How much labor $x_1$ does the firm hire?`,
          md`A bakery’s output is $q = ${c}\sqrt{x_1 x_2}$; its ovens are fixed at $\bar x_2 = ${x2}$. Bread sells for \$${p}, workers cost \$${w}. How many workers?`,
        ]),
        right: EQ.pmp,
        wrongs: [[EQ.mp, 'MP is in units of output, the wage is in dollars. Value the extra output at the price first: $p \\cdot MP_1$.'],
          [EQ.tang, 'That is cost minimization with **both** inputs free (long run). Here $x_2$ is fixed, so there is no tangency to find.'],
          ['$MP_1 = 0$', 'That maximizes output, not profit: the last worker would add nothing and still cost $w_1$.'],
          [EQ.pmc, 'True in the end, but you have a production function, not a cost function. The direct route is $p \\cdot MP_1 = w_1$.']],
        rule: md`Hire until the last unit of the input earns what it costs: **value of its marginal product $p\cdot MP_1$ = its price $w_1$**.`,
      };
    },
    () => {
      const b = pick([2, 4, 5]), c = pick([2, 4, 5]), Ps = pick([10, 20, 30]), t = pick([2, 3, 4]);
      return {
        q: pick([
          md`Demand $Q^D = ${(b + c) * Ps} - ${b}P$, supply $Q^S = ${c}P$. The government adds a \$${t} per-unit tax. Find the price buyers pay and the price sellers keep.`,
          md`A \$${t} tax per unit is collected from sellers in a market with $Q^D = ${(b + c) * Ps} - ${b}P$ and $Q^S = ${c}P$. Find the new quantity.`,
        ]),
        right: EQ.tax,
        wrongs: [['Solve $Q^D = Q^S$, then add $t$ to the price', 'That puts the whole tax on buyers. The split depends on the slopes, so solve with the wedge built in.'],
          ['$P_p = (1 - t)P_c$', 'That is an ad valorem (percent) tax. A per-unit tax is a dollar wedge: $P_c - P_p = t$.'],
          [EQ.mrmc, 'This is a competitive market. Nobody here faces a downward-sloping MR.'],
          ['Shift supply **down** by $t$', 'A tax on sellers shifts supply **up** by $t$: they need $t$ more per unit. Down would be a subsidy.']],
        rule: md`A per-unit tax is a wedge: buyers pay $P_c$, sellers keep $P_p = P_c - t$. The market clears where **$Q^D(P_c) = Q^S(P_p)$**.`,
      };
    },
    () => {
      const a = pick([60, 100, 120, 200]), b = pick([1, 2, 4]), c = pick([10, 20]);
      return {
        q: pick([
          md`A monopolist faces $P = ${a} - ${b}Q$ and has $MC = ${c}$. Find its price and quantity.`,
          md`The only seller in town faces demand $P = ${a} - ${b}Q$; each unit costs \$${c} to make. What does it charge?`,
        ]),
        right: EQ.mrmc,
        wrongs: [[EQ.pmc, 'That is the competitive (efficient) benchmark. A monopolist must cut the price on every unit to sell one more, so it uses MR.'],
          [EQ.mr0, 'That maximizes **revenue**, not profit. It is right only if MC = 0.'],
          [EQ.pac, 'That is average-cost regulation (zero profit). An unregulated monopolist does better.'],
          ['$MR = MC$, and the price is the MC there', 'The height where MR meets MC is the cost of the last unit. The price is read off the **demand** curve above that quantity.']],
        rule: md`Monopoly: quantity from **$MR = MC$**, then go **up to demand** for the price.`,
      };
    },
    () => {
      const t = pick([2, 4, 6, 10]);
      return {
        q: pick([
          md`A \$${t} per-unit tax is collected from a monopolist. Which condition gives its taxed output?`,
          md`The government charges a monopolist \$${t} on every unit it sells. What do you set equal to find $Q$?`,
        ]),
        right: EQ.mrt,
        wrongs: [[EQ.mrv, 'That is the ad valorem (percent) tax. A per-unit tax takes $t$ dollars off each unit.'],
          ['$MR = MC$, then add $t$ to the price', 'The monopolist re-optimizes. With linear demand and constant MC the price rises by only $t/2$.'],
          ['$P - t = MC$', 'That is a competitive market with a tax. A monopolist still works with MR.']],
        rule: md`Each unit now nets $MR - t$. Set **$MR - t = MC$** (same as $MR = MC + t$), then the price from demand.`,
      };
    },
    () => {
      const v = pick([10, 20, 25, 40]);
      return {
        q: pick([
          md`A ${v}% ad valorem tax applies to a monopolist’s sales. Which condition gives its output?`,
          md`Consumers pay a ${v}% sales tax on a monopolist’s product. What do you set equal to find $Q$?`,
        ]),
        right: EQ.mrv,
        wrongs: [[EQ.mrt, 'That is a per-unit tax in dollars. A percent tax scales revenue, so it scales MR.'],
          ['$MR - v = MC$', `A percent is not a dollar amount: subtracting ${v / 100} dollars per unit means nothing. Multiply MR by $(1 - v)$.`],
          ['$(1 - v)P = MC$', 'Still a monopoly: it is MR, not the price, that gets scaled and set equal to MC.']],
        rule: md`Ad valorem: the firm keeps $(1 - v)$ of every dollar, so set **$(1 - v)MR = MC$**. Then $P_c$ from demand and $P_p = (1 - v)P_c$.`,
      };
    },
    () => ({
      q: pick([
        md`Regulators cap a monopolist’s price at its **marginal cost**. What do you solve for the regulated quantity?`,
        md`To find a monopoly’s deadweight loss you need the efficient quantity. What do you solve?`,
        md`What quantity would a competitive industry with the monopolist’s MC produce?`,
      ]),
      right: EQ.dmc,
      wrongs: [[EQ.mrmc, 'That is the unregulated monopoly point, not the efficient one.'],
        [EQ.dac, 'That is average-cost pricing (zero profit). It still leaves some deadweight loss.'],
        [EQ.mcac, 'The bottom of AC is a cost-curve point. Efficiency is about the buyer’s value of the last unit (demand) versus its cost (MC).']],
      rule: md`Efficient output: the last unit is worth (demand height) exactly what it costs (MC): **$P(Q) = MC$**. This is the benchmark for every monopoly DWL.`,
    }),
    () => ({
      q: pick([
        md`Regulators want a natural monopoly to **just break even**. What do you solve for the regulated quantity?`,
        md`A water utility is regulated with **average-cost pricing**. Which equation gives its quantity?`,
      ]),
      right: EQ.dac,
      wrongs: [[EQ.dmc, 'That is marginal-cost pricing: efficient, but the firm loses its fixed cost.'],
        [EQ.mcac, 'A natural monopoly’s AC keeps falling across the market. You need where **demand** crosses AC, not the bottom of AC.'],
        [EQ.mrmc, 'That is what the firm does with no regulation.']],
      rule: md`Average-cost pricing: price where demand crosses AC, **$P(Q) = AC(Q)$**. It is a quadratic; take the **larger root** (more output, lower price).`,
    }),
    () => {
      const n = pick([20, 50, 100]), a = pick([1, 2]), Fx = pick([10, 50, 100]);
      return {
        q: md`${n} identical price-taking firms each have $C(q) = ${Fx} + ${a === 1 ? '' : a}q^2$. Market demand is given. Find the **short-run** equilibrium price.`,
        right: EQ.nq,
        wrongs: [['Set demand equal to one firm’s MC', 'Demand is for the whole market; one firm supplies a sliver of it. Add up the firms first.'],
          [EQ.lrac, 'That is the long-run answer with free entry. In the short run the number of firms is fixed.'],
          [EQ.mrmc, 'Each firm is a price taker, so it sets $P = MC$.']],
        rule: md`Short run, fixed number of firms: one firm’s supply from **$P = MC$**, times $n$ for market supply, then supply = demand.`,
      };
    },
  ];
  GYM.add({
    id: 'first-equation', title: 'Which first equation?', chip: 'First equation',
    rule: md`Read **who** chooses and **what** is asked. Price taker choosing output: $P = MC$. Shutdown price: $MC = AVC$. Break-even: $MC = AC$. Long run with free entry: $P = \min LRAC$. Input with a fixed other input: $p\cdot MP_1 = w_1$. Per-unit tax in a market: $Q^D(P_c) = Q^S(P_p)$, $P_c = P_p + t$. Monopoly: $MR = MC$, then demand. Taxed monopoly: $MR - t = MC$ or $(1 - v)MR = MC$. Efficient benchmark: $P(Q) = MC$. Average-cost regulation: $P(Q) = AC(Q)$.`,
    make() {
      const s = pick(FIRST)();
      return item(s.q, mc(s.right, some(s.wrongs, 3)), s.rule);
    },
  });

  // ================================================================== 2. the four price zones (short run)
  const ZO = ['Shut down: produce nothing and lose $F$', 'Indifferent: operating and shutting down both lose $F$', 'Operate at a loss smaller than $F$', 'Operate and break even (zero economic profit)', 'Operate at a profit'];
  function zoneWhys(z, P, a, b, A, B) {
    const w = [];
    w[0] = z === 1 ? `At $P$ = ${A} exactly, operating loses exactly $F$ too: a tie, not a strict shutdown.`
      : `$P = ${P}$ is above ${A} $= ${a}$: each unit brings in more than its variable cost, so producing beats shutting down.`;
    w[1] = `The tie happens only when $P$ equals ${A} exactly ($${a}$). Here $P = ${P}$.`;
    w[2] = z === 0 ? `Below ${A} ($${a}$) each unit loses money on top of $F$: operating loses **more** than $F$, so shut down.`
      : z === 1 ? `At exactly ${A} the operating loss equals $F$; it is not smaller. That is a tie.`
        : z === 3 ? `At $P$ = ${B} the best the firm can do is zero profit, not a loss.`
          : `$P = ${P}$ is above ${B} $= ${b}$: price beats cost per unit, so profit is positive.`;
    w[3] = `Zero profit needs $P$ to equal ${B} exactly ($${b}$). Here $P = ${P}$.`;
    w[4] = z === 3 ? `$P$ equals ${B}: profit is zero, not positive.` : `Profit needs $P$ above ${B} $= ${b}$. Here $P = ${P}$ is below it.`;
    return w;
  }
  GYM.add({
    id: 'zones', title: 'Price zones: shut down, loss, profit', chip: 'Price zones',
    rule: md`Two comparisons decide everything in the short run. **$P$ vs min AVC: operate or shut down** (the fixed cost is paid either way). **$P$ vs min AC: profit or loss.** Between them: operate at a loss smaller than $F$. At min AVC exactly: indifferent.`,
    make() {
      const v = pick(['min', 'min', 'at', 'loss']);
      if (v === 'loss') {
        const Fx = pick([100, 200, 300, 500]), z = pick([0, 0, 1, 2, 2]);
        const L = z === 1 ? Fx : z === 0 ? Fx + pick([20, 50, 100]) : Fx - pick([20, 50, 80]);
        const opts = [ZO[0], ZO[1], ZO[2], 'Exit the industry right away'];
        const why = [
          z === 1 ? `Shutting down loses \\$${Fx}, and producing also loses \\$${L}: a tie, not a strict shutdown.` : `Shutting down loses the whole fixed cost, \\$${Fx}. Producing loses only \\$${L}.`,
          `A tie needs equal losses. Producing loses \\$${L}; shutting down loses \\$${Fx}.`,
          z === 1 ? `Producing loses \\$${L}, exactly the fixed cost: equal, not smaller. That is a tie.` : `Producing loses \\$${L}, **more** than the \\$${Fx} lost by shutting down: the price is below AVC.`,
          'Exit is a long-run move. This period the fixed cost is paid either way, so compare the operating loss with $F$.',
        ];
        const m = mc(opts[z], opts.map((o, j) => [o, why[j]]).filter((_, j) => j !== z));
        return item(md`At its best output ($P = MC$) the firm’s profit would be $-${L}$. Its fixed cost is \$${Fx}. This period the firm should…`, m,
          md`Shutting down still loses $F = ${Fx}$. Operate if the operating loss is **smaller** than $F$ (the same test as $P > AVC$). ${z === 0 ? `Here ${L} > ${Fx}: shut down.` : z === 1 ? `Here they are equal: indifferent.` : `Here ${L} < ${Fx}: operate.`}`);
      }
      const a = pick([8, 10, 12, 14, 15, 20]), g = pick([4, 5, 6, 8, 10]), b = a + g;
      const z = pick([0, 1, 2, 2, 3, 4]);
      const P = [a - pick([1, 2, 3, 4]), a, a + ri(1, g - 1), b, b + pick([2, 3, 5, 8])][z];
      const at = v === 'at';
      const A = at ? 'AVC at that output' : 'min AVC', B = at ? 'AC at that output' : 'min AC';
      const why = zoneWhys(z, P, a, b, A, B);
      const m = mc(ZO[z], ZO.map((o, j) => [o, why[j]]).filter((_, j) => j !== z));
      const q = at ? md`At the output where $P = MC$: price \$${P}, AVC \$${a}, AC \$${b}. In the short run the firm…`
        : pick([md`Min AVC is \$${a} and min AC is \$${b}. The price is \$${P}. In the short run the firm…`,
          md`A firm’s shutdown price is \$${a} and its break-even price is \$${b}. The market price is \$${P}. The firm…`]);
      return item(q, m, md`$P$ vs ${A} ($${a}$): ${P > a ? 'above, so operate' : P === a ? 'equal, so indifferent' : 'below, so shut down'}. ${P >= a ? `$P$ vs ${B} ($${b}$): ${P > b ? 'above, so profit' : P === b ? 'equal, so zero profit' : 'below, so a loss smaller than $F$'}.` : 'Shut down and lose exactly $F$.'}`);
    },
  });

  // ================================================================== 3. short run vs long run
  const SRLR = [
    () => ({ q: md`Firms in a competitive industry earn positive economic profit. Entry is free. In the long run…`,
      right: 'Firms enter, market supply shifts right, and the price falls to min LRAC',
      wrongs: [['Firms exit and the price rises', 'Exit follows losses, not profits.'],
        ['Nothing changes: profit stays positive', 'With free entry, positive profit is an invitation. Entry continues until profit is zero.'],
        ['Each firm expands until its profit is zero', 'A price taker cannot move the price. New firms shift market supply; that is what lowers the price.']],
      rule: md`Profit $\Rightarrow$ entry $\Rightarrow$ supply shifts right $\Rightarrow$ price falls, until $P = \min LRAC$ and profit is zero.` }),
    () => ({ q: md`Firms in a competitive industry are losing money but still covering AVC. In the long run…`,
      right: 'Some firms exit, supply shifts left, and the price rises to min LRAC',
      wrongs: [['Firms enter and the price falls', 'Entry follows profits, not losses.'],
        ['Every firm leaves the industry', 'Only enough leave to push the price back up to min LRAC; the rest earn zero profit.'],
        ['Nothing: firms keep going as long as $P > \\min AVC$', 'That is the short-run rule. In the long run every cost is avoidable, so the test is min LRAC.']],
      rule: md`Losses $\Rightarrow$ exit $\Rightarrow$ supply shifts left $\Rightarrow$ price rises, until $P = \min LRAC$.` }),
    () => {
      const up = Math.random() < 0.5, sr = Math.random() < 0.5;
      const q = md`Demand ${up ? 'rises' : 'falls'} in a constant-cost competitive industry (identical firms, free entry). In the **${sr ? 'short' : 'long'} run**…`;
      if (sr) return { q,
        right: up ? 'The price rises; each firm moves up its MC and earns a profit' : 'The price falls; each firm moves down its MC and loses money',
        wrongs: [[up ? 'The price stays at min LRAC because firms enter at once' : 'The price stays at min LRAC because firms exit at once', 'Entry and exit take time. In the short run the number of firms is fixed.'],
          [up ? 'The price rises but each firm’s output stays the same' : 'The price falls but each firm’s output stays the same', 'Each firm slides along its MC curve: a new price means a new output.'],
          [up ? 'The price falls' : 'The price rises', `Demand ${up ? 'up' : 'down'} against a fixed supply curve moves the price ${up ? 'up' : 'down'}.`]],
        rule: md`Short run: fixed number of firms, upward-sloping supply. Price ${up ? 'rises' : 'falls'}, each firm moves along its MC, profit ${up ? 'turns positive' : 'turns negative'}.` };
      return { q,
        right: up ? 'The price returns to min LRAC; more firms, each making the same $q^*$' : 'The price returns to min LRAC; fewer firms, each making the same $q^*$',
        wrongs: [[up ? 'The price stays higher; the same firms produce more' : 'The price stays lower; the same firms produce less', `That is the short run. ${up ? 'Profit attracts entry' : 'Losses drive exit'} until the price is back at min LRAC.`],
          ['The price returns to min LRAC with the same number of firms', `Market quantity ${up ? 'rises' : 'falls'} at the same price, and each firm still makes $q^*$, so $n = Q/q^*$ must ${up ? 'rise' : 'fall'}.`],
          [up ? 'The price ends below where it started' : 'The price ends above where it started', 'With constant input prices long-run supply is flat at min LRAC: the price ends where it started.']],
        rule: md`Long run, constant cost: supply is **flat at min LRAC**. The price comes back; the quantity change is all in the **number of firms** ($n = Q/q^*$).` };
    },
    () => ({ q: md`Identical firms, free entry and exit, constant input prices. The long-run market supply curve is…`,
      right: 'Horizontal at min LRAC',
      wrongs: [['Upward sloping: the sum of the firms’ MC curves', 'That is short-run supply, with a fixed number of firms.'],
        ['Vertical at today’s quantity', 'Free entry lets quantity adjust at the same price.'],
        ['Downward sloping', 'Not with constant input prices: each new firm has the same costs.']],
      rule: md`Any price above min LRAC brings entry, any price below brings exit, so in the long run the industry supplies any quantity at **$P = \min LRAC$**.` }),
    () => ({ q: md`Why does the shutdown test use **AVC** but the exit test use **LRAC**?`,
      right: 'In the short run the fixed cost is paid either way; in the long run every cost can be avoided',
      wrongs: [['AVC is always lower in the long run', 'AVC is a short-run curve. The point is which costs the decision can still avoid.'],
        ['Fixed costs grow over time', 'They do not have to grow. They become avoidable: leases end, equipment is sold.'],
        ['In the long run firms ignore variable costs', 'They count every cost in the long run; that is exactly why LRAC is the test.']],
      rule: md`Only avoidable costs enter a decision. Short run: $F$ is sunk, so compare $P$ with **AVC**. Long run: nothing is sunk, so compare $P$ with **LRAC**.` }),
  ];
  GYM.add({
    id: 'sr-vs-lr', title: 'Short run vs long run: shut down, exit, entry', chip: 'SR vs LR',
    rule: md`**Short run:** the fixed cost is sunk, the number of firms is fixed. Operate if $P \ge \min AVC$. **Long run:** every cost is avoidable and firms enter or exit. Stay if $P \ge \min LRAC$; profit brings entry, losses bring exit, until $P = \min LRAC$. Between min AVC and min LRAC: operate now, exit later.`,
    make() {
      if (Math.random() < 0.45) {
        const a = pick([6, 8, 10, 12]), b = a + pick([4, 5, 6, 8]), z = pick([0, 1, 1, 2]);
        const P = [a - pick([1, 2, 3]), a + ri(1, b - a - 1), b + pick([0, 2, 4])][z];
        const O = ['Shut down now and exit in the long run', 'Operate now (at a loss) and exit in the long run', 'Operate now and stay in the long run', 'Shut down now but stay in the industry'];
        const why = [
          `$P = ${P}$ is above min AVC $= ${a}$: this period, producing covers variable cost and part of $F$, so the firm operates.`,
          z === 0 ? `Below min AVC ($${a}$) even variable cost is not covered: shut down right away.` : `$P = ${P}$ covers min LRAC $= ${b}$: there is no reason to leave.`,
          `$P = ${P}$ is below min LRAC $= ${b}$. In the long run every cost is avoidable, and a firm that can never break even leaves.`,
          z === 0 ? 'Sitting idle still pays the fixed cost every period. If the price stays below min LRAC, leaving beats waiting.' : `It should not shut down: $P = ${P}$ is above min AVC $= ${a}$.`,
        ];
        const m = mc(O[z], O.map((o, j) => [o, why[j]]).filter((_, j) => j !== z));
        return item(md`Min AVC is \$${a} and min LRAC is \$${b}. The price is \$${P} and is expected to stay there. The firm should…`, m,
          md`Short run: $${P}$ vs min AVC $${a}$ (${P > a ? 'operate' : 'shut down'}). Long run: $${P}$ vs min LRAC $${b}$ (${P >= b ? 'stay' : 'exit'}).`);
      }
      const s = pick(SRLR)();
      return item(s.q, mc(s.right, s.wrongs), s.rule);
    },
  });

  // ================================================================== 4. which root?
  const sg = (v) => (v < 0 ? `- ${F(-v)}` : `+ ${F(v)}`);
  const ROOTS = [
    () => {
      const [r1, r2] = pick([[1, 5], [1, 6], [1, 7], [1, 8], [2, 8], [2, 9], [2, 10]]), P = pick([20, 30, 40, 50]);
      const s = r1 + r2;
      return {
        q: md`A competitive firm’s MC is U-shaped. Setting $${P} = 3q^2 - ${3 * s}q + ${3 * r1 * r2 + P}$ gives $q = ${r1}$ or $q = ${r2}$. Its output is…`,
        right: `$q = ${r2}$, the larger root`,
        wrongs: [[`$q = ${r1}$, the smaller root`, `At $q = ${r1}$ MC is still **falling**. Just past it MC is below the price, so more output adds profit: $q = ${r1}$ is the bottom of the profit hill.`],
          ['Either one: both satisfy $P = MC$', `Only one is a maximum. Between ${r1} and ${r2}, MC is below $P$, so profit rises the whole way.`],
          [`$q = ${F(s / 2)}$, halfway between`, 'The midpoint has no meaning: $P \\ne MC$ there.'],
          ['$q = 0$: shut down', 'Shutdown wins only if $P$ is below min AVC. This price is above it.']],
        rule: md`$P = MC$ on a U-shaped MC: take the root on the **rising** branch, the **larger** one. That is where the next unit starts costing more than $P$.`,
      };
    },
    () => {
      const r2 = pick([4, 5, 6, 8]), k = pick([1, 2, 4, 5]), P = pick([50, 60, 80]);
      return {
        q: md`Solving $${P} = 3q^2 ${sg(k - 3 * r2)}q + ${P - k * r2}$ for a price taker gives $q = ${r2}$ or $q = -\tfrac{${k}}{3}$. Its output is…`,
        right: `$q = ${r2}$`,
        wrongs: [[`$q = -\\tfrac{${k}}{3}$`, 'Output cannot be negative: discard that root.'],
          [`$q = ${F((r2 - k / 3) / 2)}$, the average`, 'Averaging roots means nothing. One root is not even an output.'],
          ['$q = 0$: shut down', 'Shutdown needs $P < \\min AVC$; a positive root on the rising branch is the answer here.']],
        rule: md`A negative quantity is not an output. Keep the **positive** root (it is also the one on the rising part of MC).`,
      };
    },
    () => {
      const c = pick([2, 4, 5, 6]), [Q1, Q2] = pick([[4, 20], [2, 12], [5, 15], [4, 16], [3, 12], [6, 10], [2, 18]]);
      const a = c + Q1 + Q2, Fx = Q1 * Q2;
      return {
        q: md`Natural monopoly: $P = ${a} - Q$, $C = ${Fx} + ${c}Q$. Average-cost pricing, $P(Q) = AC(Q)$, gives $Q^2 - ${a - c}Q + ${Fx} = 0$, so $Q = ${Q1}$ or $Q = ${Q2}$. The regulated quantity is…`,
        right: `$Q = ${Q2}$, the larger root`,
        wrongs: [[`$Q = ${Q1}$, the smaller root`, `Both roots give zero profit, but $Q = ${Q1}$ has a higher price (${a - Q1} vs ${a - Q2}) and less output: more deadweight loss.`],
          ['Either: both give zero profit, so it does not matter', `Profit is zero at both, but welfare is not: $Q = ${Q2}$ is much closer to the efficient $Q = ${a - c}$.`],
          [`$Q = ${a - c}$, where demand meets MC`, 'That is marginal-cost pricing, not average-cost pricing. The firm would lose its fixed cost.']],
        rule: md`Demand crosses a falling AC twice. Both are break-even points; the regulator takes the **larger $Q$** (lower price, smaller DWL).`,
      };
    },
    () => {
      const a = pick([1, 2, 3]), s = pick([2, 3, 4, 5, 6]), Fx = a * s * s;
      return {
        q: md`$LRC(q) = ${a === 1 ? '' : a}q^2 + ${Fx}$. Setting $LRMC = LRAC$ gives $q^2 = ${s * s}$. The output at the bottom of LRAC is…`,
        right: `$q = ${s}$`,
        wrongs: [[`$q = -${s}$`, 'A negative output is meaningless: keep the positive square root.'],
          [`$q = ${s * s}$`, `That is $q^2$, not $q$. Take the square root.`],
          [`$q = \\pm ${s}$`, 'Only the positive root is an output.']],
        rule: md`$q^2 = k$ has roots $\pm\sqrt{k}$; output is the **positive** one.`,
      };
    },
  ];
  GYM.add({
    id: 'which-root', title: 'Which root?', chip: 'Which root',
    rule: md`Quadratics on this exam always have a reason to pick one root. **$P = MC$ on a U-shaped MC: the larger root** (rising branch). **Negative roots: discard.** **Average-cost pricing $P(Q) = AC(Q)$: the larger $Q$** (lower price, less DWL). **$q^2 = k$: the positive root.**`,
    make() { const s = pick(ROOTS)(); return item(s.q, mc(s.right, s.wrongs), s.rule); },
  });

  // ================================================================== 5. which quantity is traded?
  function market() {
    for (;;) {
      const b = pick([2, 4, 5, 10]), c = pick([2, 4, 5, 10]), Ps = pick([10, 12, 15, 20, 30]);
      const A = (b + c) * Ps, d = pick([2, 3, 4, 5]);
      const Qd = (p) => A - b * p, Qs = (p) => c * p;
      if (Qd(Ps + d) > 0) return { b, c, Ps, A, d, Qd, Qs, Qe: c * Ps };
    }
  }
  const curves = (M) => md`$Q^D = ${M.A} - ${M.b}P$, $Q^S = ${M.c}P$ (equilibrium $P^* = ${M.Ps}$, $Q^* = ${M.Qe}$)`;
  const distinct = (xs) => new Set(xs.map((x) => F(x))).size === xs.length;
  GYM.add({
    id: 'traded-q', title: 'Which quantity is traded?', chip: 'Traded Q',
    rule: md`**The short side of the market wins.** Binding ceiling: sellers are short, traded $= Q^S(\bar P)$. Binding floor: buyers are short, traded $= Q^D(\underline P)$. Price support: producers sell $Q^S$, consumers buy $Q^D$, the government buys the gap. Tax: $Q^D(P_c) = Q^S(P_p)$. A policy that does not bind: $Q^*$.`,
    make() {
      for (let k = 0; k < 30; k++) {
        const M = market(), kind = pick(['ceil', 'ceil', 'floor', 'floor', 'sup', 'tax', 'ceilNB', 'floorNB']);
        if (kind === 'ceil' || kind === 'floor') {
          const ce = kind === 'ceil', p = ce ? M.Ps - M.d : M.Ps + M.d, qd = M.Qd(p), qs = M.Qs(p);
          if (!distinct([qd, qs, M.Qe, Math.abs(qd - qs)])) continue;
          const nm = ce ? 'ceiling' : 'floor';
          const right = ce ? `$${qs}$ ($Q^S$ at the ceiling)` : `$${qd}$ ($Q^D$ at the floor)`;
          const m = mc(right, [
            ce ? [`$${qd}$ ($Q^D$ at the ceiling)`, `Buyers want ${qd}, but at \\$${p} sellers bring only ${qs}. Nobody can buy what is not sold: the short side wins.`]
              : [`$${qs}$ ($Q^S$ at the floor)`, `Sellers would like to sell ${qs}, but at \\$${p} buyers take only ${qd}. The rest goes unsold.`],
            [`$${M.Qe}$ (the old equilibrium)`, `The ${nm} binds (\\$${p} is ${ce ? 'below' : 'above'} $P^* = ${M.Ps}$), so the market can no longer reach equilibrium.`],
            [`$${Math.abs(qd - qs)}$ (the gap)`, `That is the ${ce ? 'shortage' : 'excess supply'}, the units that do **not** change hands.`],
          ]);
          return item(md`${curves(M)}. A price ${nm} of \$${p}. How many units are bought and sold?`, m,
            md`${ce ? `Ceiling below $P^*$: buyers want ${qd}, sellers offer ${qs}. Sellers are the short side: **${qs}** trade.` : `Floor above $P^*$: sellers offer ${qs}, buyers want ${qd}. Buyers are the short side: **${qd}** trade.`}`);
        }
        if (kind === 'sup') {
          const p = M.Ps + M.d, qd = M.Qd(p), qs = M.Qs(p), g = qs - qd, ask = pick(['prod', 'cons', 'gov']);
          if (!distinct([qd, qs, g, M.Qe])) continue;
          const O = { prod: [`$${qs}$`, 'producers sell'], cons: [`$${qd}$`, 'consumers buy'], gov: [`$${g}$`, 'the government buys'] };
          const wr = {
            prod: `Producers sell everything they want at the support price, $Q^S(${p}) = ${qs}$; the government takes what consumers do not.`,
            cons: `Consumers still pay \\$${p}, so they buy only $Q^D(${p}) = ${qd}$.`,
            gov: `The government buys the gap, $Q^S - Q^D = ${qs} - ${qd} = ${g}$.`,
          };
          const m = mc(O[ask][0], [...Object.keys(O).filter((x) => x !== ask).map((x) => [O[x][0], `${O[x][0]} is what ${O[x][1]}. ${wr[ask]}`]),
            [`$${M.Qe}$`, `That is the old equilibrium. At the support price \\$${p} the market is no longer there.`]]);
          return item(md`${curves(M)}. The government supports the price at \$${p} and buys any excess supply. How many units do **${O[ask][1]}**?`, m,
            md`Price support at \$${p}: producers sell $Q^S = ${qs}$, consumers buy $Q^D = ${qd}$, the government buys the gap, ${g}.`);
        }
        if (kind === 'tax') {
          const t = pick([2, 3, 4, 5, 6, 8, 10]), Pc = M.Ps + t * M.c / (M.b + M.c), Pp = Pc - t;
          if (Math.abs(Pc * 2 - Math.round(Pc * 2)) > 1e-9 || Pp <= 0) continue;
          const Qt = M.Qs(Pp), w1 = M.Qd(Pp), w2 = M.Qs(Pc);
          if (!distinct([Qt, w1, w2, M.Qe])) continue;
          const m = mc(`$${F(Qt)}$ ($Q^D$ at $P_c$, $= Q^S$ at $P_p$)`, [
            [`$${F(w1)}$ ($Q^D$ at $P_p$)`, `Buyers pay the price **with** the tax, $P_c = ${F(Pc)}$, not $P_p$.`],
            [`$${F(w2)}$ ($Q^S$ at $P_c$)`, `Sellers keep only $P_p = ${F(Pp)}$ after sending in the tax, so they supply $Q^S(P_p)$.`],
            [`$${M.Qe}$ (the no-tax quantity)`, 'The tax wedge raises what buyers pay and lowers what sellers keep: both sides trade less.'],
          ]);
          return item(md`${curves(M)}. A \$${t} per-unit tax gives $P_c = ${F(Pc)}$ and $P_p = ${F(Pp)}$. How many units are traded?`, m,
            md`With a tax, each side reacts to **its own** price: $Q^D(P_c) = ${M.A} - ${M.b}(${F(Pc)}) = ${F(Qt)}$, and $Q^S(P_p) = ${M.c}(${F(Pp)}) = ${F(Qt)}$. They match.`);
        }
        const ce = kind === 'ceilNB', p = ce ? M.Ps + M.d : M.Ps - M.d, qd = M.Qd(p), qs = M.Qs(p);
        if (!distinct([qd, qs, M.Qe])) continue;
        const nm = ce ? 'ceiling' : 'floor';
        const m = mc(`$${M.Qe}$: nothing changes`, [
          [`$${qs}$ ($Q^S$ at the ${nm})`, `The ${nm} at \\$${p} is ${ce ? 'above' : 'below'} $P^* = ${M.Ps}$, so the market price is still legal: the ${nm} does not bind.`],
          [`$${qd}$ ($Q^D$ at the ${nm})`, `A ${nm} ${ce ? 'above' : 'below'} the market price changes nothing; the market stays at $P^*$.`],
          ['$0$: the market shuts down', `Nothing stops trade at $P^* = ${M.Ps}$; it is a legal price.`],
        ]);
        return item(md`${curves(M)}. A price ${nm} of \$${p}. How many units are bought and sold?`, m,
          md`A ${nm} ${ce ? 'above' : 'below'} $P^*$ does not bind: the market stays at $Q^* = ${M.Qe}$.`);
      }
      throw new Error('traded-q: no clean draw');
    },
  });

  // ================================================================== 6. does it bind?
  GYM.add({
    id: 'binding', title: 'Does it bind?', chip: 'Binds?',
    rule: md`**A ceiling binds only below $P^*$** (a cap above the market price caps nothing) and makes a shortage. **A floor binds only above $P^*$** and makes excess supply. At $P^*$ exactly, nothing changes. A binding ceiling or floor never clears the market.`,
    make() {
      const P = pick([8, 10, 12, 15, 20, 25, 30, 40]), ce = Math.random() < 0.5, below = Math.random() < 0.5;
      const d = pick([1, 2, 3, 5]), x = below ? P - d : Math.random() < 0.15 ? P : P + d;
      const ctx = ce
        ? pick([[`A price ceiling of \\$${x}`, 'price'], [`Rent control caps rent at \\$${x}`, 'rent'], [`A cap on gas prices at \\$${x}`, 'price']])
        : pick([[`A price floor of \\$${x}`, 'price'], [`A minimum wage of \\$${x}`, 'wage'], [`A minimum price for milk of \\$${x}`, 'price']]);
      const O = ['Binds: a shortage ($Q^D > Q^S$)', 'Binds: excess supply ($Q^S > Q^D$)', `Does not bind: the market stays at $P^* = ${P}$`, 'Binds, and the market clears at the policy price'];
      const binds = ce ? x < P : x > P, a = binds ? (ce ? 0 : 1) : 2;
      const why = [
        !ce ? 'A floor never makes a shortage: if it binds, it raises the price, so buyers want less and sellers offer more.' : `A ceiling only bites when it is below $P^*$. At ${x} $\\ge$ ${P}, the market price is legal.`,
        ce ? 'A ceiling never makes excess supply: if it binds, it holds the price down, so buyers want more and sellers offer less.' : `A floor only bites when it is above $P^*$. At ${x} $\\le$ ${P}, the market price is legal.`,
        `The ${ce ? 'ceiling' : 'floor'} (${x}) is ${ce ? 'below' : 'above'} $P^* = ${P}$: the equilibrium price is now illegal, so it binds.`,
        binds ? `At the legal ${ctx[1]} $Q^D \\ne Q^S$: a binding ${ce ? 'ceiling' : 'floor'} leaves the market uncleared. That gap is the whole point.` : `The market stays at $P^* = ${P}$; it does not move to the policy level.`,
      ];
      const m = mc(O[a], O.map((o, j) => [o, why[j]]).filter((_, j) => j !== a));
      const lab = ctx[1] === 'wage' ? 'the market wage' : ctx[1] === 'rent' ? 'the market rent' : 'the equilibrium price';
      return item(md`${ctx[0]}; ${lab} is \$${P}. This policy…`, m,
        md`${ce ? 'Ceiling' : 'Floor'} at ${x} vs $P^* = ${P}$: ${binds ? (ce ? 'below, so it binds: shortage' : `above, so it binds: excess supply${ctx[1] === 'wage' ? ' of labor (unemployment)' : ''}`) : `${x === P ? 'equal' : ce ? 'above' : 'below'}, so it does not bind`}.`);
    },
  });

  // ================================================================== 7. tax incidence
  const WHO = ['Consumers bear more', 'Producers bear more', 'They split it evenly', 'Whoever the tax is collected from bears more'];
  function whoItem(q, cs, how, rule, plain) {
    const a = cs > 0.5 ? 0 : cs < 0.5 ? 1 : 2;
    const why = [
      plain ? `Not here: ${how}` : `Consumers’ share is ${pctT(cs)}: ${how}`,
      plain ? `Not here: ${how}` : `Producers’ share is ${pctT(1 - cs)}: ${how}`,
      plain ? `An even split needs both sides to respond equally, and here ${cs > 0.5 ? 'demand' : 'supply'} is less elastic.` : `An even split needs both sides to respond equally. Here consumers bear ${pctT(cs)}.`,
      'Legal liability does not matter: the burden follows how strongly each side responds to price, not who mails the check.',
    ];
    return item(q, mc(WHO[a], WHO.map((o, j) => [o, why[j]]).filter((_, j) => j !== a)), rule);
  }
  GYM.add({
    id: 'incidence', title: 'Who bears the tax?', chip: 'Incidence',
    rule: md`**The less responsive side bears more.** With $Q^D = A - bP$, $Q^S = cP$: consumer share $= \dfrac{c}{b + c}$. With elasticities: consumer share $= \dfrac{\varepsilon_S}{\varepsilon_S + |\varepsilon_D|}$. From prices: consumer share $= \dfrac{P_c - P^*}{t}$, producer share $= \dfrac{P^* - P_p}{t}$. Who legally pays changes nothing.`,
    make() {
      const v = pick(['slope', 'slope', 'elast', 'price', 'legal', 'extreme']);
      if (v === 'slope') {
        const b = pick([1, 2, 3, 4, 5, 10]), c = Math.random() < 0.15 ? b : pick([1, 2, 3, 4, 5, 10]), cs = c / (b + c);
        return whoItem(md`$Q^D = ${(b + c) * 20} - ${b === 1 ? '' : b}P$ and $Q^S = ${c === 1 ? '' : c}P$. A per-unit tax is imposed. Who bears more of it?`, cs,
          `consumer share $= \\dfrac{c}{b + c} = \\dfrac{${c}}{${b} + ${c}}$.`,
          md`Demand moves ${b} unit${b === 1 ? '' : 's'} per dollar, supply ${c}. ${b === c ? 'Equal responses: an even split.' : `The **less** responsive side is ${b < c ? 'demand, so consumers' : 'supply, so producers'} bear more.`} Consumer share $= ${c}/(${b} + ${c}) = ${pct(cs)}$.`);
      }
      if (v === 'elast') {
        const [ed, es] = pick([[0.5, 2], [2, 0.5], [1, 3], [3, 1], [1, 1], [0.5, 1.5], [1.5, 0.5], [2, 2], [4, 1], [1, 4]]), cs = es / (es + ed);
        return whoItem(md`At the equilibrium, demand elasticity is $${-ed}$ and supply elasticity is $${es}$. Who bears more of a per-unit tax?`, cs,
          `consumer share $= \\dfrac{\\varepsilon_S}{\\varepsilon_S + |\\varepsilon_D|} = \\dfrac{${es}}{${es} + ${ed}}$.`,
          md`$|\varepsilon_D| = ${ed}$, $\varepsilon_S = ${es}$. ${ed === es ? 'Equal: even split.' : `The **less elastic** side is ${ed < es ? 'demand, so consumers' : 'supply, so producers'} bear more.`} Consumer share $= ${es}/(${es} + ${ed}) = ${pct(cs)}$.`);
      }
      if (v === 'price') {
        const [t, up] = pick([[4, 3], [4, 1], [5, 2], [5, 4], [10, 3], [10, 6], [6, 2], [6, 5], [2, 1.5]]), P0 = pick([10, 20, 30, 40]), cs = up / t;
        const ask = pick(['cons', 'prod']), sh = ask === 'cons' ? cs : 1 - cs;
        const m = mc(pctT(sh), [[pctT(1 - sh),`That is the ${ask === 'cons' ? 'producers’' : 'consumers’'} share. ${ask === 'cons' ? 'Consumers’' : 'Producers’'} share is ${ask === 'cons' ? `$(P_c - P^*)/t = ${up}/${t}$` : `$(P^* - P_p)/t = ${F(t - up)}/${t}$`}.`],
          ['$50\\%$', 'Even split only if the price moves the same amount on both sides. It does not here.'],
          ['$100\\%$', `$P_c - P_p = t$ always: that is the whole wedge, not one side’s share.`]].filter((w) => w[0] !== pctT(sh)));
        return item(md`Before a \$${t} tax the price was \$${P0}. Now buyers pay \$${F(P0 + up)} and sellers keep \$${F(P0 + up - t)}. What share of the tax do **${ask === 'cons' ? 'consumers' : 'producers'}** bear?`, m,
          md`Measure each side’s price change from the **old** price: consumers $${F(P0 + up)} - ${P0} = ${up}$, producers $${P0} - ${F(P0 + up - t)} = ${F(t - up)}$. Divide by $t = ${t}$.`);
      }
      if (v === 'legal') {
        const from = pick(['sellers', 'buyers']), dLess = Math.random() < 0.5;
        return whoItem(md`A per-unit tax is collected from **${from}**. Demand is ${dLess ? 'less' : 'more'} elastic than supply. Who bears more of the tax?`, dLess ? 0.7 : 0.3,
          `the **less** elastic side bears more, whoever writes the check. Here that is ${dLess ? 'demand (consumers)' : 'supply (producers)'}.`,
          md`Who **legally** pays only decides which curve you shift (supply up by $t$, or demand down by $t$). Both give the same $P_c$, $P_p$, $Q$. The **less elastic** side, ${dLess ? 'demand' : 'supply'}, bears more.`, true);
      }
      const ex = pick([['Demand is perfectly inelastic (vertical).', 0], ['Supply is perfectly elastic (horizontal).', 0], ['Demand is perfectly elastic (horizontal).', 1], ['Supply is perfectly inelastic (vertical).', 1]]);
      const O = ['Consumers bear all of it', 'Producers bear all of it', 'They split it evenly', 'Whoever the tax is collected from'];
      const why = [
        'Consumers can only be stuck with the whole tax if they cannot escape it (vertical demand) or sellers will not take less (horizontal supply).',
        'Producers bear it all only if buyers will not pay a cent more (horizontal demand) or sellers cannot cut back (vertical supply).',
        'An even split needs equal responsiveness; here one side does not respond at all, or responds without limit.',
        'Legal liability never decides the burden.',
      ];
      return item(md`${ex[0]} A per-unit tax is imposed. Who bears it?`, mc(O[ex[1]], O.map((o, j) => [o, why[j]]).filter((_, j) => j !== ex[1])),
        md`The side that **cannot respond** (vertical curve) bears it all; the side with **infinite** response (horizontal curve) bears none. ${ex[1] === 0 ? 'Here that is consumers.' : 'Here that is producers.'}`);
    },
  });

  // ================================================================== 8. name the area
  const cen = (p) => [p.reduce((s, x) => s + x[0], 0) / p.length, p.reduce((s, x) => s + x[1], 0) / p.length];
  const DEM = { f: (q) => 12 - q, from: 0, to: 12, lab: '\\text{Demand}', labX: 10.6, dx: -6, dy: 0, anchor: 'r' };
  function areaCase(kind) {
    const a = 12, s = pick([0.8, 1, 1.25]), Q0 = a / (1 + s), P0 = s * Q0, f = pick([0.55, 0.62]);
    const D = (q) => a - q, S = (q) => s * q;
    // curves are labeled in words so the letter D is free for an area
    const base = [DEM, { f: S, from: 0, to: a / s > 12.4 ? 12.4 : a / s, cls: 'c2', lab: '\\text{Supply}', labX: Math.min(12, 11 / s), dx: -8, dy: 0, anchor: 'r' }];
    const g = (pts) => ({ seg: pts, cls: 'guide' });
    if (kind === 'mono') {
      const c = pick([2, 3, 4]), Qm = (a - c) / 2, Pm = (a + c) / 2, Qc = a - c;
      return {
        regs: { A: [[0, a], [0, Pm], [Qm, Pm]], B: [[0, Pm], [Qm, Pm], [Qm, c], [0, c]], C: [[Qm, Pm], [Qm, c], [Qc, c]], D: [[0, c], [Qm, c], [Qm, 0], [0, 0]] },
        items: [DEM, { seg: [[0, a], [a / 2, 0]], cls: 'curve c4 dash', lab: 'MR', at: 0.8, dx: 6, dy: 0, anchor: 'l' },
          { seg: [[0, c], [12.4, c]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: -5, anchor: 'br' }, g([[0, Pm], [Qm, Pm]]), g([[Qm, Pm], [Qm, 0]]), g([[Qc, c], [Qc, 0]])],
        xt: [[Qm, 'Q_m'], [Qc, 'Q_c']], yt: [[Pm, 'P_m'], [c, 'c']],
        qs: [['the deadweight loss of the monopoly', 'C', 'the deadweight loss: units between $Q_m$ and $Q_c$ worth more than MC that are not made'],
          ['consumer surplus under monopoly', 'A', 'consumer surplus under monopoly: under demand, above $P_m$'],
          ['producer surplus under monopoly', 'B', 'producer surplus: $(P_m - MC) \\times Q_m$'],
          ['consumer surplus if the market were competitive ($P = MC$)', 'A + B + C', 'consumer surplus at the competitive point: under demand, above MC, out to $Q_c$'],
          ['total revenue under monopoly', 'B + D', 'total revenue, $P_m \\times Q_m$'],
          ['the monopolist’s variable cost', 'D', 'variable cost, $MC \\times Q_m$ (the area under MC)']],
        rule: md`Monopoly: go up from $Q_m$ to **demand** for $P_m$. CS is the triangle above $P_m$ (A). PS is the rectangle between $P_m$ and MC (B). DWL is the triangle between demand and MC from $Q_m$ to $Q_c$ (C).`,
      };
    }
    const Q1 = f * Q0, Ph = D(Q1), Pl = S(Q1);
    const common = [...base, g([[Q1, Ph], [Q1, 0]]), g([[Q0, P0], [Q0, 0]])];
    if (kind === 'tax') return {
      regs: { A: [[0, a], [0, Ph], [Q1, Ph]], B: [[0, Ph], [Q1, Ph], [Q1, P0], [0, P0]], C: [[0, P0], [Q1, P0], [Q1, Pl], [0, Pl]], D: [[Q1, Ph], [Q1, P0], [Q0, P0]], E: [[Q1, P0], [Q1, Pl], [Q0, P0]], F: [[0, 0], [0, Pl], [Q1, Pl]] },
      items: [...common, g([[0, Ph], [Q1, Ph]]), g([[0, P0], [Q0, P0]]), g([[0, Pl], [Q1, Pl]])],
      xt: [[Q1, 'Q_t'], [Q0, 'Q^*']], yt: [[Ph, 'P_c'], [P0, 'P^*'], [Pl, 'P_p']],
      qs: [['the deadweight loss', 'D + E', 'the deadweight loss: trades between $Q_t$ and $Q^*$ that no longer happen'],
        ['the tax revenue', 'B + C', 'the tax revenue, $t \\times Q_t$: moved to the government, not lost'],
        ['consumer surplus after the tax', 'A', 'consumer surplus after the tax: under demand, above $P_c$'],
        ['producer surplus after the tax', 'F', 'producer surplus after the tax: above supply, below $P_p$'],
        ['consumer surplus before the tax', 'A + B + D', 'consumer surplus before the tax: under demand, above $P^*$'],
        ['producer surplus before the tax', 'C + E + F', 'producer surplus before the tax: above supply, below $P^*$'],
        ['the loss in consumer surplus', 'B + D', 'the loss in consumer surplus: part to the government (B), part destroyed (D)'],
        ['the loss in producer surplus', 'C + E', 'the loss in producer surplus: part to the government (C), part destroyed (E)']],
      rule: md`Tax: revenue is the rectangle between $P_c$ and $P_p$ over $Q_t$ (B + C). DWL is the triangle from $Q_t$ to $Q^*$ (D + E). CS sits above $P_c$ (A), PS below $P_p$ (F).`,
    };
    if (kind === 'ceil') return {
      regs: { A: [[0, a], [0, P0], [Q1, P0], [Q1, Ph]], B: [[0, P0], [Q1, P0], [Q1, Pl], [0, Pl]], C: [[Q1, Ph], [Q1, P0], [Q0, P0]], D: [[Q1, P0], [Q1, Pl], [Q0, P0]], E: [[0, 0], [0, Pl], [Q1, Pl]] },
      items: [...common, { seg: [[0, Pl], [12.4, Pl]], cls: 'curve c5', lab: '\\text{ceiling}', at: 'end', dx: -2, dy: -5, anchor: 'br' }, g([[0, P0], [Q0, P0]])],
      xt: [[Q1, 'Q_s'], [Q0, 'Q^*']], yt: [[P0, 'P^*'], [Pl, '\\bar P']],
      qs: [['the deadweight loss', 'C + D', 'the deadweight loss: units between $Q_s$ and $Q^*$ no longer traded'],
        ['consumer surplus under the ceiling', 'A + B', 'consumer surplus under the ceiling (efficient rationing): under demand, above $\\bar P$, over the units sold'],
        ['consumer surplus before the ceiling', 'A + C', 'consumer surplus before the ceiling: under demand, above $P^*$'],
        ['producer surplus under the ceiling', 'E', 'producer surplus under the ceiling: above supply, below $\\bar P$'],
        ['producer surplus before the ceiling', 'B + D + E', 'producer surplus before the ceiling: above supply, below $P^*$'],
        ['the transfer from producers to consumers', 'B', 'the transfer: the units still sold go for $\\bar P$ instead of $P^*$']],
      rule: md`Binding ceiling: only $Q_s$ units trade. B moves from producers to consumers (same units, lower price). C + D is the DWL from the lost units. CS after = A + B, PS after = E.`,
    };
    return {
      regs: { A: [[0, a], [0, Ph], [Q1, Ph]], B: [[0, Ph], [Q1, Ph], [Q1, P0], [0, P0]], C: [[Q1, Ph], [Q1, P0], [Q0, P0]], D: [[Q1, P0], [Q1, Pl], [Q0, P0]], E: [[0, 0], [0, P0], [Q1, P0], [Q1, Pl]] },
      items: [...common, { seg: [[0, Ph], [12.4, Ph]], cls: 'curve c5', lab: '\\text{floor}', at: 'end', dx: -2, dy: -5, anchor: 'br' }, g([[0, P0], [Q0, P0]])],
      xt: [[Q1, 'Q_d'], [Q0, 'Q^*']], yt: [[Ph, '\\underline{P}'], [P0, 'P^*']],
      qs: [['the deadweight loss', 'C + D', 'the deadweight loss: units between $Q_d$ and $Q^*$ no longer traded'],
        ['consumer surplus under the floor', 'A', 'consumer surplus under the floor: under demand, above $\\underline{P}$'],
        ['consumer surplus before the floor', 'A + B + C', 'consumer surplus before the floor: under demand, above $P^*$'],
        ['producer surplus under the floor', 'B + E', 'producer surplus under the floor (the cheapest sellers make the $Q_d$ units): above supply, below $\\underline{P}$'],
        ['producer surplus before the floor', 'D + E', 'producer surplus before the floor: above supply, below $P^*$'],
        ['the transfer from consumers to producers', 'B', 'the transfer: the units still bought now cost $\\underline{P}$ instead of $P^*$']],
      rule: md`Binding floor: only $Q_d$ units trade. B moves from consumers to producers. C + D is the DWL. CS after = A, PS after = B + E.`,
    };
  }
  GYM.add({
    id: 'areas', title: 'Name the area', chip: 'Areas',
    rule: md`Find the **quantity actually traded** first, then read up. CS: under demand, above the price buyers pay. PS: above supply (or MC), below the price sellers keep. Tax revenue: the rectangle between $P_c$ and $P_p$. DWL: the triangle between demand and supply (or MC) **from the traded quantity out to the efficient one**. A rectangle that changes owners is a transfer, not a loss.`,
    make() {
      const kind = pick(['tax', 'ceil', 'floor', 'mono']), K = areaCase(kind);
      const items = K.items.concat(Object.entries(K.regs).map(([k, p]) => ({ text: cen(p), t: `\\textbf{${k}}` })));
      const fig = EC.graph({ w: 320, h: 236, x: [0, 12.6], y: [0, 12.6], xl: 'Q', yl: 'P', xt: K.xt, yt: K.yt, items });
      const [name, right] = pick(K.qs);
      const wr = some(K.qs.filter((x) => x[1] !== right), 3).map((x) => [x[1], `${x[1]} is ${x[2]}.`]);
      const lead = { tax: 'A per-unit tax', ceil: 'A binding price ceiling', floor: 'A binding price floor', mono: 'A monopolist with constant MC' }[kind];
      return item(md`${lead}. Which area is **${name}**?`, mc(right, wr), K.rule, fig);
    },
  });

  // ================================================================== 9. which way does it move?
  const DIR = [
    () => { const up = Math.random() < 0.5; return { q: md`Short run, capital fixed. The **output price** ${up ? 'rises' : 'falls'}. The firm’s labor and output…`,
      right: up ? 'Both rise' : 'Both fall',
      wrongs: [[up ? 'Both fall' : 'Both rise', `A ${up ? 'higher' : 'lower'} price makes each worker’s output worth ${up ? 'more' : 'less'}: $p\\cdot MP_1$ ${up ? 'rises' : 'falls'}, so the firm hires ${up ? 'more' : 'fewer'}.`],
        ['Do not change: the wage did not move', 'The hiring rule is $p\\cdot MP_1 = w_1$, and $p$ is in it.'],
        [up ? 'Labor falls, output rises' : 'Labor rises, output falls', 'With capital fixed, output changes only through labor: the two move together.']],
      rule: md`$p\cdot MP_1 = w_1$: price ${up ? 'up' : 'down'} means the last worker is worth ${up ? 'more' : 'less'}, so labor and output ${up ? 'rise' : 'fall'} until $MP_1 = w_1/p$ again.` }; },
    () => { const up = Math.random() < 0.5; return { q: md`Short run, capital fixed. The **wage** $w_1$ ${up ? 'rises' : 'falls'}. The firm’s labor and output…`,
      right: up ? 'Both fall' : 'Both rise',
      wrongs: [[up ? 'Both rise' : 'Both fall', `A ${up ? 'dearer' : 'cheaper'} worker must produce ${up ? 'more' : 'less'} to be worth hiring ($MP_1 = w_1/p$ ${up ? 'rises' : 'falls'}), so the firm hires ${up ? 'fewer' : 'more'}.`],
        ['Do not change: the output price did not move', 'The hiring rule is $p\\cdot MP_1 = w_1$, and $w_1$ is in it.'],
        [up ? 'Labor falls, output rises' : 'Labor rises, output falls', 'With capital fixed, output changes only through labor: the two move together.']],
      rule: md`$MP_1 = w_1/p$: wage ${up ? 'up' : 'down'} means the last worker must produce ${up ? 'more' : 'less'}; with diminishing $MP_1$ that takes ${up ? 'fewer' : 'more'} workers and ${up ? 'less' : 'more'} output.` }; },
    () => ({ q: md`Short run. The rental price $w_2$ of the **fixed** input $\bar x_2$ rises. Labor and output…`,
      right: 'Do not change; only profit falls',
      wrongs: [['Both fall', '$w_2$ does not appear in $p\\cdot MP_1 = w_1$. A fixed cost cannot change the marginal decision.'],
        ['Labor rises to replace capital', 'In the short run $x_2$ is fixed; there is no substitution.'],
        ['Output falls but labor stays the same', 'Output depends only on labor and the fixed $\\bar x_2$, neither of which changed.']],
      rule: md`The fixed input’s price is a **fixed cost**: it moves the isoprofit **intercept** $(\pi + w_2\bar x_2)/p$, not the slope $w_1/p$. Same tangency, lower profit.` }),
    () => { const up = Math.random() < 0.5; return { q: md`The isoprofit lines are $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$. The output price $p$ ${up ? 'rises' : 'falls'}. The lines get…`,
      right: up ? 'Flatter: the slope $w_1/p$ falls' : 'Steeper: the slope $w_1/p$ rises',
      wrongs: [[up ? 'Steeper: the slope $w_1/p$ rises' : 'Flatter: the slope $w_1/p$ falls', `$p$ is in the denominator: $p$ ${up ? 'up' : 'down'} makes $w_1/p$ ${up ? 'smaller' : 'bigger'}.`],
        ['Shifted up, same slope', 'Only $w_2$ or $\\pi$ alone shift the intercept with the slope fixed. $p$ divides the slope too.'],
        ['Unchanged', 'Both the slope and the intercept have $p$ in them.']],
      rule: md`Isoprofit slope $= w_1/p$. Price ${up ? 'up' : 'down'}: ${up ? 'flatter' : 'steeper'}, so the tangency with $f(x_1)$ moves ${up ? 'right (more labor)' : 'left (less labor)'}.` }; },
    () => ({ q: md`A competitive firm’s **fixed cost** rises (short run). At the same price, its output…`,
      right: 'Stays the same; profit falls by the increase',
      wrongs: [['Falls', '$MC = dC/dq$, and the derivative of a constant is zero. MC, and so $P = MC$, is unchanged.'],
        ['Rises, to spread the fixed cost over more units', 'Spreading $F$ lowers AC, but profit is maximized at $P = MC$, which has no $F$ in it.'],
        ['Drops to zero: the firm shuts down', 'Shutdown compares $P$ with min AVC, which has no $F$ in it.']],
      rule: md`$F$ is in TC and AC, never in MC or AVC. It changes **profit** and the **break-even** price, not output and not the shutdown price.` }),
    () => ({ q: md`A firm’s **fixed cost** rises. Its break-even price (min AC) and its shutdown price (min AVC)…`,
      right: 'Break-even rises; shutdown stays the same',
      wrongs: [['Both rise', 'AVC has no fixed cost in it, so its minimum does not move.'],
        ['Both stay the same', 'AC $= AVC + F/q$ includes the fixed cost, so its minimum rises.'],
        ['Shutdown rises; break-even stays the same', 'Backwards: $F$ sits in AC, not in AVC.']],
      rule: md`$AC = AVC + F/q$: $F$ lifts AC (break-even) and leaves AVC (shutdown) alone.` }),
    () => { const t = pick([1, 2, 3, 5]); return { q: md`A per-unit tax rises from \$${t} to \$${2 * t} (straight-line demand and supply). The deadweight loss…`,
      right: 'Is multiplied by 4',
      wrongs: [['Doubles', 'DWL $= \\tfrac12 \\times t \\times$ (lost quantity), and the lost quantity also doubles: base and height both double.'],
        ['Stays the same', 'A bigger wedge blocks more trades, and each blocked trade was worth more.'],
        ['Is multiplied by 8', 'A triangle has two dimensions, not three: $2 \\times 2 = 4$.']],
      rule: md`DWL $= \tfrac12 t\,\Delta Q$ and $\Delta Q$ is proportional to $t$, so **DWL grows with $t^2$**. Lecture 17: $t = 2$ gives 5, $t = 4$ gives 20.` }; },
    () => { const what = pick(['share', 'dwl']); return { q: md`Demand becomes **more elastic** (flatter); supply and the per-unit tax stay the same. ${what === 'share' ? 'The consumers’ share of the tax…' : 'The deadweight loss…'}`,
      right: what === 'share' ? 'Falls' : 'Rises',
      wrongs: what === 'share'
        ? [['Rises', 'More elastic buyers escape the tax more easily: producers end up absorbing more.'], ['Stays the same', 'The split depends on the relative elasticities, and one just changed.'], ['Goes to 100%', 'That is the perfectly **inelastic** demand case.']]
        : [['Falls', 'More elastic buyers cut back more, so more trades are lost.'], ['Stays the same', 'DWL depends on how much the quantity responds, and that just grew.'], ['Goes to zero', 'DWL vanishes only if quantity does not respond at all (a perfectly inelastic curve).']],
      rule: md`More elastic demand: consumers dodge the tax more easily, so their **share falls**; quantity responds more, so **DWL rises**.` }; },
    () => ({ q: md`The demand a monopolist faces becomes **more elastic**. Its Lerner index $(P - MC)/P$…`,
      right: 'Falls',
      wrongs: [['Rises', '$L = -1/\\varepsilon$: a bigger $|\\varepsilon|$ means a smaller $L$.'], ['Stays the same', 'The markup depends on the elasticity, and it just changed.'], ['Becomes negative', 'A monopolist never prices below MC; $L$ stays between 0 and 1.']],
      rule: md`$L = \dfrac{P - MC}{P} = -\dfrac{1}{\varepsilon}$. Buyers with good substitutes (elastic) leave little room for a markup.` }),
    () => { const d = pick([2, 4, 6, 10]); return { q: md`A monopolist with straight-line demand and constant MC sees its MC rise by \$${d}. Its price rises by…`,
      right: `\\$${d / 2}`,
      wrongs: [[`\\$${d}`, 'That would be full pass-through. MR is twice as steep as demand, so output falls by half as much as a competitive market and the price moves by half.'],
        ['$0$', 'A higher MC moves the $MR = MC$ point, so output and price change.'],
        [`\\$${2 * d}`, 'The price rises by less than the cost increase with linear demand, not more.']],
      rule: md`Linear demand $P = a - bQ$, constant $MC = c$: $P_m = \dfrac{a + c}{2}$. Each \$1 on MC adds **\$0.50** to the price.` }; },
    () => ({ q: md`A monopolist’s **fixed cost** rises. Its price and output…`,
      right: 'Do not change; profit falls',
      wrongs: [['Price rises to cover the cost', 'Price comes from $MR = MC$ and demand; neither has $F$ in it. Raising the price would lower profit further.'],
        ['Output falls', 'MC has no fixed cost in it, so the $MR = MC$ point is unchanged.'],
        ['Output rises to spread the fixed cost', 'Spreading $F$ does not change MR or MC.']],
      rule: md`$F$ never enters MR or MC. It decides only whether the monopolist stays (profit $\ge 0$ in the long run), not what it charges.` }),
    () => { const ce = Math.random() < 0.5; return { q: md`A binding price ${ce ? 'ceiling is lowered further' : 'floor is raised further'}. What happens?`,
      right: `The quantity traded falls; the ${ce ? 'shortage' : 'excess supply'} and the DWL grow`,
      wrongs: [[ce ? 'More is traded, since buyers want more' : 'More is traded, since sellers offer more', `Traded = the short side: ${ce ? '$Q^S$ at the ceiling, which falls' : '$Q^D$ at the floor, which falls'}.`],
        ['Nothing changes: it was already binding', 'A binding policy moves the traded quantity every time it moves.'],
        [`The ${ce ? 'shortage' : 'excess supply'} shrinks`, `Moving the price further from $P^*$ widens the gap between $Q^D$ and $Q^S$.`]],
      rule: md`The further a binding ${ce ? 'ceiling' : 'floor'} is from $P^*$, the smaller the short side (${ce ? '$Q^S$' : '$Q^D$'}), the bigger the gap, the bigger the DWL.` }; },
    () => ({ q: md`The government **raises** its support price (it buys all excess supply). Government purchases and spending…`,
      right: 'Both rise',
      wrongs: [['Purchases fall, because consumers buy more', 'A higher price makes consumers buy **less** and producers sell more: the gap the government fills grows.'],
        ['Spending rises but purchases stay the same', 'Purchases are $Q^S - Q^D$, and both move away from each other.'],
        ['Nothing changes for the government', 'Its purchases and its price both rise, so $G = P \\times (Q^S - Q^D)$ rises.']],
      rule: md`Support price up: $Q^S$ up, $Q^D$ down, so purchases $Q^S - Q^D$ rise, and spending $G = P_{\text{support}}(Q^S - Q^D)$ rises even faster.` }),
    () => ({ q: md`Demand rose in a constant-cost competitive industry, and the long-run adjustment is over. Compared with before, **output per firm** is…`,
      right: 'The same $q^*$ as before',
      wrongs: [['Higher', 'That is the short run. In the long run price returns to min LRAC, and each firm produces at the bottom of LRAC again.'],
        ['Lower, because more firms share the market', 'More firms share a **bigger** market; each still produces where LRAC bottoms out.'],
        ['Zero: firms exit', 'Demand rose: firms **enter**.']],
      rule: md`Long run: $P = \min LRAC$ and $q = q^*$ (the bottom of LRAC) for every firm. A bigger market just means more firms: $n = Q/q^*$.` }),
    () => ({ q: md`An input price rises for every firm in a constant-cost competitive industry. In the long run, the price…`,
      right: 'Rises to the new, higher min LRAC',
      wrongs: [['Returns to where it was, through entry and exit', 'Entry and exit push the price to min LRAC, but min LRAC itself is higher now.'],
        ['Falls', 'Higher costs never lower the long-run price.'],
        ['Rises in the short run only', 'Every firm’s LRAC shifted up, so the long-run supply curve (flat at min LRAC) shifts up too.']],
      rule: md`Long-run supply is flat at **min LRAC**. Anything that moves every firm’s LRAC moves the long-run price with it.` }),
  ];
  GYM.add({
    id: 'directions', title: 'Which way does it move?', chip: 'Directions',
    rule: md`Ask which **equation** the change enters. $p\cdot MP_1 = w_1$: $p$ and $w_1$ move labor; $w_2$ on a fixed input does not. Fixed costs never enter MC or MR: they change profit, not output. DWL grows with $t^2$. More elastic demand: smaller consumer share, bigger DWL, smaller Lerner index. Long run: $P = \min LRAC$ and $q = q^*$; quantity changes come from the number of firms.`,
    make() { const s = pick(DIR)(); return item(s.q, mc(s.right, s.wrongs), s.rule); },
  });

  // ================================================================== 10. MR from demand
  const co = (x) => (x === 1 ? '' : F(x));
  const MRV = [
    () => {
      const a = pick([20, 40, 60, 100, 120, 200, 500]), b = pick([0.5, 1, 2, 3, 4, 5]);
      return { q: md`Inverse demand is $P = ${a} - ${co(b)}Q$. Marginal revenue is…`,
        right: `$MR = ${a} - ${co(2 * b)}Q$`,
        wrongs: [[`$MR = ${a} - ${co(b)}Q$`, 'That is demand itself. MR lies below demand: selling one more unit means cutting the price on all the others.'],
          [`$MR = ${a} - ${co(b / 2)}Q$`, 'Half the slope is backwards: linear MR is **twice** as steep as demand.'],
          [`$MR = ${a}Q - ${co(b)}Q^2$`, 'That is total revenue $TR = P(Q)\\,Q$. MR is its derivative.'],
          [`$MR = ${2 * a} - ${co(2 * b)}Q$`, 'Only the slope doubles. Both lines start at the same intercept: the first unit adds its full price.']],
        rule: md`$P = a - bQ \Rightarrow TR = aQ - bQ^2 \Rightarrow MR = a - 2bQ$: **same intercept, twice the slope**.` };
    },
    () => {
      const c = pick([2, 4, 5, 10]), k = pick([10, 20, 25, 30, 50]), A = c * k;
      return { q: md`Demand is $Q = ${A} - ${c}P$. Marginal revenue is…`,
        right: `$MR = ${k} - ${co(2 / c)}Q$`,
        wrongs: [[`$MR = ${A} - ${2 * c}Q$`, 'You doubled the slope of the **direct** demand. MR comes from the inverse demand $P(Q)$: solve for $P$ first.'],
          [`$MR = ${k} - ${co(1 / c)}Q$`, 'That is the inverse demand itself, not MR.'],
          [`$MR = ${A} - ${2 * c}P$`, 'MR is a function of $Q$. Invert to $P(Q)$, then double the slope.']],
        rule: md`Direct demand first gets **inverted**: $P = ${k} - ${co(1 / c)}Q$. Then double the slope: $MR = ${k} - ${co(2 / c)}Q$.` };
    },
    () => {
      const a = pick([20, 24, 30, 40]), b = pick([2, 3, 4]), n = pick([2, 3, 4]);
      const P = (q) => a - b * q, TR = (q) => q * P(q), MRn = TR(n) - TR(n - 1);
      return { q: md`A monopolist’s demand schedule:

| $Q$ | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| $P$ | ${P(1)} | ${P(2)} | ${P(3)} | ${P(4)} |

What is the marginal revenue of unit ${n}?`,
        right: `$${MRn}$`,
        wrongs: [[`$${P(n)}$`, `That is the price of unit ${n}. MR equals the price only for a price taker; here selling unit ${n} lowers the price on the first ${n - 1} too.`],
          [`$${TR(n)}$`, `That is total revenue at $Q = ${n}$, not the change.`],
          [`$${-b}$`, 'That is the change in **price**. MR is the change in total **revenue**.']],
        rule: md`$MR_${n} = TR(${n}) - TR(${n - 1}) = ${TR(n)} - ${TR(n - 1)} = ${MRn}$. It is the new unit’s price, ${P(n)}, minus the ${b} lost on each of the ${n - 1} earlier unit${n === 2 ? '' : 's'}.` };
    },
    () => {
      const b = pick([1, 2, 4, 5]), a = b * pick([20, 30, 40, 60]);
      return { q: md`Demand is $P = ${a} - ${co(b)}Q$. At what quantity is $MR = 0$ (total revenue largest)?`,
        right: `$Q = ${a / (2 * b)}$, halfway to where demand hits zero`,
        wrongs: [[`$Q = ${a / b}$`, 'That is where demand hits zero ($P = 0$). MR reaches zero twice as early.'],
          ['$Q = 0$', `At $Q = 0$, $MR = ${a}$: the first unit adds its full price.`],
          [`$Q = ${a / (4 * b)}$`, `Too early: $MR = ${a} - ${co(2 * b)}Q$ is still positive there.`]],
        rule: md`$MR = a - 2bQ = 0$ at $Q = \dfrac{a}{2b}$: the **midpoint** of linear demand, where $|\varepsilon| = 1$. Left of it demand is elastic.` };
    },
    () => {
      const e = pick([2, 3, 4, 5]);
      return { q: md`Demand has constant elasticity: $Q = kP^{-${e}}$. Marginal revenue is…`,
        right: `$MR = \\tfrac{${e - 1}}{${e}}P$`,
        wrongs: [['$MR = P$', 'Only for a price taker (infinitely elastic demand).'],
          [`$MR = \\tfrac{${e + 1}}{${e}}P$`, `Sign slip: $\\varepsilon = -${e}$, so $MR = P(1 + 1/\\varepsilon) = P(1 - 1/${e})$.`],
          [`$MR = \\tfrac{1}{${e}}P$`, `That is $P/${e}$. The formula is $P(1 - 1/${e})$.`]],
        rule: md`$MR = P\left(1 + \dfrac{1}{\varepsilon}\right)$ with $\varepsilon = -${e}$: $MR = P(1 - \tfrac{1}{${e}}) = \tfrac{${e - 1}}{${e}}P$.` };
    },
    () => ({ q: md`Why is a monopolist’s marginal revenue below its price?`,
      right: 'To sell one more unit it must cut the price on every unit it sells',
      wrongs: [['Because its costs rise with output', 'MR is about revenue; costs are MC’s business.'],
        ['Because it pays a tax on every unit', 'MR < P with no tax at all.'],
        ['Because demand is inelastic', 'MR < P on every part of a downward demand curve, elastic or not.']],
      rule: md`$MR = P + Q\dfrac{dP}{dQ}$: the new unit brings $P$, but the price cut $\dfrac{dP}{dQ} < 0$ hits all $Q$ units already sold.` }),
  ];
  GYM.add({
    id: 'mr', title: 'Marginal revenue from demand', chip: 'MR',
    rule: md`$MR = \dfrac{dTR}{dQ} = P + Q\dfrac{dP}{dQ} < P$. **Linear $P = a - bQ$: $MR = a - 2bQ$** (same intercept, twice the slope; invert a direct demand first). From a table: $MR = \Delta TR$. Constant elasticity: $MR = P(1 + 1/\varepsilon)$. $MR = 0$ at the midpoint of linear demand.`,
    make() { const s = pick(MRV)(); return item(s.q, mc(s.right, s.wrongs), s.rule); },
  });

  // ================================================================== 11. monopoly price: which curve?
  function monoFig() {
    const a = 12, c = pick([3, 4]), Qm = (a - c) / 2, Pm = (a + c) / 2, Qc = a - c;
    const L = shuffle(['A', 'B', 'C', 'D']);
    const P = { M: [Qm, Pm], E: [Qm, c], K: [Qc, c], R: [6, 6] };
    const lab = { M: L[0], E: L[1], K: L[2], R: L[3] };
    const fig = EC.graph({ w: 320, h: 236, x: [0, 12.6], y: [0, 12.6], xl: 'Q', yl: 'P', items: [
      DEM,
      { seg: [[0, a], [a / 2, 0]], cls: 'curve c4 dash', lab: 'MR', at: 0.86, dx: 6, dy: 0, anchor: 'l' },
      { seg: [[0, c], [12.4, c]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: -5, anchor: 'br' },
      { pt: P.M, lab: lab.M, at: 'tr' }, { pt: P.E, lab: lab.E, at: 'bl' }, { pt: P.K, lab: lab.K, at: 'tr' }, { pt: P.R, lab: lab.R, at: 'tr' },
    ] });
    return { fig, lab };
  }
  const MONO = [
    () => {
      const { fig, lab } = monoFig(), eff = Math.random() < 0.35;
      const W = {
        M: 'the monopoly point: $MR = MC$ for the quantity, then up to demand for the price',
        E: 'where MR crosses MC: the right **quantity**, but its height is MC, the cost of the last unit, not the price',
        K: 'where demand meets MC: the competitive (efficient) outcome',
        R: 'the revenue-maximizing point ($MR = 0$): it ignores cost',
      };
      const r = eff ? 'K' : 'M';
      const m = mc(`Point ${lab[r]}`, Object.keys(W).filter((k) => k !== r).map((k) => [`Point ${lab[k]}`, `Point ${lab[k]} is ${W[k]}.`]));
      return { q: eff ? md`Demand, MR and MC are drawn. Which point is the **efficient** outcome ($P = MC$)?` : md`Demand, MR and MC are drawn. Which point gives the **monopoly** price and quantity?`, m, fig,
        rule: eff ? md`Efficient: the last unit is worth what it costs, so **demand meets MC** (point ${lab.K}). The monopolist stops short, at point ${lab.M}.`
          : md`Find where **MR crosses MC** (point ${lab.E}) for $Q_m$, then go **straight up to demand** (point ${lab.M}) for $P_m$.` };
    },
    () => {
      const Qm = pick([5, 10, 20]), b = pick([1, 2]), d = pick([0, 1]), c = pick([2, 4, 6]), a = c + (2 * b + d) * Qm, Pm = a - b * Qm, mcm = c + d * Qm;
      const m = mc(`$${Pm}$`, [[`$${mcm}$`, `That is MC (and MR) at $Q = ${Qm}$: the cost of the last unit. The price comes from **demand**.`],
        [`$${F((Pm + mcm) / 2)}$`, 'There is no averaging: the price is the demand height at $Q_m$.'],
        [`$${a}$`, 'That is the demand intercept: at that price nobody buys.']]);
      return { q: md`Demand $P = ${a} - ${co(b)}Q$, $MC = ${c}${d ? ' + Q' : ''}$. Setting $MR = MC$ gives $Q_m = ${Qm}$. The monopoly price is…`, m,
        rule: md`Plug $Q_m$ into **demand**: $P = ${a} - ${co(b)}(${Qm}) = ${Pm}$. The MR = MC height (${mcm}) is what the last unit costs; the gap $${Pm} - ${mcm}$ is the markup.` };
    },
    () => {
      const lin = Math.random() < 0.5;
      const O = ['Yes: demand is elastic there, so $MR > 0$ can equal $MC$', 'No: demand is inelastic there, so $MR < 0$', 'No: at unit elasticity $MR = 0$, which cannot equal a positive MC', 'Yes: a monopolist can pick any point on demand'];
      let q, z;
      if (lin) {
        const b = pick([1, 2]), a = b * pick([40, 60, 100]), mid = a / (2 * b);
        z = pick([0, 0, 1, 1, 2]);
        const Q = z === 0 ? mid * pick([0.4, 0.6, 0.8]) : z === 1 ? mid * pick([1.2, 1.5]) : mid;
        q = md`Demand is $P = ${a} - ${co(b)}Q$ and $MC > 0$. Could the monopolist’s profit-maximizing output be $Q = ${F(Q)}$?`;
      } else {
        const e = pick([0.5, 0.8, 1, 1.5, 2, 4]);
        z = e > 1 ? 0 : e < 1 ? 1 : 2;
        q = md`At the price a monopolist charges, demand elasticity is $${-e}$, and MC is positive. Can this be its profit-maximizing point?`;
      }
      const why = [
        z === 1 ? 'Here demand is **inelastic**: MR is negative, so it cannot equal a positive MC.' : 'At unit elasticity MR is exactly zero, not positive.',
        z === 0 ? 'Here demand is **elastic**, so MR is positive.' : 'At unit elasticity MR is zero, not negative.',
        z === 0 ? 'Here demand is elastic, not unit elastic.' : 'Here demand is inelastic, not unit elastic: MR is negative.',
        'The optimum has $MR = MC > 0$, which forces $MR > 0$: only the elastic part of demand qualifies.',
      ];
      const m = mc(O[z], O.map((o, j) => [o, why[j]]).filter((_, j) => j !== z));
      return { q, m, rule: md`$MR = P(1 + 1/\varepsilon)$ is positive only where $|\varepsilon| > 1$. With $MC > 0$, the monopolist is always on the **elastic** part${lin ? ', the upper half of linear demand (left of $Q = a/2b$)' : ''}.` };
    },
  ];
  GYM.add({
    id: 'mono-price', title: 'Monopoly: read the price off demand', chip: 'Monopoly P',
    rule: md`**Quantity from $MR = MC$; price from demand** above that quantity. The MR = MC height is the cost of the last unit, not the price. The efficient point is where demand meets MC. With $MC > 0$ the monopolist always sits on the **elastic** part of demand ($MR > 0$).`,
    make() { const s = pick(MONO)(); return item(s.q, s.m, s.rule, s.fig); },
  });

  // ================================================================== 12. Lerner index and elasticity
  const LER = [
    () => {
      const [P, c] = pick([[40, 30], [50, 30], [10, 8], [80, 60], [25, 20], [60, 48], [100, 40], [20, 15]]), L = (P - c) / P;
      return { q: md`A monopolist charges \$${P}; its marginal cost is \$${c}. Its Lerner index is…`,
        m: mc(`$${F(L)}$`, [[`$${F((P - c) / c)}$`, 'That divides by MC. The Lerner index divides the markup by the **price**.'],
          [`$${F(c / P)}$`, 'That is $MC/P = 1 - L$.'], [`$${P - c}$`, 'That is the markup in dollars. $L$ is a fraction of the price.']]),
        rule: md`$L = \dfrac{P - MC}{P} = \dfrac{${P} - ${c}}{${P}} = ${F(L)}$: the share of the price that is markup.` };
    },
    () => {
      const L = pick([0.5, 0.25, 0.2, 0.1, 0.4]), e = 1 / L;
      return { q: md`At a monopolist’s profit-maximizing point the Lerner index is $${L}$. The price elasticity of demand there is…`,
        m: mc(`$${F(-e)}$`, [[`$${F(-L)}$`, '$L = -1/\\varepsilon$, not $-\\varepsilon$: flip it.'], [`$${F(e)}$`, 'Demand slopes down, so the elasticity is negative.'],
          ['Cannot tell without MC', 'At the optimum $L$ alone pins it down: $L = -1/\\varepsilon$.']]),
        rule: md`$L = -\dfrac{1}{\varepsilon} \Rightarrow \varepsilon = -\dfrac{1}{L} = -\dfrac{1}{${L}} = ${F(-e)}$.` };
    },
    () => {
      const [e, c] = pick([[2, 10], [3, 20], [4, 30], [5, 40], [1.5, 10], [2, 25], [3, 10], [4, 15]]), P = c * e / (e - 1);
      return { q: md`A monopolist’s MC is \$${c} and demand elasticity at its optimum is $${-e}$. Its price is…`,
        m: mc(`\\$${F(P)}`, [[`\\$${F(c * (1 + 1 / e))}`, `That adds $1/|\\varepsilon|$ of **MC**. The rule is $(P - MC)/P = 1/|\\varepsilon|$: the markup is a share of the **price**.`],
          [`\\$${F(c * e / (e + 1))}`, 'Sign slip: that is below MC. Use $P = MC/(1 + 1/\\varepsilon)$ with $\\varepsilon < 0$.'],
          [`\\$${c}`, 'That is the competitive price. A monopolist marks up above MC.']]),
        rule: md`$P = \dfrac{MC}{1 + 1/\varepsilon} = MC\cdot\dfrac{|\varepsilon|}{|\varepsilon| - 1} = ${c}\cdot\dfrac{${e}}{${F(e - 1)}} = ${F(P)}$.` };
    },
    () => ({ q: md`A monopolist with positive MC never sets its price where demand is inelastic because…`,
      m: mc('There $MR < 0$: making less raises revenue **and** cuts cost', [['Inelastic buyers cannot afford its product', 'Inelastic means quantity barely responds to price; it says nothing about budgets.'],
        ['There its profit would be exactly zero', 'Profit can be anything there; the point is it can always be raised.'],
        ['There MR is above the price', 'MR is below the price on every part of demand.']]),
      rule: md`$MR = P(1 + 1/\varepsilon) < 0$ when $|\varepsilon| < 1$. Cutting output there raises TR and lowers TC: profit goes up, so that point is never optimal.` }),
    () => {
      const bad = pick([1.2, 1.5, -0.2]);
      const ok = some([[0.5, '$\\varepsilon = -2$'], [0.25, '$\\varepsilon = -4$'], [0.1, '$\\varepsilon = -10$'], [0.8, '$\\varepsilon = -1.25$'], [0, 'a price taker: $P = MC$']], 3);
      return { q: md`Which Lerner index is **impossible** for a profit-maximizing firm with positive MC?`,
        m: mc(`$L = ${bad}$`, ok.map(([v, s]) => [`$L = ${v}$`, `Possible: $L = ${v}$ goes with ${s}.`])),
        rule: md`$0 \le L < 1$. $L > 1$ would need $MC < 0$; $L < 0$ means pricing below MC, which loses money on the last unit. ${bad > 1 ? `$L = ${bad}$ breaks the upper limit.` : `$L = ${bad}$ is below zero.`}` };
    },
  ];
  GYM.add({
    id: 'lerner', title: 'Lerner index and elasticity', chip: 'Lerner',
    rule: md`$L = \dfrac{P - MC}{P}$ (markup as a share of **price**), and at the monopoly optimum $L = -\dfrac{1}{\varepsilon}$. So $P = \dfrac{MC}{1 + 1/\varepsilon}$. $0 \le L < 1$; $L = 0$ is a price taker. More elastic demand, smaller markup. Positive MC forces $|\varepsilon| > 1$.`,
    make() { const s = pick(LER)(); return item(s.q, s.m, s.rule); },
  });

  // ================================================================== 13. taxing a monopoly
  const TXM = [
    () => {
      const a = pick([60, 100, 120, 200]), b = pick([1, 2, 4]), t = pick([4, 10, 20]);
      return { q: md`Demand $P = ${a} - ${co(b)}Q$. A \$${t} per-unit tax is collected from the monopolist. Its after-tax marginal revenue is…`,
        m: mc(`$${a - t} - ${co(2 * b)}Q$`, [[`$${a} - ${co(2 * b)}Q$`, 'That ignores the tax: each unit now nets $t$ less.'],
          [`$${a - 2 * t} - ${co(2 * b)}Q$`, 'Only the slope doubles. The tax comes off each unit once: $MR - t$.'],
          [`$${a} - ${co(2 * b + t)}Q$`, 'A per-unit tax shifts the line down by $t$; it does not change the slope.']]),
        rule: md`Specific tax: net demand $P - t = ${a - t} - ${co(b)}Q$, so effective $MR = ${a - t} - ${co(2 * b)}Q$. Set it equal to MC.` };
    },
    () => {
      const [a, b] = pick([[500, 2], [100, 1], [200, 2], [120, 1]]), v = pick([0.2, 0.25, 0.4, 0.5]), k = 1 - v;
      return { q: md`Demand $P = ${a} - ${co(b)}Q$. A ${100 * v}% ad valorem tax: the monopolist keeps $(1 - ${v})$ of each dollar. Its effective marginal revenue is…`,
        m: mc(`$${F(k * a)} - ${co(2 * k * b)}Q$`, [[`$${F(k * a)} - ${co(2 * b)}Q$`, 'A percent tax scales the **whole** MR, slope included, not just the intercept.'],
          [`$${a} - ${co(2 * b)}Q$`, `That ignores the tax: the firm keeps only ${100 * k}% of each dollar.`],
          [`$${F((1 + v) * a)} - ${co(2 * (1 + v) * b)}Q$`, `The firm keeps $(1 - v)$ of the price, not $(1 + v)$.`]]),
        rule: md`Ad valorem: effective demand $P_p = (1 - v)P(Q) = ${F(k * a)} - ${co(k * b)}Q$; effective $MR = (1 - v)MR = ${F(k * a)} - ${co(2 * k * b)}Q$.` };
    },
    () => {
      const t = pick([2, 4, 6, 8, 10]);
      return { q: md`A monopolist with straight-line demand and constant MC is hit with a \$${t} per-unit tax. The price consumers pay rises by…`,
        m: mc(`\\$${t / 2}`, [[`\\$${t}`, 'Full pass-through happens in a competitive market with flat supply. The monopolist absorbs half.'],
          ['\\$0', 'The tax raises the monopolist’s effective MC, so it cuts output and raises the price.'],
          [`\\$${2 * t}`, 'More than the tax happens with constant-elasticity demand, not linear demand.']]),
        rule: md`Linear demand, constant MC: $P_c = \dfrac{a + c + t}{2}$, so $\dfrac{dP_c}{dt} = \dfrac12$. Consumers pay half the tax.` };
    },
    () => {
      const [e, t] = pick([[2, 1], [2, 3], [3, 2], [3, 4], [4, 3], [4, 6], [1.5, 1], [1.5, 2]]), r = e / (e - 1);
      return { q: md`A monopolist faces constant-elasticity demand $Q = kP^{-${e}}$ and constant MC. A \$${t} per-unit tax raises the consumer price by…`,
        m: mc(`\\$${F(t * r)}`, [[`\\$${F(t / 2)}`, 'Half is the linear-demand result. With constant elasticity the price is a fixed markup over MC.'],
          [`\\$${t}`, 'The price is a markup **times** MC, so a cost increase gets marked up too: more than \\$1 per \\$1.'],
          [`\\$${F(t * (e - 1) / e)}`, `That divides instead of multiplies: the markup factor is $\\dfrac{${e}}{${F(e - 1)}}$.`]]),
        rule: md`Constant elasticity: $P = \dfrac{e}{e - 1}(MC + t)$, so $\dfrac{dP_c}{dt} = \dfrac{${e}}{${F(e - 1)}} = ${F(r)}$: **more than 100%** pass-through.` };
    },
    () => ({ q: md`A per-unit tax on a monopolized good is moved from the monopolist to the consumers (consumers now send it in). What changes?`,
      m: mc('Nothing real: the same $Q$, $P_c$ and $P_p$', [['Consumers now bear all of the tax', 'Who sends the check does not decide who bears it.'],
        ['The monopolist now bears none of it', 'Demand shifts down by $t$ instead; the monopolist ends up keeping the same $P_p$.'],
        ['Output falls by more', 'Both versions give the same wedge $P_c - P_p = t$ at the same quantity.']]),
      rule: md`Legal liability is irrelevant: taxing sellers shifts their effective MR down by $t$; taxing buyers shifts demand down by $t$. The same $Q$, $P_c$, $P_p$.` }),
    () => ({ q: md`A specific tax and an ad valorem tax lead a monopolist to the **same output**. Which raises more revenue?`,
      m: mc('The ad valorem tax', [['The specific tax', 'Same $Q$ means $t = v\\cdot MR$. Specific revenue $tQ = v\\cdot MR\\cdot Q$, ad valorem revenue $v\\cdot P\\cdot Q$, and $P > MR$.'],
        ['They raise the same', 'Only if $P = MR$, which is a price taker, not a monopolist.'], ['It depends on the size of MC', 'Same output fixes the comparison: $v\\cdot P\\cdot Q > v\\cdot MR\\cdot Q$ always.']]),
      rule: md`Same $Q$: $MR - t = MC$ and $(1 - v)MR = MC$ give $t = v\cdot MR$. Ad valorem revenue $vPQ$ beats specific revenue $v\cdot MR\cdot Q$ because $P > MR$.` }),
    () => ({ q: md`After a tax on a monopoly, the **total** deadweight loss is the area between demand and MC from…`,
      m: mc('the taxed quantity out to the efficient quantity (demand meets MC)', [['the taxed quantity to the untaxed monopoly quantity', 'That is only the **extra** DWL the tax adds. The monopoly already lost the units past $Q_m$.'],
        ['the untaxed monopoly quantity to the efficient quantity', 'That is the DWL **before** the tax.'],
        ['zero to the taxed quantity', 'Those units are still traded; their value is split into CS, PS and tax revenue.']]),
      rule: md`Total DWL is always measured against the **efficient** benchmark $P(Q) = MC$: the triangle from the traded $Q$ out to $Q_{\text{eff}}$ (DS10: from 88.2 to 166.7).` }),
  ];
  GYM.add({
    id: 'tax-mono', title: 'Taxing a monopoly', chip: 'Monopoly tax',
    rule: md`**Specific:** $MR - t = MC$ (MR shifts down by $t$). **Ad valorem:** $(1 - v)MR = MC$ (MR scaled, slope too). Price from demand: $P_c$; seller keeps $P_p = P_c - t$ or $(1 - v)P_c$. **Pass-through:** linear demand $\tfrac12$; constant elasticity $\tfrac{e}{e - 1} > 1$. Legal liability changes nothing. Total DWL is measured against $P(Q) = MC$.`,
    make() { const s = pick(TXM)(); return item(s.q, s.m, s.rule); },
  });

  // ================================================================== 14. regulating a natural monopoly
  function natMono() {
    const c = pick([2, 4, 5]), [Q1, Q2] = pick([[4, 20], [2, 12], [5, 15], [4, 16], [6, 10]]);
    const a = c + Q1 + Q2, Fx = Q1 * Q2, Qm = (a - c) / 2, Pm = (a + c) / 2;
    return { c, Q1, Q2, a, Fx, Qm, Pm, piM: Qm * Qm - Fx, dwlM: Qm * Qm / 2, dwlAC: Q1 * Q1 / 2, Qe: a - c };
  }
  const REG = [
    (N) => ({ q: md`Water utility: $P = ${N.a} - Q$, $C = ${N.Fx} + ${N.c}Q$. Regulators set $P = MC = ${N.c}$, so $Q = ${N.Qe}$. The firm’s economic profit is…`,
      m: mc(`$-${N.Fx}$: it loses its fixed cost`, [['$0$', 'Zero profit is average-cost pricing. At $P = MC$ revenue covers only the variable cost.'],
        [`$${F(N.piM)}$`, 'That is the unregulated monopoly profit.'],
        [`$-${N.c * N.Qe}$`, `That is the variable cost. Revenue $${N.c} \\times ${N.Qe}$ pays it exactly; what is left unpaid is $F$.`]]),
      rule: md`With constant MC, $P = MC$ means $TR = c\,Q = VC$. Profit $= TR - VC - F = -F = -${N.Fx}$.` }),
    (N) => ({ q: md`A natural monopoly is held to $P = MC$ and gets **no subsidy**. In the long run it…`,
      m: mc('Exits: it loses its fixed cost every period', [['Stays: the price covers AVC', 'That is the short-run test. In the long run $F$ is avoidable too, and a firm that loses $F$ forever leaves.'],
        ['Breaks even', 'Revenue $= MC \\times Q$ covers only variable cost; the fixed cost is left over as a loss.'],
        ['Raises its price to AC', 'The ceiling forbids it. That is why marginal-cost pricing needs a subsidy (or a two-part tariff).']]),
      rule: md`$P = MC$ is efficient but $\pi = -F < 0$. In the long run every cost is avoidable, so without a subsidy the firm **exits**.` }),
    (N) => ({ q: md`$P = ${N.a} - Q$, $C = ${N.Fx} + ${N.c}Q$. Average-cost pricing gives $Q = ${N.Q2}$, $P = ${N.c + N.Q1}$. The firm’s profit, and what it does in the long run:`,
      m: mc('Zero profit; it stays', [['Negative profit; it exits', 'At $P = AC$ revenue covers **every** cost, fixed included: profit is exactly zero.'],
        ['Positive profit; it stays', 'Price equals average cost, so nothing is left over.'],
        ['Zero profit; it exits', 'Zero economic profit already pays the owner her best alternative: no reason to leave.']]),
      rule: md`$P = AC \Rightarrow \pi = (P - AC)Q = 0$. Zero **economic** profit is enough to stay: average-cost pricing needs no subsidy.` }),
    (N) => ({ q: md`$P = ${N.a} - Q$, $C = ${N.Fx} + ${N.c}Q$. Unregulated: $Q = ${F(N.Qm)}$; $P = AC$: $Q = ${N.Q2}$; $P = MC$: $Q = ${N.Qe}$. Rank the deadweight loss.`,
      m: mc('Unregulated > average-cost > marginal-cost (zero)', [['Average-cost > unregulated > marginal-cost', 'Average-cost pricing produces more than the monopoly, so it loses fewer units.'],
        ['All three are the same', 'DWL is the triangle out to the efficient $Q$: the closer $Q$ gets, the smaller it is.'],
        ['Marginal-cost > average-cost > unregulated', 'Marginal-cost pricing hits the efficient quantity exactly: zero DWL.']]),
      rule: md`DWL shrinks as $Q$ moves toward the efficient $Q = ${N.Qe}$: unregulated ${F(N.dwlM)}, $P = AC$ ${F(N.dwlAC)}, $P = MC$ 0.` }),
    (N) => ({ q: md`$P = ${N.a} - Q$, $MC = ${N.c}$. Under average-cost pricing $Q = ${N.Q2}$ and $P = ${N.c + N.Q1}$; the efficient quantity is ${N.Qe}. The remaining DWL is…`,
      m: mc(`$${F(N.dwlAC)}$`, [[`$${F(2 * N.dwlAC)}$`, 'A triangle is **half** base times height.'],
        [`$${F(N.dwlM)}$`, 'That is the unregulated DWL, from the monopoly quantity.'],
        ['$0$', 'Only marginal-cost pricing removes all the DWL. Here $P > MC$ on the last unit.']]),
      rule: md`DWL $= \tfrac12 \times (Q_{\text{eff}} - Q_{AC}) \times (P_{AC} - MC) = \tfrac12(${N.Qe} - ${N.Q2})(${N.c + N.Q1} - ${N.c}) = ${F(N.dwlAC)}$.` }),
    () => ({ q: md`Which regulation of a natural monopoly is **efficient** but needs a **subsidy** to keep the firm in business?`,
      m: mc('A price ceiling at $P = MC$', [['A price ceiling at $P = AC$', 'That keeps the firm whole (zero profit) but leaves some DWL.'],
        ['No regulation', 'The unregulated monopoly has the biggest DWL.'],
        ['A ceiling at the monopoly price', 'That ceiling does not bind: nothing changes.']]),
      rule: md`$P = MC$: efficient, $\pi = -F$ (subsidy needed). $P = AC$: $\pi = 0$, small DWL. Unregulated: profit, biggest DWL.` }),
    (N) => ({ q: md`A water utility has $C = ${N.Fx} + ${N.c}Q$. Why is it a **natural** monopoly?`,
      m: mc(`AC $= ${N.Fx}/Q + ${N.c}$ keeps falling: one firm serves the market more cheaply than two`, [['Its MC rises with output', `MC is flat at ${N.c} here. A natural monopoly comes from **falling** AC.`],
        ['It holds a patent on water', 'That would be a legal barrier, not a cost advantage.'],
        ['Demand for water is inelastic', 'Elasticity is about buyers; natural monopoly is about the cost curve.']]),
      rule: md`A big fixed cost spread over more units makes AC fall over the whole market. Splitting output between two firms would pay $F$ twice.` }),
  ];
  GYM.add({
    id: 'regulate', title: 'Regulating a natural monopoly', chip: 'Regulation',
    rule: md`**Unregulated:** $MR = MC$, profit, biggest DWL. **$P = MC$ ceiling:** efficient (DWL 0) but $\pi = -F$; without a subsidy it exits in the long run. **$P = AC$ ceiling:** demand meets AC, take the larger root, $\pi = 0$ (it stays), small DWL $= \tfrac12(Q_{\text{eff}} - Q_{AC})(P_{AC} - MC)$.`,
    make() { const s = pick(REG)(natMono()); return item(s.q, s.m, s.rule); },
  });

  // ================================================================== 15. kinds of profit
  const PK = [
    () => {
      const R = pick([300, 400, 500]), E = pick([150, 200]), S = pick([60, 80, 100]), I = pick([10, 20]), econ = Math.random() < 0.6;
      const v = { e: R - E - S - I, a: R - E, x: R - S - I, y: R - E - S };
      const W = { e: ['economic profit: revenue minus explicit **and** implicit costs', 'e'], a: ['accounting profit: only the explicit costs come off', 'a'], x: ['revenue minus the implicit costs only: the explicit costs are missing', 'x'], y: ['missing the interest the owner’s savings would have earned', 'y'] };
      const r = econ ? 'e' : 'a';
      const m = mc(`$${v[r]}$`, Object.keys(v).filter((k) => k !== r && v[k] !== v[r]).map((k) => [`$${v[k]}$`, `$${v[k]}$ is ${W[k][0]}.`]));
      return { q: md`A bakery (in thousands of dollars): revenue ${R}, paid out ${E} for wages, flour and rent. The owner gave up a ${S} salary elsewhere and ${I} of interest on the savings she put in. Its **${econ ? 'economic' : 'accounting'}** profit is…`, m,
        rule: md`Accounting $= R - \text{explicit} = ${R} - ${E} = ${v.a}$. Economic $=$ accounting $-$ implicit $= ${v.a} - ${S} - ${I} = ${v.e}$.` };
    },
    () => {
      const TR = pick([400, 500, 600]), VC = pick([250, 300, 350]), Fx = pick([100, 200, 300]), ps = Math.random() < 0.5;
      const v = { ps: TR - VC, pi: TR - VC - Fx, tf: TR - Fx, tr: TR };
      const W = { ps: 'producer surplus, $TR - VC$', pi: 'profit, $TR - VC - F$', tf: '$TR - F$: it leaves out the variable cost', tr: 'total revenue, before any cost' };
      const r = ps ? 'ps' : 'pi';
      return { q: md`$TR = ${TR}$, $VC = ${VC}$, $F = ${Fx}$. The firm’s **${ps ? 'producer surplus' : 'economic profit'}** is…`,
        m: mc(`$${v[r]}$`, Object.keys(v).filter((k) => k !== r && v[k] !== v[r]).map((k) => [`$${v[k]}$`, `That is ${W[k]}.`])),
        rule: md`$PS = TR - VC = ${v.ps}$ (the fixed cost is not in it). $\pi = PS - F = ${v.ps} - ${Fx} = ${v.pi}$.` };
    },
    () => ({ q: md`A firm earns **zero economic profit**. This means…`,
      m: mc('its owner earns exactly what her next-best option would pay', [['it should exit right away', 'Zero economic profit is not a loss: the owner cannot do better elsewhere.'],
        ['its accounting profit is zero too', 'Accounting profit leaves out the implicit costs, so it is positive when economic profit is zero.'],
        ['it is losing money', 'Every cost, including the owner’s time and capital, is covered exactly.']]),
      rule: md`Economic cost includes what the owner gives up. Zero economic profit $=$ a **normal return**: as good as the best alternative, no reason to leave.` }),
    () => {
      const r = pick(['the salary the owner gives up to run the firm', 'interest the owner’s savings would have earned elsewhere', 'rent the owner could have charged for her own building']);
      return { q: md`Which counts in **economic** cost but not in **accounting** cost?`,
        m: mc(r, [['wages paid to the workers', 'A payment that leaves the firm is explicit: it is in both.'], ['rent paid to a landlord', 'Explicit: it is in both.'], ['the cost of materials and electricity', 'Explicit: it is in both.']]),
        rule: md`Accounting cost $=$ explicit payments. Economic cost adds the **implicit** costs: what the owner’s own time, money and property could earn elsewhere.` };
    },
    () => {
      const PS = pick([100, 200, 300]), Fx = PS + pick([100, 200, 300]);
      return { q: md`This period a firm’s producer surplus is ${PS} and its fixed cost is ${Fx}. In the short run it should…`,
        m: mc(`Operate: $PS > 0$ means revenue covers variable cost`, [['Shut down: its profit is negative', `Shutting down makes $PS = 0$ and profit $-${Fx}$. Operating gives $${PS} - ${Fx} = ${PS - Fx}$, which is better.`],
          ['Exit the industry this period', 'Exit is a long-run move; this period $F$ is paid either way.'],
          ['Raise its price', 'A price taker cannot.']]),
        rule: md`$PS = TR - VC$. $PS > 0 \Leftrightarrow P > AVC$: operate in the short run, even though $\pi = PS - F = ${PS - Fx} < 0$.` };
    },
  ];
  GYM.add({
    id: 'profit-kinds', title: 'Accounting profit, economic profit, PS', chip: 'Profit kinds',
    rule: md`**Accounting profit** $=$ revenue $-$ explicit costs. **Economic profit** $=$ accounting profit $-$ implicit costs (the owner’s forgone salary, interest, rent). **PS** $= TR - VC$; **$\pi = PS - F$**. Zero economic profit is a normal return, not a loss. $PS > 0$ means operate in the short run.`,
    make() { const s = pick(PK)(); return item(s.q, s.m, s.rule); },
  });

  // ================================================================== 16. input choice and isoprofit lines
  const INP = [
    () => {
      const [p, w] = pick([[8, 16], [4, 12], [5, 20], [2, 10], [10, 30], [4, 2]]);
      return { q: md`Output sells for $p = ${p}$ and labor costs $w_1 = ${w}$. At the profit-maximizing amount of labor, $MP_1$ equals…`,
        m: mc(`$${F(w / p)}$`, [[`$${w}$`, 'MP is measured in units of output, the wage in dollars. Divide by the price: $MP_1 = w_1/p$.'],
          [`$${F(p / w)}$`, 'Upside down: $p\\cdot MP_1 = w_1$ gives $MP_1 = w_1/p$.'], [`$${p * w}$`, 'Multiply out $p\\cdot MP_1 = w_1$ and solve: $MP_1 = w_1/p$.']]),
        rule: md`$p\cdot MP_1 = w_1 \Rightarrow MP_1 = \dfrac{w_1}{p} = \dfrac{${w}}{${p}} = ${F(w / p)}$: the last worker must add ${F(w / p)} units to pay for herself.` };
    },
    () => {
      const [p, w] = pick([[8, 16], [8, 32], [4, 12], [5, 20], [2, 10]]);
      return { q: md`$p = ${p}$, $w_1 = ${w}$. In the $(x_1, q)$ graph, the isoprofit lines have slope…`,
        m: mc(`$${F(w / p)}$`, [[`$${F(p / w)}$`, 'Upside down. Solve $\\pi = pq - w_1x_1 - w_2\\bar x_2$ for $q$: the slope is $w_1/p$.'],
          [`$-${F(w / p)}$`, 'Isoprofit lines slope **up**: more labor costs more, so it takes more output to keep profit the same.'],
          [`$${w}$`, 'Divide by $p$: $q = \\frac{w_1}{p}x_1 + \\ldots$']]),
        rule: md`$q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$: slope $\dfrac{w_1}{p} = ${F(w / p)}$, and a higher line means a higher $\pi$.` };
    },
    () => ({ q: md`Short run: the production function $q = f(x_1, \bar x_2)$ and a family of isoprofit lines. The firm picks…`,
      m: mc('the highest isoprofit line that still touches $f$: the tangency', [['the lowest isoprofit line that touches $f$', 'Higher lines mean **more** profit.'],
        ['where $f$ is steepest', 'That is where each worker adds most, not where profit is largest.'],
        ['where the isoprofit line crosses $f$ twice', 'Two crossings mean a higher line still touches $f$: profit can rise.']]),
      rule: md`Climb to the highest isoprofit line you can reach. It just touches $f$: slopes equal, $MP_1 = w_1/p$.` }),
    () => {
      const [a, b] = pick([[0.5, 0.5], [0.3, 0.5], [0.6, 0.6], [1, 0.5], [0.25, 0.25], [0.4, 0.6], [0.5, 0.25], [0.75, 0.5]]), s = a + b;
      const O = ['Increasing returns to scale', 'Constant returns to scale', 'Decreasing returns to scale', 'Cannot tell without input prices'];
      const z = s > 1 ? 0 : s === 1 ? 1 : 2;
      const why = [`Increasing needs $a + b > 1$; here it is ${s}.`, `Constant needs $a + b = 1$; here it is ${s}.`, `Decreasing needs $a + b < 1$; here it is ${s}.`, 'Returns to scale is a property of the production function alone: scale every input and see what output does.'];
      return { q: md`$q = x_1^{${a}}x_2^{${b}}$. Doubling both inputs…`,
        m: mc(O[z], O.map((o, j) => [o, why[j]]).filter((_, j) => j !== z)),
        rule: md`Cobb–Douglas: doubling both inputs multiplies $q$ by $2^{a + b} = 2^{${s}}$. Here $a + b = ${s}$: ${['more than', 'exactly', 'less than'][z]} double.` };
    },
    () => ({ q: md`In the long run (every input free), a firm that maximizes profit…`,
      m: mc('also produces its chosen output at the lowest possible cost', [['always produces at the bottom of its AC curve', 'Only in long-run competitive equilibrium. In general it picks $q$ from $P = MC$.'],
        ['maximizes output', 'More output is not more profit once inputs cost money.'],
        ['sets $MP_1 = MP_2$', 'The cost-minimizing rule is $MP_1/MP_2 = w_1/w_2$, not equal MPs.']]),
      rule: md`If the chosen output were made at more than minimum cost, the firm could cut cost and raise profit. So profit max $\Rightarrow$ cost min: $\dfrac{MP_1}{MP_2} = \dfrac{w_1}{w_2}$ at the chosen $q$.` }),
  ];
  GYM.add({
    id: 'inputs', title: 'Input choice and isoprofit lines', chip: 'Inputs',
    rule: md`Short run: hire until $p\cdot MP_1 = w_1$, so $MP_1 = w_1/p$. Isoprofit lines: $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$, slope $w_1/p$, higher line $=$ more profit; the best is tangent to $f$. Returns to scale (Cobb–Douglas): $a + b$ vs 1. Long-run profit max implies cost min.`,
    make() { const s = pick(INP)(); return item(s.q, s.m, s.rule); },
  });

  // ================================================================== 17. long-run equilibrium numbers
  const LRE = [
    () => {
      const a = pick([1, 2, 3]), s = pick([2, 3, 4, 5]), Fx = a * s * s, P = 2 * a * s;
      return { q: md`$LRC(q) = ${a === 1 ? '' : a}q^2 + ${Fx}$. LRAC bottoms out at $q^* = ${s}$. The long-run competitive price is…`,
        m: mc(`$${P}$`, [[`$${a * s}$`, `That is only the variable part, $${a === 1 ? '' : a}q$. LRAC $= ${a === 1 ? '' : a}q + ${Fx}/q$ includes the fixed part.`],
          [`$${s}$`, 'That is $q^*$, a quantity, not a price.'], [`$${a * s * s + Fx}$`, 'That is total cost at $q^*$. Divide by $q^*$ for the average.']]),
        rule: md`Long-run price $= \min LRAC = LRAC(q^*) = ${a === 1 ? '' : a}(${s}) + \dfrac{${Fx}}{${s}} = ${P}$ (also $= LRMC(q^*)$).` };
    },
    () => {
      const P = pick([8, 10, 12, 20]), b = pick([5, 10, 20]), A = b * P + pick([200, 400, 600]), qs = pick([2, 4, 5]), Q = A - b * P;
      return { q: md`Long run: $\min LRAC = ${P}$ at $q^* = ${qs}$. Demand is $Q = ${A} - ${b}P$. The long-run **market** quantity is…`,
        m: mc(`$${Q}$`, [[`$${A}$`, 'That is demand at a zero price.'], [`$${A - b * qs}$`, `That plugs $q^* = ${qs}$ in for the price. The price is ${P}.`],
          [`$${F(Q / qs)}$`, 'That is the number of firms, $Q/q^*$.']]),
        rule: md`The long-run price is pinned at $\min LRAC = ${P}$, so demand alone sets the quantity: $Q = ${A} - ${b}(${P}) = ${Q}$.` };
    },
    () => {
      const qs = pick([2, 4, 5, 10]), n = pick([40, 60, 100, 150]), Q = n * qs, P = pick([8, 10, 12]);
      return { q: md`Long run: $P = \min LRAC = ${P}$, $q^* = ${qs}$ per firm, and the market buys $Q = ${Q}$. How many firms?`,
        m: mc(`$${n}$`, [[`$${Q}$`, 'That is the market quantity, not the number of firms.'], [`$${Q * qs}$`, 'Multiplying makes no sense: each firm makes $q^*$, so divide.'],
          [`$${F(Q / P)}$`, 'Dividing by the price mixes dollars with units. Divide by output per firm.']]),
        rule: md`$n = \dfrac{Q}{q^*} = \dfrac{${Q}}{${qs}} = ${n}$. Every firm sits at the bottom of LRAC, so the market quantity is split into $q^*$-sized pieces.` };
    },
  ];
  GYM.add({
    id: 'lr-eq', title: 'Long-run equilibrium: P, Q, n', chip: 'LR numbers',
    rule: md`Three moves: **$P = \min LRAC$** (set $LRMC = LRAC$, or $dLRAC/dq = 0$, to get $q^*$; then $P = LRAC(q^*)$). **$Q$ from demand** at that price. **$n = Q/q^*$.**`,
    make() { const s = pick(LRE)(); return item(s.q, s.m, s.rule); },
  });
})();

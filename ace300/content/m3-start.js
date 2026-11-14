/* Mini Exam 3 · Start here: read the problem first. The one marginal idea behind every Exam 3 problem, the problem-type
   map (what the problem says -> what you do), the graph atlas (every area in every picture), and the math moves. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { N, X, FIX, plan, gen, F, pick, ri } = M3;
  // a plan-only "spot it" card: the problem text and one or more plan steps, no answer boxes
  const S = (q, ...steps) => P({ q, plan: steps.length > 1 ? steps : steps[0] });

  // ------------------------------------------------------------------ figures for m3-read
  // food truck: P = 8, MC = 2 + q. Units left of q = 6 add profit, units right of it lose.
  const nextUnitFig = EC.graph({
    w: 330, h: 250, x: [0, 10], y: [0, 13], xl: 'q', yl: '\\$', xt: [6], yt: [2, 8],
    items: [
      { poly: [[0, 2], [6, 8], [0, 8]], cls: 'gain' },
      { poly: [[6, 8], [9.5, 11.5], [9.5, 8]], cls: 'loss' },
      { seg: [[0, 8], [10, 8]], cls: 'curve c3', lab: 'P = 8', at: 'end', dx: -2, dy: 14, anchor: 'tr' },
      { f: (q) => 2 + q, from: 0, to: 10, cls: 'c5', lab: 'MC = 2 + q', labX: 9.6, dx: -6, dy: -2, anchor: 'br' },
      { pt: [6, 8], guide: 'x' },
      { text: [2.1, 6.4], t: 'P > MC' },
      { text: [8.6, 9.0], t: 'P < MC' },
    ],
  });
  // market: D P = 14 - Q, S P = 2 + Q. At Q = 4 the next unit is worth 10 and costs 6.
  const mbmcFig = EC.graph({
    w: 330, h: 250, x: [0, 12], y: [0, 15], xl: 'Q', yl: '\\$', xt: [4, 6], yt: [6, 8, 10],
    items: [
      { poly: [[4, 10], [6, 8], [4, 6]], cls: 'loss' },
      { f: (Q) => 14 - Q, from: 0, to: 12, lab: 'D = MB', labX: 11.5, dx: 0, dy: -6, anchor: 'bl' },
      { f: (Q) => 2 + Q, from: 0, to: 12, cls: 'c2', lab: 'S = MC', labX: 11.5, dx: -4, dy: 0, anchor: 'r' },
      { pt: [4, 10], lab: 'MB = 10', at: 'tr', guide: true }, { pt: [4, 6], lab: 'MC = 6', at: 'br', guide: 'y' },
      { pt: [6, 8], guide: true },
      { text: [4.75, 8], t: '\\text{DWL}', anchor: 'l' },
    ],
  });

  // ------------------------------------------------------------------ figures for m3-graphs (the atlas)
  const L = (x, y, s) => ({ text: [x, y], t: `\\text{${s}}` });
  // (1) Dent, C = 2q^2 + 100 at P = 40: q = 10, AC = 30, AVC = 20. A profit, B fixed cost, C variable cost.
  const g1 = EC.graph({
    w: 330, h: 260, x: [0, 14], y: [0, 60], xl: 'q', yl: '\\$', xt: [10], yt: [20, 30, 40],
    items: [
      { poly: [[0, 0], [10, 0], [10, 20], [0, 20]], cls: 'ex' },
      { poly: [[0, 20], [10, 20], [10, 30], [0, 30]], cls: 'cs' },
      { poly: [[0, 30], [10, 30], [10, 40], [0, 40]], cls: 'gain' },
      { seg: [[0, 40], [14, 40]], cls: 'curve c3', lab: 'P = 40', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { f: (q) => 4 * q, from: 0, to: 14, cls: 'c5', lab: 'MC', labX: 13.5, dx: -6, dy: 0, anchor: 'r' },
      { f: (q) => 2 * q + 100 / q, from: 1.8, to: 14, lab: 'AC', labX: 14, dx: -2, dy: 10, anchor: 'tr' },
      { f: (q) => 2 * q, from: 0, to: 14, cls: 'c2 dash', lab: 'AVC', labX: 14, dx: -2, dy: 10, anchor: 'tr' },
      { pt: [10, 40] }, { pt: [10, 30] }, { pt: [10, 20] },
      L(5, 35, 'A'), L(5, 25, 'B'), L(5, 10, 'C'),
    ],
  });
  // (2) firm and market. Firm: C = q^2 + 25 (MC = 2q, min AC = 10 at q = 5). 200 firms: SR supply Q = 100P.
  // D: Q = 1500 - 50P (P = 30 - Q/50); D': Q = 1800 - 50P. SR: P = 12, q = 6. LR: P = 10, Q = 1300, n = 260.
  const g2m = EC.graph({
    w: 330, h: 260, x: [0, 1900], y: [0, 38], xl: 'Q', yl: 'P', xt: [1000, 1300], yt: [10, 12],
    items: [
      { f: (Q) => 30 - Q / 50, from: 0, to: 1500, lab: 'D', labX: 1450, dx: 2, dy: -4, anchor: 'bl' },
      { f: (Q) => 36 - Q / 50, from: 0, to: 1800, cls: 'c4', lab: "D'", labX: 1750, dx: 2, dy: -4, anchor: 'bl' },
      { f: (Q) => Q / 100, from: 0, to: 1900, cls: 'c2', lab: 'S_{SR}', labX: 1880, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 10], [1900, 10]], cls: 'curve c3 dash', lab: 'S_{LR}', at: 'end', dx: -2, dy: 14, anchor: 'tr' },
      { pt: [1000, 10], lab: 'E_0', at: 'bl' }, { pt: [1200, 12], lab: 'E_1', at: 'tl', guide: 'y' }, { pt: [1300, 10], lab: 'E_2', at: 'br' },
    ],
  });
  const g2f = EC.graph({
    w: 300, h: 240, x: [0, 10], y: [0, 20], xl: 'q', yl: '\\$', xt: [5, 6], yt: [10, 12],
    items: [
      { poly: [[0, 10.1667], [6, 10.1667], [6, 12], [0, 12]], cls: 'gain' },
      { f: (q) => 2 * q, from: 0, to: 10, cls: 'c5', lab: 'MC', labX: 9.6, dx: -6, dy: 0, anchor: 'r' },
      { f: (q) => q + 25 / q, from: 1.4, to: 10, lab: 'AC', labX: 10, dx: -2, dy: 10, anchor: 'tr' },
      { seg: [[0, 12], [10, 12]], cls: 'curve c4 dash' }, { seg: [[0, 10], [10, 10]], cls: 'curve c3 dash' },
      { pt: [5, 10], guide: 'x' }, { pt: [6, 12], guide: 'x' },
    ],
  });
  // (3) D: P = 14 - Q, S: P = 2 + Q. Q* = 6, P* = 8. A = CS 18, B = PS 18.
  const dQ = { f: (Q) => 14 - Q, from: 0, to: 13, lab: 'D', labX: 12.6, dx: 2, dy: -4, anchor: 'bl' };
  const sQ = { f: (Q) => 2 + Q, from: 0, to: 12.5, cls: 'c2', lab: 'S', labX: 12, dx: -4, dy: 0, anchor: 'r' };
  const g3 = EC.graph({
    w: 320, h: 250, x: [0, 13], y: [0, 15], xl: 'Q', yl: 'P', xt: [6], yt: [2, 8, 14],
    items: [
      { poly: [[0, 14], [6, 8], [0, 8]], cls: 'cs' }, { poly: [[0, 8], [6, 8], [0, 2]], cls: 'gain' },
      dQ, sQ, { pt: [6, 8], guide: true }, L(1.8, 10, 'A'), L(1.8, 6, 'B'),
    ],
  });
  // (4a) the same market held at Q = 4 (price 10 from demand). DWL = C + D = 4.
  const g4a = EC.graph({
    w: 320, h: 250, x: [0, 13], y: [0, 15], xl: 'Q', yl: 'P', xt: [4, 6], yt: [6, 8, 10],
    items: [
      { poly: [[0, 14], [4, 10], [0, 10]], cls: 'cs' },
      { poly: [[0, 8], [4, 8], [4, 10], [0, 10]], cls: 'gain' },
      { poly: [[0, 2], [4, 6], [4, 8], [0, 8]], cls: 'gain' },
      { poly: [[4, 10], [6, 8], [4, 8]], cls: 'loss' }, { poly: [[4, 8], [6, 8], [4, 6]], cls: 'loss' },
      dQ, sQ, { seg: [[4, 0], [4, 10]], cls: 'guide' }, { seg: [[0, 8], [6, 8]], cls: 'guide' },
      { pt: [4, 10], guide: 'y' }, { pt: [6, 8] },
      L(1.2, 11.2, 'A'), L(2, 9, 'B'), L(4.55, 8.6, 'C'), L(4.55, 7.3, 'D'), L(1.8, 5.8, 'E'),
    ],
  });
  // (4b) forced up to Q = 8 (price 6 from demand). DWL triangle between S above and D below, Q = 6 to 8.
  const g4b = EC.graph({
    w: 320, h: 250, x: [0, 13], y: [0, 15], xl: 'Q', yl: 'P', xt: [6, 8], yt: [6, 8, 10],
    items: [
      { poly: [[6, 8], [8, 10], [8, 6]], cls: 'loss' },
      dQ, sQ, { seg: [[8, 0], [8, 10]], cls: 'guide' },
      { pt: [8, 6], guide: 'y' }, { pt: [8, 10], guide: 'y' }, { pt: [6, 8] },
      { text: [9.6, 8.2], t: '\\text{DWL}', anchor: 'l' },
    ],
  });
  // (5)-(7) Qd = 200 - 5P, Qs = 5P: D P = 40 - Q/5, S P = Q/5. P* = 20, Q* = 100.
  const dT = { f: (Q) => 40 - Q / 5, from: 0, to: 200, lab: 'D', labX: 190, dx: 2, dy: -4, anchor: 'bl' };
  const sT = { f: (Q) => Q / 5, from: 0, to: 200, cls: 'c2', lab: 'S', labX: 195, dx: -4, dy: 0, anchor: 'r' };
  // (5) tax t = 8: Pc = 24, Pp = 16, Q = 80. A CS, B + C revenue, D DWL, E PS.
  const g5 = EC.graph({
    w: 330, h: 260, x: [0, 210], y: [0, 42], xl: 'Q', yl: 'P', xt: [80, 100], yt: [16, 20, 24],
    items: [
      { poly: [[0, 40], [80, 24], [0, 24]], cls: 'cs' },
      { poly: [[0, 20], [80, 20], [80, 24], [0, 24]], cls: 'ex' }, { poly: [[0, 16], [80, 16], [80, 20], [0, 20]], cls: 'ex' },
      { poly: [[80, 24], [100, 20], [80, 16]], cls: 'loss' }, { poly: [[0, 0], [80, 16], [0, 16]], cls: 'gain' },
      dT, sT, { seg: [[0, 20], [100, 20]], cls: 'guide' }, { seg: [[80, 0], [80, 24]], cls: 'guide' },
      { pt: [80, 24], lab: 'P_c', at: 'tr' }, { pt: [80, 16], lab: 'P_p', at: 'br' }, { pt: [100, 20] },
      L(22, 28, 'A'), L(40, 22, 'B'), L(40, 18, 'C'), L(87, 20, 'D'), L(22, 10, 'E'),
    ],
  });
  // (6) ceiling at 16: Qs = 80, Qd = 120, demand price at 80 = 24. DWL = D + E = 80.
  const g6 = EC.graph({
    w: 330, h: 260, x: [0, 210], y: [0, 42], xl: 'Q', yl: 'P', xt: [80, 100, 120], yt: [16, 20, 24],
    items: [
      { poly: [[0, 40], [80, 24], [0, 24]], cls: 'cs' }, { poly: [[0, 20], [80, 20], [80, 24], [0, 24]], cls: 'cs' },
      { poly: [[0, 16], [80, 16], [80, 20], [0, 20]], cls: 'ex' },
      { poly: [[80, 24], [100, 20], [80, 20]], cls: 'loss' }, { poly: [[80, 20], [100, 20], [80, 16]], cls: 'loss' },
      { poly: [[0, 0], [80, 16], [0, 16]], cls: 'gain' },
      dT, sT, { seg: [[0, 16], [150, 16]], cls: 'curve c5', lab: '\\text{ceiling}', at: 'end', dx: 2, dy: 4, anchor: 'l' },
      { seg: [[80, 0], [80, 24]], cls: 'guide' }, { pt: [80, 16] }, { pt: [120, 16] }, { pt: [80, 24] },
      L(20, 28.5, 'A'), L(40, 22, 'B'), L(40, 18, 'C'), L(86, 21.3, 'D'), L(86, 18.6, 'E'), L(22, 10, 'F'),
      { text: [100, 13.5], t: '\\text{shortage}' },
    ],
  });
  // (7) floor at 24: Qd = 80, Qs = 120. DWL = C + D = 80.
  const g7 = EC.graph({
    w: 330, h: 260, x: [0, 210], y: [0, 42], xl: 'Q', yl: 'P', xt: [80, 100, 120], yt: [16, 20, 24],
    items: [
      { poly: [[0, 40], [80, 24], [0, 24]], cls: 'cs' }, { poly: [[0, 20], [80, 20], [80, 24], [0, 24]], cls: 'gain' },
      { poly: [[80, 24], [100, 20], [80, 20]], cls: 'loss' }, { poly: [[80, 20], [100, 20], [80, 16]], cls: 'loss' },
      { poly: [[0, 0], [80, 16], [80, 20], [0, 20]], cls: 'gain' },
      dT, sT, { seg: [[0, 24], [150, 24]], cls: 'curve c5', lab: '\\text{floor}', at: 'end', dx: 2, dy: 4, anchor: 'l' },
      { seg: [[80, 0], [80, 24]], cls: 'guide' }, { pt: [80, 24] }, { pt: [120, 24] }, { pt: [80, 16] },
      L(20, 28.5, 'A'), L(40, 22, 'B'), L(86, 21.3, 'C'), L(86, 18.6, 'D'), L(30, 12, 'E'),
      { text: [100, 26.5], t: '\\text{excess supply}' },
    ],
  });
  // (7b) DS9 price support: Qd = 600 - 10P, Qs = 10P, support 45: consumers 150, producers 450, government 300.
  const g7b = EC.graph({
    w: 330, h: 260, x: [0, 620], y: [0, 64], xl: 'Q', yl: 'P', xt: [150, 300, 450], yt: [30, 45, 60],
    items: [
      { poly: [[150, 0], [450, 0], [450, 45], [150, 45]], cls: 'ex' },
      { poly: [[0, 60], [150, 45], [0, 45]], cls: 'cs' },
      { f: (Q) => 60 - Q / 10, from: 0, to: 600, lab: 'D', labX: 590, dx: 2, dy: -4, anchor: 'bl' },
      { f: (Q) => Q / 10, from: 0, to: 620, cls: 'c2', lab: 'S', labX: 600, dx: -4, dy: 0, anchor: 'r' },
      { seg: [[0, 45], [600, 45]], cls: 'curve c5', lab: '\\text{support}', at: 'end', dx: -2, dy: -6, anchor: 'br' },
      { pt: [150, 45] }, { pt: [450, 45] }, { pt: [300, 30], guide: true },
      L(40, 49, 'A'), L(380, 14, 'G'),
    ],
  });
  // (8) monopoly: P = 120 - Q, MC = Q, MR = 120 - 2Q. Qm = 40, Pm = 80, Qc = 60. A CS, B + E PS, C + D DWL.
  const g8 = EC.graph({
    w: 330, h: 270, x: [0, 130], y: [0, 130], xl: 'Q', yl: 'P', xt: [40, 60], yt: [40, 60, 80, 120],
    items: [
      { poly: [[0, 120], [40, 80], [0, 80]], cls: 'cs' }, { poly: [[0, 60], [40, 60], [40, 80], [0, 80]], cls: 'gain' },
      { poly: [[40, 80], [60, 60], [40, 60]], cls: 'loss' }, { poly: [[40, 60], [60, 60], [40, 40]], cls: 'loss' },
      { poly: [[0, 0], [40, 40], [40, 60], [0, 60]], cls: 'gain' },
      { f: (Q) => 120 - Q, from: 0, to: 120, lab: 'D', labX: 115, dx: 2, dy: -4, anchor: 'bl' },
      { f: (Q) => 120 - 2 * Q, from: 0, to: 60, cls: 'c4 dash', lab: 'MR', labX: 58, dx: 4, dy: 0, anchor: 'l' },
      { f: (Q) => Q, from: 0, to: 125, cls: 'c5', lab: 'MC', labX: 120, dx: -6, dy: 0, anchor: 'r' },
      { seg: [[0, 60], [60, 60]], cls: 'guide' },
      { pt: [40, 80], lab: 'P_m', at: 'tr', guide: 'x' }, { pt: [40, 40] }, { pt: [60, 60] },
      L(12, 90, 'A'), L(20, 70, 'B'), L(44.5, 66, 'C'), L(44.5, 55, 'D'), L(22, 40, 'E'),
    ],
  });
  // (9) natural monopoly: P = 28 - Q, C = 80 + 4Q (AC = 4 + 80/Q, MC = 4). M: (12, 16); A: (20, 8); K: (24, 4).
  const g9 = EC.graph({
    w: 330, h: 260, x: [0, 30], y: [0, 30], xl: 'Q', yl: 'P', xt: [12, 20, 24], yt: [4, 8, 16],
    items: [
      { poly: [[0, 4], [24, 4], [24, 4 + 80 / 24], [0, 4 + 80 / 24]], cls: 'ex' },
      { f: (Q) => 28 - Q, from: 0, to: 28, lab: 'D', labX: 8.5, dx: 4, dy: -4, anchor: 'bl' },
      { f: (Q) => 28 - 2 * Q, from: 0, to: 14, cls: 'c4 dash', lab: 'MR', labX: 13, dx: 4, dy: 0, anchor: 'l' },
      { f: (Q) => 4 + 80 / Q, from: 3.2, to: 30, lab: 'AC', labX: 29.5, dx: -2, dy: -6, anchor: 'br' },
      { seg: [[0, 4], [30, 4]], cls: 'curve c5', lab: 'MC', at: 'end', dx: -2, dy: 14, anchor: 'tr' },
      { pt: [12, 16], lab: 'M', at: 'tr', guide: true }, { pt: [20, 8], lab: 'A', at: 'tr', guide: true }, { pt: [24, 4], lab: 'K', at: 'tr' },
      L(10, 5.6, 'L'),
    ],
  });

  // ------------------------------------------------------------------ generators for m3-math (each asks for the plan first)
  gen('m3_math_invert', () => {
    const b = pick([2, 4, 5, 10]), s = pick([2, 4, 5, 10]), Pe = pick([10, 12, 15, 20, 24, 30]), k = pick([0, 0, 5, 10]);
    const Qe = s * Pe - k, A = Qe + b * Pe, choke = A / b, pmin = k / s;
    const CS = Qe * (choke - Pe) / 2, PS = Qe * (Pe - pmin) / 2;
    const qs = k ? `${s}P - ${k}` : `${s}P`;
    return {
      title: 'Equilibrium, inverse demand, and two triangles',
      q: md`Demand is $Q_d = ${A} - ${b}P$ and supply is $Q_s = ${qs}$. Find the equilibrium, write inverse demand, and compute CS and PS.`,
      plan: [
        plan('What is your first equation?', `$Q_d = Q_s$: $${A} - ${b}P = ${qs}$`, [
          [`Invert demand, then set $P = ${F(choke)} - Q/${b}$ equal to $${qs}$`, 'That sets a price equal to a quantity. Put both curves in the same form first.'],
          [`$${A} - ${b}P = 0$`, 'That finds the choke price, where nobody buys. Equilibrium needs supply too.'],
          ['Add the two curves', 'Adding demand and supply has no meaning. The market clears where they are **equal**.'],
        ], `Collect the $P$ terms: $${b + s}P = ${A + k}$, so $P^* = ${Pe}$.`),
        plan('CS is a triangle under demand. What is its height?', `The choke price minus $P^*$: $${F(choke)} - ${Pe}$`, [
          [`$${A} - ${Pe}$`, `${A} is the **quantity** intercept. The height is in dollars: invert demand to get the choke price.`],
          [`$P^* = ${Pe}$`, 'CS sits above the price, not down to zero.'],
          [`$${Pe} - ${F(pmin)}$`, 'That is the PS triangle’s height (price minus where supply starts).'],
        ], `Inverse demand: $P = ${F(choke)} - Q/${b}$. Choke price ${F(choke)}.`),
      ],
      parts: [N('P^*', Pe), N('Q^*', Qe), X('P(Q)\\text{, inverse demand}', `(${A} - Q)/${b}`, { Q: [1, Qe] }), N('CS', CS), N('PS', PS)],
      hints: [`$${A} - ${b}P = ${qs} \\Rightarrow ${b + s}P = ${A + k}$.`, `Supply starts at $P = ${F(pmin)}$ (set $Q_s = 0$).`],
      sol: md`
        **Move 1: $Q_d = Q_s$.**
        $$${A} - ${b}P = ${qs} \;\Rightarrow\; ${A + k} = ${b + s}P \;\Rightarrow\; P^* = ${Pe}$$
        $Q^* = ${s}(${Pe})${k ? ` - ${k}` : ''} = ${Qe}$.

        **Move 2: invert demand.** $${b}P = ${A} - Q$, so $P = \dfrac{${A} - Q}{${b}} = ${F(choke)} - \dfrac{Q}{${b}}$. Choke price ${F(choke)}.

        **Move 3: the triangles.** Supply starts at $P = ${F(pmin)}$.
        $$CS = \tfrac12(${Qe})(${F(choke)} - ${Pe}) = ${F(CS)}, \qquad PS = \tfrac12(${Qe})(${Pe} - ${F(pmin)}) = ${F(PS)}$$
      `,
    };
  });

  gen('m3_math_minavg', () => {
    const a = pick([0.5, 1, 2, 3, 5]), q = pick([2, 3, 4, 5, 6, 8, 10]), c = pick([0, 2, 4, 10]);
    const Fx = a * q * q, minAC = c + 2 * a * q, n = pick([20, 50, 100, 200]), e = pick([2, 5, 10]);
    const Q = n * q, D = Q + e * minAC;
    const aq = a === 1 ? '' : F(a);
    const lrc = `${Fx}${c ? ` + ${c}q` : ''} + ${aq}q^2`;
    const lrmc = `${c ? `${c} + ` : ''}${F(2 * a)}q`, lrac = `${c ? `${c} + ` : ''}${aq}q + \\dfrac{${Fx}}{q}`;
    return {
      title: 'The bottom of LRAC, then the number of firms',
      q: md`Identical competitive firms have long-run cost $LRC(q) = ${lrc}$. Market demand is $Q = ${D} - ${e}P$, with free entry and exit. Find each firm's output, the long-run price, and the number of firms.`,
      plan: [
        plan('Which equation finds the long-run price?', `$LRMC = LRAC$: the bottom of LRAC`, [
          ['$LRMC = 0$', 'That is not a cost-curve landmark that matters. Free entry drives the price to the **bottom of LRAC**.'],
          ['Set LRAC equal to the demand curve', 'Demand sets only how much is sold at the long-run price; the price itself comes from costs.'],
          ['$P = LRMC$ with the price from demand', 'There is no price yet: with free entry it is pinned at min LRAC.'],
        ], `$${lrmc} = ${lrac}$. Cancel what matches and solve for $q$.`),
        plan(`You reach $q^2 = ${q * q}$. Which $q$ do you keep?`, `$q = ${q}$`, [
          [`$q = -${q}$`, 'Output cannot be negative.'],
          [`$q = ${q * q}$`, 'You still need the square root.'],
          ['Both: the firm can pick either', 'Only the positive root is an output.'],
        ], `$q^* = ${q}$; the long-run price is $LRAC(${q})$.`),
        plan('Once you have the price, how do you get the number of firms?', '$Q$ from demand at that price, then $n = Q/q^*$', [
          ['$n = Q/P$', 'Divide market output by output **per firm**.'],
          ['$n = q^*/Q$', 'Upside down: many small firms make up the market.'],
          ['Set one firm’s output equal to demand', 'One firm makes only $q^*$; the market needs many of them.'],
        ], `$Q = ${D} - ${e}(${F(minAC)})$, then divide by ${q}.`),
      ],
      parts: [N('q^*', q), N('P_{LR}', minAC), N('Q', Q), N('n', n)],
      hints: [`$${aq}q = \\dfrac{${Fx}}{q}$ after canceling.`, `$Q = ${D} - ${e} \\times ${F(minAC)}$.`],
      sol: md`
        **Move 1: the curves.** $LRAC = \dfrac{LRC}{q} = ${lrac}$, $LRMC = \dfrac{dLRC}{dq} = ${lrmc}$.

        **Move 2: bottom of LRAC, $LRMC = LRAC$.**
        $$${lrmc} = ${lrac} \;\Rightarrow\; ${aq}q = \frac{${Fx}}{q} \;\Rightarrow\; q^2 = ${q * q} \;\Rightarrow\; q^* = ${q}$$

        **Move 3: long-run price** $= LRAC(${q}) = ${c ? `${c} + ` : ''}${F(a * q)} + ${F(Fx / q)} = ${F(minAC)}$.

        **Move 4: market quantity** from demand at that price: $Q = ${D} - ${e}(${F(minAC)}) = ${Q}$.

        **Move 5: number of firms** $n = Q/q^* = ${Q}/${q} = ${n}$.
      `,
    };
  });

  gen('m3_math_root', () => {
    const r1 = pick([2, 3, 4, 5, 6]), r2 = r1 + pick([4, 6, 8, 10, 12]), c = pick([2, 4, 5, 6, 10]);
    const s = r1 + r2, Fx = r1 * r2, a = c + s, Pac = c + r1, dwl = r1 * r1 / 2;
    return {
      title: 'Average-cost pricing: the quadratic and the root',
      q: md`A natural monopoly faces $P = ${a} - Q$ and has $C(Q) = ${Fx} + ${c}Q$. Regulators set the price equal to average cost. Find the regulated quantity and price, the firm's profit if regulators had instead set $P = MC$, and the DWL that remains under average-cost pricing.`,
      plan: [
        plan('Which equation gives the average-cost-pricing quantity?', `$${a} - Q = ${c} + \\dfrac{${Fx}}{Q}$: the price on demand equals AC`, [
          [`$${a} - Q = ${c}$`, 'That is marginal-cost pricing: efficient, but the firm loses its fixed cost.'],
          [`$${a} - 2Q = ${c} + \\dfrac{${Fx}}{Q}$`, 'The regulator sets the price **buyers pay**, which is on demand, not on MR.'],
          [`$${a} - 2Q = ${c}$`, 'That is the unregulated monopoly choice, $MR = MC$.'],
        ], `Multiply by $Q$ and collect: $Q^2 - ${s}Q + ${Fx} = 0$.`),
        plan(`The quadratic $Q^2 - ${s}Q + ${Fx} = 0$ has roots ${r1} and ${r2}. Which do you keep?`, `$Q = ${r2}$, the larger root`, [
          [`$Q = ${r1}$`, 'Both roots give zero profit, but the larger one has a lower price and more output, so it is the one the regulator wants.'],
          [`The average of the roots, ${F(s / 2)}`, `That is the unregulated monopoly output ($MR = MC$), not a solution of this equation.`],
          ['Either: both give zero profit', 'Both break even, but only the larger root is the lower-price, lower-DWL outcome.'],
        ], `$Q = ${r2}$, $P = ${a} - ${r2} = ${Pac}$.`),
      ],
      parts: [N('Q_{AC}', r2), N('P_{AC}', Pac), N('\\pi\\text{ under }P = MC', -Fx), N('\\text{DWL under }P = AC', dwl)],
      hints: [`$(${a} - Q)Q = ${c}Q + ${Fx}$.`, `Under $P = MC$: $P = ${c}$, $Q = ${s}$, $\\pi = ${c}(${s}) - [${Fx} + ${c}(${s})]$.`],
      sol: md`
        **Move 1: $P(Q) = AC(Q)$.** $AC = ${c} + \dfrac{${Fx}}{Q}$. Set it equal to demand and multiply by $Q$:
        $$${a}Q - Q^2 = ${c}Q + ${Fx} \;\Rightarrow\; Q^2 - ${s}Q + ${Fx} = 0$$

        **Move 2: quadratic formula.**
        $$Q = \frac{${s} \pm \sqrt{${s * s} - ${4 * Fx}}}{2} = \frac{${s} \pm ${r2 - r1}}{2} = ${r2} \text{ or } ${r1}$$
        Keep the larger root: $Q_{AC} = ${r2}$, $P_{AC} = ${a} - ${r2} = ${Pac}$. Check: $AC(${r2}) = ${c} + ${Fx}/${r2} = ${Pac}$ ✓, so profit is zero.

        **Move 3: $P = MC$ instead.** $${a} - Q = ${c} \Rightarrow Q = ${s}$, $P = ${c}$. $\pi = ${c}(${s}) - [${Fx} + ${c}(${s})] = -${Fx}$: the whole fixed cost is lost.

        **Move 4: DWL under AC pricing.** The efficient quantity is ${s}. The triangle runs from ${r2} to ${s}, between demand and MC:
        $$\text{DWL} = \tfrac12(${s} - ${r2})(${Pac} - ${c}) = \tfrac12(${r1})(${r1}) = ${F(dwl)}$$
      `,
    };
  });

  // ------------------------------------------------------------------ the unit
  C.unit({
    id: 'm3s', exam: 'm3', num: 'Start here', title: 'Read the problem first',
    blurb: 'one idea behind every problem, the problem-type map, every graph and area, the math moves',
    lessons: [
      // ================================================================ m3-read
      {
        id: 'm3-read', title: 'The one idea behind every Exam 3 problem', ref: 'Lectures 14–19 · DS8–DS10',
        steps: [
          R(md`
            ### What this looks like on the exam

            Exam 3 looks like eight different topics. It is one idea used eight ways.

            | The problem says… | It is really asking… | The comparison |
            |---|---|---|
            | "how much does the competitive firm produce?" | Should it make one more unit? | price vs $MC$ |
            | "how many workers does the firm hire?" | Should it hire one more worker? | $p \cdot MP_1$ vs $w_1$ |
            | "will the firm shut down?" | Does revenue cover the costs it could still avoid? | $P$ vs $\min AVC$ |
            | "will firms enter or exit?" | Does revenue cover **all** costs? | $P$ vs $\min LRAC$ |
            | "what is the efficient quantity? the DWL?" | Is the next unit worth more to buyers than it costs to make? | $MB$ vs $MC$ |
            | "a per-unit tax of \$t" | How far apart are what buyers pay and what sellers keep? | $P_c - P_p = t$ |
            | "a price ceiling / floor" | Which side of the market is short? | $Q_d$ vs $Q_s$ at the legal price |
            | "a monopolist chooses…" | Does the next unit add more revenue than cost? | $MR$ vs $MC$ |

            If you can say which comparison a problem is about, you know the first equation.
          `),
          RF(md`
            ### The one idea: the next unit

            You run a food truck. Pita sandwiches sell for \$8. You have made 5 today. Should you make a 6th?

            Do not think about averages or totals. Think only about **the 6th sandwich**:

            - What does it bring in? \$8.
            - What does it cost to make? Its **marginal cost**, $MC$. Say $MC = 2 + q$, so the 6th costs about \$8 and the 3rd cost about \$5.

            If the next unit brings in more than it costs, make it: profit goes up by the difference. If it brings in less, don't. So you keep going while benefit is above cost, and you stop **where they are equal**.

            $$\text{benefit of the next unit} = \text{cost of the next unit}$$

            Here: $8 = 2 + q$, so $q = 6$.

            [[fig:nu]]

            Every unit to the left of $q = 6$ brings in more than it costs (green). Every unit to the right costs more than it brings in (red). Stopping at 6 collects all the green and none of the red.
          `, { nu: { svg: nextUnitFig, cap: 'Green: units whose price exceeds their marginal cost; each adds profit. Red: units past q = 6, each loses money. Profit is largest at P = MC.' } }),
          R(md`
            ### Why "the next unit" and not "the average"

            Your decision is always about **one more** or **one less**. The average includes units you have already decided on; it cannot tell you whether to add the next one.

            That is why the exam rewards one habit above all: **name the benefit of the next unit, name its cost, set them equal.** The words change from topic to topic. The idea does not.

            !!key The universal recipe
              1. Name the decision: one more unit of **what** (output, a worker, a firm, a unit of trade)?
              2. Name the benefit of that one unit and the cost of that one unit.
              3. Keep going while benefit > cost. Stop where benefit = cost.
          `),
          R(md`
            ### Every topic is one instance

            | Topic | Benefit of the next unit | Cost of the next unit | The equation |
            |---|---|---|---|
            | Competitive output (Part 8) | the price $P$ (a price taker gets $P$ for every unit, so $MR = P$) | $MC(q)$ | $P = MC$ |
            | Input choice (Part 7) | $p \cdot MP_1$: the extra output times its price | the wage $w_1$ | $p\,MP_1 = w_1$ |
            | Shutdown, short run (Part 8) | revenue per unit, $P$ | the cost per unit you can still avoid, $AVC$ | operate if $P \ge \min AVC$ |
            | Entry and exit, long run (Part 9) | revenue per unit, $P$ | all cost per unit, $LRAC$ | enter if $P > \min LRAC$; exit if $P < \min LRAC$ |
            | Efficiency (Part 9) | what buyers would pay, $MB$ = height of demand | what it costs society, $MC$ = height of supply | efficient where $MB = MC$ |
            | Per-unit tax (Part 10) | buyers pay $P_c$ | sellers must keep $P_p$ to supply | $P_c - P_p = t$ |
            | Ceiling or floor (Part 10) | buyers want $Q_d$ at the legal price | sellers want $Q_s$ at the legal price | the short side trades: the smaller of $Q_d$, $Q_s$ |
            | Monopoly (Part 11) | $MR$: the price **minus** the price cut on every other unit | $MC$ | $MR = MC$, then $P$ from demand |
            | Regulation (Part 12) | buyers' value of the next unit, $P(Q)$ | the firm's $MC$, or its $AC$ if it must break even | $P = MC$ (efficient) or $P = AC$ (zero profit) |

            Read the table one row at a time below. Each row is a full Part of the course, but each is the same sentence.
          `),
          R(md`
            ### Row by row

            **Competitive output: $P = MC$.** A price taker sells every unit at $P$. One more unit adds $P$ to revenue and $MC$ to cost. Stop at $P = MC$, on the **rising** part of MC.

            **Input choice: $p\,MP_1 = w_1$.** Same question, asked about a worker instead of a sandwich. One more worker makes $MP_1$ more sandwiches, each sold at $p$: the benefit is $p \cdot MP_1$. The cost is the wage $w_1$. Hire while $p\,MP_1 > w_1$.

            **Shutdown: $P$ vs $\min AVC$.** Now the decision is "produce at all, or produce zero?" In the short run the fixed cost $F$ is paid either way, so it is not a cost **of producing**. Producing is worth it if revenue covers the costs you could still avoid: price at least min AVC.

            **Entry and exit: $P$ vs $\min LRAC$.** In the long run nothing is fixed. A firm stays (or enters) only if price covers **every** cost. Entry pushes the price down and exit pushes it up until $P = \min LRAC$, where profit is zero.

            **Efficiency: $MB = MC$.** Society's version. The height of the demand curve is what a buyer would pay for the next unit: its marginal benefit. The height of the supply curve is the marginal cost. If $MB > MC$, one more unit adds $MB - MC$ to total surplus. The efficient quantity is where they meet, and **deadweight loss is the total of $MB - MC$ over the units that should be made but are not (or the reverse)**.
          `),
          RF(md`
            [[fig:mb]]

            At $Q = 4$ the next unit is worth \$10 to a buyer and costs \$6 to make. Making it adds \$4 of surplus. Not making it loses \$4. Add up those gaps from $Q = 4$ to $Q = 6$ and you get the red triangle: the deadweight loss.

            **Per-unit tax: a wedge.** A tax of $t$ per unit means the buyer pays $P_c$ and the seller keeps $P_p = P_c - t$. Trades happen only while $MB - MC \ge t$. Units with a gain smaller than $t$ stop happening: that is the DWL.

            **Ceilings and floors: the short side trades.** Nobody can be forced to buy or sell. At a ceiling below equilibrium sellers want less than buyers: $Q = Q_s$. At a floor above equilibrium buyers want less: $Q = Q_d$.

            **Monopoly: $MR = MC$.** A monopolist is the whole market. To sell one more unit it must **lower the price on all its units**. So the next unit brings in its price, minus the price cut on everything else: $MR < P$. It stops at $MR = MC$, which is before $P = MC$. That gap is why monopoly has a DWL.
          `, { mb: { svg: mbmcFig, cap: 'Demand is the marginal benefit of each unit; supply is its marginal cost. Units 4 to 6 have MB above MC: leaving them out loses the red triangle.' } }),
          R(md`
            !!intuition Does this make sense? Check the signs
              - If $P > MC$ at your output, you are making **too little**: one more unit adds profit.
              - If $p\,MP_1 < w_1$, you hired **too many** workers: the last one costs more than he adds.
              - If $MR > MC$, a monopolist should **produce more** (and charge less).
              - If $MB > MC$ at the market quantity, the market makes **too little**: DWL from underproduction.

            !!trap The two comparisons that are NOT about the next unit
              Shutdown and entry/exit are "all or nothing" decisions: produce something or nothing, be in the market or out. They compare price with an **average** ($AVC$, $LRAC$). How much to produce once you are in is always a marginal comparison ($P = MC$ or $MR = MC$).
          `),
          Q(md`A competitive firm is producing an output where $P = \$10$ and $MC = \$7$. To raise profit it should…`, ['produce more', 'produce less', 'stay where it is', 'raise its price'], 0,
            [null, 'Each extra unit brings in \\$10 and costs only \\$7: cutting back gives up \\$3 per unit.', 'Only when the next unit brings in exactly what it costs.', 'A price taker sells nothing above the market price.'],
            md`The next unit adds $10 - 7 = \$3$ to profit. Keep going until MC rises to \$10.`),
          Q(md`A farm pays \$120 a day per worker. The last worker hired adds 20 bushels a day, and wheat sells for \$5 a bushel. The farm should…`, ['hire fewer workers', 'hire more workers', 'keep this number', 'raise the wage'], 0,
            [null, 'The last worker adds $5 \\times 20 = \\$100$ of output but costs \\$120: he loses money.', 'Only if $p\\,MP_1$ were above the wage.', 'The input price is set by the market, not the farm.'],
            md`$p\,MP_1 = 5 \times 20 = 100 < w_1 = 120$. Fewer workers raises $MP_1$ (diminishing returns) until $p\,MP_1 = 120$.`),
          Q(md`Why does the short-run shutdown test use $AVC$ and not $AC$?`, ['the fixed cost is paid whether or not the firm produces', 'AVC is always larger than AC', 'AC does not exist in the short run', 'the formula sheet lists AVC first'], 0,
            [null, 'AC is AVC plus AFC, so AC is the larger one.', 'AC exists; it just includes the fixed cost.', 'The reason is economic: only avoidable costs matter for a choice.'],
            md`A cost you pay either way cannot change which choice is better. Only the costs you can still avoid, the variable ones, enter "produce or shut down".`),
          Q(md`A monopolist's next unit sells for \$30. Its marginal revenue is…`, ['less than \\$30', 'exactly \\$30', 'more than \\$30', 'zero'], 0,
            [null, 'That is true for a price taker only. The monopolist must cut the price on all its other units to sell this one.', 'Selling more never raises the price along a downward demand curve.', 'Only at the revenue-maximizing output (the unit-elastic point).'],
            md`$MR = P + Q\,\dfrac{dP}{dQ}$. The second term is negative: the price cut times all the units already sold.`),
          Q(md`In a market, at the current quantity the demand curve is at \$25 and the supply curve is at \$15. Which is true?`, ['one more unit would add \\$10 to total surplus', 'the market is producing too much', 'the market is efficient', 'one more unit would cost society \\$25'], 0,
            [null, 'Too much would mean MC above MB at the margin.', 'Efficient needs the two heights equal.', 'The supply curve says the next unit costs \\$15.'],
            md`$MB = 25$ (height of demand), $MC = 15$ (height of supply). The next unit adds $25 - 15 = 10$. Too little is being produced: there is a DWL.`),
          Q(md`Price is \$12, min AVC is \$9 and min LRAC is \$14. In the long run, firms in this market…`, ['exit', 'enter', 'stay; profit is zero', 'shut down immediately'], 0,
            [null, 'Entry needs $P > \\min LRAC$.', 'Zero profit needs $P = \\min LRAC$.', 'In the short run they operate: price covers AVC. Shutdown is the short-run test.'],
            md`Long run: compare with min LRAC. $12 < 14$, so firms lose money and leave; exit raises the price toward \$14.`),
          Q(md`A binding price ceiling is set below the equilibrium price. The quantity actually traded is…`, ['quantity supplied at the ceiling', 'quantity demanded at the ceiling', 'the old equilibrium quantity', 'the average of $Q_d$ and $Q_s$'], 0,
            [null, 'Buyers want that much, but sellers will not supply it at the low price.', 'The price changed, so the quantity changed.', 'Trades need a willing buyer **and** a willing seller: the smaller one wins.'],
            md`Nobody can be forced to sell. Below equilibrium sellers are the short side: $Q = Q_s(\text{ceiling})$.`),
          Q(md`After a \$2 per-unit tax, buyers pay \$21. Sellers keep…`, ['\\$19', '\\$21', '\\$23', '\\$20'], 0,
            [null, 'The tax goes to the government; sellers keep less than buyers pay.', 'That would add the tax on top again.', 'That was the price before the tax.'],
            md`The wedge: $P_p = P_c - t = 21 - 2 = 19$.`),
          R(md`
            ### Spot it: name the comparison

            No numbers to compute. Read, decide which comparison the problem is about, then check.
          `),
          P({ q: md`A bakery sells bread at the market price of \$3 a loaf. At its current output the 50th loaf costs \$2.40 to bake. The owner asks whether to bake more.`,
            plan: plan('What do you compare?', 'The price \\$3 with the marginal cost \\$2.40', [
              ['The price with average cost', 'Average cost tells you about profit **level**, not whether the next loaf pays.'],
              ['Marginal revenue below \\$3 with MC', 'A price-taking bakery gets \\$3 for every loaf: $MR = P$.'],
              ['The price with AVC', 'That is the shutdown test, "bake anything at all?". The question is about **one more** loaf.'],
            ], '$P = 3 > MC = 2.40$: the next loaf adds \\$0.60. Bake more, until MC rises to \\$3.') }),
          P({ q: md`A monopolist's marginal revenue at its current output is \$12 and its marginal cost is \$15.`,
            plan: plan('What should it do?', 'Produce less (and so charge more)', [
              ['Produce more', 'The last unit brought in \\$12 and cost \\$15: it lost \\$3.'],
              ['Nothing: set $P = MC$', 'A monopolist maximizes profit where $MR = MC$, not $P = MC$.'],
              ['Cut its price', 'Cutting price means selling more, and the marginal units already lose money.'],
            ], '$MR < MC$: the last unit loses \\$3. Cut output until MR rises to meet MC; the price rises along demand.') }),
          P({ q: md`A classmate says: "A monopolist should produce where its price equals marginal cost, like any firm."`,
            plan: plan('What is wrong?', 'The monopolist’s next unit brings in $MR$, which is less than $P$', [
              ['Nothing: every firm sets $P = MC$', 'Only a price taker has $MR = P$. A monopolist must lower its price to sell more.'],
              ['It should set $P = AC$', 'That is a regulator’s rule (zero profit), not the profit-maximizing choice.'],
              ['It should maximize revenue: $MR = 0$', 'That ignores cost. With positive MC the best output is lower, where $MR = MC$.'],
            ], 'Benefit of the next unit is $MR = P + Q\\,dP/dQ < P$. Stop at $MR = MC$, then read the price off demand.') }),
          P({ q: md`A market's demand curve is at \$40 and its supply curve at \$52 at the current quantity (a subsidy pushed output up).`,
            plan: plan('What does this tell you?', 'Too much is produced: the last units cost more than they are worth, a DWL', [
              ['Too little is produced', 'That would need demand **above** supply at the margin.'],
              ['The market is efficient because more is traded', 'More is not better: each extra unit here costs \\$52 and is worth \\$40.'],
              ['Nothing without the tax revenue', 'Efficiency is about $MB$ vs $MC$ at the margin; transfers do not change it.'],
            ], '$MC = 52 > MB = 40$: each unit past the efficient point destroys \\$12 at the margin. DWL is the triangle of those gaps.') }),
          P({ q: md`Wheat sells for \$5 a bushel. Hiring one more worker at \$90 a day adds 22 bushels a day.`,
            plan: plan('Hire the worker?', 'Yes: $p\\,MP_1 = 5 \\times 22 = 110 > 90$', [
              ['No: 22 bushels is less than \\$90', 'You must turn bushels into dollars first: multiply by the price.'],
              ['Yes, as long as average product is above 22', 'Average product does not decide; the extra bushels of **this** worker do.'],
              ['Only if profit is positive', 'Profit level does not decide whether the next worker pays for himself.'],
            ], 'Benefit $= p \\cdot MP_1 = 110$, cost $= w_1 = 90$. Hire, and keep hiring until $p\\,MP_1$ falls to 90.') }),
          P({ q: md`A firm's price is \$18. Its min AVC is \$14 and min AC is \$25. A classmate says, "It loses money, so it shuts down today."`,
            plan: plan('Is the classmate right?', 'No: in the short run it operates, because $P \\ge \\min AVC$', [
              ['Yes: $P < \\min AC$ means shut down', '$P < \\min AC$ means a loss. Shutdown is about $AVC$, since the fixed cost is paid either way.'],
              ['Yes, but only in the long run', 'Long run is "exit", a different word and a different test ($\\min LRAC$). Today it operates.'],
              ['No: it earns a profit', 'At 18, below min AC, it does lose money.'],
            ], 'Short run: $18 \\ge 14$, so produce at $P = MC$; the loss is smaller than $F$. Long run: it exits unless the price rises.') }),
          R(md`
            ### Practice: plan first, then numbers
          `),
          P({ title: 'The food truck', q: md`Your food truck's cost is $C(q) = 10 + 2q + 0.5q^2$. Pitas sell for \$8. How many do you make, and what is your profit?`,
            plan: [
              plan('What is your first equation?', '$8 = MC = 2 + q$', [
                ['$8 = AC = 10/q + 2 + 0.5q$', 'That is where profit is zero, not where it is largest.'],
                ['$8 = 2 + 0.5q$', 'The derivative of $0.5q^2$ is $2 \\times 0.5q = q$, not $0.5q$: bring the exponent down.'],
                ['$MR = 8 - q$', 'A price taker gets \\$8 for every pita: $MR = 8$ exactly.'],
              ], 'Differentiate: $MC = 2 + q$. Set $8 = 2 + q$.'),
            ],
            parts: [N('q^*', 6), N('\\pi', 8)],
            sol: md`
              **Move 1: $P = MC$.** $MC = \dfrac{dC}{dq} = 2 + q$.
              $$8 = 2 + q \;\Rightarrow\; q^* = 6$$

              **Move 2: profit.** $TR = 8 \times 6 = 48$. $TC = 10 + 2(6) + 0.5(36) = 10 + 12 + 18 = 40$.
              $$\pi = 48 - 40 = 8$$
              Check: $AC = 40/6 = 6.67 < 8$, so profit is positive. ✓
            ` }),
          P({ title: 'How many workers?', q: md`A firm's short-run production is $q = 6\sqrt{x_1}$ (capital is fixed, costing \$20). Output sells for $p = \$10$ and labor costs $w_1 = \$15$ per unit. Find $x_1^*$, $q^*$ and profit.`,
            plan: [
              plan('What is your first equation?', '$p\\,MP_1 = w_1$, with $MP_1 = \\dfrac{3}{\\sqrt{x_1}}$', [
                ['$MP_1 = w_1$', 'You compare dollars with dollars: $MP_1$ is in units of output, so multiply by the price $p$.'],
                ['$P = MC$ with $MC = 15$', 'The wage is the cost of one more worker, not of one more unit of output.'],
                ['$p\\,q = w_1 x_1$', 'That sets revenue equal to labor cost (a break-even idea), not the marginal condition.'],
              ], '$MP_1 = \\partial q/\\partial x_1 = 6 \\cdot \\tfrac12 x_1^{-1/2} = 3/\\sqrt{x_1}$. Set $10 \\cdot 3/\\sqrt{x_1} = 15$.'),
            ],
            parts: [N('x_1^*', 4), N('q^*', 12), N('\\pi', 40)],
            sol: md`
              **Move 1: marginal product.** $q = 6x_1^{1/2}$, so
              $$MP_1 = 6 \cdot \tfrac12 x_1^{-1/2} = \frac{3}{\sqrt{x_1}}$$

              **Move 2: $p\,MP_1 = w_1$.**
              $$10 \cdot \frac{3}{\sqrt{x_1}} = 15 \;\Rightarrow\; \sqrt{x_1} = \frac{30}{15} = 2 \;\Rightarrow\; x_1^* = 4$$

              **Move 3: output and profit.** $q^* = 6\sqrt4 = 12$. $\pi = 10(12) - 15(4) - 20 = 120 - 60 - 20 = 40$.
            ` }),
          P({ title: 'Monopoly versus the efficient output', q: md`A monopolist faces $P = 40 - 2Q$ and has constant $MC = 8$. Find its output and price. How much would a competitive market (or a planner) produce?`,
            plan: [
              plan('What is the monopolist’s first equation?', '$MR = MC$, with $MR = 40 - 4Q$', [
                ['$P = MC$: $40 - 2Q = 8$', 'That is the efficient (competitive) output, not the monopoly choice.'],
                ['$MR = 40 - 2Q$', 'That is the demand curve. Linear MR has **twice** the slope: $40 - 4Q$.'],
                ['$P = AC$', 'That is a regulator’s zero-profit rule.'],
              ], '$40 - 4Q = 8 \\Rightarrow Q = 8$, then the price from demand.'),
              plan('Once you have $Q_m$, where do you get the price?', 'Plug $Q_m$ into demand: $P = 40 - 2Q_m$', [
                ['Plug $Q_m$ into MR', 'MR at $Q_m$ equals MC (8). The price buyers pay is on the **demand** curve.'],
                ['The price is $MC = 8$', 'That is the competitive price, not what a monopolist charges.'],
                ['Average MR and demand', 'The price is read straight off demand.'],
              ], '$P = 40 - 2(8) = 24$. For the efficient output set $P = MC$: $40 - 2Q = 8$.'),
            ],
            parts: [N('Q_m', 8), N('P_m', 24), N('Q_{\\text{efficient}}', 16)],
            sol: md`
              **Move 1: $MR = MC$.** Linear demand $P = 40 - 2Q$ has $MR = 40 - 4Q$.
              $$40 - 4Q = 8 \;\Rightarrow\; 4Q = 32 \;\Rightarrow\; Q_m = 8$$

              **Move 2: price from demand.** $P_m = 40 - 2(8) = 24$.

              **Move 3: the benchmark, $P = MC$.** $40 - 2Q = 8 \Rightarrow Q = 16$.

              Does this make sense? The monopolist makes half the efficient output and charges \$24 against a cost of \$8. Units 8 to 16 are worth more than \$8 to buyers but are not made: that is the monopoly DWL, $\tfrac12(16 - 8)(24 - 8) = 64$.
            ` }),
        ],
      },
      // ================================================================ m3-map
      {
        id: 'm3-map', title: 'The problem-type map: what the problem says → what you do', ref: 'Lectures 14–19 · DS8–DS10 · formula sheet',
        steps: [
          R(md`
            ### How to use this page

            Every exam problem has a few **trigger words** that tell you which technique it wants. This page is the master list. For each trigger: the first equation to write, what you do next, and the trap that costs points.

            Read a problem once, underline the trigger, find it here. After a week of this you will not need the page: you will see "free entry" and write $P = \min LRAC$ before you finish reading.

            The tables are long on purpose. Skim the left column first; read the rest when a trigger is unfamiliar.
          `),
          R(md`
            ### Part 7–8: one competitive firm

            | The problem says… | First equation | Then | The trap |
            |---|---|---|---|
            | "price taker", "perfectly competitive firm", "market price is \$P" | $MR = P$ (every unit sells at $P$) | output from $P = MC$ | writing MR below price (that is monopoly) |
            | "cost function $C(q) = \ldots$, price \$P", "how much does it produce?" | $P = MC$, $MC = dC/dq$ | shutdown check, then $\pi = Pq - C(q)$ | $P = AC$ (that is break-even) |
            | MC is a parabola and $P = MC$ has two roots | take the **larger** root | it is on the rising branch | the small root is a profit minimum |
            | "shutdown price", "supplies zero below…" | $\min AVC$: set $MC = AVC$ | shutdown price $= AVC$ there | using AC; including the fixed cost |
            | "break even", "zero economic profit", "lowest price with no loss" | $\min AC$: set $MC = AC$ | break-even price $= AC$ there | using AVC |
            | "operating at a loss", "should it stay open?" | compare $P$ with $\min AVC$ | open if $P \ge \min AVC$; loss is smaller than $F$ | "any loss means close" |
            | "at what price does it supply $q$ units?" | $P = MC(q)$ | check $P \ge \min AVC$ | plugging $q$ into AC |
            | "shade total revenue, total cost, profit" | $q^*$ from $P = MC$ | TR $= P \cdot q^*$, TC $= AC(q^*) \cdot q^*$, $\pi$ = the strip between | using MC for the TC height |
            | "accounting vs economic profit", "forgone wage", "could have rented it out" | economic $=$ accounting $-$ implicit costs | zero economic profit = as good as the next-best use | forgetting implicit costs |
            | "production function $q = f(x_1, \bar x_2)$", "$p$, $w_1$, $w_2$" | $p\,MP_1 = w_1$, $MP_1 = \partial f/\partial x_1$ | $q = f(x_1^*, \bar x_2)$, $\pi = pq - w_1x_1 - w_2\bar x_2$ | $MP_1 = w_1$ (forgot $p$); forgot the fixed input cost |
            | "isoprofit line", "slope of the isoprofit line" | $q = \dfrac{w_1}{p}x_1 + \dfrac{\pi + w_2\bar x_2}{p}$ | slope $w_1/p$; best plan where it is tangent to $f$ | slope $p/w_1$ (upside down) |
            | "the wage rises", "the output price rises" | slope $w_1/p$ changes | steeper: less $x_1$, less $q$; flatter: more | moving the intercept only |
            | "long run, both inputs vary" | $p\,MP_1 = w_1$ **and** $p\,MP_2 = w_2$ | dividing gives $MRTS = w_1/w_2$: cost minimization | thinking profit max and cost min disagree |
            | "returns to scale" and profit | DRS: one best scale; IRS: no finite optimum | CRS: depends on $P$ vs $LRAC$ | assuming every firm has a finite best size |
          `),
          R(md`
            ### Part 8: market supply

            | The problem says… | First equation | Then | The trap |
            |---|---|---|---|
            | "two firms with inverse supply $P = \ldots$", "market supply" | invert each to $q = \ldots$ | add quantities at one price; invert back | adding the inverse supplies (adds prices) |
            | "firm B sells nothing below \$5" | market supply is **piecewise** | kink at \$5: there the curve gets flatter | one formula for all prices |
            | "$n$ identical firms, each with $C(q) = \ldots$" | one firm: $q(P)$ from $P = MC$ | $Q^S = n\,q(P)$, then $Q^S = Q^D$, then $q = Q/n$ | setting demand equal to one firm's MC |
            | "find equilibrium price, market quantity, output per firm" | $Q^S(P) = Q^D(P)$ | $Q$ from either curve, $q = Q/n$ | dividing by the wrong $n$ |
            | "direct" vs "inverse" supply | direct: $q = \ldots$; inverse: $P = \ldots$ | switch by solving for the other letter | mixing them in one sum |
          `),
          R(md`
            ### Part 9: long run, surplus, efficiency

            | The problem says… | First equation | Then | The trap |
            |---|---|---|---|
            | "long run", "free entry", "long-run equilibrium price" | $P = \min LRAC$ (set $LRMC = LRAC$) | $q^* =$ the $q$ at the bottom of LRAC | using a given price and $P = MC$ |
            | "number of firms" | $Q$ from demand at $P = \min LRAC$ | $n = Q/q^*$ | dividing market $Q$ by the wrong $q$ |
            | "will firms enter or exit?" | compare $P$ with $\min LRAC$ | above: entry, $P$ falls; below: exit, $P$ rises | using AVC (that is the short-run shutdown) |
            | "shutdown vs exit" | short run: $P$ vs $\min AVC$ | long run: $P$ vs $\min LRAC$ | treating them as the same |
            | "demand rises; short-run and long-run effects" | SR: move along SR supply, $P$ up, profits | LR: entry until $P$ is back at $\min LRAC$, more firms | thinking the LR price stays high |
            | "long-run market supply" (identical firms, constant input prices) | horizontal at $\min LRAC$ | demand only sets $Q$ and $n$ | drawing it upward-sloping |
            | "producer surplus" | area above supply, below $P$, over units sold | triangle $\tfrac12 Q (P - \text{intercept})$; or $PS = TR - VC$ | using the demand intercept |
            | "PS vs profit", "fixed cost" | $\pi = PS - F$ | in the long run ($F = 0$) they are equal | saying PS is profit |
            | "consumer surplus" | area below demand, above $P_c$, over units bought | triangle $\tfrac12 Q (\text{choke price} - P)$ | using units not actually bought |
            | "efficient quantity", "welfare-maximizing" | $MB = MC$: demand = supply | $W = CS + PS$ is largest there | "more output is always better" |
            | "output restricted to…", "required to produce…" | price from **demand** at that $Q$ | DWL triangle between that $Q$ and the efficient $Q$ | taking the price from supply |
            | "welfare table: before, after, change" | CS, PS (and G) in each column | $\Delta W = -\text{DWL}$ | counting a transfer as a loss |
          `),
          R(md`
            ### Part 10: taxes, ceilings, floors, supports

            | The problem says… | First equation | Then | The trap |
            |---|---|---|---|
            | "per-unit tax of \$t", "specific tax" | $P_c = P_p + t$ in $Q_d(P_c) = Q_s(P_p)$ | $Q$; revenue $= tQ$; DWL $= \tfrac12 t\,(Q^* - Q_t)$ | putting $t$ on the wrong side |
            | "who bears the tax", "incidence", "what share" | consumer share $= (P_c - P^*)/t$ | producer share $= (P^* - P_p)/t$ | answering with who mails the check |
            | "collected from buyers" vs "from sellers" | same $P_c$, $P_p$, $Q$ either way | legal liability does not matter | different answers for each |
            | "more inelastic demand", "elasticities" | the less responsive side bears more | compare slopes: who changes quantity less per dollar? | "sellers pay it, so sellers bear it" |
            | "price ceiling", "maximum price", "rent control" | binding only if below $P^*$ | traded $Q = Q_s(\text{ceiling})$; shortage $= Q_d - Q_s$ | trading $Q_d$ |
            | "price floor", "minimum price", "minimum wage" | binding only if above $P^*$ | traded $Q = Q_d(\text{floor})$; excess supply $= Q_s - Q_d$ | trading $Q_s$ |
            | "government buys any excess", "price support" | producers sell $Q_s(\text{floor})$ | consumers buy $Q_d$; government buys $Q_s - Q_d$; spends floor $\times (Q_s - Q_d)$ | treating it as an ordinary floor |
            | "change in social surplus" with a support | $W = CS + PS - \text{spending}$ | Before / After / Change table | forgetting to subtract the spending |
          `),
          R(md`
            ### Part 11: monopoly

            | The problem says… | First equation | Then | The trap |
            |---|---|---|---|
            | "monopolist", "only seller", "patent" | $MR = MC$ | $P$ from **demand** at $Q_m$; $\pi = (P - AC)Q$ | $P = MC$; reading $P$ off MR |
            | "linear demand $P = a - bQ$" | $MR = a - 2bQ$ | twice the slope, same intercept | $MR = a - bQ$ |
            | demand given as $Q = \ldots$ | invert to $P = \ldots$ first | then $MR$ | doubling the wrong coefficient |
            | "revenue table" | $TR = P \times Q$, $MR = \Delta TR/\Delta Q$ | produce while $MR \ge MC$ | using the price column as MR |
            | "competitive benchmark", "efficient output" | $P(Q) = MC$ | DWL triangle between $Q_m$ and $Q_c$ | using MR for the benchmark |
            | "monopoly DWL", "label and shade CS, PS, DWL" | triangle: base $Q_c - Q_m$, height $P_m - MC(Q_m)$ | CS above $P_m$; PS between $P_m$ and MC | height $P_m - P_c$ when MC slopes |
            | "Lerner index" | $L = \dfrac{P - MC}{P}$ | at the untaxed optimum $L = -1/\varepsilon$ | flipping to $(P - MC)/MC$ |
            | "elasticity at the optimum" | $\varepsilon = \dfrac{dQ}{dP}\cdot\dfrac{P}{Q}$ | or from $L = -1/\varepsilon$ | using $dP/dQ$ |
            | "elastic portion", "why never inelastic" | $MR = P(1 + 1/\varepsilon)$ | $MC > 0$ needs $MR > 0$, so $\lvert\varepsilon\rvert > 1$ | "monopolists like inelastic demand" |
            | "barriers to entry", "compare with competition" | patents, licenses, control of an input, scale economies | monopoly: less $Q$, higher $P$, DWL | "a monopoly can charge any price it likes" (demand limits it) |
          `),
          R(md`
            ### Part 12: monopoly taxes and regulation

            | The problem says… | First equation | Then | The trap |
            |---|---|---|---|
            | "specific tax $t$ on the monopolist" | $MR = MC + t$ | $P_c$ from demand; $P_p = P_c - t$ | $P = MC + t$ (competitive) |
            | "ad valorem tax $v$", "40% of the price" | effective demand $P_p = (1 - v)P(Q)$ | effective $MR = (1 - v)MR$; set it equal to MC; $P_c$ from demand | subtracting $v$ instead of multiplying |
            | "after-tax DWL" | against the **efficient** $Q$ ($P = MC$) | not against the untaxed monopoly | measuring from $Q_m$ |
            | "pass-through", "$dP_c/dt$" | linear demand, constant MC: $\tfrac12$ | constant elasticity $e$: $\dfrac{e}{e - 1} > 1$ | assuming it is always 1 |
            | "natural monopoly" | AC still falling where demand cuts it | one firm is cheapest; big fixed cost | thinking it means "no costs" |
            | "price ceiling at $P = MC$" | $P(Q) = MC$ | efficient $Q$; $\pi = -F$ (loss) | forgetting the long-run exit |
            | "price ceiling at $P = AC$" | $P(Q) = AC(Q)$: a quadratic | larger root; $\pi = 0$; DWL remains | taking the smaller root |
            | "which root?" | the one with economic meaning | larger $Q$ for AC pricing; rising MC for $P = MC$ | taking whichever came first |
          `),
          R(md`
            ### Decision tree 1: is it a competitive firm or a monopoly?

            1. The firm takes **one price** as given: "the market price is \$12", "price taker", "perfectly competitive". → **Competitive.** $MR = P$; output from $P = MC$.
            2. The firm faces **a demand curve**: "the monopolist faces $P = 100 - 2Q$", "the only seller", "holds a patent". → **Monopoly.** $MR$ from demand, $MR = MC$, then $P$ from demand.
            3. There is a market demand **and** a market supply, and no single firm choosing. → **A market problem.** Equilibrium where $Q_d = Q_s$; then surplus, taxes or price controls.
            4. Firm cost curves plus market demand plus "free entry". → **Long-run competition.** $P = \min LRAC$; $Q$ from demand; $n = Q/q^*$.

            ### Decision tree 2: short run or long run?

            | Clue in the problem | Run | Leave the market if… | Profit can be… |
            |---|---|---|---|
            | "fixed cost", "fixed input $\bar x_2$", "this season", "there are 100 firms" | short | $P < \min AVC$ (shut down) | positive, zero or negative |
            | "long run", "all inputs variable", "free entry and exit", "how many firms?" | long | $P < \min LRAC$ (exit) | zero in equilibrium |

            A constant term in a **long-run** cost ($LRC = 2q^2 + 8$) is not a sunk fixed cost: the firm avoids it by exiting. So the long-run test uses the full LRAC.

            ### Decision tree 3: which quantity is traded under this policy?

            | Policy | Binding when… | Quantity traded | Extra pieces |
            |---|---|---|---|
            | none | | $Q^*$ where $Q_d = Q_s$ | CS, PS triangles |
            | per-unit tax $t$ | always | $Q_d(P_c) = Q_s(P_p)$ with $P_c - P_p = t$ | revenue $tQ$, DWL triangle |
            | price ceiling $\bar P$ | $\bar P < P^*$ | $Q_s(\bar P)$ (sellers are short) | shortage $Q_d - Q_s$ |
            | price floor $\bar P$ | $\bar P > P^*$ | $Q_d(\bar P)$ (buyers are short) | excess supply $Q_s - Q_d$ |
            | price support $\bar P$ | $\bar P > P^*$ | producers sell $Q_s(\bar P)$, consumers buy $Q_d(\bar P)$ | government buys $Q_s - Q_d$ and spends $\bar P(Q_s - Q_d)$ |
            | monopoly | | $MR = MC$ | DWL against $P = MC$ |
            | $P = MC$ regulation | | $P(Q) = MC$ | loss $= F$ if MC is flat |
            | $P = AC$ regulation | | $P(Q) = AC(Q)$, larger root | $\pi = 0$; some DWL remains |

            ### Decision tree 4: which area is which?

            | Area | Top edge | Bottom edge | Over which units | Shape (straight lines) |
            |---|---|---|---|---|
            | consumer surplus | demand | the price buyers pay, $P_c$ | units bought | triangle; a trapezoid under a ceiling |
            | producer surplus | the price sellers keep, $P_p$ | supply (MC) | units sold | triangle; a trapezoid under a floor |
            | tax revenue | $P_c$ | $P_p$ | units traded | rectangle |
            | deadweight loss | demand | supply (MC) | units that should trade but do not (or the reverse) | triangle |
            | government spending (support) | the support price | zero | units the government buys | rectangle |
            | one firm's profit | $P$ | $AC(q^*)$ | $q^*$ | rectangle |
            | one firm's TR, TC, VC | $P$, $AC$, $AVC$ | zero | $q^*$ | rectangles |

            The picture of each one is in [the graph atlas](#/l/m3-graphs).
          `),
          Q(md`A problem says: "There are 50 identical firms. Each has $C(q) = 10 + q^2$. Demand is $Q = 300 - 25P$." This is…`, ['a short-run market problem: build market supply from P = MC', 'a long-run problem: set P = min AC', 'a monopoly problem: set MR = MC', 'a tax problem'], 0,
            [null, 'The number of firms is given and there is a fixed cost: short run. No "free entry".', 'There are 50 price takers, not one firm facing demand.', 'Nothing in it mentions a tax.'],
            md`Fixed $n$ and a fixed cost: short run. One firm's supply from $P = MC$, times 50, meets demand.`),
          Q(md`"Firms can freely enter and exit. Each has $LRAC$ minimized at \$8." The long-run price is…`, ['\\$8', 'wherever demand meets one firm’s LRMC', 'above \\$8, because of demand', 'cannot be found without the number of firms'], 0,
            [null, 'Demand meets the long-run market supply, which is flat at min LRAC.', 'Any price above \\$8 brings entry until it falls back.', 'The number of firms is an output of the problem: $n = Q/q^*$.'],
            md`Free entry drives profit to zero: $P = \min LRAC = 8$.`),
          Q(md`Under a binding price **floor** (no government purchases), the quantity traded is…`, ['quantity demanded at the floor', 'quantity supplied at the floor', 'the old equilibrium quantity', 'quantity supplied minus quantity demanded'], 0,
            [null, 'Sellers would like to sell that much, but buyers will not buy it at the high price.', 'The floor changed the price, so the quantity changes too.', 'That is the excess supply, the unsold amount.'],
            md`Above equilibrium, buyers are the short side: $Q = Q_d(\text{floor})$.`),
          Q(md`On a monopoly graph, the deadweight loss triangle sits…`, ['between Q_m and the Q where demand meets MC, between demand and MC', 'between Q_m and the Q where MR = 0', 'above the monopoly price, under demand', 'between the MR curve and the demand curve, over all units'], 0,
            [null, 'MR = 0 is the revenue-maximizing point; efficiency uses MC.', 'That area is consumer surplus.', 'That band has no meaning as a welfare area.'],
            md`The lost units are those from $Q_m$ to $Q_c$ (where $P = MC$). On each, buyers' value (demand) exceeds cost (MC).`),
          R(md`
            ### Drill: 28 problems, one from every corner of the course

            Each card is only the plan. Find the trigger, pick the move, read why the others fail. Aim to get each right on the first try.
          `),
          S(md`A food truck takes in \$60,000 a year. Wages, ingredients and permits cost \$45,000. The owner gave up a \$7,000 job and could have rented the truck out for \$3,000. Is the business worth staying in?`,
            plan('What do you compute?', 'Economic profit: $60{,}000 - 45{,}000 - 7{,}000 - 3{,}000 = 5{,}000 > 0$', [
              ['Accounting profit, \\$15,000, so yes', 'Accounting profit ignores the forgone job and the rent. Staying in is worth it only if it beats those alternatives.'],
              ['Revenue minus the implicit costs only', 'Explicit costs are real payments; economic cost includes **both** kinds.'],
              ['Check whether economic profit is zero: zero means failing', 'Zero economic profit means "as good as the next-best use", not failing.'],
            ], 'Economic profit = revenue − explicit − implicit costs = \\$5,000 > 0: better than the alternatives, so stay.')),
          S(md`A pita truck has $q = 4\sqrt{x_1 x_2}$ with truck capacity fixed at $\bar x_2 = 4$. Pitas sell for \$8, labor costs $w_1 = \$16$ a unit, capacity $w_2 = \$4$ a unit. How much labor does it hire?`,
            plan('What is your first move?', 'Plug in $\\bar x_2 = 4$ to get $q = 8\\sqrt{x_1}$, then set $p\\,MP_1 = w_1$', [
              ['Set $MP_1 = w_1$', 'MP is in pitas, the wage in dollars. Multiply MP by the price: $p\\,MP_1 = w_1$.'],
              ['Set $MRTS = w_1/w_2$', 'That is cost minimization with both inputs free. Capacity is fixed here: only labor is chosen.'],
              ['Set $P = MC$ with $MC = w_1$', 'The wage is the cost of one more unit of labor, not of one more pita.'],
            ], '$MP_1 = 4/\\sqrt{x_1}$; $8 \\cdot 4/\\sqrt{x_1} = 16 \\Rightarrow x_1 = 4$, $q = 16$, $\\pi = 128 - 64 - 16 = 48$.')),
          S(md`Same truck. The wage doubles from \$16 to \$32. What happens to the isoprofit lines and to the best plan?`,
            plan('Which way does the picture change?', 'Isoprofit lines get steeper (slope $w_1/p$ goes from 2 to 4); the tangency moves left: less labor, less output', [
              ['Lines get flatter; more labor', 'The slope is $w_1/p$: a higher wage makes it **steeper**.'],
              ['Only the intercept moves; same labor', 'The slope changes with $w_1$, so the tangency point moves.'],
              ['Nothing changes: the wage is a fixed cost', 'Labor is the variable input; its price enters $p\\,MP_1 = w_1$.'],
            ], 'Slope $32/8 = 4$. New tangency where $MP_1 = 4$: $x_1 = 1$, $q = 8$, $\\pi = 64 - 32 - 16 = 16$.')),
          S(md`$C(q) = q^3 - 10q^2 + 40q + 30$. Below what price does the firm produce nothing in the short run?`,
            plan('What do you find?', 'The bottom of AVC: set $MC = AVC$, then the price is $AVC$ there', [
              ['The bottom of AC', 'That is break-even. Shutdown ignores the 30, which is paid either way.'],
              ['Where $MC = 0$', 'Not a landmark that matters here.'],
              ['Where $P = MC$ with $P = 30$', 'The 30 is the fixed cost, not a price.'],
            ], '$3q^2 - 20q + 40 = q^2 - 10q + 40 \\Rightarrow 2q^2 - 10q = 0 \\Rightarrow q = 5$; shutdown price $= AVC(5) = 15$.')),
          S(md`Dent's cost is $C(q) = 2q^2 + 100$ and the price is \$40. Shade total revenue, total cost and profit.`,
            plan('What sets the width and the heights of the rectangles?', 'Width $q^* = 10$ from $P = MC$; TR height $P = 40$; TC height $AC(10) = 30$', [
              ['Width from $P = AC$', 'The width is the output the firm chooses, from $P = MC$.'],
              ['TC height is $MC(10) = 40$', 'MC is the cost of the last car only. Total cost is $AC \\times q$.'],
              ['TC height is $AVC(10) = 20$', 'That rectangle is variable cost; total cost adds the \\$100 fixed cost.'],
            ], 'TR $= 40 \\times 10 = 400$, TC $= 30 \\times 10 = 300$; profit is the strip between them, $(40 - 30)(10) = 100$.')),
          S(md`Firm A's inverse supply is $P = 2 + q_A/2$; firm B's is $P = 5 + q_B/3$ (zero below \$5). How much does the market supply at \$8?`,
            plan('First move?', 'Invert each to direct form and add the quantities at \\$8', [
              ['Add the inverses: $P = 7 + q/2 + q/3$', 'That adds two prices. Market supply adds quantities at one price.'],
              ['Use only firm A, because it starts lower', 'At \\$8 both firms sell (8 > 5).'],
              ['Set the two inverse supplies equal', 'That finds where the firms have the same marginal cost, not the market quantity.'],
            ], '$q_A = 2(8 - 2) = 12$, $q_B = 3(8 - 5) = 9$, market $Q = 21$.')),
          S(md`100 identical firms each have $C(q) = 2q^2 + 100$. Market demand is $Q = 600 - 5P$. Find the short-run price and each firm's output.`,
            plan('First move?', 'One firm’s supply $q = P/4$ from $P = MC = 4q$; market supply $Q = 100 \\cdot P/4 = 25P$', [
              ['Set demand equal to $MC = 4q$', 'Demand is for the whole market: build market supply first.'],
              ['$P = \\min AC$', 'That is the long-run free-entry price; here the number of firms is fixed.'],
              ['$MR = MC$ from the demand curve', 'Each firm is a price taker, so $P = MC$.'],
            ], '$25P = 600 - 5P \\Rightarrow P = 20$, $Q = 500$, $q = 500/100 = 5$.')),
          S(md`A competitive firm's long-run cost is $LRC(q) = 2q^2 + 8$. Below what price will it not produce in the long run?`,
            plan('What do you find?', 'The bottom of LRAC: set $LRMC = LRAC$', [
              ['The bottom of AVC', 'In the long run every cost is avoidable by exiting, so compare with the full LRAC.'],
              ['Where $LRMC = 0$', 'Not a landmark that matters.'],
              ['The price where $LRAC = 8$', 'The 8 is part of cost, not a price. You want the lowest point of LRAC.'],
            ], '$4q = 2q + 8/q \\Rightarrow q^2 = 4 \\Rightarrow q = 2$; the exit price is $LRAC(2) = 4 + 4 = 8$.')),
          S(md`Every firm has min LRAC = \$8 at $q = 2$. Market demand is $Q = 1000 - 50P$. With free entry, how many firms are there in the long run?`,
            plan('Which order of moves?', 'Price $= 8$ from min LRAC, then $Q$ from demand, then $n = Q/q^*$', [
              ['Set demand equal to one firm’s LRMC', 'The long-run price is pinned by min LRAC; demand only decides how much is sold.'],
              ['$n = Q/P$', 'Divide market quantity by output **per firm** (2), not by the price.'],
              ['It cannot be done without a supply curve', 'Long-run supply **is** the horizontal line at min LRAC.'],
            ], '$Q = 1000 - 50(8) = 600$; $n = 600/2 = 300$ firms.')),
          S(md`A competitive industry with free entry is in long-run equilibrium. Demand rises permanently. Describe the short run and the long run.`,
            plan('What happens?', 'Short run: price rises and existing firms earn profits. Long run: entry pushes the price back to min LRAC, with more firms and more output', [
              ['The price stays higher in the long run', 'With identical firms and constant input prices, long-run supply is flat at min LRAC.'],
              ['Nothing happens in the short run', 'Existing firms move up their MC curves: higher price, more output.'],
              ['Existing firms grow; no one enters', 'Profit attracts entry; each firm ends back at $q^*$, the bottom of LRAC.'],
            ], 'SR: along short-run supply, $P$ up, $\\pi > 0$. LR: entry until $P = \\min LRAC$; $Q$ up, $n$ up, $q$ per firm back to $q^*$.')),
          S(md`Inverse market supply is $P = Q + 5$. Find producer surplus when $P = \$9$.`,
            plan('Which area?', 'The triangle above supply and below \\$9: $\\tfrac12 \\times 4 \\times (9 - 5)$', [
              ['$9 \\times 4$', 'That is total revenue. PS takes away the area under supply (variable cost).'],
              ['The area under supply, $\\tfrac12(5 + 9)(4)$', 'That trapezoid is variable cost, the opposite of PS.'],
              ['A triangle down to zero: $\\tfrac12 \\times 4 \\times 9$', 'Supply starts at \\$5, not \\$0: PS is only the part above it.'],
            ], 'At \\$9, $Q = 4$. $PS = \\tfrac12(4)(9 - 5) = 8$.')),
          S(md`Demand is $P = 14 - Q$ and supply $P = 2 + Q$. A quota holds output at $Q = 4$. Find the deadweight loss.`,
            plan('How do you get the DWL?', 'Triangle from $Q = 4$ to the efficient $Q = 6$; height = demand minus supply at $Q = 4$, $10 - 6$', [
              ['Height = new price minus old price', 'That is a transfer per unit. The triangle height is $MB - MC$ at the restricted quantity.'],
              ['Rectangle $(10 - 8) \\times 4$', 'That is the transfer from consumers to producers on units still traded, not a loss.'],
              ['DWL = the fall in CS', 'Part of the fall in CS is a transfer to producers. Only the lost triangle is DWL.'],
            ], 'DWL $= \\tfrac12(6 - 4)(10 - 6) = 4$.')),
          S(md`$Q_d = 200 - 5P$ and $Q_s = 5P$. A \$4 per-unit tax is collected from sellers. Find the price buyers pay.`,
            plan('First equation?', '$200 - 5P_c = 5P_p$ with $P_c = P_p + 4$', [
              ['$200 - 5P = 5P + 4$', 'The tax is a dollar wedge between two prices, not 4 extra units of quantity.'],
              ['$P_c = 20 + 4 = 24$', 'Buyers do not pay the whole tax: the price sellers keep falls too.'],
              ['Sellers pay it, so $P_c = 20$', 'Who mails the check does not matter: the burden is shared.'],
            ], '$200 - 5(P_p + 4) = 5P_p \\Rightarrow 180 = 10P_p \\Rightarrow P_p = 18$, $P_c = 22$, $Q = 90$.')),
          S(md`Demand for insulin is very inelastic; supply is elastic. A per-unit tax is levied on the producers. Who bears most of it?`,
            plan('Who bears most?', 'Consumers: the less responsive side bears more', [
              ['Producers, because they pay it', 'Legal liability does not set incidence; elasticities do.'],
              ['Half each', 'Only when both sides respond equally to price (as in the lecture example).'],
              ['Nobody: the government pays', 'The tax is paid out of the gap between what buyers pay and what sellers keep.'],
            ], 'Buyers barely cut purchases, so their price rises by almost the whole tax: consumer share $(P_c - P^*)/t$ is close to 1.')),
          S(md`$Q_d = 200 - 5P$ and $Q_s = 5P$. A price ceiling of \$16 is set. How many units are traded?`,
            plan('Which quantity?', '$Q_s(16) = 80$: the ceiling binds and sellers are the short side', [
              ['$Q_d(16) = 120$', 'Buyers want 120, but sellers make only 80 at \\$16.'],
              ['100, the old equilibrium', 'The ceiling is below \\$20, so it binds and changes the outcome.'],
              ['The shortage, 40', 'The shortage is unmet demand, $Q_d - Q_s$, not units traded.'],
            ], 'Binding ($16 < 20$). Traded $= 80$; shortage $= 120 - 80 = 40$; DWL $= \\tfrac12(100 - 80)(24 - 16) = 80$.')),
          S(md`Same market ($P^* = 20$). A price floor of \$18 is set.`,
            plan('What happens?', 'Nothing: a floor below the equilibrium price does not bind', [
              ['Excess supply of 20', 'A floor binds only above equilibrium. The market price of \\$20 is already above \\$18.'],
              ['Traded $Q = Q_d(18) = 110$', 'The price stays at \\$20, which the floor allows.'],
              ['A shortage appears', 'Shortages come from binding **ceilings**.'],
            ], '$18 < 20$: not binding. $P = 20$, $Q = 100$, no DWL.')),
          S(md`$Q_d = 600 - 10P$ and $Q_s = 10P$. The government sets a support price of \$45 and buys any excess. How much does it spend?`,
            plan('Which quantities?', 'Producers sell $Q_s(45) = 450$; consumers buy $Q_d(45) = 150$; the government buys the other 300', [
              ['It is an ordinary floor: 150 traded, no spending', 'With a support the government buys the excess, so producers sell all 450.'],
              ['Spending $= 45 \\times 450$', 'The government buys only what consumers do not: $450 - 150 = 300$.'],
              ['Spending $= (45 - 30) \\times 300$', 'The government pays the full \\$45 for each unit it buys, not the markup.'],
            ], 'Spending $= 45 \\times 300 = 13{,}500$. Welfare: $W = CS + PS - 13{,}500$.')),
          S(md`A monopolist faces $P = 500 - 2Q$ and has $MC = Q$. Find its price.`,
            plan('First equation?', '$MR = MC$: $500 - 4Q = Q$', [
              ['$500 - 2Q = Q$', 'That is $P = MC$, the competitive benchmark.'],
              ['$500 - 2Q = 0$', 'That is where the price hits zero; it has nothing to do with the choice.'],
              ['$500 - 4Q = 0$', 'That maximizes revenue and ignores cost.'],
            ], '$5Q = 500 \\Rightarrow Q = 100$; then $P = 500 - 2(100) = 300$ from demand.')),
          S(md`
            A monopolist's demand schedule:

            | $Q$ | 1 | 2 | 3 | 4 | 5 |
            |---|---|---|---|---|---|
            | $P$ (\$) | 10 | 9 | 8 | 7 | 6 |

            Each unit costs \$5 to make. How many units does it sell?
          `,
            plan('What do you build first?', 'A TR column ($P \\times Q$), then $MR = \\Delta TR$ for each unit', [
              ['Use the price column as MR', 'The 4th unit sells for \\$7 but lowers the price on the first 3 units: its MR is only \\$4.'],
              ['Pick the $Q$ where $P = MC = 5$', 'That is the competitive choice. A monopolist compares MR with MC.'],
              ['Pick the $Q$ with the largest TR', 'That maximizes revenue and ignores the \\$5 cost of each unit.'],
            ], 'TR: 10, 18, 24, 28, 30. MR: 10, 8, 6, 4, 2. Sell while $MR \\ge 5$: $Q = 3$ at $P = 8$.')),
          S(md`A monopolist charges \$20 and has $MC = \$15$. Find the Lerner index and the elasticity of demand at its optimum.`,
            plan('Which formulas?', '$L = (P - MC)/P = 0.25$, then $L = -1/\\varepsilon$ gives $\\varepsilon = -4$', [
              ['$L = (P - MC)/MC = 1/3$', 'The Lerner index divides by the **price**.'],
              ['$\\varepsilon = -L = -0.25$', 'The link is $L = -1/\\varepsilon$: take the reciprocal.'],
              ['Elasticity needs the demand curve', 'At the untaxed optimum, $L = -1/\\varepsilon$ gives it directly.'],
            ], '$L = 5/20 = 0.25$; $\\varepsilon = -1/0.25 = -4$ (elastic, as it must be).')),
          S(md`A classmate says: "A monopolist would love to sell where demand is inelastic, because buyers barely respond to price."`,
            plan('What is the flaw?', 'On the inelastic part $MR = P(1 + 1/\\varepsilon) < 0$: cutting output raises revenue **and** lowers cost', [
              ['None: inelastic demand lets it raise the price freely', 'Raising the price there does raise revenue. So it keeps raising it until demand is elastic.'],
              ['Monopolists always sell where $\\varepsilon = -1$', 'That maximizes revenue. With $MC > 0$ it wants $MR = MC > 0$, on the elastic part.'],
              ['It depends on the fixed cost', 'Fixed cost changes neither MR nor MC.'],
            ], '$MR = MC > 0$ needs $1 + 1/\\varepsilon > 0$, that is $\\lvert\\varepsilon\\rvert > 1$: the elastic portion.')),
          S(md`A monopolist faces $P = 40 - 2Q$ with $MC = 8$. Find the deadweight loss.`,
            plan('What is the benchmark quantity?', 'The efficient $Q$ from $P = MC$: $40 - 2Q = 8$, so $Q_c = 16$', [
              ['$Q$ from $MR = MC$', 'That is the monopoly quantity itself; DWL compares it with the efficient one.'],
              ['$Q = 20$, where demand hits zero', 'Units 16 to 20 are worth less than they cost: making them is not efficient.'],
              ['$Q$ where $MR = 0$', 'That maximizes revenue; it has nothing to do with efficiency.'],
            ], '$Q_m = 8$, $P_m = 24$. DWL $= \\tfrac12(16 - 8)(24 - 8) = 64$.')),
          S(md`The same monopolist ($P = 40 - 2Q$, $MC = 8$) now pays a \$6 tax per unit sold.`,
            plan('First equation?', '$MR = MC + t$: $40 - 4Q = 14$', [
              ['$P = MC + t$: $40 - 2Q = 14$', 'That is the competitive response. A monopolist still uses MR.'],
              ['Keep $Q_m = 8$ and add \\$6 to the price', 'The firm reoptimizes: quantity falls, and here the price rises by only \\$3.'],
              ['$MR = MC - t$', 'The tax **raises** the cost of each unit sold.'],
            ], '$Q = 6.5$, $P_c = 40 - 13 = 27$ (up \\$3 from 24: pass-through $\\tfrac12$), $P_p = 27 - 6 = 21$.')),
          S(md`A monopolist faces $P = 500 - 2Q$, has $MC = Q$, and consumers pay a 40% ad valorem tax. What demand does the monopolist effectively face?`,
            plan('What is the effective demand?', '$P_p = 0.6(500 - 2Q) = 300 - 1.2Q$', [
              ['$P_p = 500 - 2Q - 0.4$', 'An ad valorem tax is a **percent** of the price: multiply by $(1 - v)$.'],
              ['$P_p = 1.4(500 - 2Q)$', 'The firm keeps **less** than buyers pay, not more.'],
              ['$P_p = 500 - 2Q - 40$', 'That is a \\$40 specific tax, not 40%.'],
            ], 'Effective $MR = 300 - 2.4Q$. Set it equal to $Q$: $Q = 300/3.4 \\approx 88.2$; $P_c \\approx 323.5$ from demand; $P_p = 0.6P_c \\approx 194.1$.')),
          S(md`A water utility faces $P = 28 - Q$ and has $C(Q) = 80 + 4Q$. Regulators set the price equal to average cost.`,
            plan('Which equation, and which root?', '$28 - Q = 4 + 80/Q \\Rightarrow Q^2 - 24Q + 80 = 0$; take the larger root, $Q = 20$', [
              ['$28 - Q = 4$ ($P = MC$)', 'That is marginal-cost pricing; the firm would lose its \\$80 fixed cost.'],
              ['The smaller root, $Q = 4$', 'Both roots give zero profit. The larger one has more output and a lower price, so the regulator picks it.'],
              ['$MR = AC$', 'The regulator sets the price **on demand** equal to AC.'],
            ], 'Roots 4 and 20. $Q = 20$, $P = 8$, $\\pi = 0$; remaining DWL $= \\tfrac12(24 - 20)(8 - 4) = 8$.')),
          S(md`Same utility, but the ceiling is set at marginal cost. What happens in the long run?`,
            plan('What is the firm’s profit, and what follows?', '$P = 4$, $Q = 24$, $\\pi = 96 - 176 = -80$: it exits in the long run unless subsidized', [
              ['Zero profit: $P = MC$ always breaks even', 'With falling AC, MC is below AC, so a price equal to MC is below AC.'],
              ['It keeps operating forever: it covers MC', 'In the long run the \\$80 fixed cost is avoidable by leaving, so a firm with a loss exits.'],
              ['It earns a profit because it is a monopoly', 'The ceiling removes the monopoly price.'],
            ], 'TR $= 4 \\times 24 = 96$, TC $= 80 + 4(24) = 176$, $\\pi = -80$. It needs an \\$80 subsidy to stay.')),
          S(md`A monopolist faces $Q = kP^{-2}$ and has constant $MC = 10$. A \$1 per-unit tax is imposed. By how much does the consumer price rise?`,
            plan('What relation do you use?', '$MR = P(1 + 1/\\varepsilon) = P/2$; set $P/2 = MC + t$, so $P = 2(MC + t)$', [
              ['Half the tax, as with linear demand', 'The one-half rule is for linear demand. With constant elasticity the markup multiplies the tax.'],
              ['Exactly the tax, \\$1', 'That is a competitive market with flat supply. Here pass-through exceeds 100%.'],
              ['Nothing: the monopolist absorbs it', 'The tax raises its marginal cost, so it raises the price.'],
            ], 'Before: $P = 2(10) = 20$. After: $P = 2(11) = 22$. $dP_c/dt = e/(e - 1) = 2$: 200% pass-through.')),
          S(md`A water utility has a \$10 million fixed cost for pipes and a constant \$2 marginal cost per unit. Why is it called a natural monopoly?`,
            plan('What makes it natural?', '$AC = 10{,}000{,}000/Q + 2$ falls at every output, so one firm serves the market more cheaply than two', [
              ['Its MC is low', 'Low MC alone does not make one firm cheapest. The falling AC from the big fixed cost does.'],
              ['The government gave it a license', 'That is a legal barrier, not a natural one.'],
              ['Its AC rises with output', 'Rising AC would favor several smaller firms.'],
            ], 'Two firms would pay the fixed cost twice. With AC falling everywhere, one firm is the cheapest way to supply the market.')),
        ],
      },
      // ================================================================ m3-graphs
      {
        id: 'm3-graphs', title: 'The graph atlas: eight pictures and every area in them', ref: 'Lectures 15–19 · DS8–DS10',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The problem says… | The picture | What you shade |
            |---|---|---|
            | "shade total revenue, total cost and profit" | one firm: MC, AC, AVC and a price line | rectangles with width $q^*$ (picture 1) |
            | "show the short-run and long-run effect of a demand increase" | firm and market side by side | the profit rectangle, then entry (picture 2) |
            | "label CS and PS at equilibrium" | market S and D | two triangles (picture 3) |
            | "output is restricted to…", "a policy requires…" | market S and D with a vertical line | the DWL triangle (picture 4) |
            | "a per-unit tax of \$t" | S and D with a vertical wedge of height $t$ | CS, PS, revenue rectangle, DWL (picture 5) |
            | "a price ceiling at…" | S and D with a horizontal line below $P^*$ | CS trapezoid, PS triangle, DWL (picture 6) |
            | "a price floor", "a price support" | horizontal line above $P^*$ | PS trapezoid; government spending rectangle (picture 7) |
            | "monopoly: label CS, PS, DWL" | D, MR, MC | CS triangle, PS, DWL triangle (picture 8) |
            | "natural monopoly", "regulate at P = MC / P = AC" | D, MR, falling AC, flat MC | the loss rectangle; the remaining DWL (picture 9) |

            !!method Every area is one of three shapes
              **Rectangle:** base $\times$ height. **Triangle:** $\tfrac12 \times$ base $\times$ height. **Trapezoid:** $\tfrac12(b_1 + b_2) \times h$, or split it into a rectangle plus a triangle.

              For each area, say three things before computing: **the top edge, the bottom edge, and which units** (from which $Q$ to which $Q$).
          `),
          RF(md`
            ### Picture 1: one firm's cost curves and a price line

            Dent repairs cars with $C(q) = 2q^2 + 100$: $MC = 4q$, $AC = 2q + 100/q$, $AVC = 2q$. The price is \$40, so $q^* = 10$ (from $40 = 4q$). At $q = 10$: $AC = 30$, $AVC = 20$.

            [[fig:g1]]

            Every area is a rectangle of width $q^* = 10$. Only the heights differ:

            | Area | Letters | Height | Value |
            |---|---|---|---|
            | total revenue $P \cdot q$ | A + B + C | $P = 40$ | 400 |
            | total cost $AC \cdot q$ | B + C | $AC = 30$ | 300 |
            | variable cost $AVC \cdot q$ | C | $AVC = 20$ | 200 |
            | fixed cost $(AC - AVC)q$ | B | $30 - 20 = 10$ | 100 |
            | profit $(P - AC)q$ | A | $40 - 30 = 10$ | 100 |
            | producer surplus $TR - VC$ | A + B | $40 - 20 = 20$ | 200 |

            Check: $\pi = PS - F = 200 - 100 = 100$. ✓

            **If the price were below AC** (say \$20, $q = 5$, $AC = 30$), the strip between $P$ and $AC$ sits **above** the price line: a loss rectangle, $(30 - 20)(5) = 50$.
          `, { g1: { svg: g1, cap: 'P = 40, q* = 10. A: profit. B: fixed cost (the gap between AC and AVC). C: variable cost. TR = A + B + C.' } }),
          Q(md`In picture 1, which area is the firm's **producer surplus**?`, ['A + B', 'A', 'B + C', 'A + B + C'], 0,
            [null, 'A alone is profit. PS also includes the fixed-cost strip, since $PS = \\pi + F$.', 'That is total cost.', 'That is total revenue.'],
            md`$PS = TR - VC$: everything under the price line except the variable-cost rectangle C.`, { figHtml: g1 }),
          Q(md`In picture 1, the rectangle between the AC and AVC curves (area B) equals…`, ['the fixed cost, 100', 'the profit, 100', 'the variable cost', 'the producer surplus'], 0,
            [null, 'Profit is the strip between the price and AC (area A). It happens to equal 100 too here, but it is a different area.', 'Variable cost is C, under AVC.', 'PS is A + B.'],
            md`$(AC - AVC)\,q = AFC \cdot q = F = 100$.`, { figHtml: g1 }),
          Q(md`On a cost-curve graph, the height of the total-cost rectangle at the chosen output is read off…`, ['the AC curve', 'the MC curve', 'the AVC curve', 'the price line'], 0,
            [null, 'MC is the cost of the last unit only; $MC \\times q$ is not total cost.', 'That gives variable cost.', 'That gives total revenue.'],
            md`$TC = AC \times q$.`),
          RF(md`
            ### Picture 2: the firm and the market, short run and long run

            200 identical firms, each with $C(q) = q^2 + 25$: $MC = 2q$, min AC $= 10$ at $q = 5$. Market demand starts at $Q = 1500 - 50P$ and rises to $Q = 1800 - 50P$.

            [[fig:m]]

            [[fig:f]]

            - **$E_0$, long run before the shift:** $P = 10 = \min AC$. Each firm makes 5 and earns zero profit. $Q = 200 \times 5 = 1000$.
            - **$E_1$, short run after the shift:** the 200 firms move up their MC curves. Short-run supply is $Q = 200 \cdot P/2 = 100P$; with the new demand, $100P = 1800 - 50P$, so $P = 12$. Each firm makes 6 and earns the green rectangle, $(12 - 10.17)(6) = 11$.
            - **$E_2$, long run after the shift:** profit attracts entry until $P$ is back at \$10. $Q = 1800 - 500 = 1300$, each firm makes 5 again, so $n = 1300/5 = 260$ firms.

            !!key Read the two panels together
              The firm panel shows **per-firm** output $q$ and profit. The market panel shows the price and the **total** $Q$. The price is set in the market panel and read across to the firm panel.
          `, { m: { svg: g2m, cap: 'Market. E0 → E1: demand rises, price moves up along short-run supply. E1 → E2: entry shifts supply until the price is back at min AC = 10 (long-run supply, dashed).' },
            f: { svg: g2f, cap: 'One firm. At P = 12 it makes 6 units and earns the green profit rectangle. At P = 10 it makes 5 units at the bottom of AC: zero profit.' } }),
          Q(md`In picture 2, moving from $E_1$ to $E_2$, what happens to each firm's output?`, ['it falls back from 6 to 5', 'it rises from 6 to 7', 'it stays at 6', 'it falls to zero'], 0,
            [null, 'The price falls back to 10, so each firm moves back down its MC curve.', 'The price falls, so output per firm falls.', 'At $P = 10$ firms are at the bottom of AC, $q = 5$; they do not exit.'],
            md`Long run: every firm sits at the bottom of AC. The extra market output comes from **more firms** (260 instead of 200), not bigger ones.`, { figHtml: g2m }),
          RF(md`
            ### Picture 3: consumer and producer surplus at equilibrium

            Demand $P = 14 - Q$, supply $P = 2 + Q$. Equilibrium: $14 - Q = 2 + Q$, so $Q = 6$, $P = 8$.

            [[fig:g3]]

            | Area | Top | Bottom | Units | Value |
            |---|---|---|---|---|
            | A = CS | demand | $P = 8$ | 0 to 6 | $\tfrac12(6)(14 - 8) = 18$ |
            | B = PS | $P = 8$ | supply | 0 to 6 | $\tfrac12(6)(8 - 2) = 18$ |

            Total welfare $W = 36$. This is as large as it can get: every unit with $MB > MC$ is traded, and none with $MB < MC$.
          `, { g3: { svg: g3, cap: 'A: consumer surplus, above the price and under demand. B: producer surplus, below the price and above supply.' } }),
          Q(md`In picture 3, the height of the CS triangle is…`, ['the demand intercept minus the price: 14 − 8', 'the price minus the supply intercept: 8 − 2', 'the price, 8', 'the demand intercept, 14'], 0,
            [null, 'That is the PS triangle’s height.', 'The triangle sits **above** the price, not down to zero.', 'CS stops at the price buyers pay.'],
            md`CS is under demand and above the price: from 8 up to the choke price 14.`, { figHtml: g3 }),
          RF(md`
            ### Picture 4: deadweight loss from too little or too much

            **Too little.** Output is held at $Q = 4$. Buyers then pay what demand says at $Q = 4$: $P = 14 - 4 = 10$.

            [[fig:a]]

            | Area | What it is | Value |
            |---|---|---|
            | A | CS after (above 10, under demand, units 0 to 4) | $\tfrac12(4)(14 - 10) = 8$ |
            | B | was CS, now PS: a **transfer** (between 8 and 10, units 0 to 4) | $2 \times 4 = 8$ |
            | E | PS that stays with producers (between 8 and supply, units 0 to 4) | $\tfrac12(6 + 2)(4) = 16$ |
            | C + D | DWL: units 4 to 6, between demand and supply | $\tfrac12(6 - 4)(10 - 6) = 4$ |

            CS: 18 → 8 (lost B + C). PS: 18 → 24 (gained B, lost D). W: 36 → 32. **The transfer B moves between groups; only C + D disappears.**
          `, { a: { svg: g4a, cap: 'Q held at 4. A: CS after. B: transfer from consumers to producers. E: PS kept. C + D: deadweight loss on units 4 to 6.' } }),
          RF(md`
            **Too much.** A policy forces $Q = 8$. Buyers take 8 only at $P = 14 - 8 = 6$. The 7th and 8th units cost more (supply height up to 10) than they are worth (demand height down to 6).

            [[fig:b]]

            DWL $= \tfrac12(8 - 6)(10 - 6) = 4$, the triangle between **supply on top** and **demand below**, over units 6 to 8. In the lecture: CS rises to 32, PS falls to 0, $W = 32$.

            !!trap The DWL triangle always points at the efficient quantity
              Its tip is at $Q^*$ (where $D$ and $S$ cross); its base is the vertical line at the actual quantity. Base length $= \lvert Q - Q^* \rvert$; height $=$ the gap between demand and supply at the actual $Q$.
          `, { b: { svg: g4b, cap: 'Q forced to 8. The red triangle: units 6 to 8 cost more to make than buyers value them.' } }),
          Q(md`In picture 4 (output held at 4), which area is the **deadweight loss**?`, ['C + D', 'B', 'B + C', 'A + B'], 0,
            [null, 'B is a transfer: consumers pay 10 instead of 8 on 4 units, and producers get it. Nobody loses it overall.', 'B is a transfer; only C is part of the loss (with D).', 'That is the CS before the quota on units 0 to 4.'],
            md`DWL is the surplus on units 4 to 6 that are no longer traded: between demand and supply, the triangle C + D.`, { figHtml: g4a }),
          Q(md`In picture 4, producer surplus after the quota is…`, ['B + E', 'E', 'E + D', 'B + C'], 0,
            [null, 'Producers also gain B: they get 10 instead of 8 on each of the 4 units.', 'D is lost: those units are no longer sold.', 'C was consumer surplus that is now lost.'],
            md`PS after $= B + E = 8 + 16 = 24$: up from 18 because the transfer B (8) beats the lost D (2).`, { figHtml: g4a }),
          RF(md`
            ### Picture 5: a per-unit tax

            Lecture market: $Q_d = 200 - 5P$, $Q_s = 5P$ (inverse: $P = 40 - Q/5$ and $P = Q/5$), so $P^* = 20$, $Q^* = 100$. Take a tax of $t = 8$: $P_c = 24$, $P_p = 16$, $Q = 80$.

            [[fig:g5]]

            The tax is a **vertical wedge of height $t$** that fits between demand and supply at the traded quantity.

            | Area | What it is | Value |
            |---|---|---|
            | A | CS: under demand, above $P_c = 24$, units 0 to 80 | $\tfrac12(80)(40 - 24) = 640$ |
            | B | tax revenue paid out of buyers' pockets ($20 \to 24$) | $4 \times 80 = 320$ |
            | C | tax revenue paid out of sellers' pockets ($16 \to 20$) | $4 \times 80 = 320$ |
            | D | DWL: units 80 to 100, between demand and supply | $\tfrac12(100 - 80)(8) = 80$ |
            | E | PS: above supply, below $P_p = 16$, units 0 to 80 | $\tfrac12(80)(16) = 640$ |

            Revenue $= B + C = tQ = 640$. Before: $W = 2000$. After: $640 + 640 + 640 = 1920$. DWL $= 80$ ✓. Consumer share of the tax: $(24 - 20)/8 = 50\%$.
          `, { g5: { svg: g5, cap: 'Tax t = 8. A: CS. B + C: tax revenue (a rectangle of height t). D: deadweight loss. E: PS.' } }),
          Q(md`In picture 5, which area is the **tax revenue**?`, ['B + C', 'B + C + D', 'D', 'A + E'], 0,
            [null, 'D is never collected: those units are not traded at all.', 'D is the deadweight loss.', 'Those are what buyers and sellers keep.'],
            md`Revenue $= t \times Q_{\text{traded}}$: the rectangle between $P_c$ and $P_p$ over the 80 traded units.`, { figHtml: g5 }),
          Q(md`A classmate writes the tax DWL as $\tfrac12 \times t \times Q_{\text{tax}} = \tfrac12(8)(80)$. The mistake is…`, ['the base should be the lost quantity, 100 − 80', 'the height should be P_c, not t', 'there should be no ½', 'nothing: that is the formula'], 0,
            [null, 'The triangle’s height is the wedge $t$, not a price level.', 'It is a triangle, so the ½ belongs.', 'The DWL triangle covers only the units that stop trading.'],
            md`DWL $= \tfrac12 \times t \times (Q^* - Q_{\text{tax}}) = \tfrac12(8)(20) = 80$.`),
          RF(md`
            ### Picture 6: a binding price ceiling

            Same market, ceiling at \$16 (below $P^* = 20$, so it binds). Sellers supply $Q_s(16) = 80$; buyers want $Q_d(16) = 120$: a shortage of 40. Only 80 trade. On the 80th unit buyers would pay $40 - 80/5 = 24$.

            [[fig:g6]]

            | Area | What it is | Value |
            |---|---|---|
            | A + B + C | CS after: under demand, above 16, units 0 to 80 (a trapezoid) | $640 + 320 + 320 = 1280$ |
            | C | transfer from producers to consumers (price 20 → 16 on 80 units) | $4 \times 80 = 320$ |
            | F | PS after: above supply, below 16, units 0 to 80 | $\tfrac12(80)(16) = 640$ |
            | D + E | DWL: units 80 to 100, between demand and supply | $\tfrac12(20)(24 - 16) = 80$ |

            CS rises from 1000 to 1280 (gained C, lost D) under efficient rationing; PS falls from 1000 to 640.
          `, { g6: { svg: g6, cap: 'Ceiling at 16. A + B + C: CS. C: transfer from sellers. F: PS. D + E: deadweight loss. Shortage = 120 − 80 = 40.' } }),
          Q(md`In picture 6, the CS under the ceiling is the area…`, ['A + B + C', 'A', 'A + B + D', 'A + B + C + D'], 0,
            [null, 'Buyers also pay 16 instead of 24 or 20 on the 80 units they get: B and C are theirs.', 'That was CS **before** the ceiling.', 'D is on units 80 to 100, which nobody buys now.'],
            md`Under demand, above the ceiling price, over the 80 units actually bought: a trapezoid.`, { figHtml: g6 }),
          RF(md`
            ### Picture 7: a binding floor, and a price support

            **Ordinary floor at \$24.** Buyers take $Q_d(24) = 80$; sellers would offer 120. Only 80 trade.

            [[fig:g7]]

            | Area | What it is | Value |
            |---|---|---|
            | A | CS after: above 24, units 0 to 80 | $\tfrac12(80)(16) = 640$ |
            | B | transfer from consumers to producers (20 → 24 on 80 units) | $4 \times 80 = 320$ |
            | B + E | PS after: below 24, above supply, units 0 to 80 | $320 + 960 = 1280$ |
            | C + D | DWL: units 80 to 100 | $\tfrac12(20)(8) = 80$ |

            Notice: a \$8 tax, a ceiling at 16 and a floor at 24 all cut trade to 80 and all leave the **same** DWL triangle. They differ only in who gets the rectangle.
          `, { g7: { svg: g7, cap: 'Floor at 24. A: CS. B: transfer from buyers to sellers. B + E: PS. C + D: deadweight loss. Excess supply = 120 − 80 = 40.' } }),
          RF(md`
            **Price support at \$45 (DS9).** $Q_d = 600 - 10P$, $Q_s = 10P$, $P^* = 30$. The government buys whatever buyers do not: producers sell $Q_s(45) = 450$, consumers buy $Q_d(45) = 150$, the government buys 300.

            [[fig:g7b]]

            | Area | What it is | Value |
            |---|---|---|
            | A | CS: under demand, above 45, units 0 to 150 | $\tfrac12(150)(60 - 45) = 1125$ |
            | PS | under 45, above supply, units 0 to **450** | $\tfrac12(450)(45) = 10{,}125$ |
            | G | government spending: 45 times the 300 units it buys | $45 \times 300 = 13{,}500$ |

            $W = CS + PS - G = 1125 + 10{,}125 - 13{,}500 = -2250$, down from 9000: a change of $-11{,}250$. The spending enters with a **minus** sign: taxpayers pay it.
          `, { g7b: { svg: g7b, cap: 'Support at 45. A: CS on the 150 units consumers buy. G: government spending on units 150 to 450. PS is the whole triangle under 45 and above supply out to 450.' } }),
          Q(md`Under a price support, which quantity sets the width of the **PS** triangle?`, ['what producers sell, Q_s at the support price', 'what consumers buy, Q_d at the support price', 'the old equilibrium quantity', 'what the government buys'], 0,
            [null, 'Producers sell to consumers **and** the government; PS counts all of it.', 'The price changed, so the quantity changed.', 'PS counts every unit producers sell, not only the government’s.'],
            md`Producers sell $Q_s(45) = 450$ units at \$45 each, so PS runs out to 450.`, { figHtml: g7b }),
          RF(md`
            ### Picture 8: monopoly

            $P = 120 - Q$, $MC = Q$, so $MR = 120 - 2Q$. $MR = MC$: $120 - 2Q = Q$, $Q_m = 40$, $P_m = 80$. Efficient: $120 - Q = Q$, $Q_c = 60$, $P_c = 60$.

            [[fig:g8]]

            | Area | What it is | Value |
            |---|---|---|
            | A | CS: under demand, above $P_m = 80$, units 0 to 40 | $\tfrac12(40)(40) = 800$ |
            | B | transfer from consumers (80 vs 60 on 40 units) | $20 \times 40 = 800$ |
            | B + E | PS: under $P_m$, above MC, units 0 to 40 | $800 + 1600 = 2400$ |
            | C + D | DWL: units 40 to 60, between demand and MC | $\tfrac12(60 - 40)(80 - 40) = 400$ |

            The DWL height is $P_m - MC(Q_m) = 80 - 40$, the full gap between demand and MC at $Q_m$. Competitive $W = 3600$; monopoly $W = 800 + 2400 = 3200$.
          `, { g8: { svg: g8, cap: 'Monopoly. A: CS. B: transferred to the monopolist. B + E: PS. C + D: deadweight loss on units 40 to 60. MR (dashed) meets MC at Q = 40; the price comes from demand.' } }),
          Q(md`In picture 8, the height of the DWL triangle is…`, ['P_m − MC(Q_m) = 80 − 40', 'P_m − P_c = 80 − 60', 'MR(Q_m) − MC(Q_m) = 0', 'P_m = 80'], 0,
            [null, 'That is only part C’s height. The triangle runs from demand down to MC at $Q_m$.', 'At $Q_m$ they are equal; that is how $Q_m$ was chosen.', 'The DWL is between demand and MC, not down to zero.'],
            md`At $Q_m$ the gap between buyers' value (80) and cost (40) is 40: DWL $= \tfrac12(20)(40) = 400$.`, { figHtml: g8 }),
          RF(md`
            ### Picture 9: natural monopoly and regulation

            DS10 Q2: $P = 28 - Q$, $C(Q) = 80 + 4Q$, so $AC = 4 + 80/Q$ (always falling) and $MC = 4$.

            [[fig:g9]]

            | Point | Rule | $Q$, $P$ | Profit | DWL |
            |---|---|---|---|---|
            | M | unregulated, $MR = MC$ | 12, 16 | $(16 - 10.67)(12) = 64$ | $\tfrac12(24 - 12)(16 - 4) = 72$ |
            | A | ceiling at $P = AC$ | 20, 8 | 0 | $\tfrac12(24 - 20)(8 - 4) = 8$ |
            | K | ceiling at $P = MC$ | 24, 4 | $-80$ (rectangle L) | 0 |

            Rectangle L is the loss under $P = MC$: height $AC(24) - MC = 7.33 - 4 = 3.33$, width 24, area 80 = the fixed cost. Without a subsidy the firm exits in the long run.
          `, { g9: { svg: g9, cap: 'Natural monopoly. M: unregulated. A: average-cost pricing (zero profit). K: marginal-cost pricing (efficient, but a loss L equal to the fixed cost).' } }),
          Q(md`In picture 9, why does the firm lose money at point K?`, ['AC is falling, so MC is below AC: a price equal to MC is below AC', 'MC is rising', 'demand is inelastic at K', 'the regulator taxes it'], 0,
            [null, 'MC is flat here (4).', 'Elasticity does not decide profit under a ceiling.', 'There is no tax in this problem.'],
            md`Falling AC means MC < AC. Price = MC < AC gives $\pi = (P - AC)Q < 0$; here exactly $-F = -80$.`, { figHtml: g9 }),
          R(md`
            ### Spot it: which area?
          `),
          S(md`A monopolist has rising MC. A classmate computes the DWL as $\tfrac12(Q_c - Q_m)(P_m - P_c)$, where $P_c$ is the competitive price.`,
            plan('Is that right?', 'No: the height is $P_m - MC(Q_m)$, the gap between demand and MC at $Q_m$', [
              ['Yes, that is the formula', 'With rising MC, $MC(Q_m)$ is below $P_c$, so that height leaves out the producer part of the DWL.'],
              ['No: the base should be $Q_m$', 'The base is the units lost: $Q_c - Q_m$.'],
              ['No: there should be no ½', 'It is a triangle (straight curves), so the ½ belongs.'],
            ], 'Two parts make the DWL: C (between demand and $P_c$) and D (between $P_c$ and MC). Height $= P_m - MC(Q_m)$ covers both.')),
          S(md`Under a support price, a classmate writes "$W = CS + PS + G$, where G is government spending."`,
            plan('What is wrong?', 'Government **spending** is a cost to taxpayers: subtract it', [
              ['Nothing: the formula sheet says $+G$', 'On the sheet, $G$ is government **revenue** (as from a tax). Spending is negative revenue.'],
              ['G should be left out entirely', 'The money comes from taxpayers; ignoring it makes the support look free.'],
              ['G should be added to PS only', 'It is still a cost to society however you assign it.'],
            ], '$W = CS + PS - 13{,}500$ in DS9. The policy changes $W$ by $-11{,}250$.')),
          S(md`Under a binding floor, a rectangle sits between the old price and the floor over the units still sold. A classmate counts it in the DWL.`,
            plan('Is it a loss?', 'No: it is a transfer from consumers to producers', [
              ['Yes: consumers lose it', 'Consumers lose it, but producers gain the same dollars. Society loses nothing on those units.'],
              ['Yes, half of it', 'There is no half rule for transfers; the whole rectangle moves from one group to the other.'],
              ['It is government revenue', 'There is no tax: the money goes to sellers.'],
            ], 'DWL is only the triangle on the units that no longer trade.')),
          P({ title: 'Label and compute every area: a tax', q: md`Demand $P = 60 - Q$, supply $P = Q$. A \$10 per-unit tax is imposed.`,
            plan: [
              plan('What is your first equation?', '$60 - Q = Q + 10$: the demand height and the supply height differ by $t$ at the traded $Q$', [
                ['$60 - Q = Q$, then subtract 10 from the price', 'That finds the old equilibrium; the tax changes the quantity.'],
                ['$60 - Q = Q - 10$', 'Buyers pay more than sellers keep: demand height = supply height **plus** $t$.'],
                ['$60 - Q + 10 = Q$', 'That puts the wedge the wrong way round.'],
              ], '$2Q = 50 \\Rightarrow Q = 25$; $P_c = 35$, $P_p = 25$.'),
              plan('The DWL triangle’s base is…', '$Q^* - Q_t = 30 - 25$', [
                ['$Q_t = 25$', 'The triangle covers only the units that stop trading.'],
                ['$Q^* = 30$', 'Same problem: only the lost units.'],
                ['$P_c - P_p = 10$', 'That is the height.'],
              ], 'DWL $= \\tfrac12(5)(10)$.'),
            ],
            parts: [N('CS', 312.5), N('PS', 312.5), N('\\text{tax revenue}', 250), N('DWL', 25)],
            sol: md`
              **Move 1: the wedge.** $60 - Q = Q + 10 \Rightarrow Q = 25$; $P_c = 60 - 25 = 35$, $P_p = 25$. Before the tax: $Q^* = 30$, $P^* = 30$.

              **Move 2: each area.**
              - CS $= \tfrac12(25)(60 - 35) = 312.5$
              - PS $= \tfrac12(25)(25 - 0) = 312.5$
              - Revenue $= 10 \times 25 = 250$
              - DWL $= \tfrac12(30 - 25)(10) = 25$

              Check: before, $W = \tfrac12(30)(60) = 900$. After: $312.5 + 312.5 + 250 = 875 = 900 - 25$. ✓
            ` }),
          P({ title: 'Label and compute every area: a monopoly', q: md`A monopolist faces $P = 100 - Q$ and has constant $MC = 20$. Find CS, PS and DWL.`,
            plan: [
              plan('What is the shape of PS here?', 'A rectangle: $(P_m - 20) \\times Q_m$, because MC is flat', [
                ['A triangle under the price', 'With flat MC, the area between the price and MC is a rectangle.'],
                ['$P_m \\times Q_m$', 'That is total revenue; PS takes away the cost of each unit.'],
                ['Zero: monopolies have no producer surplus', 'Monopoly PS is large: that is the point of the markup.'],
              ], '$MR = 100 - 2Q = 20 \\Rightarrow Q_m = 40$, $P_m = 60$; efficient $Q_c = 80$.'),
            ],
            parts: [N('CS', 800), N('PS', 1600), N('DWL', 800)],
            sol: md`
              **Move 1: $MR = MC$.** $100 - 2Q = 20 \Rightarrow Q_m = 40$; $P_m = 100 - 40 = 60$. **Benchmark:** $100 - Q = 20 \Rightarrow Q_c = 80$.

              **Move 2: the areas.**
              - CS $= \tfrac12(40)(100 - 60) = 800$ (triangle above 60)
              - PS $= (60 - 20)(40) = 1600$ (rectangle above flat MC)
              - DWL $= \tfrac12(80 - 40)(60 - 20) = 800$ (triangle from $Q_m$ to $Q_c$)
            ` }),
        ],
      },
      // ================================================================ m3-math
      {
        id: 'm3-math', title: 'Math moves you will need', ref: 'Formula sheet · Lectures 14–19',
        steps: [
          R(md`
            ### What this looks like on the exam

            | The math move | Where it shows up |
            |---|---|
            | solve a linear equation for $P$ or $Q$; invert demand or supply | every equilibrium; every area (you need the intercepts); monopoly MR |
            | power rule | MC from $C(q)$; MR from $TR(Q)$; the bottom of AVC, AC, LRAC |
            | partial derivative | $MP_1 = \partial f/\partial x_1$ for $p\,MP_1 = w_1$ |
            | set a derivative to zero, or set MC = average | shutdown price, break-even price, long-run price |
            | quadratic formula and choosing the root | $P = MC$ with a cubic cost; $P = AC$ regulation |
            | rectangle, triangle, trapezoid | profit, revenue, CS, PS, DWL, government spending |
            | percent shares | tax incidence; ad valorem $P_p = (1 - v)P_c$ |
            | elasticity at a point | Lerner index, the elastic portion, $MR = P(1 + 1/\varepsilon)$ |

            Every one of these is on the formula sheet. The skill is knowing **which** one a line of the problem needs.
          `),
          R(md`
            ### Move 1: invert a linear curve

            Economists draw price on the vertical axis, so you will switch between two forms all the time:

            - **Direct** form: quantity as a function of price, $Q = 600 - 10P$.
            - **Inverse** form: price as a function of quantity, $P = 60 - Q/10$.

            To invert, solve for the other letter. Start with $Q = 600 - 10P$. Move the $P$ term to the left and $Q$ to the right:
            $$10P = 600 - Q$$
            Divide both sides by 10:
            $$P = 60 - \frac{Q}{10}$$

            **What the two numbers mean.** 60 is the **choke price**: at $P = 60$ nobody buys. It is the top corner of the CS triangle. $\tfrac{1}{10}$ is how much the price must fall to sell one more unit.

            !!method When you need which form
              - **Equilibrium:** either works, as long as both curves are in the **same** form. $Q_d(P) = Q_s(P)$ is usually fastest.
              - **Adding supply curves:** direct form ($q = \ldots$), then add.
              - **Monopoly MR, areas, DWL heights:** inverse form ($P = \ldots$).

            !!trap Mixing forms
              $600 - 10P = Q/10$ sets a quantity equal to a price. Before you set two curves equal, put them in the same form.
          `),
          Q(md`Invert $Q_s = 4P - 20$.`, ['P = 5 + Q/4', 'P = 4Q − 20', 'P = Q/4 − 5', 'P = 20 + Q/4'], 0,
            [null, 'That swaps the letters without solving.', 'Add 20 before dividing: $4P = Q + 20$, so $P = Q/4 + 5$.', 'Divide the 20 by 4 as well.'],
            md`$Q = 4P - 20 \Rightarrow 4P = Q + 20 \Rightarrow P = 5 + Q/4$. Supply starts at \$5.`),
          Q(md`Demand is $Q = 300 - 5P$. The height of the CS triangle at price $P$ is…`, ['60 − P', '300 − P', 'P', '300 − 5P'], 0,
            [null, '300 is the quantity intercept; the triangle height is measured in dollars.', 'CS sits above the price, so you need the choke price minus the price.', 'That is the quantity demanded, the triangle’s base.'],
            md`Inverse demand $P = 60 - Q/5$: choke price 60. Height $= 60 - P$, base $= Q$.`),
          R(md`
            ### Move 2: derivatives of cost (power rule) and partial derivatives

            The power rule: $\dfrac{d}{dq}\,q^n = n\,q^{n-1}$. A constant has derivative 0.

            **Example.** $C(q) = q^3 - 8q^2 + 30q + 5$. Take each term:
            $$MC = 3q^2 - 16q + 30$$
            The 5 disappears: fixed cost never affects MC.

            **Averages: divide every term by $q$.** $AVC = \dfrac{VC}{q} = \dfrac{q^3 - 8q^2 + 30q}{q} = q^2 - 8q + 30$. $AC = AVC + \dfrac{5}{q}$.

            **Partial derivatives.** For $q = f(x_1, x_2)$, $MP_1 = \partial f / \partial x_1$: differentiate in $x_1$ and treat $x_2$ as a number.

            Example: $q = 4x_1^{1/2}x_2^{1/2}$.
            $$MP_1 = 4 \cdot \tfrac12 x_1^{-1/2} \cdot x_2^{1/2} = \frac{2\sqrt{x_2}}{\sqrt{x_1}}$$
            With $\bar x_2 = 4$: $MP_1 = 4/\sqrt{x_1}$. That is DS8 Q1.

            !!trap Exponent slips
              $\dfrac{d}{dx}\sqrt{x} = \dfrac{1}{2\sqrt x}$, not $\dfrac{1}{\sqrt x}$. And $\dfrac{d}{dq}\dfrac{100}{q} = -\dfrac{100}{q^2}$: write $100/q$ as $100q^{-1}$ first.
          `),
          Q(md`$C(q) = 5q^2 + 20q + 80$. Then $MC$ is…`, ['10q + 20', '5q + 20', '10q + 20 + 80/q', '5q + 20 + 80/q'], 0,
            [null, 'Bring the exponent down: $d(5q^2)/dq = 10q$.', 'The fixed cost differentiates to zero.', 'That is AC.'],
            md`$\dfrac{d}{dq}(5q^2) = 10q$, $\dfrac{d}{dq}(20q) = 20$, $\dfrac{d}{dq}(80) = 0$.`),
          Q(md`$q = 10x_1^{1/2}x_2^{1/2}$ with $\bar x_2 = 9$. Then $MP_1$ is…`, ['15/√x₁', '30/√x₁', '5/√x₁', '30√x₁'], 0,
            [null, 'You forgot the ½ from the power rule.', 'You dropped the $\\sqrt{9} = 3$.', 'The exponent goes from ½ to −½: $x_1$ ends up in the denominator.'],
            md`$q = 10 \cdot 3\,x_1^{1/2} = 30x_1^{1/2}$; $MP_1 = 30 \cdot \tfrac12 x_1^{-1/2} = 15/\sqrt{x_1}$.`),
          R(md`
            ### Move 3: find the bottom of an average curve

            Shutdown price, break-even price, long-run price: each is the **minimum of an average** (AVC, AC, LRAC). Two ways, same answer:

            **Way A: derivative equal to zero.** $AVC = q^2 - 8q + 30$:
            $$\frac{dAVC}{dq} = 2q - 8 = 0 \;\Rightarrow\; q = 4$$

            **Way B: MC equals the average** (MC cuts every average at its bottom):
            $$3q^2 - 16q + 30 = q^2 - 8q + 30 \;\Rightarrow\; 2q^2 - 8q = 0 \;\Rightarrow\; 2q(q - 4) = 0 \;\Rightarrow\; q = 4$$

            Then the **price** is the average at that $q$: $AVC(4) = 16 - 32 + 30 = 14$.

            **With a $1/q$ term (DS9):** $LRAC = 2q + 8/q$.
            $$\frac{dLRAC}{dq} = 2 - \frac{8}{q^2} = 0 \;\Rightarrow\; q^2 = 4 \;\Rightarrow\; q = 2$$
            (not $-2$: output is positive). Long-run price $= LRAC(2) = 4 + 4 = 8$.

            !!trap Reporting $q$ when the question asks for a price
              "What is the shutdown price?" wants $AVC(q_{\min})$, a dollar figure, not $q_{\min}$.
          `),
          Q(md`To find the break-even price for $C(q) = 3q^2 + 75$, you…`, ['set MC = AC: 6q = 3q + 75/q, then evaluate AC there', 'set MC = AVC', 'set MC = 0', 'set AC = 0'], 0,
            [null, 'That gives the shutdown price (here 0).', 'MC = 0 at q = 0; that tells you nothing.', 'AC is never zero with a fixed cost.'],
            md`$6q = 3q + 75/q \Rightarrow 3q^2 = 75 \Rightarrow q = 5$. Break-even price $= AC(5) = 15 + 15 = 30$.`),
          R(md`
            ### Move 4: the quadratic formula, and which root

            $$aq^2 + bq + c = 0 \;\Rightarrow\; q = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

            You get two roots. Economics picks one:

            | Where it comes from | The two roots | Keep |
            |---|---|---|
            | $P = MC$ with a U-shaped MC | one on the falling branch, one on the rising branch | the **larger** (rising MC: a profit max) |
            | $P = MC$ giving one negative root | e.g. $q = 6$ and $q = -2/3$ | the **positive** one |
            | $P(Q) = AC(Q)$ regulation | both give zero profit | the **larger** $Q$ (lower price, less DWL) |
            | $MC = AVC$ written as $2q^2 - 8q = 0$ | $q = 0$ and $q = 4$ | $q = 4$ ($q = 0$ is not a real output for an average) |

            **Example (DS10 Q2).** $28 - Q = 4 + 80/Q$. Multiply both sides by $Q$:
            $$28Q - Q^2 = 4Q + 80$$
            Collect everything on one side:
            $$Q^2 - 24Q + 80 = 0$$
            Formula with $a = 1$, $b = -24$, $c = 80$:
            $$Q = \frac{24 \pm \sqrt{576 - 320}}{2} = \frac{24 \pm 16}{2} = 20 \text{ or } 4$$
            Keep $Q = 20$; then $P = 28 - 20 = 8$.
          `),
          Q(md`Solving $P = MC$ for a U-shaped MC gives $q = 0.56$ and $q = 4.78$. The firm produces…`, ['4.78', '0.56', 'the average, 2.67', 'either one'], 0,
            [null, 'At 0.56 MC is falling: the next units cost less than the price, so profit is still rising there.', 'There is nothing special about the average of the roots.', 'Only the rising-branch root is a maximum.'],
            md`The larger root is on the rising branch of MC: the profit maximum (if the price covers min AVC).`),
          R(md`
            ### Move 5: areas

            | Shape | Formula | Typical use |
            |---|---|---|
            | rectangle | base $\times$ height | TR, TC, profit, tax revenue, government spending, a transfer |
            | triangle | $\tfrac12 \times$ base $\times$ height | CS, PS, DWL with straight curves |
            | trapezoid | $\tfrac12(b_1 + b_2) \times h$ | CS under a ceiling, PS under a floor, a change in PS |

            **Trapezoid example (lecture ceiling at \$18).** CS lies under demand $P = 40 - Q/5$, above 18, over the 90 units sold. Its left side is $40 - 18 = 22$ tall; its right side, at $Q = 90$, is $22 - 18 = 4$ tall. Width 90:
            $$CS = \tfrac12(22 + 4)(90) = 1170$$
            Same area, split into simple shapes: the triangle above 22, $\tfrac12(90)(40 - 22) = 810$, plus the rectangle from 18 to 22, $(22 - 18)(90) = 360$. Total 1170. ✓

            ### Move 6: percent shares

            Tax incidence (formula sheet): consumer share $= \dfrac{P_c - P^*}{t}$, producer share $= \dfrac{P^* - P_p}{t}$. They add to 1.

            Example: $Q_d = 120 - 2P$, $Q_s = 4P$, so $P^* = 20$. A \$6 tax: $120 - 2(P_p + 6) = 4P_p \Rightarrow P_p = 18$, $P_c = 24$. Consumer share $= 4/6 = 66.7\%$, producer share $= 2/6 = 33.3\%$. Buyers respond less (2 units per dollar vs 4), so they bear more. ✓

            **Ad valorem:** $P_p = (1 - v)P_c$. A 40% tax means sellers keep 60% of what buyers pay.

            ### Move 7: elasticity at a point

            $$\varepsilon = \frac{dQ}{dP}\cdot\frac{P}{Q}$$
            $Q = 100 - 2P$ at $P = 30$: $Q = 40$, $\dfrac{dQ}{dP} = -2$, so $\varepsilon = -2 \cdot \dfrac{30}{40} = -1.5$. Then $MR = P\left(1 + \dfrac{1}{\varepsilon}\right) = 30\left(1 - \dfrac{1}{1.5}\right) = 10$.
          `),
          Q(md`Demand is $Q = 100 - 2P$. At $P = 30$, the price elasticity of demand is…`, ['−1.5', '−0.67', '−2', '−60'], 0,
            [null, 'That is $\\frac{dP}{dQ}\\cdot\\frac{P}{Q}$ upside down. Use $\\frac{dQ}{dP} = -2$ times $P/Q = 30/40$.', 'That is only the slope $dQ/dP$; multiply by $P/Q$.', 'Use $P/Q$, not $P \\times Q$.'],
            md`$Q = 40$ at $P = 30$. $\varepsilon = (-2)(30/40) = -1.5$: elastic.`),
          Q(md`A 25% ad valorem tax. Buyers pay \$80. Sellers keep…`, ['\\$60', '\\$55', '\\$100', '\\$64'], 0,
            [null, 'That subtracts 25 dollars; the tax is 25 **percent** of 80.', 'Sellers keep less than buyers pay.', 'That is 80% of 80.'],
            md`$P_p = (1 - v)P_c = 0.75 \times 80 = 60$.`),
          R(md`
            ### Practice: plan first, then the math
          `),
          P({ title: 'Invert, solve, triangle', q: md`$Q_d = 300 - 5P$ and $Q_s = 10P - 60$. Find $P^*$ and $Q^*$, then consumer surplus.`,
            plan: [
              plan('First equation?', '$300 - 5P = 10P - 60$', [
                ['$60 - Q/5 = 10P - 60$', 'Inverse demand against direct supply: a price set equal to a quantity.'],
                ['$300 - 5P = 0$', 'That is the choke point; you need supply too.'],
                ['$300 + 10P = 5P + 60$', 'Sign slips: move each term across carefully.'],
              ], '$15P = 360 \\Rightarrow P^* = 24$.'),
              plan('For CS you need the height of the triangle. What is the top corner?', 'The choke price: set $Q_d = 0$, $P = 60$', [
                ['300', 'That is the quantity intercept, not a price.'],
                ['The price where supply starts, 6', 'That is the bottom corner of the **PS** triangle.'],
                ['$P^* = 24$', 'CS lies **above** the price; you need the corner above it.'],
              ], 'CS $= \\tfrac12 \\times Q^* \\times (60 - 24)$.'),
            ],
            parts: [N('P^*', 24), N('Q^*', 180), N('CS', 3240)],
            sol: md`
              **Move 1:** $300 - 5P = 10P - 60 \Rightarrow 360 = 15P \Rightarrow P^* = 24$. $Q^* = 300 - 120 = 180$ (check: $240 - 60 = 180$ ✓).

              **Move 2: invert demand.** $P = 60 - Q/5$. Choke price 60.

              **Move 3:** $CS = \tfrac12(180)(60 - 24) = 90 \times 36 = 3240$.
            ` }),
          P({ title: 'Shutdown price from a cubic', q: md`$C(q) = 2q^3 - 12q^2 + 40q + 50$. Find the output at minimum AVC and the shutdown price.`,
            plan: [
              plan('What is AVC?', '$AVC = 2q^2 - 12q + 40$: drop the 50 and divide by $q$', [
                ['$2q^2 - 12q + 40 + 50/q$', 'That is AC. AVC leaves out the fixed cost 50.'],
                ['$6q^2 - 24q + 40$', 'That is MC (the derivative), not the average.'],
                ['$2q^3 - 12q^2 + 40q$', 'That is VC; divide by $q$ to average it.'],
              ], 'Then set $dAVC/dq = 4q - 12 = 0$ (or $MC = AVC$).'),
            ],
            parts: [N('q_{\\min AVC}', 3), N('P_{\\text{shutdown}}', 22)],
            sol: md`
              **Move 1:** $VC = 2q^3 - 12q^2 + 40q$, so $AVC = 2q^2 - 12q + 40$.

              **Move 2:** $\dfrac{dAVC}{dq} = 4q - 12 = 0 \Rightarrow q = 3$. (Check with $MC = 6q^2 - 24q + 40$: $MC(3) = 54 - 72 + 40 = 22 = AVC(3)$ ✓.)

              **Move 3:** shutdown price $= AVC(3) = 18 - 36 + 40 = 22$.
            ` }),
          P({ title: 'Which root?', q: md`A competitive firm has $MC = 3q^2 - 12q + 20$ and min AVC well below \$56. The price is \$56. How much does it produce?`,
            plan: [
              plan('After $56 = 3q^2 - 12q + 20$, what do you do?', 'Write $3q^2 - 12q - 36 = 0$, divide by 3, factor or use the formula', [
                ['Divide both sides by $q$', 'There is a constant term: dividing by $q$ does not isolate anything.'],
                ['Take the square root of both sides', 'There is a $-12q$ term; you need the quadratic formula or factoring.'],
                ['Set $3q^2 = 56$', 'You cannot drop the other terms.'],
              ], '$q^2 - 4q - 12 = 0 \\Rightarrow (q - 6)(q + 2) = 0$.'),
              plan('The roots are 6 and −2. Which one?', '$q = 6$', [
                ['$q = -2$', 'Output cannot be negative.'],
                ['Both', 'Only one is an output, and it is on the rising branch of MC.'],
                ['Neither: shut down', 'The price is above min AVC, so the firm produces.'],
              ], 'Keep the positive root on the rising branch: $q = 6$.'),
            ],
            parts: [N('q^*', 6)],
            sol: md`$3q^2 - 12q + 20 = 56 \Rightarrow 3q^2 - 12q - 36 = 0 \Rightarrow q^2 - 4q - 12 = 0$. Formula: $q = \dfrac{4 \pm \sqrt{16 + 48}}{2} = \dfrac{4 \pm 8}{2} = 6$ or $-2$. Keep $q = 6$. Check: $MC(6) = 108 - 72 + 20 = 56$ ✓.` }),
          P({ title: 'A partial derivative', q: md`$q = 6x_1^{1/3}x_2^{1/2}$ with capital fixed at $\bar x_2 = 9$. Find $MP_1$ at $x_1 = 8$.`,
            plan: [
              plan('How do you differentiate in $x_1$?', 'Treat $x_2^{1/2} = 3$ as a number: $MP_1 = 6 \\cdot \\tfrac13 x_1^{-2/3} \\cdot 3$', [
                ['Differentiate both factors (product rule)', '$x_2$ is held constant in a partial derivative: only $x_1$ changes.'],
                ['$MP_1 = 6 \\cdot \\tfrac13 x_1^{1/3 - 1}$, dropping the $x_2$ factor', 'The $x_2^{1/2} = 3$ stays as a multiplier.'],
                ['$MP_1 = q/x_1$', 'That is the average product, not the marginal product.'],
              ], '$MP_1 = 6x_1^{-2/3}$; at $x_1 = 8$: $8^{-2/3} = 1/4$.'),
            ],
            parts: [N('MP_1', 1.5)],
            sol: md`$MP_1 = 6 \cdot \tfrac13 x_1^{-2/3} \cdot 9^{1/2} = 2 \cdot 3 \cdot x_1^{-2/3} = 6x_1^{-2/3}$. At $x_1 = 8$: $8^{2/3} = 4$, so $MP_1 = 6/4 = 1.5$.` }),
          P({ title: 'A trapezoid', q: md`Market supply is $P = 2 + Q$. The price rises from \$6 to \$9. By how much does producer surplus rise?`,
            plan: [
              plan('What shape is the extra PS?', 'A trapezoid between the two price lines, left of supply: $\\tfrac12(4 + 7)(9 - 6)$', [
                ['A triangle, $\\tfrac12(7 - 4)(9 - 6)$', 'That is only the small corner by the supply curve. The strip over the first 4 units counts too.'],
                ['A rectangle, $(9 - 6) \\times 7$', 'Units 4 to 7 do not all earn the full \\$3 extra: the supply curve cuts in.'],
                ['$9 \\times 7 - 6 \\times 4$', 'That is the change in revenue; PS also subtracts the cost of the new units.'],
              ], 'Quantities: 4 at \\$6, 7 at \\$9. Parallel sides 4 and 7, height 3.'),
            ],
            parts: [N('\\Delta PS', 16.5)],
            sol: md`At \$6: $Q = 4$, PS $= \tfrac12(4)(4) = 8$. At \$9: $Q = 7$, PS $= \tfrac12(7)(7) = 24.5$. Change $= 16.5$. As one trapezoid: $\tfrac12(4 + 7)(3) = 16.5$ ✓.` }),
          P({ title: 'Incidence shares', q: md`$Q_d = 120 - 2P$ and $Q_s = 4P$. A \$6 per-unit tax is imposed. What share of the tax do consumers bear?`,
            plan: [
              plan('What do you need first?', 'The no-tax price $P^* = 20$ and the new $P_c$ from $120 - 2P_c = 4(P_c - 6)$', [
                ['Only $P_c$', 'The share compares $P_c$ with the **old** price: you need $P^*$ too.'],
                ['The ratio of the slopes, 2/4', 'Slopes tell you who bears more, but the share needs the prices.'],
                ['Half, as always', 'Half only when both sides respond equally.'],
              ], '$120 - 2P_c = 4P_c - 24 \\Rightarrow P_c = 24$. Consumer share $= (24 - 20)/6$.'),
            ],
            parts: [N('P_c', 24), N('P_p', 18), N('\\text{consumer share (\\%)}', 66.67)],
            sol: md`$P^*$: $120 - 2P = 4P \Rightarrow P^* = 20$. With the tax ($P_p = P_c - 6$): $120 - 2P_c = 4P_c - 24 \Rightarrow 6P_c = 144 \Rightarrow P_c = 24$, $P_p = 18$. Consumer share $= (24 - 20)/6 = 66.7\%$; producer share $= (20 - 18)/6 = 33.3\%$. Buyers respond less (2 units per dollar against 4), so they bear more.` }),
          G('m3_math_invert', { need: 2 }),
          G('m3_math_minavg', { need: 2 }),
          G('m3_math_root', { need: 2 }),
        ],
      },
    ],
  });
})();

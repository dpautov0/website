/* Unit 14 — transistor capacitances, one pole per node, the CS/CE stage exactly, Miller's theorem, and the simplified
   CS/CE response (uploaded Lecture 28). Numbers in the worked problems were checked against an exact complex nodal
   solve of the two-node model (poles from the determinant, zero from the numerator). */
(function () {
  'use strict';
  const { R, RF, P, G, Q } = C;
  const L = (l) => E3.lesson('e3u14', l);
  const f = U.fmt;

  // ---------------------------------------------------------------- figures
  // NPN high-frequency (hybrid-pi) model
  const hpi = [
    ['term', [-0.6, 0], { n: 'B', side: 'l' }], ['w', [-0.6, 0], [1.4, 0]],
    ['C', [0.2, 0], [0.2, 2], { n: 'C_\\pi', side: 'l' }], ['R', [1.4, 0], [1.4, 2], { n: 'r_\\pi', side: 'l' }],
    ['vlab', [1.8, 0.35], [1.8, 1.65], { n: 'v_\\pi' }],
    ['w', [1.4, 0], [1.4, -0.9]], ['C', [1.4, -0.9], [3.6, -0.9], { n: 'C_\\mu' }], ['w', [3.6, -0.9], [3.6, 0]],
    ['G', [3.6, 0], [3.6, 2], { n: 'g_mv_\\pi' }], ['w', [3.6, 0], [5.4, 0]], ['R', [5, 0], [5, 2], { n: 'r_o' }],
    ['term', [5.4, 0], { n: 'C', side: 'r' }],
    ['w', [0.2, 2], [5, 2]], ['w', [2.6, 2], [2.6, 2.5]], ['term', [2.6, 2.5], { n: 'E', side: 'r' }],
  ];
  // NMOS high-frequency model
  const mosHF = [
    ['term', [-0.6, 0], { n: 'G', side: 'l' }], ['w', [-0.6, 0], [1.2, 0]],
    ['C', [0.4, 0], [0.4, 2], { n: 'C_{gs}', side: 'l' }], ['vlab', [1.2, 0.35], [1.2, 1.65], { n: 'v_1' }],
    ['w', [1.2, 0], [1.2, -0.9]], ['C', [1.2, -0.9], [3.2, -0.9], { n: 'C_{gd}' }], ['w', [3.2, -0.9], [3.2, 0]],
    ['G', [3.2, 0], [3.2, 2], { n: 'g_mv_1' }], ['w', [3.2, 0], [5.4, 0]], ['C', [4.6, 0], [4.6, 1.2], { n: 'C_{db}' }], ['gnd', [4.6, 1.2]],
    ['term', [5.4, 0], { n: 'D', side: 'r' }],
    ['w', [0.4, 2], [3.2, 2]], ['C', [2, 2], [2, 3.2], { n: 'C_{sb}' }], ['gnd', [2, 3.2]], ['w', [3.2, 2], [4, 2]], ['term', [4, 2], { n: 'S', side: 'r' }],
  ];
  // a CS or CE stage with its capacitors (the notes' first picture)
  function stage(bjt, cs = {}) {
    const n = (a, b) => (bjt ? b : a);
    return [
      ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [-0.6, 1.4], [-0.6, 1]],
      ['R', [-0.6, 1], [0.8, 1], { n: 'R_S', s: cs.RS }], ['w', [0.8, 1], [2, 1]],
      ['C', [1.4, 1], [1.4, 2.2], { n: n('C_{gs}', 'C_\\pi'), s: cs.C1, side: 'l' }], ['gnd', [1.4, 2.2]],
      ['w', [1.4, 1], [1.4, -0.4]], ['C', [1.4, -0.4], [3, -0.4], { n: n('C_{gd}', 'C_\\mu'), s: cs.C2 }], ['w', [3, -0.4], [3, 0]],
      [bjt ? 'npn' : 'nmos', [3, 1]], ['gnd', [3, 2]],
      ['R', [3, -1.7], [3, -0.4], { n: 'R_L', s: cs.RL }], ['rail', [3, -1.7]],
      ['w', [3, -0.4], [4.8, -0.4]], ['term', [4.8, -0.4], { n: 'v_{out}' }],
      ['C', [4.2, -0.4], [4.2, 0.8], { n: 'C_L', s: cs.CL }], ['gnd', [4.2, 0.8]],
    ];
  }
  // the lecture's general two-node model (CS and CE alike)
  const twoNode = [
    ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{TH}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [-0.6, 1.4], [-0.6, 1]],
    ['R', [-0.6, 1], [0.8, 1], { n: 'R_{TH}' }], ['w', [0.8, 1], [1.6, 1]], ['node', [1.2, 1], { n: 'X', side: 'a' }],
    ['C', [1.2, 1], [1.2, 2.2], { n: 'C_{in}', side: 'l' }], ['gnd', [1.2, 2.2]],
    ['w', [1.6, 1], [1.6, -0.2]], ['C', [1.6, -0.2], [3, -0.2], { n: 'C_{xy}' }], ['w', [3, -0.2], [3, 0.4]],
    ['G', [3, 0.4], [3, 2.2], { n: 'g_mv_X', side: 'l' }], ['gnd', [3, 2.2]], ['w', [3, -0.2], [5.4, -0.2]], ['node', [3.6, -0.2], { n: 'Y', side: 'a' }],
    ['C', [4, -0.2], [4, 1], { n: 'C_{out}' }], ['gnd', [4, 1]], ['R', [4.8, -0.2], [4.8, 1], { n: 'R_L' }], ['gnd', [4.8, 1]], ['term', [5.4, -0.2], { n: 'v_{out}' }],
  ];
  // the notes' three node examples
  const ex1 = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['w', [1, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'v_{out}' }],
    ['C', [2, 0], [2, 1.2], { n: 'C_L' }], ['gnd', [2, 1.2]], ['nmos', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
  const ex2 = [['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_L' }], ['w', [3, 0], [4.6, 0]], ['term', [4.6, 0], { n: 'v_{out}' }],
    ['C', [4, 0], [4, 1.2], { n: 'C_L' }], ['gnd', [4, 1.2]], ['nmos', [3, 1]], ['gnd', [3, 2]],
    ['R', [0.2, 1], [1.4, 1], { n: 'R_S' }], ['w', [1.4, 1], [2, 1]], ['node', [1.6, 1], { n: 'X', side: 'a' }], ['C', [1.6, 1], [1.6, 2.2], { n: 'C_{in}', side: 'l' }], ['gnd', [1.6, 2.2]],
    ['w', [0.2, 1], [-0.4, 1], [-0.4, 1.4]], ['Vac', [-0.4, 1.4], [-0.4, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.4, 2.4]]];
  const ex3 = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['w', [1, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'v_{out}' }],
    ['C', [2, 0], [2, 1.2], { n: 'C_L' }], ['gnd', [2, 1.2]], ['nmos', [1, 1]], ['acg', [0, 1]],
    ['w', [1, 2], [1, 2.3]], ['node', [1, 2.3], { n: 'X', side: 'l' }], ['w', [1, 2.3], [2.2, 2.3]], ['C', [2.2, 2.3], [2.2, 3.5], { n: 'C_{in}' }], ['gnd', [2.2, 3.5]],
    ['R', [1, 2.3], [1, 3.5], { n: 'R_S', side: 'l' }], ['Vac', [1, 3.5], [1, 4.5], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.5]]];
  // Miller
  const millerA = [['term', [0, 1], { n: 'v_{in}', side: 'l' }], ['w', [0, 1], [1, 1]], ['box', [1, 0.4], [2.6, 1.6], { n: '$-A_0$' }], ['w', [2.6, 1], [3.8, 1]], ['term', [3.8, 1], { n: 'v_{out}', side: 'r' }],
    ['w', [0.5, 1], [0.5, -0.3]], ['C', [0.5, -0.3], [3.2, -0.3], { n: 'C_F' }], ['w', [3.2, -0.3], [3.2, 1]], ['node', [0.5, 1], { n: '1', side: 'b' }], ['node', [3.2, 1], { n: '2', side: 'b' }]];
  const millerB = [['term', [0, 1], { n: 'v_{in}', side: 'l' }], ['w', [0, 1], [1, 1]], ['box', [1, 0.4], [2.6, 1.6], { n: '$-A_0$' }], ['w', [2.6, 1], [3.8, 1]], ['term', [3.8, 1], { n: 'v_{out}', side: 'r' }],
    ['C', [0.5, 1], [0.5, 2.2], { n: '(1 + A_0)C_F', side: 'l' }], ['gnd', [0.5, 2.2]], ['C', [3.2, 1], [3.2, 2.2], { n: '(1 + \\tfrac{1}{A_0})C_F' }], ['gnd', [3.2, 2.2]]];

  // worked numbers (checked in the scratch solver)
  const W1 = (() => {          // CS: RS 10k, Cgs 100f, Cgd 20f, gm 4m, RL 10k, Cout 200f
    const RTH = 1e4, Cin = 100e-15, Cxy = 20e-15, Cout = 200e-15, gm = 4e-3, RL = 1e4;
    const a = RTH * RL * (Cin * Cxy + Cout * Cxy + Cin * Cout), b = (1 + gm * RL) * Cxy * RTH + RTH * Cin + RL * (Cxy + Cout);
    const d = Math.sqrt(b * b - 4 * a);
    return { a, b, wp1: 1 / b, wp2: b / a, r1: (b - d) / (2 * a), r2: (b + d) / (2 * a), wz: gm / Cxy,
      win: 1 / (RTH * (Cin + (1 + gm * RL) * Cxy)), wout: 1 / (RL * (Cout + (1 + 1 / (gm * RL)) * Cxy)) };
  })();
  const W2 = (() => {          // CE: gm 40m, beta 100, RS 1k, Cpi 10p, Cmu 1p, RL 2k, CL 2p
    const gm = 40e-3, rpi = 100 / gm, RS = 1e3, RTH = U.par(RS, rpi), Cpi = 10e-12, Cmu = 1e-12, RL = 2e3, CL = 2e-12;
    const A = gm * RL, Cm = (1 + A) * Cmu;
    return { rpi, RTH, A, Cm, win: 1 / (RTH * (Cpi + Cm)), wout: 1 / (RL * (CL + (1 + 1 / A) * Cmu)) };
  })();

  // ================================================================ 1. where the capacitors are
  L({
    id: 'e3-u14-caps', title: 'Where the capacitors are: high-frequency transistor models', ref: 'Lecture 28',
    steps: [
      R(md`
        ### Why this lesson

        Every pole in an amplifier comes from a capacitor, and most of those capacitors live **inside the transistors**. Before you can find a pole you have to know where each one sits: between which two terminals. That is all this lesson is, and it is the first thing to do on any frequency problem: draw the capacitors onto the circuit.
      `),
      R(md`
        ### The BJT: $C_\pi$ and $C_\mu$

        - $C_{je}$: the depletion capacitance of the base–emitter junction.
        - $C_b$: the base-charging (accumulation, or diffusion) capacitance, the bigger of the two.
        - Together they sit in parallel from base to emitter: $C_\pi = C_b + C_{je}$, right across $r_\pi$.
        - $C_\mu$: the depletion capacitance of the base–collector junction, **from the base to the collector**.
      `, hpi),
      R(md`
        ### The NMOS: four capacitors

        - $C_{gs}$: gate to source (the channel under the gate), the big one.
        - $C_{gd}$: gate to drain (overlap), small, but it **bridges input and output** of a common source.
        - $C_{db}$, $C_{sb}$: the drain–bulk and source–bulk junctions. The bulk is ground, so these go from the drain or source **to ground**.
      `, mosHF),
      R(md`
        ### The twins, side by side

        | Between | MOSFET | BJT | In a common source / emitter it is... |
        |---|---|---|---|
        | input terminal and the common terminal | $C_{gs}$ | $C_\pi$ | from the input node to ground |
        | input terminal and the output terminal | $C_{gd}$ | $C_\mu$ | **bridging input and output** (Miller, later) |
        | output terminal and ground (substrate) | $C_{db}$ | ($C_{cs}$, often ignored) | at the output, adds to $C_L$ |
        | common terminal and ground | $C_{sb}$ | | shorted out when the source is grounded |

        **One difference to remember:** $C_\pi$ sits **in parallel with $r_\pi$**. A gate has nothing but $C_{gs}$; a base has $r_\pi$ too. So the resistance at a base node is never just the source resistance.
      `),
      RF(md`
        ### The CE and CS stages with their capacitors

        Put the models into a common emitter and a common source driven through $R_S$ (Lecture 28). The two small-signal circuits are almost the same: input node $X$ with a capacitor to ground, output node $Y$ with a capacitor and $R_L$ to ground, one capacitor bridging $X$ and $Y$, and $g_mv_X$ pulling current out of $Y$. The only difference is $r_\pi$ at the BJT's input.

        [[fig:ce]]

        So both reduce to one **two-node model**:

        [[fig:two]]

        | Two-node model | Common source | Common emitter |
        |---|---|---|
        | $R_{TH}$ | $R_S$ | $R_S\parallel r_\pi$ (Thévenin of $v_{in}$, $R_S$ and $r_\pi$) |
        | $v_{TH}$ | $v_{in}$ | $v_{in}\,\dfrac{r_\pi}{R_S + r_\pi}$ |
        | $C_{in}$ | $C_{gs}$ | $C_\pi$ |
        | $C_{xy}$ | $C_{gd}$ | $C_\mu$ |
        | $C_{out}$ | $C_{db} + C_L$ | $C_L$ |
        | $R_L$ | $R_D\parallel r_{ds}$ | $R_C\parallel r_o$ |

        Solve the two-node model once and you have solved both stages.
      `, { ce: { fig: stage(true) }, two: { fig: twoNode } }),
      Q(md`In a common-emitter amplifier, which capacitor connects the input node to the output node?`,
        ['$C_\\mu$ (base to collector)', '$C_\\pi$ (base to emitter)', '$C_L$', 'None'], 0,
        [null, '$C_\\pi$ goes from the base to the emitter, which is grounded in a CE: it is from the input to ground.', '$C_L$ is from the output to ground.', 'The base–collector junction capacitance does.'],
        md`Input = base, output = collector: $C_\mu$ bridges them. It is the BJT twin of $C_{gd}$.`),
      Q(md`A common source with its source tied straight to ground. What happens to $C_{sb}$?`,
        ['Nothing: both its ends are at ground, so it never charges', 'It adds to $C_{gs}$', 'It adds to the output capacitance', 'It gets Miller-multiplied'], 0,
        [null, '$C_{sb}$ is from the source to the bulk, not to the gate.', 'It touches the source, not the drain.', 'Miller needs a capacitor between two nodes that move.'],
        md`Source and bulk are both ground: zero volts across $C_{sb}$, always. It matters only when the source moves (a follower, a common gate, a degenerated stage).`),
      Q(md`Why is $R_{TH}$ for a common emitter $R_S\parallel r_\pi$, but just $R_S$ for a common source?`,
        ['A base draws current through $r_\\pi$ to the emitter; a gate draws none', 'Because $C_\\pi$ is bigger than $C_{gs}$', 'Because $\\beta$ divides $R_S$', 'It is $R_S$ for both'], 0,
        [null, 'Capacitors do not enter $R_{TH}$; it is the resistance with the capacitors removed.', 'That is the emitter-side $(\\beta + 1)$ rule, not the base node.', 'A base is not an open circuit: $r_\\pi$ is a resistor to the (grounded) emitter.'],
        md`Looking into the base with the emitter grounded you see $r_\pi$ (Unit 11). Thévenin of $v_{in}$, $R_S$ and $r_\pi$: $R_{TH} = R_S\parallel r_\pi$. Looking into a gate you see $\infty$.`),
    ],
  });

  // ================================================================ 2. one pole per node
  L({
    id: 'e3-u14-node', title: 'One pole per node: $R\\times C$ at that node', ref: 'Lecture 28',
    steps: [
      R(md`
        ### Why this lesson

        This is the fastest frequency-response tool you have, and it is pure Exam 2: find the resistance at a node ([Unit 7](#/l/e2-u7-node) for MOSFETs, Unit 11 for BJTs), multiply by the capacitance there, invert. When each capacitor sits from a node to ground and no capacitor bridges two nodes, every node gives its own pole and you are done.
      `),
      R(md`
        ### The rule (Lecture 28)

        $$\omega_p = \frac{1}{(\text{total resistance seen from the node to ground})\times(\text{total capacitance from the node to ground})}$$

        "Seen" means: set the input source to zero (a voltage source becomes a short), and find the resistance from that node to ground, exactly as in Exam 2. What each terminal contributes:

        | The node touches... | It adds (in parallel) |
        |---|---|
        | a gate | nothing ($\infty$) |
        | a base (emitter grounded) | $r_\pi$ |
        | a source or emitter (gate/base held) | about $1/g_m$ |
        | a drain or collector (source/emitter grounded) | $r_{ds}$ or $r_o$ |
        | a resistor to ground, $V_{DD}$, or an ideal source | that resistor |
      `),
      RF(md`
        ### The notes' three examples (transistor capacitances ignored)

        **(1) Load capacitor at the drain.** The drain node sees $R_L$ (and $r_{ds}$, infinite here):
        $$\omega_{p,out} = \frac{1}{R_LC_L}$$

        [[fig:e1]]

        **(2) Add a source resistance and an input capacitance.** Node $X$ (the gate) sees $R_S$ back through the source, and nothing through the gate:
        $$\omega_{p,X} = \frac{1}{R_SC_{in}},\qquad \omega_{p,out} = \frac{1}{R_LC_L}$$

        [[fig:e2]]

        **(3) Common gate.** Node $X$ is now a **source**. It sees $R_S$ in parallel with looking into the source, $1/g_m$:
        $$\omega_{p,X} = \frac{1}{(R_S\parallel\tfrac{1}{g_m})\,C_{in}},\qquad \omega_{p,out} = \frac{1}{R_LC_L}$$
        Because $R_S\parallel1/g_m$ is small, the common-gate input node is **fast**. Recognize it: a capacitor on a low-resistance node (a source, an emitter) makes a high-frequency pole.

        [[fig:e3]]
      `, { e1: { fig: ex1 }, e2: { fig: ex2 }, e3: { fig: ex3 } }),
      R(md`
        ### When the rule is exact, and when it is not

        Each pole is exact when every capacitor goes from a node to ground and the nodes do not "talk" through a capacitor. In a common source, $C_{gd}$ bridges the gate and the drain, so the two poles are coupled. Two ways out, next lessons: solve the two-node circuit exactly, or use **Miller** to split $C_{gd}$ into two grounded capacitors. Unit 15's time-constant method handles any number of capacitors.
      `),
      Q(md`A common source and a common gate both have $R_S = 1\kO$ at the input and $C_{in} = 1\,\text{pF}$ at the input node; $g_m = 5\,\text{mS}$. Which input node is faster?`,
        ['The common gate: its input node sees $R_S\\parallel1/g_m\\approx167\\,\\Omega$', 'The common source: a gate is an open circuit', 'They are the same: both see $R_S$', 'The common gate, because it has no $C_{gd}$'], 0,
        [null, 'An open circuit adds **nothing in parallel**, so the gate node sees all of $R_S$: that makes it slower.', 'The common-gate node is a source, which adds $1/g_m$ in parallel.', 'It does have a $C_{gd}$ (at the output). The point is the resistance at the input node.'],
        md`CS gate node: $R = R_S = 1\kO$, $\omega_p = 10^9\,\text{rad/s}$. CG source node: $R = 1\kO\parallel200\,\Omega = 167\,\Omega$, $\omega_p = 6\times10^9\,\text{rad/s}$. Low resistance, fast node.`),
      P({
        id: 'e3-u14-cg', title: 'The common gate: two node poles',
        q: md`Common gate as in example (3): $R_S = 1\kO$, $g_m = 5\,\text{mS}$, $r_{ds}\to\infty$, $C_{in} = 1\,\text{pF}$ at the source, $R_L = 10\kO$, $C_L = 1\,\text{pF}$. Find both poles and say which one sets the bandwidth.`,
        fig: ex3,
        parts: [
          { lbl: 'R_X', unit: 'Ω', ans: 1e3 / 6, traps: [{ v: 1000, msg: 'Node $X$ is a source: looking into it you see $1/g_m = 200\\,\\Omega$, in parallel with $R_S$.' }, { v: 200, msg: 'That is the source alone. $R_S$ back to the (zeroed) input source is in parallel with it.' }] },
          { lbl: '\\omega_{p,X}', unit: 'Grad/s', ans: 6, traps: [{ v: 1, msg: 'With $R_S$ alone you get $10^9$; the node also sees $1/g_m$ in parallel.' }] },
          { lbl: '\\omega_{p,out}', unit: 'Mrad/s', ans: 100 },
          { lbl: 'Which pole sets the bandwidth?', mc: ['The output pole (the lower one)', 'The input pole'], a: 0, why: [null, 'The input pole is at $6\\times10^9$, sixty times higher than the output pole.'] },
        ],
        hints: [md`$X$ touches $R_S$ (to the zeroed source, i.e. ground) and the transistor's source (gate held): $R_X = R_S\parallel\tfrac{1}{g_m}$.`],
        sol: md`**Node $X$:** $R_X = R_S\parallel\dfrac1{g_m} = 1\kO\parallel200\,\Omega = 167\,\Omega$, so
$$\omega_{p,X} = \frac{1}{167\,\Omega\times1\,\text{pF}} = 6\times10^9\,\text{rad/s}$$
**Output:** looking into the drain of a common gate with $r_{ds}\to\infty$ is infinite, so the node sees $R_L$:
$$\omega_{p,out} = \frac{1}{10\kO\times1\,\text{pF}} = 10^8\,\text{rad/s}$$
The lower pole, $10^8\,\text{rad/s}$ ($f\approx15.9\,\text{MHz}$), sets the bandwidth: the output node, where the resistance is big.`,
      }),
      G('e3_node_pole', { need: 6 }),
    ],
  });

  // ================================================================ 3. the CS/CE stage exactly
  L({
    id: 'e3-u14-exact', title: 'The CS/CE stage exactly: two poles and a zero', ref: 'Lecture 28',
    steps: [
      R(md`
        ### Why this lesson

        The bridging capacitor couples the two nodes, so "one pole per node" is no longer exact. Here the lecture solves the two-node model honestly. You will rarely redo the algebra on the exam, but you need to **recognize the answer**: which term in the denominator is the Miller effect, why there is a zero in the right half plane, and why the dominant pole is $1/b$.
      `, twoNode),
      R(md`
        ### KCL at the two nodes

        Current through $C_{xy}$ from $Y$ to $X$ is $(v_{out} - v_X)C_{xy}s$.

        **Node $X$:** $(v_{out} - v_X)C_{xy}s = \dfrac{v_X - v_{TH}}{R_{TH}} + v_XC_{in}s$

        **Node $Y$:** $(v_X - v_{out})C_{xy}s = g_mv_X + v_{out}C_{out}s + \dfrac{v_{out}}{R_L}$

        From $Y$: $v_X = v_{out}\dfrac{C_{xy}s + C_{out}s + 1/R_L}{C_{xy}s - g_m}$. Put that into $X$ and simplify:
        $$\frac{v_{out}}{v_{TH}} = \frac{(C_{xy}s - g_m)R_L}{as^2 + bs + 1}$$
        $$a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out})$$
        $$b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$$

        **Check at $s = 0$:** $v_{out}/v_{TH} = -g_mR_L$. ✓ The usual gain.
      `),
      R(md`
        ### The zero: $\omega_z = g_m/C_{xy}$, in the right half plane

        The numerator vanishes at $s = +g_m/C_{xy}$. At that frequency the current coming **forward** through $C_{xy}$ (not inverted) exactly cancels the current $g_mv_X$ pulled by the transistor (inverted), and nothing reaches the output. Because the zero is at a **positive** $s$, it is a right-half-plane zero: $(1 - s/\omega_z)$, magnitude up, phase down ([Unit 13](#/l/e3-u13-zero)). It is usually far above the poles ($C_{xy}$ is tiny, $g_m$ is big).
      `),
      R(md`
        ### The poles: the dominant-pole approximation

        $as^2 + bs + 1 = (1 + s/\omega_{p1})(1 + s/\omega_{p2}) = \dfrac{s^2}{\omega_{p1}\omega_{p2}} + \Big(\dfrac1{\omega_{p1}} + \dfrac1{\omega_{p2}}\Big)s + 1$.

        If $\omega_{p2}\gg\omega_{p1}$, the first pole **dominates**, $\tfrac1{\omega_{p1}} + \tfrac1{\omega_{p2}}\approx\tfrac1{\omega_{p1}}$, so
        $$\omega_{p1}\approx\frac1b = \frac{1}{(1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})},\qquad \omega_{p2}\approx\frac{b}{a}$$

        **Read $b$ term by term, and you will recognize it everywhere:**
        - $R_{TH}C_{in}$: the input capacitor with the input resistance.
        - $R_L(C_{xy} + C_{out})$: the output capacitors with the output resistance.
        - $(1 + g_mR_L)C_{xy}R_{TH}$: the bridging capacitor, **multiplied by $1 + g_mR_L$**, seen from the input. This is the Miller effect, and it is usually the biggest term.

        Each term is a resistance times one capacitor. That pattern is exactly Unit 15's open-circuit time constants: $b = \sum R_{jo}C_j$.
      `),
      P({
        id: 'e3-u14-exact1', title: 'Exact versus dominant pole',
        q: md`Common source: $R_S = 10\kO$, $C_{gs} = 100\,\text{fF}$, $C_{gd} = 20\,\text{fF}$, $g_m = 4\,\text{mS}$, $R_L = 10\kO$ ($r_{ds}\to\infty$), $C_{out} = 200\,\text{fF}$. Find $b$, the dominant-pole estimate $\omega_{p1}\approx1/b$, the estimate $\omega_{p2}\approx b/a$, and the zero.`,
        fig: stage(false, { RS: '10\\kO', C1: '100\\,\\text{fF}', C2: '20\\,\\text{fF}', RL: '10\\kO', CL: '200\\,\\text{fF}' }),
        parts: [
          { lbl: 'b', unit: 'ns', ans: W1.b * 1e9, traps: [{ v: (20e-15 * 1e4 + 1e4 * 100e-15 + 1e4 * 220e-15) * 1e9, msg: 'The $C_{xy}R_{TH}$ term carries $(1 + g_mR_L) = 41$.' }] },
          { lbl: '\\omega_{p1}', unit: 'Mrad/s', ans: W1.wp1 / 1e6, accept: [W1.r1 / 1e6] },
          { lbl: '\\omega_{p2}', unit: 'Grad/s', ans: W1.wp2 / 1e9, accept: [W1.r2 / 1e9] },
          { lbl: '\\omega_z', unit: 'Grad/s', ans: W1.wz / 1e9 },
        ],
        hints: [md`$g_mR_L = 40$. $b = 41\times20\,\text{fF}\times10\kO + 10\kO\times100\,\text{fF} + 10\kO\times220\,\text{fF}$.`],
        sol: md`$g_mR_L = 40$.
$$b = \underbrace{41\times20\,\text{fF}\times10\kO}_{8.2\,\text{ns}} + \underbrace{10\kO\times100\,\text{fF}}_{1\,\text{ns}} + \underbrace{10\kO\times220\,\text{fF}}_{2.2\,\text{ns}} = 11.4\,\text{ns}$$
$$a = 10^4\cdot10^4\,(100\cdot20 + 200\cdot20 + 100\cdot200)\times10^{-30} = 2.6\times10^{-18}\,\text{s}^2$$
$$\omega_{p1}\approx\frac1b = ${f(W1.wp1 / 1e6, 4)}\,\text{Mrad/s},\qquad \omega_{p2}\approx\frac ba = ${f(W1.wp2 / 1e9, 4)}\,\text{Grad/s}$$
The exact roots of $as^2 + bs + 1$ are $${f(W1.r1 / 1e6, 4)}\,\text{Mrad/s}$ and $${f(W1.r2 / 1e9, 4)}\,\text{Grad/s}$: the poles are about 50 times apart, so each estimate is off by only about 2%.
$$\omega_z = \frac{g_m}{C_{gd}} = \frac{4\,\text{mS}}{20\,\text{fF}} = 200\,\text{Grad/s}$$
far above both poles. **Notice:** the Miller term ($8.2\,\text{ns}$) is most of $b$, although $C_{gd}$ is the smallest capacitor.`,
      }),
      G('e3_cs_exact', { need: 3 }),
    ],
  });

  // ================================================================ 4. Miller's theorem
  L({
    id: 'e3-u14-miller', title: "Miller's theorem", ref: 'Lecture 28',
    steps: [
      R(md`
        ### Why this lesson

        The exact two-node algebra is long. Miller's theorem gets the important answer, the input pole, in one line: it replaces a bridging capacitor by two capacitors to ground, so "one pole per node" works again. The exam expects you to recognize where it applies and use it.
      `),
      R(md`
        ### The theorem

        An impedance $Z_F$ between node 1 and node 2, where $v_2 = A_vv_1$, can be replaced by $Z_1$ from node 1 to ground and $Z_2$ from node 2 to ground, **if** each draws the same current from its node as $Z_F$ did.

        **Node 1:** $\dfrac{v_1 - v_2}{Z_F} = \dfrac{v_1}{Z_1}\;\Rightarrow\; Z_1 = Z_F\dfrac{v_1}{v_1 - v_2} = \dfrac{Z_F}{1 - A_v}$

        **Node 2:** $\dfrac{v_1 - v_2}{Z_F} = \dfrac{0 - v_2}{Z_2}\;\Rightarrow\; Z_2 = \dfrac{Z_F}{1 - 1/A_v}$

        For a capacitor, $Z_F = 1/(sC_F)$; dividing an impedance by a number multiplies the capacitance:
        $$C_1 = (1 - A_v)\,C_F,\qquad C_2 = \Big(1 - \frac{1}{A_v}\Big)C_F$$
      `),
      RF(md`
        ### The case that matters: an inverting amplifier

        With $A_v = -A_0$:
        $$C_1 = (1 + A_0)C_F,\qquad C_2 = \Big(1 + \frac{1}{A_0}\Big)C_F\approx C_F$$

        [[fig:a]]

        [[fig:b]]

        **The intuition (a see-saw).** Push the input up $1\,\text{mV}$; the output goes down $A_0\,\text{mV}$. The capacitor sees $(1 + A_0)\,\text{mV}$ across it, so it pulls $(1 + A_0)$ times the current a grounded $C_F$ would. "A capacitor connected between the input and output of an inverting amplifier with a gain of $A_0$ raises the input capacitance by $(1 + A_0)$."
      `, { a: { fig: millerA }, b: { fig: millerB } }),
      R(md`
        ### The gain decides everything

        | Gain $A_v$ from node 1 to node 2 | Capacitance seen at node 1, $(1 - A_v)C_F$ | Where you meet it |
        |---|---|---|
        | $-A_0$, large | $(1 + A_0)C_F$: huge | $C_{gd}$ in a common source, $C_\mu$ in a common emitter |
        | about $-1$ | about $2C_F$ | $C_{gd1}$ in a cascode |
        | $0$ (node 2 held) | $C_F$ | $C_{gd}$ of a common gate (gate at ground) |
        | about $+1$ | about $0$ | $C_{gs}$ of a source follower, $C_\pi$ of an emitter follower |

        **Caution.** Miller uses one number for $A_v$, the low-frequency gain. The real gain falls at high frequency, so Miller is an approximation: it gets the input pole well, it misses the right-half-plane zero, and the output-side $C_2$ is only rough.
      `),
      Q(md`A $50\,\text{fF}$ capacitor connects the input and output of an amplifier with gain $-19$. What capacitance does the input see?`,
        ['$1\\,\\text{pF}$', '$950\\,\\text{fF}$', '$50\\,\\text{fF}$', '$-900\\,\\text{fF}$'], 0,
        [null, 'That is $A_0C_F$: the factor is $1 + A_0 = 20$.', 'That ignores the gain across the capacitor.', 'With an inverting gain, $1 - A_v = 1 + 19 = 20$: positive.'],
        md`$(1 + 19)\times50\,\text{fF} = 1000\,\text{fF} = 1\,\text{pF}$.`),
      Q(md`A capacitor connects the input and output of a voltage follower (gain $+0.95$). From the input it looks like...`,
        ['$0.05\\,C$: almost nothing', '$1.95\\,C$', '$C$', '$20\\,C$'], 0,
        [null, 'That would be a gain of $-0.95$.', 'Only if the output were held still.', 'That would be a gain of $-19$.'],
        md`$(1 - 0.95)C = 0.05C$. The output follows the input, so the capacitor barely charges: it is "bootstrapped". That is why $C_{gs}$ and $C_\pi$ hardly load the input of a follower.`),
      G('e3_miller', { need: 4 }),
    ],
  });

  // ================================================================ 5. CS / CE with Miller
  L({
    id: 'e3-u14-csce', title: 'CS and CE with Miller: the input pole and the output pole', ref: 'Lecture 28',
    steps: [
      R(md`
        ### Why this lesson

        This is the frequency-response calculation you are most likely to do on the exam: a common source or common emitter, find its two poles and its bandwidth. With Miller it is two "one pole per node" calculations. Then the recognition question: which stages suffer from Miller, and which escape it.
      `),
      RF(md`
        ### The simplified CS response (Lecture 28)

        $C_{gd}$ bridges the gate and the drain; the gain between them is $-g_mR_L$. Split it:
        $$C_1 = (1 + g_mR_L)C_{gd}\ \text{at the gate},\qquad C_2 = \Big(1 + \frac{1}{g_mR_L}\Big)C_{gd}\ \text{at the drain}$$
        Now each node is $1/RC$:
        $$\omega_{p,in} = \frac{1}{R_S\,[C_{gs} + (1 + g_mR_L)C_{gd}]},\qquad \omega_{p,out} = \frac{1}{R_L\,[C_L + (1 + \tfrac1{g_mR_L})C_{gd}]}$$

        [[fig:cs]]

        ### The CE twin

        Same picture with $C_{gs}\to C_\pi$, $C_{gd}\to C_\mu$, and one change at the input: the base adds $r_\pi$ to ground, so $R_S\to R_S\parallel r_\pi$:
        $$\omega_{p,in} = \frac{1}{(R_S\parallel r_\pi)\,[C_\pi + (1 + g_mR_L)C_\mu]},\qquad \omega_{p,out} = \frac{1}{R_L\,[C_L + (1 + \tfrac1{g_mR_L})C_\mu]}$$

        **Compare with the exact $b$:** Miller's input time constant $R_S[C_{gs} + (1 + g_mR_L)C_{gd}]$ is exactly the first two terms of $b$. When the input is the slow node, Miller and the dominant-pole estimate agree.
      `, { cs: { fig: stage(false) } }),
      P({
        id: 'e3-u14-csm', title: 'The same common source with Miller',
        q: md`The common source of the previous lesson: $R_S = 10\kO$, $C_{gs} = 100\,\text{fF}$, $C_{gd} = 20\,\text{fF}$, $g_m = 4\,\text{mS}$, $R_L = 10\kO$, $C_L = 200\,\text{fF}$. Use Miller. Find the Miller capacitance at the input and both poles.`,
        fig: stage(false, { RS: '10\\kO', C1: '100\\,\\text{fF}', C2: '20\\,\\text{fF}', RL: '10\\kO', CL: '200\\,\\text{fF}' }),
        parts: [
          { lbl: '(1 + g_mR_L)C_{gd}', unit: 'fF', ans: 820, traps: [{ v: 800, msg: 'The factor is $1 + g_mR_L = 41$, not $40$.' }] },
          { lbl: '\\omega_{p,in}', unit: 'Mrad/s', ans: W1.win / 1e6, traps: [{ v: 1 / (1e4 * 100e-15) / 1e6, msg: 'Add the Miller capacitance to $C_{gs}$.' }] },
          { lbl: '\\omega_{p,out}', unit: 'Mrad/s', ans: W1.wout / 1e6 },
        ],
        hints: [md`Input: $10\kO\times(100 + 820)\,\text{fF}$. Output: $10\kO\times(200 + 20.5)\,\text{fF}$.`],
        sol: md`$g_mR_L = 40$, so $C_1 = 41\times20\,\text{fF} = 820\,\text{fF}$ and $C_2 = 1.025\times20\,\text{fF} = 20.5\,\text{fF}$.
$$\omega_{p,in} = \frac{1}{10\kO\times920\,\text{fF}} = \frac{1}{9.2\,\text{ns}} = ${f(W1.win / 1e6, 4)}\,\text{Mrad/s}$$
$$\omega_{p,out} = \frac{1}{10\kO\times220.5\,\text{fF}} = \frac{1}{2.205\,\text{ns}} = ${f(W1.wout / 1e6, 4)}\,\text{Mrad/s}$$
The input pole sets the bandwidth. The exact dominant pole was $${f(W1.r1 / 1e6, 4)}\,\text{Mrad/s}$; Miller's $${f(W1.win / 1e6, 4)}$ is ${f(100 * (W1.win / W1.r1 - 1), 2)}% high because it leaves out the output's share of $b$ (the $2.2\,\text{ns}$). Miller's output pole is far off the exact second pole ($${f(W1.r2 / 1e9, 3)}\,\text{Grad/s}$): Miller is only rough on the output side.`,
      }),
      P({
        id: 'e3-u14-cem', title: 'A common emitter with Miller',
        q: md`Common emitter: $I_C = 1\,\text{mA}$ ($g_m = 40\,\text{mS}$), $\beta = 100$, $r_o\to\infty$, $R_S = 1\kO$, $C_\pi = 10\,\text{pF}$, $C_\mu = 1\,\text{pF}$, $R_L = 2\kO$, $C_L = 2\,\text{pF}$. Find $R_{TH}$, the Miller capacitance, and both poles.`,
        fig: stage(true, { RS: '1\\kO', C1: '10\\,\\text{pF}', C2: '1\\,\\text{pF}', RL: '2\\kO', CL: '2\\,\\text{pF}' }),
        parts: [
          { lbl: 'R_{TH}', unit: 'Ω', ans: W2.RTH, traps: [{ v: 1000, msg: 'The base adds $r_\\pi = \\beta/g_m = 2.5\\kO$ to ground: $R_{TH} = R_S\\parallel r_\\pi$.' }] },
          { lbl: '(1 + g_mR_L)C_\\mu', unit: 'pF', ans: W2.Cm * 1e12 },
          { lbl: '\\omega_{p,in}', unit: 'Mrad/s', ans: W2.win / 1e6, traps: [{ v: 1 / (1e3 * 91e-12) / 1e6, msg: 'At a base the resistance is $R_S\\parallel r_\\pi$, not $R_S$.' }] },
          { lbl: '\\omega_{p,out}', unit: 'Mrad/s', ans: W2.wout / 1e6 },
        ],
        hints: [md`$r_\pi = \beta/g_m = 2.5\kO$; $R_{TH} = 1\kO\parallel2.5\kO$. $g_mR_L = 80$.`],
        sol: md`$r_\pi = 100/40\,\text{mS} = 2.5\kO$, so $R_{TH} = 1\kO\parallel2.5\kO = ${f(W2.RTH, 4)}\,\Omega$. $g_mR_L = 80$:
$$C_M = 81\times1\,\text{pF} = 81\,\text{pF}\quad(\text{eight times }C_\pi)$$
$$\omega_{p,in} = \frac{1}{${f(W2.RTH, 4)}\,\Omega\times91\,\text{pF}} = ${f(W2.win / 1e6, 4)}\,\text{Mrad/s}\quad(f\approx${f(W2.win / 2e6 / Math.PI, 3)}\,\text{MHz})$$
$$\omega_{p,out} = \frac{1}{2\kO\times(2 + 1.0125)\,\text{pF}} = ${f(W2.wout / 1e6, 4)}\,\text{Mrad/s}$$
The input pole is ten times lower: it sets the bandwidth, and it is low because a $1\,\text{pF}$ $C_\mu$ became $81\,\text{pF}$.`,
      }),
      R(md`
        ### Recognition: who suffers from Miller?

        Find the input node and the output node, then ask: **does a transistor capacitor connect those two nodes, and what is the gain between them?**

        | Stage | Input → output | Bridging capacitor | Gain across it | Result |
        |---|---|---|---|---|
        | Common source / emitter | gate → drain, base → collector | $C_{gd}$ / $C_\mu$ | $-g_mR_L$, big | **Miller: $(1 + g_mR_L)$×, slow input** |
        | Common gate / base | source → drain, emitter → collector | none ($C_{gd}$, $C_\mu$ go to the held gate/base) | | no Miller: fast |
        | Source / emitter follower | gate → source, base → emitter | $C_{gs}$ / $C_\pi$ | about $+1$ | bootstrapped away: fast input |
        | Cascode (input device) | gate → drain of $M_1$ | $C_{gd1}$ | about $-g_{m1}/g_{m2}\approx-1$ | only about $2C_{gd1}$ |

        The cascode works because $M_1$'s drain is the source of $M_2$, a low-resistance node ($\approx1/g_{m2}$): the big gain only appears at $M_2$'s drain, where no capacitor reaches back to the input.
      `),
      Q(md`Why does a cascode have a much higher bandwidth than a common source with the same load?`,
        ['$C_{gd1}$ only sees a gain of about $-1$ (to the low-resistance node), so it is about doubled, not multiplied by $1 + g_mR_L$', 'The cascode has no $C_{gd}$', 'The cascode has a smaller $g_m$', 'The cascode\'s output resistance is lower'], 0,
        [null, 'Both transistors have a $C_{gd}$; what changes is the gain across $M_1$\'s.', 'Same input device, same $g_m$.', 'It is much **higher** ($g_mr_{ds}$ times), which if anything slows the output node.'],
        md`$M_1$'s drain sees $\approx1/g_{m2}$, so the gain from gate to drain of $M_1$ is $-g_{m1}/g_{m2}\approx-1$: $C_{gd1}$ becomes about $2C_{gd1}$ at the input.`),
      Q(md`In a common-gate amplifier, $C_{gd}$ connects...`,
        ['the output (drain) to incremental ground (the held gate): it just adds to the output capacitance', 'the input to the output, so it is Miller-multiplied', 'the input to ground', 'nothing: a common gate has no $C_{gd}$'], 0,
        [null, 'The input of a common gate is the **source**. The gate is held at a bias.', '$C_{gd}$ touches the drain, which is the output.', 'Every MOSFET has a $C_{gd}$.'],
        md`Gate held = incremental ground. $C_{gd}$ goes from the output to ground: no bridge, no Miller.`),
      G('e3_cs_miller', { need: 3 }),
      G('e3_ce_miller', { need: 3 }),
      G('e3_bw_node', { need: 4 }),
      G('e3_miller_which', { need: 6 }),
    ],
  });

  // ================================================================ 6. mixed drill
  L({
    id: 'e3-u14-mix', title: 'Unit 14 mixed drill', kind: 'review', ref: 'Lecture 28',
    steps: [
      R(md`Every Unit 14 skill, mixed: a pole at a node (MOS and BJT, gate, base, source, emitter, drain, collector), Miller's theorem, the CS and CE poles with Miller, the exact two-node model, which node sets the bandwidth, and which capacitor gets Miller-multiplied. Ten in a row without opening a solution completes it.`),
      G('e3_node_pole', { need: 10, pool: ['e3_node_pole', 'e3_miller', 'e3_cs_miller', 'e3_ce_miller', 'e3_cs_exact', 'e3_bw_node', 'e3_miller_which'] }),
    ],
  });
})();

/* Exam 3 Start: the five-second read. How to look at any transistor circuit (MOSFET or BJT) and know, before any
   algebra, what each device is doing, what every node looks like, and what every capacitor sees. Then six circuits
   read aloud, then the gym. */
(function () {
  'use strict';
  const { R, RF, Q } = C;
  const L = (l) => E3.lesson('e3start', l);
  const lbl = (x, y, t) => ['txt', [x, y], `$${t}$`];
  const vinAt = (x, y) => [['w', [x, y], [x - 0.6, y], [x - 0.6, y + 0.4]], ['Vac', [x - 0.6, y + 0.4], [x - 0.6, y + 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [x - 0.6, y + 1.4]]];

  // the four devices, leads labelled
  const four = [
    ['nmos', [1, 1], { n: '\\text{NMOS}' }], lbl(1.35, -0.1, 'D'), lbl(-0.15, 0.75, 'G'), lbl(1.35, 2.15, 'S'), ['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]], ['gnd', [1, 2]],
    ['pmos', [4, 1], { n: '\\text{PMOS}' }], lbl(4.35, -0.1, 'S'), lbl(2.85, 0.75, 'G'), lbl(4.35, 2.15, 'D'), ['w', [4, 0], [4, -0.4]], ['rail', [4, -0.4]], ['gnd', [4, 2]],
    ['npn', [7, 1], { n: '\\text{NPN}' }], lbl(7.35, -0.1, 'C'), lbl(5.85, 0.75, 'B'), lbl(7.35, 2.15, 'E'), ['w', [7, 0], [7, -0.4]], ['rail', [7, -0.4]], ['gnd', [7, 2]],
    ['pnp', [10, 1], { n: '\\text{PNP}' }], lbl(10.35, -0.1, 'E'), lbl(8.85, 0.75, 'B'), lbl(10.35, 2.15, 'C'), ['w', [10, 0], [10, -0.4]], ['rail', [10, -0.4]], ['gnd', [10, 2]],
  ];

  // six circuits to read
  const figA = [['pnp', [1, 0], { n: 'Q_2' }], ['acg', [0, 0]], ['rail', [1, -1]], ['npn', [1, 2], { n: 'Q_1' }], ['gnd', [1, 3]], ...vinAt(0, 2), ['w', [1, 1], [2, 1]], ['term', [2, 1], { n: 'v_{out}' }]];
  const figB = [['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ...vinAt(0, 1), ['nmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]], ['gnd', [1, 4]], ['w', [1, 2], [2, 2]], ['term', [2, 2], { n: 'v_{out}' }]];
  const figC = [['pmos', [1, 0], { n: 'M_2', dc: true }], ['rail', [1, -1]], ['nmos', [1, 2], { n: 'M_1' }], ['acg', [0, 2]], ['R', [1, 3], [1, 4.2], { n: 'R_S' }], ['Vac', [1, 4.2], [1, 5.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 5.2]], ['w', [1, 1], [2, 1]], ['term', [2, 1], { n: 'v_{out}' }]];
  const figD = [['pnp', [1, 0], { n: 'Q_3' }], ['acg', [0, 0]], ['rail', [1, -1]], ['w', [1, 1], [2, 1]], ['term', [2, 1], { n: 'v_{out}' }],
    ['npn', [1, 2], { n: 'Q_2' }], ['acg', [0, 2]], ['npn', [1, 4], { n: 'Q_1' }], ['gnd', [1, 5]], ...vinAt(0, 4)];
  const figE = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ...vinAt(0, 1),
    ['node', [1, 0], { n: 'X', side: 'br' }], ['w', [1, 0], [2, 0]], ['npn', [3, 0], { n: 'Q_2' }], ['rail', [3, -1]], ['R', [3, 1], [3, 2.2], { n: 'R_E' }], ['gnd', [3, 2.2]], ['w', [3, 1], [4, 1]], ['term', [4, 1], { n: 'v_{out}' }]];
  const figF = [['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.4, 1]], ['R', [-2, 1], [-0.4, 1], { n: 'R_S' }], ['Vac', [-2, 1], [-2, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [-2, 2]],
    ['C', [-0.4, 1], [-0.4, 2], { n: 'C_\\pi', side: 'l' }], ['gnd', [-0.4, 2]], ['w', [-0.4, 1], [-0.4, 0]], ['C', [-0.4, 0], [1, 0], { n: 'C_\\mu' }],
    ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['rail', [1, -1.2]], ['w', [1, 0], [2.6, 0]], ['C', [2, 0], [2, 1], { n: 'C_L' }], ['gnd', [2, 1]], ['term', [2.6, 0], { n: 'v_{out}' }]];

  L({
    id: 'e3-start-read', title: 'The five-second read: what to look at, in what order', ref: 'Read this first',
    steps: [
      RF(md`
        ### Why this lesson

        On Exam 2 most lost points are not algebra mistakes. They happen in the first ten seconds: a PMOS read upside down, a held gate treated as moving, a diode missed, the input put on the wrong terminal. After that, every line is wrong. Exam 3 adds BJTs and capacitors, so there is more to read. This lesson is a fixed routine for reading any circuit, in the same order every time, before you write a single equation. Then the [recognition gym](#/gym) drills it until it is automatic.

        ### Step 0: which lead is which. The arrow is always on the source or emitter.

        [[fig:four]]

        | | Arrow | Source / emitter | Drain / collector | Control |
        |---|---|---|---|---|
        | NMOS | bottom lead, points **out** | bottom (toward ground) | top | gate (the plate) |
        | PMOS | top lead, points **in** | **top** (toward $V_{DD}$) | bottom | gate |
        | NPN | bottom lead, points **out** | bottom | top | base (the bar) |
        | PNP | top lead, points **in** | **top** (toward $V_{CC}$) | bottom | base |

        Memory hook: **P-type points in, and its source/emitter sits near the Power rail.** PMOS and PNP are the n-type pictures turned upside down. Never decide by "top" or "bottom" alone: the top of a PMOS is its source.
      `, { four: { fig: four, cap: 'The four devices. The arrow marks the source (MOSFET) or emitter (BJT).' } }),
      Q(md`In a circuit, the wire from your test point lands on the **top** lead of a PNP. What are you looking into?`,
        ['The emitter', 'The collector', 'The base'], 0,
        [null, 'That is the bottom lead of a PNP. P-type devices have the arrow (emitter) on top, toward the supply.', 'The base is the side lead, at the bar.'],
        md`PNP: arrow on the top lead, pointing in. The arrow marks the emitter. So the top lead is the emitter, and you will see something small (about $1/g_m$) if the base is held.`),
      R(md`
        ### Step 1: turn the drawing into its small-signal picture

        Do this in your head, all at once:
        - **Supply rails** ($V_{DD}$, $V_{CC}$) become ground. A PMOS source on $V_{DD}$ is a source on ground.
        - **Anything held still** becomes ground: a triangle, a DC voltage source, a node bypassed by a big capacitor.
        - **Ideal current sources** become open circuits (they pass a fixed current; a signal cannot change it).
        - **Big coupling capacitors** become wires (shorts for the signal, opens for DC).

        ### Step 2: for every transistor, ask what its control terminal is doing

        | The gate/base is... | Then the transistor is... |
        |---|---|
        | **held** (on a bias, a triangle, ground) | a *current source* seen from the drain/collector, a *small resistor* ($\approx 1/g_m$) seen from the source/emitter |
        | **driven by the signal** | an *input device*: its $g_m$ turns $v_{in}$ into a current |
        | **tied to its own drain/collector** | a *diode*: just a small resistor, $\approx 1/g_m$ |
        | **driven by another node of the circuit** | a feedback or second-stage device: find what moves its gate/base (the Exam 2 "K rule") |
      `),
      Q(md`A PMOS has its source on $V_{DD}$ and its gate on a fixed bias voltage. Its drain is the output node of an amplifier. In the small-signal picture it is...`,
        ['A resistor $r_{ds}$ from the output to ground', 'A short from the output to $V_{DD}$', 'A resistor $1/g_m$ from the output to ground', 'An input device'], 0,
        [null, 'A transistor with a held gate is a current source, not a wire.', 'That is a diode (gate tied to drain), or looking into a source. Here you look into the drain with the gate held.', 'Its gate is held, so the signal never reaches it.'],
        md`Gate held, source on $V_{DD}$ (= ground): $v_{gs} = 0$, the controlled source is off, and only $r_{ds}$ remains from the drain to (incremental) ground. This is the "current-source load" of every high-gain stage.`),
      R(md`
        ### Step 3: what each terminal looks like (the one table)

        With the control terminal held (or driven by an ideal source) and the other end of the device on its rail:

        | Looking into the... | MOSFET | BJT | Size |
        |---|---|---|---|
        | gate / base | $\infty$ | $r_\pi = \beta/g_m$ | infinite / kilohms |
        | gate / base, with $R$ under the source/emitter | $\infty$ | $r_\pi + (\beta + 1)R$ | infinite / bigger |
        | drain / collector | $r_{ds}$ | $r_o$ | big |
        | drain / collector, with $R$ under the source/emitter | $\approx r_{ds}(1 + g_mR)$ | $\approx r_o[1 + g_m(R\parallel r_\pi)]$ (at most $\beta r_o$) | huge |
        | source / emitter | $\approx 1/g_m$ | $\dfrac{r_\pi}{\beta + 1}\approx 1/g_m$ | small |
        | source / emitter, with $R$ in series with the gate/base | $\approx 1/g_m$ (gate draws nothing) | $\dfrac{r_\pi + R}{\beta + 1}$ | small |
        | a diode (gate/base tied to drain/collector) | $\approx 1/g_m$ | $\approx 1/g_m$ | small |

        In one line: **gate infinite, base $r_\pi$; drain and collector big; source and emitter small; diodes small.** For a BJT, a resistor seen across the base–emitter junction is **multiplied by $(\beta + 1)$ going up into the base and divided by $(\beta + 1)$ going down into the emitter.**
      `),
      Q(md`You look into the emitter of an NPN whose base is driven through $R_B = 10\,\text{k}\Omega$ from a grounded source. $\beta = 99$, $g_m = 40\,\text{mS}$ (so $r_\pi = 2.475\,\text{k}\Omega$). Roughly what do you see?`,
        ['About $125\\,\\Omega$', 'About $25\\,\\Omega$', 'About $10\\,\\text{k}\\Omega$', 'About $1.25\\,\\text{M}\\Omega$'], 0,
        [null, 'That is $1/g_m$ alone. The base resistor also shows up at the emitter, divided by $(\\beta + 1)$: $10\\,\\text{k}/100 = 100\\,\\Omega$ more.', 'Through the junction the base resistor is divided by $(\\beta + 1)$, not passed through.', 'That multiplies by $(\\beta + 1)$. Going **down** into the emitter, divide.'],
        md`$\dfrac{r_\pi + R_B}{\beta + 1} = \dfrac{2475 + 10000}{100}\approx125\,\Omega$: $1/g_m = 25\,\Omega$ plus $R_B/(\beta + 1) = 100\,\Omega$.`),
      R(md`
        ### Step 4: find the input, the output, and name the stage

        Follow $v_{in}$ to the first transistor it touches, and follow $v_{out}$ back. **The terminal that is neither is the "common" one, and it names the stage.**

        | $v_{in}$ enters the... | $v_{out}$ leaves from the... | Stage | Gain, roughly |
        |---|---|---|---|
        | gate / base | drain / collector | common source / emitter | $-g_mR_{out}$: inverting, large |
        | gate / base (resistor under the source/emitter) | drain / collector | degenerated CS / CE | $\approx -R_{out}/R_{S}$: inverting, set by resistors |
        | source / emitter (gate/base held) | drain / collector | common gate / base | $+R_{out}/(R_S + 1/g_m)$: non-inverting |
        | gate / base | source / emitter | follower (common drain / collector) | just under $+1$ |

        ### Step 5: every node is $R_{UP}\parallel R_{DN}$, and the smallest wins

        At the output (or any node), list every branch to ground **and to the supply** (also ground), read each one off the table, put them in parallel. The size ladder decides: $1/g_m\ll R, r_\pi\ll r_o\ll$ degenerated/cascoded $\ll\infty$. Then $A_v = -G_MR_{out}$ (Unit 8 and Unit 12).

        ### Step 6 (frequency): every capacitor sees a resistance

        A capacitor from a node to ground sees **that node's resistance**. A capacitor bridging the input and output of a gain stage ($C_{gd}$, $C_\mu$) sees $R_{left} + R_{right} + g_mR_{left}R_{right}$: big, because of Miller. One pole per node, $\omega_p = 1/RC$; the bandwidth is about $1/\sum RC$ (Units 14–15).
      `),
      Q(md`$v_{in}$ drives the base of an NPN. The output is taken from its emitter, which has a resistor to ground; the collector goes straight to $V_{CC}$. Before any algebra, the gain is...`,
        ['Just under $+1$', 'About $-g_mR_E$', 'About $+g_mR_E$', 'About $-1$'], 0,
        [null, 'Inverting gain comes out of the collector. The output here is the emitter.', 'That would be a common base read with the output on the collector.', 'A follower does not invert: the emitter rises with the base.'],
        md`In on the base, out on the emitter, collector on its rail: an **emitter follower** (common collector). The emitter sits one $V_{BE}$ below the base and follows it: $A_v = \dfrac{R_E}{R_E + (r_\pi + R_B)/(\beta + 1)}$, just under 1.`),
      R(md`
        ### The routine, on one card

        1. **Arrows**: mark every source/emitter.
        2. **Small-signal picture**: rails and held nodes to ground, current sources open, big capacitors shorted.
        3. **Each control terminal**: held, driven, diode, or driven by another node.
        4. **In, out, common**: name each stage.
        5. **Each node**: $R_{UP}\parallel R_{DN}$, smallest wins; then $A_v = -G_MR_{out}$.
        6. **Each capacitor**: node-to-ground sees the node; a bridge sees $R_L + R_R + g_mR_LR_R$.

        Next: [six circuits read aloud](#/l/e3-start-six), then [the gym](#/gym).
      `),
    ],
  });

  L({
    id: 'e3-start-six', title: 'Six circuits, read aloud', ref: 'The routine on real exam shapes',
    steps: [
      R(md`
        ### Why this lesson

        Reading is a skill you copy before you own. Here are six circuits in the shapes Exam 3 uses, each read aloud with the routine from the last lesson. Cover the read, say your own out loud, then compare. Each one ends with a one-tap check.
      `),
      RF(md`
        ### 1. A common emitter with a PNP load

        [[fig:a]]

        **Arrows.** $Q_1$ is an NPN: emitter at the bottom, on ground. $Q_2$ is a PNP: emitter on **top**, on $V_{CC}$.

        **Control terminals.** $Q_1$'s base gets $v_{in}$: the input device. $Q_2$'s base sits on a triangle: held, so $Q_2$ is a current source.

        **Stage.** In on $Q_1$'s base, out on its collector, emitter on ground: a **common emitter**. $G_M = g_{m1}$.

        **Output node.** Down: $Q_1$'s collector with its base driven, emitter grounded: $r_{o1}$. Up: $Q_2$'s collector with its base held: $r_{o2}$. Same size, both count: $R_{out} = r_{o1}\parallel r_{o2}$.

        $$A_v = -g_{m1}(r_{o1}\parallel r_{o2})$$

        Twin: the CMOS common source with a PMOS current-source load from Exam 2, letter for letter.
      `, { a: { fig: figA } }),
      Q(md`In circuit 1, $I_C = 1\,\text{mA}$ and $V_A = 100\,\text{V}$ for both transistors. Roughly what is the gain?`,
        ['About $-2000$', 'About $-4000$', 'About $-40$', 'About $-1$'], 0,
        [null, 'That uses $r_{o1}$ alone. $Q_2$ is in parallel and just as big, so $R_{out}$ is half of $r_o$.', 'That would need $R_{out}$ of $1\\,\\text{k}\\Omega$.', 'Only a follower has a gain near 1.'],
        md`$g_m = 40\,\text{mS}$, $r_o = 100\,\text{V}/1\,\text{mA} = 100\,\text{k}\Omega$, $R_{out} = 50\,\text{k}\Omega$: $A_v = -40\,\text{mS}\times50\,\text{k}\Omega = -2000$. Current-source loads are how a single BJT gets gains in the thousands.`),
      RF(md`
        ### 2. An emitter follower with a MOSFET current source

        [[fig:b]]

        **Arrows.** $Q_1$ NPN, emitter at the bottom. $M_2$ NMOS, source at the bottom on ground.

        **Control terminals.** $Q_1$'s base gets $v_{in}$. $M_2$'s gate is held: a current source.

        **Stage.** In on the base, out on the **emitter**, collector on $V_{CC}$: an **emitter follower**.

        **Output node.** Up: looking into $Q_1$'s emitter with an ideal source on its base: $r_\pi/(\beta + 1)\approx 1/g_{m1}$ (small). Down: $M_2$'s drain, gate held: $r_{ds2}$ (big). Smallest wins: $R_{out}\approx 1/g_{m1}$. Gain $\dfrac{r_{ds2}}{r_{ds2} + 1/g_{m1}}\approx1$.

        The point of a follower: same signal, but now from a source that looks like tens of ohms. It drives heavy loads without losing gain.
      `, { b: { fig: figB } }),
      Q(md`In circuit 2, a $1\,\text{k}\Omega$ load is hung on $v_{out}$. $g_{m1} = 40\,\text{mS}$. What happens to the gain?`,
        ['It drops only a little, to about $0.98$', 'It drops to about $0.5$', 'Nothing at all: a follower ignores its load', 'It becomes about $-40$'], 0,
        [null, 'That would be the case if $R_{out}$ were about $1\\,\\text{k}\\Omega$. It is $25\\,\\Omega$.', 'Not exactly nothing: a $25\\,\\Omega$ source into $1\\,\\text{k}\\Omega$ loses about 2%.', 'The output is still the emitter: no inversion.'],
        md`$A_v\approx\dfrac{R_L}{R_L + 1/g_m} = \dfrac{1000}{1025}\approx0.976$. The follower's low output resistance is exactly why it is used as a buffer.`),
      RF(md`
        ### 3. A common gate with a diode load

        [[fig:c]]

        **Arrows.** $M_1$ NMOS, source at the bottom. $M_2$ **PMOS**: source on top at $V_{DD}$, drain at the bottom (the output).

        **Control terminals.** $M_1$'s gate is held. $M_2$'s gate is tied to its drain: a **diode**.

        **Stage.** The signal enters $M_1$'s **source** (through $R_S$), gate held, output on the drain: **common gate**, non-inverting.

        **Output node.** Up: a PMOS diode, $1/g_{m2}$ (small). Down: $M_1$'s drain with $R_S$ under its source: huge. Smallest wins: $R_{out}\approx 1/g_{m2}$. The current entering the source is $v_{in}/(R_S + 1/g_{m1})$, and all of it comes out of the drain:

        $$A_v\approx+\frac{1/g_{m2}}{R_S + 1/g_{m1}}$$

        A diode load always means a small gain: the load is only $1/g_m$.
      `, { c: { fig: figC } }),
      Q(md`In circuit 3, $R_S = 0$ and the two transistors have equal $g_m$. The gain is about...`,
        ['$+1$', '$-1$', '$+g_mr_{ds}$', '$+g_mR_S$'], 0,
        [null, 'Common gate does not invert.', 'That would need a current-source load. The diode loads the output with only $1/g_{m2}$.', '$R_S$ is zero here.'],
        md`$A_v = (1/g_{m2})/(1/g_{m1}) = g_{m1}/g_{m2} = 1$. Diode loads give gains set by $g_m$ ratios (that is, by sizes and currents).`),
      RF(md`
        ### 4. A BJT cascode with a PNP current source

        [[fig:d]]

        **Arrows.** $Q_1$, $Q_2$ NPN (emitters down); $Q_3$ PNP (emitter up, on $V_{CC}$).

        **Control terminals.** $Q_1$'s base: $v_{in}$. $Q_2$'s base: held. $Q_3$'s base: held.

        **Stage.** $Q_1$ is a common emitter; its collector current goes up through $Q_2$, a common base (held base, current in at the emitter, out at the collector): a **cascode**. $G_M\approx g_{m1}$.

        **Output node.** Up: $Q_3$'s collector, base held: $r_{o3}$. Down: $Q_2$'s collector with $r_{o1}$ under its emitter: a degenerated collector, $\approx r_{o2}[1 + g_{m2}(r_{o1}\parallel r_{\pi2})]\approx\beta r_{o2}$, huge. Smallest wins: $R_{out}\approx r_{o3}$.

        $$A_v\approx-g_{m1}r_{o3}$$

        To use the cascode's huge resistance you need an equally good load (a cascoded PNP). With a plain PNP, the load sets the gain.
      `, { d: { fig: figD } }),
      Q(md`Circuit 4, but $Q_3$'s PNP is replaced by a resistor $R_C = 5\,\text{k}\Omega$ to $V_{CC}$. Roughly what is $R_{out}$?`,
        ['$5\\,\\text{k}\\Omega$', '$\\beta r_o$', '$r_o$', '$5\\,\\text{k}\\Omega + \\beta r_o$'], 0,
        [null, 'That is the cascode alone. $R_C$ is in parallel and far smaller.', 'The $r_o$ of $Q_2$ is multiplied up by the degeneration. Either way, the 5 kΩ is far smaller.', 'They are in parallel (both go from the output to an incremental ground).'],
        md`$R_C\parallel\beta r_{o2}\approx R_C = 5\,\text{k}\Omega$. With a resistor load a cascode gains no more than a plain common emitter; what it still buys you is speed (no Miller multiplication on $C_{\mu1}$, Unit 15).`),
      RF(md`
        ### 5. A common source driving an emitter follower

        [[fig:e]]

        **Arrows.** $M_1$ NMOS (source on ground), $Q_2$ NPN (emitter down, into $R_E$).

        **Control terminals.** $M_1$'s gate: $v_{in}$. $Q_2$'s base: node $X$, the first stage's output. $Q_2$ is a second stage, not a load.

        **Stages.** $M_1$: common source with $R_D$. $Q_2$: emitter follower.

        **Node $X$.** Up: $R_D$. Down: $M_1$'s drain, $r_{ds}$ (big). **Sideways: $Q_2$'s base, $r_\pi + (\beta + 1)R_E$.** Unlike a MOSFET gate, a base loads the node. Usually $(\beta + 1)R_E\gg R_D$, so $R_X\approx R_D$, but check it.

        $$A_v\approx\big[-g_{m1}(R_D\parallel r_{ds1}\parallel(r_\pi + (\beta + 1)R_E))\big]\times\frac{R_E}{R_E + (r_\pi + R_X)/(\beta + 1)}$$
      `, { e: { fig: figE } }),
      Q(md`Circuit 5, with $Q_2$ replaced by an NMOS follower of the same layout. What changes at node $X$?`,
        ['The sideways branch disappears: a gate draws no current', 'Nothing: a gate and a base load the node the same way', 'Node $X$ gets loaded by $1/g_m$', 'The first stage stops inverting'], 0,
        [null, 'A base draws current ($r_\\pi + (\\beta + 1)R_E$); a gate draws none.', '$1/g_m$ is what you see looking into the source, not the gate.', 'The first stage is still a common source.'],
        md`A MOSFET gate is an open circuit, so the follower does not load $X$ at all. That is the single biggest BJT/MOSFET difference in reading circuits.`),
      RF(md`
        ### 6. A common emitter, read for frequency

        [[fig:f]]

        **Stage.** In on the base (through $R_S$), out on the collector, emitter grounded: common emitter, $A_v = -g_mR_L$ at low frequency.

        **Capacitors, one at a time.** Short $v_{in}$ and remove the others:
        - $C_\pi$: base to ground. The base node sees $R_S$ in parallel with $r_\pi$: $\tau_\pi = (R_S\parallel r_\pi)C_\pi$.
        - $C_\mu$: base to collector, across an inverting gain. Bridge rule: $R_\mu = R' + R_L + g_mR'R_L$ with $R' = R_S\parallel r_\pi$. The $g_mR'R_L$ term is Miller, and it usually dominates.
        - $C_L$: collector to ground. The collector node sees $R_L$: $\tau_L = R_LC_L$.

        $$\omega_{-3\text{dB}}\approx\frac{1}{(R_S\parallel r_\pi)C_\pi + [R' + R_L + g_mR'R_L]C_\mu + R_LC_L}$$
      `, { f: { fig: figF } }),
      Q(md`In circuit 6, which capacitor usually limits the bandwidth, even though it is the smallest?`,
        ['$C_\\mu$, because its resistance is multiplied by about $g_mR_L$ (Miller)', '$C_\\pi$, because it is the biggest capacitor', '$C_L$, because it is at the output', 'None: they all contribute equally'], 0,
        [null, 'Big capacitance alone does not decide; $\\tau = RC$, and $C_\\mu$\'s $R$ is huge.', 'Only if $C_L$ is very large. The Miller term usually wins.', 'They rarely contribute equally: one $\\tau$ normally dominates.'],
        md`$R_\mu\approx g_mR'R_L$ is often 50–100 times $R'$. A $0.1\,\text{pF}$ $C_\mu$ can then outweigh a $5\,\text{pF}$ $C_\pi$. That is the Miller effect, and the reason cascodes exist.`),
      R(md`
        ### Now make it automatic

        The [recognition gym](#/gym) serves these reads one at a time, in random orientations and device types, until each takes under five seconds. Ten minutes a day. Then Units 10–15 fill in the numbers.
      `),
    ],
  });
})();

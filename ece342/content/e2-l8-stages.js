/* Unit 8 — single-stage amplifiers through the G_M R_out method: CS and its loads, degeneration, CG, CD, the cascode
   (three methods, one answer), numeric gains without a calculator. Lectures 11–18, Problem Set 4. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u8', l);

  // The small-signal model of ONE transistor, laid out the way the lectures (and e2-derive.js) draw it: gate terminal
  // on the left with +v_gs− to the source node; dependent source g_m v_gs from drain (y = 0) down to source (y = 2);
  // r_ds across it at x = 4.4.  o.g: 'vin' | 'gnd'.  o.d (drain side): 'gnd' | 'RD' | 'RDshort' | 'RDtest'.
  // o.s (source side): 'gnd' | 'RS' | 'RSvin' | 'RLshort' | 'RLtest' | 'test'.  o.gm overrides the source's label.
  function mdl(o) {
    const gx = 1.2, e = [];
    e.push(['term', [gx, 0.4], { n: 'G', side: 'a' }], ['term', [gx, 1.4]], ['w', [gx, 1.4], [gx, 2], [3, 2]], ['vlab', [gx + 0.25, 0.55], [gx + 0.25, 1.25], { n: 'v_{gs}' }]);
    if (o.g === 'vin') e.push(['w', [gx, 0.4], [0, 0.4], [0, 1]], ['Vac', [0, 1], [0, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2]]);
    if (o.g === 'gnd') e.push(['w', [gx, 0.4], [0.4, 0.4], [0.4, 0.7]], ['gnd', [0.4, 0.7]]);
    e.push(['G', [3, 0], [3, 2], { n: o.gm || 'g_mv_{gs}' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_{ds}' }], ['w', [3, 2], [4.4, 2]]);
    e.push(['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['txt', [3.15, 2.3], '$S$', { a: 'l' }]);
    const short = (y) => [['w', [4.4, y], [6, y], [6, y + 0.7]], ['gnd', [6, y + 0.7]], ['iarr', [5.2, y], 'l', { n: 'i_{out}', side: y ? 'b' : 'a' }], ['txt', [6.15, y + 0.35], '$\\text{short}$', { a: 'l' }]];
    const test = (y) => [['w', [4.4, y], [5.8, y]], ['V', [5.8, y], [5.8, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [5.8, y + 1.2]], ['iarr', [5.15, y], 'l', { n: 'i_t' }]];
    if (o.d === 'gnd') e.push(['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]]);
    if (/^RD/.test(o.d)) e.push(['R', [3, -1.4], [3, 0], { n: 'R_D' }], ['gndu', [3, -1.4]]);
    if (o.d === 'RDshort') e.push(...short(0));
    if (o.d === 'RDtest') e.push(...test(0));
    if (o.s === 'gnd') e.push(['w', [3, 2], [3, 2.5]], ['gnd', [3, 2.5]]);
    if (o.s === 'RS') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['gnd', [3, 3.4]]);
    if (o.s === 'RSvin') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['Vac', [3, 3.4], [3, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [3, 3.4 + 1]]);
    if (/^RL/.test(o.s)) e.push(['R', [3, 2], [3, 3.4], { n: 'R_L' }], ['gnd', [3, 3.4]]);
    if (o.s === 'RLshort') e.push(...short(2));
    if (o.s === 'RLtest' || o.s === 'test') e.push(...test(2));
    return e;
  }

  // the Norton picture of any amplifier, seen from its output
  const norton = () => [
    ['box', [-0.6, -0.5], [3, 2.4], { n: '' }],
    ['G', [0.6, 0], [0.6, 1.8], { n: 'G_Mv_{in}', side: 'l' }], ['w', [0.6, 0], [4.4, 0]], ['R', [2.2, 0], [2.2, 1.8], { n: 'R_{out}' }],
    ['w', [0.6, 1.8], [2.2, 1.8]], ['gnd', [1.4, 1.8]], ['term', [4.4, 0], { n: 'v_{out}' }],
    ['txt', [1.2, 2.9], '$\\text{the whole amplifier}$'],
  ];

  // cascode model: M2 (top, out to x) and M1 (bottom, x to ground), each g_m v_gs with r_ds across; R_D to V_DD on top.
  // mode 'short' (find G_M) or 'test' (find R_out, v_in = 0).
  const cascModel = (mode) => [
    ['gndu', [2, -1.4]], ['R', [2, -1.4], [2, 0], { n: 'R_D', side: 'l' }],
    ['G', [2, 0], [2, 2.4], { n: 'g_{m2}v_{gs2}', side: 'l' }], ['w', [2, 0], [3.4, 0]], ['R', [3.4, 0], [3.4, 2.4], { n: 'r_{ds2}' }], ['w', [2, 2.4], [3.4, 2.4]],
    ['G', [2, 2.4], [2, 4.8], { n: mode === 'short' ? 'g_{m1}v_{in}' : 'g_{m1}\\cdot 0', side: 'l' }], ['R', [3.4, 2.4], [3.4, 4.8], { n: 'r_{ds1}' }], ['w', [2, 4.8], [3.4, 4.8]], ['gnd', [2.7, 4.8]],
    ['node', [3.4, 2.4], { n: 'x', side: 'r' }],
    ['txt', [5.6, 1.2], '$M_2:\\ v_{gs2} = 0 - v_x$', { a: 'l' }],
    ['txt', [5.6, 3.6], mode === 'short' ? '$M_1:\\ v_{gs1} = v_{in}$' : '$M_1:\\ v_{gs1} = 0$', { a: 'l' }],
    ...(mode === 'short'
      ? [['w', [3.4, 0], [5, 0], [5, 0.7]], ['gnd', [5, 0.7]], ['iarr', [4.2, 0], 'l', { n: 'i_{out}' }]]
      : [['w', [3.4, 0], [5, 0]], ['V', [5, 0], [5, 1.2], { n: 'v_t', side: 'r' }], ['gnd', [5, 1.2]], ['iarr', [4.2, 0], 'l', { n: 'i_t' }]]),
  ];

  L({
    id: 'e2-u8-gmrout', title: 'The $G_MR_{out}$ method', ref: 'Lecture 15',
    steps: [
      R(md`
        ### The plan for this lesson

        Every amplifier in this unit (common source, common gate, source follower, cascode) asks the same question: what is the **voltage gain** $A_v = v_{out}/v_{in}$? You could write KCL at every node of the small-signal circuit and grind through the algebra. This lesson gives a method that splits that one big job into **two small, easy jobs**, and every other lesson in the unit uses it.

        The plan:
        1. See why any amplifier, seen from its output, is just **a current source and a resistor**.
        2. Derive $A_v = -G_MR_{out}$ from that picture.
        3. Learn how to find $G_M$ (short the output) and $R_{out}$ (turn the input off), and why each is easy.
        4. Run the method on the common source amplifier, drawing the small-signal model at every step.
      `),
      R(md`
        ### Step 1: the amplifier, seen from its output

        Stand at the output node and look back into the amplifier. Everything behind you is the small-signal circuit: resistors, the transistors' dependent sources, and the input $v_{in}$. All of it is **linear**.

        **Norton's theorem** says: any linear circuit, seen from two terminals, behaves exactly like **one current source in parallel with one resistor**. For an amplifier:
        - The resistor is the **output resistance** $R_{out}$: the resistance you see looking into the output.
        - The current source must be **proportional to $v_{in}$**, because $v_{in}$ is the only thing driving the circuit. Write it as $G_Mv_{in}$. The constant $G_M$ is a **transconductance**: current out per volt in, measured in siemens (mS).

        We draw the current source **pulling $G_Mv_{in}$ down** out of the output node. That direction is the course's convention.
      `, norton()),
      R(md`
        ### Step 2: the gain, from that picture

        **Step 1: KCL at the output.** Nothing else is connected to the output (if there is a load resistor, count it as part of the circuit, inside $R_{out}$). Two currents leave the node, both going down: $G_Mv_{in}$ through the source and $v_{out}/R_{out}$ through the resistor. They must add to zero:
        $$G_Mv_{in} + \frac{v_{out}}{R_{out}} = 0$$

        **Step 2: solve for $v_{out}$.** Move the first term over and multiply by $R_{out}$:
        $$v_{out} = -G_MR_{out}\,v_{in}$$

        **Step 3: divide by $v_{in}$.**
        $$A_v = -G_MR_{out}$$

        !!key $A_v = -G_MR_{out}$ (Lecture 15)
        The minus sign comes from the direction: pulling current **out** of a node pushes its voltage **down**. Find $G_M$ and $R_{out}$ separately, multiply, put the minus sign in front.
      `),
      R(md`
        ### Step 3: how to find $G_M$: short the output

        Connect the output straight to ground with a wire (a **short**). Look at what that does to the Norton picture.

        **Step 1:** $v_{out} = 0$, so $R_{out}$ has zero volts across it. It carries **zero** current.

        **Step 2:** So all of $G_Mv_{in}$ has to come from the short. Call $i_{out}$ the current flowing **out of the short, into the output node, and down into the stage**. Then $i_{out} = G_Mv_{in}$:
        $$G_M = \frac{i_{out}}{v_{in}}\quad\text{with the output shorted}$$

        **Why this is easy in a real circuit.** With the output at zero volts, every resistor between the output and ground ($R_D$, the $r_{ds}$ of a transistor whose other end is grounded, a load $R_L$) also has zero volts across it and carries nothing. They all drop out. Only the transistors' dependent sources make $i_{out}$.
      `),
      R(md`
        ### Step 4: how to find $R_{out}$: turn the input off

        **Step 1:** Set $v_{in} = 0$. A voltage source that is turned off is a plain wire to ground.

        **Step 2:** In the Norton picture, $G_Mv_{in} = 0$: the current source carries nothing, it is an open circuit. Only $R_{out}$ is left.

        **Step 3:** In the real circuit, put a test source $v_t$ on the output and find the current $i_t$ it supplies. $R_{out} = v_t/i_t$. The current splits into the part going **up** (through everything between the output and $V_{DD}$, resistance $R_{UP}$) and the part going **down** (resistance $R_{DN}$). Both $V_{DD}$ and ground are incremental ground, so the two are in parallel:
        $$R_{out} = R_{UP}\parallel R_{DN}$$

        **Why this is easy.** With $v_{in} = 0$, the dependent sources that $v_{in}$ was driving die, and many transistors become just $r_{ds}$. For the rest, the Unit 7 formulas (looking into a drain, a source, a diode) give $R_{UP}$ and $R_{DN}$ directly.
      `),
      R(md`
        ### Worked example: the common source amplifier

        $M_1$ has $v_{in}$ on its gate, its source on ground, and $R_D$ from its drain up to $V_{DD}$. The output is the drain. We find $G_M$, then $R_{out}$, then multiply.
      `, F.cs()),
      R(md`
        ### Common source, $G_M$ (output shorted)

        **Step 1: what is $v_{gs}$?** The gate is at $v_{in}$, the source is on ground:
        $$v_{gs} = v_{in} - 0 = v_{in}$$

        **Step 2: draw the model.** $M_1$ becomes a dependent source $g_mv_{gs} = g_mv_{in}$ pointing from drain to source, with $r_{ds}$ beside it. $V_{DD}$ is incremental ground, so $R_D$ goes from the drain up to a ground. The output (the drain) is shorted to ground on the right.

        **Step 3: who carries current?** The drain is at 0 V. $R_D$ has 0 V at both ends: no current. $r_{ds}$ has 0 V at the drain and 0 V at the source: no current. Only the dependent source carries current, $g_mv_{in}$ from the drain down to ground, and it must come from the short:
        $$i_{out} = g_mv_{in}$$

        **Step 4:**
        $$G_M = \frac{i_{out}}{v_{in}} = g_m$$
      `, mdl({ g: 'vin', d: 'RDshort', s: 'gnd' })),
      R(md`
        ### Common source, $R_{out}$ (input off)

        **Step 1: what is $v_{gs}$?** $v_{in} = 0$, so the gate is on ground. The source is on ground too:
        $$v_{gs} = 0 - 0 = 0$$

        **Step 2:** The dependent source carries $g_m\cdot0 = 0$. It is an open circuit: erase it.

        **Step 3: test source.** Put $v_t$ on the output. Two paths are left: up through $R_D$ (current $v_t/R_D$) and down through $r_{ds}$ (current $v_t/r_{ds}$):
        $$i_t = \frac{v_t}{R_D} + \frac{v_t}{r_{ds}}$$

        **Step 4: divide.**
        $$R_{out} = \frac{v_t}{i_t} = \frac{1}{1/R_D + 1/r_{ds}} = R_D\parallel r_{ds}$$
      `, mdl({ g: 'gnd', d: 'RDtest', s: 'gnd' })),
      R(md`
        ### Common source, the gain

        $$A_v = -G_MR_{out} = -g_m\,(R_D\parallel r_{ds})$$

        **Sign check, in words:** $v_{in}$ up $\to$ $v_{gs}$ up $\to$ $M_1$ pulls **more** current down out of the output $\to$ $v_{out}$ **down**. Inverting, which matches the minus sign.

        **Example.** $g_m = 2\,\text{mS}$, $R_D = 10\kO$, $r_{ds} = 100\kO$.
        - $G_M = 2\,\text{mS}$.
        - $R_{out} = 10\text{k}\parallel100\text{k} = \dfrac{10\times100}{10 + 100}\kO = \dfrac{1000}{110}\kO = 9.09\kO$.
        - $A_v = -(2\,\text{mS})(9.09\kO) = -18.2$.

        That is the same answer straight KCL gives (next lesson), but each half took two lines.

        !!intuition The picture to keep
        A transistor is a current source controlled by its input. It pushes its current into whatever resistance hangs on the output node. **Gain = (current per volt of input) × (resistance that current lands on).** $G_M$ is the first factor, $R_{out}$ the second.
      `),
      R(md`
        ### The sign of $G_M$, for the other stages

        $G_M$ is defined as current pulled **down into** the stage (out of the short), per volt of input. So:
        - **Common source:** $v_{in}$ up pulls **more** current down. $G_M > 0$, and $A_v = -G_MR_{out}$ is **negative** (inverting).
        - **Common gate** and **source follower:** $v_{in}$ up makes the stage pull **less** current down (or push current up into the short). $G_M < 0$, and $A_v = -G_MR_{out}$ comes out **positive**. Lecture 17 writes "$G_M = -g_m$" for the follower for exactly this reason.

        !!trap Do the one-line sign check every time
        The course's own solutions are not always careful with this sign. After every answer, say in words "$v_{in}$ up → the stage pulls more (or less) current down → $v_{out}$ down (or up)" and make the sign of $A_v$ match.
      `),
      R(md`
        ### Reading $G_M$ and $R_{out}$ off a measurement

        Practice 1 #1(a): a black box gets $v_{in} = 100\,\text{mV}$. With nothing connected, its output is $1\,\text{V}$ (that is the **Thévenin** voltage), and its Thévenin resistance is $R_{TH} = 1\kO$.

        **Step 1: gain.** With nothing connected, $A_v = \dfrac{v_{out}}{v_{in}} = \dfrac{1\,\text{V}}{0.1\,\text{V}} = 10$.

        **Step 2: output resistance.** Thévenin and Norton use the same resistance: $R_{out} = R_{TH} = 1\kO$.

        **Step 3: Norton current.** Short the output: the current is $\dfrac{v_{TH}}{R_{TH}} = \dfrac{1\,\text{V}}{1\kO} = 1\,\text{mA}$.

        **Step 4: transconductance.** $|G_M| = \dfrac{1\,\text{mA}}{100\,\text{mV}} = 10\,\text{mS}$.

        **Check:** $|G_M|R_{out} = (10\,\text{mS})(1\kO) = 10 = |A_v|$.
      `),
      P({
        id: 'e2u8-gmrout-box', title: 'A box, by Thévenin and Norton',
        q: md`An amplifier gets $v_{in} = 50\,\text{mV}$. With no load its output is $2\,\text{V}$ (in phase with the input), and its Thévenin resistance is $4\kO$. Find $|A_v|$, $R_{out}$, and $|G_M|$. Then a $4\kO$ load is connected: what is the new $|A_v|$?`,
        parts: [{ lbl: '|A_v|', unit: '', ans: 40 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4 }, { lbl: '|G_M|', unit: 'mS', ans: 10 }, { lbl: '|A_v|\\text{ loaded}', unit: '', ans: 20 }],
        hints: [md`Unloaded: $|A_v| = 2/0.05$. $|G_M| = |A_v|/R_{out}$.`, md`A load at the output is in parallel with $R_{out}$: the new resistance is $4\text{k}\parallel4\text{k}$, and $G_M$ does not change (with the output shorted, the load carries nothing).`],
        sol: md`
1. $|A_v| = \dfrac{2\,\text{V}}{0.05\,\text{V}} = 40$.
2. $R_{out} = R_{TH} = 4\kO$.
3. $|G_M| = \dfrac{|A_v|}{R_{out}} = \dfrac{40}{4\kO} = 10\,\text{mS}$ (same as the Norton current $2\,\text{V}/4\kO = 0.5\,\text{mA}$ per $50\,\text{mV}$).
4. Loaded: $R_{out}' = 4\text{k}\parallel4\text{k} = 2\kO$, $|A_v| = (10\,\text{mS})(2\kO) = 20$. The load halves the gain.`,
      }),
      Q(md`To find $G_M$, why do we **short** the output instead of leaving it open?`,
        ['With $v_{out} = 0$, nothing at the output node ($R_D$, $r_{ds}$, the load) carries current, so $i_{out}$ comes only from the transconductors.', 'Because the Thévenin voltage is zero when shorted.', 'To make $R_{out}$ zero.', 'It does not matter: open or short gives the same $G_M$.'], 0,
        [null, 'The Thévenin voltage is the open-circuit one; the short gives the Norton current.', '$R_{out}$ is a property of the circuit, shorting it during the $G_M$ step does not change it.', 'Open-circuit gives $A_v$ directly, which is the hard problem we are splitting up.'],
        md`Shorted output: zero volts across every element at that node, so they carry no current. $i_{out}$ is just the sum of the transistors' currents, each easy to find. This is also why two transistors driving one output simply add their $G_M$s.`),
      R(md`
        ### Summary: the method on one card

        | Job | What you do | What drops out | Result |
        |---|---|---|---|
        | $G_M$ | short the output to ground | every resistor at the output (0 V across it) | $G_M = i_{out}/v_{in}$, current pulled **down** into the stage |
        | $R_{out}$ | turn $v_{in}$ off, test source at the output | dependent sources driven only by $v_{in}$ | $R_{out} = R_{UP}\parallel R_{DN}$ |
        | $A_v$ | multiply | | $A_v = -G_MR_{out}$ |
        | Sign check | "$v_{in}$ up → more/less current down → $v_{out}$ down/up" | | common source: $G_M>0$; common gate, follower: $G_M<0$ |
      `),
    ],
  });

  L({
    id: 'e2-u8-cs', title: 'Common source and its loads', ref: 'Lectures 14–16, Problem Set 4',
    steps: [
      R(md`
        ### The plan for this lesson

        A **common source** amplifier is one transistor, $M_1$, with the input on its gate, its source grounded, and the output taken at its drain. Something sits **above** the drain, between the output and $V_{DD}$: that something is called the **load**.

        We will try three different loads, one at a time:
        1. a plain **resistor** $R_D$;
        2. a **diode-connected** transistor;
        3. a transistor used as a **current source**.

        For each one we ask the same question, and only one thing changes. Here is why.

        **The input side never changes.** Short the output to ground. $M_1$ has $v_{gs} = v_{in}$, so it pulls a current $g_{m1}v_{in}$ down out of the output. The load has zero volts across it (the output is shorted), so it carries no signal current. So for **every** load:
        $$G_M = g_{m1}$$

        **Only the output resistance changes.** Turn off the input ($v_{in} = 0$). Looking down from the output you see $M_1$'s drain with its gate and source at ground: just $r_{ds1}$. Looking up you see the load. So
        $$R_{out} = r_{ds1}\parallel(\text{whatever the load looks like})$$
        $$A_v = -G_MR_{out} = -g_{m1}\times\Big(r_{ds1}\parallel\text{load}\Big)$$

        So the whole lesson comes down to one question: **what resistance does each load look like, from the output?**
      `),
      R(md`
        ### Load 1: a resistor $R_D$

        The resistor looks like itself: $R_D$. So
        $$R_{out} = R_D\parallel r_{ds1},\qquad A_v = -g_{m1}\,(R_D\parallel r_{ds1})$$

        **Example.** $g_{m1} = 2\,\text{mS}$, $R_D = 10\kO$, $r_{ds1} = 100\kO$.
        - $R_{out} = 10\text{k}\parallel100\text{k} = \dfrac{10\cdot100}{110}\kO = 9.09\kO$.
        - $A_v = -(2\,\text{mS})(9.09\kO) = -18.2$.

        Usually $R_D \ll r_{ds}$, so $A_v \approx -g_{m1}R_D = -20$. To get more gain you need a bigger $R_D$, which also means a bigger DC voltage drop across it. That is the problem the transistor loads solve.
      `, F.cs()),
      R(md`
        ### Load 2: a diode-connected transistor

        $M_2$ is a PMOS whose **gate is wired to its own drain**, and that node is the output. Its source is on $V_{DD}$.

        **Step 1: what is $v_{gs2}$?** Use the small-signal model (it is the same for NMOS and PMOS).
        - $M_2$'s source is on $V_{DD}$: a fixed voltage, so for signals it is ground. $v_{s2} = 0$.
        - $M_2$'s gate is wired to the output. $v_{g2} = v_{out}$.
        - So $v_{gs2} = v_{out} - 0 = v_{out}$.

        **Step 2: draw the model.** $M_2$ becomes a dependent source $g_{m2}v_{gs2} = g_{m2}v_{out}$, pointing from its drain (the output) to its source (ground), with $r_{ds2}$ beside it. $M_1$ becomes $g_{m1}v_{in}$ from the output down to ground, with $r_{ds1}$ beside it. The circuit is drawn here; the model is drawn in the next step.
      `, F.csDiode()),
      R(md`
        **Step 3: the dependent source of $M_2$ is really a resistor.** It carries a current $g_{m2}v_{out}$ **out of** the output node, and the voltage across it is $v_{out}$. A two-terminal element where current $=$ (constant) $\times$ (its own voltage) is a resistor:
        $$\frac{\text{voltage}}{\text{current}} = \frac{v_{out}}{g_{m2}v_{out}} = \frac{1}{g_{m2}}$$
        So the diode-connected $M_2$ looks like $\dfrac{1}{g_{m2}}\parallel r_{ds2}$.

        **Step 4: the output resistance.** Three things in parallel at the output: $\dfrac1{g_{m2}}$, $r_{ds2}$, $r_{ds1}$. Typical sizes: $\dfrac1{g_m}$ is about $500\,\Omega$, $r_{ds}$ is about $100\kO$. The smallest one wins a parallel combination:
        $$R_{out} = \frac{1}{g_{m2}}\parallel r_{ds2}\parallel r_{ds1}\approx\frac{1}{g_{m2}}$$

        **Step 5: the gain.**
        $$A_v = -g_{m1}R_{out}\approx-\frac{g_{m1}}{g_{m2}}$$
        The gain is a **ratio of two $g_m$'s**. No resistor appears at all.
      `, [
        ['w', [1, 0], [6, 0]], ['term', [6, 0], { n: 'v_{out}' }], ['node', [1, 0], { n: '', side: 'a' }],
        ['G', [1, 0], [1, 1.8], { n: 'g_{m1}v_{in}', side: 'l' }], ['R', [2.4, 0], [2.4, 1.8], { n: 'r_{ds1}' }], ['w', [1, 1.8], [2.4, 1.8]], ['gnd', [1.7, 1.8]],
        ['txt', [1.7, 2.6], '$M_1$'],
        ['G', [3.8, 0], [3.8, -1.8], { n: 'g_{m2}v_{out}', side: 'l' }], ['R', [5, -1.8], [5, 0], { n: 'r_{ds2}' }], ['w', [3.8, -1.8], [5, -1.8]], ['gndu', [4.4, -1.8]],
        ['txt', [4.4, 0.6], '$M_2$ (diode)'],
      ]),
      R(md`
        ### Why "gain from geometry"

        $g_m$ depends on the bias current, so it looks like the gain would depend on the bias too. It does not. Here is why.

        **Step 1: both transistors carry the same DC current.** $M_1$ and $M_2$ are in series between $V_{DD}$ and ground, so the same $I_D$ flows through both.

        **Step 2: write $g_m$ in terms of $I_D$ and size.** From the square law, $I_D = \tfrac12\mu C_{ox}\tfrac WL V_{ov}^2$, so $V_{ov} = \sqrt{\dfrac{2I_D}{\mu C_{ox}(W/L)}}$. Put that into $g_m = \dfrac{2I_D}{V_{ov}}$:
        $$g_m = \frac{2I_D}{\sqrt{2I_D/(\mu C_{ox}W/L)}} = \sqrt{2\,\mu C_{ox}\,(W/L)\,I_D}$$

        **Step 3: take the ratio.** The same $I_D$ appears under both square roots and cancels, and so do the 2 and $C_{ox}$:
        $$\frac{g_{m1}}{g_{m2}} = \sqrt{\frac{\mu_1\,(W/L)_1}{\mu_2\,(W/L)_2}}$$
        So the gain depends only on **sizes** and **mobilities**: the geometry of the two transistors.

        **Step 4: NMOS input, PMOS load.** In this course $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$ and $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, so $\mu_n/\mu_p = 2$. That factor of 2 goes under the square root along with the size ratio.

        **Example.** $M_1$ is an NMOS with $W/L = 20$; $M_2$ is a PMOS diode with $W/L = 10$.
        $$|A_v| = \sqrt{\frac{100\times20}{50\times10}} = \sqrt{\frac{2000}{500}} = \sqrt4 = 2$$
        So $A_v \approx -2$. The catch: because of the square root, a big gain needs a huge size ratio (a gain of 10 needs a ratio of 100). So diode loads give small, predictable gains.
      `),
      R(md`
        ### Load 3: a current source

        $M_2$ is a PMOS with its **gate held at a fixed bias voltage**, source on $V_{DD}$, drain at the output.

        **Step 1: $v_{gs2}$.** Gate fixed, so $v_{g2} = 0$. Source on $V_{DD}$, so $v_{s2} = 0$. So $v_{gs2} = 0$.

        **Step 2: the model.** The dependent source is $g_{m2}\times0 = 0$: it disappears. Only $r_{ds2}$ is left, from the output to ground.

        **Step 3: output resistance and gain.**
        $$R_{out} = r_{ds1}\parallel r_{ds2},\qquad A_v = -g_{m1}\,(r_{ds1}\parallel r_{ds2})$$

        **Step 4: how big is that?** If the two $r_{ds}$ are equal, $r_{ds}\parallel r_{ds} = \tfrac12r_{ds}$, so
        $$A_v = -\tfrac12\,g_{m1}r_{ds}$$
        The product $g_mr_{ds}$ is called the **intrinsic gain**: it is what one transistor would give if the load were infinitely big. With a current-source load we get **half** of it, because the output node sees two $r_{ds}$ in parallel, $M_1$'s own and the load's.

        **Example.** $g_{m1} = 2\,\text{mS}$, $r_{ds1} = r_{ds2} = 100\kO$.
        - $R_{out} = 100\text{k}\parallel100\text{k} = 50\kO$.
        - $A_v = -(2\,\text{mS})(50\kO) = -100$.

        Compare: resistor load $-18$, diode load $-2$, current-source load $-100$. A current source has a big **small-signal** resistance ($r_{ds}$) while needing only a small DC voltage across it. That is why it gives the most gain one transistor can give (more needs a cascode, Unit 8 later).
      `, F.csIsrc()),
      R(md`
        ### Summary: one table, now that each row is explained

        | Load (looking up) | What it looks like | $R_{out}$ | $A_v$ | Typical size |
        |---|---|---|---|---|
        | Resistor $R_D$ | $R_D$ | $R_D\parallel r_{ds1}$ | $-g_{m1}(R_D\parallel r_{ds1})$ | about $-20$ |
        | Diode-connected $M_2$ | $\tfrac1{g_{m2}}$ (its gate follows the output) | $\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}$ | $\approx -\dfrac{g_{m1}}{g_{m2}}$ | about $-2$ |
        | Current source ($M_2$, gate held) | $r_{ds2}$ (its gate is still) | $r_{ds1}\parallel r_{ds2}$ | $-g_{m1}(r_{ds1}\parallel r_{ds2})$ | about $-100$ |
        | Two loads on the same node | everything in parallel | the smallest one wins | | |

        The single fact behind the whole table: **a transistor whose gate moves with the node looks small ($1/g_m$); a transistor whose gate is still looks big ($r_{ds}$).**
      `),
      Q(md`An NMOS CS stage ($W/L = 200$) has a diode-connected NMOS load ($W/L = 50$). Ignoring $r_{ds}$, what is $A_v$?`,
        ['$-2$', '$-4$', '$-0.5$', '$-\\sqrt2$'], 0,
        [null, 'That is the ratio of sizes; the gain is the square root of it.', 'Upside down: the input device is the bigger one, so $|A_v| > 1$.', 'Check the ratio: $200/50 = 4$, $\\sqrt4 = 2$.'],
        md`Same current, same mobility: $|A_v| = \sqrt{200/50} = 2$, inverting. With a PMOS diode of $W/L = 50$ it would be $\sqrt{(100\cdot200)/(50\cdot50)} = \sqrt8\approx2.83$.`),
      P({
        id: 'e2u8-inv', src: 'Problem Set 4 · #2', title: 'Both devices driven: the CMOS inverter amplifier',
        q: md`Both gates are driven by $v_{in}$ ($M_1$ NMOS below, $M_2$ PMOS above). Find $A_v$ with $r_{ds}$.`,
        fig: F.inverter(),
        parts: [E2.ex('-(gm1 + gm2)*(rds1 || rds2)', ['gm1', 'gm2', 'rds1', 'rds2'], 'A_v')],
        hints: [md`Short the output. $v_{in}$ up: does $M_1$ pull more or less? Does $M_2$ push more or less?`, md`Both effects pull $v_{out}$ down, so the transconductances add.`],
        sol: md`**$G_M$** (output shorted): $M_1$ pulls $g_{m1}v_{in}$ down; the PMOS $M_2$'s $v_{sg}$ falls by $v_{in}$, so it pushes $g_{m2}v_{in}$ **less** current in from the top. Both look like current leaving the node: $G_M = g_{m1} + g_{m2}$.

**$R_{out}$**: two drains with their gates and sources dead: $r_{ds1}\parallel r_{ds2}$.
$$A_v = -(g_{m1}+g_{m2})(r_{ds1}\parallel r_{ds2})$$
In Problem Set 4 #2 the two diode-connected devices $M_3$, $M_4$ on the same node add $\tfrac1{g_{m3}}\parallel\tfrac1{g_{m4}}$ in parallel to $R_{out}$, which dominates: $A_v\approx-\dfrac{g_{m1}+g_{m2}}{g_{m3}+g_{m4}}$.`,
      }),
      P({
        id: 'e2u8-diode-rd', src: 'Lecture 16 · example (ii)', title: 'A diode above the input device, then $R_D$',
        q: md`$M_1$ (input) has a diode-connected $M_2$ between its drain and the output node, and $R_D$ from the output to $V_{DD}$. The output is taken at the top of the diode. Find $R_{out}$ (keep $r_{ds}$; exact or approximate).`,
        fig: [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['nmos', [1, 1], { n: 'M_2', dc: true }], ['nmos', [1, 3], { n: 'M_1' }], ['gnd', [1, 4]], ['w', [0, 3], [-0.6, 3], [-0.6, 3.4]], ['Vac', [-0.6, 3.4], [-0.6, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 4.4]]],
        parts: [E2.ex('RD || (rds1 + 1/(gm2 + 1/rds2))', ['RD', 'rds1', 'gm2', 'rds2'], 'R_{out}')],
        hints: [md`Looking down from the output: the diode $M_2$ (a $\tfrac1{g_{m2}}\parallel r_{ds2}$ element) in series with $M_1$'s drain ($r_{ds1}$, its gate is dead).`],
        sol: md`$G_M = g_{m1}$ (the diode just passes $M_1$'s current up). $R_{DN} = (\tfrac1{g_{m2}}\parallel r_{ds2}) + r_{ds1}$, so
$$R_{out} = R_D\parallel\Big[\big(\tfrac1{g_{m2}}\parallel r_{ds2}\big) + r_{ds1}\Big]\approx R_D\parallel r_{ds1}$$
The diode in series with a big $r_{ds1}$ barely matters (Lecture 16). The gain is the same as a plain CS: $-g_{m1}(R_D\parallel r_{ds1})$.`,
      }),
    ],
  });

  L({
    id: 'e2-u8-csdeg', title: 'Source degeneration', ref: 'Lectures 16–17, Problem Set 4 #1',
    steps: [
      R(md`
        ### The plan for this lesson

        The plain common source amplifier has $A_v\approx-g_mR_D$. The trouble is $g_m$: it depends on the bias current, on $V_{ov}$, on temperature, on the process. Two "identical" chips give two different gains. **Source degeneration** fixes this by putting a resistor $R_S$ between $M_1$'s source and ground. We will pay with some gain and buy a gain that hardly depends on the transistor.

        The plan:
        1. The model step above already gave a first look, straight KCL with $r_{ds}$ ignored. Now we redo it by the $G_MR_{out}$ method, keeping $r_{ds}$.
        2. $G_M$ with the output shorted, keeping $r_{ds}$.
        3. $R_{out}$ with the input off.
        4. Multiply, put in numbers, and see what happens when $g_mR_S\gg1$.
        5. Other things that can sit in the source: a diode, a current source.
      `, F.csDeg()),
      R(md`
        ### $G_M$: short the output

        Short the drain (the output) to ground. Two unknowns: the source voltage $v_s$ and the current $i_{out}$.

        **Step 1: what is $v_{gs}$?** The gate is at $v_{in}$. The source is **not** at ground any more, $R_S$ sits under it, so it is at some $v_s$:
        $$v_{gs} = v_{in} - v_s$$

        **Step 2: where does $i_{out}$ go?** $R_D$ has 0 V at both ends: no current. So all of $i_{out}$ goes down through the transistor (its dependent source and its $r_{ds}$ together).

        **Step 3: the current down through the transistor**, drain to source. The dependent source carries $g_mv_{gs}$; $r_{ds}$ carries $(v_d - v_s)/r_{ds}$ with $v_d = 0$:
        $$i_{out} = g_m(v_{in} - v_s) - \frac{v_s}{r_{ds}}$$

        **Step 4: the same current goes down $R_S$.** Nothing else touches the source node:
        $$v_s = i_{out}R_S$$
      `, mdl({ g: 'vin', d: 'RDshort', s: 'RS' })),
      R(md`
        **Step 5: substitute $v_s$** into Step 3:
        $$i_{out} = g_mv_{in} - g_mR_S\,i_{out} - \frac{R_S}{r_{ds}}\,i_{out}$$

        **Step 6: collect the $i_{out}$ terms** on the left:
        $$i_{out}\Big(1 + g_mR_S + \frac{R_S}{r_{ds}}\Big) = g_mv_{in}$$

        **Step 7: divide by $v_{in}$.**
        $$G_M = \frac{g_m}{1 + g_mR_S + R_S/r_{ds}}\approx\frac{g_m}{1 + g_mR_S}$$
        The $R_S/r_{ds}$ term is tiny ($1\text{k}/100\text{k} = 0.01$, next to $1 + g_mR_S\approx3$), so it is usually dropped.

        **Example.** $g_m = 2\,\text{mS}$, $R_S = 1\kO$, $r_{ds} = 100\kO$.
        - $g_mR_S = (2\,\text{mS})(1\kO) = 2$.
        - Denominator: $1 + 2 + 0.01 = 3.01$.
        - $G_M = 2\,\text{mS}/3.01 = 0.664\,\text{mS}$.

        Without $R_S$ it was $2\,\text{mS}$: degeneration divided $G_M$ by about 3.
      `),
      R(md`
        ### $R_{out}$: turn the input off

        **Step 1: what is $v_{gs}$?** $v_{in} = 0$ puts the gate on ground. The source is at $v_s$:
        $$v_{gs} = 0 - v_s = -v_s$$
        Unlike the plain common source, the dependent source is **not** dead: $v_s$ drives it.

        **Step 2: split the test current.** Put $v_t$ on the output. Its current goes up through $R_D$ (that is $v_t/R_D$) and down into the transistor; call that part $i_{dn}$. So $R_{out} = R_D\parallel R_{DN}$ with $R_{DN} = v_t/i_{dn}$.

        **Step 3:** $i_{dn}$ flows on down through $R_S$:
        $$v_s = i_{dn}R_S$$

        **Step 4: current through the transistor**, drain to source:
        $$i_{dn} = g_m(-v_s) + \frac{v_t - v_s}{r_{ds}}$$
      `, mdl({ g: 'gnd', d: 'RDtest', s: 'RS' })),
      R(md`
        **Step 5: substitute** $v_s = i_{dn}R_S$ and multiply both sides by $r_{ds}$:
        $$i_{dn}r_{ds} = -g_mr_{ds}R_S\,i_{dn} + v_t - R_S\,i_{dn}$$

        **Step 6: collect $i_{dn}$:**
        $$i_{dn}\,(r_{ds} + R_S + g_mr_{ds}R_S) = v_t$$
        $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S\approx r_{ds}(1 + g_mR_S)$$
        This is the Unit 7 **degenerated drain** (the "impedance scaler"): $R_S$ under the source multiplies the drain resistance by $(1 + g_mR_S)$.

        **Step 7:**
        $$R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$

        **Example** (same numbers, $R_D = 10\kO$).
        - $R_{DN} = 100\text{k} + 1\text{k} + (2\,\text{mS})(100\kO)(1\kO) = 100 + 1 + 200 = 301\kO$.
        - $R_{out} = 10\text{k}\parallel301\text{k} = \dfrac{10\times301}{311}\kO = 9.68\kO$.

        $R_{DN}$ is so big that $R_D$ wins the parallel combination: $R_{out}\approx R_D$.
      `),
      R(md`
        ### The gain

        $$A_v = -G_MR_{out} = -\frac{g_m\,\big(R_D\parallel R_{DN}\big)}{1 + g_mR_S + R_S/r_{ds}}$$
        Usually $R_{DN}\gg R_D$ (so $R_{out}\approx R_D$) and $R_S/r_{ds}$ is negligible:
        $$A_v\approx-\frac{g_mR_D}{1 + g_mR_S}$$
        That is exactly what the model step gave with $r_{ds}\to\infty$.

        **Sign check, in words:** $v_{in}$ up $\to$ $v_{gs}$ up (by less than $v_{in}$, because the source rises too) $\to$ more current pulled down out of the output $\to$ $v_{out}$ down. Inverting.

        **Example.**
        - Exact: $A_v = -(0.664\,\text{mS})(9.68\kO) = -6.43$.
        - Approximate: $A_v\approx-\dfrac{(2\,\text{mS})(10\kO)}{1 + 2} = -\dfrac{20}{3} = -6.67$.

        The plain common source with the same $R_D$ gave $-18.2$. We gave up a factor of about 3, which is $1 + g_mR_S$.
      `),
      R(md`
        ### When $g_mR_S\gg1$: the gain becomes a resistor ratio

        **Step 1: divide top and bottom by $g_m$.**
        $$A_v\approx-\frac{g_mR_D}{1 + g_mR_S} = -\frac{R_D}{1/g_m + R_S}$$

        **Step 2: let $R_S\gg1/g_m$** (the same thing as $g_mR_S\gg1$). The $1/g_m$ is negligible next to $R_S$:
        $$A_v\approx-\frac{R_D}{R_S}$$
        No $g_m$ left. In the same limit $G_M\to1/R_S$ (Lecture 17: "Gm is independent of transistor parameters!").

        **Example.** $g_m = 2\,\text{mS}$, $R_S = 5\kO$, $R_D = 10\kO$, so $g_mR_S = 10$.
        - $A_v\approx-\dfrac{20}{1 + 10} = -1.82$. The ratio estimate says $-R_D/R_S = -2$.
        - Now let $g_m$ drop by 20% to $1.6\,\text{mS}$: $A_v\approx-\dfrac{16}{1 + 8} = -1.78$. The gain moved about 2%.
        - A plain common source would have gone from $-20$ to $-16$: 20%.

        !!intuition Why degeneration works
        Read Step 1 as a sentence: $v_{in}$ drives a current through **everything in the source path**, which is $1/g_m$ (the transistor seen from its source) plus $R_S$. That current comes up out of $R_D$. So the gain is $R_D$ divided by the resistance in the source path. When $R_S$ is much bigger than $1/g_m$, the transistor's own part no longer matters. It is negative feedback: more current raises the source, which shrinks $v_{gs}$, which cuts the current back.
      `),
      R(md`
        ### Something other than a resistor in the source

        **(a) A diode-connected transistor $M_3$** under $M_1$'s source (Practice 5 #3). From Unit 7 it looks like a resistor $\tfrac1{g_{m3}}$ (in parallel with $r_{ds3}$, which we drop). So use $R_S = 1/g_{m3}$:
        - **Step 1:** $g_{m1}R_S = \dfrac{g_{m1}}{g_{m3}}$.
        - **Step 2:** $G_M\approx\dfrac{g_{m1}}{1 + g_{m1}/g_{m3}}$.
        - **Step 3:** multiply top and bottom by $g_{m3}$:
        $$G_M\approx\frac{g_{m1}g_{m3}}{g_{m1} + g_{m3}}$$
        **Example:** $g_{m1} = g_{m3} = 2\,\text{mS}$ gives $G_M = \dfrac{4}{4}\,\text{mS} = 1\,\text{mS}$: half of $g_{m1}$.

        **(b) An ideal current source $I_B$** under the source (Practice 4 #2, $M_3$). Its current never changes, so for small signals it is an **open circuit**: $R_S = \infty$.
        $$G_M = \frac{g_m}{1 + g_m\cdot\infty} = 0$$
        Physically: the drain current is pinned to $I_B$, so nothing $v_{in}$ does can change it. That transistor contributes nothing to $G_M$.
      `),
      Q(md`A transistor's source sits on an ideal DC current source $I_B$. What does it contribute to the short-circuit $G_M$ at its drain?`,
        ['Nothing: its current cannot change.', '$g_m$', '$g_m/2$', '$1/R_S$ with $R_S = r_{ds}$'], 0,
        [null, 'That is for a grounded source.', 'There is no other device sharing the current here.', 'An ideal current source is infinite, so $g_m/(1 + g_m\\infty) = 0$.'],
        md`$G_M = g_m/(1 + g_mR_S)$ with $R_S = \infty$ is zero. Physically: the drain current equals $I_B$, period. (Practice 4 #2: $M_3$ drops out of $G_M$.)`),
      P({
        id: 'e2u8-csdeg-sym', title: 'Degenerated common source gain',
        q: md`Find $A_v$ for the degenerated common source stage, ignoring $r_{ds}$.`,
        fig: F.csDeg(),
        parts: [E2.ex('-gm*RD/(1 + gm*RS)', ['gm', 'RD', 'RS'], 'A_v', { exact: true })],
        hints: [md`$G_M = g_m/(1+g_mR_S)$, $R_{out} = R_D$ when $r_{ds}\to\infty$.`],
        sol: md`$A_v = -G_MR_{out} = -\dfrac{g_mR_D}{1 + g_mR_S}$. Check the limits: $R_S = 0$ gives the plain common source $-g_mR_D$; $g_mR_S\gg1$ gives $-R_D/R_S$.`,
      }),
      P({
        id: 'e2u8-csdeg-num', title: 'Degenerated common source, with numbers',
        q: md`$g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 500\,\Omega$, $R_D = 5\kO$. Keeping $r_{ds}$, find $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.csDeg(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 0.997506 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4.87835 }, { lbl: 'A_v', unit: '', ans: -4.86618 }],
        hints: [md`$G_M = \dfrac{g_m}{1 + g_mR_S + R_S/r_{ds}}$ with $g_mR_S = 1$.`, md`$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$, then $R_{out} = R_D\parallel R_{DN}$.`],
        sol: md`
1. $g_mR_S = (2\,\text{mS})(0.5\kO) = 1$; $R_S/r_{ds} = 0.005$. $G_M = \dfrac{2\,\text{mS}}{2.005} = 0.9975\,\text{mS}$.
2. $R_{DN} = 100\text{k} + 0.5\text{k} + (200)(0.5\text{k}) = 200.5\kO$. $R_{out} = 5\text{k}\parallel200.5\text{k} = \dfrac{5\times200.5}{205.5}\kO = 4.878\kO$.
3. $A_v = -(0.9975\,\text{mS})(4.878\kO) = -4.866$. The approximation $-\dfrac{g_mR_D}{1+g_mR_S} = -\dfrac{10}{2} = -5$ is close.`,
      }),
      R(md`
        ### Summary

        | | Exact (with $r_{ds}$) | Usual approximation |
        |---|---|---|
        | $G_M$ | $\dfrac{g_m}{1 + g_mR_S + R_S/r_{ds}}$ | $\dfrac{g_m}{1 + g_mR_S}\to\dfrac1{R_S}$ |
        | $R_{out}$ | $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$ | $R_D$ |
        | $A_v$ | $-G_MR_{out}$ | $-\dfrac{g_mR_D}{1 + g_mR_S} = -\dfrac{R_D}{1/g_m + R_S}\to-\dfrac{R_D}{R_S}$ |
        | Diode in the source | $R_S = 1/g_{m3}$ | $G_M = \dfrac{g_{m1}g_{m3}}{g_{m1}+g_{m3}}$ |
        | Current source in the source | $R_S = \infty$ | $G_M = 0$ |
      `),
    ],
  });

  L({
    id: 'e2-u8-cg', title: 'Common gate', ref: 'Lecture 17, Problem Set 4 #1(b)',
    steps: [
      R(md`
        ### The plan for this lesson

        A **common gate** amplifier holds the transistor's gate at a fixed bias (incremental ground) and drives the **source** instead. The input comes through $R_S$ (the resistance of whatever drives it), the output is the drain, with $R_D$ up to $V_{DD}$.

        Why bother? The source is a low-resistance node (about $1/g_m$) and the drain is a high-resistance node. So a common gate stage takes a current in at a low resistance and delivers it into a high one: a **current buffer**. It does not invert, and it is the top half of the cascode (later in this unit).

        The plan:
        1. The model step above already gave a first look, straight KCL with $r_{ds}$ ignored. Now we redo it by the $G_MR_{out}$ method, keeping $r_{ds}$.
        2. $G_M$ (output shorted), keeping $r_{ds}$. It will come out **negative**.
        3. $R_{out}$: it turns out to be a circuit we already solved.
        4. The gain, with numbers; then the case with no $R_S$.
        5. The input resistance, the reason the stage exists.
      `, F.cg()),
      R(md`
        ### $G_M$: short the output

        **Step 1: what is $v_{gs}$?** The gate is held (0), the source is at $v_s$:
        $$v_{gs} = 0 - v_s = -v_s$$

        **Step 2: current down through the transistor.** The drain is shorted (0 V), so $R_D$ carries nothing and all of $i_{out}$ goes down through the transistor. Drain to source, the dependent source carries $g_mv_{gs}$ and $r_{ds}$ carries $(0 - v_s)/r_{ds}$:
        $$i_{out} = -g_mv_s - \frac{v_s}{r_{ds}} = -\Big(g_m + \frac1{r_{ds}}\Big)v_s$$
        Write $r_s = \dfrac{1}{g_m + 1/r_{ds}} = \dfrac1{g_m}\parallel r_{ds}$: the Unit 7 resistance looking into a source with gate and drain at ground. Then $i_{out} = -v_s/r_s$.

        **Step 3: KCL at the source.** The current coming down the transistor into the source node leaves through $R_S$ toward $v_{in}$:
        $$i_{out} = \frac{v_s - v_{in}}{R_S}$$
      `, mdl({ g: 'gnd', d: 'RDshort', s: 'RSvin' })),
      R(md`
        **Step 4: set the two expressions equal** and multiply by $R_Sr_s$:
        $$-\frac{v_s}{r_s} = \frac{v_s - v_{in}}{R_S}\ \Rightarrow\ -R_Sv_s = r_sv_s - r_sv_{in}$$
        $$v_s = \frac{r_s}{R_S + r_s}\,v_{in}$$
        That is a **voltage divider**: $R_S$ on top, the source's own resistance $r_s$ below.

        **Step 5: $i_{out}$.** $i_{out} = -v_s/r_s$:
        $$i_{out} = -\frac{v_{in}}{R_S + r_s}$$
        $$G_M = -\frac{1}{R_S + \frac1{g_m}\parallel r_{ds}}\approx-\frac{1}{R_S + 1/g_m} = -\frac{g_m}{1 + g_mR_S}$$
        **Negative**: when $v_{in}$ rises, current flows **up** out of the stage into the short.

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$.
        - $r_s = \dfrac{1}{2\,\text{mS} + 0.01\,\text{mS}} = \dfrac{1}{2.01\,\text{mS}} = 497.5\,\Omega$.
        - $G_M = -\dfrac{1}{1000 + 497.5}\,\text{S} = -\dfrac{1}{1497.5}\,\text{S} = -0.668\,\text{mS}$.
      `),
      R(md`
        ### $R_{out}$: turn the input off

        **Step 1:** $v_{in} = 0$, so the bottom of $R_S$ is on ground. The gate is already on ground.

        **Step 2: look at the picture.** Gate grounded, $R_S$ from the source to ground, $R_D$ above, test source on the drain. That is **exactly** the $R_{out}$ circuit of the degenerated common source (previous lesson). The same steps give the same answer:
        - $v_{gs} = -v_s$, and $v_s = i_{dn}R_S$;
        - $i_{dn} = -g_mv_s + (v_t - v_s)/r_{ds}$;
        - so $R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$.
        $$R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$

        **Example** ($R_D = 10\kO$): $R_{DN} = 100 + 1 + 200 = 301\kO$, $R_{out} = 10\text{k}\parallel301\text{k} = 9.68\kO$.
      `, mdl({ g: 'gnd', d: 'RDtest', s: 'RS' })),
      R(md`
        ### The gain

        $$A_v = -G_MR_{out} = +\frac{R_{out}}{R_S + \frac1{g_m}\parallel r_{ds}}\approx+\frac{R_D}{R_S + 1/g_m}$$

        **Sign check, in words:** $v_{in}$ up $\to$ source up $\to$ $v_{gs} = -v_s$ **down** $\to$ the transistor pulls **less** current down out of the drain $\to$ $v_{out}$ **up**. Non-inverting.

        **Example.** $A_v = -(-0.668\,\text{mS})(9.68\kO) = +6.46$. The degenerated common source with the same parts gave $-6.43$: the same size, opposite sign.

        !!intuition The same current, the other way round
        $\dfrac{R_D}{R_S + 1/g_m}$ reads as: $v_{in}$ pushes a current through $R_S$ into the source, which looks like $1/g_m$. That current has nowhere to go but up through the transistor and out of the drain into $R_D$. Gain = $R_D$ divided by the resistance on the input path. In the degenerated common source the same current flows, but it is pulled **down** out of $R_D$, so the sign flips.
      `),
      R(md`
        ### No source resistance, keeping $r_{ds}$

        Set $R_S = 0$: the input drives the source directly.

        **Step 1:** $G_M = -\dfrac{1}{0 + \frac1{g_m}\parallel r_{ds}} = -\Big(g_m + \dfrac1{r_{ds}}\Big)$.

        **Step 2:** $R_{out} = R_D\parallel(r_{ds} + 0 + 0) = R_D\parallel r_{ds}$.

        **Step 3:** $A_v = \Big(g_m + \dfrac1{r_{ds}}\Big)(R_D\parallel r_{ds})$.

        **Step 4: tidy up.** $g_m + \dfrac1{r_{ds}} = \dfrac{1 + g_mr_{ds}}{r_{ds}}$ and $R_D\parallel r_{ds} = \dfrac{R_Dr_{ds}}{R_D + r_{ds}}$. Multiply; $r_{ds}$ cancels:
        $$A_v = (1 + g_mr_{ds})\frac{R_D}{R_D + r_{ds}}\approx g_m(R_D\parallel r_{ds})$$
        The $+1$: even with $g_m = 0$, $v_{in}$ would reach the output through $r_{ds}$ and $R_D$ acting as a divider.

        **Example.** $(2.01\,\text{mS})(10\text{k}\parallel100\text{k}) = (2.01\,\text{mS})(9.09\kO) = +18.27$. The common source gave $-18.18$.
      `),
      R(md`
        ### The input resistance

        Look into the source with the gate held and $R_D$ on the drain. Test source $v_t$ at the source, current $i_t$ flowing in.

        **Step 1: $v_{gs}$.** Gate at 0, source at $v_t$: $v_{gs} = -v_t$.

        **Step 2: where $i_t$ goes.** In at the source, up through the transistor, out of the drain, down through $R_D$ to (incremental) ground. So the drain sits at $v_d = i_tR_D$.

        **Step 3: current through the transistor, drain to source.** That is $-i_t$ (it actually flows source to drain):
        $$-i_t = g_m(-v_t) + \frac{i_tR_D - v_t}{r_{ds}}$$

        **Step 4: multiply by $r_{ds}$:**
        $$-i_tr_{ds} = -g_mr_{ds}v_t + i_tR_D - v_t$$

        **Step 5: collect:** $v_t\,(1 + g_mr_{ds}) = i_t\,(r_{ds} + R_D)$, so
        $$R_{in} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\frac1{g_m} + \frac{R_D}{g_mr_{ds}}$$

        **Example:** $R_{in} = \dfrac{100\text{k} + 10\text{k}}{1 + 200} = \dfrac{110\kO}{201} = 547\,\Omega$. About $1/g_m = 500\,\Omega$.

        !!intuition A current buffer
        Low resistance in ($\approx1/g_m$), high resistance out ($\approx r_{ds}(1 + g_mR_S)$ looking into the drain). A current arriving at the source is accepted almost without a voltage change, passes straight through the transistor, and is delivered into a high-resistance node, where it makes a big voltage. If the drain had an ideal current source on it instead of $R_D$ ($R_D\to\infty$), $R_{in}$ would be infinite: the current would have nowhere to go.
      `, mdl({ g: 'gnd', d: 'RD', s: 'test' })),
      P({
        id: 'e2u8-cg-sym', title: 'Common gate gain with a source resistance',
        q: md`Input through $R_S$ into the source, gate at incremental ground, $R_D$ load. Find $A_v$ with $r_{ds}$ (exact, or the approximation).`,
        fig: F.cg(),
        parts: [E2.ex('(RD || (rds + RS + gm*rds*RS))/(RS + 1/(gm + 1/rds))', ['gm', 'rds', 'RD', 'RS'], 'A_v')],
        hints: [md`$|G_M| = 1/(R_S + \tfrac1{g_m}\parallel r_{ds})$: the current through $R_S$ into a $\tfrac1{g_m}\parallel r_{ds}$ source (output shorted).`, md`$R_{out}$: $R_D$ in parallel with a degenerated drain ($R_S$ in its source, $v_{in}$ dead).`],
        sol: md`**$G_M$** (output shorted): looking into the source with the drain at ground is $\tfrac1{g_m}\parallel r_{ds}$, so the current through $R_S$ is $v_{in}/(R_S + \tfrac1{g_m}\parallel r_{ds})$, and it flows up into the shorted output. **$R_{out}$** ($v_{in}$ dead): $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$.
$$A_v = +\frac{R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)}{R_S + \frac1{g_m}\parallel r_{ds}}\approx\frac{R_D}{R_S + 1/g_m}$$`,
      }),
      P({
        id: 'e2u8-cg-num', title: 'Common gate, with numbers',
        q: md`$g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 500\,\Omega$, $R_D = 5\kO$. Find $G_M$ (with its sign), $R_{out}$, $A_v$, and the input resistance $R_{in}$ looking into the source.`,
        fig: F.cg(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -1.002494 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4.87835 }, { lbl: 'A_v', unit: '', ans: 4.89051 }, { lbl: 'R_{in}', unit: 'Ω', ans: 522.388 }],
        hints: [md`$r_s = \tfrac1{g_m}\parallel r_{ds} = 1/(2.01\,\text{mS})$; $G_M = -1/(R_S + r_s)$.`, md`$R_{out}$ is the same as for the degenerated common source with these parts. $R_{in} = (r_{ds} + R_D)/(1 + g_mr_{ds})$.`],
        sol: md`
1. $r_s = 1/(2.01\,\text{mS}) = 497.5\,\Omega$. $G_M = -\dfrac{1}{500 + 497.5}\,\text{S} = -1.0025\,\text{mS}$.
2. $R_{DN} = 100\text{k} + 0.5\text{k} + (200)(0.5\text{k}) = 200.5\kO$; $R_{out} = 5\text{k}\parallel200.5\text{k} = 4.878\kO$.
3. $A_v = -G_MR_{out} = +(1.0025\,\text{mS})(4.878\kO) = +4.89$. Non-inverting.
4. $R_{in} = \dfrac{100\text{k} + 5\text{k}}{201} = 522\,\Omega$.`,
      }),
      Q(md`A common gate stage has its drain on an ideal current source and drives a load $R_L$ at the drain. What is the input resistance at the source when $R_L$ is removed?`,
        ['Infinite', '$1/g_m$', '$r_{ds}$', '$1/g_m + r_{ds}$'], 0,
        [null, 'Only if the drain sees a small resistance. Here it sees an open.', 'That is the drain side.', 'Look again at $\\frac{r_{ds}+R_D}{1+g_mr_{ds}}$ with $R_D\\to\\infty$.'],
        md`$R_{in} = \dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ with $R_D\to\infty$ is infinite: the current entering the source has nowhere to go. Put $R_L$ back and $R_{in} = \dfrac{r_{ds} + R_L}{1 + g_mr_{ds}}$.`),
      R(md`
        ### Summary

        | | Common gate | Compare: degenerated common source |
        |---|---|---|
        | $G_M$ | $-\dfrac{1}{R_S + \frac1{g_m}\parallel r_{ds}}\approx-\dfrac{g_m}{1+g_mR_S}$ | $+\dfrac{g_m}{1 + g_mR_S}$ |
        | $R_{out}$ | $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$ | the same |
        | $A_v$ | $+\dfrac{R_{out}}{R_S + \frac1{g_m}\parallel r_{ds}}\approx+\dfrac{R_D}{R_S + 1/g_m}$ | $\approx-\dfrac{R_D}{R_S + 1/g_m}$ |
        | No $R_S$ | $A_v = (1 + g_mr_{ds})\dfrac{R_D}{R_D + r_{ds}}$ | |
        | $R_{in}$ | $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\dfrac1{g_m}$ (low) | infinite (a gate) |
      `),
    ],
  });

  L({
    id: 'e2-u8-cd', title: 'Common drain: the source follower', ref: 'Lecture 17',
    steps: [
      R(md`
        ### The plan for this lesson

        The **source follower** (also called **common drain**) drives the gate with $v_{in}$, puts the drain on $V_{DD}$, and takes the output at the **source**, with a load $R_L$ from the source to ground.

        Its gain is a bit **less than 1**. So why use it? Because its input is a gate (infinite resistance) and its output is a source (low resistance, about $1/g_m$). It is a **buffer**: it lets a stage with a big output resistance drive a small load without losing its gain.

        The plan:
        1. The model step above already found the gain by straight KCL.
        2. The same gain by $G_MR_{out}$: $G_M$ comes out **negative**, $R_{out}$ comes out small.
        3. Why a gain below 1 is useful, with numbers.
        4. The DC picture: a level shifter.
      `, F.cd()),
      R(md`
        ### $G_M$: short the output

        The output is the **source** node. Short it to ground.

        **Step 1: what is $v_{gs}$?** Gate at $v_{in}$, source shorted to 0:
        $$v_{gs} = v_{in} - 0 = v_{in}$$

        **Step 2: who carries current?** The drain is on $V_{DD}$, which is incremental ground. So $r_{ds}$ has 0 V at the drain and 0 V at the source: no current. $R_L$ has 0 V across it: no current.

        **Step 3: the dependent source.** It carries $g_mv_{in}$ from the drain **down into the source node**. The only way out of that node is the short. So current flows from the stage **into** the short; the current pulled down into the stage out of the short is the opposite:
        $$i_{out} = -g_mv_{in}$$

        **Step 4:**
        $$G_M = -g_m$$
        Negative, as Lecture 17 writes it.
      `, mdl({ g: 'vin', d: 'gnd', s: 'RLshort' })),
      R(md`
        ### $R_{out}$: turn the input off

        **Step 1: what is $v_{gs}$?** $v_{in} = 0$, so the gate is at 0. Put a test source $v_t$ on the output (the source):
        $$v_{gs} = 0 - v_t = -v_t$$
        The dependent source is alive: the test voltage itself drives it.

        **Step 2: three paths** leave the output node: $R_L$ to ground, $r_{ds}$ up to the drain (at 0), and the dependent source.

        **Step 3: the dependent source.** Drain to source it carries $g_mv_{gs} = -g_mv_t$. A negative current downward is a current $g_mv_t$ flowing **up**, out of the output node into the drain.

        **Step 4: add the three currents** leaving the output:
        $$i_t = \frac{v_t}{R_L} + \frac{v_t}{r_{ds}} + g_mv_t$$

        **Step 5: divide.**
        $$R_{out} = \frac{1}{1/R_L + 1/r_{ds} + g_m} = R_L\parallel r_{ds}\parallel\frac1{g_m}$$

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_L = 10\kO$: $R_{out} = \dfrac{1}{0.1 + 0.01 + 2}\,\text{k}\Omega = \dfrac{1}{2.11\,\text{mS}} = 474\,\Omega$. The $1/g_m = 500\,\Omega$ dominates: a small output resistance.
      `, mdl({ g: 'gnd', d: 'gnd', s: 'RLtest' })),
      R(md`
        ### The gain

        $$A_v = -G_MR_{out} = g_m\Big(R_L\parallel r_{ds}\parallel\frac1{g_m}\Big)$$

        **Show it matches the model step.** Write $R' = R_L\parallel r_{ds}$.
        - **Step 1:** $R'\parallel\dfrac1{g_m} = \dfrac{R'\cdot\frac1{g_m}}{R' + \frac1{g_m}} = \dfrac{R'}{1 + g_mR'}$ (multiply top and bottom by $g_m$).
        - **Step 2:** multiply by $g_m$:
        $$A_v = \frac{g_mR'}{1 + g_mR'} = \frac{R'}{R' + 1/g_m} < 1$$

        **Sign check, in words:** $v_{in}$ up $\to$ $v_{gs}$ up $\to$ more current pushed into the output node $\to$ $v_{out}$ up. But as $v_{out}$ rises, $v_{gs} = v_{in} - v_{out}$ shrinks, so $v_{out}$ can never quite catch $v_{in}$: $0 < A_v < 1$.

        **Example** ($R_L = 10\kO$):
        - $R' = 10\text{k}\parallel100\text{k} = 9.09\kO$, $g_mR' = 18.18$.
        - $A_v = \dfrac{18.18}{19.18} = 0.948$.
        - Check by $G_MR_{out}$: $(2\,\text{mS})(474\,\Omega) = 0.948$.

        !!intuition A voltage divider
        $\dfrac{R'}{R' + 1/g_m}$ is a divider: $1/g_m$ (the transistor seen from its source) on top, the load $R'$ below. A big load gives a gain close to 1; a load near $1/g_m$ gives about $\tfrac12$. The output **follows** the input, shifted down by $V_{GS}$.
      `),
      R(md`
        ### Why a gain below 1 is useful: the buffer

        A common source stage with $g_m = 2\,\text{mS}$ and $R_D = 10\kO$ (ignore its $r_{ds}$): unloaded gain $-20$, output resistance $10\kO$. It has to drive a $1\kO$ load.

        **Case 1: connect the load directly.** The load sits in parallel with $R_D$ at the output:
        - $R_{out} = 10\text{k}\parallel1\text{k} = \dfrac{10}{11}\kO = 0.909\kO$.
        - $A_v = -(2\,\text{mS})(0.909\kO) = -1.82$. About 90% of the gain is gone.

        **Case 2: put a source follower in between** ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, load $R_L = 1\kO$).
        - The common source now drives a gate (infinite resistance): it keeps $-20$.
        - Follower: $R' = 1\text{k}\parallel100\text{k} = 0.990\kO$, $g_mR' = 1.98$, $A_v = \dfrac{1.98}{2.98} = 0.664$.
        - Total: $-20\times0.664 = -13.3$.

        The follower turned $-1.82$ into $-13.3$, even though its own gain is below 1.
      `),
      R(md`
        ### DC: the level shifter

        Use an ideal current source $I_B$ as the load.

        **Step 1:** $I_D = I_B$, fixed.

        **Step 2:** a fixed $I_D$ fixes $V_{ov} = \sqrt{I_B/K}$, so $V_{GS} = V_{TN} + V_{ov}$ is a constant.

        **Step 3:** the output is the gate minus $V_{GS}$:
        $$V_{OUT} = V_{IN} - (V_{TN} + V_{ov})$$
        **Example:** $V_{TN} = 0.5\,\text{V}$, $V_{ov} = 0.2\,\text{V}$: the output copies the input, $0.7\,\text{V}$ lower.

        **Step 4: small signal.** An ideal current source is an open circuit, so $R_L = \infty$ and $R' = r_{ds}$:
        $$A_v = \frac{g_mr_{ds}}{1 + g_mr_{ds}} = \frac{200}{201} = 0.995$$
      `, F.cdI()),
      P({
        id: 'e2u8-cd-sym', title: 'Follower gain with $r_{ds}$',
        q: md`Find $A_v$ of the source follower with load $R_L$, keeping $r_{ds}$.`,
        fig: F.cd(),
        parts: [E2.ex('(RL || rds)/((RL || rds) + 1/gm)', ['gm', 'rds', 'RL'], 'A_v', { exact: true })],
        hints: [md`KCL at the source: $g_m(v_{in} - v_{out}) = v_{out}/(R_L\parallel r_{ds})$.`],
        sol: md`$g_m(v_{in} - v_{out}) = \dfrac{v_{out}}{R_L\parallel r_{ds}}\ \Rightarrow\ A_v = \dfrac{g_m(R_L\parallel r_{ds})}{1 + g_m(R_L\parallel r_{ds})} = \dfrac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m}$.`,
      }),
      P({
        id: 'e2u8-cd-num', title: 'Follower, with numbers',
        q: md`$g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_L = 1\kO$. Find $G_M$ (with its sign), $R_{out}$ and $A_v$.`,
        fig: F.cd(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -2 }, { lbl: 'R_{out}', unit: 'Ω', ans: 332.226 }, { lbl: 'A_v', unit: '', ans: 0.664452 }],
        hints: [md`Output shorted: $v_{gs} = v_{in}$ and the current flows **into** the short, so $G_M = -g_m$.`, md`$R_{out} = 1/(1/R_L + 1/r_{ds} + g_m)$.`],
        sol: md`
1. $G_M = -g_m = -2\,\text{mS}$.
2. $R_{out} = \dfrac{1}{1\,\text{mS} + 0.01\,\text{mS} + 2\,\text{mS}} = \dfrac{1}{3.01\,\text{mS}} = 332\,\Omega$.
3. $A_v = -G_MR_{out} = (2\,\text{mS})(332\,\Omega) = 0.664$.`,
      }),
      R(md`
        ### Summary

        | | Source follower |
        |---|---|
        | $v_{gs}$ | $v_{in} - v_{out}$ (the output fights the input) |
        | $G_M$ | $-g_m$ |
        | $R_{out}$ | $R_L\parallel r_{ds}\parallel\dfrac1{g_m}\approx\dfrac1{g_m}$ (small) |
        | $A_v$ | $\dfrac{R'}{R' + 1/g_m}$, $R' = R_L\parallel r_{ds}$; just under 1, non-inverting |
        | $R_{in}$ | infinite (a gate) |
        | DC | $V_{OUT} = V_{IN} - (V_{TN} + V_{ov})$ |
      `),
    ],
  });

  L({
    id: 'e2-u8-cascode', title: 'The cascode, three ways', ref: 'Gain computation handout, Lecture 16',
    steps: [
      R(md`
        ### The plan for this lesson

        With a current-source load, a common source gives $-\tfrac12g_mr_{ds}$: the most one transistor can do, because the output sees two $r_{ds}$ in parallel. To get more gain you need a much bigger $R_{out}$ without hurting $G_M$.

        The **cascode** does that. $M_1$ is a common source (input on its gate). $M_2$ is stacked on top of it with its gate held (a common gate). $R_D$ is the load. The node between them is called $x$.

        The plan:
        1. Draw the small-signal model.
        2. $G_M$ (output shorted): it is almost exactly $g_{m1}$.
        3. $R_{out}$ (input off): it is multiplied by about $g_{m2}r_{ds2}$.
        4. Multiply, and get the handout's "direct KCL" formula without doing the direct KCL.
        5. The handout's third way, node by node, as a check.
        6. What the cascode buys, in numbers.
      `, F.cascode()),
      R(md`
        ### $G_M$: the model with the output shorted

        **What are the $v_{gs}$?**
        - $M_1$: gate at $v_{in}$, source on ground. $v_{gs1} = v_{in}$.
        - $M_2$: gate held (0), source at $x$. $v_{gs2} = 0 - v_x = -v_x$.

        **Step 1:** the output is shorted, so $R_D$ has 0 V across it and carries nothing. All of $i_{out}$ goes down through $M_2$.

        **Step 2: current down through $M_2$** (drain at 0, source at $v_x$):
        $$i_{out} = g_{m2}(-v_x) + \frac{0 - v_x}{r_{ds2}} = -\Big(g_{m2} + \frac1{r_{ds2}}\Big)v_x$$

        **Step 3: current down through $M_1$** (from $x$ to ground):
        $$i_1 = g_{m1}v_{in} + \frac{v_x}{r_{ds1}}$$

        **Step 4: KCL at $x$.** Only $M_1$ and $M_2$ touch $x$, so what comes down $M_2$ goes down $M_1$: $i_{out} = i_1$.
        $$-\Big(g_{m2} + \frac1{r_{ds2}}\Big)v_x = g_{m1}v_{in} + \frac{v_x}{r_{ds1}}$$
      `, cascModel('short')),
      R(md`
        **Step 5: solve for $v_x$.** Collect the $v_x$ terms:
        $$v_x = -\frac{g_{m1}v_{in}}{g_{m2} + 1/r_{ds2} + 1/r_{ds1}}$$

        **Step 6: put it into Step 2.**
        $$i_{out} = g_{m1}v_{in}\cdot\frac{g_{m2} + 1/r_{ds2}}{g_{m2} + 1/r_{ds2} + 1/r_{ds1}}$$

        **Step 7: multiply top and bottom by $r_{ds1}r_{ds2}$** to clear the fractions:
        $$G_M = \frac{g_{m1}\,r_{ds1}(1 + g_{m2}r_{ds2})}{r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx g_{m1}$$

        **Example.** All $g_m = 2\,\text{mS}$, all $r_{ds} = 100\kO$. In Step 6 the fraction is $\dfrac{2 + 0.01}{2 + 0.01 + 0.01} = \dfrac{2.01}{2.02} = 0.995$, so $G_M = 0.995\times2\,\text{mS} = 1.990\,\text{mS}$.

        !!intuition A current divider
        $M_1$'s dependent source pulls $g_{m1}v_{in}$ out of node $x$. That current can come from $r_{ds1}$ ($100\kO$) or down from $M_2$'s source, which looks like $\tfrac1{g_{m2}}\parallel r_{ds2}\approx500\,\Omega$. It overwhelmingly takes the easy path, through $M_2$, so nearly all of it is pulled out of the output.
      `),
      R(md`
        ### $R_{out}$: turn the input off

        **Step 1:** $v_{in} = 0$, so $v_{gs1} = 0$: $M_1$'s dependent source is dead and $M_1$ is just $r_{ds1}$ from $x$ to ground.

        **Step 2:** so $M_2$ is a transistor with its gate held and a resistor $r_{ds1}$ under its source: the **degenerated drain**, with $R_S = r_{ds1}$. Same steps as before. Let $i_{dn}$ be the current from the test source going down $M_2$:
        - $v_x = i_{dn}r_{ds1}$ and $v_{gs2} = -v_x$;
        - $i_{dn} = -g_{m2}v_x + \dfrac{v_t - v_x}{r_{ds2}}$;
        - multiply by $r_{ds2}$ and substitute: $i_{dn}r_{ds2} = -g_{m2}r_{ds2}r_{ds1}\,i_{dn} + v_t - r_{ds1}\,i_{dn}$;
        - collect: $i_{dn}(r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}) = v_t$.
        $$R_{DN} = r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}\approx(g_{m2}r_{ds2})\,r_{ds1}$$

        **Step 3:** $R_D$ is in parallel:
        $$R_{out} = R_D\parallel R_{DN}$$

        **Example.** $R_{DN} = 100\text{k} + 100\text{k} + (200)(100\text{k}) = 20{,}200\kO = 20.2\,\text{M}\Omega$. With $R_D = 10\kO$: $R_{out} = 10\text{k}\parallel20.2\text{M} = 9.995\kO$.
      `, cascModel('test')),
      R(md`
        ### The gain, and the handout's formula

        Call $N = r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}$. It appears in both halves: it is the bottom of $G_M$, and it is $R_{DN}$.

        **Step 1:** $G_M = \dfrac{g_{m1}r_{ds1}(1 + g_{m2}r_{ds2})}{N}$.

        **Step 2:** $R_{out} = R_D\parallel N = \dfrac{R_DN}{R_D + N}$.

        **Step 3: multiply.** The $N$ cancels:
        $$A_v = -G_MR_{out} = -\frac{g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}$$
        This is exactly what the handout gets by writing KCL at both nodes and eliminating $v_x$ (method 1). $G_MR_{out}$ (method 2) got there with two small calculations.

        **Sign check, in words:** $v_{in}$ up $\to$ $M_1$ pulls more current out of $x$ $\to$ that current comes down through $M_2$ from the output $\to$ $v_{out}$ down. Inverting.

        **Example** ($R_D = 10\kO$): $A_v = -(1.990\,\text{mS})(9.995\kO) = -19.89$. A plain common source with the same $R_D$ gave $-18.2$. Hardly better! The reason: $R_{out} = R_D\parallel20\,\text{M}\Omega\approx R_D$. The huge $R_{DN}$ is wasted when the load $R_D$ is small.
      `),
      R(md`
        ### Method 3: node by node

        **Step 1: what does $M_1$ see?** Looking up into $M_2$'s source, with $R_D$ on its drain and its gate held. That is the common gate input resistance:
        $$R_x = \frac{r_{ds2} + R_D}{1 + g_{m2}r_{ds2}}$$

        **Step 2: $M_1$ is a common source** whose drain sees $r_{ds1}\parallel R_x$:
        $$v_x = -g_{m1}\,(r_{ds1}\parallel R_x)\,v_{in}$$

        **Step 3: from $x$ to the output.** By definition of $R_x$, the current flowing up into $M_2$'s source is $v_x/R_x$. It comes out of $M_2$'s drain and flows through $R_D$ to (incremental) ground:
        $$v_{out} = R_D\cdot\frac{v_x}{R_x}$$

        **Step 4: chain them.**
        $$A_v = -g_{m1}\,(r_{ds1}\parallel R_x)\cdot\frac{R_D}{R_x}$$

        **Example** ($R_D = 10\kO$):
        - $R_x = \dfrac{100\text{k} + 10\text{k}}{201} = 547\,\Omega$.
        - $r_{ds1}\parallel R_x = 100\text{k}\parallel547 = 544\,\Omega$, so $v_x/v_{in} = -(2\,\text{mS})(544\,\Omega) = -1.089$.
        - $v_{out}/v_x = 10\text{k}/547 = 18.27$.
        - $A_v = -1.089\times18.27 = -19.89$. The same as method 2.

        Notice: $M_1$ alone has a gain of only about $-1$ (its load is the small $R_x$). All the voltage gain happens in $M_2$, the common gate.
      `),
      R(md`
        ### What the cascode buys: a big load

        The cascode only pays off when the load is big too.

        **PMOS current-source load** ($r_{ds} = 100\kO$) instead of $R_D$:
        - $R_{out} = 100\text{k}\parallel20.2\text{M} = 99.5\kO$.
        - $A_v = -(1.990\,\text{mS})(99.5\kO) = -198$.
        - A plain common source with the same load: $-(2\,\text{mS})(100\text{k}\parallel100\text{k}) = -100$.

        **Ideal current-source load** ($R_D\to\infty$):
        - $R_{out} = R_{DN} = 20.2\,\text{M}\Omega$.
        - $A_v = -(1.990\,\text{mS})(20.2\,\text{M}\Omega) = -40{,}200\approx-(g_{m1}r_{ds1})(g_{m2}r_{ds2}) = -(200)(200)$.

        To get close to that, the load has to be cascoded as well.

        !!key What the cascode buys
        $G_M\approx g_{m1}$ (as good as a plain common source) and the resistance looking down into the output multiplied by $g_{m2}r_{ds2}$. With a resistor load the gain is still $\approx-g_{m1}R_D$; with a high-resistance load it approaches $-g_{m1}r_{ds1}\,g_{m2}r_{ds2}$, the intrinsic gain squared.
      `),
      P({
        id: 'e2u8-casc-av', title: 'Cascode gain',
        q: md`Find $A_v$ for the cascode with load $R_D$, keeping every $r_{ds}$. Exact, or the approximation if your $R_D$ is small next to the cascode's $R_{out}$ (the checker uses $R_D$ between 1 and 10 kΩ).`,
        fig: F.cascode(),
        parts: [E2.ex('-gm1*RD*rds1*(1 + gm2*rds2)/(RD + rds1 + rds2 + gm2*rds1*rds2)', ['gm1', 'gm2', 'rds1', 'rds2', 'RD'], 'A_v')],
        hints: [md`$G_M\approx g_{m1}$; $R_{out} = R_D\parallel(\text{a degenerated drain with } r_{ds1}\text{ in the source})$.`],
        sol: md`$A_v = -G_MR_{out} = -\dfrac{g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx -g_{m1}R_D$ when $R_D\ll g_{m2}r_{ds2}r_{ds1}$.`,
      }),
      P({
        id: 'e2u8-casc-num', title: 'Cascode, with numbers',
        q: md`Both transistors: $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$. $R_D = 20\kO$. Find $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.cascode(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 1.990099 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 19.98022 }, { lbl: 'A_v', unit: '', ans: -39.7626 }],
        hints: [md`$G_M = g_{m1}\dfrac{g_{m2} + 1/r_{ds2}}{g_{m2} + 1/r_{ds2} + 1/r_{ds1}}$.`, md`$R_{DN} = r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2} = 20.2\,\text{M}\Omega$; $R_{out} = R_D\parallel R_{DN}$.`],
        sol: md`
1. $G_M = 2\,\text{mS}\times\dfrac{2.01}{2.02} = 1.990\,\text{mS}$.
2. $R_{DN} = 20{,}200\kO$. $R_{out} = \dfrac{20\times20{,}200}{20{,}220}\kO = 19.98\kO$.
3. $A_v = -(1.990\,\text{mS})(19.98\kO) = -39.76$.`,
      }),
      R(md`
        ### Summary: three methods, one answer

        | Method | What you do | Best when |
        |---|---|---|
        | 1. Direct KCL | KCL at $x$ and at the output, eliminate $v_x$ | you want to be sure; slow |
        | 2. $G_MR_{out}$ | $G_M\approx g_{m1}$ (output shorted); $R_{out} = R_D\parallel(r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2})$ | almost always |
        | 3. Node by node | $R_x = \dfrac{r_{ds2} + R_D}{1 + g_{m2}r_{ds2}}$; $v_x = -g_{m1}(r_{ds1}\parallel R_x)v_{in}$; $v_{out} = \dfrac{R_D}{R_x}v_x$ | you need the middle-node voltage |

        All three give $A_v = -\dfrac{g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}$.
      `),
    ],
  });

  L({
    id: 'e2-u8-numbers', title: 'Numeric gains without a calculator', ref: 'Practice 3–5, Problem 1',
    steps: [
      R(md`
        ### The plan for this lesson

        Problem 1 on three of the five practice papers is "find the numerical gain, ignore $r_{ds}$". The numbers are chosen so the arithmetic is clean, and the whole problem is a three-step recipe:
        1. **DC first**, only far enough to get each $g_m$.
        2. **Draw the small-signal circuit.**
        3. **Name the stage** and use its result from this unit.

        We go through the recipe, then do three worked examples.
      `),
      R(md`
        ### Recipe step 1: DC, just enough for $g_m$

        **Step 1: the current.** Find each transistor's $I_D$: a current source, a mirror ratio, or the square law.

        **Step 2: the overdrive.** From $I_D = K V_{ov}^2$ with $K = \tfrac12\mu C_{ox}\tfrac WL$:
        $$V_{ov} = \sqrt{I_D/K}$$

        **Step 3: the transconductance.**
        $$g_m = \frac{2I_D}{V_{ov}}$$

        **Typical numbers:** $I_D = 1\,\text{mA}$, $V_{ov} = 0.2\,\text{V}$ give $g_m = \dfrac{2\,\text{mA}}{0.2\,\text{V}} = 10\,\text{mS}$, so $1/g_m = 100\,\Omega$. Keep $1/g_m$ handy: most answers are resistor ratios with $1/g_m$ in them.
      `),
      R(md`
        ### Recipe steps 2 and 3: small signal, then name the stage

        **Small-signal circuit:**
        - DC voltage sources (including $V_{DD}$ and bias voltages) become ground.
        - DC current sources become open circuits.
        - Big ("$\infty$") capacitors become wires.
        - A diode-connected transistor becomes a resistor $1/g_m$.

        **Name the stage** and use its result (with $r_{ds}$ ignored):

        | Stage | Input → output | $A_v$ |
        |---|---|---|
        | Common source | gate → drain | $-g_mR_D$ |
        | Degenerated common source | gate → drain | $-\dfrac{R_D}{R_S + 1/g_m}$ |
        | Common gate | source → drain | $+\dfrac{R_D}{R_S + 1/g_m}$ |
        | Source follower | gate → source | $\dfrac{R_L}{R_L + 1/g_m}$ |

        **Watch for an input divider:** a resistance in front of a $1/g_m$ node splits the signal. Practice 4 #1: $100\,\Omega$ in front of a diode of $100\,\Omega$ halves it.
      `),
      R(md`
        ### Worked example 1: Practice 5 #1, a common gate stage

        Given: $W/L = 500$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, bias current $1\,\text{mA}$, $R_D = 1\kO$, the input coupled by a big capacitor straight onto the source.

        **Step 1:** $K = \tfrac12(100\,\mu\text{A/V}^2)(500) = 25{,}000\,\mu\text{A/V}^2 = 25\,\text{mA/V}^2$.

        **Step 2:** $V_{ov} = \sqrt{1\,\text{mA}/25\,\text{mA/V}^2} = \sqrt{0.04}\,\text{V} = 0.2\,\text{V}$.

        **Step 3:** $g_m = \dfrac{2(1\,\text{mA})}{0.2\,\text{V}} = 10\,\text{mS}$.

        **Step 4: name the stage.** The capacitor is a wire, so the input drives the source with no $R_S$: common gate with $R_S = 0$.

        **Step 5:** $A_v = +\dfrac{R_D}{0 + 1/g_m} = +g_mR_D = (10\,\text{mS})(1\kO) = +10$.
      `),
      R(md`
        ### Worked example 2: a source resistance in front of a common gate

        $g_m = 10\,\text{mS}$ ($1/g_m = 100\,\Omega$), the signal source has $R_S = 100\,\Omega$, $R_D = 2\kO$.

        **Way 1, the formula:** $A_v = +\dfrac{R_D}{R_S + 1/g_m} = \dfrac{2000}{100 + 100} = +10$.

        **Way 2, the divider:**
        - **Step 1:** the source looks like $100\,\Omega$ to ground, so $R_S$ and it form a divider: $v_s = \dfrac{100}{100 + 100}v_{in} = \tfrac12v_{in}$.
        - **Step 2:** from the source to the drain the gain is $g_mR_D = (10\,\text{mS})(2\kO) = 20$.
        - **Step 3:** $A_v = \tfrac12\times20 = +10$. Same answer.
      `),
      R(md`
        ### Worked example 3: degenerated common source and follower

        **Degenerated common source.** $I_D = 1\,\text{mA}$, $V_{ov} = 0.2\,\text{V}$ so $1/g_m = 100\,\Omega$; $R_S = 100\,\Omega$, $R_D = 2\kO$.
        $$A_v = -\frac{R_D}{R_S + 1/g_m} = -\frac{2000}{100 + 100} = -10$$

        **Source follower** with the same transistor and $R_L = 100\,\Omega$:
        $$A_v = \frac{R_L}{R_L + 1/g_m} = \frac{100}{100 + 100} = 0.5$$

        Every answer is "a resistor over a sum of resistors": no calculator needed once you have $1/g_m$.
      `),
      P({
        id: 'e2u8-num-deg', title: 'From $W/L$ to the gain',
        q: md`An NMOS with $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $W/L = 125$, biased at $I_D = 0.25\,\text{mA}$. It is a degenerated common source stage with $R_S = 400\,\Omega$ and $R_D = 8\kO$. Ignore $r_{ds}$. Find $g_m$ and $A_v$.`,
        fig: F.csDeg(),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 2.5 }, { lbl: 'A_v', unit: '', ans: -10 }],
        hints: [md`$K = \tfrac12(100\,\mu)(125) = 6.25\,\text{mA/V}^2$; $V_{ov} = \sqrt{I_D/K}$.`, md`$1/g_m = 400\,\Omega$, so $A_v = -R_D/(R_S + 1/g_m)$.`],
        sol: md`
1. $K = 6.25\,\text{mA/V}^2$, $V_{ov} = \sqrt{0.25/6.25}\,\text{V} = \sqrt{0.04}\,\text{V} = 0.2\,\text{V}$.
2. $g_m = \dfrac{2(0.25\,\text{mA})}{0.2\,\text{V}} = 2.5\,\text{mS}$, so $1/g_m = 400\,\Omega$.
3. $A_v = -\dfrac{8000}{400 + 400} = -10$.`,
      }),
      G('e2_stage', { need: 6 }),
    ],
  });
})();

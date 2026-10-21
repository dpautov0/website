/* Unit 7 — terminal impedances: gate/drain/source, the diode, degeneration as an impedance scaler, cascodes and gain
   boosting, R_UP || R_DN, gates that move (the K rule), differential-pair nodes. Lectures 14–17, Problem Set 5. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u7', l);
  const look = (p, n, side = 'r') => ['term', p, { n: `\\leftarrow ${n}`, side }];

  L({
    id: 'e2-u7-three', title: 'Gate, drain, source', ref: 'Lecture 15',
    steps: [
      R(md`
        Three terminals, three answers, each with the other two terminals at incremental ground. Predict each one before you read on.
      `),
      Q(md`Gate and source at incremental ground. What do you see looking into the **drain**?`,
        ['$r_{ds}$', '$1/g_m$', '$\\infty$', '$r_{ds}\\parallel 1/g_m$'], 0,
        [null, '$1/g_m$ needs $v_{gs}$ to move with the test voltage; here $v_{gs} = 0$.', 'Only for $r_{ds}\\to\\infty$ (the ideal current source).', 'The $1/g_m$ part needs $v_{gs}\\ne0$.'],
        md`$v_{gs} = 0$, so $g_mv_{gs} = 0$ and only $r_{ds}$ connects drain to source: $R_D = r_{ds}$. A transistor with a fixed gate is a current source, imperfect by $r_{ds}$.`,
        { fig: F.drain() }),
      Q(md`Gate and drain at incremental ground. What do you see looking into the **source**?`,
        ['$\\frac1{g_m}\\parallel r_{ds}\\approx\\frac1{g_m}$', '$r_{ds}$', '$\\infty$', '$g_mr_{ds}$'], 0,
        [null, 'That ignores the controlled source, which is very much alive: $v_{gs} = -v_t$.', 'The gate is open, not the source.', 'That is a gain, not a resistance.'],
        md`$v_{gs} = -v_t$: the device carries $g_mv_t$ less current down, i.e. $g_mv_t$ flows in. $R_S = \frac1{g_m}\parallel r_{ds}$. Sources are **low**-impedance nodes (hundreds of ohms), drains are **high**-impedance nodes (tens of kΩ and up).`,
        { fig: F.source() }),
      R(md`
        !!key The three looks (Lecture 15)
        | Looking into | Others at incremental ground | Result |
        |---|---|---|
        | gate | (anything) | $R_G = \infty$ |
        | drain | gate, source | $R_D = r_{ds}$ |
        | source | gate, drain | $R_S = \tfrac1{g_m}\parallel r_{ds}\approx\tfrac1{g_m}$ |

        A useful mental picture: **drains are high, sources are low, gates are infinite.** When a node connects to a source or a diode, that $1/g_m$ path dominates whatever else is there. When a node only sees drains, it is a high-impedance node and its voltage swings a lot (that is where gain comes from).

        The common-source output is the first use: looking up you see $R_D$, looking down you see a drain ($r_{ds}$), so $R_{out} = R_D\parallel r_{ds}$ (Lecture 15, "Revisit CS stage").
      `, [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2.2, 0]], ['term', [2.2, 0], { n: 'v_{out}' }], ['nmos', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['txt', [1.25, -0.55], '$\\uparrow R_{UP} = R_D$', { a: 'l' }], ['txt', [1.25, 0.45], '$\\downarrow R_{DN} = r_{ds}$', { a: 'l' }]]),
    ],
  });

  L({
    id: 'e2-u7-diode', title: 'The diode-connected transistor', ref: 'Lecture 15–16',
    steps: [
      R(md`
        Tie the gate to the drain and the transistor becomes a two-terminal element. Apply $v$: the gate rises with the drain, so $v_{gs} = v$ and the device draws $g_mv$, plus $v/r_{ds}$:
        $$R_{diode} = \frac{1}{g_m}\parallel r_{ds}\approx\frac{1}{g_m}$$
        It behaves like a resistor of $1/g_m$, that is why it is called a "diode" connection (it also always sits in saturation, since $V_{DS} = V_{GS} > V_{ov}$). A diode-connected **PMOS** gives exactly the same $1/g_m$.

        Where it shows up:
        - **Loads**: a CS stage with a diode load has $A_v = -g_{m1}/g_{m2}$, small but set only by geometry.
        - **Mirrors**: the input side of every current mirror is a diode. It converts current to voltage ($v = i/g_m$).
        - **Stacks**: diodes in series add: two diodes give $\tfrac1{g_{m1}} + \tfrac1{g_{m2}}$ (they carry the same current).
        - **With a resistor**: a diode on top of $R_S$ gives $R_S + \tfrac1{g_m}$ (gate follows drain, so there is no $g_mr_{ds}$ magnification).
      `, F.diode()),
      Q(md`Two diode-connected NMOS are stacked in series between a node and ground; $M_a$ has $g_m = 2\,\text{mS}$, $M_b$ has $g_m = 5\,\text{mS}$. Ignoring $r_{ds}$, what resistance does the node see?`,
        ['$700\\,\\Omega$', '$143\\,\\Omega$', '$500\\,\\Omega$', '$7\\,\\text{k}\\Omega$'], 0,
        [null, 'That is the two in parallel; stacked devices are in series.', 'That is only the 2 mS device.', 'Check the units: $1/(2\\,\\text{mS}) = 500\\,\\Omega$.'],
        md`Series: $\tfrac1{g_{ma}} + \tfrac1{g_{mb}} = 500 + 200 = 700\,\Omega$. (Problem Set 6(a) uses exactly this: $R_{DN1} = \tfrac1{g_{m2}} + \tfrac1{g_{m3}}$, and the middle node is a divider of the two.)`),
      P({
        id: 'e2u7-diode-rs', title: 'A diode on a resistor',
        q: md`A diode-connected NMOS sits on top of $R_S$. Find the resistance looking in (keep $r_{ds}$). The answer box accepts the exact form or the $g_mr_{ds}\gg1$ approximation.`,
        fig: F.diodeRS(),
        parts: [E2.ex('RS + 1/(gm + 1/rds)', ['gm', 'rds', 'RS'], 'R_{DN}')],
        hints: [md`Gate and drain are the same node, so $v_{gs} = v_t - v_s$, and $v_s = i_tR_S$.`, md`$i_t = (g_m + g_{ds})(v_t - v_s)$.`],
        sol: md`$i_t = (g_m + \tfrac1{r_{ds}})(v_t - i_tR_S)\ \Rightarrow\ v_t = i_t\Big(R_S + \frac{1}{g_m + 1/r_{ds}}\Big)$
$$R_{DN} = R_S + \tfrac1{g_m}\parallel r_{ds} \approx R_S + \tfrac1{g_m}$$
The diode just adds in series. Problem Set 5 (h)'s official answer writes "$\approx R_1$": that only holds if $g_mR_1\gg1$. Keep the $1/g_m$.`,
      }),
    ],
  });

  L({
    id: 'e2-u7-scaler', title: 'Degeneration: the impedance scaler', ref: 'Lecture 17',
    steps: [
      R(md`
        This is the most important page of the unit. One transistor with its gate held still transforms resistances between its source and its drain.

        **Looking down into the drain, with $R_S$ in the source.** Push the drain up: a little current flows down through the device and through $R_S$. That current lifts the source, which **lowers $v_{gs}$**, which shuts the channel and fights the current. The device works hard to keep its current constant, which is what a big resistance does:
        $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S \approx r_{ds}(1 + g_mR_S)\approx g_mr_{ds}R_S\ \ (g_mR_S\gg1)$$
        **$R_S$ appears $g_mr_{ds}$ times larger from the drain.**
      `, F.drainDeg()),
      R(md`
        **Looking up into the source, with $R_D$ on the drain.** Now push the source up by $v$. The device wants to pull $g_mv$ less, but whatever current changes must also flow through $R_D$, which then moves the drain, which changes $v_{ds}$ and feeds back through $r_{ds}$. The result:
        $$R_S = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\frac1{g_m} + \frac{R_D}{g_mr_{ds}}$$
        **$R_D$ appears $g_mr_{ds}$ times smaller from the source.** It is $\approx 1/g_m$ only while $R_D\ll r_{ds}$.
      `, F.sourceRD()),
      R(md`
        !!key Lecture 17: "CG acts as an impedance scaler"
        From the drain, the source side is multiplied by $g_mr_{ds}$. From the source, the drain side is divided by $g_mr_{ds}$.

        !!trap The current-source load
        If the drain sits on an **ideal current source**, $R_D\to\infty$ and the source impedance is **infinite**, not $1/g_m$. The current has nowhere to go, so the source cannot accept any. (Lecture 17 note, and a favourite short-answer question.)

        **Why it matters on the exam.** Problem 2 on every practice paper is a node where one branch is a degenerated drain (sometimes the "resistor" is itself a diode, a cascode, or another degenerated device). Name the thing in the source, compute its resistance with the canonical results, and multiply by $g_mr_{ds}$.
      `),
      Q(md`$g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 1\kO$ in the source, gate held. About how big is the resistance looking into the drain?`,
        ['$\\approx 150\\kO$', '$\\approx 51\\kO$', '$\\approx 100\\kO$', '$\\approx 1\\kO$'], 0,
        [null, 'That is $r_{ds} + R_S$, without the $g_mr_{ds}R_S$ term, which is the big one.', 'That is $g_mr_{ds}R_S$ alone; add $r_{ds}$.', 'That is $R_S$ alone; the transistor magnifies it.'],
        md`$r_{ds} + R_S + g_mr_{ds}R_S = 50 + 1 + 100 = 151\kO$. Here $g_mR_S = 2$, so the "$\approx g_mr_{ds}R_S$" shortcut would be 33% low; $r_{ds}(1 + g_mR_S) = 150\kO$ is the safe approximation.`),
      Q(md`Gate held, the drain loaded by $R_D = r_{ds}$. What do you see looking into the source?`,
        ['$\\approx 2/g_m$', '$\\approx 1/g_m$', '$\\approx r_{ds}$', '$\\infty$'], 0,
        [null, 'That needs $R_D\\ll r_{ds}$. Here $R_D/(g_mr_{ds}) = 1/g_m$ adds a second $1/g_m$.', 'The drain resistance is divided by $g_mr_{ds}$, not passed straight through.', 'Only for an ideal current source on the drain.'],
        md`$\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}} = \dfrac{2r_{ds}}{1 + g_mr_{ds}}\approx\dfrac{2}{g_m}$. This is exactly what happens in a differential pair or a cascode whose drain load is another transistor's $r_{ds}$ (Problem Set 6(f): $R_X \approx \tfrac1{g_m}(1 + \tfrac{R}{r_{ds}})$).`),
      P({
        id: 'e2u7-src-rd', title: 'Derive the other direction',
        q: md`Derive the resistance looking into the source of a transistor whose gate is at incremental ground and whose drain has $R_D$ to incremental ground. Keep $r_{ds}$.`,
        fig: F.sourceRD(),
        parts: [E2.ex('(rds + RD)/(1 + gm*rds)', ['gm', 'rds', 'RD'], 'R_S')],
        hints: [md`The test current $i_t$ flows in at the source, up through the device, and down through $R_D$: so $v_d = i_tR_D$.`, md`Device current from drain to source is $-i_t$: $-i_t = g_m(0 - v_t) + \dfrac{v_d - v_t}{r_{ds}}$.`],
        sol: md`$v_d = i_tR_D$. KCL for the device (drain to source): $-i_t = -g_mv_t + \dfrac{i_tR_D - v_t}{r_{ds}}$. Multiply by $r_{ds}$: $-i_tr_{ds} = -g_mr_{ds}v_t + i_tR_D - v_t$, so
$$v_t(1 + g_mr_{ds}) = i_t(r_{ds} + R_D)\ \Rightarrow\ R_S = \frac{r_{ds}+R_D}{1+g_mr_{ds}}$$
This is the common-gate input resistance (Lecture 17).`,
      }),
    ],
  });

  L({
    id: 'e2-u7-cascode', title: 'Cascodes and gain boosting', ref: 'Lectures 16–17',
    steps: [
      R(md`
        A **cascode** is a degenerated drain whose "$R_S$" is another transistor's $r_{ds}$. So you already know the answer:
        $$R_{out} = r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}\approx g_{m2}r_{ds2}\,r_{ds1}$$
        One intrinsic gain ($\sim100$) times one $r_{ds}$: megohms. Stack another device and you multiply by another $g_mr_{ds}$.

        The general rule for any stack: **work from the bottom up**, turning everything below a transistor's source into one resistance $R_x$, then $R_{next} = r_{ds} + R_x(1 + g_mr_{ds})$. Practice 2 #2(a) is exactly that: $M_2$ on $R$ gives $R_Y = R + r_{ds2}(1 + g_{m2}R)$, then $M_1$ on $R_Y$ gives $r_{ds1} + R_Y(1 + g_{m1}r_{ds1})$. (The gate of $M_3$ hanging on $Y$ draws nothing, and in (a) $M_1$'s gate sits on a voltage source.)
      `, F.cascodeR()),
      P({
        id: 'e2u7-casc-sym', title: 'Cascode output resistance',
        q: md`Both gates at incremental ground. Find $R_{out}$ looking into $M_2$'s drain. (Exact form or the $g_mr_{ds}\gg1$ approximation.)`,
        fig: F.cascodeR(),
        parts: [E2.ex('rds1 + rds2 + gm2*rds2*rds1', ['gm2', 'rds1', 'rds2'], 'R_{out}')],
        hints: [md`Looking down from $M_2$'s source you see $M_1$'s drain: $r_{ds1}$. Now it is a degenerated drain with $R_S = r_{ds1}$.`],
        sol: md`$M_2$ degenerated by $r_{ds1}$: $R_{out} = r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}\approx g_{m2}r_{ds2}r_{ds1}$.`,
      }),
      R(md`
        **Gain boosting (the regulated cascode).** Practice 2 #2(b) replaces the voltage source on $M_1$'s gate with an amplifier: $M_3$ looks at node $Y$ (gate) and drives $M_1$'s gate (drain), with an ideal current source $I_B$ as its load. In small signal $I_B$ is open, so $M_3$ is a CS stage with gain $-A = -g_{m3}r_{ds3}$.

        Follow a disturbance: $Y$ rises by $v_Y$ → $M_1$'s gate falls by $Av_Y$ → $v_{gs1}$ falls by $(1 + A)v_Y$ instead of just $v_Y$. The transistor fights $(1+A)$ times harder, so the magnification $g_{m1}r_{ds1}$ becomes $g_{m1}r_{ds1}(1 + A)$:
        $$R_{out} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y\approx (g_{m1}r_{ds1})(g_{m3}r_{ds3})R_Y$$
      `, F.regCascode()),
      Q(md`In the regulated cascode, why does the ideal current source $I_B$ matter for the small-signal answer?`,
        ['It is an open circuit, so $M_3$\'s only load is $r_{ds3}$, giving the full gain $g_{m3}r_{ds3}$.', 'It sets $M_1$\'s gate to incremental ground.', 'It adds $r_{ds}$ in parallel with $R$.', 'It does not: $M_3$ could be removed.'], 0,
        [null, 'If $M_1$\'s gate were incremental ground there would be no boosting at all (that is part (a)).', 'It is connected to $M_1$\'s gate node, not to $Y$.', '$M_3$ is the whole point: it moves $M_1$\'s gate.'],
        md`An ideal current source has infinite small-signal resistance, so the gate node of $M_1$ is a high-impedance node and $M_3$ gets its intrinsic gain. With a resistor load $R_B$ instead, $A = g_{m3}(r_{ds3}\parallel R_B)$.`),
    ],
  });

  L({
    id: 'e2-u7-node', title: 'A node: $R_{UP}\\parallel R_{DN}$', ref: 'Lecture 15, Problem Set 5',
    steps: [
      R(md`
        Most "find $R_{EQ}$" questions put the test source at a node with several branches. A test voltage at the node pushes current into every branch at once, and each branch only feels the test voltage at its own terminal, so:

        !!key Split the node
        $$R_{EQ} = R_{UP}\parallel R_{DN}\ (\parallel\text{ any other branch})$$
        Find each branch with the canonical results, then combine. The **smallest** branch dominates, so spot the $1/g_m$ branches first.

        **Example** (Practice 1 #2(a)): up, a diode-connected PMOS $M_2$ with $R_1$ at its source; down, $M_1$ with its gate grounded and $R_S$ in its source.
        - $R_{UP}$: diode on a resistor: $R_1 + \tfrac1{g_{m2}}\parallel r_{ds2}$.
        - $R_{DN}$: degenerated drain: $r_{ds1} + R_S + g_{m1}r_{ds1}R_S$.
        - $R_{eq1} = \big[R_1 + \tfrac1{g_{m2}}\parallel r_{ds2}\big]\parallel\big[r_{ds1}(1 + g_{m1}R_S) + R_S\big]\approx R_1 + \tfrac1{g_{m2}}$ (the up branch is tiny next to the down branch).

        !!trap A branch can hide in a gate
        If the node also drives a **gate** whose transistor's drain is on the same node, that transistor is a third branch: its gate moves with the test voltage. That is the K rule, next lesson.
      `, [['rail', [1, -3.2]], ['R', [1, -3.2], [1, -2], { n: 'R_1' }], ['pmos', [1, -1], { n: 'M_2', dc: true }], ['w', [1, 0], [2, 0]], look([2, 0], 'R_{eq1}'), ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]]]),
      G('e2_updn', { need: 6 }),
    ],
  });

  L({
    id: 'e2-u7-k', title: 'Gates that move: the K rule', ref: 'Problem Set 5 (f)–(i)',
    steps: [
      R(md`
        Sometimes the test voltage reaches a transistor's **gate** as well as its drain: through a resistor divider, a diode in a stack, or the source of another device. Then $v_{gs}$ is not just set by the source, and the transistor pulls extra current.

        Say the gate moves by $v_g = K\,v_t$ ($0\le K\le1$ is the usual case). KCL with $v_s = i_tR_S$:
        $$i_t = g_m(Kv_t - i_tR_S) + \frac{v_t - i_tR_S}{r_{ds}}\ \Rightarrow\ R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$$
      `, F.drainK()),
      R(md`
        !!key Read the K rule at its corners
        - $K = 0$ (gate held): the degenerated drain, $r_{ds} + R_S + g_mr_{ds}R_S$.
        - $K = 1$ (gate on the drain): a diode on $R_S$, $\approx R_S + 1/g_m$.
        - $R_S = 0$: $r_{ds}\parallel\dfrac{1}{Kg_m}$. The device acts like a resistor $1/(Kg_m)$.
        - Large $g_mr_{ds}K$: $R_{DN}\approx\dfrac{R_S + 1/g_m}{K}$.

        **Finding $K$** is the real work. Look at whatever drives the gate and ask "if the node moves by $v_t$, how much does the gate move?":
        - A resistor divider: $K = R_b/(R_a + R_b)$.
        - The middle of a stack of diodes/resistors carrying the test current: $K = \dfrac{\text{resistance below the gate's node}}{\text{total resistance of that branch}}$ (Problem Set 5 (f): $K = \dfrac{1/g_{m2}}{R_{DN1}}$; (i): $K = R_2/R_{UP}$).
        - The gate on the source of a device whose drain carries the test current (Practice 1 #2(b)).

        Problem Set 5 (f) is the classic: $M_4$'s gate hangs on the diode $M_2$ at the bottom of the left branch. The left branch carries current $v_t/R_{DN1}$, so the diode node sits at $v_t\cdot\frac{1/g_{m2}}{R_{DN1}}$, and the third branch is $r_{ds4}\parallel\frac{g_{m2}R_{DN1}}{g_{m4}}$.
      `),
      G('e2_k', { need: 3 }),
      P({
        id: 'e2u7-k-sym', title: 'The gate on a divider, symbolic',
        q: md`The gate of a transistor (with $R_S$ in its source) is driven by a node that moves $K$ times the drain voltage. Find $R_{DN}$ looking into its drain. Exact or approximate form.`,
        fig: F.drainK(),
        parts: [E2.ex('(rds + RS + gm*rds*RS)/(1 + gm*rds*K)', ['gm', 'rds', 'RS', 'K'], 'R_{DN}')],
        hints: [md`$v_s = i_tR_S$ and $v_g = Kv_t$, so $v_{gs} = Kv_t - i_tR_S$.`],
        sol: md`$i_t = g_m(Kv_t - i_tR_S) + \dfrac{v_t - i_tR_S}{r_{ds}}$. Times $r_{ds}$: $i_t(r_{ds} + R_S + g_mr_{ds}R_S) = v_t(1 + g_mr_{ds}K)$, so
$$R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}\approx\frac{R_S + 1/g_m}{K}$$`,
      }),
      R(md`
        **Feedback through a mirror** (Practice 4 #3(b), Practice 5 #2(b)): the test current flows through one branch, lands on a diode, and the diode's voltage drives another transistor's gate whose drain is the test node. Same idea, one more step: find the current through the diode ($i$), its voltage ($i\times\frac1{g_m}$, or $i(R + \frac1{g_m})$ with a resistor), then that transistor's extra current $\approx g_m\times$ that voltage. Each extra current that scales with $i_t$ divides the branch resistance: $R_{EQ} = \dfrac{R_{branch}}{1 + (\text{extra current per unit }i)}$. Practice 5 #2(b) gives
        $$R_{eq2} = r_{ds3}\parallel r_{ds4}\parallel\frac{R_{eq1}}{1 + g_{m3}R + g_{m4}R_X}$$
        with $R_X = R + \tfrac1{g_{m2}}\parallel r_{ds2}$ and $R_{eq1} = r_{ds1} + R_X(1 + g_{m1}r_{ds1})$. Both are worked in full in the practice exams.
      `),
    ],
  });

  L({
    id: 'e2-u7-pair', title: 'Differential-pair nodes', ref: 'Practice 3 #3',
    steps: [
      R(md`
        A differential pair is two transistors sharing a source node $P$, fed by a tail current source (open in small signal). With both gates at incremental ground, a test voltage at one output drives current down $M_2$, into $P$, and since the tail is open, **all of it goes up through $M_1$** into $M_1$'s drain load.

        So looking down from $M_2$'s drain you see a degenerated drain whose "$R_S$" is "looking into $M_1$'s source with $M_1$'s load on its drain":
        $$R_P = \frac{r_{ds1} + R_{L1}}{1 + g_{m1}r_{ds1}},\qquad R_{DN2} = r_{ds2} + R_P(1 + g_{m2}r_{ds2})$$

        **Current-source loads** (Practice 3 #3(a)): $R_{L1} = r_{ds3}$, so $R_P\approx 2/g_{m1}$ and $R_{DN2}\approx 3r_{ds}$ for matched devices; $R_{EQ1} = r_{ds4}\parallel R_{DN2}$.

        **Mirror load** (Practice 3 #3(b)): $R_{L1} = 1/g_{m3}$ (the diode), so $R_{DN2}\approx 2r_{ds}$. But the current that lands on the diode $M_3$ is copied by $M_4$, which pulls the same current out of the output: the path counts **twice**:
        $$R_{EQ2} = r_{ds4}\parallel\frac{R_{DN2}}{1 + g_{m4}/g_{m3}}\approx r_{ds4}\parallel r_{ds2}$$
      `, F.diffMirror()),
      Q(md`In a differential pair with an ideal tail current source, a test current is pushed into $M_2$'s drain. Where does it go?`,
        ['Down $M_2$, then up through $M_1$ into $M_1$\'s drain load.', 'Down $M_2$ and into the tail source.', 'Nowhere: the output impedance is infinite.', 'Half through each transistor to ground.'], 0,
        [null, 'The tail is an ideal current source: open in small signal.', 'It does flow, because $M_1$\'s source is a $1/g_m$-ish path to its drain load.', 'Neither transistor has a path to ground except through its drain load.'],
        md`With the tail open, $M_1$ and $M_2$ are in series through node $P$. The current goes down $M_2$ and up $M_1$ (backwards through it, as a common-gate device) into $M_1$'s load.`),
    ],
  });
})();

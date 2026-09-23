/* Unit 0 — the circuit-analysis toolkit every later unit leans on. */
(function () {
  const { R, P, G } = C;
  const kO = (r) => U.si(r, 'Ω');

  C.unit({
    id: 'u0', num: 'Unit 0', title: 'Circuit Analysis Toolkit',
    blurb: 'Sign conventions, KCL/KVL, dividers, and nodal and mesh analysis done the reliable way, including supernodes and dependent sources.',
    lessons: [
      // -------------------------------------------------------------------
      {
        id: 'u0-signs', title: 'Voltage, current and sign conventions',
        steps: [
          R(md`
            A **current arrow** and a pair of **$+/-$ marks** are *reference directions*. You draw them before you know the answer. If the real current flows the other way, the number simply comes out negative. That's not an error; it's information.

            **Voltage** is always a *difference* between two nodes. The $+$ mark says "this end is the one we measure from": $v = v_+ - v_-$.

            !!key Passive sign convention
            If the current arrow **enters the $+$ terminal** of a resistor, Ohm's law is $v = iR$ and $p = vi$ is power *absorbed*.
            If the arrow enters the $-$ terminal instead, you get $v = -iR$.

            Almost every sign mistake in this course comes from mixing these two cases. When you label a resistor yourself, **always** draw the current into the $+$ end so that $v = iR$ holds without thinking.
          `),
          G('ohm', { need: 3 }),
          P({
            q: md`A resistor has $v = 6\,\text{V}$ across it (with $+$ on top), and the reference arrow for $i$ points **up** through it, entering at the bottom. The resistor is $2\kO$. What is $i$?`,
            parts: [{ lbl: 'i', unit: 'mA', ans: -3 }],
            hints: [md`The arrow enters the $-$ terminal, so $v = -iR$.`],
            sol: md`$i = -v/R = -6/2 = -3\,\text{mA}$. The real current flows *down* (into the $+$ end), exactly as you'd expect for a resistor; our arrow just pointed the other way.`,
          }),
          P({
            q: md`An element has $v = 5\,\text{V}$ (+ on top) and $i = 2\,\text{mA}$ entering its $+$ terminal. Is it absorbing or delivering power, and how much?`,
            parts: [
              { mc: ['Absorbing 10 mW', 'Delivering 10 mW', 'Absorbing 2.5 mW', 'Delivering 2.5 mW'], a: 0, why: [null, 'With current entering $+$, $p = vi$ is power **absorbed**. It is positive here.', '$p = vi$, not $v/i$.', '$p = vi$, not $v/i$.'] },
            ],
            sol: md`Current enters $+$, so passive convention applies: $p_{abs} = vi = (5)(2\,\text{mA}) = 10\,\text{mW} > 0$. It absorbs power (resistor-like). A source delivering power would show current *leaving* its $+$ terminal.`,
          }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-kcl', title: "Kirchhoff's current law",
        steps: [
          R(md`
            A **node** is everything connected by plain wire. However many dots are drawn, if you can trace between two points along wire alone, they are the same node.

            **KCL:** charge doesn't pile up at a node, so what flows in must flow out:

            $$\sum i_{\text{in}} = \sum i_{\text{out}} \qquad\Longleftrightarrow\qquad \sum i_{\text{leaving}} = 0$$

            !!key Convention used here
            Write every KCL as **"sum of currents *leaving* the node = 0."** A current drawn *into* the node enters that sum with a minus sign. Committing to one convention is what makes nodal analysis mechanical.
          `),
          G('kcl', { need: 3 }),
          P({
            q: md`How many **independent** KCL equations does a circuit with 5 nodes have?`,
            parts: [{ lbl: 'N', unit: '', ans: 4 }],
            hints: [md`The KCL at the last node is just the sum of all the others. It adds nothing new.`],
            sol: md`$N - 1 = 4$. That's why nodal analysis picks one node as **ground** (reference, $0\,\text{V}$) and writes KCL at the remaining ones.`,
          }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-kvl', title: "Kirchhoff's voltage law",
        steps: [
          R(md`
            **KVL:** walk any closed loop and come back to where you started; you're back at the same potential, so the voltages add to zero:

            $$\sum_{\text{loop}} v_{\text{drop}} = 0$$

            !!method How to walk a loop
            - Pick a direction (clockwise is conventional) and a starting corner.
            - For each element: if you **enter at its $+$** mark, add $+v$ (a drop). If you enter at its $-$ mark, add $-v$ (a rise).
            - Set the sum to zero and solve.

            KVL is how you get voltages you weren't given, and it's the backbone of **mesh analysis** later in this unit.
          `),
          G('kvl', { need: 3 }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-divide', title: 'Series, parallel and dividers',
        steps: [
          R(md`
            **Series** elements carry the same current; resistances add. **Parallel** elements share the same voltage; *conductances* add:

            $$R_1 \pl R_2 = \frac{R_1R_2}{R_1+R_2}\qquad\qquad R \pl R = \frac{R}{2}\qquad\qquad R\pl R\pl\cdots(n) = \frac{R}{n}$$

            The parallel combination is always **smaller than the smallest** resistor. Use that as a sanity check every time.

            !!key The two dividers
            **Voltage divider** (series string): $\displaystyle v_2 = V\frac{R_2}{R_1+R_2}$. The bigger resistor takes the bigger share.

              **Current divider** (parallel pair): $\displaystyle i_2 = I\frac{R_1}{R_1+R_2}$. Note it's the **other** resistor on top. The smaller resistor takes the bigger share.

            !!trap Loaded dividers
            The divider formula assumes nothing draws current from the output. If a load hangs off the middle node, combine it in parallel with the bottom resistor first. This idea, **loading**, returns in Unit 1 as Thévenin equivalents.
          `),
          G('req', { need: 2 }),
          G('vdiv', { need: 3 }),
          G('idiv', { need: 2 }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-nodal1', title: 'Nodal analysis: the recipe',
        steps: [
          R(md`
            Nodal analysis turns any linear circuit into a set of linear equations, **with no guessing about which way currents flow.** It's the single most useful skill in this course, because every small-signal problem on the exam ends up as one.

            !!method The recipe
            1. **Pick ground.** Usually the bottom rail, or the node touching the most elements, or the $-$ end of the main source.
            2. **Label the unknown node voltages** $v_1, v_2, \dots$. A node tied to ground through a voltage source is *known*; don't make it an unknown.
            3. **At each unknown node, write KCL as "currents leaving = 0."** Every resistor to another node contributes $\dfrac{v_{\text{this}} - v_{\text{other}}}{R}$. A current source contributes $+I$ if its arrow leaves the node and $-I$ if it enters.
            4. **Solve** the equations.

            The "(me minus them) over $R$" pattern is the whole trick. You assume current *leaves* through every branch; the algebra sorts out the real directions.

            !!tip Units that save you on an exam
            Work in **kΩ, V and mA** together: $\text{V}/\text{k}\Omega = \text{mA}$. No powers of ten ever appear.

            ### Worked example
            Find $v_1$ below.
          `, FIGS.nodal1(10, 2000, 3000, 1e-3, true), md`
            One unknown node. KCL at node 1, currents leaving (kΩ, mA):

            $$\frac{v_1 - 10}{2} + \frac{v_1}{3} - 1 = 0$$

            The $-1$ is the source: its arrow points **into** node 1. Multiply by 6: $3(v_1 - 10) + 2v_1 - 6 = 0 \Rightarrow 5v_1 = 36 \Rightarrow v_1 = 7.2\,\text{V}$.

            **Check:** current out through $R_1$ is $(7.2-10)/2 = -1.4$ mA (so $1.4$ mA actually flows *in* from the source); out through $R_2$: $2.4$ mA; in from $I_S$: $1$ mA. In: $1.4 + 1 = 2.4$. Out: $2.4$. ✓
          `),
          G('nodal1', { need: 3 }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-nodal2', title: 'Nodal analysis: two unknown nodes',
        steps: [
          R(md`
            Two unknowns means two KCL equations, one per node. The only new feature is a resistor **between** two unknown nodes, which appears in *both* equations with opposite signs.

            ### Worked example
          `, FIGS.nodal2({ Vs: 12, R1: 2000, R2: 8000, R3: 2000, R4: 3000, Is: 1e-3, into: true }), md`
            **Node 1:** $\dfrac{v_1-12}{2}+\dfrac{v_1}{8}+\dfrac{v_1-v_2}{2}=0 \;\xrightarrow{\times 8}\; 9v_1 - 4v_2 = 48$

            **Node 2:** $\dfrac{v_2-v_1}{2}+\dfrac{v_2}{3}-1=0 \;\xrightarrow{\times 6}\; -3v_1 + 5v_2 = 6$

            From the second, $v_1 = (5v_2-6)/3$. Substituting: $15v_2 - 18 - 4v_2 = 48 \Rightarrow v_2 = 6\,\text{V}$, and $v_1 = 8\,\text{V}$.

            !!key Writing the matrix by inspection
            For circuits with only resistors and current sources, the equations always have this shape:
            - **Diagonal** entry at node $k$ = sum of all conductances touching node $k$.
            - **Off-diagonal** entry $(j,k)$ = **minus** the conductance directly between $j$ and $k$.
            - **Right side** = current pushed *into* the node by sources (a voltage source $V_S$ behind $R_1$ pushes $V_S/R_1$).

              It's the same as writing KCL term by term, just faster. Use it to check your equations.
          `),
          G('nodal_setup', { need: 3 }),
          G('nodal2', { need: 3 }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-supernode', title: 'Voltage sources and supernodes',
        steps: [
          R(md`
            Voltage sources break the "current through each branch" pattern, because the current through an ideal voltage source can be anything. There are two cases.

            **Grounded source.** If a voltage source connects a node to ground, that node's voltage is simply *known*. It's not an unknown, and you don't write KCL there.

            **Floating source** (between two unknown nodes). You can't write its current, so:

            !!method Supernode
            1. Draw a closed bubble around **both** nodes and the source between them.
            2. Write **one** KCL for the whole bubble: every current crossing the bubble's boundary, leaving = 0. The source's own current stays inside and never appears.
            3. Add the **constraint** equation: $v_+ - v_- = V_{\text{source}}$.

            Two unknowns, two equations, done.

            ### Worked example
            $I_S = 4\,\text{mA}$ into node 1, $R_1 = 2\kO$, $R_2 = 3\kO$, $R_3 = 6\kO$, and $V_F = 3\,\text{V}$ with its $+$ at node 2. Bubble KCL:
            $$-4 + \frac{v_1}{2} + \frac{v_2}{3} + \frac{v_2}{6} = 0 \quad\Rightarrow\quad v_1 + v_2 = 8$$
            Constraint: $v_2 - v_1 = 3$. So $v_2 = 5.5\,\text{V}$, $v_1 = 2.5\,\text{V}$.
          `),
          G('supernode', { need: 3 }),
          P({
            q: md`Why can't you write an ordinary KCL equation at a node where a *floating* voltage source attaches?`,
            parts: [{ mc: [
              "The current through an ideal voltage source isn't set by its voltage, so you'd introduce an unknown current.",
              'Voltage sources violate KCL.',
              'The node voltage is always zero there.',
              "You can, it's just slower.",
            ], a: 0, why: [null, 'KCL always holds. The issue is the unknown current through the source.', 'Nothing forces it to zero.', "You can if you add the source current as an extra unknown, but the supernode avoids that entirely."] }],
            sol: md`An ideal voltage source fixes a voltage, not a current. Its current is whatever the rest of the circuit demands. Enclosing the source in a supernode keeps that unknown current internal, and the source's voltage supplies the missing equation.`,
          }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-mesh', title: 'Mesh analysis',
        steps: [
          R(md`
            For a planar circuit, you can instead assign a **mesh current** circulating around each window and write **KVL** around each.

            !!method Mesh recipe
            1. Draw a clockwise current $i_1, i_2, \dots$ in each window.
            2. In mesh $k$, walk with $i_k$. A resistor that only mesh $k$ touches drops $R\,i_k$. A resistor **shared** with mesh $j$ carries $i_k - i_j$ (from mesh $k$'s point of view).
            3. Sources: entering $+$ is a drop $+V$; entering $-$ is a rise $-V$.
            4. A current source on the outer edge of a mesh **fixes** that mesh current. A current source shared by two meshes calls for a **supermesh**, the mesh version of a supernode.

            ### Worked example
            $V_1 = 10\,\text{V}$ (left), $R_1 = 2\kO$, shared $R_3 = 4\kO$, $R_2 = 2\kO$, $V_2 = 2\,\text{V}$ on the right with $+$ on top.

            Mesh 1: $-10 + 2i_1 + 4(i_1 - i_2) = 0 \Rightarrow 6i_1 - 4i_2 = 10$

            Mesh 2: $4(i_2 - i_1) + 2i_2 + 2 = 0 \Rightarrow -4i_1 + 6i_2 = -2$

            Solving: $i_1 = 2.6\,\text{mA}$, $i_2 = 1.4\,\text{mA}$, and $R_3$ carries $i_1 - i_2 = 1.2\,\text{mA}$ downward.

            !!tip Nodal or mesh?
            Count unknowns. Nodal needs (nodes − 1 − grounded voltage sources) equations; mesh needs (windows − current sources on edges). Pick whichever is smaller. For transistor small-signal models, which are full of current sources, **nodal almost always wins**.
          `),
          G('mesh2', { need: 3 }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-dep', title: 'Dependent sources',
        steps: [
          R(md`
            A **dependent** (controlled) source is drawn as a **diamond**. Its value is set by some other voltage or current in the circuit:

            | Type | Output | Law | Where you'll meet it |
            |---|---|---|---|
            | VCVS | voltage | $v = A\,v_x$ | amplifier two-ports |
            | VCCS | current | $i = g_m\,v_x$ | **the MOSFET small-signal model** |
            | CCVS | voltage | $v = r_m\,i_x$ | transresistance two-ports |
            | CCCS | current | $i = \beta\,i_x$ | BJT models (later) |

            !!method Dependent sources in nodal analysis
            1. Treat the source like an ordinary source when writing KCL (a VCCS contributes $\pm g_mv_x$).
            2. **Express its controlling variable in terms of your node voltages.** That's the only extra step. If $v_x$ is the voltage across some resistor, $v_x = v_a - v_b$.
            3. Solve as usual.

            !!trap Never switch them off
            When a later step says "turn off the sources" (superposition, Thévenin resistance), that means **independent** sources only. A dependent source stays in the circuit because it's part of how the circuit behaves, like a resistor.

            ### Worked example
            $V_S = 1\,\text{V}$ drives a divider of two $1\kO$ resistors, so $v_x = 0.5\,\text{V}$. A VCCS $g_mv_x$ with $g_m = 2\,\text{mS}$ pulls current out of an output node that has $R_L = 5\kO$ to ground. KCL at the output: $\dfrac{v_o}{5} + 2(0.5) = 0 \Rightarrow v_o = -5\,\text{V}$. The minus sign means the output is **inverting**, exactly like a common-source amplifier.
          `),
          G('depnodal', { need: 3 }),
        ],
      },
      // -------------------------------------------------------------------
      {
        id: 'u0-check', title: 'Checkpoint: circuit analysis', kind: 'checkpoint',
        steps: [
          R(md`Mixed practice. Every problem is freshly generated, so you can't pattern-match on the picture. Write the equations out on paper before typing.`),
          G('nodal2', { need: 2 }),
          G('supernode', { need: 2 }),
          G('mesh2', { need: 2 }),
          G('depnodal', { need: 2 }),
          G('nodal_setup', { need: 2 }),
        ],
      },
    ],
  });
})();

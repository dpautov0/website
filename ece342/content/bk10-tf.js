/* Chapter 10 — Capacitors, time constants and transfer functions (the book, unit bk10).
   What a capacitor does to a node (i = C dv/dt, the RC step, tau = RC), phasors and impedance, the complex numbers we
   need, the RC low-pass and high-pass derived, the common source with a load capacitor (Lecture 25), poles and zeros.
   Every number was checked independently (scratchpad A7: time-domain simulation, complex nodal analysis, eigenvalues). */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk10', l);
  const K = window.BK7;
  const EB = window.E3Bode;
  const f = U.fmt;
  const ex = Math.exp, ln = Math.log, PI = Math.PI;

  // ================================================================ figures
  // a capacitor: charge on the plates
  const platesFig = (() => {
    const p = new K.Pic();
    p.line(20, 90, 139, 90).line(221, 90, 340, 90);
    p.rect(141, 32, 78, 116, 'shade');
    p.path('M140,30L140,150', 'thick').path('M220,30L220,150', 'thick');
    [42, 66, 90, 114, 138].forEach((y) => { p.circle(153, y, 7, 'carr'); p.plus(153, y, 3.6); p.circle(207, y, 7, 'carr'); p.minus(207, y, 3.6); });
    p.head(84, 90, 0, 8).head(296, 90, 0, 8);
    p.lab(78, 82, 'i', 'b').lab(290, 82, 'i', 'b');
    p.lab(140, 24, '+q', 'b').lab(220, 24, '-q', 'b');
    p.plus(140, 172, 4.5).lab(180, 172, 'v', 'c').minus(220, 172, 4.5);
    return p.svg(380);
  })();
  const rcStep = [['V', [0, 0], [0, 1.4], { n: 'V_0', side: 'l' }], ['w', [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R' }], ['w', [1.5, 0], [2.6, 0]],
    ['C', [2, 0], [2, 1.4], { n: 'C' }], ['w', [0, 1.4], [2, 1.4]], ['gnd', [1, 1.4]], ['term', [2.6, 0], { n: 'v_C(t)' }]];
  const curveFig = Schem.plot({ x: [0, 5], y: [0, 1.15], w: 420, h: 250, xl: 't/\\tau', yl: 'v_C/V_0', xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.5, 1],
    curves: [{ pts: [[0, 1], [5, 1]], cls: 'dash dc' }, { f: (x) => x, to: 1.08, cls: 'dash' }, { f: (x) => 1 - ex(-x) }],
    pts: [{ x: 1, y: 1 - ex(-1), n: '63\\%' }, { x: 2, y: 1 - ex(-2), n: '86\\%' }, { x: 3, y: 1 - ex(-3), n: '' }] });
  const divFig = [['V', [0, 0], [0, 1.4], { n: 'V_0', side: 'l' }], ['w', [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R_1' }], ['w', [1.5, 0], [3.2, 0]],
    ['R', [2, 0], [2, 1.4], { n: 'R_2', side: 'l' }], ['C', [2.7, 0], [2.7, 1.4], { n: 'C' }], ['w', [0, 1.4], [2.7, 1.4]], ['gnd', [1, 1.4]], ['term', [3.2, 0], { n: 'v_C' }],
    ['txt', [4.1, 0.7], '$\\Rightarrow$'],
    ['V', [5.1, 0], [5.1, 1.4], { n: 'v_{Th}', side: 'l' }], ['w', [5.1, 0], [5.4, 0]], ['R', [5.4, 0], [6.6, 0], { n: 'R_1\\parallel R_2' }], ['w', [6.6, 0], [7.7, 0]],
    ['C', [7.2, 0], [7.2, 1.4], { n: 'C' }], ['w', [5.1, 1.4], [7.2, 1.4]], ['gnd', [6.1, 1.4]], ['term', [7.7, 0], { n: 'v_C' }]];
  // a current step into R parallel C (the Norton picture of an amplifier output)
  const nortonStep = [['I', [0, 1.4], [0, 0], { n: 'I', side: 'l' }], ['w', [0, 0], [2.8, 0]], ['R', [1.2, 0], [1.2, 1.4], { n: 'R' }], ['C', [2.2, 0], [2.2, 1.4], { n: 'C' }],
    ['w', [0, 1.4], [2.2, 1.4]], ['gnd', [1.2, 1.4]], ['term', [2.8, 0], { n: 'v(t)' }]];

  // ================================================================ 1. what a capacitor does to a node
  // worked numbers
  const capA = { R: 2e3, C: 5e-12, V0: 2 };
  const capC = { V0: 3, R1: 6e3, R2: 3e3, C: 4.5e-12 };
  const capD = { I: 0.2e-3, R: 25e3, C: 2e-12 };
  const capE = { gm: 2e-3, RD: 20e3, rds: 80e3, CL: 0.25e-12, dv: 0.01 };
  capE.R = U.par(capE.RD, capE.rds);
  L({
    id: 'bk10-cap', title: 'What a capacitor does to a node', ref: 'Background for Lectures 25–29',
    steps: [
      R(md`
        ### Chapter 10 at a glance

        Up to now every capacitor was either an open circuit (at DC) or a short (for signals), and every gain was a single number. Real amplifiers lose gain at high frequency, and Exam 3's frequency problem asks how much and where. This chapter builds the tools from the ground up: what a capacitor physically does to a node, how sine waves turn calculus into algebra (phasors and impedance), the complex-number rules that make it quick, then the first real results: the RC low-pass, the coupling capacitor, and the common source with a load capacitor from Lecture 25. It ends with poles and zeros, the language of Chapter 11's Bode plots.

        **You will be able to:**
        - turn any $R$ and $C$ into a time constant in your head ($\text{k}\Omega\times\text{pF} = \text{ns}$) and sketch the step response;
        - replace a capacitor by its impedance $1/(sC)$ and solve the circuit like a resistive one;
        - find the magnitude and angle of any product or quotient of complex numbers;
        - derive $H(s) = 1/(1 + sRC)$ and its $-3\,\text{dB}$ frequency, and the common source's $A_v(s) = -g_mR_D/(1 + sR_DC_L)$;
        - write any transfer function in the lecture's standard form and read off its poles and zeros.

        **You need first:** KCL, KVL and Thévenin; the common-source gain $-g_mR_D$ ([Chapter 4](#/l/bk04-cs)); the idea $A_v = -G_MR_{out}$ ([Chapter 4](#/l/bk04-norton)). Complex numbers are reviewed here from scratch.
      `),
      R(md`
        ### The question

        Every node in a real circuit has some capacitance to ground: the gate of the next transistor, the wiring, the junctions of the transistor itself, a scope probe. What does that capacitance do to the voltage at the node? The short answer, which this section makes precise: **it makes the node slow**. The node can no longer jump; it moves toward its new value along an exponential, with a time constant $\tau = RC$. Everything in Chapters 10 to 13 grows out of that one fact.
      `),
      RF(md`
        ### The physical picture: a capacitor stores charge

        A capacitor is two conductors (plates) separated by an insulator. Push charge $+q$ onto one plate and the same amount leaves the other plate, which is left with $-q$. The charges hold each other across the gap, and holding them takes a voltage between the plates. Charge and voltage are proportional:
        $$q = Cv$$
        The constant $C$, the **capacitance** in farads, says how much charge the device holds per volt.

        [[fig:plates]]

        Now the key step. To **change** the voltage by $dv$, you must bring charge $dq = C\,dv$ onto the plate. Charge moving per unit time is current, so
        $$i = \frac{dq}{dt} = C\frac{dv}{dt}$$
        This one equation is everything a capacitor does.
      `, { plates: { svg: platesFig, cap: 'Charge $+q$ on one plate, $-q$ on the other: $q = Cv$. Raising $v$ by $dv$ takes charge $C\\,dv$, carried by the current $i$.' } }),
      R(md`
        !!intuition A bucket of charge
          Think of the node as a bucket and its voltage as the water level. The capacitance is the bucket's width: a wide bucket (big $C$) needs a lot of water (charge) to raise its level by one volt. The current is the flow from the hose. A fixed flow raises the level at a fixed rate, $dv/dt = i/C$; a wide bucket rises slowly.

        Two consequences follow straight from $i = C\,dv/dt$:
        - **The voltage across a capacitor cannot jump.** A jump ($dv/dt = \infty$) would need an infinite current. The current, on the other hand, can jump.
        - **When nothing changes, no current flows.** At DC, $dv/dt = 0$, so $i = 0$: the capacitor is an **open circuit**. That is the "capacitors are open at DC" rule of [Chapter 1](#/l/bk01-two), now with its reason.
      `),
      R(md`
        ### A feel for the sizes

        The Art of Electronics habit: know the numbers. Rearranged, $i = C\,dv/dt$ says a current $I$ into a capacitor $C$ ramps its voltage at
        $$\frac{dv}{dt} = \frac{I}{C}$$
        and the version to remember is: **$1\,\text{mA}$ into $1\,\text{pF}$ moves $1\,\text{V}$ per nanosecond** ($10^{-3}/10^{-12} = 10^{9}\,\text{V/s}$).

        | Capacitance | Where you meet it |
        |---|---|
        | $1$ to $100\,\text{fF}$ | the gate of a small on-chip transistor, a short on-chip wire |
        | $0.1$ to $10\,\text{pF}$ | a chip pad, the input of the next stage, $C_\mu$ of a discrete BJT |
        | $10\,\text{pF}$ | a scope probe |
        | $1$ to $100\,\mu\text{F}$ | the coupling and bypass capacitors of Chapter 9 |
      `),
      RF(md`
        ### The model: an RC node

        The simplest circuit that shows the slowness: a voltage source that steps from $0$ to $V_0$ at $t = 0$, a resistor $R$, and a capacitor $C$ to ground. We want $v_C(t)$, the voltage at the node, for $t > 0$. The capacitor starts empty: $v_C(0) = 0$.

        [[fig:rc]]

        Assumptions: ideal parts, and a source that steps instantly. (A real source also has a resistance; it simply adds to $R$.)
      `, { rc: { fig: rcStep, cap: 'The source steps from $0$ to $V_0$ at $t = 0$; the capacitor starts empty.' } }),
      R(md`
        ### The derivation

        **KCL at the node.** For $t > 0$ the source holds $V_0$ at the left end of $R$. The current through $R$, flowing toward the node, is the voltage across $R$ divided by $R$:
        $$i_R = \frac{V_0 - v_C}{R}$$
        Nothing else is connected to the node, so all of that current flows into the capacitor:
        $$\frac{V_0 - v_C}{R} = C\frac{dv_C}{dt}$$

        **Rearrange.** Multiply both sides by $R$ and name the product $\tau = RC$:
        $$\tau\frac{dv_C}{dt} = V_0 - v_C$$

        **Solve.** Let $u = V_0 - v_C$, the distance still to go. Since $V_0$ is constant, $du/dt = -dv_C/dt$, so
        $$\frac{du}{dt} = -\frac{u}{\tau}$$
        A quantity whose rate of change is proportional to itself, with a minus sign, decays exponentially: $u(t) = u(0)\,e^{-t/\tau}$. (Check: differentiating gives $-u(0)e^{-t/\tau}/\tau = -u/\tau$.) At $t = 0$ the capacitor is empty, so $u(0) = V_0$. Back to $v_C = V_0 - u$:

        !!key The RC step response
          $$v_C(t) = V_0\left(1 - e^{-t/\tau}\right),\qquad \tau = RC$$
          The node moves toward its final value along an exponential; $\tau$ is the **time constant**.
      `),
      R(md`
        ### Check it

        - **At $t = 0$:** $v_C = V_0(1 - 1) = 0$. The voltage did not jump. ✓
        - **As $t\to\infty$:** $e^{-t/\tau}\to0$, so $v_C\to V_0$. Then there is no voltage across $R$ and no current: the capacitor has become an open circuit. ✓
        - **Units:** $RC$ is $\Omega\times\text{F} = \frac{\text{V}}{\text{A}}\cdot\frac{\text{A}\cdot\text{s}}{\text{V}} = \text{s}$, a time. ✓
        - **Limits:** $R\to0$ or $C\to0$ gives $\tau\to0$: the node follows the source instantly, as in every circuit without capacitors. ✓
      `),
      RF(md`
        ### What it means

        [[fig:curve]]

        **The start.** At $t = 0$ the whole $V_0$ is across $R$, so the current is $V_0/R$ and the slope is $dv_C/dt = (V_0/R)/C = V_0/\tau$. If the node kept that first rate, it would arrive in **exactly one time constant**: the dashed tangent line.

        **The approach.** It does not keep that rate. As $v_C$ rises, the voltage across $R$ shrinks, so the current shrinks and the charging slows down. Each $\tau$ covers the same **fraction**, $63\%$, of the distance still left:

        | $t$ | $\tau$ | $2\tau$ | $3\tau$ | $4\tau$ | $5\tau$ |
        |---|---|---|---|---|---|
        | $v_C/V_0$ | $63\%$ | $86\%$ | $95\%$ | $98\%$ | $99.3\%$ |

        Read backwards, $1 - e^{-t/\tau} = x$ gives $t = \tau\ln\frac{1}{1 - x}$: half-way at $0.69\tau$, $90\%$ at $2.3\tau$, $99\%$ at $4.6\tau$. The $10\%$-to-$90\%$ **rise time** is $(2.30 - 0.11)\tau = 2.2\tau$.
      `, { curve: { svg: curveFig, cap: 'The RC step response. Dashed: the starting tangent, which would arrive in one $\\tau$.' } }),
      RF(md`
        ### Which $R$? The resistance the capacitor sees

        Real nodes have more than one resistor. The rule that covers every case: **$\tau = RC$, where $R$ is the resistance the capacitor sees**: zero the independent sources (a voltage source becomes a short, a current source an open) and look into the capacitor's two terminals.

        Why it works: replace everything connected to the capacitor by its Thévenin equivalent. Whatever the circuit, the capacitor then sees a source $v_{Th}$ behind a resistance $R_{Th}$: exactly the circuit we just solved, with $V_0\to v_{Th}$ and $R\to R_{Th}$. Zeroing the sources is how you find $R_{Th}$.

        [[fig:div]]

        **Example: a divider.** A step $V_0$ through $R_1$, with $R_2$ and $C$ from the node to ground. Thévenin: $v_{Th} = V_0R_2/(R_1 + R_2)$; with the source shorted, $R_1$ and $R_2$ both run from the node to ground, so $R_{Th} = R_1\parallel R_2$:
        $$v_C(t) = \frac{R_2}{R_1 + R_2}\,V_0\left(1 - e^{-t/\tau}\right),\qquad \tau = (R_1\parallel R_2)\,C$$
        Notice that $R_1\parallel R_2$ is smaller than either resistor: adding a resistor to ground makes the node **faster** (and its final value smaller).

        **A current source drives the node.** A current $I$ that switches on into $R\parallel C$ is the Norton version of the same circuit. Zeroing the current source leaves an open, so $\tau = RC$; the final value is $IR$; and at $t = 0^+$ all of $I$ charges $C$, so $dv/dt = I/C$. This is how an amplifier's output node behaves: the transistor is the current source.

        [[fig:norton]]
      `, { div: { fig: divFig, cap: 'Zero the source: $R_1$ and $R_2$ both go from the node to ground, so the capacitor sees $R_1\\parallel R_2$.' }, norton: { fig: nortonStep, cap: 'A current step into $R\\parallel C$: $v(t) = IR\\,(1 - e^{-t/RC})$.' } }),
      R(md`
        ### How to recognize it: $\text{k}\Omega\times\text{pF} = \text{ns}$

        Any node with a capacitance $C$ to (incremental) ground has a time constant $RC$, with $R$ the resistance from that node to ground when the sources are zeroed. Chapter 12 applies exactly this to every node of an amplifier.

        Do the units once and for all ($10^3\times10^{-12} = 10^{-9}$):

        | $R$ | $C$ | $\tau = RC$ |
        |---|---|---|
        | $1\,\text{k}\Omega$ | $1\,\text{pF}$ | $1\,\text{ns}$ |
        | $10\,\text{k}\Omega$ | $1\,\text{pF}$ | $10\,\text{ns}$ |
        | $100\,\text{k}\Omega$ | $10\,\text{fF}$ | $1\,\text{ns}$ |
        | $1\,\text{M}\Omega$ | $1\,\text{pF}$ | $1\,\mu\text{s}$ |
        | $1\,\text{k}\Omega$ | $1\,\text{nF}$ | $1\,\mu\text{s}$ |
        | $1\,\text{k}\Omega$ | $1\,\mu\text{F}$ | $1\,\text{ms}$ |
        | $50\,\Omega$ | $10\,\text{pF}$ | $0.5\,\text{ns}$ |
      `),
      R(md`
        ### Worked example: an amplifier output that has to move

        A common-source stage has $R_D = 10\,\text{k}\Omega$ and $r_{ds} = 40\,\text{k}\Omega$ at its output, which drives $C_L = 0.5\,\text{pF}$. The input steps, and the transistor's current jumps by $\Delta I = 50\,\mu\text{A}$. How far does the output move, and how long does it take to get $90\%$ of the way?

        1. **The picture.** For the signal, the output node is a current $\Delta I$ pulled through the transistor, with $R = R_D\parallel r_{ds}$ and $C_L$ from the node to (incremental) ground: the Norton circuit above.
        2. **Final move.** Once $C_L$ stops charging, all of $\Delta I$ flows in $R = 10\parallel40 = 8\,\text{k}\Omega$: $|\Delta v| = \Delta I\cdot R = 50\,\mu\text{A}\times8\,\text{k}\Omega = 0.4\,\text{V}$. (Downward: more current is pulled through $R_D$.)
        3. **Time constant.** Zero the current source (an open): $C_L$ sees $R = 8\,\text{k}\Omega$, so $\tau = 8\,\text{k}\Omega\times0.5\,\text{pF} = 4\,\text{ns}$.
        4. **90% of the way:** $t = 2.3\tau = 9.2\,\text{ns}$.
        5. **Check with the first instant:** $dv/dt = \Delta I/C_L = 50\,\mu\text{A}/0.5\,\text{pF} = 0.1\,\text{V/ns}$, and $0.1\,\text{V/ns}\times4\,\text{ns} = 0.4\,\text{V}$: the tangent arrives in one $\tau$. ✓
      `),
      R(md`
        !!mistake Common mistakes
          - **Using one resistor when the capacitor sees two.** Zero the sources first; resistors that each reach ground from the node are in parallel.
          - **Unit slips.** $\text{k}\Omega\times\text{pF}$ is nanoseconds, not microseconds. Write the powers of ten.
          - **63% versus 37%.** After one $\tau$ the node has covered $63\%$ of the way; $37\%$ is what is **left**.
          - **Treating $\tau$ as the time to finish.** At $\tau$ you are at $63\%$; "done" (within 1%) takes about $5\tau$.
          - **Letting the capacitor voltage jump.** Right after a step, $v_C$ keeps its old value; only the current jumps.
      `),
      Q(md`A constant current of $0.5\,\text{mA}$ charges a $2\,\text{pF}$ capacitor. How fast does its voltage rise?`,
        ['$0.25\\,\\text{V/ns}$', '$4\\,\\text{V/ns}$', '$1\\,\\text{V/ns}$', '$0.25\\,\\text{V}/\\mu\\text{s}$'], 0,
        [null, 'That is $C/I$ upside down. The rate is $dv/dt = I/C$.', '$1\\,\\text{V/ns}$ is $1\\,\\text{mA}$ into $1\\,\\text{pF}$. Here half the current fills twice the capacitance: a quarter of the rate.', 'Check the powers of ten: $0.5\\times10^{-3}/(2\\times10^{-12}) = 2.5\\times10^{8}\\,\\text{V/s}$, which is $0.25\\,\\text{V}$ per **nanosecond**.'],
        md`$$\frac{dv}{dt} = \frac{I}{C} = \frac{0.5\times10^{-3}}{2\times10^{-12}} = 2.5\times10^{8}\,\text{V/s} = 0.25\,\text{V/ns}$$`),
      Q(md`A source steps from $0$ to $V_0$ and charges an empty capacitor through $R$. Right after the step, the current in $R$ is...`,
        ['$V_0/R$, its largest value', '$0$, because the capacitor voltage cannot jump', '$V_0/(2R)$', 'infinite for an instant'], 0,
        [null, 'It is the capacitor **voltage** that cannot jump. With $v_C = 0$ the whole $V_0$ sits across $R$, so the current jumps straight to $V_0/R$.', '$V_0/(2R)$ flows when $v_C$ has reached $V_0/2$, at $t = 0.69\\tau$.', '$R$ limits it. An infinite current would need $R = 0$.'],
        md`$v_C(0^+) = v_C(0^-) = 0$, so the voltage across $R$ is $V_0$ and $i = V_0/R$. From there the current decays as $e^{-t/\tau}$ while $v_C$ rises.`),
      Q(md`A node has $20\,\text{k}\Omega$ to $V_{DD}$, $20\,\text{k}\Omega$ to ground and $1\,\text{pF}$ to ground. What is its time constant?`,
        ['$10\\,\\text{ns}$', '$20\\,\\text{ns}$', '$40\\,\\text{ns}$', '$10\\,\\mu\\text{s}$'], 0,
        [null, 'A supply is a DC source: zeroed, it is ground. Both resistors go from the node to ground, in parallel: $10\\,\\text{k}\\Omega$.', 'They are not in series: each one runs from the node to a (zeroed) source.', '$\\text{k}\\Omega\\times\\text{pF} = \\text{ns}$, not $\\mu\\text{s}$.'],
        md`Zero the supply: both $20\,\text{k}\Omega$ resistors run from the node to ground, so $R = 20\parallel20 = 10\,\text{k}\Omega$ and $\tau = 10\,\text{k}\Omega\times1\,\text{pF} = 10\,\text{ns}$.`),
      Q(md`After how many time constants is an RC node within $5\%$ of its final value?`,
        ['About $3\\tau$', '$\\tau$', 'About $5\\tau$', '$0.05\\tau$'], 0,
        [null, 'After one $\\tau$ it is only $63\\%$ of the way: $37\\%$ is still missing.', '$5\\tau$ gets within $0.7\\%$; $5\\%$ comes sooner.', 'The fraction left is $e^{-t/\\tau}$; $e^{-0.05}$ is still $95\\%$ left.'],
        md`The fraction still missing is $e^{-t/\tau}$. Set $e^{-t/\tau} = 0.05$: $t = \tau\ln20 = 3.0\tau$.`),
      P({
        id: 'bk10-cap-a', title: 'One time constant, three time constants',
        q: md`In the RC step circuit, $R = 2\,\text{k}\Omega$, $C = 5\,\text{pF}$ and $V_0 = 2\,\text{V}$. Find $\tau$, then $v_C$ at $t = 10\,\text{ns}$ and at $t = 30\,\text{ns}$.`,
        fig: rcStep,
        parts: [
          K.tPart('\\tau', capA.R * capA.C, { traps: [{ v: capA.R * capA.C * 1e3, msg: 'Units: $\\text{k}\\Omega\\times\\text{pF} = 10^{3}\\times10^{-12}\\,\\text{s} = 1\\,\\text{ns}$.' }] }),
          K.plain('v_C(10\\,\\text{ns})', capA.V0 * (1 - ex(-1)), 'V', { traps: [{ v: capA.V0 * ex(-1), msg: 'That is the part still **missing** ($37\\%$). The node has covered $1 - e^{-1} = 63\\%$.' }] }),
          K.plain('v_C(30\\,\\text{ns})', capA.V0 * (1 - ex(-3)), 'V'),
        ],
        hints: [md`$\tau = RC$; $\text{k}\Omega\times\text{pF} = \text{ns}$.`, md`$v_C = V_0(1 - e^{-t/\tau})$ with $t/\tau = 1$ and $3$.`],
        sol: md`$$\tau = RC = 2\,\text{k}\Omega\times5\,\text{pF} = 10\,\text{ns}$$
$$v_C(10\,\text{ns}) = 2\,\text{V}\,(1 - e^{-1}) = 2\times0.632 = 1.264\,\text{V}$$
$$v_C(30\,\text{ns}) = 2\,\text{V}\,(1 - e^{-3}) = 2\times0.950 = 1.900\,\text{V}$$
One $\tau$: $63\%$ of the way. Three: $95\%$.`,
      }),
      P({
        id: 'bk10-cap-b', title: 'A generator driving a cable',
        q: md`A $50\,\Omega$ signal generator drives a cable and a scope probe that together load it with $20\,\text{pF}$. The generator makes a fast step. Find the time constant, the $10\%$-to-$90\%$ rise time you will see, and the time to settle within $1\%$ of the final value.`,
        parts: [
          K.tPart('\\tau', 50 * 20e-12),
          K.tPart('t_r\\ (10\\%\\to90\\%)', 50 * 20e-12 * ln(9), { traps: [{ v: 50 * 20e-12 * ln(10), msg: 'That is the time from $0$ to $90\\%$. The rise time starts at $10\\%$ ($0.105\\tau$): $t_r = \\tau(\\ln10 - \\ln\\frac{10}{9}) = \\tau\\ln9$.' }] }),
          K.tPart('t_{1\\%}', 50 * 20e-12 * ln(100), { traps: [{ v: 50 * 20e-12 * 5, msg: '$5\\tau$ is within $0.7\\%$. For exactly $1\\%$: $e^{-t/\\tau} = 0.01$, $t = \\tau\\ln100 = 4.6\\tau$.' }] }),
        ],
        hints: [md`$\tau = 50\,\Omega\times20\,\text{pF}$. Then use $t = \tau\ln\frac{1}{1 - x}$ for the fraction $x$ reached.`, md`$10\%$ is reached at $\tau\ln\frac{1}{0.9} = 0.105\tau$ and $90\%$ at $\tau\ln10 = 2.303\tau$.`],
        sol: md`$$\tau = 50\,\Omega\times20\,\text{pF} = 1000\times10^{-12}\,\text{s} = 1\,\text{ns}$$
**Rise time.** $10\%$ at $t_1 = \tau\ln\frac{1}{0.9} = 0.105\,\text{ns}$; $90\%$ at $t_2 = \tau\ln10 = 2.303\,\text{ns}$:
$$t_r = t_2 - t_1 = \tau\ln9 = 2.197\,\text{ns}\approx2.2\tau$$
**Settling to 1%.** The part still missing is $e^{-t/\tau} = 0.01$: $t = \tau\ln100 = 4.605\,\text{ns}$.`,
      }),
      P({
        id: 'bk10-cap-c', title: 'A node fed through a divider',
        q: md`In the divider circuit, $V_0 = 3\,\text{V}$ (a step at $t = 0$), $R_1 = 6\,\text{k}\Omega$, $R_2 = 3\,\text{k}\Omega$, $C = 4.5\,\text{pF}$, and the capacitor starts empty. Find $v_C(\infty)$, $\tau$, and $v_C$ at $t = 9\,\text{ns}$.`,
        fig: divFig.slice(0, 9),
        parts: [
          K.plain('v_C(\\infty)', capC.V0 * capC.R2 / (capC.R1 + capC.R2), 'V', { traps: [{ v: capC.V0, msg: 'At $t\\to\\infty$ the capacitor is open, but $R_2$ still divides: $V_0R_2/(R_1 + R_2)$.' }] }),
          K.tPart('\\tau', U.par(capC.R1, capC.R2) * capC.C, { traps: [{ v: capC.R1 * capC.C, msg: 'The capacitor sees $R_2$ too: zero the source and $R_1$, $R_2$ are in parallel.' }, { v: (capC.R1 + capC.R2) * capC.C, msg: 'Zero the source (a short): $R_1$ then goes to ground, in **parallel** with $R_2$.' }, { v: capC.R2 * capC.C, msg: 'With the source zeroed, $R_1$ also connects the node to ground: $R_1\\parallel R_2$.' }] }),
          K.plain('v_C(9\\,\\text{ns})', 1 - ex(-1), 'V', { traps: [{ v: capC.V0 * (1 - ex(-1)), msg: 'The exponential heads for the **final** value, $1\\,\\text{V}$, not for $V_0$.' }] }),
        ],
        hints: [md`Final value: capacitor open, the divider. Time constant: zero the source, then $R = R_1\parallel R_2$.`],
        sol: md`**Final value** (capacitor open): $v_C(\infty) = 3\,\text{V}\times\dfrac{3}{6 + 3} = 1\,\text{V}$.

**Time constant.** Zero $V_0$: $R_1$ and $R_2$ both run from the node to ground. $R = 6\parallel3 = 2\,\text{k}\Omega$, so $\tau = 2\,\text{k}\Omega\times4.5\,\text{pF} = 9\,\text{ns}$.

**At $9\,\text{ns} = \tau$:** $v_C = 1\,\text{V}\times(1 - e^{-1}) = 0.632\,\text{V}$.`,
      }),
      P({
        id: 'bk10-cap-d', title: 'A current source fills a node',
        q: md`At $t = 0$ a current source starts pushing $I = 0.2\,\text{mA}$ into a node with $R = 25\,\text{k}\Omega$ and $C = 2\,\text{pF}$ to ground (the node starts at $0\,\text{V}$). Find the final voltage, $\tau$, the initial slope $dv/dt$ in V/ns, and the time at which $v = 2.5\,\text{V}$.`,
        fig: nortonStep,
        parts: [
          K.plain('v(\\infty)', capD.I * capD.R, 'V'),
          K.tPart('\\tau', capD.R * capD.C),
          K.plain('dv/dt\\,(0^+)', capD.I / capD.C * 1e-9, 'V/ns'),
          K.tPart('t\\ (v = 2.5\\,\\text{V})', capD.R * capD.C * ln(2), { traps: [{ v: capD.R * capD.C / 2, msg: 'The rise is not a straight line: halfway is reached at $\\tau\\ln2 = 0.69\\tau$, not $0.5\\tau$.' }, { v: 2.5 / (capD.I / capD.C), msg: 'That assumes the first slope continues. The current into $C$ shrinks as $v$ rises: use $v = v(\\infty)(1 - e^{-t/\\tau})$.' }] }),
        ],
        hints: [md`Final: all of $I$ in $R$. $\tau$: a zeroed current source is open, so $C$ sees $R$. Start: $v = 0$, so all of $I$ goes into $C$.`, md`$2.5\,\text{V}$ is half of the final value: $1 - e^{-t/\tau} = 0.5$.`],
        sol: md`**Final:** $v(\infty) = IR = 0.2\,\text{mA}\times25\,\text{k}\Omega = 5\,\text{V}$.

**Time constant:** $\tau = RC = 25\,\text{k}\Omega\times2\,\text{pF} = 50\,\text{ns}$.

**Start:** $dv/dt = I/C = 0.2\,\text{mA}/2\,\text{pF} = 10^{8}\,\text{V/s} = 0.1\,\text{V/ns}$. (Check: $0.1\,\text{V/ns}\times50\,\text{ns} = 5\,\text{V}$, the final value: the tangent arrives in one $\tau$.)

**Half-way:** $1 - e^{-t/\tau} = 0.5\Rightarrow t = \tau\ln2 = 34.7\,\text{ns}$.`,
      }),
      P({
        id: 'bk10-cap-e', title: 'Exam style: how fast does the output settle?',
        q: md`A common-source stage has $g_m = 2\,\text{mS}$, $R_D = 20\,\text{k}\Omega$, $r_{ds} = 80\,\text{k}\Omega$ and a load $C_L = 0.25\,\text{pF}$ (ignore the transistor's own capacitances). The input steps up by $10\,\text{mV}$. Find the final change of $v_{out}$ (with its sign), the time constant of the output node, and the time for the output to get within $5\%$ of its final change.`,
        fig: K.ampCL(false),
        parts: [
          K.plain('\\Delta v_{out}(\\infty)', -capE.gm * capE.R * capE.dv, 'V', { traps: [{ v: -capE.gm * capE.RD * capE.dv, msg: 'Include $r_{ds}$: the output resistance is $R_D\\parallel r_{ds} = 16\\,\\text{k}\\Omega$.' }] }),
          K.tPart('\\tau', capE.R * capE.CL, { traps: [{ v: capE.RD * capE.CL, msg: '$C_L$ sees $R_D\\parallel r_{ds}$, not $R_D$ alone.' }] }),
          K.tPart('t_{95\\%}', capE.R * capE.CL * ln(20), { traps: [{ v: capE.R * capE.CL, msg: 'One $\\tau$ is only $63\\%$. Within $5\\%$ needs $e^{-t/\\tau} = 0.05$.' }] }),
        ],
        hints: [md`Long after the step $C_L$ is open: the change is the low-frequency gain times the step, $-g_m(R_D\parallel r_{ds})\,\Delta v_{in}$.`, md`The output node is a current source $g_m\Delta v_{in}$ into $(R_D\parallel r_{ds})$ and $C_L$: $\tau = (R_D\parallel r_{ds})C_L$.`],
        sol: md`**Final change.** With $C_L$ open this is the familiar gain: $R = R_D\parallel r_{ds} = 20\parallel80 = 16\,\text{k}\Omega$, so
$$\Delta v_{out}(\infty) = -g_mR\,\Delta v_{in} = -2\,\text{mS}\times16\,\text{k}\Omega\times10\,\text{mV} = -0.32\,\text{V}$$
**Time constant.** The transistor is a current source $g_m\Delta v_{in}$ (zeroed: an open), so $C_L$ sees $R$: $\tau = 16\,\text{k}\Omega\times0.25\,\text{pF} = 4\,\text{ns}$.

**Within 5%:** $e^{-t/\tau} = 0.05\Rightarrow t = \tau\ln20 = 3.0\tau = 11.98\,\text{ns}$.`,
      }),
      P({
        id: 'bk10-cap-f', title: 'Design: the largest load that settles in time',
        q: md`An output node has $R = 5\,\text{k}\Omega$ to (incremental) ground. It must settle to within $1\%$ of its final value within $10\,\text{ns}$ of a step. What is the largest load capacitance it can drive?`,
        parts: [K.part('C_{max}', 10e-9 / (ln(100) * 5e3), [[1e-12, 'pF']], { traps: [{ v: 10e-9 / 5e3, msg: 'That makes $\\tau = 10\\,\\text{ns}$, but one $\\tau$ only reaches $63\\%$. Within $1\\%$ takes $4.6\\tau$.' }, { v: 10e-9 / (5 * 5e3), msg: '$5\\tau$ is within $0.7\\%$; the exact $1\\%$ time is $\\tau\\ln100 = 4.6\\tau$.' }] })],
        hints: [md`Within $1\%$ means $e^{-t/\tau}\le0.01$: $t\ge\tau\ln100 = 4.6\tau$.`],
        sol: md`Settling to $1\%$ takes $t = \tau\ln100 = 4.605\tau$. For $t\le10\,\text{ns}$:
$$\tau\le\frac{10\,\text{ns}}{4.605} = 2.17\,\text{ns},\qquad C\le\frac{2.17\,\text{ns}}{5\,\text{k}\Omega} = 0.434\,\text{pF}$$`,
      }),
      G('bk_tau', { need: 4 }),
    ],
  });

  // ================================================================ 2. sinusoids, phasors and impedance
  const waveFig = Schem.plot({ x: [0, 720], y: [-1.35, 1.35], w: 440, h: 230, xl: '\\omega t\\ (\\text{degrees})', yl: 'v,\\ i', xt: [0, 180, 360, 540, 720], yt: [-1, 0, 1],
    curves: [{ f: (x) => Math.cos(x * PI / 180) }, { f: (x) => -Math.sin(x * PI / 180), cls: 'dash dc' }],
    pts: [{ x: 270, y: 1, n: 'i\\text{ peaks}' }, { x: 360, y: 1, n: 'v\\text{ peaks}' }] });
  const phasorFig = (() => {
    const p = new K.Pic(), ac = 'stroke:var(--accent);stroke-width:2.2';
    p.arrow(30, 170, 262, 170, 'dim').arrow(60, 205, 60, 22, 'dim');
    p.lab(268, 170, '\\text{Re}', 'l').lab(60, 16, '\\text{Im}', 'b');
    p.arrow(60, 170, 210, 170, '', ac, 9).arrow(60, 170, 60, 62, '', ac, 9);
    p.path('M92,170Q92,138 60,138', 'dash');
    p.lab(210, 178, '\\mathbf{V}', 't').lab(68, 62, '\\mathbf{I} = j\\omega C\\,\\mathbf{V}', 'l').lab(96, 140, '90^\\circ', 'bl');
    return p.svg(320);
  })();
  const sineC = [['Vac', [0, 0], [0, 1.4], { n: 'v(t)', side: 'l' }], ['w', [0, 0], [1.6, 0], [1.6, 0.1]], ['C', [1.6, 0.1], [1.6, 1.4], { n: 'C' }], ['w', [0, 1.4], [1.6, 1.4]], ['iarr', [0.8, 0], 'r', { n: 'i(t)' }]];
  L({
    id: 'bk10-phasor', title: 'Sinusoids, phasors and impedance', ref: 'Lecture 25',
    steps: [
      R(md`
        ### The question

        Lecture 25 measures an amplifier the way a lab does: apply $v_{in} = A_{in}\sin\omega t$, measure the output, and repeat at many frequencies. Two facts make this the right experiment, and this section derives both. In a linear circuit, a sine wave comes out as **a sine wave of the same frequency**, only bigger or smaller and shifted in time. And for sine waves a capacitor behaves like a "resistor" whose value depends on frequency: its **impedance** $1/(j\omega C)$. With that, every circuit with capacitors is solved with Ohm's law and KCL, without calculus.
      `),
      RF(md`
        ### The physical picture: drive a capacitor with a sine

        [[fig:c]]

        Put $v(t) = V_m\cos\omega t$ across a capacitor. The current is
        $$i = C\frac{dv}{dt} = -\omega CV_m\sin\omega t = \omega CV_m\cos(\omega t + 90^\circ)$$
        (using $-\sin x = \cos(x + 90^\circ)$). Three things to see:

        - **Same frequency.** The current is a sinusoid at the same $\omega$. Differentiating a sine never changes its frequency.
        - **Amplitude $\omega CV_m$.** The current grows with frequency: a faster wiggle must move the same charge $CV_m$ back and forth more times per second. The ratio of the amplitudes, $V_m/I_m = 1/(\omega C)$, acts like a resistance that **falls** as the frequency rises.
        - **A quarter-cycle shift.** The current is largest when the voltage changes fastest, at its zero crossings, a quarter cycle *before* the voltage peaks. The current **leads** the voltage by $90^\circ$.

        [[fig:w]]
      `, { c: { fig: sineC, cap: 'A sine across a capacitor.' }, w: { svg: waveFig, cap: 'Solid: $v = \\cos\\omega t$. Dashed: $i\\propto\\cos(\\omega t + 90^\\circ)$, which peaks a quarter cycle earlier.' } }),
      RF(md`
        ### The model: phasors

        Carrying $\cos(\omega t + \phi)$ through every equation is slow. The trick is Euler's formula,
        $$e^{j\theta} = \cos\theta + j\sin\theta$$
        which makes a cosine the real part of a rotating complex number:
        $$V_m\cos(\omega t + \phi) = \text{Re}\left\{V_me^{j\phi}\,e^{j\omega t}\right\}$$
        Every voltage and current in the circuit rotates with the same $e^{j\omega t}$. What distinguishes them is the complex number in front, $\mathbf{V} = V_me^{j\phi}$, the **phasor**: its length is the amplitude and its angle is the phase.

        Why this helps: differentiating $e^{j\omega t}$ only multiplies it by $j\omega$,
        $$\frac{d}{dt}e^{j\omega t} = j\omega\,e^{j\omega t}$$
        so for phasors **$d/dt$ becomes multiplication by $j\omega$**, and differential equations become algebra.

        [[fig:ph]]

        The assumptions behind it: the circuit is linear (every small-signal circuit is), and we look at the steady state, long after the sine was switched on.
      `, { ph: { svg: phasorFig, cap: 'Phasors of a capacitor: $\\mathbf{I} = j\\omega C\\,\\mathbf{V}$ points $90^\\circ$ ahead of $\\mathbf{V}$. Both rotate at $\\omega$; the real signals are their shadows on the real axis.' } }),
      R(md`
        ### The derivation: the impedance of a capacitor

        Write $v = \text{Re}\{\mathbf{V}e^{j\omega t}\}$ and put it into $i = C\,dv/dt$:
        $$i = C\frac{d}{dt}\text{Re}\{\mathbf{V}e^{j\omega t}\} = \text{Re}\{j\omega C\,\mathbf{V}\,e^{j\omega t}\}$$
        (The derivative of the real part is the real part of the derivative: $C$ and $d/dt$ are real operations.) So the current's phasor is $\mathbf{I} = j\omega C\,\mathbf{V}$, and the ratio $\mathbf{V}/\mathbf{I}$ is the capacitor's **impedance**.

        !!key Impedance
          $$Z_C = \frac{\mathbf{V}}{\mathbf{I}} = \frac{1}{j\omega C} = \frac{1}{sC},\qquad Z_R = R,\qquad s = j\omega$$
          Impedances combine exactly like resistors: in series they add, in parallel $Z_1Z_2/(Z_1 + Z_2)$; dividers, KCL, KVL and Thévenin all work unchanged.

        **Why KCL still holds.** KCL holds at every instant: $\sum_k i_k(t) = 0$. Each current is $\text{Re}\{\mathbf{I}_ke^{j\omega t}\}$, so $\text{Re}\{(\sum_k\mathbf{I}_k)e^{j\omega t}\} = 0$ for all $t$, which forces $\sum_k\mathbf{I}_k = 0$. The same argument gives KVL.

        **Why $s$?** Writing $s$ for $j\omega$ shortens the algebra ($1/(sC)$ instead of $1/(j\omega C)$), and the same expression, the transfer function $H(s)$, also describes the step response (that is the Laplace transform, which we will not need). Whenever we want the response to a sine, we put $s = j\omega$ back in. From here on we write $v_{out}$, $v_{in}$ for the phasors too, as the lecture does ($v_{out}(s)$).
      `),
      R(md`
        ### Check it

        - **DC** ($\omega\to0$): $|Z_C| = 1/(\omega C)\to\infty$, an **open circuit**, as in [the last section](#/l/bk10-cap). ✓
        - **High frequency** ($\omega\to\infty$): $|Z_C|\to0$, a **short**. That is the rule "big capacitors are shorts for signal": it holds once $1/(\omega C)$ is small next to the resistances around it. ✓
        - **Units:** $\omega C$ is $\text{s}^{-1}\cdot\text{F} = \text{A/V}$, so $1/(\omega C)$ is in ohms. ✓
        - **The phase:** $1/j = -j$, so $Z_C = -j/(\omega C)$ has angle $-90^\circ$: the voltage lags the current by $90^\circ$, which is the picture above. ✓
      `),
      R(md`
        ### What it means

        $|Z_C| = 1/(\omega C)$ is a resistance that slides with frequency. One picofarad is $159\,\text{k}\Omega$ at $1\,\text{MHz}$, $1.59\,\text{k}\Omega$ at $100\,\text{MHz}$, and $159\,\Omega$ at $1\,\text{GHz}$. In a circuit it is invisible at low frequency (an open next to finite resistors) and takes over at high frequency (a short). In between, its impedance equals the resistance around it, $1/(\omega C) = R$, at
        $$\omega = \frac{1}{RC}$$
        That crossover is the most important frequency of every RC circuit, and it is $1/\tau$: the time constant of the last section, turned upside down.

        ### How to recognize it

        - A capacitor from a node to ground **shunts** the node: $R\parallel\frac{1}{sC} = \frac{R}{1 + sRC}$. Low frequency: $R$ wins. High frequency: the capacitor wins.
        - A capacitor in series with the signal **blocks** at low frequency and passes at high frequency.
        - In parallel the smaller impedance wins; in series the bigger one ([who wins](#/l/bk01-sizes)). Compare $R$ with $1/(\omega C)$ to know which regime you are in.
      `),
      R(md`
        ### Worked example: a resistor and a capacitor in parallel

        $R = 1\,\text{k}\Omega$ in parallel with $C = 2\,\text{pF}$, at $f = 100\,\text{MHz}$.

        1. $\omega = 2\pi f = 2\pi\times10^8 = 6.28\times10^8\,\text{rad/s}$.
        2. $|Z_C| = 1/(\omega C) = 1/(6.28\times10^8\times2\times10^{-12}) = 796\,\Omega$. Comparable to $R$: neither wins.
        3. Multiply the top and bottom of the parallel formula by $j\omega C$: $Z = \dfrac{R\cdot\frac{1}{j\omega C}}{R + \frac{1}{j\omega C}} = \dfrac{R}{1 + j\omega RC}$, with $\omega RC = 1.257$.
        4. $|Z| = \dfrac{1000\,\Omega}{\sqrt{1 + 1.257^2}} = \dfrac{1000\,\Omega}{1.606} = 623\,\Omega$, and $\angle Z = -\tan^{-1}1.257 = -51.5^\circ$.

        Notice that $|Z|$ is **not** $1000\parallel796 = 443\,\Omega$: impedances combine as complex numbers, and the $90^\circ$ between them matters. The next section makes this arithmetic quick.
      `),
      R(md`
        !!mistake Common mistakes
          - **$f$ versus $\omega$.** $Z_C = 1/(j\omega C)$ with $\omega = 2\pi f$. Using $f$ makes the impedance $2\pi$ times too big.
          - **Upside down.** $Z_C$ is $1/(j\omega C)$, not $j\omega C$ (that is its admittance). Sanity check: at DC it must be infinite.
          - **Combining sizes instead of complex numbers.** $|R + Z_C|\ne R + |Z_C|$, and $|R\parallel Z_C|\ne R\parallel|Z_C|$.
          - **Forgetting $s = j\omega$ at the end.** $H(s)$ is the formula; the response to a sine is $H(j\omega)$.
      `),
      Q(md`At what angular frequency does a $1\,\text{pF}$ capacitor have $|Z_C| = 1\,\text{k}\Omega$?`,
        ['$10^{9}\\,\\text{rad/s}$', '$10^{-9}\\,\\text{rad/s}$', '$1.59\\times10^{8}\\,\\text{rad/s}$', '$10^{6}\\,\\text{rad/s}$'], 0,
        [null, 'Upside down: $\\omega = 1/(RC) = 1/(1\\,\\text{ns})$, a large number.', '$1.59\\times10^{8}$ is the same frequency in **hertz** ($f = \\omega/2\\pi$), not in rad/s.', '$\\text{k}\\Omega\\times\\text{pF} = 1\\,\\text{ns}$, and $1/\\text{ns} = 10^{9}\\,\\text{s}^{-1}$.'],
        md`$1/(\omega C) = R\Rightarrow\omega = 1/(RC) = 1/(10^3\times10^{-12}) = 10^9\,\text{rad/s}$ (that is $f = 159\,\text{MHz}$).`),
      Q(md`A sine of fixed amplitude drives a capacitor. You double its frequency. The current amplitude...`,
        ['doubles', 'halves', 'stays the same', 'quadruples'], 0,
        [null, 'The impedance halves, so the current doubles: $I_m = \\omega CV_m$.', 'The amplitude of $C\\,dv/dt$ grows with how fast $v$ changes.', 'One derivative gives one factor of $\\omega$, not $\\omega^2$.'],
        md`$I_m = \omega CV_m$: proportional to $\omega$. Equivalently $|Z_C| = 1/(\omega C)$ halves.`),
      Q(md`Compared with the sine voltage across it, the current through a capacitor...`,
        ['leads by $90^\\circ$', 'lags by $90^\\circ$', 'is in phase', 'leads by $180^\\circ$'], 0,
        [null, 'That is an inductor. For a capacitor $\\mathbf{I} = j\\omega C\\mathbf{V}$, and $j$ is $+90^\\circ$.', 'In phase is a resistor.', '$180^\\circ$ would be a negative resistance.'],
        md`$\mathbf{I} = j\omega C\,\mathbf{V}$, and multiplying by $j$ rotates by $+90^\circ$: the current peaks a quarter cycle before the voltage.`),
      P({
        id: 'bk10-ph-a', title: 'The impedance of a capacitor',
        q: md`What is $|Z_C|$ for a $10\,\text{pF}$ capacitor at $f = 1\,\text{MHz}$?`,
        parts: [K.rPart('|Z_C|', 1 / (2 * PI * 1e6 * 10e-12), { traps: [{ v: 1 / (1e6 * 10e-12), msg: 'Use $\\omega = 2\\pi f$: $|Z_C| = 1/(2\\pi fC)$.' }, { v: 2 * PI * 1e6 * 10e-12, msg: 'Upside down: the impedance is $1/(\\omega C)$.' }] })],
        hints: [md`$|Z_C| = 1/(2\pi fC)$.`],
        sol: md`$$|Z_C| = \frac{1}{2\pi fC} = \frac{1}{2\pi\times10^6\times10^{-11}} = \frac{1}{6.28\times10^{-5}} = 15.9\,\text{k}\Omega$$`,
      }),
      P({
        id: 'bk10-ph-b', title: 'Where a capacitor equals a resistor',
        q: md`At what $\omega$, and at what $f$, does a $0.5\,\text{pF}$ capacitor have the same impedance magnitude as a $20\,\text{k}\Omega$ resistor?`,
        parts: [K.wPart('\\omega', 1 / (20e3 * 0.5e-12), { traps: [{ v: 1 / (20e3 * 0.5e-12) / (2 * PI), msg: 'That is $f$ in hertz.' }] }), K.fPart('f', 1 / (20e3 * 0.5e-12) / (2 * PI), { traps: [{ v: 1 / (20e3 * 0.5e-12), msg: 'That is $\\omega$; divide by $2\\pi$.' }] })],
        hints: [md`$1/(\omega C) = R\Rightarrow\omega = 1/(RC)$.`],
        sol: md`$$\omega = \frac{1}{RC} = \frac{1}{20\,\text{k}\Omega\times0.5\,\text{pF}} = \frac{1}{10\,\text{ns}} = 10^{8}\,\text{rad/s},\qquad f = \frac{\omega}{2\pi} = 15.9\,\text{MHz}$$`,
      }),
      P({
        id: 'bk10-ph-c', title: 'A resistor and a capacitor in series',
        q: md`$R = 2\,\text{k}\Omega$ in series with $C = 1\,\text{pF}$. Find $|Z|$ and $\angle Z$ at $\omega = 10^9\,\text{rad/s}$.`,
        parts: [K.rPart('|Z|', Math.hypot(2e3, 1e3), { traps: [{ v: 3e3, msg: 'Complex impedances add, not their sizes: $|2000 - 1000j| = \\sqrt{2000^2 + 1000^2}$.' }] }),
          K.plain('\\angle Z', -Math.atan(0.5) * 180 / PI, '°', { tol: { abs: 0.3 }, traps: [{ v: Math.atan(0.5) * 180 / PI, msg: 'The capacitor contributes $-j/(\\omega C)$: the angle is negative.' }] })],
        hints: [md`$Z = R + \dfrac{1}{j\omega C} = R - \dfrac{j}{\omega C}$, with $1/(\omega C) = 1\,\text{k}\Omega$ here.`],
        sol: md`$1/(\omega C) = 1/(10^9\times10^{-12}) = 1\,\text{k}\Omega$, so $Z = 2000 - 1000j\ \Omega$.
$$|Z| = \sqrt{2000^2 + 1000^2} = 2236\,\Omega,\qquad \angle Z = -\tan^{-1}\frac{1000}{2000} = -26.57^\circ$$`,
      }),
      P({
        id: 'bk10-ph-d', title: 'From a voltage phasor to a current',
        q: md`$v(t) = 2\cos(10^8t)\,\text{V}$ is applied across $C = 5\,\text{pF}$. Find the amplitude of the current and its phase relative to $v$.`,
        parts: [K.part('I_m', 1e8 * 5e-12 * 2, [[1e-3, 'mA'], [1e-6, 'µA']], { traps: [{ v: 2 / (1e8 * 5e-12), msg: 'Divide the voltage by the impedance: $I_m = V_m/|Z_C| = \\omega CV_m$.' }] }),
          K.plain('\\text{phase of } i \\text{ relative to } v', 90, '°', { tol: { abs: 1 }, traps: [{ v: -90, msg: 'The current **leads**: $\\mathbf{I} = j\\omega C\\mathbf{V}$, and $j = +90^\\circ$.' }] })],
        hints: [md`$\mathbf{I} = j\omega C\,\mathbf{V}$ with $\mathbf{V} = 2\angle0^\circ$.`],
        sol: md`$$\mathbf{I} = j\omega C\,\mathbf{V} = j\times10^8\times5\times10^{-12}\times2 = j\,(1\,\text{mA})$$
Amplitude $1\,\text{mA}$, angle $+90^\circ$: $i(t) = 1\,\text{mA}\cos(10^8t + 90^\circ)$, leading $v$ by a quarter cycle.`,
      }),
      P({
        id: 'bk10-ph-e', title: 'A series-parallel network',
        q: md`$R_1 = 1\,\text{k}\Omega$ in series with ($R_2 = 1\,\text{k}\Omega$ in parallel with $C = 1\,\text{pF}$). Find $|Z|$ and $\angle Z$ at $\omega = 10^9\,\text{rad/s}$.`,
        parts: [K.rPart('|Z|', Math.hypot(1500, 500), { traps: [{ v: 1e3 + 1e3 / Math.SQRT2, msg: 'Add the complex numbers, then take the size: $1000 + (500 - 500j)$.' }, { v: 1e3 + U.par(1e3, 1e3), msg: 'At this frequency $|Z_C| = 1\\,\\text{k}\\Omega$, but it is $-90^\\circ$ from $R_2$: the parallel pair is $500 - 500j$, not $500$.' }] }),
          K.plain('\\angle Z', -Math.atan(1 / 3) * 180 / PI, '°', { tol: { abs: 0.3 } })],
        hints: [md`$R_2\parallel\frac{1}{j\omega C} = \dfrac{R_2}{1 + j\omega R_2C}$ with $\omega R_2C = 1$.`, md`$\dfrac{1000}{1 + j} = \dfrac{1000(1 - j)}{2} = 500 - 500j$.`],
        sol: md`$\omega R_2C = 10^9\times10^3\times10^{-12} = 1$, so
$$R_2\parallel\frac{1}{j\omega C} = \frac{1000}{1 + j} = \frac{1000(1 - j)}{(1 + j)(1 - j)} = 500 - 500j\ \Omega$$
$$Z = 1000 + 500 - 500j = 1500 - 500j\ \Omega,\qquad |Z| = \sqrt{1500^2 + 500^2} = 1581\,\Omega,\qquad \angle Z = -\tan^{-1}\frac{500}{1500} = -18.43^\circ$$`,
      }),
      G('bk_zc', { need: 4 }),
    ],
  });

  // ================================================================ 3. the complex numbers you need
  const arrowFig = (() => {
    const p = new K.Pic(), ac = 'stroke:var(--accent);stroke-width:2.2';
    p.arrow(30, 170, 262, 170, 'dim').arrow(60, 205, 60, 24, 'dim');
    p.lab(268, 170, '\\text{Re}', 'l').lab(60, 18, '\\text{Im}', 'b');
    p.line(180, 90, 180, 170, 'dash').line(60, 90, 180, 90, 'dash');
    p.arrow(60, 170, 180, 90, '', ac, 9);
    p.path('M90,170Q90,160.9 85,153.4', '');
    p.lab(120, 176, 'a', 't').lab(186, 130, 'b', 'l').lab(104, 112, '|z|', 'br').lab(96, 160, '\\theta', 'l').lab(186, 84, 'z = a + jb', 'bl');
    return p.svg(330);
  })();
  const triFig = (() => {
    const p = new K.Pic(), y0 = 240;
    [[20, 0.2], [190, 1], [360, 3]].forEach(([x0, x]) => {
      const h = 70 * x;
      p.path(`M${x0},${y0}L${x0 + 70},${y0}L${x0 + 70},${y0 - h}Z`, '');
      p.line(x0, y0, x0 + 70, y0 - h, '', 'stroke:var(--accent);stroke-width:2.2');
      p.lab(x0 + 35, y0 + 4, '1', 't').lab(x0 + 76, y0 - h / 2, `x = ${x}`, 'l');
      p.lab(x0 + 35, y0 + 26, `\\sqrt{1 + x^2} = ${f(Math.hypot(1, x), 3)}`, 't');
      p.lab(x0 + 35, y0 + 48, `\\tan^{-1}x = ${f(Math.atan(x) * 180 / PI, 3)}^\\circ`, 't');
    });
    return p.svg(520);
  })();
  const cxW = { k: -20, zeros: [1e5], poles: [1e3, 1e6] };
  L({
    id: 'bk10-complex', title: 'The complex numbers you need', ref: 'Lecture 25 (complex numbers review)',
    steps: [
      R(md`
        ### The question

        Every frequency-response calculation ends the same way: a complex number such as
        $$H(j\omega) = \frac{-20\,(1 + j\omega/10^5)}{(1 + j\omega/10^3)(1 + j\omega/10^6)}$$
        whose **magnitude** is the gain and whose **angle** is the phase shift. Multiplying it out is slow and error-prone. This section derives the rules that make it a one-line job, and the two facts about $1 + jx$ on which all of Chapter 11 rests.
      `),
      RF(md`
        ### The physical picture: a complex number is an arrow

        $z = a + jb$ is a point in the plane: $a$ along the real axis, $b$ along the imaginary axis. Draw the arrow from the origin to it. The arrow has a **length** $|z|$ and an **angle** $\theta = \angle z$, measured counter-clockwise from the positive real axis:
        $$|z| = \sqrt{a^2 + b^2},\qquad \angle z = \tan^{-1}\frac{b}{a}\quad(\text{add }180^\circ\text{ when }a < 0)$$

        [[fig:arrow]]

        The same arrow written by its length and angle is the **polar form** $z = |z|\,e^{j\theta}$. (By Euler, $|z|e^{j\theta} = |z|\cos\theta + j|z|\sin\theta$, so $a = |z|\cos\theta$ and $b = |z|\sin\theta$.)
      `, { arrow: { svg: arrowFig, cap: 'A complex number as an arrow: length $|z|$, angle $\\theta$.' } }),
      R(md`
        ### The rules, derived

        Take $z_1 = r_1e^{j\theta_1}$ and $z_2 = r_2e^{j\theta_2}$. Exponentials multiply by adding their exponents, so
        $$z_1z_2 = r_1r_2\,e^{j(\theta_1 + \theta_2)},\qquad \frac{z_1}{z_2} = \frac{r_1}{r_2}\,e^{j(\theta_1 - \theta_2)}$$

        !!key Products and quotients
          $$|z_1z_2| = |z_1|\,|z_2|,\qquad \angle(z_1z_2) = \angle z_1 + \angle z_2$$
          $$\left|\frac{z_1}{z_2}\right| = \frac{|z_1|}{|z_2|},\qquad \angle\frac{z_1}{z_2} = \angle z_1 - \angle z_2$$
          Lengths multiply and divide; angles add and subtract. Multiplying by a complex number **stretches and rotates**.

        Special cases to know on sight:
        - $j = e^{j90^\circ}$: multiplying by $j$ rotates by $+90^\circ$, and $1/j = -j$ rotates by $-90^\circ$.
        - A negative real number $-|k|$ points left: angle $180^\circ$ (or $-180^\circ$, the same direction).
        - A positive real number has angle $0$: it only stretches.
      `),
      R(md`
        ### Check it the slow way

        Multiply in rectangular form: $(a_1 + jb_1)(a_2 + jb_2) = (a_1a_2 - b_1b_2) + j(a_1b_2 + a_2b_1)$. Its length squared:
        $$(a_1a_2 - b_1b_2)^2 + (a_1b_2 + a_2b_1)^2 = a_1^2a_2^2 + b_1^2b_2^2 + a_1^2b_2^2 + a_2^2b_1^2 = (a_1^2 + b_1^2)(a_2^2 + b_2^2)$$
        (the cross terms $\mp2a_1a_2b_1b_2$ cancel). So $|z_1z_2| = |z_1|\,|z_2|$. ✓

        A number: $\dfrac{1}{1 + j}$. Polar: $|1 + j| = \sqrt2$ and $\angle(1 + j) = 45^\circ$, so the quotient has length $1/\sqrt2 = 0.707$ and angle $-45^\circ$. The slow way: multiply top and bottom by $1 - j$, giving $\dfrac{1 - j}{(1 + j)(1 - j)} = \dfrac{1 - j}{2} = 0.5 - 0.5j$, whose length is $\sqrt{0.5} = 0.707$ and angle $-45^\circ$. ✓
      `),
      RF(md`
        ### The factor that runs Chapter 11: $1 + jx$

        Every pole and zero appears as a factor $1 + j\omega/\omega_c$. Call $x = \omega/\omega_c$, "how many corner frequencies up we are". The arrow of $1 + jx$ is the hypotenuse of a right triangle with legs $1$ and $x$:

        [[fig:tri]]

        !!key The one-factor facts
          $$|1 + jx| = \sqrt{1 + x^2},\qquad \angle(1 + jx) = \tan^{-1}x$$

        | $x$ | $0.1$ | $0.5$ | $1$ | $2$ | $10$ |
        |---|---|---|---|---|---|
        | $\sqrt{1 + x^2}$ | $1.005$ | $1.118$ | $1.414$ | $2.236$ | $10.05$ |
        | $\tan^{-1}x$ | $5.7^\circ$ | $26.6^\circ$ | $45^\circ$ | $63.4^\circ$ | $84.3^\circ$ |

        **Small $x$** (low frequency): a flat triangle, length $\approx1$ and angle $\approx0$. **Large $x$**: a tall triangle, length $\approx x$ and angle $\to90^\circ$. **$x = 1$**: the isosceles triangle, $\sqrt2$ and $45^\circ$. Those three regimes *are* the Bode rules of Chapter 11. Its mirror image $1 - jx$ (Chapter 11's right-half-plane zero) has the same length and the opposite angle, $-\tan^{-1}x$.
      `, { tri: { svg: triFig, cap: 'The arrow $1 + jx$ for $x = 0.2$, $1$ and $3$: flat, isosceles, tall.' } }),
      R(md`
        ### What it means

        To evaluate $H(j\omega)$ you never multiply it out. Take each factor on its own, read its length and angle from its triangle, then **multiply the lengths and add the angles** (divide and subtract for factors in the denominator). The gain becomes a product of simple lengths, and in decibels (Chapter 11) even that product becomes a sum.

        ### How to recognize it

        In the lecture's form every factor is $1 + s/\omega_c$. With $s = j\omega$ it is $1 + jx$ with $x = \omega/\omega_c$: compute $x$ first, and the rest is the table above. A bare constant contributes its size, and $180^\circ$ if it is negative.
      `),
      R(md`
        ### Worked example

        $$H(j\omega) = \frac{-20\,(1 + j\omega/10^5)}{(1 + j\omega/10^3)(1 + j\omega/10^6)}\quad\text{at}\quad\omega = 10^4\,\text{rad/s}$$

        | Factor | $x$ | Length | Angle |
        |---|---|---|---|
        | $-20$ | | $20$ | $180^\circ$ |
        | $1 + j\omega/10^5$ (top) | $0.1$ | $1.005$ | $+5.71^\circ$ |
        | $1 + j\omega/10^3$ (bottom) | $10$ | $10.05$ | $-84.29^\circ$ |
        | $1 + j\omega/10^6$ (bottom) | $0.01$ | $1.00005$ | $-0.57^\circ$ |

        $$|H| = \frac{20\times1.005}{10.05\times1.00005} = 2.000,\qquad \angle H = 180^\circ + 5.71^\circ - 84.29^\circ - 0.57^\circ = 100.85^\circ$$
        The output is twice the input and leads it by $100.85^\circ$ (equivalently, lags by $259.15^\circ$).
      `),
      R(md`
        !!mistake Common mistakes
          - **The quadrant.** $\tan^{-1}(b/a)$ only sees the ratio: $-1 - j$ and $1 + j$ give the same ratio but point in opposite directions ($-135^\circ$ versus $45^\circ$). Sketch the arrow.
          - **Adding lengths.** In a product the lengths multiply; and $|z_1 + z_2|\ne|z_1| + |z_2|$ in general.
          - **The sign of a denominator's angle.** A factor below the line **subtracts** its angle: $\angle\frac{1}{1 + jx} = -\tan^{-1}x$.
          - **Degrees versus radians** on the calculator.
      `),
      Q(md`Multiplying a phasor by $j$...`,
        ['rotates it by $+90^\\circ$ and keeps its length', 'doubles its length', 'rotates it by $180^\\circ$', 'turns it into its real part'], 0,
        [null, '$|j| = 1$: the length does not change.', 'That is multiplying by $-1 = j^2$.', 'Multiplication by $j$ is a rotation, not a projection.'],
        md`$j = e^{j90^\circ}$: length 1, angle $90^\circ$. Multiplying adds $90^\circ$ to the angle and multiplies the length by 1.`),
      Q(md`What is the angle of the real number $-5$?`,
        ['$180^\\circ$', '$0^\\circ$', '$-90^\\circ$', 'It has no angle'], 0,
        [null, '$0^\\circ$ is a positive real number. $-5$ points the other way along the real axis.', '$-90^\\circ$ is $-j$, straight down.', 'Every nonzero complex number has an angle; a negative real one points left.'],
        md`$-5 = 5e^{j180^\circ}$: length 5, pointing along the negative real axis. (Writing $-180^\circ$ is the same direction.)`),
      Q(md`About how big is $\dfrac{|1 + j10|}{|1 + j0.1|}$?`,
        ['$10$', '$100$', '$1$', '$0.1$'], 0,
        [null, 'Each length is about $x$ or about 1, not $x^2$.', 'The two factors are at very different $x$.', 'Upside down.'],
        md`$|1 + j10| = 10.05\approx10$ (tall triangle) and $|1 + j0.1| = 1.005\approx1$ (flat triangle): the ratio is $10.0$.`),
      Q(md`What is the angle of $\dfrac{1}{1 + j}$?`,
        ['$-45^\\circ$', '$+45^\\circ$', '$-90^\\circ$', '$0^\\circ$'], 0,
        [null, 'A factor in the denominator **subtracts** its angle.', '$-90^\\circ$ is $1/j$. Here the denominator has angle $45^\\circ$.', 'The denominator is not real.'],
        md`$\angle(1 + j) = 45^\circ$, and dividing subtracts angles: $0 - 45^\circ = -45^\circ$. (Rectangular check: $\frac{1}{1 + j} = 0.5 - 0.5j$.)`),
      P({
        id: 'bk10-cx-a', title: 'A product in polar form',
        q: md`Find the magnitude and angle of $(3 + 4j)(1 - j)$.`,
        parts: [K.plain('|z|', 5 * Math.SQRT2, '', { traps: [{ v: 5 + Math.SQRT2, msg: 'Lengths multiply in a product: $5\\times\\sqrt2$.' }] }), K.plain('\\angle z', (Math.atan2(4, 3) - PI / 4) * 180 / PI, '°', { tol: { abs: 0.3 } })],
        hints: [md`$|3 + 4j| = 5$ at $53.13^\circ$; $|1 - j| = \sqrt2$ at $-45^\circ$.`],
        sol: md`$|3 + 4j| = \sqrt{9 + 16} = 5$, $\angle = \tan^{-1}(4/3) = 53.13^\circ$. $|1 - j| = \sqrt2$, $\angle = -45^\circ$.
$$|z| = 5\sqrt2 = 7.071,\qquad \angle z = 53.13^\circ - 45^\circ = 8.13^\circ$$
Rectangular check: $(3 + 4j)(1 - j) = 3 - 3j + 4j - 4j^2 = 7 + j$; $\sqrt{49 + 1} = 7.071$ and $\tan^{-1}(1/7) = 8.13^\circ$. ✓`,
      }),
      P({
        id: 'bk10-cx-b', title: 'A one-pole factor',
        q: md`Find the magnitude and angle of $\dfrac{10}{1 + 2j}$.`,
        parts: [K.plain('|z|', 10 / Math.sqrt(5), ''), K.plain('\\angle z', -Math.atan(2) * 180 / PI, '°', { tol: { abs: 0.3 }, traps: [{ v: Math.atan(2) * 180 / PI, msg: 'The factor is in the denominator: subtract its angle.' }] })],
        hints: [md`$|1 + 2j| = \sqrt5$, $\angle(1 + 2j) = \tan^{-1}2 = 63.43^\circ$.`],
        sol: md`$$\left|\frac{10}{1 + 2j}\right| = \frac{10}{\sqrt{1 + 4}} = 4.472,\qquad \angle = 0^\circ - \tan^{-1}2 = -63.43^\circ$$`,
      }),
      P({
        id: 'bk10-cx-c', title: 'The triangle for x = 3',
        q: md`For $x = 3$, find $|1 + jx|$ and $\angle(1 + jx)$. Compare with the large-$x$ approximations ($\approx x$ and $\to90^\circ$).`,
        parts: [K.plain('|1 + j3|', Math.sqrt(10), ''), K.plain('\\angle(1 + j3)', Math.atan(3) * 180 / PI, '°', { tol: { abs: 0.3 } })],
        hints: [md`$\sqrt{1 + 9}$ and $\tan^{-1}3$.`],
        sol: md`$|1 + j3| = \sqrt{10} = 3.162$ (the approximation $x = 3$ is $5\%$ low) and $\angle = \tan^{-1}3 = 71.57^\circ$ (still $18^\circ$ short of $90^\circ$). At $x = 3$ we are not yet "far above" the corner; at $x = 10$ the approximations are within $0.5\%$ and $6^\circ$.`,
      }),
      P({
        id: 'bk10-cx-d', title: 'Two poles at one frequency',
        q: md`$H(s) = \dfrac{100}{(1 + s/10^3)(1 + s/10^5)}$. Find $|H(j\omega)|$ and $\angle H(j\omega)$ at $\omega = 10^4\,\text{rad/s}$.`,
        parts: [K.plain('|H|', 100 / (Math.sqrt(101) * Math.sqrt(1.01)), '', { traps: [{ v: 10, msg: 'Close, but include the second pole: $|1 + j0.1| = 1.005$.' }] }), K.plain('\\angle H', -90, '°', { tol: { abs: 0.3 } })],
        hints: [md`$x_1 = 10^4/10^3 = 10$ and $x_2 = 10^4/10^5 = 0.1$.`],
        sol: md`$$|H| = \frac{100}{|1 + j10|\,|1 + j0.1|} = \frac{100}{10.05\times1.005} = 9.901$$
$$\angle H = -\tan^{-1}10 - \tan^{-1}0.1 = -84.29^\circ - 5.71^\circ = -90.00^\circ$$
(Exactly $-90^\circ$: $\tan^{-1}x + \tan^{-1}(1/x) = 90^\circ$, and here the two $x$'s are reciprocals.)`,
      }),
      P({
        id: 'bk10-cx-e', title: 'Exam style: an inverting stage above its pole',
        q: md`An amplifier has $A_v(s) = \dfrac{-40}{1 + s/10^8}$. Find $|A_v|$ and $\angle A_v$ at $\omega = 3\times10^8\,\text{rad/s}$ (take the angle of $-40$ as $+180^\circ$).`,
        parts: [K.plain('|A_v|', 40 / Math.sqrt(10), '', { traps: [{ v: 40 / 3, msg: 'Use the exact length $\\sqrt{1 + 3^2}$, not $3$.' }, { v: 10, msg: 'The length of $1 + j3$ is $\\sqrt{10}$, not $1 + 3$.' }] }),
          K.plain('\\angle A_v', 180 - Math.atan(3) * 180 / PI, '°', { tol: { abs: 0.3 }, accept: [-180 - Math.atan(3) * 180 / PI], traps: [{ v: -Math.atan(3) * 180 / PI, msg: 'The minus sign of $-40$ adds $180^\\circ$.' }] })],
        hints: [md`$x = 3$: $|1 + j3| = \sqrt{10}$, $\angle(1 + j3) = 71.57^\circ$.`],
        sol: md`$$|A_v| = \frac{40}{\sqrt{1 + 9}} = 12.65,\qquad \angle A_v = 180^\circ - 71.57^\circ = 108.43^\circ$$
(Equivalently $-251.57^\circ$, the same direction.)`,
      }),
      G('bk_cplx', { need: 4 }),
    ],
  });

  // ================================================================ 4. the RC low-pass
  const lpBasic = [['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R' }],
    ['w', [1.5, 0], [2.6, 0]], ['C', [2.1, 0], [2.1, 1.6], { n: 'C' }], ['gnd', [2.1, 1.6]], ['term', [2.6, 0], { n: 'v_{out}' }]];
  const linMag = Schem.plot({ x: [0, 5], y: [0, 1.1], w: 400, h: 220, xl: '\\omega/\\omega_p', yl: '|H|', xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.5, 1],
    curves: [{ f: (x) => 1 / Math.sqrt(1 + x * x) }], pts: [{ x: 1, y: Math.SQRT1_2, n: '0.707' }] });
  const linPh = Schem.plot({ x: [0, 5], y: [-90, 0], w: 400, h: 220, xl: '\\omega/\\omega_p', yl: '\\angle H\\ (^\\circ)', xt: [0, 1, 2, 3, 4, 5], yt: [-90, -45, 0],
    curves: [{ f: (x) => -Math.atan(x) * 180 / PI }], pts: [{ x: 1, y: -45, n: '-45^\\circ' }] });
  const rcE = { R1: 10e3, R2: 40e3, C: 5e-12, fq: 10e6 };
  L({
    id: 'bk10-rc', title: 'The RC low-pass, derived', ref: 'Lecture 25',
    steps: [
      R(md`
        ### The question

        A resistor in series, a capacitor to ground, a sine in: how big is the output, and how late, at each frequency? This little circuit is worth knowing cold, because **every node of an amplifier with a capacitor to ground is this circuit in disguise**: Thévenin-reduce the rest and this is what is left. On the exam it is the one-pole building block of every Bode plot and of every "pole at a node".
      `),
      RF(md`
        ### The physical picture

        [[fig:lp]]

        At **low frequency** the capacitor's impedance $1/(\omega C)$ is huge. It is an open, no current flows through $R$, and $v_{out} = v_{in}$. At **high frequency** $1/(\omega C)$ is tiny: the capacitor shorts the output to ground and $v_{out}\to0$. The change-over happens where $1/(\omega C) = R$, at $\omega = 1/RC$.

        The time picture says the same thing. The node needs about $\tau = RC$ to follow a change. A slow sine (period much longer than $\tau$) is followed faithfully; a fast one reverses before the capacitor has charged much, so the output wiggles only a little, and late.
      `, { lp: { fig: lpBasic, cap: 'The RC low-pass.' } }),
      R(md`
        ### The derivation, two ways

        **As a divider.** The capacitor is an impedance $1/(sC)$, so this is a voltage divider:
        $$H(s) = \frac{v_{out}}{v_{in}} = \frac{\frac{1}{sC}}{R + \frac{1}{sC}}$$
        Multiply the top and the bottom by $sC$:
        $$H(s) = \frac{1}{sRC + 1} = \frac{1}{1 + sRC}$$

        **By KCL**, the method that works for any circuit. The current arriving through $R$ equals the current leaving into $C$:
        $$\frac{v_{in} - v_{out}}{R} = sC\,v_{out}\;\Rightarrow\; v_{in} - v_{out} = sRC\,v_{out}\;\Rightarrow\; v_{in} = v_{out}\,(1 + sRC)$$
        The same $H(s)$.

        !!key The RC low-pass
          $$H(s) = \frac{1}{1 + s/\omega_p},\qquad \omega_p = \frac{1}{RC} = \frac{1}{\tau}$$
          $\omega_p$ is the **pole** (or corner) frequency; in hertz, $f_p = \omega_p/2\pi = 1/(2\pi RC)$.
      `),
      RF(md`
        ### Magnitude and phase

        Put $s = j\omega$ and use [the $1 + jx$ facts](#/l/bk10-complex) with $x = \omega/\omega_p$:
        $$|H(j\omega)| = \frac{1}{\sqrt{1 + (\omega/\omega_p)^2}},\qquad \angle H(j\omega) = -\tan^{-1}\frac{\omega}{\omega_p}$$

        | $\omega$ | $0$ | $0.1\,\omega_p$ | $\omega_p$ | $10\,\omega_p$ | $\to\infty$ |
        |---|---|---|---|---|---|
        | $\lvert H\rvert$ | $1$ | $0.995$ | $0.707$ | $0.0995$ | $\to\omega_p/\omega$ |
        | $\angle H$ | $0$ | $-5.7^\circ$ | $-45^\circ$ | $-84.3^\circ$ | $\to-90^\circ$ |

        [[fig:m]]

        [[fig:p]]

        **Why $\omega_p$ is "the $-3\,\text{dB}$ frequency".** At $\omega = \omega_p$, $|H| = 1/\sqrt2 = 0.707$; in decibels (Chapter 11) that is $20\log_{10}0.707 = -3.01\,\text{dB}$. It is also the **half-power** point: power in a resistor goes as $v^2$, and $(1/\sqrt2)^2 = 1/2$. Run it backwards: $|H| = 1/\sqrt2$ means $1 + x^2 = 2$, so $x = 1$. For a single pole, $\omega_{-3\text{dB}} = \omega_p$ **exactly**.
      `, { m: { svg: linMag, cap: 'Linear axes, as in Lecture 25: the gain falls to $0.707$ at $\\omega_p$ and keeps falling.' }, p: { svg: linPh, cap: 'The phase: $-45^\\circ$ at $\\omega_p$, heading for $-90^\\circ$.' } }),
      R(md`
        ### Check it

        - $s\to0$: $H\to1$. At DC the capacitor is open and the output is the input. ✓
        - $s\to\infty$: $H\to0$. The capacitor shorts the output. ✓
        - Units: $sRC$ is $\text{s}^{-1}\cdot\text{s}$, dimensionless, as it must be next to the 1. ✓
        - A number: $R = 1\,\text{k}\Omega$, $C = 1\,\text{nF}$ give $\tau = 1\,\mu\text{s}$, $\omega_p = 10^6\,\text{rad/s}$ and $f_p = 159\,\text{kHz}$.

        ### What it means

        - **Far below the pole** the output is the input: $|H|\approx1$, no phase shift.
        - **Far above the pole** $|H|\approx\omega_p/\omega$: ten times the frequency, a tenth of the output, and $-90^\circ$. Here the circuit is an **integrator**: the capacitor accumulates the current $v_{in}/R$, and $\frac{1}{1 + sRC}\approx\frac{1}{sRC}$ is integration scaled by $1/RC$.
        - **Time and frequency are one number:** $\omega_p = 1/\tau$. A node that takes $\tau = 10\,\text{ns}$ to settle has its corner at $10^8\,\text{rad/s}$ ($15.9\,\text{MHz}$). The oscilloscope rule follows: the rise time is $t_r = 2.2\tau = 2.2/(2\pi f_p)\approx0.35/f_p$.
      `),
      RF(md`
        ### How to recognize it: Thévenin first

        [[fig:th]]

        A source with resistance $R_1$, a load $R_2$ and a capacitor $C$ at the node. KCL at the node (current in through $R_1$ = current out through $R_2$ and $C$):
        $$\frac{v_{in} - v_{out}}{R_1} = \frac{v_{out}}{R_2} + sC\,v_{out}\;\Rightarrow\;\frac{v_{in}}{R_1} = v_{out}\left(\frac{1}{R_1} + \frac{1}{R_2} + sC\right)$$
        Divide by $\left(\frac{1}{R_1} + \frac{1}{R_2}\right) = \frac{1}{R_1\parallel R_2}$ on both sides of the bracket:
        $$H(s) = \frac{(R_1\parallel R_2)/R_1}{1 + s\,(R_1\parallel R_2)\,C} = \frac{R_2}{R_1 + R_2}\cdot\frac{1}{1 + s\,(R_1\parallel R_2)\,C}$$
        The low-frequency gain is the resistive divider (capacitor open); the pole is $1/(RC)$ with $R$ the resistance the capacitor sees, $R_1\parallel R_2$. **Every** single-capacitor low-pass reduces to this: DC gain from the circuit with $C$ open, pole from $R_{seen}C$.
      `, { th: { fig: K.lpFig(1, 1, 1, false), cap: 'Source resistance $R_1$, load $R_2$, node capacitance $C$.' } }),
      R(md`
        ### Worked example

        A source with $R_1 = 10\,\text{k}\Omega$ drives a load $R_2 = 40\,\text{k}\Omega$, and the node has $C = 5\,\text{pF}$. Find $H(0)$, $\omega_p$, $f_p$, and the gain and phase at $f = 10\,\text{MHz}$.

        1. **DC gain** (capacitor open): $H(0) = \dfrac{40}{10 + 40} = 0.8$.
        2. **Resistance seen by $C$:** $R_1\parallel R_2 = \dfrac{10\times40}{50} = 8\,\text{k}\Omega$.
        3. **Pole:** $\omega_p = \dfrac{1}{8\,\text{k}\Omega\times5\,\text{pF}} = \dfrac{1}{40\,\text{ns}} = 2.5\times10^7\,\text{rad/s}$, so $f_p = 3.98\,\text{MHz}$.
        4. **At $10\,\text{MHz}$:** $x = f/f_p = 2.51$, so $|H| = \dfrac{0.8}{\sqrt{1 + 2.51^2}} = \dfrac{0.8}{2.705} = 0.296$ and $\angle H = -\tan^{-1}2.51 = -68.3^\circ$.
      `),
      R(md`
        !!mistake Common mistakes
          - **$R_1$ instead of $R_1\parallel R_2$.** The pole uses the resistance the capacitor sees, with the source zeroed.
          - **Hertz versus rad/s.** $\omega_p = 1/RC$ is in rad/s and $f_p = 1/(2\pi RC)$ in hertz. Read which one the question wants.
          - **$-3\,\text{dB}$ is $0.707$, not $0.5$.** It is half the **power**, $1/\sqrt2$ of the voltage.
          - **The phase at the corner is $-45^\circ$,** not $-90^\circ$; it approaches $-90^\circ$ only far above the corner.
      `),
      Q(md`An RC low-pass at $\omega = 10\,\omega_p$ has $|H|$ of about...`,
        ['$0.1$', '$0.707$', '$0.01$', '$0.5$'], 0,
        [null, '$0.707$ is the value at the corner itself.', '$0.01$ needs $1/\\omega^2$, two poles. One pole gives one factor of 10 per decade.', '$0.5$ is reached near $1.7\\,\\omega_p$.'],
        md`$|H| = 1/\sqrt{1 + 100} = 0.0995\approx0.1$: far above the pole the gain is $\omega_p/\omega$.`),
      Q(md`You double $R$ in an RC low-pass. The corner frequency...`,
        ['halves', 'doubles', 'stays put', 'drops by $\\sqrt2$'], 0,
        [null, 'A bigger $R$ makes a slower node: $\\omega_p = 1/(RC)$ goes down.', '$R$ appears in $\\omega_p = 1/RC$.', '$\\omega_p$ is inversely proportional to $R$, not to $\\sqrt R$.'],
        md`$\omega_p = 1/(RC)$: twice the $R$, half the corner frequency (and twice the time constant).`),
      Q(md`At what frequency is $|H| = 0.5$ for an RC low-pass?`,
        ['$\\sqrt3\\,\\omega_p\\approx1.73\\,\\omega_p$', '$2\\,\\omega_p$', '$\\omega_p$', '$0.5\\,\\omega_p$'], 0,
        [null, 'That treats $|1 + jx|$ as $1 + x$. It is $\\sqrt{1 + x^2}$: at $x = 2$, $|H| = 0.447$.', 'At $\\omega_p$, $|H| = 0.707$.', 'Below the corner the gain is still near 1 ($0.894$).'],
        md`$1/\sqrt{1 + x^2} = 0.5\Rightarrow1 + x^2 = 4\Rightarrow x = \sqrt3 = 1.73$.`),
      P({
        id: 'bk10-rc-a', title: 'The corner of an RC low-pass',
        q: md`$R = 2\,\text{k}\Omega$, $C = 10\,\text{pF}$. Find $\omega_p$ and $f_p$.`, fig: lpBasic,
        parts: [K.wPart('\\omega_p', 1 / (2e3 * 10e-12), { traps: [{ v: 1 / (2e3 * 10e-12) / (2 * PI), msg: 'That is $f_p$ in hertz.' }] }), K.fPart('f_p', 1 / (2e3 * 10e-12) / (2 * PI), { traps: [{ v: 1 / (2e3 * 10e-12), msg: 'That is $\\omega_p$; divide by $2\\pi$.' }] })],
        hints: [md`$\tau = RC = 20\,\text{ns}$; $\omega_p = 1/\tau$.`],
        sol: md`$\tau = 2\,\text{k}\Omega\times10\,\text{pF} = 20\,\text{ns}$, so $\omega_p = 1/(20\,\text{ns}) = 5\times10^7\,\text{rad/s}$ and $f_p = \omega_p/2\pi = 7.96\,\text{MHz}$.`,
      }),
      P({
        id: 'bk10-rc-b', title: 'Choose the capacitor',
        q: md`With $R = 10\,\text{k}\Omega$, what $C$ puts the $-3\,\text{dB}$ frequency of an RC low-pass at $1\,\text{MHz}$?`,
        parts: [K.part('C', 1 / (2 * PI * 1e6 * 10e3), [[1e-12, 'pF']], { traps: [{ v: 1 / (1e6 * 10e3), msg: 'The $1\\,\\text{MHz}$ is in hertz: $\\omega_p = 2\\pi\\times10^6\\,\\text{rad/s}$.' }] })],
        hints: [md`$f_p = \dfrac{1}{2\pi RC}$, so $C = \dfrac{1}{2\pi Rf_p}$.`],
        sol: md`$$C = \frac{1}{2\pi Rf_p} = \frac{1}{2\pi\times10^4\times10^6} = 15.9\,\text{pF}$$`,
      }),
      P({
        id: 'bk10-rc-c', title: 'One octave above the corner',
        q: md`An RC low-pass is driven at twice its corner frequency. Find $|H|$ and $\angle H$.`,
        parts: [K.plain('|H|', 1 / Math.sqrt(5), '', { traps: [{ v: 0.5, msg: '$|1 + j2| = \\sqrt5$, not 2.' }, { v: 1 / 3, msg: '$|1 + j2| = \\sqrt5$, not $1 + 2$.' }] }), K.plain('\\angle H', -Math.atan(2) * 180 / PI, '°', { tol: { abs: 0.3 }, traps: [{ v: -90, msg: '$-90^\\circ$ is only approached far above the corner.' }] })],
        hints: [md`$x = 2$.`],
        sol: md`$$|H| = \frac{1}{\sqrt{1 + 4}} = 0.447,\qquad \angle H = -\tan^{-1}2 = -63.4^\circ$$`,
      }),
      P({
        id: 'bk10-rc-d', title: 'A loaded RC',
        q: md`$R_1 = 5\,\text{k}\Omega$, $R_2 = 5\,\text{k}\Omega$, $C = 2\,\text{pF}$ (source resistance, load, node capacitance). Find $H(0)$, $\omega_p$ and $f_p$.`,
        fig: K.lpFig(5e3, 5e3, 2e-12),
        parts: [K.plain('H(0)', 0.5, 'V/V', { traps: [{ v: 1, msg: 'With $C$ open, $R_1$ and $R_2$ still divide.' }] }),
          K.wPart('\\omega_p', 1 / (2.5e3 * 2e-12), { traps: [{ v: 1 / (5e3 * 2e-12), msg: 'The capacitor sees $R_1\\parallel R_2 = 2.5\\,\\text{k}\\Omega$.' }, { v: 1 / (10e3 * 2e-12), msg: 'Zeroed source: $R_1$ goes to ground, in **parallel** with $R_2$.' }] }),
          K.fPart('f_p', 1 / (2.5e3 * 2e-12) / (2 * PI))],
        hints: [md`$H(0) = R_2/(R_1 + R_2)$; pole $1/((R_1\parallel R_2)C)$.`],
        sol: md`$H(0) = \dfrac{5}{5 + 5} = 0.5$. The capacitor sees $R_1\parallel R_2 = 2.5\,\text{k}\Omega$:
$$\omega_p = \frac{1}{2.5\,\text{k}\Omega\times2\,\text{pF}} = \frac{1}{5\,\text{ns}} = 2\times10^8\,\text{rad/s},\qquad f_p = 31.8\,\text{MHz}$$`,
      }),
      P({
        id: 'bk10-rc-e', title: 'Bandwidth and rise time',
        q: md`An amplifier's output node behaves as a single RC with $f_{3\text{dB}} = 50\,\text{MHz}$. What $10\%$-to-$90\%$ rise time will a fast step show at the output?`,
        parts: [K.tPart('t_r', ln(9) / (2 * PI * 50e6), { traps: [{ v: 1 / (2 * PI * 50e6), msg: 'That is $\\tau$. The rise time is $\\tau\\ln9 = 2.2\\tau$.' }, { v: 1 / 50e6, msg: 'Convert to $\\tau$ first: $\\tau = 1/(2\\pi f_{3\\text{dB}})$.' }] })],
        hints: [md`$\tau = 1/\omega_p = 1/(2\pi f_{3\text{dB}})$ and $t_r = \tau\ln9$.`],
        sol: md`$$\tau = \frac{1}{2\pi\times50\,\text{MHz}} = 3.18\,\text{ns},\qquad t_r = \tau\ln9 = 2.197\times3.18\,\text{ns} = 6.99\,\text{ns}\approx\frac{0.35}{f_{3\text{dB}}} = 7\,\text{ns}$$`,
      }),
      P({
        id: 'bk10-rc-f', title: 'Exam style: where the gain has fallen to a tenth',
        q: md`$R = 1\,\text{k}\Omega$ and $C = 1\,\text{nF}$. Find the exact $\omega$ at which $|H| = 0.1$, that frequency in hertz, and the phase there.`,
        fig: lpBasic,
        parts: [K.wPart('\\omega', 1e6 * Math.sqrt(99), { traps: [{ v: 1e7, msg: 'Ten times the corner gives $|H| = 0.0995$: close. The exact answer solves $1 + x^2 = 100$.' }] }),
          K.fPart('f', 1e6 * Math.sqrt(99) / (2 * PI)), K.plain('\\angle H', -Math.atan(Math.sqrt(99)) * 180 / PI, '°', { tol: { abs: 0.3 } })],
        hints: [md`$\omega_p = 1/RC = 10^6\,\text{rad/s}$. Solve $\dfrac{1}{\sqrt{1 + x^2}} = 0.1$.`],
        sol: md`$\omega_p = 1/(10^3\times10^{-9}) = 10^6\,\text{rad/s}$. Then
$$\frac{1}{\sqrt{1 + x^2}} = 0.1\;\Rightarrow\;1 + x^2 = 100\;\Rightarrow\;x = \sqrt{99} = 9.950$$
$$\omega = 9.95\times10^6\,\text{rad/s},\qquad f = 1.58\,\text{MHz},\qquad \angle H = -\tan^{-1}9.95 = -84.3^\circ$$
(The "ten times the corner" estimate, $10^7\,\text{rad/s}$, is only $0.5\%$ off.)`,
      }),
      G('bk_lp', { need: 4 }),
    ],
  });

  // ================================================================ 5. the RC high-pass and the coupling capacitor
  const hpBasic = [['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.4, 0]], ['C', [0.4, 0], [1.6, 0], { n: 'C' }],
    ['w', [1.6, 0], [2.6, 0]], ['R', [2.1, 0], [2.1, 1.6], { n: 'R' }], ['gnd', [2.1, 1.6]], ['term', [2.6, 0], { n: 'v_{out}' }]];
  const hpMag = Schem.plot({ x: [0, 5], y: [0, 1.1], w: 400, h: 220, xl: '\\omega/\\omega_L', yl: '|H|', xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.5, 1],
    curves: [{ f: (x) => x / Math.sqrt(1 + x * x) }], pts: [{ x: 1, y: Math.SQRT1_2, n: '' }] });
  const hpD = { RB: 100e3, beta: 100, IC: 1e-3, RS: 1e3, CC: 4.7e-6 };
  hpD.rpi = hpD.beta / (hpD.IC / 0.025); hpD.Rin = U.par(hpD.RB, hpD.rpi);
  L({
    id: 'bk10-hp', title: 'The RC high-pass and the coupling capacitor', ref: 'Background for Chapter 9 and Lecture 27',
    steps: [
      R(md`
        ### The question

        Swap the two parts: the capacitor in series, the resistor to ground. That is the **coupling capacitor** of [Chapter 9](#/l/bk09-bias): it carries the signal from one stage to the next while blocking DC, so each stage keeps its own bias. "Big capacitors are shorts for signal" was an assumption there. Here we find **at which frequencies** it is true, and meet a new feature: an $s$ in the numerator.
      `),
      RF(md`
        ### The physical picture

        [[fig:hp]]

        At DC the series capacitor is open: no current, no output. That is its job: the bias of one stage cannot leak into the next. At high frequency its impedance is small next to $R$, and the input appears across $R$ almost untouched. The change-over is again where $1/(\omega C) = R$.
      `, { hp: { fig: hpBasic, cap: 'The RC high-pass.' } }),
      RF(md`
        ### The derivation

        The divider, with the capacitor on top this time:
        $$H(s) = \frac{R}{R + \frac{1}{sC}} = \frac{sRC}{1 + sRC}\qquad(\text{multiply top and bottom by }sC)$$
        With $\omega_L = 1/RC$:
        $$H(s) = \frac{s/\omega_L}{1 + s/\omega_L},\qquad |H(j\omega)| = \frac{\omega/\omega_L}{\sqrt{1 + (\omega/\omega_L)^2}},\qquad \angle H = 90^\circ - \tan^{-1}\frac{\omega}{\omega_L}$$
        The $s$ upstairs is a **zero at $s = 0$**: $H(0) = 0$, the capacitor blocks DC. Its angle, $\angle(j\omega/\omega_L) = +90^\circ$ at every frequency, is why a high-pass **leads**.

        !!key The RC high-pass
          $$H(s) = \frac{sRC}{1 + sRC}:\qquad |H| = 0.707\ \text{and}\ \angle H = +45^\circ\ \text{at}\ \omega_L = \frac{1}{RC}$$
          Below $\omega_L$: $|H|\approx\omega/\omega_L$ (rising) and the phase is near $+90^\circ$. Above: $|H|\approx1$ and $0^\circ$.

        [[fig:m]]
      `, { m: { svg: hpMag, cap: 'The high-pass on linear axes: it rises from zero and settles at 1, passing $0.707$ at $\\omega_L$.' } }),
      RF(md`
        ### A coupling capacitor in an amplifier

        [[fig:cc]]

        A source $v_s$ with resistance $R_S$ drives an amplifier through $C_C$; the amplifier's input resistance is $R_{in}$ (for a common emitter, $R_B\parallel r_\pi$). The capacitor and the two resistors form one series loop, so the divider is
        $$\frac{v_{in}}{v_s} = \frac{R_{in}}{R_S + \frac{1}{sC_C} + R_{in}}$$
        Multiply top and bottom by $sC_C$, then pull $R_S + R_{in}$ out of the denominator:
        $$\frac{v_{in}}{v_s} = \frac{sR_{in}C_C}{1 + s(R_S + R_{in})C_C} = \frac{R_{in}}{R_S + R_{in}}\cdot\frac{s(R_S + R_{in})C_C}{1 + s(R_S + R_{in})C_C}$$

        !!key The coupling capacitor's corner
          $$\omega_L = \frac{1}{(R_S + R_{in})\,C_C},\qquad \text{mid-band gain}\ \frac{R_{in}}{R_S + R_{in}}$$
          The capacitor sits **between** the two resistors, so it sees them **in series**: zero $v_s$, and the path from one plate to the other runs through $R_S$, ground, and $R_{in}$.
      `, { cc: { fig: K.hpFig(1, 1, 1, false), cap: 'A coupling capacitor between a source ($R_S$) and an amplifier input ($R_{in}$).' } }),
      R(md`
        ### Check it

        - $s\to0$: $H\to0$; the capacitor is open and blocks DC. ✓
        - $s\to\infty$: $H\to R_{in}/(R_S + R_{in})$; the capacitor is a short and only the divider is left. ✓
        - $C_C\to\infty$: $\omega_L\to0$, the mid-band reaches all the way down: an ideal coupling capacitor. ✓

        ### What it means

        "Big" is relative. $C_C = 10\,\mu\text{F}$ with $R_S + R_{in} = 10\,\text{k}\Omega$ gives $\omega_L = 10\,\text{rad/s}$ ($1.6\,\text{Hz}$): audio passes untouched. The same capacitor in front of $R_S + R_{in} = 100\,\Omega$ gives $f_L = 160\,\text{Hz}$, and the bass is lost. Treating $C_C$ as a short is right only a decade or so above $f_L$, where the high-pass factor is within $0.5\%$ of 1.

        ### How to recognize it

        - A capacitor **in series** with the signal path: a zero at $s = 0$ and a pole, a high-pass. A capacitor **to ground**: a low-pass.
        - The corner uses the resistance the capacitor sees: for a series capacitor, the resistances on its two sides **add**.
        - Coupling and bypass capacitors set the **low** end of an amplifier's band; the small capacitors at the nodes (Chapter 12) set the high end.
      `),
      R(md`
        ### Worked example

        $R_S = 1\,\text{k}\Omega$, $R_{in} = 9\,\text{k}\Omega$, $C_C = 1\,\mu\text{F}$.

        1. **Mid-band gain:** $\dfrac{9}{1 + 9} = 0.9$.
        2. **Corner:** $\omega_L = \dfrac{1}{10\,\text{k}\Omega\times1\,\mu\text{F}} = \dfrac{1}{10\,\text{ms}} = 100\,\text{rad/s}$, $f_L = 15.9\,\text{Hz}$.
        3. **At $10\,\text{Hz}$:** $x = 10/15.9 = 0.628$, so $|H| = 0.9\times\dfrac{0.628}{\sqrt{1 + 0.395}} = 0.9\times0.532 = 0.479$, and $\angle H = 90^\circ - \tan^{-1}0.628 = 57.9^\circ$.
        4. **Design check:** for $f_L\le5\,\text{Hz}$ we would need $C_C\ge\dfrac{1}{2\pi\times5\times10^4} = 3.2\,\mu\text{F}$.
      `),
      R(md`
        !!mistake Common mistakes
          - **$R_S\parallel R_{in}$ instead of $R_S + R_{in}$.** The capacitor is between them; with $v_s$ zeroed they are in series around it.
          - **Forgetting the mid-band divider.** Even with $C_C$ shorted, $R_S$ and $R_{in}$ divide the signal.
          - **Expecting the coupling capacitor to limit the high-frequency response.** At high frequency it is a short; it shapes only the low end.
          - **Hertz versus rad/s,** again.
      `),
      Q(md`A coupling capacitor sits between a source with resistance $R_S$ and an amplifier input $R_{in}$. Which resistance sets its corner?`,
        ['$R_S + R_{in}$', '$R_S\\parallel R_{in}$', '$R_{in}$ alone', '$R_S$ alone'], 0,
        [null, 'Parallel would need both resistors across the capacitor\'s two terminals. Here the capacitor is between them: zeroed, the loop runs $R_S$, ground, $R_{in}$, in series.', 'The source side is part of the loop too.', 'The amplifier side is part of the loop too.'],
        md`Zero $v_s$ and look into the capacitor's terminals: from one plate through $R_S$ to ground, from ground through $R_{in}$ to the other plate. Series: $R_S + R_{in}$, so $\omega_L = 1/((R_S + R_{in})C_C)$.`),
      Q(md`An RC high-pass at $\omega = 0.1\,\omega_L$ has...`,
        ['$|H|\\approx0.1$ of its mid-band value and a phase near $+84^\\circ$', '$|H|\\approx0.707$ and $+45^\\circ$', '$|H|\\approx1$ and $0^\\circ$', '$|H|\\approx0.1$ and a phase near $-84^\\circ$'], 0,
        [null, 'That is at the corner itself.', 'That is far **above** the corner.', 'A high-pass **leads**: the zero at the origin gives $+90^\\circ$, and the pole has barely started taking it away.'],
        md`$x = 0.1$: $|H| = 0.1/\sqrt{1.01} = 0.0995$ and $\angle H = 90^\circ - 5.7^\circ = 84.3^\circ$.`),
      Q(md`How does a coupling capacitor affect an amplifier's gain at very high frequency?`,
        ['Not at all: it is a short there', 'It lowers it as $1/\\omega$', 'It raises it without limit', 'It adds $-90^\\circ$ of phase'], 0,
        [null, 'That is a capacitor **to ground**. A series capacitor gets out of the way at high frequency.', 'Above $\\omega_L$ the high-pass factor tends to 1.', 'Above $\\omega_L$ its phase contribution goes to $0^\\circ$.'],
        md`$\frac{s/\omega_L}{1 + s/\omega_L}\to1$ for $\omega\gg\omega_L$. Coupling and bypass capacitors set the low end of the band only.`),
      P({
        id: 'bk10-hp-a', title: 'The corner of an RC high-pass',
        q: md`$C = 0.1\,\mu\text{F}$ in series, $R = 10\,\text{k}\Omega$ to ground. Find $\omega_L$ and $f_L$.`, fig: hpBasic,
        parts: [K.wPart('\\omega_L', 1 / (10e3 * 0.1e-6)), K.fPart('f_L', 1 / (10e3 * 0.1e-6) / (2 * PI), { traps: [{ v: 1 / (10e3 * 0.1e-6), msg: 'That is $\\omega_L$ in rad/s.' }] })],
        hints: [md`$\tau = RC = 1\,\text{ms}$.`],
        sol: md`$\tau = 10\,\text{k}\Omega\times0.1\,\mu\text{F} = 1\,\text{ms}$, so $\omega_L = 1000\,\text{rad/s}$ and $f_L = 159\,\text{Hz}$.`,
      }),
      P({
        id: 'bk10-hp-b', title: 'Choose the coupling capacitor',
        q: md`A $600\,\Omega$ source feeds an amplifier with $R_{in} = 2.4\,\text{k}\Omega$ through $C_C$. What is the smallest $C_C$ that keeps $f_L\le10\,\text{Hz}$?`,
        parts: [K.part('C_C', 1 / (2 * PI * 10 * 3e3), [[1e-6, 'µF']], { traps: [{ v: 1 / (2 * PI * 10 * U.par(600, 2.4e3)), msg: 'The capacitor sees $R_S + R_{in}$ in series, not in parallel.' }, { v: 1 / (2 * PI * 10 * 2.4e3), msg: 'Include $R_S$: the capacitor sees $R_S + R_{in}$.' }] })],
        hints: [md`$f_L = \dfrac{1}{2\pi(R_S + R_{in})C_C}$.`],
        sol: md`$$C_C\ge\frac{1}{2\pi f_L(R_S + R_{in})} = \frac{1}{2\pi\times10\times3\,\text{k}\Omega} = 5.31\,\mu\text{F}$$`,
      }),
      P({
        id: 'bk10-hp-c', title: 'Gain and phase at the low corner',
        q: md`$R_S = 1\,\text{k}\Omega$, $R_{in} = 4\,\text{k}\Omega$. Find the mid-band $v_{in}/v_s$, the magnitude at $f_L$, and the phase at $f_L$.`,
        parts: [K.plain('H_M', 0.8, 'V/V'), K.plain('|H(f_L)|', 0.8 / Math.SQRT2, 'V/V', { traps: [{ v: 0.4, msg: 'At the corner the factor is $1/\\sqrt2$, not $1/2$.' }, { v: Math.SQRT1_2, msg: 'Multiply by the mid-band gain $0.8$ as well.' }] }),
          K.plain('\\angle H(f_L)', 45, '°', { tol: { abs: 0.5 }, traps: [{ v: -45, msg: 'A high-pass leads: $90^\\circ - 45^\\circ$.' }] })],
        hints: [md`At $x = 1$: $\dfrac{x}{\sqrt{1 + x^2}} = \dfrac{1}{\sqrt2}$ and the angle is $90^\circ - 45^\circ$.`],
        sol: md`$H_M = \dfrac{4}{1 + 4} = 0.8$. At $f_L$: $|H| = 0.8/\sqrt2 = 0.566$ and $\angle H = 90^\circ - \tan^{-1}1 = +45^\circ$.`,
      }),
      P({
        id: 'bk10-hp-d', title: 'Exam style: the input coupling capacitor of a common emitter',
        q: md`A common emitter is biased at $I_C = 1\,\text{mA}$ with $\beta = 100$; its base bias network looks like $R_B = 100\,\text{k}\Omega$ to (incremental) ground. A source with $R_S = 1\,\text{k}\Omega$ drives the base through $C_C = 4.7\,\mu\text{F}$. Find $r_\pi$, the amplifier's input resistance $R_{in}$, the mid-band $v_{in}/v_s$, and $f_L$.`,
        fig: K.hpFig(1e3, hpD.Rin, 4.7e-6, false),
        parts: [K.rPart('r_\\pi', hpD.rpi), K.rPart('R_{in}', hpD.Rin, { traps: [{ v: hpD.rpi, msg: 'The bias resistor $R_B$ is in parallel with $r_\\pi$ at the base.' }] }),
          K.plain('v_{in}/v_s\\ (\\text{mid-band})', hpD.Rin / (hpD.Rin + 1e3), 'V/V'),
          K.fPart('f_L', 1 / (2 * PI * (hpD.Rin + 1e3) * 4.7e-6), { traps: [{ v: 1 / (2 * PI * U.par(hpD.Rin, 1e3) * 4.7e-6), msg: 'Series, not parallel: $R_S + R_{in}$.' }, { v: 1 / (2 * PI * hpD.Rin * 4.7e-6), msg: 'Include $R_S$.' }] })],
        hints: [md`$g_m = I_C/V_T = 40\,\text{mS}$, $r_\pi = \beta/g_m$. Looking into the base you see $r_\pi$; the bias network adds $R_B$ in parallel.`, md`$f_L = \dfrac{1}{2\pi(R_S + R_{in})C_C}$.`],
        sol: md`$g_m = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$, $r_\pi = 100/40\,\text{mS} = 2.5\,\text{k}\Omega$.
$$R_{in} = R_B\parallel r_\pi = 100\parallel2.5 = 2.439\,\text{k}\Omega,\qquad \frac{v_{in}}{v_s} = \frac{2.439}{1 + 2.439} = 0.709$$
$$f_L = \frac{1}{2\pi(1 + 2.439)\,\text{k}\Omega\times4.7\,\mu\text{F}} = \frac{1}{2\pi\times16.2\,\text{ms}} = 9.85\,\text{Hz}$$`,
      }),
      P({
        id: 'bk10-hp-e', title: 'A decade below the corner',
        q: md`An RC high-pass is driven at $f = f_L/10$. Find $|H|$ relative to its mid-band value, and the phase.`,
        parts: [K.plain('|H|/H_M', 0.1 / Math.sqrt(1.01), '', { traps: [{ v: 1 / Math.sqrt(1.01), msg: 'That is the low-pass value. Below its corner a high-pass is small: $x/\\sqrt{1 + x^2}$.' }] }),
          K.plain('\\angle H', 90 - Math.atan(0.1) * 180 / PI, '°', { tol: { abs: 0.3 }, traps: [{ v: -Math.atan(0.1) * 180 / PI, msg: 'The zero at the origin adds $+90^\\circ$.' }] })],
        hints: [md`$x = 0.1$.`],
        sol: md`$$\frac{|H|}{H_M} = \frac{0.1}{\sqrt{1.01}} = 0.0995,\qquad \angle H = 90^\circ - \tan^{-1}0.1 = 84.3^\circ$$`,
      }),
      G('bk_hp', { need: 3 }),
    ],
  });

  // ================================================================ 6. an amplifier with a load capacitor
  const csOut = [['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.5, 0]], ['term', [0.5, 0], { n: 'v_{gs} = v_{in}' }],
    ['G', [2.2, 0], [2.2, 1.6], { n: 'g_mv_{in}', side: 'l' }], ['w', [2.2, 0], [5.6, 0]], ['R', [3.2, 0], [3.2, 1.6], { n: 'R_D' }], ['R', [4.2, 0], [4.2, 1.6], { n: 'r_{ds}' }],
    ['C', [5.2, 0], [5.2, 1.6], { n: 'C_L' }], ['w', [2.2, 1.6], [5.2, 1.6]], ['gnd', [3.7, 1.6]], ['term', [5.6, 0], { n: 'v_{out}' }]];
  const bodeCS = EB.svg({ k: -32, poles: [1.25e8] }, { marks: [{ w: 1.25e8, n: '\\omega_p' }, { w: 4e9, n: '\\omega_u' }], pts: [{ w: 1.25e8, on: 'exact', n: '-3\\,\\text{dB}', side: 'dl' }] });
  const ampE = { ID: 0.2e-3, Vov: 0.2, lam: 0.1, CL: 0.2e-12 };
  ampE.gm = 2 * ampE.ID / ampE.Vov; ampE.rds = 1 / (ampE.lam * ampE.ID);
  L({
    id: 'bk10-amp', title: 'An amplifier with a load capacitor', ref: 'Lecture 25',
    steps: [
      R(md`
        ### The question

        Lecture 25's first frequency-response result: the common-source stage with a capacitor $C_L$ on its output. Its gain was $-g_mR_D$ at every frequency; with $C_L$ it falls above some frequency. We want $A_v(s)$, the low-frequency gain, the bandwidth, and the frequency where the gain has fallen to 1. Chapter 12 repeats exactly this calculation node by node, and the BJT version is identical.
      `),
      RF(md`
        ### The physical picture: where does the transistor's current go?

        [[fig:cs]]

        For small signals the transistor is a current source: it pulls $g_mv_{in}$ out of the output node (the model's arrow points from drain to source). That current must come from somewhere, and there are two places: $R_D$, where it makes a voltage, and $C_L$, where it changes the stored charge.

        - **Slow signals:** $C_L$ is an open. All of $g_mv_{in}$ flows in $R_D$, and $v_{out} = -g_mR_Dv_{in}$, the familiar gain.
        - **Fast signals:** $1/(\omega C_L)\ll R_D$, so nearly all the current comes out of the capacitor. The voltage it makes there is $g_mv_{in}\cdot\frac{1}{\omega C_L}$: a gain of $g_m/(\omega C_L)$, falling as $1/\omega$.

        The change-over is where the capacitor's impedance equals $R_D$, at $\omega = 1/(R_DC_L)$. It is [the RC low-pass](#/l/bk10-rc) again: the transistor and $R_D$ form a Norton source, and $C_L$ hangs on it.
      `, { cs: { fig: K.ampCL(false), cap: 'Lecture 25: the common source with a load capacitor.' } }),
      RF(md`
        ### The model

        The MOSFET in saturation becomes $g_mv_{gs}$ with $r_{ds}$ across it ([Chapter 2](#/l/bk02-model)). We ignore its own capacitances ($C_{gs}$, $C_{gd}$, $C_{db}$: [Chapter 12](#/l/bk12-where)). The input is an ideal source, so $v_{gs} = v_{in}$ and the gate has no pole of its own. The supply is incremental ground, so $R_D$ runs from the output to ground.

        [[fig:m]]
      `, { m: { fig: csOut, cap: 'The small-signal circuit: the current $g_mv_{in}$ leaves the output node through the transistor; $R_D$, $r_{ds}$ and $C_L$ supply it.' } }),
      R(md`
        ### The derivation, two ways

        **KCL at the output.** The currents leaving the node through each branch add to zero:
        $$g_mv_{in} + \frac{v_{out}}{R_D} + \frac{v_{out}}{r_{ds}} + sC_Lv_{out} = 0$$
        Let $R = R_D\parallel r_{ds}$, so that $\frac{1}{R_D} + \frac{1}{r_{ds}} = \frac{1}{R}$:
        $$v_{out}\left(\frac{1}{R} + sC_L\right) = -g_mv_{in}\quad\Rightarrow\quad v_{out}\,\frac{1 + sRC_L}{R} = -g_mv_{in}$$

        !!key The common source with a load capacitor (Lecture 25)
          $$A_v(s) = \frac{v_{out}}{v_{in}} = \frac{-g_mR}{1 + sRC_L} = \frac{-g_mR}{1 + s/\omega_p},\qquad R = R_D\parallel r_{ds},\qquad \omega_p = \frac{1}{RC_L}$$

        **With $A_v = -G_MR_{out}$** ([Chapter 4](#/l/bk04-norton)). Short the output: $C_L$ is shorted too and has no voltage, so $G_M = g_m$ as before. Zero the input: the output sees $R_D$, $r_{ds}$ and now $1/(sC_L)$, all in parallel:
        $$R_{out}(s) = R\parallel\frac{1}{sC_L} = \frac{R\cdot\frac{1}{sC_L}}{R + \frac{1}{sC_L}} = \frac{R}{1 + sRC_L}$$
        and $A_v = -g_mR_{out}(s)$ gives the same answer. The capacitor changes **only $R_{out}$**: the input side never knows it is there.

        !!trap The sign in the lecture's $\omega_p$
          The notes write "pole frequency $\omega_p = -1/(R_DC_L)$" and then $A_v(s) = -g_mR_D/(1 + s/\omega_p)$. Both cannot hold with the same $\omega_p$: putting $\omega_p = -1/(R_DC_L)$ into $1 + s/\omega_p$ gives $1 - sR_DC_L$, a different function (its magnitude is the same, but its phase goes the wrong way). What is meant: the **pole**, the value of $s$ where the denominator vanishes, is at $s = -1/(R_DC_L)$, a negative number; the **pole frequency** in the $(1 + s/\omega_p)$ form is the positive number $\omega_p = 1/(R_DC_L)$. Write it that way on the exam.
      `),
      RF(md`
        ### Gain, bandwidth, and the gain-bandwidth product

        Put $s = j\omega$:
        $$|A_v(j\omega)| = \frac{g_mR}{\sqrt{1 + (\omega/\omega_p)^2}},\qquad \angle A_v = 180^\circ - \tan^{-1}\frac{\omega}{\omega_p}$$
        (The minus sign of $-g_mR$ is the $180^\circ$.) The **bandwidth** is $\omega_{-3\text{dB}} = \omega_p = 1/(RC_L)$.

        Far above the pole, $|A_v|\approx g_mR\cdot\omega_p/\omega = g_m/(\omega C_L)$: $R$ has cancelled. The gain reaches 1 at the **unity-gain frequency** $\omega_u$. Exactly, $|A_v| = 1$ means $(g_mR)^2 = 1 + (\omega_u/\omega_p)^2$, so
        $$\omega_u = \omega_p\sqrt{(g_mR)^2 - 1}\approx g_mR\,\omega_p = \frac{g_m}{C_L}$$
        and the approximation is excellent once $g_mR\gtrsim10$ (at $g_mR = 10$ it is $0.5\%$ high).

        !!key Gain times bandwidth is fixed
          $$|A_v(0)|\cdot\omega_p = g_mR\cdot\frac{1}{RC_L} = \frac{g_m}{C_L}$$
          Raise $R$ and you get more gain and proportionally less bandwidth. Only a bigger $g_m$ or a smaller $C_L$ buys speed.

        [[fig:b]]
      `, { b: { svg: bodeCS, cap: 'Preview of Chapter 11: $g_mR = 32$, $\\omega_p = 1.25\\times10^8\\,\\text{rad/s}$. The gain is flat, then falls $20\\,\\text{dB}$ per decade and crosses $0\\,\\text{dB}$ at $\\omega_u\\approx g_m/C_L = 4\\times10^9\\,\\text{rad/s}$.' } }),
      R(md`
        ### Check it

        - $C_L\to0$: $\omega_p\to\infty$ and $A_v = -g_mR$ at every frequency, the Exam 2 result. ✓
        - $r_{ds}\to\infty$: $R = R_D$ and $A_v = -g_mR_D/(1 + sR_DC_L)$, the lecture's form. ✓
        - $R_D\to\infty$ (a current-source load): $A_v(0) = -g_mr_{ds}$, the intrinsic gain, with $\omega_p = 1/(r_{ds}C_L)$, very low. The product is still $g_m/C_L$. ✓
        - Units: $g_m/C_L$ is $(\text{A/V})/(\text{A·s/V}) = 1/\text{s}$. ✓
      `),
      RF(md`
        ### The BJT twin

        [[fig:ce]]

        The hybrid-$\pi$ model puts $r_\pi$ from base to emitter, but with the base driven by an ideal source, $v_\pi = v_{in}$ no matter what; $r_\pi$ only draws input current. The output node is identical, with $R_C$ and $r_o$:
        $$A_v(s) = \frac{-g_m(R_C\parallel r_o)}{1 + s(R_C\parallel r_o)C_L},\qquad g_m = \frac{I_C}{V_T}$$
        At the same current a BJT's $g_m$ is much larger ($40\,\text{mS}$ at $1\,\text{mA}$), so for the same $C_L$ its gain-bandwidth $g_m/C_L$ is much larger too.

        ### How to recognize it

        One output node, a resistance $R$ to ground (the Exam 2 $R_{out}$), a capacitance $C_L$ to ground: one pole at $1/(R_{out}C_L)$, and the DC gain is the Exam 2 gain. This is Lecture 28's "pole at a node" in its simplest form ([Chapter 12](#/l/bk12-node)).
      `, { ce: { fig: K.ampCL(true), cap: 'The common emitter with a load capacitor.' } }),
      R(md`
        ### Worked example 1: a MOSFET stage

        $I_D = 0.5\,\text{mA}$, $V_{ov} = 0.25\,\text{V}$, $\lambda = 0.05\,\text{V}^{-1}$, $R_D = 10\,\text{k}\Omega$, $C_L = 1\,\text{pF}$.

        1. $g_m = 2I_D/V_{ov} = 2(0.5\,\text{mA})/0.25\,\text{V} = 4\,\text{mS}$, and $r_{ds} = 1/(\lambda I_D) = 1/(0.05\times0.5\,\text{mA}) = 40\,\text{k}\Omega$.
        2. $R = 10\parallel40 = 8\,\text{k}\Omega$, so $|A_v(0)| = g_mR = 4\,\text{mS}\times8\,\text{k}\Omega = 32$.
        3. $\omega_p = 1/(8\,\text{k}\Omega\times1\,\text{pF}) = 1/(8\,\text{ns}) = 1.25\times10^8\,\text{rad/s}$, so $f_{3\text{dB}} = 19.9\,\text{MHz}$.
        4. $\omega_u = \omega_p\sqrt{32^2 - 1} = 1.25\times10^8\times31.98 = 3.998\times10^9\,\text{rad/s}$ (the shortcut $g_m/C_L$ gives $4\times10^9$): $f_u = 636\,\text{MHz}$.

        ### Worked example 2: a BJT stage

        $I_C = 1\,\text{mA}$, $V_A = 100\,\text{V}$, $R_C = 5\,\text{k}\Omega$, $C_L = 2\,\text{pF}$.

        1. $g_m = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$, and $r_o = 100\,\text{V}/1\,\text{mA} = 100\,\text{k}\Omega$.
        2. $R = 5\parallel100 = 4.76\,\text{k}\Omega$, so $|A_v(0)| = 40\,\text{mS}\times4.76\,\text{k}\Omega = 190.5$.
        3. $\omega_p = 1/(4.76\,\text{k}\Omega\times2\,\text{pF}) = 1.05\times10^8\,\text{rad/s}$ ($16.7\,\text{MHz}$).
        4. $\omega_u\approx g_m/C_L = 40\,\text{mS}/2\,\text{pF} = 2\times10^{10}\,\text{rad/s}$ ($3.18\,\text{GHz}$). In a real transistor its own capacitances, ignored here, cut in long before that: Chapter 12.
      `),
      R(md`
        !!mistake Common mistakes
          - **Forgetting $r_{ds}$ (or $r_o$)** in the resistance at the output node: $R = R_D\parallel r_{ds}$.
          - **Thinking $C_L$ lowers the DC gain.** At DC it is open; it only sets $\omega_p$.
          - **Calling $\omega_p$ the unity-gain frequency.** At $\omega_p$ the gain is still $0.707\,g_mR$; it reaches 1 near $g_m/C_L$, a factor $g_mR$ higher.
          - **The sign of $\omega_p$** (see the trap above), and **hertz versus rad/s**.
      `),
      Q(md`In the common source with $C_L$ ($r_{ds}\to\infty$), you double $R_D$. What happens?`,
        ['The DC gain doubles and the bandwidth halves', 'Both double', 'The gain doubles; the bandwidth stays put', 'Nothing changes at high frequency, and nothing at low frequency either'], 0,
        [null, '$\\omega_p = 1/(R_DC_L)$ goes **down** when $R_D$ goes up.', '$R_D$ is in $\\omega_p$ too.', 'The DC gain $g_mR_D$ certainly changes. (It is true that far above the pole the gain $g_m/\\omega C_L$ does not depend on $R_D$.)'],
        md`$|A_v(0)| = g_mR_D$ doubles and $\omega_p = 1/(R_DC_L)$ halves: the gain-bandwidth product $g_m/C_L$ is unchanged.`),
      Q(md`Far above $\omega_p$, where does most of the transistor's signal current $g_mv_{in}$ come from?`,
        ['From $C_L$', 'From $R_D$', 'Half from each', 'From the gate'], 0,
        [null, 'At high frequency $1/(\\omega C_L)\\ll R_D$: the capacitor is the easier path.', 'They split equally only at $\\omega_p$ (and even then $90^\\circ$ apart).', 'No current flows into a gate.'],
        md`The current divides between the parallel branches in inverse proportion to their impedances. Above $\omega_p$ the capacitor's impedance is the smaller one, so it supplies most of the current, and $v_{out}\approx-g_mv_{in}/(sC_L)$.`),
      Q(md`You double $g_m$ (same $R$, same $C_L$). What happens?`,
        ['The DC gain doubles, $\\omega_p$ is unchanged, the unity-gain frequency doubles', 'The DC gain doubles and $\\omega_p$ halves', 'Only $\\omega_p$ changes', 'Nothing: $g_m$ cancels'], 0,
        [null, '$\\omega_p = 1/(RC_L)$ has no $g_m$ in it.', '$g_m$ is not in $\\omega_p$; it scales the gain.', '$g_m$ cancels from nothing: it multiplies the whole gain.'],
        md`$A_v(s) = -g_mR/(1 + sRC_L)$: $g_m$ scales the whole curve up. $\omega_p = 1/(RC_L)$ stays, and $\omega_u\approx g_m/C_L$ doubles.`),
      P({
        id: 'bk10-amp-a', title: 'Lecture 25 with numbers',
        q: md`Common source with $g_m = 2\,\text{mS}$, $r_{ds}\to\infty$, $R_D = 20\,\text{k}\Omega$, $C_L = 0.5\,\text{pF}$. Find $|A_v(0)|$, $\omega_p$ and $f_{3\text{dB}}$.`,
        fig: K.ampCL(false, { R: '20\\,\\text{k}\\Omega', C: '0.5\\,\\text{pF}' }),
        parts: [K.plain('|A_v(0)|', 40, 'V/V'), K.wPart('\\omega_p', 1 / (20e3 * 0.5e-12), { traps: [{ v: 1 / (20e3 * 0.5e-12) / (2 * PI), msg: 'That is $f$ in hertz.' }] }), K.fPart('f_{3dB}', 1 / (20e3 * 0.5e-12) / (2 * PI), { traps: [{ v: 1 / (20e3 * 0.5e-12), msg: 'That is $\\omega_p$; divide by $2\\pi$.' }] })],
        hints: [md`$|A_v(0)| = g_mR_D$ and $\omega_p = 1/(R_DC_L)$.`],
        sol: md`$$|A_v(0)| = 2\,\text{mS}\times20\,\text{k}\Omega = 40,\qquad \omega_p = \frac{1}{20\,\text{k}\Omega\times0.5\,\text{pF}} = \frac{1}{10\,\text{ns}} = 10^8\,\text{rad/s},\qquad f_{3\text{dB}} = 15.9\,\text{MHz}$$`,
      }),
      P({
        id: 'bk10-amp-b', title: 'The gain above the corner',
        q: md`Same stage ($|A_v(0)| = 40$, $f_{3\text{dB}} = 15.9\,\text{MHz}$). What is $|A_v|$ at $f = 50\,\text{MHz}$?`,
        parts: [K.plain('|A_v|', 40 / Math.sqrt(1 + (50e6 * 2 * PI * 1e-8) ** 2), 'V/V', { traps: [{ v: 40 / (50e6 * 2 * PI * 1e-8), msg: 'That is the far-above approximation $40\\,f_{3\\text{dB}}/f$; use the exact $\\sqrt{1 + x^2}$ (only $3.1$ times the corner here).' }] })],
        hints: [md`$x = f/f_{3\text{dB}} = 50/15.92 = 3.14$.`],
        sol: md`$x = 50\,\text{MHz}/15.92\,\text{MHz} = 3.14$:
$$|A_v| = \frac{40}{\sqrt{1 + 3.14^2}} = \frac{40}{3.30} = 12.1$$`,
      }),
      P({
        id: 'bk10-amp-c', title: 'Design: the largest load capacitance',
        q: md`A common-source stage has $R_D\parallel r_{ds} = 8\,\text{k}\Omega$ at its output. What is the largest $C_L$ that keeps $f_{3\text{dB}}\ge10\,\text{MHz}$?`,
        parts: [K.part('C_L', 1 / (2 * PI * 1e7 * 8e3), [[1e-12, 'pF']], { traps: [{ v: 1 / (1e7 * 8e3), msg: '$10\\,\\text{MHz}$ is a frequency in hertz: $\\omega = 2\\pi\\times10^7$.' }] })],
        hints: [md`$f_{3\text{dB}} = \dfrac{1}{2\pi RC_L}\ge10^7$.`],
        sol: md`$$C_L\le\frac{1}{2\pi f_{3\text{dB}}R} = \frac{1}{2\pi\times10^7\times8\times10^3} = 1.99\,\text{pF}$$`,
      }),
      P({
        id: 'bk10-amp-d', title: 'A common emitter with a load capacitor',
        q: md`Common emitter at $I_C = 0.5\,\text{mA}$ (ignore the Early effect), $R_C = 10\,\text{k}\Omega$, $C_L = 1\,\text{pF}$, base driven by an ideal source. Find $g_m$, $|A_v(0)|$, $\omega_p$, and the unity-gain frequency $f_u$.`,
        fig: K.ampCL(true, { R: '10\\,\\text{k}\\Omega', C: '1\\,\\text{pF}' }),
        parts: [K.part('g_m', 0.02, [[1e-3, 'mS']]), K.plain('|A_v(0)|', 200, 'V/V'), K.wPart('\\omega_p', 1e8),
          K.fPart('f_u', 1e8 * Math.sqrt(200 * 200 - 1) / (2 * PI), { accept: [0.02 / 1e-12 / (2 * PI)], traps: [{ v: 1e8 / (2 * PI), msg: 'That is the $-3\\,\\text{dB}$ frequency; the gain is still about 140 there.' }] })],
        hints: [md`$g_m = I_C/V_T$; $A_v(0) = -g_mR_C$; $\omega_p = 1/(R_CC_L)$; $\omega_u\approx g_m/C_L$.`],
        sol: md`$g_m = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$; $|A_v(0)| = 20\,\text{mS}\times10\,\text{k}\Omega = 200$; $\omega_p = 1/(10\,\text{k}\Omega\times1\,\text{pF}) = 10^8\,\text{rad/s}$.
$$\omega_u = \omega_p\sqrt{200^2 - 1}\approx\frac{g_m}{C_L} = \frac{20\,\text{mS}}{1\,\text{pF}} = 2\times10^{10}\,\text{rad/s},\qquad f_u = 3.18\,\text{GHz}$$`,
      }),
      P({
        id: 'bk10-amp-e', title: 'Exam style: a current-source load, then a resistor',
        q: md`A common source is biased at $I_D = 0.2\,\text{mA}$ with $V_{ov} = 0.2\,\text{V}$ and $\lambda = 0.1\,\text{V}^{-1}$, loaded by an **ideal current source** and $C_L = 0.2\,\text{pF}$. (a) Find $|A_v(0)|$, $\omega_p$ and $\omega_u$. (b) The current-source load is replaced by $R_D = 50\,\text{k}\Omega$ to $V_{DD}$ (same bias). Find the new $|A_v(0)|$ and $\omega_p$.`,
        parts: [K.plain('(a)\\ |A_v(0)|', ampE.gm * ampE.rds, 'V/V'), K.wPart('(a)\\ \\omega_p', 1 / (ampE.rds * ampE.CL)),
          K.wPart('(a)\\ \\omega_u', Math.sqrt((ampE.gm * ampE.rds) ** 2 - 1) / (ampE.rds * ampE.CL), { accept: [ampE.gm / ampE.CL], traps: [{ v: 1 / (ampE.rds * ampE.CL), msg: 'That is $\\omega_p$. The gain is 1 at about $g_mr_{ds}$ times higher: $g_m/C_L$.' }] }),
          K.plain('(b)\\ |A_v(0)|', ampE.gm * U.par(50e3, ampE.rds), 'V/V', { traps: [{ v: ampE.gm * 50e3, msg: '$r_{ds}$ is still there, in parallel with $R_D$: $50\\parallel50 = 25\\,\\text{k}\\Omega$.' }] }),
          K.wPart('(b)\\ \\omega_p', 1 / (U.par(50e3, ampE.rds) * ampE.CL))],
        hints: [md`$g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$. An ideal current source is an open for signals: $R = r_{ds}$.`, md`In (b), $R = R_D\parallel r_{ds}$.`],
        sol: md`$g_m = 2(0.2\,\text{mA})/0.2\,\text{V} = 2\,\text{mS}$, $r_{ds} = 1/(0.1\times0.2\,\text{mA}) = 50\,\text{k}\Omega$.

**(a)** The current source is an open, so $R = r_{ds} = 50\,\text{k}\Omega$:
$$|A_v(0)| = g_mr_{ds} = 100,\qquad \omega_p = \frac{1}{50\,\text{k}\Omega\times0.2\,\text{pF}} = 10^8\,\text{rad/s},\qquad \omega_u = \omega_p\sqrt{100^2 - 1} = 9.9995\times10^9\approx\frac{g_m}{C_L} = 10^{10}\,\text{rad/s}$$
**(b)** $R = 50\parallel50 = 25\,\text{k}\Omega$: $|A_v(0)| = 50$ and $\omega_p = 1/(25\,\text{k}\Omega\times0.2\,\text{pF}) = 2\times10^8\,\text{rad/s}$. Half the gain, twice the bandwidth, the same $g_m/C_L$.`,
      }),
      P({
        id: 'bk10-amp-f', title: 'Symbolic: the pole and the gain-bandwidth product',
        q: md`For the common source with $R_D$, $r_{ds}$ and $C_L$, write $\omega_p$ in terms of $R_D$, $r_{ds}$, $C_L$, and the gain-bandwidth product $|A_v(0)|\,\omega_p$ in terms of $g_m$ and $C_L$. (Type e.g. \`(RD + rds)/(RD*rds*CL)\`.)`,
        parts: [BK.ex('(RD + rds)/(RD*rds*CL)', ['RD', 'rds', 'CL'], '\\omega_p', { exact: true }), BK.ex('gm/CL', ['gm', 'CL'], '|A_v(0)|\\,\\omega_p', { exact: true })],
        hints: [md`$\omega_p = \dfrac{1}{(R_D\parallel r_{ds})C_L}$ and $R_D\parallel r_{ds} = \dfrac{R_Dr_{ds}}{R_D + r_{ds}}$.`],
        sol: md`$$\omega_p = \frac{1}{(R_D\parallel r_{ds})\,C_L} = \frac{R_D + r_{ds}}{R_Dr_{ds}C_L},\qquad |A_v(0)|\,\omega_p = g_m(R_D\parallel r_{ds})\cdot\frac{1}{(R_D\parallel r_{ds})C_L} = \frac{g_m}{C_L}$$`,
      }),
      G('bk_cscl', { need: 4 }),
    ],
  });

  // ================================================================ 7. poles and zeros
  const pzMap = (() => {
    const p = new K.Pic();
    p.arrow(20, 100, 330, 100, 'dim').arrow(260, 175, 260, 22, 'dim');
    p.lab(336, 100, '\\text{Re}\\,s', 'l').lab(260, 16, '\\text{Im}\\,s', 'b');
    p.path('M194,94L206,106M194,106L206,94', 'thick');
    p.circle(90, 100, 6.5, 'thick');
    p.lab(200, 112, '-\\omega_p', 't').lab(90, 112, '-\\omega_z', 't').lab(200, 82, '\\text{pole}', 'b').lab(90, 82, '\\text{zero}', 'b');
    return p.svg(380);
  })();
  const bufFig = [['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R_1' }],
    ['w', [1.5, 0], [2.3, 0]], ['C', [1.9, 0], [1.9, 1.6], { n: 'C_1', side: 'l' }], ['gnd', [1.9, 1.6]], ['box', [2.3, -0.4], [3.1, 0.4], { n: '$\\times1$' }],
    ['w', [3.1, 0], [3.4, 0]], ['R', [3.4, 0], [4.6, 0], { n: 'R_2' }], ['w', [4.6, 0], [5.5, 0]], ['C', [5.0, 0], [5.0, 1.6], { n: 'C_2' }], ['gnd', [5.0, 1.6]], ['term', [5.5, 0], { n: 'v_{out}' }]];
  const lagFig = [['Vac', [0, 0.4], [0, 1.9], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.9]], ['w', [0, 0.4], [0, 0], [0.3, 0]], ['R', [0.3, 0], [1.5, 0], { n: 'R_1' }],
    ['w', [1.5, 0], [2.6, 0]], ['R', [2.0, 0], [2.0, 0.95], { n: 'R_2' }], ['C', [2.0, 0.95], [2.0, 1.9], { n: 'C' }], ['gnd', [2.0, 1.9]], ['term', [2.6, 0], { n: 'v_{out}' }]];
  const twoCS = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_1' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]],
    ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [1, 0], [2.6, 0], [2.6, 1]], ['C', [1.8, 0], [1.8, 1.2], { n: 'C_1' }], ['gnd', [1.8, 1.2]],
    ['rail', [3.6, -1.2]], ['R', [3.6, -1.2], [3.6, 0], { n: 'R_2' }], ['nmos', [3.6, 1], { n: 'M_2' }], ['gnd', [3.6, 2]],
    ['w', [3.6, 0], [5.2, 0]], ['C', [4.5, 0], [4.5, 1.2], { n: 'C_2' }], ['gnd', [4.5, 1.2]], ['term', [5.2, 0], { n: 'v_{out}' }]];
  L({
    id: 'bk10-pz', title: 'Poles and zeros', ref: 'Lectures 25, 28',
    steps: [
      R(md`
        ### The question

        Lecture 25's goal is to write every transfer function in one standard form,
        $$H(s) = A_v^{DC}\,\frac{(1 + s/\omega_{z1})(1 + s/\omega_{z2})\cdots}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})\cdots}$$
        and then read the frequency response straight off it (Chapter 11). This section answers what comes first: why every circuit gives a ratio of polynomials in $s$, what poles and zeros are physically, how many poles a circuit has, and how to bring any $H(s)$ into this form.
      `),
      RF(md`
        ### The physical picture

        **Why polynomials.** Every element contributes an impedance that is a polynomial in $s$ or one over one ($R$, $1/(sC)$), and KCL only adds, multiplies and divides them. So every transfer function is a ratio of two polynomials, $H(s) = N(s)/D(s)$.

        **Poles: the circuit's own rhythm.** The RC node of [the first section](#/l/bk10-cap), left to itself, relaxes as $e^{-t/\tau}$. Its transfer function $1/(1 + s\tau)$ blows up at $s = -1/\tau$: the **pole** is the decay rate of the circuit's natural response, written as a (negative) value of $s$. There is one natural decay per independent capacitor. Poles belong to the **circuit**: every transfer function taken from the same circuit has the same denominator $D(s)$.

        **Zeros: where the signal is blocked.** A zero is a value of $s$ where $N(s) = 0$: the input cannot reach the output. A series capacitor blocks DC (a zero at $s = 0$); in Chapter 12 a capacitor from input to output lets a signal sneak forward and cancel the main path (a zero at $g_m/C_{gd}$). Zeros depend on the **path** from input to output.

        [[fig:map]]
      `, { map: { svg: pzMap, cap: 'The $s$-plane: our poles and ordinary zeros sit on the negative real axis, at $s = -\\omega_p$ and $s = -\\omega_z$.' } }),
      R(md`
        ### From factors to the standard form

        Once $N$ and $D$ are factored, each root gives a factor $(s - \text{root})$. For our circuits the roots are negative, $-\omega_p$, so the factor is $(s + \omega_p)$. Pull the corner out of each factor:
        $$s + \omega_p = \omega_p\left(1 + \frac{s}{\omega_p}\right)$$
        Do it to every factor, top and bottom, and collect the pulled-out numbers in one constant:
        $$H(s) = \frac{K(s + \omega_z)}{(s + \omega_{p1})(s + \omega_{p2})} = \frac{K\,\omega_z}{\omega_{p1}\omega_{p2}}\cdot\frac{1 + s/\omega_z}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})}$$

        !!key The standard form
          $$H(s) = k\,\frac{\prod(1 + s/\omega_z)}{\prod(1 + s/\omega_p)},\qquad k = H(0),\ \text{the DC gain}$$
          Every factor equals 1 at $s = 0$, so $k$ is the gain at DC, which you can also get from the circuit directly with the capacitors open.

        Why this form: each factor $(1 + s/\omega)$ is about 1 below its own $\omega$ and only "switches on" near it. So the low-frequency gain is $k$, and each corner acts at its own frequency. That is the whole idea of the Bode plot.

        **An $s$ with no "1 +".** A factor $s$ alone (a zero at the origin, from a series capacitor) cannot be normalized this way; it stays as $s$, or as $s/\omega_0$ for some convenient $\omega_0$. The high-pass of [the previous section](#/l/bk10-hp) is $\frac{s/\omega_L}{1 + s/\omega_L}$.
      `),
      R(md`
        ### How many poles? One per independent capacitor

        Each capacitor that can hold its own voltage adds one power of $s$ to $D(s)$, so one pole. "Independent" leaves out:
        - capacitors in **parallel**: they share one voltage and merge into one, $C_1 + C_2$;
        - capacitors in **series** with nothing else at the node between them: they merge into one;
        - a capacitor that closes a **loop of capacitors**: KVL fixes its voltage from the others.

        For example, a node with $C_L$ and a wiring capacitance $C_w$, both to ground, has one pole, at $1/(R(C_L + C_w))$.
      `),
      RF(md`
        ### Two capacitors that do not interact

        [[fig:buf]]

        If a buffer (or a transistor gate, which draws no current) separates two RC sections, each section is [the RC low-pass](#/l/bk10-rc), and their transfer functions simply multiply:
        $$H(s) = \frac{1}{1 + sR_1C_1}\cdot\frac{1}{1 + sR_2C_2}$$
        Poles at $1/(R_1C_1)$ and $1/(R_2C_2)$: one per node. Two cascaded common-source stages, each with its own node capacitance, are exactly this:

        [[fig:two]]

        $$H(s) = \frac{-g_{m1}R_1}{1 + sR_1C_1}\cdot\frac{-g_{m2}R_2}{1 + sR_2C_2}$$
        Lecture 28 calls this "a pole at each node" ([Chapter 12](#/l/bk12-node)).
      `, { buf: { fig: bufFig, cap: 'Two RC sections with a unity-gain buffer between them.' }, two: { fig: twoCS, cap: 'Two common-source stages. The gate of $M_2$ draws no current, so the two output nodes do not load each other.' } }),
      RF(md`
        ### Two capacitors that interact

        [[fig:lad]]

        Without the buffer, $C_2$ charges through $R_1$ too, and the sections load each other. KCL at node 1 ($v_1$) and at the output ($v_2$):
        $$\frac{v_{in} - v_1}{R_1} = sC_1v_1 + \frac{v_1 - v_2}{R_2},\qquad \frac{v_1 - v_2}{R_2} = sC_2v_2$$
        The second equation gives $v_1 = v_2(1 + sR_2C_2)$, and also $\frac{v_1 - v_2}{R_2} = sC_2v_2$ for the last term of the first. Multiply the first equation by $R_1$ and substitute both:
        $$v_{in} - v_2(1 + sR_2C_2) = sR_1C_1v_2(1 + sR_2C_2) + sR_1C_2v_2$$
        $$v_{in} = v_2\left[1 + s(R_1C_1 + R_1C_2 + R_2C_2) + s^2R_1R_2C_1C_2\right]$$

        !!key Two interacting RC sections
          $$H(s) = \frac{1}{1 + b_1s + b_2s^2},\qquad b_1 = R_1C_1 + R_1C_2 + R_2C_2,\qquad b_2 = R_1R_2C_1C_2$$
          Two capacitors, two poles, but **not** at $1/(R_1C_1)$ and $1/(R_2C_2)$: the extra term $R_1C_2$ is the interaction.
      `, { lad: { fig: K.ladderFig(1, 1, 1, 1, false), cap: 'Two RC sections in a row, no buffer.' } }),
      R(md`
        ### Finding the poles of $1 + b_1s + b_2s^2$

        **Exactly:** the roots of $b_2s^2 + b_1s + 1 = 0$,
        $$s = \frac{-b_1\pm\sqrt{b_1^2 - 4b_2}}{2b_2}$$
        **Quickly, when the poles are far apart.** Multiply out two factors:
        $$\left(1 + \frac{s}{\omega_{p1}}\right)\left(1 + \frac{s}{\omega_{p2}}\right) = 1 + s\left(\frac{1}{\omega_{p1}} + \frac{1}{\omega_{p2}}\right) + \frac{s^2}{\omega_{p1}\omega_{p2}}$$
        So $b_1 = \frac{1}{\omega_{p1}} + \frac{1}{\omega_{p2}}$ and $b_2 = \frac{1}{\omega_{p1}\omega_{p2}}$. If $\omega_{p2}\gg\omega_{p1}$, the sum is dominated by $1/\omega_{p1}$:

        !!key The dominant-pole approximation
          $$\omega_{p1}\approx\frac{1}{b_1},\qquad \omega_{p2}\approx\frac{b_1}{b_2}$$
          Lecture 28 uses exactly this for the common-source stage ([Chapter 12](#/l/bk12-exact)), and Chapter 13's open-circuit time constants compute $b_1$ without solving anything ([Chapter 13](#/l/bk13-why)).

        For the ladder with equal sections ($R_1 = R_2 = R$, $C_1 = C_2 = C$): $b_1 = 3RC$, $b_2 = (RC)^2$, and the exact poles are $\frac{3\mp\sqrt5}{2}\cdot\frac{1}{RC} = \frac{0.382}{RC}$ and $\frac{2.618}{RC}$, while the naive guess says $1/RC$ twice. The estimate $1/b_1 = 0.333/RC$ is $13\%$ low: these poles are not far apart.
      `),
      RF(md`
        ### A finite zero: the lag network

        [[fig:lag]]

        $R_1$ in series, then $R_2$ in series with $C$ to ground. The bottom branch has impedance $R_2 + \frac{1}{sC} = \frac{1 + sR_2C}{sC}$, so the divider gives (multiply top and bottom by $sC$)
        $$H(s) = \frac{R_2 + \frac{1}{sC}}{R_1 + R_2 + \frac{1}{sC}} = \frac{1 + sR_2C}{1 + s(R_1 + R_2)C}$$
        A zero at $\omega_z = 1/(R_2C)$ and a pole at $\omega_p = 1/((R_1 + R_2)C)$, below the zero.

        **Check the ends.** At DC the capacitor is open and $H = 1$. At high frequency it is a short and $H = R_2/(R_1 + R_2)$, which is also $\omega_p/\omega_z$. The zero is where the bottom branch stops getting smaller: above $\omega_z$ the capacitor is a short and only $R_2$ is left, so the output stops falling.
      `, { lag: { fig: lagFig, cap: 'The lag network: a pole, then a zero.' } }),
      R(md`
        ### Check it, every time

        - **$H(0)$ from the circuit** with all capacitors open must equal $k$.
        - **$H(\infty)$ from the circuit** with all capacitors shorted must equal the limit of the formula: $k\prod\omega_p/\prod\omega_z$ when there are as many zeros as poles, and $0$ when there are more poles.
        - **The count:** the number of poles equals the number of independent capacitors.

        ### What it means

        The denominator is the circuit's fingerprint: set the input to zero and the circuit still has its natural decays $e^{-\omega_pt}$. The constant $k$ is the DC gain you already know how to find. The zeros say how the particular path from input to output is wired.

        ### How to recognize it

        - Count capacitors (merging parallel ones): that is the number of poles.
        - A capacitor in series with the signal: a zero at $s = 0$. A capacitor shunting a resistor in a branch (like $R_2 + 1/(sC)$): a finite zero.
        - A gate or a buffer between sections: the poles are simply $1/(R_{node}C_{node})$, one per node.
      `),
      R(md`
        ### Worked example: into the standard form

        $$H(s) = \frac{2\times10^9\,(s + 10^4)}{(s + 10^5)(s + 10^7)}$$
        Pull out every corner: $s + 10^4 = 10^4(1 + s/10^4)$, $s + 10^5 = 10^5(1 + s/10^5)$, $s + 10^7 = 10^7(1 + s/10^7)$:
        $$H(s) = \frac{2\times10^9\times10^4}{10^5\times10^7}\cdot\frac{1 + s/10^4}{(1 + s/10^5)(1 + s/10^7)} = 20\,\frac{1 + s/10^4}{(1 + s/10^5)(1 + s/10^7)}$$
        DC gain $k = 20$, a zero at $10^4$, poles at $10^5$ and $10^7\,\text{rad/s}$. Check: $H(0) = \dfrac{2\times10^9\times10^4}{10^5\times10^7} = 20$. ✓

        ### Worked example: from a quadratic

        $$H(s) = \frac{10^{12}}{s^2 + 1.01\times10^6\,s + 10^{10}}$$
        $k = H(0) = 10^{12}/10^{10} = 100$. The denominator's roots: two numbers with sum $1.01\times10^6$ and product $10^{10}$, which are $10^4$ and $10^6$. So $H(s) = \dfrac{100}{(1 + s/10^4)(1 + s/10^6)}$. The shortcut agrees: $\omega_{p2}\approx1.01\times10^6$ (the $s$ coefficient) and $\omega_{p1}\approx10^{10}/(1.01\times10^6) = 9.9\times10^3$.
      `),
      R(md`
        !!mistake Common mistakes
          - **Reading the leading constant as the DC gain.** In $\frac{K(s + a)}{(s + b)(s + c)}$ the DC gain is $Ka/(bc)$, not $K$.
          - **A pole at $+\omega_p$.** The pole is at $s = -\omega_p$, in the left half-plane; $\omega_p$ is the positive corner frequency.
          - **Counting parallel capacitors twice.** They are one capacitor.
          - **Treating interacting sections as independent.** $1/(R_1C_1)$ and $1/(R_2C_2)$ are the poles only when a buffer separates the sections.
      `),
      Q(md`What is the DC gain of $H(s) = \dfrac{10^9}{(s + 10^3)(s + 10^5)}$?`,
        ['$10$', '$10^9$', '$1$', '$10^{-8}$'], 0,
        [null, 'That is the leading constant. Put $s = 0$: each $(s + \\omega)$ factor contributes its $\\omega$.', 'Compute $10^9/(10^3\\times10^5)$.', 'Upside down.'],
        md`$H(0) = 10^9/(10^3\times10^5) = 10$. Standard form: $\dfrac{10}{(1 + s/10^3)(1 + s/10^5)}$.`),
      Q(md`A circuit has two capacitors in parallel at one node and a third capacitor at another node (with resistors around them). How many poles does it have?`,
        ['$2$', '$3$', '$1$', 'It depends on where you take the output'], 0,
        [null, 'The parallel pair holds one voltage: it is one capacitor, $C_1 + C_2$.', 'There are two independent capacitor voltages.', 'The poles belong to the circuit; every output shares them (zeros can cancel one, but the circuit still has two).'],
        md`Merge the parallel pair into one capacitor. Two independent capacitor voltages, so $D(s)$ is second order: two poles.`),
      Q(md`Which statement about poles and zeros is true?`,
        ['All transfer functions of one circuit share the same poles; zeros depend on the input-output path', 'Zeros are the natural decay rates of the circuit', 'Each zero must sit below a pole', 'A pole is a frequency where the gain is zero'], 0,
        [null, 'The natural decays are the **poles**.', 'Zeros can sit anywhere: the lag network has its zero above its pole, the CS stage has one in the right half-plane.', 'At a pole the transfer function blows up; zero gain is a zero.'],
        md`The denominator comes from the circuit with its input set to zero (its natural response), so it is common to every input-output pair. The numerator depends on how the input reaches the output.`),
      P({
        id: 'bk10-pz-a', title: 'Into standard form',
        q: md`$$H(s) = \frac{5\times10^7\,(s + 200)}{(s + 10^3)(s + 10^6)}$$
Find $k$, $\omega_z$, $\omega_{p1}$ and $\omega_{p2}$ of the standard form.`,
        parts: [K.plain('k', 10, 'V/V', { traps: [{ v: 5e7, msg: 'Pull each corner out of its factor first.' }] }), K.wPart('\\omega_z', 200), K.wPart('\\omega_{p1}', 1e3), K.wPart('\\omega_{p2}', 1e6)],
        hints: [md`$k = H(0) = \dfrac{5\times10^7\times200}{10^3\times10^6}$.`],
        sol: md`$$H(s) = \frac{5\times10^7\times200}{10^3\times10^6}\cdot\frac{1 + s/200}{(1 + s/10^3)(1 + s/10^6)} = 10\,\frac{1 + s/200}{(1 + s/10^3)(1 + s/10^6)}$$
So $k = 10$, $\omega_z = 200$, $\omega_{p1} = 10^3$ and $\omega_{p2} = 10^6\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk10-pz-b', title: 'From a quadratic denominator',
        q: md`$$H(s) = \frac{10^{12}}{s^2 + 1.01\times10^6\,s + 10^{10}}$$
Find $k$ and the two poles.`,
        parts: [K.plain('k', 100, 'V/V', { traps: [{ v: 1e12, msg: 'Divide by the constant term: $k = H(0)$.' }] }), K.wPart('\\omega_{p1}', 1e4), K.wPart('\\omega_{p2}', 1e6)],
        hints: [md`Two numbers with sum $1.01\times10^6$ and product $10^{10}$.`],
        sol: md`$k = 10^{12}/10^{10} = 100$. The roots of $s^2 + 1.01\times10^6s + 10^{10}$ are $-10^4$ and $-10^6$ (sum $1.01\times10^6$, product $10^{10}$), so $\omega_{p1} = 10^4$ and $\omega_{p2} = 10^6\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk10-pz-c', title: 'The lag network with numbers',
        q: md`Lag network with $R_1 = 9\,\text{k}\Omega$, $R_2 = 1\,\text{k}\Omega$, $C = 10\,\text{nF}$. Find the pole, the zero, and $H(\infty)$.`,
        fig: lagFig,
        parts: [K.wPart('\\omega_p', 1 / (10e3 * 10e-9), { traps: [{ v: 1 / (9e3 * 10e-9), msg: 'The pole uses $R_1 + R_2$: with the source zeroed, the capacitor sees $R_2$ plus $R_1$ in series.' }] }), K.wPart('\\omega_z', 1 / (1e3 * 10e-9)), K.plain('H(\\infty)', 0.1, 'V/V')],
        hints: [md`$H(s) = \dfrac{1 + sR_2C}{1 + s(R_1 + R_2)C}$.`],
        sol: md`$$\omega_p = \frac{1}{(R_1 + R_2)C} = \frac{1}{10\,\text{k}\Omega\times10\,\text{nF}} = 10^4\,\text{rad/s},\qquad \omega_z = \frac{1}{R_2C} = \frac{1}{1\,\text{k}\Omega\times10\,\text{nF}} = 10^5\,\text{rad/s}$$
$$H(\infty) = \frac{R_2}{R_1 + R_2} = 0.1 = \frac{\omega_p}{\omega_z}\ ✓$$`,
      }),
      P({
        id: 'bk10-pz-d', title: 'Two equal RC sections, interacting',
        q: md`An RC ladder has $R_1 = R_2 = 10\,\text{k}\Omega$ and $C_1 = C_2 = 1\,\text{pF}$. Find $b_1$, and the exact poles $\omega_{p1}$ and $\omega_{p2}$.`,
        fig: K.ladderFig(10e3, 1e-12, 10e3, 1e-12),
        parts: [K.tPart('b_1', 30e-9, { traps: [{ v: 20e-9, msg: 'Include the interaction term $R_1C_2$.' }] }),
          K.wPart('\\omega_{p1}', (3 - Math.sqrt(5)) / 2 * 1e8, { traps: [{ v: 1e8, msg: 'The sections load each other: solve $b_2s^2 + b_1s + 1 = 0$.' }, { v: 1e8 / 3, msg: 'That is the estimate $1/b_1$; the exact root is $13\\%$ higher.' }] }),
          K.wPart('\\omega_{p2}', (3 + Math.sqrt(5)) / 2 * 1e8)],
        hints: [md`$b_1 = R_1C_1 + R_1C_2 + R_2C_2$, $b_2 = R_1R_2C_1C_2 = (10\,\text{ns})^2$.`],
        sol: md`$RC = 10\,\text{ns}$, so $b_1 = 3RC = 30\,\text{ns}$ and $b_2 = (RC)^2 = 10^{-16}\,\text{s}^2$.
$$\omega = \frac{b_1\mp\sqrt{b_1^2 - 4b_2}}{2b_2} = \frac{3\mp\sqrt5}{2}\cdot\frac{1}{RC}:\qquad \omega_{p1} = 3.82\times10^7,\quad \omega_{p2} = 2.62\times10^8\,\text{rad/s}$$
Neither is $1/RC = 10^8$: the loading splits the two poles apart.`,
      }),
      P({
        id: 'bk10-pz-e', title: 'Exam style: two stages, two poles',
        q: md`Two cascaded common-source stages (see the figure above): $g_{m1} = 2\,\text{mS}$ with $R_1 = 10\,\text{k}\Omega$ and $C_1 = 0.5\,\text{pF}$ at its output; $g_{m2} = 4\,\text{mS}$ with $R_2 = 5\,\text{k}\Omega$ and $C_2 = 2\,\text{pF}$ at its output ($R_1$, $R_2$ include $r_{ds}$). Find the DC gain (with its sign), the two poles (low first), and $|H|$ at $\omega = 10^8\,\text{rad/s}$.`,
        fig: twoCS,
        parts: [K.plain('H(0)', 400, 'V/V', { traps: [{ v: -400, msg: 'Two inverting stages: $(-20)(-20) = +400$.' }] }), K.wPart('\\omega_{p1}', 1e8), K.wPart('\\omega_{p2}', 2e8),
          K.plain('|H(j10^8)|', 400 / (Math.SQRT2 * Math.sqrt(1.25)), 'V/V', { traps: [{ v: 400 / Math.SQRT2, msg: 'The second pole, at $2\\times10^8$, already costs $|1 + j0.5| = 1.118$ here.' }] })],
        hints: [md`The gate of $M_2$ draws no current: each node is its own RC. $H(s) = \dfrac{(-g_{m1}R_1)(-g_{m2}R_2)}{(1 + sR_1C_1)(1 + sR_2C_2)}$.`],
        sol: md`**DC gain:** $(-g_{m1}R_1)(-g_{m2}R_2) = (-20)(-20) = +400$.

**Poles, one per node:** node 1: $1/(R_1C_1) = 1/(10\,\text{k}\Omega\times0.5\,\text{pF}) = 2\times10^8$; node 2: $1/(R_2C_2) = 1/(5\,\text{k}\Omega\times2\,\text{pF}) = 10^8\,\text{rad/s}$. So $\omega_{p1} = 10^8$ (the output node) and $\omega_{p2} = 2\times10^8\,\text{rad/s}$.
$$H(s) = \frac{400}{(1 + s/10^8)(1 + s/2\times10^8)},\qquad |H(j10^8)| = \frac{400}{|1 + j|\,|1 + j0.5|} = \frac{400}{1.414\times1.118} = 253$$`,
      }),
      P({
        id: 'bk10-pz-f', title: 'A zero at the origin: the band-pass',
        q: md`$$H(s) = \frac{10^8\,s}{(s + 10^2)(s + 10^6)}$$
This is what an amplifier with a coupling capacitor and a load capacitor looks like. Find the gain in the middle of the band, the lower corner and the upper corner.`,
        parts: [K.plain('\\text{mid-band gain}', 100, 'V/V', { traps: [{ v: 1e8 / 1e8, msg: 'In the middle of the band, $(s + 10^2)\\approx s$ (the lower corner is passed) and $(s + 10^6)\\approx10^6$.' }] }), K.wPart('\\omega_L', 100), K.wPart('\\omega_H', 1e6)],
        hints: [md`Between the corners, $s + 10^2\approx s$ and $s + 10^6\approx10^6$.`],
        sol: md`Write it as $H(s) = \dfrac{10^8\,s}{10^2\cdot10^6\,(1 + s/10^2)(1 + s/10^6)} = \dfrac{s/10^2}{(1 + s/10^2)(1 + s/10^6)}\times100$.

Between the corners, $\frac{s/10^2}{1 + s/10^2}\approx1$ (a high-pass above its corner) and $1 + s/10^6\approx1$: the mid-band gain is $100$. The lower corner is $\omega_L = 10^2\,\text{rad/s}$ (from the zero at the origin and the pole at $10^2$) and the upper corner $\omega_H = 10^6\,\text{rad/s}$.`,
      }),
      G('bk_std', { need: 4 }),
      G('bk_poly', { need: 3 }),
    ],
  });

  // ================================================================ 8. Chapter 10 problems
  const leadFig = [['Vac', [0, 0.4], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.4, 0]], ['w', [0.4, 0], [0.4, -0.6], [0.8, -0.6]],
    ['w', [0.4, 0], [0.4, 0.6], [0.8, 0.6]], ['R', [0.8, -0.6], [2.0, -0.6], { n: 'R_1' }], ['C', [0.8, 0.6], [2.0, 0.6], { n: 'C', side: 'b' }], ['w', [2.0, -0.6], [2.4, -0.6], [2.4, 0.6], [2.0, 0.6]],
    ['w', [2.4, 0], [3.6, 0]], ['R', [3.0, 0], [3.0, 1.6], { n: 'R_2' }], ['gnd', [3.0, 1.6]], ['term', [3.6, 0], { n: 'v_{out}' }]];
  const ceBand = [['Vac', [-1.6, 1.4], [-1.6, 2.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.6, 2.4]], ['w', [-1.6, 1.4], [-1.6, 1], [-1.4, 1]], ['R', [-1.4, 1], [-0.4, 1], { n: 'R_S' }],
    ['C', [-0.4, 1], [0.6, 1], { n: 'C_C' }], ['w', [0.6, 1], [2, 1]], ['R', [1.1, 1], [1.1, 2.4], { n: 'R_B', side: 'l' }], ['gnd', [1.1, 2.4]],
    ['npn', [3, 1]], ['gnd', [3, 2]], ['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_C' }], ['w', [3, 0], [4.6, 0]], ['C', [3.9, 0], [3.9, 1.2], { n: 'C_L' }], ['gnd', [3.9, 1.2]], ['term', [4.6, 0], { n: 'v_{out}' }]];
  const pn = { ID: 0.25e-3, Vov: 0.25, lam: 0.04, RD: 20e3, CL: 0.4e-12 };
  pn.gm = 2 * pn.ID / pn.Vov; pn.rds = 1 / (pn.lam * pn.ID); pn.R = U.par(pn.RD, pn.rds); pn.A0 = pn.gm * pn.R; pn.wp = 1 / (pn.R * pn.CL);
  const po = { RS: 2e3, CC: 2.2e-6, RB: 50e3, IC: 0.5e-3, beta: 100, RC: 10e3, CL: 2e-12 };
  po.gm = po.IC / 0.025; po.rpi = po.beta / po.gm; po.Rin = U.par(po.RB, po.rpi); po.AM = po.Rin / (po.RS + po.Rin) * po.gm * po.RC;
  const pp = { g1: 2e-3, R1: 20e3, C1: 0.2e-12, g2: 2e-3, R2: 10e3, C2: 1e-12 };
  pp.w1 = 1 / (pp.R1 * pp.C1); pp.w2 = 1 / (pp.R2 * pp.C2);
  { const a = Math.min(pp.w1, pp.w2), b = Math.max(pp.w1, pp.w2), r2 = (b / a) ** 2, u = (-(1 + 1 / r2) + Math.sqrt((1 + 1 / r2) ** 2 + 4 / r2)) / (2 / r2); pp.w3 = a * Math.sqrt(u); pp.lo = a; pp.hi = b; }
  const lad = { R1: 1e3, C1: 10e-12, R2: 10e3, C2: 1e-12 };
  lad.b1 = lad.R1 * lad.C1 + lad.R1 * lad.C2 + lad.R2 * lad.C2; lad.b2 = lad.R1 * lad.R2 * lad.C1 * lad.C2;
  lad.w1 = (lad.b1 - Math.sqrt(lad.b1 ** 2 - 4 * lad.b2)) / (2 * lad.b2); lad.w2 = (lad.b1 + Math.sqrt(lad.b1 ** 2 - 4 * lad.b2)) / (2 * lad.b2);
  L({
    id: 'bk10-problems', title: 'Chapter 10 problems', kind: 'review', ref: 'Lectures 25, 28',
    steps: [
      RF(md`
        ### Chapter 10 in one page

        **1. A capacitor resists changes of voltage:** $i = C\,dv/dt$, because changing $v$ by $dv$ means moving charge $C\,dv$. Its voltage cannot jump; at DC it is open. A step through $R$ gives $v_C = V_0(1 - e^{-t/\tau})$ with $\tau = RC$, $R$ being the resistance the capacitor sees with the sources zeroed. $63\%$ at $\tau$, $90\%$ at $2.3\tau$, $99\%$ at $4.6\tau$; $\text{k}\Omega\times\text{pF} = \text{ns}$. ([section](#/l/bk10-cap))

        [[fig:step]]

        **2. Impedance:** for sines, $d/dt\to j\omega$, so $Z_C = 1/(j\omega C) = 1/(sC)$; impedances combine like resistors. A capacitor is open at low frequency and a short at high frequency, crossing $R$ at $\omega = 1/RC$. ([section](#/l/bk10-phasor))

        **3. Complex numbers:** lengths multiply, angles add. $|1 + jx| = \sqrt{1 + x^2}$, $\angle(1 + jx) = \tan^{-1}x$: about $1$ and $0^\circ$ for small $x$, $\sqrt2$ and $45^\circ$ at $x = 1$, about $x$ and $90^\circ$ for large $x$. ([section](#/l/bk10-complex))

        [[fig:tri]]
      `, { step: { svg: curveFig, cap: 'The RC step: $\\tau$ is the time the first slope would need.' }, tri: { svg: triFig, cap: 'The triangle of $1 + jx$.' } }),
      RF(md`
        **4. The RC low-pass:** a divider with $1/(sC)$, $H(s) = 1/(1 + sRC)$. The corner $\omega_p = 1/RC$ is the $-3\,\text{dB}$ frequency (gain $0.707$, phase $-45^\circ$); above it the gain falls as $\omega_p/\omega$. With a source resistance $R_1$ and a load $R_2$: DC gain $R_2/(R_1 + R_2)$, pole $1/((R_1\parallel R_2)C)$. ([section](#/l/bk10-rc))

        **5. The high-pass and the coupling capacitor:** $H(s) = sRC/(1 + sRC)$: a zero at $s = 0$ blocks DC. Between $R_S$ and $R_{in}$ the capacitor sees $R_S + R_{in}$: $\omega_L = 1/((R_S + R_{in})C_C)$. ([section](#/l/bk10-hp))

        [[fig:cc]]

        **6. The common source with $C_L$ (Lecture 25):** only $R_{out}$ changes, $R\parallel\frac{1}{sC_L}$, so $A_v(s) = -g_mR/(1 + sRC_L)$ with $R = R_D\parallel r_{ds}$ and $\omega_p = 1/(RC_L)$. Gain times bandwidth is $g_m/C_L$, which is also the unity-gain frequency. The CE stage is identical with $R_C\parallel r_o$. ([section](#/l/bk10-amp))

        [[fig:cs]]

        **7. Poles and zeros:** standard form $k\prod(1 + s/\omega_z)/\prod(1 + s/\omega_p)$ with $k = H(0)$; pull each corner out of its $(s + \omega)$. One pole per independent capacitor; buffered sections have poles $1/(R_iC_i)$, interacting ones need $1 + b_1s + b_2s^2$, with $\omega_{p1}\approx1/b_1$ and $\omega_{p2}\approx b_1/b_2$ when they are far apart. ([section](#/l/bk10-pz))
      `, { cc: { fig: K.hpFig(1, 1, 1, false), cap: 'Coupling capacitor: $\\omega_L = 1/((R_S + R_{in})C_C)$.' }, cs: { fig: csOut, cap: 'The CS output node: $g_mv_{in}$ into $R_D\\parallel r_{ds}\\parallel C_L$.' } }),
      P({
        id: 'bk10-pr-a', title: 'Time constant with real part values',
        q: md`$R = 4.7\,\text{k}\Omega$ and $C = 2.2\,\text{nF}$. Find $\tau$ and the time for a step response to settle within $1\%$.`,
        parts: [K.tPart('\\tau', 4.7e3 * 2.2e-9), K.tPart('t_{1\\%}', 4.7e3 * 2.2e-9 * ln(100), { traps: [{ v: 5 * 4.7e3 * 2.2e-9, msg: '$5\\tau$ is within $0.7\\%$; exactly $1\\%$ is $\\tau\\ln100 = 4.6\\tau$.' }] })],
        hints: [md`$\text{k}\Omega\times\text{nF} = \mu\text{s}$.`],
        sol: md`$\tau = 4.7\,\text{k}\Omega\times2.2\,\text{nF} = 10.34\,\mu\text{s}$; $t_{1\%} = \tau\ln100 = 4.605\tau = 47.6\,\mu\text{s}$.`,
      }),
      P({
        id: 'bk10-pr-b', title: 'A current ramps a capacitor',
        q: md`A constant $2\,\text{mA}$ flows into a $4\,\text{pF}$ capacitor. At what rate does its voltage rise (V/ns), and how long does it take to rise by $3\,\text{V}$?`,
        parts: [K.plain('dv/dt', 2e-3 / 4e-12 * 1e-9, 'V/ns'), K.tPart('t', 3 / (2e-3 / 4e-12))],
        hints: [md`$dv/dt = I/C$; a constant current gives a straight ramp.`],
        sol: md`$dv/dt = 2\,\text{mA}/4\,\text{pF} = 5\times10^{8}\,\text{V/s} = 0.5\,\text{V/ns}$. A constant current makes a straight ramp, so $3\,\text{V}$ takes $3/0.5 = 6\,\text{ns}$.`,
      }),
      P({
        id: 'bk10-pr-c', title: 'A biased node',
        q: md`A node has $R_1 = 30\,\text{k}\Omega$ to $V_{DD}$, $R_2 = 15\,\text{k}\Omega$ to ground and $C = 3\,\text{pF}$ to ground. What is its time constant?`,
        parts: [K.tPart('\\tau', U.par(30e3, 15e3) * 3e-12, { traps: [{ v: 45e3 * 3e-12, msg: '$V_{DD}$ is a short to ground when zeroed: $R_1$ and $R_2$ are in parallel, not series.' }, { v: 15e3 * 3e-12, msg: 'Include $R_1$: zeroed, $V_{DD}$ is ground, so $R_1$ also goes from the node to ground.' }] })],
        hints: [md`Zero $V_{DD}$; both resistors then run from the node to ground.`],
        sol: md`$R = 30\parallel15 = 10\,\text{k}\Omega$, so $\tau = 10\,\text{k}\Omega\times3\,\text{pF} = 30\,\text{ns}$.`,
      }),
      P({
        id: 'bk10-pr-d', title: 'A big capacitor at two frequencies',
        q: md`Find $|Z_C|$ for $C = 100\,\text{nF}$ at $1\,\text{kHz}$ and at $1\,\text{MHz}$.`,
        parts: [K.rPart('|Z_C|\\ \\text{at}\\ 1\\,\\text{kHz}', 1 / (2 * PI * 1e3 * 100e-9)), K.rPart('|Z_C|\\ \\text{at}\\ 1\\,\\text{MHz}', 1 / (2 * PI * 1e6 * 100e-9))],
        hints: [md`$|Z_C| = 1/(2\pi fC)$; a thousand times the frequency is a thousandth of the impedance.`],
        sol: md`At $1\,\text{kHz}$: $1/(2\pi\times10^3\times10^{-7}) = 1.59\,\text{k}\Omega$. At $1\,\text{MHz}$: $1.59\,\Omega$. The same part is a modest resistor at audio frequency and nearly a short at radio frequency.`,
      }),
      P({
        id: 'bk10-pr-e', title: 'A product of two arrows',
        q: md`Find the magnitude and angle of $(1 + j)(1 + j\sqrt3)$.`,
        parts: [K.plain('|z|', 2 * Math.SQRT2, ''), K.plain('\\angle z', 105, '°', { tol: { abs: 0.3 } })],
        hints: [md`$1 + j$: $\sqrt2$ at $45^\circ$. $1 + j\sqrt3$: $2$ at $60^\circ$.`],
        sol: md`$|z| = \sqrt2\times2 = 2.83$ and $\angle z = 45^\circ + 60^\circ = 105^\circ$. (Rectangular: $(1 + j)(1 + j\sqrt3) = (1 - \sqrt3) + j(1 + \sqrt3) = -0.732 + 2.732j$, which has length $2.83$ and, since its real part is negative, angle $180^\circ - 75^\circ = 105^\circ$.)`,
      }),
      P({
        id: 'bk10-pr-f', title: 'Evaluate a two-pole gain',
        q: md`$H(s) = \dfrac{50}{(1 + s/10^4)(1 + s/10^6)}$. Find $|H|$ and $\angle H$ at $\omega = 2\times10^4\,\text{rad/s}$.`,
        parts: [K.plain('|H|', 50 / (Math.sqrt(5) * Math.sqrt(1.0004)), ''), K.plain('\\angle H', -(Math.atan(2) + Math.atan(0.02)) * 180 / PI, '°', { tol: { abs: 0.3 } })],
        hints: [md`$x_1 = 2$, $x_2 = 0.02$.`],
        sol: md`$$|H| = \frac{50}{\sqrt{1 + 4}\,\sqrt{1 + 0.0004}} = \frac{50}{2.236\times1.0002} = 22.36,\qquad \angle H = -\tan^{-1}2 - \tan^{-1}0.02 = -63.43^\circ - 1.15^\circ = -64.58^\circ$$`,
      }),
      P({
        id: 'bk10-pr-g', title: 'An audio low-pass',
        q: md`An RC low-pass uses $R = 3.3\,\text{k}\Omega$ and $C = 4.7\,\text{nF}$. Find $f_p$ and $|H|$ at $20\,\text{kHz}$.`,
        parts: [K.fPart('f_p', 1 / (2 * PI * 3.3e3 * 4.7e-9)), K.plain('|H(20\\,\\text{kHz})|', 1 / Math.sqrt(1 + (20e3 * 2 * PI * 3.3e3 * 4.7e-9) ** 2), '')],
        hints: [md`$f_p = 1/(2\pi RC)$, then $x = f/f_p$.`],
        sol: md`$RC = 15.51\,\mu\text{s}$, $f_p = 1/(2\pi\times15.51\,\mu\text{s}) = 10.26\,\text{kHz}$. At $20\,\text{kHz}$, $x = 1.949$ and $|H| = 1/\sqrt{1 + 3.80} = 0.456$.`,
      }),
      P({
        id: 'bk10-pr-h', title: 'A loaded node',
        q: md`A source with $R_1 = 2\,\text{k}\Omega$ drives a load $R_2 = 8\,\text{k}\Omega$; the node has $C = 10\,\text{pF}$. Find $H(0)$ and $f_p$.`,
        fig: K.lpFig(2e3, 8e3, 10e-12),
        parts: [K.plain('H(0)', 0.8, 'V/V'), K.fPart('f_p', 1 / (2 * PI * U.par(2e3, 8e3) * 10e-12), { traps: [{ v: 1 / (2 * PI * 2e3 * 10e-12), msg: 'The capacitor sees $R_1\\parallel R_2 = 1.6\\,\\text{k}\\Omega$.' }] })],
        hints: [md`$R_1\parallel R_2 = 1.6\,\text{k}\Omega$.`],
        sol: md`$H(0) = 8/(2 + 8) = 0.8$. $R = 2\parallel8 = 1.6\,\text{k}\Omega$, $\tau = 16\,\text{ns}$, $f_p = 1/(2\pi\times16\,\text{ns}) = 9.95\,\text{MHz}$.`,
      }),
      P({
        id: 'bk10-pr-i', title: 'A coupling capacitor from a 50-ohm source',
        q: md`A $50\,\Omega$ source drives an amplifier input of $1\,\text{k}\Omega$ through $C_C = 1\,\mu\text{F}$. Find the mid-band $v_{in}/v_s$ and $f_L$.`,
        fig: K.hpFig(50, 1e3, 1e-6),
        parts: [K.plain('H_M', 1e3 / 1050, 'V/V'), K.fPart('f_L', 1 / (2 * PI * 1050 * 1e-6), { traps: [{ v: 1 / (2 * PI * U.par(50, 1e3) * 1e-6), msg: 'Series: $R_S + R_{in} = 1050\\,\\Omega$.' }] })],
        hints: [md`$\omega_L = 1/((R_S + R_{in})C_C)$.`],
        sol: md`$H_M = 1000/1050 = 0.952$. $f_L = 1/(2\pi\times1050\,\Omega\times1\,\mu\text{F}) = 152\,\text{Hz}$.`,
      }),
      P({
        id: 'bk10-pr-j', title: 'A common source with a load capacitor',
        q: md`$g_m = 5\,\text{mS}$, $R_D = 4\,\text{k}\Omega$, $r_{ds} = 20\,\text{k}\Omega$, $C_L = 1\,\text{pF}$. Find $|A_v(0)|$, $f_{3\text{dB}}$ and the unity-gain frequency $f_u$.`,
        fig: K.ampCL(false, { R: '4\\,\\text{k}\\Omega', C: '1\\,\\text{pF}' }),
        parts: [K.plain('|A_v(0)|', 5e-3 * U.par(4e3, 20e3), 'V/V', { traps: [{ v: 20, msg: 'Include $r_{ds}$: $R = 4\\parallel20 = 3.33\\,\\text{k}\\Omega$.' }] }),
          K.fPart('f_{3dB}', 1 / (2 * PI * U.par(4e3, 20e3) * 1e-12)),
          K.fPart('f_u', Math.sqrt((5e-3 * U.par(4e3, 20e3)) ** 2 - 1) / (2 * PI * U.par(4e3, 20e3) * 1e-12), { accept: [5e-3 / 1e-12 / (2 * PI)] })],
        hints: [md`$R = R_D\parallel r_{ds}$; $\omega_p = 1/(RC_L)$; $\omega_u\approx g_m/C_L$.`],
        sol: md`$R = 4\parallel20 = 3.33\,\text{k}\Omega$, $|A_v(0)| = 5\,\text{mS}\times3.33\,\text{k}\Omega = 16.7$.
$$\omega_p = \frac{1}{3.33\,\text{k}\Omega\times1\,\text{pF}} = 3\times10^8\,\text{rad/s}\Rightarrow f_{3\text{dB}} = 47.7\,\text{MHz}$$
$$\omega_u = \omega_p\sqrt{16.7^2 - 1} = 4.99\times10^9\,\text{rad/s}\Rightarrow f_u = 794\,\text{MHz}\quad(g_m/2\pi C_L = 796\,\text{MHz})$$`,
      }),
      P({
        id: 'bk10-pr-k', title: 'Standard form',
        q: md`$$H(s) = \frac{4\times10^{10}\,(s + 50)}{(s + 10^4)(s + 2\times10^6)}$$
Find $k$, $\omega_z$, $\omega_{p1}$, $\omega_{p2}$.`,
        parts: [K.plain('k', 100, 'V/V', { traps: [{ v: 4e10, msg: 'Pull the corners out: $k = H(0)$.' }] }), K.wPart('\\omega_z', 50), K.wPart('\\omega_{p1}', 1e4), K.wPart('\\omega_{p2}', 2e6)],
        hints: [md`$k = \dfrac{4\times10^{10}\times50}{10^4\times2\times10^6}$.`],
        sol: md`$$k = \frac{4\times10^{10}\times50}{10^4\times2\times10^6} = \frac{2\times10^{12}}{2\times10^{10}} = 100$$
$$H(s) = 100\,\frac{1 + s/50}{(1 + s/10^4)(1 + s/2\times10^6)}$$`,
      }),
      P({
        id: 'bk10-pr-l', title: 'Derive it: the lead network',
        q: md`$R_1$ in parallel with $C$, in series from the input to the output; $R_2$ from the output to ground. Show that $H(s) = \dfrac{R_2}{R_1 + R_2}\cdot\dfrac{1 + sR_1C}{1 + s(R_1\parallel R_2)C}$, then find $H(0)$, $\omega_z$ and $\omega_p$ for $R_1 = 9\,\text{k}\Omega$, $R_2 = 1\,\text{k}\Omega$, $C = 1\,\text{nF}$.`,
        fig: leadFig,
        parts: [K.plain('H(0)', 0.1, 'V/V'), K.wPart('\\omega_z', 1 / (9e3 * 1e-9)), K.wPart('\\omega_p', 1 / (U.par(9e3, 1e3) * 1e-9), { traps: [{ v: 1 / (10e3 * 1e-9), msg: 'The capacitor sees $R_1\\parallel R_2$ (zero the source: $R_2$ reaches ground directly, $R_1$ through the source).' }] })],
        hints: [md`The top branch is $Z_1 = R_1\parallel\frac{1}{sC} = \dfrac{R_1}{1 + sR_1C}$. Divider: $H = \dfrac{R_2}{R_2 + Z_1}$.`],
        sol: md`$$H = \frac{R_2}{R_2 + \frac{R_1}{1 + sR_1C}} = \frac{R_2(1 + sR_1C)}{R_2(1 + sR_1C) + R_1} = \frac{R_2}{R_1 + R_2}\cdot\frac{1 + sR_1C}{1 + s\frac{R_1R_2}{R_1 + R_2}C}$$
With numbers: $H(0) = 1/10 = 0.1$; $\omega_z = 1/(R_1C) = 1/(9\,\mu\text{s}) = 1.11\times10^5\,\text{rad/s}$; $R_1\parallel R_2 = 900\,\Omega$, so $\omega_p = 1/(0.9\,\mu\text{s}) = 1.11\times10^6\,\text{rad/s}$. At high frequency $C$ shorts $R_1$ and $H\to1$ ($= 0.1\times\omega_p/\omega_z$ ✓).`,
      }),
      P({
        id: 'bk10-pr-m', title: 'A ladder with unequal sections',
        q: md`RC ladder (no buffer): $R_1 = 1\,\text{k}\Omega$, $C_1 = 10\,\text{pF}$, $R_2 = 10\,\text{k}\Omega$, $C_2 = 1\,\text{pF}$. Find $b_1$ and the exact poles. (With a buffer between the sections, both poles would sit at $10^8\,\text{rad/s}$.)`,
        fig: K.ladderFig(lad.R1, lad.C1, lad.R2, lad.C2),
        parts: [K.tPart('b_1', lad.b1, { traps: [{ v: lad.R1 * lad.C1 + lad.R2 * lad.C2, msg: 'Include the interaction term $R_1C_2$.' }] }), K.wPart('\\omega_{p1}', lad.w1, { traps: [{ v: 1e8, msg: 'That is the buffered answer. Solve $b_2s^2 + b_1s + 1 = 0$.' }] }), K.wPart('\\omega_{p2}', lad.w2)],
        hints: [md`$b_1 = R_1C_1 + R_1C_2 + R_2C_2$, $b_2 = R_1R_2C_1C_2$.`],
        sol: md`$b_1 = 10 + 1 + 10 = 21\,\text{ns}$ and $b_2 = (10\,\text{ns})(10\,\text{ns}) = 10^{-16}\,\text{s}^2$.
$$\omega = \frac{b_1\mp\sqrt{b_1^2 - 4b_2}}{2b_2} = \frac{(21\mp\sqrt{441 - 400})\times10^{-9}}{2\times10^{-16}} = \frac{21\mp6.40}{2}\times10^{7}\,\text{rad/s}$$
$\omega_{p1} = 7.30\times10^7$ and $\omega_{p2} = 1.37\times10^8\,\text{rad/s}$: the interaction pushes the two equal poles apart.`,
      }),
      P({
        id: 'bk10-pr-n', title: 'Exam style 1: a common-source stage from bias to bandwidth', big: true,
        q: md`A common source is biased at $I_D = 0.25\,\text{mA}$ with $V_{ov} = 0.25\,\text{V}$ and $\lambda = 0.04\,\text{V}^{-1}$; $R_D = 20\,\text{k}\Omega$; it drives $C_L = 0.4\,\text{pF}$ (ignore the transistor's own capacitances).
(a) $g_m$ and $r_{ds}$. (b) $|A_v(0)|$. (c) $f_{3\text{dB}}$. (d) The unity-gain frequency $f_u$. (e) After a small input step, how long until the output is within $1\%$ of its final value?`,
        fig: K.ampCL(false, { R: '20\\,\\text{k}\\Omega', C: '0.4\\,\\text{pF}' }),
        parts: [K.part('(a)\\ g_m', pn.gm, [[1e-3, 'mS']]), K.rPart('(a)\\ r_{ds}', pn.rds), K.plain('(b)\\ |A_v(0)|', pn.A0, 'V/V', { traps: [{ v: pn.gm * pn.RD, msg: 'Include $r_{ds}$ in parallel with $R_D$.' }] }),
          K.fPart('(c)\\ f_{3dB}', pn.wp / (2 * PI), { traps: [{ v: pn.wp, msg: 'That is $\\omega_p$ in rad/s.' }] }),
          K.fPart('(d)\\ f_u', pn.wp * Math.sqrt(pn.A0 ** 2 - 1) / (2 * PI), { accept: [pn.gm / pn.CL / (2 * PI)] }),
          K.tPart('(e)\\ t_{1\\%}', ln(100) / pn.wp, { traps: [{ v: 1 / pn.wp, msg: 'One $\\tau$ is only $63\\%$. Within $1\\%$ takes $4.6\\tau$.' }] })],
        hints: [md`$g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$, $R = R_D\parallel r_{ds}$.`, md`$\omega_p = 1/(RC_L)$; $\omega_u = \omega_p\sqrt{(g_mR)^2 - 1}$; the step settles with $\tau = RC_L$.`],
        sol: md`**(a)** $g_m = 2(0.25\,\text{mA})/0.25\,\text{V} = 2\,\text{mS}$; $r_{ds} = 1/(0.04\times0.25\,\text{mA}) = 100\,\text{k}\Omega$.

**(b)** $R = 20\parallel100 = 16.67\,\text{k}\Omega$; $|A_v(0)| = 2\,\text{mS}\times16.67\,\text{k}\Omega = 33.3$.

**(c)** $\tau = RC_L = 16.67\,\text{k}\Omega\times0.4\,\text{pF} = 6.67\,\text{ns}$, $\omega_p = 1.5\times10^8\,\text{rad/s}$, $f_{3\text{dB}} = 23.9\,\text{MHz}$.

**(d)** $\omega_u = \omega_p\sqrt{33.3^2 - 1} = 5.00\times10^9\,\text{rad/s}$ ($g_m/C_L = 5\times10^9$), $f_u = 795\,\text{MHz}$.

**(e)** The output node relaxes with $\tau = 6.67\,\text{ns}$: $t_{1\%} = \tau\ln100 = 4.6\tau = 30.7\,\text{ns}$.`,
      }),
      P({
        id: 'bk10-pr-o', title: 'Exam style 2: the band of a common emitter', big: true,
        q: md`A source ($R_S = 2\,\text{k}\Omega$) drives a common emitter through $C_C = 2.2\,\mu\text{F}$; the base bias network is $R_B = 50\,\text{k}\Omega$ to incremental ground. $I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 10\,\text{k}\Omega$ (ignore $r_o$), and the output drives $C_L = 2\,\text{pF}$.
(a) $R_{in}$ at the base. (b) The mid-band gain magnitude $|v_{out}/v_s|$. (c) The lower corner $f_L$. (d) The upper corner $f_H$.`,
        fig: ceBand,
        parts: [K.rPart('(a)\\ R_{in}', po.Rin, { traps: [{ v: po.rpi, msg: '$R_B$ is in parallel with $r_\\pi$ at the base.' }] }),
          K.plain('(b)\\ |v_{out}/v_s|', po.AM, 'V/V', { traps: [{ v: po.gm * po.RC, msg: 'That is $v_{out}/v_{in}$. The source divider $R_{in}/(R_S + R_{in})$ comes first.' }] }),
          K.fPart('(c)\\ f_L', 1 / (2 * PI * (po.RS + po.Rin) * po.CC), { traps: [{ v: 1 / (2 * PI * U.par(po.RS, po.Rin) * po.CC), msg: 'Series around $C_C$: $R_S + R_{in}$.' }] }),
          K.fPart('(d)\\ f_H', 1 / (2 * PI * po.RC * po.CL))],
        hints: [md`$g_m = I_C/V_T = 20\,\text{mS}$, $r_\pi = \beta/g_m = 5\,\text{k}\Omega$.`, md`The two capacitors act at frequencies a million times apart, so treat them one at a time: $C_C$ (with $C_L$ open) sets $f_L$, $C_L$ (with $C_C$ shorted) sets $f_H$.`],
        sol: md`**(a)** $g_m = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$, $r_\pi = 100/20\,\text{mS} = 5\,\text{k}\Omega$, $R_{in} = 50\parallel5 = 4.545\,\text{k}\Omega$.

**(b)** Mid-band ($C_C$ short, $C_L$ open): $\left|\dfrac{v_{out}}{v_s}\right| = \dfrac{R_{in}}{R_S + R_{in}}\,g_mR_C = \dfrac{4.545}{6.545}\times20\,\text{mS}\times10\,\text{k}\Omega = 0.694\times200 = 138.9$.

**(c)** $f_L = \dfrac{1}{2\pi(R_S + R_{in})C_C} = \dfrac{1}{2\pi\times6.545\,\text{k}\Omega\times2.2\,\mu\text{F}} = 11.1\,\text{Hz}$.

**(d)** $f_H = \dfrac{1}{2\pi R_CC_L} = \dfrac{1}{2\pi\times10\,\text{k}\Omega\times2\,\text{pF}} = 7.96\,\text{MHz}$.

The whole transfer function is a high-pass times a low-pass: $\dfrac{v_{out}}{v_s} = -138.9\,\dfrac{s/\omega_L}{1 + s/\omega_L}\cdot\dfrac{1}{1 + s/\omega_H}$.`,
      }),
      P({
        id: 'bk10-pr-p', title: 'Exam style 3: two stages and the real bandwidth', big: true,
        q: md`Two cascaded common-source stages: $g_{m1} = g_{m2} = 2\,\text{mS}$; node 1 has $R_1 = 20\,\text{k}\Omega$ and $C_1 = 0.2\,\text{pF}$; the output node has $R_2 = 10\,\text{k}\Omega$ and $C_2 = 1\,\text{pF}$.
(a) The DC gain. (b) The two poles, low first. (c) The exact $-3\,\text{dB}$ frequency $\omega_{3\text{dB}}$ (solve $|H| = H(0)/\sqrt2$). Compare it with the lower pole.`,
        fig: twoCS,
        parts: [K.plain('(a)\\ H(0)', pp.g1 * pp.R1 * pp.g2 * pp.R2, 'V/V', { traps: [{ v: -pp.g1 * pp.R1 * pp.g2 * pp.R2, msg: 'Two inversions: the sign is $+$.' }] }), K.wPart('(b)\\ \\omega_{p1}', pp.lo), K.wPart('(b)\\ \\omega_{p2}', pp.hi),
          K.wPart('(c)\\ \\omega_{3dB}', pp.w3, { traps: [{ v: pp.lo, msg: 'That is the dominant-pole estimate. The second pole is only $2.5\\times$ higher, so it pulls the real $-3\\,\\text{dB}$ point lower: solve $(1 + x^2)(1 + x^2/6.25) = 2$.' }] })],
        hints: [md`Each node: pole at $1/(R_iC_i)$. $H(0) = (g_{m1}R_1)(g_{m2}R_2)$.`, md`With $x = \omega/\omega_{p1}$ and $\omega_{p2}/\omega_{p1} = 2.5$: $(1 + x^2)(1 + x^2/6.25) = 2$, a quadratic in $u = x^2$.`],
        sol: md`**(a)** $H(0) = (-40)(-20) = +800$.

**(b)** Node 1: $1/(20\,\text{k}\Omega\times0.2\,\text{pF}) = 2.5\times10^8$; output node: $1/(10\,\text{k}\Omega\times1\,\text{pF}) = 10^8\,\text{rad/s}$. So $\omega_{p1} = 10^8$ and $\omega_{p2} = 2.5\times10^8\,\text{rad/s}$.

**(c)** $|H|^2 = H(0)^2/[(1 + x^2)(1 + x^2/6.25)]$ with $x = \omega/10^8$. Setting it to $H(0)^2/2$, with $u = x^2$:
$$(1 + u)\left(1 + \frac{u}{6.25}\right) = 2\;\Rightarrow\;0.16u^2 + 1.16u - 1 = 0\;\Rightarrow\;u = \frac{-1.16 + \sqrt{1.3456 + 0.64}}{0.32} = 0.7785$$
$x = 0.882$, so $\omega_{3\text{dB}} = 8.82\times10^7\,\text{rad/s}$ ($14.0\,\text{MHz}$): $12\%$ below the lower pole, because the second pole is close. (Chapter 13 returns to this.)`,
      }),
      P({
        id: 'bk10-pr-q', title: 'What buys bandwidth?',
        q: md`A common source with $C_L$ has $|A_v(0)| = g_mR$ and $\omega_p = 1/(RC_L)$. Which single change raises the bandwidth **without** changing the DC gain?`,
        parts: [{ lbl: 'Choose one', mc: ['Halve $C_L$', 'Halve $R_D$', 'Double $g_m$', 'Double $R_D$'], a: 0,
          why: [null, 'Halving $R$ doubles $\\omega_p$ but also halves the gain $g_mR$.', 'A bigger $g_m$ raises the gain; $\\omega_p = 1/(RC_L)$ does not contain $g_m$.', 'That raises the gain and lowers the bandwidth.'] }],
        hints: [md`Look at which quantities appear in $g_mR$ and which in $1/(RC_L)$.`],
        sol: md`$C_L$ appears only in $\omega_p$: halving it doubles the bandwidth and leaves $g_mR$ alone (and doubles the gain-bandwidth product $g_m/C_L$).`,
      }),
      G('bk_tau', { need: 8, pool: ['bk_tau', 'bk_zc', 'bk_cplx', 'bk_lp', 'bk_hp', 'bk_cscl', 'bk_std', 'bk_poly'] }),
    ],
  });

  // @@END
})();

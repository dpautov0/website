/* Unit 15 — open-circuit time constants (Lectures 34–36; the uploaded "OCTC" notes). Why 1/sum(tau) estimates the
   bandwidth, the recipe, the two pictures (a capacitor from a node to ground; a capacitor bridging a transconductor),
   then CS/CE, degeneration, CG and the cascode, followers and the BJT twins, and which capacitor limits the bandwidth.
   Every number below was checked against an exact complex nodal solve: each R_jo by a test source with the other
   capacitors removed, and each "exact" bandwidth by sweeping the full transfer function. Drills: gens-e3-octc.js. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const OC = window.E3OC;
  const FIG = OC.FIG;
  const L = (l) => E3.lesson('e3u15', l);
  const ex = (...a) => E3.ex(...a);

  // ---------------------------------------------------------------- local figures
  // a node with something up, something down, and a capacitor to ground
  const nodeFig = [
    ['acg', [1, -1.4], { dir: 'u' }], ['R', [1, -1.4], [1, 0], { n: 'R_{UP}' }], ['R', [1, 0], [1, 1.4], { n: 'R_{DN}' }], ['gnd', [1, 1.4]],
    ['node', [1, 0], { n: 'X', side: 'l', dot: true }], ['w', [1, 0], [2.4, 0]], ['C', [2.4, 0], [2.4, 1.4], { n: '\\boxed{C}' }], ['gnd', [2.4, 1.4]],
  ];
  // the test-source picture for C_gd of a common source (small-signal, v_in zeroed, the other capacitors removed)
  const csTestFig = [
    ['R', [1, 0], [1, 1.4], { n: 'R_S', side: 'l' }], ['gnd', [1, 1.4]], ['node', [1, 0], { n: 'v_1', side: 'l', dot: true }],
    ['w', [1, 0], [1, -0.9]], ['I', [1, -0.9], [3, -0.9], { n: 'i_t' }], ['w', [3, -0.9], [3, 0]],
    ['node', [3, 0], { n: 'v_2', side: 'a' }], ['w', [2.4, 0], [4.2, 0]],
    ['G', [3, 0], [3, 1.4], { n: 'g_mv_1', side: 'l' }], ['gnd', [3, 1.4]], ['R', [4.2, 0], [4.2, 1.4], { n: 'R_L' }], ['gnd', [4.2, 1.4]],
    ['txt', [2, -1.55], '$v_t = v_2 - v_1$'],
  ];
  const fig = (k, hi) => FIG[k]({ hi });

  // ================================================================ 1. why one number works
  L({
    id: 'e3-u15-why', title: 'Why one number: the sum of time constants', ref: 'Lecture 34 (OCTC notes, page 1–2)',
    steps: [
      R(md`
        ### Why this lesson

        The last problem on Exam 3 is likely "estimate the bandwidth of this amplifier". Lecture 28 found the poles of a common-source stage exactly, and even with three capacitors that took a page of algebra and a quadratic. The **open-circuit time-constant method** (OCTC) gets a good estimate with nothing but the Exam 2 skill you already have: the resistance seen between two points. This first lesson explains why one number, a sum of time constants, is enough.
      `),
      R(md`
        ### Step 1: write the denominator out

        An amplifier with $n$ capacitors and no zeros that matter has an all-pole transfer function:
        $$\frac{v_o(s)}{v_i(s)} = \frac{a_0}{(\tau_1s + 1)(\tau_2s + 1)\cdots(\tau_ns + 1)} = \frac{a_0}{D(s)}$$
        Multiply the brackets out:
        $$D(s) = b_ns^n + b_{n-1}s^{n-1} + \dots + b_1s + 1,\qquad b_1 = \tau_1 + \tau_2 + \dots + \tau_n$$
        The coefficient of the plain $s$ is just the **sum of the pole time constants** (the other coefficients are products: $b_n = \tau_1\tau_2\cdots\tau_n$).
      `),
      R(md`
        ### Step 2: near the bandwidth, only $b_1$ matters

        If one pole is much lower than the others (a **dominant pole**), then at frequencies up to the $-3\,\text{dB}$ point the $s^2, s^3,\dots$ terms are tiny next to $b_1s$. Keep only the first two terms:
        $$D(s)\approx b_1s + 1\quad\Rightarrow\quad\frac{v_o}{v_i}\approx\frac{a_0}{b_1s + 1}$$
        That is a one-pole system, so
        $$\boxed{\;\omega_{-3dB}\approx\frac{1}{b_1} = \frac{1}{\sum_i\tau_i}\;}$$

        ### Step 3: the trick that makes it useful

        We never want to find the poles. The good news (and the reason the method exists): **$b_1$ can be computed one capacitor at a time.** For each capacitor $C_j$, remove all the other capacitors, find the resistance $R_{jo}$ it sees, and
        $$b_1 = \sum_j R_{jo}C_j\qquad\text{(exactly)}$$
        Each $R_{jo}C_j$ is an **open-circuit time constant** ("open" because the other capacitors are removed, which is what they look like at low frequency).

        You can check it on Lecture 28's exact common-source result: there $b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$. Regroup it by capacitor:
        $$b = R_{TH}\,C_{in} + \big[R_{TH} + R_L + g_mR_{TH}R_L\big]C_{xy} + R_L\,C_{out}$$
        Three capacitors, each times one resistance. Those three resistances are exactly what the next lessons teach you to read off the circuit.
      `),
      Q(md`An amplifier has two poles, at $10\,\text{Mrad/s}$ and $100\,\text{Mrad/s}$. What does $1/\sum\tau$ estimate for the bandwidth?`,
        ['$9.09\\,\\text{Mrad/s}$', '$10\\,\\text{Mrad/s}$', '$110\\,\\text{Mrad/s}$', '$55\\,\\text{Mrad/s}$'], 0,
        [null, 'That is the dominant pole alone. The estimate adds the second time constant too: $100\\,\\text{ns} + 10\\,\\text{ns}$.', 'You added the pole frequencies. Add the time constants $\\tau = 1/\\omega$ instead.', 'That averages the poles; the method adds time constants.'],
        md`$\tau_1 = 1/10\,\text{Mrad/s} = 100\,\text{ns}$, $\tau_2 = 10\,\text{ns}$. $\sum\tau = 110\,\text{ns}$, so $\omega_{-3dB}\approx 1/110\,\text{ns} = 9.09\,\text{Mrad/s}$. The exact value is $9.90\,\text{Mrad/s}$: the dominant pole sets it, the second pole pulls it down a little.`),
      R(md`
        ### How good is it? The second-order example

        Two poles: $D(s) = \tau_1\tau_2s^2 + (\tau_1 + \tau_2)s + 1$. At the estimate $\hat\omega = 1/(\tau_1 + \tau_2)$, each of $\tau_1\hat\omega$ and $\tau_2\hat\omega$ is less than 1, so the dropped term $\tau_1\tau_2\hat\omega^2$ is small, and very small when the poles are far apart.

        **Worst case: two equal poles**, $\tau_1 = \tau_2 = \tau$. The estimate is $\hat\omega = \tfrac{1}{2\tau} = 0.5/\tau$. The true $-3\,\text{dB}$ point (set $|D(j\omega)|^2 = 2$) is
        $$\omega_{-3dB} = \frac{\sqrt{\sqrt2 - 1}}{\tau} = \frac{0.644}{\tau}$$
        So even in the worst case the estimate is only 22% low, and it is **always low**: the dropped $-\tau_1\tau_2\omega^2$ term only ever helps.

        !!key The estimate is pessimistic
          The actual bandwidth is (almost always) at least as high as $1/\sum\tau$. On an exam, "estimate the bandwidth" means: report $1/\sum R_{jo}C_j$ and do not try to correct it.
      `),
      Q(md`OCTC gives $\omega_{-3dB}\approx 50\,\text{Mrad/s}$ for an amplifier. The exact bandwidth is:`,
        ['at least $50\\,\\text{Mrad/s}$ (the estimate is pessimistic)', 'at most $50\\,\\text{Mrad/s}$', 'exactly $50\\,\\text{Mrad/s}$', 'impossible to say without the poles'], 0,
        [null, 'The other way round: dropping the $s^2$ term makes the estimate low, not high.', 'Only for a true one-pole system.', 'You can bound it: the estimate is low by at most about 22% (two equal poles).'],
        md`Dropping $b_2s^2$ (and higher) underestimates the bandwidth. For two equal poles the truth is $0.644/\tau$ against the estimated $0.5/\tau$; with a dominant pole they agree closely.`),
      P({
        id: 'e3u15-two-equal', title: 'The worst case, in numbers',
        q: md`An amplifier has two equal poles with $\tau_1 = \tau_2 = 10\,\text{ns}$. (a) What bandwidth does OCTC estimate? (b) What is the true $-3\,\text{dB}$ frequency?`,
        parts: [{ lbl: '\\hat\\omega_{-3dB}', unit: 'Mrad/s', ans: 50 }, { lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: 64.359 }],
        hints: [md`(a) $1/(\tau_1 + \tau_2)$.`, md`(b) $\omega_{-3dB} = \sqrt{\sqrt2 - 1}/\tau$.`],
        sol: md`(a) $\sum\tau = 20\,\text{ns}$, so $\hat\omega = 1/20\,\text{ns} = 50\,\text{Mrad/s}$.

(b) $D(j\omega) = 1 - \tau^2\omega^2 + j\,2\tau\omega$. Setting $|D|^2 = 2$: $(1 - \tau^2\omega^2)^2 + 4\tau^2\omega^2 = 2$, i.e. $(1 + \tau^2\omega^2)^2 = 2$, so $\tau^2\omega^2 = \sqrt2 - 1$ and
$$\omega_{-3dB} = \frac{\sqrt{\sqrt2 - 1}}{10\,\text{ns}} = \frac{0.6436}{10\,\text{ns}} = 64.4\,\text{Mrad/s}$$
The estimate is 22% low, the most it is ever off for two poles.`,
      }),
      R(md`### Drill: estimate against truth`),
      G('e3_octc_est', { need: 3 }),
    ],
  });

  // ================================================================ 2. the recipe and the two pictures
  L({
    id: 'e3-u15-recipe', title: 'The recipe, and the two pictures you need', ref: 'Lecture 34',
    steps: [
      R(md`
        ### Why this lesson

        This is the whole method, and it is your Exam 2 impedance skill pointed at capacitors. If you can find the resistance at a node and the resistance between two nodes, you can do every OCTC problem. The rest of the unit is the same two pictures on different circuits.

        ### The recipe (the boxed procedure in the notes)

        1. **Zero the input.** A signal voltage source becomes a short (its series resistance $R_S$ stays). A signal current source becomes an open.
        2. **Pick one capacitor $C_j$. Remove every other capacitor** (open circuit).
        3. **Stand at $C_j$'s two ends and find the resistance $R_{jo}$** between them, with a test source if needed.
        4. $\tau_{jo} = R_{jo}C_j$. Repeat for every capacitor.
        5. $$\omega_{-3dB}\approx\frac{1}{\sum_j R_{jo}C_j}\ \text{rad/s},\qquad f_{-3dB} = \frac{\omega_{-3dB}}{2\pi}\ \text{Hz}$$

        Watch the last step: $1/\sum\tau$ is in **radians per second**. Divide by $2\pi$ only if the question asks for hertz.
      `),
      R(md`
        ### Picture 1: a capacitor from a node to ground

        One end of the capacitor is on a node, the other on ground. Ground includes the triangles (incremental grounds), $V_{DD}$, $V_{CC}$, and a grounded gate, base or source.

        **It sees that node's resistance**, exactly the $R_{UP}\parallel R_{DN}$ of Exam 2 ([a node is $R_{UP}\parallel R_{DN}$](#/l/e2-u7-node)). Use the terminal rules from [gate, drain, source](#/l/e2-u7-three):
        - a capacitor on a **drain or collector** node (the output) sees something big: about the load, $R_L\parallel r_{ds}$;
        - a capacitor on a **source or emitter** node sees something small: about $1/g_m$ in parallel with whatever else is there;
        - a capacitor on a **gate** node sees only the resistors on that node (the gate itself is open). On a **base** node, add $r_\pi$ (or $r_\pi + (\beta + 1)R_E$) in parallel.
      `, nodeFig),
      Q(md`In this common-source stage, the boxed $C_L$ hangs from the output to ground. With $v_{in}$ zeroed and $C_{gs}$, $C_{gd}$ removed (ignore $r_{ds}$), what does it see?`,
        ['$R_L$', '$R_L\\parallel R_S$', '$R_L + (1 + g_mR_L)R_S$', '$R_L\\parallel\\tfrac1{g_m}$'], 0,
        [null, 'With $C_{gd}$ removed nothing connects the output to the gate side.', 'That is the bridging capacitor $C_{gd}$.', 'The output is a drain: it looks big ($r_{ds}$), not $1/g_m$.'],
        md`Picture 1: a node to ground. With the gate held at zero (through $R_S$, no current), the transistor is just $r_{ds}$ (ignored), leaving $R_L$.`,
        { fig: fig('cs', 'CL') }),
      R(md`
        ### Picture 2: a capacitor that bridges two nodes of a transconductor

        Now the capacitor connects two moving nodes: the controlling node of a transistor (gate or base, call it node 1) and the node its current lands on (drain or collector, node 2). Remove the capacitor and look at what each end has to ground:
        - node 1 has $R_{left}$ to ground;
        - node 2 has $R_{right}$ to ground, and the transistor pulls $G_mv_1$ out of it.

        Put a test current $i_t$ where the capacitor was, out of node 1 and into node 2:
        - Node 1: $i_t$ leaves, so it must come up through $R_{left}$: $v_1 = -i_tR_{left}$.
        - Node 2: $i_t$ arrives and leaves through $R_{right}$ and the transconductor: $i_t = v_2/R_{right} + G_mv_1$, so $v_2 = i_tR_{right}(1 + G_mR_{left})$.

        $$R = \frac{v_2 - v_1}{i_t} = \boxed{\,R_{left} + R_{right} + G_mR_{left}R_{right}\,}$$

        Read the last term as $R_{left}\times(G_mR_{right})$: the left resistance times the **gain** from node 1 to node 2. That gain term is the Miller effect (Unit 14) showing up as a resistance. In an amplifier with gain 20, it makes a $0.2\,\text{pF}$ capacitor the biggest time constant in the circuit.
      `, OC.bridgeFig(1)),
      Q(md`$R_{left} = 2\kO$, $R_{right} = 5\kO$, $G_m = 4\,\text{mS}$. What does the bridging capacitor see?`,
        ['$47\\kO$', '$7\\kO$', '$1.43\\kO$', '$40\\kO$'], 0,
        [null, 'You dropped the gain term $G_mR_{left}R_{right} = 40\\kO$.', 'Bridging sees the two sides in series plus the gain term, never in parallel.', 'That is the gain term alone; add $R_{left} + R_{right}$.'],
        md`$2 + 5 + (4\,\text{mS})(2\kO)(5\kO) = 2 + 5 + 40 = 47\kO$. The gain from node 1 to node 2 is $G_mR_{right} = 20$, so the left side is multiplied by $1 + 20 = 21$: $5 + 21\times2 = 47$.`),
      R(md`
        ### Recognize which picture in one second

        Look at the capacitor's two ends:
        - **one end on ground, a triangle, or a supply rail** → picture 1 (that node's resistance);
        - **both ends on moving nodes**, one at a gate/base and the other at the drain/collector of the **same** transistor, inverting stage → picture 2 ($R_{left} + R_{right} + G_mR_{left}R_{right}$);
        - **both ends moving**, gate/base and source/emitter of a follower → a bridge across a non-inverting gain, where the gain term **divides** instead (the followers lesson).

        The trap: the same physical capacitor changes picture with the circuit. $C_{gd}$ bridges gate and drain in a common source (picture 2), but in a common gate the gate is an incremental ground, so $C_{gd}$ is just a capacitor from the output to ground (picture 1).
      `),
      Q(md`Common gate: the gate sits on a bias (triangle). What does the boxed $C_{gd}$ see?`,
        ['The output node\'s resistance, about $R_L$, with no Miller term', '$R_S + R_L + g_mR_SR_L$', '$R_S\\parallel\\tfrac1{g_m}$', '$\\infty$'], 0,
        [null, 'That is the common-source Miller answer. Here one end of $C_{gd}$ is the gate, which is an incremental ground.', 'That is $C_{gs}$, which hangs on the source node.', 'It has a path: the output node to ground.'],
        md`The gate is incremental ground, so $C_{gd}$ runs from the drain to ground: picture 1. It sits in parallel with $C_L$ and sees $R_L\parallel(r_{ds} + R_S + g_mr_{ds}R_S)\approx R_L$. No Miller multiplication: one reason a common gate is fast.`,
        { fig: fig('cg', 'Cgd') }),
      Q(md`Common source: what picture is the boxed $C_{gd}$?`,
        ['Picture 2: it bridges gate and drain of an inverting stage', 'Picture 1: drain to ground', 'Picture 1: gate to ground', 'Neither: it is shorted by $v_{in}$'], 0,
        [null, 'Its other end is on the gate, which moves (through $R_S$).', 'Its other end is the drain, which moves.', 'Zeroing $v_{in}$ grounds the far side of $R_S$, not the gate.'],
        md`Both ends move: gate (left, $R_S$ to ground) and drain (right, $R_L$ to ground). So $R = R_S + R_L + g_mR_SR_L$.`,
        { fig: fig('cs', 'Cgd') }),
      P({
        id: 'e3u15-bridge-sym', title: 'The bridging rule, symbolically',
        q: md`Write the resistance seen by a capacitor bridging node 1 ($R_1$ to ground) and node 2 ($R_2$ to ground) when a transconductor pulls $g_mv_1$ out of node 2.`,
        fig: OC.bridgeFig(1),
        parts: [ex('R1 + R2 + gm*R1*R2', ['gm', 'R1', 'R2'], 'R', { exact: true })],
        hints: [md`$v_1 = -i_tR_1$, then KCL at node 2.`],
        sol: md`$v_1 = -i_tR_1$. At node 2: $i_t = v_2/R_2 + g_mv_1 = v_2/R_2 - g_mi_tR_1$, so $v_2 = i_tR_2(1 + g_mR_1)$. Then $R = (v_2 - v_1)/i_t = R_2 + g_mR_1R_2 + R_1$.`,
      }),
      R(md`### Drill: the bridging rule`),
      G('e3_octc_bridge', { need: 3 }),
      R(md`### Drill: which picture, which resistance (every circuit in this unit)`),
      G('e3_octc_which', { need: 6 }),
    ],
  });

  // ================================================================ 3. common source and common emitter
  L({
    id: 'e3-u15-cs', title: 'Common source and common emitter', ref: 'Lecture 35 (OCTC notes, page 3)',
    steps: [
      R(md`
        ### Why this lesson

        The common-source / common-emitter stage is the one you will most likely see. Three capacitors, three pictures, and one of them (the Miller capacitor) usually decides the answer. The resistances are all Exam 2 ones: the gate node, the drain node ([common-source output](#/l/e2-u8-cs)), and the bridge between them.

        The circuit: $v_{in}$ through $R_S$ into the gate; $R_L$ from the drain to $V_{DD}$; $C_{gs}$ gate to source (= ground), $C_{gd}$ gate to drain, $C_L$ drain to ground.
      `, fig('cs')),
      R(md`
        ### $C_{gs}$: gate node to ground (picture 1)

        The source is grounded, so $C_{gs}$ runs from the gate node to ground. With $v_{in}$ zeroed and $C_{gd}$, $C_L$ removed, the gate node has $R_S$ to ground and nothing else (the gate draws no current):
        $$R_{gs} = R_S,\qquad\tau_{gs} = R_SC_{gs}$$

        ### $C_L$: drain node to ground (picture 1)

        The gate sits at 0, so $v_{gs} = 0$ and the transistor is only $r_{ds}$. The drain node is the stage's output resistance:
        $$R_{L,o} = R_L\parallel r_{ds},\qquad\tau_L = (R_L\parallel r_{ds})C_L$$

        ### $C_{gd}$: the bridge (picture 2)

        Left end on the gate ($R_S$), right end on the drain ($R_L$, or $R_L\parallel r_{ds}$), and the transistor pulls $g_mv_{gs}$ out of the drain. The test-source picture from the notes:
      `, csTestFig),
      R(md`
        - $v_1 = -i_tR_S$ (the test current leaves the gate node, so it comes up through $R_S$).
        - At the drain: $i_t = g_mv_1 + v_2/R_L = -g_mi_tR_S + v_2/R_L$, so $v_2 = i_t(1 + g_mR_S)R_L$.
        - $v_t = v_2 - v_1 = i_t(1 + g_mR_S)R_L + i_tR_S$.

        $$R_{gd} = (1 + g_mR_S)R_L + R_S = R_L + (1 + g_mR_L)R_S = R_S + R_L + g_mR_SR_L$$

        The three forms are the same number. The middle one says it best: the input resistance $R_S$ multiplied by $1 + g_mR_L$, one plus the stage's gain. **The Miller effect, as a resistance.**

        $$\sum\tau = R_SC_{gs} + \big[R_L + (1 + g_mR_L)R_S\big]C_{gd} + R_LC_L$$
      `),
      Q(md`You double $R_L$ to double the gain of a common source. What happens to $\tau_{gd}$ (with $g_mR_L\gg1$ and $R_S$ comparable to $R_L$)?`,
        ['It roughly doubles', 'It stays the same', 'It halves', 'It roughly quadruples'], 0,
        [null, 'Both $R_L$ and the Miller factor $1 + g_mR_L$ grow with $R_L$.', 'The bigger gain makes it worse, not better.', 'Every term is linear in $R_L$: $R_L + R_S + g_mR_SR_L$ doubles (or a bit less).'],
        md`$R_{gd} = R_L + R_S + g_mR_SR_L$ grows linearly in $R_L$; with $g_mR_L\gg1$ it roughly doubles, and so does $\tau_L = R_LC_L$. More gain, less bandwidth: the gain-bandwidth trade (last lesson of the unit).`),
      P({
        id: 'e3u15-cs-num', title: 'Common source in numbers',
        q: md`$g_m = 4\,\text{mS}$, $R_S = 2\kO$, $R_L = 5\kO$, ignore $r_{ds}$. $C_{gs} = 1\,\text{pF}$, $C_{gd} = 0.2\,\text{pF}$, $C_L = 1\,\text{pF}$. Find the resistance $C_{gd}$ sees, the sum of the time constants, and the bandwidth estimate in rad/s and Hz.`,
        fig: fig('cs'),
        parts: [
          { lbl: 'R_{gd}', unit: 'kΩ', ans: 47, traps: [{ v: 7, msg: 'You dropped $g_mR_SR_L$, the Miller term.' }] },
          { lbl: '\\sum\\tau', unit: 'ns', ans: 16.4 },
          { lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: 1e3 / 16.4 },
          { lbl: 'f_{-3dB}', unit: 'MHz', ans: 1e3 / 16.4 / (2 * Math.PI), traps: [{ v: 1e3 / 16.4, msg: 'That is in Mrad/s. Hertz: divide by $2\\pi$.' }] },
        ],
        hints: [md`$g_mR_L = 20$.`, md`$\tau_{gs} = 2\,\text{ns}$, $\tau_L = 5\,\text{ns}$.`],
        sol: md`$g_mR_L = (4\,\text{mS})(5\kO) = 20$ (the gain magnitude).

| Capacitor | $R$ | $\tau$ |
|---|---|---|
| $C_{gs}$ | $R_S = 2\kO$ | $2\,\text{ns}$ |
| $C_{gd}$ | $R_L + (1 + 20)R_S = 5 + 42 = 47\kO$ | $9.4\,\text{ns}$ |
| $C_L$ | $R_L = 5\kO$ | $5\,\text{ns}$ |

$\sum\tau = 16.4\,\text{ns}$, so $\omega_{-3dB}\approx 1/16.4\,\text{ns} = 61.0\,\text{Mrad/s}$ and $f_{-3dB} = 61.0/2\pi = 9.70\,\text{MHz}$.

The smallest capacitor ($C_{gd} = 0.2\,\text{pF}$) has the biggest time constant: Miller. The exact bandwidth of this circuit is $64.3\,\text{Mrad/s}$, 5% above the estimate.`,
      }),
      P({
        id: 'e3u15-cs-sym', title: 'Write $R_{gd}$ from memory',
        q: md`Common source, $r_{ds}$ ignored: the resistance $C_{gd}$ sees, in terms of $g_m$, $R_S$, $R_L$.`,
        fig: fig('cs', 'Cgd'),
        parts: [ex('RS + RL + gm*RS*RL', ['gm', 'RS', 'RL'], 'R_{gd}', { exact: true })],
        hints: [md`$R_{left} + R_{right} + g_mR_{left}R_{right}$.`],
        sol: md`Left end on the gate: $R_S$. Right end on the drain: $R_L$. $R_{gd} = R_S + R_L + g_mR_SR_L = R_L + (1 + g_mR_L)R_S$.`,
      }),
      R(md`
        ### The common emitter: the same three pictures, plus $r_\pi$

        Replace the NMOS by an NPN: $C_{gs}\to C_\pi$, $C_{gd}\to C_\mu$, $r_{ds}\to r_o$. The only new thing is that the base is **not** an open circuit: $r_\pi$ sits from base to emitter, right across $C_\pi$. With the emitter grounded, $r_\pi$ is one more resistor from the base node to ground. So everywhere the MOS answer had "the gate node: $R_S$", the BJT answer has **$R_S\parallel r_\pi$**:
        $$R_\pi = R_S\parallel r_\pi$$
        $$R_\mu = (R_S\parallel r_\pi) + R_L + g_m(R_S\parallel r_\pi)R_L$$
        $$R_{L,o} = R_L\parallel r_o$$
        The most common slip on a BJT stage is to write $R_S$ where $R_S\parallel r_\pi$ belongs. Ask every time: "is there an $r_\pi$ on this node?"
      `, fig('ce')),
      Q(md`Common emitter, $R_S = 2.5\kO$, $r_\pi = 2.5\kO$. What does $C_\pi$ see?`,
        ['$1.25\\kO$', '$2.5\\kO$', '$5\\kO$', '$25\\,\\Omega$'], 0,
        [null, 'That is $R_S$ alone (the MOS habit) or $r_\\pi$ alone. Both go from the base to ground: parallel.', 'Series is wrong: both are paths from the base node to ground.', 'That is $r_\\pi/(\\beta+1)$, looking into an emitter. Here the emitter is grounded and $C_\\pi$ is on the base node.'],
        md`$R_S\parallel r_\pi = 2.5\parallel2.5 = 1.25\kO$.`, { fig: fig('ce', 'Cpi') }),
      P({
        id: 'e3u15-ce-num', title: 'Common emitter in numbers',
        q: md`$I_C = 1\,\text{mA}$ ($g_m = 40\,\text{mS}$), $\beta = 100$, $r_o\to\infty$. $R_S = 2.5\kO$, $R_L = 2\kO$, $C_\pi = 10\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 2\,\text{pF}$. Find $r_\pi$, the resistance $C_\mu$ sees, and the bandwidth estimate.`,
        fig: fig('ce'),
        parts: [
          { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
          { lbl: 'R_\\mu', unit: 'kΩ', ans: 103.25, traps: [{ v: 2.5 + 2 + 0.04 * 2500 * 2, msg: 'Use $R_S\\parallel r_\\pi$ for the base side, not $R_S$.' }, { v: 3.25, msg: 'You dropped the Miller term $g_m(R_S\\parallel r_\\pi)R_L$.' }] },
          { lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: 1e3 / 68.125 },
        ],
        hints: [md`$r_\pi = \beta/g_m$.`, md`Base side: $R_S\parallel r_\pi = 1.25\kO$. $g_mR_L = 80$.`],
        sol: md`$r_\pi = \beta/g_m = 100/40\,\text{mS} = 2.5\kO$. Base node: $R_S\parallel r_\pi = 1.25\kO$. $g_mR_L = 80$.

| Capacitor | $R$ | $\tau$ |
|---|---|---|
| $C_\pi$ | $R_S\parallel r_\pi = 1.25\kO$ | $12.5\,\text{ns}$ |
| $C_\mu$ | $1.25 + 2 + (40\,\text{mS})(1.25\kO)(2\kO) = 103.25\kO$ | $51.6\,\text{ns}$ |
| $C_L$ | $R_L = 2\kO$ | $4\,\text{ns}$ |

$\sum\tau = 68.1\,\text{ns}$, $\omega_{-3dB}\approx 14.7\,\text{Mrad/s}$ ($f = 2.34\,\text{MHz}$). Exact: $14.9\,\text{Mrad/s}$. Again the smallest capacitor, $C_\mu$, dominates.`,
      }),
      R(md`### Drills: CS and CE`),
      G('e3_octc_which', { need: 4, kinds: ['cs', 'ce'] }),
      G('e3_octc_bw', { need: 3, kinds: ['cs', 'ce'] }),
    ],
  });

  // ================================================================ 4. source degeneration
  L({
    id: 'e3-u15-deg', title: 'Common source with source degeneration', ref: 'Lecture 35 (OCTC notes, page 4)',
    steps: [
      R(md`
        ### Why this lesson

        Put $R_S$ under the source and the gain drops to $\dfrac{g_mR_L}{1 + g_mR_S}$ ([degenerated common source](#/l/e2-u8-csdeg)). This lesson shows the payoff: the bandwidth goes **up**, and the Miller term is where it comes from. It also shows that the bridge rule keeps working: just use the stage's $G_M$ instead of $g_m$.

        Names follow the notes: $R_G$ in series with the gate (the source resistance), $R_S$ under the source, $R_L$ (or $R_D$) the load. $C_{gs}$ now ends on the **source node**, which moves.
      `, fig('csdeg')),
      R(md`
        ### $C_{gs}$: a bridge between gate and source

        Put the test source $v_t$ across $C_{gs}$, so $v_{gs} = v_t$ exactly. Ignore $r_{ds}$, as the notes do. The test current $i_t$ comes up through $R_G$ (out of ground, into the gate side), and through $R_S$ flows the transistor's $g_mv_t$ minus $i_t$. Walk the loop ground → $R_G$ → gate → $v_t$ → source → $R_S$ → ground:
        $$0 = -i_tR_G + v_t + (g_mv_t - i_t)R_S\quad\Rightarrow\quad v_t(1 + g_mR_S) = i_t(R_G + R_S)$$
        $$R_{gs} = \frac{R_G + R_S}{1 + g_mR_S}$$
        The loop is $R_G + R_S$, but the transistor's own current flows through $R_S$ the helpful way and divides it by $1 + g_mR_S$. With $R_S = 0$ it is back to $R_G$.
      `),
      Q(md`Set $R_S = 0$ in every degenerated result. What should you get?`,
        ['The plain common source: $R_{gs} = R_G$, $R_{gd} = R_G + R_L + g_mR_GR_L$', 'Zero for every resistance', 'The common gate', 'Nothing sensible: the formulas need $R_S > 0$'], 0,
        [null, 'Only $R_S$ goes to zero; $R_G$ and $R_L$ stay.', 'The input still goes into the gate; this is the common source.', 'They reduce smoothly: that is the check the notes do.'],
        md`Always check a new formula against the case you know. The notes do exactly this for $R_{gd}$: $R_S = 0\Rightarrow R_x = r_{ds}$ and $R_{gd} = (R_L\parallel r_{ds})(1 + g_mR_G) + R_G$. ✓`),
      R(md`
        ### $C_{gd}$: the bridge rule with the stage's $G_M$

        Left end on the gate: $R_G$. Right end on the drain: $R_L\parallel R_x$, where $R_x = r_{ds} + R_S + g_mr_{ds}R_S$ is the [degenerated drain](#/l/e2-u7-scaler). And the gate voltage turns into drain current through the **degenerated** transconductance $G_M = \dfrac{g_m}{1 + g_mR_S}$:
        $$R_{gd} = \underbrace{(R_L\parallel R_x)}_{R_{right}} + \underbrace{R_G}_{R_{left}} + (R_L\parallel R_x)R_G\underbrace{\frac{g_m}{1 + g_mR_S}}_{g_{m,eff}} = (R_L\parallel R_x)\Big[1 + \frac{g_mR_G}{1 + g_mR_S}\Big] + R_G$$
        That is the notes' result, labelled the same way ("$R_{right}$, $R_{left}$, $g_{m,eff}$"). With $r_{ds}$ ignored, $R_x\to\infty$ and $R_L\parallel R_x\to R_L$.

        ### $C_L$: the output node

        $$\tau_L = (R_L\parallel R_x)\,C_L\approx R_LC_L$$
      `),
      P({
        id: 'e3u15-deg-sym', title: 'The two degenerated resistances',
        q: md`Ignore $r_{ds}$. Write the resistances $C_{gs}$ and $C_{gd}$ see in terms of $g_m$, $R_G$, $R_S$, $R_L$.`,
        fig: fig('csdeg'),
        parts: [ex('(RG + RS)/(1 + gm*RS)', ['gm', 'RG', 'RS'], 'R_{gs}', { exact: true }), ex('RG + RL + gm*RG*RL/(1 + gm*RS)', ['gm', 'RG', 'RS', 'RL'], 'R_{gd}', { exact: true })],
        hints: [md`$R_{gs}$: the loop $R_G + R_S$, divided by $1 + g_mR_S$.`, md`$R_{gd}$: $R_{left} + R_{right} + G_MR_{left}R_{right}$ with $G_M = g_m/(1 + g_mR_S)$.`],
        sol: md`$$R_{gs} = \frac{R_G + R_S}{1 + g_mR_S},\qquad R_{gd} = R_G + R_L + \frac{g_mR_GR_L}{1 + g_mR_S}$$`,
      }),
      P({
        id: 'e3u15-deg-num', title: 'What degeneration buys',
        q: md`$g_m = 4\,\text{mS}$, $R_G = 10\kO$, $R_S = 1\kO$, $R_L = 10\kO$, ignore $r_{ds}$; $C_{gs} = 1\,\text{pF}$, $C_{gd} = 0.2\,\text{pF}$, $C_L = 1\,\text{pF}$. Find the bandwidth estimate. Then find it again with $R_S = 0$ (same everything else).`,
        fig: fig('csdeg'),
        parts: [
          { lbl: 'R_{gs}', unit: 'kΩ', ans: 2.2, traps: [{ v: 10, msg: 'That is $R_G$ alone: the source end of $C_{gs}$ is not grounded any more.' }, { v: 11, msg: 'Right loop; now divide by $1 + g_mR_S = 5$.' }] },
          { lbl: 'R_{gd}', unit: 'kΩ', ans: 100, traps: [{ v: 420, msg: 'That uses $g_m$; the degenerated stage has $G_M = g_m/(1 + g_mR_S)$.' }] },
          { lbl: '\\omega_{-3dB}\\ (R_S = 1\\,\\text{k}\\Omega)', unit: 'Mrad/s', ans: 1e3 / 32.2 },
          { lbl: '\\omega_{-3dB}\\ (R_S = 0)', unit: 'Mrad/s', ans: 1e3 / 104 },
        ],
        hints: [md`$g_mR_S = 4$, so $G_M = 4\,\text{mS}/5 = 0.8\,\text{mS}$.`, md`With $R_S = 0$: $R_{gs} = R_G$, $R_{gd} = R_G + R_L + g_mR_GR_L$.`],
        sol: md`**With $R_S = 1\kO$:** $1 + g_mR_S = 5$, $G_M = 0.8\,\text{mS}$.
- $R_{gs} = (10 + 1)/5 = 2.2\kO$, $\tau = 2.2\,\text{ns}$.
- $R_{gd} = 10 + 10 + (0.8\,\text{mS})(10\kO)(10\kO) = 20 + 80 = 100\kO$, $\tau = 20\,\text{ns}$.
- $R_L = 10\kO$, $\tau = 10\,\text{ns}$.

$\sum\tau = 32.2\,\text{ns}$, $\omega_{-3dB}\approx 31.1\,\text{Mrad/s}$ (exact $32.5$).

**With $R_S = 0$:** $R_{gs} = 10\kO$ ($10\,\text{ns}$), $R_{gd} = 10 + 10 + (4\,\text{mS})(10)(10)\kO = 420\kO$ ($84\,\text{ns}$), $C_L$: $10\,\text{ns}$. $\sum\tau = 104\,\text{ns}$, $\omega_{-3dB}\approx 9.62\,\text{Mrad/s}$.

The gain fell from $g_mR_L = 40$ to $40/5 = 8$, and the bandwidth rose about $3.2\times$. Almost all of it came from the Miller term: degeneration divides the gain from gate to drain, and with it the multiplication of $C_{gd}$.`,
      }),
      R(md`
        !!trap About $r_{ds}$ in $R_{gs}$
          The notes ignore $r_{ds}$ when finding $R_{gs}$ for the degenerated stage, and keep it inside $R_x$ for $C_{gd}$ and $C_L$. If $r_{ds}$ is given and comparable to $R_L$, the exact $R_{gs}$ comes out somewhat larger than $\tfrac{R_G + R_S}{1 + g_mR_S}$. Unless a problem tells you otherwise, use the notes' form.
      `),
      R(md`### Drills: degeneration`),
      G('e3_octc_which', { need: 3, kinds: ['csdeg'] }),
      G('e3_octc_bw', { need: 2, kinds: ['csdeg'] }),
    ],
  });

  // ================================================================ 5. common gate and the cascode
  L({
    id: 'e3-u15-cg', title: 'Common gate and the cascode', ref: 'Lecture 36 (OCTC notes, page 5)',
    steps: [
      R(md`
        ### Why this lesson

        Two stages that are fast for the same reason: **no capacitor bridges a big gain.** In the common gate the gate is held, so $C_{gd}$ lands on ground. In the cascode the Miller capacitor $C_{gd1}$ bridges into node $X$, which is only about $1/g_m$, so the gain it sees is about 1. Both answers reuse Exam 2's [looking into a source](#/l/e2-u7-three) and [the cascode](#/l/e2-u7-cascode).

        ### The common gate

        Input through $R_S$ into the source, gate on a bias (triangle), $R_L$ on the drain.
      `, fig('cg')),
      R(md`
        **$C_{gs}$: from the source node to the gate, which is incremental ground** (picture 1). The source node has $R_S$ down to the zeroed input, and the transistor's source looking up with $R_L$ on the drain:
        $$R_{gs} = R_S\parallel\frac{r_{ds} + R_L}{1 + g_mr_{ds}}\approx R_S\parallel\frac{1}{g_m}\Big(1 + \frac{R_L}{r_{ds}}\Big)$$
        That is small (hundreds of ohms): this pole is far out.

        **$C_{gd}$ and $C_L$: both from the output to ground** (picture 1). They add, and see the output resistance, $R_L$ in parallel with the drain degenerated by $R_S$:
        $$\tau_{out} = (C_{gd} + C_L)\big[R_L\parallel(r_{ds} + R_S + g_mr_{ds}R_S)\big]$$
        No $1 + g_mR_L$ anywhere.
      `),
      P({
        id: 'e3u15-cg-num', title: 'Common gate in numbers',
        q: md`$g_m = 4\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$, $R_L = 10\kO$; $C_{gs} = 1\,\text{pF}$, $C_{gd} = 0.2\,\text{pF}$, $C_L = 1\,\text{pF}$. Find the two resistances and the bandwidth estimate.`,
        fig: fig('cg'),
        parts: [
          { lbl: 'R_{gs}', unit: 'Ω', ans: 215.26, accept: [par3(1e3, 1 / 4e-3 * (1 + 0.1))], traps: [{ v: 1000, msg: 'The source node also has the transistor on it: about $1/g_m$, in parallel with $R_S$.' }] },
          { lbl: 'R_{out}', unit: 'kΩ', ans: 9.8043 },
          { lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: 1e3 / 11.9804 },
        ],
        hints: [md`Looking up into the source: $\tfrac{r_{ds} + R_L}{1 + g_mr_{ds}} = \tfrac{110\kO}{401}$.`, md`Looking down into the drain: $r_{ds} + R_S + g_mr_{ds}R_S = 100 + 1 + 400 = 501\kO$.`],
        sol: md`**$C_{gs}$:** looking up into the source, $\tfrac{r_{ds} + R_L}{1 + g_mr_{ds}} = \tfrac{110\kO}{401} = 274\,\Omega$ (about $\tfrac1{g_m}(1 + \tfrac{R_L}{r_{ds}}) = 275\,\Omega$). In parallel with $R_S$: $R_{gs} = 1\kO\parallel274\,\Omega = 215\,\Omega$, $\tau = 0.215\,\text{ns}$.

**Output:** $R_{out} = 10\kO\parallel501\kO = 9.80\kO$, $\tau = (0.2 + 1)\,\text{pF}\times9.80\kO = 11.8\,\text{ns}$.

$\sum\tau = 12.0\,\text{ns}$, $\omega_{-3dB}\approx 83.5\,\text{Mrad/s}$ (exact $84.9$). Almost all of it is the output node: a common gate's bandwidth is set by its load.`,
      }),
      R(md`
        ### The cascode: five capacitors, four time constants

        $M_1$ is a common source driven through $R_S$; $M_2$ sits on top with its gate held; node $X$ is between them. Take both transistors identical. Walk the capacitors from the input up:
        - **$C_{gs1}$**: gate of $M_1$ to ground (its source is grounded): $R_S$.
        - **$C_{gd1}$**: bridges $M_1$'s gate ($R_S$) and node $X$: $R_S + R_X + g_mR_SR_X$ (picture 2).
        - **$C_{gs2}$**: node $X$ to $M_2$'s gate, which is held: node $X$'s resistance $R_X$ (picture 1).
        - **$C_{gd2}$ and $C_L$**: output to ground (the gate of $M_2$ is held): $R_{out}$.

        Node $X$ is $r_{ds1}$ down in parallel with $M_2$'s source looking up:
        $$R_X = r_{ds1}\parallel\frac{r_{ds2} + R_L}{1 + g_{m2}r_{ds2}}\approx\frac{1}{g_{m2}}\Big(1 + \frac{R_L}{r_{ds2}}\Big)$$
        $$R_{out} = R_L\parallel(r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1})\approx R_L$$
        $$\tau_{gd1} = \big[(1 + g_{m1}R_X)R_S + R_X\big]C_{gd1}$$

        **Why the Miller term shrinks.** In the plain common source, $C_{gd}$ bridged a gain of $g_mR_L$ (about 20 to 100). In the cascode, $C_{gd1}$ bridges the gain from the gate of $M_1$ to node $X$, which is only $g_{m1}R_X\approx1$ to $2$. So $C_{gd1}$ is multiplied by about 2, not by 40.
      `, fig('casc')),
      Q(md`In a cascode with $R_L\ll r_{ds}$ and $r_{ds}$ ignored elsewhere, about what does $C_{gd1}$ see?`,
        ['$2R_S + \\tfrac{1}{g_m}$', '$R_S + R_L + g_mR_SR_L$', '$R_S$', '$\\tfrac{1}{g_m}$'], 0,
        [null, 'That is the plain common source. Here the far end of $C_{gd1}$ is node $X$, not the output.', 'That is $C_{gs1}$.', 'That is node $X$ alone ($C_{gs2}$).'],
        md`$R_X\approx 1/g_m$, so $R_S + R_X + g_mR_SR_X\approx R_S + \tfrac1{g_m} + R_S$. The gain from gate to $X$ is $-1$, so the Miller factor is $1 + 1 = 2$.`,
        { fig: fig('casc', 'Cgd1') }),
      P({
        id: 'e3u15-casc-num', title: 'Common source against cascode, same gain',
        q: md`Both transistors: $g_m = 4\,\text{mS}$, $r_{ds} = 100\kO$, $C_{gs} = 1\,\text{pF}$, $C_{gd} = 0.2\,\text{pF}$. $R_S = 10\kO$, $R_L = 10\kO$, $C_L = 1\,\text{pF}$. Find $R_X$, the resistance $C_{gd1}$ sees, and the cascode's bandwidth estimate. (For comparison, the plain common source with the same parts gives $\sum\tau = 95.6\,\text{ns}$, $10.5\,\text{Mrad/s}$.)`,
        fig: fig('casc'),
        parts: [
          { lbl: 'R_X', unit: 'Ω', ans: 273.56, accept: [275] },
          { lbl: 'R_{gd1}', unit: 'kΩ', ans: 21.216, traps: [{ v: 382.73, msg: 'That is the plain common-source answer (bridging to the output). $C_{gd1}$ ends on node $X$.' }] },
          { lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: 1e3 / 26.5138 },
        ],
        hints: [md`$R_X = r_{ds}\parallel\tfrac{r_{ds} + R_L}{1 + g_mr_{ds}} = 100\kO\parallel\tfrac{110\kO}{401}$.`, md`$R_{gd1} = R_S + R_X + g_mR_SR_X$; output: $(C_{gd2} + C_L)R_{out}$ with $R_{out}\approx R_L$.`],
        sol: md`**Node $X$:** $\tfrac{110\kO}{401} = 274.3\,\Omega$, in parallel with $100\kO$: $R_X = 273.6\,\Omega$.

| Capacitor | $R$ | $\tau$ |
|---|---|---|
| $C_{gs1}$ | $R_S = 10\kO$ | $10\,\text{ns}$ |
| $C_{gd1}$ | $10\kO + 273.6 + (4\,\text{mS})(10\kO)(273.6) = 21.2\kO$ | $4.24\,\text{ns}$ |
| $C_{gs2}$ | $R_X = 273.6\,\Omega$ | $0.27\,\text{ns}$ |
| $C_{gd2} + C_L$ | $R_{out} = 10\kO\parallel40.2\,\text{M}\Omega = 10.0\kO$ | $12.0\,\text{ns}$ |

$\sum\tau = 26.5\,\text{ns}$, $\omega_{-3dB}\approx 37.7\,\text{Mrad/s}$: **3.6 times** the common source's $10.5\,\text{Mrad/s}$, at the same gain (both about 40). The Miller time constant fell from $76.5\,\text{ns}$ to $4.2\,\text{ns}$.

The exact cascode bandwidth is $48.8\,\text{Mrad/s}$: here two time constants are similar ($10$ and $12\,\text{ns}$), the case where the estimate is most pessimistic.`,
      }),
      R(md`### Drills: common gate and cascode`),
      G('e3_octc_which', { need: 3, kinds: ['cg', 'casc'] }),
      G('e3_octc_bw', { need: 3, kinds: ['cg', 'casc'] }),
    ],
  });

  // ================================================================ 6. followers and the BJT twins
  L({
    id: 'e3-u15-follow', title: 'Followers, and the BJT twins (CB, emitter follower)', ref: 'Lecture 36',
    steps: [
      R(md`
        ### Why this lesson

        Two loose ends. First, a capacitor across a **follower** (gate to source, base to emitter) is a bridge too, but across a gain just under $+1$: the gain term **divides**. Second, every MOS answer has a BJT twin, and the translation is mechanical once you remember what a base looks like.

        ### The source follower

        $v_{in}$ through $R_S$ into the gate, drain on $V_{DD}$, output at the source with $R_L$ to ground. Ignore $r_{ds}$.
      `, fig('sf')),
      R(md`
        - **$C_{gd}$: gate to ground** (the drain is on $V_{DD}$): $R_{gd} = R_S$. No Miller term: the drain does not move.
        - **$C_L$: the output (a source node) to ground**: $R_{L,o} = R_L\parallel\tfrac{1}{g_m}$. Small.
        - **$C_{gs}$: bridges gate and source.** Inject $i_t$ into the gate and pull it out of the source: $v_g = i_tR_S$. At the source, the transistor pushes in $g_mv_t$ and $R_L$ and the test source take it out: $g_mv_t = v_s/R_L + i_t$. With $v_t = v_g - v_s$:
        $$v_t = i_tR_S - R_L(g_mv_t - i_t)\quad\Rightarrow\quad R_{gs} = \frac{R_S + R_L}{1 + g_mR_L}$$

        The source **follows** the gate, so almost no voltage appears across $C_{gs}$, and it looks small ("bootstrapped"). Compare the bridge across an inverting gain, $R_S + R_L + g_mR_SR_L$: same two resistors, but the gain term now divides instead of adds.
      `),
      Q(md`Source follower: $g_m = 4\,\text{mS}$, $R_S = 10\kO$, $R_L = 2\kO$. What does $C_{gs}$ see?`,
        ['$1.33\\kO$', '$10\\kO$', '$92\\kO$', '$12\\kO$'], 0,
        [null, 'That is $R_{gd}$ (gate to ground). $C_{gs}$ ends on the source, which follows the gate.', 'That is the inverting-stage bridge $R_S + R_L + g_mR_SR_L$. Across a follower the gain divides.', 'Right loop, but the transistor helps: divide by $1 + g_mR_L = 9$.'],
        md`$\tfrac{10 + 2}{1 + 8} = 1.33\kO$. With $C_{gs} = 1\,\text{pF}$, $C_{gd} = 0.2\,\text{pF}$, $C_L = 1\,\text{pF}$ the three time constants are $1.33$, $2.0$ and $0.22\,\text{ns}$: $\omega_{-3dB}\approx 281\,\text{Mrad/s}$ (exact $363$). Followers are fast.`,
        { fig: fig('sf', 'Cgs') }),
      R(md`
        ### The BJT twins: one translation table

        The small-signal BJT is the MOSFET plus one resistor, $r_\pi$ from base to emitter. That changes three things, all of them Unit 11's terminal rules:

        | Where the capacitor sits | MOSFET | BJT |
        |---|---|---|
        | input node of a grounded-source/emitter stage | $R_S$ | $R_S\parallel r_\pi$ |
        | a source/emitter node, gate/base held | $R_S\parallel\tfrac1{g_m}$ | $R_S\parallel\tfrac{r_\pi}{\beta + 1}\approx R_S\parallel\tfrac1{g_m}$ |
        | the input node of a follower | $R_S$ (gate open) | $R_S\parallel[r_\pi + (\beta + 1)R_L]$ |
        | the output of a follower | $R_L\parallel\tfrac1{g_m}$ | $R_L\parallel\tfrac{r_\pi + R_S}{\beta + 1}$ |
        | gate–source / base–emitter of a follower | $\tfrac{R_S + R_L}{1 + g_mR_L}$ | $r_\pi\parallel\tfrac{R_S + R_L}{1 + g_mR_L}$ |

        **Common base** ($r_o$ ignored): $C_\pi$ from the emitter to the held base sees $R_S\parallel\tfrac{r_\pi}{\beta + 1}$; $C_\mu$ from the collector to the held base joins $C_L$ and sees $R_L$. Like the common gate: no Miller.

        **Emitter follower**: $C_\mu$ from the base to $V_{CC}$ sees $R_S\parallel[r_\pi + (\beta + 1)R_L]$; $C_\pi$ (base to emitter) sees $r_\pi$ in parallel with the follower bridge; $C_L$ sees the emitter, $R_L\parallel\tfrac{r_\pi + R_S}{\beta + 1}$.
      `, fig('ef')),
      Q(md`Emitter follower: why is the resistance $C_\mu$ sees **not** just $R_S$, as it was for the source follower's $C_{gd}$?`,
        ['The base draws current: looking into it you see $r_\\pi + (\\beta + 1)R_L$, in parallel with $R_S$', 'Because $C_\\mu$ bridges base and collector with a Miller term', 'Because the collector moves', 'It is just $R_S$'], 0,
        [null, 'The collector is on $V_{CC}$: no Miller here.', 'It is on $V_{CC}$, an incremental ground.', 'A gate is open; a base is not.'],
        md`A gate is an open circuit, so the gate node sees only $R_S$. A base looks like $r_\pi + (\beta + 1)R_E$ (Unit 11's $(\beta + 1)$ rule), here with $R_E = R_L$. That is usually much bigger than $R_S$, so the answer is still close to $R_S$, but write it properly.`,
        { fig: fig('ef', 'Cmu') }),
      P({
        id: 'e3u15-ef-num', title: 'An emitter follower in numbers',
        q: md`$I_C = 1\,\text{mA}$ ($g_m = 40\,\text{mS}$), $\beta = 100$, $r_o\to\infty$. $R_S = 1\kO$, $R_L = 1\kO$; $C_\pi = 10\,\text{pF}$, $C_\mu = 1\,\text{pF}$, $C_L = 2\,\text{pF}$. Find the three resistances and the bandwidth estimate.`,
        fig: fig('ef'),
        parts: [
          { lbl: 'R_\\pi', unit: 'Ω', ans: 47.847, traps: [{ v: 2000 / 41, msg: 'That is the source-follower bridge alone. $r_\\pi$ sits across $C_\\pi$: put it in parallel.' }] },
          { lbl: 'R_\\mu', unit: 'Ω', ans: 990.43, accept: [1000] },
          { lbl: 'R_{L,o}', unit: 'Ω', ans: 33.493, traps: [{ v: 1000 / 41, msg: 'That is $R_L\\parallel1/g_m$; the $R_S$ on the base also shows at the emitter, divided by $\\beta + 1$.' }] },
          { lbl: '\\omega_{-3dB}', unit: 'Mrad/s', ans: 651.09 },
        ],
        hints: [md`$r_\pi = 2.5\kO$. $\tfrac{R_S + R_L}{1 + g_mR_L} = \tfrac{2\kO}{41}$.`, md`Looking into the base: $r_\pi + (\beta + 1)R_L = 103.5\kO$. Looking into the emitter: $\tfrac{r_\pi + R_S}{\beta + 1} = \tfrac{3.5\kO}{101}$.`],
        sol: md`$r_\pi = 2.5\kO$, $g_mR_L = 40$.
- $C_\pi$: $r_\pi\parallel\tfrac{2\kO}{41} = 2.5\kO\parallel48.8\,\Omega = 47.8\,\Omega$, $\tau = 0.48\,\text{ns}$.
- $C_\mu$: $1\kO\parallel(2.5 + 101)\kO = 990\,\Omega$, $\tau = 0.99\,\text{ns}$.
- $C_L$: $1\kO\parallel\tfrac{3.5\kO}{101} = 1\kO\parallel34.7\,\Omega = 33.5\,\Omega$, $\tau = 0.067\,\text{ns}$.

$\sum\tau = 1.54\,\text{ns}$, $\omega_{-3dB}\approx 651\,\text{Mrad/s}$ (exact $915\,\text{Mrad/s}$; with three comparable time constants and a zero from $C_\pi$, the estimate is very safe here).`,
      }),
      R(md`### Drills: followers, CB and the emitter follower`),
      G('e3_octc_which', { need: 3, kinds: ['sf', 'cb', 'ef'] }),
      G('e3_octc_bw', { need: 2, kinds: ['sf', 'cb', 'ef'] }),
    ],
  });

  // ================================================================ 7. which capacitor limits the bandwidth
  L({
    id: 'e3-u15-limit', title: 'Which capacitor limits the bandwidth, and how to fix it', ref: 'Lectures 35–36',
    steps: [
      R(md`
        ### Why this lesson

        Exams love "which capacitor dominates?" and "what would you change to raise the bandwidth?". You can answer both by sizing the resistances by eye, before any arithmetic. This is where recognizing the pictures pays off.

        ### Size each resistance before computing it

        - **Bridge across an inverting gain** (CS $C_{gd}$, CE $C_\mu$): $R_{left}(1 + |A|) + R_{right}$. With a gain of 20–100, this is usually the **biggest** time constant even though the capacitor is the smallest. That is the Miller effect.
        - **Output node** ($C_L$): about $R_L$. Big when the load is big, which is exactly when the gain is big.
        - **Input node** ($C_{gs}$ / $C_\pi$ of a grounded-source stage): $R_S$ (or $R_S\parallel r_\pi$). Big only with a big source resistance.
        - **Source or emitter nodes** (CG input, cascode node $X$, follower outputs): about $1/g_m$. Tiny: those poles almost never matter.

        ### The fixes, and what each one attacks

        | Fix | What it shrinks | Cost |
        |---|---|---|
        | Lower the source resistance (drive with a follower) | $R_{left}$: the input $\tau$ **and** the Miller term | an extra stage |
        | Cascode | the Miller gain: $C_{gd1}$ bridges into $X\approx1/g_m$ | headroom |
        | Source/emitter degeneration | $G_M$, so the Miller gain | gain |
        | Smaller $R_L$ | output $\tau$ and the Miller gain | gain |
      `),
      R(md`
        ### The gain–bandwidth trade, in one line

        Drive a common source from an ideal source ($R_S = 0$). Then $\tau_{gs} = 0$, $\tau_{gd} = R_LC_{gd}$, $\tau_L = R_LC_L$:
        $$\omega_{-3dB}\approx\frac{1}{R_L(C_L + C_{gd})},\qquad |A_v| = g_mR_L\qquad\Rightarrow\qquad|A_v|\,\omega_{-3dB}\approx\frac{g_m}{C_L + C_{gd}}$$
        The product does not depend on $R_L$: double $R_L$ and you double the gain and halve the bandwidth. (With $g_m = 4\,\text{mS}$, $C_L + C_{gd} = 1.2\,\text{pF}$: $3.33\times10^9\,\text{rad/s}$ for $R_L = 5$, $10$ or $20\kO$, checked exactly.) The cascode's trick is to beat this trade when $R_S$ is large.
      `),
      Q(md`A common source is driven from $R_S = 10\kO$, gain 40, and $\tau_{gd}$ is 80% of $\sum\tau$. Which change does **not** raise the bandwidth?`,
        ['Doubling $R_L$', 'Driving the gate from a source follower (low output resistance)', 'Adding a cascode transistor', 'Adding a little source degeneration'], 0,
        [null, 'A follower makes $R_{left}$ about $1/g_m$, shrinking both the input $\\tau$ and the Miller term.', 'The cascode turns the Miller factor from about 41 into about 2.', 'Degeneration divides the gain from gate to drain, and the Miller term with it.'],
        md`Doubling $R_L$ doubles the gain and so roughly doubles the Miller term and the output $\tau$: the bandwidth drops. The other three each attack the dominant $\tau_{gd}$.`),
      Q(md`In a common gate, which time constant usually sets the bandwidth?`,
        ['$(C_{gd} + C_L)R_{out}$ at the output', '$C_{gs}$ at the source', 'A Miller-multiplied $C_{gd}$', 'They are always equal'], 0,
        [null, 'The source node is about $1/g_m\\parallel R_S$: tiny.', 'There is no Miller term: the gate is held.', 'Not in general; the output one is usually much bigger.'],
        md`The input node is small (about $1/g_m$), and $C_{gd}$ sits from the output to ground, so the output node dominates: about $R_L(C_{gd} + C_L)$.`),
      R(md`### Drill: which one dominates, and what to change`),
      G('e3_octc_dom', { need: 4 }),
    ],
  });

  // ================================================================ 8. mixed drill
  L({
    id: 'e3-u15-mix', title: 'Mixed drill: open-circuit time constants', kind: 'review', ref: 'Unit 15',
    steps: [
      R(md`
        Every Unit 15 skill, mixed, with new circuits and numbers each time: which resistance a capacitor sees (all eight circuits, MOS and BJT), full bandwidth estimates, the bridging rule, which time constant dominates, and how pessimistic the estimate is. Ten in a row without opening a solution completes it.

        Before each one, say the picture out loud: "node to ground, so that node's resistance" or "bridge across an inverting gain, so $R_{left} + R_{right} + G_mR_{left}R_{right}$".
      `),
      G('e3_octc_bw', { need: 10, pool: ['e3_octc_bw', 'e3_octc_which', 'e3_octc_which', 'e3_octc_dom', 'e3_octc_bridge', 'e3_octc_est'] }),
    ],
  });

  function par3(a, b) { return 1 / (1 / a + 1 / b); }
})();

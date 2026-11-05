/* Chapter 4 — Single-stage MOSFET amplifiers (bk04). Every amplifier as a Norton source (A_v = -G_M R_out, derived
   from linearity), then the common source and its three loads, source degeneration, the common gate, the source
   follower and the cascode, each derived from the small-signal model one step at a time, then felt; then bias-to-gain
   numbers and the chapter problems. Lectures 14-18 (Exam 2). Figures: window.BK4F (js/gens-bk-a3.js). Every formula
   and number here was checked against an independent nodal solve. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk04', l);
  const ex = (...a) => BK.ex(...a);
  const F = window.BK4F;

  // ================================================================== 1. every amplifier is a Norton source
  L({
    id: 'bk04-norton', title: 'Every amplifier is a Norton source', ref: 'Lecture 15',
    steps: [
      R(md`
        ### Chapter 4 at a glance

        Chapters 2 and 3 built the parts: the small-signal model of one MOSFET, and the resistance you see looking into each of its terminals. This chapter puts them to work. One transistor, a resistor or another transistor around it, a small signal in, a bigger signal out.

        **By the end of the chapter you will be able to:**
        - find the gain of any single-transistor stage as $A_v = -G_MR_{out}$, with the right sign, every time;
        - derive (not memorize) $G_M$, $R_{out}$, $R_{in}$ and $A_v$ of the stages every exam uses: the common source with a resistor, diode or current-source load, the degenerated common source, the common gate, the source follower and the cascode;
        - say in one sentence why each stage inverts or not, and roughly how big its gain is, before writing any algebra;
        - go from a DC bias to a number, $I_D\to V_{ov}\to g_m,\ r_{ds}\to A_v$, without a calculator.

        **What you need first:** the small-signal model, $g_mv_{gs}$ from drain to source with $r_{ds}$ beside it and the gate open ([Chapter 2](#/l/bk02-model)); the test-source method ([Chapter 1](#/l/bk01-test)); and three resistances from [Chapter 3](#/l/bk03-test): looking into a drain ($r_{ds}$, or $r_{ds} + R_S + g_mr_{ds}R_S$ with $R_S$ under the source), into a source (about $1/g_m$), and into a diode-connected transistor ($\tfrac1{g_m}\parallel r_{ds}$).

        | Section | Stage | The one idea |
        |---|---|---|
        | 1 | any amplifier | seen from its output it is a current source and a resistor: $A_v = -G_MR_{out}$ |
        | 2 | common source | the gate sets a current; the load turns it back into a voltage |
        | 3 | its three loads | the load decides $R_{out}$ and nothing else |
        | 4 | source degeneration | the source rises with the current: feedback |
        | 5 | common gate | the same current, let in at the source |
        | 6 | source follower | the source follows the gate |
        | 7 | cascode | a common gate stacked on a common source |
        | 8 | numbers | from the bias to the gain, by hand |
      `),
      R(md`
        ### The question

        Every amplifier problem asks for one number: the **small-signal voltage gain** $A_v = v_{out}/v_{in}$. You can always get it by writing KCL at every node of the small-signal circuit and solving. With one transistor that is fine. With two or three it becomes a page of algebra, and one sign slip ruins it.

        This section shows that **every** amplifier, however complicated inside, looks from its output like one current source in parallel with one resistor. That splits the gain into two small questions, each answered in a few lines: $A_v = -G_MR_{out}$. Every gain in the rest of the book is found this way.

        ### The physical picture

        A MOSFET in saturation is a **valve** between drain and source. The gate voltage sets how far the valve is open, that is, how much current flows; the drain voltage hardly matters (that is what saturation means). So a transistor takes a **voltage** in and gives a **current** out. Its exchange rate is the transconductance $g_m$: amperes out per volt in.

        A current is not yet an output voltage. It has to flow into something, and the voltage it makes depends on the resistance it meets. Push $20\,\mu\text{A}$ into $10\kO$ and you get $0.2\,\text{V}$; push the same $20\,\mu\text{A}$ into $100\,\Omega$ and you get $2\,\text{mV}$.

        So every transistor amplifier works in two steps:
        1. the input voltage is turned into a current (so many amperes per volt: this will be $G_M$);
        2. that current is turned back into a voltage by the resistance at the output (this will be $R_{out}$).

        !!intuition The whole chapter in one line
          Gain = (current per volt of input) × (resistance that current lands on). A stage with $g_m = 2\,\text{mS}$ pushing its current into $10\kO$ has a gain of about $2\,\text{mS}\times10\kO = 20$. The rest of the chapter finds those two numbers exactly for each stage, and gets the sign right.
      `),
      RF(md`
        ### The model

        After the DC analysis, an amplifier is replaced by its **small-signal circuit** ([Chapter 1](#/l/bk01-two)): supplies and bias voltages become ground, DC current sources become open circuits, big capacitors become wires, and each transistor becomes $g_mv_{gs}$ in parallel with $r_{ds}$. What is left contains only three kinds of things:
        - resistors;
        - **dependent** sources, each a current proportional to some voltage in the circuit;
        - one **independent** source, $v_{in}$.

        A circuit made only of these is **linear**: double $v_{in}$ and every voltage and current in it doubles; add two inputs and the responses add. That single fact is all the derivation needs.

        ### The derivation

        **Step 1: attach anything to the output.** Stand at the output terminal and look back into the amplifier. Connect whatever you like to the output: a load resistor, another stage, a meter. At this moment the output sits at some voltage $v_{out}$, and some current $i_x$ flows from the outside **into** the amplifier at its output terminal.

        [[fig:box]]

        **Step 2: replace the outside by a voltage source.** The amplifier feels the outside world only through the voltage at its output terminal. So if we unplug the outside thing and put an ideal voltage source of exactly $v_{out}$ there instead, nothing inside the amplifier changes, and the same $i_x$ flows. (This is the substitution theorem; it is just that sentence.)

        [[fig:sub]]

        **Step 3: superposition.** Now the circuit is driven by two independent sources, $v_{in}$ and $v_{out}$. Because it is linear, any current in it is the sum of the currents each source makes on its own. So $i_x$ is a constant times $v_{in}$ plus another constant times $v_{out}$:
        $$i_x = (\text{constant}_1)\,v_{in} + (\text{constant}_2)\,v_{out}$$

        **Step 4: the first constant.** Turn $v_{out}$ off. A zero-volt source is a plain wire, so the output is **shorted** to ground, and $i_x = (\text{constant}_1)\,v_{in}$. So constant$_1$ is the current flowing from the short into the amplifier, per volt of input. Call that current $i_{out}$ and the constant the **transconductance** $G_M$:
        $$G_M = \frac{i_{out}}{v_{in}}\quad\text{(output shorted, }i_{out}\text{ flowing from the short into the stage)}$$

        **Step 5: the second constant.** Turn $v_{in}$ off instead. Then $i_x = (\text{constant}_2)\,v_{out}$: the current into the output terminal is proportional to the voltage on it. That is exactly what a resistor does, so constant$_2 = 1/R_{out}$, where $R_{out}$ is the **resistance looking into the output with the input turned off**.

        **Step 6: the result.**
        $$i_x = G_Mv_{in} + \frac{v_{out}}{R_{out}}$$
        Read it as a circuit. The current $i_x$ arriving at the output node leaves it through two branches to ground: a current source carrying $G_Mv_{in}$ and a resistor $R_{out}$ carrying $v_{out}/R_{out}$. That is the **Norton equivalent** of the amplifier, and it is exact: no approximation was made anywhere.

        [[fig:norton]]
      `, {
        box: { fig: F.ampBox(), cap: 'The whole small-signal circuit as a box. Something is attached at the output; a current $i_x$ flows from it into the box.' },
        sub: { fig: F.ampBox({ ext: 'vsrc' }), cap: 'The outside replaced by an ideal source equal to $v_{out}$: inside the box nothing changes.' },
        norton: { fig: F.norton('ix'), cap: 'The Norton equivalent, read straight off $i_x = G_Mv_{in} + v_{out}/R_{out}$. The source pulls $G_Mv_{in}$ down out of the output node.' },
      }),
      RF(md`
        ### The gain

        **Step 1: nothing attached.** With the output open, no current comes in from outside: $i_x = 0$.
        $$0 = G_Mv_{in} + \frac{v_{out}}{R_{out}}$$

        **Step 2: solve for $v_{out}$.** Move $G_Mv_{in}$ to the other side and multiply by $R_{out}$:
        $$v_{out} = -G_MR_{out}\,v_{in}$$

        !!key The gain of any amplifier (Lecture 15)
          $$A_v = \frac{v_{out}}{v_{in}} = -G_MR_{out}$$
          $G_M$: short the output, find the current flowing from the short into the stage, divide by $v_{in}$. $R_{out}$: turn $v_{in}$ off and look into the output. Multiply, and put a minus sign in front.

        **Step 3: a load.** Connect a resistor $R_L$ from the output to ground. The current coming into the amplifier from outside is now the current coming up through $R_L$, which is $i_x = -v_{out}/R_L$ (if $v_{out}$ is positive, current flows down through $R_L$, away from the amplifier). So
        $$-\frac{v_{out}}{R_L} = G_Mv_{in} + \frac{v_{out}}{R_{out}}$$

        **Step 4: collect the $v_{out}$ terms** on the left:
        $$v_{out}\Big(\frac1{R_{out}} + \frac1{R_L}\Big) = -G_Mv_{in}\quad\Rightarrow\quad A_v = -G_M\,(R_{out}\parallel R_L)$$
        The load simply joins $R_{out}$ in parallel. $G_M$ does not change, because with the output shorted the load has zero volts across it and carries nothing.

        [[fig:load]]
      `, { load: { fig: F.norton('load'), cap: 'A load at the output sits in parallel with $R_{out}$: $A_v = -G_M(R_{out}\\parallel R_L)$.' } }),
      R(md`
        ### The sign convention

        The direction of $i_{out}$ is a choice, and the course makes it once and for all: **$i_{out}$ flows from the short into the stage.** Equivalently, $G_Mv_{in}$ is drawn as a current pulled **down** out of the output node, as in the figures above.

        With that choice the minus sign in $A_v = -G_MR_{out}$ has a physical meaning: **pulling current out of a node pushes its voltage down.**

        | When $v_{in}$ goes up, the stage... | $G_M$ | $A_v = -G_MR_{out}$ | Stages |
        |---|---|---|---|
        | pulls **more** current down out of the output | positive | negative (inverting) | common source, degenerated common source, cascode |
        | pulls **less** current down, or pushes current up into the output | negative | positive (non-inverting) | common gate, source follower |

        !!method The one-line sign check
          After every gain, say it in words: "$v_{in}$ goes up, so the stage pulls more (or less) current out of the output, so $v_{out}$ goes down (or up)." The sign of your answer must agree. It takes five seconds and catches most sign errors.

        ### Why the short makes $G_M$ easy

        With the output shorted, $v_{out} = 0$. Look at what that does to a real small-signal circuit:
        - any resistor from the output to ground has zero volts across it, so it carries **no current**;
        - so does any resistor from the output to $V_{DD}$, because $V_{DD}$ is ground for signals;
        - so does the $r_{ds}$ of a transistor whose other end is at ground.

        All of them drop out, and what is left to make $i_{out}$ are the dependent sources, which are easy to read. A second gift: a node held at zero volts cannot feed anything back. In a stage where the output voltage would otherwise change some $v_{gs}$ (a follower, a cascode), shorting the output removes that coupling.

        ### Why $R_{out}$ is a Chapter 3 problem

        With $v_{in} = 0$, every dependent source driven **only** by $v_{in}$ is dead: an open circuit. Careful: a source driven by an internal node, like $v_{gs} = 0 - v_s$, is still alive. What remains is a resistance problem. Look up from the output (everything between it and $V_{DD}$: $R_{UP}$) and look down (everything between it and ground: $R_{DN}$). Both ends are incremental ground, so the two are in parallel:
        $$R_{out} = R_{UP}\parallel R_{DN}$$
        Each half is a terminal resistance from [Chapter 3](#/l/bk03-node): a drain, a source, a diode, a degenerated drain.
      `),
      RF(md`
        ### Worked example: one stage, three methods

        The common source: input on the gate, source grounded, $R_D$ from the drain to $V_{DD}$, output at the drain. Numbers: $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_D = 10\kO$. ([Section 2](#/l/bk04-cs) takes this stage apart slowly; here it is a test case for the methods.)

        [[fig:cs]]

        **Method 1: $G_MR_{out}$.**

        *$G_M$.* Short the drain. The gate is at $v_{in}$ and the source at ground, so $v_{gs} = v_{in}$. $R_D$ and $r_{ds}$ both have 0 V across them and drop out. The dependent source pulls $g_mv_{in}$ down out of the drain node, and the only thing left to supply it is the short: $i_{out} = g_mv_{in}$, so $G_M = g_m = 2\,\text{mS}$.

        [[fig:short]]

        *$R_{out}$.* Turn $v_{in}$ off. The gate is grounded, so $v_{gs} = 0$ and the dependent source carries nothing: erase it. A test source on the drain sees $R_D$ (up to incremental ground) and $r_{ds}$ (down to ground) in parallel:
        $$R_{out} = 10\text{k}\parallel100\text{k} = \frac{10\times100}{10 + 100}\kO = 9.09\kO$$

        [[fig:test]]

        *Multiply:* $A_v = -(2\,\text{mS})(9.09\kO) = -18.2$.

        **Method 2: direct KCL.** Leave the output open and write KCL at the drain: the three currents leaving it (down through the dependent source, down through $r_{ds}$, up through $R_D$) add to zero:
        $$g_mv_{in} + \frac{v_{out}}{r_{ds}} + \frac{v_{out}}{R_D} = 0\quad\Rightarrow\quad v_{out} = -\frac{g_m}{1/r_{ds} + 1/R_D}\,v_{in} = -g_m(R_D\parallel r_{ds})\,v_{in}$$
        The same $-18.2$. With one node this is just as fast. With two or more nodes it is not, while Method 1 stays two short calculations.

        [[fig:open]]

        **Method 3: resistance ratios.** The transistor current is $i_d = g_mv_{gs} = \dfrac{v_{gs}}{1/g_m}$. That is Ohm's law for a resistor of value $1/g_m$ between the gate voltage and the source. So, seen from the source side, a transistor behaves like a resistance $1/g_m$ whose current comes out of the **drain** (the gate supplies none of it). Here $v_{in}$ drives the current $v_{in}/(1/g_m)$ through that $1/g_m$, and the same current is pulled out of the drain, where it meets $R_D\parallel r_{ds}$:
        $$A_v = -\frac{\text{resistance at the drain}}{\text{resistance in the source path}} = -\frac{R_D\parallel r_{ds}}{1/g_m} = -\frac{9.09\kO}{0.5\kO} = -18.2$$
        This is the fastest way to estimate a gain, and the way The Art of Electronics thinks. It ignores $r_{ds}$ everywhere except at the drain, so we will use it for estimates and checks, and Method 1 for exact answers.
      `, {
        cs: { fig: F.cs(), cap: 'The common source: gate in, drain out, source grounded.' },
        short: { fig: F.csM('short'), cap: 'Method 1, $G_M$: the output shorted. $R_D$ and $r_{ds}$ have 0 V across them.' },
        test: { fig: F.csM('test'), cap: 'Method 1, $R_{out}$: $v_{in} = 0$, so $v_{gs} = 0$ and the dependent source carries nothing.' },
        open: { fig: F.csM('open'), cap: 'Method 2: output open, KCL at the drain.' },
      }),
      R(md`
        ### Check it

        - **Limits of the loaded gain.** $R_L\to\infty$ in $-G_M(R_{out}\parallel R_L)$ gives back the open-circuit gain $-G_MR_{out}$. $R_L\to0$ gives $v_{out} = 0$: the shorted output we used to define $G_M$. Both ends agree with Steps 4 and 5 of the derivation.
        - **Units.** $G_M$ in siemens times $R_{out}$ in ohms is a pure number. A handy pair: mS × kΩ = 1.
        - **One number.** In the worked example all three methods gave $-18.2$.

        ### What it means

        The gain has exactly two knobs. $G_M$ says how hard the input pushes current; $R_{out}$ says how much voltage each unit of that current makes at the output. Every stage in this chapter is a different trade between them: degeneration lowers $G_M$ to make it predictable; a current-source load raises $R_{out}$; a cascode raises $R_{out}$ much further without giving up $G_M$; a follower has a tiny $R_{out}$, which is what makes it a good driver.

        Thévenin says the same thing differently: the open-circuit voltage is $-G_MR_{out}v_{in}$ and the source resistance is $R_{out}$. Norton is the natural view for transistors, because a transistor really is a current source.

        ### How to recognize it

        This is not a stage, it is the procedure for every stage:
        1. Find the output node. Short it to ground. Find the current flowing from the short into the stage: $G_M = i_{out}/v_{in}$.
        2. Turn $v_{in}$ off. Find $R_{out} = R_{UP}\parallel R_{DN}$ at the output.
        3. $A_v = -G_MR_{out}$; with a load, $A_v = -G_M(R_{out}\parallel R_L)$.
        4. Say the sign check out loud.

        !!mistake Common mistakes
          - **Shorting the output, then still counting $R_D$** in $G_M$. With the output shorted, $R_D$ has 0 V across it and carries nothing.
          - **The wrong direction for $i_{out}$.** It flows from the short **into** the stage. A common source has $G_M > 0$; a follower has $G_M < 0$.
          - **Killing too much when $v_{in} = 0$.** Only sources driven by $v_{in}$ alone die. A source driven by $v_{gs} = -v_s$, or by the test voltage itself, stays.
          - **Forgetting the load.** With $R_L$ attached the gain is $-G_M(R_{out}\parallel R_L)$, not $-G_MR_{out}$.
          - **Counting the load twice.** If $R_L$ is already inside your $R_{out}$, do not put it in parallel again.
      `),
      Q(md`To find $G_M$ we short the output to ground. What makes this easier than working with the output open?`,
        ['Every resistor between the output and (incremental) ground has 0 V across it and carries nothing, so only the dependent sources make $i_{out}$.',
          'Shorting the output makes $R_{out}$ zero, which removes it from the gain.',
          'With the output shorted the transistor leaves saturation, which simplifies its model.',
          'Nothing: an open output gives the same $G_M$ just as easily.'], 0,
        [null,
          'The short is a measurement trick. $R_{out}$ is a property of the circuit, found separately with $v_{in}$ off; shorting the output does not change it.',
          'The short is applied to the small-signal circuit only. The DC operating point, and so saturation, are untouched.',
          'With the output open you get $v_{out} = -G_MR_{out}v_{in}$, which mixes both unknowns together. The short separates them.'],
        md`With $v_{out} = 0$, $R_D$, a load, and any $r_{ds}$ with its other end grounded all have zero volts across them, so they carry no current. $i_{out}$ is then just the sum of the dependent-source currents reaching the output, each easy to read. That is Step 4 of the derivation: shorting the output turns off the "$v_{out}$ source", leaving only the part of $i_x$ that $v_{in}$ makes.`),
      Q(md`An amplifier has $G_M = 5\,\text{mS}$ and $R_{out} = 4\kO$, so $A_v = -20$. A load $R_L = 4\kO$ is connected to its output. What happens?`,
        ['$G_M$ stays $5\\,\\text{mS}$; the output resistance becomes $4\\text{k}\\parallel4\\text{k} = 2\\,\\text{k}\\Omega$; $A_v = -10$.',
          '$G_M$ halves and $R_{out}$ stays, so $A_v = -10$.',
          'Nothing changes: the load is outside the amplifier.',
          'The resistances add to $8\\,\\text{k}\\Omega$, so $A_v = -40$.'], 0,
        [null,
          'With the output shorted the load carries nothing, so $G_M$ cannot depend on it. The load changes the resistance, not the transconductance.',
          'The load is in parallel with $R_{out}$: the signal current $G_Mv_{in}$ now splits between them, so less voltage develops.',
          'The load connects the output to ground, the same two nodes as $R_{out}$ in the Norton picture: parallel, not series.'],
        md`$A_v = -G_M(R_{out}\parallel R_L) = -(5\,\text{mS})(2\kO) = -10$. Loading can only lower the resistance at the output, so it can only lower $|A_v|$. This is why a stage with a large $R_{out}$ loses most of its gain into a small load, and why followers exist ([Section 6](#/l/bk04-cd)).`),
      Q(md`You short the output of an unknown amplifier and find that, when $v_{in}$ rises, current flows **out of** the amplifier into the short. What are the signs of $G_M$ and of $A_v$?`,
        ['$G_M < 0$ and $A_v > 0$: non-inverting.', '$G_M > 0$ and $A_v < 0$: inverting.', '$G_M < 0$ and $A_v < 0$.', 'You cannot tell without knowing $R_{out}$.'], 0,
        [null,
          '$G_M$ counts current flowing from the short **into** the stage. Here it flows the other way, so $G_M$ is negative.',
          '$A_v = -G_MR_{out}$ with $R_{out} > 0$: a negative $G_M$ gives a positive gain.',
          'In every stage of this course $R_{out}$ is positive, so it cannot change the sign: the sign of $A_v$ is the opposite of the sign of $G_M$.'],
        md`$i_{out}$ is defined as flowing from the short into the stage, so current flowing out of the stage into the short is a negative $i_{out}$: $G_M < 0$. Then $A_v = -G_MR_{out} > 0$. In words: as $v_{in}$ rises the stage pushes current into its output, which raises the output voltage. The common gate and the source follower behave like this.`),
      Q(md`To find $R_{out}$ of a source follower you set $v_{in} = 0$ and put $v_t$ on the output, which is the transistor's source. The gate is now grounded, so $v_{gs} = 0 - v_t$. What happens to the dependent source $g_mv_{gs}$?`,
        ['It stays: it carries $g_mv_t$, and it makes the output resistance small (about $1/g_m$).', 'It dies, because $v_{in} = 0$.', 'It becomes a short circuit.', 'It becomes $r_{ds}$.'], 0,
        [null,
          'Only sources driven by $v_{in}$ alone die. This one is driven by $v_{gs} = -v_t$, which the test source itself sets.',
          'A dead current source is an open circuit, never a short. And this one is not dead.',
          '$r_{ds}$ is already there, beside it. The dependent source adds $g_m$ of conductance on top of $1/r_{ds}$.'],
        md`With the gate at 0 and the source at $v_t$, $v_{gs} = -v_t$, so the dependent source carries $g_m(-v_t)$ from drain to source: $g_mv_t$ flowing up, out of the output node. Current proportional to the node's own voltage is a resistor, $1/g_m$. That is why a follower's output resistance is about $1/g_m$ ([Section 6](#/l/bk04-cd)).`),
      P({
        id: 'bk04-norton-meas', title: 'Two measurements make a Norton model',
        q: md`An amplifier is driven with $v_{in} = 20\,\text{mV}$. With its output open, $v_{out} = -1.2\,\text{V}$. With its output shorted to ground, a current of $0.3\,\text{mA}$ flows **from the short into** the amplifier. Find $A_v$, $G_M$ (with its sign) and $R_{out}$. Then a $2\kO$ load is connected: what is the gain now?`,
        fig: F.ampBox(),
        parts: [{ lbl: 'A_v', unit: '', ans: -60 }, { lbl: 'G_M', unit: 'mS', ans: 15 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4 },
          { lbl: 'A_v\\text{ with }2\\,\\text{k}\\Omega', unit: '', ans: -20, traps: [{ v: -30, msg: 'That is $-G_MR_L$ with the load alone. The load sits in parallel with $R_{out}$: $4\\text{k}\\parallel2\\text{k}$.' }, { v: -90, msg: 'Series? The load runs from the output to ground, in parallel with $R_{out}$.' }] }],
        hints: [md`Open output: $A_v = v_{out}/v_{in}$. Shorted output: $G_M = i_{out}/v_{in}$, positive when the current flows from the short into the stage.`, md`$R_{out} = A_v/(-G_M)$. With the load: $A_v = -G_M(R_{out}\parallel R_L)$.`],
        sol: md`
1. Open output: $A_v = \dfrac{-1.2\,\text{V}}{0.02\,\text{V}} = -60$. Inverting.
2. Shorted output: $i_{out} = +0.3\,\text{mA}$ (it flows from the short into the stage, the positive direction). $G_M = \dfrac{0.3\,\text{mA}}{20\,\text{mV}} = 15\,\text{mS}$.
3. $A_v = -G_MR_{out}$, so $R_{out} = \dfrac{-60}{-15\,\text{mS}} = 4\kO$. (The same as $|v_{oc}|/|i_{sc}| = 1.2\,\text{V}/0.3\,\text{mA}$: the Thévenin resistance.)
4. With the load: $R_{out}\parallel R_L = 4\text{k}\parallel2\text{k} = \dfrac{8}{6}\kO = 1.33\kO$, and $G_M$ is unchanged. $A_v = -(15\,\text{mS})(1.33\kO) = -20$.

Sign check: the stage pulls current out of its output when $v_{in}$ rises (that is what $G_M > 0$ says), so the output falls: inverting, as measured.`,
      }),
      P({
        id: 'bk04-norton-twoloads', title: 'Finding $R_{out}$ with two loads',
        q: md`An inverting amplifier gives $v_{out} = -2\,\text{V}$ for $v_{in} = 0.1\,\text{V}$ with nothing connected. With a $1\kO$ load on its output, the same input gives $v_{out} = -0.5\,\text{V}$. Find $R_{out}$ and $G_M$.`,
        fig: F.ampBox(),
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 3, traps: [{ v: 4, msg: 'The gain fell by 4, but the ratio is $R_L/(R_{out} + R_L)$, so $R_{out} + R_L = 4R_L$.' }] }, { lbl: 'G_M', unit: 'mS', ans: 20 / 3 }],
        hints: [md`Unloaded $A_0 = -G_MR_{out}$; loaded $A_L = -G_M(R_{out}\parallel R_L)$. Divide: $G_M$ cancels.`, md`$\dfrac{A_L}{A_0} = \dfrac{R_{out}\parallel R_L}{R_{out}} = \dfrac{R_L}{R_{out} + R_L}$.`],
        sol: md`
1. $A_0 = -2/0.1 = -20$ and $A_L = -0.5/0.1 = -5$.
2. Divide the two: $\dfrac{A_L}{A_0} = \dfrac{-G_M(R_{out}\parallel R_L)}{-G_MR_{out}} = \dfrac{R_L}{R_{out} + R_L}$. (Write $R_{out}\parallel R_L = \dfrac{R_{out}R_L}{R_{out} + R_L}$ and cancel $R_{out}$.)
3. $\dfrac{5}{20} = \dfrac14 = \dfrac{1\kO}{R_{out} + 1\kO}$, so $R_{out} + 1\kO = 4\kO$ and $R_{out} = 3\kO$.
4. $G_M = -A_0/R_{out} = 20/3\kO = 6.67\,\text{mS}$ (positive: an inverting stage).

This is how output resistance is measured on the bench: one reading open, one reading loaded.`,
      }),
      P({
        id: 'bk04-norton-pos', title: 'A non-inverting stage',
        q: md`A stage has $G_M = -4\,\text{mS}$ and $R_{out} = 500\,\Omega$. Find its gain with nothing connected, and with a $500\,\Omega$ load.`,
        fig: F.norton('load'),
        parts: [{ lbl: 'A_v\\text{ unloaded}', unit: '', ans: 2 }, { lbl: 'A_v\\text{ with }500\\,\\Omega', unit: '', ans: 1 }],
        hints: [md`$A_v = -G_MR_{out}$: a negative $G_M$ gives a positive gain.`],
        sol: md`
1. Unloaded: $A_v = -(-4\,\text{mS})(0.5\kO) = +2$.
2. Loaded: $R_{out}\parallel R_L = 500\parallel500 = 250\,\Omega$, so $A_v = -(-4\,\text{mS})(0.25\kO) = +1$.

$G_M < 0$ means the stage pushes current **into** its output when $v_{in}$ rises, so the output rises: non-inverting. A common gate stage looks like this ([Section 5](#/l/bk04-cg)).`,
      }),
      P({
        id: 'bk04-norton-ff', title: 'A resistor straight from input to output',
        q: md`The small-signal circuit below is what a transistor with a resistor $R_F$ from its gate to its drain becomes when an ideal source drives the gate: the transistor is the dependent source $g_mv_{in}$, $R_1$ is everything else at the drain. Find $G_M$ and $A_v$ in symbols, then $A_v$ for $g_m = 5\,\text{mS}$, $R_F = 1\kO$, $R_1 = 10\kO$.`,
        fig: F.ffM(),
        parts: [ex('gm - 1/RF', ['gm', 'RF'], 'G_M', { exact: true }), ex('-(gm - 1/RF)*(R1 || RF)', ['gm', 'RF', 'R1'], 'A_v', { exact: true }),
          { lbl: 'A_v\\text{ (numbers)}', unit: '', ans: -40 / 11, traps: [{ v: -50, msg: 'That is $-g_mR_1$: it forgets both the current through $R_F$ and $R_F$ loading the output.' }] }],
        hints: [md`Short the output. $R_1$ drops out. $R_F$ now runs from $v_{in}$ to the shorted output: which way does its current flow?`, md`$v_{in} = 0$: the dependent source dies and $R_F$ runs from the output to (incremental) ground.`],
        sol: md`
**$G_M$ (output shorted).** KCL at the output node, which is held at 0 V:
- the dependent source pulls $g_mv_{in}$ out of the node, down to ground;
- $R_F$ has $v_{in}$ on one end and 0 V on the other, so it brings $v_{in}/R_F$ **into** the node;
- $R_1$ has 0 V across it: nothing.

What the short must supply is the difference: $i_{out} = g_mv_{in} - v_{in}/R_F$, so
$$G_M = g_m - \frac1{R_F}$$

**$R_{out}$ ($v_{in} = 0$).** The dependent source is driven by $v_{in}$ alone, so it dies. $R_F$ now runs from the output to the grounded input: $R_{out} = R_1\parallel R_F$.

**Gain.**
$$A_v = -\Big(g_m - \frac1{R_F}\Big)(R_1\parallel R_F)$$
Numbers: $G_M = 5 - 1 = 4\,\text{mS}$, $R_{out} = 10\text{k}\parallel1\text{k} = 0.909\kO$, $A_v = -(4)(0.909) = -3.64$.

**Check by direct KCL** (output open, currents leaving the output node): $g_mv_{in} + \dfrac{v_{out}}{R_1} + \dfrac{v_{out} - v_{in}}{R_F} = 0$, so $v_{out}\Big(\dfrac1{R_1} + \dfrac1{R_F}\Big) = \Big(\dfrac1{R_F} - g_m\Big)v_{in}$: the same answer.

Notice that $G_M$ has **two paths**: the transistor pulls current out, $R_F$ feeds current straight in. If $g_m = 1/R_F$ they cancel and the gain is exactly zero. That cancellation is the origin of the right-half-plane zero in [Chapter 12](#/l/bk12-exact).`,
      }),
      P({
        id: 'bk04-norton-three', title: 'One stage, three ways',
        q: md`A common source stage has $g_m = 4\,\text{mS}$, $r_{ds} = 50\kO$ and $R_D = 5\kO$. Find $G_M$, $R_{out}$ and $A_v$. Then check $A_v$ by direct KCL and by the resistance ratio.`,
        fig: F.cs(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 4 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 50 / 11, traps: [{ v: 5, msg: 'That is $R_D$ alone. $r_{ds}$ also runs from the drain to (incremental) ground.' }, { v: 55, msg: '$R_D$ and $r_{ds}$ are in parallel (both from the drain to ground), not in series.' }] },
          { lbl: 'A_v', unit: '', ans: -200 / 11, traps: [{ v: -20, msg: 'That is $-g_mR_D$: $r_{ds}$ sits in parallel with $R_D$ and lowers the resistance at the drain.' }] }],
        hints: [md`Short the drain: only the dependent source is left, $G_M = g_m$.`, md`$v_{in} = 0$ kills the dependent source; $R_{out} = R_D\parallel r_{ds}$.`],
        sol: md`
1. **$G_M$:** with the drain shorted, $R_D$ and $r_{ds}$ carry nothing; the short supplies $g_mv_{in}$. $G_M = 4\,\text{mS}$.
2. **$R_{out}$:** $5\text{k}\parallel50\text{k} = \dfrac{5\times50}{55}\kO = 4.545\kO$.
3. **$A_v$** $= -(4\,\text{mS})(4.545\kO) = -18.18$.
4. **Direct KCL** at the drain: $g_mv_{in} + v_{out}\Big(\dfrac1{r_{ds}} + \dfrac1{R_D}\Big) = 0$, so $\dfrac{v_{out}}{v_{in}} = -\dfrac{4\,\text{mS}}{0.02\,\text{mS} + 0.2\,\text{mS}} = -\dfrac{4}{0.22} = -18.18$.
5. **Resistance ratio:** $-\dfrac{R_D\parallel r_{ds}}{1/g_m} = -\dfrac{4.545\kO}{0.25\kO} = -18.18$.`,
      }),
      G('bk_norton', { need: 4 }),
    ],
  });
})();

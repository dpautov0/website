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

  // ================================================================== 2. the common source
  L({
    id: 'bk04-cs', title: 'The common source', ref: 'Lectures 14–15',
    steps: [
      RF(md`
        ### The question

        The **common source** is the workhorse: input on the gate, output at the drain, source at (incremental) ground. ("Common" because the source belongs to neither the input nor the output.) Every other stage in this chapter is a common source with something added or something moved. We want its gain, why that gain is negative, what sets its size, and what limits it. On Exam 2 it sits inside almost every problem, alone or as the first stage of a chain.

        ### The physical picture

        Bias first. A DC gate voltage $V_{GS}$ opens the valve to a current $I_D$. That current flows down from $V_{DD}$ through $R_D$, so the drain sits at
        $$V_{out} = V_{DD} - I_DR_D$$
        Now let the gate rise a little. The valve opens further, more current flows, the drop across $R_D$ grows, and **the drain falls**. That is the whole reason the common source inverts: more current through the load resistor means a bigger drop across it.

        The output curves show it. Each solid curve is the transistor's $I_D$ against $V_{DS}$ at one gate voltage. The dashed line is what $R_D$ allows, $I_D = (V_{DD} - V_{DS})/R_D$: the **load line**. The circuit must sit where the two meet. The numbers: $K = \tfrac12\mu_nC_{ox}\tfrac WL = 1\,\text{mA/V}^2$, $V_{TN} = 1\,\text{V}$, $V_{DD} = 5\,\text{V}$, $R_D = 10\kO$, and $r_{ds}$ ignored for now, so the saturated curves are flat.

        [[fig:ll]]

        At $V_{GS} = 1.5\,\text{V}$ the operating point is $Q$: $I_D = K(0.5\,\text{V})^2 = 0.25\,\text{mA}$ and $V_{DS} = 5 - 2.5 = 2.5\,\text{V}$. Move the gate by $\pm0.1\,\text{V}$ and the operating point slides along the load line, from $V_{DS} = 3.4\,\text{V}$ (at $1.4\,\text{V}$, $0.16\,\text{mA}$) to $1.4\,\text{V}$ (at $1.6\,\text{V}$, $0.36\,\text{mA}$). A $0.2\,\text{V}$ swing at the gate became a $2\,\text{V}$ swing at the drain, upside down: a gain of about $-10$.

        !!intuition A valve and a resistor
          The transistor does not make voltage. It sets a current, and the resistor turns that current into voltage. A steep valve (large $g_m$) and a large resistor give a large gain. Keep that picture: every formula in this section is a careful version of it.
      `, { ll: { fig: F.loadLine(), cap: 'Output curves at three gate voltages and the load line of $R_D = 10\\,\\text{k}\\Omega$ from $V_{DD} = 5\\,\\text{V}$. A $\\pm0.1\\,\\text{V}$ gate swing moves the drain from $3.4\\,\\text{V}$ to $1.4\\,\\text{V}$.' } }),
      RF(md`
        ### Gain is a slope

        Sweep $V_{in}$ and plot the drain voltage: the **transfer curve**. Below $V_{TN} = 1\,\text{V}$ the transistor is off and $V_{out} = V_{DD}$. Above it, in saturation,
        $$V_{out} = V_{DD} - R_DK(V_{in} - V_{TN})^2$$
        falls steeply: this is the amplifier region. Once $V_{out}$ drops below $V_{in} - V_{TN}$, the transistor enters triode and the curve flattens out near zero.

        [[fig:tc]]

        A small signal riding on $Q$ moves along this curve, and over a short enough stretch the curve is its tangent line ([Chapter 1](#/l/bk01-tangent)). So the small-signal gain is the **slope at $Q$**. Differentiate the saturation branch:
        $$\frac{dV_{out}}{dV_{in}} = -2R_DK(V_{in} - V_{TN}) = -R_D\,(2KV_{ov}) = -g_mR_D$$
        because $2KV_{ov} = \mu_nC_{ox}\tfrac WLV_{ov} = g_m$ ([Chapter 2](#/l/bk02-gm)). At $Q$: $g_m = 2I_D/V_{ov} = 2(0.25\,\text{mA})/(0.5\,\text{V}) = 1\,\text{mS}$, and the slope is $-(1\,\text{mS})(10\kO) = -10$: the dashed tangent.
      `, { tc: { fig: F.csTransfer(), cap: 'The transfer curve of the same stage. The gain is the slope at $Q$: $-g_mR_D = -10$.' } }),
      RF(md`
        ### The model

        Assumptions: $M_1$ is in saturation at $Q$, and the signal is small. This time we keep $r_{ds} = 1/(\lambda I_D)$, the slope of the real output curves.

        Building the small-signal circuit: $V_{DD}$ becomes ground, so $R_D$ runs from the drain to ground; the DC part of the gate voltage is a constant, so only $v_{in}$ is left at the gate; $M_1$ becomes $g_mv_{gs}$ from drain to source with $r_{ds}$ beside it, and nothing flows into its gate.

        [[fig:bias]]

        ### The derivation

        **$G_M$: short the output.**

        *Step 1: what is $v_{gs}$?* The gate is at $v_{in}$, the source on ground: $v_{gs} = v_{in} - 0 = v_{in}$.

        *Step 2: who carries current?* The shorted drain sits at 0 V. $R_D$ has 0 V at both ends (the drain, and $V_{DD}$, which is ground): no current. $r_{ds}$ has 0 V at the drain and 0 V at the source: no current.

        *Step 3: KCL at the drain.* Only the dependent source is left. It pulls $g_mv_{gs} = g_mv_{in}$ down out of the drain node, and the only thing that can supply that current is the short: $i_{out} = g_mv_{in}$.
        $$G_M = \frac{i_{out}}{v_{in}} = g_m$$

        [[fig:short]]

        **$R_{out}$: turn the input off.**

        *Step 1: what is $v_{gs}$?* $v_{in} = 0$ puts the gate on ground; the source is on ground: $v_{gs} = 0$.

        *Step 2:* the dependent source carries $g_m\cdot0 = 0$. A current source carrying nothing is an open circuit: erase it.

        *Step 3: a test source $v_t$ on the drain.* Its current $i_t$ splits two ways: up through $R_D$ to (incremental) ground, $v_t/R_D$, and down through $r_{ds}$ to ground, $v_t/r_{ds}$:
        $$i_t = \frac{v_t}{R_D} + \frac{v_t}{r_{ds}}\quad\Rightarrow\quad R_{out} = \frac{v_t}{i_t} = \frac{1}{1/R_D + 1/r_{ds}} = R_D\parallel r_{ds}$$

        [[fig:test]]

        !!key The common source
          $$G_M = g_m,\qquad R_{out} = R_D\parallel r_{ds},\qquad A_v = -g_m\,(R_D\parallel r_{ds})$$
          Input resistance: a gate, $R_{in} = \infty$.
      `, {
        bias: { fig: F.cs({ bias: 'V_{GS}' }), cap: 'Total = bias + signal: $v_{in}$ rides on the DC gate voltage $V_{GS}$. For the small-signal circuit, $V_{GS}$ and $V_{DD}$ become ground.' },
        short: { fig: F.csM('short'), cap: '$G_M$: drain shorted. $R_D$ and $r_{ds}$ have 0 V across them; the short supplies $g_mv_{in}$.' },
        test: { fig: F.csM('test'), cap: '$R_{out}$: gate grounded, so $v_{gs} = 0$; the test source sees $R_D$ and $r_{ds}$ in parallel.' },
      }),
      R(md`
        ### Check it

        - **$r_{ds}\to\infty$** (no channel-length modulation): $A_v = -g_mR_D$, the slope we got by differentiating the transfer curve.
        - **$R_D\to\infty$** (an ideal current source above the drain): $A_v = -g_mr_{ds}$, the **intrinsic gain**. That is the most one transistor can give: all of its current change must flow through its own $r_{ds}$.
        - **Units:** mS × kΩ, a pure number.
        - **One number:** $g_m = 2\,\text{mS}$, $R_D = 10\kO$, $r_{ds} = 100\kO$ give $R_{out} = 9.09\kO$ and $A_v = -18.2$.

        ### What it means

        **The sign.** A rising gate pulls more current out of the drain node, and pulling current out of a node lowers its voltage. The minus sign is that sentence.

        **The size, from the DC drop.** Put $g_m = 2I_D/V_{ov}$ into $A_v\approx-g_mR_D$:
        $$A_v\approx-\frac{2I_DR_D}{V_{ov}} = -\frac{2V_{R_D}}{V_{ov}}$$
        where $V_{R_D} = I_DR_D$ is the DC voltage across the resistor. **A resistively loaded common source has a gain of twice the DC drop on its resistor, divided by the overdrive.** In the load-line example, $2(2.5\,\text{V})/(0.5\,\text{V}) = 10$. You can read that off a DC schematic in your head.

        **What limits it.** A bigger gain needs a bigger $V_{R_D}$, but the drain must stay above $V_{ov}$ to keep $M_1$ saturated, so $V_{R_D} < V_{DD} - V_{ov}$ and
        $$|A_v| < \frac{2(V_{DD} - V_{ov})}{V_{ov}}$$
        In practice much less, because the output needs room to swing. With $V_{DD} = 3\,\text{V}$ and $V_{ov} = 0.2\,\text{V}$ the ceiling is 28. To beat it you need a load with a large **small-signal** resistance but a small **DC** drop: a current source ([Section 3](#/l/bk04-loads)).

        **The other ceiling.** Even with an ideal load the gain stops at $g_mr_{ds}$. With $g_m = 2I_D/V_{ov}$ and $r_{ds} = 1/(\lambda I_D)$:
        $$g_mr_{ds} = \frac{2I_D}{V_{ov}}\cdot\frac{1}{\lambda I_D} = \frac{2}{\lambda V_{ov}}$$
        The current cancels: $\lambda = 0.05\,\text{V}^{-1}$ and $V_{ov} = 0.2\,\text{V}$ give 200, at any bias current.
      `),
      RF(md`
        ### The PMOS common source

        Turn the circuit upside down: $M_1$ is a PMOS with its source on $V_{DD}$, the input on its gate, $R_D$ from its drain down to ground, and the output at the drain.

        [[fig:pc]]

        **Physically.** A PMOS conducts when its gate is **below** its source: $V_{SG} = V_{DD} - V_G$ sets the current, which flows from $V_{DD}$ down through the transistor into $R_D$, so $V_{out} = I_DR_D$. Raise the gate a little: $V_{SG}$ shrinks, less current flows, the drop across $R_D$ shrinks, and the drain **falls**. Inverting, just like the NMOS version.

        **The model is the same** ([Chapter 2](#/l/bk02-pmodel)): $g_mv_{gs}$ from drain to source with $r_{ds}$ beside it. Drawn source-on-top to match the circuit, the arrow points up, still from drain to source.

        [[fig:pshort]]

        *$G_M$.* Short the drain. The source is on $V_{DD}$, ground for signals, so $v_{gs} = v_{in} - 0 = v_{in}$. $R_D$ and $r_{ds}$ have 0 V across them. The dependent source carries $g_mv_{in}$ from the drain up to the source, that is, **out of** the drain node, and the short supplies it: $i_{out} = g_mv_{in}$ and $G_M = g_m$.

        *$R_{out}$.* $v_{in} = 0$ makes $v_{gs} = 0$, so the dependent source is open. The test source sees $R_D$ down to ground and $r_{ds}$ up to $V_{DD}$: $R_{out} = R_D\parallel r_{ds}$.

        So $A_v = -g_m(R_D\parallel r_{ds})$: **the same formula**. You never need a separate PMOS version of any result in this chapter. Draw the model with $i_d$ from drain to source and the algebra is identical.
      `, {
        pc: { fig: F.csP(), cap: 'The PMOS common source: source on $V_{DD}$, gate in, drain out, $R_D$ to ground.' },
        pshort: { fig: F.csPM('short'), cap: 'Its model with the drain shorted. The arrow still runs from drain to source; it just points up.' },
      }),
      R(md`
        ### How to recognize it

        Input at a **gate**, output at the **drain** of the same transistor, and that transistor's **source** at a supply, at ground, or at anything that holds still for signals (a bypass capacitor counts). An NMOS hangs from the output down to ground; a PMOS hangs from $V_{DD}$ down to the output. Say: "common source: $-g_m$ times everything at the drain in parallel."

        ### Worked example: from the bias to the gain

        $M_1$: NMOS, $W/L = 50/1$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$, $\lambda = 0.05\,\text{V}^{-1}$. $V_{GS} = 1.2\,\text{V}$, $R_D = 20\kO$, $V_{DD} = 5\,\text{V}$.

        1. **Current.** $K = \tfrac12(100\,\mu\text{A/V}^2)(50) = 2.5\,\text{mA/V}^2$ and $V_{ov} = 1.2 - 1 = 0.2\,\text{V}$, so $I_D = KV_{ov}^2 = (2.5)(0.04) = 0.1\,\text{mA}$. ($\lambda$ is ignored at DC, as the course does.)
        2. **Saturated?** $V_D = 5 - (0.1\,\text{mA})(20\kO) = 3\,\text{V}$, so $V_{DS} = 3\,\text{V}\ge V_{ov} = 0.2\,\text{V}$. Yes.
        3. **Small-signal parameters.** $g_m = \dfrac{2I_D}{V_{ov}} = \dfrac{0.2\,\text{mA}}{0.2\,\text{V}} = 1\,\text{mS}$ and $r_{ds} = \dfrac{1}{\lambda I_D} = \dfrac{1}{(0.05\,\text{V}^{-1})(0.1\,\text{mA})} = 200\kO$.
        4. **Gain.** $R_{out} = 20\text{k}\parallel200\text{k} = \dfrac{20\times200}{220}\kO = 18.2\kO$, so $A_v = -(1\,\text{mS})(18.2\kO) = -18.2$.
        5. **Sanity check from the DC drop.** $2V_{R_D}/V_{ov} = 2(2\,\text{V})/(0.2\,\text{V}) = 20$ without $r_{ds}$; with it, a little less. It agrees.

        !!mistake Common mistakes
          - **$R_D$ in series with $r_{ds}$.** Both run from the drain to (incremental) ground: they are in **parallel**.
          - **$v_{gs} = v_{in}$ when the source is not grounded.** That holds only with the source at incremental ground. A resistor under the source changes everything ([Section 4](#/l/bk04-degen)).
          - **$g_m = 2I_D/V_{GS}$.** The overdrive $V_{ov} = V_{GS} - V_{TN}$ goes in the denominator.
          - **Skipping the saturation check.** In triode the model is wrong and the gain collapses: the flat right end of the transfer curve.
          - **A separate sign rule for PMOS.** The model is identical; a PMOS common source inverts too.
      `),
      Q(md`In a common source stage the gate voltage rises by $10\,\text{mV}$. Why does the drain voltage fall?`,
        ['The transistor passes more current, so the drop across $R_D$ grows and the drain, at $V_{DD} - I_DR_D$, goes down.',
          'The gate is capacitively coupled to the drain, so the drain follows the gate.',
          'The source rises with the gate, which lowers $V_{DS}$.',
          'The drain current reverses direction when the gate rises.'], 0,
        [null,
          'No signal current flows through the gate here; and "following" would make the drain rise, not fall.',
          'In a common source the source is grounded: it does not move.',
          'The current only grows. It is the bigger voltage drop across $R_D$ that pulls the drain down.'],
        md`$V_{out} = V_{DD} - I_DR_D$. A higher gate means a larger $I_D$ (by $g_m\times10\,\text{mV}$), so a larger drop across $R_D$ and a lower drain. With $g_m = 1\,\text{mS}$ and $R_D = 10\kO$: $10\,\mu\text{A}$ more current, $100\,\text{mV}$ more drop, the drain falls $100\,\text{mV}$. Gain $-10$.`),
      Q(md`At the drain of a common source stage, how do $R_D$ and $r_{ds}$ combine in $R_{out}$?`,
        ['In parallel: each runs from the drain to an incremental ground ($V_{DD}$ or ground).', 'In series, because the bias current flows through $R_D$ and then through the transistor.', 'Only $R_D$ counts; $r_{ds}$ belongs to the transistor.', 'Only $r_{ds}$ counts, because it is the larger.'], 0,
        [null,
          'That is the DC picture. For the test source, $R_D$ leads up to $V_{DD}$ (ground) and $r_{ds}$ down to ground: two separate paths from the same node.',
          '$r_{ds}$ is a real path from the drain to the grounded source, so the test source drives current through it.',
          'In parallel the **smaller** resistance dominates, here usually $R_D$.'],
        md`Both resistors connect the drain to an incremental ground, so a test source on the drain drives two separate currents, $v_t/R_D$ and $v_t/r_{ds}$: $R_{out} = R_D\parallel r_{ds}$. Series would need the current to pass through one and then the other, which never happens here.`),
      Q(md`A resistively loaded common source has $1.5\,\text{V}$ of DC drop across $R_D$, and $V_{ov} = 0.25\,\text{V}$. Ignoring $r_{ds}$, what is its gain?`,
        ['$-12$', '$-6$', '$-24$', '$+12$'], 0,
        [null, 'You dropped the factor 2: $g_m = 2I_D/V_{ov}$, so $A_v = -2V_{R_D}/V_{ov}$.', 'Check the arithmetic: $2\\times1.5/0.25 = 12$.', 'A common source inverts: the gain is negative.'],
        md`$A_v\approx-g_mR_D = -\dfrac{2I_D}{V_{ov}}R_D = -\dfrac{2V_{R_D}}{V_{ov}} = -\dfrac{2(1.5)}{0.25} = -12$. No current or resistor value needed: only the DC drop and the overdrive.`),
      Q(md`A common source stage is biased so that its drain sits only $0.1\,\text{V}$ above ground, with $V_{ov} = 0.3\,\text{V}$. What does that do to the small-signal gain?`,
        ['The transistor is in triode, not saturation, and the gain is far smaller than $g_mR_D$.', 'Nothing: the gain is $-g_mR_D$ wherever the drain sits.', 'The gain grows, since the drain is closer to ground.', 'The gain changes sign.'], 0,
        [null,
          '$-g_mR_D$ assumes saturation. Here $V_{DS} = 0.1\\,\\text{V} < V_{ov}$: triode, the flat end of the transfer curve.',
          'Near the bottom the transfer curve is flat, so its slope (the gain) is small.',
          'The transfer curve slopes down everywhere; in triode it is just much flatter.'],
        md`Saturation needs $V_{DS}\ge V_{ov}$. With $V_{DS} = 0.1\,\text{V} < 0.3\,\text{V}$ the transistor is in triode: it behaves like a small resistor, and the operating point sits on the flat tail of the transfer curve, where the slope is small. Always check saturation before using the small-signal model.`),
      P({
        id: 'bk04-cs-num', title: 'Common source with numbers',
        q: md`A common source stage has $g_m = 3\,\text{mS}$, $r_{ds} = 40\kO$ and $R_D = 8\kO$. Find $R_{out}$ and $A_v$.`,
        fig: F.cs({ RD: '8\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 20 / 3, traps: [{ v: 8, msg: 'That is $R_D$ alone: $r_{ds}$ also runs from the drain to ground.' }, { v: 48, msg: 'Parallel, not series: both go from the drain to an incremental ground.' }] },
          { lbl: 'A_v', unit: '', ans: -20, traps: [{ v: -24, msg: 'That is $-g_mR_D$: include $r_{ds}$ in parallel with $R_D$.' }] }],
        hints: [md`$R_{out} = R_D\parallel r_{ds}$.`, md`$A_v = -g_mR_{out}$.`],
        sol: md`
1. $R_{out} = 8\text{k}\parallel40\text{k} = \dfrac{8\times40}{48}\kO = 6.67\kO$.
2. $A_v = -(3\,\text{mS})(6.67\kO) = -20$.

Without $r_{ds}$ it would have been $-24$: here $r_{ds}$ is only 5 times $R_D$, so it matters.`,
      }),
      P({
        id: 'bk04-cs-bias', title: 'From $W/L$ and $V_{GS}$ to the gain',
        q: md`NMOS common source: $W/L = 100/1$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$, $\lambda = 0.05\,\text{V}^{-1}$, $V_{GS} = 1.3\,\text{V}$, $R_D = 6\kO$, $V_{DD} = 5\,\text{V}$. Find $I_D$ (ignore $\lambda$ at DC), $g_m$, $r_{ds}$ and $A_v$. Check saturation.`,
        fig: F.cs({ bias: '1.3\\,\\text{V}', RD: '6\\,\\text{k}\\Omega', sz: '100/1' }),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.45 }, { lbl: 'g_m', unit: 'mS', ans: 3, traps: [{ v: 0.9 / 1.3, msg: 'Use the overdrive: $V_{ov} = V_{GS} - V_{TN} = 0.3\\,\\text{V}$.' }] },
          { lbl: 'r_{ds}', unit: 'kΩ', ans: 400 / 9 }, { lbl: 'A_v', unit: '', ans: -3 * (6 * 400 / 9) / (6 + 400 / 9), traps: [{ v: -18, msg: 'That ignores $r_{ds}$, which is in parallel with $R_D$.' }] }],
        hints: [md`$K = \tfrac12\mu_nC_{ox}\tfrac WL = 5\,\text{mA/V}^2$ and $V_{ov} = 0.3\,\text{V}$.`, md`$g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$, $A_v = -g_m(R_D\parallel r_{ds})$.`],
        sol: md`
1. $K = \tfrac12(100\,\mu)(100) = 5\,\text{mA/V}^2$, $V_{ov} = 0.3\,\text{V}$, $I_D = 5\times0.09 = 0.45\,\text{mA}$.
2. Saturation: $V_D = 5 - (0.45)(6) = 2.3\,\text{V}\ge V_{ov} = 0.3\,\text{V}$. Saturated.
3. $g_m = \dfrac{2(0.45\,\text{mA})}{0.3\,\text{V}} = 3\,\text{mS}$; $r_{ds} = \dfrac{1}{(0.05)(0.45\,\text{mA})} = 44.4\kO$.
4. $R_{out} = 6\text{k}\parallel44.4\text{k} = 5.29\kO$, $A_v = -(3)(5.29) = -15.9$.

Check from the DC drop: $2(2.7\,\text{V})/(0.3\,\text{V}) = 18$ without $r_{ds}$; $r_{ds}$ brings it down to $15.9$.`,
      }),
      P({
        id: 'bk04-cs-pmos', title: 'A PMOS common source',
        q: md`PMOS common source: $W/L = 40/1$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$, $\lambda = 0.1\,\text{V}^{-1}$, $V_{DD} = 5\,\text{V}$, the gate at a DC voltage of $3.6\,\text{V}$, $R_D = 15\kO$ from the drain to ground. Find $I_D$, $g_m$ and $A_v$.`,
        fig: F.csP({ bias: '3.6\\,\\text{V}', RD: '15\\,\\text{k}\\Omega', sz: '40/1' }),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.16 }, { lbl: 'g_m', unit: 'mS', ans: 0.8 }, { lbl: 'A_v', unit: '', ans: -0.8 * (15 * 62.5) / (15 + 62.5), traps: [{ v: 0.8 * (15 * 62.5) / (15 + 62.5), msg: 'A PMOS common source inverts too: $v_{in}$ up lowers $V_{SG}$, less current flows into $R_D$, the drain falls.' }] }],
        hints: [md`$V_{SG} = V_{DD} - V_G = 1.4\,\text{V}$, so $V_{ov} = 0.4\,\text{V}$. $K = \tfrac12(50\,\mu)(40) = 1\,\text{mA/V}^2$.`, md`Same model as NMOS: $A_v = -g_m(R_D\parallel r_{ds})$ with $r_{ds} = 1/(\lambda I_D)$.`],
        sol: md`
1. $V_{SG} = 5 - 3.6 = 1.4\,\text{V}$, $V_{ov} = 0.4\,\text{V}$, $K = 1\,\text{mA/V}^2$, $I_D = (1)(0.16) = 0.16\,\text{mA}$.
2. Saturation: $V_D = I_DR_D = 2.4\,\text{V}$, so $V_{SD} = 2.6\,\text{V}\ge0.4\,\text{V}$. Saturated.
3. $g_m = \dfrac{2(0.16)}{0.4} = 0.8\,\text{mS}$, $r_{ds} = \dfrac{1}{(0.1)(0.16\,\text{mA})} = 62.5\kO$.
4. $R_{out} = 15\text{k}\parallel62.5\text{k} = 12.1\kO$, $A_v = -(0.8)(12.1) = -9.68$.

Sign: $v_{in}$ up lowers $V_{SG}$, so less current flows into $R_D$ and the drain falls. Inverting.`,
      }),
      P({
        id: 'bk04-cs-max', title: 'How much gain can a resistor give?',
        q: md`An NMOS common source runs at $I_D = 0.2\,\text{mA}$ with $V_{ov} = 0.2\,\text{V}$ from $V_{DD} = 3\,\text{V}$. To leave room for the output to swing, its drain must sit at least $1\,\text{V}$ above ground. What is the largest $R_D$ allowed, and the gain it gives (ignore $r_{ds}$)?`,
        fig: F.cs(),
        parts: [{ lbl: 'R_D', unit: 'kΩ', ans: 10 }, { lbl: 'A_v', unit: '', ans: -20, traps: [{ v: -15, msg: 'Use the drop across $R_D$, which is $V_{DD} - V_D = 2\\,\\text{V}$, not $1.5\\,\\text{V}$.' }] }],
        hints: [md`The drop across $R_D$ can be at most $3 - 1 = 2\,\text{V}$.`, md`$A_v = -2V_{R_D}/V_{ov}$, or $g_m = 2I_D/V_{ov}$ times $R_D$.`],
        sol: md`
1. $V_{R_D}\le V_{DD} - 1\,\text{V} = 2\,\text{V}$, so $R_D\le\dfrac{2\,\text{V}}{0.2\,\text{mA}} = 10\kO$.
2. $g_m = \dfrac{2(0.2\,\text{mA})}{0.2\,\text{V}} = 2\,\text{mS}$, $A_v = -(2\,\text{mS})(10\kO) = -20$; the same as $-2V_{R_D}/V_{ov} = -2(2)/0.2$.

The gain is capped by the supply, not by the transistor: more gain from a resistor needs more DC drop. That is the reason for current-source loads.`,
      }),
      P({
        id: 'bk04-cs-sym', title: 'The common source, in symbols',
        q: md`Type $R_{out}$ and $A_v$ of the common source with $R_D$, keeping $r_{ds}$. Use \`gm\`, \`RD\`, \`rds\` (\`||\` means "in parallel with").`,
        fig: F.cs(),
        parts: [ex('RD || rds', ['RD', 'rds'], 'R_{out}', { exact: true }), ex('-gm*(RD || rds)', ['gm', 'RD', 'rds'], 'A_v', { exact: true })],
        hints: [md`Two resistors from the drain to incremental ground.`],
        sol: md`$R_{out} = R_D\parallel r_{ds} = \dfrac{R_Dr_{ds}}{R_D + r_{ds}}$ and $A_v = -g_m(R_D\parallel r_{ds})$. Typed: \`RD || rds\` and \`-gm*(RD || rds)\`.`,
      }),
      G('bk_cs', { need: 4 }),
    ],
  });

  // ================================================================== 3. the three loads
  L({
    id: 'bk04-loads', title: 'Three loads: resistor, diode, current source', ref: 'Lectures 15–16',
    steps: [
      RF(md`
        ### The question

        The common source turns $v_{in}$ into a current, $g_{m1}v_{in}$, and something above the drain turns that current back into a voltage. That something is the **load**. In an integrated circuit it is rarely a resistor: it is usually another transistor, wired either as a **diode** (gate tied to drain) or as a **current source** (gate held at a fixed bias). Which load gives how much gain, and why? Exam 2 asked for all three, and for the CMOS inverter, where both transistors are driven.

        ### The physical picture

        The load's job is to convert a change of current into a change of voltage. How much voltage it makes per unit of current is its **small-signal resistance**: the inverse slope of its $I$–$V$ curve at the operating point. Here are the three loads, each carrying $0.1\,\text{mA}$, plotted as current against the voltage across them:

        [[fig:iv]]

        - The **diode-connected** transistor's curve is very steep: a few millivolts more across it and its current changes a lot, because its own gate is pushed open by the same voltage. It absorbs $M_1$'s current changes with almost no voltage change: a **small** resistance, $1/g_m$, here $1\kO$.
        - The **resistor** is a straight line: $20\kO$, whatever the current.
        - The **current source** is nearly flat: it insists on its current, so any change of current forced on it by $M_1$ has to show up as a big change of voltage. A **large** resistance, its $r_{ds}$.

        !!intuition Stiff and soft
          $M_1$ says "the current changes by $g_{m1}v_{in}$". A soft load (the diode) accepts that with a shrug: the output barely moves. A stiff load (the current source) refuses to change its current, so the only way to settle the argument is for the output voltage to swing a lot. Big gain comes from a load that refuses.
      `, { iv: { fig: F.loadsIV(), cap: 'Current against the voltage across each load. Dots: each carrying $0.1\\,\\text{mA}$. The steeper the curve, the smaller the small-signal resistance.' } }),
      RF(md`
        ### What every load shares: $G_M = g_{m1}$

        **Short the output.** Whatever the load is, both of its ends are now at incremental ground: the output (shorted) and $V_{DD}$. A resistor with 0 V across it carries nothing. A load transistor has its drain, source and (for a diode or a current source) its gate all at incremental ground, so its $v_{gs} = 0$ and its $r_{ds}$ has 0 V across it: it carries nothing either. $M_1$'s own $r_{ds1}$ also has 0 V across it. The short supplies only $M_1$'s dependent-source current:
        $$G_M = g_{m1}\quad\text{for every load}$$

        **Turn the input off.** $M_1$'s gate and source are grounded, so $v_{gs1} = 0$ and $M_1$ is just $r_{ds1}$ from the output to ground. The load runs from the output to $V_{DD}$, also incremental ground, so it is in parallel:
        $$R_{out} = r_{ds1}\parallel R_{load},\qquad A_v = -g_{m1}\,(r_{ds1}\parallel R_{load})$$
        The whole section is therefore one question: **what does each load look like from the output?**

        ### Load 1: a resistor

        It looks like itself, $R_D$. That gives $A_v = -g_{m1}(R_D\parallel r_{ds1})$, [Section 2](#/l/bk04-cs). Typical size: $-10$ to $-30$, capped by the supply.

        ### Load 2: a diode-connected transistor

        $M_2$ is a PMOS with its source on $V_{DD}$ and its **gate tied to its own drain**, which is the output.

        [[fig:dc]]

        **Its resistance, from the model.** Put a test source $v_t$ on the drain with everything else at incremental ground ([Chapter 3](#/l/bk03-diode) did the same).

        *Step 1: $v_{gs2}$.* The gate is wired to the drain, so it sits at $v_t$; the source is on $V_{DD}$, at 0: $v_{gs2} = v_t - 0 = v_t$.

        *Step 2: the current.* From drain to source the dependent source carries $g_{m2}v_{gs2} = g_{m2}v_t$ and $r_{ds2}$ carries $v_t/r_{ds2}$. Both leave the test node, so $i_t = g_{m2}v_t + v_t/r_{ds2}$.

        *Step 3: divide.*
        $$R_{diode} = \frac{v_t}{i_t} = \frac{1}{g_{m2} + 1/r_{ds2}} = \frac{1}{g_{m2}}\parallel r_{ds2}\approx\frac{1}{g_{m2}}$$
        A current source whose current is proportional to the voltage across it **is** a resistor: $1/g_{m2}$.

        [[fig:dm]]

        **The gain.** Three things in parallel at the output: $r_{ds1}$, $r_{ds2}$ and $1/g_{m2}$. With $1/g_m$ near $1\kO$ and $r_{ds}$ near $100\kO$, the smallest wins:
        $$A_v = -g_{m1}\Big(r_{ds1}\parallel r_{ds2}\parallel\frac{1}{g_{m2}}\Big)\approx-\frac{g_{m1}}{g_{m2}}$$
        No resistor anywhere: the gain is a ratio of two transconductances.

        [[fig:dg]]
      `, {
        dc: { fig: F.csDiodeP(), cap: 'A diode-connected PMOS load: gate and drain tied together at the output.' },
        dm: { fig: F.pdiodeM(), cap: 'The diode alone, with a test source: $v_{gs2} = v_t$, so it draws $g_{m2}v_t$: a resistor $1/g_{m2}$.' },
        dg: { fig: F.twoM({ g1: 'g_{m1}\\cdot 0', g2: 'g_{m2}v_t', t2: '\\text{diode}', mode: 'test' }), cap: '$R_{out}$ of the whole stage ($v_{in} = 0$): $r_{ds1}$, $r_{ds2}$ and the diode\'s $1/g_{m2}$ in parallel.' },
      }),
      R(md`
        ### Gain from geometry

        $g_m$ depends on the bias, so it looks as if the gain must too. It does not.

        **Step 1: same current.** $M_1$ and $M_2$ are in series between $V_{DD}$ and ground, so they carry the same $I_D$.

        **Step 2: $g_m$ in terms of the current and the size.** From $I_D = \tfrac12\mu C_{ox}\tfrac WLV_{ov}^2$, $V_{ov} = \sqrt{2I_D/(\mu C_{ox}W/L)}$. Put that into $g_m = 2I_D/V_{ov}$:
        $$g_m = \frac{2I_D}{\sqrt{2I_D/(\mu C_{ox}W/L)}} = \sqrt{2\mu C_{ox}\tfrac WLI_D}$$

        **Step 3: the ratio.** The same $I_D$ sits under both square roots and cancels, and so do the 2's:
        $$|A_v|\approx\frac{g_{m1}}{g_{m2}} = \sqrt{\frac{\mu_nC_{ox}(W/L)_1}{\mu_pC_{ox}(W/L)_2}}$$
        Equivalently, with $g_m = 2I_D/V_{ov}$ and the same $I_D$: $|A_v|\approx V_{ov2}/V_{ov1}$, the load's overdrive over the input's.

        **Example.** $M_1$: NMOS, $40/1$. $M_2$: PMOS diode, $5/1$. $\sqrt{\dfrac{100\times40}{50\times5}} = \sqrt{16} = 4$, so $A_v\approx-4$, at any bias current.

        **What it is good for.** The gain is set by geometry, so it is predictable and nearly independent of temperature and bias; and the diode biases the output by itself, at $V_{DD} - |V_{GS2}|$. **What it costs:** the square root. A gain of 10 needs a $\mu C_{ox}W/L$ ratio of 100. Diode loads give small gains.

        **An NMOS diode load** (gate and drain on $V_{DD}$, source at the output) also looks like $\tfrac1{g_{m2}}\parallel r_{ds2}$: with the gate on $V_{DD}$, $v_{gs2} = 0 - v_t$, so $M_2$ carries $g_{m2}v_t$ from its source up to its drain, again proportional to $v_t$. Same type, same mobility: $|A_v|\approx\sqrt{(W/L)_1/(W/L)_2}$.
      `),
      RF(md`
        ### Load 3: a current source

        $M_2$ is a PMOS with its source on $V_{DD}$ and its **gate held** at a fixed bias $V_B$.

        [[fig:ic]]

        *Step 1: $v_{gs2}$.* The gate is held (0 for signals) and the source is on $V_{DD}$ (0): $v_{gs2} = 0$.

        *Step 2:* its dependent source carries $g_{m2}\cdot0 = 0$: open. Only $r_{ds2}$ is left between the output and $V_{DD}$.
        $$R_{out} = r_{ds1}\parallel r_{ds2},\qquad A_v = -g_{m1}\,(r_{ds1}\parallel r_{ds2})$$

        [[fig:im]]

        **How big?** Both carry the same $I_D$, so $r_{ds1} = 1/(\lambda_nI_D)$ and $r_{ds2} = 1/(\lambda_pI_D)$. In parallel, conductances add: $r_{ds1}\parallel r_{ds2} = \dfrac{1}{(\lambda_n + \lambda_p)I_D}$. With $g_{m1} = 2I_D/V_{ov1}$:
        $$A_v = -\frac{2I_D}{V_{ov1}}\cdot\frac{1}{(\lambda_n + \lambda_p)I_D} = -\frac{2}{(\lambda_n + \lambda_p)\,V_{ov1}}$$
        The current cancels. With $\lambda_n = \lambda_p = 0.05\,\text{V}^{-1}$ and $V_{ov1} = 0.2\,\text{V}$: $A_v = -\dfrac{2}{(0.1)(0.2)} = -100$. With equal $\lambda$'s this is half the intrinsic gain, $-\tfrac12g_{m1}r_{ds1}$: the output sees two $r_{ds}$ in parallel, $M_1$'s and the load's.

        **Why it wins.** The PMOS stays a current source as long as it has $|V_{DS}|\ge|V_{ov2}|$, about $0.2\,\text{V}$, yet it presents $r_{ds2}$, say $200\kO$ at $0.1\,\text{mA}$. A $200\kO$ resistor carrying $0.1\,\text{mA}$ would need $20\,\text{V}$ across it. The current source has a big **small-signal** resistance and a small **DC** drop: exactly what the resistor could not offer ([Section 2](#/l/bk04-cs)).
      `, {
        ic: { fig: F.csIsrc(), cap: 'A PMOS current-source load: its gate is held at a fixed bias $V_B$ (the triangle).' },
        im: { fig: F.twoM({ g1: 'g_{m1}\\cdot 0', g2: 'g_{m2}\\cdot 0', t2: '\\text{gate held}', mode: 'test' }), cap: '$R_{out}$ ($v_{in} = 0$): both dependent sources are dead; only $r_{ds1}$ and $r_{ds2}$ remain.' },
      }),
      RF(md`
        ### Both gates driven: the CMOS inverter as an amplifier

        Tie the PMOS gate to the NMOS gate and drive both with $v_{in}$.

        [[fig:inv]]

        **Physically:** when $v_{in}$ rises, the NMOS opens (pulls harder down) **and** the PMOS closes (pushes less current in from the top). Both push the output the same way, down, so they cooperate.

        **$G_M$, with the model.** Short the output. $M_1$: $v_{gs1} = v_{in}$, so it pulls $g_{m1}v_{in}$ down to ground. $M_2$: its source is on $V_{DD}$ (0) and its gate at $v_{in}$, so $v_{gs2} = v_{in}$ and it carries $g_{m2}v_{in}$ from its drain (the output) up to $V_{DD}$: also **out of** the output node. The short supplies both:
        $$G_M = g_{m1} + g_{m2}$$

        [[fig:invm]]

        **$R_{out}$:** $v_{in} = 0$ kills both dependent sources: $r_{ds1}\parallel r_{ds2}$.
        $$A_v = -(g_{m1} + g_{m2})(r_{ds1}\parallel r_{ds2})$$
        **Example:** $g_{m1} = g_{m2} = 1\,\text{mS}$, $r_{ds1} = r_{ds2} = 200\kO$: $A_v = -(2\,\text{mS})(100\kO) = -200$, twice the current-source-loaded stage, because the load transistor now works too.

        **The catch: bias.** Both transistors must be saturated at the same current, which happens only in a narrow window of $V_{in}$ (the steep middle of the inverter's transfer curve). In practice the input is coupled through a capacitor and a large resistor from output to input sets the DC point: the gate draws no DC current, so $V_{IN} = V_{OUT}$, right in the middle.
      `, {
        inv: { fig: F.inv(), cap: 'The CMOS inverter as an amplifier: one input drives both gates.' },
        invm: { fig: F.twoM({ g2: 'g_{m2}v_{in}', mode: 'short' }), cap: 'Output shorted: both dependent sources take current out of the output node, so their transconductances add.' },
      }),
      R(md`
        ### Check it, and the summary

        - **Limits.** Diode load with $r_{ds}\to\infty$: $-g_{m1}/g_{m2}$. Current-source load with $\lambda_p\to0$ (an ideal source): $-g_{m1}r_{ds1}$, the intrinsic gain. Inverter with $g_{m2} = 0$: back to the current-source load.
        - **Units:** every gain is (mS)(kΩ) or a ratio of mS's.
        - **One number each:** $g_{m1} = 1\,\text{mS}$, all $r_{ds} = 200\kO$: resistor $10\kO$ gives $-9.5$; diode with $g_{m2} = 1\,\text{mS}$ gives $-0.99$; current source gives $-100$; inverter with $g_{m2} = 1\,\text{mS}$ gives $-200$.

        | Load (above the output) | What it looks like | $R_{out}$ | $A_v$ | Typical |
        |---|---|---|---|---|
        | resistor $R_D$ | $R_D$ | $R_D\parallel r_{ds1}$ | $-g_{m1}(R_D\parallel r_{ds1})$ | $-10$ to $-30$ |
        | diode-connected $M_2$ | $\tfrac1{g_{m2}}$ (its gate moves with the output) | $\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}$ | $\approx-\dfrac{g_{m1}}{g_{m2}} = -\sqrt{\dfrac{\mu_1(W/L)_1}{\mu_2(W/L)_2}}$ | $-2$ to $-5$ |
        | current source $M_2$ (gate held) | $r_{ds2}$ (its gate is still) | $r_{ds1}\parallel r_{ds2}$ | $-\dfrac{2}{(\lambda_n + \lambda_p)V_{ov1}}$ | about $-100$ |
        | $M_2$ driven too (inverter) | $r_{ds2}$, and it adds $g_{m2}$ | $r_{ds1}\parallel r_{ds2}$ | $-(g_{m1} + g_{m2})(r_{ds1}\parallel r_{ds2})$ | about $-200$ |

        **What it means.** One fact runs the whole table: **a transistor whose gate moves with the output looks small ($1/g_m$); a transistor whose gate holds still looks big ($r_{ds}$); a transistor whose gate is driven by the input adds its $g_m$ to $G_M$.**

        ### How to recognize it

        Find the transistor above the output and look at its gate: wired to the output (diode: $1/g_m$), tied to a bias or a triangle (current source: $r_{ds}$), or tied to $v_{in}$ (inverter: it joins $G_M$).

        !!mistake Common mistakes
          - **Size ratio without the square root.** The gain is the ratio of $g_m$'s, which is the square root of the ratio of $\mu C_{ox}W/L$.
          - **Forgetting $\mu_n/\mu_p = 2$** when the load is a PMOS and the input an NMOS.
          - **A current-source load as an open circuit.** An ideal one is, but a real transistor current source is $r_{ds2}$, and it sets half the gain.
          - **Doubling $I_D$ to double the gain** of a current-source-loaded stage. $A_v = -2/((\lambda_n + \lambda_p)V_{ov1})$: more current at fixed size raises $V_{ov1}$ and **lowers** the gain.
          - **One transconductance for the inverter.** Both gates are driven: $G_M = g_{m1} + g_{m2}$.
      `),
      Q(md`At the same bias current and the same input transistor, which load gives the largest gain?`,
        ['A transistor current source (gate held at a bias).', 'A resistor, because it has no $1/g_m$.', 'A diode-connected transistor.', 'All give the same gain, since $G_M = g_{m1}$ for all three.'], 0,
        [null,
          'A resistor large enough to compete with $r_{ds}$ would need a huge DC drop; with any realistic supply it stays near $10\\,\\text{k}\\Omega$.',
          'The diode is the **smallest** load ($1/g_m$): it gives the smallest gain.',
          '$G_M$ is the same, but the gain is $G_MR_{out}$ and $R_{out}$ is very different.'],
        md`$G_M = g_{m1}$ for every load, so the gain follows $R_{out}$. The current source presents $r_{ds2}$ (about $100\kO$ or more) while needing only a few tenths of a volt; the diode presents $1/g_{m2}$ (about $1\kO$); a resistor sits in between and is limited by the supply.`),
      Q(md`A common source with a diode-connected load has a gain of $-3$. You want $-6$ by changing only the input transistor's $W/L$. By what factor must $(W/L)_1$ grow?`,
        ['4', '2', '$\\sqrt2$', '36'], 0,
        [null, 'The gain goes as the **square root** of $(W/L)_1$: doubling the size gives only $\\sqrt2$ times the gain.', 'That would raise the gain by $2^{1/4}$.', 'That is the size ratio for a gain of 6 from scratch, not the factor of change.'],
        md`$|A_v|\approx\sqrt{\mu_1(W/L)_1/(\mu_2(W/L)_2)}$. To double the gain, the quantity under the root must grow by $2^2 = 4$.`),
      Q(md`A common source with a current-source load has $A_v = -100$ at $I_D = 0.1\,\text{mA}$. Keeping all sizes, the bias current is raised to $0.2\,\text{mA}$. The new gain is about:`,
        ['$-71$ (it falls by $\\sqrt2$)', '$-100$ (unchanged)', '$-200$ (it doubles)', '$-50$ (it halves)'], 0,
        [null,
          'That would be true at a fixed **overdrive**. At a fixed size, doubling $I_D$ raises $V_{ov1}$ by $\\sqrt2$.',
          '$g_{m1}$ grows by $\\sqrt2$ but $r_{ds1}\\parallel r_{ds2}$ halves.',
          '$A_v = -2/((\\lambda_n + \\lambda_p)V_{ov1})$ and $V_{ov1}$ grows by $\\sqrt2$, not 2.'],
        md`$A_v = -\dfrac{2}{(\lambda_n + \lambda_p)V_{ov1}}$ and, at fixed $W/L$, $V_{ov1} = \sqrt{2I_D/(\mu C_{ox}W/L)}$ grows by $\sqrt2$ when $I_D$ doubles. So $|A_v|$ drops to $100/\sqrt2\approx71$. In factors: $g_{m1}$ up by $\sqrt2$, $r_{ds1}\parallel r_{ds2}$ down by 2.`),
      Q(md`In a CMOS inverter used as an amplifier, why is $G_M = g_{m1} + g_{m2}$ rather than $g_{m1} - g_{m2}$?`,
        ['When $v_{in}$ rises, the NMOS pulls more current down and the PMOS pushes less current in: both lower the output.', 'Because the two transistors are in parallel at DC.', 'Because PMOS transconductance is negative.', 'It is $g_{m1} - g_{m2}$; the two cancel when they are equal.'], 0,
        [null,
          'At DC they are in series (same current). What matters is the direction each one moves the output.',
          '$g_m$ is positive for both; with $i_d$ drawn from drain to source the same model serves NMOS and PMOS.',
          'They would cancel only if one pushed the output up while the other pulled it down. Here both pull it down.'],
        md`With the output shorted, $M_1$ carries $g_{m1}v_{in}$ from the output down to ground and $M_2$ (with $v_{gs2} = v_{in}$) carries $g_{m2}v_{in}$ from the output up to $V_{DD}$. Both currents leave the output node, so the short supplies their sum.`),
      P({
        id: 'bk04-loads-size', title: 'Diode load: gain from sizes',
        q: md`$M_1$ is an NMOS with $W/L = 72/1$; its load is a diode-connected PMOS $M_2$ with $W/L = 4/1$. Course parameters. Ignoring $r_{ds}$, find $A_v$.`,
        fig: F.csDiodeP({ sz1: '72/1', sz2: '4/1' }),
        parts: [{ lbl: 'A_v', unit: '', ans: -6, traps: [{ v: -36, msg: 'That is the ratio of $\\mu C_{ox}W/L$; the gain is its square root.' }, { v: -Math.sqrt(18), msg: 'Include the mobility ratio $\\mu_nC_{ox}/\\mu_pC_{ox} = 2$ under the square root.' }, { v: 6, msg: 'A common source inverts.' }] }],
        hints: [md`$A_v\approx-g_{m1}/g_{m2}$ and, at equal currents, $g_{m1}/g_{m2} = \sqrt{\mu_n(W/L)_1/(\mu_p(W/L)_2)}$.`],
        sol: md`
1. The diode looks like $1/g_{m2}$, so $A_v\approx-g_{m1}/g_{m2}$.
2. Same $I_D$ in both: $\dfrac{g_{m1}}{g_{m2}} = \sqrt{\dfrac{100\times72}{50\times4}} = \sqrt{\dfrac{7200}{200}} = \sqrt{36} = 6$.
3. $A_v\approx-6$.`,
      }),
      P({
        id: 'bk04-loads-diode-rds', title: 'Diode load, keeping $r_{ds}$',
        q: md`Common source with a diode-connected PMOS load: $g_{m1} = 2\,\text{mS}$, $g_{m2} = 0.5\,\text{mS}$, $r_{ds1} = r_{ds2} = 100\kO$. Find $R_{out}$ and $A_v$ exactly, and compare with $-g_{m1}/g_{m2}$.`,
        fig: F.csDiodeP(),
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 1 / 0.52, traps: [{ v: 2, msg: 'That is $1/g_{m2}$ alone. Both $r_{ds}$ are in parallel with it.' }] },
          { lbl: 'A_v', unit: '', ans: -2 / 0.52, traps: [{ v: -4, msg: 'That is the approximation $-g_{m1}/g_{m2}$; the question asks for the exact value with both $r_{ds}$.' }] }],
        hints: [md`Add conductances: $g_{m2} + 1/r_{ds1} + 1/r_{ds2}$.`],
        sol: md`
1. Conductances at the output, in mS: $g_{m2} = 0.5$, $1/r_{ds1} = 0.01$, $1/r_{ds2} = 0.01$. Total $0.52\,\text{mS}$, so $R_{out} = 1/0.52\,\text{mS} = 1.923\kO$.
2. $A_v = -(2\,\text{mS})(1.923\kO) = -3.85$.
3. The approximation $-g_{m1}/g_{m2} = -4$ is $4\%$ high: the two $r_{ds}$ steal a little of the signal current.`,
      }),
      P({
        id: 'bk04-loads-isrc', title: 'Current-source load from $\\lambda$ and $V_{ov}$',
        q: md`A common source with a PMOS current-source load runs at $I_D = 0.1\,\text{mA}$ with $V_{ov1} = 0.25\,\text{V}$; $\lambda_n = 0.04\,\text{V}^{-1}$, $\lambda_p = 0.06\,\text{V}^{-1}$. Find $g_{m1}$, $r_{ds1}$, $r_{ds2}$ and $A_v$.`,
        fig: F.csIsrc(),
        parts: [{ lbl: 'g_{m1}', unit: 'mS', ans: 0.8 }, { lbl: 'r_{ds1}', unit: 'kΩ', ans: 250 }, { lbl: 'r_{ds2}', unit: 'kΩ', ans: 500 / 3 },
          { lbl: 'A_v', unit: '', ans: -80, traps: [{ v: -200, msg: 'That is $-g_{m1}r_{ds1}$: the load\'s $r_{ds2}$ is in parallel with $r_{ds1}$.' }] }],
        hints: [md`$g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$.`, md`Or directly: $A_v = -2/((\lambda_n + \lambda_p)V_{ov1})$.`],
        sol: md`
1. $g_{m1} = \dfrac{2(0.1\,\text{mA})}{0.25\,\text{V}} = 0.8\,\text{mS}$.
2. $r_{ds1} = \dfrac{1}{(0.04)(0.1\,\text{mA})} = 250\kO$; $r_{ds2} = \dfrac{1}{(0.06)(0.1\,\text{mA})} = 166.7\kO$.
3. $r_{ds1}\parallel r_{ds2} = \dfrac{1}{(0.04 + 0.06)(0.1\,\text{mA})} = 100\kO$, so $A_v = -(0.8\,\text{mS})(100\kO) = -80$.
4. Check with the shortcut: $-\dfrac{2}{(0.1)(0.25)} = -80$.`,
      }),
      P({
        id: 'bk04-loads-inv', title: 'The inverter as an amplifier',
        q: md`A CMOS inverter is biased with both transistors saturated at $I_D = 0.2\,\text{mA}$. The NMOS has $V_{ov} = 0.2\,\text{V}$, the PMOS $|V_{ov}| = 0.4\,\text{V}$, and $\lambda = 0.05\,\text{V}^{-1}$ for both. Find $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.inv(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 3, traps: [{ v: 2, msg: 'That is $g_{m1}$ alone: the PMOS is driven by $v_{in}$ too, and its current change adds.' }, { v: 1, msg: 'The two do not fight: both lower the output when $v_{in}$ rises, so $G_M = g_{m1} + g_{m2}$.' }] },
          { lbl: 'R_{out}', unit: 'kΩ', ans: 50 }, { lbl: 'A_v', unit: '', ans: -150 }],
        hints: [md`$g_{m1} = 2I_D/V_{ov,n}$, $g_{m2} = 2I_D/|V_{ov,p}|$, $r_{ds} = 1/(\lambda I_D)$.`, md`$G_M = g_{m1} + g_{m2}$, $R_{out} = r_{ds1}\parallel r_{ds2}$.`],
        sol: md`
1. $g_{m1} = 0.4/0.2 = 2\,\text{mS}$, $g_{m2} = 0.4/0.4 = 1\,\text{mS}$, $r_{ds1} = r_{ds2} = \dfrac{1}{(0.05)(0.2\,\text{mA})} = 100\kO$.
2. $G_M = g_{m1} + g_{m2} = 3\,\text{mS}$; $R_{out} = 100\text{k}\parallel100\text{k} = 50\kO$.
3. $A_v = -(3\,\text{mS})(50\kO) = -150$.`,
      }),
      P({
        id: 'bk04-loads-ndiode', title: 'An NMOS diode load',
        q: md`$M_1$ (NMOS, $W/L = 50/1$) has an NMOS diode-connected load $M_2$ ($W/L = 2/1$): $M_2$'s gate and drain are on $V_{DD}$ and its source is the output. Ignoring $r_{ds}$, find $A_v$.`,
        fig: F.csDiodeN({ sz1: '50/1', sz2: '2/1' }),
        parts: [{ lbl: 'A_v', unit: '', ans: -5, traps: [{ v: -25, msg: 'Square root: the gain is the ratio of $g_m$\'s.' }, { v: -5 / Math.SQRT2, msg: 'No mobility factor here: both transistors are NMOS.' }] }],
        hints: [md`Seen from its source with its gate on $V_{DD}$, $M_2$ looks like $1/g_{m2}$.`],
        sol: md`
1. $M_2$: gate at incremental ground, source at the output, so $v_{gs2} = -v_{out}$ and it carries $g_{m2}v_{out}$ up out of the output node: a resistor $1/g_{m2}$.
2. $A_v\approx-g_{m1}/g_{m2} = -\sqrt{50/2} = -\sqrt{25} = -5$ (same type: no mobility ratio).`,
      }),
      P({
        id: 'bk04-loads-pin', title: 'Upside down: PMOS input, NMOS current source',
        q: md`The input transistor $M_1$ is a PMOS (source on $V_{DD}$, gate driven by $v_{in}$) and the load $M_2$ is an NMOS current source (gate held at $V_B$). $g_{m1} = 0.5\,\text{mS}$, $r_{ds1} = 400\kO$, $r_{ds2} = 200\kO$. Find $A_v$.`,
        fig: F.csPisrc(),
        parts: [{ lbl: 'A_v', unit: '', ans: -0.5 * (400 * 200) / 600, traps: [{ v: 0.5 * (400 * 200) / 600, msg: 'A PMOS common source inverts too: the model is the same.' }, { v: -200, msg: 'That is $-g_{m1}r_{ds1}$: $r_{ds2}$ is in parallel.' }] }],
        hints: [md`Same model, same result: $A_v = -g_{m1}(r_{ds1}\parallel r_{ds2})$.`],
        sol: md`
1. $G_M = g_{m1} = 0.5\,\text{mS}$ (output shorted: $v_{gs1} = v_{in}$, and $M_1$ carries $g_{m1}v_{in}$ from the output up to $V_{DD}$).
2. $R_{out} = r_{ds1}\parallel r_{ds2} = 400\text{k}\parallel200\text{k} = 133.3\kO$.
3. $A_v = -(0.5\,\text{mS})(133.3\kO) = -66.7$.`,
      }),
      P({
        id: 'bk04-loads-sym', title: 'The loads, in symbols',
        q: md`Type $A_v$ for (a) the diode-connected PMOS load and (b) the CMOS inverter, keeping every $r_{ds}$. Use \`gm1\`, \`gm2\`, \`rds1\`, \`rds2\`.`,
        fig: F.csDiodeP(),
        parts: [ex('-gm1*(rds1 || rds2 || 1/gm2)', ['gm1', 'gm2', 'rds1', 'rds2'], 'A_v\\text{ (a) diode}', { exact: true, ranges: { gm2: [2e-4, 2e-3], rds1: [2e4, 2e5], rds2: [2e4, 2e5] } }),
          ex('-(gm1 + gm2)*(rds1 || rds2)', ['gm1', 'gm2', 'rds1', 'rds2'], 'A_v\\text{ (b) inverter}', { exact: true })],
        hints: [md`(a) Three things in parallel at the output. (b) Two transconductances, two $r_{ds}$.`],
        sol: md`(a) $A_v = -g_{m1}\big(r_{ds1}\parallel r_{ds2}\parallel\tfrac1{g_{m2}}\big)$: \`-gm1*(rds1 || rds2 || 1/gm2)\`. (b) $A_v = -(g_{m1} + g_{m2})(r_{ds1}\parallel r_{ds2})$: \`-(gm1 + gm2)*(rds1 || rds2)\`.`,
      }),
      G('bk_loads', { need: 4 }),
    ],
  });

  // ================================================================== 4. source degeneration
  L({
    id: 'bk04-degen', title: 'Source degeneration', ref: 'Lectures 16–17',
    steps: [
      RF(md`
        ### The question

        Put a resistor $R_S$ between the source and ground. What happens to $G_M$, to $R_{out}$ and to the gain, exactly, with $r_{ds}$ kept? And why would anyone throw gain away like this? Exam 2 asked for degenerated stages in every form: alone, with a diode or a current source in the source, and as the bottom of a stack.

        [[fig:c]]

        ### The physical picture

        In a plain common source the source is nailed to ground, so all of $v_{in}$ lands across gate and source. With $R_S$ underneath, the source is free to move, and it moves **with the current**: $v_s = i_dR_S$. When $v_{in}$ rises, the current rises, the source rises behind it, and $v_{gs} = v_{in} - v_s$ grows by less than $v_{in}$ did. The transistor gets only part of its input.

        **Numbers.** $g_m = 2\,\text{mS}$, $R_S = 1\kO$, $v_{in} = 30\,\text{mV}$. Try $v_{gs} = 10\,\text{mV}$: then $i_d = g_mv_{gs} = 20\,\mu\text{A}$, so $v_s = (20\,\mu\text{A})(1\kO) = 20\,\text{mV}$, and indeed $v_{gs} + v_s = 30\,\text{mV}$. Two thirds of the input is used up across $R_S$; the stage delivers $20\,\mu\text{A}$ per $30\,\text{mV}$, a transconductance of $0.67\,\text{mS}$ instead of $2\,\text{mS}$.

        This is **negative feedback** inside one transistor: more current raises the source, which closes the valve a little, which holds the current back. The Art of Electronics puts it as "the emitter (here: the source) follows the base (gate)". In the limit of a very large $R_S$, almost all of $v_{in}$ appears across $R_S$, the current is simply $v_{in}/R_S$, and the transistor's own $g_m$, which drifts with temperature, bias and process, drops out.
      `, { c: { fig: F.csDeg(), cap: 'The degenerated common source: $R_S$ between the source and ground.' } }),
      RF(md`
        ### The model

        Saturation, small signals. $R_S$ stays in the small-signal circuit (it is not a supply). We first drop $r_{ds}$ to see the main result cleanly, then put it back and get the exact answer.

        ### Derivation 1: $G_M$, ignoring $r_{ds}$

        Short the drain. Call the transistor's current $i_d$ (drain to source).

        **Step 1: the same current flows in $R_S$.** The gate draws nothing, so the only paths at the source node are the transistor and $R_S$: KCL gives the current down $R_S$ as $i_d$. So $v_s = i_dR_S$.

        **Step 2: what is $v_{gs}$?** $v_{gs} = v_{in} - v_s = v_{in} - i_dR_S$.

        **Step 3: the transistor.** $i_d = g_mv_{gs} = g_mv_{in} - g_mR_S\,i_d$.

        **Step 4: collect $i_d$.** $i_d(1 + g_mR_S) = g_mv_{in}$. With the drain shorted, $R_D$ carries nothing, so $i_{out} = i_d$:
        $$G_M = \frac{g_m}{1 + g_mR_S}$$

        [[fig:s0]]

        ### Derivation 2: $G_M$ with $r_{ds}$

        Same circuit with $r_{ds}$ from drain to source. Unknowns: $v_s$ and $i_{out}$.

        **Step 1: current down through the transistor**, dependent source plus $r_{ds}$. The drain is at 0 V (shorted), the source at $v_s$:
        $$i_{out} = g_m(v_{in} - v_s) + \frac{0 - v_s}{r_{ds}}$$

        **Step 2: the same current goes down $R_S$** (nothing else touches the source node, and all of $i_{out}$ goes down the transistor because $R_D$ carries nothing): $v_s = i_{out}R_S$.

        **Step 3: substitute** $v_s$:
        $$i_{out} = g_mv_{in} - g_mR_S\,i_{out} - \frac{R_S}{r_{ds}}\,i_{out}$$

        **Step 4: collect $i_{out}$:**
        $$G_M = \frac{g_m}{1 + g_mR_S + R_S/r_{ds}}$$
        The extra $R_S/r_{ds}$ is tiny ($1\text{k}/50\text{k} = 0.02$ next to $1 + g_mR_S\approx3$), which is why Derivation 1 is usually good enough.

        [[fig:s1]]
      `, {
        s0: { fig: F.degM('short', { rds: false }), cap: 'Output shorted, $r_{ds}$ dropped: the source rises to $v_s = i_dR_S$ and eats part of $v_{in}$.' },
        s1: { fig: F.degM('short'), cap: 'The same with $r_{ds}$: one more path from drain to source.' },
      }),
      RF(md`
        ### $R_{out}$: turn the input off

        The gate is grounded, $R_S$ sits under the source, a test source $v_t$ is on the drain. Its current splits: up through $R_D$, and down into the transistor, call that part $i_{dn}$. So $R_{out} = R_D\parallel R_{DN}$ with $R_{DN} = v_t/i_{dn}$. [Chapter 3](#/l/bk03-degen) derived $R_{DN}$; here it is again in four lines.

        **Step 1:** $i_{dn}$ goes on down through $R_S$: $v_s = i_{dn}R_S$, and with the gate grounded $v_{gs} = -v_s$. The dependent source is **alive**, driven by $v_s$.

        **Step 2: current down through the transistor:** $i_{dn} = g_m(-v_s) + \dfrac{v_t - v_s}{r_{ds}}$.

        **Step 3: substitute $v_s$ and multiply by $r_{ds}$:** $i_{dn}r_{ds} = -g_mr_{ds}R_S\,i_{dn} + v_t - R_S\,i_{dn}$.

        **Step 4: collect:** $i_{dn}(r_{ds} + R_S + g_mr_{ds}R_S) = v_t$, so
        $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S\approx r_{ds}(1 + g_mR_S),\qquad R_{out} = R_D\parallel R_{DN}$$

        [[fig:t]]

        **Why the drain looks so big.** Push the drain up and the current tries to grow through $r_{ds}$; but any extra current raises the source, which lowers $v_{gs}$, which throttles the current. The same feedback that shrank $G_M$ by $(1 + g_mR_S)$ grows the drain resistance by about the same factor.

        ### The gain

        $$A_v = -G_MR_{out}$$
        **The compact form.** Multiply the top and bottom of $G_M$ by $r_{ds}$: $G_M = \dfrac{g_mr_{ds}}{N}$ with $N = r_{ds} + R_S + g_mr_{ds}R_S$, the same $N$ as $R_{DN}$. Then $R_{out} = \dfrac{R_DN}{R_D + N}$, and in the product the $N$ cancels:
        $$A_v = -\frac{g_mr_{ds}R_D}{R_D + r_{ds} + R_S + g_mr_{ds}R_S}$$
        **The usual approximation** ($r_{ds}\to\infty$, so $R_{out}\to R_D$):

        !!key Source degeneration (Lectures 16–17)
          $$G_M = \frac{g_m}{1 + g_mR_S + R_S/r_{ds}}\approx\frac{g_m}{1 + g_mR_S},\qquad R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)\approx R_D$$
          $$A_v\approx-\frac{g_mR_D}{1 + g_mR_S} = -\frac{R_D}{1/g_m + R_S}\ \xrightarrow{\ g_mR_S\gg1\ }\ -\frac{R_D}{R_S}$$
      `, { t: { fig: F.degM('test'), cap: '$R_{out}$: gate grounded, test source on the drain. The dependent source is driven by $v_{gs} = -v_s$: alive.' } }),
      RF(md`
        ### Check it

        - **$R_S = 0$:** the compact form gives $-\dfrac{g_mr_{ds}R_D}{R_D + r_{ds}} = -g_m(R_D\parallel r_{ds})$, the plain common source.
        - **$r_{ds}\to\infty$:** divide top and bottom by $r_{ds}$: $-\dfrac{g_mR_D}{1 + g_mR_S}$.
        - **$R_D\to\infty$** (an ideal current-source load): $A_v\to-g_mr_{ds}$, the intrinsic gain, **whatever $R_S$ is**. With an ideal current source on the drain, the drain current cannot change at all; no signal current flows in $R_S$, so $v_s = 0$, and all of $g_mv_{in}$ circulates through $r_{ds}$. In the $G_MR_{out}$ picture, $G_M$ fell by $(1 + g_mR_S)$ and $R_{out}$ rose by the same factor.
        - **Units** and **one number:** the worked example below.

        ### What it means

        **1. A ratio of resistances.** $A_v\approx-\dfrac{R_D}{1/g_m + R_S}$ reads: the resistance in the drain over the resistance in the source path, where the transistor itself contributes $1/g_m$ ([Section 1](#/l/bk04-norton), method 3). $v_{in}$ drives a current through $1/g_m + R_S$, and the same current is pulled out of $R_D$.

        **2. Desensitization.** Write $A_v\approx-\dfrac{R_D}{R_S}\cdot\dfrac{g_mR_S}{1 + g_mR_S}$. Once $g_mR_S$ is large the second factor is close to 1, so the gain hardly depends on $g_m$. Differentiating, a fractional change in $g_m$ moves the gain by only $\dfrac{1}{1 + g_mR_S}$ of it: with $g_mR_S = 9$, a $10\%$ drop in $g_m$ costs about $1\%$ of gain.

        [[fig:gm]]

        **3. Linearity.** The square law is curved. With $R_S$, most of $V_{in}$ lands across a linear resistor and the transistor sees only $v_{gs} = v_{in}/(1 + g_mR_S)$, so its curvature matters $(1 + g_mR_S)$ times less ([Chapter 1](#/l/bk01-tangent): the distortion grows with $v_{gs}/V_{ov}$).

        [[fig:lin]]

        You pay for all three with gain: the plain common source with the same $R_D$ would have $|A_v| = g_mR_D$, $(1 + g_mR_S)$ times more.
      `, {
        gm: { fig: F.degGM(), cap: '$G_M$ in units of $1/R_S$: it starts like $g_m$ and saturates at $1/R_S$ once $g_mR_S\\gg1$.' },
        lin: { fig: F.degLin(), cap: 'Drain current against $V_{in}$ ($K = 2\\,\\text{mA/V}^2$): the square law alone, and with $R_S = 1\\,\\text{k}\\Omega$, where it straightens toward a slope of $1/R_S$.' },
      }),
      RF(md`
        ### Other things in the source

        **A bypass capacitor.** Put a large capacitor $C_S$ across $R_S$. At DC the capacitor is open: $R_S$ sets and stabilizes the bias. For signals it is a short: the source is at incremental ground and the gain is the full $-g_m(R_D\parallel r_{ds})$. The best of both, as long as the signal frequency is high enough for $C_S$ to act as a short ([Chapter 10](#/l/bk10-cap)).

        [[fig:cap]]

        **A diode-connected transistor** $M_3$ under the source. Seen from its drain it is a resistor $1/g_{m3}$ ([Section 3](#/l/bk04-loads)). Use $R_S = 1/g_{m3}$:
        $$G_M\approx\frac{g_{m1}}{1 + g_{m1}/g_{m3}} = \frac{g_{m1}g_{m3}}{g_{m1} + g_{m3}}$$
        With $g_{m1} = g_{m3}$, $G_M = g_{m1}/2$.

        [[fig:dio]]

        **An ideal current source** under the source: an open circuit for signals, $R_S = \infty$, so $G_M = 0$. The drain current is pinned; nothing $v_{in}$ does can change it.

        **PMOS.** A PMOS with $R_S$ between $V_{DD}$ and its source: the same model, the same formulas.

        ### How to recognize it

        Gate in, drain out, and something with resistance between the source and its supply that is **not** bypassed. Say: "degenerated: $-R_D$ over ($1/g_m + R_S$)", and remember the drain now looks like $r_{ds}(1 + g_mR_S)$.

        ### Worked example

        $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 1\kO$, $R_D = 10\kO$.
        1. $g_mR_S = 2$, $R_S/r_{ds} = 0.02$: $G_M = \dfrac{2\,\text{mS}}{3.02} = 0.662\,\text{mS}$.
        2. $R_{DN} = 50 + 1 + (2)(50)(1) = 151\kO$; $R_{out} = 10\text{k}\parallel151\text{k} = 9.38\kO$.
        3. $A_v = -(0.662\,\text{mS})(9.38\kO) = -6.21$. Compact form: $-\dfrac{(2)(50)(10)}{10 + 151} = -\dfrac{1000}{161} = -6.21$.
        4. Without $r_{ds}$: $-\dfrac{20}{3} = -6.67$. The limit $-R_D/R_S = -10$ is far off: $g_mR_S = 2$ is not $\gg1$.

        !!mistake Common mistakes
          - **$v_{gs} = v_{in}$.** The source moves: $v_{gs} = v_{in} - v_s$.
          - **$R_S$ in series with $R_D$** in $R_{out}$. $R_S$ is under the source; it multiplies the drain resistance, it does not add to $R_D$.
          - **$-R_D/R_S$ when $g_mR_S$ is not large.** Keep the $1/g_m$: $-R_D/(1/g_m + R_S)$.
          - **Keeping $R_S$ when it is bypassed.** A bypass capacitor removes $R_S$ from the signal path.
          - **Forgetting that the drain resistance grows.** In a stack, the next transistor up sees $r_{ds}(1 + g_mR_S)$, not $r_{ds}$.
      `, {
        cap: { fig: F.csDegC(), cap: '$R_S$ bypassed by a large $C_S$: $R_S$ for DC, a short for signals.' },
        dio: { fig: F.csDegDiode(), cap: 'A diode-connected $M_3$ under the source acts as $R_S = 1/g_{m3}$.' },
      }),
      Q(md`A degenerated common source has $g_mR_S = 9$. Its $g_m$ doubles (a different bias, or a different chip). By about how much does the gain change? (Ignore $r_{ds}$.)`,
        ['About $+5\\%$', 'It doubles', 'About $+41\\%$', 'It does not change at all'], 0,
        [null,
          'That is the plain common source. With degeneration the gain is $\\frac{R_D}{R_S}\\cdot\\frac{g_mR_S}{1 + g_mR_S}$, and that second factor is already near 1.',
          'That would be a square-root dependence; here the factor goes from $9/10$ to $18/19$.',
          'It changes a little: $g_mR_S/(1 + g_mR_S)$ is close to 1 but not equal to it.'],
        md`$A_v\approx-\dfrac{R_D}{R_S}\cdot\dfrac{g_mR_S}{1 + g_mR_S}$. The second factor goes from $\dfrac{9}{10} = 0.900$ to $\dfrac{18}{19} = 0.947$: a $5\%$ rise for a $100\%$ rise in $g_m$. That insensitivity is the reason for degeneration.`),
      Q(md`A degenerated common source drives an **ideal** current-source load (instead of $R_D$). Keeping $r_{ds}$, its gain is:`,
        ['$-g_mr_{ds}$, as if $R_S$ were not there', '$-\\dfrac{g_mr_{ds}}{1 + g_mR_S}$', '$-r_{ds}/R_S$', 'zero, because the current cannot change'], 0,
        [null,
          'That divides by $(1 + g_mR_S)$ but forgets that $R_{out}$ is multiplied by the same factor.',
          'That is the resistor-ratio limit with $R_D = r_{ds}$, which does not describe this circuit.',
          'The current cannot change, but the voltage can: the output moves until $r_{ds}$ carries $-g_mv_{gs}$.'],
        md`With an ideal current source on the drain, the drain current is fixed, so no signal current flows in $R_S$: $v_s = 0$ and $v_{gs} = v_{in}$. The dependent source's $g_mv_{in}$ must then flow back through $r_{ds}$, giving $v_{out} = -g_mr_{ds}v_{in}$. In $G_MR_{out}$ terms: $G_M\approx g_m/(1 + g_mR_S)$ and $R_{out}\approx r_{ds}(1 + g_mR_S)$; the factors cancel.`),
      Q(md`$R_S$ is bypassed by a large capacitor $C_S$. What is the small-signal gain at signal frequencies (ignore $r_{ds}$)?`,
        ['$-g_mR_D$, the full common-source gain', '$-\\dfrac{g_mR_D}{1 + g_mR_S}$', '$-R_D/R_S$', 'Zero, because the source is shorted to ground'], 0,
        [null,
          'That is the unbypassed stage. For signals the capacitor shorts $R_S$.',
          'With $R_S$ shorted there is nothing in the source path but $1/g_m$.',
          'A grounded source is exactly the plain common source; it has full gain.'],
        md`For signals the capacitor is a short, so the source is at incremental ground and $v_{gs} = v_{in}$: $A_v = -g_mR_D$ (with $r_{ds}$: $-g_m(R_D\parallel r_{ds})$). $R_S$ still matters at DC, where it sets and stabilizes the bias current.`),
      Q(md`How does $R_S$ change the resistance looking down into the drain of the transistor?`,
        ['It multiplies it: from $r_{ds}$ to about $r_{ds}(1 + g_mR_S)$.', 'It adds to it: $r_{ds} + R_S$.', 'It divides it by $1 + g_mR_S$.', 'Not at all: the drain resistance is always $r_{ds}$.'], 0,
        [null,
          'That forgets the feedback: the dependent source, driven by $v_{gs} = -v_s$, fights any change of current.',
          'That is what happens to $G_M$, not to the drain resistance.',
          'Only with the source at incremental ground.'],
        md`$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S\approx r_{ds}(1 + g_mR_S)$. Raising the drain pushes more current, which raises the source, which lowers $v_{gs}$ and throttles the current: the drain resists being moved, so it looks large. This is the impedance scaler of [Chapter 3](#/l/bk03-degen).`),
      P({
        id: 'bk04-degen-approx', title: 'Degenerated gain from the bias',
        q: md`A degenerated common source runs at $I_D = 0.25\,\text{mA}$ with $V_{ov} = 0.25\,\text{V}$; $R_S = 2\kO$, $R_D = 20\kO$. Ignoring $r_{ds}$, find $g_m$ and $A_v$. How far is it from $-R_D/R_S$?`,
        fig: F.csDeg({ RD: '20\\,\\text{k}\\Omega', RS: '2\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 2 }, { lbl: 'A_v', unit: '', ans: -8, traps: [{ v: -10, msg: 'That is the $g_mR_S\\gg1$ limit; here $g_mR_S = 4$, so keep the $1/g_m$.' }, { v: -40, msg: 'That is the plain common source: $R_S$ divides the gain by $1 + g_mR_S = 5$.' }] }],
        hints: [md`$g_m = 2I_D/V_{ov}$.`, md`$A_v = -R_D/(1/g_m + R_S)$.`],
        sol: md`
1. $g_m = \dfrac{2(0.25\,\text{mA})}{0.25\,\text{V}} = 2\,\text{mS}$, so $1/g_m = 500\,\Omega$ and $g_mR_S = 4$.
2. $A_v = -\dfrac{R_D}{1/g_m + R_S} = -\dfrac{20\kO}{0.5\kO + 2\kO} = -8$.
3. $-R_D/R_S = -10$ is $25\%$ too big: $g_mR_S = 4$ is not large enough for the limit.`,
      }),
      P({
        id: 'bk04-degen-exact', title: 'Degeneration with $r_{ds}$, exactly',
        q: md`$g_m = 4\,\text{mS}$, $r_{ds} = 25\kO$, $R_S = 500\,\Omega$, $R_D = 10\kO$. Find $G_M$, the resistance $R_{DN}$ looking down into the drain, $R_{out}$ and $A_v$.`,
        fig: F.csDeg({ RD: '10\\,\\text{k}\\Omega', RS: '500\\,\\Omega' }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 4 / 3.02 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 75.5, traps: [{ v: 25.5, msg: '$R_S$ does not just add: $g_mr_{ds}R_S$ is the big term.' }] }, { lbl: 'R_{out}', unit: 'kΩ', ans: 10 * 75.5 / 85.5 },
          { lbl: 'A_v', unit: '', ans: -1000 / 85.5, traps: [{ v: -40 / 3, msg: 'That is the $r_{ds}\\to\\infty$ approximation; here $r_{ds}$ is only $2.5R_D$, so it matters.' }] }],
        hints: [md`$G_M = g_m/(1 + g_mR_S + R_S/r_{ds})$; $R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$.`, md`$A_v = -\dfrac{g_mr_{ds}R_D}{R_D + R_{DN}}$.`],
        sol: md`
1. $g_mR_S = 2$, $R_S/r_{ds} = 0.02$: $G_M = \dfrac{4\,\text{mS}}{3.02} = 1.325\,\text{mS}$.
2. $R_{DN} = 25 + 0.5 + (4)(25)(0.5) = 75.5\kO$.
3. $R_{out} = 10\text{k}\parallel75.5\text{k} = 8.83\kO$.
4. $A_v = -(1.325)(8.83) = -11.70$. Compact form: $-\dfrac{(4)(25)(10)}{10 + 75.5} = -\dfrac{1000}{85.5} = -11.70$.

The approximation $-\dfrac{g_mR_D}{1 + g_mR_S} = -13.3$ is $14\%$ high: with $r_{ds}$ only $25\kO$, it steals a real share of the current.`,
      }),
      P({
        id: 'bk04-degen-design', title: 'Designing for a gain that does not drift',
        q: md`A common source has $g_m = 2\,\text{mS}$ and $R_D = 10\kO$ (ignore $r_{ds}$). (a) What $R_S$ makes $A_v = -5$? (b) If $g_m$ then drops by $20\%$, what is the new gain? (A plain common source would fall from $-20$ to $-16$.)`,
        fig: F.csDeg(),
        parts: [{ lbl: 'R_S', unit: 'kΩ', ans: 1.5, traps: [{ v: 2, msg: '$R_D/R_S = 5$ forgets the transistor\'s own $1/g_m = 0.5\\,\\text{k}\\Omega$ in the source path.' }] }, { lbl: 'A_v\\text{ after the drop}', unit: '', ans: -10 / (1 / 1.6 + 1.5) }],
        hints: [md`$|A_v| = R_D/(1/g_m + R_S)$, so $1/g_m + R_S = 2\kO$.`, md`New $g_m = 1.6\,\text{mS}$, $1/g_m = 0.625\kO$.`],
        sol: md`
1. $1/g_m + R_S = R_D/5 = 2\kO$ and $1/g_m = 0.5\kO$, so $R_S = 1.5\kO$.
2. With $g_m = 1.6\,\text{mS}$: $A_v = -\dfrac{10}{0.625 + 1.5} = -4.71$.
3. The gain moved $6\%$ for a $20\%$ change in $g_m$; the plain stage would have moved $20\%$. The price: $5$ instead of $20$.`,
      }),
      P({
        id: 'bk04-degen-diode', title: 'A diode in the source',
        q: md`$M_1$ has a diode-connected NMOS $M_3$ under its source and $R_D = 10\kO$ on its drain. $g_{m1} = g_{m3} = 4\,\text{mS}$; ignore $r_{ds}$. Find $G_M$ and $A_v$.`,
        fig: F.csDegDiode(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 2, traps: [{ v: 4, msg: 'That ignores $M_3$: it acts as $R_S = 1/g_{m3}$.' }] }, { lbl: 'A_v', unit: '', ans: -20 }],
        hints: [md`$M_3$ looks like $R_S = 1/g_{m3} = 250\,\Omega$.`],
        sol: md`
1. $M_3$ is a diode: $R_S = 1/g_{m3} = 250\,\Omega$, so $g_{m1}R_S = 1$.
2. $G_M = \dfrac{g_{m1}}{1 + g_{m1}R_S} = \dfrac{4}{2} = 2\,\text{mS}$ (or $\dfrac{g_{m1}g_{m3}}{g_{m1} + g_{m3}} = \dfrac{16}{8}$).
3. $A_v = -(2\,\text{mS})(10\kO) = -20$.`,
      }),
      P({
        id: 'bk04-degen-isrc', title: 'Degeneration under a current-source load',
        q: md`A degenerated stage ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$) has an **ideal** current source as its load. Find $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.csDegI(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 2 / 3.01 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 301, traps: [{ v: 100, msg: 'The drain is degenerated: $r_{ds} + R_S + g_mr_{ds}R_S$.' }] },
          { lbl: 'A_v', unit: '', ans: -200, traps: [{ v: -200 / 3.01, msg: 'That is $-G_Mr_{ds}$: the output resistance is the degenerated drain, which is $1 + g_mR_S$ times bigger.' }] }],
        hints: [md`An ideal current source is an open circuit: $R_{out} = R_{DN}$.`, md`$G_MR_{DN} = g_mr_{ds}$ exactly.`],
        sol: md`
1. $G_M = \dfrac{2}{1 + 2 + 0.01} = 0.6645\,\text{mS}$.
2. The load is open, so $R_{out} = R_{DN} = 100 + 1 + (2)(100)(1) = 301\kO$.
3. $A_v = -(0.6645)(301) = -200 = -g_mr_{ds}$.

Degeneration cost nothing here: the drain current cannot change, so $R_S$ carries no signal current and the source stays still.`,
      }),
      P({
        id: 'bk04-degen-pmos', title: 'A degenerated PMOS stage',
        q: md`A PMOS common source has $R_S = 2\kO$ between $V_{DD}$ and its source and $R_D = 12\kO$ from its drain to ground; $g_m = 1\,\text{mS}$, $r_{ds}$ ignored. Find $A_v$.`,
        fig: F.csDegP({ RS: '2\\,\\text{k}\\Omega', RD: '12\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'A_v', unit: '', ans: -4, traps: [{ v: 4, msg: 'A PMOS common source inverts too; the model is the same.' }, { v: -6, msg: 'Keep the $1/g_m = 1\\,\\text{k}\\Omega$ in the source path.' }] }],
        hints: [md`Same model, same formula: $A_v = -R_D/(1/g_m + R_S)$.`],
        sol: md`$V_{DD}$ is incremental ground, so $R_S$ runs from the source to ground for signals, exactly as in the NMOS stage. $A_v = -\dfrac{12\kO}{1\kO + 2\kO} = -4$.`,
      }),
      P({
        id: 'bk04-degen-sym', title: 'Degeneration in symbols',
        q: md`Keeping $r_{ds}$, type $G_M$ and $A_v$ of the degenerated common source. Use \`gm\`, \`rds\`, \`RS\`, \`RD\`.`,
        fig: F.csDeg(),
        parts: [ex('gm/(1 + gm*RS + RS/rds)', ['gm', 'rds', 'RS'], 'G_M', { exact: true, ranges: { rds: [5e3, 2e4] } }),
          ex('-gm*rds*RD/(RD + rds + RS + gm*rds*RS)', ['gm', 'rds', 'RS', 'RD'], 'A_v', { exact: true, ranges: { rds: [1e4, 5e4] } })],
        hints: [md`$G_M$: Derivation 2. $A_v$: the compact form, or type $-G_M(R_D\parallel R_{DN})$.`],
        sol: md`$G_M = \dfrac{g_m}{1 + g_mR_S + R_S/r_{ds}}$ and $A_v = -\dfrac{g_mr_{ds}R_D}{R_D + r_{ds} + R_S + g_mr_{ds}R_S}$. Typed: \`gm/(1 + gm*RS + RS/rds)\` and \`-gm*rds*RD/(RD + rds + RS + gm*rds*RS)\` (or \`-gm/(1 + gm*RS + RS/rds)*(RD || (rds + RS + gm*rds*RS))\`).`,
      }),
      G('bk_degen', { need: 4 }),
    ],
  });

  // ================================================================== 5. the common gate
  L({
    id: 'bk04-cg', title: 'The common gate', ref: 'Lecture 17',
    steps: [
      RF(md`
        ### The question

        Hold the gate still and drive the **source** instead; take the output at the drain. The signal source has some resistance $R_S$ of its own. Why is this stage non-inverting, why is its input resistance so low, what is its gain with $R_S$, and what is it good for? Exam 2 used it alone (Practice 5 #1) and, more often, as the top half of a cascode.

        [[fig:c]]

        ### The physical picture

        The gate is held at a fixed bias $V_B$. Raise the source by $10\,\text{mV}$: $V_{GS} = V_B - V_S$ drops by $10\,\text{mV}$, the valve closes a little, $g_m\times10\,\text{mV}$ **less** current flows down through $R_D$, and the drain **rises**. Non-inverting, and with the same size of gain as a common source: same current change, same $R_D$, opposite sign.

        The source is a **low-resistance** node. To move it by $1\,\text{mV}$ you must supply the whole current change, $g_m\times1\,\text{mV}$: the source looks like $1/g_m$ ([Chapter 3](#/l/bk03-source)), $100\,\Omega$ at $g_m = 10\,\text{mS}$. So a signal arriving through $R_S$ meets a divider: $R_S$ on top, $1/g_m$ below.

        Follow the current instead and the stage becomes simple. Whatever current $v_{in}$ pushes into the source passes straight through the transistor and comes out of the drain, where it meets the large resistance $R_D$. In at a low resistance, out at a high one: a **current buffer**. The Art of Electronics: the transistor "passes the current along and lets the load turn it into voltage".
      `, { c: { fig: F.cg(), cap: 'The common gate: gate held at $V_B$, signal into the source through $R_S$, output at the drain.' } }),
      RF(md`
        ### The model

        Saturation, small signals, $r_{ds}$ kept. The gate is at incremental ground. $R_S$ runs from the source to $v_{in}$.

        ### Derivation: $G_M$ (output shorted)

        **Step 1: $v_{gs}$.** The gate is at 0, the source at $v_s$: $v_{gs} = -v_s$.

        **Step 2: current down through the transistor.** The drain is shorted (0 V), so $R_D$ carries nothing and all of $i_{out}$ goes down through the transistor:
        $$i_{out} = g_m(-v_s) + \frac{0 - v_s}{r_{ds}} = -\Big(g_m + \frac{1}{r_{ds}}\Big)v_s = -\frac{v_s}{r_s}$$
        where $r_s = \dfrac{1}{g_m + 1/r_{ds}} = \dfrac{1}{g_m}\parallel r_{ds}$, the resistance looking into a source whose drain is grounded.

        **Step 3: KCL at the source.** The current that comes down the transistor into the source node leaves through $R_S$ toward $v_{in}$: $i_{out} = \dfrac{v_s - v_{in}}{R_S}$.

        **Step 4: equate and solve for $v_s$.** $-\dfrac{v_s}{r_s} = \dfrac{v_s - v_{in}}{R_S}$; multiply by $R_Sr_s$: $-R_Sv_s = r_sv_s - r_sv_{in}$, so
        $$v_s = \frac{r_s}{R_S + r_s}\,v_{in}$$
        a voltage divider, $R_S$ on top and the source's own $r_s$ below.

        **Step 5: $G_M$.** $i_{out} = -v_s/r_s = -\dfrac{v_{in}}{R_S + r_s}$:
        $$G_M = -\frac{1}{R_S + \frac1{g_m}\parallel r_{ds}} = -\frac{1 + g_mr_{ds}}{r_{ds} + R_S + g_mr_{ds}R_S}\approx-\frac{g_m}{1 + g_mR_S}$$
        (For the middle form, write $\tfrac1{g_m}\parallel r_{ds} = \tfrac{r_{ds}}{1 + g_mr_{ds}}$ and put everything over $1 + g_mr_{ds}$.) **Negative:** when $v_{in}$ rises, current flows **up** out of the stage into the short.

        [[fig:s]]
      `, { s: { fig: F.cgM('short'), cap: '$G_M$: gate grounded, drain shorted, $v_{in}$ through $R_S$ into the source.' } }),
      RF(md`
        ### $R_{out}$ (input off)

        $v_{in} = 0$ grounds the bottom of $R_S$. Now the picture is: gate grounded, $R_S$ from the source to ground, $R_D$ above, test source on the drain. That is **exactly** the $R_{out}$ circuit of the degenerated common source ([Section 4](#/l/bk04-degen)), so the same four steps give
        $$R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$

        [[fig:t]]

        ### The gain

        Call $N = r_{ds} + R_S + g_mr_{ds}R_S$ again. Then $G_M = -\dfrac{1 + g_mr_{ds}}{N}$ and $R_{out} = \dfrac{R_DN}{R_D + N}$; $N$ cancels in the product:
        $$A_v = -G_MR_{out} = \frac{(1 + g_mr_{ds})R_D}{R_D + r_{ds} + R_S + g_mr_{ds}R_S}\approx\frac{R_D}{R_S + 1/g_m}$$
        The denominator is the degenerated common source's; the numerator is $1 + g_mr_{ds}$ instead of $g_mr_{ds}$. Same size, opposite sign, and slightly bigger.

        ### $R_{in}$: looking into the source

        Test source $v_t$ on the source, gate grounded, $R_D$ on the drain ([Chapter 3](#/l/bk03-source) did this with $R_D$ on the drain).

        **Step 1:** $v_{gs} = -v_t$. **Step 2:** $i_t$ enters the source, flows up through the transistor and out of the drain, then down through $R_D$: the drain sits at $v_d = i_tR_D$. **Step 3:** the current through the transistor from drain to source is $-i_t$:
        $$-i_t = g_m(-v_t) + \frac{i_tR_D - v_t}{r_{ds}}$$
        **Step 4:** multiply by $r_{ds}$ and collect: $v_t(1 + g_mr_{ds}) = i_t(r_{ds} + R_D)$, so
        $$R_{in} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\frac1{g_m} + \frac{R_D}{g_mr_{ds}}$$
        Usually just $1/g_m$. But if the drain load is huge (a current source), $R_D/(g_mr_{ds})$ is not small: with an **ideal** current source on the drain, $R_{in}\to\infty$, because the current entering the source has nowhere to go.

        [[fig:r]]

        !!key The common gate (Lecture 17)
          $$G_M = -\frac{1}{R_S + \frac1{g_m}\parallel r_{ds}},\quad R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S),\quad R_{in} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}$$
          $$A_v = \frac{(1 + g_mr_{ds})R_D}{R_D + r_{ds} + R_S + g_mr_{ds}R_S}\approx+\frac{R_D}{R_S + 1/g_m}$$
      `, {
        t: { fig: F.cgM('test'), cap: '$R_{out}$: with $v_{in} = 0$ this is the degenerated drain again.' },
        r: { fig: F.cgM('rin'), cap: '$R_{in}$: a test source on the source; the current it pushes in comes out of the drain into $R_D$.' },
      }),
      R(md`
        ### Check it

        - **$R_S = 0$** (an ideal source drives the source): $A_v = (1 + g_mr_{ds})\dfrac{R_D}{R_D + r_{ds}} = \Big(g_m + \dfrac1{r_{ds}}\Big)(R_D\parallel r_{ds})\approx g_m(R_D\parallel r_{ds})$: the common source's size, positive. The "$+1$" is real: even with $g_m = 0$, $v_{in}$ would reach the output through the divider $r_{ds}$, $R_D$.
        - **$R_S\gg1/g_m$:** $A_v\approx R_D/R_S$. The input is effectively a current $v_{in}/R_S$, handed to $R_D$.
        - **Three ways to the same gain.** (1) $G_MR_{out}$, above. (2) Divider, then source-to-drain gain: $\dfrac{R_{in}}{R_S + R_{in}}\cdot\dfrac{(1 + g_mr_{ds})R_D}{R_D + r_{ds}}$ (multiply it out: the same expression). (3) Resistance ratio: $R_D$ over the resistance in the input path, $R_S + 1/g_m$.
        - **One number:** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$, $R_D = 10\kO$. $r_s = 1/(2.01\,\text{mS}) = 497.5\,\Omega$; $G_M = -1/(1497.5\,\Omega) = -0.668\,\text{mS}$; $N = 100 + 1 + 200 = 301\kO$, $R_{out} = 10\text{k}\parallel301\text{k} = 9.68\kO$; $A_v = \dfrac{(201)(10)}{311} = +6.46$. Method 2: $R_{in} = 110\kO/201 = 547\,\Omega$, divider $547/1547 = 0.354$, source-to-drain gain $201\times10/110 = 18.27$, product $6.46$. Method 3: $10/1.5 = 6.67$.

        ### What it means

        A common gate is a degenerated common source turned inside out: the same current, the same $R_S + 1/g_m$ in its path, the same $R_D$ to land on, but the input pushes the current **in** at the source instead of pulling it out at the drain, so the sign flips. Its two special properties are its terminal resistances: **low in** ($\approx1/g_m$) and **high out** ($\approx r_{ds}(1 + g_mR_S)$).

        **Uses.** (1) The top transistor of a cascode ([Section 7](#/l/bk04-cascode)): it accepts $M_1$'s current at a low-resistance node and hands it to a high-resistance output. (2) Terminating a low-impedance line: $1/g_m = 50\,\Omega$ matches a $50\,\Omega$ cable. (3) Wide bandwidth: no capacitance from input to output gets multiplied by the gain (no Miller effect, [Chapter 12](#/l/bk12-others)).

        ### How to recognize it

        Gate on a fixed bias (a triangle, a supply, a bypassed node), signal into the **source**, output at the **drain**. Say: "common gate: plus $R_D$ over ($R_S + 1/g_m$); the input sees $1/g_m$."

        !!mistake Common mistakes
          - **A negative gain.** $G_M < 0$, so $A_v = -G_MR_{out} > 0$.
          - **$v_{gs} = v_{in}$.** The gate is held; $v_{gs} = -v_s$, and $v_s$ is only a fraction of $v_{in}$.
          - **Forgetting the divider** between $R_S$ and the source's $1/g_m$.
          - **$R_{in} = 1/g_m$ with a current-source load.** $R_{in} = (r_{ds} + R_D)/(1 + g_mr_{ds})$; with $R_D\to\infty$ it is infinite.
          - **$R_{out} = R_D\parallel r_{ds}$.** $R_S$ is still under the source when $v_{in} = 0$: the drain is degenerated.
      `),
      Q(md`In a common gate stage, $v_{in}$ (at the source, through $R_S$) rises. What happens, step by step?`,
        ['The source rises, $v_{gs}$ falls, less current is pulled down through $R_D$, and the drain rises: non-inverting.', 'The source rises, $v_{gs}$ rises, more current flows, and the drain falls: inverting.', 'The gate rises with the source, so nothing changes.', 'The drain follows the source with a gain just under 1.'], 0,
        [null, '$v_{gs} = v_g - v_s$ with the gate held: a rising source **lowers** $v_{gs}$.', 'The gate is held at a fixed bias; it does not move.', 'That describes the source follower. The common gate amplifies: $R_D/(R_S + 1/g_m)$ can be large.'],
        md`With the gate fixed, $v_{gs} = -v_s$. The source rising closes the valve, less current flows through $R_D$, the drop across it shrinks and the drain rises. In $G_M$ terms: current flows out of the stage into the short, $G_M < 0$, $A_v > 0$.`),
      Q(md`A common gate stage has an **ideal** current source as its drain load. What is the resistance looking into its source?`,
        ['Infinite', '$1/g_m$', '$\\tfrac1{g_m}\\parallel r_{ds}$', '$r_{ds}$'], 0,
        [null, 'That assumes the drain sees a small resistance. Here it sees an open circuit.', 'That is the source with the drain grounded.', 'Look again at $(r_{ds} + R_D)/(1 + g_mr_{ds})$ with $R_D\\to\\infty$.'],
        md`$R_{in} = \dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\to\infty$ as $R_D\to\infty$. Physically: any current pushed into the source must leave through the drain, and the ideal current source will not accept any change of current. With a real current source ($R_D = r_{ds2}$) it is about $2/g_m$ for equal $r_{ds}$.`),
      Q(md`A common gate is driven through $R_S = 10\kO$, with $1/g_m = 100\,\Omega$ and $R_D = 20\kO$. Roughly what is its gain, and what is the stage doing?`,
        ['About $+2$: the input is effectively the current $v_{in}/R_S$, handed to $R_D$.', 'About $+200$, $g_mR_D$.', 'About $-2$.', 'About $+0.01$, because $R_S$ is so much bigger than $1/g_m$.'], 0,
        [null, 'That ignores $R_S$: almost all of $v_{in}$ drops across $R_S$, not across the source.', 'A common gate is non-inverting.', 'The divider makes $v_s$ small, but the **current** $v_{in}/R_S$ still reaches $R_D$, which is large.'],
        md`$A_v\approx\dfrac{R_D}{R_S + 1/g_m} = \dfrac{20\kO}{10.1\kO}\approx2$. With $R_S\gg1/g_m$ the source barely moves; the stage simply passes the current $v_{in}/R_S$ to $R_D$. That is the current-buffer view.`),
      P({
        id: 'bk04-cg-num', title: 'Common gate with numbers',
        q: md`Common gate: $g_m = 4\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 250\,\Omega$, $R_D = 8\kO$. Find $G_M$ (with its sign), $R_{out}$, $A_v$ and $R_{in}$.`,
        fig: F.cg({ RD: '8\\,\\text{k}\\Omega', RS: '250\\,\\Omega' }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -201 / 100.25 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 8 * 100.25 / 108.25 },
          { lbl: 'A_v', unit: '', ans: 201 * 8 / 108.25, traps: [{ v: -201 * 8 / 108.25, msg: 'Non-inverting: $G_M < 0$, so the gain is positive.' }] },
          { lbl: 'R_{in}', unit: 'Ω', ans: 58000 / 201, traps: [{ v: 250, msg: 'That is $1/g_m$ alone: with $R_D$ on the drain, $R_{in} = (r_{ds} + R_D)/(1 + g_mr_{ds})$.' }] }],
        hints: [md`$g_mr_{ds} = 200$, $N = r_{ds} + R_S + g_mr_{ds}R_S = 100.25\kO$.`, md`$G_M = -(1 + g_mr_{ds})/N$, $R_{out} = R_D\parallel N$, $A_v = (1 + g_mr_{ds})R_D/(R_D + N)$.`],
        sol: md`
1. $g_mr_{ds} = 200$; $N = 50 + 0.25 + (200)(0.25) = 100.25\kO$.
2. $G_M = -\dfrac{201}{100.25\kO} = -2.005\,\text{mS}$.
3. $R_{out} = 8\text{k}\parallel100.25\text{k} = 7.41\kO$.
4. $A_v = \dfrac{(201)(8)}{8 + 100.25} = +14.85$. (Without $r_{ds}$: $8\kO/(0.25 + 0.25)\kO = 16$.)
5. $R_{in} = \dfrac{50 + 8}{201}\kO = 288.6\,\Omega$, a little above $1/g_m = 250\,\Omega$.`,
      }),
      P({
        id: 'bk04-cg-match', title: 'A $50\\,\\Omega$ input',
        q: md`A common gate must present $50\,\Omega$ to a $50\,\Omega$ source ($R_S = 50\,\Omega$). It runs at $V_{ov} = 0.2\,\text{V}$; take $R_{in}\approx1/g_m$ and ignore $r_{ds}$. What bias current is needed? With $R_D = 1\kO$, what is the gain from the source voltage $v_{in}$ to the output?`,
        fig: F.cg({ RD: '1\\,\\text{k}\\Omega', RS: '50\\,\\Omega' }),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 2 }, { lbl: 'A_v', unit: '', ans: 10, traps: [{ v: 20, msg: 'That is $g_mR_D$: the $50\\,\\Omega$ source and the $50\\,\\Omega$ input form a divider that halves the signal.' }] }],
        hints: [md`$1/g_m = 50\,\Omega$ means $g_m = 20\,\text{mS} = 2I_D/V_{ov}$.`, md`$A_v = R_D/(R_S + 1/g_m)$.`],
        sol: md`
1. $g_m = 1/50\,\Omega = 20\,\text{mS}$, and $g_m = 2I_D/V_{ov}$, so $I_D = \dfrac{g_mV_{ov}}{2} = \dfrac{(20\,\text{mS})(0.2\,\text{V})}{2} = 2\,\text{mA}$.
2. $A_v = \dfrac{R_D}{R_S + 1/g_m} = \dfrac{1000}{50 + 50} = 10$: half of $g_mR_D = 20$, lost in the matched divider.`,
      }),
      P({
        id: 'bk04-cg-isrc', title: 'Common gate with a current-source load',
        q: md`A common gate is driven by an ideal source ($R_S = 0$). Its load is a PMOS current source with $r_{ds2} = 100\kO$; the input transistor has $g_m = 2\,\text{mS}$, $r_{ds1} = 100\kO$. Find $A_v$ and $R_{in}$.`,
        fig: F.cgI(),
        parts: [{ lbl: 'A_v', unit: '', ans: 100.5, traps: [{ v: 200, msg: 'That is $g_mr_{ds2}$; the load\'s $r_{ds2}$ and the transistor\'s $r_{ds1}$ share the output: $(1 + g_mr_{ds1})\\frac{R_D}{R_D + r_{ds1}}$ with $R_D = r_{ds2}$.' }] },
          { lbl: 'R_{in}', unit: 'Ω', ans: 200000 / 201, traps: [{ v: 500, msg: 'That is $1/g_m$. With a current-source load the $R_D/(g_mr_{ds})$ term is as big as $1/g_m$.' }] }],
        hints: [md`Use the formulas with $R_D = r_{ds2} = 100\kO$ and $R_S = 0$.`],
        sol: md`
1. With $R_S = 0$: $A_v = (1 + g_mr_{ds1})\dfrac{R_D}{R_D + r_{ds1}} = 201\times\dfrac{100}{200} = 100.5$.
2. $R_{in} = \dfrac{r_{ds1} + R_D}{1 + g_mr_{ds1}} = \dfrac{200\kO}{201} = 995\,\Omega$, about $2/g_m$, twice what a resistor load would give.

$M_2$'s gate is held and its source is on $V_{DD}$, so for signals it is just $r_{ds2}$: that is the $R_D$ in the formulas.`,
      }),
      P({
        id: 'bk04-cg-pmos', title: 'A PMOS common gate',
        q: md`A PMOS common gate: gate held at $V_B$, $v_{in}$ through $R_S = 1\kO$ into the source, $R_D = 10\kO$ from the drain to ground. $g_m = 1\,\text{mS}$; ignore $r_{ds}$. Find $A_v$ and $R_{in}$.`,
        fig: F.cgP({ RS: '1\\,\\text{k}\\Omega', RD: '10\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'A_v', unit: '', ans: 5, traps: [{ v: -5, msg: 'Same model, same sign: a common gate does not invert.' }, { v: 10, msg: 'Keep the divider: $R_S$ and $1/g_m$ share $v_{in}$.' }] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 1 }],
        hints: [md`The model is the same as for NMOS: $A_v = R_D/(R_S + 1/g_m)$.`],
        sol: md`
1. $R_{in}\approx1/g_m = 1\kO$.
2. $A_v = \dfrac{R_D}{R_S + 1/g_m} = \dfrac{10}{1 + 1} = +5$.

Physically: $v_{in}$ up raises the PMOS source, so $V_{SG}$ grows and **more** current flows down into $R_D$: the drain rises. Non-inverting, like the NMOS version.`,
      }),
      P({
        id: 'bk04-cg-vs-cs', title: 'Common gate and common source, same parts',
        q: md`One transistor ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$) with $R_D = 10\kO$. Find the exact gain as a common gate driven by an ideal source ($R_S = 0$), and as a common source.`,
        fig: F.cg({ noRS: true }),
        parts: [{ lbl: 'A_{CG}', unit: '', ans: 201 * 10 / 110 }, { lbl: 'A_{CS}', unit: '', ans: -2 * 1000 / 110 }],
        hints: [md`CG: $(1 + g_mr_{ds})\dfrac{R_D}{R_D + r_{ds}}$. CS: $-g_m(R_D\parallel r_{ds})$.`],
        sol: md`
1. Common gate: $201\times\dfrac{10}{110} = +18.27$.
2. Common source: $-(2\,\text{mS})(9.09\kO) = -18.18$.

Same size, opposite sign; the common gate is larger by the factor $(1 + g_mr_{ds})/(g_mr_{ds}) = 201/200$, the current that $v_{in}$ pushes through $r_{ds}$ directly.`,
      }),
      P({
        id: 'bk04-cg-sym', title: 'The common gate, in symbols',
        q: md`Keeping $r_{ds}$, type $A_v$ and $R_{in}$ of the common gate with source resistance $R_S$ and load $R_D$. Use \`gm\`, \`rds\`, \`RS\`, \`RD\`.`,
        fig: F.cg(),
        parts: [ex('(1 + gm*rds)*RD/(RD + rds + RS + gm*rds*RS)', ['gm', 'rds', 'RS', 'RD'], 'A_v', { exact: true }),
          ex('(rds + RD)/(1 + gm*rds)', ['gm', 'rds', 'RD'], 'R_{in}', { exact: true })],
        hints: [md`$A_v = -G_MR_{out}$ with $G_M = -(1 + g_mr_{ds})/N$ and $R_{out} = R_D\parallel N$.`],
        sol: md`$A_v = \dfrac{(1 + g_mr_{ds})R_D}{R_D + r_{ds} + R_S + g_mr_{ds}R_S}$ and $R_{in} = \dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$. Typed: \`(1 + gm*rds)*RD/(RD + rds + RS + gm*rds*RS)\` and \`(rds + RD)/(1 + gm*rds)\`.`,
      }),
      G('bk_cg', { need: 4 }),
    ],
  });

  // ================================================================== 6. the source follower
  L({
    id: 'bk04-cd', title: 'The source follower', ref: 'Lecture 17',
    steps: [
      RF(md`
        ### The question

        Drive the gate, put the drain on $V_{DD}$, and take the output at the **source**, with a load $R_L$ from the source to ground. This is the **source follower** (or common drain). Its gain is a little **below 1**. Why build a stage that does not amplify? Because of its terminal resistances: infinite in, about $1/g_m$ out. Exam 2 used it as a buffer at the end of a chain and inside multi-transistor problems.

        [[fig:c]]

        ### The physical picture

        The source sits one $V_{GS}$ below the gate: $V_{out} = V_{in} - V_{GS}$. If the current never changed, $V_{GS}$ would never change, and the source would copy every wiggle of the gate exactly: gain 1. That is the whole idea of a follower.

        With a resistor load, though, a higher output pushes more current through $R_L$, and more current needs a slightly larger $V_{GS}$. So the source rises a little **less** than the gate. How much less? The extra current is $v_{out}/R_L$ and it needs an extra $v_{gs} = v_{out}/(g_mR_L)$. The input must supply both:
        $$v_{in} = v_{out} + v_{gs} = v_{out}\Big(1 + \frac{1}{g_mR_L}\Big)\quad\Rightarrow\quad A_v = \frac{g_mR_L}{1 + g_mR_L} = \frac{R_L}{R_L + 1/g_m}$$
        A voltage divider: $1/g_m$ on top, $R_L$ below. With $g_m = 2\,\text{mS}$ and $R_L = 2\kO$: $g_mR_L = 4$ and $A_v = 0.8$.

        [[fig:tc]]

        !!intuition A valve that adjusts itself
          The follower is a valve that keeps opening until the output sits just $V_{GS}$ below the input. Pull current out of the output and the valve opens a little more, almost without the output moving: that is why its output resistance is so low, about $1/g_m$ ([Chapter 3](#/l/bk03-source): "the source follows the gate").
      `, {
        c: { fig: F.cd(), cap: 'The source follower: gate in, source out, drain on $V_{DD}$.' },
        tc: { fig: F.cdTransfer(), cap: 'Follower transfer curve ($K = 5\\,\\text{mA/V}^2$, $R_L = 2\\,\\text{k}\\Omega$): the output follows the input about $V_{GS}\\approx1.4\\,\\text{V}$ lower, with a slope just under 1.' },
      }),
      RF(md`
        ### The model and the derivation

        Saturation, small signals, $r_{ds}$ kept. The drain is on $V_{DD}$: incremental ground.

        **$G_M$: short the output (the source).**

        *Step 1:* gate at $v_{in}$, source shorted to 0: $v_{gs} = v_{in}$.

        *Step 2:* $r_{ds}$ has the drain (0) on one end and the shorted source (0) on the other: no current. $R_L$ has 0 V across it: no current.

        *Step 3:* the dependent source carries $g_mv_{in}$ from the drain **down into the source node**, and the only way out of that node is the short. So current flows **out of the stage into the short**; the current flowing from the short into the stage is the opposite:
        $$i_{out} = -g_mv_{in},\qquad G_M = -g_m$$

        [[fig:s]]

        **$R_{out}$: turn the input off.**

        *Step 1:* $v_{in} = 0$ grounds the gate; the test source $v_t$ sits on the source: $v_{gs} = 0 - v_t = -v_t$. The dependent source is **alive**, driven by the test voltage itself.

        *Step 2:* three currents leave the output node: $v_t/R_L$ down through $R_L$, $v_t/r_{ds}$ up through $r_{ds}$ to the drain (at 0), and the dependent source: from drain to source it carries $g_m(-v_t)$, which is $g_mv_t$ flowing **up**, out of the output node.

        *Step 3:* add them: $i_t = \dfrac{v_t}{R_L} + \dfrac{v_t}{r_{ds}} + g_mv_t$, so
        $$R_{out} = \frac{1}{1/R_L + 1/r_{ds} + g_m} = R_L\parallel r_{ds}\parallel\frac{1}{g_m}$$

        [[fig:t]]

        **The gain.** $A_v = -G_MR_{out} = g_m\big(R_L\parallel r_{ds}\parallel\tfrac1{g_m}\big)$. Write $R' = R_L\parallel r_{ds}$; then $R'\parallel\dfrac1{g_m} = \dfrac{R'}{1 + g_mR'}$ (multiply top and bottom by $g_m$), and
        $$A_v = \frac{g_mR'}{1 + g_mR'} = \frac{R'}{R' + 1/g_m}$$
        exactly the divider of the physical picture, with $r_{ds}$ in parallel with $R_L$.

        !!key The source follower (Lecture 17)
          $$G_M = -g_m,\qquad R_{out} = R_L\parallel r_{ds}\parallel\frac1{g_m}\approx\frac1{g_m},\qquad A_v = \frac{R'}{R' + 1/g_m},\ \ R' = R_L\parallel r_{ds}$$
          $R_{in} = \infty$ (a gate). Non-inverting, $0 < A_v < 1$.
      `, {
        s: { fig: F.cdM('short'), cap: '$G_M$: the output (source) shorted. The dependent source pushes $g_mv_{in}$ into the short: $G_M = -g_m$.' },
        t: { fig: F.cdM('test'), cap: '$R_{out}$: gate grounded, $v_{gs} = -v_t$: the dependent source acts as a conductance $g_m$.' },
      }),
      RF(md`
        ### Check it

        - **$R_L\to\infty$ and $r_{ds}\to\infty$:** $A_v\to1$, the perfect follower (an ideal current-source load).
        - **$R_L\ll1/g_m$:** $A_v\approx g_mR_L$, small: the load is too heavy for the transistor.
        - **Sign:** $v_{in}$ up, $v_{gs}$ up, more current pushed into the output node, $v_{out}$ up: non-inverting, and it can never catch $v_{in}$, because some $v_{gs}$ is needed to carry the extra current.
        - **One number:** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_L = 2\kO$: $R_{out} = 1/(0.5 + 0.01 + 2)\,\text{mS} = 398\,\Omega$ and $A_v = (2\,\text{mS})(398\,\Omega) = 0.797$.

        ### What it means: the buffer

        A common source with $g_m = 2\,\text{mS}$ and $R_D = 10\kO$ has gain $-20$ but an output resistance of $10\kO$. Hang a $500\,\Omega$ load on it and the load sits in parallel with $R_D$: $A_v = -(2\,\text{mS})(10\text{k}\parallel0.5\text{k}) = -0.95$. Almost everything is lost.

        Put a follower in between ($g_{m2} = 10\,\text{mS}$). Its gate draws nothing, so the common source keeps its $-20$. The follower drives $500\,\Omega$ with $g_{m2}R_L = 5$: gain $5/6 = 0.83$. Total: $-20\times0.83 = -16.7$. A stage with gain **below 1** made the chain 17 times better, because it converts a high-resistance output into a low-resistance one without loading the stage in front.

        [[fig:b]]

        **A current-source load.** Put an NMOS current source under the source (gate held): $R_L = r_{ds2}$, and $A_v = \dfrac{r_{ds1}\parallel r_{ds2}}{(r_{ds1}\parallel r_{ds2}) + 1/g_m}$, very close to 1 (with $g_m = 2\,\text{mS}$ and both $r_{ds} = 100\kO$: $100/101 = 0.990$).

        **DC: a level shifter.** With a constant current, $V_{GS}$ is constant, so the follower copies the input $V_{GS}$ lower: $V_{OUT} = V_{IN} - (V_{TN} + V_{ov})$.

        **PMOS and drain resistors.** A PMOS follower (source on a resistor or current source up to $V_{DD}$, drain to ground) uses the same formulas. A resistor in the drain of an NMOS follower changes nothing while $r_{ds}$ is ignored: with the output shorted, the drain current is $g_mv_{in}$ wherever the drain sits.

        ### How to recognize it

        Input at the **gate**, output at the **source**, the drain on a supply (or anything that does not carry the output). Say: "follower: $R'$ over ($R' + 1/g_m$); it looks like $1/g_m$ from the output."

        !!mistake Common mistakes
          - **$A_v = 1$ exactly.** Only with an ideal current-source load and no $r_{ds}$. With $R_L$ it is $R'/(R' + 1/g_m)$.
          - **$G_M = +g_m$.** The current flows out of the stage into the short: $G_M = -g_m$, and $A_v = -G_MR_{out}$ comes out positive.
          - **Killing the dependent source for $R_{out}$.** $v_{in} = 0$, but $v_{gs} = -v_t$: the source stays and gives the $1/g_m$.
          - **Forgetting that a follower loads nothing.** Its input is a gate: the stage before it keeps its unloaded gain.
      `, { b: { fig: F.buffer(), cap: 'A common source $M_1$ driving the load through a follower $M_2$.' } }),
      Q(md`Why is a source follower's gain slightly **less** than 1 (with a resistor load)?`,
        ['To carry more current into $R_L$, the transistor needs a slightly larger $v_{gs}$, so the source rises a bit less than the gate.', 'Because $r_{ds}$ leaks part of the signal to ground.', 'Because the gate draws a small current.', 'Because the follower inverts a little of the signal.'], 0,
        [null, '$r_{ds}$ lowers the gain a little more, but even with $r_{ds}\\to\\infty$ the gain is $g_mR_L/(1 + g_mR_L) < 1$.', 'A MOSFET gate draws no current.', 'A follower does not invert; all of its gain is positive.'],
        md`$v_{in} = v_{out} + v_{gs}$ and the extra current $v_{out}/R_L$ needs $v_{gs} = v_{out}/(g_mR_L)$. So $v_{out} = \dfrac{g_mR_L}{1 + g_mR_L}v_{in}$: always below 1, approaching 1 as $g_mR_L$ grows.`),
      Q(md`Seen from its output, a source follower ($g_m = 5\,\text{mS}$, large $R_L$ and $r_{ds}$) looks like about:`,
        ['$200\\,\\Omega$', '$R_L$', '$r_{ds}$', 'An open circuit'], 0,
        [null, '$R_L$ is in parallel with something much smaller: the transistor\'s own $1/g_m$.', '$r_{ds}$ is in parallel too, and it is huge; the smallest element wins.', 'The transistor fights any change of its source voltage: that is a small resistance, not an open.'],
        md`$R_{out} = R_L\parallel r_{ds}\parallel\dfrac1{g_m}\approx\dfrac{1}{g_m} = 200\,\Omega$. Push the output down by $1\,\text{mV}$ and $v_{gs}$ grows by $1\,\text{mV}$, so the transistor pushes $5\,\mu\text{A}$ more into the output: $1\,\text{mV}/5\,\mu\text{A} = 200\,\Omega$.`),
      Q(md`The gate of a source follower is driven through a $100\kO$ resistor from the previous stage. Ignoring $r_{ds}$, how does that resistor change the follower's gain?`,
        ['Not at all: the gate draws no current, so there is no drop across the resistor.', 'It halves the gain.', 'It adds $100\\,\\text{k}\\Omega$ to the output resistance.', 'It makes the gain $R_L/(R_L + 100\\,\\text{k}\\Omega)$.'], 0,
        [null, 'With no gate current there is no divider at the input.', 'The output resistance is $1/g_m\\parallel R_L$: nothing from the gate side appears, because the gate current is zero.', 'That would need the resistor to carry the load current, which it does not.'],
        md`No current flows into a MOSFET gate, so $v_g = v_{in}$ exactly and the resistor is invisible. (A BJT emitter follower is different: its base current flows through that resistor, which divides by $(\beta + 1)$ and shows up at the output, [Chapter 9](#/l/bk09-cc).)`),
      P({
        id: 'bk04-cd-num', title: 'Follower with numbers',
        q: md`Source follower: $g_m = 4\,\text{mS}$, $r_{ds} = 50\kO$, $R_L = 1\kO$. Find $G_M$ (with its sign), $R_{out}$ and $A_v$.`,
        fig: F.cd({ RL: '1\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -4 }, { lbl: 'R_{out}', unit: 'Ω', ans: 1000 / 5.02, traps: [{ v: 1000 / 1.02, msg: 'That is $R_L\\parallel r_{ds}$: the transistor adds a conductance $g_m$ in parallel.' }] }, { lbl: 'A_v', unit: '', ans: 4 / 5.02 }],
        hints: [md`Output shorted: $G_M = -g_m$.`, md`Conductances at the output: $1/R_L + 1/r_{ds} + g_m$.`],
        sol: md`
1. $G_M = -g_m = -4\,\text{mS}$.
2. $1/R_L + 1/r_{ds} + g_m = 1 + 0.02 + 4 = 5.02\,\text{mS}$, so $R_{out} = 199\,\Omega$.
3. $A_v = -G_MR_{out} = (4\,\text{mS})(199\,\Omega) = 0.797$. Check: $R' = 1\text{k}\parallel50\text{k} = 0.980\kO$, $R'/(R' + 0.25\kO) = 0.797$.`,
      }),
      P({
        id: 'bk04-cd-buffer', title: 'Why a gain below 1 helps',
        q: md`A common source ($g_{m1} = 2\,\text{mS}$, $R_D = 10\kO$) must drive $R_L = 500\,\Omega$. Ignore $r_{ds}$. Find the gain with $R_L$ tied straight to the drain, and through a follower with $g_{m2} = 10\,\text{mS}$.`,
        fig: F.buffer({ RD: '10\\,\\text{k}\\Omega', RL: '500\\,\\Omega' }),
        parts: [{ lbl: 'A_v\\text{ direct}', unit: '', ans: -2 * 0.5 * 10 / 10.5, traps: [{ v: -20, msg: 'Tied to the drain, $R_L$ is in parallel with $R_D$.' }] }, { lbl: 'A_v\\text{ buffered}', unit: '', ans: -20 * 5 / 6 }],
        hints: [md`Direct: $-g_{m1}(R_D\parallel R_L)$. Buffered: $-g_{m1}R_D\times\dfrac{g_{m2}R_L}{1 + g_{m2}R_L}$.`],
        sol: md`
1. Direct: $10\text{k}\parallel0.5\text{k} = 0.476\kO$; $A_v = -(2)(0.476) = -0.952$.
2. Buffered: $M_1$ drives a gate and keeps $-20$; the follower has $g_{m2}R_L = 5$, gain $5/6 = 0.833$. Total $-16.7$.`,
      }),
      P({
        id: 'bk04-cd-isrc', title: 'Follower with a current-source load',
        q: md`A source follower $M_1$ ($g_{m1} = 2\,\text{mS}$, $r_{ds1} = 100\kO$) has an NMOS current source $M_2$ (gate held, $r_{ds2} = 100\kO$) as its load. Find $A_v$ and $R_{out}$.`,
        fig: F.cdI(),
        parts: [{ lbl: 'A_v', unit: '', ans: 100 / 101, traps: [{ v: 1, msg: 'Very close, but the two $r_{ds}$ make $R\' = 50\\,\\text{k}\\Omega$ finite: $R\'/(R\' + 1/g_m)$.' }] }, { lbl: 'R_{out}', unit: 'Ω', ans: 1000 / 2.02 }],
        hints: [md`$M_2$ with its gate held is just $r_{ds2}$: $R_L = r_{ds2}$.`],
        sol: md`
1. $R' = r_{ds1}\parallel r_{ds2} = 50\kO$, $g_{m1}R' = 100$, $A_v = 100/101 = 0.990$.
2. $R_{out} = 1/(0.01 + 0.01 + 2)\,\text{mS} = 495\,\Omega$.`,
      }),
      P({
        id: 'bk04-cd-design', title: 'How much current for a gain of 0.9?',
        q: md`A follower must reach $A_v = 0.9$ into $R_L = 1\kO$ (ignore $r_{ds}$). What $g_m$ does that take, and what bias current at $V_{ov} = 0.2\,\text{V}$?`,
        fig: F.cd({ RL: '1\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 9 }, { lbl: 'I_D', unit: 'mA', ans: 0.9 }],
        hints: [md`$\dfrac{g_mR_L}{1 + g_mR_L} = 0.9$ gives $g_mR_L = 9$.`],
        sol: md`
1. $g_mR_L = 0.9/0.1 = 9$, so $g_m = 9\,\text{mS}$.
2. $I_D = g_mV_{ov}/2 = (9\,\text{mS})(0.2\,\text{V})/2 = 0.9\,\text{mA}$.`,
      }),
      P({
        id: 'bk04-cd-dc', title: 'The level shifter',
        q: md`An NMOS follower ($W/L = 100/1$, course parameters, $\lambda = 0.05\,\text{V}^{-1}$) is biased by an ideal current source of $0.2\,\text{mA}$ from its source to ground. The gate sits at $2.5\,\text{V}$. Find the output DC voltage and the small-signal gain.`,
        fig: F.cdI(),
        parts: [{ lbl: 'V_{OUT}', unit: 'V', ans: 1.3 }, { lbl: 'A_v', unit: '', ans: 200 / 201 }],
        hints: [md`$I_D = \tfrac12(100\,\mu)(100)V_{ov}^2$ gives $V_{ov}$; $V_{OUT} = V_{IN} - V_{TN} - V_{ov}$.`, md`An ideal current source is open: $R' = r_{ds}$.`],
        sol: md`
1. $K = 5\,\text{mA/V}^2$, $V_{ov} = \sqrt{0.2/5} = 0.2\,\text{V}$, $V_{GS} = 1.2\,\text{V}$, so $V_{OUT} = 2.5 - 1.2 = 1.3\,\text{V}$.
2. $g_m = 2(0.2)/0.2 = 2\,\text{mS}$, $r_{ds} = 1/(0.05\times0.2\,\text{mA}) = 100\kO$, $g_mr_{ds} = 200$, $A_v = 200/201 = 0.995$.

(The figure's $M_2$ plays the ideal current source.)`,
      }),
      P({
        id: 'bk04-cd-pmos', title: 'A PMOS follower',
        q: md`A PMOS follower: $R_L = 4\kO$ from $V_{DD}$ down to its source (the output), drain to ground, input on the gate; $g_m = 1\,\text{mS}$, $r_{ds}$ ignored. Find $A_v$ and $R_{out}$.`,
        fig: F.cdP({ RL: '4\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'A_v', unit: '', ans: 0.8 }, { lbl: 'R_{out}', unit: 'Ω', ans: 800 }],
        hints: [md`$V_{DD}$ is incremental ground, so $R_L$ is from the output to ground: same formulas.`],
        sol: md`
1. $g_mR_L = 4$, $A_v = 4/5 = 0.8$.
2. $R_{out} = R_L\parallel\dfrac1{g_m} = 4\text{k}\parallel1\text{k} = 0.8\kO$.`,
      }),
      P({
        id: 'bk04-cd-sym', title: 'The follower, in symbols',
        q: md`Keeping $r_{ds}$, type $R_{out}$ and $A_v$ of the source follower with load $R_L$. Use \`gm\`, \`rds\`, \`RL\`.`,
        fig: F.cd(),
        parts: [ex('RL || rds || 1/gm', ['gm', 'rds', 'RL'], 'R_{out}', { exact: true }), ex('(RL || rds)/((RL || rds) + 1/gm)', ['gm', 'rds', 'RL'], 'A_v', { exact: true })],
        hints: [md`$A_v = g_mR_{out}$.`],
        sol: md`$R_{out} = R_L\parallel r_{ds}\parallel\tfrac1{g_m}$ and $A_v = g_mR_{out} = \dfrac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m}$.`,
      }),
      G('bk_cd', { need: 4 }),
    ],
  });
})();

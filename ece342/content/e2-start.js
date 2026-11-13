/* "Start here": the motivation for every stage, a map of every stage before any is taught, and the route. Then a
   short "why this lesson, and where it goes" opener at the top of every Unit 6–9 lesson. Loaded after the units. */
(function () {
  'use strict';
  const { R, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2start', l);

  // ================================================================ 1. why
  L({
    id: 'e2-s-why', title: 'Why we are here: making a small signal bigger', ref: 'Read first, 15 minutes',
    steps: [
      R(md`
        Before any formula, here is the problem the whole exam is about. Read this slowly: every stage you will meet is an answer to one of the questions on this page.

        ### The problem
        A microphone, a sensor, an antenna: they all give you a **tiny voltage** that wiggles, millivolts or less. You want a **bigger copy** of that wiggle. A circuit that does this is an **amplifier**, and the number we care about is its **gain**:
        $$A_v = \frac{v_{out}}{v_{in}}\qquad(\text{output wiggle divided by input wiggle})$$

        ### What a transistor can do
        From Exam 1 you know a MOSFET in saturation is a **valve**: the gate voltage sets how much current flows from drain to source. Push the gate up a little, and a little more current flows.

        The exchange rate is called $g_m$ (the **transconductance**): *how many amps of extra current per volt of extra gate voltage*. A typical value is $10\,\text{mS}$, meaning $10\,\text{mA}$ more current per volt, or $10\,\mu\text{A}$ per millivolt.

        So a transistor turns a **voltage wiggle into a current wiggle**. That is half of an amplifier.
      `),
      R(md`
        ### The other half: turn the current back into a voltage
        Current through a resistor makes a voltage (Ohm's law). So hang a resistor $R_D$ from $V_{DD}$ to the drain, and take the output at the drain:

        1. $v_{in}$ goes up by a little.
        2. The transistor pulls $g_m v_{in}$ more current down through $R_D$.
        3. More current through $R_D$ means a bigger drop across it, so the drain voltage **goes down** by $g_m v_{in} R_D$.

        $$A_v = -g_mR_D$$

        With $g_m = 10\,\text{mS}$ and $R_D = 2\,\text{k}\Omega$: $A_v = -20$. A 1 mV wiggle comes out as a 20 mV wiggle, upside down. **That is the whole idea.** This circuit is called the **common-source (CS) amplifier**, and it is the first stage on the map.
      `, F.cs()),
      Q(md`In the circuit above, $g_m = 4\,\text{mS}$ and $R_D = 5\,\text{k}\Omega$. The input wiggles by $+2\,\text{mV}$. What does the output do?`,
        ['Goes down by 40 mV', 'Goes up by 40 mV', 'Goes down by 8 mV', 'Goes up by 10 mV'], 0,
        [null, 'More current through $R_D$ means a bigger drop across it, so the drain goes down.', 'That is only the current ($8\\,\\mu\\text{A}$) times 1 kΩ; use $R_D = 5\\,\\text{k}\\Omega$.', 'The gain is $g_mR_D = 20$, and it inverts.'],
        md`Current: $4\,\text{mS}\times2\,\text{mV} = 8\,\mu\text{A}$ more. Voltage: $8\,\mu\text{A}\times5\,\text{k}\Omega = 40\,\text{mV}$ more drop across $R_D$, so the output **falls** by 40 mV. $A_v = -20$.`),
      R(md`
        ### "Just make $R_D$ huge" — and why that leads to every other topic
        $A_v = -g_mR_D$ says bigger $R_D$, bigger gain. So why not $R_D = 1\,\text{M}\Omega$? Three things get in the way, and each one is a topic of this exam.

        **1. The transistor itself leaks.** A real transistor is not a perfect valve: its current also creeps up with the drain voltage. That leak acts like a resistor $r_{ds}$ sitting right across the transistor, **in parallel** with $R_D$. The current lands in $R_D \parallel r_{ds}$, so the gain can never beat $g_m r_{ds}$ however big $R_D$ is.
        → So we need to know **what resistance a transistor shows when you look into each of its terminals**. That is **Unit 7, terminal impedances**, and it is Problem 2 on every practice exam.

        **2. Whatever you connect to the output also sits in parallel.** If the next circuit (a "load") has a small resistance, it steals the current and the gain collapses.
        → We need stages that can **drive** a small load without losing the signal: the **source follower (CD)**. And we need a clean way to compute gain with everything attached: the **$G_M R_{out}$ method** (Unit 8).

        **3. Big resistors are impossible on a chip, and $g_m$ varies from chip to chip.**
        → Replace resistors by **transistors**: a transistor used as a resistor (the **diode connection**), or as a near-perfect current source (a **current-source load**). Make the gain depend on resistor ratios instead of $g_m$: **source degeneration**. Get an enormous output resistance by stacking transistors: the **cascode**.

        And once you have several transistors, you need ways to **combine** them: chain two stages, let two transistors feed one output, copy a current with a **mirror** (Unit 9).
      `),
      R(md`
        ### The two questions behind every problem
        Every gain on this exam is the same story as the first circuit: **make a current** from the input, then **land it in a resistance**:
        $$A_v = -\underbrace{G_M}_{\text{current made per volt of input}}\times\underbrace{R_{out}}_{\text{resistance the current lands in}}$$
        So every problem asks one of two things:
        - **How much current does the input make?** ($G_M$: the transistor's $g_m$, reduced if something gets in the way.)
        - **How big is the resistance at the output?** ($R_{out}$: everything connected to the output node, in parallel.)

        Problem 2 on the exam is the second question by itself ("find $R_{EQ}$"). Problem 3 is both together ("find $A_v$"). Keep this picture in mind; every lesson is a piece of it.

        **Next:** the map, where you see every stage before we study any of them.
      `),
      Q(md`According to the picture above, why does a real CS stage's gain stop growing when you make $R_D$ enormous?`,
        ['The transistor\'s own leak $r_{ds}$ is in parallel with $R_D$, so the current lands in $R_D\\parallel r_{ds}$, which cannot exceed $r_{ds}$.', 'Because $g_m$ gets smaller.', 'Because the gate starts drawing current.', 'It does not stop: gain grows forever.'], 0,
        [null, '$g_m$ is set by the bias current, not by $R_D$ (in the small-signal picture).', 'The gate never draws current.', 'Parallel resistances are always smaller than the smallest one.'],
        md`The output node sees $R_D$ **and** $r_{ds}$ in parallel. However big $R_D$ gets, $R_D\parallel r_{ds} < r_{ds}$, so $|A_v| < g_mr_{ds}$. That is why we need to know the resistance looking into a transistor's drain: Unit 7.`),
    ],
  });

  // ================================================================ 2. the map
  const stage = (title, job, fig, line, link) => R(md`
    #### ${title}
    ${job}
  `, fig, md`${line} *Taught in* [${link[1]}](#/l/${link[0]}).`);

  L({
    id: 'e2-s-map', title: 'The map: every stage, before we learn any', ref: 'Look, do not memorise yet',
    steps: [
      R(md`
        Here is every circuit you will meet on Exam 2, grouped by the **job** it does. Do not memorise anything here. Just look at the shapes and read why each one exists. Each one links to the lesson that teaches it properly.

        ### Group 1: three ways to wire one transistor
        A transistor has three terminals. To amplify, one terminal takes the **input**, one gives the **output**, and the third is held still (it is "common" to input and output, hence the names). The gate can never be an output (no current flows through it), and the drain is never a good input. That leaves exactly **three** useful choices.
      `),
      stage('Common source (CS): input at the gate, output at the drain', 'The basic amplifier from the previous page: the input voltage makes a current, the current lands in the drain resistance. **Big gain, inverting.**', F.cs(), 'Headline: $A_v = -g_m(R_D\\parallel r_{ds})$.', ['e2-u8-cs', 'Common source']),
      stage('Common gate (CG): input at the source, output at the drain', 'Hold the gate still and push current in at the source. The source is an easy place for current to enter (low resistance), and the same current comes out of the drain into a big resistance. **Accepts a current, gives a big voltage, does not invert.**', F.cg(false), 'Headline: $A_v \\approx +g_mR_D$, input resistance $\\approx 1/g_m$.', ['e2-u8-cg', 'Common gate']),
      stage('Common drain (CD), the source follower: input at the gate, output at the source', 'The source follows the gate, about one-for-one. **No gain**, but the output is a low-resistance point, so it can **drive a heavy load** without the signal collapsing. It is a buffer.', F.cd(), 'Headline: $A_v \\approx 1$, output resistance $\\approx 1/g_m$.', ['e2-u8-cd', 'Common drain']),
      R(md`
        ### Group 2: what you hang on the drain (the load)
        The CS gain is $g_m\times$(resistance at the drain). These are the choices for that resistance, from small to big.
      `),
      stage('Resistor load', 'The textbook version. Simple, but large resistors are not practical on a chip.', F.cs(), 'Resistance seen: $R_D\\parallel r_{ds}$.', ['e2-u8-cs', 'Common source and its loads']),
      stage('Diode-connected load (gate tied to drain)', 'A transistor wired to act as a **small resistor**, $1/g_m$. The gain becomes a ratio of two transistors, so it is predictable, but small.', F.csDiode(), 'Headline: $A_v \\approx -g_{m1}/g_{m2}$.', ['e2-u7-diode', 'The diode-connected transistor']),
      stage('Current-source load (gate held still)', 'A transistor with a fixed gate pushes a nearly constant current, which looks like a **huge resistor** ($r_{ds}$). Biggest gain from one stage.', F.csIsrc(), 'Headline: $A_v = -g_{m1}(r_{ds1}\\parallel r_{ds2})$.', ['e2-u8-cs', 'Common source and its loads']),
      R(md`
        ### Group 3: what you put under the source
      `),
      stage('Source degeneration (a resistor under the source)', 'Trades gain for **predictability**: the gain becomes nearly $-R_D/R_S$, a resistor ratio, no longer dependent on $g_m$. Side effect: the drain becomes a much bigger resistance.', F.csDeg(), 'Headline: $A_v \\approx -\\dfrac{g_mR_D}{1+g_mR_S}$.', ['e2-u8-csdeg', 'Source degeneration']),
      R(md`
        ### Group 4: stacking transistors to get a huge output resistance
      `),
      stage('Cascode (a CG stage stacked on a CS stage)', 'The bottom transistor makes the current, the top one passes it up and **shields** the output. The output resistance gets multiplied by $g_mr_{ds}$ (about 100).', F.cascode(), 'Headline: $R_{out}\\approx g_{m2}r_{ds2}r_{ds1}$, $G_M\\approx g_{m1}$.', ['e2-u8-cascode', 'The cascode']),
      stage('Folded cascode', 'Same idea, but the passing transistor is a PMOS, so the signal "folds" back up. Useful when there is no room to stack.', F.foldedCascode(), 'Headline: current division at node $X$, then a CG stage.', ['e2-u9-folded', 'Folded cascode']),
      R(md`
        ### Group 5: combinations of two or more transistors
      `),
      stage('Current mirror', 'A diode turns a current into a voltage, and a second transistor with the same gate voltage turns it back into a **copy** of the current, scaled by size. Used to bias everything, and to carry signals from one branch to another.', F.mirror(), 'Headline: $i_{out} = \\frac{(W/L)_2}{(W/L)_1}i_{in}$.', ['e2-u9-mirror', 'Mirrors that carry signal']),
      stage('CMOS inverter used as an amplifier', 'NMOS and PMOS both driven by the input. Both push the output the same way, so their effects add.', F.inverter(), 'Headline: $A_v = -(g_{m1}+g_{m2})(r_{ds1}\\parallel r_{ds2})$.', ['e2-u8-cs', 'Common source and its loads']),
      stage('Differential pair with a mirror load', 'Two transistors sharing a source: the basis of every op-amp. On this exam you only need the resistance at its output.', F.diffMirror(), 'Headline: $R_{out}\\approx r_{ds2}\\parallel r_{ds4}$.', ['e2-u7-pair', 'Differential-pair nodes']),
      R(md`
        ### What the exam actually does with these
        The exam rarely asks for a stage by name. It draws a 3 to 8 transistor circuit and asks for a resistance or a gain. Your job is to **see these shapes inside it**, then combine their results. That skill is built in the order on the next page.
      `),
    ],
  });

  // ================================================================ 3. the route
  L({
    id: 'e2-s-route', title: 'The route: what we learn, in what order, and why', ref: 'Two minutes',
    steps: [
      R(md`
        Each step answers one question, and each one needs the step before it.

        | Step | The question it answers | Why it comes here |
        |---|---|---|
        | **Exam 1 refresher** | What do I need from Exam 1? | DC bias gives $g_m$; Thévenin and the test source are the tools for everything after. |
        | **Unit 6: the small-signal MOSFET** | What does a transistor look like to a small wiggle? | We need a simple linear model ($g_m$, $r_{ds}$) before we can analyse any stage. |
        | **Unit 7: terminal impedances** | What resistance do I see looking into a gate, a drain, a source? | $R_{out}$ is built out of these. This is Problem 2. |
        | **Unit 8: single stages** | How do I get $G_M$ and $R_{out}$, and the gain, for each of CS, CG, CD, cascode? | Uses Unit 7 for $R_{out}$. This is Problem 3 for one stage. |
        | **Unit 9: multi-transistor circuits** | What if there are several stages or several paths? | Real exam circuits combine the stages from Unit 8. |
        | **Practice exams** | Can I do it under time? | Same three problem types every time. |

        Inside each lesson, a box at the top says **why we need it** and **where it leads**, so you always know where you are.

        **Pace:** one unit per sitting, with the drills, is plenty. If a lesson feels dense, slow down on the worked example and the prediction questions; skip ahead only after you can say the headline result *and* why it is true in one sentence.
      `),
    ],
  });

  // ================================================================ "why this lesson" openers
  const WHY = {
    'e2-u6-refresh': ['Exam 2 is built on Exam 1: the bias point gives $g_m$, and Thévenin with a test source is how every resistance is found.', 'Next: what a transistor looks like to a small wiggle.'],
    'e2-u6-picture': ['To analyse an amplifier we only care about the **wiggle**, not the DC values. This lesson shows how to throw the DC parts away cleanly.', 'Next: the simple linear model of the transistor that is left.'],
    'e2-u6-model': ['Every circuit on the exam is analysed with one small model of the transistor. This is it: a current source $g_mv_{gs}$ plus the leak $r_{ds}$.', 'Next: how to find the resistance at any terminal with this model.'],
    'e2-u6-test': ['The exam asks "what resistance do you see here?" all the time. The test-source method from Exam 1 is how you answer it with a transistor in the circuit.', 'Next (Unit 7): the answers for each terminal, so you do not have to redo the algebra every time.'],
    'e2-u7-three': ['$R_{out}$ is made of whatever hangs on the output node, and most of that is transistor terminals. The first three answers: looking into the gate, the drain, the source.', 'Next: the diode connection, the transistor wired as a small resistor.'],
    'e2-u7-diode': ['We need small, predictable resistors without real resistors (they are huge on a chip). Tying the gate to the drain gives exactly that: $1/g_m$.', 'Next: what a resistor under the source does to the drain resistance.'],
    'e2-u7-scaler': ['The current-source load and the cascode both need a really **big** resistance. A resistor under the source multiplies it by $g_mr_{ds}$. This is the most-used result on Problem 2.', 'Next: stacking this trick to get a cascode.'],
    'e2-u7-cascode': ['The scaler applied twice: stack two transistors and the output resistance goes from $r_{ds}$ to about $g_mr_{ds}^2$. Big output resistance means big gain later.', 'Next: real nodes have several branches at once.'],
    'e2-u7-node': ['Exam nodes have something above and something below. This lesson combines the pieces you know into one answer.', 'Next: the twist that part (b) of Problem 2 usually adds, a gate that moves.'],
    'e2-u7-k': ['Part (b) of Problem 2 is usually part (a) plus one twist: the test voltage also reaches a gate. This lesson handles that twist with one formula.', 'Next: the special node in a differential pair.'],
    'e2-u7-pair': ['Practice 3 asks for the resistance at a differential pair\'s output. It is the scaler and the mirror in one picture.', 'Next (Unit 8): putting resistances to work as gain.'],
    'e2-u8-gmrout': ['Every gain is "current made" times "resistance it lands in". This lesson turns that into a two-step method you can apply to any circuit.', 'Next: the method on the most important stage, the common source.'],
    'e2-u8-cs': ['The common source is the stage that actually amplifies. Its gain depends on the load, so we compare every load from the map side by side.', 'Next: adding a resistor under the source, for predictable gain.'],
    'e2-u8-csdeg': ['Gain $-g_mR_D$ changes when $g_m$ changes (temperature, chip to chip). Degeneration makes the gain a resistor ratio instead.', 'Next: the common gate, which takes its input at the source.'],
    'e2-u8-cg': ['Sometimes the signal is a **current** to collect, not a voltage. The common gate accepts current easily at its low-resistance source and delivers it at a high-resistance drain. It is also the top half of a cascode.', 'Next: the follower, which drives loads.'],
    'e2-u8-cd': ['A CS stage cannot drive a small load directly (the load steals the current). The follower sits in between: it copies the voltage and offers a low-resistance output.', 'Next: the cascode, which combines CS and CG.'],
    'e2-u8-cascode': ['The CS stage is limited by its output resistance. Putting a CG on top keeps the same current but multiplies the output resistance. Three ways to the same answer show the methods agree.', 'Next: the numeric version, as Problem 1 asks it.'],
    'e2-u8-numbers': ['Problem 1 often asks for a number, no calculator. It is the same stages with the bias filled in.', 'Next (Unit 9): circuits with more than one stage.'],
    'e2-u9-chain': ['Real circuits are stages in a row. The only new thing is loading: does the second stage steal from the first?', 'Next: two transistors feeding the same output.'],
    'e2-u9-paths': ['When the input reaches the output by two routes, you add their currents. The trick is getting the signs right.', 'Next: signals passing through current mirrors.'],
    'e2-u9-mirror': ['Mirrors do not just bias: they also copy small-signal currents from one branch to another. Several practice problems route the signal this way.', 'Next: the folded cascode, where current division decides the gain.'],
    'e2-u9-folded': ['The folded cascode (Practice 1 #3) puts every tool together: a CS input, current division at a node, a CG output stage.', 'Next: the DC problem that can still appear as Problem 1.'],
    'e2-u9-dc': ['Problem 1 can still be a pure DC mirror problem, exactly like Exam 1. A quick refresher so it costs no time.', 'Next: the playbook for the exam itself.'],
    'e2-u9-playbook': ['Everything together: which problem type is which, the order to work, and the checks that catch mistakes.', 'Next: the practice exams, under time.'],
  };
  COURSE.units.forEach((u) => u.lessons.forEach((l) => {
    const w = WHY[l.id];
    if (!w) return;
    l.steps.unshift(R(md`
      !!intuition Why this lesson, and where it goes
      ${w[0]} **Where it goes:** ${w[1].replace(/^Next(?: \((Unit \d)\))?: /, (m, u) => (u ? `${u}: ` : ''))} ([see the map](#/l/e2-s-map))
    `));
  }));
})();

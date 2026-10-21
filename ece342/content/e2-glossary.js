/* Start: a plain-language glossary of every word and symbol the Exam 2 pages use. */
(function () {
  'use strict';
  const { R } = C;
  const F = window.E2F;
  const l = {
    id: 'e2-s-words', title: 'Words and symbols, in plain language', ref: 'Look things up here',
    steps: [
      R(md`
        Every piece of jargon on these pages, in plain words. Keep this open in another tab while you read.

        ### Words for circuits and stages
        | Word | What it means |
        |---|---|
        | **Stage** | One transistor (or a small group) doing one job: one block of the amplifier. |
        | **Common source (CS)** | Input at the gate, output at the drain, source held still. The basic amplifier. Inverts. |
        | **Common gate (CG)** | Input at the source, output at the drain, gate held still. Does not invert. |
        | **Common drain (CD)**, **source follower** | Input at the gate, output at the source. The source "follows" the gate, gain about 1. Used as a buffer. |
        | **Load** | Whatever sits between the output node and the supply: a resistor $R_D$, or a transistor acting as one. |
        | **Diode-connected** | A transistor with its gate wired to its own drain. It then behaves like a small resistor, $1/g_m$. |
        | **Current source (load)** | A transistor whose gate is held at a fixed voltage. It pushes a nearly fixed current, so it looks like a very big resistor ($r_{ds}$). |
        | **Degeneration**, **degenerated** | A resistor (call it $R_S$) placed between a transistor's **source** and ground. "Degenerated CS" = a common source with that resistor. It lowers the gain but makes it predictable, and makes the drain look like a much bigger resistance. The name: it "degenerates" (reduces) the gain. |
        | **Cascode** | Two transistors stacked: the bottom one makes the signal current, the top one (a CG, gate held) passes it up and makes the output resistance about $g_mr_{ds}$ times bigger. |
        | **Folded cascode** | A cascode where the top device is a PMOS, so the signal turns ("folds") back up. |
        | **Current mirror** | A diode-connected transistor plus a second transistor sharing its gate. The second copies the first one's current, scaled by size. |
        | **Differential pair** | Two transistors whose sources are tied together and fed by one current source. |
        | **Buffer** | A stage with gain about 1 that can drive a heavy (small-resistance) load. The follower. |
        | **Gain boosting**, **regulated cascode** | A cascode whose top gate is driven by an extra amplifier, making the output resistance even bigger. |
      `),
      R(md`
        A **degenerated** common source, labelled: the resistor $R_S$ under the source is the degeneration.
      `, F.csDeg()),
      R(md`
        ### Words for analysis
        | Word | What it means |
        |---|---|
        | **Bias**, **DC operating point** | The steady voltages and currents with no signal (Exam 1's job). |
        | **Small signal**, **incremental** | The tiny wiggle on top of the bias. Written in lower case: $v_{in}$, $i_d$. DC values are upper case: $V_{OUT}$, $I_D$. |
        | **Incremental ground** | A node that does not move when the signal moves ($V_{DD}$, a bias voltage). For signals it is the same as ground. Drawn as an open triangle ▽. |
        | **Looking into** a terminal | The resistance you would measure at that terminal with a test source, everything else as connected. |
        | **Test source** | A voltage $v_t$ you apply to find a resistance: $R = v_t/i_t$. Same as Thévenin resistance on Exam 1. |
        | **$R_{UP}$, $R_{DN}$** | The resistance seen looking **up** from a node (toward $V_{DD}$) and **down** (toward ground). The node's total is $R_{UP}\parallel R_{DN}$. |
        | **$R_{EQ}$**, $R_{eq}$ | "Equivalent resistance": the resistance at the marked node. Problem 2 asks for it. |
        | **$R_{in}$**, **$R_{out}$** | Resistance looking into the amplifier's input; resistance at its output (with the input turned off). |
        | **Loading** | When the next stage (or a load resistor) sits in parallel with the output and lowers the gain. |
        | **Impedance scaler** | The fact that a transistor with its gate held makes a source resistance look $g_mr_{ds}$ times bigger from the drain, and a drain resistance look $g_mr_{ds}$ times smaller from the source. |
        | **K rule** | The formula for the resistance at a drain when the test voltage also moves the gate, by a fraction $K$. |
        | **Superposition of paths** | When the input reaches the output through two transistors, add their contributions. |
        | **Inverting** | The output moves opposite to the input (negative gain). |
      `),
      R(md`
        ### Symbols
        | Symbol | Read it as | What it is |
        |---|---|---|
        | $V_{TN}$, $\lvert V_{TP}\rvert$ | threshold | NMOS and PMOS threshold voltage, both 1 V in this course. |
        | $V_T$ | thermal voltage | Diodes only: about 26 mV. |
        | $V_{ov}$ | overdrive | How far above threshold: $V_{GS} - V_{TN}$ (NMOS), $V_{SG} - \lvert V_{TP}\rvert$ (PMOS). |
        | $\mu_nC_{ox}$, $\mu_pC_{ox}$ | process constants | $100$ and $50\,\mu\text{A/V}^2$. |
        | $W/L$, $1X$ | size | Width over length. "$2X$" means twice the reference size $1X$. |
        | $g_m$ | transconductance | Extra drain current per volt of extra $v_{gs}$: $2I_D/V_{ov}$. Units: siemens (A/V). |
        | $1/g_m$ | "one over g-m" | A resistance: what you see looking into a source or a diode. |
        | $r_{ds}$ | output resistance | The transistor's leak from drain to source. Big (tens of kΩ). Infinite only if $\lambda = 0$. |
        | $g_mr_{ds}$ | intrinsic gain | The most gain one transistor can give; about 20 to 1000. "$g_mr_{ds}\gg1$" means you may drop terms smaller by this factor. |
        | $v_{gs}$, $v_x$ | gate-source voltage | The small voltage that controls the transistor. Lectures and Exam 1 call it $v_x$ (or $V_X$). |
        | $G_M$ | big-G-M | The whole stage's transconductance: current pulled into the stage per volt of input, with the output shorted. |
        | $A_v$ | voltage gain | $v_{out}/v_{in}$. With the course's sign convention, $A_v = -G_MR_{out}$. |
        | $\parallel$ | "in parallel with" | $a\parallel b = \dfrac{ab}{a+b}$. Always smaller than the smaller one. |
        | $\approx$ | approximately | Usually means "using $g_mr_{ds}\gg1$". |
        | $M_1, M_2, \dots$ | transistors | Numbered in the figure; $g_{m1}$, $r_{ds1}$ belong to $M_1$. |
      `),
    ],
  };
  const u = E2.unit('e2start');
  const i = u.lessons.findIndex((x) => x.id === 'e2-s-map');
  u.lessons.splice(i + 1, 0, l);
})();

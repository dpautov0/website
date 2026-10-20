/* Exam 2 flashcards: every canonical stage as a card (circuit on the front, the result and the reason on the back),
   drilled with a small Leitner scheme: "Missed it" sends a card back into this round, "Got it" twice in a row
   (across rounds) marks it known. Boxes are kept in localStorage, per browser. */
(function () {
  'use strict';
  const F = window.E2F;
  const ex = (e, n) => E2.ex(e, n, '');

  const CATS = { imp: 'Terminal impedances', stage: 'Amplifier stages', rule: 'Methods', dc: 'DC and sizing', trap: 'Traps' };

  const CARDS = [
    // ---------------------------------------------------------------- terminal impedances
    { id: 'i-gate', cat: 'imp', t: 'Looking into the gate', fig: F.gate(),
      q: md`What resistance do you see looking into the gate?`,
      a: md`$$R_G = \infty$$`,
      why: md`The gate sits on an insulator: no current flows into it, at DC or for signals. So a gate never loads the node it hangs on. A divider or a diode node that drives a gate keeps its own voltage.` },
    { id: 'i-drain', cat: 'imp', t: 'Looking into the drain', fig: F.drain(), ex: ex('rds', ['rds']),
      q: md`Gate and source at incremental ground. Resistance looking into the drain?`,
      a: md`$$R_D = r_{ds}$$`,
      why: md`With $v_{gs} = 0$ the controlled source $g_mv_{gs}$ is dead, so only $r_{ds}$ is left. This is why a transistor with a fixed gate is a current source: ideal when $r_{ds}\to\infty$.` },
    { id: 'i-source', cat: 'imp', t: 'Looking into the source', fig: F.source(), ex: ex('rds || 1/gm', ['gm', 'rds']),
      q: md`Gate and drain at incremental ground. Resistance looking into the source?`,
      a: md`$$R_S = \frac{1}{g_m}\parallel r_{ds} \approx \frac{1}{g_m}$$`,
      why: md`Push the source up by $v$: then $v_{gs} = -v$ and the channel carries $g_mv$ less current down, which is the same as $g_mv$ flowing **into** the source. A resistor of $1/g_m$. Sources are low-impedance nodes.` },
    { id: 'i-diode', cat: 'imp', t: 'Diode-connected NMOS', fig: F.diode(), ex: ex('rds || 1/gm', ['gm', 'rds']),
      q: md`Gate tied to drain, source grounded. Resistance looking in?`,
      a: md`$$R_{diode} = \frac{1}{g_m}\parallel r_{ds} \approx \frac{1}{g_m}$$`,
      why: md`Raise the drain by $v$ and the gate rises with it: $v_{gs} = v$, so the device draws $g_mv$. That is Ohm's law for $1/g_m$. Same number as looking into a source.` },
    { id: 'i-pdiode', cat: 'imp', t: 'Diode-connected PMOS', fig: F.pdiode(), ex: ex('rds || 1/gm', ['gm', 'rds']),
      q: md`A PMOS with its gate tied to its drain, source at $V_{DD}$. Resistance looking into the drain?`,
      a: md`$$R_{diode} = \frac{1}{g_m}\parallel r_{ds} \approx \frac{1}{g_m}$$`,
      why: md`The small-signal model is the **same** for NMOS and PMOS ($i_d = g_mv_{gs} + v_{ds}/r_{ds}$, drain to source). Every result in this deck works for PMOS unchanged.` },
    { id: 'i-deg', cat: 'imp', t: 'Drain with source degeneration', fig: F.drainDeg(), ex: ex('rds + RS + gm*rds*RS', ['gm', 'rds', 'RS']),
      q: md`Gate at incremental ground, $R_S$ in the source. Resistance looking into the drain?`,
      a: md`$$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S \approx r_{ds}(1 + g_mR_S)$$`,
      why: md`**Impedance scaler:** a resistance in the source looks $g_mr_{ds}$ times bigger from the drain. Current through $R_S$ lifts the source, that lowers $v_{gs}$, and the channel fights the change. Memorise this one cold: half the exam reduces to it.` },
    { id: 'i-srd', cat: 'imp', t: 'Source with a drain load', fig: F.sourceRD(), ex: ex('(rds + RD)/(1 + gm*rds)', ['gm', 'rds', 'RD']),
      q: md`Gate at incremental ground, $R_D$ on the drain. Resistance looking into the source?`,
      a: md`$$R_S = \frac{r_{ds} + R_D}{1 + g_mr_{ds}} \approx \frac{1}{g_m} + \frac{R_D}{g_mr_{ds}}$$`,
      why: md`The other half of the scaler: a drain resistance looks $g_mr_{ds}$ times **smaller** from the source. It is $\approx 1/g_m$ only while $R_D \ll r_{ds}$. If $R_D$ is an ideal current source, $R_S \to \infty$.` },
    { id: 'i-diode-rs', cat: 'imp', t: 'Diode with a source resistor', fig: F.diodeRS(), ex: ex('RS + 1/(gm + 1/rds)', ['gm', 'rds', 'RS']),
      q: md`Diode-connected device with $R_S$ at its source. Resistance looking in?`,
      a: md`$$R_{DN} = R_S + \frac{1}{g_m}\parallel r_{ds} \approx R_S + \frac{1}{g_m}$$`,
      why: md`The gate moves with the drain (the $K = 1$ case), so there is no multiplication: just $1/g_m$ in series with $R_S$. Not $\approx R_S$ unless $g_mR_S \gg 1$.` },
    { id: 'i-k', cat: 'imp', t: 'The K rule: a gate that moves', fig: F.drainK(), ex: ex('(rds + RS + gm*rds*RS)/(1 + gm*rds*K)', ['gm', 'rds', 'RS', 'K']),
      q: md`The gate moves by $v_g = K\,v_x$ when you apply $v_x$ at the drain. Resistance looking into the drain?`,
      a: md`$$R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$$
With $R_S = 0$: $\;R_{DN} = r_{ds}\parallel \dfrac{1}{Kg_m}$.`,
      why: md`$K = 0$ is the degenerated drain, $K = 1$ is a diode. Find $K$ from whatever divider drives the gate (a resistor divider, a diode in a stack, $R_S/R_{UP}$...). This is Problem Set 5 (f), (g), (h), (i).` },
    { id: 'i-cascode', cat: 'imp', t: 'Cascode output resistance', fig: F.cascodeR(), ex: ex('rds1 + rds2 + gm2*rds2*rds1', ['gm2', 'rds1', 'rds2']),
      q: md`Two stacked NMOS, both gates at incremental ground. Resistance looking into the top drain?`,
      a: md`$$R_{out} = r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1} \approx g_{m2}r_{ds2}\,r_{ds1}$$`,
      why: md`It is the degenerated drain with $R_S = r_{ds1}$. Each cascode level multiplies by another $g_mr_{ds}$ (about 100).` },
    { id: 'i-boost', cat: 'imp', t: 'Gain-boosted (regulated) cascode', fig: F.regCascode(), ex: ex('rds1 + R + gm1*rds1*(1 + gm3*rds3)*R', ['gm1', 'rds1', 'gm3', 'rds3', 'R']),
      q: md`$M_3$ senses node $Y$ and drives $M_1$'s gate ($I_B$ is ideal). Resistance looking into $M_1$'s drain?`,
      a: md`$$R_{out} = r_{ds1} + R + g_{m1}r_{ds1}(1 + A)R,\quad A = g_{m3}r_{ds3}$$
$$\approx g_{m1}r_{ds1}\,g_{m3}r_{ds3}\,R$$`,
      why: md`When $Y$ rises, $M_3$ pulls $M_1$'s gate **down** by $A$ times as much, so $v_{gs1}$ shrinks $(1+A)$ times faster: the scaler gets multiplied by the booster's gain. This is the $K$ rule with $K = -A$ at the source side (Practice 2 #2b).` },
    { id: 'i-dp-mirror', cat: 'imp', t: 'Differential pair with a mirror load', fig: F.diffMirror(), ex: ex('rds2 || rds4', ['rds2', 'rds4']),
      q: md`Gates at incremental ground, ideal tail. Resistance at the output node?`,
      a: md`$$R_{out} \approx r_{ds2}\parallel r_{ds4}$$`,
      why: md`Current pushed in at the output goes down $M_2$, across through $M_1$ (it sees about $2r_{ds}$), lands on the diode $M_3$, and the mirror $M_4$ copies it: two equal paths of about $2r_{ds}$, i.e. the same as $r_{ds2}$ alone. Practice 3 #3(b).` },

    // ---------------------------------------------------------------- traps
    { id: 't-short', cat: 'trap', t: 'Gate shorted to source with a wire', fig: F.gsShort(),
      q: md`The gate is wired straight to the source. What two-terminal small-signal element is left between drain and source?`,
      a: md`**An open circuit.** $V_{GS} = 0 < V_T$ at DC, so the transistor is **off**.`,
      why: md`A small-signal model only exists around a bias point. Always check the DC state before drawing $g_m$ and $r_{ds}$. (Practice 1 #1c)` },
    { id: 't-cap', cat: 'trap', t: 'Gate shorted to source with a huge capacitor', fig: F.gsCap(),
      q: md`Same device, but gate and source are joined through a very large capacitor (the bias is set elsewhere). What element is left?`,
      a: md`**A resistor $r_{ds}$** (an ideal current source if $r_{ds}\to\infty$).`,
      why: md`The capacitor is open at DC, so the device stays biased, but it is a short for signals: $v_{gs} = 0$, the controlled source is dead, only $r_{ds}$ remains.` },
    { id: 't-isrc', cat: 'trap', t: 'Ideal sources in the small-signal circuit',
      q: md`What do an ideal DC current source and an ideal DC voltage source become in the small-signal circuit?`,
      a: md`Current source: **open** ($R = \infty$). Voltage source (and $V_{DD}$, and a bias like $V_B$): **short** to ground, i.e. incremental ground.`,
      why: md`A DC source holds its value no matter what, so its *change* is zero: zero change in current is an open, zero change in voltage is a short. Problem Set 5 (a), (b): $R_{EQ} = \infty$.` },
    { id: 't-cg-isrc', cat: 'trap', t: 'CG input when the load is a current source',
      fig: [['rail', [1, -1.2]], ['I', [1, -1.2], [1, 0], { n: 'I_B' }], ['nmos', [1, 1]], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], F.lookUp([1, 2.4], 'R_{in}')],
      q: md`A common-gate device's drain goes to an ideal current source instead of $R_D$. What is its input resistance at the source?`,
      a: md`$$R_{in} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\Big|_{R_D\to\infty} = \infty$$`,
      why: md`"$1/g_m$ looking into a source" assumes the drain can move freely to a low-resistance load. With nowhere for the current to go, the source cannot take any. (Lecture 17 note)` },
    { id: 't-sign', cat: 'trap', t: 'Signs: which stages invert?',
      q: md`Which of CS, CG, CD invert? What does that say about the sign of $G_M$ in $A_v = -G_MR_{out}$?`,
      a: md`Only **CS inverts**. CG and CD are non-inverting, so for them $G_M < 0$ (with $G_M$ = short-circuit current pulled **down** into the stage).`,
      why: md`Do a one-line sign check on every answer: "$v_{in}$ up → current down ↑ → $v_{out}$ down". Chains: count the CS stages.` },

    // ---------------------------------------------------------------- stages
    { id: 's-cs', cat: 'stage', t: 'Common source', fig: F.cs(), ex: ex('-gm*(RD || rds)', ['gm', 'rds', 'RD']),
      q: md`$G_M$, $R_{out}$, $A_v$ (with $r_{ds}$)?`,
      a: md`$$G_M = g_m,\quad R_{out} = R_D\parallel r_{ds},\quad A_v = -g_m(R_D\parallel r_{ds})$$
$R_{in} = \infty$.`,
      why: md`$v_{in}$ up → $g_mv_{in}$ more current pulled down → $v_{out}$ drops. The gain is transconductance times whatever resistance sits at the drain: $R_{UP}\parallel R_{DN}$.` },
    { id: 's-csdeg', cat: 'stage', t: 'CS with source degeneration', fig: F.csDeg(), ex: ex('-gm*RD/(1 + gm*RS)', ['gm', 'RD', 'RS']),
      q: md`$G_M$, $R_{out}$ and $A_v$ (gain with $r_{ds}\to\infty$)?`,
      a: md`$$G_M = \frac{g_m}{1 + (g_m + g_{ds})R_S} \approx \frac{g_m}{1 + g_mR_S}$$
$$R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S),\qquad A_v \approx -\frac{g_mR_D}{1 + g_mR_S}\approx -\frac{R_D}{R_S}$$`,
      why: md`$R_S$ eats part of the input: $v_{gs} = v_{in}/(1+g_mR_S)$. When $g_mR_S \gg 1$, $G_M \to 1/R_S$ and the gain is a resistor ratio, independent of the transistor.` },
    { id: 's-csdiode', cat: 'stage', t: 'CS with a diode load', fig: F.csDiode(), ex: ex('-gm1/gm2', ['gm1', 'gm2']),
      q: md`$A_v$ (ignoring $r_{ds}$)? What sets it?`,
      a: md`$$A_v = -g_{m1}\Big(\tfrac{1}{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\Big) \approx -\frac{g_{m1}}{g_{m2}} = -\sqrt{\frac{\mu_1(W/L)_1}{\mu_2(W/L)_2}}$$`,
      why: md`Both devices carry the same current, and $g_m = \sqrt{2\mu C_{ox}(W/L)I_D}$, so the ratio of $g_m$ is the square root of the ratio of $\mu W/L$. Small gain, but set by geometry. NMOS over a PMOS diode: include $\mu_n/\mu_p = 2$.` },
    { id: 's-csi', cat: 'stage', t: 'CS with a current-source load', fig: F.csIsrc(), ex: ex('-gm1*(rds1 || rds2)', ['gm1', 'rds1', 'rds2']),
      q: md`$A_v$?`,
      a: md`$$A_v = -g_{m1}(r_{ds1}\parallel r_{ds2}) \approx -\tfrac12 g_mr_{ds}$$`,
      why: md`The load is $r_{ds2}$ (fixed gate). This is the largest gain one stage gives: the "intrinsic gain" $g_mr_{ds}$, shared by two $r_{ds}$ in parallel.` },
    { id: 's-cg', cat: 'stage', t: 'Common gate', fig: F.cg(), ex: ex('(RD || (rds + RS + gm*rds*RS))/(RS + 1/(gm + 1/rds))', ['gm', 'rds', 'RD', 'RS']),
      q: md`Input through $R_S$ into the source, gate at incremental ground. $A_v$, $R_{in}$ (at the source), $R_{out}$?`,
      a: md`$$A_v = +\frac{R_D\parallel R_{dev}}{R_S + \frac{1}{g_m}\parallel r_{ds}} \approx +\frac{R_D}{R_S + 1/g_m}$$
$$R_{in} = \frac{r_{ds}+R_D}{1+g_mr_{ds}} \approx \frac1{g_m},\qquad R_{out} = R_D\parallel\underbrace{(r_{ds} + R_S + g_mr_{ds}R_S)}_{R_{dev}}$$`,
      why: md`The source is a $1/g_m$ node, so $v_{in}$ pushes a current $v_{in}/(R_S + 1/g_m)$ through the device and it all lands in $R_D$. Same size as the degenerated CS, but **non-inverting**. With $R_S = 0$: $A_v = (1 + g_mr_{ds})\frac{R_D}{R_D + r_{ds}} \approx g_m(R_D\parallel r_{ds})$.` },
    { id: 's-cd', cat: 'stage', t: 'Common drain (source follower)', fig: F.cd(), ex: ex('(RL || rds)/((RL || rds) + 1/gm)', ['gm', 'rds', 'RL']),
      q: md`$A_v$, $R_{out}$, $R_{in}$?`,
      a: md`$$A_v = \frac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m} < 1$$
$$R_{out} = R_L\parallel\frac{1}{g_m}\parallel r_{ds},\qquad R_{in} = \infty$$`,
      why: md`A voltage divider between $1/g_m$ (looking up into the source) and $R_L$. It follows, never gains, but it can drive a small load. In the course convention $G_M = -g_m$.` },
    { id: 's-cdi', cat: 'stage', t: 'Follower on an ideal current source', fig: F.cdI(), ex: ex('gm*rds/(1 + gm*rds)', ['gm', 'rds']),
      q: md`$A_v$? And the DC output?`,
      a: md`$$A_v = \frac{g_mr_{ds}}{1 + g_mr_{ds}} \approx 1,\qquad V_{OUT} = V_{IN} - (V_T + V_{ov})$$`,
      why: md`$I_D = I_B$ is fixed, so $V_{GS}$ is fixed: the source copies the gate, shifted down by $V_{GS}$ (a level shifter). Only $r_{ds}$ keeps the gain a hair under 1.` },
    { id: 's-cascode', cat: 'stage', t: 'Cascode amplifier', fig: F.cascode(), ex: ex('-gm1*RD*rds1*(1 + gm2*rds2)/(RD + rds1 + rds2 + gm2*rds1*rds2)', ['gm1', 'gm2', 'rds1', 'rds2', 'RD']),
      q: md`$G_M$, $R_{out}$, $A_v$?`,
      a: md`$$G_M = \frac{g_{m1}r_{ds1}(1+g_{m2}r_{ds2})}{r_{ds1}+r_{ds2}+g_{m2}r_{ds1}r_{ds2}} \approx g_{m1}$$
$$R_{out} = R_D\parallel(r_{ds1}+r_{ds2}+g_{m2}r_{ds2}r_{ds1}),\qquad A_v = -G_MR_{out} \approx -g_{m1}R_D$$`,
      why: md`$M_1$ makes the current, $M_2$ just passes it up (its source is a $1/g_{m2}$ node, far below $r_{ds1}$, so almost nothing is lost). With an ideal current-source load the gain is $\approx -g_{m1}r_{ds1}\,g_{m2}r_{ds2}$.` },
    { id: 's-inv', cat: 'stage', t: 'CMOS inverter as an amplifier', fig: F.inverter(), ex: ex('-(gm1 + gm2)*(rds1 || rds2)', ['gm1', 'gm2', 'rds1', 'rds2']),
      q: md`Both gates driven by $v_{in}$. $G_M$, $R_{out}$, $A_v$?`,
      a: md`$$G_M = g_{m1} + g_{m2},\quad R_{out} = r_{ds1}\parallel r_{ds2},\quad A_v = -(g_{m1}+g_{m2})(r_{ds1}\parallel r_{ds2})$$`,
      why: md`$v_{in}$ up: the NMOS pulls more down **and** the PMOS pushes less up. Both currents act the same way, so the transconductances add. (Problem Set 4 #2)` },
    { id: 's-folded', cat: 'stage', exWhat: 'G_M', t: 'Folded cascode', fig: F.foldedCascode(), ex: ex('gm1*(par(rds1, rds3, 1/gm2))/(par(rds1, rds3, 1/gm2) + 1/gm4)', ['gm1', 'gm2', 'gm4', 'rds1', 'rds3']),
      q: md`$G_M$ and $R_{out}$? Let $R_X$ be everything at node $X$ except $M_4$.`,
      a: md`$$R_X = r_{ds1}\parallel r_{ds3}\parallel\tfrac{1}{g_{m2}},\qquad G_M = g_{m1}\frac{R_X}{R_X + 1/g_{m4}} \approx \frac{g_{m1}g_{m4}}{g_{m2}+g_{m4}}$$
$$R_{out} = R_D\parallel[r_{ds4} + R_X(1 + g_{m4}r_{ds4})]$$`,
      why: md`$M_1$'s current arrives at $X$ and splits between the $1/g_{m4}$ source of $M_4$ and the rest of the node (current division). Then $M_4$ is a CG stage degenerated by $R_X$. Practice 1 #3, Problem Set 4 #4.` },

    // ---------------------------------------------------------------- methods
    { id: 'r-gmrout', cat: 'rule', t: 'The $G_MR_{out}$ method', fig: F.cs(),
      q: md`State the method: what is $G_M$, what is $R_{out}$, how do they give $A_v$?`,
      a: md`$$A_v = -G_MR_{out}$$
$G_M$: **short the output** to ground, $G_M = i_{out}/v_{in}$ with $i_{out}$ the current pulled down into the stage. $R_{out}$: **kill $v_{in}$**, the resistance at the output.`,
      why: md`Any linear circuit is a Norton source plus a resistor at its output (Lecture 15). Shorting the output means $R_{out}$ doesn't matter while you find $G_M$, and vice versa: two easy problems instead of one hard one.` },
    { id: 'r-updn', cat: 'rule', t: '$R_{UP}\\parallel R_{DN}$',
      q: md`How do you get the resistance at a node with transistors above and below it?`,
      a: md`$$R = R_{UP}\parallel R_{DN}$$
Look **up** from the node to the next incremental ground, look **down** to ground, use the canonical results for each branch, put them in parallel. A third branch (a gate that moves) goes in parallel too.`,
      why: md`A test source at the node pushes current into every branch at once, and each branch only sees the test voltage at its own terminal. Problem Set 5 (e)–(i).` },
    { id: 'r-scaler', cat: 'rule', t: 'The impedance scaler',
      q: md`One transistor, gate fixed. How does it transform resistances between its source and drain?`,
      a: md`From the drain, a source resistance $R_S$ looks like $\approx g_mr_{ds}R_S$ (bigger).
From the source, a drain resistance $R_D$ looks like $\approx \dfrac{1}{g_m} + \dfrac{R_D}{g_mr_{ds}}$ (smaller).`,
      why: md`That is why cascodes (big up) and common-gate inputs (small down) exist. Lecture 17: "CG amplifier acts as an impedance scaler".` },
    { id: 'r-chain', cat: 'rule', t: 'Gain chains',
      q: md`A circuit has an intermediate node $v_1$. How do you split the gain, and what is the loading rule?`,
      a: md`$$A_v = \frac{v_1}{v_{in}}\cdot\frac{v_{out}}{v_1}$$
Find $v_1$ **with the next stage attached**: a gate adds nothing (infinite), a source or a diode adds its $1/g_m$ in parallel.`,
      why: md`Gates are free, sources are not. If the second stage is driven by a gate, the stages are independent and you just multiply. (Problem Set 6)` },
    { id: 'r-paths', cat: 'rule', t: 'Two paths to one output',
      q: md`$v_{in}$ reaches the output through two transistors. How do you combine them?`,
      a: md`**Add the transconductances** (superposition), keep one $R_{out}$:
$$A_v = -(G_{M,a} + G_{M,b})R_{out}$$
If one path goes through an earlier stage with gain $A_1$: $G_M = G_{M,a} + g_{m,b}A_1$ with the right sign.`,
      why: md`Shorted output: each transistor's current lands in the same short, so the currents add. Problem Set 4 #2 and 6(e), Practice 4 #2.` },
    { id: 'r-divide', cat: 'rule', t: 'Current division at a node',
      q: md`A current $i$ arrives at a node that has $1/g_{m2}$ (a source or a diode) and $R_X$ to ground. How much goes into the $1/g_{m2}$ branch?`,
      a: md`$$i_{2} = i\,\frac{R_X}{R_X + 1/g_{m2}}$$
Nearly all of it if $R_X \gg 1/g_{m2}$ (for example $R_X = r_{ds}$).`,
      why: md`Current prefers the low-resistance path, and a source or diode node is the lowest-resistance thing around. Lecture 16 example (iii), folded cascode, Problem Set 6(b).` },
    { id: 'r-mirror', cat: 'rule', exWhat: 'i_out/i_in', t: 'A mirror carrying signal', fig: F.mirror(), ex: ex('gm2/gm1', ['gm1', 'gm2']),
      q: md`A small-signal current $i_{in}$ goes into the diode $M_1$. What current does $M_2$ carry, and what is the diode node voltage?`,
      a: md`$$i_{out} = \frac{g_{m2}}{g_{m1}}\,i_{in} = \frac{(W/L)_2}{(W/L)_1}\,i_{in},\qquad v_{node} = \frac{i_{in}}{g_{m1}}$$`,
      why: md`The diode turns current into voltage ($\times 1/g_{m1}$), the mirror device turns it back ($\times g_{m2}$). Same $V_{ov}$ for both, so $g_m \propto W/L$. Direction: the copy flows the same way through $M_2$ as through $M_1$.` },
    { id: 'r-kill', cat: 'rule', t: 'Drawing the incremental circuit',
      q: md`List what each element becomes in the small-signal circuit: $V_{DD}$, a bias $V_B$, a DC current source, a huge capacitor, a MOSFET.`,
      a: md`$V_{DD}$, $V_B$: incremental ground. DC current source: open. Huge capacitor: short. MOSFET: $g_mv_{gs}$ from drain to source with $r_{ds}$ across, for NMOS **and** PMOS.`,
      why: md`Only *changes* matter. Anything that holds a voltage still is ground; anything that holds a current still is gone.` },

    // ---------------------------------------------------------------- DC and sizing
    { id: 'd-gm', cat: 'dc', t: 'Three forms of $g_m$',
      q: md`Write $g_m$ three ways.`,
      a: md`$$g_m = \frac{2I_D}{V_{ov}} = \mu C_{ox}\frac{W}{L}V_{ov} = \sqrt{2\mu C_{ox}\frac{W}{L}I_D}$$`,
      why: md`Only the first is on the formula sheet. Use the one whose inputs you have. Course numbers: $I_D = 1\,\text{mA}$, $V_{ov} = 0.2\,\text{V}$ gives $g_m = 10\,\text{mS}$, $1/g_m = 100\,\Omega$.` },
    { id: 'd-stack', cat: 'dc', t: 'Same current, different sizes',
      q: md`Two NMOS carry the same current. One is $4\times$ wider. Compare $V_{ov}$ and $g_m$.`,
      a: md`$$V_{ov}\propto\frac{1}{\sqrt{W/L}}\ (\text{half}),\qquad g_m \propto\sqrt{W/L}\ (\text{double})$$`,
      why: md`$I = \tfrac12\mu C_{ox}\tfrac{W}{L}V_{ov}^2$ fixed. This is how you get gain ratios like $\sqrt{(W/L)_1/(W/L)_2}$ and stack voltages without a calculator.` },
    { id: 'd-mirror', cat: 'dc', t: 'Same $V_{GS}$ (a mirror)',
      q: md`Two devices share gate and source voltages. How do their currents compare?`,
      a: md`$$\frac{I_2}{I_1} = \frac{(W/L)_2}{(W/L)_1}$$
as long as both are saturated.`,
      why: md`Same $V_{GS}$ means same $V_{ov}$, and current is linear in $W/L$. Then KCL at the output node decides what any resistor carries (Practice 2 #1: $I_2 = I_1 - I_{M4}$).` },
    { id: 'd-sat', cat: 'dc', t: 'Saturation in one line',
      q: md`Saturation conditions written with node voltages only?`,
      a: md`NMOS: $V_D \ge V_G - V_T$. PMOS: $V_D \le V_G + |V_T|$. "Edge of saturation": equality.`,
      why: md`Subtract $V_S$ from both sides of $V_{DS}\ge V_{GS} - V_T$ and the source cancels. A diode-connected device ($V_D = V_G$) is always saturated.` },
    { id: 'd-pmos', cat: 'dc', t: 'PMOS sizing',
      q: md`An NMOS and a PMOS carry the same current at the same overdrive. Compare their $W/L$ (course parameters).`,
      a: md`$$\left(\tfrac{W}{L}\right)_p = 2\left(\tfrac{W}{L}\right)_n$$`,
      why: md`$\mu_pC_{ox} = 50\,\mu\text{A/V}^2$ is half of $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$. Then the two have equal $g_m$ too (same $I$, same $V_{ov}$).` },
  ];

  // ---------------------------------------------------------------- the widget
  const KEY = 'ece342.cards.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };
  const KNOWN = 2;
  const figHtml = (c) => (c.fig ? `<figure class="fig">${Schem.render(c.fig, { maxW: 340 })}</figure>` : '');

  function init(el) {
    const st = Object.assign({ box: {}, cats: Object.keys(CATS) }, load());
    const R = Engine.rich, M = Engine.renderMath;
    let queue = [], cur = null, shown = false, roundTotal = 0;
    const inDeck = () => CARDS.filter((c) => st.cats.includes(c.cat));
    const box = (c) => st.box[c.id] || 0;

    el.innerHTML = `
      <div class="fc">
        <div class="fc-chips">${Object.entries(CATS).map(([k, v]) => `<button type="button" class="fc-chip" data-cat="${k}">${v} <span>${CARDS.filter((c) => c.cat === k).length}</span></button>`).join('')}</div>
        <div class="fc-stats"><div class="fc-bar"><span class="k"></span><span class="l"></span></div><p class="fc-count"></p></div>
        <div class="fc-stage"></div>
        <p class="fc-foot"><button type="button" class="btn subtle fc-all">Study all cards again</button><button type="button" class="btn subtle fc-reset">Reset the deck</button><span class="fc-keys">Keys: Space shows the answer, ← missed, → got it</span></p>
      </div>`;
    const stage = el.querySelector('.fc-stage');

    function stats() {
      const d = inDeck();
      const k = d.filter((c) => box(c) >= KNOWN).length, l = d.filter((c) => box(c) > 0 && box(c) < KNOWN).length;
      el.querySelector('.fc-bar .k').style.width = `${(100 * k) / Math.max(d.length, 1)}%`;
      el.querySelector('.fc-bar .l').style.width = `${(100 * l) / Math.max(d.length, 1)}%`;
      el.querySelector('.fc-count').innerHTML = `<b>${k}</b> known · <b>${l}</b> learning · <b>${d.length - k - l}</b> new <span class="fc-dim">(of ${d.length} cards in the selected piles)</span>`;
      el.querySelectorAll('.fc-chip').forEach((b) => b.classList.toggle('on', st.cats.includes(b.dataset.cat)));
    }
    function newRound(all) {
      const d = inDeck();
      const pool = all ? d : d.filter((c) => box(c) < KNOWN);
      // the least-known first, shuffled within each box
      queue = [0, 1, 2].flatMap((b) => U.shuffle(pool.filter((c) => Math.min(box(c), 2) === b)));
      roundTotal = queue.length;
      next();
    }
    function next() {
      stats();
      cur = queue.shift();
      shown = false;
      if (!cur) {
        const d = inDeck(), k = d.filter((c) => box(c) >= KNOWN).length;
        stage.innerHTML = `<div class="fc-card fc-donecard"><h3>${k === d.length ? 'Every card in these piles is known.' : 'Round done.'}</h3><p>${k} of ${d.length} known. ${k === d.length ? 'Shuffle the whole deck once more, or switch piles above. Tomorrow, run it again from the top: recall fades overnight.' : 'Start the next round: it deals only the cards you have not yet got twice in a row.'}</p><p><button type="button" class="btn primary fc-next">${k === d.length ? 'Shuffle all again' : 'Next round'}</button></p></div>`;
        stage.querySelector('.fc-next').addEventListener('click', () => newRound(k === d.length));
        return;
      }
      const c = cur;
      const n = roundTotal - queue.length;
      stage.innerHTML = `
        <div class="fc-card">
          <p class="fc-meta"><span>${CATS[c.cat]}</span><span>${n} / ${roundTotal}${box(c) ? ` · ${box(c) >= KNOWN ? 'known' : 'got it once'}` : ''}</span></p>
          <h3 class="fc-t">${Engine.mdToHtml(c.t).replace(/^<p>|<\/p>$/g, '')}</h3>
          ${figHtml(c)}
          <div class="fc-q">${R(c.q)}</div>
          ${c.ex ? `<div class="fc-try"><input class="ans" type="text" autocomplete="off" spellcheck="false" placeholder="Optional: type ${c.exWhat || (c.cat === 'stage' ? 'A_v' : 'R')} first, e.g. rds + RS + gm*rds*RS" aria-label="Type your answer"><button type="button" class="btn fc-chk">Check</button><span class="fc-res" aria-live="polite"></span></div>` : ''}
          <p class="fc-actions"><button type="button" class="btn primary fc-flip">Show answer</button></p>
          <div class="fc-back" hidden>
            <div class="fc-a">${R(c.a)}</div>
            <div class="fc-why"><span>Why</span>${R(c.why)}</div>
            <p class="fc-grade"><button type="button" class="btn fc-miss">← Missed it</button><button type="button" class="btn primary fc-got">Got it →</button></p>
          </div>
        </div>`;
      const back = stage.querySelector('.fc-back');
      stage.querySelector('.fc-flip').addEventListener('click', flip);
      stage.querySelector('.fc-miss').addEventListener('click', () => grade(false));
      stage.querySelector('.fc-got').addEventListener('click', () => grade(true));
      const chk = stage.querySelector('.fc-chk');
      if (chk) {
        const inp = stage.querySelector('.fc-try input');
        const run = () => {
          const v = inp.value.trim();
          const res = stage.querySelector('.fc-res');
          if (!v) { res.textContent = ''; return; }
          const r = Expr.checkExpr(v, c.ex.expr, c.ex);
          res.className = `fc-res ${r.ok ? 'good' : 'bad'}`;
          res.textContent = r.ok ? 'Equivalent. ✓' : (r.err || r.msg || 'Not equivalent.');
        };
        chk.addEventListener('click', run);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } e.stopPropagation(); });
      }
      M(stage);
      void back;
    }
    function flip() {
      if (!cur || shown) return;
      shown = true;
      const back = stage.querySelector('.fc-back');
      back.hidden = false;
      stage.querySelector('.fc-actions').hidden = true;
      M(back);
    }
    function grade(ok) {
      if (!cur || !shown) return;
      if (ok) st.box[cur.id] = Math.min(box(cur) + 1, KNOWN);
      else { st.box[cur.id] = 0; queue.splice(Math.min(3, queue.length), 0, cur); roundTotal++; }
      save(st);
      next();
    }
    el.querySelectorAll('.fc-chip').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.cat;
      st.cats = st.cats.includes(k) ? st.cats.filter((x) => x !== k) : st.cats.concat(k);
      if (!st.cats.length) st.cats = [k];
      save(st);
      newRound(false);
    }));
    el.querySelector('.fc-all').addEventListener('click', () => newRound(true));
    el.querySelector('.fc-reset').addEventListener('click', () => { st.box = {}; save(st); newRound(false); });
    const onKey = (e) => {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') { if (cur && !shown) { e.preventDefault(); flip(); } }
      else if (e.key === 'ArrowLeft') grade(false);
      else if (e.key === 'ArrowRight') grade(true);
    };
    document.addEventListener('keydown', onKey);
    newRound(false);
  }

  // all cards on one page, answers showing: the reading version of the deck
  const listMd = Object.entries(CATS).map(([k, v]) => `## ${v}\n\n` + CARDS.filter((c) => c.cat === k).map((c) => `[[fig:${c.id}]]\n\n**${c.t}.** ${c.q}\n\n${c.a}\n\n*Why:* ${c.why}`).join('\n\n---\n\n')).join('\n\n');
  const listFigs = {};
  CARDS.forEach((c) => { listFigs[c.id] = c.fig ? { fig: c.fig, opts: { maxW: 340 } } : null; });

  E2.lesson('e2-cardsu', {
    id: 'e2-cards', title: 'Flashcards: the canonical stages', kind: 'review', sub: `${CARDS.length} cards, spaced repetition`,
    steps: [
      C.R(md`
        The formula sheet for Exam 2 stops at $g_m = 2I_D/V_{ov}$. Every impedance and gain result below has to come from memory, and every practice exam is built out of them. Look at the circuit, say the answer out loud (or type it), then show the answer and grade yourself honestly.

        **How the deck works.** "Missed it" puts the card back a few cards later in this round. "Got it" twice in a row, across rounds, moves it to *known*. Each round deals only what is not known yet, least-known first. Tap the piles to study one topic at a time. Your progress stays in this browser.
      `),
      C.W('<div class="fc-host"></div>', (el) => init(el.querySelector('.fc-host'))),
      C.R(md`Prefer to read them all at once? [Every card with its answer](#/l/e2-cardlist).`),
    ],
  });
  E2.lesson('e2-cardsu', {
    id: 'e2-cardlist', title: 'Every card, answers showing', kind: 'read', sub: 'The deck as one page, for reading',
    steps: [{ t: 'read', md: listMd, figs: listFigs }],
  });

  window.E2CARDS = { CARDS, CATS };
})();

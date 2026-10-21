/* Derivations module: every Exam 2 result from the small-signal model, every algebra step written out, no
   abbreviations for stage names. Each lesson: the circuit, its model, the numbered derivation, checks, one problem. */
(function () {
  'use strict';
  const { R, P } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2der', l);
  const ex = (e, n, lbl) => E2.ex(e, n, lbl, { exact: true });

  // one transistor's small-signal model (as in the lectures): gate on the left with +v_gs− to the source node,
  // the dependent current source g_m v_gs from drain (top) to source (bottom), r_ds across it.
  function M(o) {
    const gx = 1.2, e = [];
    e.push(['term', [gx, 0.4], { n: 'G', side: 'a' }], ['term', [gx, 1.4]], ['w', [gx, 1.4], [gx, 2], [3, 2]], ['vlab', [gx + 0.25, 0.55], [gx + 0.25, 1.25], { n: 'v_{gs}' }]);
    if (o.g === 'vin') e.push(['w', [gx, 0.4], [0, 0.4], [0, 1]], ['Vac', [0, 1], [0, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2]]);
    if (o.g === 'gnd') e.push(['w', [gx, 0.4], [0.4, 0.4], [0.4, 0.7]], ['gnd', [0.4, 0.7]]);
    if (o.g === 'd') e.push(['w', [gx, 0.4], [gx, 0], [3, 0]]);
    if (o.g === 'K') e.push(['w', [gx, 0.4], [0.4, 0.4]], ['term', [0.4, 0.4], { n: 'v_g = K\\,v_t', side: 'l' }]);
    e.push(['G', [3, 0], [3, 2], { n: 'g_mv_{gs}' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_{ds}' }], ['w', [3, 2], [4.4, 2]]);
    e.push(['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['txt', [3.15, 2.3], '$S$', { a: 'l' }]);
    const test = (y) => [['w', [4.4, y], [5.8, y]], ['V', [5.8, y], [5.8, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [5.8, y + 1.2]], ['iarr', [5.15, y], 'l', { n: 'i_t' }]];
    if (o.d === 'gnd') e.push(['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]]);
    if (o.d === 'RD' || o.d === 'RDout') e.push(['R', [3, -1.4], [3, 0], { n: 'R_D' }], ['gndu', [3, -1.4]]);
    if (o.d === 'RDout') e.push(['w', [4.4, 0], [5.4, 0]], ['term', [5.4, 0], { n: 'v_{out}' }]);
    if (o.d === 'short') e.push(['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]], ['iarr', [3, -0.35], 'd', { n: 'i_{out}', side: 'r', off: [14, 0] }]);
    if (o.d === 'test') e.push(...test(0));
    if (o.s === 'gnd') e.push(['w', [3, 2], [3, 2.5]], ['gnd', [3, 2.5]]);
    if (o.s === 'RS') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['gnd', [3, 3.4]]);
    if (o.s === 'RSvin') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['Vac', [3, 3.4], [3, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [3, 4.4]]);
    if (o.s === 'out') e.push(['R', [3, 2], [3, 3.4], { n: 'R_L' }], ['gnd', [3, 3.4]], ['w', [4.4, 2], [5.4, 2]], ['term', [5.4, 2], { n: 'v_{out}' }]);
    if (o.s === 'test') e.push(...test(2));
    return e;
  }

  // ================================================================ 0. how every derivation goes
  L({
    id: 'e2-d0', title: 'How every derivation goes (read once)',
    steps: [
      R(md`
        Every result in this module is found the same way. Once the recipe is familiar, each lesson is just the recipe applied to a new picture.

        **The model.** For small changes, a transistor in saturation is replaced by:
        - a **dependent current source** of value $g_m v_{gs}$, with its arrow pointing **from drain to source**;
        - a **resistor** $r_{ds}$ connected from drain to source, in parallel with it;
        - **nothing** at the gate: no current ever flows into the gate.

        Here $v_{gs} = v_g - v_s$ is the small-signal voltage from gate to source. The total current flowing **from drain to source inside the transistor** is therefore
        $$i_{ds} = g_mv_{gs} + \frac{v_d - v_s}{r_{ds}}$$
        The same model is used for NMOS and PMOS.

        **The recipe.**
        1. **Kill the sources that do not move.** The supply $V_{DD}$, every bias voltage, and every gate tied to a fixed voltage become ground (0 V for small signals). A constant (DC) current source becomes an open circuit.
        2. **Replace each transistor by the model.**
        3. **If you want a resistance:** connect a test voltage $v_t$ to the node and call the current it pushes in $i_t$. The resistance is $R = v_t/i_t$. **If you want a gain:** keep the input $v_{in}$ and find $v_{out}$.
        4. **Write the node voltages** you know ($v_g$, $v_s$, $v_d$) and form $v_{gs} = v_g - v_s$.
        5. **Kirchhoff's current law** at each node whose voltage is unknown: the currents flowing into a node add up to zero.
        6. **Solve.** Then check the answer in limits you already know (for example $r_{ds}\to\infty$).

        Two bits of algebra appear again and again:
        - Two resistors in parallel: $a\parallel b = \dfrac{ab}{a + b}$, and $\dfrac{1}{1/a + 1/b} = a\parallel b$.
        - "$g_mr_{ds}\gg1$" means $g_mr_{ds}$ is much bigger than 1 (around 100), so $1 + g_mr_{ds}\approx g_mr_{ds}$, and any term $g_mr_{ds}$ times smaller than another can be dropped.
      `, M({ g: 'gnd', s: 'gnd', d: 'test' })),
    ],
  });

  // ================================================================ resistances
  L({
    id: 'e2-d1', title: 'Resistance looking into the drain',
    steps: [
      R(md`**Question.** The gate is held at a fixed voltage and the source is grounded. What resistance do you see looking into the drain?`, F.drain()),
      R(md`**Small-signal model.** The gate is a fixed voltage, so for small signals it is ground. The source is ground. Put a test voltage $v_t$ on the drain.`, M({ g: 'gnd', s: 'gnd', d: 'test' }), md`
      **Step 1: node voltages.** $v_g = 0$, $v_s = 0$, $v_d = v_t$.

      **Step 2: the controlling voltage.** $v_{gs} = v_g - v_s = 0 - 0 = 0$.

      **Step 3: the dependent source.** Its current is $g_mv_{gs} = g_m\cdot0 = 0$. A current source that carries zero current is an open circuit: it disappears.

      **Step 4: Kirchhoff's current law at the drain.** The current from the test source, $i_t$, can only go through $r_{ds}$ to ground:
      $$i_t = \frac{v_t - 0}{r_{ds}} = \frac{v_t}{r_{ds}}$$

      **Step 5: the resistance.**
      $$R_D = \frac{v_t}{i_t} = r_{ds}$$

      **What it means.** When nothing moves the gate-to-source voltage, the transistor is just its leak resistor. This is why a transistor with a fixed gate is used as a current source: it lets almost the same current through whatever the drain voltage does, and $r_{ds}$ is large.`),
      P({ id: 'e2d1-p', title: 'Your turn', q: md`Same transistor, but now the gate is tied to the source (not to ground) and both are grounded. What resistance looks into the drain?`, parts: [ex('rds', ['rds'], 'R_D')], hints: [md`What is $v_{gs}$ when gate and source are the same node?`], sol: md`Gate and source are the same node, so $v_{gs} = 0$ again, the dependent source is dead, and $R_D = r_{ds}$. (This is the small-signal picture only; at DC the device must still be biased on by something else.)` }),
    ],
  });

  L({
    id: 'e2-d2', title: 'Resistance looking into the source',
    steps: [
      R(md`**Question.** The gate and the drain are held at fixed voltages. What resistance do you see looking into the source?`, F.source()),
      R(md`**Small-signal model.** Gate and drain both become ground. The test voltage $v_t$ goes on the source.`, M({ g: 'gnd', d: 'gnd', s: 'test' }), md`
      **Step 1: node voltages.** $v_g = 0$, $v_d = 0$, $v_s = v_t$.

      **Step 2: the controlling voltage.** $v_{gs} = v_g - v_s = 0 - v_t = -v_t$. This time the dependent source is **not** dead.

      **Step 3: the current flowing from drain to source inside the transistor.**
      $$i_{ds} = g_mv_{gs} + \frac{v_d - v_s}{r_{ds}} = g_m(-v_t) + \frac{0 - v_t}{r_{ds}} = -\Big(g_m + \frac{1}{r_{ds}}\Big)v_t$$
      It is negative: current actually flows **up**, from the source to the drain.

      **Step 4: Kirchhoff's current law at the source node.** Two currents flow into this node: $i_t$ from the test source, and $i_{ds}$ arriving from the drain through the transistor. They add up to zero:
      $$i_t + i_{ds} = 0\ \Rightarrow\ i_t = -i_{ds} = \Big(g_m + \frac1{r_{ds}}\Big)v_t$$

      **Step 5: the resistance.**
      $$R_S = \frac{v_t}{i_t} = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{g_m}\parallel r_{ds}$$
      (The last step is the parallel rule: $\frac{1}{1/a + 1/b} = a\parallel b$ with $a = 1/g_m$ and $b = r_{ds}$.)

      **Step 6: simplify.** $1/g_m$ (about $100\,\Omega$) is far smaller than $r_{ds}$ (tens of kΩ), and the smaller one wins in parallel: $R_S\approx\dfrac1{g_m}$.

      **What it means.** The test voltage itself sets $v_{gs}$. Raising the source by $v_t$ lowers $v_{gs}$ by $v_t$, the channel carries $g_mv_t$ less current downward, and that is the same as $g_mv_t$ flowing in from the test source. A node where $v$ volts pushes in $g_mv$ amps is a resistor $1/g_m$. Sources are **low-resistance** nodes.`),
      P({ id: 'e2d2-p', title: 'Your turn', q: md`With $g_m = 4\,\text{mS}$ and $r_{ds} = 50\,\text{k}\Omega$, compute the exact resistance looking into the source, and compare it with $1/g_m$.`, parts: [{ lbl: 'R_S', unit: 'Ω', ans: 1 / (4e-3 + 1 / 50e3) }], hints: [md`$R_S = 1/(g_m + 1/r_{ds})$.`], sol: md`$g_m + 1/r_{ds} = 4\,\text{mS} + 0.02\,\text{mS} = 4.02\,\text{mS}$, so $R_S = 248.8\,\Omega$. The approximation $1/g_m = 250\,\Omega$ is off by half a percent.` }),
    ],
  });

  L({
    id: 'e2-d3', title: 'Resistance of a diode-connected transistor',
    steps: [
      R(md`**Question.** The gate is wired to the drain ("diode connection"), the source is grounded. What resistance does the device show?`, F.diode()),
      R(md`**Small-signal model.** The gate wire now goes to the drain node. Test voltage on the drain.`, M({ g: 'd', s: 'gnd', d: 'test' }), md`
      **Step 1: node voltages.** $v_d = v_t$, $v_g = v_d = v_t$ (the gate is the same node), $v_s = 0$.

      **Step 2: the controlling voltage.** $v_{gs} = v_t - 0 = v_t$.

      **Step 3: Kirchhoff's current law at the drain.** The test current $i_t$ leaves through two parallel paths to ground: the dependent source carries $g_mv_{gs} = g_mv_t$, and $r_{ds}$ carries $v_t/r_{ds}$.
      $$i_t = g_mv_t + \frac{v_t}{r_{ds}} = \Big(g_m + \frac{1}{r_{ds}}\Big)v_t$$

      **Step 4: the resistance.**
      $$R_{diode} = \frac{v_t}{i_t} = \frac{1}{g_m}\parallel r_{ds}\approx\frac1{g_m}$$

      **What it means.** A current source whose current is set by the voltage across itself behaves exactly like a resistor. Here that resistor is $1/g_m$, the same as looking into a source. This is how chips make small resistors out of transistors.`),
      P({ id: 'e2d3-p', title: 'Your turn: two diodes stacked', q: md`Two diode-connected NMOS are stacked: the top one's source is the bottom one's drain, the bottom source is grounded. Ignoring $r_{ds}$, what resistance do you see at the top? Use $g_{m1}$ (bottom) and $g_{m2}$ (top).`, parts: [ex('1/gm1 + 1/gm2', ['gm1', 'gm2'], 'R')], hints: [md`The same current flows through both. Each one drops current divided by its $g_m$.`], sol: md`The test current $i_t$ flows through both devices. The bottom one's drain rises by $i_t/g_{m1}$ (its own resistance). The top one adds $i_t/g_{m2}$ across itself. So $v_t = i_t(1/g_{m1} + 1/g_{m2})$: two resistors in series.` }),
    ],
  });

  L({
    id: 'e2-d4', title: 'Resistance looking into a drain with a resistor under the source',
    steps: [
      R(md`**Question.** The gate is held, and a resistor $R_S$ sits between the source and ground (this is "source degeneration"). What resistance do you see looking into the drain? This is the most-used result on the exam.`, F.drainDeg()),
      R(md`**Small-signal model.** Gate to ground, $R_S$ from the source to ground, test voltage on the drain.`, M({ g: 'gnd', s: 'RS', d: 'test' }), md`
      **Step 1: where does $i_t$ go?** It enters the drain. It cannot leave through the gate. So all of it flows from the drain to the source (through the dependent source and $r_{ds}$ together), and then down through $R_S$.

      **Step 2: node voltages.** $v_g = 0$, $v_d = v_t$, and the source sits on top of $R_S$ carrying $i_t$:
      $$v_s = i_tR_S$$

      **Step 3: the controlling voltage.** $v_{gs} = 0 - i_tR_S = -i_tR_S$.

      **Step 4: the current through the transistor** (drain to source) equals $i_t$:
      $$i_t = g_mv_{gs} + \frac{v_d - v_s}{r_{ds}} = g_m(-i_tR_S) + \frac{v_t - i_tR_S}{r_{ds}}$$

      **Step 5: clear the fraction** (multiply every term by $r_{ds}$):
      $$i_tr_{ds} = -g_mr_{ds}R_S\,i_t + v_t - R_S\,i_t$$

      **Step 6: put every $i_t$ term on the left:**
      $$i_tr_{ds} + g_mr_{ds}R_S\,i_t + R_S\,i_t = v_t$$

      **Step 7: factor out $i_t$:**
      $$i_t\,(r_{ds} + R_S + g_mr_{ds}R_S) = v_t$$

      **Step 8: the resistance.**
      $$R_{DN} = \frac{v_t}{i_t} = r_{ds} + R_S + g_mr_{ds}R_S$$

      **Step 9: simplify.** Group the first and third terms: $r_{ds}(1 + g_mR_S) + R_S$. The last $R_S$ is $g_mr_{ds}$ times smaller than $g_mr_{ds}R_S$, so drop it:
      $$R_{DN}\approx r_{ds}(1 + g_mR_S)$$

      **Checks.** $R_S = 0$ gives $r_{ds}$, the plain drain from the first lesson. ✓ If the dependent source did not exist ($g_m = 0$) you would get $r_{ds} + R_S$, two resistors in series. ✓

      **What it means.** The extra term $g_mr_{ds}R_S$ is the transistor fighting back: more current lifts the source, which lowers $v_{gs}$, which shuts the channel. A resistor under the source looks $g_mr_{ds}$ times bigger from the drain. The course calls this the **impedance scaler**.`),
      P({ id: 'e2d4-p', title: 'Your turn', q: md`$g_m = 2\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $R_S = 1\,\text{k}\Omega$. Find $R_{DN}$ exactly.`, parts: [{ lbl: 'R_{DN}', unit: 'kΩ', ans: 50 + 1 + 100 }], hints: [md`$g_mr_{ds}R_S = 2\,\text{mS}\times50\,\text{k}\Omega\times1\,\text{k}\Omega$.`], sol: md`$r_{ds} + R_S + g_mr_{ds}R_S = 50 + 1 + (0.002)(50{,}000)(1)\,\text{k}\Omega = 50 + 1 + 100 = 151\,\text{k}\Omega$. A 1 kΩ resistor turned the drain from 50 kΩ into 151 kΩ.` }),
    ],
  });

  L({
    id: 'e2-d5', title: 'Resistance looking into the source with a resistor on the drain',
    steps: [
      R(md`**Question.** The gate is held, and $R_D$ sits between the drain and the supply (which is ground for small signals). What resistance do you see looking into the source? This is the input resistance of the common-gate amplifier.`, F.sourceRD()),
      R(md`**Small-signal model.** Gate to ground, $R_D$ from the drain to ground, test voltage on the source.`, M({ g: 'gnd', d: 'RD', s: 'test' }), md`
      **Step 1: where does $i_t$ go?** It enters the source, flows up through the transistor to the drain, and down through $R_D$ to ground. So the current through $R_D$ is $i_t$ and
      $$v_d = i_tR_D$$

      **Step 2: node voltages.** $v_g = 0$, $v_s = v_t$, $v_d = i_tR_D$.

      **Step 3: the controlling voltage.** $v_{gs} = 0 - v_t = -v_t$.

      **Step 4: the current through the transistor from drain to source.** The real current flows up (source to drain) with size $i_t$, so the drain-to-source current is $-i_t$:
      $$-i_t = g_m(-v_t) + \frac{v_d - v_s}{r_{ds}} = -g_mv_t + \frac{i_tR_D - v_t}{r_{ds}}$$

      **Step 5: multiply every term by $r_{ds}$:**
      $$-i_tr_{ds} = -g_mr_{ds}v_t + i_tR_D - v_t$$

      **Step 6: put $v_t$ terms on the left and $i_t$ terms on the right:**
      $$g_mr_{ds}v_t + v_t = i_tR_D + i_tr_{ds}$$

      **Step 7: factor:**
      $$v_t\,(1 + g_mr_{ds}) = i_t\,(r_{ds} + R_D)$$

      **Step 8: the resistance.**
      $$R_S = \frac{v_t}{i_t} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}$$

      **Step 9: simplify** by splitting the fraction and using $1 + g_mr_{ds}\approx g_mr_{ds}$:
      $$R_S = \frac{r_{ds}}{1 + g_mr_{ds}} + \frac{R_D}{1 + g_mr_{ds}}\approx\frac1{g_m} + \frac{R_D}{g_mr_{ds}}$$

      **Checks.** $R_D = 0$: $\frac{r_{ds}}{1 + g_mr_{ds}} = \frac{1}{g_m + 1/r_{ds}} = \frac1{g_m}\parallel r_{ds}$, the previous lesson. ✓ $R_D\to\infty$ (an ideal current source on the drain): $R_S\to\infty$. The current has nowhere to go, so the source cannot take any.

      **What it means.** Seen from the source, a drain resistance is **divided** by $g_mr_{ds}$, the mirror image of the previous lesson.`),
      P({ id: 'e2d5-p', title: 'Your turn', q: md`Find the source resistance when the drain load equals $r_{ds}$ (another transistor's output resistance, say). Exact form, in terms of $g_m$ and $r_{ds}$.`, parts: [ex('2*rds/(1 + gm*rds)', ['gm', 'rds'], 'R_S')], hints: [md`Put $R_D = r_{ds}$ into $\frac{r_{ds} + R_D}{1 + g_mr_{ds}}$.`], sol: md`$\dfrac{2r_{ds}}{1 + g_mr_{ds}}\approx\dfrac{2}{g_m}$: twice the usual $1/g_m$.` }),
    ],
  });

  L({
    id: 'e2-d6', title: 'Output resistance of a cascode (two stacked transistors)',
    steps: [
      R(md`**Question.** Two NMOS are stacked: $M_1$ at the bottom (source grounded), $M_2$ on top (its source on $M_1$'s drain). Both gates are held. What resistance do you see looking into $M_2$'s drain?`, F.cascodeR()),
      R(md`
      **Step 1: model the bottom transistor $M_1$.** Its gate is held (ground) and its source is grounded, so $v_{gs1} = 0$. Its dependent source carries $g_{m1}\cdot0 = 0$ and disappears. What is left of $M_1$ is only its resistor $r_{ds1}$, from the middle node to ground. (This is the "looking into the drain" lesson.)

      **Step 2: redraw.** Now $M_2$ has a resistor $r_{ds1}$ between its source and ground, and its gate is held. That is exactly the "drain with a resistor under the source" lesson, with $R_S$ replaced by $r_{ds1}$.

      **Step 3: copy that result** (every algebra step is there), substituting $r_{ds}\to r_{ds2}$, $g_m\to g_{m2}$, $R_S\to r_{ds1}$:
      $$R_{out} = r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}$$

      **Step 4: simplify.** $g_{m2}r_{ds2}r_{ds1}$ is $g_{m2}r_{ds2}$ (about 100) times bigger than either of the other two terms:
      $$R_{out}\approx g_{m2}r_{ds2}\,r_{ds1}$$

      **What it means.** Stacking a second transistor multiplied the output resistance by about 100. Big output resistance is what makes big gain possible, which is the whole reason the cascode exists.
      `, F.drainDeg('r_{ds1}')),
      P({ id: 'e2d6-p', title: 'Your turn: three stacked', q: md`Stack a third identical transistor (all with $g_m$, $r_{ds}$, gates held) on top of the cascode. Using $R_{casc} \approx g_mr_{ds}^2$ as the resistance under it, what does the top drain look like (approximately)?`, parts: [ex('gm*rds*(gm*rds*rds)', ['gm', 'rds'], 'R_{out}')], hints: [md`Degenerated drain again, with $R_S = R_{casc}$: $\approx g_mr_{ds}R_S$.`], sol: md`$R_{out}\approx g_mr_{ds}\cdot R_{casc} = g_mr_{ds}\cdot g_mr_{ds}^2 = g_m^2r_{ds}^3$. Each level multiplies by $g_mr_{ds}$.` }),
    ],
  });

  L({
    id: 'e2-d7', title: 'Resistance when the gate moves too (the K rule)',
    steps: [
      R(md`**Question.** Same as the drain with $R_S$, but now the gate is not held: something connects it to the node you are testing, so that when the drain moves by $v_t$, the gate moves by $K\,v_t$ (with $K$ a number between 0 and 1, for example from a resistor divider).`, F.drainK()),
      R(md`**Small-signal model.** As before, plus the gate at $K v_t$.`, M({ g: 'K', s: 'RS', d: 'test' }), md`
      **Step 1: node voltages.** $v_d = v_t$, $v_g = K\,v_t$, and (all of $i_t$ goes through $R_S$) $v_s = i_tR_S$.

      **Step 2: the controlling voltage.** $v_{gs} = K\,v_t - i_tR_S$.

      **Step 3: the current through the transistor equals $i_t$:**
      $$i_t = g_m(Kv_t - i_tR_S) + \frac{v_t - i_tR_S}{r_{ds}}$$

      **Step 4: multiply every term by $r_{ds}$:**
      $$i_tr_{ds} = g_mr_{ds}K\,v_t - g_mr_{ds}R_S\,i_t + v_t - R_S\,i_t$$

      **Step 5: $i_t$ terms left, $v_t$ terms right:**
      $$i_t\,(r_{ds} + R_S + g_mr_{ds}R_S) = v_t\,(1 + g_mr_{ds}K)$$

      **Step 6: the resistance.**
      $$R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$$

      **Step 7: simplify** (numerator $\approx r_{ds}(1 + g_mR_S)$, denominator $\approx g_mr_{ds}K$ when $K$ is not tiny):
      $$R_{DN}\approx\frac{r_{ds}(1 + g_mR_S)}{g_mr_{ds}K} = \frac{R_S + 1/g_m}{K}$$

      **Checks.** $K = 0$ (gate held): the degenerated-drain result. ✓ $K = 1$ (gate on the drain): $\approx R_S + 1/g_m$, a diode on top of $R_S$. ✓

      **What it means.** When the test voltage also pushes the gate up, the transistor helps the current along instead of only fighting it, so the resistance drops by roughly $g_mr_{ds}K$. Part (b) of Problem 2 is usually this.`),
      P({ id: 'e2d7-p', title: 'Your turn', q: md`The gate sits in the middle of a divider of two equal resistors from the drain to ground, so $K = \tfrac12$, and $R_S = 0$. Find $R_{DN}$ of the transistor branch alone (exact).`, parts: [ex('rds/(1 + gm*rds/2)', ['gm', 'rds'], 'R_{DN}')], hints: [md`Put $K = 1/2$, $R_S = 0$ into the formula.`], sol: md`$R_{DN} = \dfrac{r_{ds}}{1 + g_mr_{ds}/2} = r_{ds}\parallel\dfrac{2}{g_m}\approx\dfrac{2}{g_m}$.` }),
    ],
  });

  // ================================================================ amplifiers
  L({
    id: 'e2-d8', title: 'Gain of the common-source amplifier',
    steps: [
      R(md`**Question.** Input on the gate, source grounded, resistor $R_D$ from the drain to the supply, output at the drain. Find $A_v = v_{out}/v_{in}$, keeping $r_{ds}$.`, F.cs()),
      R(md`**Small-signal model.** The supply is ground, so $R_D$ goes from the drain to ground. The input source drives the gate.`, M({ g: 'vin', s: 'gnd', d: 'RDout' }), md`
      **Step 1: node voltages.** $v_g = v_{in}$, $v_s = 0$, $v_d = v_{out}$ (unknown).

      **Step 2: the controlling voltage.** $v_{gs} = v_{in} - 0 = v_{in}$.

      **Step 3: Kirchhoff's current law at the drain.** Write every current **leaving** the drain node; they add up to zero.
      - Down through the dependent source: $g_mv_{gs} = g_mv_{in}$.
      - Down through $r_{ds}$: $\dfrac{v_{out} - 0}{r_{ds}}$.
      - Through $R_D$ to ground: $\dfrac{v_{out} - 0}{R_D}$.
      $$g_mv_{in} + \frac{v_{out}}{r_{ds}} + \frac{v_{out}}{R_D} = 0$$

      **Step 4: collect $v_{out}$:**
      $$v_{out}\Big(\frac1{r_{ds}} + \frac1{R_D}\Big) = -g_mv_{in}$$

      **Step 5: divide.** $\dfrac{1}{1/r_{ds} + 1/R_D} = R_D\parallel r_{ds}$:
      $$v_{out} = -g_m(R_D\parallel r_{ds})\,v_{in}\qquad\Longrightarrow\qquad A_v = -g_m(R_D\parallel r_{ds})$$

      **Checks.** $r_{ds}\to\infty$: $A_v = -g_mR_D$, the first amplifier we ever wrote down. ✓ The minus sign: input up, more current down through $R_D$, output down. ✓

      **The same answer in two pieces** (the course's $G_MR_{out}$ method).
      - *Short the output* ($v_{out} = 0$): no current flows in $r_{ds}$ or $R_D$, and the transistor pulls $g_mv_{in}$ out of the short. So $G_M = g_m$.
      - *Turn the input off* ($v_{in} = 0$): then $v_{gs} = 0$, the dependent source is dead, and the output sees $R_D$ and $r_{ds}$ in parallel. So $R_{out} = R_D\parallel r_{ds}$.
      - $A_v = -G_MR_{out} = -g_m(R_D\parallel r_{ds})$. Same result, and this split is what makes big circuits manageable.`),
      P({ id: 'e2d8-p', title: 'Your turn', q: md`Common-source amplifier with $g_m = 2\,\text{mS}$, $R_D = 10\,\text{k}\Omega$, $r_{ds} = 40\,\text{k}\Omega$. Find $A_v$.`, parts: [{ lbl: 'A_v', unit: '', ans: -2e-3 * (10e3 * 40e3 / 50e3) }], hints: [md`$R_D\parallel r_{ds} = \frac{10\times40}{10 + 40}\,\text{k}\Omega$.`], sol: md`$R_D\parallel r_{ds} = 8\,\text{k}\Omega$, so $A_v = -2\,\text{mS}\times8\,\text{k}\Omega = -16$.` }),
    ],
  });

  L({
    id: 'e2-d9', title: 'Gain of the common-source amplifier with a source resistor',
    steps: [
      R(md`**Question.** The common-source amplifier again, with a resistor $R_S$ added between the source and ground ("source degeneration"). Find the gain. First with $r_{ds}\to\infty$, so the idea is clear, then exactly.`, F.csDeg()),
      R(md`**Part 1: $r_{ds}\to\infty$** (the resistor $r_{ds}$ is an open circuit and drops out).`, M({ g: 'vin', s: 'RS', d: 'RDout' }), md`
      **Step 1: the source voltage.** The dependent-source current $g_mv_{gs}$ flows into the source node and down through $R_S$:
      $$v_s = g_mv_{gs}\,R_S$$

      **Step 2: the controlling voltage.** $v_{gs} = v_g - v_s = v_{in} - g_mR_S\,v_{gs}$.

      **Step 3: solve for $v_{gs}$:** move the $v_{gs}$ term left, $v_{gs} + g_mR_Sv_{gs} = v_{in}$, so
      $$v_{gs} = \frac{v_{in}}{1 + g_mR_S}$$
      Only a fraction of the input reaches the transistor; the rest appears across $R_S$.

      **Step 4: the output.** The same current $g_mv_{gs}$ is pulled down through $R_D$:
      $$v_{out} = -g_mv_{gs}R_D = -\frac{g_mR_D}{1 + g_mR_S}\,v_{in}$$

      **Step 5: the gain, and its limit.** Divide top and bottom by $g_m$:
      $$A_v = -\frac{g_mR_D}{1 + g_mR_S} = -\frac{R_D}{1/g_m + R_S}\ \xrightarrow{\ g_mR_S\gg1\ }\ -\frac{R_D}{R_S}$$
      The gain becomes a ratio of two resistors: it no longer depends on $g_m$.`),
      R(md`
      **Part 2: keeping $r_{ds}$**, using the two-piece method.

      **$G_M$: short the output** ($v_{out} = 0$). The current $i$ through the transistor (drain to source) also flows through $R_S$, so $v_s = iR_S$ and $v_{gs} = v_{in} - iR_S$.
      $$i = g_m(v_{in} - iR_S) + \frac{0 - iR_S}{r_{ds}}$$
      Move every $i$ term to the left:
      $$i + g_mR_S\,i + \frac{R_S}{r_{ds}}\,i = g_mv_{in}\quad\Rightarrow\quad i\Big(1 + \big(g_m + \tfrac1{r_{ds}}\big)R_S\Big) = g_mv_{in}$$
      $$G_M = \frac{i}{v_{in}} = \frac{g_m}{1 + (g_m + 1/r_{ds})R_S}\approx\frac{g_m}{1 + g_mR_S}$$

      **$R_{out}$: turn off $v_{in}$.** Looking up you see $R_D$. Looking down you see a drain with $R_S$ under its source and the gate held: the earlier lesson gives $r_{ds} + R_S + g_mr_{ds}R_S$. In parallel:
      $$R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$

      **Gain:** $A_v = -G_MR_{out}$. When $R_D$ is much smaller than the huge degenerated-drain resistance, $R_{out}\approx R_D$ and you recover Part 1.
      `),
      P({ id: 'e2d9-p', title: 'Your turn', q: md`$g_m = 4\,\text{mS}$, $R_D = 10\,\text{k}\Omega$, $R_S = 1\,\text{k}\Omega$, ignore $r_{ds}$. Find $A_v$, and compare with $-R_D/R_S$.`, parts: [{ lbl: 'A_v', unit: '', ans: -40 / 5 }], hints: [md`$g_mR_S = 4$.`], sol: md`$A_v = -\dfrac{g_mR_D}{1 + g_mR_S} = -\dfrac{40}{5} = -8$. The resistor-ratio estimate $-R_D/R_S = -10$ is 25% off because $g_mR_S = 4$ is not much bigger than 1.` }),
    ],
  });

  L({
    id: 'e2-d10', title: 'Gain with a transistor as the load (diode load and current-source load)',
    steps: [
      R(md`
      **Question.** Replace $R_D$ by a transistor $M_2$. There are two ways to wire it, and each one is just a resistance you already derived.

      **The method.** In the common-source result, the gain is $-g_{m1}\times$(everything connected to the output node, in parallel). So find the resistance $M_2$ presents, put it in parallel with $r_{ds1}$, multiply by $-g_{m1}$.
      `),
      R(md`**Case 1: diode-connected load.** $M_2$ has its gate tied to its drain (the output), and its source at the supply (ground for small signals).`, F.csDiode(), md`
      **Step 1: $M_2$'s resistance** (the diode lesson): $\dfrac{1}{g_{m2}}\parallel r_{ds2}$.

      **Step 2: Kirchhoff's current law at the output.** Leaving the node: $M_1$'s dependent source $g_{m1}v_{in}$, $M_1$'s $r_{ds1}$, and $M_2$ (which draws $g_{m2}v_{out} + v_{out}/r_{ds2}$):
      $$g_{m1}v_{in} + \frac{v_{out}}{r_{ds1}} + g_{m2}v_{out} + \frac{v_{out}}{r_{ds2}} = 0$$

      **Step 3: solve:**
      $$A_v = \frac{v_{out}}{v_{in}} = -\frac{g_{m1}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}\approx-\frac{g_{m1}}{g_{m2}}$$

      **Step 4: in terms of sizes.** Both transistors carry the same DC current $I_D$, and $g_m = \sqrt{2\mu C_{ox}\frac{W}{L}I_D}$. Divide the two; $I_D$ cancels:
      $$\frac{g_{m1}}{g_{m2}} = \sqrt{\frac{\mu_1(W/L)_1}{\mu_2(W/L)_2}}$$
      (For an NMOS input and a PMOS load, $\mu_1/\mu_2 = \mu_n/\mu_p = 2$.)`),
      R(md`**Case 2: current-source load.** $M_2$'s gate is held at a fixed voltage, so it is a current source.`, F.csIsrc(), md`
      **Step 1: $M_2$'s resistance** (the "looking into the drain" lesson): $v_{gs2} = 0$, so it is just $r_{ds2}$.

      **Step 2: Kirchhoff's current law at the output:**
      $$g_{m1}v_{in} + \frac{v_{out}}{r_{ds1}} + \frac{v_{out}}{r_{ds2}} = 0\quad\Rightarrow\quad A_v = -g_{m1}(r_{ds1}\parallel r_{ds2})$$

      **What it means.** A fixed-gate transistor looks like a huge resistor, so this is the biggest gain a single stage gives: about half of $g_mr_{ds}$.`),
      P({ id: 'e2d10-p', title: 'Your turn', q: md`NMOS input $W/L = 200$, NMOS diode load $W/L = 50$, same current, ignore $r_{ds}$. Find $A_v$.`, parts: [{ lbl: 'A_v', unit: '', ans: -2 }], hints: [md`Same mobility, so $\frac{g_{m1}}{g_{m2}} = \sqrt{200/50}$.`], sol: md`$A_v = -\sqrt{200/50} = -\sqrt4 = -2$.` }),
    ],
  });

  L({
    id: 'e2-d11', title: 'Gain of the common-gate amplifier',
    steps: [
      R(md`**Question.** The gate is held; the input $v_{in}$ drives the source through a resistor $R_S$; $R_D$ is the drain load; the output is at the drain. Find the gain exactly (with $r_{ds}$), then simplify.`, F.cg()),
      R(md`**Small-signal model.** Gate to ground; $R_S$ and $v_{in}$ in series from the source to ground; $R_D$ from the drain to ground.`, M({ g: 'gnd', s: 'RSvin', d: 'RDout' }), md`
      Unknowns: $v_s$ and $v_{out}$. Call $i$ the current through the transistor from drain to source.

      **Step 1: the controlling voltage.** $v_{gs} = 0 - v_s = -v_s$.

      **Step 2: the transistor equation.**
      $$i = g_m(-v_s) + \frac{v_{out} - v_s}{r_{ds}}$$

      **Step 3: Kirchhoff's current law at the drain.** The only other branch is $R_D$, so the current into the transistor equals minus the current into $R_D$:
      $$i = -\frac{v_{out}}{R_D}$$

      **Step 4: Kirchhoff's current law at the source.** The transistor current $i$ arrives at the source and must leave through $R_S$ toward $v_{in}$:
      $$i = \frac{v_s - v_{in}}{R_S}\quad\Rightarrow\quad v_s = v_{in} + iR_S = v_{in} - \frac{R_S}{R_D}v_{out}$$

      **Step 5: substitute Steps 3 and 4 into Step 2.** Write $g_{ds} = 1/r_{ds}$ to keep it short:
      $$-\frac{v_{out}}{R_D} = -(g_m + g_{ds})\,v_s + g_{ds}\,v_{out}$$
      $$(g_m + g_{ds})\,v_s = \frac{v_{out}}{R_D} + g_{ds}\,v_{out}$$
      $$(g_m + g_{ds})\Big(v_{in} - \frac{R_S}{R_D}v_{out}\Big) = v_{out}\Big(\frac1{R_D} + g_{ds}\Big)$$

      **Step 6: collect $v_{out}$:**
      $$(g_m + g_{ds})\,v_{in} = v_{out}\Big[\frac1{R_D} + g_{ds} + (g_m + g_{ds})\frac{R_S}{R_D}\Big]$$

      **Step 7: multiply both sides by $R_Dr_{ds}$** (remember $g_{ds}r_{ds} = 1$):
      $$(1 + g_mr_{ds})R_D\,v_{in} = v_{out}\big[r_{ds} + R_D + (1 + g_mr_{ds})R_S\big]$$

      **Step 8: the exact gain.**
      $$A_v = \frac{(1 + g_mr_{ds})R_D}{r_{ds} + R_D + R_S + g_mr_{ds}R_S}$$

      **Step 9: simplify** ($r_{ds}\to\infty$: divide top and bottom by $r_{ds}$, then let $1/r_{ds}\to0$):
      $$A_v\to\frac{g_mR_D}{1 + g_mR_S} = +\frac{R_D}{R_S + 1/g_m}$$

      **Checks.** Same size as the degenerated common source, but **positive**: raising the source lowers $v_{gs}$, so less current is pulled from the drain and the output rises. ✓ With $R_S = 0$ and $r_{ds}\to\infty$: $A_v = g_mR_D$. ✓

      **Its input resistance** (looking into the source) is the earlier lesson: $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\dfrac1{g_m}$. **Its output resistance** is $R_D$ in parallel with a drain that has $R_S$ under it: $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$.`),
      P({ id: 'e2d11-p', title: 'Your turn', q: md`Common-gate amplifier: $g_m = 10\,\text{mS}$, $R_S = 100\,\Omega$, $R_D = 2\,\text{k}\Omega$, ignore $r_{ds}$. Find $A_v$.`, parts: [{ lbl: 'A_v', unit: '', ans: 2000 / 200 }], hints: [md`$1/g_m = 100\,\Omega$.`], sol: md`$A_v = \dfrac{R_D}{R_S + 1/g_m} = \dfrac{2000}{100 + 100} = +10$.` }),
    ],
  });

  L({
    id: 'e2-d12', title: 'Gain and output resistance of the source follower (common-drain amplifier)',
    steps: [
      R(md`**Question.** Input on the gate, drain at the supply (ground for small signals), output at the source across a load $R_L$. Find the gain and the output resistance.`, F.cd()),
      R(md`**Small-signal model.**`, M({ g: 'vin', d: 'gnd', s: 'out' }), md`
      **Step 1: node voltages.** $v_g = v_{in}$, $v_d = 0$, $v_s = v_{out}$.

      **Step 2: the controlling voltage.** $v_{gs} = v_{in} - v_{out}$. The output itself reduces the drive.

      **Step 3: the transistor current from drain to source** (it flows into the source node):
      $$i = g_m(v_{in} - v_{out}) + \frac{0 - v_{out}}{r_{ds}}$$

      **Step 4: Kirchhoff's current law at the source.** That current leaves through $R_L$:
      $$g_m(v_{in} - v_{out}) - \frac{v_{out}}{r_{ds}} = \frac{v_{out}}{R_L}$$

      **Step 5: collect $v_{out}$:**
      $$g_mv_{in} = v_{out}\Big(g_m + \frac1{r_{ds}} + \frac1{R_L}\Big)$$

      **Step 6: the gain.** Write $R_L' = R_L\parallel r_{ds}$, so $\frac1{r_{ds}} + \frac1{R_L} = \frac{1}{R_L'}$:
      $$A_v = \frac{g_m}{g_m + 1/R_L'} = \frac{g_mR_L'}{1 + g_mR_L'} = \frac{R_L'}{R_L' + 1/g_m}$$

      **Step 7: read it.** This is a voltage divider: $1/g_m$ on top (the resistance looking into the source), $R_L'$ on the bottom. The gain is always below 1 and close to 1 when $R_L'\gg1/g_m$.

      **Output resistance.** Turn off $v_{in}$ and put a test voltage on the source: $v_{gs} = -v_t$, which is the "looking into the source" lesson, plus $R_L$ in parallel:
      $$R_{out} = R_L\parallel\frac1{g_m}\parallel r_{ds}\approx\frac1{g_m}$$

      **What it means.** No gain, but a low output resistance: the follower can drive a small load that would have wrecked a common-source stage.`),
      P({ id: 'e2d12-p', title: 'Your turn', q: md`Source follower: $g_m = 10\,\text{mS}$, $R_L = 400\,\Omega$, ignore $r_{ds}$. Find $A_v$.`, parts: [{ lbl: 'A_v', unit: '', ans: 0.8 }], hints: [md`$1/g_m = 100\,\Omega$; divider $\frac{400}{400 + 100}$.`], sol: md`$A_v = \dfrac{400}{400 + 100} = 0.8$.` }),
    ],
  });

  L({
    id: 'e2-d13', title: 'Gain of the cascode amplifier',
    steps: [
      R(md`**Question.** $M_1$ is a common-source transistor (input on its gate). $M_2$ sits on top with its gate held. $R_D$ is the load. Find $G_M$, $R_{out}$ and the gain. Call the node between the two transistors $x$.`, F.cascode()),
      R(md`
      **Part 1: $G_M$. Short the output** ($v_{out} = 0$) and find the current pulled out of it.

      **Step 1: $M_1$** (gate $v_{in}$, source 0, drain $v_x$). Its drain-to-source current is
      $$i_1 = g_{m1}v_{in} + \frac{v_x}{r_{ds1}}$$

      **Step 2: $M_2$** (gate 0, source $v_x$, drain 0 because the output is shorted). Its drain-to-source current is
      $$i_2 = g_{m2}(0 - v_x) + \frac{0 - v_x}{r_{ds2}} = -\Big(g_{m2} + \frac1{r_{ds2}}\Big)v_x$$

      **Step 3: Kirchhoff's current law at $x$.** What comes down through $M_2$ must go down through $M_1$: $i_2 = i_1$.
      $$-\Big(g_{m2} + \frac1{r_{ds2}}\Big)v_x = g_{m1}v_{in} + \frac{v_x}{r_{ds1}}$$

      **Step 4: solve for $v_x$:**
      $$v_x = -\frac{g_{m1}v_{in}}{g_{m2} + 1/r_{ds2} + 1/r_{ds1}}$$
      Tiny: the middle node barely moves, because $M_2$'s source is a low-resistance node.

      **Step 5: the current pulled out of the output** is $i_2$:
      $$i_2 = -\Big(g_{m2} + \frac1{r_{ds2}}\Big)v_x = g_{m1}v_{in}\,\frac{g_{m2} + 1/r_{ds2}}{g_{m2} + 1/r_{ds2} + 1/r_{ds1}}$$

      **Step 6: $G_M$.**
      $$G_M = g_{m1}\,\frac{g_{m2} + 1/r_{ds2}}{g_{m2} + 1/r_{ds2} + 1/r_{ds1}} = \frac{g_{m1}r_{ds1}(1 + g_{m2}r_{ds2})}{r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx g_{m1}$$
      (The second form: multiply top and bottom by $r_{ds1}r_{ds2}$.) It is current division: $M_1$'s current splits between $r_{ds1}$ (large) and $M_2$'s source (small), so almost all of it goes up.

      **Part 2: $R_{out}$. Turn off $v_{in}$.** Up: $R_D$. Down: the cascode lesson, $r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}$.
      $$R_{out} = R_D\parallel(r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1})$$

      **Part 3: the gain.**
      $$A_v = -G_MR_{out} = -\frac{g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx-g_{m1}R_D$$
      (The long form is what the course handout gets by three different methods.)
      `),
      P({ id: 'e2d13-p', title: 'Your turn', q: md`Cascode amplifier, gain exactly, keeping every $r_{ds}$.`, parts: [ex('-gm1*RD*rds1*(1 + gm2*rds2)/(RD + rds1 + rds2 + gm2*rds1*rds2)', ['gm1', 'gm2', 'rds1', 'rds2', 'RD'], 'A_v')], hints: [md`Multiply $G_M$ by $R_{out}$ and simplify over a common denominator.`], sol: md`$A_v = -\dfrac{g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}$.` }),
    ],
  });

  L({
    id: 'e2-d14', title: 'Small-signal current through a current mirror',
    steps: [
      R(md`**Question.** A small current $i_{in}$ flows into a diode-connected $M_1$. $M_2$ shares its gate and source. How much small-signal current does $M_2$ carry (with its drain held at a fixed voltage)?`, F.mirror()),
      R(md`
      **Step 1: the diode node voltage.** $M_1$ is diode-connected, so (diode lesson) it is a resistor $\frac1{g_{m1}}\parallel r_{ds1}$. The current $i_{in}$ into it makes
      $$v_g = \frac{i_{in}}{g_{m1} + 1/r_{ds1}}$$

      **Step 2: $M_2$'s controlling voltage.** Same gate, source grounded: $v_{gs2} = v_g$.

      **Step 3: $M_2$'s current** (its drain is held, so $r_{ds2}$ carries nothing):
      $$i_{out} = g_{m2}v_{gs2} = \frac{g_{m2}}{g_{m1} + 1/r_{ds1}}\,i_{in}\approx\frac{g_{m2}}{g_{m1}}\,i_{in}$$

      **Step 4: in terms of sizes.** Both transistors have the same $V_{GS}$, hence the same overdrive $V_{ov}$. With $g_m = \mu C_{ox}\frac{W}{L}V_{ov}$, everything but $W/L$ cancels:
      $$\frac{i_{out}}{i_{in}} = \frac{(W/L)_2}{(W/L)_1}$$
      The same ratio as for the DC currents.

      **What it means.** The diode turns current into voltage, the copy turns voltage back into current. The copied current flows the same way through $M_2$ as $i_{in}$ through $M_1$ (into its drain).
      `),
      P({ id: 'e2d14-p', title: 'Your turn', q: md`$M_1$ is $1X$, $M_2$ is $3X$. A small current of $2\,\mu\text{A}$ enters $M_1$. Ignoring $r_{ds}$, how much does $M_2$ carry?`, parts: [{ lbl: 'i_{out}', unit: 'µA', ans: 6 }], hints: [md`Ratio of sizes.`], sol: md`$i_{out} = \tfrac{3}{1}\times2\,\mu\text{A} = 6\,\mu\text{A}$.` }),
    ],
  });

  L({
    id: 'e2-d15', title: 'Two transistors driving one output (the CMOS inverter amplifier)',
    steps: [
      R(md`**Question.** NMOS $M_1$ (source grounded) and PMOS $M_2$ (source at the supply) have their drains joined at the output, and both gates are driven by $v_{in}$. Find the gain.`, F.inverter()),
      R(md`
      **Step 1: both sources are small-signal ground.** So $v_{gs1} = v_{in}$ and $v_{gs2} = v_{in}$ (the PMOS uses the same model).

      **Step 2: the drain-to-source current of each transistor**, both flowing out of the output node:
      $$i_1 = g_{m1}v_{in} + \frac{v_{out}}{r_{ds1}},\qquad i_2 = g_{m2}v_{in} + \frac{v_{out}}{r_{ds2}}$$

      **Step 3: Kirchhoff's current law at the output.** Nothing else is connected, so $i_1 + i_2 = 0$:
      $$(g_{m1} + g_{m2})\,v_{in} + v_{out}\Big(\frac1{r_{ds1}} + \frac1{r_{ds2}}\Big) = 0$$

      **Step 4: solve:**
      $$A_v = -(g_{m1} + g_{m2})(r_{ds1}\parallel r_{ds2})$$

      **What it means.** Input up: the NMOS pulls more current down, and the PMOS (whose source-to-gate voltage just shrank) pushes less current up. Both lower the output, so their transconductances **add**. In general, when several transistors drive one output, add their currents and keep one output resistance.
      `),
      P({ id: 'e2d15-p', title: 'Your turn', q: md`$g_{m1} = g_{m2} = 2\,\text{mS}$, $r_{ds1} = r_{ds2} = 100\,\text{k}\Omega$. Find $A_v$.`, parts: [{ lbl: 'A_v', unit: '', ans: -4e-3 * 50e3 }], hints: [md`$r_{ds1}\parallel r_{ds2} = 50\,\text{k}\Omega$.`], sol: md`$A_v = -(4\,\text{mS})(50\,\text{k}\Omega) = -200$.` }),
    ],
  });
})();

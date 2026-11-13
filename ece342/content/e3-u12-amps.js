/* Exam 3 · Unit 12 — BJT amplifiers through the G_M R_out method (Lecture 24; Lectures 28–29 "Amplifier gain:
   GmRout"). Common emitter, emitter degeneration, common base, emitter follower, recognizing a stage on sight, the BJT
   cascode, loading and BJT/MOSFET chains, and numeric gains from the DC bias. Every result was checked against an
   independent small-signal nodal solve. Drills: js/gens-e3-amp.js. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E3F, A = window.E3AMP;
  const L = (l) => E3.lesson('e3u12', l);
  const ex = (...a) => E3.ex(...a);
  const M = A.model, S = A.stage;

  // ================================================================== 1. the method, for a BJT
  L({
    id: 'e3-u12-gmrout', title: 'Same method, new device: $G_MR_{out}$ for a BJT', ref: 'Lectures 24, 28–29',
    steps: [
      R(md`
        ### Why this lesson

        Every BJT gain on Exam 3 (the common emitter in Problem 1, the stages inside a bigger circuit in Problem 2) is done with the method you already used on Exam 2: **$A_v = -G_MR_{out}$**. The BJT changes three small things, and once you see them, every BJT stage is a MOSFET stage you already know with $r_\pi$ and $\beta$ added.

        If the method itself feels shaky, redo [the $G_MR_{out}$ method](#/l/e2-u8-gmrout) from Unit 8 first. It is the same two jobs:

        | Job | Do this | Result |
        |---|---|---|
        | $G_M$ | short the output to ground | $G_M = i_{out}/v_{in}$, with $i_{out}$ flowing **from the short into the stage** |
        | $R_{out}$ | turn $v_{in}$ off, test source at the output | $R_{out} = R_{UP}\parallel R_{DN}$ |
        | Gain | multiply | $A_v = -G_MR_{out}$ |
      `),
      R(md`
        ### The BJT, small signal (the hybrid-$\pi$ model)

        A forward-active BJT becomes three elements:
        - $r_\pi$ from **base to emitter**. This is the new one: a MOSFET gate draws no current, a base does.
        - a dependent current source $g_mv_\pi$ from **collector to emitter**, where $v_\pi = v_b - v_e$.
        - $r_o$ from **collector to emitter** (often ignored: "$r_o = \infty$").

        The numbers: $g_m = \dfrac{I_C}{V_T}$ with $V_T = 25\,\text{mV}$, $\;r_\pi = \dfrac{\beta}{g_m}$, $\;r_o = \dfrac{V_A}{I_C}$. Keep one example in your head: **$I_C = 1\,\text{mA}$ gives $g_m = 40\,\text{mS}$, $1/g_m = 25\,\Omega$, and with $\beta = 100$, $r_\pi = 2.5\kO$.**
      `, F.hybridPi()),
      R(md`
        ### The dictionary: MOSFET to BJT

        | MOSFET (Exam 2) | BJT (Exam 3) | What changes |
        |---|---|---|
        | gate, source, drain | base, emitter, collector | names only |
        | $v_{gs}$ | $v_\pi = v_{be}$ | names only |
        | $g_m = 2I_D/V_{ov}$ | $g_m = I_C/V_T$ | BJT $g_m$ is **much** bigger at the same current (40 mS vs a few mS at 1 mA) |
        | $r_{ds}$ | $r_o$ | names only |
        | gate current $= 0$ | base current $i_b = v_\pi/r_\pi$ | **new**: the base is a resistor $r_\pi$, not an open circuit |
        | drain current $=$ source current | $i_e = i_c + i_b = (\beta + 1)i_b$ | **new**: emitter current is $(\beta + 1)/\beta$ of the collector current |
        | common source / gate / drain | common emitter / base / collector | named after the terminal that is **neither input nor output** |
      `),
      R(md`
        ### The three changes, and what each one does to a stage

        **1. The base draws current, so a source resistance at the base matters.** In a MOSFET a resistor in series with the gate does nothing (no current, no drop). In a BJT the base current flows through it: $R_B$ and $r_\pi$ form a **divider**, and only $\dfrac{r_\pi}{r_\pi + R_B}$ of $v_{in}$ reaches $v_\pi$.

        **2. Looking from the base, anything in the emitter is $(\beta + 1)$ times bigger.** The base current is $i_b$, but the emitter carries $(\beta + 1)i_b$. A resistor $R_E$ in the emitter drops $(\beta + 1)i_bR_E$, which to the base looks like a resistor $(\beta + 1)R_E$.

        **3. Looking from the emitter, anything at the base is $(\beta + 1)$ times smaller.** The same fact, read backwards: a resistance $R$ at the base shows up at the emitter as $R/(\beta + 1)$. Since $r_\pi/(\beta + 1)\approx 1/g_m$, the emitter of a BJT with a held base looks like $1/g_m$, just like a MOSFET source.

        !!key The two rules you will use in every BJT problem
        From the **base**: $\;r_\pi + (\beta + 1)\times(\text{emitter resistance})$.
        From the **emitter**: $\;\dfrac{r_\pi + (\text{base resistance})}{\beta + 1}\approx\dfrac1{g_m} + \dfrac{R_B}{\beta}$.
      `),
      Q(md`A 1 k$\Omega$ resistor sits in the emitter of a BJT with $\beta = 99$ and $r_\pi = 2.5\kO$. Roughly what resistance do you see looking into the base?`,
        ['About $102.5\\kO$', 'About $3.5\\kO$', 'About $2.5\\kO$', 'Infinite'], 0,
        [null, 'That adds $R_E$ as it is. The emitter carries $(\\beta + 1)$ times the base current, so from the base $R_E$ looks $(\\beta+1) = 100$ times bigger.', 'That is $r_\\pi$ alone: it ignores the resistor in the emitter.', 'That is a MOSFET gate. A base draws current through $r_\\pi$.'],
        md`$R_{in} = r_\pi + (\beta + 1)R_E = 2.5\kO + 100\kO = 102.5\kO$. This $(\beta + 1)$ multiplication is the most-used BJT fact on the exam.`),
      Q(md`The base sits on $R_B = 10\kO$ to (incremental) ground and the collector is on $V_{CC}$. Looking into the **emitter**, what do you see? $\beta = 100$, $g_m = 40\,\text{mS}$.`,
        ['About $124\\,\\Omega$', 'About $25\\,\\Omega$', 'About $10\\kO$', 'About $1\\,\\text{M}\\Omega$'], 0,
        [null, 'That is $1/g_m$ alone, as if the base were held directly. $R_B$ adds $R_B/(\\beta + 1)\\approx 99\\,\\Omega$.', 'From the emitter, base-side resistance is divided by $(\\beta + 1)$, not seen as it is.', 'That is the multiplication rule used the wrong way round. From the emitter you divide.'],
        md`$\dfrac{r_\pi + R_B}{\beta + 1} = \dfrac{2.5\text{k} + 10\text{k}}{101} = 124\,\Omega\approx\dfrac1{g_m} + \dfrac{R_B}{\beta} = 25 + 100$. Small: an emitter is a low-resistance node, like a MOSFET source, and $R_B$ only adds a hundredth of itself.`),
      P({
        id: 'e3u12-gm-num', title: 'Device numbers in your head',
        q: md`A BJT runs at $I_C = 0.5\,\text{mA}$ with $\beta = 120$ and $V_A = 60\,\text{V}$. Find $g_m$, $1/g_m$, $r_\pi$, $r_o$ and the intrinsic gain $g_mr_o$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 20 }, { lbl: '1/g_m', unit: 'Ω', ans: 50 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 6 }, { lbl: 'r_o', unit: 'kΩ', ans: 120 }, { lbl: 'g_mr_o', unit: '', ans: 2400 }],
        hints: [md`$g_m = I_C/V_T$, $V_T = 25\,\text{mV}$. Half of 1 mA gives half of 40 mS.`, md`$g_mr_o = \dfrac{I_C}{V_T}\cdot\dfrac{V_A}{I_C} = \dfrac{V_A}{V_T}$: the current cancels.`],
        sol: md`
1. $g_m = \dfrac{0.5\,\text{mA}}{25\,\text{mV}} = 20\,\text{mS}$, so $1/g_m = 50\,\Omega$.
2. $r_\pi = \beta/g_m = 120/(20\,\text{mS}) = 6\kO$.
3. $r_o = V_A/I_C = 60\,\text{V}/0.5\,\text{mA} = 120\kO$.
4. $g_mr_o = V_A/V_T = 60/0.025 = 2400$. A BJT's intrinsic gain does not depend on its current, unlike a MOSFET's.`,
      }),
    ],
  });

  // ================================================================== 2. common emitter
  L({
    id: 'e3-u12-ce', title: 'Common emitter', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Why this lesson

        The common emitter is the BJT amplifier: the one with big, inverting gain, and the most likely stage on Problem 1. It is the [common source](#/l/e2-u8-cs) with one new effect, the input divider.

        **Recognize it.** $v_{in}$ reaches the **base**, $v_{out}$ is taken at the **collector**, and the **emitter** goes straight to its rail (ground for an NPN). The emitter is common to input and output: common emitter.
      `, F.ce()),
      R(md`
        ### $G_M$: short the output

        **Step 1.** The base is at $v_{in}$, the emitter at ground: $v_\pi = v_{in}$.

        **Step 2.** With the collector shorted, $R_C$ has 0 V across it and carries nothing (so does $r_o$, whose ends are both at 0 V). Only the dependent source carries current, and it must come from the short:
        $$i_{out} = g_mv_\pi = g_mv_{in}\qquad G_M = g_m$$
      `, M({ b: 'vin', e: 'gnd', c: 'RCshort' })),
      R(md`
        ### $R_{out}$: input off

        $v_{in} = 0$ puts the base on ground, so $v_\pi = 0$ and $g_mv_\pi$ is dead. The test source sees $R_C$ up and $r_o$ down:
        $$R_{out} = R_C\parallel r_o$$
      `, M({ b: 'gnd', e: 'gnd', c: 'RCtest', ro: true })),
      R(md`
        ### The gain, and the input resistance

        $$A_v = -G_MR_{out} = -g_m(R_C\parallel r_o)\approx -g_mR_C$$

        **Input resistance.** The source sees the base: $R_{in} = r_\pi$. (A MOSFET gate gives $\infty$. This is the first visible difference.)

        **Sign in words:** $v_{in}$ up → $v_\pi$ up → more current pulled down through $R_C$ → $v_{out}$ down. Inverting.

        **Size.** $I_C = 1\,\text{mA}$, $R_C = 5\kO$: $A_v = -(40\,\text{mS})(5\kO) = -200$. A MOSFET at the same current might give $-10$: the BJT's $g_m$ is that much bigger.
      `),
      R(md`
        ### With a source resistance $R_B$: the input divider

        Now $v_{in}$ reaches the base through $R_B$. The base current flows through $R_B$ and $r_\pi$ in series (the emitter is grounded), so
        $$v_\pi = v_{in}\,\frac{r_\pi}{r_\pi + R_B}\qquad G_M = g_m\frac{r_\pi}{r_\pi + R_B} = \frac{\beta}{r_\pi + R_B}$$
        and $R_{out}$ is unchanged ($v_{in} = 0$ still means $v_\pi = 0$):
        $$A_v = -g_m(R_C\parallel r_o)\,\frac{r_\pi}{r_\pi + R_B}\approx-\frac{\beta R_C}{r_\pi + R_B}$$

        !!trap The MOSFET habit that costs points
        A resistor in series with a MOSFET gate changes nothing. A resistor in series with a **base** divides the input with $r_\pi$. When $R_B$ is comparable to $r_\pi$ (a few k$\Omega$), it can halve the gain.
      `, M({ b: 'vinRB', e: 'gnd', c: 'RCshort' })),
      Q(md`A common emitter is driven from a source with $R_B = r_\pi$. Compared with driving the base directly, the gain is...`,
        ['Halved', 'Unchanged', 'Doubled', 'Divided by $\\beta$'], 0,
        [null, 'That would be true for a MOSFET gate. The base draws current, so $R_B$ and $r_\\pi$ divide $v_{in}$.', 'A series resistor can only lose signal here.', '$\\beta$ appears in $G_M = \\beta/(r_\\pi + R_B)$, but with $R_B = r_\\pi$ that is exactly $g_m/2$.'],
        md`$v_\pi = v_{in}\,r_\pi/(r_\pi + R_B) = v_{in}/2$: half the drive, half the gain.`),
      Q(md`You double $I_C$ in a common emitter, keeping $R_C$ (the transistor stays forward active). The gain magnitude...`,
        ['Doubles', 'Grows by $\\sqrt2$', 'Stays the same', 'Halves'], 0,
        [null, 'That is the MOSFET at fixed $W/L$: $g_m = \\sqrt{2\\mu C_{ox}(W/L)I_D}$ grows as the square root. A BJT has $g_m = I_C/V_T$, proportional to the current.', '$|A_v| = g_mR_C$ and $g_m$ follows $I_C$.', 'More current means more $g_m$, not less.'],
        md`$g_m = I_C/V_T$ is linear in $I_C$, so $|A_v| = g_mR_C$ doubles. (The catch: $I_CR_C$ doubles too, so the collector sits lower and the transistor gets closer to saturation.)`),
      R(md`
        ### Other loads: a current source, a diode

        Replace $R_C$ by what sits above the collector, exactly as in Unit 8:

        - **Current-source load** (a PNP or a PMOS with its base/gate held): looking into its collector/drain you see its $r_o$ (or $r_{ds}$). $A_v = -g_m(r_o\parallel r_{o,load})$. With an ideal current source the ceiling is the **intrinsic gain** $g_mr_o = V_A/V_T$, for example $100\,\text{V}/25\,\text{mV} = 4000$, at any current.
        - **Diode-connected load** (a PNP with base tied to collector): it looks like $r_\pi/(\beta + 1)\approx 1/g_{m2}$. Then $A_v\approx-g_{m1}/g_{m2} = -I_{C1}/I_{C2}$. With the same current through both, that is about $-1$: a diode load gives almost no gain.
      `),
      P({
        id: 'e3u12-ce-num', title: 'Common emitter with a source resistance and $r_o$',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$, $R_C = 4\kO$, $R_B = 2.5\kO$. Find $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.ceRB(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 20 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 3.846154 }, { lbl: 'A_v', unit: '', ans: -76.92308 }],
        hints: [md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 100\kO$. $R_B = r_\pi$ halves the drive.`, md`With the output shorted, $r_o$ has 0 V across it, so it does not change $G_M$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = \beta/g_m = 2.5\kO$, $r_o = V_A/I_C = 100\kO$.
2. $G_M = g_m\dfrac{r_\pi}{r_\pi + R_B} = 40\,\text{mS}\cdot\dfrac{2.5}{5} = 20\,\text{mS}$.
3. $R_{out} = R_C\parallel r_o = \dfrac{4\times100}{104}\kO = 3.846\kO$.
4. $A_v = -(20\,\text{mS})(3.846\kO) = -76.9$.`,
      }),
      P({
        id: 'e3u12-ce-sym', title: 'Common emitter gain, symbolic',
        q: md`For the circuit above, write $A_v$ with $r_o$ included. Use \`gm\`, \`rpi\`, \`beta\`, \`RC\`, \`ro\`, \`RB\`.`,
        fig: F.ceRB(),
        parts: [ex('-gm*(RC || ro)*rpi/(rpi + RB)', ['gm', 'rpi', 'beta', 'RC', 'ro', 'RB'], 'A_v', { exact: true })],
        hints: [md`$G_M = g_m\,r_\pi/(r_\pi + R_B)$ and $R_{out} = R_C\parallel r_o$.`],
        sol: md`$$A_v = -g_m(R_C\parallel r_o)\frac{r_\pi}{r_\pi + R_B} = -\frac{\beta\,(R_C\parallel r_o)}{r_\pi + R_B}$$ (both forms are the same, since $g_mr_\pi = \beta$).`,
      }),
      G('e3_amp_stage', { need: 4, only: ['ce'] }),
    ],
  });

  // ================================================================== 3. emitter degeneration
  L({
    id: 'e3-u12-cedeg', title: 'Common emitter with emitter degeneration', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Why this lesson

        A resistor in the emitter trades gain for predictability: the gain becomes about $-R_C/R_E$, set by two resistors instead of by $g_m$ (which moves with temperature and current). It is the [degenerated common source](#/l/e2-u8-csdeg) of Unit 8, plus the $(\beta + 1)$ rule.

        **Recognize it.** Input at the **base**, output at the **collector**, and a resistor $R_E$ between the **emitter** and its rail.
      `, F.ceDeg()),
      R(md`
        ### $G_M$: short the output (Lecture 24)

        **Step 1: KVL around the input loop.** From $v_{in}$, down across $r_\pi$ (that is $v_\pi$), then down across $R_E$, which carries the base current **plus** the collector current, $i_{out} + i_{out}/\beta$:
        $$v_{in} = v_\pi + \Big(i_{out} + \frac{i_{out}}{\beta}\Big)R_E$$

        **Step 2:** $i_{out} = g_mv_\pi$, so $v_\pi = i_{out}/g_m$:
        $$v_{in} = i_{out}\Big[\frac1{g_m} + \Big(1 + \frac1\beta\Big)R_E\Big]$$

        **Step 3:**
        $$G_M = \frac{g_m}{1 + \frac{\beta+1}{\beta}g_mR_E}\approx\frac{g_m}{1 + g_mR_E}\quad(\beta\gg1)$$
      `, M({ b: 'vin', e: 'RE', c: 'RCshort' })),
      R(md`
        ### $R_{out}$ and $R_{in}$

        **$R_{out}$.** With $v_{in} = 0$, KVL around the base loop gives $0 = v_\pi + (g_mv_\pi + g_mv_\pi/\beta)R_E$, which forces $v_\pi = 0$. The source is dead and $R_{out} = R_C$ (with $r_o = \infty$). Keeping $r_o$, the collector looks like $r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi$, huge, so $R_{out}\approx R_C$ anyway.

        **$R_{in}$.** Put a test source on the base: $v_t = i_tr_\pi + (\beta + 1)i_tR_E$, so
        $$R_{in} = r_\pi + (\beta + 1)R_E$$
        Lecture 24 in words: **emitter resistance $R_E$ appears $(\beta + 1)$ times larger looking from the base.**
      `, M({ b: 'test', e: 'RE', c: 'RC' })),
      R(md`
        ### The gain, and the shortcut

        $$A_v = -G_MR_{out}\approx-\frac{g_mR_C}{1 + g_mR_E} = -\frac{R_C}{\frac{1}{g_m} + R_E}\ \xrightarrow{\ g_mR_E\gg1\ }\ -\frac{R_C}{R_E}$$

        With a source resistance $R_B$ too, the base loop holds $R_B + r_\pi + (\beta + 1)R_E$:
        $$G_M = \frac{\beta}{R_B + r_\pi + (\beta + 1)R_E}\approx\frac{1}{\frac{R_B}{\beta} + \frac1{g_m} + R_E}$$

        !!key The shortcut: collector resistance over emitter-path resistance
        $$|A_v|\approx\frac{\text{resistance at the collector}}{\text{resistance in the emitter path}} = \frac{R_C}{R_E + \frac1{g_m} + \frac{R_B}{\beta}}$$
        The input voltage drives one current through the whole emitter path (as seen from the emitter: $R_E$, the transistor's own $1/g_m$, and $R_B$ divided by $\beta$). Nearly all of that current comes out of the collector and lands on $R_C$.
        It works for the common emitter and the common base (with a + sign), when $r_o$ is negligible. It does **not** apply to the follower, whose output is the emitter itself.
      `),
      Q(md`$I_C = 1\,\text{mA}$, $R_C = 10\kO$, $R_E = 500\,\Omega$, base driven directly. Without a calculator, the gain is closest to...`,
        ['$-19$', '$-400$', '$-20$', '$-10$'], 0,
        [null, 'That is $-g_mR_C$: it ignores $R_E$.', 'That is $-R_C/R_E$. Close, but the transistor\'s own $1/g_m = 25\\,\\Omega$ adds to $R_E$ in the emitter path, so the gain is a bit smaller.', 'That would be $R_C/(2R_E)$.'],
        md`$-\dfrac{R_C}{1/g_m + R_E} = -\dfrac{10\,000}{25 + 500} = -19.05$. (Exact with $\beta = 100$: $-18.87$.)`),
      P({
        id: 'e3u12-cedeg-num', title: 'Degenerated common emitter, with numbers',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 10\kO$, $R_E = 500\,\Omega$, $r_o = \infty$, base driven directly by $v_{in}$. Find $G_M$ (exact), $A_v$ and $R_{in}$.`,
        fig: F.ceDeg(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 1.886792, accept: [1.904762] }, { lbl: 'A_v', unit: '', ans: -18.86792, accept: [-19.04762] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 53, accept: [52.5] }],
        hints: [md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$. $G_M = \beta/(r_\pi + (\beta + 1)R_E)$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$.
2. $G_M = \dfrac{\beta}{r_\pi + (\beta + 1)R_E} = \dfrac{100}{2.5\text{k} + 50.5\text{k}} = \dfrac{100}{53\kO} = 1.887\,\text{mS}$ (the $\beta\gg1$ form $g_m/(1 + g_mR_E) = 40/21 = 1.905\,\text{mS}$).
3. $A_v = -G_MR_C = -18.87$.
4. $R_{in} = r_\pi + (\beta + 1)R_E = 2.5 + 50.5 = 53\kO$: twenty times the bare $r_\pi$.`,
      }),
      P({
        id: 'e3u12-cedeg-sym', title: 'Degenerated common emitter with a source resistance',
        q: md`The base is driven through $R_B$, the emitter has $R_E$, the collector $R_C$; $r_o = \infty$. Find $A_v$. Use \`gm\`, \`rpi\`, \`beta\`, \`RC\`, \`RE\`, \`RB\` (the $\beta\gg1$ form is accepted).`,
        fig: S({ dev: 'npn', kind: 'ce', RE: true, RB: true }),
        parts: [ex('-beta*RC/(RB + rpi + (beta + 1)*RE)', ['gm', 'rpi', 'beta', 'RC', 'RE', 'RB'], 'A_v')],
        hints: [md`KVL around the base loop: $v_{in} = i_b\big(R_B + r_\pi + (\beta + 1)R_E\big)$, and $i_{out} = \beta i_b$.`],
        sol: md`$$i_b = \frac{v_{in}}{R_B + r_\pi + (\beta + 1)R_E},\quad G_M = \frac{\beta}{R_B + r_\pi + (\beta + 1)R_E},\quad A_v = -\frac{\beta R_C}{R_B + r_\pi + (\beta + 1)R_E}$$
Divide top and bottom by $\beta$: $A_v\approx-\dfrac{R_C}{R_B/\beta + 1/g_m + R_E}$, the shortcut.`,
      }),
      G('e3_amp_stage', { need: 4, only: ['ceRE'] }),
      G('e3_amp_sym', { need: 3, only: ['ce', 'ceRE'] }),
    ],
  });

  // ================================================================== 4. common base
  L({
    id: 'e3-u12-cb', title: 'Common base', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Why this lesson

        The common base takes its input at the emitter. It has the common emitter's gain without the inversion and a very small input resistance: it is a **current buffer**, and it is the top half of every cascode. MOSFET twin: the [common gate](#/l/e2-u8-cg).

        **Recognize it.** The **base** is held (a triangle, a bypass capacitor, a DC source, possibly through $R_B$). $v_{in}$ drives the **emitter** (often through $R_E$). $v_{out}$ is at the **collector**.
      `, F.cb()),
      R(md`
        ### $G_M$: short the output (Lecture 24)

        KVL from ground, up through $v_{in}$ and $R_E$, across $r_\pi$, through $R_B$ back to the held base. The base current is $i_{out}/\beta$, the emitter current $(1 + 1/\beta)i_{out}$, both flowing out of the emitter node toward $v_{in}$ when $v_{in}$ is positive:
        $$0 = \frac{i_{out}}{\beta}(R_B + r_\pi) + i_{out}\Big(1 + \frac1\beta\Big)R_E + v_{in}$$
        $$G_M = \frac{-1}{\frac{R_B + r_\pi}{\beta} + \frac{\beta+1}{\beta}R_E}\approx\frac{-1}{\frac{R_B}{\beta} + \frac1{g_m} + R_E}$$

        **Negative**, as for the common gate: pushing the emitter **up** with the base held makes $v_\pi$ **smaller**, so the stage pulls **less** current.
      `, M({ b: 'gndRB', e: 'REvin', c: 'RCshort' })),
      R(md`
        ### $R_{out}$, $R_{in}$, gain

        - $R_{out} = R_C$ ($v_{in} = 0$ leaves the base loop undriven: $v_\pi = 0$).
        - $R_{in}$, the resistance $v_{in}$ sees: $R_E$ plus the emitter, and from the emitter the base side is divided by $(\beta + 1)$:
        $$R_{in} = R_E + \frac{R_B + r_\pi}{\beta + 1}$$
        Lecture 24: **base resistance appears $(\beta + 1)$ times smaller looking from the emitter.** With $R_E = R_B = 0$ that is $r_\pi/(\beta + 1)\approx 1/g_m = 25\,\Omega$ at 1 mA: tiny.
        - Gain:
        $$A_v = -G_MR_{out} = +\frac{R_C}{\frac{R_B + r_\pi}{\beta} + \frac{\beta + 1}{\beta}R_E}\approx+\frac{R_C}{\frac{R_B}{\beta} + \frac1{g_m} + R_E}$$
        The same size as a common emitter with the same resistors, positive. The shortcut works again: collector resistance over emitter-path resistance.

        !!trap $R_B$ matters here, and it did not for the MOSFET
        In a common gate, a resistor to the gate does nothing. In a common base, $R_B$ shows up in the emitter path as $R_B/\beta$, and with $R_B = 10\kO$, $\beta = 100$, that is $100\,\Omega$, four times $1/g_m$ at 1 mA. Bypassing the base (capacitor to ground) removes it.
      `),
      Q(md`Why is a common base called a current buffer?`,
        ['Its input resistance is tiny (about $1/g_m$) and its output resistance is large, and it passes the input current to the collector almost unchanged.', 'It has a voltage gain of about 1.', 'Its input resistance is huge.', 'It inverts the input current.'], 0,
        [null, 'That is the emitter follower, a voltage buffer.', 'That describes the base of a common emitter or a follower: $(\\beta + 1)$ times the emitter resistance.', 'The current goes through in the same direction: emitter current in, collector current (times $\\alpha\\approx1$) out.'],
        md`A current source driving the emitter sees about $1/g_m$, so it gives up almost none of its current; the transistor hands $\alpha\approx1$ of it to the collector, where it lands on a high resistance.`),
      P({
        id: 'e3u12-cb-num', title: 'Common base: what $R_B$ costs',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 5\kO$, $R_E = 50\,\Omega$ (in series with $v_{in}$), $R_B = 10\kO$ from the base to the bias, $r_o = \infty$. Find $G_M$, $A_v$ and $R_{in}$. Then find $A_v$ again with the base held directly ($R_B = 0$).`,
        fig: S({ dev: 'npn', kind: 'cb', RE: true, RB: true }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -4.987531, accept: [-5] }, { lbl: 'A_v', unit: '', ans: 24.93766, accept: [25] }, { lbl: 'R_{in}', unit: 'Ω', ans: 198.5149, accept: [200] }, { lbl: 'A_v\\ (R_B = 0)', unit: '', ans: 49.75124, accept: [50] }],
        hints: [md`$g_m = 20\,\text{mS}$, $r_\pi = 5\kO$. $G_M = -\beta/\big(R_B + r_\pi + (\beta+1)R_E\big)$.`, md`$R_{in} = R_E + (R_B + r_\pi)/(\beta + 1)$.`],
        sol: md`
1. $g_m = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$, $r_\pi = 100/20\,\text{mS} = 5\kO$.
2. $G_M = -\dfrac{100}{10\text{k} + 5\text{k} + 101(50)} = -\dfrac{100}{20.05\kO} = -4.988\,\text{mS}$ (shortcut: $-1/(100 + 50 + 50) = -5\,\text{mS}$).
3. $A_v = -G_MR_C = +24.9$.
4. $R_{in} = 50 + \dfrac{15\,000}{101} = 198.5\,\Omega$.
5. With $R_B = 0$: $A_v = \dfrac{100\cdot5\text{k}}{5\text{k} + 5.05\text{k}} = 49.75$. The $10\kO$ base resistor **halved** the gain: it added $R_B/\beta = 100\,\Omega$ to an emitter path that was only $100\,\Omega$ to begin with.`,
      }),
      G('e3_amp_stage', { need: 4, only: ['cb'] }),
    ],
  });

  // ================================================================== 5. emitter follower
  L({
    id: 'e3-u12-cc', title: 'Common collector: the emitter follower', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Why this lesson

        The follower has a gain just under 1. Its job is not gain: it **buffers**. It shows a source a large input resistance, and shows a load a small output resistance. Every two-stage BJT problem uses one. MOSFET twin: the [source follower](#/l/e2-u8-cd).

        **Recognize it.** Input at the **base**, output at the **emitter**, and the **collector** straight on its rail (incremental ground). The collector is common.
      `, F.cc(true)),
      R(md`
        ### $G_M$: short the output (the emitter) (Lecture 24)

        With the emitter shorted to ground, $R_E$ carries nothing and the base loop is just $R_B$ and $r_\pi$:
        $$v_\pi = v_{in}\frac{r_\pi}{r_\pi + R_B}$$
        The short now carries the whole **emitter** current out of the transistor, $g_mv_\pi(1 + 1/\beta)$. It flows **out of** the stage into the short, so with our sign convention it is negative:
        $$i_{out} = -g_mv_\pi\Big(1 + \frac1\beta\Big)\qquad G_M = \frac{-1}{(r_\pi + R_B)/(\beta + 1)}$$
      `, M({ b: 'vinRB', e: 'RLout', c: 'gnd' })),
      R(md`
        ### $R_{out}$, gain, $R_{in}$

        **$R_{out}$.** Input off: $R_E$ down, in parallel with the emitter looking back in. From the emitter, the base side ($r_\pi + R_B$) is divided by $(\beta + 1)$:
        $$R_{out} = R_E\parallel\frac{r_\pi + R_B}{\beta + 1}\approx R_E\parallel\Big(\frac1{g_m} + \frac{R_B}{\beta}\Big)$$

        **Gain.**
        $$A_v = -G_MR_{out} = \frac{R_E}{R_E + \frac{r_\pi + R_B}{\beta + 1}} = \frac{(\beta + 1)R_E}{R_B + r_\pi + (\beta + 1)R_E}$$
        A divider: $R_E$ against the small resistance looking into the emitter. Just under 1, positive.

        **$R_{in}$.** From the base: $R_{in} = R_B + r_\pi + (\beta + 1)R_E$. Large.

        With a load $R_L$ on the output, replace $R_E$ by $R_E\parallel R_L$ everywhere. Keeping $r_o$: it sits from the emitter to the (grounded) collector, so also in parallel with $R_E$.
      `, M({ b: 'gndRB', e: 'RLtest', c: 'gnd' })),
      R(md`
        ### Why a buffer helps: both $(\beta+1)$ rules at once

        - **The source sees the load multiplied:** $R_{in}\approx(\beta + 1)R_L$. A $200\,\Omega$ load looks like $20\kO$.
        - **The load sees the source divided:** $R_{out}\approx R_B/(\beta + 1) + 1/g_m$. A $10\kO$ source looks like about $125\,\Omega$.

        So a weak source (high resistance) can drive a heavy load (low resistance), which it could never do directly.
      `),
      Q(md`An emitter follower has a voltage gain below 1. Why put one between a $10\kO$ source and a $200\,\Omega$ load?`,
        ['Connected directly, the load would get about 2% of the signal; through the follower it gets a large fraction.', 'It adds voltage gain.', 'It inverts the signal.', 'It increases the output resistance.'], 0,
        [null, 'It cannot: its gain is just under 1.', 'A follower does not invert.', 'It lowers it, to about $R_B/(\\beta+1) + 1/g_m$.'],
        md`Directly: $200/(10\,000 + 200)\approx 2\%$. Through a follower (1 mA, $\beta = 100$): $\dfrac{101\cdot200}{10\text{k} + 2.5\text{k} + 101\cdot200} = 0.62$. Thirty times more signal at the load.`),
      P({
        id: 'e3u12-cc-num', title: 'Emitter follower, with numbers',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $R_B = 10\kO$, $R_E = 1\kO$, $r_o = \infty$. Find $G_M$, $R_{out}$, $A_v$ and $R_{in}$ (seen by $v_{in}$, $R_B$ included).`,
        fig: F.cc(true),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -8.08, accept: [-8] }, { lbl: 'R_{out}', unit: 'Ω', ans: 110.1322, accept: [111.111] }, { lbl: 'A_v', unit: '', ans: 0.8898678, accept: [0.888889] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 113.5, accept: [112.5] }],
        hints: [md`$r_\pi = 2.5\kO$. Looking back into the emitter: $(r_\pi + R_B)/(\beta + 1) = 12.5\text{k}/101$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$.
2. $G_M = -\dfrac{\beta + 1}{r_\pi + R_B} = -\dfrac{101}{12.5\kO} = -8.08\,\text{mS}$.
3. Looking into the emitter: $\dfrac{12.5\kO}{101} = 123.8\,\Omega$. $R_{out} = 1\text{k}\parallel123.8 = 110.1\,\Omega$.
4. $A_v = -G_MR_{out} = 0.890$ (check: $1000/(1000 + 123.8) = 0.890$ ✓).
5. $R_{in} = R_B + r_\pi + (\beta + 1)R_E = 10 + 2.5 + 101 = 113.5\kO$.`,
      }),
      P({
        id: 'e3u12-cc-buffer', title: 'The buffer, in numbers',
        q: md`A source with $R_S = 10\kO$ must drive $R_L = 200\,\Omega$. (a) Connected directly, what is $v_L/v_s$? (b) Through an emitter follower ($I_C = 1\,\text{mA}$, $\beta = 100$, $R_L$ as the emitter resistor, $R_S$ at the base), what is $v_L/v_s$, and what resistance does the source see?`,
        parts: [{ lbl: '\\text{(a) } v_L/v_s', unit: '', ans: 0.01960784 }, { lbl: '\\text{(b) } v_L/v_s', unit: '', ans: 0.617737, accept: [0.6153846] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 32.7, accept: [32.5] }],
        hints: [md`(a) is a plain divider. (b) is the follower formula with $R_B = R_S$ and $R_E = R_L$.`],
        sol: md`
(a) $\dfrac{200}{10\,000 + 200} = 0.0196$.

(b) $A_v = \dfrac{(\beta + 1)R_L}{R_S + r_\pi + (\beta + 1)R_L} = \dfrac{20\,200}{10\,000 + 2500 + 20\,200} = 0.618$, and $R_{in} = 32.7\kO$. The follower turned the $200\,\Omega$ load into $32.7\kO$ as far as the source is concerned: 31 times more signal.`,
      }),
      G('e3_amp_stage', { need: 4, only: ['cc'] }),
      G('e3_amp_sym', { need: 3, only: ['cb', 'cc'] }),
    ],
  });

  // ================================================================== 6. recognize on sight
  const fName1 = S({ dev: 'pnp', kind: 'cc', RE: true, RB: false });
  const fName2 = S({ dev: 'pnp', kind: 'cb', RE: true, RB: false, flip: true });
  const fName3 = S({ dev: 'npn', kind: 'ce', RE: true, RB: true, flip: true });
  L({
    id: 'e3-u12-name', title: 'Name it on sight: sign and size before any algebra', ref: 'Lectures 24, 28–29',
    steps: [
      R(md`
        ### Why this lesson

        Most lost points on Midterm 2 came from computing the right formula for the **wrong** stage. The fix is a ten-second routine you run before writing anything, until it is automatic. It works for MOSFETs and BJTs alike.

        1. **Which end is which.** Find the arrow. It marks the emitter (BJT) or the source (MOSFET). NPN/NMOS: arrow on the bottom lead, pointing out. PNP/PMOS: arrow on the top lead, pointing in (toward $V_{CC}$). The plate or bar on the side is the gate or base.
        2. **Where does $v_{in}$ land?** Follow the wire from the source (through any resistor).
        3. **Where is $v_{out}$ taken?**
        4. **The leftover terminal is "common".** That names the stage.
        5. **Say the sign and size out loud** from the table below. Only then compute.
      `),
      R(md`
        ### The table to say out loud

        | In → out | Common | Name (BJT / MOSFET) | Sign and size |
        |---|---|---|---|
        | base → collector, emitter on its rail | emitter | common emitter / common source | inverting, large: $-g_mR_C$ (hundreds for a BJT) |
        | base → collector, $R_E$ in the emitter | emitter | degenerated CE / degenerated CS | inverting, $\approx-R_C/(R_E + 1/g_m)$, set by resistors |
        | emitter → collector, base held | base | common base / common gate | **non**-inverting, $+R_C$ over the emitter-path resistance |
        | base → emitter, collector on its rail | collector | emitter follower / source follower | non-inverting, just under $+1$ |

        Two combinations never appear as amplifiers: the input is never the collector, and the output is never the base.

        **PNP is not a new case.** It is the NPN drawing turned upside down, with $V_{CC}$ playing the part of ground. The small-signal model, the names and every formula are identical.
      `),
      Q(md`Read this stage. What is it, and what is its gain like?`,
        ['An emitter follower: gain just under $+1$', 'A common emitter: large and inverting', 'A common base: large and non-inverting', 'A degenerated common emitter: about $-R_C/R_E$'], 0,
        [null, 'The output is taken from the arrow lead (the emitter of this PNP), not from the collector.', 'The base is driven by $v_{in}$, not held.', 'There is no collector resistor at all: the collector sits on ground, so it is common.'],
        md`PNP: the arrow is on the top lead, so the emitter is on top. $v_{in}$ drives the base, $v_{out}$ is the emitter, the collector is on ground (incremental ground): the collector is common. Emitter follower, gain $R_E/(R_E + r_\pi/(\beta + 1))$, just under 1.`, { fig: fName1 }),
      Q(md`And this one (the base is on the right this time)?`,
        ['A common base: non-inverting, $\\approx R_C/(R_E + 1/g_m)$', 'A common emitter: inverting', 'An emitter follower', 'Not an amplifier: the input is on the collector'], 0,
        [null, 'The base is held by the triangle: it is not the input.', 'The output is the bottom lead, which for a PNP is the collector (no arrow).', 'The input source hangs on the top lead, which carries the arrow: that is the emitter of a PNP.'],
        md`PNP, so the arrow lead on top is the emitter. $v_{in}$ (through $R_E$) drives the emitter, the base is held, $v_{out}$ is the collector at the bottom: common base. Non-inverting, with $R_C$ over the emitter-path resistance $R_E + 1/g_m$.`, { fig: fName2 }),
      Q(md`And this one?`,
        ['A degenerated common emitter: $\\approx-R_C/(R_E + 1/g_m + R_B/\\beta)$', 'A common base', 'An emitter follower', 'A common emitter with gain $-g_mR_C$'], 0,
        [null, 'The base is driven (through $R_B$), not held.', 'The output is the collector, at the top.', 'That ignores $R_E$, which sits in the emitter and sets the gain.'],
        md`NPN with the base on the right. $v_{in}$ reaches the base through $R_B$, the output is the collector, $R_E$ sits under the emitter: degenerated common emitter. Gain $\approx-R_C/(R_E + 1/g_m + R_B/\beta)$, the shortcut.`, { fig: fName3 }),
      R(md`
        ### The drill

        Each problem draws one stage at random: NPN, PNP, NMOS or PMOS, base on either side, with or without resistors. Answer the four questions in order. Do at least 10 without a miss, then come back tomorrow: this is a speed skill. (The [recognition gym](#/gym) mixes it with the impedance and frequency drills.)
      `),
      G('e3_amp_name', { need: 10 }),
    ],
  });

  // ================================================================== 7. cascode
  L({
    id: 'e3-u12-cascode', title: 'The BJT cascode, and its $\\beta r_o$ ceiling', ref: 'Lectures 28–29',
    steps: [
      R(md`
        ### Why this lesson

        A cascode stacks a common base ($Q_2$) on a common emitter ($Q_1$). It keeps the common emitter's $G_M$ and multiplies the output resistance, so with a current-source load the gain is enormous. It is the [MOSFET cascode](#/l/e2-u8-cascode) with one twist: the BJT version tops out at $\beta r_o$.

        **Recognize it.** Two transistors in one column. The bottom one has $v_{in}$ on its base. The top one has its base held, and the output is its collector.
      `, F.cascode()),
      R(md`
        ### $G_M$, $R_{out}$, gain

        **$G_M$.** Short the output. $Q_1$ pulls $g_{m1}v_{in}$ out of node $X$. $Q_2$ looks like about $1/g_{m2}$ from $X$, much less than $r_{o1}$, so nearly all of that current comes up through $Q_2$ and out of the short (minus a $1/\beta$ sliver into $Q_2$'s base): $G_M\approx g_{m1}$.

        **$R_{out}$.** Input off: $Q_1$ is $r_{o1}$. $Q_2$ is a collector with its base held and a resistance $r_{o1}\parallel r_{\pi2}$ under its emitter (the $r_\pi$ appears because the held base is a path to ground). The degenerated-collector formula from Unit 11:
        $$R_{C2} = r_{o2} + (r_{o1}\parallel r_{\pi2}) + g_{m2}r_{o2}(r_{o1}\parallel r_{\pi2})\approx g_{m2}r_{o2}(r_{o1}\parallel r_{\pi2})$$
        Usually $r_{\pi2}\ll r_{o1}$, so $R_{C2}\approx g_{m2}r_{o2}r_{\pi2} = \beta r_{o2}$.

        **Gain.** $A_v = -G_M(R_{load}\parallel R_{C2})$. With an ideal current-source load, $A_v\approx-g_{m1}\beta r_o$: tens of thousands or more. With a resistor $R_C$ the cascode buys little, since $R_C$ dominates.

        !!trap Not $g_mr_o\cdot r_o$
        For a MOSFET cascode the bottom transistor's $r_{ds}$ gets multiplied by $g_mr_{ds}$, and you can keep stacking. For a BJT the signal leaks out of $Q_2$'s emitter through $r_{\pi2}$ into its held base, so the resistance under $Q_2$ never looks bigger than $r_\pi$. The ceiling is $\beta r_o$, whatever you stack.
      `),
      Q(md`In a BJT cascode with $r_{o1} = 100\kO$ and $r_{\pi2} = 2.5\kO$, what limits $R_{C2}$?`,
        ['$r_{\\pi2}$: the resistance under $Q_2$ is $r_{o1}\\parallel r_{\\pi2}\\approx r_{\\pi2}$', '$r_{o1}$', 'The load resistor', 'Nothing: it grows without bound'], 0,
        [null, 'In parallel, the smaller one wins: $r_{\\pi2}$ is 40 times smaller.', 'The load sits in parallel with $R_{C2}$ at the output; it does not limit $R_{C2}$ itself.', 'That is the MOSFET story. The BJT tops out near $\\beta r_o$.'],
        md`$r_{o1}\parallel r_{\pi2} = 2.44\kO\approx r_{\pi2}$, so $R_{C2}\approx g_mr_or_\pi = \beta r_o$.`),
      P({
        id: 'e3u12-casc-num', title: 'BJT cascode with a current-source load',
        q: md`Both transistors: $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$. The load is an ideal current source. Find $R_{C2}$ (looking into $Q_2$'s collector), the ceiling $\beta r_o$, and $A_v$ (the $-g_mR_{C2}$ form is accepted).`,
        fig: F.cascode().map((e) => (e[0] === 'R' && e[3] && e[3].n === 'R_C' ? ['I', e[1], e[2], { n: 'I_B', side: 'l' }] : e)),
        parts: [{ lbl: 'R_{C2}', unit: 'MΩ', ans: 4.814286, accept: [4.761905] }, { lbl: '\\beta r_o', unit: 'MΩ', ans: 5 }, { lbl: 'A_v', unit: '', ans: -190571.4, accept: [-192571.4] }],
        hints: [md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\kO$. $r_{o1}\parallel r_{\pi2} = 2.381\kO$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = V_A/I_C = 50\kO$.
2. $R = r_{o1}\parallel r_{\pi2} = 50\text{k}\parallel2.5\text{k} = 2.381\kO$.
3. $R_{C2} = r_o + R + g_mr_oR = 50\text{k} + 2.381\text{k} + (40\,\text{mS})(50\text{k})(2.381\text{k}) = 4.814\,\text{M}\Omega$.
4. $\beta r_o = 5\,\text{M}\Omega$: the cascode is already at 96% of its ceiling.
5. $G_M = g_{m1}\dfrac{g_{m2} + 1/r_{o2}}{g_{m2} + 1/r_{\pi2} + 1/r_{o2} + 1/r_{o1}} = 39.58\,\text{mS}\approx g_m$, so $A_v = -G_MR_{C2} = -1.906\times10^5$.`,
      }),
      G('e3_amp_casc', { need: 3 }),
    ],
  });

  // ================================================================== 8. loading and mixed chains
  const fCeCc = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: '10\\kO', side: 'l' }], ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ...F.inB(0, 1),
    ['w', [1, 0], [2.4, 0], [2.4, 1]], ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['npn', [3.4, 1], { n: 'Q_2' }], ['rail', [3.4, 0]],
    ['R', [3.4, 2], [3.4, 3.2], { n: 'R_L', s: '100\\,\\Omega' }], ['gnd', [3.4, 3.2]], ['w', [3.4, 2], [4.2, 2]], F.out([4.2, 2])];
  const fDiodeLoad = [['rail', [1, -2]], ['pnp', [1, -1], { n: 'Q_2', dc: true }], ['w', [1, 0], [1.8, 0]], F.out([1.8, 0]), ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ...F.inB(0, 1)];
  L({
    id: 'e3-u12-chain', title: 'Loading, chains, and BJT–MOSFET mixes', ref: 'Lectures 28–29',
    steps: [
      R(md`
        ### Why this lesson

        Problem 2 on Exam 3 is likely a circuit with two or three transistors, some BJT, some MOSFET. The rule is the one from [Unit 9's chains](#/l/e2-u9-chain), with one new wrinkle: **a BJT base loads the stage that drives it, a MOSFET gate does not.**

        **The rule.** Multiply the stage gains, and compute each stage's gain with the **next stage's input resistance hanging on its output**:
        $$A_v = A_1A_2,\qquad A_1 = -G_{M1}\,(R_{out1}\parallel R_{in2})$$
      `),
      R(md`
        ### What each kind of input loads the previous stage with

        | Stage 2 is driven at... | $R_{in2}$ | Loading |
        |---|---|---|
        | a MOSFET gate | $\infty$ | none |
        | a BJT base, emitter grounded (CE) | $r_{\pi2}$ | a few k$\Omega$: often serious |
        | a BJT base, $R$ in the emitter (CE + $R_E$, follower) | $r_{\pi2} + (\beta + 1)R$ | mild: $(\beta+1)$ helps |
        | a BJT emitter or MOSFET source (CB, CG) | $\approx 1/g_{m2}$ | severe: stage 1 then works as a current source into it |

        Order matters: compute stage 2's input resistance **first**, then stage 1's gain.
      `),
      R(md`
        ### Example: why a follower goes between a CE and a small load

        $Q_1$ ($1\,\text{mA}$, $R_C = 10\kO$) has to drive $R_L = 100\,\Omega$.
        - **Directly:** $A_v = -g_{m1}(R_C\parallel R_L) = -(40\,\text{mS})(99\,\Omega) = -3.96$. The load kills the gain.
        - **Through follower $Q_2$** ($1\,\text{mA}$, $\beta = 100$): $R_{in2} = r_{\pi2} + (\beta + 1)R_L = 2.5\text{k} + 10.1\text{k} = 12.6\kO$.
          $A_1 = -g_{m1}(10\text{k}\parallel12.6\text{k}) = -223.0$, $\;A_2 = \dfrac{10.1\text{k}}{12.6\text{k}} = 0.802$, $\;A_v = -178.8$.

        Forty-five times more gain, from a stage with gain 0.8.
      `, fCeCc),
      P({
        id: 'e3u12-chain-cecc', title: 'Common emitter into an emitter follower',
        q: md`Both BJTs: $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o = \infty$. $R_C = 10\kO$, $R_L = 100\,\Omega$. Find $R_{in2}$, $A_1 = v_1/v_{in}$ and $A_v$.`,
        fig: fCeCc,
        parts: [{ lbl: 'R_{in2}', unit: 'kΩ', ans: 12.6, accept: [12.5] }, { lbl: 'A_1', unit: '', ans: -223.0088, traps: [{ v: -400, msg: 'That is $-g_mR_C$: $Q_2$\'s base loads node $v_1$ with $R_{in2}$.' }] }, { lbl: 'A_v', unit: '', ans: -178.7611 }],
        hints: [md`$R_{in2} = r_{\pi2} + (\beta + 1)R_L$.`, md`$A_1 = -g_{m1}(R_C\parallel R_{in2})$, $A_2 = (\beta + 1)R_L/R_{in2}$.`],
        sol: md`
1. $R_{in2} = 2.5\text{k} + 101(100) = 12.6\kO$.
2. $R_C\parallel R_{in2} = \dfrac{10\times12.6}{22.6}\kO = 5.575\kO$, so $A_1 = -(40\,\text{mS})(5.575\kO) = -223.0$.
3. $A_2 = \dfrac{10.1}{12.6} = 0.8016$.
4. $A_v = -178.8$.`,
      }),
      R(md`
        ### Mixed devices: three facts to keep straight

        - **A BJT stage driving a MOSFET gate** sees no load. A common emitter into a common source: $A_v = (-g_{m1}R_C)(-g_{m2}R_D)$, positive.
        - **A MOSFET stage driving a BJT base** is loaded by $r_\pi + (\beta + 1)R_E$. A common source into an emitter follower: $A_1 = -g_{m1}\big(R_D\parallel R_{in2}\big)$.
        - **A follower driving a common emitter** sees $r_{\pi2}$ in parallel with its own $R_E$: use $R_E\parallel r_{\pi2}$ in the follower formula.

        And for loads above a single stage:
        - **PMOS or PNP current-source load** on a common emitter: $A_v = -g_m(r_o\parallel r_{o,load})$. The ceiling $g_mr_o = V_A/V_T$ is the same at every current.
        - **Diode-connected PNP load:** $\dfrac{r_{\pi2}}{\beta + 1}\approx\dfrac1{g_{m2}}$, so $A_v\approx-g_{m1}/g_{m2}$.
      `),
      Q(md`$Q_1$ and the diode-connected PNP $Q_2$ carry the same current. The gain $v_{out}/v_{in}$ is about...`,
        ['$-1$', '$-g_{m1}r_o$', '$-\\beta$', '$+1$'], 0,
        [null, 'That is an ideal current-source load. A diode is a small resistance, about $1/g_{m2}$.', 'The diode looks like $r_{\\pi2}/(\\beta+1)$, not $r_{\\pi2}$.', 'A common emitter inverts.'],
        md`The diode looks like $r_{\pi2}/(\beta + 1)\approx 1/g_{m2}$, so $A_v\approx-g_{m1}/g_{m2} = -I_{C1}/I_{C2} = -1$ (exactly $-\beta/(\beta+1)$ with $r_o = \infty$).`, { fig: fDiodeLoad }),
      Q(md`A common source $M_1$ ($R_D = 10\kO$) drives the base of a common emitter $Q_2$ whose emitter is grounded ($r_{\pi2} = 2.5\kO$). Stage 1's gain is $-g_{m1}\times$...`,
        ['$R_D\\parallel r_{\\pi2} = 2\\kO$', '$R_D = 10\\kO$', '$r_{\\pi2} = 2.5\\kO$', '$R_D + r_{\\pi2}$'], 0,
        [null, 'That treats the base like a gate. The base draws current through $r_{\\pi2}$.', 'Both $R_D$ and $r_{\\pi2}$ go from $v_1$ to incremental ground.', 'They are in parallel, not series: both run from node $v_1$ to (incremental) ground.'],
        md`$Q_2$'s base looks like $r_{\pi2}$ to ground, in parallel with $R_D$: $10\text{k}\parallel2.5\text{k} = 2\kO$. Stage 1 loses 80% of its gain. This is why a follower is often placed before a common emitter.`),
      G('e3_amp_chain', { need: 5 }),
    ],
  });

  // ================================================================== 9. from the DC bias to the number
  const fPartial = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 12\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: '5\\kO', side: 'l' }], ['npn', [1, 0]],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: '\\infty' }], ['w', [2.5, -1], [3, -1]], ['term', [3, -1], { n: 'v_{out}', side: 'a' }], ['R', [3, -1], [3, 0.4], { n: 'R_L', s: '5\\kO' }], ['gnd', [3, 0.4]],
    ['R', [1, 1], [1, 2.2], { n: 'R_{E1}', s: '100\\,\\Omega', side: 'l' }], ['R', [1, 2.2], [1, 3.4], { n: 'R_{E2}', s: '1.9\\kO', side: 'l' }], ['gnd', [1, 3.4]],
    ['w', [1, 2.2], [2.3, 2.2]], ['C', [2.3, 2.2], [2.3, 3.4], { n: '\\infty' }], ['w', [2.3, 3.4], [1, 3.4]],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.2]], ['Vac', [-0.6, 0.2], [-0.6, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.2], [-0.6, 2.2], { n: 'V_B', s: '2.7\\,\\text{V}', side: 'l' }], ['gnd', [-0.6, 2.2]],
  ];
  const fDivider = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: '4\\kO', side: 'l' }], ['npn', [1, 0]],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: '\\infty' }], ['w', [2.5, -1], [3, -1]], ['term', [3, -1], { n: 'v_{out}', side: 'a' }], ['R', [3, -1], [3, 0.4], { n: 'R_L', s: '4\\kO' }], ['gnd', [3, 0.4]],
    ['R', [1, 1], [1, 2.4], { n: 'R_E', s: '1.8\\kO', side: 'l' }], ['gnd', [1, 2.4]], ['w', [1, 1], [2.3, 1]], ['C', [2.3, 1], [2.3, 2.4], { n: '\\infty' }], ['w', [2.3, 2.4], [1, 2.4]],
    ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: '30\\kO', side: 'l' }], ['R', [-0.6, 0], [-0.6, 1.4], { n: 'R_2', s: '10\\kO', side: 'l' }], ['gnd', [-0.6, 1.4]],
    ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: '\\infty' }], ['R', [-2, 0], [-3.2, 0], { n: 'R_S', s: '1\\kO' }],
    ['w', [-3.2, 0], [-3.2, 0.4]], ['Vac', [-3.2, 0.4], [-3.2, 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-3.2, 1.4]],
  ];
  L({
    id: 'e3-u12-bias', title: 'From the DC bias to a number: bypass and coupling capacitors', ref: 'Lectures 22–24; Spring 2026 Midterm 2 #3',
    steps: [
      R(md`
        ### Why this lesson

        Problem 1 on a BJT exam is usually a whole amplifier with real component values: find the DC point, then $g_m$ and $r_\pi$, then the number for the gain. Last semester's Midterm 2 #3 was exactly this ([worked here](#/l/e3-sp26-bjt)). The recipe is the one from [Unit 8's numeric gains](#/l/e2-u8-numbers):

        1. **DC (capacitors open).** Find $I_C$: usually $V_E = V_B - 0.7\,\text{V}$, $I_E = V_E/R_E$, $I_C = \frac{\beta}{\beta+1}I_E\approx I_E$. Check forward active: $V_C > V_B$ (NPN).
        2. **Device numbers.** $g_m = I_C/V_T$, $r_\pi = \beta/g_m$, and $r_o = V_A/I_C$ if needed.
        3. **Small-signal circuit (capacitors short, DC supplies ground).** Redraw. Name the stage.
        4. **Gain** from the stage's result.
      `),
      R(md`
        ### What each capacitor does

        - **Bypass capacitor across $R_E$:** shorts it for the signal. The emitter becomes incremental ground: a plain common emitter, full gain $-g_mR_C$. At DC, $R_E$ still sets the current (and stabilizes it).
        - **Partial bypass** ($R_{E1}$ unbypassed, $R_{E2}$ bypassed): only $R_{E2}$ disappears for the signal. $R_{E1}$ stays as degeneration: $A_v\approx-R_C/(R_{E1} + 1/g_m)$.
        - **Coupling capacitor to a load $R_L$:** no effect at DC; for the signal, $R_L$ joins $R_C$ in parallel.
        - **Coupling capacitor at the input:** lets $v_{in}$ in without disturbing the DC base voltage. A **base divider** $R_1$, $R_2$ then sits from the base to incremental ground: $R_1\parallel R_2$ in parallel with the base's own input resistance.
      `),
      P({
        id: 'e3u12-bias-partial', title: 'Partially bypassed emitter',
        q: md`$\beta = 100$, $V_{BE,on} = 0.7\,\text{V}$, $V_T = 25\,\text{mV}$, $r_o = \infty$. Find $I_C$, $V_C$ (DC), $g_m$, and $A_v = v_{out}/v_{in}$. ($I_C\approx I_E$ is accepted.)`,
        fig: fPartial,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.990099, accept: [1] }, { lbl: 'V_C', unit: 'V', ans: 7.049505, accept: [7] }, { lbl: 'g_m', unit: 'mS', ans: 39.60396, accept: [40] }, { lbl: 'A_v', unit: '', ans: -19.80198, accept: [-19.96008, -20] }],
        hints: [md`DC: $I_E = (2.7 - 0.7)/(100 + 1900)\,\Omega$. Both emitter resistors carry the DC.`, md`Signal: the capacitor shorts only $R_{E2}$; $R_{E1}$ degenerates. $R_C\parallel R_L = 2.5\kO$.`],
        sol: md`
**DC.** $V_E = 2.7 - 0.7 = 2\,\text{V}$ across $R_{E1} + R_{E2} = 2\kO$: $I_E = 1\,\text{mA}$, $I_C = \frac{100}{101}(1\,\text{mA}) = 0.990\,\text{mA}$. $V_C = 12 - (0.990)(5) = 7.05\,\text{V} > V_B = 2.7\,\text{V}$: forward active. ✓

**Numbers.** $g_m = 0.990\,\text{mA}/25\,\text{mV} = 39.6\,\text{mS}$, $r_\pi = 100/g_m = 2.525\kO$.

**Small signal.** $V_B$ and $V_{CC}$ are ground. $R_{E2}$ is shorted by its capacitor; $R_{E1} = 100\,\Omega$ remains: a degenerated common emitter. The collector sees $R_C\parallel R_L = 2.5\kO$.
$$A_v = -\frac{\beta(R_C\parallel R_L)}{r_\pi + (\beta + 1)R_{E1}} = -\frac{100(2500)}{2525 + 10\,100} = -19.8$$
Shortcut: $-\dfrac{2500}{25.25 + 100} = -19.96$. Without $R_{E1}$ the gain would be $-g_m(2.5\kO) = -99$: the 100 $\Omega$ costs a factor of 5 and buys a gain that barely depends on $g_m$.`,
      }),
      P({
        id: 'e3u12-bias-divider', title: 'Divider bias, input and output coupling',
        q: md`$\beta = 100$, $V_{BE,on} = 0.7\,\text{V}$, $V_T = 25\,\text{mV}$, $r_o = \infty$. Find $I_C$ (exact, with the base current; the stiff-divider value is also accepted), $r_\pi$, $R_{in}$ (to the right of the input capacitor), and $A_v = v_{out}/v_{in}$.`,
        fig: fDivider,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.9508716, accept: [1] }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.629167, accept: [2.5] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 1.94673, accept: [1.875] }, { lbl: 'A_v', unit: '', ans: -50.25476, accept: [-52.17391] }],
        hints: [md`Thévenin of the divider: $V_{TH} = 10\cdot\frac{10}{40} = 2.5\,\text{V}$, $R_{TH} = 30\text{k}\parallel10\text{k} = 7.5\kO$.`, md`$I_B = \dfrac{V_{TH} - 0.7}{R_{TH} + (\beta + 1)R_E}$. For the signal, $R_1\parallel R_2$ is in parallel with $r_\pi$.`],
        sol: md`
**DC.** $V_{TH} = 2.5\,\text{V}$, $R_{TH} = 7.5\kO$.
$$I_B = \frac{2.5 - 0.7}{7.5\text{k} + 101(1.8\text{k})} = \frac{1.8}{189.3\kO} = 9.509\,\mu\text{A},\qquad I_C = \beta I_B = 0.951\,\text{mA}$$
(Stiff divider: $I_C\approx1.8/1.8\text{k} = 1\,\text{mA}$, 5% high.) $V_C = 10 - 0.951(4) = 6.20\,\text{V}$: forward active. ✓

**Numbers.** $g_m = 38.03\,\text{mS}$, $r_\pi = 2.629\kO$.

**Small signal.** Both divider resistors go to incremental ground: $R_{in} = 7.5\text{k}\parallel2.629\text{k} = 1.947\kO$. The emitter is bypassed: common emitter into $R_C\parallel R_L = 2\kO$.
$$A_v = \frac{R_{in}}{R_S + R_{in}}\big(-g_m(R_C\parallel R_L)\big) = \frac{1.947}{2.947}(-76.07) = -50.25$$`,
      }),
      G('e3_amp_bias', { need: 5 }),
    ],
  });

  // ================================================================== 10. mixed drill + the unit on one card
  L({
    id: 'e3-u12-mix', title: 'Unit 12 on one card, and the mixed drill', ref: 'Lecture 24 summary',
    steps: [
      R(md`
        ### Recognize it (say this before computing)

        | Stage | In → out | Common terminal | Sign and size | MOSFET twin |
        |---|---|---|---|---|
        | Common emitter | base → collector | emitter (on its rail) | inverting, large | common source |
        | CE + $R_E$ | base → collector | emitter (through $R_E$) | inverting, $\approx R_C/R_E$ | degenerated CS |
        | Common base | emitter → collector | base (held) | non-inverting, large | common gate |
        | Emitter follower | base → emitter | collector (on its rail) | non-inverting, just under 1 | source follower |
        | Cascode | base of $Q_1$ → collector of $Q_2$ | CE under a CB | inverting, huge with a current-source load | MOS cascode |

        ### The formulas ($r_o = \infty$; $R_B$ = resistance in series with the base)

        | Stage | $G_M$ | $R_{out}$ | $R_{in}$ (seen by $v_{in}$) | $A_v$ |
        |---|---|---|---|---|
        | CE | $\dfrac{\beta}{R_B + r_\pi}$ | $R_C\parallel r_o$ | $R_B + r_\pi$ | $-\dfrac{\beta R_C}{R_B + r_\pi}$ |
        | CE + $R_E$ | $\dfrac{\beta}{R_B + r_\pi + (\beta+1)R_E}$ | $R_C$ | $R_B + r_\pi + (\beta+1)R_E$ | $\approx-\dfrac{R_C}{R_B/\beta + 1/g_m + R_E}$ |
        | CB | $-\dfrac{\beta}{R_B + r_\pi + (\beta+1)R_E}$ | $R_C$ | $R_E + \dfrac{R_B + r_\pi}{\beta + 1}$ | $\approx+\dfrac{R_C}{R_B/\beta + 1/g_m + R_E}$ |
        | Follower | $-\dfrac{\beta + 1}{r_\pi + R_B}$ | $R_E\parallel\dfrac{r_\pi + R_B}{\beta + 1}$ | $R_B + r_\pi + (\beta+1)R_E$ | $\dfrac{R_E}{R_E + \frac{r_\pi + R_B}{\beta+1}}$ |
        | Cascode | $\approx g_{m1}$ | $\approx g_mr_o(r_o\parallel r_\pi)\le\beta r_o$ | $r_{\pi1}$ | $-g_{m1}(R_{load}\parallel R_{C2})$ |

        **The two rules behind all of it:** from the base, emitter resistance $\times(\beta + 1)$; from the emitter, base resistance $\div(\beta + 1)$. **The shortcut:** $|A_v|\approx$ collector resistance over emitter-path resistance. **The sign check:** "$v_{in}$ up → more or less current pulled down → $v_{out}$ down or up".
      `),
      R(md`
        ### The mixed drill

        Every Unit 12 skill, new numbers each time: single stages (numeric and symbolic), naming on sight, chains with loading, the full bias-to-gain problem, the cascode. Ten without opening a solution completes it.
      `),
      G('e3_amp_stage', { need: 10, pool: ['e3_amp_stage', 'e3_amp_stage', 'e3_amp_sym', 'e3_amp_name', 'e3_amp_chain', 'e3_amp_bias', 'e3_amp_casc'] }),
    ],
  });
})();

/* Spring 2026 Midterm 2 (last semester's real exam), typed blank with worked solutions; answers checked against an
   exact circuit solve. Problems 1(b) and 3 are BJT problems: flagged as outside this term's Exam 2 and also filed
   under Exam 3 (BJTs), which is registered here. */
(function () {
  'use strict';
  const { R, P } = C;
  const kO = (v) => `${v}\\,\\text{k}\\Omega`;

  // ---------------------------------------------------------------- figures
  const fig1a = [
    ['I', [0, 1.6], [0, 0.4], { n: 'i_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.4], [0, 0], [0.6, 0]],
    ['R', [0.6, 0], [2, 0], { n: 'R_1' }], ['w', [0.6, 0], [0.6, 1], [1, 1]],
    ['nmos', [2, 1], { n: 'M_1' }], ['gnd', [2, 2]],
    ['rail', [2, -1.2]], ['I', [2, -1.2], [2, 0], { n: 'I_{DC}' }], ['w', [2, 0], [2.8, 0]], ['term', [2.8, 0], { n: 'v_{out}' }],
  ];
  const fig1b = [
    ['w', [0, 1], [-0.7, 1]], ['term', [-0.7, 1], { n: 'i_{in}\\rightarrow', side: 'l' }],
    ['npn', [1, 1], { n: 'Q_1' }], ['npn', [2, 2], { n: 'Q_2' }], ['gnd', [2, 3]],
    ['w', [1, 0], [1, -0.4], [2, -0.4], [2, 1]], ['w', [1.5, -0.4], [1.5, -0.9]], ['term', [1.5, -0.9], { n: 'i_{out}\\downarrow', side: 'r' }],
  ];
  const fig2 = [
    ['rail', [0, -0.3], { n: 'V_{DD}' }], ['R', [0, -0.3], [0, 1], { n: 'R_1', s: '1.8\\,\\text{k}\\Omega', side: 'l' }], ['node', [0, 1], { n: 'V_1', side: 'l' }],
    ['nmos', [0, 2], { n: 'M_2', sz: '1X', flip: true, dc: true }], ['gnd', [0, 3]],
    ['nmos', [2, 2], { n: 'M_3', sz: '1X' }], ['gnd', [2, 3]],
    ['nmos', [2, 0], { n: 'M_1', sz: '1X', flip: true }], ['w', [3, 0], [3.7, 0], [3.7, 0.3]], ['Vac', [3.7, 0.3], [3.7, 1.3], { n: 'v_{in}', side: 'r' }], ['gnd', [3.7, 1.3]],
    ['rail', [2, -2.2], { n: 'V_{DD}' }], ['R', [2, -2.2], [2, -1], { n: 'R_D', s: '1\\,\\text{k}\\Omega', side: 'l' }], ['w', [2, -1], [2.9, -1]], ['term', [2.9, -1], { n: 'V_{OUT}+v_{out}' }],
    ['w', [2, 1], [2.4, 1]], ['C', [2.4, 1], [3, 1], { n: '\\infty' }], ['R', [3, 1], [3, 2.4], { n: 'R_S', s: '1\\,\\text{k}\\Omega' }], ['gnd', [3, 2.4]],
  ];
  const fig3 = [
    ['rail', [1, -3.4], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -3.4], [1, -2.2], { n: 'R_{C1}', s: kO(2) }], ['R', [1, -2.2], [1, -1], { n: 'R_{C2}', s: kO(2) }],
    ['w', [1, -2.2], [0.3, -2.2]], ['C', [0.3, -2.2], [0.3, -1], { n: '\\infty', side: 'l' }], ['w', [0.3, -1], [1, -1]],
    ['npn', [1, 0], { n: '' }], ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: '\\infty' }], ['w', [2.5, -1], [3, -1]], ['term', [3, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [3, -1], [3, 0.4], { n: 'R_L', s: kO(2) }], ['gnd', [3, 0.4]],
    ['R', [1, 1], [1, 2.4], { n: 'R_E', s: '2.3\\,\\text{k}\\Omega' }], ['gnd', [1, 2.4]], ['w', [1, 1], [2.3, 1]], ['C', [2.3, 1], [2.3, 2.4], { n: '\\infty' }], ['w', [2.3, 2.4], [1, 2.4]],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.2]], ['Vac', [-0.6, 0.2], [-0.6, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.2], [-0.6, 2.2], { n: '3\\,\\text{V}', side: 'l' }], ['gnd', [-0.6, 2.2]],
  ];

  const bjtNote = md`!!trap BJT problem
  This term's Exam 2 is MOSFET only (no BJT on any practice paper or on the formula sheet). It is here because it was on last semester's paper, and it is filed again under **Exam 3** for later. Skip it for now if you are short on time.`;

  // ---------------------------------------------------------------- problems
  const p1a = P({
    id: 'e2sp26-1a', src: 'Spring 2026 Midterm 2 · Problem 1(a)', title: 'A current input with a resistor to the gate',
    q: md`$i_{in}$ is an incremental (signal) current source and $I_{DC}$ is a bias (DC) current source. Compute the incremental gain $A = v_{out}/i_{in}$. Assume $r_{ds}\to\infty$.`,
    fig: fig1a,
    parts: [E2.ex('1/gm - R1', ['gm', 'R1'], 'A', { exact: true })],
    hints: [md`In the small-signal circuit, $I_{DC}$ is an open circuit and the gate draws no current. Where can $i_{in}$ go?`, md`It flows through $R_1$ into the output node, and from there the only path is down through $M_1$. So $M_1$ must carry exactly $i_{in}$.`],
    sol: md`**Small-signal circuit.** $I_{DC}$ becomes an open circuit. The gate draws no current.

**Step 1: follow $i_{in}$.** It enters node $A$ (left end of $R_1$). It cannot go into the gate, so it flows through $R_1$ into the output node. From the output node the only path is down through $M_1$ (the current source above is open). So $M_1$ carries the signal current $i_{in}$.

**Step 2: the gate voltage.** $M_1$'s gate is node $A$ and its source is grounded, so $v_{gs} = v_A$. Its current is $g_mv_{gs} = i_{in}$:
$$v_A = \frac{i_{in}}{g_m}$$

**Step 3: the output.** Walking from $A$ to the output through $R_1$, the voltage drops by $i_{in}R_1$ (current flows that way):
$$v_{out} = v_A - i_{in}R_1 = i_{in}\Big(\frac1{g_m} - R_1\Big)$$

$$A = \frac{v_{out}}{i_{in}} = \frac{1}{g_m} - R_1$$

**Check.** $R_1 = 0$ turns $M_1$ into a diode, and $1/g_m$ is the diode resistance. ✓ This is a transresistance (volts per amp), so its unit is ohms. ✓`,
  });

  const p1b = P({
    id: 'e2sp26-1b', src: 'Spring 2026 Midterm 2 · Problem 1(b) · BJT', title: 'Two BJTs: current gain',
    q: md`Obtain an expression for the incremental current gain $A_i = i_{out}/i_{in}$ as a function of $\beta$. Both BJTs are forward-active with the same $\beta$. Extra credit: approximate $A_i$ by one term using $\beta\gg2$.`,
    fig: fig1b,
    parts: [Object.assign(E2.ex('beta*(beta + 2)', ['beta'], 'A_i', { exact: true, ranges: { beta: [50, 200] } }), { disp: { beta: '\\beta' } })],
    hints: [md`A forward-active BJT: collector current $= \beta\times$ base current, emitter current $= (\beta+1)\times$ base current.`, md`$Q_1$'s emitter current is $Q_2$'s base current.`],
    sol: md`**Step 1: $Q_1$.** Base current $i_{in}$. Collector current $\beta i_{in}$. Emitter current $(\beta + 1)i_{in}$.

**Step 2: $Q_2$.** Its base current is $Q_1$'s emitter current, $(\beta + 1)i_{in}$. Its collector current is $\beta(\beta + 1)i_{in}$.

**Step 3: $i_{out}$.** Both collectors join at the output, so
$$i_{out} = \beta i_{in} + \beta(\beta + 1)i_{in} = \beta(\beta + 2)\,i_{in}$$
$$A_i = \beta(\beta + 2)\approx\beta^2\quad(\beta\gg2)$$

This pair (a Darlington) behaves like one transistor with current gain about $\beta^2$. A common slip is to get $3\beta$ by adding gains instead of multiplying them: the second transistor's base current is already amplified by the first.`,
  });

  const p2 = P({
    id: 'e2sp26-2', src: 'Spring 2026 Midterm 2 · Problem 2 (35 pts)', title: 'Degenerated common source biased by a mirror', big: true,
    q: md`$V_{DD} = 3\,\text{V}$, $R_1 = 1.8\,\text{k}\Omega$, $1X = 500/1$, $R_D = R_S = 1\,\text{k}\Omega$. Ignore $r_{ds}$ and assume all transistors are saturated. Find (i) the DC operating point $V_{OUT}$ and $I_D$, (ii) sketch the incremental model, (iii) the **numerical** incremental gain $A_v = v_{out}/v_{in}$.`,
    fig: fig2,
    parts: [{ lbl: 'I_D', unit: 'mA', ans: 1 }, { lbl: 'V_{OUT}', unit: 'V', ans: 2 }, { lbl: 'A_v', unit: '', ans: -10 / 11 }],
    hints: [
      md`$M_2$ is diode-connected under $R_1$: $V_1 = 3 - 1.8\,\text{k}\Omega\cdot I_1$ and $V_1 = V_{TN} + V_{ov}$ with $I_1 = 25\,\text{mA/V}^2\cdot V_{ov}^2$.`,
      md`$M_3$ mirrors $M_2$ (same size): it sets $M_1$'s current. $R_S$ hangs on the source through a capacitor, so it carries no DC current.`,
      md`Small signal: $M_3$ is an open circuit (ideal current source), so the source of $M_1$ sees only $R_S$ (the capacitor is a short). That is a common source with source degeneration.`,
    ],
    sol: md`**(i) DC.** $K = \tfrac12(100\,\mu)(500) = 25\,\text{mA/V}^2$ for every $1X$ device.

$M_2$ is diode-connected under $R_1$: $V_1 = 3 - 1800\,I_1$ and $V_1 = 1 + V_{ov}$, $I_1 = 0.025\,V_{ov}^2$:
$$3 - 1800(0.025V_{ov}^2) = 1 + V_{ov}\ \Rightarrow\ 45V_{ov}^2 + V_{ov} - 2 = 0\ \Rightarrow\ V_{ov} = \frac{-1 + \sqrt{1 + 360}}{90} = 0.2\,\text{V}$$
So $I_1 = 0.025(0.04) = 1\,\text{mA}$ and $V_1 = 1.2\,\text{V}$.

$M_3$ has the same $V_{GS}$ and size: $I_3 = 1\,\text{mA}$. It is $M_1$'s only DC path ($R_S$ is behind a capacitor), so **$I_D = 1\,\text{mA}$** and **$V_{OUT} = 3 - (1\,\text{mA})(1\,\text{k}\Omega) = 2\,\text{V}$**.

**(ii) Incremental model.** $V_{DD}$ is ground, so $R_D$ goes from the output to ground. $M_3$ (fixed gate, $r_{ds}$ ignored) is an open circuit. The capacitor is a short, so $R_S$ sits from $M_1$'s source to ground. $M_1$ becomes $g_mv_{gs}$ from drain to source, with $v_g = v_{in}$.

**(iii) Gain.** $g_m = 2I_D/V_{ov} = 2(1\,\text{mA})/0.2 = 10\,\text{mS}$, $g_mR_S = 10$. A common source with a source resistor:
$$A_v = -\frac{g_mR_D}{1 + g_mR_S} = -\frac{10}{11}\approx-0.909$$

**Check.** Close to $-R_D/R_S = -1$ because $g_mR_S = 10\gg1$. (A gain like $-0.00999$ comes from mixing units: $g_m$ is $0.01\,\text{S}$, the resistors are $1000\,\Omega$.)`,
  });

  const p3 = P({
    id: 'e2sp26-3', src: 'Spring 2026 Midterm 2 · Problem 3 (35 pts) · BJT', title: 'Common-emitter amplifier with bypass capacitors', big: true,
    q: md`Sketch the incremental model and find the numerical gain $A_V = v_{out}/v_{in}$. $V_{BE,on} = 0.7\,\text{V}$, $V_T = 25\,\text{mV}$, $\beta = 100$, $r_o = \infty$; you may take $\beta + 1\approx\beta$. The BJT is forward-active.`,
    fig: fig3,
    parts: [{ lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'A_V', unit: '', ans: -40 }],
    hints: [md`DC: the emitter sits $0.7\,\text{V}$ below the $3\,\text{V}$ base, across $R_E$. Capacitors are open at DC.`, md`$g_m = I_C/V_T$ for a BJT.`, md`Small signal: the bypass capacitor shorts $R_E$ (emitter at ground), the other shorts $R_{C2}$, and the output capacitor connects $R_L$. So the collector sees $R_{C1}\parallel R_L$.`],
    sol: md`**DC.** $V_E = 3 - 0.7 = 2.3\,\text{V}$, so $I_E = 2.3/2.3\,\text{k}\Omega = 1\,\text{mA}$ and $I_C\approx I_E = 1\,\text{mA}$ (with $\beta + 1\approx\beta$). Check forward-active: $V_C = 10 - (4\,\text{k}\Omega)(1\,\text{mA}) = 6\,\text{V} > V_B = 3\,\text{V}$. ✓

**Small signal.** $g_m = I_C/V_T = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$. The emitter capacitor makes the emitter incremental ground (a plain common-emitter stage). The capacitor across $R_{C2}$ shorts it, and $V_{CC}$ is ground, so from the collector you see $R_{C1}$ to ground in parallel with $R_L$ (through the output capacitor): $2\,\text{k}\Omega\parallel2\,\text{k}\Omega = 1\,\text{k}\Omega$.

$$A_V = -g_m(R_{C1}\parallel R_L) = -(40\,\text{mS})(1\,\text{k}\Omega) = -40$$

**Link to the MOSFET.** Same as a common source with $g_m = I_C/V_T$ instead of $2I_D/V_{ov}$. The base does draw current ($r_\pi = \beta/g_m = 2.5\,\text{k}\Omega$), but with an ideal voltage source driving it, that does not change the gain.`,
  });

  E2.lesson('e2-pracu', {
    id: 'e2-sp26', title: 'Spring 2026 Midterm 2 (last semester\'s exam)', kind: 'exam',
    sub: 'The real paper, typed blank. Problems 1(a) and 2 are in scope; 1(b) and 3 are BJT (Exam 3 material)',
    steps: [
      R(md`
        Last semester's actual Midterm 2 (Spring 2026, 3 problems, 100 points, 60 minutes), typed clean. Parameters on the cover: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $V_{TP} = -1\,\text{V}$.

        | Problem | Topic | This term |
        |---|---|---|
        | 1(a) | Current input, transresistance of one MOSFET | **In scope** |
        | 1(b) | Two BJTs, current gain | BJT: Exam 3 |
        | 2 | DC bias with a mirror, then a common source with source degeneration | **In scope** |
        | 3 | Common-emitter amplifier | BJT: Exam 3 |

        The syllabus moved BJTs after Exam 2 this term, so do 1(a) and 2 under time (about 25 minutes) and leave the BJT problems for later. Every answer was checked against an exact circuit solve.
      `),
      p1a, R(bjtNote), p1b, p2, R(bjtNote), p3,
    ],
  });

  // ---------------------------------------------------------------- saved for Exam 3
  C.exam({ id: 'e3', title: 'Exam 3', when: 'Thu Nov 19, 7–8 pm, 1002 ECEB', scope: 'BJTs, frequency response, open-circuit time constants' });
  C.unit({ id: 'e3-bjt', exam: 'e3', num: 'Exam 3', title: 'BJT problems saved for later', lessons: [{
    id: 'e3-sp26-bjt', title: 'Spring 2026 Midterm 2: the BJT problems', kind: 'exam',
    steps: [R(md`The two BJT problems from last semester's Midterm 2, kept here for Exam 3. The full paper is under [Practice exams](#/l/e2-sp26).`), p1b, p3],
  }] });
})();

/* e2-prac.js — the five official Exam 2 practice papers (Practice_1..5), one lesson each, every part a checked
   problem card with a worked solution. Figures are redrawn from the PDFs (same topology and device names).
   Every symbolic answer below (REF) was checked against an exact small-signal solve of the drawn circuit; the
   g_m r_ds >> 1 approximations listed in the solutions are accepted by the answer boxes too (rtol 3%). */
(function () {
  'use strict';
  const { R, P } = C;
  const F = window.E2F;

  /* REF-BEGIN */
  const RUP2 = '(R1 + 1/(gm2 + 1/rds2))';
  const RDN1 = '(rds1 + RS + gm1*rds1*RS)';
  const K12 = `(R1/${RUP2})`;
  const P13RX = '(rds1 || rds3 || (1/gm2) || rds2)';
  const P23GMC = '(gm1*rds1*(1 + gm2*rds2)/(rds1 + rds2 + gm2*rds1*rds2))';
  const P23RC = '(rds1 + rds2 + gm2*rds1*rds2)';
  const P23RUP = '(R1 + 1/(gm3 + 1/rds3))';
  const P23A1 = `(-${P23GMC}*(${P23RC} || ${P23RUP}))`;
  const P23ROUT = '(rds4 || (rds5 + R2 + gm5*rds5*R2))';
  const P23GM5 = '(gm5/(1 + (gm5 + 1/rds5)*R2))';
  const P32AV1 = '(-gm1*((1/gm3) || rds3 || rds1))';
  const P32AV2 = '(((rds2 + R + gm2*rds2*R) || (1/gm4) || rds4)/(R + 1/(gm2 + 1/rds2)))';
  const P43RB = '(R1 + 1/(gm1 + 1/rds1))';
  const P43RS2 = `((rds2 + ${P43RB})/(1 + gm2*rds2))`;
  const P43RT = `(rds3 || ${P43RS2})`;
  const P43UP = `(rds4 + ${P43RT}*(1 + gm4*rds4))`;
  const P43D5 = '(rds5 + R5 + gm5*rds5*R5)';
  const P43AL = `(rds3/(rds3 + ${P43RS2}))`;
  const P43GM5 = '(gm5/(1 + (gm5 + 1/rds5)*R5))';
  const P52RX = '(R + 1/(gm2 + 1/rds2))';
  const P52R1 = `(rds1 + ${P52RX}*(1 + gm1*rds1))`;
  const P53RT = '(1/(gm3 + 1/rds3))', P53RB = '(1/(gm4 + 1/rds4))';
  const P53G1 = `(gm1/(1 + (gm1 + 1/rds1)*${P53RT}))`, P53G2 = `(gm2/(1 + (gm2 + 1/rds2)*${P53RB}))`;
  const P53O1 = `(rds1 + ${P53RT}*(1 + gm1*rds1))`, P53O2 = `(rds2 + ${P53RB}*(1 + gm2*rds2))`;
  const REF = {
    p1_2a: { ref: `${RUP2} || ${RDN1}`, names: ['gm1', 'rds1', 'gm2', 'rds2', 'R1', 'RS'],
      approx: ['(R1 + 1/gm2) || rds1*(1 + gm1*RS)'] },
    p1_2b: { ref: `${RUP2} || (${RDN1}/(1 + gm1*rds1*${K12}))`, names: ['gm1', 'rds1', 'gm2', 'rds2', 'R1', 'RS'],
      approx: ['(R1 + 1/gm2) || ((1/gm1 + RS)*(1 + 1/(gm2*R1)))', '(R1 + 1/gm2) || ((1/gm1 + RS)*(R1 + 1/gm2)/R1) || rds1*(1+gm1*RS)'] },
    p1_3gm: { ref: `gm1*${P13RX}/(${P13RX} + 1/(gm4 + 1/rds4))`, names: ['gm1', 'rds1', 'gm2', 'rds2', 'rds3', 'gm4', 'rds4'],
      approx: ['gm1*gm4/(gm2 + gm4)'] },
    p1_3rout: { ref: `RD || (rds4 + ${P13RX}*(1 + gm4*rds4))`, names: ['gm2', 'rds1', 'rds2', 'rds3', 'gm4', 'rds4', 'RD'],
      approx: ['RD || rds4*(1 + gm4/gm2)'] },
    p2_2a: { ref: 'rds1 + (rds2 + R + gm2*rds2*R)*(1 + gm1*rds1)', names: ['gm1', 'rds1', 'gm2', 'rds2', 'R'],
      approx: ['gm1*rds1*rds2*(1 + gm2*R)'] },
    p2_2b: { ref: 'rds1 + (rds2 + R + gm2*rds2*R)*(1 + gm1*rds1*(1 + gm3*rds3))', names: ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'R'],
      approx: ['gm1*rds1*gm3*rds3*rds2*(1 + gm2*R)'] },
    p2_3a1: { ref: P23A1, names: ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'R1'], approx: ['-gm1*(R1 + 1/gm3)'] },
    p2_3a2: { ref: `-gm4*${P23ROUT}`, names: ['gm4', 'rds4', 'gm5', 'rds5', 'R2'], approx: ['-gm4*(rds4 || rds5*(1 + gm5*R2))'] },
    p2_3av: { ref: `${P23A1}*(-gm4*${P23ROUT}) - ${P23GM5}*${P23ROUT}`, names: ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'R1', 'gm4', 'rds4', 'gm5', 'rds5', 'R2'],
      approx: ['(gm1*gm4*(R1 + 1/gm3) - gm5/(1 + gm5*R2))*(rds4 || rds5*(1 + gm5*R2))'] },
    p3_2av1: { ref: P32AV1, names: ['gm1', 'rds1', 'gm3', 'rds3'], approx: ['-gm1/gm3'] },
    p3_2av2: { ref: P32AV2, names: ['gm2', 'rds2', 'gm4', 'rds4', 'R'], approx: ['(1/gm4)/(R + 1/gm2)'] },
    p3_2av: { ref: `(-gm6*${P32AV2} + gm8*gm5*${P32AV1}/(gm7 + 1/rds7 + 1/rds5))*(rds6 || rds8)`,
      names: ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'gm6', 'rds6', 'gm7', 'rds7', 'gm8', 'rds8', 'R'],
      approx: ['-(rds6 || rds8)*(gm6/(gm4*(R + 1/gm2)) + gm1*gm5*gm8/(gm3*gm7))'] },
    p3_3a: { ref: 'rds3 || (2*rds1 + rds3)', names: ['rds1', 'rds3'], approx: [] },
    p3_3b: { ref: 'rds3 || ((2*rds1 + 1/(gm3 + 1/rds3))/(1 + gm3/(gm3 + 1/rds3)))', names: ['gm1', 'rds1', 'gm3', 'rds3'], approx: ['rds1 || rds3'] },
    p4_2: { ref: 'gm1*rds1/(rds1 + R1) + gm2/(1 + (gm2 + 1/rds2)*R2)', names: ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'R2'],
      approx: ['gm1*rds1/(rds1 + R1) + gm2/(1 + gm2*R2)'] },
    p4_3a: { o: { ranges: { R1: [500, 2000], rds1: [2e5, 5e5], rds2: [2e5, 5e5], rds3: [2e5, 5e5], rds4: [2e5, 5e5], rds5: [2e5, 5e5] } }, ref: `${P43D5} || ${P43UP}`, names: ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'R5'],
      approx: ['rds5*(1 + gm5*R5) || rds4*(1 + gm4/gm2)'] },
    p4_3b: { o: { ranges: { R1: [500, 2000], rds1: [2e5, 5e5], rds2: [2e5, 5e5], rds3: [2e5, 5e5], rds4: [2e5, 5e5], rds5: [2e5, 5e5] } }, ref: `${P43D5} || (${P43UP}/(1 + ${P43AL}*${P43GM5}*${P43RB}))`, names: ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'R5'],
      approx: ['rds5*(1 + gm5*R5) || (rds4*(1 + gm4/gm2)/(1 + gm5*(R1 + 1/gm1)/(1 + gm5*R5)))'] },
    p5_2a: { ref: P52R1, names: ['gm1', 'rds1', 'gm2', 'rds2', 'R'], approx: ['rds1*(1 + gm1*(R + 1/gm2))'] },
    p5_2b: { ref: `rds3 || rds4 || (${P52R1}/(1 + gm3*R + gm4*${P52RX}))`, names: ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'gm4', 'rds4', 'R'],
      approx: ['rds3 || rds4 || (rds1*(1 + gm1*(R + 1/gm2))/(1 + gm3*R + gm4*(R + 1/gm2)))'] },
    p5_3a: { ref: `-(${P53G1} + ${P53G2})*(${P53O1} || ${P53O2})`, names: ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'gm4', 'rds4'],
      approx: ['-(gm1*gm3/(gm1 + gm3) + gm2*gm4/(gm2 + gm4))*(rds1*(1 + gm1/gm3) || rds2*(1 + gm2/gm4))'] },
    p5_3b: { ref: 'Av1*(-(gm5/(1 + (gm5 + 1/rds5)*rds7))*(rds6 || (rds5 + rds7 + gm5*rds5*rds7)))', names: ['Av1', 'gm5', 'rds5', 'rds6', 'rds7'],
      approx: ['-Av1*rds6/rds7'] },
  };
  /* REF-END */
  const X = (k, lbl) => E2.ex(REF[k].ref, REF[k].names, lbl, REF[k].o || {});

  // ---------------------------------------------------------------- figure helpers
  const vac = (x, y, n = 'v_{in}', side = 'l') => [['Vac', [x, y], [x, y + 1], { n, side }], ['gnd', [x, y + 1]]];
  const lookR = (p, name) => ['term', p, { n: `\\leftarrow ${name}`, side: 'r' }];
  const V = (v) => `${v}\\,\\text{V}`;
  const PARAMS = md`NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$.`;

  // ================================================================ Practice Exam 1
  const p1fig1a = [
    ['Vac', [0, 0.5], [0, 1.5], { n: 'v_i', side: 'l' }], ['w', [0, 0.5], [0, 0], [1, 0]], ['w', [0, 1.5], [0, 2], [1, 2]],
    ['box', [1, -0.4], [3.4, 2.4], { n: 'Amplifier' }],
    ['w', [3.4, 0], [4.2, 0]], ['w', [3.4, 2], [4.2, 2]], ['term', [4.2, 0], { n: 'A', side: 'a' }], ['term', [4.2, 2], { n: 'B', side: 'b' }],
    ['vlab', [4.5, 0.3], [4.5, 1.7], { n: 'v_o' }],
  ];
  const p1fig1b = [
    ['nmos', [1, 1]], ['w', [1, 0], [1, -0.4], [2.2, -0.4]], ['acg', [2.2, -0.4]], ['iarr', [1.6, -0.4], 'l', { n: 'i_d' }],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vac(-0.6, 1.4, 'v_i'),
    ['w', [1, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'v_s', side: 'r' }], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]],
  ];
  const shift = (fig, dx, dy) => fig.map((e) => e.map((x) => (Array.isArray(x) ? [x[0] + dx, x[1] + dy] : x)));
  const p1fig1c = [...F.gsShort(), ['txt', [0.8, 3], '$\\text{(a) wire}$'], ...shift(F.gsCap(), 3, 0), ['txt', [3.8, 3], '$\\text{(b) large } C$']];
  const p1fig2 = (b) => [
    ['rail', [1, -1.6]], ['R', [1, -1.6], [1, -0.4], { n: 'R_1' }], ['node', [1, -0.4], { n: 'T', side: 'r' }],
    ['pmos', [1, 0.6], { n: 'M_2', dc: true }],
    ['w', [1, 1.6], [2, 1.6]], lookR([2, 1.6], b ? 'R_{eq2}' : 'R_{eq1}'),
    ['nmos', [1, 2.6], { n: 'M_1' }], ['R', [1, 3.6], [1, 4.8], { n: 'R_S' }], ['gnd', [1, 4.8]],
    ...(b ? [['w', [1, -0.4], [-0.6, -0.4], [-0.6, 2.6], [0, 2.6]]] : [['acg', [0, 2.6]]]),
  ];

  const p1 = [
    R(md`
      **60 minutes, 100 points, calculators not allowed** (printed on the cover). ${PARAMS}

      | Problem | Points | What it tests |
      |---|---|---|
      | 1 | 30 | Norton/Thévenin bookkeeping ($G_M$, $R_{out}$, $A_v$); reading $g_m$ off a source follower; what shorting gate to source does |
      | 2 | 35 | Two terminal impedances: a degenerated diode on top, and a gate that moves with the test node |
      | 3 | 35 | $G_M$, $R_{in}$, $R_{out}$ of a folded cascode |

      Do the whole paper on paper first, timed. Then check each part here: symbolic boxes accept the exact answer or the $g_mr_{ds} \gg 1$ approximation.
    `),
    P({
      id: 'e2p1-1a', src: 'Practice Exam 1 · Problem 1(a)', title: 'Thévenin numbers to $G_M$, $R_{out}$, $A_v$',
      q: md`Consider the generic amplifier circuit shown below. When the input voltage $v_i = 100\,\text{mV}$, the output port $(A, B)$ is found to have a Thévenin voltage $V_{TH} = 1\,\text{V}$ and a Thévenin resistance $R_{TH} = 1\kO$. Find $G_M$, $R_{out}$, and the voltage gain $A_v$.`,
      fig: p1fig1a,
      parts: [{ lbl: '|G_M|', unit: 'mS', ans: 10 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 1 }, { lbl: 'A_v', unit: '', ans: 10 }],
      hints: [
        md`Any linear amplifier's output port is a Norton source $G_Mv_i$ in parallel with $R_{out}$ (Lecture 15). Thévenin is the same port written the other way.`,
        md`$R_{out} = R_{TH}$. The open-circuit voltage gain is $V_{TH}/v_i$. The Norton current is $V_{TH}/R_{TH}$.`,
      ],
      sol: md`
**What to see first:** the output port of *any* linear amplifier is a Norton source $G_Mv_i$ in parallel with $R_{out}$. The Thévenin data you are given is the same port written the other way, so this is pure bookkeeping.

- $R_{out} = R_{TH} = 1\kO$.
- Open-circuit gain: $A_v = V_{TH}/v_i = 1\,\text{V}/0.1\,\text{V} = 10$.
- Norton (short-circuit) current $= V_{TH}/R_{TH} = 1\,\text{mA}$, so $|G_M| = 1\,\text{mA}/0.1\,\text{V} = 10\,\text{mS}$.

**Check:** $|A_v| = |G_M|R_{out} = 10\,\text{mS}\times1\kO = 10$. ✓

**Sign.** In the Lecture 15 convention, $G_M$ is the short-circuit current pulled *into* the amplifier and $A_v = -G_MR_{out}$; a positive $A_v$ then means $G_M = -10\,\text{mS}$. Drawn as a Norton source pushing current out of $A$, it is $+10\,\text{mS}$. Both are right if you say which way the current flows (the box accepts either sign).

**Pattern:** three numbers, one relation, $|A_v| = |G_M|R_{out}$. Any two give the third.`,
    }),
    P({
      id: 'e2p1-1b', src: 'Practice Exam 1 · Problem 1(b)', title: 'Reading $g_m$ off a source follower',
      q: md`In the circuit below, $v_i = 50\,\text{mV}$, $v_s = 40\,\text{mV}$, and $R_S = 1\kO$. Determine numerical values of $g_m$ and $i_d$. Assume $r_{ds} \to \infty$.`,
      fig: p1fig1b,
      parts: [{ lbl: 'i_d', unit: 'µA', ans: 40 }, { lbl: 'g_m', unit: 'mS', ans: 4 }],
      hints: [
        md`The drain goes to an incremental ground. Where can the transistor's small-signal current go? Only through $R_S$.`,
        md`$i_d = v_s/R_S$. The control voltage is $v_{gs} = v_i - v_s$.`,
      ],
      sol: md`
**What to see first:** drain at incremental ground, input on the gate, output at the source: a **source follower**. With $r_{ds} \to \infty$, every bit of the transistor's small-signal current flows through $R_S$.

- $i_d = v_s/R_S = 40\,\text{mV}/1\kO = 40\,\mu\text{A}$.
- $v_{gs} = v_i - v_s = 50 - 40 = 10\,\text{mV}$.
- $g_m = i_d/v_{gs} = 40\,\mu\text{A}/10\,\text{mV} = 4\,\text{mS}$.

**Check with the follower formula:** $\dfrac{v_s}{v_i} = \dfrac{g_mR_S}{1+g_mR_S} = \dfrac{4}{5} = 0.8$, and indeed $40/50 = 0.8$. ✓

**Pattern:** in a follower almost all of $v_i$ appears at the source; the small leftover $v_{gs}$ is what makes the current. A gain of 0.8 means $g_mR_S = 4$.`,
    }),
    P({
      id: 'e2p1-1c', src: 'Practice Exam 1 · Problem 1(c)', title: 'Shorting gate to source: wire vs capacitor',
      q: md`Physically shorting the gate and drain of a MOSFET gives a two-terminal device that behaves like a small-signal resistor $(1/g_m)\parallel r_{ds} \approx 1/g_m$ (if $g_mr_{ds} \gg 1$). What type of two-terminal *small-signal* device results if we short the gate and source terminals: (a) physically, with a straight wire; (b) virtually, by connecting a very large capacitance?`,
      fig: p1fig1c,
      parts: [
        { lbl: '(a) Gate wired to source', mc: ['An open circuit: $V_{GS} = 0 < V_T$, so the device is off', 'A resistor $r_{ds}$', 'A resistor $1/g_m$', 'A short circuit'], a: 0,
          why: [null, 'That needs the device to be biased in saturation. A wire forces the DC $V_{GS}$ to zero too, and an NMOS with $V_{GS} = 0$ is cut off.', '$1/g_m$ is the diode connection (gate to drain), not gate to source.', 'There is no channel at all with $V_{GS} = 0$.'] },
        { lbl: '(b) Gate to source through a huge capacitor', mc: ['A resistor $r_{ds}$ (an ideal current source if $r_{ds} \\to \\infty$)', 'An open circuit', 'A resistor $1/g_m$', 'A short circuit'], a: 0,
          why: [null, 'The capacitor is open at DC, so the device keeps its bias and conducts; only the *small-signal* $v_{gs}$ is zero.', 'That is gate tied to drain.', 'The channel current does not depend on $v_{ds}$ except through $r_{ds}$.'] },
      ],
      hints: [md`A wire shorts DC and signal. A huge capacitor shorts only the signal. What is the DC $V_{GS}$ in each case?`, md`With $v_{gs} = 0$ the controlled source $g_mv_{gs}$ is dead. What is left between drain and source?`],
      sol: md`
**What to see first:** separate the DC bias from the small-signal model.

**(a) Wire.** The wire forces $V_{GS} = 0$ at DC as well. An NMOS with $V_{GS} = 0 < V_T$ is **cut off**: no channel, so the two-terminal device is an **open circuit** (infinite incremental resistance).

**(b) Large capacitor.** At DC the capacitor is open, so the transistor keeps whatever bias the rest of the circuit gives it (say, saturation). For signals the capacitor is a short, so $v_{gs} = 0$ and $g_mv_{gs} = 0$. What remains between drain and source is $r_{ds}$: the device is a **resistor $r_{ds}$**, which is an ideal current source when $r_{ds} \to \infty$. This is exactly why "gate at incremental ground" turns a transistor into a current source.

**Pattern:** gate tied to drain → $1/g_m$ (diode). Gate held still for signals → $r_{ds}$ (current source). Gate wired to source → off.`,
    }),
    P({
      id: 'e2p1-2a', src: 'Practice Exam 1 · Problem 2(a) (15 pts)', title: 'Degenerated PMOS diode over a degenerated NMOS', big: true,
      q: md`Determine an expression for the impedance $R_{eq1}$. Assume all transistors are biased in saturation with $g_mr_{ds} \gg 1$ and $r_{ds} \ne \infty$. Box your intermediate answers.`,
      fig: p1fig2(false),
      parts: [X('p1_2a', 'R_{eq1}')],
      hints: [
        md`A test source at the node pushes current two ways: $R_{eq1} = R_{UP}\parallel R_{DN}$.`,
        md`Up: $M_2$ is diode-connected and $R_1$ is in series with it (all the current goes through both). Down: $M_1$'s gate is at incremental ground and $R_S$ degenerates its source.`,
        md`$R_{UP} = R_1 + \dfrac{1}{g_{m2}+g_{ds2}}$, $\;R_{DN} = r_{ds1} + R_S + g_{m1}r_{ds1}R_S$.`,
      ],
      sol: md`
**What to see first:** two canonical blocks meet at the test node, so $R_{eq1} = R_{UP}\parallel R_{DN}$.

**Up: $M_2$ is a diode with $R_1$ in its source.** A diode-connected device looks like $1/g_m \parallel r_{ds} = \dfrac{1}{g_m+g_{ds}}$. Every bit of the test current that goes up passes through both $M_2$ and $R_1$, so they add:
$$R_{UP} = R_1 + \frac{1}{g_{m2} + g_{ds2}} \approx R_1 + \frac{1}{g_{m2}}$$
(Quick proof: $v_{sg2} = v_t - v_T$ with $v_T = iR_1$, and $i = (g_{m2}+g_{ds2})(v_t - v_T)$.)

**Down: $M_1$, gate at incremental ground, $R_S$ in the source.** The impedance scaler:
$$R_{DN} = r_{ds1} + R_S + g_{m1}r_{ds1}R_S \approx r_{ds1}(1 + g_{m1}R_S)$$

**Answer:**
$$R_{eq1} = \Big[R_1 + \tfrac{1}{g_{m2}+g_{ds2}}\Big] \parallel \big[r_{ds1} + R_S + g_{m1}r_{ds1}R_S\big] \approx \Big(R_1 + \tfrac{1}{g_{m2}}\Big)\parallel r_{ds1}(1+g_{m1}R_S)$$

**Size check:** $R_{DN}$ is huge (about $g_mr_{ds}R_S$), $R_{UP}$ is small (about $R_1$), and the small one wins a parallel: $R_{eq1} \approx R_1 + 1/g_{m2}$.

**Pattern:** a diode on top makes a low-impedance node no matter what sits underneath.`,
    }),
    P({
      id: 'e2p1-2b', src: 'Practice Exam 1 · Problem 2(b) (20 pts)', title: 'The same stack with $M_1$\'s gate on node $T$', big: true,
      q: md`Determine an expression for the impedance $R_{eq2}$ (now $M_1$'s gate is tied to the node $T$ between $R_1$ and $M_2$'s source). Assume saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: p1fig2(true),
      parts: [X('p1_2b', 'R_{eq2}')],
      hints: [
        md`$R_{UP}$ hasn't changed: a gate draws no current. Only $R_{DN}$ changes, because $M_1$'s gate now moves.`,
        md`How far does $T$ move? The test current up through $M_2$ also flows through $R_1$: $v_T = Kv_x$ with $K = \dfrac{R_1}{R_1 + 1/(g_{m2}+g_{ds2})}$.`,
        md`HW 5's rule for a drain whose gate moves by $Kv_x$: $R_{DN} = \dfrac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K}$.`,
      ],
      sol: md`
**What changed:** $M_1$'s gate is tied to node $T$, and $T$ moves when the test voltage moves. $R_{UP}$ is unchanged (the gate draws no current): $R_{UP} = R_1 + \dfrac{1}{g_{m2}+g_{ds2}}$.

**How much does $T$ move?** The current going up through $M_2$ also flows through $R_1$, so $T$ is a divider between the diode and $R_1$:
$$v_T = Kv_x,\qquad K = \frac{R_1}{R_1 + \frac{1}{g_{m2}+g_{ds2}}}\approx \frac{g_{m2}R_1}{1+g_{m2}R_1}$$

**Down: a drain whose gate moves by $Kv_x$** (HW 5's general result). With $v_{gs1} = Kv_x - iR_S$:
$$i = g_{m1}(Kv_x - iR_S) + \frac{v_x - iR_S}{r_{ds1}} \;\Rightarrow\; R_{DN} = \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K} \approx \frac{R_S + 1/g_{m1}}{K}$$

**Answer:**
$$R_{eq2} = \Big[R_1 + \tfrac{1}{g_{m2}+g_{ds2}}\Big]\parallel \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K} \approx \Big(R_1 + \tfrac{1}{g_{m2}}\Big)\parallel \Big(\tfrac{1}{g_{m1}} + R_S\Big)\Big(1 + \tfrac{1}{g_{m2}R_1}\Big)$$

**Intuition:** with the gate held still, $M_1$ is a current source (about $g_mr_{ds}R_S$). Once the gate follows the drain, it behaves like a degenerated **diode** ($1/g_m + R_S$), made a bit bigger by $1/K$ because the gate only follows part of the way. $K = 1$ is a true diode, $K = 0$ the grounded gate.

**Pattern:** "gate moves with the node I'm looking into" → divide the degenerated-drain formula by $1 + g_mr_{ds}K$.`,
    }),
    P({
      id: 'e2p1-3', src: 'Practice Exam 1 · Problem 3 (35 pts)', title: 'Folded cascode: $G_M$, $R_{in}$, $R_{out}$', big: true,
      q: md`Determine expressions for the Norton equivalent transconductance $G_M$, input impedance $R_{in}$, and output impedance $R_{out}$. All transistors are in saturation with $r_{ds} \ne \infty$ and $g_mr_{ds} \gg 1$. (Answer box: $G_M$ is the short-circuit current pulled down out of $v_{out}$ per volt of $v_{in}$, so $A_v = -G_MR_{out}$.)`,
      fig: F.foldedCascode(),
      parts: [
        X('p1_3gm', 'G_M'),
        { lbl: '$R_{in}$', mc: ['$\\infty$: $v_{in}$ only drives a gate', '$1/g_{m1}$', '$r_{ds1}$', '$1/g_{m2}$'], a: 0, why: [null, '$1/g_m$ is what you see looking into a *source*.', '$r_{ds1}$ is between drain and source, not at the gate.', 'That is the impedance at node $X$, not at the input.'] },
        X('p1_3rout', 'R_{out}'),
      ],
      hints: [
        md`Name the blocks. $M_1$: common source, pushes $g_{m1}v_{in}$ into node $X$. $M_2$ (NMOS, gate and drain at incremental ground) seen from its source: $1/g_{m2}\parallel r_{ds2}$. $M_3$: PMOS current source, $r_{ds3}$. $M_4$: PMOS common gate from $X$ to the output.`,
        md`$G_M$: short $v_{out}$. Looking into $M_4$'s source then gives $1/(g_{m4}+g_{ds4})$. The current $g_{m1}v_{in}$ divides between that and $R_X = r_{ds1}\parallel r_{ds3}\parallel(1/g_{m2}\parallel r_{ds2})$.`,
        md`$R_{out} = R_D \parallel$ (looking up into $M_4$'s drain with $R_X$ at its source).`,
      ],
      sol: md`
**What to see first:** a **folded cascode** with a leak.
- $M_1$ is a common-source input: it pulls $g_{m1}v_{in}$ out of node $X$.
- At $X$, besides $M_4$: $M_2$ (NMOS, gate and drain at incremental ground) seen from its source, $1/g_{m2}\parallel r_{ds2}$; $M_3$, a PMOS current source, $r_{ds3}$; and $M_1$'s own $r_{ds1}$. Together $R_X = r_{ds1}\parallel r_{ds3}\parallel\frac{1}{g_{m2}}\parallel r_{ds2} \approx \frac{1}{g_{m2}}$.
- $M_4$ is a PMOS **common gate**: source at $X$, gate at incremental ground, drain is the output.

**$G_M$ (short the output).** Looking into $M_4$'s source with its drain shorted: $\dfrac{1}{g_{m4}+g_{ds4}} \approx \dfrac{1}{g_{m4}}$. The signal current splits between $R_X$ and $M_4$; only $M_4$'s share reaches the output:
$$G_M = g_{m1}\,\frac{R_X}{R_X + \frac{1}{g_{m4}+g_{ds4}}} \approx g_{m1}\frac{1/g_{m2}}{1/g_{m2} + 1/g_{m4}} = \frac{g_{m1}g_{m4}}{g_{m2}+g_{m4}}$$

**$R_{in} = \infty$:** $v_{in}$ only touches a gate.

**$R_{out}$:** $R_D$ in parallel with $M_4$'s drain, which has $R_X$ at its source (impedance scaler):
$$R_{out} = R_D \parallel \big[r_{ds4} + R_X(1 + g_{m4}r_{ds4})\big] \approx R_D \parallel r_{ds4}\Big(1 + \frac{g_{m4}}{g_{m2}}\Big)$$

**Sign:** $v_{in}\uparrow$ → $M_1$ pulls more out of $X$ → $X\downarrow$ → $M_4$'s $v_{SG}$ shrinks → less current into $R_D$ → $v_{out}\downarrow$. So $G_M > 0$ in the "pulled down" convention and $A_v = -G_MR_{out} < 0$.

**Pattern:** without $M_2$, all of $g_{m1}v_{in}$ would go into the low-impedance CG source and $G_M = g_{m1}$. A low-impedance load at the folding node steals current in a $1/g_m$ vs $1/g_m$ divider. And the same $1/g_{m2}$ that steals current also kills the cascode boost: $R_{out}$ is only about $2r_{ds4}$, not $g_mr_{ds}^2$.`,
    }),
  ];
  E2.lesson('e2-pracu', { id: 'e2-p1', title: 'Practice Exam 1', kind: 'exam', steps: p1 });

  // ================================================================ Practice Exam 2
  const p2fig1 = [
    ['w', [0, 0], [3.4, 0]], ['rail', [1.7, 0], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['pmos', [0, 1], { n: 'M_5', sz: '2x', flip: true, dc: true }], ['pmos', [2, 1], { n: 'M_4', sz: '2x' }],
    ['R', [0, 2], [0, 3], { n: 'R_1', side: 'l' }], ['w', [0, 3], [1, 3]],
    ['pmos', [2, 3], { n: 'M_3', sz: '8x' }], ['node', [2, 4], { n: 'V_1', side: 'al' }],
    ['w', [3.4, 0], [3.4, 0.7]], ['R', [3.4, 0.7], [3.4, 2.5], { s: '25\\kO' }], ['w', [3.4, 2.5], [3.4, 4], [2, 4]], ['iarr', [3.4, 0.35], 'd', { n: 'I_2', side: 'r' }],
    ['w', [0, 3], [0, 3.5]], ['I', [0, 3.5], [0, 4.9], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [0, 4.9], [0, 6]],
    ['nmos', [2, 5], { n: 'M_2', sz: '2x', flip: true }], ['w', [3, 5], [3, 5.3]], ['V', [3, 5.3], [3, 6.2], { n: 'V_A', side: 'r' }], ['gnd', [3, 6.2]],
    ['iarr', [2, 6], 'd', { n: 'I_1', side: 'r', off: [16, 0] }],
    ['nmos', [0, 7], { n: 'M_0', sz: '1x', flip: true, dc: true }], ['gnd', [0, 8]],
    ['nmos', [2, 7], { n: 'M_1', sz: '2x' }], ['gnd', [2, 8]],
  ];
  const p2fig2 = (b) => [
    ['rail', [0, -0.6]],
    b ? ['I', [0, -0.6], [0, 0.6], { n: 'I_B', side: 'l' }] : ['V', [0, -0.6], [0, 0.6], { n: 'V_A', side: 'l' }],
    ['w', [0, 0.6], [0, 1], [1, 1]], ['node', [0, 0.8], { n: 'N', side: 'l' }],
    ['nmos', [2, 1], { n: 'M_1' }], ['w', [2, 0], [2, -0.4]], ['term', [2, -0.4], { n: `\\downarrow R_{EQ${b ? 2 : 1}}`, side: 'r' }],
    ['nmos', [0, 2], { n: 'M_3', flip: true }], ['gnd', [0, 3]], ['w', [1, 2], [2, 2]], ['node', [2, 2], { n: 'Y', side: 'r' }],
    ['nmos', [2, 3], { n: 'M_2' }], ['w', [1, 3], [1, 3.4]], ['V', [1, 3.4], [1, 4.4], { n: 'V_B', side: 'l' }], ['gnd', [1, 4.4]],
    ['R', [2, 4], [2, 5.2], { n: 'R' }], ['gnd', [2, 5.2]],
  ];
  const p2fig3 = [
    ['w', [1, -1.2], [3, -1.2]], ['rail', [2, -1.2], { n: 'V_{DD}' }],
    ['R', [1, -1.2], [1, 0], { n: 'R_1', side: 'l' }],
    ['pmos', [1, 1], { n: 'M_3', flip: true, dc: true }], ['pmos', [3, 1], { n: 'M_4' }], ['w', [3, -1.2], [3, 0]], ['node', [2, 1], { n: 'v_1', side: 'a' }],
    ['nmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]],
    ['nmos', [1, 5], { n: 'M_1', flip: true }], ['gnd', [1, 6]],
    ['w', [3, 2], [3, 4]], ['w', [3, 3], [3.8, 3]], ['term', [3.8, 3], { n: 'v_{out}', side: 'r' }],
    ['nmos', [3, 5], { n: 'M_5' }], ['R', [3, 6], [3, 7.2], { n: 'R_2' }], ['gnd', [3, 7.2]],
    ['w', [2, 5], [2, 5.6]], ...vac(2, 5.6),
  ];

  const p2 = [
    R(md`
      **60 minutes, 100 points, calculators not allowed** (printed on the cover). ${PARAMS}

      | Problem | Points | What it tests |
      |---|---|---|
      | 1 | 35 | DC: mirrors, a stack, edge of saturation (the Exam 1 skill, still on Exam 2) |
      | 2 | 30 | Drain impedance of a cascode, then of a gain-boosted cascode |
      | 3 | 35 | A gain chain with a second path from $v_{in}$ straight to $v_{out}$ |
    `),
    P({
      id: 'e2p2-1', src: 'Practice Exam 2 · Problem 1 (35 pts)', title: 'Mirrors, a stack, and the edge of saturation', big: true,
      q: md`In the circuit below ($1x = 50/1$) determine: (a) $V_1$, $I_1$, $I_2$ assuming all transistors are biased in saturation (15 pts); (b) the value of $R_1$ such that $M_4$ is biased at the edge of saturation (10 pts); (c) the value of $V_A$ such that $M_1$ is biased at the edge of saturation (10 pts).`,
      fig: p2fig1,
      parts: [{ lbl: 'I_1', unit: 'µA', ans: 200 }, { lbl: 'I_2', unit: 'µA', ans: 100 }, { lbl: 'V_1', unit: 'V', ans: 2.5 }, { lbl: 'R_1', unit: 'kΩ', ans: 1 }, { lbl: 'V_A', unit: 'V', ans: 1.4 }],
      hints: [
        md`Every current is set by a mirror. $M_0$ (diode) carries the $100\,\mu\text{A}$; $M_1$ is twice its size. The same $100\,\mu\text{A}$ flows through $R_1$ and the diode $M_5$; $M_4$ is the same size as $M_5$.`,
        md`KCL at $V_1$: in from $M_3$ plus $I_2$ through the $25\kO$ equals out through $M_2$/$M_1$.`,
        md`Edge of saturation shortcuts: PMOS $V_D = V_G + |V_T|$, NMOS $V_D = V_G - V_T$. For (b), $M_4$'s drain is $M_3$'s source, $V_{G3} + V_{SG3}$.`,
      ],
      sol: md`
**What to see first:** no resistor sets a current here; the mirrors do. Find the currents, then the voltages follow.

**(a)** $M_0$ (diode, $1x$) carries $100\,\mu\text{A}$; $M_1$ ($2x$, same $V_{GS}$) carries **$I_1 = 200\,\mu\text{A}$**. The same $100\,\mu\text{A}$ flows down through $M_5$ and $R_1$; $M_4$ ($2x$, same $V_{SG}$ as $M_5$) carries $100\,\mu\text{A}$, which flows through $M_3$ into node $V_1$. KCL at $V_1$:
$$100\,\mu\text{A} + I_2 = I_1 = 200\,\mu\text{A} \;\Rightarrow\; I_2 = 100\,\mu\text{A},\quad V_1 = 5 - (25\kO)(100\,\mu\text{A}) = 2.5\,\text{V}$$

**(b)** $2x$ PMOS: $K = \tfrac12(50\mu)(100) = 2.5\,\text{mA/V}^2$, so at $100\,\mu\text{A}$, $V_{ov} = 0.2\,\text{V}$. $M_5$: $V_{SG} = 1.2\,\text{V}$, so the shared gate of $M_5$/$M_4$ sits at $3.8\,\text{V}$. PMOS edge of saturation: $V_{D4} = V_{G4} + |V_T| = 4.8\,\text{V}$.

$V_{D4}$ is $M_3$'s source. $M_3$ is $8x$: $K = 10\,\text{mA/V}^2$, $V_{ov3} = 0.1\,\text{V}$, $V_{SG3} = 1.1\,\text{V}$. Its gate is the bottom of $R_1$: $3.8 - (100\,\mu\text{A})R_1$. So
$$4.8 = 3.8 - (100\,\mu\text{A})R_1 + 1.1 \;\Rightarrow\; R_1 = 1\kO$$

**(c)** $M_0$: $1x$ at $100\,\mu\text{A}$ gives $V_{ov} = 0.2$, $V_{GS} = 1.2\,\text{V}$, the gate of $M_1$ too. NMOS edge: $V_{D1} = V_{G1} - V_T = 0.2\,\text{V}$. That is $M_2$'s source; $M_2$ ($2x$ at $200\,\mu\text{A}$, $V_{ov} = 0.2$) needs $V_{GS2} = 1.2$, so **$V_A = 1.4\,\text{V}$**.

**Pattern:** mirror ⇒ same $V_{GS}$, current ∝ size. Series ⇒ same current, $V_{ov} \propto 1/\sqrt{\text{size}}$ (the $8x$ device needs half the overdrive of the $2x$). Edge of saturation compares drain to gate, never source.`,
    }),
    P({
      id: 'e2p2-2a', src: 'Practice Exam 2 · Problem 2(a) (15 pts)', title: 'Cascode on a degenerated current source', big: true,
      q: md`Determine an expression for $R_{EQ1}$. All transistors are in saturation with $g_mr_{ds} \gg 1$; you may **not** assume $r_{ds} = \infty$.`,
      fig: p2fig2(false),
      parts: [X('p2_2a', 'R_{EQ1}')],
      hints: [
        md`Node $N$ is $V_{DD} - V_A$: a DC voltage, so $M_1$'s gate is at incremental ground. $M_3$'s drain only touches that DC node; $M_3$ drops out.`,
        md`Below $M_1$: $M_2$ with its gate at $V_B$ and $R$ at its source. $R_Y = r_{ds2} + R + g_{m2}r_{ds2}R$.`,
        md`Then $M_1$ scales $R_Y$ up once more: $R_{EQ1} = r_{ds1} + R_Y(1 + g_{m1}r_{ds1})$.`,
      ],
      sol: md`
**What to see first:** the voltage source $V_A$ pins node $N$ at the DC voltage $V_{DD} - V_A$, so **$M_1$'s gate is an incremental ground**. $M_3$'s drain current flows into that ideal source and changes nothing else: $M_3$ drops out of the small-signal picture.

**Bottom:** $M_2$, gate at $V_B$ (incremental ground), $R$ at its source:
$$R_Y = r_{ds2} + R + g_{m2}r_{ds2}R \approx r_{ds2}(1 + g_{m2}R)$$

**Top:** $M_1$ is a grounded-gate device with $R_Y$ at its source. Same formula again:
$$R_{EQ1} = r_{ds1} + R_Y(1 + g_{m1}r_{ds1}) \approx g_{m1}r_{ds1}\,r_{ds2}(1 + g_{m2}R)$$

**Pattern:** every grounded-gate device stacked on top multiplies the resistance below it by about $g_mr_{ds}$. That's the whole point of a cascode.`,
    }),
    P({
      id: 'e2p2-2b', src: 'Practice Exam 2 · Problem 2(b) (15 pts)', title: 'Gain-boosted (regulated) cascode', big: true,
      q: md`Determine an expression for $R_{EQ2}$: the same circuit with $V_A$ replaced by a current source $I_B$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: p2fig2(true),
      parts: [X('p2_2b', 'R_{EQ2}')],
      hints: [
        md`$I_B$ is an open circuit for signals. Node $N$ is now set by $M_3$ alone: a common-source stage (gate at $Y$) whose only load is its own $r_{ds3}$.`,
        md`So $v_{g1} = -Av_Y$ with $A = g_{m3}r_{ds3}$. Redo the drain-impedance KCL with $v_{gs1} = -Av_Y - v_Y$.`,
        md`Result: $R_{EQ2} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y$.`,
      ],
      sol: md`
**What changed:** $I_B$ is an ideal current source, an **open circuit** for signals, so node $N$ is no longer held. Its voltage is set by $M_3$: a common-source amplifier with input at $Y$ and load $r_{ds3}$ only:
$$v_{g1} = -Av_Y,\qquad A = g_{m3}r_{ds3}$$

**KCL looking into $M_1$'s drain** ($R_Y$ as in part (a), $v_Y = iR_Y$):
$$i = g_{m1}(-Av_Y - v_Y) + \frac{v_x - v_Y}{r_{ds1}} \;\Rightarrow\; R_{EQ2} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y$$
$$R_{EQ2} \approx (g_{m1}r_{ds1})(g_{m3}r_{ds3})\,r_{ds2}(1 + g_{m2}R)$$

**Intuition:** $M_3$ is a watchdog on node $Y$. If a test voltage tries to push $Y$ up, $M_3$ yanks $M_1$'s gate down hard, which chokes $M_1$'s current. $Y$ barely moves, so the current barely moves: one more factor of $g_mr_{ds}$. This is the **gain-boosted (regulated) cascode**.

**Pattern:** the cascode multiplier is really $g_{m1}r_{ds1}(1 + A)$, where $A$ is the gain from $M_1$'s source to its gate (inverted). $A = 0$ for a plain cascode.`,
    }),
    P({
      id: 'e2p2-3', src: 'Practice Exam 2 · Problem 3 (35 pts)', title: 'Two stages, plus a direct path through $M_5$', big: true,
      q: md`Determine expressions for the incremental gains $A_1 = v_1/v_{in}$ (10 pts), $A_2 = v_{out}/v_1$ (10 pts), and $A_v = v_{out}/v_{in}$ (15 pts). Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$. (Box for $A_2$: the second stage on its own, with $M_5$'s gate held still; see the solution.)`,
      fig: p2fig3,
      parts: [X('p2_3a1', 'A_1'), X('p2_3a2', 'A_2'), X('p2_3av', 'A_v')],
      hints: [
        md`Left branch: $M_1$ (CS) with cascode $M_2$ on top; the load is $M_3$, a diode with $R_1$ in its source: $R_{UP} = R_1 + 1/(g_{m3}+g_{ds3})$. The cascode's output resistance is huge, so $A_1 \approx -g_{m1}R_{UP}$.`,
        md`Output node: $M_4$ (PMOS CS, gate at $v_1$) pushes current in; $M_5$ (degenerated NMOS CS, gate at $v_{in}$) pulls current out. $R_{out} = r_{ds4}\parallel(r_{ds5} + R_2 + g_{m5}r_{ds5}R_2)$.`,
        md`Superposition: $v_{out} = (-g_{m4}v_1 - G_{m5}v_{in})R_{out}$ with $G_{m5} = \dfrac{g_{m5}}{1 + (g_{m5}+g_{ds5})R_2}$.`,
      ],
      sol: md`
**What to see first:** the left branch is a **cascode CS stage** ($M_1$ input, $M_2$ cascode) loaded by **$M_3$, a diode with $R_1$ in its source**. $M_4$ copies $M_3$'s gate voltage $v_1$ (a PMOS common-source stage on the right). $M_5$ is a **degenerated CS stage driven straight from $v_{in}$**: a second path to the output.

**$A_1$.** Cascode: $G_{M,c} = \dfrac{g_{m1}r_{ds1}(1+g_{m2}r_{ds2})}{r_{ds1}+r_{ds2}+g_{m2}r_{ds1}r_{ds2}} \approx g_{m1}$, $R_c = r_{ds1}+r_{ds2}+g_{m2}r_{ds1}r_{ds2}$ (huge). Load $R_{UP} = R_1 + \dfrac{1}{g_{m3}+g_{ds3}}$:
$$A_1 = -G_{M,c}\,(R_c\parallel R_{UP}) \approx -g_{m1}\Big(R_1 + \frac{1}{g_{m3}}\Big)$$

**$A_2$.** The output node sees $R_{out} = r_{ds4}\parallel\big(r_{ds5} + R_2 + g_{m5}r_{ds5}R_2\big)$. $M_4$ alone (gate at $v_1$, source at $V_{DD}$) is a plain CS stage:
$$A_2 = -g_{m4}R_{out} \approx -g_{m4}\big[r_{ds4}\parallel r_{ds5}(1+g_{m5}R_2)\big]$$

**$A_v$.** Add both currents into the output node, then multiply by $R_{out}$:
$$A_v = A_1A_2 - G_{m5}R_{out} \approx \Big[g_{m1}g_{m4}\Big(R_1 + \frac{1}{g_{m3}}\Big) - \frac{g_{m5}}{1+g_{m5}R_2}\Big]\big(r_{ds4}\parallel r_{ds5}(1+g_{m5}R_2)\big)$$

**Signs:** $v_{in}\uparrow$ → $v_1\downarrow$ → $M_4$ pushes *more* into $v_{out}$ ($\uparrow$). Meanwhile $M_5$ pulls *more* out ($\downarrow$). The paths fight; the $M_4$ path normally wins because it has the gain $A_1$ in front of it.

!!trap Read $A_2$ carefully
$v_{out}$ depends on $v_{in}$ directly through $M_5$, so the literal ratio $v_{out}/v_1$ is just $A_v/A_1$. The intended split is superposition: $A_2$ is the second stage on its own, and $M_5$'s path is added separately. Write down which one you mean.

**Pattern:** when the input reaches a node by two routes, write each route as a current into that node, add, then multiply by the node's resistance.`,
    }),
  ];
  E2.lesson('e2-pracu', { id: 'e2-p2', title: 'Practice Exam 2', kind: 'exam', steps: p2 });

  // ================================================================ Practice Exam 3
  const p3fig1 = [
    ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: 'V_{DD}' }],
    ['pmos', [1, 1], { n: 'M_3', flip: true, dc: true }], ['pmos', [3, 1], { n: 'M_5' }],
    ['pmos', [1, 3], { n: 'M_2', flip: true, dc: true }], ['pmos', [3, 3], { n: 'M_4' }],
    ['w', [3, 4], [3.8, 4]], ['term', [3.8, 4], { n: 'v_{out}', side: 'r' }], ['R', [3, 4], [3, 5.2], { n: 'R_L' }], ['gnd', [3, 5.2]],
    ['nmos', [1, 5], { n: 'M_1' }], ['gnd', [1, 6]],
    ['w', [0, 5], [-0.5, 5], [-0.5, 5.3]], ['Vac', [-0.5, 5.3], [-0.5, 6.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.5, 6.3], [-0.5, 7.3], { n: 'V_B', side: 'l' }], ['gnd', [-0.5, 7.3]],
  ];
  const p3fig2 = [
    ['w', [0, 0], [6, 0]], ['rail', [3, 0], { n: 'V_{DD}' }],
    ['pmos', [0, 1], { n: 'M_5', flip: true }], ['pmos', [2, 1], { n: 'M_3', dc: true }],
    ['pmos', [4, 1], { n: 'M_4', flip: true, dc: true }], ['pmos', [6, 1], { n: 'M_6' }],
    ['w', [2, 2], [2.7, 2]], ['term', [2.7, 2], { n: 'v_{o1}', side: 'a' }],
    ['nmos', [2, 3], { n: 'M_1' }], ['gnd', [2, 4]],
    ['w', [4, 2], [3.3, 2]], ['term', [3.3, 2], { n: 'v_{o2}', side: 'a' }],
    ['nmos', [4, 3], { n: 'M_2' }], ['acg', [3, 3]],
    ['w', [1, 3], [1, 4.9]], ['Vac', [1, 4.9], [1, 5.7], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 5.7]],
    ['w', [1, 4.9], [1.6, 4.9]], ['R', [1.6, 4.9], [3.2, 4.9], { n: 'R' }], ['w', [3.2, 4.9], [4, 4.9], [4, 4]],
    ['w', [0, 2], [0, 6.4]], ['nmos', [0, 7.4], { n: 'M_7', flip: true, dc: true }], ['gnd', [0, 8.4]],
    ['w', [1, 7.4], [5, 7.4]], ['nmos', [6, 7.4], { n: 'M_8' }], ['gnd', [6, 8.4]],
    ['w', [6, 2], [6, 6.4]], ['w', [6, 4], [6.8, 4]], ['term', [6.8, 4], { n: 'v_o', side: 'r' }],
  ];
  const p3fig3 = (b) => b ? [
    ['rail', [0.6, 0]], ['rail', [2.6, 0]],
    ['pmos', [0.6, 1], { n: 'M_3', flip: true, dc: true }], ['pmos', [2.6, 1], { n: 'M_4' }],
    ['nmos', [0.6, 3], { n: 'M_1' }], ['acg', [-0.4, 3]], ['nmos', [2.6, 3], { n: 'M_2', flip: true }], ['acg', [3.6, 3]],
    ['w', [2.6, 2], [3.6, 2]], lookR([3.6, 2], 'R_{EQ2}'),
    ['w', [0.6, 4], [2.6, 4]], ['I', [1.6, 4], [1.6, 5.2]], ['gnd', [1.6, 5.2]],
  ] : [
    ['rail', [0.6, 0]], ['rail', [3.4, 0]],
    ['pmos', [0.6, 1], { n: 'M_3', flip: true }], ['acg', [1.6, 1]], ['pmos', [3.4, 1], { n: 'M_4' }], ['acg', [2.4, 1]],
    ['nmos', [0.6, 3], { n: 'M_1' }], ['acg', [-0.4, 3]], ['nmos', [3.4, 3], { n: 'M_2', flip: true }], ['acg', [4.4, 3]],
    ['w', [3.4, 2], [4.4, 2]], lookR([4.4, 2], 'R_{EQ1}'),
    ['w', [0.6, 4], [3.4, 4]], ['I', [2, 4], [2, 5.2]], ['gnd', [2, 5.2]],
  ];

  const p3 = [
    R(md`
      **60 minutes, 100 points.** No calculator rule is printed on this paper. ${PARAMS}

      | Problem | Points | What it tests |
      |---|---|---|
      | 1 | 20 (cover says 30) | A number: CS input into a cascode current mirror |
      | 2 | 40 | Three gains: a CS half and a CG half, mirrored to one output |
      | 3 | 30 (cover says 30, page splits 20 + 10) | Output impedance of a differential pair, without and with a mirror load |
    `),
    P({
      id: 'e2p3-1', src: 'Practice Exam 3 · Problem 1 (20 pts)', title: 'CS input into a cascode mirror', big: true,
      q: md`Determine the numerical value of $A_V = v_{out}/v_{in}$. $W/L$ of $M_1$ is $500/1$, all PMOS are $1000/1$, and $V_B = 1.2\,\text{V}$. Ignore $r_{ds}$. ($R_L$ has no value on the sheet: give $g_{m1}$, then $A_V$ as an expression in $R_L$, in ohms.)`,
      fig: p3fig1,
      parts: [{ lbl: 'g_{m1}', unit: 'mA/V', ans: 10 }, { lbl: 'g_{m,PMOS}', unit: 'mA/V', ans: 10 }, E2.ex('RL/100', ['RL'], 'A_V', { ranges: { RL: [500, 10000] } })],
      hints: [
        md`$V_{GS1} = 1.2\,\text{V}$ sets $M_1$'s current. Everything above $M_1$ is a mirror: $M_3/M_2$ are a diode stack, $M_5/M_4$ copy the current to $R_L$.`,
        md`$M_5$ is the same size as $M_3$, so the mirror ratio is 1, and the cascode $M_4$ passes current unchanged.`,
        md`Which way does $v_{out}$ move when $v_{in}$ rises?`,
      ],
      sol: md`
**What to see first:** $M_1$ is the only device with signal on its gate. Everything above it is a **cascode current mirror**: $M_3$ and $M_2$ are a diode-connected stack, $M_5$ copies $M_3$'s current and $M_4$ (gate on $M_2$'s gate) cascodes it into $R_L$. So: a transconductor ($M_1$) feeding a current mirror, output = current × $R_L$.

**DC.** $V_{ov1} = 1.2 - 1 = 0.2\,\text{V}$, $I_D = \tfrac12(100\mu)(500)(0.2)^2 = 1\,\text{mA}$, $g_{m1} = 2I_D/V_{ov} = 10\,\text{mA/V}$. Each PMOS: $K = \tfrac12(50\mu)(1000) = 25\,\text{mA/V}^2$, so at $1\,\text{mA}$, $V_{ov} = 0.2\,\text{V}$ and $g_m = 10\,\text{mA/V}$.

**Small signal.** $i_{d1} = g_{m1}v_{in}$ flows through the diode stack; $M_5$ copies it with ratio $g_{m5}/g_{m3} = 1$; $M_4$ passes it unchanged (a cascode carries current, it doesn't change it). That current flows *into* $R_L$:
$$A_V = +g_{m1}R_L = \frac{R_L}{100\,\Omega}\qquad(R_L = 1\kO \Rightarrow A_V = +10)$$

**Sign:** $v_{in}\uparrow$ → $M_1$ draws more → the mirror sources more into $R_L$ → $v_{out}\uparrow$. Non-inverting.

**Note:** $R_L$ has no value on the printed sheet; the answer is $g_{m1}R_L$ for whatever $R_L$ was intended.

**Pattern:** a mirror carries signal *current* with gain = size ratio and no inversion. A CS stage into a mirror is a non-inverting transconductor.`,
    }),
    P({
      id: 'e2p3-2', src: 'Practice Exam 3 · Problem 2 (40 pts)', title: 'A CS half and a CG half, mirrored to one output', big: true,
      q: md`Determine expressions for $A_{v1} = v_{o1}/v_{in}$ (10 pts), $A_{v2} = v_{o2}/v_{in}$ (10 pts), and $A_v = v_o/v_{in}$ (20 pts). Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$. ($v_o$ is not labelled on the sheet; it is the node joining $M_6$ and $M_8$.)`,
      fig: p3fig2,
      parts: [X('p3_2av1', 'A_{v1}'), X('p3_2av2', 'A_{v2}'), X('p3_2av', 'A_v')],
      hints: [
        md`$v_{in}$ drives $M_1$ as a common source and $M_2$ as a common gate (through $R$ into its source). Both have diode-connected PMOS loads ($M_3$, $M_4$).`,
        md`$A_{v1} = -g_{m1}(1/g_{m3}\parallel r_{ds3}\parallel r_{ds1})$. For $A_{v2}$: the current into $M_2$'s source is $v_{in}/(R + 1/g_{m2})$ and it flows into the $1/g_{m4}$ diode.`,
        md`At $v_o$: $M_6$ copies $M_4$'s current change ($-g_{m6}v_{o2}$ in); $M_8$ copies $M_7$'s, which copies $M_5$'s, which copies $M_3$'s. Add the two currents into $v_o$ and multiply by $r_{ds6}\parallel r_{ds8}$.`,
      ],
      sol: md`
**What to see first:** $v_{in}$ drives two half-circuits at once. **$M_1$: common source** (gate input). **$M_2$: common gate** (gate at incremental ground, input through $R$ into its source). Each has a **diode-connected PMOS load** ($M_3$, $M_4$), and each diode's voltage is **copied by a mirror** ($M_5$ from $M_3$, $M_6$ from $M_4$). $M_7$/$M_8$ is an NMOS mirror that turns $M_5$'s current around so both copies land on $v_o$.

**$A_{v1}$ (CS with diode load):**
$$A_{v1} = -g_{m1}\Big(\frac{1}{g_{m3}}\parallel r_{ds3}\parallel r_{ds1}\Big) \approx -\frac{g_{m1}}{g_{m3}}$$

**$A_{v2}$ (CG with source resistance $R$).** The signal current entering $M_2$'s source is $\dfrac{v_{in}}{R + 1/(g_{m2}+g_{ds2})}$ and it comes out of the drain into the load $\frac{1}{g_{m4}}\parallel r_{ds4}\parallel(r_{ds2} + R + g_{m2}r_{ds2}R)$:
$$A_{v2} = \frac{\frac{1}{g_{m4}}\parallel r_{ds4}\parallel(r_{ds2} + R + g_{m2}r_{ds2}R)}{R + \frac{1}{g_{m2}+g_{ds2}}} \approx \frac{1/g_{m4}}{R + 1/g_{m2}}\quad(\text{positive})$$

**$A_v$.** Currents into $v_o$: $M_6$ adds $-g_{m6}v_{o2}$; $M_8$ pulls $g_{m8}v_m$, where $v_m$ is the voltage on the diode $M_7$ driven by $M_5$'s current $-g_{m5}v_{o1}$: $v_m = \dfrac{-g_{m5}v_{o1}}{g_{m7}+g_{ds7}+g_{ds5}}$. So
$$A_v = \Big[-g_{m6}A_{v2} + \frac{g_{m8}g_{m5}A_{v1}}{g_{m7}+g_{ds7}+g_{ds5}}\Big](r_{ds6}\parallel r_{ds8}) \approx -(r_{ds6}\parallel r_{ds8})\Big[\frac{g_{m6}}{g_{m4}}\cdot\frac{1}{R + 1/g_{m2}} + \frac{g_{m1}g_{m5}g_{m8}}{g_{m3}g_{m7}}\Big]$$
With 1:1 mirrors: $A_v \approx -(r_{ds6}\parallel r_{ds8})\Big(g_{m1} + \dfrac{1}{R + 1/g_{m2}}\Big)$.

**Sign check:** $v_{in}\uparrow$: $M_1$'s current $\uparrow$ → $M_5\uparrow$ → $M_7\uparrow$ → $M_8$ pulls more out of $v_o$ ($\downarrow$). $M_2$'s source rises → its current $\downarrow$ → $M_4$, $M_6\downarrow$ → less pushed into $v_o$ ($\downarrow$). Both routes pull $v_o$ down: they **add**.

**Pattern:** write each branch's *current* change, carry it through the mirrors (ratio $g_{m,copy}/g_{m,diode}$), add at the output node, multiply by that node's resistance.`,
    }),
    P({
      id: 'e2p3-3a', src: 'Practice Exam 3 · Problem 3(a) (20 pts)', title: 'Differential pair, current-source loads', big: true,
      q: md`Determine an expression for $R_{EQ1}$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$. The tail current source is ideal. (Answer box: take the pair matched, $M_2 = M_1$ and $M_4 = M_3$, and answer in $r_{ds1}$, $r_{ds3}$.)`,
      fig: p3fig3(false),
      parts: [X('p3_3a', 'R_{EQ1}')],
      hints: [
        md`The ideal tail is an open circuit for signals, so the shared source node $P$ connects only $M_1$ and $M_2$. $R_{UP} = r_{ds4}$.`,
        md`Looking down into $M_2$'s drain, its source sees $M_1$ from *its* source, with $r_{ds3}$ at $M_1$'s drain: $R_P = \dfrac{r_{ds1} + r_{ds3}}{1 + g_{m1}r_{ds1}}$.`,
        md`Then $R_{DN} = r_{ds2} + R_P(1 + g_{m2}r_{ds2})$, which for a matched pair is exactly $2r_{ds1} + r_{ds3}$.`,
      ],
      sol: md`
**What to see first:** the tail is an ideal current source, so for signals the joined sources $P$ touch only $M_1$ and $M_2$. All gates are at incremental ground, so $M_3$, $M_4$ are current sources.

**Up:** $R_{UP} = r_{ds4}$.

**Down:** look into $M_2$'s drain; its source sits on $R_P$, which is $M_1$ seen from its source (a CG stage with load $r_{ds3}$ at its drain):
$$R_P = \frac{r_{ds1} + r_{ds3}}{1 + g_{m1}r_{ds1}} \approx \frac{1}{g_{m1}} + \frac{r_{ds3}}{g_{m1}r_{ds1}}$$
$$R_{DN} = r_{ds2} + R_P(1 + g_{m2}r_{ds2}) = r_{ds2} + \frac{(1+g_{m2}r_{ds2})(r_{ds1}+r_{ds3})}{1+g_{m1}r_{ds1}}$$

**Matched pair** ($M_2 = M_1$): the fraction is exactly $r_{ds1} + r_{ds3}$, so
$$R_{EQ1} = r_{ds4}\parallel\big(r_{ds2} + r_{ds1} + r_{ds3}\big) = r_{ds3}\parallel(2r_{ds1} + r_{ds3})\quad\Big(= \tfrac34 r_{ds}\text{ if all equal}\Big)$$

**Intuition:** seen from $M_1$'s source, the load $r_{ds3}$ looks $g_mr_{ds}$ times *smaller*; seen from $M_2$'s drain, $R_P$ looks $g_mr_{ds}$ times *bigger*. The two scalings cancel and every $r_{ds}$ in the path shows up about 1:1 (Lecture 17's "impedance scaler", used twice).`,
    }),
    P({
      id: 'e2p3-3b', src: 'Practice Exam 3 · Problem 3(b) (10 pts)', title: 'Differential pair, mirror load', big: true,
      q: md`Determine an expression for $R_{EQ2}$: the same pair with $M_3$ diode-connected and $M_4$ mirroring it. (Answer box: matched pair, $M_2 = M_1$, $M_4 = M_3$; answer in $g_{m1}$, $r_{ds1}$, $g_{m3}$, $r_{ds3}$.)`,
      fig: p3fig3(true),
      parts: [X('p3_3b', 'R_{EQ2}')],
      hints: [
        md`A test current into the output splits: through $r_{ds4}$, and down a chain $M_2 \to P \to M_1 \to$ node $A$ (the diode $M_3$, $R_A = 1/(g_{m3}+g_{ds3})$).`,
        md`The chain current $i_c$ raises $v_A$ by $i_cR_A$, so $M_4$ (same gate) sources $g_{m4}R_Ai_c \approx i_c$ *less* into the output. The mirror pulls a second copy of $i_c$.`,
        md`$R_{EQ2} = r_{ds4}\parallel\dfrac{R_{chain}}{1 + g_{m4}R_A}$, with $R_{chain} \approx 2r_{ds1}$ for a matched pair.`,
      ],
      sol: md`
**What to see first:** a **differential pair with a current-mirror load**, inputs at incremental ground. Expect the textbook answer $r_{ds2}\parallel r_{ds4}$; here's why.

**Trace a test current.** From the output it can go through $r_{ds4}$, or down the chain $M_2 \to P \to M_1 \to A$, where $A$ is the diode $M_3$: $R_A = \dfrac{1}{g_{m3}+g_{ds3}}$. The chain resistance is part (a)'s formula with $r_{ds3}$ replaced by $R_A$:
$$R_{chain} = r_{ds2} + \frac{(1+g_{m2}r_{ds2})(r_{ds1}+R_A)}{1+g_{m1}r_{ds1}} = 2r_{ds1} + R_A\ \ (\text{matched})$$

**The mirror doubles it.** The chain current $i_c$ flows into the diode and raises $v_A$ by $i_cR_A$. $M_4$ shares that gate, so it sources $g_{m4}R_Ai_c \approx i_c$ *less* into the output: from the test source's point of view, a second copy of $i_c$ is pulled out.
$$i_x = \frac{v_x}{r_{ds4}} + i_c(1 + g_{m4}R_A)\;\Rightarrow\; R_{EQ2} = r_{ds4}\parallel\frac{R_{chain}}{1 + g_{m4}R_A}$$
Matched: $1 + g_{m3}R_A \approx 2$, so $R_{EQ2} \approx r_{ds3}\parallel r_{ds1}$, that is **$r_{ds2}\parallel r_{ds4}$**.

**Pattern:** the chain through the pair is about $2r_{ds}$, and the mirror makes the output carry twice the chain current: $2r_{ds}/2 = r_{ds}$. That's the famous $R_{out} = r_{ds2}\parallel r_{ds4}$ of a mirror-loaded pair.`,
    }),
  ];
  E2.lesson('e2-pracu', { id: 'e2-p3', title: 'Practice Exam 3', kind: 'exam', steps: p3 });

  // ================================================================ Practice Exam 4
  const p4fig1 = [
    ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: '10\\,\\text{V}' }],
    ['I', [1, 0], [1, 1.2], { s: '1\\,\\text{mA}', side: 'l' }],
    ['nmos', [1, 2.2], { n: 'M_2', flip: true, dc: true }], ['gnd', [1, 3.2]],
    ['nmos', [3, 2.2], { n: 'M_1' }], ['gnd', [3, 3.2]],
    ['R', [3, 0], [3, 1.2], { s: '2\\,\\text{k}' }],
    ['w', [3, 1.2], [3.3, 1.2]], ['C', [3.3, 1.2], [4.1, 1.2], { n: '\\infty' }], ['w', [4.1, 1.2], [4.8, 1.2]],
    ['R', [4.8, 1.2], [4.8, 2.4], { s: '2\\,\\text{k}' }], ['gnd', [4.8, 2.4]], ['w', [4.8, 1.2], [5.4, 1.2]], ['term', [5.4, 1.2], { n: 'v_{out}', side: 'r' }],
    ['w', [1, 1.2], [0.6, 1.2]], ['C', [0.6, 1.2], [-0.2, 1.2], { n: '\\infty' }], ['R', [-0.2, 1.2], [-1.6, 1.2], { s: '100\\,\\Omega' }],
    ['w', [-1.6, 1.2], [-1.8, 1.2], [-1.8, 1.6]], ...vac(-1.8, 1.6),
  ];
  const p4fig2 = (b) => [
    ['w', [0, 0], [3, 0]], ['rail', [1.5, 0]],
    ['pmos', [0, 1], { n: 'M_4', flip: true, dc: true }], ['pmos', [3, 1], { n: 'M_5' }],
    b ? ['w', [1, 1], [2, 1]] : ['acg', [2, 1]],
    ['w', [0, 2], [4.6, 2]], ['term', [4.6, 2], { n: 'v_{out}', side: 'r' }],
    ['R', [0, 2], [0, 3.2], { n: 'R_1', side: 'l' }], ['nmos', [0, 4.2], { n: 'M_1' }], ['gnd', [0, 5.2]],
    ['w', [2, 2], [2, 3.2]], ['nmos', [2, 4.2], { n: 'M_2' }], ['R', [2, 5.2], [2, 6.4], { n: 'R_2' }], ['V', [2, 6.4], [2, 7.4], { n: 'V_B', side: 'l' }], ['gnd', [2, 7.4]],
    ['w', [4, 2], [4, 3.2]], ['nmos', [4, 4.2], { n: 'M_3' }], ['I', [4, 5.2], [4, 6.4], { n: 'I_B' }], ['gnd', [4, 6.4]],
    ['w', [-1, 4.2], [-1, 3.6], [3, 3.6], [3, 4.2], { hops: [0, 2] }], ['w', [1, 3.6], [1, 4.2]],
    ['w', [-1, 4.2], [-1.6, 4.2], [-1.6, 4.6]], ...vac(-1.6, 4.6),
  ];
  const p4fig3 = (b) => {
    const x5 = b ? 3 : 3.6;
    return [
      ['rail', [1, 0]], ['pmos', [1, 1], { n: 'M_3' }], ['acg', [0, 1]],
      ['node', [1, 2], { n: 'T', side: 'al' }], ['pmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]],
      ['node', [1, 4], { n: 'B', side: 'l' }], ['nmos', [1, 5], { n: 'M_1', flip: true, dc: true }], ['R', [1, 6], [1, 7.2], { n: 'R_1', side: 'l' }], ['gnd', [1, 7.2]],
      ['w', [1, 2], [x5, 2]], ['pmos', [x5, 3], { n: 'M_4' }], ['acg', [x5 - 1, 3]],
      ['nmos', [x5, 5], { n: 'M_5' }], ...(b ? [] : [['acg', [x5 - 1, 5]]]),
      ['R', [x5, 6], [x5, 7.2], { n: 'R_5' }], ['gnd', [x5, 7.2]],
      ['w', [x5, 4], [x5 + 0.9, 4]], lookR([x5 + 0.9, 4], b ? 'R_{EQ2}' : 'R_{EQ1}'),
    ];
  };

  const p4 = [
    R(md`
      **60 minutes, 100 points.** No calculator rule is printed on this paper. ${PARAMS}

      | Problem | Points | What it tests |
      |---|---|---|
      | 1 | 20 (cover says 30) | A number: a diode-connected input divider into a CS stage |
      | 2 | 30 | Short-circuit $G_M$ of three branches in parallel (and why the load doesn't matter) |
      | 3 | 40 | Output impedance of a folded stack, without and with a mirror feeding back |
    `),
    P({
      id: 'e2p4-1', src: 'Practice Exam 4 · Problem 1 (20 pts)', title: 'Diode-connected input, mirrored CS output', big: true,
      q: md`Determine the numerical value of $A_V = v_{out}/v_{in}$. $M_1$ and $M_2$ are both $W/L = 500/1$. Ignore $r_{ds}$.`,
      fig: p4fig1,
      parts: [{ lbl: 'g_m', unit: 'mA/V', ans: 10 }, { lbl: 'A_V', unit: '', ans: -5 }],
      hints: [
        md`DC: the $1\,\text{mA}$ goes into the diode $M_2$; $M_1$ mirrors it. Find $V_{ov}$ and $g_m$.`,
        md`Small signal: the $1\,\text{mA}$ source is open and the capacitors are shorts. At the gate node, $100\,\Omega$ meets the diode's $1/g_{m2}$: a divider.`,
        md`$M_1$ is a CS stage with load $2\,\text{k}\parallel2\,\text{k}$.`,
      ],
      sol: md`
**What to see first:** capacitors are shorts for signal, opens for DC; the $1\,\text{mA}$ source is an open for signal. $M_2$ is **diode-connected**, $M_1$ **mirrors** it.

**DC.** Both carry $1\,\text{mA}$ (equal sizes). $K = \tfrac12(100\mu)(500) = 25\,\text{mA/V}^2$, $V_{ov} = \sqrt{1/25} = 0.2\,\text{V}$, $g_m = \dfrac{2(1\,\text{mA})}{0.2\,\text{V}} = 10\,\text{mA/V}$, so $1/g_m = 100\,\Omega$. $M_1$'s drain sits at $10 - 2\,\text{k}\times1\,\text{mA} = 8\,\text{V}$ (no DC flows through the output capacitor): saturated.

**Input divider.** $v_{in}$ → $100\,\Omega$ → the diode ($1/g_{m2} = 100\,\Omega$ to ground):
$$v_g = v_{in}\frac{100}{100 + 100} = \frac{v_{in}}{2}$$

**Output.** $M_1$ is a CS stage; its drain sees $2\,\text{k}$ (to $V_{DD}$, an incremental ground) in parallel with the $2\,\text{k}$ load: $1\kO$.
$$v_{out} = -g_{m1}(1\kO)\,v_g = -10\,v_g \;\Rightarrow\; A_V = -10\times\tfrac12 = -5$$

**Pattern:** a diode-connected device at the input is just a resistor $1/g_m$, and it forms a divider with the source resistance. The mirror then turns that voltage into $g_m v_g$ at the output.`,
    }),
    P({
      id: 'e2p4-2a', src: 'Practice Exam 4 · Problem 2(a) (20 pts)', title: 'Short-circuit $G_M$: three branches in parallel', big: true,
      q: md`Determine an expression for the Norton (short-circuit) transconductance $G_M$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$. ($G_M$ = current pulled down out of the shorted $v_{out}$ per volt of $v_{in}$.)`,
      fig: p4fig2(false),
      parts: [X('p4_2', 'G_M')],
      hints: [
        md`Short $v_{out}$ to incremental ground. Anything that only connects to $v_{out}$ and to incremental grounds ($M_4$, $M_5$) now carries no signal current.`,
        md`Three branches pull current out of the shorted node: $M_1$ through $R_1$, $M_2$ with $R_2$ in its source, $M_3$ with an ideal current source in its source.`,
        md`$M_1$: Norton $g_{m1}v_{in}$ with $r_{ds1}$, divided into $R_1$. $M_2$: $\dfrac{g_{m2}}{1+(g_{m2}+g_{ds2})R_2}$. $M_3$: its source has infinite impedance to ground, so no signal current can flow.`,
      ],
      sol: md`
**What to see first:** $G_M$ is a short-circuit quantity, so tie $v_{out}$ to incremental ground and add up the currents pulled out of it. $M_4$ (diode) and $M_5$ (gate at incremental ground) only connect $v_{out}$ to incremental grounds: shorted, they carry no signal. Three branches remain, all driven by $v_{in}$:

- **$M_1$ through $R_1$.** $M_1$ is a Norton source $g_{m1}v_{in}$ with $r_{ds1}$ across it; $R_1$ leads to the shorted output. Current divider: $\dfrac{g_{m1}r_{ds1}}{r_{ds1}+R_1}v_{in}$.
- **$M_2$ with $R_2$ in its source** ($V_B$ is an incremental ground): degenerated CS, $G_{m2} = \dfrac{g_{m2}}{1 + (g_{m2}+g_{ds2})R_2} \approx \dfrac{g_{m2}}{1+g_{m2}R_2}$.
- **$M_3$ with an ideal current source in its source:** that node has infinite impedance to ground, so no signal current can flow through $M_3$ at all ($G_m = 0$: degeneration by $R_S = \infty$).

$$G_M = \frac{g_{m1}r_{ds1}}{r_{ds1}+R_1} + \frac{g_{m2}}{1 + (g_{m2}+g_{ds2})R_2}$$

**Sign:** $v_{in}\uparrow$ pulls more current out of $v_{out}$ in both live branches: $G_M > 0$, $A_v = -G_MR_{out} < 0$.

!!trap $R_1$ is not degeneration
$R_1$ sits between $M_1$'s **drain** and the output, so it only shares the current with $r_{ds1}$. Keep $r_{ds1}/(r_{ds1}+R_1)$: since $R_1$ can be a sizeable fraction of $r_{ds1}$, the box wants it.`,
    }),
    P({
      id: 'e2p4-2b', src: 'Practice Exam 4 · Problem 2(b) (10 pts)', title: 'Same $G_M$ with a mirror load', big: true,
      q: md`Determine $G_M$ for circuit (b), where $M_5$'s gate is now tied to $M_4$'s gate.`,
      fig: p4fig2(true),
      parts: [X('p4_2', 'G_M')],
      hints: [md`With $v_{out}$ shorted, where is $M_5$'s gate? ($M_4$ is diode-connected: its gate *is* $v_{out}$.)`],
      sol: md`
**What to see first:** $M_4$'s gate is its drain, which is $v_{out}$. Short $v_{out}$ and $M_5$'s gate is at incremental ground, exactly as in (a). So $M_5$ contributes nothing and

$$G_M = \frac{g_{m1}r_{ds1}}{r_{ds1}+R_1} + \frac{g_{m2}}{1 + (g_{m2}+g_{ds2})R_2}\qquad(\text{same as (a)})$$

**Pattern:** $G_M$ is a property of the input side. Anything that only responds to $v_{out}$ is killed by the short. ($R_{out}$ *does* change: in (b) $M_5$ is effectively a second diode at $v_{out}$, $1/g_{m5}$ instead of $r_{ds5}$.) That's why the 10-point part is a 10-second part.`,
    }),
    P({
      id: 'e2p4-3a', src: 'Practice Exam 4 · Problem 3(a) (20 pts)', title: 'Cascode over a low-impedance node', big: true,
      q: md`Determine an expression for $R_{EQ1}$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: p4fig3(false),
      parts: [X('p4_3a', 'R_{EQ1}')],
      hints: [
        md`$R_{EQ1} = R_{DN}\parallel R_{UP}$. Down: $M_5$, gate at incremental ground, $R_5$ in its source.`,
        md`Up: $M_4$ is a grounded-gate PMOS with its source at $T$. What does $T$ see? $r_{ds3}$ in parallel with $M_2$'s source, and $M_2$ has the diode $M_1$ + $R_1$ at its drain.`,
        md`$R_T = r_{ds3}\parallel\dfrac{r_{ds2} + R_B}{1+g_{m2}r_{ds2}} \approx \dfrac{1}{g_{m2}}$ with $R_B = R_1 + \dfrac{1}{g_{m1}+g_{ds1}}$; then $R_{UP} = r_{ds4} + R_T(1+g_{m4}r_{ds4})$.`,
      ],
      sol: md`
**What to see first:** the output node splits: $R_{EQ1} = R_{DN}\parallel R_{UP}$.

**Down: $M_5$**, gate at incremental ground, $R_5$ at its source:
$$R_{DN} = r_{ds5} + R_5 + g_{m5}r_{ds5}R_5 \approx r_{ds5}(1+g_{m5}R_5)$$

**Up: $M_4$**, a grounded-gate PMOS whose source sits on node $T$. Find $R_T$ first. $T$ sees $r_{ds3}$ (current source $M_3$) in parallel with $M_2$ looked into from its source; $M_2$'s drain carries the diode $M_1$ with $R_1$: $R_B = R_1 + \dfrac{1}{g_{m1}+g_{ds1}}$.
$$R_T = r_{ds3}\parallel\frac{r_{ds2} + R_B}{1 + g_{m2}r_{ds2}} \approx \frac{1}{g_{m2}}$$
$$R_{UP} = r_{ds4} + R_T(1 + g_{m4}r_{ds4}) \approx r_{ds4}\Big(1 + \frac{g_{m4}}{g_{m2}}\Big)$$

**Answer:**
$$R_{EQ1} = \big[r_{ds5} + R_5 + g_{m5}r_{ds5}R_5\big]\parallel\big[r_{ds4} + R_T(1+g_{m4}r_{ds4})\big] \approx r_{ds5}(1+g_{m5}R_5)\parallel r_{ds4}\Big(1+\frac{g_{m4}}{g_{m2}}\Big)$$

**Pattern:** a cascode only multiplies by $g_mr_{ds}$ if its source sees a *big* resistance. Here $T$ is a low-impedance node ($1/g_{m2}$), so $M_4$ only gains a factor $1 + g_{m4}/g_{m2} \approx 2$.`,
    }),
    P({
      id: 'e2p4-3b', src: 'Practice Exam 4 · Problem 3(b) (20 pts)', title: '...and with $M_5$ mirroring $M_1$', big: true,
      q: md`Determine an expression for $R_{EQ2}$: the same circuit with $M_5$'s gate tied to $M_1$'s gate (node $B$). Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: p4fig3(true),
      parts: [X('p4_3b', 'R_{EQ2}')],
      hints: [
        md`$R_{UP}$ is unchanged. But a current $j$ that goes up through $M_4$ into $T$ continues (almost all of it, since $r_{ds3} \gg 1/g_{m2}$) through $M_2$ into the diode at $B$.`,
        md`So $v_B = \alpha jR_B$ with $\alpha = \dfrac{r_{ds3}}{r_{ds3} + R_{s2}}\approx1$, and $M_5$ pulls an extra $G_{m5}v_B$, $G_{m5} = \dfrac{g_{m5}}{1+(g_{m5}+g_{ds5})R_5}$.`,
        md`$i_x = \dfrac{v_x}{R_{DN}} + j(1 + \alpha G_{m5}R_B)$ with $j = v_x/R_{UP}$.`,
      ],
      sol: md`
**What changed:** $M_5$'s gate now sits on node $B$, which moves. $R_{DN}$ and $R_{UP}$ are as in (a), but the up-branch current now *also* drives $M_5$.

**Trace the up-branch current $j = v_x/R_{UP}$.** It enters $T$, where it splits between $r_{ds3}$ and $M_2$'s source ($R_{s2} = \frac{r_{ds2}+R_B}{1+g_{m2}r_{ds2}} \approx \frac{1}{g_{m2}}$). The fraction into $M_2$ is $\alpha = \dfrac{r_{ds3}}{r_{ds3}+R_{s2}} \approx 1$, and it flows into the diode at $B$:
$$v_B = \alpha j R_B,\qquad R_B = R_1 + \frac{1}{g_{m1}+g_{ds1}}$$

**$M_5$ responds:** it pulls an extra $G_{m5}v_B$ out of the output, $G_{m5} = \dfrac{g_{m5}}{1+(g_{m5}+g_{ds5})R_5}$. So
$$i_x = \frac{v_x}{R_{DN}} + j\,(1 + \alpha G_{m5}R_B) \;\Rightarrow\; R_{EQ2} = R_{DN}\parallel\frac{R_{UP}}{1 + \alpha G_{m5}R_B}$$
$$R_{EQ2} \approx r_{ds5}(1+g_{m5}R_5)\parallel\frac{r_{ds4}(1 + g_{m4}/g_{m2})}{1 + \frac{g_{m5}(R_1 + 1/g_{m1})}{1+g_{m5}R_5}}$$
If $M_5 = M_1$ and $R_5 = R_1$, the denominator is about 2: the up branch looks half as big.

**Sign check:** more current into the output → $B$ rises → $M_5$ pulls even more → the node looks *lower* in impedance. Feedback through a mirror that helps the test current always lowers the impedance.

**Pattern:** HW 5's "gate driven by a fraction of the test signal" again, but the fraction travels through a current path ($M_4 \to M_2 \to$ diode) instead of a resistor divider.`,
    }),
  ];
  E2.lesson('e2-pracu', { id: 'e2-p4', title: 'Practice Exam 4', kind: 'exam', steps: p4 });

  // ================================================================ Practice Exam 5
  const p5fig1 = [
    ['rail', [1, -1.2], { n: '3\\,\\text{V}' }], ['R', [1, -1.2], [1, 0], { s: '1\\kO' }],
    ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'V_{OUT}+v_{out}', side: 'r' }],
    ['nmos', [1, 1], { sz: '500/1' }],
    ['w', [0, 1], [-0.4, 1], [-0.4, 1.4]], ['V', [-0.4, 1.4], [-0.4, 2.4], { s: '1.5\\,\\text{V}', side: 'l' }], ['gnd', [-0.4, 2.4]],
    ['I', [1, 2], [1, 3.2], { s: '1\\,\\text{mA}', side: 'l' }], ['gnd', [1, 3.2]],
    ['w', [1, 2], [1.4, 2]], ['C', [1.4, 2], [2.2, 2], { n: '\\infty' }], ['w', [2.2, 2], [2.8, 2], [2.8, 2.4]], ...vac(2.8, 2.4, 'v_{in}', 'r'),
  ];
  const p5fig2 = (b) => b ? [
    ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['w', [1, 0], [1, -0.4], [4.6, -0.4]], lookR([4.6, -0.4], 'R_{eq2}'),
    ['nmos', [1, 3], { n: 'M_2', dc: true }], ['node', [1, 2], { n: 'X', side: 'ar' }], ['node', [1, 4], { n: 'Y', side: 'al' }],
    ['R', [1, 4], [1, 5.2], { n: 'R', side: 'l' }], ['gnd', [1, 5.2]],
    ['w', [1, 4], [2, 4]], ['nmos', [3, 4], { n: 'M_3' }], ['gnd', [3, 5]], ['w', [3, 3], [3, -0.4]],
    ['w', [1, 2], [2.6, 2], { hops: [3] }], ['w', [2.6, 2], [3.6, 2], { hops: [3] }], ['nmos', [4.6, 2], { n: 'M_4' }], ['gnd', [4.6, 3]], ['w', [4.6, 1], [4.6, -0.4]],
  ] : [
    ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['w', [1, 0], [1, -0.4], [1.8, -0.4]], lookR([1.8, -0.4], 'R_{eq1}'),
    ['nmos', [1, 3], { n: 'M_2', dc: true }], ['R', [1, 4], [1, 5.2], { n: 'R' }], ['gnd', [1, 5.2]],
  ];
  const p5fig3 = (b) => [
    ['w', [1, 0], [b ? 3 : 1, 0]], ['rail', [b ? 2 : 1, 0]],
    ['pmos', [1, 1], { n: 'M_3', flip: true, dc: true }],
    ['pmos', [1, 3], { n: 'M_1' }], ['nmos', [1, 5], { n: 'M_2' }],
    ['nmos', [1, 7], { n: 'M_4', flip: true, dc: true }], ['gnd', [1, 8]],
    ['w', [0, 3], [-0.4, 3], [-0.4, 5], [0, 5]], ['w', [-0.4, 4], [-1, 4]], ['term', [-1, 4], { n: 'v_{in}', side: 'l' }],
    ...(b ? [
      ['pmos', [3, 1], { n: 'M_6' }], ['w', [3, 2], [3, 3]], ['w', [3, 2.5], [3.8, 2.5]], ['term', [3.8, 2.5], { n: 'v_{out2}', side: 'r' }],
      ['w', [1, 4], [2, 4]], ['nmos', [3, 4], { n: 'M_5' }], ['w', [3, 5], [3, 6]],
      ['nmos', [3, 7], { n: 'M_7' }], ['gnd', [3, 8]],
    ] : [['w', [1, 4], [1.8, 4]], ['term', [1.8, 4], { n: 'v_{out1}', side: 'r' }]]),
  ];

  const p5 = [
    R(md`
      **60 minutes, 100 points.** No calculator rule is printed on this paper. ${PARAMS}

      | Problem | Points | What it tests |
      |---|---|---|
      | 1 | 20 | A number: common-gate gain, with a DC check |
      | 2 | 40 | Drain impedance over a degenerated diode, then with two transistors copying the stack |
      | 3 | 40 | A CMOS inverter amplifier with diode degeneration, then a third stage fed by it |
    `),
    P({
      id: 'e2p5-1', src: 'Practice Exam 5 · Problem 1 (20 pts)', title: 'Common gate, driven at the source', big: true,
      q: md`Determine the numerical value of $A_V = v_{out}/v_{in}$. You may ignore $r_{ds}$.`,
      fig: p5fig1,
      parts: [{ lbl: 'V_S', unit: 'V', ans: 0.3 }, { lbl: 'g_m', unit: 'mA/V', ans: 10 }, { lbl: 'A_V', unit: '', ans: 10 }],
      hints: [
        md`DC: the $1\,\text{mA}$ source fixes $I_D$. Find $V_{ov}$, then $V_S = 1.5 - V_{GS}$. Check saturation.`,
        md`Signal: the gate is held at $1.5\,\text{V}$ (incremental ground), $v_{in}$ drives the source directly through the capacitor, the current source is open.`,
        md`$v_{gs} = -v_{in}$. The drain current change flows through the $1\kO$.`,
      ],
      sol: md`
**What to see first:** gate held at a DC voltage, input into the source, output at the drain: **common gate**.

**DC.** $I_D = 1\,\text{mA}$ (forced). $K = \tfrac12(100\mu)(500) = 25\,\text{mA/V}^2$, $V_{ov} = 0.2\,\text{V}$, $V_{GS} = 1.2\,\text{V}$, so $V_S = 1.5 - 1.2 = 0.3\,\text{V}$. $V_D = 3 - (1\,\text{mA})(1\kO) = 2\,\text{V} \ge V_G - V_T = 0.5\,\text{V}$: saturated. $g_m = 2I_D/V_{ov} = 10\,\text{mA/V}$.

**Signal.** $v_{in}$ drives the source directly (an ideal source, no series resistance), so $v_{gs} = -v_{in}$ and the drain current changes by $-g_mv_{in}$. Less current through the $1\kO$ means the drain rises:
$$v_{out} = +g_m(1\kO)\,v_{in} \;\Rightarrow\; A_V = +10$$

**Pattern:** CG gain is $+g_mR_D$: the CS magnitude without the inversion. Its input resistance is only $1/g_m = 100\,\Omega$, which is why it needs a stiff source. (Through a source resistance $R_S$ it would become $\frac{R_D}{R_S + 1/g_m}$.)`,
    }),
    P({
      id: 'e2p5-2a', src: 'Practice Exam 5 · Problem 2(a) (20 pts)', title: 'Cascode over a degenerated diode', big: true,
      q: md`Determine an expression for $R_{eq1}$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: p5fig2(false),
      parts: [X('p5_2a', 'R_{eq1}')],
      hints: [
        md`Below $M_1$: $M_2$ is diode-connected with $R$ in its source. $R_X = R + \dfrac{1}{g_{m2}+g_{ds2}}$.`,
        md`$M_1$'s gate is at incremental ground: impedance scaler, $R_{eq1} = r_{ds1} + R_X(1 + g_{m1}r_{ds1})$.`,
      ],
      sol: md`
**What to see first:** two canonical blocks in series. **$M_2$ is a diode with $R$ in its source:** $R_X = R + \dfrac{1}{g_{m2}+g_{ds2}}$ (a diode is $1/g_m$, and $R$ carries the same current). **$M_1$ is a grounded-gate device on top of $R_X$:** the impedance scaler.

$$R_{eq1} = r_{ds1} + R_X(1 + g_{m1}r_{ds1}) \approx r_{ds1}\Big[1 + g_{m1}\Big(R + \frac{1}{g_{m2}}\Big)\Big]$$

!!trap Which approximation
$g_{m1}r_{ds1}R_X$ alone also needs $g_{m1}R_X \gg 1$, which is not given. $r_{ds1}(1 + g_{m1}R_X)$ only needs $g_mr_{ds} \gg 1$, so it is the safe form.`,
    }),
    P({
      id: 'e2p5-2b', src: 'Practice Exam 5 · Problem 2(b) (20 pts)', title: 'The stack as a sensor: $M_3$, $M_4$ copy its current', big: true,
      q: md`Determine an expression for $R_{eq2}$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$. ($M_3$'s gate is node $Y$, the top of $R$; $M_4$'s gate is node $X$, $M_2$'s gate and drain; both drains go to the test node.)`,
      fig: p5fig2(true),
      parts: [X('p5_2b', 'R_{eq2}')],
      hints: [
        md`The stack $M_1$–$M_2$–$R$ still looks like $R_{eq1}$ from part (a), and its current $i_1 = v_x/R_{eq1}$ sets $v_Y = i_1R$ and $v_X = i_1R_X$.`,
        md`$M_3$ and $M_4$ (sources grounded, drains at the test node) each add their $r_{ds}$ and a controlled current $g_{m3}v_Y$, $g_{m4}v_X$.`,
        md`$i_x = \dfrac{v_x}{r_{ds3}} + \dfrac{v_x}{r_{ds4}} + i_1(1 + g_{m3}R + g_{m4}R_X)$.`,
      ],
      sol: md`
**What to see first:** the same stack as (a), now used as a **sensor**: the current through it produces voltages at $Y$ and $X$, and $M_3$, $M_4$ amplify those back into the test node.

**The stack current.** $i_1 = v_x/R_{eq1}$ flows through $M_1$, $M_2$ and $R$, so
$$v_Y = i_1R,\qquad v_X = i_1R_X,\qquad R_X = R + \frac{1}{g_{m2}+g_{ds2}}$$

**The copies.** $M_3$ pulls $g_{m3}v_Y + v_x/r_{ds3}$; $M_4$ pulls $g_{m4}v_X + v_x/r_{ds4}$. Total:
$$i_x = \frac{v_x}{r_{ds3}} + \frac{v_x}{r_{ds4}} + i_1\big(1 + g_{m3}R + g_{m4}R_X\big)$$
$$R_{eq2} = r_{ds3}\parallel r_{ds4}\parallel\frac{R_{eq1}}{1 + g_{m3}R + g_{m4}R_X},\qquad R_{eq1} = r_{ds1} + R_X(1+g_{m1}r_{ds1})$$

**Intuition:** the stack turns a tiny test current into voltages; $M_3$ and $M_4$ multiply that current by $1 + g_{m3}R + g_{m4}R_X$ (a current gain), so the big $R_{eq1}$ gets divided by it, and $r_{ds3}\parallel r_{ds4}$ sit in parallel on top.

**Pattern:** a transistor whose gate senses a current elsewhere and whose drain is on the test node divides the impedance by $(1 + \text{its current gain})$.`,
    }),
    P({
      id: 'e2p5-3a', src: 'Practice Exam 5 · Problem 3(a) (20 pts)', title: 'Inverter amplifier with diode degeneration', big: true,
      q: md`Determine an expression for $A_{V1} = v_{out1}/v_{in}$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: p5fig3(false),
      parts: [X('p5_3a', 'A_{V1}')],
      hints: [
        md`$M_1$ (PMOS) and $M_2$ (NMOS) both have their gates on $v_{in}$, like a CMOS inverter. But each source sits on a diode: $M_3$ above ($R_T = 1/(g_{m3}+g_{ds3})$), $M_4$ below.`,
        md`Each half is a degenerated CS: $G_{m1} = \dfrac{g_{m1}}{1+(g_{m1}+g_{ds1})R_T}$, $R_{o1} = r_{ds1} + R_T(1+g_{m1}r_{ds1})$; same for $M_2$ with $R_B$.`,
        md`Both halves push $v_{out1}$ the same way: $A_{V1} = -(G_{m1}+G_{m2})(R_{o1}\parallel R_{o2})$.`,
      ],
      sol: md`
**What to see first:** a **CMOS inverter amplifier** ($M_1$ PMOS, $M_2$ NMOS, both gates on $v_{in}$) whose sources sit on **diodes** instead of the rails. A diode at the source is degeneration by $1/g_m$.

**Each half is a degenerated CS stage.** With $R_T = \dfrac{1}{g_{m3}+g_{ds3}}$ and $R_B = \dfrac{1}{g_{m4}+g_{ds4}}$:
$$G_{m1} = \frac{g_{m1}}{1+(g_{m1}+g_{ds1})R_T}\approx\frac{g_{m1}g_{m3}}{g_{m1}+g_{m3}},\qquad R_{o1} = r_{ds1} + R_T(1+g_{m1}r_{ds1}) \approx r_{ds1}\Big(1+\frac{g_{m1}}{g_{m3}}\Big)$$
and the same for $M_2$ with $M_4$.

**Both halves agree:** $v_{in}\uparrow$ → $M_2$ sinks more, $M_1$ sources less → $v_{out1}\downarrow$. Their transconductances add, their output resistances are in parallel:
$$A_{V1} = -(G_{m1} + G_{m2})(R_{o1}\parallel R_{o2})$$

**Neat fact:** for a degenerated CS stage $G_mR_o = g_mr_{ds}$ exactly (degeneration lowers $G_m$ and raises $R_o$ by the same factor). With everything matched, each half has $G_m = g_m/2$ and $R_o = 2r_{ds}$, so $A_{V1} = -g_m r_{ds}$: the same as an undegenerated inverter amplifier.`,
    }),
    P({
      id: 'e2p5-3b', src: 'Practice Exam 5 · Problem 3(b) (20 pts)', title: 'A third stage degenerated by a current source', big: true,
      q: md`Determine $A_{V2} = v_{out2}/v_{in}$. Saturation, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$. (Answer box: write $A_{V2}$ in terms of $A_{V1}$ from part (a) and $g_{m5}$, $r_{ds5}$, $r_{ds6}$, $r_{ds7}$, taking the mirrors $M_6{:}M_3$ and $M_7{:}M_4$ as exact copies.)`,
      fig: p5fig3(true),
      parts: [X('p5_3b', 'A_{V2}')],
      hints: [
        md`$M_3$, $M_1$, $M_2$, $M_4$ are one series stack, so $M_3$ and $M_4$ carry the *same* signal current. $M_6$ pushes a copy into $v_{out2}$; $M_7$ pulls a copy out of $M_5$'s source. With matched copies, they cancel.`,
        md`What is left: $M_5$ is a CS stage driven by $v_{out1}$, degenerated by $r_{ds7}$, loaded by $r_{ds6}$.`,
        md`$A_{V2} = A_{V1}\big[-G_{m5}(r_{ds6}\parallel R_{o5})\big]$ with $G_{m5} = \dfrac{g_{m5}}{1+(g_{m5}+g_{ds5})r_{ds7}}$, $R_{o5} = r_{ds5}+r_{ds7}+g_{m5}r_{ds5}r_{ds7}$.`,
      ],
      sol: md`
**What to see first:** the mirrors look important but mostly cancel. $M_3$, $M_1$, $M_2$, $M_4$ form **one series stack**, so $M_3$ and $M_4$ carry the *same* signal current $i$. $M_6$ copies it into $v_{out2}$; $M_7$ copies it out of $M_5$'s source. With matched copy ratios, the injected and removed currents just circulate through $M_5$ and change nothing. (Also, $i$ itself is small: $i = v_{in}\frac{g_{m2}r_{ds2} - g_{m1}r_{ds1}}{R_{o1}+R_{o2}}$, zero when the two halves have equal intrinsic gain.)

**What is left:** $M_5$ is a **CS stage driven by $v_{out1}$**, with $M_7$ (a current source, $r_{ds7}$) as its **degeneration** and $M_6$ (a current source, $r_{ds6}$) as its **load**:
$$A_{V2} = A_{V1}\cdot\big[-G_{m5}(r_{ds6}\parallel R_{o5})\big],\quad G_{m5} = \frac{g_{m5}}{1 + (g_{m5}+g_{ds5})r_{ds7}},\quad R_{o5} = r_{ds5}+r_{ds7}+g_{m5}r_{ds5}r_{ds7}$$

Since $g_{m5}r_{ds7} \gg 1$, $G_{m5} \approx 1/r_{ds7}$, and $R_{o5} \gg r_{ds6}$:
$$A_{V2} \approx -\frac{r_{ds6}}{r_{ds7}}A_{V1} \approx -A_{V1} \approx +g_mr_{ds}\ \ (\text{equal }r_{ds})$$

**Pattern:** degeneration by a current source ($R_S = r_{ds}$) crushes a CS stage's gain to about $-R_{load}/R_S$: here $-r_{ds6}/r_{ds7} \approx -1$. The third stage just inverts.

!!note Checked numerically
With exact copies ($M_6 = M_3$, $M_7 = M_4$) this matches an exact solve of the whole circuit to better than 0.001%. If the two mirror ratios differ, the leftover copy current lands on the high-impedance output and adds a term.`,
    }),
  ];
  E2.lesson('e2-pracu', { id: 'e2-p5', title: 'Practice Exam 5', kind: 'exam', steps: p5 });
})();

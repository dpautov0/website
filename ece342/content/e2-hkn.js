/* HKN Exam 2 review session (ECE_342_RS_2.pptx): the two ideas the slides stress (why the gain is −G_M·R_out, and
   the two "shortcut" impedances), then every worked example typed up with full steps. The FA22 Exam 2 problems at the
   end of the deck are the same paper as Practice Exam 2, so they link there instead of being repeated.
   Every answer below was checked against an exact small-signal solve of the drawn circuit (the HKN answer key agrees
   to within the g_m r_ds >> 1 approximations, which the answer boxes accept). */
(function () {
  'use strict';
  const { R, P } = C;
  const PARAMS = md`NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$.`;

  // ---------------------------------------------------------------- exact references (checked)
  const RD2 = '(1/(gm2 + 1/rds2))';
  const RX = `(rds1 + ${RD2} + gm1*rds1*${RD2})`;
  const RY = '((rds4 + R)/(1 + gm4*rds4))';
  const RZ = `((rds3 + ${RY})/(1 + gm3*rds3))`;
  const N6 = ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'gm4', 'rds4', 'R'];

  const E1D2 = '(rds2 + R1 + gm2*rds2*R1)';
  const E1A1 = `(gm1/(gm1 + 1/rds1 + 1/${E1D2}))`;
  const E1RD3 = '(1/(gm3 + 1/rds3))';
  const E1G2 = `(gm4/(1 + (gm4 + 1/rds4)*${E1RD3}) + gm5/(1 + (gm5 + 1/rds5)*R2))`;
  const E1R2 = `((rds4 + ${E1RD3} + gm4*rds4*${E1RD3}) || (rds5 + R2 + gm5*rds5*R2))`;
  const E1A2 = `(-${E1G2}*${E1R2})`;
  const E1A3 = '(-(gm7*rds7*(1 + gm6*rds6)/(rds7 + rds6 + gm6*rds6*rds7))*(R3 || (rds6 + rds7 + gm6*rds6*rds7)))';

  const E2RD1 = '(1/(gm1 + 1/rds1))';
  const E2RX = `(rds4 || (R + ${E2RD1}))`;
  const E2RY = `(rds3 + ${E2RX} + gm3*rds3*${E2RX})`;
  const E2GM = `(gm3/(1 + (gm3 + 1/rds3)*${E2RX}))`;
  const E2K = `(${E2RX}*${E2RD1}/(R + ${E2RD1}))`;   // v at M1's gate per amp into node X
  const N2 = ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'rds4', 'R'];

  // ---------------------------------------------------------------- figures
  const figDC = [
    ['w', [0, 0], [5, 0]], ['rail', [2.5, 0], { n: '5\\,\\text{V}' }],
    ['R', [0, 0], [0, 1], { n: 'R_1', side: 'l' }], ['R', [0, 1], [0, 3.4], { n: 'R_2', side: 'l' }], ['gnd', [0, 3.4]], ['w', [0, 1], [0.5, 1]],
    ['pmos', [1.5, 1], { n: 'M_1', sz: '1X' }],
    ['nmos', [1.5, 3], { n: 'M_2', sz: '8X', flip: true, dc: true }], ['gnd', [1.5, 4]],
    ['nmos', [3.5, 3], { n: 'M_3', sz: '4X' }], ['gnd', [3.5, 4]],
    ['R', [3.5, 0], [3.5, 1], { n: 'R_3', side: 'l' }], ['w', [3.5, 1], [3.5, 2]], ['w', [3.5, 1], [4, 1]],
    ['pmos', [5, 1], { n: 'M_4', sz: '8X' }],
    ['R', [5, 2], [5, 3.6], { n: 'R_4', side: 'l' }], ['gnd', [5, 3.6]],
    ['w', [5, 2], [6, 2]], ['I', [6, 2], [6, 3.6], { n: 'I_B' }], ['gnd', [6, 3.6]],
    ['w', [6, 2], [6.6, 2]], ['term', [6.6, 2], { n: 'V_{OUT}' }],
  ];
  const figREQ = (b) => [
    ...(b ? [
      ['w', [1, -2], [4, -2]], ['rail', [2.5, -2]],
      ['pmos', [1, -1], { n: 'M_5', flip: true }], ['w', [2, -1], [2.3, -1], [2.3, 2], [1, 2]],
      ['pmos', [4, -1], { n: 'M_6', flip: true }], ['w', [5, -1], [5.3, -1], [5.3, 2], [4, 2]],
    ] : []),
    ['w', [-0.6, 0], [4, 0]], ['term', [-0.6, 0], { n: `R_{EQ${b ? 2 : 1}}\\rightarrow`, side: 'l' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['node', [1, 2], { n: 'A', side: 'l', off: [-14, 0] }],
    ['nmos', [1, 3], { n: 'M_2', dc: true }], ['gnd', [1, 4]],
    ['pmos', [4, 1], { n: 'M_3' }], ['acg', [3, 1]], ['node', [4, 2], { n: 'Y', side: 'r' }],
    ['R', [4, 2], [4, 3.2], { n: 'R' }],
    ['nmos', [4, 4.2], { n: 'M_4' }], ['gnd', [4, 5.2]], ['w', [4, 2], [2.7, 2], [2.7, 4.2], [3, 4.2]],
  ];
  const figEx1 = [
    ['w', [1, 0], [6.5, 0]], ['rail', [3.5, 0], { n: 'V_{DD}' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]],
    ['node', [1, 2], { n: 'v_1', side: 'l', off: [-6, -12] }],
    ['nmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]], ['R', [1, 4], [1, 5.2], { n: 'R_1' }], ['gnd', [1, 5.2]],
    ['w', [1, 2], [2, 2], [2, 3], [2.5, 3]],
    ['pmos', [3.5, 1], { n: 'M_3', dc: true }],
    ['pmos', [3.5, 3], { n: 'M_4' }], ['w', [2.5, 3], [2.5, 5]],
    ['node', [3.5, 4], { n: 'v_2', side: 'r' }],
    ['nmos', [3.5, 5], { n: 'M_5' }], ['R', [3.5, 6], [3.5, 7.2], { n: 'R_2' }], ['gnd', [3.5, 7.2]],
    ['w', [3.5, 4], [5, 4], [5, 6], [5.5, 6]],
    ['R', [6.5, 0], [6.5, 2], { n: 'R_3' }], ['w', [6.5, 2], [6.5, 3]], ['w', [6.5, 2], [7.3, 2]], ['term', [7.3, 2], { n: 'v_{out}' }],
    ['nmos', [6.5, 4], { n: 'M_6' }], ['acg', [5.5, 4]],
    ['nmos', [6.5, 6], { n: 'M_7' }], ['gnd', [6.5, 7]],
  ];
  const figEx2 = (b) => [
    ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: 'V_{DD}' }],
    ['pmos', [1, 1], { n: 'M_1', flip: true, dc: true }],
    b ? ['pmos', [3, 1], { n: 'M_2' }] : ['pmos', [3, 1], { n: 'M_2', flip: true }],
    ...(b ? [] : [['acg', [4, 1]]]),
    ['R', [1, 2], [1, 4.5], { n: 'R', side: 'l' }], ['w', [1, 4.5], [3, 4.5]], ['node', [2, 4.5], { n: 'X', side: 'a' }],
    ['w', [3, 2], [3, 2.5]], ['w', [3, 2], [3.9, 2]], ['term', [3.9, 2], { n: 'v_{out}' }],
    ['nmos', [3, 3.5], { n: 'M_3', flip: true }], ['w', [4, 3.5], [4.6, 3.5], [4.6, 3.8]], ['Vac', [4.6, 3.8], [4.6, 4.8], { n: 'v_{in}', side: 'r' }], ['gnd', [4.6, 4.8]],
    ['nmos', [2, 5.5], { n: 'M_4' }], ['acg', [1, 5.5]], ['gnd', [2, 6.5]],
  ];

  // ---------------------------------------------------------------- the lesson
  const steps = [
    R(md`
      These are the problems from the **HKN Exam 2 review session** slides, typed up with every step. The slides go: DC analysis (the Exam 1 skill, still Problem 1 on Exam 2) → the small-signal model → terminal impedances → amplifiers with $G_M$ and $R_{out}$ → worked examples → a past exam (Fall 2022 Exam 2).

      Two ideas from the slides come first because the examples lean on them. Then the four worked examples. ${PARAMS}

      !!note The Fall 2022 Exam 2 at the end of the slides
      It is the same paper as **[Practice Exam 2](#/l/e2-p2)** (mirrors and edge of saturation; cascode and gain-boosted cascode; two stages plus a direct path). It is already typed up there with full solutions, so it is not repeated here.
    `),
    R(md`
      ### Idea 1: why the gain is $-G_MR_{out}$, not $+G_MR_{out}$

      Every amplifier, seen from its output node, is a **current source in parallel with a resistor** (a Norton equivalent):

      - the current source is the stage's "pulling capacity": it pulls $G_Mv_{in}$ **down, out of the output node**, toward ground;
      - the resistor is $R_{out}$, everything the output node sees with the input turned off.

      Now picture it with $v_{in} > 0$ and $G_M > 0$. Current $G_Mv_{in}$ is being pulled out of the node. The only thing that can supply it is $R_{out}$, so current flows **up** through $R_{out}$ from ground into the node. Current flows up through a resistor only if the top is **below** the bottom: the output goes negative.
      $$v_{out} = -G_Mv_{in}\,R_{out}$$

      The slides call it "a Norton model with the current source facing the opposite direction". The course defines $G_M$ as the current pulled **down into** the stage, so every formula you were given already assumes this minus sign. For a common source stage, $G_M = g_m$ and the gain $-g_mR_{out}$ comes out negative, as it should (common source inverts).
    `),
    R(md`
      ### Idea 2: the two "shortcut" impedances, and why they are secretly the same

      The slides single out two configurations that show up inside almost every equivalent-impedance problem:

      | Configuration | Resistance you see |
      |---|---|
      | Gate held still, resistor $R_S$ under the source, looking **into the drain** | $r_{ds} + R_S + g_mr_{ds}R_S \approx r_{ds}(1 + g_mR_S)$ |
      | Gate held still, resistor $R_D$ above the drain, looking **into the source** | $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}} \approx \dfrac{1}{g_m}\Big(1 + \dfrac{R_D}{r_{ds}}\Big)$ |

      The slides add: "these two can be generalized: either a **diode-connected transistor with a resistor in its drain**, or a **gate tied to its source with source degeneration**." Here is why that works, using the dependent-source model.

      **Diode with a resistor $R$ in its drain** (gate tied to the top of $R$, the test node). Apply $v_t$ at the top. The gate is at $v_t$ and the source is grounded, so $v_{gs} = v_t$. The drain sits below $R$: $v_d = v_t - i_tR$. KCL at the drain:
      $$i_t = g_mv_t + \frac{v_t - i_tR}{r_{ds}} \;\Rightarrow\; i_t\Big(1 + \frac{R}{r_{ds}}\Big) = v_t\Big(g_m + \frac{1}{r_{ds}}\Big) \;\Rightarrow\; \frac{v_t}{i_t} = \frac{r_{ds} + R}{1 + g_mr_{ds}}$$

      That is **exactly** the "looking into the source with $R_D$ above the drain" result. In both circuits the test voltage sets $|v_{gs}| = v_t$ and $R$ sits in series with $r_{ds}$; only the direction is flipped. So whenever you see a transistor whose gate is wired to the top of a resistor that feeds its own drain, you can write $\approx \dfrac{1}{g_m}\Big(1 + \dfrac{R}{r_{ds}}\Big) \approx \dfrac1{g_m}$ immediately. Equivalent impedance example 1 below uses this for $M_4$.
    `),

    P({
      id: 'e2hkn-dc', src: 'HKN review · DC analysis example', title: 'Mirror into a PMOS stage: edges of saturation', big: true,
      q: md`(a) Determine $R_2$ such that $M_1$ is biased at the edge of saturation. (b) Using this $R_2$, determine $I_B$ such that $M_4$ is biased at the edge of saturation. (c) Using these values, determine $V_{OUT}$. $X = 25$ (so $1X$ means $W/L = 25$), $R_1 = 4.2\kO$, $R_3 = 500\,\Omega$, $R_4 = 4\kO$.`,
      fig: figDC,
      parts: [{ lbl: 'R_2', unit: 'Ω', ans: 800 }, { lbl: 'I_B', unit: 'µA', ans: 700 }, { lbl: 'V_{OUT}', unit: 'V', ans: 4.4 }],
      hints: [
        md`$M_1$ (PMOS) and $M_2$ (diode NMOS) are in series, so they carry the same current. Edge of saturation for a PMOS: drain sits exactly $|V_{TP}|$ above the gate, $V_{D1} = V_{G1} + 1$.`,
        md`$V_{D1} = V_{GS2} = 1 + \sqrt{I/K_2}$. Try writing everything in terms of $V_{G1}$; $R_2 = 800\,\Omega$ makes $V_{G1} = 0.8\,\text{V}$.`,
        md`$M_3$ mirrors $M_2$ at half the size. That current through $R_3$ sets $M_4$'s gate. Then KCL at $V_{OUT}$: $M_4$'s current = $V_{OUT}/R_4 + I_B$.`,
      ],
      sol: md`
**Constants first** ($K = \tfrac12\mu C_{ox}\tfrac WL$, so $I_D = KV_{ov}^2$):
- $M_1$: PMOS $1X$: $K_1 = \tfrac12(50\,\mu)(25) = 625\,\mu\text{A/V}^2$.
- $M_2$: NMOS $8X$: $K_2 = \tfrac12(100\,\mu)(200) = 10\,\text{mA/V}^2$. $M_3$ ($4X$): $5\,\text{mA/V}^2$.
- $M_4$: PMOS $8X$: $K_4 = \tfrac12(50\,\mu)(200) = 5\,\text{mA/V}^2$.

**(a) $R_2$.** $M_1$ and $M_2$ are in series: same current $I$. Call $M_1$'s gate voltage $V_G$ (set by the divider $R_1$, $R_2$).

Step 1, $M_1$: source at $5\,\text{V}$, so $V_{SG1} = 5 - V_G$ and $V_{ov1} = 4 - V_G$. Edge of saturation for a PMOS: $V_{SD} = V_{ov}$, which is the same as $V_{D1} = V_G + |V_{TP}| = V_G + 1$.

Step 2, $M_2$: diode-connected, so its drain voltage is its own $V_{GS2} = 1 + V_{ov2}$. The drains are the same node, so $V_{ov2} = V_G$.

Step 3, equal currents: $K_1V_{ov1}^2 = K_2V_{ov2}^2$:
$$625\,\mu(4 - V_G)^2 = 10\,\text{m}\,V_G^2 \;\Rightarrow\; \frac{4 - V_G}{V_G} = \sqrt{16} = 4 \;\Rightarrow\; V_G = 0.8\,\text{V}$$

Step 4, the divider: $V_G = 5\,\dfrac{R_2}{R_1 + R_2} = 0.8 \Rightarrow 5R_2 = 0.8(4.2\text{k} + R_2) \Rightarrow 4.2R_2 = 3.36\text{k} \Rightarrow$ **$R_2 = 800\,\Omega$**.

Check: $I = 625\,\mu(3.2)^2 = 6.4\,\text{mA}$; $V_{GS2} = 1 + \sqrt{6.4\text{m}/10\text{m}} = 1.8\,\text{V} = V_G + 1$. ✓

**(b) $I_B$.** $M_3$ shares $M_2$'s gate and source, so it copies the current scaled by size: $I_3 = 6.4\,\text{mA}\times\tfrac{4X}{8X} = 3.2\,\text{mA}$. That current flows through $R_3$:
$$V_{G4} = 5 - (500)(3.2\,\text{m}) = 3.4\,\text{V}$$
$M_4$: $V_{SG4} = 1.6\,\text{V}$, $V_{ov4} = 0.6\,\text{V}$, $I_4 = 5\,\text{m}(0.6)^2 = 1.8\,\text{mA}$.

Edge of saturation for $M_4$: $V_{OUT} = V_{G4} + 1 = 4.4\,\text{V}$. At that voltage $R_4$ takes $4.4/4\text{k} = 1.1\,\text{mA}$. KCL at $V_{OUT}$ ($M_4$'s current in, $R_4$ and $I_B$ out):
$$I_B = 1.8 - 1.1 = 0.7\,\text{mA} = 700\,\mu\text{A}$$

**(c)** **$V_{OUT} = 4.4\,\text{V}$** (found in (b)). Check $M_3$ is saturated: $V_{D3} = 3.4 \ge V_{G3} - 1 = 0.8$. ✓

**Pattern:** "edge of saturation" always compares **drain to gate**: NMOS $V_D = V_G - V_{TN}$, PMOS $V_D = V_G + |V_{TP}|$. Mirrors copy current in proportion to size.`,
    }),

    P({
      id: 'e2hkn-req1', src: 'HKN review · Equivalent impedance example', title: '$R_{EQ1}$: two branches in parallel', big: true,
      q: md`Determine the equivalent impedance $R_{EQ1}$. All transistors are in saturation, $r_{ds}\ne\infty$, $g_mr_{ds}\gg1$. ($M_3$ is a PMOS with its gate at incremental ground; $M_4$'s gate is tied to node $Y$, the top of $R$.)`,
      fig: figREQ(false),
      parts: [E2.ex(`${RX} || ${RZ}`, N6, 'R_{EQ1}')],
      hints: [
        md`Two branches hang off the test node: the left one through $M_1$'s **drain**, the right one through $M_3$'s **source**. $R_{EQ1} = R_X \parallel R_Z$.`,
        md`Left: $M_2$ is a diode, $1/g_{m2}$. $M_1$ (gate held) has that under its source, so $R_X = r_{ds1} + \tfrac1{g_{m2}} + g_{m1}r_{ds1}\tfrac1{g_{m2}}$.`,
        md`Right, bottom first: $M_4$ is a diode with $R$ in its drain, $R_Y = \dfrac{r_{ds4} + R}{1 + g_{m4}r_{ds4}}$. Then $M_3$ (gate held) seen from its source with $R_Y$ at its drain: $R_Z = \dfrac{r_{ds3} + R_Y}{1 + g_{m3}r_{ds3}}$.`,
      ],
      sol: md`
**What to see first:** the test node connects to **two separate branches**, so $R_{EQ1} = R_X\parallel R_Z$. Work each branch from the bottom up.

**Left branch, $R_X$ (looking into $M_1$'s drain).**

Step 1: $M_2$ has its gate tied to its drain: a diode. Looking into it: $\dfrac1{g_{m2}}\parallel r_{ds2} \approx \dfrac1{g_{m2}}$.

Step 2: $M_1$'s gate is at incremental ground and $1/g_{m2}$ sits under its source. That is the degenerated-drain shortcut with $R_S = 1/g_{m2}$:
$$R_X = r_{ds1} + \frac1{g_{m2}} + \frac{g_{m1}}{g_{m2}}r_{ds1} \approx r_{ds1}\Big(1 + \frac{g_{m1}}{g_{m2}}\Big)$$
Big: on the order of $r_{ds}$.

**Right branch, $R_Z$ (looking into $M_3$'s source).**

Step 3: $M_4$'s gate is tied to node $Y$, and $R$ connects $Y$ to $M_4$'s drain: a **diode with a resistor in its drain** (Idea 2 above):
$$R_Y = \frac{r_{ds4} + R}{1 + g_{m4}r_{ds4}} \approx \frac1{g_{m4}}\Big(1 + \frac{R}{r_{ds4}}\Big)$$
The resistor barely matters: $M_4$ adjusts its current to hold $v_{gs}$, so node $Y$ still looks like about $1/g_{m4}$.

Step 4: $M_3$ is a PMOS with its gate held and $R_Y$ at its drain; we look into its source. Source-side shortcut:
$$R_Z = \frac{r_{ds3} + R_Y}{1 + g_{m3}r_{ds3}} \approx \frac1{g_{m3}}\Big(1 + \frac{R_Y}{r_{ds3}}\Big)$$
Small: about $1/g_{m3}$.

**Combine:**
$$R_{EQ1} = R_X\parallel R_Z \approx \frac1{g_{m3}}$$
(the small branch wins a parallel combination).

**Pattern:** a source always looks small ($\approx 1/g_m$), a drain with anything under the source looks big ($\approx r_{ds}\times$ something).`,
    }),

    P({
      id: 'e2hkn-req2', src: 'HKN review · Equivalent impedance example', title: '$R_{EQ2}$: add PMOS devices whose gates follow the test node', big: true,
      q: md`Same circuit with two PMOS devices added from $V_{DD}$ to the test node: $M_5$'s gate is node $A$ (between $M_1$ and $M_2$), $M_6$'s gate is node $Y$. Determine $R_{EQ2}$. Saturation, $r_{ds}\ne\infty$, $g_mr_{ds}\gg1$.`,
      fig: figREQ(true),
      parts: [E2.ex(`${RX} || ${RZ} || rds5 || rds6 || (${RX}/(gm5*${RD2})) || (${RZ}/(gm6*${RY}))`, [...N6, 'gm5', 'rds5', 'gm6', 'rds6'], 'R_{EQ2}')],
      hints: [
        md`$R_X$ and $R_Z$ from $R_{EQ1}$ are unchanged: $M_5$ and $M_6$ only touch the test node (their drains) and draw no gate current.`,
        md`Each new device adds two things in parallel: its $r_{ds}$ (drain to $V_{DD}$, an incremental ground), and a dependent current $g_mv_{gate}$. Find how much the gate moves per volt of test voltage.`,
        md`Node $A$: the left branch carries $i = v_t/R_X$, which flows through the diode $M_2$, so $v_A = v_t/(g_{m2}R_X)$. Node $Y$: the right branch carries $v_t/R_Z$ into $R_Y$, so $v_Y = v_tR_Y/R_Z$.`,
      ],
      sol: md`
**What to see first:** the old branches have not changed. $M_5$ and $M_6$ connect their drains to the test node and their sources to $V_{DD}$; their gates draw no current. So we only **add** new paths in parallel.

**Step 1: each PMOS in the model.** Between its drain (the test node) and source ($V_{DD}$, incremental ground) there is $r_{ds}$ in parallel with a dependent source $g_mv_{gs}$. With the source at incremental ground, $v_{gs} = v_{gate}$. The current drawn out of the test node is
$$i = \frac{v_t}{r_{ds}} + g_mv_{gate}$$
If $v_{gate} = Kv_t$, the dependent source looks like a resistor $\dfrac{1}{g_mK}$.

**Step 2: how far does node $A$ move?** The left branch draws $i_1 = v_t/R_X$. All of it flows through the diode $M_2$ (resistance $1/g_{m2}$), so
$$v_A = \frac{i_1}{g_{m2}} = \frac{v_t}{g_{m2}R_X} \;\Rightarrow\; M_5\text{ adds } \frac{1}{g_{m5}}\cdot g_{m2}R_X = \frac{g_{m2}R_X}{g_{m5}}$$

**Step 3: how far does node $Y$ move?** The right branch draws $i_2 = v_t/R_Z$. It passes through $M_3$ and all of it ends up in $R_Y$, so
$$v_Y = i_2R_Y = v_t\frac{R_Y}{R_Z} \;\Rightarrow\; M_6\text{ adds } \frac{R_Z}{g_{m6}R_Y}$$

**Step 4: everything in parallel.**
$$R_{EQ2} = R_X\parallel R_Z\parallel r_{ds5}\parallel r_{ds6}\parallel\frac{g_{m2}R_X}{g_{m5}}\parallel\frac{R_Z}{g_{m6}R_Y}$$

**Sanity check on sizes:** $R_X \approx r_{ds}$ and $R_Y \approx \tfrac1{g_{m4}}$, $R_Z \approx \tfrac1{g_{m3}}$. So the $M_5$ term is on the order of $r_{ds}$ (node $A$ barely moves), while the $M_6$ term is $\approx \dfrac{g_{m4}}{g_{m3}g_{m6}}$, on the order of $1/g_m$: node $Y$ follows the test node by about $g_{m3}/g_{m4}$, so $M_6$ behaves almost like another diode. The small terms win:
$$R_{EQ2} \approx \frac1{g_{m3}}\parallel\frac{g_{m4}}{g_{m3}g_{m6}}$$

**Pattern:** a gate that moves with the test node by a fraction $K$ turns that transistor's $g_m$ into a resistor $1/(g_mK)$. This is the K rule from Unit 7 in its simplest form (here the moving gate belongs to a device whose own source is still).`,
    }),

    P({
      id: 'e2hkn-ex1', src: 'HKN review · Incremental gain example 1', title: 'Follower, then inverter, then cascode', big: true,
      q: md`Determine the incremental gains $A_1 = v_1/v_{in}$, $A_2 = v_2/v_1$, $A_3 = v_{out}/v_2$, and $A_v = v_{out}/v_{in}$. All transistors are in saturation, $r_{ds}\ne\infty$, $g_mr_{ds}\gg1$.`,
      fig: figEx1,
      parts: [
        E2.ex(E1A1, ['gm1', 'rds1', 'gm2', 'rds2', 'R1'], 'A_1'),
        E2.ex(E1A2, ['gm3', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'R2'], 'A_2'),
        E2.ex(E1A3, ['gm6', 'rds6', 'gm7', 'rds7', 'R3'], 'A_3'),
        E2.ex(`${E1A1}*${E1A2}*${E1A3}`, ['gm1', 'rds1', 'gm2', 'rds2', 'R1', 'gm3', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'R2', 'gm6', 'rds6', 'gm7', 'rds7', 'R3'], 'A_v'),
      ],
      hints: [
        md`Name each stage. $M_1$: gate in, source out, drain on $V_{DD}$: a **source follower**. $M_4$ and $M_5$ share the gate $v_1$ and both drains are $v_2$: two **common source** devices (an inverter), each with something in its source. $M_7$ + $M_6$: a **cascode** with load $R_3$.`,
        md`Each stage: $A = -G_MR_{out}$. Follower: $G_M = -g_{m1}$ (it pushes current *into* the output), $R_{out} = \tfrac1{g_{m1}}\parallel(\text{what }M_2\text{'s drain looks like})$.`,
        md`Stage 2: $M_4$ has the diode $M_3$ ($1/g_{m3}$) at its source; $M_5$ has $R_2$. $G_{M2} = \dfrac{g_{m4}}{1 + g_{m4}/g_{m3}} + \dfrac{g_{m5}}{1 + g_{m5}R_2}$. Stage 3: $G_{M3}\approx g_{m7}$, $R_{out3} = R_3\parallel(\text{cascode})$.`,
      ],
      sol: md`
**What to see first:** three stages in a row, each one's output is the next one's gate (gates draw no current, so no stage loads the one before it). So $A_v = A_1A_2A_3$, and each $A = -G_MR_{out}$.

**Stage 1: $M_1$ is a source follower** (input at the gate, output at the source, drain on $V_{DD}$). $M_2$ (gate held, $R_1$ at its source) is its current-source load.

- $G_{M1}$: short $v_1$ to ground. $M_1$ then has $v_{gs} = v_{in}$ and pushes $g_{m1}v_{in}$ **into** the output node. "Pulled down into the stage" is the opposite direction, so $G_{M1} = -g_{m1}$.
- $R_{out1}$: looking into $M_1$'s source gives $\tfrac1{g_{m1}}$ (with $r_{ds1}$ in parallel); looking down into $M_2$'s drain gives the degenerated-drain value $r_{ds2} + R_1 + g_{m2}r_{ds2}R_1$.
$$A_1 = -G_{M1}R_{out1} = g_{m1}\Big[\frac1{g_{m1}}\parallel(r_{ds2} + R_1 + g_{m2}r_{ds2}R_1)\Big] \approx 1$$
Positive and just under 1: a follower.

**Stage 2: $M_4$ (PMOS) and $M_5$ (NMOS) are both common source**, gates together at $v_1$, drains together at $v_2$. Each has something in its source: $M_4$ has the diode $M_3$ ($\approx 1/g_{m3}$), $M_5$ has $R_2$.

- $G_{M2}$: short $v_2$. $v_1$ up makes $M_5$ pull more current down **and** makes $M_4$ push less current in. Both count as "pulled down", so they add. Each is a degenerated common source, $G_M = g_m/(1 + g_mR_S)$:
$$G_{M2} = \frac{g_{m4}}{1 + g_{m4}\cdot\frac1{g_{m3}}} + \frac{g_{m5}}{1 + g_{m5}R_2}$$
- $R_{out2}$: up through $M_4$'s drain, with $1/g_{m3}$ at its source; down through $M_5$'s drain, with $R_2$ at its source:
$$R_{out2} = \Big(r_{ds4} + \frac1{g_{m3}} + \frac{g_{m4}r_{ds4}}{g_{m3}}\Big)\parallel(r_{ds5} + R_2 + g_{m5}r_{ds5}R_2)$$
$$A_2 = -G_{M2}R_{out2}$$
Large and negative (the output resistance is on the order of $r_{ds}$).

**Stage 3: $M_7$ (common source, input $v_2$) with $M_6$ stacked on top (gate held): a cascode**, load $R_3$.

- $G_{M3}$: short $v_{out}$. $M_7$ makes $g_{m7}v_2$; nearly all of it goes up through $M_6$ (whose source looks like $1/g_{m6}$, much smaller than $r_{ds7}$). The exact split is $G_{M3} = g_{m7}r_{ds7}\dfrac{g_{m6}}{1 + g_{m6}r_{ds7}} \approx g_{m7}$.
- $R_{out3}$: $R_3$ up; down, looking into $M_6$'s drain with $r_{ds7}$ under its source:
$$R_{out3} = R_3\parallel(r_{ds6} + r_{ds7} + g_{m6}r_{ds6}r_{ds7}) \approx R_3$$
$$A_3 = -G_{M3}R_{out3} \approx -g_{m7}R_3$$

**Overall:**
$$A_v = A_1A_2A_3$$
Signs: $(+)(-)(-) = +$. The follower passes the signal, the inverter flips it, the cascode flips it back.`,
    }),

    P({
      id: 'e2hkn-ex2a', src: 'HKN review · Incremental gain example 2(a)', title: 'Common source degenerated by a node that is not a resistor', big: true,
      q: md`Determine $A_v = v_{out}/v_{in}$. All transistors in saturation, $r_{ds}\ne\infty$, $g_mr_{ds}\gg1$. $M_2$'s gate is at incremental ground; $M_1$ is a diode-connected PMOS; $M_4$'s gate is at incremental ground.`,
      fig: figEx2(false),
      parts: [E2.ex(`-${E2GM}*(rds2 || ${E2RY})`, N2, 'A_v')],
      hints: [
        md`$M_3$ is the input device (gate in, drain out). Its source sits on node $X$. What does $X$ look like? Down: $r_{ds4}$. Up: $R$ in series with the diode $M_1$.`,
        md`$R_X = r_{ds4}\parallel\big(R + \tfrac1{g_{m1}}\big)$. Then $M_3$ is a common source with a source resistor $R_X$: $G_M = \dfrac{g_{m3}}{1 + g_{m3}R_X}$.`,
        md`$R_{out}$: up, $M_2$ is a plain current source, $r_{ds2}$. Down, $M_3$'s drain with $R_X$ under its source: $R_Y = r_{ds3} + R_X + g_{m3}r_{ds3}R_X$.`,
      ],
      sol: md`
**What to see first:** $M_3$ is a **common source with something in its source**. Whatever sits at node $X$ acts like the degeneration resistor, so find its resistance first.

**Step 1: $R_X$.** From $X$, looking down: $M_4$ with gate and source both at incremental ground, so just $r_{ds4}$. Looking up: $R$ in series with the diode-connected $M_1$ ($\approx 1/g_{m1}$), ending at $V_{DD}$ (incremental ground). In parallel:
$$R_X = r_{ds4}\parallel\Big(R + \frac1{g_{m1}}\Big)$$

**Step 2: $G_M$.** Short the output. $M_3$ is a degenerated common source:
$$G_M = \frac{g_{m3}}{1 + g_{m3}R_X}$$

**Step 3: $R_{out}$.** Up: $M_2$, gate held, source on $V_{DD}$: $r_{ds2}$. Down: $M_3$'s drain with $R_X$ at its source:
$$R_Y = r_{ds3} + R_X + g_{m3}r_{ds3}R_X,\qquad R_{out} = r_{ds2}\parallel R_Y$$

**Step 4:**
$$A_v = -G_MR_{out} = -\frac{g_{m3}}{1 + g_{m3}R_X}\,(r_{ds2}\parallel R_Y)$$
Since $R_Y \gg r_{ds2}$, $A_v \approx -\dfrac{g_{m3}r_{ds2}}{1 + g_{m3}R_X} \approx -\dfrac{r_{ds2}}{R_X}$ when $g_{m3}R_X \gg 1$.`,
    }),

    P({
      id: 'e2hkn-ex2b', src: 'HKN review · Incremental gain example 2(b)', title: 'Same circuit, but $M_2$ mirrors $M_1$: a second path', big: true,
      q: md`Same circuit as (a), except $M_2$'s gate is now tied to $M_1$'s gate (a current mirror). Determine $A_v = v_{out}/v_{in}$. Saturation, $r_{ds}\ne\infty$, $g_mr_{ds}\gg1$.`,
      fig: figEx2(true),
      parts: [E2.ex(`-(${E2GM}*(1 + gm2*${E2K}))*(rds2 || ${E2RY} || (${E2RY}/(gm2*${E2K})))`, N2, 'A_v')],
      hints: [
        md`$R_X$, the $M_3$ path, and $R_Y$ are unchanged. What is new: $M_2$'s gate is no longer still. It sits at the top of the $R$ + diode branch, so it moves whenever $X$ moves.`,
        md`If a current $i$ goes into $X$: $v_X = iR_X$, and the divider gives $M_1$'s gate $v_{g} = v_X\dfrac{1/g_{m1}}{R + 1/g_{m1}}$. $M_2$ then pulls $g_{m2}v_g$ out of the output (its gate went up, so a PMOS pushes **less**).`,
        md`$G_M$: multiply (a)'s $G_M$ by $\Big[1 + g_{m2}\,\dfrac{R_X/g_{m1}}{R + 1/g_{m1}}\Big]$. $R_{out}$: add one more parallel term, $\dfrac{R_Y(R + 1/g_{m1})}{g_{m2}R_X/g_{m1}}$.`,
      ],
      sol: md`
**What changed:** in (a), $M_2$'s gate was still. Now it is tied to $M_1$'s gate, which is the top of the $R$ + diode branch hanging off node $X$. So **when $X$ moves, $M_2$'s gate moves**, and $M_2$ adds a second way for the signal to reach the output.

**Step 1: how far does $M_2$'s gate move?** Suppose a current $i$ flows down through $M_3$ into $X$. Then $v_X = iR_X$. The up-branch from $X$ is $R$ then the diode ($1/g_{m1}$) to $V_{DD}$; the diode's top is $M_1$'s gate. Voltage divider:
$$v_g = v_X\,\frac{1/g_{m1}}{R + 1/g_{m1}} = i\,\underbrace{\frac{R_X/g_{m1}}{R + 1/g_{m1}}}_{\text{call it }K}$$
($K$ has units of ohms: gate volts per amp into $X$.)

**Step 2: $G_M$.** Short the output. $M_3$ pulls $i = G_{M,a}v_{in}$ down, with $G_{M,a} = \dfrac{g_{m3}}{1 + g_{m3}R_X}$ as in (a). That current lifts $M_1$'s gate by $Kv_{in}G_{M,a}$, which lowers $M_2$'s source-gate voltage, so $M_2$ pushes **less** current into the output: another $g_{m2}K\,i$ effectively pulled down. Total:
$$G_M = G_{M,a}\big(1 + g_{m2}K\big) = \frac{g_{m3}}{1 + g_{m3}R_X}\left[1 + \frac{g_{m2}}{g_{m1}}\cdot\frac{r_{ds4}}{R + \frac1{g_{m1}} + r_{ds4}}\right]$$
(using $R_X\cdot\dfrac{1/g_{m1}}{R + 1/g_{m1}} = \dfrac{r_{ds4}/g_{m1}}{R + 1/g_{m1} + r_{ds4}}$). With $r_{ds4}$ large the bracket is about $1 + g_{m2}/g_{m1}$: the mirror roughly doubles $G_M$ when $M_1$ and $M_2$ match.

**Step 3: $R_{out}$.** Turn off $v_{in}$ and push $v_t$ into the output. The current down through $M_3$ is $i = v_t/R_Y$ (same $R_Y$ as (a)). It moves $M_2$'s gate by $Ki = Kv_t/R_Y$, and $M_2$ then draws an extra $g_{m2}Kv_t/R_Y$ out of the node. That looks like a resistor $\dfrac{R_Y}{g_{m2}K}$ in parallel:
$$R_{out} = r_{ds2}\parallel R_Y\parallel\frac{R_Y}{g_{m2}K} = r_{ds2}\parallel R_Y\parallel\frac{g_{m1}\big(R + \frac1{g_{m1}} + r_{ds4}\big)R_Y}{g_{m2}\,r_{ds4}}$$

**Step 4:**
$$A_v = -G_MR_{out}$$

**Pattern:** a mirror whose input branch carries the signal current turns a current-source load into a **second signal path**: it raises $G_M$ (both devices now pull the same way) and lowers $R_{out}$ (one extra parallel term). Same idea as the mirror loads in Unit 9.`,
    }),

    R(md`
      ### What these examples drill

      | Example | The move |
      |---|---|
      | DC | Edge of saturation compares drain to gate; mirrors copy current by size ratio |
      | $R_{EQ1}$ | Split into branches; bottom-up; the diode-with-drain-resistor shortcut |
      | $R_{EQ2}$ | A gate that follows the test node by $K$ adds $1/(g_mK)$ in parallel |
      | Gain 1 | Name each stage, then $A = -G_MR_{out}$ per stage and multiply |
      | Gain 2 | A node that is not a resistor still degenerates; a mirror adds a second path |

      Next: the same paper the slides end on, **[Practice Exam 2](#/l/e2-p2)**, timed.
    `),
  ];

  E2.lesson('e2-pracu', { id: 'e2-hkn', title: 'HKN review session problems', kind: 'exam', steps });
})();

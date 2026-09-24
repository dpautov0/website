/* Unit 1 — linearity, Thévenin/Norton with dependent sources, two-ports.
   Includes Problem Set 1 and every past-midterm "Problem 1". */
(function () {
  const { R, P, G } = C;
  window.EXAM = window.EXAM || {};
  const X = window.EXAM;

  // Variable ranges for symbolic checking (all positive).
  const RNG = {
    gm: [2e-4, 2e-2], gm1: [2e-4, 2e-2], gm2: [2e-4, 2e-2], GM: [2e-4, 2e-2],
    RD: [500, 5e4], RS: [100, 1e4], RO: [1e3, 1e5], RL: [500, 5e4], RF: [1e3, 1e5],
    R1: [200, 2e4], R2: [200, 2e4], R3: [200, 2e4], R4: [200, 2e4], R5: [200, 2e4],
    vin: [0.01, 2], iin: [1e-5, 1e-2], VIN: [0.5, 5], Av: [0.05, 0.9], A: [0.5, 20], K: [1e-4, 1e-2],
  };
  const D = {
    gm: 'g_m', gm1: 'g_{m1}', gm2: 'g_{m2}', GM: 'G_M', RD: 'R_D', RS: 'R_S', RO: 'R_O', RL: 'R_L', RF: 'R_F',
    R1: 'R_1', R2: 'R_2', R3: 'R_3', R4: 'R_4', R5: 'R_5', vin: 'v_{in}', iin: 'i_{in}', VIN: 'V_{IN}', Av: 'A_v', A: 'A', K: 'K',
  };
  const ex = (expr, vars, lbl) => ({ lbl, expr, vars: Object.fromEntries(vars.map((v) => [v, RNG[v]])), disp: D });

  // ---------------------------------------------------------------- Problem Set 1
  const fig14 = [
    ['V', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0]],
    ['R', [0, 0], [1.3, 0], { n: 'R_X' }], ['term', [1.3, 0]], ['term', [1.3, 0.9]], ['w', [1.3, 0.9], [1.3, 1.6], [4.2, 1.6]], ['gnd', [2.6, 1.6]],
    ['vlab', [1.55, 0.1], [1.55, 0.8], { n: 'v_{x1}' }],
    ['G', [2.6, 0], [2.6, 1.6], { n: 'g_{m1}v_{x1}' }], ['R', [4.2, 0], [4.2, 1.6], { n: 'R_1' }], ['w', [2.6, 0], [4.2, 0], [5, 0]],
    ['term', [5, 0]], ['term', [5, 0.9]], ['w', [5, 0.9], [5, 1.6], [7.9, 1.6]], ['gnd', [6.3, 1.6]],
    ['vlab', [5.25, 0.1], [5.25, 0.8], { n: 'v_{x2}' }],
    ['G', [6.3, 0], [6.3, 1.6], { n: 'g_{m2}v_{x2}' }], ['R', [7.9, 0], [7.9, 1.6], { n: 'R_2' }], ['w', [6.3, 0], [7.9, 0], [8.7, 0]],
    ['term', [8.7, 0], { n: 'v_{out}' }],
  ];
  const fig15 = [
    ['V', [0, 0.5], [0, 1.5], { s: '12\\,\\text{V}', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_1' }],
    ['R', [1.8, 0], [1.8, 1.8], { n: 'R_2' }], ['w', [1.8, 0], [2.8, 0]], ['term', [2.8, 0], { n: 'A' }],
    ['w', [0, 1.5], [0, 1.8], [2.8, 1.8]], ['term', [2.8, 1.8], { n: 'B' }], ['gnd', [0, 1.8]],
  ];
  const fig16 = [
    ['V', [0, 0.7], [0, 1.7], { s: '18\\,\\text{V}', side: 'l' }], ['gnd', [0, 1.7]], ['w', [0, 0.7], [0, 0]],
    ['R', [0, 0], [2, 0], { n: 'R_1' }], ['node', [2, 0], { n: 'A', side: 'a' }], ['w', [2, 0], [2.9, 0]],
    ['R', [2, 0], [2, 1.4], { n: 'R_2', side: 'l' }], ['term', [2, 1.4], { n: 'B', side: 'b' }], ['w', [2, 1.4], [2, 1.7]], ['gnd', [2, 1.7]],
    ['R', [2.9, 0], [2.9, 1.3], { s: '6\\kO' }], ['V', [2.9, 1.3], [2.9, 2.3], { s: '6\\,\\text{V}' }], ['gnd', [2.9, 2.3]],
  ];

  const PS1 = [
    P({
      id: 'PS1-1', src: 'Problem Set 1 · #1', title: 'Norton equivalent of a feedback amplifier', big: true,
      q: md`Find the Norton equivalent seen at $v_{out}$: the Norton current $\IN$, the Norton resistance $\RN$, and the Thévenin voltage $\VTH$. (The $v_x$ terminals are an open sensing port.)`,
      fig: FIGS.feedback(),
      parts: [ex('iin*(RO + Av*RF)/RO', ['iin', 'RF', 'RO', 'RL', 'Av'], '\\IN'), ex('RO*RL/(RO + (1-Av)*RL)', ['iin', 'RF', 'RO', 'RL', 'Av'], '\\RN'), ex('iin*RL*(RO + Av*RF)/(RO + (1-Av)*RL)', ['iin', 'RF', 'RO', 'RL', 'Av'], '\\VTH')],
      hints: [
        md`Node $x$ touches only $i_{in}$ and $R_F$ (the sensing port draws nothing), so $v_x = v_{out} + i_{in}R_F$ no matter what loads the output.`,
        md`**$\IN$:** short the output ($v_{out}=0$). Then $v_x = i_{in}R_F$; add the currents arriving through $R_F$ and $R_O$ ($R_L$ has 0 V across it).`,
        md`**$\RN$:** open $i_{in}$. Now no current can flow in $R_F$, so $v_x = v_t$. Sum the currents leaving the output into $R_F$, $R_O$ and $R_L$.`,
      ],
      sol: md`$v_x = v_{out} + i_{in}R_F$ (KCL at $x$).

**Short circuit:** $v_x = i_{in}R_F$. Current into the short: $i_{in}$ through $R_F$ plus $\dfrac{A_vi_{in}R_F}{R_O}$ through $R_O$:
$$\IN = i_{in}\frac{R_O + A_vR_F}{R_O}$$

**Test source** ($i_{in}$ open): $R_F$ carries nothing, so $v_x = v_t$:
$$i_t = 0 + \frac{(1-A_v)v_t}{R_O} + \frac{v_t}{R_L}\;\Rightarrow\;\RN = \frac{R_OR_L}{R_O + (1-A_v)R_L}$$

$\VTH = \IN\RN = i_{in}\dfrac{R_L(R_O+A_vR_F)}{R_O+(1-A_v)R_L}$.

**Two checks:** $A_v = 0$ gives $\RN = R_O\pl R_L$. ✓ And $\RN$ goes **negative** once $A_v > 1 + R_O/R_L$. That's legal with a dependent source.`,
    }),
    P({
      id: 'PS1-2', src: 'Problem Set 1 · #2', title: 'Degenerated common-source stage', big: true,
      q: md`Find the Thévenin equivalent at $v_{out}$: $\VTH$, $\RTH$ and $\IN$.`,
      fig: FIGS.cs(),
      parts: [ex('-gm*RD*vin/(1+gm*RS)', ['gm', 'RD', 'RS', 'vin'], '\\VTH'), ex('RD', ['gm', 'RD', 'RS', 'vin'], '\\RTH'), ex('-gm*vin/(1+gm*RS)', ['gm', 'RD', 'RS', 'vin'], '\\IN')],
      hints: [
        md`KCL at the source node $s$: the dependent current $g_mv_x$ is the only current in, and it all leaves through $R_S$. So $v_s = g_mR_Sv_x$, with $v_x = v_{in} - v_s$.`,
        md`For $\RTH$, ground $v_{in}$ and look at what $v_x$ is forced to.`,
      ],
      sol: md`KCL at $s$: $g_mv_x = v_s/R_S$, and $v_x = v_{in} - v_s$, so $v_x = \dfrac{v_{in}}{1+g_mR_S}$.

Output open: $v_{out}/R_D + g_mv_x = 0 \Rightarrow \VTH = -\dfrac{g_mR_D}{1+g_mR_S}v_{in}$.

**$\RTH$:** with $v_{in}=0$, $v_x = -v_s$, and KCL at $s$ becomes $v_s(g_m + 1/R_S) = 0$. So $v_s = 0$ and $v_x = 0$: **the dependent source is dead**, and $\RTH = R_D$.

$\IN = \VTH/\RTH = -\dfrac{g_m}{1+g_mR_S}v_{in}$. The factor $1+g_mR_S$ is called **degeneration**; you'll see it all semester.`,
    }),
    P({
      id: 'PS1-3', src: 'Problem Set 1 · #3', title: 'Source follower', big: true,
      q: md`Find the Thévenin equivalent at $v_{out}$. (The top rail is ground; $R_O$ plays the transistor's $r_o$.)`,
      fig: FIGS.follower(),
      parts: [ex('gm*(RS||RO)*vin/(1+gm*(RS||RO))', ['gm', 'RS', 'RO', 'vin'], '\\VTH'), ex('1/gm || RS || RO', ['gm', 'RS', 'RO', 'vin'], '\\RTH'), ex('gm*vin', ['gm', 'RS', 'RO', 'vin'], '\\IN')],
      hints: [md`Here $v_x = v_{in} - v_{out}$, because the $-$ sensing terminal is the output node itself.`, md`Test source with $v_{in}=0$: $v_x = -v_t$, so the source draws $g_mv_t$. What single element behaves like that?`],
      sol: md`KCL at the output: $\dfrac{v_{out}}{R_S} + \dfrac{v_{out}}{R_O} = g_m(v_{in} - v_{out})$. With $R' = R_S\pl R_O$:
$$\VTH = \frac{g_mR'}{1+g_mR'}v_{in}$$
positive and always less than one.

**$\RTH$:** $v_x = -v_t$, so the dependent source pulls $g_mv_t$ from the test source, exactly like a resistor $1/g_m$ to ground. $\RTH = \dfrac{1}{g_m}\pl R_S\pl R_O$. **Looking into a source terminal you see $1/g_m$.**

**$\IN$:** short the output: $v_x = v_{in}$, and $R_S$, $R_O$ have 0 V across them, so all of $g_mv_{in}$ goes through the short: $\IN = g_mv_{in}$.`,
    }),
    P({
      id: 'PS1-4', src: 'Problem Set 1 · #4', title: 'Two-stage cascade',
      q: md`Find $v_{out}$ in terms of $v_{in}$ (brute force, or by reusing Problem 2 with $R_S = 0$).`,
      fig: fig14,
      parts: [ex('gm1*gm2*R1*R2*vin', ['gm1', 'gm2', 'R1', 'R2', 'vin'], 'v_{out}')],
      hints: [md`The $v_{x1}$ port draws no current, so $R_X$ drops nothing: $v_{x1} = v_{in}$.`, md`Each stage is Problem 2 with $R_S=0$: output $= -g_mRv_x$, and the next stage's sensing port doesn't load it.`],
      sol: md`$v_{x1} = v_{in}$ (no current in $R_X$). Stage 1: $v_{x2} = -g_{m1}R_1v_{in}$ (unloaded, since $v_{x2}$ is an open port). Stage 2: $v_{out} = -g_{m2}R_2v_{x2}$.
$$v_{out} = g_{m1}g_{m2}R_1R_2\,v_{in}$$
Multiplying stage gains is only legal because each stage has **infinite input resistance**. With a finite $R_{in}$ you'd get a divider $\dfrac{R_{in}}{R_{TH1}+R_{in}}$ between the stages.`,
    }),
    P({
      id: 'PS1-5', src: 'Problem Set 1 · #5', title: 'Resistors from a Thévenin equivalent',
      q: md`At $A$–$B$, $\VTH = 8\,\text{V}$ and $\RTH = 2\kO$. Find $R_1$ and $R_2$.`,
      fig: fig15,
      parts: [{ lbl: 'R_1', unit: 'kΩ', ans: 3 }, { lbl: 'R_2', unit: 'kΩ', ans: 6 }],
      hints: [md`$\VTH = 12\frac{R_2}{R_1+R_2}$ and $\RTH = R_1\pl R_2$. Start with the ratio equation.`],
      sol: md`$12\frac{R_2}{R_1+R_2} = 8 \Rightarrow R_2 = 2R_1$. Then $R_1\pl 2R_1 = \tfrac23R_1 = 2\kO \Rightarrow R_1 = 3\kO$, $R_2 = 6\kO$.

Check through Norton: shorting $A$–$B$ shorts $R_2$, so $\IN = 12/3 = 4\,\text{mA} = \VTH/\RTH$. ✓`,
    }),
    P({
      id: 'PS1-6', src: 'Problem Set 1 · #6', title: 'Resistors from a Norton equivalent',
      q: md`At $A$–$B$, $\IN = 7\,\text{mA}$ and $\RN = 1.5\kO$. Find $R_1$ and $R_2$.`,
      fig: fig16,
      parts: [{ lbl: 'R_1', unit: 'kΩ', ans: 3 }, { lbl: 'R_2', unit: 'kΩ', ans: 6 }],
      hints: [md`Short $A$ to $B$ (ground): $R_2$ then has 0 V across it, and both sources push current into the short.`, md`For $\RN$, short both voltage sources: three resistors from $A$ to ground in parallel.`],
      sol: md`**Short:** $\IN = \dfrac{18}{R_1} + \dfrac{6}{6} = 7 \Rightarrow R_1 = 3\kO$.

**Sources off:** $\RN = R_1\pl R_2\pl 6\kO$. $3\pl6 = 2\kO$, and $2\pl R_2 = 1.5 \Rightarrow R_2 = 6\kO$.

Cross-check: open-circuit nodal at $A$ gives $V_A = 10.5\,\text{V} = \IN\RN$. ✓`,
    }),
  ];

  // ---------------------------------------------------------------- past midterms (Problem 1s)
  X.F22P1 = P({
    id: 'F22-P1', src: 'Midterm · Fall 2022 · P1 (25 pts)', title: 'Thévenin with two dependent sources', big: true,
    q: md`Find the Thévenin equivalent across $a$–$b$ of the circuit driving $R_L$. $V_{IN}$ is an independent input. The VCVS produces $AV_E$, where $V_E$ is sensed at the $R_1$–$R_2$ junction; the VCCS $G_MV_X$ pushes current **up** out of node $a$; $V_X$ is sensed between the VCVS output ($+$) and $V_{IN}$ ($-$).`,
    fig: [
      ['term', [4, -1.1], { n: 'V_{IN}', side: 'a' }], ['w', [4, -1.1], [4, -0.6]], ['w', [3, -0.6], [5, -0.6]],
      ['w', [3, -0.6], [3, -0.3]], ['term', [3, -0.3]], ['term', [3, 0.4]], ['vlab', [2.72, 0.3], [2.72, -0.2], { n: 'V_X', side: 'l' }],
      ['w', [3, 0.4], [3, 0.8]], ['E', [3, 0.8], [3, 1.8], { n: 'AV_E', side: 'l' }], ['gnd', [3, 1.8]],
      ['G', [5, 1], [5, -0.6], { n: 'G_MV_X' }],
      ['node', [5, 1], { n: 'a', side: 'al' }], ['w', [5, 1], [6.2, 1]], ['term', [6.2, 1], { n: 'a', side: 'a' }],
      ['w', [6.2, 1], [7, 1]], ['R', [7, 1], [7, 2.3], { n: 'R_L' }], ['gnd', [7, 2.3]], ['term', [6.2, 2.3], { n: 'b', side: 'b' }], ['w', [6.2, 2.3], [7, 2.3]],
      ['R', [5, 1], [5, 2.4], { n: 'R_1' }], ['R', [5, 2.4], [5, 3.7], { n: 'R_2' }], ['gnd', [5, 3.7]],
      ['term', [1.4, 0.4]], ['w', [1.4, 0.4], [0.6, 0.4]], ['gnd', [0.6, 0.4]], ['term', [1.4, 1.1]], ['w', [1.4, 1.1], [1.4, 2.4], [5, 2.4]],
      ['vlab', [1.15, 1.0], [1.15, 0.5], { n: 'V_E', side: 'l' }],
    ],
    parts: [ex('GM*VIN*(R1+R2)/(1+A*GM*R2)', ['GM', 'A', 'R1', 'R2', 'VIN'], '\\VTH'), ex('(R1+R2)/(1+A*GM*R2)', ['GM', 'A', 'R1', 'R2', 'VIN'], '\\RTH')],
    hints: [
      md`With the port open, $R_1$ and $R_2$ carry the same current, so $V_E = V_a\frac{R_2}{R_1+R_2}$.`,
      md`$V_X = AV_E - V_{IN}$. KCL at $a$: $\frac{V_a}{R_1+R_2} + G_MV_X = 0$ (the VCCS current leaves $a$).`,
      md`For $\RTH$ set $V_{IN}=0$; the same KCL with a test voltage gives $i_t = v_t\frac{1 + AG_MR_2}{R_1+R_2}$.`,
    ],
    sol: md`**Open circuit.** $V_E = V_a\dfrac{R_2}{R_1+R_2}$, $V_X = AV_E - V_{IN}$. KCL at $a$:
$$\frac{V_a}{R_1+R_2} + G_M\left(A\frac{R_2}{R_1+R_2}V_a - V_{IN}\right) = 0\;\Rightarrow\;\VTH = \frac{G_MV_{IN}(R_1+R_2)}{1+AG_MR_2}$$

**Test source**, $V_{IN} = 0$: $i_t = \dfrac{v_t}{R_1+R_2} + G_MA\dfrac{R_2}{R_1+R_2}v_t$, so
$$\RTH = \frac{R_1+R_2}{1+AG_MR_2}$$

Check: $\IN = \VTH/\RTH = G_MV_{IN}$, and directly, shorting $a$ makes $V_E=0$, $V_X = -V_{IN}$, so $G_MV_{IN}$ flows into the short. ✓ This is negative feedback: $R_1+R_2$ is divided by $1 + (\text{loop gain } AG_MR_2)$.

*If your grader includes $R_L$ in the equivalent, it simply appears in parallel: $\RTH\pl R_L$ and $\VTH\frac{R_L}{\RTH+R_L}$.*`,
  });

  X.P6P1 = P({
    id: 'P6-P1', src: 'Midterm practice · P1 (20 pts)', title: 'Transimpedance gain',
    q: md`Find the transimpedance gain $A_R = V_{OUT}/I_{IN}$ in terms of $g_{m1}$, $R_F$ and $R_1$.`,
    fig: FIGS.transR(),
    parts: [ex('(1 - gm1*RF)/(1/R1 + gm1)', ['gm1', 'RF', 'R1'], 'A_R')],
    hints: [md`$I_{IN}$ can only go through $R_F$: $V_X = V_{OUT} + I_{IN}R_F$.`, md`KCL at the output: $I_{IN}$ arrives through $R_F$ and leaves via $R_1$ and the dependent source.`],
    sol: md`$I_{IN} = \dfrac{V_X - V_{OUT}}{R_F} \Rightarrow V_X = V_{OUT} + I_{IN}R_F$.

KCL at the output: $\dfrac{V_{OUT}}{R_1} + g_{m1}V_X = I_{IN} \Rightarrow \dfrac{V_{OUT}}{R_1} + g_{m1}(V_{OUT} + I_{IN}R_F) = I_{IN}$.
$$A_R = \frac{1 - g_{m1}R_F}{\tfrac{1}{R_1} + g_{m1}}$$`,
  });

  X.P4P1 = P({
    id: 'P4-P1', src: 'Midterm practice · P1 (20 pts)', title: 'Gain through a VCVS and a degenerated stage', big: true,
    q: md`Determine $A_V = V_{OUT}/V_{IN}$. Both $V_X$ and $V_Y$ are open sensing ports.`,
    fig: [
      ['V', [0, 0.4], [0, 1.4], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 1.4]], ['w', [0, 0.4], [0, 0], [1.2, 0]], ['term', [1.2, 0]],
      ['term', [1.2, 0.9]], ['w', [1.2, 0.9], [1.2, 1.4], [2.4, 1.4]], ['gnd', [1.8, 1.4]], ['vlab', [1.45, 0.1], [1.45, 0.8], { n: 'V_X' }],
      ['E', [2.4, 0.4], [2.4, 1.4], { n: '10V_X' }], ['w', [2.4, 0.4], [2.4, 0]], ['R', [2.4, 0], [3.8, 0], { n: 'R_D' }], ['term', [3.8, 0]],
      ['term', [3.8, 0.9]], ['w', [3.8, 0.9], [3.8, 1.4], [5.2, 1.4]], ['vlab', [4.05, 0.1], [4.05, 0.8], { n: 'V_Y' }],
      ['R', [4.5, 1.4], [4.5, 2.7], { n: 'R_S' }], ['gnd', [4.5, 2.7]],
      ['G', [5.2, 0], [5.2, 1.4], { n: 'g_mV_Y' }], ['w', [5.2, 0], [6.5, 0]], ['R', [6.5, 0], [6.5, 1.4], { n: 'R_1' }], ['gnd', [6.5, 1.4]],
      ['R', [6.5, 0], [7.9, 0], { n: 'R_2' }], ['R', [7.9, 0], [7.9, 1.4], { n: 'R_3' }], ['gnd', [7.9, 1.4]], ['w', [7.9, 0], [8.6, 0]], ['term', [8.6, 0], { n: 'V_{OUT}' }],
    ],
    parts: [ex('-10*gm*R1*R3/((1+gm*RS)*(R1+R2+R3))', ['gm', 'RS', 'RD', 'R1', 'R2', 'R3'], 'A_V')],
    hints: [md`$R_D$ feeds an **open** port, so it carries no current: the $+$ side of $V_Y$ sits at $10V_X = 10V_{IN}$.`, md`The degenerated stage gives $V_Y = \frac{10V_{IN}}{1+g_mR_S}$. Then $g_mV_Y$ is pulled out of the top node, which sees $R_1 \pl (R_2+R_3)$.`],
    sol: md`$V_X = V_{IN}$. No current flows in $R_D$, so the $+$ terminal of $V_Y$ is at $10V_{IN}$. KCL at the source node: $g_mV_Y = V_S/R_S$ with $V_Y = 10V_{IN} - V_S$, so $V_Y = \dfrac{10V_{IN}}{1+g_mR_S}$.

The current $g_mV_Y$ is pulled out of the top node, which sees $R_1\pl(R_2+R_3)$ to ground: $V_P = -g_mV_Y\,[R_1\pl(R_2+R_3)]$. The output is the $R_2$–$R_3$ divider of $V_P$:
$$A_V = -\frac{10g_m}{1+g_mR_S}\cdot\frac{R_1R_3}{R_1+R_2+R_3}$$
$R_D$ doesn't appear, which is the point of the open port.`,
  });

  X.P5P1 = P({
    id: 'P5-P1', src: 'Midterm practice · P1 (20 pts)', title: 'Gain with a floating sensing resistor', big: true,
    q: md`Determine $A_V = V_{OUT}/V_{IN}$. The VCCS $g_mV_X$ is controlled by the voltage across $R_2$.`,
    fig: [
      ['V', [0, 0.5], [0, 1.5], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 1.5]], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.6, 0], { n: 'R_1' }],
      ['R', [1.6, 0], [1.6, 1.4], { n: 'R_2', side: 'l' }], ['vlab', [1.9, 0.15], [1.9, 1.25], { n: 'V_X' }],
      ['w', [1.6, 1.4], [3, 1.4]], ['R', [2.3, 1.4], [2.3, 2.8], { n: 'R_3' }], ['gnd', [2.3, 2.8]],
      ['G', [3, 0], [3, 1.4], { n: 'g_mV_X' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 1.4], { n: 'R_4' }],
      ['R', [4.4, 1.4], [4.4, 2.8], { n: 'R_5' }], ['gnd', [4.4, 2.8]], ['w', [4.4, 1.4], [5.2, 1.4]], ['term', [5.2, 1.4], { n: 'V_{OUT}' }],
    ],
    parts: [ex('-gm*R2*R5/(R1+R2+R3+gm*R2*R3)', ['gm', 'R1', 'R2', 'R3', 'R4', 'R5'], 'A_V')],
    hints: [md`The top node of the VCCS touches only $R_4$. So $R_4$ carries exactly $g_mV_X$, which then flows *up* through $R_5$ from ground: $V_{OUT} = -g_mV_XR_5$.`, md`The current in $R_1$ equals the current in $R_2$, namely $V_X/R_2$. The bottom node gets that plus $g_mV_X$, all of which leaves through $R_3$.`],
    sol: md`**Output side.** The VCCS's top node only touches $R_4$, so $R_4$ (and $R_5$) carry $g_mV_X$ flowing *up* from ground: $V_{OUT} = -g_mR_5V_X$. $R_4$ doesn't matter, because it's in series with an ideal current source.

**Input side.** $R_1$ and $R_2$ carry $V_X/R_2$. The bottom node sends $V_X/R_2 + g_mV_X$ through $R_3$: $V_S = R_3V_X(1/R_2 + g_m)$. KVL along the input:
$$V_{IN} = \frac{R_1}{R_2}V_X + V_X + R_3V_X\left(\frac{1}{R_2}+g_m\right)\;\Rightarrow\;V_X = \frac{R_2V_{IN}}{R_1+R_2+R_3+g_mR_2R_3}$$
$$A_V = -\frac{g_mR_2R_5}{R_1+R_2+R_3+g_mR_2R_3}$$`,
  });

  X.P1P1a = P({
    id: 'P1-P1a', src: 'Midterm practice · P1(a)', title: 'Linearity on a black box',
    q: md`In figure (a), a linear circuit (no internal independent sources) driven by $V_1 = 1\,\text{V}$ draws $I_1 = 1\,\text{A}$ and produces $V_2 = 1\,\text{V}$ at its open output. In figure (b) below, the same circuit is instead driven by $I = 1\,\text{A}$ with $R_1 = 1\,\Omega$ across its input. Find $V_1$, $I_1$ and $V_2$ in (b).`,
    fig: [
      ['I', [0, 1.5], [0, 0.3], { n: 'I', s: '1\\,\\text{A}', side: 'l' }], ['w', [0, 0.3], [0, 0], [1.4, 0]], ['w', [0, 1.5], [0, 1.8], [1.4, 1.8]],
      ['R', [0.8, 0], [0.8, 1.8], { n: 'R_1', s: '1\\,\\Omega' }], ['iarr', [1.9, 0], 'r', { n: 'I_1' }], ['w', [1.4, 0], [2.4, 0]], ['w', [1.4, 1.8], [2.4, 1.8]],
      ['vlab', [2.15, 0.35], [2.15, 1.45], { n: 'V_1', side: 'l' }],
      ['box', [2.4, -0.3], [4.4, 2.1], { n: 'Linear<br/>circuit' }], ['term', [5, 0], { n: 'C' }], ['w', [4.4, 0], [5, 0]], ['term', [5, 1.8], { n: 'D' }], ['w', [4.4, 1.8], [5, 1.8]],
      ['vlab', [5.2, 0.35], [5.2, 1.45], { n: 'V_2' }],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 0.5 }, { lbl: 'I_1', unit: 'A', ans: 0.5 }, { lbl: 'V_2', unit: 'V', ans: 0.5 }],
    hints: [md`From (a), the circuit's input resistance is $V_1/I_1 = 1\,\Omega$, and its voltage transfer ratio is $V_2/V_1 = 1$.`, md`In (b), $I$ splits equally between $R_1$ and the $1\,\Omega$ input resistance.`],
    sol: md`A source-free linear circuit looks like a resistor from its input: $R_{in} = V_1/I_1 = 1\,\Omega$. By homogeneity, its output is always the same fraction of its input: $V_2 = 1\cdot V_1$.

In (b), $1\,\text{A}$ splits equally between $R_1 = 1\,\Omega$ and $R_{in} = 1\,\Omega$: $I_1 = 0.5\,\text{A}$, $V_1 = 0.5\,\text{V}$, so $V_2 = 0.5\,\text{V}$.`,
  });

  X.F23P1a = P({
    id: 'F23-P1a', src: 'Midterm · Fall 2023 · P1(a)', title: 'Two load measurements',
    q: md`A linear circuit with $V_{IN} = 10\,\text{V}$ drives $R_L$ between $C$ and $D$. With $R_L = 5\kO$ the load current is $1\,\text{mA}$. With $R_L = 1\kO$ it is $2\,\text{mA}$. What is the voltage across $C$–$D$ if left open?`,
    fig: [['V', [0, 0.4], [0, 1.4], { n: 'V_{IN}', side: 'l' }], ['w', [0, 0.4], [0, 0], [1, 0]], ['w', [0, 1.4], [0, 1.8], [1, 1.8]], ['box', [1, -0.3], [3, 2.1], { n: 'Linear<br/>circuit' }], ['w', [3, 0], [4, 0]], ['w', [3, 1.8], [4, 1.8]], ['R', [4, 0], [4, 1.8], { n: 'R_L' }], ['iarr', [3.5, 0], 'r', { n: 'I_L' }], ['term', [3.5, 1.8], { n: 'D', side: 'b' }]],
    parts: [{ lbl: 'V_{CD,open}', unit: 'V', ans: 8 }],
    hints: [md`$I_L = \dfrac{\VTH}{\RTH + R_L}$ holds for both loads.`],
    sol: md`$\VTH = 1(\RTH + 5) = 2(\RTH + 1)$ (kΩ, mA) $\Rightarrow \RTH = 3\kO$, $\VTH = 8\,\text{V}$. The open-circuit voltage is $\VTH = 8\,\text{V}$.`,
  });

  X.F23P1b = P({
    id: 'F23-P1b', src: 'Midterm · Fall 2023 · P1(b)', title: 'Thévenin resistance from Y-parameters',
    q: md`A linear 2-port is driven at port 1 by an ideal source $V_{IN} = 10\,\text{V}$. Given $y_{21} = -1\,\Omega^{-1}$ and $y_{22} = 2\,\Omega^{-1}$, find $\RTH$ looking into port 2 ($C$–$D$).`,
    parts: [{ lbl: '\\RTH', unit: 'Ω', ans: 0.5 }],
    hints: [md`Deactivate $V_{IN}$ (short, so $V_1 = 0$) and use $I_2 = y_{21}V_1 + y_{22}V_2$.`],
    sol: md`With $V_{IN}$ off, $V_1 = 0$, so $I_2 = y_{22}V_2$ and $\RTH = 1/y_{22} = 0.5\,\Omega$. $y_{21}$ and the $10\,\text{V}$ are distractors: they affect $\VTH$, not $\RTH$.`,
  });

  // ---------------------------------------------------------------- the unit
  C.unit({
    id: 'u1', num: 'Unit 1', title: 'Linearity, Thévenin and Two-Ports',
    blurb: 'Linearity and superposition, Thévenin/Norton with dependent sources (test-source method), the three canonical stages, and two-port models.',
    lessons: [
      {
        id: 'u1-linear', title: 'What "linear" means',
        steps: [
          R(md`
            Every tool in this unit (superposition, Thévenin, Norton, two-ports) works **only for linear circuits**. So be precise about what linear means.

            A system $y = f(x)$ is linear when it satisfies:
            - **Homogeneity:** $f(ax) = a\,f(x)$. Scale the input, the output scales equally.
            - **Additivity:** $f(x_1 + x_2) = f(x_1) + f(x_2)$.
            - Together: **superposition**, $f(a_1x_1 + a_2x_2) = a_1f(x_1) + a_2f(x_2)$.

            Homogeneity with $a=0$ forces $f(0) = 0$: a linear function is a straight line **through the origin**.

            !!trap The affine trap
            $f(x) = ax + b$ with $b \neq 0$ is a straight line but is **not** strictly linear. It's *affine* and fails homogeneity. In practice we subtract the offset, $g(x) = f(x) - b = ax$, and treat it as linear. On a short-answer question, say both halves.

            **Linear elements:** resistors ($V=IR$), capacitors ($I = C\,dV/dt$), inductors. The derivative is a linear operator. **Nonlinear:** diodes, transistors. One diode anywhere makes the whole circuit nonlinear.
          `),
          P({
            q: md`Which of these are linear functions of $x$? Pick the one that **is** strictly linear.`,
            parts: [{ mc: ['$f(x) = 3x + 2$', '$f(x) = |x|$', '$f(x) = -5x$', '$f(x) = x^2$'], a: 2, why: ['Affine: fails homogeneity because $f(0) = 2 \\neq 0$.', '$|{-1}| \\neq -|1|$: fails homogeneity for negative scale factors.', null, '$(2x)^2 = 4x^2 \\neq 2x^2$.'] }],
            sol: md`Only $-5x$ passes both homogeneity and additivity. $3x+2$ is affine, $|x|$ fails for negative scalings, $x^2$ fails homogeneity.`,
          }),
          P({
            q: md`A circuit contains resistors, a capacitor, two independent sources and **one diode**. Can you apply superposition to find its response?`,
            parts: [{ mc: ['No. The diode makes the circuit nonlinear.', 'Yes, superposition works for any circuit.', 'Yes, as long as the diode is forward biased.', 'Only for the capacitor branch.'], a: 0, why: [null, 'Superposition requires linearity.', 'Forward bias is still exponential, still nonlinear.', 'Linearity is a property of the whole circuit.'] }],
            sol: md`No. One nonlinear element breaks superposition for the whole circuit. Unit 2 is about the workaround: linearise around an operating point first.`,
          }),
          P({
            q: md`The operator $y(t) = 5\,\dfrac{dx}{dt}$ (a capacitor's $I$–$V$ law with $C = 5$). Linear or not?`,
            parts: [{ mc: ['Linear', 'Nonlinear'], a: 0, why: [null, 'Differentiation distributes over sums and pulls out constants.'] }],
            sol: md`Linear: $\frac{d}{dt}(a_1x_1 + a_2x_2) = a_1\frac{dx_1}{dt} + a_2\frac{dx_2}{dt}$.`,
          }),
        ],
      },
      {
        id: 'u1-superpos', title: 'Superposition',
        steps: [
          R(md`
            In a linear circuit with several **independent** sources, the response equals the sum of the responses to each source acting alone.

            !!method Superposition
            1. Keep one independent source; turn off the rest: voltage source → **short**, current source → **open**.
            2. Solve that simpler circuit.
            3. Repeat for each source, then add the results (with signs).

            **Dependent sources stay on** in every sub-circuit.

            Superposition is rarely the fastest route on its own, but it's the *idea* behind small-signal analysis: DC and small-signal responses computed separately and added.
          `),
          G('superpos', { need: 3 }),
        ],
      },
      {
        id: 'u1-thevenin', title: 'Thévenin and Norton equivalents',
        steps: [
          R(md`
            Any linear network, seen from two terminals, is indistinguishable from:
            - **Thévenin:** a source $\VTH$ in series with $\RTH$, or
            - **Norton:** a source $\IN$ in parallel with $\RN = \RTH$.

            !!key The three quantities and the identity
            - $\VTH$ = **open-circuit** voltage at the port (nothing attached).
            - $\IN$ = **short-circuit** current, flowing out of the $+$ terminal through the short.
            - $\RTH$ = resistance looking in with **independent** sources off.

              $$\VTH = \IN\,\RTH$$

              Compute two of them independently and use the third as a free check. The official solutions do this on every problem.

            When a network has **no dependent sources**, $\RTH$ is just resistor combining with the sources switched off. Once you have the equivalent, a load draws $I_L = \dfrac{\VTH}{\RTH + R_L}$.
          `),
          G('thev_indep', { need: 3 }),
          P({
            q: md`To find $\RTH$ of a network, which sources do you turn off?`,
            parts: [{ mc: ['Only the independent sources: voltage → short, current → open', 'All sources, including dependent ones', 'Only the voltage sources', 'None; apply a test source with everything on'], a: 0, why: [null, 'Dependent sources are part of the network\'s resistance. Switching them off changes the answer.', 'Current sources must be opened too.', 'Independent sources would add a constant offset to the test measurement.'] }],
            sol: md`Independent sources off (V short, I open). **Dependent sources stay.**`,
          }),
        ],
      },
      {
        id: 'u1-blackbox', title: 'Linearity on a black box',
        steps: [
          R(md`
            If you're told a network is linear, you can pin down its behaviour from a few measurements without knowing what's inside. Two patterns show up on midterms.

            **1. Two load measurements.** Every linear two-terminal circuit is $\VTH$ behind $\RTH$, so
            $$I_{L1}(\RTH + R_{L1}) = \VTH = I_{L2}(\RTH + R_{L2})$$
            One equation in $\RTH$; then back-substitute. The open-circuit voltage *is* $\VTH$.

            **2. A source-free linear box.** With no internal independent sources, the input port behaves like a single resistor $R_{in} = V_1/I_1$, and homogeneity means the output is a fixed multiple of the input. Change the drive, and everything scales together.
          `),
          G('two_meas', { need: 2 }),
          G('reverse_thev', { need: 2 }),
          X.P1P1a,
          X.F23P1a,
        ],
      },
      {
        id: 'u1-testsource', title: 'Dependent sources: the test-source method',
        steps: [
          R(md`
            With a dependent source present, you **can't** find $\RTH$ by combining resistors. Use a test source.

            !!method Test-source method
            1. Turn off **independent** sources. Keep every dependent source.
            2. Apply a test voltage $v_t$ at the port.
            3. Find the current $i_t$ it supplies (nodal analysis, as in Unit 0).
            4. $\RTH = v_t / i_t$.

            !!key Two facts
            - **A $v_x$ sensing port is an open circuit.** The little $+\;v_x\;-$ terminals draw zero current. Any resistor in series with one carries no current and drops no voltage.
            - **A dependent source can go dead.** If switching off the input forces the controlling voltage to zero, the source delivers nothing, and its branch acts as an open circuit.

            !!trap Negative resistance is legal
            With a dependent source, $\RTH$ can come out negative (the network can supply power to the test source). Don't "fix" a negative answer. Check your signs, and if they hold, it's real.
          `),
          G('thev_dep', { need: 4 }),
          G('cascade', { need: 2 }),
        ],
      },
      {
        id: 'u1-canonical', title: 'The three canonical stages',
        steps: [
          R(md`
            Problem Set 1's Problems 2 and 3 aren't arbitrary. They're the **small-signal models of the two most important transistor stages**, and they come back all semester. Know these results cold:

            | Stage | $\VTH/v_{in}$ | $\RTH$ | Why |
            |---|---|---|---|
            | Degenerated common-source | $-\dfrac{g_mR_D}{1+g_mR_S}$ | $R_D$ | input grounded forces $v_x=0$: source dead |
            | Source follower | $\dfrac{g_mR'}{1+g_mR'}$, $R' = R_S\pl R_O$ | $\tfrac{1}{g_m}\pl R_S\pl R_O$ | source acts like a $1/g_m$ resistor |
            | Cascade of CS stages | $\prod(-g_{mk}R_k)$ | last stage's $R$ | open sensing ports: no loading |

            !!tip Typing symbolic answers
            Use the variable names listed under the box. Implicit multiplication works (<code>gm RD</code> or even <code>gmRD</code>), <code>||</code> means "in parallel with", and the preview shows how your input was read. Equivalent forms are all accepted: the checker evaluates your expression at random values.
          `),
          P({
            q: md`A common-source stage **without** degeneration ($R_S = 0$). What is $\VTH$?`,
            fig: FIGS.cs(),
            parts: [ex('-gm*RD*vin', ['gm', 'RD', 'vin'], '\\VTH')],
            hints: [md`Set $R_S = 0$ in the degenerated result, or redo it: $v_x = v_{in}$ directly.`],
            sol: md`$\VTH = -g_mR_Dv_{in}$. Degeneration divides this by $1 + g_mR_S$.`,
          }),
          P({
            q: md`What is the output resistance of a source follower if the transistor's $R_O \to \infty$?`,
            fig: FIGS.follower(),
            parts: [ex('1/gm || RS', ['gm', 'RS'], '\\RTH')],
            sol: md`$\RTH = \frac{1}{g_m}\pl R_S$. For a strong transistor ($g_mR_S \gg 1$) this is roughly $1/g_m$: small. That's why followers make good output buffers.`,
          }),
          P({
            q: md`In the degenerated common-source stage, what does the controlled source do when $v_{in} = 0$ and a test voltage is applied at the output?`,
            parts: [{ mc: ['It delivers zero current, because $v_x$ is forced to zero.', 'It delivers $g_mv_t$.', 'It acts as a $1/g_m$ resistor.', 'It must be deactivated first.'], a: 0, why: [null, 'That would need $v_x = v_t$, but the output node is not in the $v_x$ loop here.', 'That is the follower, where $v_x = -v_t$.', 'Never deactivate a dependent source.'] }],
            sol: md`KCL at the source node with $v_{in}=0$ gives $v_s(g_m + 1/R_S) = 0$, so $v_s = 0$ and $v_x = 0$. The dependent source is dead, and $\RTH = R_D$.`,
          }),
        ],
      },
      {
        id: 'u1-ps1', title: 'Problem Set 1', kind: 'pset',
        steps: [
          R(md`All six problems from Problem Set 1. Symbolic answers are checked by evaluating your expression, so any correct form is accepted. Each figure is redrawn from the problem set.`),
          ...PS1,
        ],
      },
      {
        id: 'u1-twoport', title: 'Two-port networks',
        steps: [
          R(md`
            A **two-port** abstracts a linear network by both its input and output ports:
            1. **Input:** a resistance $R_i$ (the Thévenin resistance seen at the input).
            2. **Output:** a Thévenin or Norton equivalent with resistance $R_o$.
            3. **Link:** a controlled source relating output to input.

            Four flavours, depending on which controlled source you use. $R_i$ and $R_o$ are identical in all four:

            | Model | Gain parameter | Measured with |
            |---|---|---|
            | VCVS | $A_{vo} = v_o/v_i$ | output **open** |
            | VCCS | $G_{ms} = i_o/v_i$ | output **shorted** |
            | CCVS | $R_{mo} = v_o/i_i$ | output **open** |
            | CCCS | $A_{is} = i_o/i_i$ | output **shorted** |

            These are *maximum* gains. With a real source resistance $R_S$ and load $R_L$:
            $$\frac{v_o}{v_s} = \frac{R_i}{R_i+R_S}\;A_{vo}\;\frac{R_L}{R_L+R_o}$$
            Both dividers are below 1, so loading always costs gain. A MOSFET gate has $R_i \to \infty$, which is why MOSFET stages cascade so cleanly.
          `),
          G('twoport_gain', { need: 3 }),
          P({
            q: md`Which gain parameter describes a MOSFET in saturation, viewed as a two-port from gate–source to drain–source?`,
            parts: [{ mc: ['Transconductance $G_{ms}$ (VCCS)', 'Voltage gain $A_{vo}$ (VCVS)', 'Current gain $A_{is}$ (CCCS)', 'Transresistance $R_{mo}$ (CCVS)'], a: 0, why: [null, 'A MOSFET\'s output is a current set by a voltage.', 'The gate draws no current, so a current-controlled model makes no sense.', 'The gate draws no current.'] }],
            sol: md`A voltage at the input (gate–source) sets a current at the output (drain). That's a VCCS, and its gain is $g_m$.`,
          }),
        ],
      },
      {
        id: 'u1-yparam', title: 'Y-parameters',
        steps: [
          R(md`
            The admittance description of a linear two-port:
            $$I_1 = y_{11}V_1 + y_{12}V_2,\qquad I_2 = y_{21}V_1 + y_{22}V_2$$

            Each $y$ is measured with the *other* port **shorted**: $y_{22} = I_2/V_2\,\big|_{V_1=0}$, and so on.

            !!key Thévenin resistance at port 2
            - Port 1 driven by an **ideal voltage source** → deactivating it shorts port 1 → $V_1 = 0$ →
              $$\RTH = \frac{1}{y_{22}}$$
              $y_{21}$ and $y_{12}$ play no role.
            - Port 1 driven by an **ideal current source** → deactivating it opens port 1 → $I_1 = 0$ → $V_1 = -\frac{y_{12}}{y_{11}}V_2$ →
              $$\RTH = \frac{1}{y_{22} - \frac{y_{12}y_{21}}{y_{11}}}$$
          `),
          X.F23P1b,
          G('yparam', { need: 3 }),
        ],
      },
      {
        id: 'u1-exam', title: 'Past midterms: Problem 1', kind: 'exam',
        steps: [
          R(md`Every Problem 1 from the six past midterms that tests this unit, with figures redrawn. These are the real exam style: an equivalent circuit or a gain expression with dependent sources. Budget about 15 minutes each.`),
          X.F22P1, X.P6P1, X.P4P1, X.P5P1,
        ],
      },
      {
        id: 'u1-check', title: 'Checkpoint: equivalent circuits', kind: 'checkpoint',
        steps: [
          R(md`Mixed, freshly generated practice across the unit.`),
          G('thev_dep', { need: 3 }),
          G('thev_indep', { need: 2 }),
          G('superpos', { need: 2 }),
          G('twoport_gain', { need: 2 }),
          G('yparam', { need: 2 }),
        ],
      },
    ],
  });
})();

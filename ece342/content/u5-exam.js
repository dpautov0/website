/* Unit 5 — exam preparation: full past papers, two original mock midterms, mixed review. */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;
  const V = (v) => `${v}\\,\\text{V}`;
  const ex = (expr, vars, lbl, disp) => ({ lbl, expr, vars, disp });
  const RV = { gm: [2e-4, 2e-2], RS: [100, 1e4], RD: [500, 5e4], vin: [0.01, 2] };
  const DV = { gm: 'g_m', RS: 'R_S', RD: 'R_D', vin: 'v_{in}' };

  // ================================================================ Mock midterm A (original)
  const cgFig = [
    ['V', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0]],
    ['R', [0, 0], [1.8, 0], { n: 'R_S' }], ['node', [1.8, 0], { n: 's', name: 's', side: 'br' }],
    ['G', [1.8, -1.6], [1.8, 0], { n: 'g_mv_x', c: ['0', 's'] }],
    ['w', [1.8, -1.6], [3.2, -1.6]], ['R', [3.2, -1.6], [3.2, -0.2], { n: 'R_D' }], ['gnd', [3.2, -0.2]],
    ['w', [1.8, -1.6], [1.8, -2.2]], ['term', [1.8, -2.2], { n: 'v_{out}', name: 'o' }],
    ['txt', [2.5, 0.75], '$v_x = v_g - v_s = -v_s$', { a: 'l' }],
  ];

  const MA1 = P({
    id: 'MA-P1', src: 'Mock midterm A · P1 (25 pts)', title: 'Common-gate stage', big: true,
    q: md`This is the small-signal model of a **common-gate** amplifier: the gate is grounded, the input drives the source through $R_S$, and the controlled source is $g_mv_x$ with $v_x = v_g - v_s = -v_s$ (current flows from the drain node down into the source node). Find the Thévenin equivalent at $v_{out}$, and the resistance looking into the source node $s$ (to the right of $R_S$).`,
    fig: cgFig,
    parts: [ex('gm*RD*vin/(1+gm*RS)', RV, '\\VTH', DV), ex('RD', RV, '\\RTH', DV), ex('1/gm', RV, 'R_{in,s}', DV)],
    hints: [
      md`KCL at $s$: $\frac{v_s - v_{in}}{R_S} - g_mv_x = 0$ with $v_x = -v_s$.`,
      md`For $\RTH$ ground $v_{in}$: KCL at $s$ becomes $v_s(1/R_S + g_m) = 0$. What does that do to the source?`,
      md`For $R_{in,s}$: apply $v_t$ at $s$ (remove $R_S$ and $v_{in}$), find the current into $s$. With $R_D$ at the output the drain voltage doesn't affect $g_mv_x$.`,
    ],
    sol: md`**KCL at $s$:** $\frac{v_s - v_{in}}{R_S} + g_mv_s = 0 \Rightarrow v_s = \frac{v_{in}}{1+g_mR_S}$.

**Output open:** the source current $g_mv_x = -g_mv_s$ leaves the drain node, so $\frac{v_{out}}{R_D} - g_mv_s = 0$:
$$\VTH = \frac{g_mR_D}{1+g_mR_S}v_{in}$$
**Non-inverting**, same magnitude as the degenerated common-source stage.

**$\RTH$:** $v_{in}=0$ forces $v_s = 0$, so the source is dead: $\RTH = R_D$.

**Looking into the source:** a test voltage $v_t$ at $s$ gives $v_x = -v_t$, and the controlled source pulls $g_mv_t$ out through $s$: $R_{in,s} = 1/g_m$. It's the same "$1/g_m$ looking into a source" fact as the follower.`,
  });

  const ma2Fig = [
    ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', s: V(3.4), side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1', s: '1\\kO' }],
    ['D', [1.8, -0.4], [1.8, 0.9]], ['D', [1.8, 0.9], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
    ['w', [1.8, -0.4], [2.8, -0.4], [2.8, 0.2]], ['term', [2.8, 0.2]], ['term', [2.8, 1.4]], ['w', [2.8, 1.4], [2.8, 2.2]], ['gnd', [2.8, 2.2]],
    ['vlab', [3.05, 0.3], [3.05, 1.3], { n: 'v_X' }],
    ['w', [4.2, -1], [5.2, -1]], ['rail', [4.7, -1], { n: V(5) }], ['R', [4.2, -1], [4.2, 0.4], { n: 'R_L', s: '1\\kO' }],
    ['node', [4.2, 0.4], { n: 'V_O+v_o', side: 'r' }], ['I', [4.2, 0.4], [4.2, 2.2], { n: 'G_M\\tfrac{v_X^2}{V_A}' }], ['gnd', [4.2, 2.2]],
  ];
  const MA2 = P({
    id: 'MA-P2', src: 'Mock midterm A · P2 (35 pts)', title: 'Diode clamp driving a square-law transconductor', big: true,
    q: md`$V_{IN} = 3.4\,\text{V}$, $R_1 = R_L = 1\kO$, $G_M = 1\,\text{mA/V}$, $V_A = 1\,\text{V}$, $V_T = 25\,\text{mV}$, CVD $0.7\,\text{V}$. The source $G_Mv_X^2/V_A$ pulls current out of the output node. Find the diode current, the incremental resistance of one diode, the DC output $V_O$, the incremental transconductance $K$, and the small-signal gain $v_o/v_{in}$.`,
    fig: ma2Fig,
    parts: [{ lbl: 'I_{D0}', unit: 'mA', ans: 2 }, { lbl: 'r_d', unit: 'Ω', ans: 12.5 }, { lbl: 'V_O', unit: 'V', ans: 3.04 }, { lbl: 'K', unit: 'mA/V', ans: 2.8 }, { lbl: 'v_o/v_{in}', unit: 'V/V', ans: -2.8 * 25 / 1025, tol: { rel: 0.03 } }],
    hints: [md`Two diodes clamp $V_X = 1.4\,\text{V}$. The sensing port draws nothing, so the whole $R_1$ current goes into the diodes.`, md`$V_O = 5 - R_L\cdot G_MV_X^2/V_A$. $K = 2G_MV_{X0}/V_A$.`, md`Small signal: $v_x = v_{in}\frac{2r_d}{R_1 + 2r_d}$ and $v_o = -KR_Lv_x$.`],
    sol: md`**DC:** $V_X = 1.4\,\text{V}$, $I_D = (3.4 - 1.4)/1\text{k} = 2\,\text{mA}$ (> 0 ✓). Source current $= 1\text{m}(1.4)^2 = 1.96\,\text{mA}$, so $V_O = 5 - 1.96 = 3.04\,\text{V}$.

**Linearise:** $r_d = 25/2 = 12.5\,\Omega$ (string $25\,\Omega$); $K = 2(1\text{m})(1.4)/1 = 2.8\,\text{mA/V}$.

**Small signal:** $v_x = v_{in}\frac{25}{1000+25} \approx v_{in}/41$; $v_o = -KR_Lv_x = -2.8\cdot\frac{25}{1025}v_{in} = -0.068\,v_{in}$ (about $-0.07$ if you use $1000+25\approx1000$).`,
  });

  const ma3Fig = [
    ['w', [0, 0], [6, 0]], ['rail', [3, 0], { n: V(5) }],
    ['I', [0, 0], [0, 2], { s: '0.2\\,\\text{mA}', side: 'l' }], ['node', [0, 2], { n: 'V_1', side: 'l' }],
    ['nmos', [0, 3], { n: 'N_1', sz: '1X', flip: true, dc: true }], ['gnd', [0, 4]],
    ['nmos', [2, 3], { n: 'N_2', sz: '2X' }], ['gnd', [2, 4]],
    ['pmos', [2, 1], { n: 'P_1', sz: '4X', flip: true }], ['w', [3, 1], [3, 2], [2, 2]], ['node', [2, 2], { n: 'V_2', side: 'l' }],
    ['pmos', [4, 1], { n: 'P_2', sz: '8X' }], ['node', [4, 2], { n: 'V_{OUT}', side: 'l' }], ['R', [4, 2], [4, 3.4], { n: 'R_L', s: '2.5\\kO' }], ['gnd', [4, 3.4]],
    ['w', [4, 2], [5, 2]], ['nmos', [6, 2], { n: 'N_5', sz: '1X' }], ['w', [6, 1], [6, 0]], ['node', [6, 3], { n: 'V_3', side: 'r' }],
    ['nmos', [6, 4], { n: 'N_6', sz: '1X' }], ['gnd', [6, 5]],
    ['w', [1, 3], [1, 4.6], [5, 4.6], [5, 4]],
  ];
  const MA3 = P({
    id: 'MA-P3', src: 'Mock midterm A · P3 (40 pts)', title: 'Mirror, PMOS mirror and a follower', big: true,
    q: md`$1X = 100/1$ (NMOS $100\,\mu\text{A/V}^2$, PMOS $50\,\mu\text{A/V}^2$, $|V_T| = 1\,\text{V}$). Find $V_1$, $V_2$, the current in $P_2$, $V_{OUT}$, the largest $R_L$ for which $P_2$ stays saturated, and $V_3$.`,
    fig: ma3Fig,
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'V_2', unit: 'V', ans: 3.8 }, { lbl: 'I_{P2}', unit: 'mA', ans: 0.8 }, { lbl: 'V_{OUT}', unit: 'V', ans: 2 }, { lbl: 'R_{L,max}', unit: 'kΩ', ans: 6 }, { lbl: 'V_3', unit: 'V', ans: 0.8 }],
    hints: [md`$N_1$ ($5\,\text{mA/V}^2$) at 0.2 mA gives $V_1$. $N_2$ is twice $N_1$ with the same $V_{GS}$.`, md`$P_1$ ($4X$ PMOS $= 10\,\text{mA/V}^2$) carries $N_2$'s current. $P_2$ is twice $P_1$.`, md`$N_6$ copies $N_1$ (same size, same $V_{GS}$). $N_5$ carries that current with its gate at $V_{OUT}$.`],
    sol: md`$1X$: NMOS $5\,\text{mA/V}^2$, PMOS $2.5\,\text{mA/V}^2$ (as $\tfrac12\mu C_{ox}W/L$).

**$V_1$:** $0.2 = 5V_{ov}^2 \Rightarrow V_{ov} = 0.2$, $V_1 = 1.2\,\text{V}$.

**$N_2$** ($2X$, same $V_{GS}$): 0.4 mA. **$P_1$** ($4X$ = $10\,\text{mA/V}^2$): $V_{ov} = 0.2$, $V_{SG} = 1.2$, so $V_2 = 3.8\,\text{V}$ ($N_2$: $V_D = 3.8 \ge 0.2$ ✓).

**$P_2$** ($8X$, $2\times P_1$): **0.8 mA**, $V_{OUT} = (0.8\text{m})(2.5\text{k}) = 2\,\text{V}$. Saturation: $V_{OUT} \le V_2 + 1 = 4.8 \Rightarrow R_{L,max} = 4.8/0.8\text{m} = 6\kO$.

**$V_3$:** $N_6$ = $N_1$ → 0.2 mA; $N_5$ ($1X$) at 0.2 mA has $V_{GS} = 1.2$, so $V_3 = 2 - 1.2 = 0.8\,\text{V}$ ($N_6$: $0.8 \ge 0.2$ ✓).`,
  });

  // ================================================================ Mock midterm B (original)
  const mb1Fig = [
    ['V', [0, 0.6], [0, 1.6], { n: 'v_{in}', s: '1\\,\\text{V}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0]],
    ['R', [0, 0], [1.8, 0], { n: 'R_1', s: '1\\kO' }], ['node', [1.8, 0], { name: 'x' }],
    ['R', [1.8, 0], [1.8, 1.6], { n: 'R_2', s: '1\\kO', side: 'l' }], ['gnd', [1.8, 1.6]],
    ['w', [1.8, 0], [1.8, -1.2]], ['R', [1.8, -1.2], [5, -1.2], { n: 'R_F', s: '10\\kO' }], ['w', [5, -1.2], [5, 0]],
    ['w', [1.8, 0], [2.6, 0], [2.6, 0.4]], ['term', [2.6, 0.4]], ['term', [2.6, 1.2]], ['w', [2.6, 1.2], [2.6, 1.6]], ['gnd', [2.6, 1.6]], ['vlab', [2.85, 0.5], [2.85, 1.1], { n: 'v_x' }],
    ['E', [3.6, 0.6], [3.6, 1.6], { n: 'Av_x', s: 'A=-10', g: -10, c: ['x', '0'] }], ['gnd', [3.6, 1.6]], ['w', [3.6, 0.6], [3.6, 0]],
    ['R', [3.6, 0], [5, 0], { n: 'R_O', s: '1\\kO' }], ['w', [5, 0], [5.8, 0]], ['term', [5.8, 0], { n: 'v_{out}', name: 'o' }],
  ];
  const MB1 = P({
    id: 'MB-P1', src: 'Mock midterm B · P1 (25 pts)', title: 'Inverting amplifier with feedback', big: true,
    q: md`An inverting voltage amplifier ($A = -10$) with output resistance $R_O$ and feedback resistor $R_F$ from its output back to its input node. With $v_{in} = 1\,\text{V}$, find the Thévenin equivalent at $v_{out}$.`,
    fig: mb1Fig,
    parts: [{ lbl: '\\VTH', unit: 'V', ans: -3 }, { lbl: '\\RTH', unit: 'Ω', ans: 636.36 }],
    hints: [md`Open circuit: KCL at $v_x$ and at $v_{out}$. At the output, $R_O$ and $R_F$ both connect to $v_{out}$, so $v_{out}\left(\frac1{R_O}+\frac1{R_F}\right) = \frac{Av_x}{R_O} + \frac{v_x}{R_F}$.`, md`For $\RTH$, ground $v_{in}$ and apply $v_t$. First find $v_x$: $R_F$ feeds a node with $R_1\pl R_2 = 500\,\Omega$ to ground.`],
    sol: md`**Open circuit** (kΩ, mA). Output node: $v_{out}(1 + 0.1) = -10v_x + 0.1v_x \Rightarrow v_{out} = -9v_x$.
Node $x$: $\frac{v_x - 1}{1} + \frac{v_x}{1} + \frac{v_x - v_{out}}{10} = 0 \Rightarrow 2v_x - 1 + \frac{10v_x}{10} = 0 \Rightarrow v_x = \tfrac13$, so $\VTH = -3\,\text{V}$.

**Test source** ($v_{in} = 0$): $v_x = v_t\frac{0.5}{10 + 0.5} = 0.0476v_t$. Current into the output: $i_t = \frac{v_t - Av_x}{1} + \frac{v_t - v_x}{10} = v_t(1.1 + 0.476 - 0.0048)$ mA/V, so $i_t = 1.571v_t$ and $\RTH = 0.636\kO = 636\,\Omega$.

Feedback lowered the output resistance below $R_O = 1\kO$. That's what shunt feedback at the output does.`,
  });

  const mb2Fig = [
    ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', s: V(5.7), side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1', s: '2\\kO' }],
    ['I', [1.8, -0.4], [1.8, 2.2], { n: 'I_B+i_b', s: '1\\,\\text{mA}' }], ['gnd', [1.8, 2.2]],
    ['R', [1.8, -0.4], [3.6, -0.4], { n: 'R_2', s: '1\\kO' }], ['D', [3.6, -0.4], [3.6, 2.2]], ['gnd', [3.6, 2.2]],
    ['w', [3.6, -0.4], [4.4, -0.4]], ['term', [4.4, -0.4], { n: 'V_{OUT}+v_{out}' }],
  ];
  const MB2 = P({
    id: 'MB-P2', src: 'Mock midterm B · P2 (35 pts)', title: 'Diode with a current-sink bias and two inputs', big: true,
    q: md`$V_{IN} = 5.7\,\text{V}$, $R_1 = 2\kO$, $R_2 = 1\kO$, $I_B = 1\,\text{mA}$ (DC sink), $V_T = 25\,\text{mV}$, CVD $0.7\,\text{V}$. Find $I_{D0}$ and $r_d$, then the small-signal ratios $v_{out}/v_{in}$ and $v_{out}/i_b$ (where $i_b$ is a small increase in the sink current).`,
    fig: mb2Fig,
    parts: [{ lbl: 'I_{D0}', unit: 'mA', ans: 1 }, { lbl: 'r_d', unit: 'Ω', ans: 25 }, { lbl: 'v_{out}/v_{in}', unit: 'V/V', ans: 25 / 3025 }, { lbl: 'v_{out}/i_b', unit: 'Ω', ans: -(2000 * 1025 / 3025) * (25 / 1025) }],
    hints: [md`DC: $V_{OUT} = 0.7$. KCL at the middle node: what comes in through $R_1$ leaves through $I_B$ and $R_2$.`, md`Small signal: the DC sink opens, but $i_b$ is a small current pulled out of the middle node. Use superposition over $v_{in}$ and $i_b$.`],
    sol: md`**DC:** $\frac{5.7 - V_N}{2} = 1 + \frac{V_N - 0.7}{1} \Rightarrow 5.1 = 3V_N \Rightarrow V_N = 1.7\,\text{V}$, $I_D = (1.7 - 0.7)/1\text{k} = 1\,\text{mA}$ (> 0 ✓), $r_d = 25\,\Omega$.

**$v_{in}$ alone:** $v_{out} = v_{in}\dfrac{r_d}{R_1 + R_2 + r_d} = \dfrac{25}{3025}v_{in} = 0.00826\,v_{in}$.

**$i_b$ alone:** the middle node sees $R_1\pl(R_2+r_d) = 677.7\,\Omega$; $v_N = -677.7\,i_b$, and $v_{out} = v_N\frac{r_d}{R_2+r_d}$: $v_{out}/i_b = -16.5\,\Omega$.`,
  });

  const mb3Fig = [
    ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: V(5) }],
    ['pmos', [1, 1], { n: 'P_1', sz: '2X', flip: true }], ['w', [2, 1], [2, 2], [1, 2]], ['node', [1, 2], { n: 'V_P', side: 'l' }],
    ['nmos', [1, 3], { n: 'M_1', sz: '1X' }], ['R', [1, 4], [1, 5.2], { s: '500\\,\\Omega', side: 'l' }], ['gnd', [1, 5.2]],
    ['w', [0, 3], [-0.6, 3], [-0.6, 3.5]], ['V', [-0.6, 3.5], [-0.6, 4.5], { s: V(1.4), side: 'l' }], ['gnd', [-0.6, 4.5]],
    ['pmos', [3, 1], { n: 'P_2', sz: '3X' }], ['node', [3, 2], { n: 'V_{OUT}', side: 'l' }],
    ['nmos', [3, 3], { n: 'N_2', sz: '?', flip: true, dc: true }], ['gnd', [3, 4]],
  ];
  const MB3 = P({
    id: 'MB-P3', src: 'Mock midterm B · P3 (40 pts)', title: 'Degenerated reference, PMOS mirror, sizing', big: true,
    q: md`$1X = 200/1$ (NMOS $100\,\mu\text{A/V}^2$, PMOS $50\,\mu\text{A/V}^2$, $|V_T| = 1\,\text{V}$). Find $M_1$'s current, $V_P$, and $P_2$'s current. Then: what size must the diode-connected $N_2$ be (in units of $X$) to make $V_{OUT} = 1.2\,\text{V}$? Finally, if $N_2$ were replaced by a resistor to ground, what is the largest value that keeps $P_2$ saturated?`,
    fig: mb3Fig,
    parts: [{ lbl: 'I_{M1}', unit: 'mA', ans: 0.4 }, { lbl: 'V_P', unit: 'V', ans: 3.8 }, { lbl: 'I_{P2}', unit: 'mA', ans: 0.6 }, { lbl: 'N_2\\text{ size}', unit: 'X', ans: 1.5 }, { lbl: 'R_{max}', unit: 'kΩ', ans: 8 }],
    hints: [md`$M_1$: $10\,\text{mA/V}^2$, $V_{GS} = 1.4 - 500I$. Quadratic; reject the root that turns it off.`, md`$P_1$ ($2X$ PMOS $= 10\,\text{mA/V}^2$) carries it: $V_{SG}$? $P_2$ is $1.5\times P_1$.`, md`$V_{OUT} = 1.2$ means $N_2$'s $V_{ov} = 0.2$ at $P_2$'s current. Solve for $W/L$. For $R_{max}$ use $V_D \le V_G + |V_T|$.`],
    sol: md`**$M_1$:** $I = 10(0.4 - 0.5I)^2$ (mA, kΩ) $\Rightarrow 2.5I^2 - 5I + 1.6 = 0 \Rightarrow I = 1.6$ or $0.4$. Reject 1.6 ($V_{GS} = 0.6$). **$0.4\,\text{mA}$**.

**$V_P$:** $P_1$ ($2X$, $10\,\text{mA/V}^2$): $V_{ov} = 0.2$, $V_{SG} = 1.2$, $V_P = 3.8\,\text{V}$.

**$P_2$** ($3X$ = $1.5\times$): **0.6 mA**.

**$N_2$:** $V_{GS} = 1.2 \Rightarrow V_{ov} = 0.2$: $\frac{W}{L} = \frac{2(0.6\text{m})}{(100\mu)(0.04)} = 300 = 1.5X$.

**$R_{max}$:** $V_{OUT} \le V_P + 1 = 4.8 \Rightarrow R_{max} = 4.8/0.6\text{m} = 8\kO$.`,
  });

  // ================================================================ the unit
  const allGens = ['nodal2', 'supernode', 'mesh2', 'depnodal', 'thev_dep', 'thev_indep', 'superpos', 'twoport_gain', 'yparam', 'pwl_q', 'deriv_r', 'nl_src', 'two_point', 'cvd_branch', 'diode_ss', 'diode_isrc', 'rd', 'mos_region', 'mos_rs_bias', 'pmos_rs_bias', 'mirror_ratio', 'mirror_rmax', 'stack_vov', 'size_for_current', 'diode_conn'];

  C.unit({
    id: 'u5', num: 'Unit 5', title: 'Exam Prep',
    blurb: 'Every past paper as a timed set, two original mock midterms, an endless mixed-review drill, and the exam-day playbook.',
    lessons: [
      {
        id: 'u5-playbook', title: 'Exam-day playbook', kind: 'read',
        steps: [
          R(md`
            ### What the exam looks like
            All six past midterms share one structure: **3 problems, 100 points, 5–6 pages, transistor parameters on the cover.** The old covers say "calculators not allowed"; **your Fall 2026 exam allows calculators** and comes with a formula sheet.

            | Problem | Tests | Points | Unit |
            |---|---|---|---|
            | 1 | Thévenin/Norton or gain with dependent sources; short answers on linearity | 20–30 | 1 |
            | 2 | DC operating point + incremental model with diodes (often a nonlinear controlled source) | 30–35 | 2–3 |
            | 3 | MOSFET DC analysis: mirrors, stacks, sizing, $R_{max}$ | 40–50 | 4 |

            ### Habits that earn partial credit
            - **Name every assumption** before using it: "assume $D_1$ ON", "assume $M_2$ saturated".
            - **Verify every assumption** in one line at the end. It's graded separately.
            - **Label nodes on the figure** before writing equations.
            - **Keep DC and small-signal apart:** capitals $V_0, I_0$ for DC, lowercase $v_o, i_o$ for increments.
            - In incremental models, **write a number next to every element.**
            - Free checks: $\VTH = \IN\RTH$; KVL sums back to the supply; limiting cases ($A_v \to 0$, $R_S \to 0$).

            ### Clean numbers are still a signal
            You can use a calculator, but past papers were written without one, so numbers are designed to be clean. $V_{ov}$ lands on 0.1/0.2/0.4 V; $r_d$ on 5/12.5/25/50 Ω. If you're taking an ugly square root, recheck the setup.

            ### Traps, one line each
            - Never switch off a **dependent** source.
            - DC voltage source → short, DC current source → open (small signal).
            - $G_M$ of a nonlinear source isn't its incremental gain. Differentiate.
            - Drop the ½ in the square law and you're off by exactly 2×.
            - The mirror ratio needs **equal $V_{GS}$**: a source resistor breaks it.
            - Check for **cut-off** (Practice 5's $V_2 = 0.1\,\text{V}$).
            - PMOS: magnitudes, $\mu_pC_{ox}$ is half, and saturation is $V_D \le V_G + |V_T|$.
          `),
        ],
      },
      { id: 'u5-f22', title: 'Past paper: Fall 2022', kind: 'exam', steps: [R(md`Fall 2022. 50 minutes.`), X.F22P1, X.F22P2, X.F22P3] },
      { id: 'u5-f23', title: 'Past paper: Fall 2023', kind: 'exam', steps: [R(md`Fall 2023. 50 minutes.`), X.F23P1a, X.F23P1b, X.F23P1c, X.F23P2, X.F23P3] },
      { id: 'u5-p1', title: 'Past paper: Practice 1', kind: 'exam', steps: [R(md`Practice 1 (Canvas). 50 minutes.`), X.P1P1a, X.P1P1b, X.P1P1c, X.P1P2, X.P1P3] },
      { id: 'u5-p4', title: 'Past paper: Practice 4', kind: 'exam', steps: [R(md`Practice 4 (Canvas). 50 minutes.`), X.P4P1, X.P4P2, X.P4P3] },
      { id: 'u5-p5', title: 'Past paper: Practice 5', kind: 'exam', steps: [R(md`Practice 5 (Canvas). 50 minutes.`), X.P5P1, X.P5P2, X.P5P3] },
      { id: 'u5-p6', title: 'Past paper: Practice 6', kind: 'exam', steps: [R(md`Practice 6 (Canvas). 50 minutes.`), X.P6P1, X.P6P2, X.P6P3] },
      { id: 'u5-mockA', title: 'Mock midterm A', kind: 'mock', steps: [R(md`Original, same format. 50 minutes.`), MA1, MA2, MA3] },
      { id: 'u5-mockB', title: 'Mock midterm B', kind: 'mock', steps: [R(md`Original, same format. 50 minutes.`), MB1, MB2, MB3] },
      {
        id: 'u5-mixed', title: 'Mixed review drill', kind: 'review',
        steps: [
          R(md`Random generated problems from every unit.`),
          G('nodal2', { need: 15, pool: allGens }),
        ],
      },
    ],
  });
})();

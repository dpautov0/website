/* Unit 4 — MOSFET DC analysis: regions, bias, diode-connected devices, mirrors, stacks.
   Includes Problem Set 3 and every past-midterm "Problem 3" (the 40–50 point question). */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;
  const V = (v) => `${v}\\,\\text{V}`;

  // ---------------------------------------------------------------- Problem Set 3
  X.PS31 = P({
    id: 'PS3-1', src: 'Problem Set 3 · #1', title: 'NMOS bias with source degeneration',
    q: md`$R_S = 200\,\Omega$, $R_D = 1.25\kO$, $W/L = 125/1$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$. Find $I_D$, $V_D$, $V_S$ and $R_{D,max}$ for saturation.`,
    fig: FIGS.nbias({ vdds: V(2), RDs: '1.25\\kO', RSs: '200\\,\\Omega', wls: 'W/L=125/1', vgs: V(1.6) }),
    parts: [{ lbl: 'I_D', unit: 'mA', ans: 1 }, { lbl: 'V_D', unit: 'V', ans: 0.75 }, { lbl: 'V_S', unit: 'V', ans: 0.2 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 1.4 }],
    hints: [md`Assume saturation: $I_D = K(V_{GS} - 1)^2$, where $K = 6.25\,\text{mA/V}^2$ and $V_{GS} = 1.6 - 200I_D$.`, md`The quadratic has roots 9 mA and 1 mA. One of them makes $V_{GS} < V_T$.`, md`$R_{D,max}$: saturation needs $V_D \ge V_G - V_T = 0.6\,\text{V}$.`],
    sol: md`$\tfrac12(100\mu)(125) = 6.25\,\text{mA/V}^2$. $I_D = 6.25\text{m}(0.6 - 200I_D)^2 \Rightarrow 250I_D^2 - 2.5I_D + 2.25\text{m} = 0 \Rightarrow I_D = 9$ or $1\,\text{mA}$.

$9\,\text{mA}$ would give $V_{GS} = 1.6 - 1.8 < V_T$: reject. **$I_D = 1\,\text{mA}$**, $V_S = 0.2\,\text{V}$, $V_D = 2 - 1.25 = 0.75\,\text{V}$. Check: $V_{DS} = 0.55 \ge V_{ov} = 0.4$. ✓

$R_{D,max}$: $V_D \ge V_G - V_T = 0.6 \Rightarrow 2 - (1\text{m})R_D \ge 0.6 \Rightarrow R_{D,max} = 1.4\kO$.`,
  });

  X.PS32 = P({
    id: 'PS3-2', src: 'Problem Set 3 · #2', title: 'PMOS bias with source degeneration',
    q: md`$R_S = 200\,\Omega$, $R_D = 750\,\Omega$, $W/L = 125/1$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_T| = 1\,\text{V}$. Find $I_D$, $V_S$, $V_D$ and $R_{D,max}$.`,
    fig: FIGS.pbias({ vdds: V(3), RDs: '750\\,\\Omega', RSs: '200\\,\\Omega', wls: 'W/L=125/1', vgs: V(0.8) }),
    parts: [{ lbl: 'I_D', unit: 'mA', ans: 2 }, { lbl: 'V_S', unit: 'V', ans: 2.6 }, { lbl: 'V_D', unit: 'V', ans: 1.5 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 0.9 }],
    hints: [md`$V_{SG} = (3 - 200I_D) - 0.8 = 2.2 - 200I_D$, and $I_D = 3.125\text{m}(V_{SG} - 1)^2$.`, md`PMOS saturation: $V_D \le V_G + |V_T|$.`],
    sol: md`$\tfrac12(50\mu)(125) = 3.125\,\text{mA/V}^2$. $I_D = 3.125\text{m}(1.2 - 200I_D)^2 \Rightarrow 125I_D^2 - 2.5I_D + 4.5\text{m} = 0 \Rightarrow 18$ or $2\,\text{mA}$. Reject 18 mA ($V_{SG} < 1$).

**$I_D = 2\,\text{mA}$**, $V_S = 3 - 0.4 = 2.6\,\text{V}$, $V_D = 2\text{m}\times750 = 1.5\,\text{V}$. Check: $V_{SD} = 1.1 \ge V_{ov} = 0.8$. ✓

$R_{D,max}$: $V_D \le V_G + 1 = 1.8 \Rightarrow R_{D,max} = 1.8/2\text{m} = 900\,\Omega$.`,
  });

  X.PS33 = P({
    id: 'PS3-3', src: 'Problem Set 3 · #3', title: 'Diode-connected stack and a mirror', big: true,
    q: md`$1X = 500/1$ (NMOS, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$). The node below the $1\kO$ is given as $2\,\text{V}$. Find the three stack node voltages (top to bottom), the $2X$ current, the current in $M_X$, and the size of $M_X$ in units of $X$.`,
    fig: [
      ['w', [1, 0], [4, 0]], ['rail', [2.5, 0], { n: V(5) }],
      ['R', [1, 0], [1, 1.2], { s: '1.3\\kO' }], ['node', [1, 1.2], { n: 'N_1', side: 'r' }],
      ['nmos', [1, 2.2], { sz: '\\tfrac14X', dc: true }], ['node', [1, 3.2], { n: 'N_2', side: 'ar' }],
      ['nmos', [1, 4.2], { sz: '4X', dc: true }], ['node', [1, 5.2], { n: 'N_3', side: 'ar' }],
      ['nmos', [1, 6.2], { sz: '1X' }], ['gnd', [1, 7.2]],
      ['w', [0, 6.2], [-0.8, 6.2], [-0.8, 6.7]], ['V', [-0.8, 6.7], [-0.8, 7.7], { s: V(1.2), side: 'l' }], ['gnd', [-0.8, 7.7]],
      ['R', [4, 0], [4, 1.2], { s: '1\\kO' }], ['w', [4, 1.2], [4.9, 1.2]], ['term', [4.9, 1.2], { n: '2\\,\\text{V}' }],
      ['w', [4, 1.2], [4, 1.6], [4, 2.2]], ['nmos', [4, 3.2], { n: 'M_X' }], ['R', [4, 4.2], [4, 5.4], { s: '1.1\\kO' }], ['gnd', [4, 5.4]],
      ['w', [1, 3.2], [3, 3.2], { hops: [2.4] }],
      ['w', [4, 1.6], [2.4, 1.6], [2.4, 4.2]], ['nmos', [2.4, 5.2], { sz: '2X' }], ['gnd', [2.4, 6.2]], ['w', [1, 5.2], [1.4, 5.2]],
    ],
    parts: [{ lbl: 'N_1', unit: 'V', ans: 3.7 }, { lbl: 'N_2', unit: 'V', ans: 2.3 }, { lbl: 'N_3', unit: 'V', ans: 1.2 }, { lbl: 'I_{2X}', unit: 'mA', ans: 2 }, { lbl: 'I_X', unit: 'mA', ans: 1 }, { lbl: 'M_X\\text{ size}', unit: 'X', ans: 1 }],
    hints: [
      md`The $1X$ at the bottom has $V_{GS} = 1.2$, so $V_{ov} = 0.2$ and it sets the stack current. Compute it.`,
      md`Same current through $4X$ and $\tfrac14X$: overdrive scales as $\dfrac{1}{\sqrt{W/L}}$, so $0.1\,\text{V}$ and $0.4\,\text{V}$. Stack the $V_{GS}$ drops down from $N_1 = 5 - 1.3\text{k}\cdot I$.`,
      md`$M_X$'s gate is on $N_2$ (the wire hops over the vertical line). Its current is $I_{1\text{k}} - I_{2X}$, and its source sits on the $1.1\kO$.`,
    ],
    sol: md`**Stack current:** $1X$: $I = \tfrac12(100\mu)(500)(0.2)^2 = 1\,\text{mA}$.

**Overdrives at 1 mA:** $1X$: 0.2 V; $4X$: $\dfrac{0.2}{\sqrt4} = 0.1$ V ($V_{GS} = 1.1$); $\tfrac14X$: $0.2\cdot\sqrt4 = 0.4$ V ($V_{GS} = 1.4$).

**Nodes:** $N_1 = 5 - 1.3 = 3.7\,\text{V}$, $N_2 = 3.7 - 1.4 = 2.3\,\text{V}$, $N_3 = 2.3 - 1.1 = 1.2\,\text{V}$.

**$2X$:** gate at $N_3 = 1.2$ V, so $V_{ov} = 0.2$, $I = \tfrac12(100\mu)(1000)(0.04) = 2\,\text{mA}$.

**$M_X$:** $I_{1\text{k}} = \dfrac{5-2}{1\}text{k} = 3\,\text{mA}$, so $I_X = 3 - 2 = 1\,\text{mA}$. $V_S = 1.1\,\text{V}$, $V_G = N_2 = 2.3$, so $V_{GS} = 1.2$ and $V_{ov} = 0.2$: $W/L = \dfrac{2(1\text{m})}{(100\mu)(0.04)} = 500 = 1X$. Saturation: $V_D = 2 \ge V_G - V_T = 1.3$. ✓`,
  });

  X.PS34 = P({
    id: 'PS3-4', src: 'Problem Set 3 · #4', title: 'PMOS/NMOS mirror array', big: true,
    q: md`$1X = 200/1$. NMOS: $100\,\mu\text{A/V}^2$; PMOS: $50\,\mu\text{A/V}^2$; $|V_T| = 1\,\text{V}$. Find the reference current, the two left-column node voltages $P_1$ (upper) and $P_2$ (lower), the currents in $M_{P1}$ and $M_{P2}$, and the maximum $R_X$ and $R_Y$ for which $M_{P1}$ and $M_{P2}$ stay saturated.`,
    fig: [
      ['w', [1, 0], [6, 0]], ['rail', [3.5, 0], { n: V(5) }],
      ['pmos', [1, 1], { sz: '2X', flip: true }], ['w', [2, 1], [2, 2], [1, 2]], ['node', [1, 2], { n: 'P_1', side: 'l' }],
      ['pmos', [1, 3], { sz: '2X', flip: true }], ['w', [2, 3], [2, 4], [1, 4]], ['node', [1, 4], { n: 'P_2', side: 'l' }],
      ['w', [1, 4], [1, 5]], ['nmos', [1, 6], { sz: '1X', flip: true }], ['R', [1, 7], [1, 8.2], { s: '500\\,\\Omega', side: 'l' }], ['gnd', [1, 8.2]],
      ['w', [2, 1], [2, 0.5], [5, 0.5], [5, 1], { hops: [4] }], ['w', [3, 0.5], [3, 1]],
      ['pmos', [4, 1], { sz: '4X' }], ['pmos', [4, 3], { n: 'M_{P1}', sz: '4X' }], ['w', [2, 3], [3, 3]],
      ['R', [4, 4], [4, 5.2], { n: 'R_X' }], ['gnd', [4, 5.2]],
      ['pmos', [6, 1], { n: 'M_{P2}', sz: '14X' }], ['w', [6, 2], [7, 2]], ['R', [7, 2], [7, 3.4], { n: 'R_Y' }], ['gnd', [7, 3.4]],
      ['w', [6, 2], [6, 5]], ['w', [6, 4.4], [8, 4.4], [8, 5]],
      ['nmos', [6, 6], { sz: '2X' }], ['R', [6, 7], [6, 8.2], { s: '250\\,\\Omega' }], ['gnd', [6, 8.2]],
      ['nmos', [8, 6], { sz: '4X' }], ['R', [8, 7], [8, 8.2], { s: '125\\,\\Omega' }], ['gnd', [8, 8.2]],
      ['w', [2, 6], [5, 6]], ['w', [5, 6], [5, 6.5], [7, 6.5], [7, 6], { hops: [6] }],
      ['w', [2.6, 6], [2.6, 6.8]], ['V', [2.6, 6.8], [2.6, 7.8], { s: V(1.4) }], ['gnd', [2.6, 7.8]],
    ],
    parts: [{ lbl: 'I_{ref}', unit: 'mA', ans: 0.4 }, { lbl: 'P_1', unit: 'V', ans: 3.8 }, { lbl: 'P_2', unit: 'V', ans: 2.6 }, { lbl: 'I_{MP1}', unit: 'mA', ans: 0.8 }, { lbl: 'I_{MP2}', unit: 'mA', ans: 2.8 }, { lbl: 'R_{X,max}', unit: 'kΩ', ans: 4.5 }, { lbl: 'R_{Y,max}', unit: 'kΩ', ans: 12 }],
    hints: [
      md`Reference: the $1X$ NMOS with $500\,\Omega$: $I = 10\text{m}(0.4 - 500I)^2$. Reject the root that turns it off.`,
      md`The $2X$ and $4X$ NMOS have half and a quarter of the source resistance, so their source stays at the same voltage: their currents are $2\times$ and $4\times$.`,
      md`Left PMOS column: 0.4 mA through each $2X$ gives $V_{SG} = 1.2$ V. $M_{P2}$ ($14X$) mirrors $P_1$: $7\times$. The top $4X$ mirrors $P_1$ ($2\times$), and $M_{P1}$ carries that same current.`,
      md`PMOS saturation: $V_D \le V_G + |V_T|$. KCL at $M_{P2}$'s drain gives the $R_Y$ current.`,
    ],
    sol: md`**Reference:** $\tfrac12(100\mu)(200) = 10\,\text{mA/V}^2$; $I = 10\text{m}(0.4 - 500I)^2 \Rightarrow 2500I^2 - 5I + 1.6\text{m} = 0 \Rightarrow I = 1.6$ or $0.4\,\text{mA}$. $1.6$ mA gives $V_{GS} = 0.6$: reject. **$I_{ref} = 0.4\,\text{mA}$**, source at 0.2 V, $V_{ov} = 0.2$.

**Other NMOS:** $2X$ with $250\,\Omega$ → 0.8 mA; $4X$ with $125\,\Omega$ → 1.6 mA (source stays at 0.2 V).

**Left column:** $2X$ PMOS: $\tfrac12(50\mu)(400) = 10\,\text{mA/V}^2$, so 0.4 mA gives $V_{ov} = 0.2$, $V_{SG} = 1.2$: **$P_1 = 3.8\,\text{V}$, $P_2 = 2.6\,\text{V}$.**

**$M_{P1}$ branch:** top $4X$ at $V_{SG} = 1.2$ → **0.8 mA**, which flows through $M_{P1}$ ($4X$, so $V_{ov} = 0.2$, source at $2.6 + 1.2 = 3.8$ V). Saturation: $V_D \le 2.6 + 1 = 3.6$ → $R_{X,max} = 3.6/0.8\text{m} = 4.5\kO$.

**$M_{P2}$ branch:** $14X$ = $7\times$ the $2X$ → **2.8 mA**. KCL at its drain: $I_{R_Y} = 2.8 - 0.8 - 1.6 = 0.4\,\text{mA}$. Saturation: $V_D \le 3.8 + 1 = 4.8$ → $R_{Y,max} = 4.8/0.4\text{m} = 12\kO$. (The NMOS also need $V_D \ge 0.4$ V, which gives $R_Y \ge 1\kO$.)`,
  });

  // ---------------------------------------------------------------- past midterms (Problem 3s)
  X.F22P3 = P({
    id: 'F22-P3', src: 'Midterm · Fall 2022 · P3 (40 pts)', title: 'Stacked diode-connected devices and a follower', big: true,
    q: md`All transistors are NMOS with $W/L = 50/1$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$). Find $V_1, V_2, V_3, V_4$ and the currents $I_1$ (through $M_1$) and $I_2$ (through $M_4$).`,
    fig: [
      ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: 'V_{DD}=5\\,\\text{V}' }],
      ['nmos', [1, 1], { n: 'M_3', dc: true }], ['node', [1, 2], { n: 'V_3', side: 'l' }],
      ['R', [1, 2], [1, 3.4], { s: '12\\kO', side: 'l' }], ['node', [1, 3.4], { n: 'V_2', side: 'r' }],
      ['nmos', [1, 4.4], { n: 'M_2', dc: true }], ['node', [1, 5.4], { n: 'V_1', side: 'l' }],
      ['nmos', [1, 6.4], { n: 'M_1' }], ['gnd', [1, 7.4]],
      ['w', [0, 6.4], [-0.7, 6.4], [-0.7, 6.9]], ['V', [-0.7, 6.9], [-0.7, 7.9], { s: V(1.2), side: 'l' }], ['gnd', [-0.7, 7.9]],
      ['w', [1, 2], [2, 2]], ['nmos', [3, 2], { n: 'M_5' }], ['w', [3, 1], [3, 0]],
      ['w', [3, 3], [3, 5.4]], ['node', [3, 4.2], { n: 'V_4', side: 'r' }],
      ['w', [1, 5.4], [2, 5.4], [2, 6.4]], ['nmos', [3, 6.4], { n: 'M_4' }], ['gnd', [3, 7.4]],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.4 }, { lbl: 'V_2', unit: 'V', ans: 2.6 }, { lbl: 'V_3', unit: 'V', ans: 3.8 }, { lbl: 'V_4', unit: 'V', ans: 2.4 }, { lbl: 'I_1', unit: 'mA', ans: 0.1 }, { lbl: 'I_2', unit: 'mA', ans: 0.4 }],
    hints: [
      md`$M_1$'s gate is at 1.2 V, so it sets the current down the whole left column. Every device there carries the same $I_1$.`,
      md`$M_3$ and $M_2$ are diode-connected, so each drops $V_{GS} = 1 + V_{ov}$. Walk down from $V_{DD}$: $M_3$, then the $12\kO$, then $M_2$.`,
      md`$M_4$'s gate is at $V_1$. $M_5$ carries the same current as $M_4$ and its gate is at $V_3$: $V_4 = V_3 - V_{GS5}$.`,
    ],
    sol: md`$\tfrac12(100\mu)(50) = 2.5\,\text{mA/V}^2$.

**$I_1$:** $M_1$: $V_{ov} = 0.2$ → $I_1 = 2.5\text{m}(0.04) = 0.1\,\text{mA}$.

**Left column** (same 0.1 mA, same size, so $V_{ov} = 0.2$, $V_{GS} = 1.2$ for each diode-connected device): $V_3 = 5 - 1.2 = 3.8$, $V_2 = 3.8 - (0.1\text{m})(12\text{k}) = 2.6$, $V_1 = 2.6 - 1.2 = 1.4\,\text{V}$. $M_1$ saturated: $V_D = 1.4 \ge 0.2$. ✓

**$I_2$:** $M_4$ gate at 1.4 V → $V_{ov} = 0.4$ → $I_2 = 2.5\text{m}(0.16) = 0.4\,\text{mA}$.

**$V_4$:** $M_5$ carries 0.4 mA, so $V_{ov} = 0.4$, $V_{GS} = 1.4$: $V_4 = 3.8 - 1.4 = 2.4\,\text{V}$. Checks: $M_4$: $V_D = 2.4 \ge 0.4$ ✓; $M_5$: $V_{DS} = 2.6 \ge 0.4$ ✓.`,
  });

  X.F23P3 = P({
    id: 'F23-P3', src: 'Midterm · Fall 2023 · P3 (40 pts)', title: 'Mirror, PMOS load and a matched follower', big: true,
    q: md`$1\times = 125/1$, $R_1 = 0.8\kO$, $R_2 = 1.3\kO$, $V_{DD} = 5\,\text{V}$. Find $V_1$, $V_2$, $V_3$ and $I_1$, and identify each transistor's region.`,
    fig: [
      ['w', [1, 0], [7, 0]], ['rail', [4, 0], { n: 'V_{DD}=5\\,\\text{V}' }],
      ['I', [1, 0], [1, 2.5], { s: '0.25\\,\\text{mA}', side: 'l' }], ['node', [1, 2.5], { n: 'V_1', side: 'l' }],
      ['nmos', [1, 3.5], { n: 'M_1', sz: '1\\times', flip: true, dc: true }], ['R', [1, 4.5], [1, 5.8], { n: 'R_1', side: 'l' }], ['gnd', [1, 5.8]],
      ['nmos', [3, 3.5], { n: 'M_2', sz: '2\\times' }], ['gnd', [3, 4.5]],
      ['pmos', [3, 1.5], { n: 'M_3', sz: '4\\times', flip: true }], ['w', [3, 0], [3, 0.5]], ['w', [4, 1.5], [4, 2.5], [3, 2.5]],
      ['iarr', [3, 2.1], 'd', { n: 'I_1', side: 'l', off: [-14, 0] }],
      ['w', [2, 3.5], [2, 5.1], [4, 5.1], [4, 3.5]], ['nmos', [5, 3.5], { n: 'M_4', sz: '2\\times' }], ['gnd', [5, 4.5]],
      ['R', [5, 0], [5, 2.5], { n: 'R_2' }], ['node', [5, 2.5], { n: 'V_2', side: 'l' }],
      ['w', [5, 2.5], [6, 2.5]], ['nmos', [7, 2.5], { n: 'M_5', sz: '2\\times' }], ['w', [7, 1.5], [7, 0]],
      ['node', [7, 3.5], { n: 'V_3', side: 'r' }], ['nmos', [7, 4.5], { n: 'M_6', sz: '2\\times', dc: true }], ['gnd', [7, 5.5]],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.4 }, { lbl: 'V_2', unit: 'V', ans: 2.4 }, { lbl: 'V_3', unit: 'V', ans: 1.2 }, { lbl: 'I_1', unit: 'mA', ans: 2 },
      { lbl: 'Regions of $M_1$–$M_6$', mc: ['All six in saturation', '$M_2$ and $M_4$ in triode, the rest saturated', '$M_5$ in triode, the rest saturated', '$M_6$ in cut-off'], a: 0 }],
    hints: [
      md`$M_1$ is diode-connected with source degeneration: 0.25 mA through a $1\times$ ($6.25\,\text{mA/V}^2$) gives its $V_{ov}$; add the drop across $R_1$.`,
      md`$M_2$ and $M_4$ have their gates at $V_1$ but **grounded sources**, so their $V_{GS} = V_1$, not $M_1$'s $V_{GS}$. This is not a simple ratio mirror.`,
      md`$M_5$ and $M_6$ are identical and carry the same current, so they split $V_2$ equally: $V_3 = V_2/2$.`,
    ],
    sol: md`$1\times$ NMOS: $\tfrac12(100\mu)(125) = 6.25\,\text{mA/V}^2$; $1\times$ PMOS: $3.125\,\text{mA/V}^2$.

**$V_1$:** $0.25 = 6.25V_{ov}^2 \Rightarrow V_{ov} = 0.2$, $V_{GS1} = 1.2$; $V_1 = 1.2 + (0.25\text{m})(0.8\text{k}) = 1.4\,\text{V}$.

**$I_1$:** $M_2$ ($2\times$, $12.5\,\text{mA/V}^2$) has $V_{GS} = 1.4$, $V_{ov} = 0.4$: $I_1 = 12.5\text{m}(0.16) = 2\,\text{mA}$. $M_3$ ($4\times$ PMOS, $12.5\,\text{mA/V}^2$) carries it with $V_{ov} = 0.4$, so its drain is at $5 - 1.4 = 3.6$ V ($M_2$: $3.6 \ge 0.4$ ✓).

**$V_2$:** $M_4$ is identical to $M_2$: 2 mA, so $V_2 = 5 - (1.3\text{k})(2\text{m}) = 2.4\,\text{V}$ ($\ge 0.4$ ✓).

**$V_3$:** $M_5$, $M_6$ identical with the same current, so equal $V_{GS}$: $V_3 = V_2/2 = 1.2\,\text{V}$, $V_{ov} = 0.2$, current 0.5 mA. $M_5$: $V_{DS} = 3.8$ ✓.

**All six are saturated** ($M_1$, $M_3$, $M_6$ are diode-connected, which always means saturated).`,
  });

  X.P1P1c = P({
    id: 'P1-P1c', src: 'Midterm practice · P1(c)', title: 'Diode-connected NMOS and PMOS',
    q: md`$V_{DD} = 5\,\text{V}$, $I_D = 1\,\text{mA}$, $R_1 = 1\kO$. $k_n = \mu_nC_{ox}(W/L)_1 = 2\,\text{mA/V}^2$, $k_p' = \mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $V_{Tn} = |V_{Tp}| = 1\,\text{V}$. Find $V_A$, $V_B$ and $(W/L)_2$.`,
    fig: [
      ['rail', [1, 0], { n: 'V_{DD}' }], ['pmos', [1, 1], { n: 'M_2', flip: true }], ['w', [2, 1], [2, 2], [1, 2]],
      ['w', [1, 2], [0.2, 2]], ['term', [0.2, 2], { n: 'V_A', side: 'l' }],
      ['R', [1, 2], [1, 3.4], { n: 'R_1', side: 'l' }], ['iarr', [1, 2.7], 'd', { n: 'I_D', off: [16, 0] }],
      ['w', [1, 3.4], [0.2, 3.4]], ['term', [0.2, 3.4], { n: 'V_B', side: 'l' }],
      ['nmos', [1, 4.4], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 5.4]],
    ],
    parts: [{ lbl: 'V_A', unit: 'V', ans: 3 }, { lbl: 'V_B', unit: 'V', ans: 2 }, { lbl: '(W/L)_2', unit: '', ans: 40 }],
    hints: [md`Both transistors are diode-connected, so both are saturated. Here $k_n$ already includes $W/L$: $I_D = \tfrac12k_nV_{ov}^2$.`],
    sol: md`**$V_B$:** $1\text{m} = \tfrac12(2\text{m})V_{ov}^2 \Rightarrow V_{ov} = 1$, $V_B = V_{GS1} = 2\,\text{V}$.

**$V_A$** $= V_B + I_DR_1 = 3\,\text{V}$.

**$(W/L)_2$:** $V_{SG2} = 5 - 3 = 2$, $V_{ov} = 1$: $1\text{m} = \tfrac12(50\mu)(W/L)_2(1)^2 \Rightarrow (W/L)_2 = 40$.`,
  });

  X.P1P3 = P({
    id: 'P1-P3', src: 'Midterm practice · P3 (40 pts)', title: 'Two-level mirror tree', big: true,
    q: md`$I_B = 400\,\mu\text{A}$, $R_1 = 0.5\kO$, $R_2 = 1\kO$, $V_{DD} = 5\,\text{V}$, $1X = 50/1$. $M_2$, $M_5$, $M_6$, $M_7$ are in saturation. Find $V_1$, $I_2$, $I_3$, $I_4$.`,
    fig: [
      ['w', [0, -0.4], [8, -0.4]], ['rail', [4, -0.4], { n: 'V_{DD}' }],
      ['I', [0, -0.4], [0, 1.6], { n: 'I_B', side: 'l' }], ['node', [0, 1.6], { n: 'V_1', side: 'l' }],
      ['nmos', [0, 2.6], { n: 'M_1', sz: '4X', flip: true, dc: true }], ['R', [0, 3.6], [0, 4.8], { n: 'R_1', side: 'l' }], ['gnd', [0, 4.8]],
      ['nmos', [2, 2.6], { n: 'M_2', sz: '2X' }], ['R', [2, 3.6], [2, 4.8], { n: 'R_2' }], ['gnd', [2, 4.8]], ['iarr', [2, 4.2], 'd', { n: 'I_2', off: [-14, 0], side: 'l' }],
      ['pmos', [2, 0.6], { n: 'M_3', sz: '4X', flip: true }], ['w', [3, 0.6], [3, 1.6], [2, 1.6]],
      ['pmos', [4, 0.6], { n: 'M_5', sz: '12X' }], ['nmos', [4, 2.6], { n: 'M_4', sz: '6X', flip: true, dc: true }], ['gnd', [4, 3.6]],
      ['iarr', [4, 3.1], 'd', { n: 'I_3', off: [-14, 0], side: 'l' }],
      ['w', [3, 0.6], [3, 0.1], [5, 0.1], [5, 0.6], { hops: [4] }],
      ['pmos', [6, 0.6], { n: 'M_6', sz: '2X' }], ['w', [5, 0.1], [7, 0.1], [7, 0.6], { hops: [6] }], ['pmos', [8, 0.6], { n: 'M_7', sz: '1X' }],
      ['w', [6, 1.6], [6, 2], [8, 2], [8, 1.6]], ['w', [7, 2], [7, 2.4]],
      ['nmos', [7, 3.4], { n: 'M_8', sz: '1.5X', flip: true, dc: true }], ['gnd', [7, 4.4]], ['iarr', [7, 3.9], 'd', { n: 'I_4', off: [-14, 0], side: 'l' }],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.4 }, { lbl: 'I_2', unit: 'mA', ans: 0.2 }, { lbl: 'I_3', unit: 'mA', ans: 0.6 }, { lbl: 'I_4', unit: 'mA', ans: 0.15 }],
    hints: [
      md`$M_1$ ($4X$, $10\,\text{mA/V}^2$) carries $I_B$: find its $V_{GS}$, then add $I_BR_1$.`,
      md`$M_2$ has a different source resistor, so solve its own quadratic: $I_2 = 5\text{m}(1.4 - 1 - 1000I_2)^2$.`,
      md`$M_3$ is diode-connected and carries $I_2$; $M_5$, $M_6$, $M_7$ copy it by size ratio ($12/4$, $2/4$, $1/4$). $M_6$ and $M_7$ drains are tied.`,
    ],
    sol: md`$1X$: NMOS $2.5\,\text{mA/V}^2$, PMOS $1.25\,\text{mA/V}^2$ (as $\tfrac12\mu C_{ox}W/L$).

**$V_1$:** $M_1$ ($4X$ → $10\,\text{mA/V}^2$): $0.4 = 10V_{ov}^2 \Rightarrow V_{ov} = 0.2$. $V_1 = 1.2 + (0.4\text{m})(0.5\text{k}) = 1.4\,\text{V}$.

**$I_2$:** $M_2$ ($2X$ → $5\,\text{mA/V}^2$): $I_2 = 5(0.4 - I_2)^2$ (mA, kΩ) $\Rightarrow 5I_2^2 - 5I_2 + 0.8 = 0 \Rightarrow I_2 = 0.8$ or $0.2$. $0.8$ gives $V_{GS} = 0.6$: reject. **$I_2 = 0.2\,\text{mA}$.**

**$I_3$:** $M_3$ ($4X$ PMOS, diode) carries 0.2 mA; $M_5$ ($12X$) mirrors $\times3$: **$I_3 = 0.6\,\text{mA}$** ($M_4$, $6X$ diode-connected, happily takes it).

**$I_4$:** $M_6$ ($2X$) gives 0.1 mA, $M_7$ ($1X$) gives 0.05 mA; drains tied: **$I_4 = 0.15\,\text{mA}$** through $M_8$.`,
  });

  X.P4P3 = P({
    id: 'P4-P3', src: 'Midterm practice · P3 (50 pts)', title: 'Three-level bias stack and design', big: true,
    q: md`$1X = W/L = 100/1$, $V_{DD} = 5\,\text{V}$. Find (i) $V_1$, $V_2$, $V_3$; (ii) $I_1$; (iii) $R_1$ and $R_2$ such that $I_1 = I_2 = I_3$; (iv) $V_4$; (v) $R_3$ if $V_{OUT} = 2.5\,\text{V}$.`,
    fig: [
      ['w', [0, -0.2], [6.5, -0.2]], ['rail', [3, -0.2], { n: V(5) }],
      ['I', [0, -0.2], [0, 1.4], { s: '200\\,\\mu\\text{A}', side: 'l' }],
      ['nmos', [0, 2.4], { sz: '1X', flip: true, dc: true }], ['nmos', [0, 4.4], { sz: '1X', flip: true, dc: true }], ['nmos', [0, 6.4], { sz: '1X', flip: true, dc: true }], ['gnd', [0, 7.4]],
      ['node', [1, 2.4], { n: 'V_3', side: 'ar' }], ['node', [1, 4.4], { n: 'V_2', side: 'ar' }], ['node', [1, 6.4], { n: 'V_1', side: 'b' }],
      ['pmos', [3.5, 0.8], { sz: '6X', flip: true }], ['w', [4.5, 0.8], [4.5, 1.8], [3.5, 1.8]], ['node', [3.5, 1.8], { n: 'V_4', side: 'ar' }],
      ['w', [2, 1.8], [5.3, 1.8]],
      ['w', [2, 1.8], [2, 5.4]], ['nmos', [2, 6.4], { sz: '1X' }], ['gnd', [2, 7.4]], ['iarr', [2, 3.4], 'd', { n: 'I_1', off: [-13, 0], side: 'l' }],
      ['w', [1, 4.4], [3, 4.4], { hops: [2] }], ['nmos', [4, 4.4], { sz: '\\tfrac14X' }], ['w', [4, 3.4], [4, 1.8]], ['R', [4, 5.4], [4, 6.6], { n: 'R_2' }], ['gnd', [4, 6.6]], ['iarr', [4, 3.0], 'd', { n: 'I_2', off: [-13, 0], side: 'l' }],
      ['w', [1, 2.4], [4.3, 2.4], [4.3, 3.4], { hops: [2, 4] }], ['nmos', [5.3, 3.4], { sz: '1X' }], ['w', [5.3, 2.4], [5.3, 1.8]], ['R', [5.3, 4.4], [5.3, 5.6], { n: 'R_1' }], ['gnd', [5.3, 5.6]], ['iarr', [5.3, 2.1], 'd', { n: 'I_3', off: [13, 0] }],
      ['pmos', [6.5, 0.8], { sz: '4X' }], ['w', [5.5, 0.8], [4.5, 0.8]],
      ['w', [6.5, 1.8], [6.5, 5.4]], ['nmos', [6.5, 6.4], { sz: '1X' }], ['gnd', [6.5, 7.4]],
      ['w', [1, 6.4], [1, 8], [5.5, 8], [5.5, 6.4]],
      ['w', [6.5, 3], [7.5, 3]], ['R', [7.5, 3], [7.5, 4.4], { n: 'R_3' }], ['gnd', [7.5, 4.4]], ['node', [6.5, 3], { n: 'V_{OUT}', side: 'l' }],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'V_2', unit: 'V', ans: 2.4 }, { lbl: 'V_3', unit: 'V', ans: 3.6 }, { lbl: 'I_1', unit: 'mA', ans: 0.2 }, { lbl: 'R_1', unit: 'kΩ', ans: 12 }, { lbl: 'R_2', unit: 'kΩ', ans: 5 }, { lbl: 'V_4', unit: 'V', ans: 3.8 }, { lbl: 'R_3', unit: 'kΩ', ans: 12.5 }],
    hints: [
      md`The left stack is three identical diode-connected $1X$ devices carrying $200\,\mu\text{A}$: each drops the same $V_{GS}$.`,
      md`$I_1$'s device has its gate at $V_1$ and a grounded source. For $I_2 = I_3 = I_1$: find the $V_{GS}$ each device needs for 0.2 mA given its size, then its source voltage, then $R = V_S/I$.`,
      md`The $6X$ PMOS is diode-connected and carries $I_1 + I_2 + I_3$. The $4X$ mirrors it; the bottom-right $1X$ sinks $I(V_1)$; the rest goes into $R_3$.`,
    ],
    sol: md`$1X$ NMOS: $\tfrac12(100\mu)(100) = 5\,\text{mA/V}^2$. PMOS $1X$: $2.5\,\text{mA/V}^2$.

**(i)** $0.2 = 5V_{ov}^2 \Rightarrow V_{ov} = 0.2$, $V_{GS} = 1.2$: $V_1 = 1.2$, $V_2 = 2.4$, $V_3 = 3.6\,\text{V}$.

**(ii)** Gate at $V_1$, grounded source: same as the stack device: $I_1 = 0.2\,\text{mA}$.

**(iii)** $\tfrac14X$ ($1.25\,\text{mA/V}^2$) at 0.2 mA: $V_{ov} = 0.4$, $V_{GS} = 1.4$, so its source is at $2.4 - 1.4 = 1.0$ V: $R_2 = 1.0/0.2\text{m} = 5\kO$. $1X$ with gate $V_3$: $V_{GS} = 1.2$, source at $2.4$ V: $R_1 = 2.4/0.2\text{m} = 12\kO$.

**(iv)** The $6X$ PMOS ($15\,\text{mA/V}^2$) carries 0.6 mA: $V_{ov} = 0.2$, $V_{SG} = 1.2$, so $V_4 = 3.8\,\text{V}$.

**(v)** The $4X$ PMOS mirrors $\tfrac46 \times 0.6 = 0.4\,\text{mA}$; the bottom $1X$ (gate $V_1$) sinks 0.2 mA; $R_3$ gets 0.2 mA: $R_3 = 2.5/0.2\text{m} = 12.5\kO$.`,
  });

  X.P5P3 = P({
    id: 'P5-P3', src: 'Midterm practice · P3 (50 pts)', title: 'Eleven transistors, one trap', big: true,
    q: md`$1x = W/L = 25/1$, $R = 2\kO$, $V_{DD} = 10\,\text{V}$. Find $V_1$, $V_2$, $V_3$, $V_4$.`,
    fig: [
      ['w', [0, 0], [13, 0]], ['rail', [5, 0], { n: V(10) }],
      ['pmos', [0, 1], { n: 'M_1', sz: '4x', flip: true }], ['w', [1, 1], [1, 2], [0, 2]], ['I', [0, 2], [0, 3.4], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['gnd', [0, 3.4]],
      ['pmos', [2, 1], { n: 'M_2', sz: '4x' }], ['node', [2, 2], { n: 'V_1', side: 'al' }],
      ['nmos', [2, 3], { n: 'M_3', sz: '2x', flip: true, dc: true }], ['R', [2, 4], [2, 5.2], { n: 'R', side: 'l' }], ['gnd', [2, 5.2]],
      ['w', [1, 1], [1, 0.45], [7, 0.45], [7, 1], { hops: [2, 4, 6] }], ['w', [3, 0.45], [3, 1]],
      ['pmos', [4, 1], { n: 'M_4', sz: '2x' }], ['nmos', [4, 3], { n: 'M_5', sz: '1x' }],
      ['R', [4, 4], [4, 5.2], { n: 'R' }], ['node', [4, 5.2], { n: 'V_2', side: 'l' }], ['R', [4, 5.2], [4, 6.4], { n: 'R' }], ['gnd', [4, 6.4]],
      ['w', [4, 5.2], [5, 5.2]], ['nmos', [6, 5.2], { n: 'M_6', sz: '1x' }], ['gnd', [6, 6.2]],
      ['R', [6, 0], [6, 3], { n: 'R' }], ['w', [6, 3], [6, 4.2]], ['w', [6, 3.5], [6.8, 3.5]], ['term', [6.8, 3.5], { n: 'V_3' }],
      ['pmos', [8, 1], { n: 'M_7', sz: '4x' }], ['w', [8, 2], [8, 2.4]],
      ['R', [8, 2.4], [8, 3.8], { n: 'R', side: 'l' }], ['R', [8, 3.8], [8, 5.2], { n: 'R', side: 'l' }], ['R', [8, 5.2], [8, 6.6], { n: 'R', side: 'l' }],
      ['nmos', [8, 7.6], { n: 'M_8', sz: '2x', dc: true }], ['gnd', [8, 8.6]],
      ['w', [8, 2.4], [9, 2.4]], ['nmos', [10, 2.4], { n: 'M_9', sz: '1x' }], ['gnd', [10, 3.4]],
      ['w', [8, 3.8], [10.2, 3.8]], ['nmos', [11.2, 3.8], { n: 'M_{10}', sz: '2x' }], ['gnd', [11.2, 4.8]],
      ['w', [8, 5.2], [11.4, 5.2]], ['nmos', [12.4, 5.2], { n: 'M_{11}', sz: '3x' }], ['gnd', [12.4, 6.2]],
      ['R', [13, 0], [13, 1.4], { n: 'R' }], ['w', [10, 1.4], [13.8, 1.4]], ['term', [13.8, 1.4], { n: 'V_4' }],
      ['w', [11.2, 2.8], [11.2, 1.4]], ['w', [12.4, 4.2], [12.4, 1.4]],
    ],
    figOpts: { maxW: 760 },
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.4 }, { lbl: 'V_2', unit: 'V', ans: 0.1 }, { lbl: 'V_3', unit: 'V', ans: 10 }, { lbl: 'V_4', unit: 'V', ans: 5.4 }],
    hints: [
      md`$M_1$ ($4x$ PMOS) carries 100 µA and sets the PMOS gate line. $M_2$ copies it ($4x$), $M_4$ gives half, $M_7$ copies it.`,
      md`$M_3$ is a diode-connected NMOS with $R$ under it: $V_1 = V_{GS3} + (0.1\,\text{mA})R$. $M_5$ (gate $V_1$) carries $M_4$'s 50 µA through $2R$; $V_2$ is the midpoint of that $2R$.`,
      md`Check $M_6$'s $V_{GS}$ before assuming it conducts.`,
      md`$M_7$'s 100 µA flows down the resistor chain into diode-connected $M_8$. The chain voltages bias $M_9$–$M_{11}$, whose currents all pull through the top $R$.`,
    ],
    sol: md`$1x$: NMOS $1.25\,\text{mA/V}^2$, PMOS $0.625\,\text{mA/V}^2$ (as $\tfrac12\mu C_{ox}W/L$).

**$V_1$:** $M_1$ ($4x$ → $2.5$): $0.1 = 2.5V_{ov}^2 \Rightarrow V_{ov} = 0.2$. $M_2$ copies 0.1 mA into $M_3$ ($2x$ → $2.5$): $V_{GS3} = 1.2$; $V_1 = 1.2 + (0.1\text{m})(2\text{k}) = 1.4\,\text{V}$.

**$V_2$:** $M_4$ ($2x$) supplies 50 µA. $M_5$ ($1x$, gate 1.4 V, $4\kO$ below): $I = 1.25(0.4 - 4I)^2 \Rightarrow I = 0.05\,\text{mA}$ (the other root turns it off), consistent with $M_4$. Source at $0.2$ V, so the midpoint $V_2 = 0.1\,\text{V}$.

**$V_3$: the trap.** $M_6$'s gate is at $V_2 = 0.1\,\text{V} < V_T$: **$M_6$ is off**, no current flows in its $R$, so $V_3 = 10\,\text{V}$.

**$V_4$:** $M_7$ copies 0.1 mA down the chain into $M_8$ ($2x$ → $2.5$): $V_{GS8} = 1.2$. Chain nodes (bottom up): $1.2, 1.4, 1.6, 1.8\,\text{V}$. So $M_9$ ($1x$, 1.8 V): $1.25(0.8)^2 = 0.8\,\text{mA}$; $M_{10}$ ($2x$, 1.6 V): $2.5(0.6)^2 = 0.9\,\text{mA}$; $M_{11}$ ($3x$, 1.4 V): $3.75(0.4)^2 = 0.6\,\text{mA}$. Total $2.3\,\text{mA}$: $V_4 = 10 - (2\text{k})(2.3\text{m}) = 5.4\,\text{V}$ (all three saturated since $5.4 \ge 0.8$).`,
  });

  X.P6P3 = P({
    id: 'P6-P3', src: 'Midterm practice · P3 (50 pts)', title: 'Stack, mirror and a follower that ends at the edge', big: true,
    q: md`$1X = 100/1$, $V_{DD} = 5\,\text{V}$. Find $V_1$ through $V_5$.`,
    fig: [
      ['w', [0, 0], [4, 0]], ['rail', [3, 0], { n: 'V_{DD}=5\\,\\text{V}' }],
      ['I', [0, 0], [0, 1.2], { s: '0.8\\,\\text{mA}', side: 'l' }], ['node', [0, 1.2], { n: 'V_2', side: 'l' }],
      ['nmos', [0, 2.2], { n: 'M_2', sz: '1X', flip: true, dc: true }], ['node', [0, 3.2], { n: 'V_1', side: 'l' }],
      ['nmos', [0, 4.2], { n: 'M_1', sz: '4X', flip: true, dc: true }], ['gnd', [0, 5.2]],
      ['nmos', [2, 2.2], { n: 'M_4', sz: '4X' }], ['w', [2, 1.2], [2, 0]], ['nmos', [2, 4.2], { n: 'M_3', sz: '4X' }], ['gnd', [2, 5.2]],
      ['node', [2, 3.2], { n: 'V_3', side: 'ar' }],
      ['R', [4, 0], [4, 1.2], { s: '1\\kO' }], ['node', [4, 1.2], { n: 'V_5', side: 'r' }],
      ['w', [2, 3.2], [3, 3.2], [3, 2.2]], ['nmos', [4, 2.2], { n: 'M_6', sz: '1X' }], ['node', [4, 3.2], { n: 'V_4', side: 'r' }],
      ['nmos', [4, 4.2], { n: 'M_5', sz: '1X' }], ['gnd', [4, 5.2]],
      ['w', [1, 4.2], [1, 4.85], [3, 4.85], [3, 4.2], { hops: [2] }],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'V_2', unit: 'V', ans: 2.6 }, { lbl: 'V_3', unit: 'V', ans: 1.4 }, { lbl: 'V_4', unit: 'V', ans: 0.2 }, { lbl: 'V_5', unit: 'V', ans: 4.8 }],
    hints: [
      md`$M_1$ and $M_2$ are diode-connected and carry 0.8 mA. Get each $V_{GS}$ from its size.`,
      md`$M_3$ mirrors $M_1$ (same size). $M_4$ carries that current with its gate at $V_2$: $V_3 = V_2 - V_{GS4}$.`,
      md`$M_5$ is a quarter of $M_1$. $M_6$ carries $M_5$'s current with gate at $V_3$.`,
    ],
    sol: md`$1X$: $\tfrac12(100\mu)(100) = 5\,\text{mA/V}^2$.

$M_1$ ($4X$, 20): $0.8 = 20V_{ov}^2 \Rightarrow V_{ov} = 0.2$, **$V_1 = 1.2$**. $M_2$ ($1X$, 5): $V_{ov} = 0.4$, **$V_2 = 1.2 + 1.4 = 2.6$**.

$M_3$ = $M_1$ (same $V_{GS}$, same size) → 0.8 mA. $M_4$ ($4X$) at 0.8 mA: $V_{GS} = 1.2$, **$V_3 = 2.6 - 1.2 = 1.4$**. ($M_4$: $V_{DS} = 3.6$ ✓.)

$M_5$ is $\tfrac14$ of $M_1$ → 0.2 mA. **$V_5 = 5 - 0.2 = 4.8$**. $M_6$ ($1X$) at 0.2 mA: $V_{ov} = 0.2$, $V_{GS} = 1.2$: **$V_4 = 1.4 - 1.2 = 0.2\,\text{V}$**.

Note $M_5$ has $V_{DS} = 0.2 = V_{ov}$: **exactly at the edge of saturation**. Exam problems love this boundary.`,
  });

  // ---------------------------------------------------------------- the unit
  C.unit({
    id: 'u4', num: 'Unit 4', title: 'MOSFET DC Analysis',
    blurb: 'Regions of operation, the square law, PMOS in magnitudes, source-degenerated bias, diode-connected devices, current mirrors, stacks, and X-sizing. This is the 40–50 point exam problem.',
    lessons: [
      {
        id: 'u4-basics', title: 'MOSFET terminals and overdrive',
        steps: [
          R(md`
            A MOSFET has **gate (G)**, **drain (D)** and **source (S)**. The gate sits on an insulating oxide, so at DC **the gate draws no current, ever.** That one fact is why gates can be tied to any node without loading it.

            The gate–source voltage controls a channel between drain and source. Nothing flows until $V_{GS}$ exceeds the **threshold** $V_T$. How far above threshold you are gets its own name:

            !!key Overdrive
            $$V_{ov} = V_{GS} - V_T\quad(\text{NMOS}),\qquad V_{ov} = V_{SG} - |V_T|\quad(\text{PMOS})$$
            Every current formula is written in terms of $V_{ov}$.

            **Symbols** used here (and in the course figures): the arrow sits on the **source**. NMOS: arrow points *out*, source at the bottom. PMOS: arrow points *in*, source at the top (toward $V_{DD}$).

            **Course parameters** (printed on every exam): $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_T| = 1\,\text{V}$, $\lambda = 0$.
          `, [['nmos', [1, 1], { n: '\\text{NMOS}' }], ['txt', [1.25, -0.15], '$D$', { a: 'l' }], ['txt', [1.25, 2.15], '$S$', { a: 'l' }], ['txt', [0, 0.75], '$G$', { a: 'c' }], ['pmos', [4, 1], { n: '\\text{PMOS}' }], ['txt', [4.25, -0.15], '$S$', { a: 'l' }], ['txt', [4.25, 2.15], '$D$', { a: 'l' }], ['txt', [3, 0.75], '$G$', { a: 'c' }]]),
          P({
            q: md`An NMOS has $V_G = 2.3\,\text{V}$ and $V_S = 1.1\,\text{V}$ ($V_T = 1\,\text{V}$). What is its overdrive?`,
            parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.2 }],
            sol: md`$V_{GS} = 1.2$, $V_{ov} = 1.2 - 1 = 0.2\,\text{V}$. (That's $M_X$ in Problem Set 3 #3.)`,
          }),
          P({
            q: md`A gate is connected to a node in the middle of a resistor divider. How much does the gate change the divider's voltage?`,
            parts: [{ mc: ['Not at all: the gate draws no DC current.', 'It pulls the voltage down by $V_T$.', 'It adds a resistance $1/g_m$ to ground.', 'Depends on the region.'], a: 0, why: [null, 'Threshold is about the channel, not the gate current.', 'Looking into a gate you see an open circuit at DC.', 'In every region, gate current is zero.'] }],
            sol: md`Zero gate current in every region. A gate is an open circuit at DC, so the divider is unaffected.`,
          }),
        ],
      },
      {
        id: 'u4-regions', title: 'Regions of operation',
        steps: [
          R(md`
            | Region | NMOS condition | Drain current |
            |---|---|---|
            | Cut-off | $V_{GS} < V_T$ | $I_D = 0$ |
            | Triode | $V_{GS} \ge V_T$ and $V_{DS} < V_{ov}$ | $\mu_nC_{ox}\tfrac{W}{L}\left[V_{ov}V_{DS} - \tfrac12V_{DS}^2\right]$ |
            | **Saturation** | $V_{GS} \ge V_T$ and $V_{DS} \ge V_{ov}$ | $\tfrac12\mu_nC_{ox}\tfrac{W}{L}V_{ov}^2$ |

            In **triode**, the channel acts like a voltage-controlled resistor. In **saturation**, it's a voltage-controlled current source (a two-port VCCS): the current is set by $V_{GS}$ alone and ignores $V_{DS}$ (with $\lambda = 0$). Amplifiers and mirrors live in saturation.

            !!key The shortcut that saves the most time on the exam
            Subtract $V_S$ from both sides of $V_{DS} \ge V_{GS} - V_T$. The source cancels:
            $$\textbf{NMOS saturated} \iff V_D \ge V_G - V_T$$
            $$\textbf{PMOS saturated} \iff V_D \le V_G + |V_T|$$
            Only the gate and drain node voltages matter. Every "find $R_{D,max}$" becomes two lines.
          `),
          G('mos_region', { need: 5 }),
        ],
      },
      {
        id: 'u4-square', title: 'The square law',
        steps: [
          R(md`
            In saturation:
            $$I_D = \tfrac12\,\mu_nC_{ox}\,\frac{W}{L}\,V_{ov}^2\qquad\Longleftrightarrow\qquad V_{ov} = \sqrt{\frac{2I_D}{\mu_nC_{ox}\,W/L}}$$

            **Precompute the constant.** Write $K = \tfrac12\mu_nC_{ox}\tfrac{W}{L}$ once per device, then $I_D = KV_{ov}^2$. For example, $W/L = 125$ gives $K = 6.25\,\text{mA/V}^2$. (Not the exam cover's $k_n'$: that one is $\mu_nC_{ox}$ alone.)

            Useful facts:
            - Doubling $V_{ov}$ quadruples $I_D$.
            - Doubling $W/L$ doubles $I_D$ at the same $V_{ov}$.
            - Exam numbers are chosen so $V_{ov}$ comes out as 0.1, 0.2, 0.4, ... V. If you get an ugly square root, recheck.

            !!trap The ½
            Common slip: dropping the $\tfrac12$. If your answer is off by exactly a factor of 2, that's why. (Careful: one past paper gives $k_n = \mu_nC_{ox}(W/L)$ *including* $W/L$, but the $\tfrac12$ still applies.)
          `),
          G('mos_id', { need: 3 }),
          G('mos_vgs', { need: 3 }),
        ],
      },
      {
        id: 'u4-pmos', title: 'PMOS: think in magnitudes',
        steps: [
          R(md`
            A PMOS is an NMOS turned upside down: source toward $V_{DD}$, current flowing **out** of the drain. Rewrite everything with positive magnitudes and the formulas are identical:

            $$V_{ov} = V_{SG} - |V_T|,\qquad \text{saturated if } V_{SD} \ge V_{ov},\qquad I_D = \tfrac12\mu_pC_{ox}\tfrac{W}{L}V_{ov}^2$$

            !!trap Half the mobility
            $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, half the NMOS value. A PMOS needs **twice** the $W/L$ of an NMOS to carry the same current at the same overdrive.

            Saturation shortcut: $V_D \le V_G + |V_T|$. For a PMOS, a *larger* drain resistor to ground pushes $V_D$ *up* toward that limit.
          `),
          G('mos_region', { need: 2 }),
          P({
            q: md`A PMOS ($W/L = 200$) has its source at $5\,\text{V}$ and gate at $3.6\,\text{V}$. It's saturated. Find $I_D$.`,
            parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.8 }],
            hints: [md`$V_{SG} = 1.4$, so $V_{ov} = 0.4$. Use $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$.`],
            sol: md`$V_{SG} = 5 - 3.6 = 1.4$, $V_{ov} = 0.4$. $K = \tfrac12(50\mu)(200) = 5\,\text{mA/V}^2$, so $I_D = 5\text{m}\times(0.4)^2 = 0.8\,\text{mA}$. An NMOS of the same size would carry twice that.`,
          }),
        ],
      },
      {
        id: 'u4-bias', title: 'Biasing with a source resistor',
        steps: [
          R(md`
            The standard bias problem: gate at a fixed voltage, resistor $R_S$ in the source. The source voltage rises with current, which **reduces** $V_{GS}$. That's negative feedback, and it makes the math a quadratic.

            !!method Procedure
            1. Assume saturation. $I_D = K(V_{GS} - V_T)^2$.
            2. $V_{GS} = V_G - I_DR_S$ (NMOS) or $V_{SG} = (V_{DD} - I_DR_S) - V_G$ (PMOS).
            3. Substitute → quadratic in $I_D$.
            4. **Keep the root with $V_{GS} > V_T$; reject the other.** Solving for $I_D$, the fake root is the **larger** current: its big $I_DR_S$ lifts the source until $V_{GS} < V_T$. Write the reason: "reject, it gives $V_{GS} < V_T$". It's graded.
            5. Back out $V_S$ and $V_D$.
            6. **Verify saturation** with the shortcut.

            !!key Cleaner: solve for $V_{ov}$ instead
            $V_G - V_T = V_{ov} + I_DR_S$ with $I_D = KV_{ov}^2$:
            $$KR_S\,V_{ov}^2 + V_{ov} - (V_G - V_T) = 0$$
            This always has one positive and one negative root. Keep the positive one; nothing to remember. (PMOS: the same with $V_{DD} - V_G - |V_T|$ on the right.)

            | Solved for | Keep | Reject |
            |---|---|---|
            | $I_D$ or $V_S$ | smaller root | larger root |
            | $V_{ov}$ or $V_{GS}$ | positive root | negative root |

            Why a fake root exists at all: the square law only holds for $V_{ov} > 0$, but $V_{ov}^2$ can't tell $+0.6$ from $-0.6$.

            !!tip Speed trick
            If you suspect the numbers are "nice", guess $V_{ov}$ from $\{0.1, 0.2, 0.4, \dots\}$, compute $I_D = KV_{ov}^2$, and check $V_G = V_T + V_{ov} + I_DR_S$. Even with a calculator (allowed on your exam), this is often faster than the quadratic.
          `),
          G('mos_rs_bias', { need: 3 }),
          G('pmos_rs_bias', { need: 2 }),
        ],
      },
      {
        id: 'u4-ps3a', title: 'Problem Set 3 (Problems 1–2)', kind: 'pset',
        steps: [R(md`The two single-transistor bias problems.`), X.PS31, X.PS32],
      },
      {
        id: 'u4-diodeconn', title: 'Diode-connected transistors',
        steps: [
          R(md`
            Tie the gate to the drain and you get a **diode-connected** transistor: $V_{DS} = V_{GS}$.

            Since $V_{GS} \ge V_{GS} - V_T$ always holds, **a conducting diode-connected transistor is always saturated.** No check needed.

            It behaves as a two-terminal device with $I = K(V - V_T)^2$. Push a current into it and it produces exactly the $V_{GS}$ needed to carry that current. That's how references are made: **current in → voltage out**, then that voltage drives other gates.
          `),
          G('diode_conn', { need: 3 }),
        ],
      },
      {
        id: 'u4-mirror', title: 'Current mirrors',
        steps: [
          R(md`
            Connect a second transistor's gate and source to a diode-connected reference: both see the **same $V_{GS}$**. If the second is saturated, it carries
            $$\frac{I_{out}}{I_{REF}} = \frac{(W/L)_2}{(W/L)_1}$$
            no matter what's on its drain.

            !!key X-sizing notation
            Problems define a unit device, e.g. $1X = 500/1$, and label transistors $2X$, $4X$, $\tfrac14X$. Two scaling laws do all the work. **Don't mix them up:**
            - **Same $V_{GS}$** (gates and sources tied): $I_D \propto W/L$. A $4X$ mirrors 4× the current.
            - **Same current** (devices in series): $V_{ov} \propto \dfrac{1}{\sqrt{W/L}}$. A $4X$ has half the overdrive; a $\tfrac14X$ has double.

            A mirror output stays a current source only while it's **saturated**. The drain resistor you can hang on it is limited by the shortcut: $V_D \ge V_G - V_T$ (NMOS) or $V_D \le V_G + |V_T|$ (PMOS).
          `),
          G('mirror_ratio', { need: 4 }),
          G('mirror_rmax', { need: 2 }),
          P({
            q: md`Two NMOS share a gate, but one has a source resistor and the other's source is grounded. Do they carry currents in the ratio of their sizes?`,
            parts: [{ mc: ['No. Their $V_{GS}$ differ, so you must solve each separately.', 'Yes, mirrors always scale by size.', 'Yes, if both are saturated.', 'Only if the resistor is small.'], a: 0, why: [null, 'The ratio rule needs equal $V_{GS}$, which means equal gate **and** equal source voltage.', 'Saturation is necessary but not sufficient.', 'Any source resistor changes $V_{GS}$.'] }],
            sol: md`The ratio rule requires identical $V_{GS}$. A source resistor raises the source, so $V_{GS}$ differs, and you solve that device on its own. That's exactly Fall 2023 P3's $M_2$ and Practice P3's $M_2$.`,
          }),
        ],
      },
      {
        id: 'u4-stack', title: 'Stacks and followers',
        steps: [
          R(md`
            Devices in **series** carry the same current. So:
            - Each diode-connected device in a stack drops its own $V_{GS} = V_T + V_{ov}$; node voltages add up from ground (or down from the rail).
            - $V_{ov} \propto \dfrac{1}{\sqrt{W/L}}$: with $1X$ at $0.2\,\text{V}$, a $4X$ drops $1.1\,\text{V}$ and a $\tfrac14X$ drops $1.4\,\text{V}$. **No square roots needed.**

            **Source followers.** A transistor whose drain is at the rail and whose current is set by something below it has $V_S = V_G - V_{GS}$, where $V_{GS}$ comes from that current. Two identical devices stacked with the same current split the voltage equally (Fall 2023 P3: $V_3 = V_2/2$).
          `),
          G('stack_vov', { need: 3 }),
          G('size_for_current', { need: 2 }),
        ],
      },
      {
        id: 'u4-ps3b', title: 'Problem Set 3 (Problems 3–4)', kind: 'pset',
        steps: [R(md`The mirror problems. Watch the wire hops: a hop means *no* connection.`), X.PS33, X.PS34],
      },
      {
        id: 'u4-exam', title: 'Past midterms: Problem 3', kind: 'exam',
        steps: [
          R(md`
            Every Problem 3 (and the MOSFET short-answer) from the past midterms, all redrawn. These are worth 40–50 points. Work each fully on paper first.

            !!method Attack plan for any mirror circuit
            1. Find the **reference**: a known current into a diode-connected device, or a known gate voltage on a device with a grounded source.
            2. Propagate by **same-$V_{GS}$ → scale current** and **same-current → scale $V_{ov}$**.
            3. Walk node voltages along stacks.
            4. **Check every device's region**, including for cut-off surprises (a gate below $V_T$).
          `),
          X.F22P3, X.F23P3, X.P1P1c, X.P1P3, X.P4P3, X.P5P3, X.P6P3,
        ],
      },
      {
        id: 'u4-gm', title: 'Preview: transconductance',
        steps: [
          R(md`
            Once a MOSFET is biased, small changes in $V_{GS}$ produce small changes in $I_D$. That's Unit 2's idea applied to the square law:
            $$g_m = \left.\frac{\partial I_D}{\partial V_{GS}}\right|_Q = \mu_nC_{ox}\frac{W}{L}V_{ov} = \frac{2I_D}{V_{ov}} = \sqrt{2\mu_nC_{ox}\tfrac{W}{L}I_D}$$
            This $g_m$ is exactly the $g_mv_x$ source in the Problem Set 1 models. The small-signal MOSFET **is** that VCCS. The rest of the course builds amplifiers from it.
          `),
          G('gm_calc', { need: 2 }),
        ],
      },
      {
        id: 'u4-check', title: 'Checkpoint: MOSFET DC', kind: 'checkpoint',
        steps: [
          G('mos_region', { need: 2 }),
          G('mos_rs_bias', { need: 2 }),
          G('pmos_rs_bias', { need: 1 }),
          G('mirror_rmax', { need: 2 }),
          G('stack_vov', { need: 2 }),
          G('mirror_ratio', { need: 2 }),
          G('size_rules', { need: 1 }),
        ],
      },
    ],
  });
})();

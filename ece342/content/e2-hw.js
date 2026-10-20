/* Exam 2 homework: Problem Sets 4, 5 and 6, every part interactive and worked.
   Every answer here was checked against an exact small-signal solve; where the posted solution approximates too
   hard (HW5 e–g and i) the solution says so and keeps the exact form. */
(function () {
  'use strict';
  const { R, P } = C;
  const ex = (e, n, l, o) => E2.ex(e, n, l, o);

  // ---------------------------------------------------------------- drawing helpers (local)
  const lookDn = (p, n = 'R_{EQ}') => ['term', p, { n: `\\downarrow ${n}`, side: 'r' }];
  const lookUp = (p, n = 'R_{EQ}') => ['term', p, { n: `\\uparrow ${n}`, side: 'r' }];
  const lookL = (p, n = 'R_{EQ}') => ['term', p, { n: `\\leftarrow ${n}`, side: 'r' }];
  const out = (p, n = 'v_{out}') => ['term', p, { n, side: 'r' }];
  const vinSrc = (x, y, n = 'v_{in}', side = 'l') => [['Vac', [x, y], [x, y + 1], { n, side }], ['gnd', [x, y + 1]]];

  // ================================================================ Problem Set 4
  // #1: three single-transistor stages, each with R_G in the gate lead
  const hw41 = (kind) => {
    const fig = [['rail', [2, -1.2]], ['R', [2, -1.2], [2, 0], { n: 'R_D' }], ['nmos', [2, 1]], ['R', [-0.6, 1], [1, 1], { n: 'R_G' }], ['w', [-0.6, 1], [-0.6, 1.4]]];
    if (kind === 'b') fig.push(['V', [-0.6, 1.4], [-0.6, 2.4], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 2.4]]);
    else fig.push(['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 2.4], [-0.6, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 3.4]]);
    if (kind === 'b') fig.push(['R', [2, 2], [2, 3.2], { n: 'R_S' }], ['Vac', [2, 3.2], [2, 4.2], { n: 'v_{in}', side: 'r' }], ['gnd', [2, 4.2]]);
    else fig.push(['R', [2, 2], [2, 3.2], { n: 'R_S', side: kind === 'c' ? 'l' : 'r' }], ['gnd', [2, 3.2]]);
    if (kind === 'c') fig.push(['w', [2, 2], [2.8, 2]], out([2.8, 2], 'v_{OUT}'));
    else fig.push(['w', [2, 0], [2.8, 0]], out([2.8, 0], 'v_{OUT}'));
    return fig;
  };
  const DV = { gm: [2e-3, 5e-3], RD: [1e3, 1e4], RS: [200, 5e3] };

  const HW4 = [
    R(md`
      **Course parameters:** $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TH}| = 1\,\text{V}$, and on this set **$\lambda = 0$**, so $r_{ds} \to \infty$ in every answer (the solutions show where $r_{ds}$ would enter).

      **What this set drills**
      - **#1:** the three single-transistor stages (degenerated CS, CG, CD), each with a gate resistor that does nothing. Learn to read "where does the input enter, where is the output taken".
      - **#2:** a push-pull CMOS stage loaded by two diodes. DC bias by symmetry, then $A_V = -G_M R_{out}$ with two transconductors in parallel.
      - **#3:** sizing from overdrive and currents, then a common-gate input feeding a mirror.
      - **#4:** a folded cascode: bias for the edge of saturation, then the gain in one line.
    `),
    P({
      id: 'e2hw4-1a', src: 'Problem Set 4 · #1(a)', title: 'Degenerated common source (with $R_G$)',
      q: md`Assume saturation and $\lambda = 0$. Find the incremental gain $v_{out}/v_{in}$ (output at the drain).`,
      fig: hw41('a'),
      parts: [ex('-gm*RD/(1+gm*RS)', ['gm', 'RD', 'RS'], 'v_{out}/v_{in}', { ranges: DV })],
      hints: [
        md`The gate draws no current, so $R_G$ drops nothing: $v_g = v_{in}$. $V_B$ is DC, a short for small signals.`,
        md`KVL around the input: $v_{in} = v_{gs} + i_dR_S$ with $i_d = g_mv_{gs}$.`,
      ],
      sol: md`
**What to see first:** a common-source stage with **source degeneration** $R_S$. $R_G$ carries no current, so it is invisible.

**Steps.** $v_{in} = v_{gs} + g_mv_{gs}R_S \Rightarrow v_{gs} = \dfrac{v_{in}}{1+g_mR_S}$, so the drain current is $i_d = \dfrac{g_m}{1+g_mR_S}v_{in}$, pulled down through $R_D$:
$$\frac{v_{out}}{v_{in}} = -\frac{g_mR_D}{1+g_mR_S}$$

**With $r_{ds}$** (for later): $-\dfrac{g_mR_D}{1 + g_mR_S + (R_D+R_S)/r_{ds}}$. In $G_MR_{out}$ language: $G_M = \dfrac{g_m}{1+g_mR_S}$ (the short-circuit drain current per volt) and $R_{out} = R_D$.

**Sanity check:** $R_S = 0$ gives $-g_mR_D$; $g_mR_S \gg 1$ gives $-R_D/R_S$, a ratio of resistors, independent of the transistor.

**Pattern:** degeneration divides $g_m$ by $(1 + g_mR_S)$. Remember it as "$G_M = \dfrac{1}{1/g_m + R_S}$": the source sees $1/g_m$ in series with $R_S$.`,
    }),
    P({
      id: 'e2hw4-1b', src: 'Problem Set 4 · #1(b)', title: 'Common gate driven through $R_S$',
      q: md`The gate sits at $V_B$ through $R_G$; the input drives the source through $R_S$. With $\lambda = 0$, find $v_{out}/v_{in}$.`,
      fig: hw41('b'),
      parts: [ex('gm*RD/(1+gm*RS)', ['gm', 'RD', 'RS'], 'v_{out}/v_{in}', { ranges: DV })],
      hints: [
        md`The gate is at incremental ground ($V_B$ is DC, $R_G$ carries no current), so $v_{gs} = -v_s$.`,
        md`Looking into the source you see $1/g_m$. That and $R_S$ form a divider from $v_{in}$.`,
      ],
      sol: md`
**What to see first:** **common gate**. The gate is an incremental ground, the input enters at the source, the output is at the drain.

**Steps.** Looking into the source: $1/g_m$. Divider: $v_s = v_{in}\dfrac{1/g_m}{R_S + 1/g_m} = \dfrac{v_{in}}{1+g_mR_S}$. Then $v_{gs} = -v_s$, so the drain current (down) is $-g_mv_s$: when $v_{in}$ rises, the transistor conducts **less** and the drain rises.
$$\frac{v_{out}}{v_{in}} = +\frac{g_mR_D}{1+g_mR_S}$$

**Sign check:** same magnitude as #1(a), opposite sign. CG is non-inverting.

**In the course convention** $G_M = -\dfrac{g_m}{1+g_mR_S}$ (the current pulled down *decreases*), and $A_V = -G_MR_{out}$ comes out positive. With $r_{ds}$ the posted solution's form is $\dfrac{g_mR_D + R_D/r_{ds}}{1 + g_mR_S + (R_D+R_S)/r_{ds}}$.

**Pattern:** CG = "current in at the source, same current out at the drain". The input current is $\dfrac{v_{in}}{R_S + 1/g_m}$.`,
    }),
    P({
      id: 'e2hw4-1c', src: 'Problem Set 4 · #1(c)', title: 'Source follower with a drain resistor',
      q: md`Output at the source. With $\lambda = 0$, find $v_{out}/v_{in}$. Does $R_D$ matter?`,
      fig: hw41('c'),
      parts: [ex('gm*RS/(1+gm*RS)', ['gm', 'RS'], 'v_{out}/v_{in}', { ranges: DV })],
      hints: [
        md`Same KVL as (a): $v_{gs} = \dfrac{v_{in}}{1+g_mR_S}$. Now the output is the source voltage $i_dR_S$.`,
        md`With $\lambda = 0$ the drain current does not depend on the drain voltage, so $R_D$ cannot appear.`,
      ],
      sol: md`
**What to see first:** **common drain** (source follower). The output is taken at the source; $R_D$ only sets the DC drain voltage.

**Steps.** $v_{out} = i_dR_S = \dfrac{g_mR_S}{1+g_mR_S}v_{in}$. Equivalently, the source looks like $1/g_m$ in series with an ideal copy of $v_{in}$, and $R_S$ divides it:
$$\frac{v_{out}}{v_{in}} = \frac{R_S}{R_S + 1/g_m} = \frac{g_mR_S}{1+g_mR_S}$$

**$R_D$:** irrelevant when $\lambda = 0$. With $r_{ds}$ it enters only through the drain voltage: $\dfrac{g_mR_S}{1 + g_mR_S + (R_D + R_S)/r_{ds}}$.

**Sanity check:** gain below 1, approaching 1 when $g_mR_S \gg 1$. Non-inverting.

**Pattern:** follower $=$ "$v_{in}$ behind $1/g_m$". Every follower gain is a divider between $1/g_m$ and whatever loads the source.`,
    }),
  ];

  const hw42fig = [
    ['rail', [2, -2]], ['pmos', [2, -1], { n: 'M_2', sz: '8X' }], ['nmos', [2, 1], { n: 'M_1', sz: '4X' }], ['gnd', [2, 2]],
    ['w', [1, -1], [0.7, -1], [0.7, 1], [1, 1]], ['w', [0.7, 0], [0, 0], [0, 0.4]], ['Vac', [0, 0.4], [0, 1.4], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.4], [0, 2.4], { n: 'V_B', side: 'l' }], ['gnd', [0, 2.4]],
    ['rail', [4.4, -2]], ['pmos', [4.4, -1], { n: 'M_4', sz: '2X', dc: true }], ['nmos', [4.4, 1], { n: 'M_3', sz: '1X', dc: true }], ['gnd', [4.4, 2]],
    ['w', [2, 0], [3.4, 0]], ['w', [4.4, 0], [5.2, 0]], out([5.2, 0], 'V_{OUT}+v_{out}'),
  ];
  const hw43fig = [
    ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', flip: true, dc: true }], ['iarr', [0.5, -1.5], 'd', { n: '0.5\\,\\text{mA}', side: 'l' }],
    ['rail', [3, -2]], ['pmos', [3, -1], { n: 'M_3' }], ['iarr', [3.3, -1.5], 'd', { n: '1\\,\\text{mA}', side: 'r' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['w', [0, 1], [0, 1.4]], ['V', [0, 1.4], [0, 2.4], { n: 'V_B', side: 'l' }], ['gnd', [0, 2.4]],
    ['Vac', [1, 2], [1, 3], { n: 'v_{in}', side: 'r' }], ['gnd', [1, 3]],
    ['w', [3, 0], [3.8, 0]], out([3.8, 0], 'V_{OUT}+v_{out}'), ['R', [3, 0], [3, 1.2], { n: 'R' }], ['nmos', [3, 2.2], { n: 'M_4', dc: true }], ['gnd', [3, 3.2]],
  ];
  const hw44fig = [
    ['rail', [2, -2]], ['pmos', [2, -1], { n: 'M_3', sz: '1X', flip: true }], ['w', [3, -1], [3.8, -1], [3.8, -0.6]], ['V', [3.8, -0.6], [3.8, 0.4], { n: 'V_{B3}', side: 'r' }], ['gnd', [3.8, 0.4]],
    ['w', [1.2, 0], [3, 0]], ['node', [2, 0], { n: 'X', side: 'a' }],
    ['nmos', [1.2, 1], { n: 'M_1', sz: '1X' }], ['gnd', [1.2, 2]], ['w', [0.2, 1], [0.2, 1.3]], ['Vac', [0.2, 1.3], [0.2, 2.3], { n: 'v_{in}', side: 'l' }], ['V', [0.2, 2.3], [0.2, 3.3], { n: 'V_{B1}', side: 'l' }], ['gnd', [0.2, 3.3]],
    ['pmos', [3, 1], { n: 'M_2', sz: '2X' }], ['w', [2, 1], [2, 1.5]], ['V', [2, 1.5], [2, 2.5], { n: 'V_{B2}', side: 'r' }], ['gnd', [2, 2.5]],
    ['w', [3, 2], [3.8, 2]], out([3.8, 2], 'V_{OUT}+v_{out}'), ['R', [3, 2], [3, 3.2], { n: 'R_D' }], ['gnd', [3, 3.2]],
  ];

  HW4.push(
    P({
      id: 'e2hw4-2', src: 'Problem Set 4 · #2', title: 'Push-pull stage with diode loads', big: true,
      q: md`$1X = 100/1$, $V_B = 1.2\,\text{V}$, $V_{DD} = 2.4\,\text{V}$, $\lambda = 0$. Find $V_{OUT}$, the incremental gain as a number, and the gain symbolically.`,
      fig: hw42fig,
      parts: [
        { lbl: 'V_{OUT}', unit: 'V', ans: 1.2 },
        { lbl: 'A_V', unit: '', ans: -4 },
        ex('-(gm1+gm2)/(gm3+gm4)', ['gm1', 'gm2', 'gm3', 'gm4'], 'A_V\\ \\text{(symbolic)}'),
      ],
      hints: [
        md`$M_1$ and $M_2$ have fixed gates ($V_B$ and $V_{DD} - V_B$ give each $V_{ov} = 0.2$). Compute both currents. What does KCL at the output then say about $M_3$ and $M_4$?`,
        md`$M_3$ ($1X$ NMOS) and $M_4$ ($2X$ PMOS) have the same $\tfrac12\mu C_{ox}\tfrac{W}{L}$, so equal currents mean equal overdrives.`,
        md`Small signal: $v_{in}$ drives **both** gates, so $G_M = g_{m1} + g_{m2}$. The load is two diodes in parallel: $\tfrac{1}{g_{m3}}\parallel\tfrac{1}{g_{m4}}$.`,
      ],
      sol: md`
**DC.** $I_{M1} = \tfrac12(100\mu)(400)(0.2)^2 = 0.8\,\text{mA}$ and $I_{M2} = \tfrac12(50\mu)(800)(2.4-1.2-1)^2 = 0.8\,\text{mA}$. KCL at the output: $I_{M2} + I_{M4} = I_{M1} + I_{M3}$, so $I_{M3} = I_{M4}$.

$M_3$: $\tfrac12(100\mu)(100) = 5\,\text{mA/V}^2$; $M_4$: $\tfrac12(50\mu)(200) = 5\,\text{mA/V}^2$. Same constant, same current, so $V_{ov3} = V_{ov4}$: $V_{OUT} - 1 = (2.4 - V_{OUT}) - 1 \Rightarrow$ **$V_{OUT} = 1.2\,\text{V}$** (mid-rail). Then $I_{M3} = 5\text{m}(0.2)^2 = 0.2\,\text{mA}$.

**Small signal.** What to see first: two transconductors driven by the same input (a CMOS inverter) pushing into two diode loads.
$$A_V = -(g_{m1} + g_{m2})\left(\frac{1}{g_{m3}}\parallel\frac{1}{g_{m4}}\parallel r_{ds1}\parallel r_{ds2}\right) \xrightarrow{\lambda = 0} -\frac{g_{m1}+g_{m2}}{g_{m3}+g_{m4}}$$

**Numbers** ($g_m = 2I_D/V_{ov}$): $g_{m1} = g_{m2} = 2(0.8\text{m})/0.2 = 8\,\text{mA/V}$, $g_{m3} = g_{m4} = 2(0.2\text{m})/0.2 = 2\,\text{mA/V}$, so **$A_V = -16/4 = -4$**.

**Pattern:** a diode load turns current back into voltage at $1/g_m$, so a stage with diode loads has a gain that is a **ratio of transconductances**, set by sizes and currents, not by resistor values.`,
    }),
    P({
      id: 'e2hw4-3a', src: 'Problem Set 4 · #3(a)', title: 'Sizing from overdrive and current',
      q: md`Every transistor has $V_{ov} = 0.2\,\text{V}$ and $V_{DD} = 5\,\text{V}$; $M_2$ carries $0.5\,\text{mA}$ and $M_3$ carries $1\,\text{mA}$. Find $V_B$ and every $W/L$.`,
      fig: hw43fig,
      parts: [
        { lbl: 'V_B', unit: 'V', ans: 1.2 },
        { lbl: '(W/L)_1', unit: '', ans: 250 }, { lbl: '(W/L)_2', unit: '', ans: 500 },
        { lbl: '(W/L)_3', unit: '', ans: 1000 }, { lbl: '(W/L)_4', unit: '', ans: 500 },
      ],
      hints: [
        md`$M_1$'s source sits at DC ground (the $v_{in}$ source has no DC value), so $V_{GS1} = V_B$.`,
        md`$I = \tfrac12\mu C_{ox}\tfrac{W}{L}V_{ov}^2$ with $V_{ov}^2 = 0.04$: NMOS $I = 2\,\mu\text{A}\cdot\tfrac{W}{L}$, PMOS $I = 1\,\mu\text{A}\cdot\tfrac{W}{L}$.`,
      ],
      sol: md`
With $V_{ov} = 0.2$: NMOS carries $\tfrac12(100\mu)(0.04) = 2\,\mu\text{A}$ per unit $W/L$, PMOS carries $1\,\mu\text{A}$ per unit.

- $V_B = V_T + V_{ov} = $ **$1.2\,\text{V}$** (source at DC ground).
- $M_1$ (NMOS, 0.5 mA): $W/L = 250$. $M_2$ (PMOS, 0.5 mA): $W/L = 500$.
- $M_3$ mirrors $M_2$ with twice the current: $W/L = 1000$. $M_4$ (NMOS, 1 mA): $W/L = 500$.

**Pattern:** at equal $V_{ov}$ and current, a PMOS needs twice the $W/L$ of an NMOS; a mirror's current ratio is its size ratio.`,
    }),
    P({
      id: 'e2hw4-3c', src: 'Problem Set 4 · #3(c)', title: 'Common gate into a mirror',
      q: md`Same circuit, $\lambda = 0$. Find $A_V = v_{out}/v_{in}$ symbolically, then as a function of $R$ using the bias above ($R$ in ohms).`,
      fig: hw43fig,
      parts: [
        ex('-(gm1*gm3/gm2)*(R+1/gm4)', ['gm1', 'gm2', 'gm3', 'gm4', 'R'], 'A_V'),
        ex('-0.01*(R+100)', ['R'], 'A_V\\ (R\\text{ in }\\Omega)', { ranges: { R: [200, 5000] } }),
      ],
      hints: [
        md`$v_{in}$ is at $M_1$'s **source** and its gate is fixed: common gate. Its drain current changes by $-g_{m1}v_{in}$.`,
        md`That current flows through the diode $M_2$ ($1/g_{m2}$) and is copied by $M_3$ with gain $g_{m3}/g_{m2}$.`,
        md`$M_3$'s output current flows into $R$ in series with the diode $M_4$: $R + 1/g_{m4}$.`,
      ],
      sol: md`
**What to see first:** a **common-gate** input ($M_1$), a **mirror** ($M_2 \to M_3$), and a load of $R$ in series with a **diode** ($M_4$).

**Chain.** $v_{in}\uparrow$ lowers $v_{gs1}$: $i_{d1} = -g_{m1}v_{in}$. That current runs through the diode $M_2$, so its gate moves by $v_x = +\dfrac{g_{m1}}{g_{m2}}v_{in}$ (less current through a PMOS diode lets its gate rise). $M_3$ sees $v_{sg3} = -v_x$ and delivers $-g_{m3}v_x$ into the load:
$$A_V = -\frac{g_{m1}g_{m3}}{g_{m2}}\left(R + \frac{1}{g_{m4}}\right)$$

**Numbers:** $g_{m1} = g_{m2} = 2(0.5\text{m})/0.2 = 5\,\text{mA/V}$, $g_{m3} = g_{m4} = 10\,\text{mA/V}$, so $A_V = -0.01\,(R + 100\,\Omega)$; for $R = 1\,\text{k}\Omega$, $A_V = -11$.

**Sign check:** CG is non-inverting, the PMOS mirror inverts once: overall inverting.

**Pattern:** a current passed through a diode and copied by a mirror is scaled by $g_{m,\text{out}}/g_{m,\text{diode}}$ (= the size ratio).`,
    }),
    P({
      id: 'e2hw4-4', src: 'Problem Set 4 · #4', title: 'Folded cascode: bias and gain', big: true,
      q: md`$1X = 200/1$, $V_{B1} = 1.2\,\text{V}$, $V_{B3} = 3.6\,\text{V}$, $V_{DD} = 5\,\text{V}$, $\lambda = 0$. (a) $V_{B2}$ so that $M_3$ is at the edge of saturation. (b) The largest $R_D$ with $M_2$ and $M_3$ both at the edge. (d) $A_V$ symbolically, and its value at that $R_D$.`,
      fig: hw44fig,
      parts: [
        { lbl: 'V_{B2}', unit: 'V', ans: 3.4 },
        { lbl: 'R_{D,max}', unit: 'kΩ', ans: 11 },
        ex('-gm1*RD', ['gm1', 'RD'], 'A_V'),
        { lbl: 'A_V\\ (R_D = 11\\,\\text{k}\\Omega)', unit: '', ans: -44 },
      ],
      hints: [
        md`$M_3$: $V_{SG} = 1.4$, $V_{ov3} = 0.4$, $I_3 = 800\,\mu\text{A}$. Edge of saturation puts its drain at $5 - 0.4 = 4.6\,\text{V}$.`,
        md`$M_1$ takes $400\,\mu\text{A}$ of that, so $M_2$ carries the other $400\,\mu\text{A}$: find $V_{ov2}$ for a $2X$ PMOS.`,
        md`Small signal: every extra $g_{m1}v_{in}$ that $M_1$ pulls from $X$ is current that no longer flows through $M_2$ into $R_D$.`,
      ],
      sol: md`
**(a)** $M_3$ ($1X$ PMOS): $V_{ov3} = 5 - 3.6 - 1 = 0.4$, $I_3 = \tfrac12(50\mu)(200)(0.16) = 800\,\mu\text{A}$. Edge: $V_X = 5 - 0.4 = 4.6\,\text{V}$. $M_1$: $I_1 = \tfrac12(100\mu)(200)(0.04) = 400\,\mu\text{A}$, so $I_2 = 400\,\mu\text{A}$ and $V_{ov2} = \sqrt{\dfrac{400\mu}{\tfrac12(50\mu)(400)}} = 0.2$. Then $V_{SG2} = 1.2$: **$V_{B2} = 4.6 - 1.2 = 3.4\,\text{V}$**.

**(b)** $M_2$ saturated needs $V_{OUT} \le V_{G2} + |V_T| = 4.4\,\text{V}$; the current through $R_D$ is fixed at $400\,\mu\text{A}$, so **$R_{D,max} = 4.4/0.4\text{m} = 11\,\text{k}\Omega$**.

**(d) What to see first:** $M_1$ is a CS transconductor, $M_3$ a current source, $M_2$ a **common-gate** device that passes current from $X$ to the output: a **folded cascode**. With $\lambda = 0$ node $X$ has nothing but $M_2$'s source to send current into, so all of $g_{m1}v_{in}$ is taken out of $M_2$'s current:
$$A_V = -g_{m1}R_D = -(4\,\text{mA/V})(11\,\text{k}\Omega) = -44$$

**With $r_{ds}$** (the general result): $R_X = r_{ds1}\parallel r_{ds3}$, $G_M = g_{m1}\dfrac{R_X}{R_X + 1/g_{m2}}$, $R_{out} = R_D\parallel r_{ds2}(1 + g_{m2}R_X)$, $A_V = -G_MR_{out}$. The posted solution's long expression reduces to this.

**Pattern:** folded cascode: $G_M \approx g_{m1}$ (the CG device passes the current), $R_{out}$ = load $\parallel$ (CG drain looking down).`,
    }),
  );

  // ================================================================ Problem Set 5
  const RB = { R: [5e4, 2e5] };
  const hw5fig = {
    a: [['nmos', [1, 1]], ['acg', [0, 1]], ['I', [1, 2], [1, 3.2]], ['gnd', [1, 3.2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4])],
    b: [['rail', [1, -1.4]], ['I', [1, -1.4], [1, 0]], ['nmos', [1, 1]], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4])],
    c: [['nmos', [1, 1]], ['acg', [0, 1]], ['I', [1, 2], [1, 3.2]], ['gnd', [1, 3.2]], ['R', [1, 2], [2.4, 2], { n: 'R' }], ['V', [2.4, 2], [2.4, 3.2]], ['gnd', [2.4, 3.2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4])],
    d: [['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R' }], ['pmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]], ['nmos', [1, 2], { n: 'M_1' }], ['acg', [0, 2]], ['w', [1, 3], [1, 3.4]], lookUp([1, 3.4])],
  };
  const eBase = (x4) => {
    const f = [['rail', [1, -2.2]], ['pmos', [1, -1.2], { n: 'M_3' }], ['acg', [0, -1.2]], ['R', [1, -0.2], [1, 1], { n: 'R_1' }],
      ['nmos', [1, 2], { n: 'M_1' }], ['acg', [0, 2]], ['nmos', [1, 4], { n: 'M_2', dc: true, flip: !!x4 }], ['gnd', [1, 5]]];
    if (!x4) f.push(['w', [1, 1], [1.9, 1]], lookL([1.9, 1]));
    else {
      f.push(['w', [1, 1], [3, 1], [3.8, 1]], lookL([3.8, 1]), ['w', [3, 1], [3, 3]], ['nmos', [3, 4], { n: 'M_4' }]);
      if (x4 === 'r') f.push(['R', [3, 5], [3, 6.2], { n: 'R_2' }], ['gnd', [3, 6.2]]);
      else f.push(['gnd', [3, 5]]);
    }
    return f;
  };
  hw5fig.e = eBase(); hw5fig.f = eBase('g'); hw5fig.g = eBase('r');
  hw5fig.h = [['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_2' }], ['pmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]], ['w', [1, 1], [1.9, 1]], lookL([1.9, 1]),
    ['nmos', [1, 2], { n: 'M_1', dc: true }], ['R', [1, 3], [1, 4.2], { n: 'R_1' }], ['gnd', [1, 4.2]]];
  hw5fig.i = [['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_2' }], ['pmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]], ['w', [1, 1], [1.9, 1]], lookL([1.9, 1]),
    ['w', [1, -1], [-0.6, -1], [-0.6, 2], [0, 2]], ['nmos', [1, 2], { n: 'M_1' }], ['R', [1, 3], [1, 4.2], { n: 'R_1' }], ['gnd', [1, 4.2]]];

  // exact building blocks, as expression strings
  const RD2 = '(1/(gm2+1/rds2))';                                   // diode M2
  const RDN1 = `(rds1 + ${RD2}*(1+gm1*rds1))`;                      // M1 drain, source on the diode
  const K5 = `(${RD2}/${RDN1})`;
  const RUPh = '(rds2 + R2 + gm2*rds2*R2)';

  const HW5 = [
    R(md`
      **Course parameters:** $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TH}| = 1\,\text{V}$. Every device is saturated with $r_{ds}$ finite and $g_mr_{ds} \gg 1$.

      **What this set drills:** finding $R_{EQ}$ by inspection. Apply a test source, kill independent sources (a DC current source becomes an **open**, a DC voltage source a **short**), then build the answer from the canonical results:
      - looking into a **drain** with $R_S$ at the source: $r_{ds} + R_S + g_mr_{ds}R_S$;
      - looking into a **source** with $R_D$ at the drain: $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$;
      - a **diode**: $\dfrac{1}{g_m}\parallel r_{ds}$;
      - several branches from one node: $R_{EQ} = R_{UP}\parallel R_{DN}$;
      - a **gate that moves** with the test voltage, $v_g = Kv_t$ ("the K rule"): $R_{DN} = \dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$.

      Answers accept the exact form or a correct $g_mr_{ds} \gg 1$ approximation. Two posted approximations (in (e)–(g) and (i)) drop a term that is just as big as the one they keep; the solutions below show where.
    `),
    P({
      id: 'e2hw5-a', src: 'Problem Set 5 · #1(a)', title: 'Drain over an ideal current source',
      q: md`Gate at incremental ground, source on an ideal DC current source. What is $R_{EQ}$ looking into the drain?`,
      fig: hw5fig.a,
      parts: [{ mc: ['$\\infty$', '$r_{ds}$', '$1/g_m$', '$r_{ds}(1 + g_mr_{ds})$'], a: 0, why: [null, 'That is the answer with the source grounded. Here the source is not grounded.', '$1/g_m$ is what you see looking into a source, not a drain.', 'Degeneration multiplies, but here the degeneration is infinite.'] }],
      hints: [md`For small signals an ideal DC current source is an open circuit. Where can the test current go?`],
      sol: md`
The current source is an **open** for small signals, so the source node connects to nothing: no test current can flow anywhere. **$R_{EQ} = \infty$.**

Same thing from the formula: $r_{ds} + R_S + g_mr_{ds}R_S$ with $R_S \to \infty$.

**Physical picture:** the DC source forces a fixed current through the transistor. A small change of drain voltage cannot change a fixed current, which is exactly what an infinite incremental resistance means.`,
    }),
    P({
      id: 'e2hw5-b', src: 'Problem Set 5 · #1(b)', title: 'Source under an ideal current source',
      q: md`An ideal current source feeds the drain; the gate is at incremental ground. What is $R_{EQ}$ looking up into the source?`,
      fig: hw5fig.b,
      parts: [{ mc: ['$\\infty$', '$1/g_m$', '$\\dfrac{1}{g_m}\\parallel r_{ds}$', '$r_{ds}$'], a: 0, why: [null, '$1/g_m$ needs the drain at incremental ground. Here the drain sees an infinite resistance.', 'True with the drain at incremental ground, not here.', 'No: the drain sees an open, so nothing can flow.'] }],
      hints: [md`Looking into a source: $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$. What is $R_D$ here?`],
      sol: md`
Looking into a source with load $R_D$ at the drain: $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$. The drain load is an ideal current source, $R_D = \infty$, so **$R_{EQ} = \infty$**.

**Why it matters:** "$1/g_m$ looking into a source" is only true when the drain can absorb current. A common-gate stage loaded by an ideal current source has an **infinite** input resistance (Lecture 17's warning).`,
    }),
    P({
      id: 'e2hw5-c', src: 'Problem Set 5 · #1(c)', title: 'Drain with source degeneration',
      q: md`The source has a DC current source to ground and $R$ to a DC voltage. Find $R_{EQ}$ looking into the drain.`,
      fig: hw5fig.c,
      parts: [ex('rds + R + gm*rds*R', ['gm', 'rds', 'R'], 'R_{EQ}', { ranges: RB })],
      hints: [md`Kill the sources: the current source opens, the voltage source shorts. The source node sees just $R$ to ground.`, md`Test current $i_t$ flows through $R$: $v_s = i_tR$, $v_{gs} = -i_tR$. KCL at the drain.`],
      sol: md`
**What to see first:** the current source opens, the voltage source shorts, so this is a **drain with source degeneration $R$**.

**Derivation** (do it once, then memorize): $v_s = i_tR$, and $i_t = g_m(0 - v_s) + \dfrac{v_t - v_s}{r_{ds}}$, so
$$R_{EQ} = r_{ds} + R + g_mr_{ds}R \approx r_{ds}(1 + g_mR)$$

**Intuition:** if $v_t$ rises, $i_t$ rises a little, so $v_s$ rises, which cuts $v_{gs}$ and fights the increase. Negative feedback through $R$ makes the drain look $(1 + g_mR)$ times stiffer: **$R$ seen from the drain is multiplied by $g_mr_{ds}$**.

**Careful with "$\approx g_mr_{ds}R$":** that drops the $r_{ds}$ term, which is only fine when $g_mR \gg 1$. $r_{ds}(1 + g_mR)$ is always safe.`,
    }),
    P({
      id: 'e2hw5-d', src: 'Problem Set 5 · #1(d)', title: 'Looking up into a source loaded by a degenerated PMOS',
      q: md`$M_2$ is a PMOS with $R$ at its source and its gate at incremental ground. Find $R_X$ (looking up into $M_2$'s drain from $M_1$'s drain) and $R_{EQ}$ (looking up into $M_1$'s source).`,
      fig: hw5fig.d,
      parts: [
        ex('rds2 + R + gm2*rds2*R', ['gm2', 'rds2', 'R'], 'R_X', { ranges: RB }),
        ex('(rds1 + rds2 + R + gm2*rds2*R)/(1+gm1*rds1)', ['gm1', 'rds1', 'gm2', 'rds2', 'R'], 'R_{EQ}', { ranges: RB, rtol: 0.06 }),
      ],
      hints: [md`$M_2$ is a degenerated drain (any device type, same formula). That is the load on $M_1$'s drain.`, md`Looking into $M_1$'s source with load $R_X$ at its drain: $\dfrac{r_{ds1} + R_X}{1 + g_{m1}r_{ds1}}$.`],
      sol: md`
**What to see first:** two blocks. $M_2$ (PMOS, gate fixed, $R$ at its source) is a **degenerated drain**: $R_X = r_{ds2} + R + g_{m2}r_{ds2}R$. $M_1$ (gate fixed) is a **source with a drain load**:
$$R_{EQ} = \frac{r_{ds1} + R_X}{1 + g_{m1}r_{ds1}} \approx \frac{g_{m2}r_{ds2}R}{g_{m1}r_{ds1}}$$

**Intuition: the CG device as an impedance scaler.** Looking down from a drain, a source resistance is multiplied by about $g_mr_{ds}$. Looking up from a source, a drain resistance is **divided** by $g_mr_{ds}$. Here $R$ is first multiplied by $g_{m2}r_{ds2}$, then divided by $g_{m1}r_{ds1}$.

**Sanity check:** if $R_X$ were small (say a short to ground) you would get $\dfrac{1}{g_{m1}}\parallel r_{ds1}$, the usual source impedance. Here $R_X$ is huge, so the source impedance is much bigger than $1/g_{m1}$.`,
    }),
    P({
      id: 'e2hw5-e', src: 'Problem Set 5 · #1(e)', title: 'Up and down from one node',
      q: md`$M_3$ (PMOS, gate fixed) with $R_1$ above the node; $M_1$ (gate fixed) below it with a diode $M_2$ at its source. Find $R_{UP}$, $R_{DN}$ and $R_{EQ}$.`,
      fig: hw5fig.e,
      parts: [
        ex('R1 + rds3', ['R1', 'rds3'], 'R_{UP}'),
        ex(RDN1, ['gm1', 'rds1', 'gm2', 'rds2'], 'R_{DN}'),
        ex(`par(R1 + rds3, ${RDN1})`, ['R1', 'rds3', 'gm1', 'rds1', 'gm2', 'rds2'], 'R_{EQ}'),
      ],
      hints: [
        md`Up: $R_1$ in series with a drain whose source is at VDD (incremental ground): $r_{ds3}$.`,
        md`Down: a drain with source degeneration, where the "resistor" is the diode $M_2$: $R_S = \dfrac{1}{g_{m2}}\parallel r_{ds2}$.`,
      ],
      sol: md`
**What to see first:** the test node has one branch up and one branch down: $R_{EQ} = R_{UP}\parallel R_{DN}$.

- **Up:** $R_{UP} = R_1 + r_{ds3}$ (looking into a drain with its gate and source at incremental ground).
- **Down:** a drain degenerated by a diode, $R_S = \dfrac{1}{g_{m2}}\parallel r_{ds2} \approx \dfrac{1}{g_{m2}}$:
$$R_{DN} = r_{ds1} + R_S(1 + g_{m1}r_{ds1}) \approx r_{ds1}\left(1 + \frac{g_{m1}}{g_{m2}}\right)$$

**A correction to the posted solution:** it writes $R_{DN} = \dfrac{g_{m1}r_{ds1}}{g_{m2}} + r_{ds1} + \dfrac{1}{g_{m2}}$ (fine) and then $\approx \dfrac{g_{m1}r_{ds1}}{g_{m2}}$. That last step drops $r_{ds1}$, which is the **same size** as the term kept when $g_{m1} \approx g_{m2}$: for matched devices $R_{DN} \approx 2r_{ds}$, not $r_{ds}$. The shortcut "$g_mr_{ds}R_S$" needs $g_mR_S \gg 1$, and a diode gives $g_{m1}R_S = g_{m1}/g_{m2} \approx 1$.

**Pattern:** a diode as degeneration roughly **doubles** $r_{ds}$ (matched devices). It does not multiply it by $g_mr_{ds}$.`,
    }),
    P({
      id: 'e2hw5-f', src: 'Problem Set 5 · #1(f)', title: 'A gate that moves with the test voltage',
      q: md`Same as (e), plus $M_4$: its gate is tied to the diode $M_2$, its drain to the test node, its source grounded. Find $K = v_{g4}/v_t$, the resistance $R_{DN2}$ down through $M_4$, and $R_{EQ}$.`,
      fig: hw5fig.f,
      parts: [
        ex(K5, ['gm1', 'rds1', 'gm2', 'rds2'], 'K'),
        ex(`1/(1/rds4 + gm4*${K5})`, ['gm1', 'rds1', 'gm2', 'rds2', 'gm4', 'rds4'], 'R_{DN2}'),
        ex(`par(R1 + rds3, ${RDN1}, 1/(1/rds4 + gm4*${K5}))`, ['R1', 'rds3', 'gm1', 'rds1', 'gm2', 'rds2', 'gm4', 'rds4'], 'R_{EQ}'),
      ],
      hints: [
        md`The current $v_t/R_{DN1}$ flowing down through $M_1$ ends up in the diode $M_2$, so $v_{g4} = \dfrac{v_t}{R_{DN1}}\cdot\dfrac{1}{g_{m2}}$.`,
        md`$M_4$: $i = g_{m4}v_{g4} + \dfrac{v_t}{r_{ds4}} = v_t\left(g_{m4}K + \dfrac{1}{r_{ds4}}\right)$.`,
      ],
      sol: md`
**What to see first:** $R_{UP}$ and $R_{DN1}$ are unchanged from (e) ($M_4$'s gate draws no current). The new branch is $M_4$, whose **gate moves** when the test voltage moves.

**$K$:** the test current down the $M_1$ branch is $v_t/R_{DN1}$; all of it goes through the diode, so
$$K = \frac{v_{g4}}{v_t} = \frac{1/(g_{m2} + 1/r_{ds2})}{R_{DN1}} \approx \frac{1}{(g_{m1}+g_{m2})\,r_{ds1}}$$

**$M_4$** (source grounded): $i_{t3} = g_{m4}Kv_t + v_t/r_{ds4}$, so
$$R_{DN2} = r_{ds4}\parallel\frac{1}{g_{m4}K} \approx r_{ds4}\parallel\frac{(g_{m1}+g_{m2})\,r_{ds1}}{g_{m4}}$$
and $R_{EQ} = R_{UP}\parallel R_{DN1}\parallel R_{DN2}$. For matched devices $R_{DN2} \approx r_{ds}\parallel 2r_{ds} = \tfrac23r_{ds}$.

**The K rule** (keep it): a transistor whose gate moves as $Kv_t$ looks like $r_{ds}\parallel\dfrac{1}{Kg_m}$ from its drain (source grounded). $K = 1$ is the diode; $K = 0$ is a plain current source.`,
    }),
    P({
      id: 'e2hw5-g', src: 'Problem Set 5 · #1(g)', title: 'Moving gate with degeneration',
      q: md`As (f), but $M_4$ has $R_2$ at its source. Find $R_{DN2}$ and $R_{EQ}$.`,
      fig: hw5fig.g,
      parts: [
        ex(`(rds4 + R2 + gm4*rds4*R2)/(1 + gm4*rds4*${K5})`, ['gm1', 'rds1', 'gm2', 'rds2', 'gm4', 'rds4', 'R2'], 'R_{DN2}', { ranges: { R2: [5e4, 2e5] } }),
        ex(`par(R1 + rds3, ${RDN1}, (rds4 + R2 + gm4*rds4*R2)/(1 + gm4*rds4*${K5}))`, ['R1', 'rds3', 'gm1', 'rds1', 'gm2', 'rds2', 'gm4', 'rds4', 'R2'], 'R_{EQ}', { ranges: { R2: [5e4, 2e5] } }),
      ],
      hints: [md`General K rule: $R_{DN} = \dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$ with the same $K$ as in (f).`, md`How big is $g_{m4}r_{ds4}K$? Use $K \approx \dfrac{1}{(g_{m1} + g_{m2})r_{ds1}}$.`],
      sol: md`
**K rule with degeneration** ($v_{s4} = i_{t3}R_2$, $v_{g4} = Kv_t$):
$$R_{DN2} = \frac{r_{ds4} + R_2 + g_{m4}r_{ds4}R_2}{1 + g_{m4}r_{ds4}K}$$
and $R_{EQ} = R_{UP}\parallel R_{DN1}\parallel R_{DN2}$.

**How big is the denominator?** $g_{m4}r_{ds4}K \approx \dfrac{g_{m4}r_{ds4}}{(g_{m1}+g_{m2})r_{ds1}}$, which is **of order 1** (it is $\tfrac12$ for matched devices), not $\gg 1$. So
$$R_{DN2} \approx \frac{g_{m4}r_{ds4}R_2}{1 + \tfrac12} = \tfrac23\,g_mr_{ds}R_2\quad(\text{matched})$$

**A correction to the posted solution:** it drops the 1 in the denominator ($R_{DN2} \approx g_{m2}R_2R_{DN1}$). That assumes $g_{m4}r_{ds4}K \gg 1$, which is false here, and gives an answer about 3× too big for matched devices (checked against an exact circuit solve). The exact expression is what the answer box expects.

**Pattern:** before dropping the "1 +", estimate the other term. A $K$ of order $1/(g_mr_{ds})$ makes $g_mr_{ds}K \approx 1$.`,
    }),
    P({
      id: 'e2hw5-h', src: 'Problem Set 5 · #1(h)', title: 'Degenerated PMOS over a degenerated diode',
      q: md`$M_2$ (PMOS, gate fixed, $R_2$ at its source) above the node; $M_1$ diode-connected with $R_1$ at its source below it. Find $R_{UP}$, $R_{DN}$ and $R_{EQ}$.`,
      fig: hw5fig.h,
      parts: [
        ex(RUPh, ['gm2', 'rds2', 'R2'], 'R_{UP}', { ranges: { R2: [5e3, 5e4] } }),
        ex('R1 + 1/(gm1 + 1/rds1)', ['gm1', 'rds1', 'R1'], 'R_{DN}', { ranges: { R1: [500, 5000] } }),
        ex(`par(${RUPh}, R1 + 1/(gm1 + 1/rds1))`, ['gm2', 'rds2', 'R2', 'gm1', 'rds1', 'R1'], 'R_{EQ}', { ranges: { R2: [5e3, 5e4], R1: [500, 5000] } }),
      ],
      hints: [md`Up: a degenerated drain. Down: the K rule with $K = 1$ (the gate *is* the test node).`, md`$\dfrac{r_{ds} + R_1 + g_mr_{ds}R_1}{1 + g_mr_{ds}} = R_1 + \dfrac{r_{ds}}{1 + g_mr_{ds}}$. Simplify before approximating.`],
      sol: md`
**Up:** a degenerated drain, $R_{UP} = r_{ds2} + R_2 + g_{m2}r_{ds2}R_2$.

**Down:** a diode with $R_1$ under it. The K rule with $K = 1$ gives
$$R_{DN} = \frac{r_{ds1} + R_1 + g_{m1}r_{ds1}R_1}{1 + g_{m1}r_{ds1}} = R_1 + \frac{1}{g_{m1} + 1/r_{ds1}} \approx R_1 + \frac{1}{g_{m1}}$$
Intuition: the diode is $1/g_{m1}$ and $R_1$ simply adds in series (the same current flows through both).

$R_{EQ} = R_{UP}\parallel R_{DN} \approx R_1 + 1/g_{m1}$, since $R_{UP}$ is enormous.

**A correction to the posted solution:** it simplifies $R_{DN}$ to $\approx R_1$. That drops the diode's $1/g_{m1}$, which is only negligible when $g_{m1}R_1 \gg 1$; keep $R_1 + 1/g_{m1}$.`,
    }),
    P({
      id: 'e2hw5-i', src: 'Problem Set 5 · #1(i)', title: 'Gate driven from the PMOS source',
      q: md`As (h), but $M_1$ is not a diode: its gate is tied to $M_2$'s source (the node between $R_2$ and $M_2$). Find $K = v_{g1}/v_t$, $R_{DN}$ and $R_{EQ}$.`,
      fig: hw5fig.i,
      parts: [
        ex(`R2/${RUPh}`, ['gm2', 'rds2', 'R2'], 'K', { ranges: { R2: [5e3, 5e4] } }),
        ex(`(rds1 + R1 + gm1*rds1*R1)/(1 + gm1*rds1*R2/${RUPh})`, ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'R2'], 'R_{DN}', { ranges: { R2: [5e3, 5e4] } }),
        ex(`par(${RUPh}, (rds1 + R1 + gm1*rds1*R1)/(1 + gm1*rds1*R2/${RUPh}))`, ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'R2'], 'R_{EQ}', { ranges: { R2: [5e3, 5e4] } }),
      ],
      hints: [
        md`The current up through $M_2$ is $v_t/R_{UP}$, and all of it flows through $R_2$. That sets the voltage at $M_2$'s source, which is $M_1$'s gate.`,
        md`Then the K rule for $M_1$. Estimate $g_{m1}r_{ds1}K$ before you drop anything.`,
      ],
      sol: md`
**Up:** $R_{UP} = r_{ds2} + R_2 + g_{m2}r_{ds2}R_2$, unchanged ($M_1$'s gate draws nothing).

**$K$:** the test current up through $M_2$ is $v_t/R_{UP}$ and all of it flows through $R_2$, so $v_{g1} = \dfrac{R_2}{R_{UP}}v_t$: **$K = \dfrac{R_2}{R_{UP}} \approx \dfrac{1}{g_{m2}r_{ds2}}$**. Positive: the gate rises with $v_t$, so $M_1$ conducts more and the branch looks softer.

**K rule:** $R_{DN} = \dfrac{r_{ds1} + R_1 + g_{m1}r_{ds1}R_1}{1 + g_{m1}r_{ds1}K}$. Now $g_{m1}r_{ds1}K \approx \dfrac{g_{m1}r_{ds1}}{g_{m2}r_{ds2}}$ is **about 1**, so for matched devices
$$R_{DN} \approx \frac{g_mr_{ds}R_1}{2},\qquad R_{EQ} = R_{UP}\parallel R_{DN}$$

**A correction to the posted solution:** it approximates $R_{DN} \approx R_1R_{UP}/R_2$, which assumes $g_{m1}r_{ds1}K \gg 1$. Since that product is about 1, the posted form is about 2× too big for matched devices. The exact expression is what the box expects.`,
    }),
  ];

  // ================================================================ Problem Set 6
  const hw6fig = {
    a: [
      ['rail', [1, -2.4]], ['R', [1, -2.4], [1, -1.2], { n: 'R_1' }], ['pmos', [1, -0.2], { n: 'M_1' }],
      ['w', [0, -0.2], [-0.6, -0.2], [-0.6, 0.2]], ...vinSrc(-0.6, 0.2),
      ['node', [1, 0.8], { n: 'v_0', side: 'l' }], ['nmos', [1, 1.8], { n: 'M_2', flip: true, dc: true }],
      ['node', [1, 2.8], { n: 'v_1', side: 'l' }], ['nmos', [1, 3.8], { n: 'M_3', flip: true, dc: true }], ['gnd', [1, 4.8]],
      ['rail', [3, -0.6]], ['I', [3, -0.6], [3, 0.8], { n: 'I_B' }], ['w', [3, 0.8], [3.8, 0.8]], out([3.8, 0.8]),
      ['nmos', [3, 1.8], { n: 'M_5' }], ['nmos', [3, 3.8], { n: 'M_4' }], ['gnd', [3, 4.8]],
    ],
    b: [
      ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_1' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
      ['w', [0, 1], [-0.5, 1], [-0.5, 1.3]], ...vinSrc(-0.5, 1.3),
      ['w', [1, 0], [2.6, 0]], ['pmos', [2.6, 1], { n: 'M_2' }], ['acg', [1.6, 1]], ['nmos', [2.6, 3], { n: 'M_3' }], ['acg', [1.6, 3]], ['gnd', [2.6, 4]],
      ['w', [2.6, 2], [3.6, 2]], ['w', [3.6, 1], [3.6, 3]],
      ['rail', [4.6, -1.2]], ['R', [4.6, -1.2], [4.6, 0], { n: 'R_2' }], ['pmos', [4.6, 1], { n: 'M_4' }], ['nmos', [4.6, 3], { n: 'M_5' }], ['gnd', [4.6, 4]],
      ['w', [4.6, 2], [5.4, 2]], out([5.4, 2]),
    ],
    c: [
      ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_2' }], ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]],
      ['I', [1, 2], [1, 3.2], { n: 'I_B' }], ['gnd', [1, 3.2]], ['R', [-0.4, 2], [1, 2], { n: 'R_1', side: 'b' }], ['w', [-0.4, 2], [-0.4, 2.2]], ...vinSrc(-0.4, 2.2),
      ['w', [1, 0], [2.4, 0]], ['R', [2.4, 0], [2.4, 1.2], { n: 'R_3' }], ['R', [2.4, 1.2], [2.4, 2.4], { n: 'R_4' }], ['gnd', [2.4, 2.4]],
      ['w', [2.4, 1.2], [2.6, 1.2]], ['nmos', [3.6, 1.2], { n: 'M_2' }], ['R', [3.6, 2.2], [3.6, 3.4], { n: 'R_5' }], ['gnd', [3.6, 3.4]],
      ['rail', [3.6, -1.8]], ['pmos', [3.6, -0.8], { n: 'M_3' }], ['acg', [2.6, -0.8]], ['w', [3.6, 0.2], [4.4, 0.2]], out([4.4, 0.2]),
    ],
    d: [
      ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_2' }], ['nmos', [1, 1], { n: 'M_1' }], ['w', [0, 1], [-0.5, 1], [-0.5, 1.3]], ...vinSrc(-0.5, 1.3),
      ['R', [1, 2], [1, 3.2], { n: 'R_1' }], ['gnd', [1, 3.2]],
      ['w', [1, 0], [1.6, 0]], ['rail', [2.6, -1]], ['pmos', [2.6, 0], { n: 'M_2' }], ['w', [2.6, 1], [2.6, 2]], ['w', [1, 2], [2.6, 2], [3.4, 2]], out([3.4, 2]),
    ],
    e: [
      ['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_2' }], ['pmos', [1, 0], { n: 'M_2' }], ['nmos', [1, 2], { n: 'M_1' }],
      ['R', [1, 3], [1, 4.2], { n: 'R_1' }], ['gnd', [1, 4.2]],
      ['w', [0, 0], [-0.4, 0], [-0.4, 2], [0, 2]], ['w', [-0.4, 1], [-1, 1], [-1, 1.4]], ...vinSrc(-1, 1.4),
      ['w', [-0.4, 0], [-0.4, -0.5], [2.2, -0.5], [2.2, 0], { hops: [1] }], ['rail', [3.2, -1]], ['pmos', [3.2, 0], { n: 'M_4' }],
      ['w', [1, 1], [1.8, 1], [1.8, 2], [2.2, 2]], ['nmos', [3.2, 2], { n: 'M_3' }], ['gnd', [3.2, 3]],
      ['w', [3.2, 1], [4, 1]], out([4, 1]),
    ],
    f: [
      ['w', [-0.6, -2], [3, -2]], ['w', [-0.6, -2], [-0.6, -1.8]], ['Vac', [-0.6, -1.8], [-0.6, -0.8], { n: 'v_{in}', side: 'l' }], ['acg', [-0.6, -0.8]],
      ['pmos', [1, -1], { n: 'M_3', flip: true, dc: true }], ['pmos', [3, -1], { n: 'M_4' }],
      ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['nmos', [3, 1], { n: 'M_2', flip: true }], ['acg', [4, 1]],
      ['w', [1, 2], [3, 2]], ['I', [2, 2], [2, 3.2], { n: 'I_B', side: 'r' }], ['gnd', [2, 3.2]],
      ['w', [3, 0], [3.8, 0]], out([3.8, 0]),
    ],
  };

  // HW6 exact gains as expression strings
  const A6a0 = '(-(gm1/(1+(gm1+1/rds1)*R1))*par(rds1+R1+gm1*rds1*R1, 1/(gm2+1/rds2)+1/(gm3+1/rds3)))';
  const A6a1 = `(${A6a0}*(1/(gm3+1/rds3))/(1/(gm2+1/rds2)+1/(gm3+1/rds3)))`;
  const A6a = `(-(gm4*rds4*(1+gm5*rds5)*${A6a1} + gm5*rds5*${A6a0}))`;
  const n6a = ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'gm3', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5'];
  const RA6b = 'par(R1,rds1)';
  const A6b1 = `(-(gm1*${RA6b}/(${RA6b}+1/(gm2+1/rds2)))*par(rds3, rds2 + ${RA6b}*(1+gm2*rds2)))`;
  const A6b2 = '(-(gm5 + gm4/(1+(gm4+1/rds4)*R2))*par(rds5, rds4 + R2 + gm4*rds4*R2))';
  const n6b1 = ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'rds3'], n6b2 = ['gm4', 'rds4', 'R2', 'gm5', 'rds5'];
  const rb6b = { R1: [2e4, 1e5], R2: [2e4, 1e5] };
  const A6c1 = '(((gm1+1/rds1)/(1+(gm1+1/rds1)*R1))*par(rds1+R1+gm1*rds1*R1, R2, R3+R4)*R4/(R3+R4))';
  const A6c2 = '(-(gm2/(1+(gm2+1/rds2)*R5))*par(rds3, rds2+R5+gm2*rds2*R5))';
  const n6c1 = ['gm1', 'rds1', 'R1', 'R2', 'R3', 'R4'], n6c2 = ['gm2', 'rds2', 'R5', 'rds3'];
  const GM6d = '(-gm1*(rds1/(R2+rds1) + gm2*par(R2,rds1)))';
  const RU6d = '((rds1+R2)/(1+gm1*rds1))';
  const RO6d = `par(R1, ${RU6d}, rds2, ${RU6d}/(gm2*R2))`;
  const n6d = ['gm1', 'rds1', 'gm2', 'rds2', 'R1', 'R2'];
  const rb6d = { R1: [1e3, 1e4], R2: [1e3, 5e3] };
  const A6e1 = '(-(gm1/(1+(gm1+1/rds1)*R1) + gm2/(1+(gm2+1/rds2)*R2))*par(rds1+R1+gm1*rds1*R1, rds2+R2+gm2*rds2*R2))';
  const n6e1 = ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'R2'];

  const HW6 = [
    R(md`
      **Course parameters:** $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TH}| = 1\,\text{V}$; all devices saturated, $g_mr_{ds} \gg 1$, $r_{ds}$ finite.

      **What this set drills:** the $G_MR_{out}$ method on two-stage circuits.
      - $A_V = -G_MR_{out}$, with $G_M$ the short-circuit current **pulled down** into the stage per volt of input (output shorted) and $R_{out}$ the resistance at the output with the input zeroed.
      - **Split at a node that only drives gates.** A gate draws no current, so the first stage does not feel the second one: $A_V = A_{V1}\cdot A_{V2}$.
      - **When one input reaches the output by two paths, add them** (superposition): in (b), (d) and (e) two transistors feed the same node.

      Answer boxes take the exact form or a good $g_mr_{ds} \gg 1$ approximation.
    `),
    P({
      id: 'e2hw6-a', src: 'Problem Set 6 · #1(a)', title: 'Degenerated PMOS into a diode stack, then a cascode', big: true,
      q: md`$I_B$ is ideal. Find $A_{V1} = v_1/v_{in}$ ($v_1$ is the $M_3$ diode node, $M_4$'s gate) and $A_V = v_{out}/v_{in}$.`,
      fig: hw6fig.a,
      parts: [
        ex(A6a1, ['gm1', 'rds1', 'R1', 'gm2', 'rds2', 'gm3', 'rds3'], 'A_{V1}'),
        ex(A6a, n6a, 'A_V'),
      ],
      hints: [
        md`Stage 1: $M_1$ is a degenerated CS (PMOS) with $G_{M1} = \dfrac{g_{m1}}{1+g_{m1}R_1}$, loaded by two diodes in series: $\dfrac{1}{g_{m2}} + \dfrac{1}{g_{m3}}$. The diodes divide $v_0$ down to $v_1$.`,
        md`Stage 2: $I_B$ is ideal, so the $M_5$–$M_4$ stack current cannot change. That forces $v_{x}$ (between them) to $-g_{m4}r_{ds4}v_1$.`,
        md`Then $M_5$ with zero current change: $v_{out} = v_x(1 + g_{m5}r_{ds5}) - g_{m5}r_{ds5}v_0$. The $v_1$ term dominates.`,
      ],
      sol: md`
**What to see first:** stage 1 is a **degenerated common source** ($M_1$, PMOS) into a **stack of two diodes**; stage 2 is a **cascode** ($M_4$ under $M_5$) with an ideal current-source load. The stages connect only through gates.

**Stage 1.** $v_0 = -G_{M1}(R_{UP}\parallel R_{DN1})v_{in}$ with $G_{M1} = \dfrac{g_{m1}}{1+g_{m1}R_1}$, $R_{UP} = r_{ds1} + R_1 + g_{m1}r_{ds1}R_1$ (huge), $R_{DN1} = \dfrac{1}{g_{m2}} + \dfrac{1}{g_{m3}}$. The two diodes carry the same current, so they divide: $v_1 = v_0\dfrac{1/g_{m3}}{1/g_{m2} + 1/g_{m3}}$.
$$A_{V1} = \frac{v_1}{v_{in}} \approx -\frac{g_{m1}}{g_{m3}(1 + g_{m1}R_1)}$$

**Stage 2.** The ideal $I_B$ makes the stack current fixed: $g_{m4}v_1 + v_x/r_{ds4} = 0 \Rightarrow v_x = -g_{m4}r_{ds4}v_1$. $M_5$ also carries zero change: $g_{m5}(v_0 - v_x) + (v_{out} - v_x)/r_{ds5} = 0$, so
$$v_{out} = -g_{m4}r_{ds4}(1 + g_{m5}r_{ds5})\,v_1 - g_{m5}r_{ds5}\,v_0$$
The first term is about $(g_mr_{ds})^2v_1$, the second only $g_mr_{ds}v_0$: this is the posted $A_{V2} = -g_{m4}R_{out}$ with $R_{out} = g_{m5}r_{ds5}r_{ds4} + r_{ds5} + r_{ds4}$.
$$A_V \approx +\frac{g_{m1}\,g_{m4}\,g_{m5}\,r_{ds4}\,r_{ds5}}{g_{m3}(1 + g_{m1}R_1)}$$

**Sign check:** two inversions, positive. **Pattern:** a cascode with an ideal current-source load has $R_{out} \approx g_mr_{ds}\cdot r_{ds}$, so its gain is about $(g_mr_{ds})^2$.`,
    }),
    P({
      id: 'e2hw6-b', src: 'Problem Set 6 · #1(b)', title: 'Folded cascode into a push-pull stage', big: true,
      q: md`Find $A_{V1} = v_B/v_{in}$ ($v_B$ is the $M_2$/$M_3$ drain node), $A_{V2} = v_{out}/v_B$ and $A_V$.`,
      fig: hw6fig.b,
      parts: [
        ex(A6b1, n6b1, 'A_{V1}', { ranges: rb6b, rtol: 0.05 }),
        ex(A6b2, n6b2, 'A_{V2}', { ranges: rb6b, rtol: 0.05 }),
        ex(`${A6b1}*${A6b2}`, n6b1.concat(n6b2), 'A_V', { ranges: rb6b, rtol: 0.08 }),
      ],
      hints: [
        md`Stage 1: $g_{m1}v_{in}$ is pulled from node A. It divides between $R_1\parallel r_{ds1}$ and $M_2$'s source ($\approx 1/g_{m2}$). Only the part entering $M_2$ reaches $v_B$.`,
        md`At $v_B$: $M_3$ is a current source ($r_{ds3}$), and $M_2$'s drain looks like $r_{ds2}(1 + g_{m2}(R_1\parallel r_{ds1}))$, much bigger.`,
        md`Stage 2: $v_B$ drives two gates: $G_{M2} = g_{m5} + \dfrac{g_{m4}}{1 + g_{m4}R_2}$, $R_{out2} = r_{ds5}\parallel(\text{degenerated } M_4)$.`,
      ],
      sol: md`
**What to see first:** stage 1 is a **folded cascode** ($M_1$ CS, $M_2$ PMOS common gate, $M_3$ current source); stage 2 is a **push-pull** pair driven by the same node, one side degenerated.

**Stage 1.** With $R_A = R_1\parallel r_{ds1}$, current division at node A sends the fraction $\dfrac{R_A}{R_A + 1/g_{m2}}$ of $g_{m1}v_{in}$ into $M_2$:
$$G_{M1} = g_{m1}\frac{R_A}{R_A + 1/g_{m2}},\quad R_{out1} = r_{ds3}\parallel\left[r_{ds2} + R_A(1 + g_{m2}r_{ds2})\right] \approx r_{ds3},\quad A_{V1} = -G_{M1}R_{out1}$$

**Stage 2.** $G_{M2} = g_{m5} + \dfrac{g_{m4}}{1 + g_{m4}R_2}$, $R_{out2} = r_{ds5}\parallel(r_{ds4} + R_2 + g_{m4}r_{ds4}R_2) \approx r_{ds5}$, $A_{V2} = -G_{M2}R_{out2}$.

**Total:** $A_V = A_{V1}A_{V2} = G_{M1}R_{out1}G_{M2}R_{out2}$, positive. (The posted solution uses $R_1$ where the exact form has $R_1\parallel r_{ds1}$; same thing when $R_1 \ll r_{ds1}$.)

**Pattern:** current division at a folding node: the CG source ($\approx 1/g_m$) competes with whatever else hangs on that node.`,
    }),
    P({
      id: 'e2hw6-c', src: 'Problem Set 6 · #1(c)', title: 'Common gate, a divider, then a degenerated CS', big: true,
      q: md`$I_B$ is ideal. Find $A_{V1} = v_1/v_{in}$ ($v_1$ is the $R_3$–$R_4$ node), $A_{V2} = v_{out}/v_1$ and $A_V$.`,
      fig: hw6fig.c,
      parts: [
        ex(A6c1, n6c1, 'A_{V1}'),
        ex(A6c2, n6c2, 'A_{V2}'),
        ex(`${A6c1}*${A6c2}`, n6c1.concat(n6c2), 'A_V'),
      ],
      hints: [
        md`$M_1$ is common gate fed through $R_1$ ($I_B$ is open). Its short-circuit output current is $\dfrac{v_{in}}{R_1 + 1/g_{m1}}$, flowing *into* the drain node as $v_{in}$ rises.`,
        md`The drain node sees three things in parallel: $R_{DN1} = r_{ds1} + R_1 + g_{m1}r_{ds1}R_1$, $R_2$, and $R_3 + R_4$. Then $R_3$–$R_4$ divide.`,
        md`Stage 2: degenerated CS with an active load: $A_{V2} = -\dfrac{g_{m2}}{1+g_{m2}R_5}\left(r_{ds3}\parallel(r_{ds2} + R_5 + g_{m2}r_{ds2}R_5)\right)$.`,
      ],
      sol: md`
**What to see first:** a **common-gate** input stage (the ideal $I_B$ is an open, so $v_{in}$ reaches the source only through $R_1$), a **resistive divider**, and a **degenerated CS** with a current-source load. Split at $v_1$: it only drives a gate.

**Stage 1.** $G_{M} = \dfrac{1}{R_1 + 1/g_{m1}}$ (non-inverting), load $R_{DN1}\parallel R_2\parallel(R_3+R_4)$, then the divider:
$$A_{V1} = \frac{g_{m1}}{1 + g_{m1}R_1}\left(R_{DN1}\parallel R_2\parallel(R_3+R_4)\right)\frac{R_4}{R_3+R_4}$$

**Stage 2.** $A_{V2} = -\dfrac{g_{m2}}{1+g_{m2}R_5}\left(r_{ds3}\parallel(r_{ds2} + R_5 + g_{m2}r_{ds2}R_5)\right)$.

**Total** $A_V = A_{V1}A_{V2}$: one CG (no inversion) and one CS (inversion), so negative.

**Pattern:** CG input $\to$ the input sees $R_1 + 1/g_{m1}$ and the same current comes out the drain.`,
    }),
    P({
      id: 'e2hw6-d', src: 'Problem Set 6 · #1(d)', title: 'Follower with a PMOS helper', big: true,
      q: md`Find $G_M$ (course convention: the short-circuit current pulled **down** into the circuit from $v_{out}$, per volt), $R_{out}$, and $A_V = -G_MR_{out}$.`,
      fig: hw6fig.d,
      parts: [
        ex(GM6d, ['gm1', 'rds1', 'gm2', 'R2'], 'G_M', { ranges: rb6d, rtol: 0.05 }),
        ex(RO6d, n6d, 'R_{out}', { ranges: rb6d, rtol: 0.05 }),
        ex(`-${GM6d}*${RO6d}`, n6d, 'A_V', { ranges: rb6d, rtol: 0.03 }),
      ],
      hints: [
        md`Short the output. $M_1$ is then a CS stage into $R_2$: node A moves by $-g_{m1}(R_2\parallel r_{ds1})v_{in}$, and $M_1$ pushes current into the output short.`,
        md`Node A is $M_2$'s gate: when A drops, the PMOS $M_2$ pushes *more* current into the output. Both currents flow into $v_{out}$, so $G_M$ (pulled down) is negative.`,
        md`$R_{out}$: four branches. $R_1$, $r_{ds2}$, $M_1$'s source ($\dfrac{r_{ds1}+R_2}{1+g_{m1}r_{ds1}}$), and $M_2$ acting through node A.`,
      ],
      sol: md`
**What to see first:** a **source follower** $M_1$ whose drain node A drives a **PMOS** $M_2$ that also feeds the output. Every bit of extra $M_1$ current lowers A, which turns $M_2$ on harder: a local feedback loop that makes the output very stiff.

**$G_M$** (output shorted): $v_A = -g_{m1}(R_2\parallel r_{ds1})v_{in}$. Current into the output from $M_1$: $g_{m1}v_{in}\dfrac{r_{ds1}}{R_2 + r_{ds1}}$; from $M_2$: $g_{m2}g_{m1}(R_2\parallel r_{ds1})v_{in}$. Pulled **down** is minus their sum:
$$G_M = -g_{m1}\left[\frac{r_{ds1}}{R_2+r_{ds1}} + g_{m2}(R_2\parallel r_{ds1})\right] \approx -g_{m1}(1 + g_{m2}R_2)$$

**$R_{out}$** ($v_{in} = 0$): $R_1$, $r_{ds2}$, $R_{UP1} = \dfrac{r_{ds1} + R_2}{1 + g_{m1}r_{ds1}}$, and the $M_2$ branch: a test voltage pushes $v_t/R_{UP1}$ up through $M_1$ into $R_2$, raising A by $R_2v_t/R_{UP1}$, which cuts $M_2$'s current by $g_{m2}R_2v_t/R_{UP1}$:
$$R_{out} = R_1\parallel r_{ds2}\parallel R_{UP1}\parallel\frac{R_{UP1}}{g_{m2}R_2} \approx \frac{1}{g_{m1}(1 + g_{m2}R_2)}\parallel R_1$$

**Gain:** $A_V = -G_MR_{out} \approx \dfrac{g_{m1}(1+g_{m2}R_2)R_1}{1 + g_{m1}(1+g_{m2}R_2)R_1}$, just under 1.

**Notes on the posted solution:** its $G_M$ has $R_2\parallel r_{ds2}$ where the circuit gives $R_2\parallel r_{ds1}$ (node A is loaded by $r_{ds1}$, not $r_{ds2}$), and its signs are mixed; with the course convention ($A_V = -G_MR_{out}$) $G_M$ must come out negative so that the follower's gain is positive.

**Pattern:** feedback around a follower divides its $1/g_m$ output resistance by the loop gain $(1 + g_{m2}R_2)$.`,
    }),
    P({
      id: 'e2hw6-e', src: 'Problem Set 6 · #1(e)', title: 'Two paths to one output', big: true,
      q: md`$v_{in}$ drives $M_1$, $M_2$ and $M_4$. Find $A_{V1} = v_X/v_{in}$ ($v_X$ is the $M_1$/$M_2$ drain node, $M_3$'s gate) and $A_V$.`,
      fig: hw6fig.e,
      parts: [
        ex(A6e1, n6e1, 'A_{V1}'),
        ex(`-(gm4 + gm3*${A6e1})*par(rds3, rds4)`, n6e1.concat(['gm3', 'rds3', 'gm4', 'rds4']), 'A_V'),
      ],
      hints: [
        md`$M_1$ and $M_2$ form a push-pull stage, each degenerated: $G_{M1} = \dfrac{g_{m1}}{1+g_{m1}R_1} + \dfrac{g_{m2}}{1+g_{m2}R_2}$ into two degenerated drains in parallel.`,
        md`At the output two transistors act at once: $M_4$ driven directly by $v_{in}$ and $M_3$ driven by $v_X$. Short-circuit current: $g_{m4}v_{in} + g_{m3}v_X$.`,
      ],
      sol: md`
**What to see first:** **superposition of two paths.** $M_4$ is a CS stage straight from $v_{in}$; $M_1$/$M_2$ amplify $v_{in}$ to $v_X$, which drives $M_3$. Both pull on the same output node, whose resistance is $r_{ds3}\parallel r_{ds4}$.

**Stage 1:** $A_{V1} = -\left(\dfrac{g_{m1}}{1+g_{m1}R_1} + \dfrac{g_{m2}}{1+g_{m2}R_2}\right)\left[(r_{ds1} + R_1 + g_{m1}r_{ds1}R_1)\parallel(r_{ds2} + R_2 + g_{m2}r_{ds2}R_2)\right]$, large and negative.

**Output:** $G_M = g_{m4} + g_{m3}A_{V1}$ (current pulled down per volt of $v_{in}$), so
$$A_V = -(g_{m4} + g_{m3}A_{V1})(r_{ds3}\parallel r_{ds4})$$
Because $A_{V1}$ is large and negative, the $M_3$ path wins and $A_V$ is large and **positive**; the direct $M_4$ path subtracts a little.

(The posted solution writes $g_{m5}$ and $r_{ds5}$; the circuit has no $M_5$, it means $M_3$.)

**Pattern:** when one input reaches the output through two transistors, write $G_M$ as the sum of their contributions, each with its own sign.`,
    }),
    P({
      id: 'e2hw6-f', src: 'Problem Set 6 · #1(f)', title: 'Signal on the supply of a differential pair',
      q: md`Here $v_{in}$ sits on the supply that feeds $M_3$ and $M_4$; both NMOS gates are at incremental ground and $I_B$ is ideal. For matched devices, what is $A_V = v_{out}/v_{in}$?`,
      fig: hw6fig.f,
      parts: [
        { lbl: 'A_V\\ (\\text{matched})', unit: '', ans: 1 },
        { mc: ['The diode $M_3$ keeps its gate a fixed $V_{SG}$ below the supply, so $M_4$ sees $v_{sg} \\approx 0$ and only its $r_{ds}$ couples the supply to the output.', '$M_4$ amplifies the supply change by $g_{m4}r_{ds4}$.', 'The ideal tail blocks the supply change completely, so $v_{out} = 0$.', 'The output follows the supply with gain $-1$ because the mirror inverts.'], a: 0, why: [null, 'Its gate moves with its source (through the diode), so its $v_{sg}$ barely changes: no $g_m$ action.', 'The tail fixes the *sum* of the two branch currents, not the output voltage.', 'Nothing inverts here: the output rises with the supply.'] },
      ],
      hints: [
        md`Node A (the diode) sits $1/g_{m3}$ away from the supply but much farther from ground, so it follows the supply almost exactly.`,
        md`Then $v_{sg4} \approx 0$: $M_4$ is just $r_{ds4}$ from the supply to the output. Below the output, $M_2$ looks like about $r_{ds2}$.`,
      ],
      sol: md`
**What to see first:** a differential pair with a **mirror load**, but the "input" is the **supply**. Nothing at a gate moves except the PMOS gates, through the diode.

**Node A** is $1/g_{m3}$ from the supply and roughly $2r_{ds}$ from ground (looking down into $M_1$), so $v_A \approx v_{in}$: $M_3$'s and $M_4$'s gates ride up with the supply, $v_{sg4} \approx 0$, and $M_4$ couples the supply to the output only through $r_{ds4}$.

**$G_MR_{out}$ view (posted solution):** with the output shorted, the supply pushes current through $r_{ds4}$ and through the $M_3$/$M_1$ branch (copied by the mirror and the tail), giving $|G_M| \approx \dfrac{1}{r_{ds1}} + \dfrac{1}{r_{ds4}}$; the output resistance of a mirror-loaded pair is $R_{out} \approx r_{ds2}\parallel r_{ds4}$. So
$$A_V \approx \frac{r_{ds2}\parallel r_{ds4}}{r_{ds1}\parallel r_{ds4}} = 1\quad(r_{ds1} = r_{ds2})$$
An exact circuit solve with all devices identical gives exactly $1$. (The posted solution writes $G_M = -(r_{ds1}\parallel r_{ds4})$, which has the units of a resistance; it means $-\dfrac{1}{r_{ds1}\parallel r_{ds4}}$.)

**Pattern:** the output of a mirror-loaded pair follows the supply one-for-one: the stage gives no supply rejection at its output.`,
    }),
  ];

  E2.lesson('e2-hwu', { id: 'e2-hw4', title: 'Problem Set 4', kind: 'pset', steps: HW4 });
  E2.lesson('e2-hwu', { id: 'e2-hw5', title: 'Problem Set 5: equivalent resistances', kind: 'pset', steps: HW5 });
  E2.lesson('e2-hwu', { id: 'e2-hw6', title: 'Problem Set 6: incremental gain', kind: 'pset', steps: HW6 });
})();

/* Exam 2: new practice exams D, E, F, G (writer A11), in the format of e2-mock.js (exams A–C): 60 minutes, three
   problems, 100 points, MOSFET only. Every DC number was checked with a nonlinear square-law solve, every symbolic
   answer against an exact small-signal nodal solve at 400 random parameter sets (the g_m r_ds >> 1 forms quoted in
   the solutions are within 3 % everywhere in the answer boxes' ranges), and every numeric gain also by a finite
   difference of the DC solve where the circuit allowed it. Scripts: scratchpad/A11/verify_[DEFG].py. */
(function () {
  'use strict';
  const { R, P } = C;
  const ex = (...a) => E2.ex(...a);
  const F = window.E2F;
  const V = (v) => `${v}\\,\\text{V}`;
  const acgL = (x, y) => ['acg', [x, y]];
  const lookDn = (p, n) => F.lookDn(p, n);
  const look = (p, n, side) => F.look(p, n, side);
  const vin = (x, y, n) => F.vin(x, y, n);
  const out = (p, n) => F.out(p, n);

  const params = md`**Transistor parameters.** NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$. Square law in saturation: $I_D = \tfrac12\mu C_{ox}\tfrac WL V_{ov}^2 = KV_{ov}^2$; $g_m = 2I_D/V_{ov}$.`;
  const rules = md`Unless a problem says otherwise, every transistor is saturated; in the symbolic problems $g_mr_{ds} \gg 1$ and you may **not** set $r_{ds} = \infty$; ignore the body effect. $G_M$ is the short-circuit current flowing from the shorted output **into** the stage per volt of input (positive for a common source, negative for a follower or a common gate), and $A_v = -G_MR_{out}$.`;
  const howto = 'Numeric boxes take a number in the unit shown (arithmetic such as `5/3` is fine). Symbolic boxes take expressions like `rds2 + (1 + gm2*rds2)*(RS || 1/gm3)`; `||` means "in parallel with". The exact result and the $g_mr_{ds} \\gg 1$ approximation are both accepted.';
  const intro = (name, rows, extra = '') => R(md`
    **${name}.** 60 minutes, three problems, 100 points, no calculator: every number is chosen to come out clean by hand. Do the whole paper on paper first, timed; then check each part here.

    ${params}

    | Problem | Points | What it tests |
    |---|---|---|
    ${rows}

    ${rules} ${extra}

    ${howto}
  `);

  // ================================================================== Practice exam D
  const D1Fig = [
    ['w', [0, -3], [5, -3]], ['rail', [2.5, -3], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['I', [0, -3], [0, -1.8], { s: '400\\,\\mu\\text{A}', side: 'l' }], ['w', [0, -1.8], [0, 1]],
    ['nmos', [0, 2], { n: 'M_1', sz: '50/1', flip: true, dc: true }], ['gnd', [0, 3]],
    ['w', [1, 2], [2, 2]], ['node', [1.5, 2], { n: 'V_G', side: 'b' }],
    ['nmos', [3, 2], { n: 'M_2', sz: '50/1' }], ['R', [3, 3], [3, 4.2], { n: 'R_S', s: '2\\kO' }], ['gnd', [3, 4.2]],
    ['w', [3, 1], [3, -1]], ['node', [3, 0], { n: 'X', side: 'l' }],
    ['pmos', [3, -2], { n: 'M_3', sz: '100/1', flip: true, dc: true }], ['pmos', [5, -2], { n: 'M_4', sz: '400/1' }],
    ['w', [5, -1], [5.8, -1]], ['term', [5.8, -1], { n: 'V_{OUT}', side: 'r' }],
    ['R', [5, -1], [5, 0.4], { n: 'R_L' }], ['gnd', [5, 0.4]],
  ];
  const D2aFig = [
    ['w', [1, 0], [1, -0.5]], lookDn([1, -0.5], 'R_{EQ1}'), ['w', [1, 0], [3, 0], [3, 1]], ['node', [1, 0], { n: 'X', side: 'l' }],
    ['nmos', [1, 1], { n: 'M_2', dc: true }], ['node', [1.5, 2], { n: 'Y', side: 'a' }],
    ['nmos', [1, 3], { n: 'M_3', dc: true }], ['gnd', [1, 4]],
    ['w', [1, 2], [2, 2]], ['nmos', [3, 2], { n: 'M_1' }], ['R', [3, 3], [3, 4.2], { n: 'R_S' }], ['gnd', [3, 4.2]],
  ];
  const D2bFig = [
    ['rail', [1, -2.4]], ['R', [1, -2.4], [1, -1.2], { n: 'R_3' }], ['pmos', [1, -0.2], { n: 'M_3' }], acgL(0, -0.2),
    ['w', [1, 0.8], [2.4, 0.8]], look([2.4, 0.8], 'R_{EQ2}'), ['node', [1.7, 0.8], { n: 'X', side: 'a' }],
    ['nmos', [1, 1.8], { n: 'M_2', dc: true }], ['node', [1, 2.8], { n: 'Y', side: 'r' }],
    ['nmos', [1, 3.8], { n: 'M_1' }], acgL(0, 3.8), ['gnd', [1, 4.8]],
  ];
  const D3Fig = [
    ['w', [1, -2], [3, -2]], ['rail', [2, -2], { n: 'V_{DD}' }],
    ['pmos', [1, -1], { n: 'M_2' }], acgL(0, -1), ['node', [1, 0], { n: 'v_1', side: 'l' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.5, 1], [-0.5, 1.3]], ...vin(-0.5, 1.3),
    ['w', [1, 0], [2, 0]], ['nmos', [3, 0], { n: 'M_3' }], ['w', [3, -1], [3, -2]],
    ['w', [3, 1], [4.2, 1]], ['w', [4.2, 1], [4.9, 1]], out([4.9, 1], 'v_{out}'),
    ['R', [4.2, 1], [4.2, 2.2], { n: 'R_L' }], ['gnd', [4.2, 2.2]],
    ['nmos', [3, 2], { n: 'M_4' }], acgL(2, 2), ['gnd', [3, 3]],
  ];

  const D2A = '(1/(gm2 + 1/rds2) + 1/(gm3 + 1/rds3)) || ((rds1 + RS + gm1*rds1*RS)/(1 + gm1*rds1*(1/(gm3 + 1/rds3))/(1/(gm2 + 1/rds2) + 1/(gm3 + 1/rds3))))';
  const D2B = '(rds3 + R3 + gm3*rds3*R3) || (rds1 + 1/(gm2 + 1/rds2))';
  const D3AV = '-gm1*(rds1 || rds2)*gm3*(rds4 || 1/(gm3 + 1/rds3) || RL)';

  const D = [
    intro('New practice exam D', [
      '| 1 | 35 | DC: a mirror with a resistor in the copy\'s source (one quadratic), then a PMOS mirror and the edge of saturation |',
      '| 2 | 30 | Two equivalent resistances: a gate in the middle of a diode stack (the $K$ rule), and a diode sitting on a current source |',
      '| 3 | 35 | A gain stage and its buffer: common source into a source follower, symbolic and then with numbers |',
    ].join('\n    ')),
    P({
      id: 'e2md-1a', src: 'New practice exam D · Problem 1(a) (15 pts)', title: 'A mirror with a resistor in the copy\'s source', big: true,
      q: md`$V_{DD} = 5\,\text{V}$. The reference $I_{REF} = 400\,\mu\text{A}$ flows into the diode-connected $M_1$ ($W/L = 50/1$). $M_2$ ($W/L = 50/1$) shares its gate but has $R_S = 2\kO$ in its source. Find the gate voltage $V_G$, the current $I_2$ in $M_2$, and $M_2$'s source voltage $V_{S2}$. ($\lambda = 0$ for all DC work.)`,
      fig: D1Fig,
      parts: [
        { lbl: 'V_G', unit: 'V', ans: 1.4 },
        { lbl: 'I_2', unit: 'µA', ans: 100, traps: [{ v: 400, msg: 'That is the plain-mirror answer (or the negative root of the quadratic). $R_S$ lifts the source, so $V_{GS2}$ is smaller than $V_{GS1}$.' }] },
        { lbl: 'V_{S2}', unit: 'V', ans: 0.2 },
      ],
      hints: [
        md`$M_1$ carries all of $I_{REF}$ (gates draw nothing): $V_G = V_{TN} + \sqrt{I_{REF}/K_1}$ with $K_1 = \tfrac12\mu_nC_{ox}\tfrac WL$.`,
        md`KVL from the gate to ground through $M_2$: $V_G = V_{GS2} + I_2R_S$. Write both terms with the unknown $V_{ov2}$.`,
        md`You should get $5V_{ov2}^2 + V_{ov2} - 0.4 = 0$. Keep the positive root.`,
      ],
      sol: md`
        **Recognize it first.** $M_1$ is a diode: the reference current sets its $V_{GS}$, and that is also $M_2$'s gate voltage. But $M_2$ is **not** a plain copy. Its source sits on $R_S$, so the current it carries lifts its own source and takes away $V_{GS}$. Its current comes from one equation that mixes the square law with Ohm's law: a quadratic.

        **Step 1: the gate voltage, from the diode.** $K_1 = \tfrac12(100\,\mu)(50) = 2.5\,\text{mA/V}^2$, and $M_1$ carries all $400\,\mu\text{A}$:
        $$V_{ov1} = \sqrt{\frac{0.4\,\text{m}}{2.5\,\text{m}}} = \sqrt{0.16} = 0.4\,\text{V},\qquad V_G = V_{TN} + V_{ov1} = 1.4\,\text{V}$$

        **Step 2: KVL around $M_2$'s gate loop.** Walk from the gate, down across $M_2$'s gate–source, then down through $R_S$ to ground:
        $$V_G = V_{GS2} + I_2R_S$$
        Write both terms with the unknown overdrive $x = V_{ov2}$: $V_{GS2} = 1 + x$, and $I_2 = K_2x^2$ with $K_2 = 2.5\,\text{mA/V}^2$ (same size as $M_1$). Then $I_2R_S = (2.5\,\text{m})(2\,\text{k})x^2 = 5x^2$:
        $$1.4 = 1 + x + 5x^2$$

        **Step 3: solve.** $5x^2 + x - 0.4 = 0$. Multiply by 5: $25x^2 + 5x - 2 = 0$, which factors as $(5x - 1)(5x + 2) = 0$. So $x = 0.2\,\text{V}$ or $x = -0.4\,\text{V}$. An overdrive must be positive (a negative one means the device is off, and then the square law does not apply), so $V_{ov2} = 0.2\,\text{V}$.

        **Step 4: current and source voltage.**
        $$I_2 = K_2V_{ov2}^2 = 2.5\,\text{m}\times0.04 = 100\,\mu\text{A},\qquad V_{S2} = I_2R_S = 100\,\mu\text{A}\times2\kO = 0.2\,\text{V}$$

        **Check the loop:** $V_{GS2} + V_{S2} = 1.2 + 0.2 = 1.4\,\text{V} = V_G$. ✓

        **Why a quarter of the reference?** Without $R_S$ the copy would carry $400\,\mu\text{A}$ (same size, same $V_{GS}$). The resistor takes $0.2\,\text{V}$ out of $V_{GS}$, which halves the overdrive (0.4 → 0.2 V), and the square law turns half the overdrive into a quarter of the current. A plain mirror would need a device four times narrower ($W/L = 12.5/1$) to copy $100\,\mu\text{A}$.

        !!trap The other root
          $x = -0.4\,\text{V}$ also solves the quadratic, and it even gives $K_2x^2 = 400\,\mu\text{A}$, the plain-mirror number. It is not physical: the square law only holds for $V_{ov} > 0$. Keep the positive root.

        !!key Pattern
          A resistor in the copy's source: $V_G = V_{TN} + V_{ov} + KV_{ov}^2R_S$. Solve for $V_{ov}$; degeneration makes the copy smaller than the size ratio alone says.
      `,
    }),
    P({
      id: 'e2md-1b', src: 'New practice exam D · Problem 1(b) (20 pts)', title: 'The copy, mirrored again by PMOS', big: true,
      q: md`Same circuit. $M_3$ ($W/L = 100/1$) is a diode-connected PMOS carrying $I_2$; $M_4$ ($W/L = 400/1$) shares its gate and drives $R_L$. Find the voltage $V_X$ at $M_3$'s gate and drain, the current $I_4$, $V_{OUT}$ when $R_L = 5\kO$, and the largest $R_L$ that keeps $M_4$ saturated.`,
      fig: D1Fig,
      parts: [
        { lbl: 'V_X', unit: 'V', ans: 3.8 },
        { lbl: 'I_4', unit: 'µA', ans: 400, traps: [{ v: 1600, msg: '$M_4$ copies $M_3$, and $M_3$ carries $I_2 = 100\\,\\mu\\text{A}$, not $I_{REF}$.' }] },
        { lbl: 'V_{OUT}\\ (R_L = 5\\,\\text{k}\\Omega)', unit: 'V', ans: 2 },
        { lbl: 'R_{L,max}', unit: 'kΩ', ans: 12, traps: [{ v: 7, msg: 'That uses the NMOS rule $V_D \\ge V_G - V_T$. A PMOS needs $V_D \\le V_G + |V_{TP}|$.' }] },
      ],
      hints: [
        md`$M_3$ carries $I_2$ from part (a). Invert the PMOS square law for $V_{SG3}$, with $K_3 = \tfrac12\mu_pC_{ox}\tfrac WL$.`,
        md`$M_4$ has the same $V_{SG}$ as $M_3$, so its current scales with $W/L$.`,
        md`PMOS edge of saturation: $V_D = V_G + |V_{TP}|$.`,
      ],
      sol: md`
        **Recognize it first.** Two mirrors in a row. Part (a) fixed $I_2 = 100\,\mu\text{A}$, and that current has only one way to go: up through the PMOS diode $M_3$. So $M_3$ turns $I_2$ into a gate voltage, $M_4$ copies $I_2$ scaled by size, and the last question compares $M_4$'s drain with its gate.

        **Step 1: $V_X$ from the PMOS diode.** $K_3 = \tfrac12(50\,\mu)(100) = 2.5\,\text{mA/V}^2$ at $100\,\mu\text{A}$:
        $$V_{ov3} = \sqrt{\frac{0.1\,\text{m}}{2.5\,\text{m}}} = 0.2\,\text{V},\quad V_{SG3} = 1.2\,\text{V},\quad V_X = 5 - 1.2 = 3.8\,\text{V}$$
        Is $M_2$ still saturated? Its drain is $V_X$: $3.8 \ge V_G - V_{TN} = 0.4\,\text{V}$ ✓.

        **Step 2: $I_4$ by size.** Same $V_{SG}$ (gates tied, sources both at $V_{DD}$), four times the $W/L$:
        $$I_4 = 100\,\mu\text{A}\times\frac{400}{100} = 400\,\mu\text{A}$$
        (Check: $K_4 = \tfrac12(50\,\mu)(400) = 10\,\text{mA/V}^2$ and $10\,\text{m}\times0.2^2 = 400\,\mu\text{A}$ ✓.)

        **Step 3: $V_{OUT}$ with $5\kO$.** All of $I_4$ flows down through $R_L$: $V_{OUT} = 0.4\,\text{mA}\times5\kO = 2\,\text{V}$. Saturated? PMOS rule $V_D \le V_G + |V_{TP}| = 4.8\,\text{V}$: $2 \le 4.8$ ✓.

        **Step 4: the largest $R_L$.** A bigger $R_L$ lifts the drain toward the source. At the edge only $V_{ov4} = 0.2\,\text{V}$ is left across $M_4$, i.e. $V_{OUT} = V_X + |V_{TP}| = 4.8\,\text{V}$:
        $$R_{L,max} = \frac{4.8\,\text{V}}{0.4\,\text{mA}} = 12\kO$$

        !!mistake The NMOS rule on a PMOS
          $V_D \ge V_G - V_T$ is the NMOS condition. A PMOS drain must stay **below** $V_G + |V_{TP}|$. The NMOS form would say $V_{OUT} \ge 2.8\,\text{V}$, which points the wrong way.

        !!key Pattern
          A chain of mirrors: carry the **current** from stage to stage. Each diode turns current into a gate voltage, each copy scales it by $W/L$, each edge-of-saturation check compares drain to gate.
      `,
    }),
    P({
      id: 'e2md-2a', src: 'New practice exam D · Problem 2(a) (15 pts)', title: 'A gate in the middle of a diode stack', big: true,
      q: md`Find $R_{EQ1}$, looking down into node $X$. $M_2$ and $M_3$ are diode-connected and stacked; $M_1$'s gate is tied to the node $Y$ between them, and $R_S$ degenerates its source. All transistors saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: D2aFig,
      parts: [ex(D2A, ['gm1', 'rds1', 'RS', 'gm2', 'rds2', 'gm3', 'rds3'], 'R_{EQ1}', { ranges: { gm2: [4e-3, 6e-3], gm3: [1e-3, 2e-3], RS: [500, 2e3] } })],
      hints: [
        md`Two branches leave $X$: the diode stack, and $M_1$. $M_1$'s gate draws no current, so the stack is just two resistors in series.`,
        md`A diode-connected device is the resistor $\dfrac{1}{g_m + g_{ds}}$ ($g_{ds} = 1/r_{ds}$). The stack is also a divider: $v_Y = Kv_x$.`,
        md`$M_1$ is a degenerated drain whose gate moves by $Kv_x$: $R_{DN} = \dfrac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K}$.`,
      ],
      sol: md`
        **Recognize it first.** Two blocks in parallel at $X$: a **stack of two diodes** (a resistor string), and a **degenerated drain whose gate moves**, because the gate hangs on the middle of that string. So: two series resistors, a divider ratio $K$, and the [$K$ rule](#/l/e2-u7-k).

        **Step 1: each diode is a resistor.** A diode-connected transistor has $v_{gs} = v_{ds}$, so its model current is $g_mv_{ds} + v_{ds}/r_{ds}$: a two-terminal resistor
        $$R_2 = \frac{1}{g_{m2} + g_{ds2}} \approx \frac{1}{g_{m2}},\qquad R_3 = \frac{1}{g_{m3} + g_{ds3}} \approx \frac{1}{g_{m3}}$$
        This is true for $M_2$ even though its source is not grounded: only $v_{gs2} = v_{ds2}$ matters.

        **Step 2: the stack branch.** $M_1$'s gate takes no current from $Y$, so one current flows through $M_2$ and then $M_3$: they are in series, $R_{stack} = R_2 + R_3$.

        **Step 3: how far the gate moves.** The same string is a voltage divider:
        $$v_Y = Kv_x,\qquad K = \frac{R_3}{R_2 + R_3} \approx \frac{1/g_{m3}}{1/g_{m2} + 1/g_{m3}} = \frac{g_{m2}}{g_{m2} + g_{m3}}$$

        **Step 4: $M_1$, a degenerated drain with a moving gate.** Apply $v_x$ and call the current down through $M_1$ $i_1$. The source sits on $R_S$, so $v_s = i_1R_S$; the gate is at $Kv_x$. The model current from drain to source:
        $$i_1 = g_{m1}(Kv_x - i_1R_S) + \frac{v_x - i_1R_S}{r_{ds1}}$$
        Multiply by $r_{ds1}$ and move every $i_1$ to the left:
        $$i_1\left(r_{ds1} + R_S + g_{m1}r_{ds1}R_S\right) = v_x\left(1 + g_{m1}r_{ds1}K\right)\;\Rightarrow\;R_{DN} = \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K}$$
        With $g_{m1}r_{ds1} \gg 1$, the 1's are negligible: $R_{DN} \approx \dfrac{R_S + 1/g_{m1}}{K} = \left(R_S + \dfrac{1}{g_{m1}}\right)\left(1 + \dfrac{g_{m3}}{g_{m2}}\right)$.

        **Step 5: combine the two branches.**
        $$R_{EQ1} = (R_2 + R_3)\ \Big\|\ \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K} \approx \left(\frac{1}{g_{m2}} + \frac{1}{g_{m3}}\right)\Big\|\left(R_S + \frac{1}{g_{m1}}\right)\left(1 + \frac{g_{m3}}{g_{m2}}\right)$$

        **Check the limits.** $K \to 1$ (when $g_{m3} \ll g_{m2}$): $M_1$ becomes an ordinary degenerated diode, $R_S + 1/g_{m1}$. $K \to 0$ (gate held still): back to the huge $r_{ds1}(1 + g_{m1}R_S)$. Matched $M_2 = M_3$: $K = \tfrac12$ and $M_1$ looks like $2(R_S + 1/g_{m1})$.

        **Size check.** Both branches are small here (hundreds of ohms to a few kilohms), so neither can be dropped.

        !!key Pattern
          Gate on a string of diodes: each diode is $1/g_m$, $K$ is their ratio, and $R_{DN} = \dfrac{r_{ds}(1 + g_mR_S) + R_S}{1 + g_mr_{ds}K} \approx \dfrac{R_S + 1/g_m}{K}$.
      `,
    }),
    P({
      id: 'e2md-2b', src: 'New practice exam D · Problem 2(b) (15 pts)', title: 'A diode sitting on a current source', big: true,
      q: md`Find $R_{EQ2}$ at node $X$. Up: the PMOS $M_3$ (gate held) with $R_3$ in its source. Down: the diode-connected $M_2$ sits on top of $M_1$, whose gate is held. All transistors saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: D2bFig,
      parts: [ex(D2B, ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'R3'], 'R_{EQ2}', { ranges: { R3: [300, 1e3], gm3: [2e-3, 3e-3] } })],
      hints: [
        md`$R_{EQ2} = R_{UP}\parallel R_{DN}$. $R_{UP}$ is a degenerated drain (the model is the same for PMOS).`,
        md`A diode-connected transistor is a two-terminal resistor $1/(g_{m2} + g_{ds2})$, whatever sits under it. What sits under it here?`,
        md`$M_1$ with its gate held is a resistor $r_{ds1}$. In series with the diode: $R_{DN} = r_{ds1} + \dfrac{1}{g_{m2} + g_{ds2}}$.`,
      ],
      sol: md`
        **Recognize it first.** Up: a **degenerated drain** (a PMOS this time). Down: a **diode in series with a current source**. The trap is the word "diode": a diode is a small resistance only when nothing else limits its current, and here $M_1$ does.

        **Step 1: $R_{UP}$.** $M_3$'s gate is held and $R_3$ sits between its source and $V_{DD}$ (an incremental ground). The small-signal model is the same for PMOS and NMOS, so the [impedance-scaler](#/l/e2-u7-scaler) result applies unchanged:
        $$R_{UP} = r_{ds3} + R_3 + g_{m3}r_{ds3}R_3 \approx r_{ds3}(1 + g_{m3}R_3)$$

        **Step 2: the diode is a series resistor.** $M_2$ has its gate tied to its drain, so $v_{gs2} = v_{ds2}$ and its current is $(g_{m2} + g_{ds2})v_{ds2}$, whatever its source does. Between $X$ and $Y$ it is the resistor $\dfrac{1}{g_{m2} + g_{ds2}}$.

        **Step 3: $M_1$.** Gate held, source grounded: its current is $v_Y/r_{ds1}$. A resistor $r_{ds1}$ from $Y$ to ground.

        **Step 4: in series.** Nothing else touches $Y$, so one current flows through both:
        $$R_{DN} = r_{ds1} + \frac{1}{g_{m2} + g_{ds2}} \approx r_{ds1}$$

        **Answer.**
        $$R_{EQ2} = \left(r_{ds3} + R_3 + g_{m3}r_{ds3}R_3\right)\ \Big\|\ \left(r_{ds1} + \frac{1}{g_{m2} + g_{ds2}}\right) \approx r_{ds3}(1 + g_{m3}R_3)\parallel r_{ds1}$$

        **Physical picture.** Push $X$ up by $v_x$. $M_1$ holds the lower branch's current nearly fixed (it only changes by $v_Y/r_{ds1}$), so the diode's current barely changes, so its $v_{gs}$ barely changes: almost all of $v_x$ lands across $r_{ds1}$. The diode just rides along, adding its small $1/g_{m2}$.

        !!mistake "Diode, so $1/g_m$"
          $1/g_{m2}$ is the resistance of the diode **by itself**. In series with a current source it adds a few hundred ohms to $r_{ds1}$, which is hundreds of kilohms. Writing $R_{DN} \approx 1/g_{m2}$ is off by a factor of about $g_mr_{ds}$.

        !!trap Keep the 1 in $r_{ds3}(1 + g_{m3}R_3)$
          The shortcut $R_{UP} \approx g_{m3}r_{ds3}R_3$ needs $g_{m3}R_3 \gg 1$, and nothing here promises that (with $g_{m3}R_3 = 2$ it is off by a third). The answer box checks with modest $R_3$, so it wants $r_{ds3}(1 + g_{m3}R_3)$ or the exact form.

        !!key Pattern
          A diode-connected transistor is a two-terminal resistor $1/(g_m + g_{ds})$. In series with anything, just add it.
      `,
    }),
    P({
      id: 'e2md-3', src: 'New practice exam D · Problem 3(a)–(c) (25 pts)', title: 'A gain stage and its buffer', big: true,
      q: md`$M_1$ is a common-source stage loaded by the PMOS current source $M_2$; its output $v_1$ drives the source follower $M_3$, biased by the current sink $M_4$; the load $R_L$ hangs on $v_{out}$. Find (a) $A_1 = v_1/v_{in}$ (8 pts); (b) the follower's short-circuit transconductance $G_{M2}$ (input $v_1$, output $v_{out}$) and $R_{out}$, the resistance $R_L$ sees looking back into $v_{out}$ (10 pts); (c) $A_v = v_{out}/v_{in}$ with $R_L$ connected (7 pts).`,
      fig: D3Fig,
      parts: [
        ex('-gm1*(rds1 || rds2)', ['gm1', 'rds1', 'rds2'], 'A_1'),
        ex('-gm3', ['gm3', 'rds3', 'rds4'], 'G_{M2}'),
        ex('rds4 || 1/(gm3 + 1/rds3)', ['gm3', 'rds3', 'rds4'], 'R_{out}'),
        ex(D3AV, ['gm1', 'rds1', 'rds2', 'gm3', 'rds3', 'rds4', 'RL'], 'A_v'),
      ],
      hints: [
        md`Stage 1: $G_{M1} = g_{m1}$; looking into $v_1$ you see $r_{ds1}$ down and $r_{ds2}$ up. $M_3$'s gate adds nothing.`,
        md`Short $v_{out}$: $M_3$ has $v_{gs3} = v_1$ and pushes $g_{m3}v_1$ **out of** itself into the short. Mind the sign convention.`,
        md`$R_{out}$: with $v_{in} = 0$, $v_1 = 0$ too. Looking into a source whose drain is at incremental ground gives $1/(g_{m3} + g_{ds3})$; $r_{ds4}$ is in parallel.`,
      ],
      sol: md`
        **Recognize it first.** Two stages in a [chain](#/l/e2-u9-chain). Stage 1 is a **common source with a current-source load**: lots of gain, but its output resistance is about $r_{ds}/2$, far too high to drive a small load. Stage 2 is a **source follower**: gain just under 1, output resistance about $1/g_{m3}$. A gate draws no current, so stage 2 does not load stage 1, and the gains multiply.

        **(a) Stage 1.** Short $v_1$ to find $G_{M1}$: $M_1$ pulls $g_{m1}v_{in}$ from the short down to ground, so $G_{M1} = g_{m1}$. Zero $v_{in}$ to find the resistance at $v_1$: down, $M_1$ with gate and source grounded is $r_{ds1}$; up, $M_2$ with gate held and source at $V_{DD}$ is $r_{ds2}$; $M_3$'s gate adds nothing.
        $$A_1 = -G_{M1}R_{out1} = -g_{m1}(r_{ds1}\parallel r_{ds2})$$

        **(b) The follower's $G_{M2}$.** Short $v_{out}$ to ground and drive $v_1$. $M_3$ has its drain at $V_{DD}$ (incremental ground), its gate at $v_1$ and its source on the short: $v_{gs3} = v_1$, $v_{ds3} = 0$. Its model current $g_{m3}v_1$ flows from drain to source, i.e. **out of** the transistor **into** the short. $M_4$ and $R_L$ have zero volts across them and carry nothing. The course counts current flowing from the short **into** the stage, so
        $$G_{M2} = -g_{m3}$$
        Negative, like every follower: the output moves **with** the input.

        **(b) $R_{out}$.** Zero $v_{in}$; then $v_1 = 0$ as well (stage 1 has no input), so $M_3$'s gate is an incremental ground. Apply $v_t$ at $v_{out}$ (without $R_L$). $M_3$: $v_{gs3} = -v_t$, $v_{ds3} = -v_t$, so the current flowing into its source is $g_{m3}v_t + v_t/r_{ds3}$; that is $\dfrac{1}{g_{m3} + 1/r_{ds3}}$. $M_4$ adds $r_{ds4}$ in parallel:
        $$R_{out} = r_{ds4}\ \Big\|\ \frac{1}{g_{m3} + 1/r_{ds3}} \approx \frac{1}{g_{m3}}$$

        **(c) The whole chain.** Stage 2 drives $R_L$, so its gain is $-G_{M2}(R_{out}\parallel R_L)$:
        $$A_v = -g_{m1}(r_{ds1}\parallel r_{ds2})\cdot g_{m3}\left(r_{ds4}\parallel\frac{1}{g_{m3} + 1/r_{ds3}}\parallel R_L\right) \approx -g_{m1}(r_{ds1}\parallel r_{ds2})\cdot\frac{g_{m3}R_L}{1 + g_{m3}R_L}$$

        **Sign check.** $v_{in}$ up → $M_1$ pulls harder → $v_1$ down → the follower copies it → $v_{out}$ down. One inversion in total. ✓

        !!key Pattern
          A follower has $G_M = -g_m$ and $R_{out} \approx 1/g_m$, so into a load it gives $\dfrac{g_mR_L}{1 + g_mR_L}$: a divider between $1/g_m$ and $R_L$. It costs a little gain and lets a high-impedance stage drive a low-impedance load.
      `,
    }),
    P({
      id: 'e2md-3d', src: 'New practice exam D · Problem 3(d) (10 pts)', title: 'Why the buffer is there, in numbers', big: true,
      q: md`Same circuit, with $g_{m1} = 2\,\text{mA/V}$, $g_{m3} = 4\,\text{mA/V}$, every $r_{ds} = 50\kO$ and $R_L = 1\kO$. Find $R_{out}$, the gain $A_v$, and the gain you would get if $R_L$ were connected straight to $v_1$ with no follower.`,
      fig: D3Fig,
      parts: [
        { lbl: 'R_{out}', unit: 'Ω', ans: 247.5, accept: [250] },
        { lbl: 'A_v', unit: '', ans: -39.68, accept: [-40] },
        { lbl: 'A_v\\ (\\text{no follower})', unit: '', ans: -1.923, accept: [-2] },
      ],
      hints: [
        md`$r_{ds1}\parallel r_{ds2} = 25\kO$; $\dfrac{1}{g_{m3} + 1/r_{ds3}}$ is a hair under $1/g_{m3} = 250\,\Omega$.`,
        md`Without the follower, $R_L$ sits in parallel with $25\kO$ at $v_1$.`,
      ],
      sol: md`
        **Recognize it first.** Put numbers into part (c), then compare with the same $1\kO$ load hung directly on the high-impedance node $v_1$.

        **Stage 1.** $r_{ds1}\parallel r_{ds2} = 50\,\text{k}\parallel50\,\text{k} = 25\kO$, so $A_1 = -2\,\text{m}\times25\,\text{k} = -50$.

        **$R_{out}$.** $g_{m3} + 1/r_{ds3} = 4 + 0.02 = 4.02\,\text{mS}$, so $\dfrac{1}{4.02\,\text{mS}} = 248.8\,\Omega$; in parallel with $r_{ds4} = 50\kO$: $R_{out} = 247.5\,\Omega$, essentially $1/g_{m3} = 250\,\Omega$.

        **Stage 2 with the load.** $R_{out}\parallel R_L = 247.5\parallel1000 = 198.4\,\Omega$, so $A_2 = g_{m3}\times198.4 = 0.794$. (Quick version: the divider $\dfrac{1000}{1000 + 250} = 0.8$.)

        **Total.** $A_v = -50\times0.794 = -39.7\ \approx -40$.

        **No follower.** At $v_1$ the load meets $25\kO$: $25\,\text{k}\parallel1\,\text{k} = 961.5\,\Omega$, so $A_v = -2\,\text{m}\times961.5 = -1.92$ (about $-g_{m1}R_L = -2$).

        **What it means.** The common-source stage makes gain only while its load resistance is large. A $1\kO$ load straight on $v_1$ throws away 96 % of $25\kO$; the follower presents an open circuit to $v_1$ and drives the $1\kO$ from about $250\,\Omega$. The buffer buys a factor of 20.

        !!key Pattern
          Put a follower between a high-impedance gain node and a low-impedance load. Gain with the buffer $\approx -g_{m1}(r_{ds1}\parallel r_{ds2})\cdot\dfrac{R_L}{R_L + 1/g_{m3}}$.
      `,
    }),
  ];

  // ================================================================== Practice exam E
  const E1Fig = [
    ['w', [-1, -2], [3, -2]], ['rail', [1, -2], { n: 'V_{DD} = 3\\,\\text{V}' }],
    ['pmos', [-1, -1], { n: 'M_4', sz: '100/1', flip: true, dc: true }],
    ['I', [-1, 0], [-1, 1.2], { n: 'I_{REF}', s: '100\\,\\mu\\text{A}', side: 'l' }], ['gnd', [-1, 1.2]],
    ['pmos', [1, -1], { n: 'M_3', sz: '300/1' }], ['pmos', [3, -1], { n: 'M_2', sz: '100/1', dc: true }],
    ['w', [1, 0], [3, 0]], ['w', [3, 0], [3.9, 0]], out([3.9, 0], 'V_{OUT} + v_{out}'),
    ['nmos', [3, 1], { n: 'M_1', sz: '200/1' }], ['gnd', [3, 2]],
    ['w', [2, 1], [1.6, 1], [1.6, 1.4]], ['Vac', [1.6, 1.4], [1.6, 2.4], { n: 'v_{in}', side: 'l' }],
    ['V', [1.6, 2.4], [1.6, 3.4], { n: 'V_B', s: V(1.2), side: 'l' }], ['gnd', [1.6, 3.4]],
  ];
  const E2aFig = [
    ['rail', [0, -2]], ['pmos', [0, -1], { n: 'M_3' }], acgL(-1, -1),
    ['nmos', [0, 1], { n: 'M_1' }], acgL(-1, 1), ['gnd', [0, 2]],
    ['w', [0, 0], [2, 0]], ['node', [1, 0], { n: 'X', side: 'a' }],
    ['pmos', [2, 1], { n: 'M_4', flip: true }], ['acg', [3, 1]],
    ['w', [2, 2], [3.3, 2]], look([3.3, 2], 'R_{out}'),
    ['nmos', [2, 3], { n: 'M_5' }], acgL(1, 3), ['nmos', [2, 5], { n: 'M_6' }], acgL(1, 5),
    ['R', [2, 6], [2, 7.2], { n: 'R_S' }], ['gnd', [2, 7.2]],
  ];
  const E2bFig = [
    ['w', [2, 0], [2, -0.5]], lookDn([2, -0.5], 'R_{EQ2}'), ['node', [2, 0], { n: 'X', side: 'r' }],
    ['w', [2, 0], [0, 0]], ['R', [0, 0], [0, 1.4], { n: 'R_1', side: 'l' }],
    ['w', [0, 1.4], [0, 3], [1, 3]], ['node', [0, 2.2], { n: 'G', side: 'l' }],
    ['R', [0, 3], [0, 4.2], { n: 'R_2', side: 'l' }], ['gnd', [0, 4.2]],
    ['nmos', [2, 1], { n: 'M_2' }], acgL(1, 1), ['node', [2, 2], { n: 'Y', side: 'r' }],
    ['nmos', [2, 3], { n: 'M_1' }], ['gnd', [2, 4]],
  ];
  const E3Fig = [
    ['w', [1, -0.4], [3, -0.4]], ['rail', [2, -0.4], { n: 'V_{DD}' }],
    ['pmos', [1, 0.6], { n: 'M_3', flip: true, dc: true }], ['pmos', [3, 0.6], { n: 'M_4' }],
    ['node', [1, 1.6], { n: 'A', side: 'l' }],
    ['nmos', [1, 2.6], { n: 'M_1' }], ['nmos', [3, 2.6], { n: 'M_2', flip: true }], ['acg', [4, 2.6]],
    ['w', [0, 2.6], [-0.5, 2.6], [-0.5, 3]], ...vin(-0.5, 3),
    ['w', [3, 1.6], [3.9, 1.6]], out([3.9, 1.6], 'v_{out}'),
    ['w', [1, 3.6], [3, 3.6]], ['node', [2, 3.6], { n: 'P', side: 'a' }],
    ['I', [2, 3.6], [2, 4.8], { n: 'I_{SS}', side: 'r' }], ['gnd', [2, 4.8]],
  ];

  const E2A = '(rds4 + (rds1 || rds3)*(1 + gm4*rds4)) || (rds5 + (rds6 + RS + gm6*rds6*RS)*(1 + gm5*rds5))';
  const E2B = '(R1 + R2) || ((rds1 + rds2 + gm2*rds1*rds2)/(1 + gm1*rds1*(1 + gm2*rds2)*R2/(R1 + R2)))';
  const E3GM = '-gm1*(1 + gm3/(gm3 + 1/rds3))/(2 + (1/rds1)/(gm3 + 1/rds3))';
  const E3RO = 'rds3 || ((2*rds1 + 1/(gm3 + 1/rds3))/(1 + gm3/(gm3 + 1/rds3)))';

  const E = [
    intro('New practice exam E', [
      '| 1 | 30 | A common source whose diode load is "starved" by a current source: DC, then the gain |',
      '| 2 | 35 | Two cascode resistances: the output node of a folded cascode, and a cascode whose input gate sits on a divider from its own output |',
      '| 3 | 35 | The differential pair with a current-mirror load, driven on one side: two paths into one output |',
    ].join('\n    ')),
    P({
      id: 'e2me-1a', src: 'New practice exam E · Problem 1(a) (15 pts)', title: 'A diode load with a current source beside it: DC', big: true,
      q: md`$V_{DD} = 3\,\text{V}$. $M_1$ ($W/L = 200/1$) has its gate at $V_B = 1.2\,\text{V}$ plus the signal $v_{in}$. Its load is the diode-connected PMOS $M_2$ ($100/1$); next to it, the PMOS $M_3$ ($300/1$), mirrored from $M_4$ ($100/1$, carrying $I_{REF} = 100\,\mu\text{A}$), feeds extra current into the output node. With $v_{in} = 0$, find the currents $I_1$, $I_3$, $I_2$ in $M_1$, $M_3$, $M_2$, and the DC output voltage $V_{OUT}$.`,
      fig: E1Fig,
      parts: [
        { lbl: 'I_1', unit: 'µA', ans: 400 },
        { lbl: 'I_3', unit: 'µA', ans: 300 },
        { lbl: 'I_2', unit: 'µA', ans: 100, traps: [{ v: 400, msg: 'That forgets $M_3$: KCL at the output says the diode only carries what $M_3$ does not supply.' }] },
        { lbl: 'V_{OUT}', unit: 'V', ans: 1.8, traps: [{ v: 1.6, msg: 'That is $V_{OUT}$ with the diode carrying all $400\\,\\mu\\text{A}$. It carries only $I_2$.' }] },
      ],
      hints: [
        md`$M_1$'s current is set by its gate: $V_{ov1} = V_B - V_{TN}$. $M_3$'s current is set by the mirror: same $V_{SG}$ as $M_4$, scaled by $W/L$.`,
        md`KCL at the output: $M_1$ sinks $I_1$; $M_3$ and the diode $M_2$ supply it together.`,
        md`$V_{OUT} = V_{DD} - V_{SG2}$, with $V_{SG2}$ from the PMOS square law at the diode's own current.`,
      ],
      sol: md`
        **Recognize it first.** A common source whose load is a PMOS diode, with a second PMOS ($M_3$, a mirror copy) pumping DC current into the same node. Three different things set three currents: the gate voltage sets $M_1$'s, the mirror sets $M_3$'s, and KCL hands the diode **the difference**. That difference sets the diode's $V_{SG}$, hence $V_{OUT}$.

        **Step 1: $I_1$ from $V_B$.** $K_1 = \tfrac12(100\,\mu)(200) = 10\,\text{mA/V}^2$, $V_{ov1} = 1.2 - 1 = 0.2\,\text{V}$:
        $$I_1 = K_1V_{ov1}^2 = 10\,\text{m}\times0.04 = 400\,\mu\text{A}$$

        **Step 2: $I_3$ from the mirror.** $M_4$ ($K_4 = \tfrac12(50\,\mu)(100) = 2.5\,\text{mA/V}^2$) at $100\,\mu\text{A}$: $V_{ov4} = \sqrt{0.1/2.5} = 0.2\,\text{V}$, $V_{SG4} = 1.2\,\text{V}$. $M_3$ has the same $V_{SG}$ and three times the $W/L$:
        $$I_3 = 100\,\mu\text{A}\times\frac{300}{100} = 300\,\mu\text{A}$$

        **Step 3: KCL at the output.** Current into the node from above, $I_2 + I_3$, must equal the current $M_1$ pulls out, $I_1$:
        $$I_2 = I_1 - I_3 = 400 - 300 = 100\,\mu\text{A}$$

        **Step 4: $V_{OUT}$.** $M_2$ ($K_2 = 2.5\,\text{mA/V}^2$) at $100\,\mu\text{A}$: $V_{ov2} = 0.2\,\text{V}$, $V_{SG2} = 1.2\,\text{V}$:
        $$V_{OUT} = 3 - 1.2 = 1.8\,\text{V}$$

        **Check every device.** $M_1$: $V_D = 1.8 \ge V_G - V_{TN} = 0.2$ ✓. $M_3$ (PMOS): $V_D = 1.8 \le V_G + |V_{TP}| = 1.8 + 1 = 2.8$ ✓. $M_2$ is a diode, always saturated ✓.

        !!key Pattern
          When two devices feed one node, KCL decides what the third one carries. A diode-connected load's voltage (and, next part, its $g_m$) follows **its own** current.
      `,
    }),
    P({
      id: 'e2me-1b', src: 'New practice exam E · Problem 1(b) (15 pts)', title: 'Starving the diode raises the gain', big: true,
      q: md`Same circuit, $r_{ds}$ ignored. Find $g_{m1}$, $g_{m2}$ and the gain $A_v = v_{out}/v_{in}$. Then find the gain if $M_3$ were removed, and the $W/L$ of $M_3$ (with $M_4$ unchanged) that would make $A_v = -8$.`,
      fig: E1Fig,
      parts: [
        { lbl: 'g_{m1}', unit: 'mA/V', ans: 4 },
        { lbl: 'g_{m2}', unit: 'mA/V', ans: 1, traps: [{ v: 2, msg: 'That is $g_{m2}$ at $400\\,\\mu\\text{A}$. The diode carries only $I_2 = 100\\,\\mu\\text{A}$.' }] },
        { lbl: 'A_v', unit: '', ans: -4, traps: [{ v: -2, msg: 'That is the gain without $M_3$: use $g_{m2}$ at the diode\'s own current.' }] },
        { lbl: 'A_v\\ (\\text{no } M_3)', unit: '', ans: -2 },
        { lbl: '(W/L)_3\\ \\text{for}\\ A_v = -8', unit: '/1', ans: 375, traps: [{ v: 350, msg: '$g_m \\propto \\sqrt{I}$: doubling the gain needs a quarter of the diode current ($25\\,\\mu\\text{A}$), not half.' }] },
      ],
      hints: [
        md`$g_m = 2I_D/V_{ov}$ for each device, at its own current.`,
        md`For signals, $M_3$ (gate held, $r_{ds}$ ignored) is an open circuit. The output node sees only the diode, $1/g_{m2}$.`,
        md`$g_{m2} = \sqrt{2\mu_pC_{ox}(W/L)_2I_2}$, so $g_{m2} = 0.5\,\text{mA/V}$ needs $I_2 = 25\,\mu\text{A}$.`,
      ],
      sol: md`
        **Recognize it first.** For signals, $M_3$ is a current source (gate held, $r_{ds}$ ignored): an open circuit. So the stage is a plain common source with a diode load, $A_v = -g_{m1}/g_{m2}$. The twist is that $g_{m2}$ belongs to the diode's **own** current, $100\,\mu\text{A}$, not $M_1$'s $400\,\mu\text{A}$.

        **Step 1: both transconductances.**
        $$g_{m1} = \frac{2I_1}{V_{ov1}} = \frac{2(0.4\,\text{m})}{0.2} = 4\,\text{mA/V},\qquad g_{m2} = \frac{2I_2}{V_{ov2}} = \frac{2(0.1\,\text{m})}{0.2} = 1\,\text{mA/V}$$

        **Step 2: $G_M$ and $R_{out}$.** Short the output: $M_1$ pulls $g_{m1}v_{in}$ from the short, so $G_M = g_{m1}$. Zero the input: the output node sees the diode, $1/g_{m2} = 1\kO$ to incremental ground ($V_{DD}$); $M_1$ and $M_3$ are open circuits with $r_{ds}$ ignored.
        $$A_v = -G_MR_{out} = -\frac{g_{m1}}{g_{m2}} = -\frac{4}{1} = -4$$

        **Step 3: without $M_3$.** The diode then carries all $400\,\mu\text{A}$: $V_{ov2} = \sqrt{0.4/2.5} = 0.4\,\text{V}$ and $g_{m2} = 2(0.4\,\text{m})/0.4 = 2\,\text{mA/V}$, so $A_v = -2$ (and $V_{OUT} = 1.6\,\text{V}$).

        **Why starving works.** $g_{m2} = \sqrt{2\mu_pC_{ox}(W/L)_2I_2}$ grows only like $\sqrt{I_2}$. Cutting the diode's current by 4 halves $g_{m2}$, so $1/g_{m2}$ doubles and so does the gain, while $M_1$ (and its $g_{m1}$) is untouched.

        **Step 4: $A_v = -8$.** Need $g_{m2} = 4/8 = 0.5\,\text{mA/V}$:
        $$I_2 = \frac{g_{m2}^2}{2\mu_pC_{ox}(W/L)_2} = \frac{(0.5\,\text{m})^2}{2(50\,\mu)(100)} = \frac{0.25\times10^{-6}}{0.01} = 25\,\mu\text{A}$$
        so $I_3 = 400 - 25 = 375\,\mu\text{A}$, i.e. $(W/L)_3 = 100\times\dfrac{375}{100} = 375/1$. (Check: $V_{OUT} = 3 - 1.1 = 1.9\,\text{V}$, all devices still saturated.)

        **Why not starve it all the way?** As $I_2 \to 0$ the gain becomes the ratio of a tiny difference $I_1 - I_3$ of two big currents, so it is poorly controlled; and $1/g_{m2}$ grows until $r_{ds1}\parallel r_{ds3}$, ignored here, takes over.

        !!mistake The diode's $g_m$ at the wrong current
          Computing $g_{m2}$ at $400\,\mu\text{A}$ gives $-2$, the answer for a circuit without $M_3$. Each device's $g_m$ comes from the current that device carries.

        !!key Pattern
          Diode load: $A_v = -\dfrac{g_{m1}}{g_{m2}} = -\sqrt{\dfrac{\mu_n(W/L)_1I_1}{\mu_p(W/L)_2I_2}}$. A current source beside the diode lowers $I_2$ and raises the gain without moving $M_1$'s bias.
      `,
    }),
    P({
      id: 'e2me-2a', src: 'New practice exam E · Problem 2(a) (20 pts)', title: 'The output node of a folded cascode', big: true,
      q: md`Find $R_{out}$, looking into the output node. $M_1$ is the input transistor (with $v_{in} = 0$ its gate is an incremental ground), $M_3$ is a PMOS current source into the folding node $X$, $M_4$ is a PMOS common-gate device from $X$ to the output, and $M_5$ on $M_6$ (degenerated by $R_S$) is an NMOS cascode current sink. All transistors saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: E2aFig,
      parts: [ex(E2A, ['rds1', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'gm6', 'rds6', 'RS'], 'R_{out}', { ranges: { RS: [300, 1e3], gm6: [2e-3, 3e-3] } })],
      hints: [
        md`$R_{out} = R_{UP}\parallel R_{DN}$. Start at $X$: with every gate held, what does $X$ see besides $M_4$?`,
        md`$R_X = r_{ds1}\parallel r_{ds3}$. Then $M_4$ looking into its drain: $R_{UP} = r_{ds4} + R_X(1 + g_{m4}r_{ds4})$.`,
        md`Down: degenerate twice. $R_6 = r_{ds6} + R_S + g_{m6}r_{ds6}R_S$, then $R_{DN} = r_{ds5} + R_6(1 + g_{m5}r_{ds5})$.`,
      ],
      sol: md`
        **Recognize it first.** The output node of a [folded cascode](#/l/e2-u9-folded). Every gate is held, so each side is the [impedance scaler](#/l/e2-u7-scaler) ("looking into a drain with $R$ at the source: $r_{ds} + R(1 + g_mr_{ds})$") applied once going up and twice going down. Then $R_{out} = R_{UP}\parallel R_{DN}$.

        **Step 1: what $X$ sees.** Two things besides $M_4$: $M_1$ (gate and source at incremental ground) is $r_{ds1}$, and $M_3$ (gate held, source at $V_{DD}$) is $r_{ds3}$:
        $$R_X = r_{ds1}\parallel r_{ds3}$$
        No diode at $X$: unlike Practice Exam 1's folded cascode, nothing makes this a $1/g_m$ node.

        **Step 2: $R_{UP}$.** $M_4$ is a PMOS with its gate held and $R_X$ under its source. Same model as an NMOS:
        $$R_{UP} = r_{ds4} + R_X(1 + g_{m4}r_{ds4}) \approx g_{m4}r_{ds4}\,(r_{ds1}\parallel r_{ds3})$$

        **Step 3: $R_{DN}$, inside out.** First $M_6$ with $R_S$: $R_6 = r_{ds6} + R_S + g_{m6}r_{ds6}R_S \approx r_{ds6}(1 + g_{m6}R_S)$. Then $M_5$ sits on $R_6$:
        $$R_{DN} = r_{ds5} + R_6(1 + g_{m5}r_{ds5}) \approx g_{m5}r_{ds5}\,r_{ds6}(1 + g_{m6}R_S)$$

        **Step 4: combine.**
        $$R_{out} = \left[r_{ds4} + (r_{ds1}\parallel r_{ds3})(1 + g_{m4}r_{ds4})\right]\ \Big\|\ \left[r_{ds5} + (r_{ds6} + R_S + g_{m6}r_{ds6}R_S)(1 + g_{m5}r_{ds5})\right]$$
        $$R_{out} \approx g_{m4}r_{ds4}(r_{ds1}\parallel r_{ds3})\ \Big\|\ g_{m5}r_{ds5}r_{ds6}(1 + g_{m6}R_S)$$

        **Size check.** Both sides are of order $g_mr_{ds}\cdot r_{ds}$, but the up side has only $r_{ds}/2$ under its cascode while the down side has $r_{ds}(1 + g_mR_S)$. So $R_{DN}$ is larger by a factor of about $2(1 + g_{m6}R_S)$, which is 3 to 8 for a modest $R_S$: not large enough to drop either side.

        !!key Pattern
          At a folding node, first add up everything in parallel ($R_X$), then let the common-gate device multiply it by about $g_mr_{ds}$. A cascode is only as good as the resistance under its source.
      `,
    }),
    P({
      id: 'e2me-2b', src: 'New practice exam E · Problem 2(b) (15 pts)', title: 'A cascode whose input gate rides on a divider', big: true,
      q: md`Find $R_{EQ2}$, looking down into $X$. $M_2$ (gate held) is a cascode on top of $M_1$, but $M_1$'s gate is the middle node $G$ of the divider $R_1$, $R_2$ hung from $X$. All transistors saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: E2bFig,
      parts: [ex(E2B, ['gm1', 'rds1', 'gm2', 'rds2', 'R1', 'R2'], 'R_{EQ2}', { ranges: { R1: [1e3, 5e3], R2: [1e3, 5e3] } })],
      hints: [
        md`The divider is its own branch, $R_1 + R_2$, and it moves $M_1$'s gate by $Kv_x$ with $K = R_2/(R_1 + R_2)$.`,
        md`Call $i$ the current down the cascode. $M_1$: $i = g_{m1}Kv_x + v_Y/r_{ds1}$. $M_2$: $i = -g_{m2}v_Y + (v_x - v_Y)/r_{ds2}$.`,
        md`You should find $R_{DN} = \dfrac{r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}{1 + Kg_{m1}r_{ds1}(1 + g_{m2}r_{ds2})}$. Now approximate: what survives?`,
      ],
      sol: md`
        **Recognize it first.** A cascode, but its **input** gate is not held: it sits on a divider hung from the very node we look into. This is the [$K$ rule](#/l/e2-u7-k) applied to a whole cascode: when $X$ moves by $v_x$, $M_1$'s gate moves by $Kv_x$, $K = \dfrac{R_2}{R_1 + R_2}$.

        **Step 1: the divider branch.** The gate draws no current, so $R_1$ and $R_2$ are in series from $X$ to ground ($R_1 + R_2$), and $v_G = Kv_x$ exactly.

        **Step 2: KCL down the cascode.** Call $i$ the current flowing down through $M_2$ and $M_1$ (nothing else touches $Y$, so it is the same current in both). The model current, drain to source, of each:
        $$M_1:\quad i = g_{m1}Kv_x + \frac{v_Y}{r_{ds1}}\qquad\qquad M_2:\quad i = g_{m2}(0 - v_Y) + \frac{v_x - v_Y}{r_{ds2}}$$

        **Step 3: eliminate $v_Y$.** From $M_1$: $v_Y = r_{ds1}(i - g_{m1}Kv_x)$. Put it into $M_2$'s equation and multiply by $r_{ds2}$:
        $$i\,r_{ds2} = -(1 + g_{m2}r_{ds2})\,r_{ds1}(i - g_{m1}Kv_x) + v_x$$
        $$i\left(r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}\right) = v_x\left[1 + Kg_{m1}r_{ds1}(1 + g_{m2}r_{ds2})\right]$$
        $$R_{DN} = \frac{r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}{1 + Kg_{m1}r_{ds1}(1 + g_{m2}r_{ds2})}$$

        **Step 4: approximate.** The numerator is the ordinary cascode, $\approx g_{m2}r_{ds2}r_{ds1}$; the denominator is $\approx Kg_{m1}r_{ds1}\,g_{m2}r_{ds2}$. Everything huge cancels:
        $$R_{DN} \approx \frac{1}{Kg_{m1}} = \frac{R_1 + R_2}{g_{m1}R_2}$$

        **Step 5: combine.**
        $$R_{EQ2} = (R_1 + R_2)\ \Big\|\ R_{DN} \approx (R_1 + R_2)\ \Big\|\ \frac{R_1 + R_2}{g_{m1}R_2} = \frac{R_1 + R_2}{1 + g_{m1}R_2}$$

        **Why the cascode disappears.** A cascode passes $M_1$'s current up unchanged (that is its job), and $M_1$'s current is set by its gate, which watches the output through the divider. So the stack pulls $g_{m1}Kv_x$ for every $v_x$: it looks like $1/(Kg_{m1})$, a few hundred ohms to a few kilohms instead of $g_mr_{ds}^2$.

        **Check:** $K \to 0$ (gate held) gives back $r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}$, the plain cascode.

        !!key The K rule, in general
          A stage with short-circuit transconductance $G_M$ and output resistance $R_{out}$, whose input is driven by $Kv_{out}$, looks like $\dfrac{R_{out}}{1 + KG_MR_{out}}$. One transistor: $G_MR_{out} = g_mr_{ds}$, the usual $K$ rule. A cascode: $G_MR_{out} \approx g_{m1}r_{ds1}\,g_{m2}r_{ds2}$, so it collapses to $\approx 1/(KG_M)$.
      `,
    }),
    P({
      id: 'e2me-3', src: 'New practice exam E · Problem 3(a)–(c) (25 pts)', title: 'The mirror-loaded pair, driven on one side', big: true,
      q: md`$v_{in}$ drives $M_1$; $M_2$'s gate is held; $M_3$ (diode) and $M_4$ form the mirror load; the tail $I_{SS}$ is ideal. The pair is matched ($M_2 = M_1$, $M_4 = M_3$): answer in $g_{m1}$, $r_{ds1}$, $g_{m3}$, $r_{ds3}$. (a) With the output shorted, how much of the short-circuit current arrives through the mirror (5 pts)? Find (b) $G_M$ (8 pts), (c) $R_{out}$ (6 pts) and $A_v = v_{out}/v_{in}$ (6 pts).`,
      fig: E3Fig,
      parts: [
        { lbl: '(a) Output shorted: the share of the short-circuit current that comes through $M_4$ (the mirror path) is about', mc: ['one half', 'all of it', 'none of it', 'one quarter'], a: 0,
          why: [null, 'Then $M_2$ would carry no signal. But $P$ moves (by about $v_{in}/2$), so $M_2$\'s current changes too.', 'Then the mirror would be dead. But $M_1$\'s current change flows into the diode $M_3$, and $M_4$ copies it.', 'The pair splits the signal current evenly, and each half reaches the output once: half each.'] },
        ex(E3GM, ['gm1', 'rds1', 'gm3', 'rds3'], 'G_M'),
        ex(E3RO, ['gm1', 'rds1', 'gm3', 'rds3'], 'R_{out}'),
        ex(`-(${E3GM})*(${E3RO})`, ['gm1', 'rds1', 'gm3', 'rds3'], 'A_v'),
      ],
      hints: [
        md`The tail is open, so $i_{d1} = -i_{d2}$. With the output shorted, $P$ moves by about $v_{in}/2$.`,
        md`Two paths into the short: $M_2$ (its $v_{gs}$ drops as $P$ rises) and $M_4$ (copying the diode current of $M_1$). Both change the output current the same way.`,
        md`$R_{out}$: the chain $M_2 \to P \to M_1 \to$ diode is about $2r_{ds1}$, and the mirror makes the output carry its current twice: $R_{out} \approx r_{ds3}\parallel r_{ds1}$.`,
      ],
      sol: md`
        **Recognize it first.** A [differential pair with a mirror load](#/l/e2-u9-mirror), driven on one side. The tail is ideal (open for signals), so whatever current $M_1$ gains, $M_2$ loses. The signal reaches the output by **two paths**: (1) $M_1$'s current change flows through the diode $M_3$, and $M_4$ copies it into the output; (2) $M_1$ also acts as a source follower that lifts $P$, and $M_2$ (gate held) acts as a common gate from $P$ to the output. Both paths move the output the same way, so they **add**.

        **Step 1: the equations (output shorted).** Unknowns: $v_A$ (the diode node) and $v_P$. Every device uses the same model, current from drain to source; write $g_{ds} = 1/r_{ds}$:
        - $M_1$: $i_1 = g_{m1}(v_{in} - v_P) + g_{ds1}(v_A - v_P)$, flowing from $A$ down to $P$.
        - $M_2$ (gate held, drain on the short): $i_2 = -(g_{m1} + g_{ds1})v_P$.
        - $M_3$ (diode, $A$ to $V_{DD}$): $i_3 = (g_{m3} + g_{ds3})v_A$, flowing from $A$ up to $V_{DD}$.
        - $M_4$ (gate at $A$, drain on the short): $i_4 = g_{m3}v_A$.

        KCL at $P$ (tail open): $i_1 + i_2 = 0$. KCL at $A$ ($i_1$ and $i_3$ both leave $A$): $i_1 + i_3 = 0$.

        **Step 2: solve for $v_P$.** From $P$: $i_1 = (g_{m1} + g_{ds1})v_P$. From $A$: $v_A = -\dfrac{(g_{m1} + g_{ds1})v_P}{g_{m3} + g_{ds3}}$. Put both into $M_1$'s equation:
        $$(g_{m1} + g_{ds1})v_P\left[2 + \frac{g_{ds1}}{g_{m3} + g_{ds3}}\right] = g_{m1}v_{in}\quad\Rightarrow\quad v_P \approx \frac{v_{in}}{2}$$

        **Step 3: the two currents into the short.** The course's $G_M$ counts current from the short **into** the stage, here $i_2 + i_4$:
        - path 2, $M_2$: $i_2 = -(g_{m1} + g_{ds1})v_P \approx -\tfrac12g_{m1}v_{in}$ ($M_2$ pulls less);
        - path 1, the mirror: $i_4 = g_{m3}v_A \approx -\tfrac12g_{m1}v_{in}$ ($M_4$ pushes more in).

        Half each, so the answer to (a) is **one half**. Adding them:
        $$G_M = -g_{m1}\,\frac{1 + \frac{g_{m3}}{g_{m3} + g_{ds3}}}{2 + \frac{g_{ds1}}{g_{m3} + g_{ds3}}} \approx -g_{m1}$$
        Negative: the output moves **with** $v_{in}$ (non-inverting from $M_1$'s gate), and the full $g_{m1}$, not half, thanks to the mirror.

        **Step 4: $R_{out}$ ($v_{in} = 0$).** Apply $v_t$ at the output. Branch 1 is $M_4$: $r_{ds3}$, plus whatever its gate does. Branch 2 is the chain $M_2 \to P \to M_1 \to A$. Looking into $M_2$'s drain, its source sees $M_1$ from the source side with the diode $R_A = \dfrac{1}{g_{m3} + g_{ds3}}$ on $M_1$'s drain, $R_P = \dfrac{r_{ds1} + R_A}{1 + g_{m1}r_{ds1}}$; then
        $$R_{chain} = r_{ds1} + R_P(1 + g_{m1}r_{ds1}) = 2r_{ds1} + R_A\quad(\text{matched})$$
        The chain current $i_c$ flows into the diode and lifts $v_A = i_cR_A$; $M_4$ shares that gate, so the current flowing into $M_4$'s drain grows by $g_{m3}R_Ai_c \approx i_c$: the mirror makes the output carry the chain current **twice**.
        $$i_t = \frac{v_t}{r_{ds3}} + i_c(1 + g_{m3}R_A)\;\Rightarrow\;R_{out} = r_{ds3}\ \Big\|\ \frac{2r_{ds1} + R_A}{1 + g_{m3}R_A} \approx r_{ds3}\parallel r_{ds1}$$

        **Step 5: the gain.**
        $$A_v = -G_MR_{out} \approx +g_{m1}\,(r_{ds1}\parallel r_{ds3}) = g_{m1}(r_{ds2}\parallel r_{ds4})$$

        **Sign check.** $v_{in}$ up → $M_1$ pulls harder → $v_A$ falls → $M_4$ pushes more into the output (up). Meanwhile $P$ rises → $M_2$'s $v_{gs}$ falls → $M_2$ pulls less (up). Both raise $v_{out}$. ✓

        !!key Pattern
          Mirror-loaded pair: $G_M = g_{m1}$ (half the signal current arrives directly, half through the mirror), $R_{out} = r_{ds2}\parallel r_{ds4}$, $|A_v| = g_{m1}(r_{ds2}\parallel r_{ds4})$. Non-inverting from the diode side's gate, inverting from the other.
      `,
    }),
    P({
      id: 'e2me-3d', src: 'New practice exam E · Problem 3(d) (10 pts)', title: 'The same pair in numbers, and the other input', big: true,
      q: md`Same circuit with $I_{SS} = 200\,\mu\text{A}$, every overdrive $0.2\,\text{V}$ and every $r_{ds} = 100\kO$. Find $g_{m1}$, $R_{out}$ and $A_v$. Then: what is the gain if $v_{in}$ drives $M_2$'s gate instead, with $M_1$'s gate held?`,
      fig: E3Fig,
      parts: [
        { lbl: 'g_{m1}', unit: 'mA/V', ans: 1, traps: [{ v: 2, msg: 'Each side carries half the tail current: $100\\,\\mu\\text{A}$.' }] },
        { lbl: 'R_{out}', unit: 'kΩ', ans: 50.25, accept: [50] },
        { lbl: 'A_v', unit: '', ans: 49.75, accept: [50], traps: [{ v: 25, msg: 'That is half: the mirror path doubles $G_M$ to the full $g_{m1}$.' }] },
        { lbl: 'With $v_{in}$ on $M_2$\'s gate instead, $A_v$ is about', mc: ['$-50$', '$+50$', '$-25$', '$0$'], a: 0,
          why: [null, 'Driving $M_2$ directly makes it a common source into the output: that inverts.', 'Both paths still add (the mirror copies $M_1$\'s opposite change), so the magnitude is the same 50.', 'The paths do not cancel: $M_2$ pulls more while $M_4$ pushes less, both pulling the output down.'] },
      ],
      hints: [
        md`Each side carries $I_{SS}/2$; $g_m = 2I_D/V_{ov}$.`,
        md`$R_{out} \approx r_{ds2}\parallel r_{ds4}$; for the exact value use part (c).`,
      ],
      sol: md`
        **Recognize it first.** Put numbers into part (c); then ask what changes when the other gate is driven.

        **Step 1: $g_m$.** Each side carries $I_{SS}/2 = 100\,\mu\text{A}$: $g_{m1} = g_{m3} = \dfrac{2(0.1\,\text{m})}{0.2} = 1\,\text{mA/V}$, so $g_mr_{ds} = 100$.

        **Step 2: $R_{out}$.** $\approx 100\,\text{k}\parallel100\,\text{k} = 50\kO$. Exactly: $R_A = 1/(1.01\,\text{mS}) = 990\,\Omega$, $1 + g_{m3}R_A = 1.990$, so the chain branch is $(200\,\text{k} + 0.99\,\text{k})/1.990 = 101.0\kO$ and $R_{out} = 100\,\text{k}\parallel101.0\,\text{k} = 50.25\kO$.

        **Step 3: $A_v$.** $\approx g_{m1}R_{out} = 1\,\text{m}\times50\,\text{k} = 50$ (exactly $49.75$, since $|G_M| = 0.990\,\text{mA/V}$).

        **Step 4: the other input.** Drive $M_2$ and hold $M_1$: now $M_2$ is the common source into the output, and $M_1$ (driven from $P$) feeds the mirror the opposite current change. $M_2$ pulls more while $M_4$ pushes less: both pull $v_{out}$ down. Same magnitude, opposite sign: $A_v \approx -50$.

        !!key Pattern
          The two gates of a mirror-loaded pair are the $+$ and $-$ inputs of one amplifier: $v_{out} \approx g_m(r_{ds2}\parallel r_{ds4})(v_{g1} - v_{g2})$ when the output is on the $M_2$ side.
      `,
    }),
  ];

  E2.lesson('e2-mocku', { id: 'e2-mockD', title: 'New practice exam D', kind: 'mock', sub: 'A degenerated mirror, gates on diode stacks, a CS stage and its follower', steps: D });
  E2.lesson('e2-mocku', { id: 'e2-mockE', title: 'New practice exam E', kind: 'mock', sub: 'A starved diode load, two cascode resistances, the mirror-loaded differential pair', steps: E });
})();

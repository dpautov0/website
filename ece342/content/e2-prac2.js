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
      parts: [ex(D2A, ['gm1', 'rds1', 'RS', 'gm2', 'rds2', 'gm3', 'rds3'], 'R_{EQ1}')],
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
      parts: [ex(D2B, ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'R3'], 'R_{EQ2}', { ranges: { R3: [1e3, 3e3] } })],
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

  E2.lesson('e2-mocku', { id: 'e2-mockD', title: 'New practice exam D', kind: 'mock', sub: 'A degenerated mirror, gates on diode stacks, a CS stage and its follower', steps: D });
})();

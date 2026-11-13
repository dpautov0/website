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

  // ================================================================== Practice exam F
  const F1Fig = [
    ['w', [0, -1.6], [2, -1.6]], ['rail', [1, -1.6], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['I', [0, -1.6], [0, -0.4], { n: 'I_{REF}', s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [0, -0.4], [0, 0]], ['node', [0, 0], { n: 'B', side: 'l' }],
    ['nmos', [0, 1], { n: 'M_3', sz: '50/1', flip: true, dc: true }], ['node', [0, 2], { n: 'A', side: 'l' }],
    ['nmos', [0, 3], { n: 'M_1', sz: '50/1', flip: true, dc: true }], ['gnd', [0, 4]],
    ['nmos', [2, 1], { n: 'M_4', sz: '200/1' }], ['node', [2, 2], { n: 'X', side: 'r' }],
    ['nmos', [2, 3], { n: 'M_2', sz: '200/1' }], ['gnd', [2, 4]],
    ['R', [2, -1.6], [2, 0], { n: 'R_L' }], ['w', [2, 0], [2.9, 0]], ['term', [2.9, 0], { n: 'V_{OUT}', side: 'r' }],
  ];
  const F1cFig = [
    ['w', [-2, -1.6], [2, -1.6]], ['rail', [1, -1.6], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['I', [-2, -1.6], [-2, -0.4], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [-2, -0.4], [-2, 0]],
    ['nmos', [-2, 1], { n: 'M_B', sz: '?', flip: true, dc: true }], ['gnd', [-2, 2]],
    ['w', [-1, 1], [1, 1], { hops: [0] }], ['node', [0.5, 1], { n: 'V_B', side: 'a' }],
    ['I', [0, -1.6], [0, -0.4], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [0, -0.4], [0, 2]],
    ['nmos', [0, 3], { n: 'M_1', sz: '50/1', flip: true, dc: true }], ['gnd', [0, 4]],
    ['nmos', [2, 1], { n: 'M_4', sz: '200/1' }], ['node', [2, 2], { n: 'X', side: 'r' }],
    ['nmos', [2, 3], { n: 'M_2', sz: '200/1' }], ['gnd', [2, 4]],
    ['R', [2, -1.6], [2, 0], { n: 'R_L' }], ['w', [2, 0], [2.9, 0]], ['term', [2.9, 0], { n: 'V_{OUT}', side: 'r' }],
  ];
  const F2Fig = (b) => [
    ['w', [0.4, -2], [b ? 2 : 0.4, -2]], ['rail', [b ? 1.2 : 0.4, -2], { n: 'V_{DD}' }],
    ['pmos', [0.4, -1], { n: 'M_5', dc: true }], ['w', [0.4, 0], [0.4, 1]], ['w', [0.4, 1], [0.4, 1.6]], ['w', [0.4, 1], [1, 1]], ['node', [0.7, 1], { n: 'N', side: 'a' }],
    ['nmos', [0.4, 2.6], { n: 'M_3', flip: true }], ['gnd', [0.4, 3.6]], ['w', [1.4, 2.6], [1.4, 2], [2, 2]],
    ['nmos', [2, 1], { n: 'M_1' }], ['nmos', [2, 3], { n: 'M_2' }], acgL(1, 3), ['gnd', [2, 4]],
    ...(b ? [['pmos', [2, -1], { n: 'M_4', flip: true }], ['acg', [3, -1]], ['node', [2, 0], { n: 'D', side: 'r' }],
      ['w', [2, 2], [3.2, 2]], look([3.2, 2], 'R_{EQ2}'), ['node', [2.6, 2], { n: 'Y', side: 'a' }]]
      : [['w', [2, 0], [2, -0.5]], lookDn([2, -0.5], 'R_{EQ1}'), ['node', [2, 0], { n: 'D', side: 'r' }], ['node', [2, 2], { n: 'Y', side: 'r' }]]),
  ];
  const F3Fig = [
    ['rail', [1, -3], { n: 'V_{DD}' }], ['pmos', [1, -2], { n: 'M_4' }], acgL(0, -2),
    ['pmos', [1, 0], { n: 'M_3' }], acgL(0, 0), ['w', [1, 1], [2, 1]], out([2, 1], 'v_{out}'),
    ['nmos', [1, 2], { n: 'M_2' }], acgL(0, 2), ['node', [1, 3], { n: 'X', side: 'r' }],
    ['nmos', [1, 4], { n: 'M_1' }], ['w', [0, 4], [-0.5, 4], [-0.5, 4.4]], ...vin(-0.5, 4.4),
    ['R', [1, 5], [1, 6.2], { n: 'R_S' }], ['gnd', [1, 6.2]],
  ];

  const F2BOOST = '(gm3*(rds3 || 1/(gm5 + 1/rds5)))';
  const F3GM = 'gm1/(1 + (gm1 + 1/rds1)*RS + (1/rds1)/(gm2 + 1/rds2))';
  const F3RO = '(rds2 + (rds1 + RS + gm1*rds1*RS)*(1 + gm2*rds2)) || (rds3 + rds4 + gm3*rds3*rds4)';
  const F3R = { ranges: { RS: [300, 2e3] } };

  const Fx = [
    intro('New practice exam F (harder)', [
      '| 1 | 35 | DC and numbers: an NMOS cascode current mirror, its headroom, its output resistance, and the wide-swing fix |',
      '| 2 | 30 | A regulated cascode seen from both ends: looking into the drain, then into the middle node |',
      '| 3 | 35 | The telescopic cascode with a degenerated input: $G_M$, $R_{out}$, $A_v$, and what degeneration costs |',
    ].join('\n    '), md`In Problem 1, $\lambda = 0.1\,\text{V}^{-1}$ for every transistor: use it only for $r_{ds} = 1/(\lambda I_D)$, and ignore it in DC calculations.`),
    P({
      id: 'e2mf-1a', src: 'New practice exam F · Problem 1(a) (15 pts)', title: 'A cascode current mirror: DC and headroom', big: true,
      q: md`$V_{DD} = 5\,\text{V}$, $I_{REF} = 100\,\mu\text{A}$. The diode-connected $M_1$ and $M_3$ ($50/1$ each) are stacked; $M_2$ and $M_4$ ($200/1$ each) copy them into $R_L$. Find the gate voltages $V_A$ and $V_B$, the output current $I_{OUT}$, the voltage $V_X$ at $M_2$'s drain, and the largest $R_L$ that keeps $M_4$ saturated.`,
      fig: F1Fig,
      parts: [
        { lbl: 'V_A', unit: 'V', ans: 1.2 },
        { lbl: 'V_B', unit: 'V', ans: 2.4 },
        { lbl: 'I_{OUT}', unit: 'µA', ans: 400 },
        { lbl: 'V_X', unit: 'V', ans: 1.2 },
        { lbl: 'R_{L,max}', unit: 'kΩ', ans: 9, traps: [{ v: 12, msg: 'That lets $V_{OUT}$ fall to $0.2\\,\\text{V}$, as in a simple mirror. Here $M_4$ needs $V_{OUT} \\ge V_B - V_{TN}$.' }] },
      ],
      hints: [
        md`The whole left stack carries $I_{REF}$. Each $50/1$ diode at $100\,\mu\text{A}$ needs $V_{GS} = 1 + \sqrt{I/K}$.`,
        md`$M_2$ has $M_1$'s $V_{GS}$ and four times its $W/L$. $M_4$ is in series with $M_2$: same current, and its source sits $V_{GS4}$ below $V_B$.`,
        md`$M_4$'s edge of saturation: $V_{OUT} = V_B - V_{TN}$.`,
      ],
      sol: md`
        **Recognize it first.** A **cascode current mirror**. The left stack of two diodes makes two gate voltages: $V_A$ one $V_{GS}$ above ground and $V_B$ two above. On the right, $M_2$ copies the current (its $V_{GS}$ is $M_1$'s) and $M_4$ is a cascode that shields $M_2$ from the output. The price is headroom: the output must stay high enough for $M_4$.

        **Step 1: $V_A$.** $K_1 = \tfrac12(100\,\mu)(50) = 2.5\,\text{mA/V}^2$ at $100\,\mu\text{A}$: $V_{ov} = \sqrt{0.1/2.5} = 0.2\,\text{V}$, so $V_A = V_{GS1} = 1.2\,\text{V}$.

        **Step 2: $V_B$.** $M_3$ carries the same $100\,\mu\text{A}$ (series stack) and is the same size, so $V_{GS3} = 1.2\,\text{V}$ too: $V_B = V_A + V_{GS3} = 2.4\,\text{V}$.

        **Step 3: $I_{OUT}$.** $M_2$ has $V_{GS2} = V_A = 1.2\,\text{V}$, like $M_1$, and four times the $W/L$:
        $$I_{OUT} = 100\,\mu\text{A}\times\frac{200}{50} = 400\,\mu\text{A}$$
        $M_4$ is in series, so it carries $400\,\mu\text{A}$ as well.

        **Step 4: $V_X$.** $M_4$: $K_4 = 10\,\text{mA/V}^2$ at $400\,\mu\text{A}$, $V_{ov4} = 0.2\,\text{V}$, $V_{GS4} = 1.2\,\text{V}$. Its source sits one $V_{GS}$ below its gate:
        $$V_X = V_B - V_{GS4} = 2.4 - 1.2 = 1.2\,\text{V}$$
        Notice $V_X = V_A$: $M_2$ sees exactly the same $V_{DS}$ as $M_1$, so the copy stays accurate even when $\lambda \ne 0$. That is the point of this mirror. Check $M_2$: $V_X = 1.2 \ge V_A - V_{TN} = 0.2\,\text{V}$ ✓ (with a full volt to spare: remember that).

        **Step 5: the largest $R_L$.** $M_4$ stays saturated while $V_{OUT} \ge V_B - V_{TN} = 1.4\,\text{V}$:
        $$R_{L,max} = \frac{5 - 1.4}{0.4\,\text{mA}} = 9\kO$$
        A simple mirror ($M_2$ alone) would allow $V_{OUT}$ down to $0.2\,\text{V}$, i.e. $R_L$ up to $12\kO$.

        !!key Pattern
          Stacked diodes set stacked gate voltages ($V_{GS}$, $2V_{GS}$). A cascode mirror copies accurately (equal $V_{DS}$) but needs $V_{OUT} \ge 2V_{GS} - V_{TN} = V_{TN} + 2V_{ov}$ at the output.
      `,
    }),
    P({
      id: 'e2mf-1b', src: 'New practice exam F · Problem 1(b) (10 pts)', title: 'What the cascode buys: output resistance in numbers', big: true,
      q: md`Same circuit, $\lambda = 0.1\,\text{V}^{-1}$. Find the small-signal resistance $R_{out}$ looking down into $M_4$'s drain (not counting $R_L$), and, for comparison, the output resistance of a simple mirror ($M_2$'s drain directly at the output).`,
      fig: F1Fig,
      parts: [
        { lbl: 'R_{out}\\ (\\text{cascode mirror})', unit: 'MΩ', ans: 2.55, accept: [2.5], traps: [{ v: 0.025, msg: 'That is $r_{ds}$ alone, the simple mirror.' }, { v: 0.05, msg: 'That just adds $r_{ds2} + r_{ds4}$. $M_4$ multiplies what sits under its source by $1 + g_{m4}r_{ds4}$.' }] },
        { lbl: 'R_{out}\\ (\\text{simple mirror})', unit: 'kΩ', ans: 25 },
      ],
      hints: [
        md`Both output devices carry $400\,\mu\text{A}$: $r_{ds} = 1/(\lambda I_D)$, $g_{m4} = 2I_D/V_{ov}$.`,
        md`For signals both gates are fixed (incremental grounds): $M_2$ is just $r_{ds2}$, and $M_4$ is a drain with $r_{ds2}$ under its source.`,
      ],
      sol: md`
        **Recognize it first.** For small signals, $V_A$ and $V_B$ are fixed DC voltages (the reference stack is driven by an ideal source, and gates draw no current), so both gates are incremental grounds. $M_2$ is then a resistor $r_{ds2}$, and $M_4$ is a [drain with that resistor under its source](#/l/e2-u7-scaler).

        **Step 1: the small-signal numbers.** Both devices carry $400\,\mu\text{A}$ at $V_{ov} = 0.2\,\text{V}$:
        $$r_{ds2} = r_{ds4} = \frac{1}{\lambda I_D} = \frac{1}{0.1\times0.4\,\text{mA}} = 25\kO,\qquad g_{m4} = \frac{2(0.4\,\text{m})}{0.2} = 4\,\text{mA/V},\qquad g_{m4}r_{ds4} = 100$$

        **Step 2: the impedance scaler.**
        $$R_{out} = r_{ds4} + r_{ds2}(1 + g_{m4}r_{ds4}) = 25\,\text{k} + 25\,\text{k}\times101 = 2.55\,\text{M}\Omega\ \approx g_{m4}r_{ds4}r_{ds2} = 2.5\,\text{M}\Omega$$

        **Step 3: the simple mirror.** $M_2$ alone, gate held: $R_{out} = r_{ds2} = 25\kO$.

        **What it means.** The cascode multiplies the output resistance by $g_{m4}r_{ds4} \approx 100$ and costs about one $V_{GS}$ of headroom (part (a)). If $V_{OUT}$ is pushed below $1.4\,\text{V}$, $M_4$ enters triode and $R_{out}$ collapses back toward the simple mirror's value.

        !!key Pattern
          Output resistance of a cascode mirror: $r_{ds4} + r_{ds2}(1 + g_{m4}r_{ds4}) \approx g_mr_{ds}^2$, about $g_mr_{ds}$ times that of a simple mirror.
      `,
    }),
    P({
      id: 'e2mf-1c', src: 'New practice exam F · Problem 1(c) (10 pts)', title: 'The wide-swing fix: size the bias diode', big: true,
      q: md`The stack in (a) wastes headroom: $M_2$ has $V_{DS} = 1.2\,\text{V}$ but needs only $0.2\,\text{V}$. So $M_3$ is removed ($M_1$'s drain now takes $I_{REF}$ directly) and $M_4$'s gate is driven by a separate diode-connected $M_B$ carrying its own $100\,\mu\text{A}$. Choose $W/L$ of $M_B$ so that $V_B$ is the **smallest** value that keeps $M_2$ saturated, and find the new lowest $V_{OUT}$ that keeps $M_4$ saturated.`,
      fig: F1cFig,
      parts: [
        { lbl: '(W/L)_B', unit: '/1', ans: 12.5, traps: [{ v: 50, msg: 'A $50/1$ diode gives $V_B = 1.2\\,\\text{V}$: then $V_X = 0$ and $M_2$ is in triode.' }] },
        { lbl: 'V_{OUT,min}', unit: 'V', ans: 0.4, traps: [{ v: 0.2, msg: 'That is only $M_2$\'s headroom. $M_4$ needs its own $V_{ov}$ on top: $V_{OUT} \\ge V_B - V_{TN}$.' }, { v: 1.4, msg: 'That is the old stacked-diode value.' }] },
      ],
      hints: [
        md`$M_2$ saturated: $V_X \ge V_A - V_{TN} = 0.2\,\text{V}$. And $V_X = V_B - V_{GS4}$ with $V_{GS4} = 1.2\,\text{V}$.`,
        md`So $V_B = 1.4\,\text{V}$: $M_B$ needs $V_{ov} = 0.4\,\text{V}$ at $100\,\mu\text{A}$. Solve $K_B = I/V_{ov}^2$ for $W/L$.`,
      ],
      sol: md`
        **Recognize it first.** The "wide-swing" cascode mirror: choose the cascode's gate voltage so the bottom device sits just at the edge of saturation instead of wasting a volt. Two edge conditions, one for each transistor of the output stack.

        **Step 1: the smallest $V_B$.** $M_2$'s gate is $V_A = 1.2\,\text{V}$, so it is saturated while $V_X \ge V_A - V_{TN} = 0.2\,\text{V}$. $M_4$ still carries $400\,\mu\text{A}$ with $V_{GS4} = 1.2\,\text{V}$, so $V_X = V_B - 1.2$:
        $$V_B - 1.2 \ge 0.2\quad\Rightarrow\quad V_{B,min} = 1.4\,\text{V}$$

        **Step 2: size $M_B$.** It must have $V_{GS} = 1.4\,\text{V}$, i.e. $V_{ov} = 0.4\,\text{V}$, at $100\,\mu\text{A}$:
        $$K_B = \frac{I}{V_{ov}^2} = \frac{100\,\mu}{0.16} = 625\,\mu\text{A/V}^2,\qquad \frac WL = \frac{2K_B}{\mu_nC_{ox}} = \frac{1250\,\mu}{100\,\mu} = 12.5\quad(12.5/1)$$
        A quarter of a $50/1$ device: four times smaller $K$ at the same current doubles the overdrive.

        **Step 3: the new lowest output voltage.** $M_4$'s edge: $V_{OUT} = V_B - V_{TN} = 1.4 - 1 = 0.4\,\text{V}$, which is $2V_{ov}$. The output can now swing a full volt lower than in (a).

        **The cost.** $M_2$ now has $V_{DS} = 0.2\,\text{V}$ while $M_1$ has $1.2\,\text{V}$, so with $\lambda \ne 0$ the copy is slightly off; and $M_2$ sits right at the edge, so real designs leave a little margin.

        !!key Pattern
          Wide-swing cascode mirror: bias the cascode gate at $V_{TN} + 2V_{ov}$ (a quarter-size diode at the same current). The output then needs only $2V_{ov}$ instead of $V_{TN} + 2V_{ov}$.
      `,
    }),
    P({
      id: 'e2mf-2a', src: 'New practice exam F · Problem 2(a) (15 pts)', title: 'A regulated cascode with a diode-loaded booster', big: true,
      q: md`Find $R_{EQ1}$, looking down into $M_1$'s drain $D$. $M_2$ (gate held) is a current source under $M_1$. The booster $M_3$ senses $Y$ and drives $M_1$'s gate $N$; its load is the diode-connected PMOS $M_5$. All transistors saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: F2Fig(false),
      parts: [ex(`rds1 + rds2 + gm1*rds1*(1 + ${F2BOOST})*rds2`, ['gm1', 'rds1', 'rds2', 'gm3', 'rds3', 'gm5', 'rds5'], 'R_{EQ1}')],
      hints: [
        md`Find the booster's gain first: $N$ sees $r_{ds3}$ and the diode $1/(g_{m5} + g_{ds5})$, so $v_N = -Av_Y$ with $A = g_{m3}\left(r_{ds3}\parallel\dfrac{1}{g_{m5} + g_{ds5}}\right) \approx \dfrac{g_{m3}}{g_{m5}}$.`,
        md`Then $M_1$'s $v_{gs} = -Av_Y - v_Y$. Redo the degenerated-drain KCL with $v_Y = ir_{ds2}$.`,
      ],
      sol: md`
        **Recognize it first.** A **regulated (gain-boosted) cascode**: $M_1$ is a cascode on the current source $M_2$, but its gate is not held. The booster $M_3$, a common source with the PMOS diode $M_5$ as its load, watches $Y$ and drives $M_1$'s gate the opposite way. A diode load gives a small, well-defined booster gain, $A \approx g_{m3}/g_{m5}$ (Practice Exam 2 used a current-source load, $A \approx g_mr_{ds}$).

        **Step 1: the booster's gain.** Node $N$ sees $r_{ds3}$ (down through $M_3$) and the diode $M_5$, $\dfrac{1}{g_{m5} + g_{ds5}}$ (up to $V_{DD}$); $M_1$'s gate draws nothing. $M_3$ pulls $g_{m3}v_Y$ out of $N$:
        $$v_N = -Av_Y,\qquad A = g_{m3}\left(r_{ds3}\parallel\frac{1}{g_{m5} + g_{ds5}}\right) \approx \frac{g_{m3}}{g_{m5}}$$

        **Step 2: KCL looking into $D$.** Apply $v_x$; the current $i$ flows down through $M_1$ and then $r_{ds2}$ (the gate of $M_3$ takes none), so $v_Y = ir_{ds2}$. $M_1$'s gate is at $-Av_Y$, its source at $v_Y$:
        $$i = g_{m1}(-Av_Y - v_Y) + \frac{v_x - v_Y}{r_{ds1}} = -g_{m1}(1 + A)v_Y + \frac{v_x - v_Y}{r_{ds1}}$$

        **Step 3: solve.** Put $v_Y = ir_{ds2}$ in and multiply by $r_{ds1}$:
        $$i\,r_{ds1} + g_{m1}(1 + A)r_{ds1}r_{ds2}\,i + i\,r_{ds2} = v_x\;\Rightarrow\;R_{EQ1} = r_{ds1} + r_{ds2} + g_{m1}r_{ds1}(1 + A)r_{ds2}$$
        $$R_{EQ1} \approx g_{m1}r_{ds1}r_{ds2}\left(1 + \frac{g_{m3}}{g_{m5}}\right)$$

        **Intuition.** In a plain cascode $v_{gs1} = -v_Y$. Here $v_{gs1} = -(1 + A)v_Y$: any rise of $Y$ is fought $(1 + A)$ times harder, so $Y$ moves $(1 + A)$ times less, the current changes $(1 + A)$ times less, and the resistance is $(1 + A)$ times bigger. $A = 0$ gives the plain cascode back.

        !!key Pattern
          Regulated cascode: $R = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + A)R_Y$, where $A$ is the inverting gain from $M_1$'s source to its gate.
      `,
    }),
    P({
      id: 'e2mf-2b', src: 'New practice exam F · Problem 2(b) (15 pts)', title: 'The same loop, looked at from the middle', big: true,
      q: md`Now a PMOS current source $M_4$ (gate held) sits on top of $D$. Find $R_{EQ2}$, looking into the middle node $Y$ (where $M_1$'s source, $M_2$'s drain and $M_3$'s gate meet). Same assumptions.`,
      fig: F2Fig(true),
      parts: [ex(`rds2 || ((rds1 + rds4)/(1 + gm1*rds1*(1 + ${F2BOOST})))`, ['gm1', 'rds1', 'rds2', 'gm3', 'rds3', 'gm5', 'rds5', 'rds4'], 'R_{EQ2}')],
      hints: [
        md`Two branches at $Y$: $r_{ds2}$ down, and $M_1$ up (its drain sees only $r_{ds4}$).`,
        md`Looking into a source with $R_D$ at the drain gives $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ when the gate is held. Here the gate moves by $-Av_Y$: redo the KCL.`,
        md`You should find the $M_1$ branch $= \dfrac{r_{ds1} + r_{ds4}}{1 + g_{m1}r_{ds1}(1 + A)}$.`,
      ],
      sol: md`
        **Recognize it first.** The same feedback loop, seen from the middle node. At $Y$ there are two branches: $r_{ds2}$ (down) and $M_1$ seen from its **source**, with $r_{ds4}$ on its drain. Normally [looking into a source](#/l/e2-u7-three) gives $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$; here the gate moves **against** the source by $A$, which makes it $(1 + A)$ times stiffer.

        **Step 1: the booster** (as in part (a)): $v_N = -Av_y$, $A = g_{m3}\left(r_{ds3}\parallel\dfrac{1}{g_{m5} + g_{ds5}}\right)$.

        **Step 2: $M_1$'s drain.** $D$ touches only $M_1$ and $M_4$; $M_4$ (gate held, source at $V_{DD}$) is $r_{ds4}$ to incremental ground. So the current $i_{d1}$ flowing down from $D$ into $M_1$ must come up through $r_{ds4}$: $v_D = -i_{d1}r_{ds4}$.

        **Step 3: $M_1$'s model.** Drain to source, with the gate at $-Av_y$:
        $$i_{d1} = g_{m1}(-Av_y - v_y) + \frac{v_D - v_y}{r_{ds1}} = -g_{m1}(1 + A)v_y + \frac{-i_{d1}r_{ds4} - v_y}{r_{ds1}}$$
        Multiply by $r_{ds1}$ and collect $i_{d1}$:
        $$i_{d1}(r_{ds1} + r_{ds4}) = -v_y\left[1 + g_{m1}r_{ds1}(1 + A)\right]$$
        The test source pushes $-i_{d1}$ up into $M_1$'s source, so this branch is
        $$\frac{r_{ds1} + r_{ds4}}{1 + g_{m1}r_{ds1}(1 + A)}$$

        **Step 4: combine.**
        $$R_{EQ2} = r_{ds2}\ \Big\|\ \frac{r_{ds1} + r_{ds4}}{1 + g_{m1}r_{ds1}(1 + A)} \approx \frac{1 + r_{ds4}/r_{ds1}}{g_{m1}\,(1 + g_{m3}/g_{m5})}$$

        **Check.** $A = 0$ gives $\dfrac{r_{ds1} + r_{ds4}}{1 + g_{m1}r_{ds1}}$, about $2/g_{m1}$ for equal $r_{ds}$: looking into a source with a current source on the drain is **not** $1/g_m$. The booster divides it further by $1 + A$.

        !!key Pattern
          A gate driven against its own source by $A$ multiplies that transistor's $g_m$ by $(1 + A)$: the drain side looks $(1 + A)$ times bigger (part a), the source side $(1 + A)$ times smaller (part b).
      `,
    }),
    P({
      id: 'e2mf-3', src: 'New practice exam F · Problem 3 (35 pts)', title: 'Telescopic cascode with a degenerated input', big: true,
      q: md`$M_1$ (input, degenerated by $R_S$) and the cascode $M_2$ form the amplifying stack; $M_3$ on $M_4$ is a PMOS cascode current-source load. All marked gates are held. Find $G_M$ (10 pts), $R_{out}$ (10 pts) and $A_v = v_{out}/v_{in}$ (8 pts). Then answer the multiple-choice question about $R_S$ (7 pts).`,
      fig: F3Fig,
      parts: [
        ex(F3GM, ['gm1', 'rds1', 'RS', 'gm2', 'rds2'], 'G_M', F3R),
        ex(F3RO, ['gm1', 'rds1', 'RS', 'gm2', 'rds2', 'gm3', 'rds3', 'rds4'], 'R_{out}', F3R),
        ex(`-(${F3GM})*(${F3RO})`, ['gm1', 'rds1', 'RS', 'gm2', 'rds2', 'gm3', 'rds3', 'rds4'], 'A_v', F3R),
        { lbl: 'Suppose $g_{m1}R_S \\gg 1$, so $R_{DN} \\gg R_{UP}$. Doubling $R_S$ changes $|A_v|$ by about', mc: ['a factor $\\tfrac12$', 'nothing: $G_MR_{out}$ stays $\\approx g_mr_{ds}\\cdot g_mr_{ds}$', 'a factor 2', 'a factor $\\tfrac14$'], a: 0,
          why: [null, 'That invariance holds only when $R_{out} = R_{DN}$. Here $R_{out}$ is pinned near $R_{UP}$, which $R_S$ does not touch.', 'Degeneration never raises the gain: $G_M$ falls and $R_{out}$ cannot exceed $R_{UP}$.', '$R_S$ enters $G_M \\approx 1/R_S$ once; $R_{out} \\approx R_{UP}$ does not depend on it.'] },
      ],
      hints: [
        md`$G_M$: the cascode passes the bottom device's current. With the output shorted, $X$ sees $M_2$'s source, $\approx 1/g_{m2}$, which barely degenerates $M_1$'s drain. So $G_M \approx g_{m1}/(1 + g_{m1}R_S)$.`,
        md`$R_{DN}$: degenerate twice: $R_X = r_{ds1} + R_S + g_{m1}r_{ds1}R_S$, then $r_{ds2} + R_X(1 + g_{m2}r_{ds2})$. $R_{UP} = r_{ds3} + r_{ds4} + g_{m3}r_{ds3}r_{ds4}$.`,
      ],
      sol: md`
        **Recognize it first.** A **telescopic cascode**: degenerated common source ($M_1$ with $R_S$), NMOS cascode ($M_2$), PMOS cascode load ($M_3$ on $M_4$). $G_M$ comes from the bottom of the stack (a cascode only passes current), and $R_{out} = R_{DN}\parallel R_{UP}$, each a stacked [impedance scaler](#/l/e2-u7-scaler).

        **Step 1: $G_M$ (output shorted).** One current $i$ flows down through $M_2$, $M_1$ and $R_S$ (nothing else touches $X$ or $S$). $M_2$, gate held, drain on the short: $i = -(g_{m2} + g_{ds2})v_X$, so $v_X = -\dfrac{i}{g_{m2} + g_{ds2}}$. $M_1$, with $v_S = iR_S$:
        $$i = g_{m1}(v_{in} - iR_S) + \frac{v_X - iR_S}{r_{ds1}}$$
        Substitute $v_X$ and collect $i$:
        $$G_M = \frac{i}{v_{in}} = \frac{g_{m1}}{1 + (g_{m1} + g_{ds1})R_S + \dfrac{g_{ds1}}{g_{m2} + g_{ds2}}} \approx \frac{g_{m1}}{1 + g_{m1}R_S}$$

        **Step 2: $R_{DN}$ ($v_{in} = 0$).** $M_1$ with $R_S$: $R_X = r_{ds1} + R_S + g_{m1}r_{ds1}R_S$. Then $M_2$ on top of $R_X$:
        $$R_{DN} = r_{ds2} + R_X(1 + g_{m2}r_{ds2}) \approx g_{m2}r_{ds2}\,r_{ds1}(1 + g_{m1}R_S)$$

        **Step 3: $R_{UP}$.** $M_4$ is $r_{ds4}$; $M_3$ (PMOS, same model) sits on it:
        $$R_{UP} = r_{ds3} + r_{ds4} + g_{m3}r_{ds3}r_{ds4} \approx g_{m3}r_{ds3}r_{ds4}$$

        **Step 4: the gain.**
        $$A_v = -G_M\,(R_{DN}\parallel R_{UP}) \approx -\frac{g_{m1}}{1 + g_{m1}R_S}\Big[g_{m2}r_{ds2}r_{ds1}(1 + g_{m1}R_S)\parallel g_{m3}r_{ds3}r_{ds4}\Big]$$

        **What degeneration costs.** If the load were ideal ($R_{UP} \to \infty$), $R_{out} = R_{DN}$ and $G_MR_{DN} \approx g_{m1}r_{ds1}g_{m2}r_{ds2}$, independent of $R_S$: degeneration would be free. With a real load, $R_{out}$ can never exceed $R_{UP}$; once $R_{DN} \gg R_{UP}$, $|A_v| \approx G_MR_{UP} \approx \dfrac{g_{m3}r_{ds3}r_{ds4}}{R_S}$, so doubling $R_S$ roughly **halves** the gain. Numbers (all $g_m = 1\,\text{mA/V}$, $r_{ds} = 100\kO$): $|A_v| = 5050$ with $R_S = 0$, $3370$ at $1\kO$, $840$ at $10\kO$, $460$ at $20\kO$.

        !!key Pattern
          In a cascode amplifier, compare $R_{UP}$ and $R_{DN}$ before simplifying. "$G_MR_{out}$ is unchanged by degeneration" is true only when the degenerated side sets $R_{out}$.
      `,
    }),
  ];

  // ================================================================== Practice exam G
  const G1Fig = [
    ['w', [-3, -0.4], [6, -0.4]], ['rail', [2, -0.4], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['I', [-3, -0.4], [-3, 0.8], { n: 'I_{REF}', s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [-3, 0.8], [-3, 3.6]],
    ['nmos', [-3, 4.6], { n: 'M_8', sz: '50/1', flip: true, dc: true }], ['gnd', [-3, 5.6]],
    ['w', [-2, 4.6], [0.4, 4.6], [1, 4.6]], ['w', [0.4, 4.6], [0.4, 6.2], [5, 6.2], [5, 3.6]],
    ['pmos', [1, 0.6], { n: 'M_3', sz: '100/1', flip: true, dc: true }], ['pmos', [3, 0.6], { n: 'M_4', sz: '100/1' }],
    ['node', [1, 1.6], { n: 'A', side: 'l' }],
    ['nmos', [1, 2.6], { n: 'M_1', sz: '200/1' }], ['nmos', [3, 2.6], { n: 'M_2', sz: '200/1', flip: true }],
    ['w', [0, 2.6], [-0.4, 2.6]], ['term', [-0.4, 2.6], { n: 'V_{CM} + v_{in}', side: 'l' }],
    ['w', [4, 2.6], [4.3, 2.6]], ['term', [4.3, 2.6], { n: 'V_{CM}', side: 'r' }],
    ['w', [1, 3.6], [2, 3.6], [3, 3.6]], ['node', [2, 3.6], { n: 'P', side: 'a' }],
    ['nmos', [2, 4.6], { n: 'M_5', sz: '100/1' }], ['gnd', [2, 5.6]],
    ['w', [3, 1.6], [5, 1.6]], ['node', [4, 1.6], { n: 'O_1', side: 'a' }],
    ['pmos', [6, 1.6], { n: 'M_6', sz: '?' }], ['w', [6, 0.6], [6, -0.4]],
    ['nmos', [6, 3.6], { n: 'M_7', sz: '200/1' }], ['gnd', [6, 4.6]],
    ['w', [6, 2.6], [6.8, 2.6]], ['term', [6.8, 2.6], { n: 'V_{OUT}', side: 'r' }],
  ];
  const G2Fig = (b) => [
    ...(b ? [['rail', [1, -2], { n: 'V_{DD}' }], ['pmos', [1, -1], { n: 'M_3', flip: true }], ['acg', [2, -1]]]
      : [['rail', [1, -1.2], { n: 'V_{DD}' }], ['I', [1, -1.2], [1, 0], { n: 'I_B', side: 'r' }]]),
    ['node', [1, 0], { n: 'A', side: 'r' }], ['w', [1, 0], [-0.2, 0], [-0.2, 3], [0, 3]],
    ['nmos', [1, 1], { n: 'M_1', flip: true }], ['acg', [2, 1]],
    ['w', [1, 2], [2.4, 2]], look([2.4, 2], b ? 'R_{X2}' : 'R_{X1}'), ['node', [1.6, 2], { n: 'X', side: 'a' }],
    ['nmos', [1, 3], { n: 'M_2' }], ['gnd', [1, 4]],
  ];

  const G3GM = 'gm1*(1 + gm3/(gm3 + 1/rds3))/(2 + (1/rds1)/(gm3 + 1/rds3))';
  const G3RO = '(rds3 || ((2*rds1 + 1/(gm3 + 1/rds3))/(1 + gm3/(gm3 + 1/rds3))))';
  const G3A1 = `${G3GM}*${G3RO}`;

  const G = [
    intro('New practice exam G (hardest)', [
      '| 1 | 35 | DC of a two-stage op amp: currents, the input common-mode range, sizing the second stage for zero systematic offset, the output swing |',
      '| 2 | 30 | The flipped voltage follower: why its output resistance is tiny, with an ideal and with a real current source |',
      '| 3 | 35 | The same op amp\'s gain: the mirror-loaded pair, the second stage, which input inverts, and the numbers |',
    ].join('\n    '), md`In Problems 1 and 3, $\lambda = 0.1\,\text{V}^{-1}$ for every transistor: use it only for $r_{ds} = 1/(\lambda I_D)$, and ignore it in DC calculations.`),
    P({
      id: 'e2mg-1a', src: 'New practice exam G · Problem 1(a)–(b) (20 pts)', title: 'A two-stage op amp: bias and input range', big: true,
      q: md`Both inputs sit at the same DC voltage $V_{CM}$. $I_{REF} = 100\,\mu\text{A}$ flows into the diode $M_8$; $M_5$ (the tail) and $M_7$ copy it. Find (a) the tail current $I_5$, $V_{GS1}$, and the voltage $V_A$ at the diode node of the mirror load (10 pts); (b) the lowest and highest $V_{CM}$ that keep every transistor of the first stage saturated (10 pts).`,
      fig: G1Fig,
      parts: [
        { lbl: 'I_5', unit: 'µA', ans: 200 },
        { lbl: 'V_{GS1}', unit: 'V', ans: 1.1, traps: [{ v: 1 + Math.sqrt(0.02), msg: 'Each input transistor carries half of the tail current, $100\\,\\mu\\text{A}$.' }] },
        { lbl: 'V_A', unit: 'V', ans: 3.8 },
        { lbl: 'V_{CM,min}', unit: 'V', ans: 1.3, traps: [{ v: 1.1, msg: 'That puts $P$ at $0$: the tail $M_5$ needs $V_P \\ge V_{G5} - V_{TN} = 0.2\\,\\text{V}$.' }] },
        { lbl: 'V_{CM,max}', unit: 'V', ans: 4.8, traps: [{ v: 2.8, msg: 'NMOS saturation is $V_D \\ge V_G - V_{TN}$: here $3.8 \\ge V_{CM} - 1$.' }] },
      ],
      hints: [
        md`$M_8$ ($50/1$) at $100\,\mu\text{A}$ sets $V_{GS8}$; $M_5$ shares it with twice the $W/L$. With equal inputs, symmetry splits the tail current in half.`,
        md`$V_A = V_{DD} - V_{SG3}$, from the PMOS square law at $100\,\mu\text{A}$.`,
        md`Low end: the tail needs $V_P \ge V_{G5} - V_{TN}$, and $V_P = V_{CM} - V_{GS1}$. High end: $M_1$ needs $V_A \ge V_{CM} - V_{TN}$.`,
      ],
      sol: md`
        **Recognize it first.** A **two-stage op amp**. Bias: $I_{REF}$ into the diode $M_8$ makes one gate voltage that $M_5$ (the tail) and $M_7$ (the second stage's sink) copy by size. Stage 1: the NMOS pair $M_1$, $M_2$ with the PMOS mirror load $M_3$, $M_4$. Stage 2: the PMOS common source $M_6$ with $M_7$ as its load. With both inputs at $V_{CM}$, symmetry splits the tail current equally.

        **Step 1: the bias line.** $M_8$: $K_8 = \tfrac12(100\,\mu)(50) = 2.5\,\text{mA/V}^2$ at $100\,\mu\text{A}$: $V_{ov8} = 0.2\,\text{V}$, $V_{GS8} = 1.2\,\text{V}$. $M_5$ has the same $V_{GS}$ and twice the $W/L$:
        $$I_5 = 100\,\mu\text{A}\times\frac{100}{50} = 200\,\mu\text{A}$$

        **Step 2: the input pair.** $100\,\mu\text{A}$ each. $K_1 = \tfrac12(100\,\mu)(200) = 10\,\text{mA/V}^2$:
        $$V_{ov1} = \sqrt{\frac{0.1\,\text{m}}{10\,\text{m}}} = 0.1\,\text{V},\qquad V_{GS1} = 1.1\,\text{V}$$

        **Step 3: the mirror load.** $M_3$: $K_3 = \tfrac12(50\,\mu)(100) = 2.5\,\text{mA/V}^2$ at $100\,\mu\text{A}$: $V_{ov3} = 0.2\,\text{V}$, $V_{SG3} = 1.2\,\text{V}$:
        $$V_A = 5 - 1.2 = 3.8\,\text{V}$$
        (At balance $O_1$ sits at the same $3.8\,\text{V}$; part (c) uses that.)

        **Step 4: the lowest $V_{CM}$.** The tail $M_5$ (gate at $1.2\,\text{V}$) is saturated while $V_P \ge 1.2 - 1 = 0.2\,\text{V}$. The sources sit one $V_{GS1}$ below the inputs, $V_P = V_{CM} - 1.1$:
        $$V_{CM} - 1.1 \ge 0.2\quad\Rightarrow\quad V_{CM,min} = 1.3\,\text{V}$$

        **Step 5: the highest $V_{CM}$.** $M_1$'s drain is $V_A = 3.8\,\text{V}$ and its gate is $V_{CM}$; it stays saturated while $3.8 \ge V_{CM} - 1$:
        $$V_{CM,max} = 4.8\,\text{V}$$
        ($M_2$ gives the same limit, its drain $O_1$ also being at $3.8\,\text{V}$.)

        !!key Pattern
          Input common-mode range of an NMOS pair: from $V_{GS1} + V_{ov,tail}$ (the tail runs out of room) up to $V_{D1} + V_{TN}$ (the input devices hit triode).
      `,
    }),
    P({
      id: 'e2mg-1c', src: 'New practice exam G · Problem 1(c)–(d) (15 pts)', title: 'Sizing M6, and how far the output can swing', big: true,
      q: md`Same circuit. (c) Find $I_7$, and the $W/L$ of $M_6$ that makes the op amp balanced: with equal inputs, $O_1$ sits at $V_A$ and $M_6$ carries exactly $I_7$ (no systematic offset) (10 pts). (d) Find the lowest and highest $V_{OUT}$ with $M_6$ and $M_7$ both saturated (5 pts).`,
      fig: G1Fig,
      parts: [
        { lbl: 'I_7', unit: 'µA', ans: 400 },
        { lbl: '(W/L)_6', unit: '/1', ans: 400, traps: [{ v: 100, msg: 'Same size as $M_4$ would carry $100\\,\\mu\\text{A}$, but $M_7$ forces $400\\,\\mu\\text{A}$ through $M_6$.' }] },
        { lbl: 'V_{OUT,min}', unit: 'V', ans: 0.2 },
        { lbl: 'V_{OUT,max}', unit: 'V', ans: 4.8 },
      ],
      hints: [
        md`$M_7$ copies $M_8$ by size. At balance $V_{O1} = V_A$, so $V_{SG6} = V_{SG3} = 1.2\,\text{V}$.`,
        md`Same $V_{SG}$ as $M_4$: currents scale with $W/L$. $M_6$ must carry $I_7$.`,
        md`$M_6$ saturated: $V_{OUT} \le V_{G6} + |V_{TP}|$. $M_7$ saturated: $V_{OUT} \ge V_{G7} - V_{TN}$.`,
      ],
      sol: md`
        **Recognize it first.** The second stage's current is set **twice**: $M_7$ forces $I_7$ (a mirror copy), and $M_6$'s $V_{SG}$ is set by $O_1$. If the two disagree, the high-gain output runs into a rail: a *systematic offset*. At balance $O_1 = V_A$ (then $M_4$ has the same $V_{SD}$ as $M_3$ and copies its current exactly), so $M_6$ must carry $I_7$ at $V_{SG6} = V_{SG3}$.

        **Step 1: $I_7$.** $M_7$ ($200/1$) has $M_8$'s $V_{GS}$ and four times its $W/L$: $I_7 = 400\,\mu\text{A}$.

        **Step 2: size $M_6$.** $V_{SG6} = 5 - 3.8 = 1.2\,\text{V}$, $V_{ov6} = 0.2\,\text{V}$, and it must carry $400\,\mu\text{A}$:
        $$K_6 = \frac{0.4\,\text{m}}{0.2^2} = 10\,\text{mA/V}^2,\qquad \frac WL = \frac{2K_6}{\mu_pC_{ox}} = \frac{20\,\text{m}}{50\,\mu} = 400\quad(400/1)$$
        Quicker: $M_6$ and $M_4$ share $V_{SG}$, so $\dfrac{(W/L)_6}{(W/L)_4} = \dfrac{I_6}{I_4} = \dfrac{400}{100} = 4$. (The textbook form is $\dfrac{(W/L)_6}{(W/L)_4} = 2\dfrac{(W/L)_7}{(W/L)_5}$, here $2\times2$.)

        A nonlinear solve of this circuit confirms the point: with $400/1$ the output sits well inside the supply (about $2.9\,\text{V}$ in that solve); with $300/1$ it drops to about $0.1\,\text{V}$, with $500/1$ it rises to about $4.9\,\text{V}$. The open-loop gain is thousands, so a few percent of current mismatch saturates the output.

        **Step 3: output swing.** $M_6$'s gate is $O_1 = 3.8\,\text{V}$; PMOS saturation: $V_{OUT} \le 3.8 + 1 = 4.8\,\text{V}$. $M_7$'s gate is $1.2\,\text{V}$; NMOS saturation: $V_{OUT} \ge 1.2 - 1 = 0.2\,\text{V}$. The output can swing from $0.2$ to $4.8\,\text{V}$, within one $V_{ov}$ of each rail.

        !!key Pattern
          Two devices in series that both "set" the current: size one so they agree at the intended bias point. A common source with a current-source load swings to within $V_{ov}$ of each rail.
      `,
    }),
    P({
      id: 'e2mg-2a', src: 'New practice exam G · Problem 2(a) (15 pts)', title: 'The flipped voltage follower', big: true,
      q: md`$M_1$'s gate is held at a bias voltage; its drain $A$ is fed by an ideal current source $I_B$ and drives $M_2$'s gate; $M_2$'s drain is $M_1$'s source, node $X$. Find $R_{X1}$, the resistance looking into $X$, and its value for $g_{m1} = g_{m2} = 1\,\text{mA/V}$ and $r_{ds1} = r_{ds2} = 100\kO$. All transistors saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: G2Fig(false),
      parts: [
        ex('rds2 || 1/(gm2*(1 + gm1*rds1))', ['gm1', 'rds1', 'gm2', 'rds2'], 'R_{X1}'),
        { lbl: 'R_{X1}\\ (\\text{numbers})', unit: 'Ω', ans: 9.9, accept: [10], traps: [{ v: 1000, msg: 'That is $1/g_{m1}$, a plain follower. Here $M_2$ supplies the current, driven by a gain of $1 + g_{m1}r_{ds1}$.' }, { v: 500, msg: 'That is $1/(g_{m1} + g_{m2})$: two followers in parallel. This circuit has feedback.' }] },
      ],
      hints: [
        md`Node $A$ connects only to $I_B$ (open for signals), $M_2$'s gate (no current) and $M_1$'s drain. So what is $M_1$'s small-signal current?`,
        md`$M_1$'s current is zero: $0 = g_{m1}(0 - v_x) + (v_A - v_x)/r_{ds1}$, so $v_A = (1 + g_{m1}r_{ds1})v_x$.`,
        md`All the test current goes into $M_2$: $i_t = g_{m2}v_A + v_x/r_{ds2}$.`,
      ],
      sol: md`
        **Recognize it first.** It looks like a source follower ($M_1$, gate held, output at its source $X$), but $M_1$'s drain does not go to $V_{DD}$: it goes to node $A$, which touches only an ideal current source and a gate. So $M_1$ can carry **no** signal current. The job of absorbing the test current falls to $M_2$, whose gate is $A$: a feedback loop, the *flipped voltage follower*.

        **Step 1: $M_1$ carries no signal current.** KCL at $A$: $I_B$ is an open circuit for signals and $M_2$'s gate draws nothing, so $M_1$'s drain current is zero. With the gate at incremental ground and the source at $v_x$:
        $$0 = g_{m1}(0 - v_x) + \frac{v_A - v_x}{r_{ds1}}\quad\Rightarrow\quad v_A = (1 + g_{m1}r_{ds1})\,v_x$$
        $M_1$ is a common gate (input at its source) with an **infinite** load: its voltage gain is the full $1 + g_{m1}r_{ds1}$, about 100.

        **Step 2: $M_2$ takes all the test current.** Its gate is at $v_A$, its source grounded, its drain at $X$:
        $$i_t = g_{m2}v_A + \frac{v_x}{r_{ds2}} = \left[g_{m2}(1 + g_{m1}r_{ds1}) + \frac{1}{r_{ds2}}\right]v_x$$

        **Step 3: the resistance.**
        $$R_{X1} = r_{ds2}\ \Big\|\ \frac{1}{g_{m2}(1 + g_{m1}r_{ds1})} \approx \frac{1}{g_{m1}g_{m2}r_{ds1}}$$

        **Step 4: numbers.** $g_{m2}(1 + g_{m1}r_{ds1}) = 1\,\text{m}\times101 = 101\,\text{mS}$, so $1/(101\,\text{mS}) = 9.90\,\Omega$; $r_{ds2} = 100\kO$ in parallel changes nothing: $R_{X1} \approx 10\,\Omega$. A plain follower would give $1/g_{m1} = 1\kO$: a hundred times more.

        **Physical picture.** Push $X$ up a little. $M_1$, unable to change its current, passes the move to $A$ amplified a hundred times; $M_2$ sees that big gate swing and pulls hard on $X$, holding it almost still. The loop makes $X$ about $g_{m2}r_{ds1}$ times stiffer than a plain follower's $1/g_{m1}$.

        !!key Pattern
          A transistor whose drain sees only a current source carries no signal current: it becomes a voltage amplifier of gain $1 + g_mr_{ds}$ from its source to its drain. Closing a loop through it divides a node's resistance by that gain.
      `,
    }),
    P({
      id: 'e2mg-2b', src: 'New practice exam G · Problem 2(b) (15 pts)', title: 'The same follower with a real current source', big: true,
      q: md`Replace $I_B$ by the PMOS current source $M_3$ (gate held). Find $R_{X2}$, and its value with every $g_m = 1\,\text{mA/V}$ and every $r_{ds} = 100\kO$. Same assumptions.`,
      fig: G2Fig(true),
      parts: [
        ex('1/(1/rds2 + (gm2 + 1/rds3)*(1 + gm1*rds1)*rds3/(rds1 + rds3))', ['gm1', 'rds1', 'gm2', 'rds2', 'rds3'], 'R_{X2}'),
        { lbl: 'R_{X2}\\ (\\text{numbers})', unit: 'Ω', ans: 19.6, accept: [20], traps: [{ v: 9.9, msg: 'That is part (a). Now $A$ has $r_{ds3}$ to ground, so $M_1$\'s gain drops to $g_{m1}(r_{ds1}\\parallel r_{ds3})$.' }] },
      ],
      hints: [
        md`Now $A$ has $r_{ds3}$ to incremental ground, so $M_1$ does carry current. $M_1$ is a common gate from $X$ to $A$ with load $r_{ds3}$.`,
        md`KCL at $A$: $v_A/r_{ds3} + i_{d1} = 0$ gives $v_A = \dfrac{(1 + g_{m1}r_{ds1})\,r_{ds3}}{r_{ds1} + r_{ds3}}\,v_x \approx g_{m1}(r_{ds1}\parallel r_{ds3})\,v_x$.`,
        md`The test current now feeds $M_2$ **and** flows up through $M_1$ into $r_{ds3}$: $i_t = v_x/r_{ds2} + (g_{m2} + 1/r_{ds3})\,v_A$.`,
      ],
      sol: md`
        **Recognize it first.** The same loop, but the amplifier inside it ($M_1$ as a common gate from $X$ to $A$) now has a finite load $r_{ds3}$ instead of an open circuit. Its gain drops from $g_{m1}r_{ds1}$ to about $g_{m1}(r_{ds1}\parallel r_{ds3})$, and $R_X$ rises by the same factor.

        **Step 1: the gain from $X$ to $A$.** $M_1$'s drain current (from $A$ down to $X$) is $i_{d1} = g_{m1}(0 - v_x) + (v_A - v_x)/r_{ds1}$. At $A$ that current comes down from $V_{DD}$ through $r_{ds3}$: $i_{d1} = -v_A/r_{ds3}$. Equate and collect $v_A$:
        $$v_A\left(\frac{1}{r_{ds1}} + \frac{1}{r_{ds3}}\right) = v_x\left(g_{m1} + \frac{1}{r_{ds1}}\right)\;\Rightarrow\;v_A = \frac{(1 + g_{m1}r_{ds1})\,r_{ds3}}{r_{ds1} + r_{ds3}}\,v_x \approx g_{m1}(r_{ds1}\parallel r_{ds3})\,v_x$$

        **Step 2: where the test current goes.** Into $M_2$: $g_{m2}v_A + v_x/r_{ds2}$. And up through $M_1$ (from $X$ into $A$, then through $r_{ds3}$): $-i_{d1} = v_A/r_{ds3}$. Total:
        $$i_t = \frac{v_x}{r_{ds2}} + \left(g_{m2} + \frac{1}{r_{ds3}}\right)v_A$$

        **Step 3: the resistance.**
        $$R_{X2} = \frac{1}{\dfrac{1}{r_{ds2}} + \left(g_{m2} + \dfrac{1}{r_{ds3}}\right)\dfrac{(1 + g_{m1}r_{ds1})\,r_{ds3}}{r_{ds1} + r_{ds3}}} \approx \frac{1}{g_{m1}g_{m2}\,(r_{ds1}\parallel r_{ds3})}$$

        **Step 4: numbers.** $(1 + 100)\times\dfrac{100\,\text{k}}{200\,\text{k}} = 50.5$, and $g_{m2} + 1/r_{ds3} = 1.01\,\text{mS}$, so the bracket is $51.0\,\text{mS}$; adding $1/r_{ds2} = 0.01\,\text{mS}$ gives $51.02\,\text{mS}$, and $R_{X2} = 19.6\,\Omega \approx 20\,\Omega$. Twice part (a): the inner gain halved.

        !!key Pattern
          Feedback resistance $\approx$ open-loop resistance divided by the loop gain. Here the loop gain is $g_{m2}\times$(the common-gate gain at $A$), so every resistance loading $A$ ($r_{ds1}\parallel r_{ds3}$) shows up directly in $R_X$.
      `,
    }),
    P({
      id: 'e2mg-3', src: 'New practice exam G · Problem 3(a)–(c) (25 pts)', title: 'The op amp\'s gain, stage by stage', big: true,
      q: md`The op amp of Problem 1, with $v_{in}$ on $M_1$'s gate and $M_2$'s gate held at $V_{CM}$; matched pair ($M_2 = M_1$, $M_4 = M_3$). Find (a) the first-stage gain $A_1 = v_{o1}/v_{in}$ in $g_{m1}$, $r_{ds1}$, $g_{m3}$, $r_{ds3}$ (10 pts); (b) the second-stage gain $A_2 = v_{out}/v_{o1}$ (8 pts); (c) $A_v = v_{out}/v_{in}$ (7 pts). Then say which gate is the non-inverting input.`,
      fig: G1Fig,
      parts: [
        ex(G3A1, ['gm1', 'rds1', 'gm3', 'rds3'], 'A_1'),
        ex('-gm6*(rds6 || rds7)', ['gm6', 'rds6', 'rds7'], 'A_2'),
        ex(`-(${G3A1})*gm6*(rds6 || rds7)`, ['gm1', 'rds1', 'gm3', 'rds3', 'gm6', 'rds6', 'rds7'], 'A_v'),
        { lbl: 'The non-inverting input of this op amp is', mc: ['the gate of $M_2$', 'the gate of $M_1$', 'neither: both inputs invert', 'it depends on $V_{CM}$'], a: 0,
          why: [null, 'From $M_1$\'s gate, stage 1 is non-inverting (two paths add at $O_1$), but stage 2 inverts: overall $A_v < 0$.', 'A differential pair responds to $v_{g1} - v_{g2}$: the two gates always have opposite signs.', 'Signs come from the topology, not from the bias point (as long as everything is saturated).'] },
      ],
      hints: [
        md`Stage 1 is the mirror-loaded pair driven at $M_1$: $G_{M1} \approx -g_{m1}$ (two paths add), $R_{o1} \approx r_{ds2}\parallel r_{ds4}$, so $A_1 \approx +g_{m1}(r_{ds1}\parallel r_{ds3})$.`,
        md`Stage 2: $M_6$ is a PMOS common source (source at $V_{DD}$, gate at $O_1$) with the current source $M_7$ as its load. $M_6$'s gate draws no current, so the stages do not load each other.`,
      ],
      sol: md`
        **Recognize it first.** Two stages in a chain. Stage 1 is the mirror-loaded pair driven on one side (New practice exam E, Problem 3, derives it slowly): $G_{M1} \approx -g_{m1}$ because half the signal current reaches $O_1$ directly through $M_2$ and half through the mirror, and $R_{o1} \approx r_{ds2}\parallel r_{ds4}$. Stage 2 is a PMOS common source with a current-source load. $M_6$'s gate draws no current, so $A_v = A_1A_2$.

        **(a) Stage 1, exactly.** Output $O_1$ shorted: the tail is open, so $M_1$ and $M_2$ change by equal and opposite amounts and $P$ moves by about $v_{in}/2$. With $g_{ds} = 1/r_{ds}$, the two paths together give
        $$G_{M1} = -g_{m1}\,\frac{1 + \frac{g_{m3}}{g_{m3} + g_{ds3}}}{2 + \frac{g_{ds1}}{g_{m3} + g_{ds3}}} \approx -g_{m1}$$
        With $v_{in} = 0$: the chain $M_2 \to P \to M_1 \to$ diode is $2r_{ds1} + R_A$ ($R_A = 1/(g_{m3} + g_{ds3})$), and the mirror makes the output carry its current twice:
        $$R_{o1} = r_{ds3}\ \Big\|\ \frac{2r_{ds1} + R_A}{1 + g_{m3}R_A} \approx r_{ds1}\parallel r_{ds3}$$
        $$A_1 = -G_{M1}R_{o1} \approx +g_{m1}(r_{ds1}\parallel r_{ds3})$$

        **(b) Stage 2.** Short the output: $M_6$ has its source at $V_{DD}$ (incremental ground) and its gate at $v_{o1}$, so its model current $g_{m6}v_{o1}$ flows from its drain (the short) to its source: current from the short into the stage, $G_{M2} = +g_{m6}$, like any common source. Zero the input: the output sees $r_{ds6}$ and $r_{ds7}$ (both gates fixed):
        $$A_2 = -g_{m6}(r_{ds6}\parallel r_{ds7})$$

        **(c) The whole op amp.**
        $$A_v = A_1A_2 \approx -g_{m1}(r_{ds1}\parallel r_{ds3})\cdot g_{m6}(r_{ds6}\parallel r_{ds7})$$

        **Which input is which.** $v_{in}$ up on $M_1$ → $O_1$ up (stage 1 is non-inverting from $M_1$) → $M_6$'s $v_{sg}$ shrinks → less current into the output → $v_{out}$ down. So $M_1$'s gate is the **inverting** input and $M_2$'s gate is the **non-inverting** one.

        !!key Pattern
          Two-stage op amp: $|A_v| = g_{m1}(r_{ds2}\parallel r_{ds4})\cdot g_{m6}(r_{ds6}\parallel r_{ds7})$, about $(g_mr_{ds}/2)^2$. Track the sign through each stage to label the inputs.
      `,
    }),
    P({
      id: 'e2mg-3d', src: 'New practice exam G · Problem 3(d) (10 pts)', title: 'The op amp\'s gain in numbers', big: true,
      q: md`Use the bias of Problem 1 and $\lambda = 0.1\,\text{V}^{-1}$. Find $g_{m1}$, $g_{m6}$, $A_1$, $A_2$ and $A_v$.`,
      fig: G1Fig,
      parts: [
        { lbl: 'g_{m1}', unit: 'mA/V', ans: 2, traps: [{ v: 1, msg: '$V_{ov1} = 0.1\\,\\text{V}$, not $0.2\\,\\text{V}$: the input pair is $200/1$.' }] },
        { lbl: 'g_{m6}', unit: 'mA/V', ans: 4 },
        { lbl: 'A_1', unit: '', ans: 99.5, accept: [100] },
        { lbl: 'A_2', unit: '', ans: -50 },
        { lbl: 'A_v', unit: '', ans: -4975, accept: [-5000] },
      ],
      hints: [
        md`Currents from Problem 1: $100\,\mu\text{A}$ in $M_1$–$M_4$, $400\,\mu\text{A}$ in $M_6$, $M_7$. Then $g_m = 2I_D/V_{ov}$ and $r_{ds} = 1/(\lambda I_D)$.`,
        md`$r_{ds1}\parallel r_{ds3} = 50\kO$, $r_{ds6}\parallel r_{ds7} = 12.5\kO$.`,
      ],
      sol: md`
        **Recognize it first.** Turn Problem 1's bias into small-signal parameters, then multiply the two stage gains.

        **Step 1: transconductances.** $g_{m1} = \dfrac{2(0.1\,\text{m})}{0.1} = 2\,\text{mA/V}$ (overdrive $0.1\,\text{V}$); $g_{m3} = \dfrac{2(0.1\,\text{m})}{0.2} = 1\,\text{mA/V}$; $g_{m6} = \dfrac{2(0.4\,\text{m})}{0.2} = 4\,\text{mA/V}$.

        **Step 2: output resistances.** $r_{ds1} = r_{ds3} = \dfrac{1}{0.1\times0.1\,\text{m}} = 100\kO$; $r_{ds6} = r_{ds7} = \dfrac{1}{0.1\times0.4\,\text{m}} = 25\kO$.

        **Step 3: stage 1.** $A_1 \approx g_{m1}(r_{ds1}\parallel r_{ds3}) = 2\,\text{m}\times50\,\text{k} = 100$. (The exact forms give $|G_{M1}| = 1.980\,\text{mA/V}$ and $R_{o1} = 50.25\kO$, so $A_1 = 99.5$.)

        **Step 4: stage 2.** $A_2 = -g_{m6}(r_{ds6}\parallel r_{ds7}) = -4\,\text{m}\times12.5\,\text{k} = -50$.

        **Step 5: total.** $A_v = A_1A_2 \approx 100\times(-50) = -5000$ (exactly $-4975$).

        **Sense check.** Each stage gives about $g_mr_{ds}/2$: stage 1 has $g_{m1}r_{ds}/2 = 2\,\text{m}\times100\,\text{k}/2 = 100$, stage 2 has $4\,\text{m}\times25\,\text{k}/2 = 50$. The second stage's $g_mr_{ds}$ is the same 100 as an input device's: four times the current gives four times $g_m$ at the same overdrive, and a quarter of $r_{ds}$.

        !!key Pattern
          Intrinsic gain $g_mr_{ds} = \dfrac{2I_D/V_{ov}}{\lambda I_D} = \dfrac{2}{\lambda V_{ov}}$: it depends on the overdrive, not the current. $V_{ov} = 0.1\,\text{V}$ gives 200, $V_{ov} = 0.2\,\text{V}$ gives 100.
      `,
    }),
  ];

  E2.lesson('e2-mocku', { id: 'e2-mockD', title: 'New practice exam D', kind: 'mock', sub: 'A degenerated mirror, gates on diode stacks, a CS stage and its follower', steps: D });
  E2.lesson('e2-mocku', { id: 'e2-mockE', title: 'New practice exam E', kind: 'mock', sub: 'A starved diode load, two cascode resistances, the mirror-loaded differential pair', steps: E });
  E2.lesson('e2-mocku', { id: 'e2-mockF', title: 'New practice exam F (harder)', kind: 'mock', sub: 'A cascode mirror in numbers, a regulated cascode from both ends, the telescopic cascode', steps: Fx });
  E2.lesson('e2-mocku', { id: 'e2-mockG', title: 'New practice exam G (hardest)', kind: 'mock', sub: 'A two-stage op amp from bias to gain, and the flipped voltage follower', steps: G });
})();

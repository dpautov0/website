/* fet-extra.js — more MOSFET groundwork, drawn out: reading the schematic (u4-symbols), what 1X/2X/4X mean
   (u4-sizes), and a step-by-step method for multi-transistor problems (u4-method). */
(function () {
  const { P, G } = C;
  const R = (text, o) => Object.assign(C.R(text), o || {});
  const u4 = COURSE.units.find((u) => u.id === 'u4');
  const after = (id, l) => u4.lessons.splice(u4.lessons.findIndex((x) => x.id === id) + 1, 0, l);
  const row = window.DRAW.row;
  const half = '\\tfrac12X', quarter = '\\tfrac14X';

  // ---------------------------------------------------------------- symbols
  const nSym = [['nmos', [1, 1]], ['w', [1, 0], [1, -0.7]], ['term', [1, -0.7], { n: 'D', side: 'a' }], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: 'S', side: 'b' }],
    ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'G', side: 'l' }], ['iarr', [1, -0.35], 'd', { n: 'I_D', side: 'r' }]];
  const pSym = [['pmos', [1, 1]], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: 'S', side: 'a' }], ['w', [1, 2], [1, 2.7]], ['term', [1, 2.7], { n: 'D', side: 'b' }],
    ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'G', side: 'l' }], ['iarr', [1, 2.35], 'd', { n: 'I_D', side: 'r' }]];
  const dcSym = [['nmos', [1, 1], { dc: true }], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: 'D', side: 'a' }], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: 'S', side: 'b' }]];
  const mirSym = FIGS.nmirror({ s1: '', s2: '', RD: false });
  const abc = [['pmos', [1, 1]], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: 'A', side: 'a' }], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: 'C', side: 'b' }],
    ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'B', side: 'l' }]];

  after('u4-basics', {
    id: 'u4-symbols', title: 'Reading a MOSFET schematic',
    steps: [
      R(md`
        ### The four pictures you'll see
        [[fig:sym]]
        - **NMOS**: source at the bottom (toward ground). $I_D$ flows **into the drain** and out of the source. On when the gate is above the source: $V_{GS} > V_{tn}$.
        - **PMOS**: source at the top (toward $V_{DD}$). $I_D$ flows **into the source** and out of the drain. On when the gate is below the source: $V_{SG} > |V_{tp}|$.
        - The arrow always sits on the **source** and points the way current flows: out of an NMOS, into a PMOS.
        - **Diode-connected**: a wire from gate to drain, so $V_{DS} = V_{GS}$. It is always saturated when it conducts.
        - **Gates tied and sources tied** (a mirror): both devices have the same $V_{GS}$.
        - No current ever flows into a gate. A resistor in series with a gate drops nothing.

        ### What the symbols in a problem mean
        | Symbol | Meaning | Course value |
        |---|---|---|
        | $\mu_nC_{ox}$ (also $k_n'$) | NMOS process constant | $100\,\mu\text{A/V}^2$ |
        | $\mu_pC_{ox}$ (also $k_p'$) | PMOS process constant | $50\,\mu\text{A/V}^2$ |
        | $W/L$ | the device's size: channel width over length | given, or as $1X$, $2X$, … |
        | $V_{tn}$, $V_{tp}$ | threshold voltages | $1\,\text{V}$, $-1\,\text{V}$ |
        | $\lambda = 0$ | in saturation $I_D$ doesn't depend on $V_{DS}$ | |
        | $V_{ov} = V_{GS} - V_{tn}$ | overdrive: how far past threshold | |
        | $V_{SG}$, $V_{SD}$, $\lvert V_{tp}\rvert$ | PMOS voltages written as positive magnitudes | |
      `, { figs: { sym: row([{ fig: nSym, cap: 'NMOS' }, { fig: pSym, cap: 'PMOS' }, { fig: dcSym, cap: 'diode-connected' }, { fig: mirSym, cap: 'mirror: gates tied' }]) } }),
      R(md`
        ### Saturation or triode: the check in node voltages
        Saturation needs $V_{DS} \ge V_{ov}$. Write both sides with node voltages:
        $$V_D - V_S \ge V_G - V_S - V_{tn}\qquad\Longleftrightarrow\qquad V_D \ge V_G - V_{tn}$$
        So an NMOS is saturated while its **drain is no more than one $V_{tn}$ below its gate**. For a PMOS, flip everything:
        $$V_D \le V_G + |V_{tp}|$$
        the drain may be at most one $|V_{tp}|$ **above** the gate. These two lines are the check for every device in a multi-transistor problem.
      `),
      P({
        id: 'SYM-1', title: 'Find the source', cat: 'mos', kind: 'orig',
        q: md`The figure shows a PMOS with its three terminals labelled $A$, $B$, $C$. Which one is the source?`,
        fig: abc,
        parts: [{ mc: ['$A$ (top)', '$B$', '$C$ (bottom)'], a: 0, why: [null, '$B$ is the gate: the terminal on the insulated plate.', 'The arrow is on the top terminal, pointing in: that marks the PMOS source.'] }],
        sol: md`The arrow marks the source, and on a PMOS it points **into** the device: terminal $A$. $B$ is the gate, $C$ the drain. In circuits the PMOS source faces $V_{DD}$.`,
      }),
      P({
        id: 'SYM-2', title: 'Tied gates', cat: 'mos', kind: 'orig',
        q: md`In the mirror, $M_1$ is diode-connected and has $V_{GS} = 1.2\,\text{V}$. $M_2$'s gate and source connect to $M_1$'s. What is $V_{GS2}$?`,
        fig: FIGS.nmirror({ s1: '1X', s2: '2X', RD: false }),
        parts: [{ lbl: 'V_{GS2}', unit: 'V', ans: 1.2 }],
        sol: md`Same gate node, same source node (both grounded): $V_{GS2} = V_{GS1} = 1.2\,\text{V}$. That shared $V_{GS}$ is what makes a mirror.`,
      }),
      P({
        id: 'SYM-3', title: 'NMOS from node voltages', cat: 'mos', kind: 'orig',
        q: md`An NMOS ($V_{tn} = 1\,\text{V}$) has the node voltages shown. Find $V_{ov}$ and its region.`,
        fig: FIGS.mosNodes(false, 2, 0.5, 1.2),
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.5 }, { mc: ['saturation', 'triode', 'cut-off'], a: 0, lbl: 'Region', why: [null, '$V_D = 1.2 \\ge V_G - V_{tn} = 1$: saturated.', '$V_{GS} = 1.5 > 1$: it is on.'] }],
        sol: md`$V_{GS} = 2 - 0.5 = 1.5\,\text{V}$, $V_{ov} = 0.5\,\text{V}$. Check: $V_D = 1.2 \ge V_G - V_{tn} = 1\,\text{V}$, so **saturation**.`,
      }),
      P({
        id: 'SYM-4', title: 'PMOS from node voltages', cat: 'mos', kind: 'orig',
        q: md`A PMOS ($V_{tp} = -1\,\text{V}$) has the node voltages shown. Find $V_{SG}$ and its region.`,
        fig: FIGS.mosNodes(true, 3.8, 5, 4.5),
        parts: [{ lbl: 'V_{SG}', unit: 'V', ans: 1.2 }, { mc: ['saturation', 'triode', 'cut-off'], a: 0, lbl: 'Region', why: [null, '$V_D = 4.5 \\le V_G + |V_{tp}| = 4.8$: saturated.', '$V_{SG} = 1.2 > 1$: it is on.'] }],
        sol: md`$V_{SG} = 5 - 3.8 = 1.2\,\text{V}$ (on, $V_{ov} = 0.2\,\text{V}$). Check: $V_D = 4.5 \le V_G + |V_{tp}| = 4.8\,\text{V}$, so **saturation**.`,
      }),
    ],
  });

  // ---------------------------------------------------------------- sizes
  const par = [
    ['nmos', [1, 1], { sz: '1X' }], ['nmos', [3, 1], { sz: '1X', flip: true }],
    ['w', [1, 0], [1, -0.3], [3, -0.3], [3, 0]], ['w', [2, -0.3], [2, -0.7]], ['term', [2, -0.7], { n: 'D', side: 'a' }],
    ['w', [1, 2], [1, 2.3], [3, 2.3], [3, 2]], ['w', [2, 2.3], [2, 2.6]], ['term', [2, 2.6], { n: 'S', side: 'r' }],
    ['w', [0, 1], [0, 3.1], [4, 3.1], [4, 1]], ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'G', side: 'l' }],
  ];
  const one2 = [['nmos', [1, 1], { sz: '2X' }], ['w', [1, 0], [1, -0.7]], ['term', [1, -0.7], { n: 'D', side: 'a' }], ['w', [1, 2], [1, 2.6]], ['term', [1, 2.6], { n: 'S', side: 'r' }],
    ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'G', side: 'l' }]];
  const mir4 = FIGS.nmirror({ s1: '1X', s2: '4X', irefs: '0.5\\,\\text{mA}', RD: false });
  const stk = [
    ['rail', [0, 0], { n: 'V_{DD}' }], ['I', [0, 0], [0, 1.4], { n: 'I', s: '0.5\\,\\text{mA}', side: 'l' }],
    ['nmos', [0, 2.4], { sz: quarter, flip: true, dc: true }], ['node', [0, 3.4], { n: '2.3\\,\\text{V}', side: 'l' }],
    ['nmos', [0, 4.4], { sz: '4X', flip: true, dc: true }], ['node', [0, 5.4], { n: '1.2\\,\\text{V}', side: 'l' }],
    ['nmos', [0, 6.4], { sz: '1X', flip: true, dc: true }], ['gnd', [0, 7.4]], ['node', [0, 1.4], { n: '3.7\\,\\text{V}', side: 'l' }],
    ['txt', [1.35, 2.4], '$V_{GS} = 1.4\\,\\text{V}$', { a: 'l' }], ['txt', [1.35, 4.4], '$V_{GS} = 1.1\\,\\text{V}$', { a: 'l' }], ['txt', [1.35, 6.4], '$V_{GS} = 1.2\\,\\text{V}$', { a: 'l' }],
  ];

  after('u4-square', {
    id: 'u4-sizes', title: 'Sizes: what 1X, 2X, 4X mean',
    steps: [
      R(md`
        ### The unit device
        A problem defines one **unit** size, for example $1X = 250/1$: a unit transistor has $W/L = 250$. Every transistor is then labelled as a multiple of it:

        | Label | $W/L$ when $1X = 250/1$ | Think of it as |
        |---|---|---|
        | $\tfrac14X$ | 62.5 | a quarter as wide |
        | $\tfrac12X$ | 125 | half as wide |
        | $1X$ | 250 | the unit |
        | $2X$ | 500 | two $1X$ side by side |
        | $4X$ | 1000 | four $1X$ side by side |

        Only the width changes. A wider channel passes more current at the same voltages.

        ### A $2X$ is two $1X$ in parallel
        [[fig:par]]
        Two identical $1X$ devices with the same gate, drain and source each carry $I$, so together they carry $2I$. That pair **is** a $2X$. So at the same voltages, current is proportional to size.
      `, { figs: { par: row([{ fig: par, cap: 'two $1X$ with shared $G$, $D$, $S$: $I + I$' }, { fig: one2, cap: 'one $2X$: the same $2I$' }]) } }),
      R(md`
        ### Put the size into one number
        $$I_D = \tfrac12\mu C_{ox}\frac{W}{L}\,V_{ov}^2 = K\,V_{ov}^2,\qquad K = \tfrac12\mu C_{ox}\frac{W}{L}$$
        Work out $K$ once for $1X$, then scale it. With $1X = 250/1$:

        | Size | NMOS $K$ ($\text{mA/V}^2$) | PMOS $K$ ($\text{mA/V}^2$) |
        |---|---|---|
        | $\tfrac12X$ | 6.25 | 3.125 |
        | $1X$ | 12.5 | 6.25 |
        | $2X$ | 25 | 12.5 |
        | $4X$ | 50 | 25 |

        A PMOS has half the $\mu C_{ox}$, so it has half the $K$ of the same-size NMOS: a $2X$ PMOS behaves like a $1X$ NMOS.

        !!trap Where the ½ goes
        Some problems define $k_n = \mu_nC_{ox}\tfrac{W}{L}$ with no ½; then $I_D = \tfrac12k_nV_{ov}^2$. Here $K$ already includes the ½, so $I_D = KV_{ov}^2$. Read which one the problem uses.
      `),
      R(md`
        ### Rule 1: same $V_{GS}$, current scales with size
        Gates tied and sources tied (a mirror): every device has the same $V_{ov}$, so $I_D = KV_{ov}^2$ scales with $K$, which scales with size.
        [[fig:mir]]
        $$\frac{I_2}{I_1} = \frac{(W/L)_2}{(W/L)_1}\qquad\text{here } \frac{4X}{1X} = 4:\ I_2 = 2\,\text{mA}$$
        Only while the copy stays **saturated** (check its drain).

        ### Rule 2: same current, overdrive scales with $\tfrac{1}{\sqrt{\text{size}}}$
        Devices in series carry the same current. $KV_{ov}^2$ is fixed, so a bigger $K$ needs less overdrive:
        $$V_{ov} = \sqrt{\frac{I_D}{K}}\qquad\Rightarrow\qquad \frac{V_{ov,2}}{V_{ov,1}} = \sqrt{\frac{(W/L)_1}{(W/L)_2}}$$
        [[fig:stk]]
        With $1X = 250/1$ and $0.5\,\text{mA}$: the $1X$ has $V_{ov} = 0.2\,\text{V}$, the $4X$ half that ($0.1\,\text{V}$), the $\tfrac14X$ double ($0.4\,\text{V}$). Exams pick $4X$ and $\tfrac14X$ so no square roots are needed.

        !!key Don't mix them up
        | Situation | Shared | Scales with size |
        |---|---|---|
        | Mirror (gates and sources tied) | $V_{GS}$ | $I_D \propto W/L$ |
        | Series (a stack) | $I_D$ | $V_{ov} \propto \dfrac{1}{\sqrt{W/L}}$ |
      `, { figs: { mir: { fig: mir4, cap: 'same $V_{GS}$: the $4X$ copies $4\\times0.5\\,\\text{mA}$' }, stk: { fig: stk, cap: 'same $0.5\\,\\text{mA}$ through $\\tfrac14X$, $4X$, $1X$ (node voltages on the left)' } } }),
      P({
        id: 'SZ-1', title: 'Mirror a 4X', cat: 'mos', kind: 'orig',
        q: md`A $1X$ diode-connected NMOS carries $0.3\,\text{mA}$. A $4X$ NMOS shares its gate and source and is saturated. Its current is:`,
        fig: FIGS.nmirror({ s1: '1X', s2: '4X', irefs: '0.3\\,\\text{mA}', RD: false }),
        parts: [{ mc: ['$1.2\\,\\text{mA}$', '$0.3\\,\\text{mA}$', '$0.6\\,\\text{mA}$', '$0.075\\,\\text{mA}$'], a: 0, why: [null, 'That ignores the size.', 'That would be $\\sqrt4$: square roots belong to the series rule.', 'That divides instead of multiplying.'] }],
        sol: md`Same $V_{GS}$, so $I \propto W/L$: $4 \times 0.3 = 1.2\,\text{mA}$.`,
      }),
      P({
        id: 'SZ-2', title: 'K for three sizes', cat: 'mos', kind: 'orig',
        q: md`$1X = 250/1$, NMOS with $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$. Find $K = \tfrac12\mu_nC_{ox}\tfrac{W}{L}$ for $\tfrac12X$, $1X$ and $4X$.`,
        fig: [['nmos', [1, 1], { sz: half }], ['gnd', [1, 2]], ['nmos', [3, 1], { sz: '1X' }], ['gnd', [3, 2]], ['nmos', [5, 1], { sz: '4X' }], ['gnd', [5, 2]]],
        parts: [{ lbl: 'K_{\\frac12X}', unit: 'mA/V²', ans: 6.25 }, { lbl: 'K_{1X}', unit: 'mA/V²', ans: 12.5 }, { lbl: 'K_{4X}', unit: 'mA/V²', ans: 50 }],
        sol: md`$K_{1X} = \tfrac12\times100\,\mu\text{A/V}^2\times250 = 12.5\,\text{mA/V}^2$. Scale by size: $\tfrac12X \to 6.25$, $4X \to 50\,\text{mA/V}^2$.`,
      }),
      P({
        id: 'SZ-3', title: 'Same current, smaller device', cat: 'mos', kind: 'orig',
        q: md`A $1X$ NMOS carries $0.5\,\text{mA}$ with $V_{ov} = 0.2\,\text{V}$. A diode-connected $\tfrac14X$ NMOS sits in series with it (same current). Find its $V_{ov}$ and $V_{GS}$ ($V_{tn} = 1\,\text{V}$).`,
        fig: [['rail', [0, 0], { n: 'V_{DD}' }], ['I', [0, 0], [0, 1.4], { n: 'I', s: '0.5\\,\\text{mA}', side: 'l' }], ['nmos', [0, 2.4], { sz: quarter, flip: true, dc: true }], ['nmos', [0, 4.4], { sz: '1X', flip: true, dc: true }], ['gnd', [0, 5.4]]],
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.4 }, { lbl: 'V_{GS}', unit: 'V', ans: 1.4 }],
        sol: md`Same current: $V_{ov} \propto \dfrac{1}{\sqrt{\text{size}}}$. A quarter of the size means $\sqrt4 = 2$ times the overdrive: $V_{ov} = 0.4\,\text{V}$, $V_{GS} = 1.4\,\text{V}$.`,
      }),
      P({
        id: 'SZ-4', title: 'Match a PMOS to an NMOS', cat: 'mos', kind: 'orig',
        q: md`NMOS: $100\,\mu\text{A/V}^2$; PMOS: $50\,\mu\text{A/V}^2$. What size PMOS carries the same current as a $1X$ NMOS at the same overdrive?`,
        fig: [['nmos', [1, 1], { sz: '1X' }], ['gnd', [1, 2]], ['pmos', [3, 1], { sz: '?' }], ['rail', [3, 0], { n: 'V_{DD}' }]],
        parts: [{ mc: ['$2X$', '$1X$', '$\\tfrac12X$', '$4X$'], a: 0, why: [null, 'Same size, but the PMOS has half the $\\mu C_{ox}$.', 'That halves it again.', 'Twice too big.'] }],
        sol: md`$K \propto \mu C_{ox}\,\tfrac{W}{L}$. The PMOS has half the $\mu C_{ox}$, so it needs twice the $W/L$: $2X$.`,
      }),
      G('size_rules', { need: 3 }),
    ],
  });

  // ---------------------------------------------------------------- the method, on an NMOS → PMOS mirror chain
  const chain = (o) => [
    ['w', [0, 0], [4, 0]], ['rail', [3, 0], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['I', [0, 0], [0, 2.6], { n: 'I_{REF}', s: o.iref, side: 'l' }],
    ['nmos', [0, 3.6], { n: 'M_1', sz: o.s1, flip: true, dc: true }], ['gnd', [0, 4.6]],
    ['nmos', [2, 3.6], { n: 'M_2', sz: o.s2 }], ['gnd', [2, 4.6]], ['w', [2, 2], [2, 2.6]],
    ['pmos', [2, 1], { n: 'M_3', sz: o.s3, flip: true }], ['w', [3, 1], [3, 2], [2, 2]],
    ['pmos', [4, 1], { n: 'M_4', sz: o.s4 }], ['w', [4, 2], [4, 2.8]], ['R', [4, 2.8], [4, 4.6], { n: 'R_L' }], ['gnd', [4, 4.6]],
    ['node', [2, 2], { n: o.vx || 'V_X', side: 'l' }],
    ...(o.i2 ? [['iarr', [2, 2.3], 'd', { n: o.i2, side: 'r' }], ['iarr', [4, 2.4], 'd', { n: o.i4, side: 'r' }], ['node', [0, 2.6], { n: o.v1, side: 'l' }]] : []),
  ];
  const ex = { iref: '0.5\\,\\text{mA}', s1: '1X', s2: '2X', s3: '4X', s4: '8X' };

  const at = u4.lessons.findIndex((x) => x.id === 'u4-stackmirror');
  u4.lessons.splice(at + 1, 0, {
    id: 'u4-method', title: 'Multi-transistor problems: the method',
    steps: [
      R(md`
        Every Problem 3 is the same few moves. Do them in this order and write each one down.

        !!method Solving a multi-transistor DC problem
        1. **Size table.** $K = \tfrac12\mu C_{ox}\tfrac{W}{L}$ for every size in the figure, NMOS and PMOS separately.
        2. **Find a known current.** A current source, or a device whose $V_{GS}$ you already know (gate at a fixed voltage, a diode-connected device between known nodes).
        3. **Follow it.** Series devices carry the same current. A diode-connected device then has $V_{GS} = V_T + \sqrt{\dfrac{I}{K}}$.
        4. **Copy it.** Gates tied and sources tied: same $V_{GS}$, current scales by size (assume saturation for now).
        5. **Walk the voltages** up from ground and down from $V_{DD}$, one $V_{GS}$ or $IR$ at a time. Use KCL where branches meet.
        6. **Check** every device that isn't diode-connected: NMOS $V_D \ge V_G - V_{tn}$, PMOS $V_D \le V_G + |V_{tp}|$. A "largest resistor" comes from setting that check to equality.

        ### Worked example: an NMOS mirror feeding a PMOS mirror
        $1X = 250/1$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_T| = 1\,\text{V}$. Find $V_{GS1}$, $I_2$, $V_X$, $I_4$ and the largest $R_L$ that keeps $M_4$ saturated.

        [[fig:q]]
      `, { figs: { q: { fig: chain(ex) } } }),
      R(md`
        **1. Size table.**

        | Device | Type, size | $K$ ($\text{mA/V}^2$) |
        |---|---|---|
        | $M_1$ | NMOS $1X$ | $\tfrac12\times100\,\mu\times250 = 12.5$ |
        | $M_2$ | NMOS $2X$ | 25 |
        | $M_3$ | PMOS $4X$ | $\tfrac12\times50\,\mu\times1000 = 25$ |
        | $M_4$ | PMOS $8X$ | 50 |

        **2. Known current.** $I_{REF} = 0.5\,\text{mA}$ flows into $M_1$.

        **3. Follow it.** $M_1$ is diode-connected: $V_{ov1} = \sqrt{\dfrac{0.5}{12.5}} = 0.2\,\text{V}$, so $V_{GS1} = 1.2\,\text{V}$.

        **4. Copy it.** $M_2$ shares $M_1$'s gate and source: $I_2 = 0.5 \times \dfrac{2X}{1X} = 1\,\text{mA}$.

        **3 again.** $I_2$ flows up through $M_3$ (series). $M_3$ is diode-connected (gate wired to its drain): $V_{ov3} = \sqrt{\dfrac{1}{25}} = 0.2\,\text{V}$, $V_{SG3} = 1.2\,\text{V}$, so
        $$V_X = V_{DD} - V_{SG3} = 5 - 1.2 = 3.8\,\text{V}$$

        **4 again.** $M_4$ shares $M_3$'s gate and source: $I_4 = 1 \times \dfrac{8X}{4X} = 2\,\text{mA}$.

        **6. Checks.**
        - $M_2$ (NMOS): $V_D = V_X = 3.8 \ge V_G - V_{tn} = 1.2 - 1 = 0.2\,\text{V}$. Saturated.
        - $M_4$ (PMOS): $V_D = I_4R_L \le V_G + |V_{tp}| = 3.8 + 1 = 4.8\,\text{V}$, so
        $$R_{L,max} = \frac{4.8\,\text{V}}{2\,\text{mA}} = 2.4\kO$$

        [[fig:sol]]

        With $R_L$ above $2.4\kO$, $M_4$ drops into triode and delivers less than $2\,\text{mA}$: it stops being a current source.
      `, { figs: { sol: { fig: chain(Object.assign({}, ex, { vx: 'V_X = 3.8\\,\\text{V}', i2: 'I_2 = 1\\,\\text{mA}', i4: 'I_4 = 2\\,\\text{mA}', v1: 'V_{GS1} = 1.2\\,\\text{V}' })), cap: 'solved: currents and node voltages' } } }),
      R(md`
        !!trap Where points go
        - Checking saturation on a diode-connected device (it always is) instead of on the mirror outputs (which might not be).
        - Copying current by size when the two sources are **not** at the same voltage (a source resistor breaks the mirror).
        - Using $100\,\mu\text{A/V}^2$ for a PMOS. PMOS is $50$.
        - Forgetting KCL where a mirror output meets a resistor and a current sink: the resistor carries only the difference.
        - Writing $V_{GS}$ for a PMOS. Use $V_{SG} = V_S - V_G$, all positive.
      `),
      P({
        id: 'MTH-1', title: 'Mirror chain, new numbers', cat: 'mos', kind: 'orig', big: true,
        q: md`Same circuit with $1X = 200/1$, $I_{REF} = 0.4\,\text{mA}$ and sizes $M_1 = 1X$, $M_2 = 2X$, $M_3 = 4X$ (PMOS), $M_4 = 2X$ (PMOS). $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_T| = 1\,\text{V}$, $V_{DD} = 5\,\text{V}$. Find $V_{GS1}$, $I_2$, $V_X$, $I_4$ and $R_{L,max}$.`,
        fig: chain({ iref: '0.4\\,\\text{mA}', s1: '1X', s2: '2X', s3: '4X', s4: '2X' }),
        parts: [{ lbl: 'V_{GS1}', unit: 'V', ans: 1.2 }, { lbl: 'I_2', unit: 'mA', ans: 0.8 }, { lbl: 'V_X', unit: 'V', ans: 3.8 }, { lbl: 'I_4', unit: 'mA', ans: 0.4 }, { lbl: 'R_{L,max}', unit: 'kΩ', ans: 12 }],
        hints: [
          md`$K$: NMOS $1X$ $= \tfrac12\times100\,\mu\times200 = 10\,\text{mA/V}^2$; PMOS $4X$ $= \tfrac12\times50\,\mu\times800 = 20\,\text{mA/V}^2$.`,
          md`$M_4$ is half the size of $M_3$, so it copies half of $M_3$'s current.`,
          md`$M_4$ saturated: $V_D \le V_X + 1$.`,
        ],
        sol: md`$M_1$: $V_{ov} = \sqrt{\dfrac{0.4}{10}} = 0.2$, $V_{GS1} = 1.2\,\text{V}$. $M_2$ ($2X$): $I_2 = 0.8\,\text{mA}$. $M_3$ ($4X$ PMOS, $K = 20$): $V_{ov} = \sqrt{\dfrac{0.8}{20}} = 0.2$, $V_{SG} = 1.2$, $V_X = 3.8\,\text{V}$. $M_4$ ($2X$, half of $M_3$): $I_4 = 0.4\,\text{mA}$.

Checks: $M_2$: $3.8 \ge 0.2$ ✓. $M_4$: $0.4R_L \le 4.8$, so $R_{L,max} = \dfrac{4.8\,\text{V}}{0.4\,\text{mA}} = 12\kO$.
[[fig:sol]]`,
        figs: { sol: { fig: chain({ iref: '0.4\\,\\text{mA}', s1: '1X', s2: '2X', s3: '4X', s4: '2X', vx: 'V_X = 3.8\\,\\text{V}', i2: 'I_2 = 0.8\\,\\text{mA}', i4: 'I_4 = 0.4\\,\\text{mA}', v1: 'V_{GS1} = 1.2\\,\\text{V}' }), cap: 'solved' } },
      }),
      G('mirror_rmax', { need: 2 }),
      G('stack_mirror_rmax', { need: 2 }),
    ],
  });
})();

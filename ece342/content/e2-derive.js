/* "Start from the model": every canonical stage derived from the small-signal model (the dependent current source
   g_m v_gs with r_ds across it) before its shortcut. Inserted right after each lesson's opener. */
(function () {
  'use strict';
  const { R } = C;

  // the small-signal model, drawn the way the lectures draw it. Gate on the left with +v_gs− to the source node;
  // the dependent source g_m v_gs from drain (top, x = 3) to source (bottom); r_ds across it at x = 4.4.
  function M(o) {
    const gx = 1.2, e = [];
    e.push(['term', [gx, 0.4], { n: 'G', side: 'a' }], ['term', [gx, 1.4]], ['w', [gx, 1.4], [gx, 2], [3, 2]], ['vlab', [gx + 0.25, 0.55], [gx + 0.25, 1.25], { n: 'v_{gs}' }]);
    if (o.g === 'vin') e.push(['w', [gx, 0.4], [0, 0.4], [0, 1]], ['Vac', [0, 1], [0, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2]]);
    if (o.g === 'gnd') e.push(['w', [gx, 0.4], [0.4, 0.4], [0.4, 0.7]], ['gnd', [0.4, 0.7]]);
    if (o.g === 'd') e.push(['w', [gx, 0.4], [gx, 0], [3, 0]]);
    e.push(['G', [3, 0], [3, 2], { n: 'g_mv_{gs}' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_{ds}' }], ['w', [3, 2], [4.4, 2]]);
    e.push(['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['txt', [3.15, 2.3], '$S$', { a: 'l' }]);
    const test = (y) => [['w', [4.4, y], [5.8, y]], ['V', [5.8, y], [5.8, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [5.8, y + 1.2]], ['iarr', [5.15, y], 'l', { n: 'i_t' }]];
    // drain side
    if (o.d === 'gnd') e.push(['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]]);
    if (o.d === 'RD' || o.d === 'RDout') e.push(['R', [3, -1.4], [3, 0], { n: 'R_D' }], ['gndu', [3, -1.4]]);
    if (o.d === 'RDout') e.push(['w', [4.4, 0], [5.4, 0]], ['term', [5.4, 0], { n: 'v_{out}' }]);
    if (o.d === 'test') e.push(...test(0));
    // source side
    if (o.s === 'gnd') e.push(['w', [3, 2], [3, 2.5]], ['gnd', [3, 2.5]]);
    if (o.s === 'RS') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['gnd', [3, 3.4]]);
    if (o.s === 'RSvin') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['Vac', [3, 3.4], [3, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [3, 4.4]]);
    if (o.s === 'out') e.push(['R', [3, 2], [3, 3.4], { n: 'R_L' }], ['gnd', [3, 3.4]], ['w', [4.4, 2], [5.4, 2]], ['term', [5.4, 2], { n: 'v_{out}' }]);
    if (o.s === 'test') e.push(...test(2));
    return e;
  }

  const intro = md`!!method Start from the model
  Replace the transistor by its small-signal model: a **dependent current source** $g_mv_{gs}$ pointing from drain to source, with the **resistor** $r_{ds}$ across it. Write $v_{gs} = v_g - v_s$ from the node voltages, then KCL. Every shortcut on this page comes out of these few lines.`;

  const D = {
    'e2-u7-three': [
      R(md`**Looking into the drain** (gate and source at incremental ground). Apply $v_t$ at the drain and find $i_t$.`, M({ g: 'gnd', s: 'gnd', d: 'test' }), md`
      1. Gate at 0, source at 0, so $v_{gs} = 0 - 0 = 0$.
      2. The dependent source carries $g_m\cdot0 = 0$: it is **dead**, an open circuit.
      3. Only $r_{ds}$ connects the drain to ground: $i_t = v_t/r_{ds}$.

      $$R_D = r_{ds}$$
      **The point:** when nothing moves $v_{gs}$, the transistor is just its leak resistor.`),
      R(md`**Looking into the source** (gate and drain at incremental ground). Same model, test source at the source this time.`, M({ g: 'gnd', d: 'gnd', s: 'test' }), md`
      1. Gate at 0, source at $v_t$, so $v_{gs} = 0 - v_t = -v_t$. The dependent source is **alive** now.
      2. KCL at the source node. Current arriving from the test source, $i_t$, must leave through the device. The device current from drain to source is $g_mv_{gs} + \frac{v_{ds}}{r_{ds}} = g_m(-v_t) + \frac{0 - v_t}{r_{ds}}$, so the current flowing **up** out of the source node is $g_mv_t + v_t/r_{ds}$.
      3. $i_t = \Big(g_m + \dfrac1{r_{ds}}\Big)v_t$.

      $$R_S = \frac{1}{g_m + 1/r_{ds}} = \frac1{g_m}\parallel r_{ds}\approx\frac1{g_m}$$
      **The point:** the test voltage itself sets $v_{gs}$, so the dependent source behaves like a resistor $1/g_m$ in parallel with $r_{ds}$.`),
    ],
    'e2-u7-diode': [
      R(md`**The diode connection:** the gate is wired to the drain, the source is grounded.`, M({ g: 'd', s: 'gnd', d: 'test' }), md`
      1. Gate = drain = $v_t$, source at 0: $v_{gs} = v_t$.
      2. Two paths from the drain to ground: the dependent source carries $g_mv_{gs} = g_mv_t$, and $r_{ds}$ carries $v_t/r_{ds}$.
      3. $i_t = g_mv_t + v_t/r_{ds}$.

      $$R_{diode} = \frac1{g_m}\parallel r_{ds}\approx\frac1{g_m}$$
      **The point:** a current source controlled by the voltage across itself *is* a resistor. Here it is $1/g_m$.`),
    ],
    'e2-u7-scaler': [
      R(md`**Looking into the drain with $R_S$ under the source** (gate at incremental ground). This is the derivation behind the "impedance scaler".`, M({ g: 'gnd', s: 'RS', d: 'test' }), md`
      1. All of $i_t$ goes down through the device and then through $R_S$, so the source sits at $v_s = i_tR_S$.
      2. $v_{gs} = 0 - v_s = -i_tR_S$. The dependent source **opposes** the current: more current means a higher source, which shuts the device.
      3. KCL for the device (drain to source): $i_t = g_mv_{gs} + \dfrac{v_t - v_s}{r_{ds}} = -g_mi_tR_S + \dfrac{v_t - i_tR_S}{r_{ds}}$.
      4. Multiply by $r_{ds}$ and collect $i_t$: $i_t(r_{ds} + R_S + g_mr_{ds}R_S) = v_t$.

      $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S\approx r_{ds}(1 + g_mR_S)$$
      **The point:** without the dependent source you would get $r_{ds} + R_S$ (two resistors in series). The extra $g_mr_{ds}R_S$ is the dependent source fighting back. That is the whole "scaler".`),
      R(md`**The other direction: looking into the source with $R_D$ on the drain** (gate held).`, M({ g: 'gnd', d: 'RD', s: 'test' }), md`
      1. $i_t$ enters the source, goes up through the device, and down through $R_D$: the drain sits at $v_d = i_tR_D$.
      2. $v_{gs} = 0 - v_t = -v_t$.
      3. Device current from drain to source is $-i_t$: $-i_t = g_m(-v_t) + \dfrac{i_tR_D - v_t}{r_{ds}}$.
      4. Multiply by $r_{ds}$: $v_t(1 + g_mr_{ds}) = i_t(r_{ds} + R_D)$.

      $$R_S = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\frac1{g_m} + \frac{R_D}{g_mr_{ds}}$$
      **The point:** set $R_D = 0$ and you get the previous lesson's $\tfrac1{g_m}\parallel r_{ds}$. A drain resistance adds only $R_D/(g_mr_{ds})$: it is shrunk by the same factor that grew $R_S$ above.`),
    ],
    'e2-u7-cascode': [
      R(md`**The cascode needs no new algebra.** Draw the bottom transistor's model with its gate at incremental ground: its dependent source is dead ($v_{gs1} = 0$), so the bottom transistor is just a resistor $r_{ds1}$. The top transistor's source therefore sits on a resistor $r_{ds1}$, which is exactly the degenerated drain you derived in the previous lesson with $R_S = r_{ds1}$:
      $$R_{out} = r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}$$`),
    ],
    'e2-u8-cs': [
      R(md`**The common-source gain, straight from the model.** Input at the gate, source grounded, $R_D$ at the drain (the supply is incremental ground, so $R_D$ goes to ground in this picture).`, M({ g: 'vin', s: 'gnd', d: 'RDout' }), md`
      1. Source at 0, gate at $v_{in}$: $v_{gs} = v_{in}$.
      2. KCL at the drain (= $v_{out}$). Three things leave the node: the dependent source pulls $g_mv_{in}$ down, $r_{ds}$ carries $v_{out}/r_{ds}$ down, $R_D$ carries $v_{out}/R_D$ up to ground. They must sum to zero:
      $$g_mv_{in} + \frac{v_{out}}{r_{ds}} + \frac{v_{out}}{R_D} = 0$$
      3. Solve: $v_{out} = -g_mv_{in}\,(R_D\parallel r_{ds})$.

      $$A_v = -g_m(R_D\parallel r_{ds})$$
      **The point:** the dependent source pushes a current $g_mv_{in}$ into the parallel combination of everything at the drain. That is the $G_MR_{out}$ picture: $G_M = g_m$, $R_{out} = R_D\parallel r_{ds}$.`),
    ],
    'e2-u8-csdeg': [
      R(md`**Degenerated common source.** Same as before, plus $R_S$ under the source. Take $r_{ds}\to\infty$ first so the idea is clear (then $r_{ds}$ is an open and drops out).`, M({ g: 'vin', s: 'RS', d: 'RDout' }), md`
      1. The dependent source's current $g_mv_{gs}$ flows down through $R_S$, so $v_s = g_mv_{gs}R_S$.
      2. KVL around the gate loop: $v_{in} = v_{gs} + v_s = v_{gs}(1 + g_mR_S)$, so $v_{gs} = \dfrac{v_{in}}{1 + g_mR_S}$. Only a fraction of the input reaches the transistor.
      3. That current also flows through $R_D$: $v_{out} = -g_mv_{gs}R_D$.

      $$A_v = -\frac{g_mR_D}{1 + g_mR_S}\ \xrightarrow{\ g_mR_S\gg1\ }\ -\frac{R_D}{R_S}$$
      **The point:** $R_S$ feeds back against the input: the more current, the higher the source, the smaller $v_{gs}$. With $r_{ds}$ kept, the drain sees $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$, the degenerated drain from Unit 7.`),
    ],
    'e2-u8-cg': [
      R(md`**Common gate.** The gate is held (incremental ground), the input comes in through $R_S$ at the source, $R_D$ at the drain. Take $r_{ds}\to\infty$ first.`, M({ g: 'gnd', s: 'RSvin', d: 'RDout' }), md`
      1. Gate at 0, so $v_{gs} = -v_s$.
      2. KCL at the source node: the current from $v_{in}$ through $R_S$ equals the current going up through the device, $-g_mv_{gs} = g_mv_s$: $\dfrac{v_{in} - v_s}{R_S} = g_mv_s$, so $v_s = \dfrac{v_{in}}{1 + g_mR_S}$.
      3. That same current, $g_mv_s$, comes out of the drain into $R_D$, but now it flows **up** out of the device (the dependent source current is negative): $v_{out} = +g_mv_sR_D$.

      $$A_v = +\frac{g_mR_D}{1 + g_mR_S} = +\frac{R_D}{R_S + 1/g_m}$$
      **The point:** same size as the degenerated CS, opposite sign. Raising the source *lowers* $v_{gs}$, which is why it does not invert.`),
    ],
    'e2-u8-cd': [
      R(md`**Common drain (source follower).** Input at the gate, drain at incremental ground, output at the source across $R_L$.`, M({ g: 'vin', d: 'gnd', s: 'out' }), md`
      1. $v_{gs} = v_{in} - v_{out}$: the output itself reduces the transistor's drive.
      2. KCL at the source: the dependent source pushes $g_mv_{gs}$ **into** the source node (drain at 0 above it); it leaves through $R_L$ and $r_{ds}$:
      $$g_m(v_{in} - v_{out}) = \frac{v_{out}}{R_L\parallel r_{ds}}$$
      3. Solve: $v_{out}\big(1 + g_m(R_L\parallel r_{ds})\big) = g_m(R_L\parallel r_{ds})\,v_{in}$.

      $$A_v = \frac{g_m(R_L\parallel r_{ds})}{1 + g_m(R_L\parallel r_{ds})} = \frac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m} < 1$$
      **The point:** the output feeds straight back into $v_{gs}$, so the source just follows the gate. The result reads as a voltage divider between $1/g_m$ (the source's own resistance, from Unit 7) and the load.`),
    ],
  };

  COURSE.units.forEach((u) => u.lessons.forEach((l) => {
    const add = D[l.id];
    if (!add) return;
    const at = l.steps.length && /Why this lesson/.test(l.steps[0].md || '') ? 1 : 0;
    l.steps.splice(at, 0, R(intro), ...add);
  }));
})();

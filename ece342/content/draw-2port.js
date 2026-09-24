/* draw-2port.js — Unit 1's two-port and y-parameter lessons, rewritten with the port conventions,
   the matrix, every measurement setup and a worked network all drawn. */
(function () {
  const { R, P, G } = C;
  const Dw = window.DRAW, T = window.TDRAW;
  const unit = (id) => COURSE.units.find((u) => u.id === id);
  const lesson = (uid, lid) => unit(uid).lessons.find((l) => l.id === lid);
  const byId = (id) => { for (const u of COURSE.units) for (const l of u.lessons) for (const s of l.steps) if (s.id === id) return s; return null; };

  // ================================================================ drawings
  // a two-port with the standard conventions: both currents flow INTO the + terminal of their port
  const box2 = (n, x0 = 1.2, x1 = 3.4) => [['box', [x0, -0.3], [x1, 2.1], { n }]];
  const ports = [
    ['w', [0.4, 0], [1.2, 0]], ['w', [0.4, 1.8], [1.2, 1.8]], ['w', [3.4, 0], [4.2, 0]], ['w', [3.4, 1.8], [4.2, 1.8]],
    ['term', [0.4, 0], { n: '1', side: 'l' }], ['term', [0.4, 1.8], { n: "1'", side: 'l' }], ['term', [4.2, 0], { n: '2' }], ['term', [4.2, 1.8], { n: "2'" }],
    ['vlab', [0.55, 0.35], [0.55, 1.45], { n: 'V_1' }], ['vlab', [4.05, 0.35], [4.05, 1.45], { n: 'V_2', side: 'l' }],
    ['iarr', [0.8, 0], 'r', { n: 'I_1' }], ['iarr', [3.8, 0], 'l', { n: 'I_2' }],
    ['iarr', [0.8, 1.8], 'l', { n: 'I_1', side: 'b', off: [0, 13] }], ['iarr', [3.8, 1.8], 'r', { n: 'I_2', side: 'b', off: [0, 13] }],
  ];
  const tpConv = (n = 'two-port') => [...box2(n), ...ports];

  // the four amplifier models
  const inV = [['term', [0, 0]], ['term', [0, 1.8]], ['w', [0, 0], [1, 0]], ['w', [0, 1.8], [1, 1.8]], ['R', [1, 0], [1, 1.8], { n: 'R_i' }], ['vlab', [0.3, 0.3], [0.3, 1.5], { n: 'v_i' }]];
  const inI = [...inV.filter((e) => e[0] !== 'vlab'), ['iarr', [0.5, 0], 'r', { n: 'i_i' }]];
  const outV = (lbl) => [['E', [2.6, 0.4], [2.6, 1.4], { n: lbl, side: 'l' }], ['w', [2.6, 0.4], [2.6, 0]], ['w', [2.6, 1.4], [2.6, 1.8], [4.2, 1.8]], ['R', [2.6, 0], [4.2, 0], { n: 'R_o' }], ['term', [4.2, 0]], ['term', [4.2, 1.8]], ['vlab', [4.5, 0.3], [4.5, 1.5], { n: 'v_o' }]];
  const outI = (lbl) => [['G', [2.6, 1.8], [2.6, 0], { n: lbl, side: 'l' }], ['w', [2.6, 0], [4.2, 0]], ['w', [2.6, 1.8], [4.2, 1.8]], ['R', [3.4, 0], [3.4, 1.8], { n: 'R_o' }], ['term', [4.2, 0]], ['term', [4.2, 1.8]], ['iarr', [3.9, 0], 'r', { n: 'i_o' }]];
  const vcvs = [...inV, ...outV('A_{vo}v_i')], vccs = [...inV, ...outI('G_mv_i')], ccvs = [...inI, ...outV('R_mi_i')], cccs = [...inI, ...outI('A_ii_i')];
  const vcvsOpen = [...inV, ...outV('A_{vo}v_i')];
  const vccsShort = [...inV, ...outI('G_mv_i').filter((e) => e[0] !== 'iarr'), ['w', [4.2, 0], [4.2, 1.8]], ['iarr', [4.2, 0.9], 'd', { n: 'i_{o,sc}' }]];
  const chain = [['V', [0, 0.5], [0, 1.5], { n: 'v_s', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.4, 0], { n: 'R_S' }], ['R', [1.4, 0], [1.4, 2], { n: 'R_i', side: 'l' }], ['vlab', [1.75, 0.3], [1.75, 1.7], { n: 'v_i' }],
    ['E', [3, 0.5], [3, 1.5], { n: 'A_{vo}v_i', side: 'l' }], ['w', [3, 0.5], [3, 0]], ['R', [3, 0], [4.6, 0], { n: 'R_o' }], ['R', [4.6, 0], [4.6, 2], { n: 'R_L' }], ['vlab', [5, 0.3], [5, 1.7], { n: 'v_o' }],
    ['w', [0, 1.5], [0, 2], [1.4, 2]], ['w', [3, 1.5], [3, 2], [4.6, 2]], ['gnd', [0.7, 2]], ['gnd', [3.8, 2]]];

  // y-parameter model
  const yModel = [['term', [0, 0], { n: '1', side: 'l' }], ['w', [0, 0], [3, 0]], ['R', [1.4, 0], [1.4, 1.8], { n: '1/y_{11}' }], ['G', [3, 1.8], [3, 0], { n: 'y_{12}V_2' }], ['w', [0, 1.8], [3, 1.8]], ['term', [0, 1.8], { n: "1'", side: 'l' }],
    ['vlab', [0.35, 0.3], [0.35, 1.5], { n: 'V_1' }], ['iarr', [0.7, 0], 'r', { n: 'I_1' }],
    ['G', [6, 1.8], [6, 0], { n: 'y_{21}V_1', side: 'l' }], ['w', [6, 0], [8.2, 0]], ['R', [7.2, 0], [7.2, 1.8], { n: '1/y_{22}' }], ['w', [6, 1.8], [8.2, 1.8]], ['term', [8.2, 0], { n: '2' }], ['term', [8.2, 1.8], { n: "2'" }],
    ['vlab', [8.55, 0.3], [8.55, 1.5], { n: 'V_2' }], ['iarr', [7.7, 0], 'l', { n: 'I_2' }]];
  // measurement setups on a y box
  const yBoxL = (left) => [...box2('[y]'), ['w', [0.4, 0], [1.2, 0]], ['w', [0.4, 1.8], [1.2, 1.8]], ['w', [3.4, 0], [4.2, 0]], ['w', [3.4, 1.8], [4.2, 1.8]], ...left];
  const srcL = (n) => [['w', [0.4, 0], [0.4, 0.3]], ['V', [0.4, 0.3], [0.4, 1.5], { n, side: 'l' }], ['w', [0.4, 1.5], [0.4, 1.8]], ['iarr', [0.8, 0], 'r', { n: 'I_1' }]];
  const srcR = (n) => [['w', [4.2, 0], [4.2, 0.3]], ['V', [4.2, 0.3], [4.2, 1.5], { n }], ['w', [4.2, 1.5], [4.2, 1.8]], ['iarr', [3.8, 0], 'l', { n: 'I_2' }]];
  const shortL = [['w', [0.4, 0], [0.4, 1.8]], ['iarr', [0.8, 0], 'r', { n: 'I_1' }]], shortR = [['w', [4.2, 0], [4.2, 1.8]], ['iarr', [3.8, 0], 'l', { n: 'I_2' }]];
  const meas1 = yBoxL([...srcL('V_1'), ...shortR, ['txt', [4.5, 0.9], '$V_2 = 0$', { a: 'l' }]]);
  const meas2 = yBoxL([...shortL, ...srcR('V_2'), ['txt', [0.1, 0.9], '$V_1 = 0$', { a: 'r' }]]);
  const rthV = yBoxL([['w', [0.4, 0], [0.4, 1.8]], ['txt', [0.1, 0.9], '$V_1 = 0$', { a: 'r' }], ...srcR('v_t')]);
  const rthI = yBoxL([['txt', [0.1, 0.9], '$I_1 = 0$', { a: 'r' }], ...srcR('v_t')]);
  // worked network (Handout 1, Example 1.2): R1 across port 1, R3 across port 2, R2 on top, R4 on the bottom
  const net = (left, right) => [...left, ['w', [0, 0], [1, 0]], ['w', [0, 1.8], [1, 1.8]], ['R', [1, 0], [1, 1.8], { n: 'R_1', s: '2\\kO' }],
    ['R', [1, 0], [3, 0], { n: 'R_2', s: '1\\kO' }], ['R', [1, 1.8], [3, 1.8], { n: 'R_4', s: '1\\kO', side: 'b' }],
    ['R', [3, 0], [3, 1.8], { n: 'R_3', s: '2\\kO', side: 'l' }], ['w', [3, 0], [4, 0]], ['w', [3, 1.8], [4, 1.8]], ...right];
  const tA = [['term', [0, 0], { n: 'a', side: 'l' }], ['term', [0, 1.8], { n: 'b', side: 'l' }]], tC = [['term', [4, 0], { n: 'c' }], ['term', [4, 1.8], { n: 'd' }]];
  const vL = (n) => [['V', [0, 0.35], [0, 1.45], { n, side: 'l' }], ['w', [0, 0], [0, 0.35]], ['w', [0, 1.45], [0, 1.8]], ['iarr', [0.5, 0], 'r', { n: 'I_1' }]];
  const vR = (n) => [['V', [4, 0.35], [4, 1.45], { n }], ['w', [4, 0], [4, 0.35]], ['w', [4, 1.45], [4, 1.8]], ['iarr', [3.5, 0], 'l', { n: 'I_2' }]];
  const sL = [['w', [0, 0], [0, 1.8]], ['iarr', [0.5, 0], 'r', { n: 'I_1' }]], sR = [['w', [4, 0], [4, 1.8]], ['iarr', [3.5, 0], 'l', { n: 'I_2' }]];
  const netPlain = net(tA, tC), net1 = net(vL('V_1'), sR), net2 = net(sL, vR('V_2'));
  const netLoad = net(vL('V_S'), [['R', [4, 0], [4, 1.8], { n: 'R_L', s: '2\\kO' }], ['iarr', [3.5, 0], 'l', { n: 'I_2' }], ['vlab', [4.4, 0.2], [4.4, 1.6], { n: 'V_2' }]]);

  FIGS.yport = (vdrive) => yBoxL([...(vdrive ? [['w', [0.4, 0], [0.4, 0.3]], ['V', [0.4, 0.3], [0.4, 1.5], { n: 'V_{IN}', side: 'l' }], ['w', [0.4, 1.5], [0.4, 1.8]]] : [['I', [0.4, 1.8], [0.4, 0], { n: 'I_{IN}', side: 'l' }]]),
    ['term', [4.2, 0], { n: '2' }], ['term', [4.2, 1.8], { n: "2'" }], ['txt', [4.5, 0.9], '$R_{TH}\\,?$', { a: 'l' }]]);

  // ================================================================ Two-port networks
  const TP = lesson('u1', 'u1-twoport');
  const tpGen = TP.steps.filter((s) => s.t === 'gen');
  const tpOld = TP.steps.filter((s) => s.t === 'prob');
  tpOld[0].figHtml = Dw.row([{ fig: T.mos, cap: 'MOSFET' }, { fig: T.mosModel, cap: 'port 1: gate–source, port 2: drain–source' }]).svg;
  const portNet = [['R', [0, 0], [1.6, 0], { n: 'R_1' }], ['R', [1.6, 0], [1.6, 1.8], { n: 'R_2' }], ['R', [1.6, 1.8], [0, 1.8], { n: 'R_4', side: 'b' }], ['R', [1.6, 0], [3.2, 0], { n: 'R_3' }], ['w', [1.6, 1.8], [3.2, 1.8]],
    ['I', [3.2, 1.8], [3.2, 0], { n: 'I_1' }], ['w', [-1, 0], [0, 0]], ['w', [-1, 1.8], [0, 1.8]], ['term', [-1, 0], { n: 'a', side: 'l' }], ['term', [-1, 1.8], { n: 'b', side: 'l' }]];
  tpOld[1].figHtml = Dw.row([
    { fig: portNet.concat([['iarr', [-0.5, 0], 'r', { n: 'I' }], ['iarr', [-0.5, 1.8], 'l', { n: 'I', side: 'b', off: [0, 13] }]]), cap: 'current in at $a$ = current out at $b$: a port' },
    { fig: portNet.concat([['w', [-0.5, 0], [-0.5, -0.9]], ['I', [-0.5, -0.9], [3.2, -0.9], { n: 'I_2' }], ['w', [3.2, -0.9], [3.2, 0]]]), cap: 'add $I_2$ from $a$ to elsewhere: currents at $a$ and $b$ differ, not a port' }]).svg;
  TP.title = 'Two-port networks';
  TP.steps = [
    R(md`
      ### Ports and the sign convention
      A **port** is a pair of terminals where the current going in at one terminal equals the current coming out of the other. A **two-port** has an input port (1–1') and an output port (2–2'). The standard convention: each port voltage is $+$ on the top terminal, and each port current flows **into** the top terminal.

      [[fig:conv]]

      Whether a pair of terminals is a port depends on what's connected outside:

      [[fig:ports]]
    `),
    R(md`
      ### An amplifier as a two-port
      Any linear amplifier, seen from its two ports, is three things:
      1. **Input:** the resistance $R_i$ seen looking into port 1.
      2. **Output:** a Thévenin (voltage source + $R_o$) or Norton (current source $\pl R_o$) equivalent at port 2.
      3. **The link:** the output source is controlled by the input voltage or current.

      Pick a voltage or a current at each side and you get four models. $R_i$ and $R_o$ are the same in all four:

      [[fig:four]]

      | Model | Gain | Measured with the output |
      |---|---|---|
      | VCVS | $A_{vo} = v_o/v_i$ | **open** (no load) |
      | VCCS | $G_m = i_o/v_i$ | **shorted** |
      | CCVS | $R_m = v_o/i_i$ | **open** |
      | CCCS | $A_i = i_o/i_i$ | **shorted** |

      [[fig:meas]]

      Switching forms is Thévenin ↔ Norton: $A_{vo} = G_mR_o$ (open-circuit voltage = short-circuit current × $R_o$).
    `),
    R(md`
      ### Source and load: two dividers
      Connect a source with resistance $R_S$ and a load $R_L$:

      [[fig:chain]]

      The input side is a divider ($R_S$ with $R_i$), then the gain, then the output side is a divider ($R_o$ with $R_L$):
      $$\frac{v_o}{v_s} = \frac{R_i}{R_i+R_S}\;A_{vo}\;\frac{R_L}{R_L+R_o}$$
      Both fractions are below 1, so loading always costs gain. You want $R_i \gg R_S$ and $R_o \ll R_L$. A MOSFET gate has $R_i = \infty$: no input loss at all.
    `),
    P({
      q: md`$R_S = 1\kO$, $R_i = 9\kO$, $A_{vo} = 20$, $R_o = 1\kO$, $R_L = 4\kO$. Find $v_i/v_s$, $v_o/v_s$, and the gain you'd get with no loading at all.`,
      fig: chain,
      parts: [{ lbl: 'v_i/v_s', unit: 'V/V', ans: 0.9 }, { lbl: 'v_o/v_s', unit: 'V/V', ans: 14.4 }, { lbl: 'A_{vo}', unit: 'V/V', ans: 20 }],
      sol: md`Input divider $\frac{9}{1+9} = 0.9$. Output divider $\frac{4}{1+4} = 0.8$. $v_o/v_s = 0.9\times20\times0.8 = 14.4$, versus $A_{vo} = 20$ unloaded.`,
    }),
    ...tpGen,
    tpOld[0], tpOld[1],
  ];
  TP.steps[0].figs = { conv: { fig: tpConv(), cap: 'port voltages $V_1, V_2$; currents $I_1, I_2$ flow into the top terminals' },
    ports: Dw.row([{ svg: tpOld[1].figHtml }]) };
  TP.steps[1].figs = {
    four: Dw.row([{ fig: vcvs, cap: 'VCVS' }, { fig: vccs, cap: 'VCCS' }, { fig: ccvs, cap: 'CCVS' }, { fig: cccs, cap: 'CCCS' }]),
    meas: Dw.row([{ fig: vcvsOpen, cap: 'voltage gain: output open, $A_{vo} = v_o/v_i$' }, { fig: vccsShort, cap: 'transconductance: output shorted, $G_m = i_{o,sc}/v_i$' }]),
  };
  TP.steps[2].figs = { chain: { fig: chain, cap: 'source → two-port (VCVS form) → load' } };

  // ================================================================ Y-parameters
  const YP = lesson('u1', 'u1-yparam');
  const ypGen = YP.steps.filter((s) => s.t === 'gen');
  const f23b = byId('F23-P1b');
  if (f23b) {
    f23b.fig = FIGS.yport(true);
    f23b.figs = { rth: { fig: rthV, cap: '$V_{IN}$ off = short: $V_1 = 0$, so $I_2 = y_{22}v_t$' } };
    f23b.sol = `[[fig:rth]]\n\n${f23b.sol}`;
  }
  YP.title = 'Y-parameters';
  YP.steps = [
    R(md`
      ### The idea
      Describe a linear two-port by how its **port currents** depend on its **port voltages**. By superposition each current is a weighted sum of $V_1$ and $V_2$:
      $$I_1 = y_{11}V_1 + y_{12}V_2,\qquad I_2 = y_{21}V_1 + y_{22}V_2$$
      $$\begin{bmatrix}I_1\\ I_2\end{bmatrix} = \begin{bmatrix}y_{11} & y_{12}\\ y_{21} & y_{22}\end{bmatrix}\begin{bmatrix}V_1\\ V_2\end{bmatrix}$$
      Each $y$ is current over voltage: a conductance (siemens). "Admittance parameters."

      [[fig:box]]
    `),
    R(md`
      ### Measuring each parameter
      To isolate one column of the matrix, make the other voltage zero by **shorting that port**.

      **Port 2 shorted ($V_2 = 0$), source at port 1.** Then $I_1 = y_{11}V_1$ and $I_2 = y_{21}V_1$:
      $$y_{11} = \frac{I_1}{V_1}\bigg|_{V_2=0}\ (\text{input admittance}),\qquad y_{21} = \frac{I_2}{V_1}\bigg|_{V_2=0}\ (\text{forward transfer})$$

      [[fig:m1]]

      **Port 1 shorted ($V_1 = 0$), source at port 2.** Then $I_1 = y_{12}V_2$ and $I_2 = y_{22}V_2$:
      $$y_{12} = \frac{I_1}{V_2}\bigg|_{V_1=0}\ (\text{reverse transfer}),\qquad y_{22} = \frac{I_2}{V_2}\bigg|_{V_1=0}\ (\text{output admittance})$$

      [[fig:m2]]

      The two equations are exactly this circuit: a conductance $y_{11}$ in parallel with a controlled source $y_{12}V_2$ at the input, and a controlled source $y_{21}V_1$ in parallel with $y_{22}$ at the output.

      [[fig:model]]

      A MOSFET (gate–source in, drain–source out): no gate current gives $y_{11} = y_{12} = 0$; the drain current is $g_mv_{gs} + v_{ds}/r_o$, so $y_{21} = g_m$ and $y_{22} = 1/r_o$.
    `),
    R(md`
      ### Worked network (Handout 1, Example 1.2)
      $R_1$ across port 1, $R_3$ across port 2, $R_2$ joining the tops, $R_4$ joining the bottoms.

      [[fig:net]]

      **$y_{11}$, $y_{21}$: short port 2.** The short puts $R_3$ out of the picture. From port 1, current has two paths: $R_1$, and $R_2 + R_4$ in series (through the short):

      [[fig:n1]]

      $$y_{11} = \frac1{R_1} + \frac1{R_2 + R_4} = 0.5 + 0.5 = 1\,\text{mS},\qquad y_{21} = -\frac1{R_2+R_4} = -0.5\,\text{mS}$$
      $y_{21}$ is negative: the current through $R_2$ comes out of terminal $c$ into the short, which is opposite to the "into the port" direction of $I_2$.

      **$y_{12}$, $y_{22}$: short port 1.** Now $R_1$ is shorted:

      [[fig:n2]]

      $$y_{22} = \frac1{R_3} + \frac1{R_2+R_4} = 1\,\text{mS},\qquad y_{12} = -\frac1{R_2+R_4} = -0.5\,\text{mS}$$
    `),
    R(md`
      ### Using the matrix: a load, and $\RTH$
      **Load current.** Source $V_S$ at port 1 and $R_L$ at port 2. The load current flows **out** of the top of port 2, so $V_2 = -I_2R_L$. Put that in the second equation:
      $$I_2 = y_{21}V_S + y_{22}(-I_2R_L) \;\Rightarrow\; I_2 = \frac{y_{21}V_S}{1 + y_{22}R_L}$$

      [[fig:load]]

      **$\RTH$ at port 2** depends on what drives port 1, because switching that source off sets a different boundary condition:
      - **Ideal voltage source** off is a short: $V_1 = 0$, so $I_2 = y_{22}V_2$ and $\RTH = \dfrac1{y_{22}}$ ($y_{21}$, $y_{12}$ don't matter).
      - **Ideal current source** off is an open: $I_1 = 0$, so $V_1 = -\dfrac{y_{12}}{y_{11}}V_2$ and $\RTH = \dfrac{1}{y_{22} - y_{12}y_{21}/y_{11}}$.

      [[fig:rth]]
    `),
    P({
      q: md`For the worked network ($R_1 = R_3 = 2\kO$, $R_2 = R_4 = 1\kO$), find all four y-parameters.`,
      fig: netPlain,
      parts: [{ lbl: 'y_{11}', unit: 'mS', ans: 1 }, { lbl: 'y_{12}', unit: 'mS', ans: -0.5 }, { lbl: 'y_{21}', unit: 'mS', ans: -0.5 }, { lbl: 'y_{22}', unit: 'mS', ans: 1 }],
      hints: [md`Short port 2 and drive port 1 for $y_{11}$, $y_{21}$. Short port 1 and drive port 2 for $y_{12}$, $y_{22}$.`],
      figs: { a: { fig: net1, cap: 'port 2 shorted' }, b: { fig: net2, cap: 'port 1 shorted' } },
      sol: md`[[fig:a]]

$y_{11} = \frac1{2\text{k}} + \frac1{2\text{k}} = 1\,\text{mS}$; the current in $R_2 + R_4$ leaves at $c$, so $y_{21} = -0.5\,\text{mS}$.

[[fig:b]]

$y_{22} = \frac1{2\text{k}} + \frac1{2\text{k}} = 1\,\text{mS}$, $y_{12} = -0.5\,\text{mS}$.`,
    }),
    P({
      q: md`The same network with $V_S = 1\,\text{V}$ at port 1 and $R_L = 2\kO$ at port 2. Find $I_2$ (into port 2) and $V_2$.`,
      fig: netLoad,
      parts: [{ lbl: 'I_2', unit: 'mA', ans: -1 / 6 }, { lbl: 'V_2', unit: 'V', ans: 1 / 3 }],
      hints: [md`$I_2 = \dfrac{y_{21}V_S}{1 + y_{22}R_L}$ with $y_{21} = -0.5\,\text{mS}$, $y_{22} = 1\,\text{mS}$.`],
      sol: md`$I_2 = \dfrac{(-0.5\text{m})(1)}{1 + (1\text{m})(2\text{k})} = -0.167\,\text{mA}$, $V_2 = -I_2R_L = 0.333\,\text{V}$. Check directly: $1\,\text{V}$ drives $R_2 + (R_3\pl R_L) + R_4 = 3\kO$: $0.333\,\text{mA}$, and $V_2 = 0.333\,\text{mA}\times1\kO = 0.333\,\text{V}$ ✓.`,
    }),
    P({
      q: md`Same network. Find $\RTH$ at port 2 when port 1 is driven by (a) an ideal voltage source, (b) an ideal current source.`,
      fig: netPlain,
      parts: [{ lbl: '\\RTH\\text{ (a)}', unit: 'kΩ', ans: 1 }, { lbl: '\\RTH\\text{ (b)}', unit: 'kΩ', ans: 4 / 3 }],
      figs: { rv: { fig: net(sL.slice(0, 1), [['V', [4, 0.35], [4, 1.45], { n: 'v_t' }], ['w', [4, 0], [4, 0.35]], ['w', [4, 1.45], [4, 1.8]]]), cap: '(a) source off = short' }, ri: { fig: net(tA, [['V', [4, 0.35], [4, 1.45], { n: 'v_t' }], ['w', [4, 0], [4, 0.35]], ['w', [4, 1.45], [4, 1.8]]]), cap: '(b) source off = open' } },
      sol: md`[[fig:rv]]

(a) $\RTH = 1/y_{22} = 1\kO$. Directly: $R_3\pl(R_2 + R_4) = 2\pl2 = 1\kO$ ✓.

[[fig:ri]]

(b) $\RTH = \dfrac{1}{1 - (-0.5)(-0.5)/1}\,\text{k} = \dfrac{1}{0.75}\,\text{k} = 1.33\kO$. Directly: $R_3\pl(R_2 + R_1 + R_4) = 2\pl4 = 1.33\kO$ ✓.`,
    }),
    ...(f23b ? [f23b] : []),
    ...ypGen,
    P({
      q: md`A MOSFET viewed as a two-port (gate–source in, drain–source out, with output resistance $r_o$). Which y-parameter equals $g_m$?`,
      figHtml: Dw.row([{ fig: T.mos, cap: 'MOSFET' }, { fig: T.mosModel.concat([['R', [2.6, -0.1], [2.6, 1.9], { n: 'r_o' }], ['w', [1.6, -0.1], [2.6, -0.1]], ['w', [1.6, 1.9], [2.6, 1.9]]]), cap: 'model with $r_o$' }]).svg,
      parts: [{ mc: ['$y_{21}$', '$y_{11}$', '$y_{12}$', '$y_{22}$'], a: 0, why: [null, 'No gate current: $y_{11} = 0$.', 'The output can\'t push current into the gate: $y_{12} = 0$.', '$y_{22} = 1/r_o$.'] }],
      sol: md`$I_2 = g_mV_1 + V_2/r_o$, so $y_{21} = g_m$ (forward transfer) and $y_{22} = 1/r_o$; $y_{11} = y_{12} = 0$.`,
    }),
  ];
  YP.steps[0].figs = { box: { fig: tpConv('[y]'), cap: 'the two-port: $V_1, I_1$ at port 1, $V_2, I_2$ at port 2' } };
  YP.steps[1].figs = { m1: { fig: meas1, cap: '$y_{11} = I_1/V_1$, $y_{21} = I_2/V_1$' }, m2: { fig: meas2, cap: '$y_{12} = I_1/V_2$, $y_{22} = I_2/V_2$' }, model: { fig: yModel, cap: 'y-parameter equivalent circuit' } };
  YP.steps[2].figs = { net: { fig: netPlain, cap: 'the network' }, n1: { fig: net1, cap: 'port 2 shorted' }, n2: { fig: net2, cap: 'port 1 shorted' } };
  YP.steps[3].figs = { load: { fig: netLoad, cap: '$V_2 = -I_2R_L$' }, rth: Dw.row([{ fig: rthV, cap: 'voltage-driven: $V_1 = 0$' }, { fig: rthI, cap: 'current-driven: $I_1 = 0$' }]) };
})();

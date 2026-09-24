/* fix-leaks.js — no question figure may show or caption its own answer. Answer-revealing drawings move
   into the solution, and a question never repeats the numbers of the worked example right before it. */
(function () {
  const { P } = C;
  const Dw = window.DRAW, T = window.TDRAW;
  const unit = (id) => COURSE.units.find((u) => u.id === id);
  const lesson = (uid, lid) => unit(uid).lessons.find((l) => l.id === lid);
  const probs = (uid, lid) => lesson(uid, lid).steps.filter((s) => s.t === 'prob');
  const toSol = (p, key, F) => { p.figs = Object.assign(p.figs || {}, { [key]: F }); p.sol = `[[fig:${key}]]\n\n${p.sol}`; };

  // ---- Unit 2: "a DC current source becomes..." shows only the source
  const tw = probs('u2', 'u2-twopass')[0];
  const isrc = [['I', [0, 1.6], [0, 0], { n: 'I_{DC}' }], ['term', [0, 0]], ['term', [0, 1.6]]];
  tw.figHtml = undefined; tw.fig = isrc;
  toSol(tw, 'open', Dw.row([{ fig: isrc, cap: 'DC current source' }, { fig: [['term', [0, 0]], ['term', [0, 1.6]]], cap: 'small signal: open' }]));

  // current label off the resistor
  const tw2 = probs('u2', 'u2-twopass')[1];
  tw2.fig = tw2.fig.map((e) => (e[0] === 'iarr' ? ['iarr', [1.8, 0.2], 'd', { n: 'I_0 + \\Delta I', side: 'l', off: [-14, 0] }] : e));

  // ---- Unit 4: the divider question without "I_G = 0"
  const b1 = probs('u4', 'u4-basics')[1];
  const ans = b1.fig;
  b1.fig = ans.filter((e) => e[0] !== 'iarr');
  toSol(b1, 'ig', { fig: ans, cap: 'no current enters the gate' });

  // ---- Unit 1: independent source question shows only the source; the v–i plot is the explanation
  const lin = probs('u1', 'u1-linear')[3];
  lin.figHtml = undefined;
  lin.fig = [['V', [0, 0], [0, 1.4], { n: 'V_0' }], ['iarr', [0, 0], 'd', { n: 'i', side: 'l', off: [-14, 4] }], ['vlab', [0.5, 0.1], [0.5, 1.3], { n: 'v' }]];
  toSol(lin, 'vi', { svg: Schem.plot({ w: 300, h: 200, x: [-2, 2], y: [0, 3], xl: 'i', yl: 'v', xt: [-2, 0, 2], yt: [0, 1, 2, 3], curves: [{ f: () => 2 }], pts: [{ x: 0, y: 2, n: 'V_0' }] }), cap: '$v = V_0$ for every $i$: the line misses the origin' });

  // ---- Unit 1, two-ports: the port question and the MOSFET questions don't show their answers
  const tp = probs('u1', 'u1-twoport');
  const portQ = tp.find((p) => /qualify as a/.test(p.q));
  if (portQ) {
    const old = portQ.figHtml;
    portQ.figHtml = undefined;
    portQ.fig = [['R', [0, 0], [1.6, 0], { n: 'R_1' }], ['R', [1.6, 0], [1.6, 1.8], { n: 'R_2' }], ['R', [1.6, 1.8], [0, 1.8], { n: 'R_4', side: 'b' }], ['R', [1.6, 0], [3.2, 0], { n: 'R_3' }], ['w', [1.6, 1.8], [3.2, 1.8]],
      ['I', [3.2, 1.8], [3.2, 0], { n: 'I_1' }], ['w', [-1, 0], [0, 0]], ['w', [-1, 1.8], [0, 1.8]], ['term', [-1, 0], { n: 'a', side: 'l' }], ['term', [-1, 1.8], { n: 'b', side: 'l' }]];
    toSol(portQ, 'ports', { svg: old });
  }
  const mosSym = [['nmos', [1, 1]], ['txt', [1.25, -0.15], '$D$', { a: 'l' }], ['txt', [1.25, 2.15], '$S$', { a: 'l' }], ['txt', [-0.1, 0.75], '$G$', { a: 'c' }]];
  const mosQ = tp.find((p) => /Which gain parameter describes a MOSFET/.test(p.q));
  if (mosQ) { const old = mosQ.figHtml; mosQ.figHtml = undefined; mosQ.fig = mosSym; toSol(mosQ, 'model', { svg: old }); }
  const yMos = probs('u1', 'u1-yparam').find((p) => /A MOSFET viewed as a two-port/.test(p.q));
  if (yMos) { const old = yMos.figHtml; yMos.figHtml = undefined; yMos.fig = mosSym; toSol(yMos, 'model', { svg: old }); }

  // ---- Unit 1, canonical stages: R_TH questions show the plain model; the test setup is the solution
  for (const p of probs('u1', 'u1-canonical')) {
    if (p.fig === T.csTest) { p.fig = T.csM; toSol(p, 'test', { fig: T.csTest, cap: '$v_{in}$ shorted, $v_t$ applied: $v_x = 0$, the diamond is dead' }); }
    if (p.fig === T.folNoROTest) { p.fig = T.folNoRO; toSol(p, 'test', { fig: T.folNoROTest, cap: '$v_{in}$ shorted, $v_t$ applied: $v_x = -v_t$' }); }
  }

  // ---- Unit 1, test-source method: the practice circuit uses a different load than the worked example
  const ts = probs('u1', 'u1-testsource')[0];
  const fig2 = ts.fig.map((e) => (e[0] === 'R' && Dw.optOf(e).n === 'R_L' ? ['R', e[1], e[2], { n: 'R_L', s: '1.25\\kO', v: 1250 }] : e));
  const th = Schem.thevenin(fig2, 'o');
  ts.fig = fig2;
  ts.q = md`The same circuit as the worked example, but with $R_L = 1.25\kO$. Find $\VTH$ at $v_{out}$ for $v_{in} = 1\,\text{V}$, and $\RTH$.`;
  ts.parts = [{ lbl: '\\VTH', unit: 'V', ans: th.VTH }, { lbl: '\\RTH', unit: 'kΩ', ans: th.RTH / 1000 }];
  ts.figs = { test: { fig: Dw.test(fig2, { at: [6, 0] }), cap: '$v_{in}$ shorted, $v_t$ applied' } };
  ts.sol = md`**$\VTH$** (output open). KCL at $o$: $\dfrac{v_o}{1.25\text{k}} + 2\text{m}\,v_x + \dfrac{v_o - v_x}{2\text{k}} = 0 \Rightarrow 1.3\,v_o = -1.5\,v_x$. KCL at $x$: $2.5\,v_x - 0.5\,v_o = 1$ (in mS·V). Together: $v_x = 0.325\,\text{V}$, $\VTH = -0.375\,\text{V}$.

**$\RTH$:**

[[fig:test]]

$v_x = \dfrac{v_t}{5}$ as before (the left side didn't change), and $i_t = v_t(0.8 + 0.4 + 0.4)\,\text{mS} = 1.6\,\text{mS}\cdot v_t$, so $\RTH = 625\,\Omega$.`;

  // ---- Unit 1, y-parameters: "find all four" uses a new network, not the worked one
  const net = (vals, left, right) => [...left, ['w', [0, 0], [1, 0]], ['w', [0, 1.8], [1, 1.8]], ['R', [1, 0], [1, 1.8], { n: 'R_1', s: vals[0] }],
    ['R', [1, 0], [3, 0], { n: 'R_2', s: vals[1] }], ['R', [1, 1.8], [3, 1.8], { n: 'R_4', s: vals[3], side: 'b' }],
    ['R', [3, 0], [3, 1.8], { n: 'R_3', s: vals[2], side: 'l' }], ['w', [3, 0], [4, 0]], ['w', [3, 1.8], [4, 1.8]], ...right];
  const V = ['1\\kO', '2\\kO', '4\\kO', '2\\kO'];
  const tA = [['term', [0, 0], { n: 'a', side: 'l' }], ['term', [0, 1.8], { n: 'b', side: 'l' }]], tC = [['term', [4, 0], { n: 'c' }], ['term', [4, 1.8], { n: 'd' }]];
  const vL = [['V', [0, 0.35], [0, 1.45], { n: 'V_1', side: 'l' }], ['w', [0, 0], [0, 0.35]], ['w', [0, 1.45], [0, 1.8]], ['iarr', [0.5, 0], 'r', { n: 'I_1' }]];
  const vR = [['V', [4, 0.35], [4, 1.45], { n: 'V_2' }], ['w', [4, 0], [4, 0.35]], ['w', [4, 1.45], [4, 1.8]], ['iarr', [3.5, 0], 'l', { n: 'I_2' }]];
  const sL = [['w', [0, 0], [0, 1.8]], ['iarr', [0.5, 0], 'r', { n: 'I_1' }]], sR = [['w', [4, 0], [4, 1.8]], ['iarr', [3.5, 0], 'l', { n: 'I_2' }]];
  const yq = probs('u1', 'u1-yparam').find((p) => /find all four y-parameters/.test(p.q));
  if (yq) {
    yq.q = md`A new network of the same shape: $R_1 = 1\kO$, $R_2 = 2\kO$, $R_3 = 4\kO$, $R_4 = 2\kO$. Find all four y-parameters.`;
    yq.fig = net(V, tA, tC);
    yq.parts = [{ lbl: 'y_{11}', unit: 'mS', ans: 1.25 }, { lbl: 'y_{12}', unit: 'mS', ans: -0.25 }, { lbl: 'y_{21}', unit: 'mS', ans: -0.25 }, { lbl: 'y_{22}', unit: 'mS', ans: 0.5 }];
    yq.figs = { a: { fig: net(V, vL, sR), cap: 'port 2 shorted' }, b: { fig: net(V, sL, vR), cap: 'port 1 shorted' } };
    yq.sol = md`[[fig:a]]

$y_{11} = \dfrac{1}{R_1} + \dfrac{1}{R_2 + R_4} = 1 + 0.25 = 1.25\,\text{mS}$; the current through $R_2 + R_4$ leaves at $c$, so $y_{21} = -\dfrac{1}{R_2+R_4} = -0.25\,\text{mS}$.

[[fig:b]]

$y_{22} = \dfrac{1}{R_3} + \dfrac{1}{R_2 + R_4} = 0.25 + 0.25 = 0.5\,\text{mS}$, $y_{12} = -0.25\,\text{mS}$.`;
  }

  // ---- Unit 2, load line: the reading's example no longer matches the problem that follows it
  const ll = lesson('u2', 'u2-loadline').steps[0];
  const llCirc = [['V', [0, 0.5], [0, 1.5], { n: 'V_{TH}', s: '8\\,\\text{V}', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_{TH}', s: '2\\kO' }], ['X', [1.8, 0], [1.8, 2], { n: '\\text{device}' }],
    ['w', [0, 1.5], [0, 2], [1.8, 2]], ['vlab', [2.3, 0.2], [2.3, 1.8], { n: 'V' }], ['iarr', [0.9, 0], 'r', { n: 'I', side: 'b', off: [0, 14] }]];
  const llPlot = Schem.plot({ w: 360, h: 230, x: [0, 8.6], y: [0, 4.5], xl: 'V\\,(\\text{V})', yl: 'I\\,(\\text{mA})', xt: [0, 2, 4, 6, 8], yt: [0, 1, 2, 3, 4],
    curves: [{ f: (v) => (v < 2 ? 0 : (v - 2) / 2), cls: 'dc' }, { f: (v) => (8 - v) / 2, from: 0, to: 8 }], pts: [{ x: 5, y: 1.5, n: 'Q' }, { x: 0, y: 4, n: 'V_{TH}/R_{TH}' }, { x: 8, y: 0, n: 'V_{TH}' }] });
  ll.figs.ll = Dw.row([{ fig: llCirc, cap: 'a device behind a Thévenin equivalent ($8\\,\\text{V}$, $2\\,\\text{k}\\Omega$)' }, { svg: llPlot, cap: 'device curve (amber) and load line cross at $Q = (5\\,\\text{V}, 1.5\\,\\text{mA})$' }]);
})();

/* diode-numerics.js — Handout 2's numerical side, drawn out:
   Newton–Raphson (lesson u3-newton, after u3-iterate) and how small a small signal must be (u3-swing, after u3-rd). */
(function () {
  const { P, G } = C;
  const R = (text, o) => Object.assign(C.R(text), o || {});   // a reading with its own drawings
  const u3 = COURSE.units.find((u) => u.id === 'u3');
  const after = (id, l) => u3.lessons.splice(u3.lessons.findIndex((x) => x.id === id) + 1, 0, l);
  const plot = (o) => Schem.plot(Object.assign({ w: 360, h: 230 }, o));
  const row = window.DRAW.row;
  const clip = (fn, a, b, lo, hi) => { const out = []; for (let i = 0; i <= 240; i++) { const x = a + (b - a) * i / 240, y = fn(x); if (y >= lo && y <= hi) out.push([x, y]); } return out; };
  const fx = (x, d) => x.toFixed(d);

  // ---------------------------------------------------------------- circuits
  const circ = (vs, rs) => [
    ['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: vs, side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_S', s: rs }],
    ['D', [1.8, 0], [1.8, 2]], ['w', [0, 1.5], [0, 2], [1.8, 2]], ['gnd', [0.9, 2]],
    ['vlab', [2.3, 0.2], [2.3, 1.8], { n: 'v_D' }], ['iarr', [1.8, 0.35], 'd', { n: 'i_D', side: 'l', off: [-14, 0] }],
  ];
  const companion = [
    ['V', [0, 0.5], [0, 1.5], { n: 'V_S', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_S' }],
    ['R', [1.8, 0], [1.8, 1], { n: 'r_{d,n}' }], ['V', [1.8, 1], [1.8, 2], { n: 'V_{0,n}' }],
    ['w', [0, 1.5], [0, 2], [1.8, 2]], ['gnd', [0.9, 2]], ['vlab', [2.9, 0.2], [2.9, 1.8], { n: 'v_{D,n+1}' }],
  ];
  const string2 = [
    ['V', [0, 0.8], [0, 1.8], { n: 'V_S', s: '3\\,\\text{V}', side: 'l' }], ['w', [0, 0.8], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_S', s: '1\\kO' }],
    ['D', [1.8, 0], [1.8, 1.3]], ['D', [1.8, 1.3], [1.8, 2.6]], ['w', [0, 1.8], [0, 2.6], [1.8, 2.6]], ['gnd', [0.9, 2.6]],
    ['vlab', [2.3, 0.2], [2.3, 2.4], { n: 'v' }],
  ];

  // ---------------------------------------------------------------- Handout 2 example: 2 V, 1 kΩ, IS = 1e-14 A, n = 1, VT = 26 mV
  const H = { VS: 2, RS: 1000, IS: 1e-14, VT: 0.026 };
  const hI = (v) => H.IS * Math.exp(v / H.VT) * 1e3;          // mA
  const hf = (v) => (H.VS - v) / H.RS * 1e3 - hI(v);         // mA
  const hG = (v) => 1e3 / H.RS + hI(v) / H.VT;                // mS, = -f'
  const newton = (v0, N) => { const s = [v0]; for (let i = 0; i < N; i++) s.push(s[i] + hf(s[i]) / hG(s[i])); return s; };
  const s7 = newton(0.7, 5), s6 = newton(0.6, 13), VQ = s6[13], IQ = (H.VS - VQ) / H.RS * 1e3;

  const setupPlot = plot({ x: [0, 2.1], y: [0, 2.4], xl: 'v_D\\,(\\text{V})', yl: 'i_D\\,(\\text{mA})', xt: [0, 0.5, 1, 1.5, 2], yt: [0, 1, 2],
    curves: [{ pts: clip(hI, 0, 2.1, 0, 2.4), cls: 'dc' }, { f: (v) => H.VS - v, from: 0, to: 2 }], pts: [{ x: VQ, y: IQ, n: 'Q' }] });
  const fPlot = plot({ x: [0.6, 0.72], y: [-4, 1.6], xl: 'v_D\\,(\\text{V})', yl: 'f\\,(\\text{mA})', xt: [0.6, 0.65, 0.7], yt: [-4, -2, 0],
    curves: [{ pts: clip(hf, 0.6, 0.72, -4, 1.6), cls: 'dc' }], pts: [{ x: VQ, y: 0, n: 'Q' }, { x: 0.62, y: hf(0.62), n: 'f > 0' }, { x: 0.69, y: hf(0.69), n: 'f < 0' }] });
  const [v0, v1, v2] = s7;
  const tanPlot = plot({ x: [0.655, 0.71], y: [-4.2, 1.2], xl: 'v_D\\,(\\text{V})', yl: 'f\\,(\\text{mA})', xt: [0.66, 0.68, 0.7], yt: [-4, -2, 0],
    curves: [
      { pts: clip(hf, 0.655, 0.71, -4.2, 1.2), cls: 'dc' },
      { pts: [[v0, hf(v0)], [v1, 0]] }, { pts: [[v1, 0], [v1, hf(v1)]], cls: 'dash' },
      { pts: [[v1, hf(v1)], [v2, 0]] },
    ],
    pts: [{ x: v0, y: hf(v0), n: 'V_{D,0}' }, { x: v1, y: 0, n: 'V_{D,1}' }, { x: v2, y: 0, n: 'V_{D,2}' }] });
  const I0 = hI(0.7), r0 = H.VT / I0 * 1e3;                     // mA, Ω
  const compPlot = plot({ x: [0.6, 0.75], y: [0, 6], xl: 'v_D\\,(\\text{V})', yl: 'i_D\\,(\\text{mA})', xt: [0.6, 0.65, 0.7], yt: [0, 2, 4, 6],
    curves: [
      { pts: clip(hI, 0.6, 0.75, 0, 6), cls: 'dc' }, { f: (v) => H.VS - v, from: 0.6, to: 0.75 },
      { pts: clip((v) => I0 + (v - 0.7) / r0 * 1e3, 0.6, 0.75, 0, 6), cls: 'dash' },
    ],
    pts: [{ x: 0.7, y: I0, n: 'V_{D,0}' }, { x: v1, y: H.VS - v1, n: 'V_{D,1}' }, { x: VQ, y: IQ }] });
  const startPlot = plot({ x: [0, 13], y: [0.55, 0.9], xl: '\\text{step } n', yl: 'V_{D,n}\\,(\\text{V})', xt: [0, 5, 10], yt: [0.6, 0.7, 0.8, 0.9],
    curves: [{ f: () => VQ, cls: 'ink' }, { pts: s6.map((v, i) => [i, v]) }, { pts: s7.map((v, i) => [i, v]), cls: 'dash' }],
    pts: s6.map((v, i) => ({ x: i, y: v })) });

  // one-step drill: 2 V, 1 kΩ, diode carries 1 mA at 0.7 V, VT = 25 mV
  const dI = (v) => Math.exp((v - 0.7) / 0.025);               // mA
  const df = (v) => (2 - v) - dI(v);                            // mA (R = 1 kΩ)
  const dG = (v) => 1 + dI(v) / 0.025;                          // mS
  const d1 = 0.7 + df(0.7) / dG(0.7);
  let dq = 0.7; for (let i = 0; i < 30; i++) dq += df(dq) / dG(dq);
  const oneStepPlot = plot({ x: [0.68, 0.73], y: [-1, 1], xl: 'V_D\\,(\\text{V})', yl: 'f\\,(\\text{mA})', xt: [0.7], yt: [0],
    curves: [{ pts: clip(df, 0.68, 0.73, -1, 1), cls: 'dc' }, { pts: clip((v) => 0.3 - 41 * (v - 0.7), 0.68, 0.73, -1, 1) }],
    pts: [{ x: 0.7, y: 0.3, n: 'V_{D,0}' }, { x: d1, y: 0, n: 'V_{D,1}' }] });
  const low1 = 0.5 + df(0.5) / dG(0.5);
  const lowPlot = plot({ x: [0.4, 2.1], y: [-1, 2], xl: 'V_D\\,(\\text{V})', yl: 'f\\,(\\text{mA})', xt: [0.5, 1, 1.5, 2], yt: [0, 1, 2],
    curves: [{ pts: clip(df, 0.4, 2.1, -1, 2), cls: 'dc' }, { pts: [[0.5, df(0.5)], [low1, 0]] }],
    pts: [{ x: 0.5, y: df(0.5), n: 'V_{D,0}' }, { x: low1, y: 0, n: 'V_{D,1}' }, { x: dq, y: 0, n: 'Q' }] });

  const tbl7 = s7.slice(0, 5).map((v, i) => `| ${i} | ${fx(v, 4)} | ${hI(v).toPrecision(4)} | ${fx((H.VS - v), 4)} | ${hf(v).toPrecision(4)} | ${(-hG(v)).toPrecision(4)} | ${fx(hf(v) / hG(v) * 1e3, 2)} |`).join('\n        ');

  after('u3-iterate', {
    id: 'u3-newton', title: 'Newton–Raphson',
    steps: [
      R(md`
        ### One equation that algebra can't solve
        The same current flows through $R_S$ and the diode, so both laws must hold at once:
        $$i_D = \frac{V_S - v_D}{R_S}\qquad\text{and}\qquad i_D = I_Se^{v_D/(nV_T)}$$
        Set them equal and $v_D$ sits both outside and inside an exponential. No algebra isolates it. On a plot, the answer is where the load line crosses the diode curve:

        [[fig:setup]]
      `, { figs: { setup: row([{ fig: circ('2\\,\\text{V}', '1\\kO'), cap: 'Handout 2 circuit' }, { svg: setupPlot, cap: 'load line meets the diode curve at $Q$' }]) } }),
      R(md`
        ### Make it "find the zero"
        Subtract the two laws. $f$ is the **current mismatch** at a trial voltage: what the resistor would deliver minus what the diode would take.
        $$f(v_D) = \frac{V_S - v_D}{R_S} - I_Se^{v_D/(nV_T)}$$
        - $f > 0$: the resistor pushes more than the diode takes. The trial $v_D$ is **too low**.
        - $f < 0$: the trial $v_D$ is **too high**.
        - $f = 0$: the operating point $Q$.

        [[fig:f]]

        (Shockley's $e^{v_D/(nV_T)} - 1$ has a $-1$. Next to $e^{25}$ it's nothing; drop it.)
      `, { figs: { f: { svg: fPlot, cap: '$f$ for the Handout 2 circuit: one zero, at $Q = 0.666\\,\\text{V}$' } } }),
      R(md`
        ### Newton's idea: follow the tangent
        Near a guess $v_n$, replace the curve $f$ by its tangent line and jump to where the **tangent** hits zero:
        $$0 = f(v_n) + f'(v_n)\,(v_{n+1} - v_n)\qquad\Rightarrow\qquad v_{n+1} = v_n - \frac{f(v_n)}{f'(v_n)}$$

        [[fig:tan]]

        Each landing is closer, because near $Q$ the curve and its tangent are almost the same line.
      `, { figs: { tan: { svg: tanPlot, cap: 'from $V_{D,0} = 0.7\\,\\text{V}$: tangent to zero, back up to the curve, tangent again' } } }),
      R(md`
        ### The derivative is a conductance
        $$f'(v_D) = -\frac{1}{R_S} - \frac{I_S}{nV_T}e^{v_D/(nV_T)} = -\left(\frac{1}{R_S} + \frac{I_D}{nV_T}\right)$$
        $\dfrac{I_D}{nV_T}$ is $\dfrac{1}{r_d}$, the diode's small-signal conductance at the guess. So $-f'$ is the **total conductance** at the diode node, and one Newton step is Ohm's law on the leftover current:
        $$\Delta v = v_{n+1} - v_n = \frac{f}{-f'} = \frac{\text{mismatch current}}{\dfrac{1}{R_S} + \dfrac{1}{r_d}}$$

        !!tip Units that just work
        Currents in mA and conductances in mS give $\Delta v$ in volts.
      `),
      R(md`
        ### The same step, as a circuit
        Replacing the diode curve by its tangent at $v_n$ turns the diode into a battery plus a resistor: the piecewise-linear model, fitted at the guess.
        $$r_{d,n} = \frac{nV_T}{I_{D,n}},\qquad V_{0,n} = v_n - I_{D,n}\,r_{d,n}$$

        [[fig:comp]]

        Solve that linear circuit; its node voltage is $v_{n+1}$. On the I–V plot that's where the tangent (dashed) meets the load line. At $0.7\,\text{V}$: $r_{d,0} = ${fx(r0, 3)}\,\Omega$, $V_{0,0} = ${fx(0.7 - I0 * r0 / 1e3, 4)}\,\text{V}$, and the circuit gives $${fx(v1, 4)}\,\text{V}$, the same as the formula.
      `, { figs: { comp: row([{ fig: companion, cap: 'diode → its tangent at $v_n$' }, { svg: compPlot, cap: 'tangent meets the load line at $V_{D,1}$' }]) } }),
      R(md`
        !!method Newton–Raphson for a diode circuit
        1. Guess $V_{D,0}$: $0.7\,\text{V}$ per diode, or the constant-voltage-drop answer.
        2. At the guess: $I_D = I_Se^{V_{D,n}/(nV_T)}$ and $I_R = \dfrac{V_S - V_{D,n}}{R_S}$.
        3. $f = I_R - I_D$ and $f' = -\left(\dfrac{1}{R_S} + \dfrac{I_D}{nV_T}\right)$.
        4. $V_{D,n+1} = V_{D,n} - \dfrac{f}{f'}$.
        5. Stop when the step is below the tolerance. Then $I_D = \dfrac{V_S - V_D}{R_S}$.

        Sign check: $f' < 0$ always, so $f > 0$ must move $V_D$ **up**.

        ### Handout 2's example
        $V_S = 2\,\text{V}$, $R_S = 1\kO$, $I_S = 10^{-14}\,\text{A}$, $n = 1$, $V_T = 26\,\text{mV}$, start at $0.7\,\text{V}$.
        $$I_D = 10^{-14}e^{0.7/0.026} = ${hI(0.7).toPrecision(4)}\,\text{mA},\qquad I_R = \frac{2 - 0.7}{1\kO} = 1.300\,\text{mA}$$
        $$f = 1.300 - ${hI(0.7).toPrecision(4)} = ${hf(0.7).toPrecision(4)}\,\text{mA},\qquad f' = -\left(1 + \frac{${hI(0.7).toPrecision(4)}}{0.026}\right) = ${(-hG(0.7)).toPrecision(4)}\,\text{mS}$$
        $$V_{D,1} = 0.7 - \frac{${hf(0.7).toPrecision(4)}}{${(-hG(0.7)).toPrecision(4)}} = ${fx(v1, 4)}\,\text{V}$$

        | $n$ | $V_{D,n}$ (V) | $I_D$ (mA) | $I_R$ (mA) | $f$ (mA) | $f'$ (mS) | step (mV) |
        |---|---|---|---|---|---|---|
        ${tbl7}

        $V_D = ${fx(VQ, 4)}\,\text{V}$ and $I_D = ${IQ.toPrecision(4)}\,\text{mA}$ (the $0.7\,\text{V}$ model says $1.3\,\text{mA}$). The steps shrink $19 \to 11 \to 3.3 \to 0.2\,\text{mV}$: close to $Q$, each step roughly squares the error, so the number of correct digits doubles.
      `),
      R(md`
        ### Why Handout 2 needed ten steps
        The handout starts at $0.6\,\text{V}$: it jumps to $${fx(s6[1], 3)}\,\text{V}$, then walks down $${fx(s6[1], 3)}, ${fx(s6[2], 3)}, ${fx(s6[3], 3)}, \dots$ and reaches $0.666\,\text{V}$ after about ten steps.

        [[fig:start]]

        - **Below $Q$** the diode barely conducts, so $-f' \approx \dfrac{1}{R_S}$: the tangent is almost the flat load line, and the jump is huge ($+257\,\text{mV}$ here).
        - **Above $Q$** the diode dominates: $f \approx -I_D$ and $-f' \approx \dfrac{I_D}{nV_T}$, so $\Delta v \approx -nV_T$. It walks down about $26\,\text{mV}$ per step until it gets close.
        - From $0\,\text{V}$ the first step lands near $V_S$, where $e^{v/V_T}$ overflows a calculator.

        !!tip Starting guess
        Start at the constant-voltage-drop answer ($0.7\,\text{V}$ per diode). If unsure, start a little high rather than low.

        ### Newton vs the notes' iteration
        | | Update | From $0.7\,\text{V}$ here |
        |---|---|---|
        | Notes (previous lesson) | $I = \dfrac{V_S - V_D}{R_S}$, then $V_D = nV_T\ln\dfrac{I}{I_S}$ | $0.6654$, $0.6660$ |
        | Newton–Raphson | $V_D \leftarrow V_D - \dfrac{f}{f'}$ | $${fx(s7[1], 4)}$, $${fx(s7[2], 4)}$, $${fx(s7[3], 4)}$, $${fx(s7[4], 4)}$ |

        Same answer. For one diode the notes' method is even faster; Newton works for any $f$ without rearranging it. If a problem names Newton–Raphson, write $f$, $f'$ and each $V_{D,n}$.
      `, { figs: { start: { svg: startPlot, cap: 'solid: start at $0.6\\,\\text{V}$ (Handout 2, dots); dashed: start at $0.7\\,\\text{V}$; flat line: $Q$' } } }),
      P({
        id: 'NR-1', title: 'Which way does the next guess move?', cat: 'nl', kind: 'orig',
        q: md`In the diode–resistor circuit, a guess gives $f(V_{D,n}) = +0.4\,\text{mA}$, where $f = \dfrac{V_S - v_D}{R_S} - I_D(v_D)$. The next Newton guess is:`,
        fig: circ(),
        parts: [{ mc: ['higher than $V_{D,n}$', 'lower than $V_{D,n}$', 'the same', 'impossible to tell without $f\'$'], a: 0, why: [null, '$f\' < 0$ always here, so $-f/f\'$ has the sign of $f$.', 'Only if $f = 0$.', '$f\' = -(1/R_S + I_D/(nV_T))$ is always negative, so the sign of $f$ decides.'] }],
        sol: md`$f' = -\left(\dfrac{1}{R_S} + \dfrac{I_D}{nV_T}\right) < 0$, so $\Delta v = -\dfrac{f}{f'}$ has the sign of $f$: **up**. Physically, the resistor pushes more current than the diode takes at this voltage, so the voltage must rise.`,
      }),
      P({
        id: 'NR-2', title: 'One Newton step by hand', cat: 'nl', kind: 'orig',
        q: md`$V_S = 2\,\text{V}$, $R_S = 1\kO$, $V_T = 25\,\text{mV}$, $n = 1$. The diode carries exactly $1\,\text{mA}$ at $0.700\,\text{V}$, so $I_D = 1\,\text{mA}\cdot e^{(v_D - 0.7)/V_T}$. Take **one** Newton–Raphson step from $V_{D,0} = 0.7\,\text{V}$.`,
        fig: circ('2\\,\\text{V}', '1\\kO'),
        parts: [{ lbl: 'f(V_{D,0})', unit: 'mA', ans: 0.3 }, { lbl: "f'(V_{D,0})", unit: 'mS', ans: -41 }, { lbl: 'V_{D,1}', unit: 'V', ans: d1, tol: { rel: 0.0005 } }],
        hints: [md`At $0.7\,\text{V}$ the diode takes $1\,\text{mA}$ and the resistor delivers $\dfrac{2 - 0.7}{1\kO}$.`, md`$f' = -\left(\dfrac{1}{R_S} + \dfrac{I_D}{V_T}\right)$ in mS: $\dfrac{1\,\text{mA}}{0.025\,\text{V}} = 40\,\text{mS}$.`],
        sol: md`$$f = 1.3 - 1 = 0.3\,\text{mA},\qquad f' = -(1 + 40) = -41\,\text{mS}$$
$$V_{D,1} = 0.7 - \frac{0.3}{-41} = 0.7 + 0.00732 = ${fx(d1, 4)}\,\text{V}$$
[[fig:t]]
$f > 0$, so the guess moved up. One more step lands on $${fx(dq, 4)}\,\text{V}$.`,
        figs: { t: { svg: oneStepPlot, cap: 'tangent at $0.7\\,\\text{V}$ (slope $-41\\,\\text{mS}$) hits zero at $V_{D,1}$' } },
      }),
      P({
        id: 'NR-3', title: 'Starting too low', cat: 'nl', kind: 'orig',
        q: md`Same circuit: $V_S = 2\,\text{V}$, $R_S = 1\kO$, $V_T = 25\,\text{mV}$, and $I_D = 1\,\text{mA}\cdot e^{(v_D - 0.7)/V_T}$. This time start Newton–Raphson at $V_{D,0} = 0.5\,\text{V}$. Find $V_{D,1}$.`,
        fig: circ('2\\,\\text{V}', '1\\kO'),
        parts: [{ lbl: 'V_{D,1}', unit: 'V', ans: low1, tol: { rel: 0.002 } }],
        hints: [md`At $0.5\,\text{V}$: $I_D = e^{-8}\,\text{mA} \approx 0.00034\,\text{mA}$. Almost nothing.`],
        sol: md`$$f = 1.5 - 0.00034 = 1.4997\,\text{mA},\qquad f' = -\left(1 + \frac{0.00034}{0.025}\right) = -1.0134\,\text{mS}$$
$$V_{D,1} = 0.5 + \frac{1.4997}{1.0134} = ${fx(low1, 3)}\,\text{V}$$
[[fig:low]]
The diode is off at $0.5\,\text{V}$, so the tangent is just the resistor's line and lands near $V_S$. At $${fx(low1, 2)}\,\text{V}$ the diode law gives $e^{51}\,\text{mA}$: the method then crawls back down $25\,\text{mV}$ per step. Start at $0.7\,\text{V}$ instead.`,
        figs: { low: { svg: lowPlot, cap: 'a flat tangent from a low guess overshoots far past $Q$' } },
      }),
      P({
        id: 'NR-4', title: 'Two diodes in series', cat: 'nl', kind: 'orig',
        q: md`$V_S = 3\,\text{V}$ drives two identical diodes in series through $R_S = 1\kO$. Each diode carries $1\,\text{mA}$ at $0.7\,\text{V}$ ($n = 1$, $V_T = 25\,\text{mV}$). With $v$ the voltage across **both**, $I_D = 1\,\text{mA}\cdot e^{(v - 1.4)/(2V_T)}$. Take one Newton step from $v_0 = 1.4\,\text{V}$.`,
        fig: string2,
        parts: [{ lbl: 'f(v_0)', unit: 'mA', ans: 0.6 }, { lbl: "f'(v_0)", unit: 'mS', ans: -21 }, { lbl: 'v_1', unit: 'V', ans: 1.4 + 0.6 / 21, tol: { rel: 0.0005 } }],
        hints: [md`Each diode has half of $v$, so the pair acts like one diode with $2V_T$ in place of $V_T$.`, md`$f' = -\left(\dfrac{1}{R_S} + \dfrac{I_D}{2V_T}\right)$.`],
        sol: md`$$f = \frac{3 - 1.4}{1\kO} - 1 = 0.6\,\text{mA},\qquad f' = -\left(1 + \frac{1}{0.05}\right) = -21\,\text{mS}$$
$$v_1 = 1.4 + \frac{0.6}{21} = ${fx(1.4 + 0.6 / 21, 4)}\,\text{V}$$
Pattern: $k$ identical diodes in series behave like one diode with $kV_T$ (and $k$ times the small-signal resistance).`,
      }),
      G('newton_step', { need: 3 }),
    ],
  });

  // ================================================================ how small is small: the 5% rule
  const eps = (a) => 1 - (1 + a) / Math.exp(a);
  const lim = (tol, s) => { let lo = 0, hi = 2; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (eps(s * m) < tol) lo = m; else hi = m; } return s * lo; };
  const aNeg = lim(0.05, -1), aPos = lim(0.05, 1);
  const NVT = 26;
  const gapPlot = plot({ x: [-12, 12], y: [0.5, 1.65], xl: 'v_d\\,(\\text{mV})', yl: 'i_D/I_D', xt: [-10, -5, 0, 5, 10], yt: [0.6, 1, 1.4],
    curves: [{ f: (v) => Math.exp(v / NVT), cls: 'dc' }, { f: (v) => 1 + v / NVT, cls: 'dash' }], pts: [{ x: 0, y: 1, n: 'Q' }] });
  const epsPlot = plot({ x: [-12, 12], y: [0, 12], xl: 'v_d\\,(\\text{mV})', yl: '\\varepsilon\\,(\\%)', xt: [+(aNeg * NVT).toFixed(2), 0, +(aPos * NVT).toFixed(2)], yt: [0, 5, 10],
    curves: [{ pts: clip((v) => 100 * eps(v / NVT), -12, 12, 0, 12), cls: 'dc' }, { pts: clip((v) => 50 * (v / NVT) ** 2, -12, 12, 0, 12), cls: 'dash' }, { f: () => 5, cls: 'ink' }],
    pts: [{ x: aNeg * NVT, y: 5 }, { x: aPos * NVT, y: 5 }] });
  const epsRows = [-10, -7.5, -5, -2.5, 2.5, 5, 7.5, 10].map((v) => { const a = v / NVT; return `| $${v}$ | $${fx(a, 3)}$ | $${fx(100 * eps(a), 2)}\\%$ | $${fx(50 * a * a, 2)}\\%$ |`; }).join('\n        ');
  const tolRows = [0.01, 0.05, 0.1].map((t) => { const a = -lim(t, -1); return `| $${t * 100}\\%$ | $${fx(a, 3)}$ | $${fx(a * 26, 1)}\\,\\text{mV}$ | $${fx(a * 25, 1)}\\,\\text{mV}$ |`; }).join('\n        ');

  const fullC = (vs, r, id) => [
    ['Vac', [0, 0.2], [0, 1.2], { n: 'v_s', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_S', s: vs, side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R', s: r }], ['D', [1.8, -0.4], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
    ['vlab', [2.3, -0.1], [2.3, 1.9], { n: 'V_D + v_d' }], ...(id ? [['iarr', [1.8, -0.1], 'd', { n: id, side: 'l', off: [-14, 0] }]] : []),
  ];
  const ssC = (r, rd) => [
    ['Vac', [0, 0.5], [0, 1.5], { n: 'v_s', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R', s: r }],
    ['R', [1.8, 0], [1.8, 2], { n: 'r_d', s: rd }], ['w', [0, 1.5], [0, 2], [1.8, 2]], ['gnd', [0.9, 2]], ['vlab', [2.7, 0.2], [2.7, 1.8], { n: 'v_d' }],
  ];
  const str2 = [
    ['Vac', [0, 0.2], [0, 1.2], { n: 'v_s', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_S', s: '3.4\\,\\text{V}', side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R', s: '2\\kO' }], ['D', [1.8, -0.4], [1.8, 0.9]], ['D', [1.8, 0.9], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
  ];

  after('u3-rd', {
    id: 'u3-swing', title: 'How small is small? The 5% rule',
    steps: [
      R(md`
        ### What the small-signal model throws away
        The diode's current is exponential; the small-signal model keeps only the tangent line at $Q$. Measure the swing in units of $nV_T$:
        $$\alpha = \frac{v_d}{nV_T},\qquad i_{exact} = I_De^{\alpha},\qquad i_{model} = I_D(1 + \alpha)$$

        [[fig:gap]]

        The gap between the curve and the line is the error. Near $Q$ it's invisible; it grows fast.

        ### The relative error
        Handout 2 measures the gap against the true current:
        $$\varepsilon = \frac{i_{exact} - i_{model}}{i_{exact}} = 1 - \frac{1 + \alpha}{e^{\alpha}}$$
        With $e^{\alpha} = 1 + \alpha + \tfrac12\alpha^2 + \dots$, the quick estimate is
        $$\varepsilon \approx \frac{\alpha^2}{2} = \frac12\left(\frac{v_d}{nV_T}\right)^2$$

        !!key The error grows with the square of the swing
        Double the swing, four times the error.
      `, { figs: { gap: { svg: gapPlot, cap: 'true current $e^{\\alpha}$ (solid) and the model\'s line $1 + \\alpha$ (dashed), $nV_T = 26\\,\\text{mV}$' } } }),
      R(md`
        ### Where 7.5 mV comes from
        With $nV_T = 26\,\text{mV}$ (Handout 2):

        | $v_d$ (mV) | $\alpha$ | exact $\varepsilon$ | estimate $\alpha^2/2$ |
        |---|---|---|---|
        ${epsRows}

        [[fig:eps]]

        The curve is **lopsided**. On a negative swing the true current shrinks toward zero while the model's line keeps falling, so the same gap is a bigger share of a smaller current. The 5% line is crossed at
        - $v_d = ${fx(aNeg * NVT, 2)}\,\text{mV}$ ($\alpha = ${fx(aNeg, 3)}$) going negative,
        - $v_d = +${fx(aPos * NVT, 2)}\,\text{mV}$ ($\alpha = ${fx(aPos, 3)}$) going positive.

        A signal swings both ways, so the negative side sets the limit.

        !!key The largest acceptable swing (5%)
        $$|v_d| \le 0.287\,nV_T \approx 7.5\,\text{mV}$$
        That's the number to use: Handout 2's 5% bound, $|v_d| \le 7.5\,\text{mV}$ per diode. (The estimate $\alpha^2/2 = 5\%$ gives $|\alpha| \le 0.32$, slightly generous on the negative side.)

        Other tolerances, set by the negative side the same way:

        | tolerance | largest $\lvert\alpha\rvert$ | $\lvert v_d\rvert$ at $nV_T = 26\,\text{mV}$ | at $25\,\text{mV}$ |
        |---|---|---|---|
        ${tolRows}
      `, { figs: { eps: { svg: epsPlot, cap: 'exact error (solid), estimate $\\alpha^2/2$ (dashed), 5% line; ticks mark where the exact error reaches 5%' } } }),
      R(md`
        ### From the diode to the input
        The input's swing splits between $R$ and the diode. In the small-signal circuit ($V_S$ shorted, diode → $r_d$) it's a voltage divider:

        [[fig:div]]

        $$v_d = \frac{r_d}{R + r_d}\,v_s\qquad\Rightarrow\qquad |v_s|_{max} = v_{d,max}\,\frac{R + r_d}{r_d} = v_{d,max}\left(1 + \frac{R}{r_d}\right)$$
        With $r_d = \dfrac{nV_T}{I_D}$:
        $$|v_s|_{max} = v_{d,max}\left(1 + \frac{RI_D}{nV_T}\right)$$
        - $R \gg r_d$ (big resistor or big bias current): the resistor takes almost all the swing, and the input may be hundreds of mV.
        - No series resistor: the diode takes the whole input, so $|v_s|$ itself must stay under $7.5\,\text{mV}$.
        - $k$ diodes in series: each gets $\dfrac{r_d}{R + kr_d}v_s$, so $|v_s|_{max} = v_{d,max}\dfrac{R + kr_d}{r_d}$.

        ### Handout 2's numbers
        $R_S = 1\kO$, $I_D = 1.334\,\text{mA}$, $nV_T = 26\,\text{mV}$, so $r_d = \dfrac{26\,\text{mV}}{1.334\,\text{mA}} = 19.49\,\Omega$:
        $$|v_s|_{max} = 7.5\,\text{mV}\left(1 + \frac{1000}{19.49}\right) = 7.5\,\text{mV}\times 52.3 \approx 390\,\text{mV}$$
        Its $10\,\text{mV}$ input gives $v_d = \dfrac{19.49}{1019.49}\times 10\,\text{mV} = 0.19\,\text{mV}$, far inside the limit.

        !!method Largest acceptable input swing
        1. DC pass: find $I_D$ (constant-voltage drop is fine).
        2. $r_d = \dfrac{nV_T}{I_D}$ for each diode.
        3. $v_{d,max} = 7.5\,\text{mV}$ for 5%.
        4. Divider back to the source: $|v_s|_{max} = v_{d,max}\dfrac{R + kr_d}{r_d}$.
      `, { figs: { div: row([{ fig: fullC(), cap: 'the circuit' }, { fig: ssC(), cap: 'small signal: a divider' }]) } }),
      P({
        id: 'SW-1', title: 'Double the swing', cat: 'nl', kind: 'orig',
        q: md`A diode's small-signal swing grows from $3\,\text{mV}$ to $6\,\text{mV}$. The small-signal model's error becomes about:`,
        figHtml: epsPlot,
        parts: [{ mc: ['4 times larger', '2 times larger', 'the same', '8 times larger'], a: 0, why: [null, 'The error goes with the square of the swing.', 'It grows with the swing.', 'That would be a cube law.'] }],
        sol: md`$\varepsilon \approx \dfrac{\alpha^2}{2}$ with $\alpha \propto v_d$: doubling $v_d$ multiplies the error by $2^2 = 4$.`,
      }),
      P({
        id: 'SW-2', title: 'Error at 5 mV', cat: 'nl', kind: 'orig',
        q: md`A diode ($n = 1$, $V_T = 25\,\text{mV}$) swings $v_d = \pm5\,\text{mV}$ about $Q$. Find $\alpha$, the quick estimate $\alpha^2/2$, and the exact error on the negative peak ($v_d = -5\,\text{mV}$).`,
        figHtml: gapPlot,
        parts: [{ lbl: '\\alpha', unit: '', ans: 0.2 }, { lbl: '\\alpha^2/2\\ (\\%)', unit: '', ans: 2 }, { lbl: '\\varepsilon(-5\\,\\text{mV})\\ (\\%)', unit: '', ans: 100 * eps(-0.2) }],
        hints: [md`$\varepsilon = 1 - \dfrac{1 + \alpha}{e^{\alpha}}$ with $\alpha = -0.2$.`],
        sol: md`$\alpha = \dfrac{5}{25} = 0.2$, estimate $\dfrac{0.2^2}{2} = 2\%$. Negative peak: $\varepsilon = 1 - \dfrac{0.8}{e^{-0.2}} = 1 - 0.8\times1.2214 = ${fx(100 * eps(-0.2), 2)}\%$. (Positive peak: $${fx(100 * eps(0.2), 2)}\%$.) Both under 5%.`,
      }),
      P({
        id: 'SW-3', title: 'Largest input swing', cat: 'nl', kind: 'orig',
        q: md`A diode biased at $I_D = 1\,\text{mA}$ ($V_T = 25\,\text{mV}$, $n = 1$) sits in series with $R = 1\kO$. Keeping $|v_d| \le 7.5\,\text{mV}$ (the 5% rule), what's the largest input swing $|v_s|$?`,
        fig: fullC(undefined, '1\\kO', 'I_D = 1\\,\\text{mA}'),
        parts: [{ lbl: 'r_d', unit: 'Ω', ans: 25 }, { lbl: '|v_s|_{max}', unit: 'mV', ans: 7.5 * 41 }],
        sol: md`$r_d = \dfrac{25\,\text{mV}}{1\,\text{mA}} = 25\,\Omega$.
[[fig:ss]]
$$|v_s|_{max} = 7.5\,\text{mV}\left(1 + \frac{1000}{25}\right) = 7.5 \times 41 = 307.5\,\text{mV}$$
The resistor takes $\tfrac{40}{41}$ of the swing, so the input can swing about 40 times more than the diode.`,
        figs: { ss: { fig: ssC('1\\kO', '25\\,\\Omega'), cap: 'small-signal divider' } },
      }),
      P({
        id: 'SW-4', title: 'Less bias current, bigger resistor', cat: 'nl', kind: 'orig',
        q: md`$V_S = 5.7\,\text{V}$ biases a diode through $R = 10\kO$. Use $0.7\,\text{V}$ for the DC pass, $V_T = 25\,\text{mV}$, $n = 1$, and the 5% rule. Find $I_D$, $r_d$ and the largest acceptable $|v_s|$.`,
        fig: fullC('5.7\\,\\text{V}', '10\\kO'),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.5 }, { lbl: 'r_d', unit: 'Ω', ans: 50 }, { lbl: '|v_s|_{max}', unit: 'mV', ans: 7.5 * 201 }],
        sol: md`$I_D = \dfrac{5.7 - 0.7}{10\kO} = 0.5\,\text{mA}$, $r_d = \dfrac{25}{0.5} = 50\,\Omega$.
[[fig:ss]]
$$|v_s|_{max} = 7.5\,\text{mV}\left(1 + \frac{10\,000}{50}\right) = 7.5 \times 201 = 1507.5\,\text{mV}$$
What matters is $\dfrac{R}{r_d} = \dfrac{RI_D}{nV_T}$, the DC drop across $R$ in units of $nV_T$: here $\dfrac{5\,\text{V}}{25\,\text{mV}} = 200$.`,
        figs: { ss: { fig: ssC('10\\kO', '50\\,\\Omega'), cap: 'small-signal divider' } },
      }),
      P({
        id: 'SW-5', title: 'Two diodes in series', cat: 'nl', kind: 'orig',
        q: md`$V_S = 3.4\,\text{V}$ biases two identical diodes in series through $R = 2\kO$ ($0.7\,\text{V}$ each for DC, $V_T = 25\,\text{mV}$, $n = 1$). Each diode must keep $|v_d| \le 7.5\,\text{mV}$. Find $I_D$, $r_d$ per diode and the largest $|v_s|$.`,
        fig: str2,
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 1 }, { lbl: 'r_d', unit: 'Ω', ans: 25 }, { lbl: '|v_s|_{max}', unit: 'mV', ans: 615 }],
        sol: md`$I_D = \dfrac{3.4 - 1.4}{2\kO} = 1\,\text{mA}$, $r_d = 25\,\Omega$ each.
[[fig:ss]]
Each diode gets $v_d = \dfrac{r_d}{R + 2r_d}v_s$:
$$|v_s|_{max} = 7.5\,\text{mV}\times\frac{2000 + 50}{25} = 7.5 \times 82 = 615\,\text{mV}$$`,
        figs: { ss: { fig: window.DRAW.ss(str2, { rds: '25\\,\\Omega' }), cap: 'small signal: $V_S$ shorted, each diode → $r_d$' } },
      }),
      G('swing_max', { need: 3 }),
    ],
  });
})();

/* Book, Chapter 1 — Small signals riding on a bias.
   Why a transistor needs a DC operating point; the tangent line and incremental quantities (and how small "small" is);
   the diode's r_d = V_T/I_D; the two pictures (DC and small-signal) and what every element becomes; dependent sources
   and the test-source method; a feel for series/parallel sizes. Every number here was checked by an independent
   script (nonlinear solves, numerical derivatives, nodal analysis): scratchpad A1/ch1_*.py. Generators: js/gens-bk-a1.js. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk01', l);

  // ---------------------------------------------------------------- figure helpers
  // a label drawn the way schem.js draws one (FigLabels lifts it into the HTML layer; KaTeX typesets it)
  const lab = (x, y, tex, a = 'c', cls = 'small') => {
    const w = 190, h = 56;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (a === 'l') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (a === 'r') { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (a === 't') { fy = y; ai = 'flex-start'; }
    if (a === 'b') { fy = y - h; ai = 'flex-end'; }
    return `<foreignObject x="${fx}" y="${fy}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">$${tex}$</span></div></foreignObject>`;
  };
  // Schem.plot plus extra marks in data coordinates: { lab: [x, y, tex, anchor] } or { line: [x1, y1, x2, y2], cls }
  function plot(o, extra = []) {
    const W = o.w || 400, H = o.h || 250, ml = 46, mr = 18, mt = 16, mb = 38;
    const X = (x) => ml + (x - o.x[0]) / (o.x[1] - o.x[0]) * (W - ml - mr);
    const Y = (y) => H - mb - (y - o.y[0]) / (o.y[1] - o.y[0]) * (H - mt - mb);
    const add = extra.map((e) => (e.lab ? lab(X(e.lab[0]), Y(e.lab[1]), e.lab[2], e.lab[3] || 'c', e.cls || 'small')
      : `<path class="${e.cls || 'curve dash'}" d="M${X(e.line[0]).toFixed(1)},${Y(e.line[1]).toFixed(1)}L${X(e.line[2]).toFixed(1)},${Y(e.line[3]).toFixed(1)}"/>`)).join('');
    return Schem.plot(o).replace(/<\/svg>$/, `${add}</svg>`);
  }
  const row = (items) => DRAW.row(items).svg;

  // ---------------------------------------------------------------- the running example of the chapter
  // NMOS with R_D = 10 kΩ to V_DD = 5 V, k = μnCox·W/L = 1 mA/V², V_TN = 1 V: V_OUT = 5 − 5(V_IN − 1)² in saturation
  const vout = (vin) => {
    const ov = vin - 1;
    if (ov <= 0) return 5;
    const vs = 5 - 5 * ov * ov;
    if (vs >= ov) return vs;
    const b = 10 * ov + 1;                       // triode: 5V² − (10V_ov + 1)V + 5 = 0, smaller root
    return (b - Math.sqrt(b * b - 100)) / 10;
  };
  const ampFig = (o = {}) => [
    ['rail', [1, -1.2], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }],
    ['R', [1, -1.2], [1, 0], { n: 'R_D', s: o.rd }],
    ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: o.out || 'v_{OUT}' }],
    ['nmos', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-1, 1], [-1, 1.4]],
    ['Vac', [-1, 1.4], [-1, 2.4], { n: 'v_{in}', side: 'l' }],
    ['V', [-1, 2.4], [-1, 3.4], { n: 'V_{IN}', s: o.vin, side: 'l' }],
    ['gnd', [-1, 3.4]],
  ];
  const transferPlot = (o = {}) => plot({
    x: [0, 3], y: [0, 5.6], w: 460, h: 290, xl: 'v_{IN}\\ (\\text{V})', yl: 'v_{OUT}\\ (\\text{V})',
    xt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yt: [0, 1, 2, 3, 4, 5],
    curves: [{ f: vout }, ...(o.tangent === false ? [] : [{ f: (x) => 3.75 - 5 * (x - 1.5), from: 1.27, to: 1.98, cls: 'dc dash' }])],
    pts: [{ x: 1.5, y: 3.75, n: 'Q' }, ...(o.zero ? [{ x: 0.5, y: 5, n: 'Q_0' }] : [])],
  }, [
    { line: [1, 0, 1, 5.6], cls: 'grid' }, { line: [1.905, 0, 1.905, 5.6], cls: 'grid' },
    { lab: [0.5, 4.45, '\\text{off}'] }, { lab: [1.45, 0.45, '\\text{saturation}'] }, { lab: [2.45, 1.0, '\\text{triode}'] },
    ...(o.tangent === false ? [] : [{ lab: [1.98, 2.0, '\\text{slope} = -5', 'l'] }]),
  ]);
  const wavePlots = () => row([
    { svg: plot({ x: [0, 2], y: [1.4, 1.6], w: 300, h: 190, xl: 't\\ (\\text{ms})', yl: 'v_{IN}\\ (\\text{V})', xt: [0, 1, 2], yt: [1.45, 1.5, 1.55],
      curves: [{ f: (t) => 1.5 + 0.05 * Math.sin(2 * Math.PI * t) }, { f: () => 1.5, cls: 'dc dash' }] }), cap: 'Input: $1.5\\,\\text{V}$ of bias, $\\pm50\\,\\text{mV}$ of signal' },
    { svg: plot({ x: [0, 2], y: [3.4, 4.1], w: 300, h: 190, xl: 't\\ (\\text{ms})', yl: 'v_{OUT}\\ (\\text{V})', xt: [0, 1, 2], yt: [3.5, 3.75, 4],
      curves: [{ f: (t) => vout(1.5 + 0.05 * Math.sin(2 * Math.PI * t)) }, { f: () => 3.75, cls: 'dc dash' }] }), cap: 'Output: $3.75\\,\\text{V}$ of bias, about $\\mp250\\,\\text{mV}$ of signal' },
  ]);

  // ================================================================== 1. why a bias
  L({
    id: 'bk01-bias', title: 'Why a bias? A signal riding on a DC operating point',
    steps: [
      R(md`
        ### Chapter 1 at a glance

        This chapter builds the one idea that every later chapter leans on: **a transistor amplifies small changes around a fixed DC operating point, and for those small changes every curved (nonlinear) device behaves like a straight-line (linear) circuit.** Exam 2 and Exam 3 are, from start to finish, applications of that sentence.

        **What you will be able to do by the end of the chapter:**
        - Explain why every amplifier needs a DC bias, and why its gain is the **slope** of its transfer curve at that bias.
        - Replace a curve by its tangent line, and say how small a "small" signal has to be.
        - Find a diode's incremental resistance $r_d = V_T/I_D$ and use it in a circuit.
        - Split any circuit into a **DC picture** and a **small-signal picture**, and say what every element turns into in each.
        - Find the resistance of a circuit that contains a dependent source, with the **test-source method**.
        - Estimate series and parallel combinations at a glance, and know when a term can be dropped.

        **What you need first:** KCL, KVL, Ohm's law, Thévenin and Norton equivalents, and the derivatives of $x^2$ and $e^x$. Nothing about transistors: Chapter 2 builds the MOSFET from scratch. Where this chapter uses a MOSFET, take its curve as given.
      `),
      R(md`
        ### The question

        A microphone produces a signal of about $\pm10\,\text{mV}$. We want $\pm1\,\text{V}$. The devices that can do this, transistors, are **nonlinear**: their current is not proportional to their voltage. So two questions come first. Why does every amplifier schematic contain DC supplies and bias voltages that have nothing to do with the signal? And what, exactly, is the "gain" of a curved device?

        On the exam, this is why every problem has two halves: first "find the DC operating point", then "find the small-signal gain". The second half cannot be done without the first.
      `),
      R(md`
        ### The physical picture: a valve

        Think of a garden faucet. The angle of the handle is the input; the flow of water is the output. Starting from closed, the first part of a turn does nothing at all: the valve has not opened yet. Once it is open, a small twist changes the flow by an amount that depends on how far open it already is.

        Now suppose you want the flow to follow your hand in proportion: wiggle the handle a little, and the flow wiggles in step. Wiggling around "closed" is useless, since half of each wiggle tries to close an already closed valve and the other half barely opens it. The fix is to **open the valve partway first**, and then wiggle around that position. Opening it partway is the **bias**. The wiggle is the **signal**.

        A transistor is exactly such a valve. A voltage on one terminal (the gate) controls the current through the other two. Below a threshold voltage $V_{TN}$ (here $1\,\text{V}$) no current flows at all; above it, the current grows like the square of the excess voltage (Chapter 2 shows why). The rest of this section makes the faucet story precise with a real circuit.
      `),
      RF(md`
        ### The circuit and its transfer curve

        Here is the simplest transistor amplifier. A resistor $R_D = 10\kO$ connects the supply $V_{DD} = 5\,\text{V}$ to the transistor's drain, which is the output. The input voltage sits on the gate. It is the sum of a DC voltage $V_{IN}$ (the bias) and a small signal $v_{in}$.

        [[fig:amp]]

        For this transistor (a size we will call $k = 1\,\text{mA/V}^2$ in Chapter 2), the drain current is
        $$I_D = \tfrac12 k\,(V_{IN} - V_{TN})^2 \quad\text{when } V_{IN} > V_{TN}$$
        and zero when $V_{IN} < V_{TN}$. The output follows from Ohm's law on $R_D$: the current $I_D$ flows down through $R_D$, so the output sits $I_DR_D$ below the supply.
        $$V_{OUT} = V_{DD} - I_DR_D$$

        Put in the numbers: $\tfrac12 kR_D = \tfrac12(1\,\text{mA/V}^2)(10\kO) = 5\,\text{V}^{-1}$, so as long as the transistor stays in its normal (saturation) region,
        $$V_{OUT} = 5 - 5\,(V_{IN} - 1)^2 \qquad (\text{volts})$$

        Plotting $V_{OUT}$ against $V_{IN}$ gives the **transfer curve** below.

        [[fig:tc]]

        Read it from left to right. Up to $V_{IN} = 1\,\text{V}$ the transistor is **off**: no current, no drop across $R_D$, and the output sits flat at $5\,\text{V}$. Past $1\,\text{V}$ the current grows and the output falls, faster and faster. Past about $1.9\,\text{V}$ the transistor runs out of room (the drain gets too low; Chapter 2 calls this the triode region) and the curve flattens again near $0\,\text{V}$.
      `, { amp: { fig: ampFig({ vdd: '5\\,\\text{V}', rd: '10\\,\\text{k}\\Omega' }), cap: 'A common-source amplifier: the gate voltage is a DC bias $V_{IN}$ plus a small signal $v_{in}$.' },
        tc: { svg: transferPlot(), cap: 'Transfer curve. At the bias point $Q$ ($V_{IN} = 1.5\\,\\text{V}$) the curve is steep, and the dashed tangent has slope $-5$.' } }),
      R(md`
        ### The model: total = bias + signal

        We now write every voltage as **a DC part plus a small change**:
        $$v_{IN} = V_{IN} + v_{in}, \qquad v_{OUT} = V_{OUT} + v_{out}$$
        The capital-letter part is the **operating point** (or bias point, or quiescent point), called $Q$. The small letters are the **signal**. Here $Q$ is $V_{IN} = 1.5\,\text{V}$, $V_{OUT} = 3.75\,\text{V}$.

        The question "what is the gain?" now has a precise meaning. When the input moves by a small amount $v_{in}$ away from $Q$, by how much does the output move?
      `),
      R(md`
        ### The derivation: gain is the slope

        Call the transfer curve $f$, so that $V_{OUT} = f(V_{IN})$.

        **Step 1: the output with the signal on.** The total input is $V_{IN} + v_{in}$, so the total output is
        $$V_{OUT} + v_{out} = f(V_{IN} + v_{in})$$

        **Step 2: zoom in.** For a small step $v_{in}$, the curve near $Q$ is very nearly its tangent line, the straight line through $Q$ with the same slope $f'(V_{IN})$. (The next section shows exactly how good this is.) Moving along that line by $v_{in}$ changes the height by slope times step:
        $$f(V_{IN} + v_{in}) \approx f(V_{IN}) + f'(V_{IN})\,v_{in}$$

        **Step 3: remove the DC part.** Since $f(V_{IN}) = V_{OUT}$, subtract it from both sides:
        $$v_{out} \approx f'(V_{IN})\,v_{in}$$

        !!key The small-signal gain is the slope at the operating point
        $$A_v = \frac{v_{out}}{v_{in}} = \frac{dV_{OUT}}{dV_{IN}}\bigg|_{Q}$$
        It depends on **where** $Q$ is, not only on the circuit.
      `),
      R(md`
        **Step 4: the slope of our curve.** Differentiate $V_{OUT} = V_{DD} - \tfrac12 kR_D(V_{IN} - V_{TN})^2$ with respect to $V_{IN}$. $V_{DD}$ is a constant, so its derivative is zero. By the chain rule, the derivative of $(V_{IN} - V_{TN})^2$ is $2(V_{IN} - V_{TN})$:
        $$\frac{dV_{OUT}}{dV_{IN}} = -\tfrac12 kR_D\cdot 2\,(V_{IN} - V_{TN}) = -kR_D\,(V_{IN} - V_{TN})$$

        **Step 5: put in the numbers at $Q$.** $V_{IN} - V_{TN} = 1.5 - 1 = 0.5\,\text{V}$:
        $$A_v = -(1\,\text{mA/V}^2)(10\kO)(0.5\,\text{V}) = -5$$
        Units: $\text{mA/V}^2\times\text{k}\Omega\times\text{V} = (\text{mA/V}^2)(\text{V/mA})(\text{V}) = 1$. A voltage gain has no units (V/V), as it should.

        So a $10\,\text{mV}$ wiggle on the gate makes a $50\,\text{mV}$ wiggle at the drain, **upside down**: when the gate rises, more current flows, the drop across $R_D$ grows, and the output falls. The figure below shows a $\pm50\,\text{mV}$ input riding on its $1.5\,\text{V}$ bias, and the output it produces.
      `, wavePlots()),
      R(md`
        ### Check it

        - **Below threshold** ($V_{IN} < 1\,\text{V}$) the curve is flat: slope $0$, gain $0$. Nothing comes out.
        - **Larger bias** gives a steeper slope: at $V_{IN} = 1.2\,\text{V}$ the gain is $-10\times0.2 = -2$; at $1.8\,\text{V}$ it is $-10\times0.8 = -8$. The formula $-kR_D(V_{IN} - V_{TN})$ grows with $V_{IN}$, exactly as the curve gets steeper.
        - **One number, two ways.** Read two points off the curve close to $Q$: $V_{OUT}(1.49) = 3.7995\,\text{V}$ and $V_{OUT}(1.51) = 3.6995\,\text{V}$. The slope between them is $(3.6995 - 3.7995)/(0.02) = -5.0$. Same answer.
      `),
      R(md`
        ### What it means: why you cannot amplify $\pm10\,\text{mV}$ around $0\,\text{V}$

        Put the microphone straight on the gate with no bias, so the input wiggles around $0\,\text{V}$ (the point $Q_0$ in the figure below). The transistor is off for every value between $-10$ and $+10\,\text{mV}$, so the output does not move at all. The gain there is the slope of a flat line: zero.

        Biasing just at the threshold is not much better: the positive half of the wiggle would produce a tiny current and the negative half none, so the output would be a chopped, distorted copy. **The bias lifts the operating point onto the steep, nearly straight part of the curve.** That is all a bias is for, and it is why the supply, the bias voltages and the current sources in every schematic are there.

        There is a second job. The output needs room to swing both ways. At $Q$ it can rise $1.25\,\text{V}$ (to $5\,\text{V}$, where the transistor turns off) and fall about $2.85\,\text{V}$ (to $0.9\,\text{V}$, where it leaves saturation). Biasing too close to either end clips one side of the signal.
      `, transferPlot({ zero: true, tangent: false })),
      R(md`
        ### How to recognize it

        In every amplifier schematic, look for the parts that only set up $Q$: the supply $V_{DD}$, a DC voltage on the gate (written $V_{IN}$, $V_B$ or $V_{BIAS}$), a resistor divider on the gate, a DC current source. None of them carries signal. The signal source is drawn separately, often with a "~" in its circle, in series with the bias or coupled in through a capacitor.

        From now on, every problem is worked in that order: **find $Q$ first, then find the slope at $Q$.** Chapter 2 gives the slope of a transistor a name, the transconductance $g_m$, and shows that the gain we just found is $-g_mR_D$.
      `),
      R(md`
        ### Worked example: a different operating point

        Same circuit ($V_{DD} = 5\,\text{V}$, $R_D = 10\kO$, $k = 1\,\text{mA/V}^2$, $V_{TN} = 1\,\text{V}$), but now $V_{IN} = 1.4\,\text{V}$. Find $I_D$, $V_{OUT}$ and the small-signal gain, and the output for a $10\,\text{mV}$-peak input.

        1. **Excess gate voltage:** $V_{IN} - V_{TN} = 1.4 - 1 = 0.4\,\text{V}$.
        2. **Current:** $I_D = \tfrac12(1\,\text{mA/V}^2)(0.4\,\text{V})^2 = \tfrac12(1)(0.16)\,\text{mA} = 0.08\,\text{mA} = 80\,\mu\text{A}$.
        3. **Output:** $V_{OUT} = 5\,\text{V} - (0.08\,\text{mA})(10\kO) = 5 - 0.8 = 4.2\,\text{V}$. The transistor is still in its normal region because the output ($4.2\,\text{V}$) is above the excess gate voltage ($0.4\,\text{V}$); Chapter 2 explains this check.
        4. **Gain:** $A_v = -kR_D(V_{IN} - V_{TN}) = -(1)(10)(0.4) = -4$.
        5. **Output signal:** $v_{out} = A_v v_{in} = -4\times10\,\text{mV}$, so the output swings $40\,\text{mV}$ peak, inverted, around $4.2\,\text{V}$.

        Compare with $Q$ at $1.5\,\text{V}$: gain $-5$. Moving the bias by $0.1\,\text{V}$ changed the gain by $25\%$. The bias really does set the gain.
      `),
      R(md`
        !!mistake Common mistakes
          **Dividing the totals.** At $Q$, $V_{OUT}/V_{IN} = 3.75/1.5 = 2.5$. That number is meaningless: it has the wrong size and even the wrong sign. The gain is a ratio of **changes**, $v_{out}/v_{in}$, which is the slope $-5$.

          **Forgetting the bias.** "The gain is $-5$" is only true at $V_{IN} = 1.5\,\text{V}$. A gain is always the gain *at* an operating point.

          **Taking the slope in the wrong region.** If the transistor is off or has left saturation, the formula $-kR_D(V_{IN} - V_{TN})$ does not apply. Check the region first.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`Why does putting a $\pm10\,\text{mV}$ signal straight onto the gate, with no DC bias, give no output signal in this circuit?`,
        [md`Near $0\,\text{V}$ the transistor is off: the transfer curve is flat there, so its slope (the gain) is zero.`,
          md`$10\,\text{mV}$ is too large to count as a small signal.`,
          md`The gain at $0\,\text{V}$ is infinite, so the output saturates.`,
          md`A DC bias is needed to power the signal source.`], 0,
        [null,
          md`Small is relative to the curve, and here the curve is flat: even $1\,\mu\text{V}$ would give nothing.`,
          md`The curve is flat near $0\,\text{V}$, so the slope is zero, not infinite.`,
          md`The signal source powers itself. The bias is there to move the operating point, not to power anything.`],
        md`Below $V_{TN} = 1\,\text{V}$ no current flows for any input, so $V_{OUT}$ stays at $V_{DD}$: the slope, and therefore the small-signal gain, is $0$. The bias lifts $Q$ onto the steep part of the curve.`),
      Q(md`At the operating point, $V_{IN} = 1.5\,\text{V}$ and $V_{OUT} = 3.75\,\text{V}$. What is the small-signal voltage gain?`,
        ['$-5$', '$2.5$', '$-2.5$', '$3.75$'], 0,
        [null,
          md`That is $V_{OUT}/V_{IN}$, a ratio of totals. The gain is a ratio of small **changes**: the slope of the curve at $Q$.`,
          md`Right sign, wrong size: $3.75/1.5$ is a ratio of totals. The slope at $Q$ is $-kR_D(V_{IN} - V_{TN}) = -5$.`,
          md`That is the DC output voltage, not a gain.`],
        md`$A_v = dV_{OUT}/dV_{IN}$ at $Q$ $= -kR_D(V_{IN} - V_{TN}) = -(1)(10)(0.5) = -5$. Totals tell you where $Q$ is; slopes tell you the gain.`),
      Q(md`In this circuit, which bias gives the **largest** small-signal gain while the transistor stays in saturation?`,
        [md`$V_{IN} = 1.8\,\text{V}$`, md`$V_{IN} = 1.2\,\text{V}$`, md`$V_{IN} = 0.8\,\text{V}$`, md`$V_{IN} = 2.5\,\text{V}$`], 0,
        [null,
          md`At $1.2\,\text{V}$ the curve is still shallow: gain $-kR_D(0.2) = -2$.`,
          md`Below $V_{TN} = 1\,\text{V}$ the transistor is off: gain $0$.`,
          md`At $2.5\,\text{V}$ the output has collapsed to about $0.35\,\text{V}$: the transistor is in triode, where the curve flattens again (gain about $-0.28$).`],
        md`In saturation the gain is $-kR_D(V_{IN} - V_{TN})$, which grows with $V_{IN}$: $-8$ at $1.8\,\text{V}$ (where $V_{OUT} = 1.8\,\text{V}$, still above $V_{IN} - V_{TN} = 0.8\,\text{V}$). Past about $1.9\,\text{V}$ the transistor leaves saturation and the gain collapses.`),
      P({
        id: 'bk01-bias-read', title: 'Read the gain off two points',
        q: md`For the circuit above, a lab measurement gives $V_{OUT} = 4.200\,\text{V}$ at $V_{IN} = 1.40\,\text{V}$ and $V_{OUT} = 4.118\,\text{V}$ at $V_{IN} = 1.42\,\text{V}$. Estimate the small-signal gain at $V_{IN} = 1.41\,\text{V}$.`,
        parts: [{ lbl: 'A_v', unit: 'V/V', ans: -4.1, traps: [{ v: 3, msg: 'That is $V_{OUT}/V_{IN}$, a ratio of totals. Use the ratio of the **changes**.' }, { v: 2.9, msg: 'That is $V_{OUT}/V_{IN}$, a ratio of totals. Use the ratio of the **changes**.' }, { v: 4.1, msg: 'Right size, but the output **fell** when the input rose: the gain is negative.' }] }],
        hints: [md`Gain is the ratio of the changes: $\Delta V_{OUT}/\Delta V_{IN}$.`],
        sol: md`
1. Change in output: $\Delta V_{OUT} = 4.118 - 4.200 = -0.082\,\text{V}$.
2. Change in input: $\Delta V_{IN} = 1.42 - 1.40 = 0.02\,\text{V}$.
3. Slope: $A_v \approx \dfrac{-0.082}{0.02} = -4.1$.

Check against the formula at the midpoint: $-kR_D(V_{IN} - V_{TN}) = -(1)(10)(0.41) = -4.1$. (For a parabola, the slope between two points equals the exact slope at their midpoint.)`,
      }),
      P({
        id: 'bk01-bias-q13', title: 'Operating point and gain at 1.3 V',
        q: md`Same circuit: $V_{DD} = 5\,\text{V}$, $R_D = 10\kO$, $I_D = \tfrac12k(V_{IN} - V_{TN})^2$ with $k = 1\,\text{mA/V}^2$ and $V_{TN} = 1\,\text{V}$. The bias is $V_{IN} = 1.3\,\text{V}$. Find $I_D$, $V_{OUT}$ and the small-signal gain.`,
        fig: ampFig({ vdd: '5\\,\\text{V}', rd: '10\\,\\text{k}\\Omega', vin: '1.3\\,\\text{V}' }),
        parts: [
          { lbl: 'I_D', unit: 'µA', ans: 45, traps: [{ v: 90, msg: 'You dropped the $\\tfrac12$ in front of $k$.' }] },
          { lbl: 'V_{OUT}', unit: 'V', ans: 4.55 },
          { lbl: 'A_v', unit: 'V/V', ans: -3, traps: [{ v: 3.5, msg: 'That is $V_{OUT}/V_{IN}$, a ratio of totals.' }, { v: -1.5, msg: 'You kept the $\\tfrac12$: the derivative of $\\tfrac12(\\cdot)^2$ is $(\\cdot)$, so the slope is $-kR_D(V_{IN} - V_{TN})$.' }] },
        ],
        hints: [md`$V_{IN} - V_{TN} = 0.3\,\text{V}$. Then $I_D = \tfrac12(1\,\text{mA/V}^2)(0.3)^2$.`, md`Slope: $-kR_D(V_{IN} - V_{TN})$.`],
        sol: md`
1. $V_{IN} - V_{TN} = 0.3\,\text{V}$.
2. $I_D = \tfrac12(1\,\text{mA/V}^2)(0.09\,\text{V}^2) = 0.045\,\text{mA} = 45\,\mu\text{A}$.
3. $V_{OUT} = 5 - (0.045\,\text{mA})(10\kO) = 5 - 0.45 = 4.55\,\text{V}$.
4. $A_v = -kR_D(V_{IN} - V_{TN}) = -(1\,\text{mA/V}^2)(10\kO)(0.3\,\text{V}) = -3$.`,
      }),
      P({
        id: 'bk01-bias-swing', title: 'A sine on a bias',
        q: md`Same circuit, now biased at $V_{IN} = 1.6\,\text{V}$, with a $20\,\text{mV}$-peak sine on top. Find $V_{OUT}$, the gain, the output amplitude, and the largest bias $V_{IN}$ for which the transistor is still in saturation (there, $V_{OUT}$ has fallen to $V_{IN} - V_{TN}$).`,
        parts: [
          { lbl: 'V_{OUT}', unit: 'V', ans: 3.2 },
          { lbl: 'A_v', unit: 'V/V', ans: -6 },
          { lbl: '|v_{out}|\\ \\text{peak}', unit: 'mV', ans: 120, traps: [{ v: 20, msg: 'That is the input amplitude. Multiply by $|A_v|$.' }] },
          { lbl: 'V_{IN,max}', unit: 'V', ans: 1.905, traps: [{ v: 2, msg: 'At $2\\,\\text{V}$ the square law would put the output at $0\\,\\text{V}$, below $V_{IN} - V_{TN} = 1\\,\\text{V}$: already out of saturation.' }] },
        ],
        hints: [md`$V_{OUT} = 5 - 5(V_{IN} - 1)^2$ in saturation.`, md`At the edge, write $x = V_{IN} - V_{TN}$: $5 - 5x^2 = x$. Solve the quadratic and keep the positive root.`],
        sol: md`
1. $V_{IN} - V_{TN} = 0.6\,\text{V}$, so $V_{OUT} = 5 - 5(0.36) = 3.2\,\text{V}$.
2. $A_v = -kR_D(0.6) = -(1)(10)(0.6) = -6$.
3. Output amplitude: $6\times20\,\text{mV} = 120\,\text{mV}$, so $v_{OUT}(t)$ swings between about $3.08$ and $3.32\,\text{V}$, inverted.
4. **Edge of saturation.** With $x = V_{IN} - V_{TN}$, set $V_{OUT} = x$:
$$5 - 5x^2 = x\quad\Rightarrow\quad 5x^2 + x - 5 = 0$$
$$x = \frac{-1 + \sqrt{1 + 4(5)(5)}}{2(5)} = \frac{-1 + \sqrt{101}}{10} = \frac{-1 + 10.05}{10} = 0.905\,\text{V}$$
So $V_{IN,max} = 1.905\,\text{V}$ (the output is then $0.905\,\text{V}$). The negative root is not physical.`,
      }),
      P({
        id: 'bk01-bias-design', title: 'Choose the bias for a gain',
        q: md`Same circuit. Which bias $V_{IN}$ gives a small-signal gain of $-8$? What is $V_{OUT}$ there, and is the transistor still in saturation (is $V_{OUT}\ge V_{IN} - V_{TN}$)?`,
        parts: [
          { lbl: 'V_{IN}', unit: 'V', ans: 1.8, traps: [{ v: 0.8, msg: 'That is $V_{IN} - V_{TN}$. Add the threshold back.' }] },
          { lbl: 'V_{OUT}', unit: 'V', ans: 1.8 },
          { lbl: 'In saturation?', mc: ['Yes: $1.8\\,\\text{V}\\ge0.8\\,\\text{V}$', 'No: $V_{OUT}$ is below $V_{IN}$'], a: 0, why: [null, 'The test is $V_{OUT}\\ge V_{IN} - V_{TN} = 0.8\\,\\text{V}$, not $V_{OUT}\\ge V_{IN}$.'] },
        ],
        hints: [md`$-kR_D(V_{IN} - V_{TN}) = -8$, with $kR_D = 10\,\text{V}^{-1}$.`],
        sol: md`
1. $10\,(V_{IN} - 1) = 8$, so $V_{IN} - 1 = 0.8\,\text{V}$ and $V_{IN} = 1.8\,\text{V}$.
2. $V_{OUT} = 5 - 5(0.8)^2 = 5 - 3.2 = 1.8\,\text{V}$.
3. Saturation needs $V_{OUT}\ge V_{IN} - V_{TN} = 0.8\,\text{V}$: $1.8\ge0.8$, yes. (The output has only about $0.9\,\text{V}$ of room to fall before the transistor leaves saturation, so a large signal would clip on the low side.)`,
      }),
      P({
        id: 'bk01-bias-center', title: 'Exam style: center the output',
        q: md`A different design: $V_{DD} = 10\,\text{V}$, $R_D = 20\kO$, $k = 0.5\,\text{mA/V}^2$, $V_{TN} = 1\,\text{V}$, same circuit shape. (a) Find the bias $V_{IN}$ that puts $V_{OUT}$ at $5\,\text{V}$, halfway down the supply. (b) Find the gain there. (c) What input amplitude gives a $1\,\text{V}$-peak output? (d) In the next section we will see that the square law's error, relative to the straight-line answer, is about (input amplitude)$/(2(V_{IN} - V_{TN}))$. What is that error here, in percent?`,
        parts: [
          { lbl: '(a)\\ V_{IN}', unit: 'V', ans: 2 },
          { lbl: '(b)\\ A_v', unit: 'V/V', ans: -10 },
          { lbl: '(c)\\ \\text{input peak}', unit: 'mV', ans: 100 },
          { lbl: '(d)\\ \\text{error}', unit: '\\%', ans: 5, traps: [{ v: 10, msg: 'Divide by $2(V_{IN} - V_{TN}) = 2\\,\\text{V}$, not by $V_{IN} - V_{TN}$.' }] },
        ],
        hints: [md`$V_{OUT} = V_{DD} - \tfrac12kR_D(V_{IN} - V_{TN})^2$ with $\tfrac12kR_D = 5\,\text{V}^{-1}$.`, md`Gain $= -kR_D(V_{IN} - V_{TN})$ with $kR_D = 10\,\text{V}^{-1}$.`],
        sol: md`
**(a)** $\tfrac12kR_D = \tfrac12(0.5\,\text{mA/V}^2)(20\kO) = 5\,\text{V}^{-1}$. Setting $V_{OUT} = 5\,\text{V}$:
$$10 - 5(V_{IN} - 1)^2 = 5\quad\Rightarrow\quad(V_{IN} - 1)^2 = 1\quad\Rightarrow\quad V_{IN} = 2\,\text{V}$$
(The other root, $V_{IN} = 0$, has the transistor off.) Saturation: $5\,\text{V}\ge1\,\text{V}$. ✓

**(b)** $A_v = -kR_D(V_{IN} - V_{TN}) = -(10\,\text{V}^{-1})(1\,\text{V}) = -10$.

**(c)** $1\,\text{V}/10 = 0.1\,\text{V} = 100\,\text{mV}$ peak.

**(d)** $0.1/(2\times1) = 0.05 = 5\%$. A $100\,\text{mV}$ signal is only "small" to about $5\%$ here; Section 1.2 derives this.`,
      }),
      G('bk_bias_q', { need: 4 }),
    ],
  });

  // ================================================================== 2. the tangent line
  const sqPlot = () => plot({
    x: [0.9, 1.5], y: [0, 4.2], w: 420, h: 270, xl: 'v_{GS}\\ (\\text{V})', yl: 'i_D\\ (\\text{mA})',
    xt: [0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5], yt: [0, 1, 2, 3, 4],
    curves: [{ f: (v) => (v > 1 ? 25 * (v - 1) * (v - 1) : 0), to: 1.41 }, { f: (v) => 1 + 10 * (v - 1.2), from: 1.1, to: 1.42, cls: 'dc dash' }],
    pts: [{ x: 1.2, y: 1, n: 'Q' }, { x: 1.1, y: 0 }],
  }, [
    { lab: [1.1, 0.55, 'V_{TN} + \\tfrac12V_{ov}', 'r'] }, { lab: [0.95, 3.1, 'V_{TN} = 1\\,\\text{V}'] },
    { lab: [1.33, 3.6, '\\text{tangent: slope } 10\\,\\text{mA/V}', 'r'] },
  ]);
  const expPlot = () => plot({
    x: [0.62, 0.74], y: [0, 5.2], w: 420, h: 270, xl: 'v_D\\ (\\text{V})', yl: 'i_D\\ (\\text{mA})',
    xt: [0.62, 0.64, 0.66, 0.68, 0.7, 0.72, 0.74], yt: [0, 1, 2, 3, 4, 5],
    curves: [{ f: (v) => Math.exp((v - 0.7) / 0.025) }, { f: (v) => 1 + 40 * (v - 0.7), from: 0.675, to: 0.74, cls: 'dc dash' }],
    pts: [{ x: 0.7, y: 1, n: 'Q' }, { x: 0.675, y: 0 }],
  }, [{ lab: [0.675, 0.55, 'V_D - V_T', 'r'] }, { lab: [0.665, 3.2, '\\text{tangent: slope } I_D/V_T'] }]);
  const distPlot = () => plot({
    x: [0, 2], y: [-1, 1.4], w: 420, h: 250, xl: 't\\ (\\text{ms})', yl: 'i_d\\ (\\text{mA})',
    xt: [0, 0.5, 1, 1.5, 2], yt: [-1, -0.75, 0, 1, 1.25],
    curves: [{ f: (t) => Math.sin(2 * Math.PI * t), cls: 'dc dash' }, { f: (t) => { const s = Math.sin(2 * Math.PI * t); return s + 0.25 * s * s; } }],
  }, [{ lab: [1.62, 1.33, '\\text{exact: peaks } +1.25,\\ -0.75', 'c'] }]);

  L({
    id: 'bk01-tangent', title: 'Linearization: the tangent line and incremental quantities',
    steps: [
      R(md`
        ### The question

        Section 1.1 replaced the transfer curve by its tangent line at the operating point and promised to say how good that is. This section does three things. It fixes the notation the course uses for totals, bias values and signals. It derives the tangent-line rule from the Taylor series. And it finds the exact size of the error for the two curves we will meet over and over: the MOSFET's **square law** and the diode's (and BJT's) **exponential**.

        On the exam the words "small-signal" and "incremental" appear in every problem. This section is what they mean.
      `),
      R(md`
        ### Notation: three ways to write one voltage

        The gate of a transistor sits at a DC voltage, and a small signal moves it up and down. We name the three pieces by the case of the letter and of its subscript:

        | Symbol | Letter, subscript | Meaning | Example |
        |---|---|---|---|
        | $v_{GS}$ | lower, CAPITAL | the **total**, as it varies in time | $1.2\,\text{V} + 5\,\text{mV}\sin\omega t$ |
        | $V_{GS}$ | CAPITAL, CAPITAL | the **DC** (bias) part | $1.2\,\text{V}$ |
        | $v_{gs}$ | lower, lower | the **signal** (incremental) part | $5\,\text{mV}\sin\omega t$ |

        $$v_{GS} = V_{GS} + v_{gs}, \qquad i_D = I_D + i_d$$

        Every quantity works the same way: $v_{OUT} = V_{OUT} + v_{out}$, $i_D = I_D + i_d$. When a formula has only lowercase-lowercase symbols ($i_d = g_mv_{gs}$), it is about changes only, and DC values never appear in it.
      `),
      R(md`
        ### The physical picture: zoom in

        The Earth looks flat from your backyard because you only see a tiny piece of it. Any smooth curve is the same: zoom in far enough around a point and it looks straight. The straight line it turns into is the **tangent** at that point.

        So the question is never *whether* a curve is linear near $Q$; it always is, close enough. The question is **how far you may wander from $Q$** before the bending shows. That distance is set by how sharply the curve bends compared with how steep it is.
      `),
      R(md`
        ### The derivation: Taylor's series

        Let $y = f(x)$ be any smooth curve, with the operating point at $x = X$. Move away by a small step, so the total input is $X + x$ (capital: the bias; lowercase: the step). Taylor's series writes the new output as a sum of powers of the step:
        $$f(X + x) = f(X) + f'(X)\,x + \tfrac12f''(X)\,x^2 + \tfrac16f'''(X)\,x^3 + \cdots$$

        **Step 1: subtract the DC output.** $f(X)$ is the output at $Q$. The *change* in output is everything after it:
        $$y_{inc} = f(X + x) - f(X) = f'(X)\,x + \tfrac12f''(X)\,x^2 + \cdots$$

        **Step 2: keep the first term.** For a small enough step, $x^2$ is much smaller than $x$, so the first term dominates:
        $$y_{inc} \approx f'(X)\,x$$
        This is the tangent line. The slope $f'(X)$ is the only property of the curve that survives.

        **Step 3: measure the error.** The first term we threw away is $\tfrac12f''(X)x^2$. Compare it with the term we kept:
        $$\frac{\tfrac12f''(X)\,x^2}{f'(X)\,x} = \frac{f''(X)}{2f'(X)}\,x$$
        The error grows in proportion to the step, and in proportion to the curvature $f''$ divided by the slope $f'$.
      `),
      R(md`
        ### Case 1: the square law

        A MOSFET in saturation (Chapter 2) carries $i_D = K(v_{GS} - V_{TN})^2$, where $K$ is a constant set by its size. Here the Taylor series is short enough to write out exactly.

        **Step 1: split the total.** Write $v_{GS} = V_{GS} + v_{gs}$, and call the DC excess over threshold the **overdrive**, $V_{ov} = V_{GS} - V_{TN}$:
        $$i_D = K\,(V_{GS} + v_{gs} - V_{TN})^2 = K\,(V_{ov} + v_{gs})^2$$

        **Step 2: expand the square** with $(a + b)^2 = a^2 + 2ab + b^2$:
        $$i_D = KV_{ov}^2 + 2KV_{ov}\,v_{gs} + K\,v_{gs}^2$$
        There are no further terms: for a parabola, $f'''$ and everything after it are zero.

        **Step 3: name the pieces.** $KV_{ov}^2$ does not depend on the signal: it is the DC current $I_D$. Subtract it, and the signal current is
        $$i_d = i_D - I_D = \underbrace{2KV_{ov}\,v_{gs}}_{\text{linear}} + \underbrace{K\,v_{gs}^2}_{\text{curvature}}$$

        **Step 4: compare.** Divide the curvature term by the linear term; $K$ and one $v_{gs}$ cancel:
        $$\frac{K\,v_{gs}^2}{2KV_{ov}\,v_{gs}} = \frac{v_{gs}}{2V_{ov}}$$

        !!key How small is small: square law
          The straight-line answer $i_d = 2KV_{ov}v_{gs}$ is off by the fraction $\dfrac{v_{gs}}{2V_{ov}}$. A signal is small when $|v_{gs}|\ll 2V_{ov}$.

        **Numbers.** A transistor with $K = 25\,\text{mA/V}^2$ at $V_{ov} = 0.2\,\text{V}$ carries $I_D = 25\times0.04 = 1\,\text{mA}$. A $10\,\text{mV}$ signal gives a linear term of $2(25\,\text{m})(0.2)(0.01) = 100\,\mu\text{A}$ and a curvature term of $(25\,\text{m})(0.01)^2 = 2.5\,\mu\text{A}$. The ratio is $2.5\%$, which is $0.01/(2\times0.2)$.
      `),
      R(md`
        ### Case 2: the exponential

        A diode (Section 1.3) and a BJT (Chapter 6) carry $i_D = I_Se^{v_D/V_T}$, where $V_T = kT/q\approx25\,\text{mV}$ at room temperature (the **thermal voltage**; not the same thing as a MOSFET's threshold $V_{TN}$).

        **Step 1: split the total.** With $v_D = V_D + v_d$, the exponential of a sum is a product of exponentials:
        $$i_D = I_Se^{(V_D + v_d)/V_T} = \underbrace{I_Se^{V_D/V_T}}_{I_D}\cdot e^{v_d/V_T} = I_D\,e^{v_d/V_T}$$

        **Step 2: expand** with $e^u = 1 + u + \tfrac12u^2 + \tfrac16u^3 + \cdots$ and $u = v_d/V_T$:
        $$i_D = I_D\Big(1 + \frac{v_d}{V_T} + \frac{v_d^2}{2V_T^2} + \cdots\Big)$$

        **Step 3: subtract the DC current** $I_D$:
        $$i_d = \underbrace{\frac{I_D}{V_T}\,v_d}_{\text{linear}} + \underbrace{\frac{I_D}{2V_T^2}\,v_d^2}_{\text{curvature}} + \cdots$$

        **Step 4: compare** the first two terms:
        $$\frac{I_Dv_d^2/(2V_T^2)}{I_Dv_d/V_T} = \frac{v_d}{2V_T}$$

        !!key How small is small: exponential
          The straight-line answer $i_d = (I_D/V_T)v_d$ is off by about $\dfrac{v_d}{2V_T}$. A signal is small when $|v_d|\ll 2V_T = 50\,\text{mV}$: a few millivolts.

        **Numbers.** At $I_D = 1\,\text{mA}$ and $v_d = 5\,\text{mV}$, the straight line says $i_d = (1\,\text{mA})(5/25) = 200\,\mu\text{A}$. The exact answer is $(1\,\text{mA})(e^{0.2} - 1) = 221.4\,\mu\text{A}$, $10.7\%$ more. The estimate $v_d/(2V_T) = 10\%$ caught most of it; the rest comes from the $u^3$ and higher terms.
      `),
      R(md`
        ### Compare the two

        For the same $10\%$ error, a MOSFET at $V_{ov} = 0.2\,\text{V}$ tolerates $v_{gs} = 0.1\times0.4\,\text{V} = 40\,\text{mV}$, while a diode or BJT tolerates only $v_d = 0.1\times50\,\text{mV} = 5\,\text{mV}$. At this bias the MOSFET is $8\times$ more linear, because $2V_{ov}/2V_T = 0.4/0.05 = 8$.

        This is one reason BJT amplifiers (Exam 3) so often carry an emitter resistor: it takes most of the signal, so the junction itself sees only a few millivolts. The price is gain, as Chapter 9 shows.
      `),
      RF(md`
        ### Where the tangent hits the axis

        The tangent line has a neat geometric meaning for both curves, and it gives each slope without calculus.

        **Square law.** The tangent at $Q$ is the line $i = I_D + g\,(v - V_{GS})$ with slope $g = 2KV_{ov}$ (the linear coefficient from Case 1). It reaches $i = 0$ where $v - V_{GS} = -I_D/g$:
        $$v = V_{GS} - \frac{KV_{ov}^2}{2KV_{ov}} = V_{GS} - \tfrac12V_{ov}$$
        The tangent hits the axis **halfway between the threshold and the bias**. So the slope is "rise over run" $= I_D/(\tfrac12V_{ov}) = 2I_D/V_{ov}$. Chapter 2 calls this slope $g_m$, and $g_m = 2I_D/V_{ov}$ is the one formula Exam 2's sheet gave.

        [[fig:sq]]

        **Exponential.** The tangent at $Q$ is $i = I_D + (I_D/V_T)(v - V_D)$. It reaches zero at $v = V_D - V_T$: **always $25\,\text{mV}$ to the left of $Q$, at any current.** So the slope is $I_D/V_T$. Section 1.3 turns this into the diode's resistance $r_d = V_T/I_D$.

        [[fig:ex]]
      `, { sq: { svg: sqPlot(), cap: 'Square law, $K = 25\\,\\text{mA/V}^2$, bias $V_{GS} = 1.2\\,\\text{V}$ ($V_{ov} = 0.2\\,\\text{V}$, $I_D = 1\\,\\text{mA}$). The tangent reaches zero at $1.1\\,\\text{V}$: slope $= 1\\,\\text{mA}/0.1\\,\\text{V} = 10\\,\\text{mA/V}$.' },
        ex: { svg: expPlot(), cap: 'Exponential, $1\\,\\text{mA}$ at $0.7\\,\\text{V}$. The tangent reaches zero at $0.675\\,\\text{V}$, $V_T = 25\\,\\text{mV}$ to the left: slope $= 1\\,\\text{mA}/25\\,\\text{mV} = 40\\,\\text{mA/V}$.' } }),
      R(md`
        ### What the curvature does to a sine: distortion

        Put a sine on the gate, $v_{gs} = V_p\sin\omega t$, and look at the curvature term $Kv_{gs}^2$ of Case 1. Since $\sin^2\theta = \tfrac12(1 - \cos2\theta)$:
        $$K\,v_{gs}^2 = \frac{KV_p^2}{2} - \frac{KV_p^2}{2}\cos2\omega t$$
        Two new things appear that were not in the input: a **DC shift** $KV_p^2/2$ (the average current creeps up) and a component at **twice the frequency** (the second harmonic). That is what distortion means.

        Compare the second harmonic with the wanted signal, whose amplitude is $2KV_{ov}V_p$:
        $$\frac{KV_p^2/2}{2KV_{ov}V_p} = \frac{V_p}{4V_{ov}}$$

        The figure shows a deliberately large signal: $V_p = 0.1\,\text{V}$ on $V_{ov} = 0.2\,\text{V}$ with $K = 25\,\text{mA/V}^2$. The straight line predicts $\pm1\,\text{mA}$ (dashed). The real current peaks at $+1.25\,\text{mA}$ and $-0.75\,\text{mA}$: the positive half is stretched and the negative half squashed, and the second harmonic is $0.1/(4\times0.2) = 12.5\%$ of the fundamental.
      `, distPlot()),
      R(md`
        ### Check it

        - **Smaller signal:** $v_{gs}\to0$ makes the error $v_{gs}/(2V_{ov})\to0$. Zoom in far enough and every curve is straight.
        - **Bias at threshold:** $V_{ov}\to0$ makes the error blow up. At threshold the square law is flat (zero slope), so there is no linear term at all: that is Section 1.1's "you cannot amplify around the threshold", seen from the algebra.
        - **Units:** $v_{gs}/(2V_{ov})$ and $v_d/(2V_T)$ are volts over volts, pure numbers, as an error fraction must be.
      `),
      R(md`
        ### What it means

        **Small is relative.** For a MOSFET it is relative to $2V_{ov}$, a few hundred millivolts; for a diode or BJT it is relative to $2V_T = 50\,\text{mV}$. There is no universal "small enough" voltage.

        **Every small-signal element is a slope.** The diode's $r_d$, the MOSFET's $g_m$ and $r_{ds}$, the BJT's $g_m$ and $r_\pi$: each is $f'(X)$ for some curve at its bias point. Change the bias and every one of them changes.

        ### How to recognize it

        A problem that says "small-signal", "incremental" or "AC" is asking only for slopes and changes; the DC values serve only to compute the slopes. If a problem gives a signal amplitude, compare it with $2V_{ov}$ or $2V_T$ before trusting a straight-line answer.
      `),
      R(md`
        ### Worked example: a diode at $2\,\text{mA}$

        A diode carries $I_D = 2\,\text{mA}$. Its voltage rises by $v_d = 2\,\text{mV}$. Find the straight-line current change, the exact one, and the error.

        1. **Straight line:** $i_d = (I_D/V_T)\,v_d = (2\,\text{mA}/25\,\text{mV})(2\,\text{mV}) = (80\,\text{mA/V})(0.002\,\text{V}) = 160\,\mu\text{A}$.
        2. **Exact:** $i_d = I_D\big(e^{v_d/V_T} - 1\big) = (2\,\text{mA})(e^{0.08} - 1) = (2\,\text{mA})(0.08329) = 166.6\,\mu\text{A}$.
        3. **Error:** $(166.6 - 160)/160 = 4.1\%$. The estimate $v_d/(2V_T) = 2/50 = 4\%$ agrees.

        And a MOSFET with $K = 25\,\text{mA/V}^2$ at $V_{ov} = 0.2\,\text{V}$ hit by $v_{gs} = 20\,\text{mV}$: linear term $2(25\,\text{m})(0.2)(0.02) = 200\,\mu\text{A}$, curvature term $(25\,\text{m})(0.02)^2 = 10\,\mu\text{A}$, ratio $5\% = 0.02/0.4$. Ten times the voltage of the diode example, about the same error.
      `),
      R(md`
        !!mistake Common mistakes
          **Mixing $v_{GS}$ and $v_{gs}$.** $v_{GS}$ is the whole gate-source voltage ($1.2\,\text{V}$ plus a wiggle); $v_{gs}$ is only the wiggle. A small-signal formula like $i_d = g_mv_{gs}$ never contains $V_{GS}$ or $v_{GS}$.

          **Thinking "small" is a fixed number of millivolts.** $20\,\text{mV}$ is small for a MOSFET at $V_{ov} = 0.4\,\text{V}$ ($2.5\%$) and large for a diode ($40\%$).

          **Taking the slope somewhere else.** The slope must be evaluated at the operating point $Q$, not at $v = 0$ and not at the peak of the signal.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`A MOSFET is biased at $V_{ov} = 0.3\,\text{V}$. How large a $v_{gs}$ makes the square law's curvature term $5\%$ of its linear term?`,
        [md`$30\,\text{mV}$`, md`$15\,\text{mV}$`, md`$2.5\,\text{mV}$`, md`$300\,\text{mV}$`], 0,
        [null, md`That used $V_{ov}$ in place of $2V_{ov}$: the ratio is $v_{gs}/(2V_{ov})$.`, md`That is the exponential's rule ($0.05\times2V_T$). A MOSFET is judged against $2V_{ov}$.`, md`That would be a $50\%$ error: $0.3/(2\times0.3)$.`],
        md`$v_{gs}/(2V_{ov}) = 0.05$ gives $v_{gs} = 0.05\times0.6\,\text{V} = 30\,\text{mV}$.`),
      Q(md`A gate sits at $1.2\,\text{V}$ DC with a $5\,\text{mV}$ sine on it, so the gate-source voltage is $1.2 + 0.005\sin\omega t$ volts. Which assignment of symbols is right?`,
        [md`$v_{GS} = 1.2 + 0.005\sin\omega t$, $V_{GS} = 1.2\,\text{V}$, $v_{gs} = 0.005\sin\omega t$`,
          md`$V_{GS} = 1.2 + 0.005\sin\omega t$, $v_{GS} = 1.2\,\text{V}$, $v_{gs} = 0.005\sin\omega t$`,
          md`$v_{gs} = 1.2 + 0.005\sin\omega t$, $V_{GS} = 1.2\,\text{V}$, $v_{GS} = 0.005\sin\omega t$`,
          md`$v_{GS} = 1.2\,\text{V}$, $V_{GS} = 0.005\sin\omega t$, $v_{gs} = 1.2 + 0.005\sin\omega t$`], 0,
        [null, md`Capital-capital ($V_{GS}$) is the DC part only; the total (which varies) is lowercase with a capital subscript.`, md`Lowercase-lowercase ($v_{gs}$) is the signal only, not the total.`, md`Everything is shuffled: the DC value $1.2\,\text{V}$ is $V_{GS}$, the wiggle is $v_{gs}$, their sum is $v_{GS}$.`],
        md`Total $v_{GS}$ (lower, CAPITAL) $=$ bias $V_{GS}$ (CAPITAL, CAPITAL) $+$ signal $v_{gs}$ (lower, lower).`),
      Q(md`Why does a diode (or a BJT) need a much smaller signal than a MOSFET to stay linear?`,
        [md`The exponential's error is $v/(2V_T)$ with $2V_T = 50\,\text{mV}$, while the square law's is $v/(2V_{ov})$ with $2V_{ov}$ typically a few hundred mV.`,
          md`A diode carries more current, so its curvature is larger.`,
          md`The exponential has no linear term.`,
          md`A diode's slope is zero at its operating point.`], 0,
        [null, md`The error ratio $v_d/(2V_T)$ does not depend on the current at all; the current cancels out.`, md`It does: $(I_D/V_T)v_d$. It is the second-order term that is large relative to it.`, md`The slope is $I_D/V_T$, which is large, not zero.`],
        md`Both errors are (signal)/(2 × a voltage scale). For the exponential that scale is $V_T = 25\,\text{mV}$ at any current; for the square law it is $V_{ov}$, which the designer chooses and is usually $0.1$ to $0.5\,\text{V}$.`),
      P({
        id: 'bk01-tan-sq', title: 'Expand the square law',
        q: md`A MOSFET with $K = 25\,\text{mA/V}^2$ is biased at $V_{ov} = 0.2\,\text{V}$, and $v_{gs} = 20\,\text{mV}$. Find the linear term $2KV_{ov}v_{gs}$, the curvature term $Kv_{gs}^2$, and their ratio.`,
        parts: [
          { lbl: '2KV_{ov}v_{gs}', unit: 'µA', ans: 200 },
          { lbl: 'Kv_{gs}^2', unit: 'µA', ans: 10, traps: [{ v: 1000, msg: 'Square the 20 mV in volts: $(0.02)^2 = 4\\times10^{-4}\\,\\text{V}^2$.' }] },
          { lbl: '\\text{ratio}', unit: '\\%', ans: 5, traps: [{ v: 10, msg: 'The ratio is $v_{gs}/(2V_{ov})$, not $v_{gs}/V_{ov}$.' }] },
        ],
        hints: [md`$2KV_{ov} = 2(25\,\text{mA/V}^2)(0.2\,\text{V}) = 10\,\text{mA/V}$.`],
        sol: md`
1. Linear: $2KV_{ov}v_{gs} = (10\,\text{mA/V})(0.02\,\text{V}) = 0.2\,\text{mA} = 200\,\mu\text{A}$.
2. Curvature: $Kv_{gs}^2 = (25\,\text{mA/V}^2)(0.02\,\text{V})^2 = (25\,\text{mA/V}^2)(4\times10^{-4}\,\text{V}^2) = 0.01\,\text{mA} = 10\,\mu\text{A}$.
3. Ratio: $10/200 = 5\%$, the same as $v_{gs}/(2V_{ov}) = 0.02/0.4$.`,
      }),
      P({
        id: 'bk01-tan-exp', title: 'The exponential, exactly and on the tangent',
        q: md`A diode carries $I_D = 0.5\,\text{mA}$ ($V_T = 25\,\text{mV}$). Its voltage rises by $v_d = 3\,\text{mV}$. Find the straight-line current change, the exact change, and the error of the straight line in percent.`,
        parts: [
          { lbl: 'i_d\\ \\text{(line)}', unit: 'µA', ans: 60 },
          { lbl: 'i_d\\ \\text{(exact)}', unit: 'µA', ans: 63.75 },
          { lbl: '\\text{error}', unit: '\\%', ans: 6.25, accept: [6] },
        ],
        hints: [md`Line: $(I_D/V_T)v_d$. Exact: $I_D(e^{v_d/V_T} - 1)$ with $v_d/V_T = 0.12$.`],
        sol: md`
1. Straight line: $(0.5\,\text{mA}/25\,\text{mV})(3\,\text{mV}) = (20\,\text{mA/V})(0.003\,\text{V}) = 60\,\mu\text{A}$.
2. Exact: $(0.5\,\text{mA})(e^{0.12} - 1) = (0.5\,\text{mA})(0.12750) = 63.75\,\mu\text{A}$.
3. Error: $(63.75 - 60)/60 = 6.25\%$. The estimate $v_d/(2V_T) = 3/50 = 6\%$ (also accepted) is close.`,
      }),
      P({
        id: 'bk01-tan-max', title: 'How big may the signal be?',
        q: md`Using the second-order estimates ($v/(2V_{ov})$ and $v/(2V_T)$), find the largest signal that keeps the straight-line error at $2\%$ (a) for a MOSFET at $V_{ov} = 0.25\,\text{V}$, (b) for a diode ($V_T = 25\,\text{mV}$).`,
        parts: [
          { lbl: '(a)\\ v_{gs}', unit: 'mV', ans: 10, traps: [{ v: 5, msg: 'Use $2V_{ov} = 0.5\\,\\text{V}$: $0.02\\times0.5\\,\\text{V}$.' }] },
          { lbl: '(b)\\ v_d', unit: 'mV', ans: 1, traps: [{ v: 0.5, msg: 'Use $2V_T = 50\\,\\text{mV}$: $0.02\\times50\\,\\text{mV}$.' }] },
        ],
        hints: [md`Set the error fraction equal to $0.02$ and solve for the signal.`],
        sol: md`
**(a)** $v_{gs}/(2V_{ov}) = 0.02$, so $v_{gs} = 0.02\times0.5\,\text{V} = 10\,\text{mV}$.

**(b)** $v_d/(2V_T) = 0.02$, so $v_d = 0.02\times50\,\text{mV} = 1\,\text{mV}$.

Ten times less for the diode. Keep this in mind for Exam 3: a BJT's base-emitter junction is this exponential.`,
      }),
      P({
        id: 'bk01-tan-axis', title: 'Slope from the tangent\'s intercept',
        q: md`A square-law device ($i_D = K(v_{GS} - V_{TN})^2$, $V_{TN} = 1\,\text{V}$) carries $I_D = 0.5\,\text{mA}$ at $V_{GS} = 1.5\,\text{V}$. Where does its tangent at this point cross the $v_{GS}$ axis, and what is the slope?`,
        parts: [
          { lbl: 'v_{GS}\\ \\text{at } i = 0', unit: 'V', ans: 1.25, traps: [{ v: 1, msg: 'The curve itself reaches zero at $V_{TN}$; the tangent reaches zero halfway between $V_{TN}$ and $V_{GS}$.' }] },
          { lbl: '\\text{slope}', unit: 'mA/V', ans: 2, traps: [{ v: 1, msg: 'The run is $\\tfrac12V_{ov} = 0.25\\,\\text{V}$, not $V_{ov}$.' }] },
        ],
        hints: [md`The tangent of a square law hits the axis at $V_{GS} - \tfrac12V_{ov}$.`],
        sol: md`
1. $V_{ov} = 1.5 - 1 = 0.5\,\text{V}$, so the tangent hits the axis at $1.5 - 0.25 = 1.25\,\text{V}$.
2. Slope $=$ rise/run $= 0.5\,\text{mA}/0.25\,\text{V} = 2\,\text{mA/V}$. Check with calculus: $K = I_D/V_{ov}^2 = 0.5/0.25 = 2\,\text{mA/V}^2$ and $di_D/dv_{GS} = 2KV_{ov} = 2(2)(0.5) = 2\,\text{mA/V}$. ✓`,
      }),
      P({
        id: 'bk01-tan-hd2', title: 'Exam style: a sine through a square law',
        q: md`A square-law device with $K = 5\,\text{mA/V}^2$ is biased at $V_{ov} = 0.4\,\text{V}$, and $v_{gs} = 0.1\sin\omega t$ volts. Find (a) the amplitude of the linear (fundamental) current, (b) the DC shift of the average current, (c) the amplitude of the second harmonic, and (d) the second harmonic as a percentage of the fundamental.`,
        parts: [
          { lbl: '(a)', unit: 'mA', ans: 0.4 },
          { lbl: '(b)\\ \\text{DC shift}', unit: 'µA', ans: 25, traps: [{ v: 50, msg: 'The average of $\\sin^2$ is $\\tfrac12$: $KV_p^2/2$.' }] },
          { lbl: '(c)\\ 2\\omega\\ \\text{amplitude}', unit: 'µA', ans: 25 },
          { lbl: '(d)', unit: '\\%', ans: 6.25, traps: [{ v: 12.5, msg: 'That is $V_p/(2V_{ov})$, the peak-to-peak curvature ratio. The harmonic is $V_p/(4V_{ov})$ because $\\sin^2$ splits its amplitude between DC and $2\\omega$.' }] },
        ],
        hints: [md`$v_{gs}^2 = V_p^2\sin^2\omega t = \tfrac12V_p^2(1 - \cos2\omega t)$.`],
        sol: md`
**(a)** $2KV_{ov}V_p = 2(5\,\text{mA/V}^2)(0.4\,\text{V})(0.1\,\text{V}) = 0.4\,\text{mA}$.

**(b)** $Kv_{gs}^2 = KV_p^2\sin^2\omega t = \tfrac12KV_p^2 - \tfrac12KV_p^2\cos2\omega t$. The constant part is $\tfrac12(5\,\text{mA/V}^2)(0.01\,\text{V}^2) = 25\,\mu\text{A}$.

**(c)** The $\cos2\omega t$ part has the same size: $25\,\mu\text{A}$.

**(d)** $25\,\mu\text{A}/0.4\,\text{mA} = 6.25\%$, which is $V_p/(4V_{ov}) = 0.1/1.6$.`,
      }),
      G('bk_tan_sq', { need: 3 }),
      G('bk_tan_exp', { need: 3 }),
    ],
  });
})();

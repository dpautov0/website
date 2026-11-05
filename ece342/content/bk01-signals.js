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
      G('bk_c1_bias', { need: 4 }),
    ],
  });

  // ================================================================== 2. the tangent line
  const sqPlot = () => plot({
    x: [0.9, 1.5], y: [0, 4.2], w: 420, h: 270, xl: 'v_{GS}\\ (\\text{V})', yl: 'i_D\\ (\\text{mA})',
    xt: [0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5], yt: [0, 1, 2, 3, 4],
    curves: [{ f: (v) => (v > 1 ? 25 * (v - 1) * (v - 1) : 0), to: 1.41 }, { f: (v) => 1 + 10 * (v - 1.2), from: 1.1, to: 1.42, cls: 'dc dash' }],
    pts: [{ x: 1.2, y: 1, n: 'Q' }, { x: 1.1, y: 0 }],
  }, [
    { line: [1, 0, 1, 4.2], cls: 'grid' }, { lab: [1.1, 0.55, 'V_{TN} + \\tfrac12V_{ov}', 'r'] }, { lab: [1.008, 2.3, 'V_{TN}', 'l'] },
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
      G('bk_c1_tan_sq', { need: 3 }),
      G('bk_c1_tan_exp', { need: 3 }),
    ],
  });

  // ================================================================== 3. the diode
  // a supply (DC + signal) feeding a resistor and a diode to ground; output across the diode
  const divFig = (vs = '5\\,\\text{V}', r = '4.3\\,\\text{k}\\Omega', n = 1) => [
    ['Vac', [0, 0], [0, 1], { n: 'v_s', side: 'l' }],
    ['V', [0, 1], [0, 2], { n: 'V_S', s: vs, side: 'l' }],
    ['gnd', [0, 2]],
    ['w', [0, 0], [0, -0.6], [0.3, -0.6]],
    ['R', [0.3, -0.6], [1.7, -0.6], { n: 'R', s: r }],
    ['w', [1.7, -0.6], [2.2, -0.6], [2.2, -0.2]],
    ...(n === 1 ? [['D', [2.2, -0.2], [2.2, 1.2]], ['w', [2.2, 1.2], [2.2, 2]]]
      : [['D', [2.2, -0.2], [2.2, 0.8]], ['D', [2.2, 0.8], [2.2, 1.8]], ['w', [2.2, 1.8], [2.2, 2]]]),
    ['gnd', [2.2, 2]],
    ['w', [2.2, -0.6], [3, -0.6]], ['term', [3, -0.6], { n: n === 1 ? 'v_D' : 'v_{out}' }],
  ];
  const divPics = () => row([
    { fig: divFig(), cap: 'The circuit' },
    { fig: [...DRAW.off(divFig(), { keep: ['V_S'] }), ['iarr', [2.2, -0.35], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }]], cap: 'DC picture: signal off' },
    { fig: DRAW.ss(divFig(), { rds: '25\\,\\Omega' }), cap: 'Small-signal picture' },
  ]);

  L({
    id: 'bk01-diode', title: 'The diode: a first small-signal model',
    steps: [
      R(md`
        ### The question

        A diode carries a DC current, and a small signal is added on top. How does the diode respond to the small part? The answer is the first small-signal model of this book: **for changes, a forward-biased diode is a resistor $r_d = V_T/I_D$**, which is $25\,\Omega$ at $1\,\text{mA}$.

        Why it matters for the exams: this is the whole method in its simplest form (bias, slope, linear circuit). And the same exponential, inside a BJT, gives Exam 3's $g_m = I_C/V_T$ and the emitter resistance $r_e\approx1/g_m$ (Chapter 7).
      `),
      R(md`
        ### The physical picture: a stiff exponential

        A silicon diode's current grows exponentially with its forward voltage. Every $V_T\ln10\approx58\,\text{mV}$ (call it $60\,\text{mV}$) of extra voltage multiplies the current by ten, and every $V_T\ln2\approx17\,\text{mV}$ doubles it. So over a thousandfold range of currents the voltage only moves by about $0.17\,\text{V}$, and for DC work we pretend it is a $0.7\,\text{V}$ battery.

        A perfect battery would not change its voltage at all, whatever the current: it would have zero incremental resistance. A real diode is *almost* a battery: push a little more current into it and its voltage creeps up a little. That small ratio of voltage change to current change is its incremental resistance. Because the exponential grows in proportion to itself, its slope is proportional to the current: **the more current a diode carries, the stiffer it gets.** The Art of Electronics puts it as a rule of thumb you should memorize: *at $1\,\text{mA}$, $25\,\Omega$*.
      `),
      R(md`
        ### The model

        Forward biased, the diode obeys
        $$I_D = I_S\,e^{V_D/V_T}$$
        where $I_S$ is a tiny constant set by the junction (around $10^{-15}\,\text{A}$) and $V_T = kT/q\approx25\,\text{mV}$ at room temperature. (The full law is $I_S(e^{V_D/V_T} - 1)$; at $0.7\,\text{V}$ the exponential is about $10^{12}$, so the $-1$ does not matter.)

        We use two models of the same diode, one per picture:
        - **DC (finding the operating point):** a constant $0.7\,\text{V}$ drop. Good to about $\pm0.1\,\text{V}$, which is all a bias calculation needs.
        - **Small signal (finding the response to changes):** a resistor equal to the inverse slope of the exponential at the operating point. We derive it now.
      `),
      R(md`
        ### The derivation

        **Step 1: the slope.** Differentiate the exponential with respect to $V_D$. The derivative of $e^{V_D/V_T}$ is $\tfrac{1}{V_T}e^{V_D/V_T}$:
        $$\frac{dI_D}{dV_D} = \frac{I_S}{V_T}\,e^{V_D/V_T}$$

        **Step 2: recognize the current.** The product $I_Se^{V_D/V_T}$ is the bias current $I_D$ itself:
        $$\frac{dI_D}{dV_D} = \frac{I_D}{V_T}$$
        This is the slope we met in Section 1.2: the tangent always reaches zero $V_T$ to the left of $Q$.

        **Step 3: the small-signal law.** A small change $v_d$ in voltage changes the current by slope times step:
        $$i_d = \frac{I_D}{V_T}\,v_d$$

        **Step 4: read it as a resistor.** A current proportional to the voltage across the same two terminals is Ohm's law. The resistance is voltage over current:
        $$\frac{v_d}{i_d} = \frac{V_T}{I_D}$$

        !!key The diode's small-signal resistance
          $$r_d = \frac{V_T}{I_D}\qquad(25\,\Omega\text{ at }1\,\text{mA})$$
          For changes, a forward-biased diode is this resistor, and nothing else. It is set by the bias current alone, not by $I_S$ and not by the diode's size.
      `),
      R(md`
        ### Check it

        | $I_D$ | $10\,\mu\text{A}$ | $100\,\mu\text{A}$ | $1\,\text{mA}$ | $10\,\text{mA}$ |
        |---|---|---|---|---|
        | $r_d = 25\,\text{mV}/I_D$ | $2.5\kO$ | $250\,\Omega$ | $25\,\Omega$ | $2.5\,\Omega$ |

        - **Units:** volts over amperes, ohms. ✓
        - **No current** ($I_D\to0$): $r_d\to\infty$. An off diode is an open circuit, for DC and for signals.
        - **Lots of current** ($I_D\to\infty$): $r_d\to0$. The diode approaches a perfect battery, with zero incremental resistance. The "$0.7\,\text{V}$ battery" DC model is exactly the large-current limit of this picture.
      `),
      R(md`
        ### What it means: the slope is not the chord

        At $1\,\text{mA}$ and $0.7\,\text{V}$, dividing the totals gives $V_D/I_D = 0.7\,\text{V}/1\,\text{mA} = 700\,\Omega$. That is the slope of the straight line from the origin to $Q$ (the "chord"), and it answers no useful question. The signal sees the slope of the curve at $Q$, which is $25\,\Omega$, almost thirty times smaller.

        So a diode is **not** a $25\,\Omega$ resistor; only its *changes* see $25\,\Omega$. And because $r_d$ is set by the bias current, a diode is a resistor you can tune electronically: change $I_D$ and you change $r_d$. Section 1.4 builds an attenuator out of exactly that.

        ### How to recognize it

        A diode (or a diode-connected transistor, Chapters 3 and 8) with a known DC current, and a small signal somewhere in the circuit. Write $r_d = V_T/I_D$ next to it, and from then on treat it as that resistor in the small-signal picture.
      `),
      RF(md`
        ### Worked example: a diode in a divider, DC first, then the signal

        A $5\,\text{V}$ supply with a $100\,\text{mV}$-peak signal $v_s$ on it feeds a $4.3\kO$ resistor and a diode to ground. How big is the signal across the diode?

        [[fig:pics]]

        **Step 1: DC picture.** Turn the signal off ($v_s = 0$, a short). The diode is a $0.7\,\text{V}$ drop, so $4.3\,\text{V}$ is left across $R$:
        $$I_D = \frac{5 - 0.7}{4.3\kO} = \frac{4.3\,\text{V}}{4.3\kO} = 1\,\text{mA}$$

        **Step 2: the slope at the bias point.** $r_d = 25\,\text{mV}/1\,\text{mA} = 25\,\Omega$.

        **Step 3: small-signal picture.** The $5\,\text{V}$ source never changes, so for changes it is a short: its bottom is ground, so its top is an *incremental ground* (Section 1.4 says more). The diode becomes $r_d$. What is left is a voltage divider:
        $$v_d = v_s\,\frac{r_d}{R + r_d} = 100\,\text{mV}\times\frac{25}{4300 + 25} = 100\,\text{mV}\times0.00578 = 0.578\,\text{mV}$$

        **Step 4: put it back together.** The total diode voltage is about $0.7\,\text{V} + 0.578\,\text{mV}\sin\omega t$. The diode swallowed the signal: it is so stiff that only $0.6\%$ of the wiggle appears across it.

        **How good is it?** Solving the exponential exactly (with $I_S$ chosen to give $0.7\,\text{V}$ at $1\,\text{mA}$), the diode voltage moves by $+0.571\,\text{mV}$ and $-0.585\,\text{mV}$ at the two peaks. The small-signal answer, $\pm0.578\,\text{mV}$, sits right between them: the current only changes by about $\pm2\%$, which is a small signal.
      `, { pics: { svg: divPics(), cap: 'The circuit, its DC picture (signal off; the diode drops about $0.7\\,\\text{V}$) and its small-signal picture (the DC source becomes a wire, the diode becomes $r_d$).' } }),
      R(md`
        !!mistake Common mistakes
          **Using the chord.** $V_D/I_D = 700\,\Omega$ at $1\,\text{mA}$ is not $r_d$. The small-signal resistance is the slope, $V_T/I_D = 25\,\Omega$.

          **Computing $r_d$ before the bias.** $r_d$ needs $I_D$, and $I_D$ comes from the DC picture. Always do the DC picture first.

          **Keeping the $0.7\,\text{V}$ in the small-signal picture.** The $0.7\,\text{V}$ is a DC value. In the small-signal picture the diode is only $r_d$: no battery, because a constant does not change.

          **$V_T$ means two things in this course.** Here it is the thermal voltage, $25\,\text{mV}$. In the lectures' test-source drawings $V_T$, $I_T$ are the test voltage and current, and some MOSFET texts write the threshold as $V_T$; this book writes the threshold $V_{TN}$ to keep them apart.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`A diode carries $2\,\text{mA}$. What is its small-signal resistance?`,
        [md`$12.5\,\Omega$`, md`$350\,\Omega$`, md`$50\,\Omega$`, md`$25\,\Omega$`], 0,
        [null, md`That is $0.7\,\text{V}/2\,\text{mA}$, the chord. The slope is $V_T/I_D$.`, md`$r_d$ is inversely proportional to the current: doubling the current halves it.`, md`$25\,\Omega$ is the value at $1\,\text{mA}$ only.`],
        md`$r_d = 25\,\text{mV}/2\,\text{mA} = 12.5\,\Omega$.`),
      Q(md`The DC current through a diode is doubled. What happens to its small-signal resistance?`,
        ['It halves.', 'It doubles.', 'It stays the same.', 'It drops to zero.'], 0,
        [null, md`More current makes the exponential steeper, so the diode is stiffer: $r_d = V_T/I_D$ falls.`, md`$r_d$ depends on the current: $V_T/I_D$.`, md`Only an infinite current would make it zero.`],
        md`$r_d = V_T/I_D$, so doubling $I_D$ halves $r_d$.`),
      Q(md`At $1\,\text{mA}$ a diode has $V_D/I_D = 700\,\Omega$ and $r_d = 25\,\Omega$. Which one tells you how much its voltage moves when the current wiggles by $10\,\mu\text{A}$?`,
        [md`$r_d$: the voltage moves about $25\,\Omega\times10\,\mu\text{A} = 0.25\,\text{mV}$.`, md`$V_D/I_D$: the voltage moves $700\,\Omega\times10\,\mu\text{A} = 7\,\text{mV}$.`, md`Neither: a diode's voltage is fixed at $0.7\,\text{V}$.`, md`Their average, about $360\,\Omega$.`], 0,
        [null, md`$700\,\Omega$ is the chord from the origin; changes follow the slope at $Q$.`, md`The $0.7\,\text{V}$ is an approximation for DC. The voltage does move, slightly: by $r_d$ times the current change.`, md`There is no reason to average a slope and a chord.`],
        md`Changes see the slope: $\Delta V\approx r_d\,\Delta I = 25\,\Omega\times10\,\mu\text{A} = 0.25\,\text{mV}$.`),
      P({
        id: 'bk01-diode-rd', title: 'r_d at two currents',
        q: md`Find a diode's small-signal resistance at (a) $I_D = 0.2\,\text{mA}$ and (b) $I_D = 4\,\text{mA}$ ($V_T = 25\,\text{mV}$).`,
        parts: [
          { lbl: '(a)\\ r_d', unit: 'Ω', ans: 125, traps: [{ v: 3500, msg: 'That is $0.7\\,\\text{V}/I_D$, the chord.' }] },
          { lbl: '(b)\\ r_d', unit: 'Ω', ans: 6.25, traps: [{ v: 175, msg: 'That is $0.7\\,\\text{V}/I_D$, the chord.' }] },
        ],
        hints: [md`$r_d = V_T/I_D$.`],
        sol: md`(a) $25\,\text{mV}/0.2\,\text{mA} = 125\,\Omega$. (b) $25\,\text{mV}/4\,\text{mA} = 6.25\,\Omega$. Twenty times the current, one twentieth of the resistance.`,
      }),
      P({
        id: 'bk01-diode-div', title: 'A diode divider',
        q: md`$V_S = 3\,\text{V}$, $R = 2.3\kO$, one diode to ground, and a $50\,\text{mV}$-peak signal in series with $V_S$ (same circuit shape as the worked example). Find the DC current, $r_d$, and the signal amplitude across the diode.`,
        fig: divFig('3\\,\\text{V}', '2.3\\,\\text{k}\\Omega'),
        parts: [
          { lbl: 'I_D', unit: 'mA', ans: 1, traps: [{ v: 1.304, msg: 'Subtract the diode\'s $0.7\\,\\text{V}$ before dividing by $R$.' }] },
          { lbl: 'r_d', unit: 'Ω', ans: 25 },
          { lbl: '|v_d|', unit: 'mV', ans: 0.5376, traps: [{ v: 50, msg: 'The diode is stiff: only the fraction $r_d/(R + r_d)$ of the signal appears across it.' }] },
        ],
        hints: [md`DC: $(3 - 0.7)/2.3\kO$.`, md`Signal: $v_d = v_s\,r_d/(R + r_d)$.`],
        sol: md`
1. DC: $I_D = (3 - 0.7)\,\text{V}/2.3\kO = 1\,\text{mA}$.
2. $r_d = 25\,\text{mV}/1\,\text{mA} = 25\,\Omega$.
3. Small signal: $V_S$ is a short, the diode is $r_d$: $v_d = 50\,\text{mV}\times\dfrac{25}{2300 + 25} = 50\,\text{mV}\times0.010753 = 0.538\,\text{mV}$.`,
      }),
      P({
        id: 'bk01-diode-two', title: 'Two diodes in series',
        q: md`Now two diodes in series from the resistor to ground, with $V_S = 5\,\text{V}$ and $R = 3.6\kO$. Find the DC current, the small-signal resistance of the pair, and the ratio $v_{out}/v_s$ with $v_{out}$ across both diodes.`,
        fig: divFig('5\\,\\text{V}', '3.6\\,\\text{k}\\Omega', 2),
        parts: [
          { lbl: 'I_D', unit: 'mA', ans: 1, traps: [{ v: 1.194, msg: 'Two diodes drop $2\\times0.7 = 1.4\\,\\text{V}$.' }] },
          { lbl: '2r_d', unit: 'Ω', ans: 50, traps: [{ v: 25, msg: 'That is one diode. In series the two $r_d$ add.' }] },
          { lbl: 'v_{out}/v_s', unit: '', ans: 0.0137, traps: [{ v: 0.00690, msg: 'That is one diode\'s share. The output is across both.' }] },
        ],
        hints: [md`DC: $(5 - 1.4)/3.6\kO$.`, md`Both diodes carry the same current, so each has the same $r_d$; in series they add.`],
        sol: md`
1. DC: $I_D = (5 - 2\times0.7)/3.6\kO = 3.6\,\text{V}/3.6\kO = 1\,\text{mA}$.
2. Each diode: $r_d = 25\,\Omega$; in series, $50\,\Omega$.
3. $v_{out}/v_s = \dfrac{50}{3600 + 50} = 0.0137$.`,
      }),
      P({
        id: 'bk01-diode-exact', title: 'When is a change small?',
        q: md`A diode's current rises from $1\,\text{mA}$ to (a) $1.1\,\text{mA}$, (b) $2\,\text{mA}$. For each, find the exact change in diode voltage, $V_T\ln(I_2/I_1)$, and compare with the small-signal estimate $r_d\,\Delta I$ (with $r_d$ at $1\,\text{mA}$).`,
        parts: [
          { lbl: '(a)\\ \\text{exact}', unit: 'mV', ans: 2.383 },
          { lbl: '(a)\\ r_d\\Delta I', unit: 'mV', ans: 2.5 },
          { lbl: '(b)\\ \\text{exact}', unit: 'mV', ans: 17.33 },
          { lbl: '(b)\\ r_d\\Delta I', unit: 'mV', ans: 25 },
        ],
        hints: [md`From $I = I_Se^{V/V_T}$: $V_2 - V_1 = V_T\ln(I_2/I_1)$.`],
        sol: md`
**(a)** Exact: $25\,\text{mV}\times\ln1.1 = 25\times0.09531 = 2.383\,\text{mV}$. Estimate: $25\,\Omega\times0.1\,\text{mA} = 2.5\,\text{mV}$, $5\%$ high. A $10\%$ current change is reasonably small.

**(b)** Exact: $25\,\text{mV}\times\ln2 = 17.33\,\text{mV}$. Estimate: $25\,\Omega\times1\,\text{mA} = 25\,\text{mV}$, $44\%$ high. Doubling the current is not a small signal: over that range the slope changes by a factor of two.`,
      }),
      P({
        id: 'bk01-diode-ripple', title: 'Exam style: a diode as a voltage reference',
        q: md`A crude $0.7\,\text{V}$ reference: a diode fed from a $5\,\text{V}$ supply through $4.3\kO$. The supply carries $100\,\text{mV}$ of ripple (peak). Find (a) the DC current, (b) $r_d$, (c) the ripple left at the diode. (d) The resistor is replaced by an ideal $1\,\text{mA}$ current source from the same rippling supply. How much ripple reaches the diode now?`,
        fig: divFig(),
        parts: [
          { lbl: '(a)\\ I_D', unit: 'mA', ans: 1 },
          { lbl: '(b)\\ r_d', unit: 'Ω', ans: 25 },
          { lbl: '(c)\\ \\text{ripple}', unit: 'mV', ans: 0.578, traps: [{ v: 100, msg: 'The diode is stiff: only the divider fraction $r_d/(R + r_d)$ of the ripple appears across it.' }] },
          { lbl: '(d)\\ \\text{ripple}', unit: 'mV', ans: 0 },
        ],
        hints: [md`(c) is the worked example with "signal" renamed "ripple".`, md`(d) An ideal current source delivers the same current whatever the voltage across it. If the diode current cannot change, can the diode voltage?`],
        sol: md`
**(a)** $I_D = (5 - 0.7)/4.3\kO = 1\,\text{mA}$.

**(b)** $r_d = 25\,\Omega$.

**(c)** The ripple is a signal like any other: $100\,\text{mV}\times\dfrac{25}{4325} = 0.578\,\text{mV}$. The reference rejects the ripple by a factor of $173$.

**(d)** **Zero.** The current source fixes the current at $1\,\text{mA}$ no matter what the supply does, so the diode current does not change, and neither does its voltage. In the small-signal picture an ideal current source is an **open circuit** (its current change is always zero), so the ripple has no path to the diode. Section 1.4 makes this a rule.`,
      }),
      G('bk_c1_diode', { need: 4 }),
    ],
  });

  // ================================================================== 4. the two pictures
  // current-biased diode with a capacitor-coupled source and load (the chapter's complete example)
  const attFig = (o = {}) => [
    ['rail', [2, -1.6], { n: 'V_{DD}' }],
    ['I', [2, -1.6], [2, -0.4], { n: 'I_B', s: o.ib, side: 'r' }], ['w', [2, -0.4], [2, 0]],
    ['node', [2, 0], { n: 'X', side: 'al' }],
    ['w', [2, 0], [2, 0.2]], ['D', [2, 0.2], [2, 1.4]], ['gnd', [2, 1.4]],
    ['Vac', [-1.4, 0.4], [-1.4, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.4, 1.4]], ['w', [-1.4, 0.4], [-1.4, 0]],
    ['R', [-1.4, 0], [-0.2, 0], { n: 'R_S', s: o.rs }], ['w', [-0.2, 0], [0.4, 0]],
    ['C', [0.4, 0], [1.2, 0], { n: 'C_1' }], ['w', [1.2, 0], [2, 0], [2.8, 0]],
    ['C', [2.8, 0], [3.6, 0], { n: 'C_2' }], ['w', [3.6, 0], [4.4, 0], [5, 0]],
    ['R', [4.4, 0], [4.4, 1.4], { n: 'R_L', s: o.rl }], ['gnd', [4.4, 1.4]], ['term', [5, 0], { n: 'v_{out}' }],
  ];
  const attDC = () => [
    ['rail', [2, -1.6], { n: 'V_{DD}' }], ['I', [2, -1.6], [2, -0.4], { n: 'I_B', side: 'r' }], ['w', [2, -0.4], [2, 0]],
    ['node', [2, 0], { n: 'V_X\\approx0.7\\,\\text{V}', side: 'l' }], ['w', [2, 0], [2, 0.2]], ['D', [2, 0.2], [2, 1.4]], ['gnd', [2, 1.4]],
    ['iarr', [2, 0.1], 'd', { n: 'I_D = I_B', side: 'r', off: [14, 0] }],
  ];
  const attSS = (rd = 'r_d') => [
    ['Vac', [-1.4, 0.4], [-1.4, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.4, 1.4]], ['w', [-1.4, 0.4], [-1.4, 0]],
    ['R', [-1.4, 0], [-0.2, 0], { n: 'R_S' }], ['w', [-0.2, 0], [2, 0], [3, 0]], ['node', [2, 0], { n: 'X', side: 'a' }],
    ['R', [2, 0], [2, 1.4], { n: rd, side: 'l' }], ['gnd', [2, 1.4]], ['w', [3, 0], [3.4, 0]],
    ['R', [3.4, 0], [3.4, 1.4], { n: 'R_L' }], ['gnd', [3.4, 1.4]], ['w', [3.4, 0], [4.2, 0]], ['term', [4.2, 0], { n: 'v_{out}' }],
  ];
  const triFig = () => row([
    { fig: [['w', [0, 0], [0.8, 0]], ['node', [0, 0], { n: 'G', side: 'l', dot: true }], ['V', [0.8, 0], [0.8, 1.2], { n: 'V_B', side: 'r' }], ['gnd', [0.8, 1.2]]], cap: 'Held by a DC source' },
    { fig: [['w', [0, 0], [0.8, 0]], ['node', [0, 0], { n: 'G', side: 'l', dot: true }], ['acg', [0.8, 0]]], cap: 'The course\'s triangle' },
    { fig: [['w', [0, 0], [0.8, 0]], ['node', [0, 0], { n: 'G', side: 'l', dot: true }], ['gnd', [0.8, 0]]], cap: 'Small-signal: ground' },
  ]);

  L({
    id: 'bk01-two', title: 'Two pictures: the DC circuit and the small-signal circuit',
    steps: [
      R(md`
        ### The question

        A real amplifier mixes everything at once: DC supplies, a signal source, capacitors, current sources and curved devices. How do we get the signal's response without solving one horrible nonlinear circuit? We split the circuit into **two pictures**: a DC picture that finds the operating point, and a small-signal picture that is linear and gives the response to the signal. This section says exactly what every element turns into in each picture, and why.

        On Exams 2 and 3, every problem is worked this way. Most lost points are an element drawn wrong in the small-signal picture: a supply left at $5\,\text{V}$, a current source left in, a capacitor left open.
      `),
      R(md`
        ### The physical picture: ground means "does not move"

        You stand in an elevator stopped at the 5th floor and jump. To describe the jump, you measure height from the elevator floor, not from the basement: the "5th floor" is the bias, the jump is the signal, and for the jump the elevator floor is "ground".

        A circuit node held at $5\,\text{V}$ by the supply is exactly that floor. Whatever the signal does, that node stays at $5\,\text{V}$: its **change** is zero. In the small-signal picture we only track changes, so a node whose change is zero is ground, even though it sits at $5\,\text{V}$. We call it an **incremental ground** (or AC ground).
      `),
      R(md`
        ### The derivation: what each element becomes

        For each element, write the law it obeys with **totals**, split each total into DC + change, and subtract the DC law. What is left is the element's law for changes, which is what it becomes in the small-signal picture.

        **1. A resistor.** Totals: $V + v = R(I + i)$. The DC law is $V = RI$. Subtract:
        $$v = R\,i$$
        A resistor is itself in both pictures.

        **2. A DC voltage source** (a supply $V_{DD}$, a bias $V_B$). Its law is "my voltage is $V_0$, whatever my current". The total voltage is always $V_0$, so its change is zero for any current change:
        $$v = 0\quad\text{for every } i$$
        Zero voltage for any current is a **short circuit**. Its grounded end is ground, so its other end becomes an incremental ground.

        **3. A DC current source.** Its law is "my current is $I_0$, whatever my voltage". So its current change is zero for any voltage change:
        $$i = 0\quad\text{for every } v$$
        Zero current for any voltage is an **open circuit**: in the small-signal picture, delete it.
      `),
      R(md`
        **4. A capacitor.** Its law is $i = C\,dv/dt$.
        - At DC nothing changes, so $dv/dt = 0$ and $i = 0$: in the DC picture a capacitor is **open**. That is how a capacitor blocks the bias from leaking into the source or the load.
        - For the signal, a *large* capacitor charges up to its DC voltage and then holds it, like a small rechargeable battery. A signal current barely changes its voltage. For example, $1\,\text{mA}$ of signal at $1\,\text{kHz}$ through $100\,\mu\text{F}$ moves its voltage by only $1.6\,\text{mV}$. If its voltage change is (nearly) zero, it is a **short** in the small-signal picture. (Chapter 10 makes this exact: the capacitor's impedance $1/(j\omega C)$ goes to zero for large $C$.)

        **5. The signal sources.** In the DC picture they are off: a signal voltage source is a short, a signal current source is open. In the small-signal picture they are the only sources left.

        **6. A curved device.** In the DC picture it keeps its full law (or the $0.7\,\text{V}$ approximation for a diode). In the small-signal picture it is replaced by its slope at $Q$: a diode becomes $r_d = V_T/I_D$ (Section 1.3); a MOSFET becomes $g_m$ and $r_{ds}$ (Chapter 2).

        **Why the split is legal.** Every element's law for *changes* (lines 1 to 6) is linear, so the small-signal picture is a linear circuit and ordinary nodal analysis, dividers and Thévenin all work on it. The DC picture is nonlinear, but we solve it only once, and the signal never enters it.
      `),
      RF(md`
        ### The triangle: incremental ground with the source left out

        Very often a node is held at a DC voltage by a bias network we do not want to draw: the gate of a transistor tied to a bias $V_B$, say. In the small-signal picture that node does not move, so it is ground. The course draws it with an **open triangle**, which means "held at some DC voltage; incremental ground". The three drawings below are the same thing for signals.

        [[fig:tri]]

        !!key What every element becomes
          | Element | DC picture | Small-signal picture |
          |---|---|---|
          | Resistor | itself | itself |
          | DC voltage source ($V_{DD}$, $V_B$, triangle) | itself | short (its node is ground) |
          | DC current source | itself | **open** (delete it) |
          | Large capacitor | **open** | short |
          | Signal source $v_s$ | short (off) | itself |
          | Diode | $0.7\,\text{V}$ drop | $r_d = V_T/I_D$ |
          | MOSFET (Chapter 2) | square law | $g_m$, $r_{ds}$ |
      `, { tri: { svg: triFig(), cap: 'Three drawings of the same node $G$ for small signals.' } }),
      R(md`
        !!method The two-picture method
          1. **DC picture.** Signal sources off (voltage sources shorted, current sources opened), capacitors open. Solve for the operating point $Q$ with the nonlinear laws.
          2. **Slopes.** From $Q$, compute each device's small-signal parameters ($r_d$ now; $g_m$, $r_{ds}$ in Chapter 2).
          3. **Small-signal picture.** DC voltage sources shorted (supply rails become ground), DC current sources deleted, large capacitors shorted, devices replaced by their slopes, signal sources kept.
          4. **Solve** the linear circuit for what was asked ($v_{out}/v_s$, a resistance).
          5. **Totals,** if asked: total $=$ DC value from step 1 $+$ signal from step 4.
      `),
      RF(md`
        ### A complete worked example: an electronically controlled attenuator

        A current source $I_B = 0.5\,\text{mA}$ from $V_{DD}$ biases a diode. The signal $v_s$ (with source resistance $R_S = 1\kO$) comes in through a large capacitor $C_1$, and the output leaves through another large capacitor $C_2$ into a load $R_L = 10\kO$. Find $v_{out}/v_s$, and the output for a $20\,\text{mV}$-peak $v_s$.

        [[fig:full]]

        **Step 1: DC picture.** $v_s$ is off, and both capacitors are open, so the source branch and the load branch carry no DC current. All of $I_B$ goes through the diode:
        $$I_D = I_B = 0.5\,\text{mA},\qquad V_X\approx0.7\,\text{V}$$
        The output, behind the open $C_2$, sits at $0\,\text{V}$ DC (the load pulls it to ground).

        [[fig:dc]]

        **Step 2: slope.** $r_d = 25\,\text{mV}/0.5\,\text{mA} = 50\,\Omega$.

        **Step 3: small-signal picture.** $I_B$ is a DC current source, so it is deleted; with it gone, $V_{DD}$ is not connected to anything and disappears too. Both capacitors become wires. The diode becomes $r_d$.

        [[fig:ss]]

        **Step 4: solve.** At node $X$, $r_d$ and $R_L$ both go to ground, so they are in parallel:
        $$r_d\parallel R_L = \frac{50\times10000}{50 + 10000}\,\Omega = 49.75\,\Omega$$
        $R_S$ and that parallel pair form a divider, and $v_{out} = v_x$ because $C_2$ is a wire:
        $$\frac{v_{out}}{v_s} = \frac{49.75}{1000 + 49.75} = 0.0474$$
        So $20\,\text{mV}$ in gives $0.948\,\text{mV}$ out.

        **Step 5: totals.** $v_X(t) = 0.7\,\text{V} + 0.948\,\text{mV}\sin\omega t$, while $v_{OUT}(t) = 0 + 0.948\,\text{mV}\sin\omega t$: $C_2$ passed the signal and blocked the $0.7\,\text{V}$.
      `, { full: { fig: attFig({ ib: '0.5\\,\\text{mA}', rs: '1\\,\\text{k}\\Omega', rl: '10\\,\\text{k}\\Omega' }), cap: 'The circuit. $C_1$ and $C_2$ are large.' },
        dc: { fig: attDC(), cap: 'DC picture: $v_s$ off, $C_1$ and $C_2$ open. Only $I_B$ and the diode are left.' },
        ss: { fig: attSS('r_d = 50\\,\\Omega'), cap: 'Small-signal picture: $I_B$ open (gone, and $V_{DD}$ with it), capacitors shorted, diode $\\to r_d$.' } }),
      R(md`
        ### Check it, and what it means

        - **Limits.** If $I_B\to0$, $r_d\to\infty$ and the output is set by $R_L$ alone: $10/(1 + 10) = 0.91$ of $v_s$ (the diode has vanished). If $I_B$ is large, $r_d\to0$ and the output vanishes (the diode shorts the node).
        - **The knob.** $I_B = 0.05\,\text{mA}$ gives $r_d = 500\,\Omega$ and a gain of $0.323$; $I_B = 5\,\text{mA}$ gives $r_d = 5\,\Omega$ and $0.0050$. A DC current, which the signal never sees, sets the signal's gain over a $65\times$ range. That is a voltage-controlled attenuator, and it is the same trick a transistor uses: the bias sets the slope, and the slope sets the gain.
        - **What the capacitors bought us.** $C_1$ keeps the source from disturbing the bias; $C_2$ keeps the load from disturbing it and keeps the $0.7\,\text{V}$ off the output. Without them, the DC picture would include $R_S$ and $R_L$.

        ### How to recognize it

        Before drawing the small-signal picture, walk around the circuit and label every element: "DC source: short", "current source: open", "big C: short", "diode: $r_d$". Then redraw. Rails become grounds, current sources disappear, and resistors that went to $V_{DD}$ now go to ground.
      `),
      R(md`
        !!mistake Common mistakes
          **Leaving a supply at $5\,\text{V}$ in the small-signal picture.** A resistor from the output to $V_{DD}$ is, for signals, a resistor from the output to ground.

          **Keeping a DC current source.** An ideal current source is an open in the small-signal picture, even though it carries the whole bias current at DC.

          **Treating a coupling capacitor as open for the signal** (or short for DC). Open at DC, short for the signal.

          **Putting DC values into the small-signal picture.** No $0.7\,\text{V}$, no $5\,\text{V}$, no $I_B$ arrows: only changes.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`In the small-signal picture, an ideal DC current source becomes...`,
        ['an open circuit', 'a short circuit', md`a resistor $V_{DD}/I_B$`, 'itself, unchanged'], 0,
        [null, 'That is what a DC *voltage* source becomes. A current source fixes the current, so its current change is zero: an open.', 'An ideal current source has no resistance to speak of: its current does not change with its voltage at all.', 'Its DC current never changes, so the change is zero: it carries no signal.'],
        md`Its current is fixed, so $i = 0$ for any $v$: an open circuit.`),
      Q(md`A large coupling capacitor sits between a signal source and a diode. What is it in each picture?`,
        ['Open in the DC picture, short in the small-signal picture', 'Short in the DC picture, open in the small-signal picture', 'Open in both', 'Short in both'], 0,
        [null, md`Backwards: at DC $i = C\,dv/dt = 0$, which is an open.`, md`Then no signal would get through either. A large capacitor holds its DC voltage, so for signals it acts as a short.`, md`At DC nothing changes, so no current flows through a capacitor: open.`],
        md`DC: $dv/dt = 0$, so $i = 0$: open (it blocks the bias). Signal: its voltage barely changes, so it acts as a short (it passes the signal).`),
      Q(md`A resistor $R_1$ runs from a node $X$ up to $V_{DD} = 5\,\text{V}$. In the small-signal picture, where does $R_1$'s top end go?`,
        ['To ground', md`To a $5\,\text{V}$ source`, 'Nowhere: it is left open', md`To $V_{DD}$, drawn as a current source`], 0,
        [null, md`$V_{DD}$ does not change, so its change is zero: incremental ground.`, md`A DC source is a short for changes: the $5\,\text{V}$ belongs to the DC picture only.`, md`A DC *voltage* source is a short, not an open.`],
        md`$V_{DD}$ is an incremental ground, so $R_1$ goes from $X$ to ground.`),
      P({
        id: 'bk01-two-what', title: 'What becomes what',
        q: md`In the attenuator above (biased at $I_D = 1\,\text{mA}$ this time), say what each element is in the **small-signal** picture.`,
        fig: attFig(),
        parts: [
          { lbl: '1. $V_{DD}$', mc: ['Incremental ground', 'A $5\\,\\text{V}$ source', 'An open'], a: 0, why: [null, 'DC values do not appear in the small-signal picture.', 'A DC voltage source is a short, not an open.'] },
          { lbl: '2. $I_B$', mc: ['An open (deleted)', 'A short', 'A resistor'], a: 0, why: [null, 'A short is what a DC voltage source becomes.', 'An ideal current source has no resistance: its current never changes.'] },
          { lbl: '3. $C_1$ and $C_2$', mc: ['Shorts', 'Opens', 'Resistors $1/C$'], a: 0, why: [null, 'They are open at DC, not for the signal.', 'A large capacitor is a short for signals.'] },
          { lbl: '4. The diode', mc: ['A $25\\,\\Omega$ resistor', 'A $0.7\\,\\text{V}$ source', 'A $700\\,\\Omega$ resistor'], a: 0, why: [null, 'The $0.7\\,\\text{V}$ belongs to the DC picture.', 'That is the chord $0.7\\,\\text{V}/1\\,\\text{mA}$. The slope is $V_T/I_D = 25\\,\\Omega$.'] },
        ],
        sol: md`$V_{DD}$: incremental ground. $I_B$: open. $C_1$, $C_2$: shorts. Diode: $r_d = 25\,\text{mV}/1\,\text{mA} = 25\,\Omega$.`,
      }),
      P({
        id: 'bk01-two-r1', title: 'Resistor bias instead of a current source',
        q: md`Replace $I_B$ by a resistor $R_1 = 4.3\kO$ from $V_{DD} = 5\,\text{V}$ to $X$. Keep $R_S = 1\kO$ and the capacitors, and use $R_L = 1\kO$. Find $I_D$, $r_d$, the total resistance from $X$ to ground in the small-signal picture, and $v_{out}/v_s$.`,
        parts: [
          { lbl: 'I_D', unit: 'mA', ans: 1 },
          { lbl: 'r_d', unit: 'Ω', ans: 25 },
          { lbl: 'R_X', unit: 'Ω', ans: 24.25, traps: [{ v: 4325, msg: '$R_1$ and $r_d$ are not in series: $R_1$ goes to (incremental) ground.' }] },
          { lbl: 'v_{out}/v_s', unit: '', ans: 0.02368 },
        ],
        hints: [md`DC: the capacitors are open, so all of $R_1$'s current goes into the diode.`, md`Small signal: $R_1$, $r_d$ and $R_L$ all run from $X$ to ground.`],
        sol: md`
1. DC: $I_D = (5 - 0.7)/4.3\kO = 1\,\text{mA}$.
2. $r_d = 25\,\Omega$.
3. Small signal: $V_{DD}$ is ground, so $R_1$ runs from $X$ to ground, beside $r_d$ and $R_L$:
$$R_X = 4300\parallel25\parallel1000 = \frac{1}{\frac{1}{4300} + \frac{1}{25} + \frac{1}{1000}} = \frac{1}{0.000233 + 0.04 + 0.001} = 24.25\,\Omega$$
4. $v_{out}/v_s = \dfrac{24.25}{1000 + 24.25} = 0.0237$.

($24.39\,\Omega$, the answer without $R_1$, is within $1\%$: $R_1$ is $170\times$ bigger than $r_d$, so it barely matters. Section 1.6 makes that habit precise.)`,
      }),
      P({
        id: 'bk01-two-design', title: 'Design the attenuator',
        q: md`Same current-biased circuit with $R_S = 1\kO$, but the output drives a very high resistance ($R_L\to\infty$). What bias current $I_B$ gives $v_{out}/v_s = 0.1$?`,
        parts: [
          { lbl: 'r_d', unit: 'Ω', ans: 111.1, traps: [{ v: 100, msg: 'The divider is $r_d/(R_S + r_d) = 0.1$, so $r_d = R_S/9$, not $R_S/10$.' }] },
          { lbl: 'I_B', unit: 'mA', ans: 0.225, traps: [{ v: 0.25, msg: 'That uses $r_d = 100\\,\\Omega$. Solve $r_d/(R_S + r_d) = 0.1$ exactly: $r_d = R_S/9$.' }] },
        ],
        hints: [md`$\dfrac{r_d}{R_S + r_d} = 0.1\Rightarrow r_d = 0.1R_S + 0.1r_d$.`, md`Then $I_B = V_T/r_d$.`],
        sol: md`
1. $r_d = 0.1(R_S + r_d)\Rightarrow0.9\,r_d = 0.1R_S\Rightarrow r_d = R_S/9 = 111.1\,\Omega$.
2. $I_B = V_T/r_d = 25\,\text{mV}/111.1\,\Omega = 0.225\,\text{mA}$.`,
      }),
      P({
        id: 'bk01-two-total', title: 'Totals: DC plus signal',
        q: md`The attenuator with $I_B = 1\,\text{mA}$, $R_S = 2\kO$, $R_L = 5\kO$ and a $50\,\text{mV}$-peak $v_s$. Find the DC voltage at $X$, the DC voltage at the output, and the signal amplitude at the output.`,
        parts: [
          { lbl: 'V_X', unit: 'V', ans: 0.7 },
          { lbl: 'V_{OUT}\\ \\text{(DC)}', unit: 'V', ans: 0, },
          { lbl: '|v_{out}|', unit: 'mV', ans: 0.6143 },
        ],
        hints: [md`$C_2$ is open at DC, and $R_L$ goes to ground.`, md`$r_d = 25\,\Omega$; $r_d\parallel R_L$, then a divider with $R_S$.`],
        sol: md`
1. DC: all of $I_B$ flows in the diode, so $V_X\approx0.7\,\text{V}$.
2. DC at the output: $C_2$ is open and $R_L$ carries no current, so $V_{OUT} = 0$.
3. Signal: $r_d = 25\,\Omega$, $r_d\parallel R_L = 25\parallel5000 = 24.88\,\Omega$, so $|v_{out}| = 50\,\text{mV}\times\dfrac{24.88}{2000 + 24.88} = 0.614\,\text{mV}$.

So $v_X(t) = 0.7\,\text{V} + 0.614\,\text{mV}\sin\omega t$ and $v_{OUT}(t) = 0.614\,\text{mV}\sin\omega t$.`,
      }),
      P({
        id: 'bk01-two-stack', title: 'Exam style: a signal into the middle of a stack',
        q: md`$I_B = 1\,\text{mA}$ flows from $V_{DD}$ into node $X$. Diode $D_1$ runs from $X$ down to node $Y$, and $D_2$ from $Y$ to ground. The signal $v_s$, through $R_S = 1\kO$ and a large capacitor, drives the middle node $Y$. The output is node $X$, with nothing else attached. Find (a) $V_X$ (DC), (b) each diode's $r_d$, (c) $v_y/v_s$, (d) $v_x/v_s$.`,
        figHtml: Schem.render([
          ['rail', [2, -2.4], { n: 'V_{DD}' }], ['I', [2, -2.4], [2, -1.2], { n: 'I_B', side: 'r' }], ['w', [2, -1.2], [2, -1], [2.8, -1]], ['term', [2.8, -1], { n: 'v_x' }], ['node', [2, -1], { n: 'X', side: 'l' }],
          ['D', [2, -1], [2, 0], { n: 'D_1', side: 'r' }], ['node', [2, 0], { n: 'Y', side: 'ar' }], ['D', [2, 0], [2, 1.2], { n: 'D_2', side: 'r' }], ['gnd', [2, 1.2]],
          ['Vac', [-1.4, 0.4], [-1.4, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.4, 1.4]], ['w', [-1.4, 0.4], [-1.4, 0]],
          ['R', [-1.4, 0], [-0.2, 0], { n: 'R_S' }], ['w', [-0.2, 0], [0.6, 0]], ['C', [0.6, 0], [1.4, 0]], ['w', [1.4, 0], [2, 0]],
        ]),
        parts: [
          { lbl: '(a)\\ V_X', unit: 'V', ans: 1.4 },
          { lbl: '(b)\\ r_d', unit: 'Ω', ans: 25 },
          { lbl: '(c)\\ v_y/v_s', unit: '', ans: 0.02439 },
          { lbl: '(d)\\ v_x/v_s', unit: '', ans: 0.02439, traps: [{ v: 0.04762, msg: 'Only $D_2$ goes to ground. $D_1$ leads to $X$, where the current source is open: no signal current flows in $D_1$.' }, { v: 0, msg: '$X$ is not held by anything: the current source is an open, not a ground.' }] },
        ],
        hints: [md`DC: both diodes carry $I_B$; the capacitor keeps $R_S$ out of the DC picture.`, md`Small signal: $I_B$ is open, so node $X$ is connected only to $D_1$'s $r_d$. What current flows through $r_d$ of $D_1$?`],
        sol: md`
**(a)** DC: the capacitor is open, so all of $I_B$ goes down through $D_1$ and $D_2$. Two drops: $V_X = 2\times0.7 = 1.4\,\text{V}$ (and $V_Y = 0.7\,\text{V}$).

**(b)** Both diodes carry $1\,\text{mA}$: $r_d = 25\,\Omega$ each.

**(c)** Small signal: $I_B$ is open. Node $Y$ connects to $R_S$ (to $v_s$), to $D_2$'s $r_d$ (to ground), and to $D_1$'s $r_d$ (up to $X$, which connects to nothing else). No current can flow into $X$, so no current flows in $D_1$'s $r_d$, and it does not load $Y$:
$$\frac{v_y}{v_s} = \frac{25}{1000 + 25} = 0.0244$$

**(d)** No current in $D_1$'s $r_d$ means no voltage across it: $v_x = v_y$, so $v_x/v_s = 0.0244$. The top node simply follows the middle node.`,
      }),
      G('bk_c1_two', { need: 4 }),
    ],
  });

  // ================================================================== 5. dependent sources and the test source
  const testSrc = (x, y, dx = 1.3) => [['w', [x, y], [x - dx, y]], ['V', [x - dx, y], [x - dx, y + 1.4], { n: 'v_t', side: 'l' }], ['gnd', [x - dx, y + 1.4]], ['iarr', [x - dx * 0.5, y], 'r', { n: 'i_t' }]];
  const ownFig = (rev = false) => [
    ...testSrc(1.6, 0), ['node', [1.6, 0], { n: 'A', side: 'a', dot: true }],
    ['G', rev ? [1.6, 1.4] : [1.6, 0], rev ? [1.6, 0] : [1.6, 1.4], { n: 'g_mv_x', side: 'r' }], ['gnd', [1.6, 1.4]],
    ['vlab', [1.2, 0.2], [1.2, 1.2], { n: 'v_x', side: 'l' }],
  ];
  const ownEq = () => [['w', [0, 0], [0.6, 0]], ['node', [0, 0], { n: 'A', side: 'a', dot: true }], ['R', [0.6, 0], [0.6, 1.4], { n: '1/g_m' }], ['gnd', [0.6, 1.4]]];
  const divCtl = () => [
    ...testSrc(1.4, 0), ['node', [1.4, 0], { n: 'A', side: 'a', dot: true }],
    ['G', [1.4, 0], [1.4, 1.6], { n: 'g_mv_c', side: 'r' }], ['gnd', [1.4, 1.6]],
    ['w', [1.4, 0], [3.4, 0]], ['R', [3.4, 0], [3.4, 1.2], { n: 'R_a' }], ['node', [3.4, 1.2], { n: 'C', side: 'l' }],
    ['R', [3.4, 1.2], [3.4, 2.4], { n: 'R_b', side: 'l' }], ['gnd', [3.4, 2.4]], ['vlab', [3.8, 1.35], [3.8, 2.25], { n: 'v_c' }],
  ];
  const fbFig = (o = {}) => [
    ...(o.test ? [['gnd', [0, 0.6]], ['w', [0, 0], [0, 0.6]]] : [['Vac', [0, 0.4], [0, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [0, 1.4]], ['w', [0, 0.4], [0, 0]]]),
    ['R', [0, 0], [1.4, 0], { n: 'R_1', side: 'b' }], ['node', [1.4, 0], { n: 'v_1', side: 'a', dot: true }],
    ['R', [1.4, 0], [3, 0], { n: 'R_F', side: 'b' }], ['w', [3, 0], [3.2, 0]], ['node', [3.2, 0], { n: o.test ? '' : 'v_2', side: 'a', dot: true }],
    ['G', [3.2, 0], [3.2, 1.4], { n: 'g_mv_1', side: 'r' }], ['gnd', [3.2, 1.4]],
    ['w', [3.2, 0], [4.6, 0]], ['R', [4.6, 0], [4.6, 1.4], { n: 'R_2' }], ['gnd', [4.6, 1.4]],
    ...(o.test ? [['w', [4.6, 0], [5.8, 0]], ['V', [5.8, 0], [5.8, 1.4], { n: 'v_t', side: 'r' }], ['gnd', [5.8, 1.4]], ['iarr', [5.25, 0], 'l', { n: 'i_t' }]]
      : [['w', [4.6, 0], [5.4, 0]], ['term', [5.4, 0], { n: 'v_{out}' }]]),
  ];

  L({
    id: 'bk01-test', title: 'Dependent sources and the test-source method',
    steps: [
      R(md`
        ### The question

        What resistance does a circuit present at a pair of terminals? With resistors only, you combine them in series and parallel. Once a transistor is in the circuit, its small-signal model contains a **dependent source**, and series/parallel rules no longer work. The **test-source method** always works. This section explains where dependent sources come from, gives the method step by step, and uses it on three circuits that contain the seeds of Chapters 3 to 5.

        On Exam 2, every $R_{in}$, $R_{out}$ and $R_{EQ}$ was a test-source calculation. On Exam 3 it is the same, with BJTs.
      `),
      R(md`
        ### The physical picture: why a device becomes a controlled source

        A transistor is a valve whose handle is not in the water's path. The voltage between two terminals (gate and source) sets the current between two others (drain and source), and no current flows through the handle itself. For small changes that current changes in proportion to the controlling voltage, $i = g_mv_c$, where $g_m$ is the slope from Section 1.2.

        An element whose current is set by a voltage somewhere else is a **voltage-controlled current source** (VCCS). It is drawn as a diamond with an arrow, labelled with its law, such as $g_mv_x$, and its controlling voltage is marked with $+$ and $-$ wherever it is measured.

        A dependent source has no life of its own: with zero control voltage it delivers nothing. It is part of a device, not a signal. That is why it **stays in the circuit** when we turn the independent sources off.
      `),
      R(md`
        ### The key observation: a resistor is a VCCS

        A resistor obeys $i = \dfrac{1}{R}\,v$: its current is proportional to the voltage across **its own** terminals. So a resistor is a VCCS with transconductance $1/R$, controlled by its own voltage. Turn that around:

        !!key A VCCS controlled by its own terminal voltage is a resistor
          If a source pushes $i = g_mv_x$ through two terminals, and $v_x$ is the voltage across those same two terminals (with the current flowing from $+$ to $-$ through the source), it is indistinguishable from a resistor
          $$R = \frac{1}{g_m}$$

        This one fact is why a diode-connected transistor looks like $1/g_m$ (Chapter 3), and why "the source looks like about $1/g_m$" on every Exam 2 problem. We now prove it with the general method.
      `),
      R(md`
        !!method The test-source method
          1. **Turn off every independent source** (signal and DC): voltage sources become shorts, current sources become opens. **Keep every dependent source.**
          2. **Apply a test voltage** $v_t$ across the two terminals you are looking into (usually a node and ground). Call $i_t$ the current it pushes in.
          3. **Write each controlling voltage in terms of $v_t$.** This is the step that decides everything.
          4. **KCL at the test node:** add up the currents leaving it through every branch, and set the sum equal to $i_t$.
          5. **Divide:** $R = v_t/i_t$.

          A test current $i_t$ with $v_t$ unknown works just as well; use whichever makes step 3 easier.
      `),
      RF(md`
        ### Example 1: a VCCS controlled by its own voltage

        A VCCS $g_mv_x$ runs from node $A$ to ground, with its arrow pointing down (current flows from $A$ to ground through it), and $v_x$ is the voltage of $A$. What resistance do we see at $A$?

        [[fig:own]]

        **Step 1.** There are no independent sources to turn off.

        **Step 2.** Apply $v_t$ at $A$.

        **Step 3: the controlling voltage.** $v_x$ is the voltage of $A$, and the test source holds $A$ at $v_t$:
        $$v_x = v_t$$

        **Step 4: KCL at $A$.** The only branch leaving $A$ is the source, which carries $g_mv_x$ from $A$ to ground. All of it comes from the test source:
        $$i_t = g_mv_x = g_mv_t$$

        **Step 5:**
        $$R = \frac{v_t}{i_t} = \frac{v_t}{g_mv_t} = \frac{1}{g_m}$$
        With $g_m = 4\,\text{mS}$, that is $250\,\Omega$, exactly like a $250\,\Omega$ resistor.
      `, { own: { svg: row([{ fig: ownFig(), cap: 'Test source on a VCCS controlled by its own voltage' }, { fig: ownEq(), cap: 'What it is equivalent to' }]), cap: 'The source pulls $g_mv_t$ out of $A$ when $A$ is at $v_t$: the law of a resistor $1/g_m$.' } }),
      R(md`
        **What if the arrow is reversed** (the source pushes $g_mv_x$ *into* $A$)? Then KCL gives $i_t = -g_mv_t$ and $R = -1/g_m$: a **negative resistance**, which supplies power instead of absorbing it. Oscillators are built that way. It is a reminder that in step 4 the direction of every arrow matters.
      `),
      RF(md`
        ### Example 2: the controlling voltage is only a fraction of $v_t$

        Now the source still sits from $A$ to ground, but its controlling voltage $v_c$ is taken from a divider $R_a$, $R_b$ hanging from $A$. What resistance do we see at $A$?

        [[fig:div]]

        **Step 3: the controlling voltage.** The source does not touch node $C$, so the divider carries one current, $v_t/(R_a + R_b)$, and
        $$v_c = v_t\,\frac{R_b}{R_a + R_b} = K\,v_t,\qquad K = \frac{R_b}{R_a + R_b}$$

        **Step 4: KCL at $A$.** Two branches leave $A$: the source, carrying $g_mv_c = g_mKv_t$, and the divider, carrying $v_t/(R_a + R_b)$:
        $$i_t = g_mK\,v_t + \frac{v_t}{R_a + R_b}$$

        **Step 5.** The two branches are in parallel, and their conductances add:
        $$R = \frac{v_t}{i_t} = \frac{1}{\dfrac{1}{R_a + R_b} + g_mK} = (R_a + R_b)\parallel\frac{1}{g_mK}$$
        Putting $K$ back in and multiplying top and bottom by $R_a + R_b$ gives a compact form:
        $$R = \frac{R_a + R_b}{1 + g_mR_b}$$

        **Numbers.** $R_a = 3\kO$, $R_b = 1\kO$, $g_m = 4\,\text{mS}$: $K = 0.25$, so the source alone looks like $1/(g_mK) = 1/(1\,\text{mS}) = 1\kO$; in parallel with the divider's $4\kO$, $R = 800\,\Omega$. The compact form agrees: $4\kO/(1 + 4) = 800\,\Omega$.

        !!intuition A source that sees only part of the voltage looks bigger
          When the control voltage is only $K$ times the test voltage, the source draws only $K$ times the current, so it looks $1/K$ times larger: $1/(g_mK)$. Chapter 3 meets the same idea as "the K rule", for a transistor whose gate moves by $K$ times its drain.
      `, { div: { fig: divCtl(), cap: 'The controlling voltage $v_c$ is the divider\'s fraction $K = R_b/(R_a + R_b)$ of $v_t$.' } }),
      RF(md`
        ### Worked example: Thévenin and Norton with a dependent source

        A signal $v_s$ drives node 1 through $R_1 = 1\kO$. A feedback resistor $R_F = 10\kO$ joins node 1 to node 2, the output. At node 2, a VCCS $g_mv_1$ (with $g_m = 10\,\text{mS}$, controlled by the voltage of node 1) pulls current to ground, and $R_2 = 10\kO$ goes to ground. Find the Thévenin equivalent seen at the output, and the output with a $1\kO$ load.

        [[fig:fb]]

        **Part 1: $R_{th}$ by the test-source method.** Turn $v_s$ off (a short: $R_1$ now goes from node 1 to ground), keep the VCCS, and apply $v_t$ at node 2.

        [[fig:fbt]]

        *Step 3: the controlling voltage.* Node 1 now connects only to $R_1$ (to ground) and $R_F$ (to $v_t$): a divider.
        $$v_1 = v_t\,\frac{R_1}{R_1 + R_F} = v_t\,\frac{1}{11}$$

        *Step 4: KCL at node 2.* Three branches leave it. Through $R_2$: $v_t/R_2$. Through the VCCS: $g_mv_1$. Through $R_F$ toward node 1: $(v_t - v_1)/R_F$, and since $v_t - v_1 = v_t\,R_F/(R_1 + R_F)$ this is $v_t/(R_1 + R_F)$:
        $$i_t = \frac{v_t}{R_2} + g_m\frac{R_1}{R_1 + R_F}v_t + \frac{v_t}{R_1 + R_F} = v_t\left[\frac{1}{R_2} + \frac{1 + g_mR_1}{R_1 + R_F}\right]$$

        *Step 5:*
        $$R_{th} = R_2\parallel\frac{R_1 + R_F}{1 + g_mR_1} = 10\kO\parallel\frac{11\kO}{1 + 10} = 10\kO\parallel1\kO = 909\,\Omega$$
        Without the VCCS the answer would be $R_2\parallel(R_1 + R_F) = 5.24\kO$. The dependent source divided the $R_1 + R_F$ path by $1 + g_mR_1 = 11$: feedback lowers the output resistance.

        **Part 2: $v_{th}$, the open-circuit output.** Put $v_s$ back, nothing on the output, and write KCL at both nodes (conductances in mS, so $1\kO\to1\,\text{mS}$, $10\kO\to0.1\,\text{mS}$).

        *Node 2* (currents leaving: through $R_F$, the VCCS, $R_2$):
        $$0.1(v_2 - v_1) + 10\,v_1 + 0.1\,v_2 = 0\quad\Rightarrow\quad0.2\,v_2 = -9.9\,v_1\quad\Rightarrow\quad v_2 = -49.5\,v_1$$

        *Node 1* (currents leaving: through $R_1$ to the source, through $R_F$):
        $$1\,(v_1 - v_s) + 0.1\,(v_1 - v_2) = 0\quad\Rightarrow\quad1.1\,v_1 = v_s + 0.1\,v_2 = v_s - 4.95\,v_1$$
        $$6.05\,v_1 = v_s\quad\Rightarrow\quad v_1 = 0.1653\,v_s,\qquad v_{th} = v_2 = -49.5\times0.1653\,v_s = -8.18\,v_s$$

        **Part 3: use it.** The output is a source $-8.18\,v_s$ behind $909\,\Omega$. With a $1\kO$ load, a divider:
        $$v_{out} = -8.18\,v_s\times\frac{1000}{1000 + 909} = -4.29\,v_s$$
        (A full nodal solve with the load in place gives the same $-4.286$.) The **Norton** form is the same thing as a current source $i_N = v_{th}/R_{th} = -8.18\,v_s/909\,\Omega = -9.0\,\text{mS}\times v_s$ (flowing out of the circuit into a load) in parallel with $909\,\Omega$; shorting the output and computing the current directly gives the same $-9.0\,\text{mS}\times v_s$. Chapter 4 measures this short-circuit current the other way round, from the short *into* the stage, and calls it $G_Mv_{in}$: with that sign it is $+9.0\,\text{mS}\times v_s$.
      `, { fb: { fig: fbFig(), cap: 'A VCCS with resistive feedback. $v_1$ and $v_2$ are node voltages.' }, fbt: { fig: fbFig({ test: true }), cap: 'For $R_{th}$: $v_s$ shorted, VCCS kept, test source at the output.' } }),
      R(md`
        ### Check it

        - **Example 2, $g_m\to0$:** $R\to R_a + R_b$, the divider alone. **$R_b\to0$:** the source sees no voltage, $R = R_a$. **$R_a\to0$:** the source sees all of $v_t$ ($K = 1$) and $R = R_b\parallel1/g_m$. Each limit makes sense.
        - **Worked example, $g_m\to0$:** $R_{th}\to R_2\parallel(R_1 + R_F)$, plain resistors. ✓
        - **Units:** $g_mR$ is (A/V)(V/A), a pure number, so $1 + g_mR_1$ is dimensionless and $R_{th}$ is in ohms. ✓
        - **Thévenin and Norton agree:** $i_N\times R_{th} = v_{th}$. ✓

        ### What it means

        A dependent source makes a circuit's resistance depend on **where its control voltage is measured**. If the control voltage rises with the test voltage, the source draws current in step with it and looks like a (smaller) resistor in parallel. If it falls, the source fights the test source and the resistance grows. Every transistor terminal resistance in Chapter 3 is one of these two stories.

        ### How to recognize it

        Any time a dependent source appears in the circuit you are looking into, put away series/parallel and reach for the test source. The first line you write is always "the controlling voltage, in terms of $v_t$, is ...".
      `),
      R(md`
        !!mistake Common mistakes
          **Turning off the dependent source.** Only independent sources are zeroed. A dependent source is part of the device.

          **Writing the controlling voltage with the wrong sign.** $v_x$ is measured from its $+$ mark to its $-$ mark. If $v_x$ is marked from ground to the test node, then $v_x = -v_t$.

          **Forgetting a branch in KCL.** List every element touching the test node before writing the sum.

          **Using series/parallel through a dependent source.** Its "resistance" depends on the rest of the circuit, so it is not a resistor between its own terminals unless its control voltage is its own terminal voltage.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`To find a resistance with the test-source method, what do you do with a dependent (controlled) source?`,
        ['Keep it exactly as it is', 'Replace it by a short', 'Replace it by an open', 'Replace it by a resistor equal to its gain'], 0,
        [null, md`Only independent voltage sources are shorted. A dependent source is part of the device's model.`, md`Only independent current sources are opened. Removing the dependent source throws away the transistor.`, md`That is only true when it is controlled by its own terminal voltage, and it is the *result* of the method, not a step.`],
        md`Turn off independent sources only. Dependent sources stay: they describe the device, and they come alive as soon as the test source sets their control voltage.`),
      Q(md`A VCCS $g_mv_x$ pulls current from node $A$ to ground, and $v_x$ is the voltage of $A$. What does it look like from $A$?`,
        [md`A resistor $1/g_m$`, md`An open circuit`, md`A resistor $g_m$`, 'A short to ground'], 0,
        [null, md`It carries $g_mv_t$ as soon as $A$ moves, so it is not open.`, md`$g_m$ has units of A/V; a resistance is $v_t/i_t = 1/g_m$.`, md`A short would hold $A$ at $0\,\text{V}$; this one lets $A$ move and draws a current proportional to it.`],
        md`$i_t = g_mv_t$, so $R = v_t/i_t = 1/g_m$.`),
      Q(md`The same source, but its controlling voltage is only one quarter of the test voltage ($v_x = v_t/4$, from a divider far larger than $1/g_m$). Roughly what do you see?`,
        [md`$4/g_m$`, md`$1/(4g_m)$`, md`$1/g_m$`, md`$4g_m$`], 0,
        [null, md`The source draws *less* current (a quarter), so it looks *larger*, not smaller.`, md`That ignores the divider: the source only sees $v_t/4$.`, md`Wrong units: $g_m$ is a conductance.`],
        md`$i_t\approx g_m(v_t/4)$, so $R\approx4/g_m$ (in parallel with the very large divider).`),
      P({
        id: 'bk01-test-own', title: '1/g_m, alone and with a resistor',
        q: md`A VCCS $g_mv_x$ with $g_m = 4\,\text{mS}$ pulls current from $A$ to ground, controlled by $A$'s own voltage. (a) What resistance does it present at $A$? (b) A $1\kO$ resistor is added from $A$ to ground. What is the resistance now?`,
        fig: ownFig(),
        parts: [
          { lbl: '(a)\\ R', unit: 'Ω', ans: 250 },
          { lbl: '(b)\\ R', unit: 'Ω', ans: 200, traps: [{ v: 1250, msg: 'Both branches go from $A$ to ground: they are in parallel, not series.' }] },
        ],
        hints: [md`$i_t = g_mv_t$.`, md`(b) Conductances add: $4\,\text{mS} + 1\,\text{mS}$.`],
        sol: md`
**(a)** $v_x = v_t$, so $i_t = g_mv_t$ and $R = 1/g_m = 1/(4\,\text{mS}) = 250\,\Omega$.

**(b)** Two branches leave $A$: $i_t = g_mv_t + v_t/1\kO = (4 + 1)\,\text{mS}\times v_t$, so $R = 1/(5\,\text{mS}) = 200\,\Omega = 250\,\Omega\parallel1\kO$.`,
      }),
      P({
        id: 'bk01-test-div', title: 'A divider-controlled source',
        q: md`In the divider-controlled circuit (Example 2), $R_a = 3\kO$, $R_b = 1\kO$, $g_m = 4\,\text{mS}$. Find $K$, the resistance of the source alone, and the total resistance at $A$.`,
        fig: divCtl(),
        parts: [
          { lbl: 'K', unit: '', ans: 0.25, traps: [{ v: 0.75, msg: 'The control voltage is across $R_b$, the bottom resistor: $K = R_b/(R_a + R_b)$.' }] },
          { lbl: '1/(g_mK)', unit: 'kΩ', ans: 1 },
          { lbl: 'R', unit: 'Ω', ans: 800, traps: [{ v: 250, msg: 'That is $1/g_m$: the source only sees a quarter of $v_t$.' }, { v: 235.3, msg: 'That is $(R_a + R_b)\\parallel1/g_m$: the source only sees $Kv_t$, so it looks like $1/(g_mK)$, not $1/g_m$.' }] },
        ],
        hints: [md`$v_c = Kv_t$ with $K = R_b/(R_a + R_b)$.`, md`$i_t = g_mKv_t + v_t/(R_a + R_b)$.`],
        sol: md`
1. $K = 1/(3 + 1) = 0.25$.
2. The source draws $g_mKv_t = (1\,\text{mS})\,v_t$: alone it looks like $1\kO$.
3. The divider draws $v_t/4\kO$. Conductances add: $1 + 0.25 = 1.25\,\text{mS}$, so $R = 800\,\Omega$. Compact form: $(R_a + R_b)/(1 + g_mR_b) = 4\kO/5 = 800\,\Omega$.`,
      }),
      P({
        id: 'bk01-test-divsym', title: 'The divider-controlled source, in symbols',
        q: md`Type the resistance at $A$ in Example 2, in terms of <code>Ra</code>, <code>Rb</code> and <code>gm</code>.`,
        fig: divCtl(),
        parts: [BK.ex('(Ra + Rb)/(1 + gm*Rb)', ['Ra', 'Rb', 'gm'], 'R_A', { exact: true })],
        hints: [md`The source alone is $1/(g_mK)$ with $K = R_b/(R_a + R_b)$; the divider is $R_a + R_b$; they are in parallel.`],
        sol: md`$i_t = v_t\left[\dfrac{1}{R_a + R_b} + \dfrac{g_mR_b}{R_a + R_b}\right]$, so $R_A = \dfrac{R_a + R_b}{1 + g_mR_b}$, the same as $(R_a + R_b)\parallel\dfrac{R_a + R_b}{g_mR_b}$.`,
      }),
      P({
        id: 'bk01-test-fb', title: 'Output resistance with feedback',
        q: md`The feedback circuit of the worked example with $R_1 = 1\kO$, $R_F = 4\kO$, $g_m = 4\,\text{mS}$, $R_2 = 5\kO$. Find $R_{out}$ (with $v_s$ off) as a number, then type it in symbols (<code>R1</code>, <code>RF</code>, <code>R2</code>, <code>gm</code>).`,
        fig: fbFig(),
        parts: [
          { lbl: 'R_{out}', unit: 'Ω', ans: 833.3, traps: [{ v: 2500, msg: 'That is $R_2\\parallel(R_1 + R_F)$ with the VCCS ignored. Keep the dependent source.' }, { v: 5000, msg: 'The test current also flows through $R_F$ and the VCCS.' }] },
          BK.ex('R2 || (R1 + RF)/(1 + gm*R1)', ['R1', 'RF', 'R2', 'gm'], 'R_{out}', { exact: true }),
        ],
        hints: [md`With $v_s$ off, node 1 is a divider: $v_1 = v_tR_1/(R_1 + R_F)$.`, md`$i_t = v_t/R_2 + g_mv_1 + (v_t - v_1)/R_F$.`],
        sol: md`
1. $v_1 = v_t\,\dfrac{R_1}{R_1 + R_F} = v_t/5$.
2. $i_t = \dfrac{v_t}{R_2} + g_m\dfrac{v_t}{5} + \dfrac{v_t}{R_1 + R_F} = v_t\,(0.2 + 0.8 + 0.2)\,\text{mS} = 1.2\,\text{mS}\times v_t$.
3. $R_{out} = 1/(1.2\,\text{mS}) = 833.3\,\Omega$. In symbols: $R_{out} = R_2\parallel\dfrac{R_1 + R_F}{1 + g_mR_1}$, here $5\kO\parallel(5\kO/5) = 5\kO\parallel1\kO = 833\,\Omega$.`,
      }),
      P({
        id: 'bk01-test-neg', title: 'A negative resistance',
        q: md`The source of Example 1 is turned around: it pushes $g_mv_x$ *into* node $A$ (from ground), still controlled by $A$'s own voltage, with $g_m = 2\,\text{mS}$. (a) What resistance does it present? (b) A $400\,\Omega$ resistor is added from $A$ to ground. What is the resistance now?`,
        fig: ownFig(true),
        parts: [
          { lbl: '(a)\\ R', unit: 'Ω', ans: -500, traps: [{ v: 500, msg: 'The source now *delivers* current into $A$ as $A$ rises: KCL gives $i_t = -g_mv_t$.' }] },
          { lbl: '(b)\\ R', unit: 'kΩ', ans: 2, traps: [{ v: 0.2222, msg: 'Add the conductances with their signs: $2.5\\,\\text{mS} - 2\\,\\text{mS}$.' }] },
        ],
        hints: [md`KCL at $A$: the test current plus the source's current into $A$ add up to the current leaving through the other branches.`, md`Conductances add, including negative ones.`],
        sol: md`
**(a)** The source pushes $g_mv_t$ into $A$, so the test source has to *absorb* it: $i_t = -g_mv_t$ and $R = -1/g_m = -500\,\Omega$.

**(b)** $i_t = v_t/400 - g_mv_t = (2.5 - 2)\,\text{mS}\times v_t = 0.5\,\text{mS}\times v_t$, so $R = 2\kO$. The negative conductance cancelled most of the resistor's conductance, so the node looks *bigger* than the resistor alone.`,
      }),
      P({
        id: 'bk01-test-thev', title: 'Exam style: Thévenin with a dependent source',
        q: md`Same circuit and values as the previous problem ($R_1 = 1\kO$, $R_F = 4\kO$, $g_m = 4\,\text{mS}$, $R_2 = 5\kO$). (a) Find the open-circuit gain $v_{th}/v_s$. (b) Find the Norton current per volt of input, $i_N/v_s = v_{th}/(v_sR_{th})$, in mS. (c) A $1\kO$ load is connected at the output: find $v_{out}/v_s$.`,
        fig: fbFig(),
        parts: [
          { lbl: '(a)\\ v_{th}/v_s', unit: 'V/V', ans: -2.5, traps: [{ v: -20, msg: 'That is $-g_mR_2$, which ignores the feedback through $R_F$.' }] },
          { lbl: '(b)\\ i_N/v_s', unit: 'mS', ans: -3 },
          { lbl: '(c)\\ v_{out}/v_s', unit: 'V/V', ans: -1.364, traps: [{ v: -2.5, msg: 'The load draws current: divide $v_{th}$ between $R_{th}$ and the load.' }] },
        ],
        hints: [md`Node 2: $\frac{v_2 - v_1}{R_F} + g_mv_1 + \frac{v_2}{R_2} = 0$. Node 1: $\frac{v_1 - v_s}{R_1} + \frac{v_1 - v_2}{R_F} = 0$.`, md`$R_{th} = 833.3\,\Omega$ from the previous problem.`],
        sol: md`
**(a)** Conductances in mS: $1/R_1 = 1$, $1/R_F = 0.25$, $1/R_2 = 0.2$, $g_m = 4$.

Node 2: $0.25(v_2 - v_1) + 4v_1 + 0.2v_2 = 0\Rightarrow0.45\,v_2 = -3.75\,v_1\Rightarrow v_2 = -8.333\,v_1$.

Node 1: $(v_1 - v_s) + 0.25(v_1 - v_2) = 0\Rightarrow1.25\,v_1 = v_s + 0.25\,v_2 = v_s - 2.083\,v_1\Rightarrow v_1 = 0.3\,v_s$.

So $v_{th} = -8.333\times0.3\,v_s = -2.5\,v_s$.

**(b)** $i_N/v_s = -2.5/833.3\,\Omega = -3\,\text{mS}$. (Check by shorting the output: $v_1 = v_s\times\frac{1}{1 + 0.25} = 0.8\,v_s$, and the short carries $(0.25 - 4)\,\text{mS}\times0.8\,v_s = -3\,\text{mS}\times v_s$. ✓)

**(c)** $v_{out} = -2.5\,v_s\times\dfrac{1000}{1000 + 833.3} = -1.364\,v_s$.`,
      }),
      G('bk_c1_test_div', { need: 3 }),
      G('bk_c1_test_fb', { need: 3 }),
    ],
  });

  // ================================================================== 6. sizes
  const serParFig = () => row([
    { fig: [['term', [0, -0.3]], ['w', [0, -0.3], [0, 0]], ['R', [0, 0], [0, 1.2], { n: 'R_1' }], ['R', [0, 1.2], [0, 2.4], { n: 'R_2' }], ['w', [0, 2.4], [0, 2.7]], ['term', [0, 2.7]],
      ['iarr', [0, -0.15], 'd', { n: 'i', side: 'l', off: [-12, 0] }]], cap: 'Series: one current, the bigger $R$ takes most of the voltage' },
    { fig: [['term', [0, -0.3]], ['w', [0, -0.3], [0, 0.2]], ['w', [-0.7, 0.2], [0.7, 0.2]], ['R', [-0.7, 0.2], [-0.7, 1.6], { n: 'R_1', side: 'l' }], ['R', [0.7, 0.2], [0.7, 1.6], { n: 'R_2' }],
      ['w', [-0.7, 1.6], [0.7, 1.6]], ['w', [0, 1.6], [0, 2.1]], ['term', [0, 2.1]]], cap: 'Parallel: one voltage, the smaller $R$ takes most of the current' },
  ]);
  const ladderFig = () => {
    const W = 600, x0 = 170, x1 = 575, X = (lg) => x0 + (lg - 2) / 5 * (x1 - x0);
    const rows = [['1/g_m', 2, 3.2], ['R_D,\\ R_S,\\ R_L', 3, 4.4], ['r_{ds}', 4, 6], ['g_mr_{ds}R_S', 5.5, 7]];
    let s = `<svg class="schem" viewBox="0 0 ${W} 215" width="${W}" role="img" aria-label="typical sizes on a log scale">`;
    rows.forEach(([n, a, b], i) => { const y = 14 + i * 36; s += `<rect class="plane" x="${X(a).toFixed(1)}" y="${y}" width="${(X(b) - X(a)).toFixed(1)}" height="22" rx="5"/>` + lab(x0 - 12, y + 11, n, 'r', ''); });
    const ya = 14 + rows.length * 36 + 8;
    s += `<path d="M${x0},${ya}H${x1}"/>`;
    ['100\\,\\Omega', '1\\,\\text{k}\\Omega', '10\\,\\text{k}\\Omega', '100\\,\\text{k}\\Omega', '1\\,\\text{M}\\Omega', '10\\,\\text{M}\\Omega'].forEach((t, k) => { s += `<path d="M${X(2 + k).toFixed(1)},${ya - 5}V${ya + 5}"/>` + lab(X(2 + k), ya + 9, t, 't', 'small'); });
    return s + '</svg>';
  };

  L({
    id: 'bk01-sizes', title: 'A feel for sizes: series, parallel, and who wins',
    steps: [
      R(md`
        ### The question

        Small-signal answers are combinations of resistances: $R_D\parallel r_{ds}$, $\tfrac{1}{g_m}\parallel r_{ds}$, $R_S + \tfrac{1}{g_m}$, $r_{ds} + R_S + g_mr_{ds}R_S$. To check an answer, and often to get one quickly, you must see **which term wins** and how much you lose by dropping the others. This section turns that into two rules and one table.

        On the exam this decides whether "$\approx$" is allowed and catches answers that are off by a factor of ten.
      `),
      RF(md`
        ### The physical picture

        **Series:** the two resistors carry the same current, so each one's voltage is proportional to its resistance. The bigger one takes most of the voltage, and the total is close to the bigger one. **In series, the big one wins.**

        **Parallel:** the two resistors see the same voltage, so each one's current is proportional to its *conductance*. The current takes the easy path: the smaller resistor carries most of it, and the total is close to the smaller one. **In parallel, the small one wins.**

        [[fig:sp]]

        The Art of Electronics puts it as a habit: a $1\kO$ resistor in parallel with $1\,\text{M}\Omega$ is $1\kO$, period; a $1\kO$ resistor in series with $1\,\text{M}\Omega$ is $1\,\text{M}\Omega$. The interesting cases are the ones where the two are within a factor of ten of each other.
      `, { sp: { svg: serParFig(), cap: 'Same two resistors, two ways.' } }),
      R(md`
        ### The derivation: how much does the loser contribute?

        **Parallel.** Let the larger resistor be $n$ times the smaller: $R_2 = nR_1$ with $n\ge1$. Product over sum:
        $$R_1\parallel nR_1 = \frac{R_1\cdot nR_1}{R_1 + nR_1} = R_1\,\frac{n}{n + 1}$$
        So the parallel pair is the smaller resistor times $n/(n + 1)$:

        | $n = R_2/R_1$ | 1 | 2 | 3 | 4 | 9 | 10 | 99 |
        |---|---|---|---|---|---|---|---|
        | $R_1\parallel R_2$ in units of $R_1$ | 0.5 | 0.667 | 0.75 | 0.8 | 0.9 | 0.909 | 0.99 |

        Writing $R_1$ instead of the exact $R_1n/(n + 1)$ overestimates by the factor $(n + 1)/n = 1 + 1/n$: **an error of $1/n$.**

        **Series.**
        $$R_1 + nR_1 = nR_1\,\Big(1 + \frac1n\Big)$$
        Writing only the bigger one, $nR_1$, underestimates by about $1/n$ as well.

        !!key Who wins, and what it costs
          In parallel the smaller resistor wins; in series the larger one wins. Dropping the loser costs about $1/n$, where $n$ is the ratio of the two: $10\%$ at $n = 10$, $1\%$ at $n = 100$. Two equal resistors in parallel give half of one; $N$ equal ones give $1/N$ of one.

        **Three or more in parallel:** add conductances. $10\kO\parallel10\kO\parallel5\kO$: $0.1 + 0.1 + 0.2 = 0.4\,\text{mS}$, so $2.5\kO$.
      `),
      RF(md`
        ### The size ladder

        In MOSFET circuits the pieces come in very different sizes, and they almost always line up the same way:

        [[fig:lad]]

        | Quantity | Typical size | Example |
        |---|---|---|
        | $1/g_m$ | $100\,\Omega$ to $1\kO$ | $g_m = 2\,\text{mS}\Rightarrow500\,\Omega$ |
        | $R_D$, $R_S$, $R_L$ | $1$ to $20\kO$ | chosen by the designer |
        | $r_{ds}$ | $10\kO$ to $1\,\text{M}\Omega$ | $\lambda = 0.02\,\text{V}^{-1}$, $I_D = 0.1\,\text{mA}\Rightarrow500\kO$ |
        | $g_mr_{ds}R_S$ | $\text{M}\Omega$ and up | $(2\,\text{mS})(50\kO)(1\kO) = 100\kO$ |

        So: $1/g_m\parallel r_{ds}\approx1/g_m$; $R_D\parallel r_{ds}\approx R_D$ (but only to about $10\%$ if $r_{ds} = 10R_D$); $R_S + 1/g_m$ needs both terms. Chapter 3 uses this ladder constantly.
      `, { lad: { svg: ladderFig(), cap: 'Typical sizes on a logarithmic scale. Each step of the ladder is roughly ten to a hundred times the one before.' } }),
      R(md`
        ### Worked examples

        1. **$1/g_m\parallel r_{ds}$** with $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$: $n = 50{,}000/500 = 100$, so $500\,\Omega\times0.99 = 495\,\Omega$. Writing $500\,\Omega$ is off by $1\%$.
        2. **$R_D\parallel r_{ds}$** with $R_D = 10\kO$, $r_{ds} = 100\kO$: $n = 10$, so $10\kO\times0.909 = 9.09\kO$. Dropping $r_{ds}$ costs $10\%$: fine for a sanity check, not for a numeric answer.
        3. **$R_S + 1/g_m$** with $R_S = 1\kO$ and $1/g_m = 100\,\Omega$: $1.1\kO$. Dropping $1/g_m$ costs $10\%$.
        4. **$2\kO\parallel3\kO$:** $n = 1.5$, nobody wins: $2\kO\times\tfrac{1.5}{2.5} = 1.2\kO$.
        5. **A gain.** $A_v = -g_m(R_D\parallel r_{ds}\parallel R_L)$ with $g_m = 4\,\text{mS}$, $R_D = R_L = 10\kO$, $r_{ds} = 200\kO$. First $R_D\parallel R_L = 5\kO$ (equal resistors: half). Then $5\kO\parallel200\kO$: $n = 40$, so $5\kO\times\tfrac{40}{41} = 4.878\kO$. $A_v = -(4\,\text{mS})(4.878\kO) = -19.5$. The quick estimate $-20$ is off by $2.5\%$, which is $1/40$, as the rule says.

        ### Check it, and what it means

        Limits: $n\to\infty$ gives $n/(n + 1)\to1$ (the small one wins completely); $n = 1$ gives $\tfrac12$ (a tie). The rules are not new physics; they are how an experienced designer reads $R_1\parallel R_2$ without a calculator, and how you will read every formula in Chapters 3 to 5.

        ### How to recognize it

        Whenever an answer contains $\parallel$ or $+$ of resistances, compute the ratio first. Above about $10$, you may drop the loser for an estimate; for a numeric exam answer keep everything, but use the estimate to check your arithmetic.
      `),
      R(md`
        !!mistake Common mistakes
          **Adding resistors that are in parallel** (or using product-over-sum on series ones). Ask first: same current (series) or same voltage (parallel)?

          **"Averaging".** $1\kO\parallel1\,\text{M}\Omega$ is not about $500\kO$. It is $999\,\Omega$.

          **Dropping a term that is only two or three times bigger.** $2\kO\parallel6\kO$ is $1.5\kO$, not $2\kO$: a $33\%$ error.

          **Dropping the wrong one.** In parallel you keep the *smaller*; in series the *larger*.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`$1\kO\parallel1\,\text{M}\Omega$ is closest to...`,
        [md`$999\,\Omega$`, md`$500\kO$`, md`$1\,\text{M}\Omega$`, md`$1.001\,\text{M}\Omega$`], 0,
        [null, md`Parallel resistors do not average: the current takes the easy path through the $1\kO$.`, md`In parallel the *smaller* resistor wins.`, md`That is the series sum.`],
        md`$n = 1000$: $1\kO\times\tfrac{1000}{1001} = 999\,\Omega$.`),
      Q(md`$100\,\Omega$ in series with $100\kO$ is closest to...`,
        [md`$100.1\kO$`, md`$99.9\,\Omega$`, md`$100\,\Omega$`, md`$50\kO$`], 0,
        [null, md`That is the parallel combination.`, md`In series the *larger* resistor wins.`, md`Series resistances add; nothing is averaged.`],
        md`Series: $100\kO + 0.1\kO = 100.1\kO$; dropping the $100\,\Omega$ costs $0.1\%$.`),
      Q(md`Which approximation is within $5\%$?`,
        [md`$2\kO\parallel60\kO\approx2\kO$`, md`$2\kO\parallel6\kO\approx2\kO$`, md`$2\kO + 6\kO\approx6\kO$`, md`$500\,\Omega\parallel1.5\kO\approx500\,\Omega$`], 0,
        [null, md`$n = 3$: the exact value is $1.5\kO$, so $2\kO$ is $33\%$ high.`, md`$n = 3$ in series: the exact value is $8\kO$, so $6\kO$ is $25\%$ low.`, md`$n = 3$ again: exact $375\,\Omega$, a $33\%$ error.`],
        md`Only the first has a large ratio, $n = 30$: the error is about $1/30 = 3.3\%$ (exact value $1.935\kO$).`),
      P({
        id: 'bk01-size-par', title: '1/g_m beside r_ds',
        q: md`$g_m = 2.5\,\text{mS}$ and $r_{ds} = 40\kO$. Find $\tfrac{1}{g_m}\parallel r_{ds}$ exactly, and the error of the approximation $\tfrac1{g_m}$ in percent.`,
        parts: [
          { lbl: '\\tfrac{1}{g_m}\\parallel r_{ds}', unit: 'Ω', ans: 396.0, traps: [{ v: 40400, msg: 'They are in parallel, not in series.' }] },
          { lbl: '\\text{error}', unit: '\\%', ans: 1 },
        ],
        hints: [md`$1/g_m = 400\,\Omega$, so $n = 40{,}000/400 = 100$.`],
        sol: md`
1. $1/g_m = 400\,\Omega$; $n = 100$; exact: $400\times\tfrac{100}{101} = 396.0\,\Omega$.
2. Error of $400\,\Omega$: $(400 - 396.0)/396.0 = 1/n = 1\%$.`,
      }),
      P({
        id: 'bk01-size-three', title: 'Three in parallel',
        q: md`Find (a) $10\kO\parallel10\kO\parallel5\kO$ and (b) $6\kO\parallel3\kO\parallel2\kO$.`,
        parts: [
          { lbl: '(a)', unit: 'kΩ', ans: 2.5, traps: [{ v: 25, msg: 'Parallel resistances do not add; their conductances do.' }] },
          { lbl: '(b)', unit: 'kΩ', ans: 1, traps: [{ v: 11, msg: 'Parallel resistances do not add; their conductances do.' }] },
        ],
        hints: [md`Add conductances: in mS, a $k\kO$ resistor is $1/k$.`],
        sol: md`
**(a)** $0.1 + 0.1 + 0.2 = 0.4\,\text{mS}$, so $2.5\kO$.

**(b)** $\tfrac16 + \tfrac13 + \tfrac12 = \tfrac16 + \tfrac26 + \tfrac36 = 1\,\text{mS}$, so $1\kO$. Notice the answer is below the smallest resistor, as a parallel combination always is.`,
      }),
      P({
        id: 'bk01-size-gain', title: 'Estimate, then compute',
        q: md`A gain $A_v = -g_m(R_D\parallel r_{ds}\parallel R_L)$ with $g_m = 4\,\text{mS}$, $R_D = R_L = 10\kO$, $r_{ds} = 200\kO$. Give the quick estimate (drop $r_{ds}$), the exact value, and the error of the estimate in percent.`,
        parts: [
          { lbl: '\\text{estimate}', unit: 'V/V', ans: -20 },
          { lbl: '\\text{exact}', unit: 'V/V', ans: -19.51, traps: [{ v: -40, msg: 'You dropped $R_L$ as well. $R_D\\parallel R_L = 5\\,\\text{k}\\Omega$.' }] },
          { lbl: '\\text{error}', unit: '\\%', ans: 2.5 },
        ],
        hints: [md`$R_D\parallel R_L = 5\kO$; then $n = 200/5 = 40$.`],
        sol: md`
1. Estimate: $R_D\parallel R_L = 5\kO$, $A_v\approx-(4\,\text{mS})(5\kO) = -20$.
2. Exact: $5\kO\parallel200\kO = 5\times\tfrac{40}{41} = 4.878\kO$, $A_v = -19.51$.
3. Error: $(20 - 19.51)/19.51 = 1/40 = 2.5\%$.`,
      }),
      P({
        id: 'bk01-size-n', title: 'How lopsided is lopsided enough?',
        q: md`Measuring the error relative to the exact value, how large must the ratio $n$ be for (a) $R\parallel nR\approx R$ to be within $2\%$, and (b) $R + nR\approx nR$ to be within $2\%$?`,
        parts: [
          { lbl: '(a)\\ n', unit: '', ans: 50 },
          { lbl: '(b)\\ n', unit: '', ans: 49, accept: [50] },
        ],
        hints: [md`(a) The exact value is $Rn/(n + 1)$; the approximation is $R$; their ratio is $1 + 1/n$.`, md`(b) The exact value is $R(n + 1)$; the approximation is $nR$; the relative error is $1/(n + 1)$.`],
        sol: md`
**(a)** $\dfrac{R - Rn/(n + 1)}{Rn/(n + 1)} = \dfrac{1}{n}\le0.02\Rightarrow n\ge50$.

**(b)** $\dfrac{R(n + 1) - nR}{R(n + 1)} = \dfrac{1}{n + 1}\le0.02\Rightarrow n\ge49$. (Either way: a ratio of about $50$ for $2\%$.)`,
      }),
      P({
        id: 'bk01-size-ladder', title: 'Exam style: which terms can go?',
        q: md`Chapter 3 derives the resistance looking into a drain with a source resistor: $R = r_{ds} + R_S + g_mr_{ds}R_S$. Take $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 1\kO$. (a) Evaluate the three terms and the total. (b) What is the error (relative to the total) of keeping only the largest term? (c) Of keeping the two largest? (d) Which term can safely be dropped?`,
        parts: [
          { lbl: '(a)\\ R', unit: 'kΩ', ans: 151 },
          { lbl: '(b)\\ \\text{error}', unit: '\\%', ans: 33.8 },
          { lbl: '(c)\\ \\text{error}', unit: '\\%', ans: 0.662, accept: [0.66] },
          { lbl: '(d)', mc: ['$R_S$', '$r_{ds}$', '$g_mr_{ds}R_S$'], a: 0, why: [null, '$r_{ds} = 50\\,\\text{k}\\Omega$ is a third of the total: dropping it costs $33\\%$.', 'It is the largest term.'] },
        ],
        hints: [md`$g_mr_{ds}R_S = (2\,\text{mS})(50\kO)(1\kO) = 100\kO$.`],
        sol: md`
**(a)** $r_{ds} = 50\kO$, $R_S = 1\kO$, $g_mr_{ds}R_S = (2\times10^{-3})(5\times10^4)(10^3) = 100\kO$. Total $151\kO$.

**(b)** Keeping only $100\kO$: $(151 - 100)/151 = 33.8\%$. Too much: $g_mR_S = 2$ is not large, so $r_{ds}$ still matters.

**(c)** Keeping $100 + 50 = 150\kO$: $1/151 = 0.66\%$.

**(d)** $R_S$, the smallest by a factor of $50$. The common shortcut $R\approx g_mr_{ds}R_S$ needs $g_mR_S\gg1$; here it is only $2$.`,
      }),
      G('bk_c1_sizes', { need: 4 }),
    ],
  });

  // ================================================================== Chapter 1 problems
  const attFigR = (o = {}) => [
    ['rail', [2, -1.6], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }], ['R', [2, -1.6], [2, -0.2], { n: 'R_1', s: o.r1, side: 'r' }], ['w', [2, -0.2], [2, 0]],
    ['node', [2, 0], { n: 'X', side: 'al' }], ['w', [2, 0], [2, 0.2]], ['D', [2, 0.2], [2, 1.4]], ['gnd', [2, 1.4]],
    ['Vac', [-1.4, 0.4], [-1.4, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.4, 1.4]], ['w', [-1.4, 0.4], [-1.4, 0]],
    ['R', [-1.4, 0], [-0.2, 0], { n: 'R_S', s: o.rs }], ['w', [-0.2, 0], [0.4, 0]], ['C', [0.4, 0], [1.2, 0], { n: 'C_1' }], ['w', [1.2, 0], [2, 0], [2.8, 0]],
    ['C', [2.8, 0], [3.6, 0], { n: 'C_2' }], ['w', [3.6, 0], [4.4, 0], [5, 0]],
    ['R', [4.4, 0], [4.4, 1.4], { n: 'R_L', s: o.rl }], ['gnd', [4.4, 1.4]], ['term', [5, 0], { n: 'v_{out}' }],
  ];
  const mosAmpFig = () => [
    ['rail', [2, -1.4], { n: 'V_{DD}' }], ['R', [2, -1.4], [2, 0], { n: 'R_D' }], ['w', [2, 0], [2.8, 0]], ['C', [2.8, 0], [3.6, 0], { n: 'C_2' }],
    ['w', [3.6, 0], [4.4, 0], [5, 0]], ['R', [4.4, 0], [4.4, 1.4], { n: 'R_L' }], ['gnd', [4.4, 1.4]], ['term', [5, 0], { n: 'v_{out}' }],
    ['nmos', [2, 1]], ['R', [2, 2], [2, 3.4], { n: 'R_S', side: 'l' }], ['w', [2, 2], [2.9, 2]], ['C', [2.9, 2], [2.9, 3.4], { n: 'C_S' }], ['w', [2, 3.4], [2.9, 3.4]], ['gnd', [2, 3.4]],
    ['w', [1, 1], [0.4, 1]], ['R', [0.4, 1], [0.4, 2.4], { n: 'R_G', side: 'l' }], ['V', [0.4, 2.4], [0.4, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [0.4, 3.4]],
    ['C', [-0.4, 1], [0.4, 1], { n: 'C_1' }], ['w', [-0.4, 1], [-1.2, 1], [-1.2, 1.4]], ['Vac', [-1.2, 1.4], [-1.2, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.2, 2.4]],
  ];
  const negFig = () => [
    ...testSrc(1.6, 0), ['node', [1.6, 0], { n: 'A', side: 'a', dot: true }],
    ['G', [1.6, 0], [1.6, 1.4], { n: 'g_mv_x', side: 'r' }], ['gnd', [1.6, 1.4]],
    ['vlab', [1.2, 1.2], [1.2, 0.2], { n: 'v_x', side: 'l' }],
    ['w', [1.6, 0], [3, 0]], ['R', [3, 0], [3, 1.4], { n: '100\\,\\Omega' }], ['gnd', [3, 1.4]],
  ];
  const nortonFig = () => [
    ['Vac', [0, 0], [0, 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.4]], ['w', [0, 0], [0.8, 0]], ['term', [0.8, 0]], ['vlab', [1.05, 0.2], [1.05, 1.2], { n: 'v_{in}' }],
    ['G', [2.4, 0], [2.4, 1.4], { n: 'g_mv_{in}', side: 'r' }], ['gnd', [2.4, 1.4]], ['w', [2.4, 0], [5.2, 0], [5.8, 0]],
    ['R', [4, 0], [4, 1.4], { n: 'R_o' }], ['gnd', [4, 1.4]], ['R', [5.2, 0], [5.2, 1.4], { n: 'R_L' }], ['gnd', [5.2, 1.4]], ['term', [5.8, 0], { n: 'v_{out}' }],
  ];
  const degFig = () => [
    ['w', [2, 0], [3.6, 0]], ['node', [2.8, 0], { n: 'D', side: 'a' }],
    ['G', [2, 0], [2, 1.6], { n: 'g_mv_c', side: 'r' }], ['R', [3.6, 0], [3.6, 1.6], { n: 'R_o' }], ['w', [2, 1.6], [3.6, 1.6]],
    ['node', [2.8, 1.6], { n: 'S', side: 'b' }], ['R', [3.6, 1.6], [3.6, 3], { n: 'R_S' }], ['gnd', [3.6, 3]],
    ['term', [0.7, 0.4], { n: 'C', side: 'a' }], ['w', [0.7, 0.4], [0.2, 0.4], [0.2, 0.7]], ['gnd', [0.2, 0.7]],
    ['term', [0.7, 1.4]], ['w', [0.7, 1.4], [0.7, 1.6], [2, 1.6]], ['vlab', [0.95, 0.55], [0.95, 1.25], { n: 'v_c' }],
    ['w', [3.6, 0], [4.8, 0]], ['V', [4.8, 0], [4.8, 1.4], { n: 'v_t', side: 'r' }], ['gnd', [4.8, 1.4]], ['iarr', [4.2, 0], 'l', { n: 'i_t' }],
  ];
  const stackTop = () => [
    ['rail', [2, -2.4], { n: 'V_{DD}' }], ['I', [2, -2.4], [2, -1.2], { n: 'I_B', side: 'r' }], ['w', [2, -1.2], [2, -1]], ['node', [2, -1], { n: 'X', side: 'ar' }],
    ['D', [2, -1], [2, 0], { n: 'D_1', side: 'r' }], ['node', [2, 0], { n: 'Y', side: 'l' }], ['w', [2, 0], [2.8, 0]], ['term', [2.8, 0], { n: 'v_y' }], ['D', [2, 0], [2, 1.2], { n: 'D_2', side: 'r' }], ['gnd', [2, 1.2]],
    ['Vac', [-1.4, -0.6], [-1.4, 0.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.4, 0.4]], ['w', [-1.4, -0.6], [-1.4, -1]],
    ['R', [-1.4, -1], [-0.2, -1], { n: 'R_S' }], ['w', [-0.2, -1], [0.6, -1]], ['C', [0.6, -1], [1.4, -1]], ['w', [1.4, -1], [2, -1]],
  ];

  L({
    id: 'bk01-problems', title: 'Chapter 1 problems', kind: 'review',
    steps: [
      RF(md`
        ### Chapter 1 summary

        **1. Gain is the slope at the operating point** ([1.1](#/l/bk01-bias)). Write every quantity as bias + signal; for a small signal the curve is its tangent, so $v_{out} = (dV_{OUT}/dV_{IN})|_Q\,v_{in}$. Without a bias (or with $Q$ on a flat part) the slope, and the gain, is zero.

        [[fig:tc]]

        **2. How small is small** ([1.2](#/l/bk01-tangent)). Square law: the error of the straight line is $v_{gs}/(2V_{ov})$. Exponential: $v_d/(2V_T)$, with $2V_T = 50\,\text{mV}$. Reason: the ratio of the Taylor series' second term to its first. The tangent of a square law hits the axis at $V_{GS} - \tfrac12V_{ov}$ (slope $2I_D/V_{ov}$); of an exponential, $V_T$ to the left of $Q$ (slope $I_D/V_T$).

        [[fig:sq]]

        **3. The diode's small-signal resistance** ([1.3](#/l/bk01-diode)) is $r_d = V_T/I_D$: $25\,\Omega$ at $1\,\text{mA}$. Reason: the slope of $I_Se^{V/V_T}$ is $I/V_T$. It is the slope, not the chord $V_D/I_D$.

        [[fig:div]]

        **4. Two pictures** ([1.4](#/l/bk01-two)). DC picture: signals off, capacitors open, devices nonlinear. Small-signal picture: DC voltage sources shorted (rails are ground), DC current sources open, large capacitors shorted, devices replaced by their slopes. Reason: subtract each element's DC law from its total law.

        [[fig:ss]]

        **5. Dependent sources and the test source** ([1.5](#/l/bk01-test)). Turn off independent sources only, apply $v_t$, write the controlling voltages in terms of $v_t$, KCL, $R = v_t/i_t$. A VCCS controlled by its own voltage is a resistor $1/g_m$; one that sees only $Kv_t$ looks like $1/(g_mK)$.

        [[fig:own]]

        **6. Sizes** ([1.6](#/l/bk01-sizes)). In parallel the smaller resistor wins, in series the larger; dropping the loser costs about $1/n$. The ladder: $1/g_m\ll R_D, R_S\ll r_{ds}\ll g_mr_{ds}R_S$.

        [[fig:lad]]
      `, { tc: { svg: transferPlot(), cap: 'Gain = slope at $Q$.' }, sq: { svg: sqPlot(), cap: 'The tangent of a square law.' }, div: { svg: divPics(), cap: 'A diode divider: DC picture, then small-signal picture with $r_d$.' },
        ss: { fig: attSS('r_d'), cap: 'A small-signal picture: current source gone, capacitors shorted, diode $\\to r_d$.' },
        own: { svg: row([{ fig: ownFig() }, { fig: ownEq() }]), cap: 'A VCCS controlled by its own voltage is $1/g_m$.' }, lad: { svg: ladderFig(), cap: 'The size ladder.' } }),
      R(md`
        ### Problems

        The first twelve practice one idea each; the last four are exam-style, several ideas at once. Use $V_T = 25\,\text{mV}$, $0.7\,\text{V}$ per diode for DC, and $V_{TN} = 1\,\text{V}$.
      `),
      P({
        id: 'bk01-pr-slope', title: 'Gain from a table',
        q: md`A circuit's transfer curve is $V_{OUT} = 10 - 2(V_{IN} - 1)^2$ volts. A lab measures $V_{OUT} = 8.0792\,\text{V}$ at $V_{IN} = 1.98\,\text{V}$ and $7.9192\,\text{V}$ at $2.02\,\text{V}$. Find $V_{OUT}$ at $Q$ ($V_{IN} = 2\,\text{V}$) and the small-signal gain there, from the measurements.`,
        parts: [{ lbl: 'V_{OUT}', unit: 'V', ans: 8 }, { lbl: 'A_v', unit: 'V/V', ans: -4, traps: [{ v: 4, msg: 'The output fell as the input rose: negative gain.' }] }],
        hints: [md`Slope $=\Delta V_{OUT}/\Delta V_{IN}$ across the two points.`],
        sol: md`$V_{OUT}(2) = 10 - 2 = 8\,\text{V}$. Slope: $(7.9192 - 8.0792)/0.04 = -0.16/0.04 = -4$. Calculus agrees: $dV_{OUT}/dV_{IN} = -4(V_{IN} - 1) = -4$.`,
      }),
      P({
        id: 'bk01-pr-bias2', title: 'Operating point and gain',
        q: md`The common-source circuit of Section 1.1 with $V_{DD} = 3\,\text{V}$, $R_D = 5\kO$, $k = 2\,\text{mA/V}^2$ ($I_D = \tfrac12k(V_{IN} - V_{TN})^2$), biased at $V_{IN} = 1.25\,\text{V}$. Find $I_D$, $V_{OUT}$ and $A_v$.`,
        fig: ampFig({ vdd: '3\\,\\text{V}', rd: '5\\,\\text{k}\\Omega', vin: '1.25\\,\\text{V}' }),
        parts: [{ lbl: 'I_D', unit: 'µA', ans: 62.5 }, { lbl: 'V_{OUT}', unit: 'V', ans: 2.6875 }, { lbl: 'A_v', unit: 'V/V', ans: -2.5, traps: [{ v: -1.25, msg: 'The $\\tfrac12$ cancels when you differentiate: $A_v = -kR_D(V_{IN} - V_{TN})$.' }] }],
        hints: [md`$V_{IN} - V_{TN} = 0.25\,\text{V}$.`],
        sol: md`$I_D = \tfrac12(2\,\text{mA/V}^2)(0.25)^2 = 62.5\,\mu\text{A}$. $V_{OUT} = 3 - (62.5\,\mu\text{A})(5\kO) = 3 - 0.3125 = 2.6875\,\text{V}$ (saturated: above $0.25\,\text{V}$). $A_v = -(2\,\text{mA/V}^2)(5\kO)(0.25\,\text{V}) = -2.5$.`,
      }),
      P({
        id: 'bk01-pr-small', title: 'Same signal, two devices',
        q: md`A $12\,\text{mV}$ signal is applied (a) to a MOSFET biased at $V_{OV} = 0.15\,\text{V}$, (b) to a diode. Estimate the straight-line error in each case, in percent.`,
        parts: [{ lbl: '(a)', unit: '\\%', ans: 4, traps: [{ v: 8, msg: 'Divide by $2V_{ov} = 0.3\\,\\text{V}$.' }] }, { lbl: '(b)', unit: '\\%', ans: 24, traps: [{ v: 48, msg: 'Divide by $2V_T = 50\\,\\text{mV}$.' }] }],
        hints: [md`$v/(2V_{ov})$ and $v/(2V_T)$.`],
        sol: md`(a) $0.012/0.3 = 4\%$. (b) $12/50 = 24\%$: for the diode, $12\,\text{mV}$ is not small.`,
      }),
      P({
        id: 'bk01-pr-rd3', title: 'Three diodes',
        q: md`Three diodes in series carry $0.5\,\text{mA}$. What small-signal resistance does the string present?`,
        parts: [{ lbl: 'r', unit: 'Ω', ans: 150, traps: [{ v: 50, msg: 'That is one diode. In series the three $r_d$ add.' }, { v: 4200, msg: 'That is the chord $2.1\\,\\text{V}/0.5\\,\\text{mA}$.' }] }],
        hints: [md`Each diode: $r_d = 25\,\text{mV}/0.5\,\text{mA}$.`],
        sol: md`Each: $r_d = 50\,\Omega$; three in series: $150\,\Omega$.`,
      }),
      P({
        id: 'bk01-pr-dbias', title: 'A big signal through a big resistor',
        q: md`A $10\,\text{V}$ supply feeds a diode through $R = 9.3\kO$; a $1\,\text{V}$-peak signal rides on the supply. Find $I_D$, $r_d$, and the signal across the diode.`,
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 1 }, { lbl: 'r_d', unit: 'Ω', ans: 25 }, { lbl: '|v_d|', unit: 'mV', ans: 2.681 }],
        hints: [md`The signal current is $1\,\text{V}/9.3\kO\approx0.1\,\text{mA}$: is that small compared with $1\,\text{mA}$?`],
        sol: md`$I_D = 9.3\,\text{V}/9.3\kO = 1\,\text{mA}$, $r_d = 25\,\Omega$, $|v_d| = 1\,\text{V}\times25/9325 = 2.68\,\text{mV}$. A full volt of signal is fine here: the current only changes by $\pm11\%$, because the big resistor turns the voltage into a modest current.`,
      }),
      P({
        id: 'bk01-pr-cap', title: 'Resistor bias with coupling capacitors',
        q: md`The resistor-biased attenuator: $V_{DD} = 12\,\text{V}$, $R_1 = 11.3\kO$, $R_S = 600\,\Omega$, $R_L = 600\,\Omega$, large $C_1$, $C_2$. Find $I_D$, the resistance from $X$ to ground in the small-signal picture, and $v_{out}/v_s$.`,
        fig: attFigR({ vdd: '12\\,\\text{V}', r1: '11.3\\,\\text{k}\\Omega', rs: '600\\,\\Omega', rl: '600\\,\\Omega' }),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 1 }, { lbl: 'R_X', unit: 'Ω', ans: 23.95 }, { lbl: 'v_{out}/v_s', unit: '', ans: 0.03838 }],
        hints: [md`DC: the capacitors are open, so $R_1$'s current all flows in the diode.`, md`Small signal: $R_1$, $r_d$ and $R_L$ all go from $X$ to ground.`],
        sol: md`$I_D = (12 - 0.7)/11.3\kO = 1\,\text{mA}$, $r_d = 25\,\Omega$. $R_X = 11.3\kO\parallel25\parallel600 = 23.95\,\Omega$ (almost $r_d$: the diode wins). $v_{out}/v_s = 23.95/(600 + 23.95) = 0.0384$.`,
      }),
      P({
        id: 'bk01-pr-what', title: 'A MOSFET amplifier, pictured for signals',
        q: md`For the amplifier below (all capacitors large), say what each element becomes in the small-signal picture.`,
        fig: mosAmpFig(),
        parts: [
          { lbl: '1. The bottom of $R_G$ (the battery $V_B$)', mc: ['Ground', 'A short across $R_G$', 'An open'], a: 0, why: [null, 'The battery is a short to ground, which grounds the bottom of $R_G$; $R_G$ itself stays.', 'A DC voltage source is a short, not an open.'] },
          { lbl: '2. $R_S$ with $C_S$ across it', mc: ['Shorted by $C_S$: the source is at ground', 'Still $R_S$', 'Open'], a: 0, why: [null, 'A large capacitor across $R_S$ is a short for signals, so $R_S$ carries no signal.', 'The capacitor is open only at DC.'] },
          { lbl: '3. The top of $R_D$', mc: ['Ground', '$V_{DD}$', 'Open'], a: 0, why: [null, 'Supply rails do not move: incremental ground.', 'A DC voltage source is a short.'] },
          { lbl: '4. $C_1$ and $C_2$', mc: ['Wires', 'Opens', 'Resistors'], a: 0, why: [null, 'Open at DC only.', 'A large capacitor is a short for signals.'] },
        ],
        sol: md`Small-signal picture: $v_{in}$ drives the gate directly (through $C_1$), with $R_G$ from the gate to ground; the source is grounded (through $C_S$); $R_D$ runs from the drain to ground; $R_L$ hangs on the drain through $C_2$. So the drain sees $R_D\parallel R_L$ (plus the transistor's own $r_{ds}$, Chapter 2).

**Bypass capacitor:** $C_S$ lets $R_S$ stabilize the DC bias without costing any signal gain. Chapter 4 uses this constantly.`,
      }),
      P({
        id: 'bk01-pr-neg', title: 'A controlling voltage marked upside down',
        q: md`A VCCS $g_mv_x$ ($g_m = 5\,\text{mS}$) pulls current from $A$ to ground, but $v_x$ is marked with $+$ at ground and $-$ at $A$. A $100\,\Omega$ resistor also runs from $A$ to ground. Find the resistance of the source branch and the total resistance at $A$.`,
        fig: negFig(),
        parts: [{ lbl: 'R_{source}', unit: 'Ω', ans: -200, traps: [{ v: 200, msg: 'With $+$ at ground, $v_x = 0 - v_A = -v_t$.' }] }, { lbl: 'R_A', unit: 'Ω', ans: 200, traps: [{ v: 66.67, msg: 'The source branch is a *negative* conductance: $10\\,\\text{mS} - 5\\,\\text{mS}$.' }] }],
        hints: [md`$v_x = -v_t$, so the source carries $-g_mv_t$ from $A$ to ground.`],
        sol: md`$v_x = 0 - v_t = -v_t$. The source carries $g_mv_x = -g_mv_t$ from $A$ to ground, i.e. it pushes $g_mv_t$ *into* $A$: alone it is $-1/g_m = -200\,\Omega$. With the resistor: $i_t = v_t(10 - 5)\,\text{mS}$, so $R_A = 200\,\Omega$.`,
      }),
      P({
        id: 'bk01-pr-norton', title: 'An amplifier as a Norton source',
        q: md`An amplifier model: the input voltage $v_{in}$ controls a VCCS $g_mv_{in}$ ($g_m = 20\,\text{mS}$) that pulls current from the output to ground; $R_o = 5\kO$ is at the output, and a load $R_L = 5\kO$ is attached. Short the output and call $i_{out}$ the current that flows from the short **into** the output node (the course's convention, used from Chapter 4 on). Find $G_M = i_{out}/v_{in}$, the output resistance $R_{out}$ (with $v_{in} = 0$), and $v_{out}/v_{in}$.`,
        fig: nortonFig(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 20 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 5 }, { lbl: 'v_{out}/v_{in}', unit: 'V/V', ans: -50, traps: [{ v: -100, msg: 'The load is in parallel with $R_o$: $5\\,\\text{k}\\Omega\\parallel5\\,\\text{k}\\Omega = 2.5\\,\\text{k}\\Omega$.' }] }],
        hints: [md`Short the output: $R_o$ and $R_L$ carry nothing, so the short must supply exactly what the VCCS pulls out of the node.`, md`$R_{out}$: turn $v_{in}$ off; the VCCS is then dead.`],
        sol: md`
1. Short the output: $R_o$ and $R_L$ have no voltage across them, and the VCCS pulls $g_mv_{in}$ out of the output node, so the short must supply it: $i_{out} = g_mv_{in}$, flowing from the short into the node. $G_M = g_m = 20\,\text{mS}$.
2. $v_{in} = 0$ kills the VCCS, so $R_{out} = R_o = 5\kO$.
3. The amplifier is a Norton source: the VCCS current flows down through $R_o\parallel R_L = 2.5\kO$, so $v_{out} = -g_mv_{in}(R_o\parallel R_L) = -50\,v_{in}$. Chapter 4 writes this as $A_v = -G_MR_{out}$ (here with the load included in $R_{out}$).`,
      }),
      P({
        id: 'bk01-pr-sizes2', title: 'Estimate first',
        q: md`Estimate, then compute exactly: $R = 100\,\Omega + (2\kO\parallel20\kO\parallel100\kO)$.`,
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 1.8857, traps: [{ v: 2.1, msg: 'That is the quick estimate. The $20\\,\\text{k}\\Omega$ is only ten times the $2\\,\\text{k}\\Omega$, so it takes about $10\\%$ off.' }] }],
        hints: [md`$2\kO\parallel20\kO$ is $2\kO\times\tfrac{10}{11}$.`],
        sol: md`Estimate: $100\,\Omega + 2\kO = 2.1\kO$. Exact: $2\kO\parallel20\kO = 1.818\kO$ ($n = 10$); $\parallel100\kO$ ($n = 55$): $1.786\kO$; plus $100\,\Omega$: $1.886\kO$. The estimate is $11\%$ high, because a ratio of $10$ costs about $10\%$.`,
      }),
      P({
        id: 'bk01-pr-chord', title: 'Chord and slope',
        q: md`A diode carries $0.2\,\text{mA}$ at $0.65\,\text{V}$. Find its "DC resistance" $V_D/I_D$ and its small-signal resistance.`,
        parts: [{ lbl: 'V_D/I_D', unit: 'kΩ', ans: 3.25 }, { lbl: 'r_d', unit: 'Ω', ans: 125 }],
        hints: [md`Chord: total over total. Slope: $V_T/I_D$.`],
        sol: md`$V_D/I_D = 0.65/0.2\,\text{mA} = 3.25\kO$; $r_d = 25\,\text{mV}/0.2\,\text{mA} = 125\,\Omega$: 26 times smaller. Only the second one describes how the diode responds to a signal.`,
      }),
      P({
        id: 'bk01-pr-tanaxis', title: 'r_d from the tangent',
        q: md`On a plot of a diode's $I$–$V$ curve, the tangent at $Q$ ($0.4\,\text{mA}$, $0.64\,\text{V}$) crosses the voltage axis at $0.615\,\text{V}$. Find the slope of the tangent and $r_d$.`,
        parts: [{ lbl: '\\text{slope}', unit: 'mS', ans: 16 }, { lbl: 'r_d', unit: 'Ω', ans: 62.5 }],
        hints: [md`Rise over run: $0.4\,\text{mA}$ over $0.64 - 0.615\,\text{V}$.`],
        sol: md`Run $= 25\,\text{mV}$ ($= V_T$, as it must be for an exponential). Slope $= 0.4\,\text{mA}/25\,\text{mV} = 16\,\text{mS}$; $r_d = 1/16\,\text{mS} = 62.5\,\Omega = V_T/I_D$.`,
      }),
      P({
        id: 'bk01-pr-examA', title: 'Exam style A: a biased amplifier from its curve',
        q: md`The common-source circuit with $V_{DD} = 6\,\text{V}$, $R_D = 5\kO$, $k = 2\,\text{mA/V}^2$, $V_{TN} = 1\,\text{V}$, biased at $V_{IN} = 1.6\,\text{V}$, with a $25\,\text{mV}$-peak signal. (a) $I_D$. (b) $V_{OUT}$. (c) $A_v$. (d) The output amplitude. (e) The second-order estimate of the distortion (curvature term over linear term), in percent. (f) The largest bias $V_{IN}$ that keeps the transistor in saturation ($V_{OUT}\ge V_{IN} - V_{TN}$).`,
        fig: ampFig({ vdd: '6\\,\\text{V}', rd: '5\\,\\text{k}\\Omega', vin: '1.6\\,\\text{V}' }),
        parts: [
          { lbl: '(a)\\ I_D', unit: 'mA', ans: 0.36 }, { lbl: '(b)\\ V_{OUT}', unit: 'V', ans: 4.2 }, { lbl: '(c)\\ A_v', unit: 'V/V', ans: -6 },
          { lbl: '(d)\\ |v_{out}|', unit: 'mV', ans: 150 }, { lbl: '(e)', unit: '\\%', ans: 2.083, traps: [{ v: 4.167, msg: 'Divide by $2V_{ov}$.' }] }, { lbl: '(f)\\ V_{IN,max}', unit: 'V', ans: 2 },
        ],
        hints: [md`$\tfrac12kR_D = 5\,\text{V}^{-1}$ and $kR_D = 10\,\text{V}^{-1}$.`, md`(f) $6 - 5x^2 = x$ with $x = V_{IN} - V_{TN}$.`],
        sol: md`
**(a)** $V_{ov} = 0.6\,\text{V}$: $I_D = \tfrac12(2\,\text{mA/V}^2)(0.36) = 0.36\,\text{mA}$.

**(b)** $V_{OUT} = 6 - (0.36\,\text{mA})(5\kO) = 4.2\,\text{V}$ (above $0.6\,\text{V}$: saturated).

**(c)** $A_v = -kR_DV_{ov} = -(10)(0.6) = -6$.

**(d)** $6\times25\,\text{mV} = 150\,\text{mV}$.

**(e)** $v_{gs}/(2V_{ov}) = 0.025/1.2 = 2.08\%$.

**(f)** $5x^2 + x - 6 = 0\Rightarrow x = \dfrac{-1 + \sqrt{1 + 120}}{10} = \dfrac{-1 + 11}{10} = 1\,\text{V}$, so $V_{IN,max} = 2\,\text{V}$ (output then $1\,\text{V}$).`,
      }),
      P({
        id: 'bk01-pr-examB', title: 'Exam style B: DC, then the signal, then totals',
        q: md`The resistor-biased diode attenuator: $V_{DD} = 10\,\text{V}$, $R_1 = 9.3\kO$, $R_S = 500\,\Omega$, $R_L = 2\kO$, large capacitors, $v_s = 40\,\text{mV}$ peak. Find (a) $I_D$, (b) $r_d$, (c) the resistance from $X$ to ground in the small-signal picture, (d) $v_{out}/v_s$, (e) the output amplitude, (f) the DC voltage at the output.`,
        fig: attFigR({ vdd: '10\\,\\text{V}', r1: '9.3\\,\\text{k}\\Omega', rs: '500\\,\\Omega', rl: '2\\,\\text{k}\\Omega' }),
        parts: [
          { lbl: '(a)\\ I_D', unit: 'mA', ans: 1 }, { lbl: '(b)\\ r_d', unit: 'Ω', ans: 25 },
          { lbl: '(c)\\ R_X', unit: 'Ω', ans: 24.63, traps: [{ v: 9325, msg: '$R_1$ goes to $V_{DD}$, which is ground for signals: it is in parallel with $r_d$, not in series.' }] },
          { lbl: '(d)\\ v_{out}/v_s', unit: '', ans: 0.04694 }, { lbl: '(e)\\ |v_{out}|', unit: 'mV', ans: 1.878 }, { lbl: '(f)\\ V_{OUT}', unit: 'V', ans: 0, },
        ],
        hints: [md`DC: capacitors open. Small signal: $V_{DD}$ is ground, capacitors are wires.`],
        sol: md`
**(a)** $I_D = (10 - 0.7)/9.3\kO = 1\,\text{mA}$. **(b)** $r_d = 25\,\Omega$.

**(c)** $R_X = R_1\parallel r_d\parallel R_L = 9.3\kO\parallel25\,\Omega\parallel2\kO$: conductances $0.000108 + 0.04 + 0.0005 = 0.040608\,\text{S}$, so $R_X = 24.63\,\Omega$.

**(d)** $24.63/(500 + 24.63) = 0.0469$. **(e)** $40\,\text{mV}\times0.0469 = 1.88\,\text{mV}$.

**(f)** $C_2$ blocks DC and $R_L$ pulls the output to ground: $V_{OUT} = 0$. (The total output is $1.88\,\text{mV}\sin\omega t$ around $0\,\text{V}$; at $X$ it rides on $0.7\,\text{V}$.)`,
      }),
      P({
        id: 'bk01-pr-examC', title: 'Exam style C: a test source on a degenerated VCCS',
        q: md`A preview of Chapter 3. A VCCS $g_mv_c$ and a resistor $R_o$ both run from node $D$ to node $S$; $R_S$ runs from $S$ to ground; the controlling voltage is $v_c = v_C - v_S$, where terminal $C$ is grounded. Take $g_m = 5\,\text{mS}$, $R_o = 20\kO$, $R_S = 1\kO$. (a) Find the resistance looking into $D$. (b) What would it be without the dependent source? (c) Type the formula (<code>Ro</code>, <code>RS</code>, <code>gm</code>). (d) Which term dominates?`,
        fig: degFig(),
        parts: [
          { lbl: '(a)\\ R_D', unit: 'kΩ', ans: 121, traps: [{ v: 21, msg: 'That is $R_o + R_S$: keep the dependent source.' }, { v: 101, msg: 'You dropped $R_o$ itself: $R_o + R_S + g_mR_oR_S$.' }] },
          { lbl: '(b)', unit: 'kΩ', ans: 21 },
          BK.ex('Ro + RS + gm*Ro*RS', ['Ro', 'RS', 'gm'], '(c)\\ R_D', { exact: true }),
          { lbl: '(d)', mc: ['$g_mR_oR_S$', '$R_o$', '$R_S$'], a: 0, why: [null, '$R_o = 20\\,\\text{k}\\Omega$ is the second largest.', '$R_S$ is the smallest.'] },
        ],
        hints: [md`All of $i_t$ flows down through $R_S$, so $v_S = i_tR_S$ and $v_c = -i_tR_S$.`, md`The VCCS carries $g_mv_c = -g_mR_Si_t$ from $D$ to $S$; the rest of $i_t$, $i_t(1 + g_mR_S)$, flows through $R_o$.`],
        sol: md`
**(a)** KCL at $S$: everything that enters $D$ leaves through $R_S$, so $v_S = i_tR_S$ and $v_c = 0 - v_S = -i_tR_S$. The VCCS carries $g_mv_c = -g_mR_Si_t$ from $D$ to $S$, so $R_o$ carries $i_t - (-g_mR_Si_t) = i_t(1 + g_mR_S)$. KVL from $D$ to ground:
$$v_t = i_t(1 + g_mR_S)R_o + i_tR_S\quad\Rightarrow\quad R_D = R_o + R_S + g_mR_oR_S = 20 + 1 + 100 = 121\kO$$

**(b)** $R_o + R_S = 21\kO$.

**(c)** $R_o + R_S + g_mR_oR_S$.

**(d)** $g_mR_oR_S = 100\kO$. The dependent source multiplies the resistance: when $D$ rises, $S$ rises, $v_c$ falls, and the source *throttles* the current. Chapter 3 calls this degeneration.`,
      }),
      P({
        id: 'bk01-pr-examD', title: 'Exam style D: a signal into the top of a stack',
        q: md`$I_B = 0.5\,\text{mA}$ flows from $V_{DD}$ into node $X$; $D_1$ runs from $X$ to $Y$, $D_2$ from $Y$ to ground. The signal $v_s$ drives $X$ through $R_S = 1\kO$ and a large capacitor. Find (a) $r_d$, (b) $v_y/v_s$, (c) $v_x/v_s$, (d) $V_Y$ (DC).`,
        fig: stackTop(),
        parts: [
          { lbl: '(a)\\ r_d', unit: 'Ω', ans: 50 },
          { lbl: '(b)\\ v_y/v_s', unit: '', ans: 0.04545, traps: [{ v: 0.04762, msg: 'The signal current flows through both diodes in series: $R_S + 2r_d$ in the denominator.' }] },
          { lbl: '(c)\\ v_x/v_s', unit: '', ans: 0.09091 },
          { lbl: '(d)\\ V_Y', unit: 'V', ans: 0.7 },
        ],
        hints: [md`Small signal: $I_B$ open. The signal current goes $R_S\to r_{d1}\to r_{d2}\to$ ground.`],
        sol: md`
**(a)** Both diodes carry $0.5\,\text{mA}$ (the capacitor blocks DC): $r_d = 50\,\Omega$ each.

**(b)** One series path: $v_s\to R_S\to X\to r_{d1}\to Y\to r_{d2}\to$ ground. $v_y = v_s\dfrac{r_d}{R_S + 2r_d} = \dfrac{50}{1100}v_s = 0.0455\,v_s$.

**(c)** $v_x = v_s\dfrac{2r_d}{R_S + 2r_d} = \dfrac{100}{1100}v_s = 0.0909\,v_s$.

**(d)** One diode drop: $0.7\,\text{V}$ (and $V_X = 1.4\,\text{V}$).`,
      }),
      G('bk_c1_bias', { need: 8, pool: ['bk_c1_bias', 'bk_c1_tan_sq', 'bk_c1_tan_exp', 'bk_c1_diode', 'bk_c1_two', 'bk_c1_test_div', 'bk_c1_test_fb', 'bk_c1_sizes'] }),
    ],
  });
})();

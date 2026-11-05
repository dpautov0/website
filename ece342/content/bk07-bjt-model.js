/* bk07-bjt-model.js — Book Chapter 7: the BJT small-signal model.
   g_m = I_C/V_T derived from the exponential (and why it beats a MOSFET's at the same current), r_pi from the base
   current, r_o from the Early effect, the hybrid-pi model assembled and used (a first common-emitter gain), the T model
   and the intrinsic emitter resistance r_e (The Art of Electronics' quick gains), why the PNP uses the same model, the
   MOSFET <-> BJT dictionary, and the chapter problems.
   Helpers and drills: js/gens-bk-a5.js (window.BK5, GENS.bk_*). Every number was checked by an independent nodal solve. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk07', l);
  const B = window.BK5;
  const { plot } = B;
  const ex = (...a) => BK.ex(...a);
  const row = (items) => `<div class="figrow">${items.map(([fig, cap]) => `<div>${typeof fig === 'string' ? fig : Schem.render(fig)}<figcaption>${cap}</figcaption></div>`).join('')}</div>`;

  // ================================================================ figures
  // I_C(V_BE) with two tangent lines: the slope is the current over V_T
  const tangents = plot({
    w: 450, h: 280, x: [0.64, 0.76], y: [0, 6], xt: [0.65, 0.7, 0.75], yt: [0, 1, 2, 3, 4, 5, 6],
    xl: 'V_{BE}\\ (\\text{V})', yl: 'I_C\\ (\\text{mA})',
    curves: [{ f: (v) => Math.exp((v - 0.7) / 0.025) },
      { f: (v) => 1 + 40 * (v - 0.7), from: 0.665, to: 0.735, cls: 'dash' },
      { f: (v) => 4 + 160 * (v - 0.73466), from: 0.717, to: 0.75, cls: 'dash' }],
    marks: [{ x: 0.7, y: 1, n: '' }, { x: 0.73466, y: 4, n: '' }],
    labels: [{ x: 0.703, y: 0.55, t: '1\\,\\text{mA: slope } 40\\,\\text{mS}', a: 'l' }, { x: 0.727, y: 4.6, t: '4\\,\\text{mA: slope } 160\\,\\text{mS}', a: 'r' }],
    aria: 'tangent lines to the exponential',
  });
  // the base seen by a signal source: the transistor, and its input in the model
  const baseCkt = [['rail', [1, -0.4], { n: 'V_{CC}' }], ['w', [1, 0], [1, -0.4]], ['npn', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1]], ['iarr', [-0.3, 1], 'r', { n: 'i_b' }], ['Vac', [-0.6, 1], [-0.6, 2.2], { n: 'v_{be}', side: 'l' }], ['V', [-0.6, 2.2], [-0.6, 3.4], { n: 'V_{BE}', side: 'l' }], ['gnd', [-0.6, 3.4]]];
  const baseMdl = [['Vac', [0, 0.2], [0, 1.6], { n: 'v_{be}', side: 'l' }], ['w', [0, 0.2], [0, 0], [1.2, 0]], ['iarr', [0.6, 0], 'r', { n: 'i_b' }],
    ['R', [1.2, 0], [1.2, 1.6], { n: 'r_\\pi' }], ['w', [0, 1.6], [1.2, 1.6]], ['gnd', [0.6, 1.6]]];
  const loadCkt = [['rail', [1.6, -0.4], { n: 'V_{CC}' }], ['w', [1.6, 0], [1.6, -0.4]], ['npn', [1.6, 1]], ['gnd', [1.6, 2]],
    ['R', [-0.4, 1], [0.6, 1], { n: 'R_S' }], ['Vac', [-0.4, 1], [-0.4, 2.2], { n: 'v_s', side: 'l' }], ['gnd', [-0.4, 2.2]]];
  const loadMdl = [['Vac', [0, 0.4], [0, 1.6], { n: 'v_s', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['w', [0, 1.6], [0, 2]], ['R', [0, 0], [1.6, 0], { n: 'R_S' }],
    ['R', [1.6, 0], [1.6, 2], { n: 'r_\\pi', side: 'l' }], ['vlab', [1.95, 0.35], [1.95, 1.65], { n: 'v_\\pi' }], ['w', [0, 2], [3.8, 2]], ['gnd', [0.8, 2]],
    ['G', [3.8, 0], [3.8, 2], { n: 'g_mv_\\pi', side: 'l' }], ['w', [3.8, 0], [3.8, -0.4]], ['gndu', [3.8, -0.4]]];
  // a common emitter in the hybrid-pi model: the source (through R_S if given) on the base, r_pi, g_m v_pi, then the
  // resistors from the collector to incremental ground named in o.loads (default r_o and R_C); the emitter is grounded
  function ceModel(o = {}) {
    const x0 = o.RB ? -1.8 : -0.6, loads = o.loads || ['r_o', 'R_C'];
    const e = [['Vac', [x0, 0.4], [x0, 2], { n: o.vin || 'v_{in}', side: 'l' }], ['w', [x0, 0.4], [x0, 0]]];
    const xb = o.RB ? -0.2 : 1;                     // where the source branch meets the base node
    e.push(o.RS ? ['R', [x0, 0], [xb, 0], { n: 'R_S' }] : ['w', [x0, 0], [xb, 0]]);
    if (o.RB) e.push(['R', [xb, 0], [xb, 2], { n: o.RB, side: 'l' }], ['w', [xb, 0], [1, 0]]);
    e.push(['R', [1, 0], [1, 2], { n: 'r_\\pi', side: 'l' }], ['vlab', [1.35, 0.35], [1.35, 1.65], { n: 'v_\\pi' }], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi', side: 'l' }]);
    let x = 3;
    loads.forEach((n, i) => { x = 4.2 + 1.2 * i; e.push(['R', [x, 0], [x, 2], { n }]); });
    e.push(['w', [3, 0], [x, 0]], ['w', [x0, 2], [x, 2]], ['gnd', [2.1, 2]], ['w', [x, 0], [x + 0.5, 0]], ['term', [x + 0.5, 0], { n: 'v_{out}' }],
      ['txt', [1.12, -0.28], '$B$', { a: 'l' }], ['txt', [3.12, -0.28], '$C$', { a: 'l' }]);
    return e;
  }
  // the output side of the model between collector and emitter: g_m v_be in parallel with r_o
  const outPort = [['term', [1, -0.5], { n: 'C', side: 'r' }], ['w', [1, -0.5], [1, 0], [2.4, 0]], ['G', [1, 0], [1, 1.8], { n: 'g_mv_{be}', side: 'l' }],
    ['R', [2.4, 0], [2.4, 1.8], { n: 'r_o' }], ['w', [1, 1.8], [2.4, 1.8]], ['w', [1.7, 1.8], [1.7, 2.3]], ['term', [1.7, 2.3], { n: 'E', side: 'r' }]];

  // ================================================================== 7.1 g_m
  L({
    id: 'bk07-gm', title: '$g_m = I_C/V_T$, derived', ref: 'Lecture 23',
    steps: [
      R(md`
        ### Chapter 7 at a glance

        [Chapter 6](#/l/bk06-how) found the BJT's DC operating point. This chapter zooms in on that point and asks how the transistor responds to *small changes* around it, which is what an amplifier is made of. The answer is a linear circuit, the **small-signal model**, built from three numbers that the bias sets.

        By the end of the chapter you will be able to:
        - derive $g_m = I_C/V_T$, $r_\pi = \beta/g_m$ and $r_o = V_A/I_C$ from the device equations, and say what each one means physically;
        - assemble the **hybrid-$\pi$** model, replace a BJT by it in any circuit, and get a common-emitter gain;
        - use the **T model** and the intrinsic emitter resistance $r_e\approx1/g_m$ for quick, intuitive gains such as $A_v\approx-R_C/(r_e + R_E)$;
        - explain why the PNP uses exactly the same model;
        - translate any MOSFET result from Exam 2 into its BJT twin.

        **What you need first:** a DC operating point ([Chapter 6](#/l/bk06-dc)), and the idea of a small signal riding on a bias with a tangent-line model ([Chapter 1](#/l/bk01-tangent)). The MOSFET's model ([Chapter 2](#/l/bk02-gm)) makes a useful comparison but is not required.
      `),
      R(md`
        ### The question

        A transistor biased at $I_C$ receives a small wiggle $v_{be}$ on top of its $V_{BE}$. How much does the collector current wiggle? The ratio is the **transconductance** $g_m$: collector current out per base–emitter volt in. Every gain on Exam 3 is built from it, starting with the common emitter's $-g_mR_C$.
      `),
      RF(md`
        ### The physical picture: four percent per millivolt

        The collector current is exponential in $V_{BE}$: every $V_T = 25\,\text{mV}$ multiplies it by $e$. A small step of $1\,\text{mV}$ is $1/25$ of $V_T$, and for a small fraction of $V_T$ the exponential grows by that same fraction: $e^{1/25}\approx1 + 1/25$. So **one extra millivolt raises $I_C$ by about 4%, whatever $I_C$ is.**

        Four percent of a big current is a big change, four percent of a small one is small. The change per volt is therefore proportional to the current itself: the exponential curve is steeper wherever the current is larger, and its slope at any point is the current there divided by $V_T$.

        [[fig:t]]
      `, { t: { fig: tangents, cap: 'The exponential and its tangent lines (dashed). At $1\\,\\text{mA}$ the slope is $40\\,\\text{mS}$; at $4\\,\\text{mA}$ it is four times steeper, $160\\,\\text{mS}$.' } }),
      R(md`
        ### The model: bias plus signal

        Write every quantity as its DC value plus a small signal, exactly as in [Chapter 1](#/l/bk01-tangent):
        $$v_{BE} = V_{BE} + v_{be},\qquad i_C = I_C + i_c.$$
        We want $i_c$ in terms of $v_{be}$, to first order. The transistor is forward active throughout (the small signal never pushes it out of that region).
      `),
      R(md`
        ### The derivation

        Put the total base–emitter voltage into the law of [Section 6.1](#/l/bk06-how):
        $$i_C = I_S\,e^{(V_{BE} + v_{be})/V_T} = \underbrace{I_S\,e^{V_{BE}/V_T}}_{I_C}\cdot e^{v_{be}/V_T} = I_C\,e^{v_{be}/V_T}.$$
        The exponent of a sum split into a product, and the first factor is exactly the bias current. Now expand the remaining exponential for small $x = v_{be}/V_T$ (Taylor: $e^x = 1 + x + x^2/2 + \dots$):
        $$i_C = I_C\Big(1 + \frac{v_{be}}{V_T} + \frac12\Big(\frac{v_{be}}{V_T}\Big)^2 + \dots\Big) = I_C + \frac{I_C}{V_T}v_{be} + \frac{I_C}{2V_T^2}v_{be}^2 + \dots$$
        The first term is the bias. The second is proportional to $v_{be}$: that is the small signal. Dropping the rest,
        $$i_c = \frac{I_C}{V_T}\,v_{be}.$$
        (Equivalently, $g_m$ is the slope of the curve at the bias point: $\dfrac{dI_C}{dV_{BE}} = \dfrac{I_S}{V_T}e^{V_{BE}/V_T} = \dfrac{I_C}{V_T}$.)

        !!key The transconductance
          $$g_m = \frac{I_C}{V_T},\qquad i_c = g_mv_{be}$$
          $40\,\text{mS}$ per milliamp of collector current; $1/g_m = 25\,\Omega$ at $1\,\text{mA}$.
      `),
      R(md`
        ### Check it

        - **Units:** amperes over volts is siemens ✓.
        - **A number:** $I_C = 1\,\text{mA}$ gives $1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$, i.e. $40\,\mu\text{A}$ more collector current per millivolt: 4% of $1\,\text{mA}$ ✓ (the physical picture).
        - **Limits:** $I_C\to0$ gives $g_m\to0$ (an unbiased transistor does not amplify) ✓.
        - **What is missing:** $I_S$ (the size of the transistor), $\beta$ and $V_A$. **$g_m$ depends only on the current.** A transistor ten times bigger at the same current has a $V_{BE}$ $58\,\text{mV}$ lower and *exactly the same* $g_m$.

        ### How small is "small"?

        The dropped second-order term compared with the kept first-order term is
        $$\frac{I_Cv_{be}^2/(2V_T^2)}{I_Cv_{be}/V_T} = \frac{v_{be}}{2V_T}.$$

        | $v_{be}$ | $1\,\text{mV}$ | $2.5\,\text{mV}$ | $5\,\text{mV}$ | $10\,\text{mV}$ |
        |---|---|---|---|---|
        | $v_{be}/(2V_T)$ | 2% | 5% | 10% | 20% |

        So "small" for a BJT means a few millivolts: small next to $2V_T = 50\,\text{mV}$. A MOSFET's square law gives the same ratio as $v_{gs}/(2V_{ov})$ ([Chapter 1](#/l/bk01-tangent)): with $V_{ov} = 0.2\,\text{V}$ it tolerates eight times larger signals.
      `),
      R(md`
        ### What it means: why a BJT has so much $g_m$

        Compare transconductance per unit current:
        $$\text{BJT: }\frac{g_m}{I_C} = \frac{1}{V_T} = 40\,\text{V}^{-1},\qquad\text{MOSFET: }\frac{g_m}{I_D} = \frac{2}{V_{ov}} = 10\,\text{V}^{-1}\ (V_{ov} = 0.2\,\text{V}).$$
        At the same current the BJT has $V_{ov}/(2V_T)$ times more, here 4 times. The reason is physical. A MOSFET controls its channel charge like a capacitor, linearly in voltage, so its current grows as a square law. A BJT controls the *height of a barrier*, and the number of carriers that climb it grows by a factor $e$ for every $kT/q$: the steepest control that thermal physics allows. A MOSFET only matches it with $V_{ov}$ near $2V_T = 50\,\text{mV}$, where it too turns exponential (weak inversion).

        The price is the linear range: the same $V_T$ that makes $g_m$ large makes "small" mean a few millivolts.

        ### How to recognize it

        **$g_m$ in mS is 40 times $I_C$ in mA**, and $1/g_m$ in ohms is $25/I_C$ in mA. Whenever an exam gives a bias current, write $g_m$ next to it at once.
      `),
      R(md`
        ### Worked example

        A BJT runs at $I_C = 0.25\,\text{mA}$. Find $g_m$ and $1/g_m$, the collector-current change for $v_{be} = 2\,\text{mV}$, and compare with the exact exponential.

        1. $g_m = 0.25\,\text{mA}/25\,\text{mV} = 10\,\text{mS}$, so $1/g_m = 100\,\Omega$.
        2. $i_c = g_mv_{be} = 10\,\text{mS}\times2\,\text{mV} = 20\,\mu\text{A}$.
        3. Exact: $I_C(e^{2/25} - 1) = 0.25\,\text{mA}\times0.0833 = 20.8\,\mu\text{A}$. The straight line is 4% low, as $v_{be}/(2V_T) = 2/50$ predicts.

        !!mistake Common mistakes
          - Using the MOSFET's $2I_D/V_{ov}$ for a BJT.
          - Dividing by $0.7\,\text{V}$ instead of $V_T = 25\,\text{mV}$.
          - Thinking a bigger (or higher-$\beta$) transistor has more $g_m$ at the same current. Only the current matters.
          - Using the linear model for steps of tens of millivolts.
      `),
      Q(md`Two BJTs carry the same $I_C = 1\,\text{mA}$; one has ten times the emitter area (ten times $I_S$). Their transconductances are`,
        ['equal, $40\\,\\text{mS}$ each', 'ten times larger for the big one', 'ten times larger for the small one', 'different by $\\ln10$'], 0,
        [null, 'Area changes $I_S$, which only shifts $V_{BE}$ (by $58\\,\\text{mV}$). $g_m = I_C/V_T$ has no $I_S$ in it.', '$g_m$ depends only on the current, and the currents are equal.', '$\\ln10$ appears in the $V_{BE}$ difference, not in $g_m$.'],
        md`$g_m = I_C/V_T$: same current, same $g_m$. The bigger transistor just needs $V_T\ln10 = 58\,\text{mV}$ less $V_{BE}$.`),
      Q(md`A BJT's bias current is doubled. Its $g_m$`,
        ['doubles', 'stays the same', 'grows by $\\sqrt2$', 'halves'], 0,
        [null, '$g_m = I_C/V_T$ is proportional to $I_C$.', '$\\sqrt2$ is the MOSFET at a fixed size ($g_m = \\sqrt{2\\mu C_{ox}(W/L)I_D}$), not the BJT.', 'More current means a steeper exponential.'],
        md`$g_m = I_C/V_T$: proportional to the current. (A MOSFET of fixed size would gain only $\sqrt2$.)`),
      Q(md`Why does a BJT have more $g_m$ than a MOSFET at the same current?`,
        ['Its current depends exponentially on $V_{BE}$ (a barrier height), so it changes by a factor $e$ every $V_T = 25\\,\\text{mV}$; a MOSFET\'s square law is gentler', 'Because $\\beta$ amplifies the current', 'Because the base draws current', 'It does not: they are equal at equal current'], 0,
        [null, '$\\beta$ does not appear in $g_m = I_C/V_T$.', 'The base current is a cost, not a source of transconductance (it gives $r_\\pi$).', 'Ratio $V_{ov}/(2V_T)$: 4 at $V_{ov} = 0.2\\,\\text{V}$.'],
        md`$g_m/I = 1/V_T$ for the BJT against $2/V_{ov}$ for the MOSFET. Barrier-controlled conduction is exponential; capacitor-controlled channel charge is linear, giving a square law.`),
      Q(md`About how large can $v_{be}$ be before the second-order term is 10% of the linear one?`,
        ['$5\\,\\text{mV}$', '$50\\,\\text{mV}$', '$0.7\\,\\text{V}$', '$25\\,\\text{mV}$'], 0,
        [null, 'At $50\\,\\text{mV}$, $v_{be}/(2V_T) = 100\\%$: the linear model is useless.', 'That is the bias, not the signal.', 'At $25\\,\\text{mV}$ the ratio is 50%.'],
        md`$v_{be}/(2V_T) = 0.1\Rightarrow v_{be} = 0.1\times50\,\text{mV} = 5\,\text{mV}$.`),
      P({
        id: 'bk07-gm-num', title: 'Transconductance from the current',
        q: md`Find $g_m$ and $1/g_m$ for a BJT biased at $I_C = 0.4\,\text{mA}$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 16, traps: [{ v: 4, msg: 'That is the MOSFET formula $2I/V_{ov}$ with $0.2\\,\\text{V}$.' }] }, { lbl: '1/g_m', unit: 'Ω', ans: 62.5 }],
        hints: [md`$40\,\text{mS}$ per mA.`],
        sol: md`$g_m = 0.4\,\text{mA}/25\,\text{mV} = 16\,\text{mS}$; $1/g_m = 25\,\Omega/0.4 = 62.5\,\Omega$.`,
      }),
      P({
        id: 'bk07-gm-target', title: 'Current for a target g_m',
        q: md`A design needs $g_m = 100\,\text{mS}$. What collector current is required? What drain current would a MOSFET at $V_{ov} = 0.2\,\text{V}$ need for the same $g_m$?`,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 2.5 }, { lbl: 'I_D', unit: 'mA', ans: 10, traps: [{ v: 20, msg: '$g_m = 2I_D/V_{ov}$ gives $I_D = g_mV_{ov}/2$; you dropped the factor 2.' }] }],
        hints: [md`$I_C = g_mV_T$; $I_D = g_mV_{ov}/2$.`],
        sol: md`$I_C = 100\,\text{mS}\times25\,\text{mV} = 2.5\,\text{mA}$. $I_D = 100\,\text{mS}\times0.1\,\text{V} = 10\,\text{mA}$: four times the current, and four times the power, for the same $g_m$.`,
      }),
      P({
        id: 'bk07-gm-step', title: 'One millivolt at two milliamps',
        q: md`A BJT at $I_C = 2\,\text{mA}$ gets $v_{be} = 1\,\text{mV}$. Find $i_c$ from $g_m$, and exactly from the exponential.`,
        parts: [{ lbl: 'i_c\\ (g_m)', unit: 'µA', ans: 80 }, { lbl: 'i_c\\ \\text{(exact)}', unit: 'µA', ans: 81.6215, tol: { rel: 0.004 } }],
        hints: [md`Exact: $I_C(e^{1/25} - 1)$.`],
        sol: md`$g_m = 80\,\text{mS}$, so $i_c = 80\,\mu\text{A}$. Exact: $2\,\text{mA}\times(e^{0.04} - 1) = 2\,\text{mA}\times0.04081 = 81.62\,\mu\text{A}$: 2% more, as $v_{be}/(2V_T) = 1/50$ predicts.`,
      }),
      P({
        id: 'bk07-gm-mos', title: 'BJT against MOSFET',
        q: md`At $1\,\text{mA}$, find $g_m$ for a BJT and for a MOSFET with $V_{ov} = 0.25\,\text{V}$, and their ratio. Then: what collector current gives the BJT the MOSFET's $g_m$?`,
        parts: [{ lbl: 'g_{m,BJT}', unit: 'mS', ans: 40 }, { lbl: 'g_{m,MOS}', unit: 'mS', ans: 8 }, { lbl: '\\text{ratio}', unit: '', ans: 5 }, { lbl: 'I_C', unit: 'mA', ans: 0.2 }],
        hints: [md`Ratio $= V_{ov}/(2V_T)$.`],
        sol: md`BJT $40\,\text{mS}$; MOSFET $2(1\,\text{mA})/0.25\,\text{V} = 8\,\text{mS}$; ratio $0.25/0.05 = 5$. The BJT reaches $8\,\text{mS}$ at $I_C = 8\,\text{mS}\times25\,\text{mV} = 0.2\,\text{mA}$, a fifth of the current.`,
      }),
      P({
        id: 'bk07-gm-small', title: 'How small is small?',
        q: md`What is the largest $v_{be}$ that keeps the second-order term within 5% of the linear term? Express the same limit for the base–emitter voltage of a transistor biased at $1\,\text{mA}$ as a current swing: the largest $|i_c|$ predicted by $g_m$.`,
        parts: [{ lbl: 'v_{be,max}', unit: 'mV', ans: 2.5 }, { lbl: 'i_{c,max}', unit: 'µA', ans: 100 }],
        hints: [md`$v_{be}/(2V_T) = 0.05$.`],
        sol: md`$v_{be} = 0.05\times50\,\text{mV} = 2.5\,\text{mV}$; then $i_c = 40\,\text{mS}\times2.5\,\text{mV} = 100\,\mu\text{A}$: 10% of the bias current. A useful rule: the linear model holds while the signal current is a small fraction (here a tenth) of the bias current.`,
      }),
      R(md`
        ### Drills

        Small-signal parameters from any form of the bias; how small "small" is; BJT against MOSFET.
      `),
      G('bk_gm', { need: 4 }),
      G('bk_lin', { need: 3, pool: ['bk_lin', 'bk_gmmos'] }),
    ],
  });

  // ================================================================== 7.2 r_pi
  L({
    id: 'bk07-rpi', title: '$r_\\pi$: the base is not an open circuit', ref: 'Lecture 23',
    steps: [
      R(md`
        ### The question

        A MOSFET's gate draws no current, so a signal source driving it sees an open circuit. A BJT's base draws $I_B = I_C/\beta$, so when $v_{be}$ wiggles, the base current wiggles too. A signal source driving the base therefore sees a resistance. How big is it, and what does it do to the signal? This is the element that makes every BJT input resistance on Exam 3 finite.
      `),
      R(md`
        ### The physical picture: the base–emitter junction is a diode carrying $I_B$

        Seen from the base, the base–emitter junction looks like a forward-biased diode, and the current it carries (into the base terminal) is $I_B$. In [Chapter 1](#/l/bk01-diode) a diode carrying $I_D$ had incremental resistance $r_d = V_T/I_D$. So the base should look like $V_T/I_B$: a small current, hence a large resistance. With $I_B = 10\,\mu\text{A}$: $25\,\text{mV}/10\,\mu\text{A} = 2.5\kO$.

        Another way to say it: a wiggle $v_{be}$ makes the collector current change by $g_mv_{be}$, and the base current by $1/\beta$ of that. A small current for a given voltage means a large resistance.
      `),
      RF(md`
        ### The derivation

        In forward active the base current follows the collector current: $i_B = i_C/\beta$. So it obeys the same exponential law with $I_S$ replaced by $I_S/\beta$:
        $$i_B = \frac{I_S}{\beta}\,e^{v_{BE}/V_T}.$$
        Linearize exactly as for $g_m$ (the slope at the bias point):
        $$\frac{di_B}{dv_{BE}} = \frac{1}{V_T}\cdot\frac{I_S}{\beta}e^{V_{BE}/V_T} = \frac{I_B}{V_T}\quad\Rightarrow\quad i_b = \frac{I_B}{V_T}\,v_{be}.$$
        The base therefore looks like a resistor $r_\pi = v_{be}/i_b$:
        $$r_\pi = \frac{V_T}{I_B} = \frac{V_T}{I_C/\beta} = \frac{\beta}{I_C/V_T} = \frac{\beta}{g_m}.$$

        !!key The base resistance
          $$r_\pi = \frac{\beta}{g_m} = \frac{V_T}{I_B},\qquad g_mr_\pi = \beta$$
          $2.5\kO$ at $I_C = 1\,\text{mA}$ with $\beta = 100$.

        [[fig:b]]
      `, { b: { fig: row([[baseCkt, 'a signal $v_{be}$ on the base'], [baseMdl, 'what it sees: $r_\\pi$']]), cap: 'The base current changes by $i_b = v_{be}/r_\\pi$: the base looks like a resistor $r_\\pi$ to the emitter.' } }),
      R(md`
        ### Check it

        - **$\beta\to\infty$:** $r_\pi\to\infty$, an open circuit: a MOSFET's gate ✓.
        - **Units:** $\beta$ is a pure number, $1/g_m$ is ohms ✓.
        - **Numbers:** $I_C = 1\,\text{mA}$, $\beta = 100$: $r_\pi = 100\times25\,\Omega = 2.5\kO$; and $V_T/I_B = 25\,\text{mV}/10\,\mu\text{A} = 2.5\kO$ ✓ (the two forms agree).
        - **Current dependence:** $r_\pi\propto1/I_C$. A transistor biased at $0.1\,\text{mA}$ has $r_\pi = 25\kO$; at $10\,\text{mA}$, $250\,\Omega$.

        **One caution about $\beta$.** Strictly, the $\beta$ in $r_\pi$ is the *incremental* $\beta_0 = di_C/di_B$, which can differ a little from the DC ratio $I_C/I_B$. The course, like most textbooks at this level, uses one $\beta$ for both.
      `),
      RF(md`
        ### What it means: the base loads its source

        Drive the base from a source with resistance $R_S$. In the model, $R_S$ and $r_\pi$ form a voltage divider, and only the part across $r_\pi$ controls the collector:
        $$v_\pi = v_s\,\frac{r_\pi}{r_\pi + R_S},\qquad i_c = g_mv_\pi = \frac{g_mr_\pi}{r_\pi + R_S}v_s = \frac{\beta}{r_\pi + R_S}\,v_s.$$

        [[fig:l]]

        **Numbers.** $R_S = 10\kO$, $\beta = 100$. At $I_C = 0.1\,\text{mA}$: $r_\pi = 25\kO$, $v_\pi/v_s = 25/35 = 0.71$, and $i_c/v_s = 2.86\,\text{mS}$. At $I_C = 1\,\text{mA}$: $r_\pi = 2.5\kO$, $v_\pi/v_s = 0.2$, and $i_c/v_s = 8\,\text{mS}$. Ten times the current, ten times the $g_m$, but less than three times the output: the extra $g_m$ is eaten by the lower $r_\pi$. The limit, for very large $g_m$, is $\beta/R_S = 10\,\text{mS}$: then the source just pushes a base current $v_s/R_S$ and the transistor multiplies it by $\beta$.

        ### How to recognize it

        Whenever a signal enters at a base, write $r_\pi$ from base to emitter, and look for anything in series with the base (a source resistance, a bias resistor): it forms a divider with $r_\pi$ (or, with an emitter resistor, with $r_\pi + (\beta + 1)R_E$; [Chapter 8](#/l/bk08-base)).
      `, { l: { fig: row([[loadCkt, 'a source with resistance $R_S$'], [loadMdl, 'the input divider in the model']]), cap: '$R_S$ and $r_\\pi$ divide the signal; only $v_\\pi$ controls the collector current.' } }),
      R(md`
        ### Worked example

        $I_C = 2\,\text{mA}$ and $\beta = 80$. Find $r_\pi$ two ways.

        1. $g_m = 80\,\text{mS}$, so $r_\pi = \beta/g_m = 80/80\,\text{mS} = 1\kO$.
        2. $I_B = 2\,\text{mA}/80 = 25\,\mu\text{A}$, so $r_\pi = V_T/I_B = 25\,\text{mV}/25\,\mu\text{A} = 1\kO$ ✓.

        !!mistake Common mistakes
          - Writing $r_\pi = 1/g_m$. That is what the **emitter** looks like (Section 7.5); the base is $\beta$ times larger.
          - Treating the base as an open circuit, as if it were a gate.
          - Forgetting that $r_\pi$ changes with the bias: it is $\beta/g_m$ at *this* $I_C$.
          - Ignoring the divider $R_S$–$r_\pi$ when the source has resistance.
      `),
      Q(md`The bias current of a BJT is doubled ($\beta$ unchanged). Its $r_\pi$`,
        ['halves', 'doubles', 'stays the same', 'quadruples'], 0,
        [null, '$r_\\pi = \\beta/g_m$, and $g_m$ doubles.', 'It depends on the bias through $g_m$.', 'It is inversely proportional to $I_C$, not to $I_C^2$.'],
        md`$r_\pi = \beta V_T/I_C$: inversely proportional to the current.`),
      Q(md`What does $r_\pi$ become for a transistor with $\beta\to\infty$, and which device does that describe?`,
        ['An open circuit: a MOSFET gate', 'A short circuit: an emitter', '$1/g_m$', 'Zero, because $g_m r_\\pi = \\beta$'], 0,
        [null, 'With no base current the base draws nothing; it does not short to the emitter.', '$1/g_m$ is $r_\\pi/\\beta$, which goes to zero relative to $r_\\pi$.', '$g_mr_\\pi = \\beta\\to\\infty$ means $r_\\pi\\to\\infty$ at a fixed $g_m$.'],
        md`$r_\pi = \beta/g_m\to\infty$: the base becomes a gate. A BJT with infinite $\beta$ is a MOSFET with $g_m = I_C/V_T$.`),
      Q(md`A source with $R_S = 10\kO$ drives a base with $r_\pi = 2.5\kO$ (emitter grounded). What fraction of $v_s$ appears as $v_\pi$?`,
        ['0.2', '0.8', '1', '0.25'], 0,
        [null, 'That is the fraction across $R_S$.', 'Only with $R_S = 0$.', 'That is $r_\\pi/R_S$, not $r_\\pi/(r_\\pi + R_S)$.'],
        md`$v_\pi/v_s = r_\pi/(r_\pi + R_S) = 2.5/12.5 = 0.2$.`),
      P({
        id: 'bk07-rpi-num', title: 'r_pi from the collector current',
        q: md`Find $g_m$ and $r_\pi$ for $I_C = 0.5\,\text{mA}$ and $\beta = 150$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 20 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 7.5, traps: [{ v: 0.05, msg: 'That is $1/g_m$. The base is $\\beta$ times bigger.' }] }],
        hints: [md`$r_\pi = \beta/g_m$.`],
        sol: md`$g_m = 20\,\text{mS}$; $r_\pi = 150/20\,\text{mS} = 150\times50\,\Omega = 7.5\kO$.`,
      }),
      P({
        id: 'bk07-rpi-ib', title: 'r_pi from the base current alone',
        q: md`A forward-active BJT draws $I_B = 4\,\mu\text{A}$. Find $r_\pi$. (You do not need $\beta$.)`,
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 6.25 }],
        hints: [md`The base–emitter junction is a diode carrying $I_B$: $r_\pi = V_T/I_B$.`],
        sol: md`$r_\pi = V_T/I_B = 25\,\text{mV}/4\,\mu\text{A} = 6.25\kO$. ($\beta$ cancels: $\beta/g_m = \beta V_T/I_C = V_T/I_B$.)`,
      }),
      P({
        id: 'bk07-rpi-div', title: 'A source drives the base',
        q: md`A source $v_s$ with $R_S = 5\kO$ drives the base of a BJT biased at $I_C = 0.25\,\text{mA}$ ($\beta = 100$, emitter grounded for signals). Find $r_\pi$, $v_\pi/v_s$, and $i_c/v_s$.`,
        fig: loadCkt,
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 10 }, { lbl: 'v_\\pi/v_s', unit: '', ans: 2 / 3 }, { lbl: 'i_c/v_s', unit: 'mS', ans: 20 / 3, traps: [{ v: 10, msg: 'That is $g_m$, as if all of $v_s$ reached the base. The divider $R_S$–$r_\\pi$ takes its share.' }] }],
        hints: [md`$g_m = 10\,\text{mS}$, $r_\pi = 10\kO$; divider $r_\pi/(r_\pi + R_S)$.`],
        sol: md`$r_\pi = 100/10\,\text{mS} = 10\kO$. $v_\pi/v_s = 10/15 = 0.667$. $i_c/v_s = g_m\times0.667 = 6.67\,\text{mS}$ (or $\beta/(r_\pi + R_S) = 100/15\kO$ ✓).`,
      }),
      P({
        id: 'bk07-rpi-sym', title: 'The input divider, typed',
        q: md`For the source and transistor above, type $i_c/v_s$ in terms of \`gm\`, \`rpi\` and \`RS\`.`,
        parts: [ex('gm*rpi/(rpi + RS)', ['gm', 'rpi', 'RS'], 'i_c/v_s', { exact: true, free: true })],
        sol: md`$v_\pi = v_s\,r_\pi/(r_\pi + R_S)$, then $i_c = g_mv_\pi$: $\dfrac{i_c}{v_s} = \dfrac{g_mr_\pi}{r_\pi + R_S}$, which is also $\dfrac{\beta}{r_\pi + R_S}$.`,
      }),
      P({
        id: 'bk07-rpi-two', title: 'Two ways to the same r_pi',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 80$. Find $I_B$ and $r_\pi$.`,
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 25 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 1 }],
        sol: md`$I_B = 25\,\mu\text{A}$; $r_\pi = V_T/I_B = 1\kO = \beta/g_m = 80/80\,\text{mS}$ ✓.`,
      }),
      R(md`
        ### Drill

        $g_m$, $r_\pi$ and $r_o$ from the bias, given in different ways.
      `),
      G('bk_gm', { need: 4 }),
    ],
  });

  // ================================================================== 7.3 r_o
  L({
    id: 'bk07-ro', title: '$r_o$ from the Early effect', ref: 'Lecture 23',
    steps: [
      R(md`
        ### The question

        [Section 6.8](#/l/bk06-early) showed that the output curves slope up a little: $I_C = I_Se^{V_{BE}/V_T}(1 + V_{CE}/V_A)$. For small signals, what does that slope add to the model, and when can we ignore it? It decides the largest gain a single transistor can give, and every output resistance you will compute in [Chapter 8](#/l/bk08-collector).
      `),
      R(md`
        ### The physical picture

        A perfect collector would be a current source: the collector current set by $v_{BE}$ alone, whatever $v_{CE}$ does. The real collector lets a little extra current through when $v_{CE}$ rises (the base gets thinner). A current that grows in proportion to the voltage across two terminals is what a **resistor** does. So the collector should look like a current source with a resistor across it.
      `),
      RF(md`
        ### The derivation: two partial derivatives

        Now $i_C$ depends on two voltages, $v_{BE}$ and $v_{CE}$. For small changes of both, the change of a function of two variables is each partial derivative times its own change (the first-order Taylor expansion in two variables):
        $$i_c = \frac{\partial i_C}{\partial v_{BE}}\,v_{be} + \frac{\partial i_C}{\partial v_{CE}}\,v_{ce}.$$
        **First derivative**, at a fixed $v_{CE}$: the exponential gives $\partial i_C/\partial v_{BE} = I_C/V_T = g_m$ exactly as before (the Early factor just rides along inside $I_C$).

        **Second derivative**, at a fixed $v_{BE}$ ([Section 6.8](#/l/bk06-early)):
        $$\frac{\partial i_C}{\partial v_{CE}} = \frac{I_C}{V_A + V_{CE}}\approx\frac{I_C}{V_A}\equiv\frac{1}{r_o}.$$
        So
        $$i_c = g_mv_{be} + \frac{v_{ce}}{r_o}.$$
        Read it as a circuit between collector and emitter: a controlled current source $g_mv_{be}$ in parallel with a resistor $r_o$, whose current is $v_{ce}/r_o$.

        [[fig:o]]

        !!key The output side of the model
          $$i_c = g_mv_{be} + \frac{v_{ce}}{r_o},\qquad r_o = \frac{V_A}{I_C}$$
      `, { o: { fig: outPort, cap: 'Collector to emitter: a current source $g_mv_{be}$ with $r_o$ across it.' } }),
      R(md`
        ### Check it, and the intrinsic gain

        - **$V_A\to\infty$:** $r_o\to\infty$, the ideal current source ✓. **Units:** volts over amps ✓.
        - **Numbers:** $V_A = 100\,\text{V}$, $I_C = 1\,\text{mA}$: $r_o = 100\kO$, $g_m = 40\,\text{mS}$.

        Multiply the two: the current cancels.
        $$g_mr_o = \frac{I_C}{V_T}\cdot\frac{V_A}{I_C} = \frac{V_A}{V_T}.$$
        This is the **intrinsic gain**: $100\,\text{V}/25\,\text{mV} = 4000$. It is the gain of a common emitter whose collector sees nothing but $r_o$ (an ideal current-source load), the most one transistor can give, and it does not depend on the bias current. A MOSFET's is $g_mr_{ds} = 2/(\lambda V_{ov})$: with $\lambda = 0.1\,\text{V}^{-1}$ and $V_{ov} = 0.2\,\text{V}$ only 100. Large $g_m$ is what gives the BJT its large intrinsic gain.
      `),
      RF(md`
        ### What it means: when to keep $r_o$

        In a common emitter, $r_o$ and $R_C$ both run from the collector to incremental ground, so they are in parallel and $A_v = -g_m(R_C\parallel r_o)$. If $R_C = 5\kO$ and $r_o = 100\kO$: $R_C\parallel r_o = 4.76\kO$, a 4.8% difference. **Drop $r_o$ when the collector sees a resistor much smaller than $r_o$** (the course usually says so). **Keep it when the collector sees another collector, a current source, or a cascode**: then $r_o$ is the whole story.

        [[fig:cs]]

        ### Worked example: a current-source load

        $I_C = 0.5\,\text{mA}$, $V_A = 50\,\text{V}$, ideal current-source load. $g_m = 20\,\text{mS}$, $r_o = 100\kO$. The current source is an open circuit for signals, so the output node has only $r_o$: $A_v = -g_mr_o = -2000 = -V_A/V_T$ ✓.

        Make the load a real PNP current source with $V_A = 50\,\text{V}$: looking up into its collector (base and emitter held) you see its own $r_o = 100\kO$, in parallel with the NPN's. $A_v = -20\,\text{mS}\times50\kO = -1000$: half the intrinsic gain.
      `, { cs: { fig: row([[B.ceFig('I'), 'current-source load'], [ceModel({ loads: ['r_o'] }), 'its model: only $r_o$ at the output']]), cap: 'With an ideal current-source load, $A_v = -g_mr_o$.' } }),
      R(md`
        !!mistake Common mistakes
          - Putting $r_o$ in series with the collector. It is **across** the current source, from collector to emitter.
          - Keeping $R_C$ and forgetting $r_o$ when the "load" is a current source: then $r_o$ is all there is.
          - Thinking a larger current gives a larger intrinsic gain. $g_m$ grows but $r_o$ shrinks: the product $V_A/V_T$ is fixed.
      `),
      Q(md`Between the collector and the emitter, where does $r_o$ sit in the small-signal model?`,
        ['In parallel with the $g_mv_\\pi$ source', 'In series with the collector lead', 'In series with the $g_mv_\\pi$ source', 'Between base and collector'], 0,
        [null, 'A series resistor would not let extra current flow when $v_{ce}$ rises; it would just drop voltage.', 'A resistor in series with an ideal current source changes nothing.', 'That would couple input and output; $r_o$ comes from $\\partial i_C/\\partial v_{CE}$.'],
        md`$i_c = g_mv_{be} + v_{ce}/r_o$: two currents adding between the same two nodes, so two elements in parallel.`),
      Q(md`A BJT's bias current is raised from $0.1\,\text{mA}$ to $1\,\text{mA}$. Its intrinsic gain $g_mr_o$`,
        ['stays the same, $V_A/V_T$', 'grows ten times', 'falls ten times', 'grows $\\sqrt{10}$ times'], 0,
        [null, '$g_m$ grows ten times but $r_o$ falls ten times.', 'The two changes cancel.', 'That is the MOSFET-at-fixed-size intuition; it does not apply here.'],
        md`$g_mr_o = (I_C/V_T)(V_A/I_C) = V_A/V_T$, independent of the current.`),
      Q(md`In a common emitter with $R_C = 2\kO$ and $r_o = 200\kO$, ignoring $r_o$ changes the gain by about`,
        ['1%', '10%', '50%', '100%'], 0,
        [null, '$R_C/(R_C + r_o) = 2/202$.', 'Only if $r_o$ were about $9R_C$.', 'Only if $r_o = R_C$.'],
        md`$R_C\parallel r_o = R_C\,r_o/(R_C + r_o)$: the fractional change is $R_C/(R_C + r_o) = 1\%$.`),
      P({
        id: 'bk07-ro-num', title: 'Output resistance and intrinsic gain',
        q: md`$I_C = 0.2\,\text{mA}$, $V_A = 80\,\text{V}$. Find $g_m$, $r_o$ and $g_mr_o$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 8 }, { lbl: 'r_o', unit: 'kΩ', ans: 400 }, { lbl: 'g_mr_o', unit: '', ans: 3200 }],
        sol: md`$g_m = 8\,\text{mS}$, $r_o = 80/0.2 = 400\kO$, $g_mr_o = 3200 = V_A/V_T$ ✓.`,
      }),
      P({
        id: 'bk07-ro-matter', title: 'When r_o really matters',
        q: md`A common emitter at $I_C = 2\,\text{mA}$ has $R_C = 10\kO$, and the transistor's $V_A = 40\,\text{V}$. Find the gain without $r_o$, with $r_o$, and the reduction in percent.`,
        fig: B.ceFig('R'),
        parts: [{ lbl: 'A_v\\ (r_o\\to\\infty)', unit: '', ans: -800 }, { lbl: 'A_v\\ (\\text{with } r_o)', unit: '', ans: -533.333 }, { lbl: '\\text{reduction}', unit: '%', ans: 33.3333, tol: { rel: 0.02 } }],
        hints: [md`$r_o = 40\,\text{V}/2\,\text{mA} = 20\kO$, in parallel with $R_C$.`],
        sol: md`$g_m = 80\,\text{mS}$; $-g_mR_C = -800$. $r_o = 20\kO$, $R_C\parallel r_o = 6.67\kO$, $A_v = -533$: a third less. Here $R_C$ is half of $r_o$: definitely keep $r_o$.`,
      }),
      P({
        id: 'bk07-ro-load', title: 'An NPN with a PNP current-source load',
        q: md`Both transistors carry $1\,\text{mA}$; the NPN has $V_A = 100\,\text{V}$, the PNP load $V_A = 50\,\text{V}$. Find $r_{o1}$, $r_{o2}$ and the gain.`,
        fig: B.ceFig('pnp'),
        parts: [{ lbl: 'r_{o1}', unit: 'kΩ', ans: 100 }, { lbl: 'r_{o2}', unit: 'kΩ', ans: 50 }, { lbl: 'A_v', unit: '', ans: -1333.33, traps: [{ v: -4000, msg: 'That treats the PNP as an ideal source: its own $r_{o2}$ is in parallel at the output.' }] }],
        hints: [md`$A_v = -g_{m1}(r_{o1}\parallel r_{o2})$.`],
        sol: md`$r_{o1} = 100\kO$, $r_{o2} = 50\kO$, $r_{o1}\parallel r_{o2} = 33.3\kO$, $A_v = -40\,\text{mS}\times33.3\kO = -1333$.`,
      }),
      P({
        id: 'bk07-ro-sym', title: 'The gain with r_o, typed',
        q: md`Type the gain of a common emitter (input on the base, emitter grounded) with collector resistor $R_C$, keeping $r_o$. Use \`gm\`, \`RC\`, \`ro\`.`,
        parts: [ex('-gm*RC*ro/(RC + ro)', ['gm', 'RC', 'ro'], 'A_v', { exact: true, free: true })],
        sol: md`$A_v = -g_m(R_C\parallel r_o) = -\dfrac{g_mR_Cr_o}{R_C + r_o}$ (typing \`-gm*(RC||ro)\` works too).`,
      }),
      P({
        id: 'bk07-ro-mos', title: 'Intrinsic gains compared',
        q: md`Compare the intrinsic gain of a BJT with $V_A = 50\,\text{V}$ with that of a MOSFET with $\lambda = 0.05\,\text{V}^{-1}$ at $V_{ov} = 0.25\,\text{V}$.`,
        parts: [{ lbl: 'g_mr_o\\ (\\text{BJT})', unit: '', ans: 2000 }, { lbl: 'g_mr_{ds}\\ (\\text{MOS})', unit: '', ans: 160 }],
        hints: [md`$g_mr_{ds} = \dfrac{2I_D}{V_{ov}}\cdot\dfrac{1}{\lambda I_D} = \dfrac{2}{\lambda V_{ov}}$.`],
        sol: md`BJT: $V_A/V_T = 50/0.025 = 2000$. MOSFET: $2/(0.05\times0.25) = 160$. The BJT wins by its larger $g_m$ per amp ($1/V_T$ against $2/V_{ov}$).`,
      }),
      R(md`
        ### Drill: $r_o$ in action

        The intrinsic gain, how much $r_o$ changes a gain, and active loads.
      `),
      G('bk_ro', { need: 4 }),
    ],
  });

  // ================================================================== 7.4 the hybrid-pi model
  const hpV = E3F.hybridPi();
  const hpI = hpV.map((el) => (el[0] === 'G' ? ['G', [3, 0], [3, 2], { n: '\\beta i_b', side: 'l' }] : el)).concat([['iarr', [0.5, 0], 'r', { n: 'i_b' }]]);
  const exAmp = { VCC: 12, R1: 68e3, R2: 12e3, RC: 4.7e3, RE: 1.2e3, RL: 10e3, RS: 1e3, bypass: true };

  L({
    id: 'bk07-hybrid', title: 'The hybrid-$\\pi$ model, assembled and felt', ref: 'Lectures 23–24',
    steps: [
      R(md`
        ### The question

        We now have three small-signal facts: $i_c = g_mv_{be}$, $i_b = v_{be}/r_\pi$, and the collector's extra $v_{ce}/r_o$. Put together, they make one circuit that replaces the transistor in every signal calculation on Exam 3: the **hybrid-$\pi$ model**. This section assembles it, gets a feel for its numbers, gives the procedure for using it, and computes the first gain: the common emitter.
      `),
      RF(md`
        ### The model, assembled

        Each fact becomes one element between the transistor's three terminals:
        - **base to emitter:** $r_\pi$, because $i_b = v_\pi/r_\pi$, where $v_\pi = v_{be}$ is the voltage across it, $+$ at the base;
        - **collector to emitter:** a controlled current source $g_mv_\pi$, flowing from collector to emitter inside the model, because $i_c = g_mv_{be}$;
        - **collector to emitter, in parallel:** $r_o$, because the collector also passes $v_{ce}/r_o$.

        [[fig:hp]]

        The source can be read two ways. Since $v_\pi = i_br_\pi$ and $g_mr_\pi = \beta$, $g_mv_\pi = g_mr_\pi i_b = \beta i_b$: the **same** element is a current-controlled source $\beta i_b$. Use whichever control variable is easier in the circuit at hand.

        !!key The hybrid-$\pi$ model (NPN and PNP alike)
          $$i_b = \frac{v_\pi}{r_\pi},\qquad i_c = g_mv_\pi + \frac{v_{ce}}{r_o} = \beta i_b + \frac{v_{ce}}{r_o}$$
          $$g_m = \frac{I_C}{V_T},\qquad r_\pi = \frac{\beta}{g_m},\qquad r_o = \frac{V_A}{I_C}$$
      `, { hp: { fig: row([[hpV, 'voltage-controlled form'], [hpI, 'current-controlled form']]), cap: 'The hybrid-$\\pi$ model. The two forms are the same circuit: $g_mv_\\pi = \\beta i_b$.' } }),
      R(md`
        ### The model, felt

        At $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$: $r_\pi = 2.5\kO$, $g_m = 40\,\text{mS}$, $r_o = 100\kO$. Wiggle the base by $1\,\text{mV}$ (emitter grounded):
        - the base current wiggles by $1\,\text{mV}/2.5\kO = 0.4\,\mu\text{A}$;
        - the collector current wiggles by $40\,\mu\text{A}$, a hundred times more ($= \beta i_b$ ✓);
        - letting the collector voltage move by $1\,\text{V}$ would change $i_c$ by only $10\,\mu\text{A}$ through $r_o$.

        So the BJT is a **voltage-controlled current source** with a modest input resistance ($r_\pi$) and a high output resistance ($r_o$). The MOSFET model is the same circuit with $r_\pi\to\infty$.
      `),
      R(md`
        !!method Replacing a BJT by its model
          1. **DC first:** find $I_C$ and check forward active ([Chapter 6](#/l/bk06-dc)).
          2. **Parameters:** $g_m = I_C/V_T$, $r_\pi = \beta/g_m$, $r_o = V_A/I_C$ (or $\infty$ if told to ignore it).
          3. **Kill the DC:** every DC voltage source (supplies, bias sources) becomes a short to ground; every DC current source becomes an open; large capacitors become shorts.
          4. **Swap:** replace each transistor by the model, wiring $B$, $C$, $E$ to the nodes where the transistor's leads were.
          5. **Solve** the linear circuit: KCL at nodes, KVL around loops, or $A_v = -G_MR_{out}$ ([Chapter 4](#/l/bk04-norton)).
      `),
      RF(md`
        ### The derivation: the common-emitter gain

        Input on the base, emitter grounded, $R_C$ from the collector to $V_{CC}$. After step 3, $V_{CC}$ is ground, so $R_C$ runs from the collector to ground, in parallel with $r_o$.

        [[fig:ce]]

        - **Input side.** The source sits directly across $r_\pi$, so $v_\pi = v_{in}$.
        - **Output side, KCL at the collector.** The controlled source pulls $g_mv_\pi$ out of the node toward the emitter (ground); the only other paths are $r_o$ and $R_C$, so the current $g_mv_\pi$ must be supplied through them from ground, which makes the node voltage negative: $\dfrac{v_{out}}{r_o} + \dfrac{v_{out}}{R_C} + g_mv_\pi = 0$.
        - **Solve:** $v_{out} = -g_mv_\pi\,(R_C\parallel r_o) = -g_mv_{in}(R_C\parallel r_o)$.

        !!key The common-emitter gain
          $$A_v = \frac{v_{out}}{v_{in}} = -g_m(R_C\parallel r_o)\approx-g_mR_C$$
          In $G_MR_{out}$ form: short the output and $i_{out} = g_mv_{in}$ flows from the short into the collector, so $G_M = g_m$; with the input zeroed, $R_{out} = R_C\parallel r_o$.

        **Numbers:** $I_C = 1\,\text{mA}$, $R_C = 5\kO$, $V_A = 100\,\text{V}$: $A_v = -40\,\text{mS}\times(5\parallel100)\kO = -190.5$ (or $-200$ without $r_o$).
      `, { ce: { fig: row([[B.ceFig('R'), 'the stage'], [ceModel({ loads: ['r_o', 'R_C'] }), 'its small-signal circuit']]), cap: 'A common emitter and its hybrid-$\\pi$ circuit: $V_{CC}$ and the bias source are ground.' } }),
      R(md`
        ### Check it

        - **Sign:** raise the base, more collector current, more drop across $R_C$, the collector falls: inverting ✓.
        - **Limits:** $r_o\to\infty$ gives $-g_mR_C$; $R_C\to\infty$ (an ideal current-source load) gives $-g_mr_o = -V_A/V_T$, the intrinsic gain ✓.
        - **Units:** siemens times ohms, a pure number ✓.

        ### What it means: the gain is the DC drop over 25 mV

        Write $g_mR_C$ with $g_m = I_C/V_T$:
        $$|A_v|\approx g_mR_C = \frac{I_CR_C}{V_T} = \frac{\text{DC voltage across }R_C}{25\,\text{mV}}.$$
        *The Art of Electronics* makes this point: the gain is fixed by how many volts the bias drops across the collector resistor, not by $I_C$ or $R_C$ separately. With $V_{CC} = 10\,\text{V}$ and the collector at mid-supply, $5\,\text{V}/25\,\text{mV} = 200$. It can never much exceed $V_{CC}/V_T$, whatever resistor you pick. (It also drifts with temperature through $V_T$, one reason designers add an emitter resistor: [Section 7.5](#/l/bk07-tmodel).)

        ### How to recognize it

        Input at the base, output at the collector, emitter at incremental ground (directly or through a bypass capacitor): a common emitter, $A_v = -g_m\times$(everything from collector to incremental ground, $r_o$ included) $\times$ (any input divider).
      `),
      RF(md`
        ### Worked example: from bias to gain

        This is the amplifier of [Chapter 6's problem 14](#/l/bk06-problems): $V_{CC} = 12\,\text{V}$, $R_1 = 68\kO$, $R_2 = 12\kO$, $R_C = 4.7\kO$, $R_E = 1.2\kO$ (bypassed), $R_L = 10\kO$, $R_S = 1\kO$, $\beta = 150$, and now $V_A = 100\,\text{V}$. Find $A_v = v_{out}/v_s$.

        1. **DC** (done there): $I_C = 0.862\,\text{mA}$.
        2. **Parameters:** $g_m = 34.5\,\text{mS}$, $r_\pi = 150/34.5\,\text{mS} = 4.35\kO$, $r_o = 100/0.862\,\text{mA} = 116\kO$.
        3. **Small-signal circuit:** $V_{CC}$ to ground puts $R_1\parallel R_2 = 10.2\kO$ from the base to ground; $C_E$ grounds the emitter; $C_1$, $C_2$ are shorts, so $R_L$ is in parallel with $R_C$.

        [[fig:w]]

        4. **Input:** the base node has $R_1\parallel R_2$ and $r_\pi$ to ground: $R_{in} = 10.2\parallel4.35 = 3.05\kO$, so $v_\pi = v_s\cdot3.05/(3.05 + 1) = 0.753\,v_s$.
        5. **Output:** $R_C\parallel R_L\parallel r_o = 4.7\parallel10\parallel116 = 3.11\kO$.
        6. **Gain:** $A_v = -34.5\,\text{mS}\times3.11\kO\times0.753 = -80.8$ (without $r_o$: $-83.0$).

        !!mistake Common mistakes
          - Leaving $V_{CC}$ in the small-signal circuit. It is ground, which puts $R_1$ (and $R_C$) to ground.
          - Forgetting the bias divider at the base: it is in parallel with $r_\pi$.
          - Forgetting $R_L$ (through $C_2$) in parallel with $R_C$.
          - Using DC voltages ($0.7\,\text{V}$, $V_C$) in the small-signal circuit. Only signals live there.
          - Flipping the controlled source's direction: it always points from collector to emitter for $g_mv_\pi$ with $v_\pi = v_b - v_e$.
      `, { w: { fig: row([[B.ampFig(Object.assign({ vals: false }, exAmp)), 'the amplifier'], [ceModel({ RS: true, RB: 'R_1\\parallel R_2', vin: 'v_s', loads: ['r_o', 'R_C', 'R_L'] }), 'its small-signal circuit']]), cap: 'The amplifier and its hybrid-$\\pi$ circuit: the divider and $r_\\pi$ load the input, $R_L$ and $r_o$ the output.' } }),
      Q(md`In the small-signal circuit, what does the supply $V_{CC}$ become?`,
        ['A short to ground (an incremental ground)', 'An open circuit', 'A $V_{CC}$ battery, as at DC', 'A resistor $V_{CC}/I_C$'], 0,
        [null, 'An ideal voltage source has no signal voltage across it, which is a short, not an open. (A DC **current** source becomes an open.)', 'Only changes live in the small-signal circuit; a constant voltage has zero change.', 'A supply is not a resistor.'],
        md`Its voltage never changes, so for signals it is the same as ground. Everything tied to $V_{CC}$ (like $R_C$ or $R_1$) goes to ground in the model.`),
      Q(md`Why are $g_mv_\pi$ and $\beta i_b$ the same controlled source?`,
        ['Because $v_\\pi = i_br_\\pi$ and $g_mr_\\pi = \\beta$', 'They are not: $\\beta i_b$ includes $r_o$', 'Because $\\beta = g_m/r_\\pi$', 'Only when the emitter is grounded'], 0,
        [null, '$r_o$ is a separate element in both forms.', 'The relation is $\\beta = g_mr_\\pi$, a product.', 'The identity holds for the model itself, whatever surrounds it.'],
        md`$g_mv_\pi = g_m(i_br_\pi) = (g_mr_\pi)i_b = \beta i_b$. One element, two names for its control.`),
      Q(md`A common emitter (no emitter resistor, $r_o$ ignored) has $V_{CC} = 9\,\text{V}$ and its collector biased at $V_C = 4\,\text{V}$. Roughly what is $|A_v|$?`,
        ['200', '160', '360', 'It depends on $I_C$, which is not given'], 0,
        [null, 'That would be $4\\,\\text{V}/25\\,\\text{mV}$: the collector **voltage**, not the drop across $R_C$.', 'That is $V_{CC}/V_T$, the ceiling, not this circuit.', '$I_CR_C$ is the drop across $R_C$, $9 - 4 = 5\\,\\text{V}$, whatever the split.'],
        md`$|A_v| = g_mR_C = I_CR_C/V_T = (9 - 4)\,\text{V}/25\,\text{mV} = 200$.`),
      Q(md`In a common emitter whose emitter resistor is bypassed by a large capacitor, the emitter for signals is`,
        ['at ground: the capacitor shorts $R_E$', 'at $V_E$, its DC voltage', 'floating: $R_E$ disconnects it', 'at the base voltage'], 0,
        [null, 'DC values are not part of the small-signal circuit; the emitter node has no signal on it.', 'The capacitor connects it to ground for signals.', 'The base carries the signal; the emitter is held by the capacitor.'],
        md`A large capacitor is a short for signals, so $R_E$ is bypassed and the emitter is an incremental ground: the stage is a plain common emitter, $-g_m(\dots)$.`),
      P({
        id: 'bk07-hyb-ce', title: 'A common-emitter gain',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$, $R_C = 10\kO$, input on the base, emitter grounded. Find $g_m$, $r_o$ and $A_v$.`,
        fig: B.ceFig('R'),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 20 }, { lbl: 'r_o', unit: 'kΩ', ans: 100 }, { lbl: 'A_v', unit: '', ans: -181.818, traps: [{ v: 181.818, msg: 'A common emitter inverts.' }] }],
        hints: [md`$A_v = -g_m(R_C\parallel r_o)$.`],
        sol: md`$g_m = 20\,\text{mS}$, $r_o = 100\kO$, $R_C\parallel r_o = 9.09\kO$, $A_v = -181.8$ ($-200$ without $r_o$).`,
      }),
      P({
        id: 'bk07-hyb-rs', title: 'Add a source resistance',
        q: md`The same stage ($I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$, $R_C = 10\kO$) is driven from a source with $R_S = 5\kO$. Find $r_\pi$ and $v_{out}/v_s$.`,
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'v_{out}/v_s', unit: '', ans: -90.9091 }],
        hints: [md`$v_\pi = v_s\,r_\pi/(r_\pi + R_S)$.`],
        sol: md`$r_\pi = 100/20\,\text{mS} = 5\kO$; the input divider halves the signal: $A_v = -181.8\times0.5 = -90.9$.`,
      }),
      P({
        id: 'bk07-hyb-aoe', title: 'The gain is the DC drop over 25 mV',
        q: md`Two common emitters run from $V_{CC} = 15\,\text{V}$ with the collector at $7.5\,\text{V}$ (ignore $r_o$). One has $I_C = 0.5\,\text{mA}$ (so $R_C = 15\kO$), the other $I_C = 2\,\text{mA}$ ($R_C = 3.75\kO$). Find both gains.`,
        parts: [{ lbl: 'A_v\\ (0.5\\,\\text{mA})', unit: '', ans: -300 }, { lbl: 'A_v\\ (2\\,\\text{mA})', unit: '', ans: -300 }],
        sol: md`$-g_mR_C = -I_CR_C/V_T = -7.5\,\text{V}/25\,\text{mV} = -300$ for both: $20\,\text{mS}\times15\kO$ and $80\,\text{mS}\times3.75\kO$. Same DC drop, same gain.`,
      }),
      P({
        id: 'bk07-hyb-full', title: 'From bias to gain',
        q: md`$V_{CC} = 10\,\text{V}$, $R_1 = 47\kO$, $R_2 = 10\kO$, $R_C = 3.3\kO$, $R_E = 1\kO$ (bypassed), $R_L = 4.7\kO$, $R_S = 500\,\Omega$, $\beta = 100$, ignore $r_o$, large capacitors. Find $I_C$, $R_{in}$ (to the right of $R_S$) and $A_v = v_{out}/v_s$.`,
        fig: B.ampFig({ VCC: 10, R1: 47e3, R2: 10e3, RC: 3.3e3, RE: 1e3, RL: 4.7e3, RS: 500, bypass: true, vals: false }),
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.965152 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 1.97108, traps: [{ v: 2.59027, msg: 'That is $r_\\pi$ alone: the bias divider $R_1\\parallel R_2$ also goes from the base to ground.' }] }, { lbl: 'A_v', unit: '', ans: -59.7028 }],
        hints: [md`DC: $V_{TH} = 10\times10/57$, $R_{TH} = 47\parallel10$.`, md`Signal: $R_{in} = (R_1\parallel R_2)\parallel r_\pi$; output $R_C\parallel R_L$.`],
        sol: md`
1. DC: $V_{TH} = 1.754\,\text{V}$, $R_{TH} = 8.246\kO$, $I_B = \dfrac{1.054}{8.246 + 101}\,\text{mA} = 9.652\,\mu\text{A}$, $I_C = 0.9652\,\text{mA}$.
2. $g_m = 38.61\,\text{mS}$, $r_\pi = 2.590\kO$.
3. $R_{in} = 8.246\parallel2.590 = 1.971\kO$; $v_\pi/v_s = 1.971/2.471 = 0.7977$.
4. $R_C\parallel R_L = 3.3\parallel4.7 = 1.939\kO$; $A_v = -38.61\,\text{mS}\times1.939\kO\times0.7977 = -59.7$.`,
      }),
      P({
        id: 'bk07-hyb-sym', title: 'The gain with a source resistance, typed',
        q: md`Type $v_{out}/v_s$ for a common emitter (emitter grounded, $r_o$ ignored) with collector resistor $R_C$ driven through $R_S$. Use \`gm\`, \`rpi\`, \`beta\`, \`RS\`, \`RC\` as you like ($r_\pi = \beta/g_m$ is built in).`,
        parts: [ex('-gm*RC*rpi/(rpi + RS)', ['gm', 'rpi', 'beta', 'RS', 'RC'], 'v_{out}/v_s', { exact: true })],
        sol: md`$v_{out}/v_s = -g_mR_C\dfrac{r_\pi}{r_\pi + R_S} = -\dfrac{\beta R_C}{r_\pi + R_S}$ (the second form is the current-controlled reading: the source pushes $i_b = v_s/(R_S + r_\pi)$ and the collector delivers $\beta i_b$).`,
      }),
      P({
        id: 'bk07-hyb-ib', title: 'Both readings of the source',
        q: md`A BJT at $I_C = 1\,\text{mA}$, $\beta = 100$ (emitter grounded) gets $v_{be} = 1\,\text{mV}$. Find $i_b$ and $i_c$.`,
        parts: [{ lbl: 'i_b', unit: 'µA', ans: 0.4 }, { lbl: 'i_c', unit: 'µA', ans: 40 }],
        sol: md`$i_b = v_\pi/r_\pi = 1\,\text{mV}/2.5\kO = 0.4\,\mu\text{A}$; $i_c = g_mv_\pi = 40\,\mu\text{A} = \beta i_b$ ✓.`,
      }),
      R(md`
        ### Drills

        Common-emitter gains from the model (source resistance, loads, $r_o$), then the whole exam chain from the bias.
      `),
      G('bk_cegain', { need: 4 }),
      G('bk_full', { need: 3 }),
    ],
  });

  // ================================================================== 7.5 the T model and r_e
  const tMod = [['term', [2, -0.6], { n: 'C', side: 'r' }], ['w', [2, -0.6], [2, 0]], ['G', [2, 0], [2, 1.6], { n: '\\alpha i_e', side: 'l' }],
    ['term', [0.4, 1.6], { n: 'B', side: 'l' }], ['w', [0.4, 1.6], [2, 1.6]], ['R', [2, 1.6], [2, 3.2], { n: 'r_e' }],
    ['iarr', [2, 2.4], 'd', { n: 'i_e', side: 'l', off: [-16, 0] }], ['w', [2, 3.2], [2, 3.7]], ['term', [2, 3.7], { n: 'E', side: 'r' }]];
  const degCkt = [['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }],
    ['npn', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.6], { n: 'v_{in}', side: 'l' }],
    ['V', [-0.6, 2.6], [-0.6, 3.8], { n: 'V_{BB}', side: 'l' }], ['gnd', [-0.6, 3.8]]];
  const degT = [['Vac', [0, 1.6], [0, 2.9], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2.9]], ['w', [0, 1.6], [2, 1.6]],
    ['gndu', [2, -1.4]], ['R', [2, -1.4], [2, 0], { n: 'R_C' }], ['w', [2, 0], [2.8, 0]], ['term', [2.8, 0], { n: 'v_{out}' }],
    ['G', [2, 0], [2, 1.6], { n: '\\alpha i_e', side: 'l' }], ['R', [2, 1.6], [2, 2.9], { n: 'r_e' }], ['iarr', [2, 2.25], 'd', { n: 'i_e', side: 'l', off: [-16, 0] }],
    ['R', [2, 2.9], [2, 4.2], { n: 'R_E' }], ['gnd', [2, 4.2]]];

  L({
    id: 'bk07-tmodel', title: 'The T model and the emitter resistance $r_e$', ref: 'Lecture 24',
    steps: [
      R(md`
        ### The question

        The hybrid-$\pi$ model is built around the base current. Many stages are easier to see through the **emitter** current: anything with a resistor in the emitter, anything driven at the emitter, every follower. Is there an equivalent picture centred on $i_e$? There is, and it gives the fastest gains in the course, the ones *The Art of Electronics* computes in its head: $A_v\approx-R_C/(r_e + R_E)$.
      `),
      R(md`
        ### The physical picture: the emitter is a low-resistance node

        Hold the base still and push on the emitter. Lowering the emitter by $1\,\text{mV}$ raises $V_{BE}$ by $1\,\text{mV}$, and the emitter current jumps by 4% ([Section 7.1](#/l/bk07-gm)). A node whose current changes that much for a millivolt has a **small** resistance: about $V_T/I_E$, the same $r_d$ as a diode carrying the emitter current. At $1\,\text{mA}$ that is $25\,\Omega$. This is the **intrinsic emitter resistance** $r_e$, and it behaves like a real resistor sitting inside the emitter lead.
      `),
      RF(md`
        ### The derivation: from the hybrid-$\pi$ model to the T

        Start from the hybrid-$\pi$ model and compute the current that leaves through the emitter. KCL at the emitter node: it carries the base current plus the collector current,
        $$i_e = i_b + i_c = \frac{v_\pi}{r_\pi} + g_mv_\pi = v_\pi\,\frac{1 + g_mr_\pi}{r_\pi} = v_\pi\,\frac{\beta + 1}{r_\pi}.$$
        So $v_\pi$ drives $i_e$ as if through a resistor
        $$r_e\equiv\frac{r_\pi}{\beta + 1},\qquad i_e = \frac{v_\pi}{r_e}.$$
        The collector current in terms of $i_e$: $i_c = g_mv_\pi = g_mr_e\,i_e$, and $g_mr_e = \dfrac{g_mr_\pi}{\beta + 1} = \dfrac{\beta}{\beta + 1} = \alpha$, so $i_c = \alpha i_e$.

        **Now build a circuit with exactly these terminal currents.** Put $r_e$ from an internal node to the emitter, carrying $i_e$, and tie the base to that internal node. Put a current source $\alpha i_e$ from the collector down into the same node. KCL at the node: $i_b + \alpha i_e = i_e$, so $i_b = (1 - \alpha)i_e = i_e/(\beta + 1) = v_\pi/r_\pi$: exactly the hybrid-$\pi$ base current. All three terminal currents agree for every $v_\pi$, so **the two models are the same two-port**. ($r_o$, when kept, goes from collector to emitter in both.)

        [[fig:t]]

        Two more forms of $r_e$:
        $$r_e = \frac{r_\pi}{\beta + 1} = \frac{\beta/g_m}{\beta + 1} = \frac{\alpha}{g_m} = \frac{V_T}{I_E}\approx\frac{1}{g_m}.$$

        !!key The T model
          Base to emitter: $r_e = \alpha/g_m\approx1/g_m$ carrying $i_e$. Collector into the base node: $\alpha i_e$. $r_e\approx25\,\Omega/I_C(\text{mA})$.
      `, { t: { fig: row([[hpV, 'hybrid-$\\pi$'], [tMod, 'T model']]), cap: 'Two pictures of the same transistor. In the T model $r_e$ carries the emitter current and the collector source feeds the base node.' } }),
      R(md`
        ### Check it

        - **Base resistance:** with the emitter grounded, $v_{be}$ sits across $r_e$, $i_e = v_{be}/r_e$ and $i_b = i_e/(\beta + 1)$, so $v_{be}/i_b = (\beta + 1)r_e = r_\pi$ ✓.
        - **Transconductance:** $i_c = \alpha i_e = \alpha v_{be}/r_e = g_mv_{be}$ ✓.
        - **$\beta\to\infty$:** $\alpha\to1$, $r_e\to1/g_m$, the base current vanishes: the T model of a MOSFET ✓.
        - **Number:** $1\,\text{mA}$, $\beta = 100$: $r_e = 0.99/40\,\text{mS} = 24.75\,\Omega$.
      `),
      RF(md`
        ### Quick gains with the T model

        **1. Common emitter with an emitter resistor.** The base sits at $v_{in}$. The emitter current flows through $r_e$ and then $R_E$ to ground, so KVL from the base down: $v_{in} = i_e(r_e + R_E)$. The collector delivers $\alpha i_e$, which comes up through $R_C$ from incremental ground: $v_{out} = -\alpha i_eR_C$. Divide:
        $$A_v = -\frac{\alpha R_C}{r_e + R_E}\approx-\frac{R_C}{r_e + R_E}.$$

        [[fig:d]]

        This is Lecture 24's result in disguise: $-\dfrac{g_mR_C}{1 + g_mR_E(\beta + 1)/\beta}$. Multiply top and bottom of $\alpha R_C/(r_e + R_E)$ by $g_m/\alpha$ and use $g_mr_e = \alpha$: you get exactly that. The input resistance at the base is $v_{in}/i_b = (\beta + 1)(r_e + R_E) = r_\pi + (\beta + 1)R_E$.

        **2. Emitter follower.** Output at the emitter across $R_E$, collector at incremental ground: $v_{out} = i_eR_E$, and with a source resistance $R_S$ in the base lead, $v_s = i_bR_S + i_e(r_e + R_E)$ with $i_b = i_e/(\beta + 1)$:
        $$\frac{v_{out}}{v_s} = \frac{R_E}{R_E + r_e + R_S/(\beta + 1)}.$$

        **3. Common base.** Base at incremental ground, signal into the emitter: the emitter looks like $r_e$, so the source pushes $i_e = -v_s/(R_S + r_e)$ (out of the emitter is the positive $i_e$ direction), and $v_{out} = -\alpha i_eR_C$:
        $$A_v = \frac{\alpha R_C}{r_e + R_S},\qquad R_{in} = r_e.$$

        !!key The Art of Electronics' rule
          Voltage gain of a stage $\approx-\dfrac{\text{resistance in the collector}}{\text{resistance in the emitter, including }r_e}$, with $r_e\approx25\,\Omega/I_C(\text{mA})$.
      `, { d: { fig: row([[degCkt, 'a common emitter with $R_E$'], [degT, 'in the T model']]), cap: 'With the T model, $v_{in} = i_e(r_e + R_E)$ and $v_{out} = -\\alpha i_eR_C$.' } }),
      R(md`
        ### What it means: degeneration buys predictability and linearity

        With $R_E\gg r_e$, the gain is $-R_C/R_E$: a ratio of two resistors, no longer dependent on $I_C$, $\beta$ or temperature (all of which live in $r_e$). The price is gain: $-R_C/(r_e + R_E)$ instead of $-R_C/r_e$.

        It also buys linearity. Only the part of $v_{in}$ across $r_e$ reaches the junction: $v_{be} = v_{in}\,r_e/(r_e + R_E)$. With $r_e = 25\,\Omega$ and $R_E = 475\,\Omega$, the junction sees $1/20$ of the input, so the input can be 20 times larger for the same distortion ([Section 7.1](#/l/bk07-gm): about $5\,\text{mV}$ across the junction for 10%).

        ### How to recognize it

        A resistor in the emitter, a signal into the emitter, or an output taken at the emitter: reach for the T model and $r_e$. A signal into the base with the emitter grounded: either model; hybrid-$\pi$ is usually quicker.
      `),
      R(md`
        ### Worked example

        $I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 10\kO$, $R_E = 470\,\Omega$ (unbypassed). Find $r_e$, $A_v$ and $R_{in}$.

        1. $g_m = 40\,\text{mS}$, $\alpha = 100/101$, $r_e = \alpha/g_m = 24.75\,\Omega$.
        2. $A_v = -\dfrac{0.9901\times10\kO}{24.75 + 470\,\Omega} = -20.01$. (The rule of thumb with $r_e\approx25\,\Omega$ and $\alpha\approx1$: $-10\kO/495\,\Omega = -20.2$.)
        3. $R_{in} = (\beta + 1)(r_e + R_E) = 101\times494.75\,\Omega = 49.97\kO$.

        Without $R_E$ the gain would be $-g_mR_C = -400$, but it would follow $I_C$ (and temperature); with it, $-20$ set mainly by $R_C/R_E$.

        !!mistake Common mistakes
          - Using $r_\pi$ where $r_e$ belongs. Looking into the **emitter** you see $r_e = r_\pi/(\beta + 1)$; looking into the **base** you see $r_\pi$.
          - Dropping $r_e$ next to a small $R_E$. With $R_E = 100\,\Omega$ and $r_e = 25\,\Omega$, that is a 25% error.
          - Forgetting that $r_e$ changes with the bias: $25\,\Omega$ is for $1\,\text{mA}$ only.
          - Mixing the models: in the T model the controlled source feeds the **base node**, not the emitter.
      `),
      Q(md`What is $r_e$ for a BJT at $I_C = 2\,\text{mA}$ (large $\beta$)?`,
        ['$12.5\\,\\Omega$', '$25\\,\\Omega$', '$50\\,\\Omega$', '$1.25\\kO$'], 0,
        [null, 'That is at $1\\,\\text{mA}$.', 'That would be at $0.5\\,\\text{mA}$.', 'That is $r_\\pi$ for $\\beta = 100$.'],
        md`$r_e\approx1/g_m = V_T/I_C = 25\,\text{mV}/2\,\text{mA} = 12.5\,\Omega$.`),
      Q(md`A common emitter has $R_C = 6.8\kO$ in the collector and $R_E = 330\,\Omega$ in the emitter, at $I_C = 1\,\text{mA}$. Roughly what is the gain?`,
        ['$-19$', '$-272$', '$-21$', '$+19$'], 0,
        [null, 'That is $-g_mR_C$, ignoring $R_E$.', 'That ignores $r_e$: $-6.8\\kO/330\\,\\Omega$. Close, but add the $25\\,\\Omega$.', 'A common emitter inverts.'],
        md`$-R_C/(r_e + R_E) = -6800/(25 + 330) = -19.2$.`),
      Q(md`Why does a large emitter resistor make a common emitter's gain predictable?`,
        ['The gain becomes about $-R_C/R_E$, which no longer depends on $I_C$, $\\beta$ or temperature', 'It raises $g_m$', 'It makes $r_e$ larger', 'It removes the base current'], 0,
        [null, '$g_m$ is set by $I_C$ alone.', '$r_e$ depends only on the bias current.', 'The base current is still $i_e/(\\beta + 1)$.'],
        md`$A_v = -\alpha R_C/(r_e + R_E)\to-R_C/R_E$ when $R_E\gg r_e$: everything that varies ($r_e$, $\alpha$) drops out.`),
      Q(md`Holding the base fixed, what resistance do you see looking into the emitter?`,
        ['$r_e = r_\\pi/(\\beta + 1)\\approx1/g_m$', '$r_\\pi$', '$(\\beta + 1)r_\\pi$', '$r_o$'], 0,
        [null, 'That is looking into the base.', 'Backwards: from the emitter, base-side resistances are divided by $(\\beta + 1)$.', 'That is looking into the collector.'],
        md`The T model shows it directly: from the emitter to the (held) base there is just $r_e$. [Chapter 8](#/l/bk08-emitter) adds resistors around it.`),
      P({
        id: 'bk07-t-re', title: 'Intrinsic emitter resistances',
        q: md`Find $r_e = \alpha/g_m$ for (a) $I_C = 2\,\text{mA}$, $\beta = 100$ and (b) $I_C = 0.25\,\text{mA}$, $\beta = 50$.`,
        parts: [{ lbl: 'r_e\\ (a)', unit: 'Ω', ans: 12.3762, accept: [12.5] }, { lbl: 'r_e\\ (b)', unit: 'Ω', ans: 98.0392, accept: [100] }],
        hints: [md`$g_m = I_C/V_T$, $\alpha = \beta/(\beta + 1)$.`],
        sol: md`(a) $g_m = 80\,\text{mS}$, $r_e = (100/101)/80\,\text{mS} = 12.38\,\Omega$ ($\approx12.5\,\Omega$). (b) $g_m = 10\,\text{mS}$, $r_e = (50/51)/10\,\text{mS} = 98.0\,\Omega$ ($\approx100\,\Omega$).`,
      }),
      P({
        id: 'bk07-t-deg', title: 'A degenerated common emitter',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 150$, $R_C = 6.8\kO$, $R_E = 220\,\Omega$ unbypassed, $r_o$ ignored. Find $r_e$, $A_v$ and the input resistance at the base.`,
        fig: degCkt,
        parts: [{ lbl: 'r_e', unit: 'Ω', ans: 12.4172, accept: [12.5] }, { lbl: 'A_v', unit: '', ans: -29.064, accept: [-6800 / 232.5], traps: [{ v: -544, msg: 'That is $-g_mR_C$: the emitter is not grounded here.' }] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 35.095 }],
        hints: [md`$A_v = -\alpha R_C/(r_e + R_E)$; $R_{in} = (\beta + 1)(r_e + R_E)$.`],
        sol: md`$r_e = (150/151)/80\,\text{mS} = 12.42\,\Omega$. $A_v = -\dfrac{0.9934\times6800}{12.42 + 220} = -29.06$ (rule of thumb $-6800/232.5 = -29.2$). $R_{in} = 151\times232.4\,\Omega = 35.1\kO$.`,
      }),
      P({
        id: 'bk07-t-fol', title: 'A follower with a source resistance',
        q: md`An emitter follower at $I_C = 1\,\text{mA}$, $\beta = 100$, $R_E = 1\kO$, driven from a source with $R_S = 10\kO$ ($r_o$ ignored). Find $v_{out}/v_s$.`,
        parts: [{ lbl: 'v_{out}/v_s', unit: '', ans: 0.889868, tol: { rel: 0.003 } }],
        hints: [md`From the emitter, $R_S$ looks like $R_S/(\beta + 1)$.`],
        sol: md`$r_e = 24.75\,\Omega$, $R_S/(\beta + 1) = 99.0\,\Omega$. $v_{out}/v_s = \dfrac{1000}{1000 + 24.75 + 99.0} = 0.8899$. The source resistance, shrunk by $\beta + 1$, costs more than $r_e$ here.`,
      }),
      P({
        id: 'bk07-t-cb', title: 'A common-base gain',
        q: md`A common base at $I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 10\kO$, driven at the emitter from a $50\,\Omega$ source ($r_o$ ignored). Find $r_e$ and $A_v = v_{out}/v_s$.`,
        parts: [{ lbl: 'r_e', unit: 'Ω', ans: 49.505, accept: [50] }, { lbl: 'A_v', unit: '', ans: 99.5025, accept: [100], traps: [{ v: -99.5025, msg: 'The common base does not invert.' }] }],
        hints: [md`$A_v = \alpha R_C/(r_e + R_S)$.`],
        sol: md`$r_e = (100/101)/20\,\text{mS} = 49.5\,\Omega$. $A_v = \dfrac{0.9901\times10\kO}{49.5 + 50\,\Omega} = 99.5$. A $50\,\Omega$ source matched to the low input resistance loses half the signal.`,
      }),
      P({
        id: 'bk07-t-sym', title: 'The degenerated gain, typed',
        q: md`Type the gain $v_{out}/v_{in}$ of a common emitter with $R_E$ unbypassed and $R_C$ in the collector ($r_o$ ignored). Use any of \`gm\`, \`beta\`, \`rpi\`, \`RC\`, \`RE\` ($r_\pi = \beta/g_m$ is built in).`,
        parts: [ex('-beta*RC/(rpi + (beta + 1)*RE)', ['gm', 'beta', 'rpi', 'RC', 'RE'], 'A_v')],
        sol: md`$A_v = -\dfrac{\beta R_C}{r_\pi + (\beta + 1)R_E} = -\dfrac{\alpha R_C}{r_e + R_E} = -\dfrac{g_mR_C}{1 + g_mR_E(\beta + 1)/\beta}$: three forms of one expression.`,
      }),
      P({
        id: 'bk07-t-lin', title: 'Degeneration and linearity',
        q: md`A common emitter at $1\,\text{mA}$ ($\beta = 100$) has $R_E = 470\,\Omega$. How large can $v_{in}$ be if the junction may see at most $5\,\text{mV}$ (about 10% distortion)?`,
        parts: [{ lbl: 'v_{in,max}', unit: 'mV', ans: 99.94, tol: { rel: 0.02 } }],
        hints: [md`$v_{be} = v_{in}\,r_e/(r_e + R_E)$.`],
        sol: md`$r_e = 24.75\,\Omega$; $v_{in} = 5\,\text{mV}\times(24.75 + 470)/24.75 = 99.9\,\text{mV}$: twenty times what a grounded emitter tolerates.`,
      }),
      R(md`
        ### Drill: quick gains

        Degenerated common emitters, followers and common bases, all through $r_e$.
      `),
      G('bk_tgain', { need: 5 }),
    ],
  });

  // ================================================================== 7.6 the PNP model
  const pnpCE = [['rail', [1, -0.4], { n: 'V_{CC}' }], ['w', [1, 0], [1, -0.4]], ['pnp', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_C', side: 'l' }], ['gnd', [1, 3.2]],
    ['w', [1, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'v_{out}' }], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }],
    ['V', [-0.6, 2.4], [-0.6, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 3.4]]];
  // the same hybrid-pi model, drawn the PNP way up: emitter on top (at V_CC, an incremental ground), collector below
  const pnpMdl = [['w', [1, 0], [3, 0]], ['w', [2, 0], [2, -0.4]], ['gndu', [2, -0.4]], ['R', [1, 0], [1, 2], { n: 'r_\\pi', side: 'l' }],
    ['vlab', [1.35, 1.65], [1.35, 0.35], { n: 'v_\\pi' }], ['w', [1, 2], [-0.2, 2]], ['Vac', [-0.2, 2], [-0.2, 3.2], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.2, 3.2]],
    ['G', [3, 2], [3, 0], { n: 'g_mv_\\pi', side: 'l' }], ['w', [3, 2], [4.2, 2]], ['R', [4.2, 2], [4.2, 3.4], { n: 'R_C' }], ['gnd', [4.2, 3.4]],
    ['w', [4.2, 2], [4.8, 2]], ['term', [4.8, 2], { n: 'v_{out}' }], ['txt', [1.12, -0.28], '$E$', { a: 'l' }], ['txt', [0.88, 2.3], '$B$', { a: 'r' }], ['txt', [3.12, 2.3], '$C$', { a: 'l' }]];

  L({
    id: 'bk07-pnpmodel', title: 'Why the PNP uses the same model', ref: 'Lecture 24',
    steps: [
      R(md`
        ### The question

        A PNP's currents flow the other way: into the emitter, out of the collector and out of the base ([Section 6.4](#/l/bk06-pnp)). Should its small-signal model be flipped too: $r_\pi$ reversed, the $g_mv_\pi$ arrow pointing the other way? **No.** The model is identical, arrow and all. This section shows why, so that you never have to wonder on an exam, exactly as with NMOS and PMOS ([Chapter 2](#/l/bk02-pmodel)).
      `),
      R(md`
        ### The physical picture: small signals are changes

        The model describes *changes*, not the DC currents. Think about what a PNP does when its base moves **up** by a millivolt, emitter fixed: $V_{EB}$ shrinks by $1\,\text{mV}$, so the current flowing *out of* the collector shrinks by 4%. Less current flowing out is the same as **more current flowing in** (or rather, less negative inflow). An NPN in the same situation: base up, more current flows in at the collector.

        So in both devices, **base up relative to emitter means the current into the collector increases**. That is all the model says: $i_c = g_mv_{be}$, with $i_c$ measured into the collector.
      `),
      R(md`
        ### The derivation

        Measure every small-signal quantity with the NPN's conventions: $v_{be} = v_b - v_e$, $v_{ce} = v_c - v_e$, $i_b$ into the base, $i_c$ into the collector. The PNP's large-signal law, with its own (positive) currents:
        $$I_{C,out} = I_Se^{V_{EB}/V_T}\Big(1 + \frac{V_{EC}}{V_A}\Big),\qquad I_{B,out} = \frac{I_{C,out}}{\beta}.$$
        **Collector.** The current *into* the collector is $-I_{C,out}$. Its change, to first order:
        $$i_c = -\Big(\frac{\partial I_{C,out}}{\partial V_{EB}}v_{eb} + \frac{\partial I_{C,out}}{\partial V_{EC}}v_{ec}\Big) = -\Big(\frac{I_C}{V_T}v_{eb} + \frac{1}{r_o}v_{ec}\Big).$$
        Now $v_{eb} = -v_{be}$ and $v_{ec} = -v_{ce}$, so the minus signs cancel:
        $$i_c = g_mv_{be} + \frac{v_{ce}}{r_o},\qquad g_m = \frac{|I_C|}{V_T},\ r_o = \frac{V_A}{|I_C|}.$$
        **Base.** The current *into* the base is $-I_{B,out}$, so $i_b = -\dfrac{I_B}{V_T}v_{eb} = \dfrac{v_{be}}{r_\pi}$, with $r_\pi = \beta/g_m$.

        These are **exactly** the NPN's equations. The same circuit realizes them: $r_\pi$ from base to emitter with $v_\pi = v_b - v_e$ ($+$ at the base), $g_mv_\pi$ from collector to emitter, $r_o$ across it.

        !!key One model for NPN and PNP
          $$i_b = \frac{v_\pi}{r_\pi},\qquad i_c = g_mv_\pi + \frac{v_{ce}}{r_o},\qquad v_\pi = v_b - v_e$$
          with $g_m$, $r_\pi$, $r_o$ computed from the magnitude of the bias current. Never flip the arrow.
      `),
      RF(md`
        ### Check it: a PNP common emitter

        Emitter at $V_{CC}$, the input on the base, $R_C$ from the collector to ground. Physically: base up, $V_{EB}$ down, less current out of the collector, less drop across $R_C$, the output falls: **inverting**.

        [[fig:p]]

        In the model (drawn here the PNP's way up, emitter on top at incremental ground): $v_\pi = v_{in}$, the source pulls $g_mv_\pi$ from the collector node up toward the emitter, so the collector node must be fed from ground through $R_C$: $v_{out} = -g_mv_{in}R_C$. **$A_v = -g_mR_C$, exactly the NPN result** ✓, and the sign agrees with the physical story ✓.
      `, { p: { fig: row([[pnpCE, 'a PNP common emitter'], [pnpMdl, 'its small-signal circuit']]), cap: 'The PNP stage and its model: the same hybrid-$\\pi$, rotated so the emitter is on top. The $g_mv_\\pi$ arrow still points from collector to emitter.' } }),
      R(md`
        ### What it means, and how to recognize it

        A small-signal circuit cannot tell an NPN from a PNP: both are "a transconductance from $v_{be}$ to the collector current, $r_\pi$ at the base, $r_o$ at the collector". The differences live entirely in the DC bias (which way the currents flow, where the emitter sits), and that is Chapter 6's business.

        When you replace a PNP by its model, keep the model's labels attached to the right terminals: $r_\pi$ between **B** and **E** with $+$ at B, the source from **C** to **E**. If the PNP is drawn upside down, draw the model upside down too (as above), rather than flipping anything.

        ### Worked example

        A PNP common emitter at $|I_C| = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 4\kO$, $r_o$ ignored. $g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $A_v = -g_mR_C = -80$. With a $5\kO$ source resistance: $v_\pi = v_s\cdot5/(5 + 5)$ and $A_v = -40$. With $R_E = 500\,\Omega$ unbypassed between the emitter and $V_{CC}$ (and $|I_C| = 1\,\text{mA}$, $R_C = 5\kO$): the T model gives $-\alpha R_C/(r_e + R_E) = -0.990\times5000/524.75 = -9.43$. Every formula is the NPN's.

        !!mistake Common mistakes
          - Reversing the $g_mv_\pi$ arrow for a PNP. Then every PNP gain comes out with the wrong sign.
          - Defining $v_\pi$ as $v_e - v_b$ for a PNP while keeping the arrow: the same error.
          - Using a negative $I_C$ in $g_m$. The parameters use the magnitude: $g_m = |I_C|/V_T$.
          - Thinking a PNP common emitter does not invert. It does: the model is the same.
      `),
      Q(md`In the small-signal model of a PNP, which way does the controlled source $g_mv_\pi$ point?`,
        ['From collector to emitter, exactly as for an NPN, with $v_\\pi = v_b - v_e$', 'From emitter to collector, because PNP current flows into the emitter', 'It depends on whether the PNP is drawn upside down', 'There is no controlled source in a PNP model'], 0,
        [null, 'That is the DC current direction. The model describes changes, and with $v_\\pi = v_b - v_e$ the equations are identical to the NPN\'s.', 'Drawing orientation cannot change the physics; rotate the model with the drawing.', 'A PNP amplifies the same way an NPN does.'],
        md`$i_c$ (into the collector) $= g_mv_{be}$ for both. The DC current direction is a bias matter, not a model matter.`),
      Q(md`For a PNP biased at $|I_C| = 2\,\text{mA}$, what is $g_m$?`,
        ['$80\\,\\text{mS}$', '$-80\\,\\text{mS}$', '$40\\,\\text{mS}$', '$12.5\\,\\Omega$'], 0,
        [null, '$g_m$ uses the magnitude of the current; it is positive for both devices.', 'That is for $1\\,\\text{mA}$.', 'That is $1/g_m$, a resistance.'],
        md`$g_m = |I_C|/V_T = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS}$.`),
      Q(md`Does a PNP common emitter (emitter at $V_{CC}$, $R_C$ to ground, input on the base) invert?`,
        ['Yes: $A_v = -g_mR_C$, as for an NPN', 'No: PNP currents flow the other way, so it is non-inverting', 'Only if $\\beta$ is large', 'Only with an emitter resistor'], 0,
        [null, 'Base up reduces $V_{EB}$, less current flows out of the collector into $R_C$, so the output falls: inverting.', '$\\beta$ affects only $r_\\pi$.', 'An emitter resistor reduces the gain but does not change its sign.'],
        md`Physically and in the model: base up, less collector current into $R_C$, output down. $A_v = -g_mR_C$.`),
      P({
        id: 'bk07-pnp-ce', title: 'A PNP common emitter',
        q: md`A PNP common emitter at $|I_C| = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 4\kO$ ($r_o$ ignored). Find $g_m$, $r_\pi$ and $A_v$.`,
        fig: pnpCE,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 20 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'A_v', unit: '', ans: -80, traps: [{ v: 80, msg: 'The PNP common emitter inverts too: same model, same sign.' }] }],
        sol: md`$g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $A_v = -g_mR_C = -80$.`,
      }),
      P({
        id: 'bk07-pnp-rs', title: 'With a source resistance',
        q: md`The same PNP stage ($|I_C| = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 4\kO$) is driven through $R_S = 5\kO$. Find $v_{out}/v_s$.`,
        parts: [{ lbl: 'v_{out}/v_s', unit: '', ans: -40 }],
        sol: md`$v_\pi = v_s\,r_\pi/(r_\pi + R_S) = v_s/2$, so $v_{out}/v_s = -80/2 = -40$.`,
      }),
      P({
        id: 'bk07-pnp-deg', title: 'A degenerated PNP stage',
        q: md`A PNP at $|I_C| = 1\,\text{mA}$, $\beta = 100$, with $R_E = 500\,\Omega$ (unbypassed) from the emitter to $V_{CC}$ and $R_C = 5\kO$ from the collector to ground, input on the base. Find $A_v$.`,
        parts: [{ lbl: 'A_v', unit: '', ans: -9.43396, accept: [-5000 / 525] }],
        hints: [md`Same T-model formula as the NPN: $-\alpha R_C/(r_e + R_E)$.`],
        sol: md`$r_e = 0.990/40\,\text{mS} = 24.75\,\Omega$; $A_v = -\dfrac{0.990\times5000}{524.75} = -9.43$.`,
      }),
      P({
        id: 'bk07-pnp-fol', title: 'A PNP emitter follower',
        q: md`A PNP follower: $R_E = 2\kO$ from the emitter (the output) to $V_{CC}$, the collector grounded, the input on the base, $|I_C| = 0.5\,\text{mA}$, $\beta = 100$. Find $v_{out}/v_{in}$.`,
        parts: [{ lbl: 'v_{out}/v_{in}', unit: '', ans: 0.975845, tol: { rel: 0.003 }, traps: [{ v: -0.975845, msg: 'A follower does not invert, PNP or NPN.' }] }],
        hints: [md`$R_E/(R_E + r_e)$.`],
        sol: md`$r_e = 0.990/20\,\text{mS} = 49.5\,\Omega$; $v_{out}/v_{in} = 2000/2049.5 = 0.976$. Same as an NPN follower: $V_{CC}$ is ground for signals, so $R_E$ goes from the emitter to ground in the model.`,
      }),
      P({
        id: 'bk07-pnp-sym', title: 'The PNP gain, typed',
        q: md`Type the gain of the PNP common emitter of the first problem (input on the base, emitter at $V_{CC}$, $R_C$ to ground, $r_o$ ignored). Use \`gm\` and \`RC\`.`,
        parts: [ex('-gm*RC', ['gm', 'RC'], 'A_v', { exact: true, free: true })],
        sol: md`$A_v = -g_mR_C$: the NPN result, sign included.`,
      }),
      R(md`
        ### Drill: PNP stages

        DC with the PNP's flipped currents, then the unchanged small-signal model.
      `),
      G('bk_pnpgain', { need: 4 }),
    ],
  });

  // ================================================================== 7.7 the dictionary
  const mosMdl = [['term', [1, 0], { n: 'G', side: 'l' }], ['vlab', [1, 0.35], [1, 1.65], { n: 'v_{gs}' }], ['w', [1, 2], [4.2, 2]],
    ['G', [3, 0], [3, 2], { n: 'g_mv_{gs}', side: 'l' }], ['w', [3, 0], [4.2, 0]], ['R', [4.2, 0], [4.2, 2], { n: 'r_{ds}' }],
    ['w', [3, 0], [3, -0.5]], ['term', [3, -0.5], { n: 'D', side: 'r' }], ['w', [2.2, 2], [2.2, 2.5]], ['term', [2.2, 2.5], { n: 'S', side: 'r' }]];
  const collTest = [['npn', [1, 1]], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: '\\downarrow R_X', side: 'r' }]];

  L({
    id: 'bk07-dict', title: 'MOSFET ↔ BJT: the dictionary', ref: 'Lectures 23–24',
    steps: [
      R(md`
        ### The question

        Exam 2 trained you on MOSFETs; Exam 3 adds BJTs and circuits that mix the two. Most of what you learned carries over word for word. Some of it changes, always for the same reason. This section is the translation table, with the rule that tells you which results change and how.
      `),
      RF(md`
        ### The physical picture: same job, different mechanism, one structural difference

        Both devices are voltage-controlled current sources with a large output resistance. They differ in *how* the control works (a capacitor's charge versus a barrier's height), which changes the numbers ($g_m$, $V_{GS}$ against $V_{BE}$). They differ structurally in **one** place: **the base draws current and the gate does not.** In the models that is the single extra resistor $r_\pi$.

        [[fig:m]]
      `, { m: { fig: row([[mosMdl, 'MOSFET: the gate is open'], [hpV, 'BJT: $r_\\pi$ from base to emitter']]), cap: 'The two small-signal models. Remove $r_\\pi$ (let $\\beta\\to\\infty$) and the BJT model becomes the MOSFET model.' } }),
      R(md`
        ### The dictionary

        | | MOSFET (Exam 2) | BJT (Exam 3) | why |
        |---|---|---|---|
        | terminals | gate, drain, source | base, collector, emitter | control, output, common |
        | amplifier region | saturation | forward active | the names cross ([Section 6.3](#/l/bk06-regions)) |
        | law | $\tfrac12\mu C_{ox}\tfrac WLV_{ov}^2$ | $I_Se^{V_{BE}/V_T}$ | capacitor charge vs barrier height |
        | control voltage | $V_{GS} = V_{TN} + V_{ov}$, depends on size and current | $V_{BE}\approx0.7\,\text{V}$, almost fixed | the logarithm squashes current ratios |
        | DC input current | 0 | $I_B = I_C/\beta$ | back-injection and recombination |
        | $g_m$ | $2I_D/V_{ov}$ | $I_C/V_T$ | $V_T = 25\,\text{mV}$ vs $V_{ov}/2\approx100\,\text{mV}$ |
        | $g_m$ at $1\,\text{mA}$ | $10\,\text{mS}$ ($V_{ov} = 0.2\,\text{V}$) | $40\,\text{mS}$ | |
        | input resistance | gate: $\infty$ | base: $r_\pi = \beta/g_m$ | the base current |
        | output resistance | $r_{ds} = 1/(\lambda I_D)$ | $r_o = V_A/I_C$ | $1/\lambda\leftrightarrow V_A$ |
        | intrinsic gain | $g_mr_{ds} = 2/(\lambda V_{ov})$, about 100 | $g_mr_o = V_A/V_T$, about 4000 | |
        | into the low terminal | source: $1/g_m$ | emitter: $r_e = r_\pi/(\beta + 1)\approx1/g_m$ | |
        | the size knob | $W/L$ sets $g_m$ at a given current | area sets $I_S$ only; $g_m$ is fixed by $I_C$ | |
        | linear input range | about $V_{ov}$ | about $V_T$ | ([Section 7.1](#/l/bk07-gm)) |
        | stage names | common source, common gate, source follower | common emitter, common base, emitter follower | |
      `),
      RF(md`
        ### The derivation: the translation rule

        **Rule 1.** If a MOSFET result never used the fact that the gate draws no current, it carries over unchanged with $g_m\to I_C/V_T$ and $r_{ds}\to r_o$. Examples: the common-source gain $-g_m(R_D\parallel r_{ds})$ becomes $-g_m(R_C\parallel r_o)$; a drain looks like $r_{ds}$, a collector (base and emitter held) like $r_o$.

        **Rule 2.** If it did use it, the base current changes the answer, through $r_\pi$ and factors of $(\beta + 1)$. The cleanest example is the resistance looking into a collector with a resistor $R_E$ under the emitter and the base held.

        [[fig:c]]

        For the MOSFET twin you derived $r_{ds} + R_S + g_mr_{ds}R_S$ ([Chapter 3](#/l/bk03-degen)). Redo it for the BJT with a test source $v_t$ at the collector, drawing $i_t$:
        1. $i_t$ comes out of the emitter and must leave the emitter node. The base is held at ground, so from the emitter node **two** paths lead to ground: $R_E$, *and $r_\pi$ (to the grounded base)*. That is the new part: for the MOSFET the second path was the gate's open circuit. So $v_e = i_t(R_E\parallel r_\pi)$.
        2. $v_\pi = v_b - v_e = -i_t(R_E\parallel r_\pi)$.
        3. KCL at the collector: $i_t = g_mv_\pi + (v_t - v_e)/r_o$. Solve for $v_t$:
        $$v_t = i_t\big[r_o + (R_E\parallel r_\pi) + g_mr_o(R_E\parallel r_\pi)\big].$$
        **The MOSFET formula with $R_S\to R_E\parallel r_\pi$.** The base current gave the emitter a second path to ground.
      `, { c: { fig: collTest, cap: 'The resistance looking into a collector with $R_E$ under the emitter and the base held: the twin of a degenerated drain.' } }),
      R(md`
        ### Check it: the $\beta\to\infty$ test

        Every BJT formula must turn into its MOSFET twin when $\beta\to\infty$ ($r_\pi\to\infty$). Here: $R_E\parallel r_\pi\to R_E$, and the collector resistance becomes $r_o + R_E + g_mr_oR_E$ ✓. Use this test on any formula you are unsure of.

        **Numbers** ($g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 100\kO$, $R_E = 1\kO$): the correct BJT result is $r_o + 0.714\kO + 40\,\text{mS}\times100\kO\times0.714\kO = 2.96\,\text{M}\Omega$. Translating blindly with $R_E$ instead of $R_E\parallel r_\pi$ gives $4.10\,\text{M}\Omega$, 39% too high. (No matter how large $R_E$ gets, $R_E\parallel r_\pi < r_\pi$, so the BJT result never exceeds about $(1 + g_mr_\pi)r_o = (\beta + 1)r_o$: the "$\beta r_o$ ceiling" of [Chapter 8](#/l/bk08-collector).)

        ### What it means

        The two devices are cousins: one model with one optional resistor. When the base current does not matter (outputs, collectors, transconductances), think MOSFET with a bigger $g_m$. When it does (inputs, anything that looks *through* the base), add $r_\pi$, and expect $(\beta + 1)$ to multiply what hangs under an emitter seen from the base, and to divide what hangs on a base seen from the emitter.

        ### How to recognize it

        Ask of every formula: *does a current flow into the control terminal here?* If the control terminal is driven or held through a resistance, or a resistance hangs between the control terminal and the common terminal, the BJT version picks up $r_\pi$.
      `),
      R(md`
        ### Worked example: one stage, both devices

        A degenerated stage at $1\,\text{mA}$ with $R_C = 5\kO$ and $R_E = 500\,\Omega$ ($r_o$ ignored).
        - **MOSFET formula** with the BJT's $g_m = 40\,\text{mS}$: $A_v = -g_mR_C/(1 + g_mR_E) = -200/21 = -9.52$.
        - **BJT, exact** (Lecture 24, or the T model): $A_v = -\dfrac{g_mR_C}{1 + g_mR_E(\beta + 1)/\beta} = -\dfrac{200}{1 + 20\times1.01} = -9.43$ with $\beta = 100$.

        The $(\beta + 1)/\beta$ is the base current's 1% correction. A real MOSFET at $1\,\text{mA}$ and $V_{ov} = 0.2\,\text{V}$ would have $g_m = 10\,\text{mS}$ and $A_v = -50/6 = -8.33$: degeneration makes the two devices nearly equal, because the gain approaches $-R_C/R_E$ for both.

        !!mistake Common mistakes
          - Writing $\infty$ for an input resistance at a base.
          - Copying a MOSFET formula with $R_S\to R_E$ where the base current matters (collector resistance, emitter-side resistances): use $R_E\parallel r_\pi$, or the $(\beta + 1)$ rules.
          - Using $2I/V_{ov}$ for $g_m$, or $1/(\lambda I)$ with $V_A$.
          - Calling forward active "saturation".
      `),
      Q(md`Which MOSFET result carries over to the BJT **unchanged** (with $g_m\to I_C/V_T$, $r_{ds}\to r_o$)?`,
        ['The common-source gain $-g_m(R_D\\parallel r_{ds})$', 'The input resistance at the gate, $\\infty$', 'The source-degenerated drain resistance $r_{ds} + R_S + g_mr_{ds}R_S$', 'The input resistance of a degenerated gate, $\\infty$'], 0,
        [null, 'A base draws current: $r_\\pi$.', 'Here the base current matters: $R_S$ becomes $R_E\\parallel r_\\pi$.', 'The base gives $r_\\pi + (\\beta + 1)R_E$.'],
        md`The common-emitter gain does not involve the base current (the source drives the base directly), so it is the CS formula: $-g_m(R_C\parallel r_o)$.`),
      Q(md`Letting $\beta\to\infty$ in any BJT small-signal result should give`,
        ['the MOSFET twin of that result, with $g_m = I_C/V_T$', 'zero', 'infinity', 'nothing useful: $\\beta$ is always finite'], 0,
        [null, 'Most results have finite limits.', 'Only for results that depend on $r_\\pi$ directly, like a base input resistance.', 'It is the best quick check of a formula.'],
        md`$r_\pi\to\infty$ removes the base current: the BJT model becomes the MOSFET model.`),
      Q(md`At the same current, which has the larger intrinsic gain, and why?`,
        ['The BJT: $V_A/V_T$ is in the thousands, because $g_m/I = 1/V_T$ is large', 'The MOSFET: $r_{ds}$ is larger than $r_o$', 'They are equal', 'The BJT, because $\\beta$ is large'], 0,
        [null, 'Output resistances are comparable; the difference is in $g_m$ per amp.', 'BJT about 4000, MOSFET about 100 (typical numbers).', '$\\beta$ is not in $g_mr_o = V_A/V_T$.'],
        md`$g_mr_o = V_A/V_T$ against $g_mr_{ds} = 2/(\lambda V_{ov})$. The large $g_m$ per amp of the BJT is the difference.`),
      P({
        id: 'bk07-dict-num', title: 'Side by side at 0.5 mA',
        q: md`At $0.5\,\text{mA}$, compare a MOSFET ($V_{ov} = 0.2\,\text{V}$, $\lambda = 0.05\,\text{V}^{-1}$) with a BJT ($\beta = 100$, $V_A = 50\,\text{V}$): find both $g_m$, the BJT's $r_\pi$, both output resistances and both intrinsic gains.`,
        parts: [{ lbl: 'g_{m,MOS}', unit: 'mS', ans: 5 }, { lbl: 'g_{m,BJT}', unit: 'mS', ans: 20 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'r_{ds}', unit: 'kΩ', ans: 40 }, { lbl: 'r_o', unit: 'kΩ', ans: 100 },
          { lbl: 'g_mr_{ds}', unit: '', ans: 200 }, { lbl: 'g_mr_o', unit: '', ans: 2000 }],
        sol: md`MOSFET: $g_m = 2(0.5)/0.2 = 5\,\text{mS}$, $r_{ds} = 1/(0.05\times0.5\,\text{mA}) = 40\kO$, $g_mr_{ds} = 200$. BJT: $g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = 100\kO$, $g_mr_o = 2000$. (The gate's input resistance is $\infty$; the base's is $r_\pi$.)`,
      }),
      P({
        id: 'bk07-dict-coll', title: 'Translate the degenerated drain',
        q: md`Type the resistance looking into a collector with $R_E$ from the emitter to ground and the base held at incremental ground. Use \`ro\`, \`gm\`, \`rpi\`, \`RE\` (and \`beta\` if you like; $r_\pi = \beta/g_m$ is built in).`,
        fig: collTest,
        parts: [ex('ro + RE*rpi/(RE + rpi) + gm*ro*RE*rpi/(RE + rpi)', ['ro', 'gm', 'rpi', 'beta', 'RE'], 'R_X')],
        hints: [md`The MOSFET answer with $R_S\to R_E\parallel r_\pi$: the emitter node has $r_\pi$ to the held base as a second path to ground.`],
        sol: md`$R_X = r_o + (R_E\parallel r_\pi) + g_mr_o(R_E\parallel r_\pi)$ (typing \`ro + (RE||rpi) + gm*ro*(RE||rpi)\` works). Derived above with a test source.`,
      }),
      P({
        id: 'bk07-dict-collnum', title: 'How wrong is the blind translation?',
        q: md`With $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 100\kO$ and $R_E = 1\kO$, find the collector resistance correctly, and with the blind MOSFET translation ($R_E$ in place of $R_E\parallel r_\pi$).`,
        parts: [{ lbl: 'R_X\\ \\text{(correct)}', unit: 'MΩ', ans: 2.95786 }, { lbl: 'R_X\\ \\text{(blind)}', unit: 'MΩ', ans: 4.101 }],
        sol: md`$R_E\parallel r_\pi = 0.714\kO$, so $R_X = 100\kO + 0.714\kO + (40\,\text{mS})(100\kO)(0.714\kO) = 2.958\,\text{M}\Omega$. Blind: $100 + 1 + 4000 = 4101\kO = 4.10\,\text{M}\Omega$, 39% too high.`,
      }),
      P({
        id: 'bk07-dict-in', title: 'Translate the degenerated input',
        q: md`The input resistance at a gate with $R_S$ under the source is $\infty$. Type the BJT twin: the resistance looking into a base with $R_E$ under the emitter ($r_o$ ignored). Use \`rpi\`, \`beta\`, \`RE\` (or \`gm\`).`,
        parts: [ex('rpi + (beta + 1)*RE', ['rpi', 'beta', 'gm', 'RE'], 'R_{in}')],
        sol: md`$R_{in} = r_\pi + (\beta + 1)R_E = (\beta + 1)(r_e + R_E)$: the base current flows through $r_\pi$, and $(\beta + 1)$ times it through $R_E$ ([Chapter 8](#/l/bk08-base) derives it with a test source).`,
      }),
      P({
        id: 'bk07-dict-deg', title: 'One formula, two devices',
        q: md`A degenerated stage at $1\,\text{mA}$: $R_C = 5\kO$, $R_E = 500\,\Omega$, $r_o$ ignored. Find the BJT gain exactly ($\beta = 100$), and the value the MOSFET formula $-g_mR_C/(1 + g_mR_E)$ gives with the BJT's $g_m$.`,
        parts: [{ lbl: 'A_v\\ \\text{(BJT)}', unit: '', ans: -9.43396, tol: { rel: 0.004 } }, { lbl: 'A_v\\ \\text{(MOS formula)}', unit: '', ans: -9.52381, tol: { rel: 0.004 } }],
        sol: md`BJT: $-\dfrac{200}{1 + 20\times1.01} = -9.434$. MOSFET formula: $-200/21 = -9.524$. They differ by the base current's $(\beta + 1)/\beta$, 1%.`,
      }),
      P({
        id: 'bk07-dict-fol', title: 'Follower twins',
        q: md`A follower with $R_E = 100\,\Omega$ at $1\,\text{mA}$. Find the BJT gain ($\beta = 100$) and the MOSFET-style value $R/(R + 1/g_m)$ with the same $g_m = 40\,\text{mS}$.`,
        parts: [{ lbl: 'A_v\\ \\text{(BJT)}', unit: '', ans: 0.801587, tol: { rel: 0.002 } }, { lbl: 'A_v\\ \\text{(MOS form)}', unit: '', ans: 0.8, tol: { rel: 0.002 } }],
        sol: md`BJT: $R_E/(R_E + r_e)$ with $r_e = 24.75\,\Omega$: $100/124.75 = 0.8016$. MOSFET form: $100/125 = 0.8$. With $r_e = \alpha/g_m$ instead of $1/g_m$ the two differ only through $\alpha$.`,
      }),
      R(md`
        ### Drill: translate

        A MOSFET result; pick its BJT twin. Then a few BJT-against-MOSFET transconductance comparisons.
      `),
      G('bk_twin', { need: 5, pool: ['bk_twin', 'bk_twin', 'bk_gmmos'] }),
    ],
  });

  // ================================================================== Chapter 7 problems
  const ex1Amp = [['rail', [3, -1.2], { n: '12\\,\\text{V}' }], ['w', [1.6, -1.2], [3, -1.2]],
    ['R', [1.6, -1.2], [1.6, 1], { n: 'R_1', s: '56\\,\\text{k}\\Omega' }], ['R', [1.6, 1], [1.6, 2.6], { n: 'R_2', s: '15\\,\\text{k}\\Omega' }], ['gnd', [1.6, 2.6]],
    ['w', [1.6, 1], [2, 1]], ['R', [3, -1.2], [3, 0], { n: 'R_C', s: '5.6\\,\\text{k}\\Omega' }], ['npn', [3, 1]],
    ['R', [3, 2], [3, 3], { n: 'R_{E1}', s: '220\\,\\Omega', side: 'l' }], ['R', [3, 3], [3, 4.2], { n: 'R_{E2}', s: '1\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [3, 4.2]],
    ['w', [3, 3], [3.8, 3]], ['C', [3.8, 3], [3.8, 4.2], { n: 'C_E' }], ['w', [3.8, 4.2], [3, 4.2]],
    ['C', [0.5, 1], [1.6, 1], { n: 'C_1' }], ['R', [-0.8, 1], [0.5, 1], { n: 'R_S', s: '600\\,\\Omega' }], ['Vac', [-0.8, 1], [-0.8, 2.2], { n: 'v_s', side: 'l' }], ['gnd', [-0.8, 2.2]],
    ['w', [3, 0], [3.5, 0]], ['C', [3.5, 0], [4.6, 0], { n: 'C_2' }], ['R', [4.6, 0], [4.6, 1.4], { n: 'R_L', s: '10\\,\\text{k}\\Omega' }], ['gnd', [4.6, 1.4]], ['w', [4.6, 0], [5.1, 0]], ['term', [5.1, 0], { n: 'v_{out}' }]];
  // a PNP amplifier: divider bias, R_E (bypassed) on top, R_C to ground, coupling capacitors
  const ex2Amp = [['rail', [3, -1.4], { n: '10\\,\\text{V}' }], ['w', [1.6, -1.4], [3.8, -1.4]],
    ['R', [1.6, -1.4], [1.6, 1], { n: 'R_1', s: '22\\,\\text{k}\\Omega', side: 'l' }], ['R', [1.6, 1], [1.6, 2.6], { n: 'R_2', s: '47\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [1.6, 2.6]],
    ['w', [1.6, 1], [2, 1]], ['pnp', [3, 1]], ['R', [3, -1.4], [3, 0], { n: 'R_E', s: '1.5\\,\\text{k}\\Omega', side: 'l' }], ['C', [3.8, -1.4], [3.8, 0], { n: 'C_E' }], ['w', [3.8, 0], [3, 0]],
    ['R', [3, 2], [3, 3.2], { n: 'R_C', s: '3.3\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [3, 3.2]],
    ['C', [0.5, 1], [1.6, 1], { n: 'C_1' }], ['R', [-0.8, 1], [0.5, 1], { n: 'R_S', s: '1\\,\\text{k}\\Omega' }], ['Vac', [-0.8, 1], [-0.8, 2.2], { n: 'v_s', side: 'l' }], ['gnd', [-0.8, 2.2]],
    ['w', [3, 2], [3.5, 2]], ['C', [3.5, 2], [4.6, 2], { n: 'C_2', side: 'b' }], ['R', [4.6, 2], [4.6, 3.4], { n: 'R_L', s: '6.8\\,\\text{k}\\Omega' }], ['gnd', [4.6, 3.4]], ['w', [4.6, 2], [5.1, 2]], ['term', [5.1, 2], { n: 'v_{out}' }]];
  const cascSig = [['rail', [2.8, -2.2], { n: '12\\,\\text{V}' }], ['w', [2, -2.2], [3.6, -2.2]],
    ['R', [2, -2.2], [2, 0], { n: 'R_{C1}', s: '6.8\\,\\text{k}\\Omega', side: 'l' }], ['R', [3.6, -2.2], [3.6, -1], { n: 'R_{C2}', s: '1.5\\,\\text{k}\\Omega' }],
    ['npn', [2, 1], { n: 'Q_1' }], ['R', [-0.2, 1], [1, 1], { n: 'R_B', s: '10\\,\\text{k}\\Omega' }], ['Vac', [-0.2, 1], [-0.2, 2], { n: 'v_s', side: 'l' }], ['V', [-0.2, 2], [-0.2, 3.2], { n: 'V_{BB}', s: '1.7\\,\\text{V}', side: 'l' }], ['gnd', [-0.2, 3.2]],
    ['R', [2, 2], [2, 3.2], { n: 'R_{E1}', s: '1\\,\\text{k}\\Omega' }], ['gnd', [2, 3.2]],
    ['w', [2, 0], [2.6, 0]], ['npn', [3.6, 0], { n: 'Q_2' }], ['R', [3.6, 1], [3.6, 2.4], { n: 'R_{E2}', s: '2.2\\,\\text{k}\\Omega' }], ['gnd', [3.6, 2.4]],
    ['w', [3.6, -1], [4.3, -1]], ['term', [4.3, -1], { n: 'v_{out}' }]];

  L({
    id: 'bk07-problems', title: 'Chapter 7 problems', kind: 'review', ref: 'Lectures 23–24',
    steps: [
      RF(md`
        ### Chapter 7 summary

        | Result | Why it is true | Section |
        |---|---|---|
        | $g_m = I_C/V_T$ ($40\,\text{mS}$ per mA) | the slope of the exponential: $1\,\text{mV}$ is $1/25$ of $V_T$, so 4% more current | [7.1](#/l/bk07-gm) |
        | small means $v_{be}\ll2V_T$ (a few mV) | the second-order term over the first is $v_{be}/(2V_T)$ | [7.1](#/l/bk07-gm) |
        | $r_\pi = \beta/g_m = V_T/I_B$ | the base–emitter junction is a diode carrying $I_B$ | [7.2](#/l/bk07-rpi) |
        | $r_o = V_A/I_C$; $g_mr_o = V_A/V_T$ | the Early effect: $\partial i_C/\partial v_{CE} = I_C/V_A$ | [7.3](#/l/bk07-ro) |
        | hybrid-$\pi$: $r_\pi$; $g_mv_\pi = \beta i_b$; $r_o$ | three small-signal facts, three elements | [7.4](#/l/bk07-hybrid) |
        | common emitter $A_v = -g_m(R_C\parallel r_o)\approx-V_{R_C}/V_T$ | KCL at the collector | [7.4](#/l/bk07-hybrid) |
        | T model: $r_e = \alpha/g_m\approx1/g_m$, source $\alpha i_e$ | $i_e = v_\pi(\beta + 1)/r_\pi$; same terminal currents | [7.5](#/l/bk07-tmodel) |
        | $-\alpha R_C/(r_e + R_E)$; $R_E/(R_E + r_e + R_S/(\beta + 1))$; $\alpha R_C/(r_e + R_S)$ | the T model: KVL through $r_e$ | [7.5](#/l/bk07-tmodel) |
        | the PNP uses the same model | $v_{eb} = -v_{be}$ cancels the flipped current directions | [7.6](#/l/bk07-pnpmodel) |
        | MOSFET ↔ BJT: same result unless the base current matters; $\beta\to\infty$ check | $r_\pi$ is the only structural difference | [7.7](#/l/bk07-dict) |

        [[fig:m]]

        !!method Every small-signal problem
          DC first ($I_C$, check the region) → $g_m$, $r_\pi$, $r_o$ → kill the DC (supplies and big capacitors to ground, current sources open) → replace each BJT by its model (hybrid-$\pi$, or T when an emitter resistor or emitter input is involved) → KCL/KVL or $-G_MR_{out}$ → sanity: sign, limits, the $V_{R_C}/V_T$ or $R_C/R_E$ estimate.
      `, { m: { fig: row([[hpV, 'hybrid-$\\pi$'], [tMod, 'T']]), cap: 'The two models of Chapter 7 (for NPN and PNP alike).' } }),
      P({
        id: 'bk07-x-par', title: '1. Parameters from the emitter current',
        q: md`A forward-active BJT carries $I_E = 1.01\,\text{mA}$; $\beta = 100$, $V_A = 75\,\text{V}$. Find $g_m$, $r_\pi$ and $r_o$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 }, { lbl: 'r_o', unit: 'kΩ', ans: 75 }],
        sol: md`$I_C = \alpha I_E = 1\,\text{mA}$; $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 75\kO$.`,
      }),
      P({
        id: 'bk07-x-ib', title: '2. From the base current',
        q: md`A BJT with $\beta = 125$ draws $I_B = 8\,\mu\text{A}$. Find $I_C$ and $r_\pi$.`,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 3.125 }],
        sol: md`$I_C = 1\,\text{mA}$; $r_\pi = V_T/I_B = 25\,\text{mV}/8\,\mu\text{A} = 3.125\kO$ ($= 125/40\,\text{mS}$ ✓).`,
      }),
      P({
        id: 'bk07-x-lin', title: '3. A 3 mV step',
        q: md`At $I_C = 1\,\text{mA}$, a step $v_{be} = 3\,\text{mV}$. Find $i_c$ from $g_m$ and from the exponential.`,
        parts: [{ lbl: 'i_c\\ (g_m)', unit: 'µA', ans: 120 }, { lbl: 'i_c\\ \\text{(exact)}', unit: 'µA', ans: 127.497, tol: { rel: 0.004 } }],
        sol: md`$g_mv_{be} = 40\,\text{mS}\times3\,\text{mV} = 120\,\mu\text{A}$; exact $1\,\text{mA}(e^{0.12} - 1) = 127.5\,\mu\text{A}$: 6% more ($v_{be}/(2V_T) = 6\%$).`,
      }),
      P({
        id: 'bk07-x-mos', title: '4. The current a g_m costs',
        q: md`For $g_m = 20\,\text{mS}$, what current does a BJT need, and what does a MOSFET at $V_{ov} = 0.3\,\text{V}$ need?`,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.5 }, { lbl: 'I_D', unit: 'mA', ans: 3 }],
        sol: md`$I_C = g_mV_T = 0.5\,\text{mA}$; $I_D = g_mV_{ov}/2 = 3\,\text{mA}$: six times more.`,
      }),
      P({
        id: 'bk07-x-ce', title: '5. A loaded common emitter',
        q: md`A common emitter at $I_C = 1.5\,\text{mA}$ ($\beta = 100$, $V_A = 60\,\text{V}$) has $R_C = 3.3\kO$ and a $3.3\kO$ load through a large coupling capacitor; input on the base, emitter grounded. Find $g_m$, $r_o$ and $A_v$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 60 }, { lbl: 'r_o', unit: 'kΩ', ans: 40 }, { lbl: 'A_v', unit: '', ans: -95.078 }],
        sol: md`$g_m = 60\,\text{mS}$, $r_o = 40\kO$; $R_C\parallel R_L\parallel r_o = 1.65\parallel40 = 1.585\kO$; $A_v = -60\,\text{mS}\times1.585\kO = -95.1$.`,
      }),
      P({
        id: 'bk07-x-cers', title: '6. With a source resistance',
        q: md`A common emitter at $I_C = 0.8\,\text{mA}$, $\beta = 80$, $R_C = 6.8\kO$ ($r_o$ ignored), driven through $R_S = 2\kO$. Find $r_\pi$ and $v_{out}/v_s$.`,
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 }, { lbl: 'v_{out}/v_s', unit: '', ans: -120.889 }],
        sol: md`$g_m = 32\,\text{mS}$, $r_\pi = 2.5\kO$; $A_v = -32\,\text{mS}\times6.8\kO\times\dfrac{2.5}{4.5} = -217.6\times0.5556 = -120.9$.`,
      }),
      P({
        id: 'bk07-x-active', title: '7. An active load',
        q: md`An NPN common emitter ($V_A = 120\,\text{V}$) with a PNP current-source load ($V_A = 60\,\text{V}$), both at $0.25\,\text{mA}$. Find $A_v$.`,
        parts: [{ lbl: 'A_v', unit: '', ans: -1600 }],
        sol: md`$g_m = 10\,\text{mS}$; $r_{o1} = 480\kO$, $r_{o2} = 240\kO$, parallel $160\kO$; $A_v = -1600$.`,
      }),
      P({
        id: 'bk07-x-re', title: '8. r_e at low and high current',
        q: md`Find $r_e = \alpha/g_m$ at $0.1\,\text{mA}$ and at $5\,\text{mA}$ ($\beta = 100$).`,
        parts: [{ lbl: 'r_e\\ (0.1\\,\\text{mA})', unit: 'Ω', ans: 247.525, accept: [250] }, { lbl: 'r_e\\ (5\\,\\text{mA})', unit: 'Ω', ans: 4.9505, accept: [5] }],
        sol: md`$r_e\approx25\,\Omega/I_C(\text{mA})$: $247.5\,\Omega$ and $4.95\,\Omega$ (with $\alpha = 0.990$).`,
      }),
      P({
        id: 'bk07-x-deg', title: '9. Degenerated common emitter',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 120$, $R_C = 12\kO$, $R_E = 1.2\kO$ unbypassed, $r_o$ ignored. Find $A_v$ and the input resistance at the base.`,
        parts: [{ lbl: 'A_v', unit: '', ans: -9.52381, accept: [-12000 / 1250] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 151.2 }],
        sol: md`$r_e = (120/121)/20\,\text{mS} = 49.59\,\Omega$. $A_v = -\dfrac{0.9917\times12\kO}{49.59 + 1200\,\Omega} = -9.524$. $R_{in} = 121\times1249.6\,\Omega = 151.2\kO$.`,
      }),
      P({
        id: 'bk07-x-fol', title: '10. Emitter follower',
        q: md`A follower at $I_C = 2\,\text{mA}$, $\beta = 100$, $R_E = 470\,\Omega$, driven through $R_S = 1\kO$. Find $v_{out}/v_s$ and the output resistance at the emitter (including $R_E$).`,
        parts: [{ lbl: 'v_{out}/v_s', unit: '', ans: 0.954747, tol: { rel: 0.003 } }, { lbl: 'R_{out}', unit: 'Ω', ans: 21.2691 }],
        sol: md`$r_e = 12.38\,\Omega$, $R_S/(\beta + 1) = 9.90\,\Omega$. Gain $= 470/(470 + 12.38 + 9.90) = 0.9547$. $R_{out} = 470\parallel22.28 = 21.27\,\Omega$.`,
      }),
      P({
        id: 'bk07-x-cb', title: '11. Common base',
        q: md`A common base at $I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 4.7\kO$, driven at the emitter by an ideal source ($r_o$ ignored). Find $A_v$ and $R_{in}$.`,
        parts: [{ lbl: 'A_v', unit: '', ans: 188 }, { lbl: 'R_{in}', unit: 'Ω', ans: 24.7525, accept: [25] }],
        sol: md`$A_v = \alpha R_C/r_e = g_mR_C = 40\,\text{mS}\times4.7\kO = 188$, non-inverting. $R_{in} = r_e = 24.75\,\Omega$.`,
      }),
      P({
        id: 'bk07-x-pnp', title: '12. A degenerated PNP',
        q: md`A PNP common emitter at $|I_C| = 0.8\,\text{mA}$, $\beta = 80$, with $R_E = 330\,\Omega$ unbypassed and $R_C = 4.7\kO$. Find $A_v$.`,
        parts: [{ lbl: 'A_v', unit: '', ans: -12.8635, accept: [-4700 / (31.25 + 330)] }],
        sol: md`$r_e = (80/81)/32\,\text{mS} = 30.86\,\Omega$; $A_v = -\dfrac{0.9877\times4700}{30.86 + 330} = -12.86$. Same formula as an NPN.`,
      }),
      P({
        id: 'bk07-x-sym1', title: '13. The follower, typed',
        q: md`Type the gain $v_{out}/v_s$ of an emitter follower with emitter resistor $R_E$ and source resistance $R_S$ ($r_o$ ignored). Use \`RE\`, \`RS\`, \`rpi\`, \`beta\` (\`gm\` allowed).`,
        parts: [ex('(beta + 1)*RE/(RS + rpi + (beta + 1)*RE)', ['RE', 'RS', 'rpi', 'beta', 'gm'], 'A_v', { ranges: { RS: [2e4, 2e5], RE: [100, 1000] } })],
        sol: md`KVL: $v_s = i_b(R_S + r_\pi) + (\beta + 1)i_bR_E$, $v_{out} = (\beta + 1)i_bR_E$, so $A_v = \dfrac{(\beta + 1)R_E}{R_S + r_\pi + (\beta + 1)R_E} = \dfrac{R_E}{R_E + r_e + R_S/(\beta + 1)}$.`,
      }),
      P({
        id: 'bk07-x-sym2', title: '14. The common base, typed',
        q: md`Type the gain of a common base driven at the emitter through $R_S$, with $R_C$ in the collector ($r_o$ ignored). Use \`gm\`, \`beta\`, \`rpi\`, \`RC\`, \`RS\`.`,
        parts: [ex('beta*RC/(rpi + (beta + 1)*RS)', ['gm', 'beta', 'rpi', 'RC', 'RS'], 'A_v')],
        sol: md`$A_v = \dfrac{\alpha R_C}{r_e + R_S}$; multiply top and bottom by $\beta + 1$: $\dfrac{\beta R_C}{r_\pi + (\beta + 1)R_S}$. (Lecture 24 writes the same thing as $G_m = -1/((R_B + r_\pi)/\beta + (\beta + 1)R_E/\beta)$ with the roles named differently.)`,
      }),
      P({
        id: 'bk07-x-exam1', title: '15. A partly bypassed emitter (exam style)', big: true,
        q: md`$\beta = 120$, $r_o$ ignored, large capacitors. $C_E$ bypasses only $R_{E2}$. Find (a) $I_C$, (b) $g_m$ and $r_\pi$, (c) $R_{in}$ to the right of $R_S$, and (d) $A_v = v_{out}/v_s$.`,
        fig: ex1Amp,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1.38115 }, { lbl: 'g_m', unit: 'mS', ans: 55.2459 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.17211 },
          { lbl: 'R_{in}', unit: 'kΩ', ans: 8.38535, traps: [{ v: 1.83518, msg: 'That treats the whole emitter as grounded. Only $R_{E2}$ is bypassed: $R_{E1}$ stays in the signal path, so the base shows $r_\\pi + (\\beta + 1)R_{E1}$.' }] },
          { lbl: 'A_v', unit: '', ans: -13.9623, traps: [{ v: -149.455, msg: 'That ignores $R_{E1}$, as if the whole emitter resistance were bypassed.' }] }],
        hints: [md`DC: both $R_{E1}$ and $R_{E2}$ are in the emitter ($C_E$ open): $R_E = 1.22\kO$.`, md`Signal: $R_{E2}$ is shorted by $C_E$; $R_{E1} = 220\,\Omega$ remains. Base resistance $r_\pi + (\beta + 1)R_{E1}$; gain from the base $-\beta(R_C\parallel R_L)/(r_\pi + (\beta + 1)R_{E1})$.`],
        sol: md`
**(a) DC.** $V_{TH} = 12\times15/71 = 2.535\,\text{V}$, $R_{TH} = 56\parallel15 = 11.83\kO$, emitter resistance $1.22\kO$: $I_B = \dfrac{1.835}{11.83 + 121\times1.22}\,\text{mA} = 11.51\,\mu\text{A}$, $I_C = 1.381\,\text{mA}$. ($V_C = 4.27\,\text{V}\ge V_B = 2.40\,\text{V}$ ✓.)

**(b)** $g_m = 55.25\,\text{mS}$, $r_\pi = 120/55.25\,\text{mS} = 2.172\kO$.

**(c)** Into the base: $r_\pi + (\beta + 1)R_{E1} = 2.172 + 121\times0.22 = 28.79\kO$, in parallel with $R_1\parallel R_2 = 11.83\kO$: $R_{in} = 8.385\kO$.

**(d)** From the base: $-\dfrac{120\times(5.6\parallel10)}{28.79} = -\dfrac{120\times3.590}{28.79} = -14.96$; input divider $8.385/(8.385 + 0.6) = 0.9332$; $A_v = -13.96$.

Splitting $R_E$ this way lets the DC see $1.22\kO$ (a stable bias) while the signal sees only $220\,\Omega$ (a gain near $-R_C\parallel R_L/R_{E1} = -16$).`,
      }),
      P({
        id: 'bk07-x-exam2', title: '16. A PNP amplifier (exam style)', big: true,
        q: md`A PNP amplifier ($\beta = 100$, $r_o$ ignored, large capacitors; $C_E$ bypasses $R_E$). Find (a) $I_C$ and confirm the region, (b) $g_m$, (c) $R_{in}$ to the right of $R_S$, (d) $A_v = v_{out}/v_s$.`,
        fig: ex2Amp,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1.49467 }, { lbl: 'g_m', unit: 'mS', ans: 59.7867 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 1.50467 }, { lbl: 'A_v', unit: '', ans: -79.7989, traps: [{ v: 79.7989, msg: 'A PNP common emitter inverts: same model as the NPN.' }] }],
        hints: [md`PNP DC: $V_{TH} = 10\times47/69$, $R_{TH} = 22\parallel47$, $I_B = (V_{CC} - 0.7 - V_{TH})/(R_{TH} + (\beta + 1)R_E)$.`, md`Signal: the same hybrid-$\pi$ model; the emitter is grounded by $C_E$.`],
        sol: md`
**(a)** $V_{TH} = 6.812\,\text{V}$, $R_{TH} = 14.99\kO$. $I_B = \dfrac{10 - 0.7 - 6.812}{14.99 + 101\times1.5}\,\text{mA} = \dfrac{2.488}{166.5}\,\text{mA} = 14.95\,\mu\text{A}$, $I_C = 1.495\,\text{mA}$. $V_E = 10 - 1.510\times1.5 = 7.735\,\text{V}$, $V_B = 7.035\,\text{V}$, $V_C = 1.495\times3.3 = 4.932\,\text{V}\le V_B$ ✓ active.

**(b)** $g_m = 59.79\,\text{mS}$, $r_\pi = 1.673\kO$.

**(c)** $R_{in} = (22\parallel47)\parallel1.673 = 14.99\parallel1.673 = 1.505\kO$.

**(d)** $A_v = -59.79\,\text{mS}\times(3.3\parallel6.8)\kO\times\dfrac{1.505}{1.505 + 1} = -59.79\times2.222\times0.6007 = -79.8$.`,
      }),
      P({
        id: 'bk07-x-exam3', title: '17. Two stages (exam style)', big: true,
        q: md`The two-stage circuit of [Chapter 6, problem 13](#/l/bk06-problems), now with a small signal $v_s$ in series with $V_{BB}$ ($\beta = 100$, $r_o$ ignored). There it was found that $I_{C1} = 0.9009\,\text{mA}$ and $I_{C2} = 2.259\,\text{mA}$. Find (a) $g_{m1}$ and $g_{m2}$, (b) the resistance $R_{in2}$ looking into $Q_2$'s base, (c) the gain of the first stage $v_{c1}/v_{b1}$, (d) of the second stage $v_{out}/v_{c1}$, and (e) the overall $v_{out}/v_s$.`,
        fig: cascSig,
        parts: [{ lbl: 'g_{m1}', unit: 'mS', ans: 36.036 }, { lbl: 'g_{m2}', unit: 'mS', ans: 90.3733 }, { lbl: 'R_{in2}', unit: 'kΩ', ans: 223.307 },
          { lbl: 'v_{c1}/v_{b1}', unit: '', ans: -6.359, traps: [{ v: -6.55264, msg: 'That ignores the loading of $R_{C1}$ by $Q_2$\'s base: $R_{C1}\\parallel R_{in2}$.' }] },
          { lbl: 'v_{out}/v_{c1}', unit: '', ans: -0.671722 }, { lbl: 'v_{out}/v_s', unit: '', ans: 3.89605 }],
        hints: [md`$R_{in2} = r_{\pi2} + (\beta + 1)R_{E2}$; the first stage drives $R_{C1}\parallel R_{in2}$.`, md`Each stage: $-\alpha R_{load}/(r_e + R_E)$. The input divider: $R_B$ against $R_{in1} = (\beta + 1)(r_{e1} + R_{E1})$.`],
        sol: md`
**(a)** $g_{m1} = 36.04\,\text{mS}$ ($r_{e1} = 27.47\,\Omega$, $r_{\pi1} = 2.775\kO$); $g_{m2} = 90.37\,\text{mS}$ ($r_{e2} = 10.96\,\Omega$, $r_{\pi2} = 1.107\kO$).

**(b)** $R_{in2} = 1.107 + 101\times2.2 = 223.3\kO$.

**(c)** Stage 1 is a degenerated common emitter whose collector sees $R_{C1}\parallel R_{in2} = 6.8\parallel223.3 = 6.599\kO$: $\dfrac{v_{c1}}{v_{b1}} = -\dfrac{\beta(6.599)}{r_{\pi1} + 101\times1} = -\dfrac{100\times6.599}{103.78} = -6.359$.

**(d)** Stage 2: $-\dfrac{\beta R_{C2}}{r_{\pi2} + 101R_{E2}} = -\dfrac{100\times1.5}{223.3} = -0.6717$ (more emitter than collector resistance: a gain below 1).

**(e)** Input divider: $R_{in1} = r_{\pi1} + 101\times1 = 103.8\kO$, so $v_{b1}/v_s = 103.8/113.8 = 0.9121$. Overall: $0.9121\times(-6.359)\times(-0.6717) = +3.896$. Two inversions make it non-inverting.`,
      }),
      R(md`
        ### Mixed drill

        Every Chapter 7 skill, shuffled: parameters, linearity, $r_o$, common-emitter gains, quick T-model gains, PNP stages, the full exam chain, and MOSFET twins. Eight correct answers complete it.
      `),
      G('bk_gm', { need: 8, pool: ['bk_gm', 'bk_lin', 'bk_gmmos', 'bk_ro', 'bk_cegain', 'bk_cegain', 'bk_tgain', 'bk_tgain', 'bk_pnpgain', 'bk_full', 'bk_full', 'bk_twin'] }),
    ],
  });
})();

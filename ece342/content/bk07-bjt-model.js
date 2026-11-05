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
    const x0 = -0.6, loads = o.loads || ['r_o', 'R_C'];
    const e = [['Vac', [x0, 0.4], [x0, 2], { n: o.vin || 'v_{in}', side: 'l' }], ['w', [x0, 0.4], [x0, 0]]];
    e.push(o.RS ? ['R', [x0, 0], [1, 0], { n: 'R_S' }] : ['w', [x0, 0], [1, 0]]);
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
})();

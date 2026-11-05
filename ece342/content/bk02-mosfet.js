/* Book, Chapter 2 — The MOSFET, and where its small-signal model comes from.
   How the channel forms and carries current (the triode law derived from drift, pinch-off, the square law), PMOS,
   channel-length modulation and r_ds, g_m three ways, the small-signal model assembled and used once (a common-source
   gain), why PMOS has the same model, and the DC operating point (resistor bias, diode-connected devices, a mirror).
   Course parameters: μnCox = 100 µA/V², μpCox = 50 µA/V², V_TN = |V_TP| = 1 V. Every number was checked by an
   independent script (scratchpad A1/check_static.py, check_gens.py). Generators: js/gens-bk-a1.js. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk02', l);

  // ---------------------------------------------------------------- figure helpers (same as Chapter 1)
  const lab = (x, y, tex, a = 'c', cls = 'small') => {
    const w = 190, h = 56;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (a === 'l') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (a === 'r') { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (a === 't') { fy = y; ai = 'flex-start'; }
    if (a === 'b') { fy = y - h; ai = 'flex-end'; }
    return `<foreignObject x="${fx}" y="${fy}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">$${tex}$</span></div></foreignObject>`;
  };
  function plot(o, extra = []) {
    const W = o.w || 400, H = o.h || 250, ml = 46, mr = 18, mt = 16, mb = 38;
    const X = (x) => ml + (x - o.x[0]) / (o.x[1] - o.x[0]) * (W - ml - mr);
    const Y = (y) => H - mb - (y - o.y[0]) / (o.y[1] - o.y[0]) * (H - mt - mb);
    const add = extra.map((e) => (e.lab ? lab(X(e.lab[0]), Y(e.lab[1]), e.lab[2], e.lab[3] || 'c', e.cls || 'small')
      : `<path class="${e.cls || 'curve dash'}" d="M${X(e.line[0]).toFixed(1)},${Y(e.line[1]).toFixed(1)}L${X(e.line[2]).toFixed(1)},${Y(e.line[3]).toFixed(1)}"/>`)).join('');
    return Schem.plot(o).replace(/<\/svg>$/, `${add}</svg>`);
  }
  const row = (items) => DRAW.row(items).svg;

  // ---------------------------------------------------------------- the device, in cross-section
  // mode: 'off' (no channel), 'lin' (uniform channel, V_DS ≈ 0), 'tri' (tapered), 'sat' (pinched off near the drain)
  const xsec = (mode = 'lin', o = {}) => {
    const W = o.w || 360;
    const n = o.p ? 'p^+' : 'n^+';
    let s = `<svg class="schem" viewBox="0 0 460 262" width="${W}" role="img" aria-label="MOSFET cross-section">`;
    s += '<rect class="shade" x="20" y="92" width="420" height="140" rx="4"/>';
    s += '<rect class="fillbg" x="58" y="92" width="94" height="46" rx="12"/><rect class="fillbg" x="308" y="92" width="94" height="46" rx="12"/>';
    s += '<rect class="fillbg" x="152" y="80" width="156" height="12"/><rect class="fillbg" x="152" y="50" width="156" height="30"/>';
    if (mode === 'lin') s += '<path class="plane" d="M152,92H308V101H152Z"/>';
    if (mode === 'tri') s += '<path class="plane" d="M152,92H308V96L152,102Z"/>';
    if (mode === 'sat') s += '<path class="plane" d="M152,92H282L152,102Z"/>';
    s += '<path d="M105,92V24M230,50V24M355,92V24M230,232V248"/>';
    s += lab(105, 16, 'S', 'c', '') + lab(230, 16, 'G', 'c', '') + lab(355, 16, 'D', 'c', '') + lab(244, 248, 'B', 'l', '');
    s += lab(105, 115, n, 'c', '') + lab(355, 115, n, 'c', '') + lab(230, 65, '\\text{gate}', 'c', '') + lab(314, 70, '\\text{oxide}', 'l', '');
    s += lab(230, 212, o.p ? '\\text{n-type body}' : '\\text{p-type body}', 'c', '');
    if (o.dl) s += '<path class="dim" d="M152,160H282M152,154V166M282,154V166M282,160H308M308,154V166"/>' + lab(217, 172, 'L - \\Delta L', 't', '') + lab(296, 172, '\\Delta L', 't', '');
    else s += '<path class="dim" d="M152,160H308M152,154V166M308,154V166"/>' + lab(230, 172, 'L', 't');
    if (mode === 'off') s += lab(230, 128, '\\text{no channel}', 'c', '');
    if (mode === 'lin' || mode === 'tri') s += lab(230, 124, o.p ? '\\text{hole channel}' : '\\text{electron channel}', 'c', '');
    if (mode === 'sat') s += lab(268, 132, '\\text{pinch-off}', 'c', '') + '<path class="dim" d="M276,120L285,99"/>';
    return s + '</svg>';
  };
  // output curves: k = 1 mA/V², V_GS = 1.5 ... 3 V (λ = 0 here)
  const idOf = (vds, ov, k = 1, lam = 0) => (ov <= 0 ? 0 : (vds < ov ? k * (ov * vds - vds * vds / 2) : 0.5 * k * ov * ov) * (1 + lam * vds));
  const outPlot = () => plot({
    x: [0, 4.6], y: [0, 2.3], w: 460, h: 290, xl: 'V_{DS}\\ (\\text{V})', yl: 'I_D\\ (\\text{mA})', xt: [0, 1, 2, 3, 4], yt: [0, 0.5, 1, 1.5, 2],
    curves: [...[0.5, 1, 1.5, 2].map((ov) => ({ f: (v) => idOf(v, ov), to: 4 })), { f: (v) => 0.5 * v * v, to: 2.1, cls: 'dc dash' }],
  }, [
    { lab: [4.05, 2, 'V_{GS} = 3\\,\\text{V}', 'l'] }, { lab: [4.05, 1.125, '2.5\\,\\text{V}', 'l'] }, { lab: [4.05, 0.5, '2\\,\\text{V}', 'l'] }, { lab: [4.05, 0.125, '1.5\\,\\text{V}', 'l'] },
    { lab: [1.25, 2.12, 'V_{DS} = V_{ov}', 'r'] }, { lab: [0.45, 1.6, '\\text{triode}'] }, { lab: [3, 1.62, '\\text{saturation}'] },
  ]);
  const transPlot = () => plot({
    x: [0, 3.2], y: [0, 2.3], w: 400, h: 260, xl: 'V_{GS}\\ (\\text{V})', yl: 'I_D\\ (\\text{mA})', xt: [0, 1, 2, 3], yt: [0, 0.5, 1, 1.5, 2],
    curves: [{ f: (v) => (v > 1 ? 0.5 * (v - 1) * (v - 1) : 0), to: 3.1 }],
  }, [{ line: [1, 0, 1, 2.3], cls: 'grid' }, { lab: [1.05, 1.0, 'V_{TN}', 'l'] }, { lab: [2.15, 1.75, 'I_D = \\tfrac12k(V_{GS} - V_{TN})^2', 'r'] }]);
  const nm = (o = {}) => [['nmos', [1, 1], { n: o.n }], ['w', [1, 0], [1, -0.35]], ['w', [1, 2], [1, 2.35]], ['w', [0, 1], [-0.35, 1]],
    ['txt', [1.2, -0.3], '$D$', { a: 'l' }], ['txt', [1.2, 2.3], '$S$', { a: 'l' }], ['txt', [-0.45, 0.72], '$G$']];

  // ================================================================== 1. how a MOSFET works
  L({
    id: 'bk02-how', title: 'How a MOSFET works', ref: 'Exam 1 material, rebuilt',
    steps: [
      R(md`
        ### Chapter 2 at a glance

        Chapter 1 treated the transistor as a valve with a given curve. This chapter opens the valve. We build the MOSFET from its physics, derive its current, and then do to it exactly what Chapter 1 did to the diode: linearize around a bias point to get its **small-signal model**. Every resistance and gain on Exam 2 comes from that model.

        **What you will be able to do:**
        - Explain how the gate controls a channel of charge, and derive the triode and saturation (square-law) currents.
        - Handle the PMOS, with its upside-down voltages, without sign errors.
        - Derive $r_{ds} = 1/(\lambda I_D)$ from channel-length modulation, and $g_m$ in its three forms from the square law.
        - Assemble the small-signal model $i_d = g_mv_{gs} + v_{ds}/r_{ds}$, use it on a common-source amplifier, and show that a PMOS has the same model.
        - Find a DC operating point: resistor bias, diode-connected transistors, a current mirror, and the saturation check.

        **What you need first:** Chapter 1 (bias, slopes, the two pictures, the test source), and the idea of a capacitor: charge $Q = CV$.
      `),
      R(md`
        ### The question

        Exam 2's formula sheet gave two lines: $I_D = \tfrac12\mu_nC_{ox}\tfrac WL(V_{GS} - V_{TN})^2$ and $g_m = 2I_D/V_{ov}$. Where does the first one come from, why does the current stop depending on the drain voltage, and what are the conditions for it to hold? Every DC problem uses the square law and its saturation check; every small-signal parameter is a derivative of it.
      `),
      RF(md`
        ### The physical picture: a capacitor whose bottom plate is a wire

        A MOSFET (metal-oxide-semiconductor field-effect transistor) is built on a slab of lightly doped p-type silicon, the **body**. Two heavily doped n-type islands ($n^+$) are the **source** and the **drain**. Between them, on top, sits a very thin layer of insulating oxide and on top of that the **gate**. The gap between source and drain is the **channel length** $L$; the device's extent into the page is its **width** $W$.

        [[fig:xs]]

        **The gate is one plate of a capacitor.** The oxide is the dielectric, and the silicon surface under it is the other plate. Because the oxide is an insulator, **no DC current ever flows into the gate**. Hold that thought: it is why the gate is an open circuit in every model we draw.

        **Making the channel.** Put a positive voltage on the gate (relative to the source and body). First it pushes the p-type silicon's holes away from the surface. Above a certain **threshold voltage** $V_{TN}$ (in this course $1\,\text{V}$), it pulls enough electrons to the surface to form a thin n-type layer: the **inversion layer**, or **channel**. Now the two $n^+$ islands are joined by a conducting sheet of electrons.

        **How much charge.** Like any capacitor, every extra volt on the gate adds $C_{ox}$ of charge per unit area, where $C_{ox} = \varepsilon_{ox}/t_{ox}$ is the oxide capacitance per area. Only the voltage beyond threshold makes mobile electrons:
        $$Q_{ch}' = C_{ox}\,(V_{GS} - V_{TN})\qquad(\text{charge per unit area})$$
        This excess is the **overdrive**, $V_{ov} = V_{GS} - V_{TN}$.

        **Magnitudes.** A $10\,\text{nm}$ oxide gives $C_{ox}\approx3.5\,\text{fF}/\mu\text{m}^2$. At $V_{ov} = 0.2\,\text{V}$ that is about $4300$ electrons per square micrometre: a very thin sheet. With an electron mobility in the channel of about $290\,\text{cm}^2/\text{V·s}$, the product $\mu_nC_{ox}$ comes to the course's $100\,\mu\text{A/V}^2$.
      `, { xs: { svg: row([{ svg: xsec('off', { w: 400 }), cap: '$V_{GS} < V_{TN}$: no channel' }, { svg: xsec('lin', { w: 400 }), cap: '$V_{GS} > V_{TN}$, $V_{DS}\\approx0$: a uniform channel' }]), cap: 'An NMOS in cross-section. The gate, the oxide and the silicon surface form a capacitor. $W$ goes into the page.' } }),
      R(md`
        ### The derivation, part 1: current from drift (the triode law)

        Now apply a drain-source voltage $V_{DS}$. Electrons enter the channel at the source and drift to the drain, pushed by the field along the channel. Let $x$ run from the source ($x = 0$) to the drain ($x = L$), and let $V(x)$ be the channel's voltage at $x$, measured from the source: $V(0) = 0$, $V(L) = V_{DS}$.

        **Step 1: the local charge.** At position $x$ the gate-to-channel voltage is $V_{GS} - V(x)$, not $V_{GS}$, because the channel itself has risen to $V(x)$. So the local overdrive is $V_{ov} - V(x)$ and the channel charge per unit **length** (width $W$) is
        $$q(x) = W\,C_{ox}\,\big[V_{ov} - V(x)\big]$$

        **Step 2: the speed.** Electrons drift with a velocity proportional to the electric field, $v = \mu_nE$, with $E = dV/dx$ along the channel:
        $$v(x) = \mu_n\,\frac{dV}{dx}$$

        **Step 3: current is charge per length times speed.** In one second, the charge passing a point is the charge in the length the electrons travel in that second:
        $$I_D = q(x)\,v(x) = \mu_nC_{ox}W\,\big[V_{ov} - V(x)\big]\,\frac{dV}{dx}$$
        By KCL the same $I_D$ flows past every point $x$: where the channel is thinner, the electrons move faster.

        **Step 4: separate and integrate.** Multiply by $dx$ and integrate along the channel, $x$ from $0$ to $L$ and $V$ from $0$ to $V_{DS}$:
        $$\int_0^LI_D\,dx = \mu_nC_{ox}W\int_0^{V_{DS}}\big(V_{ov} - V\big)\,dV$$
        $$I_D\,L = \mu_nC_{ox}W\Big[V_{ov}V_{DS} - \tfrac12V_{DS}^2\Big]$$

        **Step 5: divide by $L$.**
        $$I_D = \mu_nC_{ox}\frac WL\Big[V_{ov}V_{DS} - \tfrac12V_{DS}^2\Big]\qquad(\text{triode})$$

        For small $V_{DS}$ the square term is negligible and $I_D\approx\mu_nC_{ox}\tfrac WLV_{ov}\,V_{DS}$: current proportional to voltage, a **resistor** $R_{on} = 1/(\mu_nC_{ox}\tfrac WLV_{ov})$ whose value the gate sets. With $\mu_nC_{ox}\tfrac WL = 1\,\text{mA/V}^2$ and $V_{ov} = 1\,\text{V}$, $R_{on} = 1\kO$: at $V_{DS} = 0.1\,\text{V}$ the exact law gives $95\,\mu\text{A}$, the resistor $100\,\mu\text{A}$.
      `),
      RF(md`
        ### The derivation, part 2: pinch-off and saturation

        **Step 6: the channel thins toward the drain.** The local overdrive $V_{ov} - V(x)$ is smallest at the drain end, where it is $V_{ov} - V_{DS}$. As $V_{DS}$ grows the channel tapers, and at $V_{DS} = V_{ov}$ its thickness at the drain end reaches zero: the channel is **pinched off**.

        **Step 7: the triode law peaks there.** Differentiate the triode law with respect to $V_{DS}$: $\dfrac{dI_D}{dV_{DS}} = \mu_nC_{ox}\tfrac WL(V_{ov} - V_{DS})$, which is zero at $V_{DS} = V_{ov}$. The value at the peak:
        $$I_D = \mu_nC_{ox}\frac WL\Big[V_{ov}^2 - \tfrac12V_{ov}^2\Big] = \tfrac12\mu_nC_{ox}\frac WL\,V_{ov}^2$$

        **Step 8: beyond pinch-off the current stays put.** For $V_{DS} > V_{ov}$ the channel still runs from the source to a point just short of the drain, where its voltage is $V_{ov}$; the extra $V_{DS} - V_{ov}$ drops across the short depleted gap, whose strong field sweeps every arriving electron into the drain. The channel itself looks the same as at pinch-off, so it carries the same current. Think of a waterfall: the flow over the edge is set by the river upstream, not by how far the water falls.

        [[fig:xs]]

        !!key The square law (saturation)
          $$I_D = \tfrac12\mu_nC_{ox}\frac WL\,(V_{GS} - V_{TN})^2\qquad\text{for } V_{GS} > V_{TN}\text{ and } V_{DS}\ge V_{GS} - V_{TN}$$
          In saturation the current is set by $V_{GS}$ alone: the MOSFET is a **voltage-controlled current source**. That is what makes it an amplifier.
      `, { xs: { svg: row([{ svg: xsec('tri', { w: 400 }), cap: '$0 < V_{DS} < V_{ov}$: triode, a tapered channel' }, { svg: xsec('sat', { w: 400 }), cap: '$V_{DS}\\ge V_{ov}$: saturation, pinched off at the drain' }]), cap: 'The channel tapers as $V_{DS}$ rises, and pinches off at $V_{DS} = V_{ov}$.' } }),
      RF(md`
        ### The curves

        The **output characteristics** plot $I_D$ against $V_{DS}$, one curve per $V_{GS}$. Here $\mu_nC_{ox}\tfrac WL = 1\,\text{mA/V}^2$ (so $W/L = 10$). Each curve rises along its triode parabola and flattens at $V_{DS} = V_{ov}$; the dashed parabola $I_D = \tfrac12(1\,\text{mA/V}^2)V_{DS}^2$ joins the corners and divides triode (left) from saturation (right).

        [[fig:out]]

        The **transfer characteristic** plots $I_D$ against $V_{GS}$ in saturation: nothing below $V_{TN}$, then the parabola. Chapter 1's amplifier lived on exactly this curve.

        [[fig:tr]]
      `, { out: { svg: outPlot(), cap: 'Output curves for $V_{GS} = 1.5, 2, 2.5, 3\\,\\text{V}$: saturation currents $0.125, 0.5, 1.125, 2\\,\\text{mA}$.' },
        tr: { svg: transPlot(), cap: 'Transfer curve in saturation ($k = \\mu_nC_{ox}W/L = 1\\,\\text{mA/V}^2$).' } }),
      R(md`
        ### The model: three regions

        | Region | Condition (NMOS) | $I_D$ | Behaves like |
        |---|---|---|---|
        | Cutoff | $V_{GS} < V_{TN}$ | $0$ | an open switch |
        | Triode | $V_{GS} > V_{TN}$ and $V_{DS} < V_{ov}$ | $\mu_nC_{ox}\tfrac WL\big[V_{ov}V_{DS} - \tfrac12V_{DS}^2\big]$ | a resistor set by $V_{GS}$ (small $V_{DS}$) |
        | Saturation | $V_{GS} > V_{TN}$ and $V_{DS}\ge V_{ov}$ | $\tfrac12\mu_nC_{ox}\tfrac WL\,V_{ov}^2$ | a current source set by $V_{GS}$ |

        **The saturation check in node voltages.** $V_{DS}\ge V_{GS} - V_{TN}$ is the same as $V_D - V_S\ge V_G - V_S - V_{TN}$, so
        $$V_D\ge V_G - V_{TN}$$
        The drain may sit below the gate, but by no more than one threshold. That is the quickest check on an exam.

        **Shorthand.** This book writes $k = \mu_nC_{ox}\tfrac WL$ for a given transistor, so $I_D = \tfrac12kV_{ov}^2$. Problems give sizes as multiples of a unit device, "$1X = 500/1$": a $1X$ NMOS has $k = (100\,\mu\text{A/V}^2)(500) = 50\,\text{mA/V}^2$, and at $V_{ov} = 0.2\,\text{V}$ it carries $\tfrac12(50)(0.04) = 1\,\text{mA}$. A $2X$ device is two $1X$ devices side by side: twice the current at the same $V_{GS}$.

        We ignore the body effect throughout (the course does): the body is tied to the source, or we pretend it is.
      `),
      R(md`
        ### Check it

        - **Continuity.** At $V_{DS} = V_{ov}$ the triode law gives $\tfrac12kV_{ov}^2$, the saturation value: the curves join without a jump. ✓
        - **Units.** $\mu_nC_{ox}$ in $\text{A/V}^2$, times volts squared: amperes. ✓
        - **Size.** $I_D\propto W/L$: a wider channel carries more current side by side; a longer one has more "resistance" to cross. ✓
        - **Cutoff.** At $V_{ov} = 0$ there is no channel charge and no current. ✓

        ### What it means

        The gate never carries current; it only *sets* things. In triode it sets a resistance; in saturation it sets a current. An amplifier wants the second: a current that depends on the input voltage and not on the output voltage, so that a resistor on the drain can turn that current into an output voltage (Chapter 1's circuit).

        ### How to recognize it

        On an exam, a transistor's region is decided by two comparisons: $V_{GS}$ against $V_{TN}$ (on or off) and $V_D$ against $V_G - V_{TN}$ (saturation or triode). Assume saturation, solve, then check; if the check fails, redo it with the triode law.
      `),
      R(md`
        ### Worked example: assume, solve, check

        An NMOS with $W/L = 10$ ($k = 1\,\text{mA/V}^2$) has its source grounded, its gate at $2\,\text{V}$, and a resistor $R_D$ from its drain to $V_{DD} = 5\,\text{V}$. Find $I_D$ and $V_D$ for $R_D = 4\kO$ and for $R_D = 9\kO$.

        **$R_D = 4\kO$.** $V_{ov} = 1\,\text{V}$. Assume saturation: $I_D = \tfrac12(1)(1)^2 = 0.5\,\text{mA}$. Then $V_D = 5 - (0.5\,\text{mA})(4\kO) = 3\,\text{V}$. Check: $V_D = 3\ge V_G - V_{TN} = 1\,\text{V}$. ✓ Saturated.

        **$R_D = 9\kO$.** Assume saturation again: $0.5\,\text{mA}$ would put the drain at $5 - 4.5 = 0.5\,\text{V}$, below $1\,\text{V}$. ✗ The assumption fails, so the transistor is in triode. Use the triode law with $V_{DS} = V_D$, and KCL at the drain:
        $$\frac{5 - V_D}{9\kO} = (1\,\text{mA/V}^2)\Big[(1)V_D - \tfrac12V_D^2\Big]$$
        Multiply by $9\kO$: $5 - V_D = 9V_D - 4.5V_D^2$, so $4.5V_D^2 - 10V_D + 5 = 0$ and
        $$V_D = \frac{10 - \sqrt{100 - 90}}{9} = \frac{10 - 3.162}{9} = 0.760\,\text{V}$$
        (The other root, $1.46\,\text{V}$, is above $V_{ov}$, which contradicts triode.) Then $I_D = (5 - 0.760)/9\kO = 0.471\,\text{mA}$, a little less than the saturation value.

        **The boundary:** saturation holds as long as $V_D\ge1\,\text{V}$, i.e. $R_D\le(5 - 1)/0.5\,\text{mA} = 8\kO$.
      `),
      R(md`
        !!mistake Common mistakes
          **Checking saturation with $V_D\ge V_G$.** The test is $V_D\ge V_G - V_{TN}$: the drain may be up to one threshold *below* the gate.

          **Forgetting the $\tfrac12$** in the square law (or adding one to the triode law).

          **Using the threshold as the thermal voltage.** $V_{TN} = 1\,\text{V}$ (MOSFET threshold) and $V_T = 25\,\text{mV}$ (diode/BJT thermal voltage) are unrelated.

          **Thinking the gate draws current.** It is a capacitor plate: at DC, nothing flows in.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`What carries the current in an NMOS channel?`,
        ['Electrons, pulled to the surface by the positive gate', 'Holes from the p-type body', 'Current flowing in through the gate', 'Ions moving through the oxide'], 0,
        [null, md`The body's holes are pushed *away* by a positive gate; the channel is an inversion layer of electrons.`, md`The oxide is an insulator: no DC current flows into the gate.`, md`Nothing moves through the oxide; it only transmits the field.`],
        md`A positive gate (beyond $V_{TN}$) inverts the surface: a thin layer of electrons joins the $n^+$ source and drain.`),
      Q(md`Why does $I_D$ stop growing with $V_{DS}$ once $V_{DS} > V_{ov}$?`,
        ['The channel is pinched off at the drain end; the extra voltage drops across the short depleted gap, and the channel (which sets the current) stays the same.', 'The gate current saturates.', 'The electrons run out of the source.', 'The channel gets wider and its resistance drops.'], 0,
        [null, md`There is no gate current at all.`, md`The source is an $n^+$ region with an enormous supply of electrons.`, md`The channel gets *thinner* toward the drain as $V_{DS}$ rises, not wider.`],
        md`Past pinch-off the channel ends a hair short of the drain, at voltage $V_{ov}$; the rest of $V_{DS}$ falls across the gap. The current is set by the channel: a waterfall's flow is set upstream.`),
      Q(md`In saturation, at fixed $V_{GS}$, what happens to $I_D$ if $W$ is doubled?`,
        ['It doubles', 'It halves', 'It is unchanged', 'It quadruples'], 0,
        [null, md`Doubling $L$ would halve it. $W$ is in the numerator.`, md`$I_D\propto W/L$.`, md`Only $V_{ov}$ is squared.`],
        md`$I_D = \tfrac12\mu_nC_{ox}(W/L)V_{ov}^2$: two transistors side by side carry twice the current.`),
      P({
        id: 'bk02-how-id', title: 'The square law with a unit device',
        q: md`$1X = 500/1$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. In saturation, find $I_D$ for a $1X$ device at $V_{GS} = 1.2\,\text{V}$ and at $V_{GS} = 1.4\,\text{V}$, and for a $4X$ device at $1.2\,\text{V}$.`,
        parts: [
          { lbl: '1X,\\ 1.2\\,\\text{V}', unit: 'mA', ans: 1, traps: [{ v: 2, msg: 'Missing the $\\tfrac12$.' }] },
          { lbl: '1X,\\ 1.4\\,\\text{V}', unit: 'mA', ans: 4, traps: [{ v: 2, msg: 'The overdrive doubled, so the current goes up by $2^2 = 4$.' }] },
          { lbl: '4X,\\ 1.2\\,\\text{V}', unit: 'mA', ans: 4 },
        ],
        hints: [md`$k = (100\,\mu\text{A/V}^2)(500) = 50\,\text{mA/V}^2$, so $I_D = (25\,\text{mA/V}^2)V_{ov}^2$.`],
        sol: md`
1. $1X$: $\tfrac12k = 25\,\text{mA/V}^2$. At $V_{ov} = 0.2\,\text{V}$: $25\times0.04 = 1\,\text{mA}$.
2. At $V_{ov} = 0.4\,\text{V}$: $25\times0.16 = 4\,\text{mA}$ (twice the overdrive, four times the current).
3. $4X$ at $V_{ov} = 0.2\,\text{V}$: four $1X$ devices side by side: $4\,\text{mA}$.`,
      }),
      P({
        id: 'bk02-how-region', title: 'Which region?',
        q: md`An NMOS with $W/L = 20$ has $V_G = 2\,\text{V}$, $V_S = 0.5\,\text{V}$, $V_D = 0.8\,\text{V}$. Which region is it in, and what is $I_D$?`,
        figHtml: Schem.render([['nmos', [1, 1]], ['w', [1, 0], [1, -0.35]], ['w', [1, 2], [1, 2.35]], ['w', [0, 1], [-0.35, 1]], ['txt', [1.25, -0.3], '$D:\\ V_D = 0.8\\,\\text{V}$', { a: 'l' }], ['txt', [1.25, 2.3], '$S:\\ V_S = 0.5\\,\\text{V}$', { a: 'l' }], ['txt', [-0.45, 1.3], '$G:\\ V_G = 2\\,\\text{V}$', { a: 'r' }]]),
        parts: [
          { lbl: 'Region', mc: ['Triode', 'Saturation', 'Cutoff'], a: 0, why: [null, md`Saturation needs $V_D\ge V_G - V_{TN} = 1\,\text{V}$; here $V_D = 0.8\,\text{V}$.`, md`$V_{GS} = 1.5\,\text{V} > V_{TN}$: it is on.`] },
          { lbl: 'I_D', unit: 'mA', ans: 0.21, traps: [{ v: 0.25, msg: 'That is the saturation current; the device is in triode.' }] },
        ],
        hints: [md`$V_{GS} = 1.5$, $V_{ov} = 0.5$, $V_{DS} = 0.3\,\text{V}$.`],
        sol: md`
1. $V_{GS} = 2 - 0.5 = 1.5\,\text{V} > 1$: on. $V_{ov} = 0.5\,\text{V}$; $V_{DS} = 0.3\,\text{V} < V_{ov}$: **triode** (equivalently $V_D = 0.8 < V_G - V_{TN} = 1$).
2. $k = (100\,\mu)(20) = 2\,\text{mA/V}^2$: $I_D = 2\,\text{mA/V}^2\,[0.5\times0.3 - \tfrac12(0.3)^2] = 2\,[0.15 - 0.045] = 0.21\,\text{mA}$.`,
      }),
      P({
        id: 'bk02-how-ron', title: 'A switch: the on-resistance',
        q: md`An NMOS switch with $W/L = 50$ has its gate at $3\,\text{V}$ and its source grounded. Find its small-$V_{DS}$ resistance $R_{on}$, and its current at $V_{DS} = 50\,\text{mV}$ from the full triode law.`,
        parts: [{ lbl: 'R_{on}', unit: 'Ω', ans: 100 }, { lbl: 'I_D', unit: 'mA', ans: 0.4938, traps: [{ v: 10, msg: 'That is the saturation current; at $50\\,\\text{mV}$ the device is deep in triode.' }] }],
        hints: [md`$R_{on} = 1/(kV_{ov})$ with $k = 5\,\text{mA/V}^2$, $V_{ov} = 2\,\text{V}$.`],
        sol: md`$R_{on} = 1/[(5\,\text{mA/V}^2)(2\,\text{V})] = 100\,\Omega$. Triode law: $5\,\text{mA/V}^2[2(0.05) - \tfrac12(0.05)^2] = 5[0.1 - 0.00125] = 0.494\,\text{mA}$, within $1.3\%$ of $V_{DS}/R_{on} = 0.5\,\text{mA}$.`,
      }),
      P({
        id: 'bk02-how-vgs', title: 'The gate voltage for a current',
        q: md`An NMOS with $W/L = 100$ must carry $0.5\,\text{mA}$ in saturation. Find $V_{ov}$, $V_{GS}$, and the smallest $V_{DS}$ that keeps it saturated.`,
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.3162 }, { lbl: 'V_{GS}', unit: 'V', ans: 1.3162 }, { lbl: 'V_{DS,min}', unit: 'V', ans: 0.3162 }],
        hints: [md`$\tfrac12k = 5\,\text{mA/V}^2$; $V_{ov} = \sqrt{I_D/(\tfrac12k)}$.`],
        sol: md`$V_{ov} = \sqrt{0.5/5} = \sqrt{0.1} = 0.316\,\text{V}$; $V_{GS} = 1.316\,\text{V}$; saturation needs $V_{DS}\ge V_{ov} = 0.316\,\text{V}$.`,
      }),
      P({
        id: 'bk02-how-exam', title: 'Exam style: saturated, then not',
        q: md`The worked example's circuit ($k = 1\,\text{mA/V}^2$, $V_G = 2\,\text{V}$, source grounded, $V_{DD} = 5\,\text{V}$). (a) The largest $R_D$ for saturation. (b) With $R_D = 9\kO$: $V_D$ and $I_D$ (triode). (c) With $R_D = 9\kO$, what is the transistor's small-$V_{DS}$ resistance $R_{on}$?`,
        fig: [['rail', [1, -1.2], { n: 'V_{DD} = 5\\,\\text{V}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['nmos', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1]], ['term', [-0.6, 1], { n: 'V_G = 2\\,\\text{V}', side: 'l' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'V_D' }]],
        parts: [{ lbl: '(a)\\ R_{D,max}', unit: 'kΩ', ans: 8, traps: [{ v: 10, msg: 'Saturation ends at $V_D = V_G - V_{TN} = 1\\,\\text{V}$, not at $0\\,\\text{V}$.' }] }, { lbl: '(b)\\ V_D', unit: 'V', ans: 0.7597 }, { lbl: '(b)\\ I_D', unit: 'mA', ans: 0.4711 }, { lbl: '(c)\\ R_{on}', unit: 'kΩ', ans: 1 }],
        hints: [md`(b) KCL: $(5 - V_D)/9\kO = k[V_{ov}V_D - \tfrac12V_D^2]$.`],
        sol: md`
**(a)** Saturated: $I_D = 0.5\,\text{mA}$; the edge is $V_D = 1\,\text{V}$, so $R_D = 4\,\text{V}/0.5\,\text{mA} = 8\kO$.

**(b)** $4.5V_D^2 - 10V_D + 5 = 0\Rightarrow V_D = (10 - \sqrt{10})/9 = 0.760\,\text{V}$; $I_D = 4.240/9\kO = 0.471\,\text{mA}$.

**(c)** $R_{on} = 1/(kV_{ov}) = 1/(1\,\text{mA/V}^2\times1\,\text{V}) = 1\kO$. (At $V_D = 0.76\,\text{V}$ the device is not deep in triode, so it is not exactly this resistor; $R_{on}$ describes the bottom of the curve.)`,
      }),
      G('bk_mos_region', { need: 4 }),
      G('bk_mos_sq', { need: 3 }),
    ],
  });

  // ================================================================== 2. PMOS
  const pm = () => [['pmos', [1, 1]], ['w', [1, 0], [1, -0.35]], ['w', [1, 2], [1, 2.35]], ['w', [0, 1], [-0.35, 1]],
    ['txt', [1.2, -0.3], '$S\\ (\\text{top})$', { a: 'l' }], ['txt', [1.2, 2.3], '$D$', { a: 'l' }], ['txt', [-0.45, 0.72], '$G$'], ['iarr', [1, 2.15], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }]];
  const pmosRD = (o = {}) => [
    ['rail', [1, -0.4], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }], ...(o.rs ? [['R', [1, -0.4], [1, 0.8], { n: 'R_S', s: o.rs }]] : [['w', [1, -0.4], [1, 0.8]]]),
    ['pmos', [1, 1.8]], ['w', [0, 1.8], [-0.6, 1.8]], ['term', [-0.6, 1.8], { n: o.vg ? `V_G = ${o.vg}` : 'V_G', side: 'l' }],
    ['R', [1, 2.8], [1, 4.2], { n: 'R_D', s: o.rd }], ['gnd', [1, 4.2]], ['w', [1, 2.8], [1.8, 2.8]], ['term', [1.8, 2.8], { n: 'V_D' }],
  ];

  L({
    id: 'bk02-pmos', title: 'PMOS: the same device upside down', ref: 'Exam 1 material, rebuilt',
    steps: [
      R(md`
        ### The question

        Half the transistors on every Exam 2 schematic are PMOS: the current-source loads at the top, the mirrors that copy current down from $V_{DD}$, half of every CMOS inverter. A PMOS obeys the same physics with every polarity reversed, and nearly every PMOS mistake is a sign mistake. This section sets up a way of writing PMOS equations in which **no negative numbers ever appear**.
      `),
      RF(md`
        ### The physical picture: flip every doping and every voltage

        Build the mirror image of the NMOS: an **n-type** body, two **$p^+$** islands for source and drain, the same oxide and gate. To form a channel we now need a layer of **holes** at the surface, so the gate must go **below** the source (and body) by more than a threshold magnitude $|V_{TP}|$ (in this course $1\,\text{V}$). The current is carried by holes, which flow from the source to the drain: conventional current flows **into the source and out of the drain**.

        [[fig:xs]]

        Because the body must stay reverse-biased against the $p^+$ islands, it is tied to the highest voltage, $V_{DD}$, and the source normally sits near $V_{DD}$ too. That is why a PMOS is drawn **upside down**: source on top, toward the supply, with the arrow pointing *into* the source; drain below.

        Holes drift more sluggishly than electrons, roughly half as fast for the same field. So the course's PMOS has $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, half of the NMOS's $100\,\mu\text{A/V}^2$: **a PMOS needs twice the $W/L$ to carry the same current.**
      `, { xs: { svg: row([{ svg: xsec('lin', { w: 400, p: true }), cap: 'A PMOS: $p^+$ source and drain in an n-type body; the gate below the source makes a hole channel.' }, { fig: pm(), cap: 'The symbol: source on top, arrow into the source; current flows out of the drain.' }]) } }),
      R(md`
        ### The model: write everything source-referenced

        For an NMOS everything is measured **from** the source: $V_{GS}$, $V_{DS}$, positive when the device is on. For a PMOS we measure everything **to** the source, so the same quantities come out positive:
        $$V_{SG} = V_S - V_G,\qquad V_{SD} = V_S - V_D,\qquad V_{ov} = V_{SG} - |V_{TP}|$$
        and $I_D$ is the current flowing **out of the drain** (from source to drain through the device).

        | Region | Condition (PMOS) | $I_D$ (source to drain) |
        |---|---|---|
        | Cutoff | $V_{SG} < \lvert V_{TP}\rvert$ | $0$ |
        | Triode | $V_{SG} > \lvert V_{TP}\rvert$ and $V_{SD} < V_{ov}$ | $\mu_pC_{ox}\tfrac WL\big[V_{ov}V_{SD} - \tfrac12V_{SD}^2\big]$ |
        | Saturation | $V_{SG} > \lvert V_{TP}\rvert$ and $V_{SD}\ge V_{ov}$ | $\tfrac12\mu_pC_{ox}\tfrac WL\,V_{ov}^2$ |

        Every formula is the NMOS formula with $GS\to SG$, $DS\to SD$ and $\mu_n\to\mu_p$.
      `),
      R(md`
        ### The derivation: why the swap is exact

        Take the NMOS law and feed it the PMOS's own (negative) voltages. A PMOS in saturation obeys $I_{DS} = -\tfrac12\mu_pC_{ox}\tfrac WL(V_{GS} - V_{TP})^2$, where $I_{DS}$ is the current flowing *into* the drain (negative here), $V_{GS} < 0$ and the threshold is $V_{TP} = -1\,\text{V}$.

        **Step 1: the square.** With $V_{GS} = -V_{SG}$ and $V_{TP} = -|V_{TP}|$:
        $$V_{GS} - V_{TP} = -V_{SG} + |V_{TP}| = -(V_{SG} - |V_{TP}|) = -V_{ov}$$
        Squaring removes the sign: $(V_{GS} - V_{TP})^2 = V_{ov}^2$.

        **Step 2: the current's direction.** The current *into* the drain is negative, so the current *out of* the drain is $I_D = -I_{DS} = \tfrac12\mu_pC_{ox}\tfrac WLV_{ov}^2$: positive, flowing source to drain.

        **Step 3: the saturation condition.** For the NMOS it was $V_{DS}\ge V_{GS} - V_{TN}$. With every voltage negated it becomes $-V_{SD}\le-V_{SG} + |V_{TP}|$ (the inequality flips when both sides change sign), that is
        $$V_{SD}\ge V_{SG} - |V_{TP}| = V_{ov}$$
        In node voltages, $V_S - V_D\ge V_S - V_G - |V_{TP}|$, so
        $$V_D\le V_G + |V_{TP}|$$
        **The drain may sit above the gate, but by no more than one threshold.** It is the NMOS rule turned upside down.

        !!key PMOS in one line
          $I_D = \tfrac12\mu_pC_{ox}\tfrac WL(V_{SG} - |V_{TP}|)^2$, flowing source $\to$ drain, valid while $V_D\le V_G + |V_{TP}|$. On means the gate is at least $|V_{TP}|$ **below** the source.
      `),
      R(md`
        ### Check it, and what it means

        - **Symmetry.** Turn the page upside down and negate every voltage: a PMOS circuit becomes an NMOS circuit, with $\mu_p$ in place of $\mu_n$. ✓
        - **Direction.** Raising a PMOS's gate *reduces* $V_{SG}$ and so *reduces* the current. A PMOS turns off when its gate goes up toward the source. ✓
        - **Numbers.** For the same current at the same overdrive, $W/L$ must double: a $1000/1$ PMOS matches a $500/1$ NMOS.

        ### How to recognize it

        A transistor with the arrow pointing **in**, drawn with its source at the top near $V_{DD}$. Write $V_{SG}$ (source minus gate) straight away; if it is under $1\,\text{V}$ the device is off. Check saturation with $V_D\le V_G + 1\,\text{V}$.
      `),
      RF(md`
        ### Worked example

        A PMOS with $W/L = 1000/1$ has its source at $V_{DD} = 5\,\text{V}$, its gate at $3.8\,\text{V}$, and a resistor $R_D = 2\kO$ from its drain to ground. Find $I_D$ and $V_D$, and check saturation.

        [[fig:c]]

        1. $V_{SG} = 5 - 3.8 = 1.2\,\text{V} > 1\,\text{V}$: on, with $V_{ov} = 0.2\,\text{V}$.
        2. $k_p = \mu_pC_{ox}\tfrac WL = (50\,\mu\text{A/V}^2)(1000) = 50\,\text{mA/V}^2$. Assume saturation: $I_D = \tfrac12(50)(0.2)^2 = 1\,\text{mA}$, flowing out of the drain, down through $R_D$.
        3. $V_D = (1\,\text{mA})(2\kO) = 2\,\text{V}$.
        4. Check: $V_D = 2\le V_G + 1 = 4.8\,\text{V}$. ✓ (Equivalently $V_{SD} = 3\,\text{V}\ge V_{ov} = 0.2\,\text{V}$.)
        5. The largest $R_D$ that keeps saturation puts $V_D$ at $4.8\,\text{V}$: $R_D\le4.8\,\text{V}/1\,\text{mA} = 4.8\kO$.
      `, { c: { fig: pmosRD({ vdd: '5\\,\\text{V}', vg: '3.8\\,\\text{V}', rd: '2\\,\\text{k}\\Omega' }), cap: 'A PMOS with its source on the supply and a drain resistor to ground.' } }),
      R(md`
        !!mistake Common mistakes
          **Using $V_{GS}$ and getting a negative number**, then squaring something with the wrong sign or comparing $-1.2$ with $+1$. Use $V_{SG}$ and $|V_{TP}|$: everything positive.

          **Checking PMOS saturation with the NMOS rule** ($V_D\ge V_G - 1$). For a PMOS it is $V_D\le V_G + 1$.

          **Putting the source at the bottom.** In a normal circuit the PMOS source is the terminal nearer $V_{DD}$ (top), and current comes **out** of the drain.

          **Forgetting the factor of two in mobility.** $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, not $100$.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`In a normal PMOS circuit, which terminal sits at the highest voltage, and which way does the current flow through the device?`,
        ['The source (toward $V_{DD}$); current flows from source to drain', 'The drain; current flows from drain to source', 'The gate; current flows into the gate', 'The source; current flows from drain to source'], 0,
        [null, md`That is an NMOS. In a PMOS the source is on top and current comes *out* of the drain.`, md`The gate never carries DC current; it sits *below* the source when the device is on.`, md`The source is right, but holes flow source $\to$ drain, so conventional current does too.`],
        md`The source is tied toward $V_{DD}$; the gate goes at least $|V_{TP}|$ below it; current flows source $\to$ drain and out of the drain.`),
      Q(md`What is the saturation condition for a PMOS, in node voltages?`,
        [md`$V_D\le V_G + |V_{TP}|$`, md`$V_D\ge V_G - |V_{TP}|$`, md`$V_D\le V_G - |V_{TP}|$`, md`$V_D\ge V_S$`], 0,
        [null, md`That is the NMOS rule. Negating every voltage flips the inequality.`, md`Wrong offset: the drain may be up to one threshold *above* the gate.`, md`The drain of a working PMOS is always at or below its source.`],
        md`$V_{SD}\ge V_{SG} - |V_{TP}|\iff V_S - V_D\ge V_S - V_G - |V_{TP}|\iff V_D\le V_G + |V_{TP}|$.`),
      Q(md`A PMOS's source is on $V_{DD}$. Its gate rises by $50\,\text{mV}$. What happens to the current flowing out of its drain?`,
        ['It decreases', 'It increases', 'It does not change', 'It reverses direction'], 0,
        [null, md`A higher gate means a *smaller* $V_{SG}$: less overdrive, less current.`, md`$I_D$ depends on $V_{SG}$, which just changed.`, md`A small change only nudges the current; it stays source $\to$ drain.`],
        md`$V_{SG}$ falls by $50\,\text{mV}$, so the overdrive and the current fall. This sign will matter in Section 2.6.`),
      P({
        id: 'bk02-pmos-id', title: 'PMOS current',
        q: md`A PMOS with $W/L = 200$ has $V_S = 3\,\text{V}$ and $V_G = 1.5\,\text{V}$, in saturation. Find $V_{SG}$, $V_{ov}$ and $I_D$.`,
        parts: [{ lbl: 'V_{SG}', unit: 'V', ans: 1.5 }, { lbl: 'V_{ov}', unit: 'V', ans: 0.5 }, { lbl: 'I_D', unit: 'mA', ans: 1.25, traps: [{ v: 2.5, msg: 'PMOS uses $\\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2$, half the NMOS value.' }] }],
        hints: [md`$k_p = (50\,\mu\text{A/V}^2)(200) = 10\,\text{mA/V}^2$.`],
        sol: md`$V_{SG} = 3 - 1.5 = 1.5\,\text{V}$, $V_{ov} = 0.5\,\text{V}$, $I_D = \tfrac12(10\,\text{mA/V}^2)(0.25) = 1.25\,\text{mA}$.`,
      }),
      P({
        id: 'bk02-pmos-rd', title: 'A PMOS with a drain resistor',
        q: md`$V_{DD} = 5\,\text{V}$ on the source, $V_G = 3.5\,\text{V}$, $W/L = 100$, $R_D = 4\kO$ to ground. Find $I_D$, $V_D$, and the largest $R_D$ for saturation.`,
        fig: pmosRD({ vdd: '5\\,\\text{V}', vg: '3.5\\,\\text{V}', rd: '4\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.625 }, { lbl: 'V_D', unit: 'V', ans: 2.5 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 7.2, traps: [{ v: 4, msg: 'The PMOS limit is $V_D\\le V_G + 1 = 4.5\\,\\text{V}$, not $V_G - 1$.' }] }],
        hints: [md`$k_p = 5\,\text{mA/V}^2$, $V_{ov} = 0.5\,\text{V}$.`, md`Saturation: $V_D\le V_G + 1\,\text{V}$.`],
        sol: md`$I_D = \tfrac12(5)(0.5)^2 = 0.625\,\text{mA}$; $V_D = 0.625\times4 = 2.5\,\text{V}\le4.5$ ✓. Largest $R_D$: $V_D = 4.5\,\text{V}$, so $R_D = 4.5/0.625 = 7.2\kO$.`,
      }),
      P({
        id: 'bk02-pmos-region', title: 'A PMOS in triode',
        q: md`A PMOS with $W/L = 10$ has $V_S = 5\,\text{V}$, $V_G = 3\,\text{V}$, $V_D = 4.5\,\text{V}$. Region and current?`,
        parts: [{ lbl: 'Region', mc: ['Triode', 'Saturation', 'Cutoff'], a: 0, why: [null, md`Saturation needs $V_D\le V_G + 1 = 4\,\text{V}$; here $V_D = 4.5\,\text{V}$.`, md`$V_{SG} = 2\,\text{V} > 1\,\text{V}$: on.`] }, { lbl: 'I_D', unit: 'mA', ans: 0.1875, traps: [{ v: 0.25, msg: 'That is the saturation current; this device is in triode.' }] }],
        hints: [md`$V_{SG} = 2$, $V_{ov} = 1$, $V_{SD} = 0.5\,\text{V}$; $k_p = 0.5\,\text{mA/V}^2$.`],
        sol: md`$V_{SD} = 0.5 < V_{ov} = 1$: triode. $I_D = (0.5\,\text{mA/V}^2)[1\times0.5 - \tfrac12(0.5)^2] = 0.5\times0.375 = 0.1875\,\text{mA}$.`,
      }),
      P({
        id: 'bk02-pmos-size', title: 'Size a PMOS',
        q: md`A PMOS must carry $0.2\,\text{mA}$ in saturation at $V_{SG} = 1.4\,\text{V}$. What $W/L$? What $W/L$ would an NMOS need at $V_{GS} = 1.4\,\text{V}$?`,
        parts: [{ lbl: '(W/L)_p', unit: '', ans: 50, traps: [{ v: 25, msg: 'Use $\\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2$.' }] }, { lbl: '(W/L)_n', unit: '', ans: 25 }],
        hints: [md`$W/L = 2I_D/(\mu C_{ox}V_{ov}^2)$ with $V_{ov} = 0.4\,\text{V}$.`],
        sol: md`PMOS: $\dfrac{2(0.2\,\text{mA})}{(50\,\mu)(0.16)} = 50$. NMOS: $\dfrac{0.4\,\text{mA}}{(100\,\mu)(0.16)} = 25$. Half, because electrons are about twice as mobile.`,
      }),
      P({
        id: 'bk02-pmos-exam', title: 'Exam style: a PMOS with a source resistor',
        q: md`$V_{DD} = 5\,\text{V}$; $R_S = 1\kO$ from $V_{DD}$ to the PMOS source; gate at $3\,\text{V}$; $W/L = 200$; $R_D = 3\kO$ from the drain to ground. Find (a) $V_{ov}$, (b) $I_D$, (c) $V_S$, (d) $V_D$, and (e) check saturation.`,
        fig: pmosRD({ vdd: '5\\,\\text{V}', vg: '3\\,\\text{V}', rd: '3\\,\\text{k}\\Omega', rs: '1\\,\\text{k}\\Omega' }),
        parts: [
          { lbl: '(a)\\ V_{ov}', unit: 'V', ans: 0.3583 }, { lbl: '(b)\\ I_D', unit: 'mA', ans: 0.6417, traps: [{ v: 5, msg: 'That ignores $R_S$: the source is no longer at $V_{DD}$.' }] },
          { lbl: '(c)\\ V_S', unit: 'V', ans: 4.358 }, { lbl: '(d)\\ V_D', unit: 'V', ans: 1.925 },
          { lbl: '(e)\\ Saturated?', mc: ['Yes: $V_D\\le V_G + 1 = 4\\,\\text{V}$', 'No'], a: 0, why: [null, md`$1.93\,\text{V}$ is well below $4\,\text{V}$.`] },
        ],
        hints: [md`$V_{SG} = (5 - I_DR_S) - 3$, so $V_{ov} = 1 - I_DR_S$, and $I_D = \tfrac12k_pV_{ov}^2$ with $\tfrac12k_p = 5\,\text{mA/V}^2$.`, md`Substituting: $V_{ov} = 1 - 5V_{ov}^2$ (with $R_S$ in k$\Omega$ and $I_D$ in mA).`],
        sol: md`
**(a)** $V_S = 5 - I_D(1\kO)$ and $V_{ov} = V_S - V_G - 1 = 1 - I_D(1\kO)$. With $I_D = 5V_{ov}^2$ (mA):
$$V_{ov} = 1 - 5V_{ov}^2\quad\Rightarrow\quad5V_{ov}^2 + V_{ov} - 1 = 0\quad\Rightarrow\quad V_{ov} = \frac{-1 + \sqrt{21}}{10} = 0.358\,\text{V}$$
(The negative root would mean the device is off.)

**(b)** $I_D = 5\times0.358^2 = 0.642\,\text{mA}$. **(c)** $V_S = 5 - 0.642 = 4.358\,\text{V}$. **(d)** $V_D = 0.642\times3 = 1.925\,\text{V}$.

**(e)** $V_D = 1.93\le V_G + 1 = 4\,\text{V}$: saturated. ✓`,
      }),
      G('bk_pmos', { need: 4 }),
    ],
  });

  // ================================================================== 3. channel-length modulation and r_ds
  const clmPlot = () => {
    const lam = 0.2, ovs = [1, 1.5, 2];
    return plot({
      x: [-5.4, 4.4], y: [0, 3.8], w: 520, h: 300, xl: 'V_{DS}\\ (\\text{V})', yl: 'I_D\\ (\\text{mA})', xt: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4], yt: [0, 1, 2, 3],
      curves: [...ovs.map((ov) => ({ f: (v) => (v < 0 ? NaN : idOf(v, ov, 1, lam)), from: 0, to: 4 })),
        ...ovs.map((ov) => ({ f: (v) => 0.5 * ov * ov * (1 + lam * v), from: -5, to: ov, cls: 'dc dash' }))],
      pts: [{ x: -5, y: 0 }],
    }, [{ line: [0, 0, 0, 3.8], cls: 'axis' }, { lab: [-5, 0.32, '-1/\\lambda', 'c'] }, { lab: [4.05, 3.6, 'V_{GS} = 3\\,\\text{V}', 'r'] }, { lab: [4.05, 1.7, '2.5\\,\\text{V}', 'r'] }, { lab: [4.05, 0.62, '2\\,\\text{V}', 'r'] }]);
  };

  L({
    id: 'bk02-clm', title: 'Channel-length modulation and r_ds', ref: 'Lecture 14',
    steps: [
      R(md`
        ### The question

        Section 2.1 said the saturation current does not depend on $V_{DS}$. Measured curves disagree slightly: in saturation $I_D$ keeps creeping up as $V_{DS}$ grows. How much, why, and what does it do for small signals? The answer is the transistor's output resistance $r_{ds} = 1/(\lambda I_D)$. It sets the largest gain any single transistor can give, and it appears in every $R_{out}$ on Exam 2.
      `),
      RF(md`
        ### The physical picture: the waterfall moves upstream

        Past pinch-off, the channel ends a little short of the drain, at the point where its voltage has reached $V_{ov}$; the rest of $V_{DS}$ falls across the depleted gap. Raise $V_{DS}$ further and that gap widens: the pinch-off point moves **toward the source**, and the channel that actually carries the current gets shorter, from $L$ to $L - \Delta L$.

        [[fig:xs]]

        The channel is the same as at pinch-off, only shorter, and the current of a channel goes as $1/L$ (Section 2.1, step 5). A shorter channel carries a little more current. That is **channel-length modulation**.
      `, { xs: { svg: xsec('sat', { w: 420, dl: true }), cap: 'Raising $V_{DS}$ past pinch-off widens the gap at the drain: the conducting channel shortens to $L - \\Delta L$.' } }),
      R(md`
        ### The model: a tilt of $\lambda$ per volt

        **Step 1.** Replace $L$ by $L - \Delta L$ in the square law:
        $$I_D = \tfrac12\mu_nC_{ox}\frac{W}{L - \Delta L}V_{ov}^2 = \tfrac12\mu_nC_{ox}\frac WLV_{ov}^2\cdot\frac{1}{1 - \Delta L/L}$$

        **Step 2.** For a small fraction, $\dfrac{1}{1 - \epsilon}\approx1 + \epsilon$. And the fraction grows roughly in proportion to $V_{DS}$; we write $\Delta L/L\approx\lambda V_{DS}$, which defines the **channel-length modulation coefficient** $\lambda$ (units $\text{V}^{-1}$):
        $$I_D = \tfrac12\mu_nC_{ox}\frac WLV_{ov}^2\,(1 + \lambda V_{DS})$$

        Every saturation line is now tilted. Its value at $V_{DS} = 0$ (extrapolated) is the old current $I_{D0} = \tfrac12\mu_nC_{ox}\tfrac WLV_{ov}^2$, and it rises by the fraction $\lambda$ for every volt of $V_{DS}$.

        **Magnitudes.** $\lambda$ is set mostly by the channel length: roughly $\lambda\propto1/L$. In the course it is a given number, typically $0.01$ to $0.1\,\text{V}^{-1}$. For DC problems the course usually takes $\lambda = 0$: the tilt changes a bias current by only a few percent, but it matters enormously for small signals, as we now see.
      `),
      R(md`
        ### The derivation: $r_{ds}$ is the inverse slope

        In the small-signal world (Chapter 1) we want the slope of $I_D$ against $V_{DS}$ at the operating point, with $V_{GS}$ held fixed.

        **Step 1: differentiate.** Only the factor $(1 + \lambda V_{DS})$ depends on $V_{DS}$, and its derivative is $\lambda$:
        $$\frac{\partial I_D}{\partial V_{DS}} = \tfrac12\mu_nC_{ox}\frac WLV_{ov}^2\cdot\lambda = \lambda I_{D0}$$

        **Step 2: a slope of current against voltage is a conductance.** Its inverse is a resistance, and a small change $v_{ds}$ produces a current change $v_{ds}/r_{ds}$ through it:
        $$r_{ds} = \frac{1}{\lambda I_{D0}}$$

        **Step 3: the course's form.** Since $\lambda V_{DS}\ll1$, $I_{D0}$ is within a few percent of the actual bias current $I_D$, and the course writes
        $$r_{ds} = \frac{1}{\lambda I_D}$$
        using the bias current from the DC analysis (usually found with $\lambda = 0$, so it *is* $I_{D0}$).

        !!key Output resistance
          $$r_{ds} = \frac{1}{\lambda I_D}$$
          The inverse slope of the saturation line. It falls as the current rises: $\lambda = 0.01\,\text{V}^{-1}$ gives $100\kO$ at $1\,\text{mA}$ and $1\,\text{M}\Omega$ at $0.1\,\text{mA}$.
      `),
      RF(md`
        ### A picture worth remembering: all lines meet at $-1/\lambda$

        Each saturation line is $I_D = I_{D0}(1 + \lambda V_{DS})$. It reaches zero where $1 + \lambda V_{DS} = 0$, at $V_{DS} = -1/\lambda$, **whatever** $V_{GS}$ is. Extend every saturation line backwards and they all meet at one point on the axis (here drawn with an exaggerated $\lambda = 0.2\,\text{V}^{-1}$, so $-1/\lambda = -5\,\text{V}$; the BJT's version of this point is its Early voltage, Chapter 6).

        [[fig:clm]]

        The geometry gives $r_{ds}$ without calculus: each line rises $I_D$ over the run from $-1/\lambda$ to the operating point, so $r_{ds} = (1/\lambda + V_{DS})/I_D = 1/(\lambda I_{D0})$, exactly as derived.
      `, { clm: { svg: clmPlot(), cap: 'Output curves with $\\lambda = 0.2\\,\\text{V}^{-1}$ (exaggerated). The dashed extensions of the saturation lines all meet at $V_{DS} = -1/\\lambda$.' } }),
      R(md`
        ### Check it

        - **$\lambda\to0$:** $r_{ds}\to\infty$, a perfectly flat curve, the ideal current source of Section 2.1. ✓
        - **Units:** $1/(\text{V}^{-1}\cdot\text{A}) = \text{V/A} = \Omega$. ✓
        - **Numbers:** $\lambda = 0.05\,\text{V}^{-1}$, $I_{D0} = 1\,\text{mA}$. At $V_{DS} = 2\,\text{V}$, $I_D = 1.1\,\text{mA}$; at $4\,\text{V}$, $1.2\,\text{mA}$. Slope $= 0.1\,\text{mA}/2\,\text{V} = 0.05\,\text{mA/V}$, so $r_{ds} = 20\kO = 1/(0.05\times1\,\text{mA})$. ✓

        ### What it means

        In saturation the transistor is a current source, but not a perfect one: it is a current source **with $r_{ds}$ in parallel**, a Norton equivalent. The drain voltage has a little say in the current, $1/r_{ds}$ amperes per volt, compared with the gate's $g_m$ amperes per volt (next section). Their ratio $g_mr_{ds}$ is how much more the gate matters than the drain: the transistor's **intrinsic gain**.

        ### How to recognize it

        A problem that gives $\lambda$ (or says "include $r_{ds}$") wants $r_{ds} = 1/(\lambda I_D)$ in the small-signal model. A problem that says "$\lambda = 0$" or "ignore $r_{ds}$" sets $r_{ds} = \infty$: delete it from the model.
      `),
      R(md`
        !!mistake Common mistakes
          **Using the total current with the tilt in DC problems that say $\lambda = 0$.** Then $I_D$ has no tilt factor at all; $r_{ds}$ only appears in the small-signal model.

          **$r_{ds} = \lambda/I_D$ or $\lambda I_D$.** It is $1/(\lambda I_D)$: more current, *smaller* $r_{ds}$.

          **Treating $r_{ds}$ as a property of the device alone.** Like $r_d$ and $g_m$, it depends on the bias current.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`With $\lambda$ fixed, the bias current of a transistor is doubled. What happens to $r_{ds}$?`,
        ['It halves', 'It doubles', 'It stays the same', 'It quadruples'], 0,
        [null, md`$r_{ds} = 1/(\lambda I_D)$: more current means a steeper line and a smaller resistance.`, md`It depends on $I_D$.`, md`It is inversely proportional to $I_D$, not to $I_D^2$.`],
        md`$r_{ds} = 1/(\lambda I_D)$, so doubling $I_D$ halves it.`),
      Q(md`Extended backwards, the tilted saturation lines of one transistor (different $V_{GS}$) cross the $V_{DS}$ axis...`,
        [md`all at the same point, $V_{DS} = -1/\lambda$`, md`at $V_{DS} = -V_{ov}$, a different point for each`, md`at $V_{DS} = 0$`, md`never: they are parallel`], 0,
        [null, md`$I_{D0}(1 + \lambda V_{DS}) = 0$ at $V_{DS} = -1/\lambda$, independent of $V_{ov}$.`, md`They would cross at the origin only if $\lambda$ were infinite.`, md`Their slopes $\lambda I_{D0}$ differ, so they fan out from one point.`],
        md`$I_D = I_{D0}(1 + \lambda V_{DS})$ vanishes at $V_{DS} = -1/\lambda$ for every $I_{D0}$.`),
      Q(md`A designer doubles the channel length $L$ (and doubles $W$ to keep $W/L$ and the current the same). What happens to $r_{ds}$, roughly?`,
        ['It roughly doubles', 'It halves', 'It is unchanged', 'It goes to zero'], 0,
        [null, md`A longer channel is *less* sensitive to a given $\Delta L$.`, md`$\lambda\propto1/L$ changes even though the current does not.`, md`Nothing like that happens.`],
        md`$\Delta L$ for a given $V_{DS}$ is about the same, so the fraction $\Delta L/L$, which is $\lambda$, halves: $r_{ds} = 1/(\lambda I_D)$ doubles. Long channels make better current sources.`),
      P({
        id: 'bk02-clm-rds', title: 'r_ds at two currents',
        q: md`$\lambda = 0.02\,\text{V}^{-1}$. Find $r_{ds}$ at $I_D = 0.5\,\text{mA}$ and at $I_D = 2\,\text{mA}$.`,
        parts: [{ lbl: 'r_{ds}\\ (0.5\\,\\text{mA})', unit: 'kΩ', ans: 100, traps: [{ v: 0.01, msg: 'That is $\\lambda I_D$ in mS. Invert it.' }] }, { lbl: 'r_{ds}\\ (2\\,\\text{mA})', unit: 'kΩ', ans: 25 }],
        hints: [md`$r_{ds} = 1/(\lambda I_D)$.`],
        sol: md`$1/(0.02\times0.5\,\text{mA}) = 1/(10\,\mu\text{A/V}) = 100\kO$; at $2\,\text{mA}$, four times the current: $25\kO$.`,
      }),
      P({
        id: 'bk02-clm-meas', title: 'Extract λ from two measurements',
        q: md`A transistor at fixed $V_{GS}$ (saturated) carries $1.05\,\text{mA}$ at $V_{DS} = 1\,\text{V}$ and $1.15\,\text{mA}$ at $V_{DS} = 3\,\text{V}$. Find $r_{ds}$, the extrapolated $I_{D0}$, $\lambda$, and where the line crosses the $V_{DS}$ axis.`,
        parts: [{ lbl: 'r_{ds}', unit: 'kΩ', ans: 20 }, { lbl: 'I_{D0}', unit: 'mA', ans: 1 }, { lbl: '\\lambda', unit: 'V^{-1}', ans: 0.05 }, { lbl: 'V_{DS}\\ \\text{at } I = 0', unit: 'V', ans: -20 }],
        hints: [md`Slope $= \Delta I/\Delta V$; then $I_{D0} = I(1\,\text{V}) - \text{slope}\times1\,\text{V}$; $\lambda = \text{slope}/I_{D0}$.`],
        sol: md`
1. Slope: $(1.15 - 1.05)\,\text{mA}/2\,\text{V} = 0.05\,\text{mA/V}$, so $r_{ds} = 20\kO$.
2. $I_{D0} = 1.05 - 0.05\times1 = 1\,\text{mA}$.
3. $\lambda = 0.05/1 = 0.05\,\text{V}^{-1}$ (check: $1/(\lambda I_{D0}) = 20\kO$ ✓).
4. The line crosses zero at $-1/\lambda = -20\,\text{V}$.`,
      }),
      P({
        id: 'bk02-clm-mirror', title: 'Same V_GS, different V_DS',
        q: md`Two identical saturated transistors share the same $V_{GS}$ (a current mirror, Section 2.7). One sits at $V_{DS} = 1\,\text{V}$, the other at $5\,\text{V}$; $\lambda = 0.05\,\text{V}^{-1}$. What is the ratio of their currents?`,
        parts: [{ lbl: 'I_2/I_1', unit: '', ans: 1.1905, traps: [{ v: 1, msg: 'With $\\lambda\\neq0$ the drain voltage matters: $(1 + \\lambda V_{DS})$.' }] }],
        hints: [md`$I = I_{D0}(1 + \lambda V_{DS})$ for both, same $I_{D0}$.`],
        sol: md`$\dfrac{1 + 0.05\times5}{1 + 0.05\times1} = \dfrac{1.25}{1.05} = 1.19$: a $19\%$ mismatch. Real mirrors fight this with long channels (small $\lambda$) or cascodes (Chapter 3).`,
      }),
      P({
        id: 'bk02-clm-dc', title: 'What λ does to a bias point',
        q: md`An NMOS with $k = 1\,\text{mA/V}^2$, $V_{ov} = 1\,\text{V}$, $\lambda = 0.1\,\text{V}^{-1}$ has $R_D = 4\kO$ to $V_{DD} = 5\,\text{V}$ and its source grounded. Find $I_D$ and $V_D$ including the tilt, and compare with $\lambda = 0$.`,
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.625 }, { lbl: 'V_D', unit: 'V', ans: 2.5 }, { lbl: 'I_D\\ (\\lambda = 0)', unit: 'mA', ans: 0.5 }],
        hints: [md`$I_D = 0.5\,\text{mA}\,(1 + 0.1V_D)$ and $V_D = 5 - 4\,\text{k}\Omega\cdot I_D$: two equations, two unknowns.`],
        sol: md`
Substitute $V_D$: $I_D = 0.5(1 + 0.1(5 - 4I_D)) = 0.5(1.5 - 0.4I_D) = 0.75 - 0.2I_D$ (mA), so $1.2I_D = 0.75$ and $I_D = 0.625\,\text{mA}$, $V_D = 5 - 2.5 = 2.5\,\text{V}$. With $\lambda = 0$: $0.5\,\text{mA}$, $V_D = 3\,\text{V}$.

A large $\lambda$ like $0.1\,\text{V}^{-1}$ shifts the bias by $25\%$, which is why problems that care about DC accuracy say $\lambda = 0$ or give a small $\lambda$.`,
      }),
      P({
        id: 'bk02-clm-design', title: 'Choosing λ (and L)',
        q: md`(a) What $\lambda$ gives $r_{ds} = 50\kO$ at $I_D = 0.4\,\text{mA}$? (b) The channel length is then doubled at the same current ($\lambda$ halves). New $r_{ds}$?`,
        parts: [{ lbl: '(a)\\ \\lambda', unit: 'V^{-1}', ans: 0.05 }, { lbl: '(b)\\ r_{ds}', unit: 'kΩ', ans: 100 }],
        hints: [md`$\lambda = 1/(r_{ds}I_D)$.`],
        sol: md`(a) $\lambda = 1/(50\kO\times0.4\,\text{mA}) = 1/20 = 0.05\,\text{V}^{-1}$. (b) $\lambda = 0.025$: $r_{ds} = 1/(0.025\times0.4\,\text{mA}) = 100\kO$.`,
      }),
      G('bk_rds', { need: 3 }),
    ],
  });

  // ================================================================== 4. g_m
  const gmTan = () => plot({
    x: [0.9, 1.5], y: [0, 4.2], w: 420, h: 270, xl: 'V_{GS}\\ (\\text{V})', yl: 'I_D\\ (\\text{mA})', xt: [0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5], yt: [0, 1, 2, 3, 4],
    curves: [{ f: (v) => (v > 1 ? 25 * (v - 1) * (v - 1) : 0), to: 1.41 }, { f: (v) => 1 + 10 * (v - 1.2), from: 1.1, to: 1.42, cls: 'dc dash' }],
    pts: [{ x: 1.2, y: 1, n: 'Q' }, { x: 1.1, y: 0 }],
  }, [{ lab: [1.1, 0.55, 'V_{TN} + \\tfrac12V_{ov}', 'r'] }, { lab: [1.33, 3.6, 'g_m = \\frac{1\\,\\text{mA}}{0.1\\,\\text{V}} = 10\\,\\text{mS}', 'r'] }]);
  const gmVsI = () => plot({
    x: [0, 4], y: [0, 42], w: 440, h: 280, xl: 'I_D\\ (\\text{mA})', yl: 'g_m\\ (\\text{mS})', xt: [0, 1, 2, 3, 4], yt: [0, 10, 20, 30, 40],
    curves: [{ f: (i) => 10 * i }, { f: (i) => 10 * Math.sqrt(i), cls: 'dc' }, { f: (i) => 40 * i, to: 1.04, cls: 'dash' }],
  }, [{ lab: [2.8, 37, '\\text{fixed } V_{ov} = 0.2\\,\\text{V}', 'r'] }, { lab: [3.95, 13.2, '\\text{fixed } W/L = 500', 'r'] }, { lab: [1.08, 40, '\\text{BJT}: I_C/V_T', 'l'] }]);

  L({
    id: 'bk02-gm', title: 'Linearizing: the transconductance g_m', ref: 'Lecture 14, Handout 3',
    steps: [
      R(md`
        ### The question

        Section 2.1 gave the drain current as a function of $V_{GS}$. For small signals we need its **slope**: how many extra amperes of drain current one extra volt on the gate produces, at the bias point. That slope is the **transconductance** $g_m$, the single most important number in this course. It comes in three equivalent forms, and choosing the right form is half of every Exam 2 problem.
      `),
      RF(md`
        ### The physical picture

        The gate sets the channel's charge; the charge carries the current. Push the gate up by a little and two things happen at once in saturation: there is more charge in the channel, and the channel can carry it with a larger pinch-off voltage. That is why the current goes as the *square* of the overdrive, and why its slope grows with the overdrive.

        Geometrically, $g_m$ is the slope of the transfer curve at $Q$. Section 1.2 showed that the tangent of a square law hits the axis halfway between $V_{TN}$ and $V_{GS}$, so the slope is $I_D$ divided by half the overdrive. For the course's $1X = 500/1$ device at $1\,\text{mA}$:

        [[fig:tan]]
      `, { tan: { svg: gmTan(), cap: '$1X = 500/1$ at $V_{GS} = 1.2\\,\\text{V}$: the tangent runs from $1.1\\,\\text{V}$ (zero current) up to $1\\,\\text{mA}$ at $1.2\\,\\text{V}$.' } }),
      R(md`
        ### The derivation: three forms

        Start from the square law, with $k = \mu_nC_{ox}\tfrac WL$:
        $$I_D = \tfrac12k\,(V_{GS} - V_{TN})^2$$

        **Form 1: differentiate.** The derivative of $(V_{GS} - V_{TN})^2$ with respect to $V_{GS}$ is $2(V_{GS} - V_{TN})$, and the 2 cancels the $\tfrac12$:
        $$g_m = \frac{\partial I_D}{\partial V_{GS}} = k\,(V_{GS} - V_{TN}) = \mu_nC_{ox}\frac WL\,V_{ov}$$

        **Form 2: eliminate $k$.** From the square law, $k = 2I_D/V_{ov}^2$. Substitute into Form 1:
        $$g_m = \frac{2I_D}{V_{ov}^2}\cdot V_{ov} = \frac{2I_D}{V_{ov}}$$

        **Form 3: eliminate $V_{ov}$.** From the square law, $V_{ov} = \sqrt{2I_D/k}$. Substitute into Form 1 and move $k$ under the root:
        $$g_m = k\sqrt{\frac{2I_D}{k}} = \sqrt{\frac{k^2\cdot2I_D}{k}} = \sqrt{2kI_D} = \sqrt{2\mu_nC_{ox}\tfrac WL\,I_D}$$

        !!key The transconductance (saturation)
          $$g_m = \mu_nC_{ox}\frac WL\,V_{ov} = \frac{2I_D}{V_{ov}} = \sqrt{2\mu_nC_{ox}\frac WL\,I_D}$$
          A small change $v_{gs}$ on the gate changes the drain current by $i_d = g_mv_{gs}$. For a PMOS use $\mu_pC_{ox}$ and $V_{ov} = V_{SG} - |V_{TP}|$; $g_m$ is still a positive number.

        **Which form when.**
        - You know $V_{GS}$ (a fixed gate voltage, source grounded): Form 1, $kV_{ov}$.
        - You know $I_D$ and $V_{ov}$ (after any DC analysis): Form 2, $2I_D/V_{ov}$. This is the one on Exam 2's sheet.
        - A current source sets $I_D$ and you know the size, not $V_{GS}$: Form 3, $\sqrt{2kI_D}$.
      `),
      R(md`
        ### Check it: one device, three ways

        The $1X = 500/1$ NMOS ($k = 50\,\text{mA/V}^2$) at $I_D = 1\,\text{mA}$: $V_{ov} = \sqrt{2(1\,\text{mA})/(50\,\text{mA/V}^2)} = 0.2\,\text{V}$.
        - Form 1: $(50\,\text{mA/V}^2)(0.2\,\text{V}) = 10\,\text{mS}$.
        - Form 2: $2(1\,\text{mA})/0.2\,\text{V} = 10\,\text{mS}$.
        - Form 3: $\sqrt{2(50\,\text{mA/V}^2)(1\,\text{mA})} = \sqrt{10^{-4}\,\text{A}^2/\text{V}^2} = 10\,\text{mS}$.

        So $1/g_m = 100\,\Omega$. Units: A/V, written S (siemens); $\text{mA/V} = \text{mS}$. And a $1\,\text{mV}$ wiggle on the gate moves the drain current by $10\,\mu\text{A}$.

        **Limit:** at $V_{ov}\to0$ (biased at threshold) Form 1 gives $g_m\to0$: the flat start of the parabola, Section 1.1's "no gain without a bias".
      `),
      RF(md`
        ### What it means: which way does $g_m$ go?

        "Does $g_m$ grow or shrink with $V_{ov}$?" has three answers, depending on what is held fixed. The plot shows $g_m$ against $I_D$ for the $1X$ device:

        [[fig:gi]]

        | Held fixed | $g_m$ grows as | Why |
        |---|---|---|
        | $V_{ov}$ | $I_D$ (linear) | $2I_D/V_{ov}$ |
        | $W/L$ | $\sqrt{I_D}$ | $\sqrt{2kI_D}$: more current also needs more $V_{ov}$ |
        | $I_D$ | $\sqrt{W/L}$, and as $1/V_{ov}$ | a wider device needs less overdrive for the same current |

        **The comparison with a BJT** (Chapter 7): a BJT has $g_m = I_C/V_T = 40\,\text{mS}$ at $1\,\text{mA}$, four times our $10\,\text{mS}$. In Form 2 terms, a BJT behaves like a MOSFET with $V_{ov}/2 = V_T = 25\,\text{mV}$: its exponential is much steeper than a square law biased at $V_{ov} = 0.2\,\text{V}$.

        **Intrinsic gain.** Combine $g_m = 2I_D/V_{ov}$ with $r_{ds} = 1/(\lambda I_D)$:
        $$g_mr_{ds} = \frac{2I_D}{V_{ov}}\cdot\frac{1}{\lambda I_D} = \frac{2}{\lambda V_{ov}}$$
        The current cancels. With $\lambda = 0.05\,\text{V}^{-1}$ and $V_{ov} = 0.2\,\text{V}$ this is $200$: the largest voltage gain one transistor can deliver (Section 2.5 shows why), set only by the overdrive and the channel length.
      `, { gi: { svg: gmVsI(), cap: '$g_m$ against $I_D$: linear at fixed overdrive, square-root for a fixed device. Dashed: a BJT, $I_C/V_T$, for comparison.' } }),
      R(md`
        ### How to recognize it

        Every small-signal problem has a line "$g_m = \ldots$" right after the DC analysis. Look at what the DC analysis gave you: $I_D$ and $V_{ov}$ (use $2I_D/V_{ov}$), or only $I_D$ from a current source and a size (use $\sqrt{2kI_D}$). Write $1/g_m$ next to it: you will need it for every source terminal in Chapter 3.

        ### Worked example: a current-source-biased transistor

        An NMOS with $W/L = 50$ is biased by a $0.25\,\text{mA}$ current source; $\lambda = 0.04\,\text{V}^{-1}$. Find $g_m$, $V_{ov}$, $1/g_m$, $r_{ds}$ and $g_mr_{ds}$.

        1. $k = (100\,\mu\text{A/V}^2)(50) = 5\,\text{mA/V}^2$. Only $I_D$ and the size are known, so Form 3: $g_m = \sqrt{2(5\,\text{mA/V}^2)(0.25\,\text{mA})} = \sqrt{2.5\times10^{-6}}\,\text{S} = 1.581\,\text{mS}$.
        2. $V_{ov} = 2I_D/g_m = 0.5\,\text{mA}/1.581\,\text{mS} = 0.316\,\text{V}$ (check: $\tfrac12(5)(0.316)^2 = 0.25\,\text{mA}$ ✓).
        3. $1/g_m = 632\,\Omega$; $r_{ds} = 1/(0.04\times0.25\,\text{mA}) = 100\kO$; $g_mr_{ds} = 158 = 2/(0.04\times0.316)$ ✓.
      `),
      R(md`
        !!mistake Common mistakes
          **Using $I_D/V_{ov}$** (forgetting the 2), or $kV_{ov}^2$ (that is $2I_D$, not a slope).

          **Using $V_{GS}$ for $V_{ov}$.** The overdrive is $V_{GS} - V_{TN}$: at $V_{GS} = 1.2\,\text{V}$ it is $0.2\,\text{V}$, not $1.2$.

          **"$g_m$ increases with $V_{ov}$" without saying what is fixed.** At fixed current it *decreases* ($2I_D/V_{ov}$).

          **A negative $g_m$ for a PMOS.** $g_m$ is always positive; the signs live in the model (Section 2.6).
      `),
      R(md`
        ### Exercises
      `),
      Q(md`A transistor's $W/L$ is doubled while its bias current is held fixed. Its $g_m$...`,
        [md`grows by $\sqrt2$`, 'doubles', 'is unchanged', md`shrinks by $\sqrt2$`], 0,
        [null, md`That would be true at fixed $V_{ov}$. At fixed $I_D$, use $\sqrt{2kI_D}$: $k$ doubles, $g_m$ grows by $\sqrt2$.`, md`$g_m = \sqrt{2kI_D}$ depends on $k$.`, md`A wider device needs *less* overdrive for the same current, so $2I_D/V_{ov}$ goes *up*.`],
        md`$g_m = \sqrt{2kI_D}$: doubling $k$ multiplies $g_m$ by $\sqrt2$ (and $V_{ov}$ falls by $\sqrt2$).`),
      Q(md`A mirror sets $I_D = 0.2\,\text{mA}$ in a transistor of known $W/L$; $V_{GS}$ is not given. Which form of $g_m$ is quickest?`,
        [md`$\sqrt{2\mu_nC_{ox}(W/L)I_D}$`, md`$\mu_nC_{ox}(W/L)V_{ov}$`, md`$2I_D/V_{ov}$`, md`$I_D/V_T$`], 0,
        [null, md`Needs $V_{ov}$, which you would first have to compute from $I_D$.`, md`Also needs $V_{ov}$.`, md`That is a BJT's $g_m$.`],
        md`Only $I_D$ and the size are known: $g_m = \sqrt{2kI_D}$ uses exactly those.`),
      Q(md`At a fixed bias current, a designer lowers $V_{ov}$ (by making the transistor wider). What happens to $g_m$ and to the intrinsic gain $g_mr_{ds}$?`,
        ['Both go up', 'Both go down', md`$g_m$ up, $g_mr_{ds}$ unchanged`, md`$g_m$ unchanged, $g_mr_{ds}$ up`], 0,
        [null, md`$2I_D/V_{ov}$ grows as $V_{ov}$ falls.`, md`$r_{ds} = 1/(\lambda I_D)$ is unchanged (same current), so $g_mr_{ds} = 2/(\lambda V_{ov})$ grows with $g_m$.`, md`At fixed $I_D$, $g_m = 2I_D/V_{ov}$ does change.`],
        md`$g_m = 2I_D/V_{ov}$ and $g_mr_{ds} = 2/(\lambda V_{ov})$: both grow as $V_{ov}$ falls (the price is a larger, slower transistor).`),
      P({
        id: 'bk02-gm-three', title: 'g_m three ways',
        q: md`An NMOS with $W/L = 100$ carries $I_D = 0.2\,\text{mA}$ in saturation. Find $V_{ov}$, $g_m$ and $1/g_m$.`,
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.2 }, { lbl: 'g_m', unit: 'mS', ans: 2, traps: [{ v: 1, msg: 'That is $I_D/V_{ov}$: the slope is $2I_D/V_{ov}$.' }] }, { lbl: '1/g_m', unit: 'Ω', ans: 500 }],
        hints: [md`$k = 10\,\text{mA/V}^2$; $V_{ov} = \sqrt{2I_D/k}$.`],
        sol: md`$V_{ov} = \sqrt{0.4/10} = 0.2\,\text{V}$. Form 2: $g_m = 0.4\,\text{mA}/0.2\,\text{V} = 2\,\text{mS}$ (Form 1: $10\times0.2 = 2$; Form 3: $\sqrt{2\times10\times0.2} = 2$). $1/g_m = 500\,\Omega$.`,
      }),
      P({
        id: 'bk02-gm-size', title: 'Size for a g_m',
        q: md`Design an NMOS to have $g_m = 4\,\text{mS}$ at $I_D = 0.4\,\text{mA}$. Find $V_{ov}$ and $W/L$.`,
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.2 }, { lbl: 'W/L', unit: '', ans: 200 }],
        hints: [md`$V_{ov} = 2I_D/g_m$; then $W/L$ from the square law.`],
        sol: md`$V_{ov} = 0.8\,\text{mA}/4\,\text{mS} = 0.2\,\text{V}$. $W/L = 2I_D/(\mu_nC_{ox}V_{ov}^2) = 0.8\,\text{mA}/(100\,\mu\times0.04) = 200$.`,
      }),
      P({
        id: 'bk02-gm-scale', title: 'More current, same device',
        q: md`A transistor has $g_m = 10\,\text{mS}$ at $I_D = 1\,\text{mA}$ ($V_{ov} = 0.2\,\text{V}$). The current is raised to $4\,\text{mA}$ in the same device. New $g_m$ and $V_{ov}$?`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 20, traps: [{ v: 40, msg: 'That would need a fixed $V_{ov}$. In the same device $g_m\\propto\\sqrt{I_D}$.' }] }, { lbl: 'V_{ov}', unit: 'V', ans: 0.4 }],
        hints: [md`Same device: $g_m = \sqrt{2kI_D}\propto\sqrt{I_D}$.`],
        sol: md`Four times the current: $g_m\times\sqrt4 = 20\,\text{mS}$; $V_{ov}\times\sqrt4 = 0.4\,\text{V}$. Check: $2(4\,\text{mA})/0.4 = 20\,\text{mS}$ ✓.`,
      }),
      P({
        id: 'bk02-gm-intrinsic', title: 'Intrinsic gain',
        q: md`$\lambda = 0.1\,\text{V}^{-1}$, $V_{ov} = 0.25\,\text{V}$, $I_D = 0.5\,\text{mA}$. Find $g_m$, $r_{ds}$ and $g_mr_{ds}$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 4 }, { lbl: 'r_{ds}', unit: 'kΩ', ans: 20 }, { lbl: 'g_mr_{ds}', unit: '', ans: 80 }],
        hints: [md`$g_mr_{ds} = 2/(\lambda V_{ov})$.`],
        sol: md`$g_m = 1\,\text{mA}/0.25 = 4\,\text{mS}$; $r_{ds} = 1/(0.1\times0.5\,\text{mA}) = 20\kO$; product $80 = 2/(0.1\times0.25)$ ✓.`,
      }),
      P({
        id: 'bk02-gm-meas', title: 'g_m from two points',
        q: md`A $1X = 500/1$ NMOS is measured at $V_{GS} = 1.19\,\text{V}$ and $1.21\,\text{V}$. Compute both currents from the square law and the slope between them.`,
        parts: [{ lbl: 'I_D(1.19)', unit: 'mA', ans: 0.9025 }, { lbl: 'I_D(1.21)', unit: 'mA', ans: 1.1025 }, { lbl: 'g_m', unit: 'mS', ans: 10 }],
        hints: [md`$I_D = (25\,\text{mA/V}^2)V_{ov}^2$.`],
        sol: md`$25(0.19)^2 = 0.9025\,\text{mA}$, $25(0.21)^2 = 1.1025\,\text{mA}$. Slope $= 0.2\,\text{mA}/0.02\,\text{V} = 10\,\text{mS}$: exactly $g_m$ at $1.2\,\text{V}$ (a parabola's chord has the slope of its midpoint).`,
      }),
      P({
        id: 'bk02-gm-exam', title: 'Exam style: everything from a current and a size',
        q: md`A PMOS ($\mu_pC_{ox} = 50\,\mu\text{A/V}^2$) with $W/L = 200$ is biased by a $0.36\,\text{mA}$ current source; $\lambda = 0.05\,\text{V}^{-1}$. Find (a) $g_m$, (b) $V_{ov}$ and $V_{SG}$, (c) $1/g_m$, (d) $r_{ds}$, (e) $g_mr_{ds}$.`,
        parts: [{ lbl: '(a)\\ g_m', unit: 'mS', ans: 2.683 }, { lbl: '(b)\\ V_{ov}', unit: 'V', ans: 0.2683 }, { lbl: '(b)\\ V_{SG}', unit: 'V', ans: 1.2683 }, { lbl: '(c)\\ 1/g_m', unit: 'Ω', ans: 372.7 }, { lbl: '(d)\\ r_{ds}', unit: 'kΩ', ans: 55.56 }, { lbl: '(e)\\ g_mr_{ds}', unit: '', ans: 149.1 }],
        hints: [md`$k_p = 10\,\text{mA/V}^2$; Form 3.`],
        sol: md`
**(a)** $g_m = \sqrt{2(10\,\text{mA/V}^2)(0.36\,\text{mA})} = \sqrt{7.2\times10^{-6}}\,\text{S} = 2.683\,\text{mS}$.

**(b)** $V_{ov} = 2I_D/g_m = 0.72/2.683 = 0.268\,\text{V}$, so $V_{SG} = 1.268\,\text{V}$.

**(c)** $1/g_m = 373\,\Omega$. **(d)** $r_{ds} = 1/(0.05\times0.36\,\text{mA}) = 55.6\kO$. **(e)** $g_mr_{ds} = 149 = 2/(0.05\times0.268)$ ✓.`,
      }),
      G('bk_gm', { need: 4 }),
      G('bk_gm_scale', { need: 3 }),
    ],
  });

  // ================================================================== 5. the small-signal model
  // one MOSFET's model: G a lone terminal, +v_gs- from G to S, g_m v_gs from D to S, r_ds across D-S
  const modelN = (o = {}) => [
    ...(o.g === 'vin' ? [['Vac', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0.9, 0.6]], ['node', [0.9, 0.6], { n: 'G', side: 'a' }]]
      : [['term', [0.9, 0.6], { n: 'G', side: 'l' }]]),
    ['term', [0.9, 1.6]], ['w', [0.9, 1.6], [0.9, 2], [3, 2]], ['vlab', [1.15, 0.75], [1.15, 1.45], { n: 'v_{gs}' }],
    ['G', [3, 0], [3, 2], { n: 'g_mv_{gs}', side: 'l' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_{ds}' }], ['w', [3, 2], [4.4, 2]],
    ...(o.d === 'RD' ? [['w', [4.4, 0], [5.6, 0], [6.4, 0]], ['R', [5.6, -1.4], [5.6, 0], { n: 'R_D' }], ['gndu', [5.6, -1.4]], ['term', [6.4, 0], { n: 'v_{out}' }], ['node', [3.7, 0], { n: 'D', side: 'a' }]]
      : [['w', [3.7, 0], [3.7, -0.5]], ['term', [3.7, -0.5], { n: 'D', side: 'r' }]]),
    ...(o.s === 'gnd' ? [['gnd', [3.7, 2]], ['txt', [3.6, 2.25], '$S$', { a: 'r' }]] : [['w', [3.7, 2], [3.7, 2.5]], ['term', [3.7, 2.5], { n: 'S', side: 'r' }]]),
  ];
  const csFig = (o = {}) => [['rail', [1, -1.2], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: o.rd }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }],
    ['nmos', [1, 1], { sz: o.sz }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }],
    ...(o.vgs ? [['V', [-0.6, 2.4], [-0.6, 3.4], { n: 'V_{GS}', s: o.vgs, side: 'l' }], ['gnd', [-0.6, 3.4]]] : [['gnd', [-0.6, 2.4]]])];

  L({
    id: 'bk02-model', title: 'The small-signal model, assembled and felt', ref: 'Lecture 14, Handout 3',
    steps: [
      R(md`
        ### The question

        We now have the two slopes of the MOSFET at its operating point: $g_m$ (current per volt of gate) and $1/r_{ds}$ (current per volt of drain). Chapter 1 showed that for small signals every curve becomes its slopes. What single linear circuit replaces the transistor? And how do we use it? This section builds the model, gets a feel for its sizes, and computes a first amplifier gain with it. Every Exam 2 problem is this model plus KCL.
      `),
      R(md`
        ### The physical picture: three pieces

        - **The gate sets a current.** A change $v_{gs}$ in the gate-source voltage changes the drain current by $g_mv_{gs}$, whatever the drain is doing. A current set by a voltage elsewhere is a voltage-controlled current source (Section 1.5).
        - **The drain has a weak say.** A change $v_{ds}$ changes the current by $v_{ds}/r_{ds}$: a current proportional to the voltage across the same two terminals, which is a resistor.
        - **The gate draws nothing.** It is a capacitor plate: no DC current, so no change in current either. The gate is an open terminal whose only job is to define $v_{gs}$.
      `),
      RF(md`
        ### The derivation: Taylor in two variables

        The drain current depends on two voltages, $i_D = f(v_{GS}, v_{DS})$. Write each as bias plus signal and expand to first order in both (Section 1.2, one variable at a time):
        $$I_D + i_d = f(V_{GS} + v_{gs},\;V_{DS} + v_{ds})\approx f(V_{GS}, V_{DS}) + \frac{\partial f}{\partial v_{GS}}\Big|_Q v_{gs} + \frac{\partial f}{\partial v_{DS}}\Big|_Q v_{ds}$$

        **Step 1: remove the DC part.** $f(V_{GS}, V_{DS}) = I_D$, so subtract it from both sides.

        **Step 2: name the slopes.** $\partial f/\partial v_{GS} = g_m$ (Section 2.4) and $\partial f/\partial v_{DS} = 1/r_{ds}$ (Section 2.3):
        $$i_d = g_m\,v_{gs} + \frac{v_{ds}}{r_{ds}}$$

        **Step 3: the other terminals.** The gate current is zero at every bias, so its change is zero: $i_g = 0$. By KCL on the whole device, what enters the drain leaves the source: $i_s = i_d$.

        **Step 4: read the equation as a circuit.** $i_d$ is the sum of two currents, both flowing from drain to source: one set by $v_{gs}$ (a VCCS $g_mv_{gs}$) and one set by $v_{ds}$ across itself (a resistor $r_{ds}$). Two branches in parallel between $D$ and $S$; the gate connected to nothing.

        [[fig:m]]

        !!key The small-signal MOSFET
          $$i_d = g_mv_{gs} + \frac{v_{ds}}{r_{ds}},\qquad i_g = 0$$
          A VCCS $g_mv_{gs}$ from drain to source, $r_{ds}$ in parallel, and an open gate; $v_{gs}$ is measured from gate to source. $g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$. In saturation only.
      `, { m: { svg: row([{ fig: nm(), cap: 'The transistor at its bias point' }, { fig: modelN(), cap: 'Its small-signal model' }]), cap: 'Replace the transistor by its model: the arrow of $g_mv_{gs}$ points from $D$ to $S$; $r_{ds}$ sits beside it; $G$ touches nothing.' } }),
      R(md`
        ### Feel it: numbers

        Take the $1X$ device at $1\,\text{mA}$ with $\lambda = 0.05\,\text{V}^{-1}$: $g_m = 10\,\text{mS}$, $r_{ds} = 20\kO$.
        - $1\,\text{mV}$ on the gate moves the drain current by $10\,\mu\text{A}$.
        - $1\,\text{mV}$ on the drain moves it by $1\,\text{mV}/20\kO = 0.05\,\mu\text{A}$.

        The gate is $g_mr_{ds} = 200$ times more persuasive than the drain. A designer's mental picture: **a current source controlled by the gate, slightly leaky.** If the drain is attached to a resistance much smaller than $r_{ds}$, the leak hardly matters and you may drop $r_{ds}$; if the drain sees a large resistance (another current source), $r_{ds}$ decides everything.

        **What is *not* in the model:** no $V_{TN}$, no $V_{DD}$, no $I_D$ as a source. Those were spent computing $g_m$ and $r_{ds}$. The model knows only changes.
      `),
      R(md`
        !!method Replacing a transistor by its model
          1. **DC first:** find $I_D$ and $V_{ov}$; check saturation.
          2. **Slopes:** $g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$ (or $\infty$ if $\lambda = 0$).
          3. **Small-signal picture** (Section 1.4): rails and bias voltages to ground, current sources open, big capacitors shorted.
          4. **Drop in the model:** connect its $G$, $D$, $S$ to whatever the transistor's terminals touched.
          5. **Write $v_{gs} = v_g - v_s$ in node voltages.** This one line decides the sign of everything.
          6. **KCL** at the unknown nodes.
      `),
      RF(md`
        ### A first amplifier: the common source, straight from the model

        Chapter 1's amplifier: input on the gate, source grounded, $R_D$ from the drain (output) to $V_{DD}$.

        [[fig:cs]]

        **Small-signal picture.** $V_{DD}$ becomes ground, so $R_D$ runs from the output to (incremental) ground. The transistor becomes its model with $G$ on $v_{in}$, $S$ on ground, $D$ on the output.

        [[fig:csm]]

        **Step 1: the controlling voltage.** $v_g = v_{in}$ and $v_s = 0$, so $v_{gs} = v_{in}$.

        **Step 2: KCL at the output node.** Add the currents *leaving* it: down through the VCCS, $g_mv_{gs} = g_mv_{in}$; down through $r_{ds}$, $v_{out}/r_{ds}$; up through $R_D$ to incremental ground, $v_{out}/R_D$. Nothing else touches the node (the output is unloaded), so
        $$g_mv_{in} + \frac{v_{out}}{r_{ds}} + \frac{v_{out}}{R_D} = 0$$

        **Step 3: solve.** Move the $g_m$ term over and divide by the sum of conductances, which is the parallel combination:
        $$v_{out}\Big(\frac1{r_{ds}} + \frac1{R_D}\Big) = -g_mv_{in}\quad\Rightarrow\quad A_v = \frac{v_{out}}{v_{in}} = -g_m\,(R_D\parallel r_{ds})$$

        !!key Common-source gain
          $$A_v = -g_m\,(R_D\parallel r_{ds})$$
          The transistor converts $v_{in}$ into a current $g_mv_{in}$; that current flows through everything at the drain, $R_D\parallel r_{ds}$, and becomes the output voltage. The minus sign: more gate voltage pulls more current down, which pulls the output down.
      `, { cs: { fig: csFig(), cap: 'The common-source amplifier (bias not drawn).' }, csm: { fig: modelN({ g: 'vin', d: 'RD', s: 'gnd' }), cap: 'Its small-signal picture: $R_D$ goes to incremental ground (the old $V_{DD}$).' } }),
      R(md`
        ### Check it

        - **Against Chapter 1.** With $r_{ds}\to\infty$, $A_v = -g_mR_D = -kV_{ov}R_D$, exactly the slope $-kR_D(V_{IN} - V_{TN})$ of Section 1.1's transfer curve. The model and the curve agree. ✓
        - **$R_D\to\infty$** (an ideal current-source load): $A_v\to-g_mr_{ds}$, the intrinsic gain, the most a single transistor can give. ✓
        - **Output resistance.** Turn $v_{in}$ off and push a test voltage into the output: $v_{gs} = 0$, so the VCCS carries nothing and the test source sees $R_D\parallel r_{ds}$. The gain is "transconductance times output resistance", a theme Chapter 4 builds into the $G_MR_{out}$ method.
        - **Units:** S times $\Omega$: a pure number. ✓

        ### What it means

        The model turns every MOSFET circuit into a linear circuit with one dependent source per transistor. From here on, an amplifier problem is: DC point, two slopes, a drawing, KCL. Chapters 3 to 5 are this section repeated with the transistor's terminals connected in different ways.

        ### How to recognize it

        Every transistor in saturation in a small-signal problem gets this model, NMOS or PMOS (Section 2.6). Write $v_{gs}$ in node voltages before anything else.
      `),
      R(md`
        ### Worked example: from bias to gain

        $1X = 500/1$ NMOS, source grounded, gate biased at $V_{GS} = 1.2\,\text{V}$ (plus $v_{in}$), $R_D = 2\kO$ to $V_{DD} = 5\,\text{V}$, $\lambda = 0.05\,\text{V}^{-1}$. Find the gain.

        1. **DC:** $V_{ov} = 0.2\,\text{V}$, $I_D = \tfrac12(50\,\text{mA/V}^2)(0.04) = 1\,\text{mA}$ (with $\lambda = 0$ for DC, the course's habit). $V_D = 5 - 2 = 3\,\text{V}\ge V_G - V_{TN} = 0.2\,\text{V}$: saturated. ✓
        2. **Slopes:** $g_m = 2(1\,\text{mA})/0.2\,\text{V} = 10\,\text{mS}$; $r_{ds} = 1/(0.05\times1\,\text{mA}) = 20\kO$.
        3. **Gain:** $R_D\parallel r_{ds} = 2\kO\parallel20\kO = 1.818\kO$, so $A_v = -(10\,\text{mS})(1.818\kO) = -18.2$.

        Without $r_{ds}$ it would be $-20$: $r_{ds}$ costs $9\%$ here because it is only ten times $R_D$ (Section 1.6).
      `),
      R(md`
        !!mistake Common mistakes
          **Connecting the gate to something in the model.** The gate is an open terminal; it only sets $v_{gs}$.

          **Using $v_g$ instead of $v_{gs}$.** If the source moves (Chapter 3), $v_{gs} = v_g - v_s\ne v_g$.

          **Drawing the PMOS arrow from source to drain.** The model's current is defined drain $\to$ source for both types (next section).

          **Keeping DC values in the model.** No $V_{DD}$ at the top of $R_D$, no $I_D$ source.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`Why is the gate an open circuit in the small-signal model?`,
        ['Because no current flows into the gate at any bias, so its change is zero too', md`Because $v_{gs}$ is small`, 'Because the gate is at incremental ground', 'Because the gate current is $g_mv_{gs}$'], 0,
        [null, md`Even a large $v_{gs}$ draws no gate current; smallness has nothing to do with it.`, md`The gate is often driven by the input, so it is not ground.`, md`$g_mv_{gs}$ flows from drain to source, not into the gate.`],
        md`The oxide insulates the gate: $i_G = 0$ for every $V_{GS}$, so $i_g = 0$. The gate only sets $v_{gs}$.`),
      Q(md`The dependent source in the MOSFET model is controlled by...`,
        [md`$v_{gs}$, the gate-to-source voltage`, md`$v_g$, the gate-to-ground voltage`, md`$v_{ds}$`, md`$i_d$`], 0,
        [null, md`Only when the source is grounded is $v_g = v_{gs}$. In general the source moves.`, md`$v_{ds}$ drives the current through $r_{ds}$, not the VCCS.`, md`It is a *voltage*-controlled source.`],
        md`$g_mv_{gs}$, with $v_{gs} = v_g - v_s$.`),
      Q(md`A large capacitor ties a MOSFET's gate to its source, and the device is biased in saturation by other means. What does a test source at the drain see?`,
        [md`$r_{ds}$`, md`$1/g_m$`, 'An open circuit', 'A short'], 0,
        [null, md`$1/g_m$ needs $v_{gs}$ to follow the test voltage (a diode connection).`, md`The device is on; $r_{ds}$ still conducts.`, md`Nothing shorts drain to source.`],
        md`The capacitor forces $v_{gs} = 0$, so the VCCS is dead and only $r_{ds}$ remains between drain and source.`),
      P({
        id: 'bk02-model-id', title: 'The model, as an equation',
        q: md`A MOSFET has $g_m = 4\,\text{mS}$ and $r_{ds} = 50\kO$. At some instant $v_{gs} = 2\,\text{mV}$ and $v_{ds} = -50\,\text{mV}$. Find $i_d$ (drain to source).`,
        parts: [{ lbl: 'i_d', unit: 'µA', ans: 7, traps: [{ v: 9, msg: '$v_{ds}$ is negative: its term subtracts.' }, { v: 8, msg: 'Include $v_{ds}/r_{ds}$.' }] }],
        hints: [md`$i_d = g_mv_{gs} + v_{ds}/r_{ds}$.`],
        sol: md`$g_mv_{gs} = 4\,\text{mS}\times2\,\text{mV} = 8\,\mu\text{A}$; $v_{ds}/r_{ds} = -50\,\text{mV}/50\kO = -1\,\mu\text{A}$; $i_d = 7\,\mu\text{A}$.`,
      }),
      P({
        id: 'bk02-model-cs', title: 'Common-source gain',
        q: md`A common-source stage has $g_m = 5\,\text{mS}$, $R_D = 10\kO$, $r_{ds} = 40\kO$. Find $R_{out}$ and $A_v$.`,
        fig: csFig(),
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 8 }, { lbl: 'A_v', unit: 'V/V', ans: -40, traps: [{ v: -50, msg: 'Include $r_{ds}$: $R_D\\parallel r_{ds} = 8\\,\\text{k}\\Omega$.' }] }],
        hints: [md`$R_{out} = R_D\parallel r_{ds}$; $A_v = -g_mR_{out}$.`],
        sol: md`$R_{out} = 10\parallel40 = 8\kO$; $A_v = -(5\,\text{mS})(8\kO) = -40$.`,
      }),
      P({
        id: 'bk02-model-load', title: 'Add a load',
        q: md`The same stage drives a load $R_L = 10\kO$ (through a large capacitor). New gain?`,
        parts: [{ lbl: 'A_v', unit: 'V/V', ans: -22.22, traps: [{ v: -40, msg: 'The load is in parallel at the drain for signals.' }] }],
        hints: [md`For signals the load sits from the output to ground, in parallel with $R_D$ and $r_{ds}$.`],
        sol: md`$10\parallel40\parallel10 = 4.444\kO$; $A_v = -(5\,\text{mS})(4.444\kO) = -22.2$.`,
      }),
      P({
        id: 'bk02-model-full', title: 'From bias to gain',
        q: md`An NMOS with $W/L = 50$ has its source grounded and $V_{GS} = 1.4\,\text{V}$; $R_D = 5\kO$ to $V_{DD} = 5\,\text{V}$; $\lambda = 0.05\,\text{V}^{-1}$ (use $\lambda = 0$ for DC). Find $I_D$, $V_D$, $g_m$, $r_{ds}$ and $A_v$.`,
        fig: csFig({ vdd: '5\\,\\text{V}', rd: '5\\,\\text{k}\\Omega', vgs: '1.4\\,\\text{V}' }),
        parts: [{ lbl: 'I_D', unit: 'mA', ans: 0.4 }, { lbl: 'V_D', unit: 'V', ans: 3 }, { lbl: 'g_m', unit: 'mS', ans: 2 }, { lbl: 'r_{ds}', unit: 'kΩ', ans: 50 }, { lbl: 'A_v', unit: 'V/V', ans: -9.091, traps: [{ v: -10, msg: 'Include $r_{ds}$.' }] }],
        hints: [md`$k = 5\,\text{mA/V}^2$, $V_{ov} = 0.4\,\text{V}$.`],
        sol: md`$I_D = \tfrac12(5)(0.16) = 0.4\,\text{mA}$; $V_D = 5 - 2 = 3\,\text{V}$ (saturated); $g_m = 0.8/0.4 = 2\,\text{mS}$; $r_{ds} = 1/(0.05\times0.4\,\text{mA}) = 50\kO$; $A_v = -2\,\text{mS}\times(5\parallel50)\kO = -2\times4.545 = -9.09$.`,
      }),
      P({
        id: 'bk02-model-sym', title: 'The gain, in symbols',
        q: md`Type the gain of the common-source stage with a load $R_L$ at the output (<code>gm</code>, <code>RD</code>, <code>rds</code>, <code>RL</code>), and its output resistance without the load.`,
        parts: [BK.ex('-gm*(RD || rds || RL)', ['gm', 'RD', 'rds', 'RL'], 'A_v', { exact: true }), BK.ex('RD || rds', ['RD', 'rds'], 'R_{out}', { exact: true })],
        hints: [md`Everything at the drain is in parallel for signals.`],
        sol: md`$A_v = -g_m(R_D\parallel r_{ds}\parallel R_L)$; $R_{out} = R_D\parallel r_{ds}$.`,
      }),
      P({
        id: 'bk02-model-cap', title: 'A transistor with v_gs held at zero',
        q: md`A saturated NMOS with $\lambda = 0.02\,\text{V}^{-1}$ carries $0.25\,\text{mA}$; a large capacitor ties its gate to its source. What resistance does its drain present (source grounded)?`,
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 200, traps: [{ v: 0.2, msg: 'Units: $1/(\\lambda I_D)$ is in ohms; $200\\,\\text{k}\\Omega$.' }] }],
        hints: [md`$v_{gs} = 0$ kills the VCCS.`],
        sol: md`Only $r_{ds}$ is left: $1/(0.02\times0.25\,\text{mA}) = 200\kO$. This is how a transistor makes a (nearly ideal) current source: hold its $v_{gs}$ still and it looks like $r_{ds}$.`,
      }),
      G('bk_cs_model', { need: 4 }),
    ],
  });

  // ================================================================== 6. why PMOS uses the same model
  const modelP = (o = {}) => [
    ...(o.cs ? [['Vac', [0, 1.4], [0, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2.4]], ['w', [0, 1.4], [0.9, 1.4]], ['node', [0.9, 1.4], { n: 'G', side: 'b' }]] : [['term', [0.9, 1.4], { n: 'G', side: 'l' }]]),
    ['term', [0.9, 0.4]], ['w', [0.9, 0.4], [0.9, 0], [3, 0]], ['vlab', [1.15, 1.25], [1.15, 0.55], { n: 'v_{gs}' }],
    ['G', [3, 2], [3, 0], { n: 'g_mv_{gs}', side: 'l' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_{ds}' }], ['w', [3, 2], [4.4, 2]],
    ...(o.cs ? [['gndu', [3.7, 0]], ['txt', [3.8, -0.25], '$S$', { a: 'l' }], ['w', [4.4, 2], [5.6, 2], [6.4, 2]], ['R', [5.6, 2], [5.6, 3.4], { n: 'R_D' }], ['gnd', [5.6, 3.4]], ['term', [6.4, 2], { n: 'v_{out}' }], ['node', [3.7, 2], { n: 'D', side: 'b' }]]
      : [['w', [3.7, 0], [3.7, -0.5]], ['term', [3.7, -0.5], { n: 'S', side: 'r' }], ['w', [3.7, 2], [3.7, 2.5]], ['term', [3.7, 2.5], { n: 'D', side: 'r' }]]),
  ];
  const pcsFig = (o = {}) => [['rail', [1, -0.2], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }], ['pmos', [1, 0.8]], ['w', [0, 0.8], [-0.6, 0.8], [-0.6, 1.2]],
    ['Vac', [-0.6, 1.2], [-0.6, 2.2], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 2.2], [-0.6, 3.2], { n: 'V_G', s: o.vg, side: 'l' }], ['gnd', [-0.6, 3.2]],
    ['R', [1, 1.8], [1, 3.2], { n: 'R_D', s: o.rd }], ['gnd', [1, 3.2]], ['w', [1, 1.8], [1.8, 1.8]], ['term', [1.8, 1.8], { n: 'v_{out}' }]];

  L({
    id: 'bk02-pmodel', title: 'Why PMOS uses the same model', ref: 'Lecture 14, Handout 3',
    steps: [
      R(md`
        ### The question

        A PMOS carries its current from source to drain, is controlled by $V_{SG}$, and is drawn upside down. Does it need its own small-signal model, with its own signs? No: with the **same** definitions as the NMOS ($i_d$ from drain to source, $v_{gs}$ from gate to source), the PMOS model is identical: $g_mv_{gs}$ from drain to source, $r_{ds}$ in parallel. This section derives that, because Exam 2 sign errors almost all start with a PMOS.
      `),
      R(md`
        ### The physical picture

        Raise an NMOS gate (relative to its source) and more current flows from drain to source. Raise a PMOS gate (relative to its source) and *less* current flows from source to drain. But "less current from source to drain" is the same thing as "more current from drain to source", algebraically. So in both devices, **raising $v_{gs}$ increases $i_d$ measured drain $\to$ source.** The model only cares about that.
      `),
      RF(md`
        ### The derivation

        **Step 1: the PMOS in its own variables.** Section 2.2 wrote the PMOS with positive, source-referenced quantities:
        $$I_{SD} = \tfrac12\mu_pC_{ox}\frac WL\,(V_{SG} - |V_{TP}|)^2\,(1 + \lambda V_{SD})$$

        **Step 2: linearize it exactly as we did the NMOS.** Its slopes are positive numbers, $g_m = \partial I_{SD}/\partial V_{SG} = 2I_D/V_{ov}$ and $1/r_{ds} = \partial I_{SD}/\partial V_{SD} = \lambda I_D$:
        $$i_{sd} = g_m\,v_{sg} + \frac{v_{sd}}{r_{ds}}$$

        **Step 3: switch to the NMOS directions.** A current flowing source to drain is minus a current flowing drain to source, and the same for each voltage:
        $$i_{sd} = -i_d,\qquad v_{sg} = -v_{gs},\qquad v_{sd} = -v_{ds}$$

        **Step 4: substitute.**
        $$-i_d = g_m(-v_{gs}) + \frac{-v_{ds}}{r_{ds}}$$

        **Step 5: multiply by $-1$.**
        $$i_d = g_m\,v_{gs} + \frac{v_{ds}}{r_{ds}}$$
        Every minus sign cancels. It is **the NMOS model, term for term**.

        [[fig:pm]]

        !!key One model for both
          NMOS or PMOS: a VCCS $g_mv_{gs}$ from **drain to source**, $r_{ds}$ in parallel, gate open, $v_{gs}$ measured gate to source. For a PMOS, $g_m = 2I_D/V_{ov}$ with $V_{ov} = V_{SG} - |V_{TP}|$ and $\mu_pC_{ox}$: still a positive number. Because the PMOS's source is drawn on top, its model's arrow (drain to source) points **up**.
      `, { pm: { svg: row([{ fig: pm(), cap: 'A PMOS, source on top' }, { fig: modelP(), cap: 'Its model: the arrow points from $D$ (bottom) up to $S$' }]), cap: 'The same model as the NMOS, drawn the way the PMOS sits in a circuit.' } }),
      R(md`
        ### Check it with physics

        A PMOS has $g_m = 4\,\text{mS}$. Its gate rises by $2\,\text{mV}$ relative to its source, so $v_{gs} = +2\,\text{mV}$ and the model says $i_d = +8\,\mu\text{A}$ from drain to source. That means the source-to-drain current *drops* by $8\,\mu\text{A}$, exactly what Section 2.2 said a rising PMOS gate does. ✓
      `),
      RF(md`
        ### A PMOS common source

        The PMOS version of Section 2.5's amplifier: source on $V_{DD}$, input on the gate, $R_D$ from the drain (output) down to ground.

        [[fig:pcs]]

        **Small-signal picture.** $V_{DD}$ is ground, so the source is grounded; $v_{gs} = v_{in} - 0 = v_{in}$. Drop in the model (arrow up, from $D$ to $S$):

        [[fig:pcsm]]

        **KCL at the drain** (the output), currents leaving it: into the VCCS (which carries $g_mv_{gs}$ from $D$ up to $S$), $g_mv_{in}$; through $r_{ds}$ up to the grounded source, $v_{out}/r_{ds}$; through $R_D$ to ground, $v_{out}/R_D$:
        $$g_mv_{in} + \frac{v_{out}}{r_{ds}} + \frac{v_{out}}{R_D} = 0\quad\Rightarrow\quad A_v = -g_m\,(R_D\parallel r_{ds})$$
        The same equation as the NMOS stage, hence the same gain. Physically: the gate rises, less current comes out of the drain into $R_D$, and the output falls. Inverting, as it must be.
      `, { pcs: { fig: pcsFig(), cap: 'A PMOS common-source amplifier.' }, pcsm: { fig: modelP({ cs: true }), cap: 'Its small-signal picture: source at incremental ground (top), $R_D$ to ground.' } }),
      R(md`
        ### Worked example

        PMOS, $W/L = 200$ ($k_p = 10\,\text{mA/V}^2$), source on $V_{DD} = 5\,\text{V}$, gate biased at $3.7\,\text{V}$, $R_D = 5\kO$, $\lambda = 0.05\,\text{V}^{-1}$.

        1. **DC:** $V_{SG} = 1.3\,\text{V}$, $V_{ov} = 0.3\,\text{V}$, $I_D = \tfrac12(10)(0.09) = 0.45\,\text{mA}$; $V_D = 0.45\times5 = 2.25\,\text{V}\le V_G + 1 = 4.7\,\text{V}$: saturated. ✓
        2. **Slopes:** $g_m = 2(0.45)/0.3 = 3\,\text{mS}$; $r_{ds} = 1/(0.05\times0.45\,\text{mA}) = 44.4\kO$.
        3. **Gain:** $R_D\parallel r_{ds} = 5\parallel44.4 = 4.494\kO$; $A_v = -(3\,\text{mS})(4.494\kO) = -13.5$.

        ### What it means, and how to recognize it

        You never need a separate PMOS model. Draw the PMOS model with its source where the PMOS's source is (usually on top) and the arrow from drain to source; then $v_{gs} = v_g - v_s$ as always. Every formula in Chapters 3 to 5 (degeneration, cascodes, $1/g_m$ at a source) holds for both types.
      `),
      R(md`
        !!mistake Common mistakes
          **Flipping the arrow for a PMOS** (drawing it source to drain) *and* using $v_{gs}$: that double-counts the sign change and flips the gain.

          **Writing $g_m$ as negative for a PMOS.** $g_m$ is a positive slope; directions live in the model.

          **Using $v_{sg}$ in the model.** Either use the PMOS's own variables throughout ($i_{sd} = g_mv_{sg} + \ldots$) or the common model with $v_{gs}$, never a mix.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`In the small-signal model of a PMOS (source drawn on top), which way does the $g_mv_{gs}$ arrow point?`,
        ['From the drain up to the source', 'From the source down to the drain', 'Into the gate', 'It depends on the sign of the signal'], 0,
        [null, md`That is the PMOS's DC current direction, but the model's current is defined drain $\to$ source for both types.`, md`The gate is open.`, md`The arrow is a reference direction; the signal's sign is handled by $v_{gs}$.`],
        md`The model is $g_mv_{gs}$ from drain to source; with the source on top, that is upward.`),
      Q(md`A PMOS common-source stage (source on $V_{DD}$, $R_D$ to ground): the gate voltage rises slightly. The output...`,
        ['falls', 'rises', 'does not move', 'rises, then falls'], 0,
        [null, md`A higher gate means a smaller $V_{SG}$: less current out of the drain, less voltage across $R_D$.`, md`The current through $R_D$ changes, so the output must move.`, md`Small-signal behaviour is instantaneous and linear here.`],
        md`$A_v = -g_m(R_D\parallel r_{ds}) < 0$: the output falls when the input rises, for NMOS and PMOS alike.`),
      P({
        id: 'bk02-pmodel-gm', title: 'PMOS slopes',
        q: md`A PMOS carries $0.5\,\text{mA}$ at $V_{ov} = 0.25\,\text{V}$, with $\lambda = 0.04\,\text{V}^{-1}$. Find $g_m$ and $r_{ds}$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 4, traps: [{ v: -4, msg: '$g_m$ is a positive number for a PMOS too.' }] }, { lbl: 'r_{ds}', unit: 'kΩ', ans: 50 }],
        hints: [md`Same formulas as the NMOS.`],
        sol: md`$g_m = 2(0.5\,\text{mA})/0.25\,\text{V} = 4\,\text{mS}$; $r_{ds} = 1/(0.04\times0.5\,\text{mA}) = 50\kO$.`,
      }),
      P({
        id: 'bk02-pmodel-sign', title: 'Follow the signs',
        q: md`That PMOS ($g_m = 4\,\text{mS}$, $r_{ds} = 50\kO$) has $v_{gs} = +2\,\text{mV}$ and $v_{ds} = +10\,\text{mV}$. Find $i_d$ (drain to source), and say what happens to the current flowing out of the drain.`,
        parts: [{ lbl: 'i_d', unit: 'µA', ans: 8.2 }, { lbl: 'The current out of the drain...', mc: ['falls by $8.2\\,\\mu\\text{A}$', 'rises by $8.2\\,\\mu\\text{A}$', 'is unchanged'], a: 0, why: [null, md`$i_d$ is measured drain $\to$ source, i.e. *into* the drain. A positive $i_d$ means less current comes out.`, md`$i_d\neq0$.`] }],
        hints: [md`$i_d = g_mv_{gs} + v_{ds}/r_{ds}$, measured drain $\to$ source.`],
        sol: md`$i_d = 4\,\text{mS}\times2\,\text{mV} + 10\,\text{mV}/50\kO = 8 + 0.2 = 8.2\,\mu\text{A}$ from drain to source. The PMOS's bias current flows the other way (out of the drain), so that current falls by $8.2\,\mu\text{A}$.`,
      }),
      P({
        id: 'bk02-pmodel-cs', title: 'PMOS common-source gain',
        q: md`A PMOS common-source stage has $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_D = 10\kO$. Find $A_v$.`,
        fig: pcsFig(),
        parts: [{ lbl: 'A_v', unit: 'V/V', ans: -18.18, traps: [{ v: 18.18, msg: 'Inverting, like the NMOS: the gate rises, less current flows into $R_D$, the output falls.' }] }],
        hints: [md`$A_v = -g_m(R_D\parallel r_{ds})$, same as NMOS.`],
        sol: md`$R_D\parallel r_{ds} = 9.09\kO$; $A_v = -2\times9.09 = -18.2$.`,
      }),
      P({
        id: 'bk02-pmodel-load', title: 'A PMOS current-source load',
        q: md`A PMOS with its gate held at a fixed bias (incremental ground) and its source on $V_{DD}$ carries $0.2\,\text{mA}$; $\lambda = 0.05\,\text{V}^{-1}$. (a) What resistance does its drain present? (b) It is the load of an NMOS common-source stage with $g_{m1} = 2\,\text{mS}$ and $r_{ds1}$ at the same current and $\lambda$. Find $A_v$.`,
        parts: [{ lbl: '(a)\\ R', unit: 'kΩ', ans: 100 }, { lbl: '(b)\\ A_v', unit: 'V/V', ans: -100, traps: [{ v: -200, msg: 'Both $r_{ds}$ are at the output node: $r_{ds1}\\parallel r_{ds2} = 50\\,\\text{k}\\Omega$.' }] }],
        hints: [md`Gate and source both at incremental ground: $v_{gs} = 0$, only $r_{ds}$ is left.`, md`At the output: $r_{ds1}\parallel r_{ds2}$.`],
        sol: md`**(a)** $v_{gs} = 0$, so the PMOS is just $r_{ds2} = 1/(0.05\times0.2\,\text{mA}) = 100\kO$. **(b)** $r_{ds1}$ is also $100\kO$; $A_v = -g_{m1}(r_{ds1}\parallel r_{ds2}) = -2\,\text{mS}\times50\kO = -100$. A current-source load gives a large gain because the drain sees only transistor output resistances.`,
      }),
      P({
        id: 'bk02-pmodel-exam', title: 'Exam style: PMOS from bias to gain',
        q: md`A PMOS common source: $W/L = 100$, source on $V_{DD} = 5\,\text{V}$, gate biased at $3.6\,\text{V}$, $R_D = 5\kO$ to ground, $\lambda = 0.02\,\text{V}^{-1}$ ($\lambda = 0$ for DC). Find (a) $I_D$, (b) $V_D$, (c) $g_m$, (d) $r_{ds}$, (e) $A_v$, (f) $A_v$ with a $5\kO$ load.`,
        fig: pcsFig({ vdd: '5\\,\\text{V}', vg: '3.6\\,\\text{V}', rd: '5\\,\\text{k}\\Omega' }),
        parts: [{ lbl: '(a)\\ I_D', unit: 'mA', ans: 0.4 }, { lbl: '(b)\\ V_D', unit: 'V', ans: 2 }, { lbl: '(c)\\ g_m', unit: 'mS', ans: 2 }, { lbl: '(d)\\ r_{ds}', unit: 'kΩ', ans: 125 }, { lbl: '(e)\\ A_v', unit: 'V/V', ans: -9.615 }, { lbl: '(f)\\ A_v', unit: 'V/V', ans: -4.902 }],
        hints: [md`$k_p = 5\,\text{mA/V}^2$, $V_{SG} = 1.4\,\text{V}$.`],
        sol: md`
**(a)** $V_{ov} = 0.4\,\text{V}$: $I_D = \tfrac12(5)(0.16) = 0.4\,\text{mA}$. **(b)** $V_D = 0.4\times5 = 2\,\text{V}\le4.6\,\text{V}$: saturated.

**(c)** $g_m = 0.8/0.4 = 2\,\text{mS}$. **(d)** $r_{ds} = 1/(0.02\times0.4\,\text{mA}) = 125\kO$.

**(e)** $A_v = -2\times(5\parallel125) = -2\times4.808 = -9.62$. **(f)** $5\parallel125\parallel5 = 2.451\kO$: $A_v = -4.90$.`,
      }),
      G('bk_pmos_model', { need: 3 }),
    ],
  });

  // ================================================================== 7. the DC operating point
  const divFigM = (o = {}) => [
    ['rail', [1, -1.4], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }], ['rail', [-1, -1.4], { n: o.vdd ? `V_{DD} = ${o.vdd}` : 'V_{DD}' }],
    ['R', [1, -1.4], [1, 0], { n: 'R_D', s: o.rd }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'V_D' }],
    ['R', [-1, -1.4], [-1, 1], { n: 'R_1', s: o.r1, side: 'l' }], ['R', [-1, 1], [-1, 3.2], { n: 'R_2', s: o.r2, side: 'l' }], ['gnd', [-1, 3.2]], ['w', [-1, 1], [0, 1]], ['node', [-0.5, 1], { n: 'V_G', side: 'a' }],
    ['nmos', [1, 1]], ['node', [1, 2], { n: 'V_S', side: 'r' }], ['R', [1, 2], [1, 3.2], { n: 'R_S', s: o.rs }], ['gnd', [1, 3.2]],
  ];
  const diodeFig = (o = {}) => [['rail', [1, -1.2], { n: 'V_{DD}' }], ['I', [1, -1.2], [1, 0], { n: 'I_{REF}', s: o.i, side: 'r' }], ['nmos', [1, 1], { dc: true }], ['gnd', [1, 2]],
    ['node', [1, 0], { n: 'V_{GS}', side: 'r' }]];
  const mirrorFig = (o = {}) => [
    ['rail', [1, -1.2], { n: 'V_{DD}' }], ['I', [1, -1.2], [1, 0], { n: 'I_{REF}', s: o.i, side: 'l' }], ['nmos', [1, 1], { n: 'M_1', flip: true, dc: true, sz: o.s1 }], ['gnd', [1, 2]],
    ['nmos', [3, 1], { n: 'M_2', sz: o.s2 }], ['gnd', [3, 2]], ['rail', [3, -1.2], { n: 'V_{DD}' }], ['R', [3, -1.2], [3, 0], { n: 'R_D', s: o.rd }], ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'V_{D2}' }],
  ];
  const pmirrorFig = (o = {}) => [
    ['rail', [1, 0], { n: 'V_{DD}' }], ['pmos', [1, 1], { n: 'M_1', flip: true, dc: true, sz: o.s1 }], ['I', [1, 2], [1, 3.2], { n: 'I_{REF}', s: o.i, side: 'l' }], ['gnd', [1, 3.2]],
    ['rail', [3, 0], { n: 'V_{DD}' }], ['pmos', [3, 1], { n: 'M_2', sz: o.s2 }], ['R', [3, 2], [3, 3.2], { n: 'R_D', s: o.rd }], ['gnd', [3, 3.2]], ['w', [3, 2], [3.8, 2]], ['term', [3.8, 2], { n: 'V_{D2}' }],
  ];

  L({
    id: 'bk02-bias', title: 'What you need from Exam 1: finding the DC operating point', ref: 'Exam 1 (HW 3), rebuilt',
    steps: [
      R(md`
        ### The question

        Every small-signal number starts from the bias: $g_m = 2I_D/V_{ov}$ and $r_{ds} = 1/(\lambda I_D)$ need $I_D$ and $V_{ov}$. This section collects the four bias circuits that Exam 2 and Exam 3 problems are built from: a fixed gate voltage, a resistor divider with a source resistor, the diode-connected transistor, and the current mirror. Each is solved with one method: **assume saturation, solve, check.**
      `),
      R(md`
        ### The physical picture

        **The gate draws no current.** So a gate voltage set by a resistor divider is just the divider's open-circuit voltage: the transistor does not load it. That makes the gate the easy part of every bias problem.

        **A source resistor fights the current.** With $R_S$ under the source, more current raises the source voltage, which shrinks $V_{GS}$, which reduces the current. The bias settles where the square law and Ohm's law agree, and it is much less sensitive to the transistor's exact $V_{TN}$ or $k$: negative feedback, the theme of Chapter 4's degeneration.

        **A diode-connected transistor sets its own gate voltage.** With the gate tied to the drain, the transistor adjusts $V_{GS}$ until it carries whatever current is pushed into it. Another transistor sharing that $V_{GS}$ copies the current: a **mirror**.
      `),
      R(md`
        !!method Assume, solve, check
          1. **Assume saturation** and write $I_D = \tfrac12k(V_{GS} - V_{TN})^2$ (for a PMOS, $\tfrac12k_p(V_{SG} - |V_{TP}|)^2$).
          2. **Write the circuit's own equations** (Ohm's law for the resistors, KVL from the gate to ground) in terms of $I_D$ or $V_{ov}$.
          3. **Solve**, keeping only the root with $V_{ov} > 0$.
          4. **Check** $V_D\ge V_G - V_{TN}$ (NMOS) or $V_D\le V_G + |V_{TP}|$ (PMOS). If it fails, redo it with the triode law (Section 2.1).
      `),
      RF(md`
        ### Case 1: a divider and a source resistor

        $V_{DD} = 5\,\text{V}$, $R_1 = 300\kO$, $R_2 = 200\kO$, an NMOS with $W/L = 20$ ($k = 2\,\text{mA/V}^2$), $R_S = 1\kO$, $R_D = 5\kO$.

        [[fig:div]]

        **Step 1: the gate.** No gate current, so the divider is unloaded:
        $$V_G = V_{DD}\frac{R_2}{R_1 + R_2} = 5\times\frac{200}{500} = 2\,\text{V}$$

        **Step 2: KVL from the gate to ground.** $V_G = V_{GS} + I_DR_S$. Write $V_{GS} = V_{TN} + V_{ov}$ and $I_D = \tfrac12kV_{ov}^2$:
        $$V_G - V_{TN} = V_{ov} + \tfrac12kR_S\,V_{ov}^2$$

        **Step 3: numbers.** $V_G - V_{TN} = 1\,\text{V}$ and $\tfrac12kR_S = \tfrac12(2\,\text{mA/V}^2)(1\kO) = 1\,\text{V}^{-1}$:
        $$V_{ov}^2 + V_{ov} - 1 = 0\quad\Rightarrow\quad V_{ov} = \frac{-1 + \sqrt{1 + 4}}{2} = 0.618\,\text{V}$$
        The other root, $-1.618\,\text{V}$, would put $V_{GS}$ below threshold, where the square law does not apply: discard it.

        **Step 4: everything else.** $I_D = \tfrac12(2)(0.618)^2 = 0.382\,\text{mA}$; $V_S = I_DR_S = 0.382\,\text{V}$; $V_{GS} = 1.618\,\text{V}$; $V_D = 5 - (0.382)(5) = 3.09\,\text{V}$.

        **Step 5: check.** $V_D = 3.09\ge V_G - V_{TN} = 1\,\text{V}$. ✓ Saturated. Now the small signal can begin: $g_m = 2I_D/V_{ov} = 1.236\,\text{mS}$.
      `, { div: { fig: divFigM({ vdd: '5\\,\\text{V}', r1: '300\\,\\text{k}\\Omega', r2: '200\\,\\text{k}\\Omega', rs: '1\\,\\text{k}\\Omega', rd: '5\\,\\text{k}\\Omega' }), cap: 'Divider bias with a source resistor.' } }),
      RF(md`
        ### Case 2: the diode-connected transistor

        Tie the gate to the drain and push a current $I_{REF}$ into it.

        [[fig:d]]

        **Always saturated (if on).** $V_{DS} = V_{GS}$, and $V_{GS}\ge V_{GS} - V_{TN}$ always holds. So the square law applies and gives the voltage directly:
        $$V_{GS} = V_{TN} + \sqrt{\frac{2I_{REF}}{k}}$$
        With $k = 1\,\text{mA/V}^2$ and $I_{REF} = 0.5\,\text{mA}$: $V_{ov} = 1\,\text{V}$, $V_{GS} = 2\,\text{V}$.

        For small signals the gate follows the drain, so the transistor's own current responds to its own voltage: Section 1.5's VCCS controlled by its own voltage. Chapter 3 shows it looks like $1/g_m$.
      `, { d: { fig: diodeFig({ i: '0.5\\,\\text{mA}' }), cap: 'A diode-connected NMOS: always in saturation when on.' } }),
      RF(md`
        ### Case 3: the current mirror

        $M_1$ is diode-connected and carries $I_{REF}$; $M_2$ shares its gate and source, so it has the same $V_{GS}$.

        [[fig:m]]

        **Step 1: $M_1$ sets $V_{GS}$.** $\tfrac12k_1V_{ov}^2 = I_{REF}$.

        **Step 2: $M_2$ has the same $V_{ov}$**, so if it is saturated its current is the same square law with its own $k$:
        $$I_2 = \tfrac12k_2V_{ov}^2 = I_{REF}\,\frac{(W/L)_2}{(W/L)_1}$$
        A mirror copies current **by size**. No $V_{TN}$, no $\mu_nC_{ox}$: they cancel in the ratio.

        **Step 3: check $M_2$.** Its gate is at $V_{GS}$ and its drain must stay at or above $V_{GS} - V_{TN} = V_{ov}$.

        **Numbers.** $I_{REF} = 0.2\,\text{mA}$, $(W/L)_1 = 10$, $(W/L)_2 = 30$, $R_D$ from $V_{DD} = 5\,\text{V}$ to $M_2$'s drain. $V_{ov} = \sqrt{0.4/1} = 0.632\,\text{V}$ ($V_{GS} = 1.632\,\text{V}$); $I_2 = 3\times0.2 = 0.6\,\text{mA}$; saturation needs $V_{D2} = 5 - 0.6R_D\ge0.632$, so $R_D\le7.28\kO$.
      `, { m: { fig: mirrorFig({ i: '0.2\\,\\text{mA}', s1: '10', s2: '30' }), cap: 'An NMOS current mirror: $I_2 = I_{REF}(W/L)_2/(W/L)_1$ while $M_2$ is saturated.' } }),
      R(md`
        ### Check it, and what it means

        - **Case 1 limits.** $R_S\to0$: $V_{ov} = V_G - V_{TN} = 1\,\text{V}$ and $I_D = 1\,\text{mA}$. With $R_S = 1\kO$ the current dropped to $0.382\,\text{mA}$: the source resistor's feedback at work.
        - **Mirror check.** Equal sizes copy exactly; a $3\times$ wider $M_2$ carries $3\times$ the current at the same $V_{GS}$, like three copies of $M_1$ side by side.
        - **With $\lambda\ne0$** the mirror copies only approximately, because $M_1$ and $M_2$ sit at different $V_{DS}$ (Section 2.3's mismatch).

        ### How to recognize it

        A divider on a gate: write $V_G$ first. A resistor under a source: expect a quadratic in $V_{ov}$. A gate wired to its own drain: saturated, $V_{GS}$ from the current. Two gates on one line with a diode on one side: a mirror, scale by size. Every Exam 2 Problem 1 is a combination of these.
      `),
      R(md`
        !!mistake Common mistakes
          **Loading the divider with a gate current.** There is none.

          **Keeping the wrong root.** The root with $V_{ov} < 0$ (or $V_{GS} < V_{TN}$) is not physical.

          **Forgetting $V_S$ in $V_{GS}$.** With $R_S$, $V_{GS} = V_G - I_DR_S$, not $V_G$.

          **Mirroring without checking the copy is saturated.** The ratio rule only holds while $M_2$'s drain stays above $V_{GS} - V_{TN}$.
      `),
      R(md`
        ### Exercises
      `),
      Q(md`A diode-connected NMOS (gate tied to drain) is conducting. Which region is it in?`,
        ['Saturation, always', 'Triode, always', 'It depends on the current', 'Cutoff'], 0,
        [null, md`Triode needs $V_{DS} < V_{GS} - V_{TN}$, impossible when $V_{DS} = V_{GS}$.`, md`For any current, $V_{DS} = V_{GS} > V_{GS} - V_{TN}$.`, md`It is conducting, so it is on.`],
        md`$V_{DS} = V_{GS}\ge V_{GS} - V_{TN}$: the saturation condition holds automatically.`),
      Q(md`Why can we compute a gate voltage from a resistor divider as if nothing were attached?`,
        ['The gate draws no DC current, so the divider is unloaded', md`Because $R_1$ and $R_2$ are large`, 'Because the source resistor isolates it', md`Because $V_{DD}$ is constant`], 0,
        [null, md`Large resistors make loading *worse*, not better; it is the zero gate current that matters.`, md`$R_S$ is on the other side of the transistor; the gate current is zero regardless.`, md`A constant supply does not stop a load from drawing current.`],
        md`The oxide insulates the gate: $I_G = 0$, so the divider's output is its open-circuit value $V_{DD}R_2/(R_1 + R_2)$.`),
      Q(md`In a mirror, $M_2$ is four times wider than $M_1$ (same $L$) and both are saturated. $I_{REF} = 50\,\mu\text{A}$. What does $M_2$ carry?`,
        [md`$200\,\mu\text{A}$`, md`$100\,\mu\text{A}$`, md`$800\,\mu\text{A}$`, md`$50\,\mu\text{A}$`], 0,
        [null, md`The current scales with $W/L$ itself, not its square root.`, md`That would be squaring the size ratio.`, md`Same $V_{GS}$ but four times the width: four times the current.`],
        md`Same $V_{GS}$, so $I_2 = I_{REF}\times4 = 200\,\mu\text{A}$.`),
      P({
        id: 'bk02-bias-rs', title: 'A source resistor',
        q: md`An NMOS ($k = 1\,\text{mA/V}^2$) has its gate at $3\,\text{V}$, $R_S = 2\kO$ to ground, and $R_D = 4\kO$ to $V_{DD} = 5\,\text{V}$. Find $V_{ov}$, $I_D$, $V_S$, $V_D$, and check saturation.`,
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 1, traps: [{ v: 2, msg: 'That ignores $R_S$: the source sits at $I_DR_S$, not at ground.' }] }, { lbl: 'I_D', unit: 'mA', ans: 0.5 }, { lbl: 'V_S', unit: 'V', ans: 1 }, { lbl: 'V_D', unit: 'V', ans: 3 },
          { lbl: 'Saturated?', mc: ['Yes: $V_D = 3\\ge V_G - V_{TN} = 2$', 'No'], a: 0, why: [null, md`$3\,\text{V}\ge2\,\text{V}$.`] }],
        hints: [md`$V_G - V_{TN} = V_{ov} + \tfrac12kR_SV_{ov}^2$ with $\tfrac12kR_S = 1\,\text{V}^{-1}$.`],
        sol: md`$2 = V_{ov} + V_{ov}^2\Rightarrow V_{ov}^2 + V_{ov} - 2 = 0\Rightarrow(V_{ov} + 2)(V_{ov} - 1) = 0$, so $V_{ov} = 1\,\text{V}$. $I_D = \tfrac12(1)(1) = 0.5\,\text{mA}$, $V_S = 1\,\text{V}$, $V_D = 5 - 2 = 3\,\text{V}\ge2\,\text{V}$ ✓.`,
      }),
      P({
        id: 'bk02-bias-diode', title: 'A diode-connected transistor',
        q: md`$0.2\,\text{mA}$ is pushed into a diode-connected NMOS with $W/L = 25$. Find $V_{ov}$, $V_{GS}$, and $g_m$.`,
        fig: diodeFig({ i: '0.2\\,\\text{mA}' }),
        parts: [{ lbl: 'V_{ov}', unit: 'V', ans: 0.4 }, { lbl: 'V_{GS}', unit: 'V', ans: 1.4 }, { lbl: 'g_m', unit: 'mS', ans: 1 }],
        hints: [md`$\tfrac12k = 1.25\,\text{mA/V}^2$.`],
        sol: md`$V_{ov} = \sqrt{0.2/1.25} = 0.4\,\text{V}$, $V_{GS} = 1.4\,\text{V}$, $g_m = 2(0.2)/0.4 = 1\,\text{mS}$ (so it looks like $1\kO$ for small signals, Chapter 3).`,
      }),
      P({
        id: 'bk02-bias-mirror', title: 'Mirror a current',
        q: md`$1X = 50/1$. $I_{REF} = 0.1\,\text{mA}$ flows into a diode-connected $1X$ NMOS ($M_1$); $M_2$ is $4X$ and shares its gate; $R_D$ runs from $V_{DD} = 3\,\text{V}$ to $M_2$'s drain. Find $V_{GS}$, $I_2$ and the largest $R_D$ for which $M_2$ stays saturated.`,
        fig: mirrorFig({ i: '0.1\\,\\text{mA}', s1: '1X', s2: '4X' }),
        parts: [{ lbl: 'V_{GS}', unit: 'V', ans: 1.2 }, { lbl: 'I_2', unit: 'mA', ans: 0.4 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 7, traps: [{ v: 4.5, msg: 'The edge for $M_2$ is $V_D = V_{GS} - V_{TN} = V_{ov}$, not $V_{GS}$.' }] }],
        hints: [md`$1X$: $\tfrac12k = 2.5\,\text{mA/V}^2$.`],
        sol: md`$V_{ov} = \sqrt{0.1/2.5} = 0.2\,\text{V}$, $V_{GS} = 1.2\,\text{V}$. $I_2 = 4\times0.1 = 0.4\,\text{mA}$. Edge: $V_{D2} = V_{ov} = 0.2\,\text{V}$, so $R_D\le(3 - 0.2)/0.4\,\text{mA} = 7\kO$.`,
      }),
      P({
        id: 'bk02-bias-pmirror', title: 'A PMOS mirror',
        q: md`$V_{DD} = 5\,\text{V}$. A diode-connected PMOS $M_1$ ($W/L = 40$) carries $I_{REF} = 0.1\,\text{mA}$ (pulled out of its drain to ground). $M_2$ ($W/L = 120$) shares its gate and source; $R_D$ runs from $M_2$'s drain to ground. Find $V_{SG}$, the gate voltage, $I_2$, and the largest $R_D$ for saturation.`,
        fig: pmirrorFig({ i: '0.1\\,\\text{mA}', s1: '40', s2: '120' }),
        parts: [{ lbl: 'V_{SG}', unit: 'V', ans: 1.3162 }, { lbl: 'V_G', unit: 'V', ans: 3.6838 }, { lbl: 'I_2', unit: 'mA', ans: 0.3 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 15.61, traps: [{ v: 8.946, msg: 'That is the NMOS rule. For a PMOS the drain may rise to $V_G + |V_{TP}|$.' }] }],
        hints: [md`$k_p = 2\,\text{mA/V}^2$: $V_{ov} = \sqrt{2(0.1)/2}$.`, md`PMOS saturation: $V_{D2}\le V_G + 1$.`],
        sol: md`$V_{ov} = \sqrt{0.1} = 0.316\,\text{V}$, $V_{SG} = 1.316\,\text{V}$, $V_G = 5 - 1.316 = 3.684\,\text{V}$. $I_2 = 0.1\times120/40 = 0.3\,\text{mA}$. Edge: $V_{D2} = V_G + 1 = 4.684\,\text{V}$, so $R_D\le4.684/0.3 = 15.6\kO$.`,
      }),
      P({
        id: 'bk02-bias-exam', title: 'Exam style: bias, check, then the slopes',
        q: md`$V_{DD} = 10\,\text{V}$, $R_1 = 700\kO$, $R_2 = 300\kO$ (divider on the gate), NMOS with $W/L = 10$, $R_S = 2\kO$, $R_D = 10\kO$, $\lambda = 0.02\,\text{V}^{-1}$ (zero for DC). Find (a) $V_G$, (b) $V_{ov}$, (c) $I_D$, (d) $V_D$, (e) $g_m$, (f) $r_{ds}$, (g) the largest $R_D$ that keeps saturation.`,
        fig: divFigM({ vdd: '10\\,\\text{V}', r1: '700\\,\\text{k}\\Omega', r2: '300\\,\\text{k}\\Omega', rs: '2\\,\\text{k}\\Omega', rd: '10\\,\\text{k}\\Omega' }),
        parts: [{ lbl: '(a)\\ V_G', unit: 'V', ans: 3 }, { lbl: '(b)\\ V_{ov}', unit: 'V', ans: 1 }, { lbl: '(c)\\ I_D', unit: 'mA', ans: 0.5 }, { lbl: '(d)\\ V_D', unit: 'V', ans: 5 }, { lbl: '(e)\\ g_m', unit: 'mS', ans: 1 }, { lbl: '(f)\\ r_{ds}', unit: 'kΩ', ans: 100 }, { lbl: '(g)\\ R_{D,max}', unit: 'kΩ', ans: 16 }],
        hints: [md`$V_G = 10\times0.3$; then $2 = V_{ov} + \tfrac12kR_SV_{ov}^2$ with $\tfrac12kR_S = 1\,\text{V}^{-1}$.`],
        sol: md`
**(a)** $V_G = 10\times300/1000 = 3\,\text{V}$. **(b)** $V_{ov}^2 + V_{ov} - 2 = 0\Rightarrow V_{ov} = 1\,\text{V}$. **(c)** $I_D = \tfrac12(1)(1) = 0.5\,\text{mA}$.

**(d)** $V_D = 10 - 5 = 5\,\text{V}\ge V_G - V_{TN} = 2\,\text{V}$ ✓. **(e)** $g_m = 2(0.5)/1 = 1\,\text{mS}$. **(f)** $r_{ds} = 1/(0.02\times0.5\,\text{mA}) = 100\kO$.

**(g)** The edge is $V_D = 2\,\text{V}$: $R_D\le(10 - 2)/0.5\,\text{mA} = 16\kO$.`,
      }),
      G('bk_dc_rs', { need: 3 }),
      G('bk_dc_mirror', { need: 3 }),
    ],
  });
})();

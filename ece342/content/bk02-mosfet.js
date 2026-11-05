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
    s += lab(105, 115, n, 'c', '') + lab(355, 115, n, 'c', '') + lab(230, 65, '\\text{gate}', 'c') + lab(316, 72, '\\text{oxide}', 'l');
    s += lab(230, 212, o.p ? '\\text{n-type body}' : '\\text{p-type body}', 'c');
    s += '<path class="dim" d="M152,160H308M152,154V166M308,154V166"/>' + lab(230, 172, 'L', 't');
    if (mode === 'off') s += lab(230, 132, '\\text{no channel}', 'c');
    if (mode === 'lin' || mode === 'tri') s += lab(230, 124, o.p ? '\\text{hole channel}' : '\\text{electron channel}', 'c');
    if (mode === 'sat') s += lab(300, 130, '\\text{pinch-off}', 'c') + '<path class="dim" d="M296,121L287,99"/>';
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
      `, { xs: { svg: row([{ svg: xsec('off', { w: 300 }), cap: '$V_{GS} < V_{TN}$: no channel' }, { svg: xsec('lin', { w: 300 }), cap: '$V_{GS} > V_{TN}$, $V_{DS}\\approx0$: a uniform channel' }]), cap: 'An NMOS in cross-section. The gate, the oxide and the silicon surface form a capacitor. $W$ goes into the page.' } }),
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
      `, { xs: { svg: row([{ svg: xsec('tri', { w: 300 }), cap: '$0 < V_{DS} < V_{ov}$: triode, a tapered channel' }, { svg: xsec('sat', { w: 300 }), cap: '$V_{DS}\\ge V_{ov}$: saturation, pinched off at the drain' }]), cap: 'The channel tapers as $V_{DS}$ rises, and pinches off at $V_{DS} = V_{ov}$.' } }),
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
        figHtml: Schem.render([...nm(), ['txt', [1.35, -0.3], '$V_D = 0.8\\,\\text{V}$', { a: 'l' }], ['txt', [1.35, 2.3], '$V_S = 0.5\\,\\text{V}$', { a: 'l' }], ['txt', [-0.5, 1.25], '$V_G = 2\\,\\text{V}$', { a: 'r' }]]),
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
})();

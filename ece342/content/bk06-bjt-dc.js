/* bk06-bjt-dc.js — Book Chapter 6: the BJT from first principles, and DC analysis.
   How a BJT works (injection, diffusion across a thin base, collection; where the base current and beta come from),
   the equations felt (60 mV per decade, why 0.7 V, the two views), the four regions, the PNP, DC analysis by
   "assume active, solve, check" (base resistor, emitter resistor and the (beta + 1), split supplies, dividers and
   stiffness, PNP circuits, capacitors, saturation and the switch), the Early effect, and the chapter problems.
   Helpers and drills: js/gens-bk-a5.js (window.BK5, GENS.bk_*). Every number was checked by an independent script. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk06', l);
  const B = window.BK5;
  const { svg, lab, arrow, rect, plot } = B;

  // ================================================================ physical pictures
  // The transistor as a bar of silicon: emitter | thin base | collector, with the carrier flows of forward-active
  // operation. NPN: electrons left to right, holes back into the emitter. PNP: the same with every type swapped.
  function xsec(pnp) {
    const W = 590, H = 220, y0 = 84, h = 96, ym = 132;
    const xE = 64, xB = 236, xC = 292, xC1 = 516, xb = 264;
    const nT = (o) => `fill:var(--accent);fill-opacity:${o};stroke:none`, pT = (o) => `fill:var(--dim);fill-opacity:${o};stroke:none`;
    let s = '';
    s += rect(xE, y0, xB - xE, h, pnp ? pT(0.34) : nT(0.3)) + rect(xB, y0, xC - xB, h, pnp ? nT(0.2) : pT(0.22)) + rect(xC, y0, xC1 - xC, h, pnp ? pT(0.13) : nT(0.12));
    s += rect(xC - 4, y0, 40, h, 'fill:var(--fg);fill-opacity:.07;stroke:none');                     // BC depletion region
    s += `<path class="dash nodecl" d="M${xC + 36},${y0}V${y0 + h}"/>`;
    s += `<rect class="nodecl" x="${xE}" y="${y0}" width="${xC1 - xE}" height="${h}" style="fill:none"/>`;
    s += `<path class="nodecl" d="M${xB},${y0}V${y0 + h}M${xC},${y0}V${y0 + h}"/>`;
    // leads and terminals
    s += `<path class="nodecl" d="M${xE},${ym}H20M${xC1},${ym}H562M${xb},${y0}V30"/>`;
    s += `<circle class="term nodecl" cx="20" cy="${ym}" r="3.6"/><circle class="term nodecl" cx="562" cy="${ym}" r="3.6"/><circle class="term nodecl" cx="${xb}" cy="30" r="3.6"/>`;
    s += lab(9, ym, 'E') + lab(574, ym, 'C') + lab(xb, 16, 'B');
    // names above, doping letters inside
    s += lab((xE + xB) / 2, 68, '\\text{emitter}') + lab((xC + xC1) / 2, 68, '\\text{collector}') + lab(xb + 9, 52, '\\text{base}', 'l');
    s += lab((xE + xB) / 2, 166, pnp ? 'p^+' : 'n^+') + lab(xb, 166, pnp ? 'n' : 'p') + lab((xC + xC1) / 2, 166, pnp ? 'p' : 'n');
    // the main carrier flow, and the back-injected carriers
    s += arrow(92, 124, 498, 124, { cls: 'thick', color: 'accent', s: 11 });
    s += lab(100, 108, pnp ? '\\text{holes}' : '\\text{electrons}', 'l');
    s += arrow(276, 150, 182, 150, { cls: 'dash', color: 'dim' });
    s += lab(176, 150, pnp ? '\\text{electrons}' : '\\text{holes}', 'r', 'small');
    // the field in the BC depletion region: from the n side to the p side
    s += pnp ? arrow(296, 100, 322, 100, { color: 'dim', s: 6 }) : arrow(322, 100, 296, 100, { color: 'dim', s: 6 });
    s += lab(331, 100, '\\mathcal{E}', 'l', 'small');
    // terminal currents (conventional)
    if (!pnp) {
      s += arrow(56, ym, 34, ym, { color: 'dim', s: 7 }) + lab(45, ym - 14, 'I_E', 'c', 'small');
      s += arrow(552, ym, 530, ym, { color: 'dim', s: 7 }) + lab(541, ym - 14, 'I_C', 'c', 'small');
      s += arrow(xb, 42, xb, 66, { color: 'dim', s: 7 }) + lab(xb - 7, 56, 'I_B', 'r', 'small');
    } else {
      s += arrow(34, ym, 56, ym, { color: 'dim', s: 7 }) + lab(45, ym - 14, 'I_E', 'c', 'small');
      s += arrow(530, ym, 552, ym, { color: 'dim', s: 7 }) + lab(541, ym - 14, 'I_C', 'c', 'small');
      s += arrow(xb, 66, xb, 42, { color: 'dim', s: 7 }) + lab(xb - 7, 54, 'I_B', 'r', 'small');
    }
    s += lab(xB + 2, 200, `\\text{BE junction: forward biased}`, 'r', 'small') + lab(xC - 2, 200, `\\text{BC junction: reverse biased}`, 'l', 'small');
    return svg(W, H, s, pnp ? 'PNP transistor cross-section' : 'NPN transistor cross-section');
  }

  // electron density across the base (straight lines), for three stories: V_BE up, the Early effect, saturation
  const profAxes = { w: 440, h: 250, x: [0, 1.12], y: [0, 2.4], xl: '\\text{position in the base, }x', yl: 'n_p(x)', grid: false };
  const profVbe = plot(Object.assign({}, profAxes, {
    xt: [[0, '0'], [1, 'W_B']], yt: [[1, 'n_p(0)'], [2, '2n_p(0)']],
    curves: [{ pts: [[0, 1], [1, 0]] }, { pts: [[0, 2], [1, 0]], cls: 'dash' }],
    labels: [{ x: 0.07, y: 1.12, t: 'n_{p0}e^{V_{BE}/V_T}', a: 'l' }, { x: 0.07, y: 2.12, t: 'V_{BE} + 17\\,\\text{mV}', a: 'l' },
      { x: 0.06, y: 0.32, t: '\\text{slope} \\propto I_C', a: 'l' }],
    aria: 'electron density across the base',
  }));

  // the transistor symbol with its three currents
  const npnCur = [['npn', [1, 1]], ['w', [1, 0], [1, -0.7]], ['iarr', [1, -0.35], 'd', { n: 'I_C' }],
    ['w', [0, 1], [-0.8, 1]], ['iarr', [-0.4, 1], 'r', { n: 'I_B' }], ['w', [1, 2], [1, 2.7]], ['iarr', [1, 2.35], 'd', { n: 'I_E' }],
    ['txt', [0.78, -0.62], '$C$', { a: 'r' }], ['txt', [-0.8, 0.7], '$B$'], ['txt', [0.78, 2.62], '$E$', { a: 'r' }]];

  // I_C against V_BE: linear and logarithmic axes (I_S chosen so that 0.7 V gives 1 mA)
  const icLin = plot({
    w: 440, h: 260, x: [0.55, 0.76], y: [0, 4.5], xt: [0.55, 0.6, 0.65, 0.7, 0.75], yt: [0, 1, 2, 3, 4],
    xl: 'V_{BE}\\ (\\text{V})', yl: 'I_C\\ (\\text{mA})',
    curves: [{ f: (v) => Math.exp((v - 0.7) / 0.025) }],
    marks: [{ x: 0.7, y: 1, n: '0.7\\,\\text{V},\\ 1\\,\\text{mA}', a: 'r' }, { x: 0.7173, y: 2, n: '0.717\\,\\text{V},\\ 2\\,\\text{mA}', a: 'r' }],
    aria: 'collector current against base-emitter voltage',
  });
  const icLog = plot({
    w: 440, h: 270, x: [0.45, 0.8], y: [-8, -1], xt: [0.5, 0.6, 0.7, 0.8],
    yt: [[-8, '10\\,\\text{nA}'], [-7, '100\\,\\text{nA}'], [-6, '1\\,\\mu\\text{A}'], [-5, '10\\,\\mu\\text{A}'], [-4, '100\\,\\mu\\text{A}'], [-3, '1\\,\\text{mA}'], [-2, '10\\,\\text{mA}'], [-1, '100\\,\\text{mA}']],
    ml: 70, xl: 'V_{BE}\\ (\\text{V})', yl: 'I_C\\ (\\text{log scale})',
    curves: [{ f: (v) => Math.log10(1e-3 * Math.exp((v - 0.7) / 0.025)) }],
    lines: [{ x1: 0.6424, y1: -4, x2: 0.7, y2: -4, cls: 'dc' }, { x1: 0.7, y1: -4, x2: 0.7, y2: -3, cls: 'dc' }],
    marks: [{ x: 0.7, y: -3, n: '' }, { x: 0.6424, y: -4, n: '' }],
    labels: [{ x: 0.671, y: -4.38, t: '57.6\\,\\text{mV}' }, { x: 0.706, y: -3.5, t: '\\times10', a: 'l' }],
    aria: 'collector current on a log scale against base-emitter voltage',
  });

  // ================================================================== 6.1 how it works
  L({
    id: 'bk06-how', title: 'How a BJT works: emitter, thin base, collector', ref: 'Lectures 21–22',
    steps: [
      R(md`
        ### Chapter 6 at a glance

        Exam 2 was built on a transistor whose input draws no current: a MOSFET's gate is one plate of a capacitor. This chapter builds the other kind of transistor, the **bipolar junction transistor (BJT)**, from the inside out. Its input, the base, *does* draw a small current, and that one fact is behind almost every difference you will meet between the two devices.

        By the end of the chapter you will be able to:
        - explain in a few sentences why a forward-biased junction next to a thin base gives $I_C = I_Se^{V_{BE}/V_T}$, and where the base current and $\beta$ come from;
        - name the region of any NPN or PNP from its node voltages, and say why BJT "saturation" is the MOSFET's triode;
        - find the DC operating point of a bias circuit by **assume active, solve, check**: base resistor, emitter resistor, divider, split supply, PNP, a saturated switch, capacitors;
        - explain the Early effect, the BJT's version of channel-length modulation.

        **What you need first:** KCL, KVL and Thévenin, and the diode law with its $25\,\text{mV}$ scale ([Chapter 1](#/l/bk01-diode)). [Chapter 7](#/l/bk07-gm) then turns everything here into the small-signal model.
      `),
      R(md`
        ### The question

        A MOSFET controls current like a tap: the gate voltage pulls charge into a channel, and the drain voltage pushes that charge along. A BJT works on a different principle, and its two famous equations come straight out of it:
        $$I_C = I_S\,e^{V_{BE}/V_T},\qquad I_B = \frac{I_C}{\beta}.$$
        In this section we open the device up and see where each one comes from. You never derive them on the exam, but you use their consequences in every BJT problem: why $V_{BE}\approx0.7\,\text{V}$, why the collector acts like a current source, why the base draws current at all, and why $\beta$ is not a number to trust.
      `),
      RF(md`
        ### The physical picture: a sandwich with a thin middle

        An NPN transistor is three regions of silicon in a row: an **n-type emitter**, a **p-type base** and an **n-type collector**. That makes two pn junctions back to back: base–emitter (BE) and base–collector (BC). Three facts about the sandwich turn it into a transistor.

        1. **The emitter is doped very heavily** (about $10^{19}$ to $10^{20}$ donors per cm³, written n⁺), the base moderately (about $10^{17}$ acceptors per cm³), the collector lightly.
        2. **The base is thin**: a fraction of a micrometre, far less than the distance an electron can wander in p-type silicon before it meets a hole and recombines (tens of micrometres).
        3. **In normal use the BE junction is forward biased and the BC junction is reverse biased.** For an NPN: $V_{BE}\approx0.7\,\text{V}$, and the collector sits above the base.

        [[fig:xsec]]

        The current is carried across in three steps: the emitter **injects** electrons into the base, they **diffuse** across it, and the collector **collects** them. Take them one at a time.
      `, { xsec: { fig: xsec(false), cap: 'An NPN in forward-active operation. Electrons (blue arrow) leave the emitter, cross the thin base and are swept into the collector by the field $\\mathcal{E}$ of the reverse-biased BC junction (shaded). A few holes go the other way, back into the emitter (dashed). Conventional current flows opposite to the electrons: into the collector and the base, out of the emitter.' } }),
      R(md`
        ### Step 1: the emitter junction injects electrons

        The BE junction is an ordinary diode, forward biased. Forward bias lowers the potential barrier between emitter and base by $V_{BE}$, and electrons from the crowded emitter spill over into the base. How many? The answer is the Boltzmann factor you met in the diode: lowering a barrier by $V_{BE}$ multiplies the number of electrons with enough energy to cross it by $e^{V_{BE}/V_T}$, where $V_T = kT/q\approx25\,\text{mV}$ at room temperature.

        So at the emitter edge of the base ($x = 0$) the electron density is
        $$n_p(0) = n_{p0}\,e^{V_{BE}/V_T}.$$
        Here $n_{p0} = n_i^2/N_B$ is the tiny density of electrons the p-type base holds on its own ($n_i\approx10^{10}\,\text{cm}^{-3}$ in silicon, $N_B$ the base doping; with $N_B = 10^{17}\,\text{cm}^{-3}$ that is only $10^3$ electrons per cm³). Every $25\,\text{mV}$ more on the junction multiplies $n_p(0)$ by $e\approx2.7$; every $58\,\text{mV}$ multiplies it by 10.
      `),
      RF(md`
        ### Step 2: the electrons diffuse across the thin base

        In the base the injected electrons are a small minority in a sea of holes, and there is almost no electric field to push them. They move by **diffusion**: random thermal motion that carries particles from where they are crowded to where they are scarce, at a rate proportional to the slope of their density. At the far edge of the base ($x = W_B$) the density is held at about zero, because every electron that arrives there is swept into the collector (step 3).

        The base is much thinner than the distance an electron survives, so almost none are lost on the way. With no losses the flow is the same at every $x$, so the slope is the same everywhere: **the density falls in a straight line** from $n_p(0)$ to zero.

        [[fig:prof]]
      `, { prof: { fig: profVbe, cap: 'Electron density across the base. Raising $V_{BE}$ by $V_T\\ln2 = 17\\,\\text{mV}$ doubles $n_p(0)$ (dashed line): the slope doubles, so the current doubles.' } }),
      R(md`
        ### The derivation: from a slope to $I_C = I_Se^{V_{BE}/V_T}$

        A diffusion current through an area $A_E$ (the emitter area) is $qA_ED_n$ times the slope of the density, where $D_n$ is the electrons' diffusion constant in the base (about $20\,\text{cm}^2/\text{s}$). For a straight line from $n_p(0)$ at $x = 0$ down to zero at $x = W_B$ the slope is $n_p(0)/W_B$. So the current that reaches the collector is
        $$I_C = qA_ED_n\,\frac{n_p(0)}{W_B}.$$
        Now put in step 1's $n_p(0) = (n_i^2/N_B)\,e^{V_{BE}/V_T}$:
        $$I_C = \frac{qA_ED_nn_i^2}{N_BW_B}\,e^{V_{BE}/V_T}.$$
        Everything in front of the exponential is a property of the transistor, not of the circuit. We call it $I_S$, the **saturation current** (a historical name: nothing saturates).

        !!key The collector current
          $$I_C = I_S\,e^{V_{BE}/V_T},\qquad I_S = \frac{qA_ED_nn_i^2}{N_BW_B}$$
          The emitter junction sets the electron density at one end of the base; the thin base turns that density into a slope; the slope is the current.
      `),
      R(md`
        ### Check it

        **Units.** $q$ (C) times $A_E$ (cm²) times $D_n$ (cm²/s) times $n_i^2$ (cm⁻⁶), divided by $N_B$ (cm⁻³) times $W_B$ (cm), is C/s: amperes. ✓

        **A number.** Take $A_E = 100\,\mu\text{m}^2 = 10^{-6}\,\text{cm}^2$, $D_n = 20\,\text{cm}^2/\text{s}$, $n_i = 10^{10}\,\text{cm}^{-3}$, $N_B = 10^{17}\,\text{cm}^{-3}$ and $W_B = 0.2\,\mu\text{m} = 2\times10^{-5}\,\text{cm}$:
        $$I_S = \frac{(1.6\times10^{-19})(10^{-6})(20)(10^{20})}{(10^{17})(2\times10^{-5})} = 1.6\times10^{-16}\,\text{A}.$$
        A useful $1\,\text{mA}$ then needs $V_{BE} = V_T\ln(I_C/I_S) = 25\,\text{mV}\times\ln(6.25\times10^{12}) = 25\,\text{mV}\times29.5 = 0.737\,\text{V}$.

        **That is where "about 0.7 V" comes from.** $I_S$ is so small (it carries $n_i^2$) that the exponential has to climb about 29 factors of $e$ before the current is useful.

        **Limits.** A thinner base gives a steeper slope, so more current at the same $V_{BE}$ ($I_S\propto1/W_B$). A bigger emitter area gives proportionally more ($I_S\propto A_E$). A more heavily doped base gives *less*, because it holds fewer electrons to begin with ($n_{p0} = n_i^2/N_B$).
      `),
      R(md`
        ### Step 3: the collector collects

        At the far side of the base the electrons reach the depletion region of the reverse-biased BC junction. Its electric field points from the n collector toward the p base, so it pushes electrons *into* the collector. Every electron that reaches the edge is swept across, which is why the density there is pinned at zero.

        Here is the key point: **how hard the collector pulls does not matter.** Raise $V_{CB}$ and the field gets stronger, but the electrons are already removed as fast as they arrive; the arrival rate was set back at the emitter by $V_{BE}$. It is like a waterfall: making the cliff taller does not change how much water goes over the edge each second.

        So the collector acts like a **current source**: $I_C$ depends on $V_{BE}$ and hardly at all on $V_{CE}$. (The "hardly" is the Early effect: a stronger reverse bias eats a little into the base and steepens the slope. That is [Section 6.8](#/l/bk06-early).)

        !!intuition The BC junction is reverse biased, yet a big current flows through it
          That current is not diode conduction. On its own the reverse-biased junction would carry almost nothing; it carries $I_C$ only because the emitter keeps feeding electrons into the thin base right next to it. *The Art of Electronics* calls this "transistor action".

          This is also why **two separate diodes wired back to back do not make a transistor.** Their "base" is millimetres of wire and silicon, far longer than an electron's survival distance, so every injected electron recombines before it reaches the second junction.
      `),
      R(md`
        ### Step 4: the base current, and where $\beta$ comes from

        If the story stopped there, the base would carry no current at all, just like a gate. It does carry a little, through two leaks.

        1. **Back-injection.** A forward-biased junction pushes carriers both ways: electrons from the emitter into the base, and also holes from the base into the emitter (the dashed arrow above). Those holes come in through the base lead. Because the emitter is doped about 100 times more heavily than the base, there are roughly 100 electrons going forward for every hole going back.
        2. **Recombination.** A few of the electrons crossing the base meet a hole and disappear. Each lost hole is replaced through the base lead. The base is thin, so the fraction lost is small: about $W_B^2/(2L_n^2)$, where $L_n$ is the electrons' survival distance (the diffusion length).

        Both leaks are driven by the same forward-biased junction, so **both grow with the same $e^{V_{BE}/V_T}$ as $I_C$**. Their ratio to $I_C$ is therefore fixed by how the transistor was built, not by the bias. That fixed ratio is $\beta$:
        $$I_B = \frac{I_C}{\beta}.$$
      `),
      R(md`
        **A number.** Suppose back-injection alone would make $I_C/I_B = 100$, and the base is $1/20$ of $L_n$, so recombination loses $\tfrac12(1/20)^2 = 1/800$ of the electrons. The base lead must supply both leaks:
        $$I_B = \frac{I_C}{100} + \frac{I_C}{800}\quad\Rightarrow\quad\frac1\beta = \frac1{100} + \frac1{800}\quad\Rightarrow\quad\beta = 88.9.$$
        The bigger leak sets $\beta$ (the leaks add like conductances, so the result is below the smaller of 100 and 800). Real small-signal transistors have $\beta$ between about 50 and 300.
      `),
      R(md`
        ### $\alpha$: the fraction that arrives

        KCL on the whole transistor (charge cannot pile up inside it) gives the emitter current:
        $$I_E = I_C + I_B = \beta I_B + I_B = (\beta + 1)I_B.$$
        The fraction of the emitter current that reaches the collector is called $\alpha$:
        $$\alpha = \frac{I_C}{I_E} = \frac{\beta I_B}{(\beta + 1)I_B} = \frac{\beta}{\beta + 1}.$$
        Solving for $\beta$ instead: $\alpha(\beta + 1) = \beta$, so $\beta = \dfrac{\alpha}{1 - \alpha}$.

        | $\beta$ | 50 | 100 | 200 |
        |---|---|---|---|
        | $\alpha$ | 0.9804 | 0.9901 | 0.9950 |

        $\alpha$ is always just below 1: the emitter and collector currents are almost equal, and the base supplies the difference, about $1/\beta$ of the total. Notice how sensitive $\beta$ is to $\alpha$: going from $\alpha = 0.990$ to $0.995$, a change of half a percent, doubles $\beta$ from 99 to 199.

        !!key The three currents (forward active)
          $$I_C = \beta I_B,\qquad I_E = I_C + I_B = (\beta + 1)I_B,\qquad I_C = \alpha I_E,\qquad \alpha = \frac{\beta}{\beta + 1}$$
      `),
      R(md`
        ### What it means

        Read the equations as a story with a cause. **$V_{BE}$ is the cause:** it sets the electron density at the emitter edge of the base, and so the collector current. The base current is a side effect, a small tax the device charges for the control; $\beta$ is the ratio of the current to the tax.

        $\beta$ is a ratio of two small leaks, set by doping and base width, so it varies a lot: by a factor of 2 or 3 between transistors of the same part number, and with temperature and current. **Good circuits are designed so that their currents do not depend on $\beta$.** [DC analysis](#/l/bk06-dc) shows how.

        ### How to recognize it

        On a schematic the **arrow marks the emitter** and points the way conventional current flows in it: out of an NPN. Current goes into the collector and into the base, and the sum leaves by the emitter. The symbol is drawn the way the device is used, collector on top toward the supply, emitter at the bottom.
      `, npnCur),
      R(md`
        ### Worked example: what a thinner base buys

        A transistor has back-injection limited to $I_C/I_B = 100$ and a base $1/20$ of the diffusion length, so $\beta = 88.9$ (above). The designer halves the base width. What happens to $\beta$, and to the $V_{BE}$ needed for the same $I_C$?

        **Recombination.** The lost fraction goes as $W_B^2$, so halving $W_B$ divides it by 4: $1/800\to1/3200$. Back-injection depends on the doping, not on $W_B$ in this simple picture, so it stays at $1/100$:
        $$\frac1\beta = \frac1{100} + \frac1{3200}\quad\Rightarrow\quad\beta = 97.0.$$
        **$I_S$.** $I_S\propto1/W_B$, so $I_S$ doubles. For the same $I_C$ the exponential needs a factor of 2 less: $V_{BE}$ drops by $V_T\ln2 = 17.3\,\text{mV}$.

        **Lesson.** Once recombination is the smaller leak, thinning the base helps $\beta$ only a little (88.9 to 97.0): back-injection, set by the emitter-to-base doping ratio, takes over.

        !!mistake Common mistakes
          - Thinking the base current *causes* the collector current, as if $\beta$ amplified it inside the device. Both are caused by $V_{BE}$; their ratio is $\beta$. (For DC *calculations* the current-amplifier view is still the right tool: see [the next section](#/l/bk06-laws).)
          - Thinking the collector current is forward conduction of the BC diode. That junction is reverse biased; the current is electrons swept across from the base.
          - Writing $I_E = \beta I_B$. The emitter carries both currents: $I_E = (\beta + 1)I_B$.
          - Mixing up $\alpha$ and $\beta$: $\alpha = I_C/I_E$ is just under 1; $\beta = I_C/I_B$ is about 100.
      `),
      Q(md`Why must the base of a BJT be thin?`,
        ['So the injected electrons cross it before they recombine; otherwise they never reach the collector', 'So the base has a low resistance', 'So that $V_{BE}$ comes out near $0.7\\,\\text{V}$', 'So that the base–collector junction is reverse biased'], 0,
        [null, 'A thin base actually has *more* resistance along it. Thinness is about the electrons surviving the trip, not about resistance.', '$0.7\\,\\text{V}$ comes from $I_S$ being tiny ($n_i^2$ over the doping). The base width changes $I_S$ only in proportion, a few millivolts of $V_{BE}$.', 'Junction bias is set by the circuit (where the collector voltage sits), not by the geometry.'],
        md`Electrons cross the base by diffusion and recombine if they linger. With $W_B\ll L_n$ only a fraction $W_B^2/(2L_n^2)$ is lost, so almost all of them reach the collector. A thick base would turn the device into two diodes back to back.`),
      Q(md`In forward active the base–collector junction of an NPN is **reverse** biased, yet about $1\,\text{mA}$ flows through it. Why?`,
        ['Electrons injected by the emitter reach the edge of the BC depletion region, and its field sweeps them into the collector', 'The BC junction is in breakdown', 'The BC junction is actually forward biased in the active region', 'It is the reverse leakage current of the BC diode'], 0,
        [null, 'Breakdown needs tens of volts of reverse bias, and its current would not be controlled by $V_{BE}$.', 'Both junctions forward biased is **saturation**. In forward active the collector sits above the base.', 'Reverse leakage is picoamps to nanoamps, and it does not grow with $V_{BE}$. This current does, exponentially.'],
        md`The reverse-biased junction does not conduct on its own. It carries $I_C$ because the emitter keeps feeding electrons into the thin base right next to it, and the junction's field collects every one that arrives. That is "transistor action".`),
      Q(md`The emitter is doped about 100 times more heavily than the base. What does that buy?`,
        ['A large $\\beta$: the BE junction current is almost all electrons going forward, with few holes coming back', 'A larger collector current at the same $V_{BE}$', 'A larger $V_{BE}$ when the transistor is on', 'It is what makes the BC junction reverse biased'], 0,
        [null, '$I_S = qA_ED_nn_i^2/(N_BW_B)$ depends on the **base** doping, not the emitter doping.', 'The emitter doping hardly moves $V_{BE}$, and a larger $V_{BE}$ is not a goal anyway.', 'The bias of each junction is set by the circuit, not by the doping.'],
        md`Back-injection (holes from base into emitter) is one of the two base-current leaks. Its size relative to $I_C$ goes roughly as $N_B/N_E$, so a heavily doped emitter keeps it small and $\beta$ large.`),
      Q(md`Which statement best describes what sets the collector current of a forward-active BJT?`,
        ['$V_{BE}$ sets the electron density at the emitter end of the base, and that sets $I_C$; $I_B$ is a by-product, $I_C/\\beta$', 'The base current flows through the transistor to the collector and is multiplied by $\\beta$ on the way', 'The collector voltage pulls the current through: more $V_{CE}$, more $I_C$'], 0,
        [null, 'Base current does not travel to the collector. It feeds back-injection and recombination; it is a cost, not the signal that gets amplified.', 'Once the BC junction is reverse biased, $V_{CE}$ hardly matters: the waterfall picture. (A small dependence is the Early effect.)'],
        md`Cause: $V_{BE}$. Effect: $I_C = I_Se^{V_{BE}/V_T}$. Side effect: $I_B = I_C/\beta$. In DC analysis we often *compute* as if $I_B$ set $I_C$ (it is the same equation read backwards), but physically the junction voltage is in charge.`),
      P({
        id: 'bk06-how-cur', title: 'The three currents',
        q: md`A BJT in forward active has $\beta = 150$ and $I_C = 1.5\,\text{mA}$. Find $I_B$, $I_E$ and $\alpha$ (four decimals).`,
        fig: npnCur,
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 10 }, { lbl: 'I_E', unit: 'mA', ans: 1.51, tol: { rel: 0.002 } }, { lbl: '\\alpha', unit: '', ans: 150 / 151, tol: { rel: 0.0006 } }],
        hints: [md`$I_B = I_C/\beta$.`, md`KCL: $I_E = I_C + I_B$. Then $\alpha = I_C/I_E$.`],
        sol: md`
1. $I_B = I_C/\beta = 1.5\,\text{mA}/150 = 10\,\mu\text{A}$.
2. KCL on the device: $I_E = I_C + I_B = 1.5\,\text{mA} + 0.01\,\text{mA} = 1.51\,\text{mA}$ (that is $(\beta + 1)I_B = 151\times10\,\mu\text{A}$ ✓).
3. $\alpha = I_C/I_E = 1.5/1.51 = 150/151 = 0.9934$.`,
      }),
      P({
        id: 'bk06-how-alpha', title: 'How sensitive is beta to alpha?',
        q: md`Two transistors of the same type have $\alpha = 0.990$ and $\alpha = 0.995$. Find each one's $\beta$. By what percentage do their $\alpha$ values differ?`,
        parts: [{ lbl: '\\beta\\ (\\alpha = 0.990)', unit: '', ans: 99, tol: { rel: 0.004 } },
          { lbl: '\\beta\\ (\\alpha = 0.995)', unit: '', ans: 199 }, { lbl: '\\Delta\\alpha/\\alpha', unit: '%', ans: 0.50505, tol: { rel: 0.02 } }],
        hints: [md`Solve $\alpha = \beta/(\beta + 1)$ for $\beta$.`],
        sol: md`
1. $\alpha(\beta + 1) = \beta\Rightarrow\beta(1 - \alpha) = \alpha\Rightarrow\beta = \dfrac{\alpha}{1 - \alpha}$.
2. $\alpha = 0.990$: $\beta = 0.990/0.010 = 99$.
3. $\alpha = 0.995$: $\beta = 0.995/0.005 = 199$.
4. The $\alpha$ values differ by $0.005/0.990 = 0.505\%$.

Half a percent in $\alpha$ doubles $\beta$. $\alpha$ is close to 1 and well controlled; $\beta$ depends on the tiny difference $1 - \alpha$, which is why it is so unpredictable. Circuits should depend on $\alpha$ (or on nothing), never on $\beta$.`,
      }),
      P({
        id: 'bk06-how-leaks', title: 'Two leaks make one beta',
        q: md`In a transistor, back-injection of holes into the emitter alone would give $I_C/I_B = 150$, and recombination in the base loses $1/600$ of the electrons that cross it. Find $\beta$, and the base current at $I_C = 1.2\,\text{mA}$.`,
        parts: [{ lbl: '\\beta', unit: '', ans: 120, traps: [{ v: 150, msg: 'That is back-injection alone. The base must also replace the holes lost to recombination: the two base-current pieces add.' }, { v: 750, msg: 'Adding the ratios is not right: the two **currents** add, $I_B = I_C/150 + I_C/600$, so the reciprocals of the ratios add.' }] }, { lbl: 'I_B', unit: 'µA', ans: 10 }],
        hints: [md`Write each leak as a fraction of $I_C$ and add the currents: $I_B = I_C/150 + I_C/600$.`],
        sol: md`
1. The base supplies both leaks: $I_B = \dfrac{I_C}{150} + \dfrac{I_C}{600}$.
2. Divide by $I_C$: $\dfrac1\beta = \dfrac1{150} + \dfrac1{600} = \dfrac{4 + 1}{600} = \dfrac{1}{120}$, so $\beta = 120$.
3. $I_B = 1.2\,\text{mA}/120 = 10\,\mu\text{A}$ (of which $8\,\mu\text{A}$ is back-injection and $2\,\mu\text{A}$ recombination).`,
      }),
      P({
        id: 'bk06-how-thin', title: 'A wider base costs beta',
        q: md`A transistor has a base $W_B = 0.3\,\mu\text{m}$ wide, an electron diffusion length $L_n = 15\,\mu\text{m}$ in the base, and back-injection that alone would give $I_C/I_B = 150$. Using a recombination loss of $W_B^2/(2L_n^2)$, find $\beta$. Then find $\beta$ for a base twice as wide.`,
        parts: [{ lbl: '\\beta\\ (0.3\\,\\mu\\text{m})', unit: '', ans: 145.631 }, { lbl: '\\beta\\ (0.6\\,\\mu\\text{m})', unit: '', ans: 133.929 }],
        hints: [md`Recombination fraction: $\tfrac12(0.3/15)^2$.`, md`$1/\beta = 1/150 + \text{(recombination fraction)}$. Doubling $W_B$ multiplies the fraction by 4.`],
        sol: md`
1. Recombination loses $\tfrac12\left(\dfrac{0.3}{15}\right)^2 = \tfrac12(0.02)^2 = 2\times10^{-4}$ of the electrons, i.e. it alone would give $I_C/I_B = 5000$.
2. $\dfrac1\beta = \dfrac1{150} + 2\times10^{-4} = 6.867\times10^{-3}$, so $\beta = 145.6$.
3. Twice as wide: the fraction grows 4 times, $8\times10^{-4}$ (alone: 1250). $\dfrac1\beta = \dfrac1{150} + 8\times10^{-4} = 7.467\times10^{-3}$, so $\beta = 133.9$.

The thicker base also halves $I_S$, so the same current needs $17\,\text{mV}$ more $V_{BE}$.`,
      }),
      P({
        id: 'bk06-how-is', title: 'Where 0.7 V comes from',
        q: md`A transistor has emitter area $A_E = 200\,\mu\text{m}^2$, base doping $N_B = 2\times10^{17}\,\text{cm}^{-3}$, base width $W_B = 0.1\,\mu\text{m}$ and $D_n = 15\,\text{cm}^2/\text{s}$. Use $n_i = 10^{10}\,\text{cm}^{-3}$, $q = 1.6\times10^{-19}\,\text{C}$. Find $I_S$ (in units of $10^{-16}\,\text{A}$) and the $V_{BE}$ for $I_C = 1\,\text{mA}$.`,
        parts: [{ lbl: 'I_S', unit: '\\times10^{-16}\\,\\text{A}', ans: 2.4 }, { lbl: 'V_{BE}', unit: 'mV', ans: 726.45, tol: { rel: 0, abs: 1.5 } }],
        hints: [md`Convert to cm: $200\,\mu\text{m}^2 = 2\times10^{-6}\,\text{cm}^2$, $0.1\,\mu\text{m} = 10^{-5}\,\text{cm}$.`, md`$I_S = qA_ED_nn_i^2/(N_BW_B)$; then $V_{BE} = V_T\ln(I_C/I_S)$.`],
        sol: md`
1. $I_S = \dfrac{(1.6\times10^{-19})(2\times10^{-6})(15)(10^{20})}{(2\times10^{17})(10^{-5})} = \dfrac{4.8\times10^{-4}}{2\times10^{12}} = 2.4\times10^{-16}\,\text{A}$.
2. $V_{BE} = V_T\ln\dfrac{I_C}{I_S} = 25\,\text{mV}\times\ln\dfrac{10^{-3}}{2.4\times10^{-16}} = 25\,\text{mV}\times\ln(4.17\times10^{12}) = 25\,\text{mV}\times29.06 = 726\,\text{mV}$.

About $0.7\,\text{V}$ again: whatever the details, $I_S$ is around $10^{-16}$ to $10^{-14}\,\text{A}$, and the logarithm of $10^{12}$ is about 28.`,
      }),
      R(md`
        ### Drill: the three currents

        Given any two of $I_B$, $I_C$, $I_E$, $\alpha$, $\beta$, find the rest. Keep the picture: the emitter current splits into a large collector current and a small base current.
      `),
      G('bk_cur', { need: 4 }),
    ],
  });

  // ================================================================== 6.2 the equations, felt
  L({
    id: 'bk06-laws', title: 'The equations, felt: 60 mV per decade and two ways to see a BJT', ref: 'Lectures 21–22',
    steps: [
      R(md`
        ### The question

        [The last section](#/l/bk06-how) gave $I_C = I_Se^{V_{BE}/V_T}$ and $I_B = I_C/\beta$. This one turns them into numbers you can do in your head. Why do we treat $V_{BE}$ as a fixed $0.7\,\text{V}$ when the law says it varies? When do we think of the BJT as a current amplifier, and when as a voltage-controlled current source? Every DC problem on Exam 3 uses the answers.
      `),
      RF(md`
        ### The physical picture: a very steep curve

        Plot the law on ordinary axes and it looks like a switch: nothing, nothing, then a wall of current around $0.65\,\text{V}$. That "turn-on" is an illusion of the linear scale. The exponential grows by the same *factor* for every $25\,\text{mV}$; on a linear axis everything below the last few factors looks like zero.

        [[fig:lin]]

        On a logarithmic current axis the same law is a **straight line**: every factor of 10 in current costs the same step in voltage, $V_T\ln10 = 57.6\,\text{mV}$. Over nine decades, from nanoamps to tens of milliamps, a silicon BJT obeys it remarkably well.

        [[fig:log]]
      `, { lin: { fig: icLin, cap: 'The law on linear axes ($I_S$ chosen so that $0.7\\,\\text{V}$ gives $1\\,\\text{mA}$). Every $17\\,\\text{mV}$ doubles the current.' }, log: { fig: icLog, cap: 'The same law with the current on a log scale: a straight line, $57.6\\,\\text{mV}$ per decade.' } }),
      R(md`
        ### The derivation: voltage steps for current ratios

        Write the law at two currents of the same transistor and divide. $I_S$ cancels:
        $$\frac{I_{C2}}{I_{C1}} = \frac{I_Se^{V_{BE2}/V_T}}{I_Se^{V_{BE1}/V_T}} = e^{(V_{BE2} - V_{BE1})/V_T}.$$
        Take the logarithm of both sides:
        $$\Delta V_{BE} = V_{BE2} - V_{BE1} = V_T\ln\frac{I_{C2}}{I_{C1}}.$$

        | Current ratio | $\times2$ | $\times10$ | $\times100$ | $\times1000$ |
        |---|---|---|---|---|
        | $\Delta V_{BE}$ | $17.3\,\text{mV}$ | $57.6\,\text{mV}$ | $115\,\text{mV}$ | $173\,\text{mV}$ |

        !!key The exponential in numbers ($V_T = 25\,\text{mV}$)
          $$\Delta V_{BE} = V_T\ln\frac{I_{C2}}{I_{C1}}$$
          About $18\,\text{mV}$ doubles the current; about $60\,\text{mV}$ multiplies it by 10. Going the other way, a factor of 10 in current moves $V_{BE}$ by only $60\,\text{mV}$.
      `),
      R(md`
        ### Why "$V_{BE} = 0.7\,\text{V}$" is good enough for DC

        From $10\,\mu\text{A}$ to $10\,\text{mA}$, a factor of 1000 in current, $V_{BE}$ moves by only $173\,\text{mV}$ (from $0.585$ to $0.758\,\text{V}$ for a transistor that gives $1\,\text{mA}$ at $0.7\,\text{V}$). In a bias circuit the base loop usually has a few volts across its resistors, so an error of a few tens of millivolts in $V_{BE}$ moves the current by only a few percent.

        **A number.** A source holds the base at $V_B = 3\,\text{V}$ and $R_E = 2.3\kO$ sits under the emitter. With $0.7\,\text{V}$ we get $I_E = (3 - 0.7)/2.3\kO = 1\,\text{mA}$. Now put in a transistor ten times bigger, which needs only $0.642\,\text{V}$ for $1\,\text{mA}$ ($57.6\,\text{mV}$ less). Its current settles where the two equations agree:
        $$I_E = \frac{3\,\text{V} - V_{BE}}{2.3\kO},\qquad V_{BE} = 0.642\,\text{V} + V_T\ln\frac{I_E}{1\,\text{mA}}.$$
        Try $I_E = 1\,\text{mA}$: $V_{BE} = 0.642\,\text{V}$, so $I_E = 2.358/2.3 = 1.025\,\text{mA}$. Again: $V_{BE} = 0.643\,\text{V}$, $I_E = 1.025\,\text{mA}$. Settled: **2.5% more current from a transistor with 10 times the $I_S$.** The resistor, not the transistor, sets the current. (Here we let $I_C\approx I_E$, which costs about 1%.)

        !!intuition Two ways to hold a BJT
          Hold $V_{BE}$ fixed and the current is at the mercy of $I_S$, which varies between parts and roughly doubles every few degrees. Hold the **current** fixed with resistors and $V_{BE}$ just adjusts itself by a few tens of millivolts. Good bias circuits always do the second.
      `),
      R(md`
        ### Temperature, briefly

        $I_S$ grows steeply with temperature. The rule of thumb from *The Art of Electronics*: **at a fixed current, $V_{BE}$ falls by about $2.1\,\text{mV}$ per °C.** Turned around: at a fixed $V_{BE}$, the current grows by $e^{2.1/25}\approx1.09$, about 9% per °C (with $V_T = 25\,\text{mV}$).

        Over a 30 °C warm-up that is a factor $e^{30\times2.1/25} = e^{2.52}\approx12$. A transistor biased by a fixed $V_{BE}$ would see its current grow twelvefold, heat itself more, and run away. That is the second reason bias circuits fix the current, not the voltage.
      `),
      R(md`
        ### The model: two ways to see the same device

        | View | Equation | Use it for |
        |---|---|---|
        | **current amplifier** | $I_C = \beta I_B$, with $V_{BE}\approx0.7\,\text{V}$ | DC analysis: the base loop gives $I_B$, then $I_C$ |
        | **transconductance device** | $I_C = I_Se^{V_{BE}/V_T}$ | small signals ($g_m$ in Chapter 7), ratios, temperature |

        Both are the same device. The current-amplifier view is a convenient way to *compute*: around a bias point $V_{BE}$ barely moves, so we freeze it at $0.7\,\text{V}$, and the base current, which the resistors set, then fixes $I_C$. The transconductance view is how the device *works*, and it is the one we linearize in [Chapter 7](#/l/bk07-gm): a small change of $V_{BE}$ makes a change of $I_C$.

        !!method The DC model of a forward-active NPN
          - Between base and emitter: a fixed drop $V_{BE} = 0.7\,\text{V}$ (a diode that is on).
          - Into the collector: a current $I_C = \beta I_B$, whatever the collector voltage (as long as $V_C\ge V_B$).
          - Out of the emitter: $I_E = (\beta + 1)I_B$.
      `),
      R(md`
        ### Check it, and what it means

        **Check.** $V_T\ln10 = 0.025\times2.3026 = 57.6\,\text{mV}$ ✓. In base-10 logarithms the rule reads $\Delta V_{BE} = 2.303\,V_T\log_{10}(\text{ratio})$, which is where "60 mV per decade" comes from. Units: $V_T$ in volts times a pure number ✓.

        **What it means.** The logarithm squashes huge current ratios into small voltage steps. So: in DC work, $V_{BE}$ is "about $0.7\,\text{V}$" and the circuit around it sets the current. When you need a current *ratio* (two transistors, two operating points), use $V_T\ln$, never $0.7\,\text{V}$.

        ### How to recognize it

        - Two transistors at **the same $V_{BE}$** (bases tied, emitters tied): their currents are in the ratio of their areas ($I_S$). That is the current mirror.
        - **The same transistor at two currents**: $\Delta V_{BE} = V_T\ln(\text{ratio})$.
        - **A bias circuit with volts across its resistors**: use $0.7\,\text{V}$ and do not worry.
      `),
      R(md`
        ### Worked example: a measured transistor

        A bench test gives $I_C = 2\,\text{mA}$ at $V_{BE} = 680\,\text{mV}$ with $I_B = 16\,\mu\text{A}$. Find $\beta$, $I_E$, $\alpha$, $I_S$, the $V_{BE}$ at $0.5\,\text{mA}$, and $I_C$ at $V_{BE} = 720\,\text{mV}$.

        1. $\beta = I_C/I_B = 2\,\text{mA}/16\,\mu\text{A} = 125$.
        2. $I_E = I_C + I_B = 2.016\,\text{mA}$, and $\alpha = I_C/I_E = 125/126 = 0.9921$.
        3. $I_S = I_Ce^{-V_{BE}/V_T} = 2\,\text{mA}\times e^{-680/25} = 2\,\text{mA}\times e^{-27.2} = 3.08\times10^{-15}\,\text{A}$.
        4. A quarter of the current: $\Delta V_{BE} = 25\,\text{mV}\times\ln(0.25) = -34.7\,\text{mV}$, so $V_{BE} = 645.3\,\text{mV}$.
        5. $40\,\text{mV}$ more: $I_C = 2\,\text{mA}\times e^{40/25} = 2\,\text{mA}\times4.953 = 9.91\,\text{mA}$.

        Step 5 is the steepness again: $40\,\text{mV}$, about 6% more $V_{BE}$, gives five times the current.

        !!mistake Common mistakes
          - Thinking no current flows below about $0.6\,\text{V}$. It is exponentially small, not zero: $0.5\,\text{V}$ gives about $0.3\,\mu\text{A}$ in the transistor above.
          - Using $0.7\,\text{V}$ to compare two currents of one transistor. For ratios use $\Delta V_{BE} = V_T\ln(\text{ratio})$.
          - Mixing logarithms: $V_T\ln$ (natural log) gives $57.6\,\text{mV}$ per decade; $V_T\log_{10}$ would give a wrong $25\,\text{mV}$ per decade.
          - Forgetting area: a bigger transistor at the same current needs **less** $V_{BE}$.
      `),
      Q(md`A BJT's $V_{BE}$ rises by $60\,\text{mV}$. What happens to its collector current?`,
        ['It grows about 10 times', 'It grows by about 9% ($60\\,\\text{mV}/700\\,\\text{mV}$)', 'It doubles', 'It stays the same: the transistor is on either way'], 0,
        [null, 'That is linear thinking. The law is exponential: each $25\\,\\text{mV}$ multiplies the current by $e$, so $60\\,\\text{mV}$ multiplies it by $e^{2.4}\\approx11$.', 'Doubling takes only $V_T\\ln2 = 17\\,\\text{mV}$.', '"On" is not a fixed current. $I_C$ depends exponentially on $V_{BE}$.'],
        md`$I_{C2}/I_{C1} = e^{60/25} = e^{2.4} = 11.0$: about one decade per $60\,\text{mV}$ (exactly $57.6\,\text{mV}$ per decade).`),
      Q(md`We freeze $V_{BE}$ at $0.7\,\text{V}$ in DC analysis although the law says it depends on the current. Why is that acceptable?`,
        ['A factor of 10 error in current moves $V_{BE}$ by only $60\\,\\text{mV}$, small next to the volts across the bias resistors', 'Because $V_{BE}$ really is exactly $0.7\\,\\text{V}$ for every silicon transistor', 'Because the base current is negligible', 'It is not acceptable; DC analysis needs the exact exponential'], 0,
        [null, 'It varies: $0.6$ to $0.8\\,\\text{V}$ depending on current, size and temperature. The point is that the variation is small in volts.', 'The base current has nothing to do with it: $V_{BE}$ is the drop across the junction.', 'The error is a few percent when the loop has volts of drive; that is why the exam uses $0.7\\,\\text{V}$.'],
        md`The logarithm squashes current errors: $\Delta V_{BE} = V_T\ln(\text{ratio})$. In a loop with a few volts across its resistors, tens of millivolts of $V_{BE}$ change the current by a few percent.`),
      Q(md`Two identical transistors have their bases tied together and their emitters tied together. One is at $25\,^\circ\text{C}$, the other $10\,^\circ\text{C}$ warmer. Roughly how do their collector currents compare?`,
        ['The warm one carries about 2.3 times more', 'They are equal: same $V_{BE}$', 'The warm one carries less', 'The warm one carries about 21% more'], 0,
        [null, 'Same $V_{BE}$ means the same current only at the same temperature. $I_S$ grows with temperature.', 'At a fixed $V_{BE}$ a warmer junction conducts **more**.', 'That is $10\\times2.1\\%$. The growth is about 9% per degree, compounded: $e^{10\\times2.1/25} = e^{0.84}\\approx2.3$.'],
        md`At fixed current $V_{BE}$ falls about $2.1\,\text{mV}/^\circ\text{C}$, so at fixed $V_{BE}$ the current grows by $e^{2.1/25}$ per degree: $e^{0.84} = 2.3$ over $10\,^\circ\text{C}$. That is why transistors that share a $V_{BE}$ must share a temperature.`),
      P({
        id: 'bk06-laws-dv', title: 'Sixty millivolts a decade',
        q: md`A BJT carries $0.5\,\text{mA}$ at $V_{BE} = 650\,\text{mV}$. What $V_{BE}$ gives $5\,\text{mA}$? And $50\,\mu\text{A}$?`,
        parts: [{ lbl: 'V_{BE}\\ (5\\,\\text{mA})', unit: 'mV', ans: 707.565, tol: { rel: 0, abs: 1.5 } }, { lbl: 'V_{BE}\\ (50\\,\\mu\\text{A})', unit: 'mV', ans: 592.435, tol: { rel: 0, abs: 1.5 } }],
        hints: [md`$\Delta V_{BE} = V_T\ln(I_{C2}/I_{C1})$, and $V_T\ln10 = 57.6\,\text{mV}$.`],
        sol: md`
1. Ten times the current: $\Delta V_{BE} = 25\,\text{mV}\times\ln10 = +57.6\,\text{mV}$, so $V_{BE} = 707.6\,\text{mV}$.
2. A tenth of the current: $\Delta V_{BE} = 25\,\text{mV}\times\ln0.1 = -57.6\,\text{mV}$, so $V_{BE} = 592.4\,\text{mV}$.

Two decades of current, only $115\,\text{mV}$ of $V_{BE}$.`,
      }),
      P({
        id: 'bk06-laws-ratio', title: 'From a voltage step to a current ratio',
        q: md`A BJT carries $1\,\text{mA}$. Find $I_C$ after its $V_{BE}$ is raised by $30\,\text{mV}$, and after it is lowered by $50\,\text{mV}$ instead.`,
        parts: [{ lbl: 'I_C\\ (+30\\,\\text{mV})', unit: 'mA', ans: 3.32012, traps: [{ v: 2.2, msg: 'That is the straight-line estimate $1 + 30/25$. $30\\,\\text{mV}$ is not small next to $V_T$: use $e^{30/25}$.' }] },
          { lbl: 'I_C\\ (-50\\,\\text{mV})', unit: 'mA', ans: 0.135335 }],
        hints: [md`$I_{C2} = I_{C1}\,e^{\Delta V_{BE}/V_T}$.`],
        sol: md`
1. $I_C = 1\,\text{mA}\times e^{30/25} = e^{1.2}\,\text{mA} = 3.32\,\text{mA}$.
2. $I_C = 1\,\text{mA}\times e^{-50/25} = e^{-2}\,\text{mA} = 0.135\,\text{mA}$.

The straight line $1 + \Delta V/V_T$ would give $2.2\,\text{mA}$ and $-1\,\text{mA}$ (nonsense). Steps this big are *large-signal*; Chapter 7 says how small a step must be for the straight line to work.`,
      }),
      P({
        id: 'bk06-laws-meas', title: 'Characterize a transistor',
        q: md`A forward-active BJT carries $I_C = 0.5\,\text{mA}$ at $V_{BE} = 650\,\text{mV}$, and its emitter current is measured as $0.505\,\text{mA}$. Find $I_B$, $\beta$, $\alpha$ (four decimals), $I_S$ (in fA, $1\,\text{fA} = 10^{-15}\,\text{A}$), and the $V_{BE}$ at $I_C = 2\,\text{mA}$.`,
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 5 }, { lbl: '\\beta', unit: '', ans: 100 }, { lbl: '\\alpha', unit: '', ans: 100 / 101, tol: { rel: 0.0006 } },
          { lbl: 'I_S', unit: 'fA', ans: 2.55454 }, { lbl: 'V_{BE}\\ (2\\,\\text{mA})', unit: 'mV', ans: 684.657, tol: { rel: 0, abs: 1.5 } }],
        hints: [md`$I_B = I_E - I_C$.`, md`$I_S = I_Ce^{-V_{BE}/V_T}$; four times the current costs $V_T\ln4$.`],
        sol: md`
1. KCL: $I_B = I_E - I_C = 0.505 - 0.5 = 0.005\,\text{mA} = 5\,\mu\text{A}$.
2. $\beta = I_C/I_B = 500/5 = 100$; $\alpha = I_C/I_E = 0.5/0.505 = 0.9901$.
3. $I_S = 0.5\,\text{mA}\times e^{-650/25} = 0.5\,\text{mA}\times e^{-26} = 0.5\times10^{-3}\times5.109\times10^{-12} = 2.55\times10^{-15}\,\text{A} = 2.55\,\text{fA}$.
4. $V_{BE} = 650 + 25\ln4 = 650 + 34.7 = 684.7\,\text{mV}$.`,
      }),
      P({
        id: 'bk06-laws-area', title: 'Same voltage, four times the area',
        q: md`$Q_2$ is built with four times the emitter area of $Q_1$ (so four times the $I_S$); otherwise they are identical and at the same temperature. (a) Their bases are tied together and so are their emitters. $Q_1$ carries $0.25\,\text{mA}$; what does $Q_2$ carry? (b) If instead both carry $1\,\text{mA}$, what is $V_{BE2} - V_{BE1}$?`,
        parts: [{ lbl: 'I_{C2}\\ (a)', unit: 'mA', ans: 1 }, { lbl: 'V_{BE2} - V_{BE1}\\ (b)', unit: 'mV', ans: -34.657, tol: { rel: 0.015, abs: 0.3 }, traps: [{ v: 34.657, msg: 'Wrong sign: the bigger transistor needs **less** $V_{BE}$ for the same current.' }] }],
        hints: [md`Same $V_{BE}$: $I_C\propto I_S$.`, md`Same $I_C$: $V_{BE} = V_T\ln(I_C/I_S)$.`],
        sol: md`
(a) Same $V_{BE}$, so the exponentials are equal and $I_{C2}/I_{C1} = I_{S2}/I_{S1} = 4$: $I_{C2} = 1\,\text{mA}$. A mirror that copies current in the ratio of the areas.

(b) $V_{BE2} - V_{BE1} = V_T\ln\dfrac{I_C}{I_{S2}} - V_T\ln\dfrac{I_C}{I_{S1}} = V_T\ln\dfrac{I_{S1}}{I_{S2}} = 25\,\text{mV}\times\ln\tfrac14 = -34.7\,\text{mV}$.`,
      }),
      P({
        id: 'bk06-laws-robust', title: 'The resistor sets the current',
        q: md`A DC source holds the base at $V_B = 2\,\text{V}$, and $R_E = 1.3\kO$ connects the emitter to ground. Take $I_C\approx I_E$. (a) With the $0.7\,\text{V}$ model, find $I_E$. (b) The actual transistor needs only $640\,\text{mV}$ at $1\,\text{mA}$. Find its true $I_E$ (iterate between $I_E = (2 - V_{BE})/R_E$ and $V_{BE} = 640\,\text{mV} + V_T\ln(I_E/1\,\text{mA})$ until it settles). (c) By what percentage does it differ from (a)?`,
        parts: [{ lbl: 'I_E\\ (a)', unit: 'mA', ans: 1 }, { lbl: 'I_E\\ (b)', unit: 'mA', ans: 1.0453 }, { lbl: '\\text{difference}', unit: '%', ans: 4.53, tol: { rel: 0.06 } }],
        hints: [md`(b) Start at $I_E = 1\,\text{mA}$: $V_{BE} = 0.640\,\text{V}$, so $I_E = 1.36/1.3 = 1.046\,\text{mA}$. One more round.`],
        sol: md`
(a) $I_E = (2 - 0.7)\,\text{V}/1.3\kO = 1\,\text{mA}$.

(b) Round 1: $V_{BE} = 640\,\text{mV}$, $I_E = 1.36\,\text{V}/1.3\kO = 1.0462\,\text{mA}$. Round 2: $V_{BE} = 640 + 25\ln1.0462 = 641.1\,\text{mV}$, $I_E = 1.3589/1.3 = 1.0453\,\text{mA}$. Round 3 changes nothing at this precision: $I_E = 1.045\,\text{mA}$.

(c) $4.5\%$ more than the $0.7\,\text{V}$ estimate, from a $V_{BE}$ that is $60\,\text{mV}$ off. With only $1.3\,\text{V}$ across $R_E$ the error is noticeable; with $3\,\text{V}$ across it would be about $2\%$. More volts across the emitter resistor make the bias less sensitive to the transistor.`,
      }),
      P({
        id: 'bk06-laws-temp', title: 'Why a fixed V_BE is a bad bias',
        q: md`A transistor is biased by holding $V_{BE}$ fixed at the value that gives $1\,\text{mA}$ at $25\,^\circ\text{C}$. The chip warms to $55\,^\circ\text{C}$. With $V_{BE}$ (at fixed current) falling $2.1\,\text{mV}$ per °C and $V_T = 25\,\text{mV}$, what is the new $I_C$?`,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 12.4286, traps: [{ v: 1.63, msg: 'That is $1 + 30\\times2.1\\%$. The growth compounds: $e^{30\\times2.1/25}$.' }] }],
        hints: [md`At $55\,^\circ\text{C}$ the transistor would need $30\times2.1 = 63\,\text{mV}$ less for $1\,\text{mA}$. You are giving it $63\,\text{mV}$ more than it needs.`],
        sol: md`
1. At $55\,^\circ\text{C}$, $1\,\text{mA}$ needs $63\,\text{mV}$ less than at $25\,^\circ\text{C}$.
2. Holding the old $V_{BE}$ is therefore $63\,\text{mV}$ of extra drive: $I_C = 1\,\text{mA}\times e^{63/25} = e^{2.52}\,\text{mA} = 12.4\,\text{mA}$.

Twelve times the current, more heat, more current: thermal runaway. This is why every bias circuit in this chapter sets the current with a resistor instead.`,
      }),
      R(md`
        ### Drill: the exponential

        Voltage steps for current ratios, ratios for voltage steps, $I_S$ from a measurement, and areas. $V_T\ln2 = 17.3\,\text{mV}$ and $V_T\ln10 = 57.6\,\text{mV}$ are worth memorizing.
      `),
      G('bk_vbe', { need: 4 }),
    ],
  });

  // ================================================================== 6.3 the four regions
  // several small drawings side by side, each with its caption
  const row = (items) => `<div class="figrow">${items.map(([fig, cap]) => `<div>${typeof fig === 'string' ? fig : Schem.render(fig)}<figcaption>${cap}</figcaption></div>`).join('')}</div>`;
  const twoDiodes = [['term', [0, 1], { n: 'B', side: 'l' }], ['w', [0, 1], [1, 1]], ['D', [1, 1], [1, -0.4]], ['D', [1, 1], [1, 2.4]],
    ['term', [1, -0.4], { n: 'C', side: 'r' }], ['term', [1, 2.4], { n: 'E', side: 'r' }],
    ['txt', [1.4, 0.3], '$\\text{BC}$', { a: 'l' }], ['txt', [1.4, 1.7], '$\\text{BE}$', { a: 'l' }]];
  // output characteristics from a full two-junction (Ebers–Moll) model: beta_F = 100, beta_R = 0.1, V_A = 50 V; mA for I_B in mA
  const emIc = (IB, v) => { const k = Math.exp(-v / 0.025); return IB * (1 - 11 * k) / (0.01 + 10 * k) * (1 + v / 50); };
  const outChar = plot({
    w: 450, h: 280, x: [0, 2.5], y: [0, 3.8], xt: [0, [0.2, '0.2'], 0.5, 1, 1.5, 2, 2.5], yt: [0, 1, 2, 3],
    xl: 'V_{CE}\\ (\\text{V})', yl: 'I_C\\ (\\text{mA})', bands: [{ x0: 0, x1: 0.2 }],
    curves: [0.01, 0.02, 0.03].map((IB) => ({ f: (v) => emIc(IB, v), from: 0.05 })),
    lines: [{ x1: 0.7, y1: 0, x2: 0.7, y2: 3.45, cls: 'dash' }],
    labels: [{ x: 0.03, y: 3.6, t: '\\text{saturation}', a: 'l' }, { x: 0.74, y: 3.6, t: 'V_C = V_B', a: 'l' }, { x: 1.85, y: 3.6, t: '\\text{forward active}', a: 'l' },
      { x: 1.25, y: 3.25, t: 'I_B = 30\\,\\mu\\text{A}', a: 'l' }, { x: 1.25, y: 2.23, t: 'I_B = 20\\,\\mu\\text{A}', a: 'l' }, { x: 1.25, y: 1.2, t: 'I_B = 10\\,\\mu\\text{A}', a: 'l' },
      { x: 1.25, y: 0.22, t: '\\text{cutoff: } I_B = 0,\\ I_C = 0', a: 'l' }],
    aria: 'BJT output characteristics',
  });
  const ex4 = row([
    [B.nodesFig(false, { B: 2, E: 1.3, C: 6 }), '(a)'], [B.nodesFig(false, { B: 0.75, E: 0, C: 0.15 }), '(b)'],
    [B.nodesFig(false, { B: 0.4, E: 0, C: 3 }), '(c)'], [B.nodesFig(false, { B: 0.7, E: 2, C: 0 }), '(d)'],
  ]);

  L({
    id: 'bk06-regions', title: 'The four regions, and how to tell which one', ref: 'Lectures 21–22',
    steps: [
      R(md`
        ### The question

        Every BJT DC problem ends with a check: is the transistor really in the region we assumed? Part (a) of an Exam 3 BJT problem is usually "find $I_C$ and verify the region". This section says what each region is physically, and gives a test you can run on node voltages in a few seconds. It also clears up the most confusing name in the course: a *saturated* BJT behaves like a MOSFET in **triode**, not in saturation.
      `),
      RF(md`
        ### The physical picture: two junctions, each on or off

        A BJT has two junctions, and each one is either forward biased (on) or not (off). Two junctions, two states each: four combinations, and each combination is a region.

        For the bookkeeping of which junction is on, picture an NPN as two diodes sharing their anode, the p-type base. **This is bookkeeping only.** Two real diodes have no thin base between them, so they cannot do transistor action ([Section 6.1](#/l/bk06-how)).

        [[fig:dd]]

        | BE junction | BC junction | Region | What the transistor does |
        |---|---|---|---|
        | on | off | **forward active** | amplifier: $I_C = \beta I_B$, set by $V_{BE}$, almost independent of $V_{CE}$ |
        | on | on | **saturation** | closed switch: $V_{CE}\approx0.2\,\text{V}$, and $I_C < \beta I_B$ |
        | off | off | **cutoff** | open switch: no current |
        | off | on | **reverse active** | used upside down, with a poor $\beta$ (rare) |
      `, { dd: { fig: twoDiodes, cap: 'The junction bookkeeping of an NPN: base–collector and base–emitter diodes, anodes at the base.' } }),
      R(md`
        ### Forward active: the amplifier region

        The BE junction is on ($V_{BE}\approx0.7\,\text{V}$) and the BC junction is off ($V_{BC}\le0$). This is the region of [Section 6.1](#/l/bk06-how): the emitter injects, the base passes the electrons on, the collector collects, and $I_C = \beta I_B$.

        **The test in terms of $V_{CE}$.** Walk from the collector to the emitter through the base. KVL gives
        $$V_{CE} = V_{CB} + V_{BE} = V_{BE} - V_{BC}.$$
        So "$V_{BC}\le0$" is the same statement as "$V_{CE}\ge V_{BE}\approx0.7\,\text{V}$", and the same as "$V_C\ge V_B$": **the collector at or above the base**. That is the course's active check for an NPN.
      `),
      R(md`
        ### Saturation: both junctions on

        Now pull the collector down until it is below the base. The BC junction becomes forward biased too, and it does what forward-biased junctions do: it conducts. Holes pour from the base into the lightly doped collector, and the collector injects electrons back into the base. Both effects add to the base current and subtract from the collector current. So **in saturation $I_C < \beta I_B$**: the transistor can no longer deliver the $\beta I_B$ the base current would ask for.

        **How low does $V_{CE}$ go?** From the KVL above, $V_{CE} = V_{BE} - V_{BC}$: the difference of two forward drops. The BC junction has a much larger area and a lightly doped collector side, so it conducts heavily at only about $0.5\,\text{V}$, while the BE junction sits near $0.7\,\text{V}$. Hence
        $$V_{CE,sat} = V_{BE} - V_{BC}\approx0.7 - 0.5 = 0.2\,\text{V}.$$
        That is the course's $V_{CE(sat)} = 0.2\,\text{V}$. It is not zero because both junctions are on and their drops nearly, but not quite, cancel.

        **Who sets the current?** In saturation the transistor is a closed switch with $0.2\,\text{V}$ across it, so the *outside circuit* sets $I_C$. With the emitter grounded and $R_C$ to $V_{CC}$: $I_C = (V_{CC} - 0.2)/R_C$, whatever the base current. The ratio $I_C/I_B$ is then called the **forced $\beta$**, and it is smaller than $\beta$.
      `),
      RF(md`
        ### The whole story in one picture

        Push a fixed base current in, sweep $V_{CE}$, and record $I_C$. The family of curves below was computed from a full two-junction model with $\beta = 100$.

        [[fig:oc]]

        Read it from the right. Above about $0.3\,\text{V}$ each curve is nearly flat at $\beta I_B$ (with a slight upward slope, the Early effect of [Section 6.8](#/l/bk06-early)): **forward active**, a current source. Below about $0.2\,\text{V}$ the curves collapse: **saturation**, where the transistor can only carry what the outside circuit allows. With no base current there is no collector current at all: **cutoff**.

        Notice that at $V_{CE} = 0.3\,\text{V}$ the current is still almost $\beta I_B$, although $V_C$ is already $0.4\,\text{V}$ *below* $V_B$. The BC junction does not conduct much until it has about $0.5\,\text{V}$ across it. The zone between $V_C = V_B$ and $V_{CE}\approx0.3\,\text{V}$ is called **soft saturation**: the transistor still amplifies, a little worse. **The course's test, $V_C\ge V_B$, is the safe version, and it is the one to use on the exam.**
      `, { oc: { fig: outChar, cap: 'Output characteristics: $I_C$ against $V_{CE}$ at three fixed base currents ($\\beta = 100$, computed from the Ebers–Moll model). The shaded strip is $V_{CE} < 0.2\\,\\text{V}$; the dashed line is where $V_C = V_B$ for $V_{BE} = 0.7\\,\\text{V}$.' } }),
      R(md`
        ### Cutoff and reverse active

        **Cutoff.** With $V_{BE}$ well below $0.7\,\text{V}$ the injection is exponentially small: $100\,\text{mV}$ less is $e^{-4}$, 55 times less current, and at $V_{BE} = 0.4\,\text{V}$ it is $e^{-12}$, about 160 000 times less. Every current is essentially zero, and the transistor is an open switch. (The BC junction must be off too, or the device is reverse active.)

        **Reverse active.** Swap the roles: the BC junction injects and the BE junction collects. It works, but badly: the collector was built big and lightly doped, so the reverse $\beta_R$ is only about 0.1 to 5. No circuit in this course uses it on purpose; you only need to recognize it.

        !!key The regions, and the test for an NPN
          - **Forward active:** $V_{BE}\approx0.7\,\text{V}$ and $V_C\ge V_B$. Then $I_C = \beta I_B$.
          - **Saturation:** $V_{BE}\approx0.7\,\text{V}$ and $V_C < V_B$. Then $V_{CE} = 0.2\,\text{V}$ and $I_C < \beta I_B$.
          - **Cutoff:** $V_{BE}$ below about $0.5\,\text{V}$ (and the BC junction off). Then $I_B = I_C = 0$.
          - **Reverse active:** BE off, BC on.

        !!trap The naming trap: BJT saturation is MOSFET triode
          | | BJT | MOSFET |
          |---|---|---|
          | amplifier, current source | **forward active** | **saturation** |
          | switch on, small voltage across | **saturation** | **triode** |
          | switch off | cutoff | cutoff |

          Both names describe something that saturates. In a MOSFET the drain *current* saturates: it stops growing with $V_{DS}$. In a BJT the base is saturated with injected *charge* from both junctions, and $I_C$ stops following $\beta I_B$. Say "the amplifier region" in your head and you will never mix them up.
      `),
      RF(md`
        ### Check it, and how to recognize it

        **Limits.** Raise $V_{CC}$ (or shrink $R_C$) and the collector moves up: the transistor goes from saturation into active, never the other way. Starve the base and every current goes to zero: cutoff. **Units:** every test compares voltages with voltages ✓.

        **The five-second test**, from the node voltages of an NPN:
        1. Is $V_{BE} = V_B - V_E$ about $0.7\,\text{V}$? If it is below about $0.5\,\text{V}$: cutoff (unless the BC junction is on).
        2. If the BE junction is on, compare $V_C$ with $V_B$. $V_C\ge V_B$: forward active. $V_C < V_B$ (and then $V_{CE}\approx0.2\,\text{V}$): saturation.

        ### Worked example: four transistors

        [[fig:four]]

        - **(a)** $V_{BE} = 2 - 1.3 = 0.7\,\text{V}$: on. $V_{BC} = 2 - 6 = -4\,\text{V}$: off. **Forward active.**
        - **(b)** $V_{BE} = 0.75\,\text{V}$: on. $V_{BC} = 0.75 - 0.15 = 0.6\,\text{V}$: on. **Saturation**, with $V_{CE} = 0.15\,\text{V}$.
        - **(c)** $V_{BE} = 0.4\,\text{V}$: off. $V_{BC} = 0.4 - 3 = -2.6\,\text{V}$: off. **Cutoff.**
        - **(d)** $V_{BE} = 0.7 - 2 = -1.3\,\text{V}$: off. $V_{BC} = 0.7 - 0\,\text{V} = 0.7\,\text{V}$: on. **Reverse active**: the collector is acting as the emitter.

        !!mistake Common mistakes
          - Calling the amplifier region "saturation" because that is the MOSFET word. For a BJT it is **forward active**.
          - Testing $V_{CE}\ge0.2\,\text{V}$ and declaring "active". The course's test is $V_C\ge V_B$, i.e. $V_{CE}\ge V_{BE}$.
          - Using $I_C = \beta I_B$ in saturation. In saturation $I_C$ is set by the outside circuit and is *less* than $\beta I_B$.
          - Reading "the currents came out positive" as proof of forward active. Positive currents do not check the BC junction; only $V_C\ge V_B$ does.
      `, { four: { fig: ex4, cap: 'Four NPNs with their node voltages.' } }),
      Q(md`Which MOSFET region corresponds to a BJT in **saturation** (switch closed, small voltage across it)?`,
        ['Triode', 'Saturation', 'Cutoff', 'There is no match'], 0,
        [null, 'The names cross over. MOSFET saturation is the flat, current-source region: that is the BJT\'s **forward active** region.', 'Cutoff is the open switch in both devices.', 'Triode matches it: in both, the device is a switch that is on, with a small voltage across it.'],
        md`**BJT forward active ↔ MOSFET saturation** (the amplifier region). **BJT saturation ↔ MOSFET triode** (switch on). Say "the amplifier region" to yourself and the trap disappears.`),
      Q(md`An NPN with its emitter grounded is in saturation with $I_B = 50\,\mu\text{A}$ and $\beta = 100$. Which statement is true?`,
        ['$I_C$ is less than $5\\,\\text{mA}$, and the collector circuit sets its value', '$I_C = \\beta I_B = 5\\,\\text{mA}$ exactly', '$I_C$ is more than $5\\,\\text{mA}$, because both junctions inject', 'All currents are zero'], 0,
        [null, '$I_C = \\beta I_B$ is the forward-active law. In saturation the transistor cannot deliver it.', 'The forward-biased BC junction *subtracts* from the collector current and adds to the base current.', 'That is cutoff. A saturated transistor is a closed switch carrying current.'],
        md`In saturation $V_{CE}\approx0.2\,\text{V}$ and $I_C = (V_{CC} - 0.2)/R_C$ (for a grounded emitter): the outside circuit decides. The forced $\beta = I_C/I_B$ is below 100.`),
      Q(md`Why is $V_{CE,sat}$ about $0.2\,\text{V}$ rather than zero?`,
        ['It is the difference of two forward drops: about $0.7\\,\\text{V}$ across BE minus about $0.5\\,\\text{V}$ across BC', 'It is the resistance of the collector times $I_C$', 'It is $V_T\\ln\\beta$', 'Because the BC junction is reverse biased by $0.2\\,\\text{V}$'], 0,
        [null, 'Collector resistance adds a little in real parts, but the main reason is KVL around the two junctions.', '$V_T\\ln\\beta\\approx0.115\\,\\text{V}$ is not the mechanism; the number just happens to be in the same range.', 'In saturation the BC junction is **forward** biased; that is what saturation means.'],
        md`KVL: $V_{CE} = V_{BE} - V_{BC}$. Both junctions are on; the large, lightly doped BC junction conducts at a smaller forward voltage (about $0.5\,\text{V}$) than the BE junction (about $0.7\,\text{V}$), leaving about $0.2\,\text{V}$.`),
      Q(md`An NPN has $V_{BE} = 0.4\,\text{V}$ and its collector well above the base. Compared with $V_{BE} = 0.7\,\text{V}$, its collector current is about`,
        ['160 000 times smaller: cutoff', 'About half', '$0.4/0.7$ as large', 'The same, since the BC junction is reverse biased either way'], 0,
        [null, 'Halving takes only $17\\,\\text{mV}$ less. $300\\,\\text{mV}$ less is twelve factors of $e$.', 'The law is exponential, not proportional.', 'The BC junction only collects what the BE junction injects. Less injection, less current.'],
        md`$e^{-300/25} = e^{-12} = 6\times10^{-6}$: about 160 000 times less. For all practical purposes the transistor is off: cutoff.`),
      P({
        id: 'bk06-reg-four', title: 'Name the region',
        q: md`Four NPNs have these node voltages. Name each one's region.

| | $V_B$ | $V_E$ | $V_C$ |
|---|---|---|---|
| (a) | $3.7\,\text{V}$ | $3.0\,\text{V}$ | $3.9\,\text{V}$ |
| (b) | $1.5\,\text{V}$ | $0.75\,\text{V}$ | $0.95\,\text{V}$ |
| (c) | $-1\,\text{V}$ | $0\,\text{V}$ | $5\,\text{V}$ |
| (d) | $0.1\,\text{V}$ | $0.8\,\text{V}$ | $-0.6\,\text{V}$ |`,
        parts: [
          { lbl: '(a)', mc: ['Forward active', 'Saturation', 'Cutoff', 'Reverse active'], a: 0, fixed: true, why: [null, '$V_C = 3.9\\,\\text{V}$ is above $V_B = 3.7\\,\\text{V}$: the BC junction is reverse biased (by $0.2\\,\\text{V}$).', '$V_{BE} = 0.7\\,\\text{V}$: the BE junction is on.', 'The BE junction is on, so it is not reverse active.'] },
          { lbl: '(b)', mc: ['Forward active', 'Saturation', 'Cutoff', 'Reverse active'], a: 1, fixed: true, why: ['$V_C = 0.95\\,\\text{V}$ is **below** $V_B = 1.5\\,\\text{V}$: the BC junction is forward biased by $0.55\\,\\text{V}$.', null, '$V_{BE} = 0.75\\,\\text{V}$: on.', 'BE is on.'] },
          { lbl: '(c)', mc: ['Forward active', 'Saturation', 'Cutoff', 'Reverse active'], a: 2, fixed: true, why: ['$V_{BE} = -1\\,\\text{V}$: the BE junction is reverse biased, nothing is injected.', 'Saturation needs the BE junction on.', null, '$V_{BC} = -6\\,\\text{V}$: the BC junction is off too.'] },
          { lbl: '(d)', mc: ['Forward active', 'Saturation', 'Cutoff', 'Reverse active'], a: 3, fixed: true, why: ['$V_{BE} = 0.1 - 0.8 = -0.7\\,\\text{V}$: the BE junction is off.', 'Saturation needs the BE junction on; here it is reverse biased.', '$V_{BC} = 0.1 - (-0.6) = 0.7\\,\\text{V}$: the BC junction is on.', null] },
        ],
        hints: [md`For each: $V_{BE} = V_B - V_E$, $V_{BC} = V_B - V_C$. On means about $+0.7\,\text{V}$ (BC: from about $+0.4\,\text{V}$).`],
        sol: md`
| | $V_{BE}$ | $V_{BC}$ | BE | BC | Region |
|---|---|---|---|---|---|
| (a) | $0.7\,\text{V}$ | $-0.2\,\text{V}$ | on | off | forward active |
| (b) | $0.75\,\text{V}$ | $0.55\,\text{V}$ | on | on | saturation ($V_{CE} = 0.2\,\text{V}$) |
| (c) | $-1\,\text{V}$ | $-6\,\text{V}$ | off | off | cutoff |
| (d) | $-0.7\,\text{V}$ | $0.7\,\text{V}$ | off | on | reverse active |

(a) passes the course test only just: the collector is $0.2\,\text{V}$ above the base.`,
      }),
      P({
        id: 'bk06-reg-vcesat', title: 'Two forward drops',
        q: md`In saturation, a transistor has $V_{BE} = 0.78\,\text{V}$ and $V_{BC} = 0.60\,\text{V}$. Find $V_{CE}$. A second one has $V_{BE} = 0.70\,\text{V}$ and $V_{BC} = 0.45\,\text{V}$; find its $V_{CE}$.`,
        parts: [{ lbl: 'V_{CE}\\ (1)', unit: 'V', ans: 0.18, tol: { rel: 0, abs: 0.004 } }, { lbl: 'V_{CE}\\ (2)', unit: 'V', ans: 0.25, tol: { rel: 0, abs: 0.004 } }],
        hints: [md`KVL from collector to emitter through the base: $V_{CE} = V_{CB} + V_{BE}$, and $V_{CB} = -V_{BC}$.`],
        sol: md`
$V_{CE} = V_{BE} - V_{BC}$.
1. $0.78 - 0.60 = 0.18\,\text{V}$.
2. $0.70 - 0.45 = 0.25\,\text{V}$.

Both near the course's $0.2\,\text{V}$. The harder the BC junction is driven (deeper saturation), the smaller $V_{CE}$.`,
      }),
      P({
        id: 'bk06-reg-rcmax', title: 'How big can R_C be?',
        q: md`A bias network holds an NPN's base at $V_B = 2\,\text{V}$ and sets $I_C = 1\,\text{mA}$. A resistor $R_C$ connects the collector to $V_{CC} = 10\,\text{V}$. Find the largest $R_C$ that keeps the transistor forward active (course test). Then: with $R_C = 12\kO$, which region is it in?`,
        parts: [{ lbl: 'R_{C,max}', unit: 'kΩ', ans: 8, traps: [{ v: 9.8, msg: 'That allows the collector down to $0.2\\,\\text{V}$. The course test needs $V_C\\ge V_B = 2\\,\\text{V}$.' }, { v: 10, msg: 'That puts the collector at $0\\,\\text{V}$, below the base.' }] },
          { lbl: 'Region with $R_C = 12\\,\\text{k}\\Omega$', mc: ['Saturation', 'Forward active', 'Cutoff'], a: 0, fixed: true, why: [null, 'Active would need $V_C = 10 - 12\\times1 = -2\\,\\text{V}$, below the base (and below ground): impossible.', 'The base is driven and $I_C$ is being demanded; the BE junction is on.'] }],
        hints: [md`In forward active $V_C = V_{CC} - I_CR_C$. Require $V_C\ge V_B$.`],
        sol: md`
1. Forward active: $V_C = 10 - (1\,\text{mA})R_C\ge V_B = 2\,\text{V}$, so $R_C\le8\,\text{V}/1\,\text{mA} = 8\kO$.
2. With $12\kO$ the active-region answer would be $V_C = 10 - 12 = -2\,\text{V}$: below the base, so the BC junction turns on. The transistor **saturates**, $V_{CE}$ drops to about $0.2\,\text{V}$, and $I_C$ falls below $1\,\text{mA}$ (the next sections show how to compute it).`,
      }),
      P({
        id: 'bk06-reg-forced', title: 'Forced beta',
        q: md`A current source pushes $I_B = 20\,\mu\text{A}$ into the base of an NPN with $\beta = 100$. The emitter is grounded and $R_C = 10\kO$ goes to $V_{CC} = 5\,\text{V}$. (a) If it were forward active, what would $V_C$ be? (b) Find the actual $I_C$. (c) Find the forced $\beta = I_C/I_B$.`,
        parts: [{ lbl: 'V_C\\ \\text{(if active)}', unit: 'V', ans: -15 }, { lbl: 'I_C', unit: 'mA', ans: 0.48, traps: [{ v: 2, msg: 'That is $\\beta I_B$, the forward-active value. Part (a) showed the transistor cannot be active.' }, { v: 0.5, msg: 'That ignores the $0.2\\,\\text{V}$ left across the saturated transistor.' }] }, { lbl: '\\beta_{forced}', unit: '', ans: 24 }],
        hints: [md`(a) $V_C = V_{CC} - \beta I_BR_C$.`, md`(b) Saturated: $V_{CE} = 0.2\,\text{V}$ with the emitter at ground, so $V_C = 0.2\,\text{V}$.`],
        sol: md`
(a) $V_C = 5 - (100\times20\,\mu\text{A})(10\kO) = 5 - 20 = -15\,\text{V}$: impossible (and far below $V_B = 0.7\,\text{V}$). The transistor is saturated.

(b) Saturated: $V_C = V_{CE,sat} = 0.2\,\text{V}$, so $I_C = (5 - 0.2)\,\text{V}/10\kO = 0.48\,\text{mA}$.

(c) $\beta_{forced} = 0.48\,\text{mA}/20\,\mu\text{A} = 24 < \beta = 100$ ✓, consistent with saturation.`,
      }),
      R(md`
        ### Drill: regions from node voltages

        Find the two junction voltages first, then read the region from the table. Margins are generous: every junction is clearly on or clearly off.
      `),
      G('bk_reg', { need: 5 }),
    ],
  });

  // ================================================================== 6.4 the PNP
  const pnpCur = [['pnp', [1, 1]], ['w', [1, 0], [1, -0.7]], ['iarr', [1, -0.35], 'd', { n: 'I_E' }],
    ['w', [0, 1], [-0.8, 1]], ['iarr', [-0.4, 1], 'l', { n: 'I_B' }], ['w', [1, 2], [1, 2.7]], ['iarr', [1, 2.35], 'd', { n: 'I_C' }],
    ['txt', [0.78, -0.62], '$E$', { a: 'r' }], ['txt', [-0.8, 0.7], '$B$'], ['txt', [0.78, 2.62], '$C$', { a: 'r' }]];
  const twins = row([[B.nodesFig(false, { C: 5, B: 0.7, E: 0 }), 'NPN, forward active'], [B.nodesFig(true, { E: 5, B: 4.3, C: 0 }), 'PNP, forward active']]);
  const pnpFix = B.biasFig({ type: 'pnp', base: 'gnd', VCC: 5, RB: 215e3, RC: 1e3, nodes: true });

  L({
    id: 'bk06-pnp', title: 'The PNP: the same device, upside down', ref: 'Lectures 21–22',
    steps: [
      R(md`
        ### The question

        Half the transistors on an Exam 3 page are PNPs: current-source loads, PNP common-emitter stages, level shifters. Everything about the PNP follows from one idea: **it is the NPN with every doping type swapped, so every voltage and every current flips.** The PNP is to the NPN what the PMOS is to the NMOS ([Chapter 2](#/l/bk02-pmos)). This section makes the flip precise, so that you never have to guess a sign.
      `),
      RF(md`
        ### The physical picture: holes instead of electrons

        A PNP is a **p⁺ emitter**, a thin **n base** and a **p collector**. Forward biasing the BE junction now means making the emitter (p) *higher* than the base (n): $V_{EB}\approx0.7\,\text{V}$. The emitter injects **holes** into the base, they diffuse across, and the reverse-biased BC junction (collector *below* the base) sweeps them into the collector. The same three steps as the NPN, with holes.

        [[fig:x]]

        Holes are positive, so conventional current flows *with* them: **into the emitter and out of the collector.** The base current also reverses: the base supplies electrons (back-injection into the emitter, recombination in the base), and electrons flowing *in* is conventional current flowing *out*. So a PNP's base current flows **out of the base**.
      `, { x: { fig: xsec(true), cap: 'A PNP in forward-active operation: holes (blue arrow) are injected by the emitter, cross the n base and are collected. Electrons go back into the emitter (dashed). Conventional current enters the emitter and leaves by the collector and the base.' } }),
      R(md`
        ### The model: flip every voltage, keep every equation

        Repeat the derivation of [Section 6.1](#/l/bk06-how) with holes. The hole density at the emitter edge of the base is $p_n(0) = p_{n0}e^{V_{EB}/V_T}$, the profile is a straight line, and the current is proportional to its slope. Defining every current **in the direction it actually flows**, the equations are the NPN's with $V_{BE}$ replaced by $V_{EB}$:
        $$I_C = I_S\,e^{V_{EB}/V_T},\qquad I_C = \beta I_B,\qquad I_E = I_C + I_B = (\beta + 1)I_B,$$
        with $I_E$ flowing **into** the emitter, $I_C$ **out of** the collector and $I_B$ **out of** the base.

        **Why not keep the NPN's directions?** You can, but then every current is negative: the current *into* the collector would be $-I_Se^{-V_{BE}/V_T}$ with $V_{BE}\approx-0.7\,\text{V}$. Both descriptions are correct; the flipped one keeps every number positive. (For small signals, [Chapter 7](#/l/bk07-pnpmodel) shows that the NPN's model can be kept *unchanged*.)

        !!key The PNP (forward active)
          - $V_{EB}\approx0.7\,\text{V}$: the emitter sits $0.7\,\text{V}$ **above** the base.
          - $I_C = \beta I_B$, $I_E = (\beta + 1)I_B$; current flows into the emitter, out of the collector and out of the base.
          - Active check: $V_C\le V_B$ (the collector at or **below** the base). Saturation: $V_{EC} = 0.2\,\text{V}$.
      `),
      RF(md`
        ### How to recognize it: the symbol

        The arrow is on the emitter and points the way conventional current flows there: **into** a PNP. (Memory hook: **NPN = Not Pointing iN**.) We draw the PNP the way it is used, **emitter on top, toward $V_{CC}$**, collector below: current still runs from top to bottom through both kinds of transistor, exactly as with PMOS and NMOS.

        [[fig:sym]]

        Side by side, a forward-active NPN and PNP are mirror images. In the NPN the emitter is the lowest node and the collector the highest; in the PNP the emitter is the highest and the collector the lowest. The base is $0.7\,\text{V}$ from the emitter in both, on the collector's side of it.

        [[fig:tw]]
      `, { sym: { fig: pnpCur, cap: 'The PNP: emitter on top with the arrow pointing in. $I_E$ enters, $I_C$ and $I_B$ leave.' }, tw: { fig: twins, cap: 'Typical node voltages in forward active: the PNP is the NPN turned upside down.' } }),
      R(md`
        ### The regions of a PNP

        Each junction is on when its p side is above its n side, which for a PNP means the emitter or the collector above the base. KVL from the emitter to the collector through the base:
        $$V_{EC} = V_{EB} + V_{BC} = V_{EB} - V_{CB}.$$

        | BE ($V_{EB}$) | BC ($V_{CB}$) | Region | Test |
        |---|---|---|---|
        | on, $\approx0.7\,\text{V}$ | off, $\le0$ | **forward active** | $V_C\le V_B$ |
        | on | on | **saturation** | $V_C > V_B$, then $V_{EC}\approx0.2\,\text{V}$ |
        | off | off | **cutoff** | $V_{EB}$ below about $0.5\,\text{V}$ |
        | off | on | reverse active | (rare) |

        It is the NPN's table with every subtraction reversed. If in doubt, turn the page upside down: a PNP circuit drawn between $V_{CC}$ and ground is an NPN circuit between ground and $V_{CC}$.
      `),
      R(md`
        ### Why PNPs are a little worse

        Holes move about 2.5 times more sluggishly than electrons in silicon (their mobility, hence their diffusion constant $D_p$, is smaller). In the PNP's $I_S = qA_ED_pn_i^2/(N_BW_B)$ that means about 2.5 times less current for the same size, and in practice often a lower $\beta$ and a slower transistor. So designers put NPNs in the main signal path and use PNPs where the polarity demands it: loads, level shifts, the top half of push-pull stages. In the course's problems a PNP simply has its own $\beta$ and the same $0.7\,\text{V}$ and $0.2\,\text{V}$.
      `),
      R(md`
        ### Worked example: a PNP with a base resistor

        The emitter is tied to $V_{CC} = 5\,\text{V}$, $R_B = 215\kO$ runs from the base to ground, $R_C = 1\kO$ from the collector to ground, and $\beta = 100$.

        1. **Assume forward active:** $V_{EB} = 0.7\,\text{V}$, so $V_B = 5 - 0.7 = 4.3\,\text{V}$.
        2. **Base current.** It flows *out* of the base, down through $R_B$ to ground: $I_B = V_B/R_B = 4.3\,\text{V}/215\kO = 20\,\mu\text{A}$.
        3. **Collector current:** $I_C = \beta I_B = 2\,\text{mA}$, flowing out of the collector down through $R_C$: $V_C = I_CR_C = 2\,\text{V}$.
        4. **Check (PNP):** $V_C = 2\,\text{V}\le V_B = 4.3\,\text{V}$ ✓. Forward active.

        Compare the NPN version (emitter at ground, $R_B$ from $V_{CC}$, $R_C$ to $V_{CC}$): the same numbers, upside down.

        !!mistake Common mistakes
          - Writing $V_{BE} = 0.7\,\text{V}$ for a PNP. Its base is **below** its emitter: $V_{EB} = 0.7\,\text{V}$.
          - Using the NPN test $V_C\ge V_B$. For a PNP it is $V_C\le V_B$.
          - Drawing the base current into the base. A PNP's base current flows **out**.
          - Putting the emitter at the bottom. In the standard drawing a PNP's emitter faces $V_{CC}$.
      `, pnpFix),
      Q(md`In the standard drawing of a PNP, where is the emitter?`,
        ['On top, toward $V_{CC}$, with the arrow pointing in', 'At the bottom, toward ground, with the arrow pointing out', 'On the side, at the bar'], 0,
        [null, 'That is the NPN. The PNP is the NPN flipped, like a PMOS: emitter toward the supply.', 'The side lead is always the base.'],
        md`The arrow marks the emitter and shows conventional current: into a PNP. The emitter sits at the highest voltage, toward $V_{CC}$, just like a PMOS source.`),
      Q(md`A PNP has $V_E = 3\,\text{V}$ and $V_B = 2.3\,\text{V}$. What is the condition on $V_C$ for forward active?`,
        ['$V_C\\le2.3\\,\\text{V}$', '$V_C\\ge2.3\\,\\text{V}$', '$V_C\\ge3\\,\\text{V}$', '$V_C = 2.8\\,\\text{V}$'], 0,
        [null, 'That is the NPN test. For a PNP the collector must sit at or **below** the base.', 'A collector above the emitter would make the BC junction forward biased: not active.', '$V_{EC} = 0.2\\,\\text{V}$ is saturation.'],
        md`The BC junction is off when its p side (collector) is not above its n side (base): $V_{CB}\le0$, i.e. $V_C\le V_B = 2.3\,\text{V}$.`),
      Q(md`Which way does the base current of a forward-active PNP flow, and why?`,
        ['Out of the base: the base supplies electrons (for back-injection and recombination), and electrons flowing in are conventional current flowing out', 'Into the base, as in an NPN', 'There is no base current in a PNP'], 0,
        [null, 'Everything flips in a PNP, including the base current.', 'The two leaks (back-injection and recombination) exist in both devices.'],
        md`In a PNP the leaks need electrons from the base lead. Electron flow into the base is conventional current out of it. KCL then reads $I_E = I_C + I_B$ with $I_E$ in, $I_C$ and $I_B$ out.`),
      Q(md`Two transistors are identical in size and doping levels except that one is NPN and the other PNP. At the same $|V_{BE}|$, which carries more current, and why?`,
        ['The NPN: electrons diffuse about 2.5 times more readily than holes', 'The PNP: holes are positive', 'They are equal: same size, same voltage', 'The PNP: its emitter is on top'], 0,
        [null, 'The sign of the carrier does not change how much flows; its diffusion constant does.', '$I_S\\propto D$, the carrier\'s diffusion constant, and holes have the smaller one.', 'Where we draw it changes nothing physical.'],
        md`$I_S = qA_ED\,n_i^2/(N_BW_B)$ with $D = D_n$ (NPN) or $D_p$ (PNP). Holes are slower, so a PNP of the same size carries roughly 2.5 times less at the same $|V_{BE}|$.`),
      P({
        id: 'bk06-pnp-nodes', title: 'Two PNPs from their node voltages',
        q: md`PNP (a): $V_E = 5\,\text{V}$, $V_B = 4.3\,\text{V}$, $V_C = 1.2\,\text{V}$. PNP (b): $V_E = 3\,\text{V}$, $V_B = 2.25\,\text{V}$, $V_C = 2.8\,\text{V}$. Find $V_{CB}$ for (a) and $V_{EC}$ for (b), and name both regions.`,
        parts: [{ lbl: 'V_{CB}\\ (a)', unit: 'V', ans: -3.1, tol: { rel: 0, abs: 0.006 } },
          { lbl: 'Region (a)', mc: ['Forward active', 'Saturation', 'Cutoff'], a: 0, fixed: true, why: [null, 'The collector is $3.1\\,\\text{V}$ **below** the base: the BC junction is reverse biased.', '$V_{EB} = 0.7\\,\\text{V}$: the BE junction is on.'] },
          { lbl: 'V_{EC}\\ (b)', unit: 'V', ans: 0.2, tol: { rel: 0, abs: 0.006 } },
          { lbl: 'Region (b)', mc: ['Forward active', 'Saturation', 'Cutoff'], a: 1, fixed: true, why: ['$V_C = 2.8\\,\\text{V}$ is **above** $V_B = 2.25\\,\\text{V}$: for a PNP that forward biases the BC junction.', null, '$V_{EB} = 0.75\\,\\text{V}$: on.'] }],
        hints: [md`PNP: $V_{EB} = V_E - V_B$, $V_{CB} = V_C - V_B$. Active needs $V_C\le V_B$.`],
        sol: md`
(a) $V_{EB} = 5 - 4.3 = 0.7\,\text{V}$ (on); $V_{CB} = 1.2 - 4.3 = -3.1\,\text{V}$ (off): **forward active**.

(b) $V_{EB} = 3 - 2.25 = 0.75\,\text{V}$ (on); $V_{CB} = 2.8 - 2.25 = 0.55\,\text{V}$ (on): **saturation**, with $V_{EC} = 3 - 2.8 = 0.2\,\text{V}$ ($= V_{EB} - V_{CB}$ ✓).`,
      }),
      P({
        id: 'bk06-pnp-fixed', title: 'A PNP biased by a base resistor',
        q: md`A PNP ($\beta = 60$) has its emitter at $V_{CC} = 9\,\text{V}$, $R_B = 166\kO$ from the base to ground, and $R_C = 2\kO$ from the collector to ground. Find $I_B$, $I_C$ and $V_C$, and check the region.`,
        fig: B.biasFig({ type: 'pnp', base: 'gnd', VCC: 9, RB: 166e3, RC: 2e3 }),
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 50, traps: [{ v: 9 / 166 * 1e3, msg: 'The base sits at $V_{CC} - 0.7$, not at $V_{CC}$: $R_B$ has $8.3\\,\\text{V}$ across it.' }] }, { lbl: 'I_C', unit: 'mA', ans: 3 }, { lbl: 'V_C', unit: 'V', ans: 6 }],
        hints: [md`$V_B = V_{CC} - 0.7$. The base current flows out of the base, down through $R_B$.`, md`$V_C = I_CR_C$; PNP check: $V_C\le V_B$.`],
        sol: md`
1. Assume active: $V_B = 9 - 0.7 = 8.3\,\text{V}$, so $I_B = 8.3\,\text{V}/166\kO = 50\,\mu\text{A}$ (out of the base).
2. $I_C = 60\times50\,\mu\text{A} = 3\,\text{mA}$; $V_C = (3\,\text{mA})(2\kO) = 6\,\text{V}$.
3. Check: $V_C = 6\,\text{V}\le V_B = 8.3\,\text{V}$ ✓ forward active.`,
      }),
      P({
        id: 'bk06-pnp-rcmax', title: 'Room for R_C',
        q: md`In the previous circuit ($V_{CC} = 9\,\text{V}$, $\beta = 60$, $R_B = 166\kO$), what is the largest $R_C$ that keeps the PNP forward active?`,
        parts: [{ lbl: 'R_{C,max}', unit: 'kΩ', ans: 8.3 / 3, traps: [{ v: 8.8 / 3, msg: 'That lets the collector rise to $V_{EC} = 0.2\\,\\text{V}$. The course test is $V_C\\le V_B = 8.3\\,\\text{V}$.' }, { v: 3, msg: 'That puts the collector at $9\\,\\text{V}$, the emitter voltage.' }] }],
        hints: [md`$I_C = 3\,\text{mA}$ does not depend on $R_C$ while the transistor is active. Require $I_CR_C\le V_B$.`],
        sol: md`While active, $I_C = 3\,\text{mA}$ whatever $R_C$ is (the collector is a current source). $V_C = I_CR_C\le V_B = 8.3\,\text{V}$ gives $R_C\le8.3/3 = 2.77\kO$. Above that, the collector rises past the base and the PNP saturates.`,
      }),
      P({
        id: 'bk06-pnp-sat', title: 'A PNP switch',
        q: md`A PNP ($\beta = 100$) has its emitter at $V_{CC} = 5\,\text{V}$, $R_B = 43\kO$ from the base to ground and $R_C = 1\kO$ from the collector to ground. Find $I_B$, then show the transistor is saturated, and find $I_C$ and the forced $\beta$.`,
        fig: B.biasFig({ type: 'pnp', base: 'gnd', VCC: 5, RB: 43e3, RC: 1e3 }),
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 100 }, { lbl: 'I_C', unit: 'mA', ans: 4.8, traps: [{ v: 10, msg: 'That is $\\beta I_B$: the active value, which would put the collector at $10\\,\\text{V}$, above the emitter.' }, { v: 5, msg: 'Leave $0.2\\,\\text{V}$ across the saturated transistor: $V_C = 4.8\\,\\text{V}$.' }] }, { lbl: '\\beta_{forced}', unit: '', ans: 48 }],
        hints: [md`Active would give $V_C = \beta I_BR_C$. Compare with $V_B = 4.3\,\text{V}$.`, md`Saturated: $V_{EC} = 0.2\,\text{V}$, so $V_C = 4.8\,\text{V}$.`],
        sol: md`
1. $V_B = 5 - 0.7 = 4.3\,\text{V}$ (the BE junction is on either way), $I_B = 4.3/43\kO = 100\,\mu\text{A}$.
2. Active would need $I_C = 10\,\text{mA}$ and $V_C = 10\,\text{V}$: above $V_B$ (and above the supply). **Saturated.**
3. $V_C = V_E - 0.2 = 4.8\,\text{V}$, so $I_C = 4.8\,\text{V}/1\kO = 4.8\,\text{mA}$.
4. $\beta_{forced} = 4.8\,\text{mA}/100\,\mu\text{A} = 48 < 100$ ✓. The PNP is a closed switch connecting $R_C$ to the supply.`,
      }),
      R(md`
        ### Drill: PNP regions

        The same drill as before, all PNPs. Flip every subtraction: $V_{EB} = V_E - V_B$, $V_{CB} = V_C - V_B$.
      `),
      G('bk_reg', { need: 4, pnp: true }),
    ],
  });

  // ================================================================== 6.5 DC analysis I
  const dcModel = [['term', [0, 0.8], { n: 'B', side: 'l' }], ['w', [0, 0.8], [1, 0.8]], ['iarr', [0.5, 0.8], 'r', { n: 'I_B' }],
    ['V', [1, 0.8], [1, 2.2], { n: '0.7\\,\\text{V}', side: 'l' }], ['w', [1, 2.2], [2.6, 2.2]],
    ['I', [2.6, 0.2], [2.6, 2.2], { n: '\\beta I_B' }], ['w', [2.6, 0.2], [2.6, -0.3]], ['term', [2.6, -0.3], { n: 'C', side: 'r' }],
    ['w', [1.8, 2.2], [1.8, 2.7]], ['term', [1.8, 2.7], { n: 'E', side: 'r' }]];
  const ex1 = B.biasFig({ type: 'npn', base: 'fixed', VCC: 10, RB: 930e3, RC: 5e3 });
  const ex2 = B.biasFig({ type: 'npn', base: 'vbb', VCC: 12, VBB: 2.7, RB: 10e3, RE: 2e3, RC: 5e3, nodes: true });
  const ex3 = B.biasFig({ type: 'npn', base: 'gnd', VCC: 10, VEE: 5, RB: 20e3, RE: 4.3e3, RC: 5e3 });

  L({
    id: 'bk06-dc', title: 'DC analysis I: assume active, solve, check', ref: 'Lecture 22',
    steps: [
      R(md`
        ### The question

        Every small-signal number in Chapters 7 to 9 ($g_m$, $r_\pi$, $r_o$, every gain) starts from the DC collector current. So the first part of every BJT exam problem is a DC problem: find $I_C$ (and usually $V_C$), and verify the region. Last semester's Problem 3 ([typed here](#/l/e3-sp26-bjt)) spent a third of its points on it. This section builds the method on the three basic bias circuits; [the next one](#/l/bk06-divider) adds dividers, PNPs and capacitors, and [the one after](#/l/bk06-sat) the circuits that saturate.
      `),
      RF(md`
        ### The physical picture: two loops with different jobs

        A biased BJT sits in two loops. The **base loop** runs from a supply, through the base resistor, across the base–emitter junction and through any emitter resistor. It contains the junction, a nearly fixed $0.7\,\text{V}$, so KVL around it pins down the base current, and with it $I_C = \beta I_B$.

        The **collector loop** runs from $V_{CC}$ through $R_C$ into the collector. But the collector is a current source ([Section 6.1](#/l/bk06-how)): it delivers $\beta I_B$ whatever voltage it sits at. So the collector loop cannot change the current. It only decides *where the collector voltage ends up*, and that is what the region check looks at.

        In short: **the base loop steers; the collector loop goes along for the ride**, as long as the collector stays at or above the base.

        [[fig:m]]
      `, { m: { fig: dcModel, cap: 'The DC model of a forward-active NPN: a $0.7\\,\\text{V}$ drop from base to emitter, and a current $\\beta I_B$ from collector to emitter.' } }),
      R(md`
        ### The model and the recipe

        We replace the transistor by its forward-active DC model (above): a fixed $0.7\,\text{V}$ from base to emitter, and a current source $\beta I_B$ from collector to emitter. Its validity needs exactly what the region test checks, so we assume it, solve, and check.

        !!method Assume active, solve, check
          1. **DC circuit.** Capacitors open, signal sources set to zero.
          2. **Assume forward active:** $V_{BE} = 0.7\,\text{V}$, $I_C = \beta I_B$, $I_E = (\beta + 1)I_B$.
          3. **KVL around the base loop.** Write every current in it in terms of $I_B$. Solve for $I_B$.
          4. **The rest:** $I_C$, $I_E$, then the node voltages $V_E$, $V_B = V_E + 0.7$, $V_C$.
          5. **Check:** NPN $V_C\ge V_B$ (PNP $V_C\le V_B$), and $I_B > 0$. If the check fails, the transistor is saturated: [Section 6.7](#/l/bk06-sat).
      `),
      RF(md`
        ### Example 1: a base resistor from the supply ("fixed bias")

        $V_{CC} = 10\,\text{V}$, $R_B = 930\kO$ from $V_{CC}$ to the base, $R_C = 5\kO$, emitter grounded, $\beta = 100$.

        [[fig:e1]]

        **Base loop:** from $V_{CC}$ through $R_B$ to the base, then $0.7\,\text{V}$ to the grounded emitter. KVL: $V_{CC} - I_BR_B - 0.7 = 0$, so
        $$I_B = \frac{V_{CC} - 0.7}{R_B} = \frac{9.3\,\text{V}}{930\kO} = 10\,\mu\text{A},\qquad I_C = \beta I_B = 1\,\text{mA}.$$
        **Collector:** $V_C = V_{CC} - I_CR_C = 10 - 5 = 5\,\text{V}$. **Check:** $V_C = 5\,\text{V}\ge V_B = 0.7\,\text{V}$ ✓.

        **Now change the transistor.** The base current does not care about $\beta$, so $I_C$ is simply proportional to it:

        | $\beta$ | $I_C$ | $V_C$ | region |
        |---|---|---|---|
        | 50 | $0.5\,\text{mA}$ | $7.5\,\text{V}$ | active |
        | 100 | $1\,\text{mA}$ | $5\,\text{V}$ | active |
        | 200 | ($2\,\text{mA}$ would put $V_C$ at $0\,\text{V}$) | $0.2\,\text{V}$ | **saturated**, $I_C = 1.96\,\text{mA}$ |

        A part-to-part spread in $\beta$, normal for real transistors, moves this circuit from half-current to saturation. **Fixed bias works on paper and fails in production.**
      `, { e1: { fig: ex1, cap: 'Example 1: fixed bias.' } }),
      RF(md`
        ### Example 2: an emitter resistor, and the $(\beta + 1)$

        $V_{CC} = 12\,\text{V}$; the base is driven from $V_{BB} = 2.7\,\text{V}$ through $R_B = 10\kO$; $R_E = 2\kO$ from the emitter to ground; $R_C = 5\kO$; $\beta = 100$.

        [[fig:e2]]

        **Base loop, one drop at a time.** Start at $V_{BB}$ and walk to ground:
        - across $R_B$ the drop is $I_BR_B$ (the base current flows through it);
        - across the junction, $0.7\,\text{V}$;
        - across $R_E$ the drop is $I_ER_E$, and $R_E$ carries the **emitter** current, $I_E = (\beta + 1)I_B$.

        So
        $$V_{BB} = I_BR_B + 0.7 + (\beta + 1)I_BR_E\quad\Rightarrow\quad I_B = \frac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E} = \frac{2.0\,\text{V}}{10\kO + 101\times2\kO} = 9.434\,\mu\text{A}.$$
        Then $I_C = 0.9434\,\text{mA}$, $I_E = 0.9528\,\text{mA}$, $V_E = I_ER_E = 1.906\,\text{V}$, $V_B = 2.606\,\text{V}$, $V_C = 12 - (0.9434)(5) = 7.283\,\text{V}$. **Check:** $7.283\ge2.606$ ✓.

        !!key The base loop with an emitter resistor
          $$I_B = \frac{V_{BB} - V_{BE}}{R_B + (\beta + 1)R_E}\qquad\Longleftrightarrow\qquad I_E = \frac{V_{BB} - V_{BE}}{R_E + R_B/(\beta + 1)}$$
          Seen from the base, $R_E$ looks $(\beta + 1)$ times bigger; seen from the emitter, $R_B$ looks $(\beta + 1)$ times smaller. Both say one thing: $R_E$ carries $(\beta + 1)$ times the current that $R_B$ carries.

        The second form is the useful one. Here $R_B/(\beta + 1) = 99\,\Omega$, small next to $R_E = 2\kO$, so $I_E\approx(2.7 - 0.7)/2\kO = 1\,\text{mA}$ **whatever $\beta$ is**:

        | $\beta$ | 50 | 100 | 200 |
        |---|---|---|---|
        | $I_C$ | $0.893\,\text{mA}$ | $0.943\,\text{mA}$ | $0.971\,\text{mA}$ |

        A factor of 4 in $\beta$ moves $I_C$ by 9%, against 400% for fixed bias.

        !!intuition Why the emitter resistor stabilizes: negative feedback
          Suppose $I_C$ tries to rise (a hotter or higher-$\beta$ transistor). Then $I_ER_E$ rises, the emitter moves up, and with the base held by $V_{BB}$ the junction gets *less* forward voltage, which pushes the current back down. The emitter resistor turns the current into a voltage that opposes the change. You will meet the same mechanism as degeneration in the amplifier chapters.
      `, { e2: { fig: ex2, cap: 'Example 2: base source, base resistor and emitter resistor.' } }),
      RF(md`
        ### Example 3: a split supply

        $V_{CC} = 10\,\text{V}$ and $-V_{EE} = -5\,\text{V}$. The base goes to ground through $R_B = 20\kO$; $R_E = 4.3\kO$ runs from the emitter down to $-5\,\text{V}$; $R_C = 5\kO$; $\beta = 100$.

        [[fig:e3]]

        **Base loop:** from ground, up through $R_B$ into the base (the base current flows *from* ground *into* the base, so the base sits slightly below ground), across the junction, down through $R_E$ to $-5\,\text{V}$:
        $$0 - I_BR_B - 0.7 - (\beta + 1)I_BR_E = -V_{EE}\quad\Rightarrow\quad I_B = \frac{V_{EE} - 0.7}{R_B + (\beta + 1)R_E} = \frac{4.3}{20 + 434.3}\,\text{mA} = 9.465\,\mu\text{A}.$$
        So $I_C = 0.9465\,\text{mA}$. The base sits at $V_B = -I_BR_B = -0.189\,\text{V}$, the emitter at $V_E = -0.889\,\text{V}$, and $V_C = 10 - (0.9465)(5) = 5.267\,\text{V}$ ✓.

        This is the bias of a differential pair: the base near ground, so a signal can be applied there directly, and the negative supply pulling the current through $R_E$.
      `, { e3: { fig: ex3, cap: 'Example 3: split supply, base returned to ground.' } }),
      R(md`
        ### Check it

        - **$\beta\to\infty$:** $I_B\to0$ and $I_E\to(V_{BB} - 0.7)/R_E$: a MOSFET-like bias, with the base voltage set by $V_{BB}$ alone.
        - **$R_E\to0$:** $I_B = (V_{BB} - 0.7)/R_B$, Example 1's fixed bias.
        - **Units:** volts over ohms ✓. **A number:** Example 2's $I_E$ from the second form: $2\,\text{V}/(2\kO + 99\,\Omega) = 0.953\,\text{mA}$, the same as $(\beta + 1)I_B$ ✓.

        ### What it means, and how to recognize it

        The current is set by **the volts across the emitter resistor**: $V_{BB} - 0.7$ minus a small correction for the base current through $R_B$. To make a bias insensitive to $\beta$, make $R_B\ll(\beta + 1)R_E$. To make it insensitive to the $0.7\,\text{V}$ ([Section 6.2](#/l/bk06-laws)), put a volt or more across $R_E$.

        When you see a base loop, write each resistor's drop with the current it actually carries: $I_B$ for anything in series with the base, $(\beta + 1)I_B$ for anything in series with the emitter, and $I_C$, $I_E$ or a sum for anything on the collector side.
      `),
      R(md`
        ### Worked example: design for mid-supply

        In Example 2, choose $R_C$ so the collector sits at $6\,\text{V}$, half of $V_{CC}$ (room for the signal to swing both ways).

        1. The base loop does not involve $R_C$, so $I_C = 0.9434\,\text{mA}$ regardless.
        2. $V_C = V_{CC} - I_CR_C = 6\,\text{V}\Rightarrow R_C = \dfrac{12 - 6}{0.9434\,\text{mA}} = 6.36\kO$.
        3. Check: $V_C = 6\,\text{V}\ge V_B = 2.61\,\text{V}$ ✓.

        !!mistake Common mistakes
          - Counting $R_E$ once in the base loop: $I_B = (V_{BB} - 0.7)/(R_B + R_E)$. $R_E$ carries $(\beta + 1)I_B$.
          - Forgetting the $0.7\,\text{V}$ in the loop.
          - Putting the base at $V_{BB}$: it sits $I_BR_B$ below it.
          - Using the collector loop to find $I_C$. The collector is a current source; the collector loop only gives $V_C$.
          - Skipping the check. A negative or too-low $V_C$ means saturation, not a strange answer to accept.
      `),
      Q(md`A fixed-bias circuit ($R_B$ from $V_{CC}$ to the base, emitter grounded) is built with a transistor whose $\beta$ is twice the design value. What happens to $I_C$?`,
        ['It doubles, or the transistor saturates', 'It stays the same: $R_B$ sets the current', 'It rises by about 1%', 'It halves'], 0,
        [null, '$R_B$ sets the **base** current. $I_C = \\beta I_B$ follows $\\beta$ directly.', 'That is the change in $\\alpha$, not in $\\beta I_B$.', 'More $\\beta$ means more collector current for the same base current.'],
        md`$I_B = (V_{CC} - 0.7)/R_B$ does not depend on $\beta$, so $I_C = \beta I_B$ doubles. If $V_C$ would then fall below $V_B$, the transistor saturates instead.`),
      Q(md`In the base loop, which current flows through the emitter resistor $R_E$?`,
        ['$I_E = (\\beta + 1)I_B$', '$I_B$', '$I_C = \\beta I_B$', 'No current: $R_E$ is outside the base loop'], 0,
        [null, '$I_B$ flows in the base lead only. The emitter carries the base current **plus** the collector current.', 'Close, but the emitter also carries $I_B$: $I_E = I_C + I_B$.', '$R_E$ is in the base loop: the loop closes through the junction and the emitter.'],
        md`$R_E$ carries the whole emitter current, $(\beta + 1)I_B$. That is why it appears as $(\beta + 1)R_E$ when the loop is written in terms of $I_B$.`),
      Q(md`Seen from the emitter, a resistance $R_B$ in series with the base looks like`,
        ['$R_B/(\\beta + 1)$', '$(\\beta + 1)R_B$', '$R_B$', 'Zero: the base current is negligible'], 0,
        [null, 'That is $R_E$ seen from the base. The factor goes the other way here.', 'It carries only $I_B$, a $(\\beta + 1)$th of the emitter current, so it drops less voltage per amp of emitter current.', 'Its effect is small when $R_B\\ll(\\beta + 1)R_E$, but not zero.'],
        md`$I_BR_B = \dfrac{I_E}{\beta + 1}R_B$: in an equation for $I_E$ it acts like $R_B/(\beta + 1)$. Hence $I_E = (V_{BB} - 0.7)/(R_E + R_B/(\beta + 1))$.`),
      Q(md`What is the main purpose of an emitter resistor in a bias circuit?`,
        ['To make $I_C$ depend on resistors and supplies rather than on $\\beta$ and $V_{BE}$', 'To raise the voltage gain', 'To limit the base current to a safe value', 'To guarantee the transistor saturates'], 0,
        [null, 'At DC it does the opposite of helping gain; for signals it is often bypassed by a capacitor. Its job here is stability.', 'It does reduce $I_B$, but the point is *which* parameters set $I_C$.', 'Larger $R_E$ moves the emitter up and the current down; it pushes away from saturation, not into it.'],
        md`With $(\beta + 1)R_E\gg R_B$, $I_E\approx(V_{BB} - 0.7)/R_E$: set by the designer's resistors. The mechanism is negative feedback through the emitter voltage.`),
      P({
        id: 'bk06-dc-fixed', title: 'Fixed bias',
        q: md`$V_{CC} = 9\,\text{V}$, $R_B = 830\kO$ from $V_{CC}$ to the base, $R_C = 4\kO$, emitter grounded, $\beta = 120$. Find $I_B$, $I_C$ and $V_C$.`,
        fig: B.biasFig({ type: 'npn', base: 'fixed', VCC: 9, RB: 830e3, RC: 4e3 }),
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 10, traps: [{ v: 9 / 830 * 1e3, msg: 'The base sits at $0.7\\,\\text{V}$, not at ground: $R_B$ has $8.3\\,\\text{V}$ across it.' }] }, { lbl: 'I_C', unit: 'mA', ans: 1.2 }, { lbl: 'V_C', unit: 'V', ans: 4.2 }],
        hints: [md`$I_B = (V_{CC} - 0.7)/R_B$.`],
        sol: md`
1. Base loop: $I_B = (9 - 0.7)\,\text{V}/830\kO = 10\,\mu\text{A}$.
2. $I_C = 120\times10\,\mu\text{A} = 1.2\,\text{mA}$.
3. $V_C = 9 - (1.2\,\text{mA})(4\kO) = 4.2\,\text{V}\ge V_B = 0.7\,\text{V}$ ✓ active.`,
      }),
      P({
        id: 'bk06-dc-re', title: 'With an emitter resistor',
        q: md`$V_{CC} = 10\,\text{V}$, $V_{BB} = 3\,\text{V}$ through $R_B = 47\kO$, $R_E = 1.5\kO$, $R_C = 3.3\kO$, $\beta = 150$. Find $I_B$, $I_C$, $V_E$ and $V_C$.`,
        fig: B.biasFig({ type: 'npn', base: 'vbb', VCC: 10, VBB: 3, RB: 47e3, RE: 1.5e3, RC: 3.3e3 }),
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 8.40951, traps: [{ v: 2.3 / 48.5 * 1e3, msg: '$R_E$ counted once. It carries $(\\beta + 1)I_B$: use $R_B + (\\beta + 1)R_E$.' }] }, { lbl: 'I_C', unit: 'mA', ans: 1.26143 }, { lbl: 'V_E', unit: 'V', ans: 1.90475 }, { lbl: 'V_C', unit: 'V', ans: 5.83729 }],
        hints: [md`$I_B = \dfrac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E}$.`, md`$V_E = (\beta + 1)I_BR_E$, $V_C = V_{CC} - I_CR_C$.`],
        sol: md`
1. $I_B = \dfrac{3 - 0.7}{47\kO + 151\times1.5\kO} = \dfrac{2.3\,\text{V}}{273.5\kO} = 8.410\,\mu\text{A}$.
2. $I_C = 150I_B = 1.261\,\text{mA}$, $I_E = 151I_B = 1.270\,\text{mA}$.
3. $V_E = I_ER_E = 1.905\,\text{V}$, $V_B = 2.605\,\text{V}$, $V_C = 10 - (1.261)(3.3) = 5.837\,\text{V}$.
4. Check: $5.84\ge2.60$ ✓ forward active.`,
      }),
      P({
        id: 'bk06-dc-split', title: 'Split supply',
        q: md`$V_{CC} = 12\,\text{V}$, $-V_{EE} = -12\,\text{V}$. The base returns to ground through $R_B = 100\kO$; $R_E = 10\kO$ goes from the emitter to $-12\,\text{V}$; $R_C = 5.6\kO$; $\beta = 80$. Find $I_C$, $V_B$ and $V_C$.`,
        fig: B.biasFig({ type: 'npn', base: 'gnd', VCC: 12, VEE: 12, RB: 100e3, RE: 10e3, RC: 5.6e3 }),
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.993407 }, { lbl: 'V_B', unit: 'V', ans: -1.24176, tol: { rel: 0.02, abs: 0.02 }, traps: [{ v: 0, msg: 'The base current flows through $R_B$, so the base sits $I_BR_B$ **below** ground.' }] }, { lbl: 'V_C', unit: 'V', ans: 6.43692 }],
        hints: [md`$I_B = \dfrac{V_{EE} - 0.7}{R_B + (\beta + 1)R_E}$.`, md`$V_B = -I_BR_B$.`],
        sol: md`
1. $I_B = \dfrac{12 - 0.7}{100\kO + 81\times10\kO} = \dfrac{11.3}{910}\,\text{mA} = 12.42\,\mu\text{A}$; $I_C = 80I_B = 0.9934\,\text{mA}$.
2. $V_B = -I_BR_B = -1.242\,\text{V}$ (here $R_B$ is not small next to $(\beta + 1)R_E$, so the base is noticeably below ground).
3. $V_C = 12 - (0.9934)(5.6) = 6.437\,\text{V}\ge V_B$ ✓.`,
      }),
      P({
        id: 'bk06-dc-fb', title: 'Collector-to-base feedback',
        q: md`$R_C = 4.7\kO$ from $V_{CC} = 10\,\text{V}$ to the collector, $R_B = 200\kO$ from the collector to the base, emitter grounded, $\beta = 100$. Find $I_B$, $I_C$ and $V_C$. Can this circuit ever saturate?`,
        fig: B.biasFig({ type: 'npn', base: 'fb', VCC: 10, RB: 200e3, RC: 4.7e3 }),
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 13.7839, traps: [{ v: 9.3 / 200 * 1e3, msg: 'That ignores the drop across $R_C$, which carries $I_C + I_B = (\\beta + 1)I_B$.' }] }, { lbl: 'I_C', unit: 'mA', ans: 1.37839 }, { lbl: 'V_C', unit: 'V', ans: 3.45678 },
          { lbl: 'Can it saturate?', mc: ['No: $V_C - V_B = I_BR_B$ is always positive', 'Yes, if $\\beta$ is large enough', 'Yes, if $R_C$ is large enough'], a: 0, fixed: true, why: [null, 'A larger $\\beta$ pulls $V_C$ down, which lowers $I_B$: the feedback stops at $V_C = V_B + I_BR_B > V_B$.', 'The collector can approach the base but never cross it while base current flows through $R_B$.'] }],
        hints: [md`One loop: $V_{CC}$, $R_C$ (carrying $(\beta + 1)I_B$), $R_B$ (carrying $I_B$), the $0.7\,\text{V}$ junction, ground.`],
        sol: md`
1. KVL: $V_{CC} - (\beta + 1)I_BR_C - I_BR_B - 0.7 = 0$, so $I_B = \dfrac{9.3}{200 + 101\times4.7}\,\text{mA} = \dfrac{9.3}{674.7}\,\text{mA} = 13.78\,\mu\text{A}$.
2. $I_C = 1.378\,\text{mA}$; $V_C = 10 - (1.392\,\text{mA})(4.7\kO) = 3.457\,\text{V}$ ($R_C$ carries $I_E$).
3. $V_C - V_B = I_BR_B = 2.757\,\text{V} > 0$: active, and it always will be, because the base current itself holds the collector above the base. If $\beta$ rises, $V_C$ falls, which reduces $I_B$: negative feedback again.`,
      }),
      P({
        id: 'bk06-dc-beta', title: 'Swap the transistor',
        q: md`Rebuild two of the circuits above with $\beta = 300$ transistors. (a) Fixed bias ($V_{CC} = 9\,\text{V}$, $R_B = 830\kO$, $R_C = 4\kO$): find $I_C$. (b) The emitter-resistor circuit ($V_{BB} = 3\,\text{V}$, $R_B = 47\kO$, $R_E = 1.5\kO$, $R_C = 3.3\kO$, $V_{CC} = 10\,\text{V}$): find $I_C$ at $\beta = 100$ and at $\beta = 300$.`,
        parts: [{ lbl: 'I_C\\ (a,\\ \\beta = 300)', unit: 'mA', ans: 2.2, traps: [{ v: 3, msg: '$\\beta I_B = 3\\,\\text{mA}$ would put $V_C$ at $-3\\,\\text{V}$. Check the region: the transistor saturates.' }] },
          { lbl: 'I_C\\ (b,\\ \\beta = 100)', unit: 'mA', ans: 1.15869 }, { lbl: 'I_C\\ (b,\\ \\beta = 300)', unit: 'mA', ans: 1.38415 }],
        hints: [md`(a) Try active and check. If saturated: $V_C = 0.2\,\text{V}$ with the emitter grounded.`, md`(b) The usual base-loop formula, twice.`],
        sol: md`
(a) Active would give $I_C = 300\times10\,\mu\text{A} = 3\,\text{mA}$ and $V_C = 9 - 12 = -3\,\text{V}$: impossible. Saturated: $I_C = (9 - 0.2)/4\kO = 2.2\,\text{mA}$.

(b) $\beta = 100$: $I_B = 2.3/(47 + 101\times1.5)\,\text{mA} = 11.59\,\mu\text{A}$, $I_C = 1.159\,\text{mA}$. $\beta = 300$: $I_B = 2.3/(47 + 301\times1.5)\,\text{mA} = 4.614\,\mu\text{A}$, $I_C = 1.384\,\text{mA}$: 19% more.

The emitter resistor helps a lot (fixed bias went from $1.0$ to a saturated $2.2\,\text{mA}$), but only as much as $R_B\ll(\beta + 1)R_E$ allows. Here $R_B = 47\kO$ is not small next to $101\times1.5\kO = 152\kO$. A smaller $R_B$ (a stiffer base drive) is the cure: [next section](#/l/bk06-divider).`,
      }),
      P({
        id: 'bk06-dc-design', title: 'Put the collector at mid-supply',
        q: md`In Example 2 above ($V_{CC} = 12\,\text{V}$, $V_{BB} = 2.7\,\text{V}$, $R_B = 10\kO$, $R_E = 2\kO$, $\beta = 100$), choose $R_C$ so that $V_C = 6\,\text{V}$.`,
        parts: [{ lbl: 'R_C', unit: 'kΩ', ans: 6.36 }],
        hints: [md`$I_C$ comes from the base loop and does not depend on $R_C$.`],
        sol: md`$I_C = 0.9434\,\text{mA}$ from the base loop. $R_C = (12 - 6)\,\text{V}/0.9434\,\text{mA} = 6.36\kO$. Check: $V_C = 6\,\text{V}\ge V_B = 2.61\,\text{V}$ ✓.`,
      }),
      R(md`
        ### Drill: one transistor, four bias networks

        A source and base resistor with an emitter resistor, fixed bias, a split supply, and collector feedback. Every time: write the loop with the current each resistor really carries, solve for $I_B$, then check.
      `),
      G('bk_dcrb', { need: 5 }),
    ],
  });

  // ================================================================== 6.6 DC analysis II: dividers, PNPs, capacitors
  const rename = (fig, map) => fig.map((el) => el.map((x) => (x && typeof x === 'object' && !Array.isArray(x) && map[x.n] ? Object.assign({}, x, { n: map[x.n] }) : x)));
  const divEx = B.biasFig({ type: 'npn', base: 'div', VCC: 10, R1: 40e3, R2: 10e3, RE: 1.3e3, RC: 4e3 });
  const divTw = rename(B.biasFig({ type: 'npn', base: 'vbb', VCC: 10, VBB: 2, RB: 8e3, RE: 1.3e3, RC: 4e3 }), { R_B: 'R_{TH}', 'V_{BB}': 'V_{TH}' });
  const pnpDiv = B.biasFig({ type: 'pnp', base: 'div', VCC: 10, R1: 10e3, R2: 40e3, RE: 1.3e3, RC: 4e3, nodes: true });
  const ampW = { VCC: 15, R1: 56e3, R2: 12e3, RC: 5.6e3, RE: 1.2e3, RL: 10e3, RS: 2e3, bypass: true };

  L({
    id: 'bk06-divider', title: 'DC analysis II: the divider, PNP circuits, and capacitors', ref: 'Lecture 22',
    steps: [
      R(md`
        ### The question

        The bias you will meet most often, on exams and in real amplifiers, sets the base with two resistors from $V_{CC}$ to ground. When does the base sit where the divider says, and when does the base current pull it down? This section answers that, then does the same for PNPs, and then strips a full amplifier (coupling and bypass capacitors, a source, a load) down to its DC circuit.
      `),
      R(md`
        ### The physical picture: a divider is a spring the base leans on

        Two resistors in series across $V_{CC}$ hold their midpoint at $V_{CC}R_2/(R_1 + R_2)$, *as long as nothing draws current from it*. The base does draw current: $I_B$ leaves the divider at that node. A loaded divider sags, the way a spring gives a little when you lean on it.

        How much it sags depends on how hard the base pulls compared with how stiff the divider is. A divider made of small resistors (a large current flowing through it) barely notices $I_B$. One made of large resistors sags noticeably. Thévenin's theorem makes this exact.
      `),
      RF(md`
        ### The model: replace the divider by its Thévenin twin

        Looking back from the base into the divider:
        - **open-circuit voltage** (nothing drawn): $V_{TH} = V_{CC}\dfrac{R_2}{R_1 + R_2}$;
        - **resistance** with the supply zeroed (so $V_{CC}$ becomes ground and the two resistors are in parallel): $R_{TH} = R_1\parallel R_2 = \dfrac{R_1R_2}{R_1 + R_2}$.

        The base sees a source $V_{TH}$ behind a resistor $R_{TH}$: exactly the circuit of [Example 2 in the last section](#/l/bk06-dc). So, with no new work,

        !!key Divider bias
          $$I_B = \frac{V_{TH} - 0.7}{R_{TH} + (\beta + 1)R_E},\qquad I_E = \frac{V_{TH} - 0.7}{R_E + R_{TH}/(\beta + 1)},\qquad V_{TH} = \frac{V_{CC}R_2}{R_1 + R_2},\quad R_{TH} = R_1\parallel R_2$$

        [[fig:tw]]
      `, { tw: { fig: row([[divEx, 'the divider'], [divTw, 'its Thévenin twin']]), cap: 'The same transistor, before and after replacing the divider by $V_{TH}$ behind $R_{TH}$.' } }),
      R(md`
        ### Example: how much does the base sag?

        $V_{CC} = 10\,\text{V}$, $R_1 = 40\kO$, $R_2 = 10\kO$, $R_E = 1.3\kO$, $R_C = 4\kO$, $\beta = 100$.

        1. **Twin:** $V_{TH} = 10\times\tfrac{10}{50} = 2\,\text{V}$, $R_{TH} = 40\parallel10 = 8\kO$.
        2. **Base loop:** $I_B = \dfrac{2 - 0.7}{8 + 101\times1.3}\,\text{mA} = \dfrac{1.3}{139.3}\,\text{mA} = 9.332\,\mu\text{A}$, so $I_C = 0.9332\,\text{mA}$ and $I_E = 0.9426\,\text{mA}$.
        3. **Nodes:** $V_E = 1.225\,\text{V}$, $V_B = 1.925\,\text{V}$, $V_C = 10 - (0.9332)(4) = 6.267\,\text{V}$. **Check:** $V_C\ge V_B$ ✓.

        The base sits $75\,\text{mV}$ below $V_{TH}$: that is $I_BR_{TH} = 9.33\,\mu\text{A}\times8\kO$, the sag. If we had ignored the base current ("the divider holds $2\,\text{V}$") we would have said $I_E = 1.3\,\text{V}/1.3\kO = 1\,\text{mA}$: 6% high.
      `),
      R(md`
        ### The derivation: when is a divider stiff?

        Divide the exact $I_E$ by the "stiff" estimate $I_{E,stiff} = (V_{TH} - 0.7)/R_E$ (the value with no base current):
        $$\frac{I_E}{I_{E,stiff}} = \frac{R_E}{R_E + R_{TH}/(\beta + 1)} = \frac{1}{1 + \dfrac{R_{TH}}{(\beta + 1)R_E}}.$$
        The error is set by one ratio: **$R_{TH}$ against $(\beta + 1)R_E$**. When the ratio is small, the error is about the ratio itself. Above: $8\kO/(101\times1.3\kO) = 0.061$, and indeed the current came out about 6% low.

        **The rule of thumb:** call a divider stiff when $R_{TH}\le0.1(\beta + 1)R_E$; then ignoring the base current costs less than 10%, and $V_B\approx V_{TH}$. *The Art of Electronics* says the same thing in currents: make the divider's own current about ten times the base current.

        **The price of stiffness.** Make the same divider ten times smaller ($8\kO$ and $2\kO$): $R_{TH} = 1.6\kO$, and the exact $I_C$ becomes $0.978\,\text{mA}$, only 1% below the stiff value. But the divider now draws $10\,\text{V}/10\kO = 1\,\text{mA}$, as much as the transistor, and (Chapter 9) it loads the signal source more. Real designs sit near the rule of thumb.
      `),
      RF(md`
        ### PNP circuits: the same, upside down

        For a PNP, $R_E$ hangs from $V_{CC}$ down to the emitter, the divider still runs from $V_{CC}$ to ground, and $R_C$ goes from the collector to ground. The base loop now starts at $V_{CC}$: down through $R_E$ (carrying $(\beta + 1)I_B$), across $0.7\,\text{V}$ (emitter to base), then through $R_{TH}$ to $V_{TH}$ (the base current flows *out* of the base into the divider):
        $$V_{CC} - (\beta + 1)I_BR_E - 0.7 - I_BR_{TH} = V_{TH}\quad\Rightarrow\quad I_B = \frac{V_{CC} - 0.7 - V_{TH}}{R_{TH} + (\beta + 1)R_E}.$$

        [[fig:p]]

        **Example.** $V_{CC} = 10\,\text{V}$, $R_1 = 10\kO$ (top), $R_2 = 40\kO$, $R_E = 1.3\kO$, $R_C = 4\kO$, $\beta = 100$. Then $V_{TH} = 8\,\text{V}$, $R_{TH} = 8\kO$, and
        $$I_B = \frac{10 - 0.7 - 8}{8 + 131.3}\,\text{mA} = 9.332\,\mu\text{A},\qquad I_C = 0.9332\,\text{mA}.$$
        $V_E = 10 - 1.225 = 8.775\,\text{V}$, $V_B = 8.075\,\text{V}$, $V_C = I_CR_C = 3.733\,\text{V}$. **Check (PNP):** $V_C\le V_B$ ✓.

        Every number matches the NPN example above, measured down from $10\,\text{V}$ instead of up from ground. That is no accident: this circuit *is* the NPN circuit turned upside down.
      `, { p: { fig: pnpDiv, cap: 'A PNP with divider bias: emitter resistor on top, collector resistor to ground.' } }),
      RF(md`
        ### Capacitors at DC

        Real amplifiers connect the signal source and the load through **coupling capacitors**, and often put a **bypass capacitor** across $R_E$. At DC a capacitor carries no current ($i = C\,dv/dt = 0$ for a constant voltage): **it is an open circuit**. So the DC circuit is found by erasing every capacitor, and with it everything that was connected only through a capacitor: the source, its $R_S$, the load $R_L$.

        [[fig:a]]

        **Worked example.** $V_{CC} = 15\,\text{V}$, $R_1 = 56\kO$, $R_2 = 12\kO$, $R_C = 5.6\kO$, $R_E = 1.2\kO$ (bypassed), $R_L = 10\kO$, $R_S = 2\kO$, $\beta = 120$.

        1. **DC circuit:** erase $C_1$, $C_2$, $C_E$. $R_S$, $R_L$ and the source are gone; $R_E$ is fully in the circuit (its bypass capacitor is open).
        2. **Twin:** $V_{TH} = 15\times\tfrac{12}{68} = 2.647\,\text{V}$, $R_{TH} = 56\parallel12 = 9.882\kO$.
        3. **Base loop:** $I_B = \dfrac{2.647 - 0.7}{9.882 + 121\times1.2}\,\text{mA} = \dfrac{1.947}{155.08}\,\text{mA} = 12.56\,\mu\text{A}$, $I_C = 1.507\,\text{mA}$.
        4. **Nodes:** $V_E = 1.823\,\text{V}$, $V_B = 2.523\,\text{V}$, $V_C = 15 - (1.507)(5.6) = 6.563\,\text{V}$ ✓.

        $R_L = 10\kO$ never appeared: $C_2$ keeps the load from disturbing the bias. (It will matter for the *signal*, in Chapter 9.)
      `, { a: { fig: row([[B.ampFig(ampW), 'the amplifier'], [B.ampFig(Object.assign({}, ampW, { dc: true })), 'its DC circuit']]), cap: 'A common-emitter amplifier and the circuit left at DC: every capacitor open.' } }),
      R(md`
        ### Check it

        - **Stiff limit** ($R_{TH}\to0$, e.g. $R_1$, $R_2$ tiny): $I_E\to(V_{TH} - 0.7)/R_E$, and $V_B\to V_{TH}$.
        - **$\beta\to\infty$:** the same limit, since the base draws nothing.
        - **No bottom resistor** ($R_2\to\infty$): $V_{TH}\to V_{CC}$, $R_{TH}\to R_1$: fixed bias with an emitter resistor.
        - **Units:** volts over ohms ✓.

        ### What it means, and how to recognize it

        A divider sets a voltage; the emitter resistor turns that voltage into a current. The transistor only contributes its $0.7\,\text{V}$ and a small base current. Whenever you see two resistors from $V_{CC}$ to ground meeting at a base, replace them by $V_{TH}$ and $R_{TH}$ before doing anything else. Whenever you see capacitors, erase them first.

        !!mistake Common mistakes
          - Putting $V_B = V_{TH}$ when the divider is not stiff. The base sits $I_BR_{TH}$ below (NPN) or above (PNP) $V_{TH}$.
          - Using $R_1 + R_2$, or $R_2$ alone, for $R_{TH}$. With the supply zeroed the two are in **parallel**.
          - Keeping $R_L$ or $R_S$ in the DC circuit: they sit behind coupling capacitors.
          - Leaving out a bypassed $R_E$ at DC: the bypass capacitor is open at DC, so $R_E$ is fully there.
          - For a PNP, writing the loop from ground: start at $V_{CC}$, where its emitter resistor is.
      `),
      Q(md`When can you take a divider-biased base to sit at $V_{TH}$ (ignore the base current)?`,
        ['When $R_{TH}\\ll(\\beta + 1)R_E$, say $R_{TH}\\le0.1(\\beta + 1)R_E$', 'When $R_{TH}\\ll R_E$', 'Whenever $\\beta$ is above 50', 'Never: the base current always matters'], 0,
        [null, 'Far too strict: $R_E$ is multiplied by $(\\beta + 1)$ as seen from the base, so $R_{TH}$ only has to be small next to $(\\beta + 1)R_E$.', '$\\beta$ alone does not decide it; a huge $R_{TH}$ can sag even with a large $\\beta$.', 'For an estimate it often does not matter much; the ratio $R_{TH}/(\\beta + 1)R_E$ tells you how much.'],
        md`$I_E/I_{E,stiff} = 1/(1 + R_{TH}/((\beta + 1)R_E))$: the error is about $R_{TH}/((\beta + 1)R_E)$ when small.`),
      Q(md`What is the Thévenin resistance of a base divider $R_1$ (to $V_{CC}$) and $R_2$ (to ground)?`,
        ['$R_1\\parallel R_2$', '$R_1 + R_2$', '$R_2$', '$R_1$'], 0,
        [null, 'With $V_{CC}$ zeroed both resistors go from the base to ground: parallel, not series.', '$R_1$ also connects the base to an incremental ground (the zeroed supply).', '$R_2$ is not alone: $R_1$ goes to the zeroed supply.'],
        md`Zero the supply: $V_{CC}$ becomes ground, so $R_1$ and $R_2$ both run from the base to ground: $R_{TH} = R_1\parallel R_2$.`),
      Q(md`A common-emitter amplifier has a coupling capacitor to a $10\kO$ load and a bypass capacitor across $R_E$. For the DC operating point,`,
        ['the load is ignored and $R_E$ is fully in the circuit', 'the load is in parallel with $R_C$ and $R_E$ is shorted', 'the load is ignored and $R_E$ is shorted', 'the load is in parallel with $R_C$ and $R_E$ is fully in the circuit'], 0,
        [null, 'At DC both capacitors are open: the load is cut off, and the bypass capacitor does not short anything.', 'The bypass capacitor shorts $R_E$ only for signals. At DC it is open.', 'The load sits behind $C_2$, which is open at DC.'],
        md`Capacitors are open at DC: erase them, and erase whatever was connected only through them. The bypass capacitor matters for signals, not for the bias.`),
      Q(md`Making the bias divider ten times stiffer (resistors ten times smaller) costs`,
        ['Ten times more divider current, and a lower input resistance for the signal', 'Nothing: it only makes the bias more accurate', 'A larger collector current', 'Saturation'], 0,
        [null, 'The divider current comes from the supply, and the divider loads the signal source (Chapter 9).', 'The bias barely changes: the emitter resistor sets the current.', 'The base voltage stays about the same, so the bias point does too.'],
        md`Stiffness costs power ($V_{CC}/(R_1 + R_2)$) and input resistance. That is why designers stop near $R_{TH}\approx0.1(\beta + 1)R_E$.`),
      P({
        id: 'bk06-div-npn', title: 'Divider bias, NPN',
        q: md`$V_{CC} = 12\,\text{V}$, $R_1 = 47\kO$, $R_2 = 10\kO$, $R_E = 1\kO$, $R_C = 4.7\kO$, $\beta = 150$. Find $V_{TH}$, $R_{TH}$, $I_C$ and $V_C$.`,
        fig: B.biasFig({ type: 'npn', base: 'div', VCC: 12, R1: 47e3, R2: 10e3, RE: 1e3, RC: 4.7e3 }),
        parts: [{ lbl: 'V_{TH}', unit: 'V', ans: 2.10526 }, { lbl: 'R_{TH}', unit: 'kΩ', ans: 8.24561, traps: [{ v: 57, msg: 'With the supply zeroed the resistors are in parallel, not in series.' }] },
          { lbl: 'I_C', unit: 'mA', ans: 1.32368, traps: [{ v: 1.40526, msg: 'That ignores the base current (a perfectly stiff divider). Keep $R_{TH}$ in the loop.' }] }, { lbl: 'V_C', unit: 'V', ans: 5.77873 }],
        hints: [md`$V_{TH} = 12\times10/57$, $R_{TH} = 47\parallel10$.`, md`$I_B = (V_{TH} - 0.7)/(R_{TH} + (\beta + 1)R_E)$.`],
        sol: md`
1. $V_{TH} = 12\times\tfrac{10}{57} = 2.105\,\text{V}$, $R_{TH} = \tfrac{47\times10}{57} = 8.246\kO$.
2. $I_B = \dfrac{2.105 - 0.7}{8.246 + 151\times1}\,\text{mA} = \dfrac{1.405}{159.25}\,\text{mA} = 8.825\,\mu\text{A}$; $I_C = 150I_B = 1.324\,\text{mA}$.
3. $V_E = (1.332\,\text{mA})(1\kO) = 1.333\,\text{V}$, $V_B = 2.033\,\text{V}$, $V_C = 12 - (1.324)(4.7) = 5.779\,\text{V}\ge V_B$ ✓.

The stiff estimate, $1.405\,\text{V}/1\kO = 1.405\,\text{mA}$ for $I_E$, is 5% high: $R_{TH}/(\beta + 1)R_E = 0.055$.`,
      }),
      P({
        id: 'bk06-div-stiff', title: 'Soft divider, stiff divider',
        q: md`$V_{CC} = 12\,\text{V}$, $R_E = 1.5\kO$, $R_C = 4.7\kO$, $\beta = 80$, and both dividers below give $V_{TH} = 2\,\text{V}$. Find $I_C$ (exact) for (a) $R_1 = 100\kO$, $R_2 = 20\kO$ and (b) $R_1 = 10\kO$, $R_2 = 2\kO$. Then give the stiff estimate of $I_E$, which is the same for both.`,
        parts: [{ lbl: 'I_C\\ (a)', unit: 'mA', ans: 0.752714 }, { lbl: 'I_C\\ (b)', unit: 'mA', ans: 0.844384 }, { lbl: 'I_{E,stiff}', unit: 'mA', ans: 0.866667 }],
        hints: [md`(a) $R_{TH} = 16.67\kO$; (b) $R_{TH} = 1.667\kO$. Compare each with $(\beta + 1)R_E = 121.5\kO$.`],
        sol: md`
(a) $R_{TH} = 100\parallel20 = 16.67\kO$: $I_B = \dfrac{1.3}{16.67 + 81\times1.5}\,\text{mA} = \dfrac{1.3}{138.17}\,\text{mA} = 9.409\,\mu\text{A}$, $I_C = 0.7527\,\text{mA}$.

(b) $R_{TH} = 10\parallel2 = 1.667\kO$: $I_B = \dfrac{1.3}{1.667 + 121.5}\,\text{mA} = 10.55\,\mu\text{A}$, $I_C = 0.8444\,\text{mA}$.

Stiff estimate: $I_E = 1.3\,\text{V}/1.5\kO = 0.8667\,\text{mA}$. The soft divider (a) is 12% below it ($R_{TH}/(\beta + 1)R_E = 0.137$); the stiff one (b) only 1.4%. But divider (b) draws $12\,\text{V}/12\kO = 1\,\text{mA}$ from the supply, ten times more than (a).`,
      }),
      P({
        id: 'bk06-div-pnp', title: 'Divider bias, PNP',
        q: md`A PNP ($\beta = 80$): $V_{CC} = 12\,\text{V}$, $R_1 = 15\kO$ from $V_{CC}$ to the base, $R_2 = 45\kO$ from the base to ground, $R_E = 2\kO$ from $V_{CC}$ to the emitter, $R_C = 3\kO$ from the collector to ground. Find $V_{TH}$, $R_{TH}$, $I_C$ and $V_C$.`,
        fig: B.biasFig({ type: 'pnp', base: 'div', VCC: 12, R1: 15e3, R2: 45e3, RE: 2e3, RC: 3e3 }),
        parts: [{ lbl: 'V_{TH}', unit: 'V', ans: 9 }, { lbl: 'R_{TH}', unit: 'kΩ', ans: 11.25 }, { lbl: 'I_C', unit: 'mA', ans: 1.06205, traps: [{ v: 80 * (9 - 0.7) / (11.25 + 81 * 2), msg: 'That loop started from ground with $V_{TH} - 0.7$. A PNP\'s loop starts at $V_{CC}$: the drive is $V_{CC} - 0.7 - V_{TH}$.' }] }, { lbl: 'V_C', unit: 'V', ans: 3.18615 }],
        hints: [md`$V_{TH} = 12\times45/60$, $R_{TH} = 15\parallel45$.`, md`$I_B = \dfrac{V_{CC} - 0.7 - V_{TH}}{R_{TH} + (\beta + 1)R_E}$.`],
        sol: md`
1. $V_{TH} = 12\times\tfrac{45}{60} = 9\,\text{V}$, $R_{TH} = 15\parallel45 = 11.25\kO$.
2. $I_B = \dfrac{12 - 0.7 - 9}{11.25 + 81\times2}\,\text{mA} = \dfrac{2.3}{173.25}\,\text{mA} = 13.28\,\mu\text{A}$; $I_C = 80I_B = 1.062\,\text{mA}$.
3. $V_E = 12 - (1.075\,\text{mA})(2\kO) = 9.849\,\text{V}$, $V_B = 9.149\,\text{V}$, $V_C = (1.062)(3) = 3.186\,\text{V}$.
4. Check (PNP): $V_C = 3.19\,\text{V}\le V_B = 9.15\,\text{V}$ ✓.`,
      }),
      P({
        id: 'bk06-div-amp', title: 'Strip an amplifier to its DC circuit',
        q: md`The amplifier below has $V_{CC} = 9\,\text{V}$, $R_1 = 33\kO$, $R_2 = 10\kO$, $R_C = 2.2\kO$, $R_E = 680\,\Omega$ (bypassed), $R_L = 4.7\kO$, $R_S = 1\kO$, $\beta = 100$, and large capacitors. Find $I_C$ and $V_C$. Does $R_L$ change them?`,
        fig: B.ampFig({ VCC: 9, R1: 33e3, R2: 10e3, RC: 2.2e3, RE: 680, RL: 4.7e3, RS: 1e3, bypass: true, vals: false }),
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1.82442 }, { lbl: 'V_C', unit: 'V', ans: 4.98628, traps: [{ v: 9 - 1.82442 * 2.2 * 4.7 / 6.9, msg: '$R_L$ sits behind $C_2$, an open circuit at DC: it is not in parallel with $R_C$ for the bias.' }] },
          { lbl: 'Does $R_L$ affect the DC point?', mc: ['No: $C_2$ is open at DC', 'Yes: it is in parallel with $R_C$', 'Yes: it changes $I_B$'], a: 0, fixed: true, why: [null, 'Only for signals. At DC no current flows through $C_2$.', '$R_L$ is not in the base loop at all.'] }],
        hints: [md`Erase the capacitors. Then $V_{TH} = 9\times10/43$, $R_{TH} = 33\parallel10$.`],
        sol: md`
1. DC circuit: erase $C_1$, $C_2$, $C_E$; $R_S$, $R_L$ and the source disappear and $R_E = 680\,\Omega$ stays.
2. $V_{TH} = 9\times\tfrac{10}{43} = 2.093\,\text{V}$, $R_{TH} = 33\parallel10 = 7.674\kO$.
3. $I_B = \dfrac{2.093 - 0.7}{7.674 + 101\times0.68}\,\text{mA} = \dfrac{1.393}{76.35}\,\text{mA} = 18.24\,\mu\text{A}$, $I_C = 1.824\,\text{mA}$.
4. $V_C = 9 - (1.824)(2.2) = 4.986\,\text{V}$; $V_B = 0.7 + (1.843)(0.68) = 1.953\,\text{V}$ ✓ active.

$R_L$ plays no part: $C_2$ is open at DC.`,
      }),
      P({
        id: 'bk06-div-design', title: 'Design a divider bias',
        q: md`Design an NPN bias with $V_{CC} = 12\,\text{V}$ and $R_E = 1\kO$ for $I_E\approx2\,\text{mA}$, using a divider that carries $0.5\,\text{mA}$ (ignore the base current while designing). Find $R_2$ and $R_1$. Then, with $\beta = 100$ and $R_C = 3\kO$, find the actual $I_C$ including the base current.`,
        parts: [{ lbl: 'R_2', unit: 'kΩ', ans: 5.4 }, { lbl: 'R_1', unit: 'kΩ', ans: 18.6 }, { lbl: 'I_C', unit: 'mA', ans: 1.90141 }],
        hints: [md`$I_E = 2\,\text{mA}$ through $1\kO$ puts the emitter at $2\,\text{V}$, so the base at $2.7\,\text{V}$.`, md`The divider carries $0.5\,\text{mA}$: $R_2 = 2.7\,\text{V}/0.5\,\text{mA}$, $R_1 = (12 - 2.7)\,\text{V}/0.5\,\text{mA}$.`],
        sol: md`
1. Target: $V_E = 2\,\text{V}$, so $V_B = 2.7\,\text{V}$.
2. With $0.5\,\text{mA}$ in the divider: $R_2 = 2.7/0.5 = 5.4\kO$, $R_1 = 9.3/0.5 = 18.6\kO$.
3. Check with the base current: $V_{TH} = 2.7\,\text{V}$, $R_{TH} = 18.6\parallel5.4 = 4.185\kO$, $I_B = \dfrac{2.0}{4.185 + 101}\,\text{mA} = 19.01\,\mu\text{A}$, $I_C = 1.901\,\text{mA}$: 5% below the 2 mA target (and $R_{TH}/(\beta + 1)R_E = 0.041$, as expected). A divider current of $0.5\,\text{mA}$ is 26 times the base current: stiff.`,
      }),
      R(md`
        ### Drill: divider bias

        NPN and PNP dividers, some drawn as complete amplifiers. Erase the capacitors, make the Thévenin twin, write the loop, check.
      `),
      G('bk_dcdiv', { need: 4 }),
    ],
  });

  // ================================================================== 6.7 DC analysis III: saturation and the switch
  const emIc0 = (IB, v) => { const k = Math.exp(-v / 0.025); return IB * (1 - 11 * k) / (0.01 + 10 * k); };    // no Early effect
  const loadLine = plot({
    w: 450, h: 280, x: [0, 5.2], y: [0, 3.4], xt: [0, 1, 2, 3, 4, 5], yt: [0, 1, 2, 3],
    xl: 'V_{CE}\\ (\\text{V})', yl: 'I_C\\ (\\text{mA})',
    curves: [0.005, 0.01, 0.015, 0.03].map((IB) => ({ f: (v) => emIc0(IB, v), from: 0.05, cls: 'dc' })).concat([{ pts: [[0, 2], [5, 0]] }]),
    marks: [{ x: 3.75, y: 0.5, n: '' }, { x: 2.5, y: 1, n: '' }, { x: 1.25, y: 1.5, n: '' }, { x: 0.188, y: 1.925, n: '' }],
    labels: [{ x: 5.1, y: 0.62, t: '5\\,\\mu\\text{A}', a: 'r' }, { x: 5.1, y: 1.12, t: '10\\,\\mu\\text{A}', a: 'r' }, { x: 5.1, y: 1.62, t: '15\\,\\mu\\text{A}', a: 'r' },
      { x: 5.1, y: 3.12, t: 'I_B = 30\\,\\mu\\text{A}', a: 'r' }, { x: 1.1, y: 1.9, t: '\\text{load line}', a: 'l' }, { x: 0.3, y: 2.35, t: '\\text{saturated}', a: 'l' }],
    aria: 'load line on the output characteristics',
  });
  const satModel = [['term', [0, 0.8], { n: 'B', side: 'l' }], ['w', [0, 0.8], [1, 0.8]], ['V', [1, 0.8], [1, 2.2], { n: '0.7\\,\\text{V}', side: 'l' }],
    ['w', [1, 2.2], [2.6, 2.2]], ['V', [2.6, 0.2], [2.6, 2.2], { n: '0.2\\,\\text{V}' }], ['w', [2.6, 0.2], [2.6, -0.3]], ['term', [2.6, -0.3], { n: 'C', side: 'r' }],
    ['w', [1.8, 2.2], [1.8, 2.7]], ['term', [1.8, 2.7], { n: 'E', side: 'r' }]];
  const relabel = (fig, n, patch) => fig.map((el) => el.map((x) => (x && typeof x === 'object' && !Array.isArray(x) && x.n === n ? Object.assign({}, x, patch) : x)));
  const switchFig = relabel(B.biasFig({ type: 'npn', base: 'vbb', VCC: 10, RB: 4.3e3, RC: 1e3 }), 'V_{BB}', { n: 'v_{in}', s: '0\\text{ or }5\\,\\text{V}' });
  const satB = B.biasFig({ type: 'npn', base: 'vbb', VCC: 6, VBB: 3, RB: 10e3, RE: 1e3, RC: 4e3 });

  L({
    id: 'bk06-sat', title: 'DC analysis III: when the check fails (saturation, and the switch)', ref: 'Lecture 22',
    steps: [
      R(md`
        ### The question

        Sometimes "assume active, solve" gives a collector voltage below the base, or even below ground. That is not a wrong answer to report; it is the transistor telling you it is **saturated**. This section shows what the circuit really does then, how to compute it with two fixed voltages and two loops, and how engineers use saturation on purpose: the transistor as a switch.
      `),
      RF(md`
        ### The physical picture: the load line

        Take a grounded-emitter transistor with $R_C$ to $V_{CC}$. The collector loop says $V_{CE} = V_{CC} - I_CR_C$, i.e.
        $$I_C = \frac{V_{CC} - V_{CE}}{R_C},$$
        a straight line on the output characteristics, from $V_{CC}/R_C$ on the current axis to $V_{CC}$ on the voltage axis: the **load line**. The operating point must sit on that line *and* on the transistor's curve for the given $I_B$.

        [[fig:ll]]

        Here $V_{CC} = 5\,\text{V}$, $R_C = 2.5\kO$, $\beta = 100$. With $I_B = 5$, 10, 15 µA the points sit on the flat parts: $I_C = \beta I_B$, forward active. Push $I_B$ to $30\,\mu\text{A}$ and $\beta I_B = 3\,\text{mA}$ is above the top of the load line: the line meets that curve only on its steep left part, at $V_{CE}\approx0.19\,\text{V}$ and $I_C = 1.92\,\text{mA}$. **The transistor has run out of volts, not out of current.** More base current would hardly move it: the collector cannot go below about $0.2\,\text{V}$, so $I_C$ cannot exceed $(V_{CC} - 0.2)/R_C$.
      `, { ll: { fig: loadLine, cap: 'The load line of $V_{CC} = 5\\,\\text{V}$, $R_C = 2.5\\kO$ on the output curves ($\\beta = 100$, computed from the Ebers–Moll model). Dots: the operating points for $I_B = 5$, 10, 15 and $30\\,\\mu\\text{A}$; the last one is saturated.' } }),
      RF(md`
        ### The model in saturation: two fixed voltages

        In saturation both junctions are on, so we fix *both* voltages: $V_{BE} = 0.7\,\text{V}$ and $V_{CE} = 0.2\,\text{V}$ (for a PNP, $V_{EB} = 0.7\,\text{V}$ and $V_{EC} = 0.2\,\text{V}$). In exchange, $I_C = \beta I_B$ no longer holds: **$I_B$ and $I_C$ are two separate unknowns**, found from two loops.

        [[fig:sm]]

        !!method When the check fails
          1. Replace the transistor by its saturation model: $V_{BE} = 0.7\,\text{V}$, $V_{CE} = 0.2\,\text{V}$.
          2. Write KVL around the **base loop** and around the **collector loop**, with $I_B$ and $I_C$ as unknowns. A resistor in the emitter carries $I_B + I_C$ and appears in both.
          3. Solve the pair.
          4. **Check consistency:** $I_B > 0$, $I_C > 0$, and $I_C < \beta I_B$ (the forced $\beta = I_C/I_B$ is less than $\beta$). If $I_C$ came out bigger than $\beta I_B$, the transistor was active after all: recheck the first try.
      `, { sm: { fig: satModel, cap: 'The DC model of a saturated NPN: $0.7\\,\\text{V}$ from base to emitter, $0.2\\,\\text{V}$ from collector to emitter.' } }),
      RF(md`
        ### Example A: the transistor switch

        A $1\kO$ load hangs from $V_{CC} = 10\,\text{V}$ to the collector; the emitter is grounded; a logic signal $v_{in}$ (0 or $5\,\text{V}$) drives the base through $R_B = 4.3\kO$. The worst-case transistor has $\beta = 50$.

        [[fig:sw]]

        **Input high ($5\,\text{V}$).** Assume active: $I_B = (5 - 0.7)/4.3\kO = 1\,\text{mA}$, $I_C = 50\,\text{mA}$, $V_C = 10 - 50 = -40\,\text{V}$. Impossible: saturated. Redo with $V_{CE} = 0.2\,\text{V}$: the base loop still gives $I_B = 1\,\text{mA}$ (no shared resistor), and the collector loop gives
        $$I_C = \frac{V_{CC} - 0.2}{R_C} = \frac{9.8\,\text{V}}{1\kO} = 9.8\,\text{mA}.$$
        Consistency: forced $\beta = 9.8 < 50$ ✓. The load has $9.8\,\text{V}$ across it: the switch is **on**.

        **Input low ($0\,\text{V}$).** No base drive, cutoff: $I_C = 0$, the load has no voltage across it: the switch is **off**.

        !!intuition Overdrive the base: forced $\beta$ of about 10
          The edge of saturation is at $I_B = I_{C,sat}/\beta = 9.8\,\text{mA}/50 = 0.2\,\text{mA}$. Designers drive about five times more, a forced $\beta$ near 10, so that the switch stays hard on for any transistor of the type and $V_{CE}$ stays near its minimum. The cost, noted in *The Art of Electronics*: the extra charge stored in a saturated base takes time to remove, so heavily saturated switches turn off slowly.
      `, { sw: { fig: switchFig, cap: 'A transistor switch: a logic input drives the base; the load is $R_C$.' } }),
      RF(md`
        ### Example B: with an emitter resistor, the loops are coupled

        $V_{CC} = 6\,\text{V}$, $V_{BB} = 3\,\text{V}$ through $R_B = 10\kO$, $R_E = 1\kO$, $R_C = 4\kO$, $\beta = 100$.

        [[fig:b]]

        **Step 1: active?** $I_B = \dfrac{3 - 0.7}{10 + 101\times1}\,\text{mA} = 20.72\,\mu\text{A}$, $I_C = 2.072\,\text{mA}$, $V_C = 6 - (2.072)(4) = -2.29\,\text{V}$. Below $V_B = 2.79\,\text{V}$: **saturated**.

        **Step 2: two loops**, with $V_{BE} = 0.7\,\text{V}$, $V_{CE} = 0.2\,\text{V}$, and $R_E$ carrying $I_B + I_C$. Working in mA and kΩ (so volts come out):
        $$\text{base: }3 - 0.7 = 10\,I_B + 1\,(I_B + I_C)\quad\Rightarrow\quad 11\,I_B + I_C = 2.3$$
        $$\text{collector: }6 - 0.2 = 4\,I_C + 1\,(I_B + I_C)\quad\Rightarrow\quad I_B + 5\,I_C = 5.8$$
        **Step 3: solve.** From the first, $I_C = 2.3 - 11I_B$. Into the second: $I_B + 11.5 - 55I_B = 5.8$, so $I_B = 5.7/54 = 0.1056\,\text{mA}$ and $I_C = 2.3 - 1.161 = 1.139\,\text{mA}$.

        **Step 4: check.** Forced $\beta = 1.139/0.1056 = 10.8 < 100$ ✓. Nodes: $V_E = (1.244\,\text{mA})(1\kO) = 1.244\,\text{V}$, $V_B = 1.944\,\text{V}$, $V_C = V_E + 0.2 = 1.444\,\text{V}$.

        Notice the base current jumped from $21\,\mu\text{A}$ (the failed guess) to $106\,\mu\text{A}$. In saturation the emitter carries less than the guess said, so the emitter sits lower, and the base loop pushes more current into the base. Everything about the circuit changed; only the two fixed voltages were trustworthy.
      `, { b: { fig: satB, cap: 'Example B: a base resistor and an emitter resistor, with too little room for $R_C$.' } }),
      R(md`
        ### Check it

        - **$R_C\to0$:** the collector sits at $V_{CC}$, far above the base: never saturated ✓.
        - **$\beta\to\infty$ in Example A:** the edge of saturation needs $I_B\to0$; any base drive saturates ✓.
        - **Units:** in the coupled equations, mA times kΩ is volts on both sides ✓.

        ### What it means, and how to recognize it

        In saturation the transistor is a closed switch: the outside resistors set $I_C$, and the base has more current than it needs. You recognize it when the active guess puts the collector below the base, often absurdly so (a negative $V_C$, or one below the emitter). A circuit whose base is driven hard from a logic level, with a load in the collector, is a switch: expect saturation on purpose.

        !!mistake Common mistakes
          - Keeping $I_C = \beta I_B$ after the check fails.
          - Reusing the active-guess $I_B$ when there is an emitter resistor. With $R_E$ the two loops are coupled; solve them together.
          - Forgetting the $0.2\,\text{V}$: $I_C = V_{CC}/R_C$ is a little too big.
          - Skipping the consistency check $I_C < \beta I_B$.
          - Calling a transistor "saturated" because $V_{CE}$ is a few volts. The test is the collector against the base, not $V_{CE}$ against zero.
      `),
      Q(md`A grounded-emitter NPN is saturated, with $R_C$ to $V_{CC}$. Doubling its base current would`,
        ['Barely change $I_C$: it is already $(V_{CC} - 0.2)/R_C$', 'Double $I_C$', 'Halve $I_C$', 'Take it out of saturation'], 0,
        [null, 'That is forward-active behaviour. In saturation the collector circuit sets $I_C$.', 'More base drive pushes deeper into saturation, not back.', 'More base current pushes it further in (a smaller forced $\\beta$).'],
        md`The collector is already at about $0.2\,\text{V}$. The load line allows no more current. Extra base current only lowers the forced $\beta$ and stores more charge.`),
      Q(md`What does a forced $\beta$ of 10 (for a transistor whose $\beta$ is 100) tell you?`,
        ['It is saturated: the base supplies ten times the current needed to reach the edge of saturation', 'Its $\\beta$ has dropped to 10 because of heating', 'It is forward active with a small current', 'The calculation is wrong: $I_C/I_B$ must equal $\\beta$'], 0,
        [null, 'The device\'s $\\beta$ is unchanged; the circuit simply cannot use all the base drive.', 'In forward active $I_C/I_B = \\beta$ exactly.', 'Only in forward active. In saturation $I_C/I_B < \\beta$ is the consistency condition.'],
        md`$I_C/I_B = 10 < \beta = 100$: the outside circuit limits $I_C$. The base current is ten times $I_{C}/\beta$, i.e. ten times what would just reach the edge of saturation.`),
      Q(md`After "assume active" gives $V_C < V_B$, what do you change for the second try?`,
        ['Replace $I_C = \\beta I_B$ by $V_{CE} = 0.2\\,\\text{V}$, and solve two loops for $I_B$ and $I_C$', 'Keep $I_C = \\beta I_B$ and set $V_{BE} = 0.2\\,\\text{V}$', 'Lower $\\beta$ until $V_C = V_B$', 'Assume cutoff'], 0,
        [null, 'The BE junction is still on at $0.7\\,\\text{V}$; it is the collector junction that has turned on.', '$\\beta$ is a property of the transistor. In saturation $I_C = \\beta I_B$ simply stops holding.', 'The base is driven; the BE junction is on.'],
        md`Saturation trades one equation for another: $I_C = \beta I_B$ out, $V_{CE} = 0.2\,\text{V}$ in. Two unknowns ($I_B$, $I_C$), two loops.`),
      P({
        id: 'bk06-sat-ge', title: 'A saturated common emitter',
        q: md`$V_{CC} = 9\,\text{V}$, $R_C = 2.2\kO$, emitter grounded, the base driven from $V_{BB} = 5\,\text{V}$ through $R_B = 22\kO$, $\beta = 120$. Find the $V_C$ that "assume active" predicts, the actual $I_C$, and the forced $\beta$.`,
        fig: B.biasFig({ type: 'npn', base: 'vbb', VCC: 9, VBB: 5, RB: 22e3, RC: 2.2e3 }),
        parts: [{ lbl: 'V_C\\ \\text{(active guess)}', unit: 'V', ans: -42.6, tol: { rel: 0.015, abs: 0.05 } }, { lbl: 'I_C', unit: 'mA', ans: 4, traps: [{ v: 23.4545, msg: 'That is $\\beta I_B$, the active value the check ruled out.' }, { v: 9 / 2.2, msg: 'Leave $0.2\\,\\text{V}$ across the saturated transistor.' }] }, { lbl: '\\beta_{forced}', unit: '', ans: 20.4651 }],
        hints: [md`$I_B = (5 - 0.7)/22\kO$; active would give $V_C = V_{CC} - \beta I_BR_C$.`, md`Saturated: $I_C = (V_{CC} - 0.2)/R_C$; $I_B$ is unchanged (no shared resistor).`],
        sol: md`
1. $I_B = 4.3\,\text{V}/22\kO = 195.5\,\mu\text{A}$. Active guess: $I_C = 120\times195.5\,\mu\text{A} = 23.45\,\text{mA}$, $V_C = 9 - (23.45)(2.2) = -42.6\,\text{V}$: impossible, saturated.
2. $I_C = (9 - 0.2)/2.2\kO = 4\,\text{mA}$, $I_B = 195.5\,\mu\text{A}$ (the base loop does not involve the collector).
3. Forced $\beta = 4\,\text{mA}/195.5\,\mu\text{A} = 20.5 < 120$ ✓.`,
      }),
      P({
        id: 'bk06-sat-re', title: 'Saturation with an emitter resistor',
        q: md`$V_{CC} = 10\,\text{V}$, $V_{BB} = 4\,\text{V}$ through $R_B = 15\kO$, $R_E = 1.5\kO$, $R_C = 6.8\kO$, $\beta = 80$. Show that the transistor saturates, then find $I_B$, $I_C$, $V_C$ and the forced $\beta$.`,
        fig: B.biasFig({ type: 'npn', base: 'vbb', VCC: 10, VBB: 4, RB: 15e3, RE: 1.5e3, RC: 6.8e3 }),
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 94.2094 }, { lbl: 'I_C', unit: 'mA', ans: 1.1637, traps: [{ v: 1.93407, msg: 'That is the active guess $\\beta I_B$; it puts $V_C$ at $-3.15\\,\\text{V}$.' }] }, { lbl: 'V_C', unit: 'V', ans: 2.08686, tol: { rel: 0.015, abs: 0.03 } }, { lbl: '\\beta_{forced}', unit: '', ans: 12.3524 }],
        hints: [md`Active guess: $I_B = 3.3/(15 + 81\times1.5)\,\text{mA}$; compare $V_C$ with $V_B$.`, md`Saturated (mA, kΩ): $16.5I_B + 1.5I_C = 3.3$ and $1.5I_B + 8.3I_C = 9.8$.`],
        sol: md`
1. Active guess: $I_B = 3.3/136.5\,\text{mA} = 24.18\,\mu\text{A}$, $I_C = 1.934\,\text{mA}$, $V_C = 10 - 13.15 = -3.15\,\text{V} < V_B$: saturated.
2. Base loop: $4 - 0.7 = 15I_B + 1.5(I_B + I_C)$, i.e. $16.5I_B + 1.5I_C = 3.3$. Collector loop: $10 - 0.2 = 6.8I_C + 1.5(I_B + I_C)$, i.e. $1.5I_B + 8.3I_C = 9.8$.
3. Solve: from the first, $I_B = (3.3 - 1.5I_C)/16.5$; into the second: $0.3 - 0.1364I_C + 8.3I_C = 9.8$, so $I_C = 9.5/8.1636 = 1.164\,\text{mA}$ and $I_B = 94.2\,\mu\text{A}$.
4. $V_E = (1.258\,\text{mA})(1.5\kO) = 1.887\,\text{V}$, $V_C = V_E + 0.2 = 2.087\,\text{V}$; forced $\beta = 12.4 < 80$ ✓.`,
      }),
      P({
        id: 'bk06-sat-switch', title: 'Design a switch',
        q: md`An NPN switch drives a $1.2\kO$ load from $V_{CC} = 12\,\text{V}$ (emitter grounded) from a $3.3\,\text{V}$ logic output through $R_B$. The transistor's $\beta$ is at least 50. (a) What base current just reaches the edge of saturation ($V_{CE} = 0.2\,\text{V}$) for the worst-case transistor? (b) Choose $R_B$ for a forced $\beta$ of 10.`,
        parts: [{ lbl: 'I_{B,edge}', unit: 'µA', ans: 196.667 }, { lbl: 'R_B', unit: 'kΩ', ans: 2.64407, traps: [{ v: 3.3 / 0.98333, msg: 'The base sits at $0.7\\,\\text{V}$: $R_B$ has $3.3 - 0.7 = 2.6\\,\\text{V}$ across it.' }] }],
        hints: [md`$I_{C,sat} = (12 - 0.2)/1.2\kO$.`, md`Forced $\beta = 10$: $I_B = I_{C,sat}/10$, and $R_B = (3.3 - 0.7)/I_B$.`],
        sol: md`
1. $I_{C,sat} = 11.8\,\text{V}/1.2\kO = 9.833\,\text{mA}$. The edge for $\beta = 50$: $I_B = 9.833/50 = 196.7\,\mu\text{A}$.
2. Forced $\beta = 10$: $I_B = 0.9833\,\text{mA}$, so $R_B = 2.6\,\text{V}/0.9833\,\text{mA} = 2.64\kO$ (a standard $2.7\kO$ would do). That is five times the edge current: the switch stays hard on for every transistor of the type.`,
      }),
      P({
        id: 'bk06-sat-edge', title: 'Where saturation begins',
        q: md`A grounded-emitter NPN ($\beta = 150$) has $R_C = 4\kO$ to $V_{CC} = 12\,\text{V}$. What base current puts it exactly at the edge of the course's active test ($V_C = V_B$)? What base current brings $V_{CE}$ down to $0.2\,\text{V}$ if $I_C = \beta I_B$ held all the way?`,
        parts: [{ lbl: 'I_B\\ (V_C = V_B)', unit: 'µA', ans: 18.8333 }, { lbl: 'I_B\\ (V_{CE} = 0.2\\,\\text{V})', unit: 'µA', ans: 19.6667 }],
        hints: [md`$V_C = V_B = 0.7\,\text{V}$ means $I_C = (12 - 0.7)/4\kO$.`],
        sol: md`
1. $V_C = 0.7\,\text{V}$: $I_C = 11.3/4 = 2.825\,\text{mA}$, so $I_B = 2.825/150 = 18.83\,\mu\text{A}$.
2. $V_C = 0.2\,\text{V}$: $I_C = 11.8/4 = 2.95\,\text{mA}$, $I_B = 19.67\,\mu\text{A}$.

Between the two lies soft saturation: only 4% more base current takes the collector from the base voltage down to $0.2\,\text{V}$. On the load line it is a short stretch: beyond it, extra base current buys almost nothing.`,
      }),
      P({
        id: 'bk06-sat-pnp', title: 'A saturated PNP',
        q: md`A PNP ($\beta = 100$) has its emitter at $V_{CC} = 12\,\text{V}$, its base pulled to ground through $R_B = 47\kO$, and $R_C = 3.3\kO$ from the collector to ground. Find $I_C$ and the forced $\beta$.`,
        fig: B.biasFig({ type: 'pnp', base: 'gnd', VCC: 12, RB: 47e3, RC: 3.3e3 }),
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 3.57576, traps: [{ v: 24.0426, msg: 'That is $\\beta I_B$; it would need $V_C = 79\\,\\text{V}$, far above the supply.' }] }, { lbl: '\\beta_{forced}', unit: '', ans: 14.8732 }],
        hints: [md`$I_B = (12 - 0.7)/47\kO$ out of the base. Active would put $V_C = \beta I_BR_C$: compare with $V_B$.`, md`Saturated PNP: $V_{EC} = 0.2\,\text{V}$, so $V_C = 11.8\,\text{V}$.`],
        sol: md`
1. $V_B = 11.3\,\text{V}$, $I_B = 11.3/47\kO = 240.4\,\mu\text{A}$. Active guess: $I_C = 24.04\,\text{mA}$, $V_C = 79.3\,\text{V}$: above the base (and the supply): saturated.
2. $V_C = 12 - 0.2 = 11.8\,\text{V}$, $I_C = 11.8/3.3\kO = 3.576\,\text{mA}$.
3. Forced $\beta = 3.576\,\text{mA}/240.4\,\mu\text{A} = 14.9 < 100$ ✓.`,
      }),
      R(md`
        ### Drill: circuits that saturate

        Each one fails the active check. Find the failed guess, then the real currents from two loops, then the forced $\beta$.
      `),
      G('bk_dcsat', { need: 4 }),
    ],
  });
})();

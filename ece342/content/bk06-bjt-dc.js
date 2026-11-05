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
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 10 }, { lbl: 'I_E', unit: 'mA', ans: 1.51, traps: [{ v: 1.5, msg: 'That is $I_C$. The emitter carries both currents: $I_E = I_C + I_B$.' }] }, { lbl: '\\alpha', unit: '', ans: 150 / 151, tol: { rel: 0.0006 } }],
        hints: [md`$I_B = I_C/\beta$.`, md`KCL: $I_E = I_C + I_B$. Then $\alpha = I_C/I_E$.`],
        sol: md`
1. $I_B = I_C/\beta = 1.5\,\text{mA}/150 = 10\,\mu\text{A}$.
2. KCL on the device: $I_E = I_C + I_B = 1.5\,\text{mA} + 0.01\,\text{mA} = 1.51\,\text{mA}$ (that is $(\beta + 1)I_B = 151\times10\,\mu\text{A}$ ✓).
3. $\alpha = I_C/I_E = 1.5/1.51 = 150/151 = 0.9934$.`,
      }),
      P({
        id: 'bk06-how-alpha', title: 'How sensitive is beta to alpha?',
        q: md`Two transistors of the same type have $\alpha = 0.990$ and $\alpha = 0.995$. Find each one's $\beta$. By what percentage do their $\alpha$ values differ?`,
        parts: [{ lbl: '\\beta\\ (\\alpha = 0.990)', unit: '', ans: 99, traps: [{ v: 100, msg: 'Close, but $\\beta = \\alpha/(1 - \\alpha) = 0.99/0.01 = 99$, not 100. ($1/(1 - \\alpha) = \\beta + 1$.)' }] },
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
})();

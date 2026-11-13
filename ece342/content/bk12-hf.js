/* Book Chapter 12 — Transistor capacitances, poles at nodes, and Miller (the student's Lecture 28).
   Every number below was checked against an independent complex nodal solve (scratchpad a8/: solver.py, ex12.py):
   node poles, the exact two-node roots, the zero, the Miller poles and exact bandwidths. Figures and the formula kit
   live in js/gens-bk-a8.js (window.BK8); drills are GENS.bk_*. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const B = window.BK8;
  const { F, M, num, RT, CT, TT, WT, FT, MS } = B;
  const f = U.fmt;
  const L = (l) => BK.lesson('bk12', l);
  const tn = (RTH, RL, Cin, Cxy, Cout, gm) => B.twoNode({ dev: 'mos', gm, RS: RTH, RL, C: { Cgs: Cin, Cgd: Cxy, CL: Cout } });

  // ---------------------------------------------------------------- plots used in this chapter
  // channel charge along a saturated channel: Q'(y) = W C_ox V_ov sqrt(1 - y/L), against the uniform V_DS = 0 channel
  const chanPlot = B.plot2({
    x: [0, 1], y: [0, 1.25], w: 440, h: 230,
    xt: [0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, t: `$${v}$` })), yt: [0, 0.5, 1].map((v) => ({ v, t: `$${v}$` })),
    areas: [{ f: (x) => Math.sqrt(Math.max(0, 1 - x)), g: () => 0 }],
    curves: [{ f: () => 1, cls: 'dash ink', n: '$V_{DS} = 0$: area $1$', at: 0.62 },
      { f: (x) => Math.sqrt(Math.max(0, 1 - x)), n: 'saturation: area $\\tfrac{2}{3}$', at: 0.3, pos: 'b' }],
    xl: 'position along the channel, $y/L$', yl: "$Q'(y)/(WC_{ox}V_{ov})$",
  });
  // f_T of a BJT against collector current (tau_F = 20 ps, C_je + C_mu = 0.3 pF)
  const ftPlot = B.plot2({
    x: [-5, -1.5], y: [0, 9], logx: true, w: 460, h: 240,
    xt: [-5, -4, -3, -2].map((k) => ({ v: k, t: `$10^{${k}}$` })), yt: [0, 2, 4, 6, 8].map((v) => ({ v, t: `$${v}$` })),
    curves: [{ f: () => 7.958, cls: 'dash ink', n: '$1/(2\\pi\\tau_F)$', at: -2.4 },
      { f: (I) => (I / 0.025) / (2 * Math.PI * (20e-12 * I / 0.025 + 0.3e-12)) / 1e9, n: '$f_T$', at: -3.4, pos: 'l' }],
    xl: '$I_C$ (A)', yl: '$f_T$ (GHz)',
  });
  // pole splitting: the exact poles of the running CS example as C_gd grows from 0 to 50 fF
  const splitPlot = (() => {
    const pole = (c, which) => { if (c < 1e-18) return which ? 1 / (4e3 * 200e-15) : 1 / (8e3 * 300e-15); const t = tn(4e3, 8e3, 200e-15, c, 300e-15, 5e-3); return which ? t.r2 : t.r1; };
    return B.plot2({
      x: [0, 50], y: [7.5, 10], logy: true, w: 460, h: 250,
      xt: [0, 10, 20, 30, 40, 50].map((v) => ({ v, t: `$${v}$` })), yt: [8, 9, 10].map((k) => ({ v: k, t: `$10^{${k}}$` })),
      curves: [{ f: (c) => pole(c * 1e-15, 1), n: '$\\omega_{p2}$', at: 30 }, { f: (c) => pole(c * 1e-15, 0), n: '$\\omega_{p1}$', at: 30, pos: 'b' }],
      marks: [{ x: 25, n: '$25\\,\\text{fF}$' }],
      xl: '$C_{gd}$ (fF)', yl: 'exact poles (rad/s)',
    });
  })();

  // ---------------------------------------------------------------- worked numbers (checked in a8/ex12.py)
  const RUN = tn(4e3, 8e3, 200e-15, 25e-15, 300e-15, 5e-3);           // the running CS example
  const CE1 = B.twoNode({ dev: 'bjt', gm: 20e-3, rpi: 5e3, RS: 5e3, RL: 5e3, C: { Cpi: 4e-12, Cmu: 0.2e-12, CL: 1e-12 } });

  // ================================================================ 12.1 where the capacitances come from
  L({
    id: 'bk12-where', title: 'Where transistor capacitances come from', ref: 'Lecture 28',
    steps: [
      R(md`
        !!key Chapter 12 at a glance
          Every amplifier loses gain at high frequency. This chapter finds out where, and by how much. You will be able to: (1) say where each capacitance of a MOSFET and a BJT physically comes from and estimate its size; (2) turn every node of a circuit into a pole, $1/RC$; (3) solve the common-source and common-emitter stage exactly, as Lecture 28 does, and see where the dominant-pole approximation comes from; (4) derive Miller's theorem and use it on every stage.

          You need: the small-signal models ([Chapter 2](#/l/bk02-model), [Chapter 7](#/l/bk07-hybrid)), the resistance at a node, $R_{UP}\parallel R_{DN}$ ([Chapter 3](#/l/bk03-node), [Chapter 8](#/l/bk08-node)), and poles and Bode plots ([Chapter 10](#/l/bk10-pz), [Chapter 11](#/l/bk11-pole)).

        ### The question

        In [Chapter 10](#/l/bk10-amp) a common source lost gain above $1/(R_DC_L)$ because of a load capacitor we put there on purpose. Real transistors carry capacitors of their own, built into their structure, and they are there even when you add nothing. Before you can find any pole on Exam 3 you must know where each one sits (between which two terminals) and roughly how big it is. That is this whole section.
      `),
      R(md`
        ### The physical picture: control costs charge

        A capacitor is a place where changing a voltage costs charge: $\Delta Q = C\,\Delta V$. Both transistors are **controlled by charge**. A MOSFET's gate holds charge on one plate so that the channel can hold the opposite charge on the other; a BJT's base holds the electrons that are on their way across it. To change the output current you must change that stored charge first, and the charge has to arrive through whatever resistance drives the node. That takes a time of order $RC$.

        At low frequency there is plenty of time and nobody notices. At high frequency the signal reverses before the charge has caught up, and the gain falls. So a transistor's capacitances are not flaws stuck on an ideal device: **they are the price of control.** The more control (more $g_m$ per area), the more charge, and the question becomes how much current you get per unit of stored charge. That ratio is the transistor's speed, $f_T$, at the end of this section.
      `),
      RF(md`
        ### The MOSFET, part 1: the gate is a capacitor plate

        Look at the cross-section. The gate, the thin oxide and the silicon under it form a parallel-plate capacitor with $C_{ox}$ per unit area (with this course's $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$ and $\mu_n\approx0.04\,\text{m}^2/\text{V·s}$, $C_{ox}\approx2.5\,\text{fF}/\mu\text{m}^2$). The whole gate area gives $WLC_{ox}$. Above threshold, every extra electron in the channel is matched by one extra positive charge on the gate: that is how the gate "pulls" the channel into existence ([Chapter 2](#/l/bk02-how)).

        [[fig:x]]

        Four capacitors live in this picture:
        - **gate to channel**, through the oxide. The channel is connected to the source (in saturation), so this becomes most of $C_{gs}$;
        - **the overlaps**: the gate reaches a distance $L_{ov}$ over the source and drain regions, $WL_{ov}C_{ox}$ each. The drain overlap is (almost) all of $C_{gd}$;
        - **the junctions**: the $n^+$ source and drain sit in the $p$ body and form reverse-biased $pn$ junctions, $C_{sb}$ and $C_{db}$, to the bulk. For an NMOS the bulk is the lowest supply, so in a small-signal circuit they go **to ground**.
      `, { x: { fig: B.X.mosCross(), cap: 'An NMOS in saturation. The channel (shaded) is thickest at the source and pinched off before the drain; the gate overlaps both $n^+$ regions by $L_{ov}$; dashed lines are the edges of the junction depletion layers.' } }),
      RF(md`
        ### The MOSFET, part 2: why $C_{gs}$ is two thirds of $WLC_{ox}$

        This is worth deriving once, because it explains both why $C_{gs}$ is big and why $C_{gd}$ is small. Let $y$ run along the channel from the source ($y = 0$) to the drain ($y = L$), and let $V(y)$ be the channel voltage there ($0$ at the source).

        **Charge per unit length.** The local gate-to-channel voltage is $V_{GS} - V(y)$, and only the part above threshold makes channel charge:
        $$Q'(y) = WC_{ox}\big(V_{GS} - V(y) - V_{TN}\big) = WC_{ox}\big(V_{ov} - V(y)\big)$$
        **Current.** Drift current is charge per length times velocity, and the velocity is $\mu$ times the field $dV/dy$. The same current flows through every slice of the channel:
        $$I_D = \mu Q'(y)\frac{dV}{dy} = \mu WC_{ox}\big(V_{ov} - V\big)\frac{dV}{dy}$$
        **Integrate** from the source ($V = 0$) to position $y$:
        $$I_Dy = \mu WC_{ox}\Big(V_{ov}V - \frac{V^2}{2}\Big)$$
        **Saturation** means the channel just reaches zero charge at the drain, $V(L) = V_{ov}$. Putting $y = L$ gives $I_DL = \tfrac12\mu WC_{ox}V_{ov}^2$: the square law, recovered. Now complete the square in the previous line, $(V_{ov} - V)^2 = V_{ov}^2 - 2I_Dy/(\mu WC_{ox})$, and substitute $I_D$:
        $$\big(V_{ov} - V(y)\big)^2 = V_{ov}^2\Big(1 - \frac{y}{L}\Big)\quad\Rightarrow\quad Q'(y) = WC_{ox}V_{ov}\sqrt{1 - \frac{y}{L}}$$
        The channel is full at the source and thins to nothing at the drain:

        [[fig:q]]

        **Total charge.** The average of $\sqrt{1 - y/L}$ over the channel is $\int_0^1\sqrt{1 - u}\,du = \tfrac23$, so
        $$Q_{ch} = \tfrac{2}{3}\,WLC_{ox}V_{ov}$$
        **The capacitances.** Raise $V_{GS}$ and $V_{ov}$ rises with it, so $dQ_{ch}/dV_{GS} = \tfrac23WLC_{ox}$: the charge comes in from the source. Raise $V_{DS}$ in saturation and $Q_{ch}$ does not change at all (the drain end is already pinched off), so the channel adds nothing to $C_{gd}$. With the overlaps:

        !!key MOSFET capacitances in saturation
          $$C_{gs} = \tfrac{2}{3}WLC_{ox} + WL_{ov}C_{ox},\qquad C_{gd} = WL_{ov}C_{ox}$$
          $C_{db}$ and $C_{sb}$: the drain and source junctions to the bulk (ground for an NMOS).
      `, { q: { fig: chanPlot, cap: 'Channel charge along the channel. With $V_{DS} = 0$ it is uniform (area 1); in saturation it falls as $\\sqrt{1 - y/L}$ and encloses only $\\tfrac23$ of that area.' } }),
      R(md`
        ### The junctions: a capacitor whose plates move apart

        A reverse-biased $pn$ junction is a capacitor too. The depletion layer is a slab with no free carriers, fixed positive charge on the $n$ side and fixed negative charge on the $p$ side: two "plates" a distance $W_{dep}$ apart, so $C_j = \varepsilon A/W_{dep}$. More reverse bias pushes the plates apart, and the capacitance **drops**. For an abrupt junction
        $$C_j = \frac{C_{j0}}{\sqrt{1 + V_R/\phi_B}}$$
        where $C_{j0}$ is the zero-bias value (proportional to the junction area) and $\phi_B\approx0.7$ to $0.9\,\text{V}$ is the built-in potential. Example: a drain with $C_{j0} = 60\,\text{fF}$, $\phi_B = 0.8\,\text{V}$, at $V_{DB} = 2\,\text{V}$ has $C_{db} = 60/\sqrt{3.5} = 32\,\text{fF}$. A rule of thumb for layouts: make the drain small, and keep it at a high voltage.
      `),
      R(md`
        ### The MOSFET in numbers

        $W = 30\,\mu\text{m}$, $L = 1\,\mu\text{m}$, $L_{ov} = 0.1\,\mu\text{m}$, $C_{ox} = 2.5\,\text{fF}/\mu\text{m}^2$:
        - $WLC_{ox} = 30\times1\times2.5 = 75\,\text{fF}$, so the channel part of $C_{gs}$ is $\tfrac23\times75 = 50\,\text{fF}$;
        - each overlap is $WL_{ov}C_{ox} = 30\times0.1\times2.5 = 7.5\,\text{fF}$;
        - $C_{gs} = 50 + 7.5 = 57.5\,\text{fF}$ and $C_{gd} = 7.5\,\text{fF}$: **$C_{gd}$ is about an eighth of $C_{gs}$.** Hold on to that ratio: in the next sections this small capacitor will turn out to dominate.

        For a feel of scale: integrated transistors have tens of femtofarads to a few picofarads; discrete transistors (a TO-92 package on a breadboard) have picofarads, plus a few picofarads of wiring.
      `),
      RF(md`
        ### The BJT, part 1: charge in transit, $C_b = \tau_Fg_m$

        The collector current of a BJT is electrons **diffusing** across the thin base ([Chapter 6](#/l/bk06-how)). Diffusion only happens down a slope: the electron density is $n(0)$ at the emitter edge of the base (set by $V_{BE}$) and nearly zero at the collector edge, where the field sweeps every arrival away. In between it falls in a straight line: a triangle.

        [[fig:b]]

        Two facts about that triangle (base width $W_B$, area $A$, diffusion constant $D_n$):
        - **the current** is set by its slope: $I_C = qAD_n\dfrac{n(0)}{W_B}$;
        - **the stored charge** is its area: $Q_F = qA\dfrac{n(0)W_B}{2}$.

        Divide: $\dfrac{Q_F}{I_C} = \dfrac{W_B^2}{2D_n}\equiv\tau_F$, the **forward transit time**, the average time an electron spends crossing the base. So $Q_F = \tau_FI_C$. To raise $I_C$ you must first fill the triangle higher, and that extra charge has to come in through the base (as holes, which keep the base neutral). That is a capacitance from base to emitter:
        $$C_b = \frac{dQ_F}{dV_{BE}} = \tau_F\frac{dI_C}{dV_{BE}} = \tau_Fg_m$$
        Numbers: $W_B = 0.1\,\mu\text{m}$ and $D_n = 10\,\text{cm}^2/\text{s}$ give $\tau_F = (10^{-7})^2/(2\times10^{-3}) = 5\,\text{ps}$. With $\tau_F = 20\,\text{ps}$ at $I_C = 1\,\text{mA}$ ($g_m = 40\,\text{mS}$): $C_b = 0.8\,\text{pF}$. **$C_b$ grows in proportion to the bias current**: ten times the current, ten times the $C_b$.
      `, { b: { fig: B.X.bjtCross(), cap: 'The BJT as a slab. Above the base: the electrons in transit, a triangle whose slope is the current and whose area is the stored charge $Q_F$. More $V_{BE}$ lifts the triangle (dashed). Below: the two depletion layers, $C_{je}$ and $C_\\mu$.' } }),
      RF(md`
        ### The BJT, part 2: the two junctions, and the model

        - **$C_{je}$**: the depletion capacitance of the base–emitter junction. That junction is forward biased, so its depletion layer is thin and $C_{je}$ is not small, but it barely changes with current.
        - **$C_\mu$**: the depletion capacitance of the base–collector junction. It is reverse biased, so $C_\mu$ is small. It connects **the base to the collector**: in a common emitter, the input to the output.

        Lecture 28 draws the NPN model with $C_b$ and $C_{je}$ side by side, both from base to emitter, right across $r_\pi$:

        [[fig:m1]]

        They are in parallel, so they add: $C_\pi = C_b + C_{je}$, with $C_b > C_{je}$ in normal operation. The model we use from now on:

        [[fig:m2]]
      `, { m1: { fig: M.bjtHF(true), cap: 'The NPN high-frequency model as Lecture 28 draws it.' }, m2: { fig: M.bjtHF(false), cap: 'The same model with $C_\\pi = C_b + C_{je}$.' } }),
      RF(md`
        ### The MOSFET model

        [[fig:m]]

        Lecture 28's NMOS model: $C_{gs}$ from gate to source, $C_{gd}$ from gate to drain, the transconductor $g_mv_{gs}$ and $r_{ds}$ from drain to source, and the junctions $C_{db}$ and $C_{sb}$ from drain and source to the bulk, which is ground for an NMOS. (The notes draw $C_{db}$ to the source; in a common source the source is ground anyway.)

        ### The twins, side by side

        | Between | MOSFET | BJT | In a common source / emitter it is... |
        |---|---|---|---|
        | control terminal and common terminal | $C_{gs}$ | $C_\pi = C_b + C_{je}$ | input node to ground |
        | control terminal and output terminal | $C_{gd}$ (overlap) | $C_\mu$ (BC junction) | **bridging input and output** |
        | output terminal and bulk / substrate | $C_{db}$ | ($C_{cs}$, often ignored) | output node to ground |
        | common terminal and bulk | $C_{sb}$ | | shorted when the source is grounded |
        | grows with bias current? | $C_{gs}$ only through the device size | **$C_b = \tau_Fg_m\propto I_C$** | |

        **One difference to remember:** $C_\pi$ sits in parallel with $r_\pi$. A gate node has nothing to ground but its capacitors; a base node always has $r_\pi$ too.
      `, { m: { fig: M.mosHF(), cap: 'The NMOS high-frequency model (Lecture 28). Bulk = ground.' } }),
      RF(md`
        ### How fast can a transistor be? The transit frequency $f_T$

        A single number captures "charge per current". Drive the gate with a small-signal current $i_{in}$ and short the drain to ground (so the output cannot move), then ask for the current gain $i_{out}/i_{in}$:

        [[fig:t]]

        - With the drain shorted, both $C_{gs}$ and $C_{gd}$ run from the gate to ground. All of $i_{in}$ charges them: $v_{gs} = \dfrac{i_{in}}{s(C_{gs} + C_{gd})}$.
        - The drain current is $g_mv_{gs}$, minus the small current that leaks straight through $C_{gd}$, $sC_{gd}v_{gs}$. Near the frequency we want, $g_m\gg\omega C_{gd}$, so drop it: $i_{out}\approx g_mv_{gs}$.
        - Divide: $\dfrac{i_{out}}{i_{in}}\approx\dfrac{g_m}{s(C_{gs} + C_{gd})}$, a current gain that falls as $1/\omega$ and reaches **1** at

        !!key The transit frequency
          $$\omega_T = \frac{g_m}{C_{gs} + C_{gd}},\qquad \omega_T = \frac{g_m}{C_\pi + C_\mu},\qquad f_T = \frac{\omega_T}{2\pi}$$
          Above $f_T$ the transistor cannot even amplify current. Any real amplifier works well below it.

        **The MOSFET's $f_T$ is a transit time.** Ignore the overlaps: $g_m = \mu C_{ox}\tfrac{W}{L}V_{ov}$ and $C_{gs} = \tfrac23WLC_{ox}$, so $W$ and $C_{ox}$ cancel:
        $$\omega_T\approx\frac{3}{2}\,\frac{\mu V_{ov}}{L^2}$$
        roughly one over the time an electron takes to drift the length of the channel. Short channels are fast ($1/L^2$). Our $30/1$ transistor at $V_{ov} = 0.2\,\text{V}$: $g_m = 100\,\mu\times30\times0.2 = 0.6\,\text{mS}$, $\omega_T = 0.6\,\text{mS}/65\,\text{fF} = 9.2\times10^9\,\text{rad/s}$, $f_T = 1.47\,\text{GHz}$ (without overlaps it would be $1.91\,\text{GHz}$).

        **The BJT's $f_T$ has a ceiling.** $\omega_T = \dfrac{g_m}{\tau_Fg_m + C_{je} + C_\mu}$. At small currents the fixed capacitances win and $f_T$ rises in proportion to $I_C$; at large currents $C_b$ wins and $\omega_T\to1/\tau_F$:

        [[fig:ft]]

        With $\tau_F = 20\,\text{ps}$ and $C_{je} + C_\mu = 0.3\,\text{pF}$: $f_T = 1.68$, $5.79$ and $7.67\,\text{GHz}$ at $0.1$, $1$ and $10\,\text{mA}$; the ceiling is $1/(2\pi\tau_F) = 7.96\,\text{GHz}$. (Real transistors also fall off at very high current; this simple model leaves that out.)
      `, { t: { fig: M.ftTest(), cap: 'The $f_T$ test: current into the gate, drain shorted to ground, current out of the drain.' }, ft: { fig: ftPlot, cap: '$f_T$ of a BJT against bias current: proportional to $I_C$ at first, then flattening at $1/(2\\pi\\tau_F)$.' } }),
      R(md`
        ### Check it

        - **Units.** $\tau_Fg_m$: seconds times siemens = farads. $g_m/C$: siemens per farad = $1/\text{s}$. $\mu V_{ov}/L^2$: $(\text{m}^2/\text{V·s})(\text{V})/\text{m}^2 = 1/\text{s}$.
        - **Limits.** $L_{ov}\to0$: $C_{gd}\to0$ and $C_{gs}\to\tfrac23WLC_{ox}$. $V_{DS}\to0$ (deep triode): the channel is uniform and splits evenly, $\tfrac12WLC_{ox}$ to each side (not used in amplifiers, but it shows that the $\tfrac23$ is a saturation fact). $I_C\to0$: $C_b\to0$ and $C_\pi\to C_{je}$.

        ### What it means

        - The control capacitance ($C_{gs}$, $C_\pi$) is **large** and unavoidable: it is the charge that makes the transistor work.
        - The feedback capacitance ($C_{gd}$, $C_\mu$) is **small**, a by-product of geometry. It will matter far more than its size suggests, because it connects the input to the output (Miller, section 12.4).
        - A BJT's $C_\pi$ scales with current; a MOSFET's $C_{gs}$ scales with size. Both give the same trade: more $g_m$ costs more capacitance, and the ratio, $\omega_T$, is the device's figure of merit.

        ### How to recognize it

        On any frequency problem, the first step is to **draw the capacitors onto the circuit**: $C_{gs}$/$C_\pi$ between gate/base and source/emitter, $C_{gd}$/$C_\mu$ between gate/base and drain/collector, $C_{db}$ from the drain to ground. Then see which terminals are grounded: a capacitor with both ends on ground does nothing ($C_{sb}$ with the source grounded), and one end on ground means "a node to ground".

        !!mistake Common mistakes
          - Putting $C_\mu$ from the base to the emitter. It is the base–**collector** junction.
          - Using all of $WLC_{ox}$ for $C_{gs}$ in saturation. It is $\tfrac23$ of it (plus overlap).
          - Thinking $C_{gd}$ includes channel charge in saturation. The channel is pinched off at the drain: only the overlap.
          - Treating $C_\pi$ as a fixed number when the bias changes. $C_b = \tau_Fg_m$ follows $I_C$.
          - Reporting $\omega_T$ when asked for $f_T$ (or the reverse): a factor of $2\pi$.
      `),
      Q(md`An NMOS is in saturation. Which is larger, and why?`,
        [md`$C_{gs}$: the channel is connected to the source and holds $\tfrac23WLC_{ox}$; the drain end is pinched off, so $C_{gd}$ is only overlap`,
          md`$C_{gd}$: the drain is at the higher voltage, so it pulls more charge`,
          md`They are equal: each gets half of $WLC_{ox}$`,
          md`$C_{gd}$: the drain junction adds to it`], 0,
        [null, md`Changing $V_{DS}$ in saturation does not change the channel charge at all: the drain end is already pinched off.`,
          md`That is the triode case with $V_{DS}\approx0$, where the channel is uniform. In saturation it is $\tfrac23$ and (almost) $0$.`,
          md`The drain junction is $C_{db}$, from drain to bulk, not to the gate.`],
        md`$C_{gs} = \tfrac23WLC_{ox} + WL_{ov}C_{ox}$, $C_{gd} = WL_{ov}C_{ox}$. Typically $C_{gd}$ is a few to ten times smaller than $C_{gs}$.`, { fig: B.X.mosCross() }),
      Q(md`You raise a BJT's collector current from $0.5\,\text{mA}$ to $2\,\text{mA}$. What happens to $C_\pi$ and to $C_\mu$?`,
        [md`$C_\pi$ rises (its $C_b = \tau_Fg_m$ part quadruples); $C_\mu$ stays about the same`,
          md`Both stay the same: capacitances are set by the geometry`,
          md`Both quadruple`,
          md`$C_\mu$ rises, $C_\pi$ stays the same`], 0,
        [null, md`$C_b$ is charge in transit, $Q_F = \tau_FI_C$: more current, more stored charge, more $dQ/dV$.`,
          md`$C_\mu$ is a depletion capacitance set by the base–collector voltage, not by the current.`,
          md`It is the other way round: $C_\mu$ depends on $V_{CB}$, $C_b$ on $I_C$.`],
        md`$g_m = I_C/V_T$ goes up four times, so $C_b = \tau_Fg_m$ does too; $C_\pi = C_b + C_{je}$ rises (a bit less than four times, because $C_{je}$ stays). $C_\mu$ only depends on the reverse bias across the base–collector junction.`),
      Q(md`The drain of an NMOS moves from $1\,\text{V}$ to $3\,\text{V}$ above the bulk. What happens to $C_{db}$?`,
        [md`It decreases: more reverse bias widens the depletion layer, moving the "plates" apart`,
          md`It increases: more voltage stores more charge`,
          md`It does not change: it is set by the drain area`,
          md`It becomes negative`], 0,
        [null, md`Charge does grow, but slower than the voltage: $C = dQ/dV$ falls as the depletion layer widens.`,
          md`The area sets $C_{j0}$; the bias sets how far apart the charges sit.`,
          md`A depletion capacitance is always positive; it only shrinks with reverse bias.`],
        md`$C_j = C_{j0}/\sqrt{1 + V_R/\phi_B}$. With $\phi_B = 0.8\,\text{V}$: from $1/\sqrt{2.25} = 0.67\,C_{j0}$ to $1/\sqrt{4.75} = 0.46\,C_{j0}$.`),
      P({
        id: 'bk12-where-x1', title: 'Capacitances from the layout',
        q: md`An NMOS has $W = 50\,\mu\text{m}$, $L = 0.5\,\mu\text{m}$, overlap $L_{ov} = 0.05\,\mu\text{m}$, $C_{ox} = 2.5\,\text{fF}/\mu\text{m}^2$, and is in saturation. Find $C_{gs}$ and $C_{gd}$.`,
        parts: [num('C_{gs}', 2 / 3 * 62.5e-15 + 6.25e-15, 'C', [{ v: 62.5e-15 + 6.25e-15, msg: 'In saturation only $\\tfrac23$ of $WLC_{ox}$ is gate–source.' }, { v: 2 / 3 * 62.5e-15, msg: 'Add the source overlap $WL_{ov}C_{ox}$.' }]),
          num('C_{gd}', 6.25e-15, 'C', [{ v: 6.25e-15 + 62.5e-15 / 3, msg: 'The drain end of the channel is pinched off: no channel charge belongs to $C_{gd}$.' }])],
        hints: [md`$WLC_{ox} = 50\times0.5\times2.5\,\text{fF}$.`, md`$C_{gs} = \tfrac23WLC_{ox} + WL_{ov}C_{ox}$, $C_{gd} = WL_{ov}C_{ox}$.`],
        sol: md`$WLC_{ox} = 50\times0.5\times2.5 = 62.5\,\text{fF}$ and $WL_{ov}C_{ox} = 50\times0.05\times2.5 = 6.25\,\text{fF}$.
$$C_{gs} = \tfrac23(62.5) + 6.25 = 41.7 + 6.25 = 47.9\,\text{fF},\qquad C_{gd} = 6.25\,\text{fF}$$
$C_{gd}$ is about $\tfrac18$ of $C_{gs}$.`,
      }),
      P({
        id: 'bk12-where-x2', title: 'The transit frequency of that transistor',
        q: md`The transistor of the previous problem runs at $V_{ov} = 0.25\,\text{V}$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$). Find $g_m$ and $f_T$. Then find the $f_T$ it would have without overlaps, from $\omega_T = \tfrac32\mu_nV_{ov}/L^2$ with $\mu_n = 0.04\,\text{m}^2/\text{V·s}$.`,
        parts: [num('g_m', 2.5e-3, 'g'),
          num('f_T', 2.5e-3 / (47.9167e-15 + 6.25e-15) / (2 * Math.PI), 'f', [{ v: 2.5e-3 / (47.9167e-15 + 6.25e-15), msg: 'That is $\\omega_T$ in rad/s; divide by $2\\pi$.' }]),
          num('f_T\\ \\text{without overlaps}', 1.5 * 0.04 * 0.25 / 0.25e-12 / (2 * Math.PI), 'f')],
        hints: [md`$g_m = \mu_nC_{ox}\tfrac{W}{L}V_{ov}$ with $W/L = 100$.`, md`$\omega_T = g_m/(C_{gs} + C_{gd})$, $f_T = \omega_T/2\pi$.`],
        sol: md`$g_m = 100\,\mu\text{A/V}^2\times100\times0.25\,\text{V} = 2.5\,\text{mS}$.
$$\omega_T = \frac{2.5\,\text{mS}}{(47.9 + 6.25)\,\text{fF}} = 4.62\times10^{10}\,\text{rad/s},\qquad f_T = 7.35\,\text{GHz}$$
Without overlaps: $\omega_T = \tfrac32\times0.04\times0.25/(0.5\times10^{-6})^2 = 6.0\times10^{10}\,\text{rad/s}$, $f_T = 9.55\,\text{GHz}$. The overlaps cost about a quarter of the speed of this short transistor.`,
      }),
      P({
        id: 'bk12-where-x3', title: 'A BJT\'s $C_\\pi$ from its transit time',
        q: md`An NPN has $\tau_F = 10\,\text{ps}$ and $C_{je} = 0.3\,\text{pF}$, and runs at $I_C = 2\,\text{mA}$. Find $g_m$, $C_b$ and $C_\pi$.`,
        parts: [num('g_m', 80e-3, 'g'), num('C_b', 0.8e-12, 'C', [{ v: 10e-12 * 2e-3, msg: 'That is the stored charge $Q_F = \\tau_FI_C$; the capacitance is its derivative, $\\tau_Fg_m$.' }]),
          num('C_\\pi', 1.1e-12, 'C', [{ v: 0.8e-12, msg: 'Add $C_{je}$: $C_\\pi = C_b + C_{je}$.' }])],
        hints: [md`$g_m = I_C/V_T$.`, md`$C_b = \tau_Fg_m$.`],
        sol: md`$g_m = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS}$. $C_b = \tau_Fg_m = 10\,\text{ps}\times80\,\text{mS} = 0.8\,\text{pF}$. $C_\pi = C_b + C_{je} = 0.8 + 0.3 = 1.1\,\text{pF}$.`,
      }),
      P({
        id: 'bk12-where-x4', title: 'A junction under reverse bias',
        q: md`A drain junction has $C_{j0} = 40\,\text{fF}$ and $\phi_B = 0.8\,\text{V}$. Find $C_{db}$ at a reverse bias of $2.4\,\text{V}$.`,
        parts: [num('C_{db}', 20e-15, 'C', [{ v: 40e-15, msg: 'That is the zero-bias value. Reverse bias widens the depletion layer.' }, { v: 10e-15, msg: 'The square root: $\\sqrt{1 + 2.4/0.8} = \\sqrt4 = 2$.' }])],
        hints: [md`$C_j = C_{j0}/\sqrt{1 + V_R/\phi_B}$.`],
        sol: md`$1 + 2.4/0.8 = 4$, $\sqrt4 = 2$, so $C_{db} = 40/2 = 20\,\text{fF}$. Half the zero-bias value: the depletion layer is twice as wide.`,
      }),
      P({
        id: 'bk12-where-x5', title: 'Why more current helps a BJT, up to a point',
        q: md`An NPN has $\tau_F = 25\,\text{ps}$ and $C_{je} + C_\mu = 0.5\,\text{pF}$. Find $f_T$ at $I_C = 0.25\,\text{mA}$ and at $2.5\,\text{mA}$, and the ceiling $f_T$ can never exceed.`,
        parts: [num('f_T\\ (0.25\\,\\text{mA})', 2.122066e9, 'f'), num('f_T\\ (2.5\\,\\text{mA})', 5.305165e9, 'f'), num('f_{T,max}', 1 / (2 * Math.PI * 25e-12), 'f', [{ v: 1 / 25e-12, msg: 'That is $1/\\tau_F$ in rad/s; divide by $2\\pi$ for hertz.' }])],
        hints: [md`$\omega_T = \dfrac{g_m}{\tau_Fg_m + C_{je} + C_\mu}$.`, md`For large $g_m$ the fixed capacitances stop mattering: $\omega_T\to1/\tau_F$.`],
        sol: md`**$0.25\,\text{mA}$:** $g_m = 10\,\text{mS}$, $C_b = 25\,\text{ps}\times10\,\text{mS} = 0.25\,\text{pF}$. $\omega_T = 10\,\text{mS}/0.75\,\text{pF} = 1.33\times10^{10}\,\text{rad/s}$, $f_T = 2.12\,\text{GHz}$.

**$2.5\,\text{mA}$:** $g_m = 100\,\text{mS}$, $C_b = 2.5\,\text{pF}$. $\omega_T = 100\,\text{mS}/3\,\text{pF} = 3.33\times10^{10}\,\text{rad/s}$, $f_T = 5.31\,\text{GHz}$.

**Ceiling:** $\omega_T\to1/\tau_F = 4\times10^{10}\,\text{rad/s}$, $f_T\to6.37\,\text{GHz}$. Ten times the current bought only $2.5\times$ the speed, because $C_b$ grew with it.`,
      }),
      R(md`### Drills: capacitances and $f_T$`),
      G('bk_cap_mos', { need: 3 }),
      G('bk_cap_bjt', { need: 3 }),
    ],
  });

  // ================================================================ 12.2 one pole per node
  L({
    id: 'bk12-node', title: 'One pole per node', ref: 'Lecture 28 (page 4)',
    steps: [
      R(md`
        ### The question

        Where are an amplifier's poles? Solving the whole circuit with every capacitor is a page of algebra (next section). Lecture 28's shortcut finds them in seconds: **each node with a capacitance to ground gives a pole at $1/(RC)$**, where $R$ is the resistance from that node to ground. This section derives the rule, shows when it is exact, and works the lecture's three examples.
      `),
      RF(md`
        ### The physical picture: a bucket filled through a pipe

        Think of a node as a bucket (its capacitance) filled through a pipe (its resistance). A slow signal gives the bucket time to fill, and the node follows. A signal that reverses faster than the bucket's fill time, $RC$, never lets it fill: the node's swing shrinks. Every node with a capacitor is such a bucket, and if the buckets fill **one after another** (each one feeding the next, none feeding back), each one adds its own roll-off.

        ### The derivation: one node

        Any linear circuit, seen from the two ends of one capacitor, is a Thévenin source $v_{TH}$ behind a resistance $R_{TH}$ ([Chapter 1](#/l/bk01-test)):

        [[fig:a]]

        KCL at the node: the current arriving through $R_{TH}$ charges $C$:
        $$\frac{v_{TH} - v_X}{R_{TH}} = sCv_X\quad\Rightarrow\quad v_X(1 + sR_{TH}C) = v_{TH}\quad\Rightarrow\quad v_X = \frac{v_{TH}}{1 + sR_{TH}C}$$
        One pole, at $\omega_p = 1/(R_{TH}C)$ ([Chapter 10](#/l/bk10-rc)). And $R_{TH}$ is exactly what [Chapter 3](#/l/bk03-node) taught you to find: zero the inputs, then look into the node, $R_{UP}\parallel R_{DN}$.
      `, { a: { fig: M.nodeRC(), cap: 'One node: whatever drives it reduces to $v_{TH}$ and $R_{TH}$.' } }),
      RF(md`
        ### Two nodes in a row: Lecture 28's example (2)

        A common source driven through $R_S$, with a capacitor $C_{in}$ at the gate and $C_L$ at the drain (the transistor's own capacitances ignored for now):

        [[fig:c]]

        Its small-signal circuit is two separate halves joined only by the controlled source:

        [[fig:d]]

        **Node $X$.** The gate draws no current, so node $X$ is just $R_S$ feeding $C_{in}$:
        $$v_X = \frac{v_{in}}{1 + sR_SC_{in}}$$
        **The output node.** The transistor is a current source $g_mv_X$ pulling current out of the node; $R_L$ and $C_L$ are in parallel, an impedance $R_L/(1 + sR_LC_L)$:
        $$v_{out} = -g_mv_X\,\frac{R_L}{1 + sR_LC_L}$$
        **Together:**
        $$\frac{v_{out}}{v_{in}} = \frac{-g_mR_L}{(1 + sR_SC_{in})(1 + sR_LC_L)},\qquad \omega_{p,X} = \frac{1}{R_SC_{in}},\quad \omega_{p,out} = \frac{1}{R_LC_L}$$
        This is **exact**, not an approximation. The output node cannot disturb node $X$ because the only link between them is the transconductor, which sends signal forward only (the gate draws no current, and no capacitor connects the two nodes).

        !!key One pole per node
          $$\omega_p = \frac{1}{(\text{total resistance from the node to ground})\times(\text{total capacitance from the node to ground})}$$
          with the input sources zeroed. It is **exact** when every capacitor goes from a node to ground (or to an incremental ground) and the nodes only drive each other forward. When a capacitor bridges two nodes ($C_{gd}$, $C_\mu$), or a resistor links a later node back to an earlier one, it is an estimate.
      `, { c: { fig: M.ex2(), cap: 'Lecture 28, example (2).' }, d: { fig: M.ex2ss(), cap: 'Its small-signal circuit: two nodes, linked only forward by $g_mv_X$.' } }),
      RF(md`
        ### The common gate: Lecture 28's example (3)

        Now the input goes into the **source** and the gate is held:

        [[fig:e]]

        [[fig:f]]

        Ignore $r_{ds}$. With the gate at incremental ground, $v_{gs} = -v_X$, so the transistor's current $g_mv_{gs} = -g_mv_X$ flows drain to source; equivalently $g_mv_X$ flows **out of node $X$** up into the transistor. KCL at node $X$ (current in through $R_S$ = current into $C_{in}$ + current into the transistor):
        $$\frac{v_{in} - v_X}{R_S} = sC_{in}v_X + g_mv_X$$
        Multiply by $R_S$ and collect $v_X$:
        $$v_X(1 + g_mR_S + sR_SC_{in}) = v_{in}\quad\Rightarrow\quad v_X = \frac{v_{in}}{1 + g_mR_S}\cdot\frac{1}{1 + s\dfrac{R_S}{1 + g_mR_S}C_{in}}$$
        and $\dfrac{R_S}{1 + g_mR_S} = \dfrac{1}{1/R_S + g_m} = R_S\parallel\dfrac{1}{g_m}$. The pole is
        $$\omega_{p,X} = \frac{1}{\big(R_S\parallel\tfrac{1}{g_m}\big)C_{in}}$$
        exactly the rule: the node sees $R_S$ down to the zeroed source, in parallel with $1/g_m$ looking up into the source ([Chapter 3](#/l/bk03-source)). The drain node is fed by the current $g_mv_X$, so it still gives $1/(R_LC_L)$.

        **The point:** a capacitor on a source or emitter node sees something small, about $1/g_m$, so its pole is **fast**. With $R_S = 1\,\text{k}\Omega$ and $g_m = 4\,\text{mS}$, $R_S\parallel1/g_m = 200\,\Omega$, five times less than $R_S$ alone.
      `, { e: { fig: M.ex3(), cap: 'Lecture 28, example (3): the common gate.' }, f: { fig: M.ex3ss(), cap: 'Its small-signal circuit ($r_{ds}$ ignored): the transistor pulls $g_mv_X$ out of the input node.' } }),
      R(md`
        ### What each terminal adds to a node

        The rule is only as good as your node resistances, so here is the whole Exam 2 and Chapter 8 toolkit in one table. List every path from the node to ground and put them in parallel:

        | The node touches... | It adds (in parallel) | Where it was derived |
        |---|---|---|
        | a gate | nothing ($\infty$) | [Chapter 3](#/l/bk03-gate) |
        | a base, emitter grounded | $r_\pi$ | [Chapter 8](#/l/bk08-base) |
        | a base, $R_E$ under the emitter | $r_\pi + (\beta + 1)R_E$ | [Chapter 8](#/l/bk08-base) |
        | a source, gate held | $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\dfrac{1}{g_m}$ | [Chapter 3](#/l/bk03-source) |
        | an emitter, base held through $R_B$ | $\dfrac{r_\pi + R_B}{\beta + 1}\approx\dfrac{1}{g_m}$ | [Chapter 8](#/l/bk08-emitter) |
        | a drain, source grounded | $r_{ds}$ (with $R_S$: $r_{ds} + R_S + g_mr_{ds}R_S$) | [Chapter 3](#/l/bk03-degen) |
        | a collector, emitter grounded | $r_o$ | [Chapter 8](#/l/bk08-collector) |
        | a resistor to ground, to $V_{DD}$, or to a zeroed source | that resistor | |

        ### Check it

        - **Units:** ohms times farads is seconds; $1/(RC)$ is rad/s. A handy pair: $1\,\text{k}\Omega\times1\,\text{pF} = 1\,\text{ns}$, so $\omega_p = 10^9\,\text{rad/s}$.
        - **Limits:** $R_S\to0$ in example (2): $\omega_{p,X}\to\infty$, the node is driven by an ideal source and has no pole. $g_m\to0$ in example (3): $R_S\parallel1/g_m\to R_S$, the transistor no longer helps.

        ### What it means

        A node is slow when it is **high-resistance and heavily loaded**. Drains and collectors are high-resistance (that is where gain comes from), so output nodes are usually slow. Sources and emitters are low-resistance, so their nodes are fast. The art of a fast amplifier is to put the big capacitors on the low-resistance nodes.
      `),
      R(md`
        ### Worked example: two node poles and the bandwidth

        Example (2) with numbers: $R_S = 20\,\text{k}\Omega$, $C_{in} = 0.2\,\text{pF}$, $g_m = 2\,\text{mS}$, $R_L = 10\,\text{k}\Omega$, $C_L = 1\,\text{pF}$.

        1. Gain: $A_v = -g_mR_L = -20$ ($26\,\text{dB}$).
        2. Node $X$: $R = R_S = 20\,\text{k}\Omega$ (the gate adds nothing), $\tau_X = 20\,\text{k}\Omega\times0.2\,\text{pF} = 4\,\text{ns}$, $\omega_{p,X} = 2.5\times10^8\,\text{rad/s}$.
        3. Output: $R = R_L = 10\,\text{k}\Omega$, $\tau_{out} = 10\,\text{ns}$, $\omega_{p,out} = 1\times10^8\,\text{rad/s}$.
        4. $H(s) = \dfrac{-20}{(1 + s/2.5\times10^8)(1 + s/10^8)}$, exactly.
        5. Bandwidth. The lower pole is a guide, but with the poles only $2.5$ times apart the second one pulls the $-3\,\text{dB}$ point down. Exactly: solve $(1 + \omega^2\tau_X^2)(1 + \omega^2\tau_{out}^2) = 2$, which gives $\omega_{-3dB} = 8.82\times10^7\,\text{rad/s}$ ($f = 14.0\,\text{MHz}$), 12% below the lower pole. (Chapter 13 turns this into a one-line estimate.)

        !!mistake Common mistakes
          - Using $R_S$ alone at a **base** node. The base adds $r_\pi$ in parallel.
          - Using $R_S$ alone at a **source or emitter** input node. The transistor adds about $1/g_m$, and it usually wins.
          - Treating the rule as exact when a capacitor bridges two nodes. That is the next two sections.
          - Adding resistances in series that are really two separate paths to ground. Paths to ground are in **parallel**.
          - Mixing $\omega$ and $f$: $f_p = \omega_p/2\pi$.
      `),
      Q(md`A common source and a common gate both have $R_S = 1\,\text{k}\Omega$ and $C_{in} = 1\,\text{pF}$ on their input node; $g_m = 5\,\text{mS}$. Which input node is faster?`,
        [md`The common gate: its node sees $R_S\parallel1/g_m\approx167\,\Omega$`,
          md`The common source: a gate is an open circuit, so nothing slows it`,
          md`Neither: both see $R_S$`,
          md`The common source, because $C_{in}$ is in parallel with the gate`], 0,
        [null, md`An open circuit adds **nothing in parallel**, so the gate node sees all of $R_S$: that makes it the slow one.`,
          md`The common-gate input is a source node: the transistor adds $1/g_m$ in parallel.`,
          md`Parallel with the gate adds nothing; the resistance is still $R_S$.`],
        md`CS gate node: $1\,\text{k}\Omega\times1\,\text{pF} = 1\,\text{ns}$, $10^9\,\text{rad/s}$. CG source node: $1\,\text{k}\Omega\parallel200\,\Omega = 167\,\Omega$, $0.167\,\text{ns}$, $6\times10^9\,\text{rad/s}$.`),
      Q(md`When is "one pole per node" exact?`,
        [md`When every capacitor goes from a node to ground and the nodes only drive each other forward`,
          md`Always: every node has exactly one pole`,
          md`Only for BJT circuits`,
          md`Only when all the poles are equal`], 0,
        [null, md`A capacitor between two moving nodes ($C_{gd}$) couples them, and the poles then move (next section).`,
          md`It works for any transistor; what matters is how the nodes are coupled.`,
          md`Equal poles are fine; what matters is that no capacitor or resistor couples the nodes backward.`],
        md`In example (2) the two nodes are linked only by $g_mv_X$, a one-way link, so the transfer function factors exactly. A bridging capacitor such as $C_{gd}$ carries current both ways.`),
      Q(md`In a common emitter, the base node has $R_S = 2\,\text{k}\Omega$ to the source and $r_\pi = 2.5\,\text{k}\Omega$. With $C_\pi = 5\,\text{pF}$ (and $C_\mu$ ignored), where is the input pole?`,
        [md`$1.8\times10^8\,\text{rad/s}$: $R = 1.11\,\text{k}\Omega$`, md`$10^8\,\text{rad/s}$: $R = R_S$`, md`$4.4\times10^7\,\text{rad/s}$: $R = R_S + r_\pi$`, md`$8\times10^7\,\text{rad/s}$: $R = r_\pi$`], 0,
        [null, md`The base also has $r_\pi$ to ground through the grounded emitter.`, md`Both go from the base to ground: parallel, not series.`, md`$R_S$ is also a path to ground (to the zeroed source).`],
        md`$R = 2\parallel2.5 = 1.11\,\text{k}\Omega$, $\tau = 5.56\,\text{ns}$, $\omega_p = 1.8\times10^8\,\text{rad/s}$.`),
      P({
        id: 'bk12-node-x1', title: 'Two node poles',
        q: md`Example (2) with $R_S = 20\,\text{k}\Omega$, $C_{in} = 0.2\,\text{pF}$, $g_m = 2\,\text{mS}$, $R_L = 10\,\text{k}\Omega$, $C_L = 1\,\text{pF}$. Find both poles and the dc gain.`,
        fig: M.ex2(),
        parts: [num('\\omega_{p,X}', 2.5e8, 'w', [{ v: 1 / (20e3 * 1e-12), msg: 'Node $X$ carries $C_{in}$, not $C_L$.' }]), num('\\omega_{p,out}', 1e8, 'w'), num('A_v(0)', -20, 'x', [{ v: 20, msg: 'A common source inverts.' }])],
        hints: [md`Node $X$: $R_S$ only (the gate adds nothing).`, md`Output: $R_L$ with $C_L$.`],
        sol: md`$\omega_{p,X} = 1/(20\,\text{k}\Omega\times0.2\,\text{pF}) = 1/4\,\text{ns} = 2.5\times10^8\,\text{rad/s}$. $\omega_{p,out} = 1/(10\,\text{k}\Omega\times1\,\text{pF}) = 10^8\,\text{rad/s}$. $A_v(0) = -g_mR_L = -20$.`,
      }),
      P({
        id: 'bk12-node-x2', title: 'The common-gate input node',
        q: md`Example (3): $R_S = 1\,\text{k}\Omega$, $g_m = 4\,\text{mS}$ ($r_{ds}\to\infty$), $C_{in} = 2\,\text{pF}$ at the source, $R_L = 5\,\text{k}\Omega$, $C_L = 1\,\text{pF}$. Find the input node's resistance, both poles, and the dc gain $v_{out}/v_{in}$.`,
        fig: M.ex3(),
        parts: [BK.res('R_X', 200, undefined, [{ v: 1000, msg: 'The source node also has the transistor: $1/g_m = 250\\,\\Omega$ in parallel.' }, { v: 250, msg: 'That is the transistor alone; $R_S$ is in parallel.' }]),
          num('\\omega_{p,X}', 2.5e9, 'w', [{ v: 5e8, msg: 'Use $R_S\\parallel1/g_m$, not $R_S$.' }]), num('\\omega_{p,out}', 2e8, 'w'),
          num('A_v(0)', 4, 'x', [{ v: 20, msg: 'That is $g_mR_L$. Only $1/(1 + g_mR_S)$ of $v_{in}$ reaches node $X$.' }, { v: -4, msg: 'A common gate does not invert.' }])],
        hints: [md`$R_X = R_S\parallel\tfrac1{g_m}$.`, md`From the KCL above, $v_X = v_{in}/(1 + g_mR_S)$ at dc, and $v_{out} = g_mR_Lv_X$.`],
        sol: md`$R_X = 1\,\text{k}\Omega\parallel250\,\Omega = 200\,\Omega$, $\tau_X = 200\,\Omega\times2\,\text{pF} = 0.4\,\text{ns}$, $\omega_{p,X} = 2.5\times10^9\,\text{rad/s}$. Output: $5\,\text{k}\Omega\times1\,\text{pF} = 5\,\text{ns}$, $\omega_{p,out} = 2\times10^8\,\text{rad/s}$.

Gain: $v_X = v_{in}/(1 + g_mR_S) = v_{in}/5$ and $v_{out} = g_mR_Lv_X = 20v_X$, so $A_v = 4$. The fast input node costs gain: most of $v_{in}$ is dropped across $R_S$. (Exact bandwidth: $1.99\times10^8\,\text{rad/s}$, set by the output node.)`,
      }),
      P({
        id: 'bk12-node-x3', title: 'An emitter-follower output node',
        q: md`An emitter follower: $I_C = 1\,\text{mA}$, $\beta = 100$, $R_S = 10\,\text{k}\Omega$ on the base, $R_L = 1\,\text{k}\Omega$ from the emitter to ground, $C_L = 5\,\text{pF}$ on the output; ignore $C_\pi$, $C_\mu$ and $r_o$. Find the resistance at the output node and its pole.`,
        fig: F.ef({ caps: ['CL'], v: { RS: '10\\kO', RL: '1\\kO', CL: '5\\,\\text{pF}' } }),
        parts: [BK.res('R_{out}', 110.132, undefined, [{ v: 1 / (1 / 1000 + 0.04), msg: 'With $R_S$ on the base, looking into the emitter gives $(r_\\pi + R_S)/(\\beta + 1)$, not just $1/g_m$.' }, { v: 1000, msg: 'The emitter node also has the transistor: small, and it wins in parallel.' }]),
          num('\\omega_p', 1.816e9, 'w')],
        hints: [md`Looking up into the emitter: $\dfrac{r_\pi + R_S}{\beta + 1}$ ([Chapter 8](#/l/bk08-emitter)).`],
        sol: md`$r_\pi = 100/40\,\text{mS} = 2.5\,\text{k}\Omega$. Looking into the emitter: $(2.5 + 10)\,\text{k}\Omega/101 = 123.8\,\Omega$. In parallel with $R_L$: $R_{out} = 1\,\text{k}\Omega\parallel123.8\,\Omega = 110.1\,\Omega$.
$$\omega_p = \frac{1}{110.1\,\Omega\times5\,\text{pF}} = \frac{1}{0.551\,\text{ns}} = 1.82\times10^9\,\text{rad/s}$$
A follower makes a big capacitor harmless by driving it from a small resistance.`,
      }),
      P({
        id: 'bk12-node-x4', title: 'Two poles, the exact $-3$ dB point',
        q: md`A response has two poles from two isolated nodes, at $10^8$ and $10^9\,\text{rad/s}$. Find the exact $-3\,\text{dB}$ frequency. (Set $|1 + j\omega\tau_1|^2|1 + j\omega\tau_2|^2 = 2$ and solve the quadratic in $\omega^2$.)`,
        parts: [num('\\omega_{-3dB}', 9.9024e7, 'w', [{ v: 1e8, msg: 'Close, but the second pole pulls it down a little; solve the quadratic.' }])],
        hints: [md`$(1 + \omega^2\tau_1^2)(1 + \omega^2\tau_2^2) = 2$ with $\tau_1 = 10\,\text{ns}$, $\tau_2 = 1\,\text{ns}$.`, md`With $x = \omega^2$: $\tau_1^2\tau_2^2x^2 + (\tau_1^2 + \tau_2^2)x - 1 = 0$.`],
        sol: md`With $x = \omega^2$: $10^{-34}x^2 + 1.01\times10^{-16}x - 1 = 0$, so
$$x = \frac{-1.01\times10^{-16} + \sqrt{(1.01\times10^{-16})^2 + 4\times10^{-34}}}{2\times10^{-34}} = 9.806\times10^{15},\qquad \omega_{-3dB} = 9.90\times10^7\,\text{rad/s}$$
One percent below the lower pole: with the poles a decade apart, the lower one sets the bandwidth almost alone.`,
      }),
      R(md`### Drill: the pole at a node (MOS and BJT, every kind of node)`),
      G('bk_node_pole', { need: 6 }),
    ],
  });

  // ================================================================ 12.3 the CS/CE stage exactly
  L({
    id: 'bk12-exact', title: 'The CS/CE stage solved exactly', ref: 'Lecture 28 (pages 2–3)',
    steps: [
      R(md`
        ### The question

        Put the transistor's own capacitances into a common source: $C_{gs}$ at the input, $C_{db}$ and $C_L$ at the output, and $C_{gd}$ **between** them. That last one breaks the one-pole-per-node rule, because it connects the two nodes. Lecture 28 solves this circuit honestly. You will rarely redo the algebra on an exam, but you must recognize the answer: which term is the Miller effect, where the zero comes from and why it is in the right half plane, and why the dominant pole is $1/b$.
      `),
      RF(md`
        ### From the circuit to one model

        The common source and the common emitter with their capacitors (Lecture 28, page 2):

        [[fig:a]]

        [[fig:b]]

        Both are the same **two-node model**: an input node $X$ with a capacitance to ground, an output node $Y$ with a capacitance and $R_L$ to ground, one capacitor bridging $X$ and $Y$, and $g_mv_X$ pulled out of $Y$:

        [[fig:c]]

        | Two-node model | Common source | Common emitter |
        |---|---|---|
        | $R_{TH}$ | $R_S$ | $R_S\parallel r_\pi$ |
        | $v_{TH}$ | $v_{in}$ | $v_{in}\dfrac{r_\pi}{R_S + r_\pi}$ |
        | $C_{in}$ | $C_{gs}$ | $C_\pi$ |
        | $C_{xy}$ | $C_{gd}$ | $C_\mu$ |
        | $C_{out}$ | $C_{db} + C_L$ | $C_L$ |
        | $R_L$ | $R_L\parallel r_{ds}$ | $R_L\parallel r_o$ |

        For the common emitter, $v_{in}$, $R_S$ and $r_\pi$ form a divider from the base to ground; Thévenin replaces them by $v_{TH}$ behind $R_{TH}$. Solve the model once and both stages are solved.
      `, { a: { fig: M.csSS(), cap: 'The common source with every capacitor.' }, b: { fig: M.ceSS(), cap: 'The common emitter: the same, plus $r_\\pi$ at the input.' }, c: { fig: M.twoNode(), cap: 'Lecture 28\'s two-node model.' } }),
      R(md`
        ### KCL at the two nodes

        The current through $C_{xy}$ from $Y$ to $X$ is $(v_{out} - v_X)C_{xy}s$.

        **Node $X$:** the current arriving through $C_{xy}$ leaves through $R_{TH}$ (toward the source) and through $C_{in}$:
        $$(v_{out} - v_X)C_{xy}s = \frac{v_X - v_{TH}}{R_{TH}} + v_XC_{in}s$$
        **Node $Y$:** the current arriving through $C_{xy}$ (from $X$) leaves through the transconductor, $C_{out}$ and $R_L$:
        $$(v_X - v_{out})C_{xy}s = g_mv_X + v_{out}C_{out}s + \frac{v_{out}}{R_L}$$

        ### Solve node $Y$ for $v_X$

        Move the $v_X$ terms left and the $v_{out}$ terms right:
        $$v_X(C_{xy}s - g_m) = v_{out}\Big(C_{xy}s + C_{out}s + \frac{1}{R_L}\Big)\quad\Rightarrow\quad v_X = v_{out}\,\frac{C_{xy}s + C_{out}s + 1/R_L}{C_{xy}s - g_m}$$

        ### Substitute into node $X$

        First rearrange node $X$ with $v_{TH}$ alone on the right:
        $$v_{out}C_{xy}s - v_X\Big[C_{xy}s + \frac{1}{R_{TH}} + C_{in}s\Big] = -\frac{v_{TH}}{R_{TH}}$$
        Insert $v_X$ and multiply both sides by $(C_{xy}s - g_m)$:
        $$v_{out}\Big\{C_{xy}s(C_{xy}s - g_m) - \Big(C_{xy}s + C_{out}s + \frac{1}{R_L}\Big)\Big(C_{xy}s + C_{in}s + \frac{1}{R_{TH}}\Big)\Big\} = -\frac{v_{TH}}{R_{TH}}(C_{xy}s - g_m)$$

        ### Multiply out the braces

        The product $(C_{xy} + C_{out})(C_{xy} + C_{in}) = C_{xy}^2 + C_{xy}C_{in} + C_{out}C_{xy} + C_{out}C_{in}$, and its $C_{xy}^2$ cancels the $C_{xy}^2s^2$ of the first term. Collecting by powers of $s$, the braces equal
        $$-\Big[(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out})s^2 + \Big(g_mC_{xy} + \frac{C_{xy} + C_{out}}{R_{TH}} + \frac{C_{xy} + C_{in}}{R_L}\Big)s + \frac{1}{R_LR_{TH}}\Big]$$
        Multiply both sides by $-R_LR_{TH}$: the bracket becomes $as^2 + bs + 1$ and the right side becomes $v_{TH}(C_{xy}s - g_m)R_L$.

        !!key The CS/CE stage, exactly (Lecture 28)
          $$\frac{v_{out}}{v_{TH}} = \frac{(C_{xy}s - g_m)R_L}{as^2 + bs + 1}$$
          $$a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out})$$
          $$b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$$
          Two poles (the roots of $as^2 + bs + 1$, always real for this circuit) and one zero at $\omega_z = g_m/C_{xy}$.
      `),
      R(md`
        ### Check it

        - **$s = 0$:** $\dfrac{v_{out}}{v_{TH}} = -g_mR_L$, the familiar gain ([Chapter 4](#/l/bk04-cs)). ✓
        - **$C_{xy} = 0$** (no bridge): $a = R_{TH}R_LC_{in}C_{out}$ and $b = R_{TH}C_{in} + R_LC_{out}$, so $as^2 + bs + 1 = (1 + sR_{TH}C_{in})(1 + sR_LC_{out})$: one pole per node, as in the last section. ✓
        - **$s\to\infty$:** the capacitors short everything, the numerator grows like $s$ and the denominator like $s^2$: $H\to0$. ✓
        - **Units:** every term of $b$ is ohms times farads (seconds); $a$ is $\Omega^2\text{F}^2 = \text{s}^2$. ✓

        ### The zero: a current that cancels, in the right half plane

        The numerator vanishes at $C_{xy}s = g_m$. Physically: the input pushes current **forward** through $C_{xy}$ into node $Y$ (in phase with $v_X$, positive), while the transistor pulls $g_mv_X$ **out** of $Y$ (inverted). At $s = g_m/C_{xy}$ they are equal, nothing is left over for $R_L$, and the output is zero.

        Write the numerator as $-g_mR_L\big(1 - s/\omega_z\big)$ with $\omega_z = g_m/C_{xy}$: the zero sits at **positive** $s$, a right-half-plane zero. Its magnitude rises like an ordinary zero but its phase falls like a pole ([Chapter 11](#/l/bk11-zero)). Because $C_{xy}$ is tiny and $g_m$ is large, it is usually far above both poles.

        ### The poles: where the dominant-pole approximation comes from

        Any two-pole denominator can be written with its poles showing:
        $$as^2 + bs + 1 = \Big(1 + \frac{s}{\omega_{p1}}\Big)\Big(1 + \frac{s}{\omega_{p2}}\Big) = \frac{s^2}{\omega_{p1}\omega_{p2}} + \Big(\frac{1}{\omega_{p1}} + \frac{1}{\omega_{p2}}\Big)s + 1$$
        Matching coefficients: $b = \dfrac{1}{\omega_{p1}} + \dfrac{1}{\omega_{p2}}$ and $a = \dfrac{1}{\omega_{p1}\omega_{p2}}$. Now suppose $\omega_{p2}\gg\omega_{p1}$: the first pole **dominates** the response. Then $1/\omega_{p2}$ is negligible next to $1/\omega_{p1}$, so

        !!key The dominant-pole approximation
          $$\omega_{p1}\approx\frac{1}{b} = \frac{1}{(1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})},\qquad \omega_{p2} = \frac{1}{a\,\omega_{p1}}\approx\frac{b}{a}$$
          Good when the two poles are far apart; the error in each is roughly the ratio $\omega_{p1}/\omega_{p2}$.

        **Read $b$ term by term**; you will meet these three again in Chapter 13:
        - $R_{TH}C_{in}$: the input capacitor charged through the input resistance;
        - $R_L(C_{xy} + C_{out})$: the output capacitors charged through the output resistance;
        - $(1 + g_mR_L)C_{xy}R_{TH}$: the bridging capacitor, seen from the input, **multiplied by one plus the gain**. That is the Miller effect, and it is usually the biggest term.
      `),
      RF(md`
        ### Worked example: the running common source

        $g_m = 5\,\text{mS}$, $R_S = 4\,\text{k}\Omega$, $R_L = 8\,\text{k}\Omega$ ($r_{ds}\to\infty$), $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $C_{out} = C_{db} + C_L = 300\,\text{fF}$. We will use this circuit for the rest of the chapter.

        1. Map it: $R_{TH} = 4\,\text{k}\Omega$, $C_{in} = 200\,\text{fF}$, $C_{xy} = 25\,\text{fF}$, $C_{out} = 300\,\text{fF}$, $g_mR_L = 40$, $A_v(0) = -40$.
        2. $b$ term by term: Miller $41\times25\,\text{fF}\times4\,\text{k}\Omega = 4.1\,\text{ns}$; input $4\,\text{k}\Omega\times200\,\text{fF} = 0.8\,\text{ns}$; output $8\,\text{k}\Omega\times325\,\text{fF} = 2.6\,\text{ns}$. Total $b = 7.5\,\text{ns}$.
        3. $a = 4\,\text{k}\Omega\times8\,\text{k}\Omega\times(200\cdot25 + 300\cdot25 + 200\cdot300)\,\text{fF}^2 = 3.2\times10^7\times7.25\times10^{-26} = 2.32\times10^{-18}\,\text{s}^2$.
        4. Estimates: $\omega_{p1}\approx1/b = 1.33\times10^8\,\text{rad/s}$, $\omega_{p2}\approx b/a = 3.23\times10^9\,\text{rad/s}$.
        5. Exact roots of $as^2 + bs + 1$: $\omega_{p1} = ${f(RUN.r1 / 1e8, 4)}\times10^8$ and $\omega_{p2} = ${f(RUN.r2 / 1e9, 4)}\times10^9\,\text{rad/s}$. The poles are 22 times apart; the estimates are 4% off.
        6. Zero: $\omega_z = 5\,\text{mS}/25\,\text{fF} = 2\times10^{11}\,\text{rad/s}$, far above.

        The smallest capacitor, $C_{gd} = 25\,\text{fF}$, makes the biggest term of $b$ (55%). Here is the whole response, exact curve with the straight-line asymptotes:

        [[fig:bode]]

        The exact $-3\,\text{dB}$ frequency is $1.39\times10^8\,\text{rad/s}$ ($22.1\,\text{MHz}$), practically $\omega_{p1}$.
      `, { bode: { fig: E3Bode.svg({ k: -40, poles: [RUN.r1, RUN.r2], rhp: [RUN.wz] }, { show: 'both', wmin: 1e6, wmax: 1e13, w: 460 }), cap: 'The running common source: $-40$ ($32\\,\\text{dB}$), poles at $1.39\\times10^8$ and $3.09\\times10^9$, right-half-plane zero at $2\\times10^{11}\\,\\text{rad/s}$. The zero flattens the magnitude but keeps pulling the phase down.' } }),
      RF(md`
        ### What $C_{gd}$ does to the poles: pole splitting

        Watch the exact poles of the running example as $C_{gd}$ grows from $0$:

        [[fig:s]]

        With $C_{gd} = 0$ the two nodes are independent: $1/(R_SC_{gs}) = 1.25\times10^9$ and $1/(R_LC_{out}) = 4.2\times10^8\,\text{rad/s}$. A few femtofarads of $C_{gd}$ push them **apart**: the lower pole drops (the Miller term grows $b$) and the upper one rises. This "pole splitting" is why one pole usually dominates a CS or CE stage, and why the approximation $\omega_{p1}\approx1/b$ is so often good.

        ### The common emitter in numbers

        $I_C = 0.5\,\text{mA}$ ($g_m = 20\,\text{mS}$), $\beta = 100$ ($r_\pi = 5\,\text{k}\Omega$), $R_S = 5\,\text{k}\Omega$, $R_L = 5\,\text{k}\Omega$, $C_\pi = 4\,\text{pF}$, $C_\mu = 0.2\,\text{pF}$, $C_L = 1\,\text{pF}$.
        1. Thévenin at the base: $R_{TH} = 5\parallel5 = 2.5\,\text{k}\Omega$, $v_{TH} = v_{in}/2$. $g_mR_L = 100$, so $A_v(0) = -100\times\tfrac12 = -50$.
        2. $b = 101\times0.2\,\text{pF}\times2.5\,\text{k}\Omega + 2.5\,\text{k}\Omega\times4\,\text{pF} + 5\,\text{k}\Omega\times1.2\,\text{pF} = 50.5 + 10 + 6 = 66.5\,\text{ns}$.
        3. $\omega_{p1}\approx1/b = 1.50\times10^7\,\text{rad/s}$ (exact $${f(CE1.r1 / 1e7, 4)}\times10^7$); $a = 6.25\times10^{-17}\,\text{s}^2$, $\omega_{p2}\approx b/a = 1.06\times10^9$ (exact $${f(CE1.r2 / 1e9, 4)}\times10^9$); $\omega_z = g_m/C_\mu = 10^{11}\,\text{rad/s}$.

        Again the $0.2\,\text{pF}$ $C_\mu$ makes 76% of $b$.

        ### What it means

        - The bridging capacitor is the troublemaker: it is multiplied by the gain. Bigger gain, slower amplifier.
        - The exact answer has two poles and a right-half-plane zero; for most numbers, one pole (at about $1/b$) is all you need.
        - $b$ is a sum of resistance-times-capacitance terms, one per capacitor. Chapter 13 shows that this is always true, and how to read each resistance off the circuit without any algebra.

        !!mistake Common mistakes
          - Writing $g_mR_L$ instead of $1 + g_mR_L$ in the Miller term.
          - Using $R_S$ for $R_{TH}$ in a common emitter (it is $R_S\parallel r_\pi$), or forgetting that $v_{TH}$ is only part of $v_{in}$.
          - Putting the zero in the left half plane. The numerator is $C_{xy}s - g_m$: it vanishes at **positive** $s$.
          - Taking $\omega_{p2}\approx1/a$. It is $b/a$ (from $a = 1/(\omega_{p1}\omega_{p2})$ with $\omega_{p1}\approx1/b$).
      `, { s: { fig: splitPlot, cap: 'Exact poles of the running common source against $C_{gd}$: they split apart as $C_{gd}$ grows.' } }),
      Q(md`In $b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$, which term is the Miller effect, and why is it usually the biggest?`,
        [md`$(1 + g_mR_L)C_{xy}R_{TH}$: the bridging capacitor seen from the input is multiplied by one plus the gain`,
          md`$R_{TH}C_{in}$: the input capacitor is the biggest capacitor`,
          md`$R_L(C_{xy} + C_{out})$: the output resistance is the biggest resistance`,
          md`None: Miller is a separate approximation, not part of the exact answer`], 0,
        [null, md`$C_{in}$ is big, but it is not multiplied by anything.`, md`That is the output node's own time constant.`, md`The exact $b$ contains it: Miller's theorem (next section) just isolates this term.`],
        md`$C_{xy}$ is small, but $1 + g_mR_L$ is typically 20 to 100, so the product usually beats the other two terms.`),
      Q(md`Why is the zero of the CS stage in the right half plane?`,
        [md`The current fed forward through $C_{xy}$ has the opposite sign to the inverted current $g_mv_X$; they cancel at a positive $s = g_m/C_{xy}$`,
          md`Because $C_{xy}$ is a negative capacitance`,
          md`Because the poles are real`,
          md`It is in the left half plane; the minus sign is a typo`], 0,
        [null, md`$C_{xy}$ is an ordinary positive capacitor.`, md`Real poles say nothing about where the zero is.`, md`The numerator is $C_{xy}s - g_m$, which vanishes at $s = +g_m/C_{xy}$.`],
        md`$(C_{xy}s - g_m)R_L = -g_mR_L(1 - s/\omega_z)$: a zero at $+\omega_z$. Feed-forward through a capacitor around an **inverting** stage always gives a right-half-plane zero.`),
      Q(md`Set $C_{xy} = 0$ in the exact result. What do you get?`,
        [md`$\dfrac{-g_mR_L}{(1 + sR_{TH}C_{in})(1 + sR_LC_{out})}$: one pole per node`,
          md`A single pole at $1/(R_{TH}C_{in} + R_LC_{out})$`,
          md`No poles at all`,
          md`The same two poles: $C_{xy}$ only moves the zero`], 0,
        [null, md`That is $1/b$, only an estimate; with $C_{xy} = 0$ the quadratic factors exactly.`, md`$C_{in}$ and $C_{out}$ remain, and each node gives its pole.`, md`$C_{xy}$ moves the poles a lot: it splits them apart.`],
        md`$a = R_{TH}R_LC_{in}C_{out}$ and $b = R_{TH}C_{in} + R_LC_{out}$ factor into $(1 + sR_{TH}C_{in})(1 + sR_LC_{out})$, and the zero goes to infinity.`),
      P({
        id: 'bk12-exact-x1', title: 'Exact versus dominant pole',
        q: md`Common source: $g_m = 4\,\text{mS}$, $R_S = 5\,\text{k}\Omega$, $R_L = 5\,\text{k}\Omega$ ($r_{ds}\to\infty$), $C_{gs} = 100\,\text{fF}$, $C_{gd} = 10\,\text{fF}$, $C_{out} = 100\,\text{fF}$. Find $b$, $a$, the two dominant-pole estimates and the zero.`,
        fig: F.cs({ v: { RS: '5\\kO', RL: '5\\kO', Cgs: '100\\,\\text{fF}', Cgd: '10\\,\\text{fF}', CL: '100\\,\\text{fF}' } }),
        parts: [num('b', 2.1e-9, 't', [{ v: 10e-15 * 5e3 + 0.5e-9 + 0.55e-9, msg: 'The $C_{gd}R_S$ term carries $1 + g_mR_L = 21$.' }]), { lbl: 'a\\ \\text{in units of}\\ 10^{-18}\\,\\text{s}^2', ans: 0.3 },
          num('\\omega_{p1}\\approx1/b', 1 / 2.1e-9, 'w', [], [5.1392e8]), num('\\omega_{p2}\\approx b/a', 7e9, 'w', [], [6.4861e9]), num('\\omega_z', 4e11, 'w')],
        hints: [md`$g_mR_L = 20$.`, md`$a = R_SR_L(C_{gs}C_{gd} + C_{out}C_{gd} + C_{gs}C_{out})$; enter it in units of $10^{-18}\,\text{s}^2$.`],
        sol: md`$g_mR_L = 20$.
$$b = 21\times10\,\text{fF}\times5\,\text{k}\Omega + 5\,\text{k}\Omega\times100\,\text{fF} + 5\,\text{k}\Omega\times110\,\text{fF} = 1.05 + 0.5 + 0.55 = 2.1\,\text{ns}$$
$$a = 25\times10^6\times(1000 + 1000 + 10000)\times10^{-30} = 3\times10^{-19}\,\text{s}^2$$
$\omega_{p1}\approx1/b = 4.76\times10^8$, $\omega_{p2}\approx b/a = 7.0\times10^9\,\text{rad/s}$. Exact roots: $5.14\times10^8$ and $6.49\times10^9$: the poles are only 13 times apart, so the estimates are 7–8% off. $\omega_z = 4\,\text{mS}/10\,\text{fF} = 4\times10^{11}\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk12-exact-x2', title: 'Write $b$ from memory',
        q: md`For a common source with source resistance $R_S$, load $R_L$, and capacitances $C_{gs}$, $C_{gd}$, $C_{out}$, write the coefficient $b$ of $s$ in the denominator.`,
        parts: [BK.ex('(1 + gm*RL)*Cgd*RS + RS*Cgs + RL*(Cgd + Cout)', ['gm', 'RS', 'RL', 'Cgs', 'Cgd', 'Cout'], 'b', { exact: true })],
        hints: [md`Three terms: the input node, the output node, and the bridge seen from the input with $1 + g_mR_L$.`],
        sol: md`$$b = (1 + g_mR_L)C_{gd}R_S + R_SC_{gs} + R_L(C_{gd} + C_{out})$$`,
      }),
      P({
        id: 'bk12-exact-x3', title: 'A common emitter, exactly',
        q: md`Common emitter: $I_C = 0.25\,\text{mA}$, $\beta = 100$, $r_o\to\infty$, $R_S = 10\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$, $C_\pi = 2\,\text{pF}$, $C_\mu = 0.1\,\text{pF}$, $C_L = 1\,\text{pF}$. Find $R_{TH}$, the dc gain $v_{out}/v_{in}$, $b$, and the dominant-pole estimate.`,
        fig: F.ce({ v: { RS: '10\\kO', RL: '10\\kO', Cpi: '2\\,\\text{pF}', Cmu: '0.1\\,\\text{pF}', CL: '1\\,\\text{pF}' } }),
        parts: [BK.res('R_{TH}', 5e3, undefined, [{ v: 10e3, msg: '$r_\\pi = \\beta/g_m = 10\\,\\text{k}\\Omega$ also goes from the base to ground: $R_{TH} = R_S\\parallel r_\\pi$.' }]),
          num('A_v(0)', -50, 'x', [{ v: -100, msg: 'That is $v_{out}/v_{TH}$. Only half of $v_{in}$ reaches the base: $v_{TH} = v_{in}r_\\pi/(R_S + r_\\pi)$.' }]),
          num('b', 71.5e-9, 't', [{ v: 0.1e-12 * 5e3 + 10e-9 + 11e-9, msg: 'The $C_\\mu$ term is multiplied by $1 + g_mR_L = 101$.' }, { v: 101 * 0.1e-12 * 10e3 + 20e-9 + 11e-9, msg: 'Use $R_{TH} = R_S\\parallel r_\\pi$ in both input terms.' }]),
          num('\\omega_{p1}\\approx1/b', 1 / 71.5e-9, 'w', [], [1.4316e7])],
        hints: [md`$g_m = 10\,\text{mS}$, $r_\pi = 10\,\text{k}\Omega$, $g_mR_L = 100$.`],
        sol: md`$g_m = 0.25\,\text{mA}/25\,\text{mV} = 10\,\text{mS}$, $r_\pi = 10\,\text{k}\Omega$. Thévenin at the base: $R_{TH} = 10\parallel10 = 5\,\text{k}\Omega$, $v_{TH} = v_{in}/2$. $g_mR_L = 100$, so $A_v(0) = -100\times\tfrac12 = -50$.
$$b = 101\times0.1\,\text{pF}\times5\,\text{k}\Omega + 5\,\text{k}\Omega\times2\,\text{pF} + 10\,\text{k}\Omega\times1.1\,\text{pF} = 50.5 + 10 + 11 = 71.5\,\text{ns}$$
$\omega_{p1}\approx1/b = 1.40\times10^7\,\text{rad/s}$ (exact root $1.43\times10^7$; $f\approx2.2\,\text{MHz}$).`,
      }),
      P({
        id: 'bk12-exact-x4', title: 'Double $C_{gd}$',
        q: md`In the running example ($g_m = 5\,\text{mS}$, $R_S = 4\,\text{k}\Omega$, $R_L = 8\,\text{k}\Omega$, $C_{gs} = 200\,\text{fF}$, $C_{out} = 300\,\text{fF}$), $C_{gd}$ doubles from $25$ to $50\,\text{fF}$. Find the new $b$ and the new dominant-pole estimate. What happens to the second pole?`,
        parts: [num('b', 11.8e-9, 't'), num('\\omega_{p1}\\approx1/b', 1 / 11.8e-9, 'w', [], [8.6469e7]),
          { lbl: 'The second pole...', mc: ['moves up (the poles split further)', 'moves down with the first', 'does not move'], a: 0, why: [null, 'The product of the poles is $1/a$, and $a$ grows much less than $b$: the second pole must rise.', 'Both $a$ and $b$ depend on $C_{gd}$; the exact upper pole goes from $3.09$ to $4.25\\times10^9\\,\\text{rad/s}$.'] }],
        hints: [md`Only the Miller term and the output term contain $C_{gd}$.`],
        sol: md`Miller: $41\times50\,\text{fF}\times4\,\text{k}\Omega = 8.2\,\text{ns}$; input: $0.8\,\text{ns}$; output: $8\,\text{k}\Omega\times350\,\text{fF} = 2.8\,\text{ns}$. $b = 11.8\,\text{ns}$, $\omega_{p1}\approx8.47\times10^7\,\text{rad/s}$ (exact $8.65\times10^7$), down from $1.33\times10^8$. The upper pole rises from $3.09$ to $4.25\times10^9\,\text{rad/s}$: pole splitting.`,
      }),
      P({
        id: 'bk12-exact-x5', title: 'Exam level: the full two-node solution',
        q: md`A common source has $R_S = 10\,\text{k}\Omega$, $g_m = 2\,\text{mS}$, $R_L = 10\,\text{k}\Omega$ ($r_{ds}\to\infty$), $C_{gs} = 100\,\text{fF}$, $C_{gd} = 20\,\text{fF}$, $C_{out} = 100\,\text{fF}$. (a) the dc gain; (b) $b$ and $a$; (c) the exact poles from the quadratic formula; (d) the zero; (e) is the dominant-pole approximation good here?`,
        fig: F.cs({ v: { RS: '10\\kO', RL: '10\\kO', Cgs: '100\\,\\text{fF}', Cgd: '20\\,\\text{fF}', CL: '100\\,\\text{fF}' } }),
        parts: [num('A_v(0)', -20, 'x'), num('b', 6.4e-9, 't'), { lbl: 'a\\ \\text{in units of}\\ 10^{-18}\\,\\text{s}^2', ans: 1.4 },
          num('\\omega_{p1}', tn(10e3, 10e3, 100e-15, 20e-15, 100e-15, 2e-3).r1, 'w', [{ v: 1 / 7.4e-9, msg: 'That is the estimate $1/b$; solve the quadratic for the exact root.' }]),
          num('\\omega_{p2}', tn(10e3, 10e3, 100e-15, 20e-15, 100e-15, 2e-3).r2, 'w'),
          num('\\omega_z', 1e11, 'w'),
          { lbl: '(e) Is $1/b$ a good estimate of $\\omega_{p1}$ here?', mc: ['Yes, within about 4%: the poles are about 27 times apart', 'No: the poles are close together', 'Only if the zero is ignored'], a: 0, why: [null, 'They are $1.62\\times10^8$ and $4.41\\times10^9$: well separated.', 'The zero is far above both poles and does not enter the estimate.'] }],
        hints: [md`$g_mR_L = 20$, so the Miller term is $21\times20\,\text{fF}\times10\,\text{k}\Omega$.`, md`$s = \dfrac{-b\pm\sqrt{b^2 - 4a}}{2a}$; the pole frequencies are the magnitudes.`],
        sol: md`(a) $A_v = -g_mR_L = -20$.

(b) $b = 21\times20\,\text{fF}\times10\,\text{k}\Omega + 10\,\text{k}\Omega\times100\,\text{fF} + 10\,\text{k}\Omega\times120\,\text{fF} = 4.2 + 1 + 1.2 = 6.4\,\text{ns}$; $a = 10^8\times(2000 + 2000 + 10000)\times10^{-30} = 1.4\times10^{-18}\,\text{s}^2$.

(c) $\sqrt{b^2 - 4a} = \sqrt{4.096\times10^{-17} - 5.6\times10^{-18}} = 5.946\times10^{-9}$. The roots are $(b\mp\sqrt{\cdot})/(2a)$ in magnitude: $\omega_{p1} = ${f(tn(10e3, 10e3, 100e-15, 20e-15, 100e-15, 2e-3).r1 / 1e8, 4)}\times10^8$ and $\omega_{p2} = ${f(tn(10e3, 10e3, 100e-15, 20e-15, 100e-15, 2e-3).r2 / 1e9, 4)}\times10^9\,\text{rad/s}$.

(d) $\omega_z = g_m/C_{gd} = 2\,\text{mS}/20\,\text{fF} = 10^{11}\,\text{rad/s}$ (right half plane).

(e) $1/b = 1.56\times10^8$ against the exact $1.62\times10^8$: 3.5% low. Good, because the poles are about 27 times apart.`,
      }),
      R(md`### Drill: the exact two-node solution`),
      G('bk_cs_exact', { need: 3 }),
    ],
  });

  // ================================================================ 12.4 Miller's theorem
  L({
    id: 'bk12-miller', title: "Miller's theorem", ref: 'Lecture 28 (pages 5–6)',
    steps: [
      R(md`
        ### The question

        Section 12.3 needed a page of algebra for one bridging capacitor. Miller's theorem gets the most important part of the answer in one line: it replaces a capacitor **between** two nodes by two capacitors **to ground**, and then one pole per node works again. Exam 3 expects you to use it on CS and CE stages, and to know when it fails.

        ### The physical picture: a see-saw

        Connect a capacitor $C_F$ from the input to the output of an inverting amplifier with gain $-A_0$. Raise the input by $1\,\text{mV}$: the far plate **drops** by $A_0\,\text{mV}$. The capacitor sees $(1 + A_0)\,\text{mV}$ across it, so it pulls $(1 + A_0)$ times the current it would pull if its far end sat still at ground. From the input it looks like a capacitor $(1 + A_0)$ times bigger.

        Now let the far end **follow** the input instead (a follower, gain just under $+1$). The capacitor barely sees any change across it, draws almost no current, and from the input it nearly disappears. Same capacitor, opposite verdicts: what matters is how its far end moves.
      `),
      RF(md`
        ### The derivation (Lecture 28)

        An impedance $Z_F$ connects node 1 and node 2, and the circuit sets $v_2 = A_vv_1$. We want two impedances to ground, $Z_1$ at node 1 and $Z_2$ at node 2, that leave every node voltage unchanged:

        [[fig:z]]

        The rule: **each replacement must draw the same current from its node as $Z_F$ did.**

        **Node 1.** $Z_F$ draws $(v_1 - v_2)/Z_F$ out of node 1; $Z_1$ would draw $v_1/Z_1$:
        $$\frac{v_1 - v_2}{Z_F} = \frac{v_1}{Z_1}\quad\Rightarrow\quad Z_1 = Z_F\frac{v_1}{v_1 - v_2} = \frac{Z_F}{1 - v_2/v_1} = \frac{Z_F}{1 - A_v}$$
        **Node 2.** $Z_F$ delivers $(v_1 - v_2)/Z_F$ into node 2, which is the same as drawing $(v_2 - v_1)/Z_F$; $Z_2$ would draw $v_2/Z_2$:
        $$\frac{v_1 - v_2}{Z_F} = \frac{0 - v_2}{Z_2}\quad\Rightarrow\quad Z_2 = Z_F\frac{-v_2}{v_1 - v_2} = \frac{Z_F}{1 - v_1/v_2} = \frac{Z_F}{1 - 1/A_v}$$
        **For a capacitor**, $Z_F = 1/(sC_F)$, and dividing an impedance by a number multiplies the capacitance by it:

        !!key Miller's theorem
          $$Z_1 = \frac{Z_F}{1 - A_v},\qquad Z_2 = \frac{Z_F}{1 - 1/A_v},\qquad A_v = \frac{v_2}{v_1}$$
          $$C_1 = (1 - A_v)\,C_F,\qquad C_2 = \Big(1 - \frac{1}{A_v}\Big)C_F$$
      `, { z: { fig: M.millerZ(), cap: 'Miller\'s theorem: an impedance between two nodes, and two impedances to ground that draw the same currents.' } }),
      RF(md`
        ### The case that matters: an inverting amplifier

        With $A_v = -A_0$ (Lecture 28's example):
        $$C_1 = (1 + A_0)C_F,\qquad C_2 = \Big(1 + \frac{1}{A_0}\Big)C_F\approx C_F\quad(A_0\gg1)$$

        [[fig:a]]

        [[fig:b]]

        In the notes' words: *a capacitor connected between the input and output of an inverting amplifier with a gain of $A_0$ raises the input capacitance by $(1 + A_0)$.* At the output it is just about $C_F$, because there the input hardly moves compared with the output.

        ### The gain decides everything

        | Gain $A_v$ from node 1 to node 2 | Input sees $(1 - A_v)C_F$ | Where you meet it |
        |---|---|---|
        | $-A_0$, large | $(1 + A_0)C_F$: huge | $C_{gd}$ of a common source, $C_\mu$ of a common emitter |
        | about $-1$ | about $2C_F$ | $C_{gd1}$ of a cascode |
        | $0$ (node 2 held) | $C_F$ | a capacitor to a held node: $C_{gd}$ of a common gate |
        | about $+0.9$ | about $0.1\,C_F$ | $C_{gs}$ of a source follower, $C_\pi$ of an emitter follower |
        | $+2$ | $-C_F$ | a negative capacitance: positive gain above 1 (used on purpose in some circuits) |
      `, { a: { fig: M.millerA(), cap: 'Before: $C_F$ bridges an inverting amplifier.' }, b: { fig: M.millerB(), cap: 'After: two capacitors to ground (Lecture 28, page 6).' } }),
      R(md`
        ### It works for resistors too

        Nothing above was special to capacitors. A resistor $R_F$ across an inverting gain $-A_0$ looks like $R_F/(1 + A_0)$ from the input: that is why the input of an inverting op-amp stage is a "virtual ground". And a resistor across a follower is **bootstrapped**: a $1\,\text{M}\Omega$ bias resistor whose far end follows the input with gain $0.99$ looks like $1\,\text{M}\Omega/(1 - 0.99) = 100\,\text{M}\Omega$, a trick The Art of Electronics uses to keep bias networks from loading a signal.

        ### When is it valid?

        The theorem itself is **exact**: it is only a statement about currents. The catch is the number you put in for $A_v$. It must be the true ratio $v_2/v_1$ **with $Z_F$ connected, at the frequency you care about**. In practice we plug in the low-frequency gain, $-g_mR_L$, and that is an approximation (the **Miller approximation**):
        - The true gain from the gate to the drain is $A(s) = -\dfrac{(g_m - sC_{xy})R_L}{1 + sR_L(C_{xy} + C_{out})}$: it falls and turns as the output node's own pole approaches. In the running common source at $\omega = 1.39\times10^8\,\text{rad/s}$, $|A| = 37.6$ at $160°$, not $40$ at $180°$.
        - So Miller's input pole is good when the input node is clearly the **slowest** node (the output pole far above it, so $A\approx-g_mR_L$ there). It is optimistic when the output node is slow too.
        - It loses the zero, and its output-side $C_2$ is rough.

        ### Check it

        - $A_v = 0$: node 2 does not move, so $C_1 = C_F$: a capacitor to a still node is a capacitor to ground. ✓
        - $A_v = 1$: both ends move together, no current: $C_1 = 0$. ✓
        - $A_v\to-\infty$: $C_1\to\infty$: node 1 is a virtual ground. ✓

        ### What it means

        The capacitance a node sees is not a property of the capacitor alone; it is the capacitor times how hard its other end pushes back. Gain across a capacitor is expensive when it inverts, and free when it follows.

        ### Worked example

        $C_F = 50\,\text{fF}$ across a gain of $-19$: $C_1 = (1 + 19)\times50 = 1000\,\text{fF} = 1\,\text{pF}$ and $C_2 = (1 + \tfrac{1}{19})\times50 = 52.6\,\text{fF}$. A capacitor you could barely measure loads the input like a picofarad.

        !!mistake Common mistakes
          - Using $A_0C_F$ instead of $(1 + A_0)C_F$.
          - Sign errors: for an **inverting** gain $1 - A_v = 1 + A_0$; for a follower $1 - A_v$ is small.
          - Using Miller's output-side $C_2$ as if it were as reliable as $C_1$.
          - Applying Miller with the gain of the whole amplifier when the capacitor only spans part of it (the cascode: $C_{gd1}$ spans gate to node $X$, gain about $-1$).
      `),
      Q(md`A $50\,\text{fF}$ capacitor connects the input and output of an amplifier with gain $-19$. What capacitance does the input see?`,
        [md`$1\,\text{pF}$`, md`$950\,\text{fF}$`, md`$50\,\text{fF}$`, md`$-900\,\text{fF}$`], 0,
        [null, md`That is $A_0C_F$. The factor is $1 + A_0 = 20$.`, md`That ignores the voltage swing across the capacitor.`, md`With an inverting gain, $1 - A_v = 1 + 19$: positive.`],
        md`$(1 + 19)\times50\,\text{fF} = 1\,\text{pF}$.`),
      Q(md`A capacitor connects the input and output of a follower with gain $+0.95$. From the input it looks like...`,
        [md`$0.05\,C$: almost nothing`, md`$1.95\,C$`, md`$C$`, md`$20\,C$`], 0,
        [null, md`That would be a gain of $-0.95$.`, md`Only if the output stood still.`, md`That would be an inverting gain of $-19$.`],
        md`$(1 - 0.95)C = 0.05\,C$. The far end follows, so the capacitor barely charges: it is **bootstrapped**.`),
      Q(md`Why is Miller's input pole only an approximation, although the theorem is exact?`,
        [md`Because we use the low-frequency gain, while the true gain across the capacitor falls and turns at high frequency`,
          md`Because the theorem only holds for resistors`, md`Because it ignores $C_{gs}$`, md`Because it assumes $C_{gd}$ is large`], 0,
        [null, md`It holds for any impedance.`, md`$C_{gs}$ is kept: it adds to $C_1$ at the input.`, md`No such assumption: the size of $C_{gd}$ does not enter the theorem.`],
        md`$Z_1 = Z_F/(1 - A_v)$ is exact for the true $A_v(j\omega)$. Using $-g_mR_L$ instead is the approximation, and it is good only while the output node's pole is far above the frequency of interest.`),
      P({
        id: 'bk12-miller-x1', title: 'A capacitor across an inverting gain',
        q: md`$C_F = 20\,\text{fF}$ connects the input and output of an amplifier with gain $-49$. Find the capacitances Miller puts at the input and at the output.`,
        fig: M.millerA({ gain: '-49' }),
        parts: [num('C_1', 1e-12, 'C', [{ v: 49 * 20e-15, msg: 'The factor is $1 + 49 = 50$.' }]), num('C_2', (1 + 1 / 49) * 20e-15, 'C')],
        hints: [md`$C_1 = (1 - A_v)C_F$, $C_2 = (1 - 1/A_v)C_F$, $A_v = -49$.`],
        sol: md`$C_1 = 50\times20\,\text{fF} = 1\,\text{pF}$; $C_2 = (1 + 1/49)\times20\,\text{fF} = 20.4\,\text{fF}$.`,
      }),
      P({
        id: 'bk12-miller-x2', title: 'A bootstrapped bias resistor',
        q: md`A $1\,\text{M}\Omega$ resistor runs from the input of a follower (gain $+0.98$) to its output. What resistance does the input see through it?`,
        parts: [BK.res('R_1', 50e6, undefined, [{ v: 1e6 / 1.98, msg: 'The gain is positive: $1 - A_v = 0.02$.' }, { v: 1e6, msg: 'The far end follows, so the resistor carries only 2% of the current a grounded one would.' }])],
        hints: [md`$Z_1 = Z_F/(1 - A_v)$.`],
        sol: md`$R_1 = \dfrac{1\,\text{M}\Omega}{1 - 0.98} = 50\,\text{M}\Omega$. Bootstrapping multiplies a resistor's apparent size by $1/(1 - A_v)$.`,
      }),
      P({
        id: 'bk12-miller-x3', title: 'A virtual ground',
        q: md`A $200\,\text{k}\Omega$ feedback resistor connects the input and output of an inverting amplifier with gain $-199$. What resistance does the input see through it?`,
        parts: [BK.res('R_1', 1e3, undefined, [{ v: 200e3 / 199, msg: 'The factor is $1 + 199 = 200$.' }])],
        hints: [md`$Z_1 = Z_F/(1 + A_0)$.`],
        sol: md`$R_1 = 200\,\text{k}\Omega/200 = 1\,\text{k}\Omega$: the input node is held almost still, a near "virtual ground".`,
      }),
      P({
        id: 'bk12-miller-x4', title: 'Read the gain from a measurement',
        q: md`You measure $410\,\text{fF}$ at the input of an inverting stage whose only input capacitance is a $10\,\text{fF}$ capacitor from input to output. What is the stage's gain magnitude?`,
        parts: [num('A_0', 40, 'x', [{ v: 41, msg: '$410/10 = 41 = 1 + A_0$.' }])],
        hints: [md`$C_1 = (1 + A_0)C_F$.`],
        sol: md`$1 + A_0 = 410/10 = 41$, so $A_0 = 40$.`,
      }),
      R(md`### Drill: Miller's theorem`),
      G('bk_miller', { need: 4 }),
    ],
  });

  // ================================================================ 12.5 CS and CE with Miller
  L({
    id: 'bk12-millercs', title: 'The CS/CE stage with Miller', ref: 'Lecture 28 (page 6)',
    steps: [
      RF(md`
        ### The question

        This is the frequency-response calculation you are most likely to do on the exam: a common source or common emitter, its two poles, and its bandwidth. With Miller it becomes two "one pole per node" calculations. Then the real question: how close is it to the exact answer of section 12.3, and when should you trust it?

        ### Miller on the common source (Lecture 28's simplified CS response)

        $C_{gd}$ bridges the gate and the drain, and the gain between them is $A_v = -g_mR_L$ (with $R_L$ meaning everything on the drain, $R_L\parallel r_{ds}$). Split it:
        $$C_1 = (1 + g_mR_L)C_{gd}\ \text{(gate to ground)},\qquad C_2 = \Big(1 + \frac{1}{g_mR_L}\Big)C_{gd}\ \text{(drain to ground)}$$

        [[fig:a]]

        [[fig:b]]

        Now every capacitor goes to ground and each node is $1/(RC)$:

        !!key CS and CE poles with Miller
          $$\omega_{p,in} = \frac{1}{R_S\big[C_{gs} + (1 + g_mR_L)C_{gd}\big]},\qquad \omega_{p,out} = \frac{1}{R_L\big[C_L + (1 + \tfrac{1}{g_mR_L})C_{gd}\big]}$$
          Common emitter: $R_S\to R_S\parallel r_\pi$ at the input, $C_{gs}\to C_\pi$, $C_{gd}\to C_\mu$.

        For the common emitter the base node also has $r_\pi$ to ground, so the input node's resistance is $R_S\parallel r_\pi$ (the same $R_{TH}$ as in section 12.3); $v_{in}$ reaching the base is divided by $r_\pi/(R_S + r_\pi)$, which changes the gain but not the poles.
      `, { a: { fig: F.cs({ cdb: false }), cap: 'The common source with its capacitors ($C_L$ includes $C_{db}$).' }, b: { fig: M.csMiller(), cap: 'After Miller: $C_1$ at the gate, $C_2$ at the drain.' } }),
      R(md`
        ### Compare with the exact answer

        Write Miller's input time constant out and compare it with the exact $b$ from section 12.3:
        $$\tau_{in} = R_{TH}\big[C_{in} + (1 + g_mR_L)C_{xy}\big] = R_{TH}C_{in} + (1 + g_mR_L)C_{xy}R_{TH}$$
        $$b = \tau_{in} + R_L(C_{xy} + C_{out})$$
        Miller's input time constant is **exactly the first two terms of $b$**. It leaves out the output node's share, $R_L(C_{xy} + C_{out})$. So:
        - when the output node is fast ($R_L(C_{xy} + C_{out})\ll\tau_{in}$), Miller's input pole and the dominant pole $1/b$ agree, and both are close to the truth;
        - when the output node is slow too, Miller's input pole is **too high** (optimistic), and $1/b$ is the better estimate. Physically: near the input pole the drain is already rolling off, so the gain across $C_{gd}$ is less than $g_mR_L$, and Miller's assumption breaks.

        ### Worked example 1: the common emitter (input node dominant)

        From section 12.3: $R_{TH} = 2.5\,\text{k}\Omega$, $g_m = 20\,\text{mS}$, $R_L = 5\,\text{k}\Omega$ ($g_mR_L = 100$), $C_\pi = 4\,\text{pF}$, $C_\mu = 0.2\,\text{pF}$, $C_L = 1\,\text{pF}$.
        1. Miller: $C_1 = 101\times0.2 = 20.2\,\text{pF}$, $C_2 = 1.01\times0.2 = 0.202\,\text{pF}$.
        2. $\omega_{p,in} = 1/[2.5\,\text{k}\Omega\times(4 + 20.2)\,\text{pF}] = 1/60.5\,\text{ns} = 1.65\times10^7\,\text{rad/s}$.
        3. $\omega_{p,out} = 1/[5\,\text{k}\Omega\times1.202\,\text{pF}] = 1/6.01\,\text{ns} = 1.66\times10^8\,\text{rad/s}$.
        4. Exact dominant pole: $1.53\times10^7$. Miller is 8% high, because the output's share of $b$ is only $6/66.5 = 9\%$. Good enough.

        ### Worked example 2: the running common source (both nodes matter)

        $R_S = 4\,\text{k}\Omega$, $g_m = 5\,\text{mS}$, $R_L = 8\,\text{k}\Omega$ ($g_mR_L = 40$), $C_{gs} = 200$, $C_{gd} = 25$, $C_{out} = 300\,\text{fF}$.
        1. $C_1 = 41\times25 = 1025\,\text{fF}$, $C_2 = 1.025\times25 = 25.6\,\text{fF}$.
        2. $\omega_{p,in} = 1/[4\,\text{k}\Omega\times1225\,\text{fF}] = 1/4.9\,\text{ns} = 2.04\times10^8\,\text{rad/s}$.
        3. $\omega_{p,out} = 1/[8\,\text{k}\Omega\times325.6\,\text{fF}] = 1/2.6\,\text{ns} = 3.84\times10^8\,\text{rad/s}$.
        4. Exact: poles at $1.39\times10^8$ and $3.09\times10^9$, bandwidth $1.39\times10^8\,\text{rad/s}$. **Miller's input pole is 46% high**, and its output pole is eight times too low: the two nodes interact strongly (pole splitting), and Miller cannot see it. Here $1/b = 1/(4.9 + 2.6)\,\text{ns} = 1.33\times10^8$ is within 4%.

        | | Example 1 (CE) | Example 2 (CS) |
        |---|---|---|
        | input share of $b$, $\tau_{in}/b$ | $91\%$ | $65\%$ |
        | Miller's $\omega_{p,in}$ | $1.65\times10^7$ | $2.04\times10^8$ |
        | $1/b$ | $1.50\times10^7$ | $1.33\times10^8$ |
        | exact dominant pole | $1.53\times10^7$ | $1.39\times10^8$ |

        **The rule:** use Miller's input pole when the input node clearly dominates; otherwise add the output's time constant and use $1/b$. Chapter 13 makes "add the time constants" a method.
      `),
      R(md`
        ### Two limits

        - **$R_S\to0$** (an ideal source drives the gate): the input pole goes to infinity and the stage has one pole, at the output. Exactly, $a\to0$ and $b\to R_L(C_{gd} + C_{out})$: $\omega_p = 1/(8\,\text{k}\Omega\times325\,\text{fF}) = 3.85\times10^8$; Miller's output pole gives $3.84\times10^8$. When the output node is the only slow node, Miller's output side is fine.
        - **Large gain, Miller term dominant:** $\omega_{p,in}\approx\dfrac{1}{R_S\,g_mR_L\,C_{gd}}$, so
        $$|A_v|\,\omega_{p,in}\approx g_mR_L\cdot\frac{1}{R_Sg_mR_LC_{gd}} = \frac{1}{R_SC_{gd}}$$
        The gain–bandwidth product is fixed by $R_S$ and $C_{gd}$: double $R_L$ and you double the gain and halve the bandwidth. The only ways out are a smaller $R_S$ or killing the gain across $C_{gd}$ (the cascode, next section).

        ### How to recognize Miller in a circuit

        Find the input and output nodes, then ask: **does a transistor capacitor connect them, and what is the gain between its two ends?**

        | Stage | Bridging capacitor | Gain across it | Effect |
        |---|---|---|---|
        | common source / emitter | $C_{gd}$ / $C_\mu$ | $-g_mR_L$, large | **$(1 + g_mR_L)$ times: slow input** |
        | common gate / base | none ($C_{gd}$, $C_\mu$ go to the held gate/base) | | no Miller: fast |
        | source / emitter follower | $C_{gs}$ / $C_\pi$ | just under $+1$ | bootstrapped away |
        | cascode, input device | $C_{gd1}$ | about $-1$ | only about $2C_{gd1}$ |

        !!mistake Common mistakes
          - Using $R_S$ instead of $R_S\parallel r_\pi$ at a BJT's base.
          - Forgetting $C_2$ at the output (small, but it is there).
          - Trusting Miller's input pole when the output time constant is a large part of $b$.
          - Using $g_mR_L$ with the wrong $R_L$: it is everything on the drain, including $r_{ds}$ and any load.
      `),
      Q(md`Miller's input time constant $R_{TH}[C_{in} + (1 + g_mR_L)C_{xy}]$ compared with the exact $b$ is...`,
        [md`the first two terms of $b$: it leaves out $R_L(C_{xy} + C_{out})$`, md`always equal to $b$`, md`always larger than $b$`, md`unrelated to $b$`], 0,
        [null, md`Only when the output term is zero.`, md`It is a part of $b$, so it is smaller or equal.`, md`Expand both: they share two of the three terms.`],
        md`$b = R_{TH}C_{in} + (1 + g_mR_L)C_{xy}R_{TH} + R_L(C_{xy} + C_{out})$. Miller's input pole is therefore never below $1/b$.`),
      Q(md`You double $R_L$ in a common source whose bandwidth is set by the Miller term. What happens?`,
        [md`The gain doubles and the bandwidth roughly halves`, md`The gain doubles and the bandwidth stays the same`, md`Both double`, md`The gain doubles and the bandwidth quarters`], 0,
        [null, md`The Miller factor $1 + g_mR_L$ also doubles.`, md`More gain across $C_{gd}$ means a bigger Miller capacitance, not a smaller one.`, md`$\omega_{p,in}\approx1/(R_Sg_mR_LC_{gd})$ is inversely proportional to $R_L$, not to $R_L^2$.`],
        md`$|A_v|\omega_{p,in}\approx1/(R_SC_{gd})$ does not depend on $R_L$.`),
      P({
        id: 'bk12-millercs-x1', title: 'A common source with Miller',
        q: md`$g_m = 2\,\text{mS}$, $R_S = 50\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$ ($r_{ds}\to\infty$), $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 0.1\,\text{pF}$, $C_L = 0.5\,\text{pF}$. Find the Miller capacitance, both poles, and which sets the bandwidth.`,
        fig: F.cs({ v: { RS: '50\\kO', RL: '10\\kO', Cgs: '0.5\\,\\text{pF}', Cgd: '0.1\\,\\text{pF}', CL: '0.5\\,\\text{pF}' } }),
        parts: [num('(1 + g_mR_L)C_{gd}', 2.1e-12, 'C', [{ v: 2e-12, msg: 'The factor is $1 + g_mR_L = 21$.' }]),
          num('\\omega_{p,in}', 1 / 130e-9, 'w', [{ v: 1 / (50e3 * 0.5e-12), msg: 'Add the Miller capacitance to $C_{gs}$.' }]),
          num('\\omega_{p,out}', 1 / (10e3 * (0.5e-12 + 0.105e-12)), 'w'),
          { lbl: 'Which pole sets the bandwidth?', mc: ['The input pole', 'The output pole'], a: 0, why: [null, 'The output pole is 21 times higher.'] }],
        hints: [md`$g_mR_L = 20$.`],
        sol: md`$g_mR_L = 20$: $C_1 = 21\times0.1 = 2.1\,\text{pF}$, $C_2 = 1.05\times0.1 = 0.105\,\text{pF}$.
$$\omega_{p,in} = \frac{1}{50\,\text{k}\Omega\times2.6\,\text{pF}} = \frac{1}{130\,\text{ns}} = 7.69\times10^6\,\text{rad/s},\qquad \omega_{p,out} = \frac{1}{10\,\text{k}\Omega\times0.605\,\text{pF}} = 1.65\times10^8\,\text{rad/s}$$
The input pole sets the bandwidth ($f\approx1.22\,\text{MHz}$). The input dominates (95% of $b$), so Miller is accurate: the exact pole is $7.42\times10^6$.`,
      }),
      P({
        id: 'bk12-millercs-x2', title: 'A common emitter with Miller',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 200$, $r_o\to\infty$; $R_S = 500\,\Omega$, $R_L = 1\,\text{k}\Omega$, $C_\pi = 20\,\text{pF}$, $C_\mu = 1\,\text{pF}$, $C_L = 5\,\text{pF}$. Find the input node's resistance, the Miller capacitance, both poles, and the dc gain $v_{out}/v_{in}$.`,
        fig: F.ce({ v: { RS: '500\\,\\Omega', RL: '1\\kO', Cpi: '20\\,\\text{pF}', Cmu: '1\\,\\text{pF}', CL: '5\\,\\text{pF}' } }),
        parts: [BK.res('R_{TH}', 1 / (1 / 500 + 1 / 2500), undefined, [{ v: 500, msg: '$r_\\pi = \\beta/g_m = 2.5\\,\\text{k}\\Omega$ is also on the base node.' }]),
          num('(1 + g_mR_L)C_\\mu', 81e-12, 'C'), num('\\omega_{p,in}', 2.3762e7, 'w', [{ v: 1 / (500 * 101e-12), msg: 'The base node is $R_S\\parallel r_\\pi$, not $R_S$.' }]),
          num('\\omega_{p,out}', 1 / (1e3 * 6.0125e-12), 'w'), num('A_v(0)', -80 * 2500 / 3000, 'x', [{ v: -80, msg: 'Only $r_\\pi/(R_S + r_\\pi)$ of $v_{in}$ reaches the base.' }])],
        hints: [md`$g_m = 80\,\text{mS}$, $r_\pi = 2.5\,\text{k}\Omega$, $g_mR_L = 80$.`],
        sol: md`$g_m = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS}$, $r_\pi = 200/80\,\text{mS} = 2.5\,\text{k}\Omega$, $R_{TH} = 500\parallel2500 = 417\,\Omega$, $g_mR_L = 80$.

$C_1 = 81\times1 = 81\,\text{pF}$; input: $417\,\Omega\times101\,\text{pF} = 42.1\,\text{ns}$, $\omega_{p,in} = 2.38\times10^7\,\text{rad/s}$.

$C_2 = 1.0125\,\text{pF}$; output: $1\,\text{k}\Omega\times6.01\,\text{pF} = 6.01\,\text{ns}$, $\omega_{p,out} = 1.66\times10^8\,\text{rad/s}$.

Gain: $-80\times\dfrac{2.5}{3} = -66.7$. (Exact dominant pole $2.13\times10^7$: Miller is 12% high, because the output has 12% of $b$.)`,
      }),
      P({
        id: 'bk12-millercs-x3', title: 'Miller or $1/b$?',
        q: md`For the running common source ($R_S = 4\,\text{k}\Omega$, $g_m = 5\,\text{mS}$, $R_L = 8\,\text{k}\Omega$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $C_{out} = 300\,\text{fF}$), find Miller's input pole and the dominant-pole estimate $1/b$, and pick the better bandwidth estimate (the exact value is $1.39\times10^8\,\text{rad/s}$).`,
        parts: [num('\\omega_{p,in}\\ \\text{(Miller)}', 1 / 4.9e-9, 'w'), num('1/b', 1 / 7.5e-9, 'w'),
          { lbl: 'Better estimate', mc: ['$1/b$: it includes the output node\'s time constant', 'Miller\'s input pole: it is exact', 'They are equal'], a: 0, why: [null, 'It leaves out $R_L(C_{gd} + C_{out}) = 2.6\\,\\text{ns}$, a third of $b$.', 'They differ by the output term.'] }],
        hints: [md`$\tau_{in} = R_S[C_{gs} + 41C_{gd}]$, $b = \tau_{in} + R_L(C_{gd} + C_{out})$.`],
        sol: md`$\tau_{in} = 4\,\text{k}\Omega\times1225\,\text{fF} = 4.9\,\text{ns}$, so Miller gives $2.04\times10^8\,\text{rad/s}$ (46% high). $b = 4.9 + 2.6 = 7.5\,\text{ns}$, $1/b = 1.33\times10^8$ (4% low). When the output node is slow as well, add its time constant.`,
      }),
      P({
        id: 'bk12-millercs-x4', title: 'Driven from an ideal source',
        q: md`The running common source is driven directly by an ideal voltage source ($R_S = 0$). Where is its pole now? Compare with Miller's output pole.`,
        parts: [num('\\omega_p\\ \\text{(exact)}', 1 / (8e3 * 325e-15), 'w', [{ v: 1 / (8e3 * 300e-15), msg: '$C_{gd}$ still hangs on the drain: from the drain, the gate is now an incremental ground.' }]),
          num('\\omega_{p,out}\\ \\text{(Miller)}', 1 / (8e3 * (300e-15 + 25e-15 * 1.025)), 'w')],
        hints: [md`With $R_S = 0$ the gate is held: $C_{gd}$ goes from the drain to (incremental) ground.`],
        sol: md`With $R_{TH} = 0$, $a = 0$ and $b = R_L(C_{gd} + C_{out})$: one pole at $1/(8\,\text{k}\Omega\times325\,\text{fF}) = 3.85\times10^8\,\text{rad/s}$. Miller's output pole: $1/(8\,\text{k}\Omega\times325.6\,\text{fF}) = 3.84\times10^8$. When only the output node is slow, Miller's output side is accurate.`,
      }),
      R(md`### Drill: CS and CE with Miller`),
      G('bk_cs_miller', { need: 4 }),
    ],
  });

  // ================================================================ 12.6 the other stages
  L({
    id: 'bk12-others', title: 'Common gate, followers and the cascode at high frequency', ref: 'Lecture 28',
    steps: [
      R(md`
        ### The question

        The common source is slow because a capacitor bridges a big inverting gain. Every other stage you know is, in one way or another, a way of avoiding that. This section runs the same transistor ($g_m = 5\,\text{mS}$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $r_{ds}\to\infty$) with the same $R_S = 4\,\text{k}\Omega$, $R_L = 8\,\text{k}\Omega$ and $C_L = 300\,\text{fF}$ through each stage, so you can compare. The common source had a bandwidth of $1.39\times10^8\,\text{rad/s}$.
      `),
      RF(md`
        ### The common gate: no bridge at all

        [[fig:cg]]

        The gate is an incremental ground, so **both** of its capacitors land on ground: $C_{gs}$ hangs from the source (the input node), $C_{gd}$ from the drain (the output node). Nothing bridges input and output, so there is no Miller effect. And with $r_{ds}\to\infty$ the two nodes are linked only forward (section 12.2), so the node poles are **exact**:
        - input (source) node: $R_S\parallel\tfrac{1}{g_m} = 4\,\text{k}\Omega\parallel200\,\Omega = 190\,\Omega$, with $C_{gs}$: $\omega_{p,in} = 1/(190\,\Omega\times200\,\text{fF}) = 2.6\times10^{10}\,\text{rad/s}$;
        - output node: $R_L$ with $C_{gd} + C_L$: $\omega_{p,out} = 1/(8\,\text{k}\Omega\times325\,\text{fF}) = 3.85\times10^8\,\text{rad/s}$.

        The bandwidth is $3.85\times10^8$, almost three times the common source's. The price is gain: driven from $R_S = 4\,\text{k}\Omega$, the common gate's input looks like $1/g_m = 200\,\Omega$, so most of $v_{in}$ is lost across $R_S$: $A_v = \dfrac{g_mR_L}{1 + g_mR_S} = \dfrac{40}{21} = 1.9$. A common gate shines when the source is a current (a large $R_S$ that carries signal current), not a voltage.
      `, { cg: { fig: F.cg({ v: { RS: '4\\kO', RL: '8\\kO', Cgs: '200\\,\\text{fF}', Cgd: '25\\,\\text{fF}', CL: '300\\,\\text{fF}' } }), cap: 'The common gate: both transistor capacitors go to the held gate.' } }),
      RF(md`
        ### The source follower: bootstrapping

        [[fig:sf]]

        - $C_{gd}$ goes from the gate to $V_{DD}$ (incremental ground): a plain capacitor on the input node.
        - $C_{gs}$ bridges the gate and the source, and the source **follows** with gain $A_v = \dfrac{g_mR_L}{1 + g_mR_L}$. Miller: $(1 - A_v)C_{gs} = \dfrac{C_{gs}}{1 + g_mR_L}$.

        $$C_{in} = C_{gd} + \frac{C_{gs}}{1 + g_mR_L} = 25 + \frac{200}{41} = 29.9\,\text{fF},\qquad \omega_{p,in} = \frac{1}{4\,\text{k}\Omega\times29.9\,\text{fF}} = 8.4\times10^9\,\text{rad/s}$$
        The output is a source node, $R_L\parallel\tfrac{1}{g_m} = 195\,\Omega$, with $C_L$: $1.7\times10^{10}\,\text{rad/s}$.

        Both nodes are fast, and the follower is far faster than the common source. A caution, though: in a follower the two nodes interact strongly through $C_{gs}$, and here the exact poles are actually a **complex pair** ($-1.9\times10^9\pm j3.7\times10^9$), with a bandwidth of $5.6\times10^9\,\text{rad/s}$. A follower driven from a large $R_S$ into a large $C_L$ can ring. The node picture correctly says "fast"; it does not say exactly how fast.
      `, { sf: { fig: F.sf({ v: { RS: '4\\kO', RL: '8\\kO', Cgs: '200\\,\\text{fF}', Cgd: '25\\,\\text{fF}', CL: '300\\,\\text{fF}' } }), cap: 'The source follower: $C_{gs}$ bridges two nodes that move together.' } }),
      RF(md`
        ### The cascode: Miller cut down to size

        [[fig:ca]]

        $M_1$ is a common source, but its drain is node $X$, the **source** of $M_2$, which looks like $1/g_{m2}$ (gate held). So the gain from $M_1$'s gate to $X$ is only
        $$\frac{v_X}{v_{g1}} = -g_{m1}\cdot\frac{1}{g_{m2}} = -\frac{g_{m1}}{g_{m2}}\approx-1$$
        and $C_{gd1}$ is Miller-multiplied by $1 + 1 = 2$, not by $41$. The big gain appears only at $M_2$'s drain, and no capacitor reaches from there back to the input.
        - input node: $R_S$ with $C_{gs1} + 2C_{gd1} = 250\,\text{fF}$: $\omega_{p,in} = 1/(4\,\text{k}\Omega\times250\,\text{fF}) = 10^9\,\text{rad/s}$;
        - node $X$: $1/g_{m2} = 200\,\Omega$ with $C_{gs2} + 2C_{gd1} = 250\,\text{fF}$: $2\times10^{10}\,\text{rad/s}$;
        - output: $C_{gd2}$ goes to $M_2$'s held gate, so it joins $C_L$: $1/(8\,\text{k}\Omega\times325\,\text{fF}) = 3.85\times10^8\,\text{rad/s}$.

        Exact cascode bandwidth: $3.42\times10^8\,\text{rad/s}$, **2.5 times** the common source's, at the same gain of $-40$. That is the cascode's whole point at high frequency.

        ### Summary: the same transistor in four stages

        | Stage | Gain | What $C_{gd}$ does | Slowest node | Exact bandwidth (rad/s) |
        |---|---|---|---|---|
        | common source | $-40$ | Miller $\times41$ at the input | input and output together | $1.39\times10^8$ |
        | common gate | $+1.9$ | output to ground | output | $3.85\times10^8$ |
        | cascode | $-40$ | Miller $\times2$ only | output | $3.42\times10^8$ |
        | source follower | $+0.98$ | input to ground; $C_{gs}$ bootstrapped | neither: both fast | $5.6\times10^9$ |

        ### The BJT twins

        Same pictures, with the BJT's terminal resistances ([Chapter 8](#/l/bk08-node)): the common base's input node is $R_S\parallel\tfrac{r_\pi}{\beta + 1}\approx R_S\parallel\tfrac{1}{g_m}$ with $C_\pi$; the emitter follower's input sees $C_\mu$ plus a bootstrapped $C_\pi$, through $R_S\parallel[r_\pi + (\beta + 1)R_L]$; the BJT cascode's $C_{\mu1}$ sees a gain of about $-g_{m1}/g_{m2}\approx-1$ (node $X$ is $Q_2$'s emitter).

        !!mistake Common mistakes
          - Applying Miller to $C_{gd}$ of a common gate. Its gate is held: $C_{gd}$ simply goes to ground at the output.
          - Using the whole cascode's gain for $C_{gd1}$. It only spans the gate of $M_1$ to node $X$.
          - Multiplying a follower's $C_{gs}$ by $1 + A_v$. The gain is positive: it is $1 - A_v$, small.
          - Forgetting that $C_{gd2}$ in a cascode (and $C_{gd}$ in a common gate) adds to the output capacitance.
      `, { ca: { fig: F.casc({ v: { RS: '4\\kO', RL: '8\\kO' } }), cap: 'The cascode: $C_{gd1}$ ends on node $X$, which only sees $1/g_{m2}$.' } }),
      Q(md`In a common gate, $C_{gd}$ connects...`,
        [md`the output (drain) to the held gate: it adds to the output capacitance`, md`input to output, so it is Miller-multiplied`, md`the input to ground`, md`nothing: a common gate has no $C_{gd}$`], 0,
        [null, md`The input of a common gate is the **source**; the gate is held.`, md`$C_{gd}$ touches the drain, which is the output.`, md`Every MOSFET has a $C_{gd}$.`],
        md`Gate held = incremental ground. $C_{gd}$ runs from the output to ground: no bridge, no Miller.`),
      Q(md`Why does a cascode have a much higher bandwidth than a common source with the same load and gain?`,
        [md`$C_{gd1}$ only sees a gain of about $-1$ (to the low-resistance node $X$), so it is doubled, not multiplied by $1 + g_mR_L$`,
          md`The cascode has no $C_{gd}$`, md`The cascode's $g_m$ is smaller`, md`The cascode's output resistance is lower`], 0,
        [null, md`Both transistors have one; what changes is the gain across $C_{gd1}$.`, md`Same input transistor, same $g_m$.`, md`It is much **higher**, which if anything slows the output node.`],
        md`Node $X$ sees $1/g_{m2}$, so the gate-to-$X$ gain is $-g_{m1}/g_{m2}\approx-1$ and the Miller factor is about 2.`),
      P({
        id: 'bk12-others-x1', title: 'A common gate, node by node',
        q: md`Common gate: $g_m = 2\,\text{mS}$, $r_{ds}\to\infty$, $R_S = 2\,\text{k}\Omega$, $R_L = 20\,\text{k}\Omega$, $C_{gs} = 0.3\,\text{pF}$, $C_{gd} = 0.05\,\text{pF}$, $C_L = 0.25\,\text{pF}$. Find both poles.`,
        fig: F.cg({ v: { RS: '2\\kO', RL: '20\\kO', Cgs: '0.3\\,\\text{pF}', Cgd: '0.05\\,\\text{pF}', CL: '0.25\\,\\text{pF}' } }),
        parts: [num('\\omega_{p,in}', 1 / (400 * 0.3e-12), 'w', [{ v: 1 / (2e3 * 0.3e-12), msg: 'The source node also sees $1/g_m = 500\\,\\Omega$ in parallel.' }]),
          num('\\omega_{p,out}', 1 / (20e3 * 0.3e-12), 'w', [{ v: 1 / (20e3 * 0.25e-12), msg: 'Add $C_{gd}$: it runs from the drain to the held gate.' }])],
        hints: [md`Input: $R_S\parallel\tfrac1{g_m}$ with $C_{gs}$. Output: $R_L$ with $C_{gd} + C_L$.`],
        sol: md`Input: $2\,\text{k}\Omega\parallel500\,\Omega = 400\,\Omega$, $\tau = 400\times0.3\,\text{pF} = 0.12\,\text{ns}$, $\omega_{p,in} = 8.33\times10^9\,\text{rad/s}$. Output: $20\,\text{k}\Omega\times0.3\,\text{pF} = 6\,\text{ns}$, $\omega_{p,out} = 1.67\times10^8\,\text{rad/s}$, the bandwidth.`,
      }),
      P({
        id: 'bk12-others-x2', title: 'The capacitance a follower presents',
        q: md`A source follower has $C_{gs} = 0.4\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, and $g_mR_L = 9$. What capacitance does its input present to whatever drives it?`,
        fig: F.sf({ caps: ['Cgs', 'Cgd'] }),
        parts: [num('C_{in}', 90e-15, 'C', [{ v: 450e-15, msg: '$C_{gs}$ is bootstrapped: multiply it by $1 - A_v = 1/(1 + g_mR_L)$.' }, { v: 40e-15, msg: 'Add $C_{gd}$ (gate to $V_{DD}$).' }])],
        hints: [md`$A_v = 9/10$, so $1 - A_v = 0.1$.`],
        sol: md`$C_{in} = C_{gd} + \dfrac{C_{gs}}{1 + g_mR_L} = 50 + \dfrac{400}{10} = 90\,\text{fF}$, against $450\,\text{fF}$ for the bare capacitors.`,
      }),
      P({
        id: 'bk12-others-x3', title: 'A cascode with unequal transistors',
        q: md`In a cascode, $g_{m1} = 4\,\text{mS}$ and $g_{m2} = 2\,\text{mS}$ ($r_{ds}\to\infty$), $C_{gd1} = 30\,\text{fF}$. Find the gain from $M_1$'s gate to node $X$ and the Miller capacitance $C_{gd1}$ adds at the input.`,
        fig: F.casc({ caps: ['Cgd1'] }),
        parts: [num('v_X/v_{g1}', -2, 'x', [{ v: -1, msg: 'Only for equal transistors. It is $-g_{m1}/g_{m2}$.' }]), num('C_1', 90e-15, 'C', [{ v: 60e-15, msg: 'The factor is $1 - A_v = 1 + 2 = 3$.' }])],
        hints: [md`Node $X$: $1/g_{m2}$.`],
        sol: md`$v_X/v_{g1} = -g_{m1}/g_{m2} = -2$, so $C_1 = (1 + 2)\times30 = 90\,\text{fF}$. Still far less than a common source's $(1 + g_mR_L)C_{gd}$.`,
      }),
      P({
        id: 'bk12-others-x4', title: 'Common source against cascode',
        q: md`Same transistors and parts in both: $g_m = 2\,\text{mS}$, $r_{ds}\to\infty$, $C_{gs} = 100\,\text{fF}$, $C_{gd} = 20\,\text{fF}$; $R_S = 20\,\text{k}\Omega$, $R_L = 20\,\text{k}\Omega$, $C_L = 100\,\text{fF}$. (a) Miller's input pole of the common source; (b) the cascode's input pole (Miller factor 2) and output pole. An exact solve gives $4.87\times10^7$ (CS) and $2.47\times10^8\,\text{rad/s}$ (cascode).`,
        parts: [num('\\omega_{p,in}\\ \\text{(CS)}', 1 / 18.4e-9, 'w'), num('\\omega_{p,in}\\ \\text{(cascode)}', 1 / (20e3 * 140e-15), 'w', [{ v: 1 / (20e3 * 120e-15), msg: 'The Miller factor of $C_{gd1}$ is $1 + 1 = 2$.' }]), num('\\omega_{p,out}\\ \\text{(cascode)}', 1 / (20e3 * 120e-15), 'w')],
        hints: [md`CS: $g_mR_L = 40$. Cascode input: $R_S(C_{gs1} + 2C_{gd1})$; output: $R_L(C_{gd2} + C_L)$.`],
        sol: md`(a) $R_S[C_{gs} + 41C_{gd}] = 20\,\text{k}\Omega\times920\,\text{fF} = 18.4\,\text{ns}$: $5.43\times10^7\,\text{rad/s}$.

(b) Cascode input: $20\,\text{k}\Omega\times140\,\text{fF} = 2.8\,\text{ns}$: $3.57\times10^8$; output: $20\,\text{k}\Omega\times120\,\text{fF} = 2.4\,\text{ns}$: $4.17\times10^8\,\text{rad/s}$.

The two cascode poles are close, so the exact bandwidth ($2.47\times10^8$) is below both; still five times the common source's $4.87\times10^7$.`,
      }),
      R(md`### Drill: common gate, follower and cascode`),
      G('bk_hf_stage', { need: 4 }),
    ],
  });

  // ================================================================ 12.7 chapter problems
  const EX1 = tn(100e3, 1 / (1 / 50e3 + 1 / 500e3), 50e-15, 10e-15, 100e-15, 0.4e-3);
  const EX2 = B.twoNode({ dev: 'bjt', gm: 40e-3, rpi: 2.5e3, RS: 1e3, RL: 5e3, C: { Cpi: 10e-12, Cmu: 0.5e-12, CL: 2e-12 } });
  L({
    id: 'bk12-problems', title: 'Chapter 12 problems', kind: 'review', ref: 'Lecture 28',
    steps: [
      RF(md`
        ### Chapter 12 in one page

        **Where the capacitances are** ([12.1](#/l/bk12-where)). MOSFET in saturation: $C_{gs} = \tfrac23WLC_{ox} + WL_{ov}C_{ox}$ (the channel thins to zero at the drain, so it belongs to the source), $C_{gd} = WL_{ov}C_{ox}$ (overlap only), $C_{db}$, $C_{sb}$ (junctions to the bulk, shrinking with reverse bias). BJT: $C_\pi = C_b + C_{je}$ with $C_b = \tau_Fg_m$ (charge in transit across the base, $Q_F = \tau_FI_C$), $C_\mu$ (base–collector junction). Speed limit: $\omega_T = g_m/(C_{gs} + C_{gd})$ or $g_m/(C_\pi + C_\mu)$.

        [[fig:hf]]

        **One pole per node** ([12.2](#/l/bk12-node)): $\omega_p = 1/(R_{node}C_{node})$, exact when every capacitor goes to ground and the nodes only drive each other forward. Gate: adds nothing; base: $r_\pi$; source or emitter: about $1/g_m$; drain or collector: $r_{ds}$ or $r_o$.

        **The CS/CE stage exactly** ([12.3](#/l/bk12-exact)): $\dfrac{v_{out}}{v_{TH}} = \dfrac{(C_{xy}s - g_m)R_L}{as^2 + bs + 1}$, $b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$, $a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out})$. Dominant pole $\approx1/b$, second $\approx b/a$, right-half-plane zero $g_m/C_{xy}$. CE: $R_{TH} = R_S\parallel r_\pi$.

        [[fig:two]]

        **Miller** ([12.4](#/l/bk12-miller)): $Z_1 = Z_F/(1 - A_v)$, $Z_2 = Z_F/(1 - 1/A_v)$; a capacitor across $-A_0$ looks like $(1 + A_0)C_F$ at the input. Exact for the true $A_v$; approximate with the low-frequency gain.

        **CS/CE with Miller** ([12.5](#/l/bk12-millercs)): $\omega_{p,in} = 1/\{R_S[C_{gs} + (1 + g_mR_L)C_{gd}]\}$, $\omega_{p,out} = 1/\{R_L[C_L + (1 + \tfrac{1}{g_mR_L})C_{gd}]\}$. Good when the input node dominates; otherwise use $1/b$.

        **Other stages** ([12.6](#/l/bk12-others)): common gate, no bridge (fast); follower, $C_{gs}$ bootstrapped by $1 - A_v$; cascode, $C_{gd1}$ doubled instead of multiplied by $1 + g_mR_L$.
      `, { hf: { fig: M.mosHF(), cap: 'The NMOS high-frequency model; the BJT\'s is the same with $r_\\pi$ across $C_\\pi$.' }, two: { fig: M.twoNode(), cap: 'The two-node model of every CS and CE stage.' } }),
      P({
        id: 'bk12-pr-x1', title: 'Which terminals?',
        q: md`In a common-emitter amplifier, between which nodes do $C_\pi$ and $C_\mu$ sit?`,
        fig: F.ce(),
        parts: [{ lbl: '$C_\\pi$ connects', mc: ['the base (input) to ground (the emitter)', 'the base to the collector', 'the collector to ground'], a: 0, why: [null, 'That is $C_\\mu$.', 'That is $C_L$ (or a collector–substrate capacitance).'] },
          { lbl: '$C_\\mu$ connects', mc: ['the base (input) to the collector (output)', 'the base to the emitter', 'the emitter to ground'], a: 0, why: [null, 'That is $C_\\pi$.', 'The emitter is grounded here.'] }],
        sol: md`$C_\pi$ is the base–emitter capacitance; the emitter is grounded, so it hangs from the input node to ground. $C_\mu$ is the base–collector junction: it bridges input and output, which is why it gets Miller-multiplied.`,
      }),
      P({
        id: 'bk12-pr-x2', title: 'Capacitances from a layout',
        q: md`An NMOS: $W = 40\,\mu\text{m}$, $L = 2\,\mu\text{m}$, $L_{ov} = 0.1\,\mu\text{m}$, $C_{ox} = 2.5\,\text{fF}/\mu\text{m}^2$, saturated. Find $C_{gs}$ and $C_{gd}$.`,
        parts: [num('C_{gs}', 143.333e-15, 'C', [{ v: 210e-15, msg: 'Only $\\tfrac23$ of $WLC_{ox}$ in saturation.' }]), num('C_{gd}', 10e-15, 'C')],
        hints: [md`$WLC_{ox} = 200\,\text{fF}$, overlap $10\,\text{fF}$.`],
        sol: md`$WLC_{ox} = 40\times2\times2.5 = 200\,\text{fF}$; overlap $40\times0.1\times2.5 = 10\,\text{fF}$. $C_{gs} = 133.3 + 10 = 143.3\,\text{fF}$, $C_{gd} = 10\,\text{fF}$.`,
      }),
      P({
        id: 'bk12-pr-x3', title: 'A BJT\'s $f_T$',
        q: md`$I_C = 0.5\,\text{mA}$, $\tau_F = 40\,\text{ps}$, $C_{je} = 0.4\,\text{pF}$, $C_\mu = 0.1\,\text{pF}$. Find $C_\pi$ and $f_T$.`,
        parts: [num('C_\\pi', 1.2e-12, 'C', [{ v: 0.8e-12, msg: 'Add $C_{je}$.' }]), num('f_T', 2.4485e9, 'f', [{ v: 2.4485e9 * 2 * Math.PI, msg: 'That is $\\omega_T$.' }])],
        hints: [md`$g_m = 20\,\text{mS}$, $C_b = \tau_Fg_m$.`],
        sol: md`$g_m = 20\,\text{mS}$, $C_b = 40\,\text{ps}\times20\,\text{mS} = 0.8\,\text{pF}$, $C_\pi = 1.2\,\text{pF}$. $\omega_T = 20\,\text{mS}/1.3\,\text{pF} = 1.54\times10^{10}\,\text{rad/s}$, $f_T = 2.45\,\text{GHz}$.`,
      }),
      P({
        id: 'bk12-pr-x4', title: 'The emitter of a common base',
        q: md`Common base: $I_C = 2\,\text{mA}$, $\beta = 100$, driven from $R_S = 50\,\Omega$; $C_\pi = 8\,\text{pF}$ hangs on the emitter. Find the emitter node's resistance and its pole.`,
        fig: F.cb({ caps: ['Cpi'], hi: 'Cpi', v: { RS: '50\\,\\Omega', Cpi: '8\\,\\text{pF}' } }),
        parts: [BK.res('R_E', 9.9206, undefined, [{ v: 50, msg: 'The emitter itself is about $1/g_m = 12.5\\,\\Omega$, in parallel.' }]), num('\\omega_p', 1.26e10, 'w')],
        hints: [md`$r_\pi/(\beta + 1) = 1250/101\,\Omega$.`],
        sol: md`$g_m = 80\,\text{mS}$, $r_\pi = 1.25\,\text{k}\Omega$, looking into the emitter $1250/101 = 12.4\,\Omega$; with $50\,\Omega$: $9.92\,\Omega$. $\omega_p = 1/(9.92\,\Omega\times8\,\text{pF}) = 1.26\times10^{10}\,\text{rad/s}$: a big capacitor on a tiny resistance is harmless.`,
      }),
      P({
        id: 'bk12-pr-x5', title: 'A drain node with $r_{ds}$',
        q: md`A common source's drain node has $R_L = 20\,\text{k}\Omega$, $r_{ds} = 50\,\text{k}\Omega$ and $0.5\,\text{pF}$ to ground (input zeroed, $C_{gd}$ ignored). Find its pole.`,
        parts: [BK.res('R_{out}', 14285.7, undefined, [{ v: 20e3, msg: 'Keep $r_{ds}$: it is in parallel.' }]), num('\\omega_p', 1.4e8, 'w')],
        hints: [md`$R_L\parallel r_{ds}$.`],
        sol: md`$20\parallel50 = 14.29\,\text{k}\Omega$; $\tau = 7.14\,\text{ns}$; $\omega_p = 1.4\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk12-pr-x6', title: 'Miller with a big gain',
        q: md`A $2\,\text{pF}$ capacitor connects the input and output of an inverting amplifier with gain $-49$. Find the input capacitance it causes, and the input pole if the input is driven through $1\,\text{k}\Omega$ (nothing else at the input).`,
        parts: [num('C_1', 100e-12, 'C', [{ v: 98e-12, msg: 'The factor is $1 + 49$.' }]), num('\\omega_p', 1e7, 'w')],
        hints: [md`$(1 + A_0)C_F$.`],
        sol: md`$C_1 = 50\times2\,\text{pF} = 100\,\text{pF}$; $\omega_p = 1/(1\,\text{k}\Omega\times100\,\text{pF}) = 10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk12-pr-x7', title: 'Bootstrapped capacitance',
        q: md`A $1\,\text{pF}$ capacitor connects the input and output of a follower with gain $+0.99$. What does the input see?`,
        parts: [num('C_1', 10e-15, 'C', [{ v: 1.99e-12, msg: 'The gain is positive: $1 - 0.99$.' }])],
        sol: md`$(1 - 0.99)\times1\,\text{pF} = 10\,\text{fF}$.`,
      }),
      P({
        id: 'bk12-pr-x8', title: 'Symbolic: the Miller input pole of a CE',
        q: md`Write Miller's input pole of a common emitter with source resistance $R_S$, load $R_L$, and $C_\pi$, $C_\mu$ (use $r_\pi$ and $g_m$).`,
        parts: [BK.ex('1/((RS*rpi/(RS + rpi))*(Cpi + (1 + gm*RL)*Cmu))', ['RS', 'rpi', 'gm', 'RL', 'Cpi', 'Cmu'], '\\omega_{p,in}', { exact: true, ranges: { Cpi: [1e-12, 1e-11], Cmu: [1e-13, 1e-12] } })],
        hints: [md`Input node: $R_S\parallel r_\pi$; capacitance $C_\pi + (1 + g_mR_L)C_\mu$.`],
        sol: md`$$\omega_{p,in} = \frac{1}{(R_S\parallel r_\pi)\,[C_\pi + (1 + g_mR_L)C_\mu]}$$`,
      }),
      P({
        id: 'bk12-pr-x9', title: 'A common-gate input with $r_{ds}$',
        q: md`Common gate: $g_m = 2\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $R_L = 20\,\text{k}\Omega$, $R_S = 2\,\text{k}\Omega$. Find the resistance looking up into the source, and the input node's resistance.`,
        parts: [BK.res('R_{up}', 693.07, undefined, [{ v: 500, msg: 'With $r_{ds}$ and $R_L$ it is $(r_{ds} + R_L)/(1 + g_mr_{ds})$, a bit more than $1/g_m$.' }]), BK.res('R_X', 514.71)],
        hints: [md`$\dfrac{r_{ds} + R_L}{1 + g_mr_{ds}}$ ([Chapter 3](#/l/bk03-source)).`],
        sol: md`$\dfrac{50 + 20}{1 + 100}\,\text{k}\Omega = 693\,\Omega$ (not $500$: $R_L$ is not small next to $r_{ds}$). $R_X = 2\,\text{k}\Omega\parallel693\,\Omega = 515\,\Omega$.`,
      }),
      P({
        id: 'bk12-pr-x10', title: 'More current in a MOSFET',
        q: md`A MOSFET (fixed $W/L$, overlaps ignored) has $f_T = 1\,\text{GHz}$. You double its drain current. What is the new $f_T$?`,
        parts: [num('f_T', Math.SQRT2 * 1e9, 'f', [{ v: 2e9, msg: 'At fixed $W/L$, $V_{ov}\\propto\\sqrt{I_D}$, and $\\omega_T\\propto V_{ov}$.' }, { v: 1e9, msg: '$\\omega_T = \\tfrac32\\mu V_{ov}/L^2$ grows with $V_{ov}$.' }])],
        hints: [md`$\omega_T\approx\tfrac32\mu V_{ov}/L^2$ and $I_D\propto V_{ov}^2$.`],
        sol: md`$V_{ov}$ grows by $\sqrt2$, so $f_T = 1.41\,\text{GHz}$. (A BJT would gain more at low current, $f_T\propto I_C$, and nothing near its $1/\tau_F$ ceiling.)`,
      }),
      P({
        id: 'bk12-pr-x11', title: 'The second pole',
        q: md`A CS stage has $a = 2\times10^{-18}\,\text{s}^2$ and $b = 10\,\text{ns}$. Estimate both poles.`,
        parts: [num('\\omega_{p1}', 1e8, 'w'), num('\\omega_{p2}', 5e9, 'w', [{ v: 5e17, msg: 'That is $1/a$; the second pole is $b/a$.' }])],
        sol: md`$\omega_{p1}\approx1/b = 10^8$, $\omega_{p2}\approx b/a = 10^{-8}/(2\times10^{-18}) = 5\times10^9\,\text{rad/s}$ (50 times apart, so both estimates are within about 2%).`,
      }),
      P({
        id: 'bk12-pr-x12', title: 'Where is the zero?',
        q: md`A common source has $g_m = 8\,\text{mS}$ and $C_{gd} = 40\,\text{fF}$. Where is its zero, and in which half plane?`,
        parts: [num('\\omega_z', 2e11, 'w'), { lbl: 'Half plane', mc: ['right', 'left'], a: 0, why: [null, 'The numerator is $C_{gd}s - g_m$: it vanishes at positive $s$.'] }],
        sol: md`$\omega_z = g_m/C_{gd} = 2\times10^{11}\,\text{rad/s}$, right half plane: the forward current through $C_{gd}$ cancels the inverted $g_mv_{gs}$.`,
      }),
      P({
        id: 'bk12-pr-x13', title: 'Exam style: a common source from its bias',
        big: true,
        q: md`An NMOS with $W/L = 20$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\lambda = 0.05\,\text{V}^{-1}$) is biased at $V_{ov} = 0.2\,\text{V}$ in a common source with $R_L = 50\,\text{k}\Omega$, driven from $R_S = 100\,\text{k}\Omega$. $C_{gs} = 50\,\text{fF}$, $C_{gd} = 10\,\text{fF}$, $C_L = 100\,\text{fF}$ (includes $C_{db}$).
(a) $I_D$ and $g_m$; (b) $r_{ds}$, the output resistance and the gain; (c) the Miller capacitance; (d) both poles with Miller; (e) the bandwidth in Hz (use the dominant pole; the exact answer is $5.65\,\text{MHz}$).`,
        fig: F.cs({ v: { RS: '100\\kO', RL: '50\\kO', Cgs: '50\\,\\text{fF}', Cgd: '10\\,\\text{fF}', CL: '100\\,\\text{fF}' } }),
        parts: [{ lbl: 'I_D', unit: 'µA', ans: 40 }, num('g_m', 0.4e-3, 'g'), BK.res('R_{out}', 45454.5, undefined, [{ v: 50e3, msg: 'Include $r_{ds} = 1/(\\lambda I_D) = 500\\,\\text{k}\\Omega$ in parallel.' }]),
          num('A_v', -18.1818, 'x', [{ v: -20, msg: 'Use $R_L\\parallel r_{ds}$.' }]), num('C_1', 191.818e-15, 'C', [{ v: 181.8e-15, msg: 'The factor is $1 + |A_v|$.' }]),
          num('\\omega_{p,in}', EX1.win, 'w'), num('\\omega_{p,out}', EX1.wout, 'w'),
          num('f_{-3dB}', EX1.win / (2 * Math.PI), 'f', [{ v: EX1.win, msg: 'That is in rad/s; divide by $2\\pi$.' }], [5.6497e6])],
        hints: [md`$I_D = \tfrac12\mu_nC_{ox}\tfrac{W}{L}V_{ov}^2$, $g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$.`, md`$g_m(R_L\parallel r_{ds}) = 18.18$, so the Miller factor is $19.18$.`],
        sol: md`**(a)** $I_D = \tfrac12(100\,\mu)(20)(0.2)^2 = 40\,\mu\text{A}$; $g_m = 2I_D/V_{ov} = 0.4\,\text{mS}$.

**(b)** $r_{ds} = 1/(0.05\times40\,\mu\text{A}) = 500\,\text{k}\Omega$; $R_{out} = 50\parallel500 = 45.45\,\text{k}\Omega$; $A_v = -g_mR_{out} = -18.18$.

**(c)** $C_1 = (1 + 18.18)\times10\,\text{fF} = 191.8\,\text{fF}$, and $C_2 = (1 + 1/18.18)\times10 = 10.55\,\text{fF}$.

**(d)** $\omega_{p,in} = \dfrac{1}{100\,\text{k}\Omega\times(50 + 191.8)\,\text{fF}} = \dfrac{1}{24.2\,\text{ns}} = ${f(EX1.win / 1e7, 4)}\times10^7\,\text{rad/s}$; $\omega_{p,out} = \dfrac{1}{45.45\,\text{k}\Omega\times110.55\,\text{fF}} = \dfrac{1}{5.03\,\text{ns}} = ${f(EX1.wout / 1e8, 4)}\times10^8\,\text{rad/s}$.

**(e)** The input pole is about five times lower and dominates: $f_{-3dB}\approx${f(EX1.win / 2 / Math.PI / 1e6, 3)}\,\text{MHz}$. The exact value, $5.65\,\text{MHz}$, is 14% lower because the output node holds 17% of $b$; $1/b$ gives $5.45\,\text{MHz}$.`,
      }),
      P({
        id: 'bk12-pr-x14', title: 'Exam style: a common emitter, exact and Miller',
        big: true,
        q: md`Common emitter: $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o\to\infty$, $R_S = 1\,\text{k}\Omega$, $R_L = 5\,\text{k}\Omega$, $C_\pi = 10\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 2\,\text{pF}$.
(a) $g_m$, $r_\pi$, $R_{TH}$; (b) the dc gain $v_{out}/v_{in}$; (c) $b$ and the dominant pole $1/b$; (d) Miller's input pole; (e) which is closer to the exact $1.106\times10^7\,\text{rad/s}$, and why?`,
        fig: F.ce({ v: { RS: '1\\kO', RL: '5\\kO', Cpi: '10\\,\\text{pF}', Cmu: '0.5\\,\\text{pF}', CL: '2\\,\\text{pF}' } }),
        parts: [num('g_m', 40e-3, 'g'), BK.res('r_\\pi', 2500), BK.res('R_{TH}', 714.286, undefined, [{ v: 1000, msg: 'Include $r_\\pi$: $R_S\\parallel r_\\pi$.' }]),
          num('A_v(0)', -200 * 2.5 / 3.5, 'x', [{ v: -200, msg: 'Only $r_\\pi/(R_S + r_\\pi)$ of $v_{in}$ reaches the base.' }]),
          num('b', EX2.b, 't'), num('1/b', 1 / EX2.b, 'w'), num('\\omega_{p,in}\\ \\text{(Miller)}', EX2.win, 'w'),
          { lbl: '(e) Closer to the exact pole', mc: ['$1/b$: Miller leaves out the output time constant, 14% of $b$', 'Miller: it is exact', 'Both are equally close'], a: 0, why: [null, 'Miller drops $R_L(C_\\mu + C_L) = 12.5\\,\\text{ns}$.', '$1/b$ is 1% low, Miller 15% high.'] }],
        hints: [md`$g_mR_L = 200$.`, md`$b = (1 + g_mR_L)C_\mu R_{TH} + R_{TH}C_\pi + R_L(C_\mu + C_L)$.`],
        sol: md`**(a)** $g_m = 40\,\text{mS}$, $r_\pi = 2.5\,\text{k}\Omega$, $R_{TH} = 1\parallel2.5 = 714\,\Omega$.

**(b)** $A_v = -g_mR_L\cdot\dfrac{r_\pi}{R_S + r_\pi} = -200\times\dfrac{2.5}{3.5} = -142.9$.

**(c)** $b = 201\times0.5\,\text{pF}\times714\,\Omega + 714\,\Omega\times10\,\text{pF} + 5\,\text{k}\Omega\times2.5\,\text{pF} = 71.8 + 7.14 + 12.5 = 91.4\,\text{ns}$; $1/b = 1.094\times10^7\,\text{rad/s}$.

**(d)** $\omega_{p,in} = \dfrac{1}{714\,\Omega\times(10 + 100.5)\,\text{pF}} = \dfrac{1}{78.9\,\text{ns}} = 1.27\times10^7\,\text{rad/s}$.

**(e)** $1/b$ is 1% from the exact $1.106\times10^7$; Miller is 15% high, because it leaves out the output's $12.5\,\text{ns}$.`,
      }),
      P({
        id: 'bk12-pr-x15', title: 'Exam style: the same transistor, three stages',
        big: true,
        q: md`One transistor ($g_m = 5\,\text{mS}$, $r_{ds}\to\infty$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$) with $R_S = 4\,\text{k}\Omega$, $R_L = 8\,\text{k}\Omega$, $C_L = 300\,\text{fF}$. (a) Common source: Miller's input pole. (b) Common gate: the input-node and output-node poles and the gain. (c) Cascode with an identical top transistor: the input pole and the output pole.`,
        parts: [num('\\omega_{p,in}\\ \\text{(CS)}', 1 / 4.9e-9, 'w'), num('\\omega_{p,in}\\ \\text{(CG)}', 1 / (1 / (1 / 4e3 + 5e-3) * 200e-15), 'w', [{ v: 1 / (4e3 * 200e-15), msg: 'The source node sees $R_S\\parallel1/g_m$.' }]),
          num('\\omega_{p,out}\\ \\text{(CG)}', 1 / 2.6e-9, 'w'), num('A_v\\ \\text{(CG)}', 40 / 21, 'x', [{ v: 40, msg: 'The input is a source: only $1/(1 + g_mR_S)$ of $v_{in}$ reaches it.' }]),
          num('\\omega_{p,in}\\ \\text{(cascode)}', 1e9, 'w'), num('\\omega_{p,out}\\ \\text{(cascode)}', 1 / 2.6e-9, 'w')],
        hints: [md`CS: $R_S[C_{gs} + 41C_{gd}]$. CG: $R_S\parallel\tfrac1{g_m}$ with $C_{gs}$; $R_L$ with $C_{gd} + C_L$. Cascode: Miller factor 2.`],
        sol: md`**(a)** $4\,\text{k}\Omega\times1225\,\text{fF} = 4.9\,\text{ns}$: $2.04\times10^8\,\text{rad/s}$ (exact CS bandwidth $1.39\times10^8$).

**(b)** Input: $190\,\Omega\times200\,\text{fF} = 38\,\text{ps}$: $2.6\times10^{10}$; output: $8\,\text{k}\Omega\times325\,\text{fF} = 2.6\,\text{ns}$: $3.85\times10^8\,\text{rad/s}$; gain $40/21 = 1.9$.

**(c)** Input: $4\,\text{k}\Omega\times250\,\text{fF} = 1\,\text{ns}$: $10^9$; output: $3.85\times10^8\,\text{rad/s}$ (exact cascode bandwidth $3.42\times10^8$, at a gain of $-40$).`,
      }),
      P({
        id: 'bk12-pr-x16', title: 'The gain–bandwidth trade',
        q: md`A common source driven from $R_S = 10\,\text{k}\Omega$ has $C_{gd} = 20\,\text{fF}$, and its input pole is set by the Miller term. Estimate the product $|A_v|\,\omega_{p,in}$. If the gain is 50, where is the input pole?`,
        parts: [num('|A_v|\\omega_{p,in}', 1 / (10e3 * 20e-15), 'w'), num('\\omega_{p,in}\\ (|A_v| = 50)', 1 / (10e3 * 20e-15) / 50, 'w', [{ v: 1 / (10e3 * 20e-15) / 51, msg: 'Close: with the Miller term alone, $\\omega_{p,in}\\approx1/(R_Sg_mR_LC_{gd})$; use $|A_v| = 50$.' }])],
        hints: [md`$\omega_{p,in}\approx\dfrac{1}{R_Sg_mR_LC_{gd}}$.`],
        sol: md`$|A_v|\omega_{p,in}\approx1/(R_SC_{gd}) = 1/(10\,\text{k}\Omega\times20\,\text{fF}) = 5\times10^9\,\text{rad/s}$. At a gain of 50: $10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk12-pr-x17', title: 'An emitter follower\'s input node',
        q: md`Emitter follower: $I_C = 1\,\text{mA}$, $\beta = 100$, $R_L = 1\,\text{k}\Omega$, driven from $R_S = 20\,\text{k}\Omega$. Ignore $C_\pi$. $C_\mu = 2\,\text{pF}$ runs from the base to $V_{CC}$. Find the base node's resistance and the pole.`,
        fig: F.ef({ caps: ['Cmu'], hi: 'Cmu', v: { RS: '20\\kO', RL: '1\\kO', Cmu: '2\\,\\text{pF}' } }),
        parts: [BK.res('R_B', 1 / (1 / 20e3 + 1 / 103.5e3), undefined, [{ v: 20e3, msg: 'The base draws current: $r_\\pi + (\\beta + 1)R_L = 103.5\\,\\text{k}\\Omega$ in parallel.' }]), num('\\omega_p', 1 / (1 / (1 / 20e3 + 1 / 103.5e3) * 2e-12), 'w')],
        hints: [md`Looking into the base: $r_\pi + (\beta + 1)R_L$.`],
        sol: md`$r_\pi = 2.5\,\text{k}\Omega$; base: $2.5 + 101\times1 = 103.5\,\text{k}\Omega$; with $R_S$: $20\parallel103.5 = 16.8\,\text{k}\Omega$. $\omega_p = 1/(16.8\,\text{k}\Omega\times2\,\text{pF}) = 2.98\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk12-pr-x18', title: 'Read the Miller factor off a cascode',
        q: md`A BJT cascode: $Q_1$ and $Q_2$ both at $I_C = 1\,\text{mA}$, $\beta = 100$. $C_{\mu1} = 0.5\,\text{pF}$. What gain does $C_{\mu1}$ see, and what capacitance does it add at the input?`,
        fig: F.bjtcasc({ caps: ['Cmu1'], hi: 'Cmu1' }),
        parts: [num('v_X/v_{b1}', -40e-3 / (1 / 2500 + 0.04), 'x', [{ v: -40e-3 * 5e3, msg: 'That is the gain to the output. $C_{\\mu1}$ ends on node $X$, the emitter of $Q_2$.' }]),
          num('C_1', 0.5e-12 * (1 + 40e-3 / (1 / 2500 + 0.04)), 'C', [{ v: 0.5e-12, msg: 'Multiply by $1 - A_v\\approx2$.' }])],
        hints: [md`Node $X$: $Q_2$'s emitter, $R_X = \dfrac{r_{\pi2}}{\beta + 1}$.`],
        sol: md`$R_X = r_{\pi2}/(\beta + 1) = 2500/101 = 24.75\,\Omega$; gain $-g_{m1}R_X = -40\,\text{mS}\times24.75\,\Omega = -0.99$. $C_1 = 1.99\times0.5 = 0.995\,\text{pF}$: about $2C_{\mu1}$.`,
      }),
      R(md`### Mixed drill: every Chapter 12 skill`),
      G('bk_node_pole', { need: 8, pool: ['bk_cap_mos', 'bk_cap_bjt', 'bk_node_pole', 'bk_cs_exact', 'bk_miller', 'bk_cs_miller', 'bk_hf_stage'] }),
    ],
  });

})();

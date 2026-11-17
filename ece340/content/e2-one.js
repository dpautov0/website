/* Exam 2 on one page: the whole exam as one intuitive story, built from Exam 1 basics (carriers, Fermi level, drift,
   diffusion) up through junctions, breakdown, capacitance, Schottky contacts and optoelectronics. Words and pictures
   first; every result is traced to where it comes from and what assumption it rests on. Ends with the Fall 2015 and
   Spring 2003 Exam 2s worked through for intuition. Figures reuse window.E2FIG (e2-a.js), so this loads after it. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const N = (lbl, ans, unit, rel = 0.03) => ({ lbl, ans, unit, tol: { rel } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const img = (f, alt, w = 420) => `<img class="scan" src="img/hw/${f}.png" alt="${alt}" style="max-width:${w}px" loading="lazy">`;
  const scan = (f, alt, w, cap) => ({ svg: img(f, alt, w), cap });
  const F = window.E2FIG;
  const LR = ['← (toward −x)', '→ (toward +x)'];
  const UP3 = ['increase', 'decrease', 'stay the same'];

  // ---------------------------------------------------------------- figures
  const nBands = BD.diagram({ w: 150, h: 130, Ec: 1.12, Ev: 0, Ei: 0.56, EF: 0.95, axis: false, lab: { EF: 'E_F' } });
  const pBands = BD.diagram({ w: 150, h: 130, Ec: 1.12, Ev: 0, Ei: 0.56, EF: 0.17, axis: false, lab: { EF: 'E_F' } });
  const tilted = BD.diagram({ w: 300, h: 140, x: [0, 1], Ec: (x) => 1.5 - 0.55 * x, Ev: (x) => 0.38 - 0.55 * x, axis: false, field: 'left' });
  const diffFig = BD.prof({ w: 330, h: 190, x: [0, 3.2], y: [0, 1.15], xl: 'x', yl: '\\delta p', xt: [[1, 'L'], [0.6, '\\ell']],
    curves: [{ f: (x) => Math.exp(-x), lab: '\\text{long region}', labAt: 1.6, dy: -12 },
      { f: (x) => 1 - x / 0.6, from: 0, to: 0.6, cls: 'dash' }] });
  const g = (x, c, s, a) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const hsFig = BD.prof({ w: 340, h: 180, x: [0, 4], y: [0, 1.1], xl: 'x', yl: '\\delta p',
    curves: [{ f: (x) => g(x, 0.6, 0.12, 1), lab: 't_1', labAt: 0.6, dy: -10, anchor: 'b' }, { f: (x) => g(x, 1.8, 0.22, 0.45), lab: 't_2', labAt: 1.8, dy: -10, anchor: 'b' },
      { f: (x) => g(x, 3.0, 0.3, 0.22), lab: 't_3', labAt: 3.0, dy: -10, anchor: 'b' }] });
  // linearly graded junction, p on the left: charge linear, field a parabola, potential cubic
  const graded = PF.row([
    { svg: BD.prof({ w: 210, h: 140, x: [-1.4, 1.4], y: [-1.1, 1.1], xl: 'x', yl: '\\rho', zero: true, curves: [{ pts: [[-1.4, 0], [-1, 0], [-1, -1], [1, 1], [1, 0], [1.4, 0]] }] }), cap: 'charge: a straight line' },
    { svg: BD.prof({ w: 210, h: 140, x: [-1.4, 1.4], y: [-1.1, 0.3], xl: 'x', yl: '\\mathscr{E}', zero: true, curves: [{ f: (x) => (Math.abs(x) <= 1 ? -(1 - x * x) : 0) }] }), cap: 'field: a parabola' },
    { svg: BD.prof({ w: 210, h: 140, x: [-1.4, 1.4], y: [-0.1, 1.45], xl: 'x', yl: 'V', curves: [{ f: (x) => (x <= -1 ? 0 : x >= 1 ? 4 / 3 : x - x ** 3 / 3 + 2 / 3) }] }), cap: 'potential: a cubic S' },
  ]);
  const ivFig = BD.prof({ w: 340, h: 210, x: [-3.6, 1], y: [-1.2, 1.2], xl: 'V', yl: 'I', zero: true, xt: [[-3, '-V_{br}'], [0, '0']],
    curves: [{ f: (v) => 0.03 * (Math.exp(v / 0.12) - 1) - 0.03, from: -3, to: 0.62, lab: '\\text{forward}', labAt: 0.4, dx: -8, dy: -6, anchor: 'r' },
      { pts: [[-3, -0.06], [-3.02, -1.2]], lab: '\\text{breakdown}', labAt: -3, dx: 8, dy: 40 }] });
  const msRect = (() => {
    const top = 0.744, bulk = 0.205, Ec = (x) => bulk + top * Math.max(0, 1 - x) ** 2;
    return BD.prof({ w: 280, h: 190, x: [-0.6, 2.2], y: [-1.15, 1.15], xl: 'x', yl: 'E', vlines: [[0, '']], xt: [[-0.3, '\\text{metal}'], [1.3, '\\text{n-Si}']],
      curves: [{ f: () => 0, lab: 'E_F', labAt: 2.2, dy: 4 }, { f: Ec, from: 0, to: 2.2, lab: 'E_c', labAt: 2.2, dy: -6 }, { f: (x) => Ec(x) - 1.12, from: 0, to: 2.2, lab: 'E_v', labAt: 2.2, dy: -6 }] });
  })();
  const solar = (() => {
    const I0 = 1e-5, Iop = 1, Vt = 0.05, Voc = Vt * Math.log(1 + Iop / I0);
    return BD.prof({ w: 340, h: 220, x: [-0.3, 0.75], y: [-1.25, 0.6], xl: 'V', yl: 'I', zero: true, xt: [[Voc, 'V_{oc}']], yt: [[-Iop, '-I_{sc}']],
      curves: [{ f: (v) => I0 * (Math.exp(v / Vt) - 1) - Iop, lab: '\\text{lit}', labAt: 0.15, dx: 0, dy: -10, anchor: 'b' }, { f: (v) => I0 * (Math.exp(v / Vt) - 1), cls: 'dash', lab: '\\text{dark}', labAt: 0.55, dx: -6, dy: 0, anchor: 'r' }],
      pts: [{ x: -0.18, y: -Iop, lab: '\\text{photodiode}', anchor: 'bl' }, { x: 0.45, y: -0.9, lab: '\\text{solar cell}', anchor: 'tl' }] });
  })();

  const steps = [
    R(md`
      This page is the whole exam as **one story**, told mostly in words and pictures. Every idea is built from the one before it, starting from Exam 1, so if diffusion or the Fermi level feels shaky, start at the top. Each section answers three questions: **what happens**, **why**, and **what we assumed** to say so.

      The exam tests exactly this: given a setup, predict what the bands, carriers, fields and currents do, and say where each number comes from. Read slowly; answer the check questions before opening the explanations. The last two sections walk through the **Fall 2015** and **Spring 2003** Exam 2s the same way (each also has its own page with a printable exam PDF and answer key).
    `),
    R(md`
      ## 0. Beating the clock (read this first)

      On Midterm 1 the time went to **deriving things during the exam** and to **decoding the excess-carrier problem** (Problem 4). Two fixes:

      **1. Never derive on the exam what is in this table.** Each line has its one-line reason, and the sections below show where it comes from, so you can trust it and just use it.

      | Know cold | The one-line reason |
      |---|---|
      | 60 mV of Fermi-level shift = 10× the carriers | Boltzmann: a factor $e$ per $kT$ |
      | $np = n_i^2$ in equilibrium | raising $E_F$ multiplies $n$ and divides $p$ equally |
      | minority lifetime ∝ 1/(majority density) | a minority carrier needs a majority partner to recombine |
      | steady excess = generation rate × lifetime | in = out |
      | $L = \sqrt{D\tau}$ | a random walk spreads as √time |
      | $D = \mu\,kT/q$ | Einstein: same scattering sets both |
      | carriers from the **net** doping, mobility from the **total** | every ion scatters; only the surplus donates |
      | current into a long region = $qD\delta/L$ = stored excess/τ | everything that enters recombines |
      | $qV_0$ = the two Fermi-level offsets added | the Fermi levels line up |
      | $N_ax_p = N_dx_n$; depletion lives in the light side | the charges balance |
      | $W \propto \sqrt{(V_0 \pm V)/N}$ | voltage ∝ $N W^2$ |
      | peak field $= 2V/W$ | the field triangle's area is the voltage |
      | edge minority × $e^{qV/kT}$ | law of the junction (Boltzmann over the barrier) |
      | $I_0 \propto n_i^2 D/(N L)$, light side dominates | the minority supply sets the current |
      | $I = Q/\tau$ | stored charge is replaced as it recombines |
      | $C_j = \epsilon A/W$; $1/C_j^2$ vs $V_R$ is a line to $-V_0$ | a parallel-plate capacitor |
      | Zener: heavy doping, low $V_{br}$, falls with $T$. Avalanche: light doping, higher $V_{br}$, rises with $T$ | tunneling vs impact ionization |
      | $\phi_B = \phi_m - \chi$; $qV_0 = \phi_m - \phi_s$ (n-type) | metal side vs semiconductor side of the barrier |
      | $I_{sc}$ ∝ light; $V_{oc}$ ∝ log(light) | pairs made vs forward injection cancelling them |
      | $\lambda(\mu\text{m}) = 1.24/E_g(\text{eV})$; lasing needs $F_n - F_p > E_g$ | photon energy; inversion |

      **2. Recognize the setup in ten seconds, then go straight to the right idea.**

      | If the problem says… | It is… | Go straight to |
      |---|---|---|
      | light on one end of a long bar | steady diffusion with recombination | $\delta(0)e^{-x/L}$, Section 4 |
      | uniform light, no gradient | generation = recombination | $\delta = g\tau$ |
      | "same laser, different doping" | $g$ fixed, $\tau \propto 1/\text{majority}$ | Section 4b |
      | both $N_D$ and $N_A$ given | compensation | net for carriers, total for mobility |
      | "$x_{n0} = k\,x_{p0}$" | charge balance | the doping ratio is $k$ the other way |
      | $p^+n$ or $n^+p$ | one-sided junction | everything on the light side |
      | "increase, decrease or stay the same" | a dependence question | name the formula, read the trend |
      | minority profile is a straight line | narrow base | slope $= \Delta/\ell$ |
      | I–V curve shifted down, quadrants | illuminated junction | $I_{sc}$, $V_{oc}$, Section 12 |
      | $\phi_m$ and $\chi$ given | metal contact | Schottky or ohmic, Section 11 |

      **Timing:** read every problem first (2 minutes), start with the one you recognize, and give each about 12 minutes. If a part stalls you for 3 minutes, write the governing relation (partial credit) and move on.

      **What the most recent Exam 2 looked like (Section 14).** Three problems, almost all sketches and reasoning, very little arithmetic:
      1. a **metal | n | p | metal** structure: sketch charge, field and potential through it, draw the bands with every $\phi$ labeled, and find the metal work function that makes a contact ohmic;
      2. a **biased junction**: forward or reverse, the minority-carrier profiles, the electron and hole current components, the quasi-Fermi-level band diagram, and how the capacitance scales with reverse bias;
      3. **optoelectronics**: define stimulated emission, population inversion and the photovoltaic effect, name the I–V quadrants, and say how doping changes the photocurrent.
      If you can do Sections 5–8, 10, 11 and 12 without notes, you can do that exam.
    `),

    // ============================================================ Part 1: the cast
    RF(md`
      ## 1. The cast: bands, carriers and the Fermi level

      A semiconductor has a full **valence band** (bonding electrons) and an empty **conduction band**, separated by the **gap** $E_g$ (1.12 eV in Si). Current needs something that can move:
      - a **free electron**, an electron kicked up into the conduction band;
      - a **hole**, the empty bond it left behind, which acts like a positive particle moving through the valence band.

      **The Fermi level $E_F$** is a single number that tells you how full the states are. Think of it as the "water level" of electrons. The higher $E_F$ sits, the more electrons there are in the conduction band and the fewer holes in the valence band.

      [[fig:np]]

      **Where carrier numbers come from.** Each time $E_F$ moves up by $kT$ (26 meV at room temperature), the electron count multiplies by $e \approx 2.7$ and the hole count divides by the same factor. That is just Boltzmann statistics: the chance that a state at energy $E$ is occupied falls off by a factor $e$ for every $kT$ it sits above $E_F$. A handy version: **60 mV of Fermi-level shift means 10× the carriers.**

      - **Intrinsic** (undoped): $E_F$ sits near midgap, at $E_i$, and $n = p = n_i$.
      - **n-type**: donors give up electrons, so $E_F$ rises toward $E_c$. **p-type**: acceptors grab electrons, so $E_F$ drops toward $E_v$.
      - **Majority** carriers are the plentiful ones (electrons in n-type), **minority** the scarce ones.

      **Why $np = n_i^2$ in equilibrium.** Raising $E_F$ multiplies $n$ and divides $p$ by the *same* factor, so their product never changes. It is set only by the gap and temperature. So in n-type with $n = N_d$, the holes are $n_i^2/N_d$: a tiny number, but it is exactly these minority carriers that run a diode.

      **Why $n_i$ depends so strongly on gap and temperature.** To make a pair you must lift an electron across the whole gap, and the odds fall exponentially with the gap measured in units of $kT$. A wider gap or a colder crystal means far fewer intrinsic carriers. Remember this: it is why wide-gap diodes leak less and why leakage soars when they heat up.
    `, { np: { svg: PF.row([{ svg: nBands, cap: 'n-type: $E_F$ near $E_c$' }, { svg: pBands, cap: 'p-type: $E_F$ near $E_v$' }]).svg, cap: '' } }),
    Q(md`An n-type sample's Fermi level is raised by 120 mV (about $4.6kT$). Roughly what happens to the hole concentration?`,
      ['it drops about 100×', 'it rises about 100×', 'it drops about 4.6×', 'it stays the same, since holes are minority'], 0,
      [null, 'Raising $E_F$ fills states: electrons up, holes down.', 'The change is exponential: 60 mV is a factor of 10, so 120 mV is 100.', 'Minority carriers change by the same factor as majority ones, in the opposite direction.'],
      md`Every 60 mV is a factor of 10, and holes move opposite to electrons: $p$ falls about $10^2$. Their product $np$ stays $n_i^2$.`),

    // ============================================================ Part 2: moving carriers
    RF(md`
      ## 2. Two ways to move: drift and diffusion

      **Drift** is motion pushed by an electric field. Holes move **along** the field, electrons **against** it, but because electrons are negative, **both drift currents point along the field**. How easily a carrier drifts is its **mobility** $\mu$: it gets pushed, scatters off the lattice and impurities, gets pushed again. Heavier doping means more impurities to bounce off, so lower mobility.

      **Diffusion** needs no field at all. Every carrier jiggles randomly. Where there are more carriers on the left than on the right, more of them happen to wander right than left, so there is a net flow **from crowded to sparse**. How fast the crowd spreads is the **diffusion coefficient** $D$.
      - Electrons diffusing to the right carry **current to the left** (negative charge).
      - Holes diffusing to the right carry current to the right.

      **On a band diagram, a field tilts the bands.** Band diagrams plot **electron** energy, so electrons roll **downhill** in $E_c$ and holes, like bubbles, float **uphill** in $E_v$. Holes move along the field, so **the field points uphill on the diagram: from where the bands are low toward where they are high.** (Electrons roll the other way, against the field.)

      [[fig:t]]

      **Where the Einstein relation comes from ($D/\mu = kT/q$).** Both numbers are set by the same scattering, so they must be linked. The cleanest argument: take a sample with uneven doping in equilibrium. Carriers pile up where the potential favors them (Boltzmann again), which creates a gradient that wants to diffuse them back. In equilibrium no current flows, so drift must exactly cancel diffusion everywhere, and that only works if $D/\mu = kT/q$. **Hot carriers jiggle harder, so they diffuse more for the same mobility.**
    `, { t: { svg: tilted, cap: 'A field tilts the bands: electrons roll down $E_c$, holes float up $E_v$. The field points uphill, toward where the bands are higher (here, to the left).' } }),
    Q(md`Electrons diffuse from left to right. Which way does their diffusion **current** point?`,
      ['to the left', 'to the right', 'along the field, whichever way it points', 'there is no current without a field'], 0,
      [null, 'That is the direction the electrons move. Their charge is negative.', 'Diffusion does not care about the field.', 'Diffusion needs only a gradient.'],
      md`Negative charge moving right is conventional current to the left. Holes diffusing right would give current to the right.`),
    Q(md`Why does heavier doping lower the mobility?`,
      ['more ionized impurities to scatter off', 'more carriers block each other', 'the gap shrinks', 'the field inside is weaker'], 0,
      [null, 'Carrier–carrier collisions are not the main effect in this course.', 'The gap is not the reason.', 'Mobility is defined per unit field.'],
      md`Charged dopant ions deflect passing carriers (ionized-impurity scattering). More of them, shorter free flights, lower $\mu$, and by Einstein, lower $D$ too.`),

    // ============================================================ Part 3: equilibrium and quasi-Fermi levels
    R(md`
      ## 3. Equilibrium, and what happens when you leave it

      **Equilibrium** means no light, no bias, nothing driving the system. Then:
      - **no net current** flows, for electrons and holes separately (drift cancels diffusion), and
      - **$E_F$ is flat** everywhere. A tilt in $E_F$ is exactly what drives a net current, so in equilibrium there can be none.

      **Out of equilibrium** (light, injection), electrons and holes no longer share one Fermi level. Each population still looks "thermal" among itself, so we give each its own: the **quasi-Fermi levels** $F_n$ (electrons) and $F_p$ (holes).
      - Their **separation** measures how far from equilibrium you are: $np$ grows by $e$ for every $kT$ of split.
      - **Current flows wherever a quasi-Fermi level tilts.** A flat $F_n$ means electron drift and diffusion cancel; a slope means net electron current. This one rule replaces "drift + diffusion" bookkeeping.
      - Under **low-level injection** the majority quasi-Fermi level barely moves (adding 1% more electrons to n-type is nothing), while the **minority** one moves a lot (doubling a tiny hole population is a big change).
    `),
    Q(md`A sample is lit uniformly. Which quasi-Fermi level moves more in n-type silicon?`,
      ['$F_p$, the minority one', '$F_n$, the majority one', 'both move equally', 'neither: light does not change Fermi levels'], 0,
      [null, 'The added electrons are a tiny fraction of the existing ones.', 'The same number of pairs is a huge fraction of the holes but a tiny fraction of the electrons.', 'Light creates excess carriers, which is exactly what splits them.'],
      md`Light adds equal numbers of electrons and holes. That is a tiny relative change for the majority electrons ($F_n$ barely moves) but a huge one for the minority holes ($F_p$ drops a lot toward $E_v$).`),

    // ============================================================ Part 4: excess carriers, lifetime, diffusion length
    RF(md`
      ## 4. Excess carriers: lifetime and diffusion length

      Shine light or inject carriers and you create **excess** electron–hole pairs. They don't last: an electron falls back into a hole (**recombination**). The average time an excess minority carrier survives is the **lifetime** $\tau$.

      **Low-level injection** (the excess is much smaller than the majority density) is the assumption that keeps this simple: recombination then depends only on how many *excess minority* carriers there are, so they decay with one clean exponential and one $\tau$.

      **Now combine diffusion with recombination.** Hold a steady excess at one surface (light on the face of a long bar). Carriers diffuse in, and while they wander they die. In steady state the profile falls off exponentially, and the distance scale is the **diffusion length**
      $$L = \sqrt{D\tau}$$

      **Where $\sqrt{D\tau}$ comes from:** a random walk spreads as the **square root of time**, not linearly. In one lifetime $\tau$, a carrier wanders about $\sqrt{D\tau}$. So $L$ is literally **how far a minority carrier gets before it recombines**.

      [[fig:d]]

      Two facts the exam loves:
      - **The current entering = all the recombination downstream.** Nothing piles up in steady state, so every carrier that diffuses in must recombine somewhere inside. The entering current is the charge of the stored excess divided by $\tau$, which equals $qD/L$ times the edge excess.
      - **Short regions (much shorter than $L$):** carriers reach the far contact before they can recombine. A contact forces the excess to zero there, so the profile becomes a **straight line**, and the gradient (current) is set by the region's length $\ell$, not by $L$. Shorter region, steeper line, **more** current, **less** stored charge.

      **Haynes–Shockley** puts all three numbers on one screen. Inject a short pulse of minority carriers into a bar with a field:
      - the pulse **drifts** along (its speed gives the **mobility**),
      - it **spreads** as it goes (its widening, growing as $\sqrt{t}$, gives **$D$**),
      - its **area shrinks** (carriers recombining) at a rate set by **$\tau$**.
      Measuring both $\mu$ and $D$ and checking $D/\mu = kT/q$ is the classic test of Einstein.
    `, { d: { svg: diffFig, cap: 'Solid: a long region, decaying over $L$. Dashed: a short region ($\\ell \\ll L$), a straight line to zero at the contact.' } }),
    RF(md`[[fig:hs]]`, { hs: { svg: hsFig, cap: 'Haynes–Shockley: the pulse moves (mobility), widens (D) and shrinks (lifetime).' } }),
    Q(md`The lifetime $\tau$ is made 4× longer. The diffusion length…`, ['doubles', 'quadruples', 'halves', 'stays the same'], 0,
      [null, 'Random-walk distance grows as the square root of time.', 'Longer life means farther, not shorter.', 'It depends on τ.'],
      md`$L = \sqrt{D\tau}$: four times the time, twice the distance. A random walk covers distance only as the square root of time.`),
    Q(md`Light holds a steady excess at the surface of a long bar. In steady state, the diffusion current entering the bar equals…`,
      ['the total recombination inside the bar', 'zero, since nothing is changing', 'the drift current from the field', 'the current at one diffusion length in'], 0,
      [null, 'Steady means unchanging, not current-free: carriers keep flowing in and dying.', 'There is no field here.', 'The current keeps falling as carriers recombine.'],
      md`Nothing accumulates, so whatever flows in must be lost to recombination somewhere inside.`),

    R(md`
      ## 4b. Why more majority carriers means a shorter minority lifetime

      Drop one extra hole into n-type material. It is surrounded by electrons, and it disappears the moment it **meets an electron to recombine with**. How long that takes depends on how many electrons are around:
      - **Twice the electrons → it finds a partner twice as fast → half the lifetime.** The minority lifetime is inversely proportional to the **majority** density: $\tau_p \propto 1/n_0$.
      - The hole population itself doesn't matter for this: there are so few holes that they almost never meet each other's partners first. That is low-level injection again.

      **The bathtub picture for a steady excess.** Light is a faucet pouring in pairs at rate $g$; recombination is the drain, emptying the excess in a time $\tau$. The water settles where in = out: **excess = $g \times \tau$**.
      - Same light, more majority carriers: same faucet, **bigger drain** (shorter $\tau$), so a **lower level**.
      - The faucet ($g$) is set by the photons absorbed, so it **does not depend on the doping**.

      **Compensated material (both donors and acceptors).** Each acceptor swallows one donor's electron, so the **carriers come from the difference**, $N_D - N_A$. But every ionized dopant, donor or acceptor, is a charged bump that **scatters** carriers, so the **mobility comes from the sum**, $N_D + N_A$. A sample with $N_D = 2.1\times10^{17}$ and $N_A = 2.0\times10^{17}$ has the electrons of a $10^{16}$ sample and the mobility of a $4.1\times10^{17}$ sample.

      ### Your Midterm 1 Problem 4, decoded

      *Light on one end of a long GaAs bar, $n_0 = 10^{15}$, $\tau = 10^{-8}$ s, steady excess $10^{14}$ at $x = 0$.*

      1. **Generation rate.** In steady state, pairs are made as fast as they die: $g = \delta/\tau = 10^{14}/10^{-8} = 10^{22}\ \text{cm}^{-3}\text{s}^{-1}$.
      2. **New bar with $n_0 = 10^{16}$, same laser.** Same faucet, so same $g$. Ten times the electrons, so each hole finds a partner ten times sooner: $\tau = 10^{-9}$ s. The level drops tenfold: $\delta = g\tau = 10^{13}$.
      3. **Third bar, $N_D = 2.1\times10^{17}$ and $N_A = 2.0\times10^{17}$.** Net electrons $10^{16}$: same as bar 2, so same $\tau = 10^{-9}$ s and same $\delta(0) = 10^{13}$. For the **mobility**, read the chart at the **total** $4.1\times10^{17}$ (much lower than at $10^{16}$). Then the chain is automatic: $D = \mu kT/q$, then $L = \sqrt{D\tau}$, then the diffusion current at the lit face $J = qD\delta(0)/L$.

      The two traps were exactly the intuitions above: forgetting that the lifetime follows the majority density, and using the net doping for the mobility.
    `),
    Q(md`Same light, but the majority density is made 4× larger. The minority lifetime and the steady excess…`,
      ['both fall 4×', 'both rise 4×', 'the lifetime falls 4×, the excess is unchanged', 'neither changes; light sets the excess'], 0,
      [null, 'More partners means faster recombination, not slower.', 'Same faucet, faster drain: the level drops too.', 'The excess is generation × lifetime, and the lifetime changed.'],
      md`Four times the partners → recombination 4× faster → $\tau$ falls 4×. The generation rate is the same, so the steady excess $g\tau$ falls 4× too.`),
    Q(md`A sample has $N_D = N_A = 10^{17}\ \text{cm}^{-3}$ (fully compensated). Compared with an undoped sample, its electron count and mobility are…`,
      ['about the same carriers, much lower mobility', 'many more carriers, lower mobility', 'about the same carriers and the same mobility', 'fewer carriers, higher mobility'], 0,
      [null, 'The donors and acceptors cancel: no net carriers are added.', 'There are now $2\\times10^{17}$ charged ions scattering carriers.', 'Compensation cannot raise the mobility.'],
      md`Carriers come from the **net** doping (zero here, so about $n_i$). Mobility comes from the **total** ions ($2\times10^{17}$), so it is much lower.`),

    // ============================================================ Part 5: the junction at equilibrium
    RF(md`
      ## 5. Building a p-n junction

      Put p-type next to n-type. Just after contact, the n side has lots of electrons and the p side lots of holes, so:
      1. **Diffusion:** electrons diffuse into the p side and holes into the n side.
      2. **They leave charge behind.** Each electron that leaves the n side uncovers a fixed **positive donor ion**; each hole that leaves the p side uncovers a **negative acceptor ion**. These ions cannot move. The strip they occupy is stripped of mobile carriers: the **depletion region**.
      3. **That charge makes a field**, pointing from the + (n) side to the − (p) side. The field drives a drift current **opposite** to the diffusion current.
      4. **Equilibrium** is reached when drift exactly cancels diffusion, for electrons and for holes separately. At that moment $E_F$ is flat across the whole device.

      [[fig:eq]]

      **Where the contact potential $V_0$ comes from.** Before contact the two Fermi levels sat at different heights: high in the n side, low in the p side. Contact forces them to line up, so the bands must bend by exactly that difference:
      $$qV_0 = (\text{how far } E_F \text{ sits above } E_i \text{ in n}) + (\text{how far } E_F \text{ sits below } E_i \text{ in p})$$
      Equivalently: in equilibrium the carriers on either side are related by Boltzmann across the barrier, so the ratio of holes on the p side to holes on the n side is $e^{qV_0/kT}$.

      What raises $V_0$, and why:
      - **More doping** on either side: that side's $E_F$ moves closer to its band edge, so the Fermi levels started farther apart.
      - **Wider gap** (same doping): $n_i$ is smaller, so the same doping pushes $E_F$ farther from midgap.
      - **Lower temperature**: $n_i$ drops, same effect.
      - It can never exceed about $E_g/q$ for normal doping: both Fermi levels stay inside the gap.

      **You can't measure $V_0$ with a voltmeter.** The metal contacts at the two ends have their own contact potentials that exactly cancel it. If they didn't, a diode in the dark would be a battery.
    `, { eq: { svg: F.pnBands(0, { w: 320, h: 160 }), cap: 'Equilibrium: $E_F$ flat, the bands step by $qV_0$ across the depletion region (p on the left, higher).' } }),
    Q(md`Two junctions are identical except one is GaAs (larger gap) and one is Si. Which has the larger $V_0$?`,
      ['GaAs', 'Si', 'they are equal, since doping is the same', 'cannot tell'], 0,
      [null, 'Smaller gap means larger $n_i$, which brings both Fermi levels toward midgap.', 'Same doping, but $n_i$ differs by many orders of magnitude.', 'The trend is clear: smaller $n_i$, larger $V_0$.'],
      md`A wider gap means a much smaller $n_i$, so the same doping places each Fermi level much farther from midgap: the step $qV_0$ is bigger. (FA15 Exam 2 problem 1c asks exactly this.)`),

    // ============================================================ Part 6: inside the depletion region
    RF(md`
      ## 6. Inside the depletion region: charge, field, potential

      **The depletion approximation** (the assumptions behind every formula here):
      1. inside the region, **no mobile carriers at all**, only ionized dopants;
      2. the region has **sharp edges**;
      3. outside it, the material is **neutral**: no charge, no field.

      Then everything follows from one chain, each step the "running total" of the one before (Gauss's law, then the definition of potential):
      - **Charge** is a block of $+qN_d$ on the n side and $-qN_a$ on the p side.
      - **Field** = running sum of the charge: it climbs linearly through each block, **peaks at the metallurgical junction**, and is zero at both edges. A triangle.
      - **Potential** = running sum of the field: two joined parabolas, total height $V_0$ (the area of the triangle).

      [[fig:cfp]]

      **Why the depletion region pushes into the lighter side.** The total positive and negative charge must balance (the field must die at both edges). A lightly doped side has fewer ions per length, so it must deplete **farther** to uncover the same charge: $N_ax_p = N_dx_n$. In a $p^+n$ junction almost all of $W$, and almost all of the voltage, sits on the n side.

      **Where $W \propto \sqrt{V/N}$ comes from.** The potential across the region is (½ × peak field × width), and the peak field is (charge per area)/$\epsilon$, which is itself ∝ $N \times W$. So voltage ∝ $N W^2$, and $W \propto \sqrt{V/N}$. More voltage needs more uncovered charge, so a wider region; heavier doping uncovers charge faster, so a thinner one.

      **Handy shortcut:** peak field = $2V/W$, since the triangle's area is the voltage.

      **Other doping profiles:** each integration raises the power by one. A **linearly graded** junction has charge that rises linearly through the junction, so its field is a **parabola** and its potential a **cubic**.
    `, { cfp: Object.assign(F.chargeFieldPot(), { cap: 'Abrupt junction (p on the left, $N_a = 5N_d$): equal charge areas, a triangular field, parabolic potential.' }) }),
    RF(md`[[fig:gr]]`, { gr: Object.assign(graded, { cap: 'Linearly graded junction: charge linear → field quadratic → potential cubic.' }) }),
    Q(md`A $p^+n$ junction: where does most of the contact potential drop?`,
      ['across the lightly doped n side', 'across the heavily doped p⁺ side', 'equally on both sides', 'in the neutral regions'], 0,
      [null, 'The p⁺ side depletes only a tiny distance.', 'Equal split needs equal doping.', 'Neutral regions have no field, so no voltage drop.'],
      md`The depletion region (and so the field triangle's area) lies almost entirely in the light side.`),
    Q(md`A junction's reverse voltage is raised so that $V_0 + V_R$ quadruples. The depletion width…`, ['doubles', 'quadruples', 'halves', 'stays the same'], 0,
      [null, 'W grows as the square root of the voltage.', 'Reverse bias widens it.', 'It depends on voltage.'],
      md`$W \propto \sqrt{V_0 + V_R}$: four times the voltage, twice the width.`),

    // ============================================================ Part 7: bias
    RF(md`
      ## 7. Applying a voltage: the barrier and the law of the junction

      **Where the applied voltage goes.** The depletion region has almost no carriers, so it is by far the most resistive part. Practically **all of the applied voltage drops across it**; the neutral regions barely notice.
      - **Forward bias** (p side positive) **lowers** the barrier to $V_0 - V$. The depletion region **narrows**.
      - **Reverse bias** **raises** it to $V_0 + V_R$. The depletion region **widens**.
      - The quasi-Fermi levels separate by exactly $qV$ across the depletion region.

      [[fig:fr]]

      **The law of the junction (where the exponential comes from).** A barrier of height $q(V_0 - V)$ lets through a fraction of carriers that falls by $e$ for every $kT$ of height (Boltzmann, again). Lower the barrier by $qV$ and $e^{qV/kT}$ times more majority carriers make it over. So the **minority** concentration at each depletion edge becomes its equilibrium value times $e^{qV/kT}$:
      - forward: the edge minority density is **multiplied** (huge excess, injection);
      - reverse: it is pushed nearly to **zero** (a deficit, extraction).
      **Assumption:** low-level injection, and the carriers in the depletion region stay in quasi-equilibrium (the depletion region is thin compared with $L$).
    `, { fr: { svg: PF.row([{ svg: F.pnBands(0.4, { w: 230, h: 140 }), cap: 'forward: barrier lower, $F_n$ and $F_p$ split by $qV$' }, { svg: F.pnBands(-0.8, { w: 230, h: 140 }), cap: 'reverse: barrier higher, W wider' }]).svg, cap: '' } }),

    // ============================================================ Part 8: diode current
    RF(md`
      ## 8. Where the diode current comes from

      Put Sections 4 and 7 together. Forward bias injects an excess of minority carriers at each depletion edge. Each excess **diffuses away into its neutral region and recombines within a diffusion length**: exactly the "steady injection at a surface" problem of Section 4. The current is that diffusion current at the edge:
      - it is ∝ the edge excess, so ∝ $(e^{qV/kT} - 1)$;
      - its size is set by how many **minority carriers** sit there in equilibrium ($n_i^2/N$), times $D/L$.

      [[fig:pr]]

      Consequences that come up on every exam:
      - **The lightly doped side dominates the current.** Its minority density $n_i^2/N$ is the largest. In a $p^+n$ diode, almost all the current is **holes injected into the n side**.
      - **Heavier doping → smaller saturation current**, because the minority densities shrink. **Wider gap or lower temperature → far smaller** (∝ $n_i^2$).
      - **Reverse current** is tiny and flat: minority carriers that wander (thermally generated) to the edge of the depletion region within about a diffusion length get swept across by the field. It doesn't grow with reverse voltage because the supply, not the field, limits it.
      - **Who carries the current where.** Near the junction the current is minority diffusion. Far away the minority carriers have recombined, and the same total current is carried by **majority drift**, supplied from the contacts. The total is constant everywhere.
      - **Stored charge.** The excess minority carriers in the neutral region are a stored charge $Q$. Each lives $\tau$, so the current must replace them at rate $Q/\tau$: **$I = Q/\tau$**.

      **Narrow-base diode** (neutral region much shorter than $L$): the profile becomes a straight line to the contact (Section 4). The current is set by the length $\ell$ instead of $L$, so it is **larger**, the stored charge is **smaller**, and most injected carriers recombine **at the contact**, not in the region. Faster switching for free.

      **Real diodes deviate:** at low forward current, recombination inside the depletion region adds current (it rises more slowly, like $e^{qV/2kT}$); at high current, high-level injection and the series resistance of the neutral regions make the curve bend over toward a straight line. And the junction voltage can never exceed $V_0$.
    `, { pr: { svg: F.edgeProfiles(true), cap: 'Forward bias: excess minority carriers at each edge, decaying over a diffusion length into each neutral region.' } }),
    Q(md`A Si diode's doping is raised on **both** sides from $10^{17}$ to $10^{19}\ \text{cm}^{-3}$. Its reverse saturation current…`, UP3, 1,
      ['Heavier doping shrinks the minority densities $n_i^2/N$.', null, 'The minority densities fall 100×.'],
      md`$I_0 \propto n_i^2/N$ on each side: 100× the doping, about 100× less current (a little less than that, since $D$ also falls). That is FA15 problem 3a and the spring 2003 exam's logic too.`),
    Q(md`In a $p^+n$ diode under forward bias, which carriers carry most of the current across the junction?`,
      ['holes injected into the n side', 'electrons injected into the p⁺ side', 'majority electrons drifting in the n side', 'both equally'], 0,
      [null, 'The p⁺ side has almost no minority electrons to offer.', 'Far from the junction yes, but across it the current is injection.', 'Only for equal doping.'],
      md`The minority density on the light (n) side, $n_i^2/N_d$, dwarfs $n_i^2/N_a$, so hole injection dominates.`),

    // ============================================================ Part 9: breakdown
    RF(md`
      ## 9. Reverse breakdown: Zener and avalanche

      Push reverse bias far enough and the current suddenly takes off. Two mechanisms:

      **Zener (tunneling).** Both sides heavily doped → a **very thin** depletion region and a huge field. The valence band on the p side ends up level with the empty conduction band on the n side, only a few nanometers away, and electrons **tunnel** straight through.
      - Needs heavy doping; happens at **low** voltage.
      - As temperature rises the gap shrinks, so tunneling gets easier: $V_{br}$ **falls** with temperature.

      **Avalanche (impact ionization).** Lighter doping → a wide depletion region. A carrier accelerated by the field gains enough energy between collisions to **knock loose a new electron–hole pair**, and each of those does the same: a chain reaction.
      - Happens at **higher** voltage, and lighter doping pushes it higher still (the field builds up more slowly in a wide region).
      - Hotter crystals scatter carriers more, so they gain less energy between collisions: $V_{br}$ **rises** with temperature.
      - **Wider-gap materials** need more energy per new pair, so they break down at higher voltage (GaP > GaAs > Si > Ge on the chart).

      **Punch-through** is a third way: if one side is physically short, the depletion region reaches the far end of it before the field gets big enough for avalanche. Check it by comparing $W$ at the avalanche voltage with the region's length.

      [[fig:iv]]
    `, { iv: { svg: ivFig, cap: 'A diode I–V: exponential forward, tiny flat reverse current, then breakdown at $-V_{br}$.' } }),
    Q(md`Raising the doping of a junction makes breakdown…`,
      ['happen at a lower voltage, and more likely by tunneling', 'happen at a higher voltage, by avalanche', 'disappear', 'independent of doping'], 0,
      [null, 'Heavier doping thins the depletion region and raises the field.', 'Breakdown always exists in reverse bias.', 'Doping is what sets it.'],
      md`Thinner $W$ and a higher field at a given voltage: breakdown comes sooner, and a thin enough barrier lets electrons tunnel (Zener).`),

    // ============================================================ Part 10: capacitance and switching
    R(md`
      ## 10. Capacitance and switching

      **Junction (depletion) capacitance.** The depletion region is two sheets of fixed charge separated by $W$: a parallel-plate capacitor, $C_j = \epsilon A/W$.
      - Reverse bias widens $W$, so $C_j$ **drops** (a varactor is a diode used as a voltage-tuned capacitor).
      - Heavier doping makes $W$ thinner, so $C_j$ is **larger**: a $p^+n^+$ diode has the biggest $C_j$, then $p^+n$, then $pn$ (FA15 problem 4c).
      - For a one-sided junction, $1/C_j^2$ is a **straight line** vs reverse voltage: the slope gives the light-side doping, and it extrapolates to zero at $-V_0$.

      **Storage (diffusion) capacitance.** In forward bias, the stored minority charge $Q = I\tau$ changes when the voltage changes. That looks like a capacitor too, and it is far bigger than $C_j$ at forward bias (nanofarads at milliamps). It vanishes in reverse bias.

      **Switching off a diode.** You can't turn it off instantly: the stored minority charge must first be removed (pulled back out or recombined). During that **storage delay** the junction stays forward biased and a reverse current flows. To switch faster: shorter lifetime (e.g. gold doping), a narrow base (less stored charge), or a **Schottky diode**, which stores no minority charge at all.
    `),
    Q(md`Which change increases a diode's **reverse-bias** capacitance?`,
      ['heavier doping on the lightly doped side', 'more reverse voltage', 'longer minority lifetime', 'a wider-gap semiconductor at the same doping'], 0,
      [null, 'More reverse voltage widens W and lowers C.', 'Lifetime affects storage capacitance, which is zero in reverse bias.', 'The gap barely changes W.'],
      md`$C_j = \epsilon A/W$, and heavier doping on the light side (which sets $W$) makes $W$ thinner.`),

    // ============================================================ Part 11: metal-semiconductor
    RF(md`
      ## 11. Metal on semiconductor: Schottky or ohmic?

      Bring a metal and a semiconductor together and, like any junction, their Fermi levels must line up. **Electrons flow from whichever side has the higher Fermi level** (the smaller work function $\phi$) into the other, until they match.

      **Metal on n-type with $\phi_m > \phi_s$:** electrons leave the semiconductor for the metal. They leave behind positive donors: a depletion region, and the bands bend **up** toward the interface.
      - From the semiconductor, electrons see a barrier $qV_0 = \phi_m - \phi_s$. **Bias changes this one.**
      - From the metal, electrons see the **Schottky barrier** $\phi_B = \phi_m - \chi$ (work function minus electron affinity). **Bias does not change this one**: it is pinned at the interface.
      - Result: a **rectifying** contact, a Schottky diode.

      [[fig:ms]]

      **The other cases:**
      - n-type with $\phi_m < \phi_s$: electrons pile up at the surface, no barrier: **ohmic**.
      - p-type: everything flips. $\phi_m < \phi_s$ is rectifying (a barrier for holes), $\phi_m > \phi_s$ is ohmic.
      - In practice, ohmic contacts are made by **heavily doping the surface**: the depletion region becomes so thin that carriers tunnel through any barrier.

      **Why a Schottky diode is different from a p-n diode.** Current is **majority** carriers hopping over the barrier (thermionic emission), not minority injection. So there is no stored minority charge (very fast switching), and the saturation current is much larger (it depends on $e^{-\phi_B/kT}$), so it turns on at a **lower** forward voltage. Forward bias means making the **metal positive** relative to n-type silicon.
    `, { ms: { svg: msRect, cap: 'Metal on n-Si with $\\phi_m > \\phi_s$: bands bend up, a barrier forms, the contact rectifies.' } }),
    Q(md`A Schottky diode's metal work function is lowered by 0.12 eV (same semiconductor). At the same forward voltage, the current…`,
      ['rises about 100×', 'falls about 100×', 'rises by 12%', 'does not change'], 0,
      [null, 'A lower barrier lets more electrons over.', 'The current is exponential in the barrier height.', '$\\phi_B$ sets the saturation current.'],
      md`$\phi_B = \phi_m - \chi$ drops 0.12 eV, and the current scales as $e^{0.12/0.0259} \approx 100$. (Spring 2003 problem 8b.)`),

    // ============================================================ Part 12: light
    RF(md`
      ## 12. Junctions and light

      **Absorption.** A photon can make an electron–hole pair only if its energy is at least $E_g$: wavelengths shorter than $1.24\ \mu\text{m}/E_g(\text{eV})$. Above the gap, absorption is strong and the light dies within about $1/\alpha$.

      **Photodiodes and solar cells.** Pairs generated in the depletion region, or within about a diffusion length of it (so they can diffuse to its edge before recombining), are **pulled apart by the built-in field**: electrons to the n side, holes to the p side. That is a current flowing in the **reverse direction**, the photocurrent. The lit I–V curve is the dark curve **shifted straight down** by it.
      - **Photodetector:** reverse biased, in the **third quadrant**. The current is proportional to the light. A wide intrinsic layer (**p-i-n**) puts most of the absorption inside the field region: more efficient, and fast because carriers drift instead of diffusing.
      - **Solar cell:** **fourth quadrant**, positive voltage with negative current, so it **delivers power**. Short-circuit current $I_{sc}$ (where the curve crosses $V = 0$) is the photocurrent. Open-circuit voltage $V_{oc}$ (where it crosses $I = 0$) is where forward injection exactly cancels the photocurrent: it grows only **logarithmically** with light and stays below $V_0$. Cells in **series** add voltage; in **parallel** they add current.

      [[fig:sc]]

      **LEDs.** Forward bias injects minority carriers; when they recombine **radiatively** they emit a photon of about $E_g$. Needs a **direct** gap (GaAs and other III–Vs); in indirect Si and Ge recombination needs a phonon and makes heat instead. Alloys (AlGaAs, GaAsP…) tune the gap and so the color. **Quantum efficiency** = photons out per electron in.

      **Lasers.** Three processes connect two levels: **absorption** (photon in, electron up), **spontaneous emission** (electron falls on its own, random direction and phase), **stimulated emission** (a photon triggers an electron to fall and emit an **identical** photon: same frequency, direction, phase). In steady state, absorption = spontaneous + stimulated.
      - For **gain**, stimulated emission must beat absorption: more electrons up than down, **population inversion**. In a junction that means $F_n - F_p > E_g$: degenerately doped sides and strong forward bias.
      - An **optical cavity** (cleaved facets as mirrors) feeds photons back so stimulated emission builds up.
      - LED vs laser: spontaneous vs stimulated, incoherent vs coherent, broad vs very narrow spectrum.
    `, { sc: { svg: solar, cap: 'Light shifts the I–V curve down: photodiodes work in the 3rd quadrant, solar cells in the 4th (they deliver power).' } }),
    Q(md`A solar cell is lit twice as brightly. What happens to $I_{sc}$ and $V_{oc}$?`,
      ['$I_{sc}$ doubles; $V_{oc}$ rises only slightly', 'both double', '$V_{oc}$ doubles; $I_{sc}$ is unchanged', 'both rise only slightly'], 0,
      [null, '$V_{oc}$ grows with the logarithm of the light.', 'The current is set by how many pairs are made.', 'The photocurrent is proportional to the light.'],
      md`Twice the pairs, twice the photocurrent. $V_{oc}$ is where forward injection, exponential in voltage, cancels it, so it rises by only $kT/q \cdot \ln 2 \approx 18$ mV.`),

    // ============================================================ Part 13: assumptions
    R(md`
      ## 13. The assumptions, all in one place

      | Assumption | What it buys you | When it fails |
      |---|---|---|
      | Complete ionization | $n = N_d$, $p = N_a$ | very low temperature (freeze-out) |
      | Nondegenerate doping | Boltzmann statistics, $np = n_i^2$ | very heavy doping, $E_F$ in a band |
      | Low-level injection | one lifetime, majority density unchanged | excess comparable to majority |
      | Depletion approximation | box charge, triangle field, $W \propto \sqrt{V/N}$ | near the edges (smooth in reality) |
      | All voltage drops across the depletion region | barrier $= V_0 - V$ | high current: series resistance |
      | No recombination inside the depletion region | ideal diode, $e^{qV/kT}$ | low forward current |
      | Long neutral regions ($\gg L$) | exponential profiles, $I_0 \propto D/L$ | narrow base: use $\ell$ instead |
      | Abrupt junction | uniform doping blocks | graded junctions (cubic potential) |
    `),

  ];

  // ============================================================ the past exams
  // Built fresh on each call, so the copy on the one-page lesson and the exam's own page never share step objects.
  // The first step of each exam is its PDF links (the PDF builder skips steps marked pdfLinks).
  const pdfLinks = (id) => Object.assign(R(md`**Test it like the real thing:** [Exam PDF (blank)](pdf/${id}.pdf) · [Answer key PDF](pdf/${id}-key.pdf). Print it or open it on a tablet, set a 60-minute timer, then check with the key or the problems below.`), { pdfLinks: true });

  // ---------------------------------------------------------------- the recent Exam 2 (likely Fall 2024)
  // Problem 1 redrawn: metal (x < 1) | n (1–3) | p (3–5) | metal (x > 5); n lighter than p; EF = 0 for the bands.
  const mnpm = (() => {
    const rho = (x) => (x > 0.82 && x < 1 ? -1.1 : x >= 1 && x < 1.5 ? 0.4 : x >= 2.2 && x < 3 ? 0.4 : x >= 3 && x < 3.4 ? -0.8 : 0);
    const n = 1200, dx = 6 / n, E = [0], V = [0];
    for (let i = 1; i <= n; i++) E[i] = E[i - 1] + rho((i - 0.5) * dx) * dx;
    for (let i = 1; i <= n; i++) V[i] = V[i - 1] - 0.5 * (E[i] + E[i - 1]) * dx;
    const at = (arr) => (x) => arr[Math.max(0, Math.min(n, Math.round(x / dx)))];
    const T = [[1, 'A'], [3, 'B'], [5, 'C']], VL = [[1, ''], [5, '']];
    const r = BD.prof({ w: 300, h: 140, x: [0, 6], y: [-1.2, 0.6], xl: 'x', yl: '\\rho', zero: true, xt: T, vlines: VL, curves: [{ f: rho, n: 1200 }] });
    const e = BD.prof({ w: 300, h: 140, x: [0, 6], y: [-0.3, 0.42], xl: 'x', yl: '\\mathscr{E}', zero: true, xt: T, vlines: VL, curves: [{ f: at(E) }] });
    const v = BD.prof({ w: 300, h: 140, x: [0, 6], y: [-0.16, 0.1], xl: 'x', yl: 'V', zero: true, xt: T, vlines: VL, curves: [{ f: at(V) }] });
    const Ec = (x) => (x < 1.5 ? 0.35 + 0.45 * ((1.5 - x) / 0.5) ** 2 : x < 2.2 ? 0.35 : x < 3 ? 0.35 + 0.4 * ((x - 2.2) / 0.8) ** 2 : x < 3.4 ? 0.95 - 0.2 * ((3.4 - x) / 0.4) ** 2 : 0.95);
    const bands = BD.prof({ w: 340, h: 230, x: [0, 6], y: [-1.25, 1.1], xl: 'x', yl: 'E', xt: T, vlines: VL,
      curves: [{ f: () => 0, lab: 'E_F', labAt: 0.1, dx: 0, dy: -8, anchor: 'bl' }, { f: Ec, from: 1, to: 5, lab: 'E_c', labAt: 5, dy: -6 }, { f: (x) => Ec(x) - 0.55, from: 1, to: 5, cls: 'dash', lab: 'E_i', labAt: 5, dy: -6 },
        { f: (x) => Ec(x) - 1.1, from: 1, to: 5, lab: 'E_v', labAt: 5, dy: -6 }],
      pts: [{ x: 1, y: 0.8, lab: 'q\\phi_B', anchor: 'bl' }] });
    return { cfv: PF.row([{ svg: r, cap: 'charge' }, { svg: e, cap: 'field' }, { svg: v, cap: 'potential' }]), bands };
  })();

  const f24 = (inPage) => [
    ...(inPage ? [R(md`## 14. The most recent Exam 2 (likely Fall 2024), for intuition`)] : []),
    pdfLinks('e2-f24'),
    RF(md`
      Three problems, 60 minutes. Almost everything is a **sketch with reasons**, which is exactly what this page trains. This is the closest thing to tonight's exam on the site: do it under a timer first.

      ### Problem 1 · Junctions at equilibrium and metal–semiconductor junctions

      An n-p junction with a metal contact on each side. The red line separates the n and p regions. Silicon: $E_g = 1.1$ eV, $E_i$ at midgap ($0.55$ eV below $E_c$), $\chi = 4$ eV. In the n region $E_F - E_i = 0.2$ eV; in the p region $E_i - E_F = 0.4$ eV; the left metal has $\phi_M^L = 4.8$ eV. **You do not need numbers, but you must show relative magnitudes and directions.**

      [[fig:st]]
    `, { st: scan('f24-structure', 'metal contact (work function 4.8 eV) from 0 to A, n-type from A to B, p-type from B to C, metal contact with unknown work function after C', 460, 'Metal | n | p | metal. A and C are the metal contacts, B the metallurgical junction.') }),
    P({ src: 'Recent Exam 2 · 1a', pdfSketch: true, q: md`Sketch (1) the charge density, (2) the electric field and (3) the potential through regions $0 \to A$, $A \to B$ and $B \to C$, labeling the depletion widths.`,
      parts: [FIX('At contact A, electrons flow', ['from the n side into the metal', 'from the metal into the n side'], 0, [null, 'The metal Fermi level sits deeper (4.8 eV vs 4.35 eV), so electrons fall into the metal.']),
        FIX('So at A the n side holds', ['a layer of + donors; the metal a thin − sheet', 'a layer of − charge; the metal a + sheet'], 0, [null, 'The n side lost electrons, uncovering donors.']),
        FIX('At B, the wider, lower charge block is on the', ['n side', 'p side'], 0, [null, 'The n side is lighter: its $E_F$ is only 0.2 eV from $E_i$ (vs 0.4).']),
        FIX('The field at A points', ['−x (toward the metal)', '+x'], 0, [null, 'Field points from + (n side) to − (metal on the left).']),
        FIX('The field at B points', ['+x (from n to p)', '−x'], 0, [null, 'Field points from + (n, left) to − (p, right).']),
        FIX('Across A the potential', ['rises', 'falls'], 0, [null, 'Potential rises going against the field, and here you move against it.']),
        FIX('Across B the potential', ['rises', 'falls'], 1, ['You move along the field at B: the potential falls.', null]),
        N('\\text{step at A}', 0.45, 'V', 0.03), N('\\text{step at B } (V_0)', 0.6, 'V', 0.03)],
      hints: ['Turn every given into a work function: $\\phi_S = \\chi + (E_c - E_F)$. For the n side, $E_c - E_F = 0.55 - 0.2$.', 'Electrons always flow toward the deeper Fermi level (larger work function) and leave + charge behind.'],
      sol: md`**Start every metal–semiconductor problem by turning everything into work functions**, i.e. Fermi-level depths below vacuum:
- n side: $E_c - E_F = 0.55 - 0.2 = 0.35$ eV, so $\phi_{S,n} = 4 + 0.35 = 4.35$ eV.
- left metal: $4.8$ eV, deeper. **Electrons fall toward the deeper Fermi level**, so they leave the n side for the metal.

**Charge.** At A the n side loses electrons and is left with **+ donors** over a finite width; the metal gains a **razor-thin − sheet** (a metal has so many electrons that its extra charge sits right at the surface). At B electrons flow from n to p (the n-side $E_F$ is higher), leaving + on the n side and − on the p side. The n side is lighter ($E_F$ only 0.2 eV from $E_i$, versus 0.4 on the p side), so its block is **wider and lower**; the p block is narrow and tall. Equal areas at each junction.

**Field** = running total of the charge, pointing from + to −: at A from the n side toward the metal (**−x, a downward triangle**), at B from n to p (**+x, an upward triangle**). Zero in the neutral middle of each region.

**Potential** rises when you walk against the field: it **rises** across A by $\phi_M^L - \phi_{S,n} = 4.8 - 4.35 = 0.45$ V and **falls** across B by $V_0 = 0.2 + 0.4 = 0.6$ V. The drop is bigger than the rise, so the right end sits lower than the left. (The key stresses exactly this: values not needed, but the drop must be drawn bigger than the rise.)

[[fig:cfv]]`, figs: { cfv: Object.assign(mnpm.cfv, { cap: 'Charge (thin − sheet in the metal, + in the n side; + then − at B), field (down at A, up at B), potential (up 0.45 at A, down 0.6 at B).' }) } }),
    P({ src: 'Recent Exam 2 · 1b', pdfSketch: true, q: md`Sketch the energy bands in each region. Label $E_c$, $E_v$, $E_i$, the contact potentials $V_0$, the barrier $\phi_B$ at the metal–semiconductor contact if present, the vacuum level, $\phi_M$, $\chi$ and $\phi_S$.`,
      parts: [N('\\phi_{S,n}', 4.35, 'eV', 0.01), N('\\phi_B\\ (\\text{at A})', 0.8, 'eV', 0.02),
        FIX('Near A, the n-side bands bend', ['up toward the metal ($E_c$ moves away from $E_F$)', 'down toward the metal'], 0, [null, 'The n side near A lost electrons, so $E_c$ must move away from $E_F$.']),
        FIX('$E_F$ through the whole structure is', ['flat', 'tilted at A and B'], 0, [null, 'Equilibrium: no current, so the Fermi level is flat everywhere.'])],
      sol: md`**Rules that draw the diagram for you:**
1. Equilibrium → **$E_F$ is one flat line** through metal, n, p and metal.
2. Far from each junction, place the bands where the doping puts them: $E_c$ 0.35 eV above $E_F$ in the n region, $E_c$ 0.95 eV above it in the p region ($E_i$ 0.4 eV above $E_F$).
3. Where a region **lost electrons** (the n side at A and at B), its $E_c$ moves **away** from $E_F$: the bands bend up. Where it **gained** electrons (the p side at B), its $E_c$ moves **toward** $E_F$. Walking left to right: a climb at A, flat across the neutral n region, a second climb across B, flat in the p region.
4. $E_c$, $E_v$, $E_i$ and the vacuum level all bend together (same gap, same $\chi$).

Labels: $\phi_B = \phi_M^L - \chi = 4.8 - 4.0 = 0.8$ eV is the barrier an electron in the metal sees at A (fixed, bias does not move it). $qV_0 = 0.45$ eV at A (seen from the n side) and $qV_0 = 0.6$ eV at B. The vacuum level sits $\chi = 4$ eV above $E_c$ everywhere; $\phi_S$ is the drop from vacuum to $E_F$ (4.35 eV on the n side, 4.95 eV on the p side).

[[fig:bd]]`, figs: { bd: { svg: mnpm.bands, cap: 'Bands climb 0.45 eV at A (barrier $\\phi_B = 0.8$ eV from the metal side) and 0.6 eV across B; $E_F$ is flat throughout.' } } }),
    P({ src: 'Recent Exam 2 · 1c', q: md`We want the contact on the right-hand side to be **ohmic**. Give the range of $\phi_M^R$ that makes it ohmic. Numbers required.`,
      parts: [N('\\phi_{S,p}', 4.95, 'eV', 0.01), FIX('Ohmic when', ['$\\phi_M^R > 4.95$ eV', '$\\phi_M^R < 4.95$ eV'], 0, [null, 'For p-type that would deplete holes: a barrier.'])],
      sol: md`$\phi_{S,p} = \chi + \tfrac{E_g}{2} + (E_i - E_F) = 4 + 0.55 + 0.4 = 4.95$ eV, so **$\phi_M^R > 4.95$ eV**.

**The intuition, so you never memorize the table:** a contact is ohmic when the **majority carriers pile up** at the surface instead of being depleted. For p-type the majority carriers are holes; you get extra holes when electrons **leave** the semiconductor, i.e. when the metal's Fermi level is **deeper** ($\phi_M > \phi_S$). For n-type it is the reverse: you want electrons to flow **in**, so $\phi_M < \phi_S$. (That is why contact A, 4.8 > 4.35 on n-type, came out rectifying.)` }),

    RF(md`
      ### Problem 2 · Junctions under bias, and junction capacitance

      An n-p junction with $N_d = 5\times10^{16}\ \text{cm}^{-3}$ and $N_a = 10^{17}\ \text{cm}^{-3}$. **The n region is on the left.**

      [[fig:ci]]
    `, { ci: scan('f24-circuit', 'two circuits: (a) battery minus on the n side, plus on the p side; (b) plus on the n side, minus on the p side', 460, 'Figure 1. (a) n side held at −0.5 V relative to p. (b) n side held at +2.4 V relative to p.') }),
    P({ src: 'Recent Exam 2 · 2a (9 pts)', pdfSketch: true, q: md`The n region is held at $-0.5$ V relative to the p region (Fig. 1a). Forward or reverse biased? Sketch the minority-carrier distributions on both sides, labeling $p_n$, $n_p$, $\Delta p_n$ and $\Delta n_p$. Which is larger, $p_n$ or $n_p$? $\Delta p_n$ or $\Delta n_p$?`,
      parts: [FIX('The junction is', ['forward biased', 'reverse biased'], 0, [null, 'The p side is 0.5 V above the n side.']),
        FIX('Larger equilibrium minority density', ['$p_n$', '$n_p$'], 0, [null, 'The n side is the lighter one, so it has more minority carriers.']),
        FIX('Larger edge excess', ['$\\Delta p_n$', '$\\Delta n_p$'], 0, [null, 'Both edges get the same factor $e^{qV/kT}$.'])],
      sol: md`**Forward:** p is 0.5 V above n, which lowers the barrier.
**$p_n > n_p$:** minority density is $n_i^2/N$, and the n side is the more lightly doped ($5\times10^{16}$ vs $10^{17}$): $p_n = 4500$, $n_p = 2250\ \text{cm}^{-3}$, a factor of 2.
**$\Delta p_n > \Delta n_p$:** the law of the junction multiplies **both** edges by the same $e^{qV/kT}$ ($\approx 2.4\times10^8$ at 0.5 V), so the excesses keep the same 2:1 ratio ($\approx 1.1\times10^{12}$ vs $5.4\times10^{11}$). Each excess decays into its neutral region over a diffusion length.

[[fig:mi]]`, figs: { mi: scan('f24-minority', 'hole excess rising toward the junction on the n side, larger than the electron excess decaying from the junction on the p side', 400, '$\\Delta p_n$ is twice $\\Delta n_p$; both decay over a diffusion length away from the junction.') } }),
    P({ src: 'Recent Exam 2 · 2b (8 pts)', pdfSketch: true, q: md`Same bias. Draw the electron and hole current components $I_n$ and $I_p$ in both the n and p regions, paying attention to which is larger.`,
      parts: [FIX('Across the depletion region, the larger component is', ['$I_p$ (holes)', '$I_n$ (electrons)'], 0, [null, 'More holes are injected (Δp_n = 2Δn_p).']),
        FIX('Deep in the n region, the current is carried by', ['electrons (majority drift)', 'holes'], 0, [null, 'The injected holes have recombined by then.']),
        FIX('The total current', ['is the same everywhere', 'is largest at the junction'], 0, [null, 'Charge does not pile up in steady state.'])],
      sol: md`Three facts draw this plot:
1. **The total is constant everywhere** (steady state, nothing piles up): a flat line.
2. **At the depletion edges the current is minority injection**, and holes win, $I_p \approx \tfrac23 I$, $I_n \approx \tfrac13 I$, because $\Delta p_n = 2\Delta n_p$ (same $D/L$ assumed). Both are flat across the thin depletion region (no recombination there).
3. **Moving away from the junction, the minority current dies** over a diffusion length as those carriers recombine, and the **majority current grows** to make up the total: each recombining hole in the n region needs an electron, supplied by majority drift from the contact.

[[fig:cu]]`, figs: { cu: scan('f24-currents', 'total current flat; on the n side Ip decays away from the junction and In grows; across the depletion region Ip about two thirds, In one third; on the p side In decays and Ip grows', 420, 'Minority diffusion near the junction hands off to majority drift far away; the total stays flat.') } }),
    P({ src: 'Recent Exam 2 · 2c (8 pts)', pdfSketch: true, q: md`Same bias. Draw the band diagram with the quasi-Fermi levels. Label $E_c$, $E_v$, the Fermi levels $E_{Fn}$, $E_{Fp}$ and the quasi-Fermi levels $F_n$, $F_p$. Show the applied voltage relative to the Fermi levels and the built-in potential.`,
      parts: [FIX('The bands are higher on the', ['p side (right)', 'n side (left)'], 0),
        FIX('The barrier is', ['$q(V_0 - 0.5)$', '$q(V_0 + 0.5)$', '$qV_0$'], 0, [null, 'Forward bias lowers it.', 'Bias changes the barrier.']),
        FIX('Across the depletion region, $F_n - F_p$', ['$= 0.5$ eV', '$= qV_0$', '$= 0$'], 0, [null, 'The split equals the applied voltage.', 'That is equilibrium.']),
        FIX('$F_p$ (holes) drops back to $E_{Fn}$ over', ['a hole diffusion length into the n region', 'the depletion region', 'the whole p region'], 0)],
      sol: md`**How to draw it:** bands higher on the p side (right) by $q(V_0 - V) = q(0.8 - 0.5)$. In each neutral region far away there is just one Fermi level ($E_{Fn}$ on the left, $E_{Fp}$ on the right), $qV = 0.5$ eV apart.
- **$F_n$** (electrons) stays flat from the n region **across the depletion region** (low-level injection: the majority level barely moves, and carriers cross quickly), then **falls** to $E_{Fp}$ over about $L_n$ inside the p region as the injected electrons recombine.
- **$F_p$** (holes) does the mirror image: flat from the p region across the depletion region, then **rises** to $E_{Fn}$ over about $L_p$ in the n region.
- Their split inside the depletion region is exactly $qV$: that split *is* the applied voltage.

[[fig:qf]]`, figs: { qf: scan('f24-qfl', 'band diagram n on the left: Fn flat then falling in the p region, Fp falling from E_Fn in the n region then flat', 440, '$F_n$ and $F_p$ split by $qV$ across the junction and merge back within a diffusion length on each side.') } }),
    P({ src: 'Recent Exam 2 · 2d (8 pts)', q: md`The n region is held at $+2.4$ V relative to the p region (Fig. 1b). The zero-bias depletion capacitance is about 60 fF and $V_0 = 0.8$ V. Find the depletion capacitance.`,
      parts: [FIX('Bias', ['reverse, 2.4 V', 'forward, 2.4 V'], 0, [null, 'The n side is positive: that raises the barrier.']), N('C_j', 30, 'fF', 0.02)],
      sol: md`n positive relative to p is **reverse** bias. $C_j = \epsilon A/W$ and $W \propto \sqrt{V_0 + V_R}$:
$$C_j = 60\ \text{fF}\times\sqrt{\frac{0.8}{0.8 + 2.4}} = 60\times\tfrac12 = 30\ \text{fF}$$
**Intuition:** the total voltage across the junction went from 0.8 to 3.2 V, 4×, so the depletion width doubled and the "plate spacing" doubled: half the capacitance.` }),

    R(md`### Problem 3 · Optoelectronics`),
    P({ src: 'Recent Exam 2 · 3a (≈ 17 pts)', pdfSketch: true, q: md`Briefly (1–2 sentences) define: (i) stimulated emission, (iii) population inversion, (iv) the photovoltaic effect. (Part (ii) is not in this copy of the exam.)`,
      parts: [MC('(i) Stimulated emission', ['a photon makes an excited electron drop and emit an identical photon (same energy, phase, direction)', 'an excited electron drops on its own and emits a photon in a random direction', 'a photon is absorbed and lifts an electron to the upper level', 'an electron tunnels across the gap and emits a photon'], 0,
          [null, 'That is spontaneous emission.', 'That is absorption.', 'Not a radiative process in this course.']),
        MC('(iii) Population inversion', ['more electrons in the upper state than the lower one', 'more electrons in the lower state than the upper one', 'equal populations in both states', 'no electrons in either state'], 0,
          [null, 'That is normal equilibrium.', 'That is the threshold, not inversion.', 'No.']),
        MC('(iv) Photovoltaic effect', ['a forward voltage appearing across an illuminated junction', 'a reverse current through a reverse-biased junction in the dark', 'light emitted by a forward-biased junction', 'the junction capacitance changing with light'], 0,
          [null, 'That is dark leakage.', 'That is an LED.', 'No.'])],
      sol: md`(i) **Stimulated emission:** an incoming photon of energy $E_2 - E_1$ makes an electron in the upper state drop and emit a second photon **identical** to the first (same energy, phase and direction). That copying is why laser light is coherent and monochromatic.
(iii) **Population inversion:** more electrons in the upper state than in the lower one ($n_2 > n_1$), which never happens in equilibrium. It is what lets stimulated emission outrun absorption, so light is amplified.
(iv) **Photovoltaic effect:** a **forward voltage** appears across an illuminated junction. The built-in field sweeps photo-generated electrons to the n side and holes to the p side; that separated charge forward-biases the junction (that is $V_{oc}$).` }),
    P({ src: 'Recent Exam 2 · 3b (16 pts)', pdfSketch: true, q: md`(i) In which quadrant of the I–V characteristic are solar cells operated? (ii) Photodiodes in optical communications? (iii) To increase the photocurrent, would you increase or decrease the doping on each side of the junction? Explain.`,
      parts: [FIX('(i) Solar cells', ['I', 'II', 'III', 'IV'], 3, ['Power is absorbed there.', 'Not used.', 'That is the photodetector.', null]),
        FIX('(ii) Photodiodes', ['I', 'II', 'III', 'IV'], 2, ['That is ordinary forward conduction.', 'Not used.', null, 'That is the solar cell.']),
        FIX('(iii) Doping on each side', ['decrease', 'increase'], 0, [null, 'That shrinks W and the diffusion lengths.'])],
      sol: md`(i) **Quadrant IV** ($V > 0$, $I < 0$): the only quadrant where the junction **delivers** power to the circuit.
(ii) **Quadrant III** (reverse bias): the current is set by the light alone, independent of voltage, so it reads out the optical signal directly.
(iii) **Decrease** the doping. The photocurrent counts the pairs that get separated: those made inside the depletion region plus those within a diffusion length of it, $I_{op} = qAg_{op}(L_n + L_p + W)$. Lighter doping makes **$W$ wider** (fewer ions to uncover per length) **and $L$ longer** (fewer impurities to scatter off, so higher $D$; and fewer majority partners to recombine with, so a longer lifetime, the same idea as Section 4b).` }),
  ];

  const fa15 = (inPage) => [
    ...(inPage ? [R(md`## 15. The Fall 2015 Exam 2, for intuition`)] : []),
    pdfLinks('e2-fa15'),
    RF(md`
      Five problems, 20 points each, 60 minutes, closed book, no calculator. Work each on paper before checking.

      **Problem 1.** Two p-n junctions with the doping profiles below.

      [[fig:pr]]
    `, { pr: scan('fa15-profiles', 'junction 1: n-type Nd on the left, p-type Na on the right, abrupt step; junction 2: linearly graded, p on the left, n on the right', 420, 'Junction #1: abrupt, n on the left. Junction #2: linearly graded, p on the left.') }),
    P({ src: 'FA15 · 1a (10 pts)', pdfSketch: true, q: md`Qualitatively sketch the space-charge density, electric field and electrostatic potential for each junction. Is each constant, linear, quadratic, cubic or exponential in $x$?`,
      parts: [FIX('#1 charge density', ['constant', 'linear', 'quadratic', 'cubic'], 0), FIX('#1 field', ['constant', 'linear', 'quadratic', 'cubic'], 1), FIX('#1 potential', ['constant', 'linear', 'quadratic', 'cubic'], 2),
        FIX('#2 charge density', ['constant', 'linear', 'quadratic', 'cubic'], 1), FIX('#2 field', ['constant', 'linear', 'quadratic', 'cubic'], 2), FIX('#2 potential', ['constant', 'linear', 'quadratic', 'cubic'], 3)],
      sol: md`**The hint, "think about how these were derived":** field is the running integral of charge, potential the running integral of field. Each integration raises the power by one.
- #1 (abrupt): charge is two **constant** blocks with equal total charge; field **linear** (a triangle), pointing from n to p; potential **quadratic**.
- #2 (graded): the net doping is a straight line through zero, so the charge is **linear**; field **quadratic** (a parabola, zero at both depletion edges); potential **cubic**.` }),
    P({ src: 'FA15 · 1b (4 pts)', pdfSketch: true, q: md`Indicate the direction of the drift and diffusion currents for electrons and holes in each junction at equilibrium.`,
      parts: [FIX('#1 electron diffusion current', LR, 0), FIX('#1 hole diffusion current', LR, 0), FIX('#1 electron drift current', LR, 1), FIX('#1 hole drift current', LR, 1),
        FIX('#2 electron diffusion current', LR, 1), FIX('#2 hole diffusion current', LR, 1), FIX('#2 electron drift current', LR, 0), FIX('#2 hole drift current', LR, 0)],
      sol: md`Junction #1 has **n on the left**. Electrons diffuse right (into p): as negative charge that is current to the **left**. Holes diffuse left (into n): current to the **left**. The field points from n (+) to p (−), to the right, and both drift currents point **along the field**: **right**. Each drift current exactly cancels its diffusion current (equilibrium).
Junction #2 has p on the left, so everything flips: diffusion currents right, drift currents left.` }),
    P({ src: 'FA15 · 1c (6 pts)', q: md`A junction has $N_d$, $N_a$ and contact potential $V_0$. Which changes **increase** $V_0$? (i) increase $N_d$; (ii) reduce $N_a$; (iii) increase the bandgap, same doping; (iv) decrease the temperature.`,
      parts: [FIX('(i)', ['increases V₀', 'does not'], 0), FIX('(ii)', ['increases V₀', 'does not'], 1), FIX('(iii)', ['increases V₀', 'does not'], 0), FIX('(iv)', ['increases V₀', 'does not'], 0)],
      sol: md`$qV_0$ is how far apart the two Fermi levels sat before contact. (i) More donors push the n-side $E_F$ up: **yes**. (ii) Fewer acceptors let the p-side $E_F$ drift back toward midgap: **no**, $V_0$ falls. (iii) Wider gap → smaller $n_i$ → both Fermi levels sit farther from midgap: **yes**. (iv) Colder → smaller $n_i$, same effect: **yes** (even with freeze-out, $E_F$ heads to the band edges as $T \to 0$).` }),
    P({ src: 'FA15 · 2 (20 pts)', q: md`A semi-infinite abrupt $n^+p$ junction has the n side 9× more heavily doped than the p side. $V_0 = 0.8$ V and $W_0 = 260$ nm. (a) Find $x_{n0}$ and $x_{p0}$. (b) Find the maximum field $\mathscr{E}_0$ in simplest form. (c) Sketch the space-charge distribution.`,
      parts: [N('x_{n0}', 26, 'nm'), N('x_{p0}', 234, 'nm'), N('\\mathscr{E}_0', 6.15e4, 'V/cm'),
        FIX('(c) The n-side charge block is…', ['9× taller and 9× narrower than the p-side block', 'the same height and 9× narrower', '9× taller and the same width'], 0, [null, 'The densities differ 9×.', 'Equal areas: taller must mean narrower.'])],
      hints: ['Equal charge: $N_dx_{n0} = N_ax_{p0}$, so $x_{p0} = 9x_{n0}$ and $W = 10x_{n0}$.', 'The field triangle has area $V_0$: $\\tfrac12\\mathscr{E}_0W_0 = V_0$.'],
      sol: md`(a) Charge balance with $N_d = 9N_a$: $x_{p0} = 9x_{n0}$, so $W_0 = 10x_{n0}$: $x_{n0} = 26$ nm, $x_{p0} = 234$ nm. The light side gets 90% of the width.
(b) No doping values needed: the triangle's area is the voltage, $\tfrac12\mathscr{E}_0W_0 = V_0$, so $\mathscr{E}_0 = 2V_0/W_0 = 1.6/(2.6\times10^{-5}\ \text{cm}) = 6.15\times10^4$ V/cm ($6.15\times10^6$ V/m).
(c) A tall narrow block of $+9qN_a$ from $-x_{n0}$ to 0 and a low wide block of $-qN_a$ from 0 to $9x_{n0}$, equal areas.` }),
    P({ src: 'FA15 · 3 (20 pts)', q: md`A Si diode's doping goes from $10^{17}$ on both sides to $10^{19}\ \text{cm}^{-3}$ on both sides. (a) What happens to the reverse saturation current? (b) To the breakdown voltage? (c) How does the I–V curve change?`,
      parts: [FIX('(a) $|I_0|$', UP3, 1, ['The minority densities $n_i^2/N$ fall 100×.', null, 'Minority densities change.']),
        FIX('(b) $|V_{br}|$', UP3, 1, ['Heavier doping thins the depletion region.', null, 'The field at a given voltage rises.']),
        MC('(c) On the I–V plot, the heavily doped diode…', ['needs more forward voltage for the same current, and breaks down at a smaller reverse voltage', 'turns on earlier and breaks down later', 'has the same forward curve and only breaks down sooner', 'turns on later and breaks down at a larger reverse voltage'], 0,
          [null, 'Smaller $I_0$ means more voltage for the same current.', 'The forward curve depends on $I_0$, which changed.', 'Breakdown moves toward zero.'])],
      sol: md`(a) **Decrease.** $I_0 \propto n_i^2/N$ on each side: the minority carriers that make the current are 100× scarcer.
(b) **Decrease.** $W$ shrinks and the field at a given voltage rises; with both sides at $10^{19}$ the barrier is thin enough for **Zener tunneling**, at a small voltage.
(c) Forward: a smaller $I_0$ shifts the exponential **to the right** (more voltage for the same current). Reverse: a smaller leakage, and breakdown moves **toward $V = 0$**.` }),
    P({ src: 'FA15 · 4 (20 pts)', pdfSketch: true, q: md`(a) Explain Zener breakdown with an I–V and a band diagram. (b) Same for avalanche. (c) Order a $p^+n^+$, a $p^+n$ and a $pn$ Si diode (same n doping for the last two) from largest to smallest reverse-bias capacitance.`,
      parts: [MC('(a) Zener breakdown is…', ['electrons tunneling from the p-side valence band into the n-side conduction band through a thin barrier', 'carriers gaining enough energy to knock loose new pairs', 'the depletion region reaching the contact', 'the junction overheating'], 0,
          [null, 'That is avalanche.', 'That is punch-through.', 'That is thermal failure, not a breakdown mechanism.']),
        MC('(b) Avalanche breakdown is…', ['carriers accelerated in a wide depletion region knocking loose new pairs, which multiply', 'tunneling through a thin barrier', 'thermal generation in the neutral regions', 'the barrier vanishing'], 0,
          [null, 'That is Zener.', 'That is the ordinary reverse current.', 'Reverse bias raises the barrier.']),
        FIX('(c) Largest to smallest $C_j$', ['p⁺n⁺ > p⁺n > pn', 'pn > p⁺n > p⁺n⁺', 'p⁺n > p⁺n⁺ > pn'], 0, [null, 'Heavier doping means thinner W and more C.', 'The p⁺n⁺ is thinnest of all.'])],
      sol: md`(a) **Zener:** heavy doping on both sides → very thin $W$; at a modest reverse voltage the filled p-side valence band lines up with the empty n-side conduction band just nanometers away, and electrons tunnel across. Sharp, low-voltage breakdown.
(b) **Avalanche:** lighter doping → wide $W$; a carrier gains enough kinetic energy between collisions to impact-ionize a new pair, and the pairs multiply. Happens at higher voltage: $V_{br}(\text{avalanche}) > V_{br}(\text{Zener})$.
(c) $C_j = \epsilon A/W$ and heavier doping makes $W$ thinner: **$p^+n^+$ > $p^+n$ > $pn$**. (Not "because it has more charge": the reason is the thinner $W$.)` }),
    RF(md`**Problem 5.** A two-level system in a photon field:

      [[fig:tl]]`, { tl: scan('fa15-twolevel', 'two levels E1 and E2 with densities n1 and n2, photons absorbed and emitted', 400, 'Levels E₁ (density n₁) and E₂ (density n₂), photon field ρ(ν₁₂).') }),
    P({ src: 'FA15 · 5 (20 pts)', pdfSketch: true, q: md`(a) Name the rates $B_{21}n_2\rho(\nu_{12})$, $B_{12}n_1\rho(\nu_{12})$ and $A_{21}n_2$. (b) Relate them in steady state. (c) On an I–V curve, where does a photodiode operate, where does a solar cell operate, and where are $I_{sc}$ and $V_{oc}$?`,
      parts: [FIX('$B_{21}n_2\\rho$', ['absorption', 'spontaneous emission', 'stimulated emission'], 2), FIX('$B_{12}n_1\\rho$', ['absorption', 'spontaneous emission', 'stimulated emission'], 0), FIX('$A_{21}n_2$', ['absorption', 'spontaneous emission', 'stimulated emission'], 1),
        MC('(b) Steady state', ['absorption = stimulated + spontaneous emission', 'spontaneous = absorption + stimulated', 'all three are equal', 'stimulated = absorption'], 0),
        FIX('Photodiode operating point', ['1st quadrant', '3rd quadrant', '4th quadrant'], 1), FIX('Solar cell operating point', ['1st quadrant', '3rd quadrant', '4th quadrant'], 2)],
      sol: md`(a) Reading the factors: needs a photon **and** an upper electron → **stimulated emission**; needs a photon and a lower electron → **absorption**; needs only an upper electron → **spontaneous emission**.
(b) Upward = downward: $B_{12}n_1\rho = B_{21}n_2\rho + A_{21}n_2$.
(c) Photodiode: **3rd quadrant** (reverse bias, current ∝ light). Solar cell: **4th quadrant** (delivers power). $I_{sc}$ is where the lit curve crosses the current axis ($V = 0$); $V_{oc}$ where it crosses the voltage axis ($I = 0$).` }),

  ];

  const sp03 = (inPage) => [
    ...(inPage ? [R(md`## 16. The Spring 2003 Exam 2, for intuition`)] : []),
    pdfLinks('e2-sp03'),
    R(md`
      Four quick multiple-choice problems, then longer ones (the original was a 2-hour exam; aim for 75 minutes). Problem 9 is on bipolar transistors, which are **not** on this exam (Ch. 7, final); it is at the end for completeness.
    `),
    P({ src: 'SP03 · 1 (5 pts)', q: md`A Si p-n junction at 300 K: the p side has $E_F - E_i = -0.2$ eV, the n side $E_F - E_c = -0.15$ eV, $E_g = 1.1$ eV, $E_i$ at midgap. What is $V_0$?`,
      parts: [FIX('qV₀', ['0.35 eV', '0.60 eV', '0.05 eV', '0.75 eV', 'none of the above'], 1, ['That subtracts instead of adding the two sides.', null, 'No.', 'That uses the full half-gap on the n side.', 'One of these is right.'])],
      sol: md`$V_0$ is the gap between the Fermi levels before contact. n side: $E_F$ is 0.15 eV below $E_c$, which is 0.55 eV above $E_i$, so $E_F - E_i = 0.40$ eV. p side: 0.20 eV below $E_i$. Total: $0.40 + 0.20 = 0.60$ eV.` }),
    P({ src: 'SP03 · 2 (5 pts)', q: md`A junction with $V_0 = 0.8$ V has identical doping on both sides, and the n-side depletion width is 1 µm. What is the maximum field?`,
      parts: [FIX('$\\mathscr{E}_{\\max}$', ['0 V/cm', '8000 V/cm', '16000 V/cm', 'not enough information'], 1, ['There is always a field in the depletion region.', null, 'That uses W = 1 µm; the total width is 2 µm.', 'Symmetric doping gives the total width.'])],
      sol: md`Equal doping → equal widths, so $W = 2\ \mu$m. Triangle area = voltage: $\mathscr{E}_{\max} = 2V_0/W = 1.6/(2\times10^{-4}) = 8000$ V/cm. No doping value needed.` }),
    P({ src: 'SP03 · 3 (5 pts)', q: md`A Si junction has $x_{n0} = 10x_{p0}$. Which is true? (a) $N_d = 10N_a$. (b) The p-side space charge exceeds the n-side's. (c) Under forward bias the minority injection current on the p side exceeds that on the n side. (d) The built-in field points from p to n. (e) None of the above.`,
      parts: [FIX('Answer', ['(a)', '(b)', '(c)', '(d)', '(e)'], 4, ['The wide side is the light side: $N_a = 10N_d$.', 'The charges are always equal.', 'The light (n) side has 10× the minority carriers, so hole injection into n wins.', 'It points from n (+) to p (−).', null])],
      sol: md`Every option fails: the wide n side is the lightly doped one ($N_a = 10N_d$); the two charges are equal; injection is larger into the lighter n side; the field points n → p. **(e)**.` }),
    P({ src: 'SP03 · 4 (5 pts)', q: md`A $p^+n$ diode of an unknown material: the n-side Fermi level is halfway between $E_c$ and $E_i$, and $qV_0 = 0.75$ eV. Best estimate of the gap?`,
      parts: [FIX('$E_g$', ['2 eV', '0.75 eV', '1 eV', '1.5 eV', 'none of the above'], 2)],
      sol: md`On the $p^+$ side $E_F \approx E_v$, which is $E_g/2$ below $E_i$. On the n side $E_F$ is $E_g/4$ above $E_i$. So $qV_0 = \tfrac34E_g = 0.75$ eV → $E_g = 1$ eV.` }),
    P({ src: 'SP03 · 5 (20 pts)', q: md`A Si junction at 300 K under 0.5 V forward bias. p side: $N_A = 6\times10^{18}$, $D_n = 36\ \text{cm}^2/\text{s}$, $\tau_n = 10^{-8}$ s. n side: $N_D = 1.5\times10^{17}$, $D_p = 16\ \text{cm}^2/\text{s}$, $\tau_p = 10^{-8}$ s. (a) Find $qV_0$ and the depletion width at this bias (and draw the band diagram). (b) The current density. (c) The hole diffusion current at $x_n = 2L_p$. (d) The field in the n region at $x_n = 10L_p$ ($\mu_n \approx 650$).`,
      parts: [N('qV_0', 0.930, 'eV', 0.02), N('W', 61.2, 'nm', 0.04), N('J', 2.32e-3, 'A/cm^{2}', 0.05), N('J_p(2L_p)', 3.15e-4, 'A/cm^{2}', 0.05), N('\\mathscr{E}(10L_p)', 1.49e-4, 'V/cm', 0.1)],
      hints: ['$N_A \\gg N_D$: one-sided, $W \\approx \\sqrt{2\\epsilon(V_0 - V)/qN_D}$ and only the hole term matters.', 'Far from the junction all the current is majority-electron drift.'],
      sol: md`(a) $(E_i - E_F)_p = 0.0259\ln(6\times10^{18}/1.5\times10^{10}) = 0.513$ eV, $(E_F - E_i)_n = 0.417$ eV, $qV_0 = 0.930$ eV. With 0.5 V forward, the barrier is $0.43$ eV and $W \approx \sqrt{2\epsilon(0.43)/qN_D} = 61$ nm. Band diagram: $F_p$ and $F_n$ split by 0.5 eV across the junction.
(b) $p^+n$: hole injection only. $L_p = \sqrt{16\times10^{-8}} = 4\ \mu$m, $p_n = n_i^2/N_D = 1.5\times10^3$:
$J = q\dfrac{D_p}{L_p}p_n(e^{0.5/0.0259} - 1) = 2.32\times10^{-3}$ A/cm².
(c) The hole current decays like the hole excess: $J_p(2L_p) = J\,e^{-2} = 3.15\times10^{-4}$ A/cm².
(d) Ten diffusion lengths in, the holes are gone; the whole current is electron drift: $\mathscr{E} = J/(qN_D\mu_n) = 2.32\times10^{-3}/(1.6\times10^{-19}\cdot1.5\times10^{17}\cdot650) = 1.5\times10^{-4}$ V/cm. Tiny: the neutral region drops almost no voltage, which is the assumption we made.` }),
    RF(md`**Problem 6.** Avalanche breakdown voltage of $p^+n$ junctions vs n-side doping:

      [[fig:br]]`, { br: scan('hw8-fig5-22', 'avalanche breakdown voltage vs doping for Ge, Si, GaAs, GaP', 420, 'Avalanche breakdown voltage vs doping (300 K).') }),
    P({ src: 'SP03 · 6a (4 pts)', q: md`Which statement about reverse breakdown of a $p^+n$ junction is correct? (1) $V_{br}$ falls with doping because heavier doping makes ohmic contacts easier. (2) $V_{br}$ falls with doping because the n-side resistance drops. (3) GaAs and GaP break down at higher voltage because they are zinc-blende rather than diamond. (4) …because III-V bonding is partly ionic and stronger. (5) All of the above. (6) None of the above.`,
      parts: [FIX('Correct', ['(1)', '(2)', '(3)', '(4)', '(5)', '(6)'], 5, ['Contacts have nothing to do with it.', 'Resistance is not the mechanism; the field is.', 'Crystal structure is not the reason.', 'Not bonding strength: the gap.', 'None of them is right.', null])],
      sol: md`**(6).** The real reasons: heavier doping → thinner $W$ and higher field at a given voltage, so the critical field is reached sooner. Wider-gap materials (GaAs, GaP) need more energy to create each pair by impact ionization, so a higher critical field and $V_{br}$. None of the listed reasons is the physics.` }),
    P({ src: 'SP03 · 6b–d (16 pts)', q: md`(b) A Si $p^+n$ with $N_d = 2\times10^{16}$ and a 250 µm n side: estimate the critical field. (c) Now $N_d = 10^{15}$, a 25 µm n side, $V_0 = 0.84$ V: avalanche or punch-through? (d) For (c), the depletion capacitance per cm² at 10 V reverse.`,
      parts: [N('V_{br}\\text{ (chart)}', 39, 'V', 0.25), N('\\mathscr{E}_c', 4.89e5, 'V/cm', 0.12), N('W\\text{ at breakdown (c)}', 22.3, 'µm', 0.1),
        FIX('(c) It breaks down by', ['avalanche', 'punch-through'], 0, [null, 'The depletion (22 µm) stays inside the 25 µm region.']), N('C_j/A', 2.78, 'nF/cm^{2}', 0.04)],
      sol: md`(b) The chart gives $V_{br} \approx 39$ V at $2\times10^{16}$. One-sided, triangular field: $\mathscr{E}_c = \sqrt{2qN_dV_{br}/\epsilon} \approx 4.9\times10^5$ V/cm. Self-check: $W = 2V_{br}/\mathscr{E}_c \approx 1.6\ \mu$m ≪ 250 µm, so avalanche it is.
(c) At $10^{15}$ the chart gives about 380 V; $W = \sqrt{2\epsilon(V_0 + V_{br})/qN_d} = 22.3\ \mu$m < 25 µm: the depletion never reaches the end, so **avalanche**.
(d) At 10 V reverse: $W = \sqrt{2\epsilon(10.84)/qN_d} = 3.76\ \mu$m and $C_j/A = \epsilon/W = 2.78$ nF/cm².` }),
    RF(md`**Problem 7.** The excess hole profile in a $p^+$-$n$-$n^+$ narrow-base diode ($x_n = 0$ is the start of the neutral n region):

      [[fig:nb]]`, { nb: scan('sp03-narrow', 'excess hole density falling linearly from 5.45e12 at xn = 0 to zero at l = 1 µm; Dp = 10, tau_p = 0.1 µs', 420, 'A straight line: the base (1 µm) is much shorter than $L_p = 10\\ \\mu\\text{m}$.') }),
    P({ src: 'SP03 · 7 (12 pts)', q: md`(a) Estimate the current density. (b) The total number of excess holes per cm² in the n region. (c) Where do most of the holes recombine?`,
      parts: [N('J', 8.7e-2, 'A/cm^{2}', 0.03), N('Q_p/q', 2.7e8, 'cm^{-2}', 0.03),
        MC('(c) Most holes recombine', ['at the n⁺ contact, x = ℓ', 'inside the n region', 'several diffusion lengths into the n⁺ region', 'in the depletion region'], 0,
          [null, 'Recombination inside is only $qQ_p/\\tau_p \\approx 4\\times10^{-4}$ A/cm², 0.5% of the current.', 'The contact (excess forced to zero) swallows them first.', 'The depletion region is thin and fast to cross.'])],
      sol: md`(a) Straight line → constant slope: $J = qD_p\Delta p/\ell = (1.6\times10^{-19})(10)(5.45\times10^{12})/10^{-4} = 8.7\times10^{-2}$ A/cm².
(b) Triangle area: $\tfrac12\Delta p\,\ell = 2.7\times10^8$ holes/cm².
(c) Recombining inside the base accounts for only $qQ_p/\tau_p = 4.3\times10^{-4}$ A/cm², 0.5% of the current. The other 99.5% of the holes reach the $n^+$ contact and recombine **there**. That is the narrow-base diode in one line: $L_p = \sqrt{D_p\tau_p} = 10\ \mu$m ≫ 1 µm.` }),
    RF(md`**Problem 8.** A forward-biased Schottky diode passes 2.0 mA at an unknown bias $V_{\text{applied}}$ (applied to the semiconductor, metal grounded):

      [[fig:sk]]`, { sk: scan('sp03-schottky', 'Schottky band diagram: metal on the left grounded, n-semiconductor bands bending up toward the interface, V applied to the semiconductor', 440, 'The metal is grounded; the voltage is applied to the semiconductor side.') }),
    P({ src: 'SP03 · 8 (8 pts)', q: md`(a) If the voltage on the semiconductor becomes $V_{\text{applied}} + 0.06$ V, what is the current? (b) If instead the metal work function is lowered by 0.12 eV, what is the current?`,
      parts: [N('(a)\\ I', 0.197, 'mA', 0.05), N('(b)\\ I', 206, 'mA', 0.03)],
      sol: md`(a) Forward bias for metal on n-type means the **metal positive** relative to the semiconductor. Raising the semiconductor by 0.06 V **reduces** the forward bias by 0.06 V: $I = 2\ \text{mA}\times e^{-0.06/0.0259} = 0.197$ mA (about 10× less: 60 mV is a decade).
(b) $\phi_B = \phi_m - \chi$ drops by 0.12 eV, and the saturation current $\propto e^{-\phi_B/kT}$ grows by $e^{0.12/0.0259} \approx 103$: $I \approx 206$ mA.` }),
    R(md`
      **Problem 9 (not on this exam: bipolar transistors).** Three Si $p^+$-$n$-$p^+$ transistors: #2 has twice the base width, #3 has 10× the base doping. The key's orderings, for reference: emitter injection efficiency 1 > 2 > 3; base transport factor 1 > 2 > 3; recombination base current 2 > 1 ≥ 3; current gain β: 1 > 2 > 3; base transit time 2 > 3 > 1. The same narrow-base ideas from Section 8 drive every one of them, but this belongs to the final.
    `),
  ];
  steps.push(...f24(true), ...fa15(true), ...sp03(true));

  C.unit({
    id: 'e2-one-u', exam: 'e2', tools: true, num: 'Exam 2', title: 'The whole exam on one page',
    lessons: [
      { id: 'e2-one', title: 'Exam 2 on one page: how it all works, and why', steps },
      { id: 'e2-f24', title: 'Recent Exam 2, likely Fall 2024 (with PDF and key)', kind: 'exam', steps: f24(false) },
      { id: 'e2-fa15', title: 'Fall 2015 Exam 2 (with PDF and key)', kind: 'exam', steps: fa15(false) },
      { id: 'e2-sp03', title: 'Spring 2003 Exam 2 (with PDF and key)', kind: 'exam', steps: sp03(false) },
    ],
  });

  // The practice exams elsewhere on the site get the same PDF links at the top (their PDFs are built from them).
  for (const id of ['e2-mock', 'e2-mock2', 'e2-mock3', 'e2-mock4']) {
    const l = COURSE.units.flatMap((u) => u.lessons).find((x) => x.id === id);
    if (l && !(l.steps[0] && l.steps[0].pdfLinks)) l.steps.unshift(pdfLinks(id));
  }
})();

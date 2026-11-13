/* Exam 2, part A — Haynes–Shockley and quasi-Fermi gradients (4.4.5–4.4.6), then the p-n junction at equilibrium,
   its depletion region, and what bias does to it (5.2–5.3.2). Topics 13–16. Each lesson lists why (the opener),
   build (the slow intuition build-up with predict-first questions), rest (formulas, worked example) and qs
   (intuition problems); e2-tools.js adds the rapid-fire drills and the randomized problems. The figure helpers
   (window.E2FIG) are shared with e2-b.js and e2-c.js. */
(function () {
  'use strict';
  const { R, RF, Q } = C;

  // ---------------------------------------------------------------- figures
  // Si p-n junction, p on the left (Na = 1e17, Nd = 1e16, V0 = 0.754 V); energies from the n-side Ev
  const V0 = 0.754, EFn = 0.907;
  function pnBands(V, o = {}) {
    const s = Math.sqrt((V0 - V) / V0), xp = 0.03 * s, xn = 0.3 * s, a = 0.42 - xp, b = 0.42 + xn, fp = xp / (xp + xn);
    const u = (x) => (x <= a ? 1 : x >= b ? 0 : x <= 0.42 ? 1 - fp * ((x - a) / xp) ** 2 : (1 - fp) * ((b - x) / xn) ** 2);
    const Ec = (x) => 1.12 + (V0 - V) * u(x);
    const d = { w: o.w || 300, h: o.h || 150, Ec, Ev: (x) => Ec(x) - 1.12, axis: false, field: 'left', marks: [{ x: a, tex: '-x_{p0}' }, { x: b, tex: 'x_{n0}' }] };
    if (V === 0) Object.assign(d, { EF: EFn, lab: { EF: 'E_F' } });
    else Object.assign(d, { Fn: (x) => (x >= a ? EFn : EFn - V * (1 - Math.exp((x - a) / 0.1))), Fp: (x) => (x <= b ? EFn - V : EFn - V * Math.exp(-(x - b) / 0.12)), labLeft: ['Fp'] });
    return BD.diagram(Object.assign(d, o.extra || {}));
  }
  // charge, field and potential for an abrupt junction with Na = 5 Nd (p on the left)
  function chargeFieldPot() {
    const xp = 0.2, xn = 1;
    const rho = BD.prof({ w: 230, h: 150, x: [-1.4, 1.5], y: [-1.15, 0.45], xl: 'x', yl: '\\rho', xt: [[-xp, '-x_{p0}'], [xn, 'x_{n0}']], yt: [[0.2, 'qN_d'], [-1, '-qN_a']],
      curves: [{ pts: [[-1.4, 0], [-xp, 0], [-xp, -1], [0, -1], [0, 0.2], [xn, 0.2], [xn, 0], [1.5, 0]] }] });
    const fld = BD.prof({ w: 230, h: 150, x: [-1.4, 1.5], y: [-1.15, 0.3], xl: 'x', yl: '\\mathscr{E}', xt: [[-xp, '-x_{p0}'], [xn, 'x_{n0}']], yt: [[-1, '-\\mathscr{E}_0']],
      curves: [{ pts: [[-1.4, 0], [-xp, 0], [0, -1], [xn, 0], [1.5, 0]] }] });
    const tot = 0.5 * (xp + xn);
    const pot = BD.prof({ w: 230, h: 150, x: [-1.4, 1.5], y: [-0.05, 0.75], xl: 'x', yl: 'V', xt: [[-xp, '-x_{p0}'], [xn, 'x_{n0}']], yt: [[tot, 'V_0']],
      curves: [{ f: (x) => (x <= -xp ? 0 : x <= 0 ? 0.5 * (x + xp) ** 2 / xp : x <= xn ? tot - 0.5 * (xn - x) ** 2 / xn : tot) }] });
    return PF.row([{ svg: rho, cap: 'charge: boxes, equal areas' }, { svg: fld, cap: 'field: a triangle, peak at x = 0' }, { svg: pot, cap: 'potential: two parabolas' }]);
  }
  // excess minority carriers near a junction (forward or reverse), depletion region shaded by marks
  function edgeProfiles(fwd) {
    const xp = 0.25, xn = 0.4;
    const n = fwd ? (x) => 0.55 * Math.exp((x + xp) / 0.8) : (x) => -0.25 * Math.exp((x + xp) / 0.8);
    const pcur = fwd ? (x) => 1 * Math.exp(-(x - xn) / 1.0) : (x) => -0.45 * Math.exp(-(x - xn) / 1.0);
    return BD.prof({ w: 320, h: 190, x: [-3, 3.5], y: fwd ? [0, 1.15] : [-0.55, 0.3], xl: 'x', yl: fwd ? '\\delta n,\\ \\delta p' : '\\delta n,\\ \\delta p', zero: !fwd,
      vlines: [[-xp, ''], [xn, '']], xt: [[-xp, '-x_{p0}'], [xn, 'x_{n0}']],
      curves: [{ f: n, from: -3, to: -xp, lab: fwd ? '\\delta n = \\Delta n_pe^{(x+x_{p0})/L_n}' : '\\delta n \\to -n_p', labAt: -2.2, dy: fwd ? -14 : 14 },
        { f: pcur, from: xn, to: 3.5, lab: fwd ? '\\delta p = \\Delta p_ne^{-(x-x_{n0})/L_p}' : '\\delta p \\to -p_n', labAt: 1.1, dy: fwd ? -10 : 14 }] });
  }
  window.E2FIG = { pnBands, chargeFieldPot, edgeProfiles };

  // ======================================================================== Topic 13
  const T13 = {
    id: 't13-hs', topic: 13, sec: '4.4.5–4.4.6', title: 'Haynes–Shockley and quasi-Fermi-level gradients',
    why: md`This is the experiment that **sees** drift, diffusion and recombination happen to one pulse of carriers, and measures $\mu$ and $D$ separately (and so checks the Einstein relation). It is short, it is on the Exam 2 list (Ch. 4.4), and the quasi-Fermi-level rule at the end, *current flows where a quasi-Fermi level slopes*, is how you will read every biased junction diagram in this exam.`,
    build: [
      R(md`
        ### One pulse, three things happening to it

        Take a long n-type bar with a small field $\mathscr{E}$ along it. At $x = 0$, at $t = 0$, a flash of light (or a point contact) dumps a little packet of excess holes into the bar. A detector sits a distance $L$ downstream. Now watch the packet.

        **Drift** carries the whole packet downstream at $v_d = \mu_p\mathscr{E}$. Its center is at $x = \mu_p\mathscr{E}t$. Drift moves every hole the same way at the same speed, so by itself it would just slide the packet along without changing its shape.

        **Diffusion** spreads it. Each hole random-walks, so the packet becomes a Gaussian whose width grows like $\sqrt{D_pt}$. Note the square root: after 4× the time it is only 2× wider. Diffusion is symmetric, so it never moves the center.

        **Recombination** eats it. The packet's area (the number of excess holes left) shrinks as $e^{-t/\tau_p}$. Recombination happens everywhere at the same rate per hole, so it doesn't change the shape either, only the size.

        Put together (Streetman 4-52):

        $$\delta p(x, t) = \frac{\Delta P}{2\sqrt{\pi D_pt}}\exp\left[-\frac{(x - \mu_p\mathscr{E}t)^2}{4D_pt} - \frac{t}{\tau_p}\right]$$

        Read it piece by piece: the $\sqrt{t}$ in front keeps the area fixed while the Gaussian widens; $x - \mu_p\mathscr{E}t$ is "distance from the drifting center"; $4D_pt$ is the width squared; $e^{-t/\tau_p}$ is the recombination loss.
      `),
      Q(md`**Predict first.** The field is doubled. The pulse arrives at the detector…`,
        ['in half the time, narrower and taller', 'in half the time, with the same shape', 'at the same time but taller', 'in half the time, wider'], 0,
        [null, md`Less time on the road means less time to spread ($\propto\sqrt{t}$) and less time to recombine: narrower and taller.`, md`Arrival time is $L/\mu_p\mathscr{E}$, so it changes.`, md`Width $\propto\sqrt{D_pt_d}$: less time, less spreading.`],
        md`$t_d = L/\mu_p\mathscr{E}$ halves; width $\propto\sqrt{t_d}$ shrinks by $\sqrt2$; fewer holes recombine on the way.`),
      R(md`
        ### Reading $\mu$ and $D$ off the scope trace

        The detector shows a bump in time. Two numbers come off it:

        - **Arrival time** $t_d$ of the peak: $v_d = L/t_d$, so $\mu_p = \dfrac{v_d}{\mathscr{E}} = \dfrac{L}{\mathscr{E}t_d}$.
        - **Width** $\Delta t$ of the bump (between the points where it is $1/e$ of the peak). The packet sweeps past at $v_d$, so its width in space is $\Delta x = v_d\Delta t$. The Gaussian falls to $1/e$ where $(x - x_0)^2 = 4D_pt_d$, so the full width is $\Delta x = 4\sqrt{D_pt_d}$:

        $$D_p = \frac{(\Delta x)^2}{16t_d} = \frac{(v_d\Delta t)^2}{16t_d}$$

        Then $D_p/\mu_p$ should come out to $kT/q$ = 0.0259 V. That was the point of the experiment: two independent measurements confirming the Einstein relation.

        **Recombination** you get by repeating at several distances: the area under the bump falls as $e^{-t_d/\tau_p}$.
      `),
      Q(md`You flip the field so it points **toward** the injection point from the detector side (pointing back toward $x = 0$). What does the detector see?`,
        ['almost nothing: the holes drift away from it', 'the same pulse, a bit later', 'an inverted pulse', 'a pulse at the same time'], 0,
        [null, md`Holes drift along $\mathscr{E}$, now away from the detector; only diffusion could carry a few that far, and they recombine first.`, md`Holes are positive: they go with the field.`, md`The sign of $\delta p$ doesn't change.`],
        md`Holes follow the field. Reverse it and the packet drifts the other way.`),
      R(md`
        ### Quasi-Fermi levels tell you where current flows (4.4.6)

        In Exam 1 you met the quasi-Fermi levels $F_n$ and $F_p$: when there are excess carriers, $n = n_ie^{(F_n - E_i)/kT}$ and $p = n_ie^{(E_i - F_p)/kT}$. Here is the rule that makes them powerful. Drift plus diffusion for electrons, rewritten with $F_n$:

        $$J_n = q\mu_nn\mathscr{E} + qD_n\frac{dn}{dx} = \mu_nn\frac{dF_n}{dx} \qquad J_p = \mu_pp\frac{dF_p}{dx}$$

        **Each carrier's total current is (its density) × (its mobility) × (the slope of its own quasi-Fermi level).** Three consequences you will use constantly:

        1. **Equilibrium:** $F_n = F_p = E_F$, flat. No current of either kind. (The huge drift and diffusion currents cancel exactly.)
        2. **Flat $F_n$ means zero electron current**, however many electrons there are. A sloped $F_p$ means hole current.
        3. **The same current needs a steep slope where the carriers are few, and almost no slope where they are many.** In the neutral n side of a forward-biased diode the injected holes are scarce, so $F_p$ slopes steeply and quickly merges into $F_n$; the electrons are abundant, so $F_n$ is nearly flat even though they carry current.

        One more fact you'll lean on: $np = n_i^2e^{(F_n - F_p)/kT}$. The gap between the two quasi-Fermi levels measures how far from equilibrium you are. In a junction under bias $V$, that gap is exactly $qV$ across the depletion region.
      `),
      Q(md`In the neutral n region of a forward-biased diode, the minority holes carry current mostly by diffusion. Which quasi-Fermi level slopes more steeply there?`,
        [md`$F_p$: holes are few, so the same current needs a steep slope`, md`$F_n$: electrons carry the majority current`, 'they slope equally', 'neither: neutral regions have no field'], 0,
        [null, md`$J_n = \mu_nn\,dF_n/dx$ with $n = N_d$ huge: a tiny slope suffices.`, md`Slopes depend on the densities, which differ by many decades.`, md`Quasi-Fermi slopes come from diffusion too, not only fields.`],
        md`$dF/dx = J/(\mu\cdot\text{density})$: few carriers, steep slope.`),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$\delta p(x, t) = \frac{\Delta P}{2\sqrt{\pi D_pt}}\exp\left[-\frac{(x - \mu_p\mathscr{E}t)^2}{4D_pt} - \frac{t}{\tau_p}\right] \qquad \mu_p = \frac{L}{\mathscr{E}t_d} \qquad D_p = \frac{(v_d\Delta t)^2}{16t_d}$$

        $$J_n = \mu_nn\frac{dF_n}{dx} \qquad J_p = \mu_pp\frac{dF_p}{dx} \qquad np = n_i^2e^{(F_n - F_p)/kT}$$

        | effect | what it does to the pulse | scaling |
        |---|---|---|
        | drift | moves the center | $x = \mu_p\mathscr{E}t$ |
        | diffusion | widens it | width $\propto\sqrt{D_pt}$ |
        | recombination | shrinks the area | $\propto e^{-t/\tau_p}$ |
      `),
      R(md`
        ### Worked example

        !!graded Problem
          In a Haynes–Shockley experiment on n-type Si, the detector is 1.0 cm downstream and the field is 10 V/cm. The hole pulse peaks at $t_d = 200\,\mu$s and is $\Delta t = 40.7\,\mu$s wide between its $1/e$ points. Find $\mu_p$ and $D_p$ and check the Einstein relation.

        **1. Governing equations.** $v_d = L/t_d$, $\mu_p = v_d/\mathscr{E}$, $\Delta x = v_d\Delta t = 4\sqrt{D_pt_d}$.

        **2. Solve.** $D_p = (v_d\Delta t)^2/16t_d$.

        **3. Substitute.**
        $$v_d = \frac{1.0\,\text{cm}}{200\times10^{-6}\,\text{s}} = 5000\,\text{cm/s} \qquad \mu_p = \frac{5000\,\text{cm/s}}{10\,\text{V/cm}} = 500\,\tfrac{\text{cm}^2}{\text{V·s}}$$
        $$D_p = \frac{(5000\,\text{cm/s}\times40.7\times10^{-6}\,\text{s})^2}{16(200\times10^{-6}\,\text{s})} = \frac{(0.2035\,\text{cm})^2}{3.2\times10^{-3}\,\text{s}}$$

        **4. Answers.** $\mu_p = 500$ cm²/V·s, $D_p = 12.9$ cm²/s, and $D_p/\mu_p = 0.0259$ V $= kT/q$ ✓.

        !!mistake Common mistakes
          - Using the width in **time** as if it were in space: multiply by $v_d$ first.
          - $4\sqrt{Dt}$ is the full width at $1/e$; half-width is $2\sqrt{Dt}$. Check which one the problem gives.
          - μs → s: $10^{-6}$.
      `),
    ],
    qs: [
      Q(md`Why doesn't recombination change the **shape** of the drifting pulse?`,
        ['every excess hole recombines at the same rate $1/\\tau_p$, wherever it is', 'it does: it removes the tails first', 'recombination only happens at the detector', 'recombination is too slow to matter'], 0,
        [null, md`Low-level recombination is $\delta p/\tau_p$ everywhere: the same fraction lost at every $x$.`, 'It happens throughout the bar.', 'It sets the area decay, which is measurable.'],
        md`Uniform fractional loss: the shape scales down, unchanged.`),
      Q(md`Two pulses: one measured after 1 cm, one after 4 cm (same field). The second one's width (in space) is…`,
        ['2× the first', '4× the first', '16× the first', 'the same'], 0,
        [null, md`Width $\propto\sqrt{t}$ and $t \propto L$: $\sqrt4 = 2$.`, 'Too fast: diffusion spreads as a square root.', 'Far too fast.', 'Diffusion keeps spreading it.'],
        md`$\Delta x = 4\sqrt{D_pt_d}$ and $t_d \propto L$.`),
      Q(md`Across the depletion region of a junction under forward bias $V$, $F_n - F_p$ equals…`,
        [md`$qV$`, md`$qV_0$`, md`$q(V_0 - V)$`, '0'], 0,
        [null, 'That is the equilibrium barrier.', 'That is the barrier under bias.', 'Only at equilibrium.'],
        md`The applied voltage is exactly the split of the quasi-Fermi levels: $np = n_i^2e^{qV/kT}$ in the depletion region. This is the law of the junction in disguise.`),
    ],
  };

  // ======================================================================== Topic 14
  const T14 = {
    id: 't14-v0', topic: 14, sec: '5.1–5.2.2', title: 'The junction at equilibrium: contact potential and the carriers in it',
    why: md`Every device on the rest of this course (diodes, solar cells, LEDs, BJTs, MOSFETs) is built from p-n junctions. This lesson answers one question: when you join p and n, **why** does a voltage appear, and how big is it? Get the picture right here (Fermi levels line up, bands bend by $qV_0$) and the formulas for everything after it stop being things to memorize.`,
    build: [
      R(md`
        ### Before contact: two Fermi levels at different heights

        Take a piece of p-type Si ($N_a = 10^{17}$) and a piece of n-type Si ($N_d = 10^{16}$). Separately, each is in equilibrium with its own Fermi level:

        - n side: $E_F$ sits $kT\ln(N_d/n_i)$ = 0.347 eV **above** $E_i$, close to $E_c$. Lots of electrons ($10^{16}$), very few holes ($n_i^2/N_d = 2.25\times10^4$).
        - p side: $E_F$ sits $kT\ln(N_a/n_i)$ = 0.407 eV **below** $E_i$, close to $E_v$. Lots of holes ($10^{17}$), very few electrons ($2.25\times10^3$).

        Line the two pieces up by their bands (same material, same $E_c$): the n side's Fermi level is $0.347 + 0.407 = 0.754$ eV higher than the p side's. Remember what $E_F$ means: it is the energy at which electrons "want" to be. Electrons flow from high $E_F$ to low $E_F$, like water flowing downhill.
      `),
      Q(md`**Predict first.** At the instant of contact, which way does the big flow of electrons go, and why?`,
        ['n → p, by diffusion: there are $10^{12}$ times more electrons on the n side', 'p → n, pulled by the field', 'no flow: both sides are neutral', 'p → n, because holes push them'], 0,
        [null, md`At the instant of contact there is no field yet; it builds up **because** of this flow.`, md`Neutral, yes; but the concentrations differ by a factor $10^{16}/2.25\times10^3$, and diffusion only cares about gradients.`, 'Holes diffuse p → n themselves; electrons go n → p.'],
        md`Diffusion goes down the concentration gradient: electrons n → p, holes p → n.`),
      RF(md`
        ### Contact: diffusion builds the very field that stops it

        Electrons diffuse from n to p; holes diffuse from p to n. Each one that leaves takes its charge with it and leaves something behind:

        - Each electron that leaves the n side uncovers a **fixed positive donor ion** $N_d^+$.
        - Each hole that leaves the p side uncovers a **fixed negative acceptor ion** $N_a^-$.

        So a layer of + charge appears on the n side of the junction and a layer of − charge on the p side. That dipole creates an electric field pointing from + to −: **from n to p**. Look at what that field does: it pushes holes back toward p and electrons back toward n. It drives a drift current exactly opposite to the diffusion current.

        The process runs until the field's drift exactly cancels diffusion, **for electrons and for holes separately**. That is equilibrium, and the signature of equilibrium is that $E_F$ is **flat** everywhere (Exam 1, topic 7). The bands have to bend to make that happen: far on the p side $E_F$ must still be near $E_v$, far on the n side near $E_c$, and $E_F$ itself is one straight line. So the bands are higher on the p side by exactly the difference the Fermi levels had before contact:

        [[fig:eq]]

        $$qV_0 = (E_F - E_i)_n + (E_i - E_F)_p = kT\ln\frac{N_d}{n_i} + kT\ln\frac{N_a}{n_i} = kT\ln\frac{N_aN_d}{n_i^2}$$

        $V_0$ is the **contact potential** (built-in potential, $V_{bi}$). For our example, $V_0$ = 0.754 V.

        **Why "uphill for electrons" on the p side:** the band diagram plots *electron* energy. An electron on the n side looking at the p side sees $E_c$ climb by $qV_0$: a hill. A hole on the p side (holes float **up** in a band diagram) sees $E_v$ drop by $qV_0$ toward the n side: also a hill for it. One barrier holds both majority carriers back.
      `, { eq: PF.row([{ svg: pnBands(0), cap: 'equilibrium: EF flat, bands bend by qV0 (p left, n right)' }]) }),
      R(md`
        ### Doing $V_0$ in your head

        $kT\ln x = 0.0259 \times 2.303\log_{10}x = 0.0596\log_{10}x$ volts. So:

        $$V_0 \approx 0.06\text{ V} \times (\text{number of decades in } N_aN_d/n_i^2)$$

        For Si, $n_i^2 = 2.25\times10^{20}$, which is **20.35 decades**. So $V_0 = 0.0596\times(\log N_a + \log N_d - 20.35)$.

        - $N_a = 10^{17}$, $N_d = 10^{15}$: $32 - 20.35 = 11.65$ decades → 0.69 V.
        - $N_a = 10^{18}$, $N_d = 10^{16}$: $34 - 20.35 = 13.65$ → 0.81 V.
        - $N_a = N_d = 10^{15}$: $30 - 20.35 = 9.65$ → 0.58 V.

        So practical Si junctions live between about 0.55 and 0.95 V. Each **doubling** of either doping adds $0.0259\ln2 = 18$ mV; each **factor of 10** adds 60 mV. That's why $V_0$ barely moves when you change doping: it's logarithmic.

        **The hard ceiling:** each side's $E_F$ stays inside the gap (nondegenerate), so $qV_0 < E_g$. Si: below 1.12 V. GaAs ($n_i \approx 2\times10^6$, 12.6 decades): a $10^{17}/10^{16}$ junction gives 0.0596 × 20.4 ≈ 1.2 V, larger because $n_i^2$ is much smaller.
      `),
      Q(md`**Predict first.** Same doping, but the junction is heated from 300 K to 400 K. $V_0$…`,
        ['decreases: $n_i$ rises fast, so both Fermi levels slide toward midgap', md`increases, because $kT$ is in front`, 'stays the same: doping is fixed', 'increases, because the gap shrinks'], 0,
        [null, md`The $kT$ prefactor grows by 4/3, but $n_i^2$ grows by about $10^{5}$: the log shrinks much more.`, md`The Fermi levels depend on $n_i$, which depends on T.`, 'A smaller gap means larger $n_i$, which lowers $V_0$.'],
        md`$V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$: $n_i^2$ wins. Hot enough and the material goes intrinsic, $V_0 \to 0$.`),
      R(md`
        ### The barrier is a Boltzmann factor

        Here's a second way to see $V_0$, and it's the key to the diode equation later. Holes on the p side ($p_p = N_a$) face a hill of height $qV_0$ toward the n side. In equilibrium the fraction of them with enough energy to climb it is $e^{-qV_0/kT}$, and that is exactly the hole density allowed on the far side:

        $$\frac{p_p}{p_n} = \frac{n_n}{n_p} = e^{qV_0/kT}$$

        Check: $p_p/p_n = N_a/(n_i^2/N_d) = N_aN_d/n_i^2$, and $\ln$ of that is $qV_0/kT$ ✓. For our junction: 0.754 V / 0.06 V per decade ≈ 12.6 decades: $10^{17}$ holes on one side, $2.25\times10^4$ on the other.

        **What drifts and diffuses at equilibrium.** Both currents are enormous and cancel. The hole diffusion current p → n is huge (gradient of $10^{17}$ over a fraction of a micron). The hole drift current n → p is equally huge. Net: zero, for each carrier separately. You can't measure $V_0$ with a voltmeter, by the way: the contact potentials where the metal leads touch each side exactly cancel it (otherwise you could power a light bulb with a diode in the dark).
      `),
      R(md`
        ### What's actually inside the depletion region

        The depletion approximation says the region around the junction has "no" mobile carriers. How true is that? Inside the region the electron density still follows the band position (equilibrium, $E_F$ flat):

        $$n(x) = N_d\,e^{-q\,\Delta\phi(x)/kT} \qquad p(x) = N_a\,e^{-q\,[V_0 - \Delta\phi(x)]/kT}$$

        where $\Delta\phi(x)$ is how far the bands have bent away from the neutral n side. Every 60 mV of bending costs a decade:

        - 0.06 V in from the n edge: $n = 10^{15}$, already 10% of $N_d$.
        - 0.24 V in: $n = 10^{12}$, 0.01% of $N_d$.
        - Where $E_i$ crosses $E_F$: $n = p = n_i = 1.5\times10^{10}$.

        So except for a thin skin at each edge (the first ~0.1 V of bending, a few Debye lengths), the mobile carriers really are negligible next to the ionized dopants. That is what lets us write the charge as simple boxes, $+qN_d$ and $-qN_a$, in the next lesson.
      `),
      Q(md`In the depletion region at equilibrium, at the point where the bands have bent 0.36 eV up from the neutral n side ($N_d = 10^{16}$), the electron density is about…`,
        [md`$10^{10}\,\text{cm}^{-3}$`, md`$10^{16}\,\text{cm}^{-3}$`, md`$10^{12}\,\text{cm}^{-3}$`, '0 exactly'], 0,
        [null, md`That is the neutral value; here $E_c$ has moved away from $E_F$.`, md`0.36/0.06 = 6 decades, not 4.`, 'Small, never zero.'],
        md`$n = 10^{16}e^{-0.36/0.0259} = 10^{16}\times10^{-6}$.`),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$qV_0 = (E_F - E_i)_n + (E_i - E_F)_p \qquad V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2} \qquad \frac{p_p}{p_n} = \frac{n_n}{n_p} = e^{qV_0/kT} \qquad qV_0 = E_{vp} - E_{vn}$$

        - $E_F$ is flat at equilibrium; bands bend by $qV_0$; the p side is "up" (higher electron energy).
        - Field points n → p; $J_n = J_p = 0$ separately (drift = diffusion for each).
        - Inside the depletion region: $n = N_de^{-q\Delta\phi/kT}$, one decade per 60 mV of bending.
        - $V_0 < E_g/q$; Si junctions 0.55–0.95 V; +18 mV per doubling of a doping; falls with T.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          An abrupt Si n-p junction at 300 K has $N_d = 4.0\times10^{16}$ on the n side and $N_a = 1.5\times10^{17}\,\text{cm}^{-3}$ on the p side. (a) Find $E_F - E_i$ on the n side and $E_i - E_F$ on the p side, then $V_0$. (b) In the depletion region at equilibrium, what is the electron density where the bands have bent 0.30 eV from the neutral n side? (c) How many decades separate the hole densities on the two sides?

        **1. Governing equations.** $E_F - E_i = kT\ln(n_0/n_i)$, $E_i - E_F = kT\ln(p_0/n_i)$, $qV_0 = $ their sum; $n(x) = N_de^{-q\Delta\phi/kT}$; $p_p/p_n = e^{qV_0/kT}$.

        **2. Units and assumptions.** Full ionization, nondegenerate, $kT = 0.0259$ eV, $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$.

        **3. Substitute.**
        $$E_F - E_i = (0.0259\,\text{eV})\ln\frac{4.0\times10^{16}}{1.5\times10^{10}} \qquad E_i - E_F = (0.0259\,\text{eV})\ln\frac{1.5\times10^{17}}{1.5\times10^{10}}$$
        $$n = (4.0\times10^{16}\,\text{cm}^{-3})\,e^{-0.30/0.0259}$$

        **4. Answers.** (a) 0.383 eV and 0.417 eV, so $V_0 = 0.800$ V (and directly, $0.0259\ln[(4\times10^{16})(1.5\times10^{17})/(2.25\times10^{20})]$ = 0.800 V ✓). (b) $n = 3.73\times10^{11}\,\text{cm}^{-3}$, $10^{-5}$ of the doping: depleted. (c) $0.800/0.0596 = 13.4$ decades.

        Note the order "n-p" in the problem: the physics is identical; your band diagram is just mirrored (n on the left, bands higher on the right).

        !!mistake Common mistakes
          - Subtracting the two Fermi-level offsets instead of adding them: they're on opposite sides of $E_i$.
          - Saying $E_F$ bends. The **bands** bend; $E_F$ is flat at equilibrium.
          - Field direction: from the + (n) side to the − (p) side.
          - Expecting a voltmeter to read $V_0$.
      `),
    ],
    qs: [
      Q(md`Which statement about a p-n junction **in equilibrium** is false?`,
        ['no current flows because no carriers cross the junction', 'the Fermi level is flat', 'drift and diffusion cancel for each carrier', 'the n side is at higher electrostatic potential'], 0,
        [null, 'True: flat $E_F$ is the definition of equilibrium.', md`True: $J_n = 0$ and $J_p = 0$ separately.`, md`True: electrons have lower energy there, i.e. higher potential.`],
        md`Carriers cross all the time, in huge numbers both ways. The **net** current is zero.`),
      Q(md`In the band diagram of an equilibrium p-n junction, which side has its bands higher?`,
        ['the p side, by $qV_0$', 'the n side, by $qV_0$', 'neither: only $E_F$ moves', 'it depends on which side is more heavily doped'], 0,
        [null, md`On the n side $E_F$ must sit near $E_c$; on the p side near $E_v$. With $E_F$ flat, the p side's bands are pushed up.`, md`$E_F$ is what stays flat.`, md`Doping sets **how much**, not which way.`],
        md`Electron energy is higher on the p side: electrons see a hill going n → p; holes (which float up) see a hill going p → n.`),
      Q(md`Junction A has $N_a = 10^{17}$, $N_d = 10^{15}$. Junction B has $N_a = 10^{16}$, $N_d = 10^{16}$. Same material. Compare $V_0$.`,
        ['equal: the product $N_aN_d$ is the same', 'A is larger: it is more asymmetric', 'B is larger: it is symmetric', 'cannot tell without $n_i$'], 0,
        [null, md`$V_0$ depends only on the product.`, md`Asymmetry changes where the depletion region sits, not $V_0$.`, md`Only the product $N_aN_d$ enters.`],
        md`$V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$: both products are $10^{32}$.`),
      Q(md`Why can't a nondegenerate Si junction have $V_0 = 1.3$ V?`,
        ['each side\'s $E_F$ is inside the gap, so the two can differ by less than $E_g = 1.12$ eV', 'the field would cause breakdown', 'the depletion width would be negative', 'it can, with enough doping'], 0,
        [null, 'Breakdown is about reverse bias.', md`$W$ grows with $V_0$.`, md`Once a side is degenerate the formula changes, but the nondegenerate bound is $E_g$.`],
        md`$qV_0 = E_{F,n} - E_{F,p}$ (before contact), both inside the gap.`),
      Q(md`GaAs and Si junctions with identical doping. Which has the larger $V_0$, and why?`,
        [md`GaAs: its $n_i$ is ~$10^4$ times smaller, so $\ln(N_aN_d/n_i^2)$ is larger`, md`Si: its $n_i$ is larger`, 'equal: same doping', 'GaAs, because its mobility is higher'], 0,
        [null, md`A larger $n_i$ means a **smaller** $V_0$.`, md`$n_i$ enters directly.`, 'Mobility has nothing to do with equilibrium electrostatics.'],
        md`Wider gap → smaller $n_i$ → each Fermi level further from midgap → bigger $V_0$ (~1.2 V vs ~0.75 V).`),
    ],
  };

  // ======================================================================== Topic 15
  const T15 = {
    id: 't15-depl', topic: 15, sec: '5.2.3', title: 'The depletion region: charge, field, potential and width',
    why: md`Three numbers describe the inside of every junction: how wide the depletion region is ($W$), how strong the field gets ($\mathscr{E}_0$), and how the voltage splits between the two sides. They control capacitance, breakdown, photodetector speed and, later, the MOSFET and BJT. The math is two integrations of Gauss's law, and every result follows from one picture: **boxes of charge → a triangle of field → parabolas of potential**.`,
    build: [
      RF(md`
        ### Charge → field → potential

        [[fig:cfp]]

        **Charge.** With the depletion approximation: on the n side, from $0$ to $x_{n0}$, $\rho = +qN_d$ (ionized donors). On the p side, from $-x_{p0}$ to $0$, $\rho = -qN_a$ (ionized acceptors). Outside: neutral.

        **Field.** Gauss's law, $\dfrac{d\mathscr{E}}{dx} = \dfrac{\rho}{\epsilon}$. Start at the far p edge where $\mathscr{E} = 0$ and integrate: through the p side the field ramps down with slope $-qN_a/\epsilon$; through the n side it ramps back up with slope $+qN_d/\epsilon$, reaching zero again at $x_{n0}$. A triangle, with its biggest magnitude at the metallurgical junction:

        $$\mathscr{E}_0 = -\frac{qN_dx_{n0}}{\epsilon} = -\frac{qN_ax_{p0}}{\epsilon}$$

        The minus sign just says it points in $-x$ (n → p, with p on the left).

        **The two expressions must be equal**, because the field has to come back to zero: the triangle closes only if the + charge equals the − charge. That's **charge balance**:

        $$N_ax_{p0} = N_dx_{n0}$$

        **Potential.** $\mathscr{E} = -dV/dx$, so the potential is the integral of the field: a parabola on each side, and the total rise across the region is the **area of the triangle**:

        $$V_0 - V = \tfrac12\lvert\mathscr{E}_0\rvert W \qquad W = x_{n0} + x_{p0}$$

        ($V$ is the applied forward bias; at equilibrium $V = 0$; reverse bias is $V < 0$, which adds.)
      `, { cfp: chargeFieldPot() }),
      Q(md`**Predict first.** The p side is doped 5× more heavily than the n side. Where is the depletion region?`,
        ['mostly in the n side: 5× wider there', 'mostly in the p side', 'equally split', 'only at the metallurgical junction'], 0,
        [null, md`Backwards. The heavy side holds its share of the charge in a thin layer.`, md`Only if $N_a = N_d$.`, 'It has finite width on both sides.'],
        md`$N_ax_{p0} = N_dx_{n0}$: the light side must reach 5× further to uncover the same charge.`),
      R(md`
        ### Solving for $W$, and why it's a square root

        Substitute charge balance into the triangle area. With $x_{n0} = W\frac{N_a}{N_a + N_d}$:

        $$V_0 - V = \frac12\cdot\frac{qN_dx_{n0}}{\epsilon}\cdot W = \frac{q}{2\epsilon}\frac{N_aN_d}{N_a + N_d}W^2 \quad\Longrightarrow\quad W = \sqrt{\frac{2\epsilon(V_0 - V)}{q}\left(\frac{1}{N_a} + \frac{1}{N_d}\right)}$$

        **Why a square root?** If you widen the region, two things grow at once: you uncover more charge, so the peak field grows ($\propto W$), and the triangle is wider ($\propto W$). The voltage is the area, so $V \propto W^2$. To hold 4× the voltage you only need 2× the width.

        **The parts:**

        $$x_{n0} = \frac{WN_a}{N_a + N_d} \qquad x_{p0} = \frac{WN_d}{N_a + N_d} \qquad \lvert\mathscr{E}_0\rvert = \frac{2(V_0 - V)}{W}$$

        **How the voltage splits.** Each side's drop is its own triangle: $V_n = \frac12\mathscr{E}_0x_{n0}$, $V_p = \frac12\mathscr{E}_0x_{p0}$. So $V_n/V_p = x_{n0}/x_{p0} = N_a/N_d$. **The voltage drops mostly across the lightly doped side.** In HW6, GaAs with $N_a = 4N_d$: $x_{n0} = 4x_{p0}$, and the potential at the metallurgical junction is only 1/5 of $V_0$ above the p side.
      `),
      R(md`
        ### One-sided junctions: the light side does everything

        Most real diodes are **one-sided**: p⁺-n (or n⁺-p), with the heavy side 100–1000× more doped. Then $1/N_a \ll 1/N_d$ and:

        $$W \approx x_{n0} = \sqrt{\frac{2\epsilon(V_0 - V)}{qN_d}} \qquad x_{p0} = x_{n0}\frac{N_d}{N_a} \approx 0 \qquad \lvert\mathscr{E}_0\rvert = \sqrt{\frac{2qN_d(V_0 - V)}{\epsilon}}$$

        Burn this in: **in a p⁺-n junction, the n side sets $W$, $\mathscr{E}_0$, the capacitance, the breakdown voltage and (next lessons) the current.** Raising $N_a$ further changes almost nothing except $V_0$ (by a few tens of mV).

        **Anchor numbers for Si** ($\epsilon = 11.8\times8.85\times10^{-14} = 1.04\times10^{-12}$ F/cm), one-sided, 1 V total:

        | light-side doping | $W$ | $\mathscr{E}_0 = 2V/W$ |
        |---|---|---|
        | $10^{15}$ | 1.14 μm | $1.75\times10^4$ V/cm |
        | $10^{16}$ | 0.36 μm | $5.5\times10^4$ V/cm |
        | $10^{17}$ | 0.11 μm | $1.75\times10^5$ V/cm |

        Scale $W$ by $\sqrt{V}$ for other voltages and by $1/\sqrt{10} = 0.316$ per decade of doping. Compare the field with the ~1 V/cm in a neutral region carrying current: junction fields are $10^4$–$10^5$ times bigger.
      `),
      Q(md`**Predict first.** A p⁺-n junction's reverse bias is raised so that $V_0 + V_R$ goes from 1 V to 9 V. The peak field…`,
        ['triples', 'goes ×9', 'stays the same', 'goes ×1/3'], 0,
        [null, md`$\mathscr{E}_0 = 2V/W$, and $W$ also grows (×3): net ×3.`, md`$\mathscr{E}_0 = qN_dW/\epsilon$ grows with $W$.`, 'More voltage, more field.'],
        md`$W \propto \sqrt{V}$ (×3), and $\mathscr{E}_0 = qN_dW/\epsilon$ (×3).`),
      R(md`
        ### What each knob does (say it before you compute it)

        | change | $V_0$ | $W$ | $\mathscr{E}_0$ | where it happens |
        |---|---|---|---|---|
        | light-side doping ↑ (p⁺-n: $N_d$↑) | ↑ (slightly) | ↓ ($\propto N_d^{-1/2}$) | ↑ ($\propto N_d^{1/2}$) | all on the n side |
        | heavy-side doping ↑ | ↑ (slightly) | ≈ same | ≈ same | $x_{p0}$ shrinks |
        | reverse bias ↑ | — | ↑ ($\sqrt{V_0 + V_R}$) | ↑ ($\sqrt{V_0 + V_R}$) | |
        | forward bias ↑ | — | ↓ ($\sqrt{V_0 - V}$) | ↓ | |
        | temperature ↑ | ↓ | ↓ (slightly, at zero bias) | ↓ (slightly) | |
        | area ×2 | same | same | same | (charge ×2) |

        HW6 problem 3 is exactly this table: halve $N_d$ in a p⁺-n and say what happens to the depletion charge (↓, $\propto\sqrt{N_d}$), the peak field (↓, $\propto\sqrt{N_d}$), $x_n$ (↑ by about $\sqrt2$), $x_p$ (↓: $x_p = x_nN_d/N_a \propto \sqrt{N_d}$, so about ×0.71; the posted solution says "≈½", but only the direction was graded) and $V_0$ (↓ by $\frac{kT}{q}\ln 2$ = 18 mV).
      `),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$\frac{d\mathscr{E}}{dx} = \frac{\rho}{\epsilon} \qquad N_ax_{p0} = N_dx_{n0} \qquad \mathscr{E}_0 = -\frac{qN_dx_{n0}}{\epsilon} \qquad V_0 - V = \tfrac12\lvert\mathscr{E}_0\rvert W$$

        $$W = \sqrt{\frac{2\epsilon(V_0 - V)}{q}\frac{N_a + N_d}{N_aN_d}} \qquad x_{n0} = \frac{WN_a}{N_a + N_d} \qquad x_{p0} = \frac{WN_d}{N_a + N_d} \qquad Q = qAx_{n0}N_d$$

        On the formula sheet: $V_0$, $W$, charge balance $qAx_{p0}N_a = qAx_{n0}N_d$, $-V_0 = \int\mathscr{E}\,dx$. Not on it: $\mathscr{E}_0 = 2(V_0 - V)/W$, the one-sided forms, the voltage split $V_n/V_p = N_a/N_d$, and $\epsilon_{Si} = 11.8\epsilon_0$.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          An abrupt Si p⁺-n junction at 300 K: $N_a = 10^{17}$, $N_d = 10^{15}\,\text{cm}^{-3}$. Find (a) $V_0$, (b) $W$, $x_{n0}$, $x_{p0}$ at equilibrium, (c) the peak field, (d) the same at a reverse bias of 10 V.

        **1. Governing equations.** $V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$; $W = \sqrt{\frac{2\epsilon(V_0 - V)}{q}\frac{N_a + N_d}{N_aN_d}}$; $x_{n0} = W\frac{N_a}{N_a + N_d}$; $\lvert\mathscr{E}_0\rvert = 2(V_0 - V)/W$.

        **2. Units.** $\epsilon = (11.8)(8.85\times10^{-14}) = 1.044\times10^{-12}$ F/cm; lengths in cm.

        **3. Substitute.**
        $$V_0 = (0.0259\,\text{V})\ln\frac{(10^{17})(10^{15})}{2.25\times10^{20}} \qquad W = \sqrt{\frac{2(1.044\times10^{-12}\,\tfrac{\text{F}}{\text{cm}})(0.695\,\text{V})}{1.6\times10^{-19}\,\text{C}}\cdot\frac{1.01\times10^{17}}{10^{32}}\,\text{cm}^3}$$

        **4. Answers.** (a) $V_0 = 0.695$ V. (b) $W = 0.957$ μm; $x_{n0} = 0.948$ μm; $x_{p0} = 9.5$ nm (1% of $W$, as $N_d/N_a$ predicts). (c) $\lvert\mathscr{E}_0\rvert = 2(0.695)/(0.957\times10^{-4}) = 1.45\times10^4$ V/cm, pointing n → p. (d) At $V_R = 10$ V: $W$ scales by $\sqrt{10.695/0.695} = 3.92$ → 3.76 μm; $\lvert\mathscr{E}_0\rvert = 5.70\times10^4$ V/cm. 99% of the voltage drops on the n side.

        !!mistake Common mistakes
          - Using $V_0 + V$ for forward bias. The formula is $V_0 - V$ with $V > 0$ forward, $V < 0$ reverse.
          - Forgetting the square root, or forgetting to convert $W$ from cm.
          - $\epsilon_0$ instead of $11.8\epsilon_0$.
          - Putting the depletion region on the heavy side.
      `),
    ],
    qs: [
      Q(md`In a p⁺-n junction, where is the peak field?`,
        ['at the metallurgical junction', 'at the n-side depletion edge', 'in the middle of the n-side depletion region', 'in the neutral p⁺ region'], 0,
        [null, 'The field is zero at the depletion edges.', md`The field ramps linearly; its extreme is where the charge changes sign.`, 'Neutral regions carry almost no field.'],
        md`The triangle's peak is at $x = 0$, where $\rho$ flips from $-qN_a$ to $+qN_d$.`),
      Q(md`The field triangle is steeper on one side. Which, and why?`,
        [md`the heavily doped side: slope $= qN/\epsilon$`, 'the lightly doped side, because it is wider', 'they have the same slope', 'the n side always'], 0,
        [null, md`The light side is wider **because** its slope is gentler.`, md`Only if $N_a = N_d$.`, 'It depends on doping, not type.'],
        md`$d\mathscr{E}/dx = qN/\epsilon$: denser charge, steeper ramp, so the heavy side reaches the peak in a short distance.`),
      Q(md`A symmetric junction ($N_a = N_d$) and a p⁺-n junction have the same $N_d$ and the same $V_0 - V$. Which has the wider depletion region?`,
        [md`the symmetric one, by $\sqrt2$`, 'the p⁺-n one', 'they are equal', md`the symmetric one, by 2`], 0,
        [null, md`$\frac{1}{N_a} + \frac{1}{N_d}$ is $\frac{2}{N_d}$ for the symmetric one, $\approx\frac{1}{N_d}$ for p⁺-n.`, md`The p side adds width in the symmetric case.`, 'Square root.'],
        md`$W \propto \sqrt{1/N_a + 1/N_d}$: $\sqrt2$ larger when both sides are light.`),
      Q(md`HW6-style: a p⁺-n junction's $N_d$ is **halved**. The total depletion charge per area…`,
        ['decreases (∝ √N_d)', 'increases, because W is wider', 'stays the same', 'halves exactly'], 0,
        [null, md`$W$ grows by $\sqrt2$ but the charge density halves: net ×$1/\sqrt2$.`, md`It scales as $N_dx_{n0} \propto N_d\cdot N_d^{-1/2}$.`, md`Square root, not linear (and $V_0$ drops slightly too).`],
        md`$Q/A = qN_dx_{n0} = \sqrt{2q\epsilon N_d(V_0 - V)}$.`),
      Q(md`The electric field in the depletion region at equilibrium is typically…`,
        [md`$10^4$–$10^5$ V/cm`, '1–10 V/cm', md`$10^{8}$ V/cm`, 'zero, because no current flows'], 0,
        [null, 'That is a neutral region carrying current.', 'That would rip the crystal apart.', 'The field balances huge diffusion currents.'],
        md`~0.7 V across ~0.1–1 μm.`),
    ],
  };

  // ======================================================================== Topic 16
  const T16 = {
    id: 't16-bias', topic: 16, sec: '5.3.1–5.3.2', title: 'Applying bias: the barrier, the depletion edges, the law of the junction',
    why: md`Bias is where the junction becomes a device. Forward bias lowers the hill and lets an exponential flood of carriers across; reverse bias raises it and shuts the flood off. One equation, the **law of the junction**, tells you how many minority carriers are sitting at each depletion edge for any voltage. Every current, capacitance and solar-cell formula after this starts from it.`,
    build: [
      R(md`
        ### Where does the applied voltage go?

        Connect a battery. The neutral regions are good conductors (lots of majority carriers) and carry only small currents, so almost no voltage drops across them (you'll check this number in topic 17: millivolts). The depletion region is nearly empty of carriers: a high resistance. So **essentially all of the applied voltage appears across the depletion region**, adding to or subtracting from $V_0$.

        Convention: $V$ is the voltage on the p side relative to the n side.

        - **Forward bias** ($V > 0$, + on p): the barrier drops to $q(V_0 - V)$.
        - **Reverse bias** ($V = -V_R < 0$): the barrier grows to $q(V_0 + V_R)$.

        Everything about the depletion region from the last lesson follows with $V_0 \to V_0 - V$: forward bias makes $W$ narrower and the field weaker; reverse bias makes them bigger.
      `),
      RF(md`
        ### The band picture under bias

        [[fig:b]]

        Out of equilibrium there's no single Fermi level. On the n side, far from the junction, $F_n = F_p$ at the n-side Fermi level; on the p side, far away, both sit at the p-side Fermi level. They are $qV$ apart: **the applied voltage is the difference between the two ends' Fermi levels**.

        Inside the depletion region each quasi-Fermi level stays flat (continuing from the side where that carrier is majority): $F_n$ flat from the n side all the way through, $F_p$ flat from the p side all the way through. So across the depletion region

        $$F_n - F_p = qV \qquad np = n_i^2\,e^{qV/kT}$$

        Forward bias: $F_n$ above $F_p$, $np > n_i^2$, extra carriers (injection). Reverse bias: $F_n$ below $F_p$, $np < n_i^2$, a starved region (extraction).
      `, { b: PF.row([{ svg: pnBands(0.4), cap: 'forward: barrier q(V0 − V), Fn above Fp' }, { svg: pnBands(-0.6), cap: 'reverse: barrier q(V0 + VR), Fp above Fn' }]) }),
      Q(md`**Predict first.** In forward bias, the barrier is lowered by $qV$. By what factor does the number of holes able to climb over it increase?`,
        [md`$e^{qV/kT}$`, md`$qV/kT$`, md`$V/V_0$`, md`$e^{qV_0/kT}$`], 0,
        [null, 'Barrier crossing is a Boltzmann factor, exponential in the height.', 'Not exponential.', 'That would be the equilibrium ratio.'],
        md`The fraction of holes above a barrier of height $E$ is $\propto e^{-E/kT}$. Lower $E$ by $qV$ → ×$e^{qV/kT}$.`),
      RF(md`
        ### The law of the junction

        At equilibrium the barrier allowed exactly $p_n = p_pe^{-qV_0/kT}$ holes on the n side. Lower the barrier to $q(V_0 - V)$ and the hole density **at the n-side edge of the depletion region** becomes

        $$p(x_{n0}) = p_pe^{-q(V_0 - V)/kT} = p_n\,e^{qV/kT} \qquad n(-x_{p0}) = n_p\,e^{qV/kT}$$

        The **excess** minority carriers at the edges (what the formula sheet calls $\Delta p_n$, $\Delta n_p$):

        $$\Delta p_n = p_n\left(e^{qV/kT} - 1\right) \qquad \Delta n_p = n_p\left(e^{qV/kT} - 1\right)$$

        **Forward bias:** ×10 for every 60 mV. At 0.6 V, $e^{0.6/0.0259} = 1.1\times10^{10}$: ten decades above equilibrium. On an n side with $N_d = 10^{16}$ ($p_n = 2.25\times10^4$): $\Delta p_n = 2.6\times10^{14}$, still ≪ $N_d$, so **low-level injection** holds (the majority density doesn't change). Push to 0.75 V and $\Delta p_n \approx 10^{17}$ > $N_d$: high level, and the simple theory breaks.

        **Reverse bias:** $e^{-qV_R/kT} \to 0$ once $V_R \gtrsim 0.1$ V, so $\Delta p_n \to -p_n$. The edges are **emptied** of minority carriers: any hole that wanders to the n edge is swept across by the field. That's minority-carrier extraction.

        From each edge, the excess decays into the neutral region over a diffusion length (the steady-state diffusion equation from Exam 1, topic 12):

        $$\delta p(x_n) = \Delta p_ne^{-x_n/L_p} \qquad \delta n(x_p) = \Delta n_pe^{-x_p/L_n}$$

        with $x_n$, $x_p$ measured from the depletion edges.

        [[fig:prof]]
      `, { prof: PF.row([{ svg: edgeProfiles(true), cap: 'forward: injected minority carriers decay over L' }, { svg: edgeProfiles(false), cap: 'reverse: the edges are emptied (δ = −equilibrium)' }]) }),
      Q(md`**Predict first.** Which side gets more injected minority carriers, in a p⁺-n diode under forward bias?`,
        ['the n side: $p_n = n_i^2/N_d$ is much larger than $n_p = n_i^2/N_a$', 'the p⁺ side, because it has more holes', 'both get the same', 'neither: majority carriers are injected'], 0,
        [null, md`The p⁺ side's minority electrons are few ($n_i^2/N_a$), and both sides get the same factor $e^{qV/kT}$.`, md`Same factor, different starting points.`, md`What's injected becomes minority carriers on the other side.`],
        md`Both edges are multiplied by $e^{qV/kT}$; the n side starts from $N_a/N_d$ times more. The **heavily doped side injects into the lightly doped side**.`),
      R(md`
        ### The two currents, qualitatively (objective 4)

        **Forward bias: majority carriers diffuse over a lowered barrier.** Holes from the p side climb the lower hill into the n side, where they become minority carriers and diffuse away, recombining within a few $L_p$. Electrons from the n side do the same into the p side. Big current, growing as $e^{qV/kT}$.

        **Reverse bias: minority carriers drift across.** The hill is too high for majority carriers. But any minority carrier that reaches the depletion edge (a hole on the n side, an electron on the p side) is swept across by the strong field: it falls *down* the hill. How many reach the edge? Only those **generated thermally within about a diffusion length** of it. That supply doesn't depend on $V_R$, so the reverse current **saturates** at a small value, $-I_0$. It is a drift current across the junction, fed by diffusion to the edge.

        | | who crosses the junction | how | size |
        |---|---|---|---|
        | forward | majority carriers (become minority on the other side) | diffusion over the barrier | $\propto e^{qV/kT}$, large |
        | reverse | minority carriers | drift down the barrier | $\approx -I_0$, tiny, saturates |

        Both fluxes are always there. At equilibrium they balance exactly. Forward bias multiplies the diffusion flux by $e^{qV/kT}$; reverse bias kills it and leaves only the generation-limited drift flux.
      `),
      Q(md`HW7 problem 2: a plot shows that at the n-side depletion edge, $p$ is **below** its equilibrium value $p_n$. The diode is…`,
        ['reverse biased', 'forward biased', 'at equilibrium', 'in high-level injection'], 0,
        [null, md`Forward bias raises the edge density above $p_n$.`, md`At equilibrium the edge density equals $p_n$.`, 'High level is a forward-bias condition.'],
        md`$p(x_{n0}) = p_ne^{qV/kT} < p_n$ ⇔ $V < 0$. From the ratio you can even read $V = \frac{kT}{q}\ln\frac{p(x_{n0})}{p_n}$.`),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$\text{barrier } q(V_0 - V) \qquad W \propto \sqrt{V_0 - V} \qquad F_n - F_p = qV \qquad p(x_{n0}) = p_ne^{qV/kT} \qquad n(-x_{p0}) = n_pe^{qV/kT}$$

        $$\Delta p_n = p_n\left(e^{qV/kT} - 1\right) \qquad \Delta n_p = n_p\left(e^{qV/kT} - 1\right) \qquad \delta p(x_n) = \Delta p_ne^{-x_n/L_p} \qquad \delta n(x_p) = \Delta n_pe^{-x_p/L_n}$$

        - Forward: ×10 per 60 mV; check low level: $\Delta p_n \ll N_d$.
        - Reverse ($V_R \gtrsim 0.1$ V): $\Delta p_n \approx -p_n$, $\Delta n_p \approx -n_p$.
        - Forward current: majority diffusion over the barrier. Reverse: minority drift, supply-limited, saturates.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          A Si p-n junction at 300 K has $N_a = 10^{17}$ and $N_d = 10^{16}\,\text{cm}^{-3}$. (a) Find $V_0$ and the equilibrium minority densities. (b) At a forward bias of 0.60 V, find the excess minority densities at both depletion edges and check low-level injection. What happens to the barrier and to $W$? (c) Repeat (b) at a reverse bias of 2.0 V.

        **1. Governing equations.** $V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$; $p_n = n_i^2/N_d$, $n_p = n_i^2/N_a$; $\Delta p_n = p_n(e^{qV/kT} - 1)$; $W \propto \sqrt{V_0 - V}$.

        **2. Signs.** Forward $V = +0.60$ V; reverse $V = -2.0$ V.

        **3. Substitute.**
        $$p_n = \frac{(1.5\times10^{10})^2}{10^{16}} = 2.25\times10^4\,\text{cm}^{-3} \qquad n_p = 2.25\times10^3\,\text{cm}^{-3} \qquad e^{0.60/0.0259} - 1 = 1.15\times10^{10}$$

        **4. Answers.** (a) $V_0 = 0.754$ V; $p_n = 2.25\times10^4$, $n_p = 2.25\times10^3\,\text{cm}^{-3}$. (b) $\Delta p_n = 2.59\times10^{14}$, $\Delta n_p = 2.59\times10^{13}\,\text{cm}^{-3}$. $\Delta p_n/N_d = 0.026$ ≪ 1 and $\Delta n_p/N_a$ ≪ 1: low level ✓. The barrier drops from 0.754 to 0.154 eV and $W$ shrinks by $\sqrt{0.154/0.754} = 0.45$. (c) $\Delta p_n = p_n(e^{-77} - 1) = -2.25\times10^4$, $\Delta n_p = -2.25\times10^3\,\text{cm}^{-3}$: the edges are empty. Barrier 2.754 eV; $W$ ×$\sqrt{2.754/0.754} = 1.91$.

        !!mistake Common mistakes
          - Forgetting the $-1$: it matters in reverse bias, where it's the whole answer.
          - Using $N_d$ (majority) where $p_n$ (minority) belongs.
          - $e^{qV/kT}$ with $V$ in volts and $kT$ in eV: $qV/kT = V/(0.0259\,\text{V})$.
          - Not checking low-level injection at large forward bias.
      `),
    ],
    qs: [
      Q(md`Why does almost all of the applied voltage drop across the depletion region rather than the neutral regions?`,
        ['the depletion region has almost no mobile carriers, so it is by far the highest resistance', 'the neutral regions have no electric field allowed', 'the contacts absorb the rest', 'the voltage drops equally everywhere'], 0,
        [null, md`Neutral regions do carry a small field when current flows; it's just tiny.`, 'Good ohmic contacts drop almost nothing.', 'Series resistances: the big one takes the voltage.'],
        md`Series circuit: the voltage divides in proportion to resistance.`),
      Q(md`In reverse bias, why does the current **saturate** instead of growing with $V_R$?`,
        ['it is limited by the thermal generation of minority carriers near the edges, which doesn\'t depend on $V_R$', 'the depletion region blocks all current', 'the field saturates', 'the majority carriers run out'], 0,
        [null, md`A small current $-I_0$ does flow.`, md`The field keeps growing with $\sqrt{V_0 + V_R}$.`, 'Majority carriers aren\'t what flows in reverse bias.'],
        md`Every minority carrier that reaches the edge is already swept across; more field can't sweep more than arrive.`),
      Q(md`At $V = 0.36$ V forward, the hole density at the n-side edge is how many times $p_n$?`,
        [md`$10^6$`, md`$10^{3}$`, md`$10^{14}$`, '14'], 0,
        [null, md`0.36/0.06 = 6 decades.`, md`That used 120 mV/decade.`, md`$e^{14}$ is the natural-log version: $e^{14} \approx 10^6$.`],
        md`$e^{0.36/0.0259} = e^{13.9} \approx 1.1\times10^6$.`),
      Q(md`Forward bias, low level. What happens to the **majority** electron density in the neutral n region near the edge?`,
        [md`it rises by $\delta n = \delta p$ (quasi-neutrality), which is small compared with $N_d$`, 'it drops, because electrons were injected into the p side', 'it rises by a factor $e^{qV/kT}$', 'exactly unchanged: no excess electrons'], 0,
        [null, 'Electrons flow in from the contact to replace them.', md`Only the **minority** density gets the full $e^{qV/kT}$.`, md`Quasi-neutrality: $\delta n \approx \delta p$, small but not zero.`],
        md`Low level means $\delta n = \delta p \ll N_d$: the majority density is essentially $N_d$.`),
    ],
  };

  C.unit({ id: 'e2-ch4', exam: 'e2', num: 'Ch. 4', title: 'Carriers in motion, measured', lessons: [T13] });
  C.unit({ id: 'e2-ch5a', exam: 'e2', num: 'Ch. 5', title: 'The p-n junction: equilibrium and bias', lessons: [T14, T15, T16] });
})();

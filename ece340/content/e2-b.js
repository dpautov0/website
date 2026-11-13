/* Exam 2, part B — the diode equation and its current components, the narrow-base diode, breakdown and non-ideal
   behavior, capacitance and switching (5.3.2–5.6, NarrowBaseDiode handout). Topics 17–20. Same lesson shape as
   e2-a.js (why, build, rest, qs); e2-tools.js assembles them. */
(function () {
  'use strict';
  const { R, RF, Q } = C;

  // ---------------------------------------------------------------- figures
  // current components across a forward-biased p⁺-n diode (hole share 0.9 at the junction)
  const currentFig = () => BD.prof({ w: 360, h: 200, x: [-3, 4.2], y: [0, 1.2], xl: 'x', yl: 'I/I_{total}', vlines: [[-0.1, ''], [0.3, '']], xt: [[-0.1, '-x_{p0}'], [0.3, 'x_{n0}']],
    curves: [{ f: () => 1, lab: 'I_{total}', labAt: 3.2, dy: -8 },
      { f: (x) => 0.9 * Math.exp(-(x - 0.3)), from: 0.3, to: 4.2, lab: 'I_p\\ (\\text{hole diffusion})', labAt: 0.9, dy: -6 },
      { f: (x) => 1 - 0.9 * Math.exp(-(x - 0.3)), from: 0.3, to: 4.2, cls: 'dash', lab: 'I_n\\ (\\text{electrons})', labAt: 2.0, dy: 14 },
      { f: (x) => 0.1 * Math.exp((x + 0.1) / 0.7), from: -3, to: -0.1, cls: 'dash', lab: 'I_n', labAt: -1.2, dy: -8 },
      { f: (x) => 1 - 0.1 * Math.exp((x + 0.1) / 0.7), from: -3, to: -0.1, lab: 'I_p', labAt: -2.6, dy: 14 }] });
  const narrowFig = () => BD.prof({ w: 330, h: 190, x: [0, 3.2], y: [0, 1.15], xl: 'x_n', yl: '\\delta p/\\Delta p_n', xt: [[0.4, '\\ell'], [1, 'L_p']],
    curves: [{ f: (x) => Math.exp(-x), lab: '\\text{long: } e^{-x_n/L_p}', labAt: 1.4, dy: -10 }, { f: (x) => 1 - x / 0.4, from: 0, to: 0.4, cls: 'thick', lab: '\\text{narrow: straight line}', labAt: 0.33, dx: 10, dy: -16 }] });
  const ivFig = () => BD.prof({ w: 360, h: 220, x: [-3.6, 1], y: [-1.2, 1.2], xl: 'V', yl: 'I', zero: true, xt: [[-3, '-V_{br}']],
    curves: [{ f: (V) => (V >= -3 ? Math.min(1.25, 0.004 * (Math.exp(V / 0.13) - 1)) - 0.03 * (V < 0 ? Math.sqrt(-V) / 1.7 : 0) : -0.08 - 4 * (-3 - V)), lab: '\\text{forward: } e^{qV/kT}', labAt: 0.62, dx: -100, dy: 0 }] });
  const cvFig = () => BD.prof({ w: 300, h: 190, x: [-1.2, 6], y: [0, 1.2], xl: 'V_R', yl: '1/C_j^2', xt: [[-0.8, '-V_0'], [0, '0']],
    curves: [{ f: (V) => 0.16 * (V + 0.8), from: -0.8, to: 6, lab: '\\text{slope} = \\frac{2}{q\\epsilon A^2N_d}', labAt: 2.6, dy: -16 }] });
  const tsdFig = () => BD.prof({ w: 340, h: 200, x: [-1, 3], y: [-0.75, 1.25], xl: 't', yl: 'i(t)', zero: true, xt: [[0, '0'], [1, 't_{sd}']], yt: [[1, 'I_f'], [-0.5, '-I_r']],
    curves: [{ pts: [[-1, 1], [0, 1], [0, -0.5], [1, -0.5]] }, { f: (t) => -0.5 * Math.exp(-(t - 1) / 0.35), from: 1, to: 3 }] });

  // ======================================================================== Topic 17
  const T17 = {
    id: 't17-diode', topic: 17, sec: '5.3.2–5.3.4', title: 'The diode equation, and who carries the current where',
    why: md`This is the equation the rest of the semester is built on: $I = I_0(e^{qV/kT} - 1)$. You'll be asked to compute it, to split it into its hole and electron parts, to say which side controls it, to find the minority and majority currents at any point, and to predict how it moves with doping, lifetime, temperature and band gap. All of that comes from one idea: **the current is the minority carriers diffusing away from the edges of the depletion region.**`,
    build: [
      R(md`
        ### From the edge densities to the current

        Last lesson: forward bias parks $\Delta p_n = p_n(e^{qV/kT} - 1)$ extra holes at the n-side depletion edge, and they decay into the n side as $\delta p(x_n) = \Delta p_ne^{-x_n/L_p}$.

        In the neutral n side, how do these holes move? There's almost no field (we'll compute it below: a fraction of a V/cm), and there are very few holes, so hole drift $q\mu_pp\mathscr{E}$ is negligible. **Minority carriers move by diffusion alone.** The hole current at the edge is

        $$I_p(x_n = 0) = -qAD_p\frac{d\,\delta p}{dx_n}\Big|_0 = qA\frac{D_p}{L_p}\Delta p_n$$

        Same on the p side for electrons: $I_n = qA\frac{D_n}{L_n}\Delta n_p$. In the ideal diode nothing recombines inside the thin depletion region, so the electron current is the same at both of its edges, and the total current is the sum of the two edge currents:

        $$I = qA\left(\frac{D_p}{L_p}p_n + \frac{D_n}{L_n}n_p\right)\left(e^{qV/kT} - 1\right) = I_0\left(e^{qV/kT} - 1\right)$$

        In reverse bias the bracket → −1: $I = -I_0$, the saturation current.
      `),
      R(md`
        ### The same answer from stored charge (you'll reuse this)

        Count the excess holes stored in the n side: the area under the exponential,

        $$Q_p = qA\int_0^\infty\Delta p_ne^{-x_n/L_p}dx_n = qAL_p\Delta p_n$$

        In steady state the stored population isn't changing, but each hole recombines after $\tau_p$ on average. So holes must be resupplied at the rate they disappear: $I_p = Q_p/\tau_p$. Check: $qAL_p\Delta p_n/\tau_p = qA\frac{L_p}{\tau_p}\Delta p_n = qA\frac{D_p}{L_p}\Delta p_n$ (since $L_p^2 = D_p\tau_p$) ✓.

        **Current = stored charge / lifetime.** This "charge-control" view gives you the diffusion capacitance and the switching delay in topic 20 almost for free.

        $D_p/L_p = \sqrt{D_p/\tau_p}$ has units of velocity: it's how fast injected holes are "carried off" (spread out and recombined). Shorter lifetime → faster removal → more current at the same voltage.
      `),
      Q(md`**Predict first.** A p⁺-n diode with $N_a = 100N_d$ and $D_n/L_n \approx D_p/L_p$. Roughly what fraction of the forward current is holes?`,
        ['about 99%', 'about 50%', 'about 1%', 'exactly 100%'], 0,
        [null, md`Only if $N_a = N_d$.`, 'Backwards: the heavy side injects into the light side.', 'The electron term is small but not zero.'],
        md`$I_p/I_n = \frac{p_n}{n_p} = \frac{N_a}{N_d} = 100$.`),
      R(md`
        ### Reading $I_0$: every knob in one place

        $$I_0 = qAn_i^2\left(\frac{D_p}{L_pN_d} + \frac{D_n}{L_nN_a}\right)$$

        | factor | what it says | consequence |
        |---|---|---|
        | $n_i^2$ | material and temperature | Si→GaAs: ×$10^{-8}$; +5 K: ×2. The biggest knob by far. |
        | $1/N$ | minority density on each side | **the lightly doped side dominates**; heavier doping → less current |
        | $D/L = \sqrt{D/\tau}$ | removal speed | shorter lifetime → more current; higher mobility → more current |
        | $A$ | area | linear |

        **Magnitudes.** A 100 μm × 100 μm Si p⁺-n with $N_d = 10^{16}$: $I_0 \sim 10^{-15}$ A. Then $e^{qV/kT}$ does the rest: 0.6 V → $10^{10}$ → ~15 μA; 0.7 V → ~0.7 mA. So Si "turns on" around 0.6–0.7 V. GaAs ($I_0$ ~$10^8$ smaller): 8 decades × 60 mV ≈ 0.5 V more, ~1.1 V. Ge: ~0.3 V.

        **Decades.** Every 60 mV is a factor of 10 in current; every 18 mV a factor of 2. HW7: going from 0.7 to 0.8 V multiplies the current by $e^{0.1/0.0259} = 47$.
      `),
      Q(md`**Predict first.** HW7 problem 3: you need a p⁺-n diode to pass **more** current at the same 0.7 V. What do you do to the n-side doping?`,
        ['lower it', 'raise it', 'it doesn\'t matter in a p⁺-n diode', 'raise $N_a$ instead'], 0,
        [null, md`Raising $N_d$ lowers $p_n = n_i^2/N_d$ and the current.`, md`It's the **only** doping that matters in p⁺-n.`, md`$N_a$ only affects the negligible electron term.`],
        md`$I_0 \approx qA\frac{D_p}{L_p}\frac{n_i^2}{N_d}$: lighter n side, more minority holes, more current.`),
      RF(md`
        ### Who carries the current where (objective 5)

        The total current is the same at every cross-section (it's a series circuit). What changes is **which carrier** carries it.

        [[fig:cur]]

        Walk through a forward-biased p⁺-n diode from right (n contact) to left (p contact):

        1. **Deep in the n side** (≫ $L_p$ from the junction): no excess holes are left. All the current is **majority electrons drifting** toward the junction.
        2. **Approaching the junction** (within a few $L_p$): injected holes are diffusing to the right and recombining. Each recombination eats one electron. So the hole current grows toward the junction, $I_p(x_n) = I_p(0)e^{-x_n/L_p}$, and the electron current shrinks by the same amount: $I_n(x_n) = I - I_p(x_n)$.
        3. **At the n-side edge** $x_{n0}$: $I_p = qA\frac{D_p}{L_p}\Delta p_n$ (most of $I$), $I_n$ = the small electron injection current into the p side.
        4. **Across the depletion region**: both components constant (ideal: no recombination there).
        5. **On the p side** the mirror image: injected electrons decay over $L_n$, majority holes take over.

        So the majority electrons on the n side have two jobs: supply the holes they recombine with, and get injected into the p side. **The majority-carrier current near the junction is not drift alone**: the electrons also have a gradient ($\delta n = \delta p$ by quasi-neutrality), so they diffuse too. Far away it's pure drift.
      `, { cur: PF.row([{ svg: currentFig(), cap: 'forward-biased p⁺-n: hole current hands over to electron current within a few L_p' }]) }),
      Q(md`**Predict first.** At a distance of one $L_p$ into the n side of a forward-biased p⁺-n diode (electron injection negligible), what fraction of the current is still holes?`,
        [md`$1/e \approx 37\%$`, '50%', '0%', '100%'], 0,
        [null, md`The hole current decays as $e^{-x/L_p}$, not linearly.`, md`They take several $L_p$ to recombine.`, 'They\'ve begun recombining.'],
        md`$I_p(L_p) = I_p(0)e^{-1}$: 37% holes, 63% electrons.`),
      R(md`
        ### The field in the neutral regions is tiny (objective 11)

        Far from the junction the current is all majority-electron drift: $J = q\mu_nN_d\mathscr{E}$, so

        $$\mathscr{E} = \frac{J}{q\mu_nN_d}$$

        With $J = 0.15$ A/cm², $N_d = 10^{16}$, $\mu_n = 1350$: $\mathscr{E} = 0.15/(1.6\times10^{-19}\times1350\times10^{16}) = 0.07$ V/cm. Across 100 μm of neutral region that's 0.7 mV. Compare 0.6 V across the junction: this is why we put all of the applied voltage across the depletion region, and why minority carriers there move by diffusion, not drift (their drift current $q\mu_pp\mathscr{E}$ is $p/N_d \sim 10^{-2}$ or less of the electron drift).

        It gets bigger at high current (the drop becomes series resistance, topic 19) and smaller with heavier doping.
      `),
      R(md`
        ### Temperature, quickly

        $I_0 \propto n_i^2 \propto T^3e^{-E_g/kT}$. Near 300 K in Si, $\frac{d\ln I_0}{dT} = \frac3T + \frac{E_g}{kT^2} \approx 0.01 + 0.144 = 15\%$ per kelvin: **×2 every ~5 K**. At a fixed current, $V = \frac{kT}{q}\ln(I/I_0)$ falls by about **2 mV/K** (the classic diode thermometer). In reverse, the leakage grows the same way (the diffusion part does; topic 19 adds generation current, which grows more slowly).
      `),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$I = I_0\left(e^{qV/kT} - 1\right) \qquad I_0 = qA\left(\frac{D_p}{L_p}p_n + \frac{D_n}{L_n}n_p\right) = qAn_i^2\left(\frac{D_p}{L_pN_d} + \frac{D_n}{L_nN_a}\right) \qquad L = \sqrt{D\tau}$$

        $$I_p(x_n) = qA\frac{D_p}{L_p}\Delta p_ne^{-x_n/L_p} \qquad I_n(x_n) = I - I_p(x_n) \qquad Q_p = qAL_p\Delta p_n = I_p\tau_p \qquad \mathscr{E}_{far} = \frac{J}{q\mu_nN_d}$$

        - Light side dominates; hole/electron ratio $= \frac{(D_p/L_p)N_a}{(D_n/L_n)N_d}$.
        - 60 mV/decade, 18 mV per doubling; $I_0$ ×2 per 5 K; $V$ at fixed $I$: −2 mV/K.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          A Si p⁺-n diode at 300 K, 100 μm × 100 μm: $N_a = 10^{18}$, $N_d = 10^{16}\,\text{cm}^{-3}$; holes in the n side $D_p = 12$ cm²/s, $\tau_p = 1\,\mu$s; electrons in the p side $D_n = 25$ cm²/s, $\tau_n = 0.1\,\mu$s; $\mu_n = 1350$ in the n side. (a) $L_p$, $L_n$, $I_0$ and the hole fraction. (b) $I$ at 0.60 V. (c) The hole and electron currents one $L_p$ into the n side. (d) The field far from the junction in the n side. (e) The voltage needed for 1 mA.

        **1. Governing equations.** $L = \sqrt{D\tau}$; $I_0 = qA(\frac{D_p}{L_p}p_n + \frac{D_n}{L_n}n_p)$; $I_p(x_n) = I_p(0)e^{-x_n/L_p}$; $\mathscr{E} = J/q\mu_nN_d$; $V = \frac{kT}{q}\ln(1 + I/I_0)$.

        **2. Units.** $A = (10^{-2}\,\text{cm})^2 = 10^{-4}$ cm²; $p_n = 2.25\times10^4$, $n_p = 225\,\text{cm}^{-3}$.

        **3. Substitute.**
        $$L_p = \sqrt{(12)(10^{-6})} = 3.46\times10^{-3}\,\text{cm} \qquad L_n = \sqrt{(25)(10^{-7})} = 1.58\times10^{-3}\,\text{cm}$$
        $$I_{p0} = (1.6\times10^{-19})(10^{-4})\frac{12}{3.46\times10^{-3}}(2.25\times10^4) = 1.25\times10^{-15}\,\text{A} \qquad I_{n0} = (1.6\times10^{-19})(10^{-4})\frac{25}{1.58\times10^{-3}}(225) = 5.7\times10^{-17}\,\text{A}$$

        **4. Answers.** (a) $L_p = 34.6$ μm, $L_n = 15.8$ μm, $I_0 = 1.30\times10^{-15}$ A, 95.6% holes. (b) $I = 1.30\times10^{-15}(e^{0.6/0.0259} - 1) = 15.0\,\mu$A. (c) At $x_n = L_p$: $I_p = 0.956\times15.0\,e^{-1} = 5.28\,\mu$A, $I_n = 15.0 - 5.28 = 9.7\,\mu$A. (d) $J = 0.150$ A/cm², $\mathscr{E} = 0.150/(1.6\times10^{-19}\cdot1350\cdot10^{16}) = 0.0695$ V/cm. (e) $V = 0.0259\ln(10^{-3}/1.30\times10^{-15}) = 0.709$ V.

        !!mistake Common mistakes
          - Using $N_a$ for the hole term: holes are injected **into the n side**, so their term has $p_n = n_i^2/N_d$ and the n-side $D_p$, $L_p$.
          - Using diffusion lengths in μm with $D$ in cm²/s.
          - Forgetting area: $J$ vs $I$.
          - Assuming the hole current is constant through the n side: it decays and electrons take over.
      `),
    ],
    qs: [
      Q(md`Why can we ignore **drift** of minority holes in the neutral n region of a forward-biased diode?`,
        [md`the field there is tiny and so is $p$, so $q\mu_pp\mathscr{E}$ is negligible next to the diffusion current`, 'there is no field at all', 'holes cannot drift in n-type material', 'drift cancels diffusion there'], 0,
        [null, md`There is a small field (it carries the majority current).`, 'They can; there just aren\'t many.', 'That is equilibrium.'],
        md`Minority carriers: few of them, small field, steep gradient → diffusion wins.`),
      Q(md`A diode's lifetime is cut by 4 (gold doping). At a fixed forward voltage, the current…`,
        ['doubles', 'goes ×4', 'halves', 'stays the same'], 0,
        [null, md`$D/L = \sqrt{D/\tau}$: square root.`, 'Shorter lifetime gives more current.', md`$L$ changes.`],
        md`$I_0 \propto 1/L \propto \tau^{-1/2}$: ×$\sqrt4$ = ×2.`),
      Q(md`In a long p⁺-n diode carrying forward current, which carriers carry the current at the **n-side ohmic contact**, far from the junction?`,
        ['majority electrons, by drift', 'minority holes, by diffusion', 'holes and electrons equally', 'no current flows there'], 0,
        [null, md`The holes recombined within a few $L_p$.`, 'No.', 'The current is continuous.'],
        md`Beyond a few $L_p$ it's all electron drift.`),
      Q(md`Doubling the forward current through a diode requires about how much more voltage?`,
        ['18 mV', '60 mV', '0.7 V', '26 mV'], 0,
        [null, 'That gives ×10.', 'That is the whole turn-on voltage.', md`$kT/q$ gives ×$e$ = ×2.72.`],
        md`$\frac{kT}{q}\ln 2 = 25.9 \times 0.693 = 18$ mV.`),
      Q(md`The total current through a forward-biased diode is constant along $x$, but $I_p$ decays in the n side. Where do the "missing" holes go?`,
        ['they recombine with electrons flowing in from the n contact', 'they pile up at the contact', 'they turn into electrons', 'they drift back to the p side'], 0,
        [null, 'Steady state: nothing piles up.', 'Charge is conserved by recombination with electrons.', 'They diffuse away from the junction.'],
        md`Each recombination needs an electron, so the electron current rises exactly as the hole current falls.`),
    ],
  };

  // ======================================================================== Topic 18
  const T18 = {
    id: 't18-narrow', topic: 18, sec: 'Narrow-base handout', title: 'The narrow-base diode',
    why: md`Real diodes in integrated circuits are rarely "long": layers are a few μm thick, much shorter than a diffusion length. Put the contact close and the physics simplifies to a **straight line**, the current goes up, the stored charge goes way down, and you have the base of a bipolar transistor. Objective 12 asks for the voltage drop across that base. (In past terms this lecture came right before or after Exam 2; know the straight-line results cold either way.)`,
    build: [
      RF(md`
        ### Put the ohmic contact inside a diffusion length

        Same p⁺-n diode, but the n⁺ ohmic contact sits only $\ell \ll L_p$ from the depletion edge. At an ohmic contact, excess carriers recombine essentially instantly (lifetime there is $10^4$× shorter), so the boundary condition is $\delta p(\ell) = 0$. At the junction edge the law of the junction still sets $\delta p(0) = \Delta p_n$.

        Holes now reach the contact in much less than a lifetime, so almost none recombine on the way. No recombination → the hole current is the same everywhere → the gradient is the same everywhere → **the profile is a straight line**:

        [[fig:nb]]

        $$\frac{d\,\delta p}{dx_n} = -\frac{\Delta p_n}{\ell} \qquad I_p = qAD_p\frac{\Delta p_n}{\ell} = qA\frac{D_p}{\ell}p_n\left(e^{qV/kT} - 1\right)$$

        The long-diode formula with **$L_p$ replaced by $\ell$**. Since $\ell \ll L_p$, the current is $L_p/\ell$ times larger at the same voltage: forcing the holes to zero much sooner makes a much steeper gradient.

        (The exact solution of the diffusion equation gives $\frac{D_p}{L_p}\coth\frac{\ell}{L_p}$, which → $\frac{D_p}{\ell}$ for $\ell \ll L_p$ and → $\frac{D_p}{L_p}$ for $\ell \gg L_p$. The straight line is fine for $\ell \lesssim 0.5L_p$.)
      `, { nb: PF.row([{ svg: narrowFig(), cap: 'same edge density; the contact forces δp = 0 at ℓ' }]) }),
      Q(md`**Predict first.** Compared with the long diode at the same voltage, the stored hole charge in the narrow base is…`,
        [md`much smaller: a triangle of base $\ell$ instead of an exponential of length $L_p$`, 'larger, because the current is larger', 'the same: same $\\Delta p_n$', 'zero'], 0,
        [null, md`More current, but the holes leave much faster.`, md`Same height, much shorter base.`, md`There is a triangle of holes.`],
        md`$Q_p = \frac12qA\ell\Delta p_n$ vs $qAL_p\Delta p_n$.`),
      R(md`
        ### Stored charge and transit time

        $$Q_p = \tfrac12qA\ell\,\Delta p_n \qquad t_t = \frac{Q_p}{I_p} = \frac{\tfrac12qA\ell\Delta p_n}{qAD_p\Delta p_n/\ell} = \frac{\ell^2}{2D_p}$$

        In the long diode, current = stored charge / **lifetime** (holes leave by recombining). In the narrow diode, current = stored charge / **transit time** (holes leave by hitting the contact). $t_t \ll \tau_p$ is what makes narrow-base diodes (and BJTs) fast: less stored charge to remove when switching.

        A few holes do recombine on the way, and each one needs an electron from the n⁺ contact. That small electron current is $Q_p/\tau_p$; as a fraction of the hole current, it's $t_t/\tau_p = \ell^2/2L_p^2$, tiny. (In a BJT this is the base recombination current.)
      `),
      R(md`
        ### The voltage drop across the quasi-neutral base (objective 12)

        Quasi-neutrality says the excess electrons in the base equal the excess holes: $\delta n(x) = \delta p(x)$, the same straight line. So the electrons have a gradient too, $d\,\delta n/dx = -\Delta p_n/\ell$, and on their own they'd diffuse toward the contact. But the electron current in the base is essentially zero (only the tiny recombination supply). Something has to hold them back: a small electric field, whose electron drift cancels their diffusion:

        $$J_n = q\mu_nN_d\mathscr{E} + qD_n\frac{d\,\delta n}{dx} \approx 0 \quad\Longrightarrow\quad \mathscr{E} = \frac{D_n}{\mu_n}\frac{1}{N_d}\frac{\Delta p_n}{\ell} = \frac{kT}{q}\frac{\Delta p_n}{N_d\,\ell}$$

        The voltage across the base is that field times $\ell$:

        $$V_{base} = \mathscr{E}\ell = \frac{kT}{q}\frac{\Delta p_n}{N_d}$$

        Look at what that says: at **low-level injection** ($\Delta p_n \ll N_d$), the base drop is a small fraction of $kT/q$: microvolts to a millivolt. Independent of $\ell$ (narrower base: steeper gradient, bigger field, shorter distance). It only becomes comparable to $kT/q$ when injection approaches high level. (More exactly, $V_{base} = \frac{kT}{q}\ln\frac{N_d + \Delta p_n}{N_d}$, which reduces to the same thing.) The field points toward the contact, so it gives the holes a small extra push in the same direction they diffuse: negligible at low level.
      `),
      Q(md`**Predict first.** The base of a narrow-base diode is made half as wide, same voltage. The voltage drop across the neutral base…`,
        ['stays the same', 'halves', 'doubles', 'goes ×4'], 0,
        [null, md`The field doubles (gradient ×2) while the length halves.`, 'The field is steeper but acts over less distance.', 'Field ×2, length ×½.'],
        md`$V_{base} = \frac{kT}{q}\frac{\Delta p_n}{N_d}$: no $\ell$.`),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$\delta p(x_n) = \Delta p_n\left(1 - \frac{x_n}{\ell}\right) \qquad I = qA\frac{D_p}{\ell}p_n\left(e^{qV/kT} - 1\right) \qquad Q_p = \tfrac12qA\ell\Delta p_n \qquad t_t = \frac{\ell^2}{2D_p}$$

        $$I_n(\text{recomb}) = \frac{Q_p}{\tau_p} \qquad \frac{I_n}{I_p} = \frac{\ell^2}{2L_p^2} \qquad V_{base} = \frac{kT}{q}\frac{\Delta p_n}{N_d}$$

        On the formula sheet (Short Base Diode): $I_p = qAD_p\Delta p_n/\ell$, $Q_p = \frac12qA\ell\Delta p_n$.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          A Si p⁺-n diode, $A = 10^{-4}$ cm², $N_d = 10^{16}\,\text{cm}^{-3}$, $D_p = 12$ cm²/s, $\tau_p = 1\,\mu$s, has its n⁺ contact $\ell = 1.0\,\mu$m from the depletion edge. At $V = 0.60$ V find $\Delta p_n$, the current (and compare with a long diode), the stored charge, the transit time, and the voltage drop across the neutral base.

        **1. Governing equations.** $\Delta p_n = p_n(e^{qV/kT} - 1)$; $I = qAD_p\Delta p_n/\ell$; $Q_p = \frac12qA\ell\Delta p_n$; $t_t = \ell^2/2D_p$; $V_{base} = \frac{kT}{q}\frac{\Delta p_n}{N_d}$.

        **2. Units.** $\ell = 10^{-4}$ cm; $L_p = \sqrt{12\times10^{-6}} = 34.6\,\mu$m, so $\ell/L_p = 0.03$ ✓ narrow.

        **3. Substitute.**
        $$\Delta p_n = (2.25\times10^4)(1.15\times10^{10}) = 2.59\times10^{14}\,\text{cm}^{-3} \qquad I = \frac{(1.6\times10^{-19})(10^{-4})(12)(2.59\times10^{14})}{10^{-4}\,\text{cm}}$$

        **4. Answers.** $\Delta p_n = 2.59\times10^{14}\,\text{cm}^{-3}$; $I = 0.497$ mA (a long diode would carry $I\ell/L_p = 14.4\,\mu$A: 34.6× less); $Q_p = 2.07\times10^{-13}$ C; $t_t = (10^{-4})^2/24 = 417$ ps (vs $\tau_p = 1\,\mu$s); $V_{base} = 0.0259\times(2.59\times10^{14}/10^{16}) = 0.67$ mV.

        !!mistake Common mistakes
          - Using $L_p$ in the current when the base is narrow.
          - Writing the stored charge as a rectangle ($qA\ell\Delta p_n$): it's a triangle.
          - Using $\tau_p$ as the charge's exit time: in a narrow base it's $t_t = \ell^2/2D_p$.
      `),
    ],
    qs: [
      Q(md`Why is the excess hole profile in a narrow base a straight line?`,
        ['almost no holes recombine on the way, so the current (∝ gradient) is constant', 'the field is uniform', 'the contact is ohmic', 'the doping is uniform'], 0,
        [null, md`Holes move by diffusion; the field isn't what shapes the profile.`, md`That sets the end value ($\delta p = 0$), not the shape.`, 'Uniform doping also holds in a long diode, which is exponential.'],
        md`$\frac{d^2\delta p}{dx^2} = \frac{\delta p}{L_p^2} \approx 0$ over $\ell \ll L_p$: linear.`),
      Q(md`A narrow-base diode switches off much faster than a long one because…`,
        [md`it stores far less minority charge ($\frac12qA\ell\Delta p_n$), and it leaves in the transit time`, 'its current is smaller', 'it has no depletion capacitance', 'holes recombine faster in it'], 0,
        [null, 'At the same voltage it carries more current.', md`It has $C_j$ like any junction.`, md`The lifetime is the same; the holes just leave by the contact first.`],
        md`At the same current, $Q_p = It_t$ vs $I\tau_p$: $t_t \ll \tau_p$.`),
      Q(md`In the narrow base, which way does the small electric field point (p⁺ side on the left, contact on the right)?`,
        ['toward the contact (+x): it pushes electrons back toward the junction', 'toward the junction', 'there is no field', 'it alternates'], 0,
        [null, md`Electrons diffuse toward the contact (+x); to cancel that, the force on them must point −x, so $\mathscr{E}$ points +x.`, 'Quasi-neutrality needs one.', 'Steady state.'],
        md`Force on an electron is $-q\mathscr{E}$: field +x ⇒ push −x.`),
    ],
  };

  // ======================================================================== Topic 19
  const T19 = {
    id: 't19-break', topic: 19, sec: '5.4, 5.6', title: 'Reverse breakdown and real-diode behavior',
    why: md`Push reverse bias far enough and the current shoots up: breakdown. It's not a failure (Zener diodes are designed to live there, as voltage references and surge protection), but you must predict **at what voltage** and **by which mechanism**, and know how each one reacts to doping and temperature. HW7 problem 4 is exactly this. Then: the four ways a real diode differs from $I_0(e^{qV/kT} - 1)$.`,
    build: [
      RF(md`
        ### Two ways a junction gives way

        [[fig:iv]]

        **Avalanche (impact ionization).** In a strong field, a carrier accelerates between collisions. If it gains about $E_g$ (in practice ~1.5$E_g$) before it scatters, it can knock an electron out of a bond: a new electron-hole pair. Both new carriers accelerate too and can ionize again. If each carrier crossing the depletion region has probability $P$ of an ionizing collision:

        $$M = 1 + P + P^2 + \dots = \frac{1}{1 - P}$$

        As the field rises, $P \to 1$ and $M \to \infty$: breakdown. Avalanche needs a **wide** depletion region (room to accelerate and multiply) and happens when the peak field hits a critical value $\mathscr{E}_{crit}$ (a few $\times10^5$ V/cm in Si). For a p⁺-n junction:

        $$\mathscr{E}_0 = \sqrt{\frac{2qN_d(V_0 + V_R)}{\epsilon}} = \mathscr{E}_{crit} \quad\Longrightarrow\quad V_{br} \approx \frac{\epsilon\mathscr{E}_{crit}^2}{2qN_d}$$

        **The light side's doping sets it**, inversely: halve $N_d$, double $V_{br}$. High-voltage diodes have a lightly doped side.

        **Zener (tunneling).** Dope **both** sides heavily ($\gtrsim10^{18}$). The depletion region becomes ~10 nm thin, and under a small reverse bias the filled valence band on the p side lines up with the empty conduction band on the n side, separated only by that thin barrier. Electrons tunnel straight across. Needs ~$10^6$ V/cm, but reached at just a few volts because $W$ is so thin.
      `, { iv: PF.row([{ svg: ivFig(), cap: 'exponential forward, tiny saturating reverse, then breakdown at −V_br' }]) }),
      Q(md`**Predict first.** Why does avalanche breakdown voltage **rise** with temperature?`,
        ['more phonon scattering: carriers lose energy before they can ionize, so a bigger field is needed', 'the band gap grows', 'there are fewer carriers to start the avalanche', 'the depletion region shrinks'], 0,
        [null, md`$E_g$ shrinks with T (that's the Zener story).`, md`More carriers are generated when hot, not fewer.`, md`$W$ is set by doping and voltage.`],
        md`Hotter lattice → shorter mean free path → less energy gained per flight → need more field → higher $V_{br}$. Positive coefficient.`),
      R(md`
        ### Telling them apart in 10 seconds

        | | Zener (tunneling) | Avalanche (impact ionization) |
        |---|---|---|
        | doping | both sides heavy | at least one side light |
        | $W$ | very thin (~10 nm) | wide |
        | $V_{br}$ (Si) | below ~$4E_g/q$ ≈ 4.5 V | above ~$6E_g/q$ ≈ 6.7 V |
        | temperature coefficient | **negative**: $E_g$ shrinks with T, easier tunneling | **positive**: more scattering |
        | knee | soft | sharp |

        Between ~4.5 and ~6.7 V in Si both act, and the temperature coefficients can cancel: that's why ~5–6 V reference diodes are the most temperature-stable.

        Bigger band gap → bigger $V_{br}$ for both (more energy to ionize, thicker tunneling barrier). More doping → lower $V_{br}$, and eventually a switch from avalanche to Zener.

        HW7 problem 4: double $N_d$ in a p⁺-n that was avalanching. $C_j$ ↑ ($W$ ↓), $V_0$ ↑ (slightly), $V_{br}$ ↓ (the field rises faster with voltage), and Zener becomes **more likely** but you can't say it takes over without numbers. If it did, the temperature coefficient would flip negative.
      `),
      Q(md`**Predict first.** A Si diode breaks down at 3.3 V. As it warms up, its breakdown voltage…`,
        ['decreases (Zener)', 'increases (avalanche)', 'stays fixed', 'cannot be predicted'], 0,
        [null, md`3.3 V < 4.5 V: Zener.`, md`Both mechanisms depend on T.`, md`$V_{br}$ tells you the mechanism.`],
        md`3.3 V is well below $4E_g/q$: tunneling, negative temperature coefficient.`),
      R(md`
        ### Real diodes: four departures from the ideal (L23–L24)

        The ideal equation assumed: depletion approximation, Boltzmann statistics, **low-level injection**, **no generation or recombination inside the depletion region**, and **no voltage lost outside the junction**. Break each one:

        **1. Generation current in reverse bias.** Traps inside the depletion region generate pairs, and the field sweeps them out before they can recombine. Rate $\approx n_i/2\tau_0$ per volume, so $I_{gen} = \frac{qAn_iW}{2\tau_0}$. It grows with $W \propto \sqrt{V_0 + V_R}$, so real reverse currents **creep up** instead of saturating. In Si at room temperature it's usually bigger than the diffusion $I_0$, because it goes as $n_i$, not $n_i^2$. When hot, $n_i^2$ catches up and diffusion wins.

        **2. Recombination current in forward bias.** At low forward bias, carriers recombine inside the depletion region: $I_{rec} \propto e^{qV/2kT}$. On a $\log I$ vs $V$ plot that's a slope of 120 mV/decade, ideality factor $n = 2$.

        **3. High-level injection.** At large forward bias $\Delta p_n$ approaches $N_d$; the majority density rises too, and $I \propto e^{qV/2kT}$ again ($n = 2$). Lighter doping enters high level sooner.

        **4. Series resistance.** At large current the neutral regions and contacts drop $IR_s$: $V_{applied} = V_{junction} + IR_s$, and the curve turns from exponential to nearly linear.

        $$I \propto e^{qV/nkT}: \quad n = 1 \text{ (ideal, 60 mV/dec)} \qquad n = 2 \text{ (recombination at low current, or high-level injection: 120 mV/dec)}$$
      `),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$V_{br} \approx \frac{\epsilon\mathscr{E}_{crit}^2}{2qN_{light}} \qquad W_{br} = \frac{2V_{br}}{\mathscr{E}_{crit}} \qquad M = \frac{1}{1 - P} \qquad I_{gen} = \frac{qAn_iW}{2\tau_0} \qquad I \propto e^{qV/nkT}$$

        - Zener: heavy/heavy, thin, low $V_{br}$ (< $4E_g/q$), negative T coefficient.
        - Avalanche: light side, wide, high $V_{br}$ (> $6E_g/q$), positive T coefficient.
        - $V_{br}$ ↓ with doping, ↑ with $E_g$.
        - Ideality 1 → 60 mV/dec; 2 → 120 mV/dec; series $R$ → linear at high current; generation → reverse current ∝ $\sqrt{V_0 + V_R}$.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          (a) A Si p⁺-n junction has $N_d = 10^{16}\,\text{cm}^{-3}$ and breaks down when the field reaches $4\times10^5$ V/cm. Find $V_{br}$ and $W$ at breakdown; name the mechanism and the sign of its temperature coefficient. (b) Repeat for $N_d = 10^{18}$, where the breakdown field is $10^6$ V/cm. (c) Without numbers: what does doubling $N_d$ in (a) do to $V_{br}$ and to $C_j$ at zero bias?

        **1. Governing equation.** $\mathscr{E}_0 = qN_dW/\epsilon$ and $V = \frac12\mathscr{E}_0W$ ⇒ $V_{br} = \epsilon\mathscr{E}_{crit}^2/2qN_d$ (neglecting $V_0$).

        **2. Units.** $\epsilon = 1.044\times10^{-12}$ F/cm.

        **3. Substitute.**
        $$V_{br} = \frac{(1.044\times10^{-12}\,\text{F/cm})(4\times10^5\,\text{V/cm})^2}{2(1.6\times10^{-19}\,\text{C})(10^{16}\,\text{cm}^{-3})}$$

        **4. Answers.** (a) $V_{br} = 52.2$ V, $W_{br} = 2(52.2)/(4\times10^5) = 2.61\,\mu$m: avalanche, positive temperature coefficient. (b) $V_{br} = 3.26$ V: Zener, negative coefficient. (c) $V_{br}$ halves (∝ $1/N_d$); $C_j$ rises by about $\sqrt2$ (∝ $\sqrt{N_d}$).

        !!mistake Common mistakes
          - Thinking more doping raises $V_{br}$. It lowers it.
          - Swapping the temperature coefficients. Zener: $E_g$ ↓ → easier → $V_{br}$ ↓.
          - Calling breakdown destructive: it's reversible if the current (heat) is limited.
      `),
    ],
    qs: [
      Q(md`Zener breakdown needs heavy doping on **both** sides because…`,
        ['the barrier must be thin (~10 nm) for tunneling, and filled states must face empty states across it', 'the field must be small', md`$V_0$ must be small`, 'avalanche must be suppressed'], 0,
        [null, 'It needs a huge field.', md`Heavy doping makes $V_0$ larger.`, 'That is a side effect, not the reason.'],
        md`Tunneling probability falls exponentially with barrier thickness.`),
      Q(md`A high-voltage rectifier must block 1000 V. Its design should have…`,
        ['a very lightly doped side (and a wide one)', 'both sides heavily doped', 'a small band gap', 'a short lifetime'], 0,
        [null, 'That makes a Zener at a few volts.', md`Larger $E_g$ helps.`, 'Lifetime affects switching, not breakdown.'],
        md`$V_{br} \propto 1/N$: light doping, and the region must be wide enough to hold $W_{br} = 2V_{br}/\mathscr{E}_{crit}$.`),
      Q(md`A Si diode's reverse current at room temperature keeps rising roughly as $\sqrt{V_R}$. Most likely:`,
        ['generation in the depletion region', 'avalanche multiplication', 'the ideal diffusion current', 'series resistance'], 0,
        [null, md`That rises steeply near $V_{br}$, not as a square root.`, 'It saturates.', 'That matters in forward bias at high current.'],
        md`$I_{gen} \propto W \propto \sqrt{V_0 + V_R}$.`),
      Q(md`On a log-current plot, a forward I–V has slope 60 mV/decade in the middle, 120 mV/decade at the lowest currents, and bends over at the highest. The three regions are…`,
        ['recombination in the depletion region; ideal diffusion; series resistance / high level', 'ideal; recombination; breakdown', 'series resistance; ideal; generation', 'all ideal'], 0,
        [null, 'Order: low current is recombination (n = 2).', 'Generation is reverse bias.', 'The slope changes.'],
        md`Low: $n = 2$ recombination. Middle: $n = 1$. High: high-level injection ($n = 2$) and $IR_s$.`),
    ],
  };

  // ======================================================================== Topic 20
  const T20 = {
    id: 't20-cap', topic: 20, sec: '5.5', title: 'Capacitance and switching: Cj, Cs and the storage delay',
    why: md`A diode stores charge in two places: the fixed ions in its depletion region (reverse bias, $C_j$) and the minority carriers in its neutral regions (forward bias, $C_s$). Both limit how fast it can switch. Three objectives live here: $C_j$ in reverse bias, $C_s$ in forward bias, and the **storage delay time** when you switch a diode off.`,
    build: [
      RF(md`
        ### Junction (depletion) capacitance: a parallel-plate capacitor that tunes itself

        Capacitance is $C = dQ/dV$: how much charge moves for a small change in voltage. In reverse bias, increasing $V_R$ by $dV$ uncovers a thin extra sliver of donor ions at $x_{n0}$ and of acceptor ions at $-x_{p0}$. Equal and opposite charge added at two "plates" a distance $W$ apart, with semiconductor in between: a parallel-plate capacitor.

        $$C_j = \frac{\epsilon A}{W} = A\left[\frac{q\epsilon}{2(V_0 - V)}\frac{N_aN_d}{N_a + N_d}\right]^{1/2}$$

        It **depends on voltage**: more reverse bias → wider $W$ → smaller $C_j \propto (V_0 + V_R)^{-1/2}$. Diodes built to exploit this are **varactors** (tuning circuits).

        **Measuring doping (C–V profiling).** For a p⁺-n:

        $$\frac{1}{C_j^2} = \frac{2(V_0 + V_R)}{q\epsilon A^2N_d}$$

        a straight line in $V_R$. The slope gives $N_d$ (steeper = lighter doping); extrapolating to $1/C^2 = 0$ gives $V_R = -V_0$.

        [[fig:cv]]

        **Anchor:** $\epsilon_{Si}/W$ with $W$ = 1 μm is ~10 nF/cm², so 100 μm × 100 μm ≈ 1 pF.
      `, { cv: PF.row([{ svg: cvFig(), cap: 'p⁺-n: 1/C² vs reverse bias is a line' }]) }),
      Q(md`**Predict first.** A p⁺-n varactor at $V_0 + V_R = 1$ V has 4 pF. At $V_0 + V_R = 16$ V it has…`,
        ['1 pF', '0.25 pF', '2 pF', '16 pF'], 0,
        [null, md`$C \propto V^{-1/2}$, not $V^{-1}$.`, md`$\sqrt{16} = 4$.`, 'Wider depletion, smaller capacitance.'],
        md`$C_j \propto (V_0 + V_R)^{-1/2}$: ×1/4.`),
      R(md`
        ### Charge-storage (diffusion) capacitance in forward bias

        In forward bias, a second, much larger charge is stored: the injected minority carriers. From topic 17, $Q_p = qAL_p\Delta p_n = I_p\tau_p$. It grows as $e^{qV/kT}$, so

        $$C_s = \frac{dQ_p}{dV} = \frac{q}{kT}Q_p = \frac{q}{kT}I_p\tau_p \qquad G_s = \frac{dI}{dV} = \frac{q}{kT}I \qquad C_s = G_s\tau_p$$

        **Size:** at 1 mA with $\tau_p = 1\,\mu$s, $C_s = 10^{-9}/0.0259 = 38.6$ nF, versus ~1 pF of $C_j$. In forward bias $C_s$ dominates by orders of magnitude; in reverse bias $C_s \approx 0$ and $C_j$ is all there is. The small-signal model of a forward diode is $G_s$ (resistance $r = 26\,\text{mV}/I$: 26 Ω at 1 mA) in parallel with $C_s$, and its corner frequency is $f = G_s/2\pi C_s = 1/2\pi\tau_p$: **the lifetime sets the speed**.

        Notice $C_s$ at a **fixed current** depends only on $\tau_p$, not on doping or area.

        (Streetman and the slides: in a short/narrow diode only part of the stored charge is reclaimable when switching (often quoted as 2/3); the slides flag this as debated. For a long diode use $C_s = \frac{q}{kT}I\tau_p$.)
      `),
      RF(md`
        ### Switching off: the storage delay time (objective 7)

        A diode carries $I_f$ forward. At $t = 0$ the circuit flips (say a source switches from $+V_f$ to $-V_r$ through a resistor $R$). You might expect the current to drop to $-I_0$ instantly. It doesn't.

        **Why:** the junction voltage is set by $\Delta p_n$ at the edge (law of the junction). The stored holes can't vanish instantly, so the junction **stays forward biased** (~0.7 V) while they drain. Meanwhile the circuit forces a big reverse current $I_r \approx V_r/R$ (the junction's 0.7 V is small next to $V_r$), pulling holes back across the junction. Two things drain the store at once: extraction ($I_r$) and recombination ($Q_p/\tau_p$).

        [[fig:t]]

        **Charge control.** $Q_p(0) = I_f\tau_p$, and for $t > 0$

        $$\frac{dQ_p}{dt} = -I_r - \frac{Q_p}{\tau_p} \quad\Longrightarrow\quad Q_p(t) = \tau_p\left[(I_f + I_r)e^{-t/\tau_p} - I_r\right]$$

        Setting $Q_p = 0$:

        $$t_{sd} = \tau_p\ln\left(1 + \frac{I_f}{I_r}\right)$$

        After $t_{sd}$ the edge empties, the junction finally reverse-biases, and the current decays to $-I_0$ as $C_j$ charges (the recovery tail). (The exact diffusion solution gives $\text{erf}\sqrt{t_{sd}/\tau_p} = I_f/(I_f + I_r)$; the charge-control log is the standard estimate.)

        **To switch faster:** shorter $\tau_p$ (gold doping), larger $I_r$ (pull harder), smaller $I_f$ (store less), a narrow base (store far less), or a Schottky diode (no minority storage at all).
      `, { t: PF.row([{ svg: tsdFig(), cap: 'turn-off: the current is stuck at −Ir while the stored holes drain' }]) }),
      Q(md`**Predict first.** $I_f = I_r$. The storage delay is…`,
        [md`$\tau_p\ln 2 \approx 0.69\tau_p$`, md`$\tau_p$`, md`$\tau_p/2$`, '0'], 0,
        [null, md`$\ln(1 + 1) = 0.69$.`, 'Not linear.', md`Charge has to be removed first.`],
        md`$t_{sd} = \tau_p\ln(1 + I_f/I_r) = \tau_p\ln 2$.`),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$C_j = \frac{\epsilon A}{W} = A\left[\frac{q\epsilon}{2(V_0 - V)}\frac{N_aN_d}{N_a + N_d}\right]^{1/2} \qquad \frac{1}{C_j^2} = \frac{2(V_0 + V_R)}{q\epsilon A^2N_d}\ (\text{p⁺-n})$$

        $$Q_p = I_p\tau_p \qquad G_s = \frac{q}{kT}I \qquad C_s = \frac{q}{kT}I\tau_p = G_s\tau_p \qquad t_{sd} = \tau_p\ln\left(1 + \frac{I_f}{I_r}\right)$$

        Reverse: $C_j$ (pF). Forward: $C_s$ (nF at mA). Fast diodes: short $\tau$, narrow base, Schottky.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          A Si p⁺-n diode, $A = 10^{-4}$ cm², $N_a = 10^{18}$, $N_d = 10^{16}\,\text{cm}^{-3}$, $\tau_p = 1\,\mu$s. (a) $C_j$ at zero bias and at 5 V reverse. (b) At 1 mA forward: $G_s$, $r$ and $C_s$. (c) The diode is switched from 1 mA forward to 0.5 mA reverse: storage delay?

        **1. Governing equations.** $V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$; $W = \sqrt{2\epsilon(V_0 + V_R)/qN_d}$; $C_j = \epsilon A/W$; $G_s = I/(kT/q)$; $C_s = G_s\tau_p$; $t_{sd} = \tau_p\ln(1 + I_f/I_r)$.

        **2. Units.** $\epsilon = 1.044\times10^{-12}$ F/cm.

        **3. Substitute.**
        $$V_0 = 0.0259\ln\frac{10^{34}}{2.25\times10^{20}} = 0.814\,\text{V} \qquad W(5\,\text{V}) = \sqrt{\frac{2(1.044\times10^{-12})(5.814)}{(1.6\times10^{-19})(10^{16})}} = 8.71\times10^{-5}\,\text{cm}$$

        **4. Answers.** (a) $C_j(0) = 3.20$ pF; $C_j(5\,\text{V}) = (1.044\times10^{-12})(10^{-4})/(8.71\times10^{-5}) = 1.20$ pF. (b) $G_s = 10^{-3}/0.0259 = 38.6$ mS ($r = 25.9\,\Omega$); $C_s = (38.6\,\text{mS})(1\,\mu\text{s}) = 38.6$ nF: 10⁴× $C_j$. (c) $t_{sd} = (1\,\mu\text{s})\ln 3 = 1.10\,\mu$s.

        !!mistake Common mistakes
          - Using $C_j$ in forward bias, or $C_s$ in reverse.
          - $C_s = Q/V$: no, it's $dQ/dV = \frac{q}{kT}Q$.
          - Swapping $I_f$ and $I_r$ in the log. More forward current → **longer** delay.
      `),
    ],
    qs: [
      Q(md`Why does $C_j$ fall as reverse bias increases?`,
        [md`the depletion region (the "dielectric" between the charge layers) gets wider`, 'fewer ions are uncovered', 'the area shrinks', 'the stored minority charge drops'], 0,
        [null, 'More ions are uncovered; $C$ is about $dQ/dV$, the marginal change.', 'The area is fixed.', 'That is $C_s$.'],
        md`$C_j = \epsilon A/W$.`),
      Q(md`Two diodes have the same $\tau_p$. Diode A carries 1 mA, diode B carries 1 mA but has 10× the area. Their $C_s$…`,
        ['are equal', 'B has 10×', 'A has 10×', md`B has $\sqrt{10}$×`], 0,
        [null, md`$C_s = \frac{q}{kT}I\tau_p$: same current, same lifetime.`, 'No.', 'No.'],
        md`At fixed current, $C_s$ depends only on $\tau_p$.`),
      Q(md`During the storage phase of turn-off, the current is about $-I_r$ and the junction voltage is…`,
        ['still forward (near its on value), decreasing slowly', 'immediately at $-V_r$', 'zero', md`above $V_0$`], 0,
        [null, md`The junction can't reverse until $\Delta p_n$ at the edge goes negative.`, 'The stored charge holds it up.', 'No.'],
        md`Law of the junction: as long as $p(x_{n0}) > p_n$, $V > 0$.`),
      Q(md`Which change **lengthens** the storage delay time?`,
        ['a larger forward current before switching', 'a larger reverse current during switching', 'gold doping', 'a narrower base'], 0,
        [null, 'Pulls the charge out faster: shorter.', md`Shorter $\tau_p$: shorter.`, 'Less stored charge: shorter.'],
        md`$t_{sd} = \tau_p\ln(1 + I_f/I_r)$: more stored charge to remove.`),
      Q(md`The corner frequency of a forward-biased long diode, $G_s/2\pi C_s$, is set by…`,
        [md`the minority lifetime: $1/2\pi\tau_p$`, 'the bias current', md`the junction capacitance`, 'the area'], 0,
        [null, md`Both $G_s$ and $C_s$ scale with $I$; it cancels.`, md`$C_j$ is negligible in forward bias.`, 'Cancels.'],
        md`$C_s = G_s\tau_p$.`),
    ],
  };

  C.unit({ id: 'e2-ch5b', exam: 'e2', num: 'Ch. 5', title: 'Diode currents, breakdown, capacitance and switching', lessons: [T17, T18, T19, T20] });
})();

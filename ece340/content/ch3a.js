/* Ch. 3, first half — energy bands and charge carriers at equilibrium (Streetman & Banerjee 3.1–3.3.2). Topics 2–4. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;

  // band diagrams used below (energies in eV; dopant levels drawn farther from the band edge than to scale)
  const intrinsic = BD.diagram({ w: 240, h: 130, Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.555, lab: { EF: 'E_F = E_i', Ei: '' }, el: 4, holes: 4 });
  const ntype = BD.diagram({ w: 240, h: 130, Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.93, donors: { E: 1.0, n: 6, ionized: true, lab: 'E_d' }, el: 6, holes: 1 });
  const ptype = BD.diagram({ w: 240, h: 130, Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.18, acceptors: { E: 0.11, n: 6, ionized: true, lab: 'E_a' }, el: 1, holes: 6 });
  const fermiFig = BD.fermi({ E: [-0.2, 0.2], T: [0, 0.0259, 0.06] });
  const ef4 = BD.diagram({ w: 260, h: 150, Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.91, dims: [{ x: 0.15, a: 'Ec', b: 'EF', tex: '0.20\\,\\text{eV}', at: 'r' }, { x: 0.55, a: 'EF', b: 'Ev', tex: '0.91\\,\\text{eV}', at: 'r' }] });

  C.unit({
    id: 'ch3', exam: 'e1', num: 'Ch. 3', title: 'Energy bands and charge carriers',
    lessons: [
      // ======================================================================== Topic 2
      {
        id: 't2-bands', topic: 2, sec: '3.1', title: 'Bonding, energy bands, direct and indirect gaps, effective mass',
        steps: [
          R(md`
            ### The idea

            A lone atom has sharp energy levels. Bring $N$ atoms together into a crystal and each level splits into $N$ levels packed so tightly that they form a continuous **band**. In silicon the outer $3s$ and $3p$ levels mix and split into two bands of $4N$ states each, separated by a range of energies with **no states at all**: the **band gap**, $E_g$.

            At absolute zero the lower band (the **valence band**) is exactly full and the upper one (the **conduction band**) exactly empty. A full band carries no current (every electron moving one way is matched by one moving the other way), and an empty one has nothing to carry. Conduction needs a band that is **partly** filled. That one fact sorts every solid:

            - **Metal**: a band is partly filled (or two bands overlap), so there are empty states right next to the filled ones. Conducts at any temperature.
            - **Semiconductor**: full valence band, empty conduction band, small gap (Si $1.11$ eV, GaAs $1.43$ eV, Ge $0.67$ eV). At room temperature heat lifts a few electrons across, so it conducts a little, and doping changes that enormously.
            - **Insulator**: the same picture with a big gap (SiO₂ about 9 eV, diamond about 5 eV): essentially no electrons get across.

            **Bonding** decides the bands: ionic (NaCl, electrons transferred), metallic (electrons shared by the whole crystal), covalent (Si, Ge: each atom shares one electron pair with each of its 4 neighbors), and mixed (GaAs: covalent with some ionic character).
          `, BD.bands3()),
          RF(md`
            ### E versus k: direct and indirect gaps

            An electron in a crystal has a wave vector $k$ (momentum $\hbar k$) as well as an energy, and each band is really a curve $E(k)$. What matters is **where** the bottom of the conduction band sits relative to the top of the valence band.

            [[fig:ek]]

            - **Direct gap** (GaAs, InP): the conduction-band minimum is at the same $k$ as the valence-band maximum. An electron can drop straight down and give its energy $E_g$ to a photon. Efficient light emission: LEDs and lasers.
            - **Indirect gap** (Si, Ge): the minimum is at a different $k$. A photon carries almost no momentum, so the transition also needs a **phonon** (a lattice vibration) to supply $\Delta k$. Three-body events are rare, so the energy usually goes into heat instead. Poor light emitters.

            The photon emitted (or needed) across a gap $E_g$ has wavelength
            $$\lambda = \frac{hc}{E_g} \quad\Longrightarrow\quad \lambda\,[\mu\text{m}] = \frac{1.24}{E_g\,[\text{eV}]}$$
            so Si's gap corresponds to $1.12\,\mu$m and GaAs's to $0.867\,\mu$m.
          `, { ek: PF.row([{ svg: BD.ek({ kind: 'direct' }), cap: 'direct (GaAs)' }, { svg: BD.ek({ kind: 'indirect' }), cap: 'indirect (Si)' }]) }),
          RF(md`
            ### Effective mass from the curvature

            Near the bottom of a band, $E(k)$ is a parabola. A free electron has $E = \dfrac{\hbar^2k^2}{2m_0}$; an electron in the crystal behaves the same way with $m_0$ replaced by an **effective mass** $m^*$ that absorbs all the forces of the lattice:

            $$m^* = \frac{\hbar^2}{d^2E/dk^2}$$

            - $m^*$: effective mass, kg (quoted as a multiple of $m_0 = 9.11\times10^{-31}$ kg)
            - $\hbar = h/2\pi = 1.055\times10^{-34}$ J·s
            - $d^2E/dk^2$: curvature of the band, J·m² ($E$ in **joules**, $k$ in $\text{m}^{-1}$)

            [[fig:mass]]

            A **sharply curved** band means a **light** electron (GaAs: $0.067\,m_0$); a flat band means a heavy one. At the top of the valence band the curvature is negative, so electrons there have negative mass; that is exactly what makes a **hole** behave as a positive charge with positive mass.
          `, { mass: { svg: BD.ek({ kind: 'mass' }), cap: 'Same band minimum, different curvature.' } }),
          R(md`
            ### Worked example

            !!graded Problem
              Near the conduction-band minimum of a semiconductor, $E(k) = E_c + Ak^2$ with $A = 5.0\times10^{-38}$ J·m². Find the electron effective mass as a multiple of $m_0$.

            **1. Governing equation.** $m^* = \hbar^2 \big/ \dfrac{d^2E}{dk^2}$.

            **2. Solve symbolically.** $\dfrac{d^2E}{dk^2} = 2A$, so $m^* = \dfrac{\hbar^2}{2A}$ and $\dfrac{m^*}{m_0} = \dfrac{\hbar^2}{2Am_0}$.

            **3. Substitute, with units.**
            $$\frac{m^*}{m_0} = \frac{\left(1.055\times10^{-34}\,\text{J·s}\right)^2}{2\left(5.0\times10^{-38}\,\text{J·m}^2\right)\left(9.11\times10^{-31}\,\text{kg}\right)} = \frac{1.113\times10^{-68}\,\text{J}^2\text{s}^2}{9.11\times10^{-68}\,\text{J·m}^2\text{·kg}}$$
            (J·s²/(m²·kg) = 1, since 1 J = 1 kg·m²/s².)

            **4. Answer.** $m^* = 0.122\,m_0$ $\;(1.11\times10^{-31}$ kg$)$.

            !!mistake Common mistakes
              - Taking $d^2E/dk^2 = A$ instead of $2A$: the factor 2 from differentiating $k^2$.
              - $E$ in eV inside the formula: convert to joules first ($1\,\text{eV} = 1.6\times10^{-19}$ J), and $k$ in $\text{m}^{-1}$ (not $\text{cm}^{-1}$, not $\text{Å}^{-1}$).
              - "Indirect means it can't absorb light": indirect semiconductors absorb fine above the gap (Si solar cells!). They are bad at **emitting**.
              - Saying metals have no gap: what matters is a partly filled band, not whether a gap exists somewhere.
              - Flat band = light electron: backwards. Flat = small curvature = **large** $m^*$.

            ### Check questions
          `),
          Q(md`Why is silicon a poor light emitter?`,
            ['Its band gap is too small', 'Its gap is indirect: the conduction-band minimum and valence-band maximum are at different $k$', 'It has no valence electrons in the conduction band', 'Its electrons are too heavy'],
            1, ['1.11 eV is plenty (near infrared emission). GaAs at 1.43 eV glows fine.', null, 'Every semiconductor has few electrons in the conduction band; GaAs still emits.', 'Mass changes the curvature, not whether a photon alone can conserve momentum.'],
            md`An electron at the conduction-band minimum (at $k_0 \ne 0$) needs a phonon to reach the valence-band top at $k = 0$; those three-body events are rare compared with non-radiative recombination.`),
          P({
            title: 'Effective mass from a measurement',
            q: md`A band near its minimum is parabolic. At $k = 5.0\times10^8\,\text{m}^{-1}$ the energy is $0.10$ eV above the minimum. Find $m^*/m_0$.`,
            parts: [{ lbl: md`m^*/m_0`, ans: 0.09545 }],
            hints: [md`$E - E_c = \dfrac{\hbar^2k^2}{2m^*}$, so $m^* = \dfrac{\hbar^2k^2}{2(E - E_c)}$.`, md`Put $E - E_c$ in joules: $0.10 \times 1.6\times10^{-19}$ J.`],
            sol: md`$$m^* = \frac{\hbar^2k^2}{2(E-E_c)} = \frac{\left(1.055\times10^{-34}\,\text{J·s}\right)^2\left(5.0\times10^{8}\,\text{m}^{-1}\right)^2}{2\left(0.10\times1.6\times10^{-19}\,\text{J}\right)} = 8.70\times10^{-32}\,\text{kg} = 0.0955\,m_0$$`,
          }),
          Q(md`Two conduction bands have the same minimum energy; band A is more sharply curved than band B. Electrons in A are…`,
            ['heavier', 'lighter', 'the same mass: mass depends only on $E_c$', 'positively charged'], 1,
            ['Backwards: $m^* = \\hbar^2/(d^2E/dk^2)$, so more curvature means less mass.', null, 'Mass depends on curvature, not on where the minimum is.', 'Curvature changes mass, not charge.'],
            md`Larger $d^2E/dk^2$ → smaller $m^*$.`),
          Q(md`What separates a metal from a semiconductor in the band picture?`,
            ['A metal has no valence band', 'In a metal a band is only partly filled (or bands overlap), so electrons have empty states right next to them', 'A metal has a larger band gap', 'A semiconductor has no conduction band'], 1,
            ['Metals have filled lower bands too.', null, 'Metals have no gap at the Fermi level at all.', 'Every solid has a conduction band; in a semiconductor it starts nearly empty.'],
            md`Current needs electrons that can move into nearby empty states: a partly filled band.`),
        ],
        bank: [
          Q(md`What wavelength corresponds to GaAs's gap of 1.43 eV?`, ['0.867 μm', '1.12 μm', '1.43 μm', '0.43 μm'], 0,
            [null, 'That is Si (1.11 eV).', 'μm and eV are not the same number: λ = 1.24/E.', 'Arithmetic slip: 1.24/1.43 = 0.867.'], md`$\lambda = 1.24/1.43 = 0.867\,\mu$m.`),
          Q(md`At $T = 0$ K, a pure semiconductor…`, ['conducts like a metal', 'is an insulator: full valence band, empty conduction band', 'has half its electrons in the conduction band', 'has no band gap'], 1,
            ['Nothing is thermally excited at 0 K.', null, 'No: all valence states are filled.', 'The gap is a property of the bands, not of temperature.'], md`No thermal energy, so nothing crosses the gap.`),
          Q(md`Silicon's bonding is…`, ['ionic', 'metallic', 'covalent', 'van der Waals'], 2,
            ['No charge transfer between identical atoms.', 'Electrons are localized in bonds.', null, 'Much too weak.'], md`Each Si shares an electron pair with each of 4 neighbors.`),
          Q(md`A photon has energy equal to Si's gap. Why can it still be absorbed even though Si is indirect?`, ['It can\'t', 'A phonon supplies the missing momentum (and photons above the gap need less help)', 'Photons carry large momentum', 'Absorption doesn\'t conserve momentum'], 1,
            ['Si absorbs light; that is how Si solar cells and photodiodes work.', null, 'Photon momentum is tiny compared with the zone edge.', 'Momentum is always conserved; the phonon accounts for it.'], md`Indirect absorption is weaker near the gap but certainly happens.`),
          Q(md`Holes act like positive particles with positive mass because…`, ['the top of the valence band curves downward, giving the electrons there negative effective mass', 'protons move into them', 'they are positrons', 'the conduction band is positive'], 0,
            [null, 'Nuclei don\'t move.', 'No antimatter here.', 'Bands carry no charge by themselves.'], md`A missing negative-mass, negative-charge electron behaves like a positive-mass positive charge.`),
          Q(md`In Si, each band formed from the 3s and 3p levels of $N$ atoms holds how many electron states?`, ['$N$', '$2N$', '$4N$', '$8N$'], 2,
            ['Spin and the four sp³ orbitals multiply it.', 'That is one s level with spin.', null, 'That is the total of both bands.'], md`$8N$ states split into two bands of $4N$; the 4N valence electrons fill the lower one.`),
          Q(md`Which is direct-gap?`, ['Si', 'Ge', 'GaAs', 'diamond'], 2, ['Indirect.', 'Indirect.', null, 'Indirect.'], md`GaAs: conduction minimum at $k = 0$.`),
          Q(md`Effective mass is defined from…`, ['the slope $dE/dk$', 'the curvature $d^2E/dk^2$', 'the band gap', 'the lattice constant'], 1,
            ['The slope gives the velocity, $v = \\frac{1}{\\hbar}\\frac{dE}{dk}$.', null, 'The gap separates bands; it does not set curvature.', 'Indirectly at most.'], md`$m^* = \hbar^2/(d^2E/dk^2)$.`),
        ],
      },

      // ======================================================================== Topic 3
      {
        id: 't3-carriers', topic: 3, sec: '3.2', title: 'Electrons and holes, intrinsic and extrinsic material',
        steps: [
          R(md`
            ### The idea

            When heat (or light) breaks a covalent bond, an electron jumps into the conduction band and leaves an empty state in the valence band. That empty state is a **hole**. Both move: the electron through empty conduction states, the hole because neighboring valence electrons hop into it, so the hole drifts the other way. Think of the hole as a real particle with charge $+q$ and its own effective mass. One broken bond = one **electron–hole pair (EHP)**.

            **Intrinsic** material is perfectly pure. Every electron came from a broken bond, so
            $$n = p = n_i$$
            where $n_i$ is the **intrinsic carrier concentration** (Si at 300 K: $n_i \approx 10^{10}\,\text{cm}^{-3}$; GaAs $\approx 2\times10^6$; Ge $\approx 2.5\times10^{13}$). That is one free electron per $5\times10^{12}$ Si atoms: pure Si is a poor conductor.

            **Extrinsic** material is doped:
            - A **donor** from column V (P, As, Sb in Si) has a fifth electron that doesn't fit a bond. It is held by only about $0.03$–$0.05$ eV, so at room temperature essentially every donor gives it up to the conduction band, leaving a fixed **positive ion**. Result: **n-type**, $n_0 \approx N_d$.
            - An **acceptor** from column III (B, Al, Ga, In in Si) is one electron short of four bonds. A valence electron fills that gap easily, leaving a **hole** and a fixed **negative ion**. Result: **p-type**, $p_0 \approx N_a$.
          `),
          RF(md`
            ### Band pictures

            [[fig:three]]

            The donor level $E_d$ sits just below $E_c$; the acceptor level $E_a$ just above $E_v$ (drawn farther from the edges than to scale). The small signs are the ionized dopants: fixed charges, not carriers. The dashed line is the Fermi level, which Topic 4 explains: it moves toward $E_c$ in n-type material and toward $E_v$ in p-type.

            ### The rules at equilibrium (all dopants ionized)

            $$n_0p_0 = n_i^2 \qquad \text{n-type: } n_0 \approx N_d,\; p_0 = \frac{n_i^2}{N_d} \qquad \text{p-type: } p_0 \approx N_a,\; n_0 = \frac{n_i^2}{N_a}$$

            - $n_0$, $p_0$: equilibrium electron and hole concentrations, $\text{cm}^{-3}$
            - $N_d$, $N_a$: donor and acceptor concentrations, $\text{cm}^{-3}$
            - $n_i$: intrinsic concentration, $\text{cm}^{-3}$ (depends on the material and strongly on $T$)

            The carrier you add is the **majority** carrier; the other one, the **minority** carrier, is pushed *down* so the product stays $n_i^2$. Doping is tiny in absolute terms ($10^{16}$ in $5\times10^{22}$ atoms is one in five million) but changes the carriers by a factor of a million.

            **How tightly a donor holds its electron.** The extra electron orbits the ion like hydrogen's, inside a material with dielectric constant $\epsilon_r$ and with mass $m^*$:
            $$E_{\text{bind}} = 13.6\,\text{eV}\times\frac{m^*/m_0}{\epsilon_r^2}$$
            For Si ($m^* = 0.26\,m_0$, $\epsilon_r = 11.8$): $0.025$ eV, about $kT$ at room temperature, which is why donors ionize.
          `, { three: PF.row([{ svg: intrinsic, cap: 'intrinsic' }, { svg: ntype, cap: 'n-type' }, { svg: ptype, cap: 'p-type' }]) }),
          R(md`
            ### Worked example

            !!graded Problem
              Silicon at 300 K ($n_i = 1.0\times10^{10}\,\text{cm}^{-3}$, $5.0\times10^{22}$ atoms/cm³) is doped with $2.0\times10^{16}\,\text{cm}^{-3}$ boron. Find (a) $p_0$, (b) $n_0$, and (c) the fraction of Si atoms replaced by boron.

            **1. Governing equations.** Boron is column III: an acceptor, all ionized at 300 K, and $N_a \gg n_i$, so
            $$p_0 \approx N_a, \qquad n_0 = \frac{n_i^2}{p_0}, \qquad \text{fraction} = \frac{N_a}{N_{\text{Si}}}$$

            **2–3. Substitute, with units.**
            $$p_0 = 2.0\times10^{16}\,\text{cm}^{-3}$$
            $$n_0 = \frac{\left(1.0\times10^{10}\,\text{cm}^{-3}\right)^2}{2.0\times10^{16}\,\text{cm}^{-3}} = \frac{1.0\times10^{20}\,\text{cm}^{-6}}{2.0\times10^{16}\,\text{cm}^{-3}}$$
            $$\text{fraction} = \frac{2.0\times10^{16}\,\text{cm}^{-3}}{5.0\times10^{22}\,\text{cm}^{-3}}$$

            **4. Answers.** (a) $p_0 = 2.00\times10^{16}\,\text{cm}^{-3}$ (holes are the majority: p-type); (b) $n_0 = 5.00\times10^{3}\,\text{cm}^{-3}$; (c) $4.00\times10^{-7}$, one boron per 2.5 million Si atoms.

            !!mistake Common mistakes
              - Adding the dopant to the minority carrier or forgetting that the minority carrier **drops**: in n-type Si with $N_d = 10^{16}$, $p_0 = 10^4$, not $10^{10}$.
              - Mixing up donors and acceptors: column **V** donates (n-type), column **III** accepts (p-type). Memory hook: "**P**hosphorus is not **p**-type."
              - Treating ionized dopants as carriers. The ions are fixed in the lattice; only electrons and holes move.
              - Using $n_0 \approx N_d$ when $N_d$ is not much larger than $n_i$ (hot samples, or small-gap Ge). Then you need Topic 5's full formula.

            ### Check questions
          `),
          Q(md`Which of these is a **donor** in silicon?`, ['Boron', 'Gallium', 'Phosphorus', 'Germanium'], 2,
            ['Boron is column III: an acceptor.', 'Gallium is column III: an acceptor.', null, 'Germanium is column IV like Si: it substitutes without adding or removing an electron.'],
            md`Phosphorus (column V) has one more valence electron than it needs for 4 bonds.`),
          P({
            title: 'Minority carriers in n-type Si',
            q: md`Si at 300 K ($n_i = 1.0\times10^{10}\,\text{cm}^{-3}$) is doped with $5.0\times10^{15}\,\text{cm}^{-3}$ arsenic. Find the equilibrium hole concentration.`,
            parts: [{ lbl: md`p_0`, ans: 2.0e4, unit: 'cm^{-3}' }],
            hints: [md`Arsenic is a donor, so $n_0 \approx N_d$.`, md`$p_0 = n_i^2/n_0$.`],
            sol: md`$$p_0 = \frac{n_i^2}{N_d} = \frac{\left(1.0\times10^{10}\,\text{cm}^{-3}\right)^2}{5.0\times10^{15}\,\text{cm}^{-3}} = 2.00\times10^{4}\,\text{cm}^{-3}$$`,
          }),
          Q(md`A hole in the valence band…`,
            ['is a positron that entered the crystal', 'is an empty valence state; it moves as neighboring electrons fill it, and acts like a $+q$ particle', 'is a fixed positive ion', 'only exists in p-type material'], 1,
            ['No antimatter: it is a missing electron.', null, 'Fixed ions are dopants; holes move.', 'Holes exist in every semiconductor; in n-type they are the minority.'],
            md`Electrons hopping one way move the vacancy the other way; it carries charge $+q$.`),
          P({
            title: 'Donor binding energy in GaAs',
            q: md`Using the hydrogen model, estimate the binding energy of a donor electron in GaAs ($m^* = 0.067\,m_0$, $\epsilon_r = 13.2$). Give it in meV.`,
            parts: [{ lbl: md`E_{\text{bind}}`, ans: 5.23, unit: 'meV' }],
            hints: [md`$E_{\text{bind}} = 13.6\,\text{eV}\times\dfrac{m^*/m_0}{\epsilon_r^2}$.`],
            sol: md`$$E_{\text{bind}} = 13.6\,\text{eV}\times\frac{0.067}{(13.2)^2} = 13.6\,\text{eV}\times\frac{0.067}{174.2} = 5.23\times10^{-3}\,\text{eV} = 5.23\,\text{meV}$$ Far below $kT = 25.9$ meV: donors in GaAs are fully ionized at room temperature.`,
          }),
        ],
        bank: [
          Q(md`In intrinsic material…`, ['$n > p$', '$n = p = n_i$', '$n = p = 0$', '$n p = 0$'], 1,
            ['Only if donors are present.', null, 'Thermal generation always creates some pairs above 0 K.', 'The product is $n_i^2$.'], md`Every electron came from a broken bond, leaving a hole.`),
          Q(md`Doping Si with $10^{17}$ acceptors per cm³ makes $n_0$…`, ['$10^{17}$', '$10^{3}\\,\\text{cm}^{-3}$', '$10^{10}\\,\\text{cm}^{-3}$', 'zero'], 1,
            ['That is $p_0$.', null, 'That is intrinsic; doping pushes the minority below $n_i$.', 'The product $n_0p_0 = n_i^2$ is never zero.'], md`$n_0 = 10^{20}/10^{17} = 10^3$.`),
          Q(md`Why are nearly all donors ionized at 300 K?`, ['Their binding energy (~0.03–0.05 eV) is comparable to $kT$ = 0.026 eV, and there are vastly more conduction states than donors', 'Room light ionizes them', 'The electric field of the lattice pulls the electron off', 'They aren\'t; only about 1% are'], 0,
            [null, 'Happens in the dark too.', 'No applied field is needed.', 'At 300 K and moderate doping, ionization is essentially complete.'], md`Small binding energy plus a huge number of empty conduction states.`),
          Q(md`Which change makes $n_i$ larger?`, ['A larger band gap', 'A higher temperature', 'More donors', 'More acceptors'], 1,
            ['Larger gap means fewer thermally broken bonds.', null, 'Doping changes $n_0$ and $p_0$, not $n_i$.', 'Doping changes $n_0$ and $p_0$, not $n_i$.'], md`$n_i \propto T^{3/2}e^{-E_g/2kT}$.`),
          Q(md`An ionized acceptor carries charge…`, ['$+q$, and it moves', '$-q$, fixed in place', '$+q$, fixed in place', 'none'], 1,
            ['It is an atom in the lattice; it doesn\'t move.', null, 'It took an electron: negative.', 'It took an electron: $-q$.'], md`The acceptor captured an electron (making a hole elsewhere).`),
          Q(md`Why is GaAs's $n_i$ so much smaller than Si's?`, ['Larger band gap (1.43 vs 1.11 eV)', 'Smaller lattice constant', 'It is a compound', 'It is direct-gap'], 0,
            [null, 'Its lattice constant is larger, and that is not the reason anyway.', 'Being a compound doesn\'t set $n_i$.', 'Direct vs indirect affects optics, not $n_i$.'], md`$n_i$ falls exponentially with $E_g$.`),
          Q(md`Silicon doped with $10^{16}$ P and nothing else, at 300 K: $p_0/n_0$ is about…`, ['$10^{-12}$', '$10^{-6}$', '$1$', '$10^{6}$'], 0,
            [null, 'That is $p_0/n_i$.', 'Only intrinsic.', 'Backwards.'], md`$p_0 = 10^4$, $n_0 = 10^{16}$.`),
        ],
      },

      // ======================================================================== Topic 4
      {
        id: 't4-fermi', topic: 4, sec: '3.3.1–3.3.2', title: 'Fermi–Dirac statistics, the Fermi level, n₀ and p₀',
        steps: [
          RF(md`
            ### The idea

            Electrons obey the Pauli principle: at most one per state (counting spin). At temperature $T$ the probability that an allowed state at energy $E$ is occupied is the **Fermi–Dirac distribution**

            $$f(E) = \frac{1}{1 + e^{(E - E_F)/kT}}$$

            - $E$: energy of the state, eV
            - $E_F$: the **Fermi level**, the energy where $f = \tfrac12$, eV
            - $k = 8.62\times10^{-5}$ eV/K; $kT = 0.0259$ eV at 300 K

            [[fig:f]]

            At $T = 0$ it is a step: every state below $E_F$ full, every one above empty. As $T$ rises the step softens over a few $kT$ either side. The curve is symmetric about $E_F$: the probability that a state $\Delta E$ **above** $E_F$ is **full** equals the probability that a state $\Delta E$ **below** it is **empty**. The probability of a hole is $1 - f(E)$.

            In a semiconductor $E_F$ usually sits in the gap, where there are no states. It is still the number that sets how many electrons sit in the conduction band and how many holes in the valence band.
          `, { f: { svg: fermiFig, cap: 'f(E) with energy up the page: T = 0 (solid step), 300 K (dashed), hotter (grey).' } }),
          RF(md`
            ### From f(E) to carrier concentrations

            [[fig:dos]]

            The density of conduction states grows as $\sqrt{E - E_c}$; multiply it by $f(E)$ and add up: the electrons crowd just above $E_c$. When $E_c - E_F$ is more than about $3kT$, $f(E) \approx e^{-(E - E_F)/kT}$ (the **Boltzmann approximation**) and the integral collapses to

            $$n_0 = N_c\,e^{-(E_c - E_F)/kT} \qquad p_0 = N_v\,e^{-(E_F - E_v)/kT}$$

            - $N_c$, $N_v$: **effective densities of states** of the conduction and valence bands, $\text{cm}^{-3}$. $N_c = 2\left(\dfrac{2\pi m_n^* kT}{h^2}\right)^{3/2}$, so $N_c \propto T^{3/2}$. Si at 300 K: $N_c = 2.8\times10^{19}$, $N_v = 1.04\times10^{19}\,\text{cm}^{-3}$.

            Multiply them: $E_F$ cancels, so
            $$n_0p_0 = N_cN_v\,e^{-E_g/kT} = n_i^2$$
            for **any** doping at equilibrium.

            Writing the same thing relative to the **intrinsic level** $E_i$ (where $E_F$ sits in undoped material, near midgap) is usually quicker:

            $$n_0 = n_i\,e^{(E_F - E_i)/kT} \qquad p_0 = n_i\,e^{(E_i - E_F)/kT}$$

            and turned around, $E_F - E_i = kT\ln\dfrac{n_0}{n_i} = -kT\ln\dfrac{p_0}{n_i}$. Every factor of 10 in $n_0$ moves $E_F$ by $kT\ln10 = 0.0596$ eV.

            $E_i$ is not exactly midgap: $E_i = \dfrac{E_c + E_v}{2} + \dfrac{kT}{2}\ln\dfrac{N_v}{N_c}$, about 0.013 eV below midgap in Si. Usually close enough to ignore unless asked.
          `, { dos: { svg: BD.dos({ type: 'n' }), cap: 'n-type: band diagram, density of states N(E), occupancy f(E), and their product (electrons above Ec, holes below Ev; the minority band is enlarged to be visible).' } }),
          RF(md`
            ### Worked example

            !!graded Problem
              In Si at 300 K, $E_F$ is $0.20$ eV below $E_c$. Use $E_g = 1.11$ eV, $N_c = 2.8\times10^{19}$, $N_v = 1.04\times10^{19}\,\text{cm}^{-3}$, $kT = 0.0259$ eV. Find (a) the probability that a state at $E_c + kT$ is occupied, (b) $n_0$, (c) $p_0$.

            **1. Diagram and governing equations.**

            [[fig:ex]]

            $$f(E) = \frac{1}{1 + e^{(E - E_F)/kT}}, \qquad n_0 = N_c\,e^{-(E_c - E_F)/kT}, \qquad p_0 = N_v\,e^{-(E_F - E_v)/kT}$$

            **2. Solve symbolically.** At $E = E_c + kT$: $E - E_F = (E_c - E_F) + kT$. From the diagram, $E_F - E_v = E_g - (E_c - E_F)$.

            **3. Substitute, with units.**
            $$f = \frac{1}{1 + \exp\!\left(\dfrac{0.20\,\text{eV} + 0.0259\,\text{eV}}{0.0259\,\text{eV}}\right)} = \frac{1}{1 + e^{8.72}}$$
            $$n_0 = \left(2.8\times10^{19}\,\text{cm}^{-3}\right)\exp\!\left(-\frac{0.20\,\text{eV}}{0.0259\,\text{eV}}\right) = \left(2.8\times10^{19}\,\text{cm}^{-3}\right)e^{-7.72}$$
            $$p_0 = \left(1.04\times10^{19}\,\text{cm}^{-3}\right)\exp\!\left(-\frac{1.11\,\text{eV} - 0.20\,\text{eV}}{0.0259\,\text{eV}}\right) = \left(1.04\times10^{19}\,\text{cm}^{-3}\right)e^{-35.1}$$

            **4. Answers.** (a) $f = 1.63\times10^{-4}$; (b) $n_0 = 1.24\times10^{16}\,\text{cm}^{-3}$; (c) $p_0 = 5.73\times10^{3}\,\text{cm}^{-3}$.

            Check: $n_0p_0 = 7.1\times10^{19}\,\text{cm}^{-6}$, so $n_i = 8.4\times10^{9}\,\text{cm}^{-3}$ with these $N_c$, $N_v$. Tables differ slightly; that is why problems state $n_i$ or $N_c$, $N_v$. Use what is given.
          `, { ex: { svg: ef4, cap: 'Si, EF 0.20 eV below Ec.' } }),
          R(md`
            !!mistake Common mistakes
              - Sign in the exponent. More electrons means $E_F$ **closer to** $E_c$: $n_0 = N_c e^{-(E_c - E_F)/kT}$ shrinks as the gap $E_c - E_F$ grows. Check the direction every time.
              - Using $\log_{10}$ for $\ln$ when finding $E_F$: off by a factor of 2.303.
              - Mixing the two forms: $n_0 = n_i e^{(E_F - E_i)/kT}$ uses $E_i$; $n_0 = N_c e^{-(E_c - E_F)/kT}$ uses $E_c$. Don't put $N_c$ with $E_i$.
              - Dividing by $kT$ in joules while the energies are in eV (or the reverse). Keep everything in eV: $kT = 0.0259$ eV.
              - Using the Boltzmann form when $E_F$ is within ~$3kT$ of a band edge (degenerate doping). Then it overestimates the carriers.
              - Thinking $f(E_F) = \tfrac12$ means half the electrons are at $E_F$: there may be no states there at all.

            ### Check questions
          `),
          P({
            title: 'Occupation probability',
            q: md`At 300 K ($kT = 0.0259$ eV), what is the probability that a state $0.10$ eV above the Fermi level is occupied?`,
            parts: [{ lbl: md`f(E)`, ans: 0.02061 }],
            hints: [md`$f = 1/\left(1 + e^{(E - E_F)/kT}\right)$ with $E - E_F = +0.10$ eV.`],
            sol: md`$$f = \frac{1}{1 + e^{0.10/0.0259}} = \frac{1}{1 + e^{3.861}} = \frac{1}{1 + 47.5} = 0.0206$$ The Boltzmann form $e^{-3.861} = 0.0210$ is already within 2%.`,
          }),
          P({
            title: 'Carriers from the Fermi level',
            q: md`Si at 300 K, $n_i = 1.0\times10^{10}\,\text{cm}^{-3}$: the Fermi level is $0.30$ eV above $E_i$. Find $n_0$ and $p_0$.`,
            parts: [{ lbl: md`n_0`, ans: 1.0726e15, unit: 'cm^{-3}' }, { lbl: md`p_0`, ans: 9.323e4, unit: 'cm^{-3}' }],
            hints: [md`$n_0 = n_i e^{(E_F - E_i)/kT}$, and $p_0 = n_i^2/n_0$ (or $n_i e^{-(E_F - E_i)/kT}$).`],
            sol: md`$$n_0 = \left(1.0\times10^{10}\,\text{cm}^{-3}\right)e^{0.30/0.0259} = \left(1.0\times10^{10}\,\text{cm}^{-3}\right)e^{11.58} = 1.07\times10^{15}\,\text{cm}^{-3}$$ $$p_0 = \frac{n_i^2}{n_0} = \frac{10^{20}\,\text{cm}^{-6}}{1.07\times10^{15}\,\text{cm}^{-3}} = 9.32\times10^{4}\,\text{cm}^{-3}$$`,
          }),
          P({
            title: 'Fermi level from the doping',
            q: md`Si at 300 K ($n_i = 1.0\times10^{10}\,\text{cm}^{-3}$) has $n_0 = 1.0\times10^{17}\,\text{cm}^{-3}$. How far above $E_i$ is $E_F$?`,
            parts: [{ lbl: md`E_F - E_i`, ans: 0.4175, unit: 'eV', tol: { abs: 0.002 } }],
            hints: [md`$E_F - E_i = kT\ln(n_0/n_i)$; natural log.`],
            sol: md`$$E_F - E_i = kT\ln\frac{n_0}{n_i} = (0.0259\,\text{eV})\ln\frac{1.0\times10^{17}\,\text{cm}^{-3}}{1.0\times10^{10}\,\text{cm}^{-3}} = (0.0259\,\text{eV})(16.12) = 0.417\,\text{eV}$$`,
          }),
          Q(md`A state lies $0.15$ eV **below** $E_F$. The probability that it is **empty** equals…`,
            ['the probability that a state 0.15 eV above $E_F$ is full', 'the probability that a state 0.15 eV below $E_F$ is full', '½', 'zero at any temperature'], 0,
            [null, 'That is $f$ at the same state; empty is $1 - f$.', 'Only at $E_F$ itself.', 'Only at $T = 0$.'],
            md`$1 - f(E_F - \Delta) = f(E_F + \Delta)$: the Fermi function is symmetric about $E_F$.`),
        ],
        bank: [
          Q(md`At any temperature, a state exactly at $E_F$ is occupied with probability…`, ['0', '½', '1', 'depends on $T$'], 1,
            ['Only above $E_F$ at $T = 0$.', null, 'Only below $E_F$ at $T = 0$.', '$e^0 = 1$ for every $T$, so $f = \\tfrac12$.'], md`$f(E_F) = 1/(1 + e^0) = \tfrac12$.`),
          Q(md`When is the Boltzmann approximation $f \approx e^{-(E - E_F)/kT}$ good?`, ['$E - E_F \\gg kT$ (more than about $3kT$)', '$E$ close to $E_F$', 'Only at 0 K', 'Always'], 0,
            [null, 'Near $E_F$ the 1 in the denominator matters.', 'At 0 K $f$ is a step.', 'Fails for degenerate doping.'], md`Then $e^{(E - E_F)/kT} \gg 1$.`),
          Q(md`Raising $N_d$ by ten times in n-type Si (at 300 K) moves $E_F$…`, ['up by 0.0596 eV', 'down by 0.0596 eV', 'up by 0.0259 eV', 'up by 0.1 eV'], 0,
            [null, 'More electrons: $E_F$ moves toward $E_c$, i.e. up.', 'That is $kT$; you need $kT\\ln10$.', 'Not $\\log_{10}$-of-eV.'], md`$\Delta E_F = kT\ln10 = 0.0596$ eV.`),
          Q(md`$n_0p_0 = n_i^2$ holds…`, ['only in intrinsic material', 'at equilibrium, for any doping (non-degenerate)', 'only in n-type material', 'also under illumination'], 1,
            ['It holds for doped material too.', null, 'Both types.', 'Under light $np > n_i^2$: that is why quasi-Fermi levels are needed.'], md`$E_F$ cancels in the product.`),
          Q(md`$N_c$ depends on temperature as…`, ['$T^{3/2}$', '$e^{-E_g/kT}$', '$T$', 'not at all'], 0,
            [null, 'That is $n_i^2$\'s strong factor.', 'Exponent is 3/2.', '$N_c \\propto (m^*kT)^{3/2}$.'], md`$N_c = 2(2\pi m^*kT/h^2)^{3/2}$.`),
          Q(md`In Si, $E_i$ lies slightly below midgap because…`, ['$N_v < N_c$ (holes are lighter on average in the density of states)', '$N_v > N_c$', 'the gap is indirect', 'of donors'], 0,
            [null, 'Then $E_i$ would be above midgap.', 'Unrelated.', 'Intrinsic means undoped.'], md`$E_i = E_{\text{mid}} + \tfrac{kT}{2}\ln(N_v/N_c)$; $\ln(1.04/2.8) < 0$.`),
          Q(md`In p-type material, $E_F$ lies…`, ['above $E_i$', 'below $E_i$, closer to $E_v$', 'exactly at $E_v$', 'in the conduction band'], 1,
            ['That is n-type.', null, 'Only for degenerate doping.', 'No.'], md`$p_0 = n_ie^{(E_i - E_F)/kT} > n_i$ needs $E_F < E_i$.`),
          Q(md`At $T = 0$ K, $f(E)$ for $E > E_F$ is…`, ['1', '½', '0', '$e^{-1}$'], 2,
            ['That is below $E_F$.', 'Only at $E_F$.', null, 'No.'], md`A step: full below, empty above.`),
        ],
      },
    ],
  });
})();

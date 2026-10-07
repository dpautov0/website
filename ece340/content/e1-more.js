/* More teaching and more questions for each Exam 1 topic, filling the gaps a first pass left (quantum basics, carrier
   energy in band diagrams, where E_F sits at each temperature, thermal velocity, minimum conductivity, luminescence,
   stored charge, ...). e1-tools.js places MORE[id].read before each lesson's worked example and MORE[id].qs after its
   check questions, followed by that topic's randomized problems. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;

  // E_F and E_i versus temperature for p-type Si (N_a = 1e15, E_a = E_v + 0.045 eV), from p = n + N_a⁻
  function efVsT() {
    const Eg = 1.12, Ea = 0.045, Na = 1e15, ef = [], ei = [];
    for (let T = 15; T <= 750; T += 5) {
      const kT = 8.62e-5 * T, s = Math.pow(T / 300, 1.5), Nc = 2.8e19 * s, Nv = 1.04e19 * s;
      const bal = (E) => Nv * Math.exp(-E / kT) - Nc * Math.exp(-(Eg - E) / kT) - Na / (1 + 4 * Math.exp((Ea - E) / kT));
      let lo = -0.3, hi = Eg + 0.3;
      for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (bal(m) > 0) lo = m; else hi = m; }
      ef.push([T, (lo + hi) / 2]);
      ei.push([T, Eg / 2 + (kT / 2) * Math.log(Nv / Nc)]);
    }
    return PF.plot({
      w: 360, h: 230, x: [0, 750], y: [0, 0.66], xl: 'T\\,(\\text{K})', yl: 'E',
      xt: [[100, '100'], [300, '300'], [500, '500'], [700, '700']], yt: [[0, 'E_v'], [0.56, '\\text{midgap}']],
      hlines: [[Ea, 'E_a']], curves: [{ pts: ef }, { pts: ei, cls: 'dash dim' }],
    });
  }

  // a sloped band diagram with numbered holes and electrons (kinetic vs potential energy)
  function energyFig() {
    const f = PF.fig({ alt: 'carrier energies in a sloped band diagram' });
    const x0 = 30, x1 = 330, Y = (x) => 40 + (x - x0) * 0.22, gap = 90;
    f.pl([[x0, Y(x0)], [x1, Y(x1)]], { cls: 'curve' }); f.pl([[x0, Y(x0) + gap], [x1, Y(x1) + gap]], { cls: 'curve' });
    f.label(x1 + 6, Y(x1), 'E_c', 'l'); f.label(x1 + 6, Y(x1) + gap, 'E_v', 'l');
    f.dot(90, Y(90) - 6, 3.2); f.label(90, Y(90) - 14, '1', 'b', 'small');
    f.dot(230, Y(230) - 34, 3.2); f.line(230, Y(230) - 30, 230, Y(230) - 2, { cls: 'dim', arrow: 'both', hs: 4 }); f.label(236, Y(230) - 18, '\\text{KE}', 'l', 'small');
    f.label(230, Y(230) - 40, '2', 'b', 'small');
    f.circle(120, Y(120) + gap + 30, 3.2, { cls: 'bgfill' }); f.line(120, Y(120) + gap + 2, 120, Y(120) + gap + 26, { cls: 'dim', arrow: 'both', hs: 4 }); f.label(126, Y(120) + gap + 14, '\\text{KE}', 'l', 'small');
    f.label(120, Y(120) + gap + 38, '3', 't', 'small');
    f.circle(290, Y(290) + gap + 6, 3.2, { cls: 'bgfill' }); f.label(290, Y(290) + gap + 14, '4', 't', 'small');
    return f.svg();
  }

  window.MORE = {
    // ==================================================================== Topic 1
    't1-crystal': {
      qs: [
        P({
          title: 'Mass density of InP',
          q: md`InP has the zincblende structure with $a = 5.87$ Å. Atomic weights: In $114.818$, P $30.974$ g/mol; $N_A = 6.022\times10^{23}\,\text{mol}^{-1}$. Find the density.`,
          parts: [{ lbl: md`\rho_m`, ans: 4.788, unit: 'g/cm^3' }],
          hints: [md`Zincblende: 4 In and 4 P per cell, so 4 InP "molecules" per $a^3$.`, md`$\rho_m = \dfrac{4\,(M_{\text{In}} + M_{\text{P}})}{N_Aa^3}$.`],
          sol: md`$$\rho_m = \frac{4\,(114.818 + 30.974)\,\text{g/mol}}{\left(6.022\times10^{23}\,\text{mol}^{-1}\right)\left(5.87\times10^{-8}\,\text{cm}\right)^3} = \frac{583.2\,\text{g/mol}}{\left(6.022\times10^{23}\right)\left(2.023\times10^{-22}\,\text{cm}^3\right)} = 4.79\,\text{g/cm}^3$$`,
        }),
        P({
          title: 'Packing fraction of bcc',
          q: md`In a body-centered cubic lattice, hard-sphere atoms touch along the body diagonal. What fraction of the cell volume do they fill?`,
          parts: [{ lbl: 'fraction', ans: 0.6802 }],
          hints: [md`Nearest-neighbor distance $\tfrac{\sqrt3}{2}a$, so each sphere has radius $r = \tfrac{\sqrt3}{4}a$.`, md`2 atoms per cell: fraction $= 2\cdot\tfrac43\pi r^3/a^3$.`],
          sol: md`$$\frac{2\cdot\frac43\pi\left(\frac{\sqrt3}{4}a\right)^3}{a^3} = \frac{\sqrt3\,\pi}{8} = 0.680$$`,
        }),
        P({
          title: 'Nearest neighbors in fcc',
          q: md`An fcc metal has $a = 4.00$ Å. How far apart are nearest-neighbor atoms (Å)?`,
          parts: [{ lbl: 'd', ans: 2.828, unit: 'Å' }],
          hints: [md`A corner atom touches the face-center atom: half a face diagonal.`],
          sol: md`$$d = \frac{\sqrt2\,a}{2} = \frac{a}{\sqrt2} = \frac{4.00\,\text{Å}}{1.414} = 2.83\,\text{Å}$$`,
        }),
        Q(md`Does the direction $[110]$ lie in the plane $(001)$?`,
          ['Yes: $[110]\\cdot(0,0,1) = 0$', 'No: it is perpendicular to it', 'Only in fcc', 'Only if $a$ is the same in every direction'], 0,
          [null, 'The normal of $(001)$ is $[001]$; $[110]$ has no $z$ part.', 'The geometry is the same for every cubic lattice.', 'Cubic means it is.'],
          md`A direction lies in a plane when it is perpendicular to the plane's normal: $1\cdot0 + 1\cdot0 + 0\cdot1 = 0$.`),
        Q(md`A plane passes through the origin. How do you find its Miller indices?`,
          ['Move the origin to another lattice point (or use a parallel plane), then take intercepts', 'Its indices are (000)', 'Use the intercepts directly', 'It has none'], 0,
          [null, '(000) is not a plane.', 'An intercept at 0 has reciprocal ∞.', 'Every lattice plane has indices.'],
          md`Parallel planes share Miller indices, so pick the parallel one that cuts the axes away from the origin.`),
        Q(md`How do the diamond and zincblende lattices differ?`,
          ['Same geometry; zincblende puts two different atoms on the two fcc sublattices', 'Zincblende is simple cubic', 'Diamond has 4 atoms per cell, zincblende 8', 'Zincblende has no tetrahedral bonds'], 0,
          [null, 'Both are fcc-based.', 'Both have 8.', 'Both are tetrahedrally bonded.'],
          md`GaAs: Ga on one sublattice, As on the other.`),
        Q(md`How many equivalent directions are in the family $\langle100\rangle$ of a cubic crystal?`, ['3', '6', '8', '12'], 1,
          ['That leaves out the negative directions.', null, 'That is $\\langle111\\rangle$.', 'That is $\\langle110\\rangle$.'],
          md`$[100], [\bar100], [010], [0\bar10], [001], [00\bar1]$.`),
      ],
    },

    // ==================================================================== Topic 2
    't2-bands': {
      read: [R(md`
        ### The quantum mechanics you need

        Bands come from quantum mechanics, and only a few of its ideas are used in this course:

        - **Light is quantized.** A photon carries $E = h\nu = hc/\lambda$. Handy forms: $hc = 1240$ eV·nm $= 1.24$ eV·μm; a 1 μm photon has 1.24 eV.
        - **Particles are waves.** A particle of momentum $p$ has wavelength $\lambda = h/p$, so $p = \hbar k$ and the kinetic energy is $E = \dfrac{p^2}{2m} = \dfrac{\hbar^2k^2}{2m}$.
        - **Uncertainty.** You cannot know position and momentum together better than $\Delta x\,\Delta p \ge \hbar/2$.
        - **Confinement quantizes energy.** An electron trapped in a box of width $L$ can only have $E_n = \dfrac{n^2h^2}{8mL^2}$, $n = 1, 2, 3, \dots$ A smaller box means larger, more widely spaced levels. An atom is such a trap: hydrogen's levels are $E_n = -13.6\,\text{eV}/n^2$.
        - **Pauli exclusion.** No two electrons share the same set of quantum numbers, so each orbital holds two electrons (opposite spins) and electrons stack up in energy. Silicon: $1s^2\,2s^2\,2p^6\,3s^2\,3p^2$, which leaves **4 valence electrons**, one for each bond to its 4 neighbors.

        Put $N$ atoms close together and each atom's level must split into $N$ levels (Pauli again): that is a band.

        **E–k and E–x diagrams.** An $E$–$k$ diagram shows the allowed energies against crystal momentum (used for effective mass and direct vs indirect gaps). The band diagrams used everywhere else plot $E_c$ and $E_v$ against **position** $x$; they show how the band edges move through a device.
      `)],
      qs: [
        P({
          title: 'Electron in a box',
          q: md`An electron ($m_0 = 9.11\times10^{-31}$ kg) is confined to a 1.0 nm wide box. Find its lowest energy, in eV ($h = 6.626\times10^{-34}$ J·s, $1\,\text{eV} = 1.602\times10^{-19}$ J).`,
          parts: [{ lbl: 'E_1', ans: 0.376, unit: 'eV' }],
          hints: [md`$E_1 = \dfrac{h^2}{8mL^2}$ with $L$ in meters.`],
          sol: md`$$E_1 = \frac{\left(6.626\times10^{-34}\,\text{J·s}\right)^2}{8\left(9.11\times10^{-31}\,\text{kg}\right)\left(1.0\times10^{-9}\,\text{m}\right)^2} = 6.02\times10^{-20}\,\text{J} = 0.376\,\text{eV}$$`,
        }),
        Q(md`The box is made half as wide. The ground-state energy becomes…`, ['4 times larger', '2 times larger', 'half as large', 'unchanged'], 0,
          [null, '$E \\propto 1/L^2$, not $1/L$.', 'Squeezing raises the energy.', 'Confinement sets it.'], md`$E_n \propto 1/L^2$.`),
        Q(md`How many electrons can the $n = 2$ shell of an atom hold?`, ['2', '4', '8', '18'], 2,
          ['That is one orbital.', 'That is $2s$ + one $2p$ orbital.', null, 'That is $n = 3$.'], md`$2s$ (2) + $2p$ (6) = $2n^2 = 8$.`),
        Q(md`Why does silicon form four covalent bonds?`, ['Its outer shell $3s^23p^2$ has 4 electrons', 'It has 4 protons', 'Its lattice is cubic', 'It is a semiconductor'], 0,
          [null, 'Si has 14 protons.', 'The bonding causes the structure, not the reverse.', 'Circular.'], md`Four valence electrons, one per bond to each of four neighbors.`),
        Q(md`In an $E$–$k$ diagram, the conduction-band minimum and the valence-band maximum occur at the same $k$. The material is…`,
          ['direct-gap', 'indirect-gap', 'a metal', 'an insulator'], 0,
          [null, 'Indirect means different $k$.', 'Metals have partly filled bands.', 'Gap size, not position, decides that.'], md`Same $k$: a photon alone can do the transition.`),
        Q(md`What does a band diagram ($E$ vs $x$) show that an $E$–$k$ diagram does not?`, ['How the band edges change with position', 'The effective mass', 'Whether the gap is direct', 'The number of states'], 0,
          [null, 'That comes from the curvature of $E(k)$.', 'That needs $k$.', 'Neither shows that directly.'], md`Band bending, fields and junctions live on the $x$ axis.`),
      ],
    },

    // ==================================================================== Topic 3
    't3-carriers': {
      read: [RF(md`
        ### Energy of electrons and holes on a band diagram

        [[fig:e]]

        On a band diagram, **electron energy increases upward**. An electron sitting at $E_c$ has no kinetic energy; $E_c$ is its potential energy. The higher it sits above $E_c$, the more kinetic energy it has: $\text{KE}_n = E - E_c$. A sloped $E_c$ is a sloped potential: electrons roll **down** it, losing potential energy.

        **Hole energy increases downward.** A hole at $E_v$ has no kinetic energy; the deeper it sits below $E_v$, the more it has: $\text{KE}_p = E_v - E$. Holes float **up** a sloped $E_v$, like bubbles.

        In the picture: electron 2 has more kinetic energy than electron 1 (it is farther above its band edge). Hole 3 has more kinetic energy than hole 4. Hole 4 sits where $E_v$ is lowest, which for a hole is the highest potential energy. Carriers with extra kinetic energy lose it as heat to the lattice within picoseconds and settle at the band edges.

        ### Generation and recombination keep the balance

        Even in the dark, heat keeps breaking bonds (thermal **generation**, rate $g$) and electrons keep falling back into holes (**recombination**, rate $r$). At equilibrium the two rates are equal, and that balance is what fixes $n_0p_0 = n_i^2$.

        **Equilibrium vs steady state.** *Equilibrium*: no outside energy source (no light, no bias), no net flow of anything, and $n_0p_0 = n_i^2$. *Steady state*: nothing changes in time, but something is driving the sample (light, a voltage), so currents can flow and $np \ne n_i^2$.

        ### Amphoteric dopants

        In a III–V compound, a column-IV atom can go either way. Si on a **Ga** site (Ga is column III) has one electron too many: a **donor**. Si on an **As** site (column V) has one too few: an **acceptor**. Elements that can do both are called amphoteric. Other GaAs dopants: Se, Te (on As sites) are donors; Zn, Be (on Ga sites) are acceptors.
      `, { e: { svg: energyFig(), cap: 'Electrons (dots) above a sloped $E_c$ and holes (circles) below $E_v$.' } })],
      qs: [
        Q(md`In the band diagram above, which **hole** has the most kinetic energy?`, ['Hole 3', 'Hole 4', 'They have the same', 'Holes have no kinetic energy'], 0,
          [null, 'Hole 4 sits right at $E_v$: zero kinetic energy.', 'Distance from the band edge sets it.', 'They do.'], md`Hole kinetic energy is measured **down** from $E_v$; hole 3 is farthest below its band edge.`),
        Q(md`An electron sits exactly at $E_c$ where $E_c$ slopes downward to the right. With no collisions, it will…`, ['move right, gaining kinetic energy', 'move left', 'stay put', 'move right, losing kinetic energy'], 0,
          [null, 'That is uphill for an electron.', 'The slope is a force.', 'Rolling downhill gains kinetic energy.'], md`$E_c$ is its potential energy; it rolls downhill.`),
        Q(md`Holes in a valence band that slopes **upward** to the right move…`, ['to the right (up the $E_v$ slope)', 'to the left', 'not at all', 'into the conduction band'], 0,
          [null, 'That is what electrons would do.', 'A slope means a force.', 'No.'], md`Hole energy increases downward, so holes float up the band edge.`),
        Q(md`Silicon atoms are placed on **As** sites in GaAs. They act as…`, ['acceptors', 'donors', 'neutral impurities', 'deep traps only'], 0,
          [null, 'On Ga sites they would be donors.', 'They differ from As by one valence electron.', 'They are shallow acceptors.'], md`Si has 4 valence electrons, one fewer than the As it replaces.`),
        Q(md`Which describes **steady state** but not equilibrium?`, ['A sample under constant light: $n$ and $p$ don\'t change in time, but $np > n_i^2$', 'A sample in the dark, unbiased', 'A sample right after the light turns off', 'A sample at 0 K'], 0,
          [null, 'That is equilibrium.', 'That is a transient.', 'Equilibrium (trivially).'], md`Steady = time-independent; equilibrium additionally needs no external drive.`),
        Q(md`In equilibrium, the thermal generation rate equals…`, ['the recombination rate', 'zero', 'the doping', '$n_i$'], 0,
          [null, 'Heat always breaks bonds above 0 K.', 'Different units.', 'Different units.'], md`Detailed balance: $g = r$.`),
        Q(md`Why can acceptors make free holes at room temperature while intrinsic generation makes so few?`, ['Filling an acceptor costs only ~0.05 eV; breaking a bond across the gap costs ~1.12 eV', 'Acceptors emit holes directly', 'Holes are lighter than electrons', 'Acceptors lower the band gap'], 0,
          [null, 'An acceptor captures a valence electron; that leaves the hole.', 'Not the reason.', 'They add a level; the gap is unchanged.'], md`Thermal energy ($kT = 0.026$ eV) reaches 0.05 eV easily, 1.12 eV almost never.`),
      ],
    },

    // ==================================================================== Topic 4
    't4-fermi': {
      read: [R(md`
        ### Where $N_c$ comes from: the density of states

        In three dimensions the number of allowed electron states per volume per unit energy near the band edge is

        $$N(E) = \frac{1}{2\pi^2}\left(\frac{2m_n^*}{\hbar^2}\right)^{3/2}\left(E - E_c\right)^{1/2}$$

        zero at $E_c$ and growing as $\sqrt{E - E_c}$ (heavier carriers mean more states). The electron concentration is states × occupancy, added up:

        $$n_0 = \int_{E_c}^{\infty} f(E)\,N(E)\,dE$$

        With the Boltzmann form of $f$ the integral gives $n_0 = N_ce^{-(E_c - E_F)/kT}$ with $N_c = 2\left(\dfrac{2\pi m_n^*kT}{h^2}\right)^{3/2}$. Read $N_c$ as "the number of states you would get if they were all piled at $E_c$". Because $f$ dies off exponentially, almost every electron sits within a few $kT$ of $E_c$.

        Moving $E_F$ up toward $E_c$ raises $f$ at every conduction-band energy, so $n_0$ rises (and $p_0$ falls).
      `)],
      qs: [
        P({
          title: 'Occupancy at the band edge of InP',
          q: md`InP has $E_g = 1.35$ eV. In intrinsic InP at 300 K take $E_F$ at midgap. What is the probability that a state at $E_c$ is occupied?`,
          parts: [{ lbl: md`f(E_c)`, ans: 4.803e-12, tol: { rel: 0.03 } }],
          hints: [md`$E_c - E_F = E_g/2 = 0.675$ eV.`],
          sol: md`$$f(E_c) = \frac{1}{1 + e^{0.675/0.0259}} = \frac{1}{1 + e^{26.06}} = 4.80\times10^{-12}$$`,
        }),
        Q(md`The Fermi level of a sample moves 0.1 eV closer to $E_c$. The probability that a state at $E_c$ is occupied…`, ['rises, by about $e^{0.1/0.0259} \\approx 47$×', 'falls', 'stays the same', 'doubles exactly'], 0,
          [null, 'Closer to the state means more likely full.', '$f$ depends on $E - E_F$.', 'Exponential, not linear.'], md`$f \approx e^{-(E_c - E_F)/kT}$.`),
        Q(md`The density of states in the conduction band, near its edge, is proportional to…`, ['$\\sqrt{E - E_c}$', '$E - E_c$', '$e^{-(E - E_c)/kT}$', 'a constant'], 0,
          [null, 'Linear growth is not what 3-D gives; the states grow as a square root.', 'That is the occupancy, not the states.', 'Not in 3-D.'], md`$N(E) \propto (E - E_c)^{1/2}$.`),
        Q(md`Most conduction electrons sit…`, ['within a few $kT$ above $E_c$', 'right at $E_F$', 'at the top of the conduction band', 'spread evenly through the band'], 0,
          [null, '$E_F$ is usually in the gap, where there are no states.', '$f$ is exponentially small there.', '$f$ falls exponentially.'], md`$N(E)f(E)$ peaks about $kT/2$ above $E_c$ and dies off within a few $kT$.`),
        Q(md`A heavier electron effective mass makes $N_c$…`, ['larger', 'smaller', 'unchanged', 'zero'], 0,
          [null, '$N_c \\propto (m^*)^{3/2}$.', 'It depends on $m^*$.', 'No.'], md`More states per energy for heavier carriers.`),
        Q(md`What is the probability that a state at the Fermi level is occupied at 0 K, and at 300 K?`, ['½ at both', '1 at 0 K, ½ at 300 K', '0 at 0 K, ½ at 300 K', 'It depends on the material'], 0,
          [null, 'At 0 K the step is exactly at $E_F$; by the definition $f(E_F) = \\tfrac12$.', 'No.', '$f$ is universal.'], md`$f(E_F) = 1/(1 + e^0) = \tfrac12$ at every temperature: that is the definition of $E_F$.`),
      ],
    },

    // ==================================================================== Topic 5
    't5-temp': {
      read: [RF(md`
        ### Where the Fermi level sits at each temperature

        [[fig:ef]]

        Follow a p-type sample from 0 K upward (the n-type picture is the mirror image, with $E_d$ near $E_c$):

        - **0 K:** no acceptor has taken an electron, so there are no holes. $E_F$ sits **between $E_v$ and $E_a$** (halfway, for a simple model).
        - **Freeze-out (cold):** acceptors start to ionize; $E_F$ moves up near $E_a$.
        - **Extrinsic (room temperature):** essentially every acceptor is ionized, $p_0 \approx N_a$, and $E_F = E_i - kT\ln(N_a/n_i)$. As $T$ rises, $n_i$ grows, so $E_F$ drifts **toward $E_i$**.
        - **Intrinsic (hot):** $n_i \gg N_a$; the sample behaves as if undoped and $E_F \approx E_i$.

        The same story in carrier counts is the $n_0$-vs-$T$ curve above. A plot of $\log n$ against $T$ for an **undoped** sample is a steep, steadily rising line ($n_i$); a **doped** sample shows the flat extrinsic plateau first. Devices are built to operate on that plateau.
      `, { ef: { svg: efVsT(), cap: '$E_F$ (solid) and $E_i$ (dashed) versus temperature for p-type Si with $N_a = 10^{15}$ cm⁻³ and acceptor level $E_a = E_v + 0.045$ eV.' } })],
      qs: [
        Q(md`At 0 K, where is the Fermi level of a p-type sample with acceptor level $E_a$?`, ['Between $E_v$ and $E_a$', 'At $E_i$', 'Just below $E_c$', 'Between $E_a$ and $E_i$'], 0,
          [null, 'That is the hot (intrinsic) limit.', 'That is n-type.', 'At 0 K no acceptor is ionized; $E_F$ is below $E_a$.'], md`All valence states full, all acceptor levels empty: $E_F$ lies between them.`),
        Q(md`A p-type sample is heated from 300 K to 500 K, still extrinsic. $E_F$…`, ['moves toward $E_i$', 'moves toward $E_v$', 'stays put', 'jumps to $E_c$'], 0,
          [null, '$n_i$ grows, so $\\ln(N_a/n_i)$ shrinks.', '$E_F - E_i = -kT\\ln(N_a/n_i)$ changes with both $kT$ and $n_i$.', 'No.'], md`The exponential growth of $n_i$ wins over the growth of $kT$.`),
        Q(md`Two samples' $\log n$ vs $T$ curves: A rises steadily over the whole range, B is flat from 150 K to 450 K and then joins A. Which is doped?`, ['B', 'A', 'Both', 'Neither'], 0,
          [null, 'A is $n_i(T)$: intrinsic.', 'A has no plateau.', 'B shows the extrinsic plateau.'], md`The plateau is $n_0 = N_d$; at high $T$ the doped sample turns intrinsic and joins $n_i$.`),
        P({
          title: 'Fermi level at two temperatures',
          q: md`p-type Si, $N_a = 1.0\times10^{17}\,\text{cm}^{-3}$. $n_i = 1.5\times10^{10}$ at 300 K and $1.87\times10^{14}\,\text{cm}^{-3}$ at 500 K. Find $E_F - E_i$ at both temperatures ($kT = 0.0259$ eV and $0.0431$ eV).`,
          parts: [{ lbl: md`(E_F - E_i)_{300}`, ans: -0.4070, unit: 'eV', tol: { abs: 0.002 } }, { lbl: md`(E_F - E_i)_{500}`, ans: -0.2708, unit: 'eV', tol: { abs: 0.002 } }],
          hints: [md`Both temperatures are extrinsic ($N_a \gg n_i$): $p_0 = N_a$.`, md`$E_F - E_i = -kT\ln(N_a/n_i)$.`],
          sol: md`$$300\,\text{K}: -(0.0259\,\text{eV})\ln\frac{10^{17}}{1.5\times10^{10}} = -0.407\,\text{eV}; \qquad 500\,\text{K}: -(0.0431\,\text{eV})\ln\frac{10^{17}}{1.87\times10^{14}} = -0.271\,\text{eV}$$ Hotter: $E_F$ moves toward $E_i$.`,
        }),
        P({
          title: 'Compensated Si when hot',
          q: md`Si has $3\times10^{13}$ phosphorus and $1\times10^{13}\,\text{cm}^{-3}$ boron, all ionized. At 410 K, $n_i = 1\times10^{13}\,\text{cm}^{-3}$. Find $n_0$. Is it larger or smaller than at 300 K?`,
          parts: [{ lbl: md`n_0(410\,\text{K})`, ans: 2.414e13, unit: 'cm^{-3}' }, { lbl: 'Compared with 300 K', mc: ['Larger', 'Smaller', 'The same'], a: 0, why: [null, 'Thermal pairs add electrons.', 'At 300 K it is just $N_d - N_a = 2\\times10^{13}$.'] }],
          hints: [md`$n_i$ is comparable to $N_d - N_a$: use the full neutrality formula.`],
          sol: md`$$n_0 = \frac{N_d - N_a}{2} + \sqrt{\left(\frac{N_d - N_a}{2}\right)^2 + n_i^2} = 10^{13} + \sqrt{10^{26} + 10^{26}}\,\text{cm}^{-3} = 2.41\times10^{13}\,\text{cm}^{-3}$$ At 300 K, $n_0 = N_d - N_a = 2.00\times10^{13}$: heating adds thermally generated pairs. (The other root of the quadratic is negative and unphysical.)`,
        }),
        Q(md`Why is a semiconductor device's operating range limited at high temperature?`, ['$n_i$ grows until it rivals the doping and the device loses its n/p character', 'The lattice melts at 400 K', 'Mobility becomes infinite', 'Dopants evaporate'], 0,
          [null, 'Si melts at 1414 °C.', 'Mobility falls with $T$.', 'No.'], md`Once $n_i \sim N_d$ the sample is effectively intrinsic.`),
      ],
    },

    // ==================================================================== Topic 6
    't6-drift': {
      read: [R(md`
        ### Thermal motion, collisions, and where mobility comes from

        Even with no field, carriers move fast in random directions. Equipartition gives the **thermal velocity**

        $$\tfrac12m^*v_{th}^2 = \tfrac32kT \quad\Rightarrow\quad v_{th} = \sqrt{\frac{3kT}{m^*}} \approx 10^7\,\text{cm/s at 300 K}$$

        Each carrier scatters off lattice vibrations and impurities after an average **mean free time** $\bar t \sim 0.1$ ps, covering a **mean free path** $\ell = v_{th}\bar t$ of a few tens of nm. A field nudges every flight in the same direction; the average of those nudges is the drift velocity, $v_d = \dfrac{q\bar t}{m^*}\mathscr{E}$, hence $\mu = q\bar t/m^*$. Drift velocities ($10^2$–$10^5$ cm/s) are tiny next to $v_{th}$ until fields get very high.

        ### The lowest conductivity a material can have

        With both carriers, $\sigma = q\left(n_0\mu_n + \dfrac{n_i^2}{n_0}\mu_p\right)$. Setting $d\sigma/dn_0 = 0$:

        $$n_0 = n_i\sqrt{\frac{\mu_p}{\mu_n}}, \qquad \sigma_{\min} = 2qn_i\sqrt{\mu_n\mu_p}$$

        Since $\mu_p < \mu_n$, the least conductive sample is slightly **p-type**, not intrinsic.

        ### Doping that changes with depth

        A layer of width $W$, length $L$ and depth $d$ whose doping varies with depth, $N_d(x)$, is many thin slices in parallel. Each slice $dx$ conducts $q\mu N_d(x)\,W\,dx/L$, so

        $$\frac1R = \frac{W}{L}\int_0^d q\,\mu\,N_d(x)\,dx \quad\Longrightarrow\quad R = \frac{L}{W\,q\mu\int_0^d N_d(x)\,dx}$$

        (with $\mu$ itself depending on $x$ if the doping range is wide).

        ### Compensating dopants raise the resistivity twice over

        Adding acceptors to an n-type sample removes electrons **and** adds ionized impurities that scatter. Example: $10^{17}$ P plus $3\times10^{17}$ B gives a p-type sample with $p_0 = 2\times10^{17}$, but every carrier now scatters off $4\times10^{17}$ ions and the hole mobility is the lower one. The resistivity ends up higher than before, even though there are more carriers.

        ### When both carriers matter

        At room temperature a doped sample's current is almost all majority carriers. Heat it until $n_i$ is comparable to the doping and the minority carriers multiply: the share of current carried by the minority carrier grows.
      `)],
      qs: [
        P({
          title: 'Thermal velocity, mean free time, mean free path',
          q: md`Electrons in Si have $m^* = 0.26\,m_0$ and $\mu_n = 1350\,\text{cm}^2/\text{V·s}$ at 300 K. Find $v_{th}$ (cm/s), the mean free time $\bar t$ (ps), and the mean free path (nm). ($k = 1.38\times10^{-23}$ J/K, $m_0 = 9.11\times10^{-31}$ kg.)`,
          parts: [{ lbl: md`v_{th}`, ans: 2.29e7, unit: 'cm/s' }, { lbl: md`\bar t`, ans: 0.1999, unit: 'ps' }, { lbl: md`\ell`, ans: 45.76, unit: 'nm' }],
          hints: [md`$v_{th} = \sqrt{3kT/m^*}$ (SI units, then m/s → cm/s).`, md`$\bar t = \mu m^*/q$ with $\mu$ in m²/V·s: $1350\,\text{cm}^2/\text{V·s} = 0.135\,\text{m}^2/\text{V·s}$.`, md`$\ell = v_{th}\bar t$.`],
          sol: md`$$v_{th} = \sqrt{\frac{3(1.38\times10^{-23}\,\text{J/K})(300\,\text{K})}{(0.26)(9.11\times10^{-31}\,\text{kg})}} = 2.29\times10^{5}\,\text{m/s} = 2.29\times10^{7}\,\text{cm/s}$$ $$\bar t = \frac{(0.135\,\text{m}^2/\text{V·s})(2.37\times10^{-31}\,\text{kg})}{1.6\times10^{-19}\,\text{C}} = 2.00\times10^{-13}\,\text{s}, \qquad \ell = (2.29\times10^{5}\,\text{m/s})(2.00\times10^{-13}\,\text{s}) = 45.8\,\text{nm}$$`,
        }),
        Q(md`Which sample has the lowest conductivity possible for Si (mobilities fixed)?`, ['Slightly p-type, $n_0 = n_i\\sqrt{\\mu_p/\\mu_n}$', 'Intrinsic', 'Slightly n-type', 'Heavily compensated'], 0,
          [null, 'Trading a few electrons for slower holes lowers $\\sigma$ a bit further.', 'Backwards: electrons conduct better.', 'Compensation gives carriers like intrinsic material; the minimum is still slightly p-type.'], md`Minimize $\sigma(n_0)$: $n_0 = n_i\sqrt{\mu_p/\mu_n} < n_i$.`),
        Q(md`n-type Si with $10^{17}$ P receives $3\times10^{17}\,\text{cm}^{-3}$ B. Its type and resistivity become…`, ['p-type; resistivity higher than before', 'n-type; resistivity lower', 'p-type; resistivity lower (more carriers)', 'intrinsic; resistivity unchanged'], 0,
          [null, 'Acceptors now outnumber donors.', 'There are more carriers, but holes are slower and scattering is much stronger.', 'Net doping is $2\\times10^{17}$ acceptors.'], md`$p_0 = 2\times10^{17}$, but $N_I = 4\times10^{17}$ and holes have lower mobility.`),
        Q(md`Why do both electron and hole mobilities fall when a lightly doped sample goes from 300 K to 500 K?`, ['More lattice vibration (phonon) scattering', 'More ionized impurities', 'Fewer carriers', 'The effective mass doubles'], 0,
          [null, 'The doping is fixed.', 'Mobility is per carrier.', 'Not significantly.'], md`$\mu_L \propto T^{-3/2}$.`),
        Q(md`An n-type sample is heated until $n_i$ is comparable to $N_d$. The ratio of hole current to electron current…`, ['increases', 'decreases', 'stays the same', 'becomes exactly 1'], 0,
          [null, 'Holes go from $n_i^2/N_d$ toward $n_i$: they grow.', 'Minority carriers multiply.', 'Only if $p\\mu_p = n\\mu_n$.'], md`Thermal pairs add as many holes as electrons, a big relative gain for the minority.`),
        Q(md`A layer has doping $N_d(x)$ that varies with depth $x$ (thickness $d$). Its resistance between contacts $L$ apart, width $W$, is…`, ['$R = \\dfrac{L}{Wq\\mu\\int_0^dN_d(x)\\,dx}$', '$R = \\dfrac{\\rho L}{Wd}$ with $\\rho$ at the surface', '$R = \\dfrac{L}{Wd\\,q\\mu N_d(0)}$', '$R = \\int_0^d\\rho\\,dx$'], 0,
          [null, 'Resistivity changes with depth.', 'Only for uniform doping.', 'Slices are in parallel: add conductances, not resistances.'], md`Each depth slice is a parallel resistor.`),
        P({
          title: 'Minimum conductivity of Si',
          q: md`Si: $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$, $\mu_n = 1350$, $\mu_p = 480\,\text{cm}^2/\text{V·s}$. Find $\sigma_{\min}$.`,
          parts: [{ lbl: md`\sigma_{\min}`, ans: 3.864e-6, unit: '(Ω·cm)^{-1}' }],
          hints: [md`$\sigma_{\min} = 2qn_i\sqrt{\mu_n\mu_p}$.`],
          sol: md`$$\sigma_{\min} = 2\left(1.6\times10^{-19}\,\text{C}\right)\left(1.5\times10^{10}\,\text{cm}^{-3}\right)\sqrt{(1350)(480)}\,\tfrac{\text{cm}^2}{\text{V·s}} = 3.86\times10^{-6}\,(\Omega\cdot\text{cm})^{-1}$$ Intrinsic Si is $4.39\times10^{-6}$, a little higher.`,
        }),
      ],
    },

    // ==================================================================== Topic 7
    't7-flatef': {
      read: [R(md`
        ### A picture to keep

        Think of $E_F$ as a water level. Two tanks with different levels, once connected, exchange water until the levels match; then nothing flows, although the tank bottoms (the band edges) can be at different heights. A tilted water surface would mean flow, which equilibrium does not allow.

        Reading an equilibrium band diagram: wherever $E_c$ and $E_v$ bend, there is a field ($\mathscr{E} = \frac1q\frac{dE_c}{dx}$) and a region of net charge; wherever $E_F$ is closer to $E_c$ the material is n-type there, and closer to $E_v$, p-type. The amount by which the bands step between two regions is the difference of their Fermi levels before contact.
      `)],
      qs: [
        P({
          title: 'Two samples joined',
          q: md`Si sample 1 has $E_F - E_i = +0.30$ eV and sample 2 has $E_F - E_i = -0.30$ eV ($E_g = 1.12$ eV). They are joined. How far apart are their $E_c$ levels at equilibrium?`,
          parts: [{ lbl: md`\Delta E_c`, ans: 0.60, unit: 'eV', tol: { abs: 0.002 } }],
          hints: [md`$E_F$ lines up; each side keeps its own $E_F - E_i$.`],
          sol: md`$$\Delta E_c = (+0.30\,\text{eV}) - (-0.30\,\text{eV}) = 0.60\,\text{eV}$$ $E_c$ is 0.60 eV higher on the p side (sample 2).`,
        }),
        Q(md`After two differently doped pieces of Si touch and reach equilibrium, on which side are the bands higher?`, ['The more p-type side', 'The more n-type side', 'Neither: the bands stay level', 'It depends on which was touched first'], 0,
          [null, 'Electrons left the n side, lowering its bands.', 'Then the Fermi levels could not line up.', 'No.'], md`$E_F$ is near $E_v$ on the p side, so the p side's bands sit higher once $E_F$ is level.`),
        Q(md`Raising the doping on both sides of a p–n contact makes the contact potential $V_0$…`, ['larger', 'smaller', 'unchanged', 'zero'], 0,
          [null, '$V_0 = \\frac{kT}{q}\\ln\\frac{N_aN_d}{n_i^2}$ grows with doping.', 'No.', 'No.'], md`Each side's $E_F$ moves farther from $E_i$.`),
        Q(md`An equilibrium band diagram shows $E_c$ sloping between $x_1$ and $x_2$. The net current there is…`, ['zero: drift and diffusion cancel', 'set by the slope', 'only drift', 'only diffusion'], 0,
          [null, 'The slope sets the field, not the net current.', 'Diffusion balances it.', 'Drift balances it.'], md`Equilibrium means no net current anywhere.`),
      ],
    },

    // ==================================================================== Topic 8
    't8-optical': {
      read: [R(md`
        ### Luminescence: light out

        Recombination across the gap can emit a photon of energy close to $E_g$. What kind of luminescence it is depends on how the carriers were excited:

        - **Photoluminescence**: light in, light out. If the carriers recombine at once it is **fluorescence**; if they are first caught in traps and released slowly, the glow lingers: **phosphorescence**.
        - **Electroluminescence**: an electric current injects the carriers (an LED).
        - **Cathodoluminescence**: a beam of high-energy electrons excites them (old TV screens, electron microscopes).

        Direct-gap materials (GaAs) are good emitters; indirect ones (Si) mostly turn the energy into heat.

        ### Measuring α and counting the pairs

        Shine power $P_0$ on a slab of thickness $d$ and measure what comes out, $P_t$. Then $\alpha = \dfrac1d\ln\dfrac{P_0}{P_t}$. Each absorbed photon makes one electron–hole pair, so pairs per second $= P_{\text{abs}}/h\nu$, and if they are spread through the sample's volume, the generation rate is $g_{op} = \dfrac{P_{\text{abs}}/h\nu}{\text{volume}}$ (cm⁻³s⁻¹). Choosing a photodetector material is choosing a gap: it only responds to photons with $h\nu \ge E_g$.
      `)],
      qs: [
        P({
          title: 'Absorption coefficient and generation rate',
          q: md`$1.0$ mW of light with photon energy $2.48\times10^{-19}$ J enters a $4.0\,\mu$m-thick Si sample and $0.202$ mW comes out (no reflection). Find (a) $\alpha$, (b) the electron–hole pairs created per second, (c) the generation rate if they spread evenly through a $500\times250\times4\,\mu\text{m}^3$ sample.`,
          parts: [{ lbl: md`\alpha`, ans: 3999, unit: 'cm^{-1}' }, { lbl: 'pairs/s', ans: 3.218e15, unit: 's^{-1}' }, { lbl: md`g_{op}`, ans: 6.435e21, unit: 'cm^{-3}s^{-1}' }],
          hints: [md`$\alpha = \frac1d\ln(P_0/P_t)$ with $d$ in cm.`, md`Absorbed power $0.798$ mW; divide by the photon energy.`, md`Volume $= (500\times10^{-4})(250\times10^{-4})(4\times10^{-4})\,\text{cm}^3$.`],
          sol: md`$$\alpha = \frac{1}{4.0\times10^{-4}\,\text{cm}}\ln\frac{1.0}{0.202} = 4.00\times10^{3}\,\text{cm}^{-1}, \qquad \frac{0.798\times10^{-3}\,\text{J/s}}{2.48\times10^{-19}\,\text{J}} = 3.22\times10^{15}\,\text{s}^{-1}$$ $$g_{op} = \frac{3.22\times10^{15}\,\text{s}^{-1}}{5.0\times10^{-7}\,\text{cm}^3} = 6.44\times10^{21}\,\text{cm}^{-3}\text{s}^{-1}$$`,
        }),
        Q(md`An LED emits light by…`, ['electroluminescence', 'photoluminescence', 'cathodoluminescence', 'phosphorescence'], 0,
          [null, 'That needs light to excite it.', 'That needs an electron beam.', 'That is delayed photoluminescence.'], md`Current injects the carriers.`),
        Q(md`A sample keeps glowing for seconds after the exciting light is switched off. This is…`, ['phosphorescence: carriers stuck in traps release slowly', 'fluorescence', 'electroluminescence', 'impossible'], 0,
          [null, 'Fluorescence stops within the carrier lifetime.', 'No current here.', 'Trapping makes it possible.'], md`Traps delay recombination.`),
        Q(md`Which material could detect 1.55 μm light (0.80 eV)?`, ['Ge ($E_g = 0.67$ eV)', 'Si ($E_g = 1.12$ eV)', 'GaAs ($E_g = 1.43$ eV)', 'CdS ($E_g = 2.42$ eV)'], 0,
          [null, 'Its gap is above 0.80 eV: transparent.', 'Transparent.', 'Transparent.'], md`Need $E_g \le h\nu$.`),
        Q(md`CdS has $E_g = 2.42$ eV. The longest wavelength it absorbs is about…`, ['0.512 μm (green)', '2.42 μm', '0.867 μm', '1.11 μm'], 0,
          [null, 'eV and μm are not interchangeable.', 'That is GaAs.', 'That is Si.'], md`$1.24/2.42 = 0.512$ μm.`),
      ],
    },

    // ==================================================================== Topic 9
    't9-recomb': {
      read: [R(md`
        ### Thinking with excess carriers

        Excess carriers can also be **negative**: if something removes carriers below equilibrium, generation outruns recombination and refills them, with the same lifetime. Example: a pulse that suddenly removes all minority electrons from p-type material ($N_a = 10^{16}$). Right after it, $\delta n = -n_0 = -2.25\times10^{4}\,\text{cm}^{-3}$. Generation now dominates; the disturbance is tiny next to $p_0$ (low level), so

        $$\delta n(t) = -n_0\,e^{-t/\tau_n}, \qquad n(t) = n_0\left(1 - e^{-t/\tau_n}\right)$$

        **Rates at equilibrium.** Thermal generation $g(T) = \alpha_rn_i^2$ equals the recombination rate $\alpha_rn_0p_0$, for electrons and holes alike (they are made and destroyed in pairs). If a problem gives $g(T)$, you can get $\alpha_r = g(T)/n_i^2$ and from it the lifetime.
      `)],
      qs: [
        Q(md`Right after all minority electrons are wiped out of a p-type wafer, which dominates?`, ['Generation: it refills the missing electrons', 'Recombination', 'Neither: the wafer is at equilibrium', 'Both stop'], 0,
          [null, 'Recombination needs electrons, and there are almost none.', 'It is far from equilibrium.', 'Generation never stops above 0 K.'], md`$r = \alpha_rnp \approx 0$ while $g$ is unchanged.`),
        Q(md`Is that wafer ($N_a = 10^{16}$) under low-level injection just after the event?`, ['Yes: $|\\delta n| = n_0 \\ll p_0$', 'No: all electrons are gone', 'Only if $\\tau_n$ is short', 'Only at high temperature'], 0,
          [null, 'Low level compares $|\\delta n|$ with the majority, which is untouched.', 'It does not depend on $\\tau$.', 'No.'], md`$|\delta n| = 2.25\times10^{4} \ll 10^{16}$.`),
        P({
          title: 'Lifetime from the thermal generation rate',
          q: md`In Si at 300 K, $g(T) = 4.5\times10^{10}\,\text{cm}^{-3}\text{s}^{-1}$ and $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$. Find $\alpha_r$ and the minority-electron lifetime in p-type Si with $N_a = 10^{15}\,\text{cm}^{-3}$.`,
          parts: [{ lbl: md`\alpha_r`, ans: 2.0e-10, unit: 'cm^3/s' }, { lbl: md`\tau_n`, ans: 5.0, unit: 'μs' }],
          hints: [md`$g(T) = \alpha_rn_i^2$.`, md`$\tau_n = 1/(\alpha_rp_0)$.`],
          sol: md`$$\alpha_r = \frac{4.5\times10^{10}\,\text{cm}^{-3}\text{s}^{-1}}{\left(1.5\times10^{10}\,\text{cm}^{-3}\right)^2} = 2.0\times10^{-10}\,\text{cm}^3/\text{s}, \qquad \tau_n = \frac{1}{\left(2.0\times10^{-10}\right)\left(10^{15}\right)}\,\text{s} = 5.00\,\mu\text{s}$$`,
        }),
        Q(md`At thermal equilibrium, is the recombination rate of holes equal to that of electrons?`, ['Yes: every recombination removes one of each', 'No: holes recombine faster', 'Only in intrinsic material', 'Only under light'], 0,
          [null, 'One event takes one electron and one hole.', 'True in any material.', 'True at equilibrium too.'], md`Recombination is pairwise.`),
        Q(md`A light pulse makes $\delta n = 10^{15}$ in Si with $N_a = 10^{16}\,\text{cm}^{-3}$. Low or high level?`, ['Low level (10× below the majority)', 'High level', 'Neither', 'Depends on τ'], 0,
          [null, 'High level needs $\\delta n \\gg p_0$.', 'It is one of the two.', 'No.'], md`$\delta n = 0.1\,p_0$: the majority barely changes.`),
      ],
    },

    // ==================================================================== Topic 10
    't10-qfl': {
      read: [R(md`
        ### How far from equilibrium?

        The split of the quasi-Fermi levels measures it directly:
        $$F_n - F_p = kT\ln\frac{np}{n_i^2}$$
        zero in the dark, and growing logarithmically with the light. Under **low-level** light only the minority level moves; under **high-level** light both move (both carrier populations change a lot).

        A level can also end up on the "wrong" side of $E_i$. When $p < n_i$ (as in n-type material), $p = n_ie^{(E_i - F_p)/kT}$ puts $F_p$ **above** $E_i$. Always compute where it is instead of guessing.
      `)],
      qs: [
        P({
          title: 'Quasi-Fermi levels in a hot sample',
          q: md`Si with $N_d = 10^{16}\,\text{cm}^{-3}$ is lit with $g_{op} = 10^{19}\,\text{cm}^{-3}\text{s}^{-1}$ and heats to 450 K, where $n_i = 10^{14}\,\text{cm}^{-3}$ and $kT = 0.0388$ eV. $\tau_n = \tau_p = 1\,\mu$s, $D_n = 36$, $D_p = 12\,\text{cm}^2/\text{s}$. Find $F_n - E_i$, $E_i - F_p$, and $\Delta\sigma$.`,
          parts: [{ lbl: md`F_n - E_i`, ans: 0.1787, unit: 'eV', tol: { abs: 0.002 } }, { lbl: md`E_i - F_p`, ans: -0.0856, unit: 'eV', tol: { abs: 0.002 } }, { lbl: md`\Delta\sigma`, ans: 1.98e-3, unit: '(Ω·cm)^{-1}', tol: { rel: 0.02 } }],
          hints: [md`$\delta n = \delta p = g_{op}\tau = 10^{13}$; $p_0 = n_i^2/N_d = 10^{12}$ is **not** negligible next to $10^{13}$.`, md`$p = 1.1\times10^{13} < n_i$, so $F_p$ is above $E_i$ (negative answer).`, md`Mobilities from Einstein at 450 K: $\mu = D/(kT/q)$.`],
          sol: md`$$F_n - E_i = (0.0388\,\text{eV})\ln\frac{1.001\times10^{16}}{10^{14}} = 0.179\,\text{eV}, \qquad E_i - F_p = (0.0388\,\text{eV})\ln\frac{1.1\times10^{13}}{10^{14}} = -0.0856\,\text{eV}$$ $$\mu_n = \frac{36}{0.0388} = 928, \quad \mu_p = \frac{12}{0.0388} = 309\,\tfrac{\text{cm}^2}{\text{V·s}}, \quad \Delta\sigma = \left(1.6\times10^{-19}\right)\left(10^{13}\right)(928 + 309) = 1.98\times10^{-3}\,(\Omega\cdot\text{cm})^{-1}$$`,
        }),
        P({
          title: 'Splitting of the quasi-Fermi levels',
          q: md`n-type Si, $N_d = 10^{15}\,\text{cm}^{-3}$, $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$, under steady light with $\delta n = \delta p = 10^{13}\,\text{cm}^{-3}$. Find $F_n - F_p$.`,
          parts: [{ lbl: md`F_n - F_p`, ans: 0.4564, unit: 'eV', tol: { abs: 0.002 } }],
          hints: [md`$F_n - F_p = kT\ln(np/n_i^2)$ with $n = 1.01\times10^{15}$, $p \approx 10^{13}$.`],
          sol: md`$$F_n - F_p = (0.0259\,\text{eV})\ln\frac{\left(1.01\times10^{15}\right)\left(1.0\times10^{13}\right)}{\left(1.5\times10^{10}\right)^2} = (0.0259\,\text{eV})(17.6) = 0.456\,\text{eV}$$`,
        }),
        Q(md`The light on a sample is made 10× brighter (still low level). $F_n - F_p$…`, ['grows by about $kT\\ln10 = 0.06$ eV', 'grows 10×', 'is unchanged', 'shrinks'], 0,
          [null, 'It grows logarithmically.', 'More carriers move the minority level.', 'No.'], md`$\delta p$ grows 10×, so $F_p$ moves by $kT\ln10$.`),
        Q(md`Under **high-level** illumination of an n-type sample…`, ['both $F_n$ and $F_p$ move noticeably', 'only $F_p$ moves', 'only $F_n$ moves', 'neither moves'], 0,
          [null, 'That is low level.', 'The minority always moves.', 'Light always splits them.'], md`$\delta n$ is comparable to or larger than $n_0$, so $F_n$ moves too.`),
        Q(md`In n-type material in the dark, $E_F$ is above $E_i$. Where is $p_0$ relative to $n_i$?`, ['$p_0 < n_i$', '$p_0 > n_i$', '$p_0 = n_i$', 'Unknown'], 0,
          [null, 'That would need $E_F$ below $E_i$.', 'Only intrinsic.', 'It follows from $E_F - E_i$.'], md`$p_0 = n_ie^{(E_i - E_F)/kT} < n_i$.`),
      ],
    },

    // ==================================================================== Topic 11
    't11-diffusion': {
      read: [R(md`
        ### Quasi-neutrality, and reading currents off a band diagram

        In the graded-doping example, $n \approx N_d(x)$ even though a field exists. That is the **quasi-neutral approximation**: it takes only a tiny imbalance between $n$ and $N_d$ to create a sizeable field (Poisson: $\dfrac{d\mathscr{E}}{dx} = \dfrac{q}{\epsilon}(p - n + N_d^+ - N_a^-)$), so you may set $n = N_d$ when counting carriers and still keep the field.

        Reading a band diagram at equilibrium:
        - **Field:** from the slope, $\mathscr{E} = \frac1q\frac{dE_c}{dx}$: it points the way $E_c$ rises.
        - **Carriers:** where $E_F$ is nearer $E_c$, $n$ is larger; plot $\log n$ and $\log p$ as mirror images about $n_i$ (they cross where $E_F = E_i$).
        - **Flows:** electrons diffuse from high $n$ to low $n$, and the field drifts them back downhill in $E_c$. Holes do the opposite. Each pair of flows cancels.

        The diffusion coefficient is tied to the mobility because both measure the same random walk: setting $J_n = 0$ in a graded sample and using $n \propto e^{-(E_c - E_F)/kT}$ gives exactly $D_n/\mu_n = kT/q$.
      `)],
      qs: [
        Q(md`In an equilibrium band diagram $E_c$ rises toward $+x$. The field points…`, ['toward $+x$', 'toward $-x$', 'nowhere: equilibrium has no field', 'perpendicular to $x$'], 0,
          [null, '$\\mathscr{E} = \\frac1q\\frac{dE_c}{dx} > 0$.', 'Bent bands mean a field.', 'One-dimensional.'], md`The field points the way the electron energy increases (it pushes electrons the other way, downhill).`),
        Q(md`Where is the electron concentration larger: where $E_F$ is 0.1 eV or 0.3 eV below $E_c$?`, ['0.1 eV below', '0.3 eV below', 'The same', 'Depends on $N_v$'], 0,
          [null, 'Farther from $E_c$ means fewer electrons.', '$n = N_ce^{-(E_c - E_F)/kT}$.', 'Electrons depend on $N_c$.'], md`Closer to $E_c$, exponentially more electrons.`),
        Q(md`The quasi-neutral approximation says…`, ['$n \\approx N_d$ even where a built-in field exists, because a tiny charge imbalance makes a large field', 'there is no field', 'the net charge is large', 'drift and diffusion are both zero'], 0,
          [null, 'There is a field.', 'It is tiny.', 'They are equal and opposite.'], md`Poisson's equation with a small net charge.`),
        Q(md`At a point where $E_F = E_i$ in an equilibrium sample…`, ['$n = p = n_i$', '$n = 0$', '$p = 0$', '$n = N_d$'], 0,
          [null, 'No.', 'No.', 'Only where $E_F - E_i = kT\\ln(N_d/n_i)$.'], md`Both formulas give $n_i$.`),
        Q(md`Holes are steadily injected at $x = 0$ into an n-type bar, giving $p(x) = n_i(1 - x/L) + n_i^2/N_d$ for $0 \le x \le L$ (with $n \approx N_d$). How does $F_p$ vary?`, ['It rises from $E_i$ at $x = 0$ to $E_F$ at $x = L$', 'It is flat at $E_F$', 'It falls from $E_F$ to $E_i$', 'It is flat at $E_i$'], 0,
          [null, 'Flat only at equilibrium.', 'Backwards: at $x = 0$, $p \\approx n_i$, so $F_p \\approx E_i$.', '$p$ changes with $x$.'], md`$F_p = E_i - kT\ln(p/n_i)$: $p \approx n_i$ at $x = 0$ gives $E_i$; $p = p_0$ at $x = L$ gives $E_F$ (above $E_i$, n-type). $F_n = E_F$ stays flat.`),
      ],
    },

    // ==================================================================== Topic 12
    't12-continuity': {
      read: [R(md`
        ### Stored charge, and three special cases

        The injected excess holes are a stored charge. Integrating the exponential profile over a bar of cross-section $A$:

        $$Q_p = qA\int_0^\infty \Delta p\,e^{-x/L_p}\,dx = qA\,\Delta p\,L_p$$

        That charge must be resupplied as fast as it recombines, so the current at the injection point is
        $$I_p(0) = \frac{Q_p}{\tau_p} = \frac{qAD_p\,\Delta p}{L_p}$$
        the same result as differentiating the profile. The diffusion current is **largest at the injection point** and falls to zero far away, where every injected hole has recombined.

        Special cases of the continuity equation:
        - **Steady state, recombination negligible** (region much shorter than $L$): $d^2\delta p/dx^2 = 0$, a **straight-line** profile and a constant current.
        - **Uniform light, no gradients**: $d\delta p/dt = g_{op} - \delta p/\tau_p$, so the steady state is $\delta p = g_{op}\tau_p$ (Topic 10).
        - **No light, no gradients**: pure decay, $\delta p = \Delta p\,e^{-t/\tau_p}$ (Topic 9).
      `)],
      qs: [
        P({
          title: 'Stored charge',
          q: md`p-type Si: electrons are injected at $x = 0$ with $\Delta n = 10^{15}\,\text{cm}^{-3}$; $\mu_n = 1000\,\text{cm}^2/\text{V·s}$, $\tau_n = 100$ ps, area $A = 10^{-4}\,\text{cm}^2$, 300 K. Find $L_n$ (μm), the stored charge $Q_n$, and the electron current at $x = 0$ (mA).`,
          parts: [{ lbl: md`L_n`, ans: 0.5089, unit: 'μm' }, { lbl: md`Q_n`, ans: 8.143e-13, unit: 'C' }, { lbl: md`|I_n(0)|`, ans: 8.143, unit: 'mA' }],
          hints: [md`$D_n = 0.0259 \times 1000 = 25.9\,\text{cm}^2/\text{s}$; $L_n = \sqrt{D_n\tau_n}$.`, md`$Q_n = qA\Delta nL_n$.`, md`$|I_n(0)| = Q_n/\tau_n$.`],
          sol: md`$$L_n = \sqrt{\left(25.9\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(10^{-10}\,\text{s}\right)} = 5.09\times10^{-5}\,\text{cm} = 0.509\,\mu\text{m}$$ $$Q_n = \left(1.6\times10^{-19}\,\text{C}\right)\left(10^{-4}\,\text{cm}^2\right)\left(10^{15}\,\text{cm}^{-3}\right)\left(5.09\times10^{-5}\,\text{cm}\right) = 8.14\times10^{-13}\,\text{C}, \qquad |I_n(0)| = \frac{8.14\times10^{-13}\,\text{C}}{10^{-10}\,\text{s}} = 8.14\,\text{mA}$$`,
        }),
        Q(md`Where is the hole diffusion current largest in a long bar with steady injection at $x = 0$?`, ['At $x = 0$', 'At $x = L_p$', 'Far away', 'It is uniform'], 0,
          [null, 'It has fallen to $1/e$ there.', 'It is zero far away.', 'Only without recombination.'], md`$J_p \propto e^{-x/L_p}$.`),
        Q(md`If the lifetime were infinite (no recombination) in a short region, the steady excess profile would be…`, ['a straight line', 'an exponential', 'constant', 'zero'], 0,
          [null, 'The exponential needs recombination.', 'It still must match the boundary values.', 'Carriers were injected.'], md`$d^2\delta p/dx^2 = 0$.`),
        Q(md`Doubling the diffusion length (same $\Delta p$) does what to the stored charge?`, ['Doubles it', 'Halves it', 'No change', 'Quadruples it'], 0,
          [null, '$Q = qA\\Delta pL$.', 'Linear in $L$.', 'Linear.'], md`$Q_p = qA\,\Delta p\,L_p$.`),
      ],
    },
  };
})();

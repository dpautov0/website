/* rapid-a.js — rapid-fire concept drills for Exam 1, topics 1–4: short "look at it and reason" questions with new
   situations every time (most need only mental math: 60 meV per decade, ratios, signs). Each GENS.rf_* generator
   picks one of several templates with random numbers. RF.topics[lessonId] lists the drills e1-tools.js puts in each
   lesson; RF.why[lessonId] is the "why you care" opener. Topics 5–12: rapid-b.js, rapid-c.js. */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri, shuffle } = U;
  const RF = (window.RF = window.RF || { topics: {}, why: {} });

  // A multiple-choice card. wrongs: [[option, why it is wrong], ...]; duplicates of the answer are dropped.
  RF.MC = (title, q, right, wrongs, sol, fig) => {
    const seen = new Set([right]), keep = [];
    for (const [o, w] of wrongs) if (!seen.has(o)) { seen.add(o); keep.push([o, w]); }
    const all = [[right, null], ...shuffle(keep).slice(0, 3)];
    return { title, q, parts: [{ mc: all.map((x) => x[0]), a: 0, why: all.map((x) => x[1]) }], sol, fig };
  };
  RF.D = 0.0596;                                              // eV per decade of concentration at 300 K (kT ln 10)
  RF.e = (x) => x.toFixed(2);                                 // an energy in eV, as printed
  RF.p10 = (m, k) => (m === 1 ? `10^{${k}}` : `${m}\\times10^{${k}}`);
  RF.pow = (k) => (k === 0 ? '1' : k === 1 ? '10' : `10^{${k}}`);
  RF.one = (list) => pick(list)();
  // Si band diagram (energies from Ev), with optional dimension arrows
  RF.bd = (o) => BD.diagram(Object.assign({ w: 220, h: 120, Ec: 1.12, Ev: 0, Ei: 0.56, axis: false, labLeft: ['Ei'] }, o));
  const { MC, e, p10, pow, one, bd } = RF;
  const NI = '1.5\\times10^{10}';

  // =========================================================================== Topic 1: crystals
  GENS.rf_cells = () => one([
    () => {
      const [pos, fr, n, w] = pick([['corner', '\\tfrac18', 8, 'eight'], ['edge', '\\tfrac14', 4, 'four'], ['face', '\\tfrac12', 2, 'two'], ['inside the cube', '1', 1, 'one']]);
      const all = ['\\tfrac18', '\\tfrac14', '\\tfrac12', '1'].map((x) => `$${x}$`);
      return MC('Sharing atoms', md`An atom sits on a cubic cell's **${pos}**. How much of it belongs to that one cell?`, `$${fr}$`,
        all.filter((x) => x !== `$${fr}$`).map((x) => [x, md`Count the cells that meet there: ${w}, each owning an equal share.`]),
        md`${n === 1 ? 'An interior atom belongs to one cell only.' : `${w[0].toUpperCase() + w.slice(1)} cells meet at a ${pos}, so each owns $${fr}$.`}`);
    },
    () => {
      const [k, n, how] = pick([['simple cubic', 1, '8 corners × ⅛'], ['bcc', 2, '8 × ⅛ + 1 in the center'], ['fcc', 4, '8 × ⅛ + 6 faces × ½'], ['diamond (Si)', 8, 'fcc’s 4 points × a 2-atom basis'], ['zincblende (GaAs)', 8, '4 Ga + 4 As']]);
      return MC('Atoms per cell', md`How many atoms does one cubic cell of the **${k}** structure hold?`, String(n),
        ['1', '2', '4', '8', '14', '18'].filter((x) => x !== String(n)).map((x) => [x, x === '14' || x === '18' ? 'That counts shared atoms as whole atoms.' : 'Recount with the sharing rule: corner ⅛, face ½, inside 1.']),
        md`${how} = ${n}.`);
    },
    () => {
      const A = 'That is an area scaling ($a^2$); volume goes as $a^3$.', L = 'That scales with $a$; volume goes as $a^3$.', W = 'Wrong direction: a bigger cell holds the same atoms in more volume.';
      const [k, r, ws] = pick([['doubles', '÷8', [['÷4', A], ['÷2', L], ['×8', W]]], ['triples', '÷27', [['÷9', A], ['÷3', L], ['×27', W]]], ['halves', '×8', [['×4', A], ['×2', L], ['÷8', W]]]]);
      return MC('Scaling the cell', md`A crystal keeps its structure but its lattice constant **${k}**. The number of atoms per cm³…`, r, ws,
        md`$N = (\text{atoms per cell})/a^3$.`);
    },
    () => {
      const [k, n] = pick([['simple cubic', 6], ['bcc', 8], ['fcc', 12], ['diamond (Si)', 4]]);
      return MC('Nearest neighbors', md`How many nearest neighbors does each atom have in **${k}**?`, String(n),
        ['4', '6', '8', '12'].filter((x) => x !== String(n)).map((x) => [x, { 4: 'That is diamond: one neighbor per covalent bond.', 6: 'That is simple cubic.', 8: 'That is bcc: the 8 corners around the center.', 12: 'That is fcc, the close-packed case.' }[x]]),
        md`sc 6, bcc 8, fcc 12, diamond 4 (one per bond, tetrahedral).`);
    },
    () => {
      const k = ri(14, 19), r = 22 - k;
      return MC('How dilute is doping?', md`Si has $5\times10^{22}$ atoms/cm³. Doped at $10^{${k}}\,\text{cm}^{-3}$, there is about one dopant per how many Si atoms?`, `$${p10(5, r)}$`,
        [[`$${p10(5, r + 1)}$`, 'Off by ten: divide the exponents carefully.'], [`$${p10(5, r - 1)}$`, 'Off by ten.'], [`$${pow(k)}$`, 'That is the doping itself, per cm³.'], [`$${p10(2, k - 22)}$`, 'That is the dopant fraction, not atoms per dopant.']],
        md`$5\times10^{22}/10^{${k}} = 5\times10^{${r}}$. Even "heavy" doping is a tiny fraction of the atoms.`);
    },
    () => {
      const L = pick([10, 20, 50, 100]), k = pick([16, 17, 18, 19]);
      const n = Math.pow(L, 3) * 1e-21 * Math.pow(10, k);
      const fmt = (x) => (x >= 1 ? S.p(x) : S.f(x, 1));
      return MC('Counting dopants in a tiny box', md`A cube ${L} nm on a side is doped at $10^{${k}}\,\text{cm}^{-3}$. About how many dopant atoms does it hold?`, `$${fmt(n)}$`,
        [[`$${fmt(n * 10)}$`, 'Check the cube: $(10^{-7}\\,\\text{cm})^3 = 10^{-21}\\,\\text{cm}^3$ per nm³.'], [`$${fmt(n / 10)}$`, 'Off by ten.'], [`$${fmt(n * 1000)}$`, 'Off by a thousand: cube the size.'], [`$${fmt(n / 1000)}$`, 'Off by a thousand: cube the size.']],
        md`$V = ${L}^3\times10^{-21} = ${S.p(Math.pow(L, 3) * 1e-21)}\,\text{cm}^3$; times $10^{${k}}$ gives about $${fmt(n)}$.${n < 1 ? ' Fewer than one: most such boxes hold no dopant at all.' : ''}`);
    },
    () => {
      const m = pick([2.6, 1.9, 3.2]);
      return MC('Mass density', md`Two crystals have the same structure and nearly the same lattice constant; B's atoms are ${m} times heavier. B's mass density is about…`, `${m}× A's`,
        [[`the same as A's`, 'Same atoms per cm³, but each weighs more.'], [`${(m * m).toFixed(1)}× A's`, '$\\rho_m = NM/N_A$ is linear in $M$.'], [`1/${m} of A's`, 'Heavier atoms, denser crystal.']],
        md`$\rho_m = NM/N_A$: same $N$, $M$ × ${m}.`);
    },
  ]);

  GENS.rf_miller = () => one([
    () => {
      const P = pick([
        ['1, \\infty, \\infty', '(100)', ['(011)', '(1\\infty\\infty)', '(010)']], ['1, 1, \\infty', '(110)', ['(001)', '(111)', '(11\\infty)']],
        ['1, 1, 1', '(111)', ['(100)', '(333)', '(110)']], ['2, \\infty, \\infty', '(100)', ['(200)', '(\\tfrac12 00)', '(010)']],
        ['1, 2, \\infty', '(210)', ['(120)', '(12\\infty)', '(110)']], ['2, 1, 2', '(121)', ['(212)', '(111)', '(242)']],
        ['1, 2, 3', '(632)', ['(123)', '(321)', '(111)']], ['2, 2, 1', '(112)', ['(221)', '(111)', '(224)']],
        ['-1, \\infty, \\infty', '(\\bar100)', ['(100)', '(010)', '(\\bar1\\bar1\\bar1)']], ['3, 3, \\infty', '(110)', ['(330)', '(113)', '(111)']],
      ]);
      return MC('Miller indices', md`A plane cuts the $x$, $y$, $z$ axes at $${P[0]}$ (in units of $a$). Its Miller indices are…`, `$${P[1]}$`,
        P[2].map((x) => [`$${x}$`, /infty|tfrac/.test(x) ? 'Take reciprocals and clear fractions; $1/\\infty = 0$.' : 'Reciprocals of the intercepts, cleared to the smallest integers, in $x, y, z$ order.']),
        md`Intercepts $${P[0]}$ → reciprocals → smallest integers $${P[1]}$.`);
    },
    () => {
      const [ax, ok, bad] = pick([['z', '(110)', ['(111)', '(001)', '(101)']], ['x', '(011)', ['(100)', '(111)', '(110)']], ['y', '(101)', ['(010)', '(111)', '(110)']]]);
      return MC('Planes parallel to an axis', md`Which plane is **parallel** to the $${ax}$ axis?`, `$${ok}$`,
        bad.map((x) => [`$${x}$`, `A plane parallel to $${ax}$ never cuts it: its $${ax}$ index must be 0.`]),
        md`Parallel to an axis means intercept $\infty$ there, so index $0$.`);
    },
    () => {
      const ps = shuffle([['(100)', 1], ['(110)', 2], ['(111)', 3]]).slice(0, 2);
      const close = ps[0][1] > ps[1][1] ? ps[0] : ps[1], far = close === ps[0] ? ps[1] : ps[0];
      return MC('Plane spacing', md`In a cubic lattice, which family of planes is **more closely spaced**: $${ps[0][0]}$ or $${ps[1][0]}$?`, `$${close[0]}$`,
        [[`$${far[0]}$`, `Spacing is $a/\\sqrt{h^2 + k^2 + l^2}$: bigger indices, closer planes.`], ['they are equally spaced', 'Spacing depends on the indices.'], ['it depends on the atom size', 'It is pure geometry of the lattice.']],
        md`$d = a/\sqrt{h^2 + k^2 + l^2}$: $d_{100} = a$, $d_{110} = a/\sqrt2$, $d_{111} = a/\sqrt3$.`);
    },
    () => {
      const h = pick(['110', '111', '210', '120', '211']);
      const rev = h.split('').reverse().join('');
      return MC('Directions and planes', md`In a cubic crystal, which direction is perpendicular to the plane $(${h})$?`, `$[${h}]$`,
        [[`$[${rev === h ? '001' : rev}]$`, 'Same indices, same order: $[hkl] \\perp (hkl)$ in cubic crystals.'], [`$(${h})$`, 'Round brackets name a plane, not a direction.'], ['$[000]$', 'Not a direction.']],
        md`For cubic lattices the direction $[hkl]$ is the normal of $(hkl)$.`);
    },
  ]);

  // =========================================================================== Topic 2: bands
  GENS.rf_gap = () => one([
    () => {
      const [g, kind] = pick([['0.17', 'semiconductor'], ['0.67', 'semiconductor'], ['1.12', 'semiconductor'], ['1.43', 'semiconductor'], ['2.3', 'semiconductor'], ['5.5', 'insulator'], ['9', 'insulator']]);
      return MC('What kind of solid?', md`A crystal's highest filled band is **completely full** and the next band starts **${g} eV** higher. At room temperature it is…`, `a ${kind}`,
        [[kind === 'insulator' ? 'a semiconductor' : 'an insulator', kind === 'insulator' ? `A ${g} eV gap is hundreds of $kT$: essentially no electrons cross.` : `A ${g} eV gap is small enough for some thermal excitation and for doping to work.`], ['a metal', 'A metal needs a partly filled band; this one is full.'], ['a superconductor', 'Not a band-filling category.']],
        kind === 'insulator' ? md`A ${g} eV gap (${g === '9' ? 'like SiO₂' : 'like diamond'}) is far too big for thermal excitation or doping to give useful conduction.` : md`Full band plus a gap of a few eV or less: a semiconductor. Heat lifts a few electrons across and doping works.`);
    },
    () => MC('What kind of solid?', md`Each atom gives one electron to a band that holds two per atom. The solid is…`, 'a metal (half-filled band)',
      [['an insulator (filled band)', 'Only a completely full band (plus a gap) insulates.'], ['a semiconductor (small gap)', 'A partly filled band conducts at any temperature.'], ['impossible to tell from this', 'Half filling decides it.']],
      md`Half-filled band: empty states right next to filled ones, so a field moves electrons easily (sodium, copper).`),
    () => {
      const m = pick([1, 2, 3, 4]), dE = (0.12 * m).toFixed(2);
      return MC('Gap and intrinsic carriers', md`Two semiconductors have the same $N_c$ and $N_v$, but B's gap is **${dE} eV larger** than A's. $n_i(B)/n_i(A)$ at 300 K is about…`, `$${pow(-m)}$`,
        [[`$${pow(-2 * m)}$`, 'Each $n_i$ goes as $e^{-E_g/2kT}$: half the gap counts. 0.12 eV of gap is one decade.'], [`$${pow(m)}$`, 'A larger gap means fewer carriers.'], ['about 1', 'The gap enters exponentially.']],
        md`$n_i \propto e^{-E_g/2kT}$; $2kT\ln10 = 0.12$ eV per decade, so ${dE} eV is ${m} decade${m > 1 ? 's' : ''}.`);
    },
    () => {
      const [g, l] = pick([['0.62', '2.0'], ['1.24', '1.0'], ['1.55', '0.80'], ['2.48', '0.50'], ['3.1', '0.40'], ['1.77', '0.70']]);
      return MC('Gap and wavelength', md`A direct-gap material has $E_g = ${g}$ eV. The light it emits has a wavelength of about…`, `${l} μm`,
        [[`${(1.24 * +g).toFixed(2)} μm`, '$\\lambda = 1.24/E_g$, not $1.24\\times E_g$.'], [`${(+l * 2).toFixed(2)} μm`, 'Check the division.'], [`${(+l / 2).toFixed(2)} μm`, 'Check the division.']],
        md`$\lambda[\mu\text{m}] = 1.24/E_g[\text{eV}] = 1.24/${g} = ${l}\,\mu$m.`);
    },
    () => {
      const metal = Math.random() < 0.5;
      return MC('Heating a solid', md`A ${metal ? 'metal' : 'pure semiconductor'} is heated from 300 K to 400 K. Its conductivity…`, metal ? 'falls: more lattice scattering' : 'rises sharply: many more carriers',
        [[metal ? 'rises: more carriers are freed' : 'falls: more lattice scattering', metal ? 'A metal’s carrier count is fixed by its partly filled band.' : 'Mobility does fall, but the carrier count grows hundreds of times.'], ['stays the same: carriers are fixed', 'Both mobility and (for semiconductors) carrier count depend on T.'], ['drops to zero above 350 K', 'Conductivity changes gradually.']],
        md`${metal ? 'Metal: fixed carriers, falling mobility.' : 'Semiconductor: $n_i \\propto e^{-E_g/2kT}$ wins over the mobility drop.'}`);
    },
    () => {
      const [a, b] = pick([['C (diamond)', 'Si'], ['Si', 'Ge'], ['GaN', 'GaAs']]);
      return MC('Bond strength and gap', md`Which has the **larger** band gap: ${a} or ${b}?`, a,
        [[b, 'Smaller, more tightly bound atoms split bonding and antibonding states further: a larger gap.'], ['they are equal', 'They differ a lot.'], ['neither has a gap', 'Both are semiconductors or insulators.']],
        md`Stronger, shorter bonds give a bigger bonding–antibonding split: C 5.5 > Si 1.12 > Ge 0.67 eV; GaN 3.4 > GaAs 1.43 eV.`);
    },
  ]);

  GENS.rf_holes = () => one([
    () => {
      const d = pick(['right', 'left']), o = d === 'right' ? 'left' : 'right';
      return MC('Who moves which way?', md`The field in a sample points to the **${d}**. Conduction electrons drift ___ and holes drift ___.`, `${o}; ${d}`,
        [[`${d}; ${d}`, 'Electrons are pushed against the field.'], [`${o}; ${o}`, 'Holes (positive) move with the field.'], [`${d}; ${o}`, 'Both reversed.']],
        md`Force $= \pm q\mathscr{E}$: electrons against $\mathscr{E}$, holes along it. Both give current along $\mathscr{E}$.`);
    },
    () => {
      const x = pick([0.05, 0.1, 0.2, 0.3]);
      const hole = Math.random() < 0.5;
      return MC('Carrier energy', hole ? md`A hole sits ${x} eV **below** $E_v$. Its kinetic energy is…` : md`An electron sits ${x} eV **above** $E_c$. Its kinetic energy is…`, `${x} eV`,
        [['0', hole ? 'Only a hole right at $E_v$ has zero kinetic energy; hole energy increases downward.' : 'Only an electron right at $E_c$ has zero kinetic energy.'], [`${(1.12 + x).toFixed(2)} eV`, 'Measure from the band edge, not across the gap.'], [`−${x} eV`, 'Kinetic energy is positive.']],
        md`${hole ? '$E_v$ is a hole’s potential energy; the distance below it is kinetic.' : '$E_c$ is an electron’s potential energy; the distance above it is kinetic.'} It will relax to the band edge in about a picosecond, giving that energy to the lattice.`);
    },
    () => MC('Full bands', md`A band is **completely full**. A field is applied. The current carried by this band is…`, 'zero: velocities stay balanced',
      [['large: it has many electrons', 'Many electrons, but for each one moving one way another moves the other way, and none can change state.'], ['small, from the fastest electrons', 'Exactly zero.'], ['carried by the band’s holes', 'A full band has no holes.']],
      md`Conduction needs empty states next to filled ones.`),
    () => MC('What is a hole?', md`The valence band is missing one electron. That band then carries current as if it held…`, 'one $+q$ particle moving with the field',
      [['one extra electron moving against it', 'An absence of an electron acts as positive charge.'], ['no current: the band is nearly full', 'One empty state lets electrons move.'], ['a positive ion drifting with the field', 'Ions are fixed; the hole moves.']],
      md`Tracking the one empty state is equivalent to tracking all the electrons: a $+q$ particle with positive mass.`),
    () => {
      const [a, b] = pick([[0.1, 0.3], [0.05, 0.2], [0.2, 0.4]]);
      return MC('Hole energy direction', md`Hole A sits ${a} eV below $E_v$, hole B ${b} eV below. Which has more energy, and which way will each move in energy?`, 'B; both float up toward $E_v$',
        [['A; both float up toward $E_v$', 'Hole energy increases downward: B, the deeper one, has more.'], ['equal; both float up toward $E_v$', 'They are at different depths.'], ['B; both sink deeper', 'Holes float up, like bubbles.']],
        md`A hole deeper in the band has more energy; it gives it to the lattice and rises to $E_v$.`);
    },
  ]);

  GENS.rf_mass = () => one([
    () => {
      const k = pick([2, 3, 4, 10]);
      return MC('Curvature and mass', md`Band A's $E(k)$ near its minimum curves **${k} times** as sharply as band B's. $m^*_A/m^*_B$ is…`, `$1/${k}$`,
        [[`$${k}$`, 'Sharper curvature means lighter: $m^* = \\hbar^2/(d^2E/dk^2)$.'], [`$1/${k * k}$`, 'Mass is inversely proportional to curvature, not its square.'], ['1', 'Curvature sets the mass.']],
        md`$m^* = \hbar^2/(d^2E/dk^2)$: ${k}× the curvature, 1/${k} the mass.`);
    },
    () => {
      const k = pick([2, 3, 5]);
      return MC('Mass and mobility', md`Same collision time, but material X's carriers have **${k}×** the effective mass of Y's. $\mu_X/\mu_Y$ is…`, `$1/${k}$`,
        [[`$${k}$`, 'Heavier carriers accelerate less.'], [`$1/${k * k}$`, '$\\mu = q\\bar t/m^*$ is linear in $1/m^*$.'], ['1', 'Mass enters $\\mu$ directly.']],
        md`$\mu = q\bar t/m^*$.`);
    },
    () => {
      const direct = Math.random() < 0.5;
      return MC('Direct or indirect?', direct ? md`A material's conduction-band minimum and valence-band maximum are **both at** $k = 0$. As a light emitter it is…` : md`A material's conduction-band minimum is at a **large** $k$, while the valence-band maximum is at $k = 0$. As a light emitter it is…`,
        direct ? 'efficient: direct gap' : 'poor: needs a phonon too',
        [[direct ? 'poor: needs a phonon' : 'efficient: direct gap', direct ? 'Same $k$: no phonon needed.' : 'Different $k$: momentum must be supplied by a phonon.'], ['unable to absorb light at all', 'Both kinds absorb above the gap.'], ['efficient only when cold', 'Temperature is not the deciding factor.']],
        md`Photons carry almost no momentum, so efficient emission needs the band extrema at the same $k$ (GaAs yes, Si no).`);
    },
    () => {
      const [ea, eb] = pick([[0.2, 0.05], [0.4, 0.1], [0.3, 0.1]]);
      const r = Math.round(ea / eb);
      return MC('Reading E–k', md`From $k = 0$ to the same $k_1$, band A rises ${ea} eV and band B rises ${eb} eV. Which carriers are lighter, and by how much?`, `A, by a factor of ${r}`,
        [[`B, by a factor of ${r}`, 'A steeper parabola means a lighter carrier.'], [`A, by a factor of ${r * r}`, '$E = \\hbar^2k^2/2m^*$: at the same $k$, $E \\propto 1/m^*$.'], ['they are equally heavy', 'Different rise at the same $k$ means different mass.']],
        md`$E = \hbar^2k^2/2m^*$: at equal $k$, $E_A/E_B = m_B^*/m_A^* = ${r}$.`);
    },
    () => MC('Why vertical transitions?', md`Why does a photon emitted or absorbed by an electron connect two states at (almost) the **same** $k$?`, 'photon momentum is ~1000× too small to matter',
      [['photons carry no energy, only momentum', 'They carry $h\\nu$.'], ['electrons can’t change $k$ in a crystal', 'Phonons and fields change it easily.'], ['the band gap forbids any other transition', 'The gap sets the energy, not the momentum.']],
      md`$k_{photon} \approx 2\pi/\lambda \sim 10^5\,\text{cm}^{-1}$ versus $\pi/a \sim 10^8\,\text{cm}^{-1}$.`),
  ]);

  // =========================================================================== Topic 3: carriers
  GENS.rf_dope = () => one([
    () => {
      const [x, g, t] = pick([['P', 'V', 'n'], ['As', 'V', 'n'], ['Sb', 'V', 'n'], ['B', 'III', 'p'], ['Al', 'III', 'p'], ['Ga', 'III', 'p'], ['In', 'III', 'p'], ['Ge', 'IV', '0'], ['C', 'IV', '0']]);
      const R = { n: 'n-type (donor)', p: 'p-type (acceptor)', 0: 'neither (group IV)' };
      return MC('Which type?', md`Silicon is doped with **${x}** (group ${g}). It becomes…`, R[t],
        Object.keys(R).filter((k) => k !== t).map((k) => [R[k], { n: 'A donor needs one more valence electron than Si (group V).', p: 'An acceptor needs one fewer (group III).', 0: `Group ${g} differs from Si’s group IV.` }[k]]).concat([['metallic (degenerate)', 'Doping at normal levels keeps it a semiconductor.']]),
        md`Group V gives a spare electron (donor), group III is one short (acceptor), group IV changes nothing.`);
    },
    () => {
      const [x, site, t, why] = pick([['Zn (group II)', 'Ga', 'acceptor', 'one electron fewer than Ga (III)'], ['Be (group II)', 'Ga', 'acceptor', 'one fewer than Ga'], ['Se (group VI)', 'As', 'donor', 'one more than As (V)'], ['Te (group VI)', 'As', 'donor', 'one more than As'], ['Si (group IV)', 'Ga', 'donor', 'one more than Ga (III)'], ['Si (group IV)', 'As', 'acceptor', 'one fewer than As (V)'], ['C (group IV)', 'As', 'acceptor', 'one fewer than As']]);
      return MC('Dopants in GaAs', md`In GaAs, **${x}** sits on a **${site}** site. It acts as…`, `an ${t}`,
        [[`a${t === 'donor' ? 'n acceptor' : ' donor'}`, `Compare with the atom it replaces: ${why}.`], ['a neutral impurity', 'Its valence differs from the atom it replaces.'], ['a deep trap only', 'It is a shallow dopant.']],
        md`It has ${why}.`);
    },
    () => {
      const k = ri(13, 18), n = Math.random() < 0.5;
      const [M, m] = n ? ['n_0', 'p_0'] : ['p_0', 'n_0'];
      return MC('Minority from majority', md`Si at 300 K ($n_i = ${NI}$) has $${M} = 10^{${k}}\,\text{cm}^{-3}$. Then $${m}$ is…`, `$${p10(2.25, 20 - k)}\\,\\text{cm}^{-3}$`,
        [[`$${pow(k)}\\,\\text{cm}^{-3}$`, 'Equal numbers only when intrinsic.'], [`$${NI}\\,\\text{cm}^{-3}$`, 'That is intrinsic; the majority suppresses the minority.'], [`$${p10(2.25, 20 - k + 1)}\\,\\text{cm}^{-3}$`, 'Off by ten.'], [`$${p10(1.5, 10 - k)}\\,\\text{cm}^{-3}$`, 'Square $n_i$: $n_i^2 = 2.25\\times10^{20}$.']],
        md`$${m} = n_i^2/${M} = 2.25\times10^{20}/10^{${k}}$.`);
    },
    () => {
      const m = pick([2, 10, 100]);
      return MC('Doping up, minority down', md`$N_d$ in n-type Si is raised **${m}×** (all ionized, $N_d \gg n_i$). $p_0$ changes by…`, `÷${m}`,
        [[`×${m}`, 'More electrons recombine with holes faster.'], [`÷${m * m}`, '$p_0 = n_i^2/N_d$, linear in $1/N_d$.'], ['nothing', 'Holes depend on $n_0$ through $n_0p_0 = n_i^2$.']],
        md`$p_0 = n_i^2/N_d$.`);
    },
    () => {
      const k = ri(14, 17), c = pick(['eq', 'eq', 'more', 'less']);
      const pEq = 2.25e20 / Math.pow(10, k);
      const pv = c === 'eq' ? pEq : c === 'more' ? pEq * Math.pow(10, ri(3, 6)) : pEq / Math.pow(10, ri(2, 3));
      const R = { eq: 'equilibrium ($np = n_i^2$)', more: 'excess carriers ($np > n_i^2$)', less: 'carriers removed ($np < n_i^2$)' };
      return MC('Equilibrium or not?', md`A Si sample at 300 K has $n = 10^{${k}}$ and $p = ${S.f(pv, 2)}\,\text{cm}^{-3}$. What can you say?`, R[c],
        Object.keys(R).filter((x) => x !== c).map((x) => [R[x], 'Multiply: compare $np$ with $n_i^2 = 2.25\\times10^{20}$.']).concat([['impossible ($np \\ne n_i^2$)', 'Any $n$ and $p$ can exist out of equilibrium.']]),
        md`$np = ${S.f(Math.pow(10, k) * pv, 2)}$ against $n_i^2 = 2.25\times10^{20}$.`);
    },
  ]);

  GENS.rf_ionize = () => one([
    () => MC('Is doped Si charged?', md`A piece of n-type silicon sits on the bench. Its overall charge is…`, 'zero: donor ions balance the electrons',
      [['negative: it has extra electrons', 'Extra relative to the bonds, not to the nuclei.'], ['positive: donors are positive', 'Their charge is balanced by the electrons they gave.'], ['negative, but only when it is warm', 'Neutral at every temperature.']],
      md`Doping adds neutral atoms; ionization only separates charge locally.`),
    () => MC('Donor ionization', md`A phosphorus donor ionizes at room temperature. What is created?`, 'a free electron and a fixed P⁺ ion',
      [['an electron–hole pair, like light makes', 'Pairs come from breaking Si–Si bonds, not from donors.'], ['a free hole and a fixed P⁻ ion', 'Donors give electrons; P becomes P⁺.'], ['a free electron and a mobile P⁺ ion', 'The ion is locked in the lattice.']],
      md`That is why $n_0 \gg p_0$ in n-type material.`),
    () => {
      const [ch, f] = pick([['$\\epsilon_r$ were half as large', '×4'], ['$\\epsilon_r$ were twice as large', '÷4'], ['the effective mass were twice as large', '×2'], ['the effective mass were half as large', '÷2']]);
      return MC('Hydrogen model', md`Donor binding energy goes as $13.6\,\text{eV}\times(m^*/m_0)/\epsilon_r^2$. If ${ch}, the binding energy would change by…`, f,
        [[f.includes('4') ? (f[0] === '×' ? '×2' : '÷2') : (f[0] === '×' ? '×4' : '÷4'), 'Mass enters linearly, $\\epsilon_r$ squared.'], [f[0] === '×' ? f.replace('×', '÷') : f.replace('÷', '×'), 'Wrong direction.'], ['nothing', 'Both matter.']],
        md`$E \propto m^*/\epsilon_r^2$.`);
    },
    () => {
      const Ed = pick([0.3, 0.4, 0.5]);
      return MC('Deep levels', md`An impurity level sits **${Ed} eV** below $E_c$ in Si. At 300 K, as a donor it is…`, `mostly un-ionized (~${Math.round(Ed / 0.0259)} kT deep)`,
        [['fully ionized, like phosphorus', 'Phosphorus is 0.045 eV ≈ 1.7 kT deep; this is far deeper.'], ['an acceptor instead, being deep', 'Depth doesn’t change donor into acceptor.'], ['ionized only under illumination', 'Light doesn’t decide donor ionization.']],
        md`$e^{-${Ed}/0.0259} \approx 10^{${-Math.round(Ed / RF.D)}}$. Deep levels act as recombination centers instead (Topic 9).`);
    },
    () => {
      const [a, b] = pick([['GaAs (1.43 eV)', 'Si (1.12 eV)'], ['Si (1.12 eV)', 'Ge (0.67 eV)'], ['GaN (3.4 eV)', 'GaAs (1.43 eV)']]);
      return MC('Gap and intrinsic carriers', md`Which has **fewer** intrinsic carriers at 300 K: ${a} or ${b}?`, a.split(' (')[0],
        [[b.split(' (')[0], 'A smaller gap gives more thermal pairs.'], ['equal', '$n_i$ depends exponentially on the gap.'], ['neither has intrinsic carriers', 'All have some at 300 K.']],
        md`$n_i \propto e^{-E_g/2kT}$: bigger gap, fewer carriers.`);
    },
  ]);

  // =========================================================================== Topic 4: Fermi level
  GENS.rf_ef = () => one([
    () => {
      let k = ri(-7, 7); if (k === 0) k = 4;
      const x = 0.06 * k, EF = 0.56 + x, n = k > 0;
      const conc = p10(1.5, 10 + Math.abs(k));
      return MC('Read the band diagram', md`Si at 300 K. $E_F$ sits where shown, ${e(Math.abs(x))} eV ${n ? 'above' : 'below'} $E_i$. What is the material, and about how many majority carriers per cm³?`,
        `${n ? 'n-type' : 'p-type'}, about $${conc}$`,
        [[`${n ? 'p-type' : 'n-type'}, about $${conc}$`, n ? '$E_F$ above $E_i$: more electrons than holes.' : '$E_F$ below $E_i$: more holes.'], [`${n ? 'n-type' : 'p-type'}, about $${p10(1.5, 10 + 2 * Math.abs(k))}$`, `0.06 eV per decade: ${Math.abs(k)} decades, not ${2 * Math.abs(k)}.`], [`${n ? 'n-type' : 'p-type'}, about $${p10(1.5, 10 + Math.max(1, Math.round(Math.abs(k) / 2)))}$`, 'Each 0.06 eV is a full decade.'], ['intrinsic', `$E_F$ is ${e(Math.abs(x))} eV from $E_i$.`]],
        md`${e(Math.abs(x))} eV ÷ 0.06 eV per decade = ${Math.abs(k)} decades above $n_i = ${NI}$: ${n ? '$n_0$' : '$p_0$'} $\approx ${conc}\,\text{cm}^{-3}$.`,
        bd({ EF, dims: [{ x: 0.78, a: 'Ei', b: 'EF', tex: `${e(Math.abs(x))}\\,\\text{eV}` }] }));
    },
    () => {
      const m = ri(2, 6), y = 0.06 * m;
      const n0 = 2.8 * Math.pow(10, 19 - m);
      return MC('Distance to the band edge', md`$E_F$ is ${e(y)} eV below $E_c$ in Si ($N_c = 2.8\times10^{19}\,\text{cm}^{-3}$). About how many conduction electrons per cm³?`, `$${p10(2.8, 19 - m)}$`,
        [[`$${p10(2.8, 19 - 2 * m)}$`, 'One decade per 0.06 eV, not two.'], [`$${p10(2.8, 19 - m + 1)}$`, 'Count the decades again.'], ['$2.8\\times10^{19}$', 'Only if $E_F$ were at $E_c$.'], [`$${p10(2.8, 19 + m)}$`, 'Farther from $E_c$ means fewer electrons.']],
        md`$n_0 = N_ce^{-(E_c - E_F)/kT}$: ${e(y)} eV is ${m} decades below $N_c$, so $n_0 \approx ${S.f(n0, 2)}$.`,
        bd({ EF: 1.12 - y, Ei: undefined, dims: [{ x: 0.78, a: 'EF', b: 'Ec', tex: `${e(y)}\\,\\text{eV}` }] }));
    },
    () => {
      const m = ri(1, 5), d = e(0.06 * m), up = Math.random() < 0.5;
      return MC('Comparing two samples', md`Same material and temperature. Sample A's $E_F$ is ${d} eV **${up ? 'higher' : 'lower'}** than sample B's. Then $n_A/n_B$ and $p_A/p_B$ are…`,
        up ? `$${pow(m)}$ and $${pow(-m)}$` : `$${pow(-m)}$ and $${pow(m)}$`,
        [[up ? `$${pow(-m)}$ and $${pow(m)}$` : `$${pow(m)}$ and $${pow(-m)}$`, 'A higher $E_F$ means more electrons and fewer holes.'], [`$${pow(m)}$ and $${pow(m)}$`, 'Electrons and holes move in opposite directions.'], [`$${pow(2 * m)}$ and $${pow(-2 * m)}$`, 'One decade per 0.06 eV.']],
        md`${d} eV ÷ 0.06 = ${m} decade${m > 1 ? 's' : ''}; the product $np$ is unchanged.`);
    },
    () => {
      const k = ri(14, 18), n = Math.random() < 0.5;
      const x = (k - Math.log10(1.5e10)) * RF.D;
      const r = e(x);
      return MC('Where is E_F?', md`Si at 300 K is doped ${n ? `$N_d$` : `$N_a$`} $= 10^{${k}}\,\text{cm}^{-3}$. Where is $E_F$?`, `${r} eV ${n ? 'above' : 'below'} $E_i$`,
        [[`${r} eV ${n ? 'below' : 'above'} $E_i$`, n ? 'Donors push $E_F$ up toward $E_c$.' : 'Acceptors pull $E_F$ toward $E_v$.'], [`${e(x + 0.12)} eV ${n ? 'above' : 'below'} $E_i$`, 'Count decades from $n_i = 1.5\\times10^{10}$, 0.06 eV each.'], [`${e(Math.max(0.06, x - 0.12))} eV ${n ? 'above' : 'below'} $E_i$`, 'Count decades from $n_i$.'], ['at $E_i$', 'That is intrinsic.']],
        md`$\log_{10}(10^{${k}}/1.5\times10^{10}) = ${(k - Math.log10(1.5e10)).toFixed(2)}$ decades × 0.0596 eV = ${r} eV.`);
    },
    () => {
      const m = ri(1, 4), d = e(0.06 * m), dir = pick(['E_c', 'E_v']);
      const nUp = dir === 'E_c';
      return MC('Moving the Fermi level', md`$E_F$ moves ${d} eV toward $${dir}$. What happens?`, `$n_0$ ${nUp ? '×' : '÷'}$${pow(m)}$, $p_0$ ${nUp ? '÷' : '×'}$${pow(m)}$`,
        [[`$n_0$ ${nUp ? '×' : '÷'}$${pow(m)}$, $p_0$ unchanged`, 'Holes respond too, in the opposite direction.'], [`$n_0$ ${nUp ? '×' : '÷'}$${pow(m)}$, $p_0$ ${nUp ? '×' : '÷'}$${pow(m)}$`, 'They move oppositely; the product is fixed.'], [`$n_0$ ${nUp ? '×' : '÷'}$${pow(2 * m)}$, $p_0$ ${nUp ? '÷' : '×'}$${pow(2 * m)}$`, 'One decade per 0.06 eV.']],
        md`One decade per 0.06 eV for each carrier, in opposite directions.`);
    },
    () => {
      const k = ri(1, 6), n = Math.random() < 0.5;
      return MC('Concentration to E_F', md`A Si sample has ${n ? '$n_0$' : '$p_0$'} $= ${p10(1.5, 10 + k)}\,\text{cm}^{-3}$. Where is $E_F$?`, `${e(0.06 * k)} eV ${n ? 'above' : 'below'} $E_i$`,
        [[`${e(0.06 * k)} eV ${n ? 'below' : 'above'} $E_i$`, 'Majority electrons put $E_F$ above $E_i$; majority holes below.'], [`${e(0.12 * k)} eV ${n ? 'above' : 'below'} $E_i$`, 'One decade is 0.06 eV.'], [`${e(0.06 * k)} eV ${n ? 'below $E_c$' : 'above $E_v$'}`, 'Counting from $n_i$ means measuring from $E_i$.']],
        md`${k} decade${k > 1 ? 's' : ''} above $n_i$ → ${k} × 0.06 eV from $E_i$.`);
    },
    () => {
      const near = pick([0.02, 0.04, 0.05]);
      return MC('When the shortcut fails', md`Heavy doping puts $E_F$ only ${near} eV below $E_c$. Using $n_0 = N_ce^{-(E_c - E_F)/kT}$ here is…`, 'unreliable: (nearly) degenerate',
        [['exact, as for any doped sample', 'The Boltzmann form assumes $E_c - E_F \\gtrsim 3kT \\approx 0.08$ eV.'], ['fine, since $E_F$ is still below $E_c$', 'Below is not enough; it must be several $kT$ below.'], ['wrong only for the hole formula', 'It is the electrons’ formula that fails here.']],
        md`$3kT = 0.078$ eV; ${near} eV is closer than that.`);
    },
  ]);

  GENS.rf_fermi = () => one([
    () => {
      const m = pick([-3, -2, -1, 1, 2, 3]);
      const fv = 1 / (1 + Math.exp(m)), fx = (v) => v.toFixed(2);
      return MC('Occupation probability', md`A state is ${e(Math.abs(m) * 0.026)} eV (${Math.abs(m)}$kT$) ${m > 0 ? 'above' : 'below'} $E_F$. Probability it is occupied?`, fx(fv),
        [[fx(1 - fv), 'That is the probability it is empty.'], ['0.50', 'Only exactly at $E_F$.'], [fx(m > 0 ? Math.exp(-m) / 2 : 1 - Math.exp(m) / 2), 'Use $f = 1/(1 + e^{(E - E_F)/kT})$.'], [m > 0 ? '1.00' : '0.00', 'The step is smeared over a few $kT$.']],
        md`$f = 1/(1 + e^{${m}}) = ${fx(fv)}$.`);
    },
    () => {
      const v = pick([0.1, 0.2, 0.3, 0.05]);
      return MC('Symmetry', md`A state $\Delta$ above $E_F$ has $f = ${v}$. What is $f$ for the state $\Delta$ **below** $E_F$?`, String(1 - v),
        [[String(v), 'Below $E_F$ states are more likely full, not equally.'], ['0.5', 'Only at $E_F$.'], ['1', 'Close, but not exactly: $f(E_F - \\Delta) = 1 - f(E_F + \\Delta)$.']],
        md`$f(E_F - \Delta) = 1 - f(E_F + \Delta) = ${1 - v}$.`);
    },
    () => {
      const m = pick([2, 3, 4, 5]), d = e(0.06 * m);
      return MC('Boltzmann tail', md`A state is ${d} eV above $E_F$ at 300 K. Its occupation probability is about…`, `$${pow(-m)}$`,
        [[`$${pow(-2 * m)}$`, 'One decade per 0.06 eV.'], ['$0.5$', 'That is at $E_F$.'], [`$${d}$`, 'Probability is not the energy.']],
        md`$f \approx e^{-${d}/0.0259} = 10^{-${m}}$: one decade per 0.06 eV.`);
    },
    () => {
      const above = Math.random() < 0.5;
      return MC('Heating and f(E)', md`The temperature rises. For a state 0.1 eV ${above ? 'above' : 'below'} $E_F$ (fixed), the occupation probability…`, above ? 'rises: the tail spreads upward' : 'falls: some electrons are lifted out',
        [[above ? 'falls: electrons settle lower' : 'rises: more electrons settle in', 'Heating smears the step in both directions.'], ['stays the same: $E_F$ is fixed', 'Only $f(E_F) = \\tfrac12$ is fixed.'], [above ? 'jumps to 1 at high enough T' : 'drops to 0 at high enough T', 'It tends to ½ as $kT$ grows, never past it.']],
        md`Higher $kT$ widens the transition around $E_F$.`);
    },
    () => MC('T = 0', md`At $T = 0$ K, the probability that a state just **above** $E_F$ is occupied is…`, '0',
      [['1/2', 'Only at $E_F$ itself.'], ['1', 'That is below $E_F$.'], ['$e^{-1}$', 'There is no tail at 0 K.']],
      md`At 0 K, $f$ is a step: full below $E_F$, empty above.`),
    () => MC('What is E_F?', md`$E_F$ sits in the band gap of a semiconductor, where there are no states. What does it mean?`, 'the energy where a state would be half full',
      [['it is where the electrons are', 'There are no states at $E_F$ in the gap.'], ['it is the top of the valence band', 'That is $E_v$.'], ['it marks the dopant energy levels', 'Dopant levels are separate.']],
      md`$E_F$ is a statistical level: its distance to each band edge sets $n_0$ and $p_0$.`),
  ]);

  // =========================================================================== lesson wiring
  Object.assign(RF.topics, {
    't1-crystal': [
      { gen: 'rf_cells', title: 'Counting atoms', rule: md`Corner ⅛, edge ¼, face ½, inside 1; sc 1, bcc 2, fcc 4, diamond 8; density $\propto 1/a^3$; Si has $5\times10^{22}$ atoms/cm³.` },
      { gen: 'rf_miller', title: 'Planes and directions', rule: md`Intercepts → reciprocals → smallest integers; parallel to an axis = index 0; $d = a/\sqrt{h^2 + k^2 + l^2}$; $[hkl] \perp (hkl)$ in cubic.` },
    ],
    't2-bands': [
      { gen: 'rf_gap', title: 'Bands and gaps', rule: md`Partly filled band = metal; full band + gap = semiconductor or insulator; $n_i$ drops a decade per 0.12 eV of gap; $\lambda[\mu\text{m}] = 1.24/E_g$.` },
      { gen: 'rf_holes', title: 'Electrons and holes', rule: md`Electrons drift against $\mathscr{E}$, holes with it; kinetic energy = distance from the band edge (up for electrons, down for holes); a full band carries no current.` },
      { gen: 'rf_mass', title: 'Effective mass, direct and indirect', rule: md`$m^* \propto 1/\text{curvature}$; $\mu \propto 1/m^*$; same $k$ at both extrema = direct gap = good light emitter.` },
    ],
    't3-carriers': [
      { gen: 'rf_dope', title: 'Doping and the minority carriers', rule: md`Group V donates, III accepts; $n_0p_0 = n_i^2 = 2.25\times10^{20}$; ×10 majority = ÷10 minority; $np > n_i^2$ means excess carriers.` },
      { gen: 'rf_ionize', title: 'Ionization and neutrality', rule: md`Ionized donor = free electron + fixed ion, no hole; samples stay neutral; binding $\propto m^*/\epsilon_r^2$; deep levels don't ionize.` },
    ],
    't4-fermi': [
      { gen: 'rf_ef', title: 'Reading the Fermi level', rule: md`**60 meV per decade.** $E_F$ above $E_i$ → n-type; each 0.06 eV is ×10 from $n_i = 1.5\times10^{10}$; moving $E_F$ trades $n$ for $p$, product fixed.` },
      { gen: 'rf_fermi', title: 'The Fermi function', rule: md`$f(E_F) = \tfrac12$; $f(E_F + \Delta) = 1 - f(E_F - \Delta)$; above a few $kT$, one decade per 0.06 eV; at 0 K a step.` },
    ],
  });

  Object.assign(RF.why, {
    't1-crystal': md`Every chip you have ever used is carved from one silicon crystal so perfect that its atoms line up for centimeters. Knowing the crystal lets you count atoms, and that count shows how absurdly little doping it takes to control everything (one atom in millions). On the exam these are quick, sure points: atoms per cell, densities, Miller indices.`,
    't2-bands': md`Why is copper a conductor, glass an insulator and silicon in between? Why do LEDs exist in GaAs but not in Si? One picture answers all of it: energy bands. Everything later in the course, from carriers to the Fermi level to light, is drawn on this picture, so it pays to make it second nature now.`,
    't3-carriers': md`The trick that built the electronics industry: add one phosphorus atom per million silicon atoms and the conductivity jumps a millionfold. This topic shows why, and gives you the rule $n_0p_0 = n_i^2$ that you will use in nearly every problem on the exam.`,
    't4-fermi': md`The Fermi level is the most useful single idea in this course. Once you can read it off a band diagram you know the carrier concentrations at a glance: 60 meV per factor of ten. Exam questions hide in it constantly, so drill it until it's reflex.`,
  });
})();

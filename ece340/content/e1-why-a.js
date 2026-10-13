/* The intuition layer for Exam 1, topics 1–4. For each lesson: WHY[id].build is a step-by-step build-up from the
   physics, with predict-first questions along the way (e1-tools.js puts it at the start of the lesson), and
   WHY[id].qs is a set of intuition problems (placed after the worked example). Topics 5–12: e1-why-b.js, e1-why-c.js. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const WHY = (window.WHY = window.WHY || {});

  // one atomic level splitting into 2, 4, 8 levels, then a band
  function splitFig() {
    const f = PF.fig({ alt: 'one atomic level splits into 2, 4 and 8 levels as atoms are brought together, and into a continuous band for N atoms' });
    const mid = 70;
    for (const [x, n, w] of [[40, 1, 0], [105, 2, 22], [170, 4, 34], [235, 8, 40]]) {
      for (let i = 0; i < n; i++) { const y = n === 1 ? mid : mid - w + (2 * w * i) / (n - 1); f.line(x - 20, y, x + 20, y, { cls: 'thick' }); }
      f.text(x, 126, n === 1 ? '1 atom' : `${n} atoms`, 't', 'small');
    }
    f.rect(280, mid - 44, 44, 88, { cls: 'shade' });
    for (let i = 0; i <= 22; i++) f.line(280, mid - 44 + i * 4, 324, mid - 44 + i * 4, { cls: 'thin' });
    f.text(302, 126, 'N atoms', 't', 'small');
    f.arrow(6, 118, 6, 16, { hs: 5 }); f.label(12, 16, 'E', 'l', 'small');
    return f.svg();
  }

  // a nearly full row of valence electrons: electrons hop right, the empty state moves left (along the field)
  function holeFig() {
    const f = PF.fig({ alt: 'three snapshots of a nearly full row of valence electrons: each time a neighbor hops right into the empty state, the empty state moves one place left' });
    const x0 = 50, dx = 28;
    [0, 1, 2].forEach((r) => {
      const y = 28 + r * 44, e = 6 - r;
      f.label(x0 - 20, y, `t_${r + 1}`, 'r', 'small');
      for (let i = 0; i < 9; i++) { const x = x0 + i * dx; if (i === e) f.circle(x, y, 6, { cls: 'bgfill' }); else f.dot(x, y, 6); }
      if (r < 2) f.pl([[x0 + (e - 1) * dx, y - 9], [x0 + (e - 0.5) * dx, y - 18], [x0 + e * dx - 2, y - 9]], { arrow: 'end', hs: 4 });
    });
    const y = 28 + 3 * 44 - 10;
    f.arrow(x0 + 8 * dx, y, x0 + 5 * dx, y, { hs: 6 }); f.label(x0 + 6.5 * dx, y - 5, '\\mathscr{E}', 'b', 'small');
    return f.svg();
  }

  // the bond picture: 'pair' (a broken bond), 'donor' (P), 'acceptor' (B)
  function bondFig(kind) {
    const f = PF.fig({ alt: { pair: 'silicon bonds with one broken: a free electron and an empty bond, the hole', donor: 'a phosphorus atom among silicon atoms: its fifth electron circles it loosely', acceptor: 'a boron atom among silicon atoms: one of its bonds is missing an electron' }[kind] });
    const s = 60, o = 34, at = (i, j) => [o + i * s, o + j * s];
    const pair = (a, b, hole) => {
      const ux = (b[0] - a[0]) / s, uy = (b[1] - a[1]) / s, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      f.line(a[0] + 13 * ux, a[1] + 13 * uy, b[0] - 13 * ux, b[1] - 13 * uy, { cls: 'dim' });
      [-1, 1].forEach((k) => { const x = mx + k * 7 * ux, y = my + k * 7 * uy; if (hole && k === 1) f.circle(x, y, 3.8, { cls: 'bgfill' }); else f.dot(x, y, 3); });
    };
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i < 2) pair(at(i, j), at(i + 1, j), kind !== 'donor' && i === 1 && j === 1);
        if (j < 2) pair(at(i, j), at(i, j + 1), false);
      }
    }
    for (let k = 0; k < 3; k++) {
      [[at(0, k), -1, 0], [at(2, k), 1, 0], [at(k, 0), 0, -1], [at(k, 2), 0, 1]].forEach(([p, ux, uy]) => f.line(p[0] + ux * 13, p[1] + uy * 13, p[0] + ux * 30, p[1] + uy * 30, { cls: 'dim' }));
    }
    if (kind === 'donor') { f.circle(o + s, o + s, 42, { cls: 'dash' }); f.dot(o + s + 29.7, o + s - 29.7, 3.4); }
    if (kind === 'pair') { f.dot(o + 1.5 * s, o + 1.5 * s, 3.4); f.label(o + 1.5 * s + 6, o + 1.5 * s, 'e^-', 'l', 'small'); }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const [x, y] = at(i, j), mid = i === 1 && j === 1;
        f.circle(x, y, 13, { cls: 'bgfill nodecl' });
        f.label(x, y, mid && kind === 'donor' ? '\\text{P}' : mid && kind === 'acceptor' ? '\\text{B}' : '\\text{Si}', 'c', 'small');
      }
    }
    return f.svg();
  }

  // log n0 and log p0 against E_F - E_i: straight lines, one decade per 60 meV
  function decadeFig() {
    const L = Math.log10(1.5e10), d = 0.0259 * Math.log(10);
    return PF.plot({
      w: 360, h: 240, x: [-0.42, 0.42], y: [3, 18], xl: 'E_F - E_i', yl: '\\log_{10}(\\text{cm}^{-3})',
      xt: [[-0.3, '-0.3'], [0, '0'], [0.3, '0.3\\,\\text{eV}']], yt: [[5, '5'], [10, '10'], [15, '15']],
      curves: [{ f: (x) => L + x / d, lab: 'n_0', labAt: 0.4, dx: 4, dy: 4 }, { f: (x) => L - x / d, lab: 'p_0', labAt: -0.4, dx: 6, dy: 4 }],
      pts: [{ x: 0.347, y: 16, lab: 'N_d = 10^{16}', anchor: 'r' }],
    });
  }

  WHY['t1-crystal'] = {
    build: [
      R(md`
        ### Start here: why the atoms line up

        Everything in this course rests on one fact: a silicon device is a **single crystal**, the same arrangement of atoms repeated perfectly for centimeters. It is worth seeing why nature does this and why engineers insist on it.

        **The bonds decide the shape.** A silicon atom has four outer (valence) electrons. It completes its outer shell by sharing one electron pair with each of four neighbors: four covalent bonds. Those bonds repel each other and spread as far apart as they can, toward the corners of a tetrahedron, $109.5^\circ$ apart. Now try to give *every* atom four neighbors at exactly those angles, with every atom seeing identical surroundings: in three dimensions the only answer is the **diamond lattice**. The crystal structure is not a fact to memorize; four tetrahedral bonds per atom force it.

        **Why engineers need a perfect crystal.** In the next topic you'll see that an electron is a wave. A wave travelling through a perfectly periodic row of atoms is *not* scattered by them: it settles into a pattern that fits the repetition and glides through. The periodic atoms only change how the electron's energy depends on its momentum (that is where bands and effective mass come from). What *does* scatter electrons is anything that breaks the periodicity: atoms vibrating with heat, impurity ions, missing atoms, grain boundaries. Every defect costs mobility, and defects with energy levels in the gap can also swallow carriers.

        - **Crystalline**: long-range order everywhere (device wafers).
        - **Polycrystalline**: many small crystals (grains); the boundaries between them scatter and trap carriers (gate lines, cheaper solar cells).
        - **Amorphous**: only short-range order; each atom still has about four neighbors, but there is no repeating pattern (thin-film transistors in displays). Much lower mobility.
      `),
      Q(md`An electron travels through a perfect, motionless silicon crystal. The silicon atoms it passes…`,
        ['do not scatter it; the periodic lattice only changes how its energy depends on momentum', 'scatter it at every atom, which is where resistance comes from', 'trap it at every atom, so it can only hop from atom to atom', 'scatter it only at the corners of each unit cell'], 0,
        [null, 'Then even a perfect crystal at 0 K would have a huge resistance. Scattering comes from imperfections and vibrations, not from the periodic atoms.', 'Free carriers in a crystal move as waves spread through it; they are not stuck on atoms.', 'Unit-cell corners are bookkeeping; nothing physical happens there.'],
        md`A wave in a perfectly periodic potential propagates without scattering. Resistance comes from **departures** from periodicity: lattice vibrations, ionized dopants, defects.`),
      R(md`
        ### Lattice plus basis: count, don't memorize

        Two separate ideas build every crystal:

        - The **lattice** is a set of points that all have identical surroundings. It is pure geometry: simple cubic, body-centered cubic (bcc), face-centered cubic (fcc).
        - The **basis** is what you place at each lattice point: one atom, or a group of atoms.

        Crystal = lattice + basis. **Diamond** is an fcc lattice with a two-atom basis: one atom on the lattice point and a second a quarter of the way along the cube's body diagonal, at $(\tfrac14, \tfrac14, \tfrac14)a$. That second atom sits exactly where a tetrahedral bond points. **Zincblende** (GaAs) is the same thing with Ga on the first site and As on the second, so every Ga is bonded to four As and vice versa.

        **Counting atoms per cell** comes from asking "how much of this atom is inside my cube?" A corner is shared by the 8 cubes that meet there, so each cube owns $\tfrac18$ of it; a face is shared by 2 cubes ($\tfrac12$); an edge by 4 ($\tfrac14$); an interior atom is all yours. An fcc cell has $8 \times \tfrac18 + 6 \times \tfrac12 = 4$ lattice points, and two atoms per point gives diamond **8 atoms per cell**. You never need to memorize the 8: it is 4 points times a 2-atom basis.
      `),
      Q(md`A corner atom of a cubic cell counts as $\tfrac18$ of an atom because…`,
        ['8 cells meet at each corner and share it equally', 'only one atom in 8 sits at a corner', 'corner atoms are smaller', 'each corner atom has 8 bonds'], 0,
        [null, 'The fraction is about one atom shared among cells, not about how many atoms are corners.', 'Atoms are the same size wherever they sit.', 'Si atoms have 4 bonds; the 1/8 is pure geometry.'],
        md`Stack cubes to fill space and 8 of them touch at every corner, so each owns one eighth of the atom there.`),
      R(md`
        ### Numbers that set the scale

        With $a = 5.43$ Å and 8 atoms per cell, silicon has
        $$N = \frac{8}{(5.43\times10^{-8}\,\text{cm})^3} = 5.0\times10^{22}\ \text{atoms/cm}^3.$$
        Every solid lands near $10^{22}$–$10^{23}\,\text{cm}^{-3}$, because atoms everywhere sit a few ångströms apart: $(3\,\text{Å})^{-3} \approx 4\times10^{22}\,\text{cm}^{-3}$.

        Compare that with the free-carrier numbers you will meet:

        - Pure Si at room temperature has $n_i = 1.5\times10^{10}$ free electrons per cm³: **one per $3\times10^{12}$ atoms.**
        - A typical doping of $10^{16}\,\text{cm}^{-3}$ is one dopant per 5 million Si atoms (0.2 parts per million), yet it multiplies the number of free electrons by almost a million.

        That is why semiconductor silicon is the purest material industry makes, and why a tiny, controlled impurity level sets everything a device does.

        Shrink the volume and the numbers get startling. A cube 100 nm on a side is $(10^{-5}\,\text{cm})^3 = 10^{-15}$ cm³; at $10^{17}\,\text{cm}^{-3}$ it holds just **100 dopant atoms**. A modern transistor channel of about $(10\,\text{nm})^3$ at $10^{18}\,\text{cm}^{-3}$ holds about **one**. Doping is then no longer a smooth concentration: exactly where each atom landed matters.
      `),
      P({
        q: md`A region of silicon $50\,\text{nm} \times 50\,\text{nm} \times 20\,\text{nm}$ is doped at $N_d = 10^{18}\,\text{cm}^{-3}$. About how many donor atoms does it hold?`,
        parts: [{ lbl: md`\text{donors}`, ans: 50, tol: { rel: 0.03 } }],
        hints: [md`Volume in cm³: $1\,\text{nm} = 10^{-7}$ cm.`],
        sol: md`$V = (5\times10^{-6})(5\times10^{-6})(2\times10^{-6}) = 5\times10^{-17}\,\text{cm}^3$, so $N_dV = 10^{18}\times5\times10^{-17} = 50$ donors.`,
      }),
      R(md`
        ### Why silicon's crystal is so open

        Hard spheres packed as tightly as possible (fcc, like copper or aluminum) fill **74%** of space. Diamond-structure silicon fills only **34%**. The bonds again: covalent bonds are **directional**, so each atom insists on exactly four neighbors at tetrahedral angles. Metallic bonding has no preferred direction, so metal atoms pack like oranges in a crate, with 12 neighbors each.

        The four nearest neighbors sit along the body diagonals at $\tfrac{\sqrt3}{4}a = 2.35$ Å: that is the Si–Si bond length. The open structure leaves large empty spaces, which is why some impurities (copper, gold, iron) slip between the atoms and diffuse quickly through silicon, and why fabrication fights such contamination so hard.
      `),
      Q(md`Silicon fills only 34% of space while fcc copper fills 74%. The main reason is that…`,
        ['silicon’s covalent bonds are directional, fixing four neighbors at tetrahedral angles', 'silicon atoms are much smaller than copper atoms', 'silicon is full of vacancies', 'silicon has a larger lattice constant'], 0,
        [null, 'Packing fraction is about arrangement, not size: equal spheres in fcc fill 74% whatever their size.', 'A good Si crystal has very few vacancies; the openness is built into the structure.', 'The lattice constant sets the scale, not the fraction of space filled.'],
        md`Four neighbors instead of twelve leaves large voids. Directional covalent bonding is the cause.`),
      R(md`
        ### Planes: why a chip maker cares which face is up

        A crystal looks different depending on how you slice it. Different planes have different densities of atoms and different numbers of broken ("dangling") bonds per surface atom. That changes real processes: how fast the surface oxidizes, how fast it etches (a KOH etch on a $(100)$ wafer stops on $\{111\}$ planes and carves V-grooves at $54.7^\circ$), and how many electronic defects the Si/SiO₂ interface has. MOSFETs are built on $(100)$ wafers because that interface has the fewest defects.

        **Why Miller indices are reciprocals.** A plane that cuts the axes at $a/h$, $a/k$, $a/l$ is labeled $(hkl)$. A plane parallel to an axis "cuts it at infinity", and $1/\infty = 0$, which is why $(100)$ is parallel to $y$ and $z$. Big indices mean the plane cuts the axes close to the origin, so the family of parallel planes is **closely spaced**: in a cubic lattice the spacing is $d = a/\sqrt{h^2 + k^2 + l^2}$. Because $(200)$ and $(100)$ have the same orientation, indices are cleared to the smallest integers.
      `),
      Q(md`A plane cuts the $x$ axis at $2a$ and is parallel to the $y$ and $z$ axes. Its Miller indices are…`,
        ['$(100)$', '$(200)$', md`$(\tfrac12\,0\,0)$`, '$(010)$'], 0,
        [null, 'Reciprocals give ½, 0, 0; cleared to the smallest integers that is (100). (200) is the same orientation, not reduced.', 'Miller indices are cleared of fractions.', 'That plane is perpendicular to y, not x.'],
        md`Intercepts $2, \infty, \infty$ → reciprocals $\tfrac12, 0, 0$ → smallest integers $(100)$: a plane parallel to the cube face.`),
    ],
    qs: [
      Q(md`A crystal keeps its structure but its lattice constant doubles. Its number of atoms per cm³…`,
        ['drops to 1/8', 'halves', 'stays the same', 'drops to 1/4'], 0,
        [null, 'Density is per volume, and volume goes as $a^3$.', '$N \\propto 1/a^3$, not $1/a$.', 'Same atoms per cell, but each cell is 8 times bigger.', 'That would be $1/a^2$: an areal density.'],
        md`$N = (\text{atoms per cell})/a^3$; doubling $a$ multiplies the cell volume by 8.`),
      Q(md`GaAs has the zincblende structure. Compared with silicon's diamond structure it has…`,
        ['the same lattice and positions; Ga and As alternate, so each atom bonds to four of the other kind', 'a simple cubic lattice with Ga at the corners and As at the center', 'four atoms per cubic cell instead of eight', 'a different number of nearest neighbors'], 0,
        [null, 'That is the CsCl structure, not zincblende.', 'Still 8 per cell: 4 Ga and 4 As.', 'Each atom still has 4 tetrahedral neighbors.'],
        md`Zincblende = diamond with the two basis sites occupied by different atoms. The tetrahedral bonding is the same.`),
      Q(md`How many nearest neighbors does each atom have in the diamond lattice?`,
        ['4', '6', '8', '12'], 0,
        [null, 'That is simple cubic.', 'That is bcc.', 'That is fcc, the close-packed case.'],
        md`Four, at the corners of a tetrahedron: one per covalent bond.`),
      Q(md`In a cubic crystal, the direction $[100]$ and the plane $(100)$ are…`,
        ['perpendicular', 'parallel', 'at 45°', 'unrelated in general'], 0,
        [null, '$[100]$ is the $x$ axis; $(100)$ is a face perpendicular to $x$.', 'No special 45° relation here.', 'In cubic crystals $[hkl] \\perp (hkl)$ always; in other systems it can fail.'],
        md`In a cubic lattice the direction $[hkl]$ is the normal to the plane $(hkl)$.`),
      Q(md`In a simple cubic lattice, which plane holds more atoms per unit area?`,
        ['$(100)$', '$(110)$', 'they are equal', 'it depends on $a$'], 0,
        [null, '$(110)$ cuts a rectangle $a \\times \\sqrt2a$ that holds the same one atom: $0.71/a^2$.', '$1/a^2$ versus $0.71/a^2$.', 'Both scale as $1/a^2$; their ratio is fixed.'],
        md`$(100)$: 4 corners × ¼ = 1 atom in $a^2$. $(110)$: 1 atom in $\sqrt2a^2$. The higher-index plane is sparser, and its planes are more closely spaced.`),
      Q(md`Which family of planes in a cubic lattice is spaced most closely?`,
        ['$(111)$', '$(110)$', '$(100)$', 'all are spaced by $a$'], 0,
        [null, '$a/\\sqrt2$ is larger than $a/\\sqrt3$.', '$(100)$ planes are $a$ apart: the widest.', 'Spacing is $a/\\sqrt{h^2 + k^2 + l^2}$.'],
        md`$d_{111} = a/\sqrt3$, $d_{110} = a/\sqrt2$, $d_{100} = a$.`),
      Q(md`Amorphous silicon has a much lower electron mobility than crystalline silicon because…`,
        ['without long-range order the electron waves scatter constantly and many states are localized', 'it has fewer atoms per cm³', 'it has no band gap', 'its atoms have fewer than four bonds on average'], 0,
        [null, 'Its density is close to crystalline Si.', 'It still has a gap (about 1.7 eV).', 'Most atoms still have four bonds; the disorder is in angles and lengths.'],
        md`Mobility needs waves that can propagate. Disorder breaks the periodicity everywhere, so carriers scatter or get stuck.`),
      P({
        q: md`Germanium has the diamond structure with $a = 5.65$ Å and molar mass $72.63$ g/mol. Find its mass density.`,
        parts: [{ lbl: md`\rho_m`, ans: 5.350, unit: 'g/cm^3' }],
        hints: [md`$N = 8/a^3$, then $\rho_m = NM/N_A$.`],
        sol: md`$N = \dfrac{8}{(5.65\times10^{-8})^3} = 4.436\times10^{22}\,\text{cm}^{-3}$; $\rho_m = \dfrac{(4.436\times10^{22})(72.63)}{6.022\times10^{23}} = 5.35$ g/cm³.`,
      }),
      Q(md`GaAs ($5.32$ g/cm³) is more than twice as dense as Si ($2.33$ g/cm³). Why?`,
        ['its atoms are much heavier, while the atom spacing is about the same', 'it has more atoms per cubic cell', 'its atoms are packed more tightly', 'its bonds are shorter'], 0,
        [null, 'Both have 8 atoms per cell.', 'Same tetrahedral structure, same packing fraction.', 'Its lattice constant (5.65 Å) is slightly larger, not smaller.'],
        md`$\rho_m = NM/N_A$: $N$ is nearly the same, but the average atomic mass is about 72 g/mol versus 28.`),
      P({
        q: md`Si is doped with $N_a = 5\times10^{17}\,\text{cm}^{-3}$ boron. About how many Si atoms are there per boron atom?`,
        parts: [{ lbl: md`\text{Si per B}`, ans: 1e5, tol: { rel: 0.03 } }],
        sol: md`$5\times10^{22}/5\times10^{17} = 10^5$: even "heavy" doping replaces only one atom in a hundred thousand.`,
      }),
      Q(md`Device wafers are single crystals rather than polycrystalline because grain boundaries…`,
        ['scatter carriers and trap them in defect states', 'make the wafer heavier', 'change the band gap of each grain', 'block the dopants from ionizing'], 0,
        [null, 'Mass has nothing to do with it.', 'Each grain is still silicon with the same gap.', 'Dopants still ionize inside the grains.'],
        md`Boundaries break the periodicity (scattering) and leave dangling bonds that create states in the gap (trapping and recombination).`),
      Q(md`MOSFETs are made on $(100)$ wafers mainly because…`,
        ['the Si/SiO₂ interface on (100) has the fewest electronic defects', '(100) has the most atoms per area', '(100) oxidizes fastest', 'only (100) wafers can be doped'], 0,
        [null, 'The point is the interface quality, which depends on dangling bonds per area.', 'Oxidation rate is not the reason; (111) actually oxidizes faster.', 'Any orientation can be doped.'],
        md`Fewer dangling bonds per area at the (100) surface means fewer interface traps under the gate.`),
    ],
  };

  WHY['t2-bands'] = {
    build: [
      R(md`
        ### Start here: why an atom's energies come in steps

        An electron is a wave, with wavelength $\lambda = h/p$. Confine a wave and only patterns that fit survive, like the notes a guitar string can play: a whole number of half-wavelengths must fit between the ends. Fewer allowed wavelengths means fewer allowed momenta, and so only certain **energies**. For a box of width $L$:
        $$E_n = \frac{n^2h^2}{8mL^2},\qquad n = 1, 2, 3, \ldots$$
        Squeeze the box and the levels rise and spread apart ($\propto 1/L^2$).

        An atom is a box made by the nucleus's pull. Its electrons sit in discrete levels: 1s, 2s, 2p, 3s, 3p… Silicon has 14 electrons: $1s^2\,2s^2\,2p^6$ are deep, tightly held **core** electrons that never take part in anything here, and $3s^2\,3p^2$ are the **4 valence electrons** that do all the chemistry and all the electronics.
      `),
      Q(md`An electron is confined to a box half as wide. Its lowest allowed energy…`,
        ['rises 4×', 'rises 2×', 'halves', 'is unchanged'], 0,
        [null, '$E \\propto 1/L^2$, not $1/L$.', 'Tighter confinement raises the energy: shorter wavelength, larger momentum.', 'The allowed wavelengths depend on the box size.'],
        md`$E_1 = h^2/8mL^2$: halve $L$ and $E_1$ quadruples.`),
      RF(md`
        ### Two atoms: one level becomes two

        Bring two identical atoms close. An electron's wave on one atom now leaks onto the other, so the two atoms' levels are **coupled**. Two identical coupled resonators never keep a single shared frequency: two pendulums joined by a spring swing either together or opposite, at two different frequencies. Electron waves do the same:

        - **In phase** (bonding): the waves add up between the nuclei, where the electron feels both pulls. Lower energy.
        - **Out of phase** (antibonding): the waves cancel between the nuclei. Higher energy.

        The closer the atoms, the stronger the coupling and the bigger the split. A **covalent bond** is exactly this: two electrons (spin up and down) sitting in the lower, bonding combination, lowering the total energy.

        States are never created or destroyed by bringing atoms together; they only shift. Two atoms with one level each give two levels. Four give four. **N** give **N**:

        [[fig:split]]
      `, { split: { svg: splitFig(), cap: 'One level splits into as many levels as there are atoms. With $10^{22}$ atoms they merge into a band.' } }),
      Q(md`Two identical atoms are pushed closer together. The energy split between their bonding and antibonding levels…`,
        ['grows, because the waves overlap more', 'shrinks', 'stays fixed: it is a property of each atom', 'disappears'], 0,
        [null, 'Closer means stronger coupling, not weaker.', 'The split exists only because the atoms interact, and it depends on how strongly.', 'It vanishes only when the atoms are far apart.'],
        md`More overlap, more coupling, bigger split. In a crystal the same thing makes bands wider when atoms are closer.`),
      R(md`
        ### N atoms: a band, and why silicon's is exactly full

        A crystal has $5\times10^{22}$ atoms per cm³. Each atomic level splits into that many levels spread over a few eV, so neighbors are about $10^{-22}$ eV apart: a continuous **band**. Each state holds one electron (counting spin), the **Pauli exclusion principle**, so electrons fill a band from the bottom up, like water poured into a container.

        In silicon the 3s and 3p levels (8 states per atom, counting spin) mix at the crystal's spacing and split into **two bands of $4N$ states each**:

        - the lower band is made of **bonding** combinations: the **valence band**;
        - the upper band is made of **antibonding** combinations: the **conduction band**.

        Silicon brings 4 valence electrons per atom, $4N$ in all: exactly enough to fill the valence band and leave the conduction band empty. Between them is the gap $E_g = 1.12$ eV, the distance from the top bonding state to the bottom antibonding state.

        **Bond picture = band picture.** An electron in the valence band is an electron in a Si–Si bond. Lifting one across the gap **breaks a bond**: the electron is free to roam (conduction band) and the bond is left with a vacancy (a hole in the valence band). So $E_g$ is the cost of breaking one bond.
      `),
      Q(md`Imagine silicon's bands unchanged but only 3 valence electrons per atom. The material would be…`,
        ['a metal: the valence band would be only ¾ full', 'an insulator with a bigger gap', 'a semiconductor with more holes than electrons', 'unchanged'], 0,
        [null, 'The gap comes from the bands; it is the filling that changes.', 'A band with ¼ of its states empty conducts like a metal, not like a doped semiconductor.', 'Filling decides metal versus semiconductor.'],
        md`Conduction needs a partly filled band. $3N$ electrons in $4N$ states leaves the band partly filled: metallic. (Aluminum, with 3 electrons, is a metal.)`),
      R(md`
        ### Why a full band carries no current

        Current is the sum of every electron's velocity times its charge. In any band, for each state moving one way there is a state moving the other way with the same speed (crystal momentum $+k$ and $-k$).

        - **Full band**: every pair is occupied, so the velocities cancel: zero current. Apply a field and try to push electrons toward $+k$: every state is already taken, so the distribution cannot change. Still zero.
        - **Empty band**: no electrons, no current.
        - **Partly filled band**: a field shifts the electrons slightly toward one side, so more move one way than the other: current.

        A parking garage helps. A completely full level: no car can move. A completely empty one: no cars to move. Now take a few cars from the full lower level up to the empty upper level. Both levels have traffic: the upper one through its few cars (electrons), the lower one through its few empty spaces (holes).
      `),
      Q(md`A field is applied to pure silicon at $T = 0$ K (valence band full, conduction band empty). The current is…`,
        ['zero: a full band and an empty band cannot carry current', 'small, carried by valence electrons', 'large, because the field is strong', 'carried by holes'], 0,
        [null, 'Full means every $+k$ state is paired with a $-k$ state; the field cannot unbalance them.', 'Current does not depend on the field alone; there must be carriers that can respond.', 'At 0 K there are no holes.'],
        md`At 0 K silicon is a perfect insulator. Conduction needs empty states next to filled ones.`),
      RF(md`
        ### Holes: track the few empty states, not $10^{23}$ full ones

        When the valence band is missing a few electrons, it is far easier to follow the few **empty** states than all the electrons. The empty state behaves exactly like a particle, the **hole**:

        - **Charge $+q$.** The atoms around a missing electron have one positive charge left uncancelled.
        - **It moves with the field.** A neighboring electron hops into the empty state (pushed against the field), which moves the empty state the other way: along the field. A bubble in water rises because water falls around it.
        - **Positive mass.** Near the top of the valence band $E(k)$ curves downward, so an electron there has a negative effective mass; the missing electron then behaves as a positive charge with positive mass.
        - **Its energy increases downward.** Making a hole deeper in the band means removing an electron from a lower energy, which costs more. So holes float up to $E_v$, just as electrons sink to $E_c$.

        [[fig:hole]]
      `, { hole: { svg: holeFig(), cap: 'Electrons hop right, one at a time, into the empty state; the empty state (the hole) moves left, along $\\mathscr{E}$.' } }),
      Q(md`The field in a sample points to the **right**. Electrons in a nearly full valence band hop…`,
        ['left, so the hole moves right', 'right, so the hole moves right too', 'left, so the hole moves left', 'nowhere: the band is nearly full'], 0,
        [null, 'Electrons are pushed against the field (left), not along it.', 'Each hop of an electron to the left moves the empty state one place to the right.', 'Nearly full is not full: the empty states let electrons move.'],
        md`Force on an electron is $-q\mathscr{E}$: to the left. Each hop leftward moves the vacancy rightward, along $\mathscr{E}$, exactly as a $+q$ particle would move.`),
      R(md`
        ### Effective mass: the crystal folded into one number

        A free electron has $E = \hbar^2k^2/2m_0$: a parabola whose **curvature** is set by the mass. Near the bottom of the conduction band, $E(k)$ is also roughly a parabola, but with a different curvature, because the electron constantly interacts with the periodic atoms. Push it with an outside force $F$ and it accelerates as if its mass were
        $$m^* = \frac{\hbar^2}{d^2E/dk^2}.$$
        All the complicated forces from the lattice are folded into $m^*$.

        - **Sharp curvature → small $m^*$** → the electron responds strongly → high mobility. GaAs electrons have $m^* = 0.067\,m_0$ and $\mu_n \approx 8500\,\text{cm}^2/\text{V·s}$; that is why fast transistors use GaAs and InP.
        - **Flat band → large $m^*$.** A flat band comes from weak coupling between atoms: the electron hops reluctantly from atom to atom, so the band is narrow and the carrier is sluggish.
      `),
      Q(md`Two conduction bands have their minimum at the same energy; band A is sharply curved and band B is flat. Electrons in A have…`,
        ['a smaller effective mass and higher mobility', 'a larger effective mass', 'the same mass, since the minimum is the same', 'negative mass'], 0,
        [null, 'Mass is inversely proportional to curvature.', 'The minimum sets the energy, the curvature sets the mass.', 'Mass is negative only where the band curves downward.'],
        md`$m^* = \hbar^2/(d^2E/dk^2)$: more curvature, less mass, faster response to a field.`),
      R(md`
        ### Direct and indirect gaps: momentum must balance too

        For an electron to drop from the conduction band into a hole and emit a photon, **energy** must balance ($h\nu \approx E_g$) and so must **momentum**. A photon carries very little: for $\lambda \approx 1\,\mu$m, $k = 2\pi/\lambda \approx 6\times10^4\,\text{cm}^{-1}$, while electron crystal momenta range up to $\pi/a \approx 6\times10^7\,\text{cm}^{-1}$, a thousand times more. So a photon can only connect states at (almost) the **same** $k$: vertical transitions on the $E$–$k$ diagram.

        - **GaAs (direct)**: the conduction-band minimum and valence-band maximum are both at $k = 0$. Electrons drop straight down and emit light efficiently: LEDs and lasers. It also absorbs light strongly just above its gap.
        - **Si (indirect)**: the conduction-band minimum is far from $k = 0$. Emitting a photon needs a **phonon** to carry away the momentum difference at the same moment: a rare three-body event. Electrons usually recombine through defects instead and release heat. Absorption near the gap also needs a phonon, so it is weak.
      `),
      Q(md`Silicon solar cells are typically hundreds of micrometers thick while GaAs cells can be a few micrometers. Why?`,
        ['Si absorbs weakly near its gap because the indirect transition needs a phonon', 'Si has a larger band gap', 'GaAs has more atoms per cm³', 'Si reflects most of the light'], 0,
        [null, 'Si’s gap (1.12 eV) is smaller than GaAs’s (1.43 eV).', 'Atom densities are similar.', 'Reflection is handled by coatings in both.'],
        md`Indirect absorption is a second-order process, so $\alpha$ is small near the gap and light penetrates deep. A direct-gap absorber needs only a few $\mu$m.`),
    ],
    qs: [
      Q(md`A semiconductor is squeezed under high pressure, so its atoms move closer together. Its bands…`,
        ['widen, because neighboring atoms couple more strongly', 'narrow', 'do not change: bands are set by the atoms alone', 'disappear'], 0,
        [null, 'Closer atoms overlap more, which widens the spread of levels.', 'Bands exist only because of coupling between atoms.', 'Bands need the atoms close, not far.'],
        md`Band width tracks the overlap between neighbors. (The gap also shifts, which is how pressure changes the color of some LEDs.)`),
      Q(md`Sodium has one valence electron per atom, and its outer s level forms a band of $2N$ states. Sodium is…`,
        ['a metal: the band is half full', 'an insulator', 'a semiconductor', 'a metal only when hot'], 0,
        [null, 'Half-filled bands conduct at any temperature.', 'Its band is not full, so there is no gap to cross.', 'It conducts at all temperatures.'],
        md`$N$ electrons in $2N$ states: half filled. Empty states sit right above the filled ones, so a field moves electrons easily.`),
      Q(md`Diamond (C) has the same structure as Si but a gap of $5.5$ eV instead of $1.12$ eV. The best explanation is…`,
        ['carbon atoms are smaller and bond more strongly, so bonding and antibonding states are split further apart', 'carbon has more valence electrons', 'diamond has fewer atoms per cm³', 'diamond is amorphous'], 0,
        [null, 'C and Si both have 4 valence electrons.', 'Diamond is actually denser in atoms (smaller $a$).', 'Diamond is a crystal.'],
        md`The gap is the bonding–antibonding split. Shorter, stronger bonds split them more: C (5.5) > Si (1.12) > Ge (0.67) > gray Sn (about 0).`),
      Q(md`Diamond and silicon have the same structure. Diamond is an insulator at room temperature because…`,
        ['$n_i \\propto e^{-E_g/2kT}$, and $5.5$ eV is so much larger than $kT$ that practically no electrons cross', 'it has no conduction band', 'its valence band is only half full', 'its electrons are much heavier'], 0,
        [null, 'Every solid has a conduction band; in diamond it is just very far up.', 'It is full, exactly as in Si.', 'Mass is not the main issue; the gap is.'],
        md`The ratio to Si is about $e^{-(5.5 - 1.12)/(2\times0.0259)} = e^{-85} \approx 10^{-37}$. An insulator is a semiconductor with a huge gap.`),
      Q(md`Why does a semiconductor's conductivity rise with temperature while a metal's falls?`,
        ['heat creates new carriers across the gap in a semiconductor; a metal already has all its carriers and heat only adds scattering', 'semiconductors expand more when heated', 'the band gap of a metal grows with temperature', 'heat makes holes lighter'], 0,
        [null, 'Expansion is a tiny effect.', 'Metals have no gap.', 'Effective masses barely change.'],
        md`Semiconductor: carrier number grows exponentially with $T$, which beats the slow loss of mobility. Metal: fixed carriers, mobility falls with $T$.`),
      Q(md`Which band is made of the **bonding** combinations of silicon's valence orbitals?`,
        ['the valence band', 'the conduction band', 'both equally', 'neither: bands are not related to bonds'], 0,
        [null, 'The conduction band is made of antibonding combinations, higher in energy.', 'They come from opposite combinations.', 'The band picture and the bond picture describe the same thing.'],
        md`Bonding = lower energy = valence band, filled by the $4N$ valence electrons. Antibonding = conduction band.`),
      Q(md`Two holes in the valence band: one at $E_v$, one $0.1$ eV below $E_v$. Which has more energy?`,
        ['the deeper one: hole energy increases downward', 'the one at $E_v$', 'both have the same energy', 'holes have no energy'], 0,
        [null, 'On a band diagram, upward is electron energy; hole energy is measured downward.', 'Only $E - E_v$ distinguishes them.', 'A hole deeper in the band carries kinetic energy.'],
        md`Making the deeper hole needs an electron removed from a lower energy, which costs more. It relaxes upward to $E_v$ by giving energy to the lattice.`),
      Q(md`A photon's momentum is about how large compared with the range of electron crystal momenta in a band?`,
        ['about $10^{-3}$ of it', 'about the same', 'about $10^3$ times bigger', 'exactly half'], 0,
        [null, 'Then photons could connect any two states; they cannot.', 'The opposite: photons carry very little momentum.', 'No such fixed ratio.'],
        md`$k_{photon} \approx 2\pi/\lambda \approx 6\times10^4\,\text{cm}^{-1}$ against $\pi/a \approx 6\times10^7\,\text{cm}^{-1}$. Photon transitions are vertical on an $E$–$k$ diagram.`),
      Q(md`An atomic s level (2 states per atom, counting spin) becomes a band in a crystal of $N$ atoms. The band has…`,
        ['$2N$ states', '$N$ states', '2 states', 'infinitely many states'], 0,
        [null, 'Spin doubles it.', 'Each atom contributes its states.', 'A finite crystal has a finite number of states.'],
        md`States are conserved when atoms come together: $N$ atoms × 2 states = $2N$ states.`),
      P({
        q: md`GaAs has $E_g = 1.43$ eV. What wavelength does a GaAs LED emit?`,
        parts: [{ lbl: md`\lambda`, ans: 0.867, unit: 'μm' }],
        sol: md`$\lambda = \dfrac{1.24}{1.43} = 0.867\,\mu$m, in the near infrared. Carriers relax to the band edges before they recombine, so the emission sits at the gap.`,
      }),
      Q(md`Near the top of the valence band, $E(k)$ curves **downward**. For the electrons there, this means…`,
        ['their effective mass is negative, which is why the missing electron is described as a hole with positive mass', 'their mass is very large', 'they cannot move', 'they move faster than free electrons'], 0,
        [null, 'Curvature sets the size and the sign; here the sign is negative.', 'They can move into empty states.', 'Speed depends on the slope, not on the sign of curvature.'],
        md`$m^* = \hbar^2/(d^2E/dk^2) < 0$ there. A missing negative-mass, negative-charge electron behaves as a positive-mass, positive-charge particle.`),
      Q(md`A material has very narrow (flat) bands. Its carriers are…`,
        ['heavy and low-mobility, because electrons hop between atoms only weakly', 'light and fast', 'unable to exist', 'always holes'], 0,
        [null, 'Light carriers need strongly curved bands.', 'Narrow bands still hold carriers.', 'Band shape does not decide the carrier sign.'],
        md`Narrow band = weak coupling = small curvature = large $m^*$.`),
      Q(md`In the bond picture, creating an electron–hole pair in silicon corresponds to…`,
        ['breaking one Si–Si bond: the electron leaves and the bond is one electron short', 'ionizing a donor', 'removing a silicon atom', 'an electron moving from one bond to another'], 0,
        [null, 'A donor gives an electron but no hole.', 'The atom stays; one bond loses an electron.', 'That moves a hole; it does not create a pair.'],
        md`Valence band = bonds; conduction band = free. Crossing the gap = breaking a bond, which costs $E_g$.`),
    ],
  };

  WHY['t3-carriers'] = {
    build: [
      RF(md`
        ### Start here: heat breaks a few bonds

        At absolute zero every valence electron sits in a bond and silicon is a perfect insulator. Warm it up and the atoms vibrate; energy sloshes randomly from atom to atom. The typical amount a bond holds at any moment is about $kT = 0.0259$ eV at 300 K, far less than the $1.12$ eV needed to free an electron.

        But thermal energy is **random**. The chance that a particular bond gathers an energy $E$ at some instant falls off as $e^{-E/kT}$ (the Boltzmann factor). For $E_g$: $e^{-1.12/0.0259} = e^{-43} \approx 2\times10^{-19}$. Tiny, but there are $10^{23}$ bonds per cm³, each jostled about $10^{13}$ times a second, so pairs are born all the time.

        Each event frees an electron into the conduction band and leaves an empty spot in a bond: a hole. The two wander off separately. When a wandering electron meets a hole, it drops back in: **recombination**.

        [[fig:pair]]
      `, { pair: { svg: bondFig('pair'), cap: 'Heat breaks a bond: a free electron and an empty spot in the bond (a hole).' } }),
      Q(md`The average thermal energy is only about $0.026$ eV. How does it ever break $1.12$ eV bonds?`,
        ['thermal energy is random: rare fluctuations far above the average happen, with probability about $e^{-E/kT}$, and there are enormous numbers of bonds', 'it doesn’t: all free carriers come from impurities', 'electrons absorb many small amounts and store them', 'the gap shrinks to 0.026 eV at room temperature'], 0,
        [null, 'Even perfectly pure Si has $n_i = 1.5\\times10^{10}\\,\\text{cm}^{-3}$ at 300 K.', 'Energy is not stored step by step in a bond; what matters is the chance of one large fluctuation.', 'The gap changes only slightly with temperature.'],
        md`An exponentially rare event times a gigantic number of tries gives a small but steady generation rate. Raise $T$ a little and $e^{-E_g/kT}$ grows a lot.`),
      R(md`
        ### The balance that fixes $n_0p_0$

        Two processes run constantly:

        - **Generation** at a rate $g(T)$ pairs per cm³ per second. It depends only on temperature and the material (on how hard the lattice shakes the bonds). It does **not** depend on how many free carriers already exist.
        - **Recombination** needs an electron to meet a hole. Double the electrons and encounters double; double the holes, same. So the rate is $\alpha_r\,n\,p$.

        In equilibrium the two balance:
        $$\alpha_r\,n_0p_0 = g(T) \quad\Longrightarrow\quad n_0p_0 = \frac{g(T)}{\alpha_r} = \text{const} \equiv n_i^2$$
        In pure material $n_0 = p_0$, so each equals $n_i$. Doping can't change the product, only the split between the two.

        This explains the most important rule in the course with no memorizing: **adding one kind of carrier destroys the other**. Add donors so electrons rise a million-fold, and every hole now meets electrons a million times as often. Holes are still born at the same rate $g(T)$, but they die a million times faster, so their number falls a million-fold.
      `),
      Q(md`Donors raise $n_0$ from $n_i$ to $10^6\,n_i$. The hole concentration…`,
        ['falls to $n_i/10^6$: holes are born at the same rate but recombine a million times faster', 'stays at $n_i$: donors don’t affect holes', 'rises, because the electrons push holes out of the bonds', 'falls to zero'], 0,
        [null, 'Holes are affected through recombination with the extra electrons.', 'Nothing creates extra holes here.', 'Generation never stops, so $p_0$ never reaches zero.'],
        md`$n_0p_0 = n_i^2$ fixed: $p_0 = n_i^2/n_0 = n_i/10^6$. The minority carrier is eaten by the majority.`),
      RF(md`
        ### Donors: a hydrogen atom inside silicon

        Phosphorus (group V) has 5 valence electrons. It sits on a silicon site (it is about the same size); 4 of its electrons fill the 4 bonds and the **fifth has no bond to sit in**. It is held only by the electrical pull of the $\text{P}^+$ core: a hydrogen atom, with two changes.

        1. The silicon around it polarizes and **screens** the charge: the Coulomb force is weaker by $\epsilon_r = 11.8$.
        2. The electron moves through the crystal with its **effective mass** (about $0.26\,m_0$), not $m_0$.

        Hydrogen's binding energy, $13.6$ eV, scales as $m/\epsilon_r^2$:
        $$E_{\text{bind}} \approx 13.6\,\text{eV}\times\frac{m^*/m_0}{\epsilon_r^2} = 13.6\times\frac{0.26}{11.8^2} \approx 0.025\ \text{eV}$$
        (the measured value for P in Si is $0.045$ eV). The orbit radius scales as $\epsilon_r\,m_0/m^*$: $0.53\,\text{Å}\times11.8/0.26 \approx 24$ Å, about ten bond lengths. The orbit encloses hundreds of Si atoms, which is why treating them as a smooth dielectric works.

        A binding energy close to $kT$ means that at room temperature **almost every donor is ionized**: its electron is in the conduction band and $\text{P}^+$ is left behind, locked in the lattice. On a band diagram the donor level $E_d$ sits just $0.045$ eV below $E_c$.

        [[fig:donor]]
      `, { donor: { svg: bondFig('donor'), cap: 'Phosphorus: four electrons bond, the fifth circles loosely. Drawn far too small: its orbit spans about ten bond lengths.' } }),
      Q(md`Why is a donor electron's binding energy in Si about 300 times smaller than hydrogen's?`,
        ['silicon screens the charge ($\\epsilon_r^2 \\approx 140$) and the electron’s effective mass is small', 'phosphorus has a weaker nucleus than hydrogen', 'the electron is in a bond', 'the donor electron moves at the speed of light'], 0,
        [null, 'The $\\text{P}^+$ core has net charge $+q$, like a proton.', 'The fifth electron is precisely the one with no bond.', 'Nothing relativistic here.'],
        md`$E \propto m^*/\epsilon_r^2$: a factor $0.26/139 \approx 1/530$ from hydrogen's $13.6$ eV gives about $0.025$ eV.`),
      RF(md`
        ### Acceptors: a bond one electron short

        Boron (group III) has 3 valence electrons, so one of its four bonds is incomplete. An electron from a neighboring Si–Si bond can hop in at a small energy cost (about $0.045$ eV). Then boron becomes $\text{B}^-$, fixed in the lattice, and the vacancy has moved to the neighboring bond, where it is free to wander: a hole.

        On a band diagram the acceptor level $E_a$ is an empty state just above $E_v$; a valence electron jumps into it easily, leaving a hole in the valence band.

        [[fig:acc]]

        **Donor ionization creates no hole, and acceptor ionization creates no free electron.** The other charge is a fixed ion. Only breaking a Si–Si bond makes a pair.
      `, { acc: { svg: bondFig('acceptor'), cap: 'Boron: one bond is short an electron. A neighbor’s electron hops in for about 0.045 eV and the hole wanders off.' } }),
      Q(md`When a phosphorus donor ionizes, a hole is also created. True?`,
        ['False: the electron came from the donor, and the positive charge left behind is the fixed $\\text{P}^+$ ion, which cannot move', 'True: every free electron leaves a hole', 'True, but the hole is bound to the donor', 'False: the electron goes into a bond'], 0,
        [null, 'That is true only for bond-breaking (thermal generation).', 'The ion is fixed in the lattice; it carries no current.', 'It goes into the conduction band, not a bond.'],
        md`Ionized donors give electrons with no partner holes; that is why $n_0 \gg p_0$ in n-type material.`),
      R(md`
        ### Neutral overall, even when doped

        n-type silicon is **not** negatively charged. Every free electron came from a donor that is now a fixed positive ion, so the totals balance:
        $$p_0 + N_d^+ = n_0 + N_a^-$$
        Mobile carriers can move; ions cannot. Whenever mobile carriers are pulled away from their ions (at a junction, in graded doping, at a surface), net charge appears and makes an electric field. That is the seed of Topics 7 and 11 and of every device that follows.
      `),
      Q(md`A piece of n-type silicon sits on the bench. Its overall charge is…`,
        ['zero: each free electron is balanced by a fixed donor ion', 'negative: it has extra electrons', 'positive: donors are positive', 'negative only at room temperature'], 0,
        [null, 'The electrons are "extra" relative to the bonds, not relative to the nuclei.', 'Their charge is balanced by the free electrons.', 'Neutrality holds at any temperature.'],
        md`Doping adds neutral atoms. Ionization only separates charge locally; the sample stays neutral.`),
      R(md`
        ### How much doping really changes

        Take $N_d = 10^{16}\,\text{cm}^{-3}$: $n_0 = 10^{16}$ and $p_0 = n_i^2/n_0 = 2.25\times10^4\,\text{cm}^{-3}$. Electrons outnumber holes by $4\times10^{11}$. The conductivity goes from $4.4\times10^{-6}$ S/cm (intrinsic) to $2.2$ S/cm: about **half a million times** higher, from one dopant per 5 million atoms.

        The abundant carrier is the **majority**; the scarce one is the **minority**. Don't dismiss the minority: diodes, bipolar transistors, solar cells and photodetectors all run on minority carriers, because a small disturbance changes the minority count by a huge factor (Topics 9–12).
      `),
      P({
        q: md`Si at 300 K has $n_0 = 4.5\times10^{17}\,\text{cm}^{-3}$. Find $p_0$.`,
        parts: [{ lbl: md`p_0`, ans: 500, unit: 'cm^{-3}' }],
        sol: md`$p_0 = \dfrac{n_i^2}{n_0} = \dfrac{(1.5\times10^{10})^2}{4.5\times10^{17}} = 500\,\text{cm}^{-3}$: one hole in a cube $\sim 13\,\mu$m on a side.`,
      }),
    ],
    qs: [
      Q(md`Silicon is doped with antimony (Sb, group V). It becomes…`,
        ['n-type', 'p-type', 'intrinsic', 'a metal'], 0,
        [null, 'Group III gives p-type.', 'Sb has one more valence electron than Si.', 'Doping at normal levels keeps it a semiconductor.'],
        md`Group V (P, As, Sb) donate; group III (B, Al, Ga, In) accept.`),
      Q(md`$N_d$ is doubled in an n-type sample (still $N_d \gg n_i$). $p_0$…`,
        ['halves', 'doubles', 'is unchanged', 'quarters'], 0,
        [null, '$p_0 = n_i^2/N_d$ goes the other way.', 'More electrons means faster hole recombination.', '$p_0 \\propto 1/N_d$, not $1/N_d^2$.'],
        md`$p_0 = n_i^2/n_0$ with $n_0 \approx N_d$.`),
      Q(md`Temperature rises. In the generation–recombination balance, the product $n_0p_0$…`,
        ['rises, because generation speeds up exponentially', 'stays fixed: it is always $n_i^2$ at 300 K', 'falls, because recombination speeds up', 'depends only on the doping'], 0,
        [null, '$n_i$ itself depends strongly on $T$.', 'Recombination only follows the larger carrier numbers that generation creates.', 'Doping sets the split, not the product.'],
        md`$n_0p_0 = n_i^2(T)$, which grows roughly as $T^3e^{-E_g/kT}$.`),
      P({
        q: md`Hydrogen model for a donor in GaAs: $m^* = 0.067\,m_0$, $\epsilon_r = 13.2$. Estimate the binding energy.`,
        parts: [{ lbl: md`E_{\text{bind}}`, ans: 0.00523, unit: 'eV' }],
        sol: md`$E = 13.6\times\dfrac{0.067}{13.2^2} = 5.2\times10^{-3}$ eV: far below $kT$, so GaAs donors are fully ionized even well below room temperature.`,
      }),
      Q(md`Germanium atoms (group IV) are added to silicon. They…`,
        ['add no carriers: Ge has four valence electrons, like Si', 'make it n-type', 'make it p-type', 'make it a metal'], 0,
        [null, 'A donor needs a fifth valence electron.', 'An acceptor needs one fewer.', 'They just replace Si atoms in the bonds.'],
        md`An impurity dopes only if its valence differs from the host's.`),
      Q(md`"Intrinsic" silicon accidentally contains $10^{13}\,\text{cm}^{-3}$ boron. At 300 K it is…`,
        ['p-type: $10^{13}$ is a thousand times $n_i$', 'still intrinsic: $10^{13}$ is a tiny impurity level', 'n-type', 'compensated'], 0,
        [null, 'What counts is the comparison with $n_i = 1.5\\times10^{10}$, not with the atom density.', 'Boron is an acceptor.', 'There is nothing to compensate it.'],
        md`$p_0 \approx 10^{13}$, $n_0 = 2.25\times10^7$. A part in $5\times10^9$ already dominates. That is why intrinsic Si is hard to make.`),
      Q(md`Rank the intrinsic concentrations at 300 K: Ge ($E_g = 0.67$), Si ($1.12$), GaAs ($1.43$ eV).`,
        ['Ge > Si > GaAs', 'GaAs > Si > Ge', 'all equal', 'Si > Ge > GaAs'], 0,
        [null, 'Bigger gap, fewer carriers.', '$n_i$ depends exponentially on the gap.', 'Ge has the smallest gap, so it has the most.'],
        md`$n_i \propto e^{-E_g/2kT}$: Ge $2.5\times10^{13}$, Si $1.5\times10^{10}$, GaAs $2\times10^6\,\text{cm}^{-3}$.`),
      Q(md`In the bond picture, a hole is…`,
        ['a bond that is missing one electron', 'a missing silicon atom', 'a positive ion', 'a free positron'], 0,
        [null, 'A missing atom is a vacancy, a different defect.', 'Ions are fixed; holes move.', 'It is an absence of an electron, not a new particle.'],
        md`The vacancy in a bond moves as neighboring electrons hop in, carrying charge $+q$.`),
      P({
        q: md`Si is doped with $N_d = 10^{14}\,\text{cm}^{-3}$. Find $p_0$ at 300 K.`,
        parts: [{ lbl: md`p_0`, ans: 2.25e6, unit: 'cm^{-3}' }],
        sol: md`$N_d = 10^{14} \gg n_i$, so $n_0 = 10^{14}$ and $p_0 = 2.25\times10^{20}/10^{14} = 2.25\times10^6\,\text{cm}^{-3}$. Even light doping makes holes rare.`,
      }),
      Q(md`Gold in silicon gives energy levels near the middle of the gap. As a dopant at room temperature, gold…`,
        ['gives almost no free carriers, because ionizing a deep level costs about half the gap; instead it helps electrons and holes recombine', 'is a strong donor', 'is a strong acceptor', 'raises the band gap'], 0,
        [null, 'A useful donor must sit within a few $kT$ of $E_c$.', 'Same reason: too deep.', 'Impurities at these levels do not change the gap.'],
        md`Shallow levels (within ~0.05 eV of a band) ionize at room temperature; deep levels don't. Deep levels act as stepping stones for recombination (Topic 9).`),
      Q(md`The electron concentration in a sample is $10^{16}$ and the hole concentration is $10^{16}$. Is it intrinsic?`,
        ['Not at 300 K for Si: $n_0p_0$ would be $10^{32} \\ne n_i^2$, so it isn’t in equilibrium (or isn’t Si at 300 K)', 'Yes: $n = p$ means intrinsic', 'It is n-type', 'It is compensated'], 0,
        [null, 'Equal $n$ and $p$ in equilibrium Si at 300 K means $n = p = 1.5\\times10^{10}$.', 'Equal numbers of each.', 'Compensation leaves $n_0p_0 = n_i^2$ too.'],
        md`In equilibrium $n_0p_0 = n_i^2$ always. $10^{16}$ of each means excess carriers (light or injection): Topic 9.`),
      Q(md`Why are shallow dopants (levels within about $0.05$ eV of a band) the useful ones?`,
        ['their binding energy is comparable to $kT$, so they are almost all ionized at room temperature', 'they are the only ones that fit in the lattice', 'they change the band gap', 'they never recombine'], 0,
        [null, 'Deep-level impurities fit in the lattice too.', 'Doping does not change the gap at normal levels.', 'Dopants do not recombine; carriers do.'],
        md`Fully ionized dopants make $n_0 \approx N_d$ predictable and nearly independent of temperature.`),
    ],
  };

  WHY['t4-fermi'] = {
    build: [
      R(md`
        ### Start here: why we need probabilities at all

        A cm³ of semiconductor has $10^{22}$ electrons constantly trading energy with the vibrating lattice. Following each one is hopeless. What we can ask is: in equilibrium at temperature $T$, **what is the chance that a state at energy $E$ holds an electron?**

        Two rules shape the answer.

        1. **The lattice hands out energy randomly**: the chance of borrowing an extra energy $\Delta E$ from it goes as $e^{-\Delta E/kT}$ (the Boltzmann factor). Each additional $kT$ costs a factor $e \approx 2.7$.
        2. **Pauli exclusion**: a state holds at most one electron (counting spin).

        Together they give the **Fermi–Dirac distribution**:
        $$f(E) = \frac{1}{1 + e^{(E - E_F)/kT}}$$
        $E_F$ is the energy at which a state is exactly half likely to be full. Well below $E_F$ (by several $kT$), states are full; well above, they are nearly empty, and $f \approx e^{-(E - E_F)/kT}$: the **Boltzmann tail**. The transition is only a few $kT$ wide (about $0.1$ eV at room temperature).
      `),
      Q(md`A state $3kT$ above $E_F$ and a state $4kT$ above $E_F$: which is more likely to be occupied, and by about how much?`,
        ['the $3kT$ state, by a factor of about $e \\approx 2.7$', 'the $4kT$ state, by $e$', 'the $3kT$ state, by a factor of 4/3', 'they are equally likely'], 0,
        [null, 'Higher states are less likely to be full.', 'The tail is exponential, not proportional.', 'Each extra $kT$ costs a factor $e$.'],
        md`In the tail $f \approx e^{-(E - E_F)/kT}$: one more $kT$ divides the probability by $e$.`),
      R(md`
        ### The Fermi level is a water level

        Picture $E_F$ as the surface of a sea of electrons: everything well below is filled, everything well above is empty, and temperature makes the surface a little choppy (a few $kT$).

        In a semiconductor $E_F$ usually sits **in the gap**, where there are no states at all. That is fine: $f$ is a probability defined at any energy, and what matters is what it does where states exist.

        - The conduction band starts at $E_c$, above $E_F$: only the thin Boltzmann tail reaches it, so **few electrons**.
        - The valence band ends at $E_v$, below $E_F$: nearly every state is full, and the small empty fraction $1 - f$ is also a tail, so **few holes**.

        The closer $E_F$ sits to $E_c$, the fatter the tail at $E_c$ and the more electrons. Physically, $E_F$ is the energy it costs to add one more electron to the material. Two pieces in contact trade electrons until their $E_F$ match (Topic 7).
      `),
      Q(md`In an n-type sample, $E_F$ lies $0.2$ eV below $E_c$ inside the gap. Is there an electron at $E_F$?`,
        ['No: there are no states in the gap; $E_F$ is a statistical level that sets occupancy elsewhere', 'Yes, exactly half an electron on average', 'Yes, the donor electrons sit there', 'Only at 0 K'], 0,
        [null, '$f = 1/2$ there, but there is no state to occupy.', 'Donor levels sit near $E_c$, not at $E_F$ in general.', 'The gap has no states at any temperature.'],
        md`$E_F$ is a parameter of the distribution, not a place where electrons live.`),
      RF(md`
        ### From $f(E)$ to $n_0$: the 60 meV rule

        Electron concentration = (number of states) × (chance each is full), added up over the band:
        $$n_0 = \int_{E_c}^{\infty} N(E)\,f(E)\,dE$$
        Because $f$ dies off exponentially above $E_c$, only a sliver within a few $kT$ of the band edge is occupied, and the integral collapses to
        $$n_0 = N_c\,e^{-(E_c - E_F)/kT}$$
        as if all the band's states were stacked at $E_c$ ($N_c$, the effective density of states).

        **The exponential is the whole story.** Move $E_F$ up by $kT\ln10 = 0.0596$ eV and $n_0$ multiplies by 10 (while $p_0$ divides by 10). **Sixty millivolts per decade** is the most useful number in device physics; the 60 mV/decade limit of transistor switching has the same origin.

        So $E_F$'s position *is* the carrier concentration, on a log scale. At $E_F = E_i$, $n_0 = p_0 = n_i$. Each 60 meV above $E_i$ is another factor of 10 in electrons. For $n_0 = 10^{16}$: $\log_{10}(10^{16}/1.5\times10^{10}) = 5.82$ decades, times 0.0596 eV = $0.347$ eV above $E_i$.

        [[fig:dec]]
      `, { dec: { svg: decadeFig(), cap: 'Si at 300 K: $\\log n_0$ and $\\log p_0$ are straight lines in $E_F - E_i$, one decade per 60 meV, crossing at $n_i$.' } }),
      P({
        q: md`$E_F$ moves up by $0.18$ eV. By what factor does $n_0$ change?`,
        parts: [{ lbl: md`n_0'/n_0`, ans: 1044, tol: { rel: 0.03 } }],
        hints: [md`$e^{\Delta E/kT}$; or count decades at 60 meV each.`],
        sol: md`$e^{0.18/0.0259} = e^{6.95} = 1.04\times10^3$. Three decades for three times 60 meV.`,
      }),
      R(md`
        ### Why intrinsic $E_F$ sits at midgap (almost)

        In pure material $n_0 = p_0$. The conduction band's tail and the valence band's tail must hold the same number of carriers:
        $$N_c\,e^{-(E_c - E_F)/kT} = N_v\,e^{-(E_F - E_v)/kT}$$
        If $N_c$ equaled $N_v$, $E_F$ would have to sit exactly halfway, equally far from both bands. In Si, $N_c$ is about 2.7 times $N_v$ (more conduction states near the edge), so to keep the electron count equal $E_F$ moves slightly **down**:
        $$E_i = \frac{E_c + E_v}{2} + \frac{kT}{2}\ln\frac{N_v}{N_c} = \text{midgap} - 0.013\ \text{eV}$$
        About 1% of the gap: "midgap" is a fine picture.

        Doping simply moves the water level. Donors pour electrons in: to hold more electrons in the conduction band, the level must rise toward $E_c$. Acceptors drain electrons out: the level drops toward $E_v$.
      `),
      Q(md`In silicon $N_c > N_v$. The intrinsic level $E_i$ therefore sits…`,
        ['slightly below midgap', 'slightly above midgap', 'exactly at midgap', 'at $E_c$'], 0,
        [null, 'With more conduction states, $E_F$ must move away from $E_c$ to keep $n = p$.', 'Only if $N_c = N_v$.', 'That would make $n \\approx N_c$, far from intrinsic.'],
        md`$E_i - \text{midgap} = \tfrac{kT}{2}\ln(N_v/N_c) < 0$ when $N_c > N_v$.`),
      R(md`
        ### Mirror symmetry, and why the product doesn't care about $E_F$

        The Fermi function is symmetric about $E_F$:
        $$f(E_F + \Delta) = 1 - f(E_F - \Delta)$$
        The chance a state $\Delta$ above $E_F$ is **full** equals the chance a state $\Delta$ below is **empty**. That is why the hole formula mirrors the electron formula: $p_0 = N_v\,e^{-(E_F - E_v)/kT}$.

        Multiply the two and $E_F$ cancels:
        $$n_0p_0 = N_cN_v\,e^{-(E_c - E_v)/kT} = N_cN_v\,e^{-E_g/kT} = n_i^2$$
        Moving $E_F$ trades electrons for holes one decade at a time, but the product stays fixed. The same law you got from generation–recombination balance in Topic 3 falls out of the statistics.
      `),
      Q(md`$E_F$ moves up by 60 meV. Which statement is right?`,
        ['$n_0$ ×10, $p_0$ ÷10, $n_0p_0$ unchanged', '$n_0$ ×10, $p_0$ unchanged', 'both ×10', '$n_0$ ×2, $p_0$ ÷2'], 0,
        [null, 'Moving $E_F$ away from $E_v$ shrinks the hole tail too.', 'They move in opposite directions.', 'The exponential gives a factor 10 per 60 meV, not 2.'],
        md`$kT\ln10 = 60$ meV is one decade for each carrier, in opposite directions.`),
      R(md`
        ### When the shortcut fails

        The tail formula needs $E_F$ at least about $3kT$ away from both band edges (**non-degenerate**). With very heavy doping (above roughly $10^{19}\,\text{cm}^{-3}$ in Si), $E_F$ nears or enters a band; the material is **degenerate** and behaves almost like a metal, and the exponential formulas overestimate $n$. At $T = 0$ the distribution is a sharp step: every state below $E_F$ full, every state above empty.
      `),
      Q(md`A heavily doped sample has $E_F$ $0.01$ eV **above** $E_c$. Using $n_0 = N_ce^{-(E_c - E_F)/kT}$ is…`,
        ['not valid: the sample is degenerate, and $f$ is no longer a small tail at $E_c$', 'valid, giving $n_0 > N_c$ exactly', 'valid at any doping', 'valid only for holes'], 0,
        [null, 'The formula assumes $f \\ll 1$ in the band, which fails here.', 'The Boltzmann tail is an approximation for $E - E_F \\gg kT$.', 'Holes would be negligible here anyway.'],
        md`Use the Boltzmann forms only when $E_F$ is a few $kT$ inside the gap.`),
    ],
    qs: [
      Q(md`What is $f(E_F)$ at $T = 600$ K?`,
        ['1/2', '1', '0', 'it depends on the doping'], 0,
        [null, 'That is deep below $E_F$.', 'That is far above $E_F$.', '$E_F$ is defined as the half-full energy at any $T$ and doping.'],
        md`$f(E_F) = 1/(1 + e^0) = 1/2$ always.`),
      Q(md`At $T = 0$ K, the probability that a state just above $E_F$ is occupied is…`,
        ['0', '1/2', '1', 'about $e^{-1}$'], 0,
        [null, 'Exactly at $E_F$ only.', 'That holds below $E_F$.', 'There is no thermal tail at 0 K.'],
        md`At 0 K $f$ is a step: 1 below $E_F$, 0 above.`),
      Q(md`$E_c - E_F$ is held fixed while the temperature rises. $n_0$…`,
        ['rises: the tail broadens ($kT$ grows) and $N_c$ grows as $T^{3/2}$', 'is unchanged', 'falls', 'depends only on the doping'], 0,
        [null, 'Both $kT$ in the exponent and $N_c$ change.', 'Larger $kT$ makes the exponent less negative.', 'In this hypothetical the position of $E_F$ is fixed; the formula decides.'],
        md`$n_0 = N_c(T)\,e^{-(E_c - E_F)/kT}$: both factors increase with $T$.`),
      P({
        q: md`Two Si samples at 300 K: $n_0 = 10^{15}$ and $n_0 = 10^{17}\,\text{cm}^{-3}$. How far apart are their Fermi levels?`,
        parts: [{ lbl: md`\Delta E_F`, ans: 0.1193, unit: 'eV' }],
        sol: md`$kT\ln(10^{17}/10^{15}) = 0.0259\ln100 = 0.119$ eV: two decades, 60 meV each.`,
      }),
      P({
        q: md`Si at 300 K has $E_F - E_i = 0.30$ eV. Find $n_0$.`,
        parts: [{ lbl: md`n_0`, ans: 1.609e15, unit: 'cm^{-3}' }],
        sol: md`$n_0 = n_ie^{0.30/0.0259} = 1.5\times10^{10}\,e^{11.58} = 1.61\times10^{15}\,\text{cm}^{-3}$. About five decades above $n_i$ for five times 60 meV.`,
      }),
      Q(md`Most conduction electrons in a non-degenerate sample have energies…`,
        ['within about $kT$ of $E_c$', 'near the top of the conduction band', 'right at $E_F$', 'spread evenly across the band'], 0,
        [null, 'The tail makes high energies exponentially unlikely.', '$E_F$ is in the gap; there are no states there.', 'Occupancy falls by $e$ every $kT$.'],
        md`$N(E)f(E) \propto \sqrt{E - E_c}\,e^{-(E - E_c)/kT}$ peaks at $E_c + kT/2$.`),
      Q(md`Which is equal to the probability that a state $0.1$ eV **above** $E_F$ is occupied?`,
        ['the probability that a state $0.1$ eV below $E_F$ is empty', 'the probability that a state $0.1$ eV below $E_F$ is full', 'one half', 'the probability that a state at $E_F$ is empty'], 0,
        [null, 'That one is close to 1.', 'Only at $E_F$ itself.', 'That is exactly ½.'],
        md`$f(E_F + \Delta) = 1 - f(E_F - \Delta)$: the distribution is symmetric about $E_F$.`),
      Q(md`Material A has a heavier electron density-of-states mass than material B; everything else is equal, including $E_c - E_F$. A has…`,
        ['more conduction electrons, because $N_c \\propto (m_n^*)^{3/2}$', 'fewer conduction electrons', 'the same number', 'no conduction electrons'], 0,
        [null, 'Heavier mass means more states near the band edge, not fewer.', '$N_c$ differs.', 'The tail still reaches the band.'],
        md`More states per energy near $E_c$ means more electrons at the same occupancy.`),
      P({
        q: md`Sample X has $E_c - E_F = 0.15$ eV and sample Y has $0.27$ eV (same material, 300 K). Find $n_X/n_Y$.`,
        parts: [{ lbl: md`n_X/n_Y`, ans: 102.8, tol: { rel: 0.03 } }],
        sol: md`$e^{(0.27 - 0.15)/0.0259} = e^{4.63} = 103$: 0.12 eV is two decades.`,
      }),
      Q(md`In a p-type sample, which is larger?`,
        ['$E_c - E_F$', '$E_F - E_v$', 'they are equal', 'it depends on $T$ only'], 0,
        [null, 'In p-type, $E_F$ is close to $E_v$, so this is the small one.', 'Equal only when intrinsic with $N_c = N_v$.', 'Doping type decides which band $E_F$ is near.'],
        md`p-type pulls $E_F$ toward $E_v$: the hole tail is fat, the electron tail thin.`),
      P({
        q: md`$E_F$ is $0.2$ eV below $E_c$. What is the probability that a state $0.1$ eV above $E_c$ is occupied?`,
        parts: [{ lbl: md`f`, ans: 9.32e-6, tol: { rel: 0.03 } }],
        sol: md`$E - E_F = 0.3$ eV: $f = 1/(1 + e^{0.3/0.0259}) \approx e^{-11.58} = 9.3\times10^{-6}$.`,
      }),
      Q(md`In equilibrium, can $E_F$ be at different energies in two parts of a sample in contact?`,
        ['No: electrons would flow toward the lower $E_F$ until it is flat', 'Yes, if the doping differs', 'Yes, at high temperature', 'Only in metals'], 0,
        [null, 'Different doping changes where the bands are relative to $E_F$, not $E_F$ itself.', 'Temperature does not allow a net flow in equilibrium.', 'True for any materials in contact.'],
        md`Equal $E_F$ is what equilibrium means. Topic 7 builds on this.`),
      Q(md`The 60 mV per decade rule comes from…`,
        ['$kT\\ln10$ at room temperature: the Boltzmann factor changes 10× per $0.0596$ eV', 'the band gap of silicon divided by 20', 'the donor binding energy', 'Ohm’s law'], 0,
        [null, 'It is the same in every semiconductor at 300 K.', 'Unrelated.', 'Unrelated.'],
        md`$e^{\Delta E/kT} = 10 \Rightarrow \Delta E = kT\ln10 = 0.0259\times2.303 = 0.0596$ eV. It scales with temperature.`),
    ],
  };
})();

/* Ch. 1 — Crystal properties (Streetman & Banerjee 1.1–1.2). Topic 1. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;

  const cells = PF.row([
    { svg: BD.cell('sc', { dim: false }), cap: 'simple cubic: 1 atom' },
    { svg: BD.cell('bcc', { dim: false }), cap: 'body-centered: 2' },
    { svg: BD.cell('fcc', { dim: false }), cap: 'face-centered: 4' },
  ]);
  const planes = PF.row([
    { svg: BD.cell('sc', { plane: '100', dim: false, r: 4 }), cap: '(100)' },
    { svg: BD.cell('sc', { plane: '110', dim: false, r: 4 }), cap: '(110)' },
    { svg: BD.cell('sc', { plane: '111', dim: false, r: 4 }), cap: '(111)' },
  ]);

  C.unit({
    id: 'ch1', exam: 'e1', num: 'Ch. 1', title: 'Crystal properties',
    lessons: [
      {
        id: 't1-crystal', topic: 1, sec: '1.1–1.2', title: 'Crystal structure, lattices, atomic density',
        steps: [
          R(md`
            ### The idea

            A crystal is one small arrangement of atoms repeated in every direction. The **lattice** is the set of repeat points; the **basis** is what sits at each point (one atom, or a group). Pick the smallest box that tiles space by translation and you have a **unit cell**. Every property of the crystal (how many atoms per cm³, how many per cm² on a surface, which way bonds point) comes from counting inside that one box.

            Semiconductors used for devices are **single crystals**: one lattice, perfectly periodic across the whole wafer. *Polycrystalline* material is many small crystals stuck together; *amorphous* material has no long-range order at all.

            Silicon and germanium (column IV) and GaAs (a III–V compound) all sit on a cubic lattice, so three cubic cells are all you need.
          `),
          RF(md`
            ### Counting atoms in a cubic cell

            [[fig:cells]]

            An atom on a **corner** is shared by 8 cells, on a **face** by 2, on an **edge** by 4; one **inside** belongs to this cell alone. So:

            | Lattice | Atoms per cell | Nearest-neighbor distance | Packing fraction |
            |---|---|---|---|
            | simple cubic (sc) | $8\cdot\tfrac18 = 1$ | $a$ | $\pi/6 = 0.52$ |
            | body-centered (bcc) | $1 + 1 = 2$ | $\tfrac{\sqrt3}{2}a$ | $\sqrt3\pi/8 = 0.68$ |
            | face-centered (fcc) | $1 + 6\cdot\tfrac12 = 4$ | $\tfrac{a}{\sqrt2}$ | $\sqrt2\pi/6 = 0.74$ |
            | diamond (Si, Ge) | $4 + 4 = 8$ | $\tfrac{\sqrt3}{4}a$ | $\sqrt3\pi/16 = 0.34$ |

            Here $a$ is the **lattice constant**, the edge of the cubic cell (Si: $a = 5.43$ Å; Ge and GaAs: $5.65$ Å). The packing fraction is the share of the cell filled if each atom is a hard sphere touching its nearest neighbors.
          `, { cells: { svg: cells.svg } }),
          RF(md`
            ### The diamond and zincblende lattices

            [[fig:dia]]

            The **diamond lattice** is an fcc lattice with a two-atom basis: one atom at each fcc point and a second one shifted by $\left(\tfrac a4, \tfrac a4, \tfrac a4\right)$ along the cube diagonal. That puts 4 extra atoms (shaded) inside the cell, so **8 atoms per cell**. Each atom has 4 nearest neighbors at the corners of a tetrahedron, one covalent bond to each, which is why column-IV atoms (4 valence electrons) like it.

            **Zincblende** (GaAs, InP, …) is the same geometry with the two fcc sublattices holding different atoms: 4 Ga and 4 As per cell, each Ga bonded to 4 As.
          `, { dia: { svg: BD.cell('diamond'), cap: 'Diamond lattice: fcc points (open) plus the four interior atoms (shaded), each bonded to four neighbors.' } }),
          R(md`
            ### Atomic density

            $$N = \frac{\text{atoms per cell}}{a^3}$$

            - $N$: atoms per unit volume, $\text{cm}^{-3}$
            - $a$: lattice constant, cm (convert: $1\,\text{Å} = 10^{-8}\,\text{cm}$)

            Mass density follows by weighing them: $\rho_m = N M / N_A$, with $M$ the molar mass in g/mol and $N_A = 6.022\times10^{23}\,\text{mol}^{-1}$. For a compound use the atoms of each kind and add.
          `),
          RF(md`
            ### Planes and directions: Miller indices

            [[fig:planes]]

            To name a plane:
            1. Find where it cuts the $x$, $y$, $z$ axes, in units of $a$ (a plane parallel to an axis cuts it at $\infty$).
            2. Take the reciprocals.
            3. Multiply by the smallest number that makes them all integers: that is $(hkl)$.

            A plane cutting at $(1, \infty, \infty)$ is $(100)$; at $(1, 1, \infty)$ it is $(110)$; at $(1,1,1)$ it is $(111)$. A minus sign is written as a bar: $(\bar100)$. If the plane passes through the origin, shift the origin to a neighbouring corner first.

            - $(hkl)$: one plane (and all planes parallel to it). $\{hkl\}$: the family of equivalent planes, e.g. $\{100\}$ = all six cube faces.
            - $[hkl]$: a direction, the vector $h\hat x + k\hat y + l\hat z$ in lowest integers. $\langle hkl\rangle$: the family of equivalent directions.
            - In a **cubic** lattice, $[hkl]$ is perpendicular to $(hkl)$.

            **Planar density** = atoms whose centers lie in the plane, inside one cell's piece of the plane, divided by that area. On a $(100)$ face of a diamond or fcc cell: 4 corners $\times\tfrac14$ + 1 face center $= 2$ atoms in area $a^2$.
          `, { planes: { svg: planes.svg, cap: 'Three planes of a cubic cell, shaded. The axes: x toward you, y to the right, z up.' } }),
          R(md`
            ### Worked example

            !!graded Problem
              Silicon has the diamond structure with $a = 5.43$ Å and molar mass $28.09$ g/mol. Find (a) the number of Si atoms per cm³, (b) the mass density, and (c) the number of atoms per cm² on a $(100)$ surface.

            **1. Diagram / governing equations.** The diamond cell above: 8 atoms per cubic cell, 2 atoms on each $(100)$ face.
            $$N = \frac{8}{a^3}, \qquad \rho_m = \frac{N M}{N_A}, \qquad N_{(100)} = \frac{2}{a^2}$$

            **2. Units.** $a = 5.43\,\text{Å} = 5.43\times10^{-8}\,\text{cm}$.

            **3. Substitute, with units on every quantity.**
            $$N = \frac{8\ \text{atoms}}{\left(5.43\times10^{-8}\,\text{cm}\right)^3} = \frac{8\ \text{atoms}}{1.601\times10^{-22}\,\text{cm}^3}$$
            $$\rho_m = \frac{\left(5.00\times10^{22}\,\text{cm}^{-3}\right)\left(28.09\,\text{g/mol}\right)}{6.022\times10^{23}\,\text{mol}^{-1}}$$
            $$N_{(100)} = \frac{2\ \text{atoms}}{\left(5.43\times10^{-8}\,\text{cm}\right)^2} = \frac{2\ \text{atoms}}{2.948\times10^{-15}\,\text{cm}^2}$$

            **4. Answers (3 significant figures).**
            (a) $N = 5.00\times10^{22}\,\text{cm}^{-3}$; (b) $\rho_m = 2.33\,\text{g/cm}^3$; (c) $N_{(100)} = 6.78\times10^{14}\,\text{cm}^{-2}$.

            Sanity check: $\sim5\times10^{22}$ atoms/cm³ is the number every solid lands near, and 2.33 g/cm³ is silicon's tabulated density.

            !!mistake Common mistakes
              - Ångströms left unconverted, or converted to meters: $1\,\text{Å} = 10^{-8}\,\text{cm}$, and the course works in cm.
              - Using 4 atoms per cell for Si (that is plain fcc). Diamond has **8**.
              - Counting corner atoms as whole atoms: each is $\tfrac18$ inside the cell ($\tfrac14$ of it lies in a face).
              - Miller indices from the intercepts themselves instead of their **reciprocals**; or forgetting that "parallel to an axis" means intercept $\infty$, index 0.
              - Mixing up notation: $(100)$ is a plane, $[100]$ a direction, $\{100\}$ and $\langle100\rangle$ the families.

            ### Check questions
          `),
          Q(md`How many atoms are in one conventional cubic cell of the diamond lattice?`,
            ['4', '8', '2', '18'], 1,
            ['4 is plain fcc. Diamond adds a second atom to each fcc point, shifted by a quarter of the body diagonal: four more atoms, all inside the cell.', null, '2 is body-centered cubic.', 'That counts every atom drawn as a whole atom: 8 corners + 6 faces + 4 inside. Corners count ⅛ and faces ½.'],
            md`fcc gives $8\cdot\tfrac18 + 6\cdot\tfrac12 = 4$; the basis doubles it: $4 + 4 = 8$.`),
          P({
            title: 'GaAs atomic density',
            q: md`GaAs has the zincblende structure with $a = 5.65$ Å. How many Ga atoms are there per cm³?`,
            parts: [{ lbl: md`N_{\text{Ga}}`, ans: 2.218e22, unit: 'cm^{-3}' }],
            hints: [md`Zincblende has 8 atoms per cell, half of them Ga.`, md`$N_{\text{Ga}} = 4/a^3$ with $a$ in cm.`],
            sol: md`$$N_{\text{Ga}} = \frac{4}{a^3} = \frac{4}{\left(5.65\times10^{-8}\,\text{cm}\right)^3} = \frac{4}{1.804\times10^{-22}\,\text{cm}^3} = 2.22\times10^{22}\,\text{cm}^{-3}$$ The As density is the same, and the total is $4.44\times10^{22}\,\text{cm}^{-3}$.`,
          }),
          Q(md`A plane cuts the axes at $x = 2a$, $y = 3a$, and runs parallel to $z$. What are its Miller indices?`,
            ['(230)', '(320)', '(23∞)', '(320) and (230) are the same plane'], 1,
            ['Those are the intercepts. Take reciprocals first: ½, ⅓, 0.', null, 'An intercept at ∞ gives index 0 (its reciprocal).', '(320) and (230) are different planes: the indices are in the order x, y, z.'],
            md`Intercepts $2, 3, \infty$ → reciprocals $\tfrac12, \tfrac13, 0$ → multiply by 6 → $(320)$.`),
          Q(md`In a cubic crystal, how is the direction $[111]$ related to the plane $(111)$?`,
            ['It lies in the plane', 'It is perpendicular to the plane', 'At 45° to it', 'It depends on the lattice constant'], 1,
            ['A direction lying in (111) has $h + k + l = 0$, like $[1\\bar10]$.', null, 'No special angle: in cubic crystals $[hkl]$ is the normal of $(hkl)$.', 'Angles in a cubic lattice do not depend on $a$; scaling all lengths keeps every angle.'],
            md`The plane $hx + ky + lz = \text{const}$ has normal $(h, k, l)$, which is the direction $[hkl]$.`),
          P({
            title: 'Planar density of Ge',
            q: md`Germanium has the diamond structure with $a = 5.65$ Å. How many atoms per cm² lie on a $(100)$ plane?`,
            parts: [{ lbl: md`N_{(100)}`, ans: 6.265e14, unit: 'cm^{-2}' }],
            hints: [md`On a cube face: 4 corners at ¼ each plus 1 face center.`],
            sol: md`$$N_{(100)} = \frac{2}{a^2} = \frac{2}{\left(5.65\times10^{-8}\,\text{cm}\right)^2} = \frac{2}{3.192\times10^{-15}\,\text{cm}^2} = 6.27\times10^{14}\,\text{cm}^{-2}$$`,
          }),
        ],
        bank: [
          Q(md`How many nearest neighbors does each atom have in the diamond lattice?`, ['4', '6', '8', '12'], 0,
            [null, '6 is simple cubic.', '8 is bcc.', '12 is fcc (close packed).'], md`Each atom bonds covalently to 4 neighbors at the corners of a tetrahedron.`),
          Q(md`Which lattice packs hard spheres most tightly?`, ['simple cubic', 'body-centered cubic', 'face-centered cubic', 'diamond'], 2,
            ['0.52.', '0.68.', null, 'Diamond is the emptiest of the four: 0.34. Its open structure is set by directional covalent bonds, not packing.'], md`fcc: $\sqrt2\pi/6 = 0.74$.`),
          Q(md`What is the nearest-neighbor distance in Si ($a = 5.43$ Å)?`, ['5.43 Å', '3.84 Å', '2.35 Å', '2.72 Å'], 2,
            ['That is the cube edge.', 'That is $a/\\sqrt2$, the fcc neighbor distance (same-sublattice atoms in diamond).', null, 'That is $a/2$.'], md`A quarter of the body diagonal: $\tfrac{\sqrt3}{4}a = 2.35$ Å.`),
          Q(md`GaAs crystallizes in which structure?`, ['diamond', 'zincblende', 'body-centered cubic', 'simple cubic'], 1,
            ['Diamond has one kind of atom on both sublattices.', null, 'No: each atom needs 4 tetrahedral bonds.', 'No: each atom needs 4 tetrahedral bonds.'], md`Zincblende: diamond geometry with Ga on one fcc sublattice and As on the other.`),
          Q(md`A crystal's "basis" is…`, ['the set of lattice points', 'the atom or group of atoms placed at every lattice point', 'the unit cell', 'the lattice constant'], 1,
            ['That is the lattice.', null, 'The unit cell is the repeating box.', 'That is a length.'], md`Crystal = lattice + basis.`),
          Q(md`How many distinct (non-parallel) planes are in the family $\{100\}$ of a cube?`, ['1', '3', '6', '8'], 1,
            ['$\\{100\\}$ includes $(010)$ and $(001)$ too.', null, '6 counts $(100)$ and $(\\bar100)$ separately; they are parallel.', '8 is the $\\{111\\}$ count with signs.'], md`$(100), (010), (001)$; with negatives, the six faces.`),
          Q(md`Material whose atoms have no long-range order is…`, ['single-crystal', 'polycrystalline', 'amorphous', 'epitaxial'], 2,
            ['Perfect long-range order.', 'Ordered within each grain.', null, 'Epitaxial layers are single crystals grown on a crystal.'], md`Amorphous: order only over a few atoms.`),
          Q(md`Doubling the lattice constant of a crystal (same structure) changes the atomic density by…`, ['×2', '×½', '×⅛', '×¼'], 2,
            ['Density goes as $1/a^3$.', 'Density goes as $1/a^3$.', null, 'That is the planar density.'], md`$N \propto 1/a^3$.`),
          Q(md`The plane cutting the axes at $x = a$, $y = a$, $z = \tfrac a2$ is…`, ['(112)', '(221)', '(11½)', '(110)'], 0,
            [null, 'Those are the intercepts doubled; take reciprocals.', 'Indices are integers: reciprocals of 1, 1, ½ are 1, 1, 2.', 'It does cut the z axis.'], md`Reciprocals $1, 1, 2$ → $(112)$.`),
        ],
      },
    ],
  });
})();

/* Past homework, Fall 2026 HW 1–5: every problem as assigned, blank, with answer boxes wherever there is a number or a
   choice to check, and full worked solutions (the official keys, verified; where a key is terse or off, the solution
   says so). Figures are the ones printed with the assignments. */
(function () {
  'use strict';
  const { R, P } = C;
  const N = (lbl, ans, unit, rel = 0.03) => ({ lbl, ans, unit, tol: { rel } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // options shuffled
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order kept (e.g. +x / −x)
  const img = (f, alt, w = 420) => `<img class="scan" src="img/hw/${f}.png" alt="${alt}" style="max-width:${w}px" loading="lazy">`;
  const fig = (f, alt, w, cap) => ({ svg: img(f, alt, w), cap });
  const XY = ['$+x$', '$-x$'];
  const intro = (n, due, topics) => R(md`**Homework ${n}** · due ${due}. ${topics}

Work every part on paper first, with units, the way you would hand it in. Then enter your answers to check them, and open the solution to compare your reasoning.`);

  // ================================================================ HW 1
  const hw1 = [
    intro(1, 'Friday, September 4, 2026', 'Units, crystal structures, density and bonding, epitaxial growth. Four problems, 20 points each.'),
    R(md`### Problem 1 · Units and measurements in semiconductors (20 pts)`),
    P({ src: 'HW1 · 1A (5 pts)', q: md`(A) We often need the energy of a photon. A convenient formula for the photon energy in vacuum, given its wavelength, is
$$E_{ph} = \frac{1.24\ (\text{eV}\cdot\mu\text{m})}{\lambda(\mu\text{m})} = \frac{1240\ (\text{eV}\cdot\text{nm})}{\lambda(\text{nm})}$$
Derive this formula, knowing that $\lambda = c/\nu$ ($c$ the speed of light, $\nu$ the photon frequency) and $E_{ph} = h\nu$ ($h$ Planck's constant). What is $hc$ in eV·nm?`,
      parts: [N('hc', 1240, 'eV·nm', 0.01)],
      sol: md`Solve $\lambda = c/\nu$ for $\nu = c/\lambda$ and substitute: $E_{ph} = h\nu = hc/\lambda$. With $h$ in eV·s and $c$ in nm/s:
$$hc = (4.136\times10^{-15}\ \text{eV}\cdot\text{s})(2.998\times10^{17}\ \text{nm/s}) = 1240\ \text{eV}\cdot\text{nm} = 1.24\ \text{eV}\cdot\mu\text{m}$$
so $E_{ph}(\text{eV}) = 1240/\lambda(\text{nm})$. Worth memorizing: 1.24 eV ↔ 1 µm.` }),
    P({ src: 'HW1 · 1B (5 pts)', q: md`(B) Planck's constant can be expressed in J·s or in eV·s. Reflect on which version is more convenient for our calculations. Take the ratio of $h$ in J·s to $h$ in eV·s. What value do you get, and what does it represent?`,
      parts: [N('the ratio', 1.602e-19, 'J/eV', 0.01),
        MC('The ratio represents…', ['joules per electronvolt: numerically $q$', 'the number of electronvolts in 1 J, which is $1/q$', 'Boltzmann’s constant, converting kelvin to joules', 'the energy of a 1 µm photon, expressed in joules'], 0,
          [null, 'That would be the inverse ratio, about $6.2\\times10^{18}$.', 'Boltzmann’s constant is $1.38\\times10^{-23}$ J/K, unrelated to $h$.', 'A 1 µm photon carries 1.24 eV $= 2.0\\times10^{-19}$ J.'])],
      sol: md`Use **eV·s**: we deal with the energies of single electrons and photons, which come out in eV directly. $h = 6.626\times10^{-34}$ J·s $= 4.136\times10^{-15}$ eV·s, so
$$\frac{6.626\times10^{-34}\ \text{J}\cdot\text{s}}{4.136\times10^{-15}\ \text{eV}\cdot\text{s}} = 1.602\times10^{-19}\ \text{J/eV}$$
One electronvolt is the energy one electron gains (or loses) crossing a potential difference of 1 V: $1\ \text{eV} = q\times1\ \text{V} = 1.602\times10^{-19}$ C·V $= 1.602\times10^{-19}$ J. The ratio is the elementary charge in coulombs.` }),
    P({ src: 'HW1 · 1C (2 pts)', q: md`(C) Consider a photon with energy 1.20 eV. What is its wavelength in nm?`,
      parts: [N('\\lambda', 1033, 'nm', 0.01)],
      sol: md`$\lambda = 1240/1.20 = 1033$ nm, in the near infrared. (Si, with $E_g = 1.12$ eV, can just absorb it.)` }),
    P({ src: 'HW1 · 1D (8 pts)', q: md`(D) Measurements are often made at reference temperatures that are easy to reproduce at atmospheric pressure (always use kelvin). Many formulas use the **thermal voltage** $V_{th}(\text{eV}) = k_B(\text{eV/K})\times T(\text{K}) = k_BT$. Calculate it at: 1. room temperature (300 K); 2. 120 K; 3. liquid-nitrogen temperature; 4. liquid-helium temperature (look up the last two).`,
      parts: [N('300\\ \\text{K}', 25.85, 'meV', 0.01), N('120\\ \\text{K}', 10.34, 'meV', 0.01), N('liquid nitrogen', 6.635, 'meV', 0.02), N('liquid helium', 0.353, 'meV', 0.04)],
      sol: md`$k_B = 8.617\times10^{-5}$ eV/K.
1. 300 K: $25.9$ meV.
2. 120 K: $10.3$ meV.
3. Liquid nitrogen boils at 77 K: $6.64$ meV.
4. Liquid helium boils at 4.2 K: $0.36$ meV (the official key used 4 K, giving 0.345 meV; both are accepted).

$kT$ is linear in $T$: $25.9\ \text{meV}\times(T/300)$.` }),

    R(md`### Problem 2 · Lattice and crystal structures (20 pts)

Answer (A)–(D) for 1) the simple cubic (SC) lattice, 2) the body-centered cubic (BCC) lattice, 3) the face-centered cubic (FCC) lattice and 4) the diamond structure.`),
    P({ src: 'HW1 · 2A (4 pts)', q: md`(A) Calculate the total number of atoms inside the cubic unit cell. Pay attention to the boundary of the unit cell in each case.`,
      parts: [N('\\text{SC}', 1, '', 0.001), N('\\text{BCC}', 2, '', 0.001), N('\\text{FCC}', 4, '', 0.001), N('\\text{diamond}', 8, '', 0.001)],
      figs: { sc: fig('hw1-sc', 'simple cubic unit cell: one atom at each corner', 220, 'SC: corners only'), bcc: fig('hw1-bcc', 'BCC cell: corners plus one atom at the body center', 220, 'BCC: corners + body center'), fcc: fig('hw1-fcc', 'FCC cell: corners plus one atom at the center of each face', 220, 'FCC: corners + face centers') },
      sol: md`A corner atom is shared by 8 cells (counts 1/8), a face atom by 2 (1/2), a body atom by 1.
- SC: $8\times\tfrac18 = 1$
- BCC: $8\times\tfrac18 + 1 = 2$
- FCC: $8\times\tfrac18 + 6\times\tfrac12 = 4$
- Diamond: two interpenetrating FCC lattices displaced by $(\tfrac a4, \tfrac a4, \tfrac a4)$. The first contributes 4; the second puts 4 more atoms entirely inside the cell: $4 + 4 = 8$.

[[fig:sc]]
[[fig:bcc]]
[[fig:fcc]]` }),
    P({ src: 'HW1 · 2B (4 pts)', q: md`(B) Calculate the nearest-neighbor distance in terms of the lattice constant $a$. Enter each as a multiple of $a$.`,
      parts: [N('d_{SC}/a', 1, ''), N('d_{BCC}/a', 0.8660, ''), N('d_{FCC}/a', 0.7071, ''), N('d_{diamond}/a', 0.4330, '')],
      sol: md`- SC: the neighbor along a cube edge: $a$.
- BCC: corner to body center, half the body diagonal: $\sqrt{(a/2)^2 + (a/2)^2 + (a/2)^2} = \sqrt3a/2 = 0.866a$.
- FCC: corner to face center, half a face diagonal: $\sqrt{(a/2)^2 + (a/2)^2} = \sqrt2a/2 = 0.707a$.
- Diamond: corner to the atom at $(a/4, a/4, a/4)$, a quarter of the body diagonal: $\sqrt3a/4 = 0.433a$. For Si ($a = 5.43$ Å) that is 2.35 Å, the Si–Si bond length.` }),
    P({ src: 'HW1 · 2C (6 pts)', q: md`(C) Which structure has the largest atomic density? Which has the smallest? Give the reason.`,
      parts: [FIX('Largest atomic density', ['SC', 'BCC', 'FCC', 'diamond'], 3, ['Only 1 atom per $a^3$.', '2 atoms per $a^3$.', '4 atoms per $a^3$.', null]),
        FIX('Smallest atomic density', ['SC', 'BCC', 'FCC', 'diamond'], 0, [null, '2 atoms per $a^3$.', '4 atoms per $a^3$.', '8 atoms per $a^3$: the most.'])],
      sol: md`Atomic density = atoms per cell ÷ $a^3$. Every cell has volume $a^3$, so with the same $a$ the count decides: **diamond (8) is largest, SC (1) smallest**.

Keep in mind this compares structures at the **same** lattice constant. Real diamond-structure Si ($a = 5.43$ Å, $5.0\times10^{22}$ cm⁻³) holds fewer atoms per volume than FCC copper ($a = 3.61$ Å, $8.5\times10^{22}$ cm⁻³): the diamond structure is very open (packing fraction 34%).` }),
    P({ src: 'HW1 · 2D (6 pts)', q: md`(D) For SC, BCC and FCC, calculate the packing fraction: the maximum fraction of the unit-cell volume occupied by hard-sphere atoms. Enter each as a fraction (e.g. 0.5).`,
      parts: [N('\\text{SC}', 0.5236, '', 0.02), N('\\text{BCC}', 0.6802, '', 0.02), N('\\text{FCC}', 0.7405, '', 0.02)],
      sol: md`Touching spheres: the radius is half the nearest-neighbor distance. $\text{PF} = (\text{atoms/cell})\cdot\tfrac43\pi r^3/a^3$.
- SC: $r = a/2$, 1 atom: $\pi/6 = 0.52$
- BCC: $r = \sqrt3a/4$, 2 atoms: $\pi\sqrt3/8 = 0.68$
- FCC: $r = \sqrt2a/4$, 4 atoms: $\pi\sqrt2/6 = 0.74$ (the densest possible packing)

For comparison, diamond: $r = \sqrt3a/8$, 8 atoms: $\pi\sqrt3/16 = 0.34$.` }),

    R(md`### Problem 3 · Density of crystals and bonding (20 pts)`),
    P({ src: 'HW1 · 3A (10 pts)', q: md`(A) Calculate the mass densities (g/cm³) of Si and InP from their lattice constants (Si 5.43 Å, InP 5.87 Å), atomic weights (Si 28.09; In 114.82; P 30.97) and Avogadro's number. Compare qualitatively with the densities in Appendix III.`,
      parts: [N('\\rho_{Si}', 2.33, 'g/cm^3', 0.02), N('\\rho_{InP}', 4.79, 'g/cm^3', 0.02)],
      sol: md`Both have 8 atoms per cubic cell (diamond / zincblende). One atomic mass unit is $1/N_A = 1.66\times10^{-24}$ g.
$$\rho_{Si} = \frac{8\times28.09\times1.66\times10^{-24}\ \text{g}}{(5.43\times10^{-8}\ \text{cm})^3} = \frac{3.73\times10^{-22}}{1.60\times10^{-22}} = 2.33\ \text{g/cm}^3$$
InP has 4 In and 4 P per cell:
$$\rho_{InP} = \frac{4(114.82 + 30.97)\times1.66\times10^{-24}\ \text{g}}{(5.87\times10^{-8}\ \text{cm})^3} = \frac{9.68\times10^{-22}}{2.02\times10^{-22}} = 4.79\ \text{g/cm}^3$$
Both match Appendix III (2.33 and 4.79 g/cm³).` }),
    P({ src: 'HW1 · 3B (10 pts)', q: md`(B) For these commonly used materials, give the bonding type: covalent, mixed ionic-covalent, ionic or metallic. 1. Si 2. InP 3. NaCl 4. Au 5. P`,
      parts: [
        FIX('Si', ['covalent', 'mixed ionic-covalent', 'ionic', 'metallic'], 0, [null, 'Si–Si bonds join identical atoms: no electronegativity difference, so nothing ionic.', 'Ionic bonding needs electron transfer between unlike atoms.', 'Si’s valence electrons are locked in bonds; it is a semiconductor.']),
        FIX('InP', ['covalent', 'mixed ionic-covalent', 'ionic', 'metallic'], 1, ['In and P pull unequally on the shared pair, so the bond is partly ionic.', null, 'The electrons are still shared, not fully transferred.', 'InP is a semiconductor; its electrons sit in bonds.']),
        FIX('NaCl', ['covalent', 'mixed ionic-covalent', 'ionic', 'metallic'], 2, ['Na gives its electron away; nothing is shared.', 'The transfer is essentially complete: ionic, not mixed.', null, 'Its electrons are bound to the Cl⁻ ions: NaCl is an insulator.']),
        FIX('Au', ['covalent', 'mixed ionic-covalent', 'ionic', 'metallic'], 3, ['Gold forms no directional electron-pair bonds.', 'There is only one kind of atom.', 'One kind of atom: no electron transfer.', null]),
        FIX('P (phosphorus)', ['covalent', 'mixed ionic-covalent', 'ionic', 'metallic'], 0, [null, 'One kind of atom: no ionic part.', 'One kind of atom: no electron transfer.', 'Elemental phosphorus is not a metal.']),
      ],
      sol: md`1. **Si: covalent.** Identical atoms share electron pairs equally (sp³ bonds).
2. **InP: mixed ionic-covalent.** A III–V compound: the bonds are covalent but P is more electronegative, so the shared electrons sit closer to P, giving partial ionic character.
3. **NaCl: ionic.** Na gives its electron to Cl; the ions are held by Coulomb attraction.
4. **Au: metallic.** The valence electrons are delocalized over the whole crystal.
5. **P: covalent.** Elemental phosphorus atoms share electrons (P₄ molecules or layered black P).` }),

    R(md`### Problem 4 · Epitaxial growth (20 pts)

Write each answer in a sentence or two, then compare.`),
    P({ src: 'HW1 · 4A (5 pts)', q: md`(A) Define the term **critical thickness**.`,
      sol: md`The thickness of a lattice-mismatched epitaxial layer above which misfit dislocations form. Below it the layer stays coherently strained; above it the stored strain energy is large enough to be relieved by dislocations.` }),
    P({ src: 'HW1 · 4B (5 pts)', q: md`(B) Define **pseudomorphic growth**.`,
      sol: md`Epitaxial growth of a non-lattice-matched material in which the layer takes on the substrate's in-plane lattice constant (it is elastically strained instead of keeping its own lattice constant). Possible only below the critical thickness.` }),
    P({ src: 'HW1 · 4C (5 pts)', q: md`(C) Define **strained-layer superlattice**.`,
      sol: md`A structure of alternating thin layers with tensile and compressive strain, each below its critical thickness, arranged so that the net strain balances and no misfit dislocations form.` }),
    P({ src: 'HW1 · 4D (5 pts)', q: md`(D) Name one epitaxial growth technology.`,
      sol: md`Molecular beam epitaxy (MBE), metal-organic chemical vapor deposition (MOCVD), vapor-phase epitaxy (VPE), or liquid-phase epitaxy (LPE). MOCVD and MBE are the most common for III–V semiconductors. **Not** Czochralski or float-zone: those grow bulk crystals, not epitaxial layers.` }),
  ];

  // ================================================================ HW 2
  const hw2 = [
    intro(2, 'Friday, September 11, 2026', 'Carrier energy on band diagrams, materials and E–k diagrams, intrinsic and extrinsic material, Fermi–Dirac statistics. Four problems, 20 points each.'),
    R(md`### Problem 1 · Charge and carrier energy (20 pts)

Consider the band diagram below (Fig. 1.1). Holes (1), (2) and (3) sit in the valence bands of three regions.`),
    P({ src: 'HW2 · 1A–D (16 pts)', q: md`(A) Which hole has the highest **kinetic** energy? (B) The highest **potential** energy? (C) The highest **total** energy? (D) Which of these valence-band states has the highest probability of being occupied by an **electron**? Explain each.`,
      fig: img('hw2-bands', 'band diagram: Ec and Ev step up in region 2 and down in region 3; EF dashed and flat; hole 1 below Ev in region 1, hole 2 well below Ev in region 2, hole 3 just below Ev in region 3, the lowest of the three on the page', 300),
      parts: [FIX('(A) highest kinetic energy', ['hole 1', 'hole 2', 'hole 3'], 1, ['It sits less far below its own band edge than hole 2.', null, 'It sits closest to its band edge: the least kinetic energy.']),
        FIX('(B) highest potential energy', ['hole 1', 'hole 2', 'hole 3'], 2, ['Region 1’s valence band is not the lowest one.', 'Region 2 has the highest $E_v$, which is the lowest hole potential energy.', null]),
        FIX('(C) highest total energy', ['hole 1', 'hole 2', 'hole 3'], 2, ['Not the lowest point on the diagram.', 'It is the highest point on the page, which is the lowest hole energy.', null]),
        FIX('(D) state most likely filled by an electron', ['state 1', 'state 2', 'state 3'], 2, ['Not the furthest below $E_F$.', 'Closest to $E_F$ of the three: the least likely to be filled.', null])],
      sol: md`**Holes measure energy downward.** A hole's potential energy is set by $E_v$ where it sits (lower $E_v$ on the page = higher hole potential energy); its kinetic energy is how far it sits **below** its own band edge; its total energy grows the lower it is drawn.

(A) **Hole 2**: it is furthest below its own valence-band edge. It can lose that kinetic energy as heat by relaxing up to $E_v$.
(B) **Hole 3**: region 3's valence band is the lowest on the page, furthest from $E_F$.
(C) **Hole 3**: it is drawn lowest on the page, so potential + kinetic is largest for it.
(D) **State 3**: it is furthest below $E_F$, and $f(E) = 1/(1 + e^{(E - E_F)/kT})$ is closest to 1 there. A state very likely filled by an electron is a state very unlikely to hold a hole; that is exactly why hole 3 has the most energy.` }),
    P({ src: 'HW2 · 1E (4 pts)', q: md`(E) The hole in region (3) has kinetic energy 2.5 eV. The hole effective mass is $1.5m_0$ and the conduction-band electron effective mass is $0.75m_0$. What is the kinetic energy of a conduction-band electron with the **same momentum** as this hole?`,
      parts: [N('KE_e', 5, 'eV')],
      sol: md`$KE = p^2/2m^*$, so $p = \sqrt{2m^*KE}$. Equal momenta:
$$2m_h^*KE_h = 2m_e^*KE_e\ \Rightarrow\ KE_e = KE_h\frac{m_h^*}{m_e^*} = 2.5\ \text{eV}\times\frac{1.5}{0.75} = 5\ \text{eV}$$
Lighter particle, same momentum, more kinetic energy.` }),

    R(md`### Problem 2 · Materials and band structure (20 pts)`),
    P({ src: 'HW2 · 2A (6 pts)', q: md`(A) i. Draw the $E$–$r$ (energy versus position) diagrams for an insulator, a semiconductor and a metal at 0 K. Label them and show where the electrons are. ii. State the difference between the insulator and the semiconductor diagrams at 0 K. How does the conduction band of a metal differ from theirs at 0 K?`,
      parts: [MC('ii. At 0 K, the metal differs from the other two because its conduction band…', ['is partly filled, or overlaps a filled band', 'is completely empty, as theirs are', 'is completely filled, like a valence band', 'lies inside a wider forbidden gap'], 0,
        [null, 'Empty bands at 0 K are what insulators and semiconductors have; a metal conducts even at 0 K.', 'A completely full band cannot carry current either.', 'Metals have no gap at the Fermi level.'])],
      figs: { er: fig('hw2-er-ans', 'E–r diagrams: insulator with a wide gap between a filled band and an empty band; semiconductor with a narrow gap; metal with a partially filled band or overlapping bands', 360, 'At 0 K: insulator (wide gap), semiconductor (narrow gap), metal (partly filled or overlapping bands).') },
      sol: md`[[fig:er]]

ii. Both insulators and semiconductors have a completely filled valence band and an empty conduction band at 0 K; the only difference is the gap: wide in an insulator (≳ 4 eV), narrow in a semiconductor (~1 eV), so heat or doping can populate a semiconductor's conduction band. A metal's conduction band is **partly filled** (or overlaps a filled band) even at 0 K, so it conducts at any temperature.` }),
    R(md`(B) Consider the $E$–$k$ diagram below (Fig. 2.1; energy in eV). Answer i–iv from it.`),
    P({ src: 'HW2 · 2B (14 pts)', q: md`i. Label the conduction band (CB), light-hole valence band (LHVB) and heavy-hole valence band (HHVB). Give your reasons. ii. Is this a direct or indirect band-gap material? Why? What is the band gap? iii. An electron has kinetic energy 1.2 eV. Mark its position on the diagram: at what energy is it? iv. Near the conduction-band minimum the curve follows $E = 5\times10^{-38}k^2$ J ($k$ in m⁻¹). Find the electron effective mass.`,
      fig: img('hw2-ek', 'E–k diagram: conduction band with a minimum near 2.5 eV at k = 0 and side valleys; two valence bands meeting at 0 eV at k = 0, one flat and one sharply curved; a third band near −2.4 eV', 380),
      parts: [MC('i. The heavy-hole band is the valence band that…', ['curves less (is flatter) at $k = 0$', 'curves more (is narrower) at $k = 0$', 'sits lower, near $-2.4$ eV', 'has the higher energy at $k = 0$'], 0,
          [null, 'More curvature means a smaller effective mass: that is the light-hole band.', 'That third band is the split-off band, not the heavy-hole band.', 'The two hole bands meet at the same energy at $k = 0$.']),
        FIX('ii. The gap is…', ['direct', 'indirect'], 0, [null, 'The CB minimum and VB maximum are both at $k = 0$.']),
        N('E_g', 2.5, 'eV', 0.05), N('iii.\\ E', 3.7, 'eV', 0.03), N('iv.\\ m^*/m_0', 0.122, '', 0.04)],
      figs: { ans: fig('hw2-ek-ans', 'the same E–k diagram labeled: CB on top, HHVB the flat valence band, LHVB the steep valence band, and a dot (D) on the conduction band at 3.7 eV', 380, 'Labeled diagram, with the 1.2 eV electron marked at 3.7 eV.') },
      sol: md`[[fig:ans]]

i. The **CB** is the band above the gap, curving upward away from its minimum (electrons gain energy moving away from it). The valence bands curve downward from their maximum. Effective mass is set by curvature, $m^* = \hbar^2/(d^2E/dk^2)$: the **flatter** valence band is the **heavy-hole** band, the sharply curved one the **light-hole** band. (The band near −2.4 eV is the split-off band.)

ii. **Direct**: the CB minimum and the VB maximum are both at $k = 0$. $E_g = 2.5 - 0 = 2.5$ eV.

iii. Kinetic energy is measured from the band edge: $E = 2.5 + 1.2 = 3.7$ eV. Any point where the CB crosses 3.7 eV is correct.

iv. $E = \hbar^2k^2/2m^*$, so $d^2E/dk^2 = \hbar^2/m^* = 2\times5\times10^{-38}$ J·m²:
$$m^* = \frac{(1.055\times10^{-34})^2}{1\times10^{-37}} = 1.11\times10^{-31}\ \text{kg} = 0.12m_0$$` }),

    R(md`### Problem 3 · Extrinsic and intrinsic materials (20 pts)

Silicon has $n_i = 1.5\times10^{10}$ cm⁻³ at 300 K.`),
    P({ src: 'HW2 · 3A (8 pts)', q: md`(A) The sample is intrinsic at 300 K. i. Find $n$. ii. Find $p$. iii. Briefly explain why $n = p$ in intrinsic material.`,
      parts: [N('n', 1.5e10, 'cm^{-3}'), N('p', 1.5e10, 'cm^{-3}')],
      sol: md`$n = p = n_i = 1.5\times10^{10}$ cm⁻³. With no dopants, the only source of carriers is thermal bond breaking, and every electron promoted to the conduction band leaves exactly one hole behind.` }),
    P({ src: 'HW2 · 3B (8 pts)', q: md`(B) Now the Si is doped with boron acceptors, $N_A = 1.0\times10^{16}$ cm⁻³, all ionized, at equilibrium, with no donors. i. Find the majority-carrier concentration. ii. Find the minority-carrier concentration from $np = n_i^2$. iii. Which carriers are majority and which minority?`,
      parts: [N('p_0', 1e16, 'cm^{-3}'), N('n_0', 2.25e4, 'cm^{-3}'), FIX('iii. Majority carriers are', ['electrons', 'holes'], 1, ['Boron accepts electrons, creating holes.', null])],
      sol: md`$p_0 \approx N_A = 1.0\times10^{16}$ cm⁻³ (since $N_A \gg n_i$). $n_0 = n_i^2/p_0 = 2.25\times10^{20}/10^{16} = 2.25\times10^4$ cm⁻³. Holes are the majority carriers, electrons the minority.` }),
    P({ src: 'HW2 · 3C (4 pts)', q: md`(C) Explain, with an energy-band diagram and words, why acceptors can create free holes in the valence band at relatively low temperatures, while intrinsic carrier generation needs much higher temperatures.`,
      sol: md`Draw $E_c$, $E_v$ and the acceptor level $E_a$ a short distance (~0.045 eV for B in Si) above $E_v$.

An acceptor creates a hole when a valence electron hops up into $E_a$. That costs only ~0.05 eV, about $2kT$ at room temperature, so nearly every acceptor is ionized even well below 300 K, each leaving a free hole in the valence band. Intrinsic generation requires lifting an electron across the **whole gap** ($E_g = 1.12$ eV ≈ $43kT$), which is exponentially less likely, so intrinsic carriers are scarce until the temperature is much higher. That is why the holes from acceptors dominate at room temperature.` }),

    R(md`### Problem 4 · Fermi–Dirac statistics and occupation probability (20 pts)`),
    P({ src: 'HW2 · 4A (12 pts)', q: md`(A) Calculate the probability that a state at the conduction-band edge of InP ($E_g = 1.35$ eV) is filled at 300 K, if the Fermi level is at: i. $E_F = E_c$; ii. $E_F = E_c - 6kT$; iii. $E_F = E_v$.`,
      parts: [N('i.\\ f(E_c)', 0.5, ''), N('ii.\\ f(E_c)', 2.47e-3, ''), N('iii.\\ f(E_c)', 2.31e-23, '', 0.15)],
      sol: md`$f(E) = 1/(1 + e^{(E - E_F)/kT})$ at $E = E_c$.
i. $E_c - E_F = 0$: $f = 1/2$ (true at the Fermi level by definition).
ii. $E_c - E_F = 6kT$: $f = 1/(1 + e^6) = 1/404.4 = 2.47\times10^{-3}$.
iii. $E_c - E_F = E_g = 1.35$ eV: $f = 1/(1 + e^{1.35/0.0259}) = e^{-52.1} = 2.3\times10^{-23}$.` }),
    P({ src: 'HW2 · 4B–C (8 pts)', q: md`(B) As the Fermi level shifts from the conduction band toward the valence band in (A), does the probability of finding a filled state at $E_c$ increase or decrease? Why? (C) Is the probability of finding an electron at $E_F + 1$ eV higher at 300 K or at 100 K? Why?`,
      parts: [FIX('(B) The probability…', ['increases', 'decreases', 'stays the same'], 1, ['Moving $E_F$ away from $E_c$ makes $E_c$ look higher above it.', null, '$f(E_c)$ depends on $E_c - E_F$, which grows.']),
        FIX('(C) Higher at…', ['300 K', '100 K', 'the same at both'], 0, [null, 'Colder means a sharper edge: fewer electrons above $E_F$.', '$f$ depends on $(E - E_F)/kT$, and $kT$ changes.'])],
      sol: md`(B) **Decreases.** $f(E_c) = 1/(1 + e^{(E_c - E_F)/kT})$, and $E_c - E_F$ grows as $E_F$ moves down: each $kT$ of extra distance divides the probability by about $e$.

(C) **Higher at 300 K.** $f(E_F + 1\ \text{eV}) \approx e^{-1\ \text{eV}/kT}$: at 300 K, $e^{-38.7} \approx 1.6\times10^{-17}$; at 100 K, $e^{-116} \approx 4\times10^{-51}$. Heating broadens the Fermi–Dirac step, so states above $E_F$ fill more.` }),
  ];

  // ================================================================ HW 3
  const hw3 = [
    intro(3, 'Friday, September 18, 2026', 'Carrier concentrations, temperature effects, band diagrams, resistance under doping. Unless stated otherwise: 300 K, $kT = 0.026$ eV, $n_i = 1.5\\times10^{10}$ cm⁻³. Four problems, 20 points each.'),
    R(md`### Problem 1 · Carrier concentration (20 pts)`),
    P({ src: 'HW3 · 1A (10 pts)', q: md`(A) Show that
$$n_0 = N_C\exp\left(-\frac{E_C - E_F}{k_BT}\right),\qquad p_0 = N_V\exp\left(-\frac{E_F - E_V}{k_BT}\right)$$
are equivalent to
$$n_0 = n_i\exp\left(\frac{E_F - E_i}{k_BT}\right),\qquad p_0 = n_i\exp\left(\frac{E_i - E_F}{k_BT}\right)$$
where $E_i$ is the intrinsic level.`,
      sol: md`In intrinsic material $E_F = E_i$ and $n_0 = p_0 = n_i$, so the same formulas give
$$n_i = N_C\exp\left(-\frac{E_C - E_i}{k_BT}\right),\qquad n_i = N_V\exp\left(-\frac{E_i - E_V}{k_BT}\right)$$
Split the exponent: $E_C - E_F = (E_C - E_i) - (E_F - E_i)$, so
$$n_0 = \left[N_Ce^{-(E_C - E_i)/k_BT}\right]e^{(E_F - E_i)/k_BT} = n_ie^{(E_F - E_i)/k_BT}$$
Likewise $E_F - E_V = (E_i - E_V) - (E_i - E_F)$ gives $p_0 = n_ie^{(E_i - E_F)/k_BT}$. The $n_i$ form simply measures $E_F$ from midgap instead of from the band edges.` }),
    P({ src: 'HW3 · 1B (10 pts)', q: md`(B) Derive $n_0p_0 = n_i^2$. When is this equation valid?`,
      parts: [MC('Valid when…', ['at equilibrium, in nondegenerate material', 'the sample is intrinsic, so that $n_0 = p_0 = n_i$ holds exactly', 'the sample is doped, whether or not it is in equilibrium', 'the temperature is 300 K, where $n_i = 1.5\\times10^{10}$ cm⁻³'], 0,
        [null, 'It holds in doped material too; that is its whole use.', 'Out of equilibrium (light, injection) $np \\ne n_i^2$.', 'It holds at any temperature, with that temperature’s $n_i$.'])],
      sol: md`Multiply the two results of (A): the exponents cancel,
$$n_0p_0 = n_i^2e^{(E_F - E_i)/k_BT}e^{(E_i - E_F)/k_BT} = n_i^2$$
This is the **mass-action law**. It needs (1) **thermal equilibrium** (one Fermi level for both carriers) and (2) the **Boltzmann approximation**, i.e. nondegenerate material with $E_F$ more than about $3k_BT$ from both band edges.` }),

    R(md`### Problem 2 · Temperature effects (20 pts)

Silicon doped with acceptors, $N_A = 1.0\times10^{17}$ cm⁻³, complete ionization. $n_i = 1.5\times10^{10}$ cm⁻³ at 300 K and $8.4\times10^{13}$ cm⁻³ at 500 K. $k_B = 8.617\times10^{-5}$ eV/K.`),
    P({ src: 'HW3 · 2A (6 pts)', q: md`(A) At room temperature, compare the mobilities of two Si samples doped with $N_D = 10^{15}$ and $N_D = 10^{19}$ cm⁻³. Which has the higher mobility, and why?`,
      parts: [FIX('Higher mobility', ['$N_D = 10^{15}$', '$N_D = 10^{19}$'], 0, [null, 'Ten thousand times more ionized donors scatter its electrons far more.'])],
      sol: md`The **$10^{15}$** sample. Mobility falls as doping rises because every ionized donor is a Coulomb scattering center: at $10^{19}$ cm⁻³ ionized-impurity scattering dominates and $\mu_n$ drops from ~1350 to ~100 cm²/V·s.` }),
    P({ src: 'HW3 · 2B (6 pts)', q: md`(B) The Fermi level relative to the intrinsic level is $E_F - E_i = -k_BT\ln(N_A/n_i)$. Calculate $E_F - E_i$ at 300 K and at 500 K. How does the Fermi level shift with temperature?`,
      parts: [N('300\\ \\text{K}:\\ E_F - E_i', -0.406, 'eV', 0.03), N('500\\ \\text{K}:\\ E_F - E_i', -0.305, 'eV', 0.03),
        FIX(md`On heating, $E_F$ moves…`, ['toward $E_i$', 'toward $E_v$', 'nowhere'], 0, [null, 'The hole count is fixed by $N_A$ while $n_i$ climbs, so $E_F$ approaches midgap.', '$E_F - E_i$ depends on $T$ through $kT$ and $n_i$.'])],
      sol: md`300 K: $\ln(10^{17}/1.5\times10^{10}) = 15.71$, so $E_F - E_i = -(0.02585)(15.71) = -0.41$ eV.
500 K: $kT = 0.0431$ eV and $\ln(10^{17}/8.4\times10^{13}) = 7.08$, so $E_F - E_i = -0.31$ eV.

As $T$ rises, $n_i$ grows much faster than $kT$, so $N_A/n_i$ and the log shrink: **$E_F$ moves toward $E_i$**. At high enough temperature the sample turns intrinsic and $E_F \to E_i$.` }),
    P({ src: 'HW3 · 2C (8 pts)', q: md`(C) Using charge neutrality and $n_0p_0 = n_i^2$, calculate the equilibrium electron concentration $n_0$ at 300 K and at 500 K. Is the semiconductor extrinsic or intrinsic at each temperature?`,
      parts: [N('n_0\\ (300\\ \\text{K})', 2.25e3, 'cm^{-3}'), N('n_0\\ (500\\ \\text{K})', 7.06e10, 'cm^{-3}'),
        FIX('At 500 K the sample is…', ['extrinsic', 'intrinsic'], 0, [null, '$p_0 \\approx N_A = 10^{17}$ is still about 1000× $n_i$.'])],
      sol: md`Neutrality with $N_D = 0$: $p_0 = n_0 + N_A$. With $p_0 = n_i^2/n_0$: $n_0(n_0 + N_A) = n_i^2$, so
$$n_0 = \frac{-N_A + \sqrt{N_A^2 + 4n_i^2}}{2} \approx \frac{n_i^2}{N_A}\quad(n_i \ll N_A)$$
300 K: $n_0 = (1.5\times10^{10})^2/10^{17} = 2.25\times10^3$ cm⁻³.
500 K: $n_0 = (8.4\times10^{13})^2/10^{17} = 7.06\times10^{10}$ cm⁻³.

Both are **extrinsic**: $p_0 \approx N_A \gg n_i$. At 500 K intrinsic carriers matter more ($n_0$ grew $3\times10^7$×), but the sample is still controlled by its doping. (Numerically, the quadratic formula with $N_A^2 \gg 4n_i^2$ cancels badly on a calculator; use the $n_i^2/N_A$ form.)` }),

    R(md`### Problem 3 · Band diagram (20 pts)

Si uniformly doped with acceptors, $N_A = 5\times10^{13}$ cm⁻³, at equilibrium, 300 K, complete ionization, $n_i = 1.5\times10^{10}$ cm⁻³.`),
    P({ src: 'HW3 · 3A (6 pts)', q: md`(A) Write the charge neutrality equation and use it to find the equilibrium hole and electron concentrations.`,
      parts: [N('p_0', 5e13, 'cm^{-3}'), N('n_0', 4.5e6, 'cm^{-3}')],
      sol: md`$p_0 - n_0 + N_D^+ - N_A^- = 0$. No donors and full ionization: $p_0 = n_0 + N_A$. Since $N_A \gg n_i$, $n_0$ is negligible: $p_0 \approx N_A = 5\times10^{13}$ cm⁻³ and $n_0 = n_i^2/p_0 = 2.25\times10^{20}/5\times10^{13} = 4.5\times10^6$ cm⁻³.` }),
    P({ src: 'HW3 · 3B (6 pts)', q: md`(B) Where is $E_F$ relative to $E_i$? Calculate $E_i - E_F$.`,
      parts: [N('E_i - E_F', 0.210, 'eV', 0.03)],
      sol: md`$E_i - E_F = kT\ln(p_0/n_i) = 0.0259\ln(5\times10^{13}/1.5\times10^{10}) = 0.0259\times8.11 = 0.21$ eV. $E_F$ lies **below** $E_i$ (p-type).` }),
    P({ src: 'HW3 · 3C (8 pts)', q: md`(C) Draw the equilibrium band diagram (position horizontally, energy vertically). Label $E_F$, $E_i$, $E_C$ and $E_V$ and their relative positions.`,
      figs: { b: fig('hw3-bands-ans', 'flat band diagram: Ec at top, Ei at midgap, EF 0.21 eV below Ei, Ev at bottom', 520, 'Flat bands (uniform doping): $E_F$ sits 0.21 eV below $E_i$, about 0.35 eV above $E_v$.') },
      sol: md`Uniform doping at equilibrium: all four lines are **flat**. $E_i$ sits near midgap (0.56 eV from each edge in Si); $E_F$ is 0.21 eV below $E_i$, so about 0.35 eV above $E_V$ and 0.77 eV below $E_C$.

[[fig:b]]` }),

    C.RF(md`### Problem 4 · Resistance under doping (20 pts)

A Si bar is 10 mm long with a 1 mm² cross-section, at 300 K ($n_i = 1.5\times10^{10}$ cm⁻³). Read mobilities from the figure (Fig. 3-23: mobility versus **total** impurity concentration $N_a + N_d$ at 300 K). Calculate the resistance:

[[fig:mob]]`, { mob: fig('mobility', 'Streetman Fig. 3-23: electron and hole mobility versus total impurity concentration for Si, Ge and GaAs at 300 K, log–log', 560, 'Fig. 3-23: mobility vs total impurity concentration, 300 K.') }),
    P({ src: 'HW3 · 4A–C (20 pts)', q: md`(A) without any doping; (B) doped with $5\times10^{17}$ cm⁻³ phosphorus; (C) doped with $5\times10^{17}$ cm⁻³ phosphorus **and** $2\times10^{16}$ cm⁻³ boron.`,
      parts: [N('(A)\\ R', 2.31e7, 'Ω', 0.06), N('(B)\\ R', 3.29, 'Ω', 0.12), N('(C)\\ R', 3.52, 'Ω', 0.12)],
      sol: md`$R = \dfrac{L}{\sigma A}$ with $L = 1$ cm and $A = 0.01$ cm².

(A) Intrinsic: $\mu_n \approx 1350$, $\mu_p \approx 450$ cm²/V·s.
$$\sigma = qn_i(\mu_n + \mu_p) = (1.6\times10^{-19})(1.5\times10^{10})(1800) = 4.32\times10^{-6}\ \text{S/cm},\quad R = \frac{1}{(4.32\times10^{-6})(0.01)} = 2.3\times10^{7}\ \Omega$$

(B) $N_D = 5\times10^{17}$: read $\mu_n \approx 380$ cm²/V·s. $\sigma \approx qN_D\mu_n = 30.4$ S/cm, $R = 1/(30.4\times0.01) = 3.3\ \Omega$.

(C) Electrons $= N_D - N_A = 4.8\times10^{17}$ cm⁻³, but the mobility is read at the **total** $N_D + N_A = 5.2\times10^{17}$: $\mu_n \approx 370$. $\sigma = q(4.8\times10^{17})(370) = 28.4$ S/cm, $R = 3.5\ \Omega$.

Adding acceptors raises $R$ twice over: fewer free electrons **and** more scattering centers.` }),
  ];

  // ================================================================ HW 4
  const hw4 = [
    intro(4, 'Friday, September 25, 2026', 'Doping and mobility, recombination and generation, Fermi-level invariance, optical absorption and photoconductivity. Four problems, 20 points each.'),
    R(md`### Problem 1 · Doping and mobility (20 pts)`),
    P({ src: 'HW4 · 1A (8 pts)', q: md`(A) Show that the minimum conductivity of a semiconductor occurs when $n_0 = n_i\sqrt{\mu_p/\mu_n}$, and give the expression for $\sigma_{min}$.`,
      parts: [MC(md`$\sigma_{min} =$`, [md`$2qn_i\sqrt{\mu_n\mu_p}$`, md`$qn_i(\mu_n + \mu_p)$`, md`$qn_i\sqrt{\mu_n\mu_p}$`, md`$2qn_i(\mu_n + \mu_p)$`], 0,
        [null, 'That is the intrinsic conductivity, which is **not** the minimum when $\\mu_n \\ne \\mu_p$.', 'Each of the two terms equals $qn_i\\sqrt{\\mu_n\\mu_p}$ at the minimum; add both.', 'Too large: that is twice the intrinsic value.'])],
      sol: md`At equilibrium $p_0 = n_i^2/n_0$:
$$\sigma = q\left(n_0\mu_n + \frac{n_i^2}{n_0}\mu_p\right),\qquad \frac{d\sigma}{dn_0} = q\left(\mu_n - \frac{n_i^2}{n_0^2}\mu_p\right) = 0\ \Rightarrow\ n_0 = n_i\sqrt{\frac{\mu_p}{\mu_n}}$$
Then $p_0 = n_i\sqrt{\mu_n/\mu_p}$, and both terms equal $qn_i\sqrt{\mu_n\mu_p}$:
$$\sigma_{min} = 2qn_i\sqrt{\mu_n\mu_p}$$
In Si ($\mu_n > \mu_p$) the minimum needs $n_0 < n_i$: slightly **p-type** material conducts less than intrinsic.` }),
    P({ src: 'HW4 · 1B (8 pts)', q: md`(B) Si is uniformly doped with $1\times10^{17}$ cm⁻³ phosphorus. Then $3\times10^{17}$ cm⁻³ boron is added. By roughly what factor does the resistivity change ($\rho_{new}/\rho_{old}$)? What is the conductivity type? (Use Fig. 3-23.)`,
      fig: img('mobility', 'mobility versus total impurity concentration, Si/Ge/GaAs, 300 K', 520),
      parts: [N('\\rho_{new}/\\rho_{old}', 2, '', 0.25), FIX('New type', ['n-type', 'p-type'], 1, ['The $3\\times10^{17}$ acceptors outnumber the $10^{17}$ donors.', null])],
      sol: md`Before: $n_0 \approx 10^{17}$, $\mu_n \approx 800$ cm²/V·s (read at total $10^{17}$).
After: $p_0 \approx N_A - N_D = 2\times10^{17}$ (**p-type**), $\mu_p \approx 200$ cm²/V·s (read at the **total** $4\times10^{17}$).
$$\frac{\rho_{new}}{\rho_{old}} = \frac{n_{0,old}\mu_{n,old}}{p_{0,new}\mu_{p,new}} = \frac{(10^{17})(800)}{(2\times10^{17})(200)} = 2$$
The resistivity roughly **doubles** (1.5–2.5 is fine, depending on your chart reading): there are twice as many carriers, but they are holes, which move four times slower here.` }),
    P({ src: 'HW4 · 1C (4 pts)', q: md`(C) Higher conductivity is often preferred. Which doping type should be used, whenever possible, to achieve it?`,
      parts: [FIX('Use', ['n-type', 'p-type'], 0, [null, 'Holes are slower in Si: the same doping gives about 2–3× lower conductivity.'])],
      sol: md`**n-type.** For comparable majority concentrations, $\sigma_n = qn\mu_n$ beats $\sigma_p = qp\mu_p$ because $\mu_n > \mu_p$ in Si (Fig. 3-23) at every doping level.` }),

    R(md`### Problem 2 · Recombination and generation (20 pts)

p-type Si at 300 K, $N_A = 3\times10^{16}$ cm⁻³. Excess carrier lifetimes $\tau_n = \tau_p = 1$ µs.`),
    P({ src: 'HW4 · 2A (8 pts)', q: md`(A) Determine the thermal-equilibrium recombination rate of electrons. Is the equilibrium recombination rate of holes equal to that of electrons? Briefly explain.`,
      parts: [N('R_{n0}', 7.5e9, 'cm^{-3}s^{-1}'), FIX('Equal hole rate?', ['yes', 'no'], 0, [null, 'Each recombination event removes one electron and one hole.'])],
      sol: md`$p_0 \approx N_A = 3\times10^{16}$, $n_0 = n_i^2/p_0 = 2.25\times10^{20}/3\times10^{16} = 7.5\times10^3$ cm⁻³.
$$R_{n0} = \frac{n_0}{\tau_n} = \frac{7.5\times10^3}{10^{-6}} = 7.5\times10^{9}\ \text{cm}^{-3}\text{s}^{-1}$$
**Yes**, the hole rate is the same: every recombination event removes one electron **and** one hole (and at equilibrium it equals the thermal generation rate).` }),
    P({ src: 'HW4 · 2B–C (12 pts)', q: md`(B) Under continuous illumination the steady-state excess concentrations are $\delta n = \delta p = 5\times10^{14}$ cm⁻³. Is this low-level or high-level injection? Justify. (C) Calculate the optical generation rate $g_{op}$ needed to maintain them at steady state.`,
      parts: [FIX('(B) Injection level', ['low-level', 'high-level'], 0, [null, 'Compare with the **majority** concentration: $5\\times10^{14} \\ll 3\\times10^{16}$.']), N('(C)\\ g_{op}', 5e20, 'cm^{-3}s^{-1}')],
      sol: md`(B) **Low-level**: $\delta p = 5\times10^{14} \ll p_0 = 3\times10^{16}$, so the majority concentration barely changes (1.7%), even though the minority concentration rises $7\times10^{10}$-fold.

(C) Steady state: generation = recombination, $g_{op} = \delta n/\tau_n = 5\times10^{14}/10^{-6} = 5\times10^{20}$ cm⁻³s⁻¹.` }),

    R(md`### Problem 3 · Fermi-level invariance (20 pts)

Sample 1 is doped Si with $E_{F1} - E_i = 0.3$ eV; sample 2 is doped Si with $E_{F2} - E_i = -0.3$ eV. Take $E_g = 1.1$ eV (with $E_i$ at midgap).`),
    P({ src: 'HW4 · 3A (8 pts)', q: md`(A) Draw the individual band diagrams at 300 K of samples 1 and 2, not touching. Label $E_c$, $E_v$, $E_{F1}$, $E_{F2}$, $E_i$ and the distances between them.`,
      parts: [N('E_{c1} - E_{F1}', 0.25, 'eV'), N('E_{c2} - E_{F2}', 0.85, 'eV')],
      figs: { a: fig('hw4-sep-ans', 'two separate band diagrams: sample 1 with EF 0.25 eV below Ec and 0.3 eV above Ei; sample 2 with EF 0.3 eV below Ei and 0.25 eV above Ev', 520, 'Separate samples: n-type (1) and p-type (2).') },
      sol: md`$E_c - E_i = E_i - E_v = 0.55$ eV. Sample 1 (n-type): $E_F$ 0.3 eV above $E_i$, so 0.25 eV below $E_c$. Sample 2 (p-type): $E_F$ 0.3 eV below $E_i$, so 0.25 eV above $E_v$ and 0.85 eV below $E_c$.

[[fig:a]]` }),
    P({ src: 'HW4 · 3B–C (12 pts)', q: md`(B) Samples 1 and 2 are brought together into a perfect junction. Ignoring the shape of the bands near the junction, draw the equilibrium band diagram, paying attention to $E_F$ through the whole structure and to $E_c$, $E_v$, $E_i$ away from the junction. (C) From your diagram: if an electron in sample 1 had the same total energy as an electron at the conduction-band edge of sample 2, how much kinetic energy would it have?`,
      parts: [N('(B)\\ E_{c2} - E_{c1}', 0.6, 'eV'), N('(C)\\ KE', 0.6, 'eV')],
      figs: { b: fig('hw4-junction-ans', 'junction band diagram: one flat EF through both samples; sample 2’s bands sit 0.6 eV higher than sample 1’s', 460, 'At equilibrium $E_F$ is flat, so sample 2’s bands sit 0.6 eV above sample 1’s.') },
      sol: md`(B) At equilibrium there is **one flat Fermi level**. Each side keeps its own band positions relative to $E_F$, so sample 2's bands must sit higher by $(E_{F1} - E_i) + (E_i - E_{F2}) = 0.3 + 0.3 = 0.6$ eV (the built-in step).

[[fig:b]]

(C) Sample 2's conduction-band edge is 0.6 eV above sample 1's. An electron in sample 1 at that energy sits 0.6 eV above its own $E_{c1}$:
$$KE = (E_{c2} - E_{F2}) - (E_{c1} - E_{F1}) = 0.85 - 0.25 = 0.6\ \text{eV}$$
the same as the band offset (the built-in potential energy).` }),

    C.RF(md`### Problem 4 · Optical absorption and photoconductivity (20 pts)

Use the absorption chart (Fig. 4.1) and Appendix III (Fig. 4.2) below.

[[fig:abs]]
[[fig:app]]`, {
      abs: fig('absorption', 'absorption coefficient versus wavelength (200–1400 nm, log scale 1 to 10^7 per cm) for GaAs, Ge, Si, InP, CdTe, CdS and amorphous Si', 560, 'Fig. 4.1: absorption coefficient of several semiconductors.'),
      app: fig('appendix3', 'Appendix III table of semiconductor properties: band gaps, mobilities, effective masses, lattice constants and densities', 560, 'Fig. 4.2: Appendix III (band gaps: GaAs 1.43 eV, CdS 2.42 eV).'),
    }),
    P({ src: 'HW4 · 4A (6 pts)', q: md`(A) For GaAs and CdS, find (i) the wavelength corresponding to the band-gap energy and (ii) the wavelength at which the absorption coefficient is $\alpha = 1000$ cm⁻¹.`,
      parts: [N('\\text{GaAs (i)}', 867, 'nm', 0.02), N('\\text{GaAs (ii)}', 860, 'nm', 0.03), N('\\text{CdS (i)}', 512, 'nm', 0.02), N('\\text{CdS (ii)}', 560, 'nm', 0.04)],
      sol: md`GaAs: $E_g = 1.43$ eV, $\lambda = 1240/1.43 = 867$ nm. The chart reaches $\alpha = 10^3$ cm⁻¹ at about **860 nm**.
CdS: $E_g = 2.42$ eV, $\lambda = 1240/2.42 = 512$ nm. The chart reaches $\alpha = 10^3$ cm⁻¹ at about **560 nm**.

GaAs is direct: α shoots up right at its gap, so the two wavelengths nearly coincide. The CdS curve in this chart has a tail extending past 512 nm (sub-gap absorption in that data), which is why (ii) is longer than (i) there.` }),
    P({ src: 'HW4 · 4B (10 pts)', q: md`(B) A 4-µm-thick Si sample is illuminated with 800 nm light at 1 mW optical power. What is the absorption coefficient of Si here? How many electron–hole pairs are created per second (100% quantum efficiency, 30% of the incident light reflected)?`,
      parts: [N('\\alpha', 850, 'cm^{-1}', 0.25), N('\\text{EHP/s}', 8.15e14, 's^{-1}', 0.2)],
      sol: md`Chart: $\alpha(800\ \text{nm}) \approx 850$ cm⁻¹ for Si.
Power entering: $0.7\times1$ mW $= 0.7$ mW. Transmitted through 4 µm: $0.7e^{-850\times4\times10^{-4}} = 0.7e^{-0.34} = 0.498$ mW. Absorbed: $0.7 - 0.498 = 0.202$ mW.
Photon energy: $hc/\lambda = 1.55$ eV $= 2.48\times10^{-19}$ J, so
$$N_{EHP} = \frac{0.202\times10^{-3}\ \text{W}}{2.48\times10^{-19}\ \text{J}} = 8.15\times10^{14}\ \text{s}^{-1}$$
Only 29% of the entering light is absorbed: Si is a weak absorber at 800 nm (indirect gap).` }),
    P({ src: 'HW4 · 4C (4 pts)', q: md`(C) The Si sample of (B) is 500 µm long, 250 µm wide and 4 µm thick. If the pairs from (B) are generated evenly through the sample, what is the optical generation rate $g_{op}$ (pairs per second per unit volume)?`,
      parts: [N('g_{op}', 1.63e21, 'cm^{-3}s^{-1}', 0.2)],
      sol: md`$V = (500\times250\times4)\ \mu\text{m}^3 = 5\times10^5\ \mu\text{m}^3 = 5\times10^{-7}$ cm³ (1 µm³ = $10^{-12}$ cm³).
$$g_{op} = \frac{8.15\times10^{14}}{5\times10^{-7}} = 1.63\times10^{21}\ \text{cm}^{-3}\text{s}^{-1}$$` }),
  ];


  // ================================================================ HW 5
  const hw5 = [
    intro(5, 'Friday, October 2, 2026', 'Steady-state generation and quasi-Fermi levels, drift and diffusion on band diagrams, diffusion in InP, diffusion length and stored charge. Four problems, 20 points each.'),
    R(md`### Problem 1 · Steady-state carrier generation; quasi-Fermi levels (20 pts)

Si doped with $N_D = 2\times10^{16}$ cm⁻³ is excited uniformly with $g_{op} = 10^{19}$ EHP/cm³·s at 300 K. Thermal generation rate $g(T) = 4.5\times10^{10}$ cm⁻³s⁻¹; $D_n = 30$ and $D_p = 10$ cm²/s.`),
    P({ src: 'HW5 · 1A (2 pts)', q: md`(A) Find the thermal-equilibrium concentrations $n_0$ and $p_0$.`,
      parts: [N('n_0', 2e16, 'cm^{-3}'), N('p_0', 1.125e4, 'cm^{-3}')],
      sol: md`$n_0 \approx N_D = 2\times10^{16}$ cm⁻³; $p_0 = n_i^2/n_0 = 2.25\times10^{20}/2\times10^{16} = 1.125\times10^4$ cm⁻³.` }),
    P({ src: 'HW5 · 1B (6 pts)', q: md`(B) State the low-level-injection and steady-state band-to-band recombination assumptions. Using them, simplify the balance $g(T) + g_{op} = \alpha_rnp$ into an expression for $\delta p$.`,
      parts: [MC('δp ≈', [md`$\dfrac{g_{op}}{\alpha_r(n_0 + p_0)}$`, md`$\dfrac{g_{op}}{\alpha_r\,p_0}$`, md`$\sqrt{\dfrac{g_{op}}{\alpha_r}}$`, md`$\dfrac{g_{op} + g(T)}{\alpha_r\,n_0}$`], 0,
        [null, 'Excess holes recombine with the plentiful **electrons**: the rate constant involves $n_0$.', 'That is the high-level result, where $\\delta n = \\delta p \\gg n_0$.', 'Thermal generation is already balanced by equilibrium recombination; only $g_{op}$ makes excess.'])],
      sol: md`**Band-to-band, steady state:** pairs are made and destroyed together, so $\delta n = \delta p$, and the recombination rate is $\alpha_rnp$.
**Low-level injection:** $\delta p \ll n_0$, so the majority density is unchanged, $n \approx n_0$.
$$g(T) + g_{op} = \alpha_r(n_0 + \delta n)(p_0 + \delta p) \approx \alpha_rn_0p_0 + \alpha_r(n_0 + p_0)\delta p$$
(dropping $\delta n\,\delta p$). Since $g(T) = \alpha_rn_0p_0$ at equilibrium,
$$\delta p \approx \frac{g_{op}}{\alpha_r(n_0 + p_0)}$$` }),
    P({ src: 'HW5 · 1C–D (6 pts)', q: md`(C) Solve for $\delta p$. (D) Find the steady-state $n$ and $p$. Check that the low-level assumption holds.`,
      parts: [N('\\delta p', 2.5e12, 'cm^{-3}'), N('n', 2e16, 'cm^{-3}'), N('p', 2.5e12, 'cm^{-3}')],
      sol: md`Use $g(T) = \alpha_rn_i^2$ to eliminate $\alpha_r = g(T)/n_i^2$:
$$\delta p = \frac{g_{op}n_i^2}{g(T)(n_0 + p_0)} = \frac{(10^{19})(2.25\times10^{20})}{(4.5\times10^{10})(2\times10^{16})} = 2.5\times10^{12}\ \text{cm}^{-3}$$
$n = n_0 + \delta n \approx 2\times10^{16}$; $p = p_0 + \delta p \approx 2.5\times10^{12}$ cm⁻³. Low level holds: $\delta p/n_0 \approx 10^{-4}$. (The lifetime here is $\tau_p = \delta p/g_{op} = 0.25$ µs.)` }),
    P({ src: 'HW5 · 1E–F (6 pts)', q: md`(E) Calculate the quasi-Fermi-level separation $F_n - F_p$. (F) Calculate the change in conductivity on illumination.`,
      parts: [N('F_n - F_p', 0.498, 'eV', 0.02), N('\\Delta\\sigma', 6.18e-4, 'S/cm', 0.03)],
      sol: md`(E) $F_n - E_i = kT\ln(n/n_i) = 0.0259\ln(2\times10^{16}/1.5\times10^{10}) = 0.365$ eV. $E_i - F_p = 0.0259\ln(2.5\times10^{12}/1.5\times10^{10}) = 0.133$ eV.
$$F_n - F_p = 0.365 + 0.133 = 0.498\ \text{eV}$$
(Check: $np/n_i^2 = 5\times10^{28}/2.25\times10^{20} = 2.2\times10^{8} = e^{0.498/0.0259}$.)

(F) Mobilities from Einstein: $\mu_n = D_n/(kT/q) = 30/0.0259 = 1158$, $\mu_p = 10/0.0259 = 386$ cm²/V·s.
$$\Delta\sigma = q\,\delta p(\mu_n + \mu_p) = (1.6\times10^{-19})(2.5\times10^{12})(1544) = 6.18\times10^{-4}\ \text{S/cm}$$` }),

    C.RF(md`### Problem 2 · Diffusion and drift of carriers (20 pts)

The **equilibrium** band diagram below (Fig. 2.1) shows a portion of a semiconductor with a built-in field ℰ. The Fermi level passes through the marked point.

[[fig:b]]`, { b: fig('hw5-bands', 'equilibrium band diagram: Ec, Ei (dashed) and Ev all rise linearly to the right; a dot marks EF on Ei at the middle', 560, 'Fig. 2.1: equilibrium band diagram with a built-in field.') }),
    P({ src: 'HW5 · 2A–B (12 pts)', q: md`(A) Sketch the Fermi level across the whole width of the diagram. (B) Sketch and label $\log n$ and $\log p$ versus position on one graph. Label the slopes and where $\log n_i$ is.`,
      parts: [MC(md`(A) Across the sample, $E_F$ is…`, ['horizontal, through the marked point', 'parallel to $E_i$, through the marked point', 'tilted opposite to the bands', 'defined only at the marked point'], 0,
          [null, 'A tilted $E_F$ means current flows; this is equilibrium.', 'Any tilt of $E_F$ would drive a current.', 'At equilibrium one Fermi level spans the whole sample.']),
        MC('(B) Moving to the right, log n…', ['falls linearly while log p rises linearly', 'rises linearly while log p falls linearly', 'and log p both fall, keeping n = p', 'and log p both stay at log n_i'], 0,
          [null, 'To the right $E_i$ rises past the flat $E_F$, so $E_F - E_i$ shrinks: fewer electrons, more holes.', 'Their product stays $n_i^2$: one rises as the other falls.', 'Only at the marked point is $n = p = n_i$.'])],
      figs: { ef: fig('hw5-ef-ans', 'the same band diagram with EF drawn flat through the marked point', 520, '(A) Equilibrium: $E_F$ is flat.'), c: fig('hw5-conc-ans', 'log n falls linearly and log p rises linearly with position, crossing at log ni directly above the point where EF meets Ei', 520, '(B) log n and log p are straight lines crossing at log n_i.') },
      sol: md`(A) Equilibrium means **one flat Fermi level** through the marked point.

[[fig:ef]]

(B) $n_0 = n_ie^{(E_F - E_i)/kT}$ and $p_0 = n_ie^{(E_i - E_F)/kT}$. $E_F$ is flat and $E_i$ rises linearly, so $\ln n_0$ falls linearly and $\ln p_0$ rises linearly:
$$\frac{d\ln n_0}{dx} = -\frac{1}{kT}\frac{dE_i}{dx},\qquad \frac{d\ln p_0}{dx} = +\frac{1}{kT}\frac{dE_i}{dx}$$
(in base 10, multiply by $\log e = 0.434$). The lines cross at $\log n_i$ exactly where $E_F = E_i$: left of it the material is n-type, right of it p-type.

[[fig:c]]` }),
    P({ src: 'HW5 · 2C–D (8 pts)', q: md`(C) Determine the direction of the electric field ℰ. Give the directions of the electron flows and of the corresponding electron drift and diffusion currents. (D) Repeat for holes. ($+x$ = to the right.)`,
      parts: [FIX('Field ℰ', XY, 0, [null, 'The bands rise to the right: ℰ = (1/q) dE_i/dx points that way.']),
        FIX('Electron drift flow', XY, 1, ['Electrons move against the field.', null]), FIX('Electron diffusion flow', XY, 0, [null, 'Electrons are crowded on the left (n-type side) and spread right.']),
        FIX('Electron drift current', XY, 0, [null, 'Current is opposite to electron flow.']), FIX('Electron diffusion current', XY, 1, ['Current is opposite to electron flow.', null]),
        FIX('Hole drift flow', XY, 0, [null, 'Holes move with the field.']), FIX('Hole diffusion flow', XY, 1, ['Holes are crowded on the right (p-type side) and spread left.', null]),
        FIX('Hole drift current', XY, 0, [null, 'Hole current follows hole flow.']), FIX('Hole diffusion current', XY, 1, ['Hole current follows hole flow.', null])],
      sol: md`**Field:** $\mathscr{E} = -dV/dx = \frac1q\frac{dE_i}{dx}$. The bands rise to the right, so **ℰ points $+x$**.

| | drift flow | diffusion flow | drift current | diffusion current |
|---|---|---|---|---|
| electrons | $-x$ | $+x$ | $+x$ | $-x$ |
| holes | $+x$ | $-x$ | $+x$ | $-x$ |

At equilibrium each carrier's drift current exactly cancels its diffusion current, which is why every row has opposite current directions.` }),

    R(md`### Problem 3 · Electron diffusion in InP (20 pts)

At 300 K a piece of InP has the majority-electron profile $n(x) = N_De^{-x/\alpha}$ with $\alpha > 0$, cross-sectional area $A_0$ in the y–z plane.`),
    P({ src: 'HW5 · 3A–C (10 pts)', q: md`(A) Derive an expression for the electron diffusion current through the piece. (B) Which way do the electrons diffuse? Explain. (C) Assuming equilibrium, find an expression for the electric field.`,
      parts: [MC(md`(A) $I_{n,\text{diff}} =$`, [md`$-\dfrac{qA_0D_nN_D}{\alpha}e^{-x/\alpha}$`, md`$+\dfrac{qA_0D_nN_D}{\alpha}e^{-x/\alpha}$`, md`$-qA_0D_nN_D\,\alpha\,e^{-x/\alpha}$`, md`$-\dfrac{qA_0D_nN_D}{\alpha}e^{+x/\alpha}$`], 0,
          [null, 'Sign: $dn/dx < 0$, and $J_n = +qD_n\\,dn/dx$.', 'Differentiating $e^{-x/\\alpha}$ brings down $1/\\alpha$, not $\\alpha$.', 'The profile decays as $e^{-x/\\alpha}$; so does its slope.']),
        FIX('(B) Electrons diffuse toward', XY, 0, [null, 'They flow from high to low concentration: $n$ falls with $x$.']),
        MC('(C) ℰ =', [md`$+\dfrac{kT}{q\alpha}$`, md`$-\dfrac{kT}{q\alpha}$`, md`$+\dfrac{q\alpha}{kT}$`, md`$+\dfrac{kT\alpha}{q}$`], 0,
          [null, 'The field must push electrons back toward $-x$, so it points $+x$.', 'Units: this is not a field.', 'Units: this is not a field.'])],
      sol: md`(A) $J_{n,diff} = qD_n\dfrac{dn}{dx} = -\dfrac{qD_nN_D}{\alpha}e^{-x/\alpha}$, so $I_{n,diff} = A_0J_{n,diff} = -\dfrac{qA_0D_nN_D}{\alpha}e^{-x/\alpha}$ (pointing $-x$).

(B) **Toward $+x$**: particles diffuse from high to low concentration, and $n$ falls with $x$. Their current points $-x$ because they are negative.

(C) Equilibrium: $J_n = qD_n\dfrac{dn}{dx} + q\mu_nn\mathscr{E} = 0$, so
$$\mathscr{E} = -\frac{D_n}{\mu_n}\frac{1}{n}\frac{dn}{dx} = \frac{D_n}{\mu_n}\frac{1}{\alpha} = \frac{kT}{q\alpha}$$
a uniform field along $+x$ that drifts electrons back toward $-x$.` }),
    P({ src: 'HW5 · 3D (4 pts)', q: md`(D) InP at 300 K has electron mobility 4000 cm²/V·s and lifetime $\tau_n = 8$ µs. Find $D_n$ and $L_n$.`,
      parts: [N('D_n', 103.6, 'cm^2/s'), N('L_n', 288, 'μm')],
      sol: md`$D_n = (kT/q)\mu_n = 0.0259\times4000 = 103.6$ cm²/s. $L_n = \sqrt{D_n\tau_n} = \sqrt{103.6\times8\times10^{-6}} = 2.88\times10^{-2}$ cm $= 288$ µm.` }),
    P({ src: 'HW5 · 3E–G (6 pts)', q: md`The diffusion equation for electrons is $\dfrac{\partial\delta n}{\partial t} = D_n\dfrac{\partial^2\delta n}{\partial x^2} - \dfrac{\delta n}{\tau_n}$ and $J_n = qD_n\dfrac{\partial\delta n}{\partial x}$. (E) Define steady state and apply it to get a simplified equation that contains the diffusion length. (F) Write the general solution as a sum of two exponentials. (G) Apply the boundary conditions $\delta n(0) = \Delta n$ and $\delta n(L) = 0$, where $L$ is the sample length (you need not solve them).`,
      parts: [MC('(E) Steady state gives', [md`$\dfrac{d^2\delta n}{dx^2} = \dfrac{\delta n}{L_n^2}$`, md`$\dfrac{d^2\delta n}{dx^2} = -\dfrac{\delta n}{L_n^2}$`, md`$\dfrac{d\delta n}{dx} = \dfrac{\delta n}{L_n}$`, md`$\dfrac{d^2\delta n}{dx^2} = \dfrac{\delta n}{\tau_n}$`], 0,
          [null, 'That would give sines and cosines, not decaying exponentials.', 'That is first order: one exponential, not the general solution.', 'Units: divide by $D_n$ too, $L_n^2 = D_n\\tau_n$.']),
        MC('(F) General solution', [md`$Ae^{x/L_n} + Be^{-x/L_n}$`, md`$A\cos(x/L_n) + B\sin(x/L_n)$`, md`$Ae^{-x/L_n}$ only`, md`$A + Bx$`], 0,
          [null, 'Those solve the equation with the opposite sign.', 'That is the semi-infinite special case.', 'That is the short-region limit with no recombination.'])],
      sol: md`(E) **Steady state**: nothing changes with time, $\partial\delta n/\partial t = 0$. Then
$$\frac{d^2\delta n}{dx^2} = \frac{\delta n}{D_n\tau_n} = \frac{\delta n}{L_n^2}$$
(F) $\delta n(x) = Ae^{x/L_n} + Be^{-x/L_n}$.
(G) $\delta n(0) = A + B = \Delta n$ and $\delta n(L) = Ae^{L/L_n} + Be^{-L/L_n} = 0$. (Solving gives $\delta n = \Delta n\,\sinh[(L - x)/L_n]/\sinh(L/L_n)$; for $L \gg L_n$ this becomes $\Delta n\,e^{-x/L_n}$.)` }),

    R(md`### Problem 4 · Carrier diffusion in p-type silicon (20 pts)

A very long p-type Si sample lies along $x$ with cross-section $A = 1$ cm². Electrons are injected so that the steady-state excess electron concentration at $x = 0$ is $10^{18}$ cm⁻³.`),
    P({ src: 'HW5 · 4A–B (6 pts)', q: md`(A) With $\mu_n = 1000$ cm²/V·s and $\tau_n = 100$ ps, calculate $D_n$ and $L_n$. (B) Write $\delta n(x)$.`,
      parts: [N('D_n', 25.9, 'cm^2/s'), N('L_n', 0.509, 'μm'),
        MC('(B) δn(x) =', [md`$10^{18}e^{-x/L_n}$`, md`$10^{18}(1 - x/L_n)$`, md`$10^{18}e^{-x/(D_n\tau_n)}$`, md`$10^{18}e^{-x^2/L_n^2}$`], 0,
          [null, 'Linear profiles belong to short regions; this one is very long.', 'Units: $D_n\\tau_n$ is a length squared.', 'A Gaussian describes a spreading pulse, not a steady state.'])],
      sol: md`$D_n = 0.0259\times1000 = 25.9$ cm²/s. $L_n = \sqrt{25.9\times10^{-10}} = 5.09\times10^{-5}$ cm $= 0.509$ µm.
Very long sample: $\delta n(x) = \delta n(0)e^{-x/L_n} = 10^{18}e^{-x/L_n}$ cm⁻³.` }),
    P({ src: 'HW5 · 4C (6 pts)', q: md`(C) By integration, calculate the total stored excess electron charge $Q_n$. Then give an intuitive interpretation of the diffusion length.`,
      parts: [N('|Q_n|', 8.14e-6, 'C')],
      sol: md`$$|Q_n| = qA\int_0^\infty\delta n(0)e^{-x/L_n}dx = qAL_n\delta n(0) = (1.6\times10^{-19})(1)(5.09\times10^{-5})(10^{18}) = 8.14\times10^{-6}\ \text{C}$$
The stored charge equals a slab of uniform density $\delta n(0)$ and thickness $L_n$: **$L_n$ is the average distance an injected electron diffuses before it recombines.**` }),
    P({ src: 'HW5 · 4D–E (8 pts)', q: md`(D) Write the electron diffusion current $I_n(x)$. Where is it largest, and what is it there? What is it at $x = \infty$? (E) Current in a metal wire is the same at every position (current continuity). Does your answer to (D) violate current continuity? Why or why not? Hint: think about the meaning of $\tau_n$.`,
      parts: [N('|I_n|_{max}', 8.14e4, 'A'), FIX('Largest at', ['$x = 0$', '$x = L_n$', '$x \\to \\infty$'], 0, [null, 'The slope of $e^{-x/L_n}$ is steepest at $x = 0$.', 'It vanishes there.']),
        MC('(E) Continuity is…', ['not violated: holes take over the current', 'violated: charge disappears as the electrons recombine', 'not violated, because the diffusion current is constant', 'violated, unless the sample is shorter than $L_n$'], 0,
          [null, 'Recombination destroys a pair, not net charge; the hole current makes up the difference.', 'It decays as $e^{-x/L_n}$.', 'Continuity holds for any length.'])],
      sol: md`(D) $I_n(x) = qAD_n\dfrac{d\delta n}{dx} = -qA\dfrac{D_n}{L_n}\delta n(0)e^{-x/L_n}$. The electrons diffuse toward $+x$, so the electron current points $-x$ (the official key quotes the magnitude). It is largest at $x = 0$:
$$|I_n(0)| = (1.6\times10^{-19})(1)\frac{25.9}{5.09\times10^{-5}}(10^{18}) = 8.14\times10^4\ \text{A}$$
(enormous because τ = 100 ps makes $L_n$ tiny and the gradient steep). At $x = \infty$, $I_n = 0$.

(E) **No.** Continuity applies to the **total** current. Each electron that recombines (after about $\tau_n$) meets a hole; the holes that disappear are resupplied by a hole (majority) current flowing in from the contact. So the electron diffusion current shrinks with $x$ while the hole current grows, and $I_n + I_p$ is the same everywhere.` }),
  ];

  C.unit({
    id: 'e1-hw', exam: 'e1', tools: true, num: 'Exam 1', title: 'Past homework (blank, with solutions)',
    lessons: [
      { id: 'hw1', title: 'HW 1 · units, crystals, bonding, epitaxy', kind: 'exam', steps: hw1 },
      { id: 'hw2', title: 'HW 2 · carrier energy, E–k, doping, Fermi–Dirac', kind: 'exam', steps: hw2 },
      { id: 'hw3', title: 'HW 3 · concentrations, temperature, resistance', kind: 'exam', steps: hw3 },
      { id: 'hw4', title: 'HW 4 · mobility, recombination, junctions, absorption', kind: 'exam', steps: hw4 },
      { id: 'hw5', title: 'HW 5 · quasi-Fermi levels, drift–diffusion, diffusion length', kind: 'exam', steps: hw5 },
    ],
  });
})();

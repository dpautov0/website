/* Complete theory for Exam 1: the sections a first pass summarized in a sentence or skipped (materials and bonding,
   crystal growth and epitaxy, E–r and E–k diagrams with light and heavy holes, alloys, quantum wells, where drift,
   diffusion and the Hall effect come from, high-field effects), plus a "keep in mind" checklist for every topic.
   e1-tools.js places THEORY[id].read after "The model in brief", THEORY[id].keep before the worked example, and
   THEORY[id].qs with the lesson's questions. */
(function () {
  'use strict';
  const { R, RF: RFig, P, Q } = C;
  const TH = (window.THEORY = window.THEORY || {});

  // E–r (energy versus position) pictures of an insulator, a semiconductor and a metal at 0 K
  function erFig() {
    const f = PF.fig({ alt: 'energy versus position at 0 K: insulator with a wide gap, semiconductor with a narrow gap, metal with a partly filled band' });
    const col = (x0, lab, gapTop, gapBot, fillTo) => {
      f.rect(x0, 20, 80, gapTop - 20, { cls: 'shade' }); f.rect(x0, gapBot, 80, 150 - gapBot, { cls: 'shade' });
      f.line(x0, gapTop, x0 + 80, gapTop, { cls: 'curve' }); f.line(x0, gapBot, x0 + 80, gapBot, { cls: 'curve' });
      for (let y = fillTo; y < 150; y += 7) for (let x = x0 + 6; x < x0 + 80; x += 10) f.dot(x, y + 3, 1.6);
      f.text(x0 + 40, 160, lab, 't', 'small');
    };
    col(10, 'insulator', 40, 120, 120);
    col(110, 'semiconductor', 64, 92, 92);
    f.rect(210, 20, 80, 130, { cls: 'shade' }); f.line(210, 20, 290, 20, { cls: 'curve' });
    for (let y = 80; y < 150; y += 7) for (let x = 216; x < 290; x += 10) f.dot(x, y + 3, 1.6);
    f.line(206, 80, 294, 80, { cls: 'dash' }); f.label(296, 80, 'E_F', 'l', 'small'); f.text(250, 160, 'metal', 't', 'small');
    f.label(50, 80, 'E_g\\ \\text{(wide)}', 'c', 'small'); f.label(150, 78, 'E_g', 'c', 'small');
    return f.svg();
  }

  // E–k near k = 0: conduction band, heavy-hole and light-hole valence bands
  function lhhhFig() {
    return PF.plot({
      w: 340, h: 230, x: [-1, 1], y: [-1.15, 1.3], xl: 'k', yl: 'E', xt: [[0, '0']], yt: [],
      curves: [{ f: (k) => 0.35 + 0.9 * k * k, lab: '\\text{CB}', labAt: 0.85, dx: 4, dy: 0 },
        { f: (k) => -0.35 - 0.35 * k * k, lab: '\\text{HH (flat)}', labAt: 0.95, dx: -60, dy: -12 },
        { f: (k) => -0.35 - 1.2 * k * k, lab: '\\text{LH (sharp)}', labAt: 0.6, dx: 6, dy: 4 }],
    });
  }

  // ======================================================================== Topic 1
  TH['t1-crystal'] = {
    read: [
      R(md`
        ### Semiconductor materials: the whole family

        **Where semiconductors sit.** Sort solids by resistivity and three groups appear: **metals** (gold $\approx 2\times10^{-6}\,\Omega\,$cm), **insulators** (glass, SiO₂: above $10^{12}\,\Omega\,$cm) and, in between, **semiconductors** (pure Si $\approx 2\times10^{5}\,\Omega\,$cm). What makes semiconductors useful is not the middle value but that it can be **changed** by orders of magnitude: by doping, light, temperature and electric fields. That controllability is what makes devices.

        **The materials.**

        | Family | Examples | Typical use |
        |---|---|---|
        | Elemental, group IV | Si, Ge (C as diamond is an insulator) | Si: almost all ICs, solar cells |
        | IV–IV compounds | SiC, SiGe | SiC: power and high-temperature devices; SiGe: fast transistors |
        | III–V compounds | GaAs, InP, GaN, GaP, AlAs, InAs, InSb | high-speed transistors, LEDs, lasers (GaN: blue and white LEDs) |
        | II–VI compounds | ZnS, ZnSe, CdS, CdTe, HgCdTe | phosphors, CdTe solar cells, infrared detectors |
        | Ternary alloys | AlₓGa₁₋ₓAs, GaAs₁₋ᵧPᵧ, InₓGa₁₋ₓAs | tuned band gaps (red LEDs, lasers) |
        | Quaternary alloys | InₓGa₁₋ₓAsᵧP₁₋ᵧ | fiber-optic lasers lattice-matched to InP |

        **Why III–V and II–VI behave like silicon.** Gallium (group III, 3 valence electrons) and arsenic (group V, 5) average **4 valence electrons per atom**, just like Si. So they form the same four tetrahedral bonds, in the zincblende version of the diamond lattice. II–VI compounds (2 + 6) do the same. The difference is that the two atoms in each bond are not identical, so the shared electrons sit closer to one of them: the bond becomes partly ionic (Topic 2).
      `),
      R(md`
        ### Growing the crystal: bulk growth

        Device-grade silicon must be extraordinarily pure (unwanted impurities below about one part per billion) **and** a single crystal.

        1. **Purification.** Sand (SiO₂) is reduced with carbon to metallurgical-grade Si (about 98% pure). That is turned into a liquid, trichlorosilane (SiHCl₃), which is purified by distillation and then reduced back to **electronic-grade polycrystalline silicon**.
        2. **Czochralski growth (most Si wafers).** The polysilicon is melted in a quartz crucible (Si melts at 1415 °C). A small **seed crystal** with the chosen orientation, usually $(100)$, is dipped into the melt and slowly **pulled up while rotating**. Atoms freeze onto the seed continuing its lattice, so the whole cylindrical **ingot (boule)**, now up to 300 mm in diameter, is one crystal with the seed's orientation. **Dopants are added to the melt.**
        3. **Segregation.** A dopant is generally less soluble in the solid than in the liquid: the **segregation coefficient** $k_d = C_S/C_L$ is below 1 for most dopants. The growing crystal rejects some dopant back into the melt, so the melt gets richer as growth proceeds and the doping rises along the ingot. Oxygen from the quartz crucible also gets in.
        4. **Float-zone growth.** A narrow molten zone is passed along a polysilicon rod held vertically, with no crucible. Impurities segregate into the moving liquid zone and are swept to one end, so float-zone Si is purer (high-resistivity wafers, power devices).
        5. **Compound semiconductors** are grown by the **Bridgman** method (melt in a boat, frozen from one end) or by **liquid-encapsulated Czochralski** (a molten B₂O₃ layer keeps the volatile arsenic from evaporating).
        6. **Wafers.** The ingot is ground to a round cylinder, a flat or notch is cut to mark the orientation (and, by convention, the doping type), it is sawn into wafers, and the wafers are lapped, etched and chemically–mechanically polished to a mirror finish.
      `),
      R(md`
        ### Epitaxy: growing thin crystal layers on a crystal

        **Epitaxy** ("arranged upon") means growing a thin **single-crystal layer on a single-crystal substrate**, so that the layer continues the substrate's lattice and orientation. Bulk methods such as Czochralski are **not** epitaxy.

        - **Homoepitaxy**: the same material, e.g. a lightly doped Si layer on a heavily doped Si substrate.
        - **Heteroepitaxy**: a different material, e.g. AlGaAs on GaAs, InGaAs on InP, GaN on sapphire.

        **Why grow layers this way?** Growth is at a lower temperature than the melt, so dopants barely move and doping profiles stay sharp; thickness can be controlled down to **one atomic layer**; and different materials can be stacked into **heterostructures** (lasers, LEDs, quantum wells, high-electron-mobility transistors).

        **Lattice matching.** For a perfect layer, the layer's lattice constant should match the substrate's. AlAs (5.66 Å) and GaAs (5.65 Å) are almost identical, so AlₓGa₁₋ₓAs grows perfectly on GaAs at any $x$. In₀.₅₃Ga₀.₄₇As is matched to InP. The **mismatch** is $f = (a_{\text{layer}} - a_{\text{sub}})/a_{\text{sub}}$.

        **When the lattices don't match:**

        - A **thin** mismatched layer can stretch or squeeze elastically so that, in the plane, its atoms line up with the substrate's. This is **pseudomorphic** (strained) growth: epitaxial growth of a non-lattice-matched layer that takes on the substrate's in-plane lattice constant.
        - The strain energy stored grows with thickness. Above the **critical thickness** it becomes cheaper for the layer to relax by forming **misfit dislocations** at the interface: rows of broken bonds that scatter carriers and act as recombination centers. The larger the mismatch, the thinner the critical thickness.
        - A **strained-layer superlattice** alternates thin layers in **tension** and in **compression** so that the strains balance overall and no misfit dislocations form.

        **Epitaxial techniques:**

        - **VPE / CVD** (vapor-phase epitaxy, chemical vapor deposition): reactive gases decompose on the hot substrate (SiCl₄ + H₂, or SiH₄, for Si).
        - **MOCVD** (metal-organic CVD): metal-organic gases such as trimethylgallium with arsine for III–V layers. The workhorse for LEDs and lasers.
        - **MBE** (molecular beam epitaxy): in ultra-high vacuum, heated effusion cells aim beams of atoms or molecules at a heated substrate. Shutters switch materials within one atomic layer, and electron diffraction (RHEED) watches the growth as it happens.
        - **LPE** (liquid-phase epitaxy): growth from a saturated solution; older and less precise.
      `),
    ],
    keep: [
      R(md`
        ### Keep in mind (crystals)

        - Count atoms by **sharing**: corner ⅛, edge ¼, face ½, inside 1. Diamond and zincblende hold 8 atoms per cubic cell (fcc's 4 points × a 2-atom basis).
        - Work in **cm** for densities: $1\,\text{Å} = 10^{-8}$ cm. $N = (\text{atoms per cell})/a^3$, $\rho_m = NM/N_A$; for a compound, use the **average** molar mass of the atoms in the cell (4 Ga + 4 As).
        - Planar density: only atoms whose **centers** lie in the plane count, with their share of the plane inside the cell.
        - Miller indices: intercepts in units of $a$ → reciprocals → smallest integers; a plane through the origin needs the origin moved first; a negative index gets a bar. $(hkl)$ is one plane, $\{hkl\}$ its family; $[hkl]$ is a direction, $\langle hkl\rangle$ its family. Only in **cubic** crystals is $[hkl] \perp (hkl)$.
        - Packing fractions: sc 52%, bcc 68%, fcc 74%, diamond 34%.
        - Bulk growth (Czochralski, float zone, Bridgman) makes ingots; epitaxy (VPE/CVD, MOCVD, MBE, LPE) grows thin layers on a crystal. Don't mix them up.
        - Pseudomorphic = strained, still perfect, only below the critical thickness; above it, misfit dislocations.
      `),
    ],
    qs: [
      Q(md`Which of these is **not** an epitaxial growth technique?`, ['Czochralski growth', 'molecular beam epitaxy', 'MOCVD', 'vapor-phase epitaxy'], 0,
        [null, 'MBE grows layers atom by atom on a crystal substrate.', 'MOCVD is the workhorse for III–V layers.', 'VPE grows layers from gases on a crystal.'], md`Czochralski pulls a whole ingot from a melt: bulk growth.`),
      Q(md`A thin InGaAs layer is grown on GaAs, whose lattice constant is smaller. Below the critical thickness, the layer…`, ['is compressed in the plane to match GaAs: pseudomorphic growth', 'keeps its own lattice constant everywhere', 'turns amorphous', 'forms misfit dislocations immediately'], 0,
        [null, 'Then the atoms at the interface could not line up.', 'It stays a single crystal.', 'Only above the critical thickness.'], md`A thin layer stores the mismatch as elastic strain; thicker layers relax by forming dislocations.`),
      Q(md`What happens when a mismatched layer is grown beyond its critical thickness?`, ['misfit dislocations form at the interface, relaxing the strain but adding defects', 'it becomes lattice-matched', 'the substrate bends without defects', 'nothing: thickness doesn’t matter'], 0,
        [null, 'Its natural lattice constant doesn’t change.', 'Relaxation happens by dislocations.', 'Strain energy grows with thickness.'], md`Dislocations are recombination centers and scattering sites, which is why lattice matching matters.`),
      Q(md`A strained-layer superlattice avoids dislocations by…`, ['alternating layers in tension and compression so the strain balances', 'using only lattice-matched layers', 'growing very thick layers', 'growing on an amorphous substrate'], 0,
        [null, 'Its layers are deliberately mismatched.', 'Thick layers would relax by dislocations.', 'Epitaxy needs a crystal substrate.'], md`Net strain balance keeps every layer below its critical thickness without defects.`),
      Q(md`AlₓGa₁₋ₓAs grows nearly perfectly on GaAs for any $x$ because…`, ['AlAs and GaAs have almost the same lattice constant', 'Al and Ga have the same mass', 'AlGaAs is amorphous', 'GaAs is flexible'], 0,
        [null, 'Mass doesn’t matter for matching.', 'It grows as a single crystal.', 'Matching is about lattice constants.'], md`5.66 Å versus 5.65 Å: under 0.2% mismatch.`),
      P({ q: md`InP has $a = 5.87$ Å and GaAs $5.65$ Å. What is the lattice mismatch of InP grown on GaAs, in percent?`, parts: [{ lbl: md`f`, ans: 3.894, unit: '\\%', tol: { rel: 0.02 } }],
        sol: md`$f = (5.87 - 5.65)/5.65 = 0.039 = 3.9\%$: far too large for a thick strained layer.` }),
      Q(md`Why is the doping along a Czochralski ingot not uniform?`, ['dopant segregates into the melt ($k_d < 1$), so the melt and later the crystal get richer in dopant', 'the seed contains all the dopant', 'dopant evaporates from the solid', 'the pulling speed changes the lattice constant'], 0,
        [null, 'The dopant is added to the melt.', 'Dopants stay in the solid once frozen in.', 'That is not the mechanism.'], md`$k_d = C_S/C_L < 1$: the crystal takes less dopant than the melt holds, enriching the melt.`),
      Q(md`Why does float-zone silicon have fewer impurities than Czochralski silicon?`, ['there is no crucible, and impurities are swept along with the molten zone', 'it is grown faster', 'it is grown in air', 'it has more oxygen'], 0,
        [null, 'Speed is not the reason.', 'It is grown in a controlled atmosphere.', 'It has less oxygen (no quartz crucible).'], md`The quartz crucible in Czochralski growth adds oxygen; the molten zone also carries impurities to one end.`),
      Q(md`Which wavelength regime is InGaAsP (lattice-matched to InP) mainly used for?`, ['1.3–1.55 μm fiber-optic lasers and detectors', 'blue LEDs', 'X-ray detectors', 'microwave Gunn diodes'], 0,
        [null, 'Blue needs a wide gap (GaN).', 'No.', 'Gunn diodes use GaAs or InP bulk.'], md`Its gap can be tuned to about 0.8–0.95 eV while staying matched to InP.`),
      Q(md`Why do III–V compounds such as GaAs form the same tetrahedral structure as silicon?`, ['Ga (3) and As (5) average 4 valence electrons per atom, enough for four covalent bonds each', 'Ga and As are both group IV', 'they are ionic like NaCl', 'they are metals'], 0,
        [null, 'Ga is group III, As group V.', 'They are mostly covalent, with some ionic character.', 'They are semiconductors.'], md`Same electron count per atom, same bonding geometry: zincblende.`),
    ],
  };

  // ======================================================================== Topic 2
  TH['t2-bands'] = {
    read: [
      R(md`
        ### Bonding in solids: what holds a crystal together decides everything

        Atoms bond so as to complete their outer shells, and **how** they do it decides whether any electrons are free to move. There are four main kinds of bond (plus a weak fifth).

        **1. Ionic bonding** (NaCl, KCl, LiF, MgO). One atom gives electrons to another. Sodium has a single loosely held 3s electron; chlorine is one electron short of a full shell. The electron transfers, leaving $\text{Na}^+$ and $\text{Cl}^-$, **both with closed shells**, held together by the electrostatic attraction of the opposite charges in an alternating lattice. Every electron is tightly bound in a closed shell, so there are no free electrons and the gap is huge (NaCl about 8.5 eV): **insulators**. The bond is strong and not directional (brittle, high melting point, transparent). *Signature: a metal from the far left of the periodic table with a nonmetal from the far right (groups I + VII, II + VI with a large electronegativity difference).*

        **2. Metallic bonding** (Na, Cu, Ag, Au, Al). Each atom has only a few loosely held outer electrons and releases them to the whole crystal: a **"sea" of electrons** shared by all the positive ion cores and holding them together. The outer band is **partly filled**, so metals conduct at any temperature. Not directional, so metals are ductile; the free electrons also make them shiny. *Signature: an element with few valence electrons (alkali, alkaline-earth, transition and noble metals).*

        **3. Covalent bonding** (Si, Ge, C as diamond; also elemental P and S). Neighboring atoms **share** electron pairs so that each completes its shell: in group IV, each atom shares one pair with each of four neighbors (8 electrons around each atom). The bonds are strong and **directional** (tetrahedral). At 0 K every valence electron is locked in a bond, so there are no free carriers. The gap is the energy to break a bond: about 1 eV for Si and Ge (**semiconductors**), 5.5 eV for diamond (an **insulator**). *Signature: atoms of the same element from group IV, or nonmetals bonded to each other.*

        **4. Mixed ionic–covalent bonding** (GaAs, InP, GaN, ZnS, CdS, CdTe). Compounds of two different elements, mostly III–V or II–VI. The bonds are covalent (shared pairs, tetrahedral), but the shared electrons sit **closer to the more electronegative atom** (As, P, N, S), giving each bond partly ionic character. III–V compounds are mostly covalent with some ionic character; II–VI compounds are **more** ionic (the electronegativity difference is larger), and their gaps tend to be larger. These are semiconductors.

        **5. Van der Waals bonding** (noble-gas solids, solid N₂, many organic crystals). Weak attractions between neutral atoms or molecules. Low melting points, insulators.

        **A method for "what kind of bonding is X?"**

        1. **One element.** A metal (Na, Cu, Au, Al) → **metallic**. Group IV (C, Si, Ge) or another nonmetal (P, S) → **covalent**. A noble gas → van der Waals.
        2. **Two elements from opposite sides** (groups I and VII, like NaCl, KBr) → **ionic**.
        3. **III–V or II–VI compound** (GaAs, InP, GaN, ZnSe, CdTe) → **mixed ionic–covalent** (II–VI more ionic).
        4. **IV–IV compound** (SiC, SiGe) → **covalent** (SiC slightly polar).

        | Material | Bonding | Gap (eV) | Electrical class |
        |---|---|---|---|
        | NaCl | ionic | ≈8.5 | insulator |
        | Au, Cu, Na | metallic | none (partly filled band) | metal |
        | C (diamond) | covalent | 5.5 | insulator |
        | Si, Ge | covalent | 1.12, 0.67 | semiconductor |
        | GaAs, InP | mixed (mostly covalent) | 1.43, 1.35 | semiconductor |
        | ZnS, CdS | mixed (more ionic) | 3.6, 2.4 | semiconductor (wide gap) |

        **From bonding to bands.** The bond decides the band filling. Closed shells (ionic) or every electron in a bond (covalent) means a full band below a gap; the gap size then decides insulator versus semiconductor. Electrons released to the whole crystal (metallic) means a partly filled band: a metal.
      `),
      RFig(md`
        ### Insulator, semiconductor, metal: the E–r picture at 0 K

        An **E–r diagram** plots allowed electron energies against position in the crystal. At 0 K:

        [[fig:er]]

        - **Insulator**: a full valence band, a **wide** gap, an empty conduction band. Essentially no electrons ever get across.
        - **Semiconductor**: the same picture with a **narrow** gap (about 1 eV). Empty conduction band at 0 K, but at room temperature heat lifts a few electrons across, and doping changes the numbers enormously.
        - **Metal**: electrons fill a band only partway, up to $E_F$, with empty states directly above (or two bands overlap). It conducts at 0 K.

        The difference between an insulator and a semiconductor is **only the size of the gap**. The difference between both and a metal is the **filling**: a metal has electrons in a partly filled ("conduction") band even at 0 K.
      `, { er: { svg: erFig(), cap: 'At 0 K: insulators and semiconductors have a full band and an empty band (wide versus narrow gap); a metal fills a band only partway, up to $E_F$.' } }),
      RFig(md`
        ### Reading an E–k diagram: light and heavy holes

        An E–k diagram shows each band's energy against crystal momentum $\hbar k$, with $k$ running across the **Brillouin zone**, from $-\pi/a$ to $\pi/a$. Gaps open at the zone edges, where the electron wavelength matches the lattice spacing and the waves are reflected by the lattice (Bragg reflection).

        Near $k = 0$ the top of the valence band is really **two bands touching**:

        [[fig:lhhh]]

        - **Heavy holes** (HH): the flatter band, larger effective mass.
        - **Light holes** (LH): the more sharply curved band, smaller effective mass.
        - (A third, **split-off** band lies a bit lower.)

        **How to label a diagram:** the band curving **up** above the gap is the conduction band; of the two curving **down** from the valence-band top, the sharper one is the light-hole band and the flatter one the heavy-hole band, because $m^* = \hbar^2/(d^2E/dk^2)$.

        **The gap** is the lowest conduction energy minus the highest valence energy, wherever in $k$ they occur. **Direct** if both are at the same $k$ (GaAs, at $k = 0$); **indirect** otherwise (Si's conduction minimum lies near the zone edge along $\langle100\rangle$, in six equivalent valleys; Ge's is at the zone edge along $\langle111\rangle$).

        **Kinetic energy on the diagram.** An electron with kinetic energy $E_K$ sits on its band at $E = E_c + E_K$, at the $k$ where $E_K = \hbar^2k^2/2m^*$.

        **Same momentum, different mass.** $E_K = p^2/2m^*$, so for an electron and a hole with the same momentum, $E_{K,e}/E_{K,h} = m_h^*/m_e^*$. A hole with 2.5 eV and $m_h^* = 1.5\,m_0$, compared with an electron of $m_e^* = 0.75\,m_0$: the electron has $2.5\times1.5/0.75 = 5$ eV.

        **Mass from a fitted curve.** If $E = Ck^2$ near the band edge, then $\hbar^2/2m^* = C$, so $m^* = \hbar^2/2C$. With $C = 5\times10^{-38}$ J·m²: $m^* = (1.055\times10^{-34})^2/(10^{-37}) = 1.1\times10^{-31}$ kg $= 0.12\,m_0$.
      `, { lhhh: { svg: lhhhFig(), cap: 'Near $k = 0$: the conduction band (top) and the two valence bands meeting at the valence-band maximum: heavy holes (flat) and light holes (sharp).' } }),
      R(md`
        ### Alloys: dialing in the gap

        In a ternary alloy such as $\text{Al}_x\text{Ga}_{1-x}\text{As}$, Al and Ga share the group-III sites at random, and the properties vary smoothly with $x$:

        - **Lattice constant**: close to linear in $x$ (**Vegard's law**): $a(x) = x\,a_{\text{AlAs}} + (1 - x)\,a_{\text{GaAs}}$.
        - **Band gap**: rises with $x$. Each conduction-band valley (the direct one at $k = 0$ and the indirect ones at the zone edge) moves at its own rate, and **they cross**: AlGaAs is **direct for $x \lesssim 0.45$** and **indirect above**. The same happens in $\text{GaAs}_{1-y}\text{P}_y$ near $y \approx 0.45$. GaAsP red LEDs use compositions just on the direct side; GaP itself is indirect (2.26 eV) and is made to emit green light only with special nitrogen impurities.
        - **Quaternary alloys** (InGaAsP) have two composition knobs, so the gap and the lattice constant can be chosen **independently**: e.g. stay lattice-matched to InP while setting the gap for 1.3 or 1.55 μm fiber light.

        Alloying is how engineers choose an LED's color, a detector's cutoff wavelength or a laser's wavelength, and how they line up the bands in heterostructures.
      `),
      R(md`
        ### Quantum wells

        Sandwich a very thin layer (around 10 nm) of a narrow-gap material between layers of a wider-gap one: GaAs between AlGaAs. Electrons in the GaAs conduction band are trapped in the thin direction by the higher conduction band on both sides, exactly like a particle in a box. Their energy in that direction is quantized:
        $$E_n \approx \frac{n^2h^2}{8m^*L^2}\quad\text{above }E_c$$
        (and likewise for holes, below $E_v$). In the plane of the layer they still move freely.

        - The lowest allowed transition is at $E_g + E_{1e} + E_{1h}$: the **effective gap grows as the well gets thinner**, so the emission shifts to shorter wavelength (bluer). Thickness becomes another knob for the color.
        - Example: for a 10 nm GaAs well with $m_e^* = 0.067\,m_0$, $E_1 \approx 0.056$ eV.
        - Quantum wells are used in almost all semiconductor lasers and in high-electron-mobility transistors.
      `),
    ],
    keep: [
      R(md`
        ### Keep in mind (bonds and bands)

        - Bonding decides filling: ionic and covalent give full bands (insulator or semiconductor, depending on the gap); metallic gives a partly filled band (metal). III–V and II–VI compounds are **mixed** ionic–covalent.
        - Insulator versus semiconductor is only a matter of gap size; metal versus the others is a matter of band **filling**.
        - Full bands and empty bands carry **no current**. Holes exist only in a nearly full band.
        - On a band diagram, electron energy increases **up** and hole energy increases **down**. Kinetic energy is the distance from the band edge (electrons above $E_c$, holes below $E_v$).
        - $m^* = \hbar^2/(d^2E/dk^2)$: sharp curvature is light. If $E = Ck^2$, $m^* = \hbar^2/2C$. Light holes = sharper band.
        - Same momentum: kinetic energies scale as the **inverse** masses.
        - Direct gap: extrema at the same $k$ (efficient light emission). Photons carry almost no momentum.
        - $\lambda[\mu\text{m}] = 1.24/E_g[\text{eV}]$; $E = h\nu$, $p = h/\lambda = \hbar k$.
        - Alloys: lattice constant linear in composition (Vegard); the gap can switch from direct to indirect (AlGaAs and GaAsP near 0.45).
        - Quantum wells: thinner well, larger effective gap, bluer light.
      `),
    ],
    qs: [
      Q(md`What is the bonding in **InP**?`, ['mixed ionic–covalent', 'purely ionic', 'metallic', 'van der Waals'], 0,
        [null, 'In (III) and P (V) share electron pairs; it is only partly ionic.', 'InP is a semiconductor; metals have a partly filled band.', 'Far too strong for van der Waals.'], md`III–V compounds: covalent bonds with partial ionic character.`),
      Q(md`What is the bonding in **NaCl**?`, ['ionic', 'covalent', 'mixed ionic–covalent', 'metallic'], 0,
        [null, 'Na gives its electron away entirely; nothing is shared.', 'Groups I and VII: complete transfer.', 'Na is a metal, but NaCl has no free electrons.'], md`Na⁺ and Cl⁻ with closed shells, held by Coulomb attraction: an insulator.`),
      Q(md`What is the bonding in **gold**?`, ['metallic', 'covalent', 'ionic', 'mixed'], 0,
        [null, 'Gold atoms release their outer electrons to the whole crystal.', 'There is no partner to transfer electrons to.', 'Only one element.'], md`A sea of shared electrons: a partly filled band, so a metal.`),
      Q(md`What is the bonding in solid **phosphorus**?`, ['covalent', 'metallic', 'ionic', 'mixed ionic–covalent'], 0,
        [null, 'Phosphorus is a nonmetal; its atoms share electron pairs.', 'Ionic needs two elements of very different electronegativity.', 'One element: no ionic character.'], md`Nonmetal atoms bonded to each other share electrons: covalent.`),
      Q(md`What is the bonding in **silicon**?`, ['covalent', 'ionic', 'metallic', 'mixed'], 0,
        [null, 'Identical atoms can’t transfer charge to each other.', 'Si has no free electrons at 0 K.', 'One element: purely covalent.'], md`Four shared pairs per atom, tetrahedral.`),
      Q(md`Which compound is **most ionic**?`, ['ZnS (II–VI)', 'GaAs (III–V)', 'Si', 'SiC'], 0,
        [null, 'III–V compounds are less ionic than II–VI.', 'Purely covalent.', 'Covalent, only slightly polar.'], md`The bigger the electronegativity difference, the more ionic: II–VI > III–V > IV–IV.`),
      Q(md`At 0 K, what distinguishes a metal from a semiconductor on an E–r diagram?`, ['the metal has a partly filled band (electrons right below empty states); the semiconductor has a full band and an empty band', 'the metal has a larger gap', 'the semiconductor has electrons in the conduction band', 'nothing: they look the same at 0 K'], 0,
        [null, 'Metals have no gap at the Fermi level.', 'Not at 0 K.', 'Filling differs.'], md`At 0 K a semiconductor is an insulator with a small gap.`),
      Q(md`On an E–k diagram, two valence bands meet at $k = 0$. The **more sharply curved** one holds…`, ['light holes', 'heavy holes', 'conduction electrons', 'split-off holes only'], 0,
        [null, 'Heavy holes are in the flatter band.', 'Conduction electrons are above the gap.', 'The split-off band is lower, not the sharper of the two meeting at the top.'], md`$m^* = \hbar^2/(d^2E/dk^2)$: sharp curvature, small mass.`),
      P({ q: md`A hole has kinetic energy 2.5 eV and $m_h^* = 1.5\,m_0$. An electron with $m_e^* = 0.75\,m_0$ has the **same momentum**. Find the electron's kinetic energy.`, parts: [{ lbl: md`E_{K,e}`, ans: 5, unit: 'eV' }],
        sol: md`$E_K = p^2/2m^*$; same $p$: $E_{K,e} = E_{K,h}\,m_h^*/m_e^* = 2.5\times1.5/0.75 = 5$ eV.` }),
      P({ q: md`Near a conduction-band minimum, $E - E_c = 5\times10^{-38}\,k^2$ (J, with $k$ in m⁻¹). Find $m^*/m_0$.`, parts: [{ lbl: md`m^*/m_0`, ans: 0.1222, tol: { rel: 0.02 } }],
        sol: md`$\hbar^2/2m^* = 5\times10^{-38}$ → $m^* = (1.055\times10^{-34})^2/(10^{-37}) = 1.113\times10^{-31}$ kg $= 0.122\,m_0$.` }),
      Q(md`In AlₓGa₁₋ₓAs, increasing $x$ beyond about 0.45…`, ['makes the gap indirect, so light emission becomes inefficient', 'makes it a metal', 'lowers the gap to zero', 'breaks the lattice match with GaAs badly'], 0,
        [null, 'The gap grows, it doesn’t close.', 'It grows.', 'AlAs and GaAs are nearly matched at every $x$.'], md`The zone-edge valley drops below the $k = 0$ valley.`),
      Q(md`A GaAs quantum well is made thinner. Its emission…`, ['shifts to shorter wavelength (higher energy)', 'shifts to longer wavelength', 'is unchanged', 'stops'], 0,
        [null, 'Confinement raises the levels: $E_n \\propto 1/L^2$.', 'Thickness changes the confinement energy.', 'It still emits.'], md`Effective gap $= E_g + E_{1e} + E_{1h}$ grows as $L$ shrinks.`),
      Q(md`Vegard's law says that the lattice constant of an alloy…`, ['varies about linearly with composition between the two end compounds', 'equals the larger of the two', 'is the geometric mean', 'doesn’t depend on composition'], 0,
        [null, 'It interpolates.', 'Linear, not geometric.', 'It does.'], md`$a(x) = xa_A + (1 - x)a_B$.`),
      Q(md`Why does diamond, with the same covalent bonding as Si, act as an insulator?`, ['its bonds are much stronger, so the gap (5.5 eV) is far too large for thermal excitation', 'its bonding is ionic', 'its band is partly filled', 'it has no valence electrons'], 0,
        [null, 'Diamond is covalent.', 'That would make it a metal.', 'Four, like Si.'], md`Insulator versus semiconductor is only gap size.`),
    ],
  };

  // ======================================================================== Topic 6
  TH['t6-drift'] = {
    read: [
      R(md`
        ### Where $\mu = q\bar t/m^*$ comes from

        Take $n$ electrons per cm³ in a field $\mathscr{E}$ along $x$. Two things change their total momentum $p_x$:

        - The field pushes on every electron: $dp_x/dt = -nq\mathscr{E}$.
        - Collisions randomize momentum. If an electron collides on average every $\bar t$, the momentum gained is lost at the rate $p_x/\bar t$.

        In steady state the two balance:
        $$-nq\mathscr{E} - \frac{p_x}{\bar t} = 0 \quad\Longrightarrow\quad \langle p_x\rangle = \frac{p_x}{n} = -q\bar t\mathscr{E}$$
        Divide by the mass: $\langle v_x\rangle = -\dfrac{q\bar t}{m_n^*}\mathscr{E} = -\mu_n\mathscr{E}$, with $\mu_n = q\bar t/m_n^*$. The minus sign says electrons drift against the field. Then $J_n = -qn\langle v_x\rangle = qn\mu_n\mathscr{E}$.

        **How it behaves.** Mobility grows with the time between collisions and shrinks with mass. Units: cm²/V·s. To convert to SI for $\bar t = \mu m^*/q$, use $1\,\text{cm}^2/\text{V·s} = 10^{-4}\,\text{m}^2/\text{V·s}$.
      `),
      R(md`
        ### High-field effects

        Ohm's law ($v_d = \mu\mathscr{E}$) holds while the field only slightly disturbs the random thermal motion. At high fields (above roughly $10^3$–$10^4$ V/cm in Si) the carriers gain energy between collisions faster than they can hand it to the lattice; they become **hot carriers**. Once their energy reaches the optical-phonon energy (about 0.06 eV), they lose it in large steps, and the drift velocity **saturates** near $v_{sat} \approx 10^7$ cm/s. Short-channel transistors operate in this regime.

        **Intervalley transfer in GaAs (the Gunn effect).** GaAs electrons normally sit in the central conduction valley ($k = 0$), where they are light ($0.067\,m_0$) and mobile. About 0.3 eV higher there are side valleys where electrons are much heavier and less mobile. At high fields (above about 3 kV/cm) hot electrons transfer to the side valleys, so the average velocity **falls** as the field rises: **negative differential mobility**. That instability makes current oscillations at microwave frequencies, used in Gunn-diode oscillators.
      `),
      R(md`
        ### The Hall effect, start to finish

        A bar carries current $I_x$ along $x$; a magnetic field $B_z$ points along $z$. Carriers moving along $x$ feel the magnetic force $q\vec v\times\vec B$ along $y$, pile up on one face, and build a transverse field $\mathscr{E}_y$ until it cancels the magnetic force:
        $$q\mathscr{E}_y = qv_xB_z$$
        For p-type material, $v_x = J_x/qp_0$, so $\mathscr{E}_y = \dfrac{J_xB_z}{qp_0} = R_HJ_xB_z$ with the **Hall coefficient** $R_H = 1/qp_0$. Measuring the Hall voltage across the width $w$ gives $V_{AB} = \mathscr{E}_yw$; with $J_x = I_x/(wt)$ for thickness $t$:
        $$p_0 = \frac{I_xB_z}{qtV_{AB}}$$
        Then measure the resistivity from the voltage along the bar, $\rho = \dfrac{V_{CD}/I_x}{L/wt}$, and the mobility follows: $\mu_p = \dfrac{1}{q\rho p_0}$.

        - **Sign**: holes (moving with the current) and electrons (moving against it) are pushed to the **same** face, so the Hall voltage has opposite signs for p- and n-type material. That is how you tell the majority carrier type.
        - **Units**: with lengths in cm, use $B$ in Wb/cm² ($1\,\text{T} = 10^{-4}\,\text{Wb/cm}^2$).
        - A smaller carrier concentration gives a **larger** Hall voltage (fewer carriers must move faster to carry the same current).
      `),
      R(md`
        ### Resistance of a layer whose doping varies with depth

        For a layer of length $L$, width $W$ and depth $d$, with doping $N_d(x)$ varying with depth $x$, think of thin slices $dx$ in parallel: each conducts $dG = q\mu_nN_d(x)\,W\,dx/L$. Adding conductances in parallel:
        $$\frac1R = \frac{qW}{L}\int_0^d\mu_n(x)N_d(x)\,dx$$
        (keep $\mu_n$ inside the integral if it changes with doping). For uniform doping this reduces to $R = \rho L/(Wd)$. The quantity $\rho/d$ is the **sheet resistance** in ohms per square: a square of any size has the same resistance.
      `),
    ],
    keep: [
      R(md`
        ### Keep in mind (drift)

        - Electrons drift **against** $\mathscr{E}$, holes **with** it; both currents point **along** $\mathscr{E}$.
        - $J = q(n\mu_n + p\mu_p)\mathscr{E}$: include the minority term only when it isn't negligible (high temperature, intrinsic, compensated).
        - Units: cm, cm²/V·s, $(\Omega\,\text{cm})^{-1}$; $R = \rho L/A$ with $L$ and $A$ in cm and cm².
        - Mobility: $\mu_L \propto T^{-3/2}$ (falls with $T$), $\mu_I \propto T^{3/2}/N_I$ (rises with $T$, falls with **total** ionized impurities $N_d^+ + N_a^-$). Matthiessen: inverse mobilities add; the smaller wins.
        - Compensation lowers mobility while removing carriers: resistivity rises for two reasons.
        - $v = \mu\mathscr{E}$ fails above about $10^4$ V/cm: saturation near $10^7$ cm/s; GaAs shows negative differential mobility.
        - Hall: $p_0 = I_xB_z/(qtV_H)$, sign gives the carrier type; $B$ in Wb/cm² with cm.
        - "Increase, decrease, same, or not enough information?" Check every factor: $n$ (doping, $n_i(T)$) **and** $\mu$ (lattice, impurity).
      `),
    ],
    qs: [
      Q(md`In the momentum-balance picture of drift, steady state means…`, ['the momentum gained from the field per second equals the momentum lost to collisions per second', 'the carriers stop accelerating because the field vanishes', 'no collisions occur', 'the carriers move at the speed of light'], 0,
        [null, 'The field stays on.', 'Collisions are essential.', 'No.'], md`$-nq\mathscr{E} = p_x/\bar t$.`),
      Q(md`In GaAs, raising the field above about 3 kV/cm makes the electron velocity **decrease**. Why?`, ['hot electrons transfer to side valleys where they are heavy and slow', 'the electrons freeze out', 'the lattice melts', 'holes cancel the current'], 0,
        [null, 'Hot carriers are the opposite of frozen.', 'No.', 'Holes carry current in the same direction.'], md`Intervalley transfer gives negative differential mobility: the Gunn effect.`),
      Q(md`A Hall measurement on a lightly doped sample gives a **larger** Hall voltage than on a heavily doped one (same current and field). Why?`, ['fewer carriers must move faster to carry the same current, so the magnetic force is larger', 'heavily doped samples have no Hall effect', 'mobility is larger in heavy doping', 'the field is weaker in light doping'], 0,
        [null, 'They have one, just smaller.', 'The Hall voltage depends on $p_0$, not $\\mu$.', 'Same applied $B$.'], md`$V_H = I_xB_z/(qtp_0)$.`),
      Q(md`A layer's doping falls with depth. To find its resistance you…`, ['add the conductances of thin slices in parallel: $1/R = (qW/L)\\int\\mu N(x)\\,dx$', 'use the surface doping for the whole layer', 'average the resistivity over depth', 'use the doping at the bottom'], 0,
        [null, 'The surface slice is only one of many parallel paths.', 'Conductances add in parallel, not resistivities.', 'No.'], md`Parallel slices: conductances add.`),
      P({ q: md`A Hall sample: $I_x = 1$ mA, $B_z = 10^{-5}\,\text{Wb/cm}^2$ (0.1 T), thickness $t = 10^{-2}$ cm, $V_{AB} = 0.5$ mV (positive, so p-type). Find $p_0$.`, parts: [{ lbl: md`p_0`, ans: 1.25e16, unit: 'cm^{-3}' }],
        sol: md`$p_0 = \dfrac{I_xB_z}{qtV_{AB}} = \dfrac{(10^{-3})(10^{-5})}{(1.6\times10^{-19})(10^{-2})(5\times10^{-4})} = 1.25\times10^{16}\,\text{cm}^{-3}$.` }),
    ],
  };

  // ======================================================================== Topic 11
  TH['t11-diffusion'] = {
    read: [
      R(md`
        ### Where $D$ comes from: counting carriers across a plane

        Take the plane $x_0$, and the slabs of width one mean free path $\ell$ on each side, with average concentrations $n_1$ (left) and $n_2$ (right). In one mean free time $\bar t$, about half the carriers in each slab cross the plane (the half moving toward it). Per unit area, the net number crossing left to right in time $\bar t$ is $\tfrac12(n_1 - n_2)\ell$. Since the slab centers are $\ell$ apart, $n_1 - n_2 \approx -\ell\,dn/dx$, so the flux is
        $$\phi_n = \frac{\tfrac12(n_1 - n_2)\ell}{\bar t} = -\frac{\ell^2}{2\bar t}\frac{dn}{dx} \equiv -D_n\frac{dn}{dx}, \qquad D_n = \frac{\ell^2}{2\bar t}$$
        **How it behaves:** $D$ grows with the square of the mean free path and with the collision rate, the same ingredients as mobility. Units cm²/s. Flux is in carriers per cm² per second; multiply by $\mp q$ for current.
      `),
    ],
    keep: [
      R(md`
        ### Keep in mind (diffusion)

        - Flux first, then current: **particles** flow down their own gradient; electron current is opposite to electron flow, hole current along hole flow.
        - $J_n = q\mu_nn\mathscr{E} + qD_n\,dn/dx$, $J_p = q\mu_pp\mathscr{E} - qD_p\,dp/dx$: the signs differ, the drift terms don't.
        - Differentiate the **whole** concentration ($n_0 + \delta n$); a uniform $n_0$ contributes nothing to $dn/dx$.
        - Draw separate arrows for **flow** and **current** when asked; at a peak or flat spot of the profile, the diffusion flux is zero.
        - $D/\mu = kT/q$ at the same temperature for each carrier; $D_n/D_p = \mu_n/\mu_p$.
        - Equilibrium with nonuniform doping: drift and diffusion cancel for each carrier; $E_F$ flat; $\mathscr{E} = -(kT/q)(1/n)\,dn/dx$; for $N \propto e^{-x/L}$, $|\mathscr{E}| = kT/qL$.
        - Field direction in graded doping: n-type points toward lower doping, p-type toward higher doping.
      `),
    ],
    qs: [
      Q(md`In the mean-free-path derivation, the diffusion coefficient comes out as…`, ['$D = \\ell^2/2\\bar t$', '$D = \\ell/\\bar t$', '$D = \\ell\\bar t$', '$D = q\\bar t/m^*$'], 0,
        [null, 'That is a velocity, not cm²/s.', 'Wrong units.', 'That is the mobility.'], md`Net crossing $\tfrac12(n_1 - n_2)\ell$ per $\bar t$, with $n_1 - n_2 \approx -\ell\,dn/dx$.`),
      Q(md`$n(x) = N_de^{-x/\alpha}$ at equilibrium in InP. Electrons diffuse…`, ['toward $+x$ (down the gradient), so the diffusion current points toward $-x$', 'toward $-x$', 'nowhere: it is equilibrium', 'toward $+x$, and the current also points toward $+x$'], 0,
        [null, 'They flow from high to low concentration.', 'Equilibrium means the net current is zero, not that diffusion stops.', 'Electron current is opposite to electron flow.'], md`$J_{n,\text{diff}} = qD_n\,dn/dx < 0$. A built-in field cancels it.`),
    ],
  };

  // ======================================================================== checklists for the rest
  const keep = (title, items) => [R(`### Keep in mind (${title})\n\n${items.map((x) => `- ${x}`).join('\n')}`)];
  TH['t3-carriers'] = {
    keep: keep('carriers', [
      'Light makes electrons and holes in **pairs**; ionized donors give electrons **without** holes; ionized acceptors give holes without electrons.',
      'Equilibrium: $n_0p_0 = n_i^2$ always (non-degenerate). With light or injection, $np > n_i^2$.',
      'Majority from the doping, minority from $n_i^2$: never set the minority equal to $n_i$.',
      'Group V in Si donates, group III accepts; in GaAs, compare with the atom replaced (group VI on As: donor; group II on Ga: acceptor; group IV is amphoteric).',
      'Energies on a band diagram: electron kinetic energy = height above $E_c$; hole kinetic energy = depth below $E_v$; $E_c$ and $E_v$ are the potential energies.',
      'The sample stays neutral: $p_0 + N_d^+ = n_0 + N_a^-$.',
    ]),
  };
  TH['t4-fermi'] = {
    keep: keep('Fermi level', [
      '$f(E_F) = \\tfrac12$ at any $T > 0$; at 0 K, $f$ is 1 below $E_F$ and 0 above.',
      '$1 - f(E)$ is the probability a state is **empty** (a hole in the valence band).',
      'Boltzmann forms need $E_F$ at least about $3kT$ from both band edges. Otherwise the material is degenerate.',
      '$n_0 = n_ie^{(E_F - E_i)/kT}$ and $p_0 = n_ie^{(E_i - F_F)/kT}$ are the most convenient forms: **60 meV per decade**.'.replace('F_F', 'E_F'),
      '$E_F - E_i = kT\\ln(n_0/n_i)$, or $-kT\\ln(p_0/n_i)$ for p-type. Use $kT$ at the actual temperature.',
      '$E_i$ is near midgap (slightly below it in Si because $N_c > N_v$).',
      '$N_c$, $N_v \\propto T^{3/2}$; most electrons sit within a few $kT$ of $E_c$.',
    ]),
  };
  TH['t5-temp'] = {
    keep: keep('temperature', [
      'Three regions for a doped sample: freeze-out (cold, donors hold their electrons, $E_F$ near the dopant level), extrinsic plateau ($n_0 \\approx N_d$), intrinsic ($n_i > N_d$, $E_F \\to E_i$).',
      'At 0 K in a doped sample, $E_F$ lies between the dopant level and the nearest band edge (between $E_d$ and $E_c$; between $E_v$ and $E_a$).',
      'Use the full quadratic when $|N_d - N_a|$ is not $\\gg n_i$: $n_0 = \\tfrac{N_d - N_a}{2} + \\sqrt{(\\tfrac{N_d - N_a}{2})^2 + n_i^2}$.',
      'Compensation: carriers follow $|N_d - N_a|$; scattering follows $N_d + N_a$.',
      '$n_i \\propto T^{3/2}e^{-E_g/2kT}$; in Si it doubles about every 9 K near 300 K. $kT = 8.62\\times10^{-5}\\,T$ eV (0.0259 at 300 K, 0.0103 at 120 K, 0.0066 at 77 K, 0.00034 at 4 K).',
      'Reading an $n$ versus $T$ plot: a flat stretch at $N_d$ means a doped sample; a curve that only rises steeply is intrinsic.',
    ]),
  };
  TH['t7-flatef'] = {
    keep: keep('equilibrium', [
      'Equilibrium = flat $E_F$ everywhere; a sloped $E_F$ means current.',
      'Bands bend by $-qV(x)$; the gap stays the same; the field points the way the bands **rise**.',
      'qV₀ = the difference in $E_F - E_i$ between the two sides before contact (add the distances if $E_F$ is on opposite sides of $E_i$).',
      'Total energy of an electron = its height on the diagram; kinetic = height above the local $E_c$.',
      'Drift and diffusion cancel **for each carrier separately** at equilibrium.',
      'Draw the far-away regions first ($E_F$ position from the doping), then join the bands smoothly.',
    ]),
  };
  TH['t8-optical'] = {
    keep: keep('light', [
      '$h\\nu = 1.24/\\lambda[\\mu\\text{m}]$ eV; absorbed band-to-band only if $h\\nu \\ge E_g$.',
      '$I(x) = I_0e^{-\\alpha x}$: absorbed fraction in thickness $d$ is $1 - e^{-\\alpha d}$; subtract reflection first if given.',
      'Photons per second $= P/h\\nu$ (J). Generation rate $g_{op}$ = pairs per second **per cm³**: divide by the absorbing volume.',
      'Excess energy $h\\nu - E_g$ becomes heat within ~ps; luminescence comes out near $E_g$.',
      'Photoluminescence (light in), electroluminescence (current in), cathodoluminescence (electron beam in); fluorescence is prompt, phosphorescence delayed by traps.',
    ]),
  };
  TH['t9-recomb'] = {
    keep: keep('recombination', [
      'Low level: $\\delta n \\ll n_0 + p_0$ → exponential with $\\tau = 1/\\alpha_r(n_0 + p_0)$; set by the majority.',
      'High level: $\\delta n \\gg n_0 + p_0$ → $\\delta n = \\Delta n/(1 + \\alpha_r\\Delta n\\,t)$.',
      'Thermal generation $g(T) = \\alpha_rn_i^2 = \\alpha_rn_0p_0$ never stops; with excess carriers, net recombination $= \\alpha_r(np - n_i^2)$.',
      'Repeated flashes add: right after a second flash at $t = \\tau$, $\\delta p = \\Delta p(1 + e^{-1})$.',
      'Carriers removed ($np < n_i^2$): generation dominates and refills them with the same $\\tau$ (δ negative, decaying to 0).',
      'Si recombines mostly through midgap centers (heat); GaAs directly (light). Traps near a band edge only delay carriers.',
    ]),
  };
  TH['t10-qfl'] = {
    keep: keep('quasi-Fermi levels', [
      '$\\delta n = g_{op}\\tau_n$ in steady state (uniform light).',
      '$n = n_ie^{(F_n - E_i)/kT}$ with the **total** $n = n_0 + \\delta n$; same for $p$ with $F_p$.',
      'Low level: the majority quasi-Fermi level stays at the old $E_F$; the minority one moves a lot.',
      'Draw $E_F$ (dark), $F_n$ and $F_p$ together; $F_n - F_p = kT\\ln(np/n_i^2)$.',
      'At a higher temperature, recompute $n_i$, $kT$ and the equilibrium values before placing the levels.',
      '$\\Delta\\sigma = q(\\delta n\\,\\mu_n + \\delta p\\,\\mu_p)$; both excess carriers conduct.',
    ]),
  };
  TH['t12-continuity'] = {
    keep: keep('continuity', [
      'Continuity: change = −(1/q)(gradient of current) + generation − recombination.',
      'Long bar: $\\delta p = \\Delta p\\,e^{-x/L_p}$, $L_p = \\sqrt{D_p\\tau_p}$; short bar: linear.',
      '$J_p(x) = (qD_p/L_p)\\Delta p\\,e^{-x/L_p}$: largest at the injection point, zero far away.',
      'Stored charge $Q_p = qA\\Delta pL_p$; $I = Q_p/\\tau_p$.',
      'Total current is constant in 1-D steady state: minority diffusion current converts to majority current.',
      'Units: $D$ in cm²/s and $\\tau$ in s give $L$ in cm.',
    ]),
  };
})();

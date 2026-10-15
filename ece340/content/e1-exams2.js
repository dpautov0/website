/* More exam-style practice: practice exam C (built from the homework-style generators in js/gens-exam2.js), the new
   problem types added to the endless page, and a second bank of harder conceptual questions. */
(function () {
  'use strict';
  const { R, P, Q, G } = C;
  const FX = (name, o, src) => P(Object.assign(GENS[name](o), { src }));
  const unit = COURSE.units.find((u) => u.id === 'e1-exam');
  if (!unit) return;

  // the new problem types join the endless page
  const gen = unit.lessons.find((l) => l.id === 'e1-xgen');
  gen.steps.push(
    R(md`### Two samples joined`), G('ex_contact'),
    R(md`### A built-in field at equilibrium`), G('ex_fieldband'),
    R(md`### Recombination rates and injection level`), G('ex_rates'),
    R(md`### Light into a thin sample`), G('ex_absorbhw'),
    R(md`### Steady state from the rates`), G('ex_qflhw'),
  );

  const xC = [
    R(md`A third full exam, built from the homework's problem types with new numbers. 60 minutes, on paper first.`),
    R(md`### Problem 1: Fermi level and band diagrams`),
    FX('ex_ef_temps', { p: false, dE: 20, N: 2e14, Thot: 600, niHot: 3e15 }, 'Practice C · 1'),
    FX('ex_contact', { a: 0.3, b: -0.25, Eg: 1.12 }, 'Practice C · 1'),
    R(md`### Problem 2: Concentrations, neutrality and plots`),
    FX('ex_nT', { Nd: 1e15, dopedIsA: false, ask: 'low' }, 'Practice C · 2'),
    FX('ex_comp2T', { ab: [5, 2], c: 3, TH: 430 }, 'Practice C · 2'),
    R(md`### Problem 3: Drift and the built-in field`),
    FX('ex_fieldband', { up: false }, 'Practice C · 3'),
    FX('ex_circle', { i: 7 }, 'Practice C · 3'),
    FX('ex_circle', { i: 14 }, 'Practice C · 3'),
    R(md`### Problem 4: Light, recombination, quasi-Fermi levels`),
    FX('ex_absorbhw', { lam: 800, d: 4, P: 1, R: 0.3 }, 'Practice C · 4'),
    FX('ex_rates', { m: 3, k: 16, tau: 1e-6, d: 5e14 }, 'Practice C · 4'),
    FX('ex_qflhw', { Nd: 2e16, g: 1e19, gT: 4.5e10 }, 'Practice C · 4'),
    R(md`### Problem 5: Diffusion`),
    FX('ex_arrows', { el: true, pts: [1, 2, 3, 4] }, 'Practice C · 5'),
    FX('ex_jexpr', { i: 1 }, 'Practice C · 5'),
  ];
  unit.lessons.splice(unit.lessons.findIndex((l) => l.id === 'e1-xB') + 1, 0, { id: 'e1-xC', title: 'Practice exam C (homework style)', kind: 'mock', steps: xC });

  const bank2 = [
    R(md`More harder conceptual questions, one or two reasoning steps each, across all twelve topics.

### Crystals, bonding and bands`),
    Q(md`A crystal is made by putting a two-atom basis on every point of an fcc lattice. How many atoms per cubic cell?`, ['8', '4', '2', '16'], 0,
      [null, 'That counts lattice points, not atoms.', 'That is the basis alone.', 'fcc has 4 points, not 8.'], md`4 lattice points × 2 atoms: diamond and zincblende.`),
    Q(md`Which change would turn a semiconductor into a better light emitter?`, ['alloying to make the gap direct', 'doping it much more heavily', 'making the crystal thicker', 'cooling it close to 0 K'], 0,
      [null, 'Doping changes carriers, not the band alignment in $k$.', 'Thickness doesn’t change the band structure.', 'At 0 K there are no carriers to recombine.'], md`A direct gap lets electrons drop straight down and emit.`),
    Q(md`CdS (II–VI) and GaAs (III–V) have similar lattice constants. Which bonding difference explains CdS's larger gap (2.4 vs 1.43 eV)?`, ['CdS bonds are more ionic', 'CdS is metallic, not covalent', 'GaAs is more ionic than CdS', 'CdS has more valence electrons'], 0,
      [null, 'It is a semiconductor.', 'GaAs is mostly covalent.', 'Both average 4 per atom.'], md`More ionic character → larger gap, typically.`),
    Q(md`An electron sits 0.3 eV above $E_c$ in one region and another sits exactly at $E_c$ in a region where $E_c$ is 0.3 eV higher. Their total energies are…`, ['equal; only the first has kinetic energy', 'different: the first is 0.3 eV higher', 'different by 0.6 eV in total', 'both zero: they sit at band edges'], 0,
      [null, 'Total energy is the height on the diagram.', 'No.', 'Energies are measured from a common zero.'], md`Total = potential ($E_c$ there) + kinetic (height above $E_c$).`),
    Q(md`Which material has electrons in a partly filled band even at 0 K?`, ['aluminum', 'silicon', 'diamond', 'NaCl'], 0,
      [null, 'Si has a full valence band at 0 K.', 'Full band, wide gap.', 'Closed-shell ions.'], md`Metals have partly filled bands: that is why they conduct at 0 K.`),
    R(md`### Carriers and the Fermi level`),
    Q(md`Two Si samples at 300 K: A has $n_0 = 10^{17}$, B has $p_0 = 10^{17}$. How far apart are their Fermi levels?`, ['about 0.81 eV', 'about 0.41 eV', 'about 1.12 eV', '0'], 0,
      [null, 'That is only one of them, measured from $E_i$.', 'They can’t be farther apart than the gap, and here they are less.', 'One is n-type, the other p-type.'], md`Each is $0.0259\ln(10^{17}/1.5\times10^{10}) = 0.41$ eV from $E_i$, on opposite sides: 0.81 eV apart.`),
    Q(md`A sample has $E_F$ exactly 0.56 eV below $E_c$ at 300 K. It is most likely…`, ['nearly intrinsic Si', 'heavily doped n-type', 'degenerate n-type', 'p-type with $10^{17}$ holes'], 0,
      [null, 'Heavily n-type puts $E_F$ near $E_c$.', 'Degenerate means $E_F$ in or very near a band.', 'That would put $E_F$ about 0.41 eV below $E_i$.'], md`0.56 eV below $E_c$ is midgap in Si (about 13 meV above $E_i$).`),
    Q(md`The doping of an n-type sample is raised 1000× (still non-degenerate). The minority hole concentration changes by…`, ['÷1000, and $E_F$ rises by 0.18 eV', '÷1000, and $E_F$ is unchanged', '×1000, and $E_F$ rises by 0.18 eV', '÷10⁶, and $E_F$ rises by 0.36 eV'], 0,
      [null, 'More electrons push $E_F$ toward $E_c$.', 'Fewer holes.', '$p_0 = n_i^2/n_0$ falls by the same factor as $n_0$ rises: ÷1000, and $E_F$ moves $kT\\ln1000 = 0.18$ eV.'], md`Three decades, 60 meV each.`),
    Q(md`Which statement about $n_i$ is **false**?`, ['$n_i$ depends on the doping', '$n_i$ grows with temperature', '$n_i$ is smaller for wider gaps', '$n_i^2 = n_0p_0$ at equilibrium'], 0,
      [null, 'True.', 'True.', 'True.'], md`$n_i$ is a property of the material and temperature only; doping changes how $n_0$ and $p_0$ split the product $n_i^2$.`),
    Q(md`For holes in the valence band, the probability that a state at energy $E$ is occupied **by a hole** is…`, ['$1 - f(E)$', '$f(E)$', '$f(E)/2$', '$e^{(E - E_F)/kT}$'], 0,
      [null, 'That is the probability it holds an electron.', 'No.', 'Close, but the full form is $1 - f(E)$; the exponential is only the tail approximation for $E \\ll E_F$, and with the opposite sign.'], md`A hole is an empty state: probability $1 - f(E)$.`),
    R(md`### Temperature and compensation`),
    Q(md`A doped Si sample is in its extrinsic plateau at 300 K. You heat it until $n_i = N_d$. Then $n_0$ is…`, ['about $1.6N_d$', 'exactly $N_d$', '$2N_d$', '$N_d/2$'], 0,
      [null, 'Thermal pairs now add a lot.', 'Not quite: $n_0 = N_d/2 + \\sqrt{N_d^2/4 + N_d^2}$.', 'Smaller than that.'], md`$n_0 = N_d(0.5 + \sqrt{1.25}) = 1.62N_d$.`),
    Q(md`Why does a compensated sample ($N_d = N_a$) have **lower** mobility than intrinsic Si?`, ['its $N_d + N_a$ ionized dopants scatter', 'it has more carriers than intrinsic', 'its band gap is a bit smaller', 'it is degenerate, like a metal'], 0,
      [null, 'It has about $n_i$ of each.', 'Same gap.', 'No.'], md`Carriers follow the net doping; scattering follows the total.`),
    Q(md`At 0 K an n-type sample's $E_F$ lies between $E_d$ and $E_c$. As the temperature rises through freeze-out, $E_F$…`, ['drops below $E_d$ toward $E_i$', 'rises into the conduction band', 'stays between $E_d$ and $E_c$', 'jumps to $E_v$ (p-type)'], 0,
      [null, 'Only in degenerate material.', 'It keeps moving toward $E_i$.', 'No.'], md`Ionization empties the donor levels, so $E_F$ must fall below them.`),
    R(md`### Drift and resistance`),
    Q(md`A Si bar's current doubles when the voltage doubles, but quadruples when the length is halved **and** the voltage doubled. Is that consistent with Ohm's law?`, ['yes: $R$ halves and $V$ doubles', 'no: it should only double', 'no: it should stay the same', 'only at high fields'], 0,
      [null, 'Both changes act.', 'Both changes increase the current.', 'Low-field behavior.'], md`$I = V/R = VA/\rho L$: ×2 from $V$, ×2 from $1/L$.`),
    Q(md`Two bars have the same resistivity, but one is twice as long and twice as wide (same thickness). Their resistances are…`, ['equal', 'the long one is double', 'the long one is half', 'the long one is 4×'], 0,
      [null, 'Width doubles too.', 'No.', 'No.'], md`$R = \rho L/(Wt)$: $2/2 = 1$. (Same number of "squares".)`),
    Q(md`Doping an intrinsic Si bar with $10^{15}$ donors changes its resistance by roughly…`, ['about ÷$5\\times10^4$', 'about ÷10', 'about ÷2', 'about ×$5\\times10^4$'], 0,
      [null, 'Far more: the carrier count jumps from $1.5\\times10^{10}$ to $10^{15}$.', 'No.', 'More carriers, less resistance.'], md`$\sigma$ goes from $q n_i(\mu_n + \mu_p) \approx 4\times10^{-6}$ to $qN_d\mu_n \approx 0.2\,(\Omega\text{cm})^{-1}$.`),
    Q(md`Velocity saturation means that in a very short channel, shrinking the channel length further…`, ['helps less: carriers already near $10^7$ cm/s', 'lets carriers move faster than light', 'stops the current altogether', 'increases the low-field mobility'], 0,
      [null, 'No.', 'No.', 'Mobility is a low-field quantity.'], md`Transit time ≈ $L/v_{sat}$ once the field is high.`),
    R(md`### Equilibrium and band diagrams`),
    Q(md`An $n^+$–$n$ step at equilibrium: which side is at the higher electrostatic potential?`, ['the $n^+$ side', 'the $n$ side', 'neither', 'it depends on the current'], 0,
      [null, 'Electrons left the $n^+$ side, leaving it positive.', 'There is a step.', 'No current at equilibrium.'], md`The $n^+$ bands sit lower (its $E_F$ is closer to $E_c$ with the bands aligned so $E_F$ is flat), so its potential is higher.`),
    Q(md`On an equilibrium band diagram, where is the electric field strongest?`, ['where the bands are steepest', 'where $E_F$ is closest to $E_c$', 'where the bands are flat', 'wherever $E_F$ crosses $E_i$'], 0,
      [null, 'That is where electrons are plentiful.', 'Flat means no field.', 'That is where $n = p$.'], md`$\mathscr{E} = \tfrac1q\,dE_c/dx$.`),
    Q(md`Two samples are joined; afterwards the band step is 0.6 eV. Before contact, their work functions (or Fermi levels) differed by…`, ['0.6 eV', '0.3 eV', '1.12 eV', '0'], 0,
      [null, 'The whole difference becomes the step.', 'No.', 'They had to differ to make a step.'], md`$qV_0$ equals the original $E_F$ difference.`),
    R(md`### Light, recombination and quasi-Fermi levels`),
    Q(md`A 2 eV photon and a 3 eV photon are each absorbed in Si. Compared with the 2 eV photon, the 3 eV photon makes…`, ['the same one pair, and more heat', 'two pairs instead of one', 'a pair with a larger band gap', 'no pair: too much energy'], 0,
      [null, 'One pair per photon (well below several times $E_g$).', 'The gap is fixed.', 'Both are above the gap.'], md`Excess $h\nu - E_g$ thermalizes.`),
    Q(md`After a light pulse in n-type Si, $F_p$ starts far below the dark $E_F$ and then…`, ['rises back to $E_F$ over a few $\\tau_p$', 'falls further below $E_F$', 'stays put until heated', 'jumps above $E_c$ briefly'], 0,
      [null, 'The excess decays.', 'It returns as $p \\to p_0$.', 'No.'], md`$E_i - F_p = kT\ln(p/n_i)$ shrinks as $p$ falls back to $p_0$.`),
    Q(md`Under the same light, which Si sample has the larger steady excess: lifetime 1 μs or 10 ns?`, ['1 μs, by 100×', '10 ns', 'equal', 'neither has an excess'], 0,
      [null, 'Shorter lifetime, smaller excess.', '$\\delta = g\\tau$.', 'Light makes an excess.'], md`$\delta n = g_{op}\tau$.`),
    Q(md`In an indirect-gap material, adding defects with levels near midgap mostly…`, ['shortens the lifetime', 'makes it emit light efficiently', 'increases the band gap', 'raises the mobility'], 0,
      [null, 'Trap recombination makes heat.', 'No.', 'Defects lower mobility, if anything.'], md`Recombination centers.`),
    R(md`### Diffusion and continuity`),
    Q(md`Holes are injected at $x = 0$ into a long n-type bar. Doubling the injected excess $\Delta p$ changes the diffusion length by…`, ['nothing', '×2, with twice the carriers', '×√2, like $L = \\sqrt{D\\tau}$', '÷2, by crowding'], 0,
      [null, '$L = \\sqrt{D\\tau}$ doesn’t depend on $\\Delta p$ (at low level).', 'No.', 'No.'], md`The shape stays; only the height doubles.`),
    Q(md`At $x = L_p$ in steady injection, the ratio of hole current to total current is about…`, ['0.37', '0.63', '1', '0'], 0,
      [null, 'That is the electrons’ share.', 'Only at $x = 0$.', 'Only far away.'], md`$J_p(x)/J = e^{-x/L_p}$.`),
    Q(md`A Gaussian pulse of excess holes spreads with no field. At its peak, the hole **current** is…`, ['zero, and the peak height falls', 'largest, since $\\delta p$ is largest', 'negative, flowing back to the start', 'equal to the drift current'], 0,
      [null, 'The slope is zero at the peak.', 'No.', 'No field, no drift.'], md`No gradient at the peak; but curvature there is negative, so the peak drops.`),
    Q(md`Which quantity is the **same** for electrons and holes at a given temperature?`, ['$D/\\mu = kT/q$', '$D$, the diffusion constant', '$\\mu$, the mobility', '$L$, the diffusion length'], 0,
      [null, 'Electrons diffuse faster.', 'Electrons are more mobile in Si.', 'Depends on $D$ and $\\tau$.'], md`The Einstein ratio depends only on $T$.`),
  ];
  unit.lessons.push({ id: 'e1-xbank2', title: 'Harder conceptual questions II', kind: 'review', steps: bank2 });
})();

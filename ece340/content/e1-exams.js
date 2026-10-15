/* Exam-style practice for Exam 1: the Fall 2015 exam worked through, two harder practice exams with the same five-problem
   structure, endless exam-style problems (js/gens-exam.js), and a bank of harder conceptual questions in the exam's
   styles. Built after the generators are loaded; fixed-parameter generator calls become static problems. */
(function () {
  'use strict';
  const { R, P, Q, G } = C;
  const FX = (name, o, src) => P(Object.assign(GENS[name](o), { src }));
  const FIX = (q, mc, a, why, sol, src) => P({ q, parts: [{ mc, a, why, fixed: true }], sol, src });
  const CIRCLE = ['INCREASE', 'DECREASE', 'STAY THE SAME', 'NOT ENOUGH INFORMATION'];

  // ---------------------------------------------------------------------------------- the 2015 exam, worked
  const x15 = [
    R(md`
      This is the Fall 2015 Exam 1, rebuilt as interactive problems with full solutions. It has five problems, one per big idea: the Fermi level across temperature, carrier concentration and neutrality, drift and resistance, excess carriers, and diffusion. The exam asks you to **draw, explain and justify** as much as to compute, so read every solution even when you get the part right.

      Work each problem on paper first, as you would in the exam (60 minutes for all five), then check.
    `),
    R(md`### Problem 1: Energy bands and charge carriers`),
    FX('ex_ef_temps', { p: true, dE: 15, N: 1e14, Thot: 500, niHot: 5e14 }, '2015 · Problem 1'),
    R(md`### Problem 2: Carrier concentration and space-charge neutrality`),
    FIX(md`(a) What is the probability that a state **at the Fermi level** is occupied at $T = 0$ K? At 300 K?`,
      ['½ at any temperature', '1 at 0 K, ½ at 300 K', '0 at 0 K, ½ at 300 K', '½ at 0 K, less at 300 K'], 0,
      [null, 'At 0 K the step sits exactly at $E_F$; states below are full and above are empty, and $E_F$ itself is the ½ point.', 'Same reasoning.', '$f(E_F) = 1/(1 + e^0) = \\tfrac12$ at every $T$.'],
      md`$f(E_F) = \dfrac{1}{1 + e^{0}} = \dfrac12$ at any temperature. The Fermi level is **defined** as the energy whose occupation probability is one half.`, '2015 · Problem 2a'),
    FX('ex_nT', { Nd: 1e15, dopedIsA: true, ask: 'which' }, '2015 · Problem 2b'),
    FX('ex_nT', { Nd: 1e15, dopedIsA: true, ask: 'low' }, '2015 · Problem 2b'),
    FX('ex_nT', { Nd: 1e15, dopedIsA: true, ask: 'high' }, '2015 · Problem 2b'),
    FX('ex_comp2T', { ab: [3, 1], c: 1, TH: 410 }, '2015 · Problem 2c–d'),
    R(md`### Problem 3: Drift and resistance

      A semiconductor doped only with donors has the $n(T)$ curve of a doped sample: freeze-out below about 100 K, a plateau at $N_d = 10^{16}\,\text{cm}^{-3}$, intrinsic above about 500 K. The electron and hole mobilities are 5000 and 3000 cm²/V·s at 300 K, and 3000 and 2500 cm²/V·s at 500 K. At 300 K assume complete ionization and $n_i = 10^{10}\,\text{cm}^{-3}$.`),
    FIX(md`(a) Why do both mobilities **decrease** at 500 K compared with 300 K?`,
      ['lattice scattering grows with T', 'impurity scattering grows with T', 'the carrier concentration rises', 'the effective masses double'], 0,
      [null, 'Impurity scattering gets weaker when hot: faster carriers are deflected less.', 'Mobility is per carrier; the count doesn’t set it.', 'Masses barely change.'],
      md`More phonons, more frequent collisions, shorter $\bar t$, lower $\mu = q\bar t/m^*$.`, '2015 · Problem 3a'),
    P({ src: '2015 · Problem 3b', q: md`(b) The bar is 0.5 cm long with a 0.01 cm² cross-section, and 5 V is applied. Find the current at 300 K.`,
      parts: [{ lbl: md`I`, ans: 0.8, unit: 'A', tol: { rel: 0.02 } }],
      hints: [md`$p_0 = n_i^2/N_d = 10^4$: negligible. $\sigma \approx qN_d\mu_n$.`],
      sol: md`$\sigma = qN_d\mu_n + qp_0\mu_p \approx (1.6\times10^{-19})(10^{16})(5000) = 8\,(\Omega\text{cm})^{-1}$; $R = \dfrac{L}{\sigma A} = \dfrac{0.5}{8\times0.01} = 6.25\,\Omega$; $I = 5/6.25 = 0.8$ A.` }),
    FIX(md`(c) At 500 K, the ratio of hole current to electron current…`, CIRCLE, 0,
      [null, 'At 500 K the sample is near intrinsic: thermal pairs make $p$ comparable to $n$.', 'At 300 K holes were negligible ($10^4$ against $10^{16}$); now they are not.', 'The plot and the mobilities are enough.'],
      md`At 300 K, $J_p/J_n = p_0\mu_p/n_0\mu_n \approx 10^{-12}$. At 500 K many electron–hole pairs are generated, so $p$ is no longer negligible and the hole share of the current grows: **increase**.`, '2015 · Problem 3c'),
    FIX(md`(d) Going from 300 K to 250 K, the electron current (same voltage)…`, CIRCLE, 0,
      [null, 'Fewer phonons at 250 K: mobility goes up while $n$ stays on the plateau.', '$n_0 = N_d$ on the plateau, unchanged.', 'The official solution accepted this only with a full argument that impurity scattering could matter; the expected answer is increase.'],
      md`On the plateau $n = N_d$ doesn't change, and cooling reduces lattice scattering, so $\mu_n$ rises: **increase**. (Arguing "not enough information" was accepted only with a careful explanation that the doping, and so the role of impurity scattering, is unknown.)`, '2015 · Problem 3d'),
    R(md`### Problem 4: Excess carriers with generation and recombination`),
    FX('ex_flash', { k: 15, dp: 1e12, m: 1 }, '2015 · Problem 4'),
    R(md`### Problem 5: Diffusion`),
    FX('ex_arrows', { el: false, pts: [0, 1, 3, 6] }, '2015 · Problem 5a'),
    FIX(md`(b) The excess holes are $\delta p(x) = A\left[e^{-(x - a)^2/c} + 0.8\,e^{-(x - b)^2/c}\right]$, with no field. $J_p(x)$ is…`,
      [md`$\dfrac{2qD_pA}{c}\left[(x - a)e^{-(x - a)^2/c} + 0.8(x - b)e^{-(x - b)^2/c}\right]$`, md`$-\dfrac{2qD_pA}{c}\left[(x - a)e^{-(x - a)^2/c} + 0.8(x - b)e^{-(x - b)^2/c}\right]$`, md`$qD_pA\left[e^{-(x - a)^2/c} + 0.8\,e^{-(x - b)^2/c}\right]$`, md`$\dfrac{2qD_nA}{c}\left[(x - a)e^{-(x - a)^2/c} + 0.8(x - b)e^{-(x - b)^2/c}\right]$`], 0,
      [null, 'Sign: $J_p = -qD_p\\,d\\delta p/dx$, and the derivative of each Gaussian is $-\\tfrac{2(x - a)}{c}e^{\\ldots}$, so the minus signs cancel.', 'You must differentiate.', 'Holes use $D_p$.'],
      md`$J_p = -qD_p\dfrac{d\,\delta p}{dx}$, with $\dfrac{d}{dx}e^{-(x - a)^2/c} = -\dfrac{2(x - a)}{c}e^{-(x - a)^2/c}$. Check: just right of a peak ($x > a$) $J_p > 0$: holes flow and carry current to the right, down the slope.`, '2015 · Problem 5b'),
  ];

  // ---------------------------------------------------------------------------------- practice exam A
  const xA = [
    R(md`
      Same five-problem structure as the 2015 exam, with harder twists. Give yourself 60 minutes, work on paper, then check each part. Every solution explains the reasoning the graders look for.
    `),
    R(md`### Problem 1: Fermi level from 0 K to hot`),
    FX('ex_ef_temps', { p: false, dE: 45, N: 1e14, Thot: 550, niHot: 7e14 }, 'Practice A · 1'),
    FIX(md`Between 0 K and 50 K, which way does $E_F$ move in this n-type sample, and why?`,
      ['down, toward $E_i$, as donors ionize', 'up, into the conduction band', 'it doesn’t move until 300 K', 'down, past $E_i$ into p-type'], 0,
      [null, 'Not at this doping: it would have to be degenerate.', 'It moves continuously with temperature.', 'An n-type sample never has $E_F$ below $E_i$.'],
      md`At 0 K, $E_F$ is midway between $E_d$ and $E_c$; with rising $T$ it drops steadily toward $E_i$, crossing below $E_d$ as the donors ionize.`, 'Practice A · 1'),
    P({ src: 'Practice A · 1', q: md`At 300 K this sample's donor concentration is doubled. How far does $E_F$ move, and which way?`, parts: [{ lbl: md`\Delta E_F`, ans: 0.01795, unit: 'eV' }],
      sol: md`$E_F - E_i = kT\ln(N_d/n_i)$; doubling $N_d$ adds $kT\ln2 = 0.018$ eV, upward.` }),
    R(md`### Problem 2: Statistics, plots and neutrality`),
    FIX(md`A state lies 0.0777 eV above $E_F$. Its occupation probability at 600 K, compared with 300 K, is…`,
      ['higher, as $kT$ doubles', 'the same: only $E - E_F$ matters', 'lower, as states spread out', 'exactly ½ at both temperatures'], 0,
      [null, 'The distance is measured in units of $kT$, which doubles.', '$f = 1/(1 + e^{(E - E_F)/kT})$ grows as $kT$ grows.', 'Only at $E_F$.'],
      md`$f = 1/(1 + e^{3}) = 0.047$ at 300 K; $1/(1 + e^{1.5}) = 0.18$ at 600 K.`, 'Practice A · 2'),
    FX('ex_nT', { Nd: 1e16, dopedIsA: false, ask: 'Nd' }, 'Practice A · 2'),
    FX('ex_nT', { Nd: 1e16, dopedIsA: false, ask: 'mid' }, 'Practice A · 2'),
    FX('ex_comp2T', { ab: [2, 5], c: 3, TH: 430 }, 'Practice A · 2'),
    R(md`### Problem 3: Drift and resistance

      An n-type bar ($N_d = 5\times10^{15}$, 300 K, $n_i = 1.5\times10^{10}$) is 1 cm long with a $10^{-2}$ cm² cross-section; $\mu_n = 1300$, $\mu_p = 450$ cm²/V·s.`),
    P({ src: 'Practice A · 3', q: md`Find the resistance and the current at 2 V.`, parts: [{ lbl: md`R`, ans: 96.15, unit: 'Ω' }, { lbl: md`I`, ans: 0.0208, unit: 'A' }],
      sol: md`$\sigma = (1.6\times10^{-19})(5\times10^{15})(1300) = 1.04\,(\Omega\text{cm})^{-1}$; $R = \dfrac{1}{1.04\times10^{-2}} = 96.2\,\Omega$; $I = 2/96.2 = 20.8$ mA.` }),
    FX('ex_circle', { i: 13 }, 'Practice A · 3'),
    FX('ex_circle', { i: 9 }, 'Practice A · 3'),
    FX('ex_circle', { i: 10 }, 'Practice A · 3'),
    R(md`### Problem 4: Excess carriers`),
    FX('ex_flash', { k: 14, dp: 5e11, m: 0.5 }, 'Practice A · 4'),
    FX('ex_ray', { p: true, k: 16, tau: 1 }, 'Practice A · 4'),
    R(md`### Problem 5: Diffusion`),
    FX('ex_arrows', { el: true, pts: [0, 2, 3, 5] }, 'Practice A · 5'),
    FX('ex_jexpr', { i: 3 }, 'Practice A · 5'),
    FIX(md`For the profile $n(x) = N_de^{-x/\alpha}$ at equilibrium, the electric field…`,
      ['$+x$, magnitude $kT/q\\alpha$', '$-x$, magnitude $kT/q\\alpha$', 'zero: it is equilibrium', '$+x$, magnitude $q\\alpha/kT$'], 0,
      [null, 'Electrons diffuse to $+x$; the uncovered donors behind them make the field point to $+x$.', 'Equilibrium needs a field to cancel diffusion.', 'Units: V/cm must come from $kT/q$ divided by a length.'],
      md`$\mathscr{E} = -\dfrac{kT}{q}\dfrac1n\dfrac{dn}{dx} = +\dfrac{kT}{q\alpha}$.`, 'Practice A · 5'),
  ];

  // ---------------------------------------------------------------------------------- practice exam B
  const xB = [
    R(md`Another full exam in the same format, mixing in the review-sheet problems. 60 minutes, on paper first.`),
    R(md`### Problem 1: Fermi level from 0 K to hot`),
    FX('ex_ef_temps', { p: true, dE: 45, N: 5e14, Thot: 550, niHot: 2.1e15 }, 'Practice B · 1'),
    FIX(md`Why is $E_F$ at 0 K **between** $E_v$ and $E_a$ in p-type material, rather than at $E_a$?`,
      ['it separates full VB states from empty $E_a$', 'acceptors are already ionized at 0 K', 'because $f(E_a) = 1$ at 0 K', 'it isn’t: it sits at $E_a$ exactly'], 0,
      [null, 'They are not ionized at 0 K.', 'Acceptor states are empty of electrons at 0 K.', 'It lies between the full and the empty levels.'],
      md`At 0 K, $f$ is a step from full to empty; the step must fall between $E_v$ (full) and $E_a$ (empty).`, 'Practice B · 1'),
    R(md`### Problem 2: Neutrality and plots`),
    FX('ex_nT', { Nd: 1e14, dopedIsA: true, ask: 'mid' }, 'Practice B · 2'),
    FX('ex_comp2T', { ab: [6, 2], c: 2, TH: 420 }, 'Practice B · 2'),
    P({ src: 'Practice B · 2', q: md`Germanium ($n_i = 2.5\times10^{13}$ at 300 K) is doped with $N_d = 10^{14}\,\text{cm}^{-3}$. Find $n_0$ and $p_0$.`, parts: [{ lbl: md`n_0`, ans: 1.0590e14, unit: 'cm^{-3}' }, { lbl: md`p_0`, ans: 5.902e12, unit: 'cm^{-3}' }],
      sol: md`$n_0 = 5\times10^{13} + \sqrt{(5\times10^{13})^2 + (2.5\times10^{13})^2} = 1.059\times10^{14}$; $p_0 = n_i^2/n_0 = 5.90\times10^{12}$. Not negligible: Ge's large $n_i$ needs the quadratic even at moderate doping.` }),
    R(md`### Problem 3: Drift, Hall and resistance`),
    P({ src: 'Practice B · 3', q: md`A Hall measurement: $I_x = 2$ mA, $B_z = 0.2$ T $= 2\times10^{-5}$ Wb/cm², sample thickness $t = 0.02$ cm, Hall voltage $V_{AB} = +1$ mV (positive: p-type). Find $p_0$.`, parts: [{ lbl: md`p_0`, ans: 1.25e16, unit: 'cm^{-3}' }],
      sol: md`$p_0 = \dfrac{I_xB_z}{qtV_{AB}} = \dfrac{(2\times10^{-3})(2\times10^{-5})}{(1.6\times10^{-19})(0.02)(10^{-3})} = 1.25\times10^{16}\,\text{cm}^{-3}$.` }),
    FX('ex_circle', { i: 4 }, 'Practice B · 3'),
    FX('ex_circle', { i: 15 }, 'Practice B · 3'),
    FIX(md`A layer of depth $d$ has donor doping $N_d(x)$ that falls with depth. Its resistance along the layer (length $L$, width $W$) is…`,
      [md`$R = \dfrac{L}{qW\int_0^d\mu_n(x)N_d(x)\,dx}$`, md`$R = \dfrac{L}{q\mu_n(0)N_d(0)Wd}$`, md`$R = \dfrac{L}{Wd}\int_0^d\rho(x)\,dx$`, md`$R = \dfrac{qW}{L}\int_0^d\mu_nN_d\,dx$`], 0,
      [null, 'Using the surface doping ignores that deeper slices conduct less.', 'Thin slices are in parallel: add conductances, not resistivities.', 'That is the conductance, not the resistance.'],
      md`Each slice $dx$ conducts $dG = q\mu_nN_d(x)W\,dx/L$; parallel slices add conductances.`, 'Practice B · 3'),
    R(md`### Problem 4: Excess carriers and quasi-Fermi levels`),
    FX('ex_qflhot', { T: [450, 1e14], Nd: 1e16, g: 1e19, tau: 1e-6 }, 'Practice B · 4'),
    FIX(md`Part of an n-type Si sample ($N_D = 10^{15}$, 300 K) is held in a steady state with $n \approx N_D$ and $p = n_i(1 - x/L) + n_i^2/N_D$ for $0 \le x \le L$, with negligible field. Across $0 \to L$, the band diagram has…`,
      ['flat bands; $F_n$ flat; $F_p$ rising from $E_i$ to $E_F$', 'bands sloping down; $F_p$ flat at $E_F$', '$F_n$ and $F_p$ both flat and equal', 'flat bands; $F_n$ flat; $F_p$ falling toward $E_v$'], 0,
      [null, 'No field means flat bands; $F_p$ follows $p(x)$.', 'Then $p$ would equal $p_0$ everywhere.', '$F_p$ falling would mean $p$ growing; here $p$ shrinks toward $p_0$.'],
      md`At $x = 0$, $p \approx n_i$, so $F_p \approx E_i$; as $x \to L$, $p \to p_0 = n_i^2/N_D$, so $F_p \to E_F$. It rises slowly at first, then sharply near $L$ (logarithmic). $F_n$ stays at $E_F$ because $n \approx N_D$.`, 'Review sheet · 2'),
    R(md`### Problem 5: Diffusion and recombination`),
    FX('ex_arrows', { el: false, pts: [1, 2, 4, 5] }, 'Practice B · 5'),
    P({ src: 'Practice B · 5', q: md`Electrons are injected into long p-type Si: $\Delta n = 10^{16}\,\text{cm}^{-3}$ at $x = 0$, $A = 10^{-3}$ cm², $\mu_n = 1200$, $\tau_n = 1$ ns. Find $D_n$, $L_n$, the stored charge, and the current at $x = 0$.`,
      parts: [{ lbl: md`D_n`, ans: 31.08, unit: 'cm^2/s' }, { lbl: md`L_n`, ans: 1.763, unit: 'μm' }, { lbl: md`Q_n`, ans: 2.821e-13, unit: 'C' }, { lbl: md`I(0)`, ans: 0.2821, unit: 'mA' }],
      sol: md`$D_n = 0.0259\times1200 = 31.1$; $L_n = \sqrt{31.1\times10^{-9}} = 1.76\times10^{-4}$ cm; $Q_n = qA\Delta nL_n = (1.6\times10^{-19})(10^{-3})(10^{16})(1.763\times10^{-4}) = 2.82\times10^{-13}$ C; $I(0) = Q_n/\tau_n = 0.282$ mA, the largest anywhere; far away the electron diffusion current is zero.` }),
  ];

  // ---------------------------------------------------------------------------------- harder conceptual bank
  const bank = [
    R(md`
      Harder conceptual questions in the exam's styles: explain-why, predict-the-change, read-the-diagram, and "is this even possible?". Several need two steps of reasoning. Every option comes with the reason it is right or wrong.
    `),
    R(md`### Bands, carriers and the Fermi level`),
    Q(md`A Si sample at 300 K is claimed to be in equilibrium with $n = p = 10^{15}\,\text{cm}^{-3}$. This is…`, ['impossible: $np$ must equal $n_i^2$', 'a compensated sample, $N_d = N_a$', 'an intrinsic sample at 300 K', 'possible if it is very pure'], 0,
      [null, 'Compensated material still has $np = n_i^2$.', 'Intrinsic Si has $n = p = 1.5\\times10^{10}$.', 'Purity gives $n = p = n_i$.'], md`$np = 10^{30} \ne n_i^2$: there must be excess carriers (light or injection).`),
    Q(md`n-type Si (extrinsic) has $E_c - E_F = 0.25$ eV at 300 K. Heated to 400 K (still extrinsic), $E_c - E_F$…`, ['increases with $kT$ and $N_c$', 'stays the same: $n_0$ is unchanged', 'decreases toward the band edge', 'becomes zero (degenerate)'], 0,
      [null, 'Same $n_0$, but $N_c$ and $kT$ are larger, so $E_F$ must sit farther from $E_c$.', 'The opposite.', 'Only if degenerate.'], md`It slides toward midgap as the temperature rises.`),
    Q(md`In n-type Si with $E_c - E_F = 0.2$ eV, the probability that a state at $E_c$ is **empty** is…`, ['almost 1', 'about $4\\times10^{-4}$', '½', '0'], 0,
      [null, 'That is the probability it is **occupied**: $e^{-0.2/0.0259}$.', 'Only at $E_F$.', 'The tail is not zero.'], md`$1 - f(E_c) = 1 - 4.4\times10^{-4} \approx 1$: even in n-type material nearly all conduction states are empty.`),
    Q(md`$E_F$ is 0.1 eV above $E_v$ in a p-type sample at 300 K. Is $p_0 = N_ve^{-(E_F - E_v)/kT}$ reliable?`, ['borderline: 0.1 eV ≈ 3.9kT', 'no: $E_F$ must be near midgap', 'yes, at any distance', 'no: holes never follow Boltzmann'], 0,
      [null, 'Any non-degenerate position works.', 'Within about $3kT$ of the band it fails.', 'They do in the tail.'], md`The rule of thumb is $E_F - E_v \gtrsim 3kT = 0.078$ eV.`),
    Q(md`In a plot of $\ln n$ against $1/T$ for an intrinsic sample, the slope is about…`, ['$-E_g/2k$', '$-E_g/k$', '$-E_d/k$', '$+E_g/2k$'], 0,
      [null, 'Each carrier gets half the gap: $n_i \\propto e^{-E_g/2kT}$.', 'That is for donors in freeze-out (and even then halved).', 'Concentration falls as $1/T$ grows.'], md`$\ln n_i = \text{const} + \tfrac32\ln T - E_g/2kT$; the exponential dominates. Measuring this slope is one way to find $E_g$.`),
    Q(md`A Si sample's $E_F$ sits **exactly at** $E_i$ at 300 K. Which must be true?`, ['$n_0 = p_0 = n_i$', 'it has no dopants at all', 'it is degenerate', 'it conducts like a metal'], 0,
      [null, 'Exactly compensated material also has $E_F$ at $E_i$.', 'Degenerate means $E_F$ near a band.', 'It is a poor conductor.'], md`$E_F = E_i$ ⇔ $n_0 = p_0$.`),
    Q(md`An electron and a hole are created by a photon well above the gap. A picosecond later…`, ['both are at their band edges', 'the electron is still high in the band', 'they have already recombined', 'they have moved into the gap'], 0,
      [null, 'Thermalization takes about a picosecond.', 'Recombination takes ns to ms.', 'No states in the gap (except defects).'], md`That is why emission is at about $E_g$.`),
    R(md`### Temperature, compensation and drift`),
    Q(md`A Si wafer has $N_d = 10^{17}$ and then gets $N_a = 3\times10^{17}\,\text{cm}^{-3}$. Its resistivity, compared with before…`, ['rises: holes are slower, scattering is up', 'falls: there are twice as many carriers', 'is unchanged: same number of dopants', 'falls: holes are faster than electrons'], 0,
      [null, 'More dopants don’t mean more carriers when they compensate.', '$2\\times10^{17}$ holes against $10^{17}$ electrons, but $\\mu_p$ is much lower and $N_I$ quadrupled.', 'Holes are slower in Si.'], md`$\rho_{\text{new}}/\rho_{\text{old}} = \dfrac{10^{17}\mu_n(10^{17})}{2\times10^{17}\mu_p(4\times10^{17})}$: with typical values about 2–3× higher.`),
    Q(md`A uniformly doped bar has a section in the middle with twice the doping. With current flowing, the electric field in that section is…`, ['about half that elsewhere', 'about twice that elsewhere', 'the same as elsewhere', 'zero inside that section'], 0,
      [null, 'Higher conductivity needs less field for the same current.', '$J = \\sigma\\mathscr{E}$ with the same $J$.', 'Current still flows there.'], md`Series conduction: same $I$, so $\mathscr{E} = J/\sigma$ is smaller where $\sigma$ is larger.`),
    Q(md`Why does mobility fall steeply with doping above about $10^{17}\,\text{cm}^{-3}$ at room temperature?`, ['ionized-impurity scattering takes over', 'lattice scattering grows with doping', 'the effective mass doubles', 'carriers run out at high doping'], 0,
      [null, 'Lattice scattering depends on temperature, not doping.', 'Masses barely change.', 'There are more carriers, not fewer.'], md`$\mu_I \propto T^{3/2}/N_I$ drops below $\mu_L$.`),
    Q(md`In a $\ln n$ versus $1/T$ plot of a doped sample, the steepest part is…`, ['the intrinsic region (slope $-E_g/2k$)', 'the extrinsic plateau region', 'the freeze-out region at low T', 'all parts are equally steep'], 0,
      [null, 'The plateau is flat.', 'Its slope involves only the small donor energy.', 'They differ.'], md`$E_g/2 = 0.56$ eV ≫ the donor energy, so the intrinsic region is far steeper.`),
    R(md`### Equilibrium and band diagrams`),
    P({ q: md`Sample 1 has $E_{F1} - E_i = +0.3$ eV, sample 2 has $E_{F2} - E_i = -0.3$ eV (Si, $E_g = 1.1$ eV). After they are joined, an electron in sample 1 has the same **total** energy as an electron at the conduction-band edge of sample 2. What is its kinetic energy?`,
      parts: [{ lbl: md`E_K`, ans: 0.6, unit: 'eV' }],
      sol: md`At equilibrium the bands step by $qV_0 = 0.3 + 0.3 = 0.6$ eV, with sample 2's bands higher. An electron at sample 2's $E_c$ sits 0.6 eV above sample 1's $E_c$, so in sample 1 it has 0.6 eV of kinetic energy.` }),
    Q(md`In an equilibrium band diagram, $E_c$ slopes down toward $+x$. Plotted on a log scale, $n(x)$ and $p(x)$…`, ['$\\log n$ rises, $\\log p$ falls, equally', 'both rise toward $+x$', 'both are flat, since $E_F$ is flat', '$\\log n$ falls, $\\log p$ rises'], 0,
      [null, 'They move oppositely: $np = n_i^2$.', 'They follow the distance from $E_F$ to the bands, which changes.', '$E_c$ approaches $E_F$, so $n$ rises.'], md`Each 60 meV that $E_c$ drops toward $E_F$ is a decade more $n$ and a decade less $p$.`),
    Q(md`In the same diagram ($E_c$ sloping down toward $+x$, at equilibrium), electrons…`, ['diffuse to $-x$, drift to $+x$: cancel', 'drift to $-x$, diffuse to $+x$: cancel', 'don’t diffuse, since $E_F$ is flat', 'all move toward $+x$'], 0,
      [null, 'Both directions reversed: they are crowded at $+x$ and diffuse back toward $-x$.', 'There is a concentration gradient, so there is diffusion.', 'Zero net flow at equilibrium.'], md`More electrons at $+x$, so they diffuse toward $-x$; the field pushes them back toward $+x$.`),
    R(md`### Light, recombination and quasi-Fermi levels`),
    Q(md`p-type Si ($N_a = 3\times10^{16}$) at equilibrium: are the thermal recombination rates of electrons and holes equal?`, ['yes: each event removes one of each', 'no: holes recombine faster, being more', 'no: electrons recombine faster', 'only in intrinsic material'], 0,
      [null, 'Each event removes a pair.', 'Pairs.', 'True for any doping.'], md`$r = \alpha_rn_0p_0 = \alpha_rn_i^2$ for both.`),
    Q(md`Steady uniform light on n-type Si gives $\delta p = 5\times10^{14}$ with $N_d = 3\times10^{16}$. To keep this up with $\tau_p = 1\,\mu$s, the generation rate is…`, ['$5\\times10^{20}$ cm⁻³s⁻¹', '$5\\times10^{14}$ cm⁻³s⁻¹', '$3\\times10^{22}$ cm⁻³s⁻¹', '$5\\times10^{8}$ cm⁻³s⁻¹'], 0,
      [null, 'That is the concentration, not a rate.', 'Uses the doping instead of $\\delta p$.', 'Multiply, don’t divide, by $10^6$.'], md`$g_{op} = \delta p/\tau_p = 5\times10^{14}/10^{-6}$.`),
    Q(md`Thermal generation $g(T)$ in a sample is $4.5\times10^{10}\,\text{cm}^{-3}\text{s}^{-1}$ and light adds $g_{op} = 10^{19}$. In the balance $g(T) + g_{op} = \alpha_rnp$, the thermal term…`, ['negligible next to $g_{op}$', 'dominant, as it acts everywhere', 'doubled by the light', 'zero under illumination'], 0,
      [null, 'It is $2\\times10^8$ times smaller.', 'No.', 'It never stops.'], md`Subtracting the equilibrium balance leaves $g_{op} = \alpha_r(np - n_0p_0) \approx \delta p/\tau$.`),
    Q(md`Under strong illumination the quasi-Fermi levels of an n-type sample are $F_n$ 0.30 eV above $E_i$ and $F_p$ 0.15 eV below $E_i$. In the dark, $E_F$ was 0.29 eV above $E_i$. This is…`, ['low-level: only the minority level moved', 'high-level: both levels moved far', 'equilibrium: both levels are $E_F$', 'impossible for an n-type sample'], 0,
      [null, 'At high level $F_n$ would move a lot too.', 'Split levels mean non-equilibrium.', 'It is a normal lit sample.'], md`$n$ rose by $e^{0.01/0.0259}$ ≈ 1.5× at most, while $p$ jumped by many decades.`),
    R(md`### Diffusion and continuity`),
    Q(md`p-type doping **increases** toward $+x$ at equilibrium. The built-in field points…`, ['toward $+x$', 'toward $-x$', 'nowhere', 'perpendicular to $x$'], 0,
      [null, 'Holes diffuse toward $-x$ (lower doping), leaving negative acceptors on the $+x$ side: the field points from $-x$ (+) to $+x$ (−).', 'A doping gradient always makes a field.', 'Along the gradient.'], md`$\mathscr{E} = \dfrac{kT}{q}\dfrac1p\dfrac{dp}{dx} > 0$.`),
    Q(md`Electrons are injected at $x = 0$ into long p-type material. Where is the electron diffusion current largest, and what is it far away?`, ['largest at $x = 0$; zero far away', 'zero at $x = 0$, largest far away', 'the same everywhere', 'largest at $x = L_n$'], 0,
      [null, 'The gradient is steepest at the injection point.', 'The excess decays, and so does its gradient.', 'At $L_n$ it is down to 37%.'], md`$J_n \propto e^{-x/L_n}$.`),
    Q(md`Give an intuitive meaning of the diffusion length $L_n$.`, ['mean distance traveled before recombining', 'the distance where the excess reaches zero', 'the length of the sample itself', 'the mean free path between collisions'], 0,
      [null, 'An exponential never reaches zero.', 'It is a material property.', 'That is far shorter (tens of nm).'], md`$Q_n = qA\Delta nL_n$: the stored charge is as if the full excess filled a depth $L_n$.`),
    Q(md`In steady injection into a long bar, is the **total** current at $x = 3L_p$ smaller than at $x = 0$?`, ['no: electrons take over the current', 'yes: it is 5% of it ($e^{-3}$)', 'yes: it has fallen to zero', 'no: it reverses direction'], 0,
      [null, 'Charge would pile up if it differed.', 'Same reason.', 'No.'], md`In 1-D steady state, $dJ/dx = 0$ for the total current.`),
  ];

  C.unit({
    id: 'e1-exam', exam: 'e1', tools: true, num: 'Exam 1', title: 'Exam-style practice',
    lessons: [
      { id: 'e1-x15', title: 'The Fall 2015 exam, worked', kind: 'exam', steps: x15 },
      { id: 'e1-xA', title: 'Practice exam A (harder)', kind: 'mock', steps: xA },
      { id: 'e1-xB', title: 'Practice exam B (harder)', kind: 'mock', steps: xB },
      {
        id: 'e1-xgen', title: 'Exam problems, endless', kind: 'review',
        steps: [
          R(md`Every problem type from the 2015 exam and the review sheet, with new numbers each time. Three correct answers complete each one.

### Fermi level at four temperatures`),
          G('ex_ef_temps'),
          R(md`### Reading an n(T) plot`), G('ex_nT'),
          R(md`### A compensated wafer at two temperatures`), G('ex_comp2T'),
          R(md`### Increase, decrease, same, or not enough information?`), G('ex_circle', { need: 6 }),
          R(md`### Two light flashes`), G('ex_flash'),
          R(md`### The minority carriers vanish`), G('ex_ray'),
          R(md`### Flow and current on a profile`), G('ex_arrows'),
          R(md`### Current from a profile`), G('ex_jexpr'),
          R(md`### Quasi-Fermi levels when hot`), G('ex_qflhot'),
        ],
      },
      { id: 'e1-xbank', title: 'Harder conceptual questions', kind: 'review', steps: bank },
    ],
  });
})();

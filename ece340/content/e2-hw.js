/* Homework, Fall 2026 HW 6–9 (Exam 2 material: diffusion, p-n junctions in and out of equilibrium, breakdown,
   photodiodes and solar cells, LEDs and lasers, metal–semiconductor contacts). Every problem as assigned, blank, with
   answer boxes wherever there is a number or a choice to check, and full worked solutions (the official keys, every
   number re-derived; where a key has a typo or a muddled sentence, the solution here is corrected and says so).
   Figures are the ones printed with the assignments and keys. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const N = (lbl, ans, unit, rel = 0.03) => ({ lbl, ans, unit, tol: { rel } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // options shuffled
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order kept
  const img = (f, alt, w = 420) => `<img class="scan" src="img/hw/${f}.png" alt="${alt}" style="max-width:${w}px" loading="lazy">`;
  const fig = (f, alt, w, cap) => ({ svg: img(f, alt, w), cap });
  const UPDN = ['increases', 'decreases', 'stays the same'];
  const intro = (n, due, topics) => R(md`**Homework ${n}** · due ${due}. ${topics}

Work every part on paper first, with units, the way you would hand it in. Then enter your answers to check them, and open the solution to compare your reasoning.`);

  // ================================================================ HW 6
  const hw6 = [
    intro(6, 'Friday, October 16, 2026', 'Steady-state diffusion, p-n junctions in equilibrium, how doping changes a junction. Four problems, 20 points each.'),
    R(md`### Problem 1 · Steady-state minority-carrier diffusion (20 pts)

A long, uniformly doped n-type Si sample at 300 K occupies $x \ge 0$ (semi-infinite): $N_D = 1.0\times10^{16}\ \text{cm}^{-3}$, $n_i = 1.5\times10^{10}\ \text{cm}^{-3}$, $\mu_p = 450\ \text{cm}^2/\text{V·s}$, $\tau_p = 2.0\ \mu\text{s}$. At $x = 0$, illumination holds $\delta p(0) = 1.0\times10^{14}\ \text{cm}^{-3}$. For $x > 0$ there is no generation and no field; steady state, low-level injection, $\delta p(\infty) = 0$. Use $kT/q = 0.0259$ V and $q = 1.60\times10^{-19}$ C.`),
    P({ src: 'HW6 · 1A (4 pts)', q: md`(A) Calculate the equilibrium minority-hole concentration $p_{n0}$. Verify that the excess concentration satisfies low-level injection.`,
      parts: [N('p_{n0}', 2.25e4, 'cm^{-3}'), N('\\delta p(0)/N_D', 0.01, ''),
        FIX('Low-level injection holds?', ['yes', 'no'], 0, [null, '$\\delta p$ is only 1% of the majority-electron density.'])],
      sol: md`$n_0 \approx N_D$, so $p_{n0} = n_i^2/N_D = (1.5\times10^{10})^2/10^{16} = 2.25\times10^4\ \text{cm}^{-3}$.
Low-level injection means $\delta p \ll n_0$: $\delta p(0)/N_D = 10^{14}/10^{16} = 0.01$. The injected holes are 1% of the electrons, so it holds (and it holds even better for $x > 0$, where $\delta p$ is smaller).` }),
    P({ src: 'HW6 · 1B (4 pts)', q: md`(B) Use the Einstein relation to find $D_p$, then the diffusion length $L_p$.`,
      parts: [N('D_p', 11.7, 'cm^{2}/s'), N('L_p', 48.3, 'µm')],
      sol: md`$D_p = \mu_p\dfrac{kT}{q} = (450)(0.0259) = 11.7\ \text{cm}^2/\text{s}$.
$L_p = \sqrt{D_p\tau_p} = \sqrt{(11.7)(2.0\times10^{-6})} = 4.83\times10^{-3}\ \text{cm} = 48.3\ \mu\text{m}$.` }),
    P({ src: 'HW6 · 1C (4 pts)', q: md`(C) Starting from $D_p\dfrac{d^2\delta p}{dx^2} - \dfrac{\delta p}{\tau_p} = 0$, derive $\delta p(x)$. At what distance has $\delta p$ fallen to 10% of $\delta p(0)$?`,
      parts: [N('x_{10\\%}', 111, 'µm')],
      hints: ['Divide by $D_p$: $\\delta p\'\' - \\delta p/L_p^2 = 0$. Try $e^{\\pm x/L_p}$.', 'Set $e^{-x/L_p} = 0.1$.'],
      sol: md`With $L_p^2 = D_p\tau_p$: $\dfrac{d^2\delta p}{dx^2} - \dfrac{\delta p}{L_p^2} = 0$, so $\delta p = Ae^{-x/L_p} + Be^{x/L_p}$. $\delta p(\infty) = 0$ forces $B = 0$; $\delta p(0)$ fixes $A$:
$$\delta p(x) = 10^{14}e^{-x/L_p}\ \text{cm}^{-3}$$
$0.1 = e^{-x/L_p} \Rightarrow x = L_p\ln 10 = (48.3\ \mu\text{m})(2.303) = 111\ \mu\text{m}$.` }),
    P({ src: 'HW6 · 1D (4 pts)', q: md`(D) Find the hole diffusion current density $J_p(x)$. Evaluate it at $x = 0$ and at $x = L_p$, and give the direction of the conventional hole current.`,
      parts: [N('J_p(0)', 3.87e-2, 'A/cm^{2}'), N('J_p(L_p)', 1.42e-2, 'A/cm^{2}'),
        FIX('Hole current flows toward', ['$+x$', '$-x$'], 0, [null, 'Holes diffuse down their gradient, away from the lit surface: toward $+x$.'])],
      sol: md`$p_{n0}$ is constant, so $J_p = -qD_p\dfrac{d\delta p}{dx} = \dfrac{qD_p\delta p(0)}{L_p}e^{-x/L_p}$.
$$J_p(0) = \frac{(1.6\times10^{-19})(11.7)(10^{14})}{4.83\times10^{-3}} = 3.87\times10^{-2}\ \text{A/cm}^2$$
$J_p(L_p) = J_p(0)e^{-1} = 1.42\times10^{-2}\ \text{A/cm}^2$. Since $dp/dx < 0$, $J_p > 0$: toward $+x$.` }),
    P({ src: 'HW6 · 1E (4 pts)', q: md`(E) Show that the total recombination current per unit area in $x > 0$, $J_{\text{rec}} = q\displaystyle\int_0^\infty \frac{\delta p}{\tau_p}\,dx$, equals the diffusion current entering at $x = 0$. What does this mean physically?`,
      parts: [N('J_{\\text{rec}}', 3.87e-2, 'A/cm^{2}'),
        MC('Physically…', ['every hole that diffuses in recombines somewhere in $x > 0$', 'holes pile up in the sample until the current stops', 'the recombination current flows back out through $x = 0$', 'the electric field sweeps the holes out at $x = \\infty$'], 0,
          [null, 'In steady state nothing accumulates.', 'It is not a current flowing out; holes are destroyed by recombination.', 'There is no field in this problem.'])],
      sol: md`$$J_{\text{rec}} = \frac{q\delta p(0)}{\tau_p}\int_0^\infty e^{-x/L_p}dx = \frac{q\delta p(0)L_p}{\tau_p} = \frac{qD_p\delta p(0)}{L_p} = J_p(0)$$
using $L_p/\tau_p = D_p/L_p$ (from $L_p^2 = D_p\tau_p$). In steady state no excess charge builds up, so every hole entering by diffusion must eventually recombine inside the sample: inflow = total recombination.` }),

    R(md`### Problem 2 · p-n junction in equilibrium (20 pts)

A GaAs p-n diode: $N_D = 4\times10^{16}\ \text{cm}^{-3}$, $N_A = 1.6\times10^{17}\ \text{cm}^{-3}$, 300 K. For GaAs, $E_g = 1.43$ eV, $n_i = 2.1\times10^6\ \text{cm}^{-3}$, $\epsilon = 12.9\epsilon_0$.`),
    P({ src: 'HW6 · 2A (3 pts)', q: md`(A) What is the equilibrium condition, for the Fermi level and for the net current?`,
      parts: [MC('In equilibrium…', ['$E_F$ is flat and the net current is zero', '$E_F$ bends by $qV_0$ and the net current is zero', '$E_F$ is flat and a small saturation current flows', 'the bands are flat and $E_F$ steps by $qV_0$'], 0,
        [null, 'The bands bend; the Fermi level does not.', 'Drift and diffusion cancel exactly for each carrier: zero net current.', 'Backwards: the bands bend by $qV_0$, the Fermi level is constant.'])],
      sol: md`No net current flows (drift and diffusion cancel for electrons and for holes separately) and the Fermi level is constant through the whole structure.` }),
    P({ src: 'HW6 · 2B–2C (6 pts)', q: md`(B) Calculate the contact potential $V_0$. (C) Calculate $x_{n0}$, $x_{p0}$ and the total depletion width $W$.`,
      parts: [N('V_0', 1.26, 'V', 0.01), N('W', 237, 'nm'), N('x_{n0}', 189.6, 'nm'), N('x_{p0}', 47.4, 'nm')],
      hints: ['$V_0 = \\dfrac{kT}{q}\\ln\\dfrac{N_AN_D}{n_i^2}$. GaAs has a tiny $n_i$, so $V_0$ is large.', '$x_{n0} = W\\dfrac{N_A}{N_A + N_D}$: the lighter side gets the wider depletion.'],
      sol: md`$$V_0 = 0.0259\ln\frac{(4\times10^{16})(1.6\times10^{17})}{(2.1\times10^6)^2} = 1.26\ \text{V}$$
$$W = \sqrt{\frac{2\epsilon V_0}{q}\cdot\frac{N_A + N_D}{N_AN_D}} = 237\ \text{nm}$$
$x_{n0} = W\dfrac{N_A}{N_A+N_D} = 189.6$ nm and $x_{p0} = W - x_{n0} = 47.4$ nm. Check: $N_Ax_{p0} = N_Dx_{n0}$ (equal and opposite charge).` }),
    P({ src: 'HW6 · 2D–2E (7 pts)', q: md`(D) Find the electrostatic potential at the metallurgical junction, $V(x = 0)$, relative to the p-side. (E) Plot $\mathscr{E}(x)$ and find its peak.`,
      parts: [N('V(0)', 0.252, 'V'), N('|\\mathscr{E}_0|', 106, 'kV/cm'),
        FIX('The field points toward', ['$+x$ (p to n)', '$-x$ (n to p)'], 1, ['The field points from the positive (n) side to the negative (p) side.', null])],
      hints: ['The potential drop across the p-side is the area of the field triangle there: $\\tfrac12\\mathscr{E}_0x_{p0}$.'],
      sol: md`$$\mathscr{E}_0 = -\frac{q}{\epsilon}N_Ax_{p0} = -106\ \text{kV/cm}$$
(negative: it points from n to p, toward $-x$). The p-side share of the potential is the triangle area:
$$V(0) = \frac{q}{2\epsilon}N_Ax_{p0}^2 = 0.252\ \text{V}$$
Only 0.25 of the 1.26 V drops on the heavily doped p-side; the rest drops across the wider n-side.

[[fig:e]]`, figs: { e: fig('hw6-efield', 'triangular field profile from -xp to xn, peaking at -E0 at x = 0', 420, 'Field profile: linear on each side, peak at the junction.') } }),
    P({ src: 'HW6 · 2F (4 pts)', q: md`(F) Draw the band diagram, with the shape of the bands in the junction and $E_i$, $E_C$, $E_V$, $E_F$ labeled. How far apart are the band edges of the two neutral regions?`,
      parts: [N('\\text{band offset}', 1.26, 'eV', 0.01), FIX('The bands are higher on the', ['p-side', 'n-side'], 0, [null, 'Electron energy is higher where the potential is lower: the p-side.'])],
      sol: md`$E_F$ is flat. The bands sit $qV_0 = 1.26$ eV higher on the p-side and bend through the depletion region (parabolic on each side, most of the bending on the lighter n-side).

[[fig:b]]`, figs: { b: fig('hw6-bands', 'band diagram: bands high on the p-side, bending down across the junction to the n-side, flat Fermi level', 420, 'Equilibrium band diagram of the GaAs junction.') } }),

    R(md`### Problem 3 · Junction properties (20 pts)

Two $p^+n$ junctions: one with n-doping $N_D$, the other with $\tfrac12N_D$. Everything else is the same. For the second junction, does each quantity increase or decrease? Explain mathematically.`),
    P({ src: 'HW6 · 3A–3E (20 pts)', q: md`Compare the second junction ($\tfrac12N_D$) with the first.`,
      parts: [FIX('(A) total depletion charge', UPDN, 1, ['$Q \\propto \\sqrt{V_0N_D}$ for $N_A \\gg N_D$.', null, 'It depends on $N_D$.']),
        FIX('(B) peak field magnitude', UPDN, 1, ['$|\\mathscr{E}_0| \\propto \\sqrt{V_0N_D}$.', null, 'It depends on $N_D$.']),
        FIX('(C) $x_n$', UPDN, 0, [null, 'The depletion pushes farther into a lighter side.', '$x_n \\propto 1/\\sqrt{N_D}$.']),
        FIX('(D) $x_p$', UPDN, 1, ['$x_p = x_nN_D/N_A \\propto \\sqrt{N_D}$.', null, '$x_p \\propto \\sqrt{N_D}$.']),
        FIX('(E) $V_0$', UPDN, 1, ['$V_0 = \\frac{kT}{q}\\ln\\frac{N_AN_D}{n_i^2}$ falls by $\\frac{kT}{q}\\ln2$.', null, 'It falls slightly, by $\\frac{kT}{q}\\ln 2 \\approx 18$ mV.'])],
      sol: md`For $N_A \gg N_D$:
- (A) **Decreases.** $Q = qAN_Dx_n \approx qA\sqrt{\dfrac{2\epsilon V_0N_D}{q}}$, so $Q \propto \sqrt{V_0N_D}$.
- (B) **Decreases.** $|\mathscr{E}_0| = \dfrac{q}{\epsilon}N_Dx_n \approx \sqrt{\dfrac{2qV_0N_D}{\epsilon}}$.
- (C) **Increases**, by about $\sqrt2$: $x_n \approx \sqrt{\dfrac{2\epsilon V_0}{qN_D}}$.
- (D) **Decreases**, by about $1/\sqrt2$: $x_p = x_n\dfrac{N_D}{N_A} \propto \sqrt{N_D}$.
- (E) **Decreases slightly**: $V_0' = V_0 - \dfrac{kT}{q}\ln2$ (18 mV less).` }),

    R(md`### Problem 4 · Si n–p junction in equilibrium (20 pts)

An abrupt Si **n–p** junction (note the order) with a circular cross-section of diameter 10 µm: $N_D = 4.0\times10^{16}\ \text{cm}^{-3}$, $N_A = 1.5\times10^{17}\ \text{cm}^{-3}$, $n_i = 1.5\times10^{10}\ \text{cm}^{-3}$, $\epsilon_s = 11.8\epsilon_0$, 300 K.`),
    P({ src: 'HW6 · 4A (6 pts)', q: md`(A) Find $E_F - E_i$ in the n-region and $E_i - E_F$ in the p-region, then the contact potential $V_0$.`,
      parts: [N('E_F - E_i\\ (n)', 0.383, 'eV', 0.01), N('E_i - E_F\\ (p)', 0.417, 'eV', 0.01), N('V_0', 0.800, 'V', 0.01)],
      sol: md`n-side: $n_0 = N_D$, $E_F - E_i = kT\ln\dfrac{N_D}{n_i} = 0.0259\ln\dfrac{4\times10^{16}}{1.5\times10^{10}} = 0.383$ eV.
p-side: $p_0 = N_A$, $E_i - E_F = 0.0259\ln\dfrac{1.5\times10^{17}}{1.5\times10^{10}} = 0.417$ eV.
$qV_0 = 0.383 + 0.417 = 0.800$ eV, the same as $kT\ln(N_AN_D/n_i^2)$.` }),
    P({ src: 'HW6 · 4B (6 pts)', q: md`(B) Sketch the equilibrium band diagram of this **n–p** junction, labeling $E_C$, $E_V$, $E_i$, $E_F$ and $qV_0$.`,
      parts: [FIX('With n on the left, the bands step', ['up from left to right', 'down from left to right'], 0, [null, 'The p-side bands are higher, and here the p-side is on the right.'])],
      sol: md`The same physics as a p-n junction, drawn mirror-imaged: $E_F$ is flat, the n-side (left) bands are low, the p-side (right) bands are $qV_0 = 0.8$ eV higher. On the n-side $E_F$ sits 0.383 eV above $E_i$; on the p-side 0.417 eV below.

[[fig:np]]`, figs: { np: fig('hw6-np-bands', 'separate n and p band diagrams, then the joined n-p junction with bands stepping up 0.8 eV toward the p-side', 380, 'Top: the two sides apart. Bottom: in contact, $E_F$ lines up and the bands bend.') } }),
    P({ src: 'HW6 · 4C (8 pts)', q: md`(C) Find $W$, $x_{n0}$, $x_{p0}$, the total uncovered charge $Q_+$ in the depletion region, and the peak field $\mathscr{E}_0$.`,
      parts: [N('W', 0.182, 'µm'), N('x_{n0}', 0.144, 'µm'), N('x_{p0}', 0.038, 'µm', 0.04), N('Q_+', 7.22e-14, 'C'), N('\\mathscr{E}_0', 8.80e4, 'V/cm')],
      hints: ['$A = \\pi(5\\ \\mu\\text{m})^2$; convert to cm².'],
      sol: md`$$W = \sqrt{\frac{2\epsilon_sV_0}{q}\left(\frac{1}{N_A} + \frac{1}{N_D}\right)} = 1.82\times10^{-5}\ \text{cm} = 0.182\ \mu\text{m}$$
$x_{n0} = W\dfrac{N_A}{N_A+N_D} = 0.144\ \mu\text{m}$, $x_{p0} = W\dfrac{N_D}{N_A+N_D} = 0.038\ \mu\text{m}$ (wider on the lighter n-side).
$$Q_+ = qAx_{n0}N_D = (1.6\times10^{-19})\pi(5\times10^{-4})^2(1.44\times10^{-5})(4\times10^{16}) = 7.22\times10^{-14}\ \text{C}$$
$$\mathscr{E}_0 = \frac{qN_Dx_{n0}}{\epsilon_s} = 8.80\times10^4\ \text{V/cm}$$` }),
  ];

  // ================================================================ HW 7
  const hw7 = [
    intro(7, 'Friday, October 23, 2026', 'The biased junction: injection, diode currents, design, breakdown. Si at 300 K, $kT = 0.026$ eV and $n_i = 1.5\\times10^{10}\\ \\text{cm}^{-3}$ unless stated. Four problems, 20 points each.'),
    R(md`### Problem 1 · p-n junction under bias (20 pts)

Si p-n junction at 300 K: $N_A = 10^{17}\ \text{cm}^{-3}$ (p-side), $N_D = 5\times10^{17}\ \text{cm}^{-3}$ (n-side), $D_n = D_p = 25\ \text{cm}^2/\text{s}$, $\tau_n = \tau_p = 10$ ns.`),
    P({ src: 'HW7 · 1A–1B (10 pts)', q: md`(A) Calculate $n_p$ and $p_n$ in equilibrium. (B) Calculate the diffusion length.`,
      parts: [N('n_p', 2250, 'cm^{-3}'), N('p_n', 450, 'cm^{-3}'), N('L_n = L_p', 5, 'µm')],
      sol: md`$n_p = n_i^2/N_A = (1.5\times10^{10})^2/10^{17} = 2250\ \text{cm}^{-3}$; $p_n = n_i^2/N_D = 450\ \text{cm}^{-3}$.
$L = \sqrt{D\tau} = \sqrt{25\times10^{-8}} = 5\times10^{-4}$ cm $= 5\ \mu$m.` }),
    P({ src: 'HW7 · 1C–1D (10 pts)', q: md`(C) With a forward bias of 0.5 V, find the excess $\Delta n_p$ at $-x_{p0}$ and $\Delta p_n$ at $x_{n0}$. (D) Find the electron diffusion current density at $-x_{p0}$ and the hole diffusion current density at $x_{n0}$.`,
      parts: [N('\\Delta n_p', 5.45e11, 'cm^{-3}', 0.08), N('\\Delta p_n', 1.09e11, 'cm^{-3}', 0.08), N('J_n', 4.37, 'mA/cm^{2}', 0.08), N('J_p', 0.873, 'mA/cm^{2}', 0.08)],
      hints: ['Law of the junction: $\\Delta n_p = n_p(e^{qV/kT} - 1)$.', '$J = qD\\Delta/L$ at the depletion edge.'],
      sol: md`$\Delta n_p = n_p(e^{qV/kT} - 1) = 2250(e^{0.5/0.0259} - 1) = 5.45\times10^{11}\ \text{cm}^{-3}$, $\Delta p_n = 450(e^{0.5/0.0259} - 1) = 1.09\times10^{11}\ \text{cm}^{-3}$.
$$J_n = q\frac{D_n}{L_n}\Delta n_p = (1.6\times10^{-19})\frac{25}{5\times10^{-4}}(5.45\times10^{11}) = 4.37\ \text{mA/cm}^2$$
$J_p = q\dfrac{D_p}{L_p}\Delta p_n = 0.873\ \text{mA/cm}^2$. The lighter-doped p-side supplies 5× more injected minority carriers, so electron injection dominates.

Note: the exponent makes these very sensitive to $kT$. The key prints $kT = 0.02585$ but its numbers use 0.0259 ($0.026$ gives $5.06\times10^{11}$). Any of these is accepted here.` }),
    RF(md`### Problem 2 · Carrier injection in a p-n junction (20 pts)

The plot shows the steady-state carrier concentrations in an abrupt p-n diode at room temperature ($n_i = 1.5\times10^{10}\ \text{cm}^{-3}$).

[[fig:c]]`, { c: fig('hw7-carriers', 'log plot: pp = 1e15 and np on the left dropping to 1e2 at -xp0; nn = 1e16 and pn on the right dropping at xn0', 460, 'Majority levels flat; minority concentrations dip below equilibrium at the depletion edges.') }),
    P({ src: 'HW7 · 2A–2B (10 pts)', q: md`(A) Is the diode forward or reverse biased? (B) Do low-level injection conditions hold in the quasi-neutral regions?`,
      parts: [FIX('(A) The diode is', ['forward biased', 'reverse biased'], 1, ['Forward bias would raise the minority concentrations above equilibrium at the edges.', null]),
        FIX('(B) Low-level injection holds?', ['yes', 'no'], 0, [null, '$|\\Delta n| \\approx 2\\times10^5$ is tiny next to $p_p = 10^{15}$.'])],
      sol: md`(A) **Reverse biased.** The minority concentrations fall **below** their equilibrium values at the depletion edges (extraction). Forward bias would push them above (injection). (The key's sentence mentions injection under forward bias; it means that forward bias would do the opposite.)
(B) **Yes.** $n_p = n_i^2/p_p = 2.25\times10^5$ and the edge value is $10^2$, so $|\Delta n| = 2.25\times10^5 \ll p_p = 10^{15}\ \text{cm}^{-3}$.` }),
    P({ src: 'HW7 · 2C–2D (10 pts)', q: md`(C) What are the p- and n-side dopings? (D) Find the applied voltage, and the hole concentration (and excess hole concentration) at $x_{n0}$.`,
      parts: [N('N_A', 1e15, 'cm^{-3}'), N('N_D', 1e16, 'cm^{-3}'), N('V_{\\text{bias}}', -0.2, 'V', 0.03), N('p(x_{n0})', 10, 'cm^{-3}', 0.05), N('\\delta p(x_{n0})', -2.25e4, 'cm^{-3}')],
      hints: ['$n(-x_{p0}) = n_pe^{qV/kT}$; read $n(-x_{p0}) = 10^2$ from the plot.', 'Same factor on the n-side: $p(x_{n0}) = p_ne^{qV/kT}$.'],
      sol: md`(C) Majority levels: $N_A = p_p = 10^{15}$, $N_D = n_n = 10^{16}\ \text{cm}^{-3}$.
(D) $n_p = 2.25\times10^5$, so
$$V = \frac{kT}{q}\ln\frac{n(-x_{p0})}{n_p} = 0.0259\ln\frac{10^2}{2.25\times10^5} = -0.200\ \text{V}$$
(The key writes $10^{10}$ in the numerator; that is a typo for $10^2$, which gives its −0.2 V.)
$p_n = n_i^2/n_n = 2.25\times10^4$, and $p(x_{n0}) = p_ne^{qV/kT} = 2.25\times10^4\cdot\dfrac{10^2}{2.25\times10^5} = 10\ \text{cm}^{-3}$. The **excess** is $\delta p = 10 - 2.25\times10^4 \approx -2.25\times10^4\ \text{cm}^{-3}$ (a deficit).` }),
    R(md`### Problem 3 · Designing a protection diode (20 pts)

Design a $p^+$-n Si diode that passes at least $I = 1$ mA at $V_a = 0.7$ V with area $A = 10^{-4}\ \text{cm}^2$. The foundry gives $D_p = 10\ \text{cm}^2/\text{s}$, $\tau_p = 100$ ns. Use $n_i = 10^{10}\ \text{cm}^{-3}$ and 300 K.`),
    P({ src: 'HW7 · 3A–3B (10 pts)', q: md`(A) Which doping sets the current of a $p^+$-n diode? (B) Find $I_s$, then the doping needed.`,
      parts: [MC('(A) The current is set by', ['$N_D$, the lightly doped n-side', '$N_A$, the heavily doped p-side', 'both equally', 'neither: only the area matters'], 0,
        [null, 'The $D_n/(L_nN_A)$ term is negligible when $N_A$ is huge.', 'The $1/N_A$ term is negligible.', '$I_s$ depends on doping through $n_i^2/N$.']),
        N('I_s', 1.83e-15, 'A'), N('N_D', 8.8e15, 'cm^{-3}', 0.05)],
      sol: md`(A) $I_s = qAn_i^2\left(\dfrac{D_p}{L_pN_D} + \dfrac{D_n}{L_nN_A}\right) \approx qAn_i^2\dfrac{D_p}{L_pN_D}$ for $N_A \gg N_D$: the light side ($N_D$) sets it.
(B) $L_p = \sqrt{(10)(10^{-7})} = 10^{-3}$ cm. $I_s = \dfrac{10^{-3}}{e^{0.7/0.0259} - 1} = 1.83\times10^{-15}$ A.
$$N_D = \frac{qAn_i^2D_p}{L_pI_s} = \frac{(1.6\times10^{-19})(10^{-4})(10^{20})(10)}{(10^{-3})(1.83\times10^{-15})} = 8.8\times10^{15}\ \text{cm}^{-3}$$
Use $N_D \approx 9\times10^{15}$ (no more than this, since more doping lowers $I_s$).` }),
    P({ src: 'HW7 · 3C–3D (10 pts)', q: md`(C) Find $I(0.8\ \text{V})/I(0.7\ \text{V})$. (D) The customer puts the diode in series between a 5 V supply and a load, and it burns out. Why, and what passive element fixes it? Size it for 1 mA.`,
      parts: [N('\\text{ratio}', 47.5, ''), MC('(D) The fix', ['a series resistor to limit the current', 'a capacitor in parallel to store the charge', 'a second diode in reverse across it', 'a larger-area diode with the same doping'], 0,
        [null, 'A capacitor does not limit the DC current.', 'That does nothing in forward bias.', 'That raises the current further.']), N('R', 4.3, 'kΩ')],
      sol: md`(C) Both exponentials are huge, so $\dfrac{I(0.8)}{I(0.7)} \approx e^{0.1/0.0259} = 47.5$: every 0.1 V multiplies the current by about 50.
(D) Forward current grows exponentially with voltage; with nothing to drop the rest of the 5 V, an enormous current flows and the diode overheats. Add a series resistor: $R = \dfrac{5 - 0.7}{1\ \text{mA}} = 4.3\ \text{k}\Omega$.` }),
    R(md`### Problem 4 · Junction doping and breakdown (20 pts)

A Si $p^+$-n junction has its n-side doping **doubled**; geometry, temperature and material are unchanged, and avalanche breakdown dominates initially.`),
    P({ src: 'HW7 · 4A–4D (20 pts)', q: md`How does each quantity change?`,
      parts: [FIX('(A) zero-bias junction capacitance', UPDN, 0, [null, '$C \\propto 1/W$ and $W \\propto 1/\\sqrt{N_D}$.', 'W changes.']),
        FIX('(B) built-in potential', UPDN, 0, [null, '$V_0 \\propto \\ln(N_AN_D)$ rises.', 'It depends on $N_D$.']),
        FIX('(C) breakdown voltage', UPDN, 1, ['A higher peak field means breakdown sooner.', null, 'The peak field at a given voltage rises.']),
        MC('(C) Which mechanism becomes more likely?', ['Zener (tunneling) becomes more likely, though avalanche may still dominate', 'avalanche becomes more likely than before', 'neither: the mechanism depends only on temperature', 'punch-through replaces both'], 0,
          [null, 'Narrower depletion favors tunneling, not avalanche.', 'Doping is what sets it.', 'Nothing here suggests punch-through.']),
        MC('(D) Temperature coefficient of $V_{BR}$', ['positive while avalanche dominates; negative if Zener takes over', 'always negative after the change', 'always zero', 'negative while avalanche dominates'], 0,
          [null, 'Only if Zener takes over.', 'Both mechanisms depend on temperature.', 'Avalanche has a positive coefficient.'])],
      sol: md`(A) **Increases.** $W \propto 1/\sqrt{N_D}$ shrinks and $C = \epsilon A/W$ grows.
(B) **Increases** (slightly): $V_0 = \dfrac{kT}{q}\ln\dfrac{N_AN_D}{n_i^2}$ gains $\dfrac{kT}{q}\ln2$.
(C) **Decreases.** The peak field at a given reverse voltage is higher and the depletion narrower, so breakdown comes sooner. The narrower depletion favors Zener tunneling; with only a doubling, avalanche may still dominate (the key accepts either argument if justified).
(D) Avalanche: $V_{BR}$ **rises** with temperature (more phonon scattering shortens the mean free path). Zener: $V_{BR}$ **falls** with temperature (the gap shrinks). So the coefficient stays positive if avalanche still dominates, and turns negative if Zener takes over.` }),
  ];

  // ================================================================ HW 8
  const hw8 = [
    intro(8, 'Friday, October 30, 2026', 'Illuminated junctions, forward and reverse current, breakdown, solar cells. Four problems, 20 points each.'),
    R(md`### Problem 1 · An illuminated junction (20 pts)

A Si p-n junction under steady illumination, $g_{op} = 5\times10^{16}\ \text{cm}^{-3}\text{s}^{-1}$, 300 K: $N_A = 10^{17}$, $N_D = 4\times10^{15}\ \text{cm}^{-3}$, $D_n = 20$, $D_p = 8\ \text{cm}^2/\text{s}$, $\tau_n = 0.45\ \mu$s, $\tau_p = 0.5\ \mu$s, $A = 1\ \text{cm}^2$. The two sides are shorted with a wire.`),
    P({ src: 'HW8 · 1A–1B (9 pts)', q: md`(A) Find the dark reverse saturation current $I_0$. (B) Find the minority electron and hole concentrations far from the junction.`,
      parts: [N('I_0', 38.4, 'pA'), N('n_p\\ (\\text{far})', 2.25e10, 'cm^{-3}'), N('p_n\\ (\\text{far})', 2.5e10, 'cm^{-3}')],
      sol: md`$L_n = \sqrt{20\times0.45\times10^{-6}} = 30\ \mu$m, $L_p = \sqrt{8\times0.5\times10^{-6}} = 20\ \mu$m.
$$I_0 = qAn_i^2\left(\frac{D_p}{L_pN_D} + \frac{D_n}{L_nN_A}\right) = (1.6\times10^{-19})(2.25\times10^{20})(10^{-12} + 6.67\times10^{-14}) = 38.4\ \text{pA}$$
Far away, each side is just uniformly illuminated: equilibrium plus $g_{op}\tau$.
$n_p = 2.25\times10^3 + 2.25\times10^{10} \approx 2.25\times10^{10}$, $p_n = 5.63\times10^4 + 2.5\times10^{10} \approx 2.5\times10^{10}\ \text{cm}^{-3}$.` }),
    P({ src: 'HW8 · 1C (7 pts)', q: md`(C) Find the optically generated current $I_{op}$ and its direction in the wire.`,
      parts: [N('V_0', 0.73, 'V', 0.02), N('W', 0.498, 'µm'), N('I_{op}', 40.4, 'µA'),
        FIX('In the wire, $I_{op}$ flows', ['from the p-side to the n-side', 'from the n-side to the p-side'], 0, [null, 'Holes are swept to the p-side, so conventional current leaves the p terminal.'])],
      sol: md`Pairs generated within a diffusion length of the depletion region (or inside it) are collected:
$V_0 = 0.0259\ln\dfrac{(10^{17})(4\times10^{15})}{2.25\times10^{20}} = 0.73$ V, $W = \sqrt{\dfrac{2\epsilon V_0}{q}\dfrac{N_A+N_D}{N_AN_D}} = 0.498\ \mu$m.
$$I_{op} = qAg_{op}(L_n + L_p + W) = (1.6\times10^{-19})(5\times10^{16})(50.5\times10^{-4}) = 40.4\ \mu\text{A}$$
The field sweeps electrons to the n-side and holes to the p-side, so in the wire the current runs **from p to n** (out of the p terminal).` }),
    P({ src: 'HW8 · 1D (4 pts)', q: md`(D) The wire is removed and a forward bias of 0.3 V is applied to the illuminated junction. Find the total current. Is the device absorbing or delivering power, and how much?`,
      parts: [N('I', -36.3, 'µA'), FIX('The device is', ['delivering power', 'absorbing power'], 0, [null, '$V > 0$ with $I < 0$: fourth quadrant, a generator.']), N('P', 10.9, 'µW')],
      sol: md`$I = I_0(e^{qV/kT} - 1) - I_{op} = (38.4\ \text{pA})(e^{0.3/0.0259} - 1) - 40.4\ \mu\text{A} = 4.12 - 40.4 = -36.3\ \mu\text{A}$.
Positive voltage, negative current: fourth quadrant, so it delivers power like a solar cell: $P = |VI| = (0.3)(36.3\ \mu\text{A}) = 10.9\ \mu$W.` }),
    R(md`### Problem 2 · Forward and reverse bias (20 pts)

A $p^+$-n Si junction at 300 K: $N_A = 5\times10^{18}$, $N_D = 5\times10^{16}\ \text{cm}^{-3}$, $D_p = 10\ \text{cm}^2/\text{s}$, $\tau_p = 100$ ns, $A = 10^{-4}\ \text{cm}^2$.`),
    P({ src: 'HW8 · 2A–2C (20 pts)', q: md`(A) Find the current at $V_a = 0.6$ V. (B) Show that it can be written $I = Q_p/\tau_p$, and find the stored charge $Q_p$. (C) Find the reverse saturation current $I_S$.`,
      parts: [N('I', 8.28, 'µA'), N('Q_p', 8.28e-13, 'C'), N('I_S', 7.2e-16, 'A')],
      hints: ['$p^+$-n: keep only the hole term. $p_n = n_i^2/N_D = 4.5\\times10^3$.', '$Q_p = qAL_p\\Delta p_n$; then use $L_p/\\tau_p = D_p/L_p$.'],
      sol: md`(A) $L_p = 10^{-3}$ cm, $p_n = 4.5\times10^3\ \text{cm}^{-3}$. Hole term only:
$$I = qA\frac{D_p}{L_p}p_n(e^{qV/kT} - 1) = (1.6\times10^{-19})(10^{-4})(10^4)(4.5\times10^3)(e^{0.6/0.0259} - 1) = 8.28\ \mu\text{A}$$
(B) The excess holes decay as $e^{-x_n/L_p}$, so $Q_p = qA\displaystyle\int_0^\infty\Delta p_ne^{-x_n/L_p}dx_n = qAL_p\Delta p_n$, and
$\dfrac{Q_p}{\tau_p} = qA\dfrac{L_p}{\tau_p}\Delta p_n = qA\dfrac{D_p}{L_p}\Delta p_n = I$. The current just resupplies the stored holes as they recombine. $Q_p = I\tau_p = 8.28\times10^{-13}$ C.
(C) $I_S = qA\dfrac{D_p}{L_p}p_n = 7.2\times10^{-16}$ A.` }),
    RF(md`### Problem 3 · Reverse-bias breakdown (20 pts)

A $p^+$-n Si diode has $N_D = 1.5\times10^{17}\ \text{cm}^{-3}$ and a physical n-side width of 0.8 µm.

[[fig:br]]`, { br: fig('hw8-fig5-22', 'log-log chart of avalanche breakdown voltage versus doping for Ge, Si, GaAs, GaP at 300 K', 460, 'Avalanche breakdown voltage vs. doping (Streetman Fig. 5-22).') }),
    P({ src: 'HW8 · 3A–3C (20 pts)', q: md`(A) Read the approximate breakdown voltage from the chart. (B) Find the depletion width at breakdown (include $V_0$). Avalanche or punch-through? (C) Find the peak field at breakdown.`,
      parts: [N('V_{br}', 10, 'V', 0.3), N('V_0', 0.98, 'V', 0.02), N('W_{\\text{dep}}', 0.309, 'µm', 0.05),
        FIX('Breakdown is by', ['avalanche', 'punch-through'], 0, [null, 'The depletion (0.31 µm) never reaches the 0.8 µm end of the n-side.']), N('\\mathscr{E}_{\\max}', 7.1e5, 'V/cm', 0.05)],
      sol: md`(A) The Si curve at $1.5\times10^{17}$ gives $V_{br} \approx 10$ V.
(B) On the $p^+$ side $E_F$ is near $E_v$, so $E_i - E_F \approx 0.56$ eV: $V_0 = 0.56 + 0.0259\ln\dfrac{1.5\times10^{17}}{1.5\times10^{10}} = 0.98$ V.
$$W = \sqrt{\frac{2\epsilon(V_0 + V_{br})}{qN_D}} = \sqrt{\frac{2(11.8)(8.854\times10^{-14})(10.98)}{(1.6\times10^{-19})(1.5\times10^{17})}} = 0.309\ \mu\text{m}$$
$0.309 < 0.8\ \mu$m: the depletion never reaches the end of the n-side, so it breaks down by **avalanche**, as the chart assumes.
(C) One-sided junction, triangular field: $\mathscr{E}_{\max} = \dfrac{2(V_0 + V_{br})}{W} = \dfrac{2(10.98)}{3.09\times10^{-5}} = 7.1\times10^5$ V/cm (the key leaves off the unit).` }),
    RF(md`### Problem 4 · Solar cells (20 pts)

ECEB's rooftop Si cells have $I_0 = 2200$ pA. In sunlight each generates $I_{sc} = 5\ \mu$A.

[[fig:s]]`, { s: fig('hw8-solar-q', 'I-V curve of one solar cell on current and voltage axes', 360, 'One cell’s I–V curve.') }),
    P({ src: 'HW8 · 4A–4B (9 pts)', q: md`(A) Find the open-circuit voltage. (B) Find $V_m$, $I_m$, the maximum power and the fill factor.`,
      parts: [N('V_{oc}', 0.200, 'V', 0.02), N('V_m', 0.150, 'V', 0.02), N('I_m', 4.28, 'µA', 0.02), N('P_{\\max}', 0.642, 'µW', 0.02), N('FF', 0.642, '', 0.02)],
      hints: ['$I(V_{oc}) = 0$ in $I = I_0(e^{qV/kT} - 1) - I_{sc}$.', 'Maximize $P = VI$: $\\left(1 + \\frac{qV_m}{kT}\\right)e^{qV_m/kT} = \\frac{I_{sc}}{I_0} + 1$. Solve numerically.'],
      sol: md`(A) $V_{oc} = \dfrac{kT}{q}\ln\left(\dfrac{I_{sc}}{I_0} + 1\right) = 0.0259\ln\left(\dfrac{5\times10^{-6}}{2.2\times10^{-9}} + 1\right) = 0.200$ V.
(B) Setting $dP/dV = 0$ gives $\left(1 + \dfrac{qV_m}{kT}\right)e^{qV_m/kT} = \dfrac{I_{sc}}{I_0} + 1$; numerically $V_m = 0.150$ V, $I_m = 4.28\ \mu$A, $P_{\max} = 0.642\ \mu$W.
$FF = \dfrac{P_{\max}}{V_{oc}I_{sc}} = \dfrac{0.642}{(0.2)(5)} = 0.642$.` }),
    P({ src: 'HW8 · 4C–4E (11 pts)', q: md`(C) Label $V_{oc}$, $V_m$, $I_{sc}$, $I_m$, $P_{\max}$ and FF on the graph. (D) What happens to $V_{oc}$ and $I_{sc}$ with two identical cells in series? In parallel? (E) Add the series and parallel curves.`,
      parts: [FIX('Series: $V_{oc}$', ['doubles', 'unchanged', 'halves'], 0), FIX('Series: $I_{sc}$', ['doubles', 'unchanged', 'halves'], 1),
        FIX('Parallel: $V_{oc}$', ['doubles', 'unchanged', 'halves'], 1), FIX('Parallel: $I_{sc}$', ['doubles', 'unchanged', 'halves'], 0)],
      sol: md`In series the voltages add (same current): $V_{oc}$ doubles, $I_{sc}$ is unchanged. In parallel the currents add (same voltage): $I_{sc}$ doubles, $V_{oc}$ is unchanged.

[[fig:s2]]`, figs: { s2: fig('hw8-solar-sol', 'solar cell curve with Voc, Vm, Isc, Im, Pmax and FF marked, a series curve reaching 2Voc and a parallel curve reaching 2Isc', 420, 'The fill-factor rectangle, and the series ($2V_{oc}$) and parallel ($2I_{sc}$) curves.') } }),
  ];

  // ================================================================ HW 9
  const hw9 = [
    intro(9, 'Friday, November 6, 2026', 'Photodiodes, LEDs, lasers, metal–semiconductor junctions. Four problems, 20 points each.'),
    R(md`### Problem 1 · Photodiodes (20 pts)

A vertical p-i-n photodiode: p-layer $\text{Al}_{0.3}\text{Ga}_{0.7}\text{As}$ ($E_g = 1.8$ eV), intrinsic and n-layers GaAs ($E_g = 1.42$ eV). The intrinsic layer is 500 nm thick and GaAs absorbs $\alpha = 2000\ \text{cm}^{-1}$ at 820 nm.`),
    P({ src: 'HW9 · 1A (5 pts)', q: md`(A) Illuminated from the p-side, can it detect visible light? Will 820 nm light be absorbed by the p-AlGaAs layer?`,
      parts: [N('\\lambda_c\\ (\\text{GaAs})', 873, 'nm', 0.01), N('\\lambda_c\\ (\\text{AlGaAs})', 689, 'nm', 0.01),
        FIX('820 nm absorbed by the p-layer?', ['yes', 'no'], 1, ['820 nm is longer than the AlGaAs cutoff (689 nm): the photon energy, 1.51 eV, is below 1.8 eV.', null])],
      sol: md`Cutoffs: GaAs $1240/1.42 = 873$ nm; AlGaAs $1240/1.8 = 689$ nm.
GaAs absorbs everything shorter than 873 nm, which includes the visible, so the key answers **yes**. (In practice, light shorter than 689 nm is mostly absorbed in the p-window first, so the response in the visible depends on how thin that layer is.)
820 nm (1.51 eV) is **not** absorbed by the p-layer: it passes the window and is absorbed in the GaAs.` }),
    P({ src: 'HW9 · 1B–1D (15 pts)', q: md`(B) With 15 mW incident (no reflection), how much power does the intrinsic layer absorb? (C) Redo (B) with 30% lost to reflection at the surface. (D) If the photocurrent is 400 µA, what is the responsivity (photocurrent per absorbed power)?`,
      parts: [N('P_{\\text{abs}}\\ (\\text{B})', 1.43, 'mW'), N('P_{\\text{abs}}\\ (\\text{C})', 1.00, 'mW'), N('R', 0.4, 'A/W')],
      sol: md`(B) $P = P_{in}(1 - e^{-\alpha L}) = 15(1 - e^{-2000\times0.5\times10^{-4}}) = 15(1 - e^{-0.1}) = 1.43$ mW.
(C) Only 70% gets in: $15(0.7)(1 - e^{-0.1}) = 1.00$ mW.
(D) $R = \dfrac{400\ \mu\text{A}}{1\ \text{mW}} = 0.4$ A/W. Absorbed power is a number of photons per second, each making one electron–hole pair; the field in the (depleted) i-layer separates them into current. Responsivity measures how efficiently absorbed photons become collected carriers.` }),
    R(md`### Problem 2 · LED (20 pts)

A GaAs ($E_g = 1.43$ eV) light-emitting diode.`),
    P({ src: 'HW9 · 2A–2C (15 pts)', q: md`(A) Find the emission wavelength. (B) 300 µA is injected and 42.7 µW of light comes out. Find the quantum efficiency (photons out per electron in). (C) Forward or reverse bias?`,
      parts: [N('\\lambda', 867, 'nm', 0.01), N('\\text{electrons/s}', 1.87e15, 's^{-1}'), N('\\text{photons/s}', 1.87e14, 's^{-1}'), N('QE', 0.10, '', 0.03),
        FIX('(C) Bias', ['forward', 'reverse'], 0, [null, 'Light comes from injected carriers recombining, which needs forward bias.'])],
      sol: md`(A) $\lambda = 1240/1.43 = 867$ nm.
(B) Electrons: $I/q = 300\times10^{-6}/1.6\times10^{-19} = 1.87\times10^{15}\ \text{s}^{-1}$. Photons: $P/E_g = 42.7\times10^{-6}/(1.43\times1.6\times10^{-19}) = 1.87\times10^{14}\ \text{s}^{-1}$. $QE = 0.10$ (10%).
(C) **Forward bias**: electrons are injected into the p-side (holes into the n-side), where they recombine and emit.` }),
    P({ src: 'HW9 · 2D (5 pts)', q: md`(D) Why are III-V compounds preferred over group-IV semiconductors for optoelectronics?`,
      parts: [MC('Main reason', ['III-Vs are mostly direct-gap, and alloys let you tune the gap', 'III-Vs have higher mobility, so they emit faster', 'group-IV materials have no bandgap', 'III-Vs are cheaper to grow than Si'], 0,
        [null, 'Mobility is not what makes light emission efficient.', 'Si and Ge have gaps, but indirect ones.', 'Si is far cheaper.'])],
      sol: md`Si and Ge are **indirect**: radiative recombination needs a phonon and is weak. Most III-Vs are **direct**, so electrons and holes recombine radiatively with high probability. And ternary/quaternary III-V alloys (AlGaAs, InGaAsP, …) let you tune $E_g$, and so the wavelength, to what the system needs.` }),
    R(md`### Problem 3 · Lasers (20 pts)`),
    P({ src: 'HW9 · 3A–3C (15 pts)', q: md`(A) In a two-level system under steady illumination, how are absorption, spontaneous emission and stimulated emission related? (B) The three conditions for laser operation? (C) In a degenerately doped p-n junction laser, what must hold between $F_n$, $F_p$ and $E_g$?`,
      parts: [MC('(A)', ['absorption = spontaneous + stimulated emission', 'spontaneous = absorption + stimulated emission', 'stimulated = absorption + spontaneous emission', 'all three rates are equal'], 0,
          [null, 'In steady state, upward transitions balance all downward ones.', 'In steady state, upward transitions balance all downward ones.', 'Only the balance up = down is required.']),
        MC('(B)', ['population inversion, a gain medium, an optical cavity for feedback', 'direct gap, forward bias, a heat sink', 'reverse bias, a gain medium, an antireflection coating', 'population inversion, an indirect gap, a cavity'], 0,
          [null, 'Those help but are not the three conditions.', 'Lasers are forward biased, and the mirrors reflect.', 'An indirect gap is the opposite of what you want.']),
        MC('(C)', ['$F_n - F_p > E_g$', '$F_n - F_p < E_g$', '$F_n = F_p$', '$F_n - F_p > 2E_g$'], 0,
          [null, 'That gives absorption, not gain.', 'That is equilibrium.', 'Only the gap needs to be exceeded.'])],
      sol: md`(A) Steady state: absorption rate = spontaneous + stimulated emission rates.
(B) Population inversion; a gain medium that produces photons; an optical cavity (mirrors) to confine the field and give feedback.
(C) With degenerate doping and strong forward bias, $F_n$ lies above $E_c$ and $F_p$ below $E_v$, so states near the band edges are inverted (full of electrons above, empty below): $F_n - F_p > E_g$.

[[fig:l]]`, figs: { l: fig('hw9-laser', 'band diagram with Fn above Ec and Fp below Ev, separation Fn - Fp larger than Eg', 340, 'Population inversion: $F_n - F_p > E_g$.') } }),
    P({ src: 'HW9 · 3D (5 pts)', q: md`(D) Compare an LED and a laser.`,
      parts: [FIX('Emission is mostly…', ['LED spontaneous, laser stimulated', 'LED stimulated, laser spontaneous', 'both stimulated'], 0),
        FIX('The light is…', ['LED incoherent, laser coherent', 'LED coherent, laser incoherent', 'both coherent'], 0),
        FIX('The spectrum is…', ['LED broad, laser narrow', 'LED narrow, laser broad', 'both equally broad'], 0)],
      sol: md`An LED emits by spontaneous emission: incoherent light over a fairly broad band around $E_g$. A laser emits mostly by stimulated emission: coherent (in-phase) light at a very narrow, essentially single wavelength.` }),
    R(md`### Problem 4 · Metal–semiconductor junctions (20 pts)

A metal with $\phi_M = 4.9$ eV on n-type Si: $\chi = 4.05$ eV, $E_g = 1.12$ eV, $N_D = 10^{16}\ \text{cm}^{-3}$, $n_i = 1.5\times10^{10}\ \text{cm}^{-3}$.`),
    P({ src: 'HW9 · 4A–4B (10 pts)', q: md`(A) Draw the isolated metal and semiconductor band diagrams. (B) After contact: find $E_C - E_F$ in the semiconductor, the barrier height $\phi_B$ for electrons, the built-in potential $V_0$, and sketch the result with the field and electron flow.`,
      parts: [N('E_C - E_F', 0.21, 'eV', 0.04), N('\\phi_B', 0.85, 'eV', 0.01), N('V_0', 0.64, 'V', 0.02),
        FIX('On contact, electrons flow', ['semiconductor to metal', 'metal to semiconductor'], 0, [null, 'The semiconductor Fermi level is higher ($\\phi_S < \\phi_M$), so electrons leave it.'])],
      sol: md`(B) $E_F - E_i = 0.026\ln\dfrac{10^{16}}{1.5\times10^{10}} = 0.35$ eV, so $E_C - E_F = 0.56 - 0.35 = 0.21$ eV.
$q\phi_B = q(\phi_M - \chi) = 4.9 - 4.05 = 0.85$ eV.
$qV_0 = q(\phi_M - \phi_S) = \phi_B - (E_C - E_F) = 0.85 - 0.21 = 0.64$ eV.
$\phi_S = 4.05 + 0.21 = 4.26$ eV $< \phi_M$, so electrons flow from the semiconductor into the metal, leaving a depletion region; the bands bend up toward the interface and the field points from the semiconductor toward the metal.

[[fig:a]]
[[fig:b]]`, figs: { a: fig('hw9-ms-before', 'hand sketch: metal with work function 4.9 eV and semiconductor with electron affinity 4.05 eV and Ec, EF, Ei, Ev, before contact', 360, 'Before contact.'), b: fig('hw9-ms-after', 'hand sketch: after contact, barrier phiB = phiM - chi, band bending qV0, electron flow and field directions', 360, 'After contact: barrier $\\phi_B$ and band bending $qV_0$.') } }),
    P({ src: 'HW9 · 4C–4D (10 pts)', q: md`(C) Schottky or ohmic? If Schottky, how can it be made ohmic without changing the metal or the doping type? (D) With p-type Si ($N_A = 10^{16}$) instead, how would the carrier flow and the contact type change?`,
      parts: [FIX('(C) The contact is', ['Schottky (rectifying)', 'ohmic'], 0, [null, '$\\phi_M > \\phi_S$ on n-type: a barrier forms.']),
        MC('(C) To make it ohmic', ['dope the surface very heavily so electrons tunnel through', 'raise the temperature', 'use a thicker metal layer', 'reverse bias it permanently'], 0,
          [null, 'That only raises the leakage current.', 'Thickness does not change the barrier.', 'That just blocks the current.']),
        FIX('(D) p-type: electrons flow', ['metal to semiconductor', 'semiconductor to metal'], 0, [null, 'Now $\\phi_S = 4.96$ eV $> \\phi_M$: the metal’s Fermi level is higher.']),
        FIX('(D) p-type contact', ['Schottky (barrier for holes)', 'ohmic'], 0, [null, 'For p-type, $\\phi_M < \\phi_S$ gives a rectifying contact.']),
        N('(D)\\ \\phi_{Bp}', 0.27, 'eV', 0.04)],
      sol: md`(C) **Schottky.** Heavy doping at the surface makes the depletion region so thin that electrons tunnel through the barrier: an ohmic contact.
(D) For p-type, $E_F$ is 0.35 eV below $E_i$, so $\phi_S = 4.05 + 0.56 + 0.35 = 4.96$ eV $> \phi_M = 4.9$ eV. The metal's Fermi level is now **higher**, so electrons flow **from the metal into the semiconductor**. With $\phi_M < \phi_S$ on p-type the contact is **rectifying for holes**, with hole barrier $\phi_{Bp} = \chi + E_g - \phi_M = 4.05 + 1.12 - 4.9 = 0.27$ eV. (The key words this as "$\phi_M$ is higher than $E_F$"; what matters is $\phi_M < \phi_S$.)` }),
  ];

  C.unit({
    id: 'e2-hw', exam: 'e2', tools: true, num: 'Exam 2', title: 'Homework 6–9 (blank, with solutions)',
    lessons: [
      { id: 'hw6', title: 'HW 6 · diffusion, junctions in equilibrium', kind: 'exam', steps: hw6 },
      { id: 'hw7', title: 'HW 7 · biased junctions, diode design, breakdown', kind: 'exam', steps: hw7 },
      { id: 'hw8', title: 'HW 8 · illuminated junctions, breakdown, solar cells', kind: 'exam', steps: hw8 },
      { id: 'hw9', title: 'HW 9 · photodiodes, LEDs, lasers, Schottky contacts', kind: 'exam', steps: hw9 },
    ],
  });
})();

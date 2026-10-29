/* Exam 2: practice exams 2–4 (Part A ten-second questions, Part B three worked problems) and an endless practice exam
   drawn from the randomized generators. Appended to the e2-x unit from e2-tools.js. */
(function () {
  'use strict';
  const { R, G, P } = C;
  const RF2 = window.RF2;
  const unit = COURSE.units.find((u) => u.id === 'e2-x');

  const num = (lbl, ans, unit, tol) => ({ lbl, ans, unit, tol: tol || { rel: 0.02 } });
  const mc = (lbl, opts, a, why) => ({ lbl, mc: opts, a, why });
  const intro = (focus) => R(md`
    Set a timer for 60 minutes and use only the formula sheet and a calculator. Si at 300 K, $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$, $kT = 0.0259$ eV, $\epsilon_{Si} = 11.8\epsilon_0$ unless stated. Answers within 2% count.

    **Part A** is eight ten-second questions: give yourself about 8 minutes for all of them, and answer from the picture, not from algebra. **Part B** is three problems, about 15 minutes each. This exam leans on ${focus}.
  `);
  const partA = (parts, sol) => P({ src: 'Part A', title: 'Ten-second questions', q: md`Answer each from intuition in under 15 seconds. If you have to reach for an equation, that is the one to drill afterwards in the speed round.`, parts, sol });
  const missed = (rows) => R(md`
    ### Missed something?

    ${rows}

    Then come back to the speed round: every miss in Part A is a card there.
  `);

  const mock2 = {
    id: 'e2-mock2', title: 'Practice exam 2 (60 min)', kind: 'mock', sub: 'C–V profiling, the narrow-base diode, metal–semiconductor contacts',
    steps: [
      intro('reading a capacitance measurement, the short-base diode and Schottky contacts'),
      partA([
        mc('In equilibrium, across the depletion region, the hole diffusion current and the hole drift current are…', ['equal and opposite, so the net is zero', 'both zero', 'diffusion larger, so holes leak to the n side', 'drift larger, so holes are pushed to the p side'], 0,
          [null, 'Each is large: a steep hole gradient drives diffusion n-ward, and the built-in field drives drift back. Only their sum vanishes, separately for holes and for electrons.', 'A net hole flow with no bias and no light would be a current from nothing.', 'Same: any net flow in equilibrium is impossible.']),
        mc('Ideal diode in reverse bias. The small current is carried mainly by…', ['minority carriers within a diffusion length of the edges, swept across by the field', 'majority carriers diffusing over the barrier', 'electrons tunneling through the barrier', 'recombination inside the depletion region'], 0,
          [null, 'The barrier grew by $|V|$; essentially no majority carrier gets over it.', 'Only with very heavy doping on both sides (Zener), not in an ordinary diode.', 'Reverse bias empties the region, so it generates rather than recombines; that generation is the non-ideal extra reverse current.']),
        mc('p⁺-n diode, forward bias. Deep in the n neutral region, many $L_p$ from the junction, the current is carried by…', ['majority electrons drifting in a tiny field', 'holes diffusing', 'holes drifting', 'electrons diffusing'], 0,
          [null, 'The injected holes have recombined within a few $L_p$; there are none left to diffuse.', 'There are almost no holes there to carry anything.', 'Far from the junction in a long base there is no electron gradient.']),
        mc('A metal with $\\phi_m = 4.2$ eV on n-type Si with $\\phi_s = 4.26$ eV makes…', ['an ohmic contact', 'a rectifying (Schottky) contact', 'a tunnel junction', 'no band bending, so neither'], 0,
          [null, 'On n-type, rectifying needs $\\phi_m > \\phi_s$. Here electrons flow from the metal into the Si and pile up at the surface: no barrier.', 'Nothing here is heavily doped.', '$\\phi_m \\ne \\phi_s$, so the bands do bend (they accumulate); there is just no barrier.']),
        mc('As the temperature rises, a Zener diode\'s breakdown voltage…', ['decreases', 'increases', 'stays the same'], 0,
          [null, 'That is avalanche: more phonon scattering means carriers need a larger field to reach ionizing energy.', '$E_g$ shrinks with $T$, so tunneling gets easier: a lower voltage is enough.']),
        mc('p⁺-n diode with $V_r \\gg V_0$. Quadruple $V_r$. $C_j$ becomes…', ['×½', '×¼', '×2', 'unchanged'], 0,
          [null, '$W \\propto \\sqrt{V}$, so $C \\propto 1/\\sqrt{V}$; ×¼ would need $C \\propto 1/V$.', 'More reverse bias widens $W$, so $C$ falls.', '$C = \\epsilon A/W$ and $W$ depends on $V$.']),
        mc('Forward current fixed, hole lifetime $\\tau_p$ doubled. After switching to a fixed reverse current, the storage delay time…', ['doubles', 'halves', 'grows by √2', 'is unchanged'], 0,
          [null, 'A longer lifetime stores more charge ($Q = I\\tau_p$) that also dies away more slowly: longer, not shorter.', 'The square root belongs to $L_p = \\sqrt{D\\tau}$. $t_{sd} = \\tau_p\\ln(1 + I_f/I_r)$ is linear in $\\tau_p$.', 'More stored charge takes longer to pull out.']),
        mc('A solar cell heats from 25 °C to 60 °C. $V_{oc}$…', ['falls', 'rises', 'stays the same'], 0,
          [null, '$I_{th} \\propto n_i^2$ grows by orders of magnitude, far faster than the $kT/q$ prefactor, so the log shrinks.', 'The light current barely changes, but the dark current balloons.']),
      ], md`Equal and opposite; minority carriers swept out; majority drift far away; ohmic; decreases; ×½; doubles; falls.`),
      P({ src: 'Problem 1', title: 'C–V profiling an n⁺-p junction',
        q: md`A Si n⁺-p diode with $A = 10^{-4}$ cm² measures $C = 1.50$ pF at 1 V reverse and $C = 0.651$ pF at 9 V reverse. (a) Which doping does the measurement report? (b) Find $N_a$ and (c) $V_0$ from the straight line $1/C^2$ vs $V_r$. At 9 V reverse find (d) $W$ and (e) the peak field. (f) What is $C$ at zero bias?`,
        parts: [mc('Which doping does the $1/C^2$ slope give?', ['the light p side', 'the heavy n⁺ side', 'the average of the two', 'the sum of the two'], 0,
          [null, 'The n⁺ side barely depletes; nearly all of $W$ is in the p side, so $C$ reports the p doping.', 'The formula has $\\frac{N_aN_d}{N_a + N_d}$, which is about the smaller of the two, not an average.', 'Same formula: $\\frac{N_aN_d}{N_a + N_d}$ is never larger than either doping.']),
          num('N_a', 5.0e15, 'cm^{-3}', { rel: 0.03 }), num('V_0', 0.856, 'V', { rel: 0.03 }), num('W\\ (9\\,\\text{V})', 1.604, 'μm'), num('|\\mathscr{E}_0|\\ (9\\,\\text{V})', 1.229e5, 'V/cm'), num('C\\ (0\\,\\text{V})', 2.21, 'pF', { rel: 0.03 })],
        sol: md`One-sided: $C = A\sqrt{\frac{q\epsilon N_a}{2(V_0 + V_r)}}$, so $\frac{1}{C^2} = \frac{2(V_0 + V_r)}{q\epsilon N_aA^2}$: a straight line in $V_r$ whose slope gives $N_a$ and whose intercept gives $V_0$. $1/C_1^2 = 4.44\times10^{23}$, $1/C_2^2 = 2.36\times10^{24}\ \text{F}^{-2}$; slope $= \frac{2.36\times10^{24} - 4.44\times10^{23}}{8} = 2.39\times10^{23}$ F⁻²/V. (b) $N_a = \frac{2}{q\epsilon A^2\cdot\text{slope}} = \frac{2}{(1.6\times10^{-19})(1.044\times10^{-12})(10^{-8})(2.39\times10^{23})} = 5.0\times10^{15}\,\text{cm}^{-3}$. (c) $V_0 + 1 = \frac{4.44\times10^{23}}{2.39\times10^{23}} = 1.856$, so $V_0 = 0.856$ V. (d) $W = \sqrt{\frac{2\epsilon(9.856)}{qN_a}} = 1.60\,\mu$m. (e) $\mathscr{E}_0 = \frac{2(V_0 + V_r)}{W} = 1.23\times10^5$ V/cm. (f) $C(0) = 1.50\sqrt{1.856/0.856} = 2.21$ pF. Sanity check without the line: $C(1)/C(9) = \sqrt{9.856/1.856} = 2.30$, and $1.50/0.651 = 2.30$.` }),
      P({ src: 'Problem 2', title: 'Narrow-base diode',
        q: md`A Si p⁺-n diode has a short n region: $\ell = 2\,\mu$m from the depletion edge to the ohmic contact. $N_d = 10^{16}\,\text{cm}^{-3}$, $D_p = 10$ cm²/s, $\tau_p = 1\,\mu$s, $A = 10^{-4}$ cm², forward bias 0.6 V. Find (a) $\Delta p_n$ at the depletion edge, (b) the shape of the excess-hole profile, (c) $I$, (d) the stored hole charge, (e) the transit time, (f) how many times larger $I$ is than for a long base with the same $\tau_p$, (g) the voltage dropped across the quasi-neutral base. (h) If $\ell$ is halved, what happens to $I$ and to the transit time?`,
        parts: [num('\\Delta p_n', 2.589e14, 'cm^{-3}'),
          mc('Excess hole profile in the base', ['a straight line from $\\Delta p_n$ down to zero at the contact', 'an exponential decaying over $L_p$', 'flat at $\\Delta p_n$', 'a straight line rising toward the contact'], 0,
            [null, 'Needs room to recombine: with $\\ell \\ll L_p$ almost nothing recombines on the way.', 'Flat means no gradient, so no diffusion current at all.', 'The ohmic contact forces $\\Delta p = 0$ there.']),
          num('I', 2.071e-4, 'A'), num('Q_p', 4.142e-13, 'C'), num('t_t', 2.0, 'ns'), num('I_{narrow}/I_{long}', 15.81, ''), num('V_{base}', 0.670, 'mV', { rel: 0.03 }),
          mc('$\\ell$ halved: $I$', ['doubles', 'halves', 'grows by √2', 'unchanged'], 0, [null, 'The same $\\Delta p_n$ over half the distance is twice the slope.', 'The square root belongs to $L_p$, not to $\\ell$.', '$I \\propto 1/\\ell$.']),
          mc('$\\ell$ halved: $t_t$', ['×¼', '×½', 'unchanged', '×2'], 0, [null, '$t_t = \\ell^2/2D_p$ goes as the square.', 'It depends on $\\ell$.', 'Shorter base, faster transit.'])],
        sol: md`(a) $p_n = n_i^2/N_d = 2.25\times10^4$; $e^{0.6/0.0259} = 1.15\times10^{10}$; $\Delta p_n = 2.59\times10^{14}\,\text{cm}^{-3}$ (2.6% of $N_d$: low level). (b) No recombination on the way, so a constant diffusion current, so a constant slope: a straight line to zero at the contact. (c) $I = qAD_p\frac{\Delta p_n}{\ell} = (1.6\times10^{-19})(10^{-4})(10)\frac{2.59\times10^{14}}{2\times10^{-4}} = 0.207$ mA. (d) Triangle: $Q_p = \frac12qA\ell\Delta p_n = 4.14\times10^{-13}$ C. (e) $t_t = \frac{Q_p}{I} = \frac{\ell^2}{2D_p} = 2.0$ ns (compare $\tau_p = 1\,\mu$s: 500× faster). (f) Long base uses $L_p = \sqrt{10\times10^{-6}} = 31.6\,\mu$m instead of $\ell$: ratio $L_p/\ell = 15.8$. (g) Neutrality makes $\Delta n = \Delta p$, and the electrons must not flow (the p⁺ side injects almost none back), so a small field holds their gradient in place: $V_{base} = \frac{kT}{q}\frac{\Delta p_n}{N_d} = (0.0259\,\text{V})(0.0259) = 0.67$ mV (the second 0.0259 is $\Delta p_n/N_d$; the match is a coincidence). (h) $I$ doubles; $t_t$ ×¼.` }),
      P({ src: 'Problem 3', title: 'One metal, two contacts',
        q: md`A metal with $\phi_m = 4.75$ eV is put on Si ($\chi = 4.05$ eV, $N_c = 2.8\times10^{19}$, $N_v = 1.04\times10^{19}\,\text{cm}^{-3}$). On n-type Si with $N_d = 10^{16}$: find (a) $\phi_s$, (b) the contact type, (c) the barrier $\phi_B$ seen by electrons in the metal, (d) the contact potential $V_0$ seen from the semiconductor, (e) $W$ at zero bias. On p-type Si with $N_a = 10^{16}$: (f) $\phi_s$, (g) the contact type, (h) the barrier for holes. (i) In the n-type contact, what carries the forward current? (j) Why does it switch faster than a p-n diode?`,
        parts: [num('\\phi_s\\ (\\text{n})', 4.256, 'eV', { rel: 0.005 }),
          mc('Contact on n-type', ['rectifying', 'ohmic'], 0, [null, 'On n-type, $\\phi_m > \\phi_s$ means electrons leave the Si and leave a depletion region: a barrier.']),
          num('\\phi_B', 0.70, 'eV'), num('V_0\\ (\\text{n})', 0.494, 'V', { rel: 0.03 }), num('W', 0.254, 'μm', { rel: 0.03 }),
          num('\\phi_s\\ (\\text{p})', 4.99, 'eV', { rel: 0.005 }),
          mc('Contact on p-type', ['rectifying', 'ohmic'], 0, [null, 'On p-type, ohmic needs $\\phi_m > \\phi_s$; here $4.75 < 4.99$.']),
          num('\\phi_B\\ (\\text{holes})', 0.42, 'eV', { rel: 0.03 }),
          mc('Forward current in the n-type Schottky diode', ['majority electrons from the Si into the metal', 'minority holes injected into the Si', 'holes and electrons equally', 'tunneling through the barrier'], 0,
            [null, 'The metal has essentially no holes to inject; that is what makes it a majority-carrier device.', 'Only electrons have a barrier that bias changes.', 'At $N_d = 10^{16}$ the barrier is far too wide to tunnel through; that is how heavy doping makes an ohmic contact.']),
          mc('Why it switches faster', ['no minority charge is stored, so there is nothing to remove', 'the barrier is lower', 'the capacitance is larger', 'the metal has a higher mobility'], 0,
            [null, 'A lower barrier changes the turn-on voltage, not the switching speed.', 'A larger capacitance would make it slower.', 'Speed comes from charge storage, not mobility.'])],
        sol: md`(a) $E_c - E_F = kT\ln\frac{N_c}{N_d} = 0.0259\ln2800 = 0.206$ eV, so $\phi_s = 4.05 + 0.206 = 4.256$ eV. (b) n-type with $\phi_m > \phi_s$: rectifying. (c) $\phi_B = \phi_m - \chi = 0.70$ eV. (d) $V_0 = \phi_m - \phi_s = 0.494$ V. (e) All of $W$ is in the Si: $W = \sqrt{\frac{2\epsilon V_0}{qN_d}} = 0.254\,\mu$m. (f) $E_F - E_v = 0.0259\ln1040 = 0.180$ eV, so $\phi_s = \chi + E_g - 0.180 = 4.99$ eV. (g) p-type with $\phi_m < \phi_s$: rectifying too. This metal's work function sits between the two $\phi_s$ values, so it makes a barrier on both. To get an ohmic contact on n-type, use $\phi_m < 4.26$ (or dope the surface n⁺ so carriers tunnel); on p-type, $\phi_m > 4.99$. (h) $\phi_B = \chi + E_g - \phi_m = 0.42$ eV; $V_0 = 4.99 - 4.75 = 0.24$ V. (i) Majority electrons over the barrier. (j) No stored minority charge, so no storage delay.` }),
      missed(md`Part A 1–3: [Bias and the law of the junction](#/l/t16-bias), [Diode current](#/l/t17-diode). Part A 4 and Problem 3: [Metal–semiconductor contacts](#/l/t21-ms). Part A 5: [Breakdown](#/l/t19-break). Part A 6–7 and Problem 1: [Capacitance and switching](#/l/t20-cap). Problem 2: [Narrow base](#/l/t18-narrow). Part A 8: [Solar cells](#/l/t22-opto).`),
    ],
  };

  const mock3 = {
    id: 'e2-mock3', title: 'Practice exam 3 (60 min)', kind: 'mock', sub: 'Haynes–Shockley, current components and the far field, solar cells and LEDs',
    steps: [
      intro('measuring mobility and diffusion, where the current flows in each region, and light in and out'),
      partA([
        mc('A Si diode carries a fixed forward current while it heats up. The voltage across it…', ['falls, about 2 mV per kelvin', 'rises, about 2 mV per kelvin', 'stays the same', 'falls to half'], 0,
          [null, '$kT/q$ in the exponent does rise, but $I_0 \\propto n_i^2$ rises about 15% per kelvin and wins.', 'Fixed current: something must give, and $I_0$ grows enormously.', 'The change is linear and small, not a factor of two.']),
        mc('Halve the diode area, everything else fixed. Which stays the same?', ['$V_0$', '$C_j$', '$I_0$', '$C_s$ at fixed voltage'], 0,
          [null, '$C_j = \\epsilon A/W$ halves.', '$I_0 = qA(\\ldots)$ halves.', '$C_s \\propto I \\propto A$ halves.']),
        mc('Light shines on a reverse-biased photodiode. The reverse current…', ['grows in proportion to the light', 'shrinks', 'stays at $I_0$', 'grows exponentially with the light'], 0,
          [null, 'Light adds generated carriers that the field sweeps out, on top of the dark current.', '$I_0$ is only the dark part; light adds $qAg_{op}(L_p + L_n + W)$.', 'At most one pair per photon: linear.']),
        mc('An LED is made from a semiconductor with a larger band gap. Its wavelength…', ['gets shorter (bluer)', 'gets longer (redder)', 'is unchanged'], 0,
          [null, '$\\lambda = 1.24/E_g$: a bigger gap means more energetic photons, so a shorter wavelength.', 'The photon energy is set by the gap.']),
        mc('Forward bias is raised from 0.5 V to 0.6 V. The depletion width…', ['shrinks', 'grows', 'is unchanged'], 0,
          [null, '$W \\propto \\sqrt{V_0 - V}$: the barrier drops, so $W$ shrinks.', 'It follows the remaining barrier $V_0 - V$.']),
        mc('At low current a Si diode follows $I \\propto e^{qV/2kT}$. This means…', ['recombination in the depletion region dominates', 'high-level injection', 'series resistance', 'avalanche multiplication'], 0,
          [null, 'High-level injection also gives a factor of 2, but at high current.', 'Series resistance bends the curve at high current.', 'Avalanche happens at large reverse bias.']),
        mc('In an avalanche photodiode each carrier has probability $P = 0.6$ of creating a pair. $M$ is…', ['2.5', '1.6', '0.6', 'infinite'], 0,
          [null, '$1 + P$ counts only the first generation; the new carriers ionize too.', '$M \\ge 1$ always.', 'Only $P = 1$ diverges: that is breakdown.']),
        mc('A wide-base p⁺-n diode. Which side mostly sets $I_0$?', ['the lightly doped n side', 'the heavy p⁺ side', 'both equally'], 0,
          [null, '$I_0 \\propto n_i^2/N$: the heavy side has very few minority carriers to inject.', 'Only if $N_a \\approx N_d$.']),
      ], md`Falls about 2 mV/K; $V_0$; grows linearly; shorter; shrinks; depletion-region recombination; 2.5; the light side.`),
      P({ src: 'Problem 1', title: 'Haynes–Shockley',
        q: md`A 2 cm long n-type Si bar has 4 V across it. A pulse of holes is injected at one point. At a probe 0.6 cm downstream the pulse peak arrives $t_d = 667\,\mu$s later, and its width between the $1/e$ points is $\Delta t = 392\,\mu$s. Find (a) $\mu_p$, (b) $D_p$, (c) $D_p/\mu_p$, and check it against Einstein. A second probe sits 1.2 cm downstream: (d) arrival time, (e) pulse width in time. (f) The area under the second pulse is half the area under the first: find $\tau_p$. (g) If the voltage is doubled, what happens to the width in time at the first probe?`,
        parts: [num('\\mu_p', 450, 'cm^2/V·s'), num('D_p', 11.65, 'cm^2/s', { rel: 0.03 }), num('D_p/\\mu_p', 0.0259, 'V', { rel: 0.03 }),
          num('t_{d2}', 1333, 'μs'), num('\\Delta t_2', 554, 'μs', { rel: 0.03 }), num('\\tau_p', 962, 'μs', { rel: 0.03 }),
          mc('Voltage doubled: $\\Delta t$ at the first probe', ['×0.35', '×½', '×0.71', 'unchanged'], 0,
            [null, 'That counts only the faster drift; the pulse also has less time to spread.', 'That counts only the shorter spreading time.', 'Both the drift speed and the spreading time change.'])],
        sol: md`(a) $\mathscr{E} = 4/2 = 2$ V/cm; $v_d = 0.6/667\times10^{-6} = 900$ cm/s; $\mu_p = v_d/\mathscr{E} = 450$ cm²/V·s. (b) Width in space $\Delta x = v_d\Delta t = 900 \times 392\times10^{-6} = 0.353$ cm; $D_p = \frac{(\Delta x)^2}{16t_d} = \frac{0.1245}{16(667\times10^{-6})} = 11.7$ cm²/s. (c) $11.65/450 = 0.0259$ V $= kT/q$: Einstein holds. (d) Twice the distance at the same speed: 1333 µs. (e) $\Delta x \propto \sqrt{t_d}$ at the same $v_d$, so $\Delta t$ grows ×√2: 554 µs. (f) The area is the number of holes left, $\propto e^{-t/\tau_p}$: $e^{-667/\tau_p} = \frac12$, so $\tau_p = 667/\ln2 = 962\,\mu$s. (g) $t_d$ halves, so $\Delta x$ ×$1/\sqrt2$; dividing by twice the speed gives $\Delta t$ ×$\frac{1}{2\sqrt2} = 0.35$.` }),
      P({ src: 'Problem 2', title: 'Where the current flows',
        q: md`A Si p⁺-n diode has $N_a = 5\times10^{17}$, $N_d = 2\times10^{15}\,\text{cm}^{-3}$, $A = 10^{-3}$ cm². n side: $D_p = 12$ cm²/s, $\tau_p = 2\,\mu$s, $\mu_n = 1350$ cm²/V·s. p side: $D_n = 5$ cm²/s, $\tau_n = 0.1\,\mu$s. Both neutral regions are long. At 0.5 V forward find (a) $L_p$ and $L_n$, (b) $I_0$, (c) $I$, (d) the fraction of the junction current carried by holes, (e) the hole and electron currents one $L_p$ into the n side, (f) the field deep in the n neutral region, (g) the voltage across 100 µm of it, (h) $\Delta p_n/N_d$.`,
        parts: [num('L_p', 48.99, 'μm'), num('L_n', 7.071, 'μm'), num('I_0', 4.46e-14, 'A'), num('I', 1.080e-5, 'A'), num('I_p/I', 0.9886, '', { rel: 0.005 }),
          num('I_p\\ (x_n = L_p)', 3.928e-6, 'A'), num('I_n\\ (x_n = L_p)', 6.872e-6, 'A'), num('\\mathscr{E}_{far}', 0.0250, 'V/cm'), num('V_{100\\,\\mu m}', 0.250, 'mV'), num('\\Delta p_n/N_d', 0.0136, '', { rel: 0.03 })],
        sol: md`(a) $L_p = \sqrt{12\times2\times10^{-6}} = 49.0\,\mu$m; $L_n = \sqrt{5\times10^{-7}} = 7.07\,\mu$m. (b) $p_n = 2.25\times10^{20}/2\times10^{15} = 1.125\times10^5$, $n_p = 450$. $I_0 = qA\left(\frac{12}{4.90\times10^{-3}}1.125\times10^5 + \frac{5}{7.07\times10^{-4}}450\right) = (1.6\times10^{-22})(2.756\times10^8 + 3.18\times10^6) = 4.46\times10^{-14}$ A. (c) $e^{0.5/0.0259} = 2.42\times10^8$; $I = 10.8\,\mu$A. (d) $\frac{2.756}{2.788} = 98.9\%$ holes: the light side injects. (e) The hole current decays as $e^{-x/L_p}$: $I_p = 0.989(10.8)e^{-1} = 3.93\,\mu$A; the total is constant, so electrons carry the rest, $6.87\,\mu$A. (f) Far away all of it is majority electron drift: $\mathscr{E} = \frac{J}{q\mu_nN_d} = \frac{1.08\times10^{-2}}{(1.6\times10^{-19})(1350)(2\times10^{15})} = 0.025$ V/cm. (g) $0.025 \times 0.01 = 0.25$ mV: tiny, which is why we put all of $V$ across the junction. (h) $\Delta p_n = 1.125\times10^5 \times 2.42\times10^8 = 2.72\times10^{13}$, 1.4% of $N_d$: low level.` }),
      P({ src: 'Problem 3', title: 'Solar cell and LEDs',
        q: md`A 1 cm² Si solar cell under light generates $g_{op} = 3\times10^{19}$ EHP/cm³·s uniformly. $L_p = 50\,\mu$m, $L_n = 10\,\mu$m, $W = 1\,\mu$m, dark saturation current $I_{th} = 5\times10^{-12}$ A. Find (a) $I_{sc}$, (b) $V_{oc}$. (c) The maximum-power point is at $V_{mp} = 0.504$ V: find $I_{mp}$ and $P_{max}$. (d) Fill factor. (e) Which generated carriers are collected? (f) The emission wavelength of a GaAs LED ($E_g = 1.43$ eV), and (g) of a GaAsP LED with $E_g = 1.9$ eV, and its color.`,
        parts: [num('I_{sc}', 29.28, 'mA'), num('V_{oc}', 0.5825, 'V', { rel: 0.01 }), num('I_{mp}', 27.87, 'mA'), num('P_{max}', 14.05, 'mW'), num('FF', 0.824, '', { rel: 0.01 }),
          mc('Collected carriers', ['those generated in $W$ or within about a diffusion length of it', 'all carriers generated anywhere in the cell', 'only those generated inside $W$', 'only majority carriers'], 0,
            [null, 'Deeper than a diffusion length, they recombine before they reach the field.', 'The diffusion regions supply most of the current here: 60 µm of the 61.', 'The current is minority carriers diffusing to the junction and being swept across.']),
          num('\\lambda\\ (\\text{GaAs})', 0.867, 'μm'), num('\\lambda\\ (1.9\\,\\text{eV})', 0.653, 'μm'),
          mc('Color at 0.653 µm', ['red', 'infrared', 'green', 'blue'], 0, [null, 'Infrared is beyond about 0.7 µm (like GaAs).', 'Green is about 0.53 µm.', 'Blue is about 0.47 µm.'])],
        sol: md`(a) $I_{sc} = I_{op} = qAg_{op}(L_p + L_n + W) = (1.6\times10^{-19})(1)(3\times10^{19})(61\times10^{-4}) = 29.3$ mA. (b) $V_{oc} = \frac{kT}{q}\ln\left(1 + \frac{I_{op}}{I_{th}}\right) = 0.0259\ln(5.86\times10^9) = 0.583$ V. (c) $I_{mp} = I_{op} - I_{th}(e^{0.504/0.0259} - 1) = 29.28 - 1.41 = 27.9$ mA; $P_{max} = 0.504 \times 27.9 = 14.0$ mW. (d) $FF = \frac{14.05}{29.28 \times 0.5825} = 0.82$. (e) Within $W$ and about $L_n$, $L_p$ of it. (f) $1.24/1.43 = 0.867\,\mu$m (infrared). (g) $1.24/1.9 = 0.653\,\mu$m, red.` }),
      missed(md`Problem 1: [Haynes–Shockley](#/l/t13-hs). Part A 1, 6, 8 and Problem 2: [Diode current](#/l/t17-diode), [Breakdown and non-ideal diodes](#/l/t19-break). Part A 2, 5: [Depletion region](#/l/t15-depl), [Capacitance](#/l/t20-cap). Part A 3, 4, 7 and Problem 3: [Optoelectronics](#/l/t22-opto).`),
    ],
  };

  const mock4 = {
    id: 'e2-mock4', title: 'Practice exam 4 (60 min)', kind: 'mock', sub: 'breakdown design, capacitance and switching, quasi-Fermi levels at the edges',
    steps: [
      intro('designing for breakdown, the two capacitances and switching, and the quasi-Fermi picture under bias'),
      partA([
        mc('Forward bias $V$. Across the depletion region, $F_n - F_p$ equals…', ['$qV$', '$qV_0$', '$q(V_0 - V)$', 'zero'], 0,
          [null, '$V_0$ is the equilibrium barrier, where the two levels coincide.', 'That is the remaining barrier height.', 'Zero splitting is equilibrium; the bias separates them.']),
        mc('In reverse bias, which capacitance dominates?', ['the junction (depletion) capacitance', 'the diffusion (charge-storage) capacitance', 'they are about equal'], 0,
          [null, '$C_s \\propto I$, and the reverse current is tiny.', 'They differ by orders of magnitude in either bias.']),
        mc('A forward-biased p⁺-n diode stores minority holes. Most of them sit…', ['in the n side, within a few $L_p$ of the junction', 'in the p⁺ side', 'inside the depletion region', 'at the ohmic contact'], 0,
          [null, 'The p⁺ side holds injected electrons, and it injects very few.', 'The depletion region is thin and swept by the field.', 'They have recombined long before they reach a far contact.']),
        mc('One-sided junction: lighter doping on the light side makes $V_{br}$…', ['larger', 'smaller', 'unchanged'], 0,
          [null, '$V_{br} = \\epsilon\\mathscr{E}_{crit}^2/2qN$: lighter doping, gentler field slope, more voltage before it reaches $\\mathscr{E}_{crit}$.', 'The light side sets the field slope.']),
        mc('To make a 3 V reference diode you need…', ['heavy doping on both sides (Zener tunneling)', 'light doping (avalanche)', 'either one'], 0,
          [null, 'Light doping gives tens to hundreds of volts.', 'Below about $4E_g/q \\approx 4.5$ V only Zener works.']),
        mc('Switching a diode off, the reverse current $I_r$ is doubled. $t_{sd}$…', ['decreases', 'increases', 'is unchanged'], 0,
          [null, 'Pulling the charge out faster ends the delay sooner.', '$t_{sd} = \\tau_p\\ln(1 + I_f/I_r)$ depends on $I_r$.']),
        mc('Double the forward current at fixed $\\tau_p$. $C_s$…', ['doubles', 'is unchanged', 'grows by √2', 'halves'], 0,
          [null, '$C_s = \\frac{q}{kT}I\\tau_p$ is proportional to $I$.', 'Square roots belong to $C_j$, not $C_s$.', 'More current, more stored charge per volt.']),
        mc('The small-signal resistance of a forward-biased diode at 1 mA (300 K) is about…', ['26 Ω', '0.026 Ω', '2.6 kΩ', '1 kΩ'], 0,
          [null, 'Check the units: $kT/q$ is 0.0259 V, and $0.0259/0.001$ is 26.', 'Off by 100.', 'That would be $1\\,\\text{V}/1\\,\\text{mA}$; the diode is far steeper than that.']),
      ], md`$qV$; junction; n side within a few $L_p$; larger; Zener; decreases; doubles; 26 Ω.`),
      P({ src: 'Problem 1', title: 'Designing for breakdown',
        q: md`You must design a Si p⁺-n diode that breaks down by avalanche at 100 V. Take $\mathscr{E}_{crit} = 4\times10^5$ V/cm as fixed and neglect $V_0$. Find (a) $N_d$ and (b) the depletion width at breakdown. (c) If $N_d$ is made 10× larger, what is the new $V_{br}$ and (d) the mechanism? (e) What would this formula predict at 100× the original $N_d$, and (f) what mechanism would really take over? (g) The temperature coefficient of the 100 V diode. (h) Just below breakdown, each carrier has $P = 0.8$ of creating a pair: $M$?`,
        parts: [num('N_d', 5.22e15, 'cm^{-3}'), num('W_{br}', 5.0, 'μm'), num('V_{br}\\ (10N_d)', 10, 'V'),
          mc('Mechanism at $10N_d$', ['avalanche', 'Zener', 'both equally'], 0, [null, '10 V is above $6E_g/q \\approx 6.7$ V.', 'The mixed window is 4.5 to 6.7 V.']),
          num('V_{br}\\ (100N_d)', 1, 'V'),
          mc('Mechanism at $100N_d$', ['Zener tunneling', 'avalanche', 'punch-through'], 0, [null, 'Below $4E_g/q \\approx 4.5$ V the depletion region is too thin for carriers to gain ionizing energy, but thin enough to tunnel through.', 'That needs a short neutral region, not heavy doping.']),
          mc('Temperature coefficient at 100 V', ['positive', 'negative', 'zero'], 0, [null, 'That is Zener.', 'Only near the 4.5–6.7 V window do the two cancel.']),
          num('M', 5, '')],
        sol: md`(a) At breakdown the one-sided triangle peaks at $\mathscr{E}_{crit}$: $V_{br} = \frac{\epsilon\mathscr{E}_{crit}^2}{2qN_d}$, so $N_d = \frac{(1.044\times10^{-12})(4\times10^5)^2}{2(1.6\times10^{-19})(100)} = 5.22\times10^{15}\,\text{cm}^{-3}$. (b) $V = \frac12\mathscr{E}_{crit}W$, so $W = \frac{2(100)}{4\times10^5} = 5.0\,\mu$m; the n region must be at least this long. (c) $V_{br} \propto 1/N_d$: 10 V. (d) Still above 6.7 V: avalanche. (e) 1 V. (f) Zener: in reality $\mathscr{E}_{crit}$ rises at such heavy doping because tunneling takes over, and the fixed-field formula no longer applies. (g) Positive: hotter means more scattering, so a higher voltage is needed. (h) $M = \frac{1}{1 - P} = 5$.` }),
      P({ src: 'Problem 2', title: 'Two capacitances and switching off',
        q: md`A Si p⁺-n diode has $N_a = 10^{18}$, $N_d = 5\times10^{15}\,\text{cm}^{-3}$, $A = 5\times10^{-4}$ cm², $\tau_p = 0.4\,\mu$s. Find (a) $V_0$, (b) $C_j$ at zero bias, (c) $C_j$ at 10 V reverse. It then carries 5 mA forward: (d) stored hole charge, (e) $C_s$, (f) small-signal resistance. (g) It is switched to a reverse current of 2.5 mA: $t_{sd}$. (h) During $t_{sd}$, what is the diode's junction voltage doing?`,
        parts: [num('V_0', 0.796, 'V', { rel: 0.01 }), num('C_j\\ (0)', 11.43, 'pF', { rel: 0.03 }), num('C_j\\ (-10\\,\\text{V})', 3.10, 'pF', { rel: 0.03 }),
          num('Q_p', 2.0, 'nC'), num('C_s', 77.2, 'nF'), num('r', 5.18, 'Ω'), num('t_{sd}', 0.439, 'μs'),
          mc('Junction voltage during $t_{sd}$', ['still forward: it stays positive until $\\Delta p_n$ at the edge reaches zero', 'jumps to the reverse supply at once', 'zero', 'oscillates'], 0,
            [null, 'It can\'t: the law of the junction ties $V$ to $\\Delta p_n$ at the edge, and that charge is still there.', 'Zero only at the instant $\\Delta p_n = 0$, which is the end of $t_{sd}$.', 'It falls smoothly; nothing resonates.'])],
        sol: md`(a) $V_0 = 0.0259\ln\frac{10^{18}(5\times10^{15})}{2.25\times10^{20}} = 0.796$ V. (b) $C_j = A\sqrt{\frac{q\epsilon}{2(V_0 - V)}\frac{N_aN_d}{N_a + N_d}} = 11.4$ pF at 0 V. (c) $\times\sqrt{\frac{0.796}{10.796}} = 3.10$ pF. (d) $Q_p = I\tau_p = (5\times10^{-3})(0.4\times10^{-6}) = 2.0$ nC. (e) $C_s = \frac{dQ}{dV} = \frac{q}{kT}I\tau_p = \frac{2\times10^{-9}}{0.0259} = 77.2$ nF, about 7000× $C_j$. (f) $r = \frac{kT}{qI} = 5.18\,\Omega$. (g) $t_{sd} = \tau_p\ln\left(1 + \frac{I_f}{I_r}\right) = 0.4\ln3 = 0.439\,\mu$s. (h) Still forward until the stored holes at the edge are gone.` }),
      P({ src: 'Problem 3', title: 'Carriers and quasi-Fermi levels at the edge',
        q: md`A Si p-n junction has $N_d = 10^{16}\,\text{cm}^{-3}$ on its n side and is forward biased at 0.65 V. At the n-side depletion edge find (a) $\Delta p_n$ and (b) $\Delta p_n/N_d$: is low-level injection still safe? Taking $n \approx N_d$, find (c) $F_n - E_i$, (d) $E_i - F_p$, (e) $F_n - F_p$. (f) How does $F_p$ behave moving deep into the n neutral region? (g) Raise $V$ by 60 mV: what happens to $\Delta p_n$?`,
        parts: [num('\\Delta p_n', 1.784e15, 'cm^{-3}'),
          mc('Low level?', ['borderline: $\\Delta p_n$ is about 18% of $N_d$', 'easily (under 1%)', 'no, high level ($\\Delta p_n > N_d$)'], 0,
            [null, '0.18 is not ≪ 1; the approximation is starting to strain.', '$\\Delta p_n$ is still below $N_d$.']),
          num('F_n - E_i', 0.347, 'eV', { rel: 0.01 }), num('E_i - F_p', 0.303, 'eV', { rel: 0.01 }), num('F_n - F_p', 0.650, 'eV', { rel: 0.01 }),
          mc('$F_p$ deep in the n region', ['rises to meet $F_n \\approx E_F$ over a few $L_p$', 'stays $qV$ below $F_n$ everywhere', 'drops toward $E_v$', '$F_n$ drops to meet it instead'], 0,
            [null, 'The holes recombine, so their excess (and the splitting) dies out.', 'Fewer holes means $F_p$ moves away from $E_v$, not toward it.', 'The electrons are the majority; their density barely changes, so $F_n$ stays put.']),
          mc('$V$ + 60 mV: $\\Delta p_n$', ['×10', '×2', '+60%', '×e'], 0, [null, '60 mV is one decade at 300 K, not a doubling.', 'Exponential, not linear.', 'That takes 26 mV.'])],
        sol: md`(a) $p_n = 2.25\times10^4$; $e^{0.65/0.0259} = 7.93\times10^{10}$; $\Delta p_n = 1.78\times10^{15}\,\text{cm}^{-3}$. (b) 0.18: borderline. Another 60 mV and it would pass $N_d$. (c) $F_n - E_i = 0.0259\ln\frac{10^{16}}{1.5\times10^{10}} = 0.347$ eV (same as $E_F$ in equilibrium: majority carriers barely change). (d) $p = p_ne^{qV/kT}$, so $E_i - F_p = 0.0259\ln\frac{1.78\times10^{15}}{1.5\times10^{10}} = 0.303$ eV. (e) $0.347 + 0.303 = 0.650$ eV $= qV$: the law of the junction is exactly the statement that the quasi-Fermi levels are split by $qV$. (f) It rises back to $F_n$ as the holes recombine. (g) ×10.` }),
      missed(md`Part A 1, Problem 3: [Bias and the law of the junction](#/l/t16-bias), [Haynes–Shockley and quasi-Fermi levels](#/l/t13-hs). Part A 4, 5, Problem 1: [Breakdown](#/l/t19-break). Part A 2, 6, 7, 8, Problem 2: [Capacitance and switching](#/l/t20-cap). Part A 3: [Diode current](#/l/t17-diode).`),
    ],
  };

  const pools = [
    ['Junction in equilibrium', ['e2_v0', 'e2_depl', 'e2_edge']],
    ['Currents under bias', ['e2_diode', 'e2_comp', 'e2_neutral', 'e2_narrow']],
    ['Breakdown, capacitance and switching', ['e2_break', 'e2_cj', 'e2_cs', 'e2_tsd']],
    ['Contacts, light and transport', ['e2_ms', 'e2_solar', 'e2_ff', 'e2_hs']],
  ];
  const endless = {
    id: 'e2-mockr', title: 'Endless practice exam', kind: 'mock', sub: 'a new exam every time: ten quick questions and four problems from the generators',
    steps: [
      R(md`
        A fresh exam every visit: ten quick "what happens if" questions, then one problem from each of four areas with new numbers. Same rules as the fixed exams: 60 minutes, formula sheet, calculator. Press **New problem** on any part for another draw.

        ### Part A
      `),
      G('rf2_trend', { pool: RF2.all.concat(['rf2_trend', 'rf2_trend', 'rf2_scale']), need: 10 }),
      ...[].concat(...pools.map(([t, pool], j) => [R(md`### Problem ${j + 1}: ${t}`), Object.assign(G(pool[0], { pool, need: 1 }), { id: `e2-mockr.p${j}` })])),
    ],
  };

  const at = unit.lessons.findIndex((l) => l.id === 'e2-mock') + 1;
  unit.lessons.splice(at, 0, mock2, mock3, mock4, endless);
})();

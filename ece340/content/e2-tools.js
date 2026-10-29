/* Exam 2: assembles each topic lesson from e2-a/b/c.js (why → build-up → rapid fire → model and worked example →
   intuition problems → randomized problems), and adds the speed round, the formula sheet (#/sheet), mixed practice
   (#/quiz) and a timed practice exam. */
(function () {
  'use strict';
  const { R, G, P } = C;
  const E2 = ['e2-ch4', 'e2-ch5a', 'e2-ch5b', 'e2-ch5c', 'e2-ch8'];
  const RF2 = window.RF2, GN = window.E2GENS;

  COURSE.units.filter((u) => E2.includes(u.id)).forEach((u) => u.lessons.forEach((l) => {
    const tag = (steps, p) => steps.map((s, j) => ((s.t === 'prob' || s.t === 'gen') && !s.id ? Object.assign(s, { id: `${l.id}.${p}${j}` }) : s));
    const rapid = [].concat(...(RF2.topics[l.id] || []).map((d, j) => [
      R(md`### Rapid fire: ${d.title}

**The trick:** ${d.rule}${j ? '' : `

New situation every card. Look, reason, do the mental math, answer in 10–20 seconds. Eight right completes a card; keep going past that until the answer arrives before you finish reading.`}`),
      Object.assign(G(d.gen, { need: 8 }), { id: `${l.id}.r${j}` }),
    ]));
    const gens = (GN[l.id] || []).map((g, j) => Object.assign(G(g, { need: 2 }), { id: `${l.id}.g${j}` }));
    l.steps = [
      R(`!!key Why you care\n  ${l.why}`),
      ...tag(l.build, 'b'),
      ...rapid,
      ...l.rest,
      R(md`### Intuition problems

Reason from the picture first, then check with the formula. Read the explanation of every wrong option, even when you got it right; that is where the intuition is.`),
      ...tag(l.qs, 'i'),
      ...(gens.length ? [R(md`### Exam-style problems with new numbers every time

Press **New problem** for fresh values. Two correct without opening the solution completes each one. Write the four graded steps on paper as you go: governing equation, symbolic answer, substitution with units, answer to 3 significant figures.`), ...gens] : []),
    ];
    delete l.why; delete l.build; delete l.rest; delete l.qs;
  }));

  const ALLGENS = [].concat(...Object.values(GN));

  // a fixed exam problem with numeric parts
  const num = (lbl, ans, unit, tol) => ({ lbl, ans, unit, tol: tol || { rel: 0.02 } });
  const mc = (lbl, opts, a, why) => ({ lbl, mc: opts, a, why, fixed: true });

  C.unit({
    id: 'e2-x', exam: 'e2', tools: true, num: 'Exam 2', title: 'Practice',
    lessons: [
      {
        id: 'e2-speed', title: 'Speed round: what happens if…', kind: 'review', sub: `${RF2.trendCount} cause-and-effect cards plus scaling, from every topic`,
        steps: [
          R(md`
            This is the drill for the part of the exam that rewards speed: **a knob turns, which way does a quantity move, and by how much?** Doping, temperature, bias, lifetime, band gap, area, light. Each card is one knob and one quantity, from every topic, in random order. The options are always in the same order (↑, ↓, ≈) so you can answer in one thought.

            **How to answer in under 10 seconds:**

            1. **Name the formula** the quantity lives in ($W \propto \sqrt{(V_0 - V)/N}$, $I_0 \propto n_i^2/N_{light}\cdot\sqrt{D/\tau}$, $V_{br} \propto 1/N$, $C_s \propto I\tau$, $V_{oc} = \frac{kT}{q}\ln\frac{I_{op}}{I_{th}}$, …).
            2. **Find the variable the knob moves.** Temperature moves $n_i$ (hugely) and $kT$ (a little). Heavy-side doping in a one-sided junction moves almost nothing except $V_0$.
            3. **Read the power:** square root, linear, log, or exponential. Logs (like $V_0$ and $V_{oc}$) move by tens of millivolts; exponentials (like $I_0$ with T or $E_g$) move by decades.

            The explanation after each card names the formula. When you miss one, say the explanation out loud once.
          `),
          G('rf2_trend', { need: 40 }),
          R(md`
            ### By how much?

            Same idea with numbers: square roots for $W$, $C_j$, $\mathscr{E}_0$, $L$; full powers for $I_0$ and $V_{br}$ in doping; 60 mV per decade and 18 mV per doubling for anything exponential in $V$.
          `),
          G('rf2_scale', { need: 15 }),
        ],
      },
      {
        id: 'e2-sheet', title: 'Formula sheet', kind: 'read', sub: 'what the exam gives you, and what to know cold',
        steps: [
          R(md`
            The exam comes with the course formula sheet (the same F26 sheet as Exam 1, which already includes the junction formulas). **Check your copy**; this is what it covers for Exam 2, then what it doesn't.

            ### On the sheet
            - $V_0 = \frac{kT}{q}\ln\frac{p_p}{p_n} = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$, $\frac{p_p}{p_n} = \frac{n_n}{n_p} = e^{qV_0/kT}$, $qV_0 = E_{vp} - E_{vn}$, $-V_0 = \int_{-x_{p0}}^{x_{n0}}\mathscr{E}\,dx$
            - $W = \left[\frac{2\epsilon(V_0 - V)}{q}\left(\frac{N_a + N_d}{N_aN_d}\right)\right]^{1/2}$, $qAx_{p0}N_a = qAx_{n0}N_d$
            - $\Delta p_n = p_n(e^{qV/kT} - 1)$, $\Delta n_p = n_p(e^{qV/kT} - 1)$, $\delta p(x_n) = \Delta p_ne^{-x_n/L_p}$, $\delta n(x_p) = \Delta n_pe^{-x_p/L_n}$
            - $I = qA\left(\frac{D_p}{L_p}p_n + \frac{D_n}{L_n}n_p\right)(e^{qV/kT} - 1) = I_0(e^{qV/kT} - 1)$
            - $Q_p = qAL_p\Delta p_n$, $I_p(x_n = 0) = Q_p/\tau_p$, $G_s = \frac{dI}{dV} = \frac{q}{kT}I$
            - Short base: $I_p = qAD_p\Delta p_n/\ell$, $Q_p = \frac12qA\ell\Delta p_n$
            - $C_j = \epsilon A\left[\frac{q}{2(V_0 - V)}\frac{N_aN_d}{N_a + N_d}\right]^{1/2} = \frac{\epsilon A}{W}$, $C = dQ/dV$
            - $I_{op} = qAg_{op}(L_p + L_n + W)$, and the illuminated diode equation
            - Steady-state diffusion $\frac{d^2\delta p}{dx^2} = \frac{\delta p}{L_p^2}$, $L = \sqrt{D\tau}$, continuity, $D/\mu = kT/q$, the drift–diffusion currents, $n = n_ie^{(F_n - E_i)/kT}$
            - Constants: $kT = 0.0259$ eV, $\epsilon_0 = 8.85\times10^{-14}$ F/cm, $q$, $h$; "a photon of 1 μm has 1.239 eV"

            ### Not on the sheet: know these cold
            - $\lvert\mathscr{E}_0\rvert = \frac{qN_dx_{n0}}{\epsilon} = \frac{2(V_0 - V)}{W}$; $x_{n0} = \frac{WN_a}{N_a + N_d}$; $V_n/V_p = N_a/N_d$; $\epsilon_{Si} = 11.8\epsilon_0 = 1.04\times10^{-12}$ F/cm
            - One-sided: $W = \sqrt{2\epsilon(V_0 - V)/qN_{light}}$; Si anchor 1.14 μm at $10^{15}$, 1 V
            - $V_0$ in your head: 0.06 V × decades of $N_aN_d/n_i^2$ (Si $n_i^2$ = 20.35 decades); $V_0 < E_g/q$
            - Inside the depletion region: $n = N_de^{-q\Delta\phi/kT}$
            - $F_n - F_p = qV$ across the junction; $J_n = \mu_nn\,dF_n/dx$
            - $I_p(x_n) = I_p(0)e^{-x_n/L_p}$, $I_n = I - I_p$; far field $\mathscr{E} = J/q\mu_nN_d$
            - Narrow base: $t_t = \ell^2/2D_p$, $V_{base} = \frac{kT}{q}\frac{\Delta p_n}{N_d}$
            - $C_s = \frac{q}{kT}I\tau_p = G_s\tau_p$; $t_{sd} = \tau_p\ln(1 + I_f/I_r)$; $\frac{1}{C_j^2} = \frac{2(V_0 + V_R)}{q\epsilon A^2N_d}$
            - $V_{br} \approx \frac{\epsilon\mathscr{E}_{crit}^2}{2qN}$; Zener < $4E_g/q$ < mixed < $6E_g/q$ < avalanche; Zener T-coefficient −, avalanche +; $M = 1/(1 - P)$; $I_{gen} = qAn_iW/2\tau_0$; ideality $n$ = 1 or 2
            - M–S: $\phi_s = \chi + (E_c - E_F)/q$; n: $\phi_B = \phi_m - \chi$, $V_0 = \phi_m - \phi_s$; the rectifying/ohmic table
            - $I_{sc} = I_{op}$, $V_{oc} = \frac{kT}{q}\ln(1 + I_{op}/I_{th})$, $FF = \frac{V_mI_m}{V_{oc}I_{sc}}$, $P_{max} = FF\cdot V_{oc}I_{sc}$, sunlight 100 mW/cm²; $\lambda\,[\mu\text{m}] = 1.24/E_g$
            - Haynes–Shockley: $\mu = L/\mathscr{E}t_d$, $D = (v_d\Delta t)^2/16t_d$

            ### Numbers to have in your fingers
            | | |
            |---|---|
            | 60 mV | one decade ($kT\ln 10$) of carrier density or current |
            | 18 mV | one doubling ($kT\ln 2$) |
            | 26 mV | $kT/q$; small-signal $r = 26\,\Omega$ at 1 mA |
            | ×2 per 5 K | Si $I_0$ near room temperature; forward V −2 mV/K |
            | 0.55–0.95 V | Si $V_0$; GaAs ~1.2 V |
            | 0.3 / 0.7 / 1.1 V | Ge / Si / GaAs turn-on |
            | $10^4$–$10^5$ V/cm | junction fields; ~$3$–$5\times10^5$ avalanche; ~$10^6$ Zener |
            | 1 pF | Si, 100 μm × 100 μm, $W$ = 1 μm |
            | 38.6 nF | $C_s$ at 1 mA, $\tau$ = 1 μs |
            | 4.5 V / 6.7 V | Si Zener / avalanche boundaries ($4E_g$, $6E_g$) |

            ### Say these out loud before the exam
            1. Equilibrium: $E_F$ flat, bands bend by $qV_0$, drift = diffusion for each carrier.
            2. The light side sets $W$, $\mathscr{E}_0$, $C_j$, $V_{br}$ and $I_0$.
            3. Depletion reaches into the light side; the voltage drops there; charge balance $N_ax_p = N_dx_n$.
            4. Field: triangle, peak at the junction, points n → p.
            5. Forward: barrier ↓, $W$ ↓, injection ×10 per 60 mV. Reverse: barrier ↑, $W$ ↑, edges empty, current saturates.
            6. Forward current = majority diffusion over the barrier; reverse = minority drift, supply-limited.
            7. Minority carriers move by diffusion; far from the junction, majority drift carries everything.
            8. Current = stored charge / lifetime (long) or / transit time (narrow).
            9. $I_0 \propto n_i^2$: temperature and band gap are the big knobs.
            10. More doping → lower $V_{br}$; Zener = thin + heavy + low V + negative T-coefficient.
            11. Reverse: $C_j \propto (V_0 + V_R)^{-1/2}$. Forward: $C_s \propto I\tau$.
            12. Turn-off waits for the stored charge: $t_{sd} = \tau\ln(1 + I_f/I_r)$.
            13. n-type: big $\phi_m$ rectifies. p-type: small $\phi_m$ rectifies. Schottky = majority carriers, no storage.
            14. Light: reverse current $I_{op}$; $I_{sc}$ linear, $V_{oc}$ logarithmic; power in the 4th quadrant.
          `),
        ],
      },
      {
        id: 'e2-mix', title: 'Mixed practice', kind: 'review',
        steps: [
          R(md`
            Questions from all ten Exam 2 topics in random order, with nothing telling you which topic they come from: that's how the exam asks. Every card links back to its lesson.

            ### Concepts
          `),
          G('concept', { need: 15, units: E2 }),
          R(md`### Rapid fire from every topic`),
          G('rf2_trend', { pool: RF2.all.concat(['rf2_trend', 'rf2_trend', 'rf2_scale']), need: 25 }),
          R(md`### Exam-style problems`),
          G('e2_depl', { pool: ALLGENS, need: 6 }),
        ],
      },
      {
        id: 'e2-mock', title: 'Practice exam (60 min)', kind: 'mock', sub: 'four problems in the style of the hour exams and HW6–7',
        steps: [
          R(md`
            Set a timer for 60 minutes and use only the formula sheet and a calculator. Si at 300 K, $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$, $kT = 0.0259$ eV, $\epsilon_{Si} = 11.8\epsilon_0$ unless stated. Answers within 2% count.
          `),
          P({ src: 'Practice · Problem 1', title: 'Junction in equilibrium',
            q: md`An abrupt Si p-n junction has $N_a = 2\times10^{17}$ and $N_d = 5\times10^{15}\,\text{cm}^{-3}$. Find (a) $E_F - E_i$ on the n side and $E_i - E_F$ on the p side, (b) $V_0$, (c) $W$, $x_{n0}$, $x_{p0}$, (d) the peak field, (e) how much of $V_0$ drops across the n side.`,
            parts: [num('(E_F - E_i)_n', 0.3294, 'eV'), num('(E_i - E_F)_p', 0.4249, 'eV'), num('V_0', 0.7543, 'V'), num('W', 0.4493, 'μm'), num('x_{n0}', 0.4383, 'μm'), num('x_{p0}', 10.96, 'nm'), num('|\\mathscr{E}_0|', 3.358e4, 'V/cm'), num('V_n', 0.7359, 'V')],
            sol: md`(a) $0.0259\ln(5\times10^{15}/1.5\times10^{10}) = 0.329$ eV; $0.0259\ln(2\times10^{17}/1.5\times10^{10}) = 0.425$ eV. (b) $V_0 = 0.754$ V. (c) $W = \sqrt{\frac{2(1.044\times10^{-12})(0.754)}{1.6\times10^{-19}}\cdot\frac{2.05\times10^{17}}{10^{33}}} = 0.449\,\mu$m; $x_{n0} = W\frac{N_a}{N_a + N_d} = 0.438\,\mu$m; $x_{p0} = 11.0$ nm. (d) $2V_0/W = 3.36\times10^4$ V/cm, n → p. (e) $V_n = V_0\frac{N_a}{N_a + N_d} = 0.736$ V (98%).` }),
          P({ src: 'Practice · Problem 2', title: 'Biased junction and its currents',
            q: md`The same junction has $A = 10^{-3}$ cm², $D_p = 10$ cm²/s and $\tau_p = 1\,\mu$s in the n side, $D_n = 20$ cm²/s and $\tau_n = 0.5\,\mu$s in the p side; both neutral regions are long. At a forward bias of 0.55 V find (a) $L_p$, (b) the excess minority densities at both depletion edges and whether injection is low level, (c) $I_0$, $I$, and the fraction carried by holes, (d) $W$. (e) What is the current at 5 V reverse (ideal)?`,
            parts: [num('L_p', 31.62, 'μm'), num('\\Delta p_n', 7.511e13, 'cm^{-3}'), num('\\Delta n_p', 1.878e12, 'cm^{-3}'), mc('Low level?', ['yes', 'no'], 0, [null, md`$\Delta p_n/N_d = 0.015$ ≪ 1.`]), num('I_0', 2.391e-14, 'A'), num('I', 3.99e-5, 'A'), num('I_p/I', 0.9524, ''), num('W', 0.2338, 'μm'), num('I(-5\\,\\text{V})', -2.391e-14, 'A')],
            sol: md`(a) $L_p = L_n = \sqrt{10\times10^{-6}} = 31.6\,\mu$m. (b) $p_n = 4.5\times10^4$, $n_p = 1.125\times10^3$; $e^{0.55/0.0259} - 1 = 1.67\times10^9$ → $\Delta p_n = 7.51\times10^{13}$, $\Delta n_p = 1.88\times10^{12}\,\text{cm}^{-3}$; $\Delta p_n/N_d = 0.015$: low level. (c) $I_0 = qA(\frac{10}{3.16\times10^{-3}}4.5\times10^4 + \frac{20}{3.16\times10^{-3}}1125) = 2.39\times10^{-14}$ A; $I = 39.9\,\mu$A; holes $\frac{4.5\times10^4}{4.5\times10^4 + 2\times1125} = 95.2\%$. (d) $W\sqrt{(0.754 - 0.55)/0.754} = 0.234\,\mu$m. (e) $-I_0 = -2.39\times10^{-14}$ A (real diodes: more, from generation).` }),
          P({ src: 'Practice · Problem 3', title: 'How do these change?',
            q: md`A Si p⁺-n diode breaks down by avalanche at 60 V. The n-side doping is **quadrupled**; nothing else changes (take $\mathscr{E}_{crit}$ as fixed). For each quantity, pick the change, and estimate the new breakdown voltage.`,
            parts: [mc('V_0', ['increases slightly', 'decreases slightly', 'unchanged', 'doubles'], 0, [null, md`$\ln$ of a bigger product.`, md`$+\frac{kT}{q}\ln4$ = +36 mV.`, 'Logarithmic, not linear.']),
              mc('W\\ \\text{at zero bias}', ['about halves', 'about doubles', 'about ×¼', 'unchanged'], 0, [null, md`$W \propto N_d^{-1/2}$.`, 'Square root.', 'The light side sets it.']),
              mc('C_j\\ \\text{at zero bias}', ['about doubles', 'about halves', 'about ×4', 'unchanged'], 0, [null, 'Narrower W, larger C.', 'Square root.', 'It follows W.']),
              mc('I_0', ['about ×¼', 'about ×4', 'about ×½', 'unchanged'], 0, [null, md`$p_n = n_i^2/N_d$ falls.`, 'Linear in $1/N_d$.', 'The light side sets it.']),
              num('V_{br}\\ \\text{(new)}', 15, 'V', { rel: 0.03 }),
              mc('Mechanism now', ['still avalanche', 'Zener', 'both equally'], 0, [null, md`15 V > $6E_g/q$ ≈ 6.7 V.`, 'Not in the 4.5–6.7 V window.']),
              mc('Temperature coefficient of V_{br}', ['positive', 'negative', 'zero'], 0, [null, 'That is Zener.', 'Only in the mixed window.'])],
            sol: md`$V_0$ +36 mV; $W$, $x_{n0}$ ×½; $C_j$ ×2; $I_0$ ×¼ (and the turn-on voltage +36 mV); $V_{br} \propto 1/N_d$ → 60/4 = 15 V, still above 6.7 V so still avalanche, positive temperature coefficient. Heavier still and it would cross into Zener.` }),
          P({ src: 'Practice · Problem 4', title: 'Solar cell and switching',
            q: md`(a) A 1 cm² Si solar cell under 100 mW/cm² has $I_{sc} = 35$ mA and dark saturation current $I_{th} = 2\times10^{-12}$ A; its fill factor is 0.78. Find $V_{oc}$, $P_{max}$, the efficiency, and $V_{oc}$ under 10× the light. Which quadrant does it operate in? (b) A p⁺-n diode with $\tau_p = 2\,\mu$s carries 2 mA and is switched to a reverse current of 1 mA. Storage delay time?`,
            parts: [num('V_{oc}', 0.6109, 'V'), num('P_{max}', 16.68, 'mW'), num('\\eta', 16.68, '%'), num('V_{oc}\\ (10\\times)', 0.6705, 'V'), mc('Quadrant', ['4th (V > 0, I < 0)', '1st', '3rd', '2nd'], 0, [null, 'That absorbs power.', 'That is the photodiode.', 'Not used.']), num('t_{sd}', 2.197, 'μs')],
            sol: md`(a) $V_{oc} = 0.0259\ln(1 + 0.035/2\times10^{-12}) = 0.611$ V; $P_{max} = 0.78(35\,\text{mA})(0.611\,\text{V}) = 16.7$ mW; $\eta = 16.7\%$; 10× light: +0.0596 V → 0.671 V. (b) $t_{sd} = 2\ln(1 + 2/1) = 2.20\,\mu$s.` }),
        ],
      },
    ],
  });
})();

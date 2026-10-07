/* Exam 1: finishes each topic lesson (the extra reading and questions from e1-more.js, the lesson's question bank,
   then randomized problems), and adds the formula sheet (#/sheet) and mixed practice (#/quiz). */
(function () {
  'use strict';
  const { R, G } = C;
  const E1 = ['ch1', 'ch3', 'ch4'];

  // randomized problems at the end of each lesson (js/gens-semi.js)
  const GENS_FOR = {
    't1-crystal': ['semi_lattice'], 't2-bands': ['semi_units', 'semi_effmass'], 't3-carriers': ['semi_doped'],
    't4-fermi': ['semi_fermi', 'semi_ef_from_n', 'semi_n_from_ef'], 't5-temp': ['semi_intrinsic', 'semi_compensated'],
    't6-drift': ['semi_bar', 'semi_mob_mc', 'semi_matthiessen', 'semi_mincond'], 't7-flatef': ['semi_contact'],
    't8-optical': ['semi_absorb'], 't9-recomb': ['semi_decay_low', 'semi_decay_high'],
    't10-qfl': ['semi_qfl', 'semi_photocond'], 't11-diffusion': ['semi_einstein', 'semi_graded', 'semi_drift_diff'],
    't12-continuity': ['semi_steady'],
  };
  const ALL = [].concat(...Object.values(GENS_FOR));
  const MORE = window.MORE || {};

  COURSE.units.filter((u) => E1.includes(u.id)).forEach((u) => u.lessons.forEach((l) => {
    const more = MORE[l.id] || {};
    if (more.read) {
      const i = l.steps.findIndex((s) => s.t === 'read' && /### Worked example/.test(s.md || ''));
      l.steps.splice(i < 0 ? l.steps.length : i, 0, ...more.read);
    }
    const qs = (l.bank || []).concat(more.qs || []);
    if (qs.length) l.steps.push(R(md`### More questions`), ...qs);
    const gens = GENS_FOR[l.id] || [];
    if (gens.length) {
      l.steps.push(R(md`### Problems with new numbers every time

Press **New problem** for fresh values. Two correct answers without opening the solution complete each one; keep going until they feel automatic.`), ...gens.map((g) => G(g, { need: 2 })));
    }
    delete l.bank;
  }));

  C.unit({
    id: 'e1-x', exam: 'e1', tools: true, num: 'Exam 1', title: 'Practice',
    lessons: [
      {
        id: 'e1-sheet', title: 'Formula sheet', kind: 'read',
        steps: [
          R(md`
            The exam comes with the course formula sheet: physical constants, the Fermi function and density of states, $N_c$, $N_v$, $n_i$, the $n_0$/$p_0$ forms with $E_F$ and the quasi-Fermi levels, $\mu = q\bar t/m^*$, $D/\mu = kT/q$, $R = \rho L/wt$, $\sigma$, the drift–diffusion currents, $\delta n = g\tau$, the decay law, the continuity and diffusion equations, $L = \sqrt{D\tau}$ and $V_0$. So you don't need to memorize those, but you do need to know what each one means and when it applies.

            ### Not on the exam sheet: memorize these

            - **Si:** $E_g = 1.12$ eV, $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$ at 300 K. Photon energy $E\,[\text{eV}] = 1.24/\lambda\,[\mu\text{m}]$.
            - **Cells:** atoms per cubic cell sc 1, bcc 2, fcc 4, diamond/zincblende 8 (corner $\tfrac18$, face $\tfrac12$, edge $\tfrac14$); $N = \text{atoms}/a^3$, $\rho_m = NM/N_A$; Miller indices = reciprocals of the intercepts, cleared to integers.
            - $E_F - E_i = kT\ln(n_0/n_i)$ and $E_i - E_F = kT\ln(p_0/n_i)$; $f(E_F) = \tfrac12$; $1 - f$ = probability empty.
            - **Neutrality** $p_0 + N_d = n_0 + N_a$ with $n_0p_0 = n_i^2$ gives the quadratic for $n_0$; it reduces to $n_0 \approx N_d - N_a$ when that is $\gg n_i$.
            - $n_i \propto T^{3/2}e^{-E_g/2kT}$; $kT$ scales with $T$ ($0.0259 \times T/300$).
            - **Mobility:** $1/\mu = 1/\mu_L + 1/\mu_I$; lattice $\mu_L \propto T^{-3/2}$, impurity $\mu_I \propto T^{3/2}/N_I$; drift velocity saturates near $10^7$ cm/s.
            - **Light:** $I(x) = I_0e^{-\alpha x}$; photons per second $= P/h\nu$; heat per photon $h\nu - E_g$.
            - **Recombination:** $\tau_n = 1/\alpha_r(n_0 + p_0)$; thermal generation $g = \alpha_rn_i^2$; high level $\delta n(t) = \Delta n/(1 + \alpha_r\Delta n\,t)$.
            - **Photoconductivity** $\Delta\sigma = q(\delta n\,\mu_n + \delta p\,\mu_p)$.
            - **Graded doping at equilibrium:** $\mathscr{E} = -\dfrac{kT}{q}\dfrac1n\dfrac{dn}{dx}$; current from a quasi-Fermi level slope $J_n = \mu_nn\,dF_n/dx$.
            - $\delta p(x) = \Delta p\,e^{-x/L_p}$ and $J_p = \dfrac{qD_p}{L_p}\delta p(x)$ for a long bar; $J_p = qD_p\Delta p/W$ for a short one.

            ### Constants (300 K unless stated)

            | | |
            |---|---|
            | $q = 1.6\times10^{-19}$ C | $k = 8.62\times10^{-5}$ eV/K; $kT = 0.0259$ eV, $kT/q = 0.0259$ V |
            | $h = 6.626\times10^{-34}$ J·s $= 4.136\times10^{-15}$ eV·s | $m_0 = 9.11\times10^{-31}$ kg |
            | $\epsilon_0 = 8.85\times10^{-14}$ F/cm | $E\,[\text{eV}] = 1.24/\lambda\,[\mu\text{m}]$ |
            | $1\,\text{Å} = 10^{-8}$ cm, $1\,\mu\text{m} = 10^{-4}$ cm | $1\,\text{eV} = 1.6\times10^{-19}$ J |

            | | $E_g$ (eV) | $n_i$ ($\text{cm}^{-3}$) | $N_c$, $N_v$ ($\text{cm}^{-3}$) | $\mu_n$, $\mu_p$ (cm²/V·s) | $\epsilon_r$ | $a$ (Å) |
            |---|---|---|---|---|---|---|
            | Si | 1.12 | $1.5\times10^{10}$ | $2.8\times10^{19}$, $1.04\times10^{19}$ | 1350, 480 | 11.8 | 5.43 |
            | Ge | 0.67 | $2.5\times10^{13}$ | $1.04\times10^{19}$, $6.0\times10^{18}$ | 3900, 1900 | 16 | 5.65 |
            | GaAs | 1.43 | $2\times10^{6}$ | $4.7\times10^{17}$, $7.0\times10^{18}$ | 8500, 400 | 13.2 | 5.65 |

            When a problem gives a value, use the problem's.

            ### Crystals (Ch. 1)

            $$N = \frac{\text{atoms per cell}}{a^3} \qquad N_{(100)} = \frac{\text{atoms on the face}}{a^2} \qquad \rho_m = \frac{NM}{N_A}$$
            $(hkl)$ plane, $[hkl]$ direction ($\perp$ to $(hkl)$ in cubic), $\{\,\}$ and $\langle\,\rangle$ families.

            ### Bands (3.1)

            $$m^* = \frac{\hbar^2}{d^2E/dk^2} \qquad E = E_c + \frac{\hbar^2k^2}{2m^*} \qquad p = \hbar k = \frac h\lambda \qquad \lambda = \frac{hc}{E_g}$$
            Direct gap (GaAs): band extrema at the same $k$, efficient light emission. Indirect (Si, Ge): needs a phonon.

            ### Carriers at equilibrium (3.2–3.3)

            $$f(E) = \frac{1}{1 + e^{(E - E_F)/kT}} \qquad n_0 = \int_{E_c}^\infty f(E)N(E)\,dE \qquad N(E) \propto (E - E_c)^{1/2}$$
            $$n_0 = N_ce^{-(E_c - E_F)/kT} \qquad p_0 = N_ve^{-(E_F - E_v)/kT} \qquad N_c = 2\left(\frac{2\pi m_n^*kT}{h^2}\right)^{3/2}\propto T^{3/2}$$
            $$n_0 = n_ie^{(E_F - E_i)/kT} \qquad p_0 = n_ie^{(E_i - E_F)/kT} \qquad n_0p_0 = n_i^2 \qquad n_i = \sqrt{N_cN_v}\,e^{-E_g/2kT}$$
            $$E_i = \frac{E_c + E_v}{2} + \frac{kT}{2}\ln\frac{N_v}{N_c} \qquad \frac{n_i(T_2)}{n_i(T_1)} = \left(\frac{T_2}{T_1}\right)^{3/2}\exp\left[-\frac{E_g}{2k}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)\right]$$
            $$n_0 = \frac{N_d - N_a}{2} + \sqrt{\left(\frac{N_d - N_a}{2}\right)^2 + n_i^2} \;\xrightarrow{|N_d - N_a| \gg n_i}\; N_d - N_a$$
            Donor binding (hydrogen model): $E = 13.6\,\text{eV}\,\dfrac{m^*/m_0}{\epsilon_r^2}$.

            ### Drift (3.4)

            $$v_d = \mu\mathscr{E} \qquad \mu = \frac{q\bar t}{m^*} \qquad J = q(n\mu_n + p\mu_p)\mathscr{E} = \sigma\mathscr{E} \qquad \rho = \frac1\sigma \qquad R = \frac{\rho L}{wt}$$
            $$\frac1\mu = \frac{1}{\mu_L} + \frac{1}{\mu_I} \qquad \mu_L \propto T^{-3/2} \qquad \mu_I \propto \frac{T^{3/2}}{N_d^+ + N_a^-} \qquad \sigma_{\min} = 2qn_i\sqrt{\mu_n\mu_p}$$

            ### Equilibrium Fermi level (3.5)

            $$\frac{dE_F}{dx} = 0 \qquad qV_0 = kT\ln\frac{N_aN_d}{n_i^2} \qquad \mathscr{E} = \frac1q\frac{dE_c}{dx} = \frac1q\frac{dE_i}{dx}$$

            ### Light and excess carriers (4.1, 4.3)

            $$I(x) = I_0e^{-\alpha x} \qquad \text{absorbed: } 1 - e^{-\alpha d} \qquad \text{heat fraction } \frac{h\nu - E_g}{h\nu} \qquad \dot N = \frac{P}{h\nu}$$
            $$\frac{d\,\delta n}{dt} = -\alpha_r(n_0 + p_0)\delta n - \alpha_r\delta n^2 \qquad g(T) = \alpha_rn_i^2$$
            $$\text{low level: } \delta n = \Delta n\,e^{-t/\tau_n},\; \tau_n = \frac{1}{\alpha_r(n_0 + p_0)} \qquad \text{high level: } \delta n = \frac{\Delta n}{1 + \alpha_r\Delta n\,t}$$
            $$\delta n = g_{op}\tau_n \qquad n = n_ie^{(F_n - E_i)/kT} \qquad p = n_ie^{(E_i - F_p)/kT} \qquad np = n_i^2e^{(F_n - F_p)/kT}$$
            $$\Delta\sigma = qg_{op}(\tau_n\mu_n + \tau_p\mu_p)$$

            ### Diffusion and continuity (4.4)

            $$J_n = q\mu_nn\mathscr{E} + qD_n\frac{dn}{dx} \qquad J_p = q\mu_pp\mathscr{E} - qD_p\frac{dp}{dx} \qquad \frac{D}{\mu} = \frac{kT}{q}$$
            $$\text{graded, equilibrium: } \mathscr{E} = -\frac{kT}{q}\frac1n\frac{dn}{dx} = +\frac{kT}{q}\frac1p\frac{dp}{dx} \qquad N_d = N_0e^{-x/L}:\ \mathscr{E} = +\tfrac{kT}{qL}$$
            $$J_n = \mu_nn\frac{dF_n}{dx} \qquad J_p = \mu_pp\frac{dF_p}{dx}$$
            $$\frac{\partial\,\delta p}{\partial t} = -\frac1q\frac{\partial J_p}{\partial x} - \frac{\delta p}{\tau_p} \qquad \frac{d^2\delta p}{dx^2} = \frac{\delta p}{L_p^2}\ \text{(steady state, no field)}$$
            $$L_p = \sqrt{D_p\tau_p} \qquad \delta p(x) = \Delta p\,e^{-x/L_p} \qquad J_p(x) = \frac{qD_p}{L_p}\Delta p\,e^{-x/L_p} \qquad Q_p = qAL_p\Delta p,\ I = \frac{Q_p}{\tau_p}$$
          `),
        ],
      },
      {
        id: 'e1-mix', title: 'Mixed practice', kind: 'review',
        steps: [
          R(md`
            Questions from all twelve topics in random order, with nothing telling you which topic they belong to. That is how the exam asks them. Every card links back to its lesson, so a miss shows you exactly what to reread.

            ### Concepts
          `),
          G('concept', { need: 15, units: E1 }),
          R(md`### Problems`),
          G(ALL[0], { pool: ALL, need: 10 }),
        ],
      },
    ],
  });
})();

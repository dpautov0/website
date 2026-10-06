/* Exam 1 practice: the formula sheet (#/sheet), the drill (#/drill: a landing page and three pages of randomized
   problems covering every Exam 1 objective), and the concept quiz (#/quiz). */
(function () {
  'use strict';
  const { R, G } = C;
  const E1 = ['ch1', 'ch3', 'ch4'];

  C.unit({
    id: 'e1-x', exam: 'e1', tools: true, num: 'Exam 1', title: 'Practice',
    lessons: [
      {
        id: 'e1-sheet', title: 'Formula sheet', kind: 'read', hideHome: false,
        steps: [
          R(md`
            Every equation on this site in one place, in the order of the topics. The <a href="cheatsheet.html">cheat sheet</a> is the same material squeezed onto two printable pages with worked examples on the back.

            ### Constants (300 K unless stated)

            | | |
            |---|---|
            | $q = 1.6\times10^{-19}$ C | $k = 8.62\times10^{-5}$ eV/K; $kT = 0.0259$ eV, $kT/q = 0.0259$ V |
            | $h = 6.63\times10^{-34}$ J·s, $\hbar = 1.055\times10^{-34}$ J·s | $m_0 = 9.11\times10^{-31}$ kg |
            | $\epsilon_0 = 8.85\times10^{-14}$ F/cm | $E\,[\text{eV}] = 1.24/\lambda\,[\mu\text{m}]$ |
            | $1\,\text{Å} = 10^{-8}$ cm, $1\,\mu\text{m} = 10^{-4}$ cm | $1\,\text{eV} = 1.6\times10^{-19}$ J |

            | | $E_g$ (eV) | $n_i$ ($\text{cm}^{-3}$) | $N_c$, $N_v$ ($\text{cm}^{-3}$) | $\mu_n$, $\mu_p$ (cm²/V·s) | $\epsilon_r$ | $a$ (Å) |
            |---|---|---|---|---|---|---|
            | Si | 1.11 | $10^{10}$ | $2.8\times10^{19}$, $1.04\times10^{19}$ | 1350, 480 | 11.8 | 5.43 |
            | Ge | 0.67 | $2.5\times10^{13}$ | $1.04\times10^{19}$, $6.0\times10^{18}$ | 3900, 1900 | 16 | 5.65 |
            | GaAs | 1.43 | $2\times10^{6}$ | $4.7\times10^{17}$, $7.0\times10^{18}$ | 8500, 400 | 13.2 | 5.65 |

            These are the values the site uses; when a problem gives a value, use the problem's.

            ### Crystals (Ch. 1)

            Atoms per cubic cell: sc 1, bcc 2, fcc 4, diamond/zincblende 8. Corner $\tfrac18$, face $\tfrac12$, edge $\tfrac14$, inside 1.
            $$N = \frac{\text{atoms per cell}}{a^3} \qquad N_{(100)} = \frac{\text{atoms on the face}}{a^2} \qquad \rho_m = \frac{NM}{N_A}$$
            Miller indices: intercepts (units of $a$) → reciprocals → smallest integers. $(hkl)$ plane, $[hkl]$ direction ($\perp$ to $(hkl)$ in cubic), $\{\,\}$ and $\langle\,\rangle$ families.

            ### Bands (3.1)

            $$m^* = \frac{\hbar^2}{d^2E/dk^2} \qquad E = E_c + \frac{\hbar^2k^2}{2m^*} \qquad \lambda = \frac{hc}{E_g}$$
            Direct gap (GaAs): band extrema at the same $k$, efficient light emission. Indirect (Si, Ge): needs a phonon.

            ### Carriers at equilibrium (3.2–3.3)

            $$f(E) = \frac{1}{1 + e^{(E - E_F)/kT}} \qquad 1 - f(E) = \text{probability empty} \qquad f(E_F) = \tfrac12$$
            $$n_0 = N_ce^{-(E_c - E_F)/kT} \qquad p_0 = N_ve^{-(E_F - E_v)/kT} \qquad N_c = 2\left(\frac{2\pi m_n^*kT}{h^2}\right)^{3/2}\propto T^{3/2}$$
            $$n_0 = n_ie^{(E_F - E_i)/kT} \qquad p_0 = n_ie^{(E_i - E_F)/kT} \qquad E_F - E_i = kT\ln\frac{n_0}{n_i}$$
            $$n_0p_0 = n_i^2 \qquad n_i = \sqrt{N_cN_v}\,e^{-E_g/2kT} \qquad E_i = \frac{E_c + E_v}{2} + \frac{kT}{2}\ln\frac{N_v}{N_c}$$
            $$\frac{n_i(T_2)}{n_i(T_1)} = \left(\frac{T_2}{T_1}\right)^{3/2}\exp\left[-\frac{E_g}{2k}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)\right]$$
            Neutrality: $p_0 + N_d^+ = n_0 + N_a^-$, so
            $$n_0 = \frac{N_d - N_a}{2} + \sqrt{\left(\frac{N_d - N_a}{2}\right)^2 + n_i^2} \;\xrightarrow{|N_d - N_a| \gg n_i}\; N_d - N_a$$
            Donor binding (hydrogen model): $E = 13.6\,\text{eV}\,\dfrac{m^*/m_0}{\epsilon_r^2}$.

            ### Drift (3.4)

            $$v_d = \mu\mathscr{E} \qquad \mu = \frac{q\bar t}{m^*} \qquad J = q(n\mu_n + p\mu_p)\mathscr{E} = \sigma\mathscr{E} \qquad \rho = \frac1\sigma \qquad R = \frac{\rho L}{A}$$
            $$\frac1\mu = \frac{1}{\mu_L} + \frac{1}{\mu_I} \qquad \mu_L \propto T^{-3/2} \qquad \mu_I \propto \frac{T^{3/2}}{N_d^+ + N_a^-}$$
            Velocity saturates near $10^7$ cm/s at high field. Hall: $p_0 = \dfrac{I_xB_z}{qtV_{AB}}$, $\mu_p = \dfrac{1}{q\rho p_0}$ ($B$ in Wb/cm² with $t$ in cm: $1\,\text{T} = 10^{-4}$ Wb/cm²).

            ### Equilibrium Fermi level (3.5)

            $$\frac{dE_F}{dx} = 0 \qquad qV_0 = kT\ln\frac{N_aN_d}{n_i^2} \qquad \mathscr{E} = \frac1q\frac{dE_c}{dx}$$

            ### Light and excess carriers (4.1, 4.3)

            $$I(x) = I_0e^{-\alpha x} \qquad \text{absorbed: } 1 - e^{-\alpha d} \qquad \text{heat fraction } \frac{h\nu - E_g}{h\nu} \qquad \dot N = \frac{P}{h\nu}$$
            $$\frac{d\,\delta n}{dt} = -\alpha_r(n_0 + p_0)\delta n - \alpha_r\delta n^2 \qquad g(T) = \alpha_rn_i^2$$
            $$\text{low level: } \delta n = \Delta n\,e^{-t/\tau_n},\; \tau_n = \frac{1}{\alpha_r(n_0 + p_0)} \qquad \text{high level: } \delta n = \frac{\Delta n}{1 + \alpha_r\Delta n\,t}$$
            $$\delta n = g_{op}\tau_n \qquad n = n_ie^{(F_n - E_i)/kT} \qquad p = n_ie^{(E_i - F_p)/kT} \qquad \Delta\sigma = qg_{op}(\tau_n\mu_n + \tau_p\mu_p)$$

            ### Diffusion and continuity (4.4)

            $$J_n = q\mu_nn\mathscr{E} + qD_n\frac{dn}{dx} \qquad J_p = q\mu_pp\mathscr{E} - qD_p\frac{dp}{dx} \qquad \frac{D}{\mu} = \frac{kT}{q}$$
            $$\text{graded, equilibrium: } \mathscr{E} = -\frac{kT}{q}\frac1n\frac{dn}{dx} = +\frac{kT}{q}\frac1p\frac{dp}{dx} \qquad N_d = N_0e^{-x/L}:\ \mathscr{E} = +\tfrac{kT}{qL} \qquad N_a = N_0e^{-x/L}:\ \mathscr{E} = -\tfrac{kT}{qL}$$
            $$J_n = \mu_nn\frac{dF_n}{dx} \qquad J_p = \mu_pp\frac{dF_p}{dx}$$
            $$\frac{\partial p}{\partial t} = -\frac1q\frac{\partial J_p}{\partial x} - \frac{\delta p}{\tau_p} \qquad \frac{\partial\,\delta p}{\partial t} = D_p\frac{\partial^2\delta p}{\partial x^2} - \frac{\delta p}{\tau_p}$$
            $$L_p = \sqrt{D_p\tau_p} \qquad \delta p(x) = \Delta p\,e^{-x/L_p} \qquad J_p(x) = \frac{qD_p}{L_p}\Delta p\,e^{-x/L_p} \qquad \text{short bar: } J_p = \frac{qD_p\Delta p}{W}$$
          `),
        ],
      },
      {
        id: 'e1-drill', title: 'Drill: start here', kind: 'read',
        steps: [
          R(md`
            New numbers every time you press **New problem**. Each skill is done after three correct answers without opening the solution. Every solution is written the way the course grades: governing equation, symbolic solution, substitution with units on every quantity, answer to 3 significant figures. Work it on paper first, the same way.

            | Exam 1 objective | Drill | Taught in |
            |---|---|---|
            | Carrier concentrations, intrinsic and doped | [Equilibrium](#/l/e1-drill-eq) 1–2 | [Topics 3](#/l/t3-carriers), [5](#/l/t5-temp) |
            | Occupation probability from the Fermi function | [Equilibrium](#/l/e1-drill-eq) 3 | [Topic 4](#/l/t4-fermi) |
            | $E_F$ from $n$ or $p$, and $n$ or $p$ from $E_F$ | [Equilibrium](#/l/e1-drill-eq) 4–5 | [Topic 4](#/l/t4-fermi) |
            | Compensation and neutrality, $n_i$ or minority not negligible | [Equilibrium](#/l/e1-drill-eq) 6 | [Topic 5](#/l/t5-temp) |
            | Current density, conductivity, resistivity, resistance of a bar | [Transport](#/l/e1-drill-tr) 1 | [Topic 6](#/l/t6-drift) |
            | Mobility vs temperature, doping, field | [Transport](#/l/e1-drill-tr) 2–3 | [Topic 6](#/l/t6-drift) |
            | $D$ from $\mu$ (Einstein); built-in field in graded doping | [Transport](#/l/e1-drill-tr) 4–5 | [Topic 11](#/l/t11-diffusion) |
            | Drift and diffusion components for a given profile | [Transport](#/l/e1-drill-tr) 6 | [Topic 11](#/l/t11-diffusion) |
            | Optical absorption | [Excess carriers](#/l/e1-drill-ex) 1 | [Topic 8](#/l/t8-optical) |
            | Excess carriers vs time, low- and high-level injection | [Excess carriers](#/l/e1-drill-ex) 2–3 | [Topic 9](#/l/t9-recomb) |
            | Quasi-Fermi levels under uniform light; photoconductivity | [Excess carriers](#/l/e1-drill-ex) 4–5 | [Topic 10](#/l/t10-qfl) |
            | Steady-state injection, diffusion length, diffusion current | [Excess carriers](#/l/e1-drill-ex) 6 | [Topic 12](#/l/t12-continuity) |
            | Crystals and effective mass (warm-ups) | [Equilibrium](#/l/e1-drill-eq) 7–8 | [Topics 1](#/l/t1-crystal), [2](#/l/t2-bands) |

            Short on time: the first card of each page, then whatever you miss.
          `),
        ],
      },
      {
        id: 'e1-drill-eq', title: 'Drill: equilibrium carriers', kind: 'review',
        steps: [
          R(md`Carrier concentrations, the Fermi function, the Fermi level, compensation. Constants are stated in each problem.`),
          G('semi_doped'), G('semi_intrinsic'), G('semi_fermi'), G('semi_ef_from_n'), G('semi_n_from_ef'), G('semi_compensated'),
          R(md`### Warm-ups (Ch. 1, 3.1)`),
          G('semi_lattice', { need: 2 }), G('semi_effmass', { need: 2 }),
        ],
      },
      {
        id: 'e1-drill-tr', title: 'Drill: drift, mobility, diffusion', kind: 'review',
        steps: [
          R(md`Resistance of a bar, mobility trends, Einstein, built-in fields, and splitting a current into drift and diffusion. Signs matter: $+$ means along $+x$.`),
          G('semi_bar'), G('semi_mob_mc', { need: 4 }), G('semi_matthiessen'), G('semi_einstein'), G('semi_graded'), G('semi_drift_diff'),
        ],
      },
      {
        id: 'e1-drill-ex', title: 'Drill: light and excess carriers', kind: 'review',
        steps: [
          R(md`Absorption, decay after a pulse, quasi-Fermi levels, photoconductivity, steady-state injection.`),
          G('semi_absorb'), G('semi_decay_low'), G('semi_decay_high'), G('semi_qfl'), G('semi_photocond'), G('semi_steady'),
        ],
      },
      {
        id: 'e1-quiz', title: 'Concept quiz', kind: 'quiz',
        steps: [
          R(md`Random multiple-choice questions from all twelve topics (the check questions plus extra ones that live only here), options shuffled, no repeats until the pool runs out. Each card links back to its lesson.

### Everything on Exam 1`),
          G('concept', { need: 15, units: E1 }),
          R(md`### Ch. 1 and 3: crystals, bands, carriers, drift`),
          G('concept', { need: 8, units: ['ch1', 'ch3'] }),
          R(md`### Ch. 4: light, recombination, diffusion`),
          G('concept', { need: 8, units: ['ch4'] }),
        ],
      },
    ],
  });
})();

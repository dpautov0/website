/* "Every equation, explained": for each Exam 1 equation, where it comes from (the intuition), how it behaves, and what
   to watch for. Added to the Exam 1 practice unit after the formula sheet. */
(function () {
  'use strict';
  const { R } = C;
  const unit = COURSE.units.find((u) => u.id === 'e1-x');
  if (!unit) return;
  const E = (title, eq, from, beh, watch) => md`
    #### ${title}

    $$${eq}$$
    - **Where it comes from:** ${from}
    - **How it behaves:** ${beh}
    - **Watch out:** ${watch}
  `;
  const at = unit.lessons.findIndex((l) => l.id === 'e1-sheet') + 1;
  unit.lessons.splice(at, 0, {
    id: 'e1-eqs', title: 'Every equation, explained', kind: 'read',
    steps: [
      R(md`
        Every equation you need for Exam 1, in the order of the topics. For each one: where it comes from in a sentence or two, how it behaves (what goes up when what goes up), and the traps. If you know these three things for an equation, you can rebuild it on the exam even if you blank on the formula.

        ### Units and numbers to be fluent in

        | | |
        |---|---|
        | $1\,\text{eV} = 1.6\times10^{-19}$ J | $hc = 1.24\,\text{eV·}\mu\text{m} = 1240\,\text{eV·nm}$ |
        | $kT = 8.62\times10^{-5}\,T$ eV | 300 K: 0.0259 eV; 120 K: 0.0103; 77 K (liquid N₂): 0.0066; 4 K (liquid He): 0.00034 |
        | $1\,\text{Å} = 10^{-8}$ cm $= 0.1$ nm | $1\,\mu\text{m} = 10^{-4}$ cm; $1\,\text{nm} = 10^{-7}$ cm |
        | concentrations in cm⁻³ | $\mu$ in cm²/V·s, $D$ in cm²/s, $\sigma$ in $(\Omega\,\text{cm})^{-1}$, $J$ in A/cm² |
        | $kT\ln10 = 0.0596$ eV at 300 K | one decade of concentration per 60 meV |
      `),
      R(E('Photon energy and wavelength', 'E = h\\nu = \\frac{hc}{\\lambda} \\qquad \\lambda[\\mu\\text{m}] = \\frac{1.24}{E[\\text{eV}]}',
        'light comes in quanta of energy $h\\nu$; $c = \\lambda\\nu$ turns frequency into wavelength.',
        'shorter wavelength, more energy: 0.4 μm (violet) is 3.1 eV, 1.24 μm is 1 eV.',
        'keep eV and μm together (1.24), or J and m together ($hc = 1.99\\times10^{-25}$ J·m).')),
      R(E('Momentum and kinetic energy', 'p = \\frac{h}{\\lambda} = \\hbar k \\qquad E_K = \\frac{p^2}{2m^*} = \\frac{\\hbar^2k^2}{2m^*}',
        'de Broglie: a particle of momentum $p$ is a wave of wavelength $h/p$; in a crystal the band shape sets the relation through $m^*$.',
        'kinetic energy grows as $k^2$; at the same $k$, a lighter carrier has more energy. Same momentum: $E_{K,e}/E_{K,h} = m_h^*/m_e^*$.',
        '$E_K$ is measured from the band edge, not from zero.')),
      R(E('Effective mass', 'm^* = \\frac{\\hbar^2}{d^2E/dk^2} \\qquad E = Ck^2 \\Rightarrow m^* = \\frac{\\hbar^2}{2C}',
        'a free electron has $E = \\hbar^2k^2/2m$, so its curvature is $\\hbar^2/m$. In a crystal, the curvature of the real band defines the mass that makes $F = m^*a$ work.',
        'sharply curved band → light → high mobility; flat band → heavy. Negative near a band maximum (hence holes).',
        'heavy holes sit in the flatter valence band, light holes in the sharper one.')),
      R(E('Atomic and mass density', 'N = \\frac{\\text{atoms per cell}}{a^3} \\qquad \\rho_m = \\frac{N M}{N_A}',
        'count atoms in one cell (corner ⅛, face ½, edge ¼, inside 1), divide by its volume; each atom weighs $M/N_A$ grams.',
        '$N \\propto 1/a^3$; denser for heavier atoms at the same $a$.',
        'Å → cm ($10^{-8}$); for compounds use the average mass of the atoms in the cell.')),
      R(E('Fermi–Dirac distribution', 'f(E) = \\frac{1}{1 + e^{(E - E_F)/kT}} \\;\\approx\\; e^{-(E - E_F)/kT}\\ \\ (E - E_F \\gtrsim 3kT)',
        'Pauli exclusion (at most one electron per state) combined with the Boltzmann chance $e^{-\\Delta E/kT}$ of borrowing energy from the lattice.',
        '½ at $E_F$; full well below, empty well above; the transition is a few $kT$ wide and widens with $T$. Symmetric: $f(E_F + \\Delta) = 1 - f(E_F - \\Delta)$.',
        '$1 - f$ is the probability a state is empty (a hole). At 0 K it is a step.')),
      R(E('Carriers from states × occupancy', 'n_0 = \\int_{E_c}^{\\infty} N(E)f(E)\\,dE \\qquad N(E) \\propto (E - E_c)^{1/2}',
        'count states per energy (more room higher in the band), multiply by the chance each is full, add up.',
        'because $f$ falls exponentially, nearly all electrons sit within a few $kT$ of $E_c$; the product peaks at $E_c + kT/2$.',
        'the integral collapses to $N_ce^{-(E_c - E_F)/kT}$ only when $E_F$ is well below $E_c$.')),
      R(E('Concentrations from the band edges', 'n_0 = N_ce^{-(E_c - E_F)/kT} \\qquad p_0 = N_ve^{-(E_F - E_v)/kT} \\qquad N_c = 2\\left(\\frac{2\\pi m_n^*kT}{h^2}\\right)^{3/2}',
        'the Boltzmann tail of $f$ evaluated at the band edge, with all the band\'s states lumped into an effective $N_c$ there.',
        '60 meV closer to $E_c$ = 10× more electrons. $N_c$, $N_v \\propto (m^*T)^{3/2}$.',
        'valid only for non-degenerate material ($E_F$ at least ~3kT inside the gap).')),
      R(E('Concentrations from the intrinsic level', 'n_0 = n_ie^{(E_F - E_i)/kT} \\qquad p_0 = n_ie^{(E_i - E_F)/kT} \\qquad E_F - E_i = kT\\ln\\frac{n_0}{n_i}',
        'the same formulas, measured from $E_i$, where $n_0 = p_0 = n_i$ (divide one form by the other).',
        'above $E_i$: n-type; below: p-type; a decade per 60 meV at 300 K.',
        'use $kT$ and $n_i$ at the actual temperature; for p-type use $E_i - E_F = kT\\ln(p_0/n_i)$.')),
      R(E('Mass action and the intrinsic concentration', 'n_0p_0 = n_i^2 = N_cN_ve^{-E_g/kT} \\qquad n_i = \\sqrt{N_cN_v}\\,e^{-E_g/2kT}',
        'multiply $n_0$ and $p_0$: $E_F$ cancels. Physically, generation (set by $T$) balances recombination ($\\propto np$).',
        'doping trades $n$ for $p$ with the product fixed; $n_i$ grows explosively with $T$ (doubles every ~9 K in Si) and falls with $E_g$.',
        'only at equilibrium; with light or injection $np > n_i^2$.')),
      R(E('The intrinsic level', 'E_i = \\frac{E_c + E_v}{2} + \\frac{kT}{2}\\ln\\frac{N_v}{N_c}',
        'set $n_0 = p_0$ in the band-edge formulas and solve for $E_F$.',
        'at midgap if $N_c = N_v$; in Si ($N_c > N_v$) about 13 meV below midgap at 300 K, shifting slightly with $T$.',
        'use "midgap" freely; the correction is about 1% of the gap.')),
      R(E('Space-charge neutrality', 'p_0 + N_d^+ = n_0 + N_a^- \\;\\Rightarrow\\; n_0 = \\frac{N_d - N_a}{2} + \\sqrt{\\left(\\frac{N_d - N_a}{2}\\right)^2 + n_i^2}',
        'a uniform sample has no net charge; combine with $n_0p_0 = n_i^2$ to get a quadratic.',
        '$\\approx N_d - N_a$ when that is $\\gg n_i$; $\\approx n_i$ when $n_i$ dominates; in between both count.',
        'take the positive root; compensated material uses the **net** doping.')),
      R(E('Donor binding (hydrogen model)', 'E_{\\text{bind}} \\approx 13.6\\,\\text{eV}\\,\\frac{m^*/m_0}{\\epsilon_r^2} \\qquad r \\approx 0.53\\,\\text{Å}\\,\\frac{\\epsilon_r}{m^*/m_0}',
        'the spare electron orbits the dopant ion like hydrogen\'s electron, but the crystal screens the charge ($\\epsilon_r$) and the electron moves with $m^*$.',
        'tens of meV and a radius of tens of Å: shallow dopants, nearly all ionized at 300 K.',
        '$\\epsilon_r$ enters squared, the mass linearly.')),
      R(E('Drift velocity and mobility', 'v_d = \\mu\\mathscr{E} \\qquad \\mu = \\frac{q\\bar t}{m^*}',
        'momentum balance: the field adds momentum $q\\mathscr{E}$ per second, collisions remove it at $p/\\bar t$; in steady state $p = q\\bar t\\mathscr{E}$.',
        'longer time between collisions or lighter mass → more mobile. Electrons drift against $\\mathscr{E}$, holes with it.',
        'linear only at low fields; saturates near $10^7$ cm/s.')),
      R(E('Current, conductivity, resistance', 'J = q(n\\mu_n + p\\mu_p)\\mathscr{E} = \\sigma\\mathscr{E} \\qquad \\rho = \\frac1\\sigma \\qquad R = \\frac{\\rho L}{A}',
        'charge per volume × average velocity, for each carrier; both carriers give current along $\\mathscr{E}$.',
        'set mainly by doping (orders of magnitude); mobility adds a factor of a few. Longer bar, more $R$; wider, less.',
        'keep the minority term only when it matters; cm everywhere.')),
      R(E('Mobility versus temperature and doping', '\\frac1\\mu = \\frac1{\\mu_L} + \\frac1{\\mu_I} \\qquad \\mu_L \\propto T^{-3/2} \\qquad \\mu_I \\propto \\frac{T^{3/2}}{N_d^+ + N_a^-}',
        'scattering rates add (two independent ways to be interrupted); more vibrations when hot; slow carriers are deflected more by ions.',
        'the smaller mobility wins; light doping: falls with $T$; heavy doping and cold: rises with $T$.',
        '$N_I$ counts **all** ionized dopants, including compensating ones.')),
      R(E('Hall effect', 'p_0 = \\frac{I_xB_z}{qtV_{AB}} \\qquad \\mu_p = \\frac{1}{q\\rho p_0}',
        'the magnetic force $qvB$ on moving carriers is balanced by a transverse field $\\mathscr{E}_y = vB$; with $v = J/qp$ this gives the concentration.',
        'fewer carriers → larger Hall voltage; its sign gives the carrier type.',
        '$B$ in Wb/cm² when lengths are in cm ($1\\,\\text{T} = 10^{-4}\\,\\text{Wb/cm}^2$).')),
      R(E('Equilibrium: flat Fermi level and built-in potential', '\\frac{dE_F}{dx} = 0 \\qquad qV_0 = kT\\ln\\frac{N_aN_d}{n_i^2} \\qquad \\mathscr{E} = \\frac1q\\frac{dE_c}{dx}',
        'electrons flow toward lower $E_F$ until it is flat; the moved charge makes a step equal to the original $E_F$ difference.',
        'larger doping → larger $V_0$, up to about $E_g/q$; the field points toward higher bands.',
        'a voltmeter reads 0 at equilibrium; potential is high where bands are low.')),
      R(E('Absorption', 'I(x) = I_0e^{-\\alpha x} \\qquad \\text{absorbed in } d: 1 - e^{-\\alpha d} \\qquad \\dot N = \\frac{P}{h\\nu}',
        'each slice absorbs the same fraction of what reaches it.',
        '$1/\\alpha$ is the depth to 37%; $\\alpha$ is zero below $E_g$ and rises steeply above.',
        'subtract reflection first; $h\\nu$ in joules for photon counts; one pair per absorbed photon.')),
      R(E('Recombination of excess carriers', '\\frac{d\\,\\delta n}{dt} = -\\alpha_r(n_0 + p_0)\\delta n - \\alpha_r\\delta n^2 \\qquad \\tau = \\frac{1}{\\alpha_r(n_0 + p_0)}',
        'net rate $= \\alpha_r(np - n_i^2)$ with $n = n_0 + \\delta n$, $p = p_0 + \\delta n$.',
        'low level: exponential, $\\delta n = \\Delta ne^{-t/\\tau}$; high level: $\\Delta n/(1 + \\alpha_r\\Delta n\\,t)$. More majority carriers → shorter minority lifetime.',
        'check $\\delta n \\ll n_0 + p_0$ before using the exponential.')),
      R(E('Steady state and quasi-Fermi levels', '\\delta n = g_{op}\\tau_n \\qquad n = n_ie^{(F_n - E_i)/kT} \\qquad p = n_ie^{(E_i - F_p)/kT} \\qquad np = n_i^2e^{(F_n - F_p)/kT}',
        'generation balances recombination; each carrier population is in equilibrium with itself (fast) though not with the other (slow).',
        'low level: majority level barely moves, minority level moves a lot; the split measures how far from equilibrium.',
        'use the **total** $n$ and $p$; recompute $kT$ and $n_i$ at the actual temperature.')),
      R(E('Photoconductivity', '\\Delta\\sigma = q(\\delta n\\,\\mu_n + \\delta p\\,\\mu_p) = qg_{op}(\\tau_n\\mu_n + \\tau_p\\mu_p)',
        'extra carriers add conductivity in proportion to their mobility.',
        'linear in light at low level; longer lifetime gives more signal but a slower response.',
        'both excess carriers count.')),
      R(E('Diffusion flux and coefficient', '\\phi_n = -D_n\\frac{dn}{dx} \\qquad D = \\frac{\\ell^2}{2\\bar t}',
        'random motion carries more carriers out of a crowded region than into it: the net flow is proportional to the gradient.',
        'steeper gradient, bigger flow; spread grows as $\\sqrt{Dt}$.',
        'flux in carriers/cm²·s; multiply by $\\mp q$ for current.')),
      R(E('Total current: drift plus diffusion', 'J_n = q\\mu_nn\\mathscr{E} + qD_n\\frac{dn}{dx} \\qquad J_p = q\\mu_pp\\mathscr{E} - qD_p\\frac{dp}{dx}',
        'add the two ways a carrier moves; the diffusion signs differ because the charges differ.',
        'electron diffusion current points up the electron gradient; hole diffusion current down the hole gradient.',
        'the drift terms have the same sign for both carriers.')),
      R(E('Einstein relation', '\\frac{D}{\\mu} = \\frac{kT}{q}',
        'in equilibrium with a field, carriers must follow the Boltzmann distribution, which forces this ratio; both $D$ and $\\mu$ come from the same random flights.',
        '$D \\approx \\mu/40$ at 300 K; $D \\propto T$ at fixed $\\mu$.',
        'use the temperature of the problem.')),
      R(E('Built-in field in graded doping', '\\mathscr{E} = -\\frac{kT}{q}\\frac1n\\frac{dn}{dx} = +\\frac{kT}{q}\\frac1p\\frac{dp}{dx} \\qquad N \\propto e^{-x/L}: |\\mathscr{E}| = \\frac{kT}{qL}',
        'set $J_n = 0$: the field must cancel diffusion.',
        'depends on the logarithmic slope of the doping, not its size: 259 V/cm for $L = 1\\,\\mu$m.',
        'n-type: field points toward lower doping; p-type: toward higher.')),
      R(E('Current from a quasi-Fermi level', 'J_n = \\mu_nn\\frac{dF_n}{dx} \\qquad J_p = \\mu_pp\\frac{dF_p}{dx}',
        'drift + diffusion with $n = n_ie^{(F_n - E_i)/kT}$ and the Einstein relation combine into one term.',
        'flat quasi-Fermi level → no current from that carrier; at equilibrium both equal a flat $E_F$.',
        'with $F_n$ in eV, write $J_n = q\\mu_nn\\,dF_n/dx$: the $q$ turns eV into joules so $J$ comes out in A/cm².')),
      R(E('Continuity and diffusion equations', '\\frac{\\partial p}{\\partial t} = -\\frac1q\\frac{\\partial J_p}{\\partial x} + g - \\frac{\\delta p}{\\tau_p} \\qquad \\frac{\\partial\\,\\delta p}{\\partial t} = D_p\\frac{\\partial^2\\delta p}{\\partial x^2} - \\frac{\\delta p}{\\tau_p}',
        'bookkeeping for a slice: inflow minus outflow, plus generation, minus recombination.',
        'curvature drives change: peaks fall, dips fill; recombination always pulls the excess toward zero.',
        'the second form assumes no field and no generation.')),
      R(E('Steady-state injection', '\\delta p = \\Delta pe^{-x/L_p} \\qquad L_p = \\sqrt{D_p\\tau_p} \\qquad J_p(x) = \\frac{qD_p\\Delta p}{L_p}e^{-x/L_p}',
        'each slice loses the same fraction; $L$ is how far a carrier random-walks in its lifetime.',
        '37% left at $L$, 5% at $3L$; current largest at the injection point, zero far away (carried by majority carriers instead).',
        'short bar ($W \\ll L$): linear profile, $J = qD\\Delta p/W$.')),
      R(E('Stored charge', 'Q_p = qA\\Delta pL_p \\qquad I_p(0) = \\frac{Q_p}{\\tau_p} = \\frac{qAD_p\\Delta p}{L_p}',
        'the area under the exponential; in steady state the stored carriers recombine at $Q/\\tau$ and must be replaced.',
        'doubling $\\Delta p$ doubles both; a longer lifetime stores more charge for the same current.',
        'consistent with the diffusion current at $x = 0$ because $L_p^2 = D_p\\tau_p$.')),
      R(E('Minimum conductivity', 'n_0 = n_i\\sqrt{\\mu_p/\\mu_n} \\qquad \\sigma_{\\min} = 2qn_i\\sqrt{\\mu_n\\mu_p}',
        'minimize $\\sigma = q(n\\mu_n + n_i^2\\mu_p/n)$ over $n$.',
        'the least conductive sample is slightly p-type in Si (since $\\mu_n > \\mu_p$), not intrinsic.',
        'only meaningful at equilibrium ($np = n_i^2$).')),
    ],
  });
})();

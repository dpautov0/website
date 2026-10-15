/* rapid-b.js — rapid-fire concept drills for Exam 1, topics 5–8 (see rapid-a.js for the helpers). */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri, shuffle } = U;
  const RF = window.RF;
  const { MC, e, p10, pow, one } = RF;

  // a smooth step from 0 (left) to 1 (right) across the middle of a diagram
  const step = (x) => 0.5 * (1 + Math.tanh((x - 0.5) * 9));

  // =========================================================================== Topic 5: temperature, compensation
  const NIT = [[200, '2\\times10^{5}', 1.6e5], [300, '1.5\\times10^{10}', 1.5e10], [400, '5\\times10^{12}', 5.2e12], [500, '2\\times10^{14}', 1.9e14], [600, '2\\times10^{15}', 2.1e15], [700, '10^{16}', 1.3e16]];

  GENS.rf_temp = () => one([
    () => {
      const [T, tex, ni] = pick(NIT), k = ri(14, 17), Nd = Math.pow(10, k);
      const r = ni / Nd;
      const R = r < 0.1 ? 'extrinsic: $n_0 \\approx N_d$' : r > 10 ? 'intrinsic: $n_0 \\approx n_i$, the doping hardly matters' : 'in between: $n_i$ and $N_d$ both count (use the quadratic)';
      const all = ['extrinsic: $n_0 \\approx N_d$', 'intrinsic: $n_0 \\approx n_i$, the doping hardly matters', 'in between: $n_i$ and $N_d$ both count (use the quadratic)', 'frozen out: the donors still hold their electrons'];
      return MC('Which regime?', md`Si doped $N_d = 10^{${k}}\,\text{cm}^{-3}$ is at ${T} K, where $n_i \approx ${tex}\,\text{cm}^{-3}$. The sample is…`, R,
        all.filter((x) => x !== R).map((x) => [x, x.startsWith('frozen') ? `At ${T} K, $kT$ = ${(0.0000862 * T).toFixed(3)} eV, enough to ionize 0.045 eV donors.` : 'Compare $n_i$ with $N_d$: ≪ means extrinsic, ≫ means intrinsic.']),
        md`$n_i/N_d \approx ${S.f(r, 1)}$.`);
    },
    () => {
      const dT = pick([9, 18, 27, 36]), f = Math.pow(2, dT / 9);
      return MC('How fast n_i grows', md`Near room temperature, Si's $n_i$ doubles about every 9 K. The temperature rises ${dT} K. $n_i$ grows by about…`, `×${f}`,
        [[`×${(1 + dT / 300).toFixed(2)}`, 'That is linear in $T$; $n_i$ is exponential in $1/T$.'], [`×${2 * dT / 9}`, 'Doublings multiply: 2 × 2 × …'], [`×${f * f}`, `${dT} K is ${dT / 9} doubling${dT > 9 ? 's' : ''}.`]],
        md`${dT / 9} doubling${dT > 9 ? 's' : ''}: $2^{${dT / 9}} = ${f}$.`);
    },
    () => {
      const [what, R, ws] = pick([
        ['n-type Si is heated from the plateau toward the intrinsic region', 'moves down toward $E_i$', [['moves up toward $E_c$', 'More thermal pairs make it more intrinsic, not more n-type.'], ['stays fixed', '$N_c$ and $n_i$ grow with $T$, so the position changes.'], ['crosses below $E_i$', 'It approaches $E_i$ but never crosses in n-type.']]],
        ['p-type Si is heated from the plateau toward the intrinsic region', 'moves up toward $E_i$', [['moves down toward $E_v$', 'Heating makes it more intrinsic.'], ['stays fixed', 'It moves toward $E_i$.'], ['jumps above $E_i$', 'It never crosses in p-type.']]],
        ['n-type Si is cooled into freeze-out', 'moves up, toward $E_d$', [['moves down toward $E_i$', 'Cooling makes the material more extrinsic, not less.'], ['stays where it was at 300 K', 'Cooling shifts the balance between band and donors, so it moves.'], ['moves into the valence band', 'Wrong direction.']]],
      ]);
      return MC('E_F with temperature', md`${what}. Its Fermi level…`, R, ws, md`Hot: everything heads to $E_i$ (intrinsic). Cold n-type: electrons sit on donors, so $E_F$ sits near $E_d$.`);
    },
    () => {
      const [a, b] = pick([[250, 350], [200, 400], [150, 300]]);
      return MC('The plateau', md`Si with $N_d = 10^{16}\,\text{cm}^{-3}$ goes from ${a} K to ${b} K. $n_0$ changes by about…`, 'almost nothing: still $\\approx N_d$',
        [['×1000', 'That is what $n_i$ might do; here $n_i \\ll N_d$ throughout.'], ['×2', 'The donors were already all ionized.'], ['÷2', 'Nothing removes electrons here.']],
        md`All donors are ionized and $n_i \ll 10^{16}$ in this range: the extrinsic plateau.`);
    },
    () => {
      const [a, b] = pick([['Ge', 'Si'], ['Si', 'GaAs'], ['Si', 'SiC'], ['Ge', 'GaAs']]);
      return MC('Who goes intrinsic first?', md`Same doping, heated together: which reaches the intrinsic region at a **lower** temperature, ${a} or ${b}?`, a,
        [[b, 'The larger gap holds out longer.'], ['both at once', '$n_i$ depends exponentially on $E_g$.'], ['neither ever does', 'Every semiconductor does when hot enough.']],
        md`Smaller gap, larger $n_i$ at every temperature: Ge 0.67 < Si 1.12 < GaAs 1.43 < SiC 3.3 eV.`);
    },
    () => MC('Freeze-out', md`At 20 K, n-type Si barely conducts. Why?`, 'freeze-out: donors keep their electrons',
      [['the mobility drops to zero when cold', 'Mobility is fine; there are just few free carriers.'], ['the band gap closes up when cold', 'The gap gets slightly larger when cold.'], ['the donors turn into acceptors', 'A dopant’s type doesn’t change with temperature.']],
      md`Freeze-out: thermal energy can't ionize even shallow donors.`),
  ]);

  GENS.rf_comp = () => one([
    () => {
      const [Nd, Na] = pick([[5, 2], [3, 1], [8, 6], [2, 5], [1, 4], [6, 9], [4, 4]]);
      const k = ri(15, 17), diff = Nd - Na;
      const T = (m) => p10(m, k);
      const R = diff > 0 ? `n-type, $n_0 \\approx ${T(diff)}$` : diff < 0 ? `p-type, $p_0 \\approx ${T(-diff)}$` : 'compensated ($n_0 \\approx n_i$)';
      return MC('Who wins?', md`Si has $N_d = ${T(Nd)}$ and $N_a = ${T(Na)}\,\text{cm}^{-3}$ (all ionized, 300 K). The sample is…`, R,
        [[`n-type, $n_0 \\approx ${T(Nd + Na)}$`, 'Acceptors take donor electrons; they don’t add to them.'], [`${diff >= 0 ? 'n-type' : 'p-type'}, $${diff >= 0 ? 'n_0' : 'p_0'} \\approx ${T(Math.max(Nd, Na))}$`, 'Subtract the other dopant: each acceptor swallows one donor electron.'], [diff > 0 ? `p-type, $p_0 \\approx ${T(diff)}$` : `n-type, $n_0 \\approx ${T(Math.abs(diff) || 1)}$`, 'The larger dopant sets the type.'], ['compensated: $n_0 \\approx p_0 \\approx n_i$', 'Only when $N_d = N_a$.']],
        md`Net doping $|N_d - N_a| = ${diff === 0 ? '0' : T(Math.abs(diff))}$.`);
    },
    () => MC('Compensation and mobility', md`Sample A: $N_d = 2\times10^{16}$, $N_a = 10^{16}$. Sample B: $N_d = 10^{16}$ only. Both have $n_0 = 10^{16}$. Which has the higher electron mobility?`, 'B: A has 3× the ionized impurities',
      [['A', 'Compensation adds scattering ions without adding carriers.'], ['equal: same $n_0$', 'Mobility depends on all charged impurities, $N_d^+ + N_a^-$.'], ['A, because acceptors cancel donors’ scattering', 'Both kinds of ion scatter.']],
      md`$N_I = 3\times10^{16}$ for A, $10^{16}$ for B.`),
    () => {
      const m = pick([9, 99]);
      const f = m === 9 ? 10 : 100, dE = m === 9 ? '0.06' : '0.12';
      return MC('Adding acceptors to n-type', md`n-type Si with $N_d = 10^{16}$ gets $N_a = ${m === 9 ? '9\\times10^{15}' : '9.9\\times10^{15}'}$ added. $n_0$ and $E_F$…`, `$n_0$ ÷${f}; $E_F$ drops about ${dE} eV`,
        [[`$n_0$ ÷${f}; $E_F$ unchanged`, 'Fewer electrons means $E_F$ moves away from $E_c$.'], [`$n_0$ ×${f}; $E_F$ rises`, 'Acceptors remove electrons.'], [`$n_0$ ÷${f}; $E_F$ drops about ${(+dE * 2).toFixed(2)} eV`, 'One decade per 0.06 eV.']],
        md`$n_0 = N_d - N_a = ${m === 9 ? '10^{15}' : '10^{14}'}$: ${m === 9 ? 'one decade' : 'two decades'} down.`);
    },
    () => MC('Counting scatterers', md`$N_d = 3\times10^{16}$, $N_a = 10^{16}$. How many ionized impurities per cm³ scatter the carriers?`, '$4\\times10^{16}$',
      [['$2\\times10^{16}$', 'That is the net doping (the carriers). Both ions scatter.'], ['$3\\times10^{16}$', 'The acceptor ions scatter too.'], ['$10^{16}$', 'No.']],
      md`$N_I = N_d^+ + N_a^-$.`),
    () => {
      const k = ri(14, 17);
      return MC('E_F in compensated material', md`Compensated Si has net $N_d - N_a = 10^{${k}}\,\text{cm}^{-3}$. Its $E_F$ sits about…`, `${e((k - Math.log10(1.5e10)) * RF.D)} eV above $E_i$`,
        [[`${e((k + 0.3 - Math.log10(1.5e10)) * RF.D + 0.06)} eV above $E_i$`, 'Use the net doping, not the total.'], [`${e((k - Math.log10(1.5e10)) * RF.D)} eV below $E_i$`, 'Net donors: n-type.'], ['at $E_i$', 'Only if fully compensated.']],
        md`Same as uncompensated Si with $N_d = 10^{${k}}$: carriers follow the **net** doping.`);
    },
  ]);

  // =========================================================================== Topic 6: drift
  GENS.rf_drift = () => one([
    () => {
      const down = Math.random() < 0.5;          // bands slope down to the right
      const s = down ? -0.35 : 0.35;
      const fig = BD.diagram({ w: 220, h: 110, Ec: (x) => 1.12 + s * x, Ev: (x) => s * x, axis: false });
      const [ed, hd, fd] = down ? ['right', 'left', 'left'] : ['left', 'right', 'right'];
      const ask = pick(['e', 'h', 'f']);
      const R = { e: `electrons drift ${ed}`, h: `holes drift ${hd}`, f: `the field points ${fd}` }[ask];
      const W = { e: [[`electrons drift ${hd}`, 'Electrons roll downhill on $E_c$.'], ['electrons don’t move: no $E_F$ is drawn', 'A sloped $E_c$ is a field; it pushes electrons.']], h: [[`holes drift ${ed}`, 'Holes float uphill on $E_v$, like bubbles.'], ['holes don’t move', 'The slope pushes holes too.']], f: [[`the field points ${ed}`, 'The field points the way $E_c$ rises: $\\mathscr{E} = \\tfrac1q\\,dE_c/dx$.'], ['there is no field', 'Sloped bands mean a field.']] }[ask];
      return MC('Read the slope', md`The bands in a biased bar slope as shown (energy up). Which is true?`, R,
        W.concat([[`current flows ${ed}`, 'Current flows along the field, opposite to electron motion.']]),
        md`$E_c$ ${down ? 'falls' : 'rises'} to the right: the field points ${fd} (toward higher $E_c$); electrons roll ${ed} (downhill), holes float ${hd}; the current flows ${fd}.`, fig);
    },
    () => {
      const d = pick(['left', 'right']), o = d === 'left' ? 'right' : 'left';
      return MC('Electron motion and current', md`Electrons in a wire drift to the **${d}**. The current flows…`, `to the ${o}`,
        [[`to the ${d}`, 'Electrons are negative: current runs opposite to their motion.'], ['nowhere: electrons don’t carry current', 'They carry charge $-q$.'], ['in both directions', 'One direction.']],
        md`Conventional current = flow of positive charge; negative charge moving ${d} is current to the ${o}.`);
    },
    () => {
      const d = pick(['left', 'right']), o = d === 'left' ? 'right' : 'left';
      return MC('From terminals to field', md`A bar has its **+** terminal on the ${d} end. Inside, the field points ___, electrons drift ___ and holes drift ___.`, `${o}; ${d}; ${o}`,
        [[`${d}; ${o}; ${d}`, 'The field points from + to −.'], [`${o}; ${o}; ${o}`, 'Electrons drift against the field.'], [`${o}; ${d}; ${d}`, 'Holes drift with the field.']],
        md`$\mathscr{E}$ from + to −; electrons toward +, holes toward −; current from + to − through the bar.`);
    },
    () => MC('Adding currents', md`In a lightly doped bar, electrons drift left and holes drift right. Their contributions to the current…`, 'add: both point right',
      [['cancel partly', 'Opposite motion, opposite charge: the same current direction.'], ['add: both point left', 'Holes moving right carry current to the right.'], ['cancel exactly', 'Only if both carried no current.']],
      md`$J = q(n\mu_n + p\mu_p)\mathscr{E}$, both terms positive.`),
  ]);

  GENS.rf_ohm = () => one([
    () => {
      const [a, b] = [pick([2, 3, 0.5]), pick([2, 4, 0.5])];
      const r = a / b, fmt = (x) => (x >= 1 ? `×${+x.toFixed(2)}` : `÷${+(1 / x).toFixed(2)}`);
      if (r === 1) return GENS.rf_ohm();
      return MC('Resistance and shape', md`A bar's length is multiplied by ${a} and its cross-section by ${b}. Its resistance…`, fmt(r),
        [[fmt(a * b), '$R = \\rho L/A$: length up raises $R$, area up lowers it.'], [fmt(b / a), 'Inverted.'], ['is unchanged', 'Geometry changes $R$; only $\\rho$ is a material property.']],
        md`$R = \rho L/A$: ×${a} ÷ ${b}.`);
    },
    () => {
      const m = pick([10, 100]);
      return MC('Doping and resistivity', md`The doping of an n-type bar is raised ${m}× (still moderate doping). Its resistivity…`, `drops a bit less than ${m}×`,
        [[`rises ${m}× (more scattering)`, 'More carriers, lower resistivity.'], [`drops ${m * m}× (n and μ both)`, '$\\rho = 1/(qn\\mu)$ is linear in $n$.'], ['is unchanged (μ compensates)', 'Carriers changed a lot.']],
        md`$\rho = 1/(qN_d\mu_n)$; $\mu_n$ falls slowly with doping.`);
    },
    () => {
      const mu = pick([500, 1000, 1350, 2000]), E = pick([10, 100, 1000]);
      const v = mu * E;
      return MC('Drift velocity', md`$\mu = ${mu}\,\text{cm}^2/\text{V·s}$ and $\mathscr{E} = ${E}$ V/cm. The drift velocity is…`, `$${S.p(v)}$ cm/s`,
        [[`$${S.p(v * 10)}$ cm/s`, '$v_d = \\mu\\mathscr{E}$: multiply carefully.'], [`$${S.p(v / 10)}$ cm/s`, 'Off by ten.'], [`$${S.f(mu / E, 2)}$ cm/s`, 'Multiply, don’t divide.']],
        md`$v_d = \mu\mathscr{E} = ${mu}\times${E} = ${S.p(v)}$ cm/s, far below $v_{th} \approx 10^7$ cm/s.`);
    },
    () => {
      const k = pick([15, 16, 17]), mu = pick([1000, 500]), E = pick([1, 10, 100]);
      const J = 1.6e-19 * Math.pow(10, k) * mu * E;
      return MC('Current density', md`n-type Si: $n = 10^{${k}}\,\text{cm}^{-3}$, $\mu_n = ${mu}$, $\mathscr{E} = ${E}$ V/cm. $J$ is about…`, `$${S.f(J, 2)}$ A/cm²`,
        [[`$${S.f(J * 10, 2)}$ A/cm²`, '$J = qn\\mu\\mathscr{E}$: count the powers of ten.'], [`$${S.f(J / 10, 2)}$ A/cm²`, 'Off by ten.'], [`$${S.f(J / 1.6e-19, 2)}$ A/cm²`, 'Multiply by $q = 1.6\\times10^{-19}$ C.']],
        md`$J = (1.6\times10^{-19})(10^{${k}})(${mu})(${E}) = ${S.f(J, 2)}$ A/cm².`);
    },
    () => MC('n versus p', md`n-type and p-type Si bars, same size and same doping. The n-type bar's resistance is…`, 'about 2.8× lower',
      [['about 2.8× higher', '$\\mu_n > \\mu_p$, so electrons conduct better.'], ['equal', 'Same carrier count, different mobility.'], ['about 10× lower', '$\\mu_n/\\mu_p \\approx 1350/480$.']],
      md`$\sigma \propto \mu$ at equal doping: $1350/480 = 2.8$.`),
    () => {
      const k = pick([2, 3]);
      return MC('Collision time and mobility', md`A purer crystal makes the mean free time ${k}× longer (same $m^*$). Mobility and drift velocity at the same field…`, `both ×${k}`,
        [[`both ×${k * k}`, '$\\mu = q\\bar t/m^*$ is linear in $\\bar t$.'], [`$\\mu$ ×${k}, $v_d$ unchanged`, '$v_d = \\mu\\mathscr{E}$ follows $\\mu$.'], [`both ÷${k}`, 'Longer flights mean more speed gained.']],
        md`$\mu = q\bar t/m^*$ and $v_d = \mu\mathscr{E}$.`);
    },
  ]);

  GENS.rf_scatter = () => one([
    () => {
      const muL = 1500, muI = pick([150, 300, 3000, 15000]);
      const mu = 1 / (1 / muL + 1 / muI), f = (x) => String(Math.round(x));
      return MC('Matthiessen', md`Lattice scattering alone gives $\mu_L = ${muL}$; impurity scattering alone gives $\mu_I = ${muI}$. The mobility is about…`, f(mu),
        [[f(muL + muI), 'Scattering rates add, so inverse mobilities add.'], [f((muL + muI) / 2), 'Not an average: the smaller one dominates.'], [f(Math.max(muL, muI)), 'The larger one is the weaker limit; the smaller dominates.']],
        md`$1/\mu = 1/${muL} + 1/${muI}$ → $\mu \approx ${f(mu)}$: just below the smaller one.`);
    },
    () => {
      const [cond, R, ws] = pick([
        ['Lightly doped Si is heated from 300 K to 400 K', 'decreases: lattice scattering grows', [['increases: impurity scattering fades', 'With few impurities, the lattice dominates.'], ['stays the same', '$\\mu_L \\propto T^{-3/2}$.']]],
        ['Heavily doped Si is warmed from 50 K to 100 K', 'increases: ions deflect fast carriers less', [['decreases: lattice scattering grows', 'At low $T$ and high doping, impurity scattering dominates.'], ['stays the same: doping is fixed', '$\\mu_I \\propto T^{3/2}$.']]],
        ['Doping is raised from $10^{15}$ to $10^{18}$ at 300 K', 'decreases: many more ionized impurities', [['increases: more carriers share the work', 'More ions, more scattering.'], ['stays the same: lattice-limited', 'Impurity scattering grows with $N_I$.']]],
      ]);
      return MC('Mobility trends', md`${cond}. The mobility…`, R, ws.concat([['drops to zero', 'Never.']]), md`$\mu_L \propto T^{-3/2}$, $\mu_I \propto T^{3/2}/N_I$; the smaller one dominates.`);
    },
    () => MC('Saturation', md`The field across a short Si channel rises from $10^3$ to $10^5$ V/cm. The electron velocity rises about…`, 'only ~7×, to about $10^7$ cm/s',
      [['100×, to $1.35\\times10^8$ cm/s', 'Above about $10^4$ V/cm the velocity saturates.'], ['not at all: it is already saturated', 'It rises until it saturates.'], ['1000×, as hot carriers run away', 'Velocity saturates; it doesn’t run away.']],
      md`Optical-phonon emission caps $v$ near $10^7$ cm/s.`),
    () => {
      const pos = Math.random() < 0.5;
      return MC('Hall effect', md`Current flows along $+x$ with $\vec B$ along $+z$; the carriers are pushed to the $-y$ face, which becomes **${pos ? 'positive' : 'negative'}**. The sample is…`, pos ? 'p-type' : 'n-type',
        [[pos ? 'n-type' : 'p-type', 'Both carrier types are pushed to the same face; the sign of the charge there is the carrier sign.'], ['intrinsic', 'Then the Hall voltage would be near zero.'], ['undeterminable', 'The Hall sign tells you directly.']],
        md`$q\vec v\times\vec B$ is the same for holes (moving $+x$) and electrons (moving $-x$): both go to $-y$. A ${pos ? 'positive' : 'negative'} face means ${pos ? 'holes' : 'electrons'}.`);
    },
    () => MC('Why holes are slower', md`In Si, $\mu_n \approx 1350$ but $\mu_p \approx 480\,\text{cm}^2/\text{V·s}$. The main reason is…`, 'holes have a larger effective mass',
      [['holes carry positive charge', 'Charge sign doesn’t set mobility.'], ['there are fewer holes in Si', 'Mobility is per carrier.'], ['holes scatter off every bond', 'Scattering is similar; the mass is the difference.']],
      md`$\mu = q\bar t/m^*$.`),
  ]);

  // =========================================================================== Topic 7: Fermi level at equilibrium
  // a two-region diagram at equilibrium: dL, dR = E_F − E_i on the left and right (eV); E_F flat
  const junction = (dL, dR) => {
    const d = (x) => dL + (dR - dL) * step(x), Ei = (x) => 0.6 - d(x);
    return BD.diagram({ w: 240, h: 130, Ec: (x) => Ei(x) + 0.56, Ev: (x) => Ei(x) - 0.56, Ei, EF: 0.6, axis: false,
      dims: [{ x: 0.06, a: (x) => Ei(x), b: 'EF', tex: `${e(Math.abs(dL))}`, at: 'r' }, { x: 0.94, a: (x) => Ei(x), b: 'EF', tex: `${e(Math.abs(dR))}`, at: 'l' }] });
  };

  GENS.rf_bend = () => {
    let dL = 0.06 * ri(-7, 7), dR = 0.06 * ri(-7, 7);
    if (Math.abs(dL - dR) < 0.2 || !dL || !dR) return GENS.rf_bend();
    const fig = junction(dL, dR);
    const hiL = dL < dR;                      // left bands higher (E_F nearer E_v there)
    const ask = pick(['type', 'field', 'V', 'V0', 'e', 'h', 'n']);
    const side = (l) => (l ? 'left' : 'right');
    const typ = (d) => (d > 0 ? 'n-type' : 'p-type');
    const base = md`Equilibrium band diagram; the numbers are $|E_F - E_i|$ in eV on each side. `;
    const sol = md`$E_F$ is flat. Left: $E_F$ ${dL > 0 ? 'above' : 'below'} $E_i$ (${typ(dL)}); right: ${dR > 0 ? 'above' : 'below'} (${typ(dR)}). Bands are higher on the ${side(hiL)}, so the field points ${side(hiL)} (toward higher $E_c$), the potential is higher on the ${side(!hiL)}, electrons roll to the ${side(!hiL)}, holes float to the ${side(hiL)}. Step $qV_0 = ${e(Math.abs(dL - dR))}$ eV.`;
    if (ask === 'type') return MC('Read the junction', base + md`What are the two sides?`, `left ${typ(dL)}, right ${typ(dR)}`,
      [[`left ${typ(-dL)}, right ${typ(-dR)}`, '$E_F$ above $E_i$ means n-type.'], [`both ${typ(dL)}`, 'Look at each side separately.'], [`both ${typ(-dL)}`, 'Compare $E_F$ with $E_i$ on each side.']], sol, fig);
    if (ask === 'field') return MC('Read the junction', base + md`Which way does the built-in field point?`, `to the ${side(hiL)}`,
      [[`to the ${side(!hiL)}`, 'The field points the way the bands rise: $\\mathscr{E} = \\tfrac1q\\,dE_c/dx$.'], ['nowhere: $E_F$ is flat', 'Flat $E_F$ means no current, not no field.'], ['up', 'Fields here point along $x$.']], sol, fig);
    if (ask === 'V') return MC('Read the junction', base + md`Which side is at the higher electrostatic potential?`, `the ${side(!hiL)}`,
      [[`the ${side(hiL)}`, 'Electron energy is $-qV$: higher bands mean lower potential.'], ['neither', 'The bands step, so the potential does too.'], ['it depends on the current', 'No current flows at equilibrium.']], sol, fig);
    if (ask === 'V0') {
      const v = Math.abs(dL - dR);
      return MC('Read the junction', base + md`What is the built-in step $qV_0$?`, `${e(v)} eV`,
        [[`${e(Math.abs(Math.abs(dL) - Math.abs(dR))) === e(v) ? e(v + 0.12) : e(Math.abs(Math.abs(dL) - Math.abs(dR)))} eV`, 'Take the difference of the signed $E_F - E_i$ values: add the two distances when $E_F$ is on opposite sides of $E_i$, subtract when on the same side.'], ['1.12 eV', 'The step is the difference of $E_F - E_i$ between the sides, not the gap.'], [`${e(v / 2)} eV`, 'Don’t halve it.']], sol, fig);
    }
    if (ask === 'e') return MC('Read the junction', base + md`An electron is released in the middle (the sloped part). It moves to the…`, side(!hiL),
      [[side(hiL), 'Electrons roll downhill on $E_c$.'], ['nowhere: the field is balanced', 'A single released electron feels the field.'], ['up', 'Motion is along $x$.']], sol, fig);
    if (ask === 'h') return MC('Read the junction', base + md`A hole is released in the middle. It moves to the…`, side(hiL),
      [[side(!hiL), 'Holes float uphill on $E_v$, like bubbles.'], ['nowhere', 'The field pushes it.'], ['down', 'Motion is along $x$.']], sol, fig);
    const nL = dL > dR;
    return MC('Read the junction', base + md`Where is the electron concentration higher, and by about how much?`, `the ${side(nL)}, about $${pow(Math.round(Math.abs(dL - dR) / 0.06))}$ times`,
      [[`the ${side(!nL)}`, '$E_c$ is closer to $E_F$ on the other side.'], [`the ${side(nL)}, about $${pow(2 * Math.round(Math.abs(dL - dR) / 0.06))}$ times`, 'One decade per 0.06 eV.'], ['equal on both sides', '$E_F$ is flat but the bands are not.']], sol, fig);
  };

  GENS.rf_contact = () => one([
    () => {
      const m = ri(1, 4), d = e(0.06 * m);
      return MC('Before and after contact', md`Before contact, sample A's $E_F$ is ${d} eV **above** sample B's. After they touch and reach equilibrium…`, `A → B; A ends positive; step ${d} eV`,
        [[`B → A; A ends negative; step ${d} eV`, 'Electrons flow toward the lower $E_F$.'], ['no flow: they are separate materials', 'Contact lets charge flow.'], [`A → B; A ends positive; step ${e(0.12 * m)} eV`, 'The step equals the original $E_F$ difference.']],
        md`Flow stops when $E_F$ is flat; the charge moved sets up a step $qV_0 = ${d}$ eV.`);
    },
    () => {
      const m = ri(1, 4);
      return MC('n⁺ meets n', md`An n-type region with $N_d = 10^{${15 + m}}$ touches one with $N_d = 10^{15}\,\text{cm}^{-3}$. The built-in step $qV_0$ is about…`, `${e(0.06 * m)} eV`,
        [[`${e(0.12 * m)} eV`, 'One decade per 0.06 eV.'], ['0', 'Different doping always gives a step.'], ['1.12 eV', 'Far smaller: both are n-type.']],
        md`$kT\ln(10^{${m}}) = ${m}\times0.06$ eV.`);
    },
    () => {
      const a = ri(15, 18), b = ri(15, 18);
      const v = 0.0259 * Math.log(Math.pow(10, a + b) / 2.25e20);
      return MC('A p–n junction', md`Si p–n junction: $N_a = 10^{${a}}$, $N_d = 10^{${b}}\,\text{cm}^{-3}$. $qV_0$ is about…`, `${e(v)} eV`,
        [[`${e(v + 0.12)} eV`, 'Count the decades: $\\log_{10}(N_aN_d/n_i^2)$, with $n_i^2 = 2.25\\times10^{20}$.'], [`${e(v - 0.12)} eV`, 'Count the decades again.'], [`${e(0.0259 * Math.log(Math.pow(10, a + b) / 1.5e10))} eV`, 'Divide by $n_i^2$, not $n_i$.'], ['1.12 eV', 'Only near degenerate doping on both sides does it approach $E_g$.']],
        md`$\log_{10}(10^{${a + b}}/2.25\times10^{20}) = ${(a + b - 20.35).toFixed(2)}$ decades × 0.0596 = ${e(v)} eV.`);
    },
    () => {
      const [ch, R, W] = pick([
        ['Both sides of a Si p–n junction are doped 10× more heavily.', 'larger, by about 0.12 eV', [['smaller, by about 0.12 eV', 'Heavier doping pushes each $E_F$ toward its band.'], ['unchanged: the ratios cancel', 'Each side moves 0.06 eV.']]],
        ['A Ge junction is made with the same doping as a Si one.', 'smaller in Ge', [['larger in Ge', 'Ge’s larger $n_i$ puts each $E_F$ nearer midgap.'], ['equal', '$n_i$ enters the formula.']]],
        ['Both sides are doped to near degeneracy.', 'close to $E_g/q$, its upper limit', [['far above $E_g/q$, with no limit', 'Each $E_F$ can only reach its band edge.'], ['zero: degenerate means metallic', 'Heavier doping increases it.']]],
      ]);
      return MC('Built-in potential trends', md`${ch} The built-in potential is…`, R, W.concat([['negative', 'The n side is always at higher potential.']]),
        md`$qV_0 = kT\ln(N_aN_d/n_i^2) \le E_g$ roughly.`);
    },
  ]);

  GENS.rf_eq = () => one([
    () => MC('Equilibrium currents', md`In an unbiased p–n junction, the electron **diffusion** current is…`, 'cancelled by the electron drift current',
      [['zero, since there is no bias', 'There is a big gradient, so there is diffusion.'], ['cancelled by the hole diffusion current', 'Each carrier balances separately.'], ['equal to the total current', 'The total is zero.']],
      md`Drift and diffusion cancel separately for each carrier.`),
    () => MC('A tilted Fermi level', md`A band diagram shows $E_F$ sloping across a sample. This means…`, 'a current is flowing',
      [['the doping varies', 'Varying doping bends the bands; $E_F$ stays flat at equilibrium.'], ['nothing special', 'A tilted $E_F$ always drives current.'], ['the temperature varies', 'Not what the slope shows.']],
      md`$J_n = \mu_nn\,dE_F/dx$.`),
    () => MC('A voltmeter on a junction', md`A voltmeter is connected across an unbiased p–n junction in the dark. It reads…`, '0 V',
      [['$V_0$', 'The contact steps around the loop cancel it.'], ['$E_g/q$', 'No.'], ['$kT/q$', 'No.']],
      md`Flat $E_F$ everywhere: no net voltage around a circuit at equilibrium.`),
    () => MC('Bent bands', md`Across a junction the bands bend. The band gap inside the bent region is…`, 'unchanged: all levels shift together',
      [['smaller where the bands bend most', 'The gap is a material property.'], ['larger, due to the built-in field', 'Same material, same gap.'], ['zero at the junction center', 'The gap never closes; it is a material property.']],
      md`$E_c$, $E_i$, $E_v$ all follow $-qV(x)$.`),
    () => {
      const [dir, R] = pick([['higher', 'toward the lower-$E_F$ side'], ['lower', 'toward this side']]);
      return MC('Which way electrons go', md`Before two pieces touch, this piece's $E_F$ is ${dir} than the other's. When they touch, electrons flow…`, dir === 'higher' ? 'out of this piece, toward the other' : 'into this piece, from the other',
        [[dir === 'higher' ? 'into this piece' : 'out of this piece', 'Electrons move toward the lower Fermi level.'], ['nowhere', 'Different $E_F$ means flow.'], ['back and forth with no net flow, forever', 'Only once $E_F$ is equal.']],
        md`Electrons go from fuller states (higher $E_F$) to emptier ones, ${R}, until $E_F$ is flat.`);
    },
  ]);

  // =========================================================================== Topic 8: light
  const MAT = { Si: 1.12, Ge: 0.67, GaAs: 1.43, GaN: 3.4 };
  GENS.rf_photon = () => one([
    () => {
      const [l, E] = pick([[0.31, 4.0], [0.41, 3.02], [0.5, 2.48], [0.62, 2.0], [0.83, 1.49], [1.0, 1.24], [1.3, 0.95], [1.55, 0.8], [2.0, 0.62]]);
      const m = pick(Object.keys(MAT)), abs = E >= MAT[m];
      return MC('Absorbed or not?', md`Light at $\lambda = ${l}\,\mu$m falls on ${m} ($E_g = ${MAT[m]}$ eV). Band-to-band, it is…`, abs ? 'absorbed, making pairs' : 'transmitted: below the gap',
        [[abs ? 'transmitted: below the gap' : 'absorbed, making pairs', `$h\\nu = 1.24/${l} = ${E.toFixed(2)}$ eV; compare with $E_g = ${MAT[m]}$ eV.`], ['absorbed, two pairs per photon', 'One pair per photon.'], ['reflected completely at the surface', 'Some reflection, but not all.']],
        md`$h\nu = 1.24/${l} = ${E.toFixed(2)}$ eV ${abs ? '≥' : '<'} ${MAT[m]} eV.`);
    },
    () => {
      const [E, g] = pick([[2.24, 1.12], [2.8, 1.12], [1.68, 1.12], [2.86, 1.43], [2.0, 1.0]]);
      const fr = (E - g) / E;
      return MC('Where the energy goes', md`A ${E} eV photon is absorbed by a material with $E_g = ${g}$ eV. What fraction of its energy becomes heat through thermalization?`, `${Math.round(fr * 100)}%`,
        [[`${Math.round((1 - fr) * 100)}%`, 'That fraction survives as $E_g$.'], ['0%', 'The excess above the gap is lost to the lattice.'], ['100%', 'About $E_g$ survives until recombination.']],
        md`$(h\nu - E_g)/h\nu = (${E} - ${g})/${E} = ${fr.toFixed(2)}$.`);
    },
    () => {
      const pump = pick(['2.5 eV', '3.0 eV', '1.9 eV']);
      return MC('Emission color', md`GaAs ($E_g = 1.43$ eV) is excited with ${pump} light. It glows at about…`, '1.43 eV (0.87 μm)',
        [[pump, 'Carriers lose the excess before recombining.'], ['a broad range up to the pump energy', 'Emission is near the band edge.'], ['nothing: GaAs can’t emit', 'Direct gap: it emits well.']],
        md`Thermalization (~ps) is far faster than recombination (~ns): emission comes from the band edges.`);
    },
    () => {
      const [P, Pt] = pick([[1e-3, '1 mW'], [1e-6, '1 μW'], [1, '1 W']]);
      const [hv, J] = pick([[1.24, 2e-19], [2.48, 4e-19]]);
      const n = P / J;
      return MC('Counting photons', md`A ${Pt} beam of ${hv} eV photons ($\approx ${S.f(J, 1)}$ J each). Photons per second?`, `$${S.f(n, 1)}$`,
        [[`$${S.f(n * 10, 1)}$`, '$\\dot N = P/h\\nu$: count the powers of ten.'], [`$${S.f(n / 10, 1)}$`, 'Off by ten.'], [`$${S.f(P * J * 1e38, 1)}$`, 'Divide by the photon energy.']],
        md`$${S.f(P, 1)}/${S.f(J, 1)} = ${S.f(n, 1)}$ photons/s.`);
    },
    () => {
      const [l, R, W] = pick([
        ['1.55', 'Ge (0.67 eV)', [['Si (1.12 eV)', '$1.24/1.55 = 0.80$ eV is below Si’s gap.'], ['GaAs (1.43 eV)', 'Also too wide a gap.']]],
        ['0.65', 'Si (1.12 eV)', [['SiC (3.3 eV)', '$1.24/0.65 = 1.9$ eV is below SiC’s gap.'], ['GaN (3.4 eV)', 'Gap too wide.']]],
        ['0.36', 'GaN (3.4 eV)', [['glass (≈9 eV)', 'Far too wide a gap.'], ['diamond (5.5 eV)', '3.4 eV photons are below its gap.']]],
      ]);
      return MC('Pick the detector', md`Which material can detect ${l} μm light by band-to-band absorption?`, R, W.concat([['none of them can', 'One of them has a small enough gap.']]),
        md`Need $E_g \le 1.24/\lambda = ${(1.24 / +l).toFixed(2)}$ eV.`);
    },
  ]);

  GENS.rf_absorb = () => one([
    () => {
      const [ax, t, tex] = pick([[1, 37, '1'], [2, 14, '2'], [3, 5, '3'], [0.69, 50, '\\ln2 \\approx 0.69'], [2.3, 10, '\\ln10 \\approx 2.3'], [4.6, 1, '4.6']]);
      return MC('Exponential decay of light', md`Light enters a slab with $\alpha d = ${tex}$. About what fraction of it gets through (ignoring reflection)?`, `${t}%`,
        [[`${100 - t}%`, 'That is the absorbed fraction.'], [`${Math.max(0, Math.round(100 - 100 * ax / 3))}%`, 'The decay is exponential, not linear.'], [`${Math.round(100 / (1 + ax))}%`, 'Use $e^{-\\alpha d}$.']],
        md`$e^{-${ax}} \approx ${t / 100}$.`);
    },
    () => {
      const a = pick([1e3, 1e4]), d = pick([1, 2.3, 3, 10]);
      const ad = a * d * 1e-4, abs = 1 - Math.exp(-ad);
      if (ad > 4) return GENS.rf_absorb();
      return MC('Absorbed in a layer', md`$\alpha = ${S.p(a)}\,\text{cm}^{-1}$, thickness ${d} μm. Fraction absorbed?`, `${Math.round(abs * 100)}%`,
        [[`${Math.round(Math.exp(-ad) * 100)}%`, 'That is what gets through.'], [`${Math.min(100, Math.round(ad * 100))}%`, 'Exponential, not linear.'], ['100%', 'Never quite all.']],
        md`$\alpha d = ${S.p(a)}\times${d}\times10^{-4} = ${+ad.toFixed(2)}$; absorbed $1 - e^{-${+ad.toFixed(2)}} = ${abs.toFixed(2)}$.`);
    },
    () => {
      const a = pick([1e3, 1e4, 1e5]), [p, f] = pick([[90, 2.3], [99, 4.6], [63, 1]]);
      const d = f / a * 1e4;
      return MC('How thick?', md`To absorb ${p}% of the light with $\alpha = ${S.p(a)}\,\text{cm}^{-1}$, the layer must be about…`, `${S.f(d, 2)} μm`,
        [[`${S.f(d * 10, 2)} μm`, `$d = ${f}/\\alpha$: check the units (1 μm = $10^{-4}$ cm).`], [`${S.f(d / 10, 2)} μm`, 'Off by ten.'], [`${S.f(1e4 / a, 2)} μm`, `That is $1/\\alpha$ (63%); you need $${f}/\\alpha$.`]],
        md`$e^{-\alpha d} = ${(1 - p / 100).toFixed(2)}$ → $\alpha d = ${f}$ → $d = ${S.f(d, 2)}\,\mu$m.`);
    },
    () => {
      const k = pick([2, 4, 10]);
      return MC('Absorption depth', md`At a shorter wavelength, $\alpha$ is ${k}× larger. The absorption depth $1/\alpha$…`, `shrinks ${k}×`,
        [[`grows ${k}×`, 'Larger $\\alpha$ means faster decay.'], ['is unchanged', '$1/\\alpha$ depends on $\\alpha$.'], [`shrinks ${k * k}×`, 'Linear in $1/\\alpha$.']],
        md`Blue light ($\alpha$ large) is absorbed within a fraction of a μm in Si; red penetrates several μm.`);
    },
    () => MC('Below the gap', md`Why is $\alpha$ essentially zero for photons below the band gap?`, 'no states in the gap to land in',
      [['the photons are too fast to catch', 'Speed isn’t the issue.'], ['the material reflects them all', 'Below-gap light passes through: transparent.'], ['the electrons are all bound to donors', 'Valence electrons could absorb; they lack a final state.']],
      md`Band-to-band absorption needs an empty state at $E + h\nu$.`),
  ]);

  Object.assign(RF.topics, {
    't5-temp': [
      { gen: 'rf_temp', title: 'Temperature and the three regions', rule: md`Compare $n_i(T)$ with $N_d$: ≪ extrinsic, ≫ intrinsic; Si's $n_i$ doubles about every 9 K; heating drives $E_F$ to $E_i$.` },
      { gen: 'rf_comp', title: 'Compensation', rule: md`Carriers follow the **net** doping $|N_d - N_a|$; scattering follows the **total** $N_d + N_a$.` },
    ],
    't6-drift': [
      { gen: 'rf_drift', title: 'Directions', rule: md`Field from + to −, uphill in $E_c$; electrons roll down $E_c$, holes float up $E_v$; current always along $\mathscr{E}$.` },
      { gen: 'rf_ohm', title: 'Scaling: σ, ρ, R, v', rule: md`$v_d = \mu\mathscr{E}$; $\sigma = q(n\mu_n + p\mu_p)$; $R = \rho L/A$; $\mu = q\bar t/m^*$.` },
      { gen: 'rf_scatter', title: 'What sets mobility', rule: md`$1/\mu = 1/\mu_L + 1/\mu_I$ (smaller wins); $\mu_L \propto T^{-3/2}$, $\mu_I \propto T^{3/2}/N_I$; saturation near $10^7$ cm/s; Hall sign = carrier sign.` },
    ],
    't7-flatef': [
      { gen: 'rf_bend', title: 'Reading equilibrium band diagrams', rule: md`$E_F$ flat. Field points toward higher bands; potential is higher where bands are lower; electrons roll down, holes float up; $qV_0$ = difference of $E_F - E_i$ across.` },
      { gen: 'rf_contact', title: 'Bringing materials together', rule: md`Electrons flow to the lower $E_F$; the step equals the old $E_F$ difference; $qV_0 = kT\ln(N_aN_d/n_i^2)$, 60 meV per decade.` },
      { gen: 'rf_eq', title: 'What equilibrium means', rule: md`Flat $E_F$ = no net current; drift and diffusion cancel per carrier; bands bend, the gap doesn't.` },
    ],
    't8-optical': [
      { gen: 'rf_photon', title: 'Photons and gaps', rule: md`$h\nu = 1.24/\lambda$; absorbed only if $h\nu \ge E_g$; excess $h\nu - E_g$ becomes heat; emission at $E_g$.` },
      { gen: 'rf_absorb', title: 'How deep the light goes', rule: md`$I = I_0e^{-\alpha x}$: $\alpha x = 1$ → 37%, $\ln2$ → 50%, 2.3 → 10%, 4.6 → 1%.` },
    ],
  });

  Object.assign(RF.why, {
    't5-temp': md`Your phone gets hot, and the electronics in a car engine run at 125 °C. Will the transistors still work? This topic tells you when doping stops mattering (when $n_i$ catches up), and how to handle samples where donors and acceptors fight. Expect a "which regime is this?" question.`,
    't6-drift': md`Every resistor, every wire on a chip, every transistor channel runs on drift. Here you learn what really sets mobility, so you can reason about heating, doping and why GaAs is faster than Si without memorizing anything.`,
    't7-flatef': md`Put two different pieces of semiconductor together and a voltage appears out of nowhere. That is the seed of the p–n junction: the diode, the solar cell, the LED, the transistor. Learn to read these band diagrams now and Exam 2 gets much easier.`,
    't8-optical': md`Cameras, solar panels, fiber-optic receivers: all of them start with a photon making an electron–hole pair. Which colors a material sees, how deep the light gets and where the energy goes are fast, high-yield exam points.`,
  });
})();

/* gens-semi.js — randomized ECE 340 Exam 1 problems. Every generator returns a problem card with new numbers each
   time, hints, and a worked solution in the graded format (governing equation, symbolic solution, substitution with
   units on every quantity, answer to 3 significant figures). Constants come from semi.js and are stated in the problem.

   Equilibrium:  semi_doped, semi_intrinsic, semi_fermi, semi_ef_from_n, semi_n_from_ef, semi_compensated
   Transport:    semi_bar, semi_mob_mc, semi_matthiessen, semi_einstein, semi_graded, semi_drift_diff
   Excess:       semi_absorb, semi_decay_low, semi_decay_high, semi_qfl, semi_photocond, semi_steady
   Warm-ups:     semi_lattice, semi_effmass */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri } = U;
  const f = (x) => S.f(x);            // TeX, 3 significant figures
  const p = (x) => S.p(x);            // TeX, as given in a statement
  const CM3 = '\\,\\text{cm}^{-3}', CMS = '\\,\\tfrac{\\text{cm}^2}{\\text{V·s}}', Q = '1.6\\times10^{-19}\\,\\text{C}';
  const ln = Math.log, exp = Math.exp;
  const kTof = (T) => (T === 300 ? 0.0259 : +(8.62e-5 * T).toPrecision(3));     // the value printed is the value used
  const kTt = (T) => String(kTof(T));
  const mant = () => pick([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]);
  const dec = (lo, hi) => mant() * Math.pow(10, ri(lo, hi));
  const G4 = (eq, sym, sub, ans) => [`**1. Governing equation.** ${eq}`, `**2. Solve symbolically.** ${sym}`, `**3. Substitute, with units.** ${sub}`, `**4. Answer (3 s.f.).** ${ans}`].join('\n\n');
  const T = (o) => Object.assign({ tol: { rel: 0.015 } }, o);

  // a small band diagram showing where E_F sits (energies in eV, measured from Ev)
  const bandFig = (Eg, EF, o = {}) => BD.diagram(Object.assign({ w: 200, h: 120, Ec: Eg, Ev: 0, Ei: Eg / 2, EF, axis: false }, o));

  // ======================================================================== equilibrium
  GENS.semi_doped = () => {
    const m = pick(['Si', 'Si', 'Si', 'GaAs', 'Ge']), M = S.mat[m];
    const donor = Math.random() < 0.5;
    const sp = m === 'GaAs' ? (donor ? pick(['Se', 'Te']) : pick(['Zn', 'Be'])) : (donor ? pick(['P', 'As', 'Sb']) : pick(['B', 'Al', 'Ga']));
    const lo = Math.max(14, Math.ceil(Math.log10(M.ni * 1000)));
    const N = dec(lo, 17);
    const maj = N, min = M.ni * M.ni / N;
    const [mj, mn] = donor ? ['n_0', 'p_0'] : ['p_0', 'n_0'];
    return {
      title: 'Carriers in doped material',
      q: md`${m} at 300 K ($n_i = ${p(M.ni)}${CM3}$) is doped with $${p(N)}${CM3}$ of ${sp}, all ionized. Is it n- or p-type, and what are $n_0$ and $p_0$?`,
      parts: [
        { lbl: 'Type', mc: ['n-type', 'p-type'], a: donor ? 0 : 1, why: donor ? [null, `${sp} is a donor in ${m}.`] : [`${sp} is an acceptor in ${m}.`, null] },
        T({ lbl: 'n_0', ans: donor ? maj : min, unit: 'cm^{-3}' }),
        T({ lbl: 'p_0', ans: donor ? min : maj, unit: 'cm^{-3}' }),
      ],
      hints: [`${donor ? 'Donors (one column right of the host)' : 'Acceptors (one column left of the host)'}: ${donor ? '$n_0 \\approx N_d$' : '$p_0 \\approx N_a$'} because $N \\gg n_i$.`, 'The minority carrier is $n_i^2$ divided by the majority.'],
      sol: G4(
        `$n_0p_0 = n_i^2$, and with $N \\gg n_i$ the majority carrier equals the doping: $${mj} \\approx ${donor ? 'N_d' : 'N_a'}$.`,
        `$${mj} = ${donor ? 'N_d' : 'N_a'}$, $\\;${mn} = \\dfrac{n_i^2}{${donor ? 'N_d' : 'N_a'}}$.`,
        `$$${mn} = \\frac{\\left(${p(M.ni)}${CM3}\\right)^2}{${p(N)}${CM3}}$$`,
        `${donor ? 'n' : 'p'}-type; $${mj} = ${f(maj)}${CM3}$, $${mn} = ${f(min)}${CM3}$.`),
    };
  };

  GENS.semi_intrinsic = () => {
    const v = pick(['NcNv', 'scale', 'scale']);
    if (v === 'NcNv') {
      const m = pick(['Si', 'GaAs', 'Ge']), M = S.mat[m], Tk = pick([300, 300, 350, 400]);
      const s = Math.pow(Tk / 300, 1.5), kT = kTof(Tk);
      const Nc = M.Nc * s, Nv = M.Nv * s, ni = Math.sqrt(Nc * Nv) * exp(-M.Eg / (2 * kT));
      return {
        title: 'Intrinsic concentration from the band parameters',
        q: md`For ${m} at ${Tk} K: $N_c = ${p(+Nc.toPrecision(3))}$, $N_v = ${p(+Nv.toPrecision(3))}${CM3}$, $E_g = ${M.Eg}$ eV (take it constant), $kT = ${kTt(Tk)}$ eV. Find $n_i$.`,
        parts: [T({ lbl: 'n_i', ans: Math.sqrt(+Nc.toPrecision(3) * +Nv.toPrecision(3)) * exp(-M.Eg / (2 * kT)), unit: 'cm^{-3}', tol: { rel: 0.03 } })],
        hints: ['$n_i = \\sqrt{N_cN_v}\\,e^{-E_g/2kT}$. Note the **2** in the exponent.'],
        sol: G4('$n_i^2 = N_cN_ve^{-E_g/kT}$.', '$n_i = \\sqrt{N_cN_v}\\,e^{-E_g/2kT}$.',
          `$$n_i = \\sqrt{\\left(${p(+Nc.toPrecision(3))}${CM3}\\right)\\left(${p(+Nv.toPrecision(3))}${CM3}\\right)}\\exp\\!\\left(-\\frac{${M.Eg}\\,\\text{eV}}{2(${kTt(Tk)}\\,\\text{eV})}\\right)$$`,
          `$n_i = ${f(ni)}${CM3}$.`),
      };
    }
    const m = pick(['Si', 'Si', 'GaAs', 'Ge']), M = S.mat[m];
    const T2 = m === 'Ge' ? pick([250, 350, 400, 450]) : m === 'GaAs' ? pick([400, 500, 600, 700]) : pick([250, 350, 400, 450, 500, 600]);
    const r = Math.pow(T2 / 300, 1.5) * exp(-(M.Eg / (2 * 8.62e-5)) * (1 / T2 - 1 / 300));
    return {
      title: 'Intrinsic concentration at another temperature',
      q: md`${m} has $n_i = ${p(M.ni)}${CM3}$ at 300 K and $E_g = ${M.Eg}$ eV (take it constant). Using $n_i \propto T^{3/2}e^{-E_g/2kT}$ with $k = 8.62\times10^{-5}$ eV/K, find $n_i$ at ${T2} K.`,
      parts: [T({ lbl: md`n_i(${T2}\,\text{K})`, ans: M.ni * r, unit: 'cm^{-3}', tol: { rel: 0.03 } })],
      hints: ['Take the ratio $n_i(T_2)/n_i(300)$ so the constants cancel.', md`$\dfrac{n_i(T_2)}{n_i(T_1)} = \left(\dfrac{T_2}{T_1}\right)^{3/2}\exp\!\left[-\dfrac{E_g}{2k}\left(\dfrac{1}{T_2} - \dfrac{1}{T_1}\right)\right]$`],
      sol: G4('$n_i(T) = C\\,T^{3/2}e^{-E_g/2kT}$.',
        md`$\dfrac{n_i(T_2)}{n_i(T_1)} = \left(\dfrac{T_2}{T_1}\right)^{3/2}\exp\!\left[-\dfrac{E_g}{2k}\left(\dfrac{1}{T_2} - \dfrac{1}{T_1}\right)\right]$`,
        `$$n_i(${T2}) = \\left(${p(M.ni)}${CM3}\\right)\\left(\\frac{${T2}\\,\\text{K}}{300\\,\\text{K}}\\right)^{3/2}\\exp\\!\\left[-\\frac{${M.Eg}\\,\\text{eV}}{2\\left(8.62\\times10^{-5}\\,\\text{eV/K}\\right)}\\left(\\frac{1}{${T2}\\,\\text{K}} - \\frac{1}{300\\,\\text{K}}\\right)\\right] = \\left(${p(M.ni)}${CM3}\\right)(${f(r)})$$`,
        `$n_i(${T2}\\,\\text{K}) = ${f(M.ni * r)}${CM3}$.`),
    };
  };

  GENS.semi_fermi = () => {
    const v = pick(['f', 'f', 'empty', 'inverse', 'edges']);
    const Tk = pick([300, 300, 250, 350, 400]), kT = kTof(Tk);
    if (v === 'inverse') {
      const P = pick([0.1, 0.05, 0.02, 0.01, 0.001]);
      const d = kT * ln(1 / P - 1);
      return {
        title: 'Where the occupancy drops',
        q: md`At ${Tk} K ($kT = ${kTt(Tk)}$ eV), how far above $E_F$ is the energy at which a state has occupation probability ${P}?`,
        parts: [T({ lbl: 'E - E_F', ans: d, unit: 'eV', tol: { abs: 0.001 } })],
        hints: ['Solve $P = 1/(1 + e^{x/kT})$ for $x = E - E_F$.'],
        sol: G4('$f(E) = \\dfrac{1}{1 + e^{(E - E_F)/kT}}$.', '$E - E_F = kT\\ln\\left(\\dfrac1f - 1\\right)$.',
          `$$E - E_F = (${kTt(Tk)}\\,\\text{eV})\\ln\\left(\\frac{1}{${P}} - 1\\right) = (${kTt(Tk)}\\,\\text{eV})\\ln(${+(1 / P - 1).toPrecision(4)})$$`,
          `$E - E_F = ${f(d)}$ eV.`),
      };
    }
    if (v === 'edges') {
      const m = pick(['Si', 'GaAs']), Eg = S.mat[m].Eg, d = +(U.rand(0.1, Eg - 0.1)).toFixed(2);
      const fc = 1 / (1 + exp(d / kT)), ev = 1 / (1 + exp((Eg - d) / kT));
      return {
        title: 'Occupancy at the band edges',
        q: md`In ${m} ($E_g = ${Eg}$ eV) at ${Tk} K ($kT = ${kTt(Tk)}$ eV), $E_F$ is $${d}$ eV below $E_c$. Find the probability that a state at $E_c$ is **occupied** and that a state at $E_v$ is **empty**.`,
        figHtml: bandFig(Eg, Eg - d, { dims: [{ x: 0.2, a: 'Ec', b: 'EF', tex: `${d}\\,\\text{eV}`, at: 'r' }] }),
        parts: [T({ lbl: md`f(E_c)`, ans: fc, tol: { rel: 0.02 } }), T({ lbl: md`1 - f(E_v)`, ans: ev, tol: { rel: 0.02 } })],
        hints: ['At $E_c$: $E - E_F = +' + d + '$ eV. At $E_v$: $E - E_F = -(' + Eg + ' - ' + d + ')$ eV.', 'Empty at $E_v$: $1 - f(E_v) = 1/(1 + e^{(E_F - E_v)/kT})$.'],
        sol: G4('$f(E) = \\dfrac{1}{1 + e^{(E - E_F)/kT}}$, probability empty $= 1 - f$.',
          '$f(E_c) = \\dfrac{1}{1 + e^{(E_c - E_F)/kT}}$, $\\;1 - f(E_v) = \\dfrac{1}{1 + e^{(E_F - E_v)/kT}}$ with $E_F - E_v = E_g - (E_c - E_F)$.',
          `$$f(E_c) = \\frac{1}{1 + \\exp\\left(\\frac{${d}\\,\\text{eV}}{${kTt(Tk)}\\,\\text{eV}}\\right)}, \\qquad 1 - f(E_v) = \\frac{1}{1 + \\exp\\left(\\frac{${+(Eg - d).toFixed(2)}\\,\\text{eV}}{${kTt(Tk)}\\,\\text{eV}}\\right)}$$`,
          `$f(E_c) = ${f(fc)}$, $1 - f(E_v) = ${f(ev)}$.`),
      };
    }
    const d = +(U.rand(0.02, 0.3) * (v === 'empty' ? -1 : pick([1, 1, -1]))).toFixed(3);
    const fv = 1 / (1 + exp(d / kT));
    const askEmpty = v === 'empty';
    const ans = askEmpty ? 1 - fv : fv;
    return {
      title: askEmpty ? 'Probability a state is empty' : 'Occupation probability',
      q: md`At ${Tk} K ($kT = ${kTt(Tk)}$ eV), a state lies $${Math.abs(d)}$ eV ${d > 0 ? 'above' : 'below'} the Fermi level. What is the probability that it is ${askEmpty ? '**empty**' : 'occupied'}?`,
      parts: [T({ lbl: askEmpty ? '1 - f(E)' : 'f(E)', ans, tol: { rel: 0.02 } })],
      hints: [`$E - E_F = ${d}$ eV.${askEmpty ? ' Empty means $1 - f$.' : ''}`],
      sol: G4(`$f(E) = \\dfrac{1}{1 + e^{(E - E_F)/kT}}$${askEmpty ? ', empty: $1 - f(E)$' : ''}.`,
        askEmpty ? '$1 - f(E) = \\dfrac{1}{1 + e^{(E_F - E)/kT}}$.' : '$f$ at $E - E_F$ as given.',
        `$$${askEmpty ? '1 - f' : 'f'} = \\frac{1}{1 + \\exp\\left(\\frac{${askEmpty ? -d : d}\\,\\text{eV}}{${kTt(Tk)}\\,\\text{eV}}\\right)} = \\frac{1}{1 + e^{${f((askEmpty ? -d : d) / kT)}}}$$`,
        `${askEmpty ? '$1 - f$' : '$f$'} $= ${f(ans)}$.`),
    };
  };

  GENS.semi_ef_from_n = () => {
    const v = pick(['Ei', 'Ei', 'Nc']);
    const m = pick(['Si', 'Si', 'GaAs']), M = S.mat[m];
    const donor = Math.random() < 0.5;
    const N = dec(14, 18);
    if (v === 'Nc') {
      const Nb = donor ? M.Nc : M.Nv, d = 0.0259 * ln(Nb / N);
      if (d < 0.08) return GENS.semi_ef_from_n();      // degenerate: Boltzmann not valid
      return {
        title: donor ? 'Fermi level below the conduction band' : 'Fermi level above the valence band',
        q: md`${m} at 300 K ($kT = 0.0259$ eV, $${donor ? 'N_c' : 'N_v'} = ${p(Nb)}${CM3}$) is doped ${donor ? 'n' : 'p'}-type with $${donor ? 'n_0' : 'p_0'} = ${p(N)}${CM3}$. Find $${donor ? 'E_c - E_F' : 'E_F - E_v'}$.`,
        parts: [T({ lbl: donor ? 'E_c - E_F' : 'E_F - E_v', ans: d, unit: 'eV', tol: { abs: 0.002 } })],
        hints: [donor ? '$n_0 = N_ce^{-(E_c - E_F)/kT}$: solve for the exponent.' : '$p_0 = N_ve^{-(E_F - E_v)/kT}$: solve for the exponent.'],
        sol: G4(donor ? '$n_0 = N_c\\,e^{-(E_c - E_F)/kT}$.' : '$p_0 = N_v\\,e^{-(E_F - E_v)/kT}$.',
          donor ? '$E_c - E_F = kT\\ln\\dfrac{N_c}{n_0}$.' : '$E_F - E_v = kT\\ln\\dfrac{N_v}{p_0}$.',
          `$$${donor ? 'E_c - E_F' : 'E_F - E_v'} = (0.0259\\,\\text{eV})\\ln\\frac{${p(Nb)}${CM3}}{${p(N)}${CM3}} = (0.0259\\,\\text{eV})(${f(ln(Nb / N))})$$`,
          `$${donor ? 'E_c - E_F' : 'E_F - E_v'} = ${f(d)}$ eV.`),
      };
    }
    const lo = Math.max(13, Math.ceil(Math.log10(M.ni * 1000)));
    const Nn = dec(lo, 18), d = 0.0259 * ln(Nn / M.ni) * (donor ? 1 : -1);
    return {
      title: 'Fermi level from the doping',
      q: md`${m} at 300 K ($n_i = ${p(M.ni)}${CM3}$, $kT = 0.0259$ eV) has ${donor ? `$N_d = ${p(Nn)}${CM3}$` : `$N_a = ${p(Nn)}${CM3}$`}. Find $E_F - E_i$ (positive if $E_F$ is above $E_i$).`,
      figHtml: bandFig(M.Eg, M.Eg / 2 + d, { lab: { EF: 'E_F = ?' } }),
      parts: [T({ lbl: 'E_F - E_i', ans: d, unit: 'eV', tol: { abs: 0.002 } })],
      hints: [donor ? '$n_0 = N_d = n_ie^{(E_F - E_i)/kT}$.' : '$p_0 = N_a = n_ie^{(E_i - E_F)/kT}$, so $E_F - E_i$ is negative.'],
      sol: G4(donor ? '$n_0 = n_i\\,e^{(E_F - E_i)/kT}$ with $n_0 = N_d$.' : '$p_0 = n_i\\,e^{(E_i - E_F)/kT}$ with $p_0 = N_a$.',
        donor ? '$E_F - E_i = kT\\ln\\dfrac{N_d}{n_i}$.' : '$E_F - E_i = -kT\\ln\\dfrac{N_a}{n_i}$.',
        `$$E_F - E_i = ${donor ? '' : '-'}(0.0259\\,\\text{eV})\\ln\\frac{${p(Nn)}${CM3}}{${p(M.ni)}${CM3}} = ${donor ? '' : '-'}(0.0259\\,\\text{eV})(${f(ln(Nn / M.ni))})$$`,
        `$E_F - E_i = ${f(d)}$ eV (${donor ? 'above' : 'below'} $E_i$).`),
    };
  };

  GENS.semi_n_from_ef = () => {
    const v = pick(['Ei', 'Ei', 'Nc']);
    if (v === 'Nc') {
      const m = pick(['Si', 'GaAs']), M = S.mat[m], d = +U.rand(0.12, 0.4).toFixed(2);
      const n0 = M.Nc * exp(-d / 0.0259), p0 = M.Nv * exp(-(M.Eg - d) / 0.0259);
      return {
        title: 'Carriers from the Fermi level (Nc, Nv)',
        q: md`In ${m} at 300 K ($N_c = ${p(M.Nc)}$, $N_v = ${p(M.Nv)}${CM3}$, $E_g = ${M.Eg}$ eV, $kT = 0.0259$ eV), $E_F$ is $${d}$ eV below $E_c$. Find $n_0$ and $p_0$.`,
        figHtml: bandFig(M.Eg, M.Eg - d, { Ei: false, dims: [{ x: 0.2, a: 'Ec', b: 'EF', tex: `${d}\\,\\text{eV}`, at: 'r' }] }),
        parts: [T({ lbl: 'n_0', ans: n0, unit: 'cm^{-3}', tol: { rel: 0.02 } }), T({ lbl: 'p_0', ans: p0, unit: 'cm^{-3}', tol: { rel: 0.03 } })],
        hints: ['$n_0 = N_ce^{-(E_c - E_F)/kT}$, $p_0 = N_ve^{-(E_F - E_v)/kT}$.', `$E_F - E_v = ${M.Eg} - ${d}$ eV.`],
        sol: G4('$n_0 = N_c\\,e^{-(E_c - E_F)/kT}$, $\\;p_0 = N_v\\,e^{-(E_F - E_v)/kT}$.', '$E_F - E_v = E_g - (E_c - E_F)$.',
          `$$n_0 = \\left(${p(M.Nc)}${CM3}\\right)\\exp\\left(-\\frac{${d}\\,\\text{eV}}{0.0259\\,\\text{eV}}\\right), \\qquad p_0 = \\left(${p(M.Nv)}${CM3}\\right)\\exp\\left(-\\frac{${+(M.Eg - d).toFixed(2)}\\,\\text{eV}}{0.0259\\,\\text{eV}}\\right)$$`,
          `$n_0 = ${f(n0)}${CM3}$, $p_0 = ${f(p0)}${CM3}$.`),
      };
    }
    const m = pick(['Si', 'Si', 'GaAs', 'Ge']), M = S.mat[m];
    const d = +(U.rand(0.08, 0.45) * pick([1, -1])).toFixed(2);
    const n0 = M.ni * exp(d / 0.0259), p0 = M.ni * exp(-d / 0.0259);
    return {
      title: 'Carriers from the Fermi level',
      q: md`${m} at 300 K ($n_i = ${p(M.ni)}${CM3}$, $kT = 0.0259$ eV): $E_F$ is $${Math.abs(d)}$ eV ${d > 0 ? 'above' : 'below'} $E_i$. Find $n_0$ and $p_0$.`,
      figHtml: bandFig(M.Eg, M.Eg / 2 + d * (M.Eg / 2 > Math.abs(d) + 0.05 ? 1 : 0.8), { dims: [{ x: 0.2, a: 'EF', b: 'Ei', tex: `${Math.abs(d)}\\,\\text{eV}`, at: 'r' }] }),
      parts: [T({ lbl: 'n_0', ans: n0, unit: 'cm^{-3}', tol: { rel: 0.02 } }), T({ lbl: 'p_0', ans: p0, unit: 'cm^{-3}', tol: { rel: 0.02 } })],
      hints: ['$n_0 = n_ie^{(E_F - E_i)/kT}$, $p_0 = n_ie^{(E_i - E_F)/kT}$.', `Here $E_F - E_i = ${d}$ eV.`],
      sol: G4('$n_0 = n_i\\,e^{(E_F - E_i)/kT}$, $\\;p_0 = n_i\\,e^{(E_i - E_F)/kT}$.', `$E_F - E_i = ${d}$ eV.`,
        `$$n_0 = \\left(${p(M.ni)}${CM3}\\right)e^{(${d}\\,\\text{eV})/(0.0259\\,\\text{eV})}, \\qquad p_0 = \\left(${p(M.ni)}${CM3}\\right)e^{(${-d}\\,\\text{eV})/(0.0259\\,\\text{eV})}$$`,
        `$n_0 = ${f(n0)}${CM3}$, $p_0 = ${f(p0)}${CM3}$ (check: $n_0p_0 = n_i^2$).`),
    };
  };

  GENS.semi_compensated = () => {
    const v = pick(['big', 'Ge', 'Ge', 'hot']);
    let m, ni, Nd, Na, Tk = 300, note = '';
    if (v === 'big') {
      m = 'Si'; ni = 1e10;
      do { Nd = dec(15, 17); Na = dec(15, 17); } while (Math.abs(Nd - Na) < 0.2 * Math.max(Nd, Na));
    } else if (v === 'Ge') {
      m = 'Ge'; ni = 2.5e13;
      do { Nd = mant() * 1e13; Na = mant() * 1e13; } while (Math.abs(Nd - Na) < 0.5e13 || Math.abs(Nd - Na) > 6e13);
    } else {
      m = 'Si'; Tk = pick([450, 500, 550, 600]);
      ni = +(1e10 * Math.pow(Tk / 300, 1.5) * exp(-(1.11 / (2 * 8.62e-5)) * (1 / Tk - 1 / 300))).toPrecision(2);
      do { Nd = dec(Math.floor(Math.log10(ni)) - 1, Math.floor(Math.log10(ni)) + 1); Na = dec(Math.floor(Math.log10(ni)) - 1, Math.floor(Math.log10(ni)) + 1); } while (Math.abs(Nd - Na) < 0.2 * Math.max(Nd, Na));
      note = ' (at this temperature)';
    }
    const n0 = S.n0(Nd, Na, ni), p0 = ni * ni / n0;
    const ntype = Nd > Na, net = Math.abs(Nd - Na);
    const full = net < 30 * ni;
    const mj = ntype ? 'n_0' : 'p_0', mn = ntype ? 'p_0' : 'n_0', D = ntype ? 'N_d - N_a' : 'N_a - N_d';
    return {
      title: 'Compensated sample',
      q: md`${m} at ${Tk} K has $N_d = ${p(Nd)}$ and $N_a = ${p(Na)}${CM3}$, all ionized; $n_i = ${p(ni)}${CM3}$${note}. Find $n_0$ and $p_0$.`,
      parts: [
        { lbl: 'Type', mc: ['n-type', 'p-type'], a: ntype ? 0 : 1, why: ntype ? [null, 'There are more donors than acceptors.'] : ['There are more acceptors than donors.', null] },
        T({ lbl: 'n_0', ans: n0, unit: 'cm^{-3}' }), T({ lbl: 'p_0', ans: p0, unit: 'cm^{-3}' }),
      ],
      hints: ['Space-charge neutrality: $p_0 + N_d = n_0 + N_a$, with $n_0p_0 = n_i^2$.', full ? `$|N_d - N_a| = ${p(net)}$ is **not** much bigger than $n_i$: use the full quadratic.` : `$|N_d - N_a| = ${p(net)} \\gg n_i$, so the majority is just the net doping.`],
      sol: G4('$p_0 + N_d^+ = n_0 + N_a^-$ and $n_0p_0 = n_i^2$.',
        full ? `$$${mj} = \\frac{${D}}{2} + \\sqrt{\\left(\\frac{${D}}{2}\\right)^2 + n_i^2}, \\qquad ${mn} = \\frac{n_i^2}{${mj}}$$` : `$${D} \\gg n_i$: $\\;${mj} \\approx ${D}$, $\\;${mn} = n_i^2/${mj}$.`,
        full ? `$$${mj} = ${p(net / 2)}${CM3} + \\sqrt{\\left(${p(net / 2)}${CM3}\\right)^2 + \\left(${p(ni)}${CM3}\\right)^2}$$ $$${mn} = \\frac{\\left(${p(ni)}${CM3}\\right)^2}{${f(ntype ? n0 : p0)}${CM3}}$$`
          : `$$${mj} = ${p(Math.max(Nd, Na))}${CM3} - ${p(Math.min(Nd, Na))}${CM3}, \\qquad ${mn} = \\frac{\\left(${p(ni)}${CM3}\\right)^2}{${f(net)}${CM3}}$$`,
        `${ntype ? 'n' : 'p'}-type: $n_0 = ${f(n0)}${CM3}$, $p_0 = ${f(p0)}${CM3}$. Check: $p_0 + N_d = ${f(p0 + Nd)}$, $n_0 + N_a = ${f(n0 + Na)}$ ✓.`),
    };
  };

  // ======================================================================== transport
  const MU = { n: [[1e14, 1350], [1e15, 1300], [1e16, 1200], [1e17, 800], [1e18, 300]], p: [[1e14, 480], [1e15, 460], [1e16, 400], [1e17, 250], [1e18, 130]] };
  const muFor = (type, N) => { const t = MU[type]; let best = t[0]; for (const r of t) if (Math.abs(Math.log10(N) - Math.log10(r[0])) < Math.abs(Math.log10(N) - Math.log10(best[0]))) best = r; return best[1]; };

  GENS.semi_bar = () => {
    const intrinsic = Math.random() < 0.12;
    const type = pick(['n', 'p']), N = dec(14, 18), mu = muFor(type, N);
    const L = pick([0.1, 0.2, 0.5, 1, 2, 5]) * 1e-1, w = pick([10, 20, 50, 100, 200, 500]) * 1e-4, t = pick([1, 2, 5, 10, 20, 50]) * 1e-4, V = pick([1, 2, 2.5, 3, 5, 10]);
    const A = w * t;
    const sigma = intrinsic ? S.q * 1e10 * (1350 + 480) : S.q * N * mu;
    const rho = 1 / sigma, R = rho * L / A, I = V / R, J = I / A;
    const desc = intrinsic ? 'intrinsic Si ($n_i = 10^{10}\\,\\text{cm}^{-3}$, $\\mu_n = 1350$, $\\mu_p = 480\\,\\text{cm}^2/\\text{V·s}$)'
      : `${type}-type Si with $${type === 'n' ? 'N_d' : 'N_a'} = ${p(N)}${CM3}$ and $\\mu_${type} = ${mu}\\,\\text{cm}^2/\\text{V·s}$`;
    const Lmm = +(L * 10).toPrecision(3), wum = +(w * 1e4).toPrecision(3), tum = +(t * 1e4).toPrecision(3);
    return {
      title: 'Resistance of a bar',
      q: md`A bar of ${desc} is $${Lmm}$ mm long with a $${wum}\,\mu\text{m}\times${tum}\,\mu\text{m}$ cross-section; $${V}$ V is applied end to end. Find the resistivity, the resistance, the current, and the current density.`,
      figHtml: BD.bar({ L: `${Lmm}\\,\\text{mm}`, A: `${wum}\\times${tum}\\,\\mu\\text{m}^2`, V: `${V}\\,\\text{V}`, label: intrinsic ? '\\text{Si}' : `${type}\\text{-Si}` }),
      parts: [T({ lbl: '\\rho', ans: rho, unit: 'Ω·cm' }), T({ lbl: 'R', ans: R, unit: 'Ω' }), T({ lbl: 'I', ans: I * 1e3, unit: 'mA' }), T({ lbl: 'J', ans: J, unit: 'A/cm^2' })],
      hints: [intrinsic ? '$\\sigma = qn_i(\\mu_n + \\mu_p)$: both carriers count.' : `Majority carriers only: $\\sigma = q${type === 'n' ? 'N_d\\mu_n' : 'N_a\\mu_p'}$.`, 'Convert to cm first: 1 mm = 0.1 cm, 1 μm = $10^{-4}$ cm.', '$R = \\rho L/A$, $I = V/R$, $J = I/A$.'],
      sol: G4(`$\\sigma = q(n\\mu_n + p\\mu_p)$, $\\rho = 1/\\sigma$, $R = \\rho L/A$, $I = V/R$, $J = I/A$.`,
        intrinsic ? '$\\sigma = qn_i(\\mu_n + \\mu_p)$.' : `Minority carriers negligible: $\\sigma = q${type === 'n' ? 'N_d\\mu_n' : 'N_a\\mu_p'}$. $L = ${f(L)}$ cm, $A = (${f(w)}\\,\\text{cm})(${f(t)}\\,\\text{cm}) = ${f(A)}\\,\\text{cm}^2$.`,
        `$$\\sigma = \\left(${Q}\\right)${intrinsic ? '\\left(10^{10}\\,\\text{cm}^{-3}\\right)\\left(1830' + CMS + '\\right)' : `\\left(${p(N)}${CM3}\\right)\\left(${mu}${CMS}\\right)`} = ${f(sigma)}\\,(\\Omega\\cdot\\text{cm})^{-1}$$ $$R = \\frac{(${f(rho)}\\,\\Omega\\cdot\\text{cm})(${f(L)}\\,\\text{cm})}{${f(A)}\\,\\text{cm}^2}, \\quad I = \\frac{${V}\\,\\text{V}}{${f(R)}\\,\\Omega}, \\quad J = \\frac{${f(I)}\\,\\text{A}}{${f(A)}\\,\\text{cm}^2}$$`,
        `$\\rho = ${f(rho)}\\,\\Omega\\cdot\\text{cm}$, $R = ${f(R)}\\,\\Omega$, $I = ${f(I * 1e3)}$ mA, $J = ${f(J)}\\,\\text{A/cm}^2$.`),
    };
  };

  GENS.semi_mob_mc = () => {
    const lo = pick(['10^{14}', '10^{15}']), hi = pick(['10^{18}', '5\\times10^{18}']);
    const S1 = [
      { q: md`Two Si samples at 300 K: A has $N_d = ${lo}$, B has $N_d = ${hi}\,\text{cm}^{-3}$. Which has the higher electron mobility?`, o: ['A', 'B', 'The same', 'Can\'t tell without the temperature dependence'], a: 0, w: [null, 'More ionized donors scatter more: B is lower.', 'Mobility depends on doping through impurity scattering.', 'At fixed $T$, more ionized impurities always lower $\\mu$.'], s: md`Ionized-impurity scattering grows with $N_I$; $\mu_I \propto 1/N_I$.` },
      { q: md`Lightly doped Si ($N_d = ${lo}\,\text{cm}^{-3}$) is heated from 300 K to 400 K. The electron mobility…`, o: ['decreases (lattice scattering grows)', 'increases (impurity scattering fades)', 'stays the same', 'doubles'], a: 0, w: [null, 'At light doping impurity scattering is already negligible; lattice scattering rules.', 'Phonon scattering depends strongly on $T$.', 'No: $\\mu_L \\propto T^{-3/2}$ gives a factor of $(4/3)^{-3/2} = 0.65$.'], s: md`$\mu \approx \mu_L \propto T^{-3/2}$.` },
      { q: md`Heavily doped Si ($N_d = ${hi}\,\text{cm}^{-3}$) is cooled from 200 K to 50 K. The mobility…`, o: ['decreases (ionized-impurity scattering takes over)', 'increases (less lattice scattering)', 'stays the same', 'goes to zero'], a: 0, w: [null, 'True for light doping; with this many ions, slow cold carriers are scattered strongly by impurities.', 'Both mechanisms depend on $T$.', 'It falls but stays finite (until freeze-out, carriers still move).'], s: md`$\mu_I \propto T^{3/2}/N_I$ shrinks on cooling and is the smaller term at low $T$ and high $N_I$.` },
      { q: md`n-type Si with $N_d = ${hi}$ gets an extra $0.9N_d$ of acceptors. Compared with before, $n_0$ and $\mu_n$…`, o: ['$n_0$ falls tenfold and $\\mu_n$ falls', '$n_0$ falls and $\\mu_n$ rises', 'both unchanged', '$n_0$ unchanged, $\\mu_n$ falls'], a: 0, w: [null, 'Compensation removes carriers but adds scattering ions: $N_I$ nearly doubles.', 'Both change.', 'The acceptors capture 90% of the electrons.'], s: md`$n_0 = N_d - N_a = 0.1N_d$; $N_I = N_d + N_a = 1.9N_d$.` },
      { q: md`The field in a Si sample is raised from $10^2$ to $10^5$ V/cm. The electron drift velocity…`, o: ['rises about 1000× ', 'saturates near $10^7$ cm/s, far less than 1000×', 'falls', 'is unchanged'], a: 1, w: ['Only if $\\mu$ stayed constant; at high fields it doesn\'t.', null, 'It doesn\'t fall in Si.', 'It certainly increases at first.'], s: md`At $10^2$ V/cm, $v_d \approx 1.35\times10^5$ cm/s; it saturates near $10^7$ cm/s.` },
      { q: md`At low temperature in a heavily doped sample, which scattering mechanism limits the mobility?`, o: ['ionized-impurity scattering', 'lattice (phonon) scattering', 'carrier–carrier scattering', 'surface scattering'], a: 0, w: [null, 'Phonons are frozen out at low $T$.', 'Minor.', 'Not in bulk.'], s: md`$\mu_I \propto T^{3/2}/N_I$ is small at low $T$ and high $N_I$.` },
      { q: md`Why is $\mu_n \approx 1350$ but $\mu_p \approx 480\,\text{cm}^2/\text{V·s}$ in lightly doped Si?`, o: ['Holes have a larger conductivity effective mass (and scatter similarly)', 'Holes are positive', 'There are fewer holes', 'Holes can\'t drift'], a: 0, w: [null, 'Charge sign doesn\'t set mobility.', 'Mobility is per carrier, independent of how many.', 'They drift fine.'], s: md`$\mu = q\bar t/m^*$.` },
    ];
    const c = pick(S1);
    return { title: 'Mobility trends', q: c.q, parts: [{ mc: c.o, a: c.a, why: c.w }], sol: c.s };
  };

  GENS.semi_matthiessen = () => {
    const v = pick(['T', 'T', 'split']);
    if (v === 'split') {
      const muL = pick([1300, 1400, 1500, 1600]), mu = pick([400, 600, 800, 900, 1000]);
      const muI = 1 / (1 / mu - 1 / muL);
      return {
        title: 'Separating the scattering mechanisms',
        q: md`A Si sample has measured electron mobility $${mu}\,\text{cm}^2/\text{V·s}$. Lattice scattering alone would give $${muL}\,\text{cm}^2/\text{V·s}$. What mobility would impurity scattering alone give?`,
        parts: [T({ lbl: '\\mu_I', ans: muI, unit: 'cm^2/V·s' })],
        hints: ['Matthiessen: $1/\\mu = 1/\\mu_L + 1/\\mu_I$.'],
        sol: G4('$\\dfrac1\\mu = \\dfrac{1}{\\mu_L} + \\dfrac{1}{\\mu_I}$.', '$\\mu_I = \\left(\\dfrac1\\mu - \\dfrac{1}{\\mu_L}\\right)^{-1}$.',
          `$$\\mu_I = \\left(\\frac{1}{${mu}} - \\frac{1}{${muL}}\\right)^{-1}${CMS}$$`, `$\\mu_I = ${f(muI)}\\,\\text{cm}^2/\\text{V·s}$.`),
      };
    }
    const muL = pick([1300, 1400, 1500]), muI = pick([800, 1500, 2000, 3000, 5000]), T2 = pick([200, 250, 350, 400, 450]);
    const r = T2 / 300, muL2 = muL * Math.pow(r, -1.5), muI2 = muI * Math.pow(r, 1.5), mu2 = 1 / (1 / muL2 + 1 / muI2), mu1 = 1 / (1 / muL + 1 / muI);
    return {
      title: 'Mobility at another temperature',
      q: md`At 300 K a sample has $\mu_L = ${muL}$ and $\mu_I = ${muI}\,\text{cm}^2/\text{V·s}$. With $\mu_L \propto T^{-3/2}$ and $\mu_I \propto T^{3/2}$, find the mobility at 300 K and at ${T2} K.`,
      parts: [T({ lbl: '\\mu(300\\,\\text{K})', ans: mu1, unit: 'cm^2/V·s' }), T({ lbl: `\\mu(${T2}\\,\\text{K})`, ans: mu2, unit: 'cm^2/V·s' })],
      hints: ['Scale each mechanism separately, then add the inverses.'],
      sol: G4('$\\dfrac1\\mu = \\dfrac1{\\mu_L} + \\dfrac1{\\mu_I}$, $\\mu_L \\propto T^{-3/2}$, $\\mu_I \\propto T^{3/2}$.',
        `$\\mu_L(T) = \\mu_L(300)(T/300)^{-3/2}$, $\\mu_I(T) = \\mu_I(300)(T/300)^{3/2}$.`,
        `$$\\mu_L(${T2}) = (${muL})(${f(r)})^{-3/2} = ${f(muL2)}, \\quad \\mu_I(${T2}) = (${muI})(${f(r)})^{3/2} = ${f(muI2)}${CMS}$$ $$\\mu(${T2}) = \\left(\\frac{1}{${f(muL2)}} + \\frac{1}{${f(muI2)}}\\right)^{-1}${CMS}$$`,
        `$\\mu(300) = ${f(mu1)}$, $\\mu(${T2}) = ${f(mu2)}\\,\\text{cm}^2/\\text{V·s}$.`),
    };
  };

  GENS.semi_einstein = () => {
    const Tk = pick([300, 300, 250, 350, 400]), kT = kTof(Tk), car = pick(['n', 'p']);
    const mu = car === 'n' ? pick([1350, 1200, 800, 3900, 8500]) : pick([480, 400, 250, 1900, 400]);
    const back = Math.random() < 0.35;
    const D = kT * mu;
    return {
      title: 'Einstein relation',
      q: back ? md`At ${Tk} K a ${car === 'n' ? 'electron' : 'hole'} diffusion coefficient is $D_${car} = ${f(D)}\,\text{cm}^2/\text{s}$. Find $\mu_${car}$.` : md`At ${Tk} K, $\mu_${car} = ${mu}\,\text{cm}^2/\text{V·s}$. Find $D_${car}$.`,
      parts: [back ? T({ lbl: `\\mu_${car}`, ans: D / kT, unit: 'cm^2/V·s' }) : T({ lbl: `D_${car}`, ans: D, unit: 'cm^2/s' })],
      hints: [`$D/\\mu = kT/q$, and $kT/q = ${kTt(Tk)}$ V at ${Tk} K${Tk === 300 ? '' : ' ($8.62\\times10^{-5}\\times' + Tk + '$)'}.`],
      sol: G4('$\\dfrac{D}{\\mu} = \\dfrac{kT}{q}$.', back ? '$\\mu = D\\big/\\tfrac{kT}{q}$.' : '$D = \\tfrac{kT}{q}\\mu$.',
        back ? `$$\\mu_${car} = \\frac{${f(D)}\\,\\text{cm}^2/\\text{s}}{${kTt(Tk)}\\,\\text{V}}$$` : `$$D_${car} = (${kTt(Tk)}\\,\\text{V})\\left(${mu}${CMS}\\right)$$`,
        back ? `$\\mu_${car} = ${f(D / kT)}\\,\\text{cm}^2/\\text{V·s}$.` : `$D_${car} = ${f(D)}\\,\\text{cm}^2/\\text{s}$.`),
    };
  };

  GENS.semi_graded = () => {
    const v = pick(['expn', 'expp', 'lin']);
    const kT = 0.0259;
    if (v === 'lin') {
      const N1 = dec(16, 17), N2 = N1 * pick([0.1, 0.2, 0.25, 0.5]), W = pick([1, 2, 5, 10]) * 1e-4, x = W * pick([0, 0.25, 0.5, 0.75]);
      const g = (N2 - N1) / W, N = N1 + g * x, E = -kT * g / N;
      return {
        title: 'Built-in field, linear grading',
        q: md`n-type Si at 300 K, equilibrium: $N_d$ falls linearly from $${p(N1)}$ at $x = 0$ to $${p(N2)}${CM3}$ at $x = ${+(W * 1e4).toPrecision(3)}\,\mu$m. Find the built-in field at $x = ${+(x * 1e4).toPrecision(3)}\,\mu$m (positive along $+x$).`,
        figHtml: BD.prof({ w: 260, h: 160, x: [0, 1], y: [0, 1.1], xl: 'x', yl: 'N_d', curves: [{ pts: [[0, 1], [1, N2 / N1]] }], xt: [[0, '0'], [1, `${+(W * 1e4).toPrecision(3)}\\,\\mu\\text{m}`]], yt: [[1, p(N1)]] }),
        parts: [T({ lbl: '\\mathscr{E}', ans: E, unit: 'V/cm' })],
        hints: ['Equilibrium: $J_n = 0$, so $\\mathscr{E} = -\\dfrac{kT}{q}\\dfrac{1}{n}\\dfrac{dn}{dx}$ with $n \\approx N_d$.', `$dN_d/dx = ${f(g)}\\,\\text{cm}^{-4}$; evaluate $N_d$ at the point.`],
        sol: G4('$J_n = q\\mu_nn\\mathscr{E} + qD_n\\dfrac{dn}{dx} = 0$, with $D_n/\\mu_n = kT/q$.', '$\\mathscr{E} = -\\dfrac{kT}{q}\\,\\dfrac{1}{N_d(x)}\\dfrac{dN_d}{dx}$.',
          `$$\\frac{dN_d}{dx} = \\frac{${p(N2)} - ${p(N1)}}{${f(W)}\\,\\text{cm}}\\,\\text{cm}^{-3} = ${f(g)}\\,\\text{cm}^{-4}, \\qquad N_d(x) = ${f(N)}${CM3}$$ $$\\mathscr{E} = -(0.0259\\,\\text{V})\\frac{${f(g)}\\,\\text{cm}^{-4}}{${f(N)}${CM3}}$$`,
          `$\\mathscr{E} = ${f(E)}$ V/cm (along $+x$, toward the lighter doping).`),
      };
    }
    const L = pick([0.2, 0.25, 0.5, 1, 2]) * 1e-4, W = L * pick([1, 2, 3]), n = v === 'expn';
    const E = (n ? 1 : -1) * kT / L, dV = kT * W / L;
    return {
      title: n ? 'Built-in field, exponential donors' : 'Built-in field, exponential acceptors',
      q: md`${n ? 'n' : 'p'}-type Si at 300 K, equilibrium, doped $${n ? 'N_d' : 'N_a'}(x) = N_0e^{-x/L}$ with $L = ${+(L * 1e4).toPrecision(3)}\,\mu$m. Find the built-in field (positive along $+x$) and the potential difference $|V(0) - V(W)|$ for $W = ${+(W * 1e4).toPrecision(3)}\,\mu$m.`,
      figHtml: BD.diagram({ w: 220, h: 120, E: [-1.0, 0.5], Ec: (x) => (n ? 0.15 : 0.95) + (n ? 0.3 : -0.3) * x, Ev: (x) => (n ? 0.15 : 0.95) + (n ? 0.3 : -0.3) * x - 1.11, EF: 0, Ei: false, xl: 'x', axis: false }),
      parts: [T({ lbl: '\\mathscr{E}', ans: E, unit: 'V/cm' }), T({ lbl: '|\\Delta V|', ans: dV, unit: 'V', tol: { rel: 0.015, abs: 0.0005 } })],
      hints: [n ? '$J_n = 0$: $\\mathscr{E} = -\\dfrac{kT}{q}\\dfrac1n\\dfrac{dn}{dx}$.' : '$J_p = 0$: $\\mathscr{E} = +\\dfrac{kT}{q}\\dfrac1p\\dfrac{dp}{dx}$.', '$\\dfrac{1}{N}\\dfrac{dN}{dx} = -\\dfrac1L$ for an exponential.', 'A uniform field over $W$: $\\Delta V = \\mathscr{E}W$.'],
      sol: G4(n ? '$J_n = q\\mu_nn\\mathscr{E} + qD_n\\,dn/dx = 0$, $D_n/\\mu_n = kT/q$.' : '$J_p = q\\mu_pp\\mathscr{E} - qD_p\\,dp/dx = 0$, $D_p/\\mu_p = kT/q$.',
        n ? '$\\mathscr{E} = -\\dfrac{kT}{q}\\dfrac1n\\dfrac{dn}{dx} = +\\dfrac{kT}{qL}$; $\\;|\\Delta V| = \\dfrac{kT}{q}\\dfrac WL$.' : '$\\mathscr{E} = +\\dfrac{kT}{q}\\dfrac1p\\dfrac{dp}{dx} = -\\dfrac{kT}{qL}$; $\\;|\\Delta V| = \\dfrac{kT}{q}\\dfrac WL$.',
        `$$\\mathscr{E} = ${n ? '' : '-'}\\frac{0.0259\\,\\text{V}}{${f(L)}\\,\\text{cm}}, \\qquad |\\Delta V| = (0.0259\\,\\text{V})\\frac{${+(W * 1e4).toPrecision(3)}\\,\\mu\\text{m}}{${+(L * 1e4).toPrecision(3)}\\,\\mu\\text{m}}$$`,
        `$\\mathscr{E} = ${f(E)}$ V/cm (${n ? 'along $+x$, toward the lighter doping' : 'along $-x$, toward the heavier doping: it holds the holes back'}), $|\\Delta V| = ${f(dV)}$ V.`),
    };
  };

  GENS.semi_drift_diff = () => {
    const car = pick(['n', 'p']), mu = car === 'n' ? pick([1350, 1200, 1000]) : pick([480, 400, 450]);
    const D = 0.0259 * mu;
    const shape = pick(['exp', 'lin']);
    const A = dec(14, 16), Lc = pick([1, 2, 5, 10]) * 1e-4, x = Lc * pick([0, 0.5, 1]);
    const Ef = pick([-50, -20, -10, 10, 20, 50, 100]);
    let c, dc, prof, desc;
    if (shape === 'exp') { c = A * exp(-x / Lc); dc = -c / Lc; prof = (u) => exp(-u); desc = md`$${car}(x) = ${p(A)}e^{-x/L}\,\text{cm}^{-3}$ with $L = ${+(Lc * 1e4).toPrecision(3)}\,\mu$m`; }
    else { c = A * (1 - x / (2 * Lc)); dc = -A / (2 * Lc); prof = (u) => 1 - u / 2; desc = md`$${car}(x) = ${p(A)}\left(1 - \dfrac{x}{${+(2 * Lc * 1e4)}\,\mu\text{m}}\right)\text{cm}^{-3}$`; }
    const Jdr = S.q * mu * c * Ef, Jdf = (car === 'n' ? 1 : -1) * S.q * D * dc;
    const sgn = car === 'n' ? '+' : '-';
    return {
      title: 'Drift and diffusion components',
      q: md`At 300 K the ${car === 'n' ? 'electron' : 'hole'} concentration in a region is ${desc}, and there is a uniform field $\mathscr{E} = ${Ef}$ V/cm (positive along $+x$). With $\mu_${car} = ${mu}\,\text{cm}^2/\text{V·s}$, find at $x = ${+(x * 1e4).toPrecision(3)}\,\mu$m the drift current density, the diffusion current density, and their sum (signs: $+$ along $+x$).`,
      figHtml: BD.prof({ w: 280, h: 160, x: [0, shape === 'exp' ? 2.2 : 2], y: [0, 1.1], xl: 'x', yl: `${car}(x)`, curves: [{ f: prof }], vlines: [[x / Lc, `x = ${+(x * 1e4).toPrecision(3)}\\,\\mu\\text{m}`]] }),
      parts: [T({ lbl: `J_${car}^{\\text{drift}}`, ans: Jdr, unit: 'A/cm^2' }), T({ lbl: `J_${car}^{\\text{diff}}`, ans: Jdf, unit: 'A/cm^2' }), T({ lbl: `J_${car}`, ans: Jdr + Jdf, unit: 'A/cm^2', tol: { rel: 0.02, abs: 1e-3 * Math.max(Math.abs(Jdr), Math.abs(Jdf)) } })],
      hints: [`$D_${car} = (kT/q)\\mu_${car}$.`, car === 'n' ? '$J_n = q\\mu_nn\\mathscr{E} + qD_n\\,dn/dx$.' : '$J_p = q\\mu_pp\\mathscr{E} - qD_p\\,dp/dx$.', `At the point: $${car} = ${f(c)}${CM3}$, $d${car}/dx = ${f(dc)}\\,\\text{cm}^{-4}$.`],
      sol: G4(car === 'n' ? '$J_n = q\\mu_nn\\mathscr{E} + qD_n\\dfrac{dn}{dx}$, $D_n = \\dfrac{kT}{q}\\mu_n$.' : '$J_p = q\\mu_pp\\mathscr{E} - qD_p\\dfrac{dp}{dx}$, $D_p = \\dfrac{kT}{q}\\mu_p$.',
        `$D_${car} = (0.0259\\,\\text{V})(${mu}${CMS}) = ${f(D)}\\,\\text{cm}^2/\\text{s}$; at the point $${car} = ${f(c)}${CM3}$, $\\dfrac{d${car}}{dx} = ${f(dc)}\\,\\text{cm}^{-4}$.`,
        `$$J^{\\text{drift}} = \\left(${Q}\\right)\\left(${mu}${CMS}\\right)\\left(${f(c)}${CM3}\\right)\\left(${Ef}\\,\\tfrac{\\text{V}}{\\text{cm}}\\right)$$ $$J^{\\text{diff}} = ${sgn}\\left(${Q}\\right)\\left(${f(D)}\\,\\tfrac{\\text{cm}^2}{\\text{s}}\\right)\\left(${f(dc)}\\,\\text{cm}^{-4}\\right)$$`,
        `$J^{\\text{drift}} = ${f(Jdr)}$, $J^{\\text{diff}} = ${f(Jdf)}$, total $= ${f(Jdr + Jdf)}\\,\\text{A/cm}^2$.`),
    };
  };

  // ======================================================================== excess carriers
  GENS.semi_absorb = () => {
    const v = pick(['power', 'power', 'thick', 'cut']);
    if (v === 'cut') {
      const m = pick(['Si', 'GaAs', 'Ge']), Eg = S.mat[m].Eg, lam = pick([0.45, 0.65, 0.85, 0.95, 1.3, 1.55]);
      const E = 1.24 / lam, abs = E >= Eg;
      return {
        title: 'Absorbed or transmitted?',
        q: md`Light of wavelength $${lam}\,\mu$m falls on ${m} ($E_g = ${Eg}$ eV). Find the photon energy, and say whether it creates electron–hole pairs.`,
        parts: [T({ lbl: 'h\\nu', ans: E, unit: 'eV' }), { lbl: 'Creates pairs?', mc: ['Yes: $h\\nu \\ge E_g$', 'No: $h\\nu < E_g$, the material is transparent'], a: abs ? 0 : 1, why: abs ? [null, `$h\\nu = ${f(E)}$ eV exceeds $E_g$.`] : [`$h\\nu = ${f(E)}$ eV is below $E_g$.`, null] }],
        hints: ['$E\\,[\\text{eV}] = 1.24/\\lambda\\,[\\mu\\text{m}]$.'],
        sol: G4('$h\\nu = \\dfrac{hc}{\\lambda}$, absorbed if $h\\nu \\ge E_g$.', '$h\\nu\\,[\\text{eV}] = \\dfrac{1.24}{\\lambda\\,[\\mu\\text{m}]}$.', `$$h\\nu = \\frac{1.24\\,\\mu\\text{m·eV}}{${lam}\\,\\mu\\text{m}}$$`,
          `$h\\nu = ${f(E)}$ eV: ${abs ? 'above' : 'below'} $E_g = ${Eg}$ eV, so ${abs ? 'absorbed (pairs created)' : 'transmitted'}.`),
      };
    }
    if (v === 'thick') {
      const alpha = pick([1e3, 3e3, 1e4, 3e4, 1e5]), frac = pick([0.5, 0.63, 0.9, 0.95, 0.99]);
      const d = -ln(1 - frac) / alpha;
      return {
        title: 'Thickness to absorb a fraction',
        q: md`At some wavelength $\alpha = ${p(alpha)}\,\text{cm}^{-1}$. What thickness absorbs ${Math.round(frac * 100)}% of the light that enters (ignore reflection)? Answer in μm.`,
        parts: [T({ lbl: 'd', ans: d * 1e4, unit: 'μm' })],
        hints: [`Transmitted fraction $e^{-\\alpha d} = ${+(1 - frac).toFixed(2)}$.`],
        sol: G4('$I(d) = I_0e^{-\\alpha d}$; absorbed fraction $1 - e^{-\\alpha d}$.', `$d = -\\dfrac{\\ln(1 - F)}{\\alpha}$ with $F = ${frac}$.`,
          `$$d = -\\frac{\\ln(${+(1 - frac).toFixed(2)})}{${p(alpha)}\\,\\text{cm}^{-1}} = ${f(d)}\\,\\text{cm}$$`, `$d = ${f(d * 1e4)}\\,\\mu$m.`),
      };
    }
    const m = pick(['Si', 'GaAs']), Eg = S.mat[m].Eg, hv = pick([1.6, 1.8, 2.0, 2.2, 2.5]), alpha = pick([1e4, 2e4, 3e4, 5e4]), dum = pick([0.2, 0.25, 0.4, 0.5, 1]), P0 = pick([1, 2, 5, 10]);
    const ad = alpha * dum * 1e-4, Pa = P0 * (1 - exp(-ad)), heat = Pa * (hv - Eg) / hv, N = Pa * 1e-3 / (hv * S.q);
    return {
      title: 'Power absorbed in a thin sample',
      q: md`A $${dum}\,\mu$m ${m} sample ($E_g = ${Eg}$ eV) is lit by $${P0}$ mW of photons at $h\nu = ${hv}$ eV, where $\alpha = ${p(alpha)}\,\text{cm}^{-1}$. Ignoring reflection, find the power absorbed, the part of it lost as heat by thermalization, and the number of photons absorbed per second.`,
      figHtml: BD.slab({ alpha: ad / 2.2 * 1, d: 2.2 }),
      parts: [T({ lbl: 'P_{\\text{abs}}', ans: Pa, unit: 'mW' }), T({ lbl: 'P_{\\text{heat}}', ans: heat, unit: 'mW' }), T({ lbl: '\\dot N', ans: N, unit: 'photons/s' })],
      hints: [`$\\alpha d = ${f(ad)}$ (convert $d$ to cm).`, 'Absorbed fraction $1 - e^{-\\alpha d}$; heat fraction $(h\\nu - E_g)/h\\nu$.', 'Photons per second: $P/(h\\nu)$ with $h\\nu$ in joules.'],
      sol: G4('$P_{\\text{abs}} = P_0(1 - e^{-\\alpha d})$, $P_{\\text{heat}} = P_{\\text{abs}}\\dfrac{h\\nu - E_g}{h\\nu}$, $\\dot N = \\dfrac{P_{\\text{abs}}}{h\\nu}$.',
        `$\\alpha d = (${p(alpha)}\\,\\text{cm}^{-1})(${f(dum * 1e-4)}\\,\\text{cm}) = ${f(ad)}$.`,
        `$$P_{\\text{abs}} = (${P0}\\,\\text{mW})\\left(1 - e^{-${f(ad)}}\\right), \\quad P_{\\text{heat}} = (${f(Pa)}\\,\\text{mW})\\frac{${hv} - ${Eg}}{${hv}}, \\quad \\dot N = \\frac{${f(Pa * 1e-3)}\\,\\text{J/s}}{(${hv}\\,\\text{eV})(1.6\\times10^{-19}\\,\\text{J/eV})}$$`,
        `$P_{\\text{abs}} = ${f(Pa)}$ mW, $P_{\\text{heat}} = ${f(heat)}$ mW, $\\dot N = ${f(N)}$ photons/s.`),
    };
  };

  GENS.semi_decay_low = () => {
    const v = pick(['ar', 'ar', 'tau']);
    const ntype = Math.random() < 0.5, maj = dec(15, 17), car = ntype ? 'p' : 'n', min = ntype ? '\\delta p' : '\\delta n';
    const D0 = maj * pick([1e-4, 1e-3, 5e-3, 1e-2]);
    if (v === 'tau') {
      const tau = pick([0.5, 1, 2, 5, 10]) * 1e-6, target = D0 * pick([0.5, 0.1, 0.01, 0.001]);
      const t = tau * ln(D0 / target);
      return {
        title: 'Decay after a light pulse',
        q: md`A pulse leaves $\Delta ${car} = ${p(D0)}${CM3}$ excess carriers (low level) in ${ntype ? 'n' : 'p'}-type material with minority lifetime $\tau_${car} = ${+(tau * 1e6).toPrecision(3)}\,\mu$s. How long until the excess falls to $${p(target)}${CM3}$? Answer in μs.`,
        parts: [T({ lbl: 't', ans: t * 1e6, unit: 'μs' })],
        hints: [`$${min}(t) = \\Delta ${car}\\,e^{-t/\\tau_${car}}$; solve for $t$ with a natural log.`],
        sol: G4(`$${min}(t) = \\Delta ${car}\\,e^{-t/\\tau_${car}}$.`, `$t = \\tau_${car}\\ln\\dfrac{\\Delta ${car}}{${min}}$.`, `$$t = (${+(tau * 1e6).toPrecision(3)}\\,\\mu\\text{s})\\ln\\frac{${p(D0)}${CM3}}{${p(target)}${CM3}}$$`, `$t = ${f(t * 1e6)}\\,\\mu$s.`),
      };
    }
    const ar = pick([1e-10, 2e-10, 5e-10, 7.2e-10]), tau = 1 / (ar * maj), t = tau * pick([0.5, 1, 2, 3]);
    const left = D0 * exp(-t / tau);
    return {
      title: 'Lifetime and decay (direct recombination)',
      q: md`${ntype ? 'n' : 'p'}-type GaAs with $${ntype ? 'N_d' : 'N_a'} = ${p(maj)}${CM3}$ and $\alpha_r = ${p(ar)}\,\text{cm}^3/\text{s}$ receives a short pulse creating $\Delta n = \Delta p = ${p(D0)}${CM3}$. Find the minority-carrier lifetime (ns) and the excess remaining after $t = ${f(t * 1e9)}$ ns.`,
      parts: [T({ lbl: `\\tau_${car}`, ans: tau * 1e9, unit: 'ns' }), T({ lbl: `${min}(t)`, ans: left, unit: 'cm^{-3}', tol: { rel: 0.02 } })],
      hints: [`Low level ($\\Delta \\ll ${ntype ? 'n_0' : 'p_0'}$): $\\tau = 1/(\\alpha_r(n_0 + p_0)) \\approx 1/(\\alpha_r\\cdot\\text{majority})$.`, `$${min}(t) = \\Delta e^{-t/\\tau}$.`],
      sol: G4(`$\\dfrac{d${min}}{dt} = -\\alpha_r(n_0 + p_0)${min}$ (low level).`, `$\\tau_${car} = \\dfrac{1}{\\alpha_r${ntype ? 'n_0' : 'p_0'}}$, $\\;${min}(t) = \\Delta ${car}\\,e^{-t/\\tau_${car}}$.`,
        `$$\\tau_${car} = \\frac{1}{\\left(${p(ar)}\\,\\text{cm}^3/\\text{s}\\right)\\left(${p(maj)}${CM3}\\right)}, \\qquad ${min}(t) = \\left(${p(D0)}${CM3}\\right)\\exp\\left(-\\frac{${f(t * 1e9)}\\,\\text{ns}}{${f(tau * 1e9)}\\,\\text{ns}}\\right)$$`,
        `$\\tau_${car} = ${f(tau * 1e9)}$ ns, $${min}(t) = ${f(left)}${CM3}$.`),
    };
  };

  GENS.semi_decay_high = () => {
    const ar = pick([1e-10, 2e-10, 5e-10]), D0 = dec(16, 17), k = pick([2, 4, 5, 10]);
    const tk = (k - 1) / (ar * D0), t = pick([1, 2, 5, 10, 20, 50, 100]) * 1e-9, left = D0 / (1 + ar * D0 * t);
    return {
      title: 'High-level injection decay',
      q: md`A nearly intrinsic sample ($n_0 + p_0$ negligible), $\alpha_r = ${p(ar)}\,\text{cm}^3/\text{s}$, starts with $\Delta n = \Delta p = ${p(D0)}${CM3}$. Find $\delta n$ after $${+(t * 1e9).toPrecision(3)}$ ns, and the time for $\delta n$ to fall to $\Delta n/${k}$ (ns).`,
      parts: [T({ lbl: '\\delta n(t)', ans: left, unit: 'cm^{-3}' }), T({ lbl: `t_{1/${k}}`, ans: tk * 1e9, unit: 'ns' })],
      hints: ['High level: $d\\delta n/dt = -\\alpha_r\\delta n^2$, so $\\delta n = \\Delta n/(1 + \\alpha_r\\Delta n\\,t)$ (not exponential).', `$\\delta n = \\Delta n/${k}$ when $\\alpha_r\\Delta n\\,t = ${k - 1}$.`],
      sol: G4('$\\dfrac{d\\,\\delta n}{dt} = -\\alpha_r\\,\\delta n^2$ ($\\delta n \\gg n_0 + p_0$).', `$\\delta n(t) = \\dfrac{\\Delta n}{1 + \\alpha_r\\Delta n\\,t}$, $\\;t_{1/${k}} = \\dfrac{${k - 1}}{\\alpha_r\\Delta n}$.`,
        `$$\\alpha_r\\Delta n = \\left(${p(ar)}\\,\\tfrac{\\text{cm}^3}{\\text{s}}\\right)\\left(${p(D0)}${CM3}\\right) = ${f(ar * D0)}\\,\\text{s}^{-1}$$ $$\\delta n = \\frac{${p(D0)}${CM3}}{1 + (${f(ar * D0)}\\,\\text{s}^{-1})(${f(t)}\\,\\text{s})}, \\qquad t_{1/${k}} = \\frac{${k - 1}}{${f(ar * D0)}\\,\\text{s}^{-1}}$$`,
        `$\\delta n = ${f(left)}${CM3}$, $t_{1/${k}} = ${f(tk * 1e9)}$ ns.`),
    };
  };

  GENS.semi_qfl = () => {
    const ntype = Math.random() < 0.5, N = dec(14, 17), gop = dec(18, 21), tau = pick([0.1, 0.5, 1, 2, 5, 10]) * 1e-6;
    const d = gop * tau;
    if (d > 0.1 * N || d < 1e11) return GENS.semi_qfl();
    const ni = 1e10, n0 = ntype ? N : ni * ni / N, p0 = ntype ? ni * ni / N : N;
    const n = n0 + d, pp = p0 + d, Fn = 0.0259 * ln(n / ni), Fp = 0.0259 * ln(pp / ni);
    return {
      title: 'Quasi-Fermi levels under uniform light',
      q: md`${ntype ? 'n' : 'p'}-type Si at 300 K ($${ntype ? 'N_d' : 'N_a'} = ${p(N)}${CM3}$, $n_i = 10^{10}${CM3}$) is lit uniformly: $g_{op} = ${p(gop)}\,\text{cm}^{-3}\text{s}^{-1}$, $\tau_n = \tau_p = ${+(tau * 1e6).toPrecision(3)}\,\mu$s. Find the excess carrier concentration, $F_n - E_i$, and $E_i - F_p$.`,
      figHtml: bandFig(1.11, 0.555 + (ntype ? 1 : -1) * 0.0259 * ln(N / ni), { lab: { EF: 'E_F\\ (\\text{dark})' } }),
      parts: [T({ lbl: '\\delta n = \\delta p', ans: d, unit: 'cm^{-3}' }), T({ lbl: 'F_n - E_i', ans: Fn, unit: 'eV', tol: { abs: 0.002 } }), T({ lbl: 'E_i - F_p', ans: Fp, unit: 'eV', tol: { abs: 0.002 } })],
      hints: ['$\\delta n = \\delta p = g_{op}\\tau$.', '$n = n_0 + \\delta n = n_ie^{(F_n - E_i)/kT}$ and $p = p_0 + \\delta p = n_ie^{(E_i - F_p)/kT}$.', `The minority equilibrium value is $${p(ntype ? p0 : n0)}$: negligible next to the excess.`],
      sol: G4('$\\delta n = \\delta p = g_{op}\\tau$; $\\;n = n_i\\,e^{(F_n - E_i)/kT}$, $\\;p = n_i\\,e^{(E_i - F_p)/kT}$.',
        '$F_n - E_i = kT\\ln\\dfrac{n_0 + \\delta n}{n_i}$, $\\;E_i - F_p = kT\\ln\\dfrac{p_0 + \\delta p}{n_i}$.',
        `$$\\delta n = \\left(${p(gop)}\\,\\text{cm}^{-3}\\text{s}^{-1}\\right)\\left(${f(tau)}\\,\\text{s}\\right) = ${f(d)}${CM3}$$ $$F_n - E_i = (0.0259\\,\\text{eV})\\ln\\frac{${f(n)}${CM3}}{10^{10}${CM3}}, \\qquad E_i - F_p = (0.0259\\,\\text{eV})\\ln\\frac{${f(pp)}${CM3}}{10^{10}${CM3}}$$`,
        `$\\delta n = ${f(d)}${CM3}$, $F_n - E_i = ${f(Fn)}$ eV, $E_i - F_p = ${f(Fp)}$ eV. The ${ntype ? 'hole' : 'electron'} (minority) level moved; the majority one barely did.`),
    };
  };

  GENS.semi_photocond = () => {
    const gop = dec(19, 21), tau = pick([1, 2, 5, 10, 20]) * 1e-6, L = pick([0.5, 1, 2]) * 1e-1, A = pick([1e-4, 1e-5, 1e-6]), V = pick([1, 5, 10]);
    const d = gop * tau, ds = S.q * d * (1350 + 480), dI = ds * A / L * V;
    return {
      title: 'Photoconductivity',
      q: md`A Si photoconductor ($\mu_n = 1350$, $\mu_p = 480\,\text{cm}^2/\text{V·s}$, $\tau_n = \tau_p = ${+(tau * 1e6).toPrecision(3)}\,\mu$s) is ${+(L * 10).toPrecision(3)} mm long with cross-section $${p(A)}\,\text{cm}^2$ and is biased at ${V} V. Uniform light gives $g_{op} = ${p(gop)}\,\text{cm}^{-3}\text{s}^{-1}$. Find the increase in conductivity and in current.`,
      parts: [T({ lbl: '\\Delta\\sigma', ans: ds, unit: '(Ω·cm)^{-1}' }), T({ lbl: '\\Delta I', ans: dI * 1e3, unit: 'mA' })],
      hints: ['$\\delta n = \\delta p = g_{op}\\tau$; both carriers add conductivity.', '$\\Delta I = \\Delta\\sigma\\,(A/L)\\,V$.'],
      sol: G4('$\\Delta\\sigma = q(\\delta n\\mu_n + \\delta p\\mu_p)$, $\\;\\Delta I = \\Delta\\sigma\\dfrac{A}{L}V$.', '$\\delta n = \\delta p = g_{op}\\tau$, so $\\Delta\\sigma = qg_{op}\\tau(\\mu_n + \\mu_p)$.',
        `$$\\Delta\\sigma = \\left(${Q}\\right)\\left(${f(d)}${CM3}\\right)\\left(1830${CMS}\\right), \\qquad \\Delta I = \\left(${f(ds)}\\,(\\Omega\\cdot\\text{cm})^{-1}\\right)\\frac{${p(A)}\\,\\text{cm}^2}{${f(L)}\\,\\text{cm}}(${V}\\,\\text{V})$$`,
        `$\\Delta\\sigma = ${f(ds)}\\,(\\Omega\\cdot\\text{cm})^{-1}$, $\\Delta I = ${f(dI * 1e3)}$ mA.`),
    };
  };

  GENS.semi_steady = () => {
    const holes = Math.random() < 0.5, car = holes ? 'p' : 'n', mu = holes ? pick([480, 450, 400]) : pick([1350, 1200, 1000]);
    const D = 0.0259 * mu, tau = pick([0.1, 0.5, 1, 2, 5]) * 1e-6, L = Math.sqrt(D * tau);
    const Maj = dec(15, 17), D0 = Maj * pick([1e-3, 1e-2, 0.05]);
    const v = pick(['at', 'at', 'frac']);
    const x = v === 'at' ? +(L * pick([0.5, 1, 1.5, 2]) * 1e4).toPrecision(2) * 1e-4 : 0;
    const frac = pick([0.5, 0.1, 0.01]);
    const dx = D0 * exp(-x / L), J = (holes ? 1 : -1) * S.q * D / L * dx, xf = L * ln(1 / frac);
    const parts = [T({ lbl: `L_${car}`, ans: L * 1e4, unit: 'μm' })];
    if (v === 'at') parts.push(T({ lbl: `\\delta ${car}(x)`, ans: dx, unit: 'cm^{-3}', tol: { rel: 0.02 } }), T({ lbl: `J_${car}(x)`, ans: J, unit: 'A/cm^2', tol: { rel: 0.02 } }));
    else parts.push(T({ lbl: `x_{${frac}}`, ans: xf * 1e4, unit: 'μm' }));
    return {
      title: 'Steady-state injection',
      q: md`Excess ${holes ? 'holes' : 'electrons'} are injected at $x = 0$ into a long ${holes ? 'n' : 'p'}-type Si bar (majority $${p(Maj)}${CM3}$) and held at $\delta ${car}(0) = ${p(D0)}${CM3}$. No field; 300 K; $\mu_${car} = ${mu}\,\text{cm}^2/\text{V·s}$, $\tau_${car} = ${+(tau * 1e6).toPrecision(3)}\,\mu$s. Find the diffusion length${v === 'at' ? md`, and at $x = ${+(x * 1e4).toPrecision(3)}\,\mu$m the excess concentration and the ${holes ? 'hole' : 'electron'} current density (sign: $+$ along $+x$)` : md`, and the depth at which the excess has fallen to ${frac} of its value at $x = 0$`}.`,
      figHtml: BD.prof({ w: 280, h: 160, x: [0, 3.2], y: [0, 1.1], xl: 'x', yl: `\\delta ${car}`, xt: [[1, `L_${car}`], [2, `2L_${car}`]], curves: [{ f: (u) => exp(-u) }], vlines: v === 'at' ? [[x / L, '']] : [] }),
      parts,
      hints: [`$D_${car} = (kT/q)\\mu_${car}$, $L_${car} = \\sqrt{D_${car}\\tau_${car}}$.`, `$\\delta ${car}(x) = \\Delta ${car}\\,e^{-x/L_${car}}$.`, holes ? '$J_p = -qD_p\\,d\\delta p/dx = +\\dfrac{qD_p}{L_p}\\delta p(x)$.' : '$J_n = +qD_n\\,d\\delta n/dx = -\\dfrac{qD_n}{L_n}\\delta n(x)$: negative (electrons diffuse to $+x$, current flows to $-x$).'],
      sol: G4(`$\\dfrac{d^2\\delta ${car}}{dx^2} = \\dfrac{\\delta ${car}}{L_${car}^2}$, $L_${car} = \\sqrt{D_${car}\\tau_${car}}$; long bar: $\\delta ${car}(x) = \\Delta ${car}\\,e^{-x/L_${car}}$.`,
        v === 'at' ? `$J_${car}(x) = ${holes ? '-qD_p\\,\\dfrac{d\\delta p}{dx} = +' : 'qD_n\\,\\dfrac{d\\delta n}{dx} = -'}\\dfrac{qD_${car}}{L_${car}}\\,\\delta ${car}(x)$.` : `$x = L_${car}\\ln(1/${frac})$.`,
        `$$D_${car} = (0.0259\\,\\text{V})\\left(${mu}${CMS}\\right) = ${f(D)}\\,\\tfrac{\\text{cm}^2}{\\text{s}}, \\qquad L_${car} = \\sqrt{\\left(${f(D)}\\,\\tfrac{\\text{cm}^2}{\\text{s}}\\right)\\left(${f(tau)}\\,\\text{s}\\right)} = ${f(L)}\\,\\text{cm}$$` +
          (v === 'at' ? ` $$\\delta ${car}(x) = \\left(${p(D0)}${CM3}\\right)\\exp\\left(-\\frac{${f(x)}\\,\\text{cm}}{${f(L)}\\,\\text{cm}}\\right), \\qquad J_${car} = ${holes ? '' : '-'}\\frac{\\left(${Q}\\right)\\left(${f(D)}\\,\\tfrac{\\text{cm}^2}{\\text{s}}\\right)}{${f(L)}\\,\\text{cm}}\\left(${f(dx)}${CM3}\\right)$$` : ` $$x = \\left(${f(L)}\\,\\text{cm}\\right)\\ln\\frac{1}{${frac}}$$`),
        `$L_${car} = ${f(L * 1e4)}\\,\\mu$m${v === 'at' ? `, $\\delta ${car} = ${f(dx)}${CM3}$, $J_${car} = ${f(J)}\\,\\text{A/cm}^2$` : `, $x = ${f(xf * 1e4)}\\,\\mu$m`}.`),
    };
  };

  // ======================================================================== warm-ups (Ch. 1, 3.1)
  GENS.semi_lattice = () => {
    const kind = pick(['sc', 'bcc', 'fcc', 'diamond']), a = +U.rand(3, 6).toFixed(2), acm = a * 1e-8;
    const per = { sc: 1, bcc: 2, fcc: 4, diamond: 8 }[kind], name = { sc: 'simple cubic', bcc: 'body-centered cubic', fcc: 'face-centered cubic', diamond: 'diamond' }[kind];
    const plane = { sc: 1, bcc: 1, fcc: 2, diamond: 2 }[kind];
    const N = per / acm ** 3, Np = plane / acm ** 2;
    return {
      title: 'Atomic and planar density',
      q: md`A crystal has the ${name} structure with one atom per lattice site (two-atom basis for diamond) and $a = ${a}$ Å. Find the atomic density and the density of atoms on a $(100)$ plane.`,
      figHtml: BD.cell(kind, { plane: '100', dim: true }),
      parts: [T({ lbl: 'N', ans: N, unit: 'cm^{-3}' }), T({ lbl: 'N_{(100)}', ans: Np, unit: 'cm^{-2}' })],
      hints: [`${name}: ${per} atom${per > 1 ? 's' : ''} per cubic cell.`, `On a $(100)$ face: ${plane === 1 ? '4 corners × ¼ = 1 atom' : '4 corners × ¼ + 1 face center = 2 atoms'} in $a^2$.`, '$1$ Å $= 10^{-8}$ cm.'],
      sol: G4(`$N = \\dfrac{${per}}{a^3}$, $\\;N_{(100)} = \\dfrac{${plane}}{a^2}$.`, `Count: ${per} per cell; ${plane} on a face.`,
        `$$N = \\frac{${per}}{\\left(${a}\\times10^{-8}\\,\\text{cm}\\right)^3}, \\qquad N_{(100)} = \\frac{${plane}}{\\left(${a}\\times10^{-8}\\,\\text{cm}\\right)^2}$$`,
        `$N = ${f(N)}${CM3}$, $N_{(100)} = ${f(Np)}\\,\\text{cm}^{-2}$.`),
    };
  };

  GENS.semi_effmass = () => {
    const mr = pick([0.067, 0.1, 0.15, 0.26, 0.5, 1.1]), A = S.hbar ** 2 / (2 * mr * S.m0);
    const Ar = +A.toPrecision(2), m = S.hbar ** 2 / (2 * Ar) / S.m0;
    return {
      title: 'Effective mass from E(k)',
      q: md`Near a conduction-band minimum $E(k) = E_c + Ak^2$ with $A = ${p(Ar)}\,\text{J·m}^2$. Find $m^*/m_0$ ($\hbar = 1.055\times10^{-34}$ J·s, $m_0 = 9.11\times10^{-31}$ kg).`,
      parts: [T({ lbl: 'm^*/m_0', ans: m })],
      hints: ['$m^* = \\hbar^2/(d^2E/dk^2)$ and $d^2E/dk^2 = 2A$.'],
      sol: G4('$m^* = \\dfrac{\\hbar^2}{d^2E/dk^2}$.', '$d^2E/dk^2 = 2A$, so $\\dfrac{m^*}{m_0} = \\dfrac{\\hbar^2}{2Am_0}$.',
        `$$\\frac{m^*}{m_0} = \\frac{\\left(1.055\\times10^{-34}\\,\\text{J·s}\\right)^2}{2\\left(${p(Ar)}\\,\\text{J·m}^2\\right)\\left(9.11\\times10^{-31}\\,\\text{kg}\\right)}$$`, `$m^* = ${f(m)}\\,m_0$.`),
    };
  };
})();

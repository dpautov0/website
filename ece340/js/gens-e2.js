/* gens-e2.js — randomized Exam 2 problems (junctions, Ch. 5 and 8), in the graded format of gens-semi.js: governing
   equation, symbolic solution, substitution with units, answer to 3 significant figures. Constants come from semi.js.

   Equilibrium:  e2_v0, e2_depl          Bias:      e2_edge, e2_diode, e2_comp, e2_neutral, e2_narrow
   Reverse:      e2_break, e2_cj         Switching: e2_cs, e2_tsd
   Light, M–S:   e2_solar, e2_ff, e2_ms  Ch. 4:     e2_hs */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri } = U;
  const f = (x) => S.f(x), p = (x) => S.p(x);
  const CM3 = '\\,\\text{cm}^{-3}', Q = '1.6\\times10^{-19}\\,\\text{C}';
  const q = 1.6e-19, kT = 0.0259, ln = Math.log, exp = Math.exp, sqrt = Math.sqrt;
  const EPS = 11.8 * 8.85e-14, EPSt = '(11.8)(8.85\\times10^{-14}\\,\\text{F/cm})';
  const ni = 1.5e10;
  const mant = () => pick([1, 2, 2.5, 4, 5]);
  const dec = (lo, hi) => mant() * Math.pow(10, ri(lo, hi));
  const G4 = (eq, sym, sub, ans) => [`**1. Governing equation.** ${eq}`, `**2. Solve symbolically.** ${sym}`, `**3. Substitute, with units.** ${sub}`, `**4. Answer (3 s.f.).** ${ans}`].join('\n\n');
  const T = (o) => Object.assign({ tol: { rel: 0.015 } }, o);
  const v0 = (Na, Nd, n = ni) => kT * ln(Na * Nd / (n * n));

  // ======================================================================== equilibrium
  GENS.e2_v0 = () => {
    const m = pick(['Si', 'Si', 'GaAs']), n = m === 'Si' ? ni : 2.1e6;
    const Na = dec(15, 18), Nd = dec(14, 17);
    const dn = kT * ln(Nd / n), dp = kT * ln(Na / n), V0 = v0(Na, Nd, n);
    return {
      title: 'Contact potential',
      q: md`An abrupt ${m} p-n junction at 300 K ($n_i = ${p(n)}${CM3}$) has $N_a = ${p(Na)}${CM3}$ and $N_d = ${p(Nd)}${CM3}$. Find where $E_F$ sits on each side and the contact potential $V_0$.`,
      parts: [T({ lbl: '(E_F - E_i)_n', ans: dn, unit: 'eV' }), T({ lbl: '(E_i - E_F)_p', ans: dp, unit: 'eV' }), T({ lbl: 'V_0', ans: V0, unit: 'V' })],
      hints: [md`Each side: $kT\ln(N/n_i)$.`, md`$qV_0$ is the sum of the two: the Fermi levels must line up, so the bands bend by their difference.`],
      sol: G4(md`$E_F - E_i = kT\ln\frac{N_d}{n_i}$ (n side), $E_i - E_F = kT\ln\frac{N_a}{n_i}$ (p side), $qV_0 = (E_F - E_i)_n + (E_i - E_F)_p$.`,
        md`$V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$.`,
        md`$$(E_F - E_i)_n = (0.0259\,\text{eV})\ln\frac{${p(Nd)}}{${p(n)}} \qquad (E_i - E_F)_p = (0.0259\,\text{eV})\ln\frac{${p(Na)}}{${p(n)}}$$`,
        md`$(E_F - E_i)_n = ${f(dn)}$ eV, $(E_i - E_F)_p = ${f(dp)}$ eV, $V_0 = ${f(V0)}$ V. Check: below $E_g/q$ = ${m === 'Si' ? '1.12' : '1.43'} V.`),
    };
  };

  GENS.e2_depl = () => {
    const Na = dec(15, 18), Nd = dec(14, 17), VR = pick([0, 0, 2, 5, 10]);
    const V0 = v0(Na, Nd), Vt = V0 + VR;
    const W = sqrt(2 * EPS * Vt / q * (Na + Nd) / (Na * Nd)), xn = W * Na / (Na + Nd), xp = W * Nd / (Na + Nd), E0 = q * Nd * xn / EPS;
    return {
      title: 'The depletion region',
      q: md`Abrupt Si p-n junction, 300 K, $N_a = ${p(Na)}$ and $N_d = ${p(Nd)}${CM3}$, ${VR ? `reverse biased at ${VR} V` : 'at equilibrium'}. $\epsilon_{Si} = 11.8\epsilon_0$, $n_i = 1.5\times10^{10}${CM3}$. Find $V_0$, $W$, $x_{n0}$, $x_{p0}$ and the peak field.`,
      parts: [T({ lbl: 'V_0', ans: V0, unit: 'V' }), T({ lbl: 'W', ans: W * 1e4, unit: 'μm' }), T({ lbl: 'x_{n0}', ans: xn * 1e4, unit: 'μm' }), T({ lbl: 'x_{p0}', ans: xp * 1e4, unit: 'μm' }), T({ lbl: '|\\mathscr{E}_0|', ans: E0, unit: 'V/cm' })],
      hints: [md`Use the total junction voltage $V_0 ${VR ? `+ ${VR}` : ''}$.`, md`Split $W$ in the ratio $x_{n0} : x_{p0} = N_a : N_d$.`, md`$\mathscr{E}_0 = qN_dx_{n0}/\epsilon = 2(V_0 - V)/W$.`],
      sol: G4(md`$V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$, $W = \sqrt{\frac{2\epsilon(V_0 - V)}{q}\frac{N_a + N_d}{N_aN_d}}$, $N_ax_{p0} = N_dx_{n0}$, $\mathscr{E}_0 = \frac{qN_dx_{n0}}{\epsilon}$.`,
        md`$x_{n0} = W\frac{N_a}{N_a + N_d}$, $x_{p0} = W\frac{N_d}{N_a + N_d}$, $\mathscr{E}_0 = \frac{2(V_0 - V)}{W}$, with $V = ${VR ? -VR : 0}$ V.`,
        md`$$W = \sqrt{\frac{2${EPSt}(${f(Vt)}\,\text{V})}{${Q}}\cdot\frac{${p(Na)} + ${p(Nd)}}{(${p(Na)})(${p(Nd)})}\,\text{cm}^3}$$`,
        md`$V_0 = ${f(V0)}$ V; $W = ${f(W * 1e4)}$ μm; $x_{n0} = ${f(xn * 1e4)}$ μm; $x_{p0} = ${f(xp * 1e4)}$ μm; $\lvert\mathscr{E}_0\rvert = ${f(E0)}$ V/cm, pointing n → p. The depletion region lies mostly in the ${Na > Nd ? 'n' : Na < Nd ? 'p' : 'both'} side.`),
    };
  };

  // ======================================================================== bias
  GENS.e2_edge = () => {
    const Na = dec(15, 18), Nd = dec(14, 17), fwd = Math.random() < 0.7;
    const V = fwd ? pick([0.3, 0.4, 0.5, 0.55, 0.6]) : -pick([0.5, 1, 2, 5]);
    const pn = ni * ni / Nd, np = ni * ni / Na, e = exp(V / kT) - 1;
    const dp = pn * e, dn = np * e;
    return {
      title: 'Excess carriers at the depletion edges',
      q: md`Si p-n junction at 300 K, $N_a = ${p(Na)}$, $N_d = ${p(Nd)}${CM3}$, ${fwd ? `forward` : `reverse`} biased at ${Math.abs(V)} V. Find the equilibrium minority densities and the **excess** minority densities at the two depletion edges.`,
      parts: [T({ lbl: 'p_n', ans: pn, unit: 'cm^{-3}' }), T({ lbl: 'n_p', ans: np, unit: 'cm^{-3}' }), T({ lbl: '\\Delta p_n = \\delta p(x_{n0})', ans: dp, unit: 'cm^{-3}' }), T({ lbl: '\\Delta n_p = \\delta n(-x_{p0})', ans: dn, unit: 'cm^{-3}' })],
      hints: [md`$p_n = n_i^2/N_d$, $n_p = n_i^2/N_a$.`, md`Law of the junction: $\Delta p_n = p_n(e^{qV/kT} - 1)$ with $V ${fwd ? '> 0' : '< 0'}$.`],
      sol: G4(md`$\Delta p_n = p_n\left(e^{qV/kT} - 1\right)$, $\Delta n_p = n_p\left(e^{qV/kT} - 1\right)$.`,
        md`$p_n = \frac{n_i^2}{N_d}$, $n_p = \frac{n_i^2}{N_a}$, $V = ${V}$ V.`,
        md`$$p_n = \frac{(1.5\times10^{10})^2}{${p(Nd)}} = ${f(pn)}${CM3} \qquad e^{qV/kT} - 1 = e^{${V}/0.0259} - 1 = ${f(e)}$$`,
        md`$p_n = ${f(pn)}$, $n_p = ${f(np)}$, $\Delta p_n = ${f(dp)}$, $\Delta n_p = ${f(dn)}${CM3}$. ${fwd ? `Low level? $\\Delta p_n/N_d = ${f(dp / Nd)}$ ${dp / Nd < 0.1 ? 'is ≪ 1, so yes' : 'is not ≪ 1: high-level injection, the simple theory is stretched'}.` : 'Negative: reverse bias empties the edges (≈ $-p_n$ and $-n_p$).'}`),
    };
  };

  GENS.e2_diode = () => {
    const Na = dec(16, 18), Nd = dec(15, 17), A = pick([1e-4, 1e-3, 1e-2]);
    const Dp = pick([10, 12, 25]), Dn = pick([20, 25, 35]), tp = pick([0.1, 1, 10]) * 1e-6, tn = pick([0.1, 1, 10]) * 1e-6;
    const V = pick([0.4, 0.5, 0.55, 0.6, 0.65]);
    const Lp = sqrt(Dp * tp), Ln = sqrt(Dn * tn), pn = ni * ni / Nd, np = ni * ni / Na;
    const Ip0 = q * A * Dp / Lp * pn, In0 = q * A * Dn / Ln * np, I0 = Ip0 + In0, I = I0 * (exp(V / kT) - 1);
    return {
      title: 'The diode equation',
      q: md`A long Si p-n diode at 300 K: $A = ${p(A)}$ cm², $N_a = ${p(Na)}$, $N_d = ${p(Nd)}${CM3}$, $D_p = ${Dp}$ and $D_n = ${Dn}$ cm²/s, $\tau_p = ${p(tp * 1e6)}$ μs, $\tau_n = ${p(tn * 1e6)}$ μs. Find $L_p$, $L_n$, $I_0$, the current at $V = ${V}$ V, and the fraction of it carried by holes injected into the n side.`,
      parts: [T({ lbl: 'L_p', ans: Lp * 1e4, unit: 'μm' }), T({ lbl: 'L_n', ans: Ln * 1e4, unit: 'μm' }), T({ lbl: 'I_0', ans: I0, unit: 'A' }), T({ lbl: `I(${V}\\,\\text{V})`, ans: I, unit: 'A' }), T({ lbl: 'I_p/I', ans: Ip0 / I0, unit: '' })],
      hints: [md`$L = \sqrt{D\tau}$.`, md`$I_0 = qA\left(\frac{D_p}{L_p}p_n + \frac{D_n}{L_n}n_p\right)$ with $p_n = n_i^2/N_d$, $n_p = n_i^2/N_a$.`, md`The hole share is the first term over the sum; it doesn't depend on $V$.`],
      sol: G4(md`$I = I_0\left(e^{qV/kT} - 1\right)$, $I_0 = qA\left(\frac{D_p}{L_p}p_n + \frac{D_n}{L_n}n_p\right)$, $L = \sqrt{D\tau}$.`,
        md`$\frac{I_p}{I} = \frac{(D_p/L_p)p_n}{(D_p/L_p)p_n + (D_n/L_n)n_p}$.`,
        md`$$L_p = \sqrt{(${Dp}\,\tfrac{\text{cm}^2}{\text{s}})(${p(tp)}\,\text{s})} = ${f(Lp)}\,\text{cm} \qquad I_{p0} = (${Q})(${p(A)}\,\text{cm}^2)\frac{${Dp}}{${f(Lp)}}(${f(pn)}) = ${f(Ip0)}\,\text{A} \qquad I_{n0} = ${f(In0)}\,\text{A}$$`,
        md`$L_p = ${f(Lp * 1e4)}$ μm, $L_n = ${f(Ln * 1e4)}$ μm, $I_0 = ${f(I0)}$ A, $I = ${f(I)}$ A at ${V} V; holes carry ${f(100 * Ip0 / I0)}% (${Ip0 > In0 ? 'the n side is lighter' : 'the p side is lighter, so electrons dominate'}).`),
    };
  };

  // minority and majority components at a point in the n side of a long p⁺-n diode
  GENS.e2_comp = () => {
    const I = pick([1, 2, 5, 10]), k = pick([0.5, 1, 2, 3]);
    const Ip = I * exp(-k), In = I - Ip;
    return {
      title: 'Minority and majority currents',
      q: md`A long p⁺-n diode carries ${I} mA forward (electron injection into the p⁺ side is negligible). At a distance $x_n = ${k}L_p$ into the neutral n side, find the hole current and the electron current.`,
      parts: [T({ lbl: 'I_p(x_n)', ans: Ip, unit: 'mA' }), T({ lbl: 'I_n(x_n)', ans: In, unit: 'mA' })],
      hints: ['At the depletion edge all of the current is holes.', md`$I_p(x_n) = I_p(0)e^{-x_n/L_p}$; the total is the same everywhere.`],
      sol: G4(md`$I_p(x_n) = qA\frac{D_p}{L_p}\Delta p_ne^{-x_n/L_p} = I_p(0)e^{-x_n/L_p}$, $I_n(x_n) = I - I_p(x_n)$.`,
        md`p⁺-n: $I_p(0) \approx I$.`, md`$$I_p = (${I}\,\text{mA})e^{-${k}} \qquad I_n = ${I}\,\text{mA} - I_p$$`,
        md`$I_p = ${f(Ip)}$ mA, $I_n = ${f(In)}$ mA. Electrons flow in from the contact to recombine with the injected holes; by $5L_p$ the current is essentially all majority electrons.`),
    };
  };

  GENS.e2_neutral = () => {
    const J = pick([1, 5, 10, 50]), Nd = dec(15, 17), mu = pick([1000, 1200, 1350]), d = pick([50, 100, 200]);
    const E = J / (q * mu * Nd), Vd = E * d * 1e-4;
    return {
      title: 'Field in the neutral region (wide base)',
      q: md`A wide-base p⁺-n Si diode carries $J = ${J}$ A/cm² forward. The n side has $N_d = ${p(Nd)}${CM3}$ and $\mu_n = ${mu}$ cm²/V·s. Far from the junction (many $L_p$), find the electric field and the voltage drop across ${d} μm of that neutral region.`,
      parts: [T({ lbl: '\\mathscr{E}', ans: E, unit: 'V/cm' }), T({ lbl: '\\Delta V', ans: Vd * 1e3, unit: 'mV' })],
      hints: [md`Far from the junction the injected holes have recombined; the current is all majority-electron **drift**.`],
      sol: G4(md`$J = J_n = q\mu_nn\mathscr{E}$ with $n \approx N_d$ (no gradient, no excess holes left).`, md`$\mathscr{E} = \frac{J}{q\mu_nN_d}$, $\Delta V = \mathscr{E}d$.`,
        md`$$\mathscr{E} = \frac{${J}\,\text{A/cm}^2}{(${Q})(${mu}\,\tfrac{\text{cm}^2}{\text{V·s}})(${p(Nd)}${CM3})}$$`,
        md`$\mathscr{E} = ${f(E)}$ V/cm, $\Delta V = ${f(Vd * 1e3)}$ mV: negligible next to the junction voltage, which is why we put all of $V$ across the depletion region.`),
    };
  };

  GENS.e2_narrow = () => {
    const Nd = dec(15, 17), l = pick([0.5, 1, 2, 5]), Dp = pick([10, 12]), A = pick([1e-4, 1e-3]), V = pick([0.5, 0.55, 0.6, 0.65]);
    const pn = ni * ni / Nd, dp = pn * (exp(V / kT) - 1), lc = l * 1e-4;
    const I = q * A * Dp * dp / lc, Qp = 0.5 * q * A * lc * dp, tt = lc * lc / (2 * Dp), Vb = kT * dp / Nd;
    return {
      title: 'Narrow-base diode',
      q: md`A p⁺-n Si diode at 300 K has a neutral n base only $\ell = ${l}$ μm wide ($\ll L_p$), ending at an n⁺ ohmic contact. $N_d = ${p(Nd)}${CM3}$, $D_p = ${Dp}$ cm²/s, $\mu_n = 1350$, $A = ${p(A)}$ cm², $V = ${V}$ V. Find $\Delta p_n$, the current, the stored hole charge, the base transit time, and the voltage drop across the neutral base.`,
      parts: [T({ lbl: '\\Delta p_n', ans: dp, unit: 'cm^{-3}' }), T({ lbl: 'I', ans: I, unit: 'A' }), T({ lbl: 'Q_p', ans: Qp, unit: 'C' }), T({ lbl: 't_t', ans: tt * 1e12, unit: 'ps' }), T({ lbl: 'V_{base}', ans: Vb * 1e6, unit: 'μV' })],
      hints: [md`Straight line from $\Delta p_n$ to 0 across $\ell$.`, md`$Q_p$ is the triangle; $t_t = Q_p/I = \ell^2/2D_p$.`, md`Quasi-neutrality: electrons have the same gradient as holes, but carry no current, so a field cancels their diffusion: $V = \frac{kT}{q}\frac{\Delta p_n}{N_d}$.`],
      sol: G4(md`$\Delta p_n = p_n(e^{qV/kT} - 1)$, $I = qAD_p\frac{\Delta p_n}{\ell}$, $Q_p = \frac12qA\ell\Delta p_n$, $J_n = q\mu_nN_d\mathscr{E} + qD_n\frac{d\delta n}{dx} \approx 0$.`,
        md`$t_t = \frac{Q_p}{I} = \frac{\ell^2}{2D_p}$; $\mathscr{E} = \frac{D_n}{\mu_n}\frac{\Delta p_n}{N_d\ell}$ so $V_{base} = \mathscr{E}\ell = \frac{kT}{q}\frac{\Delta p_n}{N_d}$.`,
        md`$$\Delta p_n = \frac{(1.5\times10^{10})^2}{${p(Nd)}}\left(e^{${V}/0.0259} - 1\right) \qquad I = (${Q})(${p(A)})(${Dp})\frac{${f(dp)}}{${f(lc)}\,\text{cm}}$$`,
        md`$\Delta p_n = ${f(dp)}${CM3}$, $I = ${f(I)}$ A, $Q_p = ${f(Qp)}$ C, $t_t = ${f(tt * 1e12)}$ ps, $V_{base} = ${f(Vb * 1e6)}$ μV${dp / Nd > 0.1 ? ' (but $\\Delta p_n$ is not ≪ $N_d$ here: high-level injection)' : ': tiny, because $\\Delta p_n \\ll N_d$'}.`),
    };
  };

  // ======================================================================== reverse bias
  GENS.e2_break = () => {
    const Nd = pick([1e15, 2e15, 5e15, 1e16, 2e16, 5e16, 1e17, 5e17, 1e18]), Ec = Nd >= 5e17 ? 1e6 : pick([3e5, 4e5, 5e5]);
    const Vbr = EPS * Ec * Ec / (2 * q * Nd), W = 2 * Vbr / Ec;
    const mech = Vbr < 4.5 ? 0 : Vbr > 6.7 ? 1 : 2;
    return {
      title: 'Breakdown voltage',
      q: md`A Si p⁺-n junction has $N_d = ${p(Nd)}${CM3}$. Breakdown occurs when the peak field reaches $\mathscr{E}_{crit} = ${p(Ec)}$ V/cm. Neglect $V_0$ next to $V_{br}$. Find $V_{br}$, the depletion width at breakdown, and the likely mechanism.`,
      parts: [T({ lbl: 'V_{br}', ans: Vbr, unit: 'V' }), T({ lbl: 'W_{br}', ans: W * 1e4, unit: 'μm' }), { lbl: 'Mechanism', mc: ['Zener (tunneling)', 'avalanche', 'both / mixed'], a: mech, why: [mech === 0 ? null : 'Zener needs $V_{br}$ below about $4E_g/q$ ≈ 4.5 V in Si.', mech === 1 ? null : 'Avalanche dominates above about $6E_g/q$ ≈ 6.7 V.', mech === 2 ? null : 'Only between about 4.5 and 6.7 V in Si.'] }],
      hints: [md`One-sided: $\mathscr{E}_0 = \sqrt{2qN_dV/\epsilon}$; set it equal to $\mathscr{E}_{crit}$.`, md`At breakdown the triangle has $V = \frac12\mathscr{E}_{crit}W$.`],
      sol: G4(md`$\mathscr{E}_0 = \frac{qN_dx_{n0}}{\epsilon}$ and $V = \frac12\mathscr{E}_0W$ with $W \approx x_{n0}$ (p⁺-n).`, md`$V_{br} = \frac{\epsilon\mathscr{E}_{crit}^2}{2qN_d}$, $W_{br} = \frac{2V_{br}}{\mathscr{E}_{crit}}$.`,
        md`$$V_{br} = \frac{${EPSt}(${p(Ec)}\,\text{V/cm})^2}{2(${Q})(${p(Nd)}${CM3})}$$`,
        md`$V_{br} = ${f(Vbr)}$ V, $W_{br} = ${f(W * 1e4)}$ μm: ${['Zener: a thin, heavily doped junction (negative temperature coefficient)', 'avalanche (positive temperature coefficient)', 'mixed; the temperature coefficient is near zero'][mech]}.`),
    };
  };

  GENS.e2_cj = () => {
    if (Math.random() < 0.5) {
      const Na = pick([1e18, 1e19]), Nd = dec(15, 16), A = pick([1e-4, 1e-3]), VR = pick([0, 1, 5, 10]);
      const V0 = v0(Na, Nd), W = sqrt(2 * EPS * (V0 + VR) / (q * Nd)), C = EPS * A / W;
      return {
        title: 'Junction capacitance',
        q: md`A Si p⁺-n diode ($N_a = ${p(Na)}$, $N_d = ${p(Nd)}${CM3}$, $A = ${p(A)}$ cm²) is ${VR ? `reverse biased at ${VR} V` : 'at zero bias'}. Find $V_0$, $W$ and $C_j$.`,
        parts: [T({ lbl: 'V_0', ans: V0, unit: 'V' }), T({ lbl: 'W', ans: W * 1e4, unit: 'μm' }), T({ lbl: 'C_j', ans: C * 1e12, unit: 'pF' })],
        hints: [md`One-sided: $W = \sqrt{2\epsilon(V_0 - V)/qN_d}$.`, md`$C_j = \epsilon A/W$.`],
        sol: G4(md`$C_j = \frac{\epsilon A}{W}$, $W = \sqrt{\frac{2\epsilon(V_0 - V)}{qN_d}}$ (p⁺-n).`, md`$C_j = A\sqrt{\frac{q\epsilon N_d}{2(V_0 - V)}}$.`,
          md`$$W = \sqrt{\frac{2${EPSt}(${f(V0 + VR)}\,\text{V})}{(${Q})(${p(Nd)}${CM3})}} \qquad C_j = \frac{(1.044\times10^{-12}\,\text{F/cm})(${p(A)}\,\text{cm}^2)}{${f(W)}\,\text{cm}}$$`,
          md`$V_0 = ${f(V0)}$ V, $W = ${f(W * 1e4)}$ μm, $C_j = ${f(C * 1e12)}$ pF.`),
      };
    }
    const Nd = dec(15, 16), A = pick([1e-4, 1e-3]), V0 = pick([0.7, 0.75, 0.8, 0.85]), V1 = pick([1, 2]), V2 = pick([5, 10]);
    const C = (V) => A * sqrt(q * EPS * Nd / (2 * (V0 + V)));
    const C1 = +(C(V1) * 1e12).toPrecision(3), C2 = +(C(V2) * 1e12).toPrecision(3);
    const slope = (1 / (C2 * C2) - 1 / (C1 * C1)) / (V2 - V1) * 1e24, NdF = 2 / (q * EPS * A * A * slope), V0F = (1e24 / (C1 * C1)) / slope - V1;
    return {
      title: 'Doping from C–V',
      q: md`A Si p⁺-n diode with $A = ${p(A)}$ cm² measures $C = ${C1}$ pF at $V_R = ${V1}$ V and $C = ${C2}$ pF at $V_R = ${V2}$ V. Find $N_d$ and $V_0$ from $1/C^2$ vs $V_R$.`,
      parts: [T({ lbl: 'N_d', ans: NdF, unit: 'cm^{-3}', tol: { rel: 0.03 } }), T({ lbl: 'V_0', ans: V0F, unit: 'V', tol: { abs: 0.03 } })],
      hints: [md`$\frac{1}{C^2} = \frac{2(V_0 + V_R)}{q\epsilon A^2N_d}$: a straight line in $V_R$.`, md`Slope $= \frac{2}{q\epsilon A^2N_d}$; the line hits zero at $V_R = -V_0$.`],
      sol: G4(md`$\frac{1}{C_j^2} = \frac{2(V_0 + V_R)}{q\epsilon A^2N_d}$.`, md`$N_d = \frac{2}{q\epsilon A^2\cdot\text{slope}}$, $V_0 = \frac{1/C_1^2}{\text{slope}} - V_{R1}$.`,
        md`$$\text{slope} = \frac{1/(${C2}\,\text{pF})^2 - 1/(${C1}\,\text{pF})^2}{${V2 - V1}\,\text{V}} = ${f(slope)}\,\text{F}^{-2}\text{V}^{-1}$$`,
        md`$N_d = ${f(NdF)}${CM3}$, $V_0 = ${f(V0F)}$ V. A steeper line means lighter doping.`),
    };
  };

  // ======================================================================== forward-bias storage and switching
  GENS.e2_cs = () => {
    const I = pick([0.5, 1, 2, 5, 10]) * 1e-3, tp = pick([0.1, 0.5, 1, 2, 10]) * 1e-6;
    const Qp = I * tp, Gs = I / kT, Cs = Qp / kT;
    return {
      title: 'Stored charge and diffusion capacitance',
      q: md`A long p⁺-n diode carries $I = ${p(I * 1e3)}$ mA forward at 300 K, with $\tau_p = ${p(tp * 1e6)}$ μs. Find the stored hole charge, the small-signal conductance $G_s$, and the charge-storage capacitance $C_s$.`,
      parts: [T({ lbl: 'Q_p', ans: Qp, unit: 'C' }), T({ lbl: 'G_s', ans: Gs * 1e3, unit: 'mS' }), T({ lbl: 'C_s', ans: Cs * 1e9, unit: 'nF' })],
      hints: [md`Steady state: every stored hole recombines in $\tau_p$ on average, so $I = Q_p/\tau_p$.`, md`$G_s = dI/dV = \frac{q}{kT}I$; $C_s = dQ_p/dV = \frac{q}{kT}Q_p = G_s\tau_p$.`],
      sol: G4(md`$Q_p = I_p\tau_p$, $G_s = \frac{q}{kT}I$, $C_s = \frac{q}{kT}I\tau_p$.`, md`$C_s = G_s\tau_p$.`,
        md`$$Q_p = (${p(I)}\,\text{A})(${p(tp)}\,\text{s}) \qquad G_s = \frac{${p(I)}\,\text{A}}{0.0259\,\text{V}} \qquad C_s = (${f(Gs)}\,\text{S})(${p(tp)}\,\text{s})$$`,
        md`$Q_p = ${f(Qp)}$ C, $G_s = ${f(Gs * 1e3)}$ mS ($r = ${f(1 / Gs)}$ Ω), $C_s = ${f(Cs * 1e9)}$ nF.`),
    };
  };

  GENS.e2_tsd = () => {
    const If = pick([1, 2, 5, 10]), Ir = pick([0.5, 1, 2, 5, 10]), tp = pick([0.1, 0.5, 1, 2]);
    const t = tp * ln(1 + If / Ir);
    return {
      title: 'Storage delay time',
      q: md`A p⁺-n diode with $\tau_p = ${tp}$ μs carries $I_f = ${If}$ mA, then the circuit switches it so a reverse current $I_r = ${Ir}$ mA flows. Estimate the storage delay time (charge-control approximation).`,
      parts: [T({ lbl: 't_{sd}', ans: t * 1e3, unit: 'ns' })],
      hints: [md`Before the switch, $Q_p = I_f\tau_p$.`, md`After: $\frac{dQ_p}{dt} = -I_r - \frac{Q_p}{\tau_p}$; find when $Q_p$ reaches zero.`],
      sol: G4(md`$\frac{dQ_p}{dt} = -I_r - \frac{Q_p}{\tau_p}$, $Q_p(0) = I_f\tau_p$.`, md`$Q_p(t) = \tau_p\left[(I_f + I_r)e^{-t/\tau_p} - I_r\right] = 0 \Rightarrow t_{sd} = \tau_p\ln\left(1 + \frac{I_f}{I_r}\right)$.`,
        md`$$t_{sd} = (${tp}\,\mu\text{s})\ln\left(1 + \frac{${If}}{${Ir}}\right)$$`,
        md`$t_{sd} = ${f(t * 1e3)}$ ns. Bigger $I_r$ or shorter $\tau_p$ → faster turn-off.`),
    };
  };

  // ======================================================================== light
  GENS.e2_solar = () => {
    const A = pick([1, 2, 4]), g = pick([1e19, 2e19, 5e19, 1e20]), Lp = pick([20, 50, 100]), Ln = pick([10, 20, 50]), W = pick([0.5, 1, 2]);
    const Ith = pick([1e-12, 5e-12, 1e-11, 1e-10]) * A, FF = pick([0.7, 0.75, 0.8]);
    const Iop = q * A * g * (Lp + Ln + W) * 1e-4, Voc = kT * ln(1 + Iop / Ith), P = FF * Iop * Voc;
    return {
      title: 'Solar cell',
      q: md`An illuminated Si p-n solar cell: $A = ${A}$ cm², uniform optical generation $g_{op} = ${p(g)}$ EHP/cm³·s, $L_p = ${Lp}$ μm, $L_n = ${Ln}$ μm, $W = ${W}$ μm, dark saturation current $I_{th} = ${p(Ith)}$ A, fill factor ${FF}. Find $I_{sc}$, $V_{oc}$ and $P_{max}$.`,
      parts: [T({ lbl: 'I_{sc}', ans: Iop * 1e3, unit: 'mA' }), T({ lbl: 'V_{oc}', ans: Voc, unit: 'V' }), T({ lbl: 'P_{max}', ans: P * 1e3, unit: 'mW' })],
      hints: [md`$I_{op} = qAg_{op}(L_p + L_n + W)$: pairs made within a diffusion length of the junction are collected.`, md`$I = I_{th}(e^{qV/kT} - 1) - I_{op}$. Short circuit: $V = 0$. Open circuit: $I = 0$.`],
      sol: G4(md`$I = I_{th}\left(e^{qV/kT} - 1\right) - I_{op}$, $I_{op} = qAg_{op}(L_p + L_n + W)$, $P_{max} = FF\cdot I_{sc}V_{oc}$.`,
        md`$I_{sc} = I_{op}$ (magnitude); $V_{oc} = \frac{kT}{q}\ln\left(1 + \frac{I_{op}}{I_{th}}\right)$.`,
        md`$$I_{op} = (${Q})(${A}\,\text{cm}^2)(${p(g)}\,\text{cm}^{-3}\text{s}^{-1})(${Lp + Ln + W}\times10^{-4}\,\text{cm}) \qquad V_{oc} = 0.0259\ln\left(1 + \frac{${f(Iop)}}{${p(Ith)}}\right)$$`,
        md`$I_{sc} = ${f(Iop * 1e3)}$ mA, $V_{oc} = ${f(Voc)}$ V, $P_{max} = ${f(P * 1e3)}$ mW.`),
    };
  };

  GENS.e2_ff = () => {
    const Isc = pick([25, 30, 35, 40]), Voc = pick([0.55, 0.6, 0.65]), A = pick([1, 2]);
    const Vm = +(Voc - pick([0.08, 0.09, 0.1])).toFixed(2), Im = +(Isc * pick([0.9, 0.92, 0.94])).toFixed(1);
    const FF = Vm * Im / (Voc * Isc), eff = Vm * Im / (100 * A);
    return {
      title: 'Fill factor and efficiency',
      q: md`A ${A} cm² solar cell under 100 mW/cm² has $I_{sc} = ${Isc}$ mA and $V_{oc} = ${Voc}$ V. Its maximum-power point is $V_m = ${Vm}$ V, $I_m = ${Im}$ mA. Find $P_{max}$, the fill factor, and the efficiency.`,
      parts: [T({ lbl: 'P_{max}', ans: Vm * Im, unit: 'mW' }), T({ lbl: 'FF', ans: FF, unit: '' }), T({ lbl: '\\eta', ans: eff * 100, unit: '%' })],
      hints: [md`$FF = \frac{V_mI_m}{V_{oc}I_{sc}}$; $\eta = P_{max}/P_{in}$ with $P_{in} = (100\,\text{mW/cm}^2)A$.`],
      sol: G4(md`$P_{max} = V_mI_m$, $FF = \frac{V_mI_m}{V_{oc}I_{sc}}$, $\eta = \frac{P_{max}}{P_{in}}$.`, md`As written.`,
        md`$$P_{max} = (${Vm}\,\text{V})(${Im}\,\text{mA}) \qquad FF = \frac{${f(Vm * Im)}}{(${Voc})(${Isc})} \qquad \eta = \frac{${f(Vm * Im)}\,\text{mW}}{${100 * A}\,\text{mW}}$$`,
        md`$P_{max} = ${f(Vm * Im)}$ mW, $FF = ${f(FF)}$, $\eta = ${f(eff * 100)}$%.`),
    };
  };

  GENS.e2_ms = () => {
    const phim = pick([4.3, 4.5, 4.75, 5.0, 5.1, 5.3]), chi = 4.05, Nd = dec(15, 17), Nc = 2.8e19;
    const EcEF = kT * ln(Nc / Nd), phis = chi + EcEF, rect = phim > phis;
    return {
      title: 'Metal–semiconductor contact',
      q: md`A metal with $\phi_m = ${phim}$ V contacts n-type Si ($\chi = 4.05$ V, $N_c = 2.8\times10^{19}${CM3}$) doped $N_d = ${p(Nd)}${CM3}$, 300 K. Find $E_c - E_F$, $\phi_s$, the barrier $\phi_B$ seen from the metal, the built-in voltage, and the contact type.`,
      parts: [T({ lbl: 'E_c - E_F', ans: EcEF, unit: 'eV' }), T({ lbl: '\\phi_s', ans: phis, unit: 'V' }), T({ lbl: '\\phi_m - \\chi', ans: phim - chi, unit: 'V' }), T({ lbl: '\\phi_m - \\phi_s', ans: phim - phis, unit: 'V', tol: { abs: 0.01 } }),
        { lbl: 'Contact', mc: ['rectifying (Schottky)', 'ohmic'], a: rect ? 0 : 1, why: [rect ? null : md`$\phi_m < \phi_s$ on n-type: electrons accumulate at the surface, no barrier.`, rect ? md`$\phi_m > \phi_s$ on n-type: electrons leave, a depletion region and a barrier form.` : null] }],
      hints: [md`$E_c - E_F = kT\ln(N_c/N_d)$; $\phi_s = \chi + (E_c - E_F)/q$.`, md`n-type: $\phi_m > \phi_s$ rectifying, $\phi_m < \phi_s$ ohmic.`],
      sol: G4(md`$E_c - E_F = kT\ln\frac{N_c}{N_d}$, $\phi_s = \chi + \frac{E_c - E_F}{q}$, $\phi_B = \phi_m - \chi$, $V_0 = \phi_m - \phi_s$.`, md`As written.`,
        md`$$E_c - E_F = (0.0259\,\text{eV})\ln\frac{2.8\times10^{19}}{${p(Nd)}}$$`,
        md`$E_c - E_F = ${f(EcEF)}$ eV, $\phi_s = ${f(phis)}$ V, $\phi_m - \chi = ${f(phim - chi)}$ V, $\phi_m - \phi_s = ${f(phim - phis)}$ V: ${rect ? `**rectifying**, barrier $\\phi_B = ${f(phim - chi)}$ V from the metal and $V_0 = ${f(phim - phis)}$ V from the semiconductor.` : '**ohmic** (negative "barrier": electrons accumulate).'}`),
    };
  };

  // ======================================================================== Ch. 4: Haynes–Shockley
  GENS.e2_hs = () => {
    const L = pick([0.5, 0.8, 1]), E = pick([2, 5, 10]), mu = pick([400, 450, 480, 1800]);
    const vd = mu * E, td = L / vd, D = mu * 0.0259, dx = 4 * sqrt(D * td), dt = +(dx / vd * 1e6).toPrecision(3);
    const Dm = Math.pow(dt * 1e-6 * vd, 2) / (16 * td);
    return {
      title: 'Haynes–Shockley',
      q: md`In a Haynes–Shockley experiment on an n-type bar, the detector is $L = ${L}$ cm from the injection point and the field is $${E}$ V/cm. The hole pulse peaks at $t_d = ${S.f(td * 1e6, 3)}$ μs and its width (between the $1/e$ points) at the detector is $\Delta t = ${dt}$ μs. Find $v_d$, $\mu_p$ and $D_p$, and check the Einstein relation.`,
      parts: [T({ lbl: 'v_d', ans: L / +(td * 1e6).toPrecision(3) * 1e6, unit: 'cm/s' }), T({ lbl: '\\mu_p', ans: L / +(td * 1e6).toPrecision(3) * 1e6 / E, unit: 'cm^2/V·s' }), T({ lbl: 'D_p', ans: Dm, unit: 'cm^2/s', tol: { rel: 0.03 } })],
      hints: [md`$v_d = L/t_d$, $\mu_p = v_d/\mathscr{E}$.`, md`Width in space $\Delta x = v_d\Delta t$; $D_p = \frac{(\Delta x)^2}{16t_d}$.`],
      sol: G4(md`$v_d = \frac{L}{t_d}$, $\mu_p = \frac{v_d}{\mathscr{E}}$, $\delta p \propto e^{-(x - v_dt)^2/4D_pt}$ so the $1/e$ full width is $\Delta x = 4\sqrt{D_pt_d}$.`, md`$D_p = \frac{(v_d\Delta t)^2}{16t_d}$.`,
        md`$$v_d = \frac{${L}\,\text{cm}}{${S.f(td * 1e6, 3)}\times10^{-6}\,\text{s}} \qquad D_p = \frac{(v_d\cdot${dt}\times10^{-6}\,\text{s})^2}{16(${S.f(td * 1e6, 3)}\times10^{-6}\,\text{s})}$$`,
        md`$v_d = ${f(vd)}$ cm/s, $\mu_p = ${f(mu)}$ cm²/V·s, $D_p = ${f(Dm)}$ cm²/s; $D_p/\mu_p = ${f(Dm / mu)}$ V ≈ $kT/q$ ✓.`),
    };
  };

  window.E2GENS = {
    't13-hs': ['e2_hs'], 't14-v0': ['e2_v0'], 't15-depl': ['e2_depl'], 't16-bias': ['e2_edge'], 't17-diode': ['e2_diode', 'e2_comp', 'e2_neutral'],
    't18-narrow': ['e2_narrow'], 't19-break': ['e2_break'], 't20-cap': ['e2_cj', 'e2_cs', 'e2_tsd'], 't21-ms': ['e2_ms'], 't22-opto': ['e2_solar', 'e2_ff'],
  };
})();

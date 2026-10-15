/* gens-exam2.js — more exam-style problems, in the format of the Fall 2026 homework: two samples joined (built-in step
   and kinetic energy), an equilibrium band diagram with a built-in field (directions and log n, log p), recombination
   rates and injection level, absorption with reflection and the generation rate per volume, and quasi-Fermi levels
   from g(T) and g_op. */
(function () {
  'use strict';
  const md = String.raw;
  const { pick } = U;
  const fx = (x, n = 3) => S.f(x, n);
  const T = (o) => Object.assign({ tol: { rel: 0.02 } }, o);
  const FIXED = (q, mc, a, why) => ({ lbl: q, mc, a, why, fixed: true });
  const MIXED = (q, mc, a, why) => ({ lbl: q, mc, a, why });   // options shuffled

  // ------------------------------------------------------------------ two samples joined (HW4 problem 3)
  GENS.ex_contact = (o = {}) => {
    const a = o.a ?? pick([0.2, 0.25, 0.3, 0.35]), b = o.b ?? -pick([0.15, 0.2, 0.25, 0.3]), Eg = o.Eg ?? pick([1.1, 1.12]);
    const v = a - b;
    return {
      title: 'Two samples joined',
      q: md`Si sample 1 has $E_{F1} - E_i = +${a}$ eV; sample 2 has $E_{F2} - E_i = ${b}$ eV ($E_g = ${Eg}$ eV, 300 K). They are joined into a perfect junction and reach equilibrium.`,
      parts: [
        T({ lbl: 'qV_0\\ (\\text{eV})', ans: v }),
        FIXED('Whose bands end up higher?', ['sample 2’s', 'sample 1’s', 'neither'], 0, [null, 'The side with the lower $E_F$ (relative to $E_i$) must shift its bands up to line the Fermi levels up.', 'They step by $qV_0$.']),
        FIXED('Which sample is at the higher electrostatic potential?', ['sample 1', 'sample 2'], 0, [null, 'Higher bands mean lower potential ($E = -qV$).']),
        T({ lbl: 'E_K\\ \\text{of an electron in sample 1 at the energy of } E_{c2}\\ (\\text{eV})', ans: v }),
      ],
      sol: md`Before contact, $E_{F1}$ is ${v.toFixed(2)} eV above $E_{F2}$ (measured from the same $E_i$). Electrons flow from 1 to 2 until $E_F$ is flat, so sample 2's bands rise by $qV_0 = ${a} - (${b}) = ${v.toFixed(2)}$ eV and sample 1 is left positive (higher potential).

An electron with the total energy of $E_{c2}$ sits $${v.toFixed(2)}$ eV above $E_{c1}$, so in sample 1 that is all kinetic energy: ${v.toFixed(2)} eV. Away from the junction, sample 1 has $E_c - E_F = ${(Eg / 2 - a).toFixed(2)}$ eV and sample 2 has $E_F - E_v = ${(Eg / 2 + b).toFixed(2)}$ eV.`,
    };
  };

  // ------------------------------------------------------------------ equilibrium band diagram with a built-in field (HW5 problem 2)
  GENS.ex_fieldband = (o = {}) => {
    const up = o.up ?? Math.random() < 0.5;                  // bands rise to the right
    const s = up ? 0.35 : -0.35, EF = 0.6;
    const Ei = (x) => 0.6 - 0.12 + s * x;
    const fig = BD.diagram({ w: 240, h: 130, Ec: (x) => Ei(x) + 0.56, Ev: (x) => Ei(x) - 0.56, Ei, EF, axis: false, xl: 'x' });
    const [L, Rr] = ['left (−x)', 'right (+x)'];
    const fieldDir = up ? Rr : L, nUp = up ? 'falls' : 'rises';
    const fR = up, eDR = up;                                  // field toward higher bands; electrons plentiful where Ec is low
    return {
      title: 'A built-in field at equilibrium',
      q: md`The equilibrium band diagram of part of a semiconductor sample is shown ($E_F$ flat). Answer each part.`,
      fig,
      parts: [
        FIXED('The electric field points…', [L, Rr, 'nowhere'], fR ? 1 : 0, [fR ? 'The field points toward higher $E_c$: here, to the right.' : null, fR ? null : 'The field points toward higher $E_c$: here, to the left.', 'Sloped bands mean a field.']),
        FIXED('Toward $+x$, $\\log n$…', ['rises', 'falls', 'stays flat'], up ? 1 : 0, [up ? '$E_c$ moves away from $E_F$ toward $+x$: fewer electrons.' : null, up ? null : '$E_c$ approaches $E_F$ toward $+x$: more electrons.', 'The distance $E_c - E_F$ changes.']),
        FIXED('Electrons **diffuse** toward…', [L, Rr], eDR ? 1 : 0, [eDR ? 'Electrons are most plentiful on the left (where $E_c$ is closest to $E_F$); they diffuse away from there.' : null, eDR ? null : 'Electrons are most plentiful on the right; they diffuse away from there.']),
        FIXED('Electrons **drift** toward…', [L, Rr], fR ? 0 : 1, [fR ? null : 'Electrons drift against the field, which points left here.', fR ? 'Electrons drift against the field, which points right here.' : null]),
        FIXED('Holes diffuse toward ___ and drift toward ___.', [`${L}; ${Rr}`, `${Rr}; ${L}`], up ? 0 : 1, [up ? null : 'Holes are most plentiful on the left here; they diffuse right and drift left, with the field.', up ? 'Holes are most plentiful on the right (where $E_v$ is closest to $E_F$); they diffuse left and drift right, with the field.' : null]),
      ],
      sol: md`$E_c$ ${up ? 'rises' : 'falls'} toward $+x$: the field points ${fieldDir} (toward higher bands). On a log scale $n$ ${nUp} toward $+x$ and $p$ does the opposite, with equal and opposite slopes (60 meV per decade); they cross at $\log n_i$ where $E_F = E_i$. For each carrier, diffusion (away from where it is plentiful) and drift (electrons against $\mathscr{E}$, holes with it) point in opposite directions and cancel: no net current.`,
    };
  };

  // ------------------------------------------------------------------ recombination rates and injection level (HW4 problem 2)
  GENS.ex_rates = (o = {}) => {
    const m = o.m ?? pick([1, 3, 5]), k = o.k ?? pick([15, 16, 17]), Na = m * Math.pow(10, k), tau = o.tau ?? pick([1e-6, 1e-7]);
    const n0 = 2.25e20 / Na, r = n0 / tau;
    const d = o.d ?? pick([Na / 100, Na / 30, Na * 10]);
    const low = d < Na / 10;
    return {
      title: 'Recombination rates',
      q: md`p-type Si at 300 K, $N_a = ${S.p(Na)}\,\text{cm}^{-3}$, $\tau_n = \tau_p = ${S.p(tau)}$ s.`,
      parts: [
        T({ lbl: '\\text{thermal-equilibrium recombination rate}\\ (\\text{cm}^{-3}\\text{s}^{-1})', ans: r }),
        MIXED('Is the equilibrium recombination rate of holes the same as that of electrons?', ['yes: one of each per event', 'no: holes recombine faster', 'no: electrons recombine faster'], 0, [null, 'Recombination always removes pairs.', 'Pairs.']),
        FIXED(`Under steady light, $\\delta n = \\delta p = ${S.p(d)}$. This is…`, ['low-level injection', 'high-level injection'], low ? 0 : 1, low ? [null, `$\\delta = ${S.p(d)}$ is well below $p_0 = ${S.p(Na)}$.`] : [`$\\delta = ${S.p(d)}$ exceeds $p_0 = ${S.p(Na)}$.`, null]),
        T({ lbl: 'g_{op}\\ \\text{needed (low level)}\\ (\\text{cm}^{-3}\\text{s}^{-1})', ans: d / tau }),
      ],
      sol: md`$n_0 = n_i^2/N_a = ${fx(n0)}$. At equilibrium $r = \alpha_rn_0p_0$ with $\alpha_rp_0 = 1/\tau_n$, so $r = n_0/\tau_n = ${fx(r)}\,\text{cm}^{-3}\text{s}^{-1}$, equal to the thermal generation rate, and the same for holes.

${low ? 'Low level' : 'High level'}: compare $\delta$ with $p_0 = N_a$. The steady state needs $g_{op} = \delta/\tau = ${fx(d / tau)}$${low ? '' : ' (at high level the lifetime itself changes, so this is only an estimate)'}.`,
    };
  };

  // ------------------------------------------------------------------ absorption with reflection, generation per volume (HW4 problem 4)
  GENS.ex_absorbhw = (o = {}) => {
    const lam = o.lam ?? pick([600, 800, 900]), d = o.d ?? pick([2, 4, 10]), P = o.P ?? pick([0.5, 1, 2]), Rf = o.R ?? pick([0.3, 0.33]);
    const alpha = { 600: 4e3, 800: 1e3, 900: 3e2 }[lam];
    const Lx = 500e-4, Wy = 250e-4;
    const hv = 1240 / lam, J = hv * 1.6e-19;
    const ph = P * 1e-3 * (1 - Rf) / J, fr = 1 - Math.exp(-alpha * d * 1e-4), ehp = ph * fr, g = ehp / (Lx * Wy * d * 1e-4);
    return {
      title: 'Light into a thin Si sample',
      q: md`A Si sample ${d} μm thick, 500 μm × 250 μm, is lit with ${P} mW at ${lam} nm, where $\alpha = ${S.p(alpha)}\,\text{cm}^{-1}$. ${Math.round(Rf * 100)}% of the light is reflected. Assume one pair per absorbed photon, spread evenly through the sample.`,
      parts: [T({ lbl: 'h\\nu\\ (\\text{eV})', ans: hv }), T({ lbl: '\\text{absorbed fraction of the light entering}', ans: fr }), T({ lbl: '\\text{pairs per second}', ans: ehp }), T({ lbl: 'g_{op}\\ (\\text{cm}^{-3}\\text{s}^{-1})', ans: g })],
      sol: md`$h\nu = 1240/${lam} = ${hv.toFixed(3)}$ eV $= ${fx(J)}$ J. Photons entering: $\dfrac{${P}\times10^{-3}\times${(1 - Rf).toFixed(2)}}{${fx(J)}} = ${fx(ph)}$ per s. Absorbed fraction $1 - e^{-\alpha d} = 1 - e^{-${(alpha * d * 1e-4).toFixed(2)}} = ${fr.toFixed(3)}$, so $${fx(ehp)}$ pairs/s. Volume $= (0.05)(0.025)(${d}\times10^{-4}) = ${fx(Lx * Wy * d * 1e-4)}$ cm³, so $g_{op} = ${fx(g)}\,\text{cm}^{-3}\text{s}^{-1}$.`,
    };
  };

  // ------------------------------------------------------------------ steady state from g(T) and g_op (HW5 problem 1)
  GENS.ex_qflhw = (o = {}) => {
    const Nd = o.Nd ?? pick([1e16, 2e16, 5e16]), gop = o.g ?? pick([1e18, 1e19, 1e20]), gT = o.gT ?? pick([4.5e10, 2.25e10, 9e10]);
    const ar = gT / 2.25e20, tp = 1 / (ar * Nd), dp = gop * tp, p = 2.25e20 / Nd + dp, n = Nd + dp;
    const split = 0.0259 * Math.log((n * p) / 2.25e20);
    return {
      title: 'Steady state from the rates',
      q: md`n-type Si, $N_d = ${S.p(Nd)}\,\text{cm}^{-3}$, 300 K, thermal generation $g(T) = ${S.p(gT)}\,\text{cm}^{-3}\text{s}^{-1}$, uniform optical generation $g_{op} = ${S.p(gop)}\,\text{cm}^{-3}\text{s}^{-1}$. Assume low level and band-to-band recombination.`,
      parts: [T({ lbl: '\\alpha_r\\ (\\text{cm}^3/\\text{s})', ans: ar }), T({ lbl: '\\tau_p\\ (\\text{s})', ans: tp }), T({ lbl: '\\delta p\\ (\\text{cm}^{-3})', ans: dp }), T({ lbl: 'F_n - F_p\\ (\\text{eV})', ans: split })],
      hints: [md`At equilibrium $g(T) = \alpha_rn_i^2$. In steady state $g(T) + g_{op} = \alpha_rnp$; subtracting gives $g_{op} \approx \alpha_rN_d\,\delta p$.`],
      sol: md`$\alpha_r = g(T)/n_i^2 = ${fx(ar)}$. Low level: $g_{op} = \alpha_r(n_0 + p_0)\delta p \approx \alpha_rN_d\,\delta p$, so $\tau_p = 1/\alpha_rN_d = ${fx(tp)}$ s and $\delta p = g_{op}\tau_p = ${fx(dp)}$ (check: ${dp < Nd / 10 ? 'well below $N_d$, low level holds' : 'not small next to $N_d$: low level is doubtful'}). Then $n = ${fx(n)}$, $p = ${fx(p)}$, and $F_n - F_p = 0.0259\ln\dfrac{np}{n_i^2} = ${split.toFixed(3)}$ eV.`,
    };
  };

  RF.examGens = (RF.examGens || []).concat(['ex_contact', 'ex_fieldband', 'ex_rates', 'ex_absorbhw', 'ex_qflhw']);
})();

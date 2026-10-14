/* gens-exam.js — exam-style problems in the format of the Fall 2015 Exam 1 and the review sheet, with new numbers and
   situations every time: Fermi level at four temperatures, reading an n(T) plot, compensated wafers at two
   temperatures, "increase / decrease / same / not enough information", two light flashes with quasi-Fermi levels,
   minority carriers wiped out, flow and current arrows on a diffusion profile, J(x) from a profile, and quasi-Fermi
   levels at high temperature. */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri, shuffle } = U;
  const kTof = (T) => 8.62e-5 * T;
  const LET = ['A', 'B', 'C', 'D', 'E', 'F'];
  const fx = (x, n = 3) => S.f(x, n);
  const T = (o) => Object.assign({ tol: { rel: 0.02 } }, o);
  const FIXED = (q, mc, a, why) => ({ lbl: q, mc, a, why, fixed: true });

  // ------------------------------------------------------------------ Fermi level at four temperatures (2015, problem 1)
  // schematic band diagram (not to scale): levels in units with Ev = 0, Ei = 50, Ec = 100; candidate lines lettered top to bottom
  function candFig(dop, cands) {
    const f = PF.fig({ alt: 'band diagram, not to scale, with candidate Fermi-level positions lettered A to F' });
    const x0 = 40, W = 230, Y = (u) => 214 - u * 1.9;
    f.rect(x0, 4, W, Y(100) - 4, { cls: 'shade' }); f.rect(x0, Y(0), W, 230 - Y(0), { cls: 'shade' });
    f.line(x0, Y(100), x0 + W, Y(100), { cls: 'curve' }); f.label(x0 - 6, Y(100), 'E_c', 'r', 'small');
    f.line(x0, Y(0), x0 + W, Y(0), { cls: 'curve' }); f.label(x0 - 6, Y(0), 'E_v', 'r', 'small');
    f.line(x0, Y(50), x0 + 120, Y(50), { cls: 'dash dim' }); f.label(x0 - 6, Y(50), 'E_i', 'r', 'small');
    for (let i = 0; i < 5; i++) f.line(x0 + 8 + i * 22, Y(dop.u), x0 + 20 + i * 22, Y(dop.u), { cls: 'thick' });
    f.label(x0 - 6, Y(dop.u), dop.lab, 'r', 'small');
    cands.forEach((u, i) => { f.line(x0 + 135, Y(u), x0 + W, Y(u), { cls: 'ef' }); f.label(x0 + W + 6, Y(u), LET[i], 'l', 'small'); });
    f.text(x0 + W / 2, 236, 'not to scale', 't', 'small');
    return f.svg();
  }

  GENS.ex_ef_temps = (o = {}) => {
    const p = o.p ?? Math.random() < 0.5, dE = o.dE ?? pick([15, 20, 30, 45]), k = pick([14, 15]), N = o.N ?? pick([1, 2, 5]) * Math.pow(10, k);
    const Thot = o.Thot ?? pick([500, 550, 600]), niHot = o.niHot ?? { 500: 2e14, 550: 7e14, 600: 2e15 }[Thot] * pick([1, 1.5]);
    if (niHot < 4 * N && !o.N) return GENS.ex_ef_temps();
    const d300 = 0.0259 * Math.log(N / 1.5e10);                  // |E_F − E_i| at 300 K
    const u300 = 50 - Math.min(28, Math.max(16, 50 * d300 / 0.56));   // schematic height (p-type)
    // p-type candidates (heights): between Ev and Ea, just above Ea, 300 K position, Ei, mirror above Ei, just below Ec
    let c = { mid: 5, nearDop: 14, r300: u300, Ei: 50, wrong: 100 - u300, far: 95 };
    if (!p) c = { mid: 95, nearDop: 86, r300: 100 - u300, Ei: 50, wrong: u300, far: 5 };
    const keys = Object.keys(c).sort((a, b) => c[b] - c[a]);      // top to bottom
    const L = (key) => LET[keys.indexOf(key)];
    const fig = candFig({ u: p ? 10 : 90, lab: p ? 'E_a' : 'E_d' }, keys.map((x) => c[x]));
    const opts = LET.slice(0, 6);
    const why = (right, txt) => opts.map((o) => (o === right ? null : txt[keys[LET.indexOf(o)]] || 'Not where the electrons and holes balance at this temperature.'));
    const W = {
      mid: `At 0 K the ${p ? 'valence band is full and the acceptor states are empty' : 'donor states are full and the conduction band is empty'}: $E_F$ sits between them, at no other temperature.`,
      nearDop: 'Near the dopant level: the dopants are only partly ionized. That is the low-temperature (freeze-out) picture.',
      r300: `That is the 300 K position: all dopants ionized, $|E_F - E_i| = kT\\ln(N/n_i) = ${d300.toFixed(2)}$ eV.`,
      Ei: 'At $E_i$ the sample is intrinsic: true only when $n_i \\gg N$.',
      wrong: `That is on the ${p ? 'n' : 'p'}-type side of $E_i$; this sample is ${p ? 'p' : 'n'}-type at every temperature.`,
      far: `Near ${p ? '$E_c$' : '$E_v$'}: that would be a heavily ${p ? 'n' : 'p'}-type sample.`,
    };
    const part = (lbl, key) => FIXED(lbl, opts, opts.indexOf(L(key)), why(L(key), W));
    return {
      title: 'Fermi level at four temperatures',
      q: md`A ${p ? 'p' : 'n'}-type Si sample has ${p ? '$N_a$' : '$N_d$'} $= ${S.p(N)}\,\text{cm}^{-3}$ with the ${p ? 'acceptor' : 'donor'} level ${dE} meV ${p ? 'above $E_v$' : 'below $E_c$'}; $n_i(300\,\text{K}) = 1.5\times10^{10}$ and $n_i(${Thot}\,\text{K}) = ${S.p(niHot)}\,\text{cm}^{-3}$. Which lettered line is $E_F$ at each temperature?`,
      fig,
      parts: [part('0 K', 'mid'), part('50 K', 'nearDop'), part('300 K', 'r300'), part(`${Thot} K`, 'Ei')],
      sol: md`**0 K:** no thermal energy; ${p ? 'the valence band is full and every acceptor state empty' : 'every donor holds its electron and the conduction band is empty'}, so $E_F$ lies between ${p ? '$E_v$ and $E_a$' : '$E_d$ and $E_c$'} (line ${L('mid')}).

**50 K:** $kT = 4.3$ meV is below the ${dE} meV ionization energy, so only some dopants are ionized: $E_F$ stays near the dopant level (line ${L('nearDop')}).

**300 K:** all ionized, ${p ? '$p_0$' : '$n_0$'} $= ${S.p(N)}$, so $|E_F - E_i| = 0.0259\ln(${S.p(N)}/1.5\times10^{10}) = ${d300.toFixed(3)}$ eV, ${p ? 'below' : 'above'} $E_i$ (line ${L('r300')}).

**${Thot} K:** $n_i = ${S.p(niHot)} \gg ${S.p(N)}$: intrinsic, $E_F \approx E_i$ (line ${L('Ei')}).`,
    };
  };

  // ------------------------------------------------------------------ reading an n(T) plot (2015, problem 2b)
  GENS.ex_nT = (o = {}) => {
    const Nd = o.Nd ?? pick([1e14, 1e15, 1e16]), dopedIsA = o.dopedIsA ?? Math.random() < 0.5;
    const ni = (t) => 1.5e10 * Math.pow(t / 300, 1.5) * Math.exp(-(1.12 / (2 * 8.62e-5)) * (1 / t - 1 / 300));
    const nd = (t) => {
      const K = (2.8e19 * Math.pow(t / 300, 1.5) / 2) * Math.exp(-0.045 / kTof(t));
      const nf = (-K + Math.sqrt(K * K + 4 * K * Nd)) / 2;
      return nf / 2 + Math.sqrt(nf * nf / 4 + ni(t) * ni(t));
    };
    const lg = (v) => Math.log10(v);
    const pts = (fn) => { const a = []; for (let t = 30; t <= 800; t += 5) a.push([t, lg(fn(t))]); return a; };
    const fig = PF.plot({ w: 340, h: 220, x: [0, 800], y: [8, 18], xl: 'T\\,(\\text{K})', yl: 'n\\,(\\text{cm}^{-3})',
      xt: [[200, '200'], [400, '400'], [600, '600']], yt: [[10, '10^{10}'], [12, '10^{12}'], [14, '10^{14}'], [16, '10^{16}']],
      curves: [{ pts: pts(nd), lab: dopedIsA ? '\\text{A}' : '\\text{B}', labAt: 120, dx: 4, dy: -8 }, { pts: pts(ni), lab: dopedIsA ? '\\text{B}' : '\\text{A}', labAt: 560, dx: 6, dy: 0 }] });
    const [D, I] = dopedIsA ? ['A', 'B'] : ['B', 'A'];
    const ask = o.ask ?? pick(['which', 'low', 'mid', 'high', 'Nd']);
    const base = md`The plot shows the electron concentration of two Si samples against temperature. One is intrinsic, the other doped with donors only. `;
    const sol = md`Sample ${D} is doped: it rises at low $T$ as donors ionize (freeze-out), is flat at $N_d = ${S.p(Nd)}$ while $n_i \ll N_d$ (extrinsic), and joins the intrinsic curve once $n_i > N_d$. Sample ${I} only rises steeply: intrinsic, $n = n_i \propto T^{3/2}e^{-E_g/2kT}$.`;
    const one = (q, right, wrongs) => ({ title: 'Reading n(T)', q: base + q, fig, parts: [{ mc: [right, ...wrongs.map((w) => w[0])], a: 0, why: [null, ...wrongs.map((w) => w[1])] }], sol });
    if (ask === 'which') return one('Which sample is doped?', `${D}: it has a flat region at $N_d$`, [[`${I}`, 'It only rises steeply with $T$: that is $n_i(T)$.'], ['both', 'The intrinsic one has no plateau.'], ['neither can be told from the plot', 'The plateau identifies the doped one.']]);
    if (ask === 'low') return one(`Why does sample ${D} rise at the lowest temperatures?`, 'donors are ionizing as $kT$ grows (freeze-out region)', [['the band gap shrinks', 'Small effect; not the cause.'], ['intrinsic pairs are being created', 'Far too few at these temperatures.'], ['the mobility rises', 'Mobility doesn’t change carrier counts.']]);
    if (ask === 'mid') return one(`Why is sample ${D} flat over a wide middle range?`, 'all donors are ionized and $n_i \\ll N_d$, so $n_0 \\approx N_d$', [['generation and recombination stop', 'They balance; they don’t stop.'], ['the donors are frozen out', 'Then $n$ would be below $N_d$ and changing.'], ['the sample is intrinsic there', 'Intrinsic $n$ rises steeply with $T$.']]);
    if (ask === 'high') return one(`Why does sample ${D} rise again at high temperature and merge with ${I}?`, 'thermal pairs across the gap outnumber the donor electrons ($n_i > N_d$)', [['more donors ionize', 'They were all ionized already.'], ['the donors become acceptors', 'No.'], ['the mobility increases', 'Not a carrier count effect.']]);
    return one(`What is the donor concentration of sample ${D}?`, `$${S.p(Nd)}\\,\\text{cm}^{-3}$ (the plateau)`, [[`$${S.p(Nd * 100)}\\,\\text{cm}^{-3}$`, 'Read the flat part.'], ['$1.5\\times10^{10}\\,\\text{cm}^{-3}$', 'That is $n_i$ at 300 K.'], ['it can’t be read from the plot', 'The plateau value is $N_d$.']]);
  };

  // ------------------------------------------------------------------ compensated wafer at two temperatures (2015, problem 2c–d)
  GENS.ex_comp2T = (o = {}) => {
    const [a, b] = o.ab ?? pick([[3, 1], [5, 2], [4, 1], [1, 3], [2, 5], [6, 2]]);
    const Nd = a * 1e13, Na = b * 1e13, net = Nd - Na, n = net > 0;
    const c = o.c ?? pick([1, 2, 3]), niH = c * 1e13, TH = o.TH ?? pick([410, 420, 430]);
    const maj300 = Math.abs(net);
    const majH = Math.abs(net) / 2 + Math.sqrt(net * net / 4 + niH * niH);
    return {
      title: 'A compensated wafer, cool and hot',
      q: md`A Si wafer is doped with $${S.p(Nd)}\,\text{cm}^{-3}$ phosphorus and $${S.p(Na)}\,\text{cm}^{-3}$ boron, all ionized. At 300 K, $n_i \approx 10^{10}\,\text{cm}^{-3}$; at ${TH} K, $n_i \approx ${S.p(niH)}\,\text{cm}^{-3}$.`,
      parts: [
        { lbl: 'Type at 300 K', mc: ['n-type', 'p-type'], a: n ? 0 : 1, why: n ? [null, 'Phosphorus (donor) outnumbers boron.'] : ['Boron (acceptor) outnumbers phosphorus.', null], fixed: true },
        T({ lbl: '\\text{majority at 300 K}', ans: maj300, unit: 'cm^{-3}' }),
        T({ lbl: `\\text{majority at ${TH} K}`, ans: majH, unit: 'cm^{-3}' }),
        FIXED(`Compared with 300 K, the majority concentration at ${TH} K is…`, ['larger', 'the same', 'smaller'], 0, [null, '$n_i$ is now comparable to the net doping, so thermal pairs add to the majority.', 'More pairs, not fewer.']),
      ],
      hints: ['Net doping first; at the hot temperature use the quadratic, because $n_i$ is not small compared with it.'],
      sol: md`**300 K:** net ${n ? 'donors' : 'acceptors'} $|N_d - N_a| = ${S.p(maj300)} \gg n_i$: ${n ? 'n' : 'p'}-type with majority $${S.p(maj300)}$.

**${TH} K:** $n_i = ${S.p(niH)}$ is comparable, so solve neutrality with $np = n_i^2$:
$$${n ? 'n' : 'p'} = \frac{${S.p(maj300)}}{2} + \sqrt{\left(\frac{${S.p(maj300)}}{2}\right)^2 + (${S.p(niH)})^2} = ${fx(majH)}\,\text{cm}^{-3}$$
Larger: thermal electron–hole pairs now add to the majority. Still ${n ? 'n' : 'p'}-type, but closer to intrinsic.`,
    };
  };

  // ------------------------------------------------------------------ increase / decrease / same / not enough information (2015, problem 3)
  const CHOICES = ['INCREASE', 'DECREASE', 'STAY THE SAME', 'NOT ENOUGH INFORMATION'];
  const SCEN = [
    ['A lightly doped n-type Si bar (on its extrinsic plateau) is cooled from 300 K to 250 K at fixed voltage. The electron current will…', 0, '$n_0 = N_d$ is unchanged on the plateau, and with light doping lattice scattering dominates: $\\mu_L \\propto T^{-3/2}$ rises on cooling. More current.'],
    ['An n-type bar, doped only with donors, is heated from 300 K into its intrinsic region at fixed voltage. The ratio of hole current to electron current will…', 0, 'At 300 K holes are negligible ($p_0 = n_i^2/N_d$). Hot, thermal pairs make $p$ comparable to $n$, so the hole share grows.'],
    ['A pure (intrinsic) Si bar is heated from 300 K to 400 K at fixed voltage. The current will…', 0, '$n_i$ grows about 350×; mobility falls by less than 2×. The carrier count wins.'],
    ['A lightly doped Si resistor on its extrinsic plateau is heated from 300 K to 400 K. Its resistance will…', 0, '$n_0$ is fixed, lattice scattering lowers $\\mu$: resistance rises, like a metal.'],
    ['An n-type bar ($N_d = 10^{16}$) gets an extra $5\\times10^{15}\\,\\text{cm}^{-3}$ of acceptors. At the same voltage, the current will…', 1, '$n_0$ halves (compensation) and the extra ions lower the mobility: less current.'],
    ['A bar’s length is doubled at the same applied voltage. The current will…', 1, '$R = \\rho L/A$ doubles, so $I$ halves.'],
    ['A bar’s length and the applied voltage are both doubled. The current will…', 2, 'The field $V/L$ is unchanged, so $J$ and $I$ are unchanged.'],
    ['An n-type bar is replaced by a p-type bar of the same doping and size, same voltage. The current will…', 1, '$\\mu_p < \\mu_n$ in Si: less current.'],
    ['Uniform light is shone on a biased Si bar (low level). The current will…', 0, 'Extra carriers $\\Delta\\sigma = q\\,\\delta n(\\mu_n + \\mu_p)$: more current.'],
    ['A semiconductor bar of unknown doping is heated by 100 K at fixed voltage. The current will…', 3, 'It depends on the regime: on the plateau (and lightly doped) the current falls with mobility; in the intrinsic region it rises; when impurity scattering dominates mobility can rise. Without the doping and temperature range you can’t tell.'],
    ['Two n-type Si bars have the same $n_0 = 10^{16}$; bar B is compensated ($N_d = 2\\times10^{16}$, $N_a = 10^{16}$). Same size and voltage. B’s current compared with A’s will…', 1, 'Same carriers, but B has 3× the ionized impurities: lower mobility, less current.'],
    ['An n-type GaAs bar replaces a Si bar with the same doping and size, same voltage. The current will…', 0, 'GaAs electron mobility (~8500) is far above Si’s (~1350).'],
    ['The field across a short Si sample is raised from $10^4$ to $10^5$ V/cm. The drift velocity will…', 0, 'It still increases, but far less than 10× because it saturates near $10^7$ cm/s.'],
    ['A heavily doped Si bar ($10^{18}$) is cooled from 300 K to 250 K. Its mobility will…', 3, 'Cooling raises $\\mu_L$ but lowers $\\mu_I$, and at this doping both matter: the net change can’t be decided without data.'],
    ['A Si bar’s doping is raised from $10^{15}$ to $10^{16}\\,\\text{cm}^{-3}$ donors. Its resistance will…', 1, 'Ten times the carriers; mobility drops only slightly: resistance falls almost tenfold.'],
    ['A p-type bar is heated from its plateau far into the intrinsic region. The Hall voltage will…', 1, 'Electrons and holes both become numerous and push the Hall voltage in opposite directions, and the total carrier count is larger: the Hall voltage shrinks (it can even change sign, since $\\mu_n > \\mu_p$).'],
  ];
  GENS.ex_circle = (o = {}) => {
    const [q, a, s] = o.i !== undefined ? SCEN[o.i] : pick(SCEN);
    return {
      title: 'Circle one and explain',
      q: md`${q}`,
      parts: [FIXED('', CHOICES, a, CHOICES.map((c, i) => (i === a ? null : 'Go through each factor: carriers ($n$, $p$) and mobility (lattice, impurities), and the geometry.')))],
      sol: md`${s}`,
    };
  };

  // ------------------------------------------------------------------ two light flashes (2015, problem 4)
  GENS.ex_flash = (o = {}) => {
    const k = o.k ?? pick([14, 15, 16]), Nd = Math.pow(10, k), j = pick([k - 4, k - 3, k - 2]), dp = o.dp ?? pick([1, 2, 5]) * Math.pow(10, j);
    const m = o.m ?? pick([0.5, 1, 2]), after = 1 + Math.exp(-m);
    const EiFp = 0.0259 * Math.log((2.25e20 / Nd + dp) / 1.5e10);
    const EFEi = 0.0259 * Math.log(Nd / 1.5e10);
    return {
      title: 'Two flashes',
      q: md`n-type Si with $N_d = 10^{${k}}\,\text{cm}^{-3}$ at 300 K is hit by two very short flashes, each creating $\Delta p = ${S.p(dp)}\,\text{cm}^{-3}$ uniformly: one at $t = 0$, one at $t = ${m === 1 ? '' : m}\tau$, where $\tau$ is the minority lifetime.`,
      parts: [
        FIXED('$\\delta p(t)$ looks like…', ['a jump to $\\Delta p$, exponential decay, a second jump of $\\Delta p$ on top of what is left, exponential decay', 'a jump to $\\Delta p$, linear decay to zero, a second identical jump', 'two separate jumps to $\\Delta p$ from zero, each decaying', 'a jump to $2\\Delta p$ at $t = 0$'], 0,
          [null, 'At low level the decay is exponential and never quite reaches zero.', 'The first flash’s carriers haven’t all gone when the second arrives: they add.', 'The flashes are at different times.']),
        T({ lbl: '\\delta p/\\Delta p\\ \\text{just after the 2nd flash}', ans: after }),
        FIXED('Is it low-level injection at all times?', ['yes', 'no'], 0, [null, `The largest excess is $${fx(after * dp, 2)}$, far below $N_d = 10^{${k}}$.`]),
        T({ lbl: 'E_i - F_p\\ \\text{at}\\ t = 0^+\\ (\\text{eV})', ans: EiFp }),
        FIXED('Right after the first flash, $F_n$ is…', ['essentially at the dark $E_F$', 'at $E_i$', 'below $F_p$', 'at $E_c$'], 0,
          [null, 'Electrons are the majority; adding a tiny excess barely moves their level.', 'Far from it: n-type.', 'Excess carriers put $F_n$ above $F_p$.']),
      ],
      sol: md`$\delta p(t) = \Delta pe^{-t/\tau}$; at $t = ${m}\tau$ the second flash adds $\Delta p$ to $\Delta pe^{-${m}}$: $\delta p = \Delta p(1 + e^{-${m}}) = ${after.toFixed(3)}\,\Delta p$, then decays again. Low level throughout ($\delta p \ll N_d$).

Right after the first flash: $p = p_0 + \Delta p \approx ${fx(2.25e20 / Nd + dp, 3)}$, so $E_i - F_p = 0.0259\ln\dfrac{${fx(2.25e20 / Nd + dp, 3)}}{1.5\times10^{10}} = ${EiFp.toFixed(3)}$ eV (below $E_i$). $F_n \approx E_F = E_i + ${EFEi.toFixed(3)}$ eV, almost unmoved.`,
    };
  };

  // ------------------------------------------------------------------ minority carriers wiped out (review sheet)
  GENS.ex_ray = (o = {}) => {
    const p = o.p ?? Math.random() < 0.5, k = o.k ?? pick([15, 16, 17]), N = Math.pow(10, k), tau = o.tau ?? pick([1, 2, 10]);
    const n0 = 2.25e20 / N;
    const [min, maj] = p ? ['n', 'p'] : ['p', 'n'];
    return {
      title: 'The minority carriers vanish',
      q: md`A mysterious ray wipes out all **minority** carriers in a ${p ? 'p' : 'n'}-type Si wafer (${p ? '$N_a$' : '$N_d$'} $= 10^{${k}}\,\text{cm}^{-3}$, $\tau = ${tau}\,\mu$s, 300 K) at $t = 0$; majority carriers are unaffected.`,
      parts: [
        T({ lbl: `\\delta ${min}(0^+)`, ans: -n0, unit: 'cm^{-3}' }),
        FIXED('At $t = 0^+$, which dominates?', ['generation', 'recombination', 'neither'], 0, ['', 'With no minority carriers, $np = 0 < n_i^2$: recombination has stopped while thermal generation continues.', 'Generation is unopposed.'].map((x, i) => (i === 0 ? null : x))),
        FIXED('Is this low-level injection?', ['yes: $|\\delta| \\ll$ the majority concentration', 'no'], 0, [null, `$|\\delta ${min}| = ${S.p(n0)}$ is tiny against $10^{${k}}$.`]),
        T({ lbl: `\\delta ${min}(t = ${tau}\\,\\mu\\text{s})`, ans: -n0 / Math.E, unit: 'cm^{-3}' }),
      ],
      sol: md`$${min}_0 = n_i^2/N = ${S.p(n0)}$, so $\delta ${min}(0^+) = -${S.p(n0)}$ (negative excess). Generation refills it with the same lifetime: $\delta ${min}(t) = -${min}_0e^{-t/\tau}$, which at $t = \tau$ is $-${fx(n0 / Math.E)}$.`,
    };
  };

  // ------------------------------------------------------------------ flow and current arrows on a profile (2015, problem 5)
  GENS.ex_arrows = (o = {}) => {
    const el = o.el ?? Math.random() < 0.3;
    const g = (x, c, h) => h * Math.exp(-((x - c) * (x - c)) / 0.35);
    const prof = (x) => g(x, 1.2, 1) + g(x, 3.2, 0.8);
    const cand = [[0.5, 'L'], [1.2, 'Z'], [1.9, 'R'], [2.6, 'L'], [3.2, 'Z'], [3.85, 'R'], [5.2, 'Z']];
    const pick4 = (o.pts ? o.pts.map((i) => cand[i]) : shuffle(cand).slice(0, 4)).sort((a, b) => a[0] - b[0]);
    const names = ['a', 'b', 'c', 'd'];
    const fig = PF.plot({ w: 340, h: 200, x: [0, 5.6], y: [0, 1.2], xl: 'x', yl: el ? '\\delta n' : '\\delta p', xt: [], yt: [],
      curves: [{ f: prof }], pts: pick4.map(([x], i) => ({ x, y: prof(x), lab: `(${names[i]})`, anchor: 'b' })) });
    const OPTS = ['flow →, current →', 'flow ←, current ←', 'flow →, current ←', 'flow ←, current →', 'both zero'];
    const ans = (d) => (d === 'Z' ? 4 : el ? (d === 'R' ? 2 : 3) : (d === 'R' ? 0 : 1));
    return {
      title: 'Flow and current on a profile',
      q: md`Excess ${el ? 'electrons' : 'holes'} have the profile shown, with no electric field. At each point, which way do the ${el ? 'electrons' : 'holes'} flow, and which way does their current point?`,
      fig,
      parts: pick4.map(([x, d], i) => FIXED(`(${names[i]})`, OPTS, ans(d), OPTS.map((o, j) => (j === ans(d) ? null : d === 'Z' ? 'The slope is zero here (a peak or the flat tail): no gradient, no diffusion.' : `Carriers flow down the slope (here ${d === 'R' ? 'to the right' : 'to the left'}); ${el ? 'electron current is opposite to electron flow' : 'hole current is along hole flow'}.`)))),
      sol: md`Diffusion flux $\phi = -D\,d(\delta ${el ? 'n' : 'p'})/dx$: down the slope, zero at peaks and in the flat tail. ${el ? 'Electrons carry $-q$, so $J_n = +qD_n\\,d\\delta n/dx$ points opposite to their flow.' : 'Holes carry $+q$, so $J_p = -qD_p\\,d\\delta p/dx$ points along their flow.'}`,
    };
  };

  // ------------------------------------------------------------------ write J(x) from a profile
  GENS.ex_jexpr = (o = {}) => {
    const L = ([
      { q: md`$\delta p(x) = \Delta p\,e^{-x/L_p}$ (no field).`, r: md`$J_p = \dfrac{qD_p\Delta p}{L_p}e^{-x/L_p}$`, w: [[md`$J_p = -\dfrac{qD_p\Delta p}{L_p}e^{-x/L_p}$`, 'Sign: $J_p = -qD_p\\,d\\delta p/dx$ and $d\\delta p/dx < 0$, so $J_p > 0$.'], [md`$J_p = qD_p\Delta p\,e^{-x/L_p}$`, 'The derivative brings down $1/L_p$.'], [md`$J_p = \dfrac{qD_n\Delta p}{L_p}e^{-x/L_p}$`, 'Holes use $D_p$.']] },
      { q: md`$\delta p(x) = \Delta p\,(1 - x/W)$ for $0 \le x \le W$ (no field).`, r: md`$J_p = \dfrac{qD_p\Delta p}{W}$, the same everywhere`, w: [[md`$J_p = -\dfrac{qD_p\Delta p}{W}$`, 'Holes flow down the slope (to $+x$), and so does their current.'], [md`$J_p = \dfrac{qD_p\Delta p}{W}(1 - x/W)$`, 'The derivative of a straight line is a constant.'], ['$J_p = 0$', 'There is a gradient.']] },
      { q: md`$\delta p(x) = A\,e^{-x^2/c}$ (no field).`, r: md`$J_p = \dfrac{2qD_pA\,x}{c}e^{-x^2/c}$`, w: [[md`$J_p = -\dfrac{2qD_pA\,x}{c}e^{-x^2/c}$`, '$J_p = -qD_p\\,d\\delta p/dx$, and $d\\delta p/dx = -(2x/c)Ae^{-x^2/c}$.'], [md`$J_p = qD_pA\,e^{-x^2/c}$`, 'Differentiate the exponent too.'], [md`$J_p = \dfrac{qD_pA}{c}e^{-x^2/c}$`, 'The chain rule brings down $-2x/c$.']] },
      { q: md`$n(x) = N_d\,e^{-x/\alpha}$ (find the electron **diffusion** current).`, r: md`$J_{n,\text{diff}} = -\dfrac{qD_nN_d}{\alpha}e^{-x/\alpha}$`, w: [[md`$J_{n,\text{diff}} = +\dfrac{qD_nN_d}{\alpha}e^{-x/\alpha}$`, 'Electron diffusion current $= +qD_n\\,dn/dx$, and $dn/dx < 0$.'], [md`$J_{n,\text{diff}} = -qD_nN_d\,e^{-x/\alpha}$`, 'The derivative brings down $1/\\alpha$.'], [md`$J_{n,\text{diff}} = -\dfrac{qD_pN_d}{\alpha}e^{-x/\alpha}$`, 'Electrons use $D_n$.']] },
    ]), C = o.i !== undefined ? L[o.i] : pick(L);
    return { title: 'Current from a profile', q: md`Write the diffusion current density for ${C.q}`, parts: [{ mc: [C.r, ...C.w.map((w) => w[0])], a: 0, why: [null, ...C.w.map((w) => w[1])] }],
      sol: md`$J_p = -qD_p\,\dfrac{d\,\delta p}{dx}$ and $J_n = +qD_n\,\dfrac{dn}{dx}$: differentiate, then mind the sign.` };
  };

  // ------------------------------------------------------------------ quasi-Fermi levels at a raised temperature (review sheet)
  GENS.ex_qflhot = (o = {}) => {
    const [Tk, ni] = o.T ?? pick([[400, 4.7e12], [450, 1e14], [500, 2e14]]);
    const Nd = o.Nd ?? pick([1e15, 1e16]), g = o.g ?? pick([1e19, 1e20]), tau = o.tau ?? pick([1e-6, 1e-7]);
    const d = g * tau, kT = kTof(Tk);
    const n = Nd + d + 0 * ni, p = ni * ni / Nd + d;
    if (ni > Nd / 3) return GENS.ex_qflhot();
    const Fn = kT * Math.log(n / ni), Fp = kT * Math.log(p / ni);
    return {
      title: 'Quasi-Fermi levels when hot',
      q: md`Si with $N_d = ${S.p(Nd)}\,\text{cm}^{-3}$ is lit uniformly with $g_{op} = ${S.p(g)}\,\text{cm}^{-3}\text{s}^{-1}$, $\tau_n = \tau_p = ${S.p(tau)}$ s. The light heats it to ${Tk} K, where $n_i = ${S.p(ni)}\,\text{cm}^{-3}$. Find the quasi-Fermi levels relative to $E_i$.`,
      parts: [T({ lbl: 'F_n - E_i', ans: Fn, unit: 'eV' }), T({ lbl: 'E_i - F_p', ans: Fp, unit: 'eV' })],
      hints: [md`$kT = 8.62\times10^{-5}\times${Tk}$ eV; $p_0 = n_i^2/N_d$ at ${Tk} K, not at 300 K.`],
      sol: md`$\delta = g\tau = ${S.p(d)}$. $kT = ${kT.toFixed(4)}$ eV. $n = N_d + \delta = ${fx(n)}$, $p = n_i^2/N_d + \delta = ${fx(p)}$.
$$F_n - E_i = ${kT.toFixed(4)}\ln\frac{${fx(n)}}{${S.p(ni)}} = ${Fn.toFixed(4)}\,\text{eV}, \qquad E_i - F_p = ${kT.toFixed(4)}\ln\frac{${fx(p)}}{${S.p(ni)}} = ${Fp.toFixed(4)}\,\text{eV}$$
${Fp < 0 ? 'Negative means $F_p$ sits **above** $E_i$: so few holes that even with the light $p < n_i$.' : ''}`,
    };
  };

  RF.examGens = ['ex_ef_temps', 'ex_nT', 'ex_comp2T', 'ex_circle', 'ex_flash', 'ex_ray', 'ex_arrows', 'ex_jexpr', 'ex_qflhot'];
})();

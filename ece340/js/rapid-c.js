/* rapid-c.js — rapid-fire concept drills for Exam 1, topics 9–12 (see rapid-a.js for the helpers). */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri } = U;
  const RF = window.RF;
  const { MC, e, p10, pow, one } = RF;
  const DECAY = [[1, 37, 't = \\tau'], [2, 14, 't = 2\\tau'], [3, 5, 't = 3\\tau'], [0.69, 50, 't = 0.69\\tau'], [2.3, 10, 't = 2.3\\tau'], [4.6, 1, 't = 4.6\\tau']];

  // =========================================================================== Topic 9: recombination
  GENS.rf_life = () => one([
    () => {
      const n = Math.random() < 0.5, k = ri(15, 17), m = ri(11, k - 2);
      const [maj, min] = n ? ['electrons', 'holes'] : ['holes', 'electrons'];
      return MC('Who notices the light?', md`${n ? 'n' : 'p'}-type Si with ${n ? '$N_d$' : '$N_a$'} $= 10^{${k}}$ gets $\delta n = \delta p = 10^{${m}}\,\text{cm}^{-3}$. Which population changes by the larger **factor**?`, `the ${min} (minority)`,
        [[`the ${maj} (majority)`, `${maj[0].toUpperCase() + maj.slice(1)} go from $10^{${k}}$ to $10^{${k}} + 10^{${m}}$: a $${S.f(Math.pow(10, m - k) * 100, 1)}$% change.`], ['both by the same factor', 'Equal added numbers on very unequal starting numbers.'], ['neither changes', 'Light adds carriers.']],
        md`The minority starts at $2.25\times10^{${20 - k}}$ and jumps to about $10^{${m}}$; the majority barely moves. Minority carriers carry the story.`);
    },
    () => {
      const k = pick([2, 5, 10]);
      return MC('Doping and lifetime', md`Low-level injection, direct recombination: the majority concentration is raised ${k}×. The minority lifetime…`, `drops ${k}×`,
        [[`rises ${k}×`, 'More majority carriers means more partners to recombine with.'], [`drops ${k * k}×`, '$\\tau = 1/(\\alpha_rN)$ is linear in $1/N$.'], ['is unchanged', 'It depends on the majority concentration.']],
        md`$\tau_{\text{min}} = 1/(\alpha_r N_{\text{maj}})$.`);
    },
    () => {
      const [r, pc, tex] = pick(DECAY);
      return MC('Exponential decay', md`Low-level decay after a flash. What fraction of the excess is left at $${tex}$?`, `${pc}%`,
        [[`${100 - pc}%`, 'That fraction has recombined.'], [`${Math.max(0, Math.round(100 - 100 * r / 5))}%`, 'The decay is exponential, not linear.'], [`${Math.round(100 / (1 + r))}%`, 'That is the high-level shape; at low level use $e^{-t/\\tau}$.']],
        md`$e^{-${r}} \approx ${pc / 100}$.`);
    },
    () => {
      const t = pick([1, 2, 10, 0.5]);
      return MC('Half-life', md`Low-level lifetime $\tau = ${t}\,\mu$s. When has the excess halved?`, `${+(0.693 * t).toFixed(2)} μs`,
        [[`${t} μs`, 'At $t = \\tau$ only 37% is left.'], [`${t / 2} μs`, '$t_{1/2} = \\tau\\ln2$, not $\\tau/2$.'], [`${+(2.3 * t).toFixed(2)} μs`, 'That is when 10% is left.']],
        md`$t_{1/2} = \tau\ln2 = 0.69\tau$.`);
    },
    () => {
      const k = ri(14, 17), m = pick([k - 3, k - 2, k + 1, k + 2]);
      const low = m < k;
      return MC('Low or high level?', md`Doping $10^{${k}}\,\text{cm}^{-3}$; the light makes $\delta n = \delta p = 10^{${m}}$. This is…`, low ? 'low-level injection' : 'high-level injection',
        [[low ? 'high-level injection' : 'low-level injection', 'Compare $\\delta n$ with the doping.'], ['equilibrium ($np = n_i^2$)', 'Excess carriers mean $np > n_i^2$.'], ['impossible at this doping', 'Both regimes occur.']],
        md`$\delta n/N = 10^{${m - k}}$.`);
    },
    () => {
      const a = pick([10, 12, 14]), b = pick([15, 16, 17]);
      const t = Math.pow(10, a - b);
      return MC('Lifetime from the numbers', md`$\alpha_r = 10^{-${a}}\,\text{cm}^3/\text{s}$, majority concentration $10^{${b}}\,\text{cm}^{-3}$. The minority lifetime is about…`, `$${pow(a - b)}$ s`,
        [[`$${pow(b - a)}$ s`, '$\\tau = 1/(\\alpha_rN)$: subtract the exponents carefully.'], [`$${pow(a - b - 1)}$ s`, 'Off by ten.'], [`$${pow(-a - b)}$ s`, 'Divide, don’t multiply.']],
        md`$\tau = 1/(10^{-${a}}\times10^{${b}}) = 10^{${a - b}}$ s${t >= 1e-6 ? '' : ` = ${S.f(t * 1e9, 2)} ns`}.`);
    },
  ]);

  GENS.rf_trap = () => one([
    () => {
      const [lvl, R, W] = pick([
        ['near midgap', 'an effective recombination center', [['a trap that re-emits carriers', 'From midgap, the captured carrier is too deep to be shaken back out before the other kind arrives.']]],
        ['just below $E_c$', 'mostly a trap (re-emits electrons)', [['the best recombination center', 'Shallow levels give their carrier back long before a hole arrives.']]],
      ]);
      return MC('Trap level', md`A defect level sits ${lvl} in Si. It acts as…`, R, W.concat([['a donor that adds many electrons', 'Its job here is capture and release, not doping.'], ['nothing at all: it is inert', 'Defect levels in the gap always interact with carriers.']]),
        md`Midgap: both capture steps are about equally easy, so it completes recombination. Near a band: the carrier is re-emitted (trapping).`);
    },
    () => {
      const si = Math.random() < 0.5;
      return MC('How it recombines', md`In ${si ? 'silicon' : 'GaAs'}, excess carriers mostly recombine…`, si ? 'through defect levels, as heat' : 'directly, emitting photons',
        [[si ? 'directly, emitting photons' : 'through defect levels, as heat', si ? 'Indirect gap: direct emission needs a phonon too, so it is rare.' : 'Direct gap: band-to-band emission is fast.'], ['at the metal contacts only', 'Throughout the volume.'], ['they never recombine at all', 'Excess carriers always recombine eventually.']],
        md`${si ? 'Indirect gap' : 'Direct gap'}.`);
    },
    () => MC('Gold doping', md`Fast-switching Si diodes are sometimes doped with gold, which makes midgap levels. The effect is…`, 'a shorter lifetime',
      [['a longer lifetime', 'More recombination centers shorten it.'], ['more free electrons', 'Gold’s levels are deep; it doesn’t dope usefully.'], ['efficient light emission', 'Trap recombination makes heat.']],
      md`$\tau \propto 1/N_t$.`),
    () => {
      const c = pick(['>', '<', '=']);
      const R = { '>': 'net recombination: carriers disappear', '<': 'net generation: carriers are created', '=': 'nothing net: equilibrium' }[c];
      return MC('Net rate', md`At some point $np\ ${c}\ n_i^2$. The net rate $\alpha_r(np - n_i^2)$ means…`, R,
        Object.entries({ '>': 'net recombination: carriers disappear', '<': 'net generation: carriers are created', '=': 'nothing net: equilibrium' }).filter(([k]) => k !== c).map(([, v]) => [v, 'Check the sign of $np - n_i^2$.']).concat([['the doping changes', 'Dopants are fixed.']]),
        md`Positive → recombination wins; negative → generation wins; zero → balance.`);
    },
    () => MC('Trap or recombination center?', md`A photoconductor's current keeps tailing off for seconds after the light is switched off. Most likely…`, 'carriers sit in traps and are slowly released back',
      [['the lifetime is seconds long because of midgap centers', 'Midgap centers shorten lifetimes.'], ['the contacts store charge', 'Not the main effect.'], ['the light is still on', 'It was switched off.']],
      md`Traps capture and later re-emit carriers, stretching the response.`),
  ]);

  GENS.rf_high = () => one([
    () => {
      const k = pick([16, 17, 18, 19]);
      const t = 1 / (1e-10 * Math.pow(10, k));
      return MC('High-level half-time', md`High-level injection, $\alpha_r = 10^{-10}\,\text{cm}^3/\text{s}$, $\Delta n = 10^{${k}}\,\text{cm}^{-3}$. The excess halves after…`, `$${S.p(t)}$ s`,
        [[`$${S.p(t * 10)}$ s`, '$t_{1/2} = 1/(\\alpha_r\\Delta n)$: count the exponents.'], [`$${S.p(t * 0.693)}$ s`, 'No $\\ln2$ here: the high-level decay is not exponential.'], [`$${S.p(t / 10)}$ s`, 'Off by ten.']],
        md`$1/(10^{-10}\times10^{${k}}) = 10^{${10 - k}}$ s.`);
    },
    () => {
      const k = pick([2, 10]);
      return MC('Bigger flash', md`At high level, the initial excess is made ${k}× larger. The time to halve…`, `shrinks ${k}×`,
        [['stays the same', 'That is the low-level (exponential) behavior.'], [`grows ${k}×`, 'More carriers, more partners, faster.'], [`shrinks ${k * k}×`, '$t_{1/2} = 1/(\\alpha_r\\Delta n)$.']],
        md`At high level the carriers are each other's partners.`);
    },
    () => MC('Shape of high-level decay', md`After a very strong flash, the excess decays…`, 'fast at first, then ever more slowly',
      [['exponentially from the start', 'Only at low level.'], ['linearly, at a constant rate', 'The rate depends on how many carriers remain.'], ['slowly at first, then faster', 'Reversed: the rate per carrier, $\\alpha_r\\delta n$, is largest at the start.']],
      md`$\delta n = \Delta n/(1 + \alpha_r\Delta n\,t)$.`),
  ]);

  // =========================================================================== Topic 10: steady state and QFLs
  GENS.rf_qfl = () => {
    let a = ri(-6, 7), b = ri(-6, 7);                     // decades of n and p above n_i
    if (a + b < 2 || !a || !b) return GENS.rf_qfl();
    const Fn = 0.56 + 0.06 * a, Fp = 0.56 - 0.06 * b, split = a + b;
    const fig = RF.bd({ Fn, Fp, dims: [{ x: 0.8, a: 'Fp', b: 'Fn', tex: `${e(0.06 * split)}\\,\\text{eV}` }] });
    const ask = pick(['np', 'eq', 'which']);
    if (ask === 'np') return MC('Read the quasi-Fermi levels', md`Si under light; $F_n$ and $F_p$ are ${e(0.06 * split)} eV apart. $np/n_i^2$ is about…`, `$${pow(split)}$`,
      [[`$${pow(2 * split)}$`, 'One decade per 0.06 eV of splitting.'], ['1', 'That is equilibrium: $F_n = F_p$.'], [`$${pow(Math.round(split / 2))}$`, 'Each 0.06 eV of $F_n - F_p$ is a full decade of $np$.']],
      md`$np = n_i^2e^{(F_n - F_p)/kT}$: ${e(0.06 * split)} eV / 0.06 = ${split} decades.`, fig);
    if (ask === 'eq') return MC('Read the quasi-Fermi levels', md`The diagram shows $F_n$ and $F_p$ split by ${e(0.06 * split)} eV. Is the sample in equilibrium?`, 'no: $np > n_i^2$',
      [['yes: both levels are flat', 'Flat means no current; split means not equilibrium.'], ['yes, if the light is uniform', 'Uniform light still breaks equilibrium.'], ['no: $np < n_i^2$', 'Splitting with $F_n$ above $F_p$ means $np > n_i^2$.']],
      md`Equilibrium needs one Fermi level: $F_n = F_p$.`, fig);
    const more = a > b ? 'electrons' : a < b ? 'holes' : 'equal';
    if (more === 'equal') return GENS.rf_qfl();
    return MC('Read the quasi-Fermi levels', md`From the diagram (Si under light), which carrier is more numerous, and by about how much?`, `${more}, by about $${pow(Math.abs(a - b))}$`,
      [[`${more === 'electrons' ? 'holes' : 'electrons'}, by about $${pow(Math.abs(a - b))}$`, '$F_n$ closer to $E_c$ than $F_p$ is to $E_v$ means more electrons.'], [`${more}, by about $${pow(2 * Math.abs(a - b))}$`, 'One decade per 0.06 eV.'], ['equal: light makes pairs', 'Light adds equal numbers, but the starting numbers differ.']],
      md`$n = n_i10^{(F_n - E_i)/0.06}$, $p = n_i10^{(E_i - F_p)/0.06}$: ${a} versus ${b} decades.`, fig);
  };

  GENS.rf_gtau = () => one([
    () => {
      const a = ri(18, 22), b = pick([4, 5, 6, 7]);
      return MC('Steady excess', md`Light generates $g_{op} = 10^{${a}}\,\text{cm}^{-3}\text{s}^{-1}$ and $\tau = 10^{-${b}}$ s. The steady excess is…`, `$10^{${a - b}}\\,\\text{cm}^{-3}$`,
        [[`$10^{${a + b}}\\,\\text{cm}^{-3}$`, '$\\delta n = g\\tau$: multiply by $10^{-' + b + '}$.'], [`$10^{${a - b - 1}}\\,\\text{cm}^{-3}$`, 'Off by ten.'], [`$10^{${a}}\\,\\text{cm}^{-3}$`, 'That is the rate, per second.']],
        md`$\delta n = g_{op}\tau = 10^{${a}}\times10^{-${b}}$.`);
    },
    () => {
      const [f, d] = pick([[2, '0.018'], [10, '0.06'], [100, '0.12'], [1000, '0.18']]);
      return MC('Brighter light', md`Low-level light is made ${f}× brighter. The **minority** quasi-Fermi level moves about…`, `${d} eV`,
        [[`${(+d * 2).toFixed(3).replace(/0+$/, '')} eV`, 'One decade per 0.06 eV ($kT\\ln$ of the factor).'], ['0', 'The minority concentration changes a lot.'], [`${f * 0.0259 > 1 ? '1.12' : (f * 0.0259).toFixed(2)} eV`, 'Logarithmic, not linear: $kT\\ln' + f + '$.']],
        md`$\Delta F = kT\ln${f} = ${d}$ eV.`);
    },
    () => {
      const k = pick([2, 5, 10]);
      return MC('Longer lifetime', md`A photoconductor's lifetime is made ${k}× longer. Its steady signal and its response time…`, `both ×${k}`,
        [[`signal ×${k}, response faster`, 'The excess builds and decays with time constant $\\tau$.'], ['signal unchanged, response slower', '$\\delta n = g\\tau$ grows.'], [`both ×${k * k}`, 'Linear in $\\tau$.']],
        md`$\delta n = g\tau$; rise and fall times $\sim\tau$: sensitivity costs speed.`);
    },
    () => {
      const k = ri(15, 17), m = ri(11, k - 2);
      return MC('The majority level', md`n-type Si, $n_0 = 10^{${k}}$, under light with $\delta n = 10^{${m}}$. How far does $F_n$ move from the dark $E_F$?`, `about $${S.f(0.0259 * Math.log(1 + Math.pow(10, m - k)) * 1000, 1)}$ meV`,
        [[`${e(0.06 * (m - 10))} eV`, 'That is how far a level sits above $E_i$ for $10^{' + m + '}$, not the shift of the majority level.'], ['as far as $F_p$ moves', 'The minority level moves far; the majority barely moves.'], ['0.06 eV', 'That would need $n$ to grow tenfold.']],
        md`$n$ changes by only $10^{${m - k}}$ relative: $kT\ln(1 + 10^{${m - k}})$ is tiny.`);
    },
    () => MC('Light off', md`The light is switched off. The quasi-Fermi levels…`, 'merge into one $E_F$ over a few τ',
      [['stay split until heated', 'Recombination removes the excess.'], ['merge instantly when it goes dark', 'The excess takes about $\\tau$ to decay.'], ['swap places, then merge', 'They never cross; they just converge.']],
      md`$F_n - F_p = kT\ln(np/n_i^2) \to 0$ as $np \to n_i^2$.`),
    () => MC('Laser condition', md`For a semiconductor laser to amplify light at $h\nu \approx E_g$, the quasi-Fermi levels must be…`, 'split by more than $h\\nu$',
      [['equal, as in equilibrium', 'That is equilibrium: absorption wins.'], ['both near midgap', 'Too few excess carriers.'], ['split by about $kT$', 'Far too small.']],
      md`Population inversion: $F_n - F_p > h\nu$.`),
  ]);

  GENS.rf_photoc = () => one([
    () => {
      const k = ri(12, 16);
      const ds = 1.6e-19 * Math.pow(10, k) * 1830;
      return MC('Photoconductivity', md`Si ($\mu_n + \mu_p \approx 1830$) has $\delta n = \delta p = 10^{${k}}\,\text{cm}^{-3}$ under light. $\Delta\sigma$ is about…`, `$${S.f(ds, 2)}\\,(\\Omega\\text{cm})^{-1}$`,
        [[`$${S.f(ds * 10, 2)}\\,(\\Omega\\text{cm})^{-1}$`, 'Count the exponents: $q\\,\\delta n(\\mu_n + \\mu_p)$.'], [`$${S.f(ds / 1830 * 1350 / 10, 2)}\\,(\\Omega\\text{cm})^{-1}$`, 'Include both carriers, and check the powers of ten.'], [`$${S.f(ds / 1.6e-19, 2)}\\,(\\Omega\\text{cm})^{-1}$`, 'Multiply by $q$.']],
        md`$\Delta\sigma = (1.6\times10^{-19})(10^{${k}})(1830) = ${S.f(ds, 2)}$.`);
    },
    () => MC('Who carries the photocurrent?', md`Si under light with $\delta n = \delta p$. What share of the extra conductivity comes from electrons?`, 'about 74%',
      [['50%', 'Equal numbers, unequal mobilities.'], ['100%', 'Excess holes conduct too.'], ['about 26%', 'That is the holes’ share.']],
      md`$1350/(1350 + 480) = 0.74$.`),
    () => {
      const k = pick([2, 3, 10]);
      return MC('Brighter light, more conductivity', md`The light on a photoconductor is ${k}× brighter (low level). $\Delta\sigma$…`, `×${k}`,
        [[`×${k * k}`, 'Linear: $\\delta n = g\\tau$.'], ['unchanged', 'More light, more carriers.'], [`×${+Math.sqrt(k).toFixed(2)}`, 'That is the high-level regime; at low level it is linear.']],
        md`$\Delta\sigma = qg_{op}(\tau_n\mu_n + \tau_p\mu_p)$.`);
    },
  ]);

  // =========================================================================== Topic 11: diffusion
  const prof = (up, yl) => PF.plot({ w: 300, h: 150, x: [0, 1], y: [0, 1.15], xl: 'x', yl, xt: [], yt: [], curves: [{ f: (x) => (up ? 0.12 + 0.9 * x * x : 1.02 - 0.9 * Math.sqrt(x)) }] });

  GENS.rf_diffdir = () => one([
    () => {
      const up = Math.random() < 0.5, car = pick(['electrons', 'holes']);
      const flow = up ? 'left' : 'right', neg = car === 'electrons';
      const cur = neg ? (flow === 'left' ? 'right' : 'left') : flow;
      return MC('Diffusion directions', md`The ${car === 'electrons' ? 'electron' : 'hole'} concentration ${up ? 'rises' : 'falls'} to the right (no field). The ${car} flow ___ and their current points ___.`, `${flow}; ${cur}`,
        [[`${flow === 'left' ? 'right' : 'left'}; ${cur}`, 'Particles diffuse down their own gradient.'], [`${flow}; ${flow === cur ? (cur === 'left' ? 'right' : 'left') : flow}`, neg ? 'Electrons are negative: their current is opposite to their flow.' : 'Holes are positive: current is along their flow.'], [`${flow === 'left' ? 'right' : 'left'}; ${cur === 'left' ? 'right' : 'left'}`, 'Both reversed.']],
        md`Flow is down the gradient (${flow}); ${neg ? 'electrons carry −q, so the current points ' + cur : 'holes carry +q, so the current points ' + cur}. ${neg ? '$J_n = +qD_n\\,dn/dx$' : '$J_p = -qD_p\\,dp/dx$'}.`, prof(up, neg ? 'n' : 'p'));
    },
    () => MC('Pairs diffusing together', md`Pairs made at the left surface diffuse to the right together. The electron and hole diffusion **currents**…`, 'opposite, partly cancelling',
      [['point the same way and add', 'Same flow, opposite charges: opposite currents.'], ['both zero, moving together', 'There are gradients.'], ['opposite, cancelling exactly', 'Not exactly: $D_n \\ne D_p$.']],
      md`Electron flow right = current left; hole flow right = current right.`),
    () => MC('Uniform concentration', md`Electrons are spread perfectly evenly through a sample with no field. The diffusion current is…`, 'zero',
      [['large: they move fast', 'Random motion with no gradient carries equal numbers each way.'], ['equal to the drift current', 'There is no field, so no drift either.'], ['negative', 'It is zero.']],
      md`Diffusion current $\propto$ gradient.`),
    () => MC('Force needed?', md`Does a carrier need a force acting on it to diffuse?`, 'no: random motion plus a gradient',
      [['yes, the gradient pushes it', 'A gradient isn’t a force on any one carrier.'], ['yes, an electric field is required', 'Diffusion happens with no field.'], ['only holes need a pushing force', 'Same for both.']],
      md`Each carrier walks randomly; the net flow is statistics.`),
  ]);

  GENS.rf_einstein = () => one([
    () => {
      const mu = pick([400, 480, 1000, 1350, 2000, 8500]);
      const D = 0.0259 * mu;
      return MC('Einstein relation', md`$\mu = ${mu}\,\text{cm}^2/\text{V·s}$ at 300 K. $D$ is about…`, `$${S.f(D, 3)}$ cm²/s`,
        [[`$${S.f(D * 10, 3)}$ cm²/s`, '$D = (kT/q)\\mu$ with $kT/q = 0.0259$ V.'], [`$${S.f(mu / 0.0259, 3)}$ cm²/s`, 'Multiply by $kT/q$, don’t divide.'], [`$${S.f(D / 10, 3)}$ cm²/s`, 'Off by ten.']],
        md`$D = 0.0259\times${mu} = ${S.f(D, 3)}\,\text{cm}^2/\text{s}$ (rule of thumb: $D \approx \mu/40$).`);
    },
    () => {
      const k = pick([2, 3]);
      return MC('Hotter carriers', md`Same mobility, but the temperature is ${k}× higher (in kelvin). $D$…`, `×${k}`,
        [['is unchanged', '$D = \\mu kT/q$.'], [`×${k * k}`, 'Linear in $T$.'], [`÷${k}`, 'Hotter carriers spread faster.']],
        md`$D \propto T$ at fixed $\mu$.`);
    },
    () => {
      const k = pick([2, 3, 10]);
      return MC('Spreading time', md`Carriers diffuse a distance $x$ in time $t$. How long to diffuse ${k}× as far?`, `${k * k}t`,
        [[`${k}t`, 'Random walks spread as $\\sqrt t$.'], [`${+Math.sqrt(k).toFixed(2)}t`, 'Inverted: distance grows as $\\sqrt t$, so time grows as distance squared.'], ['the same time', 'Farther takes longer.']],
        md`$x \sim \sqrt{Dt}$ → $t \propto x^2$.`);
    },
    () => {
      const [D, t, tt, x, xu] = pick([[25, 1e-6, '1\\,\\mu\\text{s}', 50, 'μm'], [36, 1e-8, '10\\,\\text{ns}', 6, 'μm'], [9, 1e-6, '1\\,\\mu\\text{s}', 30, 'μm'], [16, 1e-4, '100\\,\\mu\\text{s}', 400, 'μm'], [4, 1e-8, '10\\,\\text{ns}', 2, 'μm']]);
      return MC('How far in a given time', md`$D = ${D}\,\text{cm}^2/\text{s}$. About how far do carriers spread in $${tt}$ ($x \approx \sqrt{Dt}$)?`, `${x} ${xu}`,
        [[`${x * 10} ${xu}`, 'Check the square root of the exponent.'], [`${+(x / Math.sqrt(10)).toFixed(1)} ${xu}`, 'Take the square root of the whole product.'], [`$${S.f(D * t * 1e4, 2)}$ ${xu}`, 'Take the square root.']],
        md`$\sqrt{${D}\times${S.p(t)}} = ${S.f(Math.sqrt(D * t), 2)}$ cm $= ${x}\,\mu$m.`);
    },
    () => MC('Why D and μ go together', md`Why is $D/\mu$ the same ($kT/q$) for every carrier and material?`, 'both come from the same scattering',
      [['by the definition of mobility', 'It is a physical result, not a definition.'], ['because carriers have the same mass everywhere', 'Masses differ; the ratio doesn’t.'], ['it isn’t: it depends on doping', 'Doping changes both together.']],
      md`Equilibrium in a field (Boltzmann distribution) forces $D/\mu = kT/q$.`),
  ]);

  GENS.rf_graded = () => one([
    () => {
      const n = Math.random() < 0.5, falls = pick(['right', 'left']);
      const fdir = n ? falls : (falls === 'right' ? 'left' : 'right');
      return MC('Built-in field direction', md`${n ? 'n' : 'p'}-type doping **falls** to the ${falls}, at equilibrium. The built-in field points to the…`, fdir,
        [[fdir === 'right' ? 'left' : 'right', n ? 'Electrons diffuse toward low doping, uncovering + donors behind: the field points toward low doping.' : 'Holes diffuse toward low doping, uncovering − acceptors behind: the field points toward high doping.'], ['nowhere: it is equilibrium', 'Equilibrium needs the field to cancel diffusion.'], ['up', 'Along $x$.']],
        md`${n ? 'n-type: $\\mathscr{E}$ points toward lower doping.' : 'p-type: $\\mathscr{E}$ points toward higher doping.'} It pushes the majority carriers back against their diffusion.`);
    },
    () => {
      const [L, E] = pick([[1, 259], [0.5, 518], [0.1, 2590], [2, 130]]);
      return MC('Field size', md`Doping varies as $e^{-x/L}$ with $L = ${L}\,\mu$m. The built-in field $kT/qL$ is about…`, `${E} V/cm`,
        [[`${E * 10} V/cm`, 'Convert: 1 μm = $10^{-4}$ cm.'], [`${+(E / 10).toFixed(1)} V/cm`, 'Off by ten.'], ['0.0259 V/cm', 'Divide by $L$ in cm.']],
        md`$0.0259/(${L}\times10^{-4}) \approx ${E}$ V/cm.`);
    },
    () => {
      const k = pick([2, 5, 10]);
      return MC('Steeper grading', md`Sample A's doping changes by $e$ every 1 μm; sample B's every ${k} μm. A's built-in field is…`, `${k}× stronger`,
        [[`${k}× weaker`, 'Steeper grading, stronger field.'], ['equal', '$\\mathscr{E} = kT/qL$ depends on $L$.'], [`${k * k}× stronger`, 'Linear in $1/L$.']],
        md`$\mathscr{E} = kT/qL$.`);
    },
    () => MC('Drift and diffusion in graded material', md`In graded n-type material at equilibrium, the electron drift and diffusion currents are…`, 'each nonzero, equal and opposite',
      [['both zero, by equilibrium', 'There is a gradient and a field.'], ['nonzero, in the same direction', 'Then the total wouldn’t vanish.'], ['only diffusion, no drift', 'The field drives drift.']],
      md`$J_n = 0$ as a sum.`),
    () => MC('Quasi-neutrality', md`The built-in field in graded doping needs only a tiny charge imbalance. So…`, '$n \\approx N_d(x)$ still holds',
      [['the sample is strongly charged', 'A tiny imbalance makes a sizeable field.'], ['$n = 0$', 'Electrons are still there.'], ['$n = n_i$', 'Doping still sets $n$.']],
      md`Net charge densities many decades below $N_d$ already give hundreds of V/cm.`),
  ]);

  // =========================================================================== Topic 12: continuity
  GENS.rf_difflen = () => one([
    () => {
      const [k, w] = pick([[4, 'τ'], [9, 'τ'], [100, 'τ'], [4, 'D'], [9, 'D']]);
      return MC('Scaling the diffusion length', md`$${w === 'τ' ? '\\tau' : 'D'}$ is made ${k}× larger. $L = \sqrt{D\tau}$…`, `×${Math.sqrt(k)}`,
        [[`×${k}`, 'Square root.'], ['unchanged', `$L$ depends on $${w === 'τ' ? '\\tau' : 'D'}$.`], [`×${k * k}`, 'Square root, not square.']],
        md`$\sqrt{${k}} = ${Math.sqrt(k)}$.`);
    },
    () => {
      const [D, t, tt, L] = pick([[25, 1e-6, '1\\,\\mu\\text{s}', 50], [16, 1e-6, '1\\,\\mu\\text{s}', 40], [36, 1e-6, '1\\,\\mu\\text{s}', 60], [9, 1e-4, '100\\,\\mu\\text{s}', 300], [4, 1e-8, '10\\,\\text{ns}', 2]]);
      return MC('Diffusion length', md`$D = ${D}\,\text{cm}^2/\text{s}$, $\tau = ${tt}$. $L$ is about…`, `${L} μm`,
        [[`${L * 10} μm`, 'Mind the square root of the exponent.'], [`${+(L / Math.sqrt(10)).toFixed(1)} μm`, 'Root the whole product.'], [`$${S.f(D * t * 1e4, 2)}$ μm`, 'Take the square root of $D\\tau$.']],
        md`$\sqrt{${D}\times${S.p(t)}} = ${S.f(Math.sqrt(D * t), 2)}$ cm $= ${L}\,\mu$m.`);
    },
    () => {
      const [m, pc, tex] = pick([[1, 37, 'L_p'], [2, 14, '2L_p'], [3, 5, '3L_p'], [0.69, 50, '0.69L_p'], [2.3, 10, '2.3L_p']]);
      return MC('Profile', md`Steady injection into a long bar: what fraction of the surface excess is left at $x = ${tex}$?`, `${pc}%`,
        [[`${100 - pc}%`, 'That fraction has recombined on the way.'], [`${Math.max(0, Math.round(100 - 100 * m / 4))}%`, 'Exponential, not linear (that is the short-bar shape).'], ['0%', 'An exponential never reaches zero.']],
        md`$e^{-${m}} \approx ${pc / 100}$.`);
    },
    () => MC('Doping and diffusion length', md`A bar is doped more heavily (direct recombination, similar mobility). The minority diffusion length…`, 'shrinks, as the lifetime drops',
      [['grows, as more carriers diffuse', 'More majority carriers shorten the minority lifetime.'], ['is unchanged: same mobility', '$L = \\sqrt{D\\tau}$ depends on $\\tau$.'], ['becomes infinite', '$L = \\sqrt{D\\tau}$ is finite for any finite $\\tau$.']],
      md`$\tau \propto 1/N$, so $L \propto 1/\sqrt N$.`),
  ]);

  GENS.rf_conv = () => one([
    () => {
      const [m, pc, tex] = pick([[1, 37, 'L_p'], [2, 14, '2L_p'], [0.69, 50, '0.69L_p'], [3, 5, '3L_p']]);
      return MC('Where the current goes', md`Holes are injected steadily into a long n-type bar. At $x = ${tex}$, what share of the current do holes still carry?`, `${pc}%`,
        [['100%', 'Holes recombine on the way, and the electron current takes over.'], [pc === 50 ? '25%' : `${100 - pc}%`, pc === 50 ? 'That would be two halvings, at $x = 1.39L_p$.' : 'That is the electrons’ share.'], ['0%', 'Not yet that deep.']],
        md`$J_p \propto e^{-x/L_p}$; the total current is constant, so $J_n = J - J_p$.`);
    },
    () => {
      const k = pick([2, 5, 10]);
      return MC('Short versus long bar', md`Same $\Delta p$ injected into a short bar ($W = L_p/${k}$, ending in a contact) and a long bar. The short bar carries…`, `${k}× more`,
        [[`${k}× less`, 'A steeper gradient drives more diffusion current.'], ['the same', 'Gradients differ: $\\Delta p/W$ versus $\\Delta p/L_p$.'], [`${k * k}× more`, 'Ratio $L_p/W$, not squared.']],
        md`$J = qD\Delta p/W$ versus $qD\Delta p/L_p$.`);
    },
    () => {
      const [ch, R, W] = pick([
        ['the stored charge $Q_p$ doubles (same $\\tau_p$)', 'doubles', [['halves', 'More stored charge recombining per second needs more current.'], ['is unchanged', '$I = Q_p/\\tau_p$.']]],
        ['$\\tau_p$ doubles with the same stored charge', 'halves', [['doubles', 'Longer-lived carriers need replacing less often.'], ['is unchanged', '$I = Q_p/\\tau_p$.']]],
      ]);
      return MC('Charge control', md`In steady injection, $I = Q_p/\tau_p$. If ${ch}, the injected current…`, R, W.concat([['becomes zero', 'No.']]),
        md`Steady state: you must replace the stored holes at the rate they recombine.`);
    },
    () => {
      const shortBar = Math.random() < 0.5;
      return MC('Profile shape', md`In a ${shortBar ? 'short bar ($W \\ll L_p$, ending in a contact)' : 'long bar ($W \\gg L_p$)'}, the steady excess hole profile is…`, shortBar ? 'a straight line' : 'an exponential',
        [[shortBar ? 'an exponential' : 'a straight line', shortBar ? 'With negligible recombination, $d^2\\delta p/dx^2 = 0$: linear.' : 'Recombination along the way makes it exponential.'], ['flat at $\\Delta p$', 'There must be a gradient to carry the current.'], ['a bell curve', 'That is a spreading pulse.']],
        md`${shortBar ? 'No time to recombine: linear.' : 'Each slice loses the same fraction: exponential.'}`);
    },
  ]);

  GENS.rf_cont = () => one([
    () => {
      const [where, R, W] = pick([
        ['at a peak of the profile', 'falls: carriers spread out', [['rises: carriers gather', 'Negative curvature means net outflow.']]],
        ['at a dip in the profile', 'rises: carriers flow in', [['falls: carriers leave', 'Positive curvature means net inflow.']]],
        ['where the profile is a straight line', 'stays the same: in = out', [['rises: carriers pile up', 'Zero curvature: equal flow in and out.']]],
      ]);
      return MC('Reading curvature', md`No field, no generation; ignore recombination. ${where}, diffusion makes $\delta p$…`, R, W.concat([['oscillates about its value', 'Diffusion only smooths.']]),
        md`$\partial\delta p/\partial t = D\,\partial^2\delta p/\partial x^2$: curvature decides.`);
    },
    () => MC('Steady state', md`"Steady state" ($\partial p/\partial t = 0$) in an injection problem means…`, 'the profile is frozen; holes still flow',
      [['the holes have stopped moving', 'Flows continue; they balance at each point.'], ['no current flows anywhere', 'A steady current flows.'], ['the sample is in equilibrium', 'Far from it: $np > n_i^2$.']],
      md`At each $x$: inflow − outflow = recombination.`),
    () => {
      const [what, R] = pick([['arrival time', 'μ (mobility)'], ['width', 'D (diffusion)'], ['shrinking area', 'τ (lifetime)']]);
      const all = ['μ (mobility)', 'D (diffusion)', 'τ (lifetime)', 'E_g (band gap)'];
      return MC('Drifting pulse', md`A pulse of holes drifts down a bar in a field. Its **${what}** at a probe downstream measures…`, R,
        all.filter((x) => x !== R).map((x) => [x, { 'μ (mobility)': 'That comes from the arrival time.', 'D (diffusion)': 'That comes from the width.', 'τ (lifetime)': 'That comes from the area.', 'E_g (band gap)': 'Not measured here.' }[x]]),
        md`Drift speed $\mu\mathscr{E}$ → arrival time; spread $\sqrt{2Dt}$ → width; recombination → area.`);
    },
    () => {
      const k = pick([4, 9, 16]);
      return MC('Pulse width', md`A pulse is probed ${k}× farther downstream (same drift speed). Its width is about…`, `${Math.sqrt(k)}× larger`,
        [[`${k}× larger`, 'Width grows as $\\sqrt t$.'], ['the same', 'It keeps spreading.'], [`${Math.sqrt(k)}× smaller`, 'Diffusion widens it.']],
        md`${k}× the time → $\sqrt{${k}} = ${Math.sqrt(k)}$× the width.`);
    },
    () => MC('Uniform light', md`A uniform bar is lit uniformly from $t = 0$. With no gradients, the continuity equation reduces to…`, '$d\\,\\delta p/dt = g_{op} - \\delta p/\\tau_p$',
      [['$d\\,\\delta p/dt = D\\,d^2\\delta p/dx^2$', 'No gradients, no diffusion term.'], ['$d\\,\\delta p/dt = 0$ from the start', 'It takes about $\\tau$ to build up.'], ['$\\delta p = g_{op}$', 'Units don’t match: $g$ is per second.']],
      md`The leaky bucket of Topic 10.`),
  ]);

  Object.assign(RF.topics, {
    't9-recomb': [
      { gen: 'rf_life', title: 'Lifetime and decay', rule: md`Low level: $\tau = 1/(\alpha_rN_{\text{maj}})$; $e^{-1}$ = 37%, $\ln2$ → 50%, 2.3τ → 10%; the minority changes by a huge factor, the majority barely.` },
      { gen: 'rf_high', title: 'High-level injection', rule: md`$\delta n = \Delta n/(1 + \alpha_r\Delta n\,t)$: halves at $1/(\alpha_r\Delta n)$; bigger flash, faster start.` },
      { gen: 'rf_trap', title: 'Traps and recombination centers', rule: md`Si recombines through midgap defects (heat); GaAs directly (light); shallow levels trap and re-emit; $\alpha_r(np - n_i^2)$ sign = recombine or generate.` },
    ],
    't10-qfl': [
      { gen: 'rf_qfl', title: 'Reading quasi-Fermi levels', rule: md`Each 0.06 eV of $F_n - E_i$ (or $E_i - F_p$) is a decade above $n_i$; $np/n_i^2 = 10^{(F_n - F_p)/0.06\,\text{eV}}$; split means not equilibrium.` },
      { gen: 'rf_gtau', title: 'Steady state under light', rule: md`$\delta n = g\tau$; the minority QFL moves $kT\ln(\text{factor})$; the majority QFL barely moves; response time $\sim\tau$.` },
      { gen: 'rf_photoc', title: 'Photoconductivity', rule: md`$\Delta\sigma = q\,\delta n(\mu_n + \mu_p)$; electrons give 74% in Si; linear in light at low level.` },
    ],
    't11-diffusion': [
      { gen: 'rf_diffdir', title: 'Diffusion directions', rule: md`Particles flow down their gradient; electron current opposite to electron flow ($J_n = +qD_n\,dn/dx$), hole current along hole flow ($J_p = -qD_p\,dp/dx$).` },
      { gen: 'rf_einstein', title: 'D, μ and √t', rule: md`$D = 0.0259\,\mu \approx \mu/40$; $D \propto T$; spread $\sim\sqrt{Dt}$: twice as far takes four times as long.` },
      { gen: 'rf_graded', title: 'Graded doping', rule: md`n-type: field points toward lower doping; p-type: toward higher; $\mathscr{E} = kT/qL$ (259 V/cm for 1 μm); drift and diffusion cancel.` },
    ],
    't12-continuity': [
      { gen: 'rf_difflen', title: 'Diffusion length', rule: md`$L = \sqrt{D\tau}$; $\delta p = \Delta p\,e^{-x/L}$: 37% at $L$, 14% at $2L$, 5% at $3L$.` },
      { gen: 'rf_conv', title: 'Where the current goes', rule: md`Total current constant; hole current dies as $e^{-x/L_p}$, electrons take over; short bar $J = qD\Delta p/W$; $I = Q_p/\tau_p$.` },
      { gen: 'rf_cont', title: 'Continuity and pulses', rule: md`Curvature decides: peaks fall, dips fill; steady state ≠ equilibrium; a drifting pulse gives $\mu$ (time), $D$ (width), $\tau$ (area).` },
    ],
  });

  Object.assign(RF.why, {
    't9-recomb': md`Light makes extra carriers; how long do they live? That lifetime sets how fast a diode switches, how efficient a solar cell is and whether a material can make an LED. Minority carriers run every device, and this is where you learn to think in them.`,
    't10-qfl': md`Under light, one Fermi level isn't enough: electrons and holes each get their own. The gap between the two is literally the voltage a solar cell can deliver. This is the picture behind every optoelectronic device.`,
    't11-diffusion': md`Carriers don't need a field to move: a crowd spreads out on its own. Diffusion is how current flows in diodes and bipolar transistors, and the Einstein relation ties it to mobility, so one number gives you both.`,
    't12-continuity': md`The last piece: carriers diffuse and die at the same time. The diffusion length you get here is the yardstick for every junction device in Exam 2. Master the exponential profile and the "where does the current go" picture and you are ready.`,
  });
})();

/* rapid-e2.js — rapid-fire drills for Exam 2 (junctions, Ch. 5 and 8). Two kinds:
   1. "What happens to…" trend cards: one knob turns (doping, T, bias, lifetime, gap, area, light…), you say which way
      a quantity moves. They come from the TRENDS table below (knob lines start with @; rows are tag | quantity | dir | why).
   2. Mental-math cards per topic (GENS.rf2_*): 60 mV per decade, square-root scalings, charge balance, ratios.
   RF2.topics[lessonId] lists the drills each Exam 2 lesson shows; RF2.all is every drill (speed round, mixed practice). */
(function () {
  'use strict';
  const md = String.raw;
  const { pick, ri, shuffle } = U;
  const RF = window.RF;
  const MC = RF.MC;
  const RF2 = (window.RF2 = { topics: {}, all: [] });
  const f2 = (x) => x.toFixed(2), f3 = (x) => x.toFixed(3);
  const sf = (x) => S.f(x), sp = (x) => S.p(x);
  // a drill that avoids repeating its last few cards
  const fresh = (fn, keep = 6) => { const last = []; return () => { for (let i = 0; i < 12; i++) { const c = fn(); const k = c.q; if (!last.includes(k) || i === 11) { last.push(k); if (last.length > keep) last.shift(); return c; } } return fn(); }; };
  const one = (list) => pick(list)();

  // =========================================================================== trend cards
  const TRENDS = md`
@ In a p⁺-n junction, the doping $N_d$ of the lightly doped n side is raised (say ×4).
eq | the contact potential $V_0$ | up | $V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$. More donors push $E_F$ closer to $E_c$ on the n side, so the bands must bend further to line the Fermi levels up. Only logarithmically: +18 mV per doubling, +36 mV for ×4.
depl | the depletion width $W$ | down | The light side sets the width: $W \approx \sqrt{2\epsilon(V_0 - V)/qN_d}$. Denser donors uncover the charge the junction needs in a thinner layer. ×4 doping → about ×½ width.
depl | the slice $x_{p0}$ of the depletion region inside the p⁺ side | up | Charge balance $N_ax_{p0} = N_dx_{n0}$. The uncovered charge per area $qN_dx_{n0} \propto \sqrt{N_d}$ grows, so the p⁺ side must uncover more too (still tiny).
depl | the peak field $\mathscr{E}_0$ | up | Gauss: $\mathscr{E}_0 = qN_dx_{n0}/\epsilon \propto \sqrt{N_d(V_0 - V)}$. More charge per area means more field lines.
depl | the uncovered charge per area $qN_dx_{n0}$ | up | $\propto \sqrt{N_d}$: the layer is thinner by $\sqrt{N_d}$ but denser by $N_d$.
cap | the junction capacitance $C_j$ at a fixed reverse bias | up | $C_j = \epsilon A/W$ with $W \propto N_d^{-1/2}$: the "plates" move closer together. This is exactly why a $1/C^2$ plot measures doping.
diode | the reverse saturation current $I_0$ | down | $I_0 \approx qA\frac{D_p}{L_p}p_n$ with $p_n = n_i^2/N_d$. Fewer minority holes live on the n side, so fewer can be injected or collected.
diode | the forward voltage needed for 1 mA | up | $I_0$ fell, so $e^{qV/kT}$ must make up the difference: +60 mV for every factor of 10 in $N_d$.
diode | the electric field deep in the neutral n region at a fixed current | down | Far from the junction all of the current is majority-electron drift: $\mathscr{E} = J/q\mu_nN_d$. More electrons carry the same current with less field.
break | the reverse breakdown voltage $V_{br}$ | down | $V_{br} \approx \epsilon\mathscr{E}_{crit}^2/2qN_d$. The field grows faster with voltage, so it reaches the critical field sooner. Dope heavily enough and it turns into Zener breakdown.
opto | the open-circuit voltage of a p⁺-n solar cell | up | $V_{oc} \approx \frac{kT}{q}\ln\frac{I_{op}}{I_{th}}$ and $I_{th} \propto n_i^2/N_d$ fell. (The real-world catch: heavy doping also shortens lifetimes.)
cap | the charge-storage capacitance $C_s$ at a fixed forward current | same | $C_s = \frac{q}{kT}I\tau_p$. At a fixed current the stored charge $Q_p = I\tau_p$ doesn't depend on doping at all.
@ In a p⁺-n junction (already $N_a \gg N_d$), the heavy side's doping $N_a$ is raised further.
eq | the contact potential $V_0$ | up | Logarithmic, +18 mV per doubling: the p⁺ Fermi level slides closer to $E_v$.
depl | the depletion width $W$ | same | $W = \sqrt{\frac{2\epsilon(V_0 - V)}{q}\left(\frac{1}{N_a} + \frac{1}{N_d}\right)}$: the $1/N_a$ term was already negligible. The light side sets the width.
depl | the slice $x_{p0}$ inside the p⁺ side | down | $x_{p0} = x_{n0}N_d/N_a$: the same charge packed into a denser layer is thinner.
diode | the reverse saturation current $I_0$ | same | $I_0 \propto \frac{D_p}{L_pN_d} + \frac{D_n}{L_nN_a}$. The electron term was already negligible, so the light side still sets the current.
diode | the fraction of the current carried by holes | up | Hole injection $\propto p_n = n_i^2/N_d$, electron injection $\propto n_p = n_i^2/N_a$. A bigger $N_a$ shrinks the electron share further.
break | the breakdown voltage $V_{br}$ | same | The light side holds nearly all of the depletion width and voltage, so it sets $V_{br}$.
cap | the junction capacitance $C_j$ | same | $W$ is set by the light side, so $C_j = \epsilon A/W$ barely moves.
@ The temperature of a Si diode rises (doping fixed, still extrinsic).
eq | $n_i$ | up | $n_i \propto T^{3/2}e^{-E_g/2kT}$: about ×2 every 9 K near room temperature, so $n_i^2$ doubles every ~4.5 K.
eq | the contact potential $V_0$ | down | $V_0 = \frac{kT}{q}\ln\frac{N_aN_d}{n_i^2}$. $n_i^2$ grows exponentially and beats the $kT$ prefactor. Both Fermi levels slide toward midgap, so there is less to line up. (At very high T the material goes intrinsic and $V_0 \to 0$.)
depl | the zero-bias depletion width | down | $W \propto \sqrt{V_0}$ and $V_0$ fell. A small effect.
diode | the reverse saturation current $I_0$ | up | $I_0 \propto n_i^2 \propto T^3e^{-E_g/kT}$: about 15% per kelvin in Si, ×2 every ~5 K. This is the steepest temperature dependence in the course.
diode | the forward voltage at a fixed current | down | $V = \frac{kT}{q}\ln(I/I_0)$, and $I_0$ grows far faster than $kT$. About −2 mV/K in Si.
break | the avalanche breakdown voltage | up | A hotter lattice scatters carriers more (more phonons), so they lose energy between collisions and need a stronger field to reach the ionization energy. Positive temperature coefficient.
break | the Zener breakdown voltage | down | $E_g$ shrinks as T rises, so the tunneling barrier gets thinner and lower. Negative temperature coefficient.
opto | a solar cell's open-circuit voltage | down | $V_{oc} = \frac{kT}{q}\ln\frac{I_{op}}{I_{th}}$ with $I_{th} \propto n_i^2$ climbing steeply. Hot panels make less voltage.
break | the generation current from the depletion region | up | $I_{gen} \propto n_iW/\tau$: it grows like $n_i$, slower than the diffusion current ($\propto n_i^2$). That is why the diffusion current dominates reverse leakage when hot and generation dominates at room temperature in Si.
@ The reverse bias $V_R$ on a junction is increased (still below breakdown).
bias | the barrier height | up | It becomes $q(V_0 + V_R)$: the applied voltage adds to the built-in one.
depl | the depletion width $W$ | up | $W \propto \sqrt{V_0 + V_R}$: more voltage must be held, so more charge must be uncovered.
depl | the peak field $\mathscr{E}_0$ | up | $\mathscr{E}_0 = 2(V_0 + V_R)/W \propto \sqrt{V_0 + V_R}$.
cap | the junction capacitance $C_j$ | down | $C_j = \epsilon A/W$ and $W$ grows. A voltage-tuned capacitor: a varactor.
diode | the ideal (diffusion) reverse current | same | Once $V_R$ exceeds a few $kT/q$ (≈0.1 V), the minority carriers at the depletion edges are already pulled to ≈0. The current is limited by how fast minority carriers are generated within a diffusion length of the edge, not by the voltage: it saturates at $-I_0$.
break | the generation current in the depletion region | up | $I_{gen} = qAn_iW/2\tau_0$ and $W$ grows with $\sqrt{V_0 + V_R}$: why real reverse currents creep up instead of staying flat.
bias | the minority-hole density at the n-side depletion edge | same | It is already $p_ne^{-qV_R/kT} \approx 0$. More reverse bias can't push it below zero.
bias | the gap between the quasi-Fermi levels in the depletion region | up | $\lvert F_n - F_p\rvert = q\lvert V\rvert$. In reverse bias $F_n$ sits below $F_p$, so $np = n_i^2e^{-qV_R/kT} \ll n_i^2$: the region is starved of carriers.
@ The forward bias $V$ on a junction is increased (still below $V_0$).
bias | the barrier height | down | $q(V_0 - V)$: forward bias works against the built-in voltage.
depl | the depletion width $W$ | down | $W \propto \sqrt{V_0 - V}$.
depl | the peak field $\mathscr{E}_0$ | down | $\propto\sqrt{V_0 - V}$.
bias | the excess holes at the n-side depletion edge $\Delta p_n$ | up | $\Delta p_n = p_n(e^{qV/kT} - 1)$: ×10 for every 60 mV.
diode | the current | up | ×10 per 60 mV, ×e per 26 mV.
cap | the junction capacitance $C_j$ | up | $W$ shrinks.
cap | the charge-storage capacitance $C_s$ | up | $C_s = \frac{q}{kT}I\tau_p$ and $I$ grows exponentially. In forward bias $C_s$ soon dwarfs $C_j$.
cap | the small-signal resistance $dV/dI$ | down | $G_s = dI/dV = qI/kT$: 26 Ω at 1 mA, 2.6 Ω at 10 mA.
bias | the stored minority charge $Q_p$ | up | $Q_p = qAL_p\Delta p_n = I_p\tau_p$.
@ The minority-carrier lifetime $\tau_p$ on the n side drops (gold doping, say); nothing else changes.
diode | the diffusion length $L_p$ | down | $L_p = \sqrt{D_p\tau_p}$.
diode | the reverse saturation current $I_0$ | up | $I_0 \propto D_p/L_p = \sqrt{D_p/\tau_p}$: carriers recombine sooner, so the profile is steeper at the edge and more current flows.
cap | the storage delay time $t_{sd}$ | down | $t_{sd} = \tau_p\ln(1 + I_f/I_r)$: there is less stored charge, and it also recombines away faster on its own. Gold doping is how fast-switching Si diodes are made.
cap | the stored charge at a fixed forward current | down | $Q_p = I\tau_p$.
opto | a solar cell's short-circuit current | down | $I_{op} = qAg_{op}(L_p + L_n + W)$: only carriers generated within about a diffusion length of the junction are collected.
opto | a solar cell's open-circuit voltage | down | $I_{op}$ falls and $I_{th}$ rises; both hurt $V_{oc} = \frac{kT}{q}\ln(I_{op}/I_{th})$.
depl | the depletion width $W$ | same | Lifetime is about recombination of excess carriers. The depletion region's electrostatics depends only on doping and voltage.
@ Si is replaced by a semiconductor with a larger band gap (same doping and geometry).
eq | $n_i$ | down | $n_i \propto e^{-E_g/2kT}$: GaAs's $n_i$ is about $10^4$ times smaller than Si's.
eq | the contact potential $V_0$ | up | $n_i^2$ is far smaller, so $\ln(N_aN_d/n_i^2)$ is bigger: GaAs junctions sit near 1.2–1.3 V vs 0.7–0.9 V in Si. $V_0$ can approach $E_g/q$ but never exceed it.
diode | the reverse saturation current $I_0$ | down | $\propto n_i^2$: GaAs's is ~$10^{8}$ times smaller than Si's.
diode | the turn-on voltage | up | Ge ≈ 0.3 V, Si ≈ 0.7 V, GaAs ≈ 1.1 V. A tiny $I_0$ needs a big $e^{qV/kT}$; the turn-on roughly tracks $E_g$.
break | the avalanche breakdown voltage | up | Each ionizing collision must supply about $E_g$, so carriers need a stronger field: a larger critical field.
opto | an LED's emission wavelength | down | $\lambda\,[\mu\text{m}] \approx 1.24/E_g\,[\text{eV}]$: bigger gap, bluer light.
opto | a solar cell's $V_{oc}$ | up | $I_{th} \propto n_i^2$ is smaller.
opto | a solar cell's $I_{sc}$ in sunlight | down | Photons with $h\nu < E_g$ pass straight through: fewer absorbed photons. The trade-off with $V_{oc}$ puts the best single-junction gap near 1.1–1.4 eV.
@ The junction area $A$ doubles (same doping, same bias).
diode | the saturation current $I_0$ | up | Current scales with area: ×2.
cap | the junction capacitance $C_j$ | up | Parallel plates of twice the area: ×2.
depl | the depletion width $W$ | same | The electrostatics per unit area is unchanged.
depl | the peak field $\mathscr{E}_0$ | same | Field depends on charge per area.
break | the breakdown voltage | same | The field-vs-voltage relation per area is unchanged.
opto | a solar cell's $V_{oc}$ (same light intensity) | same | $I_{op}$ and $I_{th}$ both double; their ratio doesn't change.
@ The light shining on a solar cell doubles in intensity.
opto | the short-circuit current $I_{sc}$ | up | ×2: $I_{sc} = I_{op} \propto g_{op}$.
opto | the open-circuit voltage $V_{oc}$ | up | Only by $\frac{kT}{q}\ln 2 = 18$ mV: logarithmic.
opto | the maximum power $P_{max}$ | up | $P_{max} = FF\cdot I_{sc}V_{oc}$: a bit more than ×2.
opto | a reverse-biased photodiode's current | up | ×2: in the third quadrant the current is just $-I_{op}$, proportional to the light.
opto | the depletion width of a reverse-biased photodiode | same | At low level, the depletion region is set by doping and voltage.
@ The forward current through a long p⁺-n diode doubles.
bias | $\Delta p_n$ at the depletion edge | up | ×2: $I = qA\frac{D_p}{L_p}\Delta p_n$.
diode | the voltage across the junction | up | By just $\frac{kT}{q}\ln 2 = 18$ mV.
cap | the storage capacitance $C_s$ | up | ×2: $C_s \propto I$.
cap | the storage delay time (same turn-off current $I_r$) | up | $t_{sd} = \tau_p\ln(1 + I_f/I_r)$: more stored charge to remove.
diode | the diffusion length $L_p$ | same | A material property, $\sqrt{D_p\tau_p}$, independent of bias at low level.
@ When the diode is switched off, a larger reverse current $I_r$ is pulled out (same forward current $I_f$ before the switch).
cap | the storage delay time $t_{sd}$ | down | $\tau_p\ln(1 + I_f/I_r)$: the stored holes are extracted faster.
cap | the stored charge at the instant of switching | same | $Q_p = I_f\tau_p$ was set by the forward current before the switch.
@ A metal on n-type Si: the metal's work function $\phi_m$ is raised (still $\phi_m > \phi_s$).
ms | the Schottky barrier seen from the metal, $\phi_B = \phi_m - \chi$ | up | One-for-one with $\phi_m$ (ideal contact, no Fermi-level pinning).
ms | the built-in voltage $V_0 = \phi_m - \phi_s$ | up | More electrons must move from the semiconductor to the metal to line up the Fermi levels.
ms | the reverse saturation current | down | $I_0 \propto e^{-q\phi_B/kT}$: a higher barrier lets fewer electrons over from the metal.
ms | the depletion width in the semiconductor | up | Like a one-sided junction: $W \propto \sqrt{V_0 - V}$.
@ A p⁺-n diode is replaced by a Schottky diode on the same n-type Si.
ms | the forward turn-on voltage | down | $I_0 \propto e^{-q\phi_B/kT}$ is typically orders of magnitude larger than a p-n diode's $I_0$: turn-on near 0.3 V.
ms | the storage delay time | down | A majority-carrier device: electrons go over the barrier into the metal and thermalize there; no minority charge is stored, so it switches essentially instantly.
ms | the reverse leakage current | up | The same large $I_0$.
@ In a narrow-base p⁺-n diode ($\ell \ll L_p$), the neutral base width $\ell$ is halved.
narrow | the current at a fixed forward voltage | up | ×2: $I = qAD_p\Delta p_n/\ell$. The straight-line gradient doubles.
narrow | the stored hole charge | down | ×½: $Q_p = \frac12qA\ell\Delta p_n$, a smaller triangle.
narrow | the transit time across the base | down | ×¼: $t_t = \ell^2/2D_p = Q_p/I$.
narrow | the voltage drop across the neutral base | same | $\approx \frac{kT}{q}\frac{\Delta p_n}{N_d}$, independent of $\ell$: the field doubles but acts over half the length.
narrow | $\Delta p_n$ at the junction edge (fixed V) | same | Law of the junction: set by $V$ alone.
@ Haynes–Shockley: the field along the bar is doubled (same bar, same detector distance).
hs | the pulse's arrival time | down | ×½: $t_d = L/\mu_p\mathscr{E}$.
hs | the pulse's spread when it arrives | down | Less time to spread: width $\propto\sqrt{D_pt_d}$, ×$1/\sqrt2$.
hs | the measured mobility | same | A material property; you just measure it sooner.
hs | the peak height of the arriving pulse | up | Less spreading and less recombination on the way.
`;

  const DIR = { up: '↑ increases', down: '↓ decreases', same: '≈ stays the same (or changes negligibly)' };
  const TR = [];
  { let knob = null; TRENDS.split('\n').forEach((line) => { const s = line.trim(); if (!s) return; if (s.startsWith('@ ')) { knob = s.slice(2); return; } const [tag, qty, dir, why] = s.split(' | '); TR.push({ knob, tag, qty, dir, why }); }); }
  // options always in the same order (up, down, same), so the answer is a single thought
  const trendCard = (r) => {
    const said = r.dir === 'up' ? 'It goes up.' : r.dir === 'down' ? 'It goes down.' : 'It stays put.';
    const order = ['up', 'down', 'same'];
    return { title: 'What happens?', q: md`${r.knob}

What happens to **${r.qty}**?`, parts: [{ mc: order.map((d) => DIR[d]), a: order.indexOf(r.dir), why: order.map((d) => (d === r.dir ? null : `${said} ${r.why}`)), fixed: true }], sol: r.why };
  };
  const trendGen = (tags) => fresh(() => trendCard(pick(TR.filter((r) => !tags || tags.includes(r.tag)))), 10);
  GENS.rf2_trend = trendGen(null);
  ['hs', 'eq', 'depl', 'bias', 'diode', 'narrow', 'break', 'cap', 'ms', 'opto'].forEach((t) => { GENS[`rf2_tr_${t}`] = trendGen([t]); });
  RF2.trendCount = TR.length;

  // =========================================================================== scaling cards (by how much?)
  GENS.rf2_scale = fresh(() => one([
    () => {   // light-side doping
      const k = pick([4, 9, 16, 100]), r = Math.sqrt(k);
      const [what, right, why] = pick([
        ['the depletion width $W$', `×1/${r}`, md`$W \propto N_d^{-1/2}$`],
        ['the junction capacitance $C_j$', `×${r}`, md`$C_j = \epsilon A/W \propto N_d^{1/2}$`],
        ['the peak field $\mathscr{E}_0$', `×${r}`, md`$\mathscr{E}_0 = 2(V_0 - V)/W \propto N_d^{1/2}$`],
        ['the reverse saturation current $I_0$', `×1/${k}`, md`$I_0 \propto p_n = n_i^2/N_d$`],
        ['the breakdown voltage (avalanche, fixed $\mathscr{E}_{crit}$)', `×1/${k}`, md`$V_{br} = \epsilon\mathscr{E}_{crit}^2/2qN_d$`],
      ]);
      const all = [`×1/${r}`, `×${r}`, `×1/${k}`, `×${k}`];
      return MC('By how much?', md`A p⁺-n junction's n-side doping goes **×${k}**. Ignoring the small (logarithmic) change in $V_0$, ${what} goes…`, right,
        all.filter((x) => x !== right).map((x) => [x, md`${why}, so ×${k} doping gives ${right}.`]), md`${why}. Square roots for $W$, $C_j$, $\mathscr{E}_0$; the full power for $I_0$ and $V_{br}$.`);
    },
    () => {   // total junction voltage
      const k = pick([4, 9, 16]), r = Math.sqrt(k);
      const [what, right, why] = pick([
        ['$W$', `×${r}`, md`$W \propto \sqrt{V_0 + V_R}$`], ['$C_j$', `×1/${r}`, md`$C_j \propto 1/W \propto (V_0 + V_R)^{-1/2}$`],
        ['$\\mathscr{E}_0$', `×${r}`, md`$\mathscr{E}_0 = 2(V_0 + V_R)/W \propto \sqrt{V_0 + V_R}$`], ['the uncovered charge', `×${r}`, md`$Q = qAN_dx_{n0} \propto W$`],
      ]);
      const all = [`×${r}`, `×1/${r}`, `×${k}`, `×1/${k}`];
      return MC('By how much?', md`The total voltage across a junction, $V_0 + V_R$, goes **×${k}** (more reverse bias). ${what} goes…`, right,
        all.filter((x) => x !== right).map((x) => [x, md`${why}.`]), md`${why}: square roots everywhere.`);
    },
    () => {   // forward voltage step
      const [dv, k] = pick([[18, '2'], [36, '4'], [60, '10'], [120, '100'], [180, '1000'], [42, '5'], [78, '20']]);
      const all = ['2', '4', '5', '10', '20', '100', '1000', '3'].map((x) => `×${x}`);
      const right = `×${k}`;
      return MC('Diode current', md`A diode is forward biased (ideal, $n = 1$, 300 K). The voltage goes up by **${dv} mV**. The current goes…`, right,
        shuffle(all.filter((x) => x !== right)).slice(0, 3).map((x) => [x, md`Use 60 mV per decade and 18 mV per doubling: ${dv} mV → ${right}.`]),
        md`$I_2/I_1 = e^{\Delta V/(kT/q)} = e^{${dv}/25.9}$ ≈ ${k}. Anchors: 18 mV ↔ ×2, 42 mV ↔ ×5, 60 mV ↔ ×10.`);
    },
    () => {   // current ratio -> voltage
      const [k, dv] = pick([['2', 18], ['4', 36], ['10', 60], ['100', 120], ['1000', 180], ['8', 54]]);
      const all = [18, 36, 54, 60, 120, 180, 26, 240].map((x) => `+${x} mV`);
      const right = `+${dv} mV`;
      return MC('Diode voltage', md`To make a forward-biased diode carry **${k}×** the current, the voltage must go up by about…`, right,
        shuffle(all.filter((x) => x !== right)).slice(0, 3).map((x) => [x, md`$\Delta V = \frac{kT}{q}\ln(${k})$ = ${dv} mV.`]),
        md`$\Delta V = 25.9\text{ mV}\times\ln ${k}$ ≈ ${dv} mV. Every factor of 10 costs 60 mV, every doubling 18 mV.`);
    },
    () => {   // lifetime
      const k = pick([4, 9, 16]), r = Math.sqrt(k);
      const [what, right, why] = pick([
        ['$L_p$', `×${r}`, md`$L_p = \sqrt{D_p\tau_p}$`], ['$I_0$', `×1/${r}`, md`$I_0 \propto D_p/L_p \propto \tau_p^{-1/2}$`],
        ['the storage delay time', `×${k}`, md`$t_{sd} = \tau_p\ln(1 + I_f/I_r) \propto \tau_p$`], ['the stored charge at a fixed current', `×${k}`, md`$Q_p = I\tau_p$`],
      ]);
      const all = [`×${r}`, `×1/${r}`, `×${k}`, `×1/${k}`];
      return MC('By how much?', md`The hole lifetime $\tau_p$ in the n side of a long p⁺-n diode goes **×${k}**. ${what} goes…`, right,
        all.filter((x) => x !== right).map((x) => [x, md`${why}.`]), md`${why}.`);
    },
    () => {   // light intensity
      const k = pick([1, 2, 3]);
      const right = `+${60 * k} mV`;
      return MC('Solar cell', md`The light on a solar cell goes **×${Math.pow(10, k)}**. $V_{oc}$ rises by about…`, right,
        [[`+${180 * k} mV`, md`$V_{oc}$ is logarithmic in the light.`], [`+${26 * k} mV`, md`That is $kT/q$ per decade; you need $\frac{kT}{q}\ln 10$ = 60 mV per decade.`], [`×${Math.pow(10, k)}`, md`That is $I_{sc}$; $V_{oc}$ grows only logarithmically.`], [`+${120 * k} mV`, md`That would be an ideality factor of 2.`]],
        md`$V_{oc} = \frac{kT}{q}\ln(I_{op}/I_{th})$: each decade of light adds 60 mV, while $I_{sc}$ goes ×${Math.pow(10, k)}.`);
    },
    () => {   // narrow base
      const k = pick([2, 3, 4]);
      const [what, right, why] = pick([
        ['the current at fixed $V$', `×1/${k}`, md`$I = qAD_p\Delta p_n/\ell$`], ['the stored charge', `×${k}`, md`$Q_p = \tfrac12qA\ell\Delta p_n$`],
        ['the transit time', `×${k * k}`, md`$t_t = \ell^2/2D_p$`],
      ]);
      const all = [`×${k}`, `×1/${k}`, `×${k * k}`, `×1/${k * k}`];
      return MC('Narrow base', md`A narrow-base p⁺-n diode's neutral base gets **×${k}** wider (still $\ll L_p$). ${what} goes…`, right,
        all.filter((x) => x !== right).map((x) => [x, md`${why}.`]), md`${why}.`);
    },
  ]), 8);

  // =========================================================================== Topic 13: Haynes–Shockley, quasi-Fermi gradients
  GENS.rf2_hs = fresh(() => one([
    () => {
      const L = pick([0.5, 1, 2]), td = pick([50, 100, 200, 250]), E = pick([5, 10, 20]);
      const v = L / (td * 1e-6), mu = v / E;
      const right = `$${sp(mu)}$ cm²/V·s`;
      return MC('Mobility from a pulse', md`A hole pulse drifts ${L} cm in ${td} μs under a field of ${E} V/cm. $\mu_p$ ≈ ?`, right,
        [[`$${sp(mu * 10)}$ cm²/V·s`, 'Off by ten: μs is $10^{-6}$ s.'], [`$${sp(v)}$ cm²/V·s`, md`That is $v_d$ in cm/s; divide by the field.`], [`$${sp(mu / 10)}$ cm²/V·s`, 'Off by ten.']],
        md`$v_d = ${L}/(${td}\times10^{-6}) = ${sp(v)}$ cm/s; $\mu_p = v_d/\mathscr{E} = ${sp(mu)}$ cm²/V·s.`);
    },
    () => {
      const [ask, right, wr] = pick([
        ['Why does the pulse **spread out** as it drifts?', 'diffusion', [['drift', 'Drift moves the whole pulse at one speed; it shifts, it doesn\'t spread.'], ['recombination', 'Recombination shrinks the area (the number of holes), not the width.'], ['the field is non-uniform', 'The bar has a uniform field.']]],
        ['Why does the **area** under the pulse shrink as it drifts?', 'recombination', [['diffusion', 'Diffusion conserves the number of holes; it only spreads them.'], ['drift', 'Drift only moves the pulse.'], ['the detector is slow', 'The area is the number of excess holes left.']]],
        ['What sets **where** the pulse peak is at time $t$?', 'drift', [['diffusion', 'Diffusion is symmetric: it spreads the pulse but leaves the center where drift put it.'], ['recombination', 'Recombination shrinks it everywhere equally.'], ['the lifetime', 'The lifetime sets how many survive.']]],
      ]);
      return MC('Haynes–Shockley', ask, right, wr, md`Drift moves the center ($x = \mu_p\mathscr{E}t$), diffusion widens it (width $\propto\sqrt{D_pt}$), recombination shrinks its area ($\propto e^{-t/\tau_p}$).`);
    },
    () => {
      const t = pick([4, 9, 16]);
      return MC('Spreading', md`The pulse's width after time $t$ is $\Delta x$. After a time $${t}t$ it is…`,`${Math.sqrt(t)}Δx`,
        [[`${t}Δx`, md`Diffusion spreads as $\sqrt{Dt}$, not $t$.`], [`${t * t}Δx`, 'Far too fast.'], ['Δx', 'Diffusion keeps spreading it.']],
        md`Width $\propto\sqrt{D_pt}$: ×${t} the time → ×${Math.sqrt(t)} the width. Measuring $\Delta x$ gives $D_p = (\Delta x)^2/16t_d$.`);
    },
    () => MC('Quasi-Fermi levels', md`In a region carrying current, $F_n$ is **flat** but $F_p$ slopes. Which carriers carry current there?`, 'only holes',
      [['only electrons', md`$J_n = \mu_nn\,dF_n/dx = 0$ when $F_n$ is flat.`], ['both', md`A flat quasi-Fermi level means zero current for that carrier.`], ['neither', md`$F_p$ slopes, so $J_p \neq 0$.`]],
      md`$J_n = \mu_nn\,\frac{dF_n}{dx}$, $J_p = \mu_pp\,\frac{dF_p}{dx}$: each carrier's current is set by the slope of its own quasi-Fermi level.`),
  ]));

  // =========================================================================== Topic 14: equilibrium junction
  const NI2 = { Si: [1.5e10, 20.352], GaAs: [2.1e6, 12.644], Ge: [2.5e13, 26.796] };
  GENS.rf2_eq = fresh(() => one([
    () => {
      const m = pick(['Si', 'Si', 'Si', 'GaAs']), a = ri(15, 18), b = ri(14, 17);
      const V0 = 0.0596 * (a + b - NI2[m][1]);
      const right = `${f2(V0)} V`;
      return MC('Contact potential, fast', md`${m} ($n_i = ${sp(NI2[m][0])}$), $N_a = 10^{${a}}$, $N_d = 10^{${b}}\,\text{cm}^{-3}$. $V_0$ ≈ ?`, right,
        [[`${f2(V0 + 0.12)} V`, 'Two decades off: recount the exponents.'], [`${f2(V0 - 0.12)} V`, 'Two decades off.'], [`${f2(0.0259 * (a + b - NI2[m][1]))} V`, md`That used $kT/q$ per decade; one decade is $\frac{kT}{q}\ln10 = 0.06$ V.`], [`${f2(V0 / 2)} V`, 'That is half of it.']],
        md`$\log_{10}(N_aN_d/n_i^2) = ${a + b} - ${NI2[m][1].toFixed(2)} = ${(a + b - NI2[m][1]).toFixed(2)}$ decades × 0.0596 V = ${f2(V0)} V.${m === 'Si' ? ' (Si: $n_i^2 = 2.25\\times10^{20}$, i.e. 20.35 decades.)' : ''}`);
    },
    () => {
      const b = ri(14, 18), d = 0.0596 * (b - 10.176), side = pick(['n', 'p']);
      const right = `${f2(d)} eV`;
      return MC('Fermi level on one side', md`Si, the ${side} side doped $10^{${b}}\,\text{cm}^{-3}$. ${side === 'n' ? '$E_F - E_i$' : '$E_i - E_F$'} ≈ ?`, right,
        [[`${f2(d + 0.06)} eV`, 'One decade off.'], [`${f2(0.56 - d)} eV`, md`That is the distance to the ${side === 'n' ? 'conduction' : 'valence'} band edge, not to $E_i$.`], [`${f2(d / 2)} eV`, 'Half of it.']],
        md`$kT\ln(N/n_i)$ = 0.0596 × (${b} − 10.18) = ${f2(d)} eV. Add the two sides' values and you have $qV_0$.`);
    },
    () => {
      const V0 = pick([0.6, 0.66, 0.72, 0.78, 0.84, 0.9]), dec = Math.round(V0 / 0.06);
      const right = `$10^{${dec}}$`;
      return MC('Majority to minority', md`A junction has $V_0 = ${V0}$ V. The hole density on the p side is how many times the hole density on the n side?`, right,
        [[`$10^{${dec - 2}}$`, 'Two decades off: 60 mV per decade.'], [`$10^{${Math.round(V0 / 0.0259)}}$`, md`That used 26 mV per decade; a decade is 60 mV.`], [`$${Math.round(V0 / 0.0259)}$`, md`That is $qV_0/kT$, the natural log of the ratio.`]],
        md`$p_p/p_n = e^{qV_0/kT}$: ${V0} V / 0.06 V ≈ ${dec} decades. The barrier holds back exactly that ratio.`);
    },
    () => {
      const N = ri(15, 17), dE = pick([0.12, 0.18, 0.24, 0.3, 0.36]), k = Math.round(dE / 0.06);
      const right = `$10^{${N - k}}\\,\\text{cm}^{-3}$`;
      return MC('Inside the depletion region', md`Equilibrium. Inside the depletion region, at a point where the bands have bent **${dE} eV** up from the neutral n side ($N_d = 10^{${N}}$), the electron density is…`, right,
        [[`$10^{${N}}\\,\\text{cm}^{-3}$`, 'That is the neutral n side; the bands bent away from $E_F$ here.'], [`$10^{${N + k}}\\,\\text{cm}^{-3}$`, md`Wrong direction: $E_c$ moved **away** from $E_F$.`], [`$10^{${N - 2 * k}}\\,\\text{cm}^{-3}$`, '60 mV per decade, not 30.'], ['$0$', 'Small, not zero: the depletion approximation rounds it off.']],
        md`$n = N_de^{-q\Delta\phi/kT}$: ${dE}/0.06 = ${k} decades below $N_d$. Within a few tenths of a volt of the edge, the "depleted" region really is depleted relative to the doping.`);
    },
    () => one([
      () => MC('Equilibrium', 'In equilibrium, which is true at a p-n junction?', 'drift and diffusion cancel for electrons and for holes separately',
        [['no carriers move', 'Huge drift and diffusion currents flow; they cancel.'], ['the total current is zero but the electron current is not', md`In equilibrium $J_n = 0$ and $J_p = 0$ each: $E_F$ flat means $F_n$ and $F_p$ are both flat.`], ['the Fermi level steps down by $qV_0$', md`$E_F$ is flat; the bands step by $qV_0$.`]],
        md`$E_F$ flat ⇒ $J_n = \mu_nn\,dE_F/dx = 0$ and $J_p = 0$, each separately.`),
      () => MC('Where does $V_0$ come from?', 'Before contact, the n side has its Fermi level higher than the p side. On contact…', 'electrons flow n → p, holes p → n, until $E_F$ is flat',
        [['holes flow n → p', 'Holes are plentiful on the p side and diffuse toward the n side.'], ['only electrons move', 'Both diffuse.'], ['the bands stay flat and $E_F$ bends', md`Backwards: $E_F$ is flat at equilibrium; the bands bend by $qV_0 = E_{Fn} - E_{Fp}$ (before contact).`]],
        md`$qV_0$ equals the difference between the two sides' Fermi levels before contact: $(E_F - E_i)_n + (E_i - E_F)_p$.`),
      () => MC('Can $V_0$ exceed the gap?', md`Could a Si junction (nondegenerate) have $V_0 = 1.3$ V?`, md`no: $qV_0 < E_g$ unless both sides are degenerate`,
        [['yes, with heavy enough doping', md`Each side's $E_F$ stays inside the gap (nondegenerate), so $qV_0 < E_g = 1.12$ eV.`], ['yes, at low temperature', md`Still bounded by the gap.`], ['only for GaAs-like materials', md`The bound is per material: $E_g$.`]],
        md`$qV_0 = (E_F - E_i)_n + (E_i - E_F)_p$, each less than about $E_g/2$. Practical Si junctions: 0.6–0.95 V.`),
    ]),
  ]));

  // =========================================================================== Topic 15: depletion region
  GENS.rf2_depl = fresh(() => one([
    () => {
      const r = pick([2, 4, 5, 10, 100]), heavy = pick(['p', 'n']);
      const light = heavy === 'p' ? 'n' : 'p';
      const right = `$x_{${light}0} = ${r}\\,x_{${heavy}0}$`;
      return MC('Which side, how much?', md`$N_${heavy === 'p' ? 'a' : 'd'} = ${r}\,N_${heavy === 'p' ? 'd' : 'a'}$. How do the depletion widths on the two sides compare?`, right,
        [[`$x_{${heavy}0} = ${r}\\,x_{${light}0}$`, 'Backwards: the depletion reaches further into the lightly doped side.'], ['they are equal', 'Only for a symmetric junction.'], [`$x_{${light}0} = ${+Math.sqrt(r).toFixed(2)}\\,x_{${heavy}0}$`, 'Charge balance is linear: $N_ax_{p0} = N_dx_{n0}$.']],
        md`Charge balance $N_ax_{p0} = N_dx_{n0}$: the lighter side must be ${r}× wider to hold the same charge.`);
    },
    () => {
      const r = pick([2, 4, 9, 99]), fr = r / (r + 1);
      const right = `${Math.round(fr * 100)}%`;
      return MC('Where does the voltage drop?', md`$N_a = ${r}\,N_d$. What fraction of $V_0$ drops across the **n side** of the depletion region?`, right,
        [[`${Math.round((1 - fr) * 100)}%`, 'Backwards: most of the voltage drops across the lightly doped side.'], ['50%', 'Only for a symmetric junction.'], [`${Math.round(100 * r * r / (r * r + 1))}%`, 'The split goes as the widths, $V_n/V_p = x_{n0}/x_{p0} = N_a/N_d$, not their squares.']],
        md`Each side drops $qNx^2/2\epsilon$. With $N_ax_{p0} = N_dx_{n0}$: $V_n/V_p = x_{n0}/x_{p0} = N_a/N_d = ${r}$, so the n side gets ${r}/${r + 1}.`);
    },
    () => {
      const N = pick([15, 16, 17]), V = pick([1, 4, 9, 16]);
      const W = 1.14 * Math.sqrt(V) * Math.pow(10, (15 - N) / 2);
      const right = `${S.f(W, 2)} μm`;
      return MC('Width, fast', md`One-sided Si junction, light side doped $10^{${N}}\,\text{cm}^{-3}$, total voltage $V_0 + V_R = ${V}$ V. $W$ ≈ ?`, right,
        [[`${S.f(W * 10, 2)} μm`, 'Off by ten.'], [`${S.f(W / Math.sqrt(V), 2)} μm`, 'That is for 1 V; $W \\propto \\sqrt{V}$.'], [`${S.f(W * Math.sqrt(10), 2)} μm`, md`Off by $\sqrt{10}$: $W \propto N^{-1/2}$.`]],
        md`Anchor: Si, $N = 10^{15}$, 1 V → $W = \sqrt{2\epsilon V/qN}$ = 1.14 μm. Scale by $\sqrt{V}$ and by $\sqrt{10^{15}/N}$ (÷3.16 per decade of doping).`);
    },
    () => {
      const V = pick([0.8, 1, 2, 5, 10]), W = pick([0.1, 0.2, 0.5, 1, 2]);
      const E = 2 * V / (W * 1e-4);
      const right = `$${sp(E)}$ V/cm`;
      return MC('Peak field, fast', md`A depletion region ${W} μm wide holds ${V} V in total. Peak field ≈ ?`, right,
        [[`$${sp(E / 2)}$ V/cm`, md`That is the average field $V/W$; the triangle's peak is twice the average.`], [`$${sp(E * 100)}$ V/cm`, 'Unit slip: 1 μm = $10^{-4}$ cm.'], [`$${sp(E / 100)}$ V/cm`, 'Unit slip.']],
        md`The field is a triangle whose area is the voltage: $V = \tfrac12\mathscr{E}_0W$, so $\mathscr{E}_0 = 2V/W$.`);
    },
    () => one([
      () => MC('Field shape', md`In an abrupt junction with uniform doping, $\mathscr{E}(x)$ across the depletion region is…`, 'a triangle peaking at the metallurgical junction',
        [['uniform', md`$d\mathscr{E}/dx = \rho/\epsilon$ is constant on each side, not zero: linear ramps.`], ['peaked at the depletion edges', md`It is zero at the edges (neutral regions) and largest where the charge flips sign.`], ['parabolic', md`The **potential** is parabolic; the field is linear.`]],
        md`Gauss: slope $= qN_d/\epsilon$ on the n side, $-qN_a/\epsilon$ on the p side. Steeper on the heavily doped side, which is why that side is thin.`),
      () => MC('Which way does it point?', 'In a p-n junction at equilibrium, the field in the depletion region points…', 'from the n side to the p side',
        [['from the p side to the n side', md`Field lines run from + charge to − charge: from the ionized donors (n side, +) to the ionized acceptors (p side, −).`], ['either way, depending on bias', md`Bias changes its size, not its direction (below $V_0$).`], ['nowhere: it is zero in equilibrium', 'The built-in field is what balances diffusion.']],
        md`+ donors on the n side, − acceptors on the p side: $\mathscr{E}$ points n → p. It pushes holes back to p and electrons back to n, balancing diffusion.`),
      () => MC('Depletion approximation', 'The depletion approximation says the region near the junction has…', 'mobile carriers negligible compared with the dopant ions',
        [['no dopants', md`The ions are what's left; they're the charge.`], ['$n = p = n_i$ everywhere', md`Only at one point, if anywhere. Elsewhere $n$, $p$ drop exponentially below the doping.`], ['equal electron and hole densities', 'Not generally.']],
        md`$\rho \approx qN_d$ (n side) and $-qN_a$ (p side) inside, 0 outside. The edges are actually smeared over a few Debye lengths.`),
      () => MC('Capacitor picture', 'A reverse-biased junction behaves like which kind of capacitor?', md`parallel plates $W$ apart: $C_j = \epsilon A/W$`,
        [[md`plates $L_p$ apart`, md`$L_p$ belongs to stored minority charge (forward bias).`], ['a fixed capacitor', md`$W$ depends on voltage, so $C_j$ does too.`], [md`$C = Q/V$ with the total charge`, md`It's nonlinear: use $C = dQ/dV$, which works out to $\epsilon A/W$.`]],
        md`Adding $dV$ uncovers a sliver $dQ$ at each depletion edge, a distance $W$ apart: exactly a parallel-plate capacitor.`),
    ]),
  ]));

  // =========================================================================== Topic 16: bias, law of the junction
  GENS.rf2_bias = fresh(() => one([
    () => {
      const k = ri(4, 12), N = ri(15, 17), pn0 = 2.25e20 / Math.pow(10, N), V = 0.06 * k;
      const ans = pn0 * Math.pow(10, k);
      const right = `$${sf(ans)}\\,\\text{cm}^{-3}$`;
      return MC('Law of the junction', md`Si n side, $N_d = 10^{${N}}$ (so $p_n = ${sf(pn0)}$). Forward bias ${f2(V)} V. Hole density at the n-side depletion edge?`, right,
        [[`$${sf(ans * 10)}\\,\\text{cm}^{-3}$`, 'One decade off.'], [`$${sf(pn0 * Math.exp(V / 0.0518))}\\,\\text{cm}^{-3}$`, md`That is $e^{qV/2kT}$, the high-level-injection form.`], [`$${sf(pn0 * k)}\\,\\text{cm}^{-3}$`, 'Exponential, not linear.'], [`$${sp(Math.pow(10, N))}\\,\\text{cm}^{-3}$`, 'That is the majority density.']],
        md`$p(x_{n0}) = p_ne^{qV/kT}$: ${f2(V)} V / 0.06 = ${k} decades above $p_n$.${ans > 0.1 * Math.pow(10, N) ? ' Careful: that is no longer ≪ $N_d$, so low-level injection is failing.' : ' Still ≪ $N_d$: low level.'}`);
    },
    () => {
      const VR = pick([0.2, 0.5, 1, 5]);
      return MC('Reverse bias at the edge', md`Reverse bias ${VR} V. The excess hole density at the n-side depletion edge, $\Delta p_n$, is about…`, md`$-p_n$ (the edge is emptied)`,
        [[md`$0$`, md`That is the equilibrium value; reverse bias pulls it below.`], [md`$p_ne^{q(${VR})/kT}$`, md`The exponent is negative in reverse: $e^{-qV_R/kT} \approx 0$.`], [md`$-N_d$`, 'Only minority carriers are extracted.']],
        md`$\Delta p_n = p_n(e^{-qV_R/kT} - 1) \approx -p_n$ once $V_R \gtrsim 0.1$ V. The field sweeps away every hole that reaches the edge: minority-carrier extraction.`);
    },
    () => {
      const V = pick([0.3, 0.45, 0.6, 0.7]), V0 = pick([0.8, 0.9]);
      const [ask, right, wr, why] = pick([
        ['the barrier height', `${f2(V0 - V)} eV`, [[`${f2(V0 + V)} eV`, 'Forward bias lowers the barrier.'], [`${f2(V0)} eV`, 'Bias changes the barrier.'], [`${f2(V)} eV`, 'That is $qV$ alone.']], md`$q(V_0 - V)$`],
        ['$F_n - F_p$ inside the depletion region', `${f2(V)} eV`, [[`${f2(V0 - V)} eV`, 'That is the barrier.'], ['0 eV', 'Only at equilibrium.'], [`${f2(V0)} eV`, 'That is $qV_0$.']], md`The quasi-Fermi levels split by exactly $qV$; $np = n_i^2e^{qV/kT}$`],
      ]);
      return MC('Reading a biased band diagram', md`$V_0 = ${V0}$ V, forward bias ${V} V. What is ${ask}?`, right, wr, md`${why}.`);
    },
    () => one([
      () => MC('Forward current: who carries it?', 'In forward bias, the current across the junction is mainly…', 'majority carriers diffusing over the lowered barrier',
        [['minority carriers drifting across', md`That is the reverse current (and in forward bias, the same small $I_0$ drift is still there).`], ['tunneling through the barrier', md`Only in Zener/very heavily doped junctions.`], ['generation in the depletion region', 'That is a reverse-bias leakage term.']],
        md`Lowering the barrier by $qV$ lets ×$e^{qV/kT}$ more majority carriers diffuse over; once across, they are minority carriers and diffuse away while recombining.`),
      () => MC('Reverse current: who carries it?', 'In reverse bias, the small current is…', 'minority carriers that wander to the depletion edge and drift across',
        [['majority carriers going over the barrier', md`The barrier is raised by $qV_R$: that flow is shut off.`], ['electrons tunneling', 'Only at Zener breakdown.'], ['displacement current only', 'There is a real dc current, $-I_0$.']],
        md`The field sweeps every minority carrier that reaches the edge across. The current is limited by **supply**: thermal generation within ~$L$ of the edge. Hence it saturates.`),
      () => MC('Why only to $V_0$?', md`Why does the simple picture break down when forward bias approaches $V_0$?`, 'the barrier vanishes, injection becomes high level and the neutral regions drop voltage',
        [['the diode breaks down', 'Breakdown is a reverse-bias effect.'], ['the current reverses', 'It keeps increasing.'], ['$W$ becomes infinite', md`$W \to 0$ as $V \to V_0$.`]],
        md`Real diodes never get the full $V_0$ across the junction: series resistance and high-level injection take up the rest.`),
      () => MC('Low-level injection', md`Low-level injection on the n side means…`, md`$\Delta p_n \ll N_d$: the majority density is unchanged`,
        [[md`$\Delta p_n \ll p_n$`, md`In forward bias $\Delta p_n \gg p_n$ routinely; that's fine.`], ['small forward current', 'It is about densities, not current.'], [md`$\Delta p_n \ll n_i$`, md`Compare with the majority density.`]],
        md`Low level: excess ≪ majority. Then the majority density stays $N_d$, the field in the neutral region is negligible, and minority carriers move by diffusion alone.`),
    ]),
  ]));

  // =========================================================================== Topic 17: diode equation, current components
  GENS.rf2_diode = fresh(() => one([
    () => {
      const r = pick([1, 3, 9, 99, 1000]);
      const fr = r / (r + 1);
      const right = `${(fr * 100).toFixed(r >= 99 ? 1 : 0)}%`;
      return MC('Hole share of the current', md`$N_a = ${r}\,N_d$, and $D_n/L_n = D_p/L_p$. What fraction of the forward current is holes injected into the n side?`, right,
        [[`${((1 - fr) * 100).toFixed(r >= 99 ? 1 : 0)}%`, 'Backwards: the heavily doped side injects into the light side.'], ['50%', 'Only for a symmetric junction.'], ['100%', 'Close for a strongly one-sided junction, but not exactly.']],
        md`$I_p \propto p_n = n_i^2/N_d$, $I_n \propto n_p = n_i^2/N_a$; ratio $I_p/I_n = N_a/N_d = ${r}$. The heavy side injects.`);
    },
    () => {
      const Ttxt = pick([[5, '×2'], [10, '×4'], [15, '×8'], [20, '×16']]);
      const right = Ttxt[1];
      return MC('Temperature and $I_0$', md`Rule of thumb: a Si diode's $I_0$ roughly doubles every 5 K near room temperature. Heating by ${Ttxt[0]} K changes $I_0$ by about…`, right,
        ['×2', '×4', '×8', '×16', '×1.05'].filter((x) => x !== right).slice(0, 3).map((x) => [x, md`${Ttxt[0] / 5} doublings: ${right}.`]),
        md`$I_0 \propto n_i^2 \propto T^3e^{-E_g/kT}$: 15%/K. And at fixed current $V$ drops about 2 mV/K.`);
    },
    () => {
      const J = pick([0.1, 1, 10, 100]), N = pick([1e15, 1e16, 1e17]), mu = pick([1000, 1350]);
      const E = J / (1.6e-19 * mu * N);
      const right = `$${sf(E)}$ V/cm`;
      return MC('Field in the neutral region', md`Far from the junction in the n side ($N_d = ${sp(N)}$, $\mu_n = ${mu}$), the diode carries ${J} A/cm². The field there ≈ ?`, right,
        [[`$${sf(E * 10)}$ V/cm`, 'Off by ten.'], [`$${sf(E / 10)}$ V/cm`, 'Off by ten.'], ['0', 'All the current is carried by majority drift here, which needs a field.']],
        md`There $\delta p \to 0$: the whole current is electron drift, $J = q\mu_nN_d\mathscr{E}$, so $\mathscr{E} = J/q\mu_nN_d$ = ${sf(E)} V/cm. Tiny: neutral regions drop almost no voltage.`);
    },
    () => one([
      () => MC('Long p⁺-n diode, deep in the n region', md`Several $L_p$ into the n side of a forward-biased p⁺-n diode, the current is carried by…`, 'majority electrons, by drift',
        [['holes, by diffusion', md`The injected holes have recombined within a few $L_p$.`], ['electrons, by diffusion', md`There is no electron gradient there.`], ['nothing: the current has decayed', 'The total current is the same everywhere (series circuit).']],
        md`At $x_{n0}$ it is nearly all hole diffusion; as holes recombine, electrons flowing in from the contact take over. Total $I$ is constant.`),
      () => MC('Where do the electrons go?', md`In the n side of a forward-biased p⁺-n diode, majority electrons flow from the contact toward the junction. What do most of them do?`, 'recombine with injected holes',
        [['cross into the p⁺ side', md`That is the small $I_n$ component; in p⁺-n it's tiny.`], ['pile up at the depletion edge', 'In steady state nothing piles up.'], ['drift back to the contact', 'Then they would not carry the current.']],
        md`Every injected hole that recombines needs an electron from the contact. So the electron current rises exactly as the hole current falls.`),
      () => MC('Which side matters?', md`For a strongly one-sided p⁺-n diode, $I_0$ is set by…`, 'the n side: its doping, $D_p$ and $L_p$',
        [['the p⁺ side', md`The p⁺ side has far fewer minority electrons ($n_i^2/N_a$): it contributes little.`], ['both equally', 'Only for a symmetric junction.'], ['the depletion width', 'Ideal diffusion current comes from the neutral regions.']],
        md`$I_0 \approx qA\frac{D_p}{L_p}\frac{n_i^2}{N_d}$: the lightly doped side controls current, capacitance and breakdown.`),
      () => MC('Material and turn-on', 'Rank the forward voltage at 1 mA for same-geometry Ge, Si and GaAs diodes.', 'Ge < Si < GaAs',
        [['GaAs < Si < Ge', md`Backwards: larger gap → smaller $n_i^2$ → smaller $I_0$ → more voltage.`], ['all equal', md`$I_0 \propto n_i^2$ differs by many decades.`], ['Si < Ge < GaAs', 'Ge has the smallest gap.']],
        md`Roughly 0.3, 0.7 and 1.1 V. Each decade of $I_0$ is 60 mV of turn-on.`),
      () => MC('Shorter lifetime', md`A diode is gold-doped (shorter $\tau_p$). At a fixed forward voltage, its current…`, md`increases, $\propto 1/\sqrt{\tau_p}$`,
        [['decreases', md`Shorter $L_p$ makes the profile steeper at the edge.`], ['stays the same', md`$I_0 \propto D_p/L_p$.`], [md`increases $\propto 1/\tau_p$`, md`$L_p = \sqrt{D_p\tau_p}$, so the square root.`]],
        md`$I_0 = qA\frac{D_p}{L_p}p_n$ and $\frac{D_p}{L_p} = \sqrt{\frac{D_p}{\tau_p}}$.`),
    ]),
  ]));

  // =========================================================================== Topic 18: narrow base
  GENS.rf2_narrow = fresh(() => one([
    () => {
      const r = pick([5, 10, 20, 50]);
      const right = `×${r}`;
      return MC('Narrow vs long', md`Same p⁺-n diode, but the n-side contact is placed $\ell = L_p/${r}$ from the junction. At the same voltage, the current is…`, right,
        [[`×1/${r}`, 'A short base gives a steeper gradient, so more current.'], [`×${+Math.sqrt(r).toFixed(1)}`, md`$I \propto 1/\ell$ replaces $1/L_p$.`], ['the same', md`The contact forces $\delta p = 0$ much closer: steeper.`]],
        md`Long: $I = qAD_p\Delta p_n/L_p$. Narrow: $I = qAD_p\Delta p_n/\ell$. Ratio $L_p/\ell = ${r}$.`);
    },
    () => MC('Profile shape', md`In a narrow base ($\ell \ll L_p$), the excess hole profile is…`, 'a straight line from $\\Delta p_n$ down to 0 at the contact',
      [['an exponential decay with length $L_p$', 'That is the long base.'], ['flat', 'Then no diffusion current would flow.'], ['zero', md`$\Delta p_n$ is set at the junction edge by the law of the junction.`]],
      md`Holes cross in much less than a lifetime, so almost none recombine: constant current ⇒ constant gradient ⇒ straight line. The ohmic contact pins $\delta p(\ell) = 0$.`),
    () => MC('Stored charge', md`Narrow base: the stored excess hole charge is…`, md`$\tfrac12qA\ell\Delta p_n$ (a triangle)`,
      [[md`$qAL_p\Delta p_n$`, 'That is the long diode.'], [md`$qA\ell\Delta p_n$`, 'The profile is a triangle, not a rectangle.'], [md`$I\tau_p$`, md`That is the long diode; here $Q = It_t$ with $t_t = \ell^2/2D_p \ll \tau_p$.`]],
      md`Area of the triangle × $qA$. Dividing by the current gives the transit time $\ell^2/2D_p$.`),
    () => MC('The neutral base drop', md`Why is there any field in the neutral n base of a forward-biased narrow-base p⁺-n diode?`, 'to stop the excess electrons (δn = δp) from diffusing to the contact',
      [['to drive the hole current', md`Holes move by diffusion; the field is a side effect.`], ['because it carries the whole current by drift', 'That is the wide base far from the junction.'], ['there is none', md`Quasi-neutrality gives electrons the same gradient as holes; their diffusion must be cancelled.`]],
      md`$J_n \approx 0$ but $dn/dx = d\delta p/dx \ne 0$, so $q\mu_nN_d\mathscr{E} = qD_n\Delta p_n/\ell$. Across the base: $V = \frac{kT}{q}\frac{\Delta p_n}{N_d}$, small at low level.`),
  ]));

  // =========================================================================== Topic 19: breakdown and non-ideal effects
  GENS.rf2_break = fresh(() => one([
    () => {
      const V = pick([3, 4, 5.5, 8, 12, 50, 200]);
      const right = V < 4.5 ? 'Zener (tunneling)' : V > 6.7 ? 'avalanche' : 'both contribute';
      return MC('Which breakdown?', md`A Si diode breaks down at $V_{br} = ${V}$ V. Mechanism?`, right,
        ['Zener (tunneling)', 'avalanche', 'both contribute', 'thermal runaway'].filter((x) => x !== right).map((x) => [x, md`Rule of thumb: below about $4E_g/q$ (≈4.5 V in Si) it's Zener; above about $6E_g/q$ (≈6.7 V) avalanche; in between, both.`]),
        md`Low $V_{br}$ means heavy doping on both sides and a very thin depletion region: electrons tunnel straight across the gap. High $V_{br}$ means a wide region where carriers gain enough energy to ionize.`);
    },
    () => {
      const mech = pick(['Zener', 'avalanche']);
      const right = mech === 'Zener' ? 'decreases' : 'increases';
      return MC('Temperature coefficient', md`For **${mech}** breakdown, as temperature rises, $V_{br}$…`, right,
        [[mech === 'Zener' ? 'increases' : 'decreases', mech === 'Zener' ? md`Tunneling gets easier as $E_g$ shrinks.` : md`More phonon scattering makes it harder for carriers to gain ionizing energy.`], ['stays fixed', 'Both mechanisms depend on temperature.']],
        mech === 'Zener' ? md`$E_g$ shrinks with T → thinner barrier → tunneling at lower voltage. Negative coefficient. (A diode near 5–6 V can have nearly zero coefficient: both mechanisms.)` : md`Hotter → shorter mean free path → need more field → higher $V_{br}$. Positive coefficient.`);
    },
    () => {
      const P = pick([0.5, 0.75, 0.8, 0.9, 0.95, 0.99]), M = 1 / (1 - P);
      const right = `${+M.toFixed(2)}`;
      return MC('Avalanche multiplication', md`Each carrier crossing the depletion region has probability $P = ${P}$ of an ionizing collision. Multiplication $M$ = ?`, right,
        [[`${+(1 + P).toFixed(2)}`, md`Secondaries ionize too: $1 + P + P^2 + \dots$`], [`${+(1 / P).toFixed(2)}`, md`$1/(1-P)$, not $1/P$.`], ['∞', md`Only as $P \to 1$.`]],
        md`$M = 1 + P + P^2 + \dots = \frac{1}{1-P}$. As $P \to 1$, $M \to \infty$: breakdown.`);
    },
    () => one([
      () => MC('Doping and breakdown', md`To raise a p⁺-n diode's avalanche breakdown voltage, you should…`, md`lower $N_d$ (the light side)`,
        [[md`raise $N_d$`, md`Higher doping: field climbs faster with voltage: lower $V_{br}$.`], [md`raise $N_a$`, 'The heavy side barely matters.'], ['make the area larger', 'Breakdown is set per unit area.']],
        md`$V_{br} \approx \epsilon\mathscr{E}_{crit}^2/2qN_d$: halve the doping, double the breakdown voltage.`),
      () => MC('Why heavy doping for Zener?', 'Zener tunneling needs heavy doping on **both** sides because…', 'the depletion region must be thin enough (~10 nm) to tunnel through',
        [['the field must be weak', 'It needs a huge field (~10⁶ V/cm).'], ['$V_0$ must be small', md`Heavy doping makes $V_0$ larger.`], ['it needs many minority carriers', 'It needs filled states facing empty states across a thin barrier.']],
        md`Tunneling probability falls exponentially with barrier thickness. Heavy doping on both sides: thin $W$ and filled valence states directly across from empty conduction states.`),
      () => MC('Generation current', md`A real Si diode's reverse current keeps rising slowly with $V_R$ (no breakdown yet). The likely cause:`, md`generation in the depletion region, $\propto W \propto \sqrt{V_0 + V_R}$`,
        [['the diffusion current grows', md`The ideal diffusion current saturates at $-I_0$.`], ['high-level injection', 'That is a forward-bias effect.'], ['series resistance', 'That limits large forward currents.']],
        md`Traps in the depletion region generate pairs that the field sweeps out: $I_{gen} = qAn_iW/2\tau_0$. In Si at room temperature it is usually larger than $I_0$.`),
      () => MC('Slopes on a log plot', md`On $\log I$ vs $V$ in forward bias, a slope of **120 mV/decade** at low current means…`, 'recombination in the depletion region (ideality 2)',
        [['ideal diffusion current', '60 mV/decade.'], ['series resistance', md`That bends the curve over at **high** current.`], ['breakdown', 'Reverse bias.']],
        md`$I \propto e^{qV/nkT}$: $n = 1$ is ideal diffusion (60 mV/dec); $n = 2$ at low current (recombination) and at high current (high-level injection).`),
      () => MC('High current', md`At large forward current the I–V curve becomes nearly **linear** instead of exponential. Why?`, 'series resistance of the neutral regions and contacts',
        [['breakdown', 'Reverse bias only.'], ['recombination in the depletion region', 'That matters at low current.'], ['the diffusion length changes', md`$L$ doesn't depend on bias at low level.`]],
        md`$V_{applied} = V_{junction} + IR_s$: once $IR_s$ dominates, more voltage just goes into the resistor.`),
    ]),
  ]));

  // =========================================================================== Topic 20: capacitance and switching
  GENS.rf2_cap = fresh(() => one([
    () => {
      const I = pick([0.1, 0.5, 1, 2, 10]), tau = pick([0.1, 1, 10]);
      const Cs = (I * 1e-3) * (tau * 1e-6) / 0.0259;
      const right = `${S.f(Cs * 1e9, 3)} nF`;
      return MC('Storage capacitance', md`A long p⁺-n diode carries ${I} mA, $\tau_p = ${tau}$ μs. $C_s$ ≈ ?`, right,
        [[`${S.f(Cs * 1e12, 3)} nF`, 'Off by a thousand: watch mA and μs.'], [`${S.f(Cs * 1e9 * 0.0259 * 0.0259, 3)} nF`, md`That multiplies by $kT/q$; divide:$C_s = I\tau_p/(kT/q)$.`], [`${S.f(Cs * 1e9 * 10, 3)} nF`, 'Off by ten.']],
        md`$C_s = \frac{q}{kT}I\tau_p = \frac{(${I}\times10^{-3})(${tau}\times10^{-6})}{0.0259}$ = ${S.f(Cs * 1e9, 3)} nF. Huge compared with typical $C_j$ (pF).`);
    },
    () => {
      const I = pick([0.1, 0.5, 1, 2, 10]), r = 25.9 / I;
      const right = `${S.f(r, 3)} Ω`;
      return MC('Small-signal resistance', md`A diode carries ${I} mA at 300 K. Its small-signal resistance $1/G_s$ ≈ ?`, right,
        [[`${S.f(r * 10, 3)} Ω`, 'Off by ten.'], [`${S.f(0.7 / (I * 1e-3), 3)} Ω`, md`That is $V/I$, the dc resistance. Small-signal is $dV/dI = (kT/q)/I$.`], [`${S.f(r / 10, 3)} Ω`, 'Off by ten.']],
        md`$G_s = dI/dV = I/(kT/q)$, so $r = 25.9\text{ mV}/I$ = ${S.f(r, 3)} Ω.`);
    },
    () => {
      const [ratio, ln] = pick([[1, Math.log(2)], [3, Math.log(4)], [9, Math.log(10)], [0.5, Math.log(1.5)], [0.25, Math.log(1.25)]]);
      const right = `${f2(ln)} τ_p`;
      return MC('Storage delay', md`A diode switched from $I_f$ to $-I_r$ with $I_f/I_r = ${ratio}$. Storage delay $t_{sd}$ ≈ ?`, right,
        [[`${f2(ratio)} τ_p`, md`It's logarithmic: $\ln(1 + I_f/I_r)$.`], [`${f2(Math.log(ratio + 2))} τ_p`, md`$\ln(1 + ${ratio})$.`], ['τ_p', md`Only if $I_f/I_r = e - 1 = 1.72$.`]],
        md`$t_{sd} = \tau_p\ln(1 + I_f/I_r) = \tau_p\ln(${1 + ratio})$ = ${f2(ln)} τ_p. Pull harder (bigger $I_r$) to switch faster.`);
    },
    () => {
      const W = pick([0.1, 0.2, 0.5, 1, 2]), A = pick([1e-4, 1e-3, 1e-2]);
      const C = 1.044e-12 * A / (W * 1e-4);
      const right = `${S.f(C * 1e12, 3)} pF`;
      return MC('Junction capacitance, fast', md`Si ($\epsilon = 1.04\times10^{-12}$ F/cm), $A = ${sp(A)}$ cm², $W = ${W}$ μm. $C_j$ ≈ ?`, right,
        [[`${S.f(C * 1e14, 3)} pF`, 'Unit slip: 1 μm = $10^{-4}$ cm.'], [`${S.f(C * 1e12 / 11.8, 3)} pF`, md`That used $\epsilon_0$; Si is $11.8\epsilon_0$.`], [`${S.f(C * 1e12 * 2, 3)} pF`, 'No factor of 2: $C_j = \\epsilon A/W$.']],
        md`$C_j = \epsilon A/W$. Anchor: 100 μm × 100 μm with $W = 1$ μm ≈ 1 pF.`);
    },
    () => one([
      () => MC('Which capacitance?', md`A diode is **forward biased** at a few mA. Its capacitance is dominated by…`, md`$C_s$, the stored minority charge`,
        [[md`$C_j$`, md`$C_j$ dominates in reverse bias; in forward bias $C_s \propto I$ grows exponentially.`], ['they are equal', 'Orders of magnitude apart.'], ['neither: the diode has no capacitance', 'Both exist.']],
        md`Reverse: $C_j$ (pF). Forward: $C_s = \frac{q}{kT}I\tau_p$ (nF at mA currents).`),
      () => MC('Measuring doping', md`You plot $1/C_j^2$ vs reverse bias for a p⁺-n diode and get a straight line. The **slope** gives…`, md`$N_d$ (the light side): slope $= 2/(q\epsilon A^2N_d)$`,
        [[md`$N_a$`, md`The heavy side barely affects $W$.`], [md`$V_0$`, md`$V_0$ comes from the intercept on the voltage axis.`], [md`$\tau_p$`, 'Capacitance–voltage depends on electrostatics only.']],
        md`$\frac{1}{C_j^2} = \frac{2(V_0 + V_R)}{q\epsilon A^2N_d}$: slope → $N_d$, extrapolate to $1/C^2 = 0$ at $V_R = -V_0$ → $V_0$. Steeper slope = lighter doping.`),
      () => MC('Turn-off', md`A diode carrying forward current is suddenly switched to reverse bias. For a while (the storage time), the junction voltage…`, 'stays forward biased while the stored holes are removed',
        [['flips to the reverse voltage immediately', md`The junction voltage follows $\Delta p_n$ at the edge, which takes time to drain.`], ['goes to zero immediately', 'The stored charge holds it up.'], ['goes above $V_0$', 'No.']],
        md`As long as $p(x_{n0}) > p_n$, the junction is forward biased. The current is limited to $-I_r$ by the circuit until the edge empties at $t_{sd}$.`),
      () => MC('Fast diodes', 'To make a Si p-n diode switch off faster you would…', md`shorten $\tau_p$ (e.g. gold doping)`,
        [['lengthen the lifetime', md`$t_{sd} \propto \tau_p$.`], ['increase the forward current', 'More stored charge: slower.'], ['make the area larger', 'Larger area, more charge and capacitance.']],
        md`$t_{sd} = \tau_p\ln(1 + I_f/I_r)$. Or use a Schottky diode: no minority storage at all.`),
    ]),
  ]));

  // =========================================================================== Topic 21: metal–semiconductor
  GENS.rf2_ms = fresh(() => one([
    () => {
      const type = pick(['n', 'p']), big = pick(['m', 's']);
      const rect = (type === 'n') === (big === 'm');
      const right = rect ? 'rectifying (Schottky)' : 'ohmic';
      return MC('Rectifying or ohmic?', md`Ideal contact: metal on **${type}-type** semiconductor with ${big === 'm' ? '$\\phi_m > \\phi_s$' : '$\\phi_m < \\phi_s$'}. Lightly doped. The contact is…`, right,
        [[rect ? 'ohmic' : 'rectifying (Schottky)', rect ? md`Majority carriers face a barrier here.` : md`Majority carriers flow freely here.`], ['depends on bias', 'The type is set by the work functions and doping.']],
        md`On contact, electrons flow from the higher Fermi level (smaller work function) to the lower one. ${type === 'n' ? md`n-type: $\phi_m > \phi_s$ pulls electrons out of the semiconductor, depleting it → barrier → **rectifying**. $\phi_m < \phi_s$ piles electrons up → **ohmic**.` : md`p-type: $\phi_m < \phi_s$ pushes electrons in, depleting holes → **rectifying**. $\phi_m > \phi_s$ accumulates holes → **ohmic**.`}`);
    },
    () => {
      const chi = pick([4.0, 4.05, 4.07]), phim = pick([4.5, 4.7, 4.8, 5.1, 5.3]), EcEF = pick([0.1, 0.15, 0.2, 0.25]);
      const phis = chi + EcEF;
      const B = pick([true, false]), phiB = phim - chi, V0 = phim - phis;
      const ask = B ? md`the barrier seen from the metal, $\phi_B$` : md`the built-in voltage $V_0$ seen from the semiconductor`;
      const right = `${f2(B ? phiB : V0)} V`;
      const why = B ? md`$\phi_B = \phi_m - \chi$` : md`$V_0 = \phi_m - \phi_s$ with $\phi_s = \chi + (E_c - E_F)/q$`;
      return MC('Schottky numbers', md`Metal $\phi_m = ${phim}$ V on n-Si with $\chi = ${chi}$ V and $E_c - E_F = ${EcEF}$ eV. Find ${ask}.`, right,
        [[`${f2(B ? V0 : phiB)} V`, B ? md`That is $V_0 = \phi_m - \phi_s$, the barrier from the semiconductor side.` : md`That is $\phi_B = \phi_m - \chi$, the barrier from the metal side.`], [`${f2(phim)} V`, md`That is $\phi_m$ itself.`], [`${f2(phis)} V`, md`That is $\phi_s$.`]],
        md`${why}. $\phi_B = ${f2(phim - chi)}$ V, $\phi_s = ${f2(phis)}$ V, $V_0 = ${f2(phim - phis)}$ V.`);
    },
    () => one([
      () => MC('Practical ohmic contacts', md`Most real ohmic contacts are made by…`, 'doping the semiconductor heavily under the metal so carriers tunnel through a very thin barrier',
        [['choosing a metal with exactly the right work function', md`In practice the Fermi level is often pinned by surface states, so work-function choice doesn't help much.`], ['making the contact area small', 'Larger area lowers contact resistance.'], ['adding an oxide layer', 'That would block current.']],
        md`Heavy doping → $W \propto 1/\sqrt{N}$ becomes a few nm → tunneling in both directions: a low, linear resistance.`),
      () => MC('Schottky vs p-n', 'Compared with a p-n diode, a Schottky diode…', 'turns on at lower voltage and switches faster (no minority storage)',
        [['turns on at higher voltage', md`Its $I_0$ is much larger.`], ['stores more minority charge', 'It is a majority-carrier device.'], ['cannot rectify', 'It rectifies; that is the point.']],
        md`Forward current is majority electrons going over the barrier into the metal (thermionic emission). No injected minority charge → no storage delay.`),
      () => MC('Barrier heights', 'In an ideal Schottky contact on n-type, forward bias changes…', md`the barrier seen from the semiconductor, $q(V_0 - V)$; $\phi_B$ from the metal stays fixed`,
        [[md`$\phi_B$`, md`$\phi_B = \phi_m - \chi$ is pinned at the interface; bias doesn't move it.`], ['both equally', md`Only the semiconductor side shifts.`], ['neither', 'The semiconductor side moves by $qV$.']],
        md`That is why the reverse current saturates ($\propto e^{-q\phi_B/kT}$) and the forward current grows as $e^{qV/kT}$.`),
    ]),
  ]));

  // =========================================================================== Topic 22: illuminated junctions, LEDs
  GENS.rf2_opto = fresh(() => one([
    () => {
      const Isc = pick([20, 30, 40, 100]), Voc = pick([0.5, 0.55, 0.6, 0.7]), FF = pick([0.7, 0.75, 0.8]);
      const P = FF * Isc * Voc;
      const right = `${S.f(P, 3)} mW`;
      return MC('Max power, fast', md`$I_{sc} = ${Isc}$ mA, $V_{oc} = ${Voc}$ V, fill factor ${FF}. $P_{max}$ ≈ ?`, right,
        [[`${S.f(Isc * Voc, 3)} mW`, md`That is $I_{sc}V_{oc}$; the cell can't deliver both at once. Multiply by the fill factor.`], [`${S.f(P / 2, 3)} mW`, 'No factor of ½.'], [`${S.f(P * 10, 3)} mW`, 'Off by ten.']],
        md`$P_{max} = FF\cdot I_{sc}V_{oc}$ = ${FF} × ${Isc} mA × ${Voc} V.`);
    },
    () => {
      const k = ri(8, 12), Voc = 0.0259 * Math.log(Math.pow(10, k));
      const right = `${f2(Voc)} V`;
      return MC('Open-circuit voltage', md`A cell's photocurrent is $10^{${k}}$ times its dark saturation current $I_{th}$. $V_{oc}$ ≈ ?`, right,
        [[`${f2(0.0259 * k)} V`, md`That is $kT/q$ per decade; use $\frac{kT}{q}\ln 10 = 60$ mV per decade.`], [`${f2(Voc + 0.06)} V`, 'One decade off.'], [`${f2(Voc * 2)} V`, 'Twice it.']],
        md`$V_{oc} = \frac{kT}{q}\ln\left(1 + \frac{I_{op}}{I_{th}}\right)$ ≈ ${k} × 0.06 V.`);
    },
    () => {
      const Eg = pick([[1.42, 'GaAs'], [1.12, 'Si'], [1.9, 'AlGaInP (red)'], [2.3, 'green InGaN'], [0.75, 'InGaAs']]);
      const lam = 1.24 / Eg[0];
      const right = `${f2(lam)} μm`;
      return MC('LED color', md`An LED in ${Eg[1]} ($E_g ≈ ${Eg[0]}$ eV) emits near…`, right,
        [[`${f2(Eg[0] / 1.24)} μm`, md`Upside down: $\lambda = 1.24/E_g$.`], [`${f2(lam * 2)} μm`, 'Twice it.'], [`${f2(1.24 * Eg[0])} μm`, md`Divide, don't multiply.`]],
        md`$\lambda\,[\mu\text{m}] = 1.24/E_g\,[\text{eV}]$ = ${f2(lam)} μm.${Eg[1] === 'Si' ? ' (Si is indirect, so it is a terrible LED.)' : ''}`);
    },
    () => one([
      () => MC('Quadrants', 'A **solar cell** delivering power operates in which quadrant of the I–V plot (I positive in forward direction)?', 'fourth: V > 0, I < 0',
        [['first: V > 0, I > 0', 'That is a forward-biased diode absorbing power (an LED).'], ['third: V < 0, I < 0', 'That is a reverse-biased photodiode (it also absorbs power from the supply).'], ['second', 'Not used.']],
        md`Power delivered = $-IV > 0$ needs V and I of opposite sign: fourth quadrant, between $(0, -I_{sc})$ and $(V_{oc}, 0)$.`),
      () => MC('Photodiode bias', 'A photodiode used as a light detector is normally…', 'reverse biased (third quadrant): current = $-I_{op}$, independent of voltage',
        [['forward biased', md`The diode's own forward current would swamp the photocurrent.`], ['at open circuit', md`Then you read $V_{oc}$, which is logarithmic in light: poor linearity.`], ['in breakdown', 'Only an avalanche photodiode uses multiplication, and just below breakdown.']],
        md`Reverse bias widens $W$ (more collection, less capacitance, faster) and makes the current linear in light.`),
      () => MC('Series and parallel', 'To get a higher **voltage** from solar cells you wire them…', 'in series',
        [['in parallel', 'Parallel adds currents.'], ['either way', 'They are different.'], ['with bigger area', md`Area scales current, not $V_{oc}$.`]],
        md`Series adds voltages (each $V_{oc}$ < 1 V in Si); parallel adds currents.`),
      () => MC('PIN detectors', 'Why add an intrinsic layer (PIN) to a photodiode?', 'light is absorbed in a wide depletion region where carriers are swept out by drift (fast)',
        [['to increase the dark current', 'That hurts.'], ['to make it emit light', 'That is an LED.'], ['to store charge', 'Detectors want no storage.']],
        md`Drift is fast, diffusion is slow. A wide $W$ also lowers $C_j$. The trade-off: too wide and the transit time limits bandwidth.`),
      () => MC('Where photocurrent comes from', md`In $I_{op} = qAg_{op}(L_p + L_n + W)$, why are $L_p$ and $L_n$ there?`, 'pairs generated within about a diffusion length of the depletion edge diffuse to it and get collected',
        [['they set the depletion width', md`$W$ is separate.`], ['the light penetrates that far', md`Absorption depth is separate (assumed uniform here).`], ['they are the transit lengths of the field', 'The neutral regions have almost no field.']],
        md`Minority carriers created within ~$L$ of the edge reach it before recombining, and the field sweeps them across.`),
      () => MC('Laser vs LED', 'What does a laser need that an LED does not?', 'population inversion and optical feedback (above threshold current)',
        [['a direct band gap', 'Both need one for efficient light.'], ['forward bias', 'Both are forward biased.'], ['a p-n junction', 'Both use one.']],
        md`Above threshold, stimulated emission beats absorption ($F_n - F_p > h\nu$) and a cavity provides feedback: coherent, narrow-line light. Below threshold a laser diode is just an LED.`),
      () => MC('Fill factor', 'The fill factor of a solar cell is…', md`$\dfrac{V_mI_m}{V_{oc}I_{sc}}$, how square the I–V curve is`,
        [['the fraction of light absorbed', 'That is closer to quantum efficiency.'], [md`$P_{max}/P_{light}$`, 'That is efficiency.'], [md`$V_{oc}/E_g$`, 'Not a standard figure.']],
        md`Typically 0.7–0.85. $P_{max} = FF\cdot V_{oc}I_{sc}$; efficiency $= P_{max}/P_{in}$ (sunlight ≈ 100 mW/cm²).`),
    ]),
  ]));

  // which drills each lesson shows (title, the trick)
  Object.assign(RF2.topics, {
    't13-hs': [{ gen: 'rf2_hs', title: 'Haynes–Shockley and quasi-Fermi slopes', rule: md`Drift moves the pulse ($v_d = \mu\mathscr{E}$), diffusion widens it ($\propto\sqrt{Dt}$), recombination shrinks its area. A carrier's current flows only where its quasi-Fermi level slopes.` },
      { gen: 'rf2_tr_hs', title: 'What happens if…', rule: md`Arrival time $\propto 1/\mathscr{E}$; spread $\propto\sqrt{t}$.` }],
    't14-v0': [{ gen: 'rf2_eq', title: 'Contact potential in your head', rule: md`$V_0$ = 0.06 V × (decades of $N_aN_d/n_i^2$). Si: $n_i^2$ = 20.35 decades. Each side: $kT\ln(N/n_i)$ = 0.06 × (log N − 10.18).` },
      { gen: 'rf2_tr_eq', title: 'What happens if…', rule: md`$V_0$ is logarithmic in doping (+18 mV per doubling) and falls with T and with smaller $E_g$.` }],
    't15-depl': [{ gen: 'rf2_depl', title: 'Depletion region by eye', rule: md`$N_ax_{p0} = N_dx_{n0}$; voltage splits like the widths; $\mathscr{E}_0 = 2V/W$; Si one-sided $W$ ≈ 1.14 μm × $\sqrt{V}$ × $\sqrt{10^{15}/N}$.` },
      { gen: 'rf2_tr_depl', title: 'What happens if…', rule: md`The light side sets everything. $W \propto \sqrt{(V_0 - V)/N}$, $\mathscr{E}_0 \propto \sqrt{N(V_0 - V)}$.` }],
    't16-bias': [{ gen: 'rf2_bias', title: 'Bias and the law of the junction', rule: md`Edge minority density $= $ equilibrium × $e^{qV/kT}$: ×10 per 60 mV forward, ≈0 in reverse. Barrier $q(V_0 - V)$; $F_n - F_p = qV$.` },
      { gen: 'rf2_tr_bias', title: 'What happens if…', rule: md`Forward: barrier, $W$, $\mathscr{E}_0$ down; injection up exponentially. Reverse: the opposite, and the edges empty out.` }],
    't17-diode': [{ gen: 'rf2_diode', title: 'Diode currents', rule: md`$I_0 \propto n_i^2\left(\frac{D_p}{L_pN_d} + \frac{D_n}{L_nN_a}\right)$: the light side wins. 60 mV/decade; $I_0$ ×2 per 5 K.` },
      { gen: 'rf2_scale', title: 'By how much?', rule: md`Square roots for $W$, $C_j$, $\mathscr{E}_0$, $L$; full powers for $I_0$, $V_{br}$; 18 mV per doubling of current.` },
      { gen: 'rf2_tr_diode', title: 'What happens if…', rule: md`Ask: does it change $n_i^2$, the light side's doping, or $D/L$?` }],
    't18-narrow': [{ gen: 'rf2_narrow', title: 'Narrow base', rule: md`Straight line: $I = qAD_p\Delta p_n/\ell$, $Q = \frac12qA\ell\Delta p_n$, $t_t = \ell^2/2D_p$, base drop $\frac{kT}{q}\frac{\Delta p_n}{N_d}$.` },
      { gen: 'rf2_tr_narrow', title: 'What happens if…', rule: md`$\ell$ replaces $L_p$; transit time replaces lifetime.` }],
    't19-break': [{ gen: 'rf2_break', title: 'Breakdown and real diodes', rule: md`Zener < $4E_g/q$ < both < $6E_g/q$ < avalanche. Zener: T↑ → $V_{br}$↓; avalanche: T↑ → $V_{br}$↑. $M = 1/(1-P)$. Slopes: 60 mV/dec ideal, 120 mV/dec recombination or high level.` },
      { gen: 'rf2_tr_break', title: 'What happens if…', rule: md`$V_{br} \approx \epsilon\mathscr{E}_{crit}^2/2qN$: light-side doping down → $V_{br}$ up.` }],
    't20-cap': [{ gen: 'rf2_cap', title: 'Capacitance and switching', rule: md`$C_j = \epsilon A/W$ (reverse); $C_s = I\tau_p/(kT/q)$ (forward); $r = 26\,\text{mV}/I$; $t_{sd} = \tau_p\ln(1 + I_f/I_r)$.` },
      { gen: 'rf2_tr_cap', title: 'What happens if…', rule: md`$C_j \propto \sqrt{N/(V_0 - V)}$; $C_s \propto I\tau_p$; $t_{sd} \propto \tau_p$.` }],
    't21-ms': [{ gen: 'rf2_ms', title: 'Metal–semiconductor contacts', rule: md`n-type: $\phi_m > \phi_s$ rectifying, $\phi_m < \phi_s$ ohmic. p-type: the reverse. $\phi_B = \phi_m - \chi$ (n), $V_0 = \phi_m - \phi_s$.` },
      { gen: 'rf2_tr_ms', title: 'What happens if…', rule: md`Schottky: majority carriers, big $I_0$, no storage.` }],
    't22-opto': [{ gen: 'rf2_opto', title: 'Light in, light out', rule: md`$I = I_{th}(e^{qV/kT} - 1) - I_{op}$; $V_{oc}$ = 60 mV × decades of $I_{op}/I_{th}$; $P_{max} = FF\cdot I_{sc}V_{oc}$; $\lambda = 1.24/E_g$.` },
      { gen: 'rf2_tr_opto', title: 'What happens if…', rule: md`$I_{sc} \propto$ light, $V_{oc}$ logarithmic; T↑ → $V_{oc}$↓.` }],
  });
  RF2.all = [...new Set([].concat(...Object.values(RF2.topics).map((ds) => ds.map((d) => d.gen))))];
})();

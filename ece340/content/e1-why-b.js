/* The intuition layer for Exam 1, topics 5–8 (see e1-why-a.js). */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const WHY = (window.WHY = window.WHY || {});

  // a carrier's zig-zag path, without a field and with a force to the right (same random flights)
  function walkFig(bias) {
    const f = PF.fig({ alt: bias ? 'the same random path, but every free flight bends slightly to the right: a net drift' : 'a random zig-zag path of a carrier with no field: it ends up near where it started' });
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    let x = 30, y = 70;
    const pts = [[x, y]];
    for (let i = 0; i < 24; i++) {
      const a = rnd() * 2 * Math.PI, L = 12 + 12 * rnd();
      for (let k = 1; k <= 4; k++) { const t = k / 4; pts.push([x + L * t * Math.cos(a) + bias * L * t * t, y + L * t * Math.sin(a)]); }
      [x, y] = pts[pts.length - 1];
    }
    f.pl(pts, { cls: 'curve' });
    f.dot(pts[0][0], pts[0][1], 4); f.dot(x, y, 4);
    f.line(pts[0][0], pts[0][1], x, y, { cls: 'dash dim', arrow: 'end', hs: 6 });
    if (bias) { f.arrow(30, 150, 110, 150, { hs: 6 }); f.text(120, 150, 'force on the carrier', 'l', 'small'); }
    f.track(0, 0, 330, 165);
    return f.svg();
  }

  // intensity against depth for strongly (blue) and weakly (red) absorbed light in Si
  function absFig() {
    return PF.plot({
      w: 360, h: 220, x: [0, 6], y: [0, 1.1], xl: 'x\\,(\\mu\\text{m})', yl: 'I/I_0',
      xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']], yt: [[1, '1'], [0.368, '1/e']],
      curves: [{ f: (x) => Math.exp(-x / 0.4), lab: '\\text{blue}', labAt: 0.45, dx: 6, dy: -4 }, { f: (x) => Math.exp(-x / 3), lab: '\\text{red}', labAt: 4.6, dx: 4, dy: -8 }],
    });
  }

  WHY['t5-temp'] = {
    build: [
      R(md`
        ### Start here: two sources of electrons compete

        The conduction electrons in an n-type sample come from two places:

        - **Donors**: cheap (about $0.045$ eV each) but limited: there are only $N_d$ of them.
        - **Broken bonds** (the valence band): expensive ($1.12$ eV each) but practically unlimited, with $10^{23}$ bonds per cm³.

        Temperature decides which source wins, and that makes three regions:

        1. **Freeze-out** (cold, below roughly 70 K): even the cheap source is too expensive. Electrons stay bound to their donors and $n_0 < N_d$.
        2. **Extrinsic plateau**: every donor is ionized but the valence band has hardly started, so $n_0 \approx N_d$, almost independent of $T$. Devices live here.
        3. **Intrinsic** (hot): the expensive source wins by sheer numbers. $n_i$ overtakes $N_d$ and $n_0 \approx n_i$ climbs steeply.

        The plateau in Si is wide because the two costs are so different. The donor energy is only about $1.7\,kT$ at 300 K, so donors are essentially all ionized by about 100 K. Half the gap is $0.56$ eV $\approx 22\,kT$, so intrinsic carriers only catch up with $10^{15}$ donors near 550 K.
      `),
      Q(md`An n-type Si sample with $N_d = 10^{15}\,\text{cm}^{-3}$ is warmed from 200 K to 400 K. Its electron concentration…`,
        ['barely changes: it is on the plateau, $n_0 \\approx N_d$', 'rises about 1000×', 'falls, because mobility falls', 'doubles, because $T$ doubles'], 0,
        [null, '$n_i$ at 400 K is only about $5\\times10^{12}$, still far below $N_d$.', 'Mobility affects current, not the carrier count.', '$n_0$ is set by the donors here, not by $T$.'],
        md`All donors are ionized throughout and intrinsic generation is still negligible: $n_0 \approx 10^{15}$ at both temperatures.`),
      R(md`
        ### Why $n_i$ explodes with temperature

        $$n_i = \sqrt{N_cN_v}\;e^{-E_g/2kT}$$
        **Why half the gap?** Each pair costs $E_g$, so the product $np \propto e^{-E_g/kT}$; with $n = p$, each one gets the square root, $e^{-E_g/2kT}$.

        The exponent is huge: $E_g/2kT = 21.6$ at 300 K. At 400 K it is $16.2$; the difference, $e^{5.4} \approx 220$, times $(400/300)^{3/2} = 1.54$ from $N_c$ and $N_v$, makes $n_i$ grow about **350×**, to $5\times10^{12}\,\text{cm}^{-3}$.

        A rule of thumb near room temperature: **Si's $n_i$ doubles about every 9 K**, since $\dfrac{d\ln n_i}{dT} = \dfrac{3}{2T} + \dfrac{E_g}{2kT^2} \approx 0.077\ \text{K}^{-1}$. Leakage currents in chips follow $n_i$ or $n_i^2$, which is why hot chips leak so much more.
      `),
      P({
        q: md`By what factor does Si's $n_i$ grow from 300 K to 310 K? (Take $E_g = 1.12$ eV fixed.)`,
        parts: [{ lbl: md`n_i(310)/n_i(300)`, ans: 2.112, tol: { rel: 0.03 } }],
        hints: [md`$\dfrac{n_i(T_2)}{n_i(T_1)} = \left(\dfrac{T_2}{T_1}\right)^{3/2}\exp\left[\dfrac{E_g}{2k}\left(\dfrac{1}{T_1} - \dfrac{1}{T_2}\right)\right]$`],
        sol: md`$(310/300)^{3/2} = 1.050$; $\dfrac{1.12}{2(8.62\times10^{-5})}\left(\dfrac{1}{300} - \dfrac{1}{310}\right) = 0.699$, $e^{0.699} = 2.011$. Product $2.11$: ten kelvin, a doubling.`,
      }),
      R(md`
        ### Where $E_F$ goes as the temperature rises

        - **Freeze-out**: most electrons are still on the donors, so $E_F$ sits between $E_d$ and $E_c$.
        - **Plateau**: $n_0$ stays at $N_d$, but $N_c$ grows ($\propto T^{3/2}$) and the tail broadens with $kT$. Holding the same $n_0$ then needs $E_F$ farther below $E_c$: it slides down toward $E_i$.
        - **Intrinsic**: $n_0 \approx p_0 \approx n_i$, so $E_F \approx E_i$.

        Heating makes any doped semiconductor **forget its doping**: $E_F$ heads to midgap (from below, in p-type). A p–n junction works because its two sides have different $E_F$; once $n_i$ approaches the doping, the difference vanishes and the device stops working. That is why high-temperature electronics use wide-gap SiC ($3.3$ eV) or GaN ($3.4$ eV), whose $n_i$ stays tiny at several hundred °C.
      `),
      Q(md`n-type Si is heated from the plateau into the intrinsic region. Its Fermi level…`,
        ['moves down toward $E_i$', 'moves up toward $E_c$', 'stays fixed: the doping hasn’t changed', 'moves into the valence band'], 0,
        [null, 'More thermal carriers make the sample more intrinsic, not more n-type.', 'The doping is fixed, but $n_i$ and $N_c$ are not.', 'It approaches $E_i$, never passing it in n-type material.'],
        md`As $n_i \to N_d$ and beyond, $n_0 \approx p_0$: the Fermi level approaches the intrinsic level.`),
      R(md`
        ### Compensation: donors and acceptors cancel

        Put both kinds in. A donor's loosely held electron has two places to go: up into the conduction band (costs about $0.045$ eV) or down into an acceptor's empty bond (releases about $1$ eV, falling from near $E_c$ to near $E_v$). Downhill wins: **each acceptor swallows one donor electron**, and only the leftover $|N_d - N_a|$ supplies carriers.

        Both ions stay charged ($N_d^+$ and $N_a^-$): the electron was handed over, not removed. So compensated material has the carrier count of light doping but the **ionized-impurity count of heavy doping**: its mobility is lower than that of uncompensated material with the same $n_0$. Fully compensated material ($N_d = N_a$) has about $n_i$ carriers of each kind but is packed with charged scattering centers.
      `),
      Q(md`Sample A: $N_d = 3\times10^{16}$, $N_a = 2\times10^{16}$. Sample B: $N_d = 10^{16}$ only. Which has the higher resistivity?`,
        ['A: same $n_0 = 10^{16}$, but $5\\times10^{16}$ ionized impurities scatter carriers more', 'B: it has fewer dopants', 'they are equal: both have $n_0 = 10^{16}$', 'A, because its holes cancel its electrons'], 0,
        [null, 'Fewer dopants means less scattering and a higher mobility for B.', 'The carrier count is equal, but the mobility is not.', 'Acceptors take donor electrons; they do not add holes that cancel current.'],
        md`$\rho = 1/(qn_0\mu_n)$. Equal $n_0$, but A's $\mu_n$ is lower because $N_d^+ + N_a^- = 5\times10^{16}$ against $10^{16}$.`),
      R(md`
        ### Neutrality is the master equation

        A uniform sample in equilibrium has no net charge:
        $$p_0 + N_d^+ = n_0 + N_a^-$$
        With $n_0p_0 = n_i^2$ this gives a quadratic whose solution is
        $$n_0 = \frac{N_d - N_a}{2} + \sqrt{\left(\frac{N_d - N_a}{2}\right)^2 + n_i^2}$$
        Read it physically. When $|N_d - N_a| \gg n_i$, the root is about $(N_d - N_a)/2$ and $n_0 \approx N_d - N_a$: the dopants decide. When $n_i \gg |N_d - N_a|$, $n_0 \approx n_i$: heat decides. In between (light doping, hot samples, germanium, compensated material) both count and the shortcut fails.
      `),
      P({
        q: md`Germanium at 300 K ($n_i = 2.5\times10^{13}$) is doped with $N_d = 10^{13}\,\text{cm}^{-3}$. Find $n_0$.`,
        parts: [{ lbl: md`n_0`, ans: 3.05e13, unit: 'cm^{-3}' }],
        sol: md`$n_0 = 5\times10^{12} + \sqrt{(5\times10^{12})^2 + (2.5\times10^{13})^2} = 5\times10^{12} + 2.55\times10^{13} = 3.05\times10^{13}$. Three times $N_d$: the shortcut $n_0 = N_d$ would be badly wrong.`,
      }),
    ],
    qs: [
      Q(md`At 20 K an n-type Si sample barely conducts. The reason is…`,
        ['freeze-out: the electrons are still bound to their donors', 'the mobility is zero at low temperature', 'the band gap closes', 'the donors become acceptors'], 0,
        [null, 'Mobility is actually high in pure, cold Si; there are just no free carriers.', 'The gap gets slightly larger, if anything.', 'Dopants don’t change type.'],
        md`$kT$ at 20 K is $1.7$ meV, far below the $45$ meV donor binding energy.`),
      Q(md`You need electronics that work at 300 °C. The best choice of semiconductor is…`,
        ['SiC (gap 3.3 eV): its $n_i$ stays tiny when hot', 'Ge (gap 0.67 eV)', 'Si, doped more lightly', 'InSb (gap 0.17 eV)'], 0,
        [null, 'Ge goes intrinsic at much lower temperatures than Si.', 'Lighter doping makes it go intrinsic sooner.', 'A tiny gap is intrinsic even at room temperature.'],
        md`Intrinsic carriers swamp the doping when $n_i \sim N_d$; a wide gap pushes that to much higher $T$.`),
      Q(md`For the same doping, which material reaches the intrinsic region at the lowest temperature?`,
        ['Ge', 'Si', 'GaAs', 'all at the same temperature'], 0,
        [null, 'Si’s larger gap holds out longer.', 'GaAs has the largest gap of the three.', '$n_i$ depends exponentially on the gap.'],
        md`Smallest gap, largest $n_i$ at any temperature.`),
      P({
        q: md`Si has $N_d = 10^{16}$ and $N_a = 4\times10^{15}\,\text{cm}^{-3}$ at 300 K. Find $n_0$.`,
        parts: [{ lbl: md`n_0`, ans: 6e15, unit: 'cm^{-3}' }],
        sol: md`$N_d - N_a = 6\times10^{15} \gg n_i$, so $n_0 = 6\times10^{15}\,\text{cm}^{-3}$ and $p_0 = 3.75\times10^4$.`,
      }),
      Q(md`A lightly doped n-type Si resistor is heated from 300 K to 400 K (still on the plateau). Its resistance…`,
        ['rises: $n_0$ is fixed, and lattice scattering lowers the mobility', 'falls: more carriers', 'is unchanged', 'falls to zero'], 0,
        [null, 'On the plateau $n_0 \\approx N_d$ does not grow.', 'Mobility changes with $T$.', 'No such thing in a semiconductor.'],
        md`Like a metal in this range: $\mu_L \propto T^{-3/2}$ dominates. Only in the intrinsic region does the resistance drop.`),
      Q(md`When a donor's electron drops into an acceptor in Si, roughly how much energy is released?`,
        ['about 1 eV ($E_g$ minus the two binding energies)', 'about 0.045 eV', 'about 0.0259 eV', 'none: it is a free process'], 0,
        [null, 'That is the cost of ionizing a donor, not the energy of the drop.', 'That is $kT$.', 'Energy is conserved; it goes into the lattice.'],
        md`From $E_d \approx E_c - 0.045$ down to $E_a \approx E_v + 0.045$: about $1.12 - 0.09 = 1.03$ eV. That is why compensation is complete.`),
      Q(md`Where is $E_F$ in fully compensated silicon ($N_d = N_a$) at 300 K?`,
        ['near $E_i$', 'near $E_c$', 'near $E_v$', 'exactly at $E_d$'], 0,
        [null, 'There are no net donor electrons to push it up.', 'There are no net holes from acceptors either.', 'The donors are all ionized; their level is empty.'],
        md`$n_0 \approx p_0 \approx n_i$, as in pure Si (with much lower mobility).`),
      P({
        q: md`Find Si's $n_i$ at 350 K (take $E_g = 1.12$ eV fixed, $n_i = 1.5\times10^{10}$ at 300 K).`,
        parts: [{ lbl: md`n_i`, ans: 4.17e11, unit: 'cm^{-3}', tol: { rel: 0.03 } }],
        sol: md`$(350/300)^{3/2} = 1.260$; exponent $\dfrac{1.12}{2(8.62\times10^{-5})}\left(\dfrac{1}{300} - \dfrac{1}{350}\right) = 3.094$, $e^{3.094} = 22.1$. $n_i = 1.5\times10^{10}\times27.8 = 4.17\times10^{11}$. Fifty kelvin, almost five doublings.`,
      }),
      Q(md`Why does the intrinsic concentration go as $e^{-E_g/2kT}$, with half the gap?`,
        ['making a pair costs $E_g$, so $np \\propto e^{-E_g/kT}$, and with $n = p$ each carrier gets the square root', 'only half the electrons get excited', 'the Fermi level sits at the top of the gap', 'electrons and holes each carry half the gap as kinetic energy'], 0,
        [null, 'There is no such rule.', 'Intrinsic $E_F$ is at midgap, which is the same statement: $E_c - E_F = E_g/2$.', 'Kinetic energies are of order $kT$.'],
        md`Equivalently: intrinsic $E_F$ is at midgap, so the conduction band is $E_g/2$ above it.`),
      Q(md`A p-type Si sample with $N_a = 10^{14}\,\text{cm}^{-3}$ is heated until $n_i = 10^{16}\,\text{cm}^{-3}$. Now…`,
        ['$n_0 \\approx p_0 \\approx 10^{16}$: it behaves as intrinsic', 'it is still strongly p-type', 'it has turned n-type', 'it has no carriers'], 0,
        [null, 'The acceptors add only $10^{14}$, 1% of $n_i$.', 'Nothing adds donors.', 'It has more carriers than ever.'],
        md`Neutrality: $p_0 = n_0 + 10^{14}$ with $n_0p_0 = 10^{32}$ gives $p_0 \approx 1.005\times10^{16}$, $n_0 \approx 0.995\times10^{16}$.`),
      Q(md`Why do chips leak much more current when they are hot?`,
        ['leakage follows $n_i$ (or $n_i^2$), which doubles roughly every 9 K near room temperature', 'the metal wires melt', 'mobility increases with temperature', 'the doping increases with temperature'], 0,
        [null, 'Far from it.', 'Lattice-limited mobility falls with temperature.', 'Dopant atoms don’t multiply.'],
        md`Thermal generation is exponential in $T$; the minority carriers it supplies make the leakage.`),
      Q(md`Below about 100 K, $E_F$ in n-type Si lies…`,
        ['between $E_d$ and $E_c$', 'at $E_i$', 'below $E_v$', 'at midgap exactly'], 0,
        [null, 'Only when hot.', 'That would make it p-type.', 'The donor electrons pull it up.'],
        md`With electrons still mostly on the donors, $E_F$ sits near the donor level, just below $E_c$.`),
    ],
  };

  WHY['t6-drift'] = {
    build: [
      R(md`
        ### Start here: carriers already move fast, just randomly

        A carrier's average kinetic energy is about $\tfrac32kT$, so it moves at the **thermal velocity**
        $$v_{th} = \sqrt{\frac{3kT}{m^*}} \approx 2\times10^{7}\ \text{cm/s}$$
        for Si electrons at 300 K: about 200 km/s. Yet with no field there is no current, because the velocities point every which way and average to zero.

        Every 0.1–0.2 ps a carrier scatters off a vibrating atom or an ionized dopant and leaves in a new random direction. Between collisions it travels the **mean free path**, about $v_{th}\bar t \approx 50$ nm, a couple of hundred atoms. The perfect lattice itself does not scatter it (Topic 1).
      `),
      Q(md`Electrons in a resistor move at about $10^7$ cm/s. Why is there no current when nothing is connected?`,
        ['their directions are random, so the velocities average to zero', 'they are all trapped on atoms', 'the holes cancel their current', 'they move only along the surface'], 0,
        [null, 'They are free; they just have no preferred direction.', 'Holes are also moving randomly; nothing cancels anything.', 'They move through the whole volume.'],
        md`Current needs a net drift. Random thermal motion carries equal numbers each way across any plane.`),
      RF(md`
        ### A field adds a small lean to every flight

        Apply a field $\mathscr{E}$. During each free flight the carrier accelerates, $a = q\mathscr{E}/m^*$. At the next collision its direction is randomized again and the extra momentum is mostly lost. So instead of speeding up forever, it settles at an average extra velocity:
        $$v_d = a\,\bar t = \frac{q\bar t}{m^*}\,\mathscr{E} \qquad\Longrightarrow\qquad \mu = \frac{q\bar t}{m^*}$$
        **Mobility** = how long a carrier accelerates before a collision resets it, divided by how hard it is to accelerate. A ball rolling down a board studded with pins settles at a steady average speed set by the slope and the pin spacing, not an ever-growing one.

        Check the size: $\mu = 1350\,\text{cm}^2/\text{V·s}$ and $\mathscr{E} = 100$ V/cm give $v_d = 1.35\times10^5$ cm/s, under 1% of $v_{th}$. Drift is a slight lean on a furious random motion. That is why current is proportional to field (Ohm's law): the field barely disturbs the motion it is biasing.

        [[fig:walk]]
      `, { walk: PF.row([{ svg: walkFig(0), cap: 'no field: no net motion' }, { svg: walkFig(0.55), cap: 'with a force: the same flights, each bent slightly' }]) }),
      Q(md`A cleaner crystal doubles the mean time between collisions, $\bar t$. The mobility…`,
        ['doubles', 'halves', 'is unchanged', 'quadruples'], 0,
        [null, 'Longer free flights mean more speed gained per flight.', 'Mobility is set by $\\bar t$ and $m^*$.', '$\\mu \\propto \\bar t$, not $\\bar t^2$.'],
        md`$\mu = q\bar t/m^*$: twice as long accelerating, twice the drift velocity.`),
      R(md`
        ### Current: count the charge crossing a plane

        Put a plane across the bar. In one second, every carrier within a distance $v_d$ of it crosses it: $n\,v_d$ carriers per unit area, each with charge $q$. So $J = q\,n\,v_d$.

        Electrons drift **against** $\mathscr{E}$, but their charge is negative: $(-q)\,n\,(-\mu_n\mathscr{E}) = +qn\mu_n\mathscr{E}$, along $\mathscr{E}$. Holes drift along $\mathscr{E}$ with charge $+q$: also along $\mathscr{E}$. Both add:
        $$J = q\left(n\mu_n + p\mu_p\right)\mathscr{E} = \sigma\mathscr{E}$$
        $\sigma$ is a concentration times a mobility. Doping can move $n$ over ten orders of magnitude, while mobility changes by at most about 10× across all doping levels. **Conductivity is controlled mainly by doping.**
      `),
      Q(md`In a bar, electrons drift to the **left**. The electron current points…`,
        ['right', 'left', 'nowhere: electrons carry no current', 'up'], 0,
        [null, 'Current is the flow of positive charge; negative charge moving left is current to the right.', 'Electrons carry charge $-q$.', 'The motion is along the bar.'],
        md`Conventional current is opposite to electron motion. Electrons move left because $\mathscr{E}$ points right, and the current flows along $\mathscr{E}$.`),
      R(md`
        ### What scatters a carrier, and how temperature changes it

        - **Lattice (phonon) scattering**: the atoms vibrate more when hot, so collisions come more often: $\mu_L \propto T^{-3/2}$, falling with temperature.
        - **Ionized-impurity scattering**: a charged dopant deflects a passing carrier the way the sun bends a comet's path. A fast carrier zips past barely deflected; a slow one is turned sharply. Heat makes carriers faster, so they are deflected less: $\mu_I \propto T^{3/2}/N_I$, rising with temperature and falling with the number of charged impurities (donors and acceptors both count).

        Two independent ways to be interrupted means the **rates add**: $1/\bar t = 1/\bar t_L + 1/\bar t_I$, so
        $$\frac1\mu = \frac{1}{\mu_L} + \frac{1}{\mu_I}$$
        The smaller mobility dominates, as the larger resistor dominates two in series. Lightly doped Si near room temperature is lattice-limited (mobility falls as it heats). Heavily doped or cold Si is impurity-limited (mobility rises as it heats). In between, $\mu(T)$ peaks.
      `),
      Q(md`A heavily doped Si sample at 100 K, where impurity scattering dominates, is warmed slightly. Its mobility…`,
        ['rises: faster carriers are deflected less by the ions', 'falls: the lattice vibrates more', 'is unchanged', 'drops to zero'], 0,
        [null, 'True in the lattice-limited regime; here impurities dominate.', 'Both mechanisms depend on temperature.', 'Mobility does not vanish.'],
        md`$\mu_I \propto T^{3/2}$: in the impurity-limited regime warming helps.`),
      R(md`
        ### Why electrons beat holes, and why speed saturates

        In Si, $\mu_n = 1350$ and $\mu_p = 480\,\text{cm}^2/\text{V·s}$: holes respond as heavier particles. GaAs electrons are much lighter still ($0.067\,m_0$), giving $\mu_n \approx 8500$.

        **Velocity saturation.** Above about $10^4$ V/cm a carrier gains energy between collisions faster than gentle lattice collisions can remove it. It heats up until it can emit **optical phonons** (about $0.06$ eV each), which caps its drift velocity near $v_{sat} \approx 10^7$ cm/s, close to the thermal velocity. Then $v = \mu\mathscr{E}$ fails. One volt across a micrometer is already $10^4$ V/cm, so short transistors run at $v_{sat}$.
      `),
      Q(md`What is the electron drift velocity in Si at $\mathscr{E} = 10^5$ V/cm?`,
        ['about $10^7$ cm/s: it has saturated', '$1.35\\times10^8$ cm/s, from $\\mu\\mathscr{E}$', 'zero', 'faster than light'], 0,
        [null, '$\\mu\\mathscr{E}$ holds only at low fields; carriers can’t shed energy fast enough beyond about $10^4$ V/cm.', 'Strong fields still move carriers.', 'Not even close.'],
        md`At high field optical-phonon emission caps the velocity near $10^7$ cm/s.`),
      R(md`
        ### Resistance: material times geometry

        $$R = \frac{\rho L}{A}$$
        A longer bar means more collisions on the way; a fatter one means more parallel paths. The resistivity $\rho = 1/\sigma$ belongs to the material; $R$ belongs to the object.
      `),
    ],
    qs: [
      P({
        q: md`Si electrons have $\mu_n = 1350\,\text{cm}^2/\text{V·s}$ and $m^* = 0.26\,m_0$. Find the mean time between collisions.`,
        parts: [{ lbl: md`\bar t`, ans: 0.1999, unit: 'ps' }],
        hints: [md`Use SI: $1350\,\text{cm}^2/\text{V·s} = 0.135\,\text{m}^2/\text{V·s}$.`],
        sol: md`$\bar t = \dfrac{\mu m^*}{q} = \dfrac{(0.135)(0.26)(9.11\times10^{-31})}{1.6\times10^{-19}} = 2.0\times10^{-13}$ s $= 0.20$ ps.`,
      }),
      Q(md`Intrinsic Si is heated from 300 K to 400 K. Its resistance…`,
        ['falls a lot: $n_i$ grows hundreds of times, far outweighing the mobility drop', 'rises: mobility falls', 'is unchanged', 'rises a lot'], 0,
        [null, 'Mobility falls by less than 2×; $n_i$ grows about 350×.', 'The carrier count changes enormously.', 'The opposite.'],
        md`Here the carrier count dominates: a semiconductor thermistor.`),
      Q(md`n-type and p-type Si bars have the same dimensions and the same doping level. Which conducts better?`,
        ['n-type, by about $\\mu_n/\\mu_p \\approx 2.8$', 'p-type', 'they are equal', 'it depends on the length'], 0,
        [null, 'Holes are less mobile in Si.', 'Same carrier count, different mobility.', 'Length affects both equally.'],
        md`$\sigma = qN\mu$: same $N$, and $\mu_n = 1350$ versus $\mu_p = 480$.`),
      P({
        q: md`Lattice scattering alone would give $\mu_L = 1500$ and impurity scattering alone $\mu_I = 500\,\text{cm}^2/\text{V·s}$. Find $\mu$.`,
        parts: [{ lbl: md`\mu`, ans: 375, unit: 'cm^2/V·s' }],
        sol: md`$1/\mu = 1/1500 + 1/500 = 4/1500$, so $\mu = 375$: below the smaller one, as for resistors in parallel.`,
      }),
      Q(md`The Hall effect tells you whether the majority carriers are electrons or holes; a resistance measurement can’t. Why?`,
        ['the magnetic force pushes both kinds to the same side, so the sign of the charge that piles up there reveals the carrier type', 'electrons and holes have different masses', 'holes don’t feel magnetic fields', 'resistance depends on the carrier sign'], 0,
        [null, 'Mass doesn’t set the sign of the Hall voltage.', 'They do: the force is $q\\vec v\\times\\vec B$.', 'Resistance depends on $|q|n\\mu$ only.'],
        md`Holes move with the current and electrons against it, but $q\vec v$ is the same for both, so both are pushed toward the same face; the sign of the Hall voltage is the sign of the carriers.`),
      Q(md`In a typical resistor, the drift velocity compared with the thermal velocity is…`,
        ['far smaller: under about 1%', 'about equal', 'far larger', 'exactly zero'], 0,
        [null, 'Only at very high fields does drift approach $v_{th}$.', 'Drift is a small bias.', 'Then there would be no current.'],
        md`For $\mu = 1350$ and 100 V/cm, $v_d = 1.35\times10^5$ against $v_{th} \approx 2\times10^7$ cm/s.`),
      Q(md`Why does the drift velocity saturate near $10^7$ cm/s at high fields?`,
        ['hot carriers emit optical phonons, which takes energy away as fast as the field supplies it', 'the carriers run out', 'the field reverses', 'electrons reach the speed of light in the crystal'], 0,
        [null, 'The carrier count is unchanged.', 'The field is steady.', 'Far below it.'],
        md`An energy-loss channel opens above a threshold, capping the velocity.`),
      Q(md`$N_d$ in an n-type bar is doubled. Its resistivity…`,
        ['roughly halves (a bit less, since the mobility drops slightly)', 'doubles', 'is unchanged', 'quarters'], 0,
        [null, 'More carriers lower the resistivity.', '$n_0$ doubles.', 'Only $n_0$ doubles, not $\\mu$ as well.'],
        md`$\rho = 1/(qN_d\mu_n)$; $\mu_n$ falls slowly with doping.`),
      Q(md`Material X has the same collision time as Si but a smaller electron effective mass. Its electron mobility is…`,
        ['higher', 'lower', 'the same', 'zero'], 0,
        [null, 'Lighter carriers accelerate more.', '$\\mu = q\\bar t/m^*$.', 'Not with a finite collision time.'],
        md`$\mu \propto 1/m^*$ at fixed $\bar t$: why GaAs and InP make fast transistors.`),
      P({
        q: md`Electrons cross a $1\,\mu$m Si channel with $0.1$ V across it ($\mu_n = 1350$, low field). How long does the trip take?`,
        parts: [{ lbl: md`t`, ans: 74.07, unit: 'ps' }],
        sol: md`$\mathscr{E} = 0.1/10^{-4} = 1000$ V/cm, $v_d = 1.35\times10^6$ cm/s, $t = 10^{-4}/1.35\times10^6 = 7.4\times10^{-11}$ s $= 74$ ps. Short channels and high mobility make fast transistors.`,
      }),
      Q(md`Electrons and holes drift in opposite directions. Why do their currents add rather than cancel?`,
        ['they carry opposite charges, so opposite motion is current in the same direction', 'they don’t: they cancel partly', 'holes move in the same direction as electrons', 'only electrons carry current'], 0,
        [null, 'Both terms in $\\sigma$ are positive.', 'Holes move along the field, electrons against it.', 'Holes carry current too.'],
        md`$J = q(n\mu_n + p\mu_p)\mathscr{E}$, with both terms positive.`),
      Q(md`Why is Ohm's law (current proportional to field) so accurate in semiconductors at ordinary fields?`,
        ['the field only slightly biases a fast random motion, so the response is linear', 'the carriers are at rest until the field is applied', 'the resistance is fixed by geometry only', 'it isn’t accurate'], 0,
        [null, 'They already move at $\\sim10^7$ cm/s.', 'Material properties enter through $\\rho$.', 'It is excellent up to about $10^3$–$10^4$ V/cm.'],
        md`A small perturbation of a random motion produces a proportional response.`),
    ],
  };

  WHY['t7-flatef'] = {
    build: [
      R(md`
        ### Start here: electrons flow until the Fermi levels match

        Connect two water tanks at different levels and water flows until the levels match. Electrons do the same with the Fermi level, the energy it costs to add one more electron.

        Put n-type material ($E_F$ near $E_c$) against p-type material ($E_F$ near $E_v$). Look at one energy just above $E_c$: on the n side those states are far more likely to be full, since its $E_F$ is closer. Electrons cross the boundary both ways at random, but more cross from the side where the states are fuller, so there is a **net flow from n to p**. (Holes likewise flow from p to n.)

        The flow stops only when, at every energy, the occupation is the same on both sides. The same $f(E)$ on both sides means **the same $E_F$**. Then the traffic is equal both ways: equilibrium.
      `),
      Q(md`Two pieces of semiconductor touch; piece A's Fermi level is higher than piece B's. Electrons flow…`,
        ['from A to B, until the Fermi levels are equal', 'from B to A', 'nowhere: they are separate materials', 'back and forth forever with a net current'], 0,
        [null, 'At the same energy, A’s states are fuller, so more electrons leave A.', 'Contact lets electrons cross.', 'Equilibrium means no net current.'],
        md`Higher $E_F$ means fuller states at every energy, so the net flow goes toward the lower $E_F$ until it is flat.`),
      R(md`
        ### Moving charge bends the bands

        The electrons that leave the n side expose positive donor ions there; arriving on the p side (and recombining with holes), they leave negative acceptor ions uncovered. That makes a **dipole**: $+$ on the n side, $-$ on the p side. A dipole makes a field (pointing from n to p) and a potential difference $V_0$ (the n side at higher potential).

        An electron's potential energy is $-qV$, so higher potential means **lower** electron energy. All of the n side's levels ($E_c$, $E_v$, $E_i$ together) drop by $qV_0$ relative to the p side. That is **band bending**: the bands bend, $E_F$ stays flat.

        The process limits itself: the growing field pushes back on further transfer until it stops. The final step equals the original difference between the Fermi levels:
        $$qV_0 = E_{F,n} - E_{F,p}\ (\text{before contact}) = kT\ln\frac{N_aN_d}{n_i^2}$$
      `),
      Q(md`In the junction, the built-in field points from the n side to the p side. What does it do to electrons arriving from the n side?`,
        ['pushes them back toward the n side, opposing their diffusion', 'pulls them faster into the p side', 'nothing: fields don’t act on electrons', 'turns them into holes'], 0,
        [null, 'The force on an electron is $-q\\mathscr{E}$, opposite to the field.', 'Fields push every charge.', 'Nothing converts carriers.'],
        md`The field grows until its push back on electrons (and holes) exactly balances their diffusion.`),
      R(md`
        ### Equilibrium: two big flows cancelling, separately for each carrier

        Near the junction the electron concentration changes enormously, so electrons **diffuse** from n to p. The built-in field makes them **drift** from p to n. In equilibrium the two cancel exactly for electrons, and separately for holes:
        $$J_{n,\text{drift}} + J_{n,\text{diff}} = 0, \qquad J_{p,\text{drift}} + J_{p,\text{diff}} = 0$$
        Equilibrium is not "nothing moves". It is "every flow is balanced by an equal and opposite one".

        Drift and diffusion of electrons combine into one compact form, $J_n = \mu_nn\,\dfrac{dE_F}{dx}$ (Topic 11). Zero current everywhere is the same statement as $\dfrac{dE_F}{dx} = 0$: **a flat Fermi level means no net current**, and a tilted one means current is flowing.
      `),
      Q(md`In an unbiased p–n junction, the electron diffusion current is…`,
        ['large, but cancelled exactly by an equal electron drift current', 'zero', 'cancelled by the hole diffusion current', 'equal to the total current'], 0,
        [null, 'There is a big concentration gradient, so there is diffusion.', 'Each carrier balances separately.', 'The total current is zero.'],
        md`For each carrier type separately, drift cancels diffusion.`),
      R(md`
        ### Reading a band diagram like a map

        - **Up is electron energy.** $E_c$ is the potential energy of an electron at rest. Electrons roll **downhill** on $E_c$, like marbles. Holes float **uphill** on $E_v$, like bubbles, because hole energy increases downward.
        - **Slope is field:** $\mathscr{E} = \dfrac1q\dfrac{dE_c}{dx}$. The field points the way $E_c$ rises; steeper means stronger.
        - **Distance to $E_F$ is concentration**, 60 meV per decade: small $E_c - E_F$ means many electrons, small $E_F - E_v$ many holes.
        - **Potential** $V(x) = -E_c(x)/q + \text{const}$: highest where the bands are lowest.
      `),
      Q(md`$E_c$ slopes **down** to the right. The field points ___ and an electron placed there moves ___.`,
        ['left; right', 'right; right', 'left; left', 'right; left'], 0,
        [null, 'The field points the way $E_c$ rises: to the left.', 'The electron rolls downhill: to the right.', 'Field points uphill in $E_c$, and the electron rolls downhill.'],
        md`$\mathscr{E} = \tfrac1q\,dE_c/dx < 0$: points left. The force $-q\mathscr{E}$ points right, down the slope.`),
      R(md`
        ### Why a junction in the dark is not a battery

        $V_0$ is real, but connect a voltmeter across a junction and it reads zero. Each metal–semiconductor contact has its own built-in step, and around any closed loop all the steps cancel, because $E_F$ is flat through everything in equilibrium. You can't extract energy from a system in equilibrium; if you could, it would be a perpetual-motion machine.

        Light breaks equilibrium: the quasi-Fermi levels split (Topic 10), and that is how a solar cell turns the built-in field into usable voltage.
      `),
      Q(md`A voltmeter is connected across an unbiased p–n junction with $V_0 = 0.75$ V, in the dark. It reads…`,
        ['0 V: the contact potentials around the loop cancel', '0.75 V', '−0.75 V', '1.12 V'], 0,
        [null, 'The meter’s own contacts add steps that cancel $V_0$.', 'Same reason.', 'Unrelated to the gap here.'],
        md`Flat $E_F$ everywhere means zero net voltage around the circuit.`),
    ],
    qs: [
      Q(md`An $n^+$ region ($10^{18}$) touches an $n$ region ($10^{15}$). The built-in field points…`,
        ['from $n^+$ to $n$', 'from $n$ to $n^+$', 'nowhere: both are n-type', 'up'], 0,
        [null, 'Electrons leave the $n^+$ side, uncovering positive donors there.', 'Any doping step makes a field.', 'Along the junction direction.'],
        md`Electrons diffuse from $n^+$ to $n$; the uncovered donors on the $n^+$ side and the extra electrons on the $n$ side make a field from $n^+$ to $n$.`),
      P({
        q: md`Find the built-in step $qV_0$ between $n^+$ Si ($10^{18}$) and $n$ Si ($10^{15}\,\text{cm}^{-3}$) at 300 K.`,
        parts: [{ lbl: md`qV_0`, ans: 0.1789, unit: 'eV' }],
        sol: md`The difference in $E_F - E_i$: $kT\ln(10^{18}/10^{15}) = 0.0259\ln1000 = 0.179$ eV. Three decades, 60 meV each.`,
      }),
      Q(md`Both sides of a Si p–n junction are doped more heavily. $V_0$…`,
        ['increases', 'decreases', 'is unchanged', 'becomes negative'], 0,
        [null, 'Each side’s $E_F$ moves closer to its band edge.', '$V_0 = (kT/q)\\ln(N_aN_d/n_i^2)$ grows.', 'Still n side positive.'],
        md`Heavier doping pushes the two Fermi levels farther apart before contact.`),
      Q(md`Si and Ge junctions with the same doping: which has the larger $V_0$?`,
        ['Si, because its $n_i$ is smaller', 'Ge', 'they are equal', 'it depends only on the doping'], 0,
        [null, 'Ge’s larger $n_i$ puts the Fermi levels closer to midgap.', '$n_i$ appears in the logarithm.', '$n_i$ matters too.'],
        md`$V_0 = (kT/q)\ln(N_aN_d/n_i^2)$: smaller $n_i$, larger $V_0$. The upper limit is about $E_g/q$.`),
      Q(md`What limits how large $V_0$ can be?`,
        ['roughly $E_g/q$: each Fermi level can only approach its band edge', 'nothing: more doping always adds more', '$kT/q$', 'the applied voltage'], 0,
        [null, 'Once a side is degenerate, its $E_F$ stops moving relative to the band.', 'That is 26 mV, far too small.', 'There is no applied voltage in equilibrium.'],
        md`$E_{F,n}$ can't rise far above $E_c$ and $E_{F,p}$ can't fall far below $E_v$, so $qV_0 \lesssim E_g$.`),
      Q(md`In a nonuniform sample, the Fermi level is found to slope. This means…`,
        ['a current is flowing: the sample is not in equilibrium', 'the doping changes with position', 'the temperature is zero', 'nothing in particular'], 0,
        [null, 'Changing doping bends the bands, but keeps $E_F$ flat in equilibrium.', 'Unrelated.', 'A tilted $E_F$ always drives current.'],
        md`$J_n = \mu_nn\,dE_F/dx$: a slope means current.`),
      Q(md`Where is the net charge in an $n^+$–$n$ junction at equilibrium?`,
        ['in a thin dipole near the interface: positive on the $n^+$ side, negative on the $n$ side', 'spread evenly through both regions', 'nowhere', 'only at the metal contacts'], 0,
        [null, 'Far from the interface each side is neutral.', 'A step in band energy needs charge.', 'The charge sits where the carriers moved.'],
        md`Electrons moved from $n^+$ to $n$ over a short distance, leaving a dipole that holds the field.`),
      P({
        q: md`In a Si junction at equilibrium ($E_g = 1.12$ eV), far on the n side $E_c - E_F = 0.20$ eV, and far on the p side $E_F - E_v = 0.15$ eV. Find $qV_0$.`,
        parts: [{ lbl: md`qV_0`, ans: 0.77, unit: 'eV' }],
        sol: md`With $E_F$ flat, $E_c$ on the p side is $E_g - 0.15 = 0.97$ eV above $E_F$; on the n side it is $0.20$. The step is $0.97 - 0.20 = 0.77$ eV.`,
      }),
      Q(md`Which side of a p–n junction is at the higher electrostatic potential?`,
        ['the n side', 'the p side', 'neither', 'it alternates'], 0,
        [null, 'The p side has the uncovered negative acceptors.', 'There is a built-in step $V_0$.', 'It is a fixed equilibrium state.'],
        md`Its bands are lower, and electron energy is $-qV$: lower bands, higher potential. The uncovered donors make it positive.`),
      Q(md`Why do the bands bend smoothly across a junction instead of breaking apart?`,
        ['the electrostatic potential shifts all of a region’s levels together, and the potential varies continuously', 'the band gap changes with doping', 'electrons fill the gap', 'they do break'], 0,
        [null, 'The gap is a material property, the same on both sides.', 'No states appear in the gap.', 'Potential (and so band edges) is continuous.'],
        md`$E_c$, $E_i$ and $E_v$ all follow $-qV(x)$, keeping the gap constant.`),
      Q(md`An electron is released at rest high on a steep slope of $E_c$. Ignoring collisions it would gain kinetic energy rolling down. In reality…`,
        ['it collides often, so it drifts down at a limited speed, giving the energy to the lattice as heat', 'it accelerates without limit', 'it stays put', 'it rolls uphill'], 0,
        [null, 'Collisions every ~0.1 ps prevent that.', 'The slope is a force.', 'Electrons roll down $E_c$.'],
        md`Drift: the field's work becomes heat via collisions. That is the energy dissipated in a resistor.`),
      Q(md`Is $E_F$ flat across a metal contact on a semiconductor in equilibrium, too?`,
        ['yes: equilibrium means one $E_F$ through every material in contact', 'no: metals have no Fermi level', 'only if the metal is gold', 'only at 0 K'], 0,
        [null, 'Metals have one, sitting inside a band.', 'Any metal.', 'At any temperature in equilibrium.'],
        md`One Fermi level throughout is the condition for equilibrium, metal included.`),
    ],
  };

  WHY['t8-optical'] = {
    build: [
      R(md`
        ### Start here: a photon either fits the gap or passes through

        A photon of wavelength $\lambda$ carries $h\nu = 1.24/\lambda[\mu\text{m}]$ eV. Band-to-band absorption lifts a valence electron into an empty conduction state, which needs $h\nu \ge E_g$. Below that there is no state for the electron to land in (the gap has none), so the photon goes straight through: the material is **transparent** to it.

        - Si ($E_g = 1.12$ eV, cutoff $1.11\,\mu$m) is transparent to the 1.3 and 1.55 $\mu$m light used in optical fibers. Silicon waveguides on chips carry that light; a silicon photodiode can't detect it.
        - Glass ($E_g \approx 9$ eV) is transparent to all visible light ($1.8$–$3.1$ eV).
        - GaAs ($1.43$ eV) absorbs all visible light, so it looks dark gray.

        Above the gap, each absorbed photon makes one electron–hole pair.
      `),
      Q(md`Light of wavelength $1.55\,\mu$m falls on silicon. It is…`,
        ['transmitted: $0.80$ eV is below the $1.12$ eV gap', 'absorbed, making pairs', 'absorbed, making two pairs per photon', 'reflected entirely'], 0,
        [null, 'There are no states in the gap for the electron to go to.', 'Not even one pair.', 'Some is reflected at the surface, but most passes through.'],
        md`$h\nu = 1.24/1.55 = 0.80$ eV $< E_g$: silicon is transparent here.`),
      RF(md`
        ### Why the light dies off exponentially

        Each photon has the same chance per unit length of being absorbed, $\alpha\,dx$, however far it has already gone. In each thin slice, the number absorbed is proportional to the number arriving:
        $$dI = -\alpha I\,dx \qquad\Longrightarrow\qquad I(x) = I_0e^{-\alpha x}$$
        It is the law of a stack of tinted sheets: each sheet removes the same fraction. $1/\alpha$ is the **absorption depth**: 37% of the light is left there, 14% at $2/\alpha$, 5% at $3/\alpha$.

        $\alpha$ depends strongly on photon energy: zero below $E_g$, then rising steeply above it, because more energetic photons find more pairs of states to connect. In Si, red light (about 1.9 eV) gets about $3\,\mu$m in, blue (about 2.8 eV) only about $0.4\,\mu$m, and $1\,\mu$m infrared about $150\,\mu$m. A direct-gap material like GaAs reaches $\alpha \sim 10^4\,\text{cm}^{-1}$ just above its gap; indirect Si rises slowly near its gap, because those transitions need phonons.

        [[fig:abs]]
      `, { abs: { svg: absFig(), cap: 'Light intensity against depth in Si: blue is gone within about a micrometer, red penetrates several.' } }),
      Q(md`What fraction of the light is absorbed in the first absorption depth $1/\alpha$?`,
        ['63%', '37%', '50%', '100%'], 0,
        [null, 'That is what is left.', 'That would be at $\\ln2/\\alpha$.', 'An exponential never reaches zero.'],
        md`Absorbed $= 1 - e^{-1} = 0.63$.`),
      R(md`
        ### Where the photon's energy goes

        A photon above the gap puts the electron high in the conduction band and the hole deep in the valence band. Within about a picosecond both collide with the lattice, shedding the excess as phonons (heat), and settle at the band edges: **thermalization**. Only about $E_g$ per pair survives, until it recombines.

        - **Solar cells:** photons below $E_g$ are lost entirely, and photons above it lose $h\nu - E_g$ as heat. A small gap catches many photons but keeps little of each; a large gap keeps a lot per photon but catches few. The best compromise for sunlight is near $1.3$–$1.4$ eV, about 33% maximum efficiency for a single junction.
        - **Emission:** carriers relax to the band edges before they recombine, so a material glows at about $E_g$ whatever excited it. GaAs emits near 870 nm whether you shine green or blue light on it.
      `),
      Q(md`GaAs ($E_g = 1.43$ eV) is excited with 2.5 eV light. The light it emits is at about…`,
        ['1.43 eV (870 nm): the carriers relax to the band edges first', '2.5 eV, the same as the excitation', '1.07 eV, the difference', 'a broad white spectrum'], 0,
        [null, 'The excess energy is lost to heat before recombination.', 'Not a meaningful transition.', 'Band-edge emission is narrow.'],
        md`Thermalization takes picoseconds; recombination takes nanoseconds or more. Emission comes from the band edges.`),
      R(md`
        ### Counting photons and pairs

        Photons per second $= P/h\nu$, with $h\nu$ in joules ($1\,\text{eV} = 1.6\times10^{-19}$ J). Each absorbed photon makes one pair. Divided by the volume the light is absorbed in, that gives the generation rate $g_{op}$ of Topic 10.

        For example, 1 mW at $1\,\mu$m: $h\nu = 1.24$ eV $= 1.99\times10^{-19}$ J, so $5\times10^{15}$ photons per second.
      `),
      P({
        q: md`A $0.5$ mW beam of 620 nm light is fully absorbed. How many electron–hole pairs per second does it make?`,
        parts: [{ lbl: md`\text{pairs/s}`, ans: 1.5625e15 }],
        sol: md`$h\nu = 1.24/0.62 = 2.0$ eV $= 3.2\times10^{-19}$ J; $5\times10^{-4}/3.2\times10^{-19} = 1.56\times10^{15}$ pairs/s.`,
      }),
    ],
    qs: [
      Q(md`Can a germanium photodiode ($E_g = 0.67$ eV) detect 1.55 $\mu$m light?`,
        ['yes: $0.80$ eV is above its gap', 'no: below its gap', 'only if cooled', 'only with a lens'], 0,
        [null, 'Ge’s cutoff is $1.24/0.67 = 1.85\\,\\mu$m.', 'Cooling slightly widens the gap but not enough to matter here.', 'Optics don’t change photon energy.'],
        md`That is why Ge (and InGaAs) detectors are used for fiber-optic light.`),
      Q(md`A photodiode must respond well to **blue** light. Its junction should be…`,
        ['very close to the surface, because blue is absorbed within a fraction of a micrometer', 'deep inside the wafer', 'anywhere: absorption depth doesn’t matter', 'on the back of the wafer'], 0,
        [null, 'Blue pairs are made near the surface.', 'It matters a lot.', 'Blue light never gets there.'],
        md`Pairs must be made near the junction to be collected. Blue: $1/\alpha \approx 0.4\,\mu$m in Si.`),
      P({
        q: md`What fraction of the light is absorbed within $2/\alpha$ of the surface?`,
        parts: [{ lbl: md`\text{fraction}`, ans: 0.8647 }],
        sol: md`$1 - e^{-2} = 0.865$.`,
      }),
      P({
        q: md`A $2.48$ eV photon is absorbed in Si. What fraction of its energy ends up as heat through thermalization?`,
        parts: [{ lbl: md`\text{fraction}`, ans: 0.5484 }],
        sol: md`$(2.48 - 1.12)/2.48 = 0.548$. More than half the energy of a blue photon is lost at once.`,
      }),
      Q(md`The light intensity on a sample doubles. The optical generation rate…`,
        ['doubles', 'is unchanged', 'quadruples', 'halves'], 0,
        [null, 'Twice the photons, twice the pairs.', 'Linear in photon flux.', 'More light, more pairs.'],
        md`One pair per absorbed photon.`),
      Q(md`Window glass is transparent because…`,
        ['its band gap (about 9 eV) is larger than any visible photon’s energy', 'it has no electrons', 'visible light is too fast to absorb', 'it reflects all light'], 0,
        [null, 'It has plenty, all in a full valence band far below the conduction band.', 'Speed is not the issue; photon energy is.', 'It transmits most light.'],
        md`Visible photons are $1.8$–$3.1$ eV, all below the gap.`),
      P({
        q: md`A $10\,\mu$m Si layer has $\alpha = 1000\,\text{cm}^{-1}$ at some wavelength. What fraction of the light entering it is absorbed?`,
        parts: [{ lbl: md`\text{fraction}`, ans: 0.6321 }],
        sol: md`$\alpha d = 1000\times10^{-3} = 1$: absorbed $1 - e^{-1} = 0.632$.`,
      }),
      Q(md`Which photon carries more energy: 400 nm or 700 nm?`,
        ['400 nm (3.1 eV)', '700 nm (1.77 eV)', 'equal', 'depends on the material'], 0,
        [null, 'Longer wavelength, less energy.', '$E = 1.24/\\lambda$.', 'Photon energy is a property of the photon.'],
        md`$E = 1.24/\lambda[\mu\text{m}]$: 3.10 eV against 1.77 eV.`),
      Q(md`Why is there an optimum band gap for solar cells, rather than "smaller is better"?`,
        ['a small gap absorbs more photons but wastes most of each one’s energy as heat; a large gap wastes the photons below it', 'small gaps can’t absorb light', 'large gaps make more pairs per photon', 'the sun emits only at 1.4 eV'], 0,
        [null, 'Smaller gaps absorb more.', 'One pair per photon regardless of gap.', 'Sunlight is broadband.'],
        md`The trade-off peaks near $1.3$–$1.4$ eV.`),
      P({
        q: md`How thick must a GaAs absorber with $\alpha = 10^4\,\text{cm}^{-1}$ be to absorb 90% of the light?`,
        parts: [{ lbl: md`d`, ans: 2.303, unit: 'μm' }],
        sol: md`$e^{-\alpha d} = 0.1 \Rightarrow d = \ln10/\alpha = 2.30\times10^{-4}$ cm $= 2.3\,\mu$m.`,
      }),
      Q(md`Does a 2.5 eV photon make more electron–hole pairs in Si than a 1.5 eV photon?`,
        ['no: one pair each; the extra energy becomes heat', 'yes, two pairs', 'yes, about 2.2 pairs', 'no pairs at all'], 0,
        [null, 'Only extremely energetic photons (several times $E_g$) make extra pairs, and rarely.', 'Not in this course’s picture.', 'Both are above the gap.'],
        md`The electron and hole thermalize to the band edges; the excess becomes phonons.`),
      Q(md`Why does silicon glow so weakly, even when it holds many excess carriers?`,
        ['its gap is indirect: emitting a photon needs a phonon too, so carriers recombine through defects and make heat instead', 'its gap is too small', 'it absorbs its own light completely', 'silicon has no conduction band'], 0,
        [null, 'GaAs has a larger gap and glows brightly; size is not the issue.', 'Self-absorption is weak near an indirect gap.', 'It does.'],
        md`Direct-gap materials (GaAs, InP, GaN) make LEDs and lasers; Si doesn't.`),
    ],
  };
})();

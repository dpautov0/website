/* Ch. 3, second half — temperature, compensation, drift and the flat Fermi level (Streetman & Banerjee 3.3.3–3.5).
   Topics 5–7. Adds lessons to the 'ch3' unit registered by ch3a.js. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const unit = COURSE.units.find((u) => u.id === 'ch3');

  // n0 versus T for Si with Nd = 1e15 (Ed 0.045 eV below Ec): neutrality n = p + Nd+, solved for EF by bisection
  function nOfT(T, Nd = 1e15) {
    const kT = 8.62e-5 * T, Eg = 1.11, Ed = Eg - 0.045, Nc = 2.8e19 * Math.pow(T / 300, 1.5), Nv = 1.04e19 * Math.pow(T / 300, 1.5);
    const bal = (EF) => Nc * Math.exp(-(Eg - EF) / kT) - Nv * Math.exp(-EF / kT) - Nd / (1 + 2 * Math.exp((EF - Ed) / kT));
    let lo = -0.5, hi = Eg + 0.5;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (bal(m) > 0) hi = m; else lo = m; }
    return Nc * Math.exp(-(Eg - (lo + hi) / 2) / kT);
  }
  const niT = (T) => Math.sqrt(2.8e19 * 1.04e19) * Math.pow(T / 300, 1.5) * Math.exp(-1.11 / (2 * 8.62e-5 * T));
  const Ts = []; for (let T = 40; T <= 720; T += 5) Ts.push(T);
  const tempFig = PF.plot({
    w: 360, h: 220, x: [0, 720], y: [12, 17], xl: 'T\\,(\\text{K})', yl: 'n_0\\,(\\text{cm}^{-3})',
    xt: [[100, '100'], [300, '300'], [500, '500'], [700, '700']], yt: [[13, '10^{13}'], [14, '10^{14}'], [15, '10^{15}'], [16, '10^{16}']],
    curves: [
      { pts: Ts.map((T) => [T, Math.log10(nOfT(T))]), lab: '' },
      { pts: Ts.filter((T) => T > 300).map((T) => [T, Math.log10(niT(T))]), cls: 'dash dim' },
    ],
    hlines: [[15, '']],
  });

  // two pieces before and after contact
  const sm = (x, a, b) => a + (b - a) * (1 + Math.tanh((x - 0.5) / 0.07)) / 2;
  const sepP = BD.diagram({ w: 120, h: 130, E: [-0.15, 1.3], Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.2, lab: { Ei: '' }, axis: false });
  const sepN = BD.diagram({ w: 120, h: 130, E: [-0.15, 1.3], Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.97, lab: { Ei: '' }, axis: false });
  const joined = BD.diagram({ w: 280, h: 150, E: [-0.15 - 0.77, 1.3], Ec: (x) => sm(x, 1.11, 1.11 - 0.77), Ev: (x) => sm(x, 0, -0.77), Ei: (x) => sm(x, 0.555, 0.555 - 0.77), EF: 0.2, lab: { Ei: '' }, xl: 'x', dims: [{ x: 0.06, a: 'Ec', b: 1.11 - 0.77, tex: 'qV_0' }] });

  unit.lessons.push(
    // ======================================================================== Topic 5
    {
      id: 't5-temp', topic: 5, sec: '3.3.3–3.3.4', title: 'Temperature dependence, compensation, space-charge neutrality',
      steps: [
        R(md`
          ### The idea

          Two questions decide $n_0$ and $p_0$ in any real sample: **how hot is it** (which sets $n_i$), and **what dopants are in it, of both kinds**.

          **Temperature.** Put the $T^{3/2}$ of $N_c$ and $N_v$ into $n_i^2 = N_cN_ve^{-E_g/kT}$:
          $$n_i(T) = \sqrt{N_cN_v}\,e^{-E_g/2kT} \;\propto\; T^{3/2}e^{-E_g/2kT}$$
          The exponential wins: in Si, $n_i$ goes from $10^{10}$ at 300 K to about $10^{15}\,\text{cm}^{-3}$ at 600 K. (The gap also shrinks a little as $T$ rises; problems usually say to ignore that.) To scale from a known value,
          $$\frac{n_i(T_2)}{n_i(T_1)} = \left(\frac{T_2}{T_1}\right)^{3/2}\exp\!\left[-\frac{E_g}{2k}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)\right]$$
          with $k = 8.62\times10^{-5}$ eV/K.
        `),
        RF(md`
          ### Three regions of a doped sample

          [[fig:t]]

          For Si with $N_d = 10^{15}\,\text{cm}^{-3}$ (solid; the dashed curve is $n_i$):
          - **Freeze-out** (below ~100 K): $kT$ is too small to ionize the donors; electrons stay bound and $n_0 < N_d$.
          - **Extrinsic** (~150–450 K here): every donor is ionized and $n_i \ll N_d$, so $n_0 \approx N_d$, flat. Devices are designed to live here.
          - **Intrinsic** (hot): $n_i$ climbs past $N_d$ and thermally generated pairs swamp the doping; $n_0 \to n_i$ and the sample stops being "n-type" in any useful sense. A larger gap pushes this region to higher $T$.
        `, { t: { svg: tempFig, cap: '$n_0$ of Si with $N_d = 10^{15}\\,\\text{cm}^{-3}$ (solid) and $n_i$ (dashed), from the neutrality equation with $E_d = E_c - 0.045$ eV.' } }),
        R(md`
          ### Compensation and space-charge neutrality

          A sample can hold donors **and** acceptors. The donors' extra electrons first fill the acceptors' empty bonds; what is left over sets the type. That is **compensation**. A uniform sample at equilibrium is electrically neutral everywhere:

          $$p_0 + N_d^+ = n_0 + N_a^-$$

          - $N_d^+$, $N_a^-$: ionized donors and acceptors, $\text{cm}^{-3}$ (all of them, $N_d$ and $N_a$, outside freeze-out)
          - $n_0$, $p_0$: carriers, $\text{cm}^{-3}$, still tied by $n_0p_0 = n_i^2$

          Substitute $p_0 = n_i^2/n_0$ and solve the quadratic $n_0^2 - (N_d - N_a)n_0 - n_i^2 = 0$:

          $$n_0 = \frac{N_d - N_a}{2} + \sqrt{\left(\frac{N_d - N_a}{2}\right)^2 + n_i^2}, \qquad p_0 = \frac{n_i^2}{n_0}$$

          (if $N_a > N_d$, swap the roles: $p_0 = \frac{N_a - N_d}{2} + \sqrt{\left(\frac{N_a - N_d}{2}\right)^2 + n_i^2}$).

          **When it simplifies.** If $|N_d - N_a| \gg n_i$: $n_0 \approx N_d - N_a$. Use the full formula whenever the net doping is within a factor of about 10 of $n_i$: hot samples, Ge (large $n_i$), or nearly equal $N_d$ and $N_a$. Note that compensation removes carriers but **not** scattering centers: a compensated sample has lower mobility than one doped with only $N_d - N_a$ (Topic 6).
        `),
        R(md`
          ### Worked example

          !!graded Problem
            Ge at 300 K ($n_i = 2.5\times10^{13}\,\text{cm}^{-3}$) contains $N_d = 3.0\times10^{13}$ and $N_a = 1.0\times10^{13}\,\text{cm}^{-3}$, all ionized. Find $n_0$, $p_0$, and $E_F - E_i$.

          **1. Governing equations.** Neutrality $p_0 + N_d = n_0 + N_a$ with $n_0p_0 = n_i^2$. The net doping $2\times10^{13}$ is **comparable** to $n_i$, so no shortcut:
          $$n_0 = \frac{N_d - N_a}{2} + \sqrt{\left(\frac{N_d - N_a}{2}\right)^2 + n_i^2}, \qquad p_0 = \frac{n_i^2}{n_0}, \qquad E_F - E_i = kT\ln\frac{n_0}{n_i}$$

          **2–3. Substitute, with units.**
          $$n_0 = 1.0\times10^{13}\,\text{cm}^{-3} + \sqrt{\left(1.0\times10^{13}\,\text{cm}^{-3}\right)^2 + \left(2.5\times10^{13}\,\text{cm}^{-3}\right)^2} = 1.0\times10^{13} + 2.69\times10^{13}\,\text{cm}^{-3}$$
          $$p_0 = \frac{\left(2.5\times10^{13}\,\text{cm}^{-3}\right)^2}{3.69\times10^{13}\,\text{cm}^{-3}}, \qquad E_F - E_i = (0.0259\,\text{eV})\ln\frac{3.69\times10^{13}}{2.5\times10^{13}}$$

          **4. Answers.** $n_0 = 3.69\times10^{13}\,\text{cm}^{-3}$, $p_0 = 1.69\times10^{13}\,\text{cm}^{-3}$, $E_F - E_i = 0.0101$ eV.

          Check neutrality: $p_0 + N_d = 4.69\times10^{13} = n_0 + N_a$ ✓. The shortcut $n_0 \approx N_d - N_a = 2\times10^{13}$ would be 46% low, and would give $p_0 = 3.1\times10^{13} > n_0$, which can't be right in an n-type sample.

          !!mistake Common mistakes
            - Using $n_0 = N_d - N_a$ when $n_i$ is comparable to the net doping: check $|N_d - N_a|$ against $n_i$ **first**.
            - Using $n_i$ at 300 K for a hot sample. Recompute $n_i(T)$, and remember $kT$ changes too ($kT = 8.62\times10^{-5}T$ eV).
            - Dropping the $T^{3/2}$ factor when scaling $n_i$, or using $E_g/kT$ instead of $E_g/2kT$ in the exponent.
            - Forgetting that the minority carrier is $n_i^2/(\text{majority})$, not $n_i$, after compensation.
            - Assuming freeze-out at room temperature. At 300 K shallow dopants are fully ionized.

          ### Check questions
        `),
        P({
          title: 'A compensated Si sample',
          q: md`Si at 300 K ($n_i = 1.0\times10^{10}\,\text{cm}^{-3}$) contains $N_d = 5.0\times10^{16}$ and $N_a = 2.0\times10^{16}\,\text{cm}^{-3}$. Find $n_0$ and $p_0$.`,
          parts: [{ lbl: md`n_0`, ans: 3e16, unit: 'cm^{-3}' }, { lbl: md`p_0`, ans: 3333.3, unit: 'cm^{-3}' }],
          hints: [md`$N_d - N_a = 3\times10^{16} \gg n_i$, so $n_0 \approx N_d - N_a$.`],
          sol: md`$$n_0 \approx N_d - N_a = 3.00\times10^{16}\,\text{cm}^{-3}, \qquad p_0 = \frac{n_i^2}{n_0} = \frac{10^{20}\,\text{cm}^{-6}}{3.00\times10^{16}\,\text{cm}^{-3}} = 3.33\times10^{3}\,\text{cm}^{-3}$$`,
        }),
        P({
          title: 'Hot silicon',
          q: md`Si has $n_i = 1.0\times10^{10}\,\text{cm}^{-3}$ at 300 K and $E_g = 1.11$ eV (take it constant). Find $n_i$ at 600 K. Then, for a sample with $N_d = 1.0\times10^{15}\,\text{cm}^{-3}$ at 600 K, find $n_0$.`,
          parts: [{ lbl: md`n_i(600\,\text{K})`, ans: 1.294e15, unit: 'cm^{-3}', tol: { rel: 0.03 } }, { lbl: md`n_0`, ans: 1.887e15, unit: 'cm^{-3}', tol: { rel: 0.03 } }],
          hints: [md`$\dfrac{n_i(600)}{n_i(300)} = 2^{3/2}\exp\!\left[-\dfrac{1.11}{2(8.62\times10^{-5})}\left(\dfrac{1}{600} - \dfrac{1}{300}\right)\right]$.`, md`$n_i$ is now bigger than $N_d$: use the full neutrality formula.`],
          sol: md`$$n_i(600) = \left(10^{10}\,\text{cm}^{-3}\right)(2)^{3/2}\exp\!\left[\frac{1.11\,\text{eV}}{2\left(8.62\times10^{-5}\,\text{eV/K}\right)}\cdot\frac{1}{600\,\text{K}}\right] = \left(10^{10}\right)(2.83)(4.57\times10^{4}) = 1.29\times10^{15}\,\text{cm}^{-3}$$ $$n_0 = \frac{N_d}{2} + \sqrt{\frac{N_d^2}{4} + n_i^2} = 5.0\times10^{14} + \sqrt{2.5\times10^{29} + 1.67\times10^{30}}\,\text{cm}^{-3} = 1.89\times10^{15}\,\text{cm}^{-3}$$ The sample is close to intrinsic: $p_0 = n_i^2/n_0 = 8.9\times10^{14}\,\text{cm}^{-3}$.`,
        }),
        Q(md`A Si sample has $N_d = N_a = 10^{16}\,\text{cm}^{-3}$ at 300 K. Compared with pure Si, it has…`,
          ['the same $n_0$ and $p_0$ ($= n_i$), but lower mobility', 'twice as many electrons', 'no carriers at all', 'the same carriers and the same mobility'], 0,
          [null, 'The donors\' electrons are all taken by the acceptors.', '$n_0p_0 = n_i^2$ still holds, so $n_0 = p_0 = n_i$.', 'The $2\\times10^{16}$ ionized impurities scatter carriers.'],
          md`Fully compensated: carriers as intrinsic, but $N_I = N_d + N_a$ ionized impurities scatter.`),
        Q(md`As a doped Si sample is heated far above room temperature, $n_0$…`,
          ['falls, because dopants de-ionize', 'stays at $N_d$ forever', 'rises toward $n_i$, which eventually exceeds $N_d$', 'drops to zero'], 2,
          ['De-ionization (freeze-out) happens at low $T$, not high.', 'Only in the extrinsic range.', null, 'Heating creates carriers.'],
          md`In the intrinsic region thermally generated pairs dominate.`),
      ],
      bank: [
        Q(md`Space-charge neutrality in a uniform sample says…`, ['$n_0 = p_0$', '$p_0 + N_d^+ = n_0 + N_a^-$', '$n_0p_0 = n_i^2$', '$N_d = N_a$'], 1,
          ['Only intrinsic or fully compensated.', null, 'That is the mass-action law, a separate equation.', 'Doping can be anything.'], md`Total positive charge = total negative charge.`),
        Q(md`In the freeze-out region of an n-type sample…`, ['$n_0 < N_d$ because donors are not all ionized', '$n_0 = n_i$', '$n_0 > N_d$', 'there are no donors'], 0,
          [null, 'That is the intrinsic region.', 'Only at high $T$.', 'The donors are still there, holding their electrons.'], md`Low $T$: $kT$ too small to free the donor electrons.`),
        Q(md`Which semiconductor stays extrinsic to the highest temperature for the same doping?`, ['Ge ($E_g = 0.67$ eV)', 'Si (1.11 eV)', 'GaAs (1.43 eV)', 'All the same'], 2,
          ['Smallest gap: largest $n_i$, goes intrinsic first.', 'In between.', null, '$n_i$ depends exponentially on $E_g$.'], md`Largest gap, smallest $n_i(T)$.`),
        Q(md`$n_i$ depends on temperature mainly through…`, ['$e^{-E_g/2kT}$', '$T^{3/2}$', '$T$', '$1/T$'], 0,
          [null, 'Present, but the exponential dominates.', 'No.', 'No.'], md`The exponential changes by orders of magnitude.`),
        Q(md`If $N_a > N_d$ in a Si sample (both $\gg n_i$), the sample is…`, ['n-type with $n_0 = N_d$', 'p-type with $p_0 \\approx N_a - N_d$', 'intrinsic', 'p-type with $p_0 = N_a$'], 1,
          ['The acceptors outnumber the donors.', null, 'Only if $N_a = N_d$.', 'The donors\' electrons fill $N_d$ of the acceptors first.'], md`Net acceptors $N_a - N_d$.`),
        Q(md`When is the full quadratic for $n_0$ needed?`, ['Whenever $N_d > 10^{16}$', 'When $|N_d - N_a|$ is not much larger than $n_i$', 'Only for p-type', 'Never at 300 K'], 1,
          ['Heavy doping makes the shortcut better, not worse.', null, 'It is symmetric.', 'Ge at 300 K with $10^{13}$ doping needs it.'], md`Then $n_i$ is not negligible.`),
      ],
    },

    // ======================================================================== Topic 6
    {
      id: 't6-drift', topic: 6, sec: '3.4', title: 'Drift: conductivity, mobility, resistance',
      steps: [
        R(md`
          ### The idea

          A carrier in a crystal is always moving fast in random directions (thermal speed $\sim10^7$ cm/s), scattering every ~0.1 ps. Apply a field $\mathscr{E}$ and each flight between collisions bends slightly along it, so the whole population picks up a small average **drift velocity**:

          $$v_d = \mu\mathscr{E} \qquad \mu = \frac{q\bar t}{m^*}$$

          - $v_d$: drift velocity, cm/s (holes along $\mathscr{E}$, electrons against it)
          - $\mu$: **mobility**, cm²/V·s (Si: $\mu_n \approx 1350$, $\mu_p \approx 480$)
          - $\mathscr{E}$: electric field, V/cm
          - $\bar t$: mean time between collisions, s; $m^*$: conductivity effective mass, kg

          Light carriers that scatter rarely are mobile. Electrons drift against the field, holes with it, but **both currents point along $\mathscr{E}$** (negative charge moving backward is positive current forward), so they add.
        `),
        RF(md`
          ### Current, conductivity, resistance

          $$J = q\left(n\mu_n + p\mu_p\right)\mathscr{E} = \sigma\mathscr{E} \qquad \sigma = q\left(n\mu_n + p\mu_p\right) \qquad \rho = \frac1\sigma \qquad R = \frac{\rho L}{A} = \frac{L}{\sigma A}$$

          - $J$: current density, A/cm²; $I = JA$
          - $\sigma$: conductivity, $(\Omega\cdot\text{cm})^{-1}$; $\rho$: resistivity, $\Omega\cdot$cm
          - $L$: length along the current, cm; $A$: cross-section, cm²; $R$: resistance, Ω
          - In a doped sample the minority term is negligible: n-type $\sigma \approx qN_d\mu_n$.

          [[fig:bar]]

          ### What sets the mobility

          Two scattering mechanisms act together; their rates add, so their inverse mobilities add (**Matthiessen's rule**):

          $$\frac1\mu = \frac{1}{\mu_L} + \frac{1}{\mu_I}$$

          - **Lattice (phonon) scattering**, $\mu_L \propto T^{-3/2}$: more vibration at higher $T$.
          - **Ionized-impurity scattering**, $\mu_I \propto T^{3/2}/N_I$: a fast carrier is barely deflected by an ion, so it matters most at **low** $T$ and **high doping**. $N_I = N_d^+ + N_a^-$ counts **every** ionized dopant, compensated or not.

          So for a lightly doped sample $\mu$ falls steadily as $T$ rises; a heavily doped one rises at low $T$ (impurity-limited), peaks, then falls (lattice-limited). At fixed $T$, more doping always means lower mobility.

          **High fields.** Above roughly $10^3$–$10^4$ V/cm, carriers gain energy faster than they can lose it and $v_d$ stops growing: it **saturates** near $10^7$ cm/s in Si. Then $\mu$ is no longer constant and $J$ is no longer proportional to $\mathscr{E}$ (Ohm's law fails).

          **Hall effect (3.4.5).** A magnetic field $B_z$ across a current $I_x$ pushes carriers sideways until a Hall voltage balances it. Its sign tells the carrier type, and its size gives the density: $p_0 = \dfrac{I_xB_z}{q\,t\,V_{AB}}$ ($t$ the thickness along $B$); then $\mu_p = \dfrac{1}{q\rho p_0}$.
        `, { bar: { svg: BD.bar({ label: 'n\\text{-Si}' }), cap: 'Current I flows from the + terminal through the bar; the field points the same way; electrons drift the other way.' } }),
        R(md`
          ### Worked example

          !!graded Problem
            An n-type Si bar ($N_d = 1.0\times10^{16}\,\text{cm}^{-3}$, $\mu_n = 1350\,\text{cm}^2/\text{V·s}$) is $L = 1.0$ mm long with a $100\,\mu\text{m}\times10\,\mu\text{m}$ cross-section. $5.0$ V is applied across it. Find $\sigma$, $\rho$, $R$, $I$, $J$, and the electron drift velocity.

          **1. Diagram and governing equations.** The bar above. Minority holes ($p_0 = 10^4\,\text{cm}^{-3}$) don't matter.
          $$\sigma = qN_d\mu_n, \quad \rho = \frac1\sigma, \quad R = \frac{\rho L}{A}, \quad I = \frac VR, \quad J = \frac IA, \quad v_d = \mu_n\frac VL$$

          **2. Units.** $L = 0.10$ cm; $A = (100\times10^{-4}\,\text{cm})(10\times10^{-4}\,\text{cm}) = 1.0\times10^{-5}\,\text{cm}^2$.

          **3. Substitute, with units.**
          $$\sigma = \left(1.6\times10^{-19}\,\text{C}\right)\left(1.0\times10^{16}\,\text{cm}^{-3}\right)\left(1350\,\tfrac{\text{cm}^2}{\text{V·s}}\right) = 2.16\,(\Omega\cdot\text{cm})^{-1}$$
          $$R = \frac{(0.463\,\Omega\cdot\text{cm})(0.10\,\text{cm})}{1.0\times10^{-5}\,\text{cm}^2}, \qquad I = \frac{5.0\,\text{V}}{4630\,\Omega}, \qquad J = \frac{1.08\times10^{-3}\,\text{A}}{1.0\times10^{-5}\,\text{cm}^2}$$
          $$v_d = \left(1350\,\tfrac{\text{cm}^2}{\text{V·s}}\right)\frac{5.0\,\text{V}}{0.10\,\text{cm}} = \left(1350\,\tfrac{\text{cm}^2}{\text{V·s}}\right)\left(50\,\tfrac{\text{V}}{\text{cm}}\right)$$

          **4. Answers.** $\sigma = 2.16\,(\Omega\cdot\text{cm})^{-1}$, $\rho = 0.463\,\Omega\cdot\text{cm}$, $R = 4.63\,\text{k}\Omega$, $I = 1.08$ mA, $J = 108\,\text{A/cm}^2$, $v_d = 6.75\times10^4$ cm/s.

          Check: $J = \sigma\mathscr{E} = (2.16)(50) = 108$ A/cm² ✓, and $v_d \ll 10^7$ cm/s, so the low-field mobility applies.

          !!mistake Common mistakes
            - Mixing m and cm: $1\,\mu\text{m} = 10^{-4}$ cm. Cross-sections in μm² are a classic $10^{8}$ slip.
            - Using $\mu_p$ for an n-type sample, or adding $N_d$ and $N_a$ for the **carriers** in a compensated sample (carriers use $|N_d - N_a|$; scattering uses $N_d + N_a$).
            - Thinking electron and hole currents subtract because the carriers move in opposite directions. The currents **add**.
            - $R = \rho A/L$: upside down. Longer is more resistive, wider is less.
            - Applying $v_d = \mu\mathscr{E}$ at very high fields, giving drift velocities above $10^7$ cm/s.

          ### Check questions
        `),
        P({
          title: 'Resistivity of p-type Si',
          q: md`p-type Si has $N_a = 1.0\times10^{17}\,\text{cm}^{-3}$ and $\mu_p = 250\,\text{cm}^2/\text{V·s}$. Find its resistivity.`,
          parts: [{ lbl: md`\rho`, ans: 0.25, unit: 'Ω·cm' }],
          hints: [md`$\rho = 1/(qN_a\mu_p)$.`],
          sol: md`$$\rho = \frac{1}{qN_a\mu_p} = \frac{1}{\left(1.6\times10^{-19}\,\text{C}\right)\left(1.0\times10^{17}\,\text{cm}^{-3}\right)\left(250\,\text{cm}^2/\text{V·s}\right)} = \frac{1}{4.00\,(\Omega\cdot\text{cm})^{-1}} = 0.250\,\Omega\cdot\text{cm}$$`,
        }),
        P({
          title: 'Matthiessen\'s rule',
          q: md`In a sample, lattice scattering alone would give $\mu_L = 1500\,\text{cm}^2/\text{V·s}$ and impurity scattering alone $\mu_I = 3000\,\text{cm}^2/\text{V·s}$. What is the mobility?`,
          parts: [{ lbl: md`\mu`, ans: 1000, unit: 'cm^2/V·s' }],
          hints: [md`Add the inverses.`],
          sol: md`$$\frac1\mu = \frac{1}{1500} + \frac{1}{3000} = \frac{3}{3000}\;\frac{\text{V·s}}{\text{cm}^2} \;\Rightarrow\; \mu = 1000\,\text{cm}^2/\text{V·s}$$ Lower than either alone, as it must be.`,
        }),
        Q(md`For **heavily** doped Si, as $T$ rises from 100 K to 500 K, the mobility…`,
          ['falls steadily', 'rises steadily', 'rises (impurity scattering fades) then falls (lattice scattering grows)', 'stays constant'], 2,
          ['That is lightly doped Si, where lattice scattering dominates throughout.', 'Lattice scattering eventually takes over.', null, 'Both mechanisms depend on $T$.'],
          md`$\mu_I \propto T^{3/2}$ grows, $\mu_L \propto T^{-3/2}$ shrinks: the smaller one wins at each end.`),
        Q(md`At very high fields in Si, doubling the field roughly…`,
          ['doubles the drift velocity', 'leaves the drift velocity near $10^7$ cm/s', 'halves the current', 'reverses the current'], 1,
          ['Only at low fields.', null, 'Current saturates; it doesn\'t fall.', 'No.'],
          md`Velocity saturation.`),
        Q(md`In an n-type bar, the electrons drift toward the $+$ contact. Which way does the electron **current** flow?`,
          ['Toward the $+$ contact', 'Toward the $-$ contact, along the field', 'There is no electron current, only hole current', 'Perpendicular to the bar'], 1,
          ['That is the electron motion; current is opposite for negative charge.', null, 'Electrons carry almost all the current in n-type.', 'No.'],
          md`Negative charge moving toward $+$ = positive current toward $-$: along $\mathscr{E}$.`),
      ],
      bank: [
        Q(md`Mobility is defined by…`, ['$v_d = \\mu\\mathscr{E}$', '$J = \\mu\\mathscr{E}$', '$\\sigma = \\mu/q$', '$v = \\mu/\\mathscr{E}$'], 0,
          [null, 'Missing $qn$.', 'Upside down and missing $n$.', 'No.'], md`Drift velocity per unit field.`),
        Q(md`Units of conductivity?`, ['$\\Omega\\cdot\\text{cm}$', '$(\\Omega\\cdot\\text{cm})^{-1}$', 'A/cm²', 'cm²/V·s'], 1,
          ['That is resistivity.', null, 'That is current density.', 'That is mobility.'], md`$\sigma = 1/\rho$.`),
        Q(md`Why is $\mu_n > \mu_p$ in Si?`, ['Electrons have a smaller conductivity effective mass', 'Electrons are negative', 'There are more electrons', 'Holes scatter off electrons'], 0,
          [null, 'Sign doesn\'t set mobility.', 'Mobility is per carrier.', 'Not the main reason.'], md`$\mu = q\bar t/m^*$.`),
        Q(md`Doubling the doping at fixed temperature makes the mobility…`, ['larger', 'smaller', 'unchanged', 'negative'], 1,
          ['More ions scatter more.', null, 'Ionized-impurity scattering grows with $N_I$.', 'No.'], md`$\mu_I \propto 1/N_I$.`),
        Q(md`Lattice-scattering-limited mobility varies as…`, ['$T^{-3/2}$', '$T^{3/2}$', '$T$', 'independent of $T$'], 0,
          [null, 'That is impurity scattering.', 'No.', 'More phonons at higher $T$.'], md`$\mu_L \propto T^{-3/2}$.`),
        Q(md`A bar's length doubles and its width doubles (thickness fixed). Its resistance…`, ['doubles', 'halves', 'is unchanged', 'quadruples'], 2,
          ['Width doubles the area too.', 'Length doubles it back.', null, 'No.'], md`$R = \rho L/A$: both doubled.`),
        Q(md`In a Hall measurement the Hall voltage sign tells you…`, ['the carrier type (n or p)', 'the mobility directly', 'the band gap', 'nothing'], 0,
          [null, 'Mobility needs the resistivity as well.', 'No.', 'It does tell the type.'], md`Electrons and holes are pushed the same way by $\vec v\times\vec B$ (opposite $v$, opposite $q$), so the side that charges up has opposite sign.`),
        Q(md`For intrinsic Si, $\sigma = $`, ['$qn_i\\mu_n$', '$qn_i(\\mu_n + \\mu_p)$', '$qn_i^2\\mu$', '$0$'], 1,
          ['Holes carry current too.', null, 'No.', 'There are $n_i$ of each.'], md`$n = p = n_i$.`),
      ],
    },

    // ======================================================================== Topic 7
    {
      id: 't7-flatef', topic: 7, sec: '3.5', title: 'Invariance of the Fermi level at equilibrium',
      steps: [
        RF(md`
          ### The idea

          **At equilibrium the Fermi level is flat:** $\dfrac{dE_F}{dx} = 0$, through any number of different materials or doping levels in contact.

          Why: put two materials together. Electrons cross from 1 to 2 at a rate proportional to (filled states in 1) × (empty states in 2) at each energy, and back at a rate (filled in 2) × (empty in 1). At equilibrium there is no net flow at any energy, which forces $f_1(E) = f_2(E)$, and that means $E_{F1} = E_{F2}$. A sloped $E_F$ would mean net current, and nothing at equilibrium drives one.

          What follows is everything else about junctions: when two pieces with different Fermi levels touch, electrons flow from the one with the **higher** $E_F$ to the one with the lower until the levels line up. The charge moved creates a field and a potential step, so the **bands bend** while $E_F$ stays flat.

          [[fig:sep]]
          [[fig:join]]

          The step in the bands, $qV_0$, equals the difference of the two original Fermi levels. With the Topic 4 formulas for each side:

          $$qV_0 = \left(E_F - E_i\right)_{n} + \left(E_i - E_F\right)_{p} = kT\ln\frac{N_d}{n_i} + kT\ln\frac{N_a}{n_i} = kT\ln\frac{N_aN_d}{n_i^2}$$

          - $V_0$: built-in (contact) potential, V
          - $N_d$, $N_a$: doping on the n and p sides, $\text{cm}^{-3}$

          Inside one sample with **non-uniform** doping the same thing happens gradually: $E_F$ flat, bands tilted, a built-in field (Topic 11).
        `, {
          sep: PF.row([{ svg: sepP, cap: 'p-type alone' }, { svg: sepN, cap: 'n-type alone' }]),
          join: { svg: joined, cap: 'In contact at equilibrium: EF flat, bands bent by qV₀.' },
        }),
        R(md`
          ### Worked example

          !!graded Problem
            A Si region with $N_a = 1.0\times10^{16}\,\text{cm}^{-3}$ is joined to one with $N_d = 1.0\times10^{17}\,\text{cm}^{-3}$ at 300 K ($n_i = 1.0\times10^{10}\,\text{cm}^{-3}$). How far is $E_F$ from $E_i$ on each side before contact, and what is the band step $qV_0$ after?

          **1. Diagram and governing equations.** The pictures above.
          $$\left(E_F - E_i\right)_n = kT\ln\frac{N_d}{n_i}, \qquad \left(E_i - E_F\right)_p = kT\ln\frac{N_a}{n_i}, \qquad qV_0 = \text{their sum}$$

          **2–3. Substitute, with units.**
          $$\left(E_F - E_i\right)_n = (0.0259\,\text{eV})\ln\frac{1.0\times10^{17}\,\text{cm}^{-3}}{1.0\times10^{10}\,\text{cm}^{-3}} = (0.0259\,\text{eV})(16.1)$$
          $$\left(E_i - E_F\right)_p = (0.0259\,\text{eV})\ln\frac{1.0\times10^{16}\,\text{cm}^{-3}}{1.0\times10^{10}\,\text{cm}^{-3}} = (0.0259\,\text{eV})(13.8)$$

          **4. Answers.** $0.417$ eV above $E_i$ (n side), $0.358$ eV below $E_i$ (p side), $qV_0 = 0.775$ eV ($V_0 = 0.775$ V).

          !!mistake Common mistakes
            - Drawing $E_F$ with a step or slope at equilibrium. It is flat; the **bands** bend.
            - Bending the bands the wrong way: on the side that gave up electrons (n), the bands end up **lower** (electrons there have lower energy, which is why they stopped flowing).
            - Subtracting the two Fermi-level offsets: they are on opposite sides of $E_i$, so they **add**.
            - Thinking a flat $E_F$ means no field. In a graded or junction region there is a field; it is exactly balanced by diffusion, so the **net** current is zero.

          ### Check questions
        `),
        Q(md`In a non-uniformly doped sample at equilibrium, which is the same everywhere?`,
          ['$E_c$', '$E_i$', '$E_F$', '$n_0$'], 2,
          ['The bands bend where the doping changes.', '$E_i$ follows the bands.', null, 'Carriers follow the doping.'],
          md`No net current at equilibrium ⇒ $dE_F/dx = 0$.`),
        P({
          title: 'An n–n⁺ step',
          q: md`Two n-type Si regions at 300 K, $N_d = 1.0\times10^{16}$ and $1.0\times10^{18}\,\text{cm}^{-3}$, are in contact. What is the step in $E_c$ between them at equilibrium (in eV)?`,
          parts: [{ lbl: md`\Delta E_c`, ans: 0.1193, unit: 'eV', tol: { abs: 0.002 } }],
          hints: [md`Before contact, the two $E_F$s differ by $kT\ln(n_{02}/n_{01})$. After contact $E_F$ lines up, so $E_c$ shifts by that much.`],
          sol: md`$$\Delta E_c = kT\ln\frac{N_{d2}}{N_{d1}} = (0.0259\,\text{eV})\ln\frac{1.0\times10^{18}}{1.0\times10^{16}} = (0.0259\,\text{eV})(4.61) = 0.119\,\text{eV}$$ $E_c$ is lower on the heavily doped side.`,
        }),
        Q(md`Two pieces touch; piece A's Fermi level was 0.3 eV above piece B's. Electrons flow…`,
          ['from A to B until the Fermi levels line up', 'from B to A', 'not at all: Fermi levels don\'t matter', 'back and forth forever'], 0,
          [null, 'Electrons fall toward the lower Fermi level.', 'That flow is what creates the built-in potential.', 'They settle at equilibrium.'],
          md`Higher $E_F$ = electrons at higher energy; they move until $E_F$ is uniform.`),
        Q(md`Why must $E_F$ be flat at equilibrium?`,
          ['A gradient in $E_F$ would drive a net current, and there is none at equilibrium', 'Because the bands are flat', 'Because $n_i$ is constant', 'It is only an approximation'], 0,
          [null, 'The bands need not be flat.', 'Unrelated.', 'It is exact at equilibrium.'],
          md`$J_n \propto n\,dE_F/dx$; zero current means zero slope.`),
      ],
      bank: [
        Q(md`After two differently doped regions touch, the band step $qV_0$ equals…`, ['the difference of the original Fermi levels', 'the band gap', '$kT$', 'zero'], 0,
          [null, 'Only for degenerate doping on both sides.', 'No.', 'Only if the dopings are equal.'], md`Lining up $E_F$ shifts one side's bands by that difference.`),
        Q(md`In an equilibrium band diagram, the bands slope wherever…`, ['there is an electric field', 'the Fermi level slopes', 'there are no carriers', 'never'], 0,
          [null, 'At equilibrium $E_F$ never slopes.', 'No.', 'Junctions and graded doping bend them.'], md`$\mathscr{E} = \frac1q\frac{dE_c}{dx}$.`),
        Q(md`Doping difference of $10\times$ between two n regions shifts their bands relative to each other by…`, ['$kT\\ln10 = 0.0596$ eV', '0.0259 eV', '0.1 eV', 'none'], 0,
          [null, 'That is $kT$.', 'No.', 'There is a shift.'], md`$kT\ln(10)$.`),
        Q(md`At equilibrium in a junction region the drift current is…`, ['zero because there is no field', 'nonzero but cancelled by an equal and opposite diffusion current', 'the only current', 'infinite'], 1,
          ['There is a field.', null, 'Diffusion balances it.', 'No.'], md`Each carrier's drift and diffusion cancel.`),
      ],
    },
  );
})();

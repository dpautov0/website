/* The intuition layer for Exam 1, topics 9–12 (see e1-why-a.js). Topic 9 also covers indirect recombination and
   trapping (4.3.2). */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const WHY = (window.WHY = window.WHY || {});

  // direct recombination versus the two steps through a midgap trap
  function trapFig() {
    const f = PF.fig({ alt: 'recombination through a trap at midgap: an electron drops from the conduction band to the trap level, then from the trap level into a hole in the valence band' });
    const x0 = 20, x1 = 290, yc = 30, yv = 150, yt = 90;
    f.line(x0, yc, x1, yc, { cls: 'thick' }); f.label(x1 + 6, yc, 'E_c', 'l');
    f.line(x0, yv, x1, yv, { cls: 'thick' }); f.label(x1 + 6, yv, 'E_v', 'l');
    f.line(150, yt, 230, yt, { cls: 'dash' }); f.label(236, yt, 'E_t', 'l', 'small');
    f.dot(60, yc - 7, 4); f.line(60, yc + 2, 60, yv - 12, { cls: 'dim dash', arrow: 'end', hs: 5 }); f.circle(60, yv + 7, 4, { cls: 'bgfill' });
    f.text(68, 70, 'direct', 'l', 'small');
    f.dot(170, yc - 7, 4); f.arrow(170, yc + 2, 170, yt - 6, { hs: 5 }); f.label(163, (yc + yt) / 2, '1', 'r', 'small');
    f.arrow(210, yt + 4, 210, yv - 12, { hs: 5 }); f.circle(210, yv + 7, 4, { cls: 'bgfill' }); f.label(217, (yt + yv) / 2, '2', 'l', 'small');
    return f.svg();
  }

  // a puff of carriers spreading: width grows as the square root of time
  function spreadFig() {
    const g = (s) => (x) => Math.exp(-x * x / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
    return PF.plot({
      w: 360, h: 210, x: [-6, 6], y: [0, 0.9], xl: 'x', yl: '\\delta n',
      xt: [[-4, '-4'], [-2, '-2'], [0, '0'], [2, '2'], [4, '4']],
      curves: [{ f: g(0.5), lab: 't', labAt: 0.45, dx: 6, dy: -6 }, { f: g(1), lab: '4t', labAt: 1.1, dx: 6, dy: -4 }, { f: g(2), lab: '16t', labAt: 2.6, dx: 6, dy: -6 }],
    });
  }

  // steady injection into a long bar: hole current dies away, electron current takes over, the total is constant
  function convFig() {
    return PF.plot({
      w: 360, h: 210, x: [0, 4], y: [0, 1.25], xl: 'x', yl: 'J',
      xt: [[1, 'L_p'], [2, '2L_p'], [3, '3L_p']],
      curves: [{ f: (x) => Math.exp(-x), lab: 'J_p', labAt: 3.1, dx: 4, dy: -10 }, { f: (x) => 1 - Math.exp(-x), lab: 'J_n', labAt: 3.1, dx: 4, dy: 12 },
        { f: () => 1, cls: 'dash', lab: 'J = J_p + J_n', labAt: 0.2, dx: 0, dy: -10 }],
    });
  }

  WHY['t9-recomb'] = {
    build: [
      R(md`
        ### Start here: equilibrium is a balance, not a standstill

        Even in the dark, pairs are generated thermally and recombine all the time; in equilibrium the two rates are equal, $g(T) = \alpha_rn_0p_0$. The **net** recombination rate is
        $$R - G = \alpha_r\left(np - n_i^2\right)$$
        It is zero in equilibrium, positive when there are extra carriers (they disappear), and negative when carriers have been removed (net generation refills them).

        **Excess carriers** are the ones beyond equilibrium: $n = n_0 + \delta n$, $p = p_0 + \delta p$. Light makes them in pairs, so $\delta n = \delta p$. Turn the light off and $np > n_i^2$, so recombination wins until the balance is back.
      `),
      Q(md`In a sample in the dark at equilibrium, recombination…`,
        ['continues, balanced by thermal generation', 'has stopped, since nothing changes', 'outpaces generation, slowly emptying bands', 'happens only at the surfaces'], 0,
        [null, 'Equilibrium is dynamic: the rates balance.', 'Then the carrier numbers would fall.', 'It happens throughout the volume.'],
        md`$G = R = \alpha_rn_i^2$. Equilibrium means balanced flows, not zero flows.`),
      R(md`
        ### Low-level injection: why the decay is exponential

        Take p-type Si with $p_0 = 10^{16}$ (so $n_0 = 2.25\times10^4$) and flash light that makes $\delta n = \delta p = 10^{13}\,\text{cm}^{-3}$. The holes go up by **0.1%**; the electrons go up by a factor of **$4\times10^8$**.

        So each excess electron is surrounded by an essentially unchanged sea of holes. Its chance per second of meeting one and recombining is $\alpha_rp_0$: a constant, however many other excess electrons there are. A constant chance per unit time gives an exponential decay, as for radioactive nuclei:
        $$\delta n(t) = \Delta n\,e^{-t/\tau_n}, \qquad \tau_n = \frac{1}{\alpha_rp_0}$$
        $\tau_n$ is the average time an excess electron survives. Picture a bucket with a hole in it: the outflow is proportional to the water level, so the level falls exponentially.

        - **The majority carriers set the minority lifetime.** More holes, more partners, shorter electron life: ten times the doping gives a tenth of the lifetime (for direct recombination).
        - **Minority carriers are what change.** The excess is enormous compared with $n_0$ and negligible compared with $p_0$. Diodes, transistors, solar cells and photodetectors run on this.
      `),
      Q(md`p-type Si under low-level injection: the doping $p_0$ is doubled. The electron lifetime $\tau_n$…`,
        ['halves', 'doubles', 'is unchanged', 'quarters'], 0,
        [null, 'More holes means electrons find partners sooner.', '$\\tau_n = 1/(\\alpha_rp_0)$ depends on $p_0$.', 'It is $1/p_0$, not $1/p_0^2$.'],
        md`Each excess electron meets holes twice as often.`),
      R(md`
        ### High-level injection: when the partners run out too

        If $\delta n = \delta p \gg p_0$, an excess electron's partners are mostly the excess holes, and they are disappearing too. The rate goes as $\delta n\,\delta p = \delta n^2$: the more that have recombined, the fewer partners remain, so the decay slows down:
        $$\delta n(t) = \frac{\Delta n}{1 + \alpha_r\Delta n\,t}$$
        It halves at $t = 1/(\alpha_r\Delta n)$, which depends on how much you injected: a bigger flash decays faster at first. Once $\delta n$ falls below $p_0$, the decay turns exponential.
      `),
      Q(md`At high level, the initial excess $\Delta n$ is doubled. The time for the excess to halve…`,
        ['halves', 'doubles', 'stays the same', 'is zero'], 0,
        [null, 'More carriers, more partners, faster recombination.', 'That is the exponential (low-level) case.', 'It is $1/(\\alpha_r\\Delta n)$.'],
        md`$t_{1/2} = 1/(\alpha_r\Delta n)$: unlike an exponential, the "half-life" depends on the starting amount.`),
      RF(md`
        ### Recombination through traps: how silicon really does it

        Direct recombination needs an electron to meet a hole and get rid of $E_g$ in one go. In GaAs that is easy: the gap is direct, so it emits a photon. In Si it is very unlikely: the gap is indirect, so it needs a photon and a phonon at once. Silicon's carriers recombine almost entirely through **recombination centers**: defects or impurities (gold, iron, crystal damage) with a level $E_t$ deep in the gap. It takes two steps:

        1. The empty center captures a conduction electron (it drops from $E_c$ to $E_t$, giving energy to the lattice).
        2. The now-full center captures a hole: its electron drops from $E_t$ into the valence band.

        Each step hands the lattice only part of the gap, which is much easier than releasing all of $E_g$ at once: a staircase instead of a cliff.

        [[fig:trap]]

        - **Midgap levels are the deadliest.** A level near $E_c$ captures electrons easily, but shakes them back into the conduction band long before a hole arrives. A level near midgap holds its electron until a hole comes, and both steps are about equally easy.
        - **Trapping** is different: a center captures a carrier and later releases it to the same band. Traps make photoconductors slow (the current tails off long after the light goes off, as trapped carriers come back out) and cause phosphorescence.
        - **Lifetime falls as centers are added**, $\tau \propto 1/N_t$. Engineers use this both ways: gold doping makes fast-switching diodes (short $\tau$), and ultra-clean wafers give solar cells lifetimes of milliseconds.
      `, { trap: { svg: trapFig(), cap: 'Direct recombination (dashed) needs one big drop; through a trap at $E_t$ it takes two smaller steps, 1 then 2.' } }),
      Q(md`Why are impurity levels near **midgap** the most effective recombination centers?`,
        ['it holds carriers until a partner arrives', 'midgap levels emit light efficiently', 'only midgap levels can capture electrons', 'they widen the gap around themselves'], 0,
        [null, 'Recombination through traps mostly makes heat.', 'Shallow levels capture too, but re-emit their carriers.', 'They don’t change the gap.'],
        md`A center near a band edge acts as a trap (capture, then re-emission); one near midgap completes the recombination.`),
    ],
    qs: [
      Q(md`p-type Si with $p_0 = 10^{16}$ gets $\delta n = \delta p = 10^{13}$. Which population changes by the larger **factor**?`,
        ['electrons, by about $4\\times10^8$', 'holes, by about 0.1%', 'both by the same factor', 'neither'], 0,
        [null, 'That is the small one.', 'Equal added numbers, very unequal starting numbers.', 'Both change.'],
        md`$n_0 = 2.25\times10^4$ becomes $10^{13}$; $p_0$ goes from $10^{16}$ to $1.001\times10^{16}$.`),
      P({
        q: md`Low-level injection, $\tau = 1\,\mu$s. How long until the excess has halved?`,
        parts: [{ lbl: md`t_{1/2}`, ans: 0.6931, unit: 'μs' }],
        sol: md`$e^{-t/\tau} = \tfrac12 \Rightarrow t = \tau\ln2 = 0.693\,\mu$s.`,
      }),
      P({
        q: md`What fraction of the excess carriers is left after $3\tau$ (low level)?`,
        parts: [{ lbl: md`\delta n/\Delta n`, ans: 0.04979 }],
        sol: md`$e^{-3} = 0.0498$: about 5%. After $5\tau$, under 1%.`,
      }),
      P({
        q: md`High-level injection with $\alpha_r = 10^{-10}\,\text{cm}^3/\text{s}$ and $\Delta n = 10^{17}\,\text{cm}^{-3}$. When has the excess halved?`,
        parts: [{ lbl: md`t_{1/2}`, ans: 100, unit: 'ns' }],
        sol: md`$t = 1/(\alpha_r\Delta n) = 1/(10^{-10}\times10^{17}) = 10^{-7}$ s $= 100$ ns.`,
      }),
      Q(md`In silicon, most recombination happens…`,
        ['through defect and impurity levels in the gap, releasing heat', 'directly, by emitting photons', 'only at the metal contacts', 'by electrons and holes annihilating like particles and antiparticles'], 0,
        [null, 'That needs a phonon too in an indirect gap: rare.', 'It happens throughout the volume (surfaces add more).', 'Recombination is an electron dropping into an empty bond state.'],
        md`Indirect gap: direct recombination is slow, so traps dominate.`),
      Q(md`Fast-switching silicon diodes are sometimes deliberately doped with gold. Why?`,
        ['to shorten the lifetime for fast turn-off', 'to raise the conductivity of the base', 'gold is a shallow donor in silicon', 'gold makes the diode emit light'], 0,
        [null, 'Its job is recombination, not conduction.', 'It gives deep levels, not shallow donor levels.', 'Trap recombination makes heat.'],
        md`Shorter $\tau$ means less stored minority charge to remove when switching.`),
      Q(md`Which material would you choose for an LED?`,
        ['a direct-gap material like GaAs or GaN', 'silicon', 'any semiconductor works equally well', 'a metal'], 0,
        [null, 'Si’s indirect gap makes light emission very inefficient.', 'Band structure decides efficiency.', 'Metals have no gap to emit across.'],
        md`Direct gap: electrons drop straight down and emit photons.`),
      Q(md`Carriers have been swept out of a region, so there $np < n_i^2$. The net rate $\alpha_r(np - n_i^2)$ is…`,
        ['negative: net generation', 'positive: net recombination', 'zero: it is in steady state', 'undefined below $n_i^2$'], 0,
        [null, 'That is when $np > n_i^2$.', 'Only in equilibrium.', 'It is just a negative number.'],
        md`Thermal generation continues while recombination slows; that is how a depleted region generates leakage current.`),
      Q(md`Compare decay curves after a strong flash (high level) and a weak flash (low level) in the same sample. At first, the strong one decays…`,
        ['faster, since the rate grows with $\\delta n$', 'slower, since traps saturate', 'at the same relative rate (same τ)', 'not at all at first'], 0,
        [null, 'More carriers means more encounters per second.', 'Only at low level is the relative rate fixed at $1/\\tau$.', 'Excess always decays.'],
        md`Initial relative rate $\alpha_r(p_0 + \Delta n)$ grows with $\Delta n$.`),
      Q(md`What distinguishes a **trap** from a **recombination center**?`,
        ['a trap returns its carrier to the same band', 'traps are larger defects than centers', 'traps always sit exactly at midgap', 'nothing: the terms are synonyms'], 0,
        [null, 'Size isn’t the distinction.', 'Midgap levels tend to be recombination centers.', 'They behave very differently.'],
        md`Traps delay carriers; recombination centers destroy them.`),
      P({
        q: md`n-type material has $n_0 = 10^{15}\,\text{cm}^{-3}$ and $\alpha_r = 10^{-10}\,\text{cm}^3/\text{s}$. Find the hole lifetime at low level.`,
        parts: [{ lbl: md`\tau_p`, ans: 10, unit: 'μs' }],
        sol: md`$\tau_p = 1/(\alpha_rn_0) = 1/(10^{-10}\times10^{15}) = 10^{-5}$ s $= 10\,\mu$s.`,
      }),
      Q(md`Under low-level injection in n-type material, the electron concentration…`,
        ['hardly changes', 'changes by a huge factor', 'drops, as holes eat electrons', 'becomes equal to $p$'], 0,
        [null, 'That is the holes.', 'Light adds electrons.', 'Only at high level does the excess dominate.'],
        md`$\delta n \ll n_0$: the majority barely notices. The minority holes carry the story.`),
      Q(md`Doping a sample ten times more heavily (direct recombination, low level) changes the minority lifetime by…`,
        ['a factor of 1/10', 'a factor of 10', 'nothing', 'a factor of 1/100'], 0,
        [null, 'More majority carriers shorten the minority lifetime.', '$\\tau = 1/\\alpha_rN$.', 'Linear in $N$, not quadratic.'],
        md`$\tau_{\text{minority}} = 1/(\alpha_r\,N_{\text{majority}})$.`),
    ],
  };

  WHY['t10-qfl'] = {
    build: [
      R(md`
        ### Start here: steady light fills a leaky bucket

        Light makes pairs at a steady rate $g_{op}$ (per cm³ per second). The excess carriers recombine at $\delta n/\tau_n$. Starting from dark, $\delta n$ grows until the loss equals the supply:
        $$g_{op} = \frac{\delta n}{\tau_n} \quad\Longrightarrow\quad \delta n = g_{op}\tau_n$$
        A tap fills a leaky bucket until the leak matches the tap; a smaller leak (longer lifetime) means a higher level from the same tap. The level also takes about $\tau$ to build up after the light comes on, $\delta n(t) = g_{op}\tau(1 - e^{-t/\tau})$, and about $\tau$ to drain after it goes off.
      `),
      Q(md`The lifetime of a photoconductor is doubled (same light). The steady excess carrier concentration…`,
        ['doubles; the response gets twice as slow', 'doubles; the response gets faster', 'halves; the response gets faster', 'is unchanged; only speed changes'], 0,
        [null, 'A longer lifetime also means a slower rise and fall.', '$\\delta n = g\\tau$ grows with $\\tau$.', 'The supply is the same and the leak is smaller.'],
        md`$\delta n = g_{op}\tau$, and the time constant is $\tau$: sensitivity costs speed.`),
      R(md`
        ### One Fermi level can no longer describe both carriers

        In equilibrium, $n_0 = n_ie^{(E_F - E_i)/kT}$ and $p_0 = n_ie^{(E_i - E_F)/kT}$ share one $E_F$, which forces $n_0p_0 = n_i^2$. Under light $np > n_i^2$, so no single level can give both.

        Look at the time scales, though. Carriers within a band collide and swap energy about every 0.1 ps; recombination takes about a microsecond. Electrons settle into a thermal distribution among themselves some $10^7$ times faster than they disappear, and so do holes. Each population is in equilibrium with itself but not with the other, so each gets its own Fermi level, a **quasi-Fermi level**:
        $$n = n_ie^{(F_n - E_i)/kT}, \qquad p = n_ie^{(E_i - F_p)/kT}$$
        The 60 meV per decade rule now applies to each carrier separately.
      `),
      Q(md`Why does it make sense to give electrons and holes separate Fermi levels under light?`,
        ['each band settles far faster than they recombine', 'electrons and holes have opposite charges', 'light changes the band gap a little', 'the Fermi level splits under any field'], 0,
        [null, 'Opposite charges don’t by themselves imply separate distributions.', 'Light at these intensities doesn’t change the gap.', 'A field alone in equilibrium leaves $E_F$ flat.'],
        md`Fast intraband relaxation, slow interband recombination: two separate quasi-equilibria.`),
      R(md`
        ### The majority level barely moves; the minority level moves a lot

        n-type Si with $n_0 = 10^{15}$; light gives $\delta n = \delta p = 10^{13}\,\text{cm}^{-3}$.

        - **Electrons**: $10^{15} \to 1.01\times10^{15}$, up 1%. $F_n$ rises by $kT\ln1.01 = 0.26$ meV: invisible on a diagram, so it is drawn at the old $E_F$.
        - **Holes**: $2.25\times10^5 \to 10^{13}$, up $4\times10^7$ times. $F_p$ drops by $kT\ln(4.4\times10^7) = 0.46$ eV, from 0.29 eV above $E_i$ to 0.17 eV below it.

        It is the same lesson as Topic 9, now on the energy axis: low-level light changes the minority carriers enormously and the majority carriers hardly at all.
      `),
      P({
        q: md`Under low-level light, the light intensity is doubled. By how much does the minority quasi-Fermi level move?`,
        parts: [{ lbl: md`\Delta F`, ans: 0.01795, unit: 'eV' }],
        sol: md`The minority concentration doubles (it is essentially all excess), so $\Delta F = kT\ln2 = 0.018$ eV. Logarithmic: light has to grow tenfold to move it 60 meV.`,
      }),
      R(md`
        ### The splitting $F_n - F_p$ is the voltage light gives you

        $$np = n_i^2\,e^{(F_n - F_p)/kT}$$
        $F_n - F_p$ measures how far the sample is from equilibrium; it is zero in the dark. It is also the most energy you can extract per electron–hole pair: a solar cell's open-circuit voltage obeys $qV_{oc} \approx F_n - F_p$. A laser needs $F_n - F_p > h\nu \ge E_g$, which means the quasi-Fermi levels pushed into the bands (population inversion).

        **Gradients drive currents**: $J_n = \mu_nn\,\dfrac{dF_n}{dx}$ and $J_p = \mu_pp\,\dfrac{dF_p}{dx}$, the general version of "flat $E_F$, no current". A uniform sample under uniform light has flat $F_n$ and $F_p$: more carriers, but no current until a field or a gradient appears.
      `),
      Q(md`In the dark at equilibrium, $F_n - F_p$ equals…`,
        ['0: both are $E_F$', '$E_g$, the full gap', '$kT$, one thermal unit', '$E_c - E_F$'], 0,
        [null, 'That is the gap, not the splitting.', 'No.', 'Same as $E_g$.'],
        md`Without excitation there is one Fermi level: $np = n_i^2$.`),
      R(md`
        ### Photoconductivity: more carriers, more current

        $$\Delta\sigma = q\left(\delta n\,\mu_n + \delta p\,\mu_p\right) = qg_{op}\left(\tau_n\mu_n + \tau_p\mu_p\right)$$
        Both carriers count, because conductivity depends on absolute numbers, not relative changes, and $\delta n = \delta p$. The trade-off from the bucket returns: a long $\tau$ gives a big signal but a slow detector, a short $\tau$ a fast but weak one.
      `),
      P({
        q: md`Si with $\tau_n = \tau_p = 1\,\mu$s is lit uniformly with $g_{op} = 10^{20}\,\text{cm}^{-3}\text{s}^{-1}$ ($\mu_n = 1350$, $\mu_p = 480$). Find $\Delta\sigma$.`,
        parts: [{ lbl: md`\Delta\sigma`, ans: 0.02928, unit: '(Ω·cm)^{-1}' }],
        sol: md`$\delta n = \delta p = 10^{20}\times10^{-6} = 10^{14}$; $\Delta\sigma = (1.6\times10^{-19})(10^{14})(1830) = 0.0293\,(\Omega\text{cm})^{-1}$.`,
      }),
    ],
    qs: [
      Q(md`Illumination stops at $t = 0$. Over the next few lifetimes, $F_n$ and $F_p$…`,
        ['merge into one $E_F$ over a few τ', 'stay split until the sample is heated', 'merge instantly when the light stops', 'swap places, then slowly merge'], 0,
        [null, 'Recombination alone restores equilibrium within a few τ.', 'The excess takes about $\\tau$ to decay.', 'They never cross: $np$ simply decays back to $n_i^2$.'],
        md`As $\delta n$ decays, $np \to n_i^2$ and $F_n - F_p \to 0$.`),
      Q(md`In **p-type** material under low-level light, which quasi-Fermi level moves a lot?`,
        ['$F_n$', '$F_p$', 'both equally', 'neither'], 0,
        [null, 'Holes are the majority here; they barely change.', 'Only at high level.', 'The minority moves a lot.'],
        md`Electrons are the minority in p-type material.`),
      Q(md`At high-level injection ($\delta n \gg$ the doping), the quasi-Fermi levels…`,
        ['both move far from the old $E_F$', 'neither moves: they track doping', 'only the majority one moves', 'they merge into one level'], 0,
        [null, 'Both concentrations change by large factors.', 'The majority is swamped by the excess.', 'They split more, not less.'],
        md`When the excess outnumbers the majority, both $n$ and $p$ change substantially.`),
      Q(md`For a semiconductor laser to amplify light at $h\nu \approx E_g$, the quasi-Fermi levels must…`,
        ['be split by more than $h\\nu$', 'coincide, as in equilibrium', 'both sit near midgap', 'both lie below $E_v$'], 0,
        [null, 'That is equilibrium: absorption wins.', 'That gives tiny excess populations.', 'Not physical here.'],
        md`Population inversion: $F_n - F_p > h\nu$.`),
      Q(md`A photodetector must respond in nanoseconds. You should give it…`,
        ['a short carrier lifetime', 'a long carrier lifetime', 'a larger band gap', 'heavier carriers'], 0,
        [null, 'Long lifetime means slow rise and fall.', 'The gap sets which light it sees, not speed.', 'That lowers mobility; it doesn’t help speed here.'],
        md`Response time is about $\tau$; signal is about $g\tau$.`),
      Q(md`Under steady light, compared with $n_i^2$, the product $np$ is…`,
        ['larger', 'smaller', 'equal', 'zero'], 0,
        [null, 'Light adds carriers of both kinds.', 'Only in equilibrium.', 'No.'],
        md`$np = n_i^2e^{(F_n - F_p)/kT} > n_i^2$.`),
      Q(md`A uniform sample is uniformly lit, with no voltage applied. Is there a current?`,
        ['no: more carriers, but no gradient', 'yes, from the light’s momentum', 'yes, a diffusion current inward', 'yes, from electrons to holes'], 0,
        [null, 'Photon momentum is negligible.', 'No gradients, no diffusion.', 'They recombine locally; no net current.'],
        md`Current needs a gradient in a quasi-Fermi level (a field, or a concentration gradient).`),
      P({
        q: md`p-type Si ($p_0 = 10^{16}$) under steady light has $\delta n = \delta p = 10^{14}\,\text{cm}^{-3}$. Find $F_n - F_p$.`,
        parts: [{ lbl: md`F_n - F_p`, ans: 0.5756, unit: 'eV' }],
        sol: md`$np = (10^{14})(1.01\times10^{16}) = 1.01\times10^{30}$; $F_n - F_p = 0.0259\ln\dfrac{1.01\times10^{30}}{2.25\times10^{20}} = 0.0259\times22.22 = 0.576$ eV.`,
      }),
      P({
        q: md`What generation rate keeps $\delta p = 10^{12}\,\text{cm}^{-3}$ when $\tau_p = 2\,\mu$s?`,
        parts: [{ lbl: md`g_{op}`, ans: 5e17, unit: 'cm^{-3}s^{-1}' }],
        sol: md`$g = \delta p/\tau_p = 10^{12}/2\times10^{-6} = 5\times10^{17}\,\text{cm}^{-3}\text{s}^{-1}$.`,
      }),
      Q(md`In Si with $\delta n = \delta p$, which carrier contributes more to the photoconductivity?`,
        ['electrons, about 74%, because $\\mu_n > \\mu_p$', 'holes', 'they contribute equally', 'only the minority carriers contribute'], 0,
        [null, 'Holes are less mobile.', 'Equal numbers, unequal mobilities.', 'Both kinds of excess carrier conduct.'],
        md`$1350/(1350 + 480) = 0.74$.`),
      P({
        q: md`Under light, $F_n$ is $0.30$ eV above $E_i$ and $F_p$ is $0.20$ eV below it. Find $np/n_i^2$.`,
        parts: [{ lbl: md`np/n_i^2`, ans: 2.42e8, tol: { rel: 0.03 } }],
        sol: md`$e^{(F_n - F_p)/kT} = e^{0.50/0.0259} = e^{19.3} = 2.4\times10^8$.`,
      }),
      Q(md`Gold is added to a lit sample (more recombination centers), under the same light. The minority quasi-Fermi level…`,
        ['moves less far, as $g\\tau$ is smaller', 'moves farther, as gold adds carriers', 'is unchanged: the light is the same', 'disappears into the gold levels'], 0,
        [null, 'Shorter lifetime means fewer excess carriers.', '$\\tau$ dropped, so $\\delta p$ dropped.', 'There is still an excess.'],
        md`Smaller $\delta p = g\tau_p$, smaller shift.`),
    ],
  };

  WHY['t11-diffusion'] = {
    build: [
      R(md`
        ### Start here: random motion plus a gradient gives a net flow

        No field. More carriers on the left than on the right. Each carrier is equally likely to step left or right; no carrier "knows" about the gradient. But there are more carriers on the left ready to step right than carriers on the right ready to step left, so on balance carriers flow from high to low concentration. No force is involved, just counting: perfume spreading through still air, milk spreading through coffee.

        Make it quantitative. Carriers within one mean free path $\ell$ of a plane cross it on their next flight, with probability about one half each way. The net flux is about $\tfrac12 v_{th}\left[n(x - \ell) - n(x + \ell)\right] \approx -v_{th}\ell\,\dfrac{dn}{dx}$. So
        $$\phi = -D\,\frac{dn}{dx}, \qquad D \sim v_{th}\,\ell\ \ (\text{cm}^2/\text{s})$$
        A steeper gradient gives a bigger flow; faster carriers that fly farther between collisions give a bigger $D$.
      `),
      Q(md`Electrons are spread perfectly evenly through a sample, with no field. The electron diffusion current is…`,
        ['zero: there is no gradient', 'large, because electrons move fast', 'equal to the drift current', 'negative'], 0,
        [null, 'Fast random motion with no gradient carries equal numbers each way.', 'There is no field, so no drift either.', 'It is zero.'],
        md`Diffusion current is proportional to the gradient.`),
      RF(md`
        ### Spreading goes as $\sqrt t$

        Release a puff of carriers at one point and it spreads into a bell curve whose width grows as $\sqrt{Dt}$. To spread twice as far takes **four times as long**. That is the signature of a random walk: after $N$ random steps you are typically $\sqrt N$ steps from the start, not $N$.

        [[fig:spread]]

        That is why the diffusion length in Topic 12 is $L = \sqrt{D\tau}$: the distance a carrier random-walks during its lifetime. For Si electrons, $D_n = 35\,\text{cm}^2/\text{s}$: in 1 ns they spread about $\sqrt{35\times10^{-9}} = 2\,\mu$m, and in $1\,\mu$s about $60\,\mu$m.
      `, { spread: { svg: spreadFig(), cap: 'A puff of carriers at times $t$, $4t$, $16t$: each fourfold wait only doubles the width.' } }),
      Q(md`Carriers diffuse $5\,\mu$m in 10 ns. How long do they need to diffuse $10\,\mu$m?`,
        ['40 ns', '20 ns', '10 ns', '100 ns'], 0,
        [null, 'Distance grows as $\\sqrt t$, not $t$.', 'Farther takes longer.', '$(10/5)^2 = 4$, not 10.'],
        md`$x \propto \sqrt{Dt}$: double the distance, four times the time.`),
      R(md`
        ### Signs: particle flow versus current

        - **Electrons** diffuse down their gradient. If $dn/dx > 0$ (more on the right), they flow left; their charge is negative, so the current points right:
        $$J_{n,\text{diff}} = +qD_n\frac{dn}{dx}$$
        - **Holes** diffuse down their gradient and carry $+q$, so the current points down the gradient too:
        $$J_{p,\text{diff}} = -qD_p\frac{dp}{dx}$$

        Each carrier's total current is its drift plus its diffusion:
        $$J_n = q\mu_nn\mathscr{E} + qD_n\frac{dn}{dx}, \qquad J_p = q\mu_pp\mathscr{E} - qD_p\frac{dp}{dx}$$
      `),
      Q(md`Electron concentration increases to the right ($dn/dx > 0$), with no field. The electron current points…`,
        ['right ($+x$)', 'left', 'nowhere', 'up the band diagram'], 0,
        [null, 'Electrons flow left, down the gradient, but they carry negative charge.', 'There is a gradient, so there is a current.', 'Direction in space is $x$.'],
        md`$J_n = +qD_n\,dn/dx > 0$.`),
      R(md`
        ### The Einstein relation: why $D$ and $\mu$ are tied together

        Mobility measures how much a force biases the random walk; $D$ measures how fast the random walk spreads. Both come from the same free flights between collisions (longer flights make both larger), so their ratio shouldn't depend on the scattering details. It doesn't:
        $$\frac{D}{\mu} = \frac{kT}{q}$$
        Why $kT$? Put carriers in a field with no current. The field pushes them one way, so they pile up, and the pile diffuses back. In equilibrium the concentration follows the Boltzmann factor, $n \propto e^{-(\text{potential energy})/kT}$, and drift balances diffusion at every field strength only if $D/\mu = kT/q$. Thermal energy drives the random walk: hotter carriers spread faster at the same mobility.

        At 300 K, $D = 0.0259\,\mu$: in Si, $D_n = 35$ and $D_p = 12.4\,\text{cm}^2/\text{s}$.
      `),
      Q(md`Two samples have the same mobility, but one is at 600 K and the other at 300 K. The hot one's $D$ is…`,
        ['twice as large', 'the same', 'half', 'four times as large'], 0,
        [null, '$D = \\mu kT/q$ depends on $T$.', 'Hotter means more vigorous random motion.', 'Linear in $T$ at fixed $\\mu$.'],
        md`$D \propto T$ at fixed $\mu$.`),
      R(md`
        ### Built-in fields in nonuniform doping

        Let $N_d(x)$ fall to the right. Electrons diffuse right, toward lower concentration. Each one that leaves uncovers a positive donor behind it and adds negative charge ahead: a field pointing **right** (from $+$ to $-$), which pushes electrons back to the left. In equilibrium electron drift exactly cancels electron diffusion:
        $$q\mu_nn\mathscr{E} + qD_n\frac{dn}{dx} = 0 \quad\Longrightarrow\quad \mathscr{E} = -\frac{kT}{q}\,\frac1n\frac{dn}{dx}$$
        Only a tiny charge imbalance is needed, so $n \approx N_d(x)$ still holds very closely (**quasi-neutrality**). For $N_d \propto e^{-x/L}$ the field is constant, $\mathscr{E} = kT/qL$.

        On the band diagram, $E_F$ is flat and $E_c - E_F$ grows where the doping is lower, so $E_c$ rises to the right, which is a field pointing right. A graded base in a bipolar transistor uses such a field to speed minority carriers across; a "back-surface field" in a solar cell pushes carriers away from the back contact.
      `),
      Q(md`p-type doping falls to the right ($N_a$ decreasing with $x$). At equilibrium the built-in field points…`,
        ['left ($-x$)', 'right ($+x$)', 'nowhere', 'up'], 0,
        [null, 'Holes diffuse right, uncovering negative acceptors on the left: the field runs from the right (+) to the left (−).', 'A gradient in doping always makes a field.', 'Along $x$.'],
        md`$\mathscr{E} = +\dfrac{kT}{q}\dfrac1p\dfrac{dp}{dx} < 0$: it pushes holes back to the left, against their diffusion.`),
    ],
    qs: [
      Q(md`Hole concentration increases to the right ($dp/dx > 0$), no field. The hole diffusion current points…`,
        ['left ($-x$)', 'right', 'nowhere', 'it depends on $\\mu_p$'], 0,
        [null, 'Holes flow down their gradient, to the left, carrying $+q$.', 'There is a gradient.', 'The direction doesn’t depend on $\\mu$.'],
        md`$J_p = -qD_p\,dp/dx < 0$.`),
      Q(md`In Si, $D_n/D_p$ equals…`,
        ['$\\mu_n/\\mu_p \\approx 2.8$', '1, by the Einstein relation', '$kT/q \\approx 0.026$', '$\\mu_p/\\mu_n \\approx 0.36$'], 0,
        [null, 'Electrons diffuse faster.', 'That is $D/\\mu$.', 'Inverted.'],
        md`Same $kT/q$ for both, so the ratio is the mobility ratio.`),
      P({
        q: md`Find $D_n$ for $\mu_n = 1350\,\text{cm}^2/\text{V·s}$ at 300 K.`,
        parts: [{ lbl: md`D_n`, ans: 34.97, unit: 'cm^2/s' }],
        sol: md`$D_n = (kT/q)\mu_n = 0.0259\times1350 = 35.0\,\text{cm}^2/\text{s}$.`,
      }),
      P({
        q: md`n-type Si is doped $N_d = N_0e^{-x/L}$ with $L = 1\,\mu$m. Find the built-in field.`,
        parts: [{ lbl: md`\mathscr{E}`, ans: 259, unit: 'V/cm' }],
        sol: md`$\mathscr{E} = \dfrac{kT}{qL} = \dfrac{0.0259}{10^{-4}} = 259$ V/cm, pointing toward lower doping ($+x$).`,
      }),
      Q(md`In a graded-doping sample at equilibrium, the electron drift and diffusion currents are…`,
        ['equal and opposite, each nonzero', 'both zero, by equilibrium', 'both in the same direction', 'only drift: no gradient'], 0,
        [null, 'There is a gradient (diffusion) and a field (drift).', 'Then the total would not be zero.', 'Diffusion is present because the doping varies.'],
        md`$J_n = 0$ as a sum; each component is $\sim qD_nn/L$.`),
      Q(md`In graded n-type material, the built-in field needs only a tiny charge imbalance, so…`,
        ['$n \\approx N_d(x)$ still holds', 'the material is strongly charged', '$n = 0$ in the graded region', '$n = n_i$ throughout'], 0,
        [null, 'A tiny imbalance makes a sizeable field.', 'Electrons are still there.', 'Doping still sets $n$.'],
        md`Fields of hundreds of V/cm need net charge densities many orders below $N_d$.`),
      Q(md`Does a carrier need a force acting on it to diffuse?`,
        ['no: random motion plus a gradient', 'yes: the gradient pushes it along', 'yes: an electric field is needed', 'only holes need a force'], 0,
        [null, 'A gradient is not a force on any single carrier.', 'Diffusion happens with no field at all.', 'Same for both.'],
        md`Each carrier walks randomly; the net flow is statistics.`),
      P({
        q: md`How long do holes ($D_p = 12.4\,\text{cm}^2/\text{s}$) take to diffuse about $10\,\mu$m (use $x = \sqrt{Dt}$)?`,
        parts: [{ lbl: md`t`, ans: 80.65, unit: 'ns' }],
        sol: md`$t = x^2/D = (10^{-3})^2/12.4 = 8.1\times10^{-8}$ s $= 81$ ns.`,
      }),
      Q(md`Light absorbed at the left surface makes electron–hole pairs that diffuse to the right together. Their diffusion currents…`,
        ['opposite directions, partly cancelling', 'the same direction, adding up', 'both zero, since they move together', 'both toward the surface'], 0,
        [null, 'Same particle flow direction, opposite charges.', 'There are gradients.', 'Electrons moving right give current to the left; holes moving right give current to the right.'],
        md`Same direction of motion, opposite charges: opposite currents. They don't cancel exactly, because electrons diffuse faster ($D_n > D_p$).`),
      Q(md`Which diffuses faster in Si: electrons or holes?`,
        ['electrons', 'holes', 'equal', 'neither diffuses'], 0,
        [null, 'Holes have lower mobility, hence lower $D$.', '$D_n = 35$ versus $D_p = 12.4$.', 'Both diffuse.'],
        md`$D \propto \mu$ at fixed $T$.`),
      Q(md`Two graded samples: in A the doping halves every $1\,\mu$m; in B every $10\,\mu$m. Which has the stronger built-in field?`,
        ['A, ten times stronger', 'B, ten times stronger', 'equal: both halve', 'neither has a field'], 0,
        [null, 'A gentler gradient makes a weaker field.', '$\\mathscr{E} \\propto (1/n)\\,dn/dx$.', 'Both are graded.'],
        md`The field depends on the logarithmic slope of the doping: ten times steeper, ten times the field.`),
    ],
  };

  WHY['t12-continuity'] = {
    build: [
      R(md`
        ### Start here: bookkeeping for a thin slice

        Take a thin slice of a bar. The number of holes in it can change in only four ways: holes flow in, holes flow out, holes are generated, holes recombine. Per unit volume:
        $$\frac{\partial p}{\partial t} = -\frac1q\frac{\partial J_p}{\partial x} + g - \frac{\delta p}{\tau_p}$$
        The first term says: if more hole current leaves the slice than enters it, the slice loses holes. That is the **continuity equation**, nothing more than counting.

        With no field, $J_p = -qD_p\,\partial p/\partial x$, which gives the **diffusion equation**:
        $$\frac{\partial\,\delta p}{\partial t} = D_p\frac{\partial^2\delta p}{\partial x^2} - \frac{\delta p}{\tau_p}$$
        Read $\partial^2\delta p/\partial x^2$ as **curvature**. A peak (curving down) loses carriers and a valley (curving up) gains them: diffusion moves carriers from bumps into dips and flattens the profile.
      `),
      Q(md`At some point the hole profile has a sharp peak, with no field and no generation. Right at the peak, diffusion makes $\delta p$…`,
        ['fall: carriers spread out', 'rise: carriers gather', 'stay fixed (steady)', 'oscillate about the peak'], 0,
        [null, 'Negative curvature means a net outflow.', 'Only a dip fills in.', 'Recombination and diffusion both lower it.'],
        md`At a maximum $\partial^2\delta p/\partial x^2 < 0$: net outflow.`),
      R(md`
        ### Steady injection into a long bar

        Hold $\delta p = \Delta p$ at $x = 0$: light absorbed at the surface, or a junction injecting holes. The holes diffuse inward and recombine on the way. In **steady state** nothing changes in time at any point, even though holes keep moving: at each $x$, the net diffusion inflow exactly equals the recombination,
        $$D_p\frac{d^2\delta p}{dx^2} = \frac{\delta p}{\tau_p} \quad\Longrightarrow\quad \delta p(x) = \Delta p\,e^{-x/L_p}, \qquad L_p = \sqrt{D_p\tau_p}$$
        - **Why exponential**: each slice loses the same fraction of the holes that reach it.
        - **Why $\sqrt{D\tau}$**: a hole random-walks for about $\tau$ before recombining and covers about $\sqrt{D\tau}$ (Topic 11).

        With $D_p = 12.4\,\text{cm}^2/\text{s}$ and $\tau_p = 1\,\mu$s, $L_p = 35\,\mu$m. Each hole collides millions of times along the way.
      `),
      Q(md`The lifetime is made 4 times longer. The diffusion length…`,
        ['doubles', 'quadruples', 'is unchanged', 'halves'], 0,
        [null, '$L = \\sqrt{D\\tau}$.', 'It depends on $\\tau$.', 'Longer life, farther travel.'],
        md`$\sqrt4 = 2$: the random-walk square root again.`),
      RF(md`
        ### Where does the current go?

        The hole current $J_p(x) = -qD_p\,\dfrac{d\delta p}{dx} = \dfrac{qD_p\Delta p}{L_p}e^{-x/L_p}$ dies away with depth, like the holes themselves.

        But in steady state the **total** current must be the same at every $x$; otherwise charge would pile up somewhere. So as the hole current dies, the **electron** current grows to replace it: electrons flow in from the far contact to meet the injected holes and recombine with them. Deep in the bar the current is carried entirely by majority electrons, by drift in a tiny field.

        [[fig:conv]]

        The injected current has a second meaning. The bar stores excess holes $Q_p = qA\Delta p\,L_p$ (the area under the exponential), and they recombine at the rate $Q_p/\tau_p$. To hold the steady state you must inject exactly that:
        $$I_p(0) = \frac{Q_p}{\tau_p} = \frac{qA\Delta p\,L_p}{\tau_p} = \frac{qAD_p\Delta p}{L_p} \qquad (L_p^2 = D_p\tau_p)$$
        Two views of the same number. This **charge-control** view is how diodes and transistors are analyzed later.
      `, { conv: { svg: convFig(), cap: 'Steady hole injection at $x = 0$: the hole current dies over $L_p$, the electron current takes over, the total stays constant.' } }),
      Q(md`Holes are injected steadily into a long n-type bar. Deep inside ($x \gg L_p$), the current is carried by…`,
        ['majority electrons (by drift)', 'holes that diffuse that far', 'nothing: the current dies out', 'the donor ions drifting'], 0,
        [null, 'The excess holes are gone by then.', 'Total current is the same at every $x$.', 'Ions can’t move.'],
        md`Current is continuous; it converts from minority diffusion to majority drift.`),
      R(md`
        ### Short bar: no time to recombine

        If the bar is much shorter than $L_p$ and ends at a contact that removes the excess ($\delta p = 0$ at $x = W$), few holes recombine on the way. The profile is a straight line from $\Delta p$ to 0, and
        $$J_p = \frac{qD_p\Delta p}{W}$$
        is the same all along the bar. Its gradient $\Delta p/W$ is steeper than $\Delta p/L_p$, so the same injection drives more current. Narrow-base diodes and the thin base of a bipolar transistor work this way.
      `),
      Q(md`Same $\Delta p$ injected into a short bar ($W = L_p/5$, ending in a contact) and a long bar. The injected hole current is…`,
        ['about 5× larger in the short bar', 'about 5× larger in the long bar', 'equal in both', 'zero in the short bar'], 0,
        [null, 'The long bar’s gradient is gentler: $\\Delta p/L_p$.', 'Gradients differ.', 'There is a gradient.'],
        md`$\Delta p/W$ against $\Delta p/L_p$: ratio $L_p/W = 5$.`),
      R(md`
        ### A pulse: drift, spread and decay at once

        Inject a short pulse of holes at one point in n-type material with a field along the bar. Three things happen together: the pulse **drifts** at $v = \mu_p\mathscr{E}$, **spreads** into a bell curve of width about $\sqrt{2D_pt}$, and its area **shrinks** as $e^{-t/\tau_p}$. A probe downstream measures $\mu$ from the arrival time, $D$ from the width and $\tau$ from the area. This is the Haynes–Shockley experiment, which confirmed the Einstein relation.
      `),
      Q(md`In the drifting-pulse experiment, the pulse's **arrival time** at the probe mainly measures…`,
        ['the mobility', 'the diffusion coefficient', 'the lifetime', 'the band gap'], 0,
        [null, 'That comes from the width.', 'That comes from the shrinking area.', 'Unrelated.'],
        md`$t = d/(\mu\mathscr{E})$.`),
    ],
    qs: [
      Q(md`$D_p$ is doubled (same $\tau_p$). The diffusion length…`,
        ['grows by $\\sqrt2$', 'doubles', 'halves', 'is unchanged'], 0,
        [null, 'Square root.', 'Faster diffusion goes farther.', 'It depends on $D$.'],
        md`$L = \sqrt{D\tau}$.`),
      P({
        q: md`Steady injection into a long bar: what fraction of the surface excess is left at $x = 2L_p$?`,
        parts: [{ lbl: md`\delta p/\Delta p`, ans: 0.1353 }],
        sol: md`$e^{-2} = 0.135$.`,
      }),
      Q(md`The injected excess $\Delta p$ is doubled in a long bar. The injected current…`,
        ['doubles', 'is unchanged', 'grows by $\\sqrt2$', 'quadruples'], 0,
        [null, 'A steeper profile drives more current.', 'The profile shape is the same; its height doubles.', 'The equation is linear.'],
        md`$J_p(0) = qD_p\Delta p/L_p$ is linear in $\Delta p$.`),
      P({
        q: md`Find $L_p$ for $D_p = 12\,\text{cm}^2/\text{s}$ and $\tau_p = 2\,\mu$s.`,
        parts: [{ lbl: md`L_p`, ans: 48.99, unit: 'μm' }],
        sol: md`$L_p = \sqrt{12\times2\times10^{-6}} = 4.90\times10^{-3}$ cm $= 49\,\mu$m.`,
      }),
      Q(md`"Steady state" ($\partial p/\partial t = 0$) means…`,
        ['a frozen profile, not frozen holes', 'the holes have stopped moving', 'there is no current anywhere', 'the sample is in equilibrium'], 0,
        [null, 'Flows continue; they just balance at each point.', 'A steady current flows.', 'It is far from equilibrium: $np > n_i^2$.'],
        md`Inflow and recombination balance at every $x$.`),
      Q(md`A sample is doped more heavily (direct recombination, same mobility). Its minority diffusion length…`,
        ['shrinks: the lifetime falls', 'grows: more carriers diffuse', 'is unchanged: same mobility', 'becomes infinite'], 0,
        [null, 'More majority carriers shorten the minority lifetime.', '$L$ depends on $\\tau$.', 'No.'],
        md`$\tau \propto 1/N$, so $L \propto 1/\sqrt N$.`),
      P({
        q: md`A long bar with $A = 10^{-4}\,\text{cm}^2$ has $\Delta p = 10^{15}\,\text{cm}^{-3}$ held at its end, $L_p = 20\,\mu$m, $\tau_p = 1\,\mu$s. Find the injected current from the stored charge.`,
        parts: [{ lbl: md`I_p`, ans: 32, unit: 'μA' }],
        sol: md`$Q_p = qA\Delta pL_p = (1.6\times10^{-19})(10^{-4})(10^{15})(2\times10^{-3}) = 3.2\times10^{-11}$ C; $I = Q_p/\tau_p = 3.2\times10^{-5}$ A $= 32\,\mu$A.`,
      }),
      Q(md`What fraction of the injected hole current is still carried by holes at $x = L_p$ in a long bar?`,
        ['about 37%', 'about 63%', '100%', '0%'], 0,
        [null, 'That fraction has already converted to electron current.', 'Holes recombine along the way.', 'Not yet.'],
        md`$J_p \propto e^{-x/L_p}$: $e^{-1} = 0.37$. Electrons carry the other 63%.`),
      Q(md`In a short bar (much shorter than $L_p$, ending in a contact), the excess hole profile is…`,
        ['a straight line to zero', 'an exponential decay', 'flat at $\\Delta p$', 'a bell curve'], 0,
        [null, 'Only when recombination matters along the way.', 'The far contact holds it at zero.', 'That is a pulse.'],
        md`With negligible recombination, $d^2\delta p/dx^2 = 0$: a straight line.`),
      Q(md`In a drifting-pulse experiment, the pulse twice as far downstream is…`,
        ['wider by $\\sqrt2$, with less area', 'the same width, less area', 'twice as wide, same area', 'narrower, as it drifts'], 0,
        [null, 'Diffusion keeps spreading it.', 'Width grows as $\\sqrt t$, not $t$.', 'It only spreads.'],
        md`Twice the distance at constant drift speed is twice the time: width $\propto \sqrt t$.`),
      Q(md`Where does the energy of recombining holes go in an indirect-gap Si bar?`,
        ['mostly heat, via recombination centers', 'light at 1.1 μm, like an LED', 'the contacts, as current', 'nowhere: energy disappears'], 0,
        [null, 'Si emits very little light.', 'It is lost locally, not delivered.', 'Energy is conserved.'],
        md`Trap-assisted recombination releases the energy as phonons.`),
    ],
  };
})();

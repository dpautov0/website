/* Ch. 4, first half — light in, excess carriers, recombination, quasi-Fermi levels (Streetman & Banerjee 4.1, 4.3.1,
   4.3.3–4.3.4). Topics 8–10. Registers the 'ch4' unit; ch4b.js adds Topics 11–12. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;

  // absorption, thermalization and recombination on one band diagram
  function absorbFig() {
    const f = PF.fig({ alt: 'absorption of a photon above the gap' });
    const x0 = 30, x1 = 290, yc = 90, yv = 170;
    f.add(`<path class="shade nodecl" d="M${x0},${yc}H${x1}V30H${x0}Z"/><path class="shade nodecl" d="M${x0},${yv}H${x1}V200H${x0}Z"/>`);
    f.line(x0, yc, x1, yc, { cls: 'curve' }); f.line(x0, yv, x1, yv, { cls: 'curve' });
    f.label(x1 + 6, yc, 'E_c', 'l'); f.label(x1 + 6, yv, 'E_v', 'l');
    // absorption: hν > Eg lifts an electron high into the band
    f.arrow(90, yv - 2, 90, 46, { cls: 'thick', hs: 7 }); f.dot(90, 44, 3.2); f.circle(90, yv + 6, 3, { cls: 'bgfill' });
    f.label(84, 120, 'h\\nu > E_g', 'r');
    // thermalization: steps down to Ec
    f.pl([[94, 46], [110, 46], [110, 58], [126, 58], [126, 70], [142, 70], [142, 84]], { cls: 'dash', arrow: 'end', hs: 5 });
    f.text(150, 52, 'heat to the lattice', 'l');
    // recombination at the gap energy
    f.arrow(230, yc + 2, 230, yv - 4, { cls: 'thick', hs: 7 }); f.dot(230, yc - 4, 3.2);
    f.label(238, (yc + yv) / 2, 'h\\nu = E_g', 'l');
    return f.svg();
  }

  const decayFig = BD.prof({
    x: [0, 4], y: [0, 1.1], xl: 't', yl: '\\delta n/\\Delta n',
    xt: [[1, '\\tau'], [2, '2\\tau'], [3, '3\\tau']], yt: [[1, '1'], [Math.exp(-1), 'e^{-1}']],
    curves: [{ f: (t) => Math.exp(-t), lab: '\\text{low level}', labAt: 2.4, dy: -14 }, { f: (t) => 1 / (1 + 3 * t), cls: 'dash', lab: '\\text{high level}', labAt: 3.1, dy: -10 }],
  });

  const dark = BD.diagram({ w: 150, h: 140, E: [-0.1, 1.25], Ec: 1.11, Ev: 0, Ei: 0.555, EF: 0.853, axis: false });
  const lit = BD.diagram({ w: 150, h: 140, E: [-0.1, 1.25], Ec: 1.11, Ev: 0, Ei: 0.555, Fn: 0.854, Fp: 0.358, axis: false, dims: [{ x: 0.25, a: 'Ei', b: 'Fp', tex: '0.197\\,\\text{eV}', at: 'r' }] });

  C.unit({
    id: 'ch4', exam: 'e1', num: 'Ch. 4', title: 'Excess carriers in semiconductors',
    lessons: [
      // ======================================================================== Topic 8
      {
        id: 't8-optical', topic: 8, sec: '4.1', title: 'Optical absorption',
        steps: [
          RF(md`
            ### The idea

            A photon can break a bond and make an electron–hole pair only if it brings at least the gap energy:
            $$h\nu \ge E_g \qquad E\,[\text{eV}] = \frac{1.24}{\lambda\,[\mu\text{m}]}$$
            Below the gap the material is **transparent** (Si is transparent beyond 1.12 μm, so Si detectors are blind to the 1.3–1.55 μm fiber-optic bands). Above it, light is absorbed; any energy beyond $E_g$ goes to the electron (or hole) as kinetic energy and is handed to the lattice as **heat** within picoseconds (thermalization). The pair then lives on near the band edges until it recombines, which in a direct-gap material can emit a photon of energy $\approx E_g$.

            [[fig:abs]]

            ### How deep the light gets

            Each thin slice absorbs the same fraction of what reaches it, so the intensity decays exponentially:

            $$I(x) = I_0\,e^{-\alpha x}$$

            - $I_0$: intensity (or power) entering, W/cm² or W
            - $\alpha$: **absorption coefficient**, $\text{cm}^{-1}$; rises steeply as $h\nu$ climbs above $E_g$
            - $x$: depth, cm. $1/\alpha$ is the depth where $I$ falls to $1/e$.

            [[fig:slab]]

            Through a slab of thickness $d$ (ignoring reflection): transmitted $I_t = I_0e^{-\alpha d}$, absorbed $I_0\left(1 - e^{-\alpha d}\right)$. Of the absorbed power, the fraction $\dfrac{h\nu - E_g}{h\nu}$ becomes heat right away. The number of photons per second in a beam of power $P$ is $P/h\nu$ (with $h\nu$ in joules).
          `, { abs: { svg: absorbFig(), cap: 'A photon above the gap creates a pair; the electron loses its excess energy as heat, then recombines across the gap.' }, slab: { svg: BD.slab({}), cap: 'Intensity inside a slab of thickness d.' } }),
          R(md`
            ### Worked example

            !!graded Problem
              A $0.50\,\mu$m-thick GaAs sample ($E_g = 1.43$ eV) is lit by $10$ mW of monochromatic light with $h\nu = 2.00$ eV, where $\alpha = 3.0\times10^4\,\text{cm}^{-1}$. Ignore reflection. Find (a) the wavelength, (b) the power absorbed, (c) the power converted to heat by thermalization, (d) the number of photons per second emitted by recombination, if every absorbed photon gives one photon at $E_g$.

            **1. Diagram / governing equations.** The absorption picture above, and
            $$\lambda = \frac{1.24}{h\nu}, \qquad P_{\text{abs}} = P_0\left(1 - e^{-\alpha d}\right), \qquad P_{\text{heat}} = P_{\text{abs}}\frac{h\nu - E_g}{h\nu}, \qquad \dot N = \frac{P_{\text{abs}}}{h\nu}$$

            **2. Units.** $d = 0.50\,\mu\text{m} = 0.50\times10^{-4}$ cm, so $\alpha d = \left(3.0\times10^4\,\text{cm}^{-1}\right)\left(0.50\times10^{-4}\,\text{cm}\right) = 1.5$.

            **3. Substitute, with units.**
            $$\lambda = \frac{1.24\,\mu\text{m·eV}}{2.00\,\text{eV}}, \qquad P_{\text{abs}} = (10\,\text{mW})\left(1 - e^{-1.5}\right) = (10\,\text{mW})(0.777)$$
            $$P_{\text{heat}} = (7.77\,\text{mW})\frac{2.00\,\text{eV} - 1.43\,\text{eV}}{2.00\,\text{eV}}, \qquad \dot N = \frac{7.77\times10^{-3}\,\text{J/s}}{(2.00\,\text{eV})\left(1.6\times10^{-19}\,\text{J/eV}\right)}$$

            **4. Answers.** (a) $\lambda = 0.620\,\mu$m; (b) $P_{\text{abs}} = 7.77$ mW; (c) $P_{\text{heat}} = 2.21$ mW; (d) $\dot N = 2.43\times10^{16}$ photons/s (carrying $5.55$ mW at $1.43$ eV).

            !!mistake Common mistakes
              - Thickness in μm with $\alpha$ in $\text{cm}^{-1}$: convert, $1\,\mu\text{m} = 10^{-4}$ cm.
              - Using $e^{-\alpha d}$ as the **absorbed** fraction: that is what gets **through**. Absorbed is $1 - e^{-\alpha d}$.
              - Photons per second with $h\nu$ in eV: multiply by $1.6\times10^{-19}$ J/eV first.
              - Thinking light below the gap creates pairs (it doesn't, in an ideal crystal), or that light far above the gap makes more pairs per photon (one pair per photon; the rest is heat).
              - Using $E = 1.24/\lambda$ with $\lambda$ in nm (then it is $1240/\lambda$).

            ### Check questions
          `),
          P({
            title: 'Cutoff wavelength of Si',
            q: md`What is the longest wavelength silicon ($E_g = 1.11$ eV) can absorb to create electron–hole pairs?`,
            parts: [{ lbl: md`\lambda_{\max}`, ans: 1.117, unit: 'μm' }],
            hints: [md`$\lambda = 1.24/E_g$ (μm, eV).`],
            sol: md`$$\lambda_{\max} = \frac{1.24\,\mu\text{m·eV}}{1.11\,\text{eV}} = 1.12\,\mu\text{m}$$ Longer wavelengths pass through.`,
          }),
          P({
            title: 'Thickness for 90% absorption',
            q: md`At some wavelength a semiconductor has $\alpha = 1.0\times10^4\,\text{cm}^{-1}$. How thick must a layer be to absorb 90% of the light entering it (no reflection)? Answer in μm.`,
            parts: [{ lbl: md`d`, ans: 2.303, unit: 'μm' }],
            hints: [md`90% absorbed means $e^{-\alpha d} = 0.10$.`],
            sol: md`$$e^{-\alpha d} = 0.10 \Rightarrow d = \frac{\ln 10}{\alpha} = \frac{2.303}{1.0\times10^4\,\text{cm}^{-1}} = 2.30\times10^{-4}\,\text{cm} = 2.30\,\mu\text{m}$$`,
          }),
          P({
            title: 'Transmission',
            q: md`Light enters a $1.0\,\mu$m-thick layer with $\alpha = 5.0\times10^3\,\text{cm}^{-1}$. What fraction comes out the back (no reflection)?`,
            parts: [{ lbl: md`I_t/I_0`, ans: 0.6065 }],
            hints: [md`$\alpha d = (5.0\times10^3\,\text{cm}^{-1})(1.0\times10^{-4}\,\text{cm})$.`],
            sol: md`$$\frac{I_t}{I_0} = e^{-\alpha d} = e^{-0.50} = 0.607$$`,
          }),
          Q(md`Why can a silicon wafer look opaque in visible light yet transmit 1.55 μm infrared?`,
            ['1.55 μm photons (0.80 eV) are below Si\'s 1.11 eV gap, so they can\'t create pairs', 'Infrared photons are faster', 'Si is indirect, so it never absorbs', 'Visible light is reflected, not absorbed'], 0,
            [null, 'All photons travel at the same speed in vacuum; in Si the issue is energy.', 'Si absorbs visible light strongly; indirectness only weakens absorption near the gap.', 'Some is reflected, but most visible light is absorbed.'],
            md`$h\nu = 1.24/1.55 = 0.80\,\text{eV} < E_g$: transparent.`),
        ],
        bank: [
          Q(md`A photon with $h\nu = 2E_g$ is absorbed. How many electron–hole pairs does it make (ordinary semiconductor)?`, ['1', '2', '½', '0'], 0,
            [null, 'The extra energy goes to heat, not a second pair.', 'Pairs are whole.', 'It is above the gap.'], md`One pair; $E_g$ of excess becomes heat.`),
            Q(md`$1/\alpha$ is…`, ['the depth where the light falls to $1/e$ of its entering value', 'the wavelength', 'the sample thickness', 'the depth where all light is absorbed'], 0,
            [null, 'Different quantity.', 'No.', 'Exponential decay never reaches zero.'], md`$I(1/\alpha) = I_0e^{-1}$.`),
          Q(md`As photon energy rises above $E_g$, $\alpha$…`, ['rises steeply', 'falls', 'stays constant', 'becomes negative'], 0,
            [null, 'More states are available to absorb into.', 'No.', 'No.'], md`Absorption grows rapidly above the edge.`),
          Q(md`What is $E$ for $\lambda = 620$ nm?`, ['2.0 eV', '0.62 eV', '1.24 eV', '20 eV'], 0,
            [null, 'Wrong units: 620 nm = 0.620 μm.', 'That is 1 μm.', 'Off by 10.'], md`$1.24/0.620 = 2.0$ eV.`),
          Q(md`In the worked example, why is the heat fraction $(h\nu - E_g)/h\nu$?`, ['The pair keeps only $E_g$; the excess thermalizes', 'All absorbed energy becomes heat', 'Only reflected light heats', 'Because $\\alpha$ is large'], 0,
            [null, 'The $E_g$ part can come back out as light.', 'No.', 'Unrelated.'], md`Excess above the gap is lost to phonons.`),
        ],
      },

      // ======================================================================== Topic 9
      {
        id: 't9-recomb', topic: 9, sec: '4.3.1', title: 'Direct recombination, lifetime, low- and high-level injection',
        steps: [
          R(md`
            ### The idea

            Light (or anything else) can push the carrier populations above equilibrium: $n = n_0 + \delta n$, $p = p_0 + \delta p$. The extra carriers are **excess carriers**; light makes them in pairs, so $\delta n = \delta p$. Turn the source off and they disappear by **recombination**: an electron drops into a hole.

            In **direct** recombination the rate is proportional to how many electrons and holes there are to meet:
            $$\text{recombination rate} = \alpha_r\,n\,p$$
            - $\alpha_r$: recombination coefficient, cm³/s (a material constant; large for direct-gap GaAs, tiny for Si)

            At equilibrium thermal generation balances it exactly: $g(T) = \alpha_r n_0p_0 = \alpha_r n_i^2$. After a pulse, generation stays at $g(T)$ and the excess decays:
            $$\frac{d\,\delta n}{dt} = \alpha_rn_i^2 - \alpha_r(n_0 + \delta n)(p_0 + \delta p) = -\alpha_r\left(n_0 + p_0\right)\delta n - \alpha_r\,\delta n^2$$
          `),
          RF(md`
            ### Two limits

            **Low-level injection** ($\delta n \ll n_0 + p_0$, the usual case): drop the $\delta n^2$ term.
            $$\delta n(t) = \Delta n\,e^{-t/\tau_n}, \qquad \tau_n = \frac{1}{\alpha_r\left(n_0 + p_0\right)}$$
            - $\Delta n$: excess at $t = 0$, $\text{cm}^{-3}$
            - $\tau_n$: **recombination lifetime**, s; in p-type material $p_0 \gg n_0$, so $\tau_n = \dfrac{1}{\alpha_rp_0}$: the **minority** carrier's lifetime is set by the **majority** concentration (more partners to recombine with ⇒ shorter life). Likewise $\tau_p = 1/(\alpha_r n_0)$ in n-type.

            **High-level injection** ($\delta n \gg n_0 + p_0$): now $\delta n^2$ dominates.
            $$\frac{d\,\delta n}{dt} = -\alpha_r\,\delta n^2 \quad\Longrightarrow\quad \delta n(t) = \frac{\Delta n}{1 + \alpha_r\Delta n\,t}$$
            Not exponential: fast at first, then a long $1/t$ tail, and it halves at $t = 1/(\alpha_r\Delta n)$. As it decays it eventually reaches low level and turns exponential.

            [[fig:decay]]

            (The exact solution of the full equation, with $N = n_0 + p_0$ and $\tau = 1/\alpha_rN$, is $\delta n(t) = \dfrac{N\Delta n\,e^{-t/\tau}}{N + \Delta n\left(1 - e^{-t/\tau}\right)}$; it reduces to each limit.)
          `, { decay: { svg: decayFig, cap: 'Decay after a pulse: exponential at low level (solid), much faster at first and then a slow tail at high level (dashed).' } }),
          R(md`
            ### Worked example

            !!graded Problem
              p-type GaAs with $N_a = 1.0\times10^{17}\,\text{cm}^{-3}$ and $\alpha_r = 7.2\times10^{-10}\,\text{cm}^3/\text{s}$ is hit by a short light pulse that creates $\Delta n = 1.0\times10^{14}\,\text{cm}^{-3}$ uniformly. Find (a) the electron lifetime, (b) $\delta n$ 20 ns later, (c) the time for $\delta n$ to fall to $1.0\times10^{12}\,\text{cm}^{-3}$.

            **1. Governing equations.** Check the level: $\Delta n = 10^{14} \ll p_0 = 10^{17}$ ⇒ low-level, exponential.
            $$\tau_n = \frac{1}{\alpha_rp_0}, \qquad \delta n(t) = \Delta n\,e^{-t/\tau_n}, \qquad t = \tau_n\ln\frac{\Delta n}{\delta n}$$

            **2–3. Substitute, with units.**
            $$\tau_n = \frac{1}{\left(7.2\times10^{-10}\,\text{cm}^3/\text{s}\right)\left(1.0\times10^{17}\,\text{cm}^{-3}\right)} = \frac{1}{7.2\times10^{7}\,\text{s}^{-1}}$$
            $$\delta n(20\,\text{ns}) = \left(1.0\times10^{14}\,\text{cm}^{-3}\right)\exp\!\left(-\frac{20\,\text{ns}}{13.9\,\text{ns}}\right), \qquad t = (13.9\,\text{ns})\ln\frac{1.0\times10^{14}\,\text{cm}^{-3}}{1.0\times10^{12}\,\text{cm}^{-3}}$$

            **4. Answers.** (a) $\tau_n = 1.39\times10^{-8}$ s $= 13.9$ ns; (b) $\delta n = 2.37\times10^{13}\,\text{cm}^{-3}$; (c) $t = 64.0$ ns.

            !!mistake Common mistakes
              - Using the minority concentration in $\tau$: in p-type $\tau_n = 1/(\alpha_r p_0)$ with the **majority** $p_0$, not $n_0$.
              - Applying $e^{-t/\tau}$ at high-level injection. Check $\Delta n$ against $n_0 + p_0$ first.
              - Writing the total $n(t)$ as decaying to zero: it decays to $n_0$; only the **excess** decays away.
              - $\log_{10}$ instead of $\ln$ when solving for time.
              - In high-level injection with $\delta n = \delta p$, both carriers decay together and the "lifetime" is not a constant.

            ### Check questions
          `),
          P({
            title: 'Hole lifetime in n-type GaAs',
            q: md`n-type GaAs, $N_d = 5.0\times10^{16}\,\text{cm}^{-3}$, $\alpha_r = 7.2\times10^{-10}\,\text{cm}^3/\text{s}$. Find the minority-carrier (hole) lifetime for low-level injection, in ns.`,
            parts: [{ lbl: md`\tau_p`, ans: 27.78, unit: 'ns' }],
            hints: [md`$\tau_p = 1/(\alpha_r n_0)$ with $n_0 = N_d$.`],
            sol: md`$$\tau_p = \frac{1}{\left(7.2\times10^{-10}\,\text{cm}^3/\text{s}\right)\left(5.0\times10^{16}\,\text{cm}^{-3}\right)} = 2.78\times10^{-8}\,\text{s} = 27.8\,\text{ns}$$`,
          }),
          P({
            title: 'High-level decay',
            q: md`A lightly doped sample ($n_0 + p_0$ negligible) with $\alpha_r = 1.0\times10^{-10}\,\text{cm}^3/\text{s}$ starts with $\Delta n = 1.0\times10^{17}\,\text{cm}^{-3}$. Find $\delta n$ after 100 ns.`,
            parts: [{ lbl: md`\delta n`, ans: 5e16, unit: 'cm^{-3}' }],
            hints: [md`High level: $\delta n(t) = \Delta n/(1 + \alpha_r\Delta n\,t)$.`],
            sol: md`$$\alpha_r\Delta n\,t = \left(1.0\times10^{-10}\,\tfrac{\text{cm}^3}{\text{s}}\right)\left(1.0\times10^{17}\,\text{cm}^{-3}\right)\left(1.0\times10^{-7}\,\text{s}\right) = 1.0$$ $$\delta n = \frac{1.0\times10^{17}\,\text{cm}^{-3}}{1 + 1.0} = 5.00\times10^{16}\,\text{cm}^{-3}$$`,
          }),
          Q(md`Doubling the acceptor doping of a p-type sample makes the electron lifetime (direct recombination, low level)…`,
            ['double', 'halve', 'unchanged', 'quadruple'], 1,
            ['Backwards: more holes to recombine with.', null, '$\\tau_n = 1/(\\alpha_r p_0)$ depends on $p_0$.', 'Linear, not squared.'],
            md`$\tau_n \propto 1/p_0$.`),
          Q(md`Low-level injection means…`,
            ['$\\delta n \\ll n_0 + p_0$ (essentially, much less than the majority concentration)', '$\\delta n \\ll n_i$', 'the light is dim compared with sunlight', '$\\delta n = 0$'], 0,
            [null, 'Excess can be far above $n_i$ and still low level.', 'It is about carrier numbers, not brightness.', 'Then there is nothing to inject.'],
            md`The majority concentration barely changes.`),
        ],
        bank: [
          Q(md`At equilibrium, thermal generation $g(T)$ equals…`, ['$\\alpha_r n_i^2$', '$\\alpha_r n_0$', '$n_i/\\tau$', '0'], 0,
            [null, 'Needs both carriers.', 'No.', 'Generation never stops above 0 K.'], md`$g = \alpha_r n_0p_0 = \alpha_r n_i^2$.`),
          Q(md`Why is direct recombination efficient in GaAs but weak in Si?`, ['GaAs is direct-gap: no phonon is needed', 'Si has no holes', 'GaAs has a smaller gap', 'Si electrons are heavier'], 0,
            [null, 'It does.', 'GaAs\'s gap is larger.', 'Not the reason.'], md`Si recombines mostly through defects (indirect recombination, 4.3.2).`),
          Q(md`After a pulse at low level, $\delta n$ falls to $1/e$ of its start at…`, ['$t = \\tau$', '$t = 2\\tau$', '$t = \\tau\\ln2$', 'never'], 0,
            [null, 'That gives $e^{-2}$.', 'That is the half-life.', 'Exponential reaches $1/e$ at $\\tau$.'], md`$e^{-\tau/\tau} = e^{-1}$.`),
          Q(md`High-level decay halves at…`, ['$t = 1/(\\alpha_r\\Delta n)$', '$t = \\tau\\ln2$', '$t = 2/(\\alpha_r\\Delta n)$', 'a fixed time independent of $\\Delta n$'], 0,
            [null, 'Exponential half-life, not applicable.', 'That gives a third.', 'It depends on $\\Delta n$.'], md`$1/(1 + 1) = \tfrac12$.`),
          Q(md`During low-level decay in p-type material, the hole concentration…`, ['stays essentially $p_0$', 'drops to zero', 'doubles', 'equals $n$'], 0,
            [null, 'Only the excess, tiny compared with $p_0$, goes away.', 'No.', 'No.'], md`$p = p_0 + \delta p \approx p_0$.`),
        ],
      },

      // ======================================================================== Topic 10
      {
        id: 't10-qfl', topic: 10, sec: '4.3.3–4.3.4', title: 'Steady-state generation, quasi-Fermi levels, photoconductivity',
        steps: [
          R(md`
            ### The idea

            Keep the light on. Pairs are made at a steady optical rate $g_{op}$ and destroyed by recombination; the excess grows until the two balance:
            $$g_{op} = \frac{\delta n}{\tau_n} \quad\Longrightarrow\quad \delta n = g_{op}\tau_n, \qquad \delta p = g_{op}\tau_p$$
            - $g_{op}$: optical generation rate, pairs per cm³ per s ($\text{cm}^{-3}\text{s}^{-1}$)
            - $\tau_n$, $\tau_p$: lifetimes, s (equal for direct recombination)

            The sample is no longer at equilibrium: $np > n_i^2$, so a single Fermi level can't describe both carriers. Use one for each, the **quasi-Fermi levels**, defined so the equilibrium formulas still work:
            $$n = n_i\,e^{(F_n - E_i)/kT} \qquad p = n_i\,e^{(E_i - F_p)/kT}$$
            - $F_n$, $F_p$: quasi-Fermi levels for electrons and holes, eV
            - At equilibrium $F_n = F_p = E_F$. Their split measures how far from equilibrium the sample is: $F_n - F_p = kT\ln\dfrac{np}{n_i^2}$.
          `),
          RF(md`
            ### What the picture looks like

            [[fig:qf]]

            Low-level light on n-type material: the electrons barely change ($n_0 + \delta n \approx n_0$), so $F_n$ sits essentially where $E_F$ was. The holes rise by many orders of magnitude, so $F_p$ drops far below $E_F$, toward and often past $E_i$. **The minority quasi-Fermi level is the one that moves.**

            ### Photoconductivity

            The extra carriers carry current. The conductivity rises by
            $$\Delta\sigma = q\left(\delta n\,\mu_n + \delta p\,\mu_p\right) = qg_{op}\left(\tau_n\mu_n + \tau_p\mu_p\right)$$
            and a bar biased at $V$ gains $\Delta I = \Delta\sigma\dfrac{A}{L}V$. That is how a photoconductor detects light; a long lifetime gives a big response but a slow one (it takes about $\tau$ to turn on and off).
          `, { qf: PF.row([{ svg: dark, cap: 'dark: one Fermi level' }, { svg: lit, cap: 'lit: $F_n \\approx E_F$, $F_p$ moves' }]) }),
          R(md`
            ### Worked example

            !!graded Problem
              n-type Si at 300 K ($N_d = 1.0\times10^{15}\,\text{cm}^{-3}$, $n_i = 1.0\times10^{10}\,\text{cm}^{-3}$, $\mu_n = 1350$, $\mu_p = 480\,\text{cm}^2/\text{V·s}$) is lit uniformly with $g_{op} = 1.0\times10^{19}\,\text{cm}^{-3}\text{s}^{-1}$; $\tau_n = \tau_p = 2.0\,\mu$s. Find (a) $\delta n = \delta p$, (b) $F_n - E_i$ and $E_i - F_p$, (c) $\Delta\sigma$ and compare with the dark $\sigma_0$.

            **1. Diagram and governing equations.** The lit band diagram above.
            $$\delta p = g_{op}\tau_p, \quad F_n - E_i = kT\ln\frac{n_0 + \delta n}{n_i}, \quad E_i - F_p = kT\ln\frac{p_0 + \delta p}{n_i}, \quad \Delta\sigma = q\,\delta p\left(\mu_n + \mu_p\right)$$

            **2–3. Substitute, with units.**
            $$\delta p = \left(1.0\times10^{19}\,\text{cm}^{-3}\text{s}^{-1}\right)\left(2.0\times10^{-6}\,\text{s}\right) = 2.0\times10^{13}\,\text{cm}^{-3} \;(\ll n_0\text{: low level})$$
            $$F_n - E_i = (0.0259\,\text{eV})\ln\frac{1.02\times10^{15}\,\text{cm}^{-3}}{1.0\times10^{10}\,\text{cm}^{-3}}, \qquad E_i - F_p = (0.0259\,\text{eV})\ln\frac{2.0\times10^{13}\,\text{cm}^{-3}}{1.0\times10^{10}\,\text{cm}^{-3}}$$
            ($p_0 = 10^5\,\text{cm}^{-3}$ is negligible next to $\delta p$.)
            $$\Delta\sigma = \left(1.6\times10^{-19}\,\text{C}\right)\left(2.0\times10^{13}\,\text{cm}^{-3}\right)\left(1350 + 480\right)\tfrac{\text{cm}^2}{\text{V·s}}, \qquad \sigma_0 = \left(1.6\times10^{-19}\right)\left(10^{15}\right)(1350)$$

            **4. Answers.** (a) $\delta n = \delta p = 2.00\times10^{13}\,\text{cm}^{-3}$; (b) $F_n - E_i = 0.299$ eV (dark $E_F - E_i = 0.298$ eV: it hardly moved), $E_i - F_p = 0.197$ eV (dark: $E_F$ was $0.298$ eV **above** $E_i$, so $F_p$ moved down by almost 0.5 eV); (c) $\Delta\sigma = 5.86\times10^{-3}\,(\Omega\cdot\text{cm})^{-1}$, about 2.7% of $\sigma_0 = 0.216\,(\Omega\cdot\text{cm})^{-1}$.

            !!mistake Common mistakes
              - Using $\delta p$ alone for $F_p$ when $p_0$ is not negligible (use $p_0 + \delta p$), or $\delta n$ alone for $F_n$ (it is $n_0 + \delta n$, dominated by $n_0$).
              - Expecting the majority quasi-Fermi level to move a lot under low-level light. It is the minority one.
              - Using $n_i^2/n$ for $p$ under illumination: $np = n_i^2$ is an **equilibrium** law only.
              - Leaving out the hole term in $\Delta\sigma$: light makes **pairs**; both add conductivity.
              - $g_{op}$ is per volume per time; multiply by a lifetime (s) to get $\text{cm}^{-3}$.

            ### Check questions
          `),
          P({
            title: 'Steady-state excess',
            q: md`A sample has $\tau = 1.0\,\mu$s and is lit uniformly at $g_{op} = 5.0\times10^{20}\,\text{cm}^{-3}\text{s}^{-1}$. Find the steady-state excess carrier concentration.`,
            parts: [{ lbl: md`\delta n`, ans: 5e14, unit: 'cm^{-3}' }],
            hints: [md`$\delta n = g_{op}\tau$.`],
            sol: md`$$\delta n = \left(5.0\times10^{20}\,\text{cm}^{-3}\text{s}^{-1}\right)\left(1.0\times10^{-6}\,\text{s}\right) = 5.00\times10^{14}\,\text{cm}^{-3}$$`,
          }),
          P({
            title: 'Quasi-Fermi levels in p-type Si',
            q: md`p-type Si at 300 K ($N_a = 1.0\times10^{16}\,\text{cm}^{-3}$, $n_i = 1.0\times10^{10}\,\text{cm}^{-3}$) is lit so that $\delta n = \delta p = 1.0\times10^{14}\,\text{cm}^{-3}$. Find $F_n - E_i$ and $E_i - F_p$.`,
            parts: [{ lbl: md`F_n - E_i`, ans: 0.2385, unit: 'eV', tol: { abs: 0.002 } }, { lbl: md`E_i - F_p`, ans: 0.3581, unit: 'eV', tol: { abs: 0.002 } }],
            hints: [md`$n = n_0 + \delta n \approx \delta n$ ($n_0 = 10^4$); $p = p_0 + \delta p = 1.01\times10^{16}$.`],
            sol: md`$$F_n - E_i = (0.0259\,\text{eV})\ln\frac{1.0\times10^{14}}{1.0\times10^{10}} = 0.239\,\text{eV}, \qquad E_i - F_p = (0.0259\,\text{eV})\ln\frac{1.01\times10^{16}}{1.0\times10^{10}} = 0.358\,\text{eV}$$ $F_n$ jumped from $0.358$ eV **below** $E_i$ (in the dark) to $0.239$ eV above it; $F_p$ barely moved.`,
          }),
          P({
            title: 'Photoconductivity',
            q: md`Si ($\mu_n = 1350$, $\mu_p = 480\,\text{cm}^2/\text{V·s}$) is lit at $g_{op} = 1.0\times10^{20}\,\text{cm}^{-3}\text{s}^{-1}$ with $\tau_n = \tau_p = 10\,\mu$s. Find the increase in conductivity.`,
            parts: [{ lbl: md`\Delta\sigma`, ans: 0.2928, unit: '(Ω·cm)^{-1}' }],
            hints: [md`$\Delta\sigma = qg_{op}\tau(\mu_n + \mu_p)$.`],
            sol: md`$$\Delta\sigma = \left(1.6\times10^{-19}\,\text{C}\right)\left(1.0\times10^{20}\,\text{cm}^{-3}\text{s}^{-1}\right)\left(1.0\times10^{-5}\,\text{s}\right)\left(1830\,\tfrac{\text{cm}^2}{\text{V·s}}\right) = 0.293\,(\Omega\cdot\text{cm})^{-1}$$`,
          }),
          Q(md`Under steady illumination, $np$ compared with $n_i^2$ is…`,
            ['greater', 'equal', 'smaller', 'zero'], 0,
            [null, 'Only at equilibrium.', 'Light adds carriers.', 'No.'],
            md`$np = n_i^2e^{(F_n - F_p)/kT}$ with $F_n > F_p$.`),
        ],
        bank: [
          Q(md`Under low-level illumination of n-type material, which quasi-Fermi level moves noticeably?`, ['$F_n$', '$F_p$', 'both equally', 'neither'], 1,
            ['Electrons are the majority; their relative change is tiny.', null, 'No.', 'The minority one moves a lot.'], md`Holes go from $p_0$ to $\approx\delta p$, many decades.`),
          Q(md`At equilibrium the quasi-Fermi levels…`, ['coincide with $E_F$', 'are at the band edges', 'are undefined', 'are $kT$ apart'], 0,
            [null, 'No.', 'They reduce to $E_F$.', 'No.'], md`$F_n = F_p = E_F$.`),
          Q(md`A photoconductor with longer lifetime has…`, ['larger but slower response', 'smaller but faster response', 'no change', 'negative response'], 0,
            [null, 'Backwards.', '$\\Delta\\sigma \\propto \\tau$.', 'No.'], md`Gain ∝ τ; response time ∼ τ.`),
          Q(md`$F_n - F_p$ equals…`, ['$kT\\ln(np/n_i^2)$', '$E_g$', '$kT$', '$qV$ always'], 0,
            [null, 'Only at extreme injection.', 'No.', 'Only in particular devices.'], md`Multiply the two QFL formulas.`),
          Q(md`Steady state under light means…`, ['generation = recombination, so the excess stays constant', 'no recombination', 'the light is off', 'equilibrium'], 0,
            [null, 'Recombination balances generation.', 'No.', 'Steady state ≠ equilibrium: $np > n_i^2$.'], md`$d\delta n/dt = g_{op} - \delta n/\tau = 0$.`),
        ],
      },
    ],
  });
})();

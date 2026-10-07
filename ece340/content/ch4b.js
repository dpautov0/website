/* Ch. 4, second half — diffusion, the Einstein relation, built-in fields, continuity and diffusion length
   (Streetman & Banerjee 4.4.1–4.4.4). Topics 11–12. Adds lessons to the 'ch4' unit registered by ch4a.js. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const unit = COURSE.units.find((u) => u.id === 'ch4');

  const graded = BD.diagram({ w: 260, h: 150, E: [-1.05, 0.55], Ec: (x) => 0.12 + 0.3 * x, Ev: (x) => 0.12 + 0.3 * x - 1.12, Ei: (x) => 0.12 + 0.3 * x - 0.56, EF: 0, xl: 'x', field: 'right', lab: { Ei: '' } });
  const gradedN = BD.prof({ w: 260, h: 170, x: [0, 1], y: [0, 1.1], xl: 'x', yl: 'N_d(x)', curves: [{ f: (x) => Math.exp(-2.3 * x), lab: 'N_0e^{-x/L}', labAt: 0.45, dy: -10 }], xt: [], yt: [[1, 'N_0']] });

  const profFig = BD.prof({
    w: 340, h: 200, x: [0, 4.2], y: [0, 1.1], xl: 'x', yl: '\\delta p,\\ J_p',
    xt: [[1, 'L_p'], [2, '2L_p'], [3, '3L_p']], yt: [[1, '\\Delta p'], [Math.exp(-1), '\\Delta p/e']],
    curves: [{ f: (x) => Math.exp(-x), lab: '\\delta p(x) = \\Delta p\\,e^{-x/L_p}', labAt: 1.25, dy: -12 }],
  });

  unit.lessons.push(
    // ======================================================================== Topic 11
    {
      id: 't11-diffusion', topic: 11, sec: '4.4.1–4.4.2', title: 'Diffusion, total current, the Einstein relation, built-in fields',
      steps: [
        R(md`
          ### The idea

          Carriers move randomly. Where there are more of them on the left than on the right, more wander right than left: a net **diffusion** flow from high to low concentration, with no field needed. The flow is proportional to the gradient:

          $$\phi_n = -D_n\frac{dn}{dx} \qquad \phi_p = -D_p\frac{dp}{dx}$$

          - $\phi$: particle flux, carriers per cm² per s
          - $D_n$, $D_p$: **diffusion coefficients**, cm²/s
          - $dn/dx$: concentration gradient, $\text{cm}^{-4}$

          Multiply by the charge to get current. Holes ($+q$) carry current the way they flow; electrons ($-q$) carry it **against** their flow:

          $$J_n^{\text{diff}} = +qD_n\frac{dn}{dx} \qquad J_p^{\text{diff}} = -qD_p\frac{dp}{dx}$$
        `),
        R(md`
          ### Total current: drift plus diffusion

          $$J_n(x) = q\mu_nn(x)\mathscr{E}(x) + qD_n\frac{dn}{dx} \qquad J_p(x) = q\mu_pp(x)\mathscr{E}(x) - qD_p\frac{dp}{dx} \qquad J = J_n + J_p$$

          | | particles move | current flows |
          |---|---|---|
          | electron drift | against $\mathscr{E}$ | along $\mathscr{E}$ |
          | hole drift | along $\mathscr{E}$ | along $\mathscr{E}$ |
          | electron diffusion | down the gradient of $n$ | **up** the gradient of $n$ |
          | hole diffusion | down the gradient of $p$ | down the gradient of $p$ |

          **The Einstein relation.** Drift and diffusion both come from the same random motion and the same collisions, so they are tied:

          $$\frac{D}{\mu} = \frac{kT}{q}$$

          - $kT/q = 0.0259$ V at 300 K; $D$ in cm²/s, $\mu$ in cm²/V·s
          - Si: $D_n = 0.0259 \times 1350 = 35.0$ cm²/s, $D_p = 0.0259 \times 480 = 12.4$ cm²/s
        `),
        RF(md`
          ### Built-in fields in graded doping

          [[fig:g]]

          Dope a sample more heavily on one side. Electrons diffuse toward the light side, leaving positive donors behind; the charge separation builds a field that pushes electrons back. At equilibrium the two currents cancel **exactly**, for each carrier separately ($J_n = 0$):

          $$0 = q\mu_nn\mathscr{E} + qD_n\frac{dn}{dx} \quad\Longrightarrow\quad \mathscr{E}(x) = -\frac{D_n}{\mu_n}\frac{1}{n}\frac{dn}{dx} = -\frac{kT}{q}\,\frac{1}{n}\frac{dn}{dx}$$

          For an exponential profile $n(x) \approx N_d(x) = N_0e^{-x/L}$, $\frac1n\frac{dn}{dx} = -\frac1L$, so the field is **uniform**: $\mathscr{E} = \dfrac{kT}{qL}$, pointing toward the lightly doped side.

          **p-type** works the same way with $J_p = 0$: $\mathscr{E} = +\dfrac{kT}{q}\dfrac1p\dfrac{dp}{dx}$, so $N_a = N_0e^{-x/L}$ gives $\mathscr{E} = -\dfrac{kT}{qL}$, pointing toward the **heavier** doping (it holds the holes back there).

          In the band diagram: $E_F$ is flat (Topic 7), $E_c - E_F$ grows where the doping falls, so the bands tilt; the field is the slope, $\mathscr{E} = \dfrac{1}{q}\dfrac{dE_c}{dx}$. Electrons roll down the band slope (toward the heavy side) by drift exactly as fast as they diffuse up it.

          The same idea out of equilibrium: $J_n = \mu_n n\,\dfrac{dF_n}{dx}$ and $J_p = \mu_p p\,\dfrac{dF_p}{dx}$. A carrier's total current is zero exactly when its quasi-Fermi level is flat.
        `, { g: PF.row([{ svg: gradedN, cap: 'doping falls to the right' }, { svg: graded, cap: 'EF flat, bands tilt up: field points right' }]) }),
        R(md`
          ### Worked example

          !!graded Problem
            An n-type Si layer at 300 K is doped $N_d(x) = 1.0\times10^{17}e^{-x/L}\,\text{cm}^{-3}$ with $L = 0.50\,\mu$m. Take $\mu_n = 1000\,\text{cm}^2/\text{V·s}$. Find (a) $D_n$, (b) the built-in field, and (c) the electron drift and diffusion current densities at $x = 0$, and show they cancel.

          **1. Diagram and governing equations.** The graded-doping picture above.
          $$D_n = \frac{kT}{q}\mu_n, \qquad \mathscr{E} = -\frac{kT}{q}\frac1n\frac{dn}{dx} = \frac{kT}{qL}, \qquad J^{\text{drift}} = q\mu_nn\mathscr{E}, \qquad J^{\text{diff}} = qD_n\frac{dn}{dx} = -\frac{qD_nn}{L}$$

          **2. Units.** $L = 0.50\times10^{-4}$ cm.

          **3. Substitute, with units.**
          $$D_n = (0.0259\,\text{V})\left(1000\,\tfrac{\text{cm}^2}{\text{V·s}}\right), \qquad \mathscr{E} = \frac{0.0259\,\text{V}}{0.50\times10^{-4}\,\text{cm}}$$
          $$J^{\text{drift}} = \left(1.6\times10^{-19}\,\text{C}\right)\left(1000\,\tfrac{\text{cm}^2}{\text{V·s}}\right)\left(1.0\times10^{17}\,\text{cm}^{-3}\right)\left(518\,\tfrac{\text{V}}{\text{cm}}\right)$$
          $$J^{\text{diff}} = -\frac{\left(1.6\times10^{-19}\,\text{C}\right)\left(25.9\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(1.0\times10^{17}\,\text{cm}^{-3}\right)}{0.50\times10^{-4}\,\text{cm}}$$

          **4. Answers.** (a) $D_n = 25.9\,\text{cm}^2/\text{s}$; (b) $\mathscr{E} = 518$ V/cm, in $+x$ (toward the light doping); (c) $J^{\text{drift}} = +8.29\times10^{3}\,\text{A/cm}^2$, $J^{\text{diff}} = -8.29\times10^{3}\,\text{A/cm}^2$: total zero, as equilibrium demands. Large currents, perfectly balanced.

          !!mistake Common mistakes
            - Sign of the electron diffusion current: $J_n^{\text{diff}} = +qD_n\,dn/dx$ (electrons flow down the gradient, current points up it). Holes: $-qD_p\,dp/dx$.
            - Using $kT$ in eV where $kT/q$ in volts is wanted: numerically the same 0.0259, but the units must read V.
            - Gradients with $x$ in μm and $D$ in cm²/s: convert $x$ to cm.
            - Saying "no current, so no field" in a graded sample: there is a field; drift and diffusion cancel.
            - Field direction: n-type, it points from heavy to light doping (holding electrons back on the heavy side); p-type, from light to heavy (holding holes back).

          ### Check questions
        `),
        P({
          title: 'Einstein relation',
          q: md`Holes in a Si sample have $\mu_p = 480\,\text{cm}^2/\text{V·s}$ at 300 K. Find $D_p$.`,
          parts: [{ lbl: md`D_p`, ans: 12.43, unit: 'cm^2/s' }],
          hints: [md`$D_p = (kT/q)\mu_p$.`],
          sol: md`$$D_p = (0.0259\,\text{V})\left(480\,\tfrac{\text{cm}^2}{\text{V·s}}\right) = 12.4\,\text{cm}^2/\text{s}$$`,
        }),
        P({
          title: 'Diffusion current from a linear profile',
          q: md`Holes fall linearly from $1.0\times10^{16}\,\text{cm}^{-3}$ at $x = 0$ to zero at $x = 10\,\mu$m. With $D_p = 12\,\text{cm}^2/\text{s}$ and no field, find the hole current density (sign included; $+$ means along $+x$).`,
          parts: [{ lbl: md`J_p`, ans: 19.2, unit: 'A/cm^2' }],
          hints: [md`$dp/dx = -\dfrac{1.0\times10^{16}\,\text{cm}^{-3}}{10\times10^{-4}\,\text{cm}}$.`, md`$J_p = -qD_p\,dp/dx$.`],
          sol: md`$$\frac{dp}{dx} = -\frac{1.0\times10^{16}\,\text{cm}^{-3}}{1.0\times10^{-3}\,\text{cm}} = -1.0\times10^{19}\,\text{cm}^{-4}$$ $$J_p = -qD_p\frac{dp}{dx} = -\left(1.6\times10^{-19}\,\text{C}\right)\left(12\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(-1.0\times10^{19}\,\text{cm}^{-4}\right) = +19.2\,\text{A/cm}^2$$ Holes diffuse toward $+x$ and so does their current.`,
        }),
        P({
          title: 'Built-in field',
          q: md`Donor doping falls as $e^{-x/L}$ with $L = 1.0\,\mu$m (Si, 300 K, equilibrium). Find the magnitude of the built-in field.`,
          parts: [{ lbl: md`|\mathscr{E}|`, ans: 259, unit: 'V/cm' }],
          hints: [md`$\mathscr{E} = kT/(qL)$ for an exponential profile.`],
          sol: md`$$\mathscr{E} = \frac{kT/q}{L} = \frac{0.0259\,\text{V}}{1.0\times10^{-4}\,\text{cm}} = 259\,\text{V/cm}$$ pointing toward lower doping.`,
        }),
        Q(md`Electrons are piled up near $x = 0$ and thin out toward $+x$; no field. Their diffusion **current** flows…`,
          ['toward $+x$', 'toward $-x$', 'nowhere: no field, no current', 'toward $+x$ for holes only'], 1,
          ['That is the direction the electrons move; their current is opposite.', null, 'Diffusion needs no field.', 'The question is about electrons.'],
          md`Electrons diffuse to $+x$; negative charge moving $+x$ is current toward $-x$. $J_n = qD_n\,dn/dx < 0$.`),
      ],
      bank: [
        Q(md`The Einstein relation says…`, ['$D/\\mu = kT/q$', '$D\\mu = kT$', '$D = \\mu$', '$D/\\mu = q/kT$'], 0, [null, 'Ratio, not product.', 'Units differ.', 'Upside down.'], md`$D = (kT/q)\mu$.`),
        Q(md`Units of $D$?`, ['cm²/s', 'cm²/V·s', 'cm/s', '$\\text{s}^{-1}$'], 0, [null, 'That is mobility.', 'That is velocity.', 'No.'], md`Flux ($\text{cm}^{-2}\text{s}^{-1}$) = D × gradient ($\text{cm}^{-4}$).`),
        Q(md`In a graded n-type sample at equilibrium, the electron drift current is…`, ['zero', 'equal and opposite to the electron diffusion current', 'equal to the hole current', 'the total current'], 1,
          ['There is a field and many electrons.', null, 'Each carrier balances on its own.', 'Total is zero.'], md`$J_n = 0$ means drift = −diffusion.`),
        Q(md`For $N_d = N_0e^{-x/L}$, the built-in field is…`, ['uniform, $kT/qL$', 'proportional to $N_d$', 'zero', 'growing with $x$'], 0,
          [null, 'The $n$ cancels in $\\frac1n\\frac{dn}{dx}$.', 'There is a gradient.', 'Exponential gives a constant.'], md`$\frac1n\frac{dn}{dx} = -\frac1L$.`),
        Q(md`Hole diffusion current points…`, ['down the hole gradient', 'up the hole gradient', 'along the field always', 'perpendicular to the gradient'], 0,
          [null, 'That is electrons.', 'Diffusion ignores the field.', 'No.'], md`$J_p^{\text{diff}} = -qD_p\,dp/dx$.`),
        Q(md`Doubling $\mu_n$ at fixed $T$ makes $D_n$…`, ['double', 'halve', 'unchanged', 'quadruple'], 0, [null, 'Proportional.', 'Proportional.', 'Linear.'], md`$D \propto \mu$.`),
      ],
    },

    // ======================================================================== Topic 12
    {
      id: 't12-continuity', topic: 12, sec: '4.4.3–4.4.4', title: 'Continuity and diffusion equations, steady-state injection, diffusion length',
      steps: [
        R(md`
          ### The idea

          Count holes in a thin slice $dx$. They change because more flow in than out, and because some recombine:

          $$\frac{\partial p}{\partial t} = -\frac1q\frac{\partial J_p}{\partial x} - \frac{\delta p}{\tau_p} \qquad \frac{\partial n}{\partial t} = +\frac1q\frac{\partial J_n}{\partial x} - \frac{\delta n}{\tau_n}$$

          (the electron sign flips because of the $-q$ charge; add $+g_{op}$ if light is on). These are the **continuity equations**. With no field the current is pure diffusion, $J_p = -qD_p\,\partial p/\partial x$, and since $p_0$ is uniform:

          $$\frac{\partial\,\delta p}{\partial t} = D_p\frac{\partial^2\delta p}{\partial x^2} - \frac{\delta p}{\tau_p} \qquad \frac{\partial\,\delta n}{\partial t} = D_n\frac{\partial^2\delta n}{\partial x^2} - \frac{\delta n}{\tau_n}$$

          the **diffusion equations** for minority carriers.
        `),
        RF(md`
          ### Steady-state injection and the diffusion length

          Hold the excess at $\Delta p$ at one face ($x = 0$) of a long n-type bar (by light absorbed right at the surface, or a junction). In steady state $\partial/\partial t = 0$:

          $$\frac{d^2\delta p}{dx^2} = \frac{\delta p}{L_p^2}, \qquad L_p = \sqrt{D_p\tau_p}$$

          - $L_p$: **diffusion length**, cm: the average distance an injected hole diffuses before it recombines
          - General solution $C_1e^{-x/L_p} + C_2e^{+x/L_p}$; a long bar can't grow forever, so $C_2 = 0$:

          $$\delta p(x) = \Delta p\,e^{-x/L_p}$$

          [[fig:p]]

          The hole current is pure diffusion, so it decays the same way:
          $$J_p(x) = -qD_p\frac{d\,\delta p}{dx} = \frac{qD_p}{L_p}\Delta p\,e^{-x/L_p}$$
          At the injecting face $J_p(0) = qD_p\Delta p/L_p$. The holes that stop flowing have recombined; the electrons they recombined with arrive as majority current, so the total current stays uniform.

          **Short bar.** If the bar is much shorter than $L_p$ and $\delta p = 0$ at $x = W$ (an ohmic contact), there is no time to recombine: the profile is a straight line, $\delta p = \Delta p(1 - x/W)$, and $J_p = qD_p\Delta p/W$ everywhere.
        `, { p: { svg: profFig, cap: 'Excess holes injected at x = 0 decay over a diffusion length; Jp(x) has the same shape.' } }),
        R(md`
          ### Worked example

          !!graded Problem
            Holes are injected into a long n-type Si bar ($N_d = 1.0\times10^{16}\,\text{cm}^{-3}$) at $x = 0$, holding $\delta p(0) = 1.0\times10^{14}\,\text{cm}^{-3}$. $\mu_p = 480\,\text{cm}^2/\text{V·s}$, $\tau_p = 1.0\,\mu$s, $T = 300$ K, no applied field. Find (a) $L_p$, (b) $\delta p$ at $x = 50\,\mu$m, (c) the hole current density at $x = 0$.

          **1. Diagram and governing equations.** The profile above. Low level ($10^{14} \ll 10^{16}$), steady state, long bar:
          $$D_p = \frac{kT}{q}\mu_p, \quad L_p = \sqrt{D_p\tau_p}, \quad \delta p(x) = \Delta p\,e^{-x/L_p}, \quad J_p(0) = \frac{qD_p\Delta p}{L_p}$$

          **2–3. Substitute, with units.**
          $$D_p = (0.0259\,\text{V})\left(480\,\tfrac{\text{cm}^2}{\text{V·s}}\right) = 12.4\,\tfrac{\text{cm}^2}{\text{s}}, \qquad L_p = \sqrt{\left(12.4\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(1.0\times10^{-6}\,\text{s}\right)}$$
          $$\delta p(50\,\mu\text{m}) = \left(1.0\times10^{14}\,\text{cm}^{-3}\right)\exp\!\left(-\frac{50\times10^{-4}\,\text{cm}}{3.53\times10^{-3}\,\text{cm}}\right)$$
          $$J_p(0) = \frac{\left(1.6\times10^{-19}\,\text{C}\right)\left(12.4\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(1.0\times10^{14}\,\text{cm}^{-3}\right)}{3.53\times10^{-3}\,\text{cm}}$$

          **4. Answers.** (a) $L_p = 3.53\times10^{-3}$ cm $= 35.3\,\mu$m; (b) $\delta p = 2.42\times10^{13}\,\text{cm}^{-3}$; (c) $J_p(0) = 5.64\times10^{-2}\,\text{A/cm}^2$ $= 56.4$ mA/cm², in $+x$.

          !!mistake Common mistakes
            - $L_p = D_p\tau_p$ (no square root): wrong units (cm²); $L = \sqrt{D\tau}$ is a length.
            - Using the majority carrier's $D$ or $\tau$: the diffusion equation is for the **minority** carrier (holes in n-type).
            - Keeping the growing $e^{+x/L}$ term in a long sample, or using the exponential in a bar much shorter than $L_p$ (it's linear there).
            - Sign of $J_p$: $d\,\delta p/dx < 0$, so $J_p = -qD_p\,d\delta p/dx > 0$, flowing away from the injection point.
            - μm vs cm in $x/L_p$: both must be in the same unit (the ratio is what matters).

          ### Check questions
        `),
        P({
          title: 'Diffusion length',
          q: md`Minority holes have $D_p = 10\,\text{cm}^2/\text{s}$ and $\tau_p = 0.40\,\mu$s. Find $L_p$ in μm.`,
          parts: [{ lbl: md`L_p`, ans: 20, unit: 'μm' }],
          hints: [md`$L_p = \sqrt{D_p\tau_p}$, then cm → μm ($\times10^4$).`],
          sol: md`$$L_p = \sqrt{\left(10\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(4.0\times10^{-7}\,\text{s}\right)} = \sqrt{4.0\times10^{-6}\,\text{cm}^2} = 2.00\times10^{-3}\,\text{cm} = 20.0\,\mu\text{m}$$`,
        }),
        P({
          title: 'Current one diffusion length in',
          q: md`With $\Delta p = 5.0\times10^{14}\,\text{cm}^{-3}$ injected at $x = 0$ into a long bar ($D_p = 10\,\text{cm}^2/\text{s}$, $L_p = 20\,\mu$m), find the hole diffusion current density at $x = L_p$.`,
          parts: [{ lbl: md`J_p(L_p)`, ans: 0.1472, unit: 'A/cm^2' }],
          hints: [md`$J_p(x) = \dfrac{qD_p\Delta p}{L_p}e^{-x/L_p}$; at $x = L_p$ the exponential is $e^{-1}$.`],
          sol: md`$$J_p(L_p) = \frac{\left(1.6\times10^{-19}\,\text{C}\right)\left(10\,\tfrac{\text{cm}^2}{\text{s}}\right)\left(5.0\times10^{14}\,\text{cm}^{-3}\right)}{2.0\times10^{-3}\,\text{cm}}e^{-1} = (0.400\,\text{A/cm}^2)(0.368) = 0.147\,\text{A/cm}^2$$`,
        }),
        Q(md`What does the diffusion length $L_p$ mean physically?`,
          ['The average distance an injected minority hole diffuses before recombining', 'The length of the sample', 'The distance a hole drifts in one second', 'The width of the depletion region'], 0,
          [null, 'It is a material property set by $D$ and $\\tau$.', 'No field is involved.', 'That is a junction quantity.'],
          md`$\langle x\rangle = \int x\,\delta p\,dx/\int\delta p\,dx = L_p$.`),
        Q(md`In steady state at $x = 2L_p$ from the injection point (long bar), $\delta p/\Delta p$ is…`,
          ['$e^{-2} = 0.135$', '$0.5$', '$e^{-1/2}$', '$0$'], 0,
          [null, 'That is linear thinking.', 'Exponent is $x/L_p = 2$.', 'Never exactly zero.'],
          md`$e^{-2} = 0.135$.`),
      ],
      bank: [
        Q(md`The continuity equation expresses…`, ['conservation of carriers: change = net inflow − recombination (+ generation)', 'Ohm\'s law', 'charge neutrality', 'the Einstein relation'], 0,
          [null, 'No.', 'No.', 'No.'], md`Bookkeeping in a slice $dx$.`),
        Q(md`In a bar much shorter than $L_p$ with $\delta p = 0$ at the far contact, the steady profile is…`, ['linear', 'exponential', 'constant', 'parabolic'], 0,
          [null, 'Only in long bars.', 'It must reach zero at the contact.', 'No.'], md`$d^2\delta p/dx^2 \approx 0$.`),
        Q(md`Doubling the lifetime changes $L_p$ by…`, ['×√2', '×2', '×4', 'nothing'], 0, [null, 'Square root.', 'No.', '$L = \\sqrt{D\\tau}$.'], md`$L \propto \sqrt\tau$.`),
        Q(md`Why is the steady-state solution $e^{-x/L_p}$ and not $e^{+x/L_p}$ in a long bar?`, ['$\\delta p$ must stay finite far from the injection', 'Because $D_p > 0$', 'By convention', 'Because holes are positive'], 0,
          [null, 'Not the reason.', 'It is a boundary condition.', 'No.'], md`The growing term would blow up.`),
        Q(md`The diffusion equation $\partial\delta p/\partial t = D_p\partial^2\delta p/\partial x^2 - \delta p/\tau_p$ assumes…`, ['no electric field (pure diffusion)', 'high-level injection', 'equilibrium', 'no recombination'], 0,
          [null, 'Low level.', 'It describes non-equilibrium.', 'It includes recombination.'], md`Drift dropped.`),
      ],
    },
  );
})();

/* Unit 1 — Foundations (Lectures 1–4): why quantum, the postulates, the wavefunction. Topics 1–3. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  // |psi|^2 for A e^{-lambda|x|} (lambda = 1) with x = ±sigma marked
  const cusp = PF.plot({
    w: 360, h: 200, x: [-3, 3], y: [0, 1.15], xl: 'x', yl: '|\\Psi|^2',
    xt: [[-0.707, '-\\sigma'], [0, '0'], [0.707, '\\sigma']],
    curves: [{ f: (x) => Math.exp(-2 * Math.abs(x)) }],
  });

  C.unit({
    id: 'u1', exam: 'm1', num: 'Unit 1', title: 'Foundations',
    lessons: [
      // ------------------------------------------------------------------ Topic 1
      {
        id: 't1-quanta', topic: 1, title: 'Why quantum: quanta, matter waves, amplitudes',
        steps: [
          R(md`
            ### The idea

            Around 1900 three experiments broke classical physics, and each one points to the same fix.

            - **Blackbody radiation** only comes out right if light of frequency $f$ is emitted in lumps of energy $E = hf$.
            - **Photoelectric effect.** Light knocks electrons out of a metal. Brighter light ejects *more* electrons, but not *faster* ones; only raising the frequency does that. Each electron absorbs one photon: $K_{\max} = hf - \phi$, with $\phi$ the work function. Below $f = \phi/h$ nothing comes out, however bright.
            - **Electron diffraction.** Electrons fired at a crystal make an interference pattern, like a wave of wavelength $\lambda = h/p$ (de Broglie).

            So light (a wave) comes in particles, and electrons (particles) behave like waves. Quantum mechanics is the rulebook that handles both at once: a particle is described by a **wave of probability amplitude**, and what we detect are single clicks whose statistics follow that wave.

            $$E = hf = \hbar\omega \qquad p = \frac{h}{\lambda} = \hbar k \qquad \hbar = \frac{h}{2\pi}$$

            For a massive particle with kinetic energy $K$ (non-relativistic): $p = \sqrt{2mK}$, so $\lambda = h/\sqrt{2mK}$. Useful: for an electron, $\lambda \approx 1.226\,\text{nm}/\sqrt{K\,[\text{eV}]}$, and for a photon $\lambda\,[\text{nm}] \approx 1240/E\,[\text{eV}]$.
          `),
          R(md`
            ### When does quantum matter?

            Compare the de Broglie wavelength with the size of whatever confines or probes the particle. An electron with a few eV has $\lambda \sim 1$ nm, the size of atoms and molecules: quantum effects dominate. A 1 g marble at 1 cm/s has $\lambda \sim 10^{-28}$ m, absurdly small next to anything: classical physics is fine.

            ### Confinement makes energies discrete

            Trap a wave between two walls a distance $L$ apart and only standing waves survive: a whole number of half-wavelengths must fit, $L = n\lambda/2$. With $p = h/\lambda$ that gives
            $$E_n = \frac{p^2}{2m} = \frac{n^2h^2}{8mL^2}, \qquad n = 1, 2, 3, \ldots$$
            Two lessons hide in this one line. Energies are **quantized** because the wave has to fit. And the lowest energy is **not zero**: squeezing the particle (small $L$) raises its energy as $1/L^2$. Topic 5 derives this properly from the Schrödinger equation and gets exactly the same answer.

            ### Amplitudes add, not probabilities

            In the double-slit experiment with single electrons, each electron lands at one spot, but after many the spots build up fringes. Each slit contributes an amplitude $\psi_1$ or $\psi_2$ at the screen; the probability is $|\psi_1 + \psi_2|^2 = |\psi_1|^2 + |\psi_2|^2 + 2\,\text{Re}(\psi_1^*\psi_2)$. The cross term is the interference, and it is why quantum probabilities can cancel. Find out which slit the electron went through and the cross term disappears.

            !!mistake Common mistakes
              - Thinking brighter light gives faster photoelectrons. Intensity sets the *number* of photons; frequency sets the energy of each.
              - Using $p = mv$ with $\lambda = h/p$ for a photon. A photon has $p = E/c$.
              - Adding probabilities for paths you never measured. Add amplitudes, then square.
          `),
          L(1, 'recognize'),
          Q(md`You double the intensity of light shining on a metal (same frequency, above threshold). What happens to the photoelectrons?`,
            ['Twice as many come out, same maximum kinetic energy', 'Same number, twice the maximum kinetic energy', 'Same number, maximum kinetic energy up by a factor of √2', 'Nothing changes at all'], 0,
            [null, md`The energy per photon is $hf$; intensity does not change $f$.`, 'No: each electron still absorbs one photon of the same energy.', 'More photons per second means more ejected electrons per second.'],
            md`Intensity = photons per second × $hf$. More photons, more electrons; each still gets $hf - \phi$ at most.`),
          Q(md`Which change makes an electron's de Broglie wavelength **longer**?`,
            ['Slowing the electron down', 'Speeding it up', 'Replacing it with a proton at the same speed', 'None: λ is fixed for a given particle'], 0,
            [null, md`Larger $p$ means shorter $\lambda = h/p$.`, md`A proton at the same speed has about 1836 times the momentum, so a much shorter $\lambda$.`, md`$\lambda = h/p$ changes with the momentum.`],
            md`$\lambda = h/p$: less momentum, longer wavelength.`),
          L(2, 'set up'),
          P({
            title: 'Davisson–Germer',
            q: md`Electrons are accelerated through 54 V and diffract off a nickel crystal. What is their de Broglie wavelength? ($h = 6.626\times10^{-34}$ J·s, $m_e = 9.109\times10^{-31}$ kg.)`,
            parts: [{ lbl: '\\lambda', ans: 1.669e-10, unit: 'm' }],
            hints: [md`Kinetic energy $K = 54\,\text{eV} = 54\times1.602\times10^{-19}$ J. Then $p = \sqrt{2mK}$.`],
            sol: md`$$p = \sqrt{2mK} = \sqrt{2(9.109\times10^{-31})(8.65\times10^{-18})} = 3.97\times10^{-24}\,\text{kg·m/s}$$ $$\lambda = \frac hp = 1.67\times10^{-10}\,\text{m} = 0.167\,\text{nm}$$ Comparable to the atomic spacing in nickel, which is why the crystal diffracts them. Shortcut: $1.226/\sqrt{54} = 0.167$ nm.`,
          }),
          P({
            title: 'Photoelectric stopping voltage',
            q: md`Light of wavelength 250 nm hits zinc, work function $\phi = 4.3$ eV. What stopping voltage brings the fastest photoelectrons to rest?`,
            parts: [{ lbl: 'V_{\\text{stop}}', ans: 0.66, unit: 'V', tol: { rel: 0.03 } }],
            hints: [md`Photon energy in eV: $1240/\lambda\,[\text{nm}]$.`, md`$eV_{\text{stop}} = K_{\max} = hf - \phi$.`],
            sol: md`$hf = 1240/250 = 4.96$ eV, so $K_{\max} = 4.96 - 4.3 = 0.66$ eV and $V_{\text{stop}} = 0.66$ V.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Standing-wave energies',
            q: md`A particle of mass $m$ is trapped between walls a distance $L$ apart. Using only "a whole number $n$ of half-wavelengths fits" and $p = h/\lambda$, find $E_n$.`,
            parts: [{ lbl: 'E_n', expr: 'n^2*h^2/(8*m*L^2)', vars: { n: [1, 4], h: [0.5, 2], m: [0.5, 2], L: [0.5, 2] } }],
            hints: [md`$\lambda_n = 2L/n$.`],
            sol: md`$\lambda_n = 2L/n \Rightarrow p_n = nh/2L \Rightarrow E_n = \dfrac{p_n^2}{2m} = \dfrac{n^2h^2}{8mL^2}$. Same as the infinite square well, since $h^2/8 = \pi^2\hbar^2/2$.`,
          }),
          Q(md`An electron and a proton have the **same kinetic energy**. What is $\lambda_p/\lambda_e$?`,
            [md`$\sqrt{m_e/m_p} \approx 1/43$`, md`$m_e/m_p \approx 1/1836$`, md`$\sqrt{m_p/m_e} \approx 43$`, '1'], 0,
            [null, md`That is the ratio at the same **speed**. At fixed $K$, $p = \sqrt{2mK}\propto\sqrt m$.`, 'Upside down: the heavier particle has more momentum, so the shorter wavelength.', 'Same energy does not mean same momentum.'],
            md`$\lambda = h/\sqrt{2mK} \propto m^{-1/2}$.`),
          L(4, 'one twist'),
          Q(md`A box confines an electron to 1 nm. You shrink the box to 0.5 nm. The minimum (ground-state) energy…`,
            ['quadruples', 'doubles', 'halves', 'stays the same; only excited states change'], 0,
            [null, md`$E_1 \propto 1/L^2$, not $1/L$.`, 'Squeezing raises the energy.', md`Every level, including $n = 1$, goes as $1/L^2$.`],
            md`$E_n = n^2h^2/8mL^2$: halving $L$ multiplies every level by 4.`),
          Q(md`Single electrons pass a double slit. At a point on the screen, slit 1 alone gives probability density $P$, slit 2 alone also $P$. With both open, the two amplitudes arrive exactly out of phase. The density there is…`,
            ['0', md`$2P$`, md`$4P$`, md`$P$`], 0,
            [null, 'That adds probabilities, as if you knew which slit. You do not.', 'That is the in-phase (bright fringe) case.', md`$|\psi_1 + \psi_2|^2$ with $\psi_2 = -\psi_1$ cancels completely.`],
            md`$|\psi - \psi|^2 = 0$: a dark fringe. In phase you get $|2\psi|^2 = 4P$; the average over fringes is $2P$.`),
          L(5, 'exam level'),
          Q(md`You put a detector at slit 1 that records every electron passing it, without stopping it. The fringes…`,
            ['disappear: the screen shows the sum of the two single-slit patterns', 'get sharper', 'shift by half a fringe', 'are unchanged; detection does not affect the electron'], 0,
            [null, 'No mechanism makes them sharper.', 'The cross term vanishes; it does not shift.', 'Recording which slit entangles the electron with the detector; the paths no longer interfere.'],
            md`Knowing the path means the two alternatives are distinguishable, so you add probabilities: $|\psi_1|^2 + |\psi_2|^2$.`),
          P({
            title: 'Electron in a 1 nm box',
            q: md`Using $E_n = n^2h^2/8mL^2$ for an electron with $L = 1$ nm: what photon wavelength is emitted in the $2 \to 1$ transition?`,
            parts: [{ lbl: '\\lambda', ans: 1099, unit: 'nm' }],
            hints: [md`$E_1 = h^2/8mL^2 = 0.376$ eV. The photon carries $E_2 - E_1 = 3E_1$.`],
            sol: md`$E_1 = \dfrac{(6.626\times10^{-34})^2}{8(9.109\times10^{-31})(10^{-9})^2} = 6.02\times10^{-20}\,\text{J} = 0.376\,\text{eV}$. $\Delta E = 3E_1 = 1.13$ eV, so $\lambda = 1240/1.13 = 1099$ nm (near infrared).`,
          }),
          L(6, 'harder than the exam'),
          Q(md`A 1 g bead moves at 1 mm/s inside a 1 cm box. Why don't we see its energy quantized?`,
            ['The spacing between levels is ~$10^{-60}$ J; the bead is at $n \sim 10^{25}$ and the levels form a continuum', 'Quantization only applies to charged particles', 'The bead decoheres, which removes the levels', 'Its de Broglie wavelength is larger than the box'], 0,
            [null, 'Quantization applies to any confined wave, charged or not.', 'Decoherence kills interference between macroscopic states; it does not change the energy spectrum.', md`$\lambda = h/mv \approx 7\times10^{-28}$ m, far smaller than the box.`],
            md`$E_1 = h^2/8mL^2 \sim 5\times10^{-59}$ J while the bead has $\tfrac12mv^2 = 5\times10^{-10}$ J, so $n = \sqrt{E/E_1} \sim 3\times10^{24}$. Adjacent levels differ by a fraction $2/n$: invisible.`),
        ],
        bank: [
          Q(md`Below the threshold frequency, very bright light on a metal ejects…`, ['no electrons', 'a few slow electrons', 'electrons after a delay while energy builds up', 'electrons only if the metal is warm'], 0,
            [null, 'Each electron needs one photon with $hf > \\phi$; brightness cannot substitute.', 'Classical prediction; not observed. Emission is instantaneous or not at all.', 'Temperature is irrelevant here.'], md`One photon, one electron: $hf < \phi$ means none.`),
          Q(md`The photon with wavelength 620 nm has energy about…`, ['2 eV', '0.5 eV', '620 eV', '1240 eV'], 0,
            [null, 'Check: 1240/620.', 'Wavelength in nm is not energy in eV.', '1240 eV·nm is $hc$; divide by λ.'], md`$1240/620 = 2.0$ eV.`),
          Q(md`Which experiment most directly shows that **matter** has wave properties?`, ['Electron diffraction from a crystal', 'Photoelectric effect', 'Blackbody spectrum', 'Compton scattering'], 0,
            [null, 'Shows light is particle-like.', 'Shows light energy is quantized.', 'Shows photons carry momentum.'], md`Davisson–Germer: electrons diffract with $\lambda = h/p$.`),
          Q(md`In the standing-wave picture, why can't the ground-state energy be zero?`, ['Zero energy means infinite wavelength, which cannot fit between the walls', 'Because $h > 0$ makes all energies positive', 'Because the walls push on the particle', 'Because of relativity'], 0,
            [null, 'True but empty: the reason is that a wave must fit.', 'Inside the box the potential is zero; nothing pushes.', 'All non-relativistic.'], md`$\lambda_{\max} = 2L$ sets a minimum momentum $h/2L$.`),
        ],
      },

      // ------------------------------------------------------------------ Topic 2
      {
        id: 't2-postulates', topic: 2, title: 'The postulates: states, observables, measurement',
        steps: [
          R(md`
            ### The idea

            Quantum mechanics is a short list of rules (the postulates). Everything else in the course is derived from them, so you should be able to recite them and, more importantly, *use* them on a state written down on the spot.

            1. **State.** A system is described by a normalized vector $\ket{\psi}$ in a Hilbert space. Multiplying by a global phase $e^{i\alpha}$ changes nothing physical.
            2. **Observables** are Hermitian operators $\hat A$. Hermitian guarantees real eigenvalues and an orthonormal basis of eigenvectors: $\hat A\ket{a_n} = a_n\ket{a_n}$.
            3. **Outcomes.** A measurement of $A$ can only return one of the eigenvalues $a_n$. Nothing in between.
            4. **Born's rule.** The probability of $a_n$ is $P(a_n) = |\braket{a_n}{\psi}|^2$. Immediately afterward the state *is* $\ket{a_n}$ (collapse), so measuring again at once gives $a_n$ again.
            5. **Time evolution** between measurements: $i\hbar\,\dfrac{d}{dt}\ket{\psi} = \hat H\ket{\psi}$ (Schrödinger).

            The picture to hold onto: **expand the state in the eigenbasis of whatever you measure.** The coefficients are amplitudes; their squared magnitudes are the probabilities.
            $$\ket\psi = \sum_n c_n\ket{a_n}, \qquad c_n = \braket{a_n}{\psi}, \qquad P(a_n) = |c_n|^2, \qquad \sum_n|c_n|^2 = 1$$
          `),
          R(md`
            ### Expectation value and spread

            $\langle A\rangle$ is the **average over many identically prepared systems**, each measured once. It is not what a single measurement gives (which is always an eigenvalue), and it need not be an eigenvalue itself.
            $$\langle A\rangle = \sum_n a_n|c_n|^2 = \bra\psi\hat A\ket\psi, \qquad \sigma_A^2 = \langle A^2\rangle - \langle A\rangle^2$$
            $\sigma_A = 0$ exactly when $\ket\psi$ is an eigenstate of $\hat A$: then every measurement gives the same answer.

            ### Phases: which ones matter

            - A **global** phase, $\ket\psi \to e^{i\alpha}\ket\psi$, cancels in every $|c_n|^2$ and every $\bra\psi\hat A\ket\psi$. Unobservable.
            - A **relative** phase between components, $\ket{a_1} + e^{i\varphi}\ket{a_2}$, does not change the probabilities for $A$, but it *does* change the probabilities for any other observable whose eigenstates mix $\ket{a_1}$ and $\ket{a_2}$. That is where interference lives.

            ### Degenerate outcomes

            If two eigenvectors share the eigenvalue $a$, add their probabilities: $P(a) = |c_1|^2 + |c_2|^2$.
          `),
          L(1, 'recognize'),
          Q(md`A measurement of $\hat A$ returns $a_3$. You measure $\hat A$ again immediately. You get…`,
            [md`$a_3$ with certainty`, md`$a_3$ with probability $|c_3|^2$`, md`$\langle A\rangle$`, 'any eigenvalue, with the original probabilities'], 0,
            [null, 'That was the probability before the first measurement. Afterward the state is $|a_3\\rangle$.', 'A single measurement never returns an average.', 'The first measurement collapsed the state.'],
            md`Collapse: after getting $a_3$ the state is $\ket{a_3}$, so $P(a_3) = 1$.`),
          Q(md`Why must observables be Hermitian?`,
            ['Their eigenvalues are real and their eigenvectors form an orthonormal basis', 'So they commute with the Hamiltonian', 'So they are unitary and conserve probability', 'So their matrices are diagonal'], 0,
            [null, 'Observables need not commute with H (position does not).', 'That is the time-evolution operator, not observables.', 'Diagonal only in their own eigenbasis.'],
            'Measured values are real numbers, and Born\'s rule needs a basis to expand in.'),
          L(2, 'set up'),
          P({
            title: 'Probabilities from a state',
            q: md`$\hat A$ has eigenvalues $1, 2, 3$ with eigenvectors $\ket1, \ket2, \ket3$. The state is $\ket\psi = \tfrac{1}{\sqrt6}\left(\ket1 + 2\ket2 + i\ket3\right)$. Find $P(2)$ and $\langle A\rangle$.`,
            parts: [{ lbl: 'P(2)', ans: 2 / 3 }, { lbl: '\\langle A\\rangle', ans: 2 }],
            hints: [md`$P(a_n) = |c_n|^2$; $|i|^2 = 1$.`],
            sol: md`$|c_1|^2 = \tfrac16$, $|c_2|^2 = \tfrac46$, $|c_3|^2 = \tfrac16$ (sum 1). $P(2) = \tfrac23$; $\langle A\rangle = \tfrac{1 + 8 + 3}{6} = 2$.`,
          }),
          P({
            title: 'Normalize first',
            q: md`A state is written (unnormalized) as $3\ket a + 4i\ket b$, with $\ket a$, $\ket b$ orthonormal eigenstates of $\hat B$. What is the probability of the outcome belonging to $\ket b$?`,
            parts: [{ lbl: 'P(b)', ans: 0.64 }],
            hints: [md`The norm squared is $|3|^2 + |4i|^2$.`],
            sol: md`$\braket\psi\psi = 9 + 16 = 25$, so $P(b) = 16/25 = 0.64$.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Spread of the outcomes',
            q: md`For the state $\tfrac1{\sqrt6}(\ket1 + 2\ket2 + i\ket3)$ above, find the standard deviation $\sigma_A$.`,
            parts: [{ lbl: '\\sigma_A', ans: Math.sqrt(1 / 3) }],
            hints: [md`$\langle A^2\rangle = \sum a_n^2|c_n|^2$.`],
            sol: md`$\langle A^2\rangle = \tfrac{1 + 16 + 9}{6} = \tfrac{13}{3}$, so $\sigma_A^2 = \tfrac{13}3 - 4 = \tfrac13$, $\sigma_A = 0.577$.`,
          }),
          Q(md`$\langle A\rangle$ in a state comes out to 2.5, but $\hat A$ has eigenvalues 1, 2, 3 only. This means…`,
            ['Nothing is wrong: the average over many runs need not be an eigenvalue', 'The state is not normalized', 'A measurement can return 2.5', 'The operator is not Hermitian'], 0,
            [null, 'Normalization does not force the mean onto an eigenvalue.', 'Single outcomes are always eigenvalues.', 'Hermitian operators routinely have non-eigenvalue averages.'],
            md`E.g. equal weights on 2 and 3 give $\langle A\rangle = 2.5$, yet every single run gives 2 or 3.`),
          Q(md`Which pair of states gives **different** predictions for some measurement?`,
            [md`$\tfrac1{\sqrt2}(\ket1 + \ket2)$ and $\tfrac1{\sqrt2}(\ket1 - \ket2)$`, md`$\tfrac1{\sqrt2}(\ket1 + \ket2)$ and $\tfrac{-1}{\sqrt2}(\ket1 + \ket2)$`, md`$\tfrac1{\sqrt2}(\ket1 + i\ket2)$ and $\tfrac{i}{\sqrt2}(\ket1 + i\ket2)$`, 'None: they all differ only by phases'], 0,
            [null, 'These differ by a global factor $-1$.', 'These differ by a global factor $i$.', 'Relative phases are physical; global ones are not.'],
            md`The relative sign between $\ket1$ and $\ket2$ is physical: it changes the outcome probabilities for any observable whose eigenstates are mixtures of $\ket 1$ and $\ket 2$.`),
          L(4, 'one twist'),
          Q(md`$\hat A$ has eigenvalue $5$ twice (eigenvectors $\ket{u_1}, \ket{u_2}$) and eigenvalue $-1$ once ($\ket{v}$). The state is $\tfrac12\ket{u_1} + \tfrac12\ket{u_2} + \tfrac1{\sqrt2}\ket v$. $P(5) = $?`,
            ['1/2', '1/4', '1/√2', '1'], 0,
            [null, 'That counts only one of the two eigenvectors with eigenvalue 5.', 'Probabilities are squared magnitudes.', md`$\ket v$ carries the rest.`],
            md`Degenerate: add both, $\tfrac14 + \tfrac14 = \tfrac12$.`),
          Q(md`A lab prepares 1000 identical systems and measures $A$ once on each. Another lab prepares one system and measures $A$ 1000 times in a row. Which statement is right?`,
            ['The first lab sees the Born-rule distribution; the second sees the same value 1000 times', 'Both see the Born-rule distribution', 'Both see the same value every time', 'The second lab measures ⟨A⟩ more precisely'], 0,
            [null, 'After the first measurement the single system is stuck in an eigenstate (no time evolution in between).', 'The ensemble shows spread; repeated measurements on one system do not.', 'The repeated measurements return one value, not an average.'],
            md`$\langle A\rangle$ is an ensemble average. Repeating on one system just confirms the collapsed value.`),
          L(5, 'exam level'),
          P({
            title: 'Detector with three readings',
            q: md`A detector reads $+1$, $0$ or $-1$. A state is $\ket\psi = \tfrac12\ket{+1} + \tfrac1{\sqrt2}\ket0 + \tfrac{e^{i\pi/3}}{2}\ket{-1}$. Find $\langle A\rangle$ and $\sigma_A$.`,
            parts: [{ lbl: '\\langle A\\rangle', ans: 0, tol: { abs: 0.01 } }, { lbl: '\\sigma_A', ans: Math.sqrt(0.5) }],
            hints: [md`The phase $e^{i\pi/3}$ drops out of $|c|^2$.`],
            sol: md`$P(+1) = \tfrac14$, $P(0) = \tfrac12$, $P(-1) = \tfrac14$. $\langle A\rangle = \tfrac14 - \tfrac14 = 0$; $\langle A^2\rangle = \tfrac14 + \tfrac14 = \tfrac12$; $\sigma_A = 1/\sqrt2 = 0.707$.`,
          }),
          L(6, 'harder than the exam'),
          Q(md`$\hat A$ and $\hat B$ do **not** share eigenvectors. You measure $A$ (get $a_1$), then $B$, then $A$ again. The second $A$ result…`,
            [md`can differ from $a_1$, because measuring $B$ collapsed the state onto a $B$ eigenvector`, md`is always $a_1$, since you already measured it`, md`is always $a_1$ if $B$ gave its most likely value`, md`is $\langle A\rangle$`],
            0,
            [null, 'The B measurement replaced the state with a B eigenvector, which is a superposition of A eigenvectors.', 'Even the most likely B outcome collapses onto a B eigenvector that is a mix of A eigenvectors.', 'Single outcomes are eigenvalues.'],
            md`Incompatible measurements erase each other's results. That is the seed of the uncertainty principle (Topic 9).`),
        ],
        bank: [
          Q(md`Which quantity is physical (measurable)?`, [md`$|c_1|^2$`, md`the global phase of $\ket\psi$`, md`the phase of $c_1$ alone`, md`$c_1$ itself`], 0,
            [null, 'Cancels everywhere.', 'Only phases relative to other components matter.', 'Complex amplitudes are not measured directly.'], md`Probabilities are $|c_n|^2$.`),
          Q(md`If $\sigma_A = 0$ in a state, the state is…`, [md`an eigenstate of $\hat A$`, 'normalized', 'a stationary state', md`an eigenstate of every observable`], 0,
            [null, 'Every state is normalized; that says nothing about spread.', 'Only if A is the Hamiltonian.', 'Only of A (and things compatible with it).'], md`Zero spread means one outcome with probability 1.`),
          Q(md`Eigenvectors of a Hermitian operator with different eigenvalues are…`, ['orthogonal', 'parallel', 'complex conjugates of each other', 'not related'], 0,
            [null, 'Different eigenvalues cannot share a direction.', 'No such rule.', 'They are always orthogonal.'], md`$a_m\braket{a_n}{a_m} = \bra{a_n}\hat A\ket{a_m} = a_n\braket{a_n}{a_m}$, so $(a_m - a_n)\braket{a_n}{a_m} = 0$.`),
          Q(md`The Schrödinger equation governs…`, ['how the state changes between measurements', 'what happens during a measurement', 'which eigenvalue a measurement returns', 'only the energy of the system'], 0,
            [null, 'Collapse is a separate postulate.', 'That is Born\'s rule (random).', 'It evolves the whole state.'], 'Smooth, deterministic evolution between measurements.'),
        ],
      },

      // ------------------------------------------------------------------ Topic 3
      {
        id: 't3-wavefunction', topic: 3, title: 'The wavefunction: probability, expectation values, momentum',
        steps: [
          R(md`
            ### The idea

            The wavefunction is the state written in the position basis: $\Psi(x,t) = \braket{x}{\psi(t)}$. Its job is to give probabilities.
            $$P(a < x < b) = \int_a^b|\Psi(x,t)|^2\,dx, \qquad \int_{-\infty}^{\infty}|\Psi|^2\,dx = 1$$
            $|\Psi|^2$ is a probability **density** (units 1/length in 1-D), so $\Psi$ has units $\text{length}^{-1/2}$. Big $|\Psi|^2$: the particle is often found there. $\Psi$ itself is complex and not directly measured.

            ### Averages: weight by $|\Psi|^2$

            $$\langle x\rangle = \int x|\Psi|^2dx \qquad \langle x^2\rangle = \int x^2|\Psi|^2dx \qquad \sigma_x = \sqrt{\langle x^2\rangle - \langle x\rangle^2}$$
            Two shortcuts that save most of the work: if $|\Psi|^2$ is **symmetric about $x_0$**, then $\langle x\rangle = x_0$ with no integral. If it is even about 0, every odd-power integral vanishes.

            ### Momentum is a derivative

            A plane wave $e^{ikx}$ has wavelength $2\pi/k$, so momentum $\hbar k$. The operator that pulls $\hbar k$ out of $e^{ikx}$ is
            $$\hat p = -i\hbar\frac{\partial}{\partial x}, \qquad \langle p\rangle = \int\Psi^*\left(-i\hbar\frac{\partial\Psi}{\partial x}\right)dx, \qquad \langle p^2\rangle = \hbar^2\int\left|\frac{\partial\Psi}{\partial x}\right|^2dx$$
            Intuition to check answers fast:
            - A **real** wavefunction (or real times a constant phase) has $\langle p\rangle = 0$: it is an equal mix of left and right movers.
            - Multiplying by $e^{ik_0x}$ adds $\hbar k_0$ to $\langle p\rangle$ and does not change $|\Psi|^2$.
            - **Wiggly or steep** $\Psi$ means large $\langle p^2\rangle$. The last formula (integrate by parts once) is the safe way to get $\langle p^2\rangle$, and it avoids delta functions at kinks.
          `),
          R(md`
            ### Probability is conserved

            The Schrödinger equation (with real $V$) keeps $\int|\Psi|^2$ constant in time: once normalized, always normalized (unitarity). Locally, probability flows with the current
            $$J(x,t) = \frac{\hbar}{2mi}\left(\Psi^*\frac{\partial\Psi}{\partial x} - \Psi\frac{\partial\Psi^*}{\partial x}\right), \qquad \frac{d}{dt}P(a<x<b) = J(a) - J(b)$$
            A real $\Psi$ has $J = 0$. For $Ae^{ikx}$, $J = |A|^2\hbar k/m$: density times velocity.

            ### Ehrenfest: averages move classically

            $$\frac{d\langle x\rangle}{dt} = \frac{\langle p\rangle}{m}, \qquad \frac{d\langle p\rangle}{dt} = -\left\langle\frac{\partial V}{\partial x}\right\rangle$$
            Newton's law, but for averages, and with the **average of the force**, $\langle -V'(x)\rangle$, not the force at the average position, $-V'(\langle x\rangle)$. The two agree only when $V'$ is linear in $x$ (free, uniform field, harmonic).
          `),
          RF(md`
            ### Worked example (HW 1)

            !!graded Problem
              $\Psi(x,t) = Ae^{-\lambda|x|}e^{-i\omega t}$ with $\lambda > 0$. Normalize, find $\langle x\rangle$, $\langle x^2\rangle$, $\sigma_x$, and the probability of finding the particle outside $[\langle x\rangle - \sigma, \langle x\rangle + \sigma]$.

            [[fig:cusp]]

            **Normalize.** The time phase drops out of $|\Psi|^2$. The function is even, so double the half-line:
            $$1 = 2|A|^2\int_0^\infty e^{-2\lambda x}dx = \frac{|A|^2}{\lambda} \Rightarrow A = \sqrt\lambda$$
            **Averages.** $|\Psi|^2$ is even, so $\langle x\rangle = 0$ with no work. Using $\int_0^\infty x^ne^{-\alpha x}dx = n!/\alpha^{n+1}$:
            $$\langle x^2\rangle = 2\lambda\int_0^\infty x^2e^{-2\lambda x}dx = 2\lambda\cdot\frac{2}{(2\lambda)^3} = \frac{1}{2\lambda^2}, \qquad \sigma = \frac{1}{\sqrt2\,\lambda}$$
            **Outside.** By symmetry, twice the right tail:
            $$P = 2\lambda\int_\sigma^\infty e^{-2\lambda x}dx = e^{-2\lambda\sigma} = e^{-\sqrt2} = 0.243$$

            !!mistake Common mistakes
              - Forgetting the absolute value: $e^{-\lambda|x|}$ is not $e^{-\lambda x}$ on the left half. Split at 0 or use evenness.
              - Normalizing $\Psi$ instead of $|\Psi|^2$: $\int\Psi\,dx = 1$ is meaningless.
              - Computing $\langle p^2\rangle$ as $-\hbar^2\int\Psi^*\Psi''$ and missing the delta function in $\Psi''$ at a kink. Use $\hbar^2\int|\Psi'|^2$.
              - Writing $\sigma^2 = \langle x^2\rangle$ when $\langle x\rangle \ne 0$.
          `, { cusp: { svg: cusp, cap: 'The cusp at 0 and the ±σ points. About 24% of the probability lies outside them.' } }),
          L(1, 'recognize'),
          Q(md`In one dimension, $\Psi(x)$ has units of…`,
            [md`$\text{m}^{-1/2}$`, md`$\text{m}^{-1}$`, 'none (dimensionless)', md`$\text{m}^{1/2}$`], 0,
            [null, md`That is $|\Psi|^2$, a density.`, md`$\int|\Psi|^2dx = 1$ forces $|\Psi|^2$ to carry 1/length.`, 'Upside down.'],
            md`$|\Psi|^2dx$ is a pure number, so $|\Psi|^2 \sim 1/\text{m}$.`),
          Q(md`$\Psi(x,t) = f(x)e^{-iEt/\hbar}$ with $f$ real. Which is true?`,
            [md`$|\Psi|^2$ does not change in time and $\langle p\rangle = 0$`, md`$|\Psi|^2$ oscillates at frequency $E/\hbar$`, md`$\langle p\rangle = E/c$`, md`$\langle x\rangle$ moves at speed $\sqrt{2E/m}$`], 0,
            [null, 'The phase has modulus 1 and cancels in the density.', 'Massive particle; no.', 'Nothing in $|\\Psi|^2$ moves.'],
            md`The phase cancels in $|\Psi|^2$; a real spatial part has zero average momentum.`),
          L(2, 'set up'),
          P({
            title: 'Normalize a parabola',
            q: md`$\Psi(x,0) = Ax(a - x)$ for $0 \le x \le a$, zero elsewhere. Find $A$ (real, positive).`,
            parts: [{ lbl: 'A', expr: 'sqrt(30/a^5)', vars: { a: [0.5, 3] } }],
            hints: [md`$\int_0^ax^2(a-x)^2dx = a^5/30$.`],
            sol: md`$1 = A^2\int_0^a x^2(a - x)^2dx = A^2\left(\tfrac{a^5}{3} - \tfrac{2a^5}{4} + \tfrac{a^5}{5}\right) = \tfrac{A^2a^5}{30}$, so $A = \sqrt{30/a^5}$.`,
          }),
          P({
            title: 'Probability in a quarter',
            q: md`A particle has $\Psi = \sqrt{2/a}\,\sin(\pi x/a)$ on $0 < x < a$. What is the probability it is found in $0 < x < a/4$?`,
            parts: [{ lbl: 'P', ans: 0.25 - 1 / (2 * Math.PI) }],
            hints: [md`$\sin^2u = \tfrac12(1 - \cos 2u)$.`],
            sol: md`$$P = \frac2a\int_0^{a/4}\sin^2\frac{\pi x}a\,dx = \frac2a\left[\frac x2 - \frac{a}{4\pi}\sin\frac{2\pi x}{a}\right]_0^{a/4} = \frac14 - \frac1{2\pi} = 0.0908$$ Less than 1/4 because the density is small near the wall.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Spread of the parabola',
            q: md`For $\Psi = \sqrt{30/a^5}\,x(a-x)$ on $[0, a]$, find $\langle x\rangle$ and $\sigma_x$.`,
            parts: [{ lbl: '\\langle x\\rangle', expr: 'a/2', vars: { a: [0.5, 3] } }, { lbl: '\\sigma_x', expr: 'a/sqrt(28)', vars: { a: [0.5, 3] } }],
            hints: [md`$|\Psi|^2$ is symmetric about $a/2$.`, md`$\int_0^ax^4(a - x)^2dx = a^7/105$, so $\langle x^2\rangle = 2a^2/7$.`],
            sol: md`$\langle x\rangle = a/2$ by symmetry. $\langle x^2\rangle = \tfrac{30}{a^5}\cdot\tfrac{a^7}{105} = \tfrac{2a^2}{7}$. $\sigma^2 = \tfrac{2a^2}{7} - \tfrac{a^2}{4} = \tfrac{a^2}{28}$, so $\sigma = a/\sqrt{28} \approx 0.189a$.`,
          }),
          Q(md`$\Psi(x) = g(x)e^{ik_0x}$ with $g$ real and normalized. Then $\langle p\rangle$ is…`,
            [md`$\hbar k_0$`, '0', md`$-\hbar k_0$`, md`$\hbar k_0$ times $\int g\,dx$`], 0,
            [null, 'The phase factor carries momentum.', md`$-i\hbar\,\partial_x e^{ik_0x} = +\hbar k_0e^{ik_0x}$.`, md`$\int g^2 = 1$ appears, not $\int g$.`],
            md`$\langle p\rangle = \int g\,e^{-ik_0x}(-i\hbar)(g' + ik_0g)e^{ik_0x}dx = -i\hbar\int gg'\,dx + \hbar k_0 = \hbar k_0$, since $\int gg' = \tfrac12[g^2] = 0$.`),
          L(4, 'one twist'),
          P({
            title: 'Momentum spread of the cusp',
            q: md`For $\Psi = \sqrt\lambda\,e^{-\lambda|x|}$, find $\langle p^2\rangle$ and the product $\sigma_x\sigma_p$ (use $\sigma_x = 1/\sqrt2\lambda$).`,
            parts: [{ lbl: '\\langle p^2\\rangle', expr: 'hbar^2*lambda^2', vars: { hbar: [0.5, 2], lambda: [0.5, 2] } }, { lbl: '\\sigma_x\\sigma_p', expr: 'hbar/sqrt(2)', vars: { hbar: [0.5, 2], lambda: [0.5, 2] } }],
            hints: [md`$|\Psi'|^2 = \lambda^2|\Psi|^2$ everywhere except one point.`],
            sol: md`$\langle p^2\rangle = \hbar^2\int|\Psi'|^2 = \hbar^2\lambda^2\int|\Psi|^2 = \hbar^2\lambda^2$. $\langle p\rangle = 0$ (real), so $\sigma_p = \hbar\lambda$ and $\sigma_x\sigma_p = \hbar/\sqrt2 \approx 0.71\hbar \ge \hbar/2$. ✓ (Doing it with $\Psi''$ you would need the $-2\lambda\delta(x)$ at the cusp to get this.)`,
          }),
          Q(md`Probability flows **out** of the region $a < x < b$ when…`,
            [md`$J(b) > J(a)$`, md`$J(a) > J(b)$`, md`$J(a) = J(b) \ne 0$`, md`$|\Psi(b)| > |\Psi(a)|$`], 0,
            [null, 'More flows in at a than leaves at b: the region gains.', 'Equal currents: steady, no change inside.', 'Density alone does not set flow; current does.'],
            md`$\tfrac{d}{dt}P_{ab} = J(a) - J(b)$: more leaving at $b$ than arriving at $a$.`),
          L(5, 'exam level'),
          P({
            title: 'Momentum of the parabola',
            q: md`For $\Psi = \sqrt{30/a^5}\,x(a-x)$ find $\langle p^2\rangle$, then $\sigma_x\sigma_p/\hbar$.`,
            parts: [{ lbl: '\\langle p^2\\rangle', expr: '10*hbar^2/a^2', vars: { hbar: [0.5, 2], a: [0.5, 3] } }, { lbl: '\\sigma_x\\sigma_p/\\hbar', ans: Math.sqrt(5 / 14) }],
            hints: [md`$\Psi' = \sqrt{30/a^5}(a - 2x)$ and $\int_0^a(a - 2x)^2dx = a^3/3$.`],
            sol: md`$\langle p^2\rangle = \hbar^2\cdot\tfrac{30}{a^5}\cdot\tfrac{a^3}{3} = \tfrac{10\hbar^2}{a^2}$. $\langle p\rangle = 0$ (real), so $\sigma_p = \sqrt{10}\,\hbar/a$ and $\sigma_x\sigma_p = \tfrac{a}{\sqrt{28}}\cdot\tfrac{\sqrt{10}\hbar}{a} = \sqrt{\tfrac{5}{14}}\,\hbar = 0.598\hbar$. Just above $\hbar/2$: the parabola is close to the sine ground state.`,
          }),
          Q(md`A particle sits in $V(x) = \alpha x^4$. Ehrenfest says $\tfrac{d\langle p\rangle}{dt} = -4\alpha\langle x^3\rangle$. Why doesn't $\langle x\rangle$ follow the classical trajectory exactly?`,
            [md`$\langle x^3\rangle \ne \langle x\rangle^3$ for a spread-out packet`, 'Ehrenfest only holds for stationary states', md`$\langle p\rangle \ne m\,d\langle x\rangle/dt$ in this potential`, 'The quartic potential is not Hermitian'], 0,
            [null, 'Ehrenfest holds for any normalizable state.', md`That relation holds for any $V(x)$.`, 'V(x) is a real function; it is Hermitian.'],
            md`The average force is not the force at the average position. Only for $V$ at most quadratic is $V'$ linear, so $\langle V'\rangle = V'(\langle x\rangle)$.`),
          L(6, 'harder than the exam'),
          Q(md`Use the Schrödinger equation to compute $\tfrac{d}{dt}\int|\Psi|^2dx$ when the potential has a small imaginary part, $V = V_0 - i\Gamma\hbar/2$ (constant $\Gamma > 0$). The total probability…`,
            [md`decays as $e^{-\Gamma t}$`, 'stays 1', md`grows as $e^{\Gamma t}$`, md`decays as $e^{-\Gamma t/2}$`], 0,
            [null, 'Unitarity needs a real (Hermitian) potential.', 'Sign: $-i\\Gamma$ removes probability.', md`$\Psi$ decays as $e^{-\Gamma t/2}$; the density $|\Psi|^2$ decays twice as fast.`],
            md`$\Psi \propto e^{-iV t/\hbar} = e^{-iV_0t/\hbar}e^{-\Gamma t/2}$, so $|\Psi|^2 \propto e^{-\Gamma t}$. A model of decay: probability leaks out of the description.`),
        ],
        bank: [
          Q(md`Which normalization condition is correct?`, [md`$\int|\Psi|^2dx = 1$`, md`$\int\Psi\,dx = 1$`, md`$|\Psi(0)|^2 = 1$`, md`$\max|\Psi| = 1$`], 0,
            [null, 'Ψ can be complex and negative.', 'Densities at a point are not probabilities.', 'No such rule.'], 'Total probability is 1.'),
          Q(md`$|\Psi|^2$ is symmetric about $x = 3$. Then…`, [md`$\langle x\rangle = 3$`, md`$\langle x^2\rangle = 9$`, md`$\sigma_x = 0$`, md`$\langle p\rangle = 3\hbar$`], 0,
            [null, md`$\langle x^2\rangle = 9 + \sigma^2$.`, 'Symmetry says nothing about width.', 'Unrelated.'], 'Symmetric density: the mean is the center.'),
          Q(md`For the plane wave $Ae^{ikx}$ the probability current is…`, [md`$|A|^2\hbar k/m$`, '0', md`$|A|^2\hbar k$`, md`$|A|^2k/m$`], 0,
            [null, 'A complex traveling wave carries current.', 'Missing 1/m: J = density × velocity.', md`Missing $\hbar$.`], md`Density $|A|^2$ times velocity $\hbar k/m$.`),
          Q(md`The operator $\hat p$ in position space is…`, [md`$-i\hbar\,\partial_x$`, md`$i\hbar\,\partial_x$`, md`$\hbar\,\partial_x$`, md`$-\hbar^2\partial_x^2$`], 0,
            [null, 'Sign: that gives $-\\hbar k$ for $e^{ikx}$.', 'Not Hermitian.', md`That is $\hat p^2$.`], md`$-i\hbar\partial_xe^{ikx} = \hbar ke^{ikx}$.`),
          Q(md`d⟨x⟩/dt equals…`, [md`$\langle p\rangle/m$`, md`$\langle p/m\rangle^2$`, md`$\langle x\rangle/t$`, '0 always'], 0,
            [null, 'Not squared.', 'Meaningless.', 'Only for stationary states.'], 'Ehrenfest, first half.'),
        ],
      },
    ],
  });
})();

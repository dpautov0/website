/* Unit 5 — Discussions 1–4, worked. Discussion problems are conceptual: each page explains the idea behind every part,
   gives the solution behind a reveal button, then drills the same ideas. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const T = (n, id) => `[Topic ${n}](#/l/${id})`;
  const paper = (title, date, items) => ({ t: 'paper', html: `<div class="pp-title"><span>${title}</span><span>${date}</span></div>`, items });
  const drill = R(md`
    ### Practice: same ideas, new setups

    Answer each part above out loud or on paper before revealing it; discussion problems test whether you can explain, not just compute.
  `);

  C.unit({
    id: 'u5', exam: 'm1', num: 'Unit 5', title: 'Discussions, worked',
    blurb: 'Every discussion problem: the idea behind each part, the solution, and practice.',
    lessons: [
      // ------------------------------------------------------------------ D1
      {
        id: 'disc1', title: 'Discussion 1: postulates in the lab; superposition and uncertainty',
        steps: [
          R(md`
            **Trains:** what a measurement does and what a probability distribution means (${T(2, 't2-postulates')}), momentum distributions and the uncertainty principle for a free particle (${T(6, 't6-free')}, ${T(9, 't9-uncertainty')}), and when quantum effects matter (${T(1, 't1-quanta')}).

            **The two ideas that answer almost every part:**
            1. **Ensemble vs single system.** A histogram of outcomes comes from many *identically prepared* copies, each measured once. One system measured repeatedly just repeats its collapsed value.
            2. **Measurement prepares.** Right after reading $a$, the state *is* the eigenstate $\ket a$. That is also how labs make a known state: measure and keep the ones that gave the value you want.
          `),
          paper('PHYS 486 · Discussion 1', '9/3', [
            {
              q: md`**1. Postulates, take I (a–e).** Alice measures $\hat A$ once on each of $N = 100$ identically prepared photons: half read 0, a quarter $+1$, a quarter $-1$. (a) Would measuring **one** photon 100 times give the same? (b) What if she measures the same 100 photons again? (c) What does this imply about $\braket{0|\pm1}$? (d) Write $\hat A\ket{\pm1}$, $\hat A\ket0$. (e) Find $\langle A\rangle$; what does it mean for large $N$?`,
              ans: md`(a) No: 100 identical readings. (b) Each photon repeats its first reading. (c) $\braket{0|\pm1} = 0$ (and $\braket{+1|-1} = 0$). (d) $\hat A\ket{\pm1} = \pm\ket{\pm1}$, $\hat A\ket0 = 0$. (e) $\langle A\rangle = 0$: the average reading over many photons.`,
              sol: md`
                **(a)** The first reading collapses the photon into that eigenstate; every later reading repeats it. The 50/25/25 split is a property of the **ensemble**, not of one photon.

                **(b)** Each photon now sits in an eigenstate of $\hat A$, so the second pass reproduces the first, photon by photon.

                **(c)** $|\braket{0|{+1}}|^2$ is the probability of reading 0 for a photon in $\ket{+1}$. We just saw that is zero (it always re-reads $+1$). So eigenstates of different outcomes are **orthogonal**: the experiment shows what the Hermitian theorem promised.

                **(d)** The eigenvalue equations, with outcomes as eigenvalues: $\hat A\ket{+1} = +\ket{+1}$, $\hat A\ket{-1} = -\ket{-1}$, $\hat A\ket0 = 0\cdot\ket0$.

                **(e)** $\langle A\rangle = 0\cdot\tfrac12 + 1\cdot\tfrac14 + (-1)\cdot\tfrac14 = 0$. It is what the average of the readings tends to as $N \to \infty$, though no single reading needs to equal it.
              `,
            },
            {
              q: md`**1 (f–k).** (f) Write the initial state as a superposition of $\ket0, \ket{\pm1}$. Unique? (g) Without calculating: $\sigma_A$ in $\ket{\pm1}$? In $\ket\psi$? (h) How many photons must Alice measure to prepare 10 in $\ket0$? (i) Bob measures $\hat B$ on those 10 and always gets 0. Does $\hat B = \hat A$? (j) What if he only knows $\langle B\rangle = 0$? (k) How many different readings can $\hat B$ give at most?`,
              ans: md`(f) $\ket\psi = \tfrac{1}{\sqrt2}e^{i\alpha}\ket0 + \tfrac12e^{i\beta}\ket{+1} + \tfrac12e^{i\gamma}\ket{-1}$; the phases are not determined. (g) 0; nonzero. (h) About 20 (on average). (i) No. (j) Even less. (k) Three.`,
              sol: md`
                **(f)** Born's rule gives only $|c_n|^2 = \tfrac12, \tfrac14, \tfrac14$, so $|c_n| = \tfrac1{\sqrt2}, \tfrac12, \tfrac12$. The phases are invisible to $\hat A$ measurements: **not unique**. (One overall phase is unphysical anyway; the two relative phases are physical but this experiment cannot see them.)

                **(g)** $\ket{\pm1}$: every reading identical, $\sigma_A = 0$. $\ket\psi$: three different readings occur, $\sigma_A > 0$ (in fact $\sigma_A = 1/\sqrt2$).

                **(h)** Each photon reads 0 with probability $\tfrac12$: measure about 20 and keep those that read 0 (on average; more if she must be sure). Measurement as **state preparation**.

                **(i)** No. $\ket0$ might merely be *one* eigenstate of $\hat B$, while $\hat B$'s other eigenstates are superpositions of $\ket{\pm1}$; or 10 is just too few to see other outcomes. To test $\hat B = \hat A$, Bob should feed $\hat B$ the states $\ket{+1}$ and $\ket{-1}$ too, and check each gives a definite, matching reading. (Also: dial labels are arbitrary; Bob's "0" need not be Alice's.)

                **(j)** Weaker still: $\langle B\rangle = 0$ is possible with no individual reading equal to 0 (half $+1$, half $-1$).

                **(k)** Alice's three outcomes show the Hilbert space is (at least) 3-dimensional. That belongs to the **system**, so any observable has at most three distinct eigenvalues here.
              `,
            },
            {
              q: md`**2. Superposition and uncertainty (a–e).** A free particle has momentum distribution $P(k) = \dfrac{2}{\pi a}\dfrac{\sin^2(ka/2)}{k^2}$, $p = \hbar k$. (a) How was $P(k)$ measured? (b) Most likely $p$? $\langle p\rangle$? (c) Guess $\psi(x, 0)$ (dimensions!). (d) Write an expression for $\psi(x,0)$. (e) Up to what energy is the particle's behavior quantum? Proton or electron?`,
              ans: md`(a) Many identical copies, one momentum measurement each. (b) $p = 0$; $\langle p\rangle = 0$. (c) A box of width $a$ and height $1/\sqrt a$. (d) $\psi = \tfrac{1}{\sqrt{2\pi}}\int\phi(k)e^{ikx}dk$ with $|\phi|^2 = P$, but $P$ alone does not fix the phases of $\phi$. (e) $E_{\max} \sim \tfrac{(2\pi\hbar)^2}{2ma^2}$; lighter particles stay quantum to higher energy: an electron.`,
              sol: md`
                **(a)** A distribution is an ensemble property: prepare many particles in $\psi(x,0)$, measure each one's momentum once at $t = 0$, histogram.

                **(b)** $\sin^2(u)/u^2$ peaks at $u = 0$: most likely $p = 0$. $P(k)$ is even, so $\langle p\rangle = 0$ with no integral. It **vanishes** at $k = 2\pi n/a$ ($n \ne 0$): those momenta are never measured.

                **(c)** $[k] = 1/\text{length}$, so $[a] = \text{length}$; $\psi$ has units $\text{length}^{-1/2}$, and $a$ is the only length: $\psi \sim 1/\sqrt a$. A constant is not normalizable, so make it a **box** of width $a$: $\psi = 1/\sqrt a$ for $|x| < a/2$. Check: its transform is $\phi(k) = \tfrac{1}{\sqrt{2\pi a}}\cdot\tfrac{2\sin(ka/2)}{k}$, and $|\phi|^2$ is exactly the given $P(k)$. (The sinc pair from Lesson D.)

                **(d)** $\psi(x,0) = \tfrac{1}{\sqrt{2\pi}}\int\phi(k)e^{ikx}dk$. Subtle point: the data give $|\phi(k)|$, not its phase, so the guess is one consistent answer, not the only one.

                **(e)** Waviness shows when $\lambda = 2\pi/k$ is not small compared with $a$: $p \lesssim 2\pi\hbar/a$, so $E \lesssim \tfrac{(2\pi\hbar)^2}{2ma^2} = E_{\max}$. Since $E_{\max} \propto 1/m$, at a given energy the lighter electron is far more likely to be in the quantum regime.
              `,
            },
            {
              q: md`**2 (f–k).** (f) You measure $p = \pi\hbar/a$. What is the state right after? (g) Then measure the energy: value and resulting state? (h) Wait a time $t$ and measure $E$ and $p$ again. (i) $\sigma_p$, $\sigma_E$ in that state? (j) Now measure position: what values can occur? $\sigma_x$? (k) Does this fit the uncertainty principle?`,
              ans: md`(f) $\psi_1 \propto e^{i\pi x/a}$. (g) $E = \tfrac{\pi^2\hbar^2}{2ma^2}$ with certainty; state unchanged. (h) The same values. (i) Both 0. (j) Any $x$, all equally likely; $\sigma_x = \infty$. (k) Yes in spirit (sharp $p$, no idea of $x$), but $\sigma_x\sigma_p = \infty\cdot0$ is undefined: a plane wave is not normalizable.`,
              sol: md`
                **(f)** Collapse onto the momentum eigenstate, the plane wave $e^{ikx}$ with $k = \pi/a$. (Allowed: $P(\pi/a) \ne 0$. A reading of $2\pi\hbar/a$ was impossible.)

                **(g)** Free particle: $\hat H = \hat p^2/2m$, so a momentum eigenstate is an energy eigenstate. $E = p^2/2m = \pi^2\hbar^2/2ma^2$, certain; the state does not change. (Twist: $-\pi\hbar/a$ has the same energy. Measuring $E$ *first* would leave a superposition of $e^{\pm i\pi x/a}$, and then $p$ would be $\pm\pi\hbar/a$ at random.)

                **(h)** Stationary: it only gains $e^{-iEt/\hbar}$, a global phase. Same $E$, same $p$.

                **(i)** Eigenstate of both: $\sigma_p = \sigma_E = 0$.

                **(j)** $|e^{ikx}|^2 = 1$ everywhere: every position equally likely, $\sigma_x = \infty$.

                **(k)** Perfect momentum knowledge, zero position knowledge: the uncertainty principle at its extreme. But the product is not a finite number because the plane wave is an idealization; real states are packets.
              `,
            },
          ]),
          drill,
          P({
            title: 'Alice\'s spread',
            q: md`For Alice's photons (0 with probability ½, ±1 with ¼ each), find $\sigma_A$.`,
            parts: [{ lbl: '\\sigma_A', ans: Math.sqrt(0.5) }],
            hints: [md`$\langle A^2\rangle = \tfrac14 + \tfrac14$.`],
            sol: md`$\langle A\rangle = 0$, $\langle A^2\rangle = \tfrac12$, $\sigma_A = 0.707$.`,
          }),
          P({
            title: 'Reading the sinc',
            q: md`For $P(k) = \tfrac{2}{\pi a}\tfrac{\sin^2(ka/2)}{k^2}$, find $P(\pi/a)/P(0)$ and the smallest positive momentum that is **never** measured.`,
            parts: [{ lbl: 'P(\\pi/a)/P(0)', ans: 4 / Math.PI ** 2 }, { lbl: 'p_{\\text{never}}', expr: '2*pi*hbar/a', vars: { hbar: [0.5, 2], a: [0.5, 2] } }],
            hints: [md`$P(0) = \tfrac{2}{\pi a}\cdot\tfrac{a^2}{4}$ (limit of $\sin^2u/u^2 \to 1$).`],
            sol: md`$P(0) = \tfrac{a}{2\pi}$, $P(\pi/a) = \tfrac{2a}{\pi^3}$: ratio $4/\pi^2 = 0.405$. First zero at $ka/2 = \pi$: $p = 2\pi\hbar/a = h/a$.`,
          }),
          Q(md`Bob's apparatus gives 0 on all 10 photons Alice prepared in $\ket0$. The strongest valid conclusion is…`, [md`$\ket0$ is (probably) an eigenstate of $\hat B$ with eigenvalue 0`, md`$\hat B = \hat A$`, md`$\hat B$ has only the eigenvalue 0`, md`$\hat B$ commutes with $\hat A$`], 0,
            [null, md`$\hat B$'s other eigenstates could be mixtures of $\ket{\pm1}$.`, 'He never fed it any other state.', 'Sharing one eigenvector does not imply commuting.'],
            'One shared eigenvector is all the data supports.'),
          Q(md`A free particle is measured to have energy $E$ first, then momentum. The momentum reading is…`, [md`$+\sqrt{2mE}$ or $-\sqrt{2mE}$, at random`, md`$+\sqrt{2mE}$ always`, '0', md`$\sqrt{2mE}/2$`], 0,
            [null, 'E does not fix the direction: the eigenvalue E is degenerate.', 'Only if E = 0.', 'No.'],
            md`$e^{\pm ikx}$ share the energy; the energy measurement leaves a superposition of both.`),
        ],
      },

      // ------------------------------------------------------------------ D2
      {
        id: 'disc2', title: 'Discussion 2: the infinite well, symmetry, reading a density',
        steps: [
          R(md`
            **Trains:** boundary conditions and symmetry in the infinite well (${T(5, 't5-isw')}), expanding a state and predicting energy outcomes (${T(4, 't4-stationary')}), and what a measured density can and cannot tell you.

            **Moves to steal:** (1) energies can only depend on $m$, $L$, $\hbar$, never on where you put the origin; (2) reflect about the center to kill coefficients without integrating; (3) normalization is information: it can fix an unknown length; (4) a cross term in $|\psi|^2$ means a superposition with a definite relative phase, and it oscillates in time.
          `),
          paper('PHYS 486 · Discussion 2', '9/10', [
            {
              q: md`**(a) Same well, origin at the center** (walls at $\pm L/2$). Does the spectrum change? The eigenstates? Which are even and which odd?`,
              ans: md`Spectrum unchanged. $\psi_n = \sqrt{2/L}\cos(n\pi x/L)$ ($n$ odd, even functions), $\sqrt{2/L}\sin(n\pi x/L)$ ($n$ even, odd functions).`,
              sol: md`Moving the origin relabels $x$; the physical system is identical, and $E_n$ can only be built from $m$, $L$, $\hbar$. The formulas change: substitute $x \to x + L/2$ in $\sin(n\pi x/L)$ to get $\pm\cos$ for odd $n$, $\pm\sin$ for even $n$ (drop the signs: global phases). Both vanish at $\pm L/2$ ✓. Even, odd, even, … starting from an even ground state: exactly what a symmetric potential promises, now visible because the coordinates respect the symmetry.`,
            },
            {
              q: md`**(b)** In the well $[0, L]$: $\Psi(x,0) = A$ on $(0, L/2)$, $-A$ on $(L/2, L)$. Lowest possible energy outcome? $P(E_1)$? (No integrals for the first part.)`,
              ans: md`$P(E_1) = 0$; the lowest possible outcome is $E_2 = \tfrac{2\pi^2\hbar^2}{mL^2}$ (with $P(E_2) = 8/\pi^2 = 0.81$).`,
              sol: md`
                Reflect about the center, $x \to L - x$: $\Psi$ flips sign (odd about $L/2$), while $\psi_n(L - x) = (-1)^{n+1}\psi_n(x)$, so odd $n$ are even about the center. Then $c_n$ for odd $n$ integrates (even)(odd) over a symmetric interval: **zero**. So $c_1 = 0$.

                Symmetry only rules things out, so check $c_2$: with $A = 1/\sqrt L$, $c_2 = \tfrac{\sqrt2}{L}\left[\tfrac L\pi + \tfrac L\pi\right] = \tfrac{2\sqrt2}{\pi} \ne 0$. Lowest outcome $E_2 = 4E_1$, with probability $8/\pi^2$.

                (Aside: the jump at $L/2$ makes $\langle H\rangle$ infinite; sharp edges cost unbounded kinetic energy.)
              `,
            },
            {
              q: md`**(c) A neutron beam.** 1000 neutrons each in $\psi = \tfrac{1}{10}e^{ik_0x}$ for $0 < x < d$ (lengths in nm), $k_0 = \pi/20\ \text{nm}^{-1}$. Find $d$. Is this one 1000-neutron state or 1000 copies? How does it differ from infinite-well eigenstates?`,
              ans: md`$d = 100$ nm. 1000 independent copies of a one-neutron state. Unlike $\sin(n\pi x/d)$, it does not vanish at the edges: a free traveling wave chopped to a region, not a standing wave of a box.`,
              sol: md`Normalize: $\int_0^d|\tfrac1{10}|^2dx = d/100 = 1 \Rightarrow d = 100$ nm. The height fixes the width. $|\psi|^2$ is a one-particle density, a function of one $x$; a true 1000-particle state would depend on 1000 coordinates. So the density of neutrons is $1000|\psi|^2$. Box eigenstates are real standing waves with nodes at the walls; this one carries momentum $\hbar k_0$ and jumps at the edges.`,
            },
            {
              q: md`**(d) Reading a density.** 1000 neutrons in a well $[0, L]$ have measured density $\rho(x) = 1000\left[\tfrac{1}{10}\sin^2(\pi x) + \tfrac{9}{10}\sin^2\left(\tfrac{15\pi x}{2}\right) + \tfrac35\cos\tfrac\pi3\sin(\pi x)\sin\left(\tfrac{15\pi x}{2}\right)\right]$. What does the cross term tell you? Which $L$ satisfy the boundary conditions? Pin down $L$, the quantum numbers and $|c_n|^2$. Is it stationary?`,
              ans: md`Superposition of two eigenstates with a definite relative phase. BCs allow $L = 2, 4, 6, \ldots$; normalization gives $L = 2$ nm. Then $n = 2$ and $n = 15$, $|c_2|^2 = \tfrac1{10}$, $|c_{15}|^2 = \tfrac{9}{10}$, relative phase $\pi/3$. Not stationary: the cross term oscillates at $(E_{15} - E_2)/\hbar$.`,
              sol: md`
                **Cross term.** $|c_1\psi_1 + c_2\psi_2|^2 = |c_1|^2\psi_1^2 + |c_2|^2\psi_2^2 + 2|c_1||c_2|\cos\varphi\,\psi_1\psi_2$: its presence means a superposition, and $\varphi$ is the relative phase.

                **BCs.** $\sin(\pi L) = 0$ needs integer $L$; $\sin(15\pi L/2) = 0$ needs $15L/2$ integer. Both: $L$ even.

                **Normalization** fixes it: the cross term integrates to 0 (orthogonality), each $\sin^2$ gives $L/2$: $1000\left(\tfrac{1}{10} + \tfrac{9}{10}\right)\tfrac L2 = 1000 \Rightarrow L = 2$. With $L = 2$, $\psi_n \propto \sin(n\pi x/2)$: $\sin(\pi x)$ is $n = 2$, $\sin(15\pi x/2)$ is $n = 15$. (Note $\sqrt{2/L} = 1$ here, so the weights are directly $|c_n|^2$.) Check: $2\sqrt{\tfrac1{10}\cdot\tfrac9{10}} = \tfrac35$ ✓, leaving $\cos(\pi/3)$ as the relative phase.

                **Time.** Each term gets $e^{-iE_nt/\hbar}$, so the phase becomes $\tfrac\pi3 - \tfrac{(E_{15} - E_2)t}{\hbar}$: the density sloshes at $\omega = \tfrac{(225 - 4)\pi^2\hbar}{2mL^2}$. What you were given is a snapshot at an unknown time.
              `,
            },
            {
              q: md`**(e)** Can a measured density $|\psi(x)|^2$ ever determine the state completely?`,
              ans: md`Never: $\psi$ and $\psi^*$ have the same density but opposite momenta. (Plus an unobservable global phase.)`,
              sol: md`Complex conjugation reverses every momentum ($e^{ikx} \to e^{-ikx}$) yet $|\psi^*|^2 = |\psi|^2$. A position density cannot tell a state from its time-reverse; you also need, e.g., momentum data or the density at another time.`,
            },
          ]),
          drill,
          P({
            title: 'Antisymmetric step: probability',
            q: md`For the step state of (b), find $P(E_2)$.`,
            parts: [{ lbl: 'P(E_2)', ans: 8 / Math.PI ** 2 }],
            hints: [md`$c_2 = 2\sqrt2/\pi$.`],
            sol: md`$8/\pi^2 = 0.811$. The rest is spread over $n = 6, 10, \ldots$ and other even $n$.`,
          }),
          P({
            title: 'Height fixes width',
            q: md`A flat state $\psi = \tfrac15e^{ik_0x}$ (in $\text{nm}^{-1/2}$) on $0 < x < d$. Find $d$.`,
            parts: [{ lbl: 'd', ans: 25, unit: 'nm' }],
            hints: [md`$d\cdot\tfrac1{25} = 1$.`],
            sol: md`$d = 25$ nm.`,
          }),
          P({
            title: 'Read off the quantum numbers',
            q: md`A density in a well $[0, L]$ (lengths in nm) is $\tfrac15\sin^2(\pi x) + \tfrac45\sin^2(3\pi x) + (\text{cross term})$. Normalization gives $L$; then which $n$ are present?`,
            parts: [{ lbl: 'L', ans: 2, unit: 'nm' }, { lbl: 'n_1', ans: 2 }, { lbl: 'n_2', ans: 6 }],
            hints: [md`$\left(\tfrac15 + \tfrac45\right)\tfrac L2 = 1$. Then match $n\pi x/L$.`],
            sol: md`$L = 2$; $\sin(\pi x) = \sin(2\pi x/2)$: $n = 2$; $\sin(3\pi x) = \sin(6\pi x/2)$: $n = 6$.`,
          }),
          P({
            title: 'Sloshing rate',
            q: md`In (d), give $\omega$ in units of $\pi^2\hbar/2mL^2$.`,
            parts: [{ lbl: '\\omega', ans: 221 }],
            hints: [md`$E_n \propto n^2$.`],
            sol: md`$15^2 - 2^2 = 221$.`,
          }),
          Q(md`Two states give identical $|\psi(x)|^2$ at $t = 0$. Which could they be?`, [md`$\psi$ and $\psi^*$`, md`$\psi_1 + \psi_2$ and $\psi_1 - \psi_2$`, md`$\psi_1 + \psi_2$ and $\psi_1 + i\psi_2$`, md`$\psi_2$ and $\psi_3$`], 0,
            [null, 'The cross term flips sign.', 'The cross term changes (cos φ from 1 to 0).', 'Different shapes.'],
            md`$|\psi^*|^2 = |\psi|^2$; momentum reversed.`),
        ],
      },

      // ------------------------------------------------------------------ D3
      {
        id: 'disc3', title: 'Discussion 3: wave packets meet barriers; inverting the Schrödinger equation',
        steps: [
          R(md`
            **Trains:** reading momentum content off a superposition of plane waves (${T(6, 't6-free')}), the length scales of tunneling (${T(7, 't7-fsw')}), and running the Schrödinger equation backwards (${T(4, 't4-stationary')}).

            **Moves to steal:** expand $\cos$ with Euler to see plane waves; compare every length with the one the equation itself builds ($1/\kappa$ or $1/k$); $V(x) = E + \tfrac{\hbar^2}{2m}\tfrac{\psi''}{\psi}$; reconstruct from the node-free ground state.
          `),
          paper('PHYS 486 · Discussion 3', '9/17', [
            {
              q: md`**1 (a–b).** $\Psi(x,0) = Ae^{ik_0x}\left[1 + \cos\tfrac{\Delta k\,x}{2}\right]$, $0 < \Delta k < 2k_0$. (a) Possible momentum outcomes and probabilities? Definite $p$? A wave packet? How to prepare it? (b) The central maximum of $|\Psi|^2$ spans $x_0 \pm \Delta x/2$: find $x_0$, $\Delta x$. Does the particle stay localized? Find $\Delta p$ and $\Delta x\Delta p$.`,
              ans: md`(a) $\hbar k_0$ with $\tfrac23$; $\hbar(k_0 \pm \Delta k/2)$ with $\tfrac16$ each. Not definite; not a normalizable packet (three plane waves). Overlap three beams with amplitudes $2 : 1 : 1$. (b) $x_0 = 0$, $\Delta x = 4\pi/\Delta k$; no, the lobes repeat forever; $\Delta p = \hbar\Delta k$, $\Delta x\Delta p = 4\pi\hbar$.`,
              sol: md`
                **(a)** Euler: $\Psi = A\left[e^{ik_0x} + \tfrac12e^{i(k_0 + \Delta k/2)x} + \tfrac12e^{i(k_0 - \Delta k/2)x}\right]$. Three momentum eigenstates with amplitudes $1 : \tfrac12 : \tfrac12$, probabilities $\propto 1 : \tfrac14 : \tfrac14$, i.e. $\tfrac23, \tfrac16, \tfrac16$. A sum of three plane waves is periodic and not normalizable, so not a true packet (that needs a continuum of $k$).

                **(b)** $|\Psi|^2 = |A|^2(1 + \cos\tfrac{\Delta k\,x}{2})^2$: maximum at 0, zeros where $\tfrac{\Delta k\,x}{2} = \pm\pi$. So $\Delta x = 4\pi/\Delta k$. Periodic: the lobe repeats forever, $\sigma_x$ would be infinite. Momenta span $\hbar\Delta k$: $\Delta x\Delta p = 4\pi\hbar$, far above $\hbar/2$ (a Gaussian would saturate it). To localize, add a continuum of $k$'s: a smooth $\phi(k)$.
              `,
            },
            {
              q: md`**1 (c–d).** The state hits a barrier $V_0$ on $0 < x < L$ from the left. For which $k_0, \Delta k$ is the transmitted wave ($x > L$) a state of definite energy? What does that say about packets and stationary states?`,
              ans: md`Only $\Delta k = 0$ (any $k_0$). A packet, having a spread of $k$, is never a stationary state of the free region.`,
              sol: md`Scattering preserves each $k$ (energy is conserved, and outside $V = 0$, $E = \hbar^2k^2/2m$). The transmitted wave contains $k_0$ and $k_0 \pm \Delta k/2$; one energy needs one $|k|$, so $\Delta k = 0$. Then before and after the barrier, $p = \hbar k_0$ and $E = \hbar^2k_0^2/2m$ are definite. Moral: stationary states have one energy; packets never do.`,
            },
            {
              q: md`**1 (e–f).** Inside the barrier, with definite energy $E$: what length should $L$ be compared with, for $E < V_0$ and $E > V_0$? Name the dimensionless numbers and discuss the limits $V_0 \gg E$, $V_0 \ll E$, $L \ll \ell$, $L \gg \ell$.`,
              ans: md`$E < V_0$: $\ell = 1/\kappa = \hbar/\sqrt{2m(V_0 - E)}$, the penetration depth. $E > V_0$: $\ell = 1/k = \hbar/\sqrt{2m(E - V_0)}$, the (reduced) local wavelength. Ratios $V_0/E$ and $L/\ell$. High barrier: near-total reflection. Low barrier: free. Thin ($L \ll 1/\kappa$): nearly full transmission. Thick: $T \sim e^{-2L/\ell}$.`,
              sol: md`
                Inside, $\psi'' = \tfrac{2m}{\hbar^2}(V_0 - E)\psi$. The sign decides: positive → $e^{\pm\kappa x}$, decaying over $1/\kappa$; negative → oscillating with wavelength $2\pi/k$, longer than the free one because the kinetic energy is reduced to $E - V_0$.

                Two energies and two lengths → two ratios: $V_0/E$ and $L/\ell$ (and $\ell$ itself depends on $V_0/E$, so changing $V_0$ at fixed $L$ changes both).
                - $V_0 \gg E$: $\kappa \to \infty$, decay instant: total reflection.
                - $V_0 \ll E$: $k \to \sqrt{2mE}/\hbar$, the barrier is invisible: free particle.
                - $L \ll 1/\kappa$: inside, $e^{-\kappa x} \approx 1 - \kappa x$, a nearly straight line; the wave barely decays before exiting: transmission close to 1, however high the barrier.
                - $L \gg 1/\kappa$: exponential suppression, $T \approx \tfrac{16E(V_0 - E)}{V_0^2}e^{-2\kappa L}$.
              `,
            },
            {
              q: md`**2 (a–b). Discovering interactions.** (a) Given one eigenstate $\psi(x)$ and its energy $E$, find $V(x)$. What happens at nodes? (b) Bob measures the ground state $\psi_0 = Ae^{-\alpha^4x^4/4}$ with $E_0 = \hbar^2\alpha^2/m$. Find $V$; sketch; where are the minima? Compare $V(0)$ with $E_0$.`,
              ans: md`(a) $V = E + \tfrac{\hbar^2}{2m}\tfrac{\psi''}{\psi}$; at a node $\psi''/\psi$ is $0/0$ (take a limit; better, use a node-free state). (b) $V = \tfrac{\hbar^2\alpha^2}{2m}\left[(\alpha x)^6 - 3(\alpha x)^2 + 2\right]$: a symmetric double well, minima $V = 0$ at $x = \pm1/\alpha$, $V(0) = E_0$.`,
              sol: md`
                **(a)** Divide the time-independent equation by $\psi$. Every point of $\psi$ gives $V$ at that point. At a node, $\psi''$ also vanishes (the equation forces it), so the ratio is indeterminate there; the ground state has no nodes and is the safe choice.

                **(b)** $\psi_0' = -\alpha^4x^3\psi_0$, $\psi_0'' = (\alpha^8x^6 - 3\alpha^4x^2)\psi_0$. So
                $$V = \frac{\hbar^2\alpha^2}{m} + \frac{\hbar^2}{2m}(\alpha^8x^6 - 3\alpha^4x^2) = \frac{\hbar^2\alpha^2}{2m}\left[(\alpha x)^6 - 3(\alpha x)^2 + 2\right]$$
                $dV/dx = 0$ at $u = \alpha x = 0, \pm1$: a hump at 0 and minima $V(\pm1/\alpha) = 0$. Growing like $x^6$ outside, which is why $\psi_0$ dies so fast ($e^{-x^4}$).

                **$V(0) = E_0$ is no coincidence:** $\psi_0''(0) = 0$ (it is flat-topped), so the formula gives $V(0) = E_0$ exactly. Zero curvature means zero kinetic energy there: the ground state sits right at the top of the central hump.
              `,
            },
            {
              q: md`**2 (c).** Alice measures $E_0$, $E_1$ and the relation $\psi_1 = \sinh(\alpha x)\,\psi_0$. Find $\psi_0$ and $V$. Which state should not be used for the reconstruction? What must $E_1 - E_0$ satisfy for $\psi_1$ to be normalizable?`,
              ans: md`$\psi_0 = A\,\text{sech}^\lambda(\alpha x)$ with $\lambda = \tfrac12 + \tfrac{m(E_1 - E_0)}{\hbar^2\alpha^2}$. $V = E_0 + \tfrac{\hbar^2\alpha^2}{2m}\left[\lambda^2 - \lambda(\lambda + 1)\text{sech}^2(\alpha x)\right]$. Don't use $\psi_1$ (node at 0). Need $\lambda > 1$: $E_1 - E_0 > \tfrac{\hbar^2\alpha^2}{2m}$.`,
              sol: md`
                **Eliminate $V$.** Both states give the same $V$: $E_0 + \tfrac{\hbar^2}{2m}\tfrac{\psi_0''}{\psi_0} = E_1 + \tfrac{\hbar^2}{2m}\tfrac{\psi_1''}{\psi_1}$. With $\psi_1 = \sinh(\alpha x)\psi_0$: $\tfrac{\psi_1''}{\psi_1} = \alpha^2 + 2\alpha\coth(\alpha x)\tfrac{\psi_0'}{\psi_0} + \tfrac{\psi_0''}{\psi_0}$. The $\psi_0''$ terms cancel:
                $$\frac{\psi_0'}{\psi_0} = -\lambda\alpha\tanh(\alpha x), \qquad \lambda = \frac12 + \frac{m(E_1 - E_0)}{\hbar^2\alpha^2}$$
                Integrate: $\psi_0 = A\,\text{sech}^\lambda(\alpha x)$: no nodes ✓; $\psi_1$ has one node, at $x = 0$ ✓.

                **Potential.** $\tfrac{\psi_0''}{\psi_0} = \left(\tfrac{\psi_0'}{\psi_0}\right)' + \left(\tfrac{\psi_0'}{\psi_0}\right)^2 = \lambda^2\alpha^2 - \lambda(\lambda + 1)\alpha^2\text{sech}^2(\alpha x)$, giving the stated $V$: a smooth well of depth set by $\lambda(\lambda + 1)$ (the Pöschl–Teller well). Use $\psi_0$, not $\psi_1$, whose node makes the ratio $0/0$.

                **Normalizability.** At large $|x|$, $\psi_1 \sim e^{\alpha|x|}e^{-\lambda\alpha|x|}$: decays only if $\lambda > 1$, i.e. $E_1 - E_0 > \hbar^2\alpha^2/2m$. A check Alice can run on data she already has.
              `,
            },
          ]),
          drill,
          P({
            title: 'Three equal beams',
            q: md`$\Psi = Ae^{ik_0x}\left[1 + 2\cos(\Delta k\,x)\right]$. What is $P(\hbar k_0)$?`,
            parts: [{ lbl: 'P(\\hbar k_0)', ans: 1 / 3 }],
            hints: [md`$2\cos u = e^{iu} + e^{-iu}$: amplitudes $1 : 1 : 1$.`],
            sol: md`Equal amplitudes: $\tfrac13$ each.`,
          }),
          P({
            title: 'Single-sech well',
            q: md`A ground state $\psi_0 = A\,\text{sech}(\alpha x)$ ($\lambda = 1$). Using $V = E_0 + \tfrac{\hbar^2}{2m}\tfrac{\psi_0''}{\psi_0}$, find $V(0) - E_0$.`,
            parts: [{ lbl: 'V(0) - E_0', expr: '-hbar^2*alpha^2/(2*m)', vars: { hbar: [0.5, 2], alpha: [0.5, 2], m: [0.5, 2] } }],
            hints: [md`$\psi_0''/\psi_0 = \alpha^2\left[1 - 2\,\text{sech}^2(\alpha x)\right]$.`],
            sol: md`At $x = 0$: $\alpha^2(1 - 2) = -\alpha^2$, so $V(0) - E_0 = -\tfrac{\hbar^2\alpha^2}{2m}$. The ground state lies above the bottom, as it must.`,
          }),
          P({
            title: 'Normalizability threshold',
            q: md`In 2(c), what is the smallest energy gap $E_1 - E_0$ consistent with a normalizable $\psi_1$?`,
            parts: [{ lbl: '(E_1 - E_0)_{\\min}', expr: 'hbar^2*alpha^2/(2*m)', vars: { hbar: [0.5, 2], alpha: [0.5, 2], m: [0.5, 2] } }],
            hints: [md`$\lambda > 1$.`],
            sol: md`$\lambda = 1 \Rightarrow E_1 - E_0 = \hbar^2\alpha^2/2m$.`,
          }),
          Q(md`To reconstruct $V(x)$ from one measured eigenstate, the best choice is…`, ['the ground state, because it has no nodes', 'the highest state measured, because it is most accurate', 'any state; the formula works the same everywhere', 'the first excited state, because it is odd'], 0,
            [null, 'Accuracy is not the issue.', 'At nodes the formula is 0/0.', 'Its node at 0 makes ψ″/ψ indeterminate there.'],
            md`$\psi''/\psi$ is undefined where $\psi = 0$.`),
          Q(md`A barrier much thinner than $1/\kappa$ (with $E < V_0$) transmits…`, ['almost everything, however high it is', 'almost nothing', 'exactly half', 'only if E > V₀'], 0,
            [null, 'That is the thick limit.', 'No special reason.', 'Tunneling needs no E > V₀.'],
            md`Over $L \ll 1/\kappa$ the wave barely decays: $e^{-\kappa L} \approx 1$.`),
        ],
      },

      // ------------------------------------------------------------------ D4
      {
        id: 'disc4', title: 'Discussion 4: energy conservation, mixtures, a paradox, qubit geometry',
        steps: [
          R(md`
            **Trains:** using the postulates as a proof tool (${T(2, 't2-postulates')}), compatible vs incompatible observables (${T(9, 't9-uncertainty')}), and the Bloch-sphere picture of a two-level Hamiltonian (${T(10, 't10-qubit')}).

            **Moves to steal:** expand in the energy basis and watch only phases move; superposition = add amplitudes then square, mixture = add probabilities; when a "probability" has units, something was not normalizable; any $2\times2$ Hermitian $H$ is $\vec a\cdot\vec\sigma$ plus a constant: an axis on the sphere.
          `),
          paper('PHYS 486 · Discussion 4', '9/24', [
            {
              q: md`**1 (a) Energy conservation.** For time-independent $\hat H$, prove $\langle H\rangle$ and the whole distribution of energy outcomes are constant. Does this require a stationary state? What does change?`,
              ans: md`$c_n(t) = c_n(0)e^{-iE_nt/\hbar}$, so $P(E_n) = |c_n|^2$ and every moment are constant, for any state. What changes: the relative phases, and so any observable that does not commute with $\hat H$.`,
              sol: md`Expand in energy eigenstates (postulate 1, completeness): $\ket{\psi(0)} = \sum c_n(0)\ket n$. The Schrödinger equation projected on $\bra n$ gives $i\hbar\dot c_n = E_nc_n$, so $c_n(t) = c_n(0)e^{-iE_nt/\hbar}$. Born: $P(E_n, t) = |c_n(t)|^2 = |c_n(0)|^2$. Hence $\langle H\rangle = \sum|c_n|^2E_n$ and $\sigma_H$ are constant. No stationary state needed: "energy is conserved" is a statement about the energy *distribution*. The state itself changes through relative phases, moving e.g. $\langle x\rangle$ in a box or $\langle\sigma_z\rangle$ for a qubit.`,
            },
            {
              q: md`**1 (b) Superposition vs mixture.** Prepare either $\alpha_1\ket1 + \alpha_2\ket2$ (eigenstates of $\hat A$) or a mixture: a fraction $|\alpha_i|^2$ of systems in $\ket i$. Compare the statistics of $\hat A$, then of $\hat B$ with eigenvector $\ket{b_1}$, $\beta_i = \braket{b_1|i}$. When do they agree? Can a state vector describe the mixture?`,
              ans: md`Same for $\hat A$: $P(a_i) = |\alpha_i|^2$. For $\hat B$: $P_{\text{sup}} = |\alpha_1\beta_1 + \alpha_2\beta_2|^2$ has the extra interference term $2\text{Re}(\alpha_1\alpha_2^*\beta_1\beta_2^*)$, absent from $P_{\text{mix}} = |\alpha_1|^2|\beta_1|^2 + |\alpha_2|^2|\beta_2|^2$. They agree when that term vanishes (e.g. $\hat B$ shares $\hat A$'s eigenbasis). No state vector reproduces a mixture (needs a density matrix).`,
              sol: md`
                **Superposition:** one amplitude, then square: $\braket{b_1|\psi} = \alpha_1\beta_1 + \alpha_2\beta_2$. **Mixture:** probabilities weighted by probabilities: $\sum|\alpha_i|^2|\beta_i|^2$. Both share the two "classical" terms; only the superposition has the cross term, which carries the relative phase of $\alpha_1$ and $\alpha_2$ (the same object as the cross term in Discussion 2's density).

                Measuring $\hat A$ (or anything commuting with it) can never tell them apart. To distinguish, measure an observable whose eigenstates mix $\ket1$ and $\ket2$: one that does **not** commute with $\hat A$.

                A state vector matching the mixture for $\hat A$ must have $|\braket{i|\psi}| = |\alpha_i|$, and then some $\hat B$ (choose $\ket{b_1} = (\ket1 + e^{i\theta}\ket2)/\sqrt2$ with a suitable $\theta$) shows a nonzero cross term the mixture lacks. Contradiction: mixtures need a new object (the density matrix).
              `,
            },
            {
              q: md`**1 (c–d) A paradox.** A particle in the infinite-well ground state is found at exactly $x = L/2$. Which state is it in now? What are the probabilities of each energy result? Which energies are excluded? Do the probabilities sum to 1? What went wrong?`,
              ans: md`$\delta(x - L/2)$, regardless of the earlier state. $|c_n|^2 = |\psi_n(L/2)|^2 = 2/L$ for odd $n$, 0 for even $n$. The "probabilities" have units 1/length and sum to $\infty$: an exact position eigenstate is not normalizable. Position and energy are incompatible.`,
              sol: md`
                Collapse erases the prior state: now $\ket{x = L/2}$. The prior state only set the odds of getting $L/2$.

                $c_n = \braket{\psi_n|x = L/2} = \psi_n(L/2) = \sqrt{2/L}\sin(n\pi/2)$: $|c_n|^2 = 2/L$ for odd $n$, 0 for even $n$. Even-$n$ states have a node at the center; a particle found there cannot be in them. That part is robust (any symmetric detector window).

                Sum: infinite, and with units 1/length. **Dimensional check first:** a probability must be dimensionless, so something was not normalizable: $\braket{x|x} = \delta(0)$. Each step followed the postulates; the false input was "position measured with infinite precision". Physically: a sharp position measurement leaves an enormous energy spread. $\hat x$ and $\hat H$ do not commute.
              `,
            },
            {
              q: md`**2. Qubit geometry.** $\hat H = \hbar\omega\begin{pmatrix}\alpha & \beta\\ \beta & -\alpha\end{pmatrix}$ ($\alpha, \beta$ real). (a) Write it with projectors and Paulis; is it Hermitian? Write it as $\hbar\omega R\,\hat n\cdot\vec\sigma$; eigenvalues? (b) Extension: starting in $\ket0$, what is the largest probability of ever finding $\ket1$, and how fast does it oscillate?`,
              ans: md`(a) $\hat H = \hbar\omega(\alpha\sigma_z + \beta\sigma_x)$, Hermitian (real symmetric). $\hat n = (\beta, 0, \alpha)/R$, $R = \sqrt{\alpha^2 + \beta^2}$; $E_\pm = \pm\hbar\omega R$. (b) $P_1(t) = \tfrac{\beta^2}{\alpha^2 + \beta^2}\sin^2(\omega Rt)$: maximum $\beta^2/R^2$.`,
              sol: md`
                **(a)** $\sigma_z = \ket0\bra0 - \ket1\bra1$, $\sigma_x = \ket0\bra1 + \ket1\bra0$, so $\hat H = \hbar\omega[\alpha(\ket0\bra0 - \ket1\bra1) + \beta(\ket0\bra1 + \ket1\bra0)]$. Real symmetric → Hermitian (it needed real $\alpha, \beta$). With $\vec n = (\beta, 0, \alpha)$: $\hat H = \hbar\omega\vec n\cdot\vec\sigma = \hbar\omega R\,\hat n\cdot\vec\sigma$. Since $(\hat n\cdot\vec\sigma)^2 = I$, eigenvalues $\pm1$, so $E_\pm = \pm\hbar\omega R$. The eigenstates point along $\pm\hat n$, in the $x$–$z$ plane at angle $\theta = \arctan(\beta/\alpha)$ from $z$.

                **(b)** $\hat H = \tfrac\hbar2(2\omega R)\hat n\cdot\vec\sigma$ rotates the Bloch vector about $\hat n$ at rate $2\omega R$. Starting at the north pole, the vector sweeps a cone around $\hat n$ and gets as far south as angle $2\theta$ from $z$, where $P_1 = \sin^2\theta = \beta^2/R^2$. In time: $P_1 = \sin^2\theta\,\sin^2(\omega Rt)$. Full flips only if $\alpha = 0$ (axis on the equator): this is resonance in Rabi oscillations.
              `,
            },
          ]),
          drill,
          P({
            title: 'Superposition vs mixture, in numbers',
            q: md`$\alpha_1 = \alpha_2 = \tfrac1{\sqrt2}$ and $\ket{b_1} = \tfrac{1}{\sqrt2}(\ket1 + \ket2)$. Find $P(b_1)$ for the superposition and for the mixture.`,
            parts: [{ lbl: 'P_{\\text{sup}}', ans: 1 }, { lbl: 'P_{\\text{mix}}', ans: 0.5 }],
            hints: [md`$\beta_1 = \beta_2 = \tfrac{1}{\sqrt2}$.`],
            sol: md`Superposition: $|\tfrac12 + \tfrac12|^2 = 1$ (it *is* $\ket{b_1}$). Mixture: $\tfrac12\cdot\tfrac12 + \tfrac12\cdot\tfrac12 = \tfrac12$.`,
          }),
          P({
            title: 'Qubit Hamiltonian',
            q: md`$\hat H = \hbar\omega(3\sigma_z + 4\sigma_x)$. Find $E_+/\hbar\omega$ and the maximum probability of reaching $\ket1$ from $\ket0$.`,
            parts: [{ lbl: 'E_+/\\hbar\\omega', ans: 5 }, { lbl: 'P_{1,\\max}', ans: 0.64 }],
            hints: [md`$R = \sqrt{9 + 16}$; $P_{\max} = \beta^2/R^2$.`],
            sol: md`$R = 5$; $P_{\max} = 16/25 = 0.64$.`,
          }),
          Q(md`A particle in a box has a constant $\langle H\rangle$. Which must be true?`, ['Nothing more: the state may still change (relative phases)', 'It is in a stationary state', 'Its position density is frozen', 'All its expectation values are constant'], 0,
            [null, 'Any superposition also has constant ⟨H⟩.', 'Only for a stationary state.', md`$\langle x\rangle$ can slosh.`],
            md`$\langle H\rangle$ is constant for every state when $\hat H$ has no explicit time dependence.`),
          Q(md`A computed "probability" comes out with units of 1/length. The first thing to suspect:`, ['a non-normalizable state (like an exact position eigenstate) was used', 'an algebra slip', 'the probability is actually a density and is fine', 'a units convention'], 0,
            [null, 'Possible, but the units point to the input.', 'A probability of a discrete energy must be dimensionless.', 'Units are not conventions.'],
            md`$\braket{x|x} = \delta(0)$: delta-normalized states give densities, not probabilities.`),
          Q(md`To distinguish a 50/50 superposition of $\ket1, \ket2$ from a 50/50 mixture, measure…`, [md`an observable whose eigenstates mix $\ket1$ and $\ket2$`, md`$\hat A$ itself, many times`, md`the energy, if $\ket1, \ket2$ are energy eigenstates`, 'nothing can distinguish them'], 0,
            [null, md`$\hat A$ statistics are identical by construction.`, 'Same: energy eigenbasis is the A eigenbasis here.', 'Interference terms can.'],
            'Only incompatible observables see the relative phase.'),
        ],
      },
    ],
  });
})();

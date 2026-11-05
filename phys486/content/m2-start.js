/* Midterm 2 — Start here: how Midterm 1 (Fall 2026) was built and graded, the real Midterm 1 typed with its official
   solutions and rubric, and the exam moves for Midterm 2. Unit 'm2-start'. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;

  // ---------------------------------------------------------------- figures for the real Midterm 1
  const S = Math.sin, PI = Math.PI;
  const box = (f, lab, cls) => PF.plot({
    w: 230, h: 150, x: [-0.08, 1.12], y: [-1.6, 2.1], zero: true, xl: 'x', ml: 18, mr: 26,
    xt: [[0, '0'], [0.5, 'L/2'], [1, 'L']],
    curves: [{ f, from: 0, to: 1, cls: cls || '' }, { pts: [[0, -1.6], [0, 2.1]], cls: 'dim' }, { pts: [[1, -1.6], [1, 2.1]], cls: 'dim' }],
    vlines: [[0.5, '']],
  });
  const before = box((x) => S(PI * x) + S(2 * PI * x));
  const after1 = box((x) => Math.SQRT2 * S(PI * x));
  const after2 = box((x) => Math.SQRT2 * S(2 * PI * x));
  const minus = box((x) => S(PI * x) - S(2 * PI * x), '', 'acc');
  const figC = PF.row([{ svg: before, cap: 'before: $\\Psi(x,0)\\propto\\psi_1+\\psi_2$' }, { svg: after1, cap: 'after $+1$: $\\psi_1$' }, { svg: after2, cap: 'after $-1$: $\\psi_2$' }]);
  const figD = PF.row([{ svg: before, cap: '$\\braket{x|+}=\\tfrac{1}{\\sqrt2}(\\psi_1+\\psi_2)$: left' }, { svg: minus, cap: '$\\braket{x|-}=\\tfrac{1}{\\sqrt2}(\\psi_1-\\psi_2)$: right' }]);

  // the wave packet meets the well: |Psi|^2 at three times, the well drawn underneath
  const g = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const pk = (f) => PF.plot({
    w: 230, h: 160, x: [-6, 6], y: [-1.1, 1.4], zero: true, xl: 'x', ml: 14, mr: 22,
    curves: [{ f, n: 400 }, { pts: [[-6, 0], [-1, 0], [-1, -0.8], [1, -0.8], [1, 0], [6, 0]], cls: 'dim' }],
  });
  const t0 = pk((x) => g(x, -4, 0.8, 1));
  const t1 = pk((x) => g(x, -0.6, 0.9, 0.75) * (1 + 0.45 * Math.cos(5 * x)) + g(x, 1.2, 0.5, 0.25));
  const t2 = pk((x) => g(x, -4.2, 0.9, 0.35) + g(x, 4.2, 0.9, 0.75));
  const figP3 = PF.row([{ svg: t0, cap: '$t=0$' }, { svg: t1, cap: '$t=t_1$' }, { svg: t2, cap: '$t=t_2$' }]);

  const dedent = (t) => { const ls = t.replace(/^\n+/, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return ls.map((l) => l.slice(ind)).join('\n'); };
  const paper = (k, title, pts, head, items, figs) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 486 · Midterm 1 · Oct 8, 2026</span><span>Problem ${k} · ${pts} pts</span></div>`,
    head: `**${k}  ${title}** [${pts} points, 5 per part]\n\n` + dedent(head),
    figs,
    items,
  });

  C.unit({
    id: 'm2-start', exam: 'm2', num: 'Start', title: 'Start here: Midterm 1, and what Midterm 2 will look like',
    blurb: 'How Midterm 1 was built and graded, where points were lost, the real exam with its rubric, and the Midterm 2 version of each problem.',
    lessons: [
      // ================================================================== read this first
      {
        id: 'm2-format', title: 'Read this first: how Midterm 1 was built, so what Midterm 2 will be', kind: 'read',
        steps: [
          R(md`
            ### What Midterm 1 looked like

            **Three problems, 20 points each, every problem four parts of 5 points**, each part graded on its own 5/4/3/2/1 rubric. The exam printed the formulas a problem needed (the infinite-well $\psi_n$ and $E_n$ were given in the problem statement). You can read the whole thing, with the official solutions and rubric, in [the real Midterm 1](#/l/mt1-2026).

            | Problem | Setup | What the four parts asked for |
            |---|---|---|
            | 1. Infinite square well as a two-level system | $\Psi(0) = A(\psi_1 + \psi_2)$ | normalize, and *explain* why $P_L = \tfrac12 + I$ and *decide without integrating* the sign of $I$; $\Psi(x,t)$, the period, and $P_L(\tau/2)$ "with no new integral"; measure $\sigma_z$: outcomes, probabilities, **sketch** before and after, "would it differ later? Justify"; $\langle\sigma_x\rangle(t)$, eigenvectors, sketches, and a **physical interpretation** of $\sigma_x$ |
            | 2. Particle on a ring | a new operator $\hat Q = i\,d/d\phi$ | prove Hermitian and say *where* periodicity is used; eigenvalues and eigenfunctions, discrete or continuous; *explain* why its eigenfunctions are states but those of $\hat p$ are not; expand $A\cos^2\phi$ and find outcomes, probabilities, $\langle Q\rangle$, $\sigma_Q$ |
            | 3. A wave packet meets a finite well | figure of $|\Psi|^2$ at three times | **describe in words** the steps to get the transmitted packet, "say what you would calculate and why"; then three **true or false, you must justify** statements |

            Two things stand out. First, only about a third of the points were for algebra; the rest were for **explaining, sketching, interpreting and justifying**. Second, every problem took a system you knew and asked about it from a new angle: the well as a qubit, $\hat p$'s cousin on a circle, the stationary-state recipe applied to a packet.

            ### Where the points went

            Class medians per part (from the Lecture 12 slide; total median about 62%, mean about 66%):

            | 1a | 1b | 1c | 1d | 2a | 2b | 2c | 2d | 3a | 3b | 3c | 3d |
            |---|---|---|---|---|---|---|---|---|---|---|---|
            | 80 | 60 | 60 | 50 | 80 | 40 | 40 | 40 | 40 | 40 | 30 | 40 |

            The two "do the standard thing" parts (normalize; prove Hermitian) were fine. Everything that needed a sentence of physics was at 40%: using periodicity to quantize (2b), *why* a plane wave is not a state (2c), *steps in words* (3a), and the true/false parts, where a bare "False" earns **1 of 5**. The single lowest part (3c, 30%) was energy conservation: "the transmitted packet loses energy to the well". It doesn't: $\hat H$ does not depend on time, so every energy component keeps its energy forever.

            !!key The lesson for Midterm 2
              Practice writing the sentence, not just the equation. Every topic page here ends with an exam-style problem graded on the same rubric, and Units 7–8 are ten full practice midterms in this exact format plus a [true-or-false drill](#/l/m2-tf) and an [explain-in-words drill](#/l/m2-words).

            ### What Midterm 2 covers

            The board for Lecture 9 marks "End of MT1 material" right after the energy–time relation. So Midterm 2 starts at the **generalized Ehrenfest theorem** and runs through the oscillator, 3D, angular momentum and central potentials: Homework 5–7 and Discussions 5–8.

            | Unit | Lectures | Topics |
            |---|---|---|
            | 1 · Time evolution of expectation values | 9 | [Ehrenfest and conservation](#/l/t11-ehrenfest), [energy–time and minimum uncertainty](#/l/t12-energytime) |
            | 2 · The harmonic oscillator | 9–11 | [ladder operators](#/l/t13-ladder), [wavefunctions](#/l/t14-showave), [motion and phase space](#/l/t15-shomotion), [coherent states](#/l/t16-coherent) |
            | 3 · Three dimensions and angular momentum | 12 → | [3D and separation](#/l/t17-3d), [the algebra of L](#/l/t18-Lalgebra), [spherical harmonics and measuring L](#/l/t19-Ylm) |
            | 4 · Central potentials and hydrogen | → Disc. 8 | [radial equation, effective potential, spherical box](#/l/t20-radial), [hydrogen](#/l/t21-hydrogen) |

            Spin had not been taught when this was written; if the exam announcement adds it, it is not here yet.

            ### Midterm 1, problem by problem, in Midterm 2 material

            | Midterm 1 problem | What it really tested | The likely Midterm 2 version | Practice |
            |---|---|---|---|
            | 1. Well as a two-level system | Restrict a known system to two states and use the qubit toolkit; every frequency is an energy difference over $\hbar$; sketches; "what does $\sigma_x$ mean here?" | Oscillator $\ket0, \ket1$ as a two-level system: $\langle x\rangle(t)$ from ladder operators, the phase-space circle, what $\sigma_x$ measures (left vs right). Or the $\ell = 1$ triplet as a three-level system with $\hat L_z$ and $\hat L_x$ | [Topic 15](#/l/t15-shomotion), [PM 1](#/l/m2-pm1), [PM 5](#/l/m2-pm5) |
            | 2. A new operator on a circle | Hermiticity by parts (and the boundary term); quantization from single-valuedness; normalizable or not; expand a trig function in eigenfunctions | It already **was** angular momentum: $\hat Q = i\,d/d\phi = -\hat L_z/\hbar$. Expect $\hat L_z$, $\hat L^2$, $\hat L_\pm$ on functions of $\theta, \phi$; expanding $f(\theta,\phi)$ in $Y_\ell^m$ by spotting $x \pm iy$ and $z$; $Y_\ell^\ell$ from the top of the ladder | [Topic 18](#/l/t18-Lalgebra), [Topic 19](#/l/t19-Ylm), [PM 8](#/l/m2-pm8) |
            | 3. Words and true/false | Describe a procedure; conceptual traps about energy, eigenstates, bound vs scattering | "Describe the steps": find a spectrum from the radial equation, build a coherent state, find $P(E)$ for a 3D state. T/F on degeneracy, conservation laws, $u(0) = 0$, what a measurement leaves behind | [Topic 20](#/l/t20-radial), [Topic 21](#/l/t21-hydrogen), [T/F drill](#/l/m2-tf), [words drill](#/l/m2-words) |

            ### How a 5/5 answer is built

            The rubric gave 4/5 for "one non-trivial flaw", and most 4s and 3s were a missing reason. For each kind of part, the full-credit answer contains:

            - **Compute**: the setup line (which formula and why it applies), the result, a check (units, a limit, probabilities summing to 1).
            - **Explain where X comes from**: name the physical ingredient. "The ½ is each stationary state's own probability in the left half, ½ by symmetry of the well." One sentence, specific.
            - **Without calculating, decide**: a symmetry or sign argument. "Both functions are positive on the left half, so the integrand is positive." Parity, nodes, signs, orthogonality.
            - **Sketch**: label axes and special points (walls, $L/2$, turning points, the origin), get nodes, symmetry and relative height right, and say in words what the sketch shows.
            - **Interpret physically**: translate the operator into a yes/no question about the particle ("$\sigma_x$ asks: left half or right half?") and say how its expectation value moves.
            - **True or false**: the verdict **and** the principle that decides it, in one or two sentences. The verdict alone is 1 point.
            - **Describe the steps**: numbered steps; for each, *what* you calculate and *why it is needed*.

            !!method A plan for a three-problem exam
              **First 3 minutes:** read all twelve parts. Write the given formulas you will use next to each problem.
              **Then about a third of the time per problem.** Do the parts you can do in order of confidence, not in printed order; parts are graded independently and later parts often don't need earlier numbers.
              **When stuck for 3 minutes:** write the setup and the reason it is the right setup, then move on. "Expand in eigenfunctions of $\hat L_z$; probabilities are $|c_m|^2$" earns points before any algebra.
              **Last 5 minutes:** every true/false has a reason; every sketch has labeled axes; every probability set sums to 1.
          `),
          Q(md`A Midterm 1 part said "true or false; you must give a brief justification". A student wrote only "False" (correct). Under the posted rubric they got…`, ['1 of 5', '5 of 5', '0 of 5', '3 of 5'], 0,
            [null, 'The rubric: "Correct verdict, no justification" is the 1-point line.', 'The verdict was right, which is worth 1.', 'Partial credit needs a reasoning attempt.'],
            md`The reasoning is 4 of the 5 points. Always write the principle: "$\hat H$ is time independent, so each energy component keeps its energy".`),
          Q(md`Midterm 1 Problem 2's operator $\hat Q = i\,d/d\phi$ on a ring is, in Midterm 2 language,…`, [md`$-\hat L_z/\hbar$`, md`$\hat L^2/\hbar^2$`, md`$\hat p/\hbar$`, md`$\hat L_+/\hbar$`], 0,
            [null, md`$\hat L^2$ is second order in derivatives and involves $\theta$.`, md`$\hat p = -i\hbar\,d/dx$ acts on a line, not an angle.`, md`$\hat L_+$ changes $m$; $i\,d/d\phi$ doesn't change $e^{im\phi}$.`],
            md`$\hat L_z = -i\hbar\,\partial/\partial\phi$, so $i\,d/d\phi = -\hat L_z/\hbar$. Its eigenvalues are integers for the same reason $m$ is: the wavefunction must come back to itself after $2\pi$.`),
          Q(md`Which part type had the lowest class median on Midterm 1?`, ['A true/false about energy conservation (3c)', 'Normalizing a state (1a)', 'Proving an operator Hermitian (2a)', 'Writing Ψ(x, t) (1b)'], 0,
            [null, 'Normalizing was the best part (80%).', 'Also about 80%.', 'About 60%.'],
            md`3c was 30%: "the transmitted packet loses energy to the well" is false because a time-independent $\hat H$ conserves the energy distribution.`),
        ],
      },

      // ================================================================== the real exam
      {
        id: 'mt1-2026', title: 'The real Midterm 1 (Oct 8, 2026), with the official solutions and rubric', kind: 'exam',
        steps: [
          R(md`
            **Midterm 1 as given**, problems typed from the solution key, with the official solutions and the grading rubric for every part. Even though it is Midterm 1 material, redo it timed before you start the practice midterms: it is the best evidence of how Midterm 2 will be written and graded. Each part has its own **Show answer**; grade yourself with the rubric under each solution.
          `),
          paper(1, 'Infinite square well as a two-level system', 20, md`
            A particle of mass $m$ is in the infinite square well, $V(x) = 0$ for $0 < x < L$ and $V = \infty$ elsewhere. The normalized stationary states and energies are
            $$\psi_n(x) = \braket{x|\psi_n} = \sqrt{\tfrac2L}\sin\tfrac{n\pi x}{L},\qquad E_n = \frac{n^2\pi^2\hbar^2}{2mL^2} = n^2E_1.$$
            At $t = 0$ the particle is in the state $\ket{\Psi(0)} = A\left(\ket{\psi_1} + \ket{\psi_2}\right)$, with $A$ real and positive.
          `, [
            {
              q: md`**(a)** Determine $A$. Show that the probability to find the particle in the left half of the well, $0 < x < L/2$, at $t = 0$ can be written as $P_L = \tfrac12 + I$, $I = \int_0^{L/2}\psi_1(x)\psi_2(x)\,dx$, and explain where the $\tfrac12$ comes from. Without evaluating any integrals, decide whether $P_L$ is larger or smaller than $\tfrac12$. Justify your answer.`,
              ans: md`$A = 1/\sqrt2$; $P_L = \tfrac12 + I$ with $I > 0$, so $P_L > \tfrac12$.`,
              sol: md`
                Since $\psi_1, \psi_2$ are orthonormal, $\braket{\Psi|\Psi} = A^2(1 + 1) = 2A^2 = 1$, so $A = 1/\sqrt2$.

                The $\psi_n$ are real, so $|\Psi(x, 0)|^2 = \tfrac12\left[\psi_1^2 + \psi_2^2 + 2\psi_1\psi_2\right]$ and $P_L = \tfrac12\left[\int_0^{L/2}\psi_1^2 + \int_0^{L/2}\psi_2^2 + 2I\right]$. Each $\int_0^{L/2}\psi_n^2$ is half the normalization of a stationary state (the potential is symmetric about $L/2$, so each $|\psi_n|^2$ is too): $\int_0^{L/2}\psi_n^2 = \tfrac12$. Hence $P_L = \tfrac12\left(\tfrac12 + \tfrac12\right) + I = \tfrac12 + I$.

                **Sign of $I$:** $\psi_1$ and $\psi_2$ are both positive in the left half of the well, so $\psi_1\psi_2 > 0$ there and $I > 0$. (Sketching the two functions is an equally acceptable argument.) $P_L > \tfrac12$.

                **Rubric** 5: $A$; expansion; $\tfrac12$ explained; sign of $I$ explained · 4: sign of $I$ only asserted or wrong, or the $\tfrac12$ explanation missing · 3: no sound explanation for the sign of $I$ and for $\tfrac12$ · 2: expansion wrong (e.g. cross term missing) · 1: $A$ only.
              `,
            },
            {
              q: md`**(b)** Write down $\Psi(x, t)$. The probability density $|\Psi(x, t)|^2$ is periodic in time; find its period $\tau$. Express the probability to find the particle in the left half of the well at $t = \tau/2$ in terms of $P_L$ from (a). (No new integral is needed.)`,
              ans: md`$\Psi = \tfrac{1}{\sqrt2}\left[\psi_1e^{-iE_1t/\hbar} + \psi_2e^{-iE_2t/\hbar}\right]$; $\tau = \tfrac{2\pi\hbar}{E_2 - E_1} = \tfrac{2\pi\hbar}{3E_1}$; $P_L(\tau/2) = \tfrac12 - I = 1 - P_L$.`,
              sol: md`
                Each stationary state evolves with its own phase: $\Psi(x, t) = \tfrac{1}{\sqrt2}\left[\psi_1(x)e^{-iE_1t/\hbar} + \psi_2(x)e^{-iE_2t/\hbar}\right]$, with $E_2 = 4E_1$. The time-dependence of $|\Psi|^2$ comes only from the cross term, which oscillates at $\omega = (E_2 - E_1)/\hbar$, so $\tau = 2\pi/\omega$ and $P_L(t) = \tfrac12 + I\cos\omega t$.

                After half a period the particle has "sloshed" to the right: $P_L(\tau/2) = \tfrac12 - I = 1 - P_L$. (Writing out $|\Psi(x,t)|^2$ is one or two lines and gives the cosine directly, but the reasoning is enough.)

                **Rubric** 5: correct $\Psi(x,t)$, $\tau$ from the energy difference, and $P_L(\tau/2) = 1 - P_L$ (any equivalent form: $\tfrac12 - I$, $P_L - 2I$) · 4: $\Psi$, $\tau$ right; $P_L(\tau/2)$ missing or wrong · 3: correct time-dependence ansatz but no sound reasoning for $\tau$ · 2: incorrect time dependence; time factors missing or one common phase for both terms · 1: little beyond the stationary states.
              `,
            },
            {
              q: md`**(c)** Because only $\psi_1$ and $\psi_2$ are involved, we can treat the particle as a two-level system, with $\ket0 \equiv \ket{\psi_1}$ and $\ket1 \equiv \ket{\psi_2}$. At $t = 0$, the observable $\hat\sigma_z = \ket0\bra0 - \ket1\bra1$ is measured. What are the possible outcomes, and their probabilities? Sketch the wavefunction immediately before the measurement, and the possible wavefunctions immediately after. Would the probabilities be different if the measurement were performed at a later time $t > 0$? Justify briefly.`,
              ans: md`$\pm1$, probability $\tfrac12$ each. Before: $\psi_1 + \psi_2$ (weighted left); after: $\psi_1$ (for $+1$) or $\psi_2$ (for $-1$). Same probabilities at any later time.`,
              figs: { c: figC },
              sol: md`
                $\hat\sigma_z$ has eigenvectors $\ket0$ (eigenvalue $+1$) and $\ket1$ ($-1$), so the outcomes are $\pm1$. With $\ket{\Psi(0)} = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$, the Born rule gives $P(+1) = |\braket{0|\Psi}|^2 = \tfrac12$ and $P(-1) = |\braket{1|\Psi}|^2 = \tfrac12$. After the measurement the state is the corresponding eigenvector: $\psi_1$ for $+1$, $\psi_2$ for $-1$.

                [[fig:c]]

                **Later times:** no difference. Here $\hat\sigma_z$ is (up to constants) the energy, and time evolution only multiplies each $c_n$ by a phase, so $|c_n|^2$ never change.

                **Rubric** 5: outcomes, probabilities, sketches, time independence justified · 4: one non-trivial flaw (e.g. symmetric before-sketch, after-states swapped, or "same later" unjustified) · 3: probabilities right but no collapse picture; wrong interpretation of stationary states · 2: outcomes not linked to $\hat\sigma_z$ eigenvalues · 1: no good explanation of measurement.
              `,
            },
            {
              q: md`**(d)** Now consider instead the observable $\hat\sigma_x = \ket0\bra1 + \ket1\bra0$. Find $\langle\hat\sigma_x\rangle$ in the state $\ket{\Psi(t)}$. Find the eigenvalues and eigenvectors $\ket\pm$ of $\hat\sigma_x$, and sketch the corresponding wavefunctions $\braket{x|\pm}$. Use these results to give a physical interpretation of $\hat\sigma_x$ for the particle in the well, and of the time dependence of $\langle\hat\sigma_x\rangle$.`,
              ans: md`$\langle\sigma_x\rangle = \cos\tfrac{(E_2 - E_1)t}{\hbar}$; $\pm1$ with $\ket\pm = \tfrac{1}{\sqrt2}(\ket0 \pm \ket1)$; $\braket{x|+}$ sits left, $\braket{x|-}$ right. $\hat\sigma_x$ asks "left half ($+1$) or right half ($-1$)?"; the particle sloshes with period $\tau$.`,
              figs: { d: figD },
              sol: md`
                Write $\ket{\Psi(t)} = c_0\ket0 + c_1\ket1$ with $c_n = e^{-iE_nt/\hbar}/\sqrt2$. Then $\bra\Psi\hat\sigma_x\ket\Psi = c_0^*c_1 + c_1^*c_0 = 2\,\text{Re}(c_0^*c_1) = \cos\tfrac{(E_2 - E_1)t}{\hbar}$.

                Eigenvalues and eigenvectors (from lecture, or check $\hat\sigma_x\ket\pm = \pm\ket\pm$): $+1$: $\ket+ = (\ket0 + \ket1)/\sqrt2$; $-1$: $\ket- = (\ket0 - \ket1)/\sqrt2$. In position space $\braket{x|+} = \Psi(x, 0)$, weighted to the left (already seen in (c)); $\braket{x|-} = \tfrac{1}{\sqrt2}(\psi_1 - \psi_2)$ is its mirror image, weighted to the right (the $\tau/2$ state of (b)).

                [[fig:d]]

                **Interpretation:** within the two-level description, $\hat\sigma_x$ asks "is the particle in the left half ($+1$) or the right half ($-1$)?". $\langle\hat\sigma_x\rangle$ starts at $+1$ (left), reaches $-1$ at $\tau/2$ (right) and returns: the particle sloshes back and forth with period $\tau$, consistent with $P_L(t)$ from (b).

                **Rubric** 5: correct $\langle\sigma_x\rangle$, $\ket\pm$, mirror-image sketches, left/right interpretation with the oscillation · 4: calculation correct, issues with sketches or interpretation · 3: $\ket\pm$ and eigenvalues right, $\langle\sigma_x\rangle$ wrong or time independent, no interpretation · 2: no time dependence and no eigenvectors · 1: little progress.
              `,
            },
          ]),
          paper(2, 'Particle on a ring', 20, md`
            A bead of mass $m$ slides on a frictionless circular ring. Its position is given by the angle $\phi$, and wavefunctions obey $f(\phi + 2\pi) = f(\phi)$, with inner product $\braket{f|g} = \int_0^{2\pi}f^*(\phi)g(\phi)\,d\phi$. Consider the operator
            $$\hat Q = i\frac{d}{d\phi}.$$
          `, [
            {
              q: md`**(a)** Show that $\hat Q$ is Hermitian. Where do you need the condition $f(\phi + 2\pi) = f(\phi)$?`,
              ans: md`Integrate by parts; the boundary term $i[f^*g]_0^{2\pi}$ vanishes because of periodicity.`,
              sol: md`
                We need $\braket{f|\hat Qg} = \braket{\hat Qf|g}$ for all periodic $f, g$. Integrating by parts, exactly as in the lecture proof for $\hat p$:
                $$\braket{f|\hat Qg} = \int_0^{2\pi}f^*\,ig'\,d\phi = i\left[f^*g\right]_0^{2\pi} - i\int_0^{2\pi}(f^*)'g\,d\phi = \int_0^{2\pi}(if')^*g\,d\phi = \braket{\hat Qf|g}.$$
                (Note $-i(f^*)' = (if')^*$.) The boundary term vanishes because $f(2\pi) = f(0)$ and $g(2\pi) = g(0)$: **this is where periodicity is needed.** For $\hat p$ on the real line it vanishes instead because normalizable functions go to zero at $\pm\infty$. (Griffiths Example 3.1.)

                **Rubric** 5: integration by parts, conjugation of $i$ right, boundary term killed by periodicity (stated) · 4: boundary term dropped without the periodicity argument, or a conjugation error · 3: correct definition and start, argument incomplete · 2: wrong criterion · 1: no meaningful attempt.
              `,
            },
            {
              q: md`**(b)** Find the eigenvalues and normalized eigenfunctions of $\hat Q$. Is the spectrum discrete or continuous?`,
              ans: md`$f_q = \tfrac{1}{\sqrt{2\pi}}e^{-iq\phi}$ with $q \in \{0, \pm1, \pm2, \dots\}$: discrete.`,
              sol: md`
                $if' = qf$ gives $f = Ce^{-iq\phi}$ (the same type of solution as for $\hat p$). Periodicity requires $e^{-2\pi iq} = 1$, so $q \in \{0, \pm1, \pm2, \dots\}$. Normalization: $\int_0^{2\pi}|C|^2d\phi = 1$ gives $C = 1/\sqrt{2\pi}$. The spectrum is **discrete**.

                **Rubric** 5: eigenfunctions, $q \in \mathbb Z$ from periodicity, normalization, "discrete" · 4: normalization missing, or quantization not derived · 3: $q$ left continuous (periodicity unused) · 2: wrong functional form · 1: no meaningful attempt.
              `,
            },
            {
              q: md`**(c)** Compare with the momentum operator $\hat p = -i\hbar\,d/dx$ of a particle on the entire real line, $-\infty < x < \infty$. Both operators are Hermitian, but the eigenfunctions of $\hat Q$ can be the state of a particle, whereas the eigenfunctions of $\hat p$ cannot. Explain why. What is the essential difference, and where does it come from?`,
              ans: md`Normalizability: $e^{ipx/\hbar}$ extends over an infinite line and is not normalizable; the ring is compact, so $e^{-iq\phi}/\sqrt{2\pi}$ is.`,
              sol: md`
                Position on the line is unbounded, so momentum eigenfunctions extend over all of space with constant $|f|^2$ and $\int|f|^2dx = \infty$: they are not normalizable and cannot be states (only limits of wave packets). The ring, with periodic boundary conditions, is **compact**: the periodic eigenfunctions of $\hat Q$ have $\int_0^{2\pi}|f|^2 = 1$, as shown in (b). The finite domain is also what makes the spectrum discrete.

                **Rubric** 5: normalizability as the criterion, traced to the finite/periodic domain vs the infinite line · 4: normalizability right, reason vague, or "discrete spectrum" without the link to normalizability · 3: only "discrete vs continuous" or "plane waves", no normalization · 2: claims $\hat p$ is non-Hermitian or has complex eigenvalues · 1: no meaningful attempt.
              `,
            },
            {
              q: md`**(d)** At $t = 0$ the bead is in the state $f(\phi) = A\cos^2\phi$. By writing $f$ in terms of the eigenfunctions of $\hat Q$, find the possible outcomes of a measurement of $Q$, and their probabilities. Find $\langle\hat Q\rangle$ and the uncertainty $\sigma_Q$. (You do not need to find $A$.)`,
              ans: md`$q = 0$ ($\tfrac23$), $q = \pm2$ ($\tfrac16$ each); $\langle Q\rangle = 0$, $\sigma_Q = \sqrt{4/3} = 2/\sqrt3$.`,
              sol: md`
                Using $\cos\phi = \tfrac12(e^{i\phi} + e^{-i\phi})$: $\cos^2\phi = \tfrac14\left(e^{2i\phi} + 2 + e^{-2i\phi}\right)$. Each term is an eigenfunction of $\hat Q$: the constant has $q = 0$, $e^{-2i\phi}$ has $q = +2$, $e^{2i\phi}$ has $q = -2$. The amplitudes are in the ratio $2 : 1 : 1$, so the probabilities are in the ratio $4 : 1 : 1$: $P(0) = \tfrac23$, $P(+2) = P(-2) = \tfrac16$. (Normalizing the probabilities makes $A$ unnecessary.)

                $\langle Q\rangle = 0$ ($\pm2$ equally likely). $\langle Q^2\rangle = 4\cdot\tfrac16 + 4\cdot\tfrac16 = \tfrac43$, so $\sigma_Q = \sqrt{4/3}$.

                **Rubric** 5: correct outcomes and probabilities, $\langle Q\rangle = 0$, $\sigma_Q = 2/\sqrt3$ · 4: probabilities unnormalized ($\tfrac12, \tfrac14, \tfrac14$) or $\sigma_Q$ wrong or missing · 3: expansion wrong (e.g. $q = \pm1$) but correct Born-rule structure · 2: incorrect strategy for finding eigenvalues · 1: no meaningful attempt.
              `,
            },
          ]),
          paper(3, 'A wave packet meets a finite square well', 20, md`
            A particle of mass $m$ moves in the potential $V(x) = -V_0$ for $|x| < a$ and $V(x) = 0$ otherwise ($V_0 > 0$). At $t = 0$ the particle is far to the left of the well and moves to the right. Its wavefunction is
            $$\Psi(x, 0) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^\infty\phi(k)e^{ikx}dk,$$
            where $\phi(k)$ is normalized, sharply peaked around some $k_0 > 0$, and nonzero only for $k > 0$. The figure shows $|\Psi(x, t)|^2$ at three times (the well is drawn underneath); $t_2$ is long after the packet has passed the well.

            [[fig:p3]]
          `, [
            {
              q: md`**(a)** Suppose you are given $\phi(k)$. Describe, in words, the steps you would take to determine the reflected and transmitted wave packets at late times, and the probability that the particle ends up to the right of the well. For each step, say what you would calculate and why it is needed. You do not need to write down explicit equations, and you are not expected to know formulas for the reflection or transmission coefficients.`,
              ans: md`Scattering state for each $k$ → match $\psi$, $\psi'$ for $r(k)$, $t(k)$ → superpose with weights $\phi(k)$ → evolve each with $e^{-iE(k)t/\hbar}$ → read off the reflected and transmitted packets → integrate $|\Psi|^2$ over $x > a$ at late times.`,
              sol: md`
                1. For each $k > 0$ (energy $E = \hbar^2k^2/2m > 0$), find the stationary scattering state: incident plus reflected wave left of the well, an oscillating solution inside (larger wavenumber $l = \sqrt{2m(E + V_0)}/\hbar$), and only a transmitted wave right of the well.
                2. Use continuity of $\psi$ and $\psi'$ at both edges to find the coefficients. This gives a reflection amplitude $r(k)$ and a transmission amplitude $t(k)$, different for each $k$.
                3. Write the initial packet as a superposition of these stationary states with the same weights $\phi(k)$.
                4. Evolve in time: each component gets its own phase $e^{-iE(k)t/\hbar}$.
                5. At late times, the $r(k)$ terms form a left-moving packet left of the well (reflected), the $t(k)$ terms a right-moving packet right of the well (transmitted).
                6. Transmission probability: integrate $|\Psi|^2$ over $x > a$ at late times, for example (other methods work too, e.g. $\int|\phi(k)|^2|t(k)|^2dk$).

                **Rubric** 5: all six steps, with a good argument for the transmission probability · 4: steps 1–5 right; $P_T$ missing or clearly wrong · 3: right overall idea, but misses that each $k$ has its own $r, t$, or how $\phi(k)$ enters · 2: poor understanding of wave packets and their decomposition into stationary states · 1: generic statements only.
              `,
            },
            {
              q: md`*True or false? To receive credit, you must give a brief justification.*

              **(b)** The initial wave packet is an eigenstate of momentum.`,
              ans: md`**False.**`,
              sol: md`
                A momentum eigenstate is a plane wave $e^{ik_0x}$: spread uniformly over all $x$, not normalizable, and its $|\psi|^2$ does not move. The packet in the figure is localized and moves.

                **Rubric** 5: False with correct argument · 4–2: partial credit for good, fair, or some applicable reasoning · 1: correct verdict, no justification.
              `,
            },
            {
              q: md`**(c)** Upon transmission, the particle loses some of its energy to the well, i.e., the transmitted wave packet contains lower energies than the incident one.`,
              ans: md`**False.**`,
              sol: md`
                $\hat H$ is time independent and each stationary-state component keeps its energy $E(k)$ forever (its weight $|\phi(k)|^2$ can only be split between reflected and transmitted parts of the *same* energy). What changes is where the particle is likely to be, not its energy.

                **Rubric** 5: False with correct argument · 4–2: partial credit for reasoning · 1: correct verdict, no justification.
              `,
            },
            {
              q: md`**(d)** If the incident wave packet contains suitable values of $k$, part of it can end up permanently trapped in the well: for $t \to \infty$ there remains a nonzero probability to find the particle in a bound state of the well.`,
              ans: md`**False.**`,
              sol: md`
                Being bound requires $E < 0$, but every component of the incident packet has $E = \hbar^2k^2/2m > 0$. The packet is a superposition of scattering states only, which are orthogonal to the bound states, and the overlap with each bound state is constant in time (zero).

                **Rubric** 5: False with correct argument · 4–2: partial credit for reasoning · 1: correct verdict, no justification.
              `,
            },
          ], { p3: figP3 }),
          R(md`
            ### Score yourself, then look forward

            Add up your parts. The class median was about 37/60. Now the important part: for each part where you lost points, decide whether it was **physics** (didn't know the idea), **algebra**, or **writing** (knew it, didn't say why). The writing losses are the cheapest to fix and the practice midterms in Units 7–8 grade exactly that.

            ### The same skills in Midterm 2 material
          `),
          Q(md`An oscillator is in $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$. Treat it as a two-level system with $\ket0, \ket1$ as the basis. By analogy with Midterm 1 Problem 1(d), $\hat\sigma_x = \ket0\bra1 + \ket1\bra0$ asks…`,
            ['which side of the origin the particle is on (+1: the side where ψ0 + ψ1 is large)', 'which energy level it is in', 'whether it is moving', 'nothing physical: σx is just a matrix'], 0,
            [null, md`That's $\hat\sigma_z$: its eigenstates are $\ket0$ and $\ket1$.`, md`Motion is $\hat\sigma_y$-like: $\langle p\rangle \propto \langle\sigma_y\rangle$ here.`, 'Every Hermitian operator is a question you can ask; the eigenvectors tell you which.'],
            md`$\psi_0$ is even and positive, $\psi_1$ odd and positive for $x > 0$: $\psi_0 + \psi_1$ sits right of the origin, $\psi_0 - \psi_1$ left. So $\hat\sigma_x$ is "right or left?", and $\langle\sigma_x\rangle = \cos\omega t$ is the particle swinging, exactly like $\langle x\rangle(t) \propto \cos\omega t$.`),
          P({
            title: 'Midterm 1 Problem 2 in Midterm 2 dress',
            q: md`A particle on a sphere has angular wavefunction $\propto\sin^2\theta\cos2\phi$. A measurement of $\hat L_z$ is made. Enter $P(L_z = 0)$ and $P(L_z = +2\hbar)$.`,
            parts: [{ lbl: 'P(L_z = 0)', ans: 0 }, { lbl: 'P(L_z = 2\\hbar)', ans: 0.5 }],
            hints: [md`The $\theta$ part never affects $L_z = -i\hbar\,\partial_\phi$. Write $\cos2\phi$ with exponentials.`],
            sol: md`$\cos2\phi = \tfrac12(e^{2i\phi} + e^{-2i\phi})$: only $m = \pm2$, equal weights, so $P(0) = 0$ and $P(\pm2\hbar) = \tfrac12$ each. Same move as $\cos^2\phi$ on the ring. (In fact $\sin^2\theta\,e^{\pm2i\phi} \propto Y_2^{\pm2}$, so $L^2 = 6\hbar^2$ for certain too.)`,
          }),
          Q(md`True or false (justify): "An electron in the $2p$ level of hydrogen can drop to $1s$ and give its energy to the proton, so after a long time hydrogen is always found in $1s$ even with no photon emitted."`,
            ['False: with the Coulomb Hamiltonian alone (no coupling to light), 2p is a stationary state and nothing changes', 'True: lower energy is always preferred', 'True: tunneling connects 2p to 1s', 'False: 2p is lower than 1s'], 0,
            [null, 'Energy minimization needs somewhere for the energy to go (a photon). The Schrödinger equation with a time-independent H conserves every |c_n|².', 'Tunneling does not change energy.', 'E₂ = −3.4 eV is above E₁ = −13.6 eV.'],
            md`Same principle as Midterm 1 3(c): a time-independent $\hat H$ keeps $|c_n|^2$ fixed. Real atoms decay because the electromagnetic field (not in our $\hat H$) carries the energy away.`),
        ],
      },

      // ================================================================== moves
      {
        id: 'm2-moves', title: 'Twelve moves that turn Midterm 2 parts into one-liners',
        steps: [
          R(md`
            Each move is a sentence you can write as a justification and a shortcut that saves the algebra. They come from the homework and discussion solutions; the topic pages derive each one.

            ### Dynamics

            1. **Every frequency is an energy difference.** $|\Psi|^2$, $\langle x\rangle$, anything not conserved, oscillates at $(E_m - E_n)/\hbar$ for the pairs present. Oscillator: adjacent levels give $\omega$; $n$ and $n + 2$ give $2\omega$ (breathing, not swinging).
            2. **Commutes with $\hat H$ (and no explicit $t$) means conserved.** $\tfrac{d}{dt}\langle Q\rangle = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle$. Central potential: $\hat L^2$ and every $\hat L_i$ are conserved. Free particle: $\hat p$. Any $\hat H$: $\hat H$ itself.
            3. **Stationary state: nothing moves.** All expectation values constant, $\sigma_H = 0$, and the energy–time relation says nothing.

            ### The oscillator

            4. **Count the ladder steps.** $\hat x$ and $\hat p$ change $n$ by $\pm1$, so $\langle x\rangle \ne 0$ needs neighbors $n, n+1$ in the state. $\hat x^2$, $\hat p^2$ change $n$ by $0, \pm2$. In $\ket n$: $\langle x\rangle = \langle p\rangle = 0$, $\langle x^2\rangle = (n + \tfrac12)\tfrac{\hbar}{m\omega}$, $\langle T\rangle = \langle V\rangle = \tfrac12E_n$.
            5. **Phase space is a circle (in the right units).** $\langle x\rangle(t)$ and $\langle p\rangle(t)$ obey the classical equations (Ehrenfest is exact for a quadratic $V$), so the point $(\langle x\rangle, \langle p\rangle/m\omega)$ goes clockwise around a circle with period $2\pi/\omega$. A stationary state sits at the origin.
            6. **Parity first.** $\psi_n$ has parity $(-1)^n$. An even initial state only contains even $n$; $\int x\,\psi_m\psi_n = 0$ unless $m$ and $n$ have opposite parity.

            ### Angular momentum

            7. **$\ell$ bounds $m$; $m$ only bounds $\ell$ from below.** $L^2 = \hbar^2\ell(\ell+1)$ allows $m = -\ell, \dots, \ell$. A measured $L_z = m\hbar$ allows every $\ell \ge |m|$.
            8. **Read $Y_\ell^m$ off Cartesian shapes.** $\tfrac{x \pm iy}{r} \propto \sin\theta e^{\pm i\phi} \propto Y_1^{\pm1}$, $\tfrac zr \propto Y_1^0$, $\tfrac{(x \pm iy)^2}{r^2} \propto Y_2^{\pm2}$, $\tfrac{(x \pm iy)z}{r^2} \propto Y_2^{\pm1}$. A function of $\phi$ alone: write it with $e^{im\phi}$ and read off $m$ (Midterm 1 Problem 2).
            9. **Only one component is sharp.** $[\hat L_x, \hat L_y] = i\hbar\hat L_z$: after measuring $L_x$, the $L_z$ information is erased (except $\ell = 0$). $\hat L^2$ commutes with everything and survives every measurement.

            ### Central potentials

            10. **The radial equation is a 1D problem with a wall at $r = 0$.** $u = rR$, $u(0) = 0$, $V_{\text{eff}} = V + \tfrac{\hbar^2\ell(\ell+1)}{2mr^2}$. Every 1D intuition (nodes, curvature, tunneling into forbidden regions, bound needs a well) applies to $u$.
            11. **Near the origin $u \propto r^{\ell+1}$**, so $\psi(0) \ne 0$ only for $\ell = 0$. Higher $\ell$ is pushed out by the centrifugal barrier, and costs energy at fixed number of radial nodes.
            12. **Degeneracy: $2\ell + 1$ is rotations; anything more is an accident.** Spherical box: levels are single $\ell$ multiplets. Hydrogen: $n^2$ (all $\ell < n$ coincide). 3D oscillator: $(N+1)(N+2)/2$ with $\ell = N, N-2, \dots$. Break the $1/r$ (or $r^2$) form and the accident goes away; break rotation (a field along $z$) and the $m$-degeneracy goes away.

            ### Questions
          `),
          Q(md`An oscillator is in $\tfrac{1}{\sqrt2}(\ket1 + \ket3)$. $\langle x\rangle(t)$ is…`, ['0 for all t', md`$\propto\cos2\omega t$`, md`$\propto\cos\omega t$`, md`$\propto\cos3\omega t$`], 0,
            [null, md`$2\omega$ is the frequency of $\langle x^2\rangle$ here (the width breathes), not of $\langle x\rangle$.`, md`$\hat x$ connects $n$ to $n\pm1$; there is no neighbor pair.`, 'No pair differs by 3 quanta in a way x can connect.'],
            md`$\hat x\ket1 \propto \ket0, \ket2$ and $\hat x\ket3 \propto \ket2, \ket4$: none overlap $\ket1$ or $\ket3$. Both states are odd, so $|\Psi|^2$ is even at all times: $\langle x\rangle = 0$.`),
          Q(md`$\tfrac{d}{dt}\langle\hat L_z\rangle$ for a particle in $V = k(x^2 + y^2 + 2z^2)$ is…`, ['0: V is symmetric under rotations about z', 'nonzero: V is not spherically symmetric', md`$-\langle\partial V/\partial\phi\rangle$, which is nonzero`, 'undefined'], 0,
            [null, md`Only rotations about $z$ matter for $L_z$; $x^2 + y^2$ doesn't change under them.`, md`$\partial V/\partial\phi = 0$ for this $V$.`, 'Defined by Ehrenfest.'],
            md`$[\hat L_z, V] = -i\hbar\,\partial V/\partial\phi = 0$ since $x^2 + y^2 = r^2\sin^2\theta$ has no $\phi$. $L_z$ is conserved; $L_x$, $L_y$ are not.`),
          Q(md`$L_z = -\hbar$ is measured. A subsequent $L^2$ measurement can give…`, [md`$2\hbar^2, 6\hbar^2, 12\hbar^2, \dots$ (any $\ell \ge 1$)`, md`only $2\hbar^2$`, md`$0$ or $2\hbar^2$`, md`only $\hbar^2$`], 0,
            [null, 'That would be true if ℓ = 1 were known; m = −1 only says ℓ ≥ 1.', md`$\ell = 0$ has only $m = 0$.`, md`$L^2 = \hbar^2\ell(\ell+1)$ is never $\hbar^2$.`],
            md`$m$ bounds $\ell$ from below only (Discussion 7).`),
          Q(md`$\psi = f(r)\,(x + iy)z/r^2$. Then…`, [md`$\ell = 2$, $m = 1$ for certain`, md`$\ell = 1$, $m = 1$`, md`$\ell = 2$, $m = 2$`, md`$\ell = 3$, $m = 1$`], 0,
            [null, 'Two powers of x, y, z over r²: ℓ = 2.', md`$(x + iy)^2$ would be $m = 2$.`, 'Degree 2, not 3.'],
            md`$\tfrac{(x + iy)z}{r^2} = \sin\theta\cos\theta e^{i\phi} \propto Y_2^1$.`),
          Q(md`Which state has a nonzero probability density at the nucleus?`, ['2s', '2p', '3d', 'all of them, since |ψ|² is finite everywhere'], 0,
            [null, md`$\ell = 1$: $R \propto r$ near 0.`, md`$\ell = 2$: $R \propto r^2$.`, md`Finite, but it vanishes at $r = 0$ for $\ell \ge 1$.`],
            md`$u \propto r^{\ell+1}$, so $R = u/r \propto r^\ell$: only $\ell = 0$ reaches the origin.`),
          Q(md`A central potential that is not $1/r$ and not $r^2$ has a level with $\ell = 2$. Its degeneracy is (no spin)…`, ['5', '25', '9', '3'], 0,
            [null, 'n² is hydrogen-specific.', 'That would be ℓ = 4 or n = 3 in hydrogen.', 'That is ℓ = 1.'],
            md`Generic central potentials: exactly $2\ell + 1 = 5$.`),
          P({
            title: 'Breathing frequency',
            q: md`An oscillator of angular frequency $\omega$ is in $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$. Enter the angular frequency at which $\sigma_x$ oscillates (in units of $\omega$) and $\langle H\rangle$ in units of $\hbar\omega$.`,
            parts: [{ lbl: '\\Omega/\\omega', ans: 2 }, { lbl: '\\langle H\\rangle/\\hbar\\omega', ans: 1.5 }],
            hints: [md`$E_2 - E_0 = 2\hbar\omega$.`],
            sol: md`Frequencies are energy differences: $2\omega$. $\langle H\rangle = \tfrac12(\tfrac12 + \tfrac52)\hbar\omega = \tfrac32\hbar\omega$.`,
          }),
        ],
      },
    ],
  });
})();

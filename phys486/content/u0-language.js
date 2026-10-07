/* Unit 0 — the language of quantum mechanics, taught from scratch for someone who has had classical mechanics and
   E&M: complex phases, probability notation, vectors/operators/Dirac notation, Fourier transforms and the delta
   function. Lessons A–D. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  C.unit({
    id: 'u0', exam: 'm1', num: 'Unit 0', title: 'The language (start here)',
    lessons: [
      // ------------------------------------------------------------------ A
      {
        id: 'tA-complex', topic: 'A', title: 'Complex numbers and phases',
        steps: [
          R(md`
            ### Why this comes first

            Quantum mechanics is written in complex numbers, and almost every "quantum" effect (interference, beats, why a global phase doesn't matter) is really a statement about adding arrows in the complex plane. If you used phasors for AC circuits or waves in E&M, you already know the picture. This lesson pins down the notation.

            ### The arrow picture

            A complex number $z = a + ib$ (with $i^2 = -1$) is an arrow in the plane: $a$ along the real axis, $b$ along the imaginary axis. Same arrow in polar form:
            $$z = re^{i\theta}, \qquad e^{i\theta} = \cos\theta + i\sin\theta \quad\text{(Euler)}$$
            - $r = |z| = \sqrt{a^2 + b^2}$ is the **modulus** (length of the arrow).
            - $\theta$ is the **phase** (angle from the real axis).
            - $\text{Re}\,z = a$, $\text{Im}\,z = b$ (both real numbers).
            - The **complex conjugate** $z^* = a - ib = re^{-i\theta}$ flips the sign of $i$ everywhere: the mirror image across the real axis.

            The one identity used constantly:
            $$|z|^2 = z^*z = a^2 + b^2 = r^2 \qquad\text{(always real and}\ge0)$$
            In QM, probabilities are $|\text{something}|^2$, which is why they come out real and non-negative even though the "something" is complex.

            ### Multiplying = stretch and rotate

            $z_1z_2 = r_1r_2\,e^{i(\theta_1 + \theta_2)}$: lengths multiply, angles add. So multiplying by $e^{i\alpha}$ (length 1) is a **pure rotation** by $\alpha$, and it never changes $|z|$. Such a factor is called a **phase factor**.

            Useful special values: $e^{i\pi/2} = i$, $e^{i\pi} = -1$, $e^{2\pi i} = 1$, $1/i = -i$.
          `),
          R(md`
            ### Adding = interference

            Adding arrows is where things get interesting. With $z_1 = r_1e^{i\theta_1}$, $z_2 = r_2e^{i\theta_2}$:
            $$|z_1 + z_2|^2 = |z_1|^2 + |z_2|^2 + 2\,\text{Re}(z_1^*z_2) = r_1^2 + r_2^2 + 2r_1r_2\cos(\theta_2 - \theta_1)$$
            The cross term depends only on the **relative phase** $\theta_2 - \theta_1$. Aligned arrows: $(r_1 + r_2)^2$. Opposite: $(r_1 - r_2)^2$, which is 0 if they have equal length. That cross term is every interference fringe in this course.

            ### Global vs relative phase

            Rotate *both* arrows by the same $e^{i\alpha}$: each $|z|$ is unchanged and the relative angle is unchanged, so $|z_1 + z_2|^2$ is unchanged. A phase multiplying everything (**global phase**) can never show up in a $|\ |^2$. A phase on one piece only (**relative phase**) can.

            ### Spinning arrows: time dependence

            $e^{-i\omega t}$ is an arrow of length 1 turning clockwise at angular frequency $\omega$. In QM a state of definite energy $E$ carries exactly this factor with $\omega = E/\hbar$. Two such pieces with different $\omega$'s drift in relative phase at the **difference** frequency, so $|z_1 + z_2|^2$ oscillates at $\omega_2 - \omega_1$: beats, exactly as with two tuning forks.

            ### Calculus with complex exponentials

            $\dfrac{d}{dx}e^{ikx} = ik\,e^{ikx}$ and $\dfrac{d^2}{dx^2}e^{ikx} = -k^2e^{ikx}$: differentiating just multiplies. Going back and forth: $\cos kx = \tfrac12(e^{ikx} + e^{-ikx})$, $\sin kx = \tfrac{1}{2i}(e^{ikx} - e^{-ikx})$. Conjugate of a product is the product of conjugates, and $(e^{i\theta})^* = e^{-i\theta}$ (flip every $i$).

            !!mistake Common mistakes
              - $|z|^2 = z^2$. Wrong for complex $z$: $(1 + i)^2 = 2i$, but $|1 + i|^2 = 2$. Always use $z^*z$.
              - $|z_1 + z_2|^2 = |z_1|^2 + |z_2|^2$. Only if the cross term vanishes.
              - Forgetting that $e^{i\theta}$ has length 1: $|Ae^{i\theta}| = |A|$.
          `),
          L(1, 'recognize'),
          Q(md`$|3 + 4i|^2 = $?`, ['25', '5', md`$-7 + 24i$`, '7'], 0,
            [null, 'That is |z|, not |z|².', md`That is $z^2$, not $|z|^2 = z^*z$.`, md`$9 - 16$ would be $\text{Re}(z^2)$.`],
            md`$3^2 + 4^2 = 25$.`),
          Q(md`$e^{i\pi} = $?`, ['−1', '1', 'i', '0'], 0,
            [null, md`That is $e^{2\pi i}$.`, md`That is $e^{i\pi/2}$.`, 'Phase factors have length 1, never 0.'],
            md`A half turn of the unit arrow: $\cos\pi + i\sin\pi = -1$.`),
          L(2, 'set up'),
          Q(md`$z = 2e^{i\pi/3}$. Then $z^* = $?`, [md`$2e^{-i\pi/3}$`, md`$-2e^{i\pi/3}$`, md`$\tfrac12e^{-i\pi/3}$`, md`$2e^{i\pi/3}$`], 0,
            [null, 'That rotates by π, not a mirror image.', 'Conjugation keeps the length.', 'Only real numbers equal their conjugate.'],
            'Flip the sign of i: same length, opposite angle.'),
          Q(md`Which is **always real**, for any complex $z$?`, [md`$z^*z$`, md`$z^2$`, md`$z - z^*$`, md`$iz$`], 0,
            [null, md`$i^2 = -1$; e.g. $(1 + i)^2 = 2i$.`, md`That is $2i\,\text{Im}\,z$: purely imaginary.`, 'Rotates z by 90°.'],
            md`$z^*z = |z|^2$. (Also $z + z^* = 2\,\text{Re}\,z$ is real.)`),
          L(3, 'standard'),
          P({
            title: 'Two equal arrows',
            q: md`Find $|1 + e^{i\varphi}|^2$ as a function of the relative phase $\varphi$.`,
            parts: [{ lbl: '|1 + e^{i\\varphi}|^2', expr: '2 + 2*cos(phi)', vars: { phi: [0, 6] } }],
            hints: [md`Use $|z_1 + z_2|^2 = |z_1|^2 + |z_2|^2 + 2\text{Re}(z_1^*z_2)$.`],
            sol: md`$1 + 1 + 2\cos\varphi = 2 + 2\cos\varphi = 4\cos^2(\varphi/2)$: 4 when in phase, 0 when opposite. This is the double-slit pattern.`,
          }),
          Q(md`$\dfrac{d}{dx}\left(e^{-3ix}\right) = $?`, [md`$-3i\,e^{-3ix}$`, md`$3i\,e^{-3ix}$`, md`$-3\,e^{-3ix}$`, md`$e^{-3ix}$`], 0,
            [null, 'Sign: the exponent carries −3i.', 'Missing the i.', 'The chain rule brings down the coefficient.'],
            md`Chain rule: bring down $-3i$.`),
          L(4, 'one twist'),
          P({
            title: 'Beats',
            q: md`Find $\left|e^{-iE_1t/\hbar} + e^{-iE_2t/\hbar}\right|^2$.`,
            parts: [{ lbl: '|\\ldots|^2', expr: '2 + 2*cos((E2 - E1)*t/hbar)', vars: { E1: [0.5, 2], E2: [2.5, 5], t: [0, 4], hbar: [0.5, 2] } }],
            hints: [md`Relative phase: $(E_2 - E_1)t/\hbar$.`],
            sol: md`$2 + 2\cos\left[(E_2 - E_1)t/\hbar\right]$. Each arrow spins, but only the difference in spin rates shows up: oscillation at $(E_2 - E_1)/\hbar$.`,
          }),
          Q(md`Multiply $z_1$ and $z_2$ both by $e^{i\alpha}$. Which changes?`, [md`$z_1 + z_2$ (but not $|z_1 + z_2|^2$)`, md`$|z_1 + z_2|^2$`, md`$|z_1|$`, 'the relative phase of z₁ and z₂'], 0,
            [null, 'Global rotation cannot change lengths.', 'Phase factors have length 1.', 'Both rotate by the same angle.'],
            'The sum rotates as a whole; its length does not change.'),
          L(5, 'exam level'),
          P({
            title: 'Powers by rotation',
            q: md`Compute $(1 + i)^8$.`,
            parts: [{ lbl: '(1 + i)^8', ans: 16 }],
            hints: [md`$1 + i = \sqrt2\,e^{i\pi/4}$.`],
            sol: md`$(\sqrt2)^8e^{i2\pi} = 16$. Polar form turns powers into "multiply the angle".`,
          }),
          Q(md`$\psi = \tfrac{1}{\sqrt2}\left(e^{i\alpha}u + e^{i\beta}v\right)$ with real functions $u$, $v$. $|\psi|^2$ depends on $\alpha$ and $\beta$ only through…`,
            [md`$\cos(\beta - \alpha)$`, md`$\alpha + \beta$`, md`$\alpha$ and $\beta$ separately`, 'it does not depend on them'], 0,
            [null, 'Sums of phases cancel against conjugates.', 'A global rotation by α can be removed.', 'The cross term carries the relative phase.'],
            md`$|\psi|^2 = \tfrac12\left[u^2 + v^2 + 2uv\cos(\beta - \alpha)\right]$.`),
          L(6, 'harder than the exam'),
          Q(md`$|z_1 + z_2| \le |z_1| + |z_2|$ always. When is it an equality?`, ['when z₁ and z₂ have the same phase (or one is 0)', 'when |z₁| = |z₂|', 'when they are perpendicular', 'always'], 0,
            [null, 'Equal lengths at opposite phases give 0.', 'Perpendicular: √(r₁² + r₂²), less than the sum.', 'Opposite arrows cancel.'],
            md`Triangle inequality: arrows add to full length only when aligned ($\cos = 1$ in the cross term).`),
        ],
        bank: [
          Q(md`$1/i = $?`, [md`$-i$`, md`$i$`, '1', '−1'], 0, [null, md`$i\cdot i = -1$, not 1.`, 'No.', 'No.'], md`Multiply top and bottom by $-i$.`),
          Q(md`$\text{Re}(z) = $?`, [md`$\tfrac12(z + z^*)$`, md`$\tfrac12(z - z^*)$`, md`$z^*z$`, md`$|z|$`], 0, [null, md`That is $i\,\text{Im}\,z$.`, md`That is $|z|^2$.`, 'Length, not the real part.'], 'Add the mirror image: imaginary parts cancel.'),
          Q(md`$|e^{i\theta}| = $?`, ['1', 'θ', 'cos θ', 'depends on θ'], 0, [null, 'θ is the angle.', 'That is the real part.', 'Always 1.'], md`$\cos^2 + \sin^2 = 1$.`),
        ],
      },

      // ------------------------------------------------------------------ B
      {
        id: 'tB-probability', topic: 'B', title: 'Probability: densities, averages, spreads',
        steps: [
          R(md`
            ### Why this comes next

            Quantum mechanics predicts **probabilities**, not single outcomes. The course writes them in physicists' notation, which differs from a statistics class. This is that notation.

            ### Discrete outcomes

            A measurement returns one of the values $a_1, a_2, \ldots$ with probabilities $P_1, P_2, \ldots$, where $\sum_nP_n = 1$.

            - **Average (expectation value)**, written with angle brackets: $\langle A\rangle = \sum_na_nP_n$. More generally $\langle f(A)\rangle = \sum_nf(a_n)P_n$.
            - **Variance** $\sigma_A^2 = \langle(A - \langle A\rangle)^2\rangle = \langle A^2\rangle - \langle A\rangle^2$; **standard deviation** $\sigma_A$ (the typical distance from the mean). In QM $\sigma_A$ is called the **uncertainty** in $A$.
            - $\langle A^2\rangle \ne \langle A\rangle^2$ in general: their difference *is* the spread. $\sigma_A = 0$ means one outcome happens with certainty.

            "Expectation value" is a misleading name: $\langle A\rangle$ is the **average over many identical repetitions**, and it need not be a value you can ever get (the average die roll is 3.5).

            ### Continuous outcomes: densities

            For a continuous variable like position, the probability of any exact point is zero; instead there is a **probability density** $\rho(x)$:
            $$P(a < x < b) = \int_a^b\rho(x)\,dx, \qquad \int_{-\infty}^{\infty}\rho\,dx = 1, \qquad \langle f(x)\rangle = \int f(x)\rho(x)\,dx$$
            If this looks like E&M, it is: $\rho(x)$ is a linear charge density with total charge 1 ("normalized"). $\langle x\rangle$ is the center of charge; $\sigma_x^2$ is the second moment about the center. And $\langle x^2\rangle = \sigma_x^2 + \langle x\rangle^2$ is literally the **parallel-axis theorem** from mechanics.

            $\rho$ has units of **1/length**, and it can exceed 1 (a narrow spike must be tall to have area 1).
          `),
          R(md`
            ### Shortcuts you will use every time

            - **Symmetry:** if $\rho$ is symmetric about $x_0$, then $\langle x\rangle = x_0$. If $\rho$ is even about 0, $\int x^{\text{odd}}\rho\,dx = 0$.
            - **Shift:** moving the distribution by $d$ shifts $\langle x\rangle$ by $d$ and leaves $\sigma$ alone.
            - **Stretch:** widening it by a factor $s$ multiplies $\sigma$ by $s$ (and divides the height by $s$, to keep the area 1).
            - Uniform on a length $L$: $\sigma = L/\sqrt{12} \approx 0.29L$. Good sanity check for "spread over a box".

            ### What "probability" means here

            Prepare many systems **identically** (an ensemble), measure each once. The fraction giving $a_n$ tends to $P_n$; the mean of the results tends to $\langle A\rangle$; their spread tends to $\sigma_A$. Statements about $\sigma_x$ and $\sigma_p$ in the uncertainty principle are statements about such ensembles.

            !!mistake Common mistakes
              - Treating $\rho(x)$ as a probability. Only $\rho\,dx$ (or its integral) is.
              - Writing $\sigma^2 = \langle x^2\rangle$ when the mean is not 0.
              - Expecting $\langle A\rangle$ to be a possible outcome.
          `),
          L(1, 'recognize'),
          Q(md`$\sigma_A = 0$ means…`, ['every measurement gives the same value', 'the average is 0', 'A cannot be measured', 'the distribution is symmetric'], 0,
            [null, 'Spread, not mean.', 'It means the opposite: the result is certain.', 'Symmetric distributions can be wide.'],
            'No spread: one outcome with probability 1.'),
          Q(md`In 1-D, a probability density $\rho(x)$ has units of…`, ['1/length', 'none', 'length', 'probability'], 0,
            [null, md`$\rho\,dx$ is dimensionless, so $\rho$ is not.`, 'Upside down.', 'Only ρ dx is a probability.'],
            md`$\int\rho\,dx = 1$.`),
          L(2, 'set up'),
          P({
            title: 'Two outcomes',
            q: md`A measurement gives 1 with probability $\tfrac14$ and 3 with probability $\tfrac34$. Find $\langle A\rangle$ and $\sigma_A$.`,
            parts: [{ lbl: '\\langle A\\rangle', ans: 2.5 }, { lbl: '\\sigma_A', ans: Math.sqrt(0.75) }],
            hints: [md`$\langle A^2\rangle = 1\cdot\tfrac14 + 9\cdot\tfrac34$.`],
            sol: md`$\langle A\rangle = \tfrac14 + \tfrac94 = 2.5$, $\langle A^2\rangle = 7$, $\sigma^2 = 7 - 6.25 = 0.75$, $\sigma = 0.866$.`,
          }),
          P({
            title: 'Exponential density',
            q: md`$\rho(x) = Ae^{-x/b}$ for $x > 0$, zero for $x < 0$. Find $A$ and $\langle x\rangle$.`,
            parts: [{ lbl: 'A', expr: '1/b', vars: { b: [0.5, 3] } }, { lbl: '\\langle x\\rangle', expr: 'b', vars: { b: [0.5, 3] } }],
            hints: [md`$\int_0^\infty x^ne^{-x/b}dx = n!\,b^{n+1}$.`],
            sol: md`$A\cdot b = 1 \Rightarrow A = 1/b$; $\langle x\rangle = \tfrac1b\cdot b^2 = b$.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Uniform spread',
            q: md`$\rho$ is uniform on $0 < x < L$. Find $\sigma_x$.`,
            parts: [{ lbl: '\\sigma_x', expr: 'L/sqrt(12)', vars: { L: [0.5, 3] } }],
            hints: [md`$\rho = 1/L$; $\langle x^2\rangle = L^2/3$.`],
            sol: md`$\langle x\rangle = L/2$, $\langle x^2\rangle = L^2/3$, $\sigma^2 = L^2/3 - L^2/4 = L^2/12$.`,
          }),
          Q(md`Can a probability density be larger than 1 somewhere?`, ['yes, if it is narrow enough', 'no, probabilities never exceed 1', 'only if it is not normalized', 'only for discrete outcomes'], 0,
            [null, 'Densities are not probabilities.', 'A normalized spike of width 0.1 has height ~10.', 'Discrete outcomes have probabilities, not densities.'],
            'Area 1, width small, so height big.'),
          L(4, 'one twist'),
          Q(md`You shift a distribution right by $d$ and stretch it by a factor 2 about its center. $\sigma$ becomes…`, [md`$2\sigma$`, md`$2\sigma + d$`, md`$\sigma + d$`, md`$4\sigma$`], 0,
            [null, 'Shifts never change the spread.', 'Shifts never change the spread.', 'σ scales linearly; σ² scales by 4.'],
            'Shift: no effect. Stretch by s: σ → sσ.'),
          Q(md`$\rho(x)$ is even about 0. Which **must** vanish?`, [md`$\langle x\rangle$ and $\langle x^3\rangle$`, md`$\langle x^2\rangle$`, md`$\sigma_x$`, md`$\langle |x|\rangle$`], 0,
            [null, 'Even powers of an even density are positive.', 'The spread can be anything.', md`$|x|$ is even and positive.`],
            'Odd function × even density integrates to 0.'),
          L(5, 'exam level'),
          P({
            title: 'Parabolic density',
            q: md`$\rho(x) = \tfrac34(1 - x^2)$ on $-1 < x < 1$. Find $\sigma_x$.`,
            parts: [{ lbl: '\\sigma_x', ans: 1 / Math.sqrt(5) }],
            hints: [md`$\langle x\rangle = 0$ by symmetry.`],
            sol: md`$\langle x^2\rangle = \tfrac34\int_{-1}^1(x^2 - x^4)dx = \tfrac34\left(\tfrac23 - \tfrac25\right) = \tfrac15$, so $\sigma = 1/\sqrt5 = 0.447$. Narrower than uniform on the same interval ($1/\sqrt3 = 0.577$): weight is concentrated in the middle.`,
          }),
          L(6, 'harder than the exam'),
          Q(md`Which statement about $\langle x^2\rangle$, $\langle x\rangle^2$ and $\sigma_x^2$ is always true?`, [md`$\langle x^2\rangle \ge \langle x\rangle^2$, with equality only when $\sigma_x = 0$`, md`$\langle x^2\rangle = \langle x\rangle^2$`, md`$\langle x^2\rangle \le \langle x\rangle^2$`, md`$\langle x^2\rangle \ge \sigma_x^2 + 2\langle x\rangle^2$`], 0,
            [null, 'Only for zero spread.', 'Backwards.', md`The relation is exactly $\langle x^2\rangle = \sigma^2 + \langle x\rangle^2$.`],
            md`$\sigma^2 = \langle(x - \langle x\rangle)^2\rangle \ge 0$ (average of a square). Parallel-axis theorem.`),
        ],
        bank: [
          Q(md`$\langle A\rangle$ is best described as…`, ['the average over many identical preparations', 'the most likely single result', 'the result of one measurement', 'the largest possible value'], 0,
            [null, 'That is the mode.', 'Single results are outcomes, not averages.', 'No.'], 'Ensemble average.'),
          Q(md`$\sigma_A^2 = $?`, [md`$\langle A^2\rangle - \langle A\rangle^2$`, md`$\langle A\rangle^2 - \langle A^2\rangle$`, md`$\langle A^2\rangle$`, md`$\langle A - A^2\rangle$`], 0,
            [null, 'That is ≤ 0.', 'Only if the mean is 0.', 'Meaningless.'], 'Mean of the square minus square of the mean.'),
        ],
      },

      // ------------------------------------------------------------------ C
      {
        id: 'tC-vectors', topic: 'C', title: 'Vectors, operators and Dirac notation',
        steps: [
          R(md`
            ### Why vectors

            A quantum **state** (everything there is to know about the system) is a **vector**. Not an arrow in real space: a vector in an abstract space whose components are complex numbers, and possibly infinitely many of them. Superposition, the core of QM, is just vector addition. Measurement is taking components. This lesson builds the toolkit from the 3-D vectors you know.

            ### From $\vec E$ to $\ket\psi$

            | 3-D vectors (E&M) | Quantum states |
            |---|---|
            | $\vec E = E_x\hat x + E_y\hat y + E_z\hat z$ | $\ket\psi = c_1\ket{e_1} + c_2\ket{e_2} + \cdots = \sum_nc_n\ket{e_n}$ |
            | real components | complex components $c_n$ |
            | 3 directions | any number, even infinitely many |
            | $\vec A\cdot\vec B = \sum A_iB_i$ | $\braket{\phi\vert \psi} = \sum_n\phi_n^*\psi_n$ (note the conjugate) |
            | $E_x = \hat x\cdot\vec E$ | $c_n = \braket{e_n\vert \psi}$ |
            | $\hat x\cdot\hat y = 0$, $\hat x\cdot\hat x = 1$ | $\braket{e_m\vert e_n} = \delta_{mn}$ |

            **Notation, piece by piece:**
            - $\ket\psi$, a **ket**, is the state vector. The symbol inside is just a name: $\ket\psi$, $\ket{3}$, $\ket{+}$, $\ket{E_2}$ are all labels. Think of it as a column of components.
            - $\bra\psi$, a **bra**, is the same vector turned into a row **and complex-conjugated**: components $c_n^*$.
            - $\braket{\phi|\psi}$ (bra times ket, a "bra-ket") is the **inner product**, a single complex number: row times column, $\sum_n\phi_n^*\psi_n$.
            - $\delta_{mn}$ (the **Kronecker delta**) is 1 if $m = n$ and 0 otherwise. "$\braket{e_m|e_n} = \delta_{mn}$" says the basis vectors are perpendicular unit vectors: an **orthonormal basis**.

            **Why the conjugate?** So that the length squared $\braket{\psi|\psi} = \sum|c_n|^2$ is real and positive. Without it, $(1, i)\cdot(1, i) = 1 - 1 = 0$, a nonzero vector with zero length. Consequences: $\braket{\phi|\psi}^* = \braket{\psi|\phi}$ (swapping conjugates), and a constant pulled out of a bra gets conjugated.

            **Normalized** means $\braket{\psi|\psi} = 1$. A **Hilbert space** is the name for such a complex vector space with this inner product (plus a technical completeness condition); in this course it just means "the space the states live in".

            !!key Two kinds of angle brackets
              With a bar inside, $\braket{\phi|\psi}$ is the **inner product** of two vectors: one complex number. With no bar, $\langle A\rangle$ is the **average** of measured values (Lesson B). They are connected on purpose: the average of $A$ in state $\ket\psi$ is the "sandwich" $\langle A\rangle = \bra\psi\hat A\ket\psi$ (below).
          `),
          R(md`
            ### Functions are vectors too

            A function $f(x)$ is a vector with one component for each point $x$: infinitely many, labeled continuously. The sum in the inner product becomes an integral:
            $$\braket{f|g} = \int f^*(x)\,g(x)\,dx, \qquad \braket{f|f} = \int|f|^2dx$$
            You already did linear algebra with functions in E&M: separation of variables expanded a boundary potential in $\sin(n\pi x/a)$ and found the coefficients with "Fourier's trick" (multiply by $\sin(m\pi x/a)$ and integrate). That *is* $c_m = \braket{e_m|f}$ with the orthonormal basis $e_n(x) = \sqrt{2/a}\sin(n\pi x/a)$. Wavefunctions are exactly this.

            ### Operators

            An **operator** (written with a hat, $\hat A$) turns a vector into another vector, linearly: $\hat A(a\ket\psi + b\ket\phi) = a\hat A\ket\psi + b\hat A\ket\phi$.
            - On column vectors: a **matrix**. Its entries are $A_{mn} = \bra{e_m}\hat A\ket{e_n}$ (row $m$, column $n$): the $m$-component of what $\hat A$ does to the $n$th basis vector.
            - On functions: things like "multiply by $x$" ($\hat x$) or "differentiate" ($d/dx$).
            - $\bra\phi\hat A\ket\psi$ (a "sandwich", or **matrix element**) means: apply $\hat A$ to $\ket\psi$, then take the inner product with $\ket\phi$. For functions: $\int\phi^*(x)\,[\hat A\psi](x)\,dx$.

            **Order matters.** Operators, like matrices (or like rotations in 3-D), do not generally commute. The **commutator** $[\hat A, \hat B] = \hat A\hat B - \hat B\hat A$ measures the failure. Example on any test function $f$: $\left[\hat x, \tfrac{d}{dx}\right]f = xf' - (xf)' = -f$, so $[\hat x, d/dx] = -1$.

            ### Eigenvectors

            $\hat A\ket v = \lambda\ket v$: the operator only rescales $\ket v$, by the **eigenvalue** $\lambda$. For a matrix, solve $\det(A - \lambda I) = 0$, then plug each $\lambda$ back in. For a differential operator it is a differential equation: $\tfrac{d}{dx}e^{kx} = k\,e^{kx}$, $\tfrac{d^2}{dx^2}\sin kx = -k^2\sin kx$.
          `),
          R(md`
            ### Adjoint and Hermitian

            The **adjoint** $\hat A^\dagger$ ("A dagger") is the operator that does the same job acting to the left: $\braket{\phi|\hat A\psi} = \braket{\hat A^\dagger\phi|\psi}$ for all vectors. For a matrix, it is the **conjugate transpose** ($A^\dagger_{mn} = A_{nm}^*$). The bra of $\hat A\ket\psi$ is $\bra\psi\hat A^\dagger$, and $(\hat A\hat B)^\dagger = \hat B^\dagger\hat A^\dagger$.

            An operator with $\hat A^\dagger = \hat A$ is **Hermitian** (self-adjoint). The theorem that makes QM work: a Hermitian operator has
            1. **real** eigenvalues,
            2. eigenvectors for different eigenvalues that are **orthogonal**,
            3. enough eigenvectors to form a complete **basis**.

            So every Hermitian operator hands you an orthonormal basis to expand states in, labeled by real numbers. That is why measurable quantities are Hermitian operators: their eigenvalues are the possible results.

            **Example worth knowing.** $\hat x$ (multiply by $x$) is Hermitian. $d/dx$ is **not**: integrating by parts moves it onto the other function with a minus sign, $\int f^*g'\,dx = -\int(f')^*g\,dx$ (boundary terms vanish for normalizable functions), so $(d/dx)^\dagger = -d/dx$. Multiplying by $-i$ fixes the sign: $-i\,d/dx$ *is* Hermitian. That is why momentum is $\hat p = -i\hbar\,d/dx$, with the $i$.

            ### The Hamiltonian

            From classical mechanics: the Hamiltonian is the total energy written in terms of position and momentum, $H = \dfrac{p^2}{2m} + V(x)$. Quantum mechanics keeps the formula and promotes $x$ and $p$ to operators:
            $$\hat H = \frac{\hat p^2}{2m} + V(\hat x) = -\frac{\hbar^2}{2m}\frac{d^2}{dx^2} + V(x)$$
            Its eigenvalues are the allowed energies, and (Topic 2) it drives time evolution.

            ### Outer products

            $\ket a\bra b$ (ket times bra, column times row) is an **operator**: acting on $\ket\psi$ it gives $\ket a\,\braket{b|\psi}$, the vector $\ket a$ scaled by a number. With a unit vector, $\ket e\bra e$ is the **projector** onto $\ket e$: it keeps the component along $\ket e$ (like $\hat x(\hat x\cdot\vec E)$). Summing projectors over a whole orthonormal basis gives the identity, $\sum_n\ket{e_n}\bra{e_n} = \hat 1$ (**completeness**).
          `),
          L(1, 'recognize'),
          Q(md`$\ket\psi = \begin{pmatrix}1\\ i\end{pmatrix}$. Then $\bra\psi$ is…`, [md`$(1,\ -i)$`, md`$(1,\ i)$`, md`$\begin{pmatrix}1\\ -i\end{pmatrix}$`, md`$(-1,\ -i)$`], 0,
            [null, 'Forgot to conjugate.', 'A bra is a row.', 'Only the i flips sign.'],
            'Transpose and conjugate.'),
          Q(md`$\delta_{23} + \delta_{33} = $?`, ['1', '0', '2', '5'], 0,
            [null, md`$\delta_{33} = 1$.`, md`$\delta_{23} = 0$.`, 'The Kronecker delta is 0 or 1.'],
            md`$0 + 1$.`),
          Q(md`A hat, as in $\hat H$ or $\hat p$, means…`, ['an operator', 'a unit vector', 'an average', 'a Fourier transform'], 0,
            [null, md`Unit vectors like $\hat x$ also wear hats in E&M; in QM the hat on $\hat x$ usually means the position operator. Context decides.`, md`Averages use $\langle\ \rangle$.`, 'No.'],
            'Operators act on states.'),
          L(2, 'set up'),
          P({
            title: 'Length of a complex vector',
            q: md`$\ket\psi = \begin{pmatrix}1\\ 2i\end{pmatrix}$. Find $\braket{\psi|\psi}$, and the constant $N$ that makes $N\ket\psi$ normalized.`,
            parts: [{ lbl: '\\langle\\psi|\\psi\\rangle', ans: 5 }, { lbl: 'N', ans: 1 / Math.sqrt(5) }],
            hints: [md`$|1|^2 + |2i|^2$.`],
            sol: md`$1 + 4 = 5$; $N = 1/\sqrt5$.`,
          }),
          Q(md`Which function is **not** an eigenfunction of $d^2/dx^2$?`, [md`$x^2$`, md`$\sin 3x$`, md`$e^{2x}$`, md`$e^{-ikx}$`], 0,
            [null, md`Eigenvalue $-9$.`, md`Eigenvalue $4$.`, md`Eigenvalue $-k^2$.`],
            md`$(x^2)'' = 2$, not a multiple of $x^2$.`),
          L(3, 'standard'),
          Q(md`$\ket\psi = \tfrac15\left(3\ket{e_1} + 4i\ket{e_2}\right)$ with orthonormal $\ket{e_n}$. $\braket{e_2|\psi} = $?`, [md`$4i/5$`, md`$-4i/5$`, md`$4/5$`, md`$16/25$`], 0,
            [null, md`The conjugate acts on the bra $\bra{e_2}$, whose components are real here.`, 'Keep the i.', 'That is a probability, |c₂|².'],
            md`Orthonormality kills the $\ket{e_1}$ term: $c_2 = \tfrac{4i}{5}$.`),
          P({
            title: 'Inner product of functions',
            q: md`Compute $\braket{f|g} = \int_0^\pi f^*g\,dx$ for $f = g = \sin x$.`,
            parts: [{ lbl: '\\langle f|g\\rangle', ans: Math.PI / 2 }],
            hints: [md`$\sin^2 = \tfrac12(1 - \cos 2x)$.`],
            sol: md`$\pi/2$. So $\sqrt{2/\pi}\sin x$ is normalized on $[0, \pi]$, the pattern behind $\sqrt{2/a}$.`,
          }),
          L(4, 'one twist'),
          Q(md`For a matrix, $\bra{e_1}\hat A\ket{e_2}$ is…`, ['the entry in row 1, column 2', 'the entry in row 2, column 1', 'the trace', 'an eigenvalue'], 0,
            [null, 'Bra picks the row, ket the column.', 'One entry only.', 'Only for diagonal matrices in their eigenbasis.'],
            md`$\hat A\ket{e_2}$ is column 2; the bra $\bra{e_1}$ picks its first component.`),
          Q(md`Why does $\hat p$ contain an $i$?`, [md`$d/dx$ alone is anti-Hermitian; $-i\,d/dx$ is Hermitian, so it has real eigenvalues`, 'to make momentum complex', 'because waves are complex', 'it is a convention with no consequence'], 0,
            [null, 'Measured momenta are real.', 'True but not the reason.', md`Without it, $\langle p\rangle$ of a real wavefunction would be imaginary and eigenvalues would be imaginary.`],
            md`$(d/dx)^\dagger = -d/dx$ by parts; $(-i\,d/dx)^\dagger = (+i)(-d/dx) = -i\,d/dx$ ✓.`),
          L(5, 'exam level'),
          Q(md`Using $[\hat x, d/dx] = -1$, the commutator $[\hat x, \hat p]$ with $\hat p = -i\hbar\,d/dx$ is…`, [md`$i\hbar$`, md`$-i\hbar$`, md`$\hbar$`, '0'], 0,
            [null, md`$(-i\hbar)(-1) = +i\hbar$.`, 'Missing the i.', 'They do not commute.'],
            md`$[\hat x, \hat p] = -i\hbar[\hat x, d/dx] = i\hbar$. The most important equation in the course.`),
          P({
            title: 'Eigenvalues of a 2×2',
            q: md`Find the eigenvalues of $\begin{pmatrix}3 & 1\\ 1 & 3\end{pmatrix}$. Enter the larger.`,
            parts: [{ lbl: '\\lambda_{\\max}', ans: 4 }],
            hints: [md`$\det\begin{pmatrix}3 - \lambda & 1\\ 1 & 3 - \lambda\end{pmatrix} = (3 - \lambda)^2 - 1 = 0$.`],
            sol: md`$3 - \lambda = \pm1$: $\lambda = 4, 2$. Eigenvectors $(1, 1)$ and $(1, -1)$: orthogonal, as for any Hermitian matrix.`,
          }),
          L(6, 'harder than the exam'),
          Q(md`Why must a Hermitian operator have real eigenvalues? Take $\hat A\ket v = \lambda\ket v$ and compute $\bra v\hat A\ket v$ two ways.`,
            [md`$\lambda\braket{v|v} = \lambda^*\braket{v|v}$, and $\braket{v|v} > 0$, so $\lambda = \lambda^*$`, md`because $\braket{v|v} = 1$`, md`because $\hat A$ is a real matrix`, md`because $\lambda = \bra v\hat A\ket v$ is a length`], 0,
            [null, 'Normalization alone does not do it.', 'Hermitian matrices can have complex entries.', 'Not an argument.'],
            md`Acting right: $\lambda\braket{v|v}$. Acting left with $\hat A^\dagger = \hat A$: $\lambda^*\braket{v|v}$.`),
          Q(md`Which is the classical-to-quantum Hamiltonian for a particle of mass $m$ in a uniform gravitational field?`, [md`$-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2} + mgx$`, md`$\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2} + mgx$`, md`$-i\hbar\tfrac{d}{dx} + mgx$`, md`$-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2} - mg$`], 0,
            [null, md`$\hat p^2 = (-i\hbar)^2d^2/dx^2 = -\hbar^2d^2/dx^2$.`, 'That is p, not p²/2m.', 'V is the potential energy mgx, not the force.'],
            md`$H = p^2/2m + mgx$ with $\hat p = -i\hbar\,d/dx$.`),
        ],
        bank: [
          Q(md`$\braket{\phi|\psi}^* = $?`, [md`$\braket{\psi|\phi}$`, md`$\braket{\phi|\psi}$`, md`$-\braket{\phi|\psi}$`, md`$\braket{\phi^*|\psi^*}$`], 0, [null, 'Only if real.', 'No.', 'Not notation used here.'], 'Swap = conjugate.'),
          Q(md`$\ket a\bra b$ is…`, ['an operator (a matrix)', 'a number', 'a ket', 'a bra'], 0, [null, md`$\braket{b|a}$ is the number.`, 'It acts on kets.', 'No.'], 'Column × row.'),
          Q(md`An orthonormal basis satisfies…`, [md`$\braket{e_m|e_n} = \delta_{mn}$`, md`$\braket{e_m|e_n} = 1$`, md`$\ket{e_m}\bra{e_n} = \delta_{mn}$`, md`$\braket{e_m|e_n} = 0$`], 0, [null, 'Only for m = n.', 'That is an operator.', 'Only for m ≠ n.'], 'Perpendicular unit vectors.'),
          Q(md`A Hermitian matrix's diagonal entries are…`, ['real', 'zero', 'imaginary', 'equal'], 0, [null, 'Not necessarily.', md`$A_{nn} = A_{nn}^*$.`, 'No.'], md`$A_{nn} = A_{nn}^*$.`),
        ],
      },

      // ------------------------------------------------------------------ D
      {
        id: 'tD-fourier', topic: 'D', title: 'Fourier transforms and the delta function',
        steps: [
          R(md`
            ### Why

            Two tools appear the moment we leave the infinite well: the **Fourier transform** (to build a localized particle out of waves of definite momentum) and the **Dirac delta function** (to talk about a particle at one exact point, or a wave of one exact $k$). Both are continuous versions of things you know.

            ### From Fourier series to Fourier transform

            On an interval, a function is a *sum* of sines and cosines with discrete wavenumbers (E&M, separation of variables). On the whole line every wavenumber $k$ is allowed, and the sum becomes an integral over plane waves $e^{ikx}$ (wavelength $2\pi/k$):
            $$f(x) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}F(k)\,e^{ikx}\,dk \qquad\Longleftrightarrow\qquad F(k) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}f(x)\,e^{-ikx}\,dx$$
            Read it as: $F(k)$ is **how much of the wave $e^{ikx}$** is in $f$. The second formula is "Fourier's trick" again: the component of $f$ along $e^{ikx}$ (note the conjugate, $e^{-ikx}$). The symmetric $1/\sqrt{2\pi}$ is the convention Griffiths and this course use; with it, $\int|f|^2dx = \int|F|^2dk$ (Plancherel), so a normalized $\psi$ gives a normalized $\phi(k)$.

            ### The facts you actually use

            - **Width trade-off:** narrow $f$ ⇔ wide $F$. A function of width $\Delta x$ needs wavenumbers spread over $\Delta k \sim 1/\Delta x$ to cancel outside that width. This is the uncertainty principle in embryo.
            - **Pairs:** Gaussian $e^{-ax^2}$ ↔ Gaussian $e^{-k^2/4a}$; box of half-width $L$ ↔ $\dfrac{\sin kL}{k}$ ("sinc"); $e^{-a|x|}$ ↔ $\dfrac{1}{a^2 + k^2}$ (Lorentzian).
            - **Shift in $k$:** multiplying $f(x)$ by $e^{ik_0x}$ shifts $F$ to center $k_0$. (Gives a packet momentum $\hbar k_0$.)
            - **Shift in $x$:** $f(x - x_0)$ has transform $e^{-ikx_0}F(k)$: same $|F|$, new phases.
          `),
          R(md`
            ### The Dirac delta function

            $\delta(x - a)$ is an infinitely narrow, infinitely tall spike at $x = a$ with **area 1**. You met it in E&M as the charge density of a point charge: $\rho(\vec r) = q\,\delta^3(\vec r - \vec r_0)$. Everything follows from its one defining property, **sifting**:
            $$\int_{-\infty}^{\infty}f(x)\,\delta(x - a)\,dx = f(a)$$
            - Units: 1/length (it integrates to 1 over $dx$).
            - Zero if the spike is outside the integration range.
            - $\delta(cx) = \delta(x)/|c|$ (squeeze the spike, keep the area).
            - It appears as the derivative of a jump: if $f$ has a kink (slope jumps by $\Delta$), then $f''$ contains $\Delta\cdot\delta$. Example: $\tfrac{d^2}{dx^2}|x| = 2\delta(x)$.
            - Plane waves add up to it: $\dfrac{1}{2\pi}\displaystyle\int e^{ik(x - x')}dk = \delta(x - x')$. All the waves are in phase at $x = x'$ and cancel everywhere else.

            ### Two kinds of delta, one idea

            For a discrete orthonormal basis, $\braket{e_m|e_n} = \delta_{mn}$ (Kronecker). For a continuous basis, labeled by a real number like position $x$, the same statement is $\braket{x|x'} = \delta(x - x')$ (Dirac), and sums become integrals. These continuous basis vectors cannot be normalized to 1 (a particle at exactly one point, or a plane wave of exactly one $k$, is an idealization), which is exactly why physical states are always packets.

            !!mistake Common mistakes
              - Thinking $\delta(0) = 1$. It is infinite; only its area is 1.
              - Forgetting the conjugate $e^{-ikx}$ in the transform.
              - Expecting narrow $f$ to have narrow $F$. Opposite.
          `),
          L(1, 'recognize'),
          Q(md`$\int_{-\infty}^{\infty}x^2\,\delta(x - 2)\,dx = $?`, ['4', '2', '0', '1'], 0,
            [null, 'Evaluate the function, not x.', 'The spike is inside the range.', 'That is the area of δ alone.'],
            'Sifting: f(2) = 4.'),
          Q(md`A function gets **narrower** in $x$. Its Fourier transform gets…`, ['wider', 'narrower', 'taller and the same width', 'unchanged'], 0,
            [null, 'Opposite: Δx Δk ~ 1.', 'Width must change.', 'Shapes transform together.'],
            'Narrow features need many wavelengths to build.'),
          L(2, 'set up'),
          P({
            title: 'Sifting with a cosine',
            q: md`Compute $\int_{-\infty}^{\infty}\cos x\;\delta(x - \pi)\,dx$.`,
            parts: [{ lbl: 'I', ans: -1 }],
            hints: [md`Evaluate $\cos$ at the spike.`],
            sol: md`$\cos\pi = -1$.`,
          }),
          Q(md`$\int_0^\infty\delta(x + 1)\,dx = $?`, ['0', '1', '½', '−1'], 0,
            [null, 'The spike sits at x = −1, outside the range.', 'Not at an endpoint.', 'Areas of δ are positive.'],
            'Nothing to pick up.'),
          L(3, 'standard'),
          Q(md`$f(x)e^{ik_0x}$ has Fourier transform…`, [md`$F(k - k_0)$`, md`$F(k + k_0)$`, md`$e^{ik_0k}F(k)$`, md`$k_0F(k)$`], 0,
            [null, 'Sign: the peak moves to +k₀.', 'That is the x-shift rule (with x and k mixed up).', 'No.'],
            md`$\tfrac{1}{\sqrt{2\pi}}\int fe^{ik_0x}e^{-ikx}dx = F(k - k_0)$.`),
          Q(md`$\delta(2x) = $?`, [md`$\tfrac12\delta(x)$`, md`$2\delta(x)$`, md`$\delta(x)$`, md`$\delta(x/2)$`], 0,
            [null, 'Squeezing the argument narrows the spike; area must drop.', 'Integrate both: they differ by a factor 2.', 'No.'],
            md`Substitute $u = 2x$: $\int\delta(2x)dx = \tfrac12$.`),
          L(4, 'one twist'),
          Q(md`$f(x) = e^{-\lambda|x|}$ has a kink at 0. What does $f''$ contain there?`, [md`$-2\lambda\,\delta(x)$`, md`$2\lambda\,\delta(x)$`, md`nothing: $f'' = \lambda^2 f$ everywhere`, md`$\lambda^2\delta(x)$`], 0,
            [null, md`The slope jumps from $+\lambda$ to $-\lambda$: a drop of $2\lambda$.`, 'Away from 0 yes, but the slope jumps at 0.', 'The jump is in the slope, size 2λ.'],
            md`$f' = -\lambda\,\text{sgn}(x)f$; the jump of $-2\lambda$ at 0 gives $-2\lambda\delta(x)$ in $f''$. This is why $\langle p^2\rangle$ is safer as $\hbar^2\int|f'|^2$.`),
          L(5, 'exam level'),
          Q(md`Why can't $e^{ikx}$ be normalized, and what replaces $\braket{k|k'} = 1$?`, [md`$\int|e^{ikx}|^2dx = \infty$; instead $\int e^{-ikx}e^{ik'x}dx = 2\pi\delta(k - k')$`, md`It can be normalized with a factor $1/\sqrt{2\pi}$`, md`Its integral is 0`, md`It is normalized because $|e^{ikx}| = 1$`], 0,
            [null, md`That factor makes the delta come out with coefficient 1, but the integral of $|e^{ikx}|^2$ is still infinite.`, 'It is the modulus squared that matters, and that is 1 everywhere.', 'Pointwise 1, integrated ∞.'],
            'Delta normalization: orthogonal for k ≠ k′, infinite at k = k′.'),
          L(6, 'harder than the exam'),
          Q(md`A box of half-width $L$ has transform $\propto\sin(kL)/k$. Where does nearly all of $|F|^2$ live, and how does that compare with $\sigma_x$?`, [md`within $|k| \lesssim \pi/L$; product of widths $\sim\pi$, consistent with $\Delta x\Delta k \gtrsim \tfrac12$`, md`within $|k| < L$`, md`uniformly over all k`, md`at $k = \pm\pi/L$ only`], 0,
            [null, 'Units: k has units 1/length.', 'It decays like 1/k² in |F|².', 'Those are the first zeros.'],
            md`Central lobe between the first zeros $\pm\pi/L$. (Its $\langle k^2\rangle$ is actually infinite because of the sharp edges: corners cost unbounded momentum.)`),
        ],
        bank: [
          Q(md`$\delta(x)$ has units of…`, ['1/length (if x is a length)', 'none', 'length', 'it depends on the function'], 0, [null, md`$\int\delta\,dx = 1$.`, 'Upside down.', 'Fixed by its definition.'], 'Like a 1-D density.'),
          Q(md`In $F(k) = \tfrac{1}{\sqrt{2\pi}}\int f(x)e^{-ikx}dx$, $F(k)$ means…`, [md`the amplitude of the wave $e^{ikx}$ in $f$`, md`$f$ evaluated at $x = k$`, md`the derivative of $f$`, md`the probability of position $k$`], 0, [null, 'Different variable.', 'No.', 'k is a wavenumber.'], 'Component along e^{ikx}.'),
        ],
      },
    ],
  });
})();

/* Puts a "notation and background" primer at the top of every topic lesson, so each symbol is defined before it is
   used, and adds the notation glossary (#/notation). Loaded after all lesson files. Unit 0 (u0-language.js) teaches
   the underlying math; these primers link back to it. */
(function () {
  'use strict';
  const { R } = C;
  const A = '[A](#/l/tA-complex)', B = '[B](#/l/tB-probability)', Cv = '[C](#/l/tC-vectors)', D = '[D](#/l/tD-fourier)';

  const PRE = {
    't1-quanta': md`
      - $f$ is frequency (cycles per second), $\omega = 2\pi f$ angular frequency, $\lambda$ wavelength, $k = 2\pi/\lambda$ **wavenumber** (radians per meter). For any wave, $e^{i(kx - \omega t)}$ moves right at $\omega/k$.
      - $h = 6.626\times10^{-34}$ J·s is Planck's constant; $\hbar = h/2\pi$ ("h-bar") is the version that goes with $\omega$ and $k$: $E = hf = \hbar\omega$, $p = h/\lambda = \hbar k$.
      - **eV** (electron-volt): the energy an electron gains through 1 V, $1.602\times10^{-19}$ J. Atomic energies are a few eV.
      - **Blackbody**: light emitted by a hot object. Classical E&M + thermodynamics gives every frequency mode the same average energy, which diverges at high $f$ (the "ultraviolet catastrophe"); Planck fixed it by letting each mode hold energy only in lumps $hf$.
      - **Work function** $\phi$: the minimum energy to pull an electron out of a metal.
      - A photon has no mass: $E = pc$, so $p = E/c = h/\lambda$.
      - **Amplitude**: a complex number whose modulus squared is a probability. Lesson ${A} covers complex numbers, $|z|^2 = z^*z$ and interference.
    `,
    't2-postulates': md`
      This lesson is written in **Dirac notation**. Here it is from the ground up, in the order you need it, using a system with two possible outcomes so every object is a small column or matrix.

      **1. Ket.** $\ket\psi$ is a **column vector** with complex entries. Whatever sits inside the $|\ \rangle$ is only a name tag: $\ket\psi$, $\ket3$, $\ket+$, $\ket{E_2}$ are all just labels for vectors.
      $$\ket\psi = \begin{pmatrix}c_1\\ c_2\end{pmatrix}$$

      **2. Bra.** $\bra\psi$ is the same vector laid on its side as a **row**, with every entry **complex-conjugated**: $\bra\psi = (c_1^*,\ c_2^*)$.

      **3. Bra-ket (inner product).** A bra followed by a ket, $\braket{\phi|\psi}$, is row times column: **one complex number**, the complex version of a dot product. Note the vertical bar in the middle.
      $$\braket{\phi|\psi} = \phi_1^*\psi_1 + \phi_2^*\psi_2$$
      - $\braket{\psi|\psi} = |c_1|^2 + |c_2|^2$ is the length squared, real and positive (that is what the conjugate is for). **Normalized** means $\braket{\psi|\psi} = 1$.
      - $\braket{\phi|\psi} = 0$ means **orthogonal** (perpendicular).
      - Reversing the order conjugates: $\braket{\psi|\phi} = \braket{\phi|\psi}^*$.

      Example: $\ket\phi = \begin{pmatrix}1\\ 0\end{pmatrix}$, $\ket\psi = \tfrac{1}{\sqrt2}\begin{pmatrix}1\\ i\end{pmatrix}$. Then $\bra\psi = \tfrac1{\sqrt2}(1,\ -i)$, $\braket{\psi|\psi} = \tfrac12(1 + 1) = 1$, and $\braket{\phi|\psi} = \tfrac{1}{\sqrt2}$.

      **4. Orthonormal basis.** A set of unit vectors $\ket{a_1}, \ket{a_2}, \ldots$ that are mutually perpendicular, like $\hat x, \hat y, \hat z$:
      $$\braket{a_m|a_n} = \delta_{mn}$$
      $\delta_{mn}$, the **Kronecker delta**, is 1 when $m = n$ and 0 otherwise. Example: $\ket{a_1} = \begin{pmatrix}1\\ 0\end{pmatrix}$, $\ket{a_2} = \begin{pmatrix}0\\ 1\end{pmatrix}$.

      **5. Components.** Any state is a combination of basis vectors, $\ket\psi = \sum_nc_n\ket{a_n}$, and you get each coefficient by taking the inner product with that basis vector:
      $$c_n = \braket{a_n|\psi}$$
      exactly like $E_x = \hat x\cdot\vec E$. The $c_n$ are complex numbers called **amplitudes**.

      **6. Operator.** $\hat A$ (the hat marks an operator) turns a ket into another ket, linearly: in a basis, it is a **matrix** multiplying the column. An **eigenvector** of $\hat A$ is a ket it only stretches, $\hat A\ket{a_n} = a_n\ket{a_n}$; the stretch factor $a_n$ is the **eigenvalue**.

      **7. Dagger and Hermitian.** $\hat A^\dagger$ ("A dagger") is the **conjugate transpose** of the matrix. If $\hat A^\dagger = \hat A$ the operator is **Hermitian**, which guarantees real eigenvalues and eigenvectors that form an orthonormal basis.

      **8. Sandwich.** $\bra\phi\hat A\ket\psi$ means: apply $\hat A$ to $\ket\psi$ (a new column), then take the inner product with $\bra\phi$. One number.

      !!key Two kinds of angle brackets
        With a bar inside, $\braket{\phi|\psi}$ is an **inner product** of two vectors. With no bar, $\langle A\rangle$ is the **average** of the measured values of $A$ (the "expectation value", Lesson ${B}). The notation is built so the two connect: the average of $A$ in the state $\ket\psi$ is the sandwich
        $$\langle A\rangle = \bra\psi\hat A\ket\psi$$
        Check it: $\hat A\ket\psi = \sum_nc_na_n\ket{a_n}$, and the inner product with $\bra\psi$ gives $\sum_na_n|c_n|^2$, which is each value times its probability, summed.

      **Also used below.** The **Hilbert space** is the space these vectors live in. $\sigma_A$ is the standard deviation of the results (Lesson ${B}); an **ensemble** is many identically prepared copies. $\hat H$, the **Hamiltonian**, is the energy operator: the classical $H = p^2/2m + V$ with $x$ and $p$ made into operators. The Schrödinger equation $i\hbar\frac{d}{dt}\ket\psi = \hat H\ket\psi$ is first order in time, so the state now fixes the state later (no "initial velocity" needed, unlike Newton).
    `,
    't3-wavefunction': md`
      - **What $\braket{x|\psi}$ means.** $\ket x$ is the state "particle exactly at $x$" (a position eigenstate). These form a basis labeled by a continuous number, so the components of $\ket\psi$ along them form a function: $\Psi(x) = \braket{x|\psi}$, the **wavefunction**. It is the continuous version of $c_n$, and $|\Psi(x)|^2dx$ is Born's rule for position. Sums over $n$ become integrals over $x$: $\braket{\phi|\psi} = \int\phi^*\psi\,dx$. (Lessons ${Cv}, ${D}.)
      - $\Psi(x,t)$ (capital) is the full time-dependent wavefunction; $\psi(x)$ (lowercase) is usually a spatial part. $\partial/\partial x$, $\partial/\partial t$ are partial derivatives because $\Psi$ depends on both.
      - **Operators on functions**: $\hat x$ multiplies by $x$; $\hat p = -i\hbar\,\partial/\partial x$ (why the $i$: ${Cv}). $\langle p\rangle = \bra\Psi\hat p\ket\Psi = \int\Psi^*(\hat p\Psi)\,dx$: the operator acts on $\Psi$ first, then multiply by $\Psi^*$ and integrate. The order matters.
      - $V(x)$ is the **potential energy** (not voltage); the force is $F = -dV/dx = -V'$.
      - **Probability current** $J$ plays the role of current density in E&M: $\partial|\Psi|^2/\partial t + \partial J/\partial x = 0$ is the same continuity equation as charge conservation. **Unitarity** = total probability stays 1.
      - $\int_0^\infty x^ne^{-\alpha x}dx = n!/\alpha^{n+1}$ is used constantly.
    `,
    't4-stationary': md`
      - The Schrödinger equation $i\hbar\,\partial_t\Psi = \hat H\Psi$ is a PDE in $x$ and $t$. **Separation of variables** (as for Laplace's equation in E&M): try $\Psi = \psi(x)T(t)$, divide by $\psi T$, and each side must equal the same constant, called $E$. The time half, $i\hbar\,dT/dt = ET$, gives $T = e^{-iEt/\hbar}$. The space half is $\hat H\psi = E\psi$, the **time-independent Schrödinger equation (TISE)**: an eigenvalue equation for $\hat H$.
      - $\psi' = d\psi/dx$, $\psi'' = d^2\psi/dx^2$.
      - **Classically allowed** region: $E > V$ (positive kinetic energy). **Forbidden**: $E < V$, where a classical particle can never be.
      - **Bound state**: normalizable, localized. **Node**: a point where $\psi = 0$ (not counting boundaries). **Even/odd** (parity): $\psi(-x) = \pm\psi(x)$.
      - **Wronskian** $W = \psi_1\psi_2' - \psi_2\psi_1'$ (used once, in Level 6): it is constant when both solve the TISE at the same $E$.
      - $c_n$, orthonormality and "Fourier's trick" are from ${Cv}; $\langle H\rangle$, $P(E_n)$ from ${B} and Topic 2.
    `,
    't5-isw': md`
      - **Infinite square well**: $V = \infty$ means the particle can never be there, so $\psi = 0$ outside and $\psi(0) = \psi(a) = 0$ at the walls. Inside, $V = 0$: a free particle bouncing between rigid walls.
      - $\int_0^a\psi_m\psi_n\,dx = \delta_{mn}$ (orthonormal, ${Cv}). **Complete**: any reasonable function on $[0, a]$ that vanishes at the ends is a sum of the $\psi_n$ (a Fourier sine series).
      - **Symmetric / antisymmetric about $a/2$**: $f(a - x) = \pm f(x)$.
      - **Zero-point energy**: $E_1 > 0$, the minimum energy a confined particle must have.
      - **Sudden change**: if the potential changes much faster than the wavefunction can respond, $\Psi$ is the same just before and just after; you then expand it in the *new* stationary states.
    `,
    't6-free': md`
      - A plane wave $e^{i(kx - \omega t)}$ has crests moving at $\omega/k$. The function $\omega(k)$ is the **dispersion relation**. For a free matter wave, $E = \hbar\omega$, $p = \hbar k$ and $E = p^2/2m$ give $\omega = \hbar k^2/2m$. Light in vacuum has $\omega = ck$ (no dispersion); matter waves are dispersive, which is why packets spread.
      - **Phase velocity** $\omega/k$ (crests) vs **group velocity** $d\omega/dk$ (envelope), as for waves in dispersive media in E&M.
      - **Wave packet**: a superposition of plane waves forming a localized bump.
      - $\phi(k)$ is the **Fourier transform** of $\Psi(x, 0)$ (${D}): the amplitude of $e^{ikx}$. Here $\phi$ is a function, not a phase angle.
      - Gaussian integral: $\int e^{-\alpha x^2 - \beta x}dx = \sqrt{\pi/\alpha}\,e^{\beta^2/4\alpha}$ (complete the square), valid for complex $\beta$.
      - $w$ in the HW: the time-dependent width parameter of the spreading Gaussian.
    `,
    't7-fsw': md`
      - Griffiths' convention: the well spans $-a < x < a$ (**width $2a$**), depth $V_0 > 0$, so $V = -V_0$ inside.
      - $\ell$: wavenumber inside (oscillation). $\kappa$: **decay constant** outside, $\psi \propto e^{-\kappa|x|}$. $z = \ell a$ and $z_0 = \tfrac a\hbar\sqrt{2mV_0}$ are dimensionless versions.
      - **Logarithmic derivative** $\psi'/\psi$: dividing the two matching conditions cancels the unknown amplitudes.
      - **Transcendental equation**: one like $\tan z = f(z)$ that algebra cannot solve; solve graphically (where curves cross) or numerically.
      - $\lceil y\rceil$ (**ceiling**): round up to the next integer.
      - $\tan z$ runs from 0 to $+\infty$ on $[0, \pi/2)$ and repeats every $\pi$; $-\cot z$ runs from $-\infty$ to $+\infty$ on $(0, \pi)$, crossing 0 at $\pi/2$. $\sinh u = \tfrac12(e^u - e^{-u})$.
      - **Scattering**: send a beam in, ask what fraction comes back ($R$, reflection) or goes through ($T$, transmission), $R + T = 1$. Fractions of **flux**, the probability current $J$ (Topic 3) = density × speed.
      - **Step**: $V$ jumps to $V_0$ and stays. **Barrier**: $V = V_0$ for a finite width, then back to 0. **Evanescent**: the decaying $e^{-\kappa x}$ piece in a forbidden region.
    `,
    't8-dirac': md`
      The basics (kets, bras, inner products, operators, eigenvectors, Hermitian, $\dagger$, commutators, outer products) are taught in ${Cv}. New here:
      - **Transpose** $\tilde A$ (HW notation; also $A^T$): rows ↔ columns. **Conjugate** $A^*$: every entry conjugated. **Adjoint** $A^\dagger = (A^T)^*$.
      - **Trace** $\text{tr}A$: sum of the diagonal. **Determinant** $\det A$. **Inverse** $A^{-1}$: $AA^{-1} = I$ ($I$, or $\hat 1$, the identity).
      - **Unitary** $U^\dagger U = I$: the complex version of a rotation matrix ($R^TR = I$): it preserves lengths and angles.
      - **Gram–Schmidt**: turn any basis into an orthonormal one by subtracting projections and normalizing.
      - **Cauchy–Schwarz**: $|\braket{v|w}|^2 \le \braket{v|v}\braket{w|w}$, the complex version of $|\vec a\cdot\vec b| \le |\vec a||\vec b|$.
      - **Function of an operator**: by power series ($e^{\hat A} = \sum\hat A^n/n!$) or, equivalently, apply $f$ to each eigenvalue in the eigenbasis.
      - $\ket p$: the momentum eigenstate. In position space it is the plane wave $e^{ipx/\hbar}$ (the eigenfunction of $-i\hbar\,d/dx$), and $\Phi(p) = \braket{p|\psi}$ is the **momentum-space wavefunction**. It is the Fourier transform (${D}) written in $p = \hbar k$ instead of $k$: $\Phi(p) = \phi(p/\hbar)/\sqrt\hbar$.
    `,
    't9-uncertainty': md`
      - $\sigma_A$ is the standard deviation of $A$ (${B}). **Do not** confuse it with the Pauli matrices $\sigma_x, \sigma_y, \sigma_z$ of Topic 10: same letter, different object.
      - $[\hat A, \hat B] = \hat A\hat B - \hat B\hat A$ (${Cv}). **Compatible** observables: $[\hat A, \hat B] = 0$.
      - **Anti-Hermitian**: $\hat C^\dagger = -\hat C$; its averages are purely imaginary. The commutator of two Hermitian operators is anti-Hermitian, so $\tfrac{1}{2i}\langle[\hat A, \hat B]\rangle$ is real.
      - $\text{Im}\,z = \tfrac{1}{2i}(z - z^*)$ (${A}).
      - $\partial\hat Q/\partial t$: **explicit** time dependence written into the operator itself (e.g. a potential you are switching on). Most operators here ($\hat x$, $\hat p$, $\hat H$) have none.
      - **Schwarz inequality**: Cauchy–Schwarz from Topic 8.
      - **Lifetime** $\tau$: the typical time an unstable state survives.
    `,
    't10-qubit': md`
      - **Two-level system / qubit**: a Hilbert space with just two basis states, $\ket0$ and $\ket1$ (also written $\ket\uparrow, \ket\downarrow$). States are 2-component columns, operators $2\times2$ matrices.
      - **Spin-½**: the spin angular momentum of an electron is $\vec S = \tfrac\hbar2\vec\sigma$, so a Pauli eigenvalue $\pm1$ means spin $\pm\hbar/2$ along that axis.
      - $\sigma_x, \sigma_y, \sigma_z$ (also $\sigma_1, \sigma_2, \sigma_3$): the **Pauli matrices**, not standard deviations. $\vec\sigma = (\sigma_x, \sigma_y, \sigma_z)$ is a "vector of matrices", so $\hat n\cdot\vec\sigma = n_x\sigma_x + n_y\sigma_y + n_z\sigma_z$ is one $2\times2$ matrix: spin along the unit vector $\hat n$.
      - $\epsilon_{jkl}$ (**Levi-Civita**): $+1$ if $jkl$ is a cyclic order of $xyz$ ($xyz$, $yzx$, $zxy$), $-1$ if anticyclic, 0 if an index repeats. The same symbol writes cross products: $(\vec a\times\vec b)_l = \sum\epsilon_{jkl}a_jb_k$.
      - $\theta, \varphi$: **spherical coordinates** as in E&M ($\theta$ from $+z$, $\varphi$ around from $+x$).
      - $\ket\pm = \tfrac1{\sqrt2}(\ket0 \pm \ket1)$: the eigenstates of $\sigma_x$.
      - $\hat U(t) = e^{-i\hat Ht/\hbar}$ is the **time-evolution operator**: $\ket\psi(t) = \hat U(t)\ket\psi(0)$. Differentiate to check it solves $i\hbar\,\tfrac{d}{dt}\ket\psi = \hat H\ket\psi$. On an energy eigenstate it is just $e^{-iE_nt/\hbar}$: the 3-step recipe in one symbol.
      - **Precession**: the rotation of a magnetic moment's axis in a field $\vec B$ (torque $\vec\mu\times\vec B$), as in classical mechanics. A spin in $\vec B$ does exactly this.
    `,
  };

  COURSE.units.forEach((u) => u.lessons.forEach((l) => {
    if (PRE[l.id]) l.steps.unshift(R(md`### Notation and background` + '\n\n' + PRE[l.id].replace(/^\n/, '').replace(/^ {6}/gm, '') + '\n\nNew to these? Unit 0 teaches the language from scratch: ' + `${A} complex numbers, ${B} probability, ${Cv} vectors and operators, ${D} Fourier and delta.`));
  }));

  // the glossary page
  const tools = COURSE.units.find((u) => u.id === 'm1-x');
  tools.lessons.unshift({
    id: 'm1-notation', title: 'Notation glossary', kind: 'read',
    steps: [
      R(md`
        Every symbol in the course, what it means, and where it is taught.

        ### Numbers and functions

        | Symbol | Read as | Meaning | Taught in |
        |---|---|---|---|
        | $i$ | i | $\sqrt{-1}$ | ${A} |
        | $z^*$ | z star | complex conjugate: flip the sign of every $i$ | ${A} |
        | $\lvert z\rvert$, $\lvert z\rvert^2 = z^*z$ | modulus | length of the arrow; its square is real $\ge 0$ | ${A} |
        | $\text{Re}$, $\text{Im}$ | real, imaginary part | $\tfrac12(z + z^*)$, $\tfrac1{2i}(z - z^*)$ | ${A} |
        | $e^{i\theta}$ | phase factor | unit arrow at angle $\theta$; rotates without stretching | ${A} |
        | $h$, $\hbar = h/2\pi$ | h, h-bar | Planck's constant | 1 |
        | $\omega$, $k$ | omega, k | angular frequency, wavenumber $2\pi/\lambda$ | 1 |
        | $\delta_{mn}$ | Kronecker delta | 1 if $m = n$, else 0 | ${Cv} |
        | $\delta(x - a)$ | Dirac delta | unit-area spike at $a$; $\int f\delta = f(a)$ | ${D} |
        | $\epsilon_{jkl}$ | Levi-Civita | $\pm1$ for cyclic/anticyclic $jkl$, 0 if repeated | 10 |
        | $\lceil y\rceil$ | ceiling | round up | 7 |

        ### States and probabilities

        | Symbol | Meaning | Taught in |
        |---|---|---|
        | $\ket\psi$ | ket: the state vector (the label inside is just a name) | ${Cv}, 2 |
        | $\bra\psi$ | bra: conjugate transpose of the ket | ${Cv} |
        | $\braket{\phi\vert \psi}$ | inner product: $\sum\phi_n^*\psi_n$ or $\int\phi^*\psi\,dx$ | ${Cv} |
        | $c_n = \braket{e_n\vert \psi}$ | component (amplitude) along a basis vector | ${Cv}, 2 |
        | $\Psi(x, t) = \braket{x\vert \psi(t)}$ | wavefunction: component along "particle at $x$" | 3 |
        | $\psi_n(x)$, $E_n$ | stationary state and its energy | 4 |
        | $\phi(k)$, $\Phi(p)$ | wavefunction in wavenumber / momentum space (Fourier transform) | ${D}, 6, 8 |
        | $\lvert\Psi\rvert^2$ | probability density | ${B}, 3 |
        | $P(a_n) = \lvert c_n\rvert^2$ | Born's rule | 2 |
        | $\langle A\rangle$ | expectation value: ensemble average | ${B}, 2 |
        | $\sigma_A$ | standard deviation ("uncertainty") of $A$ | ${B}, 9 |
        | $J$ | probability current (flux) | 3 |
        | $R$, $T$ | reflection, transmission probabilities | 7 |

        ### Operators

        | Symbol | Meaning | Taught in |
        |---|---|---|
        | $\hat A$ | operator (hat), a matrix in a basis | ${Cv} |
        | $\hat x$, $\hat p = -i\hbar\,\partial_x$ | position, momentum operators | ${Cv}, 3 |
        | $\hat H = \hat p^2/2m + V$ | Hamiltonian: energy operator | ${Cv}, 4 |
        | $\bra\phi\hat A\ket\psi$, $A_{mn}$ | matrix element: row $m$, column $n$ | ${Cv}, 8 |
        | $\hat A^\dagger$ | adjoint (dagger): conjugate transpose | ${Cv}, 8 |
        | Hermitian $\hat A^\dagger = \hat A$ | observable: real eigenvalues, orthonormal eigenbasis | ${Cv} |
        | Unitary $\hat U^\dagger\hat U = \hat 1$ | preserves lengths; evolution, basis changes | 8 |
        | $\hat 1$, $I$ | identity | ${Cv} |
        | $\ket a\bra b$ | outer product (an operator); $\ket e\bra e$ projects onto $\ket e$ | ${Cv}, 8 |
        | $[\hat A, \hat B]$ | commutator $\hat A\hat B - \hat B\hat A$ | ${Cv}, 9 |
        | $\text{tr}$, $\det$, $\tilde A$ | trace, determinant, transpose | 8 |
        | $\hat U(t) = e^{-i\hat Ht/\hbar}$ | time-evolution operator | 10 |
        | $\sigma_x, \sigma_y, \sigma_z$ | Pauli matrices (not standard deviations!) | 10 |
        | $\hat n\cdot\vec\sigma$ | spin along $\hat n$: $n_x\sigma_x + n_y\sigma_y + n_z\sigma_z$ | 10 |

        ### Wells and waves

        | Symbol | Meaning | Taught in |
        |---|---|---|
        | $a$ | infinite well: width ($0 < x < a$). Finite well: half-width ($-a < x < a$) | 5, 7 |
        | $V_0$ | depth of a finite well, or height of a step/barrier | 7 |
        | $\ell$, $\kappa$ | wavenumber inside; decay constant outside | 7 |
        | $z = \ell a$, $z_0 = \tfrac a\hbar\sqrt{2mV_0}$ | dimensionless energy; well strength | 7 |
        | $v_{\text{ph}} = \omega/k$, $v_g = d\omega/dk$ | phase and group velocity | 6 |
      `),
    ],
  });
})();

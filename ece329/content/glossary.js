/* Two reading pages for the Exam 2 tools unit: the notation glossary (every symbol on the site, grouped, with its unit,
   its meaning and the lesson that introduces it, look-alikes first) and "Every equation, explained" (each formula-sheet
   equation and each "know these" item, in the sheet's order: where it comes from, how it behaves, what to watch).
   Loaded before tools.js, which adds the formula sheet and mixed practice to the same unit. */
(function () {
  'use strict';
  const { R } = C;
  const at = (id, t) => `[${t}](#/l/${id})`;
  const A = at('u0-vectors', 'U0 A'), B = at('u0-integrals', 'U0 B'), Cc = at('u0-curl-div', 'U0 C'), D = at('u0-deltas', 'U0 D'), Ew = at('u0-waveforms', 'U0 E');
  const T = (n, id) => at(id, `T${n}`);
  const T1 = T(1, 't1-dielectrics'), T2 = T(2, 't2-capacitance'), T3 = T(3, 't3-relaxation'), T4 = T(4, 't4-force'), T5 = T(5, 't5-ampere'), T6 = T(6, 't6-sheets'),
    T7 = T(7, 't7-flux'), T8 = T(8, 't8-faraday'), T9 = T(9, 't9-motional'), T10 = T(10, 't10-voltmeters'), T11 = T(11, 't11-inductance'), T12 = T(12, 't12-displacement'),
    T13 = T(13, 't13-materials'), T14 = T(14, 't14-wave-eq'), T15 = T(15, 't15-sheet-waves'), T16 = T(16, 't16-sinusoids'), T17 = T(17, 't17-poynting');
  const R1 = at('r1-coulomb-gauss', 'R1'), R2 = at('r1-div-curl', 'R2'), R3 = at('r1-potential', 'R3'), R4 = at('r1-conductors', 'R4');

  // ================================================================ glossary
  EM.lesson('e2-x', {
    id: 'e2-glossary', title: 'Notation glossary', kind: 'read',
    steps: [
      R(md`
        Every symbol the site uses, grouped. **Bold** letters are vectors; a hat ($\hat x$, $\hat n$) is a unit vector. The last column links to the lesson that introduces the symbol (U0 = Unit 0, T = topic, R = Exam 1 review). Look-alikes come first, because they cost the most points.

        ### Look-alikes

        | Symbol | One thing | Another thing | How to tell |
        |---|---|---|---|
        | $\mathbf E$ vs $\mathcal E$ | $\mathbf E$: electric field, V/m | $\emf$: emf, V, a loop integral $\oint(\mathbf E + \mathbf v\times\mathbf B)\cdot d\mathbf l$ | bold upright vs script; the emf belongs to a path |
        | $\epsilon$ vs $\mathcal E$ | $\epsilon$: permittivity, F/m | $\emf$: emf, V | $\epsilon$ always sits next to a field or a geometry |
        | $\rho$ | charge density, C/m³ ($\rho_s$ C/m², $\rho_l$ C/m) | resistivity in other courses | this course never uses resistivity: $R = \ell/\sigma A$ |
        | $\sigma$ | conductivity, S/m | surface charge in other books | this course writes surface charge $\rho_s$ |
        | $\phi$ vs $\Phi$ | $\phi$: the cylindrical angle (rad), and a sinusoid's constant phase offset | $\Phi$: scalar potential (V) in $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$; T16 also uses $\Phi$ for the whole phase $\omega t - \beta z + \phi$ | read the context: an angle, a potential, or a phase |
        | $\Psi$, $\Psi_E$, $\psi$ | $\Psi$: magnetic flux, Wb | $\Psi_E = \int\mathbf D\cdot d\mathbf S$: electric flux, C | older exams write magnetic flux $\psi$ (Spring 2018 #2's $\psi_1$, $\psi_N$) |
        | $\mu$ | permeability, H/m | the prefix micro, $10^{-6}$ (μs, μT, μF) | a prefix is upright and glued to a unit |
        | $\beta$ vs $B$ | $\beta$: phase constant, rad/m | $B$: flux density, T | $\beta$ multiplies a coordinate inside a cosine |
        | $\eta$ vs $n$ | $\eta$: intrinsic impedance, Ω | $n$: turns per meter (1/m), or dipoles per m³ | $\eta = E/H$ in a wave |
        | $\tau$ | time constant, s: $\epsilon/\sigma$ (relaxation), $RC$, $L/R$ | the width of a pulse, $\triangle(t/\tau)$, $\text{rect}(t/\tau)$ | a decay $e^{-t/\tau}$ vs a pulse argument $t/\tau$ |
        | $\Lambda$ vs $\triangle$ | $\Lambda = N\Psi$: flux linkage, Wb | $\triangle(t/\tau)$: unit triangle pulse of base $\tau$ | some books write the triangle as $\Lambda(t)$, with base 2 |
        | $\mathbf M$ vs $M$ | $\mathbf M$: magnetization, A/m | $M$ (or $L_{ab}$): mutual inductance, H | bold vector vs a circuit constant |
        | $\mathbf P$ vs $P$ | $\mathbf P$: polarization, C/m² | $P$: power, W (and $p$, W/m³); also a path name in T10 | bold vs plain |
        | $S$, $\mathbf S$, S | $S$: a surface ($d\mathbf S$ its element) | $\mathbf S = \mathbf E\times\mathbf H$: Poynting vector, W/m² | S (upright): siemens, the unit of conductance; T17 names surfaces $A$ to avoid the clash |
        | $C$, $\mathcal C$, $C'$ | $C$: a closed path, or a capacitance (F) | $\mathcal C$ or $C'$: capacitance per length, F/m | C (upright): coulomb |
        | $\mathbf H$ vs H | magnetic field intensity, A/m | henry, the unit of inductance | — |
        | $T$ vs T | period, s | tesla, the unit of $B$ | — |
        | $\mathbf A$, $A$, A | vector potential, Wb/m | an area, m² | A (upright): ampere |
        | $R$, $\mathbf R$ | resistance, Ω | Biot–Savart's vector from the source to the field point; the radius of a charged cylinder on the sheet | — |
        | $r$ | distance from the $z$-axis (cylinders, wires) | distance from the origin (point charge, spheres) | the formula sheet uses both; check the geometry |
        | $V$ | potential or voltage, V | a volume, m³ ($dV$) | V (upright): volt |
        | $W$ | width of a slab, m | energy ($W_m$, J) | W (upright): watt |
        | $\lambda$ | wavelength, m | line charge in older exams (this course: $\rho_l$) | — |
        | $\hat n$ vs $n$ | unit normal: from region − into +; at a sheet, toward the field point | turns per meter | the hat |
        | $\hat a_x$, $\hat a_\phi$ | the slides' and older exams' unit vectors (Spring 2018: "$\hat a_\phi$ is into the page") | $\hat x$, $\hat\phi$ on this site | the same vectors, two spellings |

        ### Fields and potentials

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $\mathbf E$ | V/m = N/C | **electric field**: force per unit charge on a charge at rest | ${R1} |
        | $\mathbf D$ | C/m² | **electric flux density** (displacement), $\epsilon_0\mathbf E + \mathbf P = \epsilon\mathbf E$ | ${T1} |
        | $\mathbf P$ | C/m² | **polarization**: dipole moment per volume | ${T1} |
        | $\mathbf B$ | T = Wb/m² | **magnetic flux density**: sets the force $q\mathbf v\times\mathbf B$ | ${T4} |
        | $\mathbf H$ | A/m | **magnetic field intensity**, $\mathbf B/\mu_0 - \mathbf M = \mathbf B/\mu$; its circulation counts free current | ${T5} |
        | $\mathbf M$ | A/m | **magnetization**: magnetic dipole moment per volume | ${T13} |
        | $V$ | V | **electrostatic potential**: work per charge from the reference point | ${R3} |
        | $\Phi$ | V | **scalar potential** with time-varying fields: $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$ | ${T7} |
        | $\mathbf A$ | Wb/m = V·s/m | **vector potential**: $\mathbf B = \nabla\times\mathbf A$ (not on the Fall 2026 Exam 2) | [Extra](#/l/x-vecpot) |
        | $\Psi$ | Wb = T·m² = V·s | **magnetic flux** $\int_S\mathbf B\cdot d\mathbf S$ through one turn | ${T8} |
        | $\Lambda$ | Wb (Wb-turns) | **flux linkage** $N\Psi$ | ${T11} |
        | $\Psi_E$ | C | **electric flux** $\int_S\mathbf D\cdot d\mathbf S$ | ${T12} |
        | $\emf$ | V | **emf** around a path: $\oint(\mathbf E + \mathbf v\times\mathbf B)\cdot d\mathbf l$ | ${T8} |
        | MMF | A (ampere-turns) | **magnetomotive force** $\oint_C\mathbf H\cdot d\mathbf l$ | ${T5} |
        | $E_x$, $H_y$ | V/m, A/m | components; in a plane wave, functions of $z$ and $t$ only | ${T14} |
        | $E_0$, $H_0$ | V/m, A/m | amplitudes (peak values) of a sinusoid | ${T16} |
        | $E_n$, $E_t$ | V/m | parts of a field normal and tangential to a surface (same for $D$, $B$, $H$) | ${T1} |
        | $\mathbf E^\pm$, $\mathbf H^\pm$ | V/m, A/m | fields just on the + and − sides of an interface | ${T1} |
        | $\mathbf S$ | W/m² | **Poynting vector** $\mathbf E\times\mathbf H$: power flow per area | ${T17} |
        | $\langle\mathbf S\rangle$ | W/m² | its average over one period | ${T17} |
        | $w_e$, $w_m$ | J/m³ | energy densities $\tfrac12\epsilon E^2$, $\tfrac12\mu H^2$ | ${T3}, ${T11} |
        | $W_m$ | J | stored magnetic energy, $\tfrac12LI^2$ | ${T11} |

        ### Sources

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $q$, $Q$ | C | a charge; $Q$ also the charge on a capacitor's + conductor | ${R1} |
        | $Q_{\text{enc}}$ | C | charge inside a closed surface | ${R1} |
        | $\rho$, $\rho_s$, $\rho_l$ | C/m³, C/m², C/m | free charge per volume, per area, per length | ${R1} |
        | $\rho_b$, $\rho_{sb}$ | C/m³, C/m² | **bound** charge: $-\nabla\cdot\mathbf P$, and $\mathbf P\cdot\hat n$ at a surface | ${T1} |
        | $I$ | A | current; $I = \int_S\mathbf J\cdot d\mathbf S$ | ${R2} |
        | $I_{\text{enc}}$ | A | current through the surface on an Amperian loop, positive along $d\mathbf S$ | ${T5} |
        | $\mathbf J$ | A/m² | **volume current density** (free; in a conductor $\sigma\mathbf E$) | ${R2} |
        | $\mathbf J_s$ | A/m | **surface current density**: current per meter of width. The standard wave sheet is $\mathbf J_s = -J_s(t)\hat x$ | ${T6}, ${T15} |
        | $\mathbf J_b$, $\mathbf J_{sb}$ | A/m², A/m | **bound** currents of a magnetized body: $\nabla\times\mathbf M$, $\mathbf M\times\hat n$ | ${T13} |
        | $\mathbf J_d$, $I_d$ | A/m², A | **displacement current** $\partial\mathbf D/\partial t$, and its flux $d\Psi_E/dt$ | ${T12} |
        | $\mathbf m$ | A·m² | **magnetic dipole moment** $IA\hat n$ of a small loop | ${T13} |
        | $\delta(x)$ | 1/m | **Dirac delta**: a unit-area spike; turns sheet and line quantities into densities | ${D} |
        | $I\,d\mathbf l$ | A·m | a current element | ${T4} |

        ### Materials and constants

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $\epsilon_0$ | F/m | $8.854\times10^{-12} \approx 10^{-9}/36\pi$: permittivity of free space | ${R1} |
        | $\epsilon$, $\epsilon_r$, $\chi_e$ | F/m, —, — | permittivity $\epsilon_0\epsilon_r$, relative permittivity, susceptibility $\epsilon_r - 1$ | ${T1} |
        | $\mu_0$ | H/m = T·m/A | $4\pi\times10^{-7}$: permeability of free space | ${T4} |
        | $\mu$, $\mu_r$, $\chi_m$ | H/m, —, — | permeability $\mu_0\mu_r$, relative permeability, susceptibility $\mu_r - 1$ (< 0: diamagnetic, > 0: paramagnetic) | ${T13} |
        | $\sigma$ | S/m | **conductivity**: $\mathbf J = \sigma\mathbf E$ | ${T1}, ${T2} |
        | $\tau = \epsilon/\sigma$ | s | charge **relaxation time** of a conductor | ${T3} |
        | PEC | — | perfect electric conductor: $\mathbf E = 0$ inside, tangential $\mathbf E = 0$ on its surface | ${T10} |
        | $c$ | m/s | $3\times10^8$ m/s $= 300$ m/μs $= 0.3$ m/ns | ${T14} |
        | $\eta_0$ | Ω | $\sqrt{\mu_0/\epsilon_0} = 120\pi \approx 377\ \Omega$ | ${T14} |
        | $e$, $m_e$ | C, kg | $1.602\times10^{-19}$ C, $9.109\times10^{-31}$ kg | ${R3} |

        ### Circuits from fields

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $C$ | F = C/V | **capacitance** $Q/V$ | ${T2} |
        | $\mathcal C$ or $C'$ | F/m | capacitance per unit length of a long structure | ${T2}, ${T11} |
        | $R$, $G$ | Ω, S | resistance $V/I$ and conductance $1/R$; per length $\mathcal G$ (S/m) | ${T2} |
        | $L$ | H = Wb/A | **self-inductance** $\Lambda/I$ | ${T11} |
        | $L'$ (or $\mathcal L$) | H/m | inductance per unit length | ${T11} |
        | $M$, $L_{ab}$ | H | **mutual inductance**: linkage of $b$ per ampere in $a$ | ${T11} |
        | $N$, $n$ | —, 1/m | number of turns; turns per meter $N/\ell$ (Lecture 15 and some exams call the turns per meter $N$) | ${T5} |
        | $\tau = RC$, $L/R$ | s | circuit time constants | ${T2}, ${T13} |
        | $v_L$ | V | inductor voltage $L\,dI/dt$, + where $I$ enters | ${T11} |
        | $V_m$, $R_m$ | V, Ω | a voltmeter's reading ($\int\mathbf E\cdot d\mathbf l$ from + probe to − probe along its leads) and its resistance | ${T10} |
        | $V_s$, $R_s$ | V, Ω | a source and its series resistance | ${T2} |
        | $P$, $p$ | W, W/m³ | power, and power per volume $\mathbf J\cdot\mathbf E$ (Joule heating) | ${T9}, ${T3} |

        ### Waves

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $v_p$ | m/s | **phase velocity** $1/\sqrt{\mu\epsilon} = \omega/\beta$ | ${T14} |
        | $\eta$ | Ω | **intrinsic impedance** $\sqrt{\mu/\epsilon}$; $\lvert\mathbf E\rvert = \eta\lvert\mathbf H\rvert$ in one traveling wave | ${T14} |
        | $\omega$, $f$, $T$ | rad/s, Hz, s | angular frequency $2\pi f$, frequency, period $1/f$ | ${T16} |
        | $\beta$, $\lambda$ | rad/m, m | **phase constant** $2\pi/\lambda$, wavelength | ${T16} |
        | $\phi$ | rad | constant phase offset in $\cos(\omega t - \beta z + \phi)$ | ${T16} |
        | $\hat k$ | — | unit vector along the direction of travel ($\mathbf E\times\mathbf H$) | ${T16} |
        | $\alpha$ | 1/m | a decay constant, as in $e^{-\alpha z}$: lossless waves have none, so such a candidate fails the wave equation | ${T14} |
        | $f(t \mp z/v_p)$ | — | a waveform traveling toward $\pm z$ | ${Ew}, ${T14} |
        | $t - d/v_p$ | s | **retarded time**: when the field now at distance $d$ left the sheet | ${T15} |
        | $u(t)$ | — | **unit step**: 0 before, 1 after | ${D} |
        | $\text{sgn}(x)$ | — | sign function, $\pm1$ for $x \gtrless 0$ | ${D}, ${T6} |
        | $\text{rect}(t/\tau)$ | — | unit rectangle, 1 for $\lvert t\rvert < \tau/2$ | ${D} |
        | $\triangle(t/\tau)$ | — | unit triangle: $1 - 2\lvert t\rvert/\tau$ for $\lvert t\rvert \le \tau/2$ (HW 7 #6) | ${D} |

        ### Operators and integrals

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $\mathbf A\cdot\mathbf B$ | — | dot product, a number: $AB\cos\theta$ | ${A} |
        | $\mathbf A\times\mathbf B$ | — | cross product, a vector of size $AB\sin\theta$, direction by the right-hand rule | ${A} |
        | $\partial/\partial x$, $\partial_x$ | 1/m | partial derivative: the other variables held fixed | ${Cc} |
        | $\nabla$ | 1/m | del, $\hat x\partial_x + \hat y\partial_y + \hat z\partial_z$ | ${Cc}, ${R2} |
        | $\nabla f$ | [$f$]/m | gradient: uphill direction and slope of $f$ | ${Cc}, ${R3} |
        | $\nabla\cdot\mathbf F$ | [$\mathbf F$]/m | divergence: outflow per volume (a source density) | ${Cc}, ${R2} |
        | $\nabla\times\mathbf F$ | [$\mathbf F$]/m | curl: circulation per area (a vortex density) | ${Cc}, ${R2} |
        | $\nabla^2$ | 1/m² | Laplacian $\partial_x^2 + \partial_y^2 + \partial_z^2$ | ${Cc}, ${R3} |
        | $\int_C\cdot\,d\mathbf l$, $\oint_C$ | — | line integral along $C$; $\oint$: $C$ closed (circulation) | ${B} |
        | $\int_S\cdot\,d\mathbf S$, $\oint_S$ | — | flux through $S$; $\oint$: $S$ closed, $d\mathbf S$ outward | ${B} |
        | $d\mathbf l$, $d\mathbf S$, $dV$ | m, m², m³ | path step, surface patch (normal × area), volume element | ${B} |
        | $\langle g\rangle$ | — | time average over a period, $\tfrac1T\int_0^Tg\,dt$ | ${T17} |

        ### Coordinates and geometry

        | Symbol | Unit | Meaning | Lesson |
        |---|---|---|---|
        | $\hat x, \hat y, \hat z$ | — | Cartesian unit vectors; $\hat x\times\hat y = \hat z$ and cyclic | ${A} |
        | $(r, \phi, z)$ | m, rad, m | cylindrical coordinates: distance from the $z$-axis, angle from $+x$ toward $+y$ | ${A} |
        | $\hat r$, $\hat\phi$ | — | away from the axis; counterclockwise around it (seen from $+z$). They change from point to point | ${A} |
        | $\hat n$ | — | unit normal: outward on a closed surface; from region − into + in boundary conditions; from the sheet toward the point in $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ | ${B}, ${T1}, ${T6} |
        | $C$, $S$, $V$ | — | a path, a surface, a volume; $C$ and $d\mathbf S$ paired by the right-hand rule | ${B} |
        | $\mathbf R$, $\hat R$ | m, — | Biot–Savart: from the current element to the field point | ${T4} |
        | $\ell$, $\boldsymbol\ell$ | m | a length; a straight wire segment along the current | ${T4}, ${T9} |
        | $a$, $b$, $d$, $h$, $w$, $W$ | m | radii, a gap or distance, a height, a width, a slab thickness | ${T2}, ${T6} |
        | $A$ | m² | an area (T17: a surface, with $d\mathbf A$) | ${T2}, ${T17} |
        | $\theta$ | rad | an angle: between two vectors, or a loop's normal and $\mathbf B$ | ${A}, ${T9} |
        | RHR | — | right-hand rule: fingers $\mathbf A \to \mathbf B$, thumb $\mathbf A\times\mathbf B$; or fingers along a circulation, thumb along the axis | ${A} |
      `),
    ],
  });

  // ================================================================ every equation, explained
  const E = (title, eq, from, beh, watch) => md`
    #### ${title}

    $$${eq}$$
    - **Where it comes from:** ${from}
    - **How it behaves:** ${beh}
    - **Watch out:** ${watch}
  `;
  EM.lesson('e2-x', {
    id: 'e2-eqs', title: 'Every equation, explained', kind: 'read',
    steps: [
      R(md`
        Every equation on the [formula sheet](#/l/e2-sheet), in its order, then every "know these" item. For each: where it comes from in a sentence or two, how it behaves (limits, scalings, signs), and the trap. Know these three things and you can rebuild a formula you blank on. Symbols: [notation glossary](#/l/e2-glossary).

        ### Numbers to be fluent in

        | — | — |
        |---|---|
        | $\mu_0/2\pi = 2\times10^{-7}$ H/m | $1/4\pi\epsilon_0 \approx 9\times10^9$ m/F |
        | $c = 3\times10^8$ m/s $= 300$ m/μs $= 0.3$ m/ns | $\eta_0 = 120\pi \approx 377\ \Omega$; $1/\eta_0 \approx 2.65$ mA/m per V/m |
        | $1\,\text{cm}^2 = 10^{-4}\,\text{m}^2$ | T = Wb/m², Wb = V·s, H = Wb/A, F = C/V, S = 1/Ω |
        | $\lambda = 300/f_{\text{MHz}}$ m in vacuum | 1 A/m of $H$ in vacuum is $1.26\ \mu$T of $B$ |

        ### Maxwell's equations, force, continuity
      `),
      R(E('Lorentz force', '\\mathbf F = q(\\mathbf E + \\mathbf v\\times\\mathbf B) = m\\mathbf a',
        'the definition of the two fields: $\\mathbf E$ pushes every charge, $\\mathbf B$ pushes only moving ones, sideways.',
        'the magnetic part is perpendicular to $\\mathbf v$, so it bends paths but does no work; zero for $\\mathbf v \\parallel \\mathbf B$. It is the root of $I\\,d\\mathbf l\\times\\mathbf B$ and of motional emf.',
        'the sign of $q$ (an electron goes the other way), and the order $\\mathbf v\\times\\mathbf B$.')),
      R(E('Continuity', '\\nabla\\cdot\\mathbf J + \\frac{\\partial\\rho}{\\partial t} = 0',
        'charge is conserved: current leaving a small volume (outflow per volume, $\\nabla\\cdot\\mathbf J$) must drain the charge inside.',
        'steady currents ($\\partial\\rho/\\partial t = 0$) have $\\nabla\\cdot\\mathbf J = 0$: what flows in flows out. Integral form: $\\oint\\mathbf J\\cdot d\\mathbf S = -dQ_{\\text{enc}}/dt$.',
        'the minus sign: positive divergence means $\\rho$ **decreases**. It is built into Maxwell (the divergence of Ampère–Maxwell).')),
      R(E('Gauss\'s law', '\\oint_S\\mathbf D\\cdot d\\mathbf S = \\int_V\\rho\\,dV \\qquad \\nabla\\cdot\\mathbf D = \\rho',
        'field lines of $\\mathbf D$ start on free charge and end on free charge; the net number leaving a closed surface counts what is inside.',
        'with symmetry (planes, lines, spheres) it gives the field in one line; without symmetry it is true but not enough. Bound charge is already inside $\\mathbf D$.',
        '$\\rho$ is **free** charge only; outward $d\\mathbf S$; the enclosed charge, not all charge, sets the flux (though all charge shapes the field).')),
      R(E('No magnetic charge', '\\oint_S\\mathbf B\\cdot d\\mathbf S = 0 \\qquad \\nabla\\cdot\\mathbf B = 0',
        'there are no magnetic monopoles: $\\mathbf B$ lines close on themselves.',
        'flux through a rim does not depend on which surface you drape on it; it is why $\\mathbf B = \\nabla\\times\\mathbf A$ exists, and why $B_n$ is continuous at any interface.',
        'a proposed $\\mathbf B$ with nonzero divergence is impossible. It says nothing about $\\mathbf H$ at a magnetic interface ($H_n$ jumps).')),
      R(E('Ampère–Maxwell', '\\oint_C\\mathbf H\\cdot d\\mathbf l = \\int_S\\mathbf J\\cdot d\\mathbf S + \\frac{d}{dt}\\int_S\\mathbf D\\cdot d\\mathbf S \\qquad \\nabla\\times\\mathbf H = \\mathbf J + \\frac{\\partial\\mathbf D}{\\partial t}',
        'currents make $\\mathbf H$ circulate around them; Maxwell added the displacement current $\\partial\\mathbf D/\\partial t$ so that charge conservation holds (the capacitor paradox).',
        'statics: drop the $\\mathbf D$ term. In a wave in a lossless medium there is no $\\mathbf J$, and the changing $\\mathbf E$ alone sustains $\\mathbf H$. Between capacitor plates $I_d$ equals the wire current.',
        '$C$ and $d\\mathbf S$ by the right-hand rule; $\\mathbf J$ is free current (bound currents are in $\\mathbf H$); the integral form needs symmetry to be solved.')),
      R(E('Faraday', '\\oint_C\\mathbf E\\cdot d\\mathbf l = -\\frac{d}{dt}\\int_S\\mathbf B\\cdot d\\mathbf S \\qquad \\nabla\\times\\mathbf E = -\\frac{\\partial\\mathbf B}{\\partial t}',
        'a changing $\\mathbf B$ makes $\\mathbf E$ circulate; the minus sign is Lenz: the induced current opposes the change in flux.',
        'constant flux gives no emf however large $B$ is; the induced $\\mathbf E$ is not conservative, so "voltage between two points" depends on the path.',
        'the minus sign once, not twice; $d\\mathbf S$ tied to $C$; for a moving path use $\\oint(\\mathbf E + \\mathbf v\\times\\mathbf B)\\cdot d\\mathbf l$ (or the total $d\\Psi/dt$, not both).')),
      R(md`### Boundary conditions`),
      R(E('Tangential E', '\\hat n\\times(\\mathbf E^+ - \\mathbf E^-) = 0',
        'Faraday on a thin rectangle straddling the interface: it encloses no flux as it shrinks, so the tangential $\\mathbf E$ on both sides must match.',
        'holds with or without charges and for any materials. At a perfect conductor ($\\mathbf E = 0$ inside) $\\mathbf E$ outside is purely normal.',
        'only the tangential part is continuous; the normal part of $\\mathbf E$ jumps whenever $\\rho_s \\ne 0$ or $\\epsilon$ changes.')),
      R(E('Normal D', '\\hat n\\cdot(\\mathbf D^+ - \\mathbf D^-) = \\rho_s',
        'Gauss on a flat pillbox: the side area vanishes and only the two faces count.',
        'no free surface charge: $D_n$ continuous, so $E_n^+/E_n^- = \\epsilon^-/\\epsilon^+$. At a conductor: $D_n = \\rho_s$ just outside.',
        '$\\hat n$ points from − into +; $\\rho_s$ is free charge (bound surface charge does not count here).')),
      R(E('Normal B', '\\hat n\\cdot(\\mathbf B^+ - \\mathbf B^-) = 0',
        'the pillbox again with $\\oint\\mathbf B\\cdot d\\mathbf S = 0$.',
        '$B_n$ never jumps. Into an iron block $B_n$ is the same while $H_n = B_n/\\mu$ drops by $\\mu_r$.',
        'do not assume $H_n$ is continuous between different $\\mu$.')),
      R(E('Tangential H', '\\hat n\\times(\\mathbf H^+ - \\mathbf H^-) = \\mathbf J_s \\qquad \\mathbf H^+ - \\mathbf H^- = \\mathbf J_s\\times\\hat n',
        'Ampère on a thin rectangle through the interface: the only current it encloses is the surface current.',
        'tangential $\\mathbf H$ jumps by $J_s$, perpendicular to $\\mathbf J_s$; no sheet current: tangential $\\mathbf H$ continuous. A sheet in vacuum gives $\\pm\\tfrac12\\mathbf J_s\\times\\hat n$ on its two sides.',
        'the second form gives only the **tangential** jump; between different $\\mu$ the normal $\\mathbf H$ also jumps. Order matters: $\\mathbf J_s\\times\\hat n$, $\\hat n$ from − to +.')),
      R(md`### Statics`),
      R(E('Conservative E', '\\nabla\\times\\mathbf E = 0 \\qquad \\oint_C\\mathbf E\\cdot d\\mathbf l = 0 \\qquad \\mathbf E = -\\nabla V',
        'Faraday with $\\partial\\mathbf B/\\partial t = 0$: no circulation, so $\\mathbf E$ is the downhill slope of a potential.',
        '$\\mathbf E$ points from high $V$ to low $V$, perpendicular to equipotentials; KVL is this statement.',
        'it fails as soon as a flux changes (Topic 10): then $\\mathbf E = -\\nabla\\Phi - \\partial\\mathbf A/\\partial t$.')),
      R(E('Poisson', '\\nabla^2V = -\\frac{\\rho}{\\epsilon}',
        'Gauss $\\nabla\\cdot(\\epsilon\\mathbf E) = \\rho$ with $\\mathbf E = -\\nabla V$ in a uniform medium.',
        'where $\\rho = 0$ it is Laplace, $\\nabla^2V = 0$: in 1-D, $V$ is linear between plates.',
        'the minus sign; uniform $\\epsilon$ only; boundary values fix the constants.')),
      R(E('Voltage as a line integral', 'V_A - V_B = \\int_A^B\\mathbf E\\cdot d\\mathbf l',
        'the work per unit charge $\\mathbf E$ does carrying a charge from $A$ to $B$ is the drop in potential.',
        'walking along $\\mathbf E$ gives a positive integral: $A$ is higher. Path-independent in statics.',
        'the order: $A$ minus $B$, integrated from $A$ to $B$. With a changing flux the answer depends on the path (voltmeters).')),
      R(E('Capacitance', 'C = \\frac{Q}{V}',
        'for two conductors, the charge is proportional to the voltage; the ratio depends only on geometry and $\\epsilon$.',
        'more area or less gap: more $C$; filling the whole gap with a dielectric multiplies it by $\\epsilon_r$.',
        '$Q$ on the positive conductor (not the total, which is 0); $V$ between the two conductors.')),
      R(md`### Static fields in vacuum`),
      R(E('Point charge', '\\mathbf E = \\hat r\\frac{Q}{4\\pi\\epsilon_0r^2}',
        'Gauss on a sphere: $\\epsilon_0E\\cdot4\\pi r^2 = Q$.',
        'falls as $1/r^2$; here $r$ is the distance from the charge.',
        'it holds outside any spherically symmetric charge too, with $Q$ the total enclosed.')),
      R(E('Line charge', '\\mathbf E = \\hat r\\frac{\\rho_l}{2\\pi\\epsilon_0r}',
        'Gauss on a cylinder: $\\epsilon_0E\\cdot2\\pi rL = \\rho_lL$.',
        'falls as $1/r$, slower than a point; $r$ is the distance from the line.',
        '$\\rho_l$ in C/m; the ends of the Gaussian cylinder carry no flux.')),
      R(E('Sheet of charge', '\\mathbf E = \\pm\\hat z\\frac{\\rho_s}{2\\epsilon_0}\\quad (z \\gtrless 0)',
        'Gauss on a pillbox through the sheet: half the flux leaves each face.',
        'uniform, independent of distance; jumps by $\\rho_s/\\epsilon_0$ across the sheet. Two opposite sheets: $\\rho_s/\\epsilon_0$ between, 0 outside.',
        'it points **away** from a positive sheet on both sides.')),
      R(E('Slab of charge', '\\mathbf E = \\hat z\\frac{\\rho z}{\\epsilon_0}\\ \\text{inside}, \\qquad \\pm\\hat z\\frac{\\rho W}{2\\epsilon_0}\\ \\text{outside}',
        'Gauss on a box from the center plane, where symmetry makes $E = 0$, out to $z$.',
        'linear inside, zero at the center; outside it is a sheet with $\\rho_s = \\rho W$.',
        '$z$ is measured from the slab\'s center plane; shift if the slab is not centered at 0.')),
      R(E('Cylinder of charge', '\\mathbf E = \\hat r\\frac{\\rho r}{2\\epsilon_0}\\ (r \\le R), \\qquad \\hat r\\frac{\\rho R^2}{2\\epsilon_0r}\\ (r \\ge R)',
        'Gauss on a coaxial cylinder: the enclosed charge grows as $r^2$ inside, so $E \\propto r$.',
        'outside it is a line charge with $\\rho_l = \\rho\\pi R^2$; continuous at $r = R$.',
        '$R$ here is the cylinder\'s radius, not a resistance.')),
      R(E('Line current', '\\mathbf B = \\hat\\phi\\frac{\\mu_0I}{2\\pi r}',
        'Ampère on a circle: $H\\cdot2\\pi r = I$.',
        'falls as $1/r$; circles the wire by the right-hand rule ($\\hat\\phi$ for $I$ along $+\\hat z$). $\\mu_0/2\\pi = 2\\times10^{-7}$.',
        'inside a thick wire it grows as $r$ instead; $\\hat\\phi$ depends on the point, so add fields from two wires in $\\hat x, \\hat y$.')),
      R(E('Current sheet', '\\mathbf B = \\mp\\hat y\\frac{\\mu_0J_s}{2}\\quad (z \\gtrless 0)\\ \\text{for}\\ \\mathbf J_s = J_s\\hat x',
        'Ampère on a rectangle straddling the sheet: $2HL = J_sL$.',
        'uniform on each side, reversed across; same as $\\mathbf H = \\tfrac12\\mathbf J_s\\times\\hat n$ with $\\hat n$ toward the point. Two opposite sheets: $\\mu_0J_s$ between, 0 outside.',
        'the sign comes from $\\hat x\\times\\hat z = -\\hat y$ above the sheet; check it with the right hand.')),
      R(E('Current slab', '\\mathbf B = -\\hat y\\mu_0Jz\\ \\text{inside}, \\qquad \\mp\\hat y\\frac{\\mu_0JW}{2}\\ (z \\gtrless \\pm\\tfrac W2)\\ \\text{for}\\ \\mathbf J = J\\hat x',
        'Ampère on a rectangle from the center plane, where $\\mathbf B = 0$ by symmetry.',
        'linear inside, zero at the center; outside it is a sheet with $J_s = JW$.',
        'measure $z$ from the center plane (HW 5 #3\'s slab is off-center).')),
      R(md`### Materials`),
      R(E('D, E and P', '\\mathbf D = \\epsilon_0\\mathbf E + \\mathbf P = \\epsilon\\mathbf E',
        'defining $\\mathbf D$ this way moves the bound charge into the field, so Gauss needs only free charge.',
        'in a linear dielectric $\\mathbf P = \\epsilon_0\\chi_e\\mathbf E$ and $\\epsilon = \\epsilon_0(1 + \\chi_e)$; vacuum: $\\mathbf P = 0$.',
        'the first term has $\\epsilon_0$, not $\\epsilon$. In a fully filled capacitor at fixed $Q$, a dielectric lowers $\\mathbf E$ by $\\epsilon_r$; $\\mathbf D$ stays.')),
      R(E('H, B and M', '\\mathbf H = \\frac{\\mathbf B}{\\mu_0} - \\mathbf M = \\frac{\\mathbf B}{\\mu}',
        'the same move for magnetism: subtracting $\\mathbf M$ hides the bound currents, so Ampère with $\\mathbf H$ counts free current only.',
        '$\\mathbf M = \\chi_m\\mathbf H$; paramagnets ($\\chi_m > 0$) strengthen $\\mathbf B$, diamagnets weaken it slightly; iron multiplies it by $\\mu_r \\sim 10^3$.',
        'the minus sign before $\\mathbf M$ (the electric case has a plus). In a solenoid, filling the core changes $B$, not $H$.')),
      R(E('Ohm\'s law at a point', '\\mathbf J_{\\text{free}} = \\sigma\\mathbf E',
        'charges drift at a speed proportional to the push; $\\sigma$ collects their density and mobility.',
        'large $\\sigma$: a small $\\mathbf E$ carries a large current; a perfect conductor holds $\\mathbf E = 0$.',
        'integrated over a uniform bar it is $V = IR$ with $R = \\ell/\\sigma A$.')),
      R(E('Bound charge', '\\rho_{\\text{bound}} = -\\nabla\\cdot\\mathbf P',
        'where dipoles spread apart, their ends leave a net charge behind; minus because $\\mathbf P$ points from − to +.',
        'uniform $\\mathbf P$: no volume bound charge, only surface $\\rho_{sb} = \\mathbf P\\cdot\\hat n$ (outward $\\hat n$).',
        'the surface term is easy to forget; the total bound charge of a neutral body is zero.')),
      R(E('Bound current', '\\mathbf J_{\\text{bound}} = \\nabla\\times\\mathbf M + \\frac{\\partial\\mathbf P}{\\partial t}',
        'aligned atomic current loops leave a net current where $\\mathbf M$ varies; a changing polarization moves bound charge.',
        'uniform $\\mathbf M$: only the surface current $\\mathbf J_{sb} = \\mathbf M\\times\\hat n$, like a solenoid\'s winding.',
        'order $\\mathbf M\\times\\hat n$ with outward $\\hat n$.')),
      R(E('Susceptibilities', '\\mathbf P = \\epsilon_0\\chi_e\\mathbf E \\quad \\mathbf M = \\chi_m\\mathbf H \\quad \\epsilon = \\epsilon_0(1 + \\chi_e) \\quad \\mu = \\mu_0(1 + \\chi_m)',
        'linear materials: the response is proportional to the field.',
        'vacuum: $\\chi = 0$. $\\epsilon_r = 1 + \\chi_e \\ge 1$; $\\chi_m < 0$ is diamagnetic.',
        '$\\mathbf P$ uses $\\epsilon_0\\mathbf E$, but $\\mathbf M$ uses $\\mathbf H$, not $\\mathbf B$.')),
      R(md`### Plane waves`),
      R(E('Wave equation', '\\frac{\\partial^2E_x}{\\partial z^2} = \\mu\\epsilon\\frac{\\partial^2E_x}{\\partial t^2}',
        'combine the two curl equations without sources: a changing $\\mathbf E$ makes $\\mathbf H$, which makes $\\mathbf E$.',
        'every $f(t - z/v_p) + g(t + z/v_p)$ solves it, with $v_p = 1/\\sqrt{\\mu\\epsilon}$; shapes travel unchanged.',
        'a candidate must satisfy it exactly: $e^{-\\alpha z}\\cos(\\omega t - \\beta z)$ does not (lossless media do not shrink waves).')),
      R(E('Waves from a current sheet', 'E_x = \\frac{\\eta}{2}J_s\\left(t \\mp \\frac{z}{v_p}\\right) \\qquad H_y = \\pm\\frac12J_s\\left(t \\mp \\frac{z}{v_p}\\right) \\qquad (z \\gtrless 0)',
        'for $\\mathbf J_s = -J_s(t)\\hat x$: the jump of tangential $\\mathbf H$ at the sheet is $J_s$, shared equally by the two waves; each has $E = \\eta H$.',
        'the same $E_x$ on both sides, opposite $H_y$; $\\mathbf E\\times\\mathbf H$ points away from the sheet. The field at distance $d$ is the current at the retarded time $t - d/v_p$.',
        'the minus in $\\mathbf J_s = -J_s(t)\\hat x$: $\\mathbf E$ points opposite the actual sheet current, $\\mathbf E = -\\tfrac{\\eta}{2}\\mathbf J_s(t - |z|/v_p)$.')),
      R(E('Speed', 'v_p = \\frac{1}{\\sqrt{\\mu\\epsilon}} \\qquad c = \\frac{1}{\\sqrt{\\mu_0\\epsilon_0}} = 3\\times10^8\\ \\text{m/s}',
        'the coefficient of the wave equation.',
        'in a medium $v_p = c/\\sqrt{\\mu_r\\epsilon_r}$: always slower than $c$. Water ($\\epsilon_r = 81$): $c/9$.',
        '$\\sqrt{\\mu_r\\epsilon_r}$, not $\\mu_r\\epsilon_r$.')),
      R(E('Intrinsic impedance', '\\eta = \\sqrt{\\frac{\\mu}{\\epsilon}} \\qquad \\eta_0 = \\sqrt{\\frac{\\mu_0}{\\epsilon_0}} = 120\\pi\\ \\Omega',
        'the ratio $E/H$ in a single traveling wave, set by the medium.',
        'a dielectric lowers it ($\\eta_0/\\sqrt{\\epsilon_r}$), a magnetic material raises it: $\\eta = \\eta_0\\sqrt{\\mu_r/\\epsilon_r}$.',
        'only for one wave going one way; a standing wave has no fixed $E/H$.')),
      R(E('Sinusoidal sheet', 'E_x = \\frac{\\eta}{2}\\cos(\\omega t \\mp \\beta z + \\phi)\\quad (z \\gtrless 0)\\ \\text{for}\\ \\mathbf J_s = -\\cos(\\omega t + \\phi)\\hat x',
        'the general sheet solution with $J_s(t) = \\cos(\\omega t + \\phi)$: $t - z/v_p$ inside a cosine becomes $\\omega t - \\beta z$.',
        'scale by the current amplitude $J_0$: $E_0 = \\eta J_0/2$, $H_0 = J_0/2$.',
        'the phase $\\phi$ rides along unchanged; the sheet\'s minus sign still applies.')),
      R(E('Sinusoid relations', 'v_p = \\frac{\\omega}{\\beta} = \\lambda f \\qquad \\beta = \\frac{2\\pi}{\\lambda} \\qquad \\omega = \\frac{2\\pi}{T} = 2\\pi f',
        'one period in time and one wavelength in space each advance the phase by $2\\pi$.',
        'higher frequency, shorter wavelength at a fixed speed; in a medium $\\lambda$ shrinks by $\\sqrt{\\mu_r\\epsilon_r}$ while $f$ stays.',
        '$\\beta$ in rad/m and $\\omega$ in rad/s; the phase is in radians, never degrees in a calculator.')),
      R(md`### Not on the sheet: know these`),
      R(E('Constants', '\\mu_0 = 4\\pi\\times10^{-7}\\ \\text{H/m} \\qquad \\epsilon_0 \\approx 8.854\\times10^{-12} \\approx \\frac{10^{-9}}{36\\pi}\\ \\text{F/m}',
        '$\\mu_0$ was fixed by the pre-2019 definition of the ampere (it still equals $4\\pi\\times10^{-7}$ to ten digits); $\\epsilon_0$ follows from $c^2 = 1/\\mu_0\\epsilon_0$.',
        '$1/36\\pi\\times10^{-9}$ makes $1/4\\pi\\epsilon_0 = 9\\times10^9$ and $\\eta_0 = 120\\pi$ exact.',
        'H/m and F/m: they multiply areas over lengths to give inductance and capacitance.')),
      R(E('Faraday with N turns, and motional emf', '\\emf = -N\\frac{d\\Psi}{dt} \\qquad \\emf = \\oint(\\mathbf E + \\mathbf v\\times\\mathbf B)\\cdot d\\mathbf l \\qquad \\emf_{\\text{bar}} = vB\\ell',
        'turns add in series; a moving conductor carries its charges through $\\mathbf B$, which pushes them along it.',
        'a bar sliding on rails in a static field: $vB\\ell$ when $\\mathbf v$, $\\mathbf B$ and the bar are mutually perpendicular. It equals $-d\\Psi/dt$ of the growing circuit.',
        'count each effect once: use the flux rule or the motional integral, not both. $\\Psi$ is per turn.')),
      R(E('Forces on currents', 'd\\mathbf F = I\\,d\\mathbf l\\times\\mathbf B \\qquad \\frac{F}{\\ell} = \\frac{\\mu_0I_1I_2}{2\\pi d}',
        '$q\\mathbf v\\times\\mathbf B$ summed over the moving charges in a wire; one wire sits in the other\'s $\\mu_0I/2\\pi d$.',
        'parallel currents attract, antiparallel repel; a closed loop in a uniform $\\mathbf B$ feels no net force (only a torque).',
        '$d\\mathbf l$ along the current; use the other wire\'s field, not the total.')),
      R(E('Biot–Savart', 'd\\mathbf B = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\mathbf l\\times\\hat R}{R^2} \\qquad B_z = \\frac{\\mu_0Ia^2}{2(a^2 + z^2)^{3/2}}',
        'each current element makes a field perpendicular to itself and to $\\hat R$, falling as $1/R^2$ (the magnetic Coulomb\'s law).',
        'loop on its axis: $\\mu_0I/2a$ at the center, $\\mu_0Ia^2/2z^3$ far away (a dipole).',
        '$\\hat R$ points **from** the source **to** the field point; use symmetry to kill components before integrating.')),
      R(E('Ampère shapes', 'H_{\\text{sol}} = nI \\quad H_\\phi^{\\text{tor}} = \\frac{NI}{2\\pi r} \\quad H_\\phi^{\\text{wire}} = \\frac{Ir}{2\\pi a^2} \\quad H_\\phi^{\\text{coax}} = \\frac{I}{2\\pi r} \\quad \\mathbf H_{\\text{sheet}} = \\tfrac12\\mathbf J_s\\times\\hat n',
        'Ampère\'s law on the loop symmetry allows: a rectangle half inside a solenoid, circles for toroid, wire and coax, a rectangle through a sheet.',
        'solenoid: uniform inside, zero outside; toroid varies as $1/r$; thick wire grows as $r$ inside; coax is zero outside because the currents cancel.',
        '$n$ is turns per meter, $N$ total turns; $\\hat n$ in the sheet formula points from the sheet toward the point.')),
      R(E('Potentials', '\\mathbf B = \\nabla\\times\\mathbf A \\qquad \\mathbf E = -\\nabla\\Phi - \\frac{\\partial\\mathbf A}{\\partial t}',
        '$\\nabla\\cdot\\mathbf B = 0$ lets $\\mathbf B$ be a curl; Faraday then forces the extra $-\\partial\\mathbf A/\\partial t$ in $\\mathbf E$.',
        '$\\mathbf A$ runs parallel to the currents that make it; static fields: $\\mathbf E = -\\nabla\\Phi$, with $\\Phi = V$.',
        'the $-\\partial\\mathbf A/\\partial t$ part is the induced, non-conservative field (Spring 2018 1(v): the two parts can cancel).')),
      R(E('Circuits from fields', 'R = \\frac{\\ell}{\\sigma A} \\quad C = \\frac{\\epsilon A}{d} \\quad C\' = \\frac{2\\pi\\epsilon}{\\ln(b/a)} \\quad C = 4\\pi\\epsilon\\frac{ab}{b - a} \\quad \\frac GC = \\frac{\\sigma}{\\epsilon} \\quad RC = \\frac{\\epsilon}{\\sigma}',
        'each from a field: $C = Q/V$ with Gauss, $R = V/I$ with $\\mathbf J = \\sigma\\mathbf E$; the same geometry gives the same field shape, so $G/C = \\sigma/\\epsilon$.',
        'isolated sphere: $b \\to \\infty$ gives $4\\pi\\epsilon a$. $RC = \\epsilon/\\sigma$ is independent of the shape: it is the relaxation time.',
        '$\\ln(b/a)$, outer over inner; per-length quantities for long structures.')),
      R(E('Inductance', 'L = \\frac{N\\Psi}{I} = \\frac{\\Lambda}{I} \\quad L_{\\text{sol}} = \\frac{\\mu N^2A}{\\ell} \\quad L_{\\text{tor}} = \\frac{\\mu N^2h}{2\\pi}\\ln\\frac ba \\quad L\'_{\\text{coax}} = \\frac{\\mu}{2\\pi}\\ln\\frac ba \\quad L\'_{\\text{plates}} = \\frac{\\mu d}{w} \\quad L\'C\' = \\mu\\epsilon',
        'find $\\mathbf H$ from $I$ (Ampère), the flux per turn, multiply by the turns, divide by $I$.',
        '$N^2$ because $N$ turns make the field and $N$ turns link it; a core multiplies $L$ by $\\mu_r$. Mutual $L_{ab} = \\Lambda_b/I_a = L_{ba}$; energy $\\tfrac12LI^2$.',
        '$L\'C\' = \\mu\\epsilon$ only for the same line (same cross-section); $\\Psi$ is per turn, $\\Lambda$ includes $N$.')),
      R(E('Relaxation', '\\rho(t) = \\rho(0)\\,e^{-t/\\tau} \\qquad \\tau = \\frac{\\epsilon}{\\sigma}',
        'continuity plus $\\mathbf J = \\sigma\\mathbf E$ plus Gauss: $\\partial\\rho/\\partial t = -(\\sigma/\\epsilon)\\rho$.',
        'copper: $\\tau \\sim 10^{-19}$ s, so inside a conductor in steady state $\\rho = 0$ and $\\mathbf E = 0$; the charge ends up on the surface.',
        '$\\epsilon/\\sigma$, not $\\sigma/\\epsilon$ (the Summer 2017 key has this backward); the spatial shape of $\\rho$ does not change, only its size.')),
      R(E('Energy and power', 'w_e = \\tfrac12\\epsilon E^2 \\quad w_m = \\tfrac12\\mu H^2 \\quad \\mathbf S = \\mathbf E\\times\\mathbf H \\quad |\\mathbf E| = \\eta|\\mathbf H|',
        'Poynting\'s theorem: the power leaving a volume ($\\oint\\mathbf S\\cdot d\\mathbf A$) plus the rate of rise of stored energy plus Joule heating is zero.',
        'a plane wave carries equal electric and magnetic energy, $S = E^2/\\eta$ along the travel; a sinusoid averages to $\\langle S\\rangle = E_0^2/2\\eta$.',
        'the time average has the $\\tfrac12$; $\\mathbf S$ is power per area (W/m²), not energy.')),
      R(E('Traveling waves', 'f(t - z/v_p)\\ \\to +z \\qquad f(t + z/v_p)\\ \\to -z \\qquad v_p = \\frac{c}{\\sqrt{\\mu_r\\epsilon_r}} \\qquad \\eta = \\eta_0\\sqrt{\\frac{\\mu_r}{\\epsilon_r}}',
        'a feature stays where its argument is constant: $z = \\pm v_pt + $ const.',
        'opposite signs on $t$ and $z$: toward $+z$; speed = coefficient of $t$ over coefficient of $z$. $\\mathbf E\\times\\mathbf H$ always points along the travel.',
        'a snapshot versus $z$ is the time waveform flipped and stretched by $v_p$ ([Unit 0, E](#/l/u0-waveforms)).')),
    ],
  });
})();

/* HW 7 (Fall 2026): measuring ε and μ with RC and RL time constants, the continuity equation, charge relaxation in a
   conductor, H from E and E from H with the curl equations, which expressions solve the wave equation, and a triangular
   pulse traveling toward −x. Every problem as assigned, blank, with answer boxes wherever there is a number or a choice,
   and full worked solutions. There is no official key: every answer was solved and checked independently (Python). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const e0 = EM.eps0, PI = Math.PI;
  const N = (lbl, ans, unit, rel = 0.02) => ({ lbl, ans, unit, tol: { rel } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // options shuffled
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order kept

  // ---------------------------------------------------------------- figures
  // Problem 1: a parallel-plate capacitor, (a) filled by the slab, (b) half filled
  function capFig(frac) {
    const g = PF.fig({ alt: frac === 1 ? 'a parallel-plate capacitor whose gap is completely filled by the slab' : 'a parallel-plate capacitor whose gap is half filled by the slab, the other half air' });
    const x1 = 20, x2 = 170, yT = 20, yB = 100, h = (yB - yT) * frac;
    g.rect(x1, yB - h, x2 - x1, h, { cls: 'shade nodecl' });
    g.line(x1, yT, x2, yT, { cls: 'thick' }); g.line(x1, yB, x2, yB, { cls: 'thick' });
    g.label((x1 + x2) / 2, yB - h / 2, '\\epsilon', 'c', 'small');
    if (frac < 1) g.label((x1 + x2) / 2, yT + (yB - yT - h) / 2, '\\epsilon_0', 'c', 'small');
    g.dim(x2 + 14, yT, x2 + 14, yB, 'd');
    return g.svg();
  }
  const fig1 = { svg: PF.row([{ svg: capFig(1), cap: '(a) The slab fills the gap.' }, { svg: capFig(0.5), cap: '(b) The slab fills half of it.' }]).svg };

  // Problem 6: the unit-triangle pulse, its time trace at x = −1000 m, and its snapshot at t = 20 µs
  const tri = (u) => Math.max(0, 1 - 2 * Math.abs(u));
  const plot6 = (o) => PF.plot(Object.assign({ w: 320, h: 150, zero: true }, o));
  const fig6in = { svg: plot6({ x: [-3, 3], y: [-0.3, 2.5], xl: 't\\,(\\mu\\text{s})', yl: 'E_z(0,t)\\,(\\text{V/m})', xt: [[-1.5, '-1.5'], [1.5, '1.5']], yt: [[2, '2']], curves: [{ f: (t) => 2 * tri(t / 3) }] }), cap: '$E_z$ at x = 0: 2△(t/τ) with τ = 3 µs, nonzero for |t| < 1.5 µs.' };
  const fig6e = { svg: plot6({ x: [0, 6.5], y: [-0.3, 2.5], xl: 't\\,(\\mu\\text{s})', yl: 'E_z\\,(\\text{V/m})', xt: [[1.833, '1.83'], [3.333, '3.33'], [4.833, '4.83']], yt: [[2, '2']], curves: [{ f: (t) => 2 * tri((t - 10 / 3) / 3) }] }), cap: '$E_z$ versus t at x = −1000 m: the same triangle, delayed by 1000/c = 3.33 µs.' };
  const fig6f = { svg: plot6({ x: [-6900, -5100], y: [-0.7, 6.6], xl: 'x\\,(\\text{m})', yl: 'H_y\\,(\\text{mA/m})', xt: [[-6450, '-6450'], [-6000, '-6000'], [-5550, '-5550']], yt: [[5.305, '5.31']], curves: [{ f: (x) => 1000 * (2 / EM.eta0) * tri((20e-6 + x / 3e8) / 3e-6) }] }), cap: '$H_y$ versus x at t = 20 µs: centered at x = −ct = −6000 m, 900 m wide (cτ).' };

  // ---------------------------------------------------------------- numbers (checked in Python)
  const tau3 = e0 / 5e7, t3 = tau3 * Math.log(100);            // 3(c)
  const H4 = 1 / EM.eta0, E4 = 80 * PI;                          // 4(a), 4(b)
  const Smax6 = 4 / EM.eta0;                                     // 6(c)

  const steps = [
    R(md`**Homework 7** · due Thursday, October 15, 2026 · reading: Kudeki, Lectures 17–20. Six problems: measuring $\epsilon$ and $\mu$ with RC and RL time constants, the continuity equation, charge relaxation in a conductor, $\mathbf H$ from $\mathbf E$ (and back) with the curl equations, which expressions solve the wave equation, and a triangular pulse traveling toward $-x$. The tools are [Topic 2](#/l/t2-capacitance), [Topic 3](#/l/t3-relaxation), [Topic 11](#/l/t11-inductance), [Topic 13](#/l/t13-materials), [Topic 14](#/l/t14-wave-eq), [Topic 16](#/l/t16-sinusoids) and [Topic 17](#/l/t17-poynting).

There is no official key; every answer below was solved and checked independently. Work each part on paper first, with units, the way you would hand it in. Then enter your answers and open the solution to compare your reasoning.`),

    // ================================================================ Problem 1
    RF(md`### Problem 1 · Measuring ε and μ with time constants

[[fig:f1]]`, { f1: fig1 }),
    P({ src: 'HW 7 #1(a)', title: 'A slab that fills the gap',
      q: md`(a) I have a slab of some insulator with an unknown permittivity $\epsilon$. To determine $\epsilon$ experimentally I insert the slab between the plates of a capacitor whose plate spacing exactly matches the width of the slab. The time constant of exponential decay of the capacitor voltage in an RC circuit increases by 50% when the slab replaces the air. Determine $\epsilon$ in terms of $\epsilon_0$. Explain your reasoning carefully.`,
      parts: [N('\\epsilon/\\epsilon_0', 1.5, '')],
      hints: ['$\\tau = RC$, and $R$ (the circuit\'s resistor) does not change. A perfect insulator adds no leakage path.', 'Parallel plates: $C = \\epsilon A/d$, so $C$ is proportional to the permittivity filling the gap.'],
      sol: md`The voltage decays as $e^{-t/RC}$, so $\tau = RC$. The resistor is the same, so the 50% increase is all in $C$: $C_{\text{slab}} = 1.5\,C_{\text{air}}$.

A parallel-plate capacitor (plates large compared with the gap, fringing neglected) has $C = \epsilon A/d$. Same $A$ and $d$, so
$$\frac{C_{\text{slab}}}{C_{\text{air}}} = \frac{\epsilon}{\epsilon_0} = 1.5 \quad\Rightarrow\quad \epsilon = 1.5\,\epsilon_0$$
**Why it works.** The insulator carries no conduction current, so it does not add a parallel leakage resistance that would shorten $\tau$; it only raises the charge stored per volt.` }),
    P({ src: 'HW 7 #1(b)', title: 'A slab that fills half the gap',
      q: md`(b) Repeat (a) if the slab width is only one half of the plate separation, so that with the slab inserted the gap is still 50% air.`,
      parts: [N('\\epsilon/\\epsilon_0', 3, '')],
      hints: ['The slab and the remaining air are two capacitors in series: same $D$ through both.', '$\\dfrac1C = \\dfrac{d/2}{\\epsilon A} + \\dfrac{d/2}{\\epsilon_0A}$. Set $C/C_{\\text{air}} = 1.5$.'],
      sol: md`$D$ is continuous across the slab face (no free charge there), so the two layers act as capacitors in series:
$$\frac1C = \frac{d/2}{\epsilon A} + \frac{d/2}{\epsilon_0A} \quad\Rightarrow\quad \frac{C}{C_{\text{air}}} = \frac{d/(\epsilon_0A)}{\frac{d}{2\epsilon A} + \frac{d}{2\epsilon_0A}} = \frac{2}{1 + \epsilon_0/\epsilon}$$
Set this to 1.5: $1 + \epsilon_0/\epsilon = \tfrac43$, so $\epsilon_0/\epsilon = \tfrac13$ and
$$\epsilon = 3\,\epsilon_0$$
**Check.** Half the gap needs a larger $\epsilon$ for the same 50% gain: as $\epsilon \to \infty$ the slab region is a short and $C \to 2C_{\text{air}}$, so a 1.5× gain with half the gap requires $\epsilon$ well above $1.5\epsilon_0$ ✓. Where the slab sits in the gap does not matter; series layers add the same way in any order.` }),
    P({ src: 'HW 7 #1(c)', title: 'A rod in a solenoid',
      q: md`(c) I have a rod of some solid with an unknown permeability $\mu$. To determine $\mu$ I insert the rod into a solenoid of many turns whose diameter exactly matches the rod's. The time constant of exponential decay of the solenoid current in an RL circuit decreases by 0.2% when the rod replaces the air core. Determine $\mu$ in terms of $\mu_0$. Is the rod diamagnetic or paramagnetic? Explain.`,
      parts: [N('\\chi_m = \\mu/\\mu_0 - 1', -0.002, ''), MC('The rod is', ['diamagnetic', 'paramagnetic', 'ferromagnetic', 'nonmagnetic: 0.2% is within error'], 0,
        [null, 'Paramagnets have $\\mu > \\mu_0$, which would make $\\tau$ longer.', 'A ferromagnet would raise $L$ (and $\\tau$) by a large factor, not lower it.', 'The problem gives a definite decrease; take it at face value: $\\chi_m < 0$.'])],
      hints: ['$\\tau = L/R$ with $R$ unchanged; a long solenoid filled by the core has $L = \\mu N^2A/\\ell$.', 'So $\\mu/\\mu_0 = L_{\\text{rod}}/L_{\\text{air}} = 0.998$.'],
      sol: md`The current decays as $e^{-Rt/L}$, so $\tau = L/R$. With $R$ unchanged, $L_{\text{rod}} = 0.998\,L_{\text{air}}$. A long solenoid whose core fills the windings has $L = \mu N^2A/\ell$ ([Topic 11](#/l/t11-inductance)), proportional to the core's permeability:
$$\frac{\mu}{\mu_0} = 0.998 \quad\Rightarrow\quad \mu = 0.998\,\mu_0, \qquad \chi_m = \frac{\mu}{\mu_0} - 1 = -0.002$$
**Diamagnetic.** $\chi_m < 0$: the rod's magnetization opposes the applied $\mathbf H$, so it slightly weakens $\mathbf B$ inside and lowers the flux linkage. (Paramagnets have small $\chi_m > 0$; ferromagnets $\chi_m \gg 1$.)` }),

    // ================================================================ Problem 2
    P({ src: 'HW 7 #2(a)', title: 'Continuity at the origin',
      q: md`(a) For the time-independent current density $\mathbf J = (5z^2\,\hat x + 4x^3y\,\hat y + 3z(y - y_o)^2\,\hat z)$ A/m², find the charge density $\rho(0, t)$ at the origin as a function of time, if $\rho = 0$ there at $t = 0$, $y_o = 2$ m, and $x$, $y$, $z$ are in meters. Hint: use the continuity equation $\dfrac{\partial\rho}{\partial t} + \nabla\cdot\mathbf J = 0$.`,
      parts: [N('\\partial\\rho/\\partial t\\ \\text{at the origin}', -12, 'C/(m^3·s)'),
        MC('$\\rho(0, t) = $', ['$-12t$ C/m³', '$+12t$ C/m³', '$-12$ C/m³', '$-12e^{-t}$ C/m³'], 0,
          [null, 'Sign: $\\partial\\rho/\\partial t = -\\nabla\\cdot\\mathbf J$. Current flowing out of a point drains its charge.', 'That is the rate; integrate it from $\\rho(0) = 0$.', 'A time-independent $\\mathbf J$ gives a constant rate, not an exponential.'])],
      hints: ['$\\nabla\\cdot\\mathbf J = \\partial J_x/\\partial x + \\partial J_y/\\partial y + \\partial J_z/\\partial z$; $J_x = 5z^2$ does not depend on $x$.', 'At the origin with $y_o = 2$: $\\nabla\\cdot\\mathbf J = 4(0)^3 + 3(0 - 2)^2$.'],
      sol: md`$$\nabla\cdot\mathbf J = \frac{\partial(5z^2)}{\partial x} + \frac{\partial(4x^3y)}{\partial y} + \frac{\partial\big(3z(y - y_o)^2\big)}{\partial z} = 0 + 4x^3 + 3(y - y_o)^2$$
At the origin, $\nabla\cdot\mathbf J = 0 + 3(0 - 2)^2 = 12$ A/m³. Continuity:
$$\frac{\partial\rho}{\partial t} = -\nabla\cdot\mathbf J = -12\ \text{C/(m}^3\text{s)} \quad\Rightarrow\quad \rho(0, t) = -12t\ \text{C/m}^3\ \ (t\ \text{in s})$$
Net current leaves the origin at a steady rate, so the charge there drains linearly and goes negative. (A steady $\mathbf J$ with nonzero divergence cannot last forever in a real material; the problem is an exercise in the bookkeeping.)` }),
    P({ src: 'HW 7 #2(b)', title: 'Units of the coefficients',
      q: md`(b) In part (a), deduce the physical units of the coefficients 5, 4 and 3 in $J_x$, $J_y$ and $J_z$ by dimensional analysis.`,
      parts: [MC('The 5 in $J_x = 5z^2$ has units', ['A/m⁴', 'A/m²', 'A/m⁵', 'A/m⁶'], 0, [null, 'That is the unit of $\\mathbf J$ itself; $z^2$ adds m².', 'Count again: $z^2$ is m², so divide A/m² by m².', 'That is for the 4.']),
        MC('The 4 in $J_y = 4x^3y$ has units', ['A/m⁶', 'A/m⁴', 'A/m⁵', 'A/m²'], 0, [null, '$x^3y$ is m⁴, not m².', '$x^3y$ is m⁴: A/m² ÷ m⁴.', 'That is the unit of $\\mathbf J$; the coefficient carries the extra m⁻⁴.']),
        MC('The 3 in $J_z = 3z(y - y_o)^2$ has units', ['A/m⁵', 'A/m⁴', 'A/m⁶', 'A/m³'], 0, [null, '$z(y - y_o)^2$ is m³.', '$z(y - y_o)^2$ is m³, not m⁴.', 'That divides A/m² by a single meter; $z(y - y_o)^2$ is m³, so A/m² ÷ m³ = A/m⁵.'])],
      sol: md`Each term must come out in A/m²:
- $5z^2$: $[5]\cdot\text{m}^2 = \text{A/m}^2 \Rightarrow [5] = \text{A/m}^4$.
- $4x^3y$: $[4]\cdot\text{m}^4 = \text{A/m}^2 \Rightarrow [4] = \text{A/m}^6$.
- $3z(y - y_o)^2$: $[3]\cdot\text{m}^3 = \text{A/m}^2 \Rightarrow [3] = \text{A/m}^5$.

**Check with (a).** $\nabla\cdot\mathbf J$ must be A/m³: $\partial_y(4x^3y) = 4x^3$ has $(\text{A/m}^6)(\text{m}^3) = \text{A/m}^3$ ✓, and $\partial_z(3z(y - y_o)^2) = 3(y - y_o)^2$ has $(\text{A/m}^5)(\text{m}^2) = \text{A/m}^3$ ✓.` }),

    // ================================================================ Problem 3
    P({ src: 'HW 7 #3(a)–(b)', title: 'Relaxation in a homogeneous conductor',
      q: md`(a) Show that in a homogeneous conductor where $\mathbf J = \sigma\mathbf E$, Gauss's law $\nabla\cdot\mathbf E = \rho/\epsilon_o$ and the continuity equation $\partial\rho/\partial t + \nabla\cdot\mathbf J = 0$ together give
$$\frac{\partial\rho}{\partial t} + \frac{\sigma}{\epsilon_o}\rho = 0$$
for the charge density $\rho$.

(b) Find the solution for $t > 0$ if at $t = 0$ the charge density is $\rho(x, y, z, 0) = \sin(100x)$ C/m³ over all space.`,
      parts: [MC('(b) $\\rho(x, y, z, t) = $', ['$\\sin(100x)\\,e^{-\\sigma t/\\epsilon_o}$', '$\\sin(100x - \\sigma t/\\epsilon_o)$', '$\\sin(100x)\\,e^{-\\epsilon_ot/\\sigma}$', '$\\sin(100x)\\,(1 - \\sigma t/\\epsilon_o)$'], 0,
        [null, 'The equation has no $x$-derivative: each point decays on its own, nothing moves.', 'Units: $\\epsilon_o/\\sigma$ is the time constant, so the exponent is $-t\\sigma/\\epsilon_o$.', 'That is only the first-order Taylor term; the exact solution is the exponential.'])],
      hints: ['Homogeneous: $\\sigma$ is the same everywhere, so $\\nabla\\cdot(\\sigma\\mathbf E) = \\sigma\\nabla\\cdot\\mathbf E$.', 'At each point the equation is $d\\rho/dt = -\\rho/\\tau$ with $\\tau = \\epsilon_o/\\sigma$: the spatial shape just multiplies $e^{-t/\\tau}$.'],
      sol: md`(a) Take the divergence of $\mathbf J = \sigma\mathbf E$. With $\sigma$ uniform, $\nabla\cdot\mathbf J = \sigma\,\nabla\cdot\mathbf E = \sigma\rho/\epsilon_o$ by Gauss's law. Put that into continuity:
$$\frac{\partial\rho}{\partial t} + \frac{\sigma}{\epsilon_o}\rho = 0$$
(If $\sigma$ varied in space, $\nabla\sigma\cdot\mathbf E$ would add a term.)

(b) There are no spatial derivatives in the equation, so each point evolves by itself: $\rho(\mathbf r, t) = \rho(\mathbf r, 0)\,e^{-t/\tau}$ with $\tau = \epsilon_o/\sigma$:
$$\rho(x, y, z, t) = \sin(100x)\,e^{-\sigma t/\epsilon_o}\ \ \text{C/m}^3$$
The pattern does not move or spread; it fades in place ([Topic 3](#/l/t3-relaxation)).` }),
    P({ src: 'HW 7 #3(c)', title: 'How fast?',
      q: md`(c) According to the solution in (b), how long does it take for $\rho$ to fall to $0.01\sin(100x)$ C/m³? Assume $\sigma = 5.0\times10^7$ S/m.`,
      parts: [N('t', t3, 's')],
      hints: ['$e^{-t/\\tau} = 0.01$, so $t = \\tau\\ln100$.', '$\\tau = \\epsilon_o/\\sigma = 8.854\\times10^{-12}/5\\times10^7$.'],
      sol: md`$e^{-t/\tau} = 0.01 \Rightarrow t = \tau\ln100 = 4.61\,\tau$, with
$$\tau = \frac{\epsilon_o}{\sigma} = \frac{8.854\times10^{-12}\ \text{F/m}}{5.0\times10^7\ \text{S/m}} = 1.77\times10^{-19}\ \text{s}, \qquad t = (4.61)(1.77\times10^{-19}\ \text{s}) = 8.15\times10^{-19}\ \text{s}$$
**Comment.** That is far shorter than the time between electron collisions in a metal ($\sim10^{-14}$ s), so this simple model stops being accurate; what survives is the conclusion: in a good conductor any charge imbalance disappears from the interior essentially at once.` }),
    P({ src: 'HW 7 #3(d)', title: 'Where does the energy go?',
      q: md`(d) Discuss the energetics of the process: state whether the energy per unit volume is zero or nonzero at $t = 0$ and as $t\to\infty$, and what happens to the energy stored in the quasistatic field at $t = 0$.`,
      parts: [FIX('Energy per unit volume at $t = 0$', ['nonzero', 'zero'], 0, [null, 'The charge pattern makes a field $E_x = -\\cos(100x)/(100\\epsilon_o)$, which stores $\\tfrac12\\epsilon_oE^2$.']),
        FIX('As $t\\to\\infty$', ['zero', 'nonzero'], 0, [null, 'The charge, and with it the field, decays to zero.']),
        MC('The stored field energy', ['is dissipated as Joule heat, $\\sigma E^2$ per unit volume', 'is radiated away as a plane wave', 'stays in the field as a magnetic field', 'turns into the kinetic energy of the departing charge'], 0,
          [null, 'There is no magnetic field ($\\nabla\\times\\mathbf H = \\sigma\\mathbf E + \\epsilon_o\\partial_t\\mathbf E = 0$), so no Poynting flux carries it away.', 'The conduction and displacement currents cancel exactly, so no $\\mathbf H$ is made.', 'In a resistive medium the drift kinetic energy is negligible; collisions turn the work into heat.'])],
      hints: ['At $t = 0$, Gauss: $dE_x/dx = \\sin(100x)/\\epsilon_o$, so $E_x = -\\cos(100x)/(100\\epsilon_o)$ (no uniform part).', 'Poynting\'s theorem with $\\mathbf J = \\sigma\\mathbf E$: $\\partial w_e/\\partial t = -\\sigma E^2$ when no power flows.'],
      sol: md`**At $t = 0$.** Gauss's law with $\rho = \sin(100x)$ gives $dE_x/dx = \sin(100x)/\epsilon_o$, so (taking no applied uniform field)
$$E_x(x, 0) = -\frac{\cos(100x)}{100\,\epsilon_o}\ \text{V/m}, \qquad w_e = \tfrac12\epsilon_oE_x^2 = \frac{\cos^2(100x)}{2\times10^4\,\epsilon_o}$$
Nonzero: up to $5.65\times10^6$ J/m³ (average $2.82\times10^6$ J/m³).

**As $t\to\infty$.** $\rho \propto e^{-t/\tau}$, so $\mathbf E \propto e^{-t/\tau}$ and $w_e \propto e^{-2t/\tau} \to 0$.

**Where it went.** Total current: $\sigma\mathbf E + \epsilon_o\partial\mathbf E/\partial t = \sigma\mathbf E - (\epsilon_o/\tau)\mathbf E = 0$, so $\nabla\times\mathbf H = 0$: no magnetic field, no Poynting vector, nothing radiated. Poynting's theorem then reduces to
$$\frac{\partial w_e}{\partial t} = \epsilon_oE\frac{\partial E}{\partial t} = -\frac{\epsilon_o}{\tau}E^2 = -\sigma E^2 = -\mathbf J\cdot\mathbf E$$
Every joule of field energy becomes Joule heat in the conductor, at the rate $\sigma E^2$ per unit volume ([Topic 17](#/l/t17-poynting)).` }),

    // ================================================================ Problem 4
    P({ src: 'HW 7 #4(a)', title: 'H from E with Faraday',
      q: md`(a) If $\mathbf E = \cos(\omega t - \beta x)\,\hat y$ V/m, $\omega/\beta = c$ and $\mu = \mu_o$, find the corresponding $\mathbf H$ using Faraday's law $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$. Hint: find a suitable time-varying antiderivative of $\nabla\times\mathbf E$.`,
      parts: [N('|\\mathbf H|_{\\max}', H4, 'A/m'),
        FIX('Where $\\cos(\\omega t - \\beta x) > 0$, $\\mathbf H$ points along', ['$+\\hat z$', '$-\\hat z$', '$+\\hat x$', '$+\\hat y$'], 0, [null, 'Sign: $\\nabla\\times\\mathbf E = +\\beta\\sin(\\ldots)\\hat z$, and $-\\mu_o\\partial_t$ of $\\cos(\\ldots)\\hat z$ gives the same sign.', 'That is the direction of travel; a plane wave has no field along it.', '$\\mathbf H$ is perpendicular to $\\mathbf E$.'])],
      hints: ['$\\nabla\\times(E_y\\hat y) = \\hat z\\,\\partial E_y/\\partial x - \\hat x\\,\\partial E_y/\\partial z = \\beta\\sin(\\omega t - \\beta x)\\,\\hat z$.', 'An antiderivative in $t$ of $\\sin(\\omega t - \\beta x)$ is $-\\cos(\\omega t - \\beta x)/\\omega$; then use $\\beta/(\\omega\\mu_o) = 1/(\\mu_oc) = 1/\\eta_0$.'],
      sol: md`$$\nabla\times\mathbf E = \hat z\frac{\partial E_y}{\partial x} = \beta\sin(\omega t - \beta x)\,\hat z = -\mu_o\frac{\partial\mathbf H}{\partial t}$$
The time-varying antiderivative of $\beta\sin(\omega t - \beta x)$ is $-\tfrac\beta\omega\cos(\omega t - \beta x)$ (a static constant of integration is not part of the wave, so drop it):
$$\mathbf H = \frac{\beta}{\omega\mu_o}\cos(\omega t - \beta x)\,\hat z = \frac{1}{\mu_oc}\cos(\omega t - \beta x)\,\hat z = \frac{1}{\eta_0}\cos(\omega t - \beta x)\,\hat z\ \text{A/m}$$
$1/\eta_0 = 1/(120\pi) = 2.65\times10^{-3}$, so $\mathbf H = 2.65\cos(\omega t - \beta x)\,\hat z$ mA/m.

**Check.** $\mathbf E\times\mathbf H \propto \hat y\times\hat z = \hat x$: along the travel direction of $\cos(\omega t - \beta x)$ ✓. Shortcut: $\mathbf H = \tfrac1{\eta_0}\hat k\times\mathbf E = \tfrac1{\eta_0}\hat x\times\hat y\cos(\ldots)$ ✓ ([Topic 16](#/l/t16-sinusoids)).` }),
    P({ src: 'HW 7 #4(b)', title: 'E from H with Ampère',
      q: md`(b) If $\mathbf H = \cos(\omega t + \beta y)\,\hat x$ A/m, $\sigma = 0$, $\omega/\beta = \tfrac23c$ and $\epsilon = 2.25\epsilon_o$, find the corresponding $\mathbf E$ using Ampère's law $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$, in which $\mathbf J = \sigma\mathbf E$ and $\mathbf D = \epsilon\mathbf E$.`,
      parts: [N('|\\mathbf E|_{\\max}', E4, 'V/m'),
        FIX('Where $\\cos(\\omega t + \\beta y) > 0$, $\\mathbf E$ points along', ['$+\\hat z$', '$-\\hat z$', '$+\\hat y$', '$-\\hat x$'], 1, ['Sign: $(\\nabla\\times\\mathbf H)_z = -\\partial H_x/\\partial y = +\\beta\\sin(\\omega t + \\beta y)$, and the antiderivative of $\\sin$ is $-\\cos$.', null, 'That is (minus) the direction of travel; the field is perpendicular to it.', '$\\mathbf E$ is perpendicular to $\\mathbf H$.'])],
      hints: ['$\\nabla\\times(H_x\\hat x) = \\hat y\\,\\partial H_x/\\partial z - \\hat z\\,\\partial H_x/\\partial y = \\beta\\sin(\\omega t + \\beta y)\\,\\hat z$.', 'With $\\sigma = 0$: $\\epsilon\\,\\partial\\mathbf E/\\partial t = \\nabla\\times\\mathbf H$. Then $\\beta/(\\epsilon\\omega) = 1/(\\epsilon v_p)$.'],
      sol: md`$$\nabla\times\mathbf H = -\hat z\frac{\partial H_x}{\partial y} = \beta\sin(\omega t + \beta y)\,\hat z = \sigma\mathbf E + \epsilon\frac{\partial\mathbf E}{\partial t} = \epsilon\frac{\partial\mathbf E}{\partial t}$$
Antiderivative in $t$:
$$\mathbf E = -\frac{\beta}{\epsilon\omega}\cos(\omega t + \beta y)\,\hat z, \qquad \frac{\beta}{\epsilon\omega} = \frac{1}{\epsilon v_p} = \frac{1}{(2.25\epsilon_o)(\tfrac23c)} = \frac{1}{1.5\,\epsilon_oc} = \frac{\eta_0}{1.5} = 80\pi\ \Omega$$
$$\mathbf E = -80\pi\cos(\omega t + \beta y)\,\hat z = -251\cos(\omega t + \beta y)\,\hat z\ \text{V/m}$$
**Check.** The ratio $|E|/|H| = 80\pi = \eta_0/\sqrt{2.25}$ is the medium's $\eta$ ✓ (the data imply $\mu = 1/(v_p^2\epsilon) = \mu_o$). $\mathbf E\times\mathbf H \propto (-\hat z)\times\hat x = -\hat y$: the wave $\cos(\omega t + \beta y)$ travels toward $-y$ ✓.` }),

    // ================================================================ Problem 5
    P({ src: 'HW 7 #5(a)', title: 'd\'Alembert\'s solution',
      q: md`(a) Show that $y(x, t) = f(\omega t - \beta x) + g(\omega t + \beta x)$ satisfies the scalar wave equation $\dfrac{\partial^2y}{\partial t^2} = v_p^2\dfrac{\partial^2y}{\partial x^2}$, where $v_p = \omega/\beta$ is the speed of propagation.`,
      parts: [],
      sol: md`Chain rule, with $u = \omega t - \beta x$ and $s = \omega t + \beta x$:
$$\frac{\partial^2y}{\partial t^2} = \omega^2f''(u) + \omega^2g''(s) \qquad \frac{\partial^2y}{\partial x^2} = (-\beta)^2f''(u) + \beta^2g''(s) = \beta^2\big[f''(u) + g''(s)\big]$$
So $\dfrac{\partial^2y}{\partial t^2} = \dfrac{\omega^2}{\beta^2}\dfrac{\partial^2y}{\partial x^2} = v_p^2\dfrac{\partial^2y}{\partial x^2}$ for **any** twice-differentiable $f$ and $g$ ✓. $f$ keeps its shape while moving toward $+x$ at $\omega/\beta$ (its argument is constant on $x = (\omega t - \text{const})/\beta$); $g$ moves toward $-x$ ([Topic 14](#/l/t14-wave-eq)).` }),
    P({ src: 'HW 7 #5(b)', title: 'cos² as a wave',
      q: md`(b) Is $\mathbf E = \cos^2(\omega t - \beta x)\,\hat y$ V/m a valid solution of the vector wave equation $\dfrac{\partial^2\mathbf E}{\partial x^2} + \dfrac{\partial^2\mathbf E}{\partial y^2} + \dfrac{\partial^2\mathbf E}{\partial z^2} = \mu\epsilon\dfrac{\partial^2\mathbf E}{\partial t^2}$? Explain mathematically and in words. What relationship between $\beta$, $\omega$, $\mu$ and $\epsilon$ must hold?`,
      parts: [MC('It is a valid solution', ['if and only if $\\beta = \\omega\\sqrt{\\mu\\epsilon}$', 'for any $\\beta$ and $\\omega$', 'never: only sines and cosines solve it', 'only if $\\beta = 2\\omega\\sqrt{\\mu\\epsilon}$, because $\\cos^2$ has frequency $2\\omega$'], 0,
        [null, 'Plugging in gives $(\\beta^2 - \\mu\\epsilon\\omega^2)f\'\' = 0$; $f\'\' \\ne 0$, so the bracket must vanish.', 'Any $f(\\omega t - \\beta x)$ works, $\\cos^2$ included.', 'The doubling applies to both $\\omega$ and $\\beta$, so their ratio, the speed, is unchanged.'])],
      sol: md`**Mathematically.** $\mathbf E = f(\omega t - \beta x)\,\hat y$ with $f(u) = \cos^2u$, so $f''(u) = -2\cos2u$. Only the $x$-derivative survives:
$$\frac{\partial^2E_y}{\partial x^2} = \beta^2f'' \qquad \mu\epsilon\frac{\partial^2E_y}{\partial t^2} = \mu\epsilon\omega^2f''$$
They agree for all $x$, $t$ exactly when $\beta^2 = \omega^2\mu\epsilon$, i.e. $\beta = \omega\sqrt{\mu\epsilon}$ (equivalently $\omega/\beta = 1/\sqrt{\mu\epsilon}$).

**In words.** $\cos^2(\omega t - \beta x) = \tfrac12 + \tfrac12\cos(2\omega t - 2\beta x)$: a constant plus a cosine of twice the frequency and twice the phase constant. Both pieces, and the whole shape, travel toward $+x$ without distortion at $\omega/\beta$, which must be the medium's speed $1/\sqrt{\mu\epsilon}$. ($\hat y\perp\hat x$, so $\nabla\cdot\mathbf E = 0$ too.)` }),
    P({ src: 'HW 7 #5(c)', title: 'A standing wave',
      q: md`(c) Is $\mathbf E = \cos(\omega t)\cos(\beta x)\,\hat y$ V/m a valid solution of the wave equation? Explain mathematically and in words.`,
      parts: [MC('It is', ['valid if $\\beta = \\omega\\sqrt{\\mu\\epsilon}$: a standing wave, the sum of two equal waves going opposite ways', 'not valid: it is not a function of $\\omega t - \\beta x$', 'valid for any $\\beta$, $\\omega$: products always separate', 'valid only at the nodes $\\cos(\\beta x) = 0$'], 0,
        [null, 'd\'Alembert allows $f(\\omega t - \\beta x) + g(\\omega t + \\beta x)$; this is exactly such a sum.', 'Plugging in still requires $\\beta^2 = \\mu\\epsilon\\omega^2$.', 'It satisfies the equation everywhere, nodes included.'])],
      sol: md`**Mathematically.** $\partial^2_xE_y = -\beta^2E_y$ and $\mu\epsilon\,\partial^2_tE_y = -\mu\epsilon\omega^2E_y$: valid when $\beta^2 = \omega^2\mu\epsilon$, the same condition as (b).

**In words.** $\cos(\omega t)\cos(\beta x) = \tfrac12\cos(\omega t - \beta x) + \tfrac12\cos(\omega t + \beta x)$: two equal waves, one going $+x$ and one going $-x$. Together they make a **standing wave**: the pattern oscillates in place, with nodes (always zero) at $\beta x = \pi/2 + n\pi$, every half wavelength, and it carries no net power ([Topic 17](#/l/t17-poynting)).` }),
    P({ src: 'HW 7 #5(d)', title: 'An oblique wave',
      q: md`(d) Is $\mathbf E = \cos(\omega t - \beta_xx - \beta_yy)\,\hat z$ V/m a valid solution of the wave equation? Explain mathematically and in words. What relationship between $\beta$, $\omega$, $\mu$ and $\epsilon$ must hold?`,
      parts: [MC('It is valid if', ['$\\beta_x^2 + \\beta_y^2 = \\omega^2\\mu\\epsilon$', '$\\beta_x + \\beta_y = \\omega\\sqrt{\\mu\\epsilon}$', '$\\beta_x = \\beta_y = \\omega\\sqrt{\\mu\\epsilon}$', '$\\beta_x\\beta_y = \\omega^2\\mu\\epsilon$'], 0,
        [null, 'The second derivatives add: $-\\beta_x^2 - \\beta_y^2$. The phase constants add as components of a vector.', 'That would make the wave travel at $1/\\sqrt{2\\mu\\epsilon}$, too slowly.', 'Products never appear: each second derivative brings down one square.']),
        MC('It travels', ['along $(\\beta_x\\hat x + \\beta_y\\hat y)/\\sqrt{\\beta_x^2 + \\beta_y^2}$, in the $xy$-plane', 'along $\\hat z$', 'along $+\\hat x$ only', 'nowhere: it is a standing wave'], 0,
          [null, '$\\hat z$ is the field direction; the phase varies only with $x$ and $y$.', 'The phase decreases along both $x$ and $y$.', 'There is a single cosine with $\\omega t - \\ldots$: it travels.'])],
      sol: md`**Mathematically.** $\partial^2_xE_z = -\beta_x^2E_z$, $\partial^2_yE_z = -\beta_y^2E_z$, $\partial^2_zE_z = 0$, $\mu\epsilon\,\partial^2_tE_z = -\mu\epsilon\omega^2E_z$:
$$-(\beta_x^2 + \beta_y^2)E_z = -\mu\epsilon\omega^2E_z \quad\Rightarrow\quad \beta_x^2 + \beta_y^2 = \omega^2\mu\epsilon$$
**In words.** Write $\boldsymbol\beta = \beta_x\hat x + \beta_y\hat y$: the field is $\cos(\omega t - \boldsymbol\beta\cdot\mathbf r)$, a uniform plane wave whose wavefronts are the lines $\beta_xx + \beta_yy = $ const and which travels along $\boldsymbol\beta$ (in the $xy$-plane, at angle $\tan^{-1}(\beta_y/\beta_x)$ from $\hat x$). Its phase constant is $|\boldsymbol\beta| = \sqrt{\beta_x^2 + \beta_y^2}$, which must equal $\omega\sqrt{\mu\epsilon}$. The field $\hat z$ is perpendicular to $\boldsymbol\beta$, so $\nabla\cdot\mathbf E = 0$ as well: a genuine Maxwell wave, not just a wave-equation solution.` }),

    // ================================================================ Problem 6
    RF(md`### Problem 6 · A triangular pulse traveling toward −x

A $z$-polarized plane TEM wave propagates in vacuum ($v = c \approx 3\times10^8$ m/s, $\eta = \eta_o \approx 120\pi\ \Omega$) in the $-x$ direction. At $x = 0$ its field varies as $E_z(0, t) = 2\triangle(t/\tau)$ V/m, with $\tau = 3$ µs, where $\triangle(t/\tau)$ is the unit triangle function of width $\tau$ (Kudeki's convention: $\triangle(u) = 1 - 2|u|$ for $|u| < \tfrac12$, zero otherwise; height 1, width 1).

[[fig:in]]`, { in: fig6in }),
    P({ src: 'HW 7 #6(a)–(b)', title: 'The fields',
      q: md`(a) Determine the vector wavefield $\mathbf E(x, t)$ written explicitly in terms of $x$ and $t$. (b) Determine the accompanying $\mathbf H(x, t)$ in A/m.`,
      parts: [MC('(a) $\\mathbf E(x, t) = $', ['$2\\triangle\\!\\left(\\dfrac{t + x/c}{\\tau}\\right)\\hat z$ V/m', '$2\\triangle\\!\\left(\\dfrac{t - x/c}{\\tau}\\right)\\hat z$ V/m', '$2\\triangle\\!\\left(\\dfrac{t}{\\tau} + \\dfrac{x}{c}\\right)\\hat z$ V/m', '$2\\triangle\\!\\left(\\dfrac{x + ct}{\\tau}\\right)\\hat z$ V/m'], 0,
        [null, 'That travels toward $+x$.', 'Units: $t/\\tau$ is dimensionless but $x/c$ is in seconds; the delay must be divided by $\\tau$ too.', 'Units: $(x + ct)$ is in meters; divide by $c\\tau$, not $\\tau$.']),
        N('|\\mathbf H|_{\\max}', 2 / EM.eta0, 'A/m'),
        FIX('(b) Where $E_z > 0$, $\\mathbf H$ points along', ['$+\\hat y$', '$-\\hat y$', '$-\\hat x$', '$+\\hat z$'], 0, [null, 'Then $\\mathbf E\\times\\mathbf H = \\hat z\\times(-\\hat y) = +\\hat x$: the wrong way.', 'That is the travel direction; a TEM wave has no field along it.', '$\\mathbf H$ is perpendicular to $\\mathbf E$.'])],
      hints: ['Toward $-x$: $E_z(x, t) = E_z(0, t + x/c)$. Replace $t$ by $t + x/c$ inside the triangle.', '$\\mathbf H = \\tfrac{1}{\\eta_o}\\hat k\\times\\mathbf E$ with $\\hat k = -\\hat x$.'],
      sol: md`(a) A wave moving toward $-x$ is a function of $t + x/c$: what $x = 0$ sees at time $t$, the point $x < 0$ sees a time $|x|/c$ later. So
$$\mathbf E(x, t) = 2\triangle\!\left(\frac{t + x/c}{\tau}\right)\hat z = 2\triangle\!\left(\frac{t + x/(3\times10^8)}{3\times10^{-6}}\right)\hat z\ \ \text{V/m}$$
(b) $\mathbf H = \tfrac1{\eta_o}\hat k\times\mathbf E = \tfrac{1}{120\pi}(-\hat x)\times\hat z\,E_z = \tfrac{E_z}{120\pi}\,\hat y$:
$$\mathbf H(x, t) = \frac{1}{60\pi}\triangle\!\left(\frac{t + x/c}{\tau}\right)\hat y = 5.31\,\triangle\!\left(\frac{t + x/c}{\tau}\right)\hat y\ \ \text{mA/m}$$
**Check with Faraday.** $(\nabla\times\mathbf E)_y = -\partial E_z/\partial x = -\tfrac1cE_z' = -\mu_o\partial H_y/\partial t$ gives $H_y = E_z/(\mu_oc) = E_z/\eta_o$ ✓. And $\mathbf E\times\mathbf H \propto \hat z\times\hat y = -\hat x$ ✓.` }),
    P({ src: 'HW 7 #6(c)–(d)', title: 'The Poynting vector and its peak',
      q: md`(c) Determine the maximum value of the Poynting vector $\mathbf E\times\mathbf H$. (d) What trajectory $x = x(t)$ describes the instantaneous location of the peak of $\mathbf E\times\mathbf H$?`,
      parts: [N('|\\mathbf E\\times\\mathbf H|_{\\max}', Smax6, 'W/m^2'),
        MC('(d) The peak is at', ['$x = -ct$', '$x = +ct$', '$x = -c(t - \\tau/2)$', '$x = -c\\tau$, fixed'], 0,
          [null, 'The pulse travels toward $-x$.', 'The triangle peaks where its argument is zero, $t + x/c = 0$, not at its edge.', 'The pulse moves; its peak moves with it.'])],
      hints: ['$\\mathbf S = E_zH_y(\\hat z\\times\\hat y) = -\\tfrac{E_z^2}{\\eta_o}\\hat x$; the triangle peaks at 1.', 'The peak is where $\\triangle$\'s argument is zero: $t + x/c = 0$.'],
      sol: md`(c) $\mathbf S = \mathbf E\times\mathbf H = E_zH_y\,(\hat z\times\hat y) = -\dfrac{E_z^2}{\eta_o}\hat x$. Its largest magnitude is at the triangle's peak, $E_z = 2$ V/m:
$$|\mathbf S|_{\max} = \frac{(2\ \text{V/m})^2}{120\pi\ \Omega} = \frac{1}{30\pi} = 1.06\times10^{-2}\ \text{W/m}^2 \quad\text{directed along } -\hat x$$
(No ½: this is a pulse, not a sinusoid's average.)

(d) $|\mathbf S| \propto \triangle^2$ peaks where the argument vanishes, $t + x/c = 0$:
$$x(t) = -ct = -3\times10^8\,t\ \ \text{m}$$
a point moving toward $-x$ at the speed of light, through $x = 0$ at $t = 0$.` }),
    P({ src: 'HW 7 #6(e)', title: 'The time trace at x = −1000 m',
      q: md`(e) Plot $E_z(x, t)$ versus $t$ at $x = -1000$ m.`,
      parts: [N('t\\ \\text{of the peak}', 10 / 3, 'µs'), N('\\text{first nonzero at}\\ t', 10 / 3 - 1.5, 'µs'), N('\\text{back to zero at}\\ t', 10 / 3 + 1.5, 'µs')],
      hints: ['$E_z(-1000, t) = 2\\triangle\\big((t - 1000/c)/\\tau\\big)$: the input, delayed by $1000/c$.'],
      sol: md`$E_z(-1000\ \text{m}, t) = 2\triangle\!\left(\dfrac{t - 1000/c}{\tau}\right)$ with $1000/c = 3.33$ µs: the same triangle (peak 2 V/m, total width 3 µs), delayed by 3.33 µs. It rises from 0 at $t = 1.83$ µs to 2 V/m at 3.33 µs and falls back to 0 at 4.83 µs.

[[fig:e]]

(The assignment prints $x = -1000$ m; at $x = +1000$ m the pulse would pass 3.33 µs *before* it reaches $x = 0$, centered at $t = -3.33$ µs.)`,
      figs: { e: fig6e } }),
    P({ src: 'HW 7 #6(f)', title: 'The snapshot at t = 20 µs',
      q: md`(f) Plot $H_y(x, t)$ versus $x$ at $t = 20$ µs.`,
      parts: [N('x\\ \\text{of the peak}', -6000, 'm'), N('\\text{pulse length}', 900, 'm'), N('H_{y,\\max}', 1000 * 2 / EM.eta0, 'mA/m')],
      hints: ['$H_y(x, 20\\ \\mu\\text{s}) = \\tfrac{1}{60\\pi}\\triangle\\big((20\\ \\mu\\text{s} + x/c)/\\tau\\big)$: nonzero where $|20\\ \\mu\\text{s} + x/c| < \\tau/2$.'],
      sol: md`$H_y(x, 20\ \mu\text{s}) = 5.31\,\triangle\!\left(\dfrac{20\ \mu\text{s} + x/c}{3\ \mu\text{s}}\right)$ mA/m. The peak sits where $20\ \mu\text{s} + x/c = 0$: $x = -c(20\ \mu\text{s}) = -6000$ m. It is nonzero for $|x + 6000\ \text{m}| < c\tau/2 = 450$ m, i.e. $-6450 < x < -5550$ m: a triangle 900 m long with peak 5.31 mA/m.

[[fig:f]]

A snapshot shows the waveform reversed in space (its earliest part has gone farthest, toward $-x$), but a symmetric triangle looks the same either way.`,
      figs: { f: fig6f } }),
  ];

  EM.lesson('e2-hw', { id: 'hw7', kind: 'hw', title: 'HW 7 · measuring ε and μ, continuity, relaxation, Maxwell curls, wave solutions, a triangular pulse', steps });
})();

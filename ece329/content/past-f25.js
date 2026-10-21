/* Fall 2025 Exam 2 (Chen, Mitchell, Shao), the most recent Exam 2: typed from a scanned copy (handwriting removed),
   blank, with symbolic answer boxes and full solutions. No official key; every answer was derived here and checked.
   Loaded before past.js so it heads the past-exam unit. */
(function () {
  'use strict';
  const { R, P } = C;
  const CH = (lbl, mc, a, why) => ({ lbl, mc, a, why });                // multiple choice; the site shuffles the options
  const N = (lbl, ans, unit, rel = 0.02) => ({ lbl, ans, unit, tol: { rel } });
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });                 // symbolic answer, checked at random values
  const ETA = 120 * Math.PI, h = 10 / ETA;                              // 10 V/m over eta0: 1/(12 pi) A/m

  // ---------------------------------------------------------------- figures
  function solenoidFig() {
    const g = PF.fig({ alt: 'a vertical solenoid of length L and radius r wound on a magnetic core; the lead leaves the top turn on the right; z points up' });
    const cx = 80, y0 = 24, y1 = 176, rx = 34, ry = 7;
    g.rect(cx - rx, y0, 2 * rx, y1 - y0, { cls: 'shade' });
    g.line(cx - rx, y0, cx - rx, y1); g.line(cx + rx, y0, cx + rx, y1);
    g.ellipse(cx, y0, rx, ry); g.ellipse(cx, y1, rx, ry, { half: 'front' });
    for (let y = y0 + 14; y <= y1 - 8; y += 11) g.ellipse(cx, y, rx + 3, ry, { half: 'front', cls: 'thick' });
    g.pl([[cx + rx + 3, y0 + 14], [cx + rx + 22, y0 - 4], [cx + rx + 40, y0 - 16]], { cls: 'thick', arrow: 'end', hs: 8 });
    g.label(cx + rx + 44, y0 - 18, 'I(t)', 'bl');
    g.dim(cx - rx - 20, y0, cx - rx - 20, y1, 'L', { at: 'l' });
    g.dim(cx - rx, y1 + 20, cx + rx, y1 + 20, '2r', { at: 'b' });
    g.arrow(cx + rx + 50, 120, cx + rx + 50, 84, { hs: 7 }); g.label(cx + rx + 56, 92, '\\hat z', 'l');
    return g.svg();
  }
  function capFig() {
    const g = PF.fig({ alt: 'a parallel-plate capacitor, plate area A, gap d, filled with permittivity epsilon, connected to an AC source V(t)' });
    g.line(30, 40, 170, 40, { cls: 'thick' }); g.line(30, 100, 170, 100, { cls: 'thick' });
    g.label(100, 70, '\\epsilon', 'c'); g.label(100, 30, 'A', 'b', 'small');
    g.dim(18, 40, 18, 100, 'd', { at: 'l' });
    g.pl([[170, 40], [250, 40], [250, 54]]); g.pl([[170, 100], [250, 100], [250, 86]]);
    g.circle(250, 70, 16); g.label(250, 70, '\\sim', 'c'); g.label(272, 70, 'V(t)', 'l');
    return g.svg();
  }
  function platesFig() {
    const g = PF.fig({ alt: 'two circular plates of radius R a distance d apart along z; E points up between them; a dashed circle of radius r between the plates' });
    const cx = 150, yb = 120, yt = 50, R0 = 100;
    g.line(cx - R0, yb, cx + R0, yb, { cls: 'thick' }); g.line(cx - R0, yt, cx + R0, yt, { cls: 'thick' });
    for (const x of [cx - 80, cx - 40, cx + 40, cx + 80]) g.arrow(x, yb - 6, x, yt + 8, { cls: 'dim', hs: 6 });
    g.ellipse(cx, 85, 52, 10, { cls: 'dash' });
    g.arrow(cx, 85, cx + 52, 85, { cls: 'dim', hs: 5 }); g.label(cx + 26, 88, 'r', 't', 'small');
    g.dim(cx, yb + 16, cx + R0, yb + 16, 'R', { at: 'b' });
    g.dim(cx + R0 + 16, yt, cx + R0 + 16, yb, 'd', { at: 'r' });
    g.label(cx - 92, 70, '\\mathbf E', 'r');
    g.arrow(cx + R0 + 46, 104, cx + R0 + 46, 70, { hs: 7 }); g.label(cx + R0 + 52, 76, '\\hat z', 'l');
    return g.svg();
  }
  const snapPts = [[0, 0], [3, 10], [6, 0], [9, -10], [9, 0], [12, 0]];
  const snapFig = () => PF.plot({ w: 340, h: 210, x: [0, 13], y: [-12, 12], zero: true, xl: 'z\\,(\\text{m})', yl: 'E_x\\,(\\text{V/m})',
    xt: [[3, '3'], [6, '6'], [9, '9'], [12, '12']], yt: [[10, '10'], [-10, '-10']], curves: [{ pts: snapPts }] });
  const hPts = [[-12, 0], [-9, 0], [-9, h], [-6, 0], [-3, -h], [0, 0], [3, h], [6, 0], [9, -h], [9, 0], [12, 0]];
  const hFig = () => PF.plot({ w: 380, h: 220, x: [-12.5, 12.5], y: [-0.034, 0.034], zero: true, xl: 'z\\,(\\text{m})', yl: 'H_y\\,(\\text{A/m})',
    xt: [[-9, '-9'], [-6, '-6'], [-3, '-3'], [3, '3'], [6, '6'], [9, '9']], yt: [[h, '\\tfrac{1}{12\\pi}'], [-h, '-\\tfrac{1}{12\\pi}']], curves: [{ pts: hPts }] });
  const ePts = [[0, 0], [40, 0], [40, -10], [50, 0], [60, 10], [70, 0]];
  const eFig = () => PF.plot({ w: 360, h: 210, x: [0, 82], y: [-12, 12], zero: true, xl: 't\\,(\\text{ns})', yl: 'E_x\\,(\\text{V/m})',
    xt: [[20, '20'], [40, '40'], [50, '50'], [60, '60'], [70, '70']], yt: [[10, '10'], [-10, '-10']], curves: [{ pts: ePts }] });

  // ---------------------------------------------------------------- the paper
  const VS = { n: [5, 50], I0: [0.5, 3], L: [0.5, 3], mu0: [0.5, 2], chim: [0.1, 5], r: [0.2, 1], omega: [1, 10] };
  const pick = (...k) => Object.fromEntries(k.map((x) => [x, VS[x]]));
  const f25 = [
    R(md`
      **Fall 2025 · ECE 329 · Exam 2** (Chen, Mitchell, Shao). Monday, October 20, 2025, 7:00–8:15 PM (75 minutes). Four problems, 100 points. Closed book and closed notes; no calculators; **one 4″×6″ index card of handwritten notes**. Show your work and reasoning; units on every answer.

      This is the most recent Exam 2 and has the same format as the Fall 2026 Exam 1, so it is the best guide to what you will see. There is no official key: every answer was derived here and checked. (The cover's point table, 25/30/15/30, does not match the problem pages, 30/15/30/25; the cards use the pages.)

      **What it tests.** Magnetic materials in a solenoid: $\mathbf H$, $\mathbf B$, $\mathbf M$ ([Topic 13](#/l/t13-materials)); emf of a coil with a changing current ([Topic 8](#/l/t8-faraday)); inductance ([Topic 11](#/l/t11-inductance)); displacement current ([Topic 12](#/l/t12-displacement)); reading and sketching sheet-launched waves ([Topic 15](#/l/t15-sheet-waves), [Topic 14](#/l/t14-wave-eq)); Ampère–Maxwell in a charging capacitor ([Topic 12](#/l/t12-displacement)).

      **How to use it.** Set a 75-minute timer and work on paper. Then enter your answers. Symbolic boxes take expressions: type <code>mu0*I0/(2*pi*r)</code>, <code>exp(-t/tau)</code>, <code>cos(omega*t)</code>; the variables you may use are listed under each box.
    `),

    R(md`
      ### Problem 1 (30 points): a solenoid with a magnetic core

      A long solenoid of length $L$ and radius $r$ has $n$ tightly wound turns ($n$ is a number, not turns per meter) on a core of magnetic material with susceptibility $\chi_m$. An AC source drives the current
      $$I(t) = I_0\left[\sin(\omega t) + 1\right]$$
    `),
    P({ src: 'Fall 2025 #1(a) · 10 pts', title: 'H, B and M at maximum current',
      q: md`[[fig:s]]

At the instant the current is at its maximum, find the magnitudes and directions of $\mathbf H$, $\mathbf B$ and $\mathbf M$ inside the solenoid, with units.`,
      figs: { s: { svg: solenoidFig(), cap: 'The lead leaves the top turn on the right: the current circulates counterclockwise seen from above.' } },
      parts: [
        X(md`$|\mathbf H|$ in A/m (use n, I0, L)`, '2*n*I0/L', pick('n', 'I0', 'L')),
        X(md`$|\mathbf B|$ in T (use mu0, chim, n, I0, L)`, '2*mu0*(1+chim)*n*I0/L', pick('mu0', 'chim', 'n', 'I0', 'L')),
        X(md`$|\mathbf M|$ in A/m for $\chi_m > 0$ (use chim, n, I0, L)`, '2*chim*n*I0/L', pick('chim', 'n', 'I0', 'L')),
        CH('Directions', ['$\\mathbf H$ and $\\mathbf B$ along $+\\hat z$; $\\mathbf M$ along $+\\hat z$ if $\\chi_m > 0$ (along $-\\hat z$ if $\\chi_m < 0$)', 'all three along $+\\hat\\phi$, with the current', '$\\mathbf H$ along $+\\hat z$, $\\mathbf B$ and $\\mathbf M$ along $-\\hat z$', 'all three along $-\\hat z$'], 0,
          [null, 'The current circulates along $\\hat\\phi$; the field it makes inside a solenoid points along the axis (RHR: fingers with the current, thumb along $\\mathbf H$).', '$\\mathbf B = \\mu\\mathbf H$ with $\\mu > 0$, so $\\mathbf B$ is always along $\\mathbf H$. $\\mathbf M = \\chi_m\\mathbf H$ is along $\\mathbf H$ when $\\chi_m > 0$.', 'Counterclockwise from above, the RHR gives $+\\hat z$.']),
      ],
      hints: ['$I_{\\max} = 2I_0$ (when $\\sin\\omega t = 1$).', 'Ampère around a rectangle half inside: $H = (\\text{turns per meter})\\,I = \\dfrac nL I$. Then $\\mathbf B = \\mu_0(1 + \\chi_m)\\mathbf H$ and $\\mathbf M = \\chi_m\\mathbf H$.'],
      sol: md`**Governing laws.** Ampère's law around a rectangle with one side inside the long solenoid (free current only, so it gives $\mathbf H$ regardless of the core): $H = \dfrac{n}{L}I$. Then $\mathbf B = \mu\mathbf H = \mu_0(1 + \chi_m)\mathbf H$ and $\mathbf M = \chi_m\mathbf H$.

**Maximum current.** $\sin\omega t = 1$, so $I_{\max} = 2I_0$.
$$\mathbf H = \frac{2nI_0}{L}\hat z\ \text{A/m}, \qquad \mathbf B = \frac{2\mu_0(1 + \chi_m)nI_0}{L}\hat z\ \text{T}, \qquad \mathbf M = \frac{2\chi_mnI_0}{L}\hat z\ \text{A/m}$$

**Direction.** The current circulates counterclockwise seen from above (the lead in the figure), so the RHR puts $\mathbf H$ along $+\hat z$. $\mathbf B$ is always along $\mathbf H$; $\mathbf M$ is along $\mathbf H$ for a paramagnetic or ferromagnetic core ($\chi_m > 0$) and against it for a diamagnetic one. Check: $\mathbf B = \mu_0(\mathbf H + \mathbf M)$ ✓.

The common slip is $n$ used as turns per meter: here $n$ is the total count, so the density is $n/L$.` }),
    P({ src: 'Fall 2025 #1(b) · 10 pts', title: 'Maximum induced emf',
      q: md`Calculate the maximum induced emf $\emf$ in the solenoid's $n$ turns due to the time-varying current. Include units and direction.`,
      parts: [
        X(md`$|\emf|_{\max}$ in V (use mu0, chim, n, r, I0, omega, L)`, 'mu0*(1+chim)*n^2*pi*r^2*I0*omega/L', pick('mu0', 'chim', 'n', 'r', 'I0', 'omega', 'L')),
        CH('It is reached when', ['$\\omega t = 0, 2\\pi, \\ldots$ (current rising fastest) and $\\omega t = \\pi, 3\\pi, \\ldots$ (falling fastest)', 'the current is at its maximum, $2I_0$', 'the current is zero', 'only at $t = 0$'], 0,
          [null, 'At the maximum $dI/dt = 0$, so the emf is zero there.', 'At $I = 0$ ($\\omega t = 3\\pi/2$) the slope is also zero.', 'The slope $I_0\\omega\\cos\\omega t$ has its largest size at every $\\omega t = k\\pi$.']),
        CH('Direction at $t = 0$, relative to the current', ['against the current (a back emf), since the current is growing', 'along the current', 'along $+\\hat z$', 'no direction: an emf is a scalar'], 0,
          [null, 'Along the current would speed up the growth of the flux: Lenz forbids it.', 'The emf acts around the windings, along $\\pm\\hat\\phi$, not along the axis.', 'An emf has a sense around its path; the question asks for it.']),
      ],
      hints: ['Flux through one turn: $\\Psi_1 = B\\pi r^2 = \\mu_0(1 + \\chi_m)\\dfrac nL I(t)\\,\\pi r^2$.', '$\\emf = -n\\,d\\Psi_1/dt$: one factor of $n$ from the field, one from the turns.'],
      sol: md`**Governing law.** Faraday for $n$ turns: $\emf = -n\dfrac{d\Psi_1}{dt}$, with $\Psi_1$ the flux through one turn (path along the current, $d\mathbf S = +\hat z$).

**Flux.** $\Psi_1 = \mu_0(1 + \chi_m)\dfrac{n}{L}I(t)\,\pi r^2$.

**Emf.**
$$\emf(t) = -n\frac{d\Psi_1}{dt} = -\frac{\mu_0(1 + \chi_m)n^2\pi r^2}{L}I_0\omega\cos(\omega t)$$
$$|\emf|_{\max} = \frac{\mu_0(1 + \chi_m)n^2\pi r^2I_0\omega}{L}\ \text{V}$$
reached at $\omega t = 0, \pi, 2\pi, \ldots$, where the current changes fastest (not where it peaks).

**Direction.** At $\omega t = 0$ the current grows, so $\emf < 0$ along the current: the emf opposes it ($-\hat\phi$ for a current along $+\hat\phi$). At $\omega t = \pi$ the current falls and the emf pushes along it. This is the back emf $L_{\text{ind}}\,dI/dt$ of part (c).

**Common slip:** one factor of $n$ instead of two. One $n$ is in the field ($n/L$ turns per meter); the other counts the turns, each of which links the flux.` }),
    P({ src: 'Fall 2025 #1(c) · 10 pts', title: 'Inductance',
      q: md`Find the inductance of the solenoid. (The paper uses $L$ for both the length and the inductance; the length is $L$ here.)`,
      parts: [X(md`inductance in H (use mu0, chim, n, r, L for the length)`, 'mu0*(1+chim)*n^2*pi*r^2/L', pick('mu0', 'chim', 'n', 'r', 'L'))],
      hints: ['Inductance is flux linkage per ampere: $L_{\\text{ind}} = \\Lambda/I = n\\Psi_1/I$.'],
      sol: md`**Governing definition.** Inductance = flux linkage per ampere: $L_{\text{ind}} = \dfrac{n\Psi_1}{I}$.
$$L_{\text{ind}} = \frac{n}{I}\,\mu_0(1 + \chi_m)\frac{n}{L}I\,\pi r^2 = \frac{\mu_0(1 + \chi_m)n^2\pi r^2}{L}\ \text{H}$$
**Checks.** It does not depend on $I$ (geometry and material only); $\propto n^2$; the core multiplies it by $\mu_r = 1 + \chi_m$. And $|\emf|_{\max} = L_{\text{ind}}\,|dI/dt|_{\max} = L_{\text{ind}}I_0\omega$, matching part (b) ✓.` }),

    R(md`
      ### Problem 2 (15 points): displacement current
    `),
    P({ src: 'Fall 2025 #2 · 15 pts', title: 'Displacement current in a capacitor',
      q: md`A parallel-plate capacitor has plate area $A$, separation $d$ and permittivity $\epsilon$. It is connected to an AC source $V(t) = V_0\left[\sin(\omega t) + 1\right]$. Ignoring fringing, what is the displacement current inside the capacitor?

[[fig:c]]`,
      figs: { c: { svg: capFig(), cap: 'Sketch added here; the paper has no figure.' } },
      parts: [X(md`$I_d$ in A (use eps, A, V0, omega, d, t)`, 'eps*A*V0*omega*cos(omega*t)/d', { eps: [0.5, 2], A: [0.5, 2], V0: [1, 5], omega: [1, 5], d: [0.2, 1], t: [0, 2] })],
      hints: ['$E = V(t)/d$ between the plates, $D = \\epsilon E$.', '$I_d = \\dfrac{d}{dt}\\int\\mathbf D\\cdot d\\mathbf S = A\\,\\dfrac{dD}{dt}$.'],
      sol: md`**Governing law.** $I_d = \dfrac{d}{dt}\displaystyle\int_S\mathbf D\cdot d\mathbf S$ over the plate area (Lecture 13).

**Field.** $E = V(t)/d$ from the high plate to the low one, $D = \epsilon V(t)/d$, uniform over $A$.
$$I_d = A\frac{dD}{dt} = \frac{\epsilon A}{d}\frac{dV}{dt} = \frac{\epsilon AV_0\omega}{d}\cos(\omega t)\ \text{A}$$
**Check.** $\epsilon A/d = C$, so $I_d = C\,dV/dt$: exactly the current in the wires. The constant part $V_0$ of the source gives no displacement current. The density is $J_d = \dfrac{\epsilon V_0\omega}{d}\cos\omega t$ A/m², along $\mathbf E$ when $V$ grows.` }),

    R(md`
      ### Problem 3 (30 points): a sheet-launched wave

      An infinite current sheet $\mathbf J_s$ on $z = 0$ launches waves into free space toward $+\hat z$ and $-\hat z$, with $\eta_0 = 120\pi\ \Omega$ and $c = 3\times10^8$ m/s. The electric field of the wave traveling toward $+\hat z$ is given as a snapshot at $t = 40$ ns.
    `),
    P({ src: 'Fall 2025 #3(a) · 15 pts', title: 'Sketch H(z) at t = 40 ns',
      q: md`[[fig:snap]]

The snapshot above is $E_x(z)$ of the $+\hat z$ wave at $t = 40$ ns: zero at $z = 0$, $10$ V/m at $z = 3$ m, zero at $6$ m, $-10$ V/m at $9$ m, then zero beyond the front at $z = 9$ m.

Sketch the magnetic field at $t = 40$ ns as a function of $z$, on **both** sides of the sheet. Label the component of $\mathbf H$, its unit, and numbers on both axes. Then read these values off your sketch.`,
      parts: [
        CH('Component of $\\mathbf H$', ['$H_y$', '$H_x$', '$H_z$'], 0,
          [null, '$\\mathbf H$ is perpendicular to $\\mathbf E$ in a plane wave; $\\mathbf E$ is along $x$.', 'A plane wave has no field along its direction of travel.']),
        N('H_y\\ \\text{at}\\ z = 3\\ \\text{m}', h, 'A/m'),
        N('H_y\\ \\text{at}\\ z = -3\\ \\text{m}', -h, 'A/m'),
        N('H_y\\ \\text{at}\\ z = -8\\ \\text{m}', (20 / 3) / ETA, 'A/m'),
      ],
      hints: ['For $z > 0$: $\\mathbf E\\times\\mathbf H$ must point along $+\\hat z$, so $H_y = +E_x/\\eta_0$.', 'The sheet makes the same $\\mathbf E$ at $\\pm z$ (mirror image), but on the $-z$ side the wave travels toward $-\\hat z$: $H_y = -E_x/\\eta_0$ there.'],
      sol: md`**Governing relations.** In a plane wave $|\mathbf E| = \eta_0|\mathbf H|$, and $\mathbf E\times\mathbf H$ points along the travel. The sheet makes $\mathbf E = -\tfrac{\eta_0}{2}\mathbf J_s(t - |z|/c)$ on both sides, so $E_x(-z, t) = E_x(z, t)$.

**$z > 0$** (travel $+\hat z$): $\hat x\times\hat y = \hat z$, so $H_y = +E_x/\eta_0$. Peaks: $10/(120\pi) = \tfrac{1}{12\pi} = 0.0265$ A/m.

**$z < 0$** (travel $-\hat z$): $\hat x\times(-\hat y) = -\hat z$, so $H_y = -E_x(|z|)/\eta_0$. The sketch is the mirror image **flipped in sign**: $H_y$ is odd in $z$.

[[fig:h]]

**Values.** $H_y(3) = \tfrac{1}{12\pi} = 0.0265$ A/m; $H_y(-3) = -0.0265$ A/m; at $z = -8$ m, $E_x(8) = -\tfrac{20}{3}$ V/m, so $H_y(-8) = +\dfrac{20/3}{120\pi} = 0.0177$ A/m. The fronts are at $z = \pm9$ m ($c\times30$ ns: the sheet switched on at $t = 10$ ns).

**Common slips:** letting $H_y$ ramp to 0 at $z = 9$ m instead of jumping from $-\tfrac{1}{12\pi}$ to 0; giving the $z < 0$ side the same sign as $z > 0$; leaving the peaks as $10/\eta_0$ without the number.`,
      figs: { snap: { svg: snapFig(), cap: 'E_x of the +z wave at t = 40 ns. The front (the jump) is at z = 9 m.' }, h: { svg: hFig(), cap: 'H_y(z) at t = 40 ns: E_x/η₀ for z > 0; its mirror image, flipped in sign, for z < 0. Fronts at ±9 m.' } } }),
    P({ src: 'Fall 2025 #3(b) · 15 pts', title: 'Sketch E(t) at z = 9 m',
      q: md`Sketch the electric field as a function of time at $z = 9$ m. Label its component, its unit and numbers on both axes. Then read these values off your sketch.`,
      parts: [
        CH('Component of $\\mathbf E$', ['$E_x$', '$E_y$', '$E_z$'], 0, [null, 'The wave\'s $\\mathbf E$ is along $x$ everywhere.', 'No field along the direction of travel.']),
        N('\\text{the front arrives at}\\ t', 40, 'ns'),
        N('E_x\\ \\text{at}\\ t = 45\\ \\text{ns}', -5, 'V/m'),
        N('E_x\\ \\text{at}\\ t = 60\\ \\text{ns}', 10, 'V/m'),
      ],
      hints: ['$E_x(9\\ \\text{m}, t) = E_x(0, t - 30\\ \\text{ns})$: 9 m takes 30 ns at $c$.', 'Read the source history off the snapshot: the field at $z$ (at $t = 40$ ns) left the sheet at $t = 40\\ \\text{ns} - z/c$. The front at $z = 9$ m left at 10 ns.'],
      sol: md`**Governing relation.** $E_x(z, t) = E_x(0, t - z/c)$ for $z > 0$, and from the snapshot $E_x(0, t') = E_x\big(z = c(40\ \text{ns} - t'),\ 40\ \text{ns}\big)$.

**Source history.** $z = 9, 6, 3, 0$ m at 40 ns left the sheet at $t' = 10, 20, 30, 40$ ns. So $E_x(0, t')$: 0 before 10 ns, a jump to $-10$ V/m at 10 ns, a ramp up through 0 at 20 ns to $+10$ at 30 ns, down to 0 at 40 ns.

**At $z = 9$ m**, delayed by $9/(0.3\ \text{m/ns}) = 30$ ns: 0 before 40 ns, a jump to $-10$ V/m at 40 ns, 0 at 50 ns, $+10$ at 60 ns, 0 at 70 ns. The snapshot does not tell what the sheet did after 40 ns, so the trace is determined only up to 70 ns.

[[fig:e]]

$E_x(45\ \text{ns}) = -5$ V/m (halfway up the first ramp), $E_x(60\ \text{ns}) = +10$ V/m. **In time, the order is reversed** compared with the snapshot in $z$: the front, which is farthest out in $z$, arrives first.`,
      figs: { e: { svg: eFig(), cap: 'E_x(t) at z = 9 m: the snapshot read from z = 9 m back to z = 0, 3 m per 10 ns.' } } }),

    R(md`
      ### Problem 4 (25 points): a charging capacitor

      A capacitor is made of two parallel circular plates of radius $R$, a distance $d$ apart along $z$, with air between them. It has no charge before $t = 0$. From $t = 0$ it charges so that the field between the plates is
      $$\mathbf E = \frac{E_0}{d}\left(1 - e^{-t/\tau}\right)\hat z\ \ \text{V/m}$$
      Ignore fringing.
    `),
    P({ src: 'Fall 2025 #4(a) · 8 pts', title: 'The relevant Maxwell equation',
      q: md`[[fig:p]]

For the region between the plates, $0 < z < d$, write the **one** integral form of Maxwell's equations needed to find the magnetic field. (Writing all of Maxwell's equations receives 0 points.)`,
      figs: { p: { svg: platesFig(), cap: 'Sketch added here (the paper has no figure): E along +z between the plates; the dashed circle of radius r is used in (c).' } },
      parts: [CH('', ['$\\oint_C\\mathbf H\\cdot d\\mathbf l = \\int_S\\mathbf J\\cdot d\\mathbf S + \\dfrac{d}{dt}\\int_S\\mathbf D\\cdot d\\mathbf S$','$\\oint_S\\mathbf D\\cdot d\\mathbf S = \\int_V\\rho\\,dV$', '$\\oint_C\\mathbf E\\cdot d\\mathbf l = -\\dfrac{d}{dt}\\int_S\\mathbf B\\cdot d\\mathbf S$', '$\\oint_C\\mathbf H\\cdot d\\mathbf l = \\int_S\\mathbf J\\cdot d\\mathbf S$'], 0,
        [null, 'Gauss gives $\\mathbf D$ from charge; the question is about $\\mathbf H$.', 'Faraday gives the circulation of $\\mathbf E$ from a changing $\\mathbf B$; here $\\mathbf E$ is known and $\\mathbf H$ is wanted.', 'Static Ampère gives zero between the plates, where no conduction current flows. The displacement term is the whole answer.'])],
      sol: md`$$\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S + \frac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$$
Between the plates $\mathbf J = 0$ (air), so the circulation of $\mathbf H$ equals the displacement current $d\Psi_e/dt$ through the disk bounded by $C$.` }),
    P({ src: 'Fall 2025 #4(b) · 8 pts', title: 'Electric flux',
      q: md`What is the electric flux $\Psi_e$ through the surface $z = z_0$ inside the capacitor (the whole plate area, $d\mathbf S = +\hat z\,dS$)?`,
      parts: [X(md`$\Psi_e$ in C (use eps0, E0, R, d, t, tau)`, 'eps0*E0*pi*R^2*(1-exp(-t/tau))/d', { eps0: [0.5, 2], E0: [1, 5], R: [0.5, 2], d: [0.2, 1], t: [0.1, 3], tau: [0.5, 2] })],
      hints: ['The course defines $\\Psi_e = \\int\\mathbf D\\cdot d\\mathbf S$ (Lecture 13): coulombs.', '$\\mathbf D = \\epsilon_0\\mathbf E$, uniform over the area $\\pi R^2$.'],
      sol: md`**Definition** (Lecture 13): $\Psi_e = \displaystyle\int_S\mathbf D\cdot d\mathbf S$, in coulombs.
$$\Psi_e = \epsilon_0\frac{E_0}{d}\left(1 - e^{-t/\tau}\right)\pi R^2\ \ \text{C}$$
The same at every $z_0$ between the plates (no fringing). It equals the charge on the bottom plate, by Gauss's law.

**Common slip:** integrating $\mathbf E$ instead of $\mathbf D$ (an answer in V·m, missing $\epsilon_0$). In this course electric flux is the flux of $\mathbf D$.` }),
    P({ src: 'Fall 2025 #4(c) · 9 pts', title: 'H between the plates',
      q: md`Find the magnetic field $\mathbf H$ inside the capacitor ($r < R$) as a function of time.`,
      parts: [
        X(md`$H_\phi$ in A/m (use eps0, E0, r, d, tau, t)`, 'eps0*E0*r*exp(-t/tau)/(2*d*tau)', { eps0: [0.5, 2], E0: [1, 5], r: [0.2, 1], d: [0.2, 1], tau: [0.5, 2], t: [0.1, 3] }),
        CH('Direction', ['$+\\hat\\phi$ (counterclockwise seen from $+z$)', '$-\\hat\\phi$', '$+\\hat z$, along $\\mathbf E$', '$\\hat r$, outward'], 0,
          [null, 'That would be the field of a decreasing $\\mathbf E$ (or of a current along $-\\hat z$).', '$\\mathbf H$ circles the changing flux; it is not parallel to $\\mathbf E$.', 'A radial $\\mathbf H$ would have flux out of a cylinder around the axis, violating $\\nabla\\cdot\\mathbf B = 0$.']),
      ],
      hints: ['Symmetry: $\\mathbf H = H_\\phi(r)\\hat\\phi$. Use a circle of radius $r < R$.', '$H_\\phi\\,2\\pi r = \\dfrac{d}{dt}\\left[\\epsilon_0E(t)\\,\\pi r^2\\right]$: only the flux inside radius $r$ counts.'],
      sol: md`**Governing law.** Ampère–Maxwell on a circle of radius $r < R$, counterclockwise from $+z$ ($d\mathbf S = +\hat z$); by symmetry $\mathbf H = H_\phi(r, t)\hat\phi$.
$$H_\phi\,2\pi r = \frac{d}{dt}\left[\epsilon_0E(t)\,\pi r^2\right] = \epsilon_0\pi r^2\frac{E_0}{d\tau}e^{-t/\tau}$$
$$\mathbf H = \frac{\epsilon_0E_0\,r}{2d\tau}e^{-t/\tau}\,\hat\phi\ \ \text{A/m}\qquad (r < R,\ t > 0)$$
**Direction.** $\mathbf E$ along $+\hat z$ is growing, so the displacement current is along $+\hat z$ and $\mathbf H$ circles it counterclockwise from above (RHR).

**Checks.** Zero on the axis, growing linearly with $r$; largest at $t = 0^+$ and dying as the capacitor finishes charging. Outside the plates ($r > R$) only the flux inside $R$ counts: $H_\phi = \dfrac{\epsilon_0E_0R^2}{2d\tau r}e^{-t/\tau}$, the field of the wire current $I = d\Psi_e/dt$.

**Common slip:** using the full plate area $\pi R^2$ for every $r$ and dropping the $2\pi r$: that answer is a current (A), not a field (A/m).` }),
  ];

  EM.lesson('e2-past', { id: 'past-f25', title: 'Fall 2025 Exam 2', kind: 'exam', sub: '75 min · 100 pts · the most recent Exam 2', steps: f25 });
})();
